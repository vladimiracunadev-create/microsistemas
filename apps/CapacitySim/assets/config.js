window.BASELINES = null;
window.__baselinesReady = (async function(){
  const resp = await fetch('./data/baselines.json');
  window.BASELINES = await resp.json();
  return window.BASELINES;
})();
