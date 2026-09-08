const assert=require("node:assert/strict");
const fs=require("node:fs");
const app=fs.readFileSync(__dirname+"/app.js","utf8");
const css=fs.readFileSync(__dirname+"/styles.css","utf8");
[
  "renderSolfege",
  "mountSolfege",
  "mountMelodySolfege",
  "mountRhythmSolfege",
  "mountContourSolfege",
  "phraseStaffSVG",
  "playPhrase"
].forEach(fn=>assert.ok(app.includes(`function ${fn}`),`Falta ${fn}`));
assert.match(app,/FASE 4 · SOLFEO INTERACTIVO/);
assert.match(css,/FASE 4 · SOLFEO INTERACTIVO/);
assert.match(app,/data-sol-note-index/);
assert.match(app,/2 a 4 compases|2–4 compases|2 a 4/);
console.log("Fase 4: solfeo melódico, rítmico y contorno interactivo OK.");
