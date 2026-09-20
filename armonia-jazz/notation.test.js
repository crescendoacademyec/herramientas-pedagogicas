const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const context={};context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+'/../shared/music-practice.js','utf8'),context);
const source=fs.readFileSync(__dirname+'/instrument-lab.js','utf8');
vm.runInContext(source.replace('global.ChordLab={','global.testBanks={CHORDS,SCALES};global.ChordLab={'),context);
let checked=0;
for(let root=0;root<12;root++)for(const bank of Object.values(context.testBanks))for(const item of Object.values(bank)){
  const notes=context.ChordLab.notationNotes(root,item);
  assert.equal(notes.length,item.intervals.length);
  notes.forEach((note,i)=>{
    assert.equal(note.midi,60+root+item.intervals[i]);
    assert.ok(Number.isInteger(note.diatonic));
    assert.ok(Math.abs(note.alter)<=2,'Alteración fuera de rango');
  });
  const html=context.CrescendoPractice.staff(notes,{stack:true});
  assert.ok(!/NaN|undefined/.test(html));checked++;
}
console.log('Jazz: '+checked+' combinaciones de escala/acorde y tónica verificadas para OSMD.');
// Tuplets can start after ordinary notes, not only at note indices divisible by 3.
const tuplets=context.CrescendoPractice.sequence([{midi:60,beats:1},{midi:62,beats:1/3,kind:'triplet',tuplet:'start'},{midi:64,beats:1/3,kind:'triplet',tuplet:''},{midi:65,beats:1/3,kind:'triplet',tuplet:'stop'},{kind:'rest',beats:2}],{meter:'4/4'});
const xml=tuplets.replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
assert.equal((xml.match(/<tuplet type="start"/g)||[]).length,1);
assert.equal((xml.match(/<tuplet type="stop"/g)||[]).length,1);
assert.match(xml,/<tuplet type="start"\/>[\s\S]*<tuplet type="stop"\/>/);
const improv=require('./improvisation-engine.js');
for(const figure of ['triplet','sextuplet']){
 const rendered=context.CrescendoPractice.sequence(improv.scale('C','triads',{figure}),{meter:'4/4'}).replaceAll('&quot;','"').replaceAll('&lt;','<').replaceAll('&gt;','>');
 assert.match(rendered,new RegExp('<actual-notes>'+(figure==='sextuplet'?6:3)+'</actual-notes>'));
 assert.equal((rendered.match(/<tuplet type="start"/g)||[]).length,(rendered.match(/<tuplet type="stop"/g)||[]).length);
 assert.ok(!/NaN|undefined/.test(rendered));
}
