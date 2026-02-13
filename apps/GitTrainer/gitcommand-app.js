const STORAGE_KEY = "git_cmd_tabs_v2";

let CASES = [];
let CATS = [];

const els = {
  catTabs: document.getElementById("catTabs"),
  caseTabs: document.getElementById("caseTabs"),
  caseSelect: document.getElementById("caseSelect"),
  filter: document.getElementById("filter"),
  meta: document.getElementById("meta"),
  cmd: document.getElementById("cmd"),
  copyBtn: document.getElementById("copyBtn"),
  resetBtn: document.getElementById("resetBtn"),
  clearBtn: document.getElementById("clearBtn"),
  toast: document.getElementById("toast"),
  dangerBadge: document.getElementById("dangerBadge"),
  stats: document.getElementById("stats"),
  queHace: document.getElementById("queHace"),
  cuandoUsarlo: document.getElementById("cuandoUsarlo"),
  caseId: document.getElementById("caseId"),
  lineCount: document.getElementById("lineCount"),
};

/**
 * Carga el estado de la aplicación desde localStorage.
 * Retorna un objeto vacío si falla o no existe.
 */

function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function saveState(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

function toast(msg, type = "") {
  els.toast.textContent = msg;
  els.toast.className = "toast show" + (type ? ` ${type}` : "");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => els.toast.className = "toast", 1800);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[m]));
}

function normalizeCmd(cmd) {
  if (Array.isArray(cmd)) return cmd.map(x => String(x)).join("\n").trim();
  return typeof cmd === "string" ? cmd.trim() : "";
}

function countRealLines(cmdStr) {
  return cmdStr
    .split("\n")
    .map(x => x.trim())
    .filter(x => x && !x.startsWith("#"))
    .length;
}

function validateCases(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(c => c && typeof c.id === "string" && typeof c.title === "string" && c.cmd != null)
    .map(c => {
      const cmd = normalizeCmd(c.cmd);
      return {
        id: c.id,
        category: typeof c.category === "string" && c.category.trim() ? c.category.trim() : "General",
        title: c.title.trim(),
        tags: Array.isArray(c.tags) ? c.tags.map(String) : [],
        danger: Boolean(c.danger),
        queHace: typeof c.queHace === "string" ? c.queHace.trim() : "",
        cuandoUsarlo: typeof c.cuandoUsarlo === "string" ? c.cuandoUsarlo.trim() : "",
        cmd,
        cmdLines: countRealLines(cmd),
      };
    });
}

async function loadCases() {
  // Carga el archivo JSON con los casos de uso de Git
  // Se deshabilita la caché para asegurar siempre la última versión
  const res = await fetch("cases.json", { cache: "no-store" });
  if (!res.ok) throw new Error("No se pudo cargar cases.json");
  const data = await res.json();
  const cases = validateCases(data.cases);
  if (!cases.length) throw new Error("cases.json no contiene casos válidos.");
  return cases;
}

function buildCategoriesPreserveOrder() {
  const seen = new Set();
  const out = [];
  for (const c of CASES) {
    if (!seen.has(c.category)) {
      seen.add(c.category);
      out.push(c.category);
    }
  }
  return out;
}

function casesInCategory(cat) {
  return CASES.filter(c => c.category === cat);
}

function filteredCases(cat, q) {
  const list = casesInCategory(cat);
  const s = (q || "").trim().toLowerCase();
  if (!s) return list;
  return list.filter(c => {
    const hay = [
      c.title,
      c.category,
      c.queHace,
      c.cuandoUsarlo,
      ...(c.tags || []),
      c.cmd
    ].join(" ").toLowerCase();
    return hay.includes(s);
  });
}

function renderCatTabs(selectedCat) {
  els.catTabs.innerHTML = "";
  CATS.forEach(cat => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.type = "button";
    btn.role = "tab";
    btn.setAttribute("aria-selected", String(cat === selectedCat));
    btn.textContent = cat;
    btn.addEventListener("click", () => selectCategory(cat, false));
    els.catTabs.appendChild(btn);
  });
}

