import os
from datetime import datetime
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from chatbot import load_cohort, find_answer

app = FastAPI()

BASE_DIR = os.path.dirname(__file__)
WEB_DIR = os.path.join(os.path.dirname(BASE_DIR), "web")  # 프로젝트루트/web
# (프로젝트 구조가 navy-chatbot/web, navy-chatbot/server 라는 전제)

# 정적 파일: /static/app.js 로 접근 가능
app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")

# CORS (필요하면 유지)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    cohort: str = "722"

@app.get("/")
def home():
    # 루트 접속 시 웹 화면 보여주기
    return FileResponse(os.path.join(WEB_DIR, "index.html"))

@app.get("/api/cohort/{cohort}")
def get_cohort(cohort: str):
    data = load_cohort(cohort)
    return {
        "cohort": data.get("cohort", cohort),
        "unit": data.get("unit", ""),
        "enlist_date": data.get("enlist_date", ""),
        "contact_phone": data.get("contact_phone", ""),
        "notice": data.get("notice", ""),
    }

@app.post("/api/chat")
def chat(req: ChatRequest):
    data = load_cohort(req.cohort)
    reply = find_answer(req.message, data)
    log_chat(req.cohort, req.message)
    return {"reply": reply}

def log_chat(cohort: str, message: str):
    # server 폴더에 로그 남김
    path = os.path.join(BASE_DIR, "chat_logs.txt")
    with open(path, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now().isoformat(sep=' ', timespec='seconds')}] [{cohort}] {message}\n")
