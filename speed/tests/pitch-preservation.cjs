const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(__dirname+'/../index.html','utf8');
class AudioBuffer{constructor({numberOfChannels,length,sampleRate}){Object.assign(this,{numberOfChannels,length,sampleRate});this.data=Array.from({length:numberOfChannels},()=>new Float32Array(length));}getChannelData(c){return this.data[c];}}
const ctx={AudioBuffer,processToken:1,requestAnimationFrame:fn=>setImmediate(fn)};vm.createContext(ctx);
vm.runInContext(source.slice(source.indexOf('            function linearSample('),source.indexOf('            async function ensureProcessed(')),ctx);
function peak(data,sr,target){let best=0,freq=0;for(let f=target-12;f<=target+12;f+=.5){let re=0,im=0;for(let i=sr/2;i<sr;i++){re+=data[i]*Math.cos(2*Math.PI*f*i/sr);im+=data[i]*Math.sin(2*Math.PI*f*i/sr);}const mag=re*re+im*im;if(mag>best){best=mag;freq=f;}}return freq;}
(async()=>{const sr=16000,input=new AudioBuffer({numberOfChannels:2,length:sr*3,sampleRate:sr});for(let i=0;i<input.length;i++){input.data[0][i]=.4*Math.sin(2*Math.PI*440*i/sr);input.data[1][i]=-input.data[0][i];}
for(const tempo of [.5,.75,1.5,2]){const out=await ctx.processIndependentBuffer(input,tempo,0,1);assert.equal(out.length,Math.ceil(input.length/tempo));assert.ok(Math.abs(peak(out.data[0],sr,440)-440)<1,`Pitch at ${tempo}`);for(let i=0;i<out.length;i++)assert.ok(Math.abs(out.data[0][i]+out.data[1][i])<1e-6);}
const shifted=await ctx.processIndependentBuffer(input,.75,12,1);assert.ok(Math.abs(peak(shifted.data[0],sr,880)-880)<1);
assert.equal(await ctx.processIndependentBuffer(input,1,0,1),input);
console.log('PASS: speed preserves 440 Hz, explicit octave shifts to 880 Hz, duration and stereo preserved');})().catch(e=>{console.error(e);process.exitCode=1;});
