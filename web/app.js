const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const btn = document.getElementById("sendBtn");

const params = new URLSearchParams(location.search);
const cohort = params.get("cohort") || "722";

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
