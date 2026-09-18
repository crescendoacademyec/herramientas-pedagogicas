(function(global){
  'use strict';
  const PLACEMENTS={
    all:{label:'Todos los pulsos',division:1},
    oneThree:{label:'1 y 3',division:1},
    twoFour:{label:'2 y 4',division:1},
    beatOne:{label:'Solo pulso 1',division:1},
    beatFour:{label:'Solo pulso 4',division:1},
    upbeat:{label:'Contratiempos',division:2},
    tripletEnd:{label:'3.er parcial del tresillo',division:3},
    randomMute:{label:'Silencios aleatorios',division:1}
  };
  const EAR_PATTERNS=[
    {id:'quarters',label:'Negras',division:1,hits:[0]},
    {id:'eighths',label:'Corcheas',division:2,hits:[0,1]},
    {id:'triplets',label:'Tresillos de corchea',division:3,hits:[0,1,2]},
    {id:'sixteenths',label:'Semicorcheas',division:4,hits:[0,1,2,3]},
    {id:'downbeat',label:'Ataque en el pulso',division:2,hits:[0]},
    {id:'upbeat',label:'Ataque a contratiempo',division:2,hits:[1]},
    {id:'tripletEnd',label:'Tercer parcial del tresillo',division:3,hits:[2]},
    {id:'funkShift',label:'Primera y cuarta semicorchea',division:4,hits:[0,3]}
  ];
  function placementFrame(mode,step,beats=4,random=Math.random){
    const spec=PLACEMENTS[mode]||PLACEMENTS.all,division=spec.division;
    const beat=Math.floor(step/division)%beats,sub=step%division;
    let audible=false;
    if(mode==='oneThree')audible=sub===0&&(beat===0||beat===2);
    else if(mode==='twoFour')audible=sub===0&&(beat===1||beat===3);
    else if(mode==='beatOne')audible=sub===0&&beat===0;
    else if(mode==='beatFour')audible=sub===0&&beat===Math.min(3,beats-1);
    else if(mode==='upbeat')audible=sub===1;
    else if(mode==='tripletEnd')audible=sub===2;
    else if(mode==='randomMute')audible=sub===0&&random()>.35;
    else audible=sub===0;
    return {audible,accent:audible&&beat===0,beat,sub,division,label:spec.label};
  }
  function patternSequence(id,midi=72,bars=2){
    const pattern=EAR_PATTERNS.find(x=>x.id===id)||EAR_PATTERNS[0],events=[];
    for(let beat=0;beat<bars*4;beat++){
      events.push({notes:[48],start:beat,dur:.09,vel:beat%4===0?.45:.28,role:'pulse'});
      if(pattern.id!=='downbeat'||beat%4===0)pattern.hits.forEach(hit=>events.push({notes:[midi],start:beat+hit/pattern.division,dur:Math.max(.1,.72/pattern.division),vel:.88,role:'rhythm'}));
    }
    return events;
  }
  function notationPattern(id,midi=67,shift=0){
    const patterns={
      tree:[2,1.5,1,.6666667,.5,.3333333,.25],
      charleston:[1,1.5,1.5],reverse:[.5,1.5,2],
      redGarland:[1.5,1,1.5],funk:[.75,.25,1,1,1]
    };
    const durations=patterns[id]||patterns.tree,events=[];
    let cursor=shift;
    if(shift>0)events.push({kind:'rest',midi,beats:shift,bar:0,label:'desplazamiento'});
    durations.forEach((beats,i)=>{events.push({midi,beats,bar:Math.floor(cursor/4),label:i===0?id:''});cursor+=beats;});
    return events;
  }
  global.CrescendoRhythm={PLACEMENTS,EAR_PATTERNS,placementFrame,patternSequence,notationPattern};
  if(typeof module!=='undefined')module.exports=global.CrescendoRhythm;
})(typeof window==='undefined'?globalThis:window);
