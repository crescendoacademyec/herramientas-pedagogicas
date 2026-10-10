const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const apps=fs.readdirSync(path.join(root,'herramientas'),{withFileTypes:true}).filter(x=>x.isDirectory()).map(x=>x.name);
test('all tools and catalog resolve their local HTML resources from the new routes',()=>{
 for(const app of ['',...apps]){
  const file=path.join(root,'herramientas',app,'index.html');
  const html=fs.readFileSync(file,'utf8');
  const page=new URL('https://example.test/inicio/herramientas/'+(app?app+'/':''));
  const baseMatch=html.match(/<base\b[^>]*href="([^"]+)"/i);
  const base=baseMatch?new URL(baseMatch[1],page):page;
  for(const tag of html.matchAll(/<(?:a|link|script|img|source|video)\b[^>]*>/gi)){
   for(const m of tag[0].matchAll(/(?:href|src|poster)="([^"]+)"/gi)){
    if(/^(?:[a-z]+:|\/\/|#)/i.test(m[1]))continue;
    const url=new URL(m[1],base);
    assert.ok(url.pathname.startsWith('/inicio/'),`${file}: escapes site prefix: ${m[1]}`);
    const local=path.join(root,decodeURIComponent(url.pathname.slice('/inicio/'.length)));
    assert.ok(fs.existsSync(local),`${file}: missing ${m[1]}`);
   }
  }
 }
});
test('legacy routes redirect to each tool and preserve query and hash',()=>{
 for(const app of apps){
  const html=fs.readFileSync(path.join(root,app,'index.html'),'utf8');
  const code=html.match(/<script>(.*?)<\/script>/s)[1];
  let result;
  require('node:vm').runInNewContext(code,{location:{search:'?demo=1',hash:'#lesson',replace:v=>result=v}});
  assert.equal(result,`../herramientas/${app}/?demo=1#lesson`);
 }
});
