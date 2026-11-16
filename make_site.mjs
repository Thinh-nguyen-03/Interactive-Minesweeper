#!/usr/bin/env node
/* Build the deployable static site in site/ from map/.

   map/ is the artifact build: one page, hash routes, all data in graph-data.js. This script turns it into a
   site with a real address and a pre-built page for every check, name and view, and splits the data so that a
   visit downloads only what its page needs:

     site/index.html, checks/, checks/C06/, names/<slug>/, method/, map/, map/matrix/, map/topic/<slug>/, 404.html
     site/assets/app.<hash>.js      matrix.js + app.js, unchanged (app.js reads window.__SITE__ and uses paths)
     site/assets/core.<hash>.js     what the home page, lists, search, map and matrix need
     site/assets/d/C06.<hash>.json  the long detail of one check, fetched when its page is opened
     site/robots.txt, sitemap.xml (only when the public address is known)

   Node 18 or later, standard library only.  Usage: node make_site.mjs
   Environment: SITE_URL (public address, e.g. https://example.org), else RENDER_EXTERNAL_URL; SITE_BASE (path
   the site is served under, default "/"). */
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (+process.versions.node.split('.')[0] < 18) { console.error('make_site.mjs needs Node 18 or later; this is ' + process.version); process.exit(1); }
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(ROOT, 'map'), OUT = path.join(ROOT, 'site'), STATIC = path.join(ROOT, 'static');
const BASE = ('/' + String(process.env.SITE_BASE || '/').replace(/^\/+|\/+$/g, '') + '/').replace(/\/+/g, '/');
const ORIGIN = String(process.env.SITE_URL || process.env.RENDER_EXTERNAL_URL || '').trim().replace(/\/+$/, '');
const SITE_NAME = 'The Trump Connection';
const DESCRIPTION = 'Checks of claims about the business, financial and political dealings of Donald Trump, his family and his administration, with a profile for every name and a map of the documented links between them.';
const STANDING = '<p class="pre-note"><strong>Everyone named denies wrongdoing, and nothing here is an accusation of a crime.</strong> A link between two names means a documented relationship, or that both appear in the same check. It does not show that one caused the other.</p>';

const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const arr = v => Array.isArray(v) ? v : [];
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ESC[c]);
const num = n => Number(n || 0).toLocaleString('en-US');
const plural = (n, one, many) => num(n) + ' ' + (n === 1 ? one : (many || one + 's'));
const hash = buf => createHash('sha256').update(buf).digest('hex').slice(0, 10);

// ---------------------------------------------------------------------------------------------- data
const appSrc = read('app.js');
const G = (() => { const w = {}; new Function('window', read('graph-data.js'))(w); return w.GRAPH; })();
if (!G || !Array.isArray(G.nodes)) throw new Error('map/graph-data.js did not define window.GRAPH. Run python3 build.py first.');
const META = G.meta || {};
/* Wording rules live in app.js; the few the static pages need are read from it, so the two cannot drift. */
const rx = name => { const m = new RegExp('var ' + name + ' = (/.+/[a-z]*);').exec(appSrc); if (!m) throw new Error('app.js: ' + name + ' not found'); return new Function('return ' + m[1])(); };
const FLOWS = rx('FLOWS'), VERBISH = rx('VERBISH'), ROLEISH = rx('ROLEISH');
const flows = l => FLOWS.test(l) || VERBISH.test(l);

const VLABEL = { 'confirmed': 'Confirmed', 'mostly-accurate': 'Mostly Accurate', 'partly-accurate': 'Partly Accurate', 'misleading': 'Misleading', 'unverified': 'Unverified', 'false': 'False', 'pending': 'Not Yet Checked' };
const VMEANS = [
  ['confirmed', 'The record supports the claim as stated.'],
  ['mostly-accurate', 'The core facts hold. Specific figures, dates or framings needed correcting, and the corrections are listed.'],
  ['partly-accurate', 'Some parts hold up and others do not.'],
  ['misleading', 'The underlying facts exist, but the framing gives a wrong impression.'],
  ['unverified', 'An allegation that could not be independently corroborated. It is neither confirmed nor refuted.'],
  ['false', 'The record contradicts the claim.']];
const TLABEL = { person: 'Person', company: 'Company', government: 'Government Body', fund: 'Fund', asset: 'Asset or Token', country: 'Country', law: 'Law or Policy', media: 'News Outlet', event: 'Event', product: 'Product' };
const GROUPS = ['person', 'org', 'gov', 'other'];
const GROUP_OF = { person: 'person', company: 'org', fund: 'org', government: 'gov', country: 'gov' };
const GLABEL = { person: 'People', org: 'Companies & Funds', gov: 'Governments & Countries', other: 'Other Names' };
const AUDIT = { upheld: 'upheld the findings', corrected: 'corrected some details', weakened: 'weakened some findings', strengthened: 'strengthened the findings' };

