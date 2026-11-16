// Globe states for the Cook Loop, in BOTH themes. Usage: node cook/harness/globe.js <round> [only] [themes]
//   only:   comma list of rest,sel,topic,phone,perf (default all)      themes: light,dark (default both)
// Writes cook/stills/rNN/G-<theme>-*.png: rest, hover, kind colours, mentions, everything, zoomed, turned, selected, link hover,
// isolate, trace, topic, the hub selected, phone (rest, key, selected, topic); prints what the globe measures about itself
// (size, names written, spacing, ink on the canvas) and the frame time while it turns.
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const serve=require('./serve.js');
const round=(process.argv[2]||'00').padStart(2,'0'), only=process.argv[3]&&process.argv[3]!=='all'?process.argv[3]:'', themes=(process.argv[4]||'light,dark').split(',');
const out=path.resolve(__dirname,'..','stills','r'+round); fs.mkdirSync(out,{recursive:true});
(async()=>{
  const port=8300+Math.floor(Math.random()*300); const s=await serve(port); const b=await chromium.launch(); const errors=[], log=[];
  async function page(vp,scheme,hash,still=true,touch=false){
    const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,colorScheme:scheme||'light',hasTouch:touch});
    if(still) await ctx.addInitScript(()=>{window.__STILL__=true;});
    if(process.env.LP) await ctx.addInitScript(lp=>{window.__LP=JSON.parse(lp);},process.env.LP);   // layout measures under test
    const p=await ctx.newPage();
    p.on('console',m=>{if(m.type()==='error')errors.push(scheme+' '+hash+': '+m.text());}); p.on('pageerror',e=>errors.push(scheme+' '+hash+': '+e.message));
    await p.goto('http://localhost:'+port+'/'+hash,{waitUntil:'load'}); await p.waitForTimeout(1800);
    return p;
  }
  const probe=(p,k)=>p.evaluate(k=>window.__mapProbe(k),k);
  const D={width:1440,height:900}, P={width:400,height:860};
  const want=n=>!only||only.split(',').includes(n);
  const stat=async(p,name)=>{ const m=await probe(p,'stats'); if(m) log.push('  '+name+': '+Object.keys(m).map(k=>k+' '+m[k]).join(', ')); };
  for(const th of themes){
    const shot=async(p,name)=>{ const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1); if(ov) errors.push(th+' '+name+': horizontal overflow'); await p.screenshot({path:path.join(out,'G-'+th+'-'+name+'.png')}); };
    let p; log.push('== '+th);
    if(only==='quick'){ p=await page(D,th,'#map'); await shot(p,'rest'); await stat(p,'rest'); await p.context().close(); p=await page(P,th,'#map',true,true); await shot(p,'phone'); await stat(p,'phone'); await p.context().close(); continue; }   // layout trials
    if(want('rest')){ p=await page(D,th,'#map'); await shot(p,'rest'); await stat(p,'rest');
      const pos=await probe(p,'e:world-liberty-financial'); await p.mouse.move(pos.x,pos.y); await p.waitForTimeout(400); await shot(p,'hover'); log.push('  hover tip: '+await p.evaluate(()=>document.getElementById('tip').textContent));
      await p.mouse.move(700,860); await p.waitForTimeout(200);
      await p.click('#color-sw [data-color="kind"]'); await p.waitForTimeout(400); await shot(p,'kind'); await p.click('#color-sw [data-color="topic"]');
      const mb=await p.$('#legend [data-act="mentions"]'); if(mb&&await mb.isVisible()){ await mb.click(); await p.waitForTimeout(400); await shot(p,'mentions'); await p.click('#legend [data-act="mentions"]'); } else log.push('  mentions toggle not reachable');
      const kk=await p.$('#legend [data-act="key"]'); if(kk){ await kk.click(); await p.waitForTimeout(400); await shot(p,'key'); await stat(p,'key open'); await p.click('#legend [data-act="key"]'); await p.waitForTimeout(300); }
      await p.click('#detail-sw [data-level="2"]'); await p.waitForTimeout(400); await shot(p,'everything'); await p.click('#detail-sw [data-level="0"]');
      for(let i=0;i<3;i++) await p.click('#zoom-in'); await p.waitForTimeout(500); await shot(p,'zoomed'); await stat(p,'zoomed');
      await p.click('#zoom-fit'); await p.waitForTimeout(300);
      await p.mouse.move(500,450); await p.mouse.down(); await p.mouse.move(700,380,{steps:8}); await p.mouse.up(); await p.waitForTimeout(600); await shot(p,'turned'); await stat(p,'turned');
      await p.mouse.move(500,450); await p.mouse.down(); await p.mouse.move(820,520,{steps:8}); await p.mouse.up(); await p.waitForTimeout(600); await shot(p,'turned2'); await stat(p,'turned2');
      await p.mouse.move(600,300); await p.mouse.down(); await p.mouse.move(520,620,{steps:8}); await p.mouse.up(); await p.waitForTimeout(600); await shot(p,'turned3'); await stat(p,'turned3');
      await p.context().close(); }
    if(want('sel')){ p=await page(D,th,'#map-jared-kushner'); await shot(p,'selected'); await stat(p,'selected');
      const m=await probe(p,'litlink'); if(m){ await p.mouse.move(m.x,m.y); await p.waitForTimeout(400); log.push('  link tip: '+await p.evaluate(()=>document.getElementById('tip').hidden?'(none)':document.getElementById('tip').textContent)); await shot(p,'linkhover'); }
      await p.mouse.move(700,870);
      await p.click('[data-act="iso"]'); await p.waitForTimeout(600); await shot(p,'isolate'); await p.click('[data-act="iso-clear"]'); await p.waitForTimeout(300);
      await p.click('[data-act="path"]'); await p.waitForTimeout(300);
      await p.fill('#search','Qatar Investment'); await p.waitForTimeout(400); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForTimeout(900);
      log.push('  path: url='+p.url().split('#')[1]+' panel='+(await p.evaluate(()=>document.querySelector('#panel h2').textContent))+' steps='+(await p.locator('#panel .steps li').count()));
      await shot(p,'trace'); await p.context().close(); }
    if(want('topic')){ p=await page(D,th,'#map-topic-gulf-money'); await shot(p,'topic'); await stat(p,'topic'); await p.context().close();
      p=await page(D,th,'#map-donald-trump'); await shot(p,'trump'); await stat(p,'trump'); await p.context().close(); }
    if(want('phone')){ p=await page(P,th,'#map',true,true); await shot(p,'phone'); await stat(p,'phone');
      const kb=await p.$('#key-toggle'); if(kb&&await kb.isVisible()){ await kb.click(); await p.waitForTimeout(300); await shot(p,'phone-key'); await kb.click(); }
      await p.context().close(); p=await page(P,th,'#map-jared-kushner',true,true); await shot(p,'phone-selected'); await p.context().close();
      p=await page(P,th,'#map-topic-gulf-money',true,true); await shot(p,'phone-topic'); await p.context().close(); }
    if(want('perf')){ for(const [vp,name] of [[D,'desktop'],[P,'phone']]){ p=await page(vp,th,'#map',false);
        await p.evaluate(()=>window.__mapProbe('spin')); await p.waitForTimeout(600);
        const r=await p.evaluate(()=>new Promise(res=>{ const t=[]; let last=performance.now(); function f(now){ t.push(now-last); last=now; if(t.length<180) requestAnimationFrame(f); else { t.sort((a,b)=>a-b); res({median:t[90],p95:t[171],draw:window.__mapProbe('ms')}); } } requestAnimationFrame(f); }));
        log.push('  perf '+name+': frame median '+r.median.toFixed(1)+' ms, p95 '+r.p95.toFixed(1)+' ms, draw '+r.draw.ms.toFixed(2)+' ms (frames drawn '+r.draw.frames+')');
        await p.mouse.move(vp.width*0.35,400); await p.mouse.down(); for(let i=0;i<60;i++){ await p.mouse.move(vp.width*0.35+i*3,400+i); } await p.mouse.up(); await p.waitForTimeout(300);
        const d=await probe(p,'ms'); log.push('  perf '+name+' after drag: draw '+d.ms.toFixed(2)+' ms');
        await p.context().close(); } }
  }
  await b.close(); s.close();
  console.log(log.join('\n')); console.log(errors.length?('ISSUES:\n'+errors.join('\n')):'no console errors, no overflow');
})();