function renderCaseTabs(list, selectedId) {
  els.caseTabs.innerHTML = "";
  list.forEach(c => {
    const btn = document.createElement("button");
    btn.className = "tab";
    btn.type = "button";
    btn.role = "tab";
    btn.dataset.caseId = c.id;
    btn.setAttribute("aria-selected", String(c.id === selectedId));
    btn.textContent = `${c.title}  ·  ${c.cmdLines}L`;
    btn.addEventListener("click", () => selectCase(c.id, true));
    els.caseTabs.appendChild(btn);
  });
}

function renderCaseSelect(list, selectedId) {
  els.caseSelect.innerHTML = "";
  for (const c of list) {
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `[${c.cmdLines}L] ${c.title}`;
    els.caseSelect.appendChild(opt);
  }
  // si el caso no está, cae al primero
  els.caseSelect.value = list.some(c => c.id === selectedId) ? selectedId : (list[0]?.id || "");
}

function getCaseById(id) {
  const c = CASES.find(x => x.id === id);
  return c || CASES[0];
}

function setDanger(isDanger) {
  els.dangerBadge.classList.toggle("hidden", !isDanger);
}

function renderMeta(c) {
  const tags = (c.tags || []).map(t => `<span class="pill">${escapeHtml(t)}</span>`).join(" ");
  els.meta.innerHTML = `
    <div class="meta-row"><b>Cat:</b> ${escapeHtml(c.category)}</div>
    <div class="meta-row"><b>Líneas:</b> ${c.cmdLines}</div>
    <div class="meta-row"><b>Tags:</b> ${tags || "<span class='muted'>(sin tags)</span>"}</div>
  `;
}

function applyCaseToUI(caseId, keepEdited) {
  const c = getCaseById(caseId);

  renderMeta(c);
  setDanger(c.danger);

  els.caseId.textContent = `ID: ${c.id}`;
  els.lineCount.textContent = `${c.cmdLines} línea(s)`;

  els.queHace.textContent = c.queHace || "—";
  els.cuandoUsarlo.textContent = c.cuandoUsarlo || "—";

  const s = loadState();
  const edited = (s.editedById || {})[caseId];

  els.cmd.value = (keepEdited && typeof edited === "string") ? edited : c.cmd;

  s.lastCaseId = caseId;
  s.lastCat = c.category;
  saveState(s);

  // hash
  if (location.hash !== "#" + encodeURIComponent(caseId)) {
    history.replaceState(null, "", "#" + encodeURIComponent(caseId));
  }
}

function selectCategory(cat, keepCase) {
  const s = loadState();
  const q = els.filter.value || "";
  const list = filteredCases(cat, q);

  // cat tabs
  renderCatTabs(cat);

  // stats
  const totalInCat = casesInCategory(cat).length;
  els.stats.textContent = `${cat} · ${list.length}/${totalInCat} casos (filtrados) · Total: ${CASES.length}`;

  // determine selected case
  let selectedId = keepCase ? (s.lastCaseId || list[0]?.id) : (list[0]?.id);
  if (!list.some(c => c.id === selectedId)) selectedId = list[0]?.id;

  renderCaseTabs(list, selectedId);
  renderCaseSelect(list, selectedId);

  // sync selection change from select
  els.caseSelect.onchange = () => {
    const id = els.caseSelect.value;
    // highlight tabs too
    highlightCaseTab(id);
    applyCaseToUI(id, true);
  };

  if (selectedId) {
    applyCaseToUI(selectedId, true);
  } else {
    // empty due to filter
    els.meta.innerHTML = `<div class="muted small">No hay casos con ese filtro.</div>`;
    els.queHace.textContent = "—";
    els.cuandoUsarlo.textContent = "—";
    els.cmd.value = "";
  }
}

