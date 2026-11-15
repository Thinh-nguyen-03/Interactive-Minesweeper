// Quick renderer for the map shots only. Usage: node cook/harness/mapshots.js <round> [ids...]
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const serve=require('./serve.js');
const round=(process.argv[2]||'00').padStart(2,'0'), only=process.argv.slice(3);
const out=path.resolve(__dirname,'..','stills','r'+round); fs.mkdirSync(out,{recursive:true});
const D={width:1440,height:900}, P={width:400,height:860};
const SHOTS=[
 {id:'S05',hash:'#map',vp:D,scheme:'light'},{id:'S06',hash:'#map-jared-kushner',vp:D,scheme:'light'},{id:'S07',hash:'#map',vp:D,scheme:'dark'},
 {id:'S09',hash:'#map',vp:P,scheme:'light'},{id:'S11',hash:'#map-matrix',vp:D,scheme:'light'},{id:'S12',hash:'#map-topic-gulf-money',vp:D,scheme:'light'},
 {id:'X01',hash:'#map-matrix',vp:D,scheme:'dark'},{id:'X02',hash:'#map-matrix-topics',vp:D,scheme:'light'},{id:'X03',hash:'#map-matrix',vp:P,scheme:'light'},
 {id:'X04',hash:'#map-list',vp:P,scheme:'light'},{id:'X05',hash:'#map-jared-kushner',vp:P,scheme:'light'},{id:'X06',hash:'#map-C37',vp:D,scheme:'dark'},
 {id:'X07',hash:'#map',vp:D,scheme:'light',level:1},{id:'X08',hash:'#map',vp:D,scheme:'light',level:2},{id:'X09',hash:'#map',vp:D,scheme:'light',hover:[534,462]},
 {id:'X10',hash:'#map-topic-gulf-money',vp:P,scheme:'light'},
].filter(s=>!only.length||only.includes(s.id));
(async()=>{
  const port=8900+Math.floor(Math.random()*90); const s=await serve(port);
  const b=await chromium.launch(); const errors=[];
  for(const sh of SHOTS){
    const ctx=await b.newContext({viewport:sh.vp,deviceScaleFactor:1,colorScheme:sh.scheme});
    const p=await ctx.newPage();
    p.on('console',m=>{if(m.type()==='error')errors.push(sh.id+': '+m.text());});
    p.on('pageerror',e=>errors.push(sh.id+': '+e.message));
    await p.goto('http://localhost:'+port+'/'+sh.hash,{waitUntil:'load'});
    await p.waitForTimeout(1800);
    if(sh.level!=null){ await p.click('[data-level="'+sh.level+'"]'); await p.waitForTimeout(500); }
    if(sh.hover){ await p.mouse.move(sh.hover[0],sh.hover[1]+110); await p.waitForTimeout(400); }
    const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
    if(ov) errors.push(sh.id+': horizontal overflow');
    await p.screenshot({path:path.join(out,sh.id+'.png')});
    await ctx.close();
  }
  await b.close(); s.close();
  console.log(errors.length?('ISSUES:\n'+errors.join('\n')):'ok');
})();
