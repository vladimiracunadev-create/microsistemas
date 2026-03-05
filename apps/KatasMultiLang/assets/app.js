const META_URL = "data/meta.json";
const LANG_URL = (key) => `data/lang/${key}.json`;

const els = {
  search: document.getElementById("search"),
  categorySelect: document.getElementById("categorySelect"),
  levelSelect: document.getElementById("levelSelect"),
  caseSelect: document.getElementById("caseSelect"),
  randomBtn: document.getElementById("randomBtn"),
  resetLangsBtn: document.getElementById("resetLangsBtn"),
  allLangsBtn: document.getElementById("allLangsBtn"),

  caseName: document.getElementById("caseName"),
  caseDesc: document.getElementById("caseDesc"),
  badgeLevel: document.getElementById("badgeLevel"),
  badgeCategory: document.getElementById("badgeCategory"),
  badgeId: document.getElementById("badgeId"),

  langbar: document.getElementById("langbar"),
  codeArea: document.getElementById("codeArea"),

  // Modes
  modeCompareBtn: document.getElementById("modeCompareBtn"),
  modeExploreBtn: document.getElementById("modeExploreBtn"),
  controlsCompare: document.getElementById("controlsCompare"),
  controlsExplore: document.getElementById("controlsExplore"),
  comparePanel: document.getElementById("comparePanel"),
  explorePanel: document.getElementById("explorePanel"),

  // Explore (por lenguaje)
  exploreLangSelect: document.getElementById("exploreLangSelect"),
  exploreSearch: document.getElementById("exploreSearch"),
  exploreLevelSelect: document.getElementById("exploreLevelSelect"),
  exploreRelated: document.getElementById("exploreRelated"),
  exploreLoadMoreBtn: document.getElementById("exploreLoadMoreBtn"),
  exploreTopBtn: document.getElementById("exploreTopBtn"),
  exploreArea: document.getElementById("exploreArea"),
  exploreBadgeLang: document.getElementById("exploreBadgeLang"),
  exploreBadgeCount: document.getElementById("exploreBadgeCount"),
};

let META = null;
let CURRENT_CASE = null;

// Multi-select languages (visual compare)
const DEFAULT_LANGS = ["javascript", "python", "java", "kotlin"];
let SELECTED_LANGS = [...DEFAULT_LANGS];


// UI Mode
let MODE = "compare"; // "compare" | "explore"
let EXPLORE_LANG = null;
let EXPLORE_LIMIT = 50;


const LANG_CACHE = new Map(); // langKey -> snippets map (id->code)
const LANG_META_CACHE = new Map(); // langKey -> language metadata

function escapeHtml(s){
  return s.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;");
}

function qs(){
  const p = new URLSearchParams(location.search);
  return {
    caseId: p.get("case") || null,
    langs: p.get("langs") || null, // comma separated
    q: p.get("q") || null,
    cat: p.get("cat") || null,
    lvl: p.get("lvl") || null,
    mode: p.get("mode") || null,
    el: p.get("el") || null,
  };
}

function setQs(){
  const p = new URLSearchParams();
  if (CURRENT_CASE?.id) p.set("case", CURRENT_CASE.id);
  if (SELECTED_LANGS.length) p.set("langs", SELECTED_LANGS.join(","));
  const q = (els.search.value || "").trim();
  if (q) p.set("q", q);
  const cat = els.categorySelect.value;
  if (cat && cat !== "__all__") p.set("cat", cat);
  const lvl = els.levelSelect.value;
  if (lvl && lvl !== "__all__") p.set("lvl", lvl);
  if (MODE) p.set("mode", MODE);
  if (MODE === "explore" && EXPLORE_LANG) p.set("el", EXPLORE_LANG);
  history.replaceState(null, "", location.pathname + "?" + p.toString());
}

