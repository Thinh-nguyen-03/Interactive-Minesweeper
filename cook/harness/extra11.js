// Extra stills for round 11 (copy and notes pass). Usage: node cook/harness/extra11.js [id-prefix] [out-suffix, e.g. before]
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const serve=require('./serve.js');
const out=path.resolve(__dirname,'..','stills','r11'+(process.argv[3]?'-'+process.argv[3]:'')); fs.mkdirSync(out,{recursive:true});
const D={width:1440,height:900}, P={width:400,height:860};
const SHOTS=[
 {id:'M01-method-light',hash:'#method',vp:D,scheme:'light',full:1},
 {id:'M02-method-dark',hash:'#method',vp:D,scheme:'dark',full:1},
 {id:'M03-method-phone-dark',hash:'#method',vp:P,scheme:'dark',full:1},
 {id:'M04-method-phone-light',hash:'#method',vp:P,scheme:'light',full:1},
 {id:'M05-home-light',hash:'#home',vp:D,scheme:'light',full:1,clipH:2100},
 {id:'M06-home-phone',hash:'#home',vp:P,scheme:'dark',clipH:2600,full:1},
 {id:'M07-check-light',hash:'#C06',vp:D,scheme:'light',full:1,clipH:2200},
 {id:'M08-check-C46-dark',hash:'#C46',vp:D,scheme:'dark'},
 {id:'M09-check-C37-phone',hash:'#C37',vp:P,scheme:'light'},
 {id:'M10-profile-light',hash:'#name-jared-kushner',vp:D,scheme:'light',full:1,clipH:1900},
 {id:'M11-profile-phone-dark',hash:'#name-jared-kushner',vp:P,scheme:'dark',clipH:2200,full:1},
 {id:'M12-names',hash:'#names',vp:D,scheme:'light'},
 {id:'M13-map-light',hash:'#map',vp:D,scheme:'light'},
 {id:'M14-map-dark-sel',hash:'#map-jared-kushner',vp:D,scheme:'dark'},
 {id:'M15-map-phone',hash:'#map',vp:P,scheme:'light'},
 {id:'M16-matrix-light',hash:'#map-matrix',vp:D,scheme:'light'},
 {id:'M17-matrix-dark',hash:'#map-matrix',vp:D,scheme:'dark'},
 {id:'M18-matrix-phone',hash:'#map-matrix',vp:P,scheme:'light'},
 {id:'M19-missing',hash:'#nothing-here',vp:D,scheme:'light'},
 {id:'M20-home-foot-dark',hash:'#home',vp:D,scheme:'dark',bottom:1},
 {id:'M21-search-empty',hash:'#method',vp:D,scheme:'light',type:'zzzz'},
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
    if(sh.type){ await p.fill('#search',sh.type); }
    if(sh.bottom) await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));
    await p.waitForTimeout(400);
    const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
    if(ov) errors.push(sh.id+': horizontal overflow');
    const o={path:path.join(out,sh.id+'.png')};
    if(sh.full){ o.fullPage=true; if(sh.clipH){ o.clip={x:0,y:0,width:sh.vp.width,height:sh.clipH}; } }
    await p.screenshot(o);
    await ctx.close();
  }
  await b.close(); s.close();
  console.log(errors.length?('ISSUES:\n'+errors.join('\n')):'no console errors, no overflow');
})();
