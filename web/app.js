const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");
const faqBox = document.getElementById("faq");
const meta = document.getElementById("meta");
const noticeBar = document.getElementById("noticeBar");
const noticeSub = document.getElementById("noticeSub");

// cohort 파라미터
const params = new URLSearchParams(location.search);
const cohort = params.get("cohort") || "722";

// 자주 묻는 질문(버튼)
// 원하는 문장으로 마음껏 바꿔도 됨
const faqButtons = [
  "입영일 언제야",
  "입영 시간 언제야",
  "입영 장소 어디야",
  "준비물 뭐 챙겨야 해",
  "운동화 어떤 거 신어",
  "핸드폰 가져가도 돼",
  "시계 가져가도 돼",
  "약 가져가도 돼",
  "훈련 기간 얼마나 돼",
  "수료식 언제야"
];

function addBubble(text, who) {
  const row = document.createElement("div");
  row.className = "row " + (who === "me" ? "me" : "bot");

  const b = document.createElement("div");
  b.className = "bubble " + (who === "me" ? "me" : "bot");
  b.innerText = text;

  row.appendChild(b);
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function renderFaq() {
  faqBox.innerHTML = "";
  faqButtons.forEach(q => {
    const btn = document.createElement("button");
    btn.className = "faqBtn";
    btn.type = "button";
    btn.innerText = q;
    btn.onclick = () => {
      msgInput.value = q;
      send(); // 클릭하면 바로 질문 전송
    };
    faqBox.appendChild(btn);
  });
}

async function loadCohortMeta() {
  try {
    const res = await fetch(`/api/cohort/${cohort}`);
    const data = await res.json();

    meta.innerText = `${data.unit || ""} · ${data.cohort || cohort}기 · 입영일 ${data.enlist_date || ""} · 문의 ${data.contact_phone || ""}`;

    // 공지 상단 고정 표시
    noticeBar.firstChild.textContent = ""; // clear
    noticeBar.innerHTML = `<strong>공지</strong> ${data.notice || "공지 없음"}`;
    noticeSub.innerText = "※ 부대 상황에 따라 일부 변경될 수 있습니다.";
  } catch (e) {
    noticeBar.innerHTML = `<strong>공지</strong> 정보를 불러오지 못했습니다.`;
  }
}

async function send() {
  const text = (msgInput.value || "").trim();
  if (!text) return;

  msgInput.value = "";
  addBubble(text, "me");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, cohort })
    });

    const data = await res.json();
    if (!res.ok) {
      addBubble("서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.", "bot");
      return;
    }
    addBubble(data.reply || "답변을 준비 중이에요.", "bot");
  } catch (e) {
    addBubble("서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.", "bot");
  }
}

sendBtn.addEventListener("click", send);
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});

// 초기 실행
renderFaq();
loadCohortMeta();
addBubble("안녕하세요! 해군 722기 입영 안내 챗봇입니다. 자주 묻는 질문 버튼을 눌러도 되고, 직접 질문해도 돼요.", "bot");
