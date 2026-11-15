/* Trump Claims Map: the Matrix workspace.
   An adjacency heatmap for reading who is linked to whom. Three zones: the names in the view (left rail, which is also the row axis),
   the heatmap on canvas (centre), and a case file (right). app.js hands over its data and helpers through TCMMatrix.init(). */
(function () {
  'use strict';
  var A = null;   // helpers and data from app.js
  var S = { mode: 'names', order: 'group', sel: null, name: null, hover: null, data: null, off: {}, q: '', size: 0, focus: 0, L: null, cur: null };
  var GROUPS = ['Family', 'Officials & Agencies', 'Companies & Ventures', 'Funds & Investors', 'Foreign States'];
  var GCOL = ['#e8b25c', '#7ea6f2', '#58c2b4', '#a5cf6b', '#ee907c'], HUBCOL = '#e9eef5';
  var TCOL = ['#7f9bc4', '#6aa9a0', '#a09d62', '#c29a5a', '#c08570', '#b67f97', '#9686bb', '#7aa586', '#8a96a4'];
  /* One sequential ramp, five steps, dark to luminous. */
  var RAMP = ['', '#27507f', '#2f7fc0', '#3fb7d4', '#a3e6c6', '#fff2a8'];
  var P = { bg: '#0d131b', field: '#111a25', block: '#172536', hubf: '#141f2c', diag: '#34475f', ink: '#e8edf4', ink2: '#9aa8ba', ink3: '#66758a', bar: '#4d6380', barHi: '#dfe7f1', unv: '#b9a4ea', sel: '#ffcf70', sep: '#0d131b' };
  var GAP = 6, HUBGAP = 9, MINC = 11;
  function $(id) { return document.getElementById(id); }
  function step(v) { return v >= 5 ? 5 : v; }
  function tstep(v) { return v >= 8 ? 5 : v >= 5 ? 4 : v >= 3 ? 3 : v; }
  function lab(e) { return A.mapLabel(e); }

  function group(e, hub) {
    var role = e.role || '', text = e.name + ' ' + role;
    if (e.type === 'country') return 4;
    if (e.type === 'person') {
      var fam = hub && e.adj.get(hub.key);
      if ((fam && fam.kind === 'rel' && fam.rels.some(function (r) { return r.type === 'family'; })) || /\bTrump\b/.test(e.name)) return 0;
      if (/\b(secretary|attorney general|envoy|chair(man)? of|sec chair|commissioner|czar|senator|sen\.|representative|rep\.|nominee|comptroller|ambassador|adviser to the president|white house)\b/i.test(role)) return 1;
      if (/\b(sheikh|emir|crown prince|minister|king)\b/i.test(text)) return 4;
      return /\b(invest|fund|financier|billionaire|backer|venture|capital)\w*/i.test(role) ? 3 : 2;
    }
    var foreign = /\b(uae|emirat\w+|abu dhabi|dubai|saudi\w*|qatar\w*|kuwait\w*|pakistan\w*|sovereign)\b/i.test(text);
    if (e.type === 'government') return foreign ? 4 : 1;
    if (e.type === 'fund') return foreign ? 4 : 3;
    return 2;
  }
  function relsOf(a, b) { var l = a.adj.get(b.key); return l && l.kind === 'rel' ? l.rels : []; }
  function cnt(a, b) { return relsOf(a, b).filter(function (r) { return !r.alleged; }).length; }
  function alg(a, b) { return relsOf(a, b).filter(function (r) { return r.alleged; }).length; }
  function inTopic(e, t) { return e.cl.filter(function (c) { return c.topicRef === t; }); }
  function years(rr) {
    var lo = 9999, hi = 0;
    rr.forEach(function (r) { (String(r.date || '').match(/\d{4}/g) || []).forEach(function (y) { y = +y; if (y > 1900 && y < 2100) { lo = Math.min(lo, y); hi = Math.max(hi, y); } }); });
    return hi ? (lo === hi ? String(lo) : lo + ' to ' + hi) : '';
  }
  /* Evidence grade of one link: alleged and unverified, resting only on single-source checks, or documented. */
  function grade(r) {
    if (r.alleged) return ['unv', 'Unverified'];
    var cl = r.claims.map(function (id) { return A.byKey.get(id); }).filter(Boolean);
    return cl.length && cl.every(function (c) { return c.single_source; }) ? ['single', 'Single-source'] : ['doc', 'Documented'];
  }

  function data() {
    if (S.data) return S.data;
    var hub = A.ranked[0] && A.ranked[0].type === 'person' ? A.ranked[0] : null;
    var ok = { person: 1, company: 1, fund: 1, government: 1, country: 1 };
    var all = A.ranked.filter(function (e) { return ok[e.type] && e !== hub && !e.unverified_only && lab(e).length <= 22; }).slice(0, 110);
    all.forEach(function (e) { if (e.mxg == null) e.mxg = group(e, hub); });
    var allSet = new Set(all);
    function partners(e, set) { var c = 0; e.adj.forEach(function (l, k) { if (l.kind === 'rel' && !l.unv && set.has(A.byKey.get(k))) c++; }); return c; }
    all.forEach(function (e) { e.mxp = partners(e, allSet); });
    all.sort(function (a, b) { return b.mxp - a.mxp || a.rank - b.rank; });
    var names = all.filter(function (e) { return !S.off[e.mxg]; }).slice(0, Math.max(8, (S.size || 48) - (hub ? 1 : 0)));
    var N = names.length;
    function vec(e) { return names.map(function (o) { return o === e ? 0 : cnt(e, o) + alg(e, o); }); }
    var V = new Map(); names.forEach(function (e) { V.set(e, vec(e)); });
    function sim(a, b) { var va = V.get(a), vb = V.get(b), d = 0, na = 0, nb = 0; for (var i = 0; i < N; i++) { d += va[i] * vb[i]; na += va[i] * va[i]; nb += vb[i] * vb[i]; } return (na && nb ? d / Math.sqrt(na * nb) : 0) + (cnt(a, b) ? 0.6 + 0.1 * cnt(a, b) : 0); }
    var order = [];
    if (S.order === 'connected') order = names.slice();
    else if (S.order === 'alpha') order = names.slice().sort(function (a, b) { return lab(a).localeCompare(lab(b)); });
    else GROUPS.forEach(function (g, gi) {   // inside a group, names with similar links sit next to each other, so related names form blocks
      var grp = names.filter(function (e) { return e.mxg === gi; }); if (!grp.length) return;
      var cur = grp.shift(); order.push(cur);
      while (grp.length) { var bi = 0, bs = -1; grp.forEach(function (e, i) { var s = sim(cur, e); if (s > bs) { bs = s; bi = i; } }); cur = grp.splice(bi, 1)[0]; order.push(cur); }
    });
    if (hub) { hub.mxg = -1; order.unshift(hub); }
    var index = new Map(); order.forEach(function (e, i) { index.set(e, i); });
    var n = order.length, C = [], U = [];
    order.forEach(function (a, i) { C[i] = []; U[i] = []; order.forEach(function (b, j) { C[i][j] = i === j ? 0 : cnt(a, b); U[i][j] = i === j ? 0 : alg(a, b); }); });
    order.forEach(function (e, i) {
      e.mxt = e.lines.filter(function (r) { return !r.alleged; }).length;
      e.mxs = C[i].reduce(function (s, v) { return s + v; }, 0);
      e.mxn = C[i].filter(function (v) { return v > 0; }).length;
    });
    var grouped = S.order === 'group', segs = [], i0 = 0;
    if (hub) { segs.push({ g: -1, from: 0, to: 1 }); i0 = 1; }
    if (grouped) for (var a = i0; a < n;) { var b = a; while (b < n && order[b].mxg === order[a].mxg) b++; segs.push({ g: order[a].mxg, from: a, to: b }); a = b; }
    else if (n > i0) segs.push({ g: 9, from: i0, to: n });
    var tops = A.topics.filter(function (t) { return t.id !== 'other'; });
    var gcount = GROUPS.map(function (g, gi) { return names.filter(function (e) { return e.mxg === gi; }).length; });
    return (S.data = { names: order, hub: hub, index: index, C: C, U: U, segs: segs, grouped: grouped, topics: tops, gcount: gcount });
  }

  // ------------------------------------------------------------------ layout
  var canvas, ctx, dpr = 1;
  function fontOf(px, w) { return (w || 400) + ' ' + px + 'px "Public Sans", system-ui, sans-serif'; }
  function layout() {
    var D = data(), plot = $('mx-plot'), mxEl = $('matrix'), H = plot.clientHeight, byT = S.mode === 'topics';
    var W = mxEl.clientWidth - $('mx-rail').offsetWidth - (mxEl.clientWidth < 1200 ? 320 : 380);   // the widest the plot may be
    var n = D.names.length, cols = byT ? D.topics : D.names, nc = cols.length;
    var HEAD = 114, BARS = 24, BR = 7, RIGHT = 62, y0 = HEAD + BARS + BR, x0 = 8;
    var rgap = 0; D.segs.forEach(function (s, q) { if (q) rgap += D.segs[q - 1].g === -1 ? HUBGAP : GAP; });
    var availH = H - y0 - 12, availW = W - x0 - RIGHT - 12;
    var ch = Math.floor((availH - rgap) / Math.max(1, n)), cw;
    if (byT) { ch = Math.max(9, Math.min(22, ch)); cw = Math.max(40, Math.min(84, Math.floor(availW / nc))); }
    else { ch = Math.max(9, Math.min(22, ch, Math.floor((availW - rgap) / Math.max(1, n)))); cw = ch; }
    function place(count, segs, size) {
      var pos = [], p = 0, out = [];
      segs.forEach(function (s, q) {
        if (q) p += segs[q - 1].g === -1 ? HUBGAP : GAP;
        var p0 = p; for (var i = s.from; i < s.to; i++) { pos[i] = p; p += size; }
        out.push({ g: s.g, from: s.from, to: s.to, p0: p0, p1: p });
      });
      return { pos: pos, segs: out, len: p };
    }
    var R = place(n, D.segs, ch), Cc = byT ? place(nc, [{ g: 9, from: 0, to: nc }], cw) : place(n, D.segs, cw);
    W = Math.min(W, x0 + Cc.len + RIGHT + 12); mxEl.style.setProperty('--mx-w', W + 'px');   // the plot takes the width it needs; the case file takes the rest
    var rmax = 1, cmax = 1, csum = [];
    if (byT) { D.names.forEach(function (e, i) { if (!D.hub || i) rmax = Math.max(rmax, e.cl.length); }); D.topics.forEach(function (t, j) { csum[j] = D.names.filter(function (e) { return inTopic(e, t).length; }).length; cmax = Math.max(cmax, csum[j]); }); }
    else { D.names.forEach(function (e, i) { if (!D.hub || i) rmax = Math.max(rmax, e.mxs); csum[i] = e.mxs; }); cmax = rmax; }
    S.L = { W: W, H: H, x0: x0, y0: y0, cw: cw, ch: ch, R: R, C: Cc, cols: cols, HEAD: HEAD, BARS: BARS, BR: BR, RIGHT: RIGHT, rmax: rmax, cmax: cmax, csum: csum, byT: byT };
    dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }
  function matchSet(D) {
    var q = S.q.trim().toLowerCase(); if (!q) return null;
    return D.names.map(function (e) { return (e.name + ' ' + lab(e)).toLowerCase().indexOf(q) >= 0; });
  }
  function wrap2(c, text, maxw) {
    var words = text.split(' '), lines = [''], k = 0;
    words.forEach(function (w) { var t = lines[k] ? lines[k] + ' ' + w : w; if (c.measureText(t).width > maxw && lines[k]) { lines[++k] = w; } else lines[k] = t; });
    return lines;
  }
  function draw() {
    var L = S.L, D = S.data; if (!L || !D || !ctx) return;
    var c = ctx, byT = L.byT, n = D.names.length, nc = L.cols.length, cw = L.cw, ch = L.ch, x0 = L.x0, y0 = L.y0, R = L.R, C = L.C;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, L.W, L.H);
    var ms = matchSet(D), fi = S.name && D.index.has(S.name) ? D.index.get(S.name) : -1;
    var hi = S.hover ? S.hover.i : -1, hj = S.hover ? S.hover.j : -1;
    var si = -1, sj = -1;
    if (S.sel && D.index.has(S.sel.a)) { si = D.index.get(S.sel.a); sj = byT ? D.topics.indexOf(S.sel.b) : D.index.has(S.sel.b) ? D.index.get(S.sel.b) : -1; if (sj < 0) si = -1; }
    // the field: quiet blocks, a little lighter where a group meets itself
    R.segs.forEach(function (rs) { C.segs.forEach(function (cs) {
      c.fillStyle = !byT && D.grouped && rs.g === cs.g && rs.g >= 0 ? P.block : rs.g === -1 || cs.g === -1 ? P.hubf : P.field;
      c.fillRect(x0 + cs.p0, y0 + rs.p0, cs.p1 - cs.p0 - 1, rs.p1 - rs.p0 - 1);
    }); });
    // cells
    c.textAlign = 'center'; c.textBaseline = 'middle';
    for (var i = 0; i < n; i++) {
      var a = D.names[i], y = y0 + R.pos[i];
      for (var j = 0; j < nc; j++) {
        var x = x0 + C.pos[j], v, u = 0, al = 1;
        if (byT) v = inTopic(a, L.cols[j]).length; else { v = D.C[i][j]; u = D.U[i][j]; }
        if (fi >= 0 && !(i === fi || (!byT && j === fi))) al = 0.22;
        if (ms && !(ms[i] || (!byT && ms[j]))) al *= 0.18;
        if (!byT && i === j) { c.globalAlpha = al; c.fillStyle = P.diag; c.fillRect(x, y, cw - 1, ch - 1); continue; }
        if (!v && !u) continue;
        c.globalAlpha = al;
        if (v) {
          var st = byT ? tstep(v) : step(v);
          c.fillStyle = RAMP[st]; c.fillRect(x, y, cw - 1, ch - 1);
          if ((byT && ch >= 11) || (!byT && cw >= 17 && v > 1)) { c.font = fontOf(Math.min(11, ch - 1), 600); c.fillStyle = st >= 3 ? '#0b1420' : '#e8f0fa'; c.fillText(String(v), x + (cw - 1) / 2, y + (ch - 1) / 2 + 0.5); }
          if (u) { c.fillStyle = P.unv; c.beginPath(); var k = Math.min(6, Math.round(cw * 0.5)); c.moveTo(x + cw - 1 - k, y); c.lineTo(x + cw - 1, y); c.lineTo(x + cw - 1, y + k); c.closePath(); c.fill(); }
        } else { c.strokeStyle = P.unv; c.lineWidth = 1.2; c.strokeRect(x + 1.1, y + 1.1, cw - 3.2, ch - 3.2); }
      }
    }
    c.globalAlpha = 1;
    // margins: links per name along the top and the right edge
    var yb = y0 - L.BR - 2, bh = L.BARS - 5, xb = x0 + C.len + 7, bw = 26;
    c.fillStyle = '#1c2836'; c.fillRect(x0, yb, C.len - 1, 1); c.fillRect(xb - 1, y0, 1, R.len - 1);
    for (j = 0; j < nc; j++) {
      var cv = L.csum[j], over = cv > L.cmax, h = Math.max(cv ? 1 : 0, Math.round(bh * Math.min(1, cv / L.cmax)));
      c.fillStyle = j === hj || (!byT && j === fi) || (!byT && j === sj) ? P.barHi : P.bar;
      c.globalAlpha = ms && !byT && !ms[j] ? 0.3 : 1;
      var bx = byT ? Math.round((cw - 1 - 22) / 2) : 0; c.fillRect(x0 + C.pos[j] + bx, yb - h, byT ? 22 : cw - 1, h);
      if (over) { c.fillStyle = P.bg; c.fillRect(x0 + C.pos[j] - 1, yb - h + 4, cw + 1, 1.5); }
    }
    c.textAlign = 'left'; c.font = fontOf(Math.min(10.5, ch), 400);
    for (i = 0; i < n; i++) {
      var rv = byT ? D.names[i].cl.length : D.names[i].mxs, w = Math.max(rv ? 1 : 0, Math.round(bw * Math.min(1, rv / L.rmax))), on = i === hi || i === fi || i === si;
      c.globalAlpha = ms && !ms[i] ? 0.3 : 1;
      c.fillStyle = on ? P.barHi : P.bar; c.fillRect(xb, y0 + R.pos[i], w, ch - 1);
      if (rv > L.rmax) { c.fillStyle = P.bg; c.fillRect(xb + w - 5, y0 + R.pos[i] - 1, 1.5, ch + 1); }
      c.fillStyle = on ? P.ink : P.ink3; c.fillText(String(rv), xb + w + 5, y0 + R.pos[i] + (ch - 1) / 2 + 0.5);
    }
    c.globalAlpha = 1;
    c.fillStyle = P.ink3; c.font = fontOf(10.5, 400); c.textBaseline = 'alphabetic';
    c.fillText(byT ? 'Checks' : 'Links in view', xb, yb + 1);
    // group brackets on both axes
    function bracket(segs, pos, size, horiz, items) {
      segs.forEach(function (s) {
        if (s.g === 9) { for (var q = s.from; q < s.to; q++) { c.fillStyle = byT && horiz ? TCOL[q % 9] : GCOL[items[q].mxg] || HUBCOL; if (horiz) c.fillRect(x0 + pos[q], y0 - 5, size - 1, 2); else c.fillRect(x0 - 5, y0 + pos[q], 2, size - 1); } return; }
        c.fillStyle = s.g === -1 ? HUBCOL : GCOL[s.g];
        if (horiz) c.fillRect(x0 + s.p0, y0 - 5, s.p1 - s.p0 - 1, 2); else c.fillRect(x0 - 5, y0 + s.p0, 2, s.p1 - s.p0 - 1);
      });
    }
    bracket(C.segs, C.pos, cw, true, L.cols); bracket(R.segs, R.pos, ch, false, D.names);
    // cross-hair
    function band(i2, j2, fill) {
      c.fillStyle = fill;
      if (i2 >= 0) c.fillRect(0, y0 + R.pos[i2] - 0.5, xb + bw + 30, ch);
      if (j2 >= 0) c.fillRect(x0 + C.pos[j2] - 0.5, 4, cw, y0 + R.len - 4);
    }
    if (fi >= 0) band(fi, byT ? -1 : fi, 'rgba(255, 207, 112, .10)');
    if (hi >= 0 || hj >= 0) band(hi, hj, 'rgba(255, 255, 255, .075)');
    function box(i2, j2, col, lw) { c.strokeStyle = col; c.lineWidth = lw; c.strokeRect(x0 + C.pos[j2] - lw / 2 - 0.5, y0 + R.pos[i2] - lw / 2 - 0.5, cw + lw, ch + lw); }
    if (si >= 0) { box(si, sj, P.sel, 2); if (!byT) box(sj, si, 'rgba(255, 207, 112, .55)', 1); }
    if (hi >= 0 && hj >= 0) box(hi, hj, '#ffffff', 1.5);
    if (S.cur && document.activeElement === canvas && S.cur.i < n && S.cur.j < nc) box(S.cur.i, S.cur.j, '#8fb8ff', 2);
    // column labels
    var ly = y0 - L.BR - L.BARS - 4;
    if (byT) {
      c.textAlign = 'center'; c.textBaseline = 'alphabetic';
      for (j = 0; j < nc; j++) {
        var hot = j === hj || j === sj; c.font = fontOf(11, hot ? 600 : 500); c.fillStyle = hot ? '#ffffff' : P.ink2;
        var lines = wrap2(c, L.cols[j].name, cw - 6).slice(0, 4);
        lines.forEach(function (t, q) { c.fillText(t, x0 + C.pos[j] + (cw - 1) / 2, ly - (lines.length - 1 - q) * 13.5); });
      }
    } else {
      var fs = Math.max(10, Math.min(11.5, cw - 1)); c.textAlign = 'left'; c.textBaseline = 'middle';
      for (j = 0; j < nc; j++) {
        var hot2 = j === hj || j === fi || j === sj || j === si, dim = (ms && !ms[j]) || (fi >= 0 && !hot2 && !D.C[fi][j] && !D.U[fi][j]);
        c.save(); c.translate(x0 + C.pos[j] + (cw - 1) / 2 + 1, ly); c.rotate(-1.2);
        c.font = fontOf(fs, hot2 || !j && D.hub ? 600 : 400); c.fillStyle = hot2 ? (j === fi || j === sj || j === si ? P.sel : '#ffffff') : !j && D.hub ? P.ink : P.ink2; c.globalAlpha = dim ? 0.38 : 1;
        c.fillText(lab(D.names[j]), 0, 0); c.restore();
      }
    }
  }
  var raf = 0;
  function redraw() { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; draw(); railMarks(); }); }

  // ------------------------------------------------------------------ the rail
  function railTop() {
    var D = data();
    $('mx-groups').innerHTML = GROUPS.map(function (g, gi) {
      var on = !S.off[gi];
      return '<button type="button" class="mx-gt" data-g="' + gi + '" aria-pressed="' + on + '" title="' + (on ? 'Hide' : 'Show') + ' ' + A.esc(g) + '"><i style="--c:' + GCOL[gi] + '"></i><span>' + A.esc(g) + '</span><b>' + (on ? D.gcount[gi] : 'Off') + '</b></button>';
    }).join('');
  }
  function railRows() {
    var D = data(), L = S.L, el = $('mx-rows'), tmax = 1;
    D.names.forEach(function (e, i) { if (!D.hub || i) tmax = Math.max(tmax, e.mxt); });
    var fs = Math.max(10, Math.min(12.5, L.ch - 0.5));
    el.style.fontSize = fs + 'px';
    el.innerHTML = D.names.map(function (e, i) {
      return '<button type="button" class="mx-row' + (!i && D.hub ? ' hub' : '') + '" data-n="' + i + '" style="top:' + (L.y0 + L.R.pos[i]) + 'px;height:' + L.ch + 'px" title="' + A.esc(e.name) + ', ' + A.plural(e.mxt, 'documented link') + ' in all">' +
        '<span>' + A.esc(lab(e)) + '</span><i><b style="width:' + Math.max(4, Math.round(100 * Math.min(1, e.mxt / tmax))) + '%"></b></i></button>';
    }).join('');
    S.rowEls = Array.prototype.slice.call(el.children);
    railMarks();
  }
  function railMarks() {
    var D = S.data, els = S.rowEls; if (!els || !D || els.length !== D.names.length) return;
    var ms = matchSet(D), fi = S.name && D.index.has(S.name) ? D.index.get(S.name) : -1, hi = S.hover ? S.hover.i : -1;
    var si = S.sel && D.index.has(S.sel.a) ? D.index.get(S.sel.a) : -1, sj = S.sel && S.mode !== 'topics' && D.index.has(S.sel.b) ? D.index.get(S.sel.b) : -1;
    els.forEach(function (b, i) {
      b.className = 'mx-row' + (!i && D.hub ? ' hub' : '') + (i === hi ? ' hl' : '') + (i === fi || i === si || i === sj ? ' on' : '') + (ms && !ms[i] ? ' dim' : '') +
        (fi >= 0 && i !== fi && S.mode !== 'topics' && !D.C[fi][i] && !D.U[fi][i] ? ' far' : '');
    });
  }

  // ------------------------------------------------------------------ readout and key
  function keyHtml() {
    var byT = S.mode === 'topics', labs = byT ? ['1', '2', '3 to 4', '5 to 7', '8 or more'] : ['1', '2', '3', '4', '5 or more'];
    return '<span class="kl">' + (byT ? 'Checks that mention the name' : 'Documented links') + '</span>' + labs.map(function (t, q) { return '<span><i style="background:' + RAMP[q + 1] + '"></i>' + t + '</span>'; }).join('') +
      (byT ? '' : (hasUnv(true) ? '<span class="ku"><i class="m"></i>Also unverified links</span>' : '') + (hasUnv() ? '<span class="ku"><i class="u"></i>Unverified only</span>' : ''));
  }
  /* A violet corner marks a pair that also has alleged, unverified links; a hollow violet cell is a pair with nothing else. The key lists each only when the view holds a pair whose every link is alleged and unverified. */
  function hasUnv(mixed) { var D = S.data; return !!D && D.names.some(function (e, i) { return D.U[i].some(function (u, j) { return u && !D.C[i][j] === !mixed; }); }); }
  function readout() {
    var el = $('mx-read'), D = S.data, h = S.hover, byT = S.mode === 'topics';
    if (!D) return;
    if (!h || h.i < 0 && h.j < 0) {
      el.innerHTML = A.narrow.matches ? '' : byT ? 'Hover a cell to read it. Select it to list the checks.' : 'Hover a cell to read the pair. Select it to open the evidence.';
      return;
    }
    var a = D.names[h.i >= 0 ? h.i : h.j], t = '';
    if (h.i < 0 || h.j < 0 || (!byT && h.i === h.j)) {
      if (byT && h.i < 0) { var tp = D.topics[h.j]; t = '<b>' + A.esc(tp.name) + '</b><span>' + A.plural(tp.list.length, 'check') + ', ' + S.L.csum[h.j] + ' of the ' + D.names.length + ' names here appear in them</span>'; }
      else t = '<b>' + A.esc(lab(a)) + '</b><span>' + (a.mxg >= 0 ? A.esc(GROUPS[a.mxg]) + ', ' : '') + A.plural(a.mxt, 'documented link') + ' in all, ' + a.mxs + ' with ' + A.plural(a.mxn, 'name') + ' in this view</span>';
    } else if (byT) {
      var n = inTopic(a, D.topics[h.j]).length;
      t = '<b>' + A.esc(lab(a)) + '</b><em>in</em><b>' + A.esc(D.topics[h.j].name) + '</b><span>' + (n ? A.plural(n, 'check') : 'No checks') + '</span>';
    } else {
      var b = D.names[h.j], v = D.C[h.i][h.j], u = D.U[h.i][h.j], yr = years(relsOf(a, b).filter(function (r) { return !r.alleged; }));
      t = '<b>' + A.esc(lab(a)) + '</b><em>×</em><b>' + A.esc(lab(b)) + '</b><span>' + (v ? A.plural(v, 'documented link') + (yr ? ', ' + yr : '') : u ? 'No documented link' : 'No documented link') + (u ? ', ' + u + ' alleged and unverified' : '') + '</span>';
    }
    el.innerHTML = t;
  }

  // ------------------------------------------------------------------ the case file
  function gsw(e) { return '<i class="gsw" style="background:' + (e.mxg >= 0 ? GCOL[e.mxg] : HUBCOL) + '"></i>'; }
  function swatch(v, u, byT) { return v ? '<i class="hsw" style="background:' + RAMP[byT ? tstep(v) : step(v)] + '"></i>' : u ? '<i class="hsw u"></i>' : '<i class="hsw none"></i>'; }
  function pairBtn(a, b, extra) { return '<button type="button" class="mxd-link" data-pa="' + A.esc(a.key) + '" data-pb="' + A.esc(b.key) + '">' + A.esc(lab(a)) + ' <span class="x">×</span> ' + A.esc(lab(b)) + '</button>' + (extra || ''); }
  function nameBtn(e) { return '<button type="button" class="mxd-link" data-nm="' + A.esc(e.key) + '">' + A.esc(lab(e)) + '</button>'; }
  function cites(r) {
    var cl = r.claims.map(function (id) { return A.byKey.get(id); }).filter(Boolean);
    return cl.length ? '<span class="cite">' + cl.map(function (c) { return '<a href="' + A.claimHref(c) + '" title="' + A.esc(c.title) + '">' + A.esc(c.id) + '</a>'; }).join(' ') + '</span>' : '';
  }
  function gradeHtml(r) {
    var g = grade(r), bars = g[0] === 'doc' ? 3 : g[0] === 'single' ? 1 : 0;
    return '<span class="gr g-' + g[0] + '"><i>' + [0, 1, 2].map(function (q) { return '<b' + (q < bars ? ' class="f"' : '') + '></b>'; }).join('') + '</i>' + g[1] + '</span>';
  }
  function evidence(rr) {
    rr = rr.slice().sort(function (a, b) { return (a.alleged ? 1 : 0) - (b.alleged ? 1 : 0) || String(a.date || '9999').localeCompare(String(b.date || '9999')); });
    return '<ol class="mxd-ev">' + rr.map(function (r) {
      return '<li' + (r.alleged ? ' class="unv"' : '') + '><span class="when">' + (r.date ? A.esc(A.fdate(r.date)) : 'Undated') + '</span><div><p class="what">' + A.esc(said(r)) + '</p>' +
        '<p class="meta"><span class="kind">' + A.esc(A.RLABEL[r.type] || A.cap(r.type)) + '</span>' + (typeof r.amount_usd === 'number' ? '<span class="mxa">' + A.esc(A.money(r.amount_usd)) + '</span>' : '') + gradeHtml(r) + cites(r) + '</p></div></li>';
    }).join('') + '</ol>';
  }
  /* In a pair file both names are in the headline, so a link that is only a description is not prefixed with them again. */
  function said(r) { var t = A.plainSentence(r), pre = A.shortName(r.S) + ' and ' + A.shortName(r.T) + ': '; return A.cap(t.indexOf(pre) === 0 ? t.slice(pre.length) : t); }
  function kinds(rr) {
    var m = {}; rr.forEach(function (r) { if (!r.alleged) m[r.type] = (m[r.type] || 0) + 1; });
    return Object.keys(m).sort(function (a, b) { return m[b] - m[a]; }).map(function (k) { return '<span>' + A.esc(A.RLABEL[k] || A.cap(k)) + ' <b>' + m[k] + '</b></span>'; }).join('');
  }
  function topicRows(e, D, skip) {
    var rows = []; D.topics.forEach(function (t) { var v = inTopic(e, t).length; if (v && t !== skip) rows.push([t, v]); });
    rows.sort(function (x, y) { return y[1] - x[1]; }); if (!rows.length) return '';
    var mx = Math.max(rows[0][1], skip ? inTopic(e, skip).length : 0);
    return '<h3>' + (skip ? 'Other Topics for This Name' : 'Topics') + ' <span>Checks that mention the name</span></h3><ul class="mxd-rank">' + rows.map(function (r) {
      return '<li><i class="gsw" style="background:' + TCOL[D.topics.indexOf(r[0]) % 9] + '"></i><button type="button" class="mxd-link" data-pa="' + A.esc(e.key) + '" data-tp="' + A.esc(r[0].id) + '">' + A.esc(r[0].name) + '</button><span class="bar"><i style="width:' + Math.round(100 * r[1] / mx) + '%;background:' + RAMP[tstep(r[1])] + '"></i></span><span class="n">' + r[1] + '</span></li>';
    }).join('') + '</ul>';
  }
  function closeBtn() { return '<button type="button" class="mxd-x" data-act="clear" aria-label="Close and return to the leads">' + A.XICON + '</button>'; }
  function side() {
    var D = data(), el = $('mx-side'), byT = S.mode === 'topics', h = '';
    $('matrix').classList.toggle('has-sel', !!(S.sel || S.name));
    if (S.sel && byT) {
      var e = S.sel.a, tp = S.sel.b, cs = inTopic(e, tp);
      h = '<header class="mxd-head"><div><h2>' + A.esc(A.shortName(e)) + ' <span class="amp">in</span> ' + A.esc(tp.name) + '</h2></div>' + closeBtn() + '</header>' +
        '<p class="mxd-sum"><b>' + cs.length + '</b> ' + (cs.length === 1 ? 'check in this topic mentions the name' : 'checks in this topic mention the name') + '</p>' +
        '<div class="mxd-acts"><button type="button" class="mxd-btn" data-act="show">Show on Network</button><a href="' + A.entHref(e) + '">Open profile</a></div>' +
        (cs.length ? '<h3>Checks</h3><ul class="mxd-checks">' + cs.map(function (c) { return '<li>' + A.kmark(c) + '<a href="' + A.claimHref(c) + '">' + A.esc(c.title) + '</a><span class="id">' + A.esc(c.id) + '</span></li>'; }).join('') + '</ul>' : '<p class="mxd-note">No check in this topic mentions the name.</p>') + topicRows(e, D, tp);
    } else if (S.sel) {
      var a = S.sel.a, b = S.sel.b, rr = relsOf(a, b), doc = rr.filter(function (r) { return !r.alleged; }), un = rr.length - doc.length, yr = years(doc);
      var big = doc.filter(function (r) { return typeof r.amount_usd === 'number'; }).sort(function (x, y) { return y.amount_usd - x.amount_usd; })[0];
      h = '<header class="mxd-head"><div><h2>' + A.esc(A.shortName(a)) + ' <span class="amp">and</span> ' + A.esc(A.shortName(b)) + '</h2></div>' + closeBtn() + '</header>' +
        '<dl class="mxd-stats"><div><dt>Documented links</dt><dd>' + doc.length + '</dd></div><div><dt>Period</dt><dd>' + (yr || 'Undated') + '</dd></div><div><dt>Largest stated sum</dt><dd>' + (big ? A.esc(A.money(big.amount_usd)) : 'None stated') + '</dd></div></dl>' +
        (un ? '<p class="mxd-flag">' + un + (un === 1 ? ' further link is' : ' further links are') + ' alleged and unverified. ' + (un === 1 ? 'It is' : 'They are') + ' listed last and marked.</p>' : '') +
        '<ul class="mxd-who">' + [a, b].map(function (x) { return '<li>' + gsw(x) + '<a href="' + A.entHref(x) + '">' + A.esc(x.name) + '</a><span>' + (x.mxg >= 0 ? A.esc(GROUPS[x.mxg]) : 'Subject of the checks') + '</span></li>'; }).join('') + '</ul>' +
        '<div class="mxd-acts"><button type="button" class="mxd-btn" data-act="show">Show on Network</button>' + (doc.length ? '<p class="mxd-kinds">' + kinds(rr) + '</p>' : '') + '</div>';
      if (rr.length) h += '<h3>Evidence <span>Oldest first, with the checks that cite each link</span></h3>' + evidence(rr);
      else {
        var both = D.names.filter(function (x) { return x !== a && x !== b && x !== D.hub && cnt(a, x) && cnt(b, x); }).sort(function (x, y) { return cnt(a, y) + cnt(b, y) - cnt(a, x) - cnt(b, x); });
        h += '<p class="mxd-note">No direct documented link between these two names was found in the checks.</p>' +
          (both.length ? '<h3>Names Linked to Both <span>' + both.length + ' in this view</span></h3><ul class="mxd-rank">' + both.slice(0, 10).map(function (x) { return '<li>' + gsw(x) + nameBtn(x) + '<span class="n">' + cnt(a, x) + ' and ' + cnt(b, x) + '</span></li>'; }).join('') + '</ul>' : '');
      }
    } else if (S.name) {
      var e2 = S.name, rows = [];
      if (byT) D.topics.forEach(function (t) { var v = inTopic(e2, t).length; if (v) rows.push([t, v, 0]); });
      else D.names.forEach(function (o) { if (o === e2) return; var v = cnt(e2, o), u = alg(e2, o); if (v || u) rows.push([o, v, u]); });
      rows.sort(function (x, y) { return y[1] - x[1] || y[2] - x[2]; });
      var mx = rows.length ? rows[0][1] || 1 : 1, docs = e2.lines.filter(function (r) { return !r.alleged; });
      var bigs = docs.filter(function (r) { return typeof r.amount_usd === 'number'; }).sort(function (x, y) { return y.amount_usd - x.amount_usd; })[0];
      h = '<header class="mxd-head"><div><h2>' + A.esc(e2.name) + '</h2></div>' + closeBtn() + '</header>' +
        (e2.role ? '<p class="mxd-role">' + A.esc(String(e2.role).length > 170 ? String(e2.role).slice(0, 168).replace(/\s+\S*$/, '') + '…' : e2.role) + '</p>' : '') +
        '<dl class="mxd-stats"><div><dt>Documented links</dt><dd>' + docs.length + '</dd></div><div><dt>Names here linked</dt><dd>' + e2.mxn + ' <small>of ' + (D.names.length - 1) + '</small></dd></div><div><dt>Checks</dt><dd>' + e2.cl.length + '</dd></div></dl>' +
        '<div class="mxd-acts"><button type="button" class="mxd-btn" data-act="show">Show on Network</button><a href="' + A.entHref(e2) + '">Open profile</a></div>' +
        (byT ? '<h3>Topics <span>Checks that mention the name</span></h3><ul class="mxd-rank">' + rows.map(function (r) { return '<li><i class="gsw" style="background:' + TCOL[D.topics.indexOf(r[0]) % 9] + '"></i><button type="button" class="mxd-link" data-tp="' + A.esc(r[0].id) + '">' + A.esc(r[0].name) + '</button><span class="bar"><i style="width:' + Math.round(100 * r[1] / mx) + '%;background:' + RAMP[tstep(r[1])] + '"></i></span><span class="n">' + r[1] + '</span></li>'; }).join('') + '</ul>'
          : '<h3>Strongest Pairs <span>Documented links with names in this view</span></h3>' + (rows.length ? '<ul class="mxd-rank">' + rows.map(function (r) {
            return '<li' + (r[1] ? '' : ' class="unv"') + '>' + gsw(r[0]) + '<button type="button" class="mxd-link" data-pa="' + A.esc(e2.key) + '" data-pb="' + A.esc(r[0].key) + '">' + A.esc(lab(r[0])) + '</button>' +
              (r[1] ? '<span class="bar"><i style="width:' + Math.round(100 * r[1] / mx) + '%;background:' + RAMP[step(r[1])] + '"></i></span><span class="n">' + r[1] + '</span>' : '<span class="n u">Unverified only</span>') + '</li>';
          }).join('') + '</ul>' : '<p class="mxd-note">No documented link with another name in this view.</p>') +
          (bigs ? '<h3>Largest Stated Sum</h3><p class="mxd-lead"><b>' + A.esc(A.money(bigs.amount_usd)) + '</b> ' + A.esc(A.cap(A.plainSentence(bigs))) + (bigs.date ? ', ' + A.esc(A.fdate(bigs.date)) : '') + '. ' + cites(bigs) + '</p>' : ''));
    } else if (byT) {
      var tn = D.names.slice().sort(function (x, y) { return y.cl.length - x.cl.length; }).slice(0, 8), cm = tn.length ? tn[0].cl.length || 1 : 1;
      var tt = D.topics.map(function (t, j) { return [t, D.names.filter(function (x) { return inTopic(x, t).length; }).length]; }).sort(function (x, y) { return y[1] - x[1]; });
      h = '<header class="mxd-head"><div><h2>Where the Names Appear</h2></div></header>' +
        '<p class="mxd-how">Each row is a name and each column a topic. A cell counts the checks in that topic that mention the name, and brighter means more.</p>' +
        '<h3>Named in the Most Checks <span>Checks</span></h3><ul class="mxd-rank">' + tn.map(function (x) { return '<li>' + gsw(x) + nameBtn(x) + '<span class="bar"><i style="width:' + Math.round(100 * x.cl.length / cm) + '%"></i></span><span class="n">' + x.cl.length + '</span></li>'; }).join('') + '</ul>' +
        '<h3>Topics by Reach <span>Of ' + D.names.length + ' names</span></h3><ul class="mxd-rank">' + tt.map(function (r) { return '<li><i class="gsw" style="background:' + TCOL[D.topics.indexOf(r[0]) % 9] + '"></i><span class="t">' + A.esc(r[0].name) + '</span><span class="bar"><i style="width:' + Math.round(100 * r[1] / D.names.length) + '%"></i></span><span class="n">' + r[1] + '</span></li>'; }).join('') + '</ul>';
    } else {
      var i0 = D.hub ? 1 : 0, n = D.names.length, pairs = [], sums = [], seen = {};
      for (var i = i0; i < n; i++) for (var j = i + 1; j < n; j++) if (D.C[i][j]) pairs.push([D.names[i], D.names[j], D.C[i][j]]);
      pairs.sort(function (x, y) { return y[2] - x[2]; });
      for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) relsOf(D.names[i], D.names[j]).forEach(function (r) { if (!r.alleged && typeof r.amount_usd === 'number') sums.push(r); });
      sums.sort(function (x, y) { return y.amount_usd - x.amount_usd; });
      sums = sums.filter(function (r) { var k = r.s < r.t ? r.s + r.t : r.t + r.s; if (seen[k]) return false; seen[k] = 1; return true; }).slice(0, 5);
      var dens = [];
      GROUPS.forEach(function (g, gi) {
        var ix = []; D.names.forEach(function (e, q) { if (e.mxg === gi) ix.push(q); });
        var m = ix.length, lk = 0; if (m < 3) return;
        for (var p = 0; p < m; p++) for (var q = p + 1; q < m; q++) if (D.C[ix[p]][ix[q]]) lk++;
        dens.push([gi, lk, m * (m - 1) / 2, m]);
      });
      dens.sort(function (x, y) { return y[1] / y[2] - x[1] / x[2]; });
      var linked = 0; for (i = i0; i < n; i++) for (j = i + 1; j < n; j++) if (D.C[i][j]) linked++;
      h = '<header class="mxd-head"><div><h2>Leads in This View</h2></div></header>' +
        '<p class="mxd-how">Rows and columns list the same ' + n + ' names. A lit cell is a pair with at least one documented link, and brighter means more.</p>' +
        '<p class="mxd-how sub">' + linked + ' pairs are linked' + (D.hub ? ', not counting ' + A.esc(lab(D.hub)) + '. He is the subject of the checks, so his row and column are set apart at the top and left' : '') + '.</p>' +
        '<h3>Strongest Pairs <span>Documented links</span></h3><ul class="mxd-rank">' + pairs.slice(0, 5).map(function (p) { return '<li>' + swatch(p[2]) + pairBtn(p[0], p[1]) + '<span class="n">' + p[2] + '</span></li>'; }).join('') + '</ul>' +
        (sums.length ? '<h3>Largest Sums <span>Stated in a documented link</span></h3><ul class="mxd-rank sums">' + sums.map(function (r) { return '<li><span class="mxa">' + A.esc(A.money(r.amount_usd)) + '</span>' + pairBtn(r.S, r.T) + '<span class="n">' + (years([r]) || '') + '</span></li>'; }).join('') + '</ul>' : '') +
        (dens.length ? '<h3>Densest Clusters <span>Pairs linked inside a group</span></h3><ul class="mxd-rank">' + dens.map(function (d) { return '<li><i class="gsw" style="background:' + GCOL[d[0]] + '"></i><span class="t">' + A.esc(GROUPS[d[0]]) + '</span><span class="bar"><i style="width:' + Math.round(100 * d[1] / d[2]) + '%"></i></span><span class="n">' + d[1] + ' of ' + d[2] + '</span></li>'; }).join('') + '</ul>' : '');
    }
    el.innerHTML = h; el.scrollTop = 0;
  }

  // ------------------------------------------------------------------ a phone: one name at a time, its links as ranked bars
  function phone() {
    S.size = 48; var D = data(), byT = S.mode === 'topics', el = $('mx-phone');
    if (S.focus >= D.names.length) S.focus = 0;
    var a = D.names[S.focus], rows = [];
    if (byT) D.topics.forEach(function (t) { var v = inTopic(a, t).length; if (v) rows.push([t, v, 0]); });
    else D.names.forEach(function (b) { if (b === a) return; var v = cnt(a, b), u = alg(a, b); if (v || u) rows.push([b, v, u]); });
    rows.sort(function (x, y) { return y[1] - x[1] || y[2] - x[2]; });
    var mx = rows.length ? rows[0][1] || 1 : 1;
    el.innerHTML = '<label for="mxp-name">Name</label><select id="mxp-name">' + D.names.map(function (e, q) { return '<option value="' + q + '"' + (q === S.focus ? ' selected' : '') + '>' + A.esc(lab(e)) + '</option>'; }).join('') + '</select>' +
      '<p class="mxp-sum"><b>' + rows.length + '</b> ' + (byT ? (rows.length === 1 ? 'topic has' : 'topics have') + ' checks that mention this name.' : 'of the other ' + (D.names.length - 1) + ' names here ' + (rows.length === 1 ? 'has' : 'have') + ' a link with this name.') + ' Select a row to read the evidence.</p>' +
      '<p class="mx-key">' + keyHtml() + '</p>' +
      '<ul class="mxp-list">' + rows.map(function (r) {
        var nm = byT ? r[0].name : lab(r[0]), attr = byT ? 'data-pa="' + A.esc(a.key) + '" data-tp="' + A.esc(r[0].id) + '"' : 'data-pa="' + A.esc(a.key) + '" data-pb="' + A.esc(r[0].key) + '"';
        return '<li><button type="button" ' + attr + (r[1] ? '' : ' class="unv"') + '><span class="nm">' + A.esc(nm) + '</span><span class="n">' + (r[1] || 'Unverified only') + '</span>' +
          '<span class="bar"><i style="width:' + (r[1] ? Math.max(3, Math.round(100 * r[1] / mx)) : 0) + '%;background:' + RAMP[byT ? tstep(r[1]) : step(r[1])] + '"></i></span></button></li>';
      }).join('') + '</ul>';
  }

  // ------------------------------------------------------------------ render
  function render() {
    if (!A) return;
    var mxEl = $('matrix'), ph = A.narrow.matches;
    document.querySelectorAll('[data-mx]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mx') === S.mode)); });
    document.querySelectorAll('[data-mxo]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-mxo') === S.order)); });
    mxEl.classList.toggle('is-phone', ph); mxEl.classList.toggle('by-topic', S.mode === 'topics');
    S.hover = null;
    if (S.sel && (S.mode === 'topics') !== !S.sel.b.key) S.sel = null;
    if (ph) { phone(); side(); return; }
    var plot = $('mx-plot'), H = plot.clientHeight; if (!H) return;
    var size = Math.max(24, Math.min(70, Math.floor((H - 145 - 12 - HUBGAP - 4 * GAP) / MINC)));
    if (size !== S.size) { S.size = size; S.data = null; }
    data(); layout(); railTop(); railRows(); draw();
    $('mx-key').innerHTML = keyHtml(); readout(); side();
    canvas.setAttribute('aria-label', S.mode === 'topics' ? 'Heat table of ' + S.data.names.length + ' names against the topics. The case file beside it lists the same content as text.' : 'Heatmap of documented links between ' + S.data.names.length + ' names. The case file beside it lists the strongest pairs as text, and each name in the list opens its links.');
  }
  function cellAt(e) {
    var L = S.L; if (!L) return null;
    var r = canvas.getBoundingClientRect(), x = e.clientX - r.left - L.x0, y = e.clientY - r.top - L.y0, i = -1, j = -1, q;
    for (q = 0; q < L.R.pos.length; q++) if (y >= L.R.pos[q] && y < L.R.pos[q] + L.ch) { i = q; break; }
    for (q = 0; q < L.C.pos.length; q++) if (x >= L.C.pos[q] && x < L.C.pos[q] + L.cw) { j = q; break; }
    if (y < -L.BR - L.BARS - 70 * 0 && y < 0 && j >= 0) i = -1;          // over a column's label or bar
    if (x > L.C.len) j = -1; if (y > L.R.len) i = -1;
    return i < 0 && j < 0 ? null : { i: i, j: j };
  }
  function selectCell(i, j) {
    var D = S.data, byT = S.mode === 'topics';
    if (i < 0 && j >= 0) { if (!byT) { S.name = D.names[j]; S.sel = null; } }
    else if (i >= 0 && j < 0 || (!byT && i === j)) { S.name = D.names[i]; S.sel = null; }
    else { S.sel = { a: D.names[i], b: byT ? D.topics[j] : D.names[j] }; S.name = null; }
    side(); redraw();
  }
  function init(api) {
    A = api; canvas = $('mx-canvas'); if (!canvas) return; ctx = canvas.getContext('2d');
    var mxEl = $('matrix'), sideEl = $('mx-side'), rows = $('mx-rows');
    canvas.addEventListener('mousemove', function (e) { var h = cellAt(e), o = S.hover; if ((h && h.i) !== (o && o.i) || (h && h.j) !== (o && o.j)) { S.hover = h; canvas.style.cursor = h ? 'pointer' : 'default'; readout(); redraw(); } });
    canvas.addEventListener('mouseleave', function () { if (S.hover) { S.hover = null; readout(); redraw(); } });
    canvas.addEventListener('click', function (e) { var h = cellAt(e); if (h) { S.cur = h.i >= 0 && h.j >= 0 ? h : S.cur; selectCell(h.i, h.j); } else if (S.sel || S.name) { S.sel = null; S.name = null; side(); redraw(); } });
    canvas.addEventListener('keydown', function (e) {
      var L = S.L; if (!L) return; var d = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key];
      if (!S.cur) S.cur = { i: 0, j: 0 };
      if (d) { S.cur = { i: Math.max(0, Math.min(L.R.pos.length - 1, S.cur.i + d[0])), j: Math.max(0, Math.min(L.C.pos.length - 1, S.cur.j + d[1])) }; S.hover = S.cur; readout(); redraw(); e.preventDefault(); }
      else if (e.key === 'Enter' || e.key === ' ') { selectCell(S.cur.i, S.cur.j); e.preventDefault(); }
      else if (e.key === 'Escape') { S.sel = null; S.name = null; side(); redraw(); }
    });
    canvas.addEventListener('focus', redraw); canvas.addEventListener('blur', redraw);
    rows.addEventListener('mouseover', function (e) { var b = e.target.closest('.mx-row'); if (!b) return; var i = +b.getAttribute('data-n'); if (!S.hover || S.hover.i !== i || S.hover.j !== -1) { S.hover = { i: i, j: -1 }; readout(); redraw(); } });
    rows.addEventListener('mouseleave', function () { if (S.hover) { S.hover = null; readout(); redraw(); } });
    rows.addEventListener('click', function (e) { var b = e.target.closest('.mx-row'); if (!b) return; var en = S.data.names[+b.getAttribute('data-n')]; S.name = S.name === en ? null : en; S.sel = null; side(); redraw(); });
    $('mx-groups').addEventListener('click', function (e) {
      var b = e.target.closest('.mx-gt'); if (!b) return; var g = +b.getAttribute('data-g');
      if (S.off[g]) delete S.off[g]; else if (Object.keys(S.off).length < GROUPS.length - 1) S.off[g] = 1;
      S.data = null; if (S.name && S.off[S.name.mxg]) S.name = null; render();
    });
    $('mx-filter').addEventListener('input', function () { S.q = this.value; redraw(); });
    $('mx-filter').addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return; var ms = matchSet(S.data), i = ms ? ms.indexOf(true) : -1;
      if (i >= 0) { S.name = S.data.names[i]; S.sel = null; side(); redraw(); }
    });
    function act(e) {
      var t = e.target.closest('[data-act],[data-pa],[data-nm],[data-tp]'); if (!t) return;
      var k = t.getAttribute('data-act');
      if (k === 'clear') { S.sel = null; S.name = null; side(); redraw(); return; }
      if (k === 'show') { if (S.sel && S.sel.b.key) A.showPair(S.sel.a, S.sel.b); else A.showName(S.sel ? S.sel.a : S.name); return; }
      if (t.hasAttribute('data-pa')) { var a = A.byKey.get(t.getAttribute('data-pa')), b = t.hasAttribute('data-tp') ? S.data.topics.filter(function (x) { return x.id === t.getAttribute('data-tp'); })[0] : A.byKey.get(t.getAttribute('data-pb')); if (a && b) { S.sel = { a: a, b: b }; S.name = null; side(); redraw(); } return; }
      if (t.hasAttribute('data-nm')) { S.name = A.byKey.get(t.getAttribute('data-nm')); S.sel = null; side(); redraw(); return; }
      if (t.hasAttribute('data-tp') && S.name) { var tp = S.data.topics.filter(function (x) { return x.id === t.getAttribute('data-tp'); })[0]; if (tp) { S.sel = { a: S.name, b: tp }; S.name = null; side(); redraw(); } }
    }
    sideEl.addEventListener('click', act); $('mx-phone').addEventListener('click', act);
    $('mx-phone').addEventListener('change', function (e) { if (e.target.id === 'mxp-name') { S.focus = +e.target.value; S.sel = null; S.name = null; phone(); side(); } });
    var timer = 0;
    function later() { if (mxEl.hidden) return; clearTimeout(timer); timer = setTimeout(render, 120); }
    window.addEventListener('resize', later);
    if (A.narrow.addEventListener) A.narrow.addEventListener('change', later);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!mxEl.hidden) render(); });
  }
  window.TCMMatrix = { state: S, init: init, render: render };
})();
