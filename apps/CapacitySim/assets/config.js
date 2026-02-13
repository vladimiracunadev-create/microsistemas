/**
 * Configuración base del simulador.
 * Carga asíncrona de los perfiles de rendimiento desde un JSON externo.
 */
window.BASELINES = null;
window.__baselinesReady = (async function () {
  // Carga asíncrona de la configuración base desde JSON
  // Se usa timestamp para evitar caché del navegador
  const resp = await fetch('./data/baselines.json?t=' + Date.now());
  window.BASELINES = await resp.json();
  return window.BASELINES;
})();