function prismClassFor(key){
  if (key === "cpp") return "language-cpp";
  if (key === "csharp") return "language-csharp";
  if (key === "prompt" || key === "logic") return "language-markdown";
  if (key === "jquery" || key === "nodejs") return "language-javascript";
  if (key === "laravel") return "language-php";
  if (key === "symfony" || key === "codeigniter" || key === "slim") return "language-php";
  if (key === "aspnetcore") return "language-csharp";
  if (key === "quarkus" || key === "micronaut") return "language-java";
  if (key === "django" || key === "flask") return "language-python";
  if (key === "vite" || key === "pinia") return "language-javascript";
  if (key === "fastify" || key === "koa" || key === "hapi") return "language-javascript";
  if (key === "remix" || key === "gatsby") return "language-javascript";
  if (key === "nuxt") return "language-markup";
  if (key === "svelte" || key === "sveltekit") return "language-markup";
  if (key === "react" || key === "nextjs" || key === "express") return "language-javascript";
  if (key === "angular" || key === "nestjs") return "language-typescript";
  if (key === "fastapi") return "language-python";
  if (key === "springboot") return "language-java";
  if (key === "svelte") return "language-markup";
  if (key === "vue" || key === "astro") return "language-markup";
  if (key === "cobol" || key === "powerscript" || key === "vbscript" || key === "cfml" || key === "delphi" || key === "fortran") return "language-none";
  if (key === "sqlserver" || key === "mysql" || key === "postgresql" || key === "sybase" || key === "oracle" ||
      key === "sqlserver_sql" || key === "mysql_sql" || key === "postgresql_sql") return "language-sql";
  return "language-" + key;
}

const LANG_GROUP_CONFIG = [
  { label: "Web / JS", keys: ["javascript","typescript","nodejs","jquery","vite","vue","nuxt","pinia","svelte","sveltekit","react","remix","gatsby","nextjs","astro","express","fastify","koa","hapi","nestjs"] },
  { label: "PHP", keys: ["php","laravel","symfony","codeigniter","slim"] },
  { label: "Python", keys: ["python","django","flask","fastapi"] },
  { label: "JVM", keys: ["java","springboot","quarkus","micronaut","kotlin","scala"] },
  { label: ".NET / Windows", keys: ["csharp","aspnetcore","powershell","vbscript"] },
  { label: "Sistemas", keys: ["go","rust","c","cpp","swift"] },
  { label: "Scripting", keys: ["ruby","perl","lua","bash","r","julia"] },
  { label: "SQL / Bases de datos", keys: ["sqlserver_sql","sqlserver","mysql_sql","mysql","postgresql_sql","postgresql","oracle","sybase"] },
  { label: "Legacy / Enterprise", keys: ["powerscript","delphi","cfml","cobol","fortran"] },
  { label: "Prompt / Meta", keys: ["prompt","logic"] },
];

function buildLangGroups(){
  const all = META?.meta?.lenguajes || [];
  const byKey = new Map(all.map(l => [l.key, l]));
  const used = new Set();
  const groups = [];
  for (const g of LANG_GROUP_CONFIG){
    const langs = [];
    for (const k of g.keys){
      const l = byKey.get(k);
      if (l){ langs.push(l); used.add(k); }
    }
    if (langs.length) groups.push({ label: g.label, langs });
  }
  const rest = all.filter(l => !used.has(l.key)).sort((a,b)=>a.name.localeCompare(b.name));
  if (rest.length) groups.push({ label: "Otros", langs: rest });
  return groups;
}

function groupLabelForKey(langKey){
  for (const g of LANG_GROUP_CONFIG){
    if (g.keys.includes(langKey)) return g.label;
  }
  return "Otros";
}

function sortLangKeys(keys){
  const rank = new Map();
  LANG_GROUP_CONFIG.forEach((g, gi) => {
    g.keys.forEach((k, ki) => rank.set(k, gi*100 + ki));
  });
  return [...keys].sort((a,b)=>{
    const ra = rank.has(a) ? rank.get(a) : 999999;
    const rb = rank.has(b) ? rank.get(b) : 999999;
    if (ra !== rb) return ra - rb;
    return a.localeCompare(b);
  });
}

