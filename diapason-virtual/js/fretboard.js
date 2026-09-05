    // ======================================================================
    // 1. CÓDIGO COMPLETO DEL REQUINTO VIRTUAL (diapasón, escalas, acordes)
    // ======================================================================
    const NOTE = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

    const INSTRUMENTS = {
      guitar: {
        label: "Guitarra",
        description: "6 cuerdas (E-A-D-G-B-E)",
        pitches: [64, 59, 55, 50, 45, 40],
        nutFret: 0
      },
      ukulele: {
        label: "Ukelele",
        description: "4 cuerdas (G C E A)",
        pitches: [69, 64, 60, 67],
        nutFret: 0
      },
      requinto: {
        label: "Requinto",
        description: "6 cuerdas (A-D-G-C-E-A)",
        pitches: [69, 64, 60, 55, 50, 45],
        nutFret: 0
      }
    };

    const TUNINGS = {
      guitar: [
        {value:'standard', label:'Estándar · E A D G B E', pitches:[64,59,55,50,45,40]},
        {value:'drop_d', label:'Drop D · D A D G B E', pitches:[64,59,55,50,45,38]},
        {value:'dadgad', label:'DADGAD · D A D G A D', pitches:[62,57,55,50,45,38]},
        {value:'open_g', label:'Open G · D G D G B D', pitches:[62,59,55,50,43,38]},
        {value:'open_d', label:'Open D · D A D F# A D', pitches:[62,57,54,50,45,38]}
      ],
      ukulele: [
        {value:'high_g', label:'High G · G C E A', pitches:[69,64,60,67]},
        {value:'low_g', label:'Low G · G C E A', pitches:[69,64,60,55]}
      ],
      requinto: [
        {value:'standard', label:'Estándar · A D G C E A', pitches:[69,64,60,55,50,45]}
      ]
    };

    const SOUND_OPTIONS = {
      requinto: [
        { value: 'acoustic_guitar_nylon', label: 'Requinto (nylon)' },
        { value: 'acoustic_guitar_steel', label: 'Requinto (metal)' }
      ],
      guitar: [
        { value: 'acoustic_guitar_nylon', label: 'Acústica (nylon)' },
        { value: 'acoustic_guitar_steel', label: 'Acústica (metal)' },
        { value: 'electric_guitar_clean', label: 'Eléctrica (limpia)' },
        { value: 'electric_guitar_jazz', label: 'Eléctrica (jazz)' },
        { value: 'electric_guitar_muted', label: 'Eléctrica (muted)' }
      ],
      ukulele: [
        { value: 'acoustic_guitar_nylon', label: 'Ukelele (nylon)' }
      ]
    };

    const TOTAL_FRETS = 22;
    const BASE_BOARD_H = 160;
    const BOARD_PAD_Y = 22;
    const BASS4_STRING_GAP = (BASE_BOARD_H - (BOARD_PAD_Y * 2)) / 3;
    const STRING_LABEL_W = 58;
    const OPEN_NOTE_OFFSET = 24;
    let RAD = 14;
    let visibleFrets = 13;

    const SCALE = {
      mayor:[2,2,1,2,2,2,1], mayor_armonica:[2,2,1,2,1,3,1], menor_melodica:[2,1,2,2,2,2,1], menor_armonica:[2,1,2,2,1,3,1],
      jonico:[2,2,1,2,2,2,1], dorico:[2,1,2,2,2,1,2], frigio:[1,2,2,2,1,2,2], lidio:[2,2,2,1,2,2,1], mixolidio:[2,2,1,2,2,1,2], eolico:[2,1,2,2,1,2,2], locrio:[1,2,2,1,2,2,2],
      jonico_b6:[2,2,1,2,1,3,1], locrio_s2s6:[2,1,2,1,3,1,2], mixolidio_b2_s2_no4:[1,2,1,3,1,2,2], dorico_s4_s7:[2,1,3,1,2,2,1], mixolidio_b2:[1,3,1,2,2,1,2], lidio_s2_s5:[3,1,2,2,1,2,1],
      locrio_b7:[1,2,2,1,2,1,3], eolico_s7:[2,1,2,2,1,3,1], locrio_s6:[1,2,2,1,3,1,2], jonico_aumentado:[2,2,1,3,1,2,1], dorico_s4:[2,1,3,1,2,1,2], mixolidio_b2b6:[1,3,1,2,1,2,2], lidio_s2:[3,1,2,1,2,2,1], locrio_b4b7:[1,2,1,2,2,1,3], dorico_s7:[2,1,2,2,2,2,1], dorico_b2:[1,2,2,2,2,1,2], lidio_aumentado:[2,2,2,2,1,2,1], lidio_dominante:[2,2,2,1,2,1,2], mixolidio_b6:[2,2,1,2,1,2,2], locrio_s2:[2,1,2,1,2,2,2], alterado:[1,2,1,2,2,2,2],
      pentatonica_mayor:[2,2,3,2,3], pentatonica_dominante:[2,2,3,3,2], blues:[3,2,1,1,3,2], por_tonos:[2,2,2,2,2,2],
      disminuida_HW:[1,2,1,2,1,2,1,2], disminuida_WH:[2,1,2,1,2,1,2,1]
    };
    const SPECIAL = ["pentatonica_mayor","blues","por_tonos"];

    const CHORD_TYPES = {
      mayor:{label:"Mayor",menuLabel:"mayor",family:"triad",intervals:[0,4,7],suffix:"",quality:"Tríada mayor (T-3-5)"},
      menor:{label:"Menor",menuLabel:"menor",family:"triad",intervals:[0,3,7],suffix:"m",quality:"Tríada menor (T-b3-5)"},
      aumentado:{label:"Aumentado",menuLabel:"aumentado",family:"triad",intervals:[0,4,8],suffix:"+",quality:"Tríada aumentada (T-3-#5)"},
      disminuido:{label:"Disminuido",menuLabel:"disminuido",family:"triad",intervals:[0,3,6],suffix:"°",quality:"Tríada disminuida (T-b3-b5)"},
      maj7:{label:"7M — Séptima mayor",menuLabel:"Maj7",family:"tetrad",intervals:[0,4,7,11],suffix:"7M",quality:"Cuatríada con 7ª mayor (T-3-5-7)"},
      m7:{label:"m7 — Menor con séptima",menuLabel:"m7",family:"tetrad",intervals:[0,3,7,10],suffix:"m7",quality:"Cuatríada menor (T-b3-5-b7)"},
      dom7:{label:"7 — Dominante",menuLabel:"7",family:"tetrad",intervals:[0,4,7,10],suffix:"7",quality:"Cuatríada dominante (T-3-5-b7)"},
      m7b5:{label:"m7(b5) — Semidisminuido",menuLabel:"m7(b5)",family:"tetrad",intervals:[0,3,6,10],suffix:"m7(b5)",quality:"Cuatríada semidisminuida (T-b3-b5-b7)"},
      sus4_7:{label:"7sus4",menuLabel:"7sus4",family:"tetrad",intervals:[0,5,7,10],suffix:"7sus4",quality:"Cuatríada sus4 (T-4-5-b7)"},
      sharp5_7:{label:"7(#5)",menuLabel:"7(#5)",family:"tetrad",intervals:[0,4,8,10],suffix:"7(#5)",quality:"Cuatríada con 5ª aumentada (T-3-#5-b7)"}
    };

    const GUIDE_DOTS = [3,5,7,9,12,15,17,19,22];
    const INVERSION_LABELS = ["Fundamental","1ª inversión","2ª inversión","3ª inversión"];

    const CHORD_VOICINGS = {
      triad_s6:{label:"6",group:"Tríadas",family:"triad",templates:[
        {strings:[5,4,3],slots:["root","third","fifth"],frets:[8,7,5]},
        {strings:[5,4,3],slots:["third","fifth","root"],frets:[12,10,10]},
        {strings:[5,4,3],slots:["fifth","root","third"],frets:[3,3,2]}
      ]},
      triad_s5:{label:"5",group:"Tríadas",family:"triad",templates:[
        {strings:[4,3,2],slots:["root","third","fifth"],frets:[3,2,0]},
        {strings:[4,3,2],slots:["third","fifth","root"],frets:[7,5,5]},
        {strings:[4,3,2],slots:["fifth","root","third"],frets:[10,10,9]}
      ]},
      triad_s4:{label:"4",group:"Tríadas",family:"triad",templates:[
        {strings:[3,2,1],slots:["root","third","fifth"],frets:[10,9,8]},
        {strings:[3,2,1],slots:["third","fifth","root"],frets:[2,0,1]},
        {strings:[3,2,1],slots:["fifth","root","third"],frets:[5,5,3]}
      ]},
      triad_s3:{label:"3",group:"Tríadas",family:"triad",templates:[
        {strings:[2,1,0],slots:["root","third","fifth"],frets:[5,5,3]},
        {strings:[2,1,0],slots:["third","fifth","root"],frets:[9,8,8]},
        {strings:[2,1,0],slots:["fifth","root","third"],frets:[0,1,0]}
      ]},
      triad_all:{label:"todas",group:"Tríadas",family:"triad",include:["triad_s6","triad_s5","triad_s4","triad_s3"]},
      drop2_s5:{label:"5",group:"Drop 2",family:"tetrad",templates:[
        {strings:[4,3,2,1],slots:["root","fifth","seventh","third"],frets:[3,5,4,5]},
        {strings:[4,3,2,1],slots:["third","seventh","root","fifth"],frets:[7,9,5,8]},
        {strings:[4,3,2,1],slots:["fifth","root","third","seventh"],frets:[10,10,9,12]},
        {strings:[4,3,2,1],slots:["seventh","third","fifth","root"],frets:[14,14,12,13]}
      ]},
      drop2_s4:{label:"4",group:"Drop 2",family:"tetrad",templates:[
        {strings:[3,2,1,0],slots:["root","fifth","seventh","third"],frets:[10,12,12,12]},
        {strings:[3,2,1,0],slots:["third","seventh","root","fifth"],frets:[2,4,1,3]},
        {strings:[3,2,1,0],slots:["fifth","root","third","seventh"],frets:[5,5,5,7]},
        {strings:[3,2,1,0],slots:["seventh","third","fifth","root"],frets:[9,9,8,8]}
      ]},
      drop2_all:{label:"todas",group:"Drop 2",family:"tetrad",include:["drop2_s5","drop2_s4"]},
      drop3_s6:{label:"6",group:"Drop 3",family:"tetrad",templates:[
        {strings:[5,3,2,1],slots:["root","seventh","third","fifth"],frets:[8,9,9,8]},
        {strings:[5,3,2,1],slots:["third","root","fifth","seventh"],frets:[12,10,12,12]},
        {strings:[5,3,2,1],slots:["fifth","third","seventh","root"],frets:[3,2,4,1]},
        {strings:[5,3,2,1],slots:["seventh","fifth","root","third"],frets:[7,5,5,5]}
      ]}
    };

    const TONE_COLORS = {root:"#0f0", structural:"#08f", tension:"#f80", unavailable:"#f00"};

    // Utilidades
    const roman = n => ({1:"I",2:"II",3:"III",4:"IV",5:"V",6:"VI",7:"VII",8:"VIII",9:"IX",10:"X",11:"XI",12:"XII",13:"XIII",14:"XIV",15:"XV",16:"XVI",17:"XVII",18:"XVIII",19:"XIX",20:"XX",21:"XXI",22:"XXII"}[n] || n);
    const activeInstrument = () => INSTRUMENTS[instrumentSel.value] || INSTRUMENTS.requinto;
    const activeTuning = () => {
      const list=TUNINGS[instrumentSel.value]||[];
      return list.find(t=>t.value===tuningSel?.value)||list[0]||{pitches:activeInstrument().pitches};
    };
    const capoSemitones = () => Math.max(0,Math.min(12,+(capoSel?.value||0)));
    const activePitches = () => activeTuning().pitches.map(n=>n+capoSemitones());
    const physicalFret = displayFret => displayFret + activeInstrument().nutFret;
    const isLeftHanded = () => orientationSel?.value==='left';
    const maxVisibleFrets = () => Math.max(4, TOTAL_FRETS - activeInstrument().nutFret);
    const boardHeight = () => Math.round((BOARD_PAD_Y * 2) + (BASS4_STRING_GAP * (activePitches().length - 1)));
    const fretW = () => BASE_BOARD_H / 6 * 2.55;
    const pcPattern = (root, intv) => {
      const a = [root];
      for (let i = 0; a.length < 12; i++) {
        a.push((a.at(-1) + intv[i % intv.length]) % 12);
      }
      return a;
    };
    const scalePitchClasses = (rootName, scaleKey) => {
      const intervals = SCALE[scaleKey];
      const rootPc = NOTE.indexOf(rootName);
      if (!intervals || rootPc < 0) return [];
      const pcs = [rootPc];
      let pc = rootPc;
      // Cada arreglo de SCALE describe una vuelta completa de la escala.
      // La última distancia regresa a la tónica, así que no duplicamos la octava.
      for (let i = 0; i < intervals.length - 1; i++) {
        pc = (pc + intervals[i]) % 12;
        pcs.push(pc);
      }
      return pcs;
    };
    const toneRole = (pc, r, pcs, spec) => {
      const index = pcs.indexOf(pc);
      if (pc === r) return "root";
      if (spec) return index % 3 === 0 ? "structural" : "tension";
      if ([2,4,6].includes(index)) return "structural";
      if ([1,3,5].includes(index)) return pcs.includes((pc + 11) % 12) ? "unavailable" : "tension";
      return "unavailable";
    };

    // DOM refs
    const $ = id => document.getElementById(id);
    const instrumentSel = $("instrument");
    const rootSel = $("root");
    const chordTypeSel = $("chordType");
    const scaleSel = $("scale");
    const posSel = $("pos");
    const minus = $("minus");
    const plus = $("plus");
    const fretVal = $("fretVal");
    const fretLabel = $("fretLabel");
    const cvs = $("board");
    const ctx = cvs.getContext("2d");
    const legendButtons = [...document.querySelectorAll("[data-tone-filter]")];
    const clearSelectionBtn = $("clearSelectionBtn");
    const clearAllBtn = $("clearAllBtn");
    const chordNameBox = $("chordNameBox");
    const chordSymbolEl = $("chordSymbol");
    const chordQualityEl = $("chordQualityLabel");
    const muteBtn = $("muteBtn");
    const volumeSlider = $("volume");
    const soundTypeSel = $("soundType");
    const soundTypeLabel = $("soundTypeLabel");
    const soundSourceIndicator = $("soundSourceIndicator");
    const tuningSel = $("tuning");
    const capoSel = $("capo");
    const orientationSel = $("orientation");
    const labelModeSel = $("labelMode");
    const patternSel = $("pattern");
    const voicingRangeSel = $("voicingRange");
    const scoreFingeringView = $("scoreFingeringView");
    const scoreFingeringStrategy = $("scoreFingeringStrategy");
    const scoreTutorBtn = $("scoreTutorBtn");
    const scorePhraseLength = $("scorePhraseLength");
    const scoreAnalyzePhraseBtn = $("scoreAnalyzePhraseBtn");
    const scoreTechniqueMode = $("scoreTechniqueMode");
    const fingeringCurrent = $("fingeringCurrent");
    const fingeringDetail = $("fingeringDetail");
    const phrasePlanDetail = $("phrasePlanDetail");
    const techniqueDetail = $("techniqueDetail");

    const SETTINGS_KEY = 'diapasonVirtual_settings_v5';
    function readSettings(){
      try{
        return JSON.parse(localStorage.getItem(SETTINGS_KEY)||localStorage.getItem('diapasonVirtual_settings_v4')||localStorage.getItem('diapasonVirtual_settings_v3')||'{}');
      }catch(e){return{}}
    }
    function saveSettings(){
      try{localStorage.setItem(SETTINGS_KEY,JSON.stringify({instrument:instrumentSel.value,tuning:tuningSel.value,capo:+capoSel.value,orientation:orientationSel.value,labelMode:labelModeSel.value,pattern:patternSel.value,voicingRange:voicingRangeSel.value,root:rootSel.value,chord:chordTypeSel.value,scale:scaleSel.value,pos:posSel.value,frets:visibleFrets,volume:+volumeSlider.value,soundType:soundTypeSel.value,metroBpm:+($("metroBpmValue")?.textContent||80),metroMeter:$("metroMeter")?.value||'4/4',metroPulse:$("metroPulse")?.value||'auto',countIn:$("scoreCountIn")?.value||'1',scoreClick:!!$("scoreMetroSync")?.checked,loopRepeats:+($("scoreLoopRepeats")?.value||0),loopBpmAdd:+($("scoreLoopBpmAdd")?.value||0),loopBpmEvery:+($("scoreLoopBpmEvery")?.value||1),fingeringView:scoreFingeringView?.value||'all',fingeringStrategy:scoreFingeringStrategy?.value||'phrase',phraseLength:+(scorePhraseLength?.value||8),techniqueMode:scoreTechniqueMode?.value||'musical'}))}catch(e){}
    }

    // Poblar selects
    Object.keys(INSTRUMENTS).forEach(key => {
      const inst = INSTRUMENTS[key];
      instrumentSel.add(new Option(inst.label, key));
    });
    rootSel.add(new Option("— Ninguna —",""));
    NOTE.forEach(n => rootSel.add(new Option(n, n)));
    scaleSel.add(new Option("— Ninguna —",""));
    Object.keys(SCALE).forEach(k => scaleSel.add(new Option(k.replace(/_/g,' '), k)));
    rootSel.value = "";
    scaleSel.value = "";
    populateChordOptions("");
    for(let i=0;i<=12;i++) capoSel.add(new Option(i===0?'Sin capo':`Traste ${i}`,String(i)));
    function updateTuningOptions(keep=''){
      const list=TUNINGS[instrumentSel.value]||[];
      tuningSel.length=0;
      list.forEach(t=>tuningSel.add(new Option(t.label,t.value)));
      tuningSel.value=list.some(t=>t.value===keep)?keep:(list[0]?.value||'');
    }
    updateTuningOptions();

    // Estado
    let offset = 0;
    const toneVisibility = {root:true, structural:true, tension:true, unavailable:true};
    const blankMode = () => rootSel.value === "" || (chordTypeSel.value === "" && scaleSel.value === "");
    const manualSelections = new Set();
    let hoverCell = null;
    let audioCtx = null;
    let masterBus = null;
    let soundEnabled = true;
    let sfPlayer = null;
    let sfLoading = false;

    // Funciones de sonido (SoundFont)
    function ensureCtx() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterBus = audioCtx.createGain();
        masterBus.gain.value = 1;
        const limiter = audioCtx.createDynamicsCompressor();
        limiter.threshold.setValueAtTime(-6, audioCtx.currentTime);
        limiter.knee.setValueAtTime(12, audioCtx.currentTime);
        limiter.ratio.setValueAtTime(8, audioCtx.currentTime);
        limiter.attack.setValueAtTime(0.003, audioCtx.currentTime);
        limiter.release.setValueAtTime(0.15, audioCtx.currentTime);
        masterBus.connect(limiter);
        limiter.connect(audioCtx.destination);
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }

    function setSourceIndicator(text, cls) {
      soundSourceIndicator.textContent = text;
      soundSourceIndicator.className = 'sound-source-indicator' + (cls ? ' ' + cls : '');
    }

    function loadSoundFont(instrumentName) {
      if (sfLoading) return;
      sfLoading = true;
      setSourceIndicator('🎸 cargando...', 'loading');
      const ctx = ensureCtx();
      Soundfont.instrument(ctx, instrumentName, { destination: masterBus })
        .then(instrument => {
          sfPlayer = instrument;
          sfLoading = false;
          const options = getSoundOptionsForInstrument(instrumentSel.value);
          const option = options.find(o => o.value === instrumentName);
          const label = option ? option.label : instrumentName;
          setSourceIndicator('🎸 ' + label, 'sf');
          console.log('SoundFont cargado:', instrumentName);
        })
        .catch(err => {
          sfLoading = false;
          sfPlayer = null;
          setSourceIndicator('⚡ Fallback (oscilador)', 'osc');
          console.warn('Error al cargar SoundFont, usando oscilador:', err);
        });
    }

    function getSoundOptionsForInstrument(instrumentKey) {
      return SOUND_OPTIONS[instrumentKey] || [{ value: 'acoustic_guitar_nylon', label: INSTRUMENTS[instrumentKey].label + ' (fallback)' }];
    }

    function updateSoundTypeOptions(instrumentKey) {
      const options = getSoundOptionsForInstrument(instrumentKey);
      soundTypeSel.length = 0;
      options.forEach(opt => {
        soundTypeSel.add(new Option(opt.label, opt.value));
      });
      if (options.length > 0) {
        soundTypeSel.value = options[0].value;
        loadSoundFont(options[0].value);
      }
      const instrumentLabels = { requinto: 'Requinto', guitar: 'Guitarra', ukulele: 'Ukelele' };
      soundTypeLabel.textContent = 'Timbre ' + (instrumentLabels[instrumentKey] || '');
    }

    function loadCurrentSound() {
      const value = soundTypeSel.value;
      if (value) loadSoundFont(value);
    }

    // Listeners de instrumento
    instrumentSel.addEventListener('change', function() {
      manualSelections.clear();
      hoverCell = null;
      const instrumentKey = this.value;
      updateSoundTypeOptions(instrumentKey);
      updateTuningOptions();
      if(patternSel.value.startsWith('caged:') && instrumentKey!=='guitar') patternSel.value='free';
      refresh();
    });

    soundTypeSel.addEventListener('change', loadCurrentSound);

    // Funciones canvas
    function fitCanvas() {
      visibleFrets = Math.min(visibleFrets, maxVisibleFrets());
      const w = (visibleFrets * fretW()) + STRING_LABEL_W + 46;
      const h = boardHeight();
      const dpr = window.devicePixelRatio || 1;
      cvs.style.width = `${w}px`;
      cvs.style.height = `${h}px`;
      cvs.width = w * dpr;
      cvs.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function buildPositions() {
      if (rootSel.value && chordTypeSel.value) {
        const chord = parseChordValue();
        const current = posSel.value || "all";
        posSel.length = 0;
        posSel.add(new Option("Todas las posiciones", "all"));
        const count = chord.def.intervals.length;
        for (let inv = 0; inv < count; inv++) {
          posSel.add(new Option(INVERSION_LABELS[inv], `inv${inv}`));
        }
        posSel.value = [...posSel.options].some(opt => opt.value === current) ? current : "all";
        return;
      }
      const current = parseInt(posSel.value || 1);
      posSel.length = 0;
      const maxPosition = Math.min(12, maxVisibleFrets());
      for (let f = 1; f <= maxPosition; f++) {
        posSel.add(new Option(roman(f), f));
      }
      posSel.value = String(Math.min(Math.max(current, 1), maxPosition));
    }

    function roundedRectPath(x, y, w, h, r) {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    }

    function displayFretToColumn(displayFret) {
      if (displayFret === 0) return offset === 0 ? -1 : null;
      const f = displayFret - offset - 1;
      return (f >= 0 && f < visibleFrets) ? f : null;
    }

    function cellCenter(displayFret, stringIdx, boardX, fw, startY, stringGap) {
      const col = displayFretToColumn(displayFret);
      if (col === null) return null;
      const x = col===-1
        ? (isLeftHanded()?boardX+(visibleFrets*fw)+OPEN_NOTE_OFFSET:boardX-OPEN_NOTE_OFFSET)
        : (isLeftHanded()?boardX+((visibleFrets-col-1)*fw)+fw/2:boardX+(col*fw)+fw/2);
      return {x, y:startY+(stringIdx*stringGap)};
    }

    function selectedKey(stringIdx, displayFret) {
      return `${stringIdx}-${displayFret}`;
    }

    // Funciones de acordes
    function detectChord(pcs) {
      const unique = [...new Set(pcs)];
      if (unique.length < 3) return null;
      const sorted = unique.slice().sort((a,b) => a - b);
      for (let root = 0; root < 12; root++) {
        for (const key of Object.keys(CHORD_TYPES)) {
          const def = CHORD_TYPES[key];
          if (def.intervals.length !== sorted.length) continue;
          const target = def.intervals.map(iv => (root + iv) % 12).sort((a,b) => a - b);
          if (target.every((v,i) => v === sorted[i])) return { root, def };
        }
      }
      return null;
    }

    function parseChordValue(value = chordTypeSel.value) {
      const [typeKey, voicingKey] = value.split("|");
      const def = CHORD_TYPES[typeKey];
      const voicing = CHORD_VOICINGS[voicingKey];
      if (!def || !voicing) return null;
      return { typeKey, voicingKey, def, voicing };
    }

    function chordMenuLabel(typeKey, voicingKey) {
      const def = CHORD_TYPES[typeKey];
      const voicing = CHORD_VOICINGS[voicingKey];
      const root = rootSel.value;
      const rootText = root ? `${root} ` : "";
      return `${rootText}${def.menuLabel} ${voicing.label}`;
    }

    function populateChordOptions(keepValue = chordTypeSel.value) {
      chordTypeSel.length = 0;
      chordTypeSel.add(new Option("— Ninguna —",""));
      const groupOrder = ["Tríadas","Drop 2","Drop 3"];
      groupOrder.forEach(groupName => {
        const optgroup = document.createElement("optgroup");
        optgroup.label = groupName;
        let hasOptions = false;
        Object.entries(CHORD_TYPES).forEach(([typeKey, def]) => {
          Object.entries(CHORD_VOICINGS).forEach(([voicingKey, voicing]) => {
            if (voicing.group !== groupName || def.family !== voicing.family) return;
            optgroup.appendChild(new Option(chordMenuLabel(typeKey, voicingKey), `${typeKey}|${voicingKey}`));
            hasOptions = true;
          });
        });
        if (hasOptions) chordTypeSel.appendChild(optgroup);
      });
      chordTypeSel.value = (keepValue && parseChordValue(keepValue)) ? keepValue : "";
    }

    function expandedTemplates(voicing) {
      if (!voicing.include) return voicing.templates || [];
      return voicing.include.flatMap(key => (CHORD_VOICINGS[key].templates || []));
    }

    function fretCandidatesForSlot(rootPc, def, stringIdx, slot) {
      const slotIndex = {root:0, third:1, fifth:2, seventh:3}[slot];
      const interval = def.intervals[slotIndex];
      const targetPc = (rootPc + interval) % 12;
      const openPc = (activePitches()[stringIdx] + activeInstrument().nutFret) % 12;
      const base = ((targetPc - openPc) % 12 + 12) % 12;
      return [base, base + 12, base + 24].filter(f => f <= TOTAL_FRETS);
    }

    function pickCompactCombo(optionsList, anchors) {
      let best = null, bestSpan = Infinity, bestDev = Infinity;
      (function rec(i, current) {
        if (i === optionsList.length) {
          const span = Math.max(...current) - Math.min(...current);
          const dev = current.reduce((s, f, idx) => s + Math.abs(f - anchors[idx]), 0);
          if (span < bestSpan || (span === bestSpan && dev < bestDev)) {
            bestSpan = span; bestDev = dev; best = current.slice();
          }
          return;
        }
        for (const c of optionsList[i]) {
          current.push(c);
          rec(i+1, current);
          current.pop();
        }
      })(0, []);
      return best;
    }

    function buildChordShapes(rootPc, def, voicing) {
      const stringCount = activePitches().length;
      const shapes = [];
      expandedTemplates(voicing).forEach(template => {
        if (template.strings.some(stringIdx => stringIdx >= stringCount)) return;
        const options = template.strings.map((stringIdx, i) => fretCandidatesForSlot(rootPc, def, stringIdx, template.slots[i]));
        if (options.some(list => list.length === 0)) return;
        const frets = pickCompactCombo(options, template.frets);
        const cells = template.strings.map((stringIdx, i) => {
          const slot = template.slots[i];
          return { string: stringIdx, fret: frets[i], role: slot === "root" ? "root" : "structural", slot };
        });
        const inversion = template.slots.indexOf("root");
        shapes.push({ inversion, cells });
      });
      return shapes;
    }

    function inversionSuffix(rootPc, def, inversion) {
      if (inversion === 0) return "";
      return `/${NOTE[(rootPc + def.intervals[inversion]) % 12]}`;
    }

    function shapeInVoicingRange(shape){
      const mode=voicingRangeSel?.value||'all';
      if(mode==='all') return true;
      const avg=shape.cells.reduce((a,c)=>a+c.string,0)/shape.cells.length;
      if(mode==='low') return avg>=3.1;
      if(mode==='high') return avg<=2.0;
      return avg>1.5 && avg<3.8;
    }
    function selectedChordShapes(rootPc, def, voicing) {
      let shapes = buildChordShapes(rootPc, def, voicing).filter(shapeInVoicingRange);
      if (posSel.value === "all") return shapes;
      if (posSel.value.startsWith("inv")) {
        const inv = parseInt(posSel.value.replace("inv",""));
        return shapes.filter(shape => shape.inversion === inv);
      }
      return shapes;
    }

    // Sonido (playNote)
    function playNote(midi, duration = 1.5) {
      if (!soundEnabled) return null;
      const ctx = ensureCtx();
      if (!ctx) return null;
      const vol = parseFloat(volumeSlider.value) / 10;
      if (isNaN(vol) || vol <= 0) return null;

      if (sfPlayer) {
        try {
          const sfNote = sfPlayer.play(midi, ctx.currentTime, { gain: vol });
          if (sfNote) {
            const stopNow = () => {
              try {
                if (sfNote && typeof sfNote.stop === 'function') {
                  sfNote.stop(ctx.currentTime);
                }
              } catch(e) {}
            };
            const timer = setTimeout(stopNow, duration * 1000);
            return { stop: () => { clearTimeout(timer); stopNow(); } };
          }
        } catch(e) {
          console.warn('Error al tocar nota con SoundFont:', e);
        }
      }

      // Fallback oscilador
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol * 0.3, ctx.currentTime + 0.02);
      gain.gain.linearRampToValueAtTime(vol * 0.3, ctx.currentTime + duration - 0.08);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(masterBus);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
      return { stop: () => { try { osc.stop(ctx.currentTime); } catch(e) {} } };
    }

    muteBtn.textContent = "🔊";
    muteBtn.onclick = function() {
      soundEnabled = !soundEnabled;
      this.textContent = soundEnabled ? "🔊" : "🔇";
    };

    // Controles
    minus.onclick = () => { if (visibleFrets > 4) { visibleFrets--; refresh(); saveSettings(); } };
    plus.onclick = () => { if (visibleFrets < maxVisibleFrets()) { visibleFrets++; refresh(); saveSettings(); } };
    posSel.onchange = () => { offset = (rootSel.value && chordTypeSel.value) ? 0 : parseInt(posSel.value) - 1; draw(); };
    rootSel.onchange = () => { populateChordOptions(chordTypeSel.value); manualSelections.clear(); hoverCell = null; refresh(); };
    chordTypeSel.onchange = () => { if (chordTypeSel.value !== "") scaleSel.value = ""; manualSelections.clear(); hoverCell = null; refresh(); };
    scaleSel.onchange = () => { if (scaleSel.value !== "") chordTypeSel.value = ""; manualSelections.clear(); hoverCell = null; refresh(); saveSettings(); };
    instrumentSel.addEventListener('change',saveSettings);
    soundTypeSel.addEventListener('change',saveSettings);
    rootSel.addEventListener('change',saveSettings);
    chordTypeSel.addEventListener('change',saveSettings);
    posSel.addEventListener('change',saveSettings);
    volumeSlider.addEventListener('input',saveSettings);
    [tuningSel,capoSel,orientationSel,labelModeSel,patternSel,voicingRangeSel].forEach(el=>el.addEventListener('change',()=>{manualSelections.clear();hoverCell=null;refresh();saveSettings()}));

    function cellFromEvent(evt) {
      if (!blankMode()) return null;
      const rect = cvs.getBoundingClientRect();
      // Escalar coordenadas al espacio lógico del canvas
      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = cvs.width / dpr;
      const logicalHeight = cvs.height / dpr;
      const mx = (evt.clientX - rect.left) * (logicalWidth / rect.width);
      const my = (evt.clientY - rect.top) * (logicalHeight / rect.height);
      const fw = fretW();
      const boardX = STRING_LABEL_W;
      const stringGap = BASS4_STRING_GAP;
      const padY = BOARD_PAD_Y;
      let displayFret = null;
      const openX=isLeftHanded()?boardX+(visibleFrets*fw)+OPEN_NOTE_OFFSET:boardX-OPEN_NOTE_OFFSET;
      if (offset === 0 && Math.abs(mx-openX) <= RAD + 7) {
        displayFret = 0;
      } else {
        if (mx < boardX || mx>boardX+(visibleFrets*fw)) return null;
        let f = Math.floor((mx - boardX) / fw);
        if(isLeftHanded()) f=visibleFrets-f-1;
        if (f < 0 || f >= visibleFrets) return null;
        displayFret = f + offset + 1;
      }
      const pitches = activePitches();
      const stringCount = pitches.length;
      let best = null, bestDist = Infinity;
      for (let s = 0; s < stringCount; s++) {
        const y = padY + (s * stringGap);
        const d = Math.abs(my - y);
        if (d < bestDist) { bestDist = d; best = s; }
      }
      if (bestDist > stringGap / 2) return null;
      return { s: best, displayFret };
    }

    cvs.addEventListener('pointermove', evt => {
      const cell = cellFromEvent(evt);
      const changed = !cell && hoverCell || cell && (!hoverCell || hoverCell.s !== cell.s || hoverCell.displayFret !== cell.displayFret);
      hoverCell = cell;
      cvs.style.cursor = cell ? "pointer" : "default";
      if (changed) draw();
    });

    cvs.addEventListener('pointerleave', () => { if (hoverCell) { hoverCell = null; draw(); } });

    cvs.addEventListener('pointerdown', evt => {
      const cell = cellFromEvent(evt);
      if (!cell) return;
      const midiNow=activePitches()[cell.s]+physicalFret(cell.displayFret);
      if(tutorMode&&tutorExpectedKeys.size){
        const tutorKey=scoreCellKey({string:cell.s,fret:cell.displayFret,midi:midiNow});
        playNote(midiNow,1.1);
        if(tutorExpectedKeys.has(tutorKey)){
          tutorCompletedKeys.add(tutorKey);
          practiceStatus.textContent=`Correcto ${tutorCompletedKeys.size}/${tutorExpectedKeys.size}`;
          draw();
          if(tutorCompletedKeys.size>=tutorExpectedKeys.size){
            practiceStatus.textContent='Correcto · siguiente nota';
            setTimeout(()=>{
              if(!tutorMode||!osmd?.cursor?.Iterator)return;
              if(osmd.cursor.Iterator.EndReached){practiceStatus.textContent='Tutor completado';return;}
              osmd.cursor.next(); currentStepIndex++; osmd.cursor.show();
              const data=getCurrentStepData(getTempo()); setScoreHighlight(data.midis);
            },220);
          }
        }else{
          practiceStatus.textContent=`Prueba otra posición · ${noteLabelFromMidi(midiNow)}`;
        }
        return;
      }
      const key = selectedKey(cell.s, cell.displayFret);
      const wasSelected = manualSelections.has(key);
      if (wasSelected) {
        manualSelections.delete(key);
      } else {
        manualSelections.add(key);
        const pitches = activePitches();
        const midi = pitches[cell.s] + physicalFret(cell.displayFret);
        playNote(midi, 1.8);
      }
      draw();
    });

    clearSelectionBtn.onclick = () => { manualSelections.clear(); hoverCell = null; draw(); };
    clearAllBtn.onclick = () => {
      rootSel.value = "";
      scaleSel.value = "";
      populateChordOptions("");
      manualSelections.clear();
      hoverCell = null;
      refresh();
    };

    legendButtons.forEach(button => {
      button.onclick = () => {
        const role = button.dataset.toneFilter;
        toneVisibility[role] = !toneVisibility[role];
        button.setAttribute("aria-pressed", String(toneVisibility[role]));
        draw();
      };
    });

    const INTERVAL_LABELS=['T','b2','2','b3','3','4','b5','5','#5','6','b7','7'];
    const DEGREE_LABELS=['1','♭2','2','♭3','3','4','♯4/♭5','5','♭6','6','♭7','7'];
    function degreeLabel(pc,rootPc,pcs){
      const iv=((pc-rootPc)%12+12)%12;
      return DEGREE_LABELS[iv];
    }
    function boardNoteLabel(pc,rootPc=null,pcs=null){
      const mode=labelModeSel?.value||'notes';
      if(mode==='notes'||rootPc===null) return spellPc(pc,rootSel?.value||'');
      const iv=((pc-rootPc)%12+12)%12;
      return mode==='intervals'?INTERVAL_LABELS[iv]:degreeLabel(pc,rootPc,pcs);
    }
    function patternAllows(stringIdx,fret,pcs,rootPc){
      const p=patternSel?.value||'free';
      if(p==='free') return true;
      if(p.startsWith('caged:')){
        if(instrumentSel.value!=='guitar') return true;
        const shape=p.split(':')[1];
        const lowEpc=((activePitches()[5]%12)+12)%12;
        const rootF=((rootPc-lowEpc)%12+12)%12;
        const shift={C:-4,A:-2,G:0,E:2,D:4}[shape]||0;
        let base=(rootF+shift)%12; if(base<0)base+=12;
        const skew={C:[0,0,1,1,2,2],A:[0,1,1,1,2,2],G:[0,0,1,2,2,3],E:[0,0,1,1,1,2],D:[0,1,1,2,2,2]}[shape];
        const start=base+(skew[stringIdx]||0);
        return fret>=start && fret<=start+4;
      }
      if(p.startsWith('3nps:')){
        if(!pcs || pcs.length!==7) return true;
        const pos=Math.max(1,Math.min(7,+p.split(':')[1]||1));
        const all=[];
        for(let f=0;f<=TOTAL_FRETS;f++){const pc=(activePitches()[stringIdx]+physicalFret(f))%12;if(pcs.includes(pc))all.push(f)}
        if(all.length<3)return true;
        const rootAnchor=((rootPc-(activePitches().at(-1)%12)+12)%12);
        const target=rootAnchor+(pos-1)*2;
        let best=0,bestD=1e9;
        for(let i=0;i<=all.length-3;i++){const d=Math.abs(all[i]-target);if(d<bestD){bestD=d;best=i}}
        return all.slice(best,best+3).includes(fret);
      }
      return true;
    }

    // Función draw (diapasón)
    function draw() {
      fitCanvas();
      const pitches = activePitches();
      const stringCount = pitches.length;
      const fw = fretW();
      const boardX = STRING_LABEL_W;
      const boardW = visibleFrets * fw;
      const width = boardW + boardX + 46;
      const canvasH = boardHeight();
      const padY = BOARD_PAD_Y;
      const boardH = canvasH - (padY * 2);
      const radius = 14;
      const stringGap = BASS4_STRING_GAP;
      const startY = padY;

      ctx.clearRect(0, 0, width, canvasH);

      roundedRectPath(boardX + 0.5, padY, boardW - 1, boardH, radius);
      ctx.save();
      ctx.clip();

      // Fondo oscuro del diapasón
      const bg = ctx.createLinearGradient(0, padY, 0, padY + boardH);
      bg.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--board1').trim());
      bg.addColorStop(0.52, getComputedStyle(document.documentElement).getPropertyValue('--board2').trim());
      bg.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--board3').trim());
      ctx.fillStyle = bg;
      ctx.fillRect(boardX, padY, boardW, boardH);

      // Vetas
      ctx.globalAlpha = 0.22;
      for (let i = 0; i < 22; i++) {
        const y = padY + 8 + (i * 11) % boardH;
        ctx.strokeStyle = i % 2 ? '#4a2e1c' : '#170c06';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(boardX, y);
        ctx.bezierCurveTo(boardX + boardW * 0.25, y + 8, boardX + boardW * 0.65, y - 7, boardX + boardW, y + 3);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Puntos guía
      ctx.fillStyle = 'rgba(243,224,187,0.3)';
      GUIDE_DOTS.forEach(gd => {
        const f = gd - offset - 1;
        if (f < 0 || f >= visibleFrets) return;
        const cx = isLeftHanded() ? boardX + ((visibleFrets-f-1)*fw) + fw/2 : boardX + (f*fw) + fw/2;
        const dotR = 4.6;
        if (gd === 12) {
          ctx.beginPath(); ctx.arc(cx, padY + boardH * 0.32, dotR, 0, Math.PI * 2); ctx.fill();
          ctx.beginPath(); ctx.arc(cx, padY + boardH * 0.68, dotR, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.beginPath(); ctx.arc(cx, padY + boardH / 2, dotR, 0, Math.PI * 2); ctx.fill();
        }
      });

      // Trastes
      const fretMetal = ctx.createLinearGradient(0, padY, 0, padY + boardH);
      fretMetal.addColorStop(0, getComputedStyle(document.documentElement).getPropertyValue('--fretmetal-light'));
      fretMetal.addColorStop(0.18, getComputedStyle(document.documentElement).getPropertyValue('--fretmetal-mid'));
      fretMetal.addColorStop(0.5, getComputedStyle(document.documentElement).getPropertyValue('--fretmetal-dark'));
      fretMetal.addColorStop(0.82, getComputedStyle(document.documentElement).getPropertyValue('--fretmetal-mid'));
      fretMetal.addColorStop(1, getComputedStyle(document.documentElement).getPropertyValue('--fretmetal-light'));
      ctx.lineCap = 'butt';
      for (let f = 0; f <= visibleFrets; f++) {
        const x = boardX + ((isLeftHanded()?visibleFrets-f:f) * fw);
        if (f === 0) {
          ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--string');
          ctx.lineWidth = 6;
        } else {
          ctx.strokeStyle = fretMetal;
          ctx.lineWidth = 2.6;
        }
        ctx.beginPath();
        ctx.moveTo(x, padY);
        ctx.lineTo(x, padY + boardH);
        ctx.stroke();
        if (f > 0) {
          ctx.save();
          ctx.globalAlpha = 0.55;
          ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--fretmetal-light');
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(x - 1, padY);
          ctx.lineTo(x - 1, padY + boardH);
          ctx.stroke();
          ctx.restore();
        }
      }

      // Cuerdas
      ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--string');
      for (let s = 0; s < stringCount; s++) {
        const y = startY + (s * stringGap);
        ctx.lineWidth = 1.4 + (s * 0.28);
        ctx.beginPath();
        ctx.moveTo(boardX, y);
        ctx.lineTo(boardX + boardW, y);
        ctx.stroke();
      }

      ctx.restore();

      roundedRectPath(boardX + 0.5, padY, boardW - 1, boardH, radius);
      ctx.strokeStyle = 'rgba(243,224,187,0.78)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Números de cuerda
      ctx.font = `900 0.78rem Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted');
      for (let s = 0; s < stringCount; s++) {
        const y = startY + (s * stringGap);
        ctx.fillText(String(s + 1), isLeftHanded()?boardX+boardW+12:10, y + 0.5);
      }
      if (offset === 0) {
        ctx.fillStyle = 'rgba(255,250,240,0.42)';
        ctx.font = `900 0.68rem Inter, sans-serif`;
        ctx.fillText("0", isLeftHanded()?boardX+boardW+OPEN_NOTE_OFFSET:boardX-OPEN_NOTE_OFFSET, startY - 13);
      }
      if(capoSemitones()>0){
        ctx.save();
        ctx.fillStyle='rgba(212,168,79,.95)';
        ctx.font='900 10px Inter, sans-serif';
        ctx.textAlign='center';
        ctx.fillText(`CAPO ${capoSemitones()}`,boardX+boardW/2,padY+10);
        ctx.restore();
      }

      // Dibujar círculos de notas
      const isBlank = blankMode();
      const chordMode = !isBlank && chordTypeSel.value !== "";
      const scaleMode = !isBlank && scaleSel.value !== "";

      // Variables para recoger las notas que se dibujan (para el pentagrama)
      let currentNotes = [];

      if (chordMode) {
        const chord = parseChordValue();
        if (chord) {
          const rootPc = NOTE.indexOf(rootSel.value);
          const def = chord.def;
          const shapes = selectedChordShapes(rootPc, def, chord.voicing);
          shapes.forEach(shape => {
            shape.cells.forEach(({ string: s, fret: displayFret, role }) => {
              if (!toneVisibility[role]) return;
              const pc = (pitches[s] + physicalFret(displayFret)) % 12;
              const midi = pitches[s] + physicalFret(displayFret);
              currentNotes.push({ pc, midi });
              const point = cellCenter(displayFret, s, boardX, fw, startY, stringGap);
              if (!point) return;
              const { x, y } = point;
              ctx.save();
              ctx.shadowColor = 'rgba(0,0,0,0.42)';
              ctx.shadowBlur = 8;
              ctx.shadowOffsetY = 3;
              ctx.fillStyle = TONE_COLORS[role];
              ctx.beginPath();
              ctx.arc(x, y, RAD, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
              ctx.fillStyle = "#161514";
              ctx.fillText(boardNoteLabel(pc,rootPc,def.intervals.map(iv=>(rootPc+iv)%12)), x, y + 0.5);
            });
          });
        }
      } else if (scaleMode) {
        const rootPc = NOTE.indexOf(rootSel.value);
        const ints = SCALE[scaleSel.value];
        const pcs = pcPattern(rootPc, ints);
        const spec = SPECIAL.includes(scaleSel.value);
        for (let s = 0; s < stringCount; s++) {
          const startFret = offset === 0 ? 0 : offset + 1;
          const endFret = offset + visibleFrets;
          for (let displayFret = startFret; displayFret <= endFret; displayFret++) {
            const pc = (pitches[s] + physicalFret(displayFret)) % 12;
            if (!pcs.includes(pc)) continue;
            if (!patternAllows(s,displayFret,pcs,rootPc)) continue;
            const role = toneRole(pc, rootPc, pcs, spec);
            if (!toneVisibility[role]) continue;
            const midi = pitches[s] + physicalFret(displayFret);
            currentNotes.push({ pc, midi });
            const point = cellCenter(displayFret, s, boardX, fw, startY, stringGap);
            if (!point) continue;
            const { x, y } = point;
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.42)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 3;
            ctx.fillStyle = TONE_COLORS[role];
            ctx.beginPath();
            ctx.arc(x, y, RAD, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            ctx.fillStyle = "#161514";
            ctx.fillText(boardNoteLabel(pc,rootPc,pcs), x, y + 0.5);
          }
        }
      } else {
        // Modo exploración
        const selectedNotes = [];
        manualSelections.forEach(key => {
          const [s, displayFret] = key.split('-').map(Number);
          const midi = pitches[s] + physicalFret(displayFret);
          selectedNotes.push({ pc: midi % 12, midi });
        });
        currentNotes = selectedNotes;

        for (let s = 0; s < stringCount; s++) {
          const startFret = offset === 0 ? 0 : offset + 1;
          const endFret = offset + visibleFrets;
          for (let displayFret = startFret; displayFret <= endFret; displayFret++) {
            const key = selectedKey(s, displayFret);
            const isSelected = manualSelections.has(key);
            const isHover = hoverCell && hoverCell.s === s && hoverCell.displayFret === displayFret;
            if (!isSelected && !isHover) continue;
            const pc = (pitches[s] + physicalFret(displayFret)) % 12;
            const midi = pitches[s] + physicalFret(displayFret);
            const point = cellCenter(displayFret, s, boardX, fw, startY, stringGap);
            if (!point) continue;
            const { x, y } = point;
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.42)';
            ctx.shadowBlur = 8;
            ctx.shadowOffsetY = 3;
            ctx.globalAlpha = isSelected ? 1 : 0.55;
            ctx.fillStyle = isSelected ? getComputedStyle(document.documentElement).getPropertyValue('--gold') : '#fffaf0';
            ctx.beginPath();
            ctx.arc(x, y, RAD, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // Mostrar nombre de nota DENTRO del círculo
            ctx.save();
            ctx.fillStyle = "#161514";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.font = `bold 11px Inter, sans-serif`;
            ctx.fillText(NOTE[pc], x, y);
            ctx.restore();
          }
        }
      }

      // Fase 3: posiciones posibles (anillo) y digitación recomendada (dorado sólido).
      if(scoreCandidateCells.length && scoreFingeringView?.value==='all'){
        scoreCandidateCells.forEach(c=>{
          const point=cellCenter(c.fret,c.string,boardX,fw,startY,stringGap); if(!point)return;
          ctx.save(); ctx.strokeStyle='rgba(212,168,79,.72)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(point.x,point.y,RAD+4,0,Math.PI*2); ctx.stroke(); ctx.restore();
        });
      }
      if(scoreRecommendedCells.length){
        scoreRecommendedCells.forEach((c,i)=>{
          const point=cellCenter(c.fret,c.string,boardX,fw,startY,stringGap); if(!point)return;
          const done=tutorCompletedKeys.has(scoreCellKey(c));
          ctx.save(); ctx.shadowColor='rgba(0,0,0,.46)';ctx.shadowBlur=10;ctx.fillStyle=done?'#79c267':getComputedStyle(document.documentElement).getPropertyValue('--gold');
          ctx.beginPath();ctx.arc(point.x,point.y,RAD+2,0,Math.PI*2);ctx.fill();ctx.restore();
          ctx.save();ctx.fillStyle='#161514';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='1000 10px Inter, sans-serif';ctx.fillText(c.finger===0?'0':String(c.finger||i+1),point.x,point.y);ctx.restore();
        });
      }

      // Resaltado de la(s) nota(s) que suenan actualmente desde la partitura MusicXML
      if (scoreHighlightMidis.size && !scoreRecommendedCells.length) {
        scoreHighlightMidis.forEach(midi => {
          const pc = ((midi % 12) + 12) % 12;
          for (let s = 0; s < stringCount; s++) {
            const startFret = offset === 0 ? 0 : offset + 1;
            const endFret = offset + visibleFrets;
            for (let displayFret = startFret; displayFret <= endFret; displayFret++) {
              if (pitches[s] + physicalFret(displayFret) !== midi) continue;
              const point = cellCenter(displayFret, s, boardX, fw, startY, stringGap);
              if (!point) continue;
              const { x, y } = point;
              ctx.save();
              ctx.shadowColor = 'rgba(0,0,0,0.42)';
              ctx.shadowBlur = 8;
              ctx.shadowOffsetY = 3;
              ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--gold');
              ctx.beginPath();
              ctx.arc(x, y, RAD, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
              ctx.save();
              ctx.fillStyle = "#161514";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.font = `bold 11px Inter, sans-serif`;
              ctx.fillText(NOTE[pc], x, y);
              ctx.restore();
            }
          }
          if (!currentNotes.some(n => n.midi === midi)) currentNotes.push({ pc, midi });
        });
      }

      // Actualizar pentagrama con las notas actuales
      renderStaffNotes(currentNotes);

      fretLabel.textContent = roman(offset + 1);
      updateInfo();
    }

    function updateInfo() {
      const isBlank = blankMode();
      const chordMode = !isBlank && chordTypeSel.value !== "";
      const scaleMode = !isBlank && scaleSel.value !== "";
      const symbolEl = chordSymbolEl;
      const qualityEl = chordQualityEl;

      if (chordMode) {
        const chord = parseChordValue();
        if (chord) {
          const rootPc = NOTE.indexOf(rootSel.value);
          const def = chord.def;
          const selectedInv = posSel.value.startsWith("inv") ? parseInt(posSel.value.replace("inv","")) : null;
          symbolEl.textContent = rootSel.value + def.suffix + (selectedInv === null ? "" : inversionSuffix(rootPc, def, selectedInv));
          const capoText=capoSemitones()?` · Capo ${capoSemitones()}`:'';
          const rangeText=voicingRangeSel.value!=='all'?` · ${voicingRangeSel.options[voicingRangeSel.selectedIndex].text}`:'';
          qualityEl.textContent = `${chord.voicing.group} ${chord.voicing.label}${rangeText} · ${selectedInv === null ? "Todas las posiciones" : INVERSION_LABELS[selectedInv]} · ${def.quality}${capoText}`;
        }
      } else if (scaleMode) {
        const rootPc = NOTE.indexOf(rootSel.value);
        const scaleName = scaleSel.value.replace(/_/g, ' ');
        symbolEl.textContent = `Escala: ${scaleName} · Tónica ${NOTE[rootPc]}`;
        const patternText=patternSel.value==='free'?'':` · ${patternSel.options[patternSel.selectedIndex].text}`;
        const capoText=capoSemitones()?` · Capo ${capoSemitones()}`:'';
        qualityEl.textContent = `Modo ${scaleName}${patternText}${capoText}`;
      } else {
        if (manualSelections.size > 0) {
          const selectedNotes = [];
          const pitches = activePitches();
          manualSelections.forEach(key => {
            const [s, displayFret] = key.split('-').map(Number);
            const midi = pitches[s] + physicalFret(displayFret);
            selectedNotes.push({ pc: midi % 12, midi });
          });
          const selectedPcs = selectedNotes.map(n => n.pc);
          const detected = detectChord(selectedPcs);
          if (detected) {
            symbolEl.textContent = NOTE[detected.root] + detected.def.suffix;
            qualityEl.textContent = detected.def.quality;
          } else if (selectedNotes.length > 0) {
            symbolEl.textContent = `Notas: ${selectedNotes.map(n => NOTE[n.pc]).join(' ')}`;
            qualityEl.textContent = "No se reconoce un acorde con estas notas";
          } else {
            symbolEl.textContent = "Modo exploración";
            qualityEl.textContent = "Haz clic en los trastes para seleccionar notas";
          }
        } else {
          symbolEl.textContent = "Modo exploración";
          qualityEl.textContent = "Haz clic en los trastes para seleccionar notas";
        }
      }
    }

    function syncPatternAvailability(){
      const pcs=scaleSel.value && SCALE[scaleSel.value] ? scalePitchClasses(rootSel.value, scaleSel.value) : [];
      const heptatonic=pcs.length===7;
      [...patternSel.options].forEach(o=>{ if(o.value.startsWith('3nps:')) o.disabled=!heptatonic; });
      if(patternSel.value.startsWith('3nps:') && !heptatonic) patternSel.value='free';
    }

    function refresh() {
      syncPatternAvailability();
      visibleFrets = Math.min(visibleFrets, maxVisibleFrets());
      buildPositions();
      fretVal.textContent = visibleFrets;
      if (!posSel.value) posSel.selectedIndex = 0;
      offset = (rootSel.value && chordTypeSel.value) ? 0 : parseInt(posSel.value || 1) - 1;
      draw();
    }
