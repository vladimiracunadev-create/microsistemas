/* global BASELINES */
const byId = (id)=>document.getElementById(id);

function populateSelect(id, obj) {
  const el = byId(id);
  el.innerHTML = "";
  Object.entries(obj).forEach(([key, val])=>{
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = val.label || key;
    el.appendChild(opt);
  });
}

function populatePreset() {
  const el = byId("preset");
  el.innerHTML = "";
  BASELINES.presets.forEach((p, i)=>{
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = p.name;
    el.appendChild(opt);
  });
}

function applyPreset() {
  const idx = parseInt(byId("preset").value,10);
  if (isNaN(idx)) return;
  const values = BASELINES.presets[idx].values;
  Object.entries(values).forEach(([k, v])=>{
    const el = byId(k);
    if (el) el.value = v;
  });
  // numeric defaults can be overridden by user; keep existing input values
  byId("safety_factor").value = BASELINES.safety_factor;
  updateHelpTexts();
}

function bitsPerSecond(mbps) { return (mbps || 0)*1e6; }
function bitsFromKB(kb) { return (kb || 0)*1024*8; }
function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }
function setHelp(id, text){
  const el = byId("help_"+id);
  if (el) el.textContent = text || "";
}

function optionDesc(section, key){
  try {
    const obj = BASELINES[section][key];
    return obj.desc || obj.notes || obj.hint || "";
  } catch(e){ return ""; }
}

function updateHelpTexts(){
  setHelp("os", optionDesc("os", byId("os").value));
  setHelp("web_server", optionDesc("web_server", byId("web_server").value));
  setHelp("runtime", optionDesc("runtime", byId("runtime").value));
  setHelp("db", optionDesc("db", byId("db").value));
  setHelp("container", optionDesc("container", byId("container").value));
  setHelp("orchestrator", optionDesc("orchestrator", byId("orchestrator").value));
  setHelp("cache", optionDesc("cache", byId("cache").value));
  setHelp("cdn", optionDesc("cdn", byId("cdn").value));
  setHelp("tls", optionDesc("tls", byId("tls").value));
  setHelp("load_profile", optionDesc("load_profile", byId("load_profile").value));
  setHelp("architecture", optionDesc("architecture", byId("architecture").value));
  setHelp("scaling_strategy", optionDesc("scaling_strategy", byId("scaling_strategy").value));
  setHelp("lb_mesh", optionDesc("lb_mesh", byId("lb_mesh").value));
  setHelp("db_replication_mode", optionDesc("db_replication_mode", byId("db_replication_mode").value));
  // connection_pool_profile maps to BASELINES.connection_pool
  setHelp("connection_pool_profile", optionDesc("connection_pool", byId("connection_pool_profile").value));
  setHelp("endpoint_complexity", optionDesc("endpoint_complexity", byId("endpoint_complexity").value));
}


