const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname, '../editor-crescendo/src/app.js'), 'utf8');
function fixture() {
  const timers = new Map(); let id = 0;
  const indicator = { textContent: '', classList: { toggle() {} }, setAttribute() {} };
  const c = { state: { marks: [], playbackBpm: 140, midiPlayback: {}, meter: { top: 4, bottom: 4 } }, EPSILON: 1e-6,
    DEFAULT_PLAYBACK_BPM: 140, selected: [], tick: 0, history: 0, clicks: [],
    selectedTempoMarks: () => c.selected, selectedEntryLocations: () => [c.tick], selectedNoteLocations: () => [],
    absoluteTickForLocation: x => x, absoluteTickForMark: m => m.tick, playbackSelectedItemAbsoluteTick: () => c.tick,
    tempoMarkBpm: m => Number(m.value), tempoUnitTicks: (u,d) => ({ quarter:4,eighth:2,half:8 }[u]) * (d ? 1.5 : 1),
    saveHistory: () => c.history++, render() {}, stopMidiPlayback() {}, playbackBpmInput: { value: '' },
    document: { activeElement: null, dispatchEvent() {}, querySelectorAll: () => [indicator] }, CustomEvent: class {},
    window: { setTimeout(fn,delay) { const key=++id; timers.set(key,{fn:()=>{timers.delete(key);fn();},delay}); return key; }, clearTimeout(n) { timers.delete(n); } },
    meterForMeasureIndex: () => c.state.meter, metronomeButton: null };
  vm.createContext(c);
  vm.runInContext(source.slice(source.indexOf('  function normalizePlaybackBpm('), source.indexOf('  function normalizeJazzSwingPreset(')) + source.slice(source.indexOf('  const editorMetronome ='), source.indexOf('  function playbackSelectedItemAbsoluteTick(')) + '\nglobalThis.metro = editorMetronome; soundEditorMetronomeClick = (time,accent) => clicks.push({time,accent});',c);
  return { c,timers,indicator };
}
test('tempo follows the selected position and explicit tempo mark; edits preserve notation unit', () => {
  const {c} = fixture(); const first = {type:'tempo',tick:0,value:'90',unitDurationId:'quarter',dots:1};
  const second = {type:'tempo',tick:16,value:'120'}; c.state.marks = [first,second];
  assert.equal(c.editorScoreTempo().bpm,90); assert.equal(c.editorScoreTempo().unitTicks,6);
  c.tick=20; assert.equal(c.editorScoreTempo().bpm,120);
  c.selected=[first]; assert.equal(c.editorScoreTempo().bpm,90);
  c.setPlaybackBpm(96); assert.equal(first.value,'96'); assert.equal(first.dots,1); assert.equal(c.state.playbackBpm,140); assert.equal(c.history,1);
  c.setPlaybackBpm(''); c.setPlaybackBpm('invalid'); c.setPlaybackBpm(96); assert.equal(c.history,1);
  c.state.marks=[]; c.selected=[]; c.setPlaybackBpm(110); assert.equal(c.state.playbackBpm,110);
});
test('clicks and indicators follow score tempo, meter and note duration; stop cancels pending work', () => {
  const {c,timers,indicator}=fixture(); c.state.playbackBpm=120;
  c.metro.active=true; c.metro.context={currentTime:0}; c.metro.nextTime=.04;
  c.scheduleEditorMetronome(); assert.equal(c.metro.nextTime,.54); assert.equal(c.clicks[0].accent,true);
  const visual=[...timers.values()].find(t=>t.delay===40); assert.ok(visual); visual.fn(); assert.equal(indicator.textContent,'1');
  c.state.meter={top:6,bottom:8}; c.state.marks=[{type:'tempo',tick:0,value:'60',unitDurationId:'quarter',dots:1}];
  c.metro.context.currentTime=.54; timers.get(c.metro.timer).fn(); assert.ok(Math.abs(c.metro.nextTime-(.54+1/3))<1e-9);
  let stopped=false; c.metro.nodes.add({stop(){stopped=true;}});
  c.stopEditorMetronome(); assert.equal(stopped,true); assert.equal(timers.size,0);
  assert.equal(c.metro.visualTimers.size,0); assert.equal(indicator.textContent,'—');
  visual.fn(); assert.equal(indicator.textContent,'—');
});
test('stop during suspended audio startup does not restart the metronome', async () => {
  const {c,timers}=fixture(); let resume;
  c.window.AudioContext=class { constructor(){this.state='suspended';this.currentTime=0;} resume(){return new Promise(r=>resume=r);} };
  const start=c.toggleEditorMetronome(); c.stopEditorMetronome(); resume(); await start;
  assert.equal(c.metro.active,false); assert.equal(timers.size,0); assert.equal(c.clicks.length,0);
});
