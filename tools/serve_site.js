// A tiny static server for site/ that behaves like a static host: index.html per directory, 404.html (with
// status 404) for anything else, no rewrites. Sends gzip when the browser accepts it and counts the bytes.
// Usage: node tools/serve_site.js [port]      or      const serve = require('./serve_site.js'); const s = await serve(port)
const http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const SITE = path.resolve(__dirname, '..', 'site');
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8', '.webmanifest': 'application/manifest+json' };
const gzCache = new Map();
function serve(port, opts) {
  opts = opts || {};
  const log = [];   // { url, status, bytes (as sent), raw }
  const server = http.createServer((req, res) => {
    let u = decodeURIComponent(req.url.split('?')[0]);
    let f = path.join(SITE, u), status = 200;
    if (!f.startsWith(SITE)) { res.writeHead(400); res.end(); return; }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) {
      if (!u.endsWith('/')) { res.writeHead(301, { location: u + '/' }); res.end(); log.push({ url: u, status: 301, bytes: 0, raw: 0 }); return; }
      f = path.join(f, 'index.html');
    }
    if (!fs.existsSync(f) || !fs.statSync(f).isFile()) { f = path.join(SITE, '404.html'); status = 404; }
    const ext = path.extname(f), raw = fs.readFileSync(f);
    const hashed = /\/assets\//.test(f.replace(/\\/g, '/'));
    const head = { 'content-type': TYPES[ext] || 'application/octet-stream', 'x-content-type-options': 'nosniff',
      'cache-control': hashed && status === 200 ? 'public, max-age=31536000, immutable' : 'public, max-age=0, must-revalidate' };
    if (opts.csp) head['content-security-policy'] = opts.csp;
    let body = raw;
    if (ext !== '.png' && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) {
      const key = f + ':' + fs.statSync(f).mtimeMs;
      if (!gzCache.has(key)) gzCache.set(key, zlib.gzipSync(raw, { level: 9 }));
      body = gzCache.get(key); head['content-encoding'] = 'gzip'; head.vary = 'accept-encoding';
    }
    head['content-length'] = body.length;
    res.writeHead(status, head); res.end(req.method === 'HEAD' ? undefined : body);
    log.push({ url: u, status, bytes: body.length, raw: raw.length });
  });
  return new Promise(resolve => server.listen(port, () => { server.log = log; resolve(server); }));
}
module.exports = serve;
module.exports.SITE = SITE;
if (require.main === module) {
  const port = +process.argv[2] || 8080;
  serve(port).then(() => console.log('Serving site/ at http://localhost:' + port + '/  (run node make_site.mjs first)'));
}