function calc() {
  const os = byId("os").value;
  const web = byId("web_server").value;
  const runtime = byId("runtime").value;
  const db = byId("db").value;
  const container = byId("container").value;
  const orch = byId("orchestrator").value;
  const cache = byId("cache").value;
  const cdn = byId("cdn").value;
  const tls = byId("tls").value;

  const loadProfile = byId("load_profile").value;
  const archKey = byId("architecture").value;
  const scaleKey = byId("scaling_strategy").value;
  const lbKey = byId("lb_mesh").value;

  const dbReplMode = byId("db_replication_mode").value;
  const poolProfileKey = byId("connection_pool_profile").value;

  const endpoint = byId("endpoint_complexity").value;

  const coresPerInstance = parseFloat(byId("cores_app").value);
  const appReplicas = parseFloat(byId("app_replicas").value || 1);

  const coresDbPrimary = parseFloat(byId("cores_db").value);
  const dbReadReplicas = parseFloat(byId("db_read_replicas").value || 0);
  const readRatioPct = clamp(parseFloat(byId("read_ratio").value || 80), 0, 100);
  const readRatio = readRatioPct / 100.0;
  const writeRatio = 1.0 - readRatio;

  const poolOverride = parseFloat(byId("pool_per_instance").value || 50);
  const dbConnHard = parseFloat(byId("db_conn_hard_limit").value || 800);

  const payloadKB = parseFloat(byId("payload_kb").value);
  const bwMbps = parseFloat(byId("bandwidth_mbps").value);
  const safety = parseFloat(byId("safety_factor").value);

  // --- Latencias
  const baseLat = BASELINES.endpoint_complexity[endpoint].lat_ms;
  const lp = BASELINES.load_profile[loadProfile];
  const arch = BASELINES.architecture[archKey];
  const scale = BASELINES.scaling_strategy[scaleKey];
  const lb = BASELINES.lb_mesh[lbKey];

  const lat_ms_endpoint =
    (baseLat * lp.lat_factor) +
    arch.lat_add_ms +
    (arch.avg_cold_start_ms || 0) +
    (scale.lat_add_ms || 0) +
    (lb.lat_add_ms || 0);

  // --- Multiplicadores base (infra + arquitectura + escalado + lb/mesh)
  const rps_core_base = BASELINES.runtime[runtime].rps_per_core_base;

  const infraMult =
    BASELINES.os[os].mult *
    BASELINES.web_server[web].mult *
    BASELINES.container[container].mult *
    BASELINES.orchestrator[orch].mult *
    BASELINES.cache[cache].mult *
    BASELINES.cdn[cdn].mult *
    BASELINES.tls[tls].mult *
    arch.mult *
    (scale.app_mult || 1.0) *
    (lb.app_mult || 1.0);

  // --- CPU/App
  const totalCoresApp = coresPerInstance * Math.max(1, appReplicas);
  const rps_core_adj = rps_core_base * infraMult * lp.cpu_mult * (100.0 / lat_ms_endpoint);
  const RPS_cpu = totalCoresApp * rps_core_adj;

  // --- DB primary theoretical capacity
  const dbConf = BASELINES.db[db];
  const connMaxPrimary = dbConf.conn_per_core * coresDbPrimary;
  const RPS_db_primary = (connMaxPrimary / (dbConf.lat_ms / 1000.0)) * lp.db_mult;

  // --- Read replicas: increase read capacity only
  let RPS_db_effective = RPS_db_primary;
  let readCap = RPS_db_primary;
  let writeCap = RPS_db_primary;
  if (dbReplMode === "read_replicas" && dbReadReplicas > 0) {
    readCap = RPS_db_primary * (1 + dbReadReplicas);
    writeCap = RPS_db_primary;
    const limRead = (readRatio > 0) ? (readCap / readRatio) : Infinity;
    const limWrite = (writeRatio > 0) ? (writeCap / writeRatio) : Infinity;
    RPS_db_effective = Math.min(limRead, limWrite);
  }

  // --- Connection pool bottleneck (very common in real life)
  // Pool per instance comes from profile, but user can override numeric input.
  const poolProfile = BASELINES.connection_pool[poolProfileKey];
  const poolPerInstance = Math.max(1, poolOverride || poolProfile.pool_per_instance || 50);
  const maxAppConn = poolPerInstance * Math.max(1, appReplicas);

  // DB has a hard max connections; effective max is min(DB hard, pool total)
  const effectiveMaxConn = Math.min(dbConnHard, maxAppConn);

  // Approx RPS limited by max concurrent DB conns / db latency (seconds)
  const RPS_pool_limit = (effectiveMaxConn / (dbConf.lat_ms / 1000.0));

  // Effective DB capacity is the minimum between query capacity and connection limits
  const RPS_db = Math.min(RPS_db_effective, RPS_pool_limit);

  // --- Network
  const payloadBits = bitsFromKB(payloadKB);
  const bw = bitsPerSecond(bwMbps);
  const RPS_red = (payloadBits > 0) ? ((bw / payloadBits) * lp.net_mult) : Infinity;

  const RPS_cap_raw = Math.min(RPS_cpu, RPS_db, RPS_red);
  const RPS_cap = RPS_cap_raw * safety;
  const usuarios_conc = RPS_cap * (lat_ms_endpoint / 1000.0);

  const bottleneck = (RPS_cap_raw === RPS_cpu) ? "CPU/App" : (RPS_cap_raw === RPS_db) ? "Base de Datos/Conexiones" : "Red";

  const out = `
<div class="kv">
  <div><strong>Latencia endpoint (efectiva)</strong></div><div>${lat_ms_endpoint.toFixed(0)} ms</div>
  <div><strong>Cores App totales</strong></div><div>${totalCoresApp.toFixed(1)} (${coresPerInstance}×${appReplicas})</div>
  <div><strong>Pool total App→DB</strong></div><div>${maxAppConn.toFixed(0)} (pool ${poolPerInstance}/inst)</div>
  <div><strong>Conns efectivas (min pool, hard DB)</strong></div><div>${effectiveMaxConn.toFixed(0)} (hard ${dbConnHard})</div>
  <div><strong>RPS por core (ajustado)</strong></div><div>${rps_core_adj.toFixed(2)}</div>
  <div><strong>RPS_CPU</strong></div><div>${RPS_cpu.toFixed(2)}</div>
  <div><strong>RPS_DB (efectivo)</strong></div><div>${RPS_db.toFixed(2)} (cap_consultas≈${RPS_db_effective.toFixed(2)}, cap_pool≈${RPS_pool_limit.toFixed(2)})</div>
  <div><strong>RPS_Red</strong></div><div>${isFinite(RPS_red)?RPS_red.toFixed(2):"∞"}</div>
  <div><strong>Saturación por</strong></div><div>${bottleneck}</div>
  <div><strong>RPS límite (cap)</strong></div><div>${RPS_cap.toFixed(2)} (safety ${safety})</div>
  <div><strong>Usuarios concurrentes ≈</strong></div><div>${usuarios_conc.toFixed(0)}</div>
</div>`;

  const replExplain = (dbReplMode === "read_replicas" && dbReadReplicas>0)
    ? `readCap=${readCap.toFixed(2)}; writeCap=${writeCap.toFixed(2)}; mixLecturas=${readRatioPct}% ⇒ cap_consultas=min(readCap/readRatio, writeCap/writeRatio)=${RPS_db_effective.toFixed(2)}`
    : `sin read replicas ⇒ cap_consultas=RPS_db_primary=${RPS_db_primary.toFixed(2)}`;

  const poolExplain = `poolProfile=${poolProfile.label}; poolPerInst=${poolPerInstance}; maxAppConn=poolPerInst×replicas=${maxAppConn.toFixed(0)}; hardDB=${dbConnHard}; effectiveConns=min=${effectiveMaxConn.toFixed(0)} ⇒ cap_pool=effectiveConns/lat_db=${RPS_pool_limit.toFixed(2)}`;

  const explain = `
<p><strong>Perfil de carga:</strong> ${lp.label} <small class="muted">(${lp.hint || ""})</small></p>
<p><strong>Arquitectura:</strong> ${arch.label} <small class="muted">(${arch.notes || ""})</small></p>
<p><strong>Escalado:</strong> ${scale.label} <small class="muted">(${scale.notes || ""})</small></p>
<p><strong>LB/Mesh:</strong> ${lb.label} <small class="muted">(${lb.notes || ""})</small></p>
<p><strong>DB Réplicas:</strong> ${BASELINES.db_replication_mode[dbReplMode].label}</p>
<p><strong>Pool conexiones:</strong> ${poolProfile.label} <small class="muted">(${poolProfile.notes || ""})</small></p>
<p><strong>Multiplicador infra+arch+scale+lb:</strong> ${infraMult.toFixed(3)}</p>
<p><span class="code">
lat_efectiva=(lat_base=${baseLat}ms×lat_factor=${lp.lat_factor}) + arch(${arch.lat_add_ms}ms) + scale(${scale.lat_add_ms||0}ms) + lb(${lb.lat_add_ms||0}ms) + cold(${arch.avg_cold_start_ms||0}ms) = ${lat_ms_endpoint.toFixed(0)}ms<br>
RPS_cpu=(cores_inst=${coresPerInstance}×replicas=${appReplicas})×rps_core_adj=${RPS_cpu.toFixed(2)} (rps_core_adj=${rps_core_adj.toFixed(2)})<br>
DB: connMax_primary=${connMaxPrimary}; lat_db=${dbConf.lat_ms}ms; RPS_db_primary=${RPS_db_primary.toFixed(2)}; ${replExplain}<br>
Pool: ${poolExplain}<br>
RPS_db=min(cap_consultas,cap_pool)=${RPS_db.toFixed(2)}<br>
RPS_red=((bw=${bwMbps}Mbps)/(payload=${payloadKB}KB))×net_mult(${lp.net_mult})=${isFinite(RPS_red)?RPS_red.toFixed(2):"∞"}<br>
RPS_cap=min(RPS_cpu,RPS_db,RPS_red)×safety(${safety})=${RPS_cap.toFixed(2)}; usuarios≈RPS_cap×(lat_efectiva/1000)=${usuarios_conc.toFixed(0)}
</span></p>`;

  byId("out").innerHTML = out;
  byId("explain").innerHTML = explain;
}

