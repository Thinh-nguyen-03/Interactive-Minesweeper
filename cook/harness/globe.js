// Globe states for the Cook Loop. Usage: node cook/harness/globe.js <round> [only]
// Writes cook/stills/rNN/G-*.png: rest, hover, selected, topic, trace, zoomed, kind colours, link hover, isolate, phone; then measures frame time while the globe turns.
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const serve=require('./serve.js');
const round=(process.argv[2]||'00').padStart(2,'0'), only=process.argv[3];
const out=path.resolve(__dirname,'..','stills','r'+round); fs.mkdirSync(out,{recursive:true});
(async()=>{
  const port=8300+Math.floor(Math.random()*300); const s=await serve(port); const b=await chromium.launch(); const errors=[], log=[];
  async function page(vp,scheme,hash,still=true,touch=false){
    const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,colorScheme:scheme||'light',hasTouch:touch});
    if(still) await ctx.addInitScript(()=>{window.__STILL__=true;});
    const p=await ctx.newPage();
    p.on('console',m=>{if(m.type()==='error')errors.push(hash+': '+m.text());}); p.on('pageerror',e=>errors.push(hash+': '+e.message));
    await p.goto('http://localhost:'+port+'/'+hash,{waitUntil:'load'}); await p.waitForTimeout(1800);
    return p;
  }
  const shot=async(p,name)=>{ const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1); if(ov) errors.push(name+': horizontal overflow'); await p.screenshot({path:path.join(out,'G-'+name+'.png')}); };
  const probe=(p,k)=>p.evaluate(k=>window.__mapProbe(k),k);
  const D={width:1440,height:900}, P={width:400,height:860};
  const want=n=>!only||only.split(',').includes(n);
  let p;
  if(want('rest')){ p=await page(D,'light','#map'); await shot(p,'rest'); 
    const pos=await probe(p,'e:world-liberty-financial'); await p.mouse.move(pos.x,pos.y); await p.waitForTimeout(400); await shot(p,'hover'); log.push('hover tip: '+await p.evaluate(()=>document.getElementById('tip').textContent));
    await p.mouse.move(700,860); await p.waitForTimeout(200);
    await p.click('#color-sw [data-color="kind"]'); await p.waitForTimeout(400); await shot(p,'kind'); await p.click('#color-sw [data-color="topic"]');
    await p.click('#detail-sw [data-level="2"]'); await p.waitForTimeout(400); await shot(p,'everything'); await p.click('#detail-sw [data-level="0"]');
    for(let i=0;i<3;i++) await p.click('#zoom-in'); await p.waitForTimeout(500); await shot(p,'zoomed');
    await p.click('#zoom-fit'); await p.waitForTimeout(300);
    // drag to turn
    await p.mouse.move(500,450); await p.mouse.down(); await p.mouse.move(700,380,{steps:8}); await p.mouse.up(); await p.waitForTimeout(600); await shot(p,'turned');
    await p.context().close(); }
  if(want('sel')){ p=await page(D,'light','#map-jared-kushner'); await shot(p,'selected');
    // hover a lit link: halfway between the selection and a neighbour
    const m=await probe(p,'litlink'); if(m){ await p.mouse.move(m.x,m.y); await p.waitForTimeout(400); log.push('link tip: '+await p.evaluate(()=>document.getElementById('tip').hidden?'(none)':document.getElementById('tip').textContent)); await shot(p,'linkhover'); }
    await p.mouse.move(700,870);
    await p.click('[data-act="iso"]'); await p.waitForTimeout(600); await shot(p,'isolate'); await p.click('[data-act="iso-clear"]'); await p.waitForTimeout(300);
    await p.click('[data-act="path"]'); await p.waitForTimeout(300);
    await p.fill('#search','Qatar Investment'); await p.waitForTimeout(400); await p.keyboard.press('ArrowDown'); await p.keyboard.press('Enter'); await p.waitForTimeout(900);
    log.push('path: url='+p.url().split('#')[1]+' panel='+(await p.evaluate(()=>document.querySelector('#panel h2').textContent))+' steps='+(await p.locator('#panel .steps li').count()));
    await shot(p,'trace'); await p.context().close(); }
  if(want('topic')){ p=await page(D,'light','#map-topic-gulf-money'); await shot(p,'topic'); await p.context().close();
    p=await page(D,'dark','#map-donald-trump'); await shot(p,'trump-dark'); await p.context().close(); }
  if(want('phone')){ p=await page(P,'light','#map',true,true); await shot(p,'phone');
    await p.click('#key-toggle'); await p.waitForTimeout(300); await shot(p,'phone-key'); await p.click('#key-toggle');
    await p.context().close(); p=await page(P,'light','#map-jared-kushner',true,true); await shot(p,'phone-selected'); await p.context().close();
    p=await page(P,'light','#map-topic-gulf-money',true,true); await shot(p,'phone-topic'); await p.context().close(); }
  if(want('perf')){ for(const [vp,name] of [[D,'desktop'],[P,'phone']]){ p=await page(vp,'light','#map',false);
      await p.evaluate(()=>window.__mapProbe('spin')); await p.waitForTimeout(600);
      const r=await p.evaluate(()=>new Promise(res=>{ const t=[]; let last=performance.now(); function f(now){ t.push(now-last); last=now; if(t.length<180) requestAnimationFrame(f); else { t.sort((a,b)=>a-b); res({median:t[90],p95:t[171],draw:window.__mapProbe('ms')}); } } requestAnimationFrame(f); }));
      log.push('perf '+name+': frame median '+r.median.toFixed(1)+' ms, p95 '+r.p95.toFixed(1)+' ms, draw '+r.draw.ms.toFixed(2)+' ms (frames drawn '+r.draw.frames+')');
      // dragging: 60 pointer moves
      await p.mouse.move(vp.width*0.35,400); await p.mouse.down(); for(let i=0;i<60;i++){ await p.mouse.move(vp.width*0.35+i*3,400+i); } await p.mouse.up(); await p.waitForTimeout(300);
      const d=await probe(p,'ms'); log.push('perf '+name+' after drag: draw '+d.ms.toFixed(2)+' ms');
      await p.context().close(); } }
  await b.close(); s.close();
  console.log(log.join('\n')); console.log(errors.length?('ISSUES:\n'+errors.join('\n')):'no console errors, no overflow');
})();
