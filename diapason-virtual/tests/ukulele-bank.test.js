const assert=require('node:assert/strict');
const bank=require('../js/ukulele-chords.js');
assert.equal(bank.entries.length,151);
assert.equal(new Set(bank.entries.map(e=>e.id)).size,151);
for(const e of bank.entries){
  assert.equal(e.frets.length,4);
  assert.ok(e.frets.every(f=>f===null||Number.isInteger(f)&&f>=0&&f<=12));
  assert.ok(bank.validate(e),e.name+' contiene notas ajenas al acorde');
  assert.deepEqual(bank.midis(e,true).map(m=>m%12),bank.midis(e).map(m=>m%12));
  assert.deepEqual(bank.midis(e,false,2),bank.midis(e).map(m=>m+2));
}
assert.deepEqual(bank.midis(bank.entries.find(e=>e.name==='C')),[67,60,64,72]);
assert.equal(bank.midis(bank.entries.find(e=>e.name==='G#')).length,3);
const fs=require('node:fs'),path=require('node:path');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert.ok(html.includes('<details id="ukuleleBank" hidden>'));
console.log('151 posturas verificadas · High G/Low G · capo · cuerda silenciada · IDs únicos');
