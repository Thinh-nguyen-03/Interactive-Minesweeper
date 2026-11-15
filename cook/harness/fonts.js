// Typeface candidates, rendered on the same four screens. Usage: node cook/harness/fonts.js [id] [round]
// Writes cook/stills/rNN/F-<id>-home.png, -check.png, -dossier.png (dark map, a name selected), -map.png (light map at rest).
// Each candidate swaps the font variables only; the canvases read --font-ui, so their labels change too.
const {chromium}=require('playwright'),path=require('path'),fs=require('fs');
const serve=require('./serve.js');
const round=(process.argv[3]||'07').padStart(2,'0');
const out=path.resolve(__dirname,'..','stills','r'+round); fs.mkdirSync(out,{recursive:true});
const G='https://fonts.googleapis.com/css2?';
function one(fam,data,stretch,track){ return '--font-ui:"'+fam+'",sans-serif;--font-head:"'+fam+'",sans-serif;--font-data:"'+(data||fam)+'",sans-serif;--data-stretch:'+(stretch||'normal')+';--head-weight:600;--head-track:'+(track||'-.02em')+';--head-scale:1'; }
const CANDS={
 'A-plex':{fam:['IBM Plex Sans','IBM Plex Sans Condensed'],href:G+'family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=IBM+Plex+Sans+Condensed:wght@400;500;600&display=swap',css:one('IBM Plex Sans','IBM Plex Sans Condensed')},
 'B-archivo':{fam:['Archivo'],href:G+'family=Archivo:ital,wdth,wght@0,62..125,400..700;1,62..125,400&display=swap',css:one('Archivo',null,'88%')},
 'C-instrument':{fam:['Instrument Sans'],href:G+'family=Instrument+Sans:ital,wdth,wght@0,75..100,400..700;1,75..100,400&display=swap',css:one('Instrument Sans',null,'88%')},
 'D-geist':{fam:['Geist'],href:G+'family=Geist:wght@400..700&display=swap',css:one('Geist',null,null,'-.025em')},
};
const only=process.argv[2]&&process.argv[2]!=='all'?process.argv[2]:null;
const SCREENS=[['home','#home','light'],['check','#C06','light'],['dossier','#map-jared-kushner','dark'],['map','#map','light']];
(async()=>{
  const port=8600+Math.floor(Math.random()*90); const s=await serve(port); const b=await chromium.launch();
  for(const id of Object.keys(CANDS)){ if(only&&id.indexOf(only)<0) continue;
    for(const sc of SCREENS){
      const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,colorScheme:sc[2]});
      await ctx.addInitScript(()=>{window.__STILL__=true;});
      const p=await ctx.newPage();
      await p.goto('http://localhost:'+port+'/'+sc[1],{waitUntil:'load'});
      await p.addStyleTag({content:'@import url("'+CANDS[id].href+'"); html:root{'+CANDS[id].css+'}'});
      await p.waitForTimeout(1200);
      await p.evaluate(async fams=>{ for(const f of fams) for(const w of [400,500,600,700]) { try{ await document.fonts.load(w+' 14px "'+f+'"'); }catch(e){} } await document.fonts.ready; },CANDS[id].fam);
      // the canvases take the face from the tokens when the theme is read again
      await p.evaluate(sch=>{ document.documentElement.setAttribute('data-theme',sch); },sc[2]);
      await p.waitForTimeout(400);
      await p.evaluate(()=>{ window.dispatchEvent(new Event('resize')); }); await p.waitForTimeout(1500);
      await p.screenshot({path:path.join(out,'F-'+id+'-'+sc[0]+'.png')});
      await ctx.close();
    }
  }
  await b.close(); s.close(); console.log('done');
})();
