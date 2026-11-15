// Extra reading-page stills for round 3. Usage: node cook/harness/extra03.js
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const serve=require('./serve.js');
const out=path.resolve(__dirname,'..','stills','r03'); fs.mkdirSync(out,{recursive:true});
const D={width:1440,height:900}, P={width:400,height:860};
const SHOTS=[
 {id:'X01-C46',hash:'#C46',vp:D,scheme:'light'},
 {id:'X02-C05',hash:'#C05',vp:D,scheme:'light'},
 {id:'X03-C06-who',hash:'#C06',vp:D,scheme:'light',sel:'#who'},
 {id:'X04-profile-sums',hash:'#name-world-liberty-financial',vp:D,scheme:'light',sel:'#sums',dy:-420},
 {id:'X05-home-dark',hash:'#home',vp:D,scheme:'dark'},
 {id:'X06-check-dark',hash:'#C06',vp:D,scheme:'dark'},
 {id:'X07-home-phone-full',hash:'#home',vp:P,scheme:'light',full:5200},
 {id:'X08-profile-phone',hash:'#name-world-liberty-financial',vp:P,scheme:'light',full:2600},
 {id:'X09-method',hash:'#method',vp:D,scheme:'light'},
 {id:'X10-names',hash:'#names',vp:D,scheme:'light'},
 {id:'X11-C46-phone',hash:'#C46',vp:P,scheme:'light',full:2200},
 {id:'X12-home-mid',hash:'#home',vp:D,scheme:'light',y:640},
];
(async()=>{
  const port=8900+Math.floor(Math.random()*90); const s=await serve(port);
  const b=await chromium.launch(); const errors=[];
  for(const sh of SHOTS){
    const vp=sh.full?{width:sh.vp.width,height:sh.full}:sh.vp;
    const ctx=await b.newContext({viewport:vp,deviceScaleFactor:1,colorScheme:sh.scheme});
    const p=await ctx.newPage();
    p.on('console',m=>{if(m.type()==='error')errors.push(sh.id+': '+m.text());});
    p.on('pageerror',e=>errors.push(sh.id+': '+e.message));
    await p.goto('http://localhost:'+port+'/'+sh.hash,{waitUntil:'load'});
    await p.waitForTimeout(2000);
    if(sh.sel) await p.evaluate(a=>{const e=document.querySelector(a[0]); if(e) window.scrollTo(0,e.getBoundingClientRect().top+scrollY-40+(a[1]||0));},[sh.sel,sh.dy]);
    if(sh.y) await p.evaluate(y=>window.scrollTo(0,y),sh.y);
    await p.waitForTimeout(400);
    const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
    if(ov) errors.push(sh.id+': horizontal overflow');
    await p.screenshot({path:path.join(out,sh.id+'.png')});
    await ctx.close();
  }
  await b.close(); s.close();
  console.log(errors.length?('ISSUES:\n'+errors.join('\n')):'no console errors, no overflow');
})();
