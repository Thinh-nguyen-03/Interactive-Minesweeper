// Crawl test for the built site (site/). Serves it the way a static host does, with the Content-Security-Policy
// from render.yaml, and checks at 1440 and 400 wide: the content is in the raw HTML, the interface takes over
// without console errors or sideways overflow, links navigate without a page load, back and forward work, a direct
// load matches the navigated state, old hash addresses redirect, misses answer 404, and a check page fetches only
// its own detail file. Ends with first-load transfer sizes.
// Usage: node make_site.mjs && node tools/crawl_site.js      (needs Playwright with Chromium)
const { chromium } = require('playwright'), http = require('http'), fs = require('fs'), path = require('path'), zlib = require('zlib');
const serve = require('./serve_site.js');
const ROOT = path.resolve(__dirname, '..');
const yaml = fs.readFileSync(path.join(ROOT, 'render.yaml'), 'utf8');
const cspM = /name: Content-Security-Policy\s*\n\s*value: "([^"]+)"/.exec(yaml);
const CSP = cspM ? cspM[1] : '';
const NOTE = 'Everyone named denies wrongdoing. A link is a documented relationship, not proof of cause.';
const CHECKS = ['C06', 'C37', 'C46', 'C01', 'C15', 'C22', 'C33', 'C58', 'C77', 'C94', 'C95', 'C101'];
const NAMES = ['donald-trump', 'jared-kushner', 'world-liberty-financial', 'qatar', 'sec', 'eric-trump', 'steve-witkoff', 'binance', 'white-house', 'affinity-partners'];
const TOPIC = 'gulf-money';

const fails = [], passes = [];
const ok = (name, cond, info) => { (cond ? passes : fails).push(name + (cond || info == null ? '' : ' -> ' + String(info).slice(0, 300))); return !!cond; };
const raw = (port, url) => new Promise((res, rej) => http.get({ port, path: url, headers: { 'accept-encoding': 'identity' } }, r => { let b = ''; r.setEncoding('utf8'); r.on('data', d => b += d); r.on('end', () => res({ status: r.statusCode, body: b, headers: r.headers })); }).on('error', rej));
const text = html => html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, ' ');
const pageSlot = html => { const i = html.indexOf('<div id="page"'), j = html.indexOf('<section id="mapview"'); return i >= 0 && j > i ? html.slice(i, j) : ''; };

