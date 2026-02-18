const $ = (id) => document.getElementById(id);

let DB = null;
let recipes = [];
let services = [];
const LS_FAV = "awsgen.favs.v2";
const LS_HIST = "awsgen.hist.v2";
const LS_SETTINGS = "awsgen.settings.v2";

const INTENT_MAP = {
  consultar: ["consulta", "analisis", "observabilidad", "ls", "describe", "list"],
  archivos: ["s3", "cloudfront", "almacenamiento", "sync"],
  apps: ["lambda", "ecs", "deploy", "rollout", "update"],
  db: ["rds", "dynamodb", "database", "put", "get"],
  seguridad: ["iam", "sts", "seguridad", "identity", "role"],
  costos: ["budgets", "cost", "explorer"],
  limpiar: ["cleanup", "delete", "remove", "purgar"]
};

function getFavs() { try { return JSON.parse(localStorage.getItem(LS_FAV) || "[]") } catch (e) { return [] } }
function setFavs(v) { localStorage.setItem(LS_FAV, JSON.stringify(v)); }
function getHist() { try { return JSON.parse(localStorage.getItem(LS_HIST) || "[]") } catch (e) { return [] } }
function setHist(v) { localStorage.setItem(LS_HIST, JSON.stringify(v)); }
function getSettings() { try { return JSON.parse(localStorage.getItem(LS_SETTINGS) || "{}") } catch (e) { return {} } }
function setSettings(v) { localStorage.setItem(LS_SETTINGS, JSON.stringify(v)); }

function applyTemplate(str, vars) {
  if (!str) return "";
  return str.replace(/\{\{(\w+)\}\}/g, (_, k) => (vars[k] ?? ""));
}

function getGlobalFlags() {
  const profile = $("profile").value.trim();
  const region = $("region").value;
  const output = $("output").value;
  const useProfile = $("useProfile").checked;
  const useRegion = $("useRegion").checked;

  return {
    profile, region, output,
    profile_flag: (useProfile && profile) ? `--profile ${profile}` : "",
    region_flag: (useRegion && region) ? `--region ${region}` : "",
    output_flag: output || "",
    dryrun_flag: $("useDryRun").checked ? "--dryrun" : ""
  };
}

function buildVarsFromParams(params) {
  const vars = {};
  for (const p of params) {
    const el = $(`p_${p.key}`);
    vars[p.key] = (el ? el.value : (p.default ?? ""));
  }
  return vars;
}

function renderSelectOptions(selectEl, items, { valueKey = "id", labelKey = "title" } = {}) {
  const current = selectEl.value;
  selectEl.innerHTML = "";
  for (const it of items) {
    const opt = document.createElement("option");
    opt.value = it[valueKey];
    opt.textContent = it[labelKey];
    selectEl.appendChild(opt);
  }
  // Preserve selection if it still exists in the new list
  if ([...selectEl.options].some(o => o.value === current)) {
    selectEl.value = current;
  }
}

function unique(arr) { return [...new Set(arr)]; }

// --- FILTER CORE ---

function getFilteredBase() {
  const intent = $("taskIntent").value;
  const service = $("service").value;
  const category = $("category").value;

  let list = recipes;

  // Level 1: Intent
  if (intent !== "all") {
    const terms = INTENT_MAP[intent] || [];
    list = list.filter(r => {
      const hay = `${r.id} ${r.service} ${r.category} ${r.action} ${r.title}`.toLowerCase();
      return terms.some(t => hay.includes(t));
    });
  }

  // Level 2: Service
  if (service !== "all") {
    list = list.filter(r => r.service === service);
  }

  // Level 3: Category
  if (category !== "all") {
    list = list.filter(r => r.category === category);
  }

  return list;
}

