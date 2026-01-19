/* global BASELINES, Chart */
const byId = (id) => document.getElementById(id);
let healthChart = null;

function populateSelect(id, obj) {
  const el = byId(id);
  if (!el) return;
  el.innerHTML = "";
  Object.entries(obj).forEach(([key, val]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = val.label || key;
    el.appendChild(opt);
  });
}

function populatePreset() {
  const el = byId("preset");
  if (!el) return;
  el.innerHTML = "";
  BASELINES.presets.forEach((p, i) => {
    const opt = document.createElement("option");
    opt.value = i;
    opt.textContent = p.name;
    el.appendChild(opt);
  });
}

function applyPreset() {
  const presetEl = byId("preset");
  if (!presetEl) return;
  const idx = parseInt(presetEl.value, 10);
  if (isNaN(idx)) return;
  const values = BASELINES.presets[idx].values;
  Object.entries(values).forEach(([k, v]) => {
    const el = byId(k);
    if (el) el.value = v;
  });
  byId("safety_factor").value = BASELINES.safety_factor;
  updateHelpTexts();
}

function bitsPerSecond(mbps) { return (mbps || 0) * 1e6; }
function bitsFromKB(kb) { return (kb || 0) * 1024 * 8; }
function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
function setHelp(id, text) {
  const el = byId("help_" + id);
  if (el) el.textContent = text || "";
}

function optionDesc(section, key) {
  try {
    const obj = BASELINES[section][key];
    return obj.desc || obj.notes || obj.hint || "";
  } catch (e) { return ""; }
}

