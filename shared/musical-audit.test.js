const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const load=(file,replace)=>{const c={};c.window=c;vm.createContext(c);vm.runInContext(replace(fs.readFileSync(file,'utf8')),c);return c;};
const p=load(__dirname+'/music-practice.js',s=>s.replace('={scales,staff','={scaleNotes,scales,staff')).CrescendoPractice;
for(const root of ['C','Db','D','Eb','E','F','Gb','G','Ab','A','Bb','B','C#'])for(const scale of p.scales){
 const r=p.rootNote(root),notes=p.scaleNotes(r,scale);
 assert.deepEqual(Array.from(notes,n=>n.midi-r.midi),Array.from(scale.steps));
 assert.equal(notes.at(-1).diatonic-notes[0].diatonic,7,scale.id+' closes on tonic letter');
 for(const n of notes)assert.ok(Number.isFinite(n.midi)&&Math.abs(n.alter)<=2,`${root}/${scale.id}`);
}
const j=load(__dirname+'/../armonia-jazz/theory-visuals.js',s=>s.replace('{ mount: mount }','{ mount: mount, suffixIntervals, VISUALS }')).TheoryVisuals;
for(const [suffix,expected] of [['',[0,4,7]],['m7',[0,3,7,10]],['maj7',[0,4,7,11]],['7',[0,4,7,10]],['m7♭5',[0,3,6,10]],['dim7',[0,3,6,9]],['m(maj7)',[0,3,7,11]],['7alt',[0,4,6,10,13,15]]])assert.deepEqual(Array.from(j.suffixIntervals(suffix)),expected);
const v=j.VISUALS;
assert.equal(v.pedal.pedal,true);
assert.deepEqual(Array.from(v.harmonicRhythm.steps,s=>s.beats),[2,2,4]);
for(const i of [1,3])assert.equal((v.coltrane.steps[i].offset-v.coltrane.steps[i+1].offset+12)%12,7,'Dominant must be a fifth above destination');
assert.deepEqual(Array.from(v.topVoiceOstinato.steps,s=>s.top),[4,4,5,5]);
const pair=v.triadPairs.notes.map(n=>n.offset+v.triadPairs.root);assert.deepEqual(Array.from(pair),[2,5,9,4,7,11]);
console.log('Audit: every shared scale/key, chord qualities, altered dominant, pedal, 2–2–4, Coltrane and dorian triad pair OK');
