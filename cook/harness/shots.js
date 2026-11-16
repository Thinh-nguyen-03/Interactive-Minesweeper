// Still renderer for the Cook Loop. Usage: node cook/harness/shots.js <round, e.g. 01>
// Writes cook/stills/rNN/S01.png ... using fixed viewport presets (see cook/SHOTS.md).
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const serve=require('./serve.js');
const round=(process.argv[2]||'00').padStart(2,'0');
const out=path.resolve(__dirname,'..','stills','r'+round); fs.mkdirSync(out,{recursive:true});
const D={width:1440,height:900}, P={width:400,height:860};
const SHOTS=[
 {id:'S01',hash:'#home',vp:D,scheme:'light'},
 {id:'S02',hash:'#home',vp:D,scheme:'light',scrollTo:'checks'},
 {id:'S03',hash:'#C06',vp:D,scheme:'light'},
 {id:'S04',hash:'#name-world-liberty-financial',vp:D,scheme:'light'},
 {id:'S05',hash:'#map',vp:D,scheme:'light'},
 {id:'S06',hash:'#map-jared-kushner',vp:D,scheme:'light'},
 {id:'S07',hash:'#map',vp:D,scheme:'dark'},
 {id:'S08',hash:'#home',vp:P,scheme:'light'},
 {id:'S09',hash:'#map',vp:P,scheme:'light'},
 {id:'S10',hash:'#C06',vp:P,scheme:'light'},
 {id:'S11',hash:'#map-matrix',vp:D,scheme:'light'},
 {id:'S12',hash:'#map-topic-gulf-money',vp:D,scheme:'light'},
 {id:'S13',hash:'#balance',vp:D,scheme:'light'},
 {id:'S14',hash:'#balance',vp:D,scheme:'dark'},
 {id:'S15',hash:'#balance',vp:P,scheme:'light'},
 {id:'S16',hash:'#C101',vp:D,scheme:'light'},
 {id:'S17',hash:'#C102',vp:P,scheme:'light'},
];
(async()=>{
  const port=8700+Math.floor(Math.random()*200); const s=await serve(port);
  const b=await chromium.launch(); const errors=[];
  for(const sh of SHOTS){
    const ctx=await b.newContext({viewport:sh.vp,deviceScaleFactor:1,colorScheme:sh.scheme});
    await ctx.addInitScript(()=>{window.__STILL__=true;});   // the globe starts from its fixed view and does not turn by itself
    const p=await ctx.newPage();
    p.on('console',m=>{if(m.type()==='error')errors.push(sh.id+': '+m.text());});
    p.on('pageerror',e=>errors.push(sh.id+': '+e.message));
    await p.goto('http://localhost:'+port+'/'+sh.hash,{waitUntil:'load'});
    await p.waitForTimeout(2500);
    if(sh.scrollTo){ await p.evaluate(id=>{const e=document.getElementById(id)||document.querySelector('[data-section="'+id+'"]'); if(e) e.scrollIntoView({block:'start'}); else window.scrollTo(0,900);},sh.scrollTo); await p.waitForTimeout(600); }
    const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
    if(ov) errors.push(sh.id+': horizontal overflow');
    await p.screenshot({path:path.join(out,sh.id+'.png')});
    await ctx.close();
  }
  await b.close(); s.close();
  console.log('wrote',SHOTS.length,'stills to',out); console.log(errors.length?('ISSUES:\n'+errors.join('\n')):'no console errors, no overflow');
})();
