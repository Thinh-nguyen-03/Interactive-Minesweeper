// Extra matrix states. Usage: node cook/harness/mx.js  -> cook/stills/r03/mx-*.png
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');const serve=require('./serve.js');
const out=path.resolve(__dirname,'..','stills','r03');fs.mkdirSync(out,{recursive:true});
(async()=>{const port=8950+Math.floor(Math.random()*40);const s=await serve(port);const b=await chromium.launch();const errs=[];
 async function shot(name,hash,vp,scheme,fn){const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,colorScheme:scheme});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(name+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(name+': '+m.text());});
  await p.goto('http://localhost:'+port+'/'+hash,{waitUntil:'load'});await p.waitForTimeout(2000);if(fn)await fn(p);await p.waitForTimeout(400);
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);if(ov)errs.push(name+': overflow');
  await p.screenshot({path:path.join(out,'mx-'+name+'.png')});await ctx.close();}
 const D={width:1440,height:900},P={width:400,height:860};
 await shot('default','#map-matrix',D,'light');
 await shot('cell','#map-matrix',D,'light',async p=>{const td=await p.$('td.c5, td.c4, td.c3');await td.click();await p.mouse.move(600,520);});
 await shot('scrolled','#map-matrix',D,'light',async p=>{await p.evaluate(()=>{document.getElementById('mx-scroll').scrollTop=9999;});});
 await shot('topics','#map-matrix-topics',D,'light');
 await shot('connected','#map-matrix',D,'light',async p=>{await p.click('[data-mxo="connected"]');});
 await shot('dark','#map-matrix',D,'dark',async p=>{const td=await p.$('td.c3, td.c2');await td.hover();});
 await shot('phone','#map-matrix',P,'light');
 await shot('phone-sel','#map-matrix',P,'light',async p=>{const x=await p.$('.mxf-list button');if(x)await x.click();});
 await shot('mid','#map-matrix',{width:1100,height:800},'light');
 await b.close();s.close();console.log(errs.length?errs.join('\n'):'ok');})();
