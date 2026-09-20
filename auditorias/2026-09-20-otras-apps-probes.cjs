// Read-only behavioral probes. Reports discrepancies without changing app code.
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
function fn(source,name,next){const a=source.indexOf('function '+name+'('),b=source.indexOf('function '+next+'(',a);if(a<0||b<a)throw Error(name);return source.slice(a,b).replace(/async\s*$/,'');}
const results=[];
function check(app,scenario,expected,actual){results.push({app,scenario,expected,actual,pass:JSON.stringify(expected)===JSON.stringify(actual)});}
(async()=>{
 const source=read('ear-training/js/audio.js');const c={window:{},console,setTimeout(){}};vm.createContext(c);vm.runInContext(source,c);
 const engine=new c.window.ETAudio.AudioEngine(),clock={currentTime:0},heard=[];let resolve;
 engine.ensureContext=()=>clock;engine.loadInstrument=()=>new Promise(r=>resolve=()=>{engine.player={play:(m,at)=>{heard.push({m,at,now:clock.currentTime});return {stop(){}};}};r();});
 // A shared promise, as in the production loader.
 let pending;const load=engine.loadInstrument;engine.loadInstrument=()=>pending||=(load());
 await engine.playSequence([{notes:[60],start:0,dur:.4},{notes:[62],start:.5,dur:.4}]);
 engine.stopAll();clock.currentTime=5;resolve();await new Promise(setImmediate);
 check('ear-training','Stop during initial sample loading',0,heard.length);
 check('ear-training','Scheduled starts must not already be in the past after cold loading',false,heard.every(n=>n.at<n.now));
 const note=(beats,rest=false)=>({Pitch:rest?null:{halfTone:48},Length:{RealValue:beats/4},isRest:()=>rest});
 for(const app of ['diapason-virtual','bass-virtual','folk-virtual']){
  const src=read(app+'/js/score.js'),code=fn(src,'getCurrentStepData','triggerCurrentStepNotes');
  const ctx={osmd:{cursor:{Iterator:{CurrentVoiceEntries:[{Notes:[note(4,true)]}]}}},SCORE_OCTAVE_OFFSET:{},instrumentSel:{value:'test'},activeInstrument:()=>({writtenTranspose:0}),console};vm.createContext(ctx);vm.runInContext(code,ctx);
  check(app,'Whole rest at 120 BPM, seconds',2,ctx.getCurrentStepData(120).stepSeconds);
 }
 const src=read('piano-virtual/js/tutor.js');const ctx={osmd:{cursor:{Iterator:{CurrentVoiceEntries:[{Notes:[note(4,true)]}]}}},shouldPlayScoreNote:()=>true,scoreNoteHand:()=> 'right',scoreActiveMidis:new Set(),keyElByMidi:{},noteOn(){},noteOff(){},midiToInfo:m=>m,setTimeout(){},console};vm.createContext(ctx);vm.runInContext(fn(src,'triggerCurrentStepNotes','scheduleScoreStep'),ctx);
 check('piano-virtual','Whole rest at 120 BPM, seconds',2,ctx.triggerCurrentStepNotes(120));
 ctx.osmd.cursor.Iterator.CurrentVoiceEntries=[{Notes:[note(1)]}];ctx.shouldPlayScoreNote=()=>false;
 check('piano-virtual','Filtering a hand must preserve one-quarter timing at 120 BPM',.5,ctx.triggerCurrentStepNotes(120));
 const strings={osmd:{cursor:{Iterator:{CurrentVoiceEntries:[{Notes:[note(4,true)]}]}}},scoreMidiToSounding:m=>m,scoreNoteOn(){},scoreNoteOff(){},scoreActiveMidis:new Set(),updateTutorFromPlayback(){},currentStepIndex:0,setTimeout(){},console};vm.createContext(strings);vm.runInContext(fn(read('cuerdas-frotadas/js/app.js'),'triggerCurrentStepNotes','scheduleScoreStep'),strings);
 check('cuerdas-frotadas','Whole rest at 120 BPM, seconds',2,strings.triggerCurrentStepNotes(120));
 const attacks=[];ctx.shouldPlayScoreNote=()=>true;ctx.noteOn=m=>attacks.push(m);
 const tied={...note(1),NoteTie:{StartNote:null}};tied.NoteTie.StartNote={...note(1)};ctx.osmd.cursor.Iterator.CurrentVoiceEntries=[{Notes:[tied]}];ctx.triggerCurrentStepNotes(120);
 check('piano-virtual','Continuation of a tied note must not attack again',0,attacks.length);
 const af=read('afinador/index.html');const t={INSTRUMENTS:{guitarra:{strings:[{freq:146.83},{freq:110},{freq:82.41},{freq:196},{freq:246.94},{freq:329.63}]}},currentInstrumentKey:'guitarra',calibratedFreq:f=>f};vm.createContext(t);vm.runInContext(af.slice(af.indexOf('function centsOffFromTarget('),af.indexOf('const CHROMATIC_SHARPS')),t);
 const frequency=164.82,index=t.closestStringIndex(frequency);
 check('afinador','E2 second harmonic: selected string',2,index);
 check('afinador','E2 second harmonic: cents after harmonic-aware selection',0,Math.round(t.centsOffFromTarget(frequency,t.INSTRUMENTS.guitarra.strings[index].freq)));
 // Editor's active MIDI engine, not the unused legacy playback.js.
 const ed={window:{}};vm.createContext(ed);vm.runInContext(read('editor-crescendo/src/score-editor-midi-playback.js'),ed);
 const tempo=[{absoluteTick:0,bpm:120,unitTicks:4},{absoluteTick:8,bpm:60,unitTicks:4}],api=ed.window.JMLScoreMidiPlayback;
 check('editor-crescendo','Tempo changes: twelve ticks take two seconds',2000,api.msForTick(12,tempo));
 check('editor-crescendo','Inverse time mapping',12,api.tickForMs(2000,tempo));
 const speed=read('speed/index.html');
 const sp={isPlaying:true,audioCtx:{currentTime:1},processedTempo:1,startedOffset:0,startedAt:0,duration:10,loopActive:false,currentTime:1,playIcon:{},stopTimeUpdates(){},disposeSource(){},updateTimeDisplay(){},drawWaveform(){},visibleWindow:()=>({start:0,duration:10}),waveCanvas:{getBoundingClientRect:()=>({left:0,width:100})},startPlayback:at=>sp.restartedAt=at};vm.createContext(sp);
 vm.runInContext(fn(speed,'refreshCurrentTime','stopTimeUpdates')+fn(speed,'pausePlayback','visibleWindow'),sp);
 const begin=speed.indexOf("waveCanvas.addEventListener('click', (e) => {");const body=speed.slice(begin+"waveCanvas.addEventListener('click', (e) => {".length,speed.indexOf('\n            });',begin));
 sp.e={clientX:80};vm.runInContext('(function(){'+body+'})()',sp);
 check('speed','Click at 80% of a 10-second waveform during playback seeks to 8 seconds',8,sp.restartedAt);
 console.log(JSON.stringify(results,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
