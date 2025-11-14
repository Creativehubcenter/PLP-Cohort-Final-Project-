// ====== DOM ======
const moodButtons = document.querySelectorAll(".mood");
const chatbox = document.getElementById("chatbox");
const chatlog = document.getElementById("chatlog");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const journalSection = document.getElementById("journalSection");
const saveJournal = document.getElementById("saveJournal");
const journalEntry = document.getElementById("journalEntry");
const viewJournal = document.getElementById("viewJournal");
const affirmationEl = document.getElementById("affirmation");
const streakEl = document.getElementById("streak");
const moodStatsEl = document.getElementById("moodStats");
const typingIndicator = document.getElementById("typingIndicator");
const controls = document.getElementById("controls");
const btnBreath = document.getElementById("btnBreath");
const btnMind = document.getElementById("btnMind");
const btnHistory = document.getElementById("btnHistory");
const btnFeedback = document.getElementById("btnFeedback");

const breathModal = document.getElementById("breathModal");
const startBreath = document.getElementById("startBreath");
const breathCircle = document.getElementById("breathCircle");
const breathText = document.getElementById("breathText");

const mindModal = document.getElementById("mindModal");
const startMind = document.getElementById("startMind");
const mindInstruction = document.getElementById("mindInstruction");
const mindTimer = document.getElementById("mindTimer");

const summaryModal = document.getElementById("summaryModal");
const summaryContent = document.getElementById("summaryContent");

const journalModal = document.getElementById("journalModal");
const journalList = document.getElementById("journalList");
const clearJournal = document.getElementById("clearJournal");

const feedbackModal = document.getElementById("feedbackModal");
const starRow = document.getElementById("starRow");
const stars = starRow ? starRow.querySelectorAll(".star") : [];
const feedbackText = document.getElementById("feedbackText");
const submitFeedback = document.getElementById("submitFeedback");

const feedbackListModal = document.getElementById("feedbackListModal");
const allFeedbackList = document.getElementById("allFeedbackList");
const viewAllFeedback = document.getElementById("viewAllFeedback");
const feedbackPreview = document.getElementById("feedbackPreview");
const clearFeedback = document.getElementById("clearFeedback");

const ding = document.getElementById("ding");

// ====== Helpers ======
function show(el){ if(el) el.classList.remove("hidden"); }
function hide(el){ if(el) el.classList.add("hidden"); }
function playDing(){ try{ if(ding.src) { ding.currentTime=0; ding.play(); } }catch(e){} }
function scrollChat(){ chatlog.scrollTop = chatlog.scrollHeight; }

function addMessage(sender, text){
  const msg = document.createElement("div");
  msg.className = `message ${sender}`;
  msg.textContent = (sender === "bot" ? "🤖 " : "🧍 ") + text;
  chatlog.appendChild(msg);
  playDing();
  scrollChat();
}

// typing indicator simulation
function showTypingIndicator(ms=900){
  show(typingIndicator);
  return new Promise(res => setTimeout(() => { hide(typingIndicator); res(); }, ms));
}

// ====== Local Storage utilities ======
function getLogs(key){ return JSON.parse(localStorage.getItem(key) || "[]"); }
function saveLogs(key, arr){ localStorage.setItem(key, JSON.stringify(arr)); }

// ====== Mood logic ======
const affirmations = {
  happy: "Keep shining — notice and celebrate the small wins today ✨",
  neutral: "A steady day can be a good day. Small steps count 🌱",
  sad: "It's okay to feel this — allow yourself compassion. You're not alone.",
  angry: "Name it to tame it — acknowledging helps calm the heat 🔥",
  tired: "Rest is productive. Try a brief nap or a slow walk 🌤️"
};

const themeMap = {
  happy: "theme-happy",
  neutral: "theme-neutral",
  sad: "theme-sad",
  angry: "theme-angry",
  tired: "theme-tired"
};

function setMoodTheme(mood){
  // remove previous theme classes
  Object.values(themeMap).forEach(c => document.body.classList.remove(c));
  const cls = themeMap[mood] || themeMap.neutral;
  document.body.classList.add(cls);
}

