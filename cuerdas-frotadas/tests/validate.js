const fs=require('fs');const path=require('path');const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid=["']([^"']+)["']/g)].map(m=>m[1]);
const dup=[...new Set(ids.filter((x,i)=>ids.indexOf(x)!==i))];
if(dup.length){console.error('IDs duplicados',dup);process.exit(1)}
for(const f of ['css/styles.css','js/app.js','js/vibrato.js','js/metronome.js'])if(!fs.existsSync(path.join(root,f))){console.error('Falta',f);process.exit(1)}
console.log(`${ids.length} IDs únicos · dependencias OK`);
