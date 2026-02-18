const $ = (id) => document.getElementById(id);

let DB = null;
let recipes = [];
let services = [];
const LS_FAV = "awsgen.favs.v2";
const LS_HIST = "awsgen.hist.v2";
const LS_SETTINGS = "awsgen.settings.v2";

function getFavs(){ try{return JSON.parse(localStorage.getItem(LS_FAV)||"[]")}catch(e){return []} }
function setFavs(v){ localStorage.setItem(LS_FAV, JSON.stringify(v)); }
function getHist(){ try{return JSON.parse(localStorage.getItem(LS_HIST)||"[]")}catch(e){return []} }
function setHist(v){ localStorage.setItem(LS_HIST, JSON.stringify(v)); }
function getSettings(){ try{return JSON.parse(localStorage.getItem(LS_SETTINGS)||"{}")}catch(e){return {}} }
function setSettings(v){ localStorage.setItem(LS_SETTINGS, JSON.stringify(v)); }

function applyTemplate(str, vars){
  if(!str) return "";
  return str.replace(/\{\{(\w+)\}\}/g, (_,k)=> (vars[k] ?? ""));
}

function getGlobalFlags(){
  const profile = $("profile").value.trim();
  const region  = $("region").value.trim();
  const output  = $("output").value.trim();

  const useProfile = $("useProfile").checked;
  const useRegion  = $("useRegion").checked;

  const profile_flag = (useProfile && profile) ? `--profile ${profile}` : "";
  const region_flag  = (useRegion && region)   ? `--region ${region}`   : "";
  const output_flag  = output || "";

  const useDryRun = $("useDryRun").checked;
  const dryrun_flag = useDryRun ? "--dryrun" : "";

  return { profile, region, output, profile_flag, region_flag, output_flag, dryrun_flag };
}

function buildVarsFromParams(params){
  const vars = {};
  for (const p of params){
    const el = $(`p_${p.key}`);
    vars[p.key] = (el ? el.value : (p.default ?? ""));
  }
  return vars;
}

function renderSelectOptions(selectEl, items, {valueKey="id", labelKey="title"} = {}){
  selectEl.innerHTML = "";
  for (const it of items){
    const opt = document.createElement("option");
    opt.value = it[valueKey];
    opt.textContent = it[labelKey];
    selectEl.appendChild(opt);
  }
}

function unique(arr){ return [...new Set(arr)]; }

