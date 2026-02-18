const $ = (id) => document.getElementById(id);

let DB = null;
let recipes = [];
let services = [];
const LS_FAV = "awsgen.favs.v2";
const LS_HIST = "awsgen.hist.v2";
const LS_SETTINGS = "awsgen.settings.v2";

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

  const profile_flag = (useProfile && profile) ? `--profile ${profile}` : "";
  const region_flag = (useRegion && region) ? `--region ${region}` : "";
  const output_flag = output || "";

  const useDryRun = $("useDryRun").checked;
  const dryrun_flag = useDryRun ? "--dryrun" : "";

  return { profile, region, output, profile_flag, region_flag, output_flag, dryrun_flag };
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
  selectEl.innerHTML = "";
  for (const it of items) {
    const opt = document.createElement("option");
    opt.value = it[valueKey];
    opt.textContent = it[labelKey];
    selectEl.appendChild(opt);
  }
}

function unique(arr) { return [...new Set(arr)]; }

function filterRecipes() {
  const serviceId = $("service").value;
  const category = $("category").value;
  const intent = $("taskIntent").value;

  let list = recipes;

  if (serviceId !== "all") list = list.filter(r => r.service === serviceId);
  if (category !== "all") list = list.filter(r => r.category === category);

  // Intent Logic - Map high level goals to tags/services
  if (intent !== "all") {
    const map = {
      consultar: ["consulta", "analisis", "observabilidad", "ls", "describe", "list"],
      archivos: ["s3", "cloudfront", "almacenamiento", "sync"],
      apps: ["lambda", "ecs", "deploy", "rollout", "update"],
      db: ["rds", "dynamodb", "database", "put", "get"],
      seguridad: ["iam", "sts", "seguridad", "identity", "role"],
      costos: ["budgets", "cost", "explorer"],
      limpiar: ["cleanup", "delete", "remove", "purgar"]
    };
    const searchTerms = map[intent] || [];
    list = list.filter(r => {
      const hay = `${r.id} ${r.service} ${r.category} ${r.action} ${r.title}`.toLowerCase();
      return searchTerms.some(term => hay.includes(term));
    });
  }

  // keep favorites on top
  const favs = new Set(getFavs());
  list.sort((a, b) => {
    const af = favs.has(a.id) ? 1 : 0;
    const bf = favs.has(b.id) ? 1 : 0;
    if (af !== bf) return bf - af;
    return a.title.localeCompare(b.title);
  });
  return list;
}

function refreshCategories() {
  const serviceId = $("service").value;
  const list = recipes.filter(r => (serviceId === "all" ? true : r.service === serviceId));
  const cats = unique(list.map(r => r.category)).sort();
  const items = [{ id: "all", title: "(todas)" }].concat(cats.map(c => ({ id: c, title: c })));
  renderSelectOptions($("category"), items);
}

function refreshRecipes() {
  const list = filterRecipes();
  const display = list.slice(0, 400);
  renderSelectOptions($("recipe"), display.map(r => ({ id: r.id, title: `${isFav(r.id) ? "⭐ " : ""}[${r.service}] ${r.title}` })));

  const r = getSelectedRecipe();
  renderRecipeMeta(r);
  renderParams(r);
  updateFavoriteButton();
  updateDangerBox(r);

  if (!display.length) {
    $("recipeMeta").textContent = "No hay resultados para esta intención.";
  }
}

function getSelectedRecipe() {
  const id = $("recipe").value;
  return recipes.find(r => r.id === id);
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
  sts: "<b>STS</b>: Genera identificaciones temporales para que tus scripts hablen con AWS de forma segura."
};

function renderRecipeMeta(r) {
  const meta = $("recipeMeta");
  const welcome = $("welcomeScreen");
  const output = $("outputContainer");
  const step3 = $("step3Container");
  const concept = $("conceptCard");
  const conceptContent = $("conceptContent");

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

  // Dynamic Concept Help
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
    lab.htmlFor = `p_${p.key}`;
    lab.textContent = `${p.label}${p.required ? " *" : ""}`;
    const inp = document.createElement(p.type === "select" ? "select" : "input");
    inp.id = `p_${p.key}`;
    if (p.type !== "select") inp.type = p.type || "text";
    inp.value = p.default ?? "";
    if (p.type === "select" && Array.isArray(p.options)) {
      for (const optVal of p.options) {
        const o = document.createElement("option");
        o.value = optVal; o.textContent = optVal;
        inp.appendChild(o);
      }
      inp.value = p.default ?? (p.options[0] ?? "");
    }

    inp.addEventListener("input", () => debounceGenerate());
    if (p.type === "select") inp.addEventListener("change", () => debounceGenerate());

    div.appendChild(lab);
    div.appendChild(inp);
    if (p.help) {
      const help = document.createElement("div");
      help.className = "muted";
      help.style.fontSize = "11px";
      help.style.marginTop = "4px";
      help.textContent = p.help;
      div.appendChild(help);
    }
    wrap.appendChild(div);
  }
  generate();
}