const byKey = new Map();
const nodes = G.nodes.filter(n => n && n.key);
for (const n of nodes) {
  if (n.kind === 'claim' && !VLABEL[n.verdict]) n.verdict = 'pending';
  if (n.kind === 'entity') { if (!TLABEL[n.type]) n.type = 'company'; n.group = GROUP_OF[n.type] || 'other'; }
  n.name = n.name || n.title || n.id || n.key;
  n.lines = []; n.near = new Set();
  byKey.set(n.key, n);
}
const claims = nodes.filter(n => n.kind === 'claim'), entities = nodes.filter(n => n.kind === 'entity');
const cmpClaim = (a, b) => String(a.id).localeCompare(String(b.id), undefined, { numeric: true });
const rels = arr(G.rels).filter(r => byKey.has(r.s) && byKey.has(r.t) && r.s !== r.t);
for (const r of rels) { r.claims = arr(r.claims); r.S = byKey.get(r.s); r.T = byKey.get(r.t); r.S.lines.push(r); r.T.lines.push(r); r.S.near.add(r.t); r.T.near.add(r.s); }
for (const l of arr(G.links)) { const a = byKey.get(l.s), b = byKey.get(l.t); if (a && b && a !== b) { a.near.add(b.key); b.near.add(a.key); } }
for (const e of entities) e.cl = [...e.near].map(k => byKey.get(k)).filter(o => o.kind === 'claim').sort(cmpClaim);
for (const c of claims) {
  c.ents = [...c.near].map(k => byKey.get(k)).filter(o => o.kind === 'entity');
  c.kids = claims.filter(x => arr(x.parents).includes(c.id));
}
for (const e of entities) e.imp = (e.lines.length + 0.5 * e.cl.length) * (e.type === 'media' ? 0.35 : 1);
const ranked = entities.slice().sort((a, b) => b.imp - a.imp || a.name.localeCompare(b.name));
const TOPICS = arr(META.topics).filter(t => t && t.id).map(t => ({ ...t, list: arr(t.claims).map(id => byKey.get(id)).filter(c => c && c.kind === 'claim') }));
for (const t of TOPICS) for (const c of t.list) c.topicRef = t;
const loose = claims.filter(c => !c.topicRef);
const TOPICS_ALL = TOPICS.filter(t => t.list.length).concat(loose.length ? [{ id: 'other', name: TOPICS.length ? 'Other Checks' : 'All Checks', description: '', list: loose }] : []);
const UNV = new Set(claims.filter(c => c.verdict === 'unverified').map(c => c.id));

