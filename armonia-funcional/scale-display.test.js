const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/app.js','utf8');
const ctx={};vm.createContext(ctx);
for(const name of ['PIANO_NOTE_NAMES','THEORY_VISUAL_NATURAL_LETTERS','THEORY_VISUAL_NATURAL_PC','THEORY_VISUAL_ACC_VAL','THEORY_VISUAL_ACC_SYM','THEORY_VISUAL_DEGREE_BASE','THEORY_VISUAL_SCALE_LIBRARY','THEORY_VISUAL_ROOTS']){
  vm.runInContext(source.match(new RegExp('const '+name+' = [\\s\\S]*?;'))[0],ctx);
}
for(const name of ['theoryRootInfo','theoryDegreeInfo','accidentalSymbol','spellTheoryTone','buildTheoryTones','theoryRootMidi','midiToSharpNote','scalePianoDiagram','scaleDegreeRoman','noteStep','buildPianoNotes']){
  const start=source.indexOf('function '+name+'('),end=source.indexOf('\nfunction ',start+1);
  vm.runInContext(source.slice(start,end),ctx);
}
vm.runInContext(`
for(const root of THEORY_VISUAL_ROOTS)for(const scale of THEORY_VISUAL_SCALE_LIBRARY){
  const diagram=scalePianoDiagram(root.value,scale);
  const visible=new Set(buildPianoNotes(diagram.range.from,diagram.range.to).map(n=>n.note));
  if(!Object.keys(diagram.keys).every(k=>visible.has(k)))throw Error('Nota fuera del teclado visible');
  if(Object.keys(diagram.keys).length!==scale.tokens.length)throw Error('Faltan notas');
}`,ctx);
assert.equal(vm.runInContext('scaleDegreeRoman("b3")',ctx),'♭III');
assert.equal(vm.runInContext('scaleDegreeRoman("#4")',ctx),'♯IV');
assert.equal(vm.runInContext('scaleDegreeRoman("8")',ctx),'I');
assert.match(source,/const range = diagram.range \|\| fullPianoRange\(\)/);
console.log('132 escalas/tonalidades: notas dentro del registro visible y grados romanos correctos.');
