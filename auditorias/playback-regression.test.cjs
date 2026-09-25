const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const timing=require('../shared/score-playback-timing.js');
function fn(source,name,next){const a=source.indexOf('function '+name+'('),b=source.indexOf('function '+next+'(',a);assert(a>=0&&b>a,name);return source.slice(a,b).replace(/async\s*$/,'');}
let count=0;
function eq(actual,expected,label){assert.deepEqual(actual,expected,label);count++;}
function near(actual,expected,label){assert(Math.abs(actual-expected)<1e-8,label+': '+actual);count++;}
const note=(beats,rest=false)=>({Pitch:rest?null:{halfTone:48},Length:{RealValue:beats/4},isRest:()=>rest});
function iterator(notes){return {CurrentVoiceEntries:[{Notes:notes}]};}
function context(extra={}){const c={ScorePlaybackTiming:timing,console,...extra};vm.createContext(c);return c;}
function timers(){let id=0;const pending=new Map();return {pending,setTimeout:(f,ms)=>{pending.set(++id,{f,ms});return id;},clearTimeout:i=>pending.delete(i)};}
(async()=>{
 for(const app of ['diapason-virtual','bass-virtual','folk-virtual'])for(const file of ['js/score.js','index.html']){
  const src=read(app+'/'+file),heard=[];
  const c=context({osmd:{cursor:{Iterator:iterator([note(4,true)])}},SCORE_OCTAVE_OFFSET:{test:-12},instrumentSel:{value:'test'},activeInstrument:()=>({writtenTranspose:12}),playNote:(m,d)=>heard.push([m,d]),scoreActiveHandles:[],setScoreHighlight(){}});
  vm.runInContext(fn(src,'getCurrentStepData','scheduleScoreStep'),c);
  eq(c.triggerCurrentStepNotes(120),2,app+' '+file+' whole rest');eq(heard.length,0,'rest silent');
  c.osmd.cursor.Iterator=iterator([note(4),note(1)]);
  eq(c.triggerCurrentStepNotes(120),.5,'polyphonic step');eq(JSON.stringify(heard),JSON.stringify([[48,2],[48,.5]]),'individual durations and written transposition');
 }
 const t=timers(),attacks=[],releases=[];
 const src=read('piano-virtual/js/tutor.js');
 const c=context({...t,osmd:{cursor:{Iterator:iterator([note(4,true)])}},shouldPlayScoreNote:()=>true,scoreNoteHand:()=> 'right',scoreActiveMidis:new Set(),keyElByMidi:{},noteOn:m=>attacks.push(m),noteOff:m=>releases.push(m),midiToInfo:m=>m,scorePlaying:false,scorePlaybackTimer:null,syncTransportButton(){}});
 vm.runInContext(src.slice(src.indexOf('const scoreReleaseTimers'),src.indexOf('function pausePlayback'))+fn(src,'triggerCurrentStepNotes','scheduleScoreStep'),c);
 eq(c.triggerCurrentStepNotes(120),2,'piano rest');eq(attacks.length,0,'no rest attack');
 c.osmd.cursor.Iterator=iterator([note(1)]);c.shouldPlayScoreNote=()=>false;eq(c.triggerCurrentStepNotes(120),.5,'muted hand preserves timing');eq(attacks.length,0,'muted hand silent');c.shouldPlayScoreNote=()=>true;
 const n1=note(1),n2=note(1),tie={Notes:[n1,n2],StartNote:n1};n1.NoteTie=n2.NoteTie=tie;
 c.osmd.cursor.Iterator=iterator([n1]);c.triggerCurrentStepNotes(120);c.osmd.cursor.Iterator=iterator([n2]);c.triggerCurrentStepNotes(120);
 eq(attacks.length,1,'tied continuation no reattack');eq([...t.pending.values()][0].ms,1000,'tie held for both notes');
 c.stopPlaybackAudio();eq(t.pending.size,0,'stop cancels note releases');c.triggerCurrentStepNotes(120);eq(attacks.length,2,'seek into tie attacks');eq([...t.pending.values()][0].ms,500,'seek sustains remaining duration');
 c.triggerCurrentStepNotes(120);eq(t.pending.size,1,'no duplicate continuation timer');c.stopPlaybackAudio();
 c.osmd.cursor.Iterator=iterator([note(1)]);c.triggerCurrentStepNotes(120);c.triggerCurrentStepNotes(120);eq(t.pending.size,1,'same-pitch reattack replaces release');
 const strings=context({osmd:{cursor:{Iterator:iterator([note(4,true)])}},scoreMidiToSounding:m=>m,scoreNoteOn(){},scoreNoteOff(){},scoreActiveMidis:new Set(),updateTutorFromPlayback(){},currentStepIndex:0,setTimeout(){}});
 vm.runInContext(fn(read('cuerdas-frotadas/js/app.js'),'triggerCurrentStepNotes','scheduleScoreStep'),strings);eq(strings.triggerCurrentStepNotes(120),2,'strings whole rest');
 const it=iterator([note(4),note(1)]);it.CurrentSourceTimestamp={RealValue:0};it.clone=()=>({moveToNext(){},CurrentSourceTimestamp:{RealValue:.25},EndReached:false});eq(timing.stepSeconds(it,120),.5,'next onset, not sustain');
 it.clone=()=>({moveToNext(){},EndReached:true});it.CurrentMeasure={Duration:{RealValue:1},AbsoluteTimestamp:{RealValue:0}};it.CurrentSourceTimestamp={RealValue:.75};eq(timing.stepSeconds(it,120),.5,'end of measure');
 // Actual audio engine with deferred samples and controllable clock.
 const a=context({window:{},setTimeout(){}});vm.runInContext(read('ear-training/js/audio.js'),a);
 function engine(){const e=new a.window.ETAudio.AudioEngine(),clock={currentTime:0},heard=[],stopped=[];let resolve; e.ensureContext=()=>clock;const pending=new Promise(r=>resolve=r);e.loadInstrument=()=>pending;e.player={play:(m,at)=>{heard.push({m,at});return {stop:at=>stopped.push(at)};}};return {e,clock,heard,stopped,resolve};}
 let x=engine();let playing=x.e.playSequence([{notes:[60],start:0,dur:.4},{notes:[62],start:.5,dur:.4}]);x.e.stopAll();x.clock.currentTime=5;x.resolve();await playing;eq(x.heard.length,0,'stop during loading');
 x=engine();playing=x.e.playSequence([{notes:[60,64,67],start:0,dur:.4},{notes:[62],start:.5,dur:.4}]);x.clock.currentTime=5;x.resolve();await playing;eq(x.heard.length,4,'chord plus melodic note');near(x.heard[0].at,5.03,'cold load start');near(x.heard[2].at,x.heard[0].at,'chord simultaneous');near(x.heard[3].at-x.heard[0].at,.5,'melody separated');x.e.stopAll();eq(x.e.activeNodes.size,0,'stop future notes');
 x=engine();const first=x.e.playSequence([{notes:[60],start:0,dur:1}]);const second=x.e.playSequence([{notes:[67],start:0,dur:1}]);x.resolve();await Promise.all([first,second]);eq(JSON.stringify(x.heard.map(n=>n.m)),JSON.stringify([67]),'new sequence cancels pending old sequence');
 x=engine();playing=x.e.playSequence([{notes:[60],start:0,dur:1}]);await x.e.setInstrument('sine');x.resolve();await playing;eq(x.heard.length,0,'instrument switch cancels pending sequence');
 const releasesAt=[];a.setTimeout=(f,ms)=>releasesAt.push(ms);const future=new a.window.ETAudio.AudioEngine();future.ensureContext=()=>({currentTime:10});future.loadInstrument=async()=>{};future.player={play:()=>({stop(){}})};await future.playNotes([60],20,1);near(releasesAt[0],11200,'future nodes remain stoppable until actual release');
 // Pending old instrument must not replace the new one.
 const loads=[];a.window.Soundfont={instrument:()=>new Promise(r=>loads.push(r))};const e=new a.window.ETAudio.AudioEngine();e.ensureContext=()=>({currentTime:0});const old=e.loadInstrument();await e.setInstrument('guitar');const fresh=e.loadInstrument();loads[0]({id:'old'});await old;eq(e.player,null,'stale instrument discarded');loads[1]({id:'new'});await fresh;eq(e.player.id,'new','current instrument retained');
 const af=read('afinador/index.html'),tun=context({INSTRUMENTS:{guitarra:{strings:[{freq:146.83},{freq:110},{freq:82.41},{freq:196},{freq:246.94},{freq:329.63}]}},currentInstrumentKey:'guitarra',calibratedFreq:f=>f});vm.runInContext(af.slice(af.indexOf('function centsOffFromTarget('),af.indexOf('const CHROMATIC_SHARPS')),tun);
 eq(tun.closestStringIndex(164.82),2,'harmonic selects low E');eq(tun.matchingHarmonic(164.82,82.41),2,'retains harmonic');near(tun.centsOffFromTarget(164.82,82.41*tun.matchingHarmonic(164.82,82.41)),0,'harmonic cents');eq(tun.closestStringIndex(329.63),5,'actual high E preferred');for(const cents of [-20,20]){const base=82.41*442/440,f=base*2*2**(cents/1200);near(tun.centsOffFromTarget(f,base*tun.matchingHarmonic(f,base)),cents,'calibrated detuning');}eq(tun.matchingHarmonic(82.41*2**(90/1200),82.41),1,'detuned fundamental stays fundamental');
 const speed=read('speed/index.html');
 for(const active of [true,false])for(const win of [{start:0,duration:10},{start:3,duration:2}]){
 const sp=context({isPlaying:active,audioCtx:{currentTime:1},processedTempo:1,startedOffset:0,startedAt:0,duration:10,loopActive:false,currentTime:1,playIcon:{},stopTimeUpdates(){},disposeSource(){},updateTimeDisplay(){},drawWaveform(){},visibleWindow:()=>win,waveCanvas:{getBoundingClientRect:()=>({left:0,width:100})},startPlayback:at=>sp.restartedAt=at});
 vm.runInContext(fn(speed,'refreshCurrentTime','stopTimeUpdates')+fn(speed,'pausePlayback','visibleWindow'),sp);
 const begin=speed.indexOf("waveCanvas.addEventListener('click', (e) => {");const body=speed.slice(begin+"waveCanvas.addEventListener('click', (e) => {".length,speed.indexOf('\n            });',begin));sp.e={clientX:80};vm.runInContext('(function(){'+body+'})()',sp);near(sp.currentTime,win.start+.8*win.duration,'seek paused/playing zoom');if(active)near(sp.restartedAt,sp.currentTime,'seek restart target');}
 console.log(`PASS: ${count} playback regression assertions`);
})().catch(e=>{console.error(e);process.exitCode=1;});
