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
assert.match(app,/<tspan x=\"\d+\">\$\{smuflTimeDigit\(meterTop\)\}<\/tspan><tspan x=\"\d+\" dy=\"18\">\$\{smuflTimeDigit\(meterBottom\)\}<\/tspan>/,'El compás debe apilar numerador y denominador con cifras SMuFL');
assert.match(app,/gClef:String\.fromCodePoint\(0xE050\)/,'La clave de sol debe usar el glifo SMuFL de Bravura');
assert.match(app,/fClef:String\.fromCodePoint\(0xE062\)/,'La clave de fa debe usar el glifo SMuFL de Bravura');
assert.match(css,/url\(\"\.\.\/editor-crescendo\/assets\/fonts\/Bravura\.otf\"\)/,'Debe reutilizar la fuente Bravura del Editor Crescendo');
assert.doesNotMatch(app,/meter\.replace\(\"\/\", \"\\n\"\)/,'El salto de línea no es válido dentro de text SVG');
assert.match(app,/const stem = `<line/,'La blanca debe conservar su plica');
assert.match(app,/sol-final-barline/,'La frase debe cerrar con barra final');
assert.match(app,/sol-ledger-line/,'Las notas fuera del pentagrama deben dibujar líneas adicionales');
console.log("Fase 4: solfeo melódico, rítmico y contorno interactivo OK.");
