// Functional pass over the map and the matrix. Usage: node cook/harness/mapfunc.js
const {chromium}=require('playwright'),path=require('path');
const serve=require('./serve.js');
const out=path.resolve(__dirname,'..','stills','r02');
(async()=>{
  const port=8990+Math.floor(Math.random()*9); const s=await serve(port); const b=await chromium.launch(); const errors=[], log=[];
  function watch(p,tag){ p.on('console',m=>{if(m.type()==='error')errors.push(tag+': '+m.text());}); p.on('pageerror',e=>errors.push(tag+': '+e.message)); }
  async function ok(p,name,fn){ let r; try{ r=await fn(); }catch(e){ r='THREW '+e.message.split('\n')[0]; } log.push((r===true?'pass ':'FAIL ')+name+(r===true?'':' -> '+r)); const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1); if(ov) errors.push(name+': horizontal overflow'); }
  const txt=(p,sel)=>p.evaluate(q=>{const e=document.querySelector(q);return e&&!e.hidden?e.textContent:''},sel);
  // desktop
  let ctx=await b.newContext({viewport:{width:1440,height:900}}), p=await ctx.newPage(); watch(p,'desktop');
  await p.goto('http://localhost:'+port+'/#map'); await p.waitForTimeout(1500);
  await ok(p,'rest panel has ranked names and topics',async()=>(await p.locator('#panel .prank li').count())>=4&&(await p.locator('#panel .ptopics li').count())===9||'counts');
  await p.mouse.move(534,472); await p.waitForTimeout(300);
  await ok(p,'hover shows tip',async()=>/Donald Trump/.test(await txt(p,'#tip'))||await txt(p,'#tip'));
  await p.screenshot({path:path.join(out,'F01-hover.png')});
  await p.mouse.click(534,472); await p.waitForTimeout(500);
  await ok(p,'click selects and sets hash',async()=>p.url().endsWith('#map-donald-trump')&&/Donald Trump/.test(await txt(p,'#panel h2'))||p.url());
  await p.click('[data-act="iso"]'); await p.waitForTimeout(500);
  await ok(p,'isolate shows banner',async()=>/Isolated/.test(await txt(p,'#banner'))||await txt(p,'#banner'));
  await p.screenshot({path:path.join(out,'F02-isolate.png')});
  await p.click('[data-act="iso-more"]'); await p.waitForTimeout(300); await p.click('[data-act="iso-clear"]'); await p.waitForTimeout(300);
  await ok(p,'isolate cleared',async()=>(await txt(p,'#banner'))===''||'banner left');
  await p.goto('http://localhost:'+port+'/#map-jared-kushner'); await p.waitForTimeout(900);
  await p.click('[data-act="path"]'); await p.waitForTimeout(400);
  await ok(p,'trace path asks for second mark',async()=>/Trace a path/.test(await txt(p,'#banner'))||await txt(p,'#banner'));
  await p.fill('#search','Qatar Investment'); await p.waitForTimeout(400); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
  const ban=await txt(p,'#banner'); log.push('info after search during path: url='+p.url().split('#')[1]+' banner='+ban.slice(0,60));
  await p.goto('http://localhost:'+port+'/#map-jared-kushner'); await p.waitForTimeout(700);
  await p.click('[data-act="path"]'); await p.waitForTimeout(600); await p.mouse.click(534,472); await p.waitForTimeout(700);
  await ok(p,'path found by clicking a second mark',async()=>/Path, /.test(await txt(p,'#banner'))||await txt(p,'#banner'));
  await p.screenshot({path:path.join(out,'F03-path.png')});
  await p.click('[data-act="path-clear"]'); await p.waitForTimeout(300);
  await p.goto('http://localhost:'+port+'/#map'); await p.waitForTimeout(700);
  for(const l of [1,2,0]){ await p.click('#detail-sw [data-level="'+l+'"]'); await p.waitForTimeout(400); }
  await ok(p,'detail levels switch',async()=>(await p.getAttribute('#detail-sw [data-level="0"]','aria-pressed'))==='true'||'pressed');
  await p.click('#panel .ptopics a[data-topic="gulf-money"]'); await p.waitForTimeout(500);
  await ok(p,'topic from panel',async()=>p.url().endsWith('#map-topic-gulf-money')&&/13 Checks/.test(await txt(p,'#panel'))||p.url());
  await p.click('.pback'); await p.waitForTimeout(400);
  await ok(p,'All Topics goes back',async()=>p.url().endsWith('#map')&&/How to Read/.test(await txt(p,'#panel h2'))||p.url());
  await p.click('#panel .prank li:nth-child(2) a'); await p.waitForTimeout(500);
  await ok(p,'ranked list selects',async()=>/world-liberty/.test(p.url())||p.url());
  await p.screenshot({path:path.join(out,'F04-wlf.png')});
  await p.click('#panel [data-act="close"]'); await p.waitForTimeout(300);
  await p.click('#tools-toggle'); await p.waitForTimeout(200); await p.click('label[for], .chk >> nth=1'); await p.waitForTimeout(300);
  await ok(p,'filter count shows',async()=>(await txt(p,'#filter-count'))==='1'||await txt(p,'#filter-count'));
  await p.click('[data-act="reset"]'); await p.waitForTimeout(300); await p.keyboard.press('Escape');
  await p.click('[data-view="matrix"]'); await p.waitForTimeout(500);
  await ok(p,'matrix renders',async()=>p.url().endsWith('#map-matrix')&&(await p.locator('#mx-table td[tabindex]').count())>20||p.url());
  await p.locator('#mx-table td.c3').first().hover(); await p.waitForTimeout(200);
  await ok(p,'matrix hover read-out',async()=>/documented link/.test(await txt(p,'#mx-read'))||await txt(p,'#mx-read'));
  await p.screenshot({path:path.join(out,'F05-matrix-hover.png')});
  await p.locator('#mx-table td.c3').first().click(); await p.waitForTimeout(300);
  await ok(p,'matrix cell opens pair',async()=>/Show on Network/.test(await txt(p,'#mx-side'))||'no side');
  await p.screenshot({path:path.join(out,'F06-matrix-sel.png')});
  for(const o of ['connected','alpha','group']){ await p.click('[data-mxo="'+o+'"]'); await p.waitForTimeout(300); }
  await p.screenshot({path:path.join(out,'F07-matrix-order.png')});
  await p.click('[data-mx="topics"]'); await p.waitForTimeout(300);
  await ok(p,'matrix by topic',async()=>p.url().endsWith('#map-matrix-topics')||p.url());
  await p.click('[data-mx="names"]'); await p.waitForTimeout(300);
  await p.locator('#mx-table td.c3').first().click(); await p.waitForTimeout(200); await p.click('[data-mxact="show"]'); await p.waitForTimeout(700);
  await ok(p,'show on network traces the pair',async()=>/Path, /.test(await txt(p,'#banner'))||await txt(p,'#banner'));
  await p.click('[data-theme-opt="dark"]'); await p.waitForTimeout(400); await p.screenshot({path:path.join(out,'F08-dark-path.png')}); await p.click('[data-theme-opt="light"]');
  await p.goto('http://localhost:'+port+'/#map-C46'); await p.waitForTimeout(700);
  await ok(p,'C46 flagged unverified',async()=>/Unverified/.test(await txt(p,'#panel'))||'no flag');
  await p.goto('http://localhost:'+port+'/#home'); await p.waitForTimeout(500); await p.goto('http://localhost:'+port+'/#map-topic-gulf-money'); await p.waitForTimeout(600);
  await p.goBack(); await p.waitForTimeout(500); await ok(p,'back leaves the map',async()=>p.url().endsWith('#home')&&await p.evaluate(()=>document.getElementById('mapview').hidden)||p.url());
  await p.goForward(); await p.waitForTimeout(600); await ok(p,'forward restores topic',async()=>/Gulf Money/.test(await txt(p,'#panel h2'))||'no');
  await ctx.close();
  // phone
  ctx=await b.newContext({viewport:{width:400,height:860},hasTouch:true,isMobile:true}); p=await ctx.newPage(); watch(p,'phone');
  await p.goto('http://localhost:'+port+'/#map'); await p.waitForTimeout(1500);
  await p.tap('#key-toggle'); await p.waitForTimeout(200); await ok(p,'key opens',async()=>p.evaluate(()=>getComputedStyle(document.getElementById('legend')).display!=='none')||'hidden');
  await p.screenshot({path:path.join(out,'F09-phone-key.png')}); await p.tap('#key-toggle');
  await p.tap('#topic-chips [data-topic="crypto-ventures"]'); await p.waitForTimeout(500); await ok(p,'chip focuses topic',async()=>/Crypto/.test(await txt(p,'#panel h2'))||'no');
  await p.tap('#panel [data-act="close"]'); await p.waitForTimeout(300);
  await p.tap('#tools-toggle'); await p.waitForTimeout(300); await p.screenshot({path:path.join(out,'F10-phone-filters.png')}); await p.tap('[data-act="tools-close"]');
  await p.tap('[data-view="list"]'); await p.waitForTimeout(300); await p.tap('#map-list .prank li:nth-child(3) a'); await p.waitForTimeout(600);
  await ok(p,'list selects a name',async()=>/securities|sec/i.test(p.url())&&(await txt(p,'#panel h2')).length>2||p.url());
  await p.screenshot({path:path.join(out,'F11-phone-sel.png')});
  await p.tap('#panel [data-act="close"]'); await p.tap('[data-view="matrix"]'); await p.waitForTimeout(400);
  await p.selectOption('#mxf-name','3'); await p.waitForTimeout(300); await p.tap('.mxf-list button >> nth=0'); await p.waitForTimeout(300);
  await ok(p,'phone matrix focus list opens pair',async()=>/Show on Network/.test(await txt(p,'#mx-side'))||'no');
  await p.screenshot({path:path.join(out,'F12-phone-mx.png')});
  await ctx.close(); await b.close(); s.close();
  console.log(log.join('\n')); console.log(errors.length?('ISSUES:\n'+errors.join('\n')):'no console errors, no overflow');
})();
