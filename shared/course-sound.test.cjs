const {test}=require('node:test');
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 const calls=[],heard=[],pending=[];
 class AudioContext{constructor(){this.currentTime=10;this.state='running';this.destination={};}createGain(){return {gain:{value:1},connect(){}};}}
 const context={AudioContext,localStorage:{getItem:()=>null,setItem(){}},Soundfont:{instrument:(ctx,name,options)=>{calls.push({ctx,name,options});return new Promise(resolve=>pending.push(()=>resolve({play:(midi,time)=>{heard.push({name,midi,time});return {stop(){}};}})));}}};context.window=context;
 vm.createContext(context);vm.runInContext(fs.readFileSync(__dirname+'/course-sound.js','utf8'),context);
 vm.runInContext(fs.readFileSync(__dirname+'/../armonia-jazz/theory-visuals.js','utf8'),context);
 return {context,calls,heard,pending};
}
const tick=()=>new Promise(setImmediate);
test('cache separa instrumentos, contextos y destinos',async()=>{
 const t=setup(),s=t.context.CourseSound,c=new t.context.AudioContext();
 let a=s.getPlayer(c),b=s.getPlayer(c);await tick();assert.equal(t.calls.length,1);t.pending.shift()();assert.equal(await a,await b);
 s.set('guitar');a=s.getPlayer(c);await tick();assert.equal(t.calls[1].name,'acoustic_guitar_nylon');t.pending.shift()();await a;
 s.set('piano');await s.getPlayer(c);assert.equal(t.calls.length,2);
 a=s.getPlayer(new t.context.AudioContext());await tick();t.pending.shift()();await a;assert.equal(t.calls.length,3);
 a=s.getPlayer(c,{destination:{}});await tick();t.pending.shift()();await a;assert.equal(t.calls.length,4);
});
test('acorde de guitarra conserva notas simultáneas y anula cargas anteriores al cambiar timbre',async()=>{
 const t=setup(),s=t.context.CourseSound,play=t.context.TheoryVisuals.playNotes;
 const old=play([60,64,67]);await tick();s.set('guitar');t.pending.shift()();await old;assert.equal(t.heard.length,0);
 const chord=play([47,53,58,62]);await tick();assert.equal(t.calls.at(-1).name,'acoustic_guitar_nylon');t.pending.shift()();await chord;
 assert.deepEqual(t.heard.map(n=>n.midi),[47,53,58,62]);assert.equal(new Set(t.heard.map(n=>n.time)).size,1);
 s.set('piano');t.heard.length=0;await play([47,53,58,62],{instrument:'guitar'});assert.ok(t.heard.every(n=>n.name==='acoustic_guitar_nylon'));assert.equal(s.get(),'piano');
 t.heard.length=0;await play([60,62,64],{instrument:'guitar',melodic:true});assert.ok(t.heard[1].time>t.heard[0].time);
});
