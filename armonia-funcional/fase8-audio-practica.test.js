const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync(__dirname + "/app.js", "utf8");
const css = fs.readFileSync(__dirname + "/styles.css", "utf8");

assert.match(app, /FASE 8 · AUDIO \+ PRÁCTICA/);
assert.match(app, /function ensureTheoryAudioContext/);
assert.match(app, /function playTheoryMidi/);
assert.match(app, /function playTheorySequence/);
assert.match(app, /function renderTopicPractice/);
assert.match(app, /function mountTopicPractices/);
assert.match(app, /data-practice-choice/);
assert.match(app, /Construir paso a paso/);
assert.match(app, /AudioContext/);
assert.match(css, /FASE 8 · AUDIO \+ PRÁCTICA/);
assert.match(css, /\.practice-option/);
assert.match(css, /\.audio-active/);
assert.match(css, /\.construction-step\.build-active/);

const expectedTopics = [
  "escalas-intervalos",
  "consonancias-disonancias",
  "acordes",
  "enlace-voces",
  "tonalidad",
  "rearmonizacion",
  "nivel-2-referencia-intervalica",
  "nivel-2-sistema-americano-cifrado",
  "nivel-2-triadas",
  "nivel-2-soportes",
  "nivel-2-septimas",
  "nivel-2-reglas-extensiones",
  "nivel-2-novenas",
  "nivel-2-onceavas",
  "nivel-2-treceavas",
  "nivel-2-omision-notas",
  "nivel-2-aplicacion",
  "nivel-2-sintesis-reglas",
  "nivel-3-registros-zonas",
  "nivel-3-shell-voicings",
  "nivel-3-posicion-cerrada-skip-2",
  "nivel-3-registro-grave-extensiones",
  "nivel-3-construccion-acordes-extendidos",
  "nivel-3-acompanamiento-bajo-acorde"
];
expectedTopics.forEach(id => assert.ok(app.includes(`"${id}"`), `Falta práctica para ${id}`));

console.log("Fase 8 verificada: audio, práctica y construcción progresiva OK.");
