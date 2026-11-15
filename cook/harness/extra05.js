// Extra stills for round 5: dark theme and phone width on the reading pages and the map. Usage: node cook/harness/extra05.js [id-prefix]
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const serve=require('./serve.js');
const out=path.resolve(__dirname,'..','stills','r07'); fs.mkdirSync(out,{recursive:true});
const D={width:1440,height:900}, P={width:400,height:860};
const SHOTS=[
 {id:'X01-home-dark',hash:'#home',vp:D,scheme:'dark'},
 {id:'X02-home-dark-leads',hash:'#home',vp:D,scheme:'dark',y:640},
 {id:'X03-check-dark',hash:'#C06',vp:D,scheme:'dark'},
 {id:'X04-check-dark-points',hash:'#C06',vp:D,scheme:'dark',y:700},
 {id:'X05-profile-dark',hash:'#name-world-liberty-financial',vp:D,scheme:'dark'},
 {id:'X06-C46-light',hash:'#C46',vp:D,scheme:'light'},
 {id:'X07-home-topics',hash:'#topics',vp:D,scheme:'light'},
 {id:'X08-names',hash:'#names',vp:D,scheme:'light'},
 {id:'X09-method',hash:'#method',vp:D,scheme:'light'},
 {id:'X10-check-who',hash:'#C06',vp:D,scheme:'light',sel:'#who'},
 {id:'X11-profile-sums',hash:'#name-world-liberty-financial',vp:D,scheme:'light',sel:'#sums',dy:-300},
 {id:'X12-map-selected-dark',hash:'#map-jared-kushner',vp:D,scheme:'dark'},
 {id:'X13-matrix-dark',hash:'#map-matrix',vp:D,scheme:'dark'},
 {id:'X14-home-phone-full',hash:'#home',vp:P,scheme:'light',full:4200},
 {id:'X15-home-phone-dark',hash:'#home',vp:P,scheme:'dark'},
 {id:'X16-check-phone-dark',hash:'#C06',vp:P,scheme:'dark',full:2400},
 {id:'X17-profile-phone',hash:'#name-world-liberty-financial',vp:P,scheme:'light',full:2400},
 {id:'X18-map-phone-dark',hash:'#map-jared-kushner',vp:P,scheme:'dark'},
 {id:'X19-names-phone',hash:'#names',vp:P,scheme:'dark'},
 {id:'X20-home-1024',hash:'#home',vp:{width:1024,height:800},scheme:'light'},
 {id:'X21-search',hash:'#C06',vp:D,scheme:'dark',type:'kush'},
 {id:'X22-filters',hash:'#map',vp:D,scheme:'light',click:'#tools-toggle'},
];
const only=process.argv[2];
(async()=>{
  const port=8900+Math.floor(Math.random()*90); const s=await serve(port);
  const b=await chromium.launch(); const errors=[];
  for(const sh of SHOTS){ if(only&&sh.id.indexOf(only)<0) continue;
    const vp=sh.full?{width:sh.vp.width,height:sh.full}:sh.vp;
    const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,colorScheme:sh.scheme});
    await ctx.addInitScript(()=>{window.__STILL__=true;});
    const p=await ctx.newPage();
    p.on('console',m=>{if(m.type()==='error')errors.push(sh.id+': '+m.text());});
    p.on('pageerror',e=>errors.push(sh.id+': '+e.message));
    await p.goto('http://localhost:'+port+'/'+sh.hash,{waitUntil:'load'});
    await p.waitForTimeout(2200);
    if(sh.sel) await p.evaluate(a=>{const e=document.querySelector(a[0]); if(e) window.scrollTo(0,e.getBoundingClientRect().top+scrollY-40+(a[1]||0));},[sh.sel,sh.dy]);
    if(sh.y) await p.evaluate(y=>window.scrollTo(0,y),sh.y);
    if(sh.type){ await p.fill('#search',sh.type); }
    if(sh.click){ await p.click(sh.click); }
    await p.waitForTimeout(500);
    const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
    if(ov) errors.push(sh.id+': horizontal overflow');
    await p.screenshot({path:path.join(out,sh.id+'.png')});
    await ctx.close();
  }
  await b.close(); s.close();
  console.log(errors.length?('ISSUES:\n'+errors.join('\n')):'no console errors, no overflow');
})();
