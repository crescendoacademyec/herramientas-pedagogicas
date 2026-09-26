const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ctx=vm.createContext({});
for(const file of ['data.js','instrument-catalog.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),ctx);
const data=vm.runInContext('({instruments:INSTRUMENTS,sources:FREQUENCY_SOURCES,frequencyForNote})',ctx);
test('catalog has unique IDs, documented ranges and valid sources in every family',()=>{
 assert.equal(data.instruments.length,46);
 assert.equal(new Set(data.instruments.map(i=>i.id)).size,46);
 for(const i of data.instruments){
  for(const range of [i.range,i.realRange,i.harm].filter(Boolean))assert.ok(range.every(Number.isFinite)&&range[0]>0&&range[1]>range[0],i.id);
  if(i.detail){assert.ok(i.rangeNote&&i.registerOnly);assert.ok(!i.harm);assert.ok(i.sources.length);for(const id of i.sources)assert.ok(data.sources[id],id);}
 }
 for(const cat of ['voz','cuerdas','viento','teclas','percusion'])assert.ok(data.instruments.some(i=>i.cat===cat&&i.detail));
});
test('concert pitches retain octaves, transpositions and enharmonic octave boundaries',()=>{
 const hz=data.frequencyForNote;
 assert.equal(hz('A4'),440);assert.equal(hz('Cb1'),30.9);assert.equal(hz('B#3'),hz('C4'));
 const low=id=>data.instruments.find(i=>i.id===id).realRange[0];
 assert.equal(low('contrabajo'),41.2);assert.equal(low('cello'),65.4);assert.equal(low('viola'),130.8);assert.equal(low('violin'),196);
 assert.equal(low('piccolo'),587.3);assert.equal(low('saxo-tenor'),103.8);assert.equal(low('trompeta'),164.8);
 assert.equal(low('arpa'),30.9);assert.equal(low('marimba'),65.4);
});