function syncFilters() {
  const intent = $("taskIntent").value;
  const currentSvc = $("service").value;
  const currentCat = $("category").value;

  // Filter possible services based on intent
  let svcList = recipes;
  if (intent !== "all") {
    const terms = INTENT_MAP[intent] || [];
    svcList = svcList.filter(r => {
      const hay = `${r.id} ${r.service} ${r.category} ${r.action} ${r.title}`.toLowerCase();
      return terms.some(t => hay.includes(t));
    });
  }
  const availSvcs = unique(svcList.map(r => r.service)).sort();
  renderSelectOptions($("service"), [{ id: "all", title: "(todos)" }, ...availSvcs.map(s => ({ id: s, title: s }))]);

  // Filter possible categories based on intent + current service
  let catList = svcList;
  const svc = $("service").value;
  if (svc !== "all") {
    catList = catList.filter(r => r.service === svc);
  }
  const availCats = unique(catList.map(r => r.category)).sort();
  renderSelectOptions($("category"), [{ id: "all", title: "(todas)" }, ...availCats.map(c => ({ id: c, title: c }))]);

  refreshRecipes();
}

function refreshRecipes() {
  const list = getFilteredBase();
  const display = list.slice(0, 400);

  // keep favorites on top
  const favs = new Set(getFavs());
  display.sort((a, b) => {
    const af = favs.has(a.id) ? 1 : 0;
    const bf = favs.has(b.id) ? 1 : 0;
    if (af !== bf) return bf - af;
    return a.title.localeCompare(b.title);
  });

  renderSelectOptions($("recipe"), display.map(r => ({ id: r.id, title: `${isFav(r.id) ? "⭐ " : ""}[${r.service}] ${r.title}` })));

  const r = getSelectedRecipe();
  renderRecipeMeta(r);
  renderParams(r);
  updateFavoriteButton();
  updateDangerBox(r);

  if (!display.length) {
    $("recipeMeta").textContent = "No hay resultados para esta combinación de filtros.";
  }
}

function getSelectedRecipe() {
  return recipes.find(r => r.id === $("recipe").value);
}

function isFav(id) { return getFavs().includes(id); }
function toggleFav(id) {
  const favs = getFavs();
  const idx = favs.indexOf(id);
  if (idx >= 0) favs.splice(idx, 1); else favs.unshift(id);
  setFavs(favs.slice(0, 200));
}

function updateFavoriteButton() {
  const r = getSelectedRecipe();
  if (!r) return;
  $("btnFavorite").textContent = isFav(r.id) ? "⭐ Favorito (ON)" : "⭐ Favorito";
}

function updateDangerBox(r) {
  const isHigh = (r?.risk?.level === "alto") || r?.dangerous;
  const box = $("dangerBox");
  if (isHigh) {
    box.classList.remove("hidden");
  } else {
    box.classList.add("hidden");
    $("dangerConfirm").checked = false;
  }
}

const GLOSSARY = {
  s3: "<b>S3 (Simple Storage Service)</b>: Es el 'disco duro infinito' de AWS. Se usa para guardar archivos de forma segura y económica.",
  lambda: "<b>Lambda</b>: Bloques de código que se ejecutan solos sin servidores. Ideal para automatizar tareas rápidas.",
  ecs: "<b>ECS</b>: Ejecuta tus aplicaciones en contenedores (Docker). Es el motor de las apps modernas en Microsistemas.",
  ec2: "<b>EC2</b>: Servidores virtuales. Son básicamente computadoras completas corriendo en la nube.",
  rds: "<b>RDS</b>: Bases de datos gestionadas. AWS hace los parches y las copias de seguridad por ti.",
  iam: "<b>IAM</b>: El portero de AWS. Controla quién puede entrar y qué llaves (permisos) tiene cada usuario.",
  sts: "<b>STS</b>: Genera identificaciones temporales para que tus scripts hablen con AWS de forma segura.",
  cloudfront: "<b>CloudFront</b>: Una red de entrega rápida que pone tus archivos de S3 'cerca' de tus usuarios para que carguen al instante.",
  dynamodb: "<b>DynamoDB</b>: Una base de datos ultrarrápida para manejar millones de datos en milisegundos sin preocuparse por tablas complejas.",
  fargate: "<b>Fargate</b>: Permite correr contenedores sin gestionar servidores. Es 'infraestructura invisible'."
};