// log mood
function logMood(mood){
  const logs = getLogs("moodLogs");
  logs.push({ mood, timestamp: new Date().toISOString() });
  saveLogs("moodLogs", logs);
  updateStats();
  updateStreak();
  updateFeedbackPreview();
}

// update side stats (recent 5)
function updateStats(){
  const logs = getLogs("moodLogs");
  const recent = logs.slice(-6).map(l => l.mood);
  moodStatsEl.textContent = recent.length ? `Recent: ${recent.join(" → ")}` : "Recent: —";
}

// update streak (consecutive days with activity)
function updateStreak(){
  const logs = getLogs("moodLogs");
  if(!logs.length){ streakEl.textContent = "Streak: —"; return; }
  const days = [...new Set(logs.map(l => l.timestamp.slice(0,10)))].reverse();
  let streak = 0;
  const today = startOfDay(new Date());
  for(let i=0;i<days.length;i++){
    const day = startOfDay(new Date(days[i] + "T00:00:00"));
    const diff = Math.round((today - day)/(24*3600*1000));
    if(diff === i) streak++;
    else break;
  }
  streakEl.textContent = `Streak: ${streak} day${streak===1?"":"s"}`;
}
function startOfDay(d){ return new Date(d.getFullYear(),d.getMonth(),d.getDate()); }

// ====== Chat replies ======
function generateBotReply(input){
  const lower = input.toLowerCase();
  // emergency detection (conservative)
  if(lower.includes("suicid") || lower.includes("hurt myself") || lower.includes("end my life") || lower.includes("hopeless")){
    return "I'm really concerned. If you're in immediate danger call emergency services now. If you're able, please reach out to a trusted person or a local crisis line.";
  }
  if(lower.includes("stress") || lower.includes("anxious") || lower.includes("panic")){
    show(breathModal);
    return "It sounds like you're feeling stressed. Would you like a guided breathing exercise?";
  }
  if(lower.includes("tired") || lower.includes("sleep") || lower.includes("exhausted")){
    return "Rest matters. A short nap or stretching might help — do you want a 2-minute relaxation exercise?";
  }
  if(lower.includes("sad") || lower.includes("lonely")){
    return "I'm sorry you're feeling this way. Want to tell me what's been on your mind?";
  }
  if(lower.includes("angry") || lower.includes("frustrat")){
    return "Anger is valid. Would you like a grounding exercise to cool down?";
  }
  if(lower.includes("happy") || lower.includes("good") || lower.includes("great")){
    return "That's lovely to hear! What made your day good?";
  }
  return "Thanks for sharing — would you like a breathing exercise, a short focus exercise, or to write in your gratitude journal?";
}

// ====== Mood button handler ======
moodButtons.forEach(btn=>{
  btn.addEventListener("click", async ()=>{
    const mood = btn.dataset.mood;
    show(chatbox); show(journalSection); show(controls);
    setMoodTheme(mood);
    logMood(mood);
    affirmationEl.textContent = affirmations[mood] || affirmations.neutral;
    await showTypingIndicator(800);
    addMessage("bot", affirmations[mood] || "Thanks for checking in.");
  });
});

// ====== Send message handling ======
async function handleSend(){
  const text = userInput.value.trim();
  if(!text) return;
  addMessage("user", text);
  userInput.value = "";
  await showTypingIndicator(700);
  const reply = generateBotReply(text);
  await showTypingIndicator(700);
  addMessage("bot", reply);
}

sendBtn.addEventListener("click", handleSend);
userInput.addEventListener("keyup", (e)=>{ if(e.key==="Enter") handleSend(); });

// ====== Gratitude Journal ======
saveJournal.addEventListener("click", ()=>{
  const entry = journalEntry.value.trim();
  if(!entry) return;
  const logs = getLogs("gratitudeLogs");
  logs.push({ entry, timestamp: new Date().toISOString() });
  saveLogs("gratitudeLogs", logs);
  journalEntry.value = "";
  addMessage("bot", "Thanks — that was lovely to read. Small acts of thanks build resilience.");
  updateStreak();
});

viewJournal.addEventListener("click", openJournalModal);