// ---------------------------------------------------------------------------------------------- wording
function cap(t) { t = String(t || ''); const first = t.split(' ')[0]; return /^[a-z]/.test(t) && !/[A-Z]/.test(first.slice(1)) ? t.charAt(0).toUpperCase() + t.slice(1) : t; }
function trunc(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '').replace(/[,;:]$/, '') + '…' : s; }
function money(n) {
  if (typeof n !== 'number' || !isFinite(n)) return '';
  const a = Math.abs(n), u = [[1e12, ' trillion'], [1e9, ' billion'], [1e6, ' million']];
  for (const [v, w] of u) if (a >= v) return '$' + String(+(n / v).toFixed(a >= v * 100 ? 0 : a >= v * 10 ? 1 : 2)) + w;
  return '$' + Math.round(n).toLocaleString('en-US');
}
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function fdate1(d) {
  d = String(d || ''); let m = /^(\d{4})(?:-(\d{2}))?(?:-(\d{2}))?$/.exec(d);
  if (m) return (m[3] ? +m[3] + ' ' : '') + (m[2] && MON[+m[2] - 1] ? MON[+m[2] - 1] + ' ' : '') + m[1];
  if ((m = /^(\d{4})-(Q\d)$/.exec(d))) return m[2] + ' ' + m[1];
  if ((m = /^(\d{4})-([a-z]+)$/i.exec(d))) return cap(m[2]) + ' ' + m[1];
  if ((m = /^(\d{4})-(\d{4})$/.exec(d))) return m[1] + ' to ' + m[2];
  return d;
}
const fdate = d => String(d || '').split('/').map(fdate1).join(' to ');
function firstSentence(s) {
  s = String(s || ''); const m = /^(.+?[.!?])(\s+[A-Z'"(]|$)/.exec(s); if (!m) return s;
  if (m[1].length >= 45) return m[1];
  const rest = s.slice(m[1].length).trim(), m2 = /^(.+?[.!?])(\s+[A-Z'"(]|$)/.exec(rest);
  return m2 ? m[1] + ' ' + m2[1] : s;
}
const safeUrl = u => /^https?:\/\//i.test(String(u || '')) ? String(u) : '';
const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch { return 'source'; } };
const listParts = p => p.length < 2 ? p.join('') : p.slice(0, -1).join(', ') + ' and ' + p[p.length - 1];
const isUnv = c => c.verdict === 'unverified';
const unvText = c => c.single_source ? 'Unverified, Single Source' : 'Unverified Allegation';
const verdictText = c => isUnv(c) ? unvText(c) : VLABEL[c.verdict];
function tallyText(c) {
  const t = c.tally || [0, 0, 0], tot = t[0] + t[1] + t[2], p = [];
  if (!tot) return '';
  if (t[0] === tot) p.push(tot === 1 ? 'The one point checked holds up' : 'All ' + tot + ' points checked hold up');
  else { p.push(t[0] + ' of ' + tot + ' points hold up'); if (t[1]) p.push(t[1] + ' needed correcting'); if (t[2]) p.push(t[2] + ' unproven'); }
  return p.join(', ');
}
function relSentence(r) {
  if (!flows(r.label)) return r.S.name + ' and ' + r.T.name + ': ' + r.label;
  return r.S.name + (ROLEISH.test(r.label) ? ', ' : ' ') + r.label + ' ' + r.T.name;
}
const strongest = list => list.slice().sort((a, b) => (a.alleged ? 1 : 0) - (b.alleged ? 1 : 0) || (b.amount_usd || 0) - (a.amount_usd || 0) || b.claims.length - a.claims.length || String(b.date || '').localeCompare(String(a.date || '')))[0];

// ---------------------------------------------------------------------------------------------- addresses
const U = {
  home: () => BASE, checks: () => BASE + 'checks/', check: c => BASE + 'checks/' + c.id + '/', topic: t => BASE + 'checks/#topic-' + t.id,
  names: () => BASE + 'names/', name: e => BASE + 'names/' + e.id + '/', method: () => BASE + 'method/',
  map: () => BASE + 'map/', matrix: () => BASE + 'map/matrix/', mapTopic: t => BASE + 'map/topic/' + t.id + '/'
};
const abs = p => ORIGIN ? ORIGIN + p : '';
const checkLink = (c, text) => '<a href="' + U.check(c) + '">' + (text || esc(c.title)) + '</a>';
const nameLink = e => '<a href="' + U.name(e) + '">' + esc(e.name) + '</a>';
/* Running text from the research files: escaped, with check codes (C37) turned into named links. */
const rich = text => esc(text).replace(/\bC(\d{2})\b/g, m => { const c = byKey.get(m); return c && c.kind === 'claim' ? checkLink(c, '“' + esc(c.title) + '”') : 'another check'; });
const checkLine = c => '<li>' + checkLink(c) + ' <span class="pre-v">' + esc(verdictText(c)) + '</span><span class="pre-meta"> ' + (c.ctype === 'connection' ? 'Connection Check ' : 'Check ') + esc(c.id) + '</span>' +
  '<br><span class="pre-meta">' + rich(firstSentence(c.bottom_line)) + '</span></li>';
const unvCallout = () => UNV.size ? '<p class="callout"><strong>' + (UNV.size === 1 ? 'One check is an unverified allegation' : cap(String(UNV.size === 2 ? 'two' : UNV.size)) + ' checks are unverified allegations') + ' from a single source,</strong> denied by everyone named: ' +
  listParts(claims.filter(isUnv).map(c => checkLink(c))) + '. Read them as a record of what has been alleged, not as findings.</p>' : '';

// ---------------------------------------------------------------------------------------------- pages
function pageHome() {
  const p = META.points || {}, who = arr(META.who).map(g => ({ title: g.title, list: arr(g.names).map(id => byKey.get('e:' + id)).filter(Boolean) })).filter(g => g.list.length);
  return {
    path: '', title: SITE_NAME, description: DESCRIPTION,
    html: '<h1>The Money, the Deals &amp; the Connections Around the President</h1>' +
      '<p class="lede">' + claims.length + ' claims about the business, financial and political dealings of Donald Trump, his family and his administration, each tested against the public record. Every name has a profile, and every documented link is on the map.</p>' +
      '<p class="pre-meta">' + [[claims.length, 'checks'], [p.total, 'points'], [META.sources, 'sources'], [entities.length, 'names'], [rels.length, 'links']].map(x => '<b>' + num(x[0]) + '</b> ' + x[1]).join(' · ') +
      (META.generated ? ' · Data built ' + esc(fdate(META.generated)) : '') + '</p>' + STANDING +
      '<p><a href="' + U.checks() + '">All Checks</a> · <a href="' + U.names() + '">People &amp; Organisations</a> · <a href="' + U.map() + '">Map</a> · <a href="' + U.method() + '">How We Checked</a></p>' +
      (p.total ? '<h2>What the Checks Found</h2><p>Each check was split into separate points. ' + num(p.hold) + ' of ' + num(p.total) + ' points are confirmed or mostly accurate, ' + num(p.correct) + ' needed correcting and ' + num(p.unproven) + ' are unproven. No check shows that a payment bought an official act.</p>' : '') +
      (who.length ? '<h2>Who Is Involved</h2>' + who.map(g => '<h3>' + esc(g.title) + '</h3><ul class="pre-cols">' + g.list.map(e => '<li>' + nameLink(e) + '</li>').join('') + '</ul>').join('') : '') +
      '<h2>' + claims.length + ' Checks in ' + TOPICS_ALL.length + ' Topics</h2>' + unvCallout() +
      TOPICS_ALL.map(t => '<h3 id="topic-' + esc(t.id) + '">' + esc(t.name) + '</h3>' + (t.description ? '<p class="pre-meta">' + esc(t.description) + '</p>' : '') +
        '<ul>' + t.list.map(c => '<li>' + checkLink(c) + ' <span class="pre-v">' + esc(verdictText(c)) + '</span></li>').join('') + '</ul>').join('')
  };
}
function pageChecks() {
  return {
    path: 'checks/', title: 'All Checks · ' + SITE_NAME,
    description: 'All ' + claims.length + ' checks, grouped under ' + TOPICS_ALL.length + ' topics, each with its verdict and what the record shows.',
    html: '<h1>' + claims.length + ' Checks in ' + TOPICS_ALL.length + ' Topics</h1><p class="lede">Each check tests one claim against the record and lists the sources it rests on.</p>' + STANDING + unvCallout() +
      TOPICS_ALL.map(t => '<h2 id="topic-' + esc(t.id) + '">' + esc(t.name) + '</h2>' + (t.description ? '<p>' + esc(t.description) + '</p>' : '') +
        (t.id !== 'other' ? '<p class="pre-meta">' + plural(t.list.length, 'check') + '. <a href="' + U.mapTopic(t) + '">Show This Topic on the Map</a></p>' : '') +
        '<ul class="pre-rows">' + t.list.map(checkLine).join('') + '</ul>').join('')
  };
}
function pageCheck(c) {
  const subs = arr(c.sub_claims), t = c.topicRef, kind = c.ctype === 'connection' ? 'Connection Check' : 'Check';
  const q = arr(c.question_points).map(cap);
  const srcOf = new Map(arr(c.sources).filter(s => s.url).map(s => [s.url, s]));
  const sub = s => {
    const src = arr(s.sources).filter(safeUrl).map(u => { const x = srcOf.get(u); return '<a href="' + esc(u) + '" rel="noopener">' + esc(x && (x.publisher || x.title) || host(u)) + '</a>'; });
    return '<li><p>' + rich(s.statement) + '</p><p><span class="pre-v">' + esc(VLABEL[s.verdict] || 'Not Yet Checked') + '.</span> ' + arr(s.points).map(rich).join(' ') + '</p>' +
      (src.length ? '<p class="pre-meta">Sources: ' + src.join(', ') + '</p>' : '') + '</li>';
  };
  const ents = c.ents.slice().sort((a, b) => b.imp - a.imp || a.name.localeCompare(b.name));
  const par = arr(c.parents).map(id => byKey.get(id)).filter(Boolean);
  const order = t ? t.list : claims, i = order.indexOf(c), pv = order[i - 1], nx = order[i + 1];
  const lead = (isUnv(c) ? (c.single_source ? 'Unverified single-source allegation' : 'Unverified allegation') + ', denied by everyone named. ' : VLABEL[c.verdict] + '. ') + firstSentence(c.bottom_line);
  return {
    path: 'checks/' + c.id + '/', title: c.title + ' · ' + SITE_NAME, description: trunc(lead, 220), type: 'article', detail: c.df,
    html: '<p class="crumb"><a href="' + U.checks() + '">All Checks</a>' + (t && t.id !== 'other' ? ' <span aria-hidden="true">/</span> <a href="' + U.topic(t) + '">' + esc(t.name) + '</a>' : '') + ' <span aria-hidden="true">/</span> <b>' + kind + ' ' + esc(c.id) + '</b></p>' +
      '<h1>' + esc(c.title) + '</h1>' +
      (isUnv(c) ? '<p class="flagbox"><strong>' + esc(unvText(c)) + '.</strong> The central allegation ' + (c.single_source ? 'rests on one source and ' : '') + 'has not been corroborated. Everyone named denies it. Read this page as a record of what has been alleged and what is known about the allegation, not as a finding that it happened.</p>' : '') +
      '<h2>The Claim</h2>' + (q.length > 1 ? '<ul>' + q.map(x => '<li>' + rich(x) + '</li>').join('') + '</ul>' : '<p>' + rich(q[0] || c.title) + '</p>') +
      '<h2>Verdict</h2><p><span class="pre-v">' + esc(verdictText(c)) + '.</span> ' + esc(tallyText(c)) + (tallyText(c) ? '.' : '') + '</p>' +
      '<p class="pre-meta">' + [plural(arr(c.sources).length, 'source'), c.audit ? 'Second review ' + (AUDIT[c.audit.result] || 'done') : 'No second review yet'].join(' · ') + ' · <a href="' + BASE + 'map/#' + esc(c.id) + '">Show on Map</a></p>' +
      '<h2>Finding</h2><p>' + rich(c.bottom_line) + '</p>' +
      (arr(c.bottom_parts).length + arr(c.summary_points).length ? '<ul>' + arr(c.bottom_parts).concat(arr(c.summary_points)).map(x => '<li>' + rich(x) + '</li>').join('') + '</ul>' : '') +
      (subs.length ? '<h2>The Points Checked</h2><ol>' + subs.map(sub).join('') + '</ol>' : '') +
      (arr(c.corrections).length ? '<h2>What Needs Correcting</h2><ul>' + c.corrections.map((x, k) => { const pr = arr(c.correction_pairs)[k]; return '<li>' + (pr ? '<b>Claimed:</b> ' + rich(pr.said) + ' <b>The record shows:</b> ' + rich(cap(pr.record)) : rich(x)) + '</li>'; }).join('') + '</ul>' : '') +
      (arr(c.denial_points).length ? '<h2>The Other Side</h2><p class="pre-meta">What the people and organisations named say, and context that cuts the other way.</p><ul>' + c.denial_points.map(pts => '<li>' + arr(pts).map(rich).join(' ') + '</li>').join('') + '</ul>' : '') +
      (ents.length ? '<h2>Who Is Involved</h2><ul class="pre-cols">' + ents.map(e => '<li>' + nameLink(e) + '</li>').join('') + '</ul>' : '') +
      '<h2>Sources</h2>' + (arr(c.sources).length ? '<ol class="pre-src">' + c.sources.map(s => '<li>' + (safeUrl(s.url) ? '<a href="' + esc(s.url) + '" rel="noopener">' + esc(s.title || s.url) + '</a>' : esc(s.title || 'Untitled')) +
        (s.publisher ? ', ' + esc(s.publisher) : '') + (s.date ? ', ' + esc(fdate(s.date)) : '') + '</li>').join('') + '</ol>' : '<p>No sources are recorded for this check.</p>') +
      (par.length || c.kids.length ? '<h2>Related Checks</h2><ul>' + par.concat(c.kids).map(x => '<li>' + checkLink(x) + ' <span class="pre-v">' + esc(verdictText(x)) + '</span></li>').join('') + '</ul>' : '') +
      (pv || nx ? '<p class="pre-meta">' + (pv ? 'Previous: ' + checkLink(pv) : '') + (pv && nx ? ' · ' : '') + (nx ? 'Next: ' + checkLink(nx) : '') + '</p>' : '') + STANDING
  };
}
function pageName(e) {
  const by = new Map();
  for (const r of e.lines) { const o = r.S === e ? r.T : r.S; if (!by.has(o)) by.set(o, []); by.get(o).push(r); }
  const near = [...by.keys()].sort((a, b) => by.get(b).length - by.get(a).length || b.cl.length - a.cl.length || a.name.localeCompare(b.name));
  const top = e.lines.filter(r => !r.alleged && typeof r.amount_usd === 'number').sort((a, b) => b.amount_usd - a.amount_usd)[0];
  const unv = arr(e.unverified_in).map(id => byKey.get(id)).filter(Boolean), it = e.group === 'person' ? 'Them' : 'It';
  const also = arr(e.aliases).slice(0, 4), SHOW = 15;
  const figs = [plural(e.cl.length, 'check') + ' ' + (e.cl.length === 1 ? 'names' : 'name') + ' ' + it.toLowerCase(), plural(e.lines.length, 'documented connection'), by.size ? plural(by.size, 'connected name') : '', top ? 'largest sum on record ' + money(top.amount_usd) : ''].filter(Boolean);
  const desc = trunc(e.name + (e.role ? ': ' + e.role.replace(/\.$/, '') : '') + '. ' + cap(figs.slice(0, 2).join(', ')) + '.', 230);
  return {
    path: 'names/' + e.id + '/', title: e.name + ' · ' + SITE_NAME, description: desc, type: e.group === 'person' ? 'profile' : 'website',
    html: '<p class="crumb"><a href="' + U.names() + '">People &amp; Organisations</a></p><h1>' + esc(e.name) + '</h1>' +
      (e.role ? '<p class="lede">' + rich(cap(e.role)) + '</p>' : '') +
      '<p class="pre-meta">' + esc(TLABEL[e.type]) + (also.length ? ' · Also written as ' + esc(also.join(', ')) : '') + ' · <a href="' + BASE + 'map/#' + esc(e.id) + '">Show on Map</a></p>' +
      '<p>' + esc(cap(figs.join(' · '))) + '</p>' +
      '<p class="pre-meta">Each connection comes from a check and its sources. It records a relationship, not an accusation.</p>' +
      (unv.length ? '<p class="flagbox"><strong>' + (e.unverified_only ? 'Named only in an unverified check.' : 'Also named in an unverified check.') + '</strong> ' + listParts(unv.map(c => checkLink(c))) + (unv.length === 1 ? ' is an allegation' : ' are allegations') +
        ' from a single source, denied by everyone named. Lines that rest only on ' + (unv.length === 1 ? 'it' : 'them') + ' are marked “Alleged, Unverified”.</p>' : '') +
      (near.length ? '<h2>Strongest Connections</h2><ul>' + near.slice(0, SHOW).map(o => {
        const ls = by.get(o), r = strongest(ls), allA = ls.every(x => x.alleged);
        return '<li>' + nameLink(o) + '<span class="pre-meta"> ' + esc(TLABEL[o.type]) + ', ' + plural(ls.length, 'link') + '</span><br>' + esc(cap(relSentence(r))) + (r.date ? ' <span class="pre-meta">' + esc(fdate(r.date)) + '</span>' : '') +
          (allA ? ' <span class="pre-v">Alleged, Unverified</span>' : '') + (r.claims.length ? ' <span class="pre-meta">' + r.claims.slice(0, 3).map(id => byKey.get(id)).filter(Boolean).map(c => checkLink(c, esc(c.id))).join(' ') + '</span>' : '') + '</li>';
      }).join('') + '</ul>' + (near.length > SHOW ? '<p class="pre-meta">And ' + plural(near.length - SHOW, 'more connected name') + '.</p>' : '') : '') +
      '<h2>Checks That Name ' + it + '</h2>' + (e.cl.length ? '<ul class="pre-rows">' + e.cl.map(checkLine).join('') + '</ul>' : '<p>No check names this directly. It appears only through a connection.</p>') + STANDING
  };
}
function pageNames() {
  return {
    path: 'names/', title: 'People & Organisations · ' + SITE_NAME,
    description: num(entities.length) + ' people, companies, funds, governments and other names that appear in the checks, each with a profile of its documented connections.',
    html: '<h1>People &amp; Organisations</h1><p class="lede">' + num(entities.length) + ' names appear in the checks. Each has a profile with its connections, a timeline and the checks that mention it.</p>' + STANDING +
      GROUPS.map(g => {
        const list = ranked.filter(e => e.group === g).sort((a, b) => a.name.localeCompare(b.name));
        return list.length ? '<h2>' + esc(GLABEL[g]) + ' <span class="pre-meta">' + num(list.length) + '</span></h2><ul class="pre-cols">' + list.map(e => '<li>' + nameLink(e) + (e.unverified_only ? ' <span class="pre-v">Unverified Check Only</span>' : '') + '</li>').join('') + '</ul>' : '';
      }).join('')
  };
}
function pageMethod() {
  const t = META.tally || {}, nCheck = claims.filter(c => c.ctype !== 'connection').length, unv = claims.filter(isUnv);
  return {
    path: 'method/', title: 'How We Checked · ' + SITE_NAME,
    description: 'How the checks were done: the method, what each verdict and evidence grade means, and the limits of the research.',
    html: '<h1>How We Checked</h1><p class="lede">This is a verification project, not an accusation. It takes claims about the business, financial and political dealings of Donald Trump, his family and his administration, and tests each one against the public record.</p>' +
      '<p class="pre-meta">' + [plural(nCheck, 'check') + ' of claims', plural(claims.length - nCheck, 'connection check'), plural(TOPICS_ALL.length, 'topic'), num((META.points || {}).total) + ' points checked', num(META.sources) + ' sources cited', num(entities.length) + ' names mapped'].join(' · ') +
      (META.generated ? ' · Data built ' + esc(fdate(META.generated)) : '') + '</p>' + STANDING +
      '<h2>The Method</h2><ol>' +
      '<li><strong>We started from claims in public circulation.</strong> These are widely repeated statements about the Trump family’s business dealings: the crypto ventures, the Gulf investments, Trump Media, the pardons and the dropped enforcement cases. Each was written down as a specific claim that can be tested.</li>' +
      '<li><strong>Each claim was checked on its own.</strong> It was split into separate points. Every figure, date and name was compared with news reporting, company and court filings and official releases, and what the people named say in reply was recorded.</li>' +
      '<li><strong>Open questions became further checks.</strong> Where a check turned up a related story or an unanswered question, that was researched the same way and given its own page.</li>' +
      '<li><strong>Connection checks cross-referenced the finished files.</strong> They looked for the same lawyers, lobbyists, financiers, shell entities, investors and foreign partners recurring in checks that had been researched separately, then searched outward to confirm and date each link.</li>' +
      '<li><strong>A second reviewer re-checked the key assertions.</strong> ' + num(META.second_reviewed || 0) + ' of the ' + claims.length + ' checks have had this independent review, with fresh searches, and the files were corrected where needed.</li></ol>' +
      '<h2>What the Verdicts Mean</h2><ul>' + VMEANS.map(([v, text]) => '<li><span class="pre-v">' + VLABEL[v] + '.</span> ' + text + ' <span class="pre-meta">' + (t[v] ? plural(t[v], 'check') : 'None') + '</span></li>').join('') + '</ul>' +
      '<h2>Evidence Grades for Connections</h2><ul><li><span class="pre-v">Documented.</span> Filings, official records or several outlets.</li><li><span class="pre-v">Single-Source.</span> One outlet, or anonymous sourcing.</li>' +
      '<li><span class="pre-v">Inferred.</span> Our own observation from timing or co-occurrence. No source asserts it.</li></ul><p>An inferred link is never presented as fact.</p>' +
      '<h2>Limits You Should Know About</h2><ul>' +
      '<li><strong>Most original pages could not be opened.</strong> Findings rest on search-result excerpts that agree across several outlets, not on reading the original articles, filings or court dockets in full. This is why most checks are rated medium confidence.</li>' +
      (unv.length ? '<li><strong>' + (unv.length === 1 ? 'One check is a single-source allegation.' : 'Some checks are single-source allegations.') + '</strong> ' + listParts(unv.map(c => checkLink(c))) + (unv.length === 1 ? ' comes from one book and is' : ' come from one book and are') + ' denied by everyone named. They are marked unverified wherever they appear.</li>' : '') +
      '<li><strong>No payment is shown to have bought an official act.</strong> That inference is not established in any check. Where a claim implies it, the point is marked unverified.</li>' +
      '<li><strong>A link is not a cause.</strong> A line between two names means a documented relationship: a payment, a stake, a job, a family tie, a legal action. It does not show that one thing led to another.</li>' +
      '<li><strong>The research has a date.</strong> ' + (META.generated ? 'The data was built on ' + esc(fdate(META.generated)) + '. ' : '') + 'Later developments are not reflected.</li></ul>'
  };
}
const topNames = (n, list) => '<ol class="pre-cols">' + (list || ranked.filter(e => e.lines.length && e.type !== 'media')).slice(0, n).map(e => '<li>' + nameLink(e) + ' <span class="pre-meta">' + plural(e.lines.length, 'link') + '</span></li>').join('') + '</ol>';
function pageMap() {
  return {
    path: 'map/', title: 'Map · ' + SITE_NAME,
    description: 'An interactive map of ' + num(entities.length) + ' names and ' + claims.length + ' checks, placed by the ' + num(rels.length) + ' documented links between them.',
    html: '<h1>Map of Every Check, Name &amp; Connection</h1><p class="lede">' + num(entities.length) + ' names and ' + claims.length + ' checks, placed by the ' + num(rels.length) + ' documented links between them. Select a name to light its links and read them, or pick a topic to see only its checks and the names they mention.</p>' +
      STANDING + '<p>The interactive map needs JavaScript. The same content is available as text on the <a href="' + U.checks() + '">Checks</a> and <a href="' + U.names() + '">People &amp; Organisations</a> pages. Other views: <a href="' + U.matrix() + '">Matrix</a>.</p>' +
      '<h2>Topics on the Map</h2><ul>' + TOPICS.filter(t => t.list.length).map(t => '<li><a href="' + U.mapTopic(t) + '">' + esc(t.name) + '</a> <span class="pre-meta">' + plural(t.list.length, 'check') + '</span></li>').join('') + '</ul>' +
      '<h2>Most Connected Names</h2>' + topNames(30)
  };
}
function pageMatrix() {
  return {
    path: 'map/matrix/', title: 'Matrix · ' + SITE_NAME,
    description: 'A matrix of the most connected names: which pairs have a documented link, how many checks record it and the sums involved.',
    html: '<h1>Matrix of the Most Connected Names</h1><p class="lede">Each cell is a pair of names. A filled cell means the checks record a documented link between them. Select a cell to read the links and the checks they come from.</p>' +
      STANDING + '<p>The matrix needs JavaScript. The same links are written out on each profile. Back to the <a href="' + U.map() + '">Map</a>.</p><h2>Names in the Matrix</h2>' + topNames(40)
  };
}
function pageMapTopic(t) {
  const w = new Map();
  for (const c of t.list) for (const e of c.ents) w.set(e, (w.get(e) || 0) + 1);
  const mem = [...w.entries()].sort((a, b) => b[1] - a[1] || b[0].imp - a[0].imp);
  return {
    path: 'map/topic/' + t.id + '/', title: t.name + ' on the Map · ' + SITE_NAME,
    description: trunc(t.name + ' on the map: ' + plural(t.list.length, 'check') + ' and the ' + num(mem.length) + ' names they mention. ' + (t.description || ''), 230),
    html: '<p class="crumb"><a href="' + U.map() + '">Map</a></p><h1>' + esc(t.name) + ' on the Map</h1>' + (t.description ? '<p class="lede">' + esc(t.description) + '</p>' : '') + STANDING +
      '<h2>' + plural(t.list.length, 'Check') + '</h2><ul class="pre-rows">' + t.list.map(checkLine).join('') + '</ul>' +
      '<h2>Names These Checks Mention Most</h2><ol class="pre-cols">' + mem.slice(0, 40).map(([e, n]) => '<li>' + nameLink(e) + ' <span class="pre-meta">' + plural(n, 'check') + '</span></li>').join('') + '</ol>'
  };
}
function pageMissing() {
  return {
    path: '404.html', title: 'Page Not Found · ' + SITE_NAME, description: 'That page is not here. Search the names and checks, or start from one of the main pages.', noindex: true,
    html: '<h1>That Page Is Not Here</h1><p class="lede">Nothing is published at this address. Use the search at the top of the page, or start from one of these.</p>' +
      '<ul><li><a href="' + U.home() + '">Home</a></li><li><a href="' + U.checks() + '">All ' + claims.length + ' Checks</a></li><li><a href="' + U.names() + '">People &amp; Organisations</a></li><li><a href="' + U.map() + '">Map</a></li><li><a href="' + U.method() + '">How We Checked</a></li></ul>' + STANDING
  };
}

// ---------------------------------------------------------------------------------------------- output
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'assets', 'd'), { recursive: true });
const written = [];
function put(rel, data) {
  const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true });
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8'); fs.writeFileSync(f, buf);
  written.push({ rel, bytes: buf.length, gz: /\.(png|jpg|woff2?)$/.test(rel) ? buf.length : gzipSync(buf, { level: 9 }).length });
  return rel;
}
/* A built file gets its content hash in its name, so it can be cached for a year and never goes stale. */
const asset = (name, ext, data) => BASE + put('assets/' + name + '.' + hash(data) + '.' + ext, data);