function levelRank(level){
  if (level === "Básico") return 1;
  if (level === "Intermedio") return 2;
  if (level === "Avanzado") return 3;
  return 99;
}


async function ensureLangLoaded(langKey){
  if (LANG_CACHE.has(langKey)) return;
  try{
    const res = await fetch(LANG_URL(langKey), { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const langMeta = json.language || {};
    // Optional inheritance model to keep JSON sizes small:
    // { extends: "javascript", overrides: { "C0001": "...", ... } }
    const baseKey = json.extends || langMeta.extends || null;

    LANG_META_CACHE.set(langKey, { ...langMeta, extends: baseKey });

    if (json.snippets){
      LANG_CACHE.set(langKey, json.snippets || {});
      return;
    }

    if (baseKey){
      await ensureLangLoaded(baseKey);
      const baseSnips = LANG_CACHE.get(baseKey) || {};
      const overrides = json.overrides || {};
      LANG_CACHE.set(langKey, { ...baseSnips, ...overrides });
      return;
    }

    // Fallback
    LANG_CACHE.set(langKey, {});
  }catch(e){
    console.warn("[lang load failed]", langKey, e);
    LANG_META_CACHE.set(langKey, { key: langKey, load_error: String(e) });
    LANG_CACHE.set(langKey, {});
  }
}

function buildLangBar(){
  els.langbar.innerHTML = "";
  const groups = buildLangGroups();
  for (const g of groups){
    const wrap = document.createElement("div");
    wrap.className = "langgroup";

    const title = document.createElement("div");
    title.className = "langgroupTitle";
    title.textContent = g.label;

    const row = document.createElement("div");
    row.className = "langgroupBtns";

    for (const l of g.langs){
      const btn = document.createElement("button");
      btn.className = "langbtn";
      btn.textContent = l.name;
      btn.dataset.lang = l.key;

      const isOn = SELECTED_LANGS.includes(l.key);
      btn.classList.toggle("on", isOn);

      btn.addEventListener("click", async () => {
        const key = l.key;
        const idx = SELECTED_LANGS.indexOf(key);
        if (idx >= 0) {
          if (SELECTED_LANGS.length === 1) return;
          SELECTED_LANGS.splice(idx, 1);
        } else {
          SELECTED_LANGS.push(key);
          await ensureLangLoaded(key);
        }
        persistLangs();
        render();
      });

      row.appendChild(btn);
    }

    wrap.appendChild(title);
    wrap.appendChild(row);
    els.langbar.appendChild(wrap);
  }
}


function fillCategorySelect(){
  const categories = Array.from(new Set(META.casos.map(c => c.categoria))).sort((a,b)=>a.localeCompare(b));
  els.categorySelect.innerHTML = "";
  const all = document.createElement("option");
  all.value = "__all__";
  all.textContent = "Todas";
  els.categorySelect.appendChild(all);
  for (const cat of categories){
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    els.categorySelect.appendChild(opt);
  }
}

function fillCaseSelect(casos){
  els.caseSelect.innerHTML = "";
  for (const c of casos){
    const opt = document.createElement("option");
    opt.value = c.id;
    opt.textContent = `${c.nombre}  ·  ${c.categoria}  ·  ${c.nivel}`;
    els.caseSelect.appendChild(opt);
  }
}

function getFilteredCases(){
  const q = (els.search.value || "").trim().toLowerCase();
  const cat = els.categorySelect.value;
  const lvl = els.levelSelect.value;

  return META.casos.filter(c => {
    if (cat && cat !== "__all__" && c.categoria !== cat) return false;
    if (lvl && lvl !== "__all__" && c.nivel !== lvl) return false;
    if (!q) return true;
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.descripcion.toLowerCase().includes(q) ||
      c.categoria.toLowerCase().includes(q)
    );
  });
}

function pickCaseById(id){
  return META.casos.find(c => c.id === id) || META.casos[0];
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
  }catch(e){
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
  }
}

