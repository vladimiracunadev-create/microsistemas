/* global BASELINES, Chart */
/**
 * Lógica principal del simulador de capacidad.
 * Maneja la interacción con el DOM, cálculos de RPS y visualización de resultados.
 */
const byId = (id) => document.getElementById(id);

//
// Lógica principal del simulador de capacidad.
// Maneja la interacción con el DOM, cálculos de RPS y visualización de resultados.
//

//
// Lógica principal del simulador de capacidad.
// Maneja la interacción con el DOM, cálculos de RPS y visualización de resultados.
//


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

/**
 * Actualiza los textos de ayuda contextual basados en la selección actual.
 */
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

/**
 * Realiza el cálculo de capacidad basado en los parámetros ingresados.
 * Aplica fórmulas heurísticas para estimar RPS, cuellos de botella y costos.
 */
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
  // --------------------------------------------------------------------------
  // CÁLCULO DE CAPACIDAD (ALGORITMO HEURÍSTICO)
  // --------------------------------------------------------------------------
  // 1. Obtener Latencia Base:
  //    Se parte de la latencia base del punto final (endpoint) seleccionado.
  //    A esto se suman penalizaciones por arquitectura (microservicios suman latencia de red interna),
  //    balanceadores de carga y "cold starts" si aplica (serverless).
  let latEndpoint = BASELINES.endpoint_complexity[endpoint].lat_ms;
  latEndpoint = (latEndpoint * BASELINES.load_profile[loadProfile].lat_factor)
    + BASELINES.architecture[archKey].lat_add_ms
    + (BASELINES.architecture[archKey].avg_cold_start_ms || 0)
    + (BASELINES.scaling_strategy[scaleKey].lat_add_ms || 0)
    + (BASELINES.lb_mesh[lbKey].lat_add_ms || 0);

  // 2. Multiplicador de Infraestructura:
  //    Cada capa tecnológica (OS, Web Server, Container, etc.) tiene un factor de rendimiento.
  //    Un factor < 1.0 implica degradación (overhead), > 1.0 implica optimización.
  //    Se multiplican todos para obtener un factor global de eficiencia del stack.
  const infraMult = (BASELINES.os[os]?.mult || 1) *
    (BASELINES.web_server[web]?.mult || 1) *
    (BASELINES.container[container]?.mult || 1) *
    (BASELINES.orchestrator[orch]?.mult || 1) *
    (BASELINES.cache[cache]?.mult || 1) *
    (BASELINES.cdn[cdn]?.mult || 1) *
    (BASELINES.tls[tls]?.mult || 1) *
    (BASELINES.architecture[archKey]?.mult || 1) *
    (BASELINES.scaling_strategy[scaleKey]?.app_mult || 1) *
    (BASELINES.lb_mesh[lbKey]?.app_mult || 1);

  // 3. Cálculo de RPS (Requests Per Second) por CPU:
  //    Se toma el RPS base del runtime (ej. Node.js vs PHP) y se ajusta por:
  //    - Multiplicador de infraestructura calculado arriba.
  //    - Perfil de carga (cargas CPU-bound reducen drásticamente este valor).
  //    - Latencia inversa: A mayor latencia por request, menos requests por segundo puede procesar un hilo bloqueante.
  const rpsCoreBase = BASELINES.runtime[runtime].rps_per_core_base;
  const rpsCoreAdj = rpsCoreBase * infraMult * BASELINES.load_profile[loadProfile].cpu_mult * (100.0 / latEndpoint);

  // RPS Total de Aplicación (limitado por CPU):
  const totalCoresApp = coresPerInstance * Math.max(1, appReplicas);
  const rpsCpu = totalCoresApp * rpsCoreAdj;

  // 4. Cálculo de Cuello de Botella en Base de Datos:
  //    - Se calcula cuántas conexiones máximas puede manejar la BD primaria basada en sus cores.
  //    - Se estima el RPS máximo de la BD (Primary) dividiendo las conexiones por la latencia de transacción.
  const dbConf = BASELINES.db[db];
  const connMaxPrimary = dbConf.conn_per_core * coresDbPrimary;
  const rpsDbPrimary = (connMaxPrimary / (dbConf.lat_ms / 1000.0)) * BASELINES.load_profile[loadProfile].db_mult;

  //    - Si hay Réplicas de Lectura, se divide la carga:
  //      El tráfico de lectura (definido por readRatio) se reparte entre Primary + Réplicas.
  //      El tráfico de escritura siempre va al Primary.
  //      La capacidad efectiva es el menor valor entre el límite de escrituras y el límite de lecturas expandido.
  let rpsDbEffective = rpsDbPrimary;
  // readRatio and writeRatio are already defined above
  // const readRatio = clamp(readRatioPct, 0, 100) / 100.0;
  // const writeRatio = 1.0 - readRatio;

  if (dbReplMode === "read_replicas" && dbReadReplicas > 0) {
    const readCap = rpsDbPrimary * (1 + dbReadReplicas);
    const writeCap = rpsDbPrimary;

    // Capacidad limitada por lectura o escritura según el ratio
    const limRead = (readRatio > 0) ? (readCap / readRatio) : Infinity;
    const limWrite = (writeRatio > 0) ? (writeCap / writeRatio) : Infinity;
    rpsDbEffective = Math.min(limRead, limWrite);
  }

  // 5. Límite por Pool de Conexiones de Aplicación:
  //    A veces el cuello de botella no es la BD, sino la configuración del pool en la App.
  //    Si la app solo abre 50 conexiones, no importa si la BD soporta 5000.
  const poolProfile = BASELINES.connection_pool[poolProfileKey];
  const poolPerInst = (poolProfile?.pool_per_instance || 50);
  // Permitir override manual si existe lógica de UI para ello (aquí simplificado)
  const poolUser = parseInt(byId("pool_per_instance")?.value || 0);
  const finalPoolPerInst = (poolUser > 0) ? poolUser : poolPerInst;

  const maxAppConn = finalPoolPerInst * Math.max(1, appReplicas);
  const effectiveMaxConn = Math.min(dbConnHard, maxAppConn);
  const rpsPoolLimit = (effectiveMaxConn / (dbConf.lat_ms / 1000.0));

  // El RPS final de base de datos es el mínimo entre la capacidad física de la BD y el límite del pool.
  const rpsDb = Math.min(rpsDbEffective, rpsPoolLimit);

  const payloadBits = bitsFromKB(payloadKB);
  const bw = bitsPerSecond(bwMbps);
  const RPS_red = (payloadBits > 0) ? ((bw / payloadBits) * lp.net_mult) : Infinity;

  const RPS_cap_raw = Math.min(rpsCpu, rpsDb, RPS_red);
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

/**
 * Actualiza el gráfico de radar mostrando la salud del sistema en 3 ejes:
 * CPU, Base de Datos y Red.
 */
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
