const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

const html=fs.readFileSync(__dirname+"/index.html","utf8");
const css=fs.readFileSync(__dirname+"/styles.css","utf8");

assert.ok(!html.includes("armonia-funcional-esencial"));
assert.ok(!html.includes("chrome-extension://"));
assert.ok(!css.includes("armonia.jpg"));
assert.match(html,/class="skip-link"/);
assert.match(html,/id="mainContent"/);
assert.match(css,/@media print/);
assert.match(css,/FASE 6 FINAL/);

for(const f of ["styles.css","data.js","chords-ref.js","app.js"]){
  assert.ok(fs.existsSync(__dirname+"/"+f),`Falta ${f}`);
}

const context={window:{},console};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+"/data.js","utf8"),context);
const raw=context.APP_DATA;
assert.ok(raw);
assert.equal(raw.modules.length,3);
assert.equal(raw.modules[0].quiz.length,64);
assert.equal(raw.modules[1].quiz.length,126);
assert.ok(raw.modules[2].quiz.length>=39);

// El conteo activo exacto de Nivel 3 se valida en nivel3-voicing.test.js,
// porque la normalización pertenece a app.js y no al data.js bruto.
console.log("Cierre Fase 6: publicación, estructura y dependencias OK.");
