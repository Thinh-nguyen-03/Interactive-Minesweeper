// Extra matrix states. Usage: node cook/harness/mx.js [round]  -> cook/stills/rNN/mx-*.png
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');const serve=require('./serve.js');
const round=(process.argv[2]||'04').padStart(2,'0');
const out=path.resolve(__dirname,'..','stills','r'+round);fs.mkdirSync(out,{recursive:true});
(async()=>{const port=8950+Math.floor(Math.random()*40);const s=await serve(port);const b=await chromium.launch();const errs=[];
 async function shot(name,hash,vp,scheme,fn,dsf){const ctx=await b.newContext({viewport:vp,deviceScaleFactor:dsf||1,colorScheme:scheme});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(name+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(name+': '+m.text());});
  await p.goto('http://localhost:'+port+'/'+hash,{waitUntil:'load'});await p.waitForTimeout(2000);if(fn)await fn(p);await p.waitForTimeout(400);
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);if(ov)errs.push(name+': overflow');
  await p.screenshot({path:path.join(out,'mx-'+name+'.png')});await ctx.close();}
 // the centre of a cell in page coordinates: the first pair at or above a link count, away from the first row and column
 const cell=(min)=>{const S=window.TCMMatrix.state,D=S.data,L=S.L,r=document.getElementById('mx-canvas').getBoundingClientRect();
  for(let i=1;i<D.names.length;i++)for(let j=i+1;j<D.names.length;j++)if(D.C[i][j]>=min)return{x:r.left+L.x0+L.C.pos[j]+L.cw/2,y:r.top+L.y0+L.R.pos[i]+L.ch/2};return null;};
 const tcell=()=>{const S=window.TCMMatrix.state,L=S.L,r=document.getElementById('mx-canvas').getBoundingClientRect();return{x:r.left+L.x0+L.C.pos[1]+L.cw/2,y:r.top+L.y0+L.R.pos[3]+L.ch/2};};
 const D={width:1440,height:900},P={width:400,height:860};
 await shot('default','#map-matrix',D,'light');
 await shot('hover','#map-matrix',D,'light',async p=>{const c=await p.evaluate(cell,3);await p.mouse.move(c.x,c.y);});
 await shot('cell','#map-matrix',D,'light',async p=>{const c=await p.evaluate(cell,5);await p.mouse.click(c.x,c.y);await p.mouse.move(c.x+140,c.y+90);});
 await shot('name','#map-matrix',D,'light',async p=>{const r=await p.$$('.mx-row');await r[2].click();await p.mouse.move(700,870);});
 await shot('filter','#map-matrix',D,'light',async p=>{await p.fill('#mx-filter','trump');});
 await shot('groups','#map-matrix',D,'light',async p=>{await p.click('.mx-gt[data-g="1"]');await p.click('.mx-gt[data-g="2"]');});
 await shot('topics','#map-matrix-topics',D,'light');
 await shot('topics-cell','#map-matrix-topics',D,'light',async p=>{const c=await p.evaluate(tcell);await p.mouse.click(c.x,c.y);});
 await shot('connected','#map-matrix',D,'light',async p=>{await p.click('[data-mxo="connected"]');});
 await shot('alpha','#map-matrix',D,'light',async p=>{await p.click('[data-mxo="alpha"]');});
 await shot('dark','#map-matrix',D,'dark');
 await shot('2x','#map-matrix',D,'light',null,2);
 await shot('mid','#map-matrix',{width:1100,height:800},'light');
 await shot('tall','#map-matrix',{width:1680,height:1100},'light');
 await shot('phone','#map-matrix',P,'light');
 await shot('phone-sel','#map-matrix',P,'light',async p=>{const x=await p.$('.mxp-list button');if(x)await x.click();});
 await shot('phone-topics','#map-matrix-topics',P,'light');
 await b.close();s.close();console.log(errs.length?errs.join('\n'):'ok');})();
