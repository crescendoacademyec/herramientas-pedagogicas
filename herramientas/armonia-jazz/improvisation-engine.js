(function (global) {
  "use strict";

  const ROOTS = { C: 60, Db: 61, D: 62, Eb: 63, E: 64, F: 65, Gb: 66, G: 67, Ab: 68, A: 69, Bb: 70, B: 71 };
  const MAJOR = [0, 2, 4, 5, 7, 9, 11];
  const MODES = {
    stepwise: { name: "Escala por grados", degrees: [0, 1, 2, 3, 4, 5, 6, 7] },
    thirds: { name: "Terceras diatónicas", degrees: [0, 2, 1, 3, 2, 4, 3, 5, 4, 6, 5, 7] },
    fourths: { name: "Saltos diatónicos", degrees: [0, 3, 1, 4, 2, 5, 3, 6, 4, 7] },
    sevenths: { name: "Arpegios de séptima", degrees: [0, 2, 4, 6, 1, 3, 5, 7] },
    permutation: { name: "Permutación 1–3–2–4", degrees: [0, 2, 1, 3, 1, 3, 2, 4, 2, 4, 3, 5] }
    ,triads: { name: "Tríadas diatónicas", degrees: [0,2,4,1,3,5,2,4,6,3,5,7,4,6,8,5,7,9,6,8,10] }
    ,pentatonicSkip: { name: "Saltos pentatónicos", degrees: [0,2,1,4,2,5,4,7] }
    ,threeOverFour: { name: "Tres sobre cuatro", degrees: [0,1,2,1,2,3,2,3,4,3,4,5] }
  };
  const DIATONIC = [
    { roman: "Imaj7", degrees: [0, 2, 4, 6] }, { roman: "iim7", degrees: [1, 3, 5, 7] },
    { roman: "iiim7", degrees: [2, 4, 6, 8] }, { roman: "IVmaj7", degrees: [3, 5, 7, 9] },
    { roman: "V7", degrees: [4, 6, 8, 10] }, { roman: "vim7", degrees: [5, 7, 9, 11] },
    { roman: "viiø7", degrees: [6, 8, 10, 12] }
  ];
  Object.assign(MODES,{
    intervals:{name:'Intervalos diatónicos'},jumps:{name:'Saltos aleatorios'},random:{name:'Notas aleatorias'},
    pivots:{name:'Pivotes'},approachThirds:{name:'Aproximación a terceras'},approachTriads:{name:'Aproximación a tríadas'},approachChords:{name:'Aproximación a tétradas'},
    pentatonicLinear:{name:'Pentatónica lineal'},pentatonicChords:{name:'Grupos pentatónicos'},pentatonicThree:{name:'Pentatónica en grupos de tres'}
  });

  function exactBar(pattern, pitch, shift = 0) {
    const capacity = 4, offset = Math.max(0, Math.min(1.5, Number(shift) || 0));
    const source = pattern.map(item => typeof item === "number" ? { beats: item } : { ...item });
    const events = offset ? [{ kind: "rest", beats: offset }] : [];
    let remaining = capacity - offset, cursor = 0;
    while (remaining > 1e-7) {
      const sourceEvent = source[cursor % source.length];
      const beats = Math.min(Number(sourceEvent.beats), remaining);
      events.push({ ...sourceEvent, beats, midi: pitch, bar: 0 });
      remaining -= beats; cursor++;
    }
    return events;
  }

  function degreeMidi(rootMidi, degree) {
    const octave = Math.floor(degree / 7);
    const index = ((degree % 7) + 7) % 7;
    return rootMidi + MAJOR[index] + octave * 12;
  }
  function eventsFromDegrees(root, degrees, beats) {
    return degrees.map((degree, index) => ({ midi: degreeMidi(ROOTS[root], degree), beats: beats || .5, label: String(degree + 1), bar: Math.floor(index / 8) }));
  }
  const materialDecks = new Map(), materialPools = new Map();
  let lastMaterial = null;
  function materialIndex(key, total) {
    const storageKey = `aj-improv-material-v2-${key}`;
    let deck = materialDecks.get(key);
    if (!deck) {
      let saved;
      try { saved = JSON.parse(global.localStorage?.getItem(storageKey) || 'null'); } catch {}
      const valid = saved && saved.total===total && Number.isInteger(saved.seed) && saved.seed>=0 && saved.seed<=0xffffffff && Number.isInteger(saved.cursor) && saved.cursor>=0 && saved.cursor<=total && Number.isInteger(saved.avoid) && saved.avoid>=-1 && saved.avoid<total;
      deck = {total, seed:Math.floor(Math.random()*4294967296),cursor:0,avoid:-1,...(valid?saved:{})};
      materialDecks.set(key,deck);
    }
    function shuffle() {
      let seed=deck.seed;
      const random=()=>{seed+=0x6D2B79F5;let t=seed;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};
      deck.order=Uint32Array.from({length:total},(_,i)=>i);
      for(let i=total-1;i>0;i--){const j=Math.floor(random()*(i+1));[deck.order[i],deck.order[j]]=[deck.order[j],deck.order[i]];}
      if(total>1&&deck.order[0]===deck.avoid)[deck.order[0],deck.order[1]]=[deck.order[1],deck.order[0]];
    }
    if(!deck.order)shuffle();
    if(deck.cursor===total){deck.avoid=deck.order[total-1];deck.seed=Math.floor(Math.random()*4294967296);deck.cursor=0;shuffle();}
    const value=deck.order[deck.cursor++];
    try{global.localStorage?.setItem(storageKey,JSON.stringify({total,seed:deck.seed,cursor:deck.cursor,avoid:deck.avoid}));}catch{}
    lastMaterial={key,used:deck.cursor,total};return value;
  }
  function materialProgress(){return lastMaterial?{...lastMaterial}:null;}
  function chooseMaterial(key,build){
    if(!materialPools.has(key)){
      const unique=new Map();for(const value of build())unique.set(JSON.stringify(value),value);
      const pool=[...unique.values()];if(!pool.length)throw Error('No hay combinaciones con estos ajustes');materialPools.set(key,pool);
    }
    const pool=materialPools.get(key);return pool[materialIndex(key,pool.length)];
  }
  function permutations(items,length=items.length){
    if(length===0)return [[]];
    return items.flatMap((item,i)=>permutations(items.filter((_,j)=>i!==j),length-1).map(tail=>[item,...tail]));
  }
  const PERM3=permutations([0,1,2]),PERM4=permutations([0,1,2,3]);
  const FIGURES={whole:4,half:2,quarter:1,eighth:.5,sixteenth:.25,thirtySecond:.125,triplet:1/3,sextuplet:1/6};
  function figureEvents(events,figure='eighth'){
    if(!(figure in FIGURES))figure='eighth';
    const ticks=Math.round(FIGURES[figure]*48),actual=figure==='triplet'?3:figure==='sextuplet'?6:0;
    const input=events.map(e=>({...e})),out=[];
    if(actual)while(input.length%actual)input.push({kind:'rest'});
    let time=0;
    input.forEach((event,i)=>{
      const {beats,bar,tuplet,...note}=event;
      out.push({...note,beats:ticks/48,bar:Math.floor(time/192),...(actual?{kind:note.kind==='rest'?'rest':'triplet',tupletActual:actual,tuplet:i%actual===0?'start':i%actual===actual-1?'stop':''}:{})});
      time+=ticks;
    });
    let remaining=(192-time%192)%192;
    for(const length of [192,96,48,24,12,6])while(remaining>=length){out.push({kind:'rest',beats:length/48,bar:Math.floor(time/192)});remaining-=length;time+=length;}
    return out;
  }
  function degreeEvent(root,degree){
    const midi=degreeMidi(ROOTS[root],degree),letters='CDEFGAB',natural=[0,2,4,5,7,9,11];
    const diatonic=28+letters.indexOf(root[0])+degree;
    const expected=12*(Math.floor(diatonic/7)+1)+natural[((diatonic%7)+7)%7];
    return {midi,diatonic,alter:midi-expected,label:String(((degree%7)+7)%7+1)};
  }
  function fromDegrees(root,degrees,figure='eighth') {return figureEvents(degrees.map(d=>degreeEvent(root,d)),figure);}
  function directionVariants(line,direction){return direction==='up'?[line]:direction==='down'?[[...line].reverse()]:[line,[...line].reverse()];}
  function scale(root,mode='stepwise',options={}){
    const direction=['jumps','random','triads','sevenths'].includes(mode)?'both':options.direction||'both',interval=Math.max(1,Math.min(8,Number(options.interval)||3));
    const chord=options.chord??'all',inversion=options.inversion??'all';
    const key=`scale-${mode}-${direction}-${mode==='intervals'?interval:''}-${['triads','sevenths'].includes(mode)?chord+'-'+inversion:''}`;
    const degrees=chooseMaterial(key,()=>{
      const results=[];
      if(mode==='jumps'||mode==='random'){
        // Every four-note cell in one octave, followed by its diatonic sequence.
        for(let a=0;a<7;a++)for(let b=0;b<7;b++)for(let c=0;c<7;c++)for(let d=0;d<7;d++){
          const cell=[a,b,c,d],gaps=cell.slice(1).map((n,i)=>Math.abs(n-cell[i]));
          if(gaps.some(g=>g===0)||mode==='jumps'&&gaps.some(g=>g<2))continue;
          if(mode==='jumps'&&new Set(gaps).size<2)continue;
          results.push(cell.concat(cell.map(n=>n+1)));
        }
      }else if(mode==='triads'||mode==='sevenths'){
        const size=mode==='triads'?3:4,orders=size===3?PERM3:PERM4;
        for(let degree=0;degree<7;degree++){
          if(chord!=='all'&&Number(chord)!==degree)continue;
          for(let inv=0;inv<size;inv++){
            if(inversion!=='all'&&Number(inversion)!==inv)continue;
            const tones=Array.from({length:size},(_,i)=>degree+i*2);
            const voiced=tones.slice(inv).concat(tones.slice(0,inv).map(n=>n+7));
            for(const order of orders){
              const line=order.map(i=>voiced[i]);
              // Each inversion and each note ordering, through two octaves.
              results.push(line.concat(line.map(n=>n+7)));
            }
          }
        }
      }else if(['approachThirds','approachTriads','approachChords'].includes(mode)){
        for(let start=0;start<7;start++)results.push(...directionVariants(Array.from({length:4},(_,i)=>start+i),direction));
      }else if(mode==='permutation'||mode==='pivots'){
        for(let start=0;start<7;start++)for(const order of PERM4){
          const cell=order.map(n=>start+(mode==='pivots'?n*2:n));
          const line=mode==='pivots'?cell.map((n,i)=>i>1?n-7:n):cell;
          results.push(...directionVariants(line.concat(line.map(n=>n+1),line.map(n=>n+2)),direction));
        }
      }else if(mode==='pentatonicSkip'||mode==='pentatonicChords'){
        const pent=[0,1,2,4,5];
        for(const order of permutations([0,1,2,3,4],4)){
          if(mode==='pentatonicSkip'&&!order.slice(1).some((n,i)=>Math.abs(n-order[i])>1))continue;
          const cell=order.map(n=>pent[n]);results.push(...directionVariants(cell.concat(cell.map(n=>n+7)),direction));
        }
      }else if(mode==='pentatonicLinear'){
        const pent=[0,1,2,4,5];for(let start=0;start<5;start++)results.push(...directionVariants(Array.from({length:11},(_,i)=>pent[(start+i)%5]+7*Math.floor((start+i)/5)),direction));
      }else if(mode==='threeOverFour'||mode==='pentatonicThree'){
        const starts=mode==='pentatonicThree'?[0,1,2,4,5]:[0,1,2,3,4,5,6];
        for(let start=0;start<starts.length;start++)for(const order of PERM3){
          const cell=order.map(n=>starts[(start+n)%starts.length]+7*Math.floor((start+n)/starts.length));
          results.push(...directionVariants([...cell,...cell,...cell,...cell],direction));
        }
      }else{
        const gap=mode==='thirds'?2:mode==='fourths'?3:mode==='intervals'?interval-1:0;
        for(let start=0;start<7;start++){
          const line=gap||mode==='intervals'?Array.from({length:7},(_,i)=>[start+i,start+i+gap]).flat():Array.from({length:8},(_,i)=>start+i);
          results.push(...directionVariants(line,direction));
        }
      }
      return results;
    });
    let notes=degrees.map(d=>degreeEvent(root,d));
    if(mode==='threeOverFour'||mode==='pentatonicThree')notes=notes.map((n,i)=>({...n,...(i%3===0?{articulation:'accent'}:{})}));
    if(mode==='approachThirds'||mode==='approachTriads'||mode==='approachChords'){
      // Approach each root from a chromatic semitone below, then its chord tones.
      const size=mode==='approachThirds'?2:mode==='approachTriads'?3:4;
      notes=[];
      for(const start of degrees){
        const target=degreeEvent(root,start);notes.push({midi:target.midi-1,label:'aprox.'});
        for(let j=0;j<size;j++)notes.push(degreeEvent(root,start+j*2));
      }
    }
    while(Math.max(...notes.map(n=>n.midi))>108)notes=notes.map(n=>({...n,midi:n.midi-12,...(n.diatonic!==undefined?{diatonic:n.diatonic-7}:{})}));
    return figureEvents(notes,options.figure);
  }
  function motive(root,options={}){
    const transform=options.transform||'sequence';
    const degrees=chooseMaterial(`motive-${transform}`,()=>permutations([0,1,2,3,4,5,6],4).map(seed=>{
      const reply=transform==='inverse'?seed.map(n=>6-n):transform==='retrograde'?[...seed].reverse():seed.map(n=>n+1);
      return seed.concat(reply,reply.map(n=>n+2));
    }));
    return fromDegrees(root,degrees,options.figure);
  }
  function targets(root,options={}){
    const progression=options.progression||'turnaround',guide=options.guide||'arpeggios';
    const chords=progression==='diatonic'?[0,1,2,3,4,5,6]:progression==='major251'?[1,4,0]:[1,4,0,5];
    const orderCount=guide==='arpeggios'?24:2;
    // Seven-chord practice shares its ordering; progressions vary each bar independently.
    const total=progression==='diatonic'?orderCount:orderCount**chords.length;
    let code=materialIndex(`targets-${progression}-${guide}`,total);
    const notes=[];
    for(const degree of chords){
      const choice=code%orderCount;if(progression!=='diatonic')code=Math.floor(code/orderCount);
      const tones=DIATONIC[degree].degrees;
      const order=guide==='arpeggios'?PERM4[choice]:choice?[3,1,3,1]:[1,3,1,3];
      order.forEach((i,j)=>notes.push({...degreeEvent(root,tones[i]),label:j===0?DIATONIC[degree].roman:'',target:guide!=='arpeggios'}));
    }
    return figureEvents(notes,options.figure||'quarter');
  }
  function approaches(root,type='below',options={}){
    const degree=options.chord??'all';
    const variant=chooseMaterial(`approaches-${type}-${degree}`,()=>{
      const result=[];
      for(let chord=0;chord<7;chord++){
        if(degree!=='all'&&Number(degree)!==chord)continue;
        for(const order of PERM4)result.push(order.map(i=>DIATONIC[chord].degrees[i]));
      }
      return result;
    });
    const makers={below:t=>[t-1,t],above:t=>[t+1,t],enclosure:t=>[t+1,t-1,t],double:t=>[t-2,t-1,t],doubleAbove:t=>[t+2,t+1,t],enclosureReverse:t=>[t-1,t+1,t]};
    const notes=variant.flatMap(d=>{
      const target=degreeEvent(root,d),line=(makers[type]||makers.below)(target.midi);
      return line.map((midi,i)=>i===line.length-1?{...target,label:'objetivo',target:true}:{midi,label:'aprox.'});
    });
    return figureEvents(notes,options.figure||'eighth');
  }

  function rhythmPatterns(type) {
    const unique = new Map();
    function add(events) {
      if (!events.some(e => e.kind !== "rest")) return;
      let onset = 0, syncopated = false;
      for (const event of events) {
        if (event.kind !== "rest" && onset % 1 === .5 && event.beats >= 1) syncopated = true;
        onset += event.beats;
      }
      if (type === "offbeat" && !syncopated) return;
      if (type === "rests" && !events.some(e => e.kind === "rest")) return;
      if (type === "mixed" && new Set(events.filter(e => e.kind !== "rest").map(e => e.beats)).size < 2) return;
      if (type === "triplets" && !events.some(e => e.kind === "triplet")) return;
      unique.set(events.map(e => `${e.kind}:${e.beats}`).join("|"), events);
    }
    if (type === "triplets") {
      // Whole-beat cells keep every tuplet group complete and readable.
      const cells = [[{kind:"note",beats:1}], [{kind:"rest",beats:1}],
        [{kind:"note",beats:.5},{kind:"note",beats:.5}],
        [{kind:"rest",beats:.5},{kind:"note",beats:.5}],
        Array.from({length:3},(_,i)=>({kind:"triplet",beats:1/3,tuplet:i===0?"start":i===2?"stop":""}))];
      function visit(events, beat) {
        if (beat === 4) { add(events); return; }
        for (const cell of cells) {
          if (events.at(-1)?.kind === "rest" && cell[0].kind === "rest") continue;
          visit(events.concat(cell), beat + 1);
        }
      }
      visit([], 0);
    } else {
      // Exhaust all ordered combinations of eighth, quarter, dotted-quarter
      // and half notes/rests. Adjacent rests are excluded to avoid synonyms.
      function visit(events, remaining) {
        if (!remaining) { add(events); return; }
        for (const ticks of [1,2,3,4]) {
          if (ticks > remaining) continue;
          for (const kind of ["note", "rest"]) {
            if (kind === "rest" && events.at(-1)?.kind === "rest") continue;
            visit(events.concat({kind,beats:ticks/2}), remaining-ticks);
          }
        }
      }
      visit([], 8);
    }
    return [...unique.values()];
  }

  function createRhythmGenerator(options = {}) {
    const random = options.random || Math.random, decks = new Map();
    let storage = options.storage;
    if (storage === undefined) { try { storage = global.localStorage; } catch {} }
    function shuffled(length, seed, avoid) {
      const order = Array.from({length}, (_, i) => i);
      let state = seed >>> 0;
      function rand() {
        state += 0x6D2B79F5; let t = state;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      }
      for (let i = length-1; i > 0; i--) { const j = Math.floor(rand()*(i+1)); [order[i],order[j]]=[order[j],order[i]]; }
      if (order[0] === avoid && length > 1) [order[0],order[1]]=[order[1],order[0]];
      return order;
    }
    function get(type) {
      if (!["offbeat","rests","triplets","mixed"].includes(type)) type="mixed";
      if (!decks.has(type)) {
        const patterns = rhythmPatterns(type), key = `aj-improv-rhythm-v1-${type}`;
        let saved;
        try { saved=JSON.parse(storage?.getItem(key)||"null"); } catch {}
        const valid = saved && Number.isInteger(saved.seed) && saved.seed>=0 && saved.seed<=0xffffffff &&
          Number.isInteger(saved.cursor) && saved.cursor>=0 && saved.cursor<=patterns.length &&
          Number.isInteger(saved.avoid) && saved.avoid>=-1 && saved.avoid<patterns.length;
        const state = valid ? saved : {seed:Math.floor(random()*4294967296),cursor:0,avoid:-1};
        decks.set(type,{patterns,key,state,order:shuffled(patterns.length,state.seed,state.avoid)});
      }
      return decks.get(type);
    }
    return {
      next(root, type) {
        const deck=get(type), {patterns,state}=deck;
        if (state.cursor === patterns.length) {
          state.avoid=deck.order.at(-1);state.seed=Math.floor(random()*4294967296);state.cursor=0;
          deck.order=shuffled(patterns.length,state.seed,state.avoid);
        }
        const pattern=patterns[deck.order[state.cursor++]];
        try { storage?.setItem(deck.key,JSON.stringify(state)); } catch {}
        let elapsed=0;
        return pattern.map((event,index)=>{
          // Remove floating-point drift without clipping tuplet groups.
          const beats=index===pattern.length-1?4-elapsed:event.beats;elapsed+=beats;
          return {...event,beats,midi:ROOTS[root]+MAJOR[index%7],bar:0};
        });
      },
      progress(type) { const deck=get(type);return {used:deck.state.cursor,total:deck.patterns.length}; }
    };
  }
  const rhythmGenerator = createRhythmGenerator();
  function rhythm(root, type) { return rhythmGenerator.next(root,type); }
  function rhythmProgress(type) { return rhythmGenerator.progress(type); }
  function gravity(root, progression="major251", direction="down", options={}) {
    const base=ROOTS[root],maps={
      major251:[{name:"iim7 · dórico",pcs:[2,4,5,7,9,11,12,14],target:5},{name:"V7 · mixolidio",pcs:[7,9,11,12,14,16,17,19],target:11},{name:"Imaj7 · jónico",pcs:[0,2,4,5,7,9,11,12],target:12}],
      minor251:[{name:"iiø7 · locrio",pcs:[2,3,5,7,8,10,12,14],target:5},{name:"V7♭9 · frigio dominante",pcs:[7,8,11,12,14,15,17,19],target:11},{name:"im6 · menor melódica",pcs:[0,2,3,5,7,9,11,12],target:12}],
      tritone:[{name:"iim7 · dórico",pcs:[2,4,5,7,9,11,12,14],target:5},{name:"♭II7♯11 · lidio dominante",pcs:[1,3,5,7,8,10,11,13],target:5},{name:"Imaj7 · jónico",pcs:[0,2,4,5,7,9,11,12],target:12}]
    };
    const chords=maps[progression]||maps.major251,combinations=[];
    for(let a=0;a<8;a++)for(let b=a+1;b<8;b++)for(let c=b+1;c<8;c++)combinations.push([a,b,c]);
    let code=materialIndex(`gravity-${progression}-${direction}`,combinations.length**3);
    const notes=chords.flatMap(chord=>{
      const selection=combinations[code%combinations.length];code=Math.floor(code/combinations.length);
      let line=selection.map(i=>chord.pcs[i]);if(direction==='down')line.reverse();line.push(chord.target);
      return line.map((semi,i)=>({midi:base+semi,target:i===3,label:i===0?chord.name:i===3?'objetivo':''}));
    });
    return figureEvents(notes,options.figure||'quarter');
  }
  function locking(root,type="tree",shift=0){
    const offset=Math.round(Math.max(0,Math.min(1.5,Number(shift)||0))*4);
    const pattern=chooseMaterial(`locking-${type}-${offset}`,()=>{
      const values=type==='funk'?[1,2,3,4]:[2,4,6,8],result=[];
      function visit(line,remaining){
        if(!remaining){
          if(line.length<2)return;
          if(type==='charleston'&&!line.some((v,i)=>v===6&&line[i+1]===2))return;
          if(type==='reverse'&&!line.some((v,i)=>v===2&&line[i+1]===6))return;
          if(type==='funk'&&!line.some(v=>v%2))return;
          if(type==='tree'&&!line.every(v=>[2,4,8].includes(v)))return;
          if(type==='redGarland'){
            let at=offset,anticipation=false;
            for(const ticks of line){if(at%4===2&&ticks>2)anticipation=true;at+=ticks;}
            if(!anticipation)return;
          }
          result.push(line);return;
        }
        for(const ticks of values)if(ticks<=remaining)visit([...line,ticks],remaining-ticks);
      }
      visit([],(['charleston','reverse'].includes(type)?32:16)-offset);return result;
    });
    const input=(offset?[{kind:'rest',beats:offset/4}]:[]).concat(pattern.map(ticks=>({midi:ROOTS[root],beats:ticks/4})));
    const out=[];let at=0;for(const event of input){let left=event.beats,continuation=false;while(left>0){const beats=Math.min(left,4-at%4);out.push({...event,beats,bar:Math.floor(at/4),...(event.kind!=='rest'?{tied:continuation,tieStart:left>beats}:{})});left-=beats;at+=beats;continuation=true;}}return out;
  }
  global.CrescendoImprovisationEngine = { ROOTS, MODES, DIATONIC, degreeMidi, scale, motive, targets, approaches, rhythm, rhythmProgress, createRhythmGenerator, gravity, locking, figureEvents, FIGURES, materialProgress };
  if (typeof module !== "undefined") module.exports = global.CrescendoImprovisationEngine;
})(typeof window === "undefined" ? globalThis : window);
