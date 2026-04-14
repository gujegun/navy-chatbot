import json
import os
import re

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def load_cohort(cohort: str):
    path = os.path.join(BASE_DIR, "data", "cohorts", f"{cohort}.json")

    # 없으면 724 → 722 순서로 fallback
    if not os.path.exists(path):
        fallback_724 = os.path.join(BASE_DIR, "data", "cohorts", "724.json")
        fallback_722 = os.path.join(BASE_DIR, "data", "cohorts", "722.json")

        if os.path.exists(fallback_724):
            path = fallback_724
        else:
            path = fallback_722

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def _normalize(text: str) -> str:
    return re.sub(r"\s+", "", (text or "").strip().lower())

def find_answer(message: str, cohort_data: dict) -> str:
    msg_raw = message or ""
    msg = _normalize(msg_raw)

    # 개인정보 입력 차단
    for bad in ["주민번호", "계좌", "비밀번호", "인증번호", "주소"]:
        if bad in msg:
            return "개인정보는 입력하지 마세요. 공식 공지(밴드/중대장실)를 통해 확인 바랍니다."

    for faq in cohort_data.get("faq", []):
        q = faq.get("q", [])
        a = faq.get("a", "")

        if isinstance(q, str):
            q_list = [q]
        else:
            q_list = q

        for qtext in q_list:
            q_norm = _normalize(str(qtext))

            # 1. 완전 일치
            if q_norm == msg:
                return a

            # 2. 질문 포함 관계
            if q_norm and (q_norm in msg or msg in q_norm):
                return a

            # 3. 원문 기준 부분 포함
            safe = re.escape(str(qtext))
            if re.search(safe, msg_raw, re.IGNORECASE):
                return a

    return cohort_data.get(
        "fallback",
        "죄송해요. 해당 질문은 아직 준비 중이에요. 다른 표현으로 다시 질문해 주세요."
    )