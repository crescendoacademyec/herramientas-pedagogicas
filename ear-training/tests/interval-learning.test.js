const assert=require('node:assert/strict');
const fs=require('node:fs');
global.window={};
require('../../shared/music-practice.js');
require('../js/data.js');
const D=window.ETData;
const counts=[[5,5],[5,5],[5,5],[5,5],[5,5],[5,5],[3,4],[5,5],[5,4],[5,5],[4,3],[4,1],[5,4]];
const natural=[0,2,4,5,7,9,11];
for(const iv of D.INTERVALS){
  assert.deepEqual([iv.ascRefs.length,iv.descRefs.length],counts[iv.semitones]);
  for(const direction of ['ascending','descending']){
    const e=D.intervalExample(iv.semitones,direction);
    assert.equal(e.notes[0].midi,60);
    assert.equal(e.notes[1].midi,60+(direction==='descending'?-1:1)*iv.semitones);
    e.notes.forEach(n=>assert.equal(n.midi,12*(Math.floor(n.diatonic/7)+1)+natural[n.diatonic%7]+n.alter));
    assert.match(window.CrescendoPractice.sequence(e.notes.map(n=>({...n,beats:1}))),/data-cp-xml/);
  }
}
assert.deepEqual(D.intervalExample(1,'descending').labels,['Do4','Si3']);
assert.deepEqual(D.intervalExample(6,'descending').labels,['Do4','Sol♭3']);
const app=fs.readFileSync(require.resolve('../js/app.js'),'utf8');
assert.ok(app.includes('view.innerHTML=renderIntervalLearning()'));
assert.ok(app.includes('D.intervalExample(Number(semitones),direction)'));
console.log('13 intervalos, 26 pentagramas y listas completas de canciones: verificados.');
for(const ch of D.CHORD_BANK){
  for(const clef of ['treble','bass']){
    const example=D.chordExample(ch.id,clef),midis=example.seq[0].notes;
    assert.deepEqual(midis.map(n=>n-midis[0]),ch.intervals);
    assert.equal(midis[0]%12,0);
    const html=window.CrescendoPractice.review(example);
    assert.ok(html.includes(clef==='bass'?'&lt;sign&gt;F&lt;/sign&gt;':'&lt;sign&gt;G&lt;/sign&gt;'));
  }
}
console.log('52 acordes en ambas claves: registro del audio y disposición conservados.');
