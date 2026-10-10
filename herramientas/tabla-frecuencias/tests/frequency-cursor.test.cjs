const {test} = require('node:test');
const assert = require('node:assert/strict');
const {frequencyAtPosition} = require('../frequency-cursor.js').FrequencyCursor;
test('cursor follows logarithmic ticks and excludes the instrument label column', () => {
  for(const width of [220,720,1400]) for(const f of [20,50,75,80,100,1000,10000,20000]) {
    const left=168,x=left+Math.log10(f/20)/3*width;
    assert.ok(Math.abs(frequencyAtPosition(x,left,width)-f)<1e-7);
  }
  assert.equal(frequencyAtPosition(-1,100,200),20);
  assert.equal(frequencyAtPosition(400,100,200),20000);
  assert.equal(frequencyAtPosition(100,100,0),null);
});
