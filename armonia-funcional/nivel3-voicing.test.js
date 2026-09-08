const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = {
  console,
  window:{addEventListener(){},ChordRef:null},
  document:{addEventListener(){},getElementById(){return null;},querySelectorAll(){return[];},documentElement:{}},
  location:{hash:"",pathname:"/"},
  history:{pushState(){},replaceState(){},state:null},
  localStorage:{getItem(){return null;},setItem(){}},
  alert(){},confirm(){return true;},setTimeout(){},
  Blob:function(){},URL:{createObjectURL(){return"";},revokeObjectURL(){}}
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+"/data.js","utf8"),context);

let src=fs.readFileSync(__dirname+"/app.js","utf8")
  .replace(/document\.addEventListener\("DOMContentLoaded", init\);/,"");
src += `
globalThis.__v3 = {
 DATA, gradePianoSelection, pianoQuestionRange
};`;
vm.runInContext(src,context);

const api=context.__v3;
const module3=api.DATA.modules.find(m=>m.id==="nivel-3-principios-voicing");
assert.equal(module3.quiz.length,39,"Nivel 3 debe mantener 39 preguntas activas");

for(const q of module3.quiz){
  assert.equal(q.type,"pianoSelect",`P${q.id}: se esperaba pianoSelect`);
  const accept=q.accept;
  assert.ok(accept,`P${q.id}: falta criterio accept`);
  const branches=accept.mode==="oneOf" ? accept.alternatives : [accept];
  assert.ok(branches.length,`P${q.id}: sin alternativas`);
  for(const branch of branches){
    const score=api.gradePianoSelection({...q,accept:branch},branch.expected).points;
    assert.ok(score>=0.999,`P${q.id}/src${q.sourceId}: ejemplo canónico puntúa ${score}`);
  }
}

const bySource=id=>module3.quiz.find(q=>q.sourceId===id);
const plain=obj=>JSON.parse(JSON.stringify(obj));
assert.deepEqual(plain(api.pianoQuestionRange(bySource(15))),{from:"C3",to:"C6"});
assert.deepEqual(plain(api.pianoQuestionRange(bySource(16))),{from:"C3",to:"C6"});
assert.deepEqual(plain(api.pianoQuestionRange(bySource(49))),{from:"C2",to:"C6"});
assert.deepEqual(plain(api.pianoQuestionRange(bySource(5))),{from:"C1",to:"C7"});

assert.deepEqual(Array.from(bySource(15).answers),["C#4","G#4","B4"]);
assert.deepEqual(Array.from(bySource(16).answers),["B3","F#4"]);

assert.match(bySource(12).sampleAnswer,/Bb2/);
assert.doesNotMatch(bySource(12).sampleAnswer,/A#2/);
assert.match(bySource(14).sampleAnswer,/Db3/);
assert.match(bySource(14).sampleAnswer,/Cb4/);
assert.doesNotMatch(bySource(14).sampleAnswer,/C#3/);

assert.equal(bySource(54).noteLabels["C#4"],"C#4");
assert.deepEqual(Array.from(bySource(54).parserCiphers),["G13(#11)"]);
assert.match(bySource(54).sampleAnswer,/C#4/);
assert.doesNotMatch(bySource(54).sampleAnswer,/Db4/);

const q5=bySource(5);
const wrong=["C2","G3","B3","D4"];
const wrongScore=api.gradePianoSelection(q5,wrong).points;
assert.equal(wrongScore,0,`layout no debe premiar armonía incorrecta: ${wrongScore}`);

console.log("Nivel 3 verificado: 39 preguntas, criterios y rangos OK.");
