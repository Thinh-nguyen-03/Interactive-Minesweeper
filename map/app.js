/* Trump Claims Map: canvas force graph + detail panel. Data comes from graph-data.js (window.GRAPH). */
(function () {
  'use strict';

  var G = window.GRAPH || { meta: {}, nodes: [], links: [], rels: [] };
  var META = G.meta || {};
  var d3 = window.d3;
  var $ = function (id) { return document.getElementById(id); };
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); }
  function arr(v) { return Array.isArray(v) ? v : []; }

  var VERDICTS = ['confirmed', 'mostly-accurate', 'partly-accurate', 'misleading', 'unverified', 'false', 'pending'];
  var VLABEL = {
    'confirmed': 'Confirmed', 'mostly-accurate': 'Mostly accurate', 'partly-accurate': 'Partly accurate',
    'misleading': 'Misleading', 'unverified': 'Unverified', 'false': 'False', 'pending': 'Pending'
  };
  var VMEANS = {
    'confirmed': 'The record supports the claim as stated.',
    'mostly-accurate': 'The substance holds up; some figures, dates or wording need correcting.',
    'partly-accurate': 'Some parts hold up and others do not.',
    'misleading': 'The underlying facts exist, but the framing gives a wrong impression.',
    'unverified': 'Available evidence neither confirms nor refutes it.',
    'false': 'The record contradicts the claim.',
    'pending': 'Not checked yet.'
  };
  var TLABEL = {
    person: 'Person', company: 'Company', government: 'Government body', fund: 'Fund', asset: 'Asset',
    country: 'Country', law: 'Law or policy', media: 'Media', event: 'Event', product: 'Product'
  };
  var TPLURAL = {
    person: 'People', company: 'Companies', government: 'Government bodies', fund: 'Funds', asset: 'Assets',
    country: 'Countries', law: 'Laws and policies', media: 'Media', event: 'Events', product: 'Products'
  };
  var RLABEL = {
    money: 'Money', ownership: 'Ownership', family: 'Family', regulatory: 'Regulatory', advisory: 'Advisory',
    political: 'Political', legal: 'Legal', media: 'Media', commercial: 'Commercial'
  };
  var ETYPES = ['person', 'company', 'fund', 'government', 'country', 'asset', 'product', 'law', 'event', 'media'];
  var RTYPES = ['money', 'ownership', 'family', 'regulatory', 'advisory', 'political', 'legal', 'media', 'commercial'];

  // ------------------------------------------------------------------ data
  var nodes = arr(G.nodes).filter(function (n) { return n && n.key; });
  var byKey = new Map(), byHash = new Map();
  nodes.forEach(function (n) {
    if (n.kind === 'claim') {
      if (VERDICTS.indexOf(n.verdict) < 0) n.verdict = 'pending';
      n.origin = n.origin === 'follow-up' ? 'follow-up' : 'video';
    }
    if (n.kind === 'entity' && !TLABEL[n.type]) n.type = 'company';
    n.name = n.name || n.title || n.id || n.key;
    byKey.set(n.key, n);
    byHash.set(String(n.hash || n.key).toLowerCase(), n);
    n.adj = new Map();   // other key -> link
    n.rels = [];         // relationships (entities)
  });
  var claims = nodes.filter(function (n) { return n.kind === 'claim'; });
  var entities = nodes.filter(function (n) { return n.kind === 'entity'; });
  var themes = nodes.filter(function (n) { return n.kind === 'theme'; });

  var links = [], pair = new Map();
  function getLink(a, b, kind) {
    var key = a < b ? a + '|' + b : b + '|' + a;
    var l = pair.get(key);
    if (!l) {
      l = { source: byKey.get(a), target: byKey.get(b), kind: kind, rels: [] };
      pair.set(key, l); links.push(l);
      l.source.adj.set(b, l); l.target.adj.set(a, l);
    }
    return l;
  }
  var rels = arr(G.rels).filter(function (r) { return byKey.has(r.s) && byKey.has(r.t) && r.s !== r.t; });
  rels.forEach(function (r) {
    r.claims = arr(r.claims);
    getLink(r.s, r.t, 'rel').rels.push(r);
    byKey.get(r.s).rels.push(r); byKey.get(r.t).rels.push(r);
  });
  arr(G.links).forEach(function (l) {
    if (!byKey.has(l.s) || !byKey.has(l.t) || l.s === l.t) return;
    var L = getLink(l.s, l.t, l.k || 'claim');
    if (l.inferred) L.inferred = true;
  });
  nodes.forEach(function (n) {
    n.degree = n.adj.size;
    if (n.kind === 'entity') n.r = 3.2 + 1.55 * Math.sqrt(n.degree);
    else if (n.kind === 'claim') n.r = 8 + 0.9 * Math.sqrt(n.degree);
    else n.r = 10 + 1.2 * Math.sqrt(n.degree);
  });
  function claimsOf(n) {
    var out = [];
    n.adj.forEach(function (l, k) { var o = byKey.get(k); if (o.kind === 'claim') out.push(o); });
    return out.sort(cmpClaim);
  }
  function cmpClaim(a, b) { return String(a.id).localeCompare(String(b.id), undefined, { numeric: true }); }
  // hubs keep their label at every zoom level
  var hubCount = Math.max(6, Math.round(entities.length / 14));
  entities.slice().sort(function (a, b) { return b.degree - a.degree; }).slice(0, hubCount).forEach(function (n) { n.hub = true; });
  themes.forEach(function (n) { n.hub = true; });

  // ------------------------------------------------------------------ icons
  var ICONS = {
    'confirmed': { stroke: 'M3.5 8.6l3 3 6-7.2' },
    'mostly-accurate': { pie: 0.75 },
    'partly-accurate': { pie: 0.5 },
    'misleading': { stroke: 'M8 3v6.4', dots: [[8, 12.6]] },
    'unverified': { stroke: 'M5.6 6.1a2.4 2.4 0 1 1 3.7 2c-.8.5-1.3 1-1.3 2', dots: [[8, 12.9]] },
    'false': { stroke: 'M4.2 4.2l7.6 7.6M11.8 4.2l-7.6 7.6' },
    'pending': { dashed: true }
  };
  function wedge(f) {
    var a = f * 2 * Math.PI, x = 8 + 5.5 * Math.sin(a), y = 8 - 5.5 * Math.cos(a);
    return 'M8 8L8 2.5A5.5 5.5 0 ' + (f > 0.5 ? 1 : 0) + ' 1 ' + x.toFixed(2) + ' ' + y.toFixed(2) + 'Z';
  }
  function vicon(v, size) {
    var ic = ICONS[v] || ICONS.pending, s = size || 16, body = '';
    if (ic.stroke) body += '<path d="' + ic.stroke + '"/>';
    if (ic.pie) body += '<circle cx="8" cy="8" r="5.5" stroke-width="1.4"/><path d="' + wedge(ic.pie) + '" fill="currentColor" stroke="none"/>';
    if (ic.dashed) body += '<circle cx="8" cy="8" r="5.5" stroke-width="1.4" stroke-dasharray="2.4 2.2"/>';
    (ic.dots || []).forEach(function (d) { body += '<circle cx="' + d[0] + '" cy="' + d[1] + '" r="1.1" fill="currentColor" stroke="none"/>'; });
    return '<svg class="vicon" width="' + s + '" height="' + s + '" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + body + '</svg>';
  }
  function badge(v, big) {
    return '<span class="badge v-' + v + (big ? ' big' : '') + '">' + vicon(v, big ? 16 : 14) + '<span>' + VLABEL[v] + '</span></span>';
  }
  var SHAPES = {
    diamond: '<path d="M8 1.5L14.5 8 8 14.5 1.5 8z"/>',
    square: '<rect x="2.5" y="2.5" width="11" height="11" rx="1.5"/>',
    circle: '<circle cx="8" cy="8" r="5.5"/>',
    hexagon: '<path d="M8 1.8l5.4 3.1v6.2L8 14.2l-5.4-3.1V4.9z"/>'
  };
  function shape(name, cssColor, hollow) {
    return '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" style="color:' + cssColor + '" ' +
      (hollow ? 'fill="none" stroke="currentColor" stroke-width="1.6"' : 'fill="currentColor"') + '>' + SHAPES[name] + '</svg>';
  }

  // ------------------------------------------------------------------ formatting
  function money(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '';
    var a = Math.abs(n), u = [[1e12, 'T'], [1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
    for (var i = 0; i < u.length; i++) if (a >= u[i][0]) return '$' + String(+(n / u[i][0]).toFixed(2)) + u[i][1];
    return '$' + Math.round(n).toLocaleString('en-US');
  }
  function safeUrl(u) { return /^https?:\/\//i.test(String(u || '')) ? String(u) : ''; }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return 'source'; } }
  function extLink(u, text) {
    var s = safeUrl(u);
    return s ? '<a href="' + esc(s) + '" target="_blank" rel="noopener noreferrer">' + text + '</a>' : text;
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function trunc(s, n) { s = String(s || ''); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; }

  // minimal markdown -> HTML (headings, lists, tables, quotes, emphasis, links)
  function inline(s) {
    var keep = [];
    function stash(h) { keep.push(h); return '\u0000' + (keep.length - 1) + '\u0000'; }
    s = esc(s);
    s = s.replace(/`([^`]+)`/g, function (m, c) { return stash('<code>' + c + '</code>'); });
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, function (m, t, u) { return stash(extLink(u.replace(/&amp;/g, '&'), t)); });
    s = s.replace(/&lt;(https?:\/\/[^\s&]+(?:&amp;[^\s&]+)*)&gt;/g, function (m, u) { return stash(extLink(u.replace(/&amp;/g, '&'), esc(host(u.replace(/&amp;/g, '&'))))); });
    s = s.replace(/(^|[\s(])(https?:\/\/[^\s<]+[^\s<.,;:)\]])/g, function (m, p, u) { var raw = u.replace(/&amp;/g, '&'); return p + stash(extLink(raw, esc(trunc(raw.replace(/^https?:\/\/(www\.)?/, ''), 48)))); });
    s = s.replace(/\*\*([^*]+(?:\*(?!\*)[^*]+)*)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^\w*])\*([^*\s][^*]*)\*(?!\w)/g, '$1<em>$2</em>');
    s = s.replace(/(^|[^\w])_([^_\s][^_]*)_(?!\w)/g, '$1<em>$2</em>');
    s = s.replace(/\[(\d+(?:[,–-]\s?\d+)*)\]/g, '<sup>[$1]</sup>');
    return s.replace(/\u0000(\d+)\u0000/g, function (m, i) { return keep[+i]; });
  }
  function renderList(items, start, indent) {
    var ordered = items[start].ordered, h = ordered ? '<ol>' : '<ul>', i = start;
    while (i < items.length && items[i].indent >= indent) {
      h += '<li>' + inline(items[i].text); i++;
      if (i < items.length && items[i].indent > indent) { var sub = renderList(items, i, items[i].indent); h += sub[0]; i = sub[1]; }
      h += '</li>';
    }
    return [h + (ordered ? '</ol>' : '</ul>'), i];
  }
  function markdown(src) {
    var lines = String(src || '').replace(/\r/g, '').split('\n'), out = [], i = 0, first = true, m;
    var LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
    while (i < lines.length) {
      var line = lines[i];
      if (!line.trim()) { i++; continue; }
      if ((m = /^(#{1,6})\s+(.*?)\s*#*$/.exec(line))) {
        if (!(first && m[1].length === 1)) out.push((m[1].length <= 2 ? '<h4>' : '<h5>') + inline(m[2]) + (m[1].length <= 2 ? '</h4>' : '</h5>'));
        first = false; i++; continue;
      }
      first = false;
      if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { out.push('<hr>'); i++; continue; }
      if (/^\s*\|/.test(line) && i + 1 < lines.length && /^\s*\|?\s*:?-{2,}/.test(lines[i + 1])) {
        var rows = [];
        while (i < lines.length && /^\s*\|/.test(lines[i])) { rows.push(lines[i]); i++; }
        var cells = function (r) { return r.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map(function (c) { return c.trim(); }); };
        var t = '<div class="tablewrap"><table><thead><tr>' + cells(rows[0]).map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
        rows.slice(2).forEach(function (r) { t += '<tr>' + cells(r).map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>'; });
        out.push(t + '</tbody></table></div>'); continue;
      }
      if (/^\s*>/.test(line)) {
        var q = [];
        while (i < lines.length && /^\s*>/.test(lines[i])) { q.push(lines[i].replace(/^\s*>\s?/, '')); i++; }
        out.push('<blockquote>' + inline(q.join(' ')) + '</blockquote>'); continue;
      }
      if (LIST.test(line)) {
        var items = [];
        while (i < lines.length) {
          var lm = LIST.exec(lines[i]);
          if (lm) { items.push({ indent: lm[1].replace(/\t/g, '    ').length, ordered: /\d/.test(lm[2]), text: lm[3] }); i++; }
          else if (lines[i].trim() && /^\s+/.test(lines[i]) && items.length) { items[items.length - 1].text += ' ' + lines[i].trim(); i++; }
          else if (!lines[i].trim() && i + 1 < lines.length && LIST.test(lines[i + 1])) { i++; }
          else break;
        }
        out.push(renderList(items, 0, items[0].indent)[0]); continue;
      }
      var para = [];
      while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*>|\s*\|)/.test(lines[i]) && !LIST.test(lines[i])) { para.push(lines[i].trim()); i++; }
      if (para.length) out.push('<p>' + inline(para.join(' ')) + '</p>'); else i++;
    }
    return out.join('');
  }

  // ------------------------------------------------------------------ state
  var state = { view: 'map', sel: null, hover: null, rankBy: 'claims', lastHash: null };
  var F = { kind: new Set(['claim', 'entity', 'theme']), origin: new Set(['video', 'follow-up']), verdict: new Set(VERDICTS), etype: new Set(ETYPES), rtype: new Set(RTYPES) };
  var FALL = { kind: ['claim', 'entity', 'theme'], origin: ['video', 'follow-up'], verdict: VERDICTS, etype: ETYPES, rtype: RTYPES };
  var narrow = window.matchMedia('(max-width: 760px)');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  function activeFilters() {
    var n = 0;
    Object.keys(F).forEach(function (g) { present(g).forEach(function (o) { if (!F[g].has(o.v)) n++; }); });
    return n;
  }
  function present(group) {
    var counts = {};
    if (group === 'kind') { counts = { claim: claims.length, entity: entities.length, theme: themes.length }; }
    else if (group === 'origin') claims.forEach(function (c) { counts[c.origin] = (counts[c.origin] || 0) + 1; });
    else if (group === 'verdict') claims.forEach(function (c) { counts[c.verdict] = (counts[c.verdict] || 0) + 1; });
    else if (group === 'etype') entities.forEach(function (e) { counts[e.type] = (counts[e.type] || 0) + 1; });
    else rels.forEach(function (r) { counts[r.type] = (counts[r.type] || 0) + 1; });
    return FALL[group].filter(function (v) { return counts[v]; }).map(function (v) { return { v: v, n: counts[v] }; });
  }
  function relOn(r) { return F.rtype.has(r.type) || RTYPES.indexOf(r.type) < 0; }
  function applyFilters() {
    var filtered = activeFilters() > 0;
    nodes.forEach(function (n) {
      n.vis = F.kind.has(n.kind) &&
        (n.kind !== 'claim' || (F.verdict.has(n.verdict) && F.origin.has(n.origin))) &&
        (n.kind !== 'entity' || F.etype.has(n.type));
    });
    links.forEach(function (l) {
      l.vis = l.source.vis && l.target.vis && (l.kind !== 'rel' || l.rels.some(relOn));
    });
    if (filtered) {   // entities left with no visible link would only be noise
      var linked = new Set();
      links.forEach(function (l) { if (l.vis) { linked.add(l.source); linked.add(l.target); } });
      entities.forEach(function (n) { if (n.vis && !linked.has(n)) n.vis = false; });
      links.forEach(function (l) { l.vis = l.vis && l.source.vis && l.target.vis; });
    }
    var shown = nodes.filter(function (n) { return n.vis; }).length;
    var fc = $('filter-count');
    fc.hidden = !filtered; fc.textContent = activeFilters();
    $('status').textContent = filtered
      ? 'Showing ' + shown + ' of ' + nodes.length + ' nodes'
      : plural(claims.length, 'claim', 'claims') + ' · ' + entities.length + ' people and organisations · ' + plural(rels.length, 'relationship', 'relationships');
    requestDraw();
  }

  // ------------------------------------------------------------------ canvas graph
  var canvas = $('graph'), ctx = canvas.getContext('2d');
  var W = 0, H = 0, dpr = 1, T = d3 ? d3.zoomIdentity : { k: 1, x: 0, y: 0 };
  var C = {}, fitted = false, drawQueued = false, zoom = null, sim = null;
  var FONT = '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif';

  function readTokens() {
    var cs = getComputedStyle(document.documentElement);
    function tok(name) { return cs.getPropertyValue(name).trim() || '#888'; }
    C = { bg: tok('--bg'), surface: tok('--surface'), edge: tok('--edge'), edgeStrong: tok('--edge-strong'), label: tok('--label'),
      labelDim: tok('--label-dim'), accent: tok('--accent'), theme: tok('--theme'), muted: tok('--muted'), text: tok('--text'), v: {}, t: {} };
    VERDICTS.forEach(function (v) { C.v[v] = tok('--v-' + v); });
    ETYPES.forEach(function (t) { C.t[t] = tok('--t-' + t); });
  }

  function layout() {
    if (!d3) return;
    // deterministic start: a phyllotaxis spiral, hubs near the middle
    nodes.slice().sort(function (a, b) { return b.degree - a.degree; }).forEach(function (n, i) {
      var r = 16 * Math.sqrt(i + 0.5), a = i * 2.399963;
      n.x = r * Math.cos(a); n.y = r * Math.sin(a);
    });
    var box = canvas.parentElement.getBoundingClientRect(), portrait = box.height > box.width * 1.1;
    sim = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).distance(function (l) {
        return l.kind === 'rel' ? 78 : l.kind === 'claim' ? 105 : 150;
      }).strength(function (l) {
        var m = Math.min(l.source.degree, l.target.degree) || 1;
        return (l.kind === 'claim' ? 0.9 : l.kind === 'rel' ? 0.5 : 0.25) / Math.sqrt(m);
      }))
      .force('charge', d3.forceManyBody().strength(function (n) { return -210 - 30 * Math.sqrt(n.degree) - (n.kind === 'claim' ? 420 : 0); }).distanceMax(1100))
      .force('collide', d3.forceCollide().radius(function (n) { return n.r + (n.kind === 'claim' ? 16 : 7); }).strength(0.8))
      .force('x', d3.forceX(0).strength(portrait ? 0.062 : 0.03))
      .force('y', d3.forceY(0).strength(portrait ? 0.03 : 0.058))
      .stop();
    var ticks = nodes.length > 600 ? 220 : 380;
    for (var i = 0; i < ticks; i++) sim.tick();
    sim.alpha(0).on('tick', requestDraw);
  }

  function resize() {
    var box = canvas.parentElement.getBoundingClientRect();
    if (box.width < 2 || box.height < 2) return;
    var cx = W / 2, cy = H / 2, had = W > 0;
    W = box.width; H = box.height; dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    if (!fitted) { fitted = true; fit(false); if (state.sel) focusOn(state.sel, false); }
    else if (had && zoom) { d3.select(canvas).call(zoom.transform, T.translate((W / 2 - cx) / T.k, (H / 2 - cy) / T.k)); }
    draw();
  }
  function visibleArea() {
    var panel = $('panel'), h = H;
    if (narrow.matches && panel.classList.contains('open') && !panel.classList.contains('tall')) h = Math.max(120, H - panel.getBoundingClientRect().height);
    return { w: W, h: h };
  }
  function moveTo(t, animate) {
    if (!zoom) return;
    var s = d3.select(canvas);
    if (animate && !reduced.matches) s.transition().duration(420).call(zoom.transform, t);
    else s.call(zoom.transform, t);
  }
  function fit(animate) {
    var vis = nodes.filter(function (n) { return n.vis; });
    if (!vis.length || !W) return;
    var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    vis.forEach(function (n) { x0 = Math.min(x0, n.x - n.r); x1 = Math.max(x1, n.x + n.r); y0 = Math.min(y0, n.y - n.r); y1 = Math.max(y1, n.y + n.r + 14); });
    frame(x0, y0, x1, y1, 1.6, animate);
  }
  function frame(x0, y0, x1, y1, maxK, animate) {
    var a = visibleArea(), pad = narrow.matches ? 18 : 40, left = 0, lg = $('legend');
    if (!narrow.matches && lg.open && W > 760) left = lg.getBoundingClientRect().width + 8;   // keep clear of the legend
    var k = Math.min((a.w - left - pad * 2) / Math.max(1, x1 - x0), (a.h - pad * 2) / Math.max(1, y1 - y0), maxK);
    k = Math.max(k, 0.12);
    moveTo(d3.zoomIdentity.translate(left + (a.w - left) / 2 - k * (x0 + x1) / 2, a.h / 2 - k * (y0 + y1) / 2).scale(k), animate);
  }
  function focusOn(n, animate) {   // frame a node together with its neighbourhood
    if (!W || !zoom || !n.vis) return;
    var x0 = n.x, x1 = n.x, y0 = n.y, y1 = n.y;
    n.adj.forEach(function (l, k) { var o = byKey.get(k); if (!l.vis) return; x0 = Math.min(x0, o.x); x1 = Math.max(x1, o.x); y0 = Math.min(y0, o.y); y1 = Math.max(y1, o.y); });
    frame(x0 - 50, y0 - 40, x1 + 50, y1 + 50, 1.5, animate);
  }
  function centerOn(n, animate, onlyIfHidden) {
    if (!W || !zoom || !n.vis) return;
    var a = visibleArea(), sx = n.x * T.k + T.x, sy = n.y * T.k + T.y;
    if (onlyIfHidden && sx > 30 && sx < a.w - 30 && sy > 30 && sy < a.h - 40) return;
    var k = onlyIfHidden ? T.k : Math.max(T.k, Math.min(1.15, narrow.matches ? 0.95 : 1.15));
    moveTo(d3.zoomIdentity.translate(a.w / 2 - k * n.x, a.h / 2 - k * n.y).scale(k), animate);
  }

  function rs(n) {   // on-screen radius
    var min = n.kind === 'entity' ? 2.2 : 5.5;
    return Math.min(Math.max(n.r * Math.pow(T.k, 0.8), min), n.r * 2);
  }
  function hit(px, py, slack) {
    var best = null, bd = Infinity;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i]; if (!n.vis) continue;
      var dx = n.x * T.k + T.x - px, dy = n.y * T.k + T.y - py, d = Math.sqrt(dx * dx + dy * dy), r = rs(n) + (slack || 4);
      if (d <= r && d - rs(n) < bd) { bd = d - rs(n); best = n; }
    }
    return best;
  }
  function focusSet(f) {
    var set = new Set([f]), hl = new Set();
    f.adj.forEach(function (l, k) { if (l.vis) { set.add(byKey.get(k)); hl.add(l); } });
    if (f.kind === 'claim') {   // also the relationships documented under this claim
      links.forEach(function (l) {
        if (l.kind === 'rel' && l.vis && set.has(l.source) && set.has(l.target) &&
          l.rels.some(function (r) { return r.claims.indexOf(f.id) >= 0; })) hl.add(l);
      });
    }
    return { nodes: set, links: hl };
  }

  var paths = {};
  function iconPath(v) {
    if (!paths[v]) {
      var ic = ICONS[v];
      paths[v] = { stroke: ic.stroke ? new Path2D(ic.stroke) : null, pie: ic.pie ? new Path2D(wedge(ic.pie)) : null, dots: ic.dots || [] };
    }
    return paths[v];
  }
  function nodePath(n, x, y, r) {
    ctx.beginPath();
    if (n.kind === 'entity') { ctx.arc(x, y, r, 0, 6.2832); }
    else if (n.kind === 'theme') { for (var i = 0; i < 6; i++) { var a = Math.PI / 6 + i * Math.PI / 3; ctx[i ? 'lineTo' : 'moveTo'](x + r * Math.cos(a), y + r * Math.sin(a)); } ctx.closePath(); }
    else if (n.origin === 'follow-up') { var s = r * 0.92; if (ctx.roundRect) ctx.roundRect(x - s, y - s, 2 * s, 2 * s, s * 0.22); else ctx.rect(x - s, y - s, 2 * s, 2 * s); }
    else { var d = r * 1.22; ctx.moveTo(x, y - d); ctx.lineTo(x + d, y); ctx.lineTo(x, y + d); ctx.lineTo(x - d, y); ctx.closePath(); }
  }
  function drawNode(n, alpha) {
    var x = n.x * T.k + T.x, y = n.y * T.k + T.y, r = rs(n);
    if (x < -40 || y < -40 || x > W + 40 || y > H + 40) return;
    ctx.globalAlpha = alpha;
    nodePath(n, x, y, r);
    if (n.kind === 'entity') {
      ctx.fillStyle = C.t[n.type] || C.muted; ctx.fill();
      if (r > 3) { ctx.lineWidth = 1; ctx.strokeStyle = C.bg; ctx.stroke(); }
    } else if (n.kind === 'theme') {
      ctx.fillStyle = C.surface; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.theme; ctx.stroke();
    } else if (n.verdict === 'pending') {
      ctx.fillStyle = C.surface; ctx.fill(); ctx.lineWidth = 1.6; ctx.strokeStyle = C.v.pending;
      ctx.setLineDash([3, 2.5]); ctx.stroke(); ctx.setLineDash([]);
    } else {
      ctx.fillStyle = C.v[n.verdict]; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = C.bg; ctx.stroke();
      if (r >= 6.5) {
        var p = iconPath(n.verdict), s = r * (p.pie ? 1.5 : 1.3) / 16;
        ctx.save(); ctx.translate(x - 8 * s, y - 8 * s); ctx.scale(s, s);
        ctx.strokeStyle = C.bg; ctx.fillStyle = C.bg; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        if (p.stroke) { ctx.lineWidth = 2.2; ctx.stroke(p.stroke); }
        if (p.pie) ctx.fill(p.pie);
        p.dots.forEach(function (d) { ctx.beginPath(); ctx.arc(d[0], d[1], 1.2, 0, 6.2832); ctx.fill(); });
        ctx.restore();
      }
    }
    if (n === state.sel || n === state.hover) {
      ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(x, y, r * (n.kind === 'claim' ? 1.25 : 1) + 4.5, 0, 6.2832);
      ctx.lineWidth = n === state.sel ? 2.2 : 1.4; ctx.strokeStyle = C.accent; ctx.stroke();
    }
  }
  var widths = new Map();
  function textW(font, text) {
    var key = font + '|' + text, w = widths.get(key);
    if (w == null) { ctx.font = font; w = ctx.measureText(text).width; if (widths.size > 6000) widths.clear(); widths.set(key, w); }
    return w;
  }
  function overlaps(placed, x0, y0, x1, y1) {
    for (var i = 0; i < placed.length; i++) { var p = placed[i]; if (x0 < p[2] && x1 > p[0] && y0 < p[3] && y1 > p[1]) return true; }
    return false;
  }
  function requestDraw() { if (!drawQueued) { drawQueued = true; requestAnimationFrame(function () { drawQueued = false; draw(); }); } }

  function draw() {
    if (!W || state.view !== 'map') return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);
    var k = T.k, tx = T.x, ty = T.y, i, l;
    var f = state.hover && state.hover.vis ? state.hover : (state.sel && state.sel.vis ? state.sel : null);
    var fs = f ? focusSet(f) : null;

    // edges
    var groups = [['plain', []], ['parent', []], ['inferred', []]];
    for (i = 0; i < links.length; i++) {
      l = links[i]; if (!l.vis || (fs && fs.links.has(l))) continue;
      (l.kind === 'parent' ? groups[1][1] : l.inferred ? groups[2][1] : groups[0][1]).push(l);
    }
    var dense = Math.max(0.4, Math.min(1, 1100 / (links.length + 1)));
    ctx.lineWidth = 1; ctx.strokeStyle = C.edge; ctx.globalAlpha = (fs ? 0.3 : 1) * dense;
    groups.forEach(function (g) {
      if (!g[1].length) return;
      ctx.setLineDash(g[0] === 'parent' ? [6, 4] : g[0] === 'inferred' ? [2, 4] : []);
      if (g[0] === 'parent') { ctx.strokeStyle = C.labelDim; ctx.globalAlpha = fs ? 0.2 : 0.7; }
      ctx.beginPath();
      g[1].forEach(function (l) { ctx.moveTo(l.source.x * k + tx, l.source.y * k + ty); ctx.lineTo(l.target.x * k + tx, l.target.y * k + ty); });
      ctx.stroke();
    });
    ctx.setLineDash([]);
    if (fs) {
      ctx.globalAlpha = 1; ctx.strokeStyle = C.edgeStrong;
      fs.links.forEach(function (l) {
        var direct = l.source === f || l.target === f;
        ctx.lineWidth = direct ? 1.5 : 1; ctx.globalAlpha = direct ? 0.95 : 0.55;
        ctx.setLineDash(l.kind === 'parent' ? [6, 4] : l.inferred ? [2, 4] : []);
        ctx.beginPath(); ctx.moveTo(l.source.x * k + tx, l.source.y * k + ty); ctx.lineTo(l.target.x * k + tx, l.target.y * k + ty); ctx.stroke();
      });
      ctx.setLineDash([]);
    }

    // nodes: entities first, then themes and claims on top
    var order = ['entity', 'theme', 'claim'];
    for (var o = 0; o < 3; o++) for (i = 0; i < nodes.length; i++) {
      var n = nodes[i]; if (!n.vis || n.kind !== order[o]) continue;
      drawNode(n, fs && !fs.nodes.has(n) ? 0.16 : 1);
    }
    ctx.globalAlpha = 1;

    // labels, greedily placed by priority
    var cand = [];
    for (i = 0; i < nodes.length; i++) {
      n = nodes[i]; if (!n.vis) continue;
      var sx = n.x * k + tx, sy = n.y * k + ty;
      if (sx < -60 || sy < -30 || sx > W + 60 || sy > H + 30) continue;
      var a = 1, pri = n.degree, text;
      if (fs) {
        if (!fs.nodes.has(n)) continue;
        pri += n === f ? 1e6 : n.kind === 'claim' ? 500 : 0;
      } else if (n.kind === 'claim') { pri += 300; }
      else if (n.hub) { pri += 200; }
      else { a = Math.min(1, (k * n.r - 6.2) / 3.2); if (a <= 0.05) continue; }
      if (n.kind === 'claim') text = (fs || k > 1.25) ? n.id + '  ' + trunc(n.title, n === f ? 60 : 34) : n.id;
      else text = trunc(n.name, n === f ? 60 : n.kind === 'theme' ? 44 : 30);
      cand.push({ n: n, x: sx, y: sy, a: a, pri: pri, text: text });
    }
    cand.sort(function (p, q) { return q.pri - p.pri; });
    var placed = [];
    for (i = 0; i < nodes.length; i++) {   // labels keep clear of the nodes that matter
      n = nodes[i]; if (!fs || !n.vis || !fs.nodes.has(n)) continue;
      var nr = rs(n) * (n.kind === 'claim' ? 1.1 : 0.9), nx = n.x * k + tx, ny = n.y * k + ty;
      if (nr > 3.5) placed.push([nx - nr, ny - nr, nx + nr, ny + nr]);
    }
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    cand.forEach(function (c) {
      var big = c.n === f || c.n.hub || c.n.kind === 'claim';
      var font = (c.n === f ? '600 13px ' : big ? '500 12px ' : '400 11px ') + FONT;
      var w = textW(font, c.text), r = rs(c.n) * (c.n.kind === 'claim' ? 1.22 : 1);
      var cx = w + 12 < W ? Math.min(Math.max(c.x, w / 2 + 6), W - w / 2 - 6) : c.x;   // keep the text on screen
      var y = c.y + r + 9, x0 = cx - w / 2 - 3, x1 = cx + w / 2 + 3;
      if (c.n !== f && overlaps(placed, x0, y - 7, x1, y + 7)) return;
      placed.push([x0, y - 7, x1, y + 7]);
      ctx.font = font; ctx.globalAlpha = c.a;
      ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.strokeText(c.text, cx, y);
      ctx.fillStyle = big ? C.label : C.labelDim; ctx.fillText(c.text, cx, y);
    });
    ctx.globalAlpha = 1;

    // edge labels for the selected node
    if (state.sel && state.sel.vis && f === state.sel) {
      var efont = 'italic 400 11px ' + FONT, s = state.sel, labs = [];
      fs.links.forEach(function (l) {
        var text = '';
        if (l.kind === 'rel') {
          var rr = l.rels.filter(relOn);
          if (s.kind === 'claim') rr = rr.filter(function (r) { return r.claims.indexOf(s.id) >= 0; });
          if (!rr.length) return;
          text = trunc(rr[0].label, 34) + (rr.length > 1 ? ' +' + (rr.length - 1) : '');
        } else if (l.kind === 'parent') text = 'follows up on';
        else return;
        var ax = l.source.x * k + tx, ay = l.source.y * k + ty, bx = l.target.x * k + tx, by = l.target.y * k + ty;
        var len = Math.hypot(bx - ax, by - ay); if (len < 70) return;
        labs.push({ text: text, x: (ax + bx) / 2, y: (ay + by) / 2, len: len, direct: l.source === s || l.target === s });
      });
      labs.sort(function (p, q) { return (q.direct - p.direct) || (q.len - p.len); });
      ctx.font = efont;
      labs.forEach(function (c) {
        var w = textW(efont, c.text), x0 = c.x - w / 2 - 4, x1 = c.x + w / 2 + 4;
        if (c.x < 0 || c.x > W || c.y < 0 || c.y > H || overlaps(placed, x0, c.y - 7, x1, c.y + 7)) return;
        placed.push([x0, c.y - 7, x1, c.y + 7]);
        ctx.lineWidth = 3.5; ctx.strokeStyle = C.bg; ctx.strokeText(c.text, c.x, c.y);
        ctx.fillStyle = C.accent; ctx.fillText(c.text, c.x, c.y);
      });
    }
  }

  function initGraph() {
    if (!d3) { $('view-map').insertAdjacentHTML('beforeend', '<p class="overlay" style="left:16px;top:16px;padding:10px 12px;max-width:320px">The map needs the d3 library, which did not load. The Claims list tab has the same content as text.</p>'); return; }
    layout();
    zoom = d3.zoom().scaleExtent([0.1, 8]).on('zoom', function (e) { T = e.transform; draw(); });
    var moved = false;
    var drag = d3.drag().container(canvas)
      .subject(function (e) { var n = hit(e.x, e.y, 8); return n ? { x: e.x, y: e.y, node: n } : undefined; })
      .on('start', function () { moved = false; })
      .on('drag', function (e) {
        var n = e.subject.node;
        if (!moved) { moved = true; sim.alphaTarget(0.12).restart(); }
        n.fx = (e.x - T.x) / T.k; n.fy = (e.y - T.y) / T.k;
      })
      .on('end', function (e) { var n = e.subject.node; if (moved) sim.alphaTarget(0); n.fx = null; n.fy = null; });
    d3.select(canvas).call(drag).call(zoom).on('dblclick.zoom', null);

    canvas.addEventListener('click', function (e) {
      var b = canvas.getBoundingClientRect(), n = hit(e.clientX - b.left, e.clientY - b.top, 9);
      if (n) select(n, { center: 'ifHidden' }); else if (state.sel) deselect();
    });
    canvas.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var b = canvas.getBoundingClientRect(), n = e.buttons ? state.hover : hit(e.clientX - b.left, e.clientY - b.top, 3);
      if (n !== state.hover) { state.hover = n; canvas.classList.toggle('over-node', !!n); canvas.title = n ? n.name : ''; requestDraw(); }
    });
    canvas.addEventListener('pointerleave', function () { if (state.hover) { state.hover = null; canvas.classList.remove('over-node'); requestDraw(); } });
    canvas.addEventListener('keydown', function (e) {
      var s = d3.select(canvas), step = 60;
      if (e.key === 'ArrowLeft') zoom.translateBy(s, step / T.k, 0);
      else if (e.key === 'ArrowRight') zoom.translateBy(s, -step / T.k, 0);
      else if (e.key === 'ArrowUp') zoom.translateBy(s, 0, step / T.k);
      else if (e.key === 'ArrowDown') zoom.translateBy(s, 0, -step / T.k);
      else if (e.key === '+' || e.key === '=') zoom.scaleBy(s, 1.3);
      else if (e.key === '-' || e.key === '_') zoom.scaleBy(s, 1 / 1.3);
      else if (e.key === '0') fit(true);
      else if (e.key === 'Escape') deselect();
      else return;
      e.preventDefault();
    });
    $('zoom-in').addEventListener('click', function () { zoom.scaleBy(d3.select(canvas), 1.4); });
    $('zoom-out').addEventListener('click', function () { zoom.scaleBy(d3.select(canvas), 1 / 1.4); });
    $('zoom-fit').addEventListener('click', function () { fit(true); });
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas.parentElement);
    window.addEventListener('resize', resize);
    resize();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { widths.clear(); requestDraw(); });
  }

  // ------------------------------------------------------------------ panel
  function nodeChip(n, extra) {
    var mark = n.kind === 'claim' ? vicon(n.verdict, 13)
      : n.kind === 'theme' ? shape('hexagon', 'var(--theme)', true).replace('width="16" height="16"', 'width="12" height="12"')
        : '<i class="dot c-' + n.type + '"></i>';
    var cls = 'nodechip' + (n.kind === 'claim' ? ' v-' + n.verdict : '') + (extra && extra.inferred ? ' inferred' : '');
    var label = n.kind === 'claim' ? n.id + ' ' + n.title : n.name;
    return '<button type="button" class="' + cls + '" data-key="' + esc(n.key) + '" title="' + esc(label) + '">' + mark + '<span>' + esc(n.kind === 'claim' && extra && extra.short ? n.id : trunc(label, 44)) + '</span></button>';
  }
  function claimRef(c) {
    return '<li><div class="claimref"><button type="button" class="linkbtn" data-key="' + esc(c.key) + '"><span class="mono">' + esc(c.id) + '</span> ' + esc(c.title) + '</button>' + badge(c.verdict) + '</div></li>';
  }
  function relRow(r, self) {
    var s = byKey.get(r.s), t = byKey.get(r.t);
    function end(n) { return n === self ? '<strong>' + esc(n.name) + '</strong>' : '<button type="button" class="linkbtn" data-key="' + esc(n.key) + '">' + esc(n.name) + '</button>'; }
    var meta = ['<span class="tag">' + esc(RLABEL[r.type] || r.type) + '</span>'];
    if (r.date) meta.push('<span class="num">' + esc(r.date) + '</span>');
    if (r.amount_usd != null) meta.push('<span class="num">' + esc(money(r.amount_usd)) + '</span>');
    r.claims.forEach(function (cid) { var c = byKey.get(cid); if (c && c !== self) meta.push('<button type="button" class="linkbtn mono" data-key="' + esc(cid) + '">' + esc(cid) + '</button>'); });
    return '<li><div>' + end(s) + ' <span class="lab">' + esc(r.label) + '</span> ' + end(t) + '</div><div class="sub">' + meta.join('') + '</div></li>';
  }
  function section(title, n, body) { return '<section><h3>' + title + (n != null ? '<span class="n num">' + n + '</span>' : '') + '</h3>' + body + '</section>'; }
  function list(items) { return '<ul class="plain">' + items.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + '</ul>'; }
  function hiddenNotice(n) {
    return n.vis ? '' : '<div class="notice"><span>Hidden on the map by the current filters.</span><button type="button" class="btn small" data-act="reset-filters">Reset filters</button></div>';
  }
  function tallyHtml() {
    var tally = {}; claims.forEach(function (c) { tally[c.verdict] = (tally[c.verdict] || 0) + 1; });
    var vs = VERDICTS.filter(function (v) { return tally[v]; });
    return '<div class="tally"><div class="tallybar" role="img" aria-label="' + esc(vs.map(function (v) { return VLABEL[v] + ' ' + tally[v]; }).join(', ')) + '">' +
      vs.map(function (v) { return '<i class="v-' + v + '" style="flex:' + tally[v] + '"></i>'; }).join('') + '</div><div class="tallykey">' +
      vs.map(function (v) { return '<span class="v-' + v + '">' + vicon(v, 14) + VLABEL[v] + ' <b class="num">' + tally[v] + '</b></span>'; }).join('') + '</div></div>';
  }

  function claimPanel(c) {
    var h = '', fu = c.origin === 'follow-up';
    h += '<div class="titleblock"><h2><span class="mono">' + esc(c.id) + '</span>' + esc(c.title) + '</h2><div class="metaline">' + badge(c.verdict, true) +
      (c.confidence ? '<span>Confidence: <strong>' + esc(c.confidence) + '</strong></span>' : '') + '</div>';
    if (c.verdict !== 'pending') h += '<p class="note">' + esc(VMEANS[c.verdict]) + '</p>';
    h += '</div>' + hiddenNotice(c);
    if (c.verdict === 'pending') h += '<div class="notice">This claim has not been checked yet. The entities shown are the ones named in the claim text.</div>';
    else if (c.verdict_from_report) h += '<div class="notice">The verdict is taken from the written report below. The structured breakdown for this claim has not been added yet.</div>';
    if (c.claim) h += section(fu ? 'Lead investigated' : 'What the video said', null, '<p class="quote">' + esc(c.claim) + '</p>' +
      (!fu && c.lines ? '<p class="note">Transcript lines ' + esc(c.lines) + '</p>' : fu ? '<p class="note">A follow-up lead that the video did not cover, checked the same way.</p>' : ''));
    var parents = arr(c.parents).map(function (k) { return byKey.get(k); }).filter(Boolean);
    if (parents.length) h += section('Follows up on', null, '<div class="nodechips">' + parents.map(function (p) { return nodeChip(p); }).join('') + '</div>');
    var kids = claims.filter(function (k) { return arr(k.parents).indexOf(c.id) >= 0; });
    if (kids.length) h += section('Follow-up checks', kids.length, '<div class="nodechips">' + kids.map(function (p) { return nodeChip(p); }).join('') + '</div>');
    if (c.summary) h += section('Summary', null, '<p>' + inline(c.summary) + '</p>');
    var subs = arr(c.sub_claims);
    if (subs.length) {
      h += section('Sub-claims', subs.length, '<table class="subtable"><thead><tr><th scope="col">Verdict</th><th scope="col">Statement and finding</th></tr></thead><tbody>' +
        subs.map(function (s) {
          var v = VERDICTS.indexOf(s.verdict) >= 0 ? s.verdict : 'pending';
          var cites = arr(s.sources).filter(safeUrl).map(function (u) { return extLink(u, esc(host(u))); }).join('');
          return '<tr><td>' + badge(v) + '</td><td><div class="st">' + inline(s.statement || '') + '</div>' + (s.finding ? '<div class="fd">' + inline(s.finding) + '</div>' : '') +
            (cites ? '<div class="cites">' + cites + '</div>' : '') + '</td></tr>';
        }).join('') + '</tbody></table>');
    }
    if (arr(c.corrections).length) h += section('Corrections', c.corrections.length, list(c.corrections));
    if (arr(c.denials_and_context).length) h += section('The other side and context', c.denials_and_context.length, list(c.denials_and_context));
    var ents = [];
    c.adj.forEach(function (l, k) { var o = byKey.get(k); if (o.kind === 'entity') ents.push({ n: o, inferred: l.inferred }); });
    ents.sort(function (a, b) { return b.n.degree - a.n.degree; });
    if (ents.length) h += section('People and organisations involved', ents.length, '<div class="nodechips">' + ents.map(function (e) { return nodeChip(e.n, e); }).join('') + '</div>' +
      (ents.some(function (e) { return e.inferred; }) ? '<p class="note">Dashed outline: named in the claim text; not yet confirmed by a completed check.</p>' : ''));
    var th = themes.filter(function (t) { return arr(t.claims).indexOf(c.id) >= 0; });
    if (th.length) h += section('Themes', null, '<div class="nodechips">' + th.map(function (t) { return nodeChip(t); }).join('') + '</div>');
    var cr = rels.filter(function (r) { return r.claims.indexOf(c.id) >= 0; });
    if (cr.length) h += section('Relationships documented', cr.length, '<details class="fold"' + (cr.length <= 8 ? ' open' : '') + '><summary>' + plural(cr.length, 'relationship', 'relationships') + ' between the parties</summary><ul class="rowlist">' + cr.map(function (r) { return relRow(r, c); }).join('') + '</ul></details>');
    var leads = arr(c.leads);
    if (leads.length) h += section('Leads the video did not cover', leads.length, '<p class="note">Adjacent stories found during research. They are pointers for further checking, not findings.</p><ul class="rowlist">' + leads.map(function (l) {
      var chips = arr(l.entities).map(function (id) { var e = byKey.get('e:' + id); return e ? nodeChip(e) : '<span class="tag">' + esc(id) + '</span>'; }).join('');
      return '<li><div><strong>' + esc(l.title) + '</strong></div><div class="lab">' + inline(l.why_connected || '') + '</div>' +
        (chips ? '<div class="nodechips">' + chips + '</div>' : '') + (safeUrl(l.source_url) ? '<div class="sub">' + extLink(l.source_url, 'Source: ' + esc(host(l.source_url))) + '</div>' : '') + '</li>';
    }).join('') + '</ul>');
    var src = arr(c.sources);
    if (src.length) h += section('Sources', src.length, '<details class="fold"' + (src.length <= 6 ? ' open' : '') + '><summary>' + plural(src.length, 'source', 'sources') + '</summary><ol class="sources">' + src.map(function (s) {
      var meta = [s.publisher, s.date].filter(Boolean).map(esc).join(', ');
      return '<li>' + extLink(s.url, esc(s.title || s.url || 'Source')) + (meta ? '<div class="sub">' + meta + '</div>' : '') + '</li>';
    }).join('') + '</ol></details>');
    if (c.report) h += section('Full report', null, '<details class="fold" data-report="' + esc(c.key) + '"><summary>Read the full written report</summary><div class="md"></div></details>');
    return h;
  }
  function entityPanel(e) {
    var h = '<div class="titleblock"><h2>' + esc(e.name) + '</h2><div class="metaline"><span><i class="dot c-' + e.type + '"></i> ' + esc(TLABEL[e.type]) + '</span><span class="num">' +
      plural(claimsOf(e).length, 'claim', 'claims') + ' · ' + plural(e.degree, 'connection', 'connections') + '</span></div>';
    if (arr(e.aliases).length) h += '<p class="note">Also appears as: ' + esc(e.aliases.join('; ')) + '</p>';
    h += '</div>' + hiddenNotice(e);
    if (e.description) h += section('Description', null, '<p>' + inline(e.description) + '</p>' + (arr(e.more).length ? '<details class="fold"><summary>How other claims describe it</summary>' + list(e.more) + '</details>' : ''));
    else h += '<p class="note">No description has been recorded for this entry yet.</p>';
    var cl = claimsOf(e);
    if (cl.length) h += section('Appears in claims', cl.length, '<ul class="rowlist">' + cl.map(claimRef).join('') + '</ul>');
    if (e.rels.length) {
      var rr = e.rels.slice().sort(function (a, b) { return String(a.date || '9999').localeCompare(String(b.date || '9999')); });
      h += section('Relationships', rr.length, '<ul class="rowlist">' + rr.map(function (r) { return relRow(r, e); }).join('') + '</ul>');
    }
    var th = themes.filter(function (t) { return arr(t.entities).indexOf(e.key) >= 0; });
    if (th.length) h += section('Themes', null, '<div class="nodechips">' + th.map(function (t) { return nodeChip(t); }).join('') + '</div>');
    h += '<p class="note">Appearing here means this name comes up in the checked claims. It is not a statement about conduct.</p>';
    return h;
  }
  function themePanel(t) {
    var cl = arr(t.claims).map(function (k) { return byKey.get(k); }).filter(Boolean);
    var en = arr(t.entities).map(function (k) { return byKey.get(k); }).filter(Boolean);
    var h = '<div class="titleblock"><h2>' + esc(t.name) + '</h2><div class="metaline"><span>Theme</span><span class="num">' + plural(cl.length, 'claim', 'claims') + ' · ' + plural(en.length, 'entity', 'entities') + '</span></div></div>' + hiddenNotice(t);
    if (t.description) h += section('Description', null, '<p>' + inline(t.description) + '</p>');
    if (cl.length) h += section('Claims', cl.length, '<ul class="rowlist">' + cl.map(claimRef).join('') + '</ul>');
    if (en.length) h += section('People and organisations', en.length, '<div class="nodechips">' + en.map(function (e) { return nodeChip(e); }).join('') + '</div>');
    return h;
  }
  function overviewPanel() {
    var fu = claims.filter(function (c) { return c.origin === 'follow-up'; }).length, vid = claims.length - fu;
    var checked = claims.filter(function (c) { return c.verdict !== 'pending'; }).length;
    var hubs = entities.slice().sort(function (a, b) { return claimsOf(b).length - claimsOf(a).length || b.degree - a.degree; }).slice(0, 8);
    var h = '<div class="titleblock"><h2>What this map shows</h2><p>' + plural(vid, 'claim', 'claims') + ' made in Coffeezilla’s video “Investigating The President” about business dealings of the Trump family and people around it' +
      (fu ? ', plus ' + plural(fu, 'follow-up lead', 'follow-up leads') + ' the video did not cover' : '') +
      '. Each was checked independently against court filings, regulatory records, financial disclosures and news reporting.</p></div>';
    h += '<div class="kv num"><div><b>' + claims.length + '</b><span>claims</span></div><div><b>' + checked + '</b><span>checked so far</span></div><div><b>' + entities.length + '</b><span>people and organisations</span></div><div><b>' + rels.length + '</b><span>documented relationships</span></div></div>';
    h += section('Verdicts so far', null, tallyHtml());
    h += section('How to read it', null, '<ul class="howto">' +
      '<li><span class="glyph">' + shape('diamond', 'var(--v-mostly-accurate)') + '</span><span><strong>Diamonds are claims from the video.</strong> Colour and the mark inside show the verdict.</span></li>' +
      (fu ? '<li><span class="glyph">' + shape('square', 'var(--v-mostly-accurate)') + '</span><span><strong>Squares are follow-up leads</strong>, linked by a dashed line to the claim they grew out of.</span></li>' : '') +
      '<li><span class="glyph">' + shape('circle', 'var(--t-company)') + '</span><span><strong>Circles are people, companies, agencies, assets and laws.</strong> Bigger circles appear in more claims and relationships.</span></li>' +
      (themes.length ? '<li><span class="glyph">' + shape('hexagon', 'var(--theme)', true) + '</span><span><strong>Hexagons are themes</strong> that group related claims.</span></li>' : '') +
      '<li><span class="glyph">' + vicon('confirmed') + '</span><span>Select a node to see its neighbourhood, the evidence, the corrections and the other side. Use the Claims list for a plain-text version.</span></li></ul>');
    h += section('What the verdicts mean', null, '<ul class="rowlist">' + VERDICTS.map(function (v) { return '<li><div class="claimref"><span class="note">' + esc(VMEANS[v]) + '</span>' + badge(v) + '</div></li>'; }).join('') + '</ul>');
    if (hubs.length) h += section('Start with the names that recur most', null, '<div class="nodechips">' + hubs.map(function (e) { return nodeChip(e); }).join('') + '</div>');
    h += section('Reading it fairly', null, '<p class="note">A verdict rates how accurately the video described the public record. It is not a judgement of anyone’s conduct. Everyone named denies wrongdoing, and nothing here is an accusation of a crime. A line between two nodes means they appear together in a documented claim or relationship; it does not show that one thing caused another. Each claim lists the denials and the context that cuts the other way.</p>' +
      (META.generated ? '<p class="note">Data built ' + esc(META.generated) + '.</p>' : ''));
    return h;
  }
  function renderPanel() {
    var n = state.sel, body = $('panel-body');
    $('panel-crumb').textContent = !n ? 'Overview' : n.kind === 'claim' ? (n.origin === 'follow-up' ? 'Follow-up lead' : 'Claim from the video') : n.kind === 'theme' ? 'Theme' : TLABEL[n.type];
    body.innerHTML = !n ? overviewPanel() : n.kind === 'claim' ? claimPanel(n) : n.kind === 'theme' ? themePanel(n) : entityPanel(n);
    body.scrollTop = 0;
    $('panel-close').hidden = !n && !narrow.matches;
    document.querySelectorAll('[aria-current="true"]').forEach(function (el) { el.removeAttribute('aria-current'); });
    if (n) document.querySelectorAll('.stage [data-key="' + (window.CSS && CSS.escape ? CSS.escape(n.key) : n.key) + '"]').forEach(function (el) { el.setAttribute('aria-current', 'true'); });
  }
  function openPanel(open) {
    var p = $('panel');
    p.classList.toggle('open', open);
    if (!open) { p.classList.remove('tall'); $('panel-size').setAttribute('aria-pressed', 'false'); }
  }

  // ------------------------------------------------------------------ selection / routing
  function setHash(h) {
    state.lastHash = h || '';
    try {
      var cur = decodeURIComponent(location.hash.replace(/^#/, ''));
      if (cur !== (h || '')) location.hash = h || '';
    } catch (e) { /* hash is a convenience only */ }
  }
  function select(n, opts) {
    opts = opts || {};
    state.sel = n; state.hover = null;
    renderPanel(); openPanel(true);
    if (!opts.fromHash) setHash(n.hash);
    if (state.view === 'map') {
      if (opts.center === 'ifHidden') centerOn(n, true, true);
      else if (opts.center !== false) focusOn(n, opts.animate !== false);
      requestDraw();
    }
  }
  function deselect(keepHash) {
    state.sel = null;
    renderPanel();
    if (narrow.matches) openPanel(false);
    if (!keepHash) setHash(state.view === 'map' ? '' : state.view);
    requestDraw();
  }
  function setView(v, fromHash) {
    if (['map', 'claims', 'common'].indexOf(v) < 0) v = 'map';
    state.view = v;
    ['map', 'claims', 'common'].forEach(function (name) {
      $('view-' + name).hidden = name !== v;
      $('tab-' + name).setAttribute('aria-selected', String(name === v));
      $('tab-' + name).tabIndex = name === v ? 0 : -1;
    });
    $('btn-filters').hidden = v !== 'map';
    if (v !== 'map') showFilters(false);
    if (v === 'map') { resize(); if (state.sel) centerOn(state.sel, false, true); requestDraw(); }
    if (!fromHash && !state.sel) setHash(v === 'map' ? '' : v);
  }
  function applyHash(initial) {
    var h = '';
    try { h = decodeURIComponent(location.hash.replace(/^#/, '')); } catch (e) { h = ''; }
    if (!initial && h === state.lastHash) return;
    state.lastHash = h;
    if (h === 'claims' || h === 'common') { if (state.sel) deselect(true); setView(h, true); return; }
    var n = h ? byHash.get(h.toLowerCase()) : null;
    if (n) { if (state.view !== 'map') setView('map', true); select(n, { fromHash: true, animate: !initial }); }
    else if (!initial) { if (state.sel) deselect(true); if (!h) setView('map', true); }
  }

  // ------------------------------------------------------------------ list views
  function renderClaimsView() {
    function rows(list) {
      return '<ul class="claimlist">' + list.map(function (c) {
        return '<li><button type="button" class="claimrow" data-key="' + esc(c.key) + '"><span class="id">' + esc(c.id) + '</span><span class="t">' + esc(c.title) + '</span>' + badge(c.verdict) +
          '<span class="c">' + esc(c.summary || c.claim || '') + '</span></button></li>';
      }).join('') + '</ul>';
    }
    var vid = claims.filter(function (c) { return c.origin !== 'follow-up'; }), fu = claims.filter(function (c) { return c.origin === 'follow-up'; });
    var h = '<h2>All claims and verdicts</h2><p class="lede">Every claim on the map as plain text. Select a row for the breakdown, corrections, the other side and sources. A verdict rates the accuracy of the claim against the public record, not anyone’s conduct.</p>' + tallyHtml();
    if (!claims.length) h += '<p class="lede">No claims have been loaded.</p>';
    if (vid.length) h += '<h3>Claims from the video <span class="num">(' + vid.length + ')</span></h3>' + rows(vid);
    if (fu.length) h += '<h3>Follow-up leads the video did not cover <span class="num">(' + fu.length + ')</span></h3>' + rows(fu);
    $('claims-inner').innerHTML = h;
  }
  function renderCommonView() {
    var by = state.rankBy;
    var ranked = entities.map(function (e) { return { n: e, cl: claimsOf(e) }; })
      .sort(function (a, b) { return by === 'claims' ? (b.cl.length - a.cl.length || b.n.degree - a.n.degree) : (b.n.degree - a.n.degree || b.cl.length - a.cl.length); }).slice(0, 40);
    var max = Math.max.apply(null, ranked.map(function (r) { return by === 'claims' ? r.cl.length : r.n.degree; }).concat([1]));
    function bar(cl) {
      var t = {}; cl.forEach(function (c) { t[c.verdict] = (t[c.verdict] || 0) + 1; });
      return VERDICTS.filter(function (v) { return t[v]; }).map(function (v) { return '<i class="v-' + v + '" style="width:' + (100 * t[v] / max).toFixed(2) + '%" title="' + VLABEL[v] + ': ' + t[v] + '"></i>'; }).join('');
    }
    var h = '<h2>Common denominators</h2><p class="lede">The names that recur across the most claims, and the themes that tie claims together. Recurrence shows where the claims converge. It is a count of appearances, not a finding about anyone.</p><div class="ranks"><div>' +
      '<div class="rankhead"><h3>People and organisations</h3><div class="seg" role="group" aria-label="Rank by"><button type="button" data-rank="claims" aria-pressed="' + (by === 'claims') + '">By claims</button><button type="button" data-rank="degree" aria-pressed="' + (by === 'degree') + '">By connections</button></div></div><ol class="ranklist">' +
      ranked.map(function (r, i) {
        return '<li><button type="button" class="rankrow" data-key="' + esc(r.n.key) + '"><span class="rk">' + (i + 1) + '</span><span class="nm"><i class="dot c-' + r.n.type + '"></i><b>' + esc(r.n.name) + '</b></span><span class="val num">' +
          (by === 'claims' ? plural(r.cl.length, 'claim', 'claims') : plural(r.n.degree, 'connection', 'connections')) + '</span><span class="bar">' +
          (by === 'claims' ? bar(r.cl) : '<i style="width:' + (100 * r.n.degree / max).toFixed(2) + '%;background:var(--c)" class="c-' + r.n.type + '"></i>') + '</span></button></li>';
      }).join('') + '</ol>' + (by === 'claims' ? '<p class="note">Bar segments show the verdicts of the claims each name appears in.</p>' : '') + '</div><div><div class="rankhead"><h3>Themes</h3></div>';
    if (themes.length) {
      var tr = themes.map(function (t) { return { n: t, cl: arr(t.claims).map(function (k) { return byKey.get(k); }).filter(Boolean) }; }).sort(function (a, b) { return b.cl.length - a.cl.length; });
      var tmax = Math.max.apply(null, tr.map(function (r) { return r.cl.length; }).concat([1])), keep = max; max = tmax;
      h += '<ol class="ranklist">' + tr.map(function (r, i) {
        return '<li><button type="button" class="rankrow" data-key="' + esc(r.n.key) + '"><span class="rk">' + (i + 1) + '</span><span class="nm"><b>' + esc(r.n.name) + '</b></span><span class="val num">' + plural(r.cl.length, 'claim', 'claims') + '</span><span class="bar">' + bar(r.cl) + '</span></button></li>';
      }).join('') + '</ol>'; max = keep;
    } else h += '<p class="note" style="margin-top:8px">Themes have not been added to the data yet. When they are, they will be ranked here by the number of claims they group.</p>';
    var tc = {}; rels.forEach(function (r) { tc[r.type] = (tc[r.type] || 0) + 1; });
    var rt = RTYPES.filter(function (t) { return tc[t]; }).sort(function (a, b) { return tc[b] - tc[a]; }), rmax = rt.length ? tc[rt[0]] : 1;
    if (rt.length) h += '<div class="rankhead" style="margin-top:22px"><h3>Kinds of relationship documented</h3></div><ol class="ranklist">' + rt.map(function (t, i) {
      return '<li><div class="rankrow"><span class="rk">' + (i + 1) + '</span><span class="nm"><b>' + RLABEL[t] + '</b></span><span class="val num">' + tc[t] + '</span><span class="bar"><i style="width:' + (100 * tc[t] / rmax).toFixed(2) + '%"></i></span></div></li>';
    }).join('') + '</ol>';
    $('common-inner').innerHTML = h + '</div></div>';
  }

  // ------------------------------------------------------------------ legend / filters
  function renderLegend() {
    var tally = {}; claims.forEach(function (c) { tally[c.verdict] = (tally[c.verdict] || 0) + 1; });
    var hasFu = claims.some(function (c) { return c.origin === 'follow-up'; });
    var h = '<h4>Claims by verdict</h4><ul>' + VERDICTS.filter(function (v) { return tally[v] || v !== 'pending'; }).filter(function (v) { return tally[v]; }).map(function (v) {
      return '<li class="v-' + v + '"><span class="glyph">' + vicon(v, 14) + '</span>' + VLABEL[v] + '<span class="n num">' + tally[v] + '</span></li>';
    }).join('') + '</ul><h4>Shapes</h4><ul><li><span class="glyph">' + shape('diamond', 'var(--muted)') + '</span>Claim from the video</li>' +
      (hasFu ? '<li><span class="glyph">' + shape('square', 'var(--muted)') + '</span>Follow-up lead</li>' : '') +
      '<li><span class="glyph">' + shape('circle', 'var(--muted)') + '</span>Person, organisation or thing</li>' +
      (themes.length ? '<li><span class="glyph">' + shape('hexagon', 'var(--theme)', true) + '</span>Theme</li>' : '') + '</ul><h4>Circle colours</h4><ul>';
    var fam = [['person', 'People'], ['company', 'Companies and funds'], ['government', 'Governments and countries'], ['asset', 'Assets and products'], ['law', 'Laws and events'], ['media', 'Media']];
    h += fam.map(function (f) { return '<li><span class="glyph"><i class="dot c-' + f[0] + '"></i></span>' + f[1] + '</li>'; }).join('') + '</ul>';
    $('legend-body').innerHTML = h;
  }
  function renderFilters() {
    function group(key, title, label, mark) {
      var opts = present(key); if (opts.length < 2 && key !== 'kind') return '';
      return '<fieldset><legend>' + title + '</legend><div class="chips">' + opts.map(function (o) {
        return '<label class="chip"><input type="checkbox" id="f-' + key + '-' + o.v + '" data-group="' + key + '" value="' + o.v + '"' + (F[key].has(o.v) ? ' checked' : '') + '><span>' + (mark ? mark(o.v) : '') + label(o.v) + ' <b class="n num">' + o.n + '</b></span></label>';
      }).join('') + '</div></fieldset>';
    }
    $('filters').innerHTML = '<header><h3>Filters</h3><button type="button" class="btn small" data-act="reset-filters">Reset</button><button type="button" class="iconbtn" data-act="close-filters" aria-label="Close filters"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3.5 3.5l9 9M12.5 3.5l-9 9"></path></svg></button></header>' +
      group('kind', 'Show', function (v) { return { claim: 'Claims', entity: 'People and organisations', theme: 'Themes' }[v]; }) +
      group('origin', 'Claim origin', function (v) { return v === 'video' ? 'From the video' : 'Follow-up leads'; }) +
      group('verdict', 'Claim verdict', function (v) { return VLABEL[v]; }, function (v) { return '<i class="v-' + v + '" style="display:inline-flex">' + vicon(v, 13) + '</i>'; }) +
      group('etype', 'Entity type', function (v) { return TPLURAL[v]; }, function (v) { return '<i class="dot c-' + v + '"></i>'; }) +
      group('rtype', 'Relationship type', function (v) { return RLABEL[v]; });
  }
  function showFilters(on) {
    $('filters').hidden = !on;
    $('btn-filters').setAttribute('aria-expanded', String(on));
  }
  function resetFilters() {
    Object.keys(F).forEach(function (g) { F[g] = new Set(FALL[g]); });
    renderFilters(); applyFilters(); if (state.sel) renderPanel();
  }

  // ------------------------------------------------------------------ search
  var searchIndex = nodes.map(function (n) {
    return { n: n, name: (n.kind === 'claim' ? n.id + ' ' + n.title : n.name).toLowerCase(), alt: (arr(n.aliases).join(' ') + ' ' + (n.id || '')).toLowerCase(), text: ((n.claim || '') + ' ' + (n.summary || '') + ' ' + (n.description || '')).toLowerCase() };
  });
  var results = [], active = -1;
  function runSearch(q) {
    q = q.trim().toLowerCase();
    var box = $('results'), input = $('search');
    if (!q) { box.hidden = true; input.setAttribute('aria-expanded', 'false'); results = []; return; }
    var terms = q.split(/\s+/);
    results = searchIndex.map(function (s) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (s.name.indexOf(t) === 0 || s.name.indexOf(' ' + t) >= 0) score += 6;
        else if (s.name.indexOf(t) >= 0) score += 4;
        else if (s.alt.indexOf(t) >= 0) score += 3;
        else if (s.text.indexOf(t) >= 0) score += 1;
        else return null;
      }
      return { n: s.n, score: score + Math.min(s.n.degree, 40) / 40 };
    }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 12);
    active = results.length ? 0 : -1;
    box.innerHTML = results.length ? results.map(function (r, i) {
      var n = r.n, mark = n.kind === 'claim' ? '<span class="v-' + n.verdict + '" style="display:inline-flex">' + vicon(n.verdict, 14) + '</span>' : n.kind === 'theme' ? shape('hexagon', 'var(--theme)', true) : '<i class="dot c-' + n.type + '"></i>';
      return '<li role="option" id="res-' + i + '" data-i="' + i + '" aria-selected="' + (i === active) + '">' + mark + '<span class="r-name">' + esc(n.kind === 'claim' ? n.id + ' ' + n.title : n.name) + '</span><span class="r-kind">' +
        (n.kind === 'claim' ? VLABEL[n.verdict] : n.kind === 'theme' ? 'Theme' : TLABEL[n.type]) + '</span></li>';
    }).join('') : '<li class="empty">No claim, person or organisation matches “' + esc(q) + '”. Try a surname or a company name.</li>';
    box.hidden = false; input.setAttribute('aria-expanded', 'true');
    input.setAttribute('aria-activedescendant', active >= 0 ? 'res-0' : '');
  }
  function pickResult(i) {
    var r = results[i]; if (!r) return;
    $('results').hidden = true; $('search').setAttribute('aria-expanded', 'false'); $('search').value = '';
    $('search').blur();
    if (state.view !== 'map') setView('map', true);
    select(r.n);
  }

  // ------------------------------------------------------------------ wiring
  function init() {
    readTokens();
    var vid = claims.filter(function (c) { return c.origin !== 'follow-up'; }).length, fu = claims.length - vid;
    if (claims.length) {
      $('intro-wide').textContent = plural(vid, 'claim', 'claims') + ' about Trump-family business dealings from Coffeezilla’s video “Investigating The President”' +
        (fu ? ', plus ' + plural(fu, 'follow-up lead', 'follow-up leads') : '') + ', each checked against public records and reporting. Diamonds are claims, marked by verdict' + (fu ? '; squares are follow-ups' : '') +
        '. Circles are the people, companies and agencies involved. Select anything to see the evidence.';
      $('intro-narrow').textContent = plural(vid, 'claim', 'claims') + ' from Coffeezilla’s “Investigating The President”' + (fu ? ' and ' + plural(fu, 'follow-up', 'follow-ups') : '') +
        ', each checked against the record. Tap a diamond or circle for the evidence.';
    }
    if (!narrow.matches) $('legend').open = true;
    renderLegend(); renderFilters(); renderClaimsView(); renderCommonView();
    applyFilters();
    renderPanel();
    initGraph();
    applyHash(true);

    document.querySelectorAll('.tabs [role="tab"]').forEach(function (b) {
      b.addEventListener('click', function () { setView(b.dataset.view); });
      b.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        var tabs = Array.prototype.slice.call(document.querySelectorAll('.tabs [role="tab"]')), i = tabs.indexOf(b);
        var nx = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length]; nx.focus(); nx.click();
      });
    });
    $('btn-filters').addEventListener('click', function () { showFilters($('filters').hidden); });
    $('btn-about').addEventListener('click', function () { if (state.sel) deselect(); openPanel(true); });
    $('panel-close').addEventListener('click', function () { if (state.sel) deselect(); else openPanel(false); });
    $('panel-size').addEventListener('click', function () {
      var tall = $('panel').classList.toggle('tall'); this.setAttribute('aria-pressed', String(tall));
      this.setAttribute('aria-label', tall ? 'Shrink panel' : 'Expand panel');
    });
    $('filters').addEventListener('submit', function (e) { e.preventDefault(); });
    $('filters').addEventListener('change', function (e) {
      var t = e.target; if (!t.dataset || !t.dataset.group) return;
      if (t.checked) F[t.dataset.group].add(t.value); else F[t.dataset.group].delete(t.value);
      applyFilters(); if (state.sel) renderPanel();
    });
    document.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('[data-key],[data-act],[data-rank]') : null;
      if (!el) return;
      if (el.dataset.act === 'reset-filters') return resetFilters();
      if (el.dataset.act === 'close-filters') return showFilters(false);
      if (el.dataset.rank) { state.rankBy = el.dataset.rank; return renderCommonView(); }
      var n = byKey.get(el.dataset.key); if (n) select(n);
    });
    $('panel-body').addEventListener('toggle', function (e) {   // render the long report only when opened
      var d = e.target; if (!d.dataset || !d.dataset.report || !d.open) return;
      var box = d.querySelector('.md'), n = byKey.get(d.dataset.report);
      if (box && !box.firstChild && n) box.innerHTML = markdown(n.report);
    }, true);

    var input = $('search');
    input.addEventListener('input', function () { runSearch(input.value); });
    input.addEventListener('focus', function () { if (input.value) runSearch(input.value); });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (!results.length) return; e.preventDefault();
        active = (active + (e.key === 'ArrowDown' ? 1 : results.length - 1)) % results.length;
        Array.prototype.forEach.call($('results').children, function (li, i) { li.setAttribute('aria-selected', String(i === active)); if (i === active) li.scrollIntoView({ block: 'nearest' }); });
        input.setAttribute('aria-activedescendant', 'res-' + active);
      } else if (e.key === 'Enter') { e.preventDefault(); if (active >= 0) pickResult(active); }
      else if (e.key === 'Escape') { $('results').hidden = true; input.setAttribute('aria-expanded', 'false'); }
    });
    $('results').addEventListener('mousedown', function (e) { e.preventDefault(); });
    $('results').addEventListener('click', function (e) { var li = e.target.closest('li[data-i]'); if (li) pickResult(+li.dataset.i); });
    document.addEventListener('pointerdown', function (e) {
      if (!e.target.closest('.searchbox')) { $('results').hidden = true; input.setAttribute('aria-expanded', 'false'); }
      if (!$('filters').hidden && !e.target.closest('#filters') && !e.target.closest('#btn-filters') && e.target === canvas) showFilters(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
      else if (e.key === 'Escape' && !$('filters').hidden) showFilters(false);
    });

    window.addEventListener('hashchange', function () { applyHash(false); });
    function retheme() { readTokens(); requestDraw(); }
    if (window.MutationObserver) new MutationObserver(retheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });
    var mq = window.matchMedia('(prefers-color-scheme: dark)');
    if (mq.addEventListener) mq.addEventListener('change', retheme); else if (mq.addListener) mq.addListener(retheme);
    if (narrow.addEventListener) narrow.addEventListener('change', function () { renderPanel(); if (!narrow.matches) openPanel(false); else if (state.sel) openPanel(true); resize(); });
  }
  // small hook for automated checks: where a node is drawn, in page coordinates
  window.__dbg = function (key) {
    var n = byKey.get(key); if (!n) return null;
    var b = canvas.getBoundingClientRect();
    return { x: b.left + n.x * T.k + T.x, y: b.top + n.y * T.k + T.y, k: T.k, vis: n.vis };
  };
  init();
})();
