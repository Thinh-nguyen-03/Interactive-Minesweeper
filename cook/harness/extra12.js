// Extra stills for round 12 (the balance sheet and the new checks). Usage: node cook/harness/extra12.js [id-prefix]
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const serve=require('./serve.js');
const out=path.resolve(__dirname,'..','stills','r12'); fs.mkdirSync(out,{recursive:true});
const D={width:1440,height:900}, P={width:400,height:860};
const SHOTS=[
 {id:'B01-balance-light',hash:'#balance',vp:D,scheme:'light',full:1},
 {id:'B02-balance-dark',hash:'#balance',vp:D,scheme:'dark',full:1},
 {id:'B03-balance-phone',hash:'#balance',vp:P,scheme:'light',full:1},
 {id:'B04-balance-phone-dark',hash:'#balance',vp:P,scheme:'dark',full:1,clipH:3200},
 {id:'B05-C101-light',hash:'#C101',vp:D,scheme:'light',full:1,clipH:5200,open:1},
 {id:'B06-C101-phone',hash:'#C101',vp:P,scheme:'light',full:1,clipH:4200},
 {id:'B07-C95-light',hash:'#C95',vp:D,scheme:'light'},
 {id:'B08-home-leads',hash:'#home',vp:D,scheme:'light',full:1,clipH:1500},
 {id:'B09-C103-dark',hash:'#C103',vp:D,scheme:'dark',full:1,clipH:4200},
 {id:'B10-C102-phone',hash:'#C102',vp:P,scheme:'dark',full:1,clipH:3600},
 {id:'B11-home-phone',hash:'#home',vp:P,scheme:'light'},
];
const only=process.argv[2]&&process.argv[2]!=='all'?process.argv[2]:'';
(async()=>{
  const port=8900+Math.floor(Math.random()*90); const s=await serve(port);
  const b=await chromium.launch(); const errors=[];
  for(const sh of SHOTS){ if(only&&sh.id.indexOf(only)<0) continue;
    const ctx=await b.newContext({viewport:sh.vp,deviceScaleFactor:1,colorScheme:sh.scheme});
    await ctx.addInitScript(()=>{window.__STILL__=true;});
    const p=await ctx.newPage();
    p.on('console',m=>{if(m.type()==='error')errors.push(sh.id+': '+m.text());});
    p.on('pageerror',e=>errors.push(sh.id+': '+e.message));
    await p.goto('http://localhost:'+port+'/'+sh.hash,{waitUntil:'load'});
    await p.waitForTimeout(2200);
    if(sh.open) await p.evaluate(()=>{ document.querySelectorAll('[data-unfold]').forEach(x=>x.click()); });
    await p.waitForTimeout(300);
    const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
    if(ov) errors.push(sh.id+': horizontal overflow');
    const o={path:path.join(out,sh.id+'.png')};
    if(sh.full){ o.fullPage=true; if(sh.clipH){ const h=await p.evaluate(()=>document.documentElement.scrollHeight); o.clip={x:0,y:0,width:sh.vp.width,height:Math.min(sh.clipH,h)}; } }
    await p.screenshot(o);
    await ctx.close();
  }
  await b.close(); s.close();
  console.log(errors.length?('ISSUES:\n'+errors.join('\n')):'no console errors, no overflow');
})();
