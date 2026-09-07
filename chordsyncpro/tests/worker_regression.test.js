const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync(require.resolve('../worker.js'), 'utf8');
const start = source.indexOf('function collapseHpcpTo12');
const end = source.indexOf('function probabilityFor', start);
assert.ok(start >= 0 && end > start, 'HPCP functions must be present');

const context = {
  PC_TO_SHARP: ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'],
  clamp: (x, a, b) => Math.max(a, Math.min(b, x)),
  parseChordCore(label) {
    if (!label || label === 'N' || label === 'X') return null;
    const match = /^([A-G])(#|b)?(m)?/.exec(label);
    if (!match) return null;
    const names = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
    let root = names[match[1]] + (match[2] === '#' ? 1 : match[2] === 'b' ? -1 : 0);
    root = (root + 12) % 12;
    return {root, quality:match[3] ? 'minor' : 'major', suffix:match[3] || ''};
  },
};
vm.createContext(context);
vm.runInContext(source.slice(start, end) + '\nthis.build = buildProbabilisticObservations;', context);

const cMajor = [1,0,0,0,1,0,0,1,0,0,0,0];
const gMajor = [0,0,1,0,0,0,0,1,0,0,0,1];
const model = context.build(
  [cMajor, new Array(12).fill(0), gMajor],
  ['C', 'N', 'G'],
  [0.8, 0, 0.8],
);

assert.equal(model.observations.length, 3);
assert.equal(model.observations[1].top, 'N', 'silence must remain at its original frame');
assert.equal(model.observations[1].confidence, 1);
assert.equal(model.observations[2].top, 'G', 'post-silence chroma must not shift in time');
console.log('worker HPCP regression tests: PASS');
