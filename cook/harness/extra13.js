// Stills for round 13 (the balance sheet as a tool). Usage: node cook/harness/extra13.js [id-prefix]
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const serve=require('./serve.js');
const out=path.resolve(__dirname,'..','stills','r13'); fs.mkdirSync(out,{recursive:true});
const D={width:1440,height:900}, P={width:400,height:860};
const SHOTS=[
 {id:'T01-reported-light',hash:'#balance',vp:D,scheme:'light'},
 {id:'T02-reported-dark',hash:'#balance',vp:D,scheme:'dark'},
 {id:'T03-reported-row-selected',hash:'#balance-row=C96-01',vp:D,scheme:'light'},
 {id:'T04-reported-share-on',hash:'#balance-share=1&row=C96-06',vp:D,scheme:'light'},
 {id:'T05-reported-share-on-dark',hash:'#balance-share=1',vp:D,scheme:'dark'},
 {id:'T06-reported-by-recipient-linear',hash:'#balance-group=recipient&scale=linear',vp:D,scheme:'light'},
 {id:'T07-paper-light',hash:'#balance-view=paper&row=C98-04',vp:D,scheme:'light'},
 {id:'T08-paper-dark',hash:'#balance-view=paper',vp:D,scheme:'dark'},
 {id:'T09-family-light',hash:'#balance-view=family',vp:D,scheme:'light'},
 {id:'T10-family-dark',hash:'#balance-view=family&row=C99-06',vp:D,scheme:'dark'},
 {id:'T11-settlements-light',hash:'#balance-view=settlements&row=C100-12',vp:D,scheme:'light'},
 {id:'T12-settlements-dark',hash:'#balance-view=settlements',vp:D,scheme:'dark'},
 {id:'T13-estimates-light',hash:'#balance-view=estimates',vp:D,scheme:'light'},
 {id:'T14-estimates-dark',hash:'#balance-view=estimates&row=C100-08',vp:D,scheme:'dark'},
 {id:'T15-salary-selected',hash:'#balance-row=C95-01',vp:D,scheme:'light'},
 {id:'T16-all-rows',hash:'#balance',vp:D,scheme:'light',rows:1},
 {id:'T17-phone-reported',hash:'#balance',vp:P,scheme:'light'},
 {id:'T18-phone-row-selected',hash:'#balance-row=C96-04',vp:P,scheme:'dark'},
 {id:'T19-phone-settlements',hash:'#balance-view=settlements',vp:P,scheme:'light'},
 {id:'T20-phone-paper',hash:'#balance-view=paper',vp:P,scheme:'dark'},
 {id:'T21-phone-family',hash:'#balance-view=family',vp:P,scheme:'light'},
 {id:'T22-phone-estimates',hash:'#balance-view=estimates',vp:P,scheme:'light'},
 {id:'T23-phone-full',hash:'#balance',vp:P,scheme:'light',full:1},
 {id:'T24-filter',hash:'#balance',vp:D,scheme:'light',type:'world liberty'},
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
    await p.waitForTimeout(1500);
    if(sh.type){ await p.fill('#bx-q',sh.type); await p.waitForTimeout(200); }
    if(sh.rows){ await p.click('#bx-rows summary'); await p.waitForTimeout(300); await p.evaluate(()=>document.getElementById('bx-rows').scrollIntoView()); }
    await p.waitForTimeout(300);
    const ov=await p.evaluate(()=>document.documentElement.scrollWidth>document.documentElement.clientWidth+1);
    if(ov) errors.push(sh.id+': horizontal overflow');
    await p.screenshot({path:path.join(out,sh.id+'.png'),fullPage:!!sh.full});
    await ctx.close();
  }
  await b.close(); s.close();
  console.log(errors.length?('ISSUES:\n'+errors.join('\n')):'no console errors, no overflow');
})();
