const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const app=fs.readFileSync(__dirname+"/app.js","utf8");
const dataText=fs.readFileSync(__dirname+"/data.js","utf8");
const css=fs.readFileSync(__dirname+"/styles.css","utf8");

assert.match(app,/FASE 5 · RITMO AVANZADO/);
assert.match(app,/mountAdvancedRhythmLab/);
assert.match(app,/playAdvancedRhythmExample/);
assert.match(app,/ADV_RHYTHM_QUIZ/);
assert.match(app,/6\/8/);
assert.match(css,/FASE 5 · RITMO AVANZADO/);

["Silencios","Puntillo","Ligadura de prolongación","Síncopa y contratiempo","Tresillo","Compases compuestos"]
  .forEach(term=>assert.ok(dataText.includes(term),`Falta contenido: ${term}`));

const context={window:{}};context.window=context;vm.createContext(context);
vm.runInContext(dataText,context);
const rhythm=context.TLM_DATA.levels.find(x=>x.id==="ritmo");
assert.ok(rhythm);
assert.ok(rhythm.blocks.length>=9);
console.log("Fase 5: ritmo avanzado, 6/8 y práctica interactiva OK.");