function renderRecipeMeta(r) {
  const concept = $("conceptCard");
  const conceptContent = $("conceptContent");
  const welcome = $("welcomeScreen");
  const output = $("outputContainer");
  const step3 = $("step3Container");
  const meta = $("recipeMeta");

  if (!r) {
    meta.innerHTML = `<div class='muted'>Selecciona un objetivo para comenzar.</div>`;
    welcome.classList.remove("hidden");
    output.classList.add("hidden");
    step3.classList.add("hidden");
    concept.classList.add("hidden");
    return;
  }

  welcome.classList.add("hidden");
  output.classList.remove("hidden");
  step3.classList.remove("hidden");

  const svcId = r.service.toLowerCase();
  if (GLOSSARY[svcId]) {
    concept.classList.remove("hidden");
    conceptContent.innerHTML = GLOSSARY[svcId];
  } else {
    concept.classList.add("hidden");
  }

  meta.innerHTML = `
    <div style="font-weight:700; color:var(--accent); margin-bottom:0.5rem;">${r.title}</div>
    <div class="muted" style="font-size:0.85rem; line-height:1.4;">${r.when_to_use || r.description || ""}</div>
    <div style="margin-top:1rem; display:flex; gap:8px; flex-wrap:wrap;">
      <span style="font-size:0.7rem; padding:4px 10px; border-radius:6px; background:rgba(59,130,246,0.1); border:1px solid rgba(59,130,246,0.2); color:var(--accent); font-weight:700;">${r.service.toUpperCase()}</span>
      <span style="font-size:0.7rem; padding:4px 10px; border-radius:6px; background:rgba(255,255,255,0.05); border:1px solid var(--border);">${r.category.toUpperCase()}</span>
    </div>
  `;
}

function renderParams(r) {
  const wrap = $("params");
  wrap.innerHTML = "";
  if (!r) return;
  const params = r.params || [];
  if (!params.length) {
    wrap.innerHTML = `<div class="hint-box">No se requieren datos adicionales. El comando está configurado de forma óptima.</div>`;
    generate();
    return;
  }
  for (const p of params) {
    const div = document.createElement("div");
    div.className = "field";
    const lab = document.createElement("label");
    lab.textContent = `${p.label}${p.required ? " *" : ""}`;
    const inp = document.createElement(p.type === "select" ? "select" : "input");
    inp.id = `p_${p.key}`;
    if (p.type !== "select") inp.type = p.type || "text";
    inp.value = p.default ?? "";
    if (p.type === "select" && Array.isArray(p.options)) {
      for (const oVal of p.options) {
        const o = document.createElement("option");
        o.value = oVal; o.textContent = oVal;
        inp.appendChild(o);
      }
    }
    inp.addEventListener("input", () => debounceGenerate());
    div.appendChild(lab);
    div.appendChild(inp);
    wrap.appendChild(div);
  }
  generate();
}

let generateTimeout = null;
function debounceGenerate() {
  clearTimeout(generateTimeout);
  generateTimeout = setTimeout(generate, 150);
}

function generate(silent = true) {
  const r = getSelectedRecipe();
  if (!r) return;

  const globals = getGlobalFlags();
  const vars = { ...globals, ...buildVarsFromParams(r.params || []) };
  if (!r.supports_dryrun) vars.dryrun_flag = "";

  $("outCommand").textContent = applyTemplate(r.command, vars).trim().replace(/\s+/g, " ").trim();
  $("outPrechecks").textContent = (r.prechecks || []).map(x => applyTemplate(x.command, vars).trim()).filter(Boolean).join("\n") || "(sin prechecks)";
  $("outCleanup").textContent = (r.cleanup || []).map(x => applyTemplate(x.command, vars).trim()).filter(Boolean).join("\n") || "(sin cleanup)";

  const risk = r.risk || { level: "bajo" };
  const color = risk.level === "alto" ? "var(--danger)" : (risk.level === "medio" ? "#f59e0b" : "var(--success)");
  $("riskPill").innerHTML = `<span style="padding:4px 12px; border-radius:999px; background:${color}20; color:${color}; border:1px solid ${color}40; font-size:0.7rem; font-weight:700;">RIESGO: ${risk.level.toUpperCase()}</span>`;

  $("naturalLanguage").innerHTML = explainCommand(r, vars);
  if ($("operationalImpact")) $("operationalImpact").innerHTML = explainImpact(r);
}

