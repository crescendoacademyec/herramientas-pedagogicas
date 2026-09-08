const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const app=fs.readFileSync(__dirname+"/app.js","utf8");
const css=fs.readFileSync(__dirname+"/styles.css","utf8");
[
  "mountNoteTrainer",
  "mountRhythmTrainer",
  "mountIntervalTrainer",
  "mountScaleTrainer",
  "mountKeyTrainer"
].forEach(fn=>assert.ok(app.includes(`function ${fn}`),`Falta ${fn}`));
assert.match(app,/FASE 3 · ENTRENADOR DE LECTURA/);
assert.match(css,/FASE 3 · ENTRENADORES/);
const context={window:{}};context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+"/data.js","utf8"),context);
assert.ok(context.TLM_DATA.levels.length>=7);
console.log("Fase 3: entrenadores de lectura, ritmo, intervalos, escalas y tonalidad OK.");
