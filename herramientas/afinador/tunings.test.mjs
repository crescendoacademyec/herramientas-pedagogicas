import {test} from 'node:test';
import assert from 'node:assert/strict';
import {TUNINGS, getTuning, tuningTargets, noteTarget} from './tunings.mjs';
test('cada afinación conserva las cuerdas y frecuencias dentro del detector', () => {
  for(const [instrument, presets] of Object.entries(TUNINGS)){
    assert.equal(new Set(presets.map(p=>p.id)).size,presets.length);
    for(const preset of presets){
      const targets=tuningTargets(instrument,preset.id);
      assert.equal(targets.length,presets[0].notes.length);
      assert.deepEqual(targets.map(t=>t.note+t.oct).sort(),[...preset.notes].sort());
      for(const t of targets) assert.ok(t.freq>20 && t.freq<1800);
    }
  }
});
test('Neon y EADEBE cambian la cuerda correcta del clavijero', () => {
  assert.deepEqual(tuningTargets('guitarra','neon').map(t=>t.note+t.oct),['D3','A2','C2','G3','B3','E4']);
  assert.deepEqual(tuningTargets('guitarra','eadebe').map(t=>t.note+t.oct),['D3','A2','E2','E3','B3','E4']);
  assert.ok(Math.abs(tuningTargets('guitarra','neon')[2].freq-65.4064)<.001);
});
test('Drop C no se confunde con bajar solamente la sexta',()=>{
  assert.deepEqual(getTuning('guitarra','drop-c').notes,['C2','G2','C3','F3','A3','D4']);
  assert.deepEqual(getTuning('bajo','drop-c').notes,['C1','G1','C2','F2']);
});
test('ukelele reentrante y low G mantienen la cuerda física',()=>{
  const high=tuningTargets('ukelele','standard'),low=tuningTargets('ukelele','low-g');
  assert.equal(high[1].freq,low[1].freq*2);
  assert.deepEqual(high.filter((_,i)=>i!==1),low.filter((_,i)=>i!==1));
});
test('cello Bach baja la primera un tono; requinto mantiene su registro',()=>{
  assert.deepEqual(tuningTargets('cello','bach-5').map(t=>t.note+t.oct),['G2','C2','D3','G3']);
  assert.deepEqual(getTuning('requinto','standard').notes,['A2','D3','G3','C4','E4','A4']);
});
test('preferencias obsoletas vuelven a estándar y vocal no tiene cuerdas',()=>{
  for(const key of Object.keys(TUNINGS)) assert.equal(getTuning(key,'invalid').id,'standard');
  assert.equal(getTuning('vocal'),null);
  assert.deepEqual(tuningTargets('vocal'),[]);
  assert.equal(noteTarget('A4').freq,440);
});
