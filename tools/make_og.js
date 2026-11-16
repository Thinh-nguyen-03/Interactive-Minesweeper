// Draws the link-preview image, static/og.png (1200 x 630), from the dark network view of the map.
// Run it by hand when the look of the map changes; the result is committed, so the site build needs no browser.
// Usage: node tools/make_og.js      (needs Playwright with Chromium; reads map/ through cook/harness/serve.js)
const { chromium } = require('playwright'), path = require('path'), fs = require('fs');
const serve = require('../cook/harness/serve.js');
const OUT = path.resolve(__dirname, '..', 'static', 'og.png');
(async () => {
  const port = 8500 + Math.floor(Math.random() * 90), s = await serve(port), b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: 'dark' });
  await ctx.addInitScript(() => { window.__STILL__ = true; });   // the globe keeps its fixed view
  const p = await ctx.newPage();
  await p.goto('http://localhost:' + port + '/#map', { waitUntil: 'load' });
  await p.addStyleTag({ content:
    '.top,.map-bar,.hud,#legend,#map-zoom,#panel,.chips,#map-note,#key-toggle,.map-hint,#banner,.tip,.foot,.skip{display:none!important}' +
    'html,body{height:100%;overflow:hidden}#app,.mapview,.map-stage{position:fixed!important;inset:0!important;height:auto!important;width:auto!important;max-height:none!important}.map-stage{left:430px!important}' +
    '#og{position:fixed;inset:0;z-index:99;display:flex;flex-direction:column;justify-content:flex-end;padding:56px 64px;color:#f1f4f9;font-family:"IBM Plex Sans","Helvetica Neue",Arial,sans-serif;' +
    'background:linear-gradient(90deg,rgba(9,13,20,.9) 0%,rgba(9,13,20,.7) 36%,rgba(9,13,20,0) 52%)}' +
    '#og .b{display:flex;align-items:center;gap:16px;font-weight:600;font-size:30px;letter-spacing:-.01em;color:#ffc65c}#og .b svg{width:44px;height:44px;color:#f1f4f9}#og .b .lit{fill:#ffc65c}' +
    '#og h1{margin:22px 0 0;max-width:470px;font-weight:700;font-size:52px;line-height:1.06;letter-spacing:-.02em}' +
    '#og p{margin:22px 0 0;max-width:430px;font-size:23px;line-height:1.35;color:#b4bfd0}' });
  await p.evaluate(() => {
    const logo = document.querySelector('.site .logo').outerHTML, n = window.GRAPH.nodes;
    const names = n.filter(x => x.kind === 'entity').length, checks = n.filter(x => x.kind === 'claim').length;
    const d = document.createElement('div'); d.id = 'og';
    d.innerHTML = '<div class="b">' + logo + '<span>Trump Claims Map</span></div><h1>The Money, the Deals &amp; the Connections</h1>' +
      '<p>' + checks + ' checks of public claims, ' + names.toLocaleString('en-US') + ' names and the documented links between them.</p>';
    document.body.appendChild(d);
    document.documentElement.classList.remove('has-panel');
    window.dispatchEvent(new Event('resize'));
  });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(2500);
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  await p.screenshot({ path: OUT, type: 'png' });
  await b.close(); s.close();
  console.log('wrote', OUT, (fs.statSync(OUT).size / 1024).toFixed(0) + ' KB');
})();
