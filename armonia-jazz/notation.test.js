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
