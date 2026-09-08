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

let source=fs.readFileSync(__dirname+"/app.js","utf8")
  .replace(/document\.addEventListener\("DOMContentLoaded", init\);/,"");
source += `globalThis.__audit={DATA};`;
vm.runInContext(source,context);

const DATA=context.__audit.DATA;
const n1=DATA.modules.find(m=>m.id==="nivel-1-armonia-funcional");
const n2=DATA.modules.find(m=>m.id==="nivel-2-cifrado-acordes-extensiones");
assert.ok(n1 && n2);

assert.equal(n1.theory.length,6,"Nivel 1 debe conservar 6 temas");
assert.equal(n1.quiz.length,64,"Nivel 1 debe conservar 64 preguntas");
assert.equal(n2.theory.length,12,"Nivel 2 debe conservar 12 temas");
assert.equal(n2.quiz.length,126,"Nivel 2 debe conservar 126 preguntas");

// Every quiz item must have a prompt and sample answer.
for (const module of [n1,n2]) {
  for (const q of module.quiz) {
    assert.ok(String(q.prompt||"").trim(), `${module.level} P${q.id}: falta prompt`);
    assert.ok(String(q.sampleAnswer||"").trim(), `${module.level} P${q.id}: falta sampleAnswer`);
  }
}

// Every theory item must have term/body.
for (const module of [n1,n2]) {
  for (const section of module.theory) {
    assert.ok(String(section.title||"").trim());
    for (const item of section.items || []) {
      assert.ok(String(item.term||"").trim(), `${section.id}: term vacío`);
      assert.ok(String(item.body||"").trim(), `${section.id}/${item.term}: body vacío`);
    }
  }
}

// Pedagogical clarifications must be present.
const allBodies=[...n1.theory,...n2.theory]
  .flatMap(s=>(s.items||[]).map(i=>i.body))
  .join("\n");
assert.match(allBodies,/método de este curso/i);
assert.match(allBodies,/no reglas universales/i);
assert.match(allBodies,/depende del instrumento, el estilo y el efecto buscado/i);

console.log("Niveles 1 y 2 verificados: estructura y aclaraciones pedagógicas OK.");
