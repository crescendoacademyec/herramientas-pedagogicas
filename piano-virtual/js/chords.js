// ---------- DETECTOR DE ACORDES (UNIFICADO) ----------
// Convertimos todos los tipos de acordes a un array de objetos { name, intervals }
const CHORD_PATTERNS = window.CrescendoChordPatterns;

const CHORD_PATTERNS_SORTED = CHORD_PATTERNS.map((p,i)=>({...p,id:i,intervals:[...new Set(p.intervals.map(x=>(x+12)%12))].sort((a,b)=>a-b)})).sort((a,b)=>b.intervals.length-a.intervals.length);
const chordMatchCache=new Map();
function findChordMatches(pcs){
  const cacheKey=pcs.join(','); if(chordMatchCache.has(cacheKey)) return chordMatchCache.get(cacheKey);
  const matches=[];
  for(const root of pcs){
    const actual=pcs.map(pc=>(pc-root+12)%12).sort((a,b)=>a-b);
    for(const p of CHORD_PATTERNS_SORTED){
      const missing=p.intervals.filter(iv=>!actual.includes(iv)); if(missing.length) continue;
      const extras=actual.filter(iv=>!p.intervals.includes(iv));
      const exact=extras.length===0&&p.intervals.length===actual.length;
      let score=(exact?1000:600)+p.intervals.length*20-extras.length*55+(pcs[0]===root?15:0);
      matches.push({root,name:p.name,intervals:p.intervals,extras,exact,score});
    }
  }
  matches.sort((a,b)=>b.score-a.score||a.name.localeCompare(b.name));
  const unique=[]; const seen=new Set(); for(const m of matches){const k=m.root+'|'+m.name;if(!seen.has(k)){seen.add(k);unique.push(m)} if(unique.length>=8)break}
  chordMatchCache.set(cacheKey,unique); return unique;
}
function identifyChord(midiNotes){
  if(!midiNotes||midiNotes.length<2)return null; const pcs=[...new Set(midiNotes.map(m=>m%12))].sort((a,b)=>a-b); if(pcs.length<2)return null;
  const matches=findChordMatches(pcs); if(!matches.length)return null; const best=matches[0],lowest=Math.min(...midiNotes),bass=lowest%12;
  return {rootPc:best.root,rootName:formatPc(best.root),suffix:best.name,intervals:[...best.intervals],inversion:bass!==best.root?'/'+formatPc(bass):'',noteCount:midiNotes.length,confidence:best.exact?'Exacta':'Compatible',alternatives:matches.slice(1,5),pcs};
}

// ---------- GRADOS (NÚMEROS ROMANOS) RESPECTO A UNA TONALIDAD ----------
// Referencia diatónica estándar de escala mayor; los grados fuera de esa
// escala se muestran con alteración (bII, #IV, etc.), una convención de
// análisis funcional habitual también para tonalidades menores relativas.
const ROMAN_DEGREES=['I','♭II','II','♭III','III','IV','♯IV','V','♭VI','VI','♭VII','VII'];
function degreeForPc(pc){if(currentKeyPc===null)return null;const rel=(pc-currentKeyPc+12)%12;const scale=MODE_INTERVALS[currentScaleMode]||MODE_INTERVALS.major;const ix=scale.indexOf(rel);return ix>=0?['I','II','III','IV','V','VI','VII'][ix]:ROMAN_DEGREES[rel]}
function isDominantFamily(s){return /(^7|9|13|sus)/.test(s)&&!s.startsWith('m')&&!s.startsWith('∆')&&!s.startsWith('º')&&!s.startsWith('ø')}
function computeRomanNumeral(rootPc,keyPc,suffix){
  let deg=degreeForPc(rootPc)||ROMAN_DEGREES[(rootPc-keyPc+12)%12];
  if(isDominantFamily(suffix)){const target=(rootPc+5)%12,targetDeg=degreeForPc(target);if(targetDeg&&target!==keyPc) return 'V/'+targetDeg.toLowerCase()}
  if(suffix.startsWith('m')||suffix.startsWith('º')||suffix.startsWith('ø')) deg=deg.toLowerCase(); if(suffix.startsWith('º'))deg+='°';else if(suffix.startsWith('ø'))deg+='ø';else if(suffix.startsWith('+'))deg+='+';return deg;
}
const chordDetailsPanel=document.getElementById('chordDetailsPanel'),chordDetailsBody=document.getElementById('chordDetailsBody'),chordDetailsTitle=document.getElementById('chordDetailsTitle'); let lastChordResult=null;
function renderChordDetails(){if(!lastChordResult){chordDetailsBody.textContent='Toca al menos dos notas para analizar el acorde.';return}const r=lastChordResult;const notes=r.pcs.map(formatPc).join(' · ');let html=`<div><strong>Notas:</strong> ${notes}</div><div><strong>Coincidencia:</strong> ${r.confidence}</div>`;if(currentKeyPc!==null)html+=`<div><strong>Función:</strong> ${computeRomanNumeral(r.rootPc,currentKeyPc,r.suffix)} en ${formatPc(currentKeyPc)} ${keyModeSelect.options[keyModeSelect.selectedIndex]?.textContent||''}</div>`;if(r.alternatives.length){html+='<div style="margin-top:8px"><strong>Lecturas alternativas</strong></div>'+r.alternatives.map(a=>`<div class="chord-alt">${formatPc(a.root)}${a.name}${a.exact?' · exacta':' · compatible'}</div>`).join('')}chordDetailsBody.innerHTML=html;chordDetailsTitle.textContent=formatPc(r.rootPc)+r.suffix+r.inversion}
function toggleChordDetails(force){const open=force!==undefined?force:chordDetailsPanel.hidden;chordDetailsPanel.hidden=!open;document.getElementById('chordDisplay').setAttribute('aria-expanded',String(open));if(open)renderChordDetails()}
document.getElementById('chordDisplay').addEventListener('click',()=>toggleChordDetails());document.getElementById('chordDisplay').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();toggleChordDetails()}});document.getElementById('chordDetailsClose').addEventListener('click',()=>toggleChordDetails(false));
function updateChordDisplay(){
  try{const activeMidi=Object.keys(activeSources).map(Number);if(!activeMidi.length){chordNameEl.textContent='—';chordSubEl.textContent='';lastChordResult=null;return}const r=identifyChord(activeMidi);lastChordResult=r;if(r){chordNameEl.textContent=r.rootName+r.suffix+r.inversion;let sub=`${r.noteCount} notas · ${r.confidence}`;if(currentKeyPc!==null)sub+=' · '+computeRomanNumeral(r.rootPc,currentKeyPc,r.suffix);if(lastMidiVelocity!==127)sub+=` · vel ${lastMidiVelocity}`;chordSubEl.textContent=sub}else{chordNameEl.textContent='...';chordSubEl.textContent=activeMidi.length+' notas'}if(!chordDetailsPanel.hidden)renderChordDetails()}catch(e){console.warn('Error en updateChordDisplay:',e);chordNameEl.textContent='?';chordSubEl.textContent='error'}
}