function codeBlock(langName, prismClass, code, langMeta){
  const div = document.createElement("div");
  div.className = "codeBlock";

  const header = document.createElement("div");
  header.className = "codeHeader";

  const left = document.createElement("div");
  left.className = "lang";

  const title = document.createElement("div");
  title.className = "langTitle";
  title.textContent = langName;

  left.appendChild(title);

  // Collapsible language info
  if (langMeta && (langMeta.official_url || langMeta.keywords || langMeta.operators)){
    const details = document.createElement("details");
    details.className = "langInfo";
    const summary = document.createElement("summary");
    summary.textContent = "Info";
    details.appendChild(summary);

    const info = document.createElement("div");
    info.className = "langInfoBody";

    const row = (label, value) => {
      if (!value) return;
      const p = document.createElement("div");
      p.className = "langInfoRow";
      const b = document.createElement("span");
      b.className = "k";
      b.textContent = label + ": ";
      const v = document.createElement("span");
      v.className = "v";
      if (typeof value === "string"){
        v.textContent = value;
      } else {
        v.textContent = String(value);
      }
      p.appendChild(b);
      p.appendChild(v);
      info.appendChild(p);
    };

    const rowLink = (label, url) => {
      if (!url) return;
      const p = document.createElement("div");
      p.className = "langInfoRow";
      const b = document.createElement("span");
      b.className = "k";
      b.textContent = label + ": ";
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.textContent = url;
      p.appendChild(b);
      p.appendChild(a);
      info.appendChild(p);
    };

    rowLink("Oficial", langMeta.official_url);
    rowLink("Docs", langMeta.docs_url);
    row("Versión", langMeta.version);
    row("Extensiones", (langMeta.extensions || []).join(", "));
    row("Package manager", langMeta.package_manager);
    row("Ejecución", langMeta.execution);
    row("Tipado", langMeta.typing);
    row("Paradigmas", (langMeta.paradigms || []).join(", "));
    if (langMeta.comments){
      row("Comentarios", `línea=${langMeta.comments.line || "-"} · bloque=${langMeta.comments.block || "-"}`);
    }
    row("Operadores", (langMeta.operators || []).join(" "));
    row("Reservadas", (langMeta.keywords || []).join(", "));

    details.appendChild(info);
    left.appendChild(details);
  }

  const btnCopy = document.createElement("button");
  btnCopy.className = "btn";
  btnCopy.textContent = "Copiar";
  btnCopy.addEventListener("click", async () => {
    await copyText(code);
    btnCopy.textContent = "¡Copiado!";
    setTimeout(() => btnCopy.textContent = "Copiar", 900);
  });

  header.appendChild(left);
  header.appendChild(btnCopy);

  const pre = document.createElement("pre");
  pre.className = prismClass;

  const codeEl = document.createElement("code");
  codeEl.className = prismClass;
  codeEl.innerHTML = escapeHtml(code);

  pre.appendChild(codeEl);
  div.appendChild(header);
  div.appendChild(pre);
  return div;
}


function syncScroll(){
  // Sync vertical scroll of visible PRE blocks for easy comparison
  const pres = Array.from(els.codeArea.querySelectorAll("pre"));
  if (pres.length < 2) return;
  let isSyncing = false;

  for (const pre of pres){
    pre.addEventListener("scroll", () => {
      if (isSyncing) return;
      isSyncing = true;
      const top = pre.scrollTop;
      for (const other of pres){
        if (other !== pre) other.scrollTop = top;
      }
      isSyncing = false;
    }, { passive: true });
  }
}

function persistLangs(){
  try{
    localStorage.setItem("katas_selected_langs", JSON.stringify(SELECTED_LANGS));
  }catch(e){}
}

function toggleModeUI(){
  const isExplore = MODE === "explore";

  if (els.modeCompareBtn) els.modeCompareBtn.classList.toggle("on", !isExplore);
  if (els.modeExploreBtn) els.modeExploreBtn.classList.toggle("on", isExplore);

  if (els.controlsCompare) els.controlsCompare.style.display = isExplore ? "none" : "";
  if (els.controlsExplore) els.controlsExplore.style.display = isExplore ? "" : "none";
  if (els.comparePanel) els.comparePanel.style.display = isExplore ? "none" : "";
  if (els.explorePanel) els.explorePanel.style.display = isExplore ? "" : "none";
}