/* The data, split. A check's long fields go to its own file; the core keeps the counts the lists show. */
const DETAIL = ['report', 'sub_claims', 'sources', 'audit', 'denial_points', 'corrections', 'correction_pairs', 'summary_points', 'bottom_parts', 'holds_up', 'needs_correcting', 'unproven'];
const UNUSED = ['leads', 'number', 'degree', 'claim_count'];   // in graph-data.js, read by nothing in the interface
const OWN = ['lines', 'near', 'cl', 'ents', 'kids', 'imp', 'group', 'topicRef'];   // added above for this script
const coreNodes = nodes.map(n => {
  const o = {};
  for (const k of Object.keys(n)) if (!OWN.includes(k) && !UNUSED.includes(k) && !(n.kind === 'claim' && (DETAIL.includes(k) || k === 'name'))) o[k] = n[k];
  if (n.kind === 'claim') {
    const d = {}; for (const k of DETAIL) if (n[k] !== undefined) d[k] = n[k];
    const body = JSON.stringify(d);
    n.df = o.df = n.id + '.' + hash(body) + '.json';
    put('assets/d/' + n.df, body);
    o.ns = arr(n.sources).length; o.nc = arr(n.corrections).length;
  }
  return o;
});
const coreRels = arr(G.rels).map(r => { const o = {}; for (const k of Object.keys(r)) if (k !== 'S' && k !== 'T') o[k] = r[k]; return o; });   // same order: timelines index into it
const CORE = asset('core', 'js', '/* Generated by make_site.mjs from map/graph-data.js. */\nwindow.GRAPH=' + JSON.stringify({ meta: G.meta, nodes: coreNodes, links: G.links, rels: coreRels }) + ';\n');