function updateHelpTexts() {
  const fields = ["os", "web_server", "runtime", "db", "container", "orchestrator", "cache", "cdn", "tls", "cloud_provider", "load_profile", "architecture", "scaling_strategy", "lb_mesh", "db_replication_mode", "connection_pool_profile", "endpoint_complexity"];
  fields.forEach(id => {
    const el = byId(id);
    if (el) {
      const section = (id === "cloud_provider") ? "cloud_providers" : (id === "connection_pool_profile") ? "connection_pool" : id;
      setHelp(id, optionDesc(section, el.value));
    }
  });
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
  const cloudKey = byId("cloud_provider").value;

  const coresPerInstance = parseFloat(byId("cores_app").value) || 0;
  const appReplicas = parseFloat(byId("app_replicas").value) || 1;
  const coresDbPrimary = parseFloat(byId("cores_db").value) || 0;
  const dbReadReplicas = parseFloat(byId("db_read_replicas").value) || 0;
  const readRatioPct = clamp(parseFloat(byId("read_ratio").value) || 80, 0, 100);
  const readRatio = readRatioPct / 100.0;
  const writeRatio = 1.0 - readRatio;

  const poolOverride = parseFloat(byId("pool_per_instance").value) || 50;
  const dbConnHard = parseFloat(byId("db_conn_hard_limit").value) || 800;
  const payloadKB = parseFloat(byId("payload_kb").value) || 0;
  const bwMbps = parseFloat(byId("bandwidth_mbps").value) || 0;
  const safety = parseFloat(byId("safety_factor").value) || 0.7;

  const baseLat = BASELINES.endpoint_complexity[endpoint].lat_ms;
  const lp = BASELINES.load_profile[loadProfile];
  const arch = BASELINES.architecture[archKey];
  const scale = BASELINES.scaling_strategy[scaleKey];
  const lb = BASELINES.lb_mesh[lbKey];

  const lat_ms_endpoint = (baseLat * lp.lat_factor) + arch.lat_add_ms + (arch.avg_cold_start_ms || 0) + (scale.lat_add_ms || 0) + (lb.lat_add_ms || 0);

  const rps_core_base = BASELINES.runtime[runtime].rps_per_core_base;
  const infraMult = BASELINES.os[os].mult * BASELINES.web_server[web].mult * BASELINES.container[container].mult * BASELINES.orchestrator[orch].mult * BASELINES.cache[cache].mult * BASELINES.cdn[cdn].mult * BASELINES.tls[tls].mult * arch.mult * (scale.app_mult || 1.0) * (lb.app_mult || 1.0);

  const totalCoresApp = coresPerInstance * Math.max(1, appReplicas);
  const rps_core_adj = rps_core_base * infraMult * lp.cpu_mult * (100.0 / lat_ms_endpoint);
  const RPS_cpu = totalCoresApp * rps_core_adj;

  const dbConf = BASELINES.db[db];
  const connMaxPrimary = dbConf.conn_per_core * coresDbPrimary;
  const RPS_db_primary = (connMaxPrimary / (dbConf.lat_ms / 1000.0)) * lp.db_mult;

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

  const poolProfile = BASELINES.connection_pool[poolProfileKey];
  const poolPerInstance = Math.max(1, poolOverride || poolProfile.pool_per_instance || 50);
  const maxAppConn = poolPerInstance * Math.max(1, appReplicas);
  const effectiveMaxConn = Math.min(dbConnHard, maxAppConn);
  const RPS_pool_limit = (effectiveMaxConn / (dbConf.lat_ms / 1000.0));
  const RPS_db = Math.min(RPS_db_effective, RPS_pool_limit);

  const payloadBits = bitsFromKB(payloadKB);
  const bw = bitsPerSecond(bwMbps);
  const RPS_red = (payloadBits > 0) ? ((bw / payloadBits) * lp.net_mult) : Infinity;

  const RPS_cap_raw = Math.min(RPS_cpu, RPS_db, RPS_red);
  const RPS_cap = RPS_cap_raw * safety;
  const usuarios_conc = RPS_cap * (lat_ms_endpoint / 1000.0);

  const bottleneck = (RPS_cap_raw === RPS_cpu) ? "CPU/App" : (RPS_cap_raw === RPS_db) ? "Base de Datos/Conexiones" : "Red";

  const cloud = BASELINES.cloud_providers[cloudKey];
  const totalCores = totalCoresApp + coresDbPrimary + (dbReadReplicas * coresDbPrimary * 0.8);
  const costMonth = totalCores * cloud.cost_per_core_hour * 24 * 30;

  const out = `
<div class="kv">
  <div><strong>Latencia endpoint</strong></div><div>${lat_ms_endpoint.toFixed(0)} ms</div>
  <div><strong>Cores App totales</strong></div><div>${totalCoresApp.toFixed(1)}</div>
  <div><strong>Pool total App→DB</strong></div><div>${maxAppConn.toFixed(0)}</div>
  <div><strong>RPS CPU</strong></div><div>${RPS_cpu.toFixed(2)}</div>
  <div><strong>RPS DB</strong></div><div>${RPS_db.toFixed(2)}</div>
  <div><strong>RPS Red</strong></div><div>${isFinite(RPS_red) ? RPS_red.toFixed(2) : "∞"}</div>
  <div><strong>Saturación por</strong></div><div>${bottleneck}</div>
  <div><strong>RPS límite (Cap)</strong></div><div>${RPS_cap.toFixed(2)}</div>
  <div><strong>Costo Est. Mensual</strong></div><div style="color:var(--success)">$ ${costMonth.toFixed(2)} USD</div>
  <div><strong>Usuarios concurrentes ≈</strong></div><div>${usuarios_conc.toFixed(0)}</div>
</div>`;

  byId("out").innerHTML = out;
  updateCharts(RPS_cpu, RPS_db, RPS_red, RPS_cap);
  updateSugerencias(bottleneck, RPS_cap, RPS_cpu, RPS_db);

  const replExplain = (dbReplMode === "read_replicas" && dbReadReplicas > 0)
    ? `readCap=${readCap.toFixed(2)}; writeCap=${writeCap.toFixed(2)}; mixLecturas=${readRatioPct}% ⇒ cap_consultas=min(readCap/readRatio, writeCap/writeRatio)=${RPS_db_effective.toFixed(2)}`
    : `sin read replicas ⇒ cap_consultas=RPS_db_primary=${RPS_db_primary.toFixed(2)}`;

  const explain = `
<p><strong>Perfil:</strong> ${lp.label} | <strong>Arquitectura:</strong> ${arch.label} | <strong>DB:</strong> ${dbReplMode}</p>
<p><span class="code">
RPS_cpu=${RPS_cpu.toFixed(2)} | RPS_db=${RPS_db.toFixed(2)} | RPS_red=${isFinite(RPS_red) ? RPS_red.toFixed(2) : "∞"}<br>
${replExplain}<br>
Costo basado en ${totalCores.toFixed(1)} cores en ${cloud.label}.
</span></p>`;
  byId("explain").innerHTML = explain;
}