function loadPersistedLangs(){
  try{
    const raw = localStorage.getItem("katas_selected_langs");
    if (!raw) return;
    const v = JSON.parse(raw);
    if (Array.isArray(v) && v.length){
      SELECTED_LANGS = v.filter(x => typeof x === "string");
    }
  }catch(e){}
}

async function renderCompare(){
  if (!META || !CURRENT_CASE) return;

  els.caseName.textContent = CURRENT_CASE.nombre;
  els.caseDesc.textContent = CURRENT_CASE.descripcion;
  els.badgeLevel.textContent = CURRENT_CASE.nivel;
  els.badgeCategory.textContent = CURRENT_CASE.categoria;
  els.badgeId.textContent = CURRENT_CASE.id;

  buildLangBar();
  els.codeArea.innerHTML = "";

  const ordered = sortLangKeys(SELECTED_LANGS);
  let lastGroup = null;

  for (const key of ordered){
    const lang = META.meta.lenguajes.find(x => x.key === key);
    if (!lang) continue;

    const g = groupLabelForKey(key);
    if (g !== lastGroup){
      const sep = document.createElement("div");
      sep.className = "groupSep";
      sep.textContent = g;
      els.codeArea.appendChild(sep);
      lastGroup = g;
    }

    const snippets = LANG_CACHE.get(key) || {};
    const metaLang = LANG_META_CACHE.get(key) || {};
    const code = snippets[CURRENT_CASE.id] || (metaLang.load_error ? `// ERROR cargando ${key}: ${metaLang.load_error}` : "// (no encontrado)");
    els.codeArea.appendChild(codeBlock(lang.name, prismClassFor(key), code, LANG_META_CACHE.get(key) || {}));
  }

  if (window.Prism && Prism.highlightAll) Prism.highlightAll();
  syncScroll();
  setQs();
}

function caseCodeBlock(caseObj, prismClass, code){
  const div = document.createElement("div");
  div.className = "codeBlock";

  const header = document.createElement("div");
  header.className = "codeHeader";

  const left = document.createElement("div");
  left.className = "lang";

  const title = document.createElement("div");
  title.className = "langTitle";
  title.textContent = `${caseObj.id} · ${caseObj.nombre}`;

  const meta = document.createElement("div");
  meta.className = "muted";
  meta.style.fontSize = "12px";
  meta.textContent = `${caseObj.nivel} · ${caseObj.categoria}`;

  left.appendChild(title);
  left.appendChild(meta);

  const btnCopy = document.createElement("button");
  btnCopy.className = "btn";
  btnCopy.textContent = "Copiar";
  btnCopy.addEventListener("click", async () => {
    await copyText(code);
    btnCopy.textContent = "¡Copiado!";
    setTimeout(() => btnCopy.textContent = "Copiar", 900);
  });

  header.appendChild(left);
  header.appendChild(btnCopy);

  const pre = document.createElement("pre");
  pre.className = prismClass;
  const codeEl = document.createElement("code");
  codeEl.className = prismClass;
  codeEl.innerHTML = escapeHtml(code);
  pre.appendChild(codeEl);

  div.appendChild(header);
  div.appendChild(pre);
  return div;
}

function buildExploreLangSelect(){
  if (!els.exploreLangSelect) return;
  const groups = buildLangGroups();
  els.exploreLangSelect.innerHTML = "";
  for (const g of groups){
    const og = document.createElement("optgroup");
    og.label = g.label;
    for (const l of g.langs){
      const opt = document.createElement("option");
      opt.value = l.key;
      opt.textContent = l.name;
      og.appendChild(opt);
    }
    els.exploreLangSelect.appendChild(og);
  }
}

