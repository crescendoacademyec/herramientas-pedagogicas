    // ======================================================================
    // 3. CÓDIGO DE CARGA DE PARTITURAS (PDF, MusicXML, Imagen, Web)
    // ======================================================================
    const pdfViewer = document.getElementById('pdfViewer');
    const webViewer = document.getElementById('webViewer');
    const osmdContainer = document.getElementById('osmdContainer');
    const imageContainer = document.getElementById('imageContainer');
    const imageViewer = document.getElementById('imageViewer');
    const pdfUpload = document.getElementById('pdfUpload');
    const pdfClearBtn = document.getElementById('pdfClearBtn');
    const webUrlInput = document.getElementById('webUrlInput');
    const webLoadBtn = document.getElementById('webLoadBtn');
    const webOpenNewTabBtn = document.getElementById('webOpenNewTabBtn');
    const webClearBtn = document.getElementById('webClearBtn');
    const webLoadNote = document.getElementById('webLoadNote');
    const scoreStatus = document.getElementById('scoreStatus');
    const scorePlayControls = document.getElementById('scorePlayControls');
    const scorePlayBtn = document.getElementById('scorePlayBtn');
    const scorePauseBtn = document.getElementById('scorePauseBtn');
    const scoreStopBtn = document.getElementById('scoreStopBtn');
    const scorePrevBtn = document.getElementById('scorePrevBtn');
    const scoreNextBtn = document.getElementById('scoreNextBtn');
    const scoreTempoInput = document.getElementById('scoreTempo');
    const scoreTempoDown = document.getElementById('scoreTempoDown');
    const scoreTempoUp = document.getElementById('scoreTempoUp');
    const scoreZoomInBtn = document.getElementById('scoreZoomInBtn');
    const scoreZoomOutBtn = document.getElementById('scoreZoomOutBtn');
    const scoreLoopStartBtn = document.getElementById('scoreLoopStartBtn');
    const scoreLoopEndBtn = document.getElementById('scoreLoopEndBtn');
    const scoreLoopBtn = document.getElementById('scoreLoopBtn');
    const scoreLoopClearBtn = document.getElementById('scoreLoopClearBtn');
    const scoreCountIn = document.getElementById('scoreCountIn');
    const scoreMetroSync = document.getElementById('scoreMetroSync');
    const scoreLoopRepeats = document.getElementById('scoreLoopRepeats');
    const scoreLoopBpmAdd = document.getElementById('scoreLoopBpmAdd');
    const scoreLoopBpmEvery = document.getElementById('scoreLoopBpmEvery');
    const practiceStatus = document.getElementById('practiceStatus');

    function adjustScoreTempo(delta) {
      const min = parseInt(scoreTempoInput.min) || 20;
      const max = parseInt(scoreTempoInput.max) || 300;
      const current = parseInt(scoreTempoInput.value) || 100;
      const next = Math.min(max, Math.max(min, current + delta));
      scoreTempoInput.value = next;
      scoreTempoInput.dispatchEvent(new Event('change'));
    }
    scoreTempoDown.addEventListener('click', () => adjustScoreTempo(-1));
    scoreTempoUp.addEventListener('click', () => adjustScoreTempo(1));
    scoreTempoInput.addEventListener('change', function() {
      const bpm = parseInt(this.value) || 100;
      scoreStatus.textContent = 'Tempo: ' + bpm + ' BPM';
    });

    let currentPdfUrl = null;
    let currentImageUrl = null;
    let osmd = null;

    // ---------- ZOOM / PAN DE IMAGEN ----------
    let imageScale = 1, imageTranslateX = 0, imageTranslateY = 0;
    let isImageDragging = false;
    let dragStartX = 0, dragStartY = 0;
    let dragStartTranslateX = 0, dragStartTranslateY = 0;

    function updateImageTransform() {
      imageViewer.style.transform = `translate(${imageTranslateX}px, ${imageTranslateY}px) scale(${imageScale})`;
    }
    function resetImageTransform() {
      imageScale = 1; imageTranslateX = 0; imageTranslateY = 0;
      updateImageTransform();
    }

    function setupImageControls() {
      imageContainer.addEventListener('wheel', function(e) {
        if (imageContainer.style.display === 'none') return;
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        const rect = imageContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const newScale = Math.min(5, Math.max(0.2, imageScale + delta));
        if (newScale === imageScale) return;
        const ratio = newScale / imageScale;
        imageTranslateX = mouseX - (mouseX - imageTranslateX) * ratio;
        imageTranslateY = mouseY - (mouseY - imageTranslateY) * ratio;
        imageScale = newScale;
        updateImageTransform();
      }, { passive: false });

      imageContainer.addEventListener('mousedown', function(e) {
        if (imageContainer.style.display === 'none') return;
        if (e.button !== 0) return;
        isImageDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartTranslateX = imageTranslateX;
        dragStartTranslateY = imageTranslateY;
        imageContainer.style.cursor = 'grabbing';
        e.preventDefault();
      });

      window.addEventListener('mousemove', function(e) {
        if (!isImageDragging) return;
        const dx = e.clientX - dragStartX;
        const dy = e.clientY - dragStartY;
        imageTranslateX = dragStartTranslateX + dx;
        imageTranslateY = dragStartTranslateY + dy;
        updateImageTransform();
      });

      window.addEventListener('mouseup', function(e) {
        if (isImageDragging) {
          isImageDragging = false;
          imageContainer.style.cursor = 'grab';
        }
      });

      // Touch
      let lastTouchDist = 0;
      let touchStartX = 0, touchStartY = 0;
      let touchStartTranslateX = 0, touchStartTranslateY = 0;
      let touchStartScale = 1;

      imageContainer.addEventListener('touchstart', function(e) {
        if (imageContainer.style.display === 'none') return;
        const touches = e.touches;
        if (touches.length === 1) {
          isImageDragging = true;
          touchStartX = touches[0].clientX;
          touchStartY = touches[0].clientY;
          touchStartTranslateX = imageTranslateX;
          touchStartTranslateY = imageTranslateY;
        } else if (touches.length === 2) {
          const dx = touches[0].clientX - touches[1].clientX;
          const dy = touches[0].clientY - touches[1].clientY;
          lastTouchDist = Math.sqrt(dx*dx + dy*dy);
          touchStartScale = imageScale;
          touchStartTranslateX = imageTranslateX;
          touchStartTranslateY = imageTranslateY;
          const midX = (touches[0].clientX + touches[1].clientX) / 2;
          const midY = (touches[0].clientY + touches[1].clientY) / 2;
          const rect = imageContainer.getBoundingClientRect();
          touchStartX = midX - rect.left;
          touchStartY = midY - rect.top;
        }
        e.preventDefault();
      }, { passive: false });

      imageContainer.addEventListener('touchmove', function(e) {
        if (imageContainer.style.display === 'none') return;
        const touches = e.touches;
        if (touches.length === 1 && isImageDragging) {
          const dx = touches[0].clientX - touchStartX;
          const dy = touches[0].clientY - touchStartY;
          imageTranslateX = touchStartTranslateX + dx;
          imageTranslateY = touchStartTranslateY + dy;
          updateImageTransform();
          e.preventDefault();
        } else if (touches.length === 2) {
          const dx = touches[0].clientX - touches[1].clientX;
          const dy = touches[0].clientY - touches[1].clientY;
          const dist = Math.sqrt(dx*dx + dy*dy);
          const scaleFactor = dist / lastTouchDist;
          const newScale = Math.min(5, Math.max(0.2, touchStartScale * scaleFactor));
          const rect = imageContainer.getBoundingClientRect();
          const midX = (touches[0].clientX + touches[1].clientX) / 2 - rect.left;
          const midY = (touches[0].clientY + touches[1].clientY) / 2 - rect.top;
          const ratio = newScale / touchStartScale;
          imageTranslateX = midX - (midX - touchStartTranslateX) * ratio;
          imageTranslateY = midY - (midY - touchStartTranslateY) * ratio;
          imageScale = newScale;
          updateImageTransform();
          e.preventDefault();
        }
      }, { passive: false });

      imageContainer.addEventListener('touchend', function(e) {
        isImageDragging = false;
      });
    }
    setupImageControls();

    // Atajos de teclado para zoom de imagen
    window.addEventListener('keydown', function(e) {
      if (imageContainer.style.display === 'none') return;
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        const rect = imageContainer.getBoundingClientRect();
        const cx = rect.width / 2, cy = rect.height / 2;
        const newScale = Math.min(5, imageScale + 0.1);
        if (newScale === imageScale) return;
        const ratio = newScale / imageScale;
        imageTranslateX = cx - (cx - imageTranslateX) * ratio;
        imageTranslateY = cy - (cy - imageTranslateY) * ratio;
        imageScale = newScale;
        updateImageTransform();
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        const rect = imageContainer.getBoundingClientRect();
        const cx = rect.width / 2, cy = rect.height / 2;
        const newScale = Math.max(0.2, imageScale - 0.1);
        if (newScale === imageScale) return;
        const ratio = newScale / imageScale;
        imageTranslateX = cx - (cx - imageTranslateX) * ratio;
        imageTranslateY = cy - (cy - imageTranslateY) * ratio;
        imageScale = newScale;
        updateImageTransform();
      } else if (e.key === '0') {
        e.preventDefault();
        resetImageTransform();
      }
    });

    // ---------- FUNCIONES DE PARTITURA ----------
    function ensureOSMD() {
      if (typeof opensheetmusicdisplay === 'undefined') {
        throw new Error('La librería OpenSheetMusicDisplay no se cargó.');
      }
      if (!osmd) {
        osmd = new opensheetmusicdisplay.OpenSheetMusicDisplay(osmdContainer, {
          autoResize: true,
          drawTitle: true,
          followCursor: true
        });
      }
      return osmd;
    }

    function getTempo() { return parseFloat(scoreTempoInput.value) || 100; }

    let scorePlaying = false;
    let scorePlaybackTimer = null;
    let currentStepIndex = -1;
    let scoreActiveHandles = [];

    // ---------- Resaltado en el diapasón/pentagrama de la nota que suena ----------
    let loadedMusicXmlText = '';
    let scoreXmlHints = [];
    const scoreHighlightMidis = new Set();
    let scoreCandidateCells = [];
    let scoreRecommendedCells = [];
    let previousRecommendedCells = [];
    let tutorMode = false;
    let tutorExpectedKeys = new Set();
    let tutorCompletedKeys = new Set();

    function scoreCellKey(cell){ return `${cell.string}:${cell.fret}`; }
    function stringDisplayNumber(stringIdx){ return stringIdx + 1; }
    function noteLabelFromMidi(midi){
      const n=spellPc(((midi%12)+12)%12,rootSel.value||'');
      return `${n}${Math.floor(midi/12)-1}`;
    }
    function allPositionsForMidi(midi){
      const courses=activeCourseVoices();
      const maxDisplay=Math.max(0,TOTAL_FRETS-capoSemitones());
      const out=[];
      const seen=new Set();
      for(let s=0;s<courses.length;s++){
        for(const openMidi of courses[s]){
          const fret=midi-openMidi-activeInstrument().nutFret;
          const key=`${s}:${fret}`;
          if(Number.isInteger(fret)&&fret>=0&&fret<=maxDisplay&&!seen.has(key)){
            seen.add(key);
            out.push({string:s,fret,midi,pc:((midi%12)+12)%12});
          }
        }
      }
      return out;
    }
    let phrasePlan = [];
    let phrasePlanReady = false;
    let phrasePlanVersion = 0;

    function xmlText(node,selector){
      const el=node?.querySelector?.(selector);
      return el?String(el.textContent||'').trim():'';
    }
    function parseMusicXmlHints(xml){
      if(!xml||typeof DOMParser==='undefined')return [];
      try{
        const doc=new DOMParser().parseFromString(xml,'application/xml');
        if(doc.querySelector('parsererror'))return [];
        const out=[];
        const parts=[...doc.querySelectorAll('part')];
        if(!parts.length)return out;
        // Para la guía instrumental usamos la primera parte escrita; es la que OSMD
        // normalmente recorre primero en partituras solistas.
        const part=parts[0];
        let divisions=1;
        for(const measure of [...part.querySelectorAll(':scope > measure')]){
          const div=+(xmlText(measure,'attributes > divisions')||divisions);
          if(Number.isFinite(div)&&div>0)divisions=div;
          let cursor=0,lastStart=0;
          const events=new Map();
          for(const child of [...measure.children]){
            const tag=child.localName;
            if(tag==='backup'){cursor-=+(xmlText(child,'duration')||0);continue;}
            if(tag==='forward'){cursor+=+(xmlText(child,'duration')||0);continue;}
            if(tag!=='note')continue;
            const dur=+(xmlText(child,'duration')||0);
            const chord=!!child.querySelector(':scope > chord');
            const start=chord?lastStart:cursor;
            lastStart=start;
            if(!chord)cursor+=dur;
            if(child.querySelector(':scope > rest'))continue;
            const pitch=child.querySelector(':scope > pitch');
            if(!pitch)continue;
            const step=xmlText(pitch,'step'), alter=+(xmlText(pitch,'alter')||0), octave=+(xmlText(pitch,'octave')||0);
            const pc={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[step];
            if(pc==null||!Number.isFinite(octave))continue;
            const writtenMidi=(octave+1)*12+pc+alter;
            const noteHint={writtenMidi,
              slurStart:!!child.querySelector('notations slur[type="start"]'),
              slurStop:!!child.querySelector('notations slur[type="stop"]'),
              tieStart:!!child.querySelector('tie[type="start"], tied[type="start"]'),
              tieStop:!!child.querySelector('tie[type="stop"], tied[type="stop"]'),
              slideStart:!!child.querySelector('slide[type="start"], glissando[type="start"]'),
              slideStop:!!child.querySelector('slide[type="stop"], glissando[type="stop"]'),
              hammerStart:!!child.querySelector('hammer-on[type="start"]'),
              hammerStop:!!child.querySelector('hammer-on[type="stop"]'),
              pullStart:!!child.querySelector('pull-off[type="start"]'),
              pullStop:!!child.querySelector('pull-off[type="stop"]'),
              staccato:!!child.querySelector('articulations staccato'),
              tenuto:!!child.querySelector('articulations tenuto'),
              accent:!!child.querySelector('articulations accent, articulations strong-accent'),
              technicalFinger:+(xmlText(child,'technical > fingering')||0)||null,
              technicalString:+(xmlText(child,'technical > string')||0)||null,
              technicalFret:xmlText(child,'technical > fret')!==''?+(xmlText(child,'technical > fret')):null,
              barreStart:!!child.querySelector('technical barre[type="start"]'),
              barreStop:!!child.querySelector('technical barre[type="stop"]')
            };
            if(!events.has(start))events.set(start,{notes:[],measure:String(measure.getAttribute('number')||''),time:start/divisions});
            events.get(start).notes.push(noteHint);
          }
          [...events.entries()].sort((a,b)=>a[0]-b[0]).forEach(([,e])=>out.push(e));
        }
        return out;
      }catch(err){console.warn('No se pudieron leer técnicas MusicXML:',err);return [];}
    }
    function attachMusicXmlHintsToSteps(){
      if(!scoreSteps.length)return;
      const octaveOffset=-(Number(activeInstrument?.().writtenTranspose||0));
      let hi=0;
      for(const step of scoreSteps){
        step.technique={notes:[],labels:[]};
        if(!step.midis?.length)continue;
        let best=-1,bestScore=-1;
        for(let j=hi;j<Math.min(scoreXmlHints.length,hi+6);j++){
          const h=scoreXmlHints[j];
          const hm=h.notes.map(n=>n.writtenMidi+octaveOffset);
          const overlap=hm.filter(m=>step.midis.includes(m)).length;
          const score=overlap*10-Math.abs(hm.length-step.midis.length);
          if(score>bestScore){best=j;bestScore=score;}
        }
        if(best>=0&&bestScore>0){
          const h=scoreXmlHints[best]; hi=best+1;
          step.technique={...h,notes:h.notes.map(n=>({...n,midi:n.writtenMidi+octaveOffset})),labels:[]};
          const ns=step.technique.notes;
          const add=(cond,label)=>{if(cond&&!step.technique.labels.includes(label))step.technique.labels.push(label);};
          add(ns.some(n=>n.hammerStart||n.hammerStop),'hammer-on');
          add(ns.some(n=>n.pullStart||n.pullStop),'pull-off');
          add(ns.some(n=>n.slideStart||n.slideStop),'slide');
          add(ns.some(n=>n.slurStart||n.slurStop),'ligado');
          add(ns.some(n=>n.tieStart||n.tieStop),'ligadura');
          add(ns.some(n=>n.barreStart||n.barreStop),'cejilla');
          add(ns.some(n=>n.staccato),'staccato'); add(ns.some(n=>n.tenuto),'tenuto'); add(ns.some(n=>n.accent),'acento');
          add(ns.some(n=>n.technicalString||n.technicalFret!=null||n.technicalFinger),'digitación escrita');
        }
      }
    }
    function techniqueForIndex(i){return scoreSteps[i]?.technique||{notes:[],labels:[]};}
    function techniqueForCurrent(){return techniqueForIndex(currentPlanIndex());}

    function preferredFretCenter(){
      if(scoreFingeringStrategy?.value==='low') return 2;
      if(scoreFingeringStrategy?.value==='position'){
        const v=posSel.value;
        if(/^\d+$/.test(v)) return Math.max(1,+v)+2;
        if(patternSel.value.startsWith('3nps:')) return 1+(Math.max(1,+patternSel.value.split(':')[1])-1)*2+2;
      }
      if(previousRecommendedCells.length){
        return previousRecommendedCells.reduce((a,c)=>a+c.fret,0)/previousRecommendedCells.length;
      }
      return offset>0?offset+2:5;
    }

    function assignmentCost(cells){
      if(!cells.length) return 1e9;
      const center=preferredFretCenter();
      const frets=cells.map(c=>c.fret);
      const span=Math.max(...frets)-Math.min(...frets);
      let cost=span*3+frets.reduce((a,f)=>a+Math.abs(f-center),0);
      if(scoreFingeringStrategy?.value==='continuity'&&previousRecommendedCells.length){
        const prevByMidi=new Map(previousRecommendedCells.map(c=>[c.midi,c]));
        cells.forEach(c=>{const prev=prevByMidi.get(c.midi); if(prev) cost+=Math.abs(c.fret-prev.fret)*1.5+Math.abs(c.string-prev.string)*.8;});
      }
      cells.forEach(c=>{ if(c.fret===0) cost+=scoreFingeringStrategy?.value==='low'?-1:.7; });
      return cost;
    }

    function enumerateAssignments(midis, maxResults=24){
      const unique=[...new Set(midis)].slice(0,6);
      if(!unique.length) return [{cells:[],baseCost:0}];
      const optionSets=unique.map(m=>allPositionsForMidi(m));
      if(optionSets.some(x=>!x.length)) return [];
      const results=[];
      function walk(i,cells,usedStrings){
        if(results.length>1200)return;
        if(i===optionSets.length){ results.push({cells:cells.map(c=>({...c})),baseCost:assignmentCost(cells)}); return; }
        optionSets[i].forEach(c=>{
          if(usedStrings.has(c.string)) return;
          usedStrings.add(c.string); cells.push(c); walk(i+1,cells,usedStrings); cells.pop(); usedStrings.delete(c.string);
        });
      }
      walk(0,[],new Set());
      if(!results.length){
        const fallback=unique.map(m=>allPositionsForMidi(m).sort((a,b)=>Math.abs(a.fret-preferredFretCenter())-Math.abs(b.fret-preferredFretCenter()))[0]).filter(Boolean);
        return fallback.length?[{cells:fallback,baseCost:assignmentCost(fallback)}]:[];
      }
      results.sort((a,b)=>a.baseCost-b.baseCost);
      return results.slice(0,maxResults);
    }

    function candidateHandPositions(cells){
      const fretted=cells.filter(c=>c.fret>0).map(c=>c.fret);
      if(!fretted.length)return [1];
      const min=Math.min(...fretted), max=Math.max(...fretted), set=new Set();
      for(let p=Math.max(1,min-3);p<=Math.min(TOTAL_FRETS,max);p++)set.add(p);
      set.add(Math.max(1,Math.round((min+max)/2)-1));
      return [...set].sort((a,b)=>a-b);
    }

    function fingerize(cells,handPos){
      let penalty=0;
      const out=cells.map(c=>{
        if(c.fret===0)return {...c,finger:0,handPos};
        const raw=c.fret-handPos+1;
        const finger=Math.max(1,Math.min(4,raw));
        if(raw<1)penalty+=(1-raw)*4;
        if(raw>4)penalty+=(raw-4)*4;
        return {...c,finger,handPos};
      });
      const byFinger=new Map();
      out.filter(c=>c.fret>0).forEach(c=>{
        const arr=byFinger.get(c.finger)||[];arr.push(c);byFinger.set(c.finger,arr);
      });
      byFinger.forEach(arr=>{
        const frets=new Set(arr.map(c=>c.fret));
        if(frets.size>1)penalty+=5*(frets.size-1);
        if(arr.length>1&&frets.size===1)penalty-=.6; // cejilla razonable
      });
      const fretted=out.filter(c=>c.fret>0);
      if(fretted.length){
        const span=Math.max(...fretted.map(c=>c.fret))-Math.min(...fretted.map(c=>c.fret));
        if(span>4)penalty+=(span-4)*5;
      }
      return {cells:out,handPos,penalty};
    }

    function buildStepStates(midis,technique=null){
      const assigns=enumerateAssignments(midis,18);
      const states=[];
      assigns.forEach(a=>candidateHandPositions(a.cells).forEach(p=>{
        const f=fingerize(a.cells,p);
        let local=a.baseCost+f.penalty;
        if(scoreFingeringStrategy?.value==='low')local+=p*.7;
        if(scoreFingeringStrategy?.value==='position')local+=Math.abs(p-preferredFretCenter())*1.2;
        if(scoreTechniqueMode?.value!=='neutral'&&technique?.notes?.length){
          f.cells.forEach(c=>{
            const h=technique.notes.find(n=>n.midi===c.midi);
            if(!h)return;
            if(h.technicalString){const wanted=h.technicalString-1; local+=Math.abs(c.string-wanted)*18;}
            if(h.technicalFret!=null&&Number.isFinite(h.technicalFret))local+=Math.abs(c.fret-h.technicalFret)*18;
            if(h.technicalFinger) local+=Math.abs((c.finger||0)-h.technicalFinger)*8;
          });
        }
        states.push({cells:f.cells,handPos:p,cost:local,technique});
      }));
      states.sort((a,b)=>a.cost-b.cost);
      return states.slice(0,36);
    }

    function transitionCost(prev,next,prevTech=null,nextTech=null){
      if(!prev)return 0;
      let cost=Math.abs((next.handPos||1)-(prev.handPos||1))*2.6;
      const prevByMidi=new Map((prev.cells||[]).map(c=>[c.midi,c]));
      (next.cells||[]).forEach(c=>{
        const p=prevByMidi.get(c.midi);
        if(p){
          cost+=Math.abs(c.string-p.string)*.9+Math.abs(c.fret-p.fret)*.55;
          if(c.string===p.string&&c.fret===p.fret)cost-=1.4;
        }
      });
      const prevCenter=(prev.cells||[]).length?prev.cells.reduce((a,c)=>a+c.string,0)/prev.cells.length:0;
      const nextCenter=(next.cells||[]).length?next.cells.reduce((a,c)=>a+c.string,0)/next.cells.length:prevCenter;
      cost+=Math.abs(nextCenter-prevCenter)*.25;
      if(scoreTechniqueMode?.value!=='neutral'){
        const prevNotes=prevTech?.notes||[], nextNotes=nextTech?.notes||[];
        const connected=prevNotes.some(n=>n.slurStart||n.hammerStart||n.pullStart||n.slideStart)||nextNotes.some(n=>n.slurStop||n.hammerStop||n.pullStop||n.slideStop);
        const slide=prevNotes.some(n=>n.slideStart)||nextNotes.some(n=>n.slideStop);
        const tied=prevNotes.some(n=>n.tieStart)||nextNotes.some(n=>n.tieStop);
        if(connected&&prev.cells?.length===1&&next.cells?.length===1){
          const a=prev.cells[0],b=next.cells[0];
          if(a.string===b.string)cost-=slide?5.5:3.2; else cost+=slide?12:5.5;
          if((prevNotes.some(n=>n.hammerStart||n.pullStart)||nextNotes.some(n=>n.hammerStop||n.pullStop))&&a.string!==b.string)cost+=10;
        }
        if(tied){
          const a=prev.cells?.[0],b=next.cells?.[0];
          if(a&&b&&a.midi===b.midi){cost+=(a.string===b.string&&a.fret===b.fret)?-8:14;}
        }
      }
      return cost;
    }

    function optimizePhraseSteps(steps){
      if(!steps.length)return [];
      let beam=[{total:0,state:null,path:[]}];
      for(const step of steps){
        const tech=step.technique||{notes:[],labels:[]};
        const states=step.midis?.length?buildStepStates(step.midis,tech):[{cells:[],handPos:beam[0]?.state?.handPos||1,cost:0,technique:tech}];
        const nextBeam=[];
        for(const b of beam){
          for(const st0 of states){
            const st={...st0,cells:st0.cells.map(c=>({...c})),technique:tech};
            const total=b.total+st.cost+transitionCost(b.state,st,b.state?.technique,tech);
            nextBeam.push({total,state:st,path:b.path.concat([st])});
          }
        }
        nextBeam.sort((a,b)=>a.total-b.total);
        beam=nextBeam.slice(0,28);
      }
      const path=beam[0]?.path||[];
      path.forEach((st,i)=>{
        st.annotations=[];
        const prev=path[i-1];
        if(prev){
          const delta=Math.abs((st.handPos||1)-(prev.handPos||1));
          if(delta>=2)st.annotations.push(`cambio a posición ${romanPosition(st.handPos)}`);
          for(const c of st.cells||[]){
            const p=(prev.cells||[]).find(x=>x.string===c.string&&x.finger===c.finger&&x.finger>0);
            if(p&&p.fret!==c.fret)st.annotations.push(`dedo guía ${c.finger}`);
          }
        }
        const groups=new Map();
        (st.cells||[]).filter(c=>c.fret>0).forEach(c=>{const k=`${c.fret}:${c.finger}`;const a=groups.get(k)||[];a.push(c);groups.set(k,a);});
        groups.forEach(a=>{if(a.length>=2)st.annotations.push(`cejilla dedo ${a[0].finger} · traste ${a[0].fret}`);});
        (st.technique?.labels||[]).forEach(x=>st.annotations.push(x));
        st.annotations=[...new Set(st.annotations)];
      });
      return path;
    }

    function rebuildPhrasePlan(){
      phrasePlan=[]; phrasePlanReady=false; phrasePlanVersion++;
      if(!scoreSteps.length||!scoreSteps.some(s=>Array.isArray(s.midis))){
        if(phrasePlanDetail)phrasePlanDetail.textContent='Carga un MusicXML para analizar la frase.';
        return;
      }
      const n=Math.max(4,+scorePhraseLength?.value||8);
      for(let start=0;start<scoreSteps.length;start+=n){
        const slice=scoreSteps.slice(start,start+n);
        const path=optimizePhraseSteps(slice);
        path.forEach((state,i)=>{ phrasePlan[start+i]={...state,phraseStart:start,phraseEnd:start+slice.length-1}; });
      }
      phrasePlanReady=phrasePlan.length>0;
      if(phrasePlanDetail){
        phrasePlanDetail.textContent=phrasePlanReady?`Plan musical listo · bloques de ${n} eventos · dedos 1–4 · articulaciones y desplazamientos considerados`:'No se pudo construir un plan de digitación para esta partitura.';
      }
    }

    function currentPlanIndex(){
      if(!scoreSteps.length)return -1;
      if(scorePlaying)return Math.min(scoreSteps.length-1,Math.max(0,currentStepIndex+1));
      return Math.min(scoreSteps.length-1,Math.max(0,currentStepIndex));
    }

    function recommendFingering(midis){
      if(scoreFingeringStrategy?.value==='phrase'&&phrasePlanReady){
        const idx=currentPlanIndex();
        const plan=phrasePlan[idx];
        if(plan&&plan.cells?.length&&[...new Set(plan.cells.map(c=>c.midi))].every(m=>midis.includes(m))){
          return plan.cells.map(c=>({...c}));
        }
      }
      const states=buildStepStates(midis,techniqueForCurrent());
      return states[0]?.cells||[];
    }

    function updateFingeringForMidis(midis,{remember=true}={}){
      scoreCandidateCells=[...new Set(midis)].flatMap(allPositionsForMidi);
      scoreRecommendedCells=recommendFingering(midis);
      if(remember&&scoreRecommendedCells.length) previousRecommendedCells=scoreRecommendedCells.map(c=>({...c}));
      if(tutorMode){
        tutorExpectedKeys=new Set(scoreRecommendedCells.map(scoreCellKey));
        tutorCompletedKeys.clear();
      }
      if(!midis.length){
        fingeringCurrent.textContent='Sin nota activa';
        fingeringDetail.textContent='Avanza en la partitura para ver posiciones recomendadas.';
      }else{
        const notes=[...new Set(midis)].map(noteLabelFromMidi).join(' · ');
        fingeringCurrent.textContent=`${notes}${tutorMode?' · Tutor esperando':''}`;
        if(scoreRecommendedCells.length){
          fingeringDetail.textContent=scoreRecommendedCells.map(c=>`${noteLabelFromMidi(c.midi)} → cuerda ${stringDisplayNumber(c.string)}, traste ${c.fret}${c.finger===0?' · aire':` · dedo ${c.finger||'–'}`}`).join(' · ');
          if(phrasePlanDetail&&scoreFingeringStrategy?.value==='phrase'){
            const idx=currentPlanIndex(), plan=phrasePlan[idx];
            if(plan)phrasePlanDetail.textContent=`Frase ${plan.phraseStart+1}–${plan.phraseEnd+1} · posición ${romanPosition(plan.handPos)} · mano en traste ${plan.handPos} · ${plan.annotations?.length?plan.annotations.join(' · '):'continuidad instrumental'}`;
          }
          if(techniqueDetail){
            const tech=techniqueForCurrent();
            const labels=[...(tech.labels||[])];
            const plan=phrasePlan[currentPlanIndex()];
            if(plan?.annotations)labels.push(...plan.annotations.filter(x=>/guía|cejilla|cambio/.test(x)));
            techniqueDetail.textContent=labels.length?`Técnica: ${[...new Set(labels)].join(' · ')}`:'Técnica: digitación automática · sin articulación especial';
          }
        }else fingeringDetail.textContent='No hay una posición tocable dentro del rango actual del instrumento.';
      }
    }

    function romanPosition(n){
      const vals=[[10,'X'],[9,'IX'],[8,'VIII'],[7,'VII'],[6,'VI'],[5,'V'],[4,'IV'],[3,'III'],[2,'II'],[1,'I']];
      let x=Math.max(1,Math.min(20,Math.round(n||1))),out='';
      if(x>=10){out='X'.repeat(Math.floor(x/10));x%=10;}
      for(const [v,r] of vals.slice(1)){if(x>=v){out+=r;x-=v;break;}}
      return out||'I';
    }
    function clearFingering(){
      scoreCandidateCells=[]; scoreRecommendedCells=[]; tutorExpectedKeys.clear(); tutorCompletedKeys.clear();
      if(fingeringCurrent){fingeringCurrent.textContent='Carga un MusicXML para activar la digitación.';fingeringDetail.textContent='La app mostrará posiciones posibles y una recomendación de cuerda/traste.';if(techniqueDetail)techniqueDetail.textContent='Articulación: — · Técnica: análisis automático';if(phrasePlanDetail)phrasePlanDetail.textContent='Fase 5 · carga un MusicXML para analizar articulaciones, cambios de posición y dedos guía.';}
    }
    function setTutorMode(on){
      tutorMode=!!on; scoreTutorBtn.classList.toggle('active',tutorMode); scoreTutorBtn.setAttribute('aria-pressed',String(tutorMode)); scoreTutorBtn.textContent=tutorMode?'Tutor · ON':'Tutor · OFF';
      stopPlaybackAudio();
      if(tutorMode&&osmd&&osmd.cursor){
        if(currentStepIndex<0){osmd.cursor.reset();currentStepIndex=0;} osmd.cursor.show();
        const data=getCurrentStepData(getTempo()); setScoreHighlight(data.midis); updateFingeringForMidis(data.midis,{remember:false});
        practiceStatus.textContent='Tutor: toca la posición recomendada';
      }else{ practiceStatus.textContent=''; tutorExpectedKeys.clear(); tutorCompletedKeys.clear(); draw(); }
      saveSettings();
    }
    function setScoreHighlight(midis) {
      scoreHighlightMidis.clear();
      midis.forEach(m => scoreHighlightMidis.add(m));
      updateFingeringForMidis(midis);
      draw();
    }
    function clearScoreHighlight() {
      if (scoreHighlightMidis.size) {
        scoreHighlightMidis.clear();
        clearFingering();
        draw();
      }
    }

    // ---------- LOOP / REPETICIÓN DE UN TRAMO ----------
    let loopStart = null;
    let loopEnd = null;
    let loopEnabled = false;
    let loopCompletedCount = 0;
    let scoreStartedMetro = false;
    let countInTimers = [];

    function clearCountIn(){countInTimers.forEach(clearTimeout);countInTimers=[]}
    function syncScoreMetronome(start){if(start){if(scoreMetroSync.checked&&!metroRunning){setMetroBpm(getTempo());startMetro();scoreStartedMetro=true}}else if(scoreStartedMetro){stopMetro();scoreStartedMetro=false}}
    function runCountIn(done){clearCountIn();const bars=+scoreCountIn.value||0;if(!bars){done();return}const timing=getMeterTiming(getTempo()),total=bars*timing.pulses,c=ensureCtx(),start=c.currentTime+.08;practiceStatus.textContent=`Count-in ${bars}`;for(let i=0;i<total;i++){metroClick(start+i*timing.secondsPerPulse,i%timing.pulses===0)}const id=setTimeout(()=>{practiceStatus.textContent='';done()},Math.max(0,(start-c.currentTime)*1000+total*timing.secondsPerPulse*1000));countInTimers.push(id)}
    function onLoopCompleted(){loopCompletedCount++;const max=+scoreLoopRepeats.value||0;const every=Math.max(1,+scoreLoopBpmEvery.value||1),inc=Math.max(0,+scoreLoopBpmAdd.value||0);practiceStatus.textContent=`Loop ${loopCompletedCount}${max?'/'+max:''}`;if(inc&&loopCompletedCount%every===0){adjustScoreTempo(inc);setMetroBpm(getTempo())}if(max&&loopCompletedCount>=max){fullStop();practiceStatus.textContent=`Completado · ${loopCompletedCount} loops`;return false}return true}

    function updateLoopUI() {
      scoreLoopStartBtn.classList.toggle('marked', loopStart !== null);
      scoreLoopEndBtn.classList.toggle('marked', loopEnd !== null);
      scoreLoopBtn.disabled = !(loopStart !== null && loopEnd !== null);
      scoreLoopBtn.classList.toggle('active', loopEnabled);
    }

    function markLoopStart() {
      if (!osmd || !osmd.cursor || currentStepIndex < 0) {
        alert('Primero posiciónate sobre una nota: usa Play, avanza/retrocede, o haz clic sobre una nota de la partitura.');
        return;
      }
      loopStart = currentStepIndex;
      if (loopEnd !== null && loopEnd < loopStart) loopEnd = null;
      updateLoopUI();
    }

    function markLoopEnd() {
      if (!osmd || !osmd.cursor || currentStepIndex < 0) {
        alert('Primero posiciónate sobre una nota: usa Play, avanza/retrocede, o haz clic sobre una nota de la partitura.');
        return;
      }
      if (loopStart === null) {
        loopStart = currentStepIndex;
      } else if (currentStepIndex < loopStart) {
        loopEnd = loopStart;
        loopStart = currentStepIndex;
      } else {
        loopEnd = currentStepIndex;
      }
      updateLoopUI();
    }

    function clearLoopMarks() {
      loopStart = null;
      loopEnd = null;
      loopEnabled = false;
      updateLoopUI();
    }

    function toggleLoop() {
      if (loopStart === null || loopEnd === null) return;
      if (loopEnabled) {
        loopEnabled = false;
        stopPlaybackAudio();
        updateLoopUI();
      } else {
        loopEnabled = true;
        loopCompletedCount = 0;
        stopPlaybackAudio();
        jumpToStep(loopStart);
        updateLoopUI();
        runCountIn(()=>{scorePlaying=true;syncScoreMetronome(true);scheduleScoreStep();});
      }
    }

    function stopPlaybackAudio() {
      scorePlaying = false;
      clearCountIn();
      syncScoreMetronome(false);
      if (scorePlaybackTimer) { clearTimeout(scorePlaybackTimer); scorePlaybackTimer = null; }
      scoreActiveHandles.forEach(h => { try { h.stop(); } catch(e) {} });
      scoreActiveHandles = [];
    }
    function pausePlayback() { stopPlaybackAudio(); }
    function fullStop() {
      stopPlaybackAudio();
      loopEnabled = false;
      if (osmd && osmd.cursor) {
        try { osmd.cursor.reset(); osmd.cursor.hide(); } catch(e) {}
      }
      currentStepIndex = -1;
      try { osmdContainer.scrollLeft = 0; osmdContainer.scrollTop = 0; } catch(e) {}
      updateLoopUI();
      clearScoreHighlight();
    }

    // La transposición escrita se obtiene del instrumento activo
    // de su altura sonora. MusicXML usa la altura escrita; el diapasón/audio usan la sonora.
    const SCORE_OCTAVE_OFFSET = { requinto: -12, guitar: -12, ukulele: -12 };

    function getCurrentStepData(tempo){
      let stepSeconds=null; const midis=[]; const octaveOffset=-(Number(activeInstrument?.().writtenTranspose||0));
      try{
        const entries=osmd.cursor.Iterator.CurrentVoiceEntries||[];
        entries.forEach(ve=>(ve.Notes||[]).forEach(note=>{
          if(!note||(note.isRest&&note.isRest())||note.Pitch==null)return;
          const octaveOffset=-(Number(activeInstrument?.().writtenTranspose||0));
          const midi=note.Pitch.halfTone+12+octaveOffset;
          const lengthFraction=(note.Length&&typeof note.Length.RealValue==='number')?note.Length.RealValue:.25;
          const durSeconds=lengthFraction*4*(60/tempo);
          if(stepSeconds===null||durSeconds<stepSeconds)stepSeconds=durSeconds;
          midis.push(midi);
        }));
      }catch(err){console.warn('Error leyendo notas de la partitura:',err)}
      if(stepSeconds===null)stepSeconds=.5*(60/tempo);
      return {midis,stepSeconds};
    }
    function triggerCurrentStepNotes(tempo, hold) {
      const data=getCurrentStepData(tempo);
      data.midis.forEach(midi=>{const playDur=hold?Math.max(data.stepSeconds,1):data.stepSeconds;const handle=playNote(midi,playDur);if(handle)scoreActiveHandles.push(handle)});
      setScoreHighlight(data.midis);
      return data.stepSeconds;
    }

    function scheduleScoreStep() {
      if (!scorePlaying || !osmd || !osmd.cursor || !osmd.cursor.Iterator) return;
      if (osmd.cursor.Iterator.EndReached) {
        if (loopEnabled && loopStart !== null) {
          if(!onLoopCompleted()) return;
          jumpToStep(loopStart);
          scorePlaybackTimer = setTimeout(scheduleScoreStep, 0);
          return;
        }
        fullStop();
        return;
      }
      const durationSeconds = triggerCurrentStepNotes(getTempo());
      if (loopEnabled && loopEnd !== null && currentStepIndex >= loopEnd) {
        scorePlaybackTimer = setTimeout(() => {
          if (!scorePlaying) return;
          if(!onLoopCompleted()) return;
          jumpToStep(loopStart);
          scheduleScoreStep();
        }, durationSeconds * 1000);
        return;
      }
      osmd.cursor.next();
      currentStepIndex++;
      scorePlaybackTimer = setTimeout(scheduleScoreStep, durationSeconds * 1000);
    }

    function playFromCurrentPosition() {
      if (!osmd || !osmd.cursor) return;
      stopPlaybackAudio();
      if (currentStepIndex === -1) osmd.cursor.reset();
      osmd.cursor.show();
      loopCompletedCount=0;
      runCountIn(()=>{scorePlaying=true;syncScoreMetronome(true);scheduleScoreStep();});
    }

    function stepForward() {
      if (!osmd || !osmd.cursor || !osmd.cursor.Iterator) return;
      stopPlaybackAudio();
      if (currentStepIndex === -1) osmd.cursor.reset();
      else {
        if (osmd.cursor.Iterator.EndReached) return;
        osmd.cursor.next();
      }
      currentStepIndex++;
      osmd.cursor.show();
      triggerCurrentStepNotes(getTempo(), true);
    }

    function stepBackward() {
      if (!osmd || !osmd.cursor) return;
      stopPlaybackAudio();
      const target = currentStepIndex - 1;
      if (target < 0) { fullStop(); return; }
      try {
        osmd.cursor.reset();
        let guard = 0;
        while (guard < target && osmd.cursor.Iterator && !osmd.cursor.Iterator.EndReached) {
          osmd.cursor.next();
          guard++;
        }
        currentStepIndex = target;
        osmd.cursor.show();
        triggerCurrentStepNotes(getTempo(), true);
      } catch(err) { console.warn('Error al retroceder:', err); }
    }

    function jumpToStep(targetIndex) {
      try {
        osmd.cursor.reset();
        let guard = 0;
        while (guard < targetIndex && osmd.cursor.Iterator && !osmd.cursor.Iterator.EndReached) {
          osmd.cursor.next();
          guard++;
        }
        currentStepIndex = targetIndex;
        osmd.cursor.show();
      } catch(err) { console.warn('Error al saltar de posición:', err); }
    }

    function seekToStep(targetIndex) {
      if (!osmd || !osmd.cursor) return;
      stopPlaybackAudio();
      jumpToStep(targetIndex);
      triggerCurrentStepNotes(getTempo(), true);
    }

    scorePlayBtn.addEventListener('click', playFromCurrentPosition);
    scorePauseBtn.addEventListener('click', pausePlayback);
    scoreStopBtn.addEventListener('click', fullStop);
    scoreNextBtn.addEventListener('click', stepForward);
    scorePrevBtn.addEventListener('click', stepBackward);
    scoreLoopStartBtn.addEventListener('click', markLoopStart);
    scoreLoopEndBtn.addEventListener('click', markLoopEnd);
    scoreLoopBtn.addEventListener('click', toggleLoop);
    scoreLoopClearBtn.addEventListener('click', clearLoopMarks);
    ;[scoreCountIn,scoreMetroSync,scoreLoopRepeats,scoreLoopBpmAdd,scoreLoopBpmEvery].forEach(e=>e.addEventListener('change',saveSettings));
    ;[scoreFingeringView,scoreFingeringStrategy,scoreTechniqueMode].forEach(e=>e&&e.addEventListener('change',()=>{saveSettings(); rebuildPhrasePlan(); if(scoreHighlightMidis.size){updateFingeringForMidis([...scoreHighlightMidis],{remember:false});draw();}}));
    scorePhraseLength?.addEventListener('change',()=>{saveSettings();rebuildPhrasePlan();if(scoreHighlightMidis.size){updateFingeringForMidis([...scoreHighlightMidis],{remember:false});draw();}});
    scoreAnalyzePhraseBtn?.addEventListener('click',()=>{rebuildPhrasePlan();if(scoreHighlightMidis.size){updateFingeringForMidis([...scoreHighlightMidis],{remember:false});draw();}practiceStatus.textContent=phrasePlanReady?'Digitación de frase recalculada':'No hay MusicXML para analizar';setTimeout(()=>{if(!tutorMode)practiceStatus.textContent='';},1800);});
    scoreTutorBtn?.addEventListener('click',()=>setTutorMode(!tutorMode));

    // Atajo de barra espaciadora para Play/Pausa, y flechas para avanzar/retroceder nota
    window.addEventListener('keydown', function(e) {
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (!osmd || !osmd.cursor) return;
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        if (scorePlaying) pausePlayback();
        else playFromCurrentPosition();
      } else if (e.code === 'ArrowRight' || e.key === 'ArrowRight') {
        e.preventDefault();
        stepForward();
      } else if (e.code === 'ArrowLeft' || e.key === 'ArrowLeft') {
        e.preventDefault();
        stepBackward();
      }
    });

    function zoomScore(delta) {
      if (!osmd) return;
      try {
        const current = (typeof osmd.Zoom === 'number') ? osmd.Zoom : 1;
        const newZoom = Math.min(3, Math.max(0.4, +(current + delta).toFixed(2)));
        osmd.Zoom = newZoom;
        osmd.render();
        requestAnimationFrame(() => { try { buildScoreStepMap(); } catch(e) {} });
      } catch(err) { console.warn('Error al cambiar zoom:', err); }
    }
    scoreZoomInBtn.addEventListener('click', () => zoomScore(0.1));
    scoreZoomOutBtn.addEventListener('click', () => zoomScore(-0.1));

    let scoreSteps = [];
    function buildScoreStepMap() {
      scoreSteps = [];
      if (!osmd || !osmd.cursor || !osmd.cursor.Iterator) return;
      try {
        osmd.cursor.reset();
        osmd.cursor.show();
        const containerRect = osmdContainer.getBoundingClientRect();
        let guard = 0;
        while (!osmd.cursor.Iterator.EndReached && guard < 4000) {
          osmd.cursor.update();
          const cursorEl = osmd.cursor.cursorElement;
          if (cursorEl) {
            const r = cursorEl.getBoundingClientRect();
            if (r.width > 0 && r.height > 0) {
              const stepData=getCurrentStepData(getTempo());
              scoreSteps.push({
                index: scoreSteps.length,
                left: r.left - containerRect.left + osmdContainer.scrollLeft,
                top: r.top - containerRect.top + osmdContainer.scrollTop,
                width: Math.max(r.width, 10),
                height: Math.max(r.height, 20),
                midis:[...stepData.midis],
                stepSeconds:stepData.stepSeconds
              });
            }
          }
          osmd.cursor.next();
          guard++;
        }
      } catch(err) { console.warn('No se pudo generar mapa de clics:', err); scoreSteps = []; }
      try { osmd.cursor.reset(); osmd.cursor.hide(); } catch(e) {}
      currentStepIndex = -1;
      attachMusicXmlHintsToSteps();
      renderClickOverlay();
      rebuildPhrasePlan();
    }

    function renderClickOverlay() {
      const old = document.getElementById('scoreClickOverlay');
      if (old) old.remove();
      if (!scoreSteps.length) return;
      const overlay = document.createElement('div');
      overlay.id = 'scoreClickOverlay';
      overlay.style.position = 'absolute';
      overlay.style.left = '0';
      overlay.style.top = '0';
      overlay.style.width = osmdContainer.scrollWidth + 'px';
      overlay.style.height = osmdContainer.scrollHeight + 'px';
      overlay.style.pointerEvents = 'none';
      scoreSteps.forEach(step => {
        const hit = document.createElement('div');
        hit.className = 'score-click-hit';
        hit.style.left = (step.left - 4) + 'px';
        hit.style.top = (step.top - 4) + 'px';
        hit.style.width = (step.width + 8) + 'px';
        hit.style.height = (step.height + 8) + 'px';
        hit.style.pointerEvents = 'auto';
        hit.title = 'Comenzar aquí';
        hit.addEventListener('click', () => seekToStep(step.index));
        overlay.appendChild(hit);
      });
      osmdContainer.appendChild(overlay);
    }

    function resetScoreView() {
      fullStop();
      loopStart = null;
      loopEnd = null;
      updateLoopUI();
      pdfViewer.src = '';
      pdfViewer.style.display = 'none';
      webViewer.src = '';
      webViewer.classList.remove('visible');
      webClearBtn.classList.remove('visible');
      webLoadNote.textContent = '';
      webLoadNote.style.display = 'none';
      osmdContainer.classList.remove('visible');
      osmdContainer.innerHTML = '';
      osmd = null;
      imageContainer.style.display = 'none';
      if (currentImageUrl) { URL.revokeObjectURL(currentImageUrl); currentImageUrl = null; }
      imageViewer.src = '';
      resetImageTransform();
      scoreSteps = [];
      scoreXmlHints=[]; loadedMusicXmlText='';
      phrasePlan=[]; phrasePlanReady=false;
      scorePlayControls.classList.remove('visible');
      scoreStatus.textContent = '';
      pdfClearBtn.classList.remove('visible');
      drawBaseStaff();
      renderStaffNotes([]);
    }

    pdfUpload.addEventListener('change', async function(e) {
      const file = this.files[0];
      if (!file) return;
      const name = file.name.toLowerCase();
      const isPdf = name.endsWith('.pdf') || file.type === 'application/pdf';
      const isMusicXML = name.endsWith('.xml') || name.endsWith('.musicxml') || name.endsWith('.mxl');
      const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name);

      resetScoreView();
      if (isPdf) {
        if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
        currentPdfUrl = URL.createObjectURL(file);
        pdfViewer.src = currentPdfUrl;
        pdfViewer.style.display = 'block';
        pdfClearBtn.classList.add('visible');
        scoreStatus.textContent = 'PDF cargado';
        return;
      }
      if (isMusicXML) {
        pdfViewer.style.display = 'none';
        scoreStatus.textContent = 'Cargando partitura…';
        try {
          const engine = ensureOSMD();
          const ext = name.split('.').pop();
          const content = (ext === 'mxl') ? await file.arrayBuffer() : await file.text();
          loadedMusicXmlText = typeof content==='string'?content:'';
          scoreXmlHints = loadedMusicXmlText?parseMusicXmlHints(loadedMusicXmlText):[];
          await engine.load(content);
          osmdContainer.classList.add('visible');
          engine.render();
          requestAnimationFrame(() => {
            try { engine.render(); buildScoreStepMap(); } catch(e) { console.warn('Error final render:', e); }
          });
          scorePlayControls.classList.add('visible');
          pdfClearBtn.classList.add('visible');
          scoreStatus.textContent = '';
          if(techniqueDetail)techniqueDetail.textContent=ext==='mxl'?'Técnica: análisis geométrico activo · para articulaciones explícitas usa .musicxml/.xml':'Técnica: MusicXML leído · articulaciones y digitaciones técnicas activas';
          const bpm = engine.Sheet && engine.Sheet.DefaultStartTempoInBpm;
          if (bpm && bpm > 0) scoreTempoInput.value = Math.round(bpm);
        } catch(err) {
          console.error('Error cargando MusicXML:', err);
          const detail = (err && err.message) ? err.message : String(err);
          scoreStatus.textContent = 'No se pudo leer el archivo: ' + detail;
          osmdContainer.classList.remove('visible');
          scorePlayControls.classList.remove('visible');
        }
        return;
      }
      if (isImage) {
        const url = URL.createObjectURL(file);
        currentImageUrl = url;
        imageViewer.src = url;
        imageContainer.style.display = 'block';
        resetImageTransform();
        pdfClearBtn.classList.add('visible');
        scoreStatus.textContent = 'Imagen cargada';
        pdfViewer.style.display = 'none';
        webViewer.classList.remove('visible');
        osmdContainer.classList.remove('visible');
        scorePlayControls.classList.remove('visible');
        return;
      }
      alert('Formato no soportado. Usa PDF, MusicXML (.xml / .musicxml), .mxl o imagen (PNG, JPG, GIF, WEBP, BMP, SVG).');
      this.value = '';
    });

    pdfClearBtn.addEventListener('click', function() {
      resetScoreView();
      pdfUpload.value = '';
      if (currentPdfUrl) { URL.revokeObjectURL(currentPdfUrl); currentPdfUrl = null; }
      pdfClearBtn.classList.remove('visible');
    });

    // ---------- CARGA DE PÁGINA WEB ----------
    function normalizeWebUrl(raw) {
      let url = (raw || '').trim();
      if (!url) return null;
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      try { return new URL(url).href; } catch(e) { return null; }
    }

    function toEmbeddableUrl(url) {
      let u; try { u = new URL(url); } catch(e) { return url; }
      const host = u.hostname.replace(/^www\./, '').replace(/^m\./, '');
      let videoId = null;
      if (host === 'youtube.com' || host === 'music.youtube.com') {
        if (u.pathname === '/watch') videoId = u.searchParams.get('v');
        else if (u.pathname.startsWith('/shorts/')) videoId = u.pathname.split('/')[2];
        else if (u.pathname.startsWith('/embed/')) return url;
      } else if (host === 'youtu.be') {
        videoId = u.pathname.slice(1);
      }
      if (videoId) {
        const start = u.searchParams.get('t') || u.searchParams.get('start');
        let embedUrl = `https://www.youtube.com/embed/${videoId}`;
        if (start) embedUrl += `?start=${parseInt(start, 10) || 0}`;
        return embedUrl;
      }
      return url;
    }

    function toWatchUrlIfEmbed(url) {
      try {
        const u = new URL(url);
        const host = u.hostname.replace(/^www\./, '');
        if (host === 'youtube.com' && u.pathname.startsWith('/embed/')) {
          const id = u.pathname.split('/')[2];
          if (id) return `https://www.youtube.com/watch?v=${id}`;
        }
      } catch(e) {}
      return url;
    }

    function loadWebPage() {
      const url = normalizeWebUrl(webUrlInput.value);
      if (!url) { alert('Introduce un enlace válido (ej. https://ejemplo.com).'); return; }
      resetScoreView();
      pdfUpload.value = '';
      if (currentPdfUrl) { URL.revokeObjectURL(currentPdfUrl); currentPdfUrl = null; }
      const finalUrl = toEmbeddableUrl(url);
      webViewer.src = finalUrl;
      webUrlInput.value = finalUrl;
      webViewer.classList.add('visible');
      webClearBtn.classList.add('visible');
      scoreStatus.textContent = 'Página cargada';
      const isYouTubeEmbed = /^https:\/\/www\.youtube\.com\/embed\//.test(finalUrl);
      if (isYouTubeEmbed && location.protocol === 'file:') {
        webLoadNote.textContent = '⚠ YouTube suele bloquear la reproducción embebida en archivos locales (file://). Si no se ve, usa el botón ↗ para abrirlo en otra pestaña.';
        webLoadNote.style.display = 'block';
      } else {
        webLoadNote.textContent = '';
        webLoadNote.style.display = 'none';
      }
    }

    webLoadBtn.addEventListener('click', loadWebPage);
    webUrlInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); loadWebPage(); }
    });
    webOpenNewTabBtn.addEventListener('click', function() {
      const url = normalizeWebUrl(webUrlInput.value);
      if (!url) { alert('Introduce un enlace válido.'); return; }
      window.open(toWatchUrlIfEmbed(url), '_blank', 'noopener');
    });
    webClearBtn.addEventListener('click', function() {
      webViewer.src = '';
      webViewer.classList.remove('visible');
      webClearBtn.classList.remove('visible');
      webLoadNote.textContent = '';
      webLoadNote.style.display = 'none';
      pdfViewer.style.display = 'block';
      scoreStatus.textContent = '';
      drawBaseStaff();
      renderStaffNotes([]);
    });

    // Inicialización
    window.addEventListener('load', function() {
      const s=readSettings();
      instrumentSel.value = (s.instrument&&INSTRUMENTS[s.instrument])?s.instrument:'tiple';
      updateTuningOptions(s.tuning||'');
      if(Number.isFinite(+s.capo))capoSel.value=String(Math.max(0,Math.min(12,+s.capo)));
      if(['right','left'].includes(s.orientation))orientationSel.value=s.orientation;
      if(['notes','intervals','degrees'].includes(s.labelMode))labelModeSel.value=s.labelMode;
      if(s.pattern&&[...patternSel.options].some(o=>o.value===s.pattern))patternSel.value=s.pattern;
      if(['all','low','mid','high'].includes(s.voicingRange))voicingRangeSel.value=s.voicingRange;
      updateSoundTypeOptions(instrumentSel.value);
      if(s.soundType&&[...soundTypeSel.options].some(o=>o.value===s.soundType)){soundTypeSel.value=s.soundType;loadCurrentSound()}
      if(typeof s.volume==='number')volumeSlider.value=s.volume;
      if(typeof s.frets==='number')visibleFrets=Math.max(4,Math.min(maxVisibleFrets(),s.frets));
      if(s.root&&[...rootSel.options].some(o=>o.value===s.root))rootSel.value=s.root;
      populateChordOptions(s.chord||'');
      if(s.chord&&[...chordTypeSel.options].some(o=>o.value===s.chord))chordTypeSel.value=s.chord;
      if(s.scale&&SCALE[s.scale])scaleSel.value=s.scale;
      if(s.metroBpm)setMetroBpm(s.metroBpm); if(s.metroMeter)metroMeter.value=s.metroMeter;if(s.metroPulse)metroPulse.value=s.metroPulse;
      if(s.countIn!=null)scoreCountIn.value=String(s.countIn);scoreMetroSync.checked=!!s.scoreClick;if(s.loopRepeats!=null)scoreLoopRepeats.value=s.loopRepeats;if(s.loopBpmAdd!=null)scoreLoopBpmAdd.value=s.loopBpmAdd;if(s.loopBpmEvery!=null)scoreLoopBpmEvery.value=s.loopBpmEvery;
      if(scoreFingeringView&&s.fingeringView)scoreFingeringView.value=s.fingeringView;
      if(scoreFingeringStrategy&&s.fingeringStrategy)scoreFingeringStrategy.value=s.fingeringStrategy; else if(scoreFingeringStrategy)scoreFingeringStrategy.value='phrase';
      if(scorePhraseLength&&s.phraseLength)scorePhraseLength.value=String(s.phraseLength);
      if(scoreTechniqueMode&&s.techniqueMode)scoreTechniqueMode.value=s.techniqueMode;
      refresh();
      drawBaseStaff();
      renderStaffNotes([]);
    });

    const footerYearEl = document.getElementById('footerYear');
    if (footerYearEl) footerYearEl.textContent = new Date().getFullYear();
// Fase 3 · recalcular digitación al cambiar instrumento/afinación/capo/orientación.
[instrumentSel,tuningSel,capoSel,orientationSel,posSel,patternSel].forEach(el=>el&&el.addEventListener('change',()=>{previousRecommendedCells=[];if(scoreHighlightMidis.size){updateFingeringForMidis([...scoreHighlightMidis],{remember:false});draw();}}));


// Fase 4 · si cambia el instrumento o su geometría, reconstruir el plan completo de frase.
[instrumentSel,tuningSel,capoSel,orientationSel,posSel,patternSel].forEach(el=>el&&el.addEventListener('change',()=>{
  phrasePlanReady=false;
  if(scoreSteps.length){
    // Las notas del MusicXML no cambian, pero sí sus posiciones disponibles.
    rebuildPhrasePlan();
    if(scoreHighlightMidis.size){updateFingeringForMidis([...scoreHighlightMidis],{remember:false});draw();}
  }
}));
