import os
import json
from datetime import datetime

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# ✅ 중요: server 폴더 안의 chatbot.py를 정확히 가리킴
from server.chatbot import load_cohort, find_answer

app = FastAPI()

# (필요하면 CORS 유지 - 배포/로컬 모두 무난)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ web 폴더를 서버가 같이 제공하도록 설정
BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # navy-chatbot 폴더
WEB_DIR = os.path.join(BASE_DIR, "web")

app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")


@app.get("/")
def home(cohort: str = "722"):
    # index.html을 열어주고, cohort는 URL 쿼리로 받음 (?cohort=722)
    return FileResponse(os.path.join(WEB_DIR, "index.html"))


class ChatRequest(BaseModel):
    message: str
    cohort: str = "722"


@app.get("/api/cohort/{cohort}")
def get_cohort(cohort: str):
    data = load_cohort(cohort)
    return {
        "cohort": data.get("cohort"),
        "unit": data.get("unit"),
        "enlist_date": data.get("enlist_date"),
        "phone": data.get("contact_phone"),
    }


def log_question(cohort: str, message: str):
    # server 폴더에 chat_logs.txt 기록
    log_path = os.path.join(os.path.dirname(__file__), "chat_logs.txt")
    with open(log_path, "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now().isoformat(timespec='seconds')}] [{cohort}] {message}\n")


@app.post("/api/chat")
def chat(req: ChatRequest):
    data = load_cohort(req.cohort)
    reply = find_answer(req.message, data)
    log_question(req.cohort, req.message)
    return {"reply": reply}
