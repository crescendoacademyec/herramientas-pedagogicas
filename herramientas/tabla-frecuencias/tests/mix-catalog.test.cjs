const test=require('node:test');const assert=require('node:assert/strict');
const {presets,families,sources,search}=require('../mix-presets.js');
test('all 13 book styles are represented and every family has original scenarios',()=>{
 const book=['electronic','blues','rap','reggae','heavy-metal','new-age','alternative-rock','jazz','folk','bluegrass','big-band','orchestra','orchestra-balanced'];
 for(const id of book)assert.equal(presets[id].basis,'book',id);
 assert.equal(Object.keys(presets).length,184);
 for(const family of Object.keys(families))assert.ok(Object.values(presets).some(p=>p.family===family),family);
});
test('all scenarios have finite editable coordinates, unique names and resolvable references',()=>{
 const titles=new Set();const arrangements=new Set();
 for(const [id,p] of Object.entries(presets)){
  assert.ok(!titles.has(p.title),id);titles.add(p.title);assert.ok(families[p.family]);assert.ok(p.note.length>30);
  assert.ok(p.tracks.length>=3&&p.tracks.length<=20,id);assert.equal(new Set(p.tracks.map(t=>t.name)).size,p.tracks.length,id);
  for(const t of p.tracks){assert.ok(t.name.length<=40);assert.match(t.color,/^#[0-9a-f]{6}$/i);for(const k of ['pan','register','width','depth','level'])assert.ok(Number.isFinite(t[k])&&t[k]>=(k==='pan'?-100:0)&&t[k]<=100,id+' '+t.name+' '+k);}
  const arrangement=JSON.stringify(p.tracks);assert.ok(!arrangements.has(arrangement),'Duplicated arrangement '+id);arrangements.add(arrangement);
  for(const s of p.sources)assert.ok(sources[s]?.url.startsWith('https://'));
 }
});
test('book orchestra alternatives and contrasting traditions are not renamed copies',()=>{
 assert.notEqual(presets.orchestra.tracks.find(t=>t.name==='Cellos').pan,presets['orchestra-balanced'].tracks.find(t=>t.name==='Cellos').pan);
 assert.ok(presets.pasillo.tracks.some(t=>t.name==='Requinto'));
 assert.ok(presets['forro'].tracks.some(t=>t.name==='Accordion'));
 assert.ok(presets['hindustani'].tracks.some(t=>t.name==='Tanpura'));
 assert.ok(presets['choir'].tracks.every(t=>!t.name.includes('Bombo')));
});

test('common spellings find the requested genres first',()=>{
 for(const [query,id] of Object.entries({regueton:'reggaeton',reggaeton:'reggaeton','reggaetón':'reggaeton',afrobeats:'afrobeats',indie:'indie-pop',citypop:'city-pop','city pop':'city-pop',kpop:'k-pop','K-POP':'k-pop','k pop':'k-pop','ambient chill':'ambient-chill',edm:'edm',dnb:'drum-bass','r&b':'rnb'}))assert.equal(search(presets,query)[0]?.[0],id,query);
 assert.ok(search(presets,'kpop').length>=4);
 assert.ok(search(presets,'reggaeton').some(([id])=>id==='reggaeton-classic'));
 assert.ok(search(presets,'indie').some(([id])=>id==='indie-folk'));
 assert.equal(search(presets,'a genre that does not exist').length,0);
});
test('family filtering and custom names retain access to every map',()=>{
 const ids=new Set();for(const f of Object.keys(families))for(const [id,p] of search(presets,'',f)){assert.equal(p.family,f);ids.add(id);}
 assert.equal(ids.size,Object.keys(presets).length);
 const custom={test:{title:'Mi fusión de city-pop',family:'custom'}};assert.equal(search(custom,'citypop','custom')[0][0],'test');
 assert.ok(!search(presets,'citypop','metal').length);
});
test('instrument labels use English and retain distinct traditional instruments',()=>{
 const kpop=presets['k-pop'].tracks.map(t=>t.name);
 for(const name of ['Lead vocal','Doubles','Bass','Kick','Clap'])assert.ok(kpop.includes(name),name);
 assert.ok(presets.baroque.tracks.some(t=>t.name==='Harpsichord'));
 assert.ok(presets['son-cubano'].tracks.some(t=>t.name==='Claves'));
 assert.ok(presets.norteno.tracks.some(t=>t.name==='Bajo sexto'));
 for(const p of Object.values(presets))for(const t of p.tracks)assert.ok(!['Voz','Bajo','Bombo','Guitarra','Cuerdas','Platos','Coros'].includes(t.name),p.title+' '+t.name);
});
