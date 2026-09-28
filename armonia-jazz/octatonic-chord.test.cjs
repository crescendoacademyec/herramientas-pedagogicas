const {test}=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm'),fs=require('node:fs');
const context={window:{}};
vm.runInNewContext(fs.readFileSync(__dirname+'/chords-ref.js','utf8'),context);
const api=context.window.ChordRef;
test('las doce transposiciones conservan bajo y segunda inversión',()=>{
  for(let root=0;root<12;root++){
    const chord=api.octatonicChord(root);
    assert.deepEqual(Array.from(chord.midis,n=>n-chord.midis[0]),[0,6,11,15]);
    assert.equal(chord.midis[0]%12,(root+1)%12);
    assert.equal(chord.midis[2]%12,root);
  }
  assert.deepEqual(Array.from(api.octatonicChord(10).midis),[47,53,58,62]);
});
test('cada digitación produce las cuatro voces en orden y con extensión razonable',()=>{
  for(let root=0;root<12;root++){
    const chord=api.octatonicChord(root),shape=api.octatonicGuitar(root);
    assert.ok(shape);
    shape.strings.forEach((s,i)=>{
      assert.equal([40,45,50,55,59,64][s]+shape.frets[i],shape.midis[i]);
      assert.equal(shape.midis[i]%12,chord.midis[i]%12);
      if(i) assert.ok(shape.midis[i]>shape.midis[i-1]);
    });
    const pressed=shape.frets.filter(f=>f>0);
    assert.ok(Math.max(...pressed)-Math.min(...pressed)<=4);
    assert.match(api.renderOctatonicChord(root),/Fundamental de la tríada/);
  }
});
