const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/app.js','utf8');
global.window={};require("../shared/music-practice.js");
const sandbox={CrescendoPractice:window.CrescendoPractice};vm.createContext(sandbox);
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
// Enarmónicos: igual sonido, distinta grafía delegada al motor.
assert.ok(sharp.includes('&lt;step&gt;C&lt;/step&gt;'));
assert.ok(sharp.includes('&lt;alter&gt;1&lt;/alter&gt;'));
assert.ok(flat.includes('&lt;step&gt;D&lt;/step&gt;'));
assert.ok(flat.includes('&lt;alter&gt;-1&lt;/alter&gt;'));
assert.ok(vm.runInContext('staffTrainerSVG("A3","treble")',sandbox).includes('&lt;octave&gt;3&lt;/octave&gt;'));
assert.ok(vm.runInContext('staffTrainerSVG("C2","bass")',sandbox).includes('&lt;sign&gt;F&lt;/sign&gt;'));
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