function openJournalModal(){
  const logs = getLogs("gratitudeLogs").slice().reverse();
  journalList.innerHTML = logs.length ? logs.map(l=>`<div class="entry"><small class="muted">${l.timestamp.slice(0,10)}</small><div>${escapeHtml(l.entry)}</div></div>`).join("") : "<p class='muted'>No entries yet.</p>";
  show(journalModal);
}
clearJournal.addEventListener("click", ()=>{
  if(confirm("Clear all saved gratitude entries? This cannot be undone.")){
    localStorage.removeItem("gratitudeLogs");
    journalList.innerHTML = "<p class='muted'>No entries yet.</p>";
  }
});

// ====== Modal close handlers ======
document.querySelectorAll("[data-close]").forEach(btn=>{
  btn.addEventListener("click", closeAllModals);
});
document.querySelectorAll(".modal-close").forEach(b=>b.addEventListener("click", closeAllModals));
function closeAllModals(){ [breathModal,mindModal,summaryModal,journalModal,feedbackModal,feedbackListModal].forEach(m=>hide(m)); }

// ====== Breathing exercise ======
btnBreath.addEventListener("click", ()=> show(breathModal));
let breathTimer = null;
startBreath.addEventListener("click", ()=>{
  const rounds = 4;
  const steps = [];
  for(let r=0;r<rounds;r++){
    steps.push({text:"Breathe in", ms:4000, scale:1.25});
    steps.push({text:"Hold", ms:4000, scale:1.05});
    steps.push({text:"Breathe out", ms:6000, scale:0.8});
  }
  let i=0;
  if(breathTimer) clearTimeout(breathTimer);
  function next(){
    if(i>=steps.length){ breathText.textContent = "Nice work — how do you feel now?"; breathCircle.style.transform = "scale(1)"; return; }
    const s = steps[i++];
    breathText.textContent = s.text;
    breathCircle.style.transition = `transform ${s.ms}ms ease-in-out`;
    breathCircle.style.transform = `scale(${s.scale})`;
    breathTimer = setTimeout(next, s.ms + 200);
  }
  next();
});

// ====== Mind exercise (simple guided focus) ======
btnMind.addEventListener("click", ()=> show(mindModal));
let mindInterval = null;
startMind.addEventListener("click", ()=>{
  let total = 60;
  const prompts = [
    {t:60, text:"Breathe slowly. Notice your body."},
    {t:40, text:"Bring attention to your breath."},
    {t:20, text:"If your mind wandered, gently return to breath."},
    {t:0,  text:"Finish gently. Notice how you feel."}
  ];
  mindInstruction.textContent = "Focus for 60 seconds. Softly observe your breath.";
  mindTimer.textContent = formatSec(total);
  clearInterval(mindInterval);
  mindInterval = setInterval(()=>{
    total--;
    mindTimer.textContent = formatSec(total);
    const p = prompts.find(pr => pr.t === total);
    if(p) mindInstruction.textContent = p.text;
    if(total<=0){ clearInterval(mindInterval); mindInstruction.textContent="Well done — small moments add up."; }
  },1000);
});
function formatSec(s){ const sec = s%60; const mm = Math.floor(s/60); return `${String(mm).padStart(2,'0')}:${String(sec).padStart(2,'0')}`; }

// ====== Mood summary ======
btnHistory.addEventListener("click", openSummaryModal);
function openSummaryModal(){
  const logs = getLogs("moodLogs");
  if(!logs.length){ summaryContent.innerHTML = "<p class='muted'>No mood data yet — try selecting a mood above.</p>"; show(summaryModal); return; }
  const last7 = logs.filter(l => ((Date.now() - new Date(l.timestamp))/86400000) < 7);
  const summary = last7.reduce((acc,l)=>{ acc[l.mood] = (acc[l.mood]||0) + 1; return acc; }, {});
  const entries = Object.entries(summary);
  const html = entries.length ? `<ul>${entries.map(e=>`<li><strong>${e[0]}</strong>: ${e[1]} time${e[1]===1?"":"s"}</li>`).join("")}</ul>` : "<p class='muted'>No moods recorded in the last 7 days.</p>";
  summaryContent.innerHTML = html + `<p class="muted">Total checks: ${last7.length}</p>`;
  show(summaryModal);
}

