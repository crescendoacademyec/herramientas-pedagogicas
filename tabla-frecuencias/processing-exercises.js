/* Controlled comparisons: each answer describes the processing actually applied. */
(function(root){
'use strict';
const D=typeof module==='object'?require('./processing-dsp.js').ProcessingDSP:root.ProcessingDSP;
const options={eq:['Graves · realce','Graves · recorte','Medios · realce','Medios · recorte','Agudos · realce','Agudos · recorte'],q:['Banda ancha','Banda estrecha'],filter:['Corte bajo: conserva cuerpo','Corte alto: adelgaza'],attack:['Ataque rápido','Ataque lento'],release:['Recuperación corta','Recuperación larga'],deess:['Sin reducción','Reducción moderada','Reducción intensa'],masking:['Bajó la melodía','Bajó el acompañamiento'],limit:['Limitación ligera','Limitación intensa','Recorte duro']};
function create(kind,difficulty,index,seed,sr=32000){
 const level={easy:0,medium:1,hard:2}[difficulty]??0,choices=options[kind],correct=index%choices.length;
 const drums=['attack','release','limit'].includes(kind);let a=D.synth(kind==='deess'?'voice':drums?'drums':'music',seed,sr,4),b,why,stems=null,question='¿Qué cambio escuchas en B respecto de A?';
 if(kind==='eq'){const f=[180,1000,6000][Math.floor(correct/2)],g=[12,8,4][level]*(correct%2?-1:1);a=D.mix(a,D.synth('noise',seed+1,sr,4),.12);b=D.filter(a,sr,'peaking',f,.8,g);why=`B aplica ${g>0?'+':''}${g} dB en ${f} Hz. Escucha el balance tonal, no solo el volumen.`;}
 if(kind==='q'){const q=correct?[6,4,2.5][level]:.5,g=[12,9,6][level];b=D.filter(a,sr,'peaking',1000,q,g);why=`Q ${q}: ${correct?'concentra':'reparte'} el realce de ${g} dB alrededor de 1 kHz.`;}
 if(kind==='filter'){const f=correct?[650,400,220][level]:35;b=D.process(a,sr,'filter',{frequency:f,slope:24}).audio;why=`Pasa-altos de ${f} Hz y 24 dB/oct. El corte alto también atenúa fundamentales y cuerpo; no es una limpieza gratuita.`;}
 if(kind==='attack'){const ms=correct?[60,35,20][level]:.2;b=D.compressor(a,sr,{threshold:-26,ratio:8,attack:ms,release:140}).audio;why=`Ataque de ${ms} ms. El rápido controla más el inicio; el lento deja pasar más transitorio. No hay un ajuste mejor para todo.`;}
 if(kind==='release'){const ms=correct?[750,450,250][level]:35;b=D.compressor(a,sr,{threshold:-28,ratio:8,attack:1,release:ms}).audio;why=`Recuperación de ${ms} ms. Escucha cuánto tarda en volver el cuerpo entre golpes; una recuperación corta puede producir modulación audible.`;}
 if(kind==='deess'){const threshold=[0,[-23,-26,-29][level],[-40,-37,-34][level]][correct],ratio=[1,4,12][correct];b=D.dynamicBand(a,sr,{frequency:6500,q:.8,threshold,ratio,attack:1,release:70}).audio;why=`B usa ratio ${ratio}:1 y umbral ${threshold} dBFS en 6,5 kHz. Las ráfagas de ruido representan sibilantes; demasiada reducción resta articulación. En voz real localiza su banda escuchando.`;}
 if(kind==='masking'){const backing=D.synth('music',seed+19,sr,4);stems=[a,backing];const attenuation=D.amp(-[14,9,5][level]);b=Float32Array.from(a,(v,i)=>v*.5*(correct?1:attenuation)+backing[i]*.5*(correct?attenuation:1));a=D.mix(a,backing,.5);why=`Se bajó ${choices[correct].slice(5).toLowerCase()} ${[14,9,5][level]} dB antes de igualar niveles. Escucha qué línea queda relativamente más expuesta; compartir rango no demuestra por sí solo enmascaramiento.`;}
 if(kind==='limit'){const drive=correct?[18,13,9][level]:2;b=correct===2?Float32Array.from(a,v=>Math.max(-.25,Math.min(.25,v*D.amp(drive)))):D.limiter(a,sr,{drive,ceiling:-5,release:100}).audio;why=correct===2?'B recorta las muestras de forma abrupta: introduce armónicos y distorsión. No equivale a limitar con anticipación.':`Limitación de muestras con ${drive} dB de entrada y techo −5 dBFS. Escucha cómo cambia la relación entre golpe y cuerpo. No es una medición true-peak.`;}
 return {audio:D.matchLevels([a,b]),stems,choices,correct,why,question};
}
root.ProcessingExercises={options,create};
})(typeof module==='object'?module.exports:window);