function updateExploreRelated(langKey){
  if (!els.exploreRelated) return;
  els.exploreRelated.innerHTML = "";
  const gLabel = groupLabelForKey(langKey);
  const groups = buildLangGroups();
  const group = groups.find(x => x.label === gLabel);
  if (!group) return;
  for (const l of group.langs){
    const chip = document.createElement("button");
    chip.className = "chip";
    chip.textContent = l.name;
    chip.classList.toggle("on", l.key === langKey);
    chip.addEventListener("click", () => {
      els.exploreLangSelect.value = l.key;
      EXPLORE_LANG = l.key;
      EXPLORE_LIMIT = 50;
      render();
    });
    els.exploreRelated.appendChild(chip);
  }
}

function getExploreCasesSorted(){
  const q = (els.exploreSearch?.value || "").trim().toLowerCase();
  const lvl = els.exploreLevelSelect?.value || "__all__";
  let casos = META.casos;

  if (lvl !== "__all__"){
    casos = casos.filter(c => c.nivel === lvl);
  }
  if (q){
    casos = casos.filter(c =>
      (c.id || "").toLowerCase().includes(q) ||
      (c.nombre || "").toLowerCase().includes(q) ||
      (c.descripcion || "").toLowerCase().includes(q) ||
      (c.categoria || "").toLowerCase().includes(q)
    );
  }

  casos = [...casos].sort((a,b)=>{
    const ra = levelRank(a.nivel);
    const rb = levelRank(b.nivel);
    if (ra !== rb) return ra - rb;
    const ca = (a.categoria || "").toLowerCase();
    const cb = (b.categoria || "").toLowerCase();
    if (ca !== cb) return ca.localeCompare(cb);
    return (a.nombre || "").localeCompare(b.nombre || "");
  });

  return casos;
}

function renderExplore(){
  if (!META) return;
  const langKey = els.exploreLangSelect?.value || EXPLORE_LANG || DEFAULT_LANGS[0];
  EXPLORE_LANG = langKey;

  updateExploreRelated(langKey);

  const lang = META.meta.lenguajes.find(x => x.key === langKey);
  if (els.exploreBadgeLang) els.exploreBadgeLang.textContent = lang ? lang.name : langKey;

  els.exploreArea.innerHTML = '<div class="loading">Cargando lenguaje...</div>';

  ensureLangLoaded(langKey).then(() => {
    const snippets = LANG_CACHE.get(langKey) || {};
    const metaLang = LANG_META_CACHE.get(langKey) || {};
    const casos = getExploreCasesSorted();

    if (els.exploreBadgeCount) els.exploreBadgeCount.textContent = `${casos.length} casos`;

    const toShow = casos.slice(0, EXPLORE_LIMIT);

    const frag = document.createDocumentFragment();
    if (metaLang.load_error){
      const warn = document.createElement("div");
      warn.className = "loading";
      warn.textContent = `⚠ Error cargando ${langKey}: ${metaLang.load_error}`;
      frag.appendChild(warn);
    }

    for (const c of toShow){
      const code = snippets[c.id] || (metaLang.load_error ? `// ERROR cargando ${langKey}: ${metaLang.load_error}` : "// (no encontrado)");
      frag.appendChild(caseCodeBlock(c, prismClassFor(langKey), code));
    }

    els.exploreArea.innerHTML = "";
    els.exploreArea.appendChild(frag);

    if (window.Prism && Prism.highlightAll) Prism.highlightAll();
    setQs();
  });
}

function render(){
  if (MODE === "explore") {
    renderExplore();
  } else {
    renderCompare();
  }
}


