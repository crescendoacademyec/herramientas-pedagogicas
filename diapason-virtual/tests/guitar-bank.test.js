const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const bank=require('../js/guitar-chords.js');
assert.ok(bank.entries.length>=500,'El banco debe ofrecer varias posiciones por familia y fundamental');
assert.equal(new Set(bank.entries.map(e=>e.id)).size,bank.entries.length);
for(const entry of bank.entries){
  assert.equal(entry.frets.length,6);
  assert.ok(bank.validate(entry),entry.name+' contiene notas ajenas al acorde');
  assert.deepEqual(bank.midis(entry,'requinto').map(n=>n%12),bank.midis(entry,'guitar').map(n=>(n+5)%12));
}
assert.ok(bank.entries.some(e=>e.quality==='dim7'));
assert.ok(bank.entries.some(e=>e.quality==='maj9'));
assert.equal(bank.entries[0].name,'C');
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
assert.ok(html.includes('<details id="guitarChordBank" hidden>'));
console.log(bank.entries.length+' posturas verificadas · guitarra/requinto · afinación estándar');