// ====== Feedback system (only opens when user clicks Give Feedback) ======
// open feedback modal
btnFeedback.addEventListener("click", ()=>{
  // reset UI
  feedbackText.value = "";
  stars.forEach(s => s.classList.remove("active"));
  feedbackModal.querySelectorAll(".star").forEach(b => b.setAttribute("aria-pressed", "false"));
  show(feedbackModal);
  // focus first star for keyboard users
  if(stars[0]) stars[0].focus();
});

// star rating click
stars.forEach(st => {
  st.addEventListener("click", () => {
    const rate = Number(st.dataset.rate);
    stars.forEach(s => s.classList.toggle("active", Number(s.dataset.rate) <= rate));
    // set aria pressed state
    stars.forEach(s => s.setAttribute("aria-pressed", Number(s.dataset.rate) <= rate ? "true" : "false"));
  });
});

// submit feedback
submitFeedback.addEventListener("click", ()=>{
  const rating = Array.from(stars).filter(s => s.classList.contains("active")).length || null;
  const text = feedbackText.value.trim();
  const logs = getLogs("feedbackLogs");
  logs.push({ rating, text, timestamp: new Date().toISOString() });
  saveLogs("feedbackLogs", logs);
  addMessage("bot", "💚 Thank you for your feedback — that helps me improve.");
  closeAllModals();
  updateFeedbackPreview();
});

// preview recent 3 feedbacks on sidecard
function updateFeedbackPreview(){
  const logs = getLogs("feedbackLogs").slice().reverse();
  if(!logs.length){ feedbackPreview.textContent = "No feedback yet"; return; }
  const recent = logs.slice(0,3).map(l => {
    const stars = l.rating ? "★".repeat(l.rating) + "☆".repeat(5 - l.rating) : "No rating";
    const text = l.text ? ` — ${l.text.slice(0,60)}${l.text.length>60?"…":""}` : "";
    return `<div class="fb-mini"><small class="muted">${l.timestamp.slice(0,10)}</small><div>${stars}${text}</div></div>`;
  }).join("");
  feedbackPreview.innerHTML = recent;
}

// view all feedback modal
viewAllFeedback.addEventListener("click", openFeedbackList);
function openFeedbackList(){
  const logs = getLogs("feedbackLogs").slice().reverse();
  allFeedbackList.innerHTML = logs.length ? logs.map(l => `<div class="feedback-item"><small class="muted">${l.timestamp.slice(0,10)}</small><div>${l.rating ? "★".repeat(l.rating) + "☆".repeat(5-l.rating) : "No rating"}${l.text?` — ${escapeHtml(l.text)}`:""}</div></div>`).join("") : "<p class='muted'>No feedback yet.</p>";
  show(feedbackListModal);
}

// clear feedback
clearFeedback.addEventListener("click", ()=>{
  if(confirm("Clear all feedback? This cannot be undone.")){
    localStorage.removeItem("feedbackLogs");
    allFeedbackList.innerHTML = "<p class='muted'>No feedback yet.</p>";
    updateFeedbackPreview();
  }
});

// ====== small util to escape HTML for journal/feedback display ======
function escapeHtml(s){ return s.replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c])); }

// ====== Simple UI boot ======
updateStats(); updateStreak(); updateFeedbackPreview();

// ====== Modal click-outside close (optional) ======
document.querySelectorAll(".modal").forEach(mod=>{
  mod.addEventListener("click", (e)=>{
    if(e.target === mod) closeAllModals();
  });
});

// ====== init: gentle welcome if first time ======
if(!localStorage.getItem("seenWelcome")){
  show(chatbox); show(journalSection); show(controls);
  addMessage("bot", "Welcome! I'm Calm Companion. Tap a mood to begin — or type anything to chat.");
  localStorage.setItem("seenWelcome","1");
}

// ====== accessibility: focus input when chat visible ======
const observer = new MutationObserver(m=>{
  if(!chatbox.classList.contains("hidden")) userInput.focus();
});
observer.observe(chatbox,{attributes:true,attributeFilter:['class']});