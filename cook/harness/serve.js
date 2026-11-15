// Local test server: wraps map/index.html the way the artifact host does, with a local d3 copy.
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.resolve(__dirname,'..','..'), MAP=path.join(ROOT,'map'), D3=path.join(__dirname,'d3.min.js');
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html'};
module.exports=function(port){return new Promise(res=>{const s=http.createServer((q,r)=>{
  const u=q.url.split('?')[0];
  if(u==='/'||u==='/index.html'){const body=fs.readFileSync(MAP+'/index.html','utf8').replace('https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js','/d3.min.js');
    r.writeHead(200,{'content-type':'text/html; charset=utf-8'});
    r.end('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font:14px system-ui}img{max-width:100%}[hidden]{display:none!important}</style></head><body>'+body+'</body></html>');return;}
  if(u==='/d3.min.js'){r.writeHead(200,{'content-type':'text/javascript'});r.end(fs.readFileSync(D3));return;}
  const f=path.join(MAP,u);if(fs.existsSync(f)&&fs.statSync(f).isFile()){r.writeHead(200,{'content-type':types[path.extname(f)]||'text/plain'});r.end(fs.readFileSync(f));}else{r.writeHead(404);r.end();}
});s.listen(port,()=>res(s));});};
