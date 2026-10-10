/* RBJ biquad response, 96 kHz reference; no audio processing. */
(function(root){
'use strict';
function coefficients(b){
 const w=2*Math.PI*b.frequency/96000,c=Math.cos(w),s=Math.sin(w),A=10**(b.gain/40),alpha=s/(2*b.q),beta=2*Math.sqrt(A)*s/Math.sqrt(2);
 switch(b.type){
 case 'highpass':return [(1+c)/2,-(1+c),(1+c)/2,1+alpha,-2*c,1-alpha];
 case 'lowpass':return [(1-c)/2,1-c,(1-c)/2,1+alpha,-2*c,1-alpha];
 case 'notch':return [1,-2*c,1,1+alpha,-2*c,1-alpha];
 case 'lowshelf':return [A*((A+1)-(A-1)*c+beta),2*A*((A-1)-(A+1)*c),A*((A+1)-(A-1)*c-beta),(A+1)+(A-1)*c+beta,-2*((A-1)+(A+1)*c),(A+1)+(A-1)*c-beta];
 case 'highshelf':return [A*((A+1)+(A-1)*c+beta),-2*A*((A-1)+(A+1)*c),A*((A+1)+(A-1)*c-beta),(A+1)-(A-1)*c+beta,2*((A-1)-(A+1)*c),(A+1)-(A-1)*c-beta];
 default:return [1+alpha*A,-2*c,1-alpha*A,1+alpha/A,-2*c,1-alpha/A];
 }
}
function response(b,f){
 if(!b.enabled)return 0;
 const a=coefficients(b),w=2*Math.PI*f/96000;
 const power=(i)=>(a[i]+a[i+1]*Math.cos(w)+a[i+2]*Math.cos(2*w))**2+(a[i+1]*Math.sin(w)+a[i+2]*Math.sin(2*w))**2;
 return 10*Math.log10(Math.max(1e-12,power(0))/Math.max(1e-12,power(3)));
}
function frequencyFromText(text){
 const nums=text.match(/\d+(?:[.,]\d+)?/g);if(!nums)return null;
 const factor=/kHz/i.test(text)?1000:1,values=nums.slice(0,2).map(n=>Number(n.replace(',','.'))*factor);
 return Math.max(20,Math.min(20000,values.length===2?Math.sqrt(values[0]*values[1]):values[0]));
}
function instrumentExample(inst){
 const bands=[], unspecified=[];
 for(const [items,gain] of [[inst.cuts||[],-3],[inst.boosts||[],3]])for(const item of items){
  const frequency=frequencyFromText(item.f);
  if(!frequency){unspecified.push(item.f+': '+item.r);continue;}
  const type=/debajo/i.test(item.f)&&gain<0?'highpass':/adelante/i.test(item.f)?'highshelf':'peaking';
  bands.push({frequency,gain,type,q:1,enabled:true,label:item.f+' · '+item.r});
 }
 return {bands,unspecified};
}
const api={coefficients,response,frequencyFromText,instrumentExample};if(typeof module==='object')module.exports=api;else root.EQResponse=api;
})(typeof window==='object'?window:globalThis);
