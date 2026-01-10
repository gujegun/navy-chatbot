import json
import os
import re

BASE_DIR = os.path.dirname(__file__)

def load_cohort(cohort: str):
    path = os.path.join(BASE_DIR, "data", "cohorts", f"{cohort}.json")
    if not os.path.exists(path):
        # 기본값(파일이 없을 때)
        path = os.path.join(BASE_DIR, "data", "cohorts", "720.json")

    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def _normalize(text: str) -> str:
    # 공백/대소문자 차이 흡수
    return re.sub(r"\s+", "", (text or "").strip().lower())

def find_answer(message: str, cohort_data: dict) -> str:
    msg_raw = message or ""
    msg = _normalize(msg_raw)

    # 개인정보 방지
    for bad in ["주민번호", "계좌", "비밀번호", "인증번호", "주소"]:
        if bad in msg:
            return "개인정보는 입력하지 마세요. 공식 공지(밴드/중대장실)를 통해 확인 바랍니다."

    # FAQ 매칭 (q가 문자열 또는 리스트 모두 지원)
    for faq in cohort_data.get("faq", []):
        q = faq.get("q", [])
        a = faq.get("a", "")

        # q가 문자열이면 리스트로 통일
        if isinstance(q, str):
            q_list = [q]
        else:
            q_list = q  # 리스트라고 가정

        for qtext in q_list:
            # 1) 완전 일치(공백/대소문자 무시) 우선
            if _normalize(qtext) == msg:
                return a

            # 2) 부분 포함 매칭(정규식 오작동 방지 위해 escape)
            #    예: "입영" 같은 단어로도 어느 정도 잡히게
            safe = re.escape(str(qtext))
            if re.search(safe, msg_raw, re.IGNORECASE):
                return a

    # fallback이 없을 때도 안전하게
    return cohort_data.get("fallback", "죄송해요. 해당 질문은 아직 준비 중이에요.")
