const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const read = p => fs.readFileSync(path.join(__dirname, '..', p), 'utf8');
const functional = read('armonia-funcional/app.js');
const jazz = read('armonia-jazz/app.js');
const theory = read('teoria-lectura-musical/app.js');
assert.match(functional, /nextCourse.hidden=view!=="theory"/);
assert.match(functional, /findIndex\(s=>s.id===activeTheoryId\)!==5/);
assert.match(functional, /prepend\(actions\)/);
assert.match(functional, /view = "all"/);
assert.match(jazz, /if \(!isOpen\) return/);
assert.match(jazz, /prevTopicBtn"\).disabled/);
assert.match(jazz, /nextTopicBtn"\).disabled/);
assert.match(jazz, /delete state.studiedTopics\[lvl.slug/);
assert.match(theory, /prepend\(\$\("lessonContent"\).querySelector\(".lesson-actions"\)\)/);
assert.match(theory, /id="resetCourseBtn"/);
assert.ok(read('armonia-jazz/instrument-lab.js').includes("querySelector('.lab-views').appendChild(host)"));
console.log('Navegación, reinicio acotado, visualizadores y enlace final verificados.');
const actionsCSS=read('shared/course-actions.css');
assert.match(actionsCSS,/position: fixed/);
assert.match(actionsCSS,/backdrop-filter: none/);
assert.match(actionsCSS,/safe-area-inset-bottom/);
assert.match(actionsCSS,/repeat\(2, minmax\(0, 1fr\)\)/);
assert.match(actionsCSS,/@media print/);
for(const app of ['armonia-funcional','armonia-jazz','teoria-lectura-musical']){
  assert.ok(read(app+'/index.html').includes('../shared/course-actions.css'));
}
console.log('Barra fija compartida, espacio inferior y estilos móviles/impresión verificados.');