async function init(){
  const res = await fetch(META_URL);
  META = await res.json();

  loadPersistedLangs();

  // Restore query params if present
  const q = qs();
  if (q.q) els.search.value = q.q;
  fillCategorySelect();
  if (q.cat) els.categorySelect.value = q.cat;
  if (q.lvl) els.levelSelect.value = q.lvl;

  if (q.langs){
    const list = q.langs.split(",").map(x => x.trim()).filter(Boolean);
    if (list.length) SELECTED_LANGS = list;
  }

  // Ensure at least one language selected
  if (!SELECTED_LANGS.length) SELECTED_LANGS = [...DEFAULT_LANGS];

  // Load selected languages (robusto: no aborta por un lenguaje)
  await Promise.allSettled(SELECTED_LANGS.map(k => ensureLangLoaded(k)));

  // Fill case list using filters
  const filtered = getFilteredCases();
  fillCaseSelect(filtered);

  CURRENT_CASE = q.caseId ? pickCaseById(q.caseId) : (filtered[0] || META.casos[0]);
  els.caseSelect.value = CURRENT_CASE.id;

  // Explore UI
  buildExploreLangSelect();
  if (q.el && META.meta.lenguajes.find(l => l.key === q.el)) {
    EXPLORE_LANG = q.el;
    if (els.exploreLangSelect) els.exploreLangSelect.value = q.el;
  } else if (els.exploreLangSelect && els.exploreLangSelect.value) {
    EXPLORE_LANG = els.exploreLangSelect.value;
  }

  // Mode restore
  if (q.mode === "explore") MODE = "explore";
  toggleModeUI();

  render();
}


function refreshCasesAndRender(pickFirst=false){
  const filtered = getFilteredCases();
  fillCaseSelect(filtered);

  if (pickFirst){
    CURRENT_CASE = filtered[0] || META.casos[0];
    els.caseSelect.value = CURRENT_CASE.id;
  } else {
    // keep current if still present
    const ids = new Set(filtered.map(x => x.id));
    if (!ids.has(CURRENT_CASE.id)){
      CURRENT_CASE = filtered[0] || META.casos[0];
      els.caseSelect.value = CURRENT_CASE.id;
    }
  }
  render();
}

els.search?.addEventListener("input", () => refreshCasesAndRender(true));
els.categorySelect?.addEventListener("change", () => refreshCasesAndRender(true));
els.levelSelect?.addEventListener("change", () => refreshCasesAndRender(true));

els.modeCompareBtn?.addEventListener("click", () => {
  MODE = "compare";
  toggleModeUI();
  render();
});

els.modeExploreBtn?.addEventListener("click", () => {
  MODE = "explore";
  toggleModeUI();
  render();
});

els.exploreLangSelect?.addEventListener("change", () => {
  EXPLORE_LANG = els.exploreLangSelect.value;
  EXPLORE_LIMIT = 50;
  render();
});

els.exploreSearch?.addEventListener("input", () => {
  EXPLORE_LIMIT = 50;
  render();
});

els.exploreLevelSelect?.addEventListener("change", () => {
  EXPLORE_LIMIT = 50;
  render();
});

els.exploreLoadMoreBtn?.addEventListener("click", () => {
  EXPLORE_LIMIT += 50;
  render();
});

els.exploreTopBtn?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

els.caseSelect?.addEventListener("change", () => {
  CURRENT_CASE = pickCaseById(els.caseSelect.value);
  render();
});

els.randomBtn?.addEventListener("click", () => {
  const filtered = getFilteredCases();
  if (!filtered.length) return;
  const i = Math.floor(Math.random() * filtered.length);
  CURRENT_CASE = filtered[i];
  els.caseSelect.value = CURRENT_CASE.id;
  render();
});

els.resetLangsBtn?.addEventListener("click", async () => {
  SELECTED_LANGS = [...DEFAULT_LANGS];
  persistLangs();
  for (const key of SELECTED_LANGS) await ensureLangLoaded(key);
  render();
});

els.allLangsBtn?.addEventListener("click", async () => {
  SELECTED_LANGS = META.meta.lenguajes.map(x => x.key);
  persistLangs();
  for (const key of SELECTED_LANGS) await ensureLangLoaded(key);
  render();
});

init().catch(err => {
  console.error(err);
  els.codeArea.innerHTML = '<div class="loading">Error cargando meta/lang JSON. Revisa consola.</div>';
});