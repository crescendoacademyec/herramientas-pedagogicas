/* Educational, offline mono DSP. No LUFS or true-peak compliance is claimed. */
(function(root){
'use strict';
const db=x=>20*Math.log10(Math.max(1e-9,x)), amp=x=>10**(x/20);
function metrics(x){let sum=0,peak=0;for(const v of x){sum+=v*v;peak=Math.max(peak,Math.abs(v));}const rms=Math.sqrt(sum/Math.max(1,x.length));return {rms,peak,rmsDb:db(rms),peakDb:db(peak),crest:db(peak)-db(rms)};}
function gain(x,g){return Float32Array.from(x,v=>v*g);}
function mix(a,b,wet=.5){return Float32Array.from(a,(v,i)=>v*(1-wet)+b[i]*wet);}
function rng(seed){let s=seed>>>0;return ()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
function synth(kind='music',seed=1,sr=32000,seconds=6){
 const rand=rng(seed),out=new Float32Array(sr*seconds),notes=[130.81,164.81,196,146.83],transpose=2**((Math.floor(rand()*5)-2)/12);let brown=0;
 // Precompute a periodic waveform instead of evaluating 32–36 oscillators per sample.
 const size=4096,wave=new Float32Array(size+1),f0=160*transpose;
 if(kind==='music'||kind==='voice')for(let j=0;j<=size;j++)for(let h=1;h<=(kind==='voice'?36:32);h++){const f=h*f0,weight=kind==='voice'?.06+Math.exp(-(((f-700)/170)**2))+.6*Math.exp(-(((f-1400)/230)**2))+.2*Math.exp(-(((f-2700)/330)**2)):1;wave[j]+=Math.sin(2*Math.PI*h*j/size)*weight/h;}
 const sample=phase=>{const p=(phase-Math.floor(phase))*size,k=Math.floor(p);return wave[k]+(wave[k+1]-wave[k])*(p-k);};
 for(let i=0;i<out.length;i++){
  const t=i/sr,beat=t%0.5,n=notes[Math.floor(t/.5)%4]*transpose,noise=rand()*2-1;
  brown=.985*brown+.015*noise;
  if(kind==='noise')out[i]=brown*2.5+noise*.07;
  else if(kind==='drums')out[i]=.7*Math.sin(2*Math.PI*(55*beat+3*(1-Math.exp(-beat*35))))*Math.exp(-beat*22)+noise*.35*Math.exp(-beat*70)+noise*.05*Math.exp(-(t%.25)*90);
  else if(kind==='voice'){
   const syll=t%.75,voiced=sample(f0*t);
   const env=Math.sin(Math.PI*Math.min(1,syll/.5))**2;
   out[i]=voiced*env*.6+(syll>.53&&syll<.69?noise*.32:0);
  } else {const tone=sample(n*t);
   out[i]=tone*.22*Math.exp(-beat*7)*(1-Math.exp(-beat*600))+.23*Math.sin(2*Math.PI*n*.5*t)*Math.exp(-beat*4)+noise*.1*Math.exp(-beat*90);}
  out[i]*=Math.min(1,t/.02,(seconds-t)/.04);
 }
 const p=metrics(out).peak;return gain(out,.72/Math.max(p,.001));
}
function filter(x,sr,type,f=1000,q=.7,g=0){
 f=Math.max(20,Math.min(sr*.45,f));const w=2*Math.PI*f/sr,c=Math.cos(w),a=Math.sin(w)/(2*Math.max(.1,q)),A=10**(g/40);let b0,b1,b2,a0,a1,a2;
 if(type==='peaking'){b0=1+a*A;b1=-2*c;b2=1-a*A;a0=1+a/A;a1=-2*c;a2=1-a/A;}
 else if(type==='highpass'){b0=(1+c)/2;b1=-(1+c);b2=b0;a0=1+a;a1=-2*c;a2=1-a;}
 else if(type==='lowpass'){b0=(1-c)/2;b1=1-c;b2=b0;a0=1+a;a1=-2*c;a2=1-a;}
 else {b0=a;b1=0;b2=-a;a0=1+a;a1=-2*c;a2=1-a;}
 const y=new Float32Array(x.length);let x1=0,x2=0,y1=0,y2=0;
 for(let i=0;i<x.length;i++){const v=(b0*x[i]+b1*x1+b2*x2-a1*y1-a2*y2)/a0;y[i]=v;x2=x1;x1=x[i];y2=y1;y1=v;}return y;
}
function compressor(x,sr,p={}){
 const threshold=p.threshold??-22,ratio=p.ratio??4,knee=p.knee??6,attack=Math.exp(-1/(sr*Math.max(.0001,(p.attack??20)/1000))),release=Math.exp(-1/(sr*Math.max(.001,(p.release??140)/1000)));
 let env=0,maxReduction=0;const y=new Float32Array(x.length);
 for(let i=0;i<x.length;i++){const v=Math.abs(x[i]),a=v>env?attack:release;env=a*env+(1-a)*v;const over=db(env)-threshold;let reduction=0;
 if(over>knee/2)reduction=over*(1-1/ratio);else if(knee>0&&over>-knee/2)reduction=(1-1/ratio)*(over+knee/2)**2/(2*knee);
 maxReduction=Math.max(maxReduction,reduction);y[i]=x[i]*amp(-reduction+(p.makeup??0));}
 return {audio:y,reduction:maxReduction};
}
function dynamicBand(x,sr,p={}){
 const band=filter(x,sr,'bandpass',p.frequency??6000,p.q??1),wet=compressor(band,sr,{...p,knee:3});
 // Parallel residual: only the selected band is changed.
 return {audio:Float32Array.from(x,(v,i)=>v+wet.audio[i]-band[i]),reduction:wet.reduction};
}
function limiter(x,sr,p={}){
 const driven=gain(x,amp(p.drive??6)),ceiling=amp(p.ceiling??-3),look=Math.round(sr*.005),future=new Float32Array(x.length),queue=new Int32Array(x.length);let head=0,tail=0,next=0;
 for(let i=0;i<x.length;i++){while(next<Math.min(x.length,i+look+1)){while(tail>head&&Math.abs(driven[queue[tail-1]])<=Math.abs(driven[next]))tail--;queue[tail++]=next++;}while(head<tail&&queue[head]<i)head++;future[i]=Math.abs(driven[queue[head]]);}
 let g=1,maxReduction=0;const release=Math.exp(-1/(sr*(p.release??100)/1000)),y=new Float32Array(x.length);
 for(let i=0;i<x.length;i++){const target=Math.min(1,ceiling/Math.max(1e-9,future[i]));g=target<g?target:release*g+(1-release)*target;y[i]=driven[i]*g;maxReduction=Math.max(maxReduction,-db(g));}
 return {audio:y,reduction:maxReduction};
}
function process(x,sr,mode,p={}){
 if(mode==='eq')return {audio:filter(x,sr,'peaking',p.frequency,p.q,p.gain),reduction:0};
 if(mode==='filter'){let y=x.slice();for(let i=0;i<(p.slope??12)/12;i++)y=filter(y,sr,'highpass',p.frequency,.707);return {audio:y,reduction:0};}
 if(mode==='dynamic'||mode==='deess')return dynamicBand(x,sr,p);
 if(mode==='limit')return limiter(x,sr,p);
 if(mode==='parallel'){const wet=compressor(x,sr,p);return {audio:mix(x,wet.audio,p.mix??.5),reduction:wet.reduction};}
 if(mode==='series'){const first=compressor(x,sr,{...p,attack:2,ratio:4}),second=compressor(first.audio,sr,{...p,attack:35,ratio:2,threshold:(p.threshold??-22)-6});return {audio:second.audio,reduction:first.reduction+second.reduction};}
 return compressor(x,sr,p);
}
function matchLevels(buffers,enabled=true){
 const rms=buffers.map(b=>metrics(b).rms),target=Math.min(...rms.filter(x=>x>1e-8));
 const scaled=buffers.map((b,i)=>gain(b,enabled&&rms[i]>1e-8?target/rms[i]:1));
 const peak=Math.max(...scaled.map(b=>metrics(b).peak)),s=Math.min(1,.7/Math.max(peak,1e-9));return scaled.map(b=>gain(b,s));
}
function shuffledBag(items,random=Math.random){let pool=[],last;return ()=>{if(!pool.length){pool=items.slice();for(let i=pool.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]];}if(pool.length>1&&pool[pool.length-1]===last)[pool[0],pool[pool.length-1]]=[pool[pool.length-1],pool[0]];}return last=pool.pop();};}
root.ProcessingDSP={db,amp,metrics,gain,mix,rng,synth,filter,compressor,dynamicBand,limiter,process,matchLevels,shuffledBag};
})(typeof module==='object'?module.exports:window);
