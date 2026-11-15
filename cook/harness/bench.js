// Whole-frame cost of the globe (draw plus raster), and the time the layout takes. Usage: node cook/harness/bench.js [dbg]
const {chromium}=require('playwright'); const serve=require('./serve.js'); const dbg=process.argv[2]||'';
(async()=>{ const s=await serve(8651); const b=await chromium.launch();
  for(const scheme of ['light','dark']) for(const [w,h,dsf] of [[1440,900,1],[1440,900,2],[400,860,3]]){ const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:dsf,colorScheme:scheme}); await ctx.addInitScript(()=>{window.__STILL__=true;}); const p=await ctx.newPage();
    await p.goto('http://localhost:8651/#map'); await p.waitForFunction(()=>window.__mapProbe&&window.__mapProbe('ms')); const lay=await p.evaluate(()=>window.__layoutMs);
    await p.waitForTimeout(800); const out=[];
    for(const d of (dbg?dbg.split(','):['0'])){ await p.evaluate(d=>window.__mapProbe('dbg'+d),d); await p.evaluate(()=>window.__mapProbe('bench')); out.push('dbg'+d+' '+(await p.evaluate(()=>window.__mapProbe('bench'))).toFixed(1)); }
    console.log(scheme+' '+w+'x'+h+' @'+dsf+'x: layout '+(lay||0).toFixed(0)+' ms, frame ms: '+out.join(' | ')); await ctx.close(); }
  await b.close(); s.close(); })();