function explainCommand(r, vars) {
  if (!r) return "";
  let base = r.title.replace(/AWS CLI/gi, "").trim();
  let expl = `🧭 <b>¿Qué hará este comando?</b><br><span style="color:var(--text);">${base}</span>.<br><br>`;
  if (vars.dryrun_flag) expl += `<div style="color:var(--accent); background:rgba(59,130,246,0.1); padding:10px; border-radius:8px;">✨ <b>Modo Seguro:</b> Esto es una simulación.</div>`;
  else if (r.risk?.level === "alto") expl += `<div style="color:var(--danger); background:rgba(239,68,68,0.1); padding:10px; border-radius:8px;">🔥 <b>¡Acción Real!</b> Cambios permanentes.</div>`;
  return expl;
}

function explainImpact(r) {
  if (!r?.dangerous && r?.risk?.level !== "alto") return `🏢 <b>Resumen:</b> Bajo impacto y seguro.`;
  return `🏢 <b>Resumen:</b> <span style="color:var(--danger);">Cuidado: comando destructivo o de alto impacto.</span>`;
}

function wireSelectors() {
  $("taskIntent").addEventListener("change", () => syncFilters());
  $("service").addEventListener("change", () => syncFilters());
  $("category").addEventListener("change", () => refreshRecipes());
  $("recipe").addEventListener("change", () => refreshRecipes());

  // Quick Starts restoration
  document.querySelectorAll(".quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const intent = btn.getAttribute("data-intent");
      const svc = btn.getAttribute("data-service");
      if (intent) $("taskIntent").value = intent;
      syncFilters();
      if (svc) $("service").value = svc;
      syncFilters();
    });
  });

  // Reactive Global settings
  ["profile", "region", "output", "useProfile", "useRegion", "useDryRun", "lockProd"].forEach(id => {
    $(id).addEventListener("input", () => debounceGenerate());
    $(id).addEventListener("change", () => debounceGenerate());
  });

  $("btnHelp").addEventListener("click", showOnboarding);
  $("btnReset").addEventListener("click", () => {
    $("taskIntent").value = "all";
    $("service").value = "all";
    syncFilters();
    renderRecipeMeta(null);
  });
}

function showOnboarding() {
  const html = `<div style="padding:1rem;"><h3>Guía Microsistemas</h3><p>1. Configura tu perfil.<br>2. Elige tu objetivo.<br>3. Copia y ejecuta.</p><button class="primary" onclick="hideModal()">Comenzar</button></div>`;
  showModal("¿Cómo funciona?", html);
}

function showModal(title, html) {
  $("modalTitle").textContent = title;
  $("modalBody").innerHTML = html;
  $("modal").classList.remove("hidden");
}

function hideModal() {
  $("modal").classList.add("hidden");
}

// Global scope for onclick in generated HTML
window.hideModal = hideModal;

function wireGlobalEvents() {
  $("modalClose").addEventListener("click", hideModal);
  $("modal").addEventListener("click", (e) => { if (e.target.id === "modal") hideModal(); });
  window.addEventListener("keydown", (e) => { if (e.key === "Escape") hideModal(); });
}

async function load() {
  const [cRes, sRes] = await Promise.all([fetch("./data/aws.commands.json"), fetch("./data/aws.services.json")]);
  DB = await cRes.json();
  recipes = DB.recipes || [];
  services = (await sRes.json()).services || [];

  wireSelectors();
  wireGlobalEvents();
  syncFilters();
}

load().catch(e => console.error(e));
