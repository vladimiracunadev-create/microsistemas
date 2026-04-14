const STORAGE_KEY = "python_eval_3000_state_v1";
const els = {
  sectionFilter: document.getElementById("sectionFilter"),
  levelFilter: document.getElementById("levelFilter"),
  kindFilter: document.getElementById("kindFilter"),
  searchInput: document.getElementById("searchInput"),
  filteredCount: document.getElementById("filteredCount"),
  correctCount: document.getElementById("correctCount"),
  wrongCount: document.getElementById("wrongCount"),
  progressCount: document.getElementById("progressCount"),
  qSection: document.getElementById("qSection"),
  qLevel: document.getElementById("qLevel"),
  qKind: document.getElementById("qKind"),
  qId: document.getElementById("qId"),
  questionPrompt: document.getElementById("questionPrompt"),
  questionCode: document.getElementById("questionCode"),
  optionsWrap: document.getElementById("optionsWrap"),
  feedbackBox: document.getElementById("feedbackBox"),
  nextBtn: document.getElementById("nextBtn"),
  randomBtn: document.getElementById("randomBtn"),
  revealBtn: document.getElementById("revealBtn"),
  explorerList: document.getElementById("explorerList"),
  prevPageBtn: document.getElementById("prevPageBtn"),
  nextPageBtn: document.getElementById("nextPageBtn"),
  pageInfo: document.getElementById("pageInfo"),
  pageSizeSelect: document.getElementById("pageSizeSelect"),
  goQuizBtn: document.getElementById("goQuizBtn"),
  goExplorerBtn: document.getElementById("goExplorerBtn"),
  totalBadge: document.getElementById("totalBadge"),
  tabs: Array.from(document.querySelectorAll(".tab")),
  panels: {
    quiz: document.getElementById("quizPanel"),
    explorer: document.getElementById("explorerPanel"),
    help: document.getElementById("helpPanel")
  }
};