function resetForm() {
  populatePreset();
  ["os", "web_server", "runtime", "db", "container", "orchestrator", "cache", "cdn", "tls", "cloud_provider", "load_profile", "architecture", "scaling_strategy", "lb_mesh", "db_replication_mode", "connection_pool_profile", "endpoint_complexity"].forEach(id => {
    const el = byId(id);
    if (el) el.selectedIndex = 0;
  });
  updateHelpTexts();
  if (healthChart) {
    healthChart.destroy();
    healthChart = null;
  }
  byId("out").innerHTML = "";
  byId("explain").innerHTML = "";
  byId("sugerencias").innerHTML = "";
}

function saveScenario(key) {
  const data = {};
  document.querySelectorAll('select, input').forEach(el => {
    if (el.id) data[el.id] = el.value;
  });
  localStorage.setItem('scenario_' + key, JSON.stringify(data));
  const btn = byId('save' + key);
  const oldText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-check"></i> OK!';
  setTimeout(() => btn.innerHTML = oldText, 2000);
}

function loadScenario(key) {
  const raw = localStorage.getItem('scenario_' + key);
  if (!raw) return alert(`No hay escenario ${key} guardado.`);
  const data = JSON.parse(raw);
  Object.entries(data).forEach(([id, val]) => {
    const el = byId(id);
    if (el) el.value = val;
  });
  updateHelpTexts();
  calc();
}

function exportJSON() {
  const data = {
    timestamp: new Date().toISOString(),
    config: {},
    results: byId("out").innerText
  };
  document.querySelectorAll('select, input').forEach(el => {
    if (el.id) data.config[el.id] = el.value;
  });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `capacity-report-${Date.now()}.json`;
  a.click();
}

function exportPDF() { window.print(); }

function updateCharts(cpu, db, net, current) {
  const canvas = byId('healthChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const max = Math.max(cpu, db, net);
  const data = {
    labels: ['CPU', 'Database', 'Network'],
    datasets: [{
      label: 'Health',
      data: [(cpu / max) * 100, (db / max) * 100, (net / max) * 100],
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      borderColor: 'rgb(59, 130, 246)',
      pointBackgroundColor: 'rgb(59, 130, 246)'
    }]
  };
  if (healthChart) healthChart.destroy();
  healthChart = new Chart(ctx, {
    type: 'radar',
    data: data,
    options: {
      scales: { r: { suggestedMin: 0, suggestedMax: 100, ticks: { display: false } } },
      plugins: { legend: { display: false } }
    }
  });
}

function updateSugerencias(bottleneck, cap, cpu, db) {
  let html = '<div class="sugerencia-card"><h4><i class="fas fa-lightbulb"></i> Recomendación:</h4>';
  if (bottleneck === "CPU/App") html += '<p>Aumenta <strong>Réplicas App</strong> o <strong>Cores CPU</strong>.</p>';
  else if (bottleneck === "Base de Datos/Conexiones") html += '<p>Activa <strong>Read Replicas</strong> o <strong>Caché (Redis)</strong>.</p>';
  else html += '<p>Optimiza <strong>Payload</strong> o usa <strong>CDN</strong>.</p>';
  html += '</div>';
  byId("sugerencias").innerHTML = html;
}

async function boot() {
  const selects = ["os", "web_server", "runtime", "db", "container", "orchestrator", "cache", "cdn", "tls", "cloud_provider", "load_profile", "architecture", "scaling_strategy", "lb_mesh", "db_replication_mode", "connection_pool_profile", "endpoint_complexity"];
  const baselineMap = { "cloud_provider": BASELINES.cloud_providers, "connection_pool_profile": BASELINES.connection_pool };

  populatePreset();
  selects.forEach(id => {
    const data = baselineMap[id] || BASELINES[id];
    populateSelect(id, data);
    byId(id).addEventListener("change", updateHelpTexts);
  });

  byId("applyPreset").addEventListener("click", applyPreset);
  byId("calc").addEventListener("click", calc);
  byId("reset").addEventListener("click", resetForm);
  byId("saveA").addEventListener("click", () => saveScenario('A'));
  byId("saveB").addEventListener("click", () => saveScenario('B'));
  byId("loadA").addEventListener("click", () => loadScenario('A'));
  byId("loadB").addEventListener("click", () => loadScenario('B'));
  byId("exportJSON").addEventListener("click", exportJSON);
  byId("exportPDF").addEventListener("click", exportPDF);

  updateHelpTexts();
  applyPreset();
}

document.addEventListener("DOMContentLoaded", async () => {
  while (!window.BASELINES) await new Promise(r => setTimeout(r, 50));
  boot();
});
