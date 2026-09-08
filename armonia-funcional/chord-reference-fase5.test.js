const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");

const context={window:{},console};
context.window=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync(__dirname+"/chords-ref.js","utf8"),context);

const ref=context.ChordRef;
assert.ok(ref);
assert.equal(ref.CHORD_TYPES.length,52);
assert.equal(ref.ROOTS.length,12);

let combinations=0;
for(const rootName of ref.ROOTS){
  const root=ref.rootInfo(rootName);
  for(const type of ref.CHORD_TYPES){
    const tones=ref.chordTones(root,type.formula);
    const name=rootName+type.symbol;
    const piano=ref.pianoSVG(root,tones,name);
    const guitar=ref.guitarSVG(root,tones,name);
    const staff=ref.staffSVG(root,tones,name);
    assert.match(piano,/role="img"/);
    assert.match(guitar,/role="img"/);
    assert.match(staff,/role="img"/);
    assert.ok(piano.includes(name.replace(/&/g,"&amp;")) || piano.includes(name));
    assert.ok(guitar.includes("Guitarra"));
    assert.ok(staff.includes("Pentagrama"));
    combinations++;
  }
}

// Regression: black-key roots must also receive root styling on piano.
const db=ref.rootInfo("D♭");
const dbMajor=ref.CHORD_TYPES.find(x=>x.symbol===""&&x.cat==="Triadas");
const dbTones=ref.chordTones(db,dbMajor.formula);
const dbPiano=ref.pianoSVG(db,dbTones,"D♭");
assert.match(dbPiano,/jz-key-b jz-key-on jz-key-root/);

// Spelling extremes.
function names(rootName,symbol){
  const root=ref.rootInfo(rootName);
  const type=ref.CHORD_TYPES.find(x=>x.symbol===symbol);
  return ref.chordTones(root,type.formula).map(x=>x.name);
}
assert.deepEqual(Array.from(names("D♭","-7b5")),["D♭","F♭","A♭♭","C♭"]);
assert.deepEqual(Array.from(names("G♭","maj7")),["G♭","B♭","D♭","F"]);
assert.deepEqual(Array.from(names("B","maj7")),["B","D♯","F♯","A♯"]);

console.log(`Referencia Fase 5 verificada: ${combinations} combinaciones + accesibilidad + spelling.`);
