const fs=require('fs'); const path=require('path');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
const dup=ids.filter((x,i,a)=>a.indexOf(x)!==i);
const required=['css/styles.css','js/core.js','js/audio.js','js/staff.js','js/midi.js','js/score.js','js/tutor.js','js/web.js','js/metronome.js','js/chords.js','js/init.js'];
const missing=required.filter(f=>!fs.existsSync(path.join(root,f)));
if(dup.length){console.error('IDs duplicados:',[...new Set(dup)]);process.exitCode=1;}
if(missing.length){console.error('Archivos faltantes:',missing);process.exitCode=1;}
for(const f of required.filter(x=>x.endsWith('.js'))){const t=fs.readFileSync(path.join(root,f),'utf8'); if(!t.trim()) {console.error('JS vacío:',f);process.exitCode=1;}}
if(!process.exitCode) console.log(`OK · ${ids.length} IDs únicos · ${required.length} dependencias locales presentes`);