let generateTimeout = null;
function debounceGenerate() {
  clearTimeout(generateTimeout);
  generateTimeout = setTimeout(generate, 150);
}

function validateParams(r) {
  const params = r.params || [];
  const missing = [];
  for (const p of params) {
    if (!p.required) continue;
    const el = $(`p_${p.key}`);
    const v = (el ? el.value : "").trim();
    if (!v) missing.push(p.label || p.key);
  }
  return missing;
}

function prodLockBlocks(r, globals) {
  const lock = $("lockProd").checked;
  if (!lock) return false;
  const isProd = (globals.profile || "").toLowerCase().includes("prod");
  if (!isProd) return false;
  return (r?.risk?.level === "alto") || r?.dangerous;
}

function explainCommand(r, vars) {
  if (!r) return "";
  let baseAction = r.title.replace(/AWS CLI/gi, "").trim();
  let expl = `🧭 <b>¿Qué hará este comando?</b><br><span style="color:var(--text);">${baseAction}</span>.<br><br>`;

  if (vars.dryrun_flag) {
    expl += `<div style="color:var(--accent); background:rgba(59,130,246,0.1); padding:10px; border-radius:8px; border:1px solid rgba(59,130,246,0.2);">✨ <b>Modo Seguro:</b> Esto es una simulación. Puedes ver qué pasaría sin gastar dinero ni borrar nada.</div>`;
  } else if (r.risk?.level === "alto") {
    expl += `<div style="color:var(--danger); background:rgba(239,68,68,0.1); padding:10px; border-radius:8px; border:1px solid rgba(239,68,68,0.2);">🔥 <b>¡Acción Real!</b> Estás operando sobre tu infraestructura. Los cambios serán permanentes.</div>`;
  } else {
    expl += `✅ Listo para usar. Operación común y segura.`;
  }
  return expl;
}

function explainImpact(r) {
  if (!r) return "";
  let impact = `🏢 <b>Resumen de Consecuencias:</b> `;
  if (r.dangerous) {
    impact += `<span style="color:var(--danger);">Cuidado: comando destructivo. Asegúrate de tener backups.</span>`;
  } else if (r.risk?.level === "alto") {
    impact += `Alto impacto en el servicio. Podría haber indisponibilidad temporal.`;
  } else {
    impact += `Bajo impacto. Es seguro ejecutarlo en cualquier momento.`;
  }
  return impact;
}

function generate(silent = true) {
  const r = getSelectedRecipe();
  if (!r) return;

  const globals = getGlobalFlags();
  if (!silent && (prodLockBlocks(r, globals) || !($("dangerConfirm").checked || r.risk?.level !== "alto"))) {
    // These are handled by specific alerts elsewhere or logic in wireCopy
  }

  const vars = { ...globals, ...buildVarsFromParams(r.params || []) };
  if (!r.supports_dryrun) vars.dryrun_flag = "";

  const cmd = applyTemplate(r.command, vars).trim().replace(/\s+/g, " ").trim();
  $("outCommand").textContent = cmd || "(vacío)";

  $("outPrechecks").textContent = (r.prechecks || []).map(x => applyTemplate(x.command, vars).trim()).filter(Boolean).join("\n") || "(sin prechecks)";
  $("outCleanup").textContent = (r.cleanup || []).map(x => applyTemplate(x.command, vars).trim()).filter(Boolean).join("\n") || "(sin cleanup)";

  const risk = r.risk || { level: "bajo", notes: "" };
  const riskColor = risk.level === "alto" ? "var(--danger)" : (risk.level === "medio" ? "#f59e0b" : "var(--success)");

  $("riskPill").innerHTML = `<span style="padding:4px 12px; border-radius:999px; background:${riskColor}20; color:${riskColor}; border:1px solid ${riskColor}40; font-size:0.7rem; font-weight:700;">RIESGO: ${risk.level.toUpperCase()}</span>`;
  $("riskNotes").innerHTML = risk.notes ? `<b>Notas Seguridad:</b> ${risk.notes}` : "";
  $("permHint").innerHTML = r.permissions_hint ? `<b>Permisos IAM:</b> ${r.permissions_hint}` : "";
  $("costHint").innerHTML = r.cost_hint ? `<b>Costo estimado:</b> ${r.cost_hint}` : "";

  $("naturalLanguage").innerHTML = explainCommand(r, vars);
  if ($("operationalImpact")) $("operationalImpact").innerHTML = explainImpact(r);

  pushHistory(r, vars, cmd);
}

