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
assert.match(app,/CrescendoPractice\.sequence\(phrase,\{clef,meter,labels:true\}\)/,'La frase y el compás se delegan al motor');
assert.doesNotMatch(app,/<ellipse|const stem = \x60<line/,'No debe dibujar cabezas ni plicas manualmente');
global.window={};require('../shared/music-practice.js');
const xml=window.CrescendoPractice.sequence([{note:'C4',beats:2,bar:0},{note:'D4',beats:2,bar:0}],{meter:'4/4'});
assert.ok(xml.includes('&lt;beats&gt;4&lt;/beats&gt;&lt;beat-type&gt;4&lt;/beat-type&gt;'));
assert.ok(xml.includes('&lt;type&gt;half&lt;/type&gt;'));
assert.ok(xml.includes('&lt;step&gt;C&lt;/step&gt;'));
console.log("Fase 4: solfeo melódico, rítmico y contorno interactivo OK.");