function highlightCaseTab(caseId) {
  const btns = els.caseTabs.querySelectorAll(".tab");
  btns.forEach(b => b.setAttribute("aria-selected", String(b.dataset.caseId === caseId)));
  // scroll into view (best effort)
  const active = els.caseTabs.querySelector(`.tab[data-case-id="${CSS.escape(caseId)}"]`);
  if (active) active.scrollIntoView({ block: "nearest" });
}

function selectCase(caseId, keepEdited = true) {
  const c = getCaseById(caseId);
  // ensure category selected
  const s = loadState();
  if (s.lastCat !== c.category) {
    els.filter.value = els.filter.value || "";
    selectCategory(c.category, true);
  }
  highlightCaseTab(caseId);
  els.caseSelect.value = caseId;
  applyCaseToUI(caseId, keepEdited);
}

function persistEdited(caseId) {
  const s = loadState();
  s.editedById = s.editedById || {};
  s.editedById[caseId] = els.cmd.value;
  saveState(s);
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      els.cmd.focus();
      els.cmd.select();
      const ok = document.execCommand("copy");
      window.getSelection().removeAllRanges();
      return ok;
    } catch {
      return false;
    }
  }
}

function getInitialCaseId() {
  const fromHash = decodeURIComponent((location.hash || "").replace(/^#/, "")).trim();
  if (fromHash && CASES.some(c => c.id === fromHash)) return fromHash;

  const s = loadState();
  if (s.lastCaseId && CASES.some(c => c.id === s.lastCaseId)) return s.lastCaseId;
  return CASES[0]?.id;
}

/**
 * Inicialización de la aplicación.
 * Carga casos, renderiza componentes y configura eventos.
 */
async function init() {
  try {
    CASES = await loadCases();
  } catch (e) {
    console.error(e);
    toast("No se pudo cargar cases.json. Abre con servidor local (http://).", "bad");
    return;
  }

  // Respeta el orden del JSON (pensado para aprendizaje).
  CATS = buildCategoriesPreserveOrder();

  const initialId = getInitialCaseId();
  const initialCase = getCaseById(initialId);

  // Render inicial
  els.filter.value = "";
  selectCategory(initialCase.category, true);
  selectCase(initialId, true);

  els.filter.addEventListener("input", () => {
    const s = loadState();
    const cat = (s.lastCat && CATS.includes(s.lastCat)) ? s.lastCat : CATS[0];
    selectCategory(cat, true);
  });

  els.cmd.addEventListener("input", () => {
    const s = loadState();
    const id = s.lastCaseId || initialId;
    persistEdited(id);
  });

  els.resetBtn.addEventListener("click", () => {
    const s = loadState();
    const id = s.lastCaseId || initialId;
    const c = getCaseById(id);
    els.cmd.value = c.cmd;
    // remove edited
    if (s.editedById && s.editedById[id]) delete s.editedById[id];
    saveState(s);
    toast("Comandos restaurados ✅", "ok");
  });

  els.clearBtn.addEventListener("click", () => {
    els.cmd.value = "";
    const s = loadState();
    const id = s.lastCaseId || initialId;
    if (s.editedById && s.editedById[id]) delete s.editedById[id];
    saveState(s);
    toast("Comandos limpiados ✅", "ok");
  });

  els.copyBtn.addEventListener("click", async () => {
    const text = (els.cmd.value || "").trim();
    if (!text) return toast("No hay comandos para copiar.", "bad");
    const ok = await copyToClipboard(text);
    toast(ok ? "Comandos copiados ✅" : "No se pudo copiar. Copia manual.", ok ? "ok" : "bad");
  });

  window.addEventListener("hashchange", () => {
    const fromHash = decodeURIComponent((location.hash || "").replace(/^#/, "")).trim();
    if (fromHash && CASES.some(c => c.id === fromHash)) {
      const c = getCaseById(fromHash);
      selectCategory(c.category, true);
      selectCase(fromHash, true);
    }
  });
}

init();