const PRE_CSS = `
/* ---------- pre-built pages: the content in the HTML before the interface takes over ---------- */
.pre { max-width: 760px; padding: 28px 0 56px; overflow-wrap: anywhere; }
.pre h1 { font-size: calc(34px * var(--head-scale, 1)); margin-top: 8px; }
.pre h2 { font-size: 22px; margin: 34px 0 8px; padding-top: 12px; border-top: 1px solid var(--rule); }
.pre h3 { font-size: 17px; margin: 22px 0 6px; }
.pre p, .pre ul, .pre ol { margin: 8px 0; }
.pre li { margin: 6px 0; }
.pre .pre-v { font-weight: 600; }
.pre .pre-meta { color: var(--ink2); font-size: 14.5px; }
.pre .pre-note { margin-top: 18px; padding: 10px 0 0; border-top: 1px solid var(--rule); color: var(--ink2); font-size: 14.5px; line-height: 1.45; }
.pre .pre-cols { columns: 3 210px; column-gap: 28px; padding-left: 1.4em; }
.pre .pre-cols li { break-inside: avoid; margin: 0 0 6px; }
.pre .pre-rows { list-style: none; padding: 0; }
.pre .pre-rows li { margin: 12px 0; }
.pre .pre-src { font-size: 15px; }
`;
const css = ['style.css', 'matrix.css', 'ui.css'].map(read).join('\n') + PRE_CSS;
if (/@import|@charset/.test(css)) throw new Error('The stylesheets cannot be joined: one uses @import or @charset.');
const CSS = asset('site', 'css', css);
const APP = asset('app', 'js', read('matrix.js') + '\n;\n' + appSrc);