(async () => {
  const port = 8300 + Math.floor(Math.random() * 400), server = await serve(port, { csp: CSP }), origin = 'http://localhost:' + port;
  ok('render.yaml carries a Content-Security-Policy', !!CSP);
  const site = serve.SITE, existing = id => fs.existsSync(path.join(site, 'names', id, 'index.html'));
  const names = NAMES.filter(existing);
  ok('ten profiles to test exist', names.length === 10, NAMES.filter(n => !existing(n)).join(' '));
  const PAGES = [
    { url: '/', kind: 'home', ready: '#topics .topicnav', has: ['The Money, the Deals & the Connections Around the President', 'Checks in'] },
    { url: '/checks/', kind: 'home', ready: '#topics .topicnav', has: ['Checks in', 'Gulf Money', 'Unverified, Single Source'] },
    ...CHECKS.map(id => ({ url: '/checks/' + id + '/', kind: 'check', id, ready: '.article .aside .glance', has: ['The Claim', 'Verdict', 'Finding', 'The Points Checked', 'Sources', 'Who Is Involved'] })),
    ...names.map(id => ({ url: '/names/' + id + '/', kind: 'name', id, ready: 'article.profile .pbody', has: ['Checks That Name', 'documented link'] })),
    { url: '/names/', kind: 'names', ready: '.tabs [role=tab]', has: ['People & Organisations', 'Donald Trump', 'Companies & Funds'] },
    { url: '/balance/', kind: 'balance', ready: '#bx-stage .bm', has: ['The Balance Sheet', 'Headline Figures', 'Salary Accrued This Term', '$725,000 to $730,000', 'Salary Donations Documented', '$66,000', 'Nothing documented after Oct 2025', '$1.424 billion', 'Read This First', 'Gross, Not Profit', 'Entity Total or His Share', '2026 Not Yet Disclosed', 'During, Not Because Of', 'Nothing here shows money received for an official act', 'Subtotals', 'There is no grand total', '$63,057,251', 'All Rows', '$635,068,835', 'Trust for the National Mall'] },
    { url: '/method/', kind: 'method', ready: 'ol.msteps', has: ['How We Checked', 'Method', 'Verdicts', 'Evidence Grades', 'Limits', 'Send a source'] },
    { url: '/map/', kind: 'map', ready: '#graph', has: ['Map of Checks, Names & Links', 'Most Connected Names'] },
    { url: '/map/matrix/', kind: 'matrix', ready: '#matrix', has: ['Matrix of the Most Connected Names'] },
    { url: '/map/topic/' + TOPIC + '/', kind: 'maptopic', ready: '#graph', has: ['Gulf Money on the Map', 'Most-Named in These Checks'] }
  ];

  // ---- 1. the raw HTML, as a crawler or a reader without JavaScript gets it
  const meta = JSON.parse(JSON.stringify((() => { const w = {}; new Function('window', fs.readFileSync(path.join(ROOT, 'map', 'graph-data.js'), 'utf8'))(w); return w.GRAPH.nodes.filter(n => n.kind !== 'theme').map(n => ({ id: n.id, kind: n.kind, title: n.title || n.name, verdict: n.verdict, q: (n.question_points || [])[0], den: (n.denial_points || []).length, src: (n.sources || []).length, subs: (n.sub_claims || []).map(s => s.statement), role: n.role })); })()));
  const node = (kind, id) => meta.find(n => n.kind === kind && n.id === id);
  for (const pg of PAGES) {
    const r = await raw(port, pg.url), t = text(pageSlot(r.body)), tag = 'raw ' + pg.url + ': ';
    ok(tag + 'status 200', r.status === 200, r.status);
    ok(tag + 'has its own title, description and Open Graph tags', /<title>[^<]{5,}<\/title>/.test(r.body) && /<meta name="description" content="[^"]{30,}">/.test(r.body) && /<meta property="og:title" content="[^"]+">/.test(r.body) && /<meta name="twitter:card"/.test(r.body));
    ok(tag + 'one h1 in the content', (pageSlot(r.body).match(/<h1[ >]/g) || []).length === 1);
    ok(tag + 'the denial note appears once, in the footer, with the data date', text(r.body).split(NOTE).length === 2 && /<footer[\s\S]*Everyone named denies wrongdoing\.[\s\S]*Data as of \d/.test(r.body));
    for (const h of pg.has) ok(tag + 'contains "' + h + '"', t.includes(h));
    ok(tag + 'no hash routes left in the HTML', !/href="#(?!app")/.test(r.body), (r.body.match(/href="#(?!app")[^"]*"/) || [])[0]);
    ok(tag + 'asset addresses are absolute', !/(?:src|href)="(?!\/|https:\/\/|#)[^"]*"/.test(r.body), (r.body.match(/(?:src|href)="(?!\/|https:\/\/|#)[^"]*"/) || [])[0]);
    ok(tag + 'no inline script', !/<script(?![^>]*\bsrc=)[^>]*>/.test(r.body));
    if (pg.kind === 'check') {
      const c = node('claim', pg.id);
      ok(tag + 'title and question', t.includes(c.title) && t.includes(c.q.slice(0, 60)), c.title);
      ok(tag + 'every point', c.subs.every(s => t.includes(s.replace(/\s+/g, ' ').slice(0, 50))), c.subs.length);
      ok(tag + 'the other side', !c.den || t.includes('The Other Side'));
      ok(tag + 'source list', (pageSlot(r.body).match(/<ol class="pre-src">[\s\S]*?<\/ol>/) || [''])[0].split('<li>').length - 1 === c.src, c.src);
      ok(tag + 'preloads only its own detail file', (r.body.match(/rel="preload" as="fetch"[^>]*href="[^"]*"/g) || []).length === 1 && new RegExp('/assets/d/' + pg.id + '\\.[0-9a-f]+\\.json').test(r.body));
      if (c.verdict === 'unverified') ok(tag + 'marked as an unverified single-source allegation', t.includes('Unverified, Single Source') && t.includes('rests on one source') && t.includes('Everyone named denies it') && /name="description" content="Unverified single-source allegation, denied by everyone named/.test(r.body));
    }
    if (pg.kind === 'balance') {
      const slot = pageSlot(r.body), all = fs.readdirSync(path.join(ROOT, 'data', 'ledger')).flatMap(f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ledger', f), 'utf8')).map(x => x.id));
      const used = (slot.match(/data-rows="[^"]+"/g) || []).flatMap(a => a.slice(11, -1).split(' '));
      ok(tag + 'every ledger row is in the HTML, and every figure names its rows', all.every(id => slot.includes('<tr data-rows="' + id + '">')) && used.every(id => all.includes(id)) && (slot.match(/<b data-rows=/g) || []).length >= 9, all.length + ' rows, ' + used.length + ' references');
      ok(tag + 'links to the six checks behind it', ['C95', 'C96', 'C97', 'C98', 'C99', 'C100'].every(id => slot.includes('href="/checks/' + id + '/"')));
      ok(tag + 'preloads the ledger file only', (r.body.match(/rel="preload" as="fetch"[^>]*href="[^"]*"/g) || []).length === 1 && /\/assets\/ledger\.[0-9a-f]+\.json/.test(r.body));
      ok(tag + 'neutral wording', !/\b(grift\w*|corrupt\w*|profiteer\w*|bribe\w*|kickback\w*|quid pro quo)\b/i.test(t) && !t.includes('—'), (t.match(/.{30}\b(grift|corrupt|profiteer|bribe)\w*.{30}/i) || [])[0]);
      ok(tag + 'no mention of a video or its maker (YouTube appears only as the company that settled)', !/\b(video|youtuber|creator|channel|podcast|influencer|streamer)\b/i.test(t.replace(/YouTube[^.<]{0,40}(settlement|Alphabet|pays|filing)/g, '')) && !/youtube(?!\/Alphabet|'s| \(Alphabet| pays| account)/i.test(t.replace(/Alphabet\/YouTube|YouTube\/Alphabet/g, '')), (t.match(/.{30}\b(video|creator|channel)\b.{30}/i) || t.match(/.{40}youtube.{40}/i) || [])[0]);
      ok(tag + 'no grand total', !/grand total of|total income of|in total he received/i.test(t));
    }
    if (pg.kind === 'check' && (pg.id === 'C95' || pg.id === 'C101')) {
      ok(tag + 'in the home list under its topic', new RegExp('<a href="/checks/' + pg.id + '/">').test((await raw(port, '/')).body));
      if (pg.id === 'C95') ok(tag + 'links to the balance sheet', /href="\/balance\/">See the Balance Sheet<\/a>/.test(pageSlot(r.body)));
      if (pg.id === 'C101') ok(tag + 'does not link to the balance sheet', !/href="\/balance\/"/.test(pageSlot(r.body)));
    }
    if (pg.kind === 'name') { const e = node('entity', pg.id); ok(tag + 'name, role and connections', t.includes(e.title) && (!e.role || t.includes(e.role.slice(0, 40))) && /Closest Connections/.test(t), e.title); }
  }
  for (const u of ['/', '/method/', '/map/', '/map/matrix/', '/404.html']) {   // pages whose words are ours, not names or headlines from the data
    const t = text(pageSlot((await raw(port, u)).body));
    ok('wording ' + u + ': no em dash', !t.includes('—'));
    ok('wording ' + u + ': neutral, no mention of a video or its maker', !/\b(video|youtube|youtuber|creator|channel|podcast|influencer|streamer)\b/i.test(t), (t.match(/.{30}\b(video|youtube|creator|channel)\b.{30}/i) || [])[0]);
  }
  for (const id of ['C37', 'C46']) {   // wherever these two are listed, they are marked
    for (const u of ['/', '/checks/', '/method/', '/names/jared-kushner/', '/map/topic/foreign-deals/', '/map/topic/gulf-money/']) {
      const b = pageSlot((await raw(port, u)).body), re = new RegExp('<li><a href="/checks/' + id + '/">[^<]*</a> <span class="pre-v">([^<]*)</span>', 'g');
      let m, bad = 0, n = 0; while ((m = re.exec(b))) { n++; if (m[1] !== 'Unverified, Single Source') bad++; }
      ok('raw ' + u + ': every listing of ' + id + ' says Unverified, Single Source', bad === 0, bad + ' of ' + n);
    }
  }
  { const r = await raw(port, '/no/such/page/'); ok('a miss answers 404 with the friendly page', r.status === 404 && /Page Not Found/.test(r.body) && /name="robots" content="noindex"/.test(r.body) && /href="\/checks\/"/.test(r.body), r.status); }
  { const r = await raw(port, '/checks/C999/'); ok('an unknown check answers 404', r.status === 404, r.status); }
  { const r = await raw(port, '/robots.txt'); ok('robots.txt', r.status === 200 && /User-agent: \*/.test(r.body)); }
  { const home = (await raw(port, '/')).body, has = fs.existsSync(path.join(site, 'sitemap.xml')), canon = /rel="canonical"/.test(home);
    ok('sitemap.xml and canonical links appear together (only when the public address is known)', has === canon, 'sitemap ' + has + ', canonical ' + canon);
    ok('favicon and manifest', /rel="icon" href="\/assets\/favicon\.[0-9a-f]+\.svg"/.test(home) && /rel="manifest" href="\/assets\/site\.[0-9a-f]+\.webmanifest"/.test(home)); }

  // ---- 2. in a browser
  const browser = await chromium.launch();
  const errors = [];
  async function open(width, opts) {
    const ctx = await browser.newContext(Object.assign({ viewport: { width, height: width > 700 ? 900 : 860 }, deviceScaleFactor: 1 }, opts || {}));
    await ctx.addInitScript(() => { window.__STILL__ = true; });
    await ctx.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));   // the test does not depend on the network
    const p = await ctx.newPage();
    p.tag = String(width);
    p.on('console', m => { if (m.type() === 'error' && !p.quiet) errors.push(p.tag + ' ' + p.url().replace(origin, '') + ': ' + m.text()); });
    p.on('pageerror', e => errors.push(p.tag + ' ' + p.url().replace(origin, '') + ': ' + e.message));
    p.on('requestfailed', q => { if (!p.quiet) errors.push(p.tag + ' request failed: ' + q.url().replace(origin, '')); });
    return p;
  }
  const where = p => p.evaluate(() => location.pathname + location.hash);
  const overflow = p => p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  const settle = async (p, pg) => { await p.waitForSelector(pg.ready, { state: 'visible', timeout: 8000 }); await p.waitForTimeout(pg.kind.startsWith('ma') ? 900 : 250); };
  /* What the reader sees, as text: the page, or on the map the panel and the read-out. */
  const shot = p => p.evaluate(() => {
    const pg = document.getElementById('page'), mv = document.getElementById('mapview'), tx = e => e && !e.hidden && e.getClientRects().length ? e.innerText.replace(/\s+/g, ' ').trim() : '';
    return JSON.stringify({ title: document.title, at: location.pathname + location.hash, nav: (document.querySelector('[data-nav][aria-current]') || { getAttribute: () => '' }).getAttribute('data-nav'),
      page: pg.hidden ? '' : tx(pg), panel: mv.hidden ? '' : tx(document.getElementById('panel')), hud: mv.hidden ? '' : tx(document.getElementById('hud')),
      mode: mv.hidden ? '' : mv.className, pressed: mv.hidden ? '' : Array.from(mv.querySelectorAll('[data-view][aria-pressed=true]')).map(b => b.getAttribute('data-view')).join() });
  });
  for (const width of [1440, 400]) {
    const direct = await open(width), nav = await open(width);
    await nav.goto(origin + '/method/', { waitUntil: 'load' }); await nav.waitForSelector('ol.msteps');
    await nav.evaluate(() => { window.__sameDocument = true; });
    for (const pg of PAGES) {
      const tag = width + ' ' + pg.url + ': ';
      try {
        const before = server.log.length;
        await direct.goto(origin + pg.url, { waitUntil: 'load' }); await settle(direct, pg);
        ok(tag + 'the interface takes over', await direct.evaluate(() => !document.querySelector('#page .pre') || document.getElementById('page').hidden));
        ok(tag + 'no sideways overflow', !(await overflow(direct)));
        ok(tag + 'address unchanged by loading', (await where(direct)) === pg.url, await where(direct));
        if (pg.kind === 'check') {
          const got = server.log.slice(before).map(l => l.url).filter(u => u.startsWith('/assets/d/'));
          ok(tag + 'fetches only its own detail file', got.length === 1 && got[0].startsWith('/assets/d/' + pg.id + '.'), got.join(' '));
          ok(tag + 'points, sources and report are drawn', await direct.evaluate(() => !!document.querySelector('#holds, #fixes, #unproven') && !!document.querySelector('#sources') && !!document.querySelector('#report-box') && document.querySelectorAll('ol.points > li').length > 0));
          if (pg.id === 'C95') ok(tag + 'offers the balance sheet', await direct.evaluate(() => !!document.querySelector('.article .inote a[href="/balance/"]')));
          if (pg.id === 'C37' || pg.id === 'C46') ok(tag + 'flagged as unverified, single source', await direct.evaluate(() => /Unverified, Single Source/.test((document.querySelector('.inote.unv') || {}).textContent || '')));
        }
        if (pg.kind === 'balance') {
          const got = server.log.slice(before).map(l => l.url).filter(u => /\/assets\/(ledger|d\/)/.test(u));
          ok(tag + 'fetches the ledger file and no check detail', got.length === 1 && got[0].startsWith('/assets/ledger.'), got.join(' '));
          ok(tag + 'toolbar, figure and dossier are drawn, each mark with its rows', await direct.evaluate(() => document.querySelectorAll('#bx-bar [data-bx="view"]').length === 5 && document.querySelectorAll('#bx-stage .bm').length > 30 && document.querySelectorAll('#bx-panel .bd-figs > div').length === 5 && document.querySelectorAll('#bx-panel .bd-caveats > div').length === 4 && Array.from(document.querySelectorAll('#bx-stage .bm, #bx-panel .bd-figs dd:not(.bd-n)')).every(e => /^C\d+-\d+/.test(e.getAttribute('data-rows') || ''))));
          ok(tag + 'the header marks the section', (await direct.getAttribute('[data-nav="balance"]', 'aria-current')) === 'page');
          if (width > 700) ok(tag + 'the tool fits one screen', await direct.evaluate(() => { const r = document.getElementById('bx').getBoundingClientRect(); return Math.abs(r.bottom - innerHeight) < 2 && r.top >= 0; }));
          ok(tag + 'no paragraph runs past two sentences', await direct.evaluate(() => Array.from(document.querySelectorAll('#bx p, #bx dd, #bx li')).every(e => (e.textContent.match(/[.!?](\s|$)/g) || []).length <= 2)), await direct.evaluate(() => (Array.from(document.querySelectorAll('#bx p, #bx dd, #bx li')).find(e => (e.textContent.match(/[.!?](\s|$)/g) || []).length > 2) || {}).textContent));
        }
        if (pg.kind === 'map' || pg.kind === 'maptopic') ok(tag + 'the map is drawn', await direct.evaluate(() => document.getElementById('map-loading').hidden && !document.getElementById('mapview').hidden && document.getElementById('graph').width > 100));
        if (pg.kind === 'maptopic') ok(tag + 'the topic is selected', /Gulf Money/.test(await direct.evaluate(() => document.getElementById('hud').textContent + document.getElementById('panel').textContent)));
        if (pg.kind === 'matrix') ok(tag + 'the matrix is drawn', await direct.evaluate(() => !document.getElementById('matrix').hidden && (document.getElementById('mx-canvas').width > 50 || document.getElementById('mx-phone').children.length > 0)));
        // the same address reached by following a link, without a page load
        await nav.evaluate(u => { const a = document.createElement('a'); a.href = u; a.id = 'crawl-link'; a.textContent = 'x'; document.body.appendChild(a); a.click(); a.remove(); }, pg.url);
        await settle(nav, pg);
        ok(tag + 'reached by a link without a page load', await nav.evaluate(() => window.__sameDocument === true));
        await nav.evaluate(() => window.scrollTo(0, 0)); await direct.evaluate(() => window.scrollTo(0, 0));
        const a = await shot(direct), b = await shot(nav);
        ok(tag + 'direct load equals navigated state', a === b, (() => { const x = JSON.parse(a), y = JSON.parse(b); for (const k of Object.keys(x)) if (x[k] !== y[k]) { let i = 0; while (x[k][i] === y[k][i]) i++; return k + ' differs at ' + i + ': "' + x[k].slice(Math.max(0, i - 30), i + 50) + '" / "' + y[k].slice(Math.max(0, i - 30), i + 50) + '"'; } })());
        ok(tag + 'no sideways overflow after navigating', !(await overflow(nav)));
      } catch (e) { ok(tag + 'ran', false, e.message.split('\n')[0]); }
    }
    // back and forward through the last three addresses
    const last = PAGES.slice(-3).map(p => p.url);
    await nav.goBack(); await nav.waitForTimeout(500); ok(width + ' back once', (await where(nav)) === last[1], await where(nav));
    ok(width + ' back shows the matrix', await nav.evaluate(() => !document.getElementById('matrix').hidden));
    await nav.goBack(); await nav.waitForTimeout(500); ok(width + ' back twice', (await where(nav)) === last[0] && await nav.evaluate(() => document.getElementById('matrix').hidden && !document.getElementById('map-stage').hidden || !document.getElementById('map-list').hidden), await where(nav));
    await nav.goBack(); await nav.waitForTimeout(500); ok(width + ' back to a page', (await where(nav)) === '/method/' && await nav.evaluate(() => document.getElementById('mapview').hidden && !!document.querySelector('ol.msteps')), await where(nav));
    await nav.goForward(); await nav.goForward(); await nav.goForward(); await nav.waitForTimeout(600);
    ok(width + ' forward three times', (await where(nav)) === last[2] && await nav.evaluate(() => window.__sameDocument === true), await where(nav));
    await direct.context().close(); await nav.context().close();
  }

  // ---- 3. moving around as a reader does (wide screen)
  {
    const p = await open(1440); p.tag = 'journey';
    await p.goto(origin + '/', { waitUntil: 'load' }); await p.waitForSelector('#topics .topicnav');
    await p.evaluate(() => { window.__sameDocument = true; });
    const same = () => p.evaluate(() => window.__sameDocument === true);
    ok('journey: every link the interface draws on the home page is a path', await p.evaluate(() => Array.from(document.querySelectorAll('a[href]')).every(a => a.getAttribute('href').charAt(0) === '/' || /^https?:/.test(a.getAttribute('href')) || a.getAttribute('href') === '#app')), await p.evaluate(() => (Array.from(document.querySelectorAll('a[href]')).find(a => a.getAttribute('href').charAt(0) === '#' && a.getAttribute('href') !== '#app') || {}).outerHTML));
    await p.click('.topicnav a[href="/checks/#topic-' + TOPIC + '"]'); await p.waitForTimeout(400);
    ok('journey: a topic link scrolls to its topic on the checks list', (await where(p)) === '/checks/#topic-' + TOPIC && await p.evaluate(id => { const r = document.getElementById(id).getBoundingClientRect(); return r.top > -40 && r.top < 300; }, 'topic-' + TOPIC), await where(p));
    await p.click('#topic-' + TOPIC + ' .rows a.t[href="/checks/C06/"]'); await p.waitForSelector('.article .aside .glance');
    ok('journey: list to check', (await where(p)) === '/checks/C06/' && (await p.title()).startsWith('A UAE-Backed 49% Stake') && await same(), await where(p));
    ok('journey: the header marks the section', (await p.getAttribute('[data-nav="claims"]', 'aria-current')) === 'page');
    ok('journey: a check page draws only paths', await p.evaluate(() => Array.from(document.querySelectorAll('#page a[href]')).every(a => a.getAttribute('href').charAt(0) === '/' || /^https?:/.test(a.getAttribute('href')))));
    await p.click('.wtable tbody a[href^="/names/"]'); await p.waitForSelector('article.profile');
    const prof = await where(p);
    ok('journey: check to profile', /^\/names\/[a-z0-9-]+\/$/.test(prof) && await same(), prof);
    await p.click('.titlebar a.btn'); await p.waitForSelector('#graph', { state: 'visible' }); await p.waitForTimeout(900);
    const sel = '/map/#' + prof.split('/')[2];
    ok('journey: Show on Map selects the name', (await where(p)) === sel && (await p.evaluate(() => document.querySelector('#panel h2').textContent)).length > 0 && await same(), await where(p));
    const t = await p.evaluate(() => window.__mapProbe && window.__mapProbe('e:donald-trump'));
    if (t) { await p.mouse.click(t.x, t.y); await p.waitForTimeout(600); ok('journey: selecting a mark on the globe updates the address', (await where(p)) === '/map/#donald-trump' && /Donald Trump on the Map/.test(await p.title()), await where(p)); }
    await p.click('#panel .panel-actions a.btn.primary'); await p.waitForSelector('article.profile');
    ok('journey: Open Page from the map', (await where(p)) === '/names/donald-trump/' && await same(), await where(p));
    await p.goBack(); await p.waitForTimeout(600); ok('journey: back to the selection on the map', (await where(p)) === '/map/#donald-trump' && /Donald Trump/.test(await p.evaluate(() => document.querySelector('#panel h2').textContent)), await where(p));
    await p.goBack(); await p.waitForTimeout(600); ok('journey: back to the earlier selection', (await where(p)) === sel, await where(p));
    await p.goBack(); await p.waitForTimeout(400); ok('journey: back to the profile', (await where(p)) === prof && await p.evaluate(() => !!document.querySelector('article.profile') && document.getElementById('mapview').hidden), await where(p));
    await p.goBack(); await p.waitForSelector('.article .aside .glance'); ok('journey: back to the check', (await where(p)) === '/checks/C06/', await where(p));
    await p.goForward(); await p.waitForSelector('article.profile'); ok('journey: forward to the profile', (await where(p)) === prof && await same(), await where(p));
    await p.fill('#search', 'kushner'); await p.waitForSelector('#search-results [role=option]'); await p.keyboard.press('Enter'); await p.waitForSelector('article.profile'); await p.waitForTimeout(200);
    ok('journey: a search result opens its page', (await where(p)) === '/names/jared-kushner/' && await same(), await where(p));
    await p.click('.crumb a'); await p.waitForSelector('.tabs [role=tab]'); ok('journey: breadcrumb to the list of names', (await where(p)) === '/names/', await where(p));
    await p.click('[data-nav="map"]'); await p.waitForSelector('#graph', { state: 'visible' }); await p.waitForTimeout(700);
    await p.click('#mapview [data-view="matrix"]'); await p.waitForTimeout(500); ok('journey: the Matrix switch has its own address', (await where(p)) === '/map/matrix/' && /^Matrix/.test(await p.title()), await where(p));
    await p.click('#mapview [data-view="network"]'); await p.waitForTimeout(500);
    await p.click('#panel .ptopics a[data-topic="' + TOPIC + '"]'); await p.waitForTimeout(600);
    ok('journey: a topic on the map has its own address', (await where(p)) === '/map/topic/' + TOPIC + '/' && await same(), await where(p));
    await p.click('#panel .panel-actions a.btn.primary'); await p.waitForSelector('#topics'); await p.waitForTimeout(300);
    ok('journey: Open Topic goes to the topic on the checks list', (await where(p)) === '/checks/#topic-' + TOPIC && await same(), await where(p));
    await p.click('.site'); await p.waitForTimeout(300); ok('journey: the site name goes home', (await where(p)) === '/' && (await p.title()) === 'The Trump Connection', await where(p));
    // a detail file that fails to load: an error with a way to try again
    p.quiet = true;
    await p.route(/\/assets\/d\//, r => r.abort());
    await p.evaluate(() => { const a = document.createElement('a'); a.href = '/checks/C22/'; document.body.appendChild(a); a.click(); a.remove(); });
    await p.waitForSelector('#detail-retry');
    ok('journey: a failed detail load says so and offers a retry', /did not load/.test(await p.evaluate(() => document.getElementById('page').textContent)) && (await where(p)) === '/checks/C22/');
    await p.unroute(/\/assets\/d\//);
    await p.click('#detail-retry'); await p.waitForSelector('.article .aside .glance');
    ok('journey: the retry loads the check', await p.evaluate(() => document.querySelectorAll('ol.points > li').length > 0) && await same());
    p.quiet = false;
    // a slow detail file: the page says it is loading, with the verdict from the core data
    await p.route(/\/assets\/d\//, async r => { await new Promise(x => setTimeout(x, 700)); r.continue(); });
    await p.evaluate(() => { const a = document.createElement('a'); a.href = '/checks/C46/'; document.body.appendChild(a); a.click(); a.remove(); });
    await p.waitForSelector('[role=status]');
    ok('journey: a loading state while the detail is fetched, already marked unverified', await p.evaluate(() => /Loading points/.test(document.getElementById('page').textContent) && /Unverified, Single Source/.test(document.querySelector('.cv-word').textContent)));
    await p.waitForSelector('.article .aside .glance'); await p.unroute(/\/assets\/d\//);
    await p.context().close();
  }

  // ---- 3b. the balance sheet as a tool: views, selection, the share switch, deep links, keys, the data view
  for (const width of [1440, 400]) {
    const p = await open(width); p.tag = 'balance' + width;
    const tap = q => p.evaluate(x => document.querySelector(x).dispatchEvent(new MouseEvent('click', { bubbles: true })), q);   // on a phone the open dossier sheet can cover a control
    const T = 'balance tool ' + width + ': ', sel = () => p.evaluate(() => (document.querySelector('#bx-panel .panel-head h2') || {}).textContent || '');
    await p.goto(origin + '/balance/', { waitUntil: 'load' }); await p.waitForSelector('#bx-stage .bm');
    await p.evaluate(() => { window.__sameDocument = true; });
    await tap('#bx-stage .bm[data-key="C96-01"]'); await p.waitForTimeout(150);
    ok(T + 'clicking a mark selects it, opens its dossier and sets the address', (await where(p)) === '/balance/#row=C96-01' && /World Liberty Token-Sale Proceeds/.test(await sel()) && await p.evaluate(() => /\$526,810,321/.test(document.querySelector('.bd-amt').textContent) && /C96-01/.test(document.querySelector('.bd-ids').textContent) && /C97-01/.test(document.querySelector('.bd-ids').textContent) && !!document.querySelector('.bd-checks a[href="/checks/C96/"]') && document.querySelectorAll('#bx-panel .bd-sec a[target="_blank"]').length > 0), await where(p));
    await tap('#bx-bar [data-bx="share"][data-v="1"]'); await p.waitForTimeout(150);
    ok(T + 'the share switch shows both readings, the unknown labelled', (await where(p)) === '/balance/#share=1&row=C96-01' && await p.evaluate(() => /\$368,767,225/.test(document.querySelector('.bd-amt').textContent) && /As Reported\$526,810,321/.test(document.querySelector('.bd-two').textContent) && /Unknown/.test(document.querySelector('.bd-unk').textContent) && /does not say which reading is right/.test(document.getElementById('bx-note').textContent) && document.querySelectorAll('#bx-stage .bm-ghost').length >= 10), await where(p));
    await tap('#bx-bar [data-bx="share"][data-v="0"]');
    await tap('#bx-bar [data-bx="group"][data-v="venture"]'); await p.waitForTimeout(150);
    ok(T + 'grouping by venture regroups the lanes and drops the subtotals', (await where(p)) === '/balance/#group=venture&row=C96-01' && await p.evaluate(() => /World Liberty Financial/.test(document.querySelector('#bx-stage').textContent) && !document.querySelector('#bx-stage .bl-row.tot') && /Subtotals are shown only under Category/.test(document.querySelector('#bx-stage').textContent)), await where(p));
    await tap('#bx-bar [data-bx="scale"][data-v="linear"]'); await p.waitForTimeout(150);
    ok(T + 'the scale switch redraws the axis', /scale=linear/.test(await where(p)) && await p.evaluate(() => /Linear scale|\$0/.test(document.querySelector('.bx-axis').textContent)));
    for (const [view, key, name, extra] of [['paper', 'C98-04', 'Change Over the Term', () => document.querySelectorAll('#bx-stage .bl-row.linked').length >= 3], ['family', 'C99-06', '30% of DT Marks', () => /None documented/.test(document.getElementById('bx-stage').textContent)], ['settlements', 'C100-12', 'X Corp.', () => document.querySelectorAll('#bx-stage .bf-link').length === 5 && /Trust for the National Mall|National Mall Trust/.test(document.getElementById('bx-stage').textContent)], ['estimates', 'C100-08', 'Bloomberg, the Family, Jun 2026', () => /cannot be added/.test(document.getElementById('bx-note').textContent)]]) {
      await tap('#bx-bar [data-bx="view"][data-v="' + view + '"]'); await p.waitForTimeout(150);
      await tap('#bx-stage [data-key="' + key + '"]'); await p.waitForTimeout(150);
      ok(T + 'view ' + view + ': drawn, a figure selected, address set', (await where(p)).startsWith('/balance/#view=' + view) && (await where(p)).endsWith('row=' + key) && (await sel()).includes(name) && await p.evaluate(extra) && await p.evaluate(() => Array.from(document.querySelectorAll('#bx-stage [data-key]')).every(e => /^C\d+-\d+/.test(e.getAttribute('data-rows') || ''))), (await where(p)) + ' ' + (await sel()));
      ok(T + 'view ' + view + ': no sideways overflow', !(await overflow(p)));
    }
    ok(T + 'still the same document', await p.evaluate(() => window.__sameDocument === true));
    await p.goBack(); await p.waitForTimeout(250);
    ok(T + 'back clears the selection in the same view', (await where(p)) === '/balance/#view=estimates' && (await sel()) === '' && await p.evaluate(() => document.querySelector('#bx-bar [data-v="estimates"]').getAttribute('aria-pressed') === 'true'), await where(p));
    await p.goBack(); await p.waitForTimeout(250);
    ok(T + 'back again returns to the earlier view and its selection', (await where(p)) === '/balance/#view=settlements&row=C100-12' && /X Corp/.test(await sel()), await where(p));
    await p.goForward(); await p.waitForTimeout(250);
    ok(T + 'forward', (await where(p)) === '/balance/#view=estimates', await where(p));
    // a deep link, loaded directly
    await p.goto('about:blank'); await p.goto(origin + '/balance/#view=paper&row=C98-04', { waitUntil: 'load' }); await p.waitForSelector('#bx-stage .bm');
    ok(T + 'a deep link opens its view with the row selected', /Change Over the Term/.test(await sel()) && await p.evaluate(() => document.querySelector('#bx-bar [data-v="paper"]').getAttribute('aria-pressed') === 'true' && /−\$4\.06 to −\$3\.44 billion/.test(document.querySelector('.bd-amt').textContent)));
    if (width > 700) {
      await p.goto(origin + '/balance/', { waitUntil: 'load' }); await p.waitForSelector('#bx-stage .bm');
      await p.focus('#bx-stage'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.keyboard.press('ArrowDown'); await p.waitForTimeout(100);
      ok(T + 'arrow keys move the selection', (await where(p)) === '/balance/#row=C96-04' && /TRUMP Coin/.test(await sel()), await where(p));
      await p.keyboard.press('Enter'); ok(T + 'Enter moves to the dossier', await p.evaluate(() => document.activeElement === document.querySelector('#bx-panel .panel-head h2')));
      await p.keyboard.press('Escape'); await p.waitForTimeout(100); ok(T + 'Escape clears', (await where(p)) === '/balance/' && (await sel()) === '', await where(p));
      await tap('#bx-stage [data-key="C95-01"]'); ok(T + 'the salary marker opens the salary dossier', await p.evaluate(() => /The Statute/.test(document.getElementById('bx-panel').textContent) && /What Is Not Documented/.test(document.getElementById('bx-panel').textContent)));
      await p.fill('#bx-q', 'doral'); await p.waitForTimeout(150);
      ok(T + 'the filter narrows the figure', await p.evaluate(() => document.querySelectorAll('#bx-stage .bl-row:not(.pin)').length === 1 && /Trump National Doral/.test(document.getElementById('bx-stage').textContent)));
      await p.fill('#bx-q', '');
    }
    if (width < 700) { await tap('#bx-panel [data-bx="clear"]'); await p.waitForTimeout(100); ok(T + 'the sheet closes', (await sel()) === ''); }   // on a phone the dossier is a sheet over the page
    await p.click('#bx-rows summary'); await p.waitForSelector('#bx-table tbody tr');
    ok(T + 'All Rows lists every ledger row', await p.evaluate(() => document.querySelectorAll('#bx-table tbody tr').length) === fs.readdirSync(path.join(ROOT, 'data', 'ledger')).reduce((n, f) => n + JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'ledger', f), 'utf8')).length, 0));
    await p.click('#bx-table [data-bx="sort"][data-v="hi"]'); await p.click('#bx-table [data-bx="sort"][data-v="hi"]'); await p.waitForTimeout(100);
    ok(T + 'the table sorts', await p.evaluate(() => document.querySelector('#bx-table tbody tr td:nth-child(7)').textContent === 'open' && document.querySelector('#bx-table th[aria-sort="descending"]') !== null), await p.evaluate(() => document.querySelector('#bx-table tbody tr').getAttribute('data-rows')));
    await p.fill('#bx-tq', 'melania'); await p.waitForTimeout(100);
    ok(T + 'the table filters', await p.evaluate(() => { const n = document.querySelectorAll('#bx-table tbody tr').length; return n > 2 && n < 12; }));
    const [dl] = await Promise.all([p.waitForEvent('download', { timeout: 5000 }).catch(() => null), p.click('#bx-rows [data-bx="csv"]')]);
    const csv = dl ? fs.readFileSync(await dl.path(), 'utf8') : '';
    ok(T + 'Download CSV gives every row', !!dl && dl.suggestedFilename() === 'balance-sheet-ledger.csv' && csv.split('\n')[0].startsWith('id,check,recipient_name') && /\nC96-29b,/.test(csv) && /\nC95-01,C95,/.test(csv), dl ? csv.slice(0, 80) : 'no download');
    await p.context().close();
  }

  // ---- 4. addresses from the hash-routed version
  {
    const p = await open(1440); p.tag = 'old';
    const OLD = [['/#C06', '/checks/C06/'], ['/#name-jared-kushner', '/names/jared-kushner/'], ['/#map', '/map/'], ['/#map-matrix', '/map/matrix/'], ['/#map-topic-' + TOPIC, '/map/topic/' + TOPIC + '/'],
      ['/#map-jared-kushner', '/map/#jared-kushner'], ['/#names', '/names/'], ['/#method', '/method/'], ['/#balance', '/balance/'], ['/#balance-view=paper&row=C98-04', '/balance/#view=paper&row=C98-04'], ['/#claims', '/checks/'], ['/#topic-' + TOPIC, '/checks/#topic-' + TOPIC], ['/#home', '/'], ['/#jared-kushner', '/names/jared-kushner/'], ['/#map-list', '/map/#list']];
    for (const [from, to] of OLD) {
      await p.goto('about:blank'); await p.goto(origin + from, { waitUntil: 'load' }); await p.waitForTimeout(700);
      ok('old address ' + from + ' goes to ' + to, (await where(p)) === to, await where(p));
    }
    ok('old address /#C06 shows the check', await p.goto(origin + '/#C06').then(() => p.waitForSelector('.article .aside .glance')).then(() => true, () => false));
    p.quiet = true;   // the 404 itself is reported by the browser as a failed resource
    const r = await p.goto(origin + '/checks/nothing-here/', { waitUntil: 'load' }); await p.waitForTimeout(400);
    ok('a miss in the browser: 404, the friendly page, the search still works', r.status() === 404 && /Page Not Found/.test(await p.evaluate(() => document.querySelector('#page h1').textContent)) && (await p.title()).startsWith('Page Not Found'));
    await p.fill('#search', 'qatar'); await p.waitForSelector('#search-results [role=option]'); await p.keyboard.press('Enter'); await p.waitForSelector('article.profile');
    ok('a miss in the browser: a search result opens from there', (await where(p)) === '/names/qatar/', await where(p));
    await p.context().close();
  }

  // ---- 5. without JavaScript: readable, and no overflow
  for (const width of [1440, 400]) {
    const p = await open(width, { javaScriptEnabled: false }); p.tag = 'nojs' + width;
    for (const u of ['/', '/checks/', '/checks/C37/', '/checks/C101/', '/balance/', '/names/jared-kushner/', '/names/', '/method/', '/map/']) {
      await p.goto(origin + u, { waitUntil: 'load' });
      const m = await p.locator('#page').evaluate(e => ({ wide: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1, h1: !!e.querySelector('h1') && e.querySelector('h1').getBoundingClientRect().height > 10, links: e.querySelectorAll('a[href^="/"]').length }));
      ok('no JavaScript ' + width + ' ' + u + ': readable, with links, no overflow', !m.wide && m.h1 && m.links > 1, JSON.stringify(m));
    }
    await p.context().close();
  }
  ok('no console errors, page errors or failed requests', errors.length === 0, errors.slice(0, 12).join(' | '));

  // ---- 6. first-load transfer, gzipped, each from an empty cache
  const sizes = {};
  for (const [label, u, ready] of [['home', '/', '#topics .topicnav'], ['check', '/checks/C06/', '.article .aside .glance'], ['profile', '/names/jared-kushner/', 'article.profile'], ['map', '/map/', '#graph']]) {
    const p = await open(1440), before = server.log.length;
    await p.goto(origin + u, { waitUntil: 'load' }); await p.waitForSelector(ready, { state: 'visible' }); await p.waitForTimeout(800);
    const got = server.log.slice(before);
    sizes[label] = { requests: got.length, gz: got.reduce((a, l) => a + l.bytes, 0), raw: got.reduce((a, l) => a + l.raw, 0), files: got.map(l => l.url.replace(/\.[0-9a-f]{10}\./, '.') + ' ' + (l.bytes / 1024).toFixed(1)) };
    await p.context().close();
  }
  await browser.close(); server.close();
  const gz = f => zlib.gzipSync(fs.readFileSync(path.join(ROOT, f)), { level: 9 }).length;
  const artifact = ['map/index.html', 'map/style.css', 'map/matrix.css', 'map/ui.css', 'map/graph-data.js', 'map/matrix.js', 'map/app.js', 'cook/harness/d3.min.js'].reduce((a, f) => a + gz(f), 0);
  const kb = n => (n / 1024).toFixed(0) + ' KB';
  console.log('\nFirst-load transfer, gzipped, fonts not counted:');
  console.log('  artifact build (every address: page, styles, graph-data.js, matrix.js, app.js, d3 from the CDN): ' + kb(artifact));
  for (const k of Object.keys(sizes)) console.log('  site ' + k + ': ' + kb(sizes[k].gz) + ' in ' + sizes[k].requests + ' requests (' + kb(sizes[k].raw) + ' unpacked)\n     ' + sizes[k].files.join(', '));
  console.log('\n' + passes.length + ' checks passed, ' + fails.length + ' failed');
  if (fails.length) { console.log('FAILED:\n  ' + fails.join('\n  ')); process.exit(1); }
})().catch(e => { console.error(e); process.exit(1); });
