const DATA = window.TLM_DATA;
const LS_KEY = "crescendo-teoria-lectura-v2";
const LEGACY_LS_KEYS = ["crescendo-teoria-lectura-v1"];
let state = loadState();
let activeLevelId = state.activeLevelId || DATA.levels[0].id;

const NOTE_NAMES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const NATURAL = ["C","D","E","F","G","A","B"];
const NATURAL_PC = {C:0,D:2,E:4,F:5,G:7,A:9,B:11};
const ROOTS = [
  {value:"C",label:"C"},{value:"Db",label:"D♭"},{value:"D",label:"D"},
  {value:"Eb",label:"E♭"},{value:"E",label:"E"},{value:"F",label:"F"},
  {value:"Gb",label:"G♭"},{value:"G",label:"G"},{value:"Ab",label:"A♭"},
  {value:"A",label:"A"},{value:"Bb",label:"B♭"},{value:"B",label:"B"}
];
const SCALES = [
  {id:"major",label:"Mayor natural",tokens:["1","2","3","4","5","6","7","8"],pattern:"T–T–S–T–T–T–S"},
  {id:"minor",label:"Menor natural",tokens:["1","2","b3","4","5","b6","b7","8"],pattern:"T–S–T–T–S–T–T"},
  {id:"harmonic-minor",label:"Menor armónica",tokens:["1","2","b3","4","5","b6","7","8"],pattern:"T–S–T–T–S–3S–S"},
  {id:"major-penta",label:"Pentatónica mayor",tokens:["1","2","3","5","6","8"],pattern:"1–2–3–5–6"},
  {id:"minor-penta",label:"Pentatónica menor",tokens:["1","b3","4","5","b7","8"],pattern:"1–♭3–4–5–♭7"}
];
const INTERVALS = [
  {id:"P1",label:"1 justa",token:"1",semitones:0},
  {id:"m2",label:"2 menor",token:"b2",semitones:1},
  {id:"M2",label:"2 mayor",token:"2",semitones:2},
  {id:"m3",label:"3 menor",token:"b3",semitones:3},
  {id:"M3",label:"3 mayor",token:"3",semitones:4},
  {id:"P4",label:"4 justa",token:"4",semitones:5},
  {id:"TT",label:"Tritono",token:"#4",semitones:6},
  {id:"P5",label:"5 justa",token:"5",semitones:7},
  {id:"m6",label:"6 menor",token:"b6",semitones:8},
  {id:"M6",label:"6 mayor",token:"6",semitones:9},
  {id:"m7",label:"7 menor",token:"b7",semitones:10},
  {id:"M7",label:"7 mayor",token:"7",semitones:11},
  {id:"P8",label:"8 justa",token:"8",semitones:12}
];
const DEGREE_BASE = {1:0,2:2,3:4,4:5,5:7,6:9,7:11,8:12,9:14,11:17,13:21};

const AUDIO = {ctx:null,masterBus:null,nodes:[],metroTimer:null,metroBeat:0,sfPlayer:null,sfPromise:null,sfFailed:false};

function $(id){ return document.getElementById(id); }
function escapeHtml(value){
  return String(value??"")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}
function escAttr(v){ return escapeHtml(v); }
function parseJSON(value,fallback={}){
  try{return JSON.parse(value)}catch(e){return fallback}
}
function loadState(){
  const empty={completed:{},activeLevelId:DATA.levels[0].id,practice:{}};
  for(const key of [LS_KEY,...LEGACY_LS_KEYS]){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) continue;
      const parsed=JSON.parse(raw);
      return {
        completed: parsed.completed&&typeof parsed.completed==="object"?parsed.completed:{},
        activeLevelId: DATA.levels.some(x=>x.id===parsed.activeLevelId)?parsed.activeLevelId:DATA.levels[0].id,
        practice: parsed.practice&&typeof parsed.practice==="object"?parsed.practice:{}
      };
    }catch(e){}
  }
  return empty;
}
function saveState(){
  try{
    state.activeLevelId=activeLevelId;
    localStorage.setItem(LS_KEY,JSON.stringify(state));
  }catch(e){console.warn("No se pudo guardar el progreso:",e);}
}
function reducedMotion(){return !!window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches}
function scrollTopSafe(){window.scrollTo({top:0,behavior:reducedMotion()?"auto":"smooth"})}

function showView(view){
  document.querySelectorAll(".view").forEach(v=>v.classList.add("hidden"));
  $(`${view}View`).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(btn=>{
    const active=btn.dataset.view===view;
    btn.classList.toggle("active",active);
    if(active) btn.setAttribute("aria-current","page"); else btn.removeAttribute("aria-current");
  });
  if(view==="curso") renderCourse();
  scrollTopSafe();
}

function renderLevelCards(){
  $("levelCards").innerHTML=DATA.levels.map((level,i)=>`
    <article class="level-card ${state.completed[level.id]?"completed":""}">
      <span class="level-number">Nivel ${i+1}</span>
      <h3>${escapeHtml(level.title)}</h3>
      <p>${escapeHtml(level.subtitle)}</p>
      <button type="button" data-open-level="${level.id}">Estudiar →</button>
    </article>`).join("");
  document.querySelectorAll("[data-open-level]").forEach(btn=>btn.addEventListener("click",()=>{
    activeLevelId=btn.dataset.openLevel; saveState(); showView("curso");
  }));
  updateHomeProgress();
}
function renderCourse(){
  stopAllAudio();
  const index=DATA.levels.findIndex(x=>x.id===activeLevelId);
  const level=DATA.levels[index]||DATA.levels[0];
  $("courseNav").innerHTML=DATA.levels.map((item,i)=>`
    <button class="course-nav-btn ${item.id===level.id?"active":""}" data-course-level="${item.id}" type="button" ${item.id===level.id?'aria-current="page"':""}>
      <span>${i+1}</span><span><b>${escapeHtml(item.title)}</b><small>${state.completed[item.id]?" · completado":""}</small></span>
    </button>`).join("");
  $("lessonContent").innerHTML=`
    <p class="kicker">Nivel ${index+1} de ${DATA.levels.length}</p>
    <h2 class="lesson-title">${escapeHtml(level.title)}</h2>
    <p class="lesson-lead">${escapeHtml(level.lead)}</p>
    ${level.blocks.map(block=>`
      <section class="lesson-block">
        <h3>${escapeHtml(block.title)}</h3>
        ${block.html}
      </section>`).join("")}
    ${renderInteractive(level)}
    ${renderTrainer(level)}
    ${renderSolfege(level)}
    ${renderQuickPractice(level)}
    <div class="lesson-actions">
      <button class="ghost-btn" id="prevLevelBtn" type="button" ${index===0?"disabled":""}>← Anterior</button>
      <button class="primary-btn complete-btn ${state.completed[level.id]?"done":""}" id="completeLevelBtn" type="button">
        ${state.completed[level.id]?"Nivel completado ✓":"Marcar como completado"}
      </button>
      <button class="ghost-btn" id="nextLevelBtn" type="button" ${index===DATA.levels.length-1?"disabled":""}>Siguiente →</button>
    </div>`;
  document.querySelectorAll("[data-course-level]").forEach(btn=>btn.addEventListener("click",()=>{
    activeLevelId=btn.dataset.courseLevel; saveState(); renderCourse(); scrollTopSafe();
  }));
  $("prevLevelBtn").addEventListener("click",()=>{
    if(index>0){activeLevelId=DATA.levels[index-1].id;saveState();renderCourse();scrollTopSafe();}
  });
  $("nextLevelBtn").addEventListener("click",()=>{
    if(index<DATA.levels.length-1){activeLevelId=DATA.levels[index+1].id;saveState();renderCourse();scrollTopSafe();}
  });
  $("completeLevelBtn").addEventListener("click",()=>{
    state.completed[level.id]=!state.completed[level.id];
    saveState();renderCourse();renderLevelCards();
  });
  mountInteractive(level);
  mountTrainer(level);
  mountSolfege(level);
  mountQuickPractice(level);
}
function updateHomeProgress(){
  const done=DATA.levels.filter(x=>state.completed[x.id]).length;
  $("homeProgressBar").style.width=`${(done/DATA.levels.length)*100}%`;
  $("homeProgressText").textContent=`${done}/${DATA.levels.length} niveles explorados`;
}

/* ===================== AUDIO ===================== */
function audioContext(){
  if(!AUDIO.ctx){
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC) return null;
    AUDIO.ctx=new AC();
    AUDIO.masterBus=AUDIO.ctx.createGain();
    AUDIO.masterBus.gain.value=2;
    AUDIO.masterBus.connect(AUDIO.ctx.destination);
  }
  if(AUDIO.ctx.state==="suspended") AUDIO.ctx.resume();
  return AUDIO.ctx;
}
function midiFreq(m){return 440*Math.pow(2,(m-69)/12)}
function ensurePianoSoundFont(){
  if(AUDIO.sfPlayer) return Promise.resolve(AUDIO.sfPlayer);
  if(AUDIO.sfFailed) return Promise.resolve(null);
  if(AUDIO.sfPromise) return AUDIO.sfPromise;
  const ctx=audioContext();
  if(!ctx||typeof window.Soundfont==="undefined"){
    AUDIO.sfFailed=true;
    return Promise.resolve(null);
  }
  AUDIO.sfPromise=window.Soundfont.instrument(ctx,"acoustic_grand_piano",{destination:AUDIO.masterBus})
    .then(player=>{AUDIO.sfPlayer=player;return player})
    .catch(error=>{AUDIO.sfFailed=true;console.warn("No se pudo cargar el piano acústico; se usará el respaldo sintético.",error);return null})
    .finally(()=>{AUDIO.sfPromise=null});
  return AUDIO.sfPromise;
}
function playPianoSample(player,midi,{duration,volume,delay}){
  const ctx=audioContext();if(!ctx||!player) return null;
  const start=ctx.currentTime+delay;
  try{
    const note=player.play(midi,start,{gain:volume,duration});
    if(note){
      AUDIO.nodes.push(note);
      window.setTimeout(()=>{AUDIO.nodes=AUDIO.nodes.filter(node=>node!==note)},Math.max(0,(delay+duration+.5)*1000));
    }
    return note;
  }catch(error){console.warn("No se pudo reproducir la muestra de piano.",error);return null}
}
function playOscillatorFallback(midi,{duration,volume,delay}){
  const ctx=audioContext(); if(!ctx) return;
  const t=ctx.currentTime+delay;
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type="triangle";osc.frequency.setValueAtTime(midiFreq(midi),t);
  gain.gain.setValueAtTime(.0001,t);
  gain.gain.exponentialRampToValueAtTime(volume,t+.015);
  gain.gain.exponentialRampToValueAtTime(.0001,t+duration);
  osc.connect(gain);gain.connect(AUDIO.masterBus||ctx.destination);osc.start(t);osc.stop(t+duration+.03);
  AUDIO.nodes.push(osc);
  osc.addEventListener("ended",()=>{AUDIO.nodes=AUDIO.nodes.filter(n=>n!==osc);try{osc.disconnect();gain.disconnect()}catch(e){}})
}
function playTone(midi,{duration=.55,volume=.16,delay=0}={}){
  if(AUDIO.sfPlayer) return playPianoSample(AUDIO.sfPlayer,midi,{duration,volume,delay});
  ensurePianoSoundFont().then(player=>{
    if(player) playPianoSample(player,midi,{duration,volume,delay});
    else playOscillatorFallback(midi,{duration,volume,delay});
  });
}
function stopAllAudio(){
  AUDIO.nodes.forEach(n=>{try{n.stop()}catch(e){}});
  AUDIO.nodes=[];
  if(AUDIO.metroTimer){clearInterval(AUDIO.metroTimer);AUDIO.metroTimer=null}
}
async function playSequence(midis,gap=360,onStep=()=>{}){
  stopAllAudio();
  const token=Date.now(); AUDIO.seq=token;
  for(let i=0;i<midis.length;i++){
    if(AUDIO.seq!==token) return;
    onStep(i);playTone(midis[i],{duration:Math.min(.65,gap/1000*.82)});
    await new Promise(r=>setTimeout(r,gap));
  }
  onStep(-1);
}
function playChord(midis){
  stopAllAudio();
  midis.forEach(m=>playTone(m,{duration:1.05,volume:.10}));
}

window.setTimeout(()=>{ensurePianoSoundFont()},100);

