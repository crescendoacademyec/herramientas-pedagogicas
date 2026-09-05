
const fs=require('fs'), path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dups=ids.filter((id,i)=>ids.indexOf(id)!==i);
if(dups.length) throw new Error('IDs duplicados: '+[...new Set(dups)].join(', '));
const deps=[...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(m=>m[1])
  .filter(x=>! /^(https?:|mailto:|#)/.test(x));
for(const dep of deps){
  if(!fs.existsSync(path.join(root,dep))) throw new Error('Falta dependencia: '+dep);
}
console.log(`OK · ${ids.length} IDs únicos · ${deps.length} dependencias locales`);
