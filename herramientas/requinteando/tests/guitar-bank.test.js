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
const html=fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8');
assert.ok(html.includes('<details id="guitarChordBank" hidden>'));
assert.ok(html.includes('<details id="requintoChordBank" hidden>'));
const ui=fs.readFileSync(path.join(__dirname,'../js/guitar-bank-ui.js'),'utf8');
assert.match(ui,/1 índice · 2 medio · 3 anular · 4 meñique/);
assert.match(ui,/finger=Math\.min\(4,Math\.max\(1,f-start\+1\)\)/);
assert.match(ui,/rootOffset:5/);
assert.match(ui,/Ver en el diapasón/);
assert.match(ui,/applySelection\(e,\[i\]\)/);
assert.match(ui,/const step=380/);
assert.match(ui,/function syncBankVisibility\(\)/);
assert.equal(['C','C#','D','D#','E','F'][(bank.roots.C+5)%12],'F','C de guitarra debe nombrarse F en requinto');
console.log(bank.entries.length+' posturas verificadas · guitarra/requinto · afinación estándar');