let QUESTIONS = [];
let FILTERED = [];
let SESSION = [];
let CURRENT = null;
let PAGE = 1;
let PAGE_SIZE = Number(els.pageSizeSelect.value || 25);
let ANSWERED = false;

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveState(partial) {
  const current = loadState();
  const next = { ...current, ...partial };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, m => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]
  ));
}
function normalize(text) {
  return String(text || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}
function shuffled(list, seedOffset = 0) {
  const arr = [...list];
  let seed = 123456 + seedOffset + arr.length;
  function rnd() {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  }
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function setTab(name) {
  els.tabs.forEach(btn => btn.classList.toggle("is-active", btn.dataset.tab === name));
  Object.entries(els.panels).forEach(([key, panel]) => panel.classList.toggle("is-active", key === name));
  saveState({ tab: name });
}
function populateFilters() {
  const sectionSet = ["Todas", ...new Set(QUESTIONS.map(q => q.section))];
  const kindSet = ["Todos", ...new Set(QUESTIONS.map(q => q.kind))];
  els.sectionFilter.innerHTML = sectionSet.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
  els.kindFilter.innerHTML = kindSet.map(v => `<option value="${escapeHtml(v)}">${escapeHtml(v)}</option>`).join("");
  const state = loadState();
  if (state.section) els.sectionFilter.value = state.section;
  if (state.level) els.levelFilter.value = state.level;
  if (state.kind) els.kindFilter.value = state.kind;
  if (state.search) els.searchInput.value = state.search;
}
function applyFilters() {
  const section = els.sectionFilter.value;
  const level = els.levelFilter.value;
  const kind = els.kindFilter.value;
  const search = normalize(els.searchInput.value);
  saveState({ section, level, kind, search: els.searchInput.value });

  FILTERED = QUESTIONS.filter(q => {
    if (section !== "Todas" && q.section !== section) return false;
    if (level !== "Todas" && q.level !== level) return false;
    if (kind !== "Todos" && q.kind !== kind) return false;
    if (!search) return true;
    const hay = normalize([q.prompt, q.answer, q.section, q.level, q.kind, q.code || ""].join(" "));
    return hay.includes(search);
  });

  els.filteredCount.textContent = FILTERED.length.toLocaleString("es-CL");
  PAGE = 1;
  resetSessionDeck();
  renderExplorer();
  updateStats();
}
function resetSessionDeck() {
  SESSION = shuffled(FILTERED.map(q => q.id), FILTERED.length);
  saveState({ deck: SESSION, deckIndex: 0 });
  loadNextQuestion();
}
function readStats() {
  const s = loadState();
  return {
    correct: Number(s.correct || 0),
    wrong: Number(s.wrong || 0),
    seen: Number(s.seen || 0)
  };
}
function bumpStat(type) {
  const s = readStats();
  if (type === "correct") s.correct += 1;
  if (type === "wrong") s.wrong += 1;
  s.seen = s.correct + s.wrong;
  saveState(s);
  updateStats();
}
function updateStats() {
  const s = readStats();
  els.correctCount.textContent = s.correct.toLocaleString("es-CL");
  els.wrongCount.textContent = s.wrong.toLocaleString("es-CL");
  els.progressCount.textContent = `${s.seen.toLocaleString("es-CL")} / ${FILTERED.length.toLocaleString("es-CL")}`;
}
function currentDeckIndex() {
  const s = loadState();
  return Number(s.deckIndex || 0);
}
function setDeckIndex(value) {
  saveState({ deckIndex: value });
}
function loadNextQuestion(randomFresh = false) {
  if (!FILTERED.length) {
    CURRENT = null;
    renderEmptyQuestion();
    return;
  }
  let deck = loadState().deck;
  if (!Array.isArray(deck) || deck.length !== FILTERED.length) {
    deck = shuffled(FILTERED.map(q => q.id), FILTERED.length);
    saveState({ deck, deckIndex: 0 });
  }
  let idx = currentDeckIndex();
  if (randomFresh) {
    CURRENT = FILTERED[Math.floor(Math.random() * FILTERED.length)];
  } else {
    if (idx >= deck.length) {
      deck = shuffled(FILTERED.map(q => q.id), FILTERED.length + idx);
      idx = 0;
      saveState({ deck });
    }
    const qid = deck[idx];
    CURRENT = QUESTIONS.find(q => q.id === qid) || FILTERED[0];
    setDeckIndex(idx + 1);
  }
  ANSWERED = false;
  renderQuestion();
}
function renderEmptyQuestion() {
  els.qSection.textContent = "Sin resultados";
  els.qLevel.textContent = "—";
  els.qKind.textContent = "—";
  els.qId.textContent = "ID —";
  els.questionPrompt.textContent = "No hay preguntas con los filtros actuales.";
  els.questionCode.classList.add("hidden");
  els.optionsWrap.innerHTML = "";
  els.feedbackBox.className = "feedback hidden";
  els.feedbackBox.innerHTML = "";
  els.nextBtn.disabled = true;
}
function renderQuestion() {
  if (!CURRENT) return renderEmptyQuestion();
  els.qSection.textContent = CURRENT.section;
  els.qLevel.textContent = CURRENT.level;
  els.qKind.textContent = CURRENT.kind;
  els.qId.textContent = `P${CURRENT.id}`;
  els.questionPrompt.textContent = CURRENT.prompt;
  if (CURRENT.code) {
    els.questionCode.classList.remove("hidden");
    els.questionCode.querySelector("code").textContent = CURRENT.code;
  } else {
    els.questionCode.classList.add("hidden");
    els.questionCode.querySelector("code").textContent = "";
  }
  els.optionsWrap.innerHTML = "";
  CURRENT.options.forEach((option, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "option-btn";
    btn.dataset.index = String(index);
    btn.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${escapeHtml(option)}</span>`;
    btn.addEventListener("click", () => handleAnswer(index));
    els.optionsWrap.appendChild(btn);
  });
  els.feedbackBox.className = "feedback hidden";
  els.feedbackBox.innerHTML = "";
  els.nextBtn.disabled = true;
}
function lockOptions() {
  els.optionsWrap.querySelectorAll(".option-btn").forEach(btn => btn.classList.add("locked"));
}
function handleAnswer(index, revealOnly = false) {
  if (!CURRENT || ANSWERED) return;
  ANSWERED = true;
  const correct = CURRENT.correct_index;
  const buttons = Array.from(els.optionsWrap.querySelectorAll(".option-btn"));
  buttons.forEach((btn, i) => {
    if (i === correct) btn.classList.add("correct");
    if (!revealOnly && i === index && i !== correct) btn.classList.add("wrong");
  });
  lockOptions();
  const isCorrect = index === correct || revealOnly;
  if (!revealOnly) bumpStat(isCorrect ? "correct" : "wrong");
  const title = revealOnly
    ? "Respuesta revelada"
    : (isCorrect ? "Respuesta correcta ✅" : "Respuesta incorrecta ❌");
  const css = revealOnly ? "feedback" : `feedback ${isCorrect ? "ok" : "bad"}`;
  const chosen = typeof index === "number" && CURRENT.options[index] ? CURRENT.options[index] : "—";
  els.feedbackBox.className = css;
  els.feedbackBox.innerHTML = `
    <h3>${title}</h3>
    <p><strong>Correcta:</strong> ${escapeHtml(CURRENT.answer)}</p>
    ${revealOnly ? "" : `<p><strong>Tu alternativa:</strong> ${escapeHtml(chosen)}</p>`}
    <p><strong>Sección:</strong> ${escapeHtml(CURRENT.section)} · <strong>Tipo:</strong> ${escapeHtml(CURRENT.kind)}</p>
  `;
  els.nextBtn.disabled = false;
}
function revealAnswer() {
  if (!CURRENT || ANSWERED) return;
  handleAnswer(CURRENT.correct_index, true);
}
function pageSlice() {
  const start = (PAGE - 1) * PAGE_SIZE;
  return FILTERED.slice(start, start + PAGE_SIZE);
}
function renderExplorer() {
  if (!FILTERED.length) {
    els.explorerList.innerHTML = `<div class="explorer-item"><h3>Sin resultados</h3><p>No hay preguntas con los filtros actuales.</p></div>`;
    els.pageInfo.textContent = "Página 0 de 0";
    return;
  }
  const totalPages = Math.max(1, Math.ceil(FILTERED.length / PAGE_SIZE));
  if (PAGE > totalPages) PAGE = totalPages;
  const slice = pageSlice();
  els.pageInfo.textContent = `Página ${PAGE} de ${totalPages}`;
  els.explorerList.innerHTML = slice.map(q => `
    <article class="explorer-item" data-id="${q.id}">
      <div class="explorer-head">
        <span class="pill">${escapeHtml(q.section_code)}</span>
        <span class="pill subtle">${escapeHtml(q.level)}</span>
        <span class="pill subtle">${escapeHtml(q.kind)}</span>
        <span class="pill subtle">P${q.id}</span>
      </div>
      <h3 class="explorer-title">${escapeHtml(q.prompt)}</h3>
      ${q.code ? `<pre class="code-box"><code>${escapeHtml(q.code)}</code></pre>` : ""}
      <div class="explorer-actions">
        <button class="secondary-btn small" type="button" data-action="toggle">Mostrar respuesta</button>
        <button class="secondary-btn small" type="button" data-action="focus">Llevar a evaluación</button>
      </div>
      <div class="answer-box hidden">
        <p><strong>Respuesta:</strong> ${escapeHtml(q.answer)}</p>
      </div>
    </article>
  `).join("");
  els.explorerList.querySelectorAll("[data-action='toggle']").forEach(btn => {
    btn.addEventListener("click", () => {
      const box = btn.closest(".explorer-item").querySelector(".answer-box");
      const visible = !box.classList.contains("hidden");
      box.classList.toggle("hidden", visible);
      btn.textContent = visible ? "Mostrar respuesta" : "Ocultar respuesta";
    });
  });
  els.explorerList.querySelectorAll("[data-action='focus']").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = Number(btn.closest(".explorer-item").dataset.id);
      CURRENT = QUESTIONS.find(q => q.id === id) || null;
      ANSWERED = false;
      renderQuestion();
      setTab("quiz");
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}
function bindEvents() {
  els.tabs.forEach(btn => btn.addEventListener("click", () => setTab(btn.dataset.tab)));
  [els.sectionFilter, els.levelFilter, els.kindFilter].forEach(el => el.addEventListener("change", applyFilters));
  els.searchInput.addEventListener("input", debounce(applyFilters, 140));
  els.nextBtn.addEventListener("click", () => loadNextQuestion());
  els.randomBtn.addEventListener("click", () => loadNextQuestion(true));
  els.revealBtn.addEventListener("click", revealAnswer);
  els.prevPageBtn.addEventListener("click", () => { if (PAGE > 1) { PAGE -= 1; renderExplorer(); } });
  els.nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(FILTERED.length / PAGE_SIZE));
    if (PAGE < totalPages) { PAGE += 1; renderExplorer(); }
  });
  els.pageSizeSelect.addEventListener("change", () => {
    PAGE_SIZE = Number(els.pageSizeSelect.value || 25);
    renderExplorer();
  });
  els.goQuizBtn.addEventListener("click", () => setTab("quiz"));
  els.goExplorerBtn.addEventListener("click", () => setTab("explorer"));

  document.addEventListener("keydown", e => {
    if (e.key === "/") {
      e.preventDefault();
      els.searchInput.focus();
      return;
    }
    if (document.activeElement === els.searchInput) return;
    const num = Number(e.key);
    if (num >= 1 && num <= 4 && !ANSWERED) {
      handleAnswer(num - 1);
    }
    if (e.key === "Enter" && ANSWERED) {
      loadNextQuestion();
    }
  });
}
function debounce(fn, wait = 120) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}
async function init() {
  const res = await fetch("data/questions.quiz.json", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar data/questions.quiz.json");
  const payload = await res.json();
  QUESTIONS = payload.questions || [];
  els.totalBadge.textContent = `${QUESTIONS.length.toLocaleString("es-CL")} preguntas`;
  populateFilters();
  bindEvents();
  applyFilters();
  const tab = loadState().tab || "quiz";
  setTab(tab);
}
init().catch(err => {
  console.error(err);
  els.questionPrompt.textContent = "No se pudo cargar el banco de preguntas. Abre la app desde servidor web (http://), no con file://";
});
