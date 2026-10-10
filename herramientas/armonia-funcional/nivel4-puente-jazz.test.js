const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const context = { window: {}, console };
context.window = context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname + "/data.js", "utf8"), context);

const module4 = context.APP_DATA.modules.find(item => item.id === "nivel-4-armonia-diatonica-progresiones");
assert.ok(module4, "Falta el Nivel 4");
assert.equal(module4.theory.length, 6);
assert.equal(module4.quiz.length, 18);

const expected = [
  "nivel-4-campo-armonico-mayor",
  "nivel-4-progresiones-cadencias",
  "nivel-4-ciclo-ritmo-armonico",
  "nivel-4-inversiones-bajos",
  "nivel-4-tonalidad-menor-funcional",
  "nivel-4-puente-jazz"
];
assert.deepEqual(Array.from(module4.theory, item => item.id), expected);

const app = fs.readFileSync(__dirname + "/app.js", "utf8");
assert.match(app, /FUNCTIONAL_BRIDGE_FAMILIES/);
assert.match(app, /function mountFunctionalBridgeLab/);
assert.match(app, /iiø7/);
expected.forEach(id => assert.ok(app.includes(`"${id}"`), `Falta laboratorio para ${id}`));

console.log("Nivel 4 verificado: cinco refuerzos y puente hacia armonía jazz OK.");
