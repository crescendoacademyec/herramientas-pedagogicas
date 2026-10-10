const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const dataSource = fs.readFileSync(__dirname + "/data.js", "utf8");
const context = {};
vm.createContext(context);
vm.runInContext(dataSource + ";this.__levels=LEVELS", context);

assert.equal(context.__levels.length, 5);
assert.deepEqual(Array.from(context.__levels, level => level.topics.length), [15, 15, 17, 17, 13]);
assert.deepEqual(Array.from(context.__levels, level => level.quiz.length), [20, 19, 20, 24, 31]);
context.__levels.forEach(level => {
  assert.equal(level.topics[0].curriculumRole, "entry", `Falta diagnóstico en Nivel ${level.id}`);
  assert.equal(level.topics.at(-1).curriculumRole, "project", `Falta proyecto aplicado en Nivel ${level.id}`);
});

const level5 = context.__levels[4];
const requiredLevel5 = ["Pentatónicas", "Swing", "bebop", "guide tones", "motívico", "ii–V–I", "outside", "Entrenamiento auditivo", "Glosario", "Referencia rápida", "Walking bass"];
requiredLevel5.forEach(term => assert.ok(level5.topics.some(topic => topic.title.includes(term)), `Falta ${term}`));

const app = fs.readFileSync(__dirname + "/app.js", "utf8");
const visuals = fs.readFileSync(__dirname + "/theory-visuals.js", "utf8");
const html = fs.readFileSync(__dirname + "/index.html", "utf8");
[
  "harmonicRhythm", "melodyHarmony", "melodicModes", "tonalCenters",
  "scaleSubstitution", "melodyReharm", "triadPairs", "topVoiceOstinato",
  "pentatonicLab", "swingMap", "bebopLine", "guideToneLine", "motiveLab",
  "iiVImprovisation", "outsideLab", "earPath", "jazzTerms", "symmetricFamilies"
].forEach(key => {
  assert.ok(app.includes(`"${key}"`), `Falta mapeo visual ${key}`);
  assert.ok(visuals.includes(`VISUALS.${key}`), `Falta implementación visual ${key}`);
});
assert.match(visuals, /acoustic_grand_piano/);
assert.match(visuals, /function renderSequence/);
assert.match(html, /soundfont-player@0\.12\.0/);
assert.match(html, /Ruta paralela desde el Nivel 1/);
assert.match(app, /renderTopicClosure/);

console.log("Armonía Jazz: refuerzos de niveles 1–4 y Nivel 5 verificados.");
