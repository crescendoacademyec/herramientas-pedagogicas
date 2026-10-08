const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const fields = {quizScope:{value:"brief"},quizTopic:{value:""}};
const context = {
  console,
  window:{addEventListener(){}},
  document:{addEventListener(){},getElementById(id){return fields[id] || null;},querySelectorAll(){return[]},documentElement:{}},
  location:{hash:"",pathname:"/"},history:{state:null},
  localStorage:{getItem(){return null},setItem(){}},
  alert(){},confirm(){return true}
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+"/data.js","utf8"),context);
const source=fs.readFileSync(__dirname+"/app.js","utf8").replace(/document\.addEventListener\("DOMContentLoaded", init\);/,"");
vm.runInContext(source+`\nglobalThis.audit={DATA,defaultState,normalizeStoredState,selectedQuizQuestions,moduleQuiz,setState(value){state=value}};`,context);
const {DATA,defaultState,normalizeStoredState,selectedQuizQuestions,moduleQuiz,setState}=context.audit;
assert.deepEqual(Array.from(DATA.modules,module=>module.title),[
  "Conocimientos esenciales",
  "Armonía diatónica y progresiones",
  "Cifrado de acordes y extensiones",
  "Principios de voicing",
  "Conexiones funcionales y preparación para jazz"
]);
assert.ok(DATA.modules[0].theory.every(topic=>topic.id!=="rearmonizacion" && topic.id!=="enlace-voces"));
assert.ok(DATA.modules[4].theory.some(topic=>topic.id==="rearmonizacion"));
assert.ok(DATA.modules[4].theory.some(topic=>topic.id==="nivel-4-puente-jazz"));

const state=defaultState();
state.moduleId=DATA.modules[2].id;
setState(state);
assert.equal(selectedQuizQuestions().length,10);
fields.quizScope.value="topic";
fields.quizTopic.value=DATA.modules[2].quiz[0].section;
assert.ok(selectedQuizQuestions().every(question=>question.section===fields.quizTopic.value));
fields.quizScope.value="full";
assert.equal(selectedQuizQuestions().length,DATA.modules[2].quiz.length);

const previous=normalizeStoredState({schemaVersion:2,moduleId:DATA.modules[0].id,quiz:{active:true,answers:{q1:"0"}}});
assert.equal(previous.quiz.questionSnapshot.length,64);
setState(previous);
assert.equal(moduleQuiz().length,64);
console.log("Secuencia, modos de evaluación y migración de intento activo verificados.");