function filterRecipes(){
  const serviceId = $("service").value;
  const category  = $("category").value;
  const q = $("search").value.trim().toLowerCase();
  const favOnly = false;

  let list = recipes.filter(r => (serviceId === "all" ? true : r.service === serviceId));
  list = list.filter(r => (category === "all" ? true : r.category === category));

  if(q){
    list = list.filter(r => {
      const hay = `${r.id} ${r.service} ${r.category} ${r.action} ${r.title} ${r.description} ${(r.tags||[]).join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }
  // keep favorites on top
  const favs = new Set(getFavs());
  list.sort((a,b)=>{
    const af = favs.has(a.id) ? 1 : 0;
    const bf = favs.has(b.id) ? 1 : 0;
    if(af !== bf) return bf - af;
    return a.title.localeCompare(b.title);
  });
  return list;
}

function refreshCategories(){
  const serviceId = $("service").value;
  const list = recipes.filter(r => (serviceId==="all"? true : r.service===serviceId));
  const cats = unique(list.map(r=>r.category)).sort();
  const items = [{id:"all", title:"(todas)"}].concat(cats.map(c=>({id:c, title:c})));
  renderSelectOptions($("category"), items);
}

function refreshRecipes(){
  const list = filterRecipes();
  const display = list.slice(0, 400);
  renderSelectOptions($("recipe"), display.map(r=>({id:r.id, title:`${isFav(r.id)?"⭐ ":""}[${r.service}] ${r.title}`})));
  if(display.length){
    $("recipe").value = display[0].id;
    renderRecipeMeta(getSelectedRecipe());
    renderParams(getSelectedRecipe());
    updateFavoriteButton();
    updateDangerBox(getSelectedRecipe());
  } else {
    $("recipe").innerHTML = "";
    $("recipeMeta").textContent = "No hay resultados con los filtros actuales.";
    $("params").innerHTML = "";
    $("dangerBox").classList.add("hidden");
  }
  $("countHint").textContent = `Recetas cargadas: ${recipes.length} (mostrando hasta 400 por filtros).`;
}

function getSelectedRecipe(){
  const id = $("recipe").value;
  return recipes.find(r=>r.id===id);
}

function isFav(id){
  return (getFavs().includes(id));
}
function toggleFav(id){
  const favs = getFavs();
  const idx = favs.indexOf(id);
  if(idx>=0) favs.splice(idx,1); else favs.unshift(id);
  setFavs(favs.slice(0,200));
}

function updateFavoriteButton(){
  const r = getSelectedRecipe();
  if(!r) return;
  $("btnFavorite").textContent = isFav(r.id) ? "⭐ Favorito (ON)" : "⭐ Favorito";
}

function updateDangerBox(r){
  const isHigh = (r?.risk?.level === "alto") || r?.dangerous;
  if(isHigh){
    $("dangerBox").classList.remove("hidden");
  } else {
    $("dangerBox").classList.add("hidden");
    $("dangerConfirm").checked = false;
  }
}

function renderRecipeMeta(r){
  if(!r) return;
  $("recipeMeta").innerHTML = `
    <div><b>${r.title}</b></div>
    <div class="muted" style="margin-top:6px">${r.when_to_use || ""}</div>
    <div class="muted" style="margin-top:6px">Servicio: <b>${r.service}</b> · Categoría: <b>${r.category}</b> · Acción: <b>${r.action}</b></div>
  `;
}

function renderParams(r){
  const wrap = $("params");
  wrap.innerHTML = "";
  const params = r.params || [];
  if(!params.length){
    wrap.innerHTML = `<div class="muted">Esta receta no requiere parámetros adicionales.</div>`;
    return;
  }
  for(const p of params){
    const div = document.createElement("div");
    div.className = "field";
    const lab = document.createElement("label");
    lab.htmlFor = `p_${p.key}`;
    lab.textContent = `${p.label}${p.required ? " *" : ""}`;
    const inp = document.createElement(p.type === "select" ? "select" : "input");
    inp.id = `p_${p.key}`;
    if(p.type !== "select") inp.type = p.type || "text";
    inp.value = p.default ?? "";
    if(p.type === "select" && Array.isArray(p.options)){
      for(const optVal of p.options){
        const o = document.createElement("option");
        o.value = optVal; o.textContent = optVal;
        inp.appendChild(o);
      }
      inp.value = p.default ?? (p.options[0] ?? "");
    }
    div.appendChild(lab);
    div.appendChild(inp);
    if(p.help){
      const help = document.createElement("div");
      help.className = "muted";
      help.style.fontSize = "12px";
      help.textContent = p.help;
      div.appendChild(help);
    }
    wrap.appendChild(div);
  }
}

function validateParams(r){
  const params = r.params || [];
  const missing = [];
  for(const p of params){
    if(!p.required) continue;
    const el = $(`p_${p.key}`);
    const v = (el ? el.value : "").trim();
    if(!v) missing.push(p.label || p.key);
  }
  return missing;
}

function prodLockBlocks(r, globals){
  const lock = $("lockProd").checked;
  if(!lock) return false;
  const isProd = (globals.profile || "").toLowerCase().includes("prod");
  if(!isProd) return false;
  return (r?.risk?.level === "alto") || r?.dangerous;
}

function requireDangerConfirm(r){
  const isHigh = (r?.risk?.level === "alto") || r?.dangerous;
  if(!isHigh) return true;
  return $("dangerConfirm").checked;
}

function generate(){
  const r = getSelectedRecipe();
  if(!r) return;

  const globals = getGlobalFlags();

  if(prodLockBlocks(r, globals)){
    alert("Bloqueado: perfil parece prod y 'Bloquear peligrosos en prod' está activo.");
    return;
  }

  if(!requireDangerConfirm(r)){
    alert("Debes confirmar el riesgo (checkbox) antes de generar.");
    return;
  }

  const missing = validateParams(r);
  if(missing.length){
    alert("Faltan parámetros obligatorios: " + missing.join(", "));
    return;
  }

  // dry-run: only if recipe supports it
  const vars = { ...globals, ...buildVarsFromParams(r.params || []) };
  if(!r.supports_dryrun) vars.dryrun_flag = "";

  const cmd = applyTemplate(r.command, vars).trim().replace(/\s+/g, " ").trim();
  $("outCommand").textContent = cmd || "(vacío)";

  const pre = (r.prechecks || []).map(x => applyTemplate(x.command, vars).trim()).filter(Boolean).join("\n");
  $("outPrechecks").textContent = pre || "(sin prechecks)";

  const cln = (r.cleanup || []).map(x => applyTemplate(x.command, vars).trim()).filter(Boolean).join("\n");
  $("outCleanup").textContent = cln || "(sin cleanup)";

  const risk = r.risk || {level:"bajo", notes:""};
  $("riskPill").textContent = `Riesgo: ${risk.level}`;
  $("riskNotes").textContent = risk.notes ? `Notas: ${risk.notes}` : "";
  $("permHint").textContent = r.permissions_hint ? `Permisos sugeridos: ${r.permissions_hint}` : "";
  $("costHint").textContent = r.cost_hint ? `Costos: ${r.cost_hint}` : "";

  pushHistory(r, vars, cmd);
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
  }catch(e){
    const ta = document.createElement("textarea");
    ta.value = text; document.body.appendChild(ta);
    ta.select(); document.execCommand("copy");
    ta.remove();
  }
}

function wireCopy(){
  $("copyCmd").addEventListener("click", ()=>{
    const r = getSelectedRecipe();
    if(r && !requireDangerConfirm(r)) return alert("Confirma riesgo primero.");
    copyText($("outCommand").textContent);
  });
  $("copyPre").addEventListener("click", ()=> copyText($("outPrechecks").textContent));
  $("copyClean").addEventListener("click", ()=> copyText($("outCleanup").textContent));
}

function downloadFile(filename, content){
  const blob = new Blob([content], {type:"text/plain;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(a.href);
}

function buildScript(kind){
  const r = getSelectedRecipe();
  if(!r) return "";
  if(!requireDangerConfirm(r)) { alert("Confirma riesgo primero."); return ""; }

  const globals = getGlobalFlags();
  const vars = { ...globals, ...buildVarsFromParams(r.params || []) };
  if(!r.supports_dryrun) vars.dryrun_flag = "";

  const pre = (r.prechecks || []).map(x => applyTemplate(x.command, vars).trim()).filter(Boolean).join("\n");
  const cmd = applyTemplate(r.command, vars).trim().replace(/\s+/g, " ").trim();
  const cln = (r.cleanup || []).map(x => applyTemplate(x.command, vars).trim()).filter(Boolean).join("\n");

  if(kind==="sh"){
    return `#!/usr/bin/env bash
set -euo pipefail

# === PRECHECKS ===
${pre || "# (sin prechecks)"}

# === COMMAND ===
${cmd || "# (vacío)"}

# === CLEANUP ===
${cln || "# (sin cleanup)"}
`;
  }
  // ps1
  return `#requires -Version 5.1
$ErrorActionPreference = "Stop"

# === PRECHECKS ===
${pre || "# (sin prechecks)"}

# === COMMAND ===
${cmd || "# (vacío)"}

# === CLEANUP ===
${cln || "# (sin cleanup)"}
`;
}

function wireExport(){
  $("exportSh").addEventListener("click", ()=>{
    const r = getSelectedRecipe(); if(!r) return;
    const s = buildScript("sh"); if(!s) return;
    downloadFile(`${r.id}.sh`, s);
  });
  $("exportPs1").addEventListener("click", ()=>{
    const r = getSelectedRecipe(); if(!r) return;
    const s = buildScript("ps1"); if(!s) return;
    downloadFile(`${r.id}.ps1`, s);
  });
}

function pushHistory(r, vars, cmd){
  const hist = getHist();
  const entry = {
    at: new Date().toISOString(),
    id: r.id,
    title: r.title,
    service: r.service,
    risk: r.risk?.level || "bajo",
    profile: vars.profile || "",
    region: vars.region || "",
    cmd
  };
  hist.unshift(entry);
  setHist(hist.slice(0,50));
}

function showModal(title, bodyHtml){
  $("modalTitle").textContent = title;
  $("modalBody").innerHTML = bodyHtml;
  $("modal").classList.remove("hidden");
}
function hideModal(){ $("modal").classList.add("hidden"); }

function renderHistory(){
  const hist = getHist();
  if(!hist.length) return "<div class='muted'>Sin historial todavía.</div>";
  return hist.map(h=>`
    <div class="modalItem">
      <div><b>${h.title}</b></div>
      <div class="muted" style="margin-top:4px">${h.at}</div>
      <div class="kv">
        <span>service: ${h.service}</span>
        <span>risk: ${h.risk}</span>
        <span>profile: ${h.profile || "-"}</span>
        <span>region: ${h.region || "-"}</span>
      </div>
      <pre class="code" style="margin-top:10px">${(h.cmd||"").replace(/</g,"&lt;")}</pre>
      <button onclick="navigator.clipboard.writeText(${JSON.stringify(h.cmd||"")})">Copiar</button>
    </div>
  `).join("");
}

function wireSelectors(){
  $("service").addEventListener("change", ()=>{
    refreshCategories();
    refreshRecipes();
  });
  $("category").addEventListener("change", refreshRecipes);
  $("recipe").addEventListener("change", ()=>{
    const r = getSelectedRecipe();
    renderRecipeMeta(r);
    renderParams(r);
    updateFavoriteButton();
    updateDangerBox(r);
  });
  $("search").addEventListener("input", ()=> refreshRecipes());
  $("btnGenerate").addEventListener("click", generate);
  $("btnReset").addEventListener("click", ()=>{
    $("search").value = "";
    $("service").value = "all";
    refreshCategories();
    $("category").value = "all";
    refreshRecipes();
    $("outCommand").textContent = "";
    $("outPrechecks").textContent = "";
    $("outCleanup").textContent = "";
    $("riskPill").textContent = "";
    $("riskNotes").textContent = "";
    $("permHint").textContent = "";
    $("costHint").textContent = "";
  });

  $("btnFavorite").addEventListener("click", ()=>{
    const r = getSelectedRecipe(); if(!r) return;
    toggleFav(r.id);
    updateFavoriteButton();
    refreshRecipes();
  });

  $("btnHistory").addEventListener("click", ()=>{
    showModal("Historial (últimas 50)", renderHistory());
  });

  $("dangerConfirm").addEventListener("change", ()=>{ /* no-op */ });

  $("modalClose").addEventListener("click", hideModal);
  $("modal").addEventListener("click", (e)=>{ if(e.target.id==="modal") hideModal(); });
}

function loadSettings(){
  const s = getSettings();
  if(s.profile) $("profile").value = s.profile;
  if(s.region) $("region").value = s.region;
  if(s.output) $("output").value = s.output;
  if(typeof s.useProfile==="boolean") $("useProfile").checked = s.useProfile;
  if(typeof s.useRegion==="boolean") $("useRegion").checked = s.useRegion;
  if(typeof s.useDryRun==="boolean") $("useDryRun").checked = s.useDryRun;
  if(typeof s.lockProd==="boolean") $("lockProd").checked = s.lockProd;

  const save = ()=>{
    setSettings({
      profile:$("profile").value.trim(),
      region:$("region").value.trim(),
      output:$("output").value.trim(),
      useProfile:$("useProfile").checked,
      useRegion:$("useRegion").checked,
      useDryRun:$("useDryRun").checked,
      lockProd:$("lockProd").checked
    });
  };
  ["profile","region","output","useProfile","useRegion","useDryRun","lockProd"].forEach(id=>{
    $(id).addEventListener("change", save);
    $(id).addEventListener("input", save);
  });
}

async function load(){
  const [cmdRes, svcRes] = await Promise.all([
    fetch("./data/aws.commands.json"),
    fetch("./data/aws.services.json")
  ]);

  DB = await cmdRes.json();
  services = (await svcRes.json()).services || [];
  recipes = DB.recipes || [];

  // Service select
  const serviceItems = [{id:"all", title:"(todos)"}].concat(
    services.map(s=>({id:s.id, title:`${s.id} · ${s.title}`}))
  );
  renderSelectOptions($("service"), serviceItems);

  loadSettings();
  refreshCategories();
  $("category").value = "all";
  refreshRecipes();
  wireSelectors();
  wireCopy();
  wireExport();
}

load().catch(err=>{
  console.error(err);
  alert("Error cargando datos. Abre con un servidor (ej: VSCode Live Server) y revisa la consola.");
});
