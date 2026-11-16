// Functional pass over the globe view. Usage: node cook/harness/globefunc.js
const {chromium}=require('playwright'); const serve=require('./serve.js');
(async()=>{
  const port=8400+Math.floor(Math.random()*200); const s=await serve(port); const b=await chromium.launch(); const errors=[], log=[];
  const watch=(p,tag)=>{ p.on('console',m=>{if(m.type()==='error')errors.push(tag+': '+m.text());}); p.on('pageerror',e=>errors.push(tag+': '+e.message)); };
  const ok=async(name,fn)=>{ let r; try{ r=await fn(); }catch(e){ r='THREW '+e.message.split('\n')[0]; } log.push((r===true?'pass ':'FAIL ')+name+(r===true?'':' -> '+r)); };
  const txt=(p,sel)=>p.evaluate(q=>{const e=document.querySelector(q);return e&&!e.hidden?e.textContent:''},sel);
  const probe=(p,k)=>p.evaluate(k=>window.__mapProbe(k),k);
  const url=p=>p.url().split('#')[1];
  let ctx=await b.newContext({viewport:{width:1440,height:900}}); await ctx.addInitScript(()=>{window.__STILL__=true;}); let p=await ctx.newPage(); watch(p,'desktop');
  await p.goto('http://localhost:'+port+'/#map'); await p.waitForTimeout(1500);
  await ok('rest panel: ranked names, sums, nine topics',async()=>(await p.locator('#panel .prank li').count())>=5&&(await p.locator('#panel .psums li').count())>=4&&(await p.locator('#panel .ptopics li').count())===9||'counts');
  await ok('hud counts',async()=>/Names1,332Links2,402Checks94/.test(await txt(p,'#hud'))||await txt(p,'#hud'));
  let t=await probe(p,'e:donald-trump'); await p.mouse.move(t.x,t.y); await p.waitForTimeout(250);
  await ok('hover shows name',async()=>/Donald Trump/.test(await txt(p,'#tip'))||await txt(p,'#tip'));
  await p.mouse.click(t.x,t.y); await p.waitForTimeout(500);
  await ok('click selects, sets hash, opens dossier',async()=>url(p)==='map-donald-trump'&&/Donald Trump/.test(await txt(p,'#panel h2'))&&(await p.locator('#panel .dfigs div').count())>=3||url(p));
  await ok('dossier has evidence lines with citations',async()=>(await p.locator('#panel .evrow .cite').count())>3||'no cites');
  const before=await probe(p,'e:sec'); await p.mouse.move(400,500); await p.mouse.down(); await p.mouse.move(520,440,{steps:6}); await p.mouse.up(); await p.waitForTimeout(700);
  const after=await probe(p,'e:sec');
  await ok('drag turns the globe and keeps the selection',async()=>Math.hypot(after.x-before.x,after.y-before.y)>20&&url(p)==='map-donald-trump'||JSON.stringify([before,after]));
  const r0=(await probe(p,'e:sec')); await p.mouse.move(500,450); await p.mouse.wheel(0,-400); await p.waitForTimeout(300); const r1=await probe(p,'e:sec');
  await ok('wheel zooms',async()=>r1.r>r0.r*1.1||r0.r+' '+r1.r);
  await p.click('#zoom-fit'); await p.waitForTimeout(800);
  await p.click('[data-act="iso"]'); await p.waitForTimeout(500);
  await ok('isolate: banner and fewer names',async()=>/Isolated/.test(await txt(p,'#banner'))&&!/Names1,332/.test(await txt(p,'#hud'))||await txt(p,'#hud'));
  await p.click('[data-act="iso-more"]'); await p.waitForTimeout(300); await p.click('[data-act="iso-clear"]'); await p.waitForTimeout(300);
  await ok('isolate cleared',async()=>(await txt(p,'#banner'))===''&&/Names1,332/.test(await txt(p,'#hud'))||'left');
  await p.goto('http://localhost:'+port+'/#map-jared-kushner'); await p.waitForTimeout(900);
  await p.click('[data-act="path"]'); await p.waitForTimeout(300);
  await ok('trace asks for a second mark',async()=>/Trace a path/.test(await txt(p,'#banner'))||await txt(p,'#banner'));
  t=await probe(p,'e:sec'); await p.mouse.click(t.x,t.y); await p.waitForTimeout(800);
  await ok('path by clicking a second mark: numbered steps with citations',async()=>(await p.locator('#panel .steps li').count())>=1&&(await p.locator('#panel .steps .cite').count())>=1&&/Path/.test(await txt(p,'#hud'))||await txt(p,'#panel h2'));
  await p.click('#panel [data-act="path-clear"]'); await p.waitForTimeout(400);
  await ok('path cleared, dossier back',async()=>!(await p.locator('#panel .steps').count())||'steps left');
  await p.goto('http://localhost:'+port+'/#map'); await p.waitForTimeout(700);
  for(const l of [1,2,0]){ await p.click('#detail-sw [data-level="'+l+'"]'); await p.waitForTimeout(250); }
  await ok('label levels switch',async()=>(await p.getAttribute('#detail-sw [data-level="0"]','aria-pressed'))==='true'||'pressed');
  await p.click('#color-sw [data-color="kind"]'); await ok('colour by kind updates the key',async()=>/Kind of Name/.test(await txt(p,'#legend'))||await txt(p,'#legend')); await p.click('#color-sw [data-color="topic"]');
  await p.click('#panel .ptopics a[data-topic="gulf-money"]'); await p.waitForTimeout(500);
  await ok('topic from panel',async()=>url(p)==='map-topic-gulf-money'&&/13 Checks/.test(await txt(p,'#panel'))&&/Gulf Money/.test(await txt(p,'#hud'))||url(p));
  await p.click('.pback'); await p.waitForTimeout(400);
  await ok('All Topics goes back',async()=>url(p)==='map'&&/Where to Start/.test(await txt(p,'#panel h2'))||url(p));
  if(await p.locator('#legend [data-act="key"][aria-expanded="false"]').count()){ await p.click('#legend [data-act="key"]'); await p.waitForTimeout(250); }   // the key is folded to one line until asked for
  await p.click('#legend a[data-topic="crypto-ventures"]',{timeout:4000}).catch(()=>{}); await p.waitForTimeout(400);
  await ok('topic from the key',async()=>/^map-topic-/.test(url(p))||url(p)); await p.keyboard.press('Escape'); await p.goto('http://localhost:'+port+'/#map'); await p.waitForTimeout(500);
  await p.click('#tools-toggle'); await p.waitForTimeout(200); await p.click('.chk >> nth=1'); await p.waitForTimeout(300);
  await ok('filter: count shown and fewer names',async()=>(await txt(p,'#filter-count'))==='1'&&!/Names1,332/.test(await txt(p,'#hud'))||await txt(p,'#hud'));
  await p.click('[data-act="reset"]'); await p.waitForTimeout(300); await p.keyboard.press('Escape');
  await p.fill('#search','World Liberty'); await p.waitForTimeout(400); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForTimeout(700);
  log.push('info search from the map goes to: '+url(p));
  await p.goto('http://localhost:'+port+'/#map-C06'); await p.waitForTimeout(700);
  await ok('deep link to a check on the map',async()=>(await txt(p,'#panel h2')).length>5&&/Check C06/.test(await txt(p,'#hud'))||await txt(p,'#hud'));
  await p.click('[data-view="matrix"]'); await p.waitForTimeout(500); await ok('matrix still opens',async()=>url(p)==='map-matrix'||url(p));
  await p.click('[data-view="network"]'); await p.waitForTimeout(500); await ok('back to network',async()=>url(p)==='map'&&!(await p.evaluate(()=>document.getElementById('map-stage').hidden))||url(p));
  await ctx.close();
  // motion: turns by itself at rest; not with reduced motion
  for(const rm of ['no-preference','reduce']){ ctx=await b.newContext({viewport:{width:1200,height:800},reducedMotion:rm}); p=await ctx.newPage(); watch(p,'motion');
    // three names are watched: one that happens to sit on the turning axis, or to be moving along the line of sight, hardly moves on the screen
    const keys=['e:sec','e:world-liberty-financial','e:trump-media'], at=async()=>{ const o=[]; for(const k of keys) o.push(await probe(p,k)); return o; };
    await p.goto('http://localhost:'+port+'/#map'); await p.waitForTimeout(2600); const a=await at(); await p.waitForTimeout(1500); const c=await at();
    const moved=Math.max(...a.map((q,i)=>q&&c[i]?Math.hypot(q.x-c[i].x,q.y-c[i].y):0))>1.5; await ok(rm==='reduce'?'reduced motion: no turning by itself':'turns slowly by itself at rest',async()=>(rm==='reduce'?!moved:moved)||JSON.stringify([a,c])); await ctx.close(); }
  // phone
  ctx=await b.newContext({viewport:{width:400,height:860},hasTouch:true,isMobile:true}); await ctx.addInitScript(()=>{window.__STILL__=true;}); p=await ctx.newPage(); watch(p,'phone');
  await p.goto('http://localhost:'+port+'/#map'); await p.waitForTimeout(1500);
  t=await probe(p,'e:donald-trump'); await p.touchscreen.tap(t.x,t.y); await p.waitForTimeout(700);
  await ok('phone: tap selects, bottom sheet opens',async()=>url(p)==='map-donald-trump'&&/Donald Trump/.test(await txt(p,'#panel h2'))||url(p));
  await ok('phone: no horizontal overflow',async()=>!(await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1))||'overflow');
  await p.click('#panel [data-act="close"]'); await p.waitForTimeout(300);
  await p.click('#topic-chips [data-topic="gulf-money"]'); await p.waitForTimeout(500);
  await ok('phone: topic chip',async()=>url(p)==='map-topic-gulf-money'||url(p));
  await ctx.close(); await b.close(); s.close();
  console.log(log.join('\n')); console.log(errors.length?('ISSUES:\n'+errors.join('\n')):'no console errors');
})();
