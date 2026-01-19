window.BASELINES = null;
window.__baselinesReady = (async function () {
  const resp = await fetch('./data/baselines.json?t=' + Date.now());
  window.BASELINES = await resp.json();
  return window.BASELINES;
})();
