/* Motor mínimo dos painéis: lê os dados de window.DASH_DATA, guarda os filtros e redesenha cada [data-draw]. */
(function () {
  var DATA = window.DASH_DATA || {}, P = Object.assign({}, window.DASH_PARAMS || {}), INI = Object.assign({}, P);
  var onFns = [], draws = {}, ready = false, timer = null;
  function safe(fn, arg) { try { fn(arg); } catch (e) { console.error(e); } }
  /* Um desenho é uma função (redesenha sempre) ou {mount, update} (monta uma vez, depois só atualiza). */
  var montados = new WeakMap();
  function pinta(n, el) {
    var d = draws[n];
    if (typeof d === 'function') { safe(d, el); return; }
    if (!d) return;
    if (!montados.has(el)) { el.replaceChildren(); try { montados.set(el, d.mount ? d.mount(el) : null); } catch (e) { console.error(e); return; } }
    if (d.update) { try { d.update(montados.get(el), el); } catch (e) { console.error(e); } }
  }
  function render() {
    if (!ready) return;
    onFns.forEach(function (fn) { safe(fn); });
    var feitos = new Set();
    for (var pass = 0; pass < 4; pass++) {
      var novo = false;
      Object.keys(draws).forEach(function (n) {
        document.querySelectorAll('[data-draw="' + n + '"]').forEach(function (el) {
          if (feitos.has(el)) return;
          feitos.add(el); novo = true; pinta(n, el);
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
    draw: function (n, fn) {
      if (fn === undefined) { if (ready) document.querySelectorAll('[data-draw="' + n + '"]').forEach(function (el) { pinta(n, el); }); return; }
      draws[n] = fn; if (ready) render();
    },
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
