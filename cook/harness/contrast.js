// Text contrast audit. Usage: node cook/harness/contrast.js [filter]
// Loads each main route in the light and the dark theme, at desktop and phone width, walks every visible element that
// holds text of its own, and compares the computed text colour with the effective background behind it (the nearest
// opaque background, with translucent layers and opacity composited). Prints every pair under WCAG AA:
// 4.5 to 1 for normal text, 3 to 1 for large text (24 px and up, or 18.66 px and up when bold). Placeholders are checked too.
// Text drawn on a canvas is not DOM text and is not covered here. Exit code 1 when anything fails.
const {chromium}=require('playwright');
const serve=require('./serve.js');
const D={width:1440,height:900}, P={width:400,height:860};
const ROUTES=[
 {id:'home',hash:'#home'},
 {id:'checks',hash:'#claims'},
 {id:'check-C06',hash:'#C06',open:true},
 {id:'check-C46',hash:'#C46',open:true},
 {id:'profile',hash:'#name-world-liberty-financial',open:true},
 {id:'profile-kushner',hash:'#name-jared-kushner',open:true},
 {id:'names',hash:'#names'},
 {id:'method',hash:'#method'},
 {id:'search',hash:'#method',type:'kush',deskOnly:true},
 {id:'map',hash:'#map'},
 {id:'map-selected',hash:'#map-jared-kushner'},
 {id:'map-check',hash:'#map-C46'},
 {id:'map-topic',hash:'#map-topic-gulf-money'},
 {id:'map-filters',hash:'#map',click:'#tools-toggle'},
 {id:'map-list',hash:'#map',click:'[data-view="list"]',phoneOnly:true},
 {id:'matrix',hash:'#map-matrix'},
];
const filter=process.argv[2];
function audit(){
  function parse(c){
    if(!c) return null; let m;
    if((m=/^rgba?\(([^)]+)\)$/.exec(c))){ const p=m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat); return [p[0],p[1],p[2],p.length>3?p[3]:1]; }
    if((m=/^color\(srgb\s+([^)]+)\)$/.exec(c))){ const p=m[1].split(/[\s\/]+/).filter(Boolean).map(parseFloat); return [p[0]*255,p[1]*255,p[2]*255,p.length>3?p[3]:1]; }
    return null;
  }
  function over(top,bot){ const a=top[3]; return [top[0]*a+bot[0]*(1-a),top[1]*a+bot[1]*(1-a),top[2]*a+bot[2]*(1-a),1]; }
  function lum(c){ const f=v=>{v/=255;return v<=0.03928?v/12.92:Math.pow((v+0.055)/1.055,2.4);}; return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]); }
  function ratio(a,b){ const x=lum(a),y=lum(b); return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05); }
  function hex(c){ return '#'+c.slice(0,3).map(v=>{v=Math.round(v);return (v<16?'0':'')+v.toString(16);}).join(''); }
  const base=getComputedStyle(document.documentElement).colorScheme.indexOf('dark')>=0?[18,18,18,1]:[255,255,255,1];
  function background(el){   // the layers behind an element, nearest first, composited down to an opaque colour
    const layers=[]; let e=el, img=false;
    while(e&&e.nodeType===1){ const cs=getComputedStyle(e), c=parse(cs.backgroundColor);
      if(cs.backgroundImage&&cs.backgroundImage!=='none'&&e!==el) img=true;
      if(c&&c[3]>0){ layers.push(c); if(c[3]>=1) break; }
      e=e.parentElement; }
    let bg=layers.length&&layers[layers.length-1][3]>=1?layers.pop():base;
    for(let i=layers.length-1;i>=0;i--) bg=over(layers[i],bg);
    return {bg,img};
  }
  function opacity(el){ let o=1,e=el; while(e&&e.nodeType===1){ o*=parseFloat(getComputedStyle(e).opacity||'1'); e=e.parentElement; } return o; }
  function visible(el){
    const cs=getComputedStyle(el); if(cs.visibility!=='visible'||cs.display==='none') return false;
    const r=el.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
    if(cs.clip==='rect(0px, 0px, 0px, 0px)'||cs.clipPath==='inset(50%)') return false;
    for(let e=el;e;e=e.parentElement){ if(e.hidden||getComputedStyle(e).display==='none') return false; }
    if(r.right<0||r.left>innerWidth) return false;
    return true;
  }
  function owner(el){ return el.closest('#matrix')?'matrix':el.closest('#legend,#hud,#tip,#banner,#focus-note')?'map overlay':el.closest('#mapview')?'map chrome':'page'; }
  function where(el){ const out=[]; for(let e=el;e&&e.nodeType===1&&out.length<4;e=e.parentElement){ out.unshift(e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/).slice(0,2).join('.'):'')); } return out.join(' > '); }
  const fails=[], seen=new Set(); let checked=0;
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const els=new Set();
  while(walker.nextNode()){ const t=walker.currentNode; if(t.nodeValue.trim()&&t.parentElement) els.add(t.parentElement); }
  function test(el,color,text,note){
    const cs=getComputedStyle(el); let fg=parse(color); if(!fg) return;
    const b=background(el); fg=[fg[0],fg[1],fg[2],fg[3]*opacity(el)]; const shown=over(fg,b.bg), r=ratio(shown,b.bg);
    const px=parseFloat(cs.fontSize), bold=parseInt(cs.fontWeight,10)>=700, large=px>=24||(px>=18.66&&bold), need=large?3:4.5;
    checked++;
    if(r<need-0.005){ const key=where(el)+'|'+hex(shown)+'|'+hex(b.bg); if(seen.has(key)) return; seen.add(key);
      fails.push({ratio:+r.toFixed(2),need,fg:hex(shown),bg:hex(b.bg),px,weight:cs.fontWeight,owner:owner(el),where:where(el),text:(note||'')+text.trim().replace(/\s+/g,' ').slice(0,48),overImage:b.img}); }
  }
  els.forEach(el=>{ if(!visible(el)||el.closest('script,style,noscript,option')) return;
    let text=''; el.childNodes.forEach(n=>{ if(n.nodeType===3) text+=n.nodeValue; });
    const cs=getComputedStyle(el), svg=el instanceof SVGElement;   // text in an inline figure is painted with its fill
    test(el,svg&&parse(cs.fill)?cs.fill:cs.color,text); });
  document.querySelectorAll('input[placeholder]').forEach(el=>{ if(visible(el)&&!el.value) test(el,getComputedStyle(el,'::placeholder').color,el.getAttribute('placeholder'),'placeholder: '); });
  return {checked,fails};
}
(async()=>{
  const port=9100+Math.floor(Math.random()*90); const s=await serve(port); const b=await chromium.launch();
  const all=[]; let total=0, pages=0;
  for(const vp of [['desk',D],['phone',P]]) for(const scheme of ['light','dark']) for(const r of ROUTES){
    if((r.deskOnly&&vp[0]!=='desk')||(r.phoneOnly&&vp[0]!=='phone')) continue;
    const id=vp[0]+' '+scheme+' '+r.id; if(filter&&id.indexOf(filter)<0) continue;
    const ctx=await b.newContext({viewport:vp[1],deviceScaleFactor:1,colorScheme:scheme});
    await ctx.addInitScript(()=>{window.__STILL__=true;});
    const p=await ctx.newPage();
    await p.goto('http://localhost:'+port+'/'+r.hash,{waitUntil:'load'}); await p.waitForTimeout(1600);
    try{
      if(r.type) await p.fill('#search',r.type);
      if(r.click) await p.click(r.click,{timeout:3000});
      if(r.open) await p.evaluate(()=>{ document.querySelectorAll('[data-unfold]').forEach(x=>x.click()); document.querySelectorAll('details').forEach(d=>{d.open=true;}); });
    }catch(e){ console.log('  ('+id+': step skipped, '+String(e.message).split('\n')[0]+')'); }
    await p.waitForTimeout(500);
    const res=await p.evaluate(audit); total+=res.checked; pages++;
    res.fails.forEach(f=>{ f.page=id; all.push(f); });
    console.log((res.fails.length?'FAIL ':'ok   ')+id+': '+res.checked+' text elements'+(res.fails.length?', '+res.fails.length+' under AA':''));
    await ctx.close();
  }
  await b.close(); s.close();
  const by={}; all.forEach(f=>{ (by[f.owner]=by[f.owner]||[]).push(f); });
  Object.keys(by).forEach(o=>{ console.log('\n== '+o+' ('+by[o].length+') ==');
    by[o].forEach(f=>console.log(f.page+' | '+f.ratio+':1 (needs '+f.need+') '+f.fg+' on '+f.bg+' | '+f.px+'px/'+f.weight+(f.overImage?' | over an image or gradient':'')+' | '+f.where+' | "'+f.text+'"')); });
  console.log('\n'+pages+' pages, '+total+' text elements checked, '+all.length+' under AA');
  process.exit(all.length?1:0);
})();
