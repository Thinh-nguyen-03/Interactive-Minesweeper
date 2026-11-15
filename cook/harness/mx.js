// Matrix states in both themes. Usage: node cook/harness/mx.js [round]  -> cook/stills/rNN/mx-<state>-<light|dark>.png
// Also audits the contrast of every text node inside #matrix (DOM parts) and of the canvas palette, and reports anything under 4.5:1.
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');const serve=require('./serve.js');
const round=(process.argv[2]||'05').padStart(2,'0');
const out=path.resolve(__dirname,'..','stills','r'+round);fs.mkdirSync(out,{recursive:true});
// runs in the page: contrast of visible text in #matrix against the nearest opaque background
const audit=()=>{const lin=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);},lum=c=>.2126*lin(c[0])+.7152*lin(c[1])+.0722*lin(c[2]);
 const cv=document.createElement('canvas').getContext('2d',{willReadFrequently:true});
 const px=s=>{cv.clearRect(0,0,1,1);cv.fillStyle=s;cv.fillRect(0,0,1,1);const d=cv.getImageData(0,0,1,1).data;return[d[0],d[1],d[2],d[3]/255];};
 const bgOf=el=>{let stack=[];for(let e=el;e;e=e.parentElement){const b=px(getComputedStyle(e).backgroundColor);if(b[3]>0)stack.push(b);if(b[3]>=1)break;}let c=[255,255,255];for(let i=stack.length-1;i>=0;i--){const b=stack[i];c=[0,1,2].map(k=>c[k]+(b[k]-c[k])*b[3]);}return c;};
 const bad=[],seen={};const w=document.createTreeWalker(document.getElementById('matrix'),NodeFilter.SHOW_TEXT);
 for(let n=w.nextNode();n;n=w.nextNode()){const t=n.textContent.trim(),el=n.parentElement;if(!t||!el||el.closest('.sr'))continue;const r=el.getBoundingClientRect();if(!r.width||!r.height)continue;
  const cs=getComputedStyle(el);if(cs.visibility==='hidden')continue;let op=1;for(let e=el;e;e=e.parentElement)op*=+getComputedStyle(e).opacity;
  const bg=bgOf(el),f=px(cs.color),fg=[0,1,2].map(k=>bg[k]+(f[k]-bg[k])*f[3]*op),a=lum(fg),b=lum(bg),cr=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);
  const key=el.className+'|'+cs.color;if(cr<4.5&&!seen[key]){seen[key]=1;bad.push(cr.toFixed(2)+' '+(el.className||el.tagName)+' "'+t.slice(0,24)+'"');}}
 const lumHex=s=>lum(px(s)),P=window.TCMMatrix.palette?window.TCMMatrix.palette():null;
 if(P){const cr=(x,y)=>{const a=lumHex(x),b=lumHex(y);return(Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
  [['ink',P.ink,P.bg],['muted',P.ink2,P.bg],['sel',P.sel,P.bg],['ink on field',P.ink,P.field],['muted on field',P.ink2,P.field]].forEach(x=>{const v=cr(x[1],x[2]);if(v<4.5)bad.push(v.toFixed(2)+' canvas '+x[0]);});
  for(let q=1;q<=5;q++){const v=cr(P.rtxt[q],P.ramp[q]);if(v<4.5)bad.push(v.toFixed(2)+' canvas number on ramp step '+q);}
  [['unverified mark',P.unv,P.field],['bar',P.bar,P.bg],['ramp step 1',P.ramp[1],P.field]].forEach(x=>{const v=cr(x[1],x[2]);if(v<(x[0]==='ramp step 1'?1.5:3))bad.push(v.toFixed(2)+' canvas graphic '+x[0]);});}
 return bad;};
(async()=>{const port=8950+Math.floor(Math.random()*40);const s=await serve(port);const b=await chromium.launch();const errs=[];
 async function shot(name,hash,vp,scheme,fn,dsf){const ctx=await b.newContext({viewport:vp,deviceScaleFactor:dsf||1,colorScheme:scheme});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(name+': '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push(name+': '+m.text());});
  await p.goto('http://localhost:'+port+'/'+hash,{waitUntil:'load'});await p.waitForTimeout(2000);if(fn)await fn(p);await p.waitForTimeout(400);
  const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);if(ov)errs.push(name+': overflow');
  (await p.evaluate(audit)).forEach(x=>errs.push(name+': contrast '+x));
  await p.screenshot({path:path.join(out,'mx-'+name+'.png')});await ctx.close();}
 // the centre of a cell in page coordinates: the first pair at or above a link count, away from the first row and column
 const cell=(min)=>{const S=window.TCMMatrix.state,D=S.data,L=S.L,r=document.getElementById('mx-canvas').getBoundingClientRect();
  for(let i=1;i<D.names.length;i++)for(let j=i+1;j<D.names.length;j++)if(D.C[i][j]>=min)return{x:r.left+L.x0+L.C.pos[j]+L.cw/2,y:r.top+L.y0+L.R.pos[i]+L.ch/2};return null;};
 const tcell=()=>{const S=window.TCMMatrix.state,L=S.L,r=document.getElementById('mx-canvas').getBoundingClientRect();return{x:r.left+L.x0+L.C.pos[1]+L.cw/2,y:r.top+L.y0+L.R.pos[3]+L.ch/2};};
 const D={width:1440,height:900},P={width:400,height:860};
 for(const th of ['light','dark']){const t='-'+th;
  await shot('default'+t,'#map-matrix',D,th);
  await shot('hover'+t,'#map-matrix',D,th,async p=>{const c=await p.evaluate(cell,3);await p.mouse.move(c.x,c.y);});
  await shot('cell'+t,'#map-matrix',D,th,async p=>{const c=await p.evaluate(cell,5);await p.mouse.click(c.x,c.y);await p.mouse.move(c.x+140,c.y+90);});
  await shot('name'+t,'#map-matrix',D,th,async p=>{const r=await p.$$('.mx-row');await r[2].click();await p.mouse.move(700,870);});
  await shot('topics'+t,'#map-matrix-topics',D,th);
  await shot('topics-cell'+t,'#map-matrix-topics',D,th,async p=>{const c=await p.evaluate(tcell);await p.mouse.click(c.x,c.y);});
  await shot('phone'+t,'#map-matrix',P,th);
  await shot('phone-sel'+t,'#map-matrix',P,th,async p=>{const x=await p.$('.mxp-list button');if(x)await x.click();});
  await shot('phone-topics'+t,'#map-matrix-topics',P,th);
  await shot('phone-order'+t,'#map-matrix',P,th,async p=>{await p.click('.mxp-ord [data-mxo="alpha"]');});
  await shot('filter'+t,'#map-matrix',D,th,async p=>{await p.fill('#mx-filter','trump');});
  await shot('mid'+t,'#map-matrix',{width:1100,height:800},th);
 }
 // the theme switch itself: start light, press Dark, and the heatmap must be redrawn dark (and back)
 await shot('switch-to-dark','#map-matrix',D,'light',async p=>{await p.click('[data-theme-opt="dark"]');});
 await shot('switch-to-light','#map-matrix',D,'dark',async p=>{await p.click('[data-theme-opt="light"]');});
 await shot('groups-light','#map-matrix',D,'light',async p=>{await p.click('.mx-gt[data-g="1"]');await p.click('.mx-gt[data-g="2"]');});
 await shot('connected-light','#map-matrix',D,'light',async p=>{await p.click('[data-mxo="connected"]');});
 await shot('alpha-dark','#map-matrix',D,'dark',async p=>{await p.click('[data-mxo="alpha"]');});
 await shot('2x-light','#map-matrix',D,'light',null,2);
 await shot('tall-light','#map-matrix',{width:1680,height:1100},'light');
 // Show on Network must still hand over to the globe
 {const ctx=await b.newContext({viewport:D,colorScheme:'light'});const p=await ctx.newPage();p.on('pageerror',e=>errs.push('show: '+e.message));
  await p.goto('http://localhost:'+port+'/#map-matrix',{waitUntil:'load'});await p.waitForTimeout(2000);const c=await p.evaluate(cell,5);await p.mouse.click(c.x,c.y);await p.click('.mxd-btn[data-act="show"]');await p.waitForTimeout(900);
  const ok=await p.evaluate(()=>document.getElementById('matrix').hidden&&!document.getElementById('map-stage').hidden);if(!ok)errs.push('show: Show on Network did not open the network');
  await p.screenshot({path:path.join(out,'mx-show-on-network.png')});await ctx.close();}
 await b.close();s.close();console.log(errs.length?errs.join('\n'):'ok');})();
