const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const btn = document.getElementById("sendBtn");

const params = new URLSearchParams(location.search);
const cohort = params.get("cohort") || "722";

// ✅ 자주 묻는 질문(FAQ) 버튼(원하는 만큼 추가 가능)
const faqButtons = [
  "입영일 언제야?",
  "입영식 일정 알려줘",
  "준비물 뭐 챙겨가?",
  "휴대폰 가져가도 돼?",
  "담배(전자담배) 가능해?",
  "택배 보내도 돼?",
  "반입금지 물품 뭐야?",
  "머리(이발) 기준이 뭐야?",
  "나라사랑카드/현금은?",
  "수료식/외박은 언제야?"
];

function add(text, who) {
  const p = document.createElement("p");
  p.className = "msg " + (who === "me" ? "me" : "bot");
  p.innerText = (who === "me" ? "🙋 " : "🪖 ") + text;
  chat.appendChild(p);
  chat.scrollTop = chat.scrollHeight;
}

function setNotice(text){
  const el = document.getElementById("noticeText");
  if (el) el.innerText = text;
}

// ✅ 공지 자동 구성: /api/cohort/{cohort}에서 입영일/연락처를 가져와 공지에 표시
async function loadNotice(){
  try{
    const res = await fetch(`/api/cohort/${cohort}`);
    if(!res.ok) throw new Error("cohort api error");
    const data = await res.json();
    // 예: 입영일 + 문의처를 공지로 보여주기
    const enlist = data.enlist_date || "미정";
    const phone = data.phone || "문의처 안내문 참고";
    const unit = data.unit || "해군 신병교육대대";
    setNotice(`${unit} ${cohort}기 안내입니다. 입영일: ${enlist} / 문의: ${phone}`);
  }catch(e){
    setNotice(`해군 ${cohort}기 안내입니다. (공지 로딩 실패 시 잠시 후 새로고침)`);
  }
}

// ✅ FAQ 버튼을 화면에 그리기
function renderFaq() {
  const box = document.getElementById("faq");
  if (!box) return;
  box.innerHTML = "";

  faqButtons.forEach((q) => {
    const b = document.createElement("button");
    b.className = "chip";
    b.type = "button";
    b.innerText = q;
    b.onclick = () => {
      msgInput.value = q;
      send();
    };
    box.appendChild(b);
  });
}

async function send() {
  const text = msgInput.value.trim();
  if (!text) return;

  msgInput.value = "";
  add(text, "me");

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, cohort }),
    });

    if (!res.ok) {
      add("서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.", "bot");
      return;
    }

    const data = await res.json();
    add(data.reply || "답변을 준비 중이에요.", "bot");
  } catch (e) {
    add("연결 오류가 발생했어요. 인터넷/서버 상태를 확인해 주세요.", "bot");
  }
}

// 버튼 클릭
btn.addEventListener("click", send);

// 엔터키로 전송
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") send();
});

// 시작 시 1회 실행
renderFaq();
loadNotice();
add(`${cohort}기 안내 챗봇입니다. 무엇을 도와드릴까요?`, "bot");
