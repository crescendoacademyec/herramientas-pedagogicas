const test=require('node:test');const assert=require('node:assert/strict');
const {presets,families,sources}=require('../mix-presets.js');
test('all 13 book styles are represented and every family has original scenarios',()=>{
 const book=['electronic','blues','rap','reggae','heavy-metal','new-age','alternative-rock','jazz','folk','bluegrass','big-band','orchestra','orchestra-balanced'];
 for(const id of book)assert.equal(presets[id].basis,'book',id);
 assert.equal(Object.keys(presets).length,135);
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
 assert.ok(presets['forro'].tracks.some(t=>t.name==='Sanfona'));
 assert.ok(presets['hindustani'].tracks.some(t=>t.name==='Tanpura'));
 assert.ok(presets['choir'].tracks.every(t=>!t.name.includes('Bombo')));
});
