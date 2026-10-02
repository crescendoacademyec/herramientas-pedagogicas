const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

const app=fs.readFileSync(__dirname+"/app.js","utf8");
const css=fs.readFileSync(__dirname+"/styles.css","utf8");
const html=fs.readFileSync(__dirname+"/index.html","utf8");
const data=fs.readFileSync(__dirname+"/data.js","utf8");

assert.match(app,/FASE 8 · EVALUACIÓN GLOBAL Y CIERRE/);
assert.match(app,/DIAGNOSTIC_QUESTIONS/);
assert.match(app,/FINAL_EVAL_QUESTIONS/);
assert.match(app,/BADGE_DEFINITIONS/);
assert.match(app,/function startEvaluation/);
assert.match(app,/function renderDetailedProgress/);
assert.match(css,/FASE 8 FINAL · EVALUACIÓN, PROGRESO Y ACCESIBILIDAD/);
assert.ok(html.includes('id="evaluacionView"'));
assert.ok(html.includes('data-view="evaluacion"'));
assert.ok(html.includes('id="badgeGrid"'));
assert.match(app,/allCourseLevels\(\)/,'El progreso debe incluir los tres niveles del curso');
assert.match(app,/function generateTrackNotes/,'Los niveles aplicados deben crear frases nuevas');
assert.match(app,/function generatedTrackQuestion/,'Las comprobaciones avanzadas deben rotar situaciones');
assert.match(app,/data-track-new/,'Cada práctica aplicada debe permitir generar otro ejercicio');
assert.match(app,/function renderTrackExtension/,'Los niveles 2 y 3 deben incluir estrategia de estudio explícita');
assert.match(app,/LECTURA GUIADA · GENERADA/,'Armaduras y métrica deben incluir un pentagrama generado');
assert.match(app,/function keySignaturePracticeHTML/,'Armaduras debe mostrar la firma tonal, no una frase genérica');
assert.match(app,/Nueva armadura/,'La práctica de armaduras debe generar nuevas firmas tonales');

const context={window:{}};context.window=context;vm.createContext(context);
vm.runInContext(data,context);
assert.equal(context.TLM_DATA.levels.length,8);
console.log("Fase 8 final: diagnóstico, evaluación, progreso e insignias OK.");
