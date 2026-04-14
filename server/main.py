import os
from datetime import datetime
from collections import Counter

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Render/로컬 둘 다 안전하게 import
try:
    from chatbot import load_cohort, find_answer
except ModuleNotFoundError:
    from server.chatbot import load_cohort, find_answer

app = FastAPI()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(BASE_DIR)
WEB_DIR = os.path.join(PROJECT_DIR, "web")

app.mount("/static", StaticFiles(directory=WEB_DIR), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    cohort: str = "724"

@app.get("/")
def home():
    return FileResponse(os.path.join(WEB_DIR, "index.html"))

@app.get("/admin")
def admin():
    return FileResponse(os.path.join(WEB_DIR, "admin.html"))

@app.get("/api/cohort/{cohort}")
def get_cohort(cohort: str):
    data = load_cohort(cohort)
    return {
        "cohort": data.get("cohort", cohort),
        "unit": data.get("unit", ""),
        "enlist_date": data.get("enlist_date", ""),
        "contact_phone": data.get("contact_phone", ""),
        "notice": data.get("notice", "")
    }

@app.get("/api/cohort_full/{cohort}")
def get_cohort_full(cohort: str):
    return load_cohort(cohort)

@app.post("/api/chat")
def chat(req: ChatRequest):
    data = load_cohort(req.cohort)
    reply = find_answer(req.message, data)
    log_chat(req.cohort, req.message)
    return {"reply": reply}

@app.get("/api/stats/{cohort}")
def stats(cohort: str):
    path = os.path.join(BASE_DIR, "chat_logs.txt")

    if not os.path.exists(path):
        return {"top_questions": []}

    questions = []

    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            if f"[{cohort}]" in line:
                parts = line.strip().split("] ")
                if len(parts) >= 2:
                    questions.append(parts[-1])

    counter = Counter(questions)
    return {"top_questions": counter.most_common(20)}

def log_chat(cohort: str, message: str):
    path = os.path.join(BASE_DIR, "chat_logs.txt")
    with open(path, "a", encoding="utf-8") as f:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        f.write(f"[{now}] [{cohort}] {message}\n")