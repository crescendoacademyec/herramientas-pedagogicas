const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/app.js','utf8');
const sandbox={};vm.createContext(sandbox);
for(const name of ['NATURAL','CHROMATIC_SOLFEGE']){
  const declaration=source.match(new RegExp('const '+name+' = [^;]+;'))[0];
  vm.runInContext(declaration,sandbox);
}
vm.runInContext('const SMUFL_GLYPHS={gClef:"sol",fClef:"fa"};',sandbox);
vm.runInContext(source.slice(source.indexOf('function staffTrainerSVG('),source.indexOf('const NOTE_SOLFEGE=')),sandbox);
assert.equal(vm.runInContext('CHROMATIC_SOLFEGE.B',sandbox),'Ti');
assert.equal(vm.runInContext('CHROMATIC_SOLFEGE["G#"]',sandbox),'Si');
assert.equal(vm.runInContext('CHROMATIC_SOLFEGE["C#"]',sandbox),'Di');
assert.equal(vm.runInContext('CHROMATIC_SOLFEGE.Db',sandbox),'Ra');
const sharp=vm.runInContext('staffTrainerSVG("C#4","treble")',sandbox);
const flat=vm.runInContext('staffTrainerSVG("Db4","treble")',sandbox);
assert.ok(sharp.includes('♯'));assert.ok(flat.includes('♭'));
// Enarmónicos: igual sonido, distinta posición escrita.
assert.match(sharp,/cy="112"/);assert.match(flat,/cy="106"/);
assert.match(sharp,/class="ledger"/);
// Las notas fuera del antiguo array no deben caer todas en la misma posición.
assert.match(vm.runInContext('staffTrainerSVG("A3","treble")',sandbox),/cy="124"/);
assert.match(vm.runInContext('staffTrainerSVG("C2","bass")',sandbox),/cy="124"/);
console.log('Solfeo cromático: sílabas, alteraciones y posiciones verificadas.');
vm.runInContext(source.slice(source.indexOf('function noteTrainerPitches('),source.indexOf('function mountNoteTrainer(')),sandbox);
for(const chromatic of [false,true]){
  for(const selection of ['natural','sharps','flats','both','all']){
    const pitches=Array.from(vm.runInContext(`noteTrainerPitches('${selection}',${chromatic})`,sandbox));
    assert.ok(pitches.length>0);
    if(selection==='natural')assert.ok(pitches.every(p=>p.length===1));
    if(selection==='sharps')assert.ok(pitches.every(p=>p.endsWith('#')));
    if(selection==='flats')assert.ok(pitches.every(p=>p.endsWith('b')));
    if(selection==='both')assert.ok(pitches.every(p=>p.length===2));
    if(selection==='all')assert.equal(pitches.length,chromatic?17:21);
  }
}
console.log('Selección de naturales y alteraciones verificada en ambos sistemas.');
