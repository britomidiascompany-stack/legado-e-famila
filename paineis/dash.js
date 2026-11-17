/* Motor mínimo dos painéis: lê os dados de window.DASH_DATA, guarda os filtros e redesenha cada [data-draw]. */
(function () {
  var DATA = window.DASH_DATA || {}, P = Object.assign({}, window.DASH_PARAMS || {}), INI = Object.assign({}, P);
  var onFns = [], draws = {}, ready = false, timer = null;
  function safe(fn, arg) { try { fn(arg); } catch (e) { console.error(e); } }
  function render() {
    if (!ready) return;
    onFns.forEach(function (fn) { safe(fn); });
    var feitos = new Set();
    for (var pass = 0; pass < 4; pass++) {
      var novo = false;
      Object.keys(draws).forEach(function (n) {
        document.querySelectorAll('[data-draw="' + n + '"]').forEach(function (el) {
          if (feitos.has(el)) return;
          feitos.add(el); novo = true; safe(draws[n], el);
        });
      });
      if (!novo) break;
    }
  }
  window.dash = {
    data: function (id) {
      var d = DATA[id];
      if (!d) return {status: 'missing', data: [], columns: [], message: '', refreshing: false, truncated: false, meta: null};
      return {status: 'ok', data: d, columns: d.length ? Object.keys(d[0]) : [], message: '', refreshing: false, truncated: false, meta: null};
    },
    params: function () { return Object.assign({}, P); },
    setParams: function (o) { Object.assign(P, o); render(); },
    resetParams: function () { P = Object.assign({}, INI); render(); },
    onData: function (fn) { onFns.push(fn); if (ready) safe(fn); },
    draw: function (n, fn) { draws[n] = fn; if (ready) render(); },
    setLink: function (id) { try { history.replaceState(null, '', '#' + id); } catch (e) {} },
    colors: ['#7C3AED', '#A78BFA', '#3B0F73', '#5B21B6', '#DDD6FE'],
    refresh: function () {}, calc: function () {}, loader: function () {}
  };
  document.addEventListener('DOMContentLoaded', function () { ready = true; render(); });
  var w = window.innerWidth;
  window.addEventListener('resize', function () {
    if (window.innerWidth === w) return; w = window.innerWidth;
    clearTimeout(timer); timer = setTimeout(render, 150);
  });
})();