/* ===================== MUSIC HELPERS ===================== */
function rootInfo(name){
  const m=String(name).match(/^([A-G])(bb|##|b|#)?$/);
  const letter=m?.[1]||"C",acc=m?.[2]||"";
  const accVal={bb:-2,b:-1,"":0,"#":1,"##":2}[acc];
  return {letter,letterIndex:NATURAL.indexOf(letter),pc:(NATURAL_PC[letter]+accVal+12)%12};
}
function degreeToken(token){
  const m=String(token).match(/^(bb|##|b|#)?(\d+)$/);
  return {acc:m?.[1]||"",degree:Number(m?.[2]||1)};
}
function accVal(acc){return {bb:-2,b:-1,"":0,"#":1,"##":2}[acc]||0}
function accSymbol(diff){return ({[-2]:"♭♭",[-1]:"♭",[0]:"",[1]:"♯",[2]:"♯♯"})[diff]??""}
function spellTone(rootName,token){
  const root=rootInfo(rootName),d=degreeToken(token);
  const semi=(DEGREE_BASE[d.degree]??0)+accVal(d.acc);
  const pc=(root.pc+semi)%12;
  const letterIndex=(root.letterIndex+d.degree-1)%7;
  const naturalPc=NATURAL_PC[NATURAL[letterIndex]];
  let diff=((pc-naturalPc+18)%12)-6;
  diff=Math.max(-2,Math.min(2,diff));
  return {name:NATURAL[letterIndex]+accSymbol(diff),pc,semi,degree:d.degree,token,isRoot:d.degree===1&&d.acc===""};
}
function tones(rootName,tokens){return tokens.map(t=>spellTone(rootName,t))}
function rootMidi(rootName,oct=4){return (oct+1)*12+rootInfo(rootName).pc}
function midiNote(m){
  const pc=((m%12)+12)%12,oct=Math.floor(m/12)-1;
  return `${NOTE_NAMES[pc]}${oct}`;
}

/* ===================== VISUAL PRIMITIVES ===================== */
function pianoHTML(rootName,toneList,{octave=4,range=12}={}){
  const start=60; // C4
  const rootM=rootMidi(rootName,octave);
  const active=new Map();
  toneList.forEach(t=>active.set((rootM+t.semi-start)%24,{...t,midi:rootM+t.semi}));
  const whitePC=[0,2,4,5,7,9,11],blackMap={1:.72,3:1.72,6:3.72,8:4.72,10:5.72};
  const octaves=range>12?2:1;
  let whites="",blacks="";
  for(let o=0;o<octaves;o++){
    whitePC.forEach((pc,i)=>{
      const sem=o*12+pc,key=active.get(sem);
      whites+=`<div class="tlm-key white ${key?"on":""} ${key?.isRoot?"root":""}" style="left:${((o*7+i)/(octaves*7))*100}%;width:${100/(octaves*7)}%">
        ${key?`<span>${escapeHtml(key.name)}</span>`:""}
      </div>`;
    });
    Object.entries(blackMap).forEach(([pc,pos])=>{
      const sem=o*12+Number(pc),key=active.get(sem);
      blacks+=`<div class="tlm-key black ${key?"on":""} ${key?.isRoot?"root":""}" style="left:${((o*7+pos)/(octaves*7))*100}%;width:${60/(octaves*7)}%">
        ${key?`<span>${escapeHtml(key.name)}</span>`:""}
      </div>`;
    });
  }
  return `<div class="tlm-piano" style="--octaves:${octaves}">${whites}${blacks}</div>`;
}
function staffSVG(rootName,toneList,label="Pentagrama"){
  const root=rootInfo(rootName);
  const baseDiatonic=4*7+root.letterIndex;
  const e4=4*7+NATURAL.indexOf("E");
  const placed=toneList.map((t,i)=>({t,step:baseDiatonic+(t.degree-1)-e4,x:88+i*34}));
  const min=Math.min(0,...placed.map(p=>p.step)),max=Math.max(8,...placed.map(p=>p.step));
  const sh=5,top=Math.max(0,max-8)*sh+20,y=s=>top+(8-s)*sh,w=Math.max(300,128+placed.length*36),h=y(min)+26;
  const lines=[0,2,4,6,8].map(s=>`<line x1="20" x2="${w-18}" y1="${y(s)}" y2="${y(s)}"/>`).join("");
  const notes=placed.map(p=>{
    const ledger=[];
    if(p.step>8)for(let s=10;s<=p.step;s+=2)ledger.push(`<line class="ledger" x1="${p.x-10}" x2="${p.x+10}" y1="${y(s)}" y2="${y(s)}"/>`);
    if(p.step<0)for(let s=-2;s>=p.step;s-=2)ledger.push(`<line class="ledger" x1="${p.x-10}" x2="${p.x+10}" y1="${y(s)}" y2="${y(s)}"/>`);
    const accidental=p.t.name.slice(1);
    return `${ledger.join("")}${accidental?`<text class="acc" x="${p.x-14}" y="${y(p.step)+4}">${escapeHtml(accidental)}</text>`:""}
      <ellipse class="note ${p.t.isRoot?"root":""}" cx="${p.x}" cy="${y(p.step)}" rx="6" ry="4.5" transform="rotate(-18 ${p.x} ${y(p.step)})"/>
      <text class="degree" x="${p.x}" y="${h-4}" text-anchor="middle">${escapeHtml(p.t.token.replace(/b/g,"♭").replace(/#/g,"♯"))}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${w} ${h}" class="tlm-staff" role="img" aria-label="${escAttr(label)}">${lines}<text class="clef-text tlm-clef" x="24" y="${top+39}">${SMUFL_GLYPHS.gClef}</text>${notes}</svg>`;
}
function guitarScaleSVG(rootName,toneList){
  const pcs=new Set(toneList.map(t=>t.pc)),rootPc=rootInfo(rootName).pc;
  const strings=[4,11,7,2,9,4],labels=["E","B","G","D","A","E"],frets=12,gapX=34,gapY=27,ml=30,mt=14,w=ml+frets*gapX+48,h=mt+5*gapY+28;
  const grid=labels.map((lab,r)=>`<text x="12" y="${mt+r*gapY+4}">${lab}</text><line x1="${ml}" x2="${w-14}" y1="${mt+r*gapY}" y2="${mt+r*gapY}"/>`).join("")
    +Array.from({length:frets+1},(_,f)=>`<line x1="${ml+20+f*gapX}" x2="${ml+20+f*gapX}" y1="${mt}" y2="${mt+5*gapY}"/><text class="fret" x="${ml+20+f*gapX}" y="${h-5}" text-anchor="middle">${f}</text>`).join("");
  let dots="";
  strings.forEach((open,r)=>{for(let f=0;f<=frets;f++){const pc=(open+f)%12;if(!pcs.has(pc))continue;const x=ml+20+f*gapX,y=mt+r*gapY,isRoot=pc===rootPc;dots+=`<circle class="dot ${isRoot?"root":""}" cx="${x}" cy="${y}" r="8"/>${isRoot?`<text class="dotlabel" x="${x}" y="${y+3}" text-anchor="middle">R</text>`:""}`;}});
  return `<svg viewBox="0 0 ${w} ${h}" class="tlm-guitar" role="img" aria-label="Mapa de escala en guitarra">${grid}${dots}</svg>`;
}
function rootOptions(selected="C"){return ROOTS.map(r=>`<option value="${r.value}" ${r.value===selected?"selected":""}>${r.label}</option>`).join("")}

/* ===================== LEVEL WIDGETS ===================== */
function renderInteractive(level){
  return `<section class="interactive-section">
    <header class="interactive-head">
      <p class="kicker">Laboratorio interactivo</p>
      <h3>${interactiveTitle(level.id)}</h3>
      <p>${interactiveDescription(level.id)}</p>
    </header>
    <div id="interactiveMount" class="interactive-mount" data-level="${level.id}"></div>
  </section>`;
}
function interactiveTitle(id){
  return ({
    musica:"Escuchar las propiedades del sonido",
    lectura:"Leer altura y duración",
    ritmo:"Pulso, compás y patrón",
    intervalos:"Explorador visual y auditivo de intervalos",
    escalas:"Explorador de escalas",
    tonalidad:"Círculo de quintas y centro tonal",
    "puente-armonia":"Laboratorio de melodía y puente hacia la armonía"
  })[id]||"Laboratorio";
}
function interactiveDescription(id){
  return ({
    musica:"Modifica altura, duración, intensidad y timbre y escucha cómo cambia el mismo sonido.",
    lectura:"Identifica notas en el pentagrama y relaciona figuras con su duración.",
    ritmo:"Escucha el pulso, cambia el compás y construye un patrón sencillo.",
    intervalos:"Selecciona una nota y un intervalo para verlo en piano y pentagrama y escucharlo melódico o armónico.",
    escalas:"Escoge tónica y tipo de escala y compárala en piano, guitarra y pentagrama.",
    tonalidad:"Selecciona una tonalidad desde el círculo de quintas y observa sus notas, armadura y jerarquía básica.",
    "puente-armonia":"Analiza motivos, contorno, grados conjuntos, saltos y secuencias; después conecta la melodía con tríadas y armonía."
  })[id]||"";
}
function mountInteractive(level){
  const el=$("interactiveMount"); if(!el)return;
  if(level.id==="musica") mountSoundLab(el);
  else if(level.id==="lectura") mountReadingLab(el);
  else if(level.id==="ritmo") {
    mountRhythmLab(el);
    mountAdvancedRhythmLab(el);
  }
  else if(level.id==="intervalos") mountIntervalLab(el);
  else if(level.id==="escalas") mountScaleLab(el);
  else if(level.id==="tonalidad") mountTonalityLab(el);
  else if(level.id==="expresion-forma") mountExpressionFormLab(el);
  else if(level.id==="puente-armonia") {
    mountMelodyLab(el);
    mountTriadLab(el);
  }
}

/* SONIDO */
function mountSoundLab(el){
  el.innerHTML=`<div class="lab-card">
    <div class="controls-grid">
      <label>Altura <input type="range" min="48" max="84" value="60" data-sound-pitch><span data-sound-pitch-label>C4</span></label>
      <label>Duración <input type="range" min="10" max="160" value="60" data-sound-duration><span data-sound-duration-label>0.60 s</span></label>
      <label>Intensidad <input type="range" min="3" max="30" value="16" data-sound-volume><span data-sound-volume-label>media</span></label>
      <label>Instrumento <span class="fixed-control">Piano acústico</span></label>
    </div>
    <div class="sound-visual"><div class="wave-shape" data-wave-shape></div><div><b data-sound-note>C4</b><span>misma nota, propiedades diferentes</span></div></div>
    <div class="lab-actions"><button class="primary-btn" data-play-sound>▶ Escuchar</button><button class="ghost-btn" data-play-pillar>▶ Comparar ritmo/melodía</button></div>
    <div class="compare-copy" data-pillar-copy>Prueba primero el sonido individual.</div>
  </div>`;
  const pitch=el.querySelector("[data-sound-pitch]"),dur=el.querySelector("[data-sound-duration]"),vol=el.querySelector("[data-sound-volume]");
  const update=()=>{
    el.querySelector("[data-sound-pitch-label]").textContent=midiNote(Number(pitch.value));
    el.querySelector("[data-sound-note]").textContent=midiNote(Number(pitch.value));
    el.querySelector("[data-sound-duration-label]").textContent=(Number(dur.value)/100).toFixed(2)+" s";
    el.querySelector("[data-sound-volume-label]").textContent=Number(vol.value)<10?"suave":Number(vol.value)>22?"fuerte":"media";
  };
  [pitch,dur,vol].forEach(x=>x.addEventListener("input",update));update();
  el.querySelector("[data-play-sound]").addEventListener("click",()=>playTone(Number(pitch.value),{duration:Number(dur.value)/100,volume:Number(vol.value)/100}));
  let mode=0;
  el.querySelector("[data-play-pillar]").addEventListener("click",()=>{
    mode=(mode+1)%3;
    const copy=el.querySelector("[data-pillar-copy]");
    if(mode===0){copy.textContent="Mismas alturas, ritmo uniforme.";playSequence([60,62,64,65],[].length?0:420)}
    if(mode===1){copy.textContent="Mismas alturas, ritmo más corto: cambia la sensación temporal.";playSequence([60,62,64,65],220)}
    if(mode===2){copy.textContent="Mismo ritmo, otras alturas: cambia la melodía.";playSequence([60,63,67,65],420)}
  });
}

/* LECTURA */
const TREBLE_STAFF_NOTES=["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5","A5"];
const BASS_STAFF_NOTES=["E2","F2","G2","A2","B2","C3","D3","E3","F3","G3","A3","B3","C4"];
const SMUFL_GLYPHS=Object.freeze({
  gClef:String.fromCodePoint(0xE050),
  fClef:String.fromCodePoint(0xE062),
  metNoteWhole:String.fromCodePoint(0xECA2),
  metNoteHalfUp:String.fromCodePoint(0xECA3),
  metNoteQuarterUp:String.fromCodePoint(0xECA5),
  metNote8thUp:String.fromCodePoint(0xECA7)
});
function smuflTimeDigit(value){const digit=Number(value);return Number.isInteger(digit)&&digit>=0&&digit<=9?String.fromCodePoint(0xE080+digit):String(value)}
function staffTrainerSVG(note,clef){
  const notes=clef==="treble"?TREBLE_STAFF_NOTES:BASS_STAFF_NOTES,index=notes.indexOf(note),step=index-2,w=360,h=130,baseY=82,sh=6;
  const lines=[0,2,4,6,8].map(s=>`<line x1="28" x2="330" y1="${baseY-s*sh}" y2="${baseY-s*sh}"/>`).join("");
  const y=baseY-step*sh;
  const ledger=[];
  if(step<0)for(let s=-2;s>=step;s-=2)ledger.push(`<line class="ledger" x1="180" x2="200" y1="${baseY-s*sh}" y2="${baseY-s*sh}"/>`);
  if(step>8)for(let s=10;s<=step;s+=2)ledger.push(`<line class="ledger" x1="180" x2="200" y1="${baseY-s*sh}" y2="${baseY-s*sh}"/>`);
  return `<svg viewBox="0 0 ${w} ${h}" class="reading-staff" role="img" aria-label="Nota para identificar en clave de ${clef==="treble"?"sol":"fa"}">
    ${lines}<text class="clef-text" x="34" y="78">${clef==="treble"?SMUFL_GLYPHS.gClef:SMUFL_GLYPHS.fClef}</text>${ledger.join("")}
    <ellipse class="student-note" cx="190" cy="${y}" rx="8" ry="5.5" transform="rotate(-18 190 ${y})"/>
  </svg>`;
}
const NOTE_SOLFEGE={C:"Do",D:"Re",E:"Mi",F:"Fa",G:"Sol",A:"La",B:"Si"};
function staffReferenceSVG(clef){
  const notes=clef==="treble"?TREBLE_STAFF_NOTES:BASS_STAFF_NOTES,w=720,h=170,baseY=91,sh=6;
  const lines=[0,2,4,6,8].map(s=>`<line x1="70" x2="690" y1="${baseY-s*sh}" y2="${baseY-s*sh}"/>`).join("");
  const noteGroups=notes.map((note,index)=>{
    const step=index-2,x=112+index*44,y=baseY-step*sh,ledger=[];
    if(step<0)for(let s=-2;s>=step;s-=2)ledger.push(`<line class="ledger" x1="${x-11}" x2="${x+11}" y1="${baseY-s*sh}" y2="${baseY-s*sh}"/>`);
    if(step>8)for(let s=10;s<=step;s+=2)ledger.push(`<line class="ledger" x1="${x-11}" x2="${x+11}" y1="${baseY-s*sh}" y2="${baseY-s*sh}"/>`);
    const letter=note[0],octave=note.slice(1),spoken=`${NOTE_SOLFEGE[letter]} ${octave}`;
    return `<g class="reference-note" role="button" tabindex="0" data-reference-note="${note}" aria-label="${spoken}: escuchar">${ledger.join("")}<ellipse cx="${x}" cy="${y}" rx="8" ry="5.5" transform="rotate(-18 ${x} ${y})"/><text x="${x}" y="137" text-anchor="middle">${NOTE_SOLFEGE[letter]}</text><text class="reference-scientific" x="${x}" y="151" text-anchor="middle">${note}</text></g>`;
  }).join("");
  const clefName=clef==="treble"?"sol":"fa";
  return `<div class="staff-reference"><div class="staff-reference-title">Clave de ${clefName}</div><svg viewBox="0 0 ${w} ${h}" class="reading-staff reference-staff" role="img" aria-label="Ubicación de las notas en clave de ${clefName}">${lines}<text class="clef-text" x="25" y="87">${clef==="treble"?SMUFL_GLYPHS.gClef:SMUFL_GLYPHS.fClef}</text>${noteGroups}</svg></div>`;
}
function mountReadingLab(el){
  const rhythmValues=[{name:"Redonda",beats:4},{name:"Blanca",beats:2},{name:"Negra",beats:1},{name:"Corchea",beats:.5},{name:"Semicorchea",beats:.25},{name:"Fusa",beats:.125},{name:"Semifusa",beats:.0625}];
  el.innerHTML=`<div class="visual-two">
    <section class="lab-card staff-map-card">
      <div class="diagram-label">Mapa de notas en el pentagrama</div>
      <p class="staff-reference-copy">Observa primero dónde se escribe cada nota. Selecciona una clave y pulsa cualquier nota para escucharla.</p>
      <div class="controls-row"><label>Mostrar <select data-reference-clef><option value="treble">Clave de sol</option><option value="bass">Clave de fa</option><option value="both" selected>Ambas claves</option></select></label></div>
      <div class="staff-reference-stack" data-reading-reference></div>
    </section>
    <section class="lab-card">
      <div class="diagram-label">Audición de duraciones</div>
      <p class="staff-reference-copy">La referencia gráfica completa está en la tabla superior. Aquí puedes escuchar cuánto dura cada valor si la negra equivale a un pulso.</p>
      <div class="controls-row"><label>Valor <select data-rhythm-audition>${rhythmValues.map(value=>`<option value="${value.beats}">${value.name} · ${value.beats} pulso${value.beats===1?"":"s"}</option>`).join("")}</select></label><button class="primary-btn" data-play-rhythm-value>▶ Escuchar duración</button></div>
      <p class="feedback" data-figure-feedback>Selecciona un valor y escúchalo con el piano acústico.</p>
    </section>
  </div>`;
  const renderReference=()=>{
    const choice=el.querySelector("[data-reference-clef]").value;
    const clefs=choice==="both"?["treble","bass"]:[choice];
    const mount=el.querySelector("[data-reading-reference]");
    mount.innerHTML=clefs.map(staffReferenceSVG).join("");
    mount.querySelectorAll("[data-reference-note]").forEach(note=>{
      const play=()=>{const name=note.dataset.referenceNote;playTone(rootMidi(name.slice(0,-1),Number(name.slice(-1))),{duration:.7,volume:.18})};
      note.addEventListener("click",play);
      note.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();play()}});
    });
  };
  el.querySelector("[data-reference-clef]").addEventListener("change",renderReference);
  el.querySelector("[data-play-rhythm-value]").addEventListener("click",()=>{
    const select=el.querySelector("[data-rhythm-audition]"),beats=Number(select.value),seconds=Math.max(.08,beats*.5);
    playTone(60,{duration:seconds,volume:.12});
    el.querySelector("[data-figure-feedback]").textContent=`${select.options[select.selectedIndex].textContent}: duración relativa con negra = 1 pulso.`;
  });
  renderReference();
}

/* RITMO */
function mountRhythmLab(el){
  el.innerHTML=`<div class="lab-card">
    <div class="controls-grid compact">
      <label>Tempo <input type="range" min="40" max="180" value="90" data-bpm><span data-bpm-label>90 BPM</span></label>
      <label>Compás <select data-meter><option value="4">4/4</option><option value="3">3/4</option><option value="2">2/4</option><option value="6">6/8</option></select></label>
    </div>
    <div class="beat-row" data-beats></div>
    <div class="lab-actions"><button class="primary-btn" data-metro>▶ Iniciar pulso</button><button class="ghost-btn" data-stop-metro>■ Detener</button></div>
    <div class="rhythm-builder"><p><b>Patrón de 8 subdivisiones</b> · activa/desactiva golpes:</p><div class="step-row" data-rhythm-steps>${Array.from({length:8},(_,i)=>`<button class="rhythm-step ${i%2===0?"on":""}" data-step="${i}">${i+1}</button>`).join("")}</div><button class="ghost-btn" data-play-pattern>▶ Escuchar patrón</button></div>
  </div>`;
  const bpm=el.querySelector("[data-bpm]"),meter=el.querySelector("[data-meter]");
  const renderBeats=()=>{const n=Number(meter.value);el.querySelector("[data-beats]").innerHTML=Array.from({length:n},(_,i)=>`<span class="beat ${i===0?"accent":n===6&&i===3?"secondary-accent":""}" data-beat="${i}">${i+1}</span>`).join("")};
  bpm.addEventListener("input",()=>el.querySelector("[data-bpm-label]").textContent=`${bpm.value} BPM`);meter.addEventListener("change",renderBeats);renderBeats();
  el.querySelector("[data-metro]").addEventListener("click",()=>{
    stopAllAudio();AUDIO.metroBeat=0;
    const tick=()=>{const beats=[...el.querySelectorAll(".beat")],position=AUDIO.metroBeat%beats.length;beats.forEach((b,i)=>b.classList.toggle("active",i===position));playTone(position===0?84:beats.length===6&&position===3?82:79,{duration:.07,volume:.13});AUDIO.metroBeat++};
    tick();AUDIO.metroTimer=setInterval(tick,60000/Number(bpm.value));
  });
  el.querySelector("[data-stop-metro]").addEventListener("click",()=>{stopAllAudio();el.querySelectorAll(".beat").forEach(b=>b.classList.remove("active"))});
  el.querySelectorAll(".rhythm-step").forEach(btn=>btn.addEventListener("click",()=>btn.classList.toggle("on")));
  el.querySelector("[data-play-pattern]").addEventListener("click",async()=>{
    stopAllAudio();const steps=[...el.querySelectorAll(".rhythm-step")],gap=(60000/Number(bpm.value))/2;
    for(let i=0;i<steps.length;i++){steps.forEach((s,j)=>s.classList.toggle("active",i===j));if(steps[i].classList.contains("on"))playTone(i===0?84:79,{duration:.06,volume:.13});await new Promise(r=>setTimeout(r,gap));}
    steps.forEach(s=>s.classList.remove("active"));
  });
}

/* INTERVAL */
function mountIntervalLab(el){
  el.innerHTML=`<div class="lab-card">
    <div class="controls-row"><label>Nota base <select data-int-root>${rootOptions()}</select></label><label>Intervalo <select data-int-type>${INTERVALS.map(i=>`<option value="${i.id}">${i.label}</option>`).join("")}</select></label></div>
    <div class="summary-line"><strong data-int-title></strong><span data-int-semi></span></div>
    <div class="visual-two"><section class="visual-box"><div class="diagram-label">Piano</div><div data-int-piano></div></section><section class="visual-box"><div class="diagram-label">Pentagrama</div><div data-int-staff></div></section></div>
    <div class="lab-actions"><button class="primary-btn" data-int-melodic>▶ Melódico</button><button class="ghost-btn" data-int-harmonic>▶ Armónico</button></div>
  </div>`;
  const root=el.querySelector("[data-int-root]"),sel=el.querySelector("[data-int-type]");
  const current=()=>{const i=INTERVALS.find(x=>x.id===sel.value)||INTERVALS[0],ts=tones(root.value,["1",i.token]);return{i,ts}};
  const update=()=>{const {i,ts}=current();el.querySelector("[data-int-title]").textContent=`${ROOTS.find(r=>r.value===root.value)?.label} → ${ts[1].name} · ${i.label}`;el.querySelector("[data-int-semi]").textContent=`${i.semitones} semitonos`;el.querySelector("[data-int-piano]").innerHTML=pianoHTML(root.value,ts,{range:i.semitones>=12?24:12});el.querySelector("[data-int-staff]").innerHTML=staffSVG(root.value,ts,i.label)};
  [root,sel].forEach(x=>x.addEventListener("change",update));update();
  el.querySelector("[data-int-melodic]").addEventListener("click",()=>{const {i}=current(),m=rootMidi(root.value,4);playSequence([m,m+i.semitones],500)});
  el.querySelector("[data-int-harmonic]").addEventListener("click",()=>{const {i}=current(),m=rootMidi(root.value,4);playChord([m,m+i.semitones])});
}

/* SCALES */
function mountScaleLab(el){
  el.innerHTML=`<div class="lab-card">
    <div class="controls-row"><label>Tónica <select data-scale-root>${rootOptions()}</select></label><label>Escala <select data-scale-type>${SCALES.map(s=>`<option value="${s.id}">${s.label}</option>`).join("")}</select></label></div>
    <div class="summary-line"><strong data-scale-title></strong><span data-scale-pattern></span></div><div class="note-pills" data-scale-notes></div>
    <div class="visual-three"><section class="visual-box"><div class="diagram-label">Piano</div><div data-scale-piano></div></section><section class="visual-box"><div class="diagram-label">Guitarra</div><div class="scroll-x" data-scale-guitar></div></section><section class="visual-box"><div class="diagram-label">Pentagrama</div><div class="scroll-x" data-scale-staff></div></section></div>
    <div class="lab-actions"><button class="primary-btn" data-scale-play>▶ Escuchar escala</button><button class="ghost-btn" data-scale-chord>▶ Notas simultáneas</button></div>
  </div>`;
  const root=el.querySelector("[data-scale-root]"),sel=el.querySelector("[data-scale-type]");
  const current=()=>{const s=SCALES.find(x=>x.id===sel.value)||SCALES[0],ts=tones(root.value,s.tokens);return{s,ts}};
  const update=()=>{const {s,ts}=current();el.querySelector("[data-scale-title]").textContent=`${ROOTS.find(r=>r.value===root.value)?.label} ${s.label}`;el.querySelector("[data-scale-pattern]").textContent=s.pattern;el.querySelector("[data-scale-notes]").innerHTML=ts.map(t=>`<span>${escapeHtml(t.name)} <small>${escapeHtml(t.token.replace(/b/g,"♭").replace(/#/g,"♯"))}</small></span>`).join("");el.querySelector("[data-scale-piano]").innerHTML=pianoHTML(root.value,ts,{range:12});el.querySelector("[data-scale-guitar]").innerHTML=guitarScaleSVG(root.value,ts);el.querySelector("[data-scale-staff]").innerHTML=staffSVG(root.value,ts,`${s.label}`)};
  [root,sel].forEach(x=>x.addEventListener("change",update));update();
  el.querySelector("[data-scale-play]").addEventListener("click",()=>{const {ts}=current(),m=rootMidi(root.value,4);playSequence(ts.map(t=>m+t.semi),340)});
  el.querySelector("[data-scale-chord]").addEventListener("click",()=>{const {ts}=current(),m=rootMidi(root.value,4);playChord(ts.slice(0,-1).map(t=>m+t.semi))});
}

/* TONALITY */
const FIFTHS=["C","G","D","A","E","B","Gb","Db","Ab","Eb","Bb","F"];
const KEY_SIG={C:"0 alteraciones",G:"1♯",D:"2♯",A:"3♯",E:"4♯",B:"5♯",Gb:"6♭",Db:"5♭",Ab:"4♭",Eb:"3♭",Bb:"2♭",F:"1♭"};
function mountTonalityLab(el){
  el.innerHTML=`<div class="lab-card">
    <div class="fifths-wheel" data-fifths>${FIFTHS.map((k,i)=>`<button style="--i:${i}" data-key="${k}">${ROOTS.find(r=>r.value===k)?.label||k}</button>`).join("")}<div class="wheel-center"><b data-key-center>C</b><span>Tónica</span></div></div>
    <div class="key-info"><h4 data-key-title>C mayor</h4><p data-key-signature>0 alteraciones</p><div class="note-pills" data-key-notes></div></div>
    <div class="visual-two"><section class="visual-box"><div class="diagram-label">Escala tonal</div><div data-key-piano></div></section><section class="visual-box"><div class="diagram-label">Jerarquía básica</div><div class="degree-function-grid" data-key-functions></div></section></div>
    <button class="primary-btn" data-key-play>▶ Escuchar tonalidad</button>
  </div>`;
  let key="C";
  const update=()=>{
    const ts=tones(key,SCALES[0].tokens),name=ROOTS.find(r=>r.value===key)?.label||key;
    el.querySelector("[data-key-center]").textContent=name;el.querySelector("[data-key-title]").textContent=`${name} mayor`;el.querySelector("[data-key-signature]").textContent=`Armadura: ${KEY_SIG[key]}`;el.querySelector("[data-key-notes]").innerHTML=ts.slice(0,7).map(t=>`<span>${t.name}</span>`).join("");el.querySelector("[data-key-piano]").innerHTML=pianoHTML(key,ts,{range:12});
    const roman=["I","ii","iii","IV","V","vi","vii°"],fn=["Tónica","Subdominante","Tónica","Subdominante","Dominante","Tónica","Dominante"];
    el.querySelector("[data-key-functions]").innerHTML=ts.slice(0,7).map((t,i)=>`<div class="degree-function ${fn[i].toLowerCase()}"><b>${roman[i]}</b><span>${t.name}</span><small>${fn[i]}</small></div>`).join("");
    el.querySelectorAll("[data-key]").forEach(b=>b.classList.toggle("active",b.dataset.key===key));
  };
  el.querySelectorAll("[data-key]").forEach(b=>b.addEventListener("click",()=>{key=b.dataset.key;update()}));update();
  el.querySelector("[data-key-play]").addEventListener("click",()=>{const ts=tones(key,SCALES[0].tokens),m=rootMidi(key,4);playSequence(ts.map(t=>m+t.semi),340)});
}

/* TRIADS */
const TRIADS=[
  {id:"major",label:"Mayor",tokens:["1","3","5"]},
  {id:"minor",label:"Menor",tokens:["1","b3","5"]},
  {id:"aug",label:"Aumentada",tokens:["1","3","#5"]},
  {id:"dim",label:"Disminuida",tokens:["1","b3","b5"]}
];
function mountTriadLab(el){
  el.innerHTML=`<div class="lab-card">
    <div class="controls-row"><label>Fundamental <select data-triad-root>${rootOptions()}</select></label><label>Tipo <select data-triad-type>${TRIADS.map(t=>`<option value="${t.id}">${t.label}</option>`).join("")}</select></label></div>
    <div class="summary-line"><strong data-triad-title></strong><span data-triad-formula></span></div><div class="note-pills" data-triad-notes></div>
    <div class="visual-two"><section class="visual-box"><div class="diagram-label">Piano</div><div data-triad-piano></div></section><section class="visual-box"><div class="diagram-label">Pentagrama</div><div data-triad-staff></div></section></div>
    <div class="lab-actions"><button class="primary-btn" data-triad-play>▶ Escuchar acorde</button><button class="ghost-btn" data-triad-arp>▶ Arpegiar</button></div>
  </div>`;
  const root=el.querySelector("[data-triad-root]"),sel=el.querySelector("[data-triad-type]");
  const current=()=>{const q=TRIADS.find(x=>x.id===sel.value)||TRIADS[0],ts=tones(root.value,q.tokens);return{q,ts}};
  const update=()=>{const {q,ts}=current(),r=ROOTS.find(x=>x.value===root.value)?.label||root.value;el.querySelector("[data-triad-title]").textContent=`${r} ${q.label}`;el.querySelector("[data-triad-formula]").textContent=q.tokens.join(" ").replace(/b/g,"♭").replace(/#/g,"♯");el.querySelector("[data-triad-notes]").innerHTML=ts.map(t=>`<span>${t.name}</span>`).join("");el.querySelector("[data-triad-piano]").innerHTML=pianoHTML(root.value,ts,{range:12});el.querySelector("[data-triad-staff]").innerHTML=staffSVG(root.value,ts,`${q.label}`)};
  [root,sel].forEach(x=>x.addEventListener("change",update));update();
  el.querySelector("[data-triad-play]").addEventListener("click",()=>{const {ts}=current(),m=rootMidi(root.value,4);playChord(ts.map(t=>m+t.semi))});
  el.querySelector("[data-triad-arp]").addEventListener("click",()=>{const {ts}=current(),m=rootMidi(root.value,4);playSequence(ts.map(t=>m+t.semi),380)});
}

/* ===================== PRACTICE ===================== */
const QUICK_PRACTICE={
  musica:{q:"¿Qué propiedad del sonido determina principalmente si lo percibimos grave o agudo?",choices:["Altura","Duración","Intensidad"],a:0,why:"La altura distingue sonidos graves y agudos."},
  lectura:{q:"En la notación tradicional, ¿qué dimensión representa principalmente la posición vertical?",choices:["Altura","Tiempo","Tempo"],a:0,why:"La posición vertical representa altura; el eje horizontal organiza el tiempo."},
  ritmo:{q:"¿Qué describe el tempo?",choices:["La velocidad del pulso","El nombre de la nota","La tonalidad"],a:0,why:"El tempo indica la velocidad del pulso."},
  intervalos:{q:"¿Cuántos semitonos contiene una quinta justa?",choices:["5","7","9"],a:1,why:"La quinta justa contiene 7 semitonos."},
  escalas:{q:"¿Por qué estudiar intervalos antes de escalas?",choices:["Porque las escalas se construyen mediante patrones de intervalos","Porque eliminan el ritmo","Porque todas las escalas tienen las mismas notas"],a:0,why:"Las escalas son organizaciones de alturas definidas por relaciones interválicas."},
  tonalidad:{q:"¿Qué concepto establece el centro de una tonalidad?",choices:["Tónica","Corchea","Timbre"],a:0,why:"La tónica funciona como centro de referencia tonal."},
  "expresion-forma":{q:"¿Qué elemento describe cómo se relacionan varias capas musicales?",choices:["Textura","Armadura","Intervalo"],a:0,why:"La textura describe la relación entre líneas o capas musicales."},
  "puente-armonia":{q:"¿Qué tres grados forman una tríada mayor básica?",choices:["1–3–5","1–2–4","1–4–7"],a:0,why:"La tríada mayor se forma con fundamental, tercera mayor y quinta justa."}
};
function renderQuickPractice(level){
  const q=QUICK_PRACTICE[level.id];if(!q)return"";
  return `<section class="quick-practice" data-practice="${level.id}">
    <div><p class="kicker">Comprueba lo aprendido</p><h3>Pregunta rápida</h3><p>${escapeHtml(q.q)}</p></div>
    <div class="quick-options">${q.choices.map((c,i)=>`<button data-choice="${i}">${escapeHtml(c)}</button>`).join("")}</div>
    <p class="feedback" data-practice-feedback aria-live="polite"></p>
  </section>`;
}
function mountQuickPractice(level){
  const root=document.querySelector(`[data-practice="${level.id}"]`),q=QUICK_PRACTICE[level.id];if(!root||!q)return;
  root.querySelectorAll("[data-choice]").forEach(btn=>btn.addEventListener("click",()=>{
    const chosen=Number(btn.dataset.choice),ok=chosen===q.a;
    root.querySelectorAll("[data-choice]").forEach(b=>{b.disabled=true;const i=Number(b.dataset.choice);if(i===q.a)b.classList.add("correct");else if(i===chosen)b.classList.add("wrong")});
    root.querySelector("[data-practice-feedback]").textContent=(ok?"Correcto. ":"Revisa: ")+q.why;
    state.practice[level.id]=ok;saveState();
  }));
}



/* ===================== FASE 5 · RITMO AVANZADO ===================== */

const ADV_RHYTHM_EXAMPLES = {
  rests: {
    label: "Silencios",
    description: "Alterna ataque y silencio manteniendo el pulso.",
    meter: "4/4",
    events: [
      {kind:"note",beats:1,label:"♩"},
      {kind:"rest",beats:1,label:"𝄽"},
      {kind:"note",beats:1,label:"♩"},
      {kind:"rest",beats:1,label:"𝄽"}
    ]
  },
  dotted: {
    label: "Puntillo",
    description: "Una negra con puntillo dura un pulso y medio.",
    meter: "4/4",
    events: [
      {kind:"note",beats:1.5,label:"♩."},
      {kind:"note",beats:.5,label:"♪"},
      {kind:"note",beats:2,label:"𝅗𝅥"}
    ]
  },
  tie: {
    label: "Ligadura de prolongación",
    description: "Dos duraciones se suman sin repetir el ataque.",
    meter: "4/4",
    events: [
      {kind:"note",beats:1,label:"♩",tieStart:true},
      {kind:"note",beats:1,label:"♩",tied:true},
      {kind:"note",beats:2,label:"𝅗𝅥"}
    ]
  },
  syncopation: {
    label: "Síncopa",
    description: "El ataque aparece en una subdivisión débil y se prolonga sobre una parte fuerte.",
    meter: "4/4",
    events: [
      {kind:"rest",beats:.5,label:"𝄾"},
      {kind:"note",beats:1.5,label:"♪—♩"},
      {kind:"rest",beats:.5,label:"𝄾"},
      {kind:"note",beats:1.5,label:"♪—♩"}
    ]
  },
  offbeat: {
    label: "Contratiempo",
    description: "Los ataques ocurren en posiciones débiles y los tiempos fuertes quedan en silencio.",
    meter: "4/4",
    events: [
      {kind:"rest",beats:.5,label:"𝄾"},
      {kind:"note",beats:.5,label:"♪"},
      {kind:"rest",beats:.5,label:"𝄾"},
      {kind:"note",beats:.5,label:"♪"},
      {kind:"rest",beats:.5,label:"𝄾"},
      {kind:"note",beats:.5,label:"♪"},
      {kind:"rest",beats:.5,label:"𝄾"},
      {kind:"note",beats:.5,label:"♪"}
    ]
  },
  triplet: {
    label: "Tresillo",
    description: "Tres ataques iguales ocupan un pulso de negra.",
    meter: "4/4",
    events: [
      {kind:"triplet",beats:1/3,label:"♪"},
      {kind:"triplet",beats:1/3,label:"♪"},
      {kind:"triplet",beats:1/3,label:"♪"},
      {kind:"note",beats:1,label:"♩"},
      {kind:"note",beats:2,label:"𝅗𝅥"}
    ]
  },
  compound: {
    label: "Compás compuesto · 6/8",
    description: "Se perciben dos pulsos principales, cada uno subdividido en tres corcheas.",
    meter: "6/8",
    compound:true,
    events: [
      {kind:"note",beats:1/3,label:"♪"},
      {kind:"note",beats:1/3,label:"♪"},
      {kind:"note",beats:1/3,label:"♪"},
      {kind:"note",beats:1/3,label:"♪"},
      {kind:"note",beats:1/3,label:"♪"},
      {kind:"note",beats:1/3,label:"♪"}
    ]
  }
};

function mountAdvancedRhythmLab(parent){
  const wrapper=document.createElement("section");
  wrapper.className="advanced-rhythm-lab";
  wrapper.innerHTML=`<div class="advanced-rhythm-head">
    <div>
      <p class="kicker">Ritmo avanzado</p>
      <h4>Silencios, puntillo, ligadura, síncopa, tresillos y 6/8</h4>
      <p>Selecciona un concepto, observa cómo ocupa el pulso y escucha la diferencia.</p>
    </div>
  </div>
  <div class="controls-row">
    <label>Concepto <select data-ar-type>
      ${Object.entries(ADV_RHYTHM_EXAMPLES).map(([id,ex])=>`<option value="${id}">${escapeHtml(ex.label)}</option>`).join("")}
    </select></label>
    <label>BPM <input type="range" min="50" max="130" value="80" data-ar-bpm><span data-ar-bpm-label>80</span></label>
  </div>
  <div class="advanced-rhythm-summary">
    <strong data-ar-title></strong>
    <span data-ar-meter></span>
    <p data-ar-desc></p>
  </div>
  <div class="advanced-rhythm-grid" data-ar-grid></div>
  <div class="lab-actions">
    <button class="primary-btn" data-ar-play>▶ Escuchar ejemplo</button>
    <button class="ghost-btn" data-ar-count>▶ Escuchar pulso base</button>
  </div>`;
  parent.appendChild(wrapper);

  const type=wrapper.querySelector("[data-ar-type]");
  const bpm=wrapper.querySelector("[data-ar-bpm]");
  let current=ADV_RHYTHM_EXAMPLES[type.value];

  function render(){
    current=ADV_RHYTHM_EXAMPLES[type.value];
    wrapper.querySelector("[data-ar-title]").textContent=current.label;
    wrapper.querySelector("[data-ar-meter]").textContent=current.meter;
    wrapper.querySelector("[data-ar-desc]").textContent=current.description;
    wrapper.querySelector("[data-ar-grid]").innerHTML=current.events.map((ev,i)=>`
      <div class="advanced-rhythm-event ${ev.kind}" data-ar-event="${i}" style="--beats:${ev.beats}">
        <b>${escapeHtml(ev.label)}</b>
        <small>${ev.kind==="rest"?"silencio":ev.kind==="triplet"?"1/3 pulso":`${ev.beats} pulso${ev.beats===1?"":"s"}`}</small>
        ${ev.tieStart?'<span class="tie-mark">⌒</span>':""}
      </div>`).join("");
  }
  type.addEventListener("change",render);
  bpm.addEventListener("input",()=>wrapper.querySelector("[data-ar-bpm-label]").textContent=bpm.value);
  wrapper.querySelector("[data-ar-play]").addEventListener("click",()=>playAdvancedRhythmExample(wrapper,current,Number(bpm.value)));
  wrapper.querySelector("[data-ar-count]").addEventListener("click",()=>playAdvancedBasePulse(current,Number(bpm.value)));
  render();
}

async function playAdvancedBasePulse(example,bpm){
  stopAllAudio();
  const beatMs=60000/bpm;
  const beats=example.compound?2:4;
  for(let i=0;i<beats;i++){
    playTone(i===0?84:79,{duration:.06,volume:.14});
    await new Promise(r=>setTimeout(r,beatMs));
  }
}

async function playAdvancedRhythmExample(root,example,bpm){
  stopAllAudio();
  const beatMs=60000/bpm;
  const nodes=[...root.querySelectorAll("[data-ar-event]")];
  let tieHolding=false;
  for(let i=0;i<example.events.length;i++){
    nodes.forEach((node,j)=>node.classList.toggle("playing",j===i));
    const ev=example.events[i];
    const ms=ev.beats*beatMs;
    if(ev.kind!=="rest" && !ev.tied){
      const extra=ev.tieStart && example.events[i+1]?.tied ? example.events[i+1].beats : 0;
      playTone(79,{duration:Math.max(.05,((ev.beats+extra)*beatMs/1000)*.86),volume:.14});
    }
    await new Promise(r=>setTimeout(r,ms));
  }
  nodes.forEach(node=>node.classList.remove("playing"));
}

const ADV_RHYTHM_QUIZ = [
  {
    prompt:"Una negra con puntillo equivale a:",
    choices:["1 pulso","1,5 pulsos","2 pulsos"],
    answer:1,
    explain:"El puntillo añade la mitad del valor: 1 + 0,5 = 1,5."
  },
  {
    prompt:"¿Qué hace una ligadura de prolongación?",
    choices:["Suma duraciones de notas de la misma altura","Cambia la tonalidad","Aumenta el tempo"],
    answer:0,
    explain:"La segunda nota no se vuelve a atacar; su duración se suma a la primera."
  },
  {
    prompt:"Tres corcheas de tresillo ocupan normalmente:",
    choices:["Un pulso de negra","Dos pulsos","Medio pulso"],
    answer:0,
    explain:"El tresillo divide el pulso en tres partes iguales."
  },
  {
    prompt:"En 6/8, la sensación métrica más habitual es:",
    choices:["Dos pulsos principales subdivididos en tres","Seis pulsos fuertes iguales","Tres pulsos subdivididos en dos"],
    answer:0,
    explain:"6/8 suele sentirse como dos pulsos de negra con puntillo."
  },
  {
    prompt:"La síncopa ocurre cuando:",
    choices:["El peso rítmico se desplaza hacia una parte débil","Todas las notas caen en tiempos fuertes","Se elimina el pulso"],
    answer:0,
    explain:"La síncopa altera la expectativa métrica al enfatizar o prolongar partes débiles."
  }
];

function mountAdvancedRhythmQuiz(root){
  const body=root.querySelector("[data-trainer-body]");
  if(!body || body.querySelector("[data-advanced-rhythm-quiz]")) return;
  const section=document.createElement("section");
  section.className="advanced-rhythm-quiz";
  section.dataset.advancedRhythmQuiz="true";
  section.innerHTML=`<div class="diagram-label">Desafío avanzado</div>
    <p class="trainer-prompt" data-arq-prompt></p>
    <div class="trainer-answer-grid" data-arq-answers></div>
    <p class="feedback" data-arq-feedback aria-live="polite"></p>
    <button class="ghost-btn" data-arq-next>Nueva pregunta</button>`;
  body.appendChild(section);
  let q=randomItem(ADV_RHYTHM_QUIZ),answered=false;
  function render(){
    answered=false;q=randomItem(ADV_RHYTHM_QUIZ);
    section.querySelector("[data-arq-prompt]").textContent=q.prompt;
    section.querySelector("[data-arq-answers]").innerHTML=q.choices.map((choice,i)=>`<button data-arq-choice="${i}">${escapeHtml(choice)}</button>`).join("");
    section.querySelector("[data-arq-feedback]").textContent="";
    section.querySelectorAll("[data-arq-choice]").forEach(btn=>btn.addEventListener("click",()=>{
      if(answered)return;answered=true;
      const choice=Number(btn.dataset.arqChoice),ok=choice===q.answer;
      section.querySelector("[data-arq-feedback]").textContent=(ok?"Correcto. ":"Revisa: ")+q.explain;
      section.querySelectorAll("[data-arq-choice]").forEach(b=>{
        b.disabled=true;
        if(Number(b.dataset.arqChoice)===q.answer)b.classList.add("correct");
        else if(b===btn)b.classList.add("wrong");
      });
    }));
  }
  section.querySelector("[data-arq-next]").addEventListener("click",render);
  render();
}

/* Decora el entrenador de ritmo de Fase 3 con contenido avanzado */
const _mountRhythmTrainerFase3 = mountRhythmTrainer;
mountRhythmTrainer = function(root,onResult){
  _mountRhythmTrainerFase3(root,onResult);
  mountAdvancedRhythmQuiz(root);
};

/* Extiende el solfeo rítmico con compás compuesto */
const _mountRhythmSolfegeFase4 = mountRhythmSolfege;
mountRhythmSolfege = function(root){
  _mountRhythmSolfegeFase4(root);
  const body=root.querySelector("[data-solfege-body]");
  const barsSelect=body.querySelector("[data-rs-bars]");
  const levelSelect=body.querySelector("[data-rs-level]");
  if(levelSelect && !levelSelect.querySelector('option[value="3"]')){
    levelSelect.insertAdjacentHTML("beforeend",'<option value="3">3 · síncopa, puntillo y 6/8</option>');
  }
  const advanced=document.createElement("div");
  advanced.className="compound-meter-control";
  advanced.innerHTML=`<label>Compás avanzado
    <select data-rs-advanced-meter>
      <option value="4/4">4/4</option>
      <option value="6/8">6/8</option>
    </select>
  </label>`;
  body.querySelector(".solfege-controls")?.appendChild(advanced);
  const meterSelect=advanced.querySelector("[data-rs-advanced-meter]");
  const score=body.querySelector("[data-rs-score]");
  const play=body.querySelector("[data-rs-play]");
  const fresh=body.querySelector("[data-rs-new]");
  let compoundPattern=[];

  function makeCompound(){
    const bars=Number(barsSelect?.value||2);
    compoundPattern=[];
    for(let bar=0;bar<bars;bar++){
      for(let group=0;group<2;group++){
        const choice=Math.random()<.5
          ? [{kind:"note",beats:1/3,glyph:"♪"},{kind:"note",beats:1/3,glyph:"♪"},{kind:"note",beats:1/3,glyph:"♪"}]
          : [{kind:"note",beats:1,label:"♩.",glyph:"♩."}];
        choice.forEach(ev=>compoundPattern.push({...ev,bar,group}));
      }
    }
  }
  function renderCompound(){
    makeCompound();
    score.innerHTML=Array.from({length:Number(barsSelect?.value||2)},(_,bar)=>`
      <div class="rhythm-measure compound">
        <div class="compound-pulse-row">
          ${[0,1].map(group=>`<div class="compound-pulse" data-compound-pulse="${bar}-${group}">
            ${compoundPattern.filter(ev=>ev.bar===bar&&ev.group===group).map(ev=>`<span class="rhythm-symbol"><b>${ev.glyph}</b></span>`).join("")}
          </div>`).join("")}
        </div>
        <span class="measure-number">Compás ${bar+1} · 6/8</span>
      </div>`).join("");
    root.querySelector("[data-solfege-bpm]").textContent=body.querySelector("[data-rs-bpm]")?.value||76;
  }
  async function playCompound(){
    stopAllAudio();
    const bpm=Number(body.querySelector("[data-rs-bpm]")?.value||76);
    const pulseMs=60000/bpm;
    const pulses=[...score.querySelectorAll("[data-compound-pulse]")];
    for(let p=0;p<pulses.length;p++){
      pulses.forEach((node,i)=>node.classList.toggle("playing",i===p));
      const [bar,group]=pulses[p].dataset.compoundPulse.split("-").map(Number);
      const events=compoundPattern.filter(ev=>ev.bar===bar&&ev.group===group);
      if(events.length===1){
        playTone(79,{duration:(pulseMs/1000)*.8,volume:.14});
        await new Promise(r=>setTimeout(r,pulseMs));
      }else{
        for(let i=0;i<3;i++){
          playTone(i===0?82:79,{duration:.05,volume:.13});
          await new Promise(r=>setTimeout(r,pulseMs/3));
        }
      }
    }
    pulses.forEach(node=>node.classList.remove("playing"));
  }
  meterSelect.addEventListener("change",()=>{
    if(meterSelect.value==="6/8") renderCompound();
    else fresh?.click();
  });
  fresh?.addEventListener("click",()=>{if(meterSelect.value==="6/8")setTimeout(renderCompound,0)});
  if(play){
    const clone=play.cloneNode(true);
    play.replaceWith(clone);
    clone.addEventListener("click",()=>{
      if(meterSelect.value==="6/8")playCompound();
      else {
        const legacyPattern = makeRhythmBars({bars:Number(barsSelect?.value||2),meter:4,level:Number(levelSelect?.value||1)});
        score.innerHTML=rhythmNotationHTML(legacyPattern);
        playRhythmPattern(body,legacyPattern,Number(body.querySelector("[data-rs-bpm]")?.value||76));
      }
    });
  }
}


/* ===================== FASE 3 · ENTRENADOR DE LECTURA ===================== */

const TRAINER_BANK = {
  lectura: {
    title: "Entrenador de lectura de notas",
    description: "Practica reconocimiento de notas en clave de sol y fa con dificultad progresiva.",
    type: "noteTrainer"
  },
  ritmo: {
    title: "Entrenador de lectura rítmica",
    description: "Lee patrones, escucha el resultado y responde cuántos pulsos ocupa cada grupo.",
    type: "rhythmTrainer"
  },
  intervalos: {
    title: "Entrenador de intervalos",
    description: "Reconoce intervalos a partir de dos notas escritas y comprueba con audio.",
    type: "intervalTrainer"
  },
  escalas: {
    title: "Entrenador de escalas",
    description: "Identifica escalas por patrón interválico y por notas.",
    type: "scaleTrainer"
  },
  tonalidad: {
    title: "Entrenador de tonalidades",
    description: "Reconoce tonalidades desde su armadura y desde sus notas.",
    type: "keyTrainer"
  },
  "expresion-forma": {
    title: "Entrenador de elementos expresivos",
    description: "Distingue dinámica, articulación, timbre, textura y forma.",
    type: "expressionTrainer"
  },
  "puente-armonia": {
    title: "Entrenador de análisis melódico",
    description: "Reconoce contornos, movimientos conjuntos, saltos y secuencias.",
    type: "melodyAnalysis"
  }
};

function renderTrainer(level){
  const cfg = TRAINER_BANK[level.id];
  if(!cfg) return "";
  return `<section class="trainer-section panel" data-trainer="${escapeHtml(level.id)}">
    <header class="trainer-head">
      <div>
        <p class="kicker">Entrenamiento</p>
        <h3>${escapeHtml(cfg.title)}</h3>
        <p>${escapeHtml(cfg.description)}</p>
      </div>
      <div class="trainer-score">
        <span><b data-trainer-correct>0</b> correctas</span>
        <span><b data-trainer-total>0</b> intentos</span>
        <span><b data-trainer-streak>0</b> racha</span>
      </div>
    </header>
    <div class="trainer-body" data-trainer-body></div>
  </section>`;
}
function mountTrainer(level){
  const root=document.querySelector(`[data-trainer="${level.id}"]`);
  if(!root) return;
  const cfg=TRAINER_BANK[level.id];
  const stats={correct:0,total:0,streak:0};
  const updateStats=()=>{
    root.querySelector("[data-trainer-correct]").textContent=stats.correct;
    root.querySelector("[data-trainer-total]").textContent=stats.total;
    root.querySelector("[data-trainer-streak]").textContent=stats.streak;
  };
  const onResult=ok=>{
    stats.total+=1;
    if(ok){stats.correct+=1;stats.streak+=1}else stats.streak=0;
    updateStats();
  };
  if(cfg.type==="noteTrainer") mountNoteTrainer(root,onResult);
  if(cfg.type==="rhythmTrainer") mountRhythmTrainer(root,onResult);
  if(cfg.type==="intervalTrainer") mountIntervalTrainer(root,onResult);
  if(cfg.type==="scaleTrainer") mountScaleTrainer(root,onResult);
  if(cfg.type==="keyTrainer") mountKeyTrainer(root,onResult);
  if(cfg.type==="expressionTrainer") mountExpressionTrainer(root,onResult);
  if(cfg.type==="melodyAnalysis") mountMelodyAnalysisTrainer(root,onResult);
  updateStats();
}

function randomItem(arr){return arr[Math.floor(Math.random()*arr.length)]}
function shuffle(arr){return arr.slice().sort(()=>Math.random()-.5)}

function mountNoteTrainer(root,onResult){
  const body=root.querySelector("[data-trainer-body]");
  body.innerHTML=`<div class="trainer-controls">
    <label>Clave <select data-nt-clef><option value="treble">Sol</option><option value="bass">Fa</option><option value="mixed">Mixta</option></select></label>
    <label>Dificultad <select data-nt-level><option value="1">Nivel 1 · centro</option><option value="2">Nivel 2 · rango amplio</option><option value="3">Nivel 3 · líneas adicionales</option></select></label>
    <label>Modo <select data-nt-mode><option value="name">Nombre de nota</option><option value="keyboard">Tecla visual</option></select></label>
  </div>
  <div class="trainer-question-card">
    <div data-nt-staff></div>
    <p class="trainer-prompt" data-nt-prompt>¿Qué nota es?</p>
    <div class="trainer-answer-grid" data-nt-answers></div>
    <p class="feedback" data-nt-feedback aria-live="polite"></p>
  </div>
  <div class="trainer-footer">
    <button class="ghost-btn" data-nt-hear>▶ Escuchar nota</button>
    <button class="primary-btn" data-nt-next>Nueva nota</button>
  </div>`;
  const clef=body.querySelector("[data-nt-clef]");
  const level=body.querySelector("[data-nt-level]");
  const mode=body.querySelector("[data-nt-mode]");
  let current=null, answered=false;

  function pool(){
    const c=clef.value,lv=Number(level.value);
    const treble=lv===1?["E4","F4","G4","A4","B4","C5","D5","E5","F5"]:
                 lv===2?TREBLE_STAFF_NOTES:
                 ["A3","B3",...TREBLE_STAFF_NOTES,"B5","C6"];
    const bass=lv===1?["G2","A2","B2","C3","D3","E3","F3","G3","A3"]:
               lv===2?BASS_STAFF_NOTES:
               ["C2","D2",...BASS_STAFF_NOTES,"D4","E4"];
    return c==="treble"?treble:c==="bass"?bass:treble.concat(bass);
  }
  function inferClef(note){
    if(clef.value!=="mixed") return clef.value;
    const octave=Number(note.slice(-1));
    return octave>=4?"treble":"bass";
  }
  function renderAnswers(){
    if(mode.value==="name"){
      body.querySelector("[data-nt-answers]").innerHTML=NATURAL.map(n=>`<button data-nt-answer="${n}">${n}</button>`).join("");
    }else{
      body.querySelector("[data-nt-answers]").innerHTML=`<div class="trainer-mini-keyboard">${NATURAL.map(n=>`<button data-nt-answer="${n}">${n}</button>`).join("")}</div>`;
    }
    body.querySelectorAll("[data-nt-answer]").forEach(btn=>btn.addEventListener("click",()=>{
      if(answered)return;answered=true;
      const ok=current.startsWith(btn.dataset.ntAnswer);
      onResult(ok);
      body.querySelector("[data-nt-feedback]").textContent=ok?`Correcto: ${current}.`:`No. Era ${current}.`;
      body.querySelectorAll("[data-nt-answer]").forEach(b=>{
        b.disabled=true;
        if(current.startsWith(b.dataset.ntAnswer)) b.classList.add("correct");
        else if(b===btn) b.classList.add("wrong");
      });
    }));
  }
  function next(){
    answered=false;
    current=randomItem(pool());
    const c=inferClef(current);
    body.querySelector("[data-nt-staff]").innerHTML=staffTrainerSVG(current,c);
    body.querySelector("[data-nt-prompt]").textContent=`Clave de ${c==="treble"?"sol":"fa"} · ¿qué nota es?`;
    body.querySelector("[data-nt-feedback]").textContent="";
    renderAnswers();
  }
  [clef,level,mode].forEach(x=>x.addEventListener("change",next));
  body.querySelector("[data-nt-next]").addEventListener("click",next);
  body.querySelector("[data-nt-hear]").addEventListener("click",()=>{
    const name=current.slice(0,-1),oct=Number(current.slice(-1));
    playTone(rootMidi(name,oct),{duration:.6});
  });
  next();
}

const RHYTHM_FIGURES=[
  {name:"negra",beats:1,symbol:SMUFL_GLYPHS.metNoteQuarterUp},
  {name:"corchea",beats:.5,symbol:SMUFL_GLYPHS.metNote8thUp},
  {name:"blanca",beats:2,symbol:SMUFL_GLYPHS.metNoteHalfUp},
  {name:"redonda",beats:4,symbol:SMUFL_GLYPHS.metNoteWhole}
];
function mountRhythmTrainer(root,onResult){
  const body=root.querySelector("[data-trainer-body]");
  body.innerHTML=`<div class="trainer-controls">
    <label>Compás <select data-rt-meter><option value="4">4/4</option><option value="3">3/4</option><option value="2">2/4</option></select></label>
    <label>Dificultad <select data-rt-level><option value="1">Nivel 1</option><option value="2">Nivel 2</option><option value="3">Nivel 3</option></select></label>
  </div>
  <div class="trainer-question-card">
    <div class="rhythm-scoreline" data-rt-scoreline></div>
    <p class="trainer-prompt">¿Cuántos pulsos ocupa el patrón completo?</p>
    <div class="trainer-answer-grid" data-rt-answers></div>
    <p class="feedback" data-rt-feedback aria-live="polite"></p>
  </div>
  <div class="trainer-footer"><button class="ghost-btn" data-rt-play>▶ Escuchar patrón</button><button class="primary-btn" data-rt-next>Nuevo patrón</button></div>`;
  let current=[],total=0,answered=false;
  function generate(){
    const lv=Number(body.querySelector("[data-rt-level]").value);
    const allowed=RHythmAllowed(lv);
    const len=lv===1?3:lv===2?4:5;
    current=Array.from({length:len},()=>randomItem(allowed));
    total=current.reduce((s,x)=>s+x.beats,0);
  }
  function RHythmAllowed(lv){return lv===1?RHYTHM_FIGURES.filter(x=>x.beats>=1):lv===2?RHYTHM_FIGURES.filter(x=>x.beats>=.5):RHYTHM_FIGURES}
  function render(){
    answered=false;generate();
    body.querySelector("[data-rt-scoreline]").innerHTML=current.map(f=>`<span class="rhythm-token"><b>${f.symbol}</b><small>${f.name}</small></span>`).join("");
    const candidates=shuffle([...new Set([total,total+.5,Math.max(.5,total-.5),total+1])]).slice(0,4);
    body.querySelector("[data-rt-answers]").innerHTML=candidates.map(v=>`<button data-rt-answer="${v}">${v} pulsos</button>`).join("");
    body.querySelector("[data-rt-feedback]").textContent="";
    body.querySelectorAll("[data-rt-answer]").forEach(btn=>btn.addEventListener("click",()=>{
      if(answered)return;answered=true;
      const v=Number(btn.dataset.rtAnswer),ok=Math.abs(v-total)<.001;onResult(ok);
      body.querySelector("[data-rt-feedback]").textContent=ok?"Correcto.":`No. El patrón suma ${total} pulsos.`;
      body.querySelectorAll("[data-rt-answer]").forEach(b=>{b.disabled=true;if(Math.abs(Number(b.dataset.rtAnswer)-total)<.001)b.classList.add("correct");else if(b===btn)b.classList.add("wrong")});
    }));
  }
  body.querySelector("[data-rt-next]").addEventListener("click",render);
  body.querySelector("[data-rt-level]").addEventListener("change",render);
  body.querySelector("[data-rt-play]").addEventListener("click",async()=>{
    stopAllAudio();
    for(const f of current){playTone(79,{duration:.06,volume:.14});await new Promise(r=>setTimeout(r,f.beats*450))}
  });
  render();
}

function mountIntervalTrainer(root,onResult){
  const body=root.querySelector("[data-trainer-body]");
  body.innerHTML=`<div class="trainer-controls"><label>Dificultad <select data-it-level><option value="1">Consonancias básicas</option><option value="2">Todos los intervalos simples</option></select></label></div>
  <div class="trainer-question-card"><div data-it-staff></div><p class="trainer-prompt">Identifica el intervalo.</p><div class="trainer-answer-grid" data-it-answers></div><p class="feedback" data-it-feedback aria-live="polite"></p></div>
  <div class="trainer-footer"><button class="ghost-btn" data-it-hear>▶ Escuchar</button><button class="primary-btn" data-it-next>Nuevo intervalo</button></div>`;
  let current=null,rootName="C",answered=false;
  function allowed(){return body.querySelector("[data-it-level]").value==="1"?INTERVALS.filter(i=>["m3","M3","P4","P5","m6","M6","P8"].includes(i.id)):INTERVALS.filter(i=>i.id!=="P1")}
  function render(){
    answered=false;current=randomItem(allowed());rootName=randomItem(ROOTS).value;
    const ts=tones(rootName,["1",current.token]);
    body.querySelector("[data-it-staff]").innerHTML=staffSVG(rootName,ts,current.label);
    const choices=shuffle([current,...shuffle(allowed().filter(i=>i.id!==current.id)).slice(0,3)]);
    body.querySelector("[data-it-answers]").innerHTML=choices.map(i=>`<button data-it-answer="${i.id}">${i.label}</button>`).join("");
    body.querySelector("[data-it-feedback]").textContent="";
    body.querySelectorAll("[data-it-answer]").forEach(btn=>btn.addEventListener("click",()=>{
      if(answered)return;answered=true;const ok=btn.dataset.itAnswer===current.id;onResult(ok);
      body.querySelector("[data-it-feedback]").textContent=ok?`Correcto: ${current.label}.`:`No. Era ${current.label}.`;
      body.querySelectorAll("[data-it-answer]").forEach(b=>{b.disabled=true;if(b.dataset.itAnswer===current.id)b.classList.add("correct");else if(b===btn)b.classList.add("wrong")});
    }));
  }
  body.querySelector("[data-it-next]").addEventListener("click",render);
  body.querySelector("[data-it-level]").addEventListener("change",render);
  body.querySelector("[data-it-hear]").addEventListener("click",()=>{const m=rootMidi(rootName,4);playSequence([m,m+current.semitones],500)});
  render();
}

function mountScaleTrainer(root,onResult){
  const body=root.querySelector("[data-trainer-body]");
  body.innerHTML=`<div class="trainer-controls"><label>Modo de pregunta <select data-st-mode><option value="pattern">Por patrón</option><option value="notes">Por notas</option></select></label></div>
  <div class="trainer-question-card"><div data-st-question></div><p class="trainer-prompt">¿Qué escala es?</p><div class="trainer-answer-grid" data-st-answers></div><p class="feedback" data-st-feedback aria-live="polite"></p></div>
  <div class="trainer-footer"><button class="ghost-btn" data-st-hear>▶ Escuchar</button><button class="primary-btn" data-st-next>Nueva escala</button></div>`;
  let current=null,rootName="C",answered=false;
  function render(){
    answered=false;current=randomItem(SCALES);rootName=randomItem(ROOTS).value;
    const ts=tones(rootName,current.tokens),mode=body.querySelector("[data-st-mode]").value;
    body.querySelector("[data-st-question]").innerHTML=mode==="pattern"?`<div class="pattern-display">${current.pattern}</div>`:`<div class="note-pills">${ts.map(t=>`<span>${t.name}</span>`).join("")}</div>`;
    const choices=shuffle([current,...shuffle(SCALES.filter(s=>s.id!==current.id)).slice(0,3)]);
    body.querySelector("[data-st-answers]").innerHTML=choices.map(s=>`<button data-st-answer="${s.id}">${s.label}</button>`).join("");
    body.querySelector("[data-st-feedback]").textContent="";
    body.querySelectorAll("[data-st-answer]").forEach(btn=>btn.addEventListener("click",()=>{
      if(answered)return;answered=true;const ok=btn.dataset.stAnswer===current.id;onResult(ok);
      body.querySelector("[data-st-feedback]").textContent=ok?`Correcto: ${current.label}.`:`No. Era ${current.label}.`;
      body.querySelectorAll("[data-st-answer]").forEach(b=>{b.disabled=true;if(b.dataset.stAnswer===current.id)b.classList.add("correct");else if(b===btn)b.classList.add("wrong")});
    }));
  }
  body.querySelector("[data-st-next]").addEventListener("click",render);
  body.querySelector("[data-st-mode]").addEventListener("change",render);
  body.querySelector("[data-st-hear]").addEventListener("click",()=>{const ts=tones(rootName,current.tokens),m=rootMidi(rootName,4);playSequence(ts.map(t=>m+t.semi),330)});
  render();
}

function mountKeyTrainer(root,onResult){
  const body=root.querySelector("[data-trainer-body]");
  body.innerHTML=`<div class="trainer-controls"><label>Tipo <select data-kt-mode><option value="signature">Por armadura</option><option value="notes">Por notas</option></select></label></div>
  <div class="trainer-question-card"><div data-kt-question></div><p class="trainer-prompt">¿Qué tonalidad mayor es?</p><div class="trainer-answer-grid" data-kt-answers></div><p class="feedback" data-kt-feedback aria-live="polite"></p></div>
  <div class="trainer-footer"><button class="ghost-btn" data-kt-hear>▶ Escuchar escala</button><button class="primary-btn" data-kt-next>Nueva tonalidad</button></div>`;
  let current="C",answered=false;
  function render(){
    answered=false;current=randomItem(FIFTHS);
    const ts=tones(current,SCALES[0].tokens).slice(0,7),mode=body.querySelector("[data-kt-mode]").value;
    body.querySelector("[data-kt-question]").innerHTML=mode==="signature"?`<div class="key-signature-card"><b>${KEY_SIG[current]}</b><span>armadura</span></div>`:`<div class="note-pills">${ts.map(t=>`<span>${t.name}</span>`).join("")}</div>`;
    const choices=shuffle([current,...shuffle(FIFTHS.filter(k=>k!==current)).slice(0,3)]);
    body.querySelector("[data-kt-answers]").innerHTML=choices.map(k=>`<button data-kt-answer="${k}">${ROOTS.find(r=>r.value===k)?.label||k} mayor</button>`).join("");
    body.querySelector("[data-kt-feedback]").textContent="";
    body.querySelectorAll("[data-kt-answer]").forEach(btn=>btn.addEventListener("click",()=>{
      if(answered)return;answered=true;const ok=btn.dataset.ktAnswer===current;onResult(ok);
      const name=ROOTS.find(r=>r.value===current)?.label||current;
      body.querySelector("[data-kt-feedback]").textContent=ok?`Correcto: ${name} mayor.`:`No. Era ${name} mayor.`;
      body.querySelectorAll("[data-kt-answer]").forEach(b=>{b.disabled=true;if(b.dataset.ktAnswer===current)b.classList.add("correct");else if(b===btn)b.classList.add("wrong")});
    }));
  }
  body.querySelector("[data-kt-next]").addEventListener("click",render);
  body.querySelector("[data-kt-mode]").addEventListener("change",render);
  body.querySelector("[data-kt-hear]").addEventListener("click",()=>{const ts=tones(current,SCALES[0].tokens),m=rootMidi(current,4);playSequence(ts.map(t=>m+t.semi),330)});
  render();
}



/* ===================== FASE 4 · SOLFEO INTERACTIVO ===================== */

const SOLFEGE_LEVELS = {
  lectura: {
    title: "Lectura melódica progresiva",
    description: "Combina notas y ritmo en pequeñas frases de 2 a 4 compases.",
    mode: "melody"
  },
  ritmo: {
    title: "Lectura rítmica por compases",
    description: "Lee patrones completos y sigue el pulso compás por compás.",
    mode: "rhythm"
  },
  intervalos: {
    title: "Lectura por movimiento interválico",
    description: "Observa cómo una melodía avanza por grados conjuntos y saltos.",
    mode: "contour"
  }
};

const SOLFEGE_DURATIONS = [
  {id:"q", beats:1, label:"negra", glyph:SMUFL_GLYPHS.metNoteQuarterUp},
  {id:"e", beats:.5, label:"corchea", glyph:SMUFL_GLYPHS.metNote8thUp},
  {id:"h", beats:2, label:"blanca", glyph:SMUFL_GLYPHS.metNoteHalfUp}
];

function renderSolfege(level){
  const cfg = SOLFEGE_LEVELS[level.id];
  if(!cfg) return "";
  return `<section class="solfege-section panel" data-solfege="${escapeHtml(level.id)}">
    <header class="solfege-head">
      <div>
        <p class="kicker">Solfeo interactivo</p>
        <h3>${escapeHtml(cfg.title)}</h3>
        <p>${escapeHtml(cfg.description)}</p>
      </div>
      <div class="solfege-meta">
        <span><b data-solfege-bars>2</b> compases</span>
        <span><b data-solfege-bpm>80</b> BPM</span>
      </div>
    </header>
    <div class="solfege-body" data-solfege-body></div>
  </section>`;
}

function mountSolfege(level){
  const root=document.querySelector(`[data-solfege="${level.id}"]`);
  if(!root) return;
  const cfg=SOLFEGE_LEVELS[level.id];
  if(cfg.mode==="melody") mountMelodySolfege(root);
  else if(cfg.mode==="rhythm") mountRhythmSolfege(root);
  else if(cfg.mode==="contour") mountContourSolfege(root);
}

function durationSymbol(dur){
  return SOLFEGE_DURATIONS.find(d=>d.id===dur)?.glyph || "♩";
}
function beatsOf(dur){
  return SOLFEGE_DURATIONS.find(d=>d.id===dur)?.beats || 1;
}
function midiFromNamed(note){
  const m=String(note).match(/^([A-G])(#|b)?(\d)$/);
  if(!m) return 60;
  const pitch=({C:0,D:2,E:4,F:5,G:7,A:9,B:11})[m[1]] + (m[2]==="#"?1:m[2]==="b"?-1:0);
  return (Number(m[3])+1)*12 + ((pitch+12)%12);
}
function namedFromMidiNatural(midi){
  const pc=((midi%12)+12)%12,oct=Math.floor(midi/12)-1;
  const names={0:"C",2:"D",4:"E",5:"F",7:"G",9:"A",11:"B"};
  if(names[pc]) return `${names[pc]}${oct}`;
  return `${NOTE_NAMES[pc]}${oct}`;
}

function makeMelodyPhrase({bars=2,meter=4,level=1}={}){
  const pitchPools = {
    1:["C4","D4","E4","F4","G4"],
    2:["C4","D4","E4","F4","G4","A4","B4","C5"],
    3:["A3","B3","C4","D4","E4","F4","G4","A4","B4","C5","D5","E5"]
  };
  const rhythmPools = {
    1:["q","q","q","h"],
    2:["q","e","e","h"],
    3:["e","e","q","q","h"]
  };
  const pitches=pitchPools[level]||pitchPools[1];
  const rhythm=rhythmPools[level]||rhythmPools[1];
  const phrase=[];
  for(let bar=0;bar<bars;bar++){
    let remaining=meter;
    while(remaining>.001){
      let dur=randomItem(rhythm);
      let beats=beatsOf(dur);
      if(beats>remaining) { dur="q"; beats=1; }
      if(beats>remaining) break;
      phrase.push({note:randomItem(pitches),dur,beats,bar});
      remaining-=beats;
    }
  }
  return phrase;
}

function phraseStaffSVG(phrase,{clef="treble",meter="4/4"}={}){
  const w=Math.max(620,phrase.length*54+120),h=180;
  const staffTop=54,lineGap=12,stepH=lineGap/2;
  const noteOrder = clef==="treble"
    ? ["C4","D4","E4","F4","G4","A4","B4","C5","D5","E5","F5","G5"]
    : ["E2","F2","G2","A2","B2","C3","D3","E3","F3","G3","A3","B3","C4"];
  const baseIndex=2;
  function yFor(note){
    let idx=noteOrder.indexOf(note);
    if(idx<0){
      const midi=midiFromNamed(note);
      const nearest=noteOrder.map((n,i)=>({i,d:Math.abs(midiFromNamed(n)-midi)})).sort((a,b)=>a.d-b.d)[0];
      idx=nearest.i;
    }
    return staffTop+4*lineGap-(idx-baseIndex)*stepH;
  }
  const lines=Array.from({length:5},(_,i)=>`<line x1="24" x2="${w-25}" y1="${staffTop+i*lineGap}" y2="${staffTop+i*lineGap}" class="sol-staff-line"/>`).join("");
  let x=124;
  const notes=[];
  let lastBar=-1;
  phrase.forEach((ev,index)=>{
    if(ev.bar!==lastBar && lastBar!==-1){
      notes.push(`<line x1="${x-16}" x2="${x-16}" y1="${staffTop}" y2="${staffTop+4*lineGap}" class="sol-barline"/>`);
    }
    lastBar=ev.bar;
    const y=yFor(ev.note);
    const noteIndex=noteOrder.indexOf(ev.note),step=noteIndex-baseIndex,ledger=[];
    if(step<0)for(let s=-2;s>=step;s-=2)ledger.push(`<line x1="${x-11}" x2="${x+11}" y1="${staffTop+4*lineGap-s*stepH}" y2="${staffTop+4*lineGap-s*stepH}" class="sol-ledger-line"/>`);
    if(step>8)for(let s=10;s<=step;s+=2)ledger.push(`<line x1="${x-11}" x2="${x+11}" y1="${staffTop+4*lineGap-s*stepH}" y2="${staffTop+4*lineGap-s*stepH}" class="sol-ledger-line"/>`);
    const stem = `<line x1="${x+6}" x2="${x+6}" y1="${y}" y2="${y-28}" class="sol-stem"/>`;
    const fill=ev.dur==="h" ? "none":"currentColor";
    const flag=ev.dur==="e"?`<path d="M ${x+6} ${y-28} q 18 6 6 18" class="sol-flag"/>`:"";
    notes.push(`<g class="sol-note-group" data-sol-note-index="${index}">
      ${ledger.join("")}
      <ellipse cx="${x}" cy="${y}" rx="7" ry="5" transform="rotate(-18 ${x} ${y})" class="sol-notehead" style="fill:${fill}"/>
      ${stem}${flag}
      <text x="${x}" y="${h-14}" text-anchor="middle" class="sol-note-label">${escapeHtml(ev.note.replace(/\d/,""))}</text>
    </g>`);
    x+=ev.beats*48;
  });
  const [meterTop="4",meterBottom="4"]=String(meter).split("/");
  const finalBar=phrase.length?`<line x1="${Math.min(w-25,x-20)}" x2="${Math.min(w-25,x-20)}" y1="${staffTop}" y2="${staffTop+4*lineGap}" class="sol-barline sol-final-barline"/>`:"";
  return `<svg viewBox="0 0 ${w} ${h}" class="solfege-staff" role="img" aria-label="Frase musical en compás de ${escapeHtml(meter)}">
    ${lines}
    <text x="30" y="${staffTop+42}" class="sol-clef">${clef==="treble"?SMUFL_GLYPHS.gClef:SMUFL_GLYPHS.fClef}</text>
    <text x="79" y="${staffTop+17}" class="sol-meter" text-anchor="middle"><tspan x="79">${smuflTimeDigit(meterTop)}</tspan><tspan x="79" dy="18">${smuflTimeDigit(meterBottom)}</tspan></text>
    ${notes.join("")}
    ${finalBar}
  </svg>`;
}

async function playPhrase(root,phrase,bpm){
  stopAllAudio();
  const msPerBeat=60000/bpm;
  for(let i=0;i<phrase.length;i++){
    const groups=[...root.querySelectorAll("[data-sol-note-index]")];
    groups.forEach((g,j)=>g.classList.toggle("playing",i===j));
    const ev=phrase[i];
    playTone(midiFromNamed(ev.note),{duration:Math.max(.12,(ev.beats*msPerBeat/1000)*.82),volume:.15});
    await new Promise(r=>setTimeout(r,ev.beats*msPerBeat));
  }
  root.querySelectorAll("[data-sol-note-index]").forEach(g=>g.classList.remove("playing"));
}

function mountMelodySolfege(root){
  const body=root.querySelector("[data-solfege-body]");
  body.innerHTML=`<div class="solfege-controls">
    <label>Compases <select data-ms-bars><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label>
    <label>Dificultad <select data-ms-level><option value="1">1 · cinco notas</option><option value="2">2 · una octava</option><option value="3">3 · rango ampliado</option></select></label>
    <label>BPM <input type="range" min="50" max="120" value="80" data-ms-bpm><span data-ms-bpm-label>80</span></label>
  </div>
  <div class="solfege-score-wrap"><div class="scroll-x" data-ms-staff></div></div>
  <div class="solfege-actions">
    <button class="primary-btn" data-ms-play>▶ Reproducir</button>
    <button class="ghost-btn" data-ms-count>1 2 3 4 · Contar</button>
    <button class="ghost-btn" data-ms-new>Nueva frase</button>
  </div>
  <div class="solfege-task">
    <p><b>Reto:</b> intenta nombrar las notas y marcar el pulso antes de escuchar.</p>
    <label class="self-check"><input type="checkbox" data-ms-read> Pude leer la frase sin detenerme</label>
  </div>`;
  let phrase=[];
  const bars=body.querySelector("[data-ms-bars]"),level=body.querySelector("[data-ms-level]"),bpm=body.querySelector("[data-ms-bpm]");
  function render(){
    phrase=makeMelodyPhrase({bars:Number(bars.value),meter:4,level:Number(level.value)});
    body.querySelector("[data-ms-staff]").innerHTML=phraseStaffSVG(phrase,{clef:"treble",meter:"4/4"});
    root.querySelector("[data-solfege-bars]").textContent=bars.value;
    root.querySelector("[data-solfege-bpm]").textContent=bpm.value;
    body.querySelector("[data-ms-read]").checked=false;
  }
  bpm.addEventListener("input",()=>{body.querySelector("[data-ms-bpm-label]").textContent=bpm.value;root.querySelector("[data-solfege-bpm]").textContent=bpm.value});
  [bars,level].forEach(x=>x.addEventListener("change",render));
  body.querySelector("[data-ms-new]").addEventListener("click",render);
  body.querySelector("[data-ms-play]").addEventListener("click",()=>playPhrase(body,phrase,Number(bpm.value)));
  body.querySelector("[data-ms-count]").addEventListener("click",async()=>{
    stopAllAudio();
    const ms=60000/Number(bpm.value);
    for(let i=0;i<4;i++){playTone(i===0?84:79,{duration:.07,volume:.14});await new Promise(r=>setTimeout(r,ms))}
  });
  render();
}

function makeRhythmBars({bars=2,meter=4,level=1}={}){
  const allowed = level===1
    ? SOLFEGE_DURATIONS.filter(x=>x.id!=="e")
    : SOLFEGE_DURATIONS;
  const result=[];
  for(let bar=0;bar<bars;bar++){
    let remaining=meter;
    while(remaining>.001){
      let d=randomItem(allowed);
      if(d.beats>remaining) d=SOLFEGE_DURATIONS.find(x=>x.id==="q");
      result.push({...d,bar});
      remaining-=d.beats;
    }
  }
  return result;
}
function rhythmNotationHTML(pattern){
  const grouped={};
  pattern.forEach(ev=>(grouped[ev.bar]??=[]).push(ev));
  return Object.entries(grouped).map(([bar,events])=>`<div class="rhythm-measure" data-rhythm-measure="${bar}">
    <div class="rhythm-measure-inner">${events.map((ev,i)=>`<span class="rhythm-symbol" data-rhythm-event="${bar}-${i}"><b>${ev.glyph}</b><small>${ev.label}</small></span>`).join("")}</div>
    <span class="measure-number">Compás ${Number(bar)+1}</span>
  </div>`).join("");
}
async function playRhythmPattern(root,pattern,bpm){
  stopAllAudio();
  const ms=60000/bpm;
  for(const ev of pattern){
    root.querySelectorAll(".rhythm-symbol").forEach(x=>x.classList.remove("playing"));
    const measureEvents=[...root.querySelectorAll(`[data-rhythm-measure="${ev.bar}"] .rhythm-symbol`)];
    const barItems=pattern.filter(x=>x.bar===ev.bar);
    const index=barItems.indexOf(ev);
    measureEvents[index]?.classList.add("playing");
    playTone(79,{duration:.06,volume:.14});
    await new Promise(r=>setTimeout(r,ev.beats*ms));
  }
  root.querySelectorAll(".rhythm-symbol").forEach(x=>x.classList.remove("playing"));
}
function mountRhythmSolfege(root){
  const body=root.querySelector("[data-solfege-body]");
  body.innerHTML=`<div class="solfege-controls">
    <label>Compases <select data-rs-bars><option value="2">2</option><option value="3">3</option><option value="4">4</option></select></label>
    <label>Dificultad <select data-rs-level><option value="1">1 · negras/blancas</option><option value="2">2 · incluye corcheas</option></select></label>
    <label>BPM <input type="range" min="50" max="120" value="76" data-rs-bpm><span data-rs-bpm-label>76</span></label>
  </div>
  <div class="rhythm-reading-score" data-rs-score></div>
  <div class="solfege-actions"><button class="primary-btn" data-rs-play>▶ Reproducir</button><button class="ghost-btn" data-rs-new>Nuevo patrón</button></div>
  <div class="solfege-task"><p><b>Reto:</b> marca el pulso con la mano antes de reproducir el patrón.</p></div>`;
  let pattern=[];
  const bars=body.querySelector("[data-rs-bars]"),level=body.querySelector("[data-rs-level]"),bpm=body.querySelector("[data-rs-bpm]");
  function render(){
    pattern=makeRhythmBars({bars:Number(bars.value),meter:4,level:Number(level.value)});
    body.querySelector("[data-rs-score]").innerHTML=rhythmNotationHTML(pattern);
    root.querySelector("[data-solfege-bars]").textContent=bars.value;
    root.querySelector("[data-solfege-bpm]").textContent=bpm.value;
  }
  bpm.addEventListener("input",()=>{body.querySelector("[data-rs-bpm-label]").textContent=bpm.value;root.querySelector("[data-solfege-bpm]").textContent=bpm.value});
  [bars,level].forEach(x=>x.addEventListener("change",render));
  body.querySelector("[data-rs-new]").addEventListener("click",render);
  body.querySelector("[data-rs-play]").addEventListener("click",()=>playRhythmPattern(body,pattern,Number(bpm.value)));
  render();
}

function contourOfPhrase(phrase){
  const moves=[];
  for(let i=1;i<phrase.length;i++){
    const a=midiFromNamed(phrase[i-1].note),b=midiFromNamed(phrase[i].note),d=b-a;
    if(d===0)moves.push("repetición");
    else if(Math.abs(d)<=2)moves.push(d>0?"grado conjunto ↑":"grado conjunto ↓");
    else moves.push(d>0?"salto ↑":"salto ↓");
  }
  return moves;
}
function mountContourSolfege(root){
  const body=root.querySelector("[data-solfege-body]");
  body.innerHTML=`<div class="solfege-controls">
    <label>Dificultad <select data-cs-level><option value="1">1 · movimientos cortos</option><option value="2">2 · incluye saltos</option></select></label>
    <label>BPM <input type="range" min="50" max="110" value="72" data-cs-bpm><span data-cs-bpm-label>72</span></label>
  </div>
  <div class="solfege-score-wrap"><div class="scroll-x" data-cs-staff></div></div>
  <div class="contour-cards" data-cs-contour></div>
  <div class="solfege-actions"><button class="primary-btn" data-cs-play>▶ Escuchar frase</button><button class="ghost-btn" data-cs-new>Nueva frase</button></div>`;
  let phrase=[];
  const level=body.querySelector("[data-cs-level]"),bpm=body.querySelector("[data-cs-bpm]");
  function make(){
    phrase=makeMelodyPhrase({bars:2,meter:4,level:Number(level.value)===1?1:2});
    if(Number(level.value)===1){
      // suaviza saltos excesivos
      for(let i=1;i<phrase.length;i++){
        const prev=midiFromNamed(phrase[i-1].note);
        const candidates=["C4","D4","E4","F4","G4","A4"].filter(n=>Math.abs(midiFromNamed(n)-prev)<=2);
        if(candidates.length) phrase[i].note=randomItem(candidates);
      }
    }
  }
  function render(){
    make();
    body.querySelector("[data-cs-staff]").innerHTML=phraseStaffSVG(phrase,{clef:"treble",meter:"4/4"});
    const moves=contourOfPhrase(phrase);
    body.querySelector("[data-cs-contour]").innerHTML=moves.map((m,i)=>`<span><b>${i+1}→${i+2}</b>${m}</span>`).join("");
    root.querySelector("[data-solfege-bars]").textContent="2";
    root.querySelector("[data-solfege-bpm]").textContent=bpm.value;
  }
  bpm.addEventListener("input",()=>{body.querySelector("[data-cs-bpm-label]").textContent=bpm.value;root.querySelector("[data-solfege-bpm]").textContent=bpm.value});
  level.addEventListener("change",render);
  body.querySelector("[data-cs-new]").addEventListener("click",render);
  body.querySelector("[data-cs-play]").addEventListener("click",()=>playPhrase(body,phrase,Number(bpm.value)));
  render();
}



/* ===================== FASE 6 · MELODÍA ===================== */

const MELODY_PATTERNS = {
  ascending: {
    label:"Ascendente",
    notes:["C4","D4","E4","F4","G4"],
    description:"La línea sube progresivamente."
  },
  descending: {
    label:"Descendente",
    notes:["G4","F4","E4","D4","C4"],
    description:"La línea desciende progresivamente."
  },
  arch: {
    label:"Arco",
    notes:["C4","D4","F4","G4","F4","D4","C4"],
    description:"La melodía asciende hacia un punto alto y luego regresa."
  },
  wave: {
    label:"Ondulante",
    notes:["C4","E4","D4","F4","E4","G4","F4"],
    description:"Alterna ascensos y descensos."
  },
  repeated: {
    label:"Repetición",
    notes:["C4","C4","E4","E4","G4","G4","E4"],
    description:"Repite alturas o células para crear memoria."
  }
};

const MOTIF_LIBRARY = [
  {id:"step",label:"Motivo conjunto",notes:["C4","D4","E4","D4"],description:"Predomina el movimiento por grados conjuntos."},
  {id:"leap",label:"Motivo con salto",notes:["C4","G4","E4","A4"],description:"Los saltos amplían el perfil melódico."},
  {id:"repeat",label:"Motivo repetitivo",notes:["C4","C4","D4","C4"],description:"La repetición estabiliza la identidad."},
  {id:"sequence",label:"Motivo secuencial",notes:["C4","D4","E4","D4","D4","E4","F4","E4"],description:"La segunda célula traslada el dibujo una altura arriba."}
];

function mountMelodyLab(parent){
  const wrapper=document.createElement("section");
  wrapper.className="melody-lab";
  wrapper.innerHTML=`<div class="melody-lab-head">
    <div>
      <p class="kicker">Melodía</p>
      <h4>Motivo, contorno y movimiento</h4>
      <p>Selecciona una idea y observa cómo cambia la forma de la línea melódica.</p>
    </div>
  </div>
  <div class="controls-row">
    <label>Contorno <select data-ml-contour>
      ${Object.entries(MELODY_PATTERNS).map(([id,p])=>`<option value="${id}">${escapeHtml(p.label)}</option>`).join("")}
    </select></label>
    <label>Motivo <select data-ml-motif>
      ${MOTIF_LIBRARY.map(m=>`<option value="${m.id}">${escapeHtml(m.label)}</option>`).join("")}
    </select></label>
  </div>
  <div class="melody-summary">
    <strong data-ml-title></strong>
    <p data-ml-desc></p>
  </div>
  <div class="visual-two">
    <section class="visual-box">
      <div class="diagram-label">Pentagrama</div>
      <div class="scroll-x" data-ml-staff></div>
    </section>
    <section class="visual-box">
      <div class="diagram-label">Mapa de movimiento</div>
      <div class="melody-contour-map" data-ml-map></div>
    </section>
  </div>
  <div class="melody-analysis" data-ml-analysis></div>
  <div class="lab-actions">
    <button class="primary-btn" data-ml-play>▶ Escuchar contorno</button>
    <button class="ghost-btn" data-ml-motif-play>▶ Escuchar motivo</button>
    <button class="ghost-btn" data-ml-sequence>▶ Mostrar secuencia</button>
  </div>`;
  parent.prepend(wrapper);

  const contourSel=wrapper.querySelector("[data-ml-contour]");
  const motifSel=wrapper.querySelector("[data-ml-motif]");
  let currentNotes=[];

  function phraseFromNotes(notes){
    return notes.map((note,i)=>({note,dur:"q",beats:1,bar:Math.floor(i/4)}));
  }
  function analyse(notes){
    const moves=[];
    let steps=0,jumps=0,repeats=0;
    for(let i=1;i<notes.length;i++){
      const d=midiFromNamed(notes[i])-midiFromNamed(notes[i-1]);
      if(d===0){moves.push("repetición");repeats++;}
      else if(Math.abs(d)<=2){moves.push(d>0?"conjunto ↑":"conjunto ↓");steps++;}
      else {moves.push(d>0?"salto ↑":"salto ↓");jumps++;}
    }
    return {moves,steps,jumps,repeats};
  }
  function renderContourMap(notes){
    const midis=notes.map(midiFromNamed),min=Math.min(...midis),max=Math.max(...midis),span=Math.max(1,max-min);
    return `<div class="contour-line">${notes.map((note,i)=>{
      const y=100-((midis[i]-min)/span)*80;
      return `<div class="contour-point" style="--x:${i};--count:${notes.length};--y:${y}%"><span>${escapeHtml(note.replace(/\d/,""))}</span></div>`;
    }).join("")}</div>`;
  }
  function render(){
    const pattern=MELODY_PATTERNS[contourSel.value];
    currentNotes=pattern.notes.slice();
    const analysis=analyse(currentNotes);
    wrapper.querySelector("[data-ml-title]").textContent=pattern.label;
    wrapper.querySelector("[data-ml-desc]").textContent=pattern.description;
    wrapper.querySelector("[data-ml-staff]").innerHTML=phraseStaffSVG(phraseFromNotes(currentNotes),{clef:"treble",meter:"4/4"});
    wrapper.querySelector("[data-ml-map]").innerHTML=renderContourMap(currentNotes);
    wrapper.querySelector("[data-ml-analysis]").innerHTML=`
      <span><b>${analysis.steps}</b> movimientos conjuntos</span>
      <span><b>${analysis.jumps}</b> saltos</span>
      <span><b>${analysis.repeats}</b> repeticiones</span>`;
  }
  contourSel.addEventListener("change",render);
  wrapper.querySelector("[data-ml-play]").addEventListener("click",()=>playPhrase(wrapper,phraseFromNotes(currentNotes),84));
  wrapper.querySelector("[data-ml-motif-play]").addEventListener("click",()=>{
    const motif=MOTIF_LIBRARY.find(m=>m.id===motifSel.value)||MOTIF_LIBRARY[0];
    playPhrase(wrapper,phraseFromNotes(motif.notes),90);
  });
  wrapper.querySelector("[data-ml-sequence]").addEventListener("click",()=>{
    const motif=MOTIF_LIBRARY.find(m=>m.id===motifSel.value)||MOTIF_LIBRARY[0];
    const transposed=motif.notes.map(n=>namedFromMidiNatural(midiFromNamed(n)+2));
    const combined=motif.notes.concat(transposed);
    currentNotes=combined;
    wrapper.querySelector("[data-ml-title]").textContent=`${motif.label} → secuencia`;
    wrapper.querySelector("[data-ml-desc]").textContent="La misma idea se repite trasladada un grado arriba.";
    wrapper.querySelector("[data-ml-staff]").innerHTML=phraseStaffSVG(phraseFromNotes(combined),{clef:"treble",meter:"4/4"});
    wrapper.querySelector("[data-ml-map]").innerHTML=renderContourMap(combined);
    const analysis=analyse(combined);
    wrapper.querySelector("[data-ml-analysis]").innerHTML=`
      <span><b>${analysis.steps}</b> movimientos conjuntos</span>
      <span><b>${analysis.jumps}</b> saltos</span>
      <span><b>1</b> secuencia</span>`;
    playPhrase(wrapper,phraseFromNotes(combined),90);
  });
  render();
}

const MELODY_ANALYSIS_QUESTIONS = [
  {
    notes:["C4","D4","E4","F4"],
    prompt:"¿Qué describe mejor este fragmento?",
    choices:["Ascenso por grados conjuntos","Descenso por saltos","Repetición de una sola nota"],
    answer:0,
    explain:"Cada nota avanza a la siguiente altura vecina."
  },
  {
    notes:["C4","G4","E4","A4"],
    prompt:"¿Qué recurso domina?",
    choices:["Saltos","Solo grados conjuntos","Notas repetidas"],
    answer:0,
    explain:"Las distancias entre notas son mayores que un grado conjunto."
  },
  {
    notes:["C4","D4","E4","D4","D4","E4","F4","E4"],
    prompt:"¿Qué técnica aparece con mayor claridad?",
    choices:["Secuencia","Silencio","Pedal armónico"],
    answer:0,
    explain:"La segunda célula repite el mismo dibujo trasladado."
  },
  {
    notes:["C4","D4","E4","D4","C4"],
    prompt:"¿Qué contorno general presenta?",
    choices:["Arco","Descenso continuo","Repetición estática"],
    answer:0,
    explain:"Asciende hasta un punto máximo y luego desciende."
  }
];

function mountMelodyAnalysisTrainer(root,onResult){
  const body=root.querySelector("[data-trainer-body]");
  if(!body || body.querySelector("[data-melody-analysis]")) return;
  const box=document.createElement("section");
  box.className="melody-analysis-trainer";
  box.dataset.melodyAnalysis="true";
  box.innerHTML=`<div class="diagram-label">Análisis melódico</div>
    <div class="scroll-x" data-ma-staff></div>
    <p class="trainer-prompt" data-ma-prompt></p>
    <div class="trainer-answer-grid" data-ma-answers></div>
    <p class="feedback" data-ma-feedback aria-live="polite"></p>
    <div class="trainer-footer">
      <button class="ghost-btn" data-ma-hear>▶ Escuchar</button>
      <button class="primary-btn" data-ma-next>Nueva melodía</button>
    </div>`;
  body.appendChild(box);
  let q=randomItem(MELODY_ANALYSIS_QUESTIONS),answered=false;
  function render(){
    q=randomItem(MELODY_ANALYSIS_QUESTIONS);answered=false;
    const phrase=q.notes.map((note,i)=>({note,dur:"q",beats:1,bar:Math.floor(i/4)}));
    box.querySelector("[data-ma-staff]").innerHTML=phraseStaffSVG(phrase,{clef:"treble",meter:"4/4"});
    box.querySelector("[data-ma-prompt]").textContent=q.prompt;
    box.querySelector("[data-ma-answers]").innerHTML=q.choices.map((c,i)=>`<button data-ma-choice="${i}">${escapeHtml(c)}</button>`).join("");
    box.querySelector("[data-ma-feedback]").textContent="";
    box.querySelectorAll("[data-ma-choice]").forEach(btn=>btn.addEventListener("click",()=>{
      if(answered)return;answered=true;
      const ok=Number(btn.dataset.maChoice)===q.answer;onResult?.(ok);
      box.querySelector("[data-ma-feedback]").textContent=(ok?"Correcto. ":"Revisa: ")+q.explain;
      box.querySelectorAll("[data-ma-choice]").forEach(b=>{b.disabled=true;if(Number(b.dataset.maChoice)===q.answer)b.classList.add("correct");else if(b===btn)b.classList.add("wrong")});
    }));
  }
  box.querySelector("[data-ma-next]").addEventListener("click",render);
  box.querySelector("[data-ma-hear]").addEventListener("click",()=>playPhrase(box,q.notes.map((note,i)=>({note,dur:"q",beats:1,bar:Math.floor(i/4)})),88));
  render();
}

function mountStructuralNotesLab(parent){
  const wrapper=document.createElement("section");
  wrapper.className="structural-notes-lab";
  wrapper.innerHTML=`<div class="melody-lab-head">
    <p class="kicker">Función melódica</p>
    <h4>Notas estructurales y notas de paso</h4>
    <p>Compara los puntos de apoyo de una frase con las notas que los conectan.</p>
  </div>
  <div class="structural-phrase" data-sn-phrase></div>
  <div class="lab-actions">
    <button class="primary-btn" data-sn-play>▶ Escuchar frase</button>
    <button class="ghost-btn" data-sn-toggle>Mostrar/ocultar análisis</button>
  </div>`;
  parent.appendChild(wrapper);
  const sequence=[
    {note:"C4",role:"structural"},
    {note:"D4",role:"passing"},
    {note:"E4",role:"structural"},
    {note:"F4",role:"passing"},
    {note:"G4",role:"structural"},
    {note:"F4",role:"passing"},
    {note:"E4",role:"structural"}
  ];
  let shown=true;
  function render(){
    wrapper.querySelector("[data-sn-phrase]").innerHTML=sequence.map((n,i)=>`
      <div class="structural-note ${shown?n.role:""}">
        <b>${n.note.replace(/\d/,"")}</b>
        <span>${shown?(n.role==="structural"?"estructural":"paso"):"nota"}</span>
      </div>${i<sequence.length-1?'<span class="structural-arrow">→</span>':""}`).join("");
  }
  wrapper.querySelector("[data-sn-toggle]").addEventListener("click",()=>{shown=!shown;render()});
  wrapper.querySelector("[data-sn-play]").addEventListener("click",()=>playSequence(sequence.map(n=>midiFromNamed(n.note)),340));
  render();
}

/* Añade análisis melódico dentro del entrenador final */
const _mountTrainerFase3 = mountTrainer;
mountTrainer = function(level){
  _mountTrainerFase3(level);
  if(level.id==="puente-armonia"){
    const fakeRoot=document.querySelector('[data-trainer="puente-armonia"]');
    if(fakeRoot) mountMelodyAnalysisTrainer(fakeRoot,()=>{});
  }
};

/* Añade laboratorio de notas estructurales al final del nivel 7 */
const _mountTriadLabFase2 = mountTriadLab;
mountTriadLab = function(el){
  _mountTriadLabFase2(el);
  mountStructuralNotesLab(el);
};



/* ===================== FASE 7 · EXPRESIÓN, TEXTURA Y FORMA ===================== */

const DYNAMICS = [
  {id:"pp",label:"pp · muy suave",volume:.05},
  {id:"p",label:"p · suave",volume:.08},
  {id:"mp",label:"mp · medio suave",volume:.11},
  {id:"mf",label:"mf · medio fuerte",volume:.15},
  {id:"f",label:"f · fuerte",volume:.21},
  {id:"ff",label:"ff · muy fuerte",volume:.27}
];

const ARTICULATIONS = [
  {id:"legato",label:"Legato",durationFactor:.92,gapFactor:.08},
  {id:"normal",label:"Normal",durationFactor:.72,gapFactor:.28},
  {id:"staccato",label:"Staccato",durationFactor:.34,gapFactor:.66},
  {id:"accent",label:"Acentuado",durationFactor:.62,gapFactor:.38,accent:true}
];

const TEXTURES = [
  {id:"mono",label:"Monofónica",description:"Una sola línea musical."},
  {id:"homo",label:"Homofónica",description:"Una melodía principal con soporte armónico."},
  {id:"poly",label:"Polifónica",description:"Varias líneas con independencia melódica."}
];

const FORMS = [
  {id:"AB",label:"A–B",sections:["A","B"]},
  {id:"ABA",label:"A–B–A",sections:["A","B","A"]},
  {id:"AABA",label:"A–A–B–A",sections:["A","A","B","A"]}
];

function mountExpressionFormLab(el){
  el.innerHTML=`<div class="expression-lab-stack">

    <section class="lab-card">
      <div class="diagram-label">Expresión</div>
      <div class="controls-grid compact">
        <label>Dinámica <select data-ex-dynamic>${DYNAMICS.map(d=>`<option value="${d.id}" ${d.id==="mf"?"selected":""}>${d.label}</option>`).join("")}</select></label>
        <label>Articulación <select data-ex-articulation>${ARTICULATIONS.map(a=>`<option value="${a.id}">${a.label}</option>`).join("")}</select></label>
        <label>Tempo <input type="range" min="50" max="150" value="88" data-ex-tempo><span data-ex-tempo-label>88 BPM</span></label>
        <label>Instrumento <span class="fixed-control">Piano acústico</span></label>
      </div>
      <div class="expression-meter">
        <span>pp</span><div class="dynamic-track"><div class="dynamic-fill" data-ex-dynamic-fill></div></div><span>ff</span>
      </div>
      <div class="lab-actions">
        <button class="primary-btn" data-ex-play>▶ Escuchar misma frase</button>
        <button class="ghost-btn" data-ex-compare>▶ Comparar dos interpretaciones</button>
      </div>
      <p class="feedback" data-ex-feedback>La melodía y el ritmo permanecen iguales; cambia la interpretación.</p>
    </section>

    <section class="lab-card">
      <div class="diagram-label">Textura</div>
      <div class="controls-row">
        <label>Tipo de textura <select data-texture>${TEXTURES.map(t=>`<option value="${t.id}">${t.label}</option>`).join("")}</select></label>
      </div>
      <div class="texture-visual" data-texture-visual></div>
      <p class="feedback" data-texture-desc></p>
      <button class="primary-btn" data-texture-play>▶ Escuchar textura</button>
    </section>

    <section class="lab-card">
      <div class="diagram-label">Forma</div>
      <div class="controls-row">
        <label>Esquema <select data-form>${FORMS.map(f=>`<option value="${f.id}">${f.label}</option>`).join("")}</select></label>
      </div>
      <div class="form-timeline" data-form-timeline></div>
      <p class="feedback">A = idea principal · B = contraste.</p>
      <button class="primary-btn" data-form-play>▶ Escuchar forma</button>
    </section>

  </div>`;

  const dynSel=el.querySelector("[data-ex-dynamic]");
  const artSel=el.querySelector("[data-ex-articulation]");
  const tempo=el.querySelector("[data-ex-tempo]");
  const textureSel=el.querySelector("[data-texture]");
  const formSel=el.querySelector("[data-form]");

  const phrase=[60,62,64,67,64,62,60];

  function currentExpression(){
    return {
      dyn:DYNAMICS.find(d=>d.id===dynSel.value)||DYNAMICS[3],
      art:ARTICULATIONS.find(a=>a.id===artSel.value)||ARTICULATIONS[1],
      bpm:Number(tempo.value)
    };
  }

  function updateExpression(){
    const e=currentExpression();
    const pct=((DYNAMICS.findIndex(d=>d.id===e.dyn.id)+1)/DYNAMICS.length)*100;
    el.querySelector("[data-ex-dynamic-fill]").style.width=`${pct}%`;
    el.querySelector("[data-ex-tempo-label]").textContent=`${e.bpm} BPM`;
  }

  async function playExpressivePhrase(config=currentExpression()){
    stopAllAudio();
    const beatMs=60000/config.bpm;
    for(let i=0;i<phrase.length;i++){
      const accentGain=config.art.accent && (i===0||i===3) ? 1.35 : 1;
      playTone(phrase[i],{
        duration:(beatMs/1000)*config.art.durationFactor,
        volume:Math.min(.32,config.dyn.volume*accentGain)
      });
      await new Promise(r=>setTimeout(r,beatMs));
    }
  }

  [dynSel,artSel,tempo].forEach(x=>x.addEventListener("input",updateExpression));
  el.querySelector("[data-ex-play]").addEventListener("click",()=>playExpressivePhrase());
  el.querySelector("[data-ex-compare]").addEventListener("click",async()=>{
    const a={dyn:DYNAMICS[1],art:ARTICULATIONS[0],bpm:68};
    const b={dyn:DYNAMICS[4],art:ARTICULATIONS[2],bpm:118};
    el.querySelector("[data-ex-feedback]").textContent="Primero: suave, legato y lento. Después: fuerte, staccato y rápido.";
    await playExpressivePhrase(a);
    await new Promise(r=>setTimeout(r,500));
    await playExpressivePhrase(b);
  });
  updateExpression();

  function renderTexture(){
    const texture=TEXTURES.find(t=>t.id===textureSel.value)||TEXTURES[0];
    el.querySelector("[data-texture-desc]").textContent=texture.description;
    const lines=texture.id==="mono"?1:texture.id==="homo"?3:3;
    el.querySelector("[data-texture-visual]").innerHTML=`
      ${Array.from({length:lines},(_,i)=>`<div class="texture-line ${texture.id} line-${i+1}">
        ${Array.from({length:9},(_,n)=>`<span style="--n:${n};--line:${i}"></span>`).join("")}
      </div>`).join("")}`;
  }
  textureSel.addEventListener("change",renderTexture);
  el.querySelector("[data-texture-play]").addEventListener("click",async()=>{
    const type=textureSel.value;
    stopAllAudio();
    const melody=[60,62,64,67,65,64,62,60];
    if(type==="mono"){
      await playSequence(melody,280);
    }else if(type==="homo"){
      for(let i=0;i<melody.length;i++){
        playChord([melody[i],melody[i]-5,melody[i]-9]);
        await new Promise(r=>setTimeout(r,310));
      }
    }else{
      const second=[67,65,64,62,60,62,64,65];
      const ctx=audioContext();
      for(let i=0;i<melody.length;i++){
        playTone(melody[i],{duration:.26,volume:.10});
        playTone(second[i],{duration:.26,volume:.08});
        await new Promise(r=>setTimeout(r,300));
      }
    }
  });
  renderTexture();

  function renderForm(){
    const form=FORMS.find(f=>f.id===formSel.value)||FORMS[0];
    el.querySelector("[data-form-timeline]").innerHTML=form.sections.map((s,i)=>`
      <div class="form-section section-${s}" data-form-section="${i}">
        <b>${s}</b><span>${s==="A"?"idea principal":"contraste"}</span>
      </div>`).join("");
  }
  formSel.addEventListener("change",renderForm);
  el.querySelector("[data-form-play]").addEventListener("click",async()=>{
    const form=FORMS.find(f=>f.id===formSel.value)||FORMS[0];
    stopAllAudio();
    const A=[60,62,64,67,64,62];
    const B=[65,67,69,67,65,64];
    const nodes=[...el.querySelectorAll("[data-form-section]")];
    for(let i=0;i<form.sections.length;i++){
      nodes.forEach((node,j)=>node.classList.toggle("playing",i===j));
      await playSequence(form.sections[i]==="A"?A:B,220);
      await new Promise(r=>setTimeout(r,180));
    }
    nodes.forEach(node=>node.classList.remove("playing"));
  });
  renderForm();
}

const EXPRESSION_TRAINER_QUESTIONS = [
  {
    prompt:"¿Qué cambia principalmente una indicación de dinámica?",
    choices:["La intensidad","La altura escrita","La armadura"],
    answer:0,
    explain:"La dinámica orienta el nivel o cambio de intensidad."
  },
  {
    prompt:"¿Qué describe staccato?",
    choices:["Articulación corta y separada","Una tonalidad menor","Una forma A–B–A"],
    answer:0,
    explain:"Staccato reduce la duración efectiva y separa los ataques."
  },
  {
    prompt:"Una melodía acompañada por acordes suele describirse como textura:",
    choices:["Homofónica","Monofónica","Sin textura"],
    answer:0,
    explain:"En la homofonía una línea principal destaca sobre el acompañamiento."
  },
  {
    prompt:"¿Qué elemento organiza secciones como A–B–A?",
    choices:["Forma","Timbre","Intervalo"],
    answer:0,
    explain:"La forma describe organización de secciones a gran escala."
  },
  {
    prompt:"¿Qué permite distinguir un piano de una guitarra tocando la misma nota?",
    choices:["Timbre","Nombre de la nota","Compás"],
    answer:0,
    explain:"El timbre distingue fuentes sonoras con igual altura."
  }
];

function mountExpressionTrainer(root,onResult){
  const body=root.querySelector("[data-trainer-body]");
  body.innerHTML=`<div class="trainer-question-card">
    <div class="expression-trainer-icons">
      <span>𝆏</span><span>♩.</span><span>≋</span><span>A–B–A</span>
    </div>
    <p class="trainer-prompt" data-et-prompt></p>
    <div class="trainer-answer-grid" data-et-answers></div>
    <p class="feedback" data-et-feedback aria-live="polite"></p>
  </div>
  <div class="trainer-footer">
    <button class="primary-btn" data-et-next>Nueva pregunta</button>
  </div>`;
  let q=null,answered=false;
  function render(){
    q=randomItem(EXPRESSION_TRAINER_QUESTIONS);answered=false;
    body.querySelector("[data-et-prompt]").textContent=q.prompt;
    body.querySelector("[data-et-answers]").innerHTML=q.choices.map((c,i)=>`<button data-et-choice="${i}">${escapeHtml(c)}</button>`).join("");
    body.querySelector("[data-et-feedback]").textContent="";
    body.querySelectorAll("[data-et-choice]").forEach(btn=>btn.addEventListener("click",()=>{
      if(answered)return;
      answered=true;
      const ok=Number(btn.dataset.etChoice)===q.answer;
      onResult(ok);
      body.querySelector("[data-et-feedback]").textContent=(ok?"Correcto. ":"Revisa: ")+q.explain;
      body.querySelectorAll("[data-et-choice]").forEach(b=>{
        b.disabled=true;
        if(Number(b.dataset.etChoice)===q.answer)b.classList.add("correct");
        else if(b===btn)b.classList.add("wrong");
      });
    }));
  }
  body.querySelector("[data-et-next]").addEventListener("click",render);
  render();
}



/* ===================== FASE 8 · EVALUACIÓN GLOBAL Y CIERRE ===================== */

const DIAGNOSTIC_QUESTIONS = [
  {level:"musica",q:"¿Qué propiedad del sonido permite percibirlo como grave o agudo?",choices:["Altura","Duración","Timbre"],a:0},
  {level:"lectura",q:"¿Qué indica principalmente la posición vertical de una nota en el pentagrama?",choices:["Altura","Tempo","Dinámica"],a:0},
  {level:"ritmo",q:"¿Qué representa el tempo?",choices:["Velocidad del pulso","Nombre del compás","Altura tonal"],a:0},
  {level:"intervalos",q:"¿Cuántos semitonos tiene una 5 justa?",choices:["5","7","9"],a:1},
  {level:"escalas",q:"La escala mayor se construye mediante:",choices:["Un patrón de tonos y semitonos","Notas al azar","Solo acordes"],a:0},
  {level:"tonalidad",q:"¿Qué nota funciona como centro de una tonalidad?",choices:["Tónica","Quinta","Séptima"],a:0},
  {level:"expresion-forma",q:"¿Qué elemento diferencia un piano de una guitarra tocando la misma nota?",choices:["Timbre","Compás","Armadura"],a:0},
  {level:"puente-armonia",q:"¿Qué grados forman una tríada mayor?",choices:["1–3–5","1–2–4","1–4–7"],a:0},
  {level:"ritmo",q:"En 6/8 suelen sentirse principalmente:",choices:["2 pulsos subdivididos en tres","6 pulsos fuertes","3 pulsos subdivididos en dos"],a:0},
  {level:"puente-armonia",q:"¿Qué describe mejor una secuencia melódica?",choices:["Repetir una idea trasladada de altura","Mantener una sola nota","Cambiar de instrumento"],a:0}
];

const FINAL_EVAL_QUESTIONS = [
  {level:"musica",q:"¿Cuál conjunto incluye solo propiedades del sonido?",choices:["Altura, duración, intensidad, timbre","Ritmo, tonalidad, compás, forma","Escala, acorde, frase, textura"],a:0},
  {level:"musica",q:"Ritmo, melodía y armonía son:",choices:["Tres ejes introductorios útiles, pero no los únicos elementos musicales","Los únicos elementos de toda música","Tres tipos de compás"],a:0},

  {level:"lectura",q:"En notación musical, el eje horizontal se relaciona principalmente con:",choices:["El tiempo","La altura","El timbre"],a:0},
  {level:"lectura",q:"¿Qué función cumple una clave?",choices:["Asigna nombres y registros a líneas y espacios","Indica la dinámica","Define el tempo"],a:0},

  {level:"ritmo",q:"¿Qué hace el puntillo?",choices:["Añade la mitad del valor de la figura","Duplica siempre la figura","Reduce la figura a la mitad"],a:0},
  {level:"ritmo",q:"Una síncopa desplaza el peso hacia:",choices:["Una parte débil o prolongada sobre una fuerte","Solo el primer pulso","El silencio final"],a:0},

  {level:"intervalos",q:"Una 3 mayor contiene:",choices:["4 semitonos","3 semitonos","5 semitonos"],a:0},
  {level:"intervalos",q:"Dos notas simultáneas forman un intervalo:",choices:["Armónico","Melódico","Rítmico"],a:0},

  {level:"escalas",q:"¿Qué relación existe entre intervalos y escalas?",choices:["Las escalas se construyen mediante patrones interválicos","No existe relación","Las escalas eliminan los intervalos"],a:0},
  {level:"escalas",q:"La menor natural contiene respecto de la mayor:",choices:["♭3, ♭6 y ♭7","♭2, ♭4 y ♭5","#4 únicamente"],a:0},

  {level:"tonalidad",q:"La tonalidad organiza las alturas alrededor de:",choices:["Una tónica","Un silencio","Una figura"],a:0},
  {level:"tonalidad",q:"La función dominante se asocia principalmente con:",choices:["V y vii°","I y vi","ii y IV"],a:0},

  {level:"expresion-forma",q:"Legato y staccato son tipos de:",choices:["Articulación","Tonalidad","Textura"],a:0},
  {level:"expresion-forma",q:"A–B–A describe principalmente:",choices:["Forma","Timbre","Intervalo"],a:0},

  {level:"puente-armonia",q:"¿Qué notas suelen ser estructurales en una frase?",choices:["Puntos importantes de apoyo melódico","Solo notas cromáticas","Solo silencios"],a:0},
  {level:"puente-armonia",q:"El puente hacia armonía busca conectar:",choices:["Melodía, intervalos, tríadas y función armónica","Solo ritmo y tempo","Solo timbre y dinámica"],a:0}
];

const BADGE_DEFINITIONS = [
  {id:"first-step",icon:"1",title:"Primer paso",desc:"Completa tu primer nivel.",test:()=>completedCount()>=1},
  {id:"reader",icon:"𝄞",title:"Lector inicial",desc:"Completa lectura y ritmo.",test:()=>!!state.completed.lectura&&!!state.completed.ritmo},
  {id:"pitch",icon:"↗",title:"Alturas conectadas",desc:"Completa intervalos y escalas.",test:()=>!!state.completed.intervalos&&!!state.completed.escalas},
  {id:"tonal",icon:"V",title:"Centro tonal",desc:"Completa tonalidad.",test:()=>!!state.completed.tonalidad},
  {id:"expression",icon:"ƒ",title:"Intérprete consciente",desc:"Completa expresión, textura y forma.",test:()=>!!state.completed["expresion-forma"]},
  {id:"bridge",icon:"→",title:"Puente armónico",desc:"Completa el nivel final.",test:()=>!!state.completed["puente-armonia"]},
  {id:"all-levels",icon:"8",title:"Ruta completa",desc:"Completa los 8 niveles.",test:()=>completedCount()===DATA.levels.length},
  {id:"final-pass",icon:"✓",title:"Evaluación superada",desc:"Obtén al menos 80% en la evaluación final.",test:()=>Number(state.finalEvaluation?.percent||0)>=80}
];

function completedCount(){
  return DATA.levels.filter(level=>state.completed[level.id]).length;
}
function practiceCount(){
  return DATA.levels.filter(level=>state.practice?.[level.id]).length;
}
function totalProgressPercent(){
  const completionPart = completedCount()/DATA.levels.length;
  const practicePart = practiceCount()/DATA.levels.length;
  return Math.round((completionPart*.75 + practicePart*.25)*100);
}

function renderDetailedProgress(){
  const el=$("homeProgressDetail");
  if(!el) return;
  const completed=completedCount(), practice=practiceCount(), total=DATA.levels.length;
  el.innerHTML=`
    <div class="mini-stat"><b>${completed}</b><span>niveles completos</span></div>
    <div class="mini-stat"><b>${practice}</b><span>prácticas rápidas correctas</span></div>
    <div class="mini-stat"><b>${totalProgressPercent()}%</b><span>avance global estimado</span></div>`;
}

function renderEvaluationSummary(){
  const el=$("evaluationSummary");
  if(!el) return;
  const diag=state.diagnostic;
  const final=state.finalEvaluation;
  el.innerHTML=`
    <div class="summary-stat"><span>Progreso</span><b>${totalProgressPercent()}%</b><small>${completedCount()}/${DATA.levels.length} niveles</small></div>
    <div class="summary-stat"><span>Diagnóstico</span><b>${diag?diag.percent+"%":"—"}</b><small>${diag?"último resultado":"sin realizar"}</small></div>
    <div class="summary-stat"><span>Evaluación final</span><b>${final?final.percent+"%":"—"}</b><small>${final?final.label:"sin realizar"}</small></div>`;
}

function renderBadges(){
  const el=$("badgeGrid");
  if(!el) return;
  el.innerHTML=BADGE_DEFINITIONS.map(badge=>{
    const earned=badge.test();
    return `<article class="badge-card ${earned?"earned":"locked"}">
      <div class="badge-icon">${escapeHtml(badge.icon)}</div>
      <h3>${escapeHtml(badge.title)}</h3>
      <p>${escapeHtml(badge.desc)}</p>
      <small>${earned?"Conseguida":"Pendiente"}</small>
    </article>`;
  }).join("");
}

function evaluationLabel(percent){
  if(percent>=90) return "Dominio muy sólido";
  if(percent>=80) return "Objetivo alcanzado";
  if(percent>=65) return "Base adecuada; conviene reforzar";
  return "Conviene repasar antes de avanzar";
}

function startEvaluation(kind){
  const questions=kind==="diagnostic"?DIAGNOSTIC_QUESTIONS:FINAL_EVAL_QUESTIONS;
  const runner=$("evaluationRunner");
  if(!runner) return;
  let index=0,score=0,answers=[];
  runner.classList.remove("hidden");

  function renderQuestion(){
    const q=questions[index];
    runner.innerHTML=`
      <div class="eval-runner-head">
        <div><span>${kind==="diagnostic"?"Diagnóstico":"Evaluación final"}</span><b>Pregunta ${index+1} de ${questions.length}</b></div>
        <div class="eval-progress"><div style="width:${((index)/questions.length)*100}%"></div></div>
      </div>
      <div class="eval-question-card">
        <p class="eval-level">${escapeHtml(DATA.levels.find(l=>l.id===q.level)?.title||q.level)}</p>
        <h3>${escapeHtml(q.q)}</h3>
        <div class="eval-options">${q.choices.map((choice,i)=>`<button type="button" data-eval-choice="${i}">${escapeHtml(choice)}</button>`).join("")}</div>
        <p class="feedback" data-eval-feedback aria-live="polite"></p>
      </div>`;
    runner.querySelectorAll("[data-eval-choice]").forEach(btn=>btn.addEventListener("click",()=>{
      const chosen=Number(btn.dataset.evalChoice),ok=chosen===q.a;
      if(ok) score++;
      answers.push({level:q.level,correct:ok});
      runner.querySelectorAll("[data-eval-choice]").forEach(b=>{
        b.disabled=true;
        if(Number(b.dataset.evalChoice)===q.a)b.classList.add("correct");
        else if(b===btn)b.classList.add("wrong");
      });
      runner.querySelector("[data-eval-feedback]").textContent=ok?"Correcto.":"Respuesta incorrecta.";
      setTimeout(()=>{
        index++;
        if(index<questions.length) renderQuestion();
        else finish();
      },420);
    }));
  }

  function finish(){
    const percent=Math.round((score/questions.length)*100);
    const result={score,total:questions.length,percent,label:evaluationLabel(percent),at:new Date().toISOString(),answers};
    if(kind==="diagnostic")state.diagnostic=result;else state.finalEvaluation=result;
    saveState();
    const byLevel=DATA.levels.map(level=>{
      const items=answers.filter(a=>a.level===level.id);
      const correct=items.filter(a=>a.correct).length;
      return {level,correct,total:items.length};
    }).filter(x=>x.total);
    runner.innerHTML=`
      <div class="evaluation-result">
        <span class="result-percent">${percent}%</span>
        <h3>${escapeHtml(result.label)}</h3>
        <p>${score} respuestas correctas de ${questions.length}.</p>
        <div class="level-result-grid">
          ${byLevel.map(item=>`<div class="level-result ${item.correct===item.total?"good":""}">
            <span>${escapeHtml(item.level.title)}</span><b>${item.correct}/${item.total}</b>
          </div>`).join("")}
        </div>
        <div class="eval-result-actions">
          <button class="primary-btn" type="button" data-eval-retry>Repetir</button>
          <button class="ghost-btn" type="button" data-eval-close>Cerrar</button>
        </div>
      </div>`;
    runner.querySelector("[data-eval-retry]").addEventListener("click",()=>startEvaluation(kind));
    runner.querySelector("[data-eval-close]").addEventListener("click",()=>runner.classList.add("hidden"));
    renderEvaluationSummary();
    renderBadges();
  }
  renderQuestion();
}

/* Refuerza el progreso al marcar niveles */
const _updateHomeProgressPhase1 = updateHomeProgress;
updateHomeProgress = function(){
  _updateHomeProgressPhase1();
  renderDetailedProgress();
  renderEvaluationSummary();
  renderBadges();
};


document.addEventListener("DOMContentLoaded",()=>{
  renderLevelCards();
  document.querySelectorAll(".nav-btn").forEach(btn=>btn.addEventListener("click",()=>showView(btn.dataset.view)));
  $("startCourseBtn").addEventListener("click",()=>showView("curso"));
  $("openMapBtn").addEventListener("click",()=>showView("mapa"));
  $("startDiagnosticBtn")?.addEventListener("click",()=>startEvaluation("diagnostic"));
  $("startFinalEvalBtn")?.addEventListener("click",()=>startEvaluation("final"));
  renderEvaluationSummary();
  renderBadges();
  if(location.hash==="#curso") showView("curso");
  else if(location.hash==="#mapa") showView("mapa");
  else if(location.hash==="#evaluacion") showView("evaluacion");
});
