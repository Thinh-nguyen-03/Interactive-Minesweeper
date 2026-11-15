// Typeface candidates, rendered on the same three screens. Usage: node cook/harness/fonts.js
// Writes cook/stills/r05/F-<id>-home.png, -check.png, -dossier.png. Each candidate swaps the font variables only.
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const serve=require('./serve.js');
const out=path.resolve(__dirname,'..','stills','r05'); fs.mkdirSync(out,{recursive:true});
const G='https://fonts.googleapis.com/css2?';
const CANDS={
 A:{href:G+'family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&family=Schibsted+Grotesk:ital,wght@0,400..800;1,400..600&family=Sofia+Sans+Condensed:wght@400..700&display=swap',
    css:'--font-ui:"Schibsted Grotesk",sans-serif;--font-head:"Newsreader",serif;--font-data:"Sofia Sans Condensed",sans-serif;--head-weight:500;--head-track:-.018em;--head-scale:1'},
 B:{href:G+'family=Instrument+Serif:ital@0;1&family=Hanken+Grotesk:ital,wght@0,400..800;1,400..600&family=Archivo+Narrow:wght@400..700&display=swap',
    css:'--font-ui:"Hanken Grotesk",sans-serif;--font-head:"Instrument Serif",serif;--font-data:"Archivo Narrow",sans-serif;--head-weight:400;--head-track:-.012em;--head-scale:1.14'},
 C:{href:G+'family=Bricolage+Grotesque:opsz,wdth,wght@12..96,75..100,400..800&family=Schibsted+Grotesk:ital,wght@0,400..800;1,400..600&family=Barlow+Condensed:wght@400;500;600;700&display=swap',
    css:'--font-ui:"Schibsted Grotesk",sans-serif;--font-head:"Bricolage Grotesque",sans-serif;--font-data:"Barlow Condensed",sans-serif;--head-weight:700;--head-track:-.028em;--head-scale:.96'},
 D:{href:G+'family=Spectral:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Familjen+Grotesk:ital,wght@0,400..700;1,400..700&family=Sofia+Sans+Condensed:wght@400..700&display=swap',
    css:'--font-ui:"Familjen Grotesk",sans-serif;--font-head:"Spectral",serif;--font-data:"Sofia Sans Condensed",sans-serif;--head-weight:500;--head-track:-.02em;--head-scale:.98'},
};
const only=process.argv[2];
const SCREENS=[['home','#home','light'],['check','#C06','light'],['dossier','#map-jared-kushner','dark']];
(async()=>{
  const port=8600+Math.floor(Math.random()*90); const s=await serve(port); const b=await chromium.launch();
  for(const id of Object.keys(CANDS)){ if(only&&only!==id) continue;
    for(const sc of SCREENS){
      const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,colorScheme:sc[2]});
      await ctx.addInitScript(()=>{window.__STILL__=true;});
      const p=await ctx.newPage();
      await p.goto('http://localhost:'+port+'/'+sc[1],{waitUntil:'load'});
      await p.addStyleTag({content:'@import url("'+CANDS[id].href+'"); html:root{'+CANDS[id].css+'}'});
      await p.waitForTimeout(1500); await p.evaluate(()=>document.fonts.ready);
      await p.evaluate(()=>{window.dispatchEvent(new Event('resize'));}); await p.waitForTimeout(1500);
      await p.screenshot({path:path.join(out,'F-'+id+'-'+sc[0]+'.png')});
      await ctx.close();
    }
  }
  await b.close(); s.close(); console.log('done');
})();
