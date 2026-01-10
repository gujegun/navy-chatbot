import json
import os
import re

BASE_DIR = os.path.dirname(__file__)

def load_cohort(cohort: str):
    path = os.path.join(BASE_DIR, "data", "cohorts", f"{cohort}.json")
    if not os.path.exists(path):
        path = os.path.join(BASE_DIR, "data", "cohorts", "720.json")

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def find_answer(message: str, cohort_data: dict) -> str:
    msg = message.lower()

    # 개인정보 방지
    for bad in ["주민번호", "계좌", "비밀번호", "인증번호", "주소"]:
        if bad in msg:
            return "개인정보는 입력하지 마세요. 공식 공지(밴드/중대장실)를 통해 확인 바랍니다."

    # FAQ 매칭
    for faq in cohort_data["faq"]:
        pattern = re.compile(faq["q"], re.IGNORECASE)
        if pattern.search(message):
            return faq["a"]

    return cohort_data["fallback"]
