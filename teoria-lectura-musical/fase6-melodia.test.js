const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const app=fs.readFileSync(__dirname+"/app.js","utf8");
const data=fs.readFileSync(__dirname+"/data.js","utf8");
const css=fs.readFileSync(__dirname+"/styles.css","utf8");

assert.match(app,/FASE 6 · MELODÍA/);
[
  "mountMelodyLab",
  "mountMelodyAnalysisTrainer",
  "mountStructuralNotesLab"
].forEach(fn=>assert.ok(app.includes(`function ${fn}`),`Falta ${fn}`));
["Motivo y frase","Contorno melódico","Grados conjuntos y saltos","Repetición y secuencia","Notas estructurales y notas de paso","De melodía a armonía"]
  .forEach(term=>assert.ok(data.includes(term),`Falta contenido ${term}`));
assert.match(css,/FASE 6 · MELODÍA/);

const context={window:{}};context.window=context;vm.createContext(context);
vm.runInContext(data,context);
const finalLevel=context.TLM_DATA.levels.find(x=>x.id==="puente-armonia");
assert.ok(finalLevel.blocks.length>=9);
console.log("Fase 6: melodía, análisis y puente hacia armonía OK.");