const tpl = read('index.html');
const logo = /<svg class="logo"[^>]*>([\s\S]*?)<\/svg>/.exec(tpl);
if (!logo) throw new Error('map/index.html: the logo mark was not found');
const logoBody = logo[1].replace(/currentColor/g, '#14181f').replace('class="lit"', 'fill="#c47a00"');
const FAVICON = asset('favicon', 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><style>@media (prefers-color-scheme: dark){path{stroke:#e6e9ef}circle{fill:#e6e9ef}circle[fill="#c47a00"]{fill:#ffc65c}}</style>' + logoBody + '</svg>\n');
const ICON = asset('icon', 'svg', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="#0c1016"/><g transform="translate(76 76) scale(15)">' +
  logo[1].replace(/currentColor/g, '#e6e9ef').replace('class="lit"', 'fill="#ffc65c"') + '</g></svg>\n');
const ogFile = path.join(STATIC, 'og.png');
const OG = fs.existsSync(ogFile) ? asset('og', 'png', fs.readFileSync(ogFile)) : '';
if (!OG) console.warn('warning: static/og.png is missing, so pages get no preview image. Run: node tools/make_og.js');
const MANIFEST = asset('site', 'webmanifest', JSON.stringify({
  name: SITE_NAME, short_name: 'Trump Connection', description: DESCRIPTION, start_url: BASE, scope: BASE, display: 'minimal-ui',
  background_color: '#0c1016', theme_color: '#0c1016', icons: [{ src: ICON, sizes: 'any', type: 'image/svg+xml', purpose: 'any' }]
}, null, 1));
/* Runs before the page is drawn: tells app.js it is on the site (paths, not hashes) and applies a saved theme.
   It is a file, not an inline script, so the Content-Security-Policy can refuse all inline script. */
const BOOT = asset('boot', 'js', 'window.__SITE__=' + JSON.stringify({ base: BASE, detail: BASE + 'assets/d/', prebuilt: true }) +
  ';try{var t=localStorage.getItem("tcm-theme");if(t==="dark"||t==="light")document.documentElement.setAttribute("data-theme",t)}catch(e){}\n');

/* The page shell is map/index.html: its header, map view and footer, with the links written as paths. */
const fontLinks = (tpl.match(/<link\b[^>]*fonts\.googleapis\.com[^>]*>/g) || []);
let shell = tpl.replace(/<title>[\s\S]*?<\/title>\s*/, '').replace(/<meta name="claude:[^>]*>\s*/g, '').replace(/<link\b[^>]*>\s*/g, '').replace(/<script\b[^>]*><\/script>\s*/g, '').trim();
for (const [from, to] of [['#home', U.home()], ['#claims', U.checks()], ['#names', U.names()], ['#map', U.map()], ['#method', U.method()]]) {
  if (!shell.includes('href="' + from + '"')) throw new Error('map/index.html: the link ' + from + ' was not found');
  shell = shell.split('href="' + from + '"').join('href="' + to + '"');
}
const left = shell.match(/href="#(?!app")[^"]*"/g);
if (left) throw new Error('map/index.html has links this script does not know how to rewrite: ' + left.join(' '));
const SLOT = '<div id="page" class="wrap"></div>';
if (!shell.includes(SLOT)) throw new Error('map/index.html: the page container was not found');

const pages = [];
function writePage(p) {
  const url = abs(BASE + (p.path === '404.html' ? '' : p.path)), img = OG && ORIGIN ? ORIGIN + OG : '';
  const head = [
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">',
    '<title>' + esc(p.title) + '</title>',
    '<meta name="description" content="' + esc(p.description) + '">',
    p.noindex ? '<meta name="robots" content="noindex">' : '',
    url && !p.noindex ? '<link rel="canonical" href="' + esc(url) + '">' : '',
    '<meta property="og:site_name" content="' + SITE_NAME + '">',
    '<meta property="og:type" content="' + (p.type || 'website') + '">',
    '<meta property="og:title" content="' + esc(p.title.replace(' · ' + SITE_NAME, '')) + '">',
    '<meta property="og:description" content="' + esc(p.description) + '">',
    url && !p.noindex ? '<meta property="og:url" content="' + esc(url) + '">' : '',
    img ? '<meta property="og:image" content="' + esc(img) + '">\n<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n<meta property="og:image:alt" content="A network of names joined by lines, with the words The Trump Connection">' : '',
    '<meta name="twitter:card" content="' + (img ? 'summary_large_image' : 'summary') + '">',
    '<meta name="twitter:title" content="' + esc(p.title.replace(' · ' + SITE_NAME, '')) + '">',
    '<meta name="twitter:description" content="' + esc(p.description) + '">',
    img ? '<meta name="twitter:image" content="' + esc(img) + '">' : '',
    '<meta name="color-scheme" content="light dark">',
    '<meta name="theme-color" content="#f6f7f9" media="(prefers-color-scheme: light)">',
    '<meta name="theme-color" content="#0c1016" media="(prefers-color-scheme: dark)">',
    '<link rel="icon" href="' + FAVICON + '" type="image/svg+xml">',
    '<link rel="manifest" href="' + MANIFEST + '">',
    '<link rel="preconnect" href="https://fonts.googleapis.com">',
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>',
    ...fontLinks,
    '<link rel="stylesheet" href="' + CSS + '">',
    p.detail ? '<link rel="preload" as="fetch" crossorigin href="' + BASE + 'assets/d/' + p.detail + '">' : '',
    '<script src="' + BOOT + '"></script>',
    '<script defer src="' + CORE + '"></script>',
    '<script defer src="' + APP + '"></script>'
  ].filter(Boolean).map(l => l.split('\n').map(x => '  ' + x).join('\n')).join('\n');
  const body = shell.replace(SLOT, '<div id="page" class="wrap"><div class="pre">' + p.html +
    '<noscript><p class="pre-note">This page is readable without JavaScript. The search, the interactive map and the full reports need it.</p></noscript></div></div>');
  put(p.path.endsWith('.html') ? p.path : p.path + 'index.html', '<!doctype html>\n<html lang="en">\n<head>\n' + head + '\n</head>\n<body>\n' + body + '\n</body>\n</html>\n');
  pages.push(p);
}
[pageHome(), pageChecks(), ...claims.slice().sort(cmpClaim).map(pageCheck), pageNames(), ...entities.map(pageName), pageMethod(), pageMap(), pageMatrix(),
  ...TOPICS.filter(t => t.list.length).map(pageMapTopic), pageMissing()].forEach(writePage);

put('robots.txt', 'User-agent: *\nAllow: /\n' + (ORIGIN ? 'Sitemap: ' + ORIGIN + BASE + 'sitemap.xml\n' : ''));
if (ORIGIN) {
  const day = /^\d{4}-\d{2}-\d{2}$/.test(META.generated || '') ? META.generated : '';
  put('sitemap.xml', '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    pages.filter(p => !p.noindex).map(p => '<url><loc>' + esc(ORIGIN + BASE + p.path) + '</loc>' + (day ? '<lastmod>' + day + '</lastmod>' : '') + '</url>').join('\n') + '\n</urlset>\n');
}

// ---------------------------------------------------------------------------------------------- report
const sum = (f, k) => written.filter(f).reduce((a, w) => a + w[k], 0), kb = n => (n / 1024).toFixed(1) + ' KB';
const one = re => written.find(w => re.test(w.rel));
const shared = ['boot', 'core', 'app'].map(n => one(new RegExp('^assets/' + n + '\\.[0-9a-f]+\\.js$'))).concat(one(/^assets\/site\.[0-9a-f]+\.css$/));
const sharedGz = shared.reduce((a, w) => a + w.gz, 0);
const det = written.filter(w => w.rel.startsWith('assets/d/')).map(w => w.gz).sort((a, b) => a - b);
console.log('site/ written: ' + written.length + ' files, ' + (sum(() => true, 'bytes') / 1e6).toFixed(1) + ' MB (' + (sum(() => true, 'gz') / 1e6).toFixed(1) + ' MB gzipped)');
console.log('  pages: ' + pages.length + ' (' + claims.length + ' checks, ' + entities.length + ' names)');
console.log('  shared assets, gzipped: ' + shared.map(w => w.rel.replace(/^assets\/|\.[0-9a-f]{10}/g, '') + ' ' + kb(w.gz)).join(', ') + ' = ' + kb(sharedGz));
console.log('  check detail files, gzipped: ' + det.length + ' files, median ' + kb(det[det.length >> 1] || 0) + ', largest ' + kb(det[det.length - 1] || 0));
console.log('  public address: ' + (ORIGIN ? ORIGIN + BASE + ' (canonical links and sitemap.xml written)' : 'not known (set SITE_URL); canonical links, og:url, og:image and sitemap.xml left out'));
