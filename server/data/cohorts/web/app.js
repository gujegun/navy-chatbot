const chat = document.getElementById("chat");
const msgInput = document.getElementById("msg");
const sendBtn = document.getElementById("sendBtn");
const faqBox = document.getElementById("faq");
const categoryTabs = document.getElementById("categoryTabs");
const noticeBar = document.getElementById("noticeBar");
const metaText = document.getElementById("metaText");

const params = new URLSearchParams(location.search);
const cohort = params.get("cohort") || "724";

let fullFaq = [];
let currentCategory = "전체";

const categoryMap = {
  "전체": [],
  "입영정보": [
    "입영일 언제야",
    "입영 시간 언제야",
    "입영 장소 어디야"
  ],
  "준비물": [
    "준비물 뭐 챙겨야 해",
    "운동화 어떤 거 신어",
    "가방 뭐 들고 가",
    "시계 가져가도 돼",
    "안경 써도 돼",
    "렌즈 착용 가능해",
    "약 가져가도 돼"
  ],
  "생활/훈련": [
    "훈련 기간 얼마나 돼",
    "훈련 많이 힘들어",
    "PX 언제 이용해",
    "외출 외박 언제 나와",
    "인터넷 사용할 수 있어"
  ],
  "가족문의": [
    "부모님 면회 언제 가능해",
    "수료식 언제야",
    "부모님 연락 언제 해",
    "긴급 연락은 어떻게 해"
  ]
};

function addBubble(text, who) {
  const row = document.createElement("div");
  row.className = "msg-row " + (who === "me" ? "me" : "bot");

  const bubble = document.createElement("div");
  bubble.className = "bubble " + (who === "me" ? "me" : "bot");
  bubble.innerText = text;

  row.appendChild(bubble);
  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function renderCategories() {
  categoryTabs.innerHTML = "";

  Object.keys(categoryMap).forEach((cat) => {
    const btn = document.createElement("button");
    btn.className = "tab-btn" + (cat === currentCategory ? " active" : "");
    btn.innerText = cat;
    btn.onclick = () => {
      currentCategory = cat;
      renderCategories();
      renderFaqButtons();
    };
    categoryTabs.appendChild(btn);
  });
}

function renderFaqButtons() {
  faqBox.innerHTML = "";

  let questions = [];

  if (currentCategory === "전체") {
    questions = [
      "안심해! 든든해! 병영캠프",
      "입영 시간 언제야",
      "입영 장소 어디야",
      "준비물 뭐 챙겨야 해",
      "운동화 어떤 거 신어",
      "핸드폰 가져가도 돼",
      "시계 가져가도 돼",
      "약 가져가도 돼",
      "훈련 기간 얼마나 돼",
      "수료식 언제야",
      "부모님 연락 언제 해",
      "택배 받을 수 있어"
    ];
  } else {
    questions = categoryMap[currentCategory] || [];
  }

  questions.forEach((q) => {
    const btn = document.createElement("button");
    btn.className = "faq-btn";
    btn.type = "button";
    btn.innerText = q;
    btn.onclick = () => {
      msgInput.value = q;
      send();
    };
    faqBox.appendChild(btn);
  });
}

async function loadMeta() {
  try {
    const res = await fetch(`/api/cohort/${cohort}`);
    const data = await res.json();

    noticeBar.innerText = `공지 ${data.notice || "공지사항이 없습니다."}`;
    metaText.innerText = `${data.unit || ""} · ${data.cohort || cohort}기 · 입영일 ${data.enlist_date || ""} · 문의 ${data.contact_phone || ""}`;
  } catch (e) {
    noticeBar.innerText = "공지 안내 정보를 불러오지 못했습니다.";
    metaText.innerText = "기본 안내 화면입니다.";
  }
}

async function loadFaq() {
  try {
    const res = await fetch(`/api/cohort_full/${cohort}`);
    const data = await res.json();
    fullFaq = data.faq || [];
  } catch (e) {
    fullFaq = [];
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
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: text,
        cohort
      })
    });

    const data = await res.json();

    if (!res.ok) {
      addBubble("서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.", "bot");
      return;
    }

    addBubble(data.reply || "답변을 불러오지 못했습니다.", "bot");
  } catch (e) {
    addBubble("서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.", "bot");
  }
}

sendBtn.addEventListener("click", send);
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    send();
  }
});

async function init() {
  await loadMeta();
  await loadFaq();
  renderCategories();
  renderFaqButtons();
  addBubble("안녕하세요. 해군병 724기 안내 챗봇입니다. 위 질문 버튼을 누르거나 직접 질문해 주세요.", "bot");
}

init();