function wireSelectors() {
  $("taskIntent").addEventListener("change", () => refreshRecipes());
  $("service").addEventListener("change", () => { refreshCategories(); refreshRecipes(); });
  $("category").addEventListener("change", () => refreshRecipes());
  $("recipe").addEventListener("change", () => {
    const r = getSelectedRecipe();
    renderRecipeMeta(r);
    renderParams(r);
    updateFavoriteButton();
    updateDangerBox(r);
  });

  $("btnHelp").addEventListener("click", showOnboarding);
  $("btnGenerate").addEventListener("click", () => {
    const r = getSelectedRecipe();
    if (!r) return;
    const missing = validateParams(r);
    if (missing.length) return alert("Faltan: " + missing.join(", "));
    generate(false);
  });

  $("btnReset").addEventListener("click", () => {
    $("taskIntent").value = "all";
    $("service").value = "all";
    refreshCategories();
    refreshRecipes();
    renderRecipeMeta(null);
  });

  $("btnFavorite").addEventListener("click", () => {
    const r = getSelectedRecipe(); if (!r) return;
    toggleFav(r.id);
    updateFavoriteButton();
    refreshRecipes();
  });

  $("btnHistory").addEventListener("click", () => {
    showModal("Historial de Operaciones", renderHistory());
  });

  $("dangerConfirm").addEventListener("change", () => debounceGenerate());
  $("modalClose").addEventListener("click", hideModal);
}

// ... helper functions for onboarding/copy/export ...
function showOnboarding() {
  const html = `
    <div style="padding:1rem;">
      <h3 style="margin-bottom:1.5rem;">Guía de Usuario Microsistemas</h3>
      <div class="tour-grid">
        <div class="tour-item"><h4>1. Configura</h4><p>Define tu perfil y región. Esto asegura que el comando afecte a la cuenta correcta.</p></div>
        <div class="tour-item"><h4>2. Elige</h4><p>Busca por tu objetivo (ej: S3, IAM). Te explicaremos qué es cada servicio.</p></div>
        <div class="tour-item"><h4>3. Ejecuta</h4><p>Copia el comando a tu terminal o úsalo en tus tareas programadas con seguridad.</p></div>
      </div>
      <button class="primary" style="margin-top:1.5rem; width:100%;" onclick="hideModal()">Comenzar ahora</button>
    </div>
  `;
  showModal("¿Cómo funciona el Asistente?", html);
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); } catch (e) { console.error("Clipboard error"); }
}

function wireButtons() {
  $("copyCmd").addEventListener("click", () => {
    const r = getSelectedRecipe();
    if (r && (r.risk?.level === "alto" || r.dangerous) && !$("dangerConfirm").checked) return alert("Debes confirmar el riesgo.");
    copyText($("outCommand").textContent);
  });
  $("copyPre").addEventListener("click", () => copyText($("outPrechecks").textContent));
  $("copyClean").addEventListener("click", () => copyText($("outCleanup").textContent));
}

function pushHistory(r, vars, cmd) {
  const hist = getHist();
  hist.unshift({ title: r.title, date: new Date().toLocaleString(), cmd });
  setHist(hist.slice(0, 50));
}

function renderHistory() {
  return getHist().map(h => `<div class='modal-item'><b>${h.title}</b> [${h.date}]<pre class='code'>${h.cmd}</pre></div>`).join("");
}

function showModal(title, html) {
  $("modalTitle").textContent = title;
  $("modalBody").innerHTML = html;
  $("modal").classList.remove("hidden");
}
function hideModal() { $("modal").classList.add("hidden"); }

async function load() {
  const [cRes, sRes] = await Promise.all([fetch("./data/aws.commands.json"), fetch("./data/aws.services.json")]);
  DB = await cRes.json();
  recipes = DB.recipes || [];
  services = (await sRes.json()).services || [];

  renderSelectOptions($("service"), [{ id: "all", title: "(todos)" }, ...services.map(s => ({ id: s.id, title: s.title }))]);

  wireSelectors();
  wireButtons();
  refreshCategories();
  refreshRecipes();
}

load().catch(e => console.error("Error cargando app", e));
