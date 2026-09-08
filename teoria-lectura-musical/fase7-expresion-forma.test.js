const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const app=fs.readFileSync(__dirname+"/app.js","utf8");
const data=fs.readFileSync(__dirname+"/data.js","utf8");
const css=fs.readFileSync(__dirname+"/styles.css","utf8");
const html=fs.readFileSync(__dirname+"/index.html","utf8");

assert.match(app,/FASE 7 · EXPRESIÓN, TEXTURA Y FORMA/);
assert.ok(app.includes("function mountExpressionFormLab"));
assert.ok(app.includes("function mountExpressionTrainer"));
["Dinámica","Articulación","Tempo y carácter","Timbre","Textura","Forma"]
  .forEach(term=>assert.ok(data.includes(term),`Falta ${term}`));
assert.match(css,/FASE 7 · EXPRESIÓN, TEXTURA Y FORMA/);
assert.ok(html.includes("Ocho niveles conectados"));

const context={window:{}};context.window=context;vm.createContext(context);
vm.runInContext(data,context);
assert.equal(context.TLM_DATA.levels.length,8);
assert.ok(context.TLM_DATA.levels.some(x=>x.id==="expresion-forma"));
console.log("Fase 7: expresión, textura, forma y 8 niveles OK.");
