// Link check over the built site: every internal href and src in every generated HTML file must resolve to a
// generated file (a directory address to its index.html), and every #fragment to something that exists.
// Usage: node make_site.mjs && node tools/check_links.js
const fs = require('fs'), path = require('path');
const SITE = path.resolve(__dirname, '..', 'site');
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else files.push(p); } })(SITE);
const html = files.filter(f => f.endsWith('.html')), has = new Set(files.map(f => '/' + path.relative(SITE, f).split(path.sep).join('/')));
const idsOf = new Map();
const ids = f => { if (!idsOf.has(f)) idsOf.set(f, new Set((fs.readFileSync(path.join(SITE, f), 'utf8').match(/\sid="[^"]+"/g) || []).map(x => x.slice(5, -1)))); return idsOf.get(f); };
let links = 0, external = 0; const bad = new Map(), seen = new Map();
for (const f of html) {
  const from = '/' + path.relative(SITE, f).split(path.sep).join('/'), src = fs.readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\s(?:href|src)="([^"]*)"/g)) {
    const raw = m[1].replace(/&amp;/g, '&');
    if (/^https?:\/\//.test(raw)) { external++; continue; }
    links++;
    let why = seen.get(raw);
    if (why === undefined) {
      why = '';
      if (raw.charAt(0) === '#') why = raw === '#app' ? '' : 'a hash route left in the page';
      else if (raw.charAt(0) !== '/') why = 'not an absolute path';
      else {
        const [p, frag] = raw.split('#'), target = p.endsWith('/') ? p + 'index.html' : p;
        if (!has.has(decodeURIComponent(target))) why = 'no such file';
        else if (frag && target === '/map/index.html') { if (!has.has('/names/' + frag + '/index.html') && !has.has('/checks/' + frag + '/index.html')) why = 'the map has no mark called ' + frag; }
        else if (frag && !ids(target).has(frag)) why = 'no element with id ' + frag + ' in ' + target;
      }
      seen.set(raw, why);
    }
    if (why) { if (!bad.has(raw)) bad.set(raw, { why, from: [] }); bad.get(raw).from.push(from); }
  }
}
// every page is reachable: something links to it
const linked = new Set([...seen.keys()].map(r => r.split('#')[0]));
const orphans = html.map(f => '/' + path.relative(SITE, f).split(path.sep).join('/').replace(/index\.html$/, '')).filter(u => u !== '/404.html' && !linked.has(u));
console.log(html.length + ' HTML files, ' + links + ' internal links (' + seen.size + ' distinct), ' + external + ' external links not checked');
console.log(orphans.length ? 'PAGES NOTHING LINKS TO: ' + orphans.slice(0, 20).join(' ') : 'every page is linked from another page');
if (bad.size) { console.log('BROKEN: ' + bad.size); for (const [u, b] of [...bad].slice(0, 40)) console.log('  ' + u + '  (' + b.why + ')  from ' + b.from.slice(0, 3).join(', ') + (b.from.length > 3 ? ' and ' + (b.from.length - 3) + ' more' : '')); process.exit(1); }
console.log('all internal links resolve');
if (orphans.length) process.exit(1);
