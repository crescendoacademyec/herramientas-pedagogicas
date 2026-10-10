const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/app.js','utf8');
const ctx={};ctx.window=ctx;vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname+'/chords-ref.js','utf8'),ctx);
for(const name of ['THEORY_VISUAL_NATURAL_LETTERS','THEORY_VISUAL_NATURAL_PC','THEORY_VISUAL_ACC_VAL','THEORY_VISUAL_ACC_SYM','THEORY_VISUAL_DEGREE_BASE','THEORY_VISUAL_SCALE_LIBRARY','THEORY_VISUAL_ROOTS','THEORY_VISUAL_ROMAN_QUALITIES_MAJOR']){
  vm.runInContext(source.match(new RegExp('const '+name+' = [\\s\\S]*?;'))[0],ctx);
}
for(const name of ['theoryRootInfo','theoryDegreeInfo','accidentalSymbol','spellTheoryTone','buildTheoryTones','reharmChord']){
  const start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+1);
  vm.runInContext(source.slice(start,end),ctx);
}
for(const tonic of ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B'])for(const roman of ['I','ii','iii','IV','V','vi','vii°'])for(const sevenths of [false,true]){
  const c=ctx.reharmChord(tonic,roman,sevenths);
  assert.equal(c.tones.length,sevenths?4:3);
  assert.ok(c.tones.every(n=>n.name&&!n.name.includes('?')));
  assert.equal(c.family,['I','iii','vi'].includes(roman)?'Tónica':['ii','IV'].includes(roman)?'Subdominante':'Dominante');
}
assert.equal(ctx.reharmChord('C','V',true).label,'G7');
assert.equal(ctx.reharmChord('C','vii°',true).label,'B-7b5');
assert.doesNotMatch(source,/const _mountReharmLabPhase7/,'No debe quedar el transporte anterior leyendo selectores eliminados');
console.log('Constructor: 168 combinaciones de tónica, función y tríada/séptima correctas.');
