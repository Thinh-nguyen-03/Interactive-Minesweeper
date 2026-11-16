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
const CHECKS = ['C06', 'C37', 'C46', 'C01', 'C15', 'C22', 'C33', 'C58', 'C77', 'C94'];
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
          if (pg.id === 'C37' || pg.id === 'C46') ok(tag + 'flagged as unverified, single source', await direct.evaluate(() => /Unverified, Single Source/.test((document.querySelector('.inote.unv') || {}).textContent || '')));
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

  // ---- 4. addresses from the hash-routed version
  {
    const p = await open(1440); p.tag = 'old';
    const OLD = [['/#C06', '/checks/C06/'], ['/#name-jared-kushner', '/names/jared-kushner/'], ['/#map', '/map/'], ['/#map-matrix', '/map/matrix/'], ['/#map-topic-' + TOPIC, '/map/topic/' + TOPIC + '/'],
      ['/#map-jared-kushner', '/map/#jared-kushner'], ['/#names', '/names/'], ['/#method', '/method/'], ['/#claims', '/checks/'], ['/#topic-' + TOPIC, '/checks/#topic-' + TOPIC], ['/#home', '/'], ['/#jared-kushner', '/names/jared-kushner/'], ['/#map-list', '/map/#list']];
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
    for (const u of ['/', '/checks/', '/checks/C37/', '/names/jared-kushner/', '/names/', '/method/', '/map/']) {
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
