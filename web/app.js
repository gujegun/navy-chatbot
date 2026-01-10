const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const btn = document.getElementById("sendBtn");

const params = new URLSearchParams(location.search);
const cohort = params.get("cohort") || "722";
// ===== 자주 묻는 질문(FAQ) 버튼 =====
const faqButtons = [
  "입영일 언제야?",
  "입영식 일정 알려줘",
  "준비물 뭐 챙겨?",
  "운동화 어떤 거 신어?",
  "손목시계 가져가도 돼?",
  "휴대폰 사용 가능해?",
  "담배나 전자담배 돼?",
  "택배 보내도 돼?",
  "사기전화 조심하라고?",
  "수료식/외박은 언제야?"
];

function renderFaq() {
  const box = document.getElementById("faq");
  if (!box) return;

  box.innerHTML = "";
  faqButtons.forEach((text) => {
    const b = document.createElement("button");
    b.innerText = text;
    b.style.padding = "8px 12px";
    b.style.border = "1px solid #ccc";
    b.style.borderRadius = "10px";
    b.style.cursor = "pointer";
    b.style.fontSize = "14px";

    b.onclick = () => {
      msgInput.value = text; // 질문 자동 입력
      send();               // 바로 전송
    };

    box.appendChild(b);
  });
}

// 페이지 열리면 FAQ 버튼 생성
window.addEventListener("DOMContentLoaded", renderFaq);
// ===== FAQ 버튼 끝 =====

function add(text, who) {
  const p = document.createElement("p");
  p.innerText = (who === "me" ? "🙋 " : "🤖 ") + text;
  chat.appendChild(p);
  chat.scrollTop = chat.scrollHeight;
}

async function send() {
  const text = msgInput.value.trim();
  if (!text) return;

  msgInput.value = "";
  add(text, "me");

  try {
    const res = await fetch("/api/chat", {          // ✅ 여기 중요: 127.0.0.1 없음!
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, cohort })
    });

    if (!res.ok) {
      add(`서버 오류(HTTP ${res.status})가 발생했어요.`, "bot");
      return;
    }

    const data = await res.json();
    add(data.reply || "(응답이 비어 있어요)", "bot");
  } catch (e) {
    add("서버에 연결할 수 없어요. (배포/서버 상태 확인 필요)", "bot");
  }
}

btn.addEventListener("click", send);
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});
