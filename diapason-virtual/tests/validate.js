const fs=require('fs'); const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
const dup=[...new Set(ids.filter((x,i)=>ids.indexOf(x)!==i))];
if(dup.length) throw new Error('IDs duplicados: '+dup.join(', '));
const scripts=[...html.matchAll(/<script src=["']([^"']+)["']/g)].map(m=>m[1]).filter(x=>!/^https?:/.test(x));
for(const s of scripts){ if(!fs.existsSync(path.join(root,s))) throw new Error('Falta script: '+s); }
const css=[...html.matchAll(/<link[^>]+href=["']([^"']+\.css)["']/g)].map(m=>m[1]);
for(const s of css){ if(!fs.existsSync(path.join(root,s))) throw new Error('Falta CSS: '+s); }
console.log(`OK · ${ids.length} IDs únicos · ${scripts.length} scripts locales · ${css.length} CSS local`);
