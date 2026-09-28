/* Shared timbre preference; each audio context keeps its own decoded samples. */
(function(global){
  'use strict';
  const choices={piano:'acoustic_grand_piano',guitar:'acoustic_guitar_nylon'};
  const key='crescendo-course-timbre-v1',listeners=new Set(),cache=new WeakMap();
  let selected='piano';
  try{const saved=global.localStorage.getItem(key);if(choices[saved])selected=saved;}catch(_){}
  function set(value){
    if(!choices[value]||value===selected)return;
    selected=value;
    try{global.localStorage.setItem(key,value);}catch(_){}
    listeners.forEach(fn=>fn());
    global.document?.querySelectorAll('[data-course-sound]').forEach(el=>{el.value=value;});
  }
  function entry(ctx,options){
    const instrument=choices[options.instrument] ? options.instrument : selected;
    let destinations=cache.get(ctx);if(!destinations){destinations=new Map();cache.set(ctx,destinations);}
    const destination=options.destination||ctx.destination;
    let instruments=destinations.get(destination);if(!instruments){instruments=new Map();destinations.set(destination,instruments);}
    if(!instruments.has(instrument))instruments.set(instrument,{});
    return {state:instruments.get(instrument),instrument,destination};
  }
  async function getPlayer(ctx,options={}){
    if(!ctx)return null;
    const {state,instrument,destination}=entry(ctx,options);
    if(!state.promise){
      state.promise=Promise.resolve().then(()=>global.Soundfont.instrument(ctx,choices[instrument],{destination,soundfont:'MusyngKite'}))
        .then(player=>{state.player=player;return player;})
        .catch(error=>{state.promise=null;throw error;});
    }
    try{return await state.promise;}catch(error){
      const status=global.document?.querySelector('[data-course-sound-status]');
      if(status)status.textContent='No se pudo cargar el sonido. Comprueba la conexión y vuelve a pulsar Escuchar.';
      throw error;
    }
  }
  function peek(ctx,options={}){return ctx?entry(ctx,options).state.player:null;}
  global.CourseSound={getPlayer,peek,set,get:()=>selected,onChange:fn=>listeners.add(fn)};
  function mount(){
    global.document.querySelectorAll('[data-course-sound]').forEach(el=>{el.value=selected;el.addEventListener('change',()=>{set(el.value);const status=global.document.querySelector('[data-course-sound-status]');if(status)status.textContent='';});});
  }
  if(global.document){if(global.document.readyState==='loading')global.document.addEventListener('DOMContentLoaded',mount);else mount();}
})(window);
