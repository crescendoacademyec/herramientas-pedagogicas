const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const storage = new Map();
const context = {
  console,
  window: { addEventListener(){}, ChordRef: null },
  document: {
    addEventListener(){},
    getElementById(){ return null; },
    querySelectorAll(){ return []; },
    documentElement: {}
  },
  location: { hash:"", pathname:"/" },
  history: { pushState(){}, replaceState(){}, state:null },
  localStorage: {
    getItem(k){ return storage.has(k) ? storage.get(k) : null; },
    setItem(k,v){ storage.set(k,String(v)); }
  },
  alert(){}, confirm(){ return true; }, setTimeout(){},
  Blob: function(){},
  URL: { createObjectURL(){return "blob:test";}, revokeObjectURL(){} }
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname + "/data.js","utf8"), context);

let source = fs.readFileSync(__dirname + "/app.js","utf8")
  .replace(/document\.addEventListener\("DOMContentLoaded", init\);/, "");
source += `
globalThis.__quizApi = {
  DATA, STATE_SCHEMA_VERSION, defaultState, normalizeStoredState,
  questionCompletion, gradeQuestion,
  setState(value){ state = value; }, getState(){ return state; }
};`;
vm.runInContext(source, context);
const api = context.__quizApi;

assert.equal(api.STATE_SCHEMA_VERSION, 2);
const ds = api.defaultState();
assert.equal(ds.quiz.attemptModuleId, null);
api.setState(ds);
api.getState().moduleId = api.DATA.modules[0].id;

const qSelect = { id:999, type:"selectBlanks", answers:["A","B"], labels:["x","y"] };
api.getState().quiz.answers["q999_0"]="A";
assert.equal(api.questionCompletion(qSelect),"partial");
api.getState().quiz.answers["q999_1"]="B";
assert.equal(api.questionCompletion(qSelect),"complete");

// Critical regression: empty multiple choice with answer index 0 must score zero.
const qMC0 = { id:998, type:"multipleChoice", choices:["Correcta","Otra"], answer:0, prompt:"x", sampleAnswer:"Correcta" };
assert.equal(api.questionCompletion(qMC0),"empty");
let graded = api.gradeQuestion(qMC0);
assert.equal(graded.status,"unanswered");
assert.equal(graded.points,0);

api.getState().quiz.answers["q998"]="0";
graded = api.gradeQuestion(qMC0);
assert.equal(graded.status,"correct");
assert.equal(graded.points,1);

api.getState().quiz.answers["q998"]="1";
graded = api.gradeQuestion(qMC0);
assert.equal(graded.status,"wrong");
assert.equal(graded.points,0);

const normalized = api.normalizeStoredState({
  moduleId: api.DATA.modules[0].id,
  studied: [],
  quiz: { active:"yes", answers:[], student:null, focusWarnings:-7 }
});
assert.deepEqual(Object.keys(normalized.studied),[]);
assert.deepEqual(Object.keys(normalized.quiz.answers),[]);
assert.equal(normalized.quiz.focusWarnings,0);
assert.equal(normalized.schemaVersion,2);

console.log("Quiz engine Fase 2: OK");
