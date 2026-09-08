const assert = require("node:assert/strict");
const fs = require("node:fs");

const app = fs.readFileSync(__dirname + "/app.js", "utf8");
const css = fs.readFileSync(__dirname + "/styles.css", "utf8");

assert.match(app, /FASE 7 · PEDAGOGÍA VISUAL/);
assert.match(app, /function mountScaleExplorer/);
assert.match(app, /function mountIntervalExplorer/);
assert.match(app, /function mountTonalityLab/);
assert.match(app, /function mountReharmLab/);
assert.match(app, /function mountRegisterLab/);
assert.match(app, /function mountShellLab/);
assert.match(app, /function mountDrop2Lab/);
assert.match(app, /function mountExtensionPlacementLab/);
assert.match(app, /function mountConstructionLab/);
assert.match(app, /function mountBassChordLab/);

[
  "escalas-intervalos",
  "consonancias-disonancias",
  "acordes",
  "tonalidad",
  "rearmonizacion",
  "nivel-2-triadas",
  "nivel-3-shell-voicings",
  "nivel-3-acompanamiento-bajo-acorde"
].forEach(id => assert.ok(app.includes(`"${id}"`), `Falta widget para ${id}`));

assert.match(css, /FASE 7 · PEDAGOGÍA VISUAL/);
assert.match(css, /\.visual-lab-grid/);
assert.match(css, /\.visual-panel-grid-3/);

console.log("Fase 7 visual: estructura de widgets y estilos OK.");
