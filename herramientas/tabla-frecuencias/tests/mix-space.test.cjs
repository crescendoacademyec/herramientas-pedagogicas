const {test}=require('node:test');
const assert=require('node:assert/strict');
const {project,geometry}=require('../mix-space.js');
const {presets}=require('../mix-presets.js');
test('three axes have distinct directions and exact endpoint projections',()=>{
const origin=project(-100,0,0);assert.deepEqual(origin,{x:120,y:465});
assert.deepEqual(project(100,0,0),{x:630,y:465});
assert.deepEqual(project(-100,100,0),{x:120,y:165});
assert.deepEqual(project(-100,0,100),{x:205,y:370});
});
test('all catalog figures remain inside the viewport and visual size does not move their center',()=>{
for(const preset of Object.values(presets))for(const t of preset.tracks){const g=geometry(t);assert.ok(g.x-g.rx>0&&g.x+g.rx<800&&g.y-g.ry>0&&g.y+g.ry<570);const changed=geometry({...t,width:100,level:100});assert.equal(g.x,changed.x);assert.equal(g.y,changed.y);}
});