function resetForm() {
  populatePreset();
  ["os","web_server","runtime","db","container","orchestrator","cache","cdn","tls",
   "load_profile","architecture","scaling_strategy","lb_mesh",
   "db_replication_mode","connection_pool_profile","endpoint_complexity"].forEach(id=>{
    byId(id).selectedIndex = 0;
  });
  byId("cores_app").value = 8;
  byId("app_replicas").value = 2;
  byId("cores_db").value = 4;
  byId("db_read_replicas").value = 0;
  byId("read_ratio").value = 80;
  byId("pool_per_instance").value = 50;
  byId("db_conn_hard_limit").value = 800;
  byId("bandwidth_mbps").value = 1000;
  byId("payload_kb").value = 100;
  byId("safety_factor").value = BASELINES.safety_factor;
  updateHelpTexts();
  byId("out").innerHTML = "";
  byId("explain").innerHTML = "";
}

async function boot() {
  populatePreset();
  populateSelect("os", BASELINES.os);
  populateSelect("web_server", BASELINES.web_server);
  populateSelect("runtime", BASELINES.runtime);
  populateSelect("db", BASELINES.db);
  populateSelect("container", BASELINES.container);
  populateSelect("orchestrator", BASELINES.orchestrator);
  populateSelect("cache", BASELINES.cache);
  populateSelect("cdn", BASELINES.cdn);
  populateSelect("tls", BASELINES.tls);
  populateSelect("load_profile", BASELINES.load_profile);
  populateSelect("architecture", BASELINES.architecture);
  populateSelect("scaling_strategy", BASELINES.scaling_strategy);
  populateSelect("lb_mesh", BASELINES.lb_mesh);
  populateSelect("db_replication_mode", BASELINES.db_replication_mode);
  populateSelect("connection_pool_profile", BASELINES.connection_pool);
  populateSelect("endpoint_complexity", BASELINES.endpoint_complexity);


  // Actualiza descripciones al cambiar selects
  ["os","web_server","runtime","db","container","orchestrator","cache","cdn","tls",
   "load_profile","architecture","scaling_strategy","lb_mesh","db_replication_mode",
   "connection_pool_profile","endpoint_complexity"].forEach(id=>{
    const el = byId(id);
    if (el) el.addEventListener("change", updateHelpTexts);
  });
  updateHelpTexts();

  byId("applyPreset").addEventListener("click", applyPreset);
  byId("calc").addEventListener("click", calc);
  byId("reset").addEventListener("click", resetForm);

  applyPreset();
}

document.addEventListener("DOMContentLoaded", async ()=>{
  while(!window.BASELINES) await new Promise(r=>setTimeout(r, 50));
  boot();
});
