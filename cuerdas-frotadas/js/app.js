
    /***************** Constantes de notas *************************/
    const NOTE=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

    // Cada instrumento: pitches[0] = cuerda más aguda (arriba en el dibujo) → pitches[last] = cuerda más grave (abajo)
    const INSTRUMENTS={
      violin:{label:"Violín", pitches:[76,69,62,55], names:["E","A","D","G"], primaryClef:'treble', writtenTranspose:0, family:'upper'},
      viola:{label:"Viola", pitches:[69,62,55,48], names:["A","D","G","C"], primaryClef:'alto', writtenTranspose:0, family:'upper'},
      cello:{label:"Violonchelo", pitches:[57,50,43,36], names:["A","D","G","C"], primaryClef:'bass', writtenTranspose:0, family:'cello'},
      bass:{label:"Contrabajo", pitches:[43,38,33,28], names:["G","D","A","E"], primaryClef:'bass', writtenTranspose:12, family:'bass'}
    };

    // Las líneas del tablero son referencias cromáticas, no trastes reales ni “posiciones” fijas.
    const POSITION_LABELS=["+1","+2","+3","+4","+5","+6","+7"];
    const GUIDE_COLOR={1:"#4ea1e0",3:"#6fcf5b",4:"#f2b544",6:"#f2e34f"};

    const TECH_POSITIONS={
      violin:[
        {value:'free',label:'Libre · sin digitación sugerida'},
        {value:'first',label:'1ª posición'},
        {value:'third',label:'3ª posición'},
        {value:'fifth',label:'5ª posición'}
      ],
      viola:[
        {value:'free',label:'Libre · sin digitación sugerida'},
        {value:'first',label:'1ª posición'},
        {value:'third',label:'3ª posición'},
        {value:'fifth',label:'5ª posición'}
      ],
      cello:[
        {value:'free',label:'Libre · sin digitación sugerida'},
        {value:'first',label:'1ª posición'},
        {value:'extendedFirst',label:'1ª posición extendida'},
        {value:'fourth',label:'4ª posición'},
        {value:'thumb',label:'Posición de pulgar · guía'}
      ],
      bass:[
        {value:'free',label:'Libre · sin digitación sugerida'},
        {value:'half',label:'Media posición · Simandl'},
        {value:'first',label:'1ª posición · Simandl'},
        {value:'fourth',label:'4ª posición · guía'},
        {value:'thumb',label:'Posición de pulgar · guía'}
      ]
    };

    function buildRows(numBlocks){
      const rows=[{semi:0,label:"Abierta",strong:true,color:null}];
      for(let b=0;b<numBlocks;b++){
        POSITION_LABELS.forEach((lab,idx)=>{
          rows.push({semi:7*b+idx+1,label:lab,strong:(idx in GUIDE_COLOR),color:GUIDE_COLOR[idx]||null});
        });
      }
      return rows;
    }

    const SCALE={
      mayor:[2,2,1,2,2,2,1],mayor_armonica:[2,2,1,2,1,3,1],menor_melodica:[2,1,2,2,2,2,1],menor_armonica:[2,1,2,2,1,3,1],
      jonico:[2,2,1,2,2,2,1],dorico:[2,1,2,2,2,1,2],frigio:[1,2,2,2,1,2,2],lidio:[2,2,2,1,2,2,1],mixolidio:[2,2,1,2,2,1,2],eolico:[2,1,2,2,1,2,2],locrio:[1,2,2,1,2,2,2],
      jonico_b6:[2,2,1,2,1,3,1],locrio_s2s6:[2,1,2,1,3,1,2],mixolidio_b2_s2_no4:[1,2,1,3,1,2,2],dorico_s4_s7:[2,1,3,1,2,2,1],mixolidio_b2:[1,3,1,2,2,1,2],lidio_s2_s5:[3,1,2,2,1,2,1],
      locrio_b7:[1,2,2,1,2,1,3],eolico_s7:[2,1,2,2,1,3,1],locrio_s6:[1,2,2,1,3,1,2],jonico_aumentado:[2,2,1,3,1,2,1],dorico_s4:[2,1,3,1,2,1,2],mixolidio_b2b6:[1,3,1,2,1,2,2],lidio_s2:[3,1,2,1,2,2,1],locrio_b4b7:[1,2,1,2,2,1,3],dorico_s7:[2,1,2,2,2,2,1],dorico_b2:[1,2,2,2,2,1,2],lidio_aumentado:[2,2,2,2,1,2,1],lidio_dominante:[2,2,2,1,2,1,2],mixolidio_b6:[2,2,1,2,1,2,2],locrio_s2:[2,1,2,1,2,2,2],alterado:[1,2,1,2,2,2,2],
      pentatonica_mayor:[2,2,3,2,3],pentatonica_dominante:[2,2,3,3,2],blues:[3,2,1,1,3,2],por_tonos:[2,2,2,2,2,2],
      disminuida_HW:[1,2,1,2,1,2,1,2],disminuida_WH:[2,1,2,1,2,1,2,1]
    };
    const SPECIAL=["pentatonica_mayor","blues","por_tonos"];
    const CHORD_TYPES={
      mayor:{label:"Mayor",intervals:[0,4,7],suffix:"",quality:"Tríada mayor (T-3-5)"},
      menor:{label:"Menor",intervals:[0,3,7],suffix:"m",quality:"Tríada menor (T-b3-5)"},
      aumentado:{label:"Aumentado",intervals:[0,4,8],suffix:"+",quality:"Tríada aumentada (T-3-#5)"},
      disminuido:{label:"Disminuido",intervals:[0,3,6],suffix:"°",quality:"Tríada disminuida (T-b3-b5)"},
      maj7:{label:"7M",intervals:[0,4,7,11],suffix:"7M",quality:"Séptima mayor (T-3-5-7)"},
      m7:{label:"m7",intervals:[0,3,7,10],suffix:"m7",quality:"Séptima menor (T-b3-5-b7)"},
      dom7:{label:"7",intervals:[0,4,7,10],suffix:"7",quality:"Séptima dominante (T-3-5-b7)"},
      m7b5:{label:"m7(b5)",intervals:[0,3,6,10],suffix:"m7(b5)",quality:"Semidisminuida (T-b3-b5-b7)"}
    };
    const TONE_COLORS={root:"#0f0",structural:"#08f",tension:"#f80",unavailable:"#f00"};
    const pcPattern=(root,intv)=>{const a=[root];for(let i=0;a.length<12;i++)a.push((a.at(-1)+intv[i%intv.length])%12);return a};
    const toneRole=(pc,r,pcs,spec)=>{
      const index=pcs.indexOf(pc);
      if(pc===r)return "root";
      if(spec)return index%3===0?"structural":"tension";
      if([2,4,6].includes(index))return "structural";
      if([1,3,5].includes(index))return pcs.includes((pc+11)%12)?"unavailable":"tension";
      return "unavailable";
    };
    function detectChord(pcs){
      const unique=[...new Set(pcs)];
      if(unique.length<3)return null;
      const sorted=unique.slice().sort((a,b)=>a-b);
      for(let root=0;root<12;root++){
        for(const key of Object.keys(CHORD_TYPES)){
          const def=CHORD_TYPES[key];
          if(def.intervals.length!==sorted.length)continue;
          const target=def.intervals.map(iv=>(root+iv)%12).sort((a,b)=>a-b);
          if(target.every((v,i)=>v===sorted[i]))return {root,def};
        }
      }
      return null;
    }

    /***************** DOM refs *************************/
    const $=id=>document.getElementById(id),
      instrumentSel=$("instrument"),rootSel=$("root"),chordTypeSel=$("chordType"),scaleSel=$("scale"),
      articulationSel=$("articulation"),
      orientationSel=$("orientation"), labelModeSel=$("labelMode"), keySignatureSel=$("keySignature"), spellingModeSel=$("spellingMode"), techPositionSel=$("techPosition"), techniqueStrip=$("techniqueStrip"),
      tutorPanel=$("stringsTutorPanel"), tutorEnabledEl=$("tutorEnabled"), tutorCriterionEl=$("tutorCriterion"), tutorOpenStringsEl=$("tutorOpenStrings"), tutorBowModeEl=$("tutorBowMode"), tutorPhraseLengthEl=$("tutorPhraseLength"), tutorAnalyzeBtn=$("tutorAnalyzeBtn"),
      tutorStepEl=$("tutorStep"), tutorNoteEl=$("tutorNote"), tutorStringEl=$("tutorString"), tutorFingerEl=$("tutorFinger"), tutorPositionEl=$("tutorPosition"), tutorBowEl=$("tutorBow"), tutorTechniqueEl=$("tutorTechnique"), tutorStatusEl=$("tutorStatus"),
      bowPracticePanel=$("bowPracticePanel"), bowPracticeStart=$("bowPracticeStart"), bowTechniqueEl=$("bowTechnique"), bowDirectionEl=$("bowDirection"), bowStringPatternEl=$("bowStringPattern"), bowStrokesPerPulseEl=$("bowStrokesPerPulse"), bowDistributionEl=$("bowDistribution"), bowMeasuresEl=$("bowMeasures"),
      bowPracticeStepEl=$("bowPracticeStep"), bowPracticeDirectionEl=$("bowPracticeDirection"), bowPracticeStringEl=$("bowPracticeString"), bowPracticeDistributionEl=$("bowPracticeDistribution"), bowPracticeTechniqueEl=$("bowPracticeTechnique"), bowPracticeGuideEl=$("bowPracticeGuide"), bowPracticeStatusEl=$("bowPracticeStatus"),
      intonationPanel=$("intonationPanel"), intonationMicBtn=$("intonationMicBtn"), intonationTargetModeEl=$("intonationTargetMode"), intonationStringEl=$("intonationString"), intonationNoteEl=$("intonationNote"), intonationA4El=$("intonationA4"), intonationToleranceEl=$("intonationTolerance"), intonationDroneModeEl=$("intonationDroneMode"), intonationReferenceBtn=$("intonationReferenceBtn"), intonationDroneBtn=$("intonationDroneBtn"), intonationTargetLabel=$("intonationTargetLabel"), intonationTargetHz=$("intonationTargetHz"), intonationDetectedLabel=$("intonationDetectedLabel"), intonationCents=$("intonationCents"), intonationNeedle=$("intonationNeedle"), intonationFeedback=$("intonationFeedback"), intonationShiftEl=$("intonationShift"), intonationShiftBtn=$("intonationShiftBtn"), intonationShiftGuide=$("intonationShiftGuide"), intonationStatus=$("intonationStatus"),
      shiftPracticePanel=$("shiftPracticePanel"), shiftPracticeStart=$("shiftPracticeStart"), shiftStringEl=$("shiftString"), shiftOriginEl=$("shiftOrigin"), shiftDestinationEl=$("shiftDestination"), shiftGuideFingerEl=$("shiftGuideFinger"), shiftMotionEl=$("shiftMotion"), shiftBowEl=$("shiftBow"), shiftRepetitionsEl=$("shiftRepetitions"), shiftUseIntonationEl=$("shiftUseIntonation"), shiftStepEl=$("shiftStep"), shiftOriginReadout=$("shiftOriginReadout"), shiftDestinationReadout=$("shiftDestinationReadout"), shiftFingerReadout=$("shiftFingerReadout"), shiftBowReadout=$("shiftBowReadout"), shiftPlayOrigin=$("shiftPlayOrigin"), shiftPlayDestination=$("shiftPlayDestination"), shiftSendToIntonation=$("shiftSendToIntonation"), shiftPracticeGuide=$("shiftPracticeGuide"), shiftPracticeStatus=$("shiftPracticeStatus"),
      doubleStopPanel=$("doubleStopPanel"), doubleStopAnalyze=$("doubleStopAnalyze"), doubleStopPairEl=$("doubleStopPair"), doubleStopIntervalEl=$("doubleStopInterval"), doubleStopTemperamentEl=$("doubleStopTemperament"), doubleStopZoneEl=$("doubleStopZone"), doubleStopDroneModeEl=$("doubleStopDroneMode"), doubleStopLowerEl=$("doubleStopLower"), doubleStopUpperEl=$("doubleStopUpper"), doubleStopFingeringEl=$("doubleStopFingering"), doubleStopCentsEl=$("doubleStopCents"), doubleStopRatioEl=$("doubleStopRatio"), doubleStopPlayLower=$("doubleStopPlayLower"), doubleStopPlayUpper=$("doubleStopPlayUpper"), doubleStopPlayTogether=$("doubleStopPlayTogether"), doubleStopDrone=$("doubleStopDrone"), doubleStopTuneLower=$("doubleStopTuneLower"), doubleStopTuneUpper=$("doubleStopTuneUpper"), doubleStopGuide=$("doubleStopGuide"), doubleStopStatus=$("doubleStopStatus"),
      scalePracticePanel=$("scalePracticePanel"), scalePracticeBuild=$("scalePracticeBuild"), scalePracticeKindEl=$("scalePracticeKind"), scalePracticeOctavesEl=$("scalePracticeOctaves"), scalePracticeDirectionEl=$("scalePracticeDirection"), scalePracticeCriterionEl=$("scalePracticeCriterion"), scalePracticeBowEl=$("scalePracticeBow"), scalePracticeSubdivisionEl=$("scalePracticeSubdivision"), scalePracticeStart=$("scalePracticeStart"), scalePracticePlay=$("scalePracticePlay"), scalePracticeStepEl=$("scalePracticeStep"), scalePracticeNoteEl=$("scalePracticeNote"), scalePracticeStringEl=$("scalePracticeString"), scalePracticeFingerEl=$("scalePracticeFinger"), scalePracticePositionEl=$("scalePracticePosition"), scalePracticeBowReadout=$("scalePracticeBowReadout"), scalePracticeGuide=$("scalePracticeGuide"), scalePracticeStatus=$("scalePracticeStatus"),
      technicalPatternsPanel=$("technicalPatternsPanel"), technicalPatternBuild=$("technicalPatternBuild"), technicalPatternMaterialEl=$("technicalPatternMaterial"), technicalPatternTypeEl=$("technicalPatternType"), technicalPatternOctavesEl=$("technicalPatternOctaves"), technicalPatternDirectionEl=$("technicalPatternDirection"), technicalPatternBowEl=$("technicalPatternBow"), technicalPatternSubdivisionEl=$("technicalPatternSubdivision"), technicalPatternStart=$("technicalPatternStart"), technicalPatternPlay=$("technicalPatternPlay"), technicalPatternStepEl=$("technicalPatternStep"), technicalPatternNoteEl=$("technicalPatternNote"), technicalPatternStringEl=$("technicalPatternString"), technicalPatternFingerEl=$("technicalPatternFinger"), technicalPatternPositionEl=$("technicalPatternPosition"), technicalPatternBowReadout=$("technicalPatternBowReadout"), technicalPatternGuide=$("technicalPatternGuide"), technicalPatternStatus=$("technicalPatternStatus"),
      rhythmPrecisionPanel=$("rhythmPrecisionPanel"), rhythmStart=$("rhythmStart"), rhythmPatternEl=$("rhythmPattern"), rhythmAccentsEl=$("rhythmAccents"), rhythmBowEl=$("rhythmBow"), rhythmMeasuresEl=$("rhythmMeasures"), rhythmToleranceEl=$("rhythmTolerance"), rhythmTap=$("rhythmTap"), rhythmStop=$("rhythmStop"), rhythmTargetEl=$("rhythmTarget"), rhythmDeltaEl=$("rhythmDelta"), rhythmMeanErrorEl=$("rhythmMeanError"), rhythmAccuracyEl=$("rhythmAccuracy"), rhythmStreakEl=$("rhythmStreak"), rhythmBowReadoutEl=$("rhythmBowReadout"), rhythmTimingNeedle=$("rhythmTimingNeedle"), rhythmGuide=$("rhythmGuide"), rhythmStatus=$("rhythmStatus"),
      minus=$("minus"),plus=$("plus"),posVal=$("posVal"),
      cvs=$("board"),ctx=cvs.getContext("2d"),
      legendButtons=[...document.querySelectorAll("[data-tone-filter]")],
      clearSelectionBtn=$("clearSelectionBtn"),clearAllBtn=$("clearAllBtn"),
      chordSymbolEl=$("chordSymbol"),chordQualityEl=$("chordQualityLabel"),
      muteBtn=$("muteBtn"),volumeSlider=$("volume"),soundSourceIndicator=$("soundSourceIndicator");

    Object.entries(INSTRUMENTS).forEach(([key,ins])=>instrumentSel.add(new Option(ins.label,key)));
    rootSel.add(new Option("— Ninguna —",""));
    NOTE.forEach(n=>rootSel.add(new Option(n,n)));
    scaleSel.add(new Option("— Ninguna —",""));
    Object.keys(SCALE).forEach(k=>scaleSel.add(new Option(k.replace(/_/g,' '),k)));
    chordTypeSel.add(new Option("— Ninguna —",""));
    Object.entries(CHORD_TYPES).forEach(([k,d])=>chordTypeSel.add(new Option(d.label,k)));
    rootSel.value="";scaleSel.value="";chordTypeSel.value="";
    populateTechniquePositions();

    /***************** Estado *************************/
    let numBlocks=2;
    const toneVisibility={root:true,structural:true,tension:true,unavailable:true};
    const manualSelections=new Set(); // "s-rowIndex"
    let hoverCell=null;
    const blankMode=()=>rootSel.value===""||(chordTypeSel.value===""&&scaleSel.value==="");
    const activeInstrument=()=>INSTRUMENTS[instrumentSel.value]||INSTRUMENTS.violin;
    const activePitches=()=>activeInstrument().pitches;
    const scoreMidiToSounding=midi=>midi-(activeInstrument().writtenTranspose||0);

    function populateTechniquePositions(keep){
      if(!techPositionSel)return;
      const options=TECH_POSITIONS[instrumentSel.value]||TECH_POSITIONS.violin;
      const wanted=keep||techPositionSel.value;
      techPositionSel.length=0;
      options.forEach(o=>techPositionSel.add(new Option(o.label,o.value)));
      techPositionSel.value=options.some(o=>o.value===wanted)?wanted:(options[1]?.value||options[0].value);
    }

    function suggestedFinger(semi){
      if(!techPositionSel || techPositionSel.value==='free' || semi===0)return semi===0?'0':'';
      const p=techPositionSel.value, key=instrumentSel.value;
      const maps={
        upper:{
          first:[[1,1],[2,1],[3,2],[4,2],[5,3],[6,3],[7,4]],
          third:[[5,1],[6,1],[7,2],[8,2],[9,3],[10,3],[11,4]],
          fifth:[[9,1],[10,1],[11,2],[12,2],[13,3],[14,3],[15,4]]
        },
        cello:{
          first:[[2,1],[3,2],[4,3],[5,4]],
          extendedFirst:[[1,1],[2,1],[3,2],[4,3],[5,4],[6,4]],
          fourth:[[5,1],[6,2],[7,3],[8,4]],
          thumb:[[12,'T'],[13,1],[14,2],[15,3],[16,3]]
        },
        bass:{
          half:[[1,1],[2,2],[3,4]],
          first:[[2,1],[3,2],[4,4]],
          fourth:[[5,1],[6,2],[7,4]],
          thumb:[[12,'T'],[13,1],[14,2],[15,3]]
        }
      };
      const family=activeInstrument().family;
      const entries=(family==='upper'?maps.upper[p]:maps[family]?.[p])||[];
      // admitir la misma forma una octava más arriba para ejercicios extensos
      const candidates=[semi,semi-12,semi-24].filter(v=>v>=0);
      for(const v of candidates){
        const hit=entries.find(([x])=>x===v);
        if(hit)return String(hit[1]);
      }
      return '';
    }

    function techniqueDescription(activeClef){
      const ins=activeInstrument();
      const pos=techPositionSel?.selectedOptions?.[0]?.textContent||'Libre';
      const clef=activeClef||chooseStaffClef([]);
      const clefName={treble:'Sol',alto:'Do en 3ª',tenor:'Do en 4ª',bass:'Fa'}[clef]||clef;
      const trans=ins.writtenTranspose?` · escritura +${ins.writtenTranspose} semitonos respecto al sonido`:'';
      return `<strong>${ins.label}</strong> · Afinación ${ins.names.slice().reverse().join('–')} · ${pos} · Clave ${clefName}${trans}`;
    }



    /***************** Escalas y arpegios digitados *************************/
    let scalePracticePlan=[];
    let scalePracticeIndex=-1;
    let scalePracticeRunning=false;
    let scalePracticeTimer=null;

    function scaleOffsetsFromSteps(steps){
      const out=[0];let sum=0;
      for(const step of steps||[]){sum+=step;if(sum<=12)out.push(sum);}
      if(out.at(-1)!==12)out.push(12);
      return [...new Set(out)];
    }
    function practiceMaterialOffsets(){
      const kind=scalePracticeKindEl?.value||'scale';
      if(kind==='arpeggio'){
        const key=chordTypeSel.value;
        const def=CHORD_TYPES[key];
        if(!def)return null;
        return [...def.intervals,12];
      }
      const steps=SCALE[scaleSel.value];
      if(!steps)return null;
      return scaleOffsetsFromSteps(steps);
    }
    function practiceCandidateCost(c){
      let cost=c.localCost||0;
      const wanted=techPositionSel?.value||'free';
      if(wanted!=='free'&&c.position!==wanted&&c.position!=='open')cost+=3;
      if(c.semi===0)cost+=.35;
      return cost;
    }
    function scalePracticeTransitionCost(a,b){
      if(!a||!b)return 0;
      let c=Math.abs(a.string-b.string)*1.5+Math.abs(a.semi-b.semi)*.12;
      if(a.position!==b.position)c+=2.3;
      const criterion=scalePracticeCriterionEl?.value||'position';
      if(criterion==='string')c+=Math.abs(a.string-b.string)*3.5;
      if(criterion==='position'&&a.position!==b.position)c+=3.3;
      if(criterion==='compact')c+=Math.abs(a.semi-b.semi)*.22;
      return c;
    }
    function routeForPracticeMidis(midis){
      const layers=(midis||[]).map(m=>candidatesForTutorNote({midi:m,explicitString:'',explicitFinger:'',technique:[],bow:''}).slice(0,18));
      if(layers.some(x=>!x.length))return [];
      const dp=layers.map((layer,i)=>layer.map(c=>({c,total:practiceCandidateCost(c),prev:-1})));
      for(let i=1;i<dp.length;i++){
        dp[i].forEach(node=>{
          let best=Infinity,bestIdx=-1;
          dp[i-1].forEach((prev,pi)=>{
            const total=prev.total+practiceCandidateCost(node.c)+scalePracticeTransitionCost(prev.c,node.c);
            if(total<best){best=total;bestIdx=pi;}
          });
          node.total=best;node.prev=bestIdx;
        });
      }
      let idx=dp.at(-1).reduce((best,n,i,a)=>n.total<a[best].total?i:best,0);
      const route=new Array(dp.length);
      for(let i=dp.length-1;i>=0;i--){route[i]=dp[i][idx].c;idx=dp[i][idx].prev<0?0:dp[i][idx].prev;}
      return route;
    }
    function buildScalePracticePlan(){
      scalePracticeRunning=false; scalePracticePanel?.classList.remove('is-running');
      if(scalePracticeTimer){clearTimeout(scalePracticeTimer);scalePracticeTimer=null;}
      const rootPc=NOTE.indexOf(rootSel.value);
      if(rootPc<0){scalePracticeStatus.textContent='Selecciona primero una fundamental.';scalePracticePlan=[];draw();return []}
      const offsets=practiceMaterialOffsets();
      if(!offsets){scalePracticeStatus.textContent=(scalePracticeKindEl?.value==='arpeggio')?'Selecciona primero un acorde/arpegio.':'Selecciona primero una escala o modo.';scalePracticePlan=[];draw();return []}
      const octaves=Math.max(1,Math.min(3,+(scalePracticeOctavesEl?.value||2)));
      const minMidi=Math.min(...activePitches()), maxMidi=Math.max(...activePitches())+28;
      const roots=[];for(let m=minMidi;m<=maxMidi;m++)if(((m%12)+12)%12===rootPc)roots.push(m);
      let best=[];
      for(const start of roots){
        const asc=[];
        for(let o=0;o<octaves;o++)offsets.forEach((iv,idx)=>{if(o>0&&idx===0)return;asc.push(start+o*12+iv)});
        if(asc.at(-1)>maxMidi)continue;
        const route=routeForPracticeMidis(asc);if(route.length===asc.length){best=route;break;}
      }
      if(!best.length){scalePracticeStatus.textContent='No encontré una ruta completa en el rango actual. Prueba menos octavas o amplía el diapasón.';scalePracticePlan=[];draw();return []}
      const direction=scalePracticeDirectionEl?.value||'updown';
      if(direction==='down')best=best.slice().reverse();
      if(direction==='updown')best=best.concat(best.slice(0,-1).reverse());
      scalePracticePlan=best.map((rec,i)=>({...rec,bow:scalePracticeBowForStep(i)}));
      scalePracticeIndex=0;renderScalePracticeStep();draw();
      const kind=scalePracticeKindEl?.value==='arpeggio'?'Arpegio':'Escala';
      scalePracticeStatus.textContent=`${kind} preparada · ${scalePracticePlan.length} notas · ${activeInstrument().label}.`;
      return scalePracticePlan;
    }
    function scalePracticeBowForStep(i){
      const mode=scalePracticeBowEl?.value||'alternate';
      if(mode==='free')return 'Libre';
      if(mode==='alternate')return i%2===0?'↓':'↑';
      const n=mode==='slur4'?4:2, group=Math.floor(i/n);
      return `${group%2===0?'↓':'↑'} · ${n} ligadas`;
    }
    function renderScalePracticeStep(){
      const r=scalePracticePlan[scalePracticeIndex];
      if(!r){scalePracticeStepEl.textContent='—';scalePracticeNoteEl.textContent='—';scalePracticeStringEl.textContent='—';scalePracticeFingerEl.textContent='—';scalePracticePositionEl.textContent='—';scalePracticeBowReadout.textContent='—';return;}
      scalePracticeStepEl.textContent=`${scalePracticeIndex+1} / ${scalePracticePlan.length}`;
      scalePracticeNoteEl.textContent=midiLabel(r.midi);
      scalePracticeStringEl.textContent=`${r.string+1}ª`;
      scalePracticeFingerEl.textContent=r.finger||'—';
      scalePracticePositionEl.textContent=r.positionLabel||'Libre';
      scalePracticeBowReadout.textContent=r.bow||'Libre';
      scalePracticeGuide.textContent=`Toca ${midiLabel(r.midi)} · cuerda ${r.string+1} · ${r.finger?`dedo ${r.finger}`:'sin dedo sugerido'} · ${r.positionLabel||'posición libre'}.`;
    }
    function handleScalePracticeClick(cell){
      const r=scalePracticePlan[scalePracticeIndex];if(!r)return;
      const semi=rowsList()[cell.i].semi, midi=activePitches()[cell.s]+semi;playNote(midi,1.05);
      if(cell.s!==r.string||semi!==r.semi){scalePracticeStatus.textContent=`Aún no · busca ${midiLabel(r.midi)} en cuerda ${r.string+1}.`;return;}
      scalePracticeStatus.textContent='Correcto · siguiente nota';
      if(scalePracticeIndex<scalePracticePlan.length-1){scalePracticeIndex++;renderScalePracticeStep();draw();}
      else{scalePracticeRunning=false;scalePracticePanel?.classList.remove('is-running');scalePracticeStatus.textContent='Ruta completada.';draw();}
    }
    function startScalePractice(){
      if(!scalePracticePlan.length)buildScalePracticePlan();
      if(!scalePracticePlan.length)return;
      scalePracticeRunning=true;scalePracticeIndex=0;scalePracticePanel?.classList.add('is-running');renderScalePracticeStep();draw();
      scalePracticeStatus.textContent='Tutor activo · toca/clickea la posición resaltada.';
    }
    function playScalePracticeRoute(){
      if(!scalePracticePlan.length)buildScalePracticePlan();if(!scalePracticePlan.length)return;
      if(scalePracticeTimer){clearTimeout(scalePracticeTimer);scalePracticeTimer=null;}
      let i=0;const subdivision=Math.max(1,+(scalePracticeSubdivisionEl?.value||2));
      const bpm=Math.max(30,Math.min(300,+(document.getElementById('metroBpmValue')?.textContent||90)));
      const gap=60000/bpm/subdivision;
      const tick=()=>{if(i>=scalePracticePlan.length){scalePracticeStatus.textContent='Reproducción de la ruta completada.';return;}const r=scalePracticePlan[i];scalePracticeIndex=i;renderScalePracticeStep();draw();playNote(r.midi,Math.max(.25,gap/1000*.85));i++;scalePracticeTimer=setTimeout(tick,gap)};tick();
    }
    if(scalePracticeBuild)scalePracticeBuild.addEventListener('click',buildScalePracticePlan);
    if(scalePracticeStart)scalePracticeStart.addEventListener('click',startScalePractice);
    if(scalePracticePlay)scalePracticePlay.addEventListener('click',playScalePracticeRoute);
    [scalePracticeKindEl,scalePracticeOctavesEl,scalePracticeDirectionEl,scalePracticeCriterionEl,scalePracticeBowEl].filter(Boolean).forEach(el=>el.addEventListener('change',()=>{scalePracticePlan=[];scalePracticeRunning=false;scalePracticePanel?.classList.remove('is-running');draw();}));


    /***************** Secuencias y patrones técnicos *************************/
    let technicalPatternPlan=[];
    let technicalPatternIndex=-1;
    let technicalPatternRunning=false;
    let technicalPatternTimer=null;

    function technicalMaterialOffsets(){
      const kind=technicalPatternMaterialEl?.value||'scale';
      if(kind==='arpeggio'){
        const def=CHORD_TYPES[chordTypeSel.value];
        return def?[...def.intervals,12]:null;
      }
      const steps=SCALE[scaleSel.value];
      return steps?scaleOffsetsFromSteps(steps):null;
    }
    function buildTechnicalBaseMidis(){
      const rootPc=NOTE.indexOf(rootSel.value);if(rootPc<0)return [];
      const offsets=technicalMaterialOffsets();if(!offsets)return [];
      const octaves=Math.max(1,Math.min(3,+(technicalPatternOctavesEl?.value||2)));
      const minMidi=Math.min(...activePitches()), maxMidi=Math.max(...activePitches())+28;
      for(let start=minMidi;start<=maxMidi;start++){
        if(((start%12)+12)%12!==rootPc)continue;
        const arr=[];
        for(let o=0;o<octaves;o++)offsets.forEach((iv,idx)=>{if(o>0&&idx===0)return;arr.push(start+o*12+iv)});
        if(arr.length&&arr.at(-1)<=maxMidi)return arr;
      }
      return [];
    }
    function transformTechnicalPattern(base,type){
      const out=[];
      if(type==='thirds'){
        for(let i=0;i+2<base.length;i++){out.push(base[i],base[i+2]);}
      }else if(type==='groups3'){
        for(let i=0;i+2<base.length;i++)out.push(base[i],base[i+1],base[i+2]);
      }else if(type==='groups4'){
        for(let i=0;i+3<base.length;i++)out.push(base[i],base[i+1],base[i+2],base[i+3]);
      }else if(type==='1231'){
        for(let i=0;i+2<base.length;i++)out.push(base[i],base[i+1],base[i+2],base[i]);
      }else if(type==='broken'){
        for(let i=0;i+3<base.length;i+=3)out.push(base[i],base[i+2],base[i+1],base[i+3]);
      }else{
        out.push(...base);
      }
      return out;
    }
    function technicalBowForStep(i){
      const mode=technicalPatternBowEl?.value||'alternate';
      if(mode==='free')return 'Libre';
      if(mode==='alternate')return i%2===0?'↓':'↑';
      const n=mode==='slur4'?4:mode==='slur3'?3:2, group=Math.floor(i/n);
      return `${group%2===0?'↓':'↑'} · ${n} ligadas`;
    }
    function technicalTransitionCost(a,b,stepIndex,type){
      if(!a||!b)return 0;
      let cost=Math.abs(a.semi-b.semi)*.11 + Math.abs(a.string-b.string)*1.45;
      if(a.position!==b.position)cost+=2.15;
      if(type==='crossing'){
        const desired=(stepIndex%2===1)?1:0;
        const change=Math.abs(a.string-b.string);
        if(desired&&change===0)cost+=5.5;
        if(change>1)cost+=2.2*(change-1);
      }
      return cost;
    }
    function routeTechnicalMidis(midis,type){
      const layers=(midis||[]).map(m=>candidatesForTutorNote({midi:m,explicitString:'',explicitFinger:'',technique:[],bow:''}).slice(0,20));
      if(layers.some(x=>!x.length))return [];
      const dp=layers.map(layer=>layer.map(c=>({c,total:practiceCandidateCost(c),prev:-1})));
      for(let i=1;i<dp.length;i++){
        dp[i].forEach(node=>{
          let best=Infinity,bestIdx=-1;
          dp[i-1].forEach((prev,pi)=>{
            const total=prev.total+practiceCandidateCost(node.c)+technicalTransitionCost(prev.c,node.c,i,type);
            if(total<best){best=total;bestIdx=pi;}
          });
          node.total=best;node.prev=bestIdx;
        });
      }
      let idx=dp.at(-1).reduce((best,n,i,a)=>n.total<a[best].total?i:best,0);
      const route=new Array(dp.length);
      for(let i=dp.length-1;i>=0;i--){route[i]=dp[i][idx].c;idx=dp[i][idx].prev<0?0:dp[i][idx].prev;}
      return route;
    }
    function buildTechnicalPattern(){
      technicalPatternRunning=false;technicalPatternsPanel?.classList.remove('is-running');
      if(technicalPatternTimer){clearTimeout(technicalPatternTimer);technicalPatternTimer=null;}
      if(NOTE.indexOf(rootSel.value)<0){technicalPatternStatus.textContent='Selecciona primero una fundamental.';technicalPatternPlan=[];draw();return []}
      const base=buildTechnicalBaseMidis();
      if(!base.length){technicalPatternStatus.textContent=(technicalPatternMaterialEl?.value==='arpeggio')?'Selecciona un arpegio válido y una extensión posible.':'Selecciona una escala válida y una extensión posible.';technicalPatternPlan=[];draw();return []}
      const type=technicalPatternTypeEl?.value||'thirds';
      let seq=transformTechnicalPattern(base,type);
      if(!seq.length){technicalPatternStatus.textContent='No hay suficientes notas para construir este patrón.';technicalPatternPlan=[];draw();return []}
      const direction=technicalPatternDirectionEl?.value||'updown';
      if(direction==='down')seq=seq.slice().reverse();
      if(direction==='updown')seq=seq.concat(seq.slice(0,-1).reverse());
      const route=routeTechnicalMidis(seq,type);
      if(route.length!==seq.length){technicalPatternStatus.textContent='No encontré una digitación completa. Reduce la extensión o cambia de patrón.';technicalPatternPlan=[];draw();return []}
      technicalPatternPlan=route.map((rec,i)=>({...rec,bow:technicalBowForStep(i)}));
      technicalPatternIndex=0;renderTechnicalPatternStep();draw();
      const names={thirds:'terceras',groups3:'grupos de 3',groups4:'grupos de 4','1231':'1–2–3–1',broken:'arpegio quebrado',crossing:'cruces de cuerda'};
      technicalPatternStatus.textContent=`Patrón ${names[type]||type} preparado · ${technicalPatternPlan.length} notas.`;
      return technicalPatternPlan;
    }
    function renderTechnicalPatternStep(){
      const r=technicalPatternPlan[technicalPatternIndex];
      if(!r){[technicalPatternStepEl,technicalPatternNoteEl,technicalPatternStringEl,technicalPatternFingerEl,technicalPatternPositionEl,technicalPatternBowReadout].forEach(el=>{if(el)el.textContent='—'});return;}
      technicalPatternStepEl.textContent=`${technicalPatternIndex+1} / ${technicalPatternPlan.length}`;
      technicalPatternNoteEl.textContent=midiLabel(r.midi);
      technicalPatternStringEl.textContent=`${r.string+1}ª`;
      technicalPatternFingerEl.textContent=r.finger||'—';
      technicalPatternPositionEl.textContent=r.positionLabel||'Libre';
      technicalPatternBowReadout.textContent=r.bow||'Libre';
      technicalPatternGuide.textContent=`Toca ${midiLabel(r.midi)} · cuerda ${r.string+1} · ${r.finger?`dedo ${r.finger}`:'sin dedo sugerido'} · ${r.bow||'arco libre'}.`;
    }
    function handleTechnicalPatternClick(cell){
      const r=technicalPatternPlan[technicalPatternIndex];if(!r)return;
      const semi=rowsList()[cell.i].semi,midi=activePitches()[cell.s]+semi;playNote(midi,1.0);
      if(cell.s!==r.string||semi!==r.semi){technicalPatternStatus.textContent=`Aún no · busca ${midiLabel(r.midi)} en cuerda ${r.string+1}.`;return;}
      if(technicalPatternIndex<technicalPatternPlan.length-1){technicalPatternIndex++;renderTechnicalPatternStep();technicalPatternStatus.textContent='Correcto · siguiente nota';draw();}
      else{technicalPatternRunning=false;technicalPatternsPanel?.classList.remove('is-running');technicalPatternStatus.textContent='Patrón completado.';draw();}
    }
    function startTechnicalPattern(){
      if(!technicalPatternPlan.length)buildTechnicalPattern();if(!technicalPatternPlan.length)return;
      technicalPatternRunning=true;technicalPatternIndex=0;technicalPatternsPanel?.classList.add('is-running');renderTechnicalPatternStep();draw();technicalPatternStatus.textContent='Tutor activo · sigue la secuencia resaltada.';
    }
    function playTechnicalPattern(){
      if(!technicalPatternPlan.length)buildTechnicalPattern();if(!technicalPatternPlan.length)return;
      if(technicalPatternTimer){clearTimeout(technicalPatternTimer);technicalPatternTimer=null;}
      let i=0;const subdivision=Math.max(1,+(technicalPatternSubdivisionEl?.value||2));
      const bpm=Math.max(30,Math.min(300,+(document.getElementById('metroBpmValue')?.textContent||90)));const gap=60000/bpm/subdivision;
      const tick=()=>{if(i>=technicalPatternPlan.length){technicalPatternStatus.textContent='Reproducción del patrón completada.';return;}const r=technicalPatternPlan[i];technicalPatternIndex=i;renderTechnicalPatternStep();draw();playNote(r.midi,Math.max(.22,gap/1000*.82));i++;technicalPatternTimer=setTimeout(tick,gap)};tick();
    }
    if(technicalPatternBuild)technicalPatternBuild.addEventListener('click',buildTechnicalPattern);
    if(technicalPatternStart)technicalPatternStart.addEventListener('click',startTechnicalPattern);
    if(technicalPatternPlay)technicalPatternPlay.addEventListener('click',playTechnicalPattern);
    [technicalPatternMaterialEl,technicalPatternTypeEl,technicalPatternOctavesEl,technicalPatternDirectionEl,technicalPatternBowEl].filter(Boolean).forEach(el=>el.addEventListener('change',()=>{technicalPatternPlan=[];technicalPatternRunning=false;technicalPatternsPanel?.classList.remove('is-running');draw();}));


    /***************** Precisión rítmica y coordinación de arco *************************/
    let rhythmRunning=false, rhythmPulseUnsub=null, rhythmExpected=[], rhythmErrors=[], rhythmTotalExpected=0, rhythmPulseCount=0, rhythmHitCount=0, rhythmMissCount=0, rhythmStreak=0, rhythmBestStreak=0, rhythmStartedMetro=false, rhythmFinishTimer=null, rhythmAttackIndex=0;
    function rhythmFractionsForPulse(pulseIndex){
      const mode=rhythmPatternEl?.value||'eighths';
      if(mode==='quarters')return [0];
      if(mode==='eighths')return [0,.5];
      if(mode==='triplets')return [0,1/3,2/3];
      if(mode==='sixteenths')return [0,.25,.5,.75];
      if(mode==='syncopation')return [0,.75];
      const cycle=pulseIndex%4; return cycle===0?[0]:cycle===1?[0,.5]:cycle===2?[0,1/3,2/3]:[0,.25,.5,.75];
    }
    function rhythmAccentFor(attackIndex, beatNumber, fraction){
      const mode=rhythmAccentsEl?.value||'bar';
      if(mode==='none')return false;
      if(mode==='bar')return beatNumber===1&&fraction===0;
      if(mode==='twoFour')return (beatNumber===2||beatNumber===4)&&fraction===0;
      if(mode==='offbeat')return fraction>0;
      if(mode==='every3')return attackIndex%3===0;
      return false;
    }
    function rhythmBowFor(attackIndex,accent){
      const mode=rhythmBowEl?.value||'alternate';
      if(mode==='free')return 'Libre';
      if(mode==='accentDown'&&accent)return '↓';
      if(mode==='slur2')return `${Math.floor(attackIndex/2)%2===0?'↓':'↑'} · ${attackIndex%2===0?'inicio':'fin'} de ligadura`;
      return attackIndex%2===0?'↓':'↑';
    }
    function rhythmPruneMisses(now=performance.now()){
      const tol=Math.max(30,+(rhythmToleranceEl?.value||60));
      rhythmExpected.forEach(e=>{if(!e.hit&&!e.missed&&now-e.time>tol){e.missed=true;rhythmMissCount++;rhythmStreak=0;}});
    }
    function rhythmMetrics(){
      const mean=rhythmErrors.length?rhythmErrors.reduce((a,b)=>a+Math.abs(b),0)/rhythmErrors.length:0;
      const attempts=rhythmHitCount+rhythmMissCount; const hitRate=rhythmTotalExpected?rhythmHitCount/rhythmTotalExpected:0;
      const tol=Math.max(30,+(rhythmToleranceEl?.value||60)); const timing=rhythmErrors.length?Math.max(0,1-mean/(tol*1.5)):0;
      const accuracy=Math.round(100*(.55*hitRate+.45*timing));
      if(rhythmMeanErrorEl)rhythmMeanErrorEl.textContent=rhythmErrors.length?`${mean.toFixed(1)} ms`:'—';
      if(rhythmAccuracyEl)rhythmAccuracyEl.textContent=rhythmErrors.length?`${Math.max(0,Math.min(100,accuracy))}%`:'—';
      if(rhythmStreakEl)rhythmStreakEl.textContent=String(rhythmStreak);
      return {mean,accuracy,attempts};
    }
    function rhythmUpdateNext(){
      const next=rhythmExpected.find(e=>!e.hit&&!e.missed);
      if(!next){if(rhythmTargetEl)rhythmTargetEl.textContent='—';if(rhythmBowReadoutEl)rhythmBowReadoutEl.textContent='—';return;}
      if(rhythmTargetEl)rhythmTargetEl.textContent=`${next.label}${next.accent?' · acento':''}`;
      if(rhythmBowReadoutEl)rhythmBowReadoutEl.textContent=next.bow;
      rhythmTap?.classList.toggle('is-accent',!!next.accent);
    }
    function rhythmOnPulse(info){
      if(!rhythmRunning)return;
      rhythmPruneMisses();
      const measures=Math.max(1,+(rhythmMeasuresEl?.value||4));
      const maxPulses=measures*info.beats;
      if(rhythmPulseCount>=maxPulses)return;
      const now=performance.now(), pulseMs=info.secondsPerPulse*1000, fractions=rhythmFractionsForPulse(rhythmPulseCount);
      fractions.forEach((fraction,j)=>{
        const idx=rhythmAttackIndex++, accent=rhythmAccentFor(idx,info.beatNumber,fraction), bow=rhythmBowFor(idx,accent);
        rhythmExpected.push({time:now+fraction*pulseMs,hit:false,missed:false,accent,bow,label:`${info.beatNumber}${fraction===0?'':fraction===.5?' +':fraction===.75?' a':fraction===1/3?' tri-2':fraction===2/3?' tri-3':fraction===.25?' e':' &'} `});
        rhythmTotalExpected++;
      });
      rhythmPulseCount++;rhythmUpdateNext();rhythmMetrics();
      if(rhythmPulseCount===maxPulses){clearTimeout(rhythmFinishTimer);rhythmFinishTimer=setTimeout(()=>finishRhythmExercise(false),pulseMs+Math.max(120,+(rhythmToleranceEl?.value||60)+30));}
    }
    function registerRhythmAttack(){
      if(!rhythmRunning){rhythmStatus.textContent='Inicia primero el ejercicio.';return;}
      const now=performance.now();rhythmPruneMisses(now);const tol=Math.max(30,+(rhythmToleranceEl?.value||60));
      const candidates=rhythmExpected.filter(e=>!e.hit&&!e.missed&&Math.abs(now-e.time)<=Math.max(180,tol*2.2));
      if(!candidates.length){rhythmDeltaEl.textContent='fuera';rhythmStatus.textContent='Ataque fuera de la ventana esperada.';rhythmStreak=0;rhythmMetrics();return;}
      const e=candidates.reduce((a,b)=>Math.abs(now-a.time)<=Math.abs(now-b.time)?a:b);const delta=now-e.time;e.hit=true;rhythmHitCount++;rhythmErrors.push(delta);
      if(Math.abs(delta)<=tol){rhythmStreak++;rhythmBestStreak=Math.max(rhythmBestStreak,rhythmStreak);rhythmStatus.textContent=Math.abs(delta)<=tol*.45?'Muy preciso.':delta<0?'Correcto · ligeramente temprano.':'Correcto · ligeramente tarde.';}else{rhythmStreak=0;rhythmStatus.textContent=delta<0?'Temprano · acerca el ataque al pulso.':'Tarde · anticipa ligeramente el ataque.';}
      rhythmDeltaEl.textContent=`${delta>=0?'+':''}${delta.toFixed(1)} ms`;
      if(rhythmTimingNeedle){const pct=Math.max(2,Math.min(98,50+(delta/(tol*2))*48));rhythmTimingNeedle.style.left=`${pct}%`;}
      if(rhythmBowReadoutEl)rhythmBowReadoutEl.textContent=e.bow+(e.accent?' · acento':'');rhythmMetrics();rhythmUpdateNext();
    }
    function resetRhythmExercise(){
      rhythmExpected=[];rhythmErrors=[];rhythmTotalExpected=0;rhythmPulseCount=0;rhythmHitCount=0;rhythmMissCount=0;rhythmStreak=0;rhythmBestStreak=0;rhythmAttackIndex=0;
      if(rhythmDeltaEl)rhythmDeltaEl.textContent='—';if(rhythmMeanErrorEl)rhythmMeanErrorEl.textContent='—';if(rhythmAccuracyEl)rhythmAccuracyEl.textContent='—';if(rhythmStreakEl)rhythmStreakEl.textContent='0';if(rhythmTimingNeedle)rhythmTimingNeedle.style.left='50%';
    }
    function startRhythmExercise(){
      if(rhythmRunning)finishRhythmExercise(true);resetRhythmExercise();rhythmRunning=true;rhythmPrecisionPanel?.classList.add('is-running');
      if(typeof window.addMetroPulseListener==='function')rhythmPulseUnsub=window.addMetroPulseListener(rhythmOnPulse);else{rhythmStatus.textContent='El metrónomo aún no está disponible.';rhythmRunning=false;return;}
      if(typeof metroRunning!=='undefined'&&!metroRunning&&typeof startMetro==='function'){rhythmStartedMetro=true;startMetro()}else rhythmStartedMetro=false;
      rhythmGuide.textContent='Ataca cuando corresponde. Usa «Golpe de arco» o la tecla R; el centro del medidor representa el instante ideal.';rhythmStatus.textContent='Ejercicio activo · escucha el pulso y mantén la subdivisión.';saveStringsPrefs();
    }
    function finishRhythmExercise(manual=true){
      if(!rhythmRunning&&!rhythmPulseUnsub)return;rhythmPruneMisses(performance.now()+1000);rhythmRunning=false;rhythmPrecisionPanel?.classList.remove('is-running');rhythmTap?.classList.remove('is-accent');
      if(rhythmPulseUnsub){try{rhythmPulseUnsub()}catch(e){}rhythmPulseUnsub=null;}if(rhythmFinishTimer){clearTimeout(rhythmFinishTimer);rhythmFinishTimer=null;}
      if(rhythmStartedMetro&&typeof stopMetro==='function')stopMetro();rhythmStartedMetro=false;const m=rhythmMetrics();
      rhythmStatus.textContent=`${manual?'Ejercicio detenido':'Ejercicio completado'} · ${rhythmHitCount}/${rhythmTotalExpected} ataques registrados · error medio ${rhythmErrors.length?m.mean.toFixed(1)+' ms':'—'} · mejor racha ${rhythmBestStreak}.`;
      rhythmUpdateNext();
    }
    rhythmStart?.addEventListener('click',startRhythmExercise);rhythmStop?.addEventListener('click',()=>finishRhythmExercise(true));rhythmTap?.addEventListener('pointerdown',e=>{e.preventDefault();registerRhythmAttack()});
    document.addEventListener('keydown',e=>{if((e.key==='r'||e.key==='R')&&rhythmRunning&&!e.repeat&&!['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();registerRhythmAttack();}});
    [rhythmPatternEl,rhythmAccentsEl,rhythmBowEl,rhythmMeasuresEl,rhythmToleranceEl].filter(Boolean).forEach(el=>el.addEventListener('change',()=>{if(rhythmRunning)finishRhythmExercise(true);saveStringsPrefs();}));

    /***************** Tutor MusicXML · cuerdas frotadas *************************/
    let tutorXmlEvents=[];
    let tutorPlan=[];
    let tutorExpectedCells=[];
    let tutorCompletedCells=new Set();
    let tutorCurrentIndex=-1;
    let tutorLastAssignment=null;
    let tutorPlainXmlAvailable=false;

    const tutorActive=()=>!!(tutorEnabledEl&&tutorEnabledEl.checked);
    const midiLabel=midi=>`${NOTE[((midi%12)+12)%12]}${Math.floor(midi/12)-1}`;

    function positionEntriesForInstrument(){
      const key=instrumentSel.value;
      if(key==='violin'||key==='viola')return {
        first:[[1,1],[2,1],[3,2],[4,2],[5,3],[6,3],[7,4]],
        third:[[5,1],[6,1],[7,2],[8,2],[9,3],[10,3],[11,4]],
        fifth:[[9,1],[10,1],[11,2],[12,2],[13,3],[14,3],[15,4]]
      };
      if(key==='cello')return {
        first:[[2,1],[3,2],[4,3],[5,4]],
        extendedFirst:[[1,1],[2,1],[3,2],[4,3],[5,4],[6,4]],
        fourth:[[5,1],[6,2],[7,3],[8,4]],
        thumb:[[12,'T'],[13,1],[14,2],[15,3],[16,3],[17,4]]
      };
      return {
        half:[[1,1],[2,2],[3,4]],
        first:[[2,1],[3,2],[4,4]],
        fourth:[[5,1],[6,2],[7,4]],
        thumb:[[12,'T'],[13,1],[14,2],[15,3],[16,4]]
      };
    }

    function positionLabel(value){
      const opts=TECH_POSITIONS[instrumentSel.value]||[];
      return (opts.find(o=>o.value===value)||{}).label||value||'Libre';
    }

    function techniqueCandidatesForSemi(semi){
      if(semi===0)return [{position:'open',finger:'0',positionLabel:'Cuerda al aire'}];
      const maps=positionEntriesForInstrument();
      const out=[];
      Object.entries(maps).forEach(([position,entries])=>{
        [semi,semi-12,semi-24].filter(v=>v>=0).forEach(v=>{
          const hit=entries.find(([x])=>x===v);
          if(hit)out.push({position,finger:String(hit[1]),positionLabel:positionLabel(position)});
        });
      });
      if(!out.length){
        const key=instrumentSel.value;
        if((key==='cello'||key==='bass')&&semi>=12)out.push({position:'thumb',finger:semi===12?'T':'',positionLabel:'Posición de pulgar · guía'});
        else out.push({position:'free',finger:'',positionLabel:'Posición libre'});
      }
      return out;
    }

    function candidatesForTutorNote(note){
      const pitches=activePitches(), maxSemi=28, out=[];
      pitches.forEach((openMidi,string)=>{
        const semi=note.midi-openMidi;
        if(semi<0||semi>maxSemi)return;
        techniqueCandidatesForSemi(semi).forEach(tech=>{
          let localCost=0;
          const wanted=techPositionSel?.value||'free';
          if(wanted!=='free'&&tech.position!==wanted&&tech.position!=='open')localCost+=6;
          const openPref=tutorOpenStringsEl?.value||'neutral';
          if(semi===0&&openPref==='avoid')localCost+=4;
          if(semi===0&&openPref==='prefer')localCost-=2;
          if(note.explicitString&&Number(note.explicitString)!==string+1)localCost+=20;
          if(note.explicitString&&Number(note.explicitString)===string+1)localCost-=8;
          if(note.explicitFinger&&String(note.explicitFinger)!==String(tech.finger))localCost+=8;
          if(note.explicitFinger&&String(note.explicitFinger)===String(tech.finger))localCost-=5;
          out.push({string,semi,midi:note.midi,finger:tech.finger,position:tech.position,positionLabel:tech.positionLabel,localCost});
        });
      });
      return out.sort((a,b)=>a.localCost-b.localCost);
    }

    function assignmentsForTutorEvent(event){
      if(!event||!event.notes||!event.notes.length)return [];
      const lists=event.notes.map(n=>candidatesForTutorNote(n).slice(0,10));
      if(lists.some(x=>!x.length))return [];
      const results=[];
      (function rec(i,current,used,cost){
        if(results.length>120)return;
        if(i===lists.length){
          const semis=current.map(x=>x.semi), strings=current.map(x=>x.string);
          const spread=(Math.max(...semis)-Math.min(...semis))*0.12+(Math.max(...strings)-Math.min(...strings))*0.35;
          results.push({recs:current.slice(),cost:cost+spread}); return;
        }
        for(const c of lists[i]){
          if(used.has(c.string))continue;
          used.add(c.string);current.push(c);rec(i+1,current,used,cost+c.localCost);current.pop();used.delete(c.string);
        }
      })(0,[],new Set(),0);
      return results.sort((a,b)=>a.cost-b.cost).slice(0,40);
    }

    function transitionTutorCost(a,b){
      if(!a||!b)return 0;
      const ar=a.recs||[], br=b.recs||[];
      if(!ar.length||!br.length)return 0;
      const aa=ar[0], bb=br[0];
      let c=Math.abs(aa.string-bb.string)*1.8+Math.abs(aa.semi-bb.semi)*0.18;
      if(aa.position!==bb.position)c+=3.2;
      if((aa.position==='thumb')!==(bb.position==='thumb'))c+=3.5;
      const criterion=tutorCriterionEl?.value||'phrase';
      if(criterion==='string')c+=Math.abs(aa.string-bb.string)*3.2;
      if(criterion==='position'&&aa.position!==bb.position)c+=4.5;
      return c;
    }

    function buildTutorPlan(events=tutorXmlEvents){
      const limit=Math.max(1,parseInt(tutorPhraseLengthEl?.value||'8',10));
      const source=(events||[]).slice(0,Math.max(limit,1));
      if(!source.length){tutorPlan=[];return tutorPlan;}
      const layers=[];
      source.forEach((event,i)=>{
        const assigns=assignmentsForTutorEvent(event);
        const layer=assigns.map(a=>({assignment:a,total:a.cost,prev:-1}));
        if(i>0&&layer.length&&layers[i-1]?.length){
          layer.forEach(node=>{
            let best=Infinity,bestIdx=-1;
            layers[i-1].forEach((prev,pi)=>{
              const total=prev.total+node.assignment.cost+transitionTutorCost(prev.assignment,node.assignment);
              if(total<best){best=total;bestIdx=pi;}
            });
            node.total=best;node.prev=bestIdx;
          });
        }
        layers.push(layer);
      });
      if(layers.some(l=>!l.length)){tutorPlan=[];return tutorPlan;}
      let idx=layers.at(-1).reduce((best,n,i,a)=>n.total<a[best].total?i:best,0);
      const plan=new Array(layers.length);
      for(let i=layers.length-1;i>=0;i--){plan[i]={event:source[i],assignment:layers[i][idx].assignment};idx=layers[i][idx].prev<0?0:layers[i][idx].prev;}
      tutorPlan=plan;
      return plan;
    }

    function xmlText(el,selector){const x=el.querySelector(selector);return x?x.textContent.trim():'';}
    function parseMusicXMLTutor(xmlTextValue){
      tutorPlainXmlAvailable=false;
      if(!xmlTextValue||typeof DOMParser==='undefined')return [];
      try{
        const doc=new DOMParser().parseFromString(xmlTextValue,'application/xml');
        if(doc.querySelector('parsererror'))return [];
        const notes=[...doc.querySelectorAll('note')];
        const events=[]; let current=null;
        notes.forEach(n=>{
          if(n.querySelector('rest'))return;
          const step=xmlText(n,'pitch > step'), oct=parseInt(xmlText(n,'pitch > octave'),10);
          if(!step||!Number.isFinite(oct))return;
          const alter=parseInt(xmlText(n,'pitch > alter')||'0',10)||0;
          const pc={C:0,D:2,E:4,F:5,G:7,A:9,B:11}[step]+alter;
          const writtenMidi=(oct+1)*12+pc;
          const midi=scoreMidiToSounding(writtenMidi);
          const explicitString=xmlText(n,'notations technical string')||'';
          const explicitFinger=xmlText(n,'notations technical fingering')||'';
          const technique=[];
          const map=[['notations articulations staccato','staccato'],['notations articulations tenuto','tenuto'],['notations articulations accent','acento'],['notations articulations strong-accent','acento fuerte'],['notations articulations detached-legato','détaché/portato'],['notations articulations staccatissimo','staccatissimo'],['notations technical harmonic','armónico'],['notations technical stopped','nota detenida'],['notations slide','slide'],['notations glissando','glissando'],['notations tremolo','trémolo']];
          map.forEach(([sel,label])=>{if(n.querySelector(sel))technique.push(label);});
          if(n.querySelector('notations slur[type="start"]'))technique.push('inicio de ligadura');
          if(n.querySelector('notations slur[type="stop"]'))technique.push('fin de ligadura');
          if(n.querySelector('tie[type="start"], notations tied[type="start"]'))technique.push('ligadura de prolongación');
          let bow='';
          if(n.querySelector('notations technical down-bow'))bow='↓ arco abajo';
          if(n.querySelector('notations technical up-bow'))bow='↑ arco arriba';
          const note={midi,explicitString,explicitFinger,technique,bow};
          if(n.querySelector('chord')&&current){current.notes.push(note);}
          else{current={notes:[note]};events.push(current);}
        });
        events.forEach((ev,i)=>{
          ev.technique=[...new Set(ev.notes.flatMap(n=>n.technique||[]))];
          ev.bow=ev.notes.map(n=>n.bow).find(Boolean)||'';
          if(!ev.bow&&tutorBowModeEl?.value==='alternate')ev.bow=i%2===0?'↓ arco abajo':'↑ arco arriba';
        });
        tutorPlainXmlAvailable=events.length>0;
        return events;
      }catch(e){console.warn('No se pudo analizar MusicXML para Tutor:',e);return [];}
    }

    function tutorEventFromMidis(midis){return {notes:(midis||[]).map(midi=>({midi,explicitString:'',explicitFinger:'',technique:[],bow:''})),technique:[],bow:''};}

    function assignmentForDynamicEvent(event){
      const arr=assignmentsForTutorEvent(event); if(!arr.length)return null;
      if(!tutorLastAssignment)return arr[0];
      return arr.reduce((best,a)=>a.cost+transitionTutorCost(tutorLastAssignment,a)<best.cost+transitionTutorCost(tutorLastAssignment,best)?a:best,arr[0]);
    }

    function renderTutor(index,event,assignment){
      if(!tutorPanel)return;
      tutorPanel.classList.toggle('is-active',tutorActive());
      tutorCurrentIndex=index;
      const recs=assignment?.recs||[];
      tutorExpectedCells=recs.map(r=>({s:r.string,semi:r.semi,finger:r.finger}));
      tutorCompletedCells.clear();
      if(!event||!recs.length){
        tutorStepEl.textContent='—';tutorNoteEl.textContent='—';tutorStringEl.textContent='—';tutorFingerEl.textContent='—';tutorPositionEl.textContent='—';tutorBowEl.textContent='—';
        tutorTechniqueEl.textContent='No hay una posición disponible en el rango analizado.'; draw(); return;
      }
      tutorStepEl.textContent=`${index+1}${tutorPlan.length?` / ${tutorPlan.length}`:''}`;
      tutorNoteEl.textContent=event.notes.map(n=>midiLabel(n.midi)).join(' + ');
      tutorStringEl.textContent=recs.map(r=>`${r.string+1}ª · +${r.semi}`).join(' / ');
      tutorFingerEl.textContent=recs.map(r=>r.finger||'—').join(' / ');
      tutorPositionEl.textContent=[...new Set(recs.map(r=>r.positionLabel))].join(' / ');
      let bow=event.bow||'';
      if(!bow&&tutorBowModeEl?.value==='alternate')bow=index%2===0?'↓ arco abajo':'↑ arco arriba';
      if(!bow&&tutorBowModeEl?.value==='free')bow='Libre';
      if(!bow)bow='Según frase';
      tutorBowEl.textContent=articulationSel?.value==='pizzicato'?'Pizzicato':bow;
      const tech=[...(event.technique||[])];
      if(recs.some(r=>r.position==='thumb'))tech.push('posición de pulgar');
      if(index>0&&tutorPlan[index-1]){
        const prev=tutorPlan[index-1].assignment.recs?.[0],now=recs[0];
        if(prev&&now&&prev.position!==now.position)tech.push(`cambio: ${prev.positionLabel} → ${now.positionLabel}`);
        if(prev&&now&&prev.string!==now.string)tech.push(`cambio de cuerda ${prev.string+1} → ${now.string+1}`);
      }
      tutorTechniqueEl.textContent=tech.length?[...new Set(tech)].join(' · '):'Digitación sugerida por continuidad y posición.';
      tutorStatusEl.textContent=tutorActive()?'Toca/clickea la posición resaltada para avanzar.':'Tutor analizado. Actívalo para práctica interactiva.';
      tutorLastAssignment=assignment;
      if(intonationTargetModeEl?.value==='tutor')updateIntonationTargetUI();
      draw();
    }

    function showTutorPlanIndex(index){
      if(!tutorPlan.length)return;
      const i=Math.max(0,Math.min(index,tutorPlan.length-1));
      renderTutor(i,tutorPlan[i].event,tutorPlan[i].assignment);
    }

    function updateTutorFromPlayback(midis,index){
      if(!tutorPanel||!midis?.length)return;
      if(tutorPlan[index])renderTutor(index,tutorPlan[index].event,tutorPlan[index].assignment);
      else{
        const ev=tutorEventFromMidis(midis);
        const assignment=assignmentForDynamicEvent(ev);
        renderTutor(Math.max(0,index),ev,assignment);
        if(!tutorPlainXmlAvailable)tutorTechniqueEl.textContent+=' · MXL/OSMD: articulaciones explícitas no disponibles para el analizador interno.';
      }
    }

    function analyzeTutorPhrase(){
      if(!osmd){tutorStatusEl.textContent='Carga primero una partitura MusicXML.';return;}
      if(tutorXmlEvents.length){
        buildTutorPlan();
        if(!tutorPlan.length){tutorStatusEl.textContent='No encontré una digitación completa en el rango actual.';return;}
        showTutorPlanIndex(0); try{seekToStep(0);}catch(e){}
        tutorStatusEl.textContent=`Frase analizada: ${tutorPlan.length} eventos · ${activeInstrument().label}.`;
      }else{
        tutorStatusEl.textContent='La partitura puede reproducirse y mapearse, pero este formato no expone aquí sus técnicas internas. Usa .musicxml/.xml para análisis completo.';
      }
    }

    if(tutorAnalyzeBtn)tutorAnalyzeBtn.addEventListener('click',analyzeTutorPhrase);
    [tutorCriterionEl,tutorOpenStringsEl,tutorBowModeEl,tutorPhraseLengthEl].filter(Boolean).forEach(el=>el.addEventListener('change',()=>{if(tutorXmlEvents.length)buildTutorPlan();}));
    if(tutorEnabledEl)tutorEnabledEl.addEventListener('change',()=>{tutorPanel?.classList.toggle('is-active',tutorActive()); if(tutorPlan.length)showTutorPlanIndex(Math.max(0,tutorCurrentIndex));});

    /***************** PRÁCTICA DE ARCO *************************/
    const BOW_TECHNIQUES={
      detache:{label:'Détaché',guide:'Una nota por arco. Mantén contacto continuo y un cambio de dirección limpio, sin convertirlo en un golpe acentuado.'},
      legato:{label:'Legato',guide:'Conecta el sonido sin huecos. Si trabajas varias notas por arco, conserva velocidad y punto de contacto estables.'},
      staccato:{label:'Staccato',guide:'Ataques separados con detención clara del arco entre notas. Evita levantar el arco salvo que la frase lo pida.'},
      martele:{label:'Martelé',guide:'Prepara el ataque, inicia con claridad y libera la presión inmediatamente para que el arco continúe sin rigidez.'},
      spiccato:{label:'Spiccato',guide:'Rebote corto y controlado cerca del punto de equilibrio. Empieza a tempo moderado y con poca altura sobre la cuerda.'},
      tremolo:{label:'Trémolo',guide:'Usa poca cantidad de arco y movimientos rápidos y regulares. Prioriza relajación y uniformidad del pulso.'}
    };
    const BOW_DISTRIBUTION_LABELS={whole:'Arco entero',half:'½ arco',third:'⅓ de arco',quarter:'¼ de arco'};
    let bowPracticeRunning=false,bowPracticePulseCount=0,bowPracticeStrokeCount=0,bowPracticeUnsubscribe=null,bowPracticeStartedMetro=false,bowPracticeTimers=[];

    function bowAutoDistribution(){
      const tech=bowTechniqueEl?.value||'detache', strokes=+(bowStrokesPerPulseEl?.value||1), bpm=+(document.getElementById('metroBpmValue')?.textContent||80);
      if(tech==='tremolo'||strokes>=4)return 'quarter';
      if(tech==='spiccato'||tech==='staccato'||tech==='martele'||strokes===2)return bpm>=120?'quarter':'third';
      if(tech==='legato')return bpm<70?'whole':'half';
      return bpm<70?'whole':bpm<120?'half':'third';
    }
    function currentBowDistribution(){return bowDistributionEl?.value==='auto'?bowAutoDistribution():(bowDistributionEl?.value||'half');}
    function bowStringSequence(){
      const p=bowStringPatternEl?.value||'s1';
      if(p==='s1')return [0]; if(p==='s2')return [1]; if(p==='s3')return [2]; if(p==='s4')return [3];
      if(p==='12')return [0,1]; if(p==='23')return [1,2]; if(p==='34')return [2,3]; if(p==='1234')return [0,1,2,3,2,1];
      return [];
    }
    function bowPracticeStringAt(strokeIndex){
      if((bowStringPatternEl?.value||'')==='tutor'){
        if(!tutorPlan.length)return null;
        const p=tutorPlan[strokeIndex%tutorPlan.length];
        return p?.assignment?.recs?.[0]?.string ?? null;
      }
      const seq=bowStringSequence(); return seq.length?seq[strokeIndex%seq.length]:0;
    }
    function bowPracticeDirectionAt(strokeIndex){
      const mode=bowDirectionEl?.value||'alternate';
      if(mode==='down')return '↓'; if(mode==='up')return '↑';
      if(mode==='score'&&tutorPlan.length){
        const ev=tutorPlan[strokeIndex%tutorPlan.length]?.event;
        const b=ev?.bow||''; if(b.includes('↓'))return '↓'; if(b.includes('↑'))return '↑';
      }
      return strokeIndex%2===0?'↓':'↑';
    }
    function renderBowPracticeStroke(strokeIndex,pulseInfo,subIndex=0){
      if(!bowPracticeRunning)return;
      const stringIndex=bowPracticeStringAt(strokeIndex), ins=activeInstrument(), dir=bowPracticeDirectionAt(strokeIndex), dist=currentBowDistribution(), tech=BOW_TECHNIQUES[bowTechniqueEl?.value||'detache'];
      const totalPulses=Math.max(1,(+(bowMeasuresEl?.value||4))*(pulseInfo?.beats||4));
      const bar=Math.floor(bowPracticePulseCount/(pulseInfo?.beats||4))+1, beat=(bowPracticePulseCount%(pulseInfo?.beats||4))+1;
      bowPracticeStepEl.textContent=`${bar}:${beat}${+(bowStrokesPerPulseEl?.value||1)>1?` · ${subIndex+1}/${bowStrokesPerPulseEl.value}`:''}`;
      bowPracticeDirectionEl.textContent=dir==='↓'?'↓ arco abajo':'↑ arco arriba';
      bowPracticeStringEl.textContent=stringIndex==null?'Tutor sin ruta':`${stringIndex+1}ª · ${ins.names[stringIndex]}`;
      bowPracticeDistributionEl.textContent=BOW_DISTRIBUTION_LABELS[dist]||dist;
      bowPracticeTechniqueEl.textContent=tech.label;
      bowPracticeGuideEl.textContent=tech.guide;
      bowPracticePanel?.classList.add('is-pulse'); setTimeout(()=>bowPracticePanel?.classList.remove('is-pulse'),100);
      if(stringIndex!=null&&typeof playNote==='function'){
        const midi=ins.pitches[stringIndex];
        try{playNote(midi,Math.min(.55,(pulseInfo?.secondsPerPulse||.75)/(+(bowStrokesPerPulseEl?.value||1))*0.8));}catch(e){}
      }
      bowPracticeStrokeCount++;
      if(bowPracticePulseCount+1>=totalPulses && subIndex===+(bowStrokesPerPulseEl?.value||1)-1){
        setTimeout(()=>stopBowPractice(true),80);
      }
    }
    function onBowMetroPulse(info){
      if(!bowPracticeRunning)return;
      const strokes=Math.max(1,+(bowStrokesPerPulseEl?.value||1)), pulseSeconds=info?.secondsPerPulse||.75;
      for(let j=0;j<strokes;j++){
        const strokeIndex=bowPracticeStrokeCount+j;
        const timer=setTimeout(()=>renderBowPracticeStroke(strokeIndex,info,j),Math.round((pulseSeconds*1000*j)/strokes));
        bowPracticeTimers.push(timer);
      }
      bowPracticePulseCount++;
    }
    function startBowPractice(){
      if(bowPracticeRunning){stopBowPractice(false);return;}
      if((bowStringPatternEl?.value||'')==='tutor'&&!tutorPlan.length){bowPracticeStatusEl.textContent='Analiza primero una frase en el Tutor o elige un patrón de cuerdas.';return;}
      bowPracticeRunning=true;bowPracticePulseCount=0;bowPracticeStrokeCount=0;bowPracticeTimers=[];
      bowPracticePanel?.classList.add('is-running');bowPracticeStart.textContent='Detener';bowPracticeStatusEl.textContent='Ejercicio activo · sigue el pulso del metrónomo.';
      const tech=BOW_TECHNIQUES[bowTechniqueEl?.value||'detache']; bowPracticeTechniqueEl.textContent=tech.label;bowPracticeGuideEl.textContent=tech.guide;bowPracticeDistributionEl.textContent=BOW_DISTRIBUTION_LABELS[currentBowDistribution()];
      if(typeof window.addMetroPulseListener==='function')bowPracticeUnsubscribe=window.addMetroPulseListener(onBowMetroPulse);
      if(typeof metroRunning!=='undefined'&&!metroRunning&&typeof startMetro==='function'){bowPracticeStartedMetro=true;startMetro()}else bowPracticeStartedMetro=false;
    }
    function stopBowPractice(completed=false){
      bowPracticeRunning=false;bowPracticePanel?.classList.remove('is-running','is-pulse');bowPracticeStart.textContent='Iniciar ejercicio';
      bowPracticeTimers.forEach(t=>clearTimeout(t));bowPracticeTimers=[];
      if(bowPracticeUnsubscribe){try{bowPracticeUnsubscribe()}catch(e){}bowPracticeUnsubscribe=null;}
      if(bowPracticeStartedMetro&&typeof stopMetro==='function')stopMetro();bowPracticeStartedMetro=false;
      bowPracticeStatusEl.textContent=completed?'Ejercicio completado.':'Ejercicio detenido.';
    }
    if(bowPracticeStart)bowPracticeStart.addEventListener('click',startBowPractice);
    [bowTechniqueEl,bowDirectionEl,bowStringPatternEl,bowStrokesPerPulseEl,bowDistributionEl,bowMeasuresEl].filter(Boolean).forEach(el=>el.addEventListener('change',()=>{
      if(bowPracticeRunning){bowPracticeStatusEl.textContent='Cambio aplicado al siguiente pulso.';}
      saveStringsPrefs();
    }));

    /***************** Motor de sonido *************************/

    /***************** Entrenamiento de entonación *************************/
    let intonationStream=null, intonationSource=null, intonationAnalyser=null, intonationRAF=0;
    let intonationDroneOsc=null, intonationDroneGain=null;
    let intonationFineOffsetCents=0;
    const centsBetween=(freq,target)=>1200*Math.log2(freq/target);
    const midiFrequency=(midi,a4=440)=>a4*Math.pow(2,(midi-69)/12);
    function currentA4(){return Math.max(400,Math.min(480,+(intonationA4El?.value||440)));}
    function populateIntonationTargets(){
      if(!intonationStringEl||!intonationNoteEl)return;
      const ins=activeInstrument();
      const keepString=intonationStringEl.value, keepNote=intonationNoteEl.value;
      intonationStringEl.innerHTML='';
      ins.pitches.forEach((midi,i)=>intonationStringEl.add(new Option(`${i+1}ª · ${ins.names[i]} · ${midiLabel(midi)}`,String(i))));
      intonationStringEl.value=[...intonationStringEl.options].some(o=>o.value===keepString)?keepString:'0';
      intonationNoteEl.innerHTML='';
      const lo=Math.max(24,Math.min(...ins.pitches)), hi=Math.min(96,Math.max(...ins.pitches)+24);
      for(let midi=lo;midi<=hi;midi++)intonationNoteEl.add(new Option(midiLabel(midi),String(midi)));
      intonationNoteEl.value=[...intonationNoteEl.options].some(o=>o.value===keepNote)?keepNote:String(ins.pitches[0]);
      updateIntonationTargetUI();
    }
    function intonationTargetMidi(){
      const ins=activeInstrument(),mode=intonationTargetModeEl?.value||'open';
      if(mode==='manual')return +(intonationNoteEl?.value||ins.pitches[0]);
      if(mode==='tutor'){
        const ev=tutorPlan?.[Math.max(0,tutorCurrentIndex)]?.event;
        const midi=ev?.notes?.[0]?.midi;
        if(Number.isFinite(midi))return midi;
      }
      const idx=Math.max(0,Math.min(ins.pitches.length-1,+(intonationStringEl?.value||0)));
      return ins.pitches[idx];
    }
    function intonationDroneMidi(){
      const mode=intonationDroneModeEl?.value||'off';
      if(mode==='off')return null;
      if(mode==='target')return intonationTargetMidi();
      const ins=activeInstrument(),idx=Math.max(0,Math.min(ins.pitches.length-1,+(intonationStringEl?.value||0)));
      return ins.pitches[idx];
    }
    function intonationTargetFrequency(){return midiFrequency(intonationTargetMidi(),currentA4())*Math.pow(2,intonationFineOffsetCents/1200);}
    function updateIntonationTargetUI(){
      if(!intonationTargetLabel)return;
      const midi=intonationTargetMidi(),hz=intonationTargetFrequency();
      intonationTargetLabel.textContent=midiLabel(midi)+(Math.abs(intonationFineOffsetCents)>.05?` ${intonationFineOffsetCents>0?'+':''}${intonationFineOffsetCents.toFixed(1)}¢`:'');
      intonationTargetHz.textContent=`${hz.toFixed(2)} Hz`;
      const mode=intonationTargetModeEl?.value||'open';
      if(intonationStringEl)intonationStringEl.disabled=mode==='manual';
      if(intonationNoteEl)intonationNoteEl.disabled=mode!=='manual';
      if(mode==='tutor'&&!tutorPlan?.length&&intonationStatus)intonationStatus.textContent='Carga y analiza un MusicXML para usar la nota del Tutor.';
      if(intonationDroneOsc)restartIntonationDrone();
    }
    function autoCorrelatePitch(buffer,sampleRate){
      let rms=0;for(let i=0;i<buffer.length;i++)rms+=buffer[i]*buffer[i];rms=Math.sqrt(rms/buffer.length);
      if(rms<0.008)return -1;
      let r1=0,r2=buffer.length-1,th=0.18;
      for(let i=0;i<buffer.length/2;i++){if(Math.abs(buffer[i])<th){r1=i;break;}}
      for(let i=1;i<buffer.length/2;i++){if(Math.abs(buffer[buffer.length-i])<th){r2=buffer.length-i;break;}}
      const b=buffer.slice(r1,r2),n=b.length,c=new Float32Array(n);
      for(let lag=0;lag<n;lag++){let sum=0;for(let i=0;i<n-lag;i++)sum+=b[i]*b[i+lag];c[lag]=sum;}
      let d=0;while(d+1<n&&c[d]>c[d+1])d++;
      let max=-Infinity,pos=-1;for(let i=d;i<n;i++){if(c[i]>max){max=c[i];pos=i;}}
      if(pos<=0)return -1;
      let T0=pos;if(pos>0&&pos<n-1){const x1=c[pos-1],x2=c[pos],x3=c[pos+1],a=(x1+x3-2*x2)/2,bv=(x3-x1)/2;if(a)T0=pos-bv/(2*a);}
      return sampleRate/T0;
    }
    function intonationTick(){
      if(!intonationAnalyser)return;
      const buf=new Float32Array(intonationAnalyser.fftSize);intonationAnalyser.getFloatTimeDomainData(buf);
      const freq=autoCorrelatePitch(buf,intonationAnalyser.context.sampleRate);
      if(freq>0){
        const nearest=Math.round(69+12*Math.log2(freq/currentA4())),target=intonationTargetMidi(),targetHz=intonationTargetFrequency(),c=centsBetween(freq,targetHz);
        intonationDetectedLabel.textContent=midiLabel(nearest);intonationCents.textContent=`${c>=0?'+':''}${c.toFixed(1)} cents`;
        const bounded=Math.max(-50,Math.min(50,c));intonationNeedle.style.left=`${50+bounded}%`;
        const tol=+(intonationToleranceEl?.value||10);intonationFeedback.classList.remove('in-tune','sharp','flat');
        if(Math.abs(c)<=tol){intonationFeedback.textContent=`Afinado dentro de ±${tol} cents.`;intonationFeedback.classList.add('in-tune');}
        else if(c>0){intonationFeedback.textContent=`Está ${Math.abs(c).toFixed(1)} cents alto · corrige ligeramente hacia la cejilla/clavijero.`;intonationFeedback.classList.add('sharp');}
        else{intonationFeedback.textContent=`Está ${Math.abs(c).toFixed(1)} cents bajo · corrige ligeramente hacia el puente.`;intonationFeedback.classList.add('flat');}
      }
      intonationRAF=requestAnimationFrame(intonationTick);
    }
    async function toggleIntonationMic(){
      if(intonationStream){stopIntonationMic();return;}
      if(!navigator.mediaDevices?.getUserMedia){intonationStatus.textContent='Este navegador no ofrece acceso al micrófono.';return;}
      try{
        const ctx=ensureCtx();
        intonationStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
        intonationSource=ctx.createMediaStreamSource(intonationStream);intonationAnalyser=ctx.createAnalyser();intonationAnalyser.fftSize=4096;intonationAnalyser.smoothingTimeConstant=.1;intonationSource.connect(intonationAnalyser);
        intonationPanel?.classList.add('is-listening');intonationMicBtn.textContent='Detener micrófono';intonationStatus.textContent='Micrófono activo · toca una nota sostenida y estable.';intonationTick();
      }catch(err){intonationStatus.textContent='No se pudo activar el micrófono. Revisa el permiso del navegador.';}
    }
    function stopIntonationMic(){
      if(intonationRAF)cancelAnimationFrame(intonationRAF);intonationRAF=0;try{intonationSource?.disconnect();}catch(e){}intonationSource=null;intonationAnalyser=null;
      if(intonationStream){intonationStream.getTracks().forEach(t=>t.stop());intonationStream=null;}
      intonationPanel?.classList.remove('is-listening');if(intonationMicBtn)intonationMicBtn.textContent='Activar micrófono';
      if(intonationDetectedLabel)intonationDetectedLabel.textContent='—';if(intonationCents)intonationCents.textContent='— cents';if(intonationNeedle)intonationNeedle.style.left='50%';if(intonationStatus)intonationStatus.textContent='Micrófono detenido.';
    }
    function playReferenceFrequency(freq,duration=1.5,gainValue=.12){const ctx=ensureCtx(),osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=freq;gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(gainValue,ctx.currentTime+.04);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+Math.max(.12,duration-.08));osc.connect(gain);gain.connect(masterBus);osc.start();osc.stop(ctx.currentTime+duration);}
    function playIntonationReference(){const midi=intonationTargetMidi(),freq=intonationTargetFrequency();try{if(Math.abs(intonationFineOffsetCents)>.05)playReferenceFrequency(freq,1.5);else playNote(midi,1.5);intonationStatus.textContent=`Referencia: ${midiLabel(midi)} · ${freq.toFixed(2)} Hz${Math.abs(intonationFineOffsetCents)>.05?` · ${intonationFineOffsetCents>0?'+':''}${intonationFineOffsetCents.toFixed(1)}¢`:''}`;}catch(e){}}
    function stopIntonationDrone(){try{const ctx=ensureCtx();intonationDroneGain?.gain.setTargetAtTime(.0001,ctx.currentTime,.03);intonationDroneOsc?.stop(ctx.currentTime+.15);}catch(e){}intonationDroneOsc=null;intonationDroneGain=null;if(intonationDroneBtn)intonationDroneBtn.textContent='Iniciar drone';}
    function startIntonationDrone(){
      const mode=intonationDroneModeEl?.value||'off',midi=intonationDroneMidi();if(midi==null){intonationStatus.textContent='Selecciona “Nota objetivo” o “Cuerda al aire” en Drone.';return;}
      const ctx=ensureCtx();intonationDroneOsc=ctx.createOscillator();intonationDroneGain=ctx.createGain();intonationDroneOsc.type='sine';intonationDroneOsc.frequency.value=(mode==='target'?intonationTargetFrequency():midiFrequency(midi,currentA4()));intonationDroneGain.gain.value=.0001;intonationDroneOsc.connect(intonationDroneGain);intonationDroneGain.connect(masterBus);intonationDroneOsc.start();intonationDroneGain.gain.exponentialRampToValueAtTime(.08,ctx.currentTime+.08);intonationDroneBtn.textContent='Detener drone';intonationStatus.textContent=`Drone activo: ${midiLabel(midi)}.`;
    }
    function restartIntonationDrone(){if(!intonationDroneOsc)return;stopIntonationDrone();startIntonationDrone();}
    function toggleIntonationDrone(){intonationDroneOsc?stopIntonationDrone():startIntonationDrone();}
    function prepareIntonationShift(){
      const semi=+(intonationShiftEl?.value||0);if(!semi){intonationShiftGuide.textContent='Selecciona un intervalo de desplazamiento.';return;}
      const base=intonationTargetMidi(),target=base+semi;intonationFineOffsetCents=0;intonationTargetModeEl.value='manual';if([...intonationNoteEl.options].some(o=>o.value===String(target)))intonationNoteEl.value=String(target);updateIntonationTargetUI();
      intonationShiftGuide.textContent=`Referencia ${midiLabel(base)} → objetivo ${midiLabel(target)} (+${semi} semitonos). Escucha, desplázate sin mirar una “línea de traste” y comprueba con el micrófono.`;
      try{playNote(base,.9);setTimeout(()=>playNote(target,.9),1050);}catch(e){}
    }
    if(intonationMicBtn)intonationMicBtn.addEventListener('click',toggleIntonationMic);
    if(intonationReferenceBtn)intonationReferenceBtn.addEventListener('click',playIntonationReference);
    if(intonationDroneBtn)intonationDroneBtn.addEventListener('click',toggleIntonationDrone);
    if(intonationShiftBtn)intonationShiftBtn.addEventListener('click',prepareIntonationShift);
    [intonationTargetModeEl,intonationStringEl,intonationNoteEl].filter(Boolean).forEach(el=>el.addEventListener('change',()=>{intonationFineOffsetCents=0;updateIntonationTargetUI();try{saveStringsPrefs();}catch(e){}}));
    [intonationA4El,intonationToleranceEl,intonationDroneModeEl].filter(Boolean).forEach(el=>el.addEventListener('change',()=>{updateIntonationTargetUI();try{saveStringsPrefs();}catch(e){}}));
    window.addEventListener('beforeunload',()=>{stopIntonationMic();stopIntonationDrone();try{stopDoubleStopDrone();}catch(e){}});

    let audioCtx=null;
    let masterBus=null;
    let sfPlayer=null;
    let sfLoading=false;
    let soundEnabled=true;

    function ensureCtx(){
      if(!audioCtx){
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
      if(audioCtx.state==='suspended') audioCtx.resume();
      return audioCtx;
    }

    function setSourceIndicator(text, cls){
      soundSourceIndicator.textContent = text;
      soundSourceIndicator.className = 'sound-source-indicator' + (cls ? ' ' + cls : '');
    }

    function getSoundName(instrumentKey, articulation){
      const ins = INSTRUMENTS[instrumentKey];
      const baseName = ins ? ins.label : 'Instrumento';
      const artName = articulation === 'pizzicato' ? 'Pizzicato' : 'Legato';
      return baseName + ' ' + artName;
    }

    function loadSound(instrumentKey, articulation){
      if(sfLoading) return;
      sfLoading = true;
      setSourceIndicator('🎻 cargando...', 'loading');
      const ctx = ensureCtx();

      // Mapeo de instrumento a nombre SoundFont
      const sfMap = {
        violin: { legato: 'violin', pizzicato: 'pizzicato_strings' },
        viola:  { legato: 'viola', pizzicato: 'pizzicato_strings' },
        cello:  { legato: 'cello', pizzicato: 'pizzicato_strings' },
        bass:   { legato: 'contrabass', pizzicato: 'pizzicato_strings' }
      };
      const soundName = sfMap[instrumentKey] ? sfMap[instrumentKey][articulation] : 'violin';

      Soundfont.instrument(ctx, soundName, { destination: masterBus })
        .then(instrument => {
          sfPlayer = instrument;
          sfLoading = false;
          const label = getSoundName(instrumentKey, articulation);
          setSourceIndicator('🎻 ' + label, 'sf');
          console.log('SoundFont cargado:', soundName);
        })
        .catch(err => {
          sfLoading = false;
          sfPlayer = null;
          setSourceIndicator('⚡ Fallback (oscilador)', 'osc');
          console.warn('Error al cargar SoundFont, usando oscilador:', err);
        });
    }

    function playNote(midi, duration = 1.8){
      if(!soundEnabled) return;
      const ctx = ensureCtx();
      if(!ctx) return;
      const vol = parseFloat(volumeSlider.value) / 10;
      if(isNaN(vol) || vol <= 0) return;

      if(sfPlayer){
        try {
          const sfNote = sfPlayer.play(midi, ctx.currentTime, { gain: vol });
          if(sfNote){
            setTimeout(() => {
              try {
                if(sfNote && typeof sfNote.stop === 'function'){
                  sfNote.stop(ctx.currentTime);
                }
              } catch(e) {}
            }, duration * 1000);
            return;
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
    }

    // Control de mute
    muteBtn.textContent = "🔊";
    muteBtn.onclick = function(){
      soundEnabled = !soundEnabled;
      this.textContent = soundEnabled ? "🔊" : "🔇";
    };

    // Cargar sonido inicial
    setTimeout(() => loadSound('violin', 'legato'), 300);

    // Cambiar sonido al cambiar instrumento o articulación
    instrumentSel.addEventListener('change', function(){
      manualSelections.clear();
      hoverCell = null;
      populateTechniquePositions();
      populateShiftControls();
      populateDoubleStopPairs();
      updateDoubleStopUI();
      loadSound(this.value, articulationSel.value);
      draw();
    });
    orientationSel?.addEventListener('change', draw);
    labelModeSel?.addEventListener('change', draw);
    keySignatureSel?.addEventListener('change', draw);
    spellingModeSel?.addEventListener('change', draw);
    techPositionSel?.addEventListener('change', draw);

        articulationSel.addEventListener('change', function(){
      loadSound(instrumentSel.value, this.value);
      draw();
    });


    /***************** Cambios de posición · cuerdas frotadas *************************/
    let shiftPracticeRunning=false, shiftPracticePhase='origin', shiftPracticeCompleted=0, shiftPracticePlan=null;

    const SHIFT_GUIDES={
      guide:'Mantén el dedo guía en contacto ligero durante el desplazamiento; libera la presión antes de mover y vuelve a apoyar al llegar.',
      silent:'Libera completamente la presión, desplaza la mano como una unidad y prepara la nueva posición antes de sonar.',
      gliss:'Mantén contacto controlado y deja oír el recorrido del dedo hasta la nota de llegada, sin acelerar al final.'
    };

    function populateShiftControls(keep={}){
      if(!shiftStringEl||!shiftOriginEl||!shiftDestinationEl)return;
      const ins=activeInstrument();
      const ks=keep.string??shiftStringEl.value, ko=keep.origin??shiftOriginEl.value, kd=keep.destination??shiftDestinationEl.value;
      shiftStringEl.length=0; ins.names.forEach((n,i)=>shiftStringEl.add(new Option(`${i+1}ª · ${n}`,String(i))));
      const opts=(TECH_POSITIONS[instrumentSel.value]||[]).filter(o=>o.value!=='free');
      shiftOriginEl.length=0; shiftDestinationEl.length=0;
      opts.forEach(o=>{shiftOriginEl.add(new Option(o.label,o.value));shiftDestinationEl.add(new Option(o.label,o.value));});
      if([...shiftStringEl.options].some(o=>o.value===ks))shiftStringEl.value=ks;
      if([...shiftOriginEl.options].some(o=>o.value===ko))shiftOriginEl.value=ko;
      if([...shiftDestinationEl.options].some(o=>o.value===kd))shiftDestinationEl.value=kd;
      if(shiftOriginEl.value===shiftDestinationEl.value&&shiftDestinationEl.options.length>1)shiftDestinationEl.selectedIndex=Math.min(1,shiftDestinationEl.options.length-1);
      updateShiftPreview();
    }

    function entriesForShiftPosition(position){return (positionEntriesForInstrument()[position]||[]).map(([semi,finger])=>({semi,finger:String(finger)}));}
    function chooseShiftFinger(origin,destination){
      const requested=shiftGuideFingerEl?.value||'auto', a=entriesForShiftPosition(origin), b=entriesForShiftPosition(destination);
      if(requested!=='auto'&&a.some(x=>x.finger===requested)&&b.some(x=>x.finger===requested))return requested;
      const common=['1','2','3','4'].find(f=>a.some(x=>x.finger===f)&&b.some(x=>x.finger===f));
      return common||a[0]?.finger||b[0]?.finger||'1';
    }
    function semiForShift(position,finger){
      const list=entriesForShiftPosition(position);
      return (list.find(x=>x.finger===String(finger))||list[0]||{semi:0}).semi;
    }
    function buildShiftPracticePlan(){
      if(!shiftStringEl)return null;
      const string=Math.max(0,Math.min(activePitches().length-1,+(shiftStringEl.value||0))), origin=shiftOriginEl.value, destination=shiftDestinationEl.value;
      if(!origin||!destination||origin===destination)return null;
      const finger=chooseShiftFinger(origin,destination), originSemi=semiForShift(origin,finger), destinationSemi=semiForShift(destination,finger);
      if(originSemi===destinationSemi)return null;
      const open=activePitches()[string];
      return {string,origin,destination,finger,originSemi,destinationSemi,originMidi:open+originSemi,destinationMidi:open+destinationSemi};
    }
    function shiftBowLabel(){
      const mode=shiftBowEl?.value||'free';
      if(mode==='same')return 'Mismo arco'; if(mode==='change')return 'Cambio de arco'; if(mode==='alternate')return shiftPracticeCompleted%2===0?'↓ → ↑':'↑ → ↓'; return 'Libre';
    }
    function updateShiftPreview(){
      const p=buildShiftPracticePlan(); if(!p){
        if(shiftOriginReadout)shiftOriginReadout.textContent='—';if(shiftDestinationReadout)shiftDestinationReadout.textContent='—';if(shiftFingerReadout)shiftFingerReadout.textContent='—';return;
      }
      shiftOriginReadout.textContent=`${positionLabel(p.origin).replace(' · guía','')} · ${midiLabel(p.originMidi)}`;
      shiftDestinationReadout.textContent=`${positionLabel(p.destination).replace(' · guía','')} · ${midiLabel(p.destinationMidi)}`;
      shiftFingerReadout.textContent=p.finger==='T'?'Pulgar':'Dedo '+p.finger;
      shiftBowReadout.textContent=shiftBowLabel();
      shiftPracticeGuide.textContent=SHIFT_GUIDES[shiftMotionEl?.value||'guide'];
    }
    function sendShiftDestinationToIntonation(){
      const p=shiftPracticePlan||buildShiftPracticePlan(); if(!p)return;
      intonationFineOffsetCents=0;intonationTargetModeEl.value='manual';
      if([...intonationNoteEl.options].some(o=>o.value===String(p.destinationMidi)))intonationNoteEl.value=String(p.destinationMidi);
      updateIntonationTargetUI();
      intonationStatus.textContent=`Llegada del cambio: ${midiLabel(p.destinationMidi)} · ${midiFrequency(p.destinationMidi,currentA4()).toFixed(2)} Hz.`;
    }
    function startShiftPractice(){
      if(shiftPracticeRunning){stopShiftPractice('Ejercicio detenido.');return;}
      shiftPracticePlan=buildShiftPracticePlan();
      if(!shiftPracticePlan){shiftPracticeStatus.textContent='Elige posiciones de origen y destino diferentes que compartan una digitación utilizable.';return;}
      shiftPracticeRunning=true;shiftPracticePhase='origin';shiftPracticeCompleted=0;
      shiftPracticePanel?.classList.add('is-running');shiftPracticeStart.textContent='Detener';shiftStepEl.textContent=`1 / ${shiftRepetitionsEl?.value||4} · origen`;
      shiftPracticeStatus.textContent='Toca/clickea primero la nota de origen resaltada.';
      if(shiftUseIntonationEl?.checked)sendShiftDestinationToIntonation();
      updateShiftPreview();draw();
    }
    function stopShiftPractice(message='Ejercicio completado.'){
      shiftPracticeRunning=false;shiftPracticePanel?.classList.remove('is-running');if(shiftPracticeStart)shiftPracticeStart.textContent='Iniciar ejercicio';
      if(shiftStepEl)shiftStepEl.textContent='—'; if(shiftPracticeStatus)shiftPracticeStatus.textContent=message;draw();
    }
    function expectedShiftCell(){
      if(!shiftPracticeRunning||!shiftPracticePlan)return null;
      return {s:shiftPracticePlan.string,semi:shiftPracticePhase==='origin'?shiftPracticePlan.originSemi:shiftPracticePlan.destinationSemi};
    }
    function advanceShiftPractice(){
      if(shiftPracticePhase==='origin'){
        shiftPracticePhase='destination';shiftStepEl.textContent=`${shiftPracticeCompleted+1} / ${shiftRepetitionsEl?.value||4} · llegada`;
        shiftPracticeStatus.textContent='Desplaza la mano como una unidad y llega a la posición destino.';
      }else{
        shiftPracticeCompleted++;
        const total=+(shiftRepetitionsEl?.value||4);
        if(shiftPracticeCompleted>=total){stopShiftPractice(`Completado: ${total} cambios de posición.`);return;}
        shiftPracticePhase='origin';shiftStepEl.textContent=`${shiftPracticeCompleted+1} / ${total} · origen`;
        shiftPracticeStatus.textContent='Regresa al origen y repite el cambio con el mismo gesto.';
      }
      updateShiftPreview();draw();
    }
    function handleShiftClick(cell){
      const rows=rowsList(),semi=rows[cell.i].semi,expected=expectedShiftCell();if(!expected)return false;
      const midi=activePitches()[cell.s]+semi;playNote(midi,1.25);
      if(cell.s!==expected.s||semi!==expected.semi){shiftPracticeStatus.textContent=`Busca ${shiftPracticePhase==='origin'?'el origen':'la llegada'} en cuerda ${expected.s+1}, referencia +${expected.semi}.`;return true;}
      if(shiftPracticePhase==='destination'&&shiftUseIntonationEl?.checked)sendShiftDestinationToIntonation();
      advanceShiftPractice();return true;
    }
    if(shiftPracticeStart)shiftPracticeStart.addEventListener('click',startShiftPractice);
    if(shiftPlayOrigin)shiftPlayOrigin.addEventListener('click',()=>{const p=shiftPracticePlan||buildShiftPracticePlan();if(p)playNote(p.originMidi,1.4);});
    if(shiftPlayDestination)shiftPlayDestination.addEventListener('click',()=>{const p=shiftPracticePlan||buildShiftPracticePlan();if(p)playNote(p.destinationMidi,1.4);});
    if(shiftSendToIntonation)shiftSendToIntonation.addEventListener('click',sendShiftDestinationToIntonation);
    [shiftStringEl,shiftOriginEl,shiftDestinationEl,shiftGuideFingerEl,shiftMotionEl,shiftBowEl,shiftRepetitionsEl,shiftUseIntonationEl].filter(Boolean).forEach(el=>el.addEventListener('change',()=>{if(shiftPracticeRunning)stopShiftPractice('Ajustes modificados · inicia de nuevo el ejercicio.');updateShiftPreview();try{saveStringsPrefs();}catch(e){}}));



    /***************** Dobles cuerdas · intervalos y afinación relativa *************************/
    const DOUBLE_STOP_INTERVALS={
      0:{label:'Unísono',ratio:[1,1]},3:{label:'3ª menor',ratio:[6,5]},4:{label:'3ª mayor',ratio:[5,4]},
      5:{label:'4ª justa',ratio:[4,3]},7:{label:'5ª justa',ratio:[3,2]},8:{label:'6ª menor',ratio:[8,5]},
      9:{label:'6ª mayor',ratio:[5,3]},12:{label:'Octava',ratio:[2,1]}
    };
    let doubleStopPlan=null,doubleStopOverlayArmed=false,doubleStopDroneOsc=null,doubleStopDroneGain=null;
    const ratioCents=([n,d])=>1200*Math.log2(n/d);
    const pureOffsetForInterval=semi=>ratioCents(DOUBLE_STOP_INTERVALS[semi]?.ratio||[1,1])-semi*100;

    function populateDoubleStopPairs(keep){
      if(!doubleStopPairEl)return;const ins=activeInstrument(),wanted=keep??doubleStopPairEl.value;doubleStopPairEl.length=0;
      for(let i=0;i<ins.pitches.length-1;i++)doubleStopPairEl.add(new Option(`${i+1}ª–${i+2}ª · ${ins.names[i]}–${ins.names[i+1]}`,`${i},${i+1}`));
      if([...doubleStopPairEl.options].some(o=>o.value===wanted))doubleStopPairEl.value=wanted;
    }
    function doubleStopTechnique(semi){
      const candidates=techniqueCandidatesForSemi(semi),zone=doubleStopZoneEl?.value||'auto',wanted=techPositionSel?.value||'free';
      if(zone==='position'&&wanted!=='free')return candidates.find(c=>c.position===wanted)||candidates[0]||{finger:'',position:'free',positionLabel:'Libre'};
      return candidates.find(c=>c.position!=='free')||candidates[0]||{finger:'',position:'free',positionLabel:'Libre'};
    }
    function buildDoubleStopPlan(){
      if(!doubleStopPairEl)return null;const [a,b]=(doubleStopPairEl.value||'0,1').split(',').map(Number),ins=activeInstrument(),interval=+(doubleStopIntervalEl?.value||4);
      if(!Number.isFinite(a)||!Number.isFinite(b)||!ins.pitches[a]||!Number.isFinite(ins.pitches[b]))return null;
      const maxSemi=Math.min(28,numBlocks*7),zone=doubleStopZoneEl?.value||'auto',wanted=techPositionSel?.value||'free';let best=null;
      for(let sa=0;sa<=maxSemi;sa++)for(let sb=0;sb<=maxSemi;sb++){
        const ma=ins.pitches[a]+sa,mb=ins.pitches[b]+sb;if(Math.abs(ma-mb)!==interval)continue;
        const ta=doubleStopTechnique(sa),tb=doubleStopTechnique(sb);let score=Math.max(sa,sb)*.16+Math.abs(sa-sb)*.24+(sa===0?-.25:0)+(sb===0?-.25:0);
        if(zone==='low')score+=(sa+sb)*.32;
        if(zone==='position'&&wanted!=='free'){if(ta.position!==wanted&&ta.position!=='open')score+=8;if(tb.position!==wanted&&tb.position!=='open')score+=8;}
        const lower=ma<=mb?{string:a,semi:sa,midi:ma,tech:ta}:{string:b,semi:sb,midi:mb,tech:tb};
        const upper=ma<=mb?{string:b,semi:sb,midi:mb,tech:tb}:{string:a,semi:sa,midi:ma,tech:ta};
        if(!best||score<best.score)best={a,b,interval,lower,upper,score};
      }
      if(best){const def=DOUBLE_STOP_INTERVALS[interval];best.ratio=def.ratio;best.label=def.label;best.pureOffset=pureOffsetForInterval(interval);}
      return best;
    }
    function fingerText(rec){if(rec.semi===0)return `cuerda ${rec.string+1} al aire`;const f=rec.tech?.finger;return `cuerda ${rec.string+1} · +${rec.semi}${f?` · ${f==='T'?'pulgar':'dedo '+f}`:''}`;}
    function updateDoubleStopUI(){
      doubleStopPlan=buildDoubleStopPlan();if(!doubleStopPlan){doubleStopPanel?.classList.remove('is-ready');doubleStopStatus.textContent='No encontré una combinación cómoda en la zona visible. Amplía las líneas o cambia de par/posición.';return;}
      const p=doubleStopPlan,pure=(doubleStopTemperamentEl?.value||'equal')==='pure',offset=pure?p.pureOffset:0;doubleStopPanel?.classList.add('is-ready');
      doubleStopLowerEl.textContent=`${midiLabel(p.lower.midi)} · cuerda ${p.lower.string+1}`;doubleStopUpperEl.textContent=`${midiLabel(p.upper.midi)} · cuerda ${p.upper.string+1}`;
      doubleStopFingeringEl.textContent=`${fingerText(p.lower)} / ${fingerText(p.upper)}`;doubleStopCentsEl.textContent=pure?(Math.abs(offset)<.05?'0¢':`${offset>0?'+':''}${offset.toFixed(1)}¢ en la nota superior`):'0¢ · temperamento igual';
      doubleStopRatioEl.textContent=pure?`${p.ratio[0]}:${p.ratio[1]}`:'ET';
      doubleStopGuide.textContent=pure?`${p.label}: conserva la nota inferior como referencia y ajusta la superior ${Math.abs(offset)<.05?'sin corrección adicional':`${Math.abs(offset).toFixed(1)} cents ${offset>0?'más alta':'más baja'} que el temperamento igual`}. Escucha la estabilidad de la resonancia, no solo la aguja.`:`${p.label}: ambas referencias están en temperamento igual. Usa “Afinación relativa pura” para practicar la relación simple del intervalo.`;
      doubleStopStatus.textContent='Intervalo preparado. Puedes escuchar cada nota, la doble cuerda o mantener una como drone.';draw();
    }
    function doubleStopFrequencies(){if(!doubleStopPlan)return null;const p=doubleStopPlan,lower=midiFrequency(p.lower.midi,currentA4()),pure=(doubleStopTemperamentEl?.value||'equal')==='pure';return {lower,upper:pure?lower*(p.ratio[0]/p.ratio[1]):midiFrequency(p.upper.midi,currentA4())};}
    function playDoubleStopNote(which){if(!doubleStopPlan)updateDoubleStopUI();if(!doubleStopPlan)return;const freqs=doubleStopFrequencies(),rec=doubleStopPlan[which],freq=freqs[which];if((doubleStopTemperamentEl?.value||'equal')==='pure'&&which==='upper')playReferenceFrequency(freq,1.5);else playNote(rec.midi,1.5);doubleStopStatus.textContent=`Referencia ${which==='lower'?'inferior':'superior'}: ${midiLabel(rec.midi)} · ${freq.toFixed(2)} Hz.`;}
    function playDoubleStopTogetherNow(){if(!doubleStopPlan)updateDoubleStopUI();if(!doubleStopPlan)return;const f=doubleStopFrequencies(),pure=(doubleStopTemperamentEl?.value||'equal')==='pure';if(pure){playReferenceFrequency(f.lower,1.8,.07);playReferenceFrequency(f.upper,1.8,.07);}else{playNote(doubleStopPlan.lower.midi,1.8);playNote(doubleStopPlan.upper.midi,1.8);}doubleStopStatus.textContent='Escucha batimientos, estabilidad y resonancia del intervalo. Evita “perseguir” el sonido con vibrato mientras comparas.';}
    function stopDoubleStopDrone(){try{const ctx=ensureCtx();doubleStopDroneGain?.gain.setTargetAtTime(.0001,ctx.currentTime,.03);doubleStopDroneOsc?.stop(ctx.currentTime+.15);}catch(e){}doubleStopDroneOsc=null;doubleStopDroneGain=null;if(doubleStopDrone)doubleStopDrone.textContent='Iniciar drone';}
    function toggleDoubleStopDrone(){
      if(doubleStopDroneOsc){stopDoubleStopDrone();doubleStopStatus.textContent='Drone detenido.';return;}if(!doubleStopPlan)updateDoubleStopUI();if(!doubleStopPlan)return;const mode=doubleStopDroneModeEl?.value||'lower';if(mode==='off'){doubleStopStatus.textContent='Selecciona una fuente de drone.';return;}
      const f=doubleStopFrequencies(),p=doubleStopPlan;let freq,label;if(mode==='upper'){freq=f.upper;label=midiLabel(p.upper.midi);}else if(mode==='open'){const idx=Math.max(p.lower.string,p.upper.string),m=activePitches()[idx];freq=midiFrequency(m,currentA4());label=`${midiLabel(m)} · cuerda ${idx+1} al aire`;}else{freq=f.lower;label=midiLabel(p.lower.midi);}
      const ctx=ensureCtx();doubleStopDroneOsc=ctx.createOscillator();doubleStopDroneGain=ctx.createGain();doubleStopDroneOsc.type='sine';doubleStopDroneOsc.frequency.value=freq;doubleStopDroneGain.gain.value=.0001;doubleStopDroneOsc.connect(doubleStopDroneGain);doubleStopDroneGain.connect(masterBus);doubleStopDroneOsc.start();doubleStopDroneGain.gain.exponentialRampToValueAtTime(.07,ctx.currentTime+.08);doubleStopDrone.textContent='Detener drone';doubleStopStatus.textContent=`Drone activo: ${label} · ${freq.toFixed(2)} Hz.`;
    }
    function sendDoubleStopToIntonation(which){if(!doubleStopPlan)updateDoubleStopUI();if(!doubleStopPlan)return;const rec=doubleStopPlan[which],pure=(doubleStopTemperamentEl?.value||'equal')==='pure';intonationFineOffsetCents=(which==='upper'&&pure)?doubleStopPlan.pureOffset:0;intonationTargetModeEl.value='manual';if([...intonationNoteEl.options].some(o=>o.value===String(rec.midi)))intonationNoteEl.value=String(rec.midi);updateIntonationTargetUI();intonationStatus.textContent=`Objetivo desde dobles cuerdas: ${midiLabel(rec.midi)}${Math.abs(intonationFineOffsetCents)>.05?` · ${intonationFineOffsetCents>0?'+':''}${intonationFineOffsetCents.toFixed(1)}¢`:''}. Verifica una sola nota a la vez con el micrófono.`;}
    if(doubleStopAnalyze)doubleStopAnalyze.addEventListener('click',()=>{doubleStopOverlayArmed=true;updateDoubleStopUI();});
    if(doubleStopPlayLower)doubleStopPlayLower.addEventListener('click',()=>playDoubleStopNote('lower'));if(doubleStopPlayUpper)doubleStopPlayUpper.addEventListener('click',()=>playDoubleStopNote('upper'));if(doubleStopPlayTogether)doubleStopPlayTogether.addEventListener('click',playDoubleStopTogetherNow);if(doubleStopDrone)doubleStopDrone.addEventListener('click',toggleDoubleStopDrone);if(doubleStopTuneLower)doubleStopTuneLower.addEventListener('click',()=>sendDoubleStopToIntonation('lower'));if(doubleStopTuneUpper)doubleStopTuneUpper.addEventListener('click',()=>sendDoubleStopToIntonation('upper'));
    [doubleStopPairEl,doubleStopIntervalEl,doubleStopTemperamentEl,doubleStopZoneEl,doubleStopDroneModeEl].filter(Boolean).forEach(el=>el.addEventListener('change',()=>{stopDoubleStopDrone();updateDoubleStopUI();try{saveStringsPrefs();}catch(e){}}));


    /***************** Geometría del diapasón (cónico) *************************/
    const BOARD_X=76, COL_W=64, NUT_GAP=30, BODY_GAP=36, PAD_Y=46;

    function rowsList(){ return buildRows(numBlocks); }
    function colCount(){ return numBlocks*POSITION_LABELS.length; }

    function rowX(i){
      const boardW=colCount()*COL_W;
      const base=i===0 ? BOARD_X : BOARD_X + (i-1)*COL_W + COL_W/2;
      return orientationSel?.value==='left' ? (BOARD_X+boardW)-(base-BOARD_X) : base;
    }
    function rowT(i){
      const t=i===0 ? 0 : ((i-1)+0.5)/colCount();
      return orientationSel?.value==='left' ? 1-t : t;
    }
    function gapAt(t){ return NUT_GAP + (BODY_GAP-NUT_GAP)*t; }
    function stringY(s,t,stringCount,centerY){ return centerY + (s-(stringCount-1)/2)*gapAt(t); }

    function fitCanvas(){
      const rows=rowsList(), boardW=colCount()*COL_W, w=BOARD_X+boardW+24, h=PAD_Y*2+BODY_GAP*3+20;
      const dpr=window.devicePixelRatio||1;
      cvs.style.width=`${w}px`; cvs.style.height=`${h}px`;
      cvs.width=w*dpr; cvs.height=h*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
      return {w,h};
    }

    function cellCenter(rowIdx,stringIdx){
      const pitches=activePitches(), stringCount=pitches.length, centerY=PAD_Y+BODY_GAP*1.5;
      const t=rowT(rowIdx), x=rowX(rowIdx), y=stringY(stringIdx,t,stringCount,centerY);
      return {x,y};
    }

    /***************** PENTAGRAMA SVG (adaptado de requinto) *************************/
    const svg = document.getElementById('staffSvg');
    const SVG_W = 2100, SVG_H = 2100;
    const STAFF_Y0 = 600, STAFF_LINE_SPACING = 220, STAFF_X1 = 90, STAFF_X2 = 2000;

    function svgEl(tag, attrs) {
      const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
      for(const k in attrs) e.setAttribute(k, attrs[k]);
      return e;
    }

    function placeClef(glyph, leftX, topY, bottomY, extraScale = 1.4) {
      const probe = svgEl('text', { x: 0, y: 0, 'font-size': 200, 'font-family': 'serif' });
      probe.textContent = glyph;
      svg.appendChild(probe);
      const bbox = probe.getBBox();
      svg.removeChild(probe);
      if(!bbox.height) return;
      const targetHeight = bottomY - topY;
      let scale = (targetHeight / bbox.height) * extraScale;
      const dx = leftX - bbox.x * scale;
      const dy = topY - bbox.y * scale;
      const g = svgEl('g', { transform: `translate(${dx},${dy}) scale(${scale})` });
      const text = svgEl('text', { x: 0, y: 0, 'font-size': 200, 'font-family': 'serif', fill: '#333' });
      text.textContent = glyph;
      g.appendChild(text);
      svg.appendChild(g);
    }

    const CLEF_BOTTOM_DIATONIC={treble:30, bass:18, alto:24, tenor:22}; // línea inferior: E4, G2, F3, D3
    const DIATONIC_LETTERS=['C','D','E','F','G','A','B'];
    const SHARP_ORDER=['F','C','G','D','A','E','B'];
    const FLAT_ORDER=['B','E','A','D','G','C','F'];
    const SHARP_SPELLINGS={0:{letter:'C',acc:null},1:{letter:'C',acc:'sharp'},2:{letter:'D',acc:null},3:{letter:'D',acc:'sharp'},4:{letter:'E',acc:null},5:{letter:'F',acc:null},6:{letter:'F',acc:'sharp'},7:{letter:'G',acc:null},8:{letter:'G',acc:'sharp'},9:{letter:'A',acc:null},10:{letter:'A',acc:'sharp'},11:{letter:'B',acc:null}};
    const FLAT_SPELLINGS={0:{letter:'C',acc:null},1:{letter:'D',acc:'flat'},2:{letter:'D',acc:null},3:{letter:'E',acc:'flat'},4:{letter:'E',acc:null},5:{letter:'F',acc:null},6:{letter:'G',acc:'flat'},7:{letter:'G',acc:null},8:{letter:'A',acc:'flat'},9:{letter:'A',acc:null},10:{letter:'B',acc:'flat'},11:{letter:'B',acc:null}};
    const MODE_KEYSIG_OFFSETS={mayor:0,jonico:0,dorico:10,frigio:8,lidio:7,mixolidio:5,eolico:3,locrio:1,menor_melodica:3,menor_armonica:3,pentatonica_mayor:0};
    const MAJOR_KEY_SIGNATURES={C:0,G:1,D:2,A:3,E:4,B:5,'F#':6,'C#':7,F:-1,'Bb':-2,'Eb':-3,'Ab':-4,'Db':-5,'Gb':-6,'Cb':-7};
    const PC_TO_MAJOR_KEY={0:'C',1:'Db',2:'D',3:'Eb',4:'E',5:'F',6:'Gb',7:'G',8:'Ab',9:'A',10:'Bb',11:'B'};
    const KEYSIG_POSITIONS={
      treble:{sharp:['F5','C5','G5','D5','A4','E5','B4'],flat:['B4','E5','A4','D5','G4','C5','F4']},
      bass:{sharp:['F3','C3','G3','D3','A2','E3','B2'],flat:['B2','E3','A2','D3','G2','C3','F2']},
      alto:{sharp:['F4','C4','G4','D4','A3','E4','B3'],flat:['B3','E4','A3','D4','G3','C4','F3']},
      tenor:{sharp:['F4','C4','G4','D4','A3','E4','B3'],flat:['B3','E4','A3','D4','G3','C4','F3']}
    };
    let currentStaffMeta={clef:'treble',keySig:null,noteBaseX:(STAFF_X1+STAFF_X2)/2};

    function diatonicIndexFromLetterOctave(letter,octave){
      return octave*7+DIATONIC_LETTERS.indexOf(letter);
    }
    function parsePitchToken(token){
      const m=/^([A-G])([b#]?)(\d+)$/.exec(token||'');
      if(!m)return null;
      return {letter:m[1],acc:m[2]==='#'?'sharp':m[2]==='b'?'flat':null,octave:+m[3]};
    }
    function automaticKeySignature(){
      const rootName=rootSel?.value||'';
      const scaleName=scaleSel?.value||'';
      if(!rootName||!scaleName)return null;
      if(!(scaleName in MODE_KEYSIG_OFFSETS))return null;
      const rootPc=NOTE.indexOf(rootName);
      if(rootPc<0)return null;
      const majorPc=(rootPc+MODE_KEYSIG_OFFSETS[scaleName])%12;
      const keyName=PC_TO_MAJOR_KEY[majorPc]||'C';
      const count=MAJOR_KEY_SIGNATURES[keyName];
      if(typeof count!=='number')return null;
      return {name:keyName,count,prefer:count<0?'flats':'sharps',source:'auto'};
    }
    function selectedKeySignature(){
      const value=keySignatureSel?.value??'auto';
      if(value==='none')return null;
      if(value==='auto')return automaticKeySignature();
      const count=Number(value);
      if(!Number.isFinite(count))return null;
      return {name:keySignatureSel?.selectedOptions?.[0]?.textContent||'',count,prefer:count<0?'flats':'sharps',source:'manual'};
    }
    function keySigExpectedAccidental(letter,keySig){
      if(!keySig||!keySig.count)return null;
      if(keySig.count>0)return SHARP_ORDER.slice(0,keySig.count).includes(letter)?'sharp':null;
      return FLAT_ORDER.slice(0,Math.abs(keySig.count)).includes(letter)?'flat':null;
    }
    function spellMidiForStaff(displayMidi,keySig){
      const pc=((displayMidi%12)+12)%12;
      const spellingMode=spellingModeSel?.value||'auto';
      const preferFlats=spellingMode==='flats'||(spellingMode==='auto'&&keySig&&keySig.prefer==='flats');
      const base=(preferFlats?FLAT_SPELLINGS:SHARP_SPELLINGS)[pc]||SHARP_SPELLINGS[pc];
      const octave=Math.floor(displayMidi/12)-1;
      return {pc,letter:base.letter,acc:base.acc,octave};
    }
    function visibleAccidentalForSpelling(spelling,keySig){
      const expected=keySigExpectedAccidental(spelling.letter,keySig);
      if(spelling.acc===expected)return null;
      if(!spelling.acc&&expected)return 'natural';
      return spelling.acc;
    }
    function accidentalGlyph(kind){
      return kind==='sharp'?'♯':kind==='flat'?'♭':kind==='natural'?'♮':'';
    }
    function drawKeySignature(clef,keySig){
      if(!keySig||!keySig.count)return {width:0};
      const kind=keySig.count>0?'sharp':'flat';
      const count=Math.abs(keySig.count);
      const positions=KEYSIG_POSITIONS[clef]?.[kind]||KEYSIG_POSITIONS.treble[kind];
      const bottomIndex=CLEF_BOTTOM_DIATONIC[clef]??CLEF_BOTTOM_DIATONIC.treble;
      const yFromStep=(step)=>{ const bottom=STAFF_Y0+4*STAFF_LINE_SPACING; return bottom-(step-4)*(STAFF_LINE_SPACING/2); };
      const startX=clef==='bass'?650:clef==='alto'||clef==='tenor'?700:720;
      const gap=92;
      for(let i=0;i<count;i++){
        const info=parsePitchToken(positions[i]);
        if(!info)continue;
        const step=4+(diatonicIndexFromLetterOctave(info.letter,info.octave)-bottomIndex);
        const y=yFromStep(step);
        const text=svgEl('text',{class:'key-sig-el',x:startX+i*gap,y:y+72,'font-size':205,fill:'#222','font-family':'serif','text-anchor':'middle'});
        text.textContent=kind==='sharp'?'♯':'♭';
        svg.appendChild(text);
      }
      return {width:count*gap+35,startX};
    }

    function chooseStaffClef(notes){
      const key=instrumentSel.value;
      if(key==='violin')return 'treble';
      if(key==='bass')return 'bass';
      const written=(notes||[]).map(n=>n.midi+(activeInstrument().writtenTranspose||0)).sort((a,b)=>a-b);
      const median=written.length?written[Math.floor(written.length/2)]:null;
      if(key==='viola')return median!==null&&median>=76?'treble':'alto';
      if(key==='cello'){
        if(median!==null&&median>=72)return 'treble';
        if(median!==null&&median>=60)return 'tenor';
        return 'bass';
      }
      return activeInstrument().primaryClef||'treble';
    }

    function drawBaseStaff(clef = 'treble') {
      svg.innerHTML = '';
      svg.setAttribute('viewBox', '0 0 ' + SVG_W + ' ' + SVG_H);
      for(let i=0; i<5; i++) {
        const y = STAFF_Y0 + i * STAFF_LINE_SPACING;
        svg.appendChild(svgEl('line', {x1:STAFF_X1,x2:STAFF_X2,y1:y,y2:y,stroke:'#000','stroke-width':7}));
      }
      const clefY = STAFF_Y0 - 3.2 * STAFF_LINE_SPACING;
      if(clef === 'bass') {
        const y=clefY+470; placeClef('𝄢', STAFF_X1-5, y-1, y+1, 600);
      } else if(clef === 'alto' || clef === 'tenor') {
        // Glifo de clave de Do; posición vertical diferenciada por el tipo de clave.
        const cY = clef==='alto' ? STAFF_Y0+2*STAFF_LINE_SPACING : STAFF_Y0+3*STAFF_LINE_SPACING;
        const t=svgEl('text',{x:STAFF_X1+55,y:cY+85,'font-size':520,'font-family':'serif',fill:'#333','text-anchor':'middle'});
        t.textContent='𝄡'; svg.appendChild(t);
      } else {
        placeClef('𝄞', STAFF_X1 - 5, clefY - 1, clefY + 1, 1100);
      }
      const keySig=selectedKeySignature();
      const keySigLayout=drawKeySignature(clef,keySig);
      const clefRight=clef==='bass'?620:clef==='alto'||clef==='tenor'?660:680;
      const sigRight=keySig&&keySig.count ? keySigLayout.startX+Math.max(0,Math.abs(keySig.count)-1)*92+95 : clefRight;
      currentStaffMeta={
        clef,
        keySig,
        noteBaseX:Math.max(1220,sigRight+260),
        keySigWidth:keySigLayout.width||0
      };
      svg.appendChild(svgEl('line',{x1:STAFF_X1,x2:STAFF_X1,y1:STAFF_Y0,y2:STAFF_Y0+4*STAFF_LINE_SPACING,stroke:'#000','stroke-width':5}));
      svg.appendChild(svgEl('line',{x1:STAFF_X2,x2:STAFF_X2,y1:STAFF_Y0,y2:STAFF_Y0+4*STAFF_LINE_SPACING,stroke:'#000','stroke-width':5}));
    }

    function renderStaffNotes(notes, forcedClef) {
      svg.querySelectorAll('.staff-note-el').forEach(e => e.remove());
      if(!notes || notes.length === 0) return;
      const clef=forcedClef||chooseStaffClef(notes);
      const keySig=currentStaffMeta?.keySig??selectedKeySignature();
      const sorted = notes.slice().sort((a,b) => a.midi - b.midi);
      function yFromStep(step){
        const bottom=STAFF_Y0+4*STAFF_LINE_SPACING;
        return bottom-(step-4)*(STAFF_LINE_SPACING/2);
      }
      const bottomIndex=CLEF_BOTTOM_DIATONIC[clef]??CLEF_BOTTOM_DIATONIC.treble;
      const baseX=currentStaffMeta?.noteBaseX||Math.max(1105,(STAFF_X1+STAFF_X2)/2+10);
      const LEDGER_LENGTH=240;
      let prevStep=null, shiftToggle=false;
      sorted.forEach(n=>{
        const displayMidi=n.midi+(activeInstrument().writtenTranspose||0);
        const spelling=spellMidiForStaff(displayMidi,keySig);
        const step=4+(diatonicIndexFromLetterOctave(spelling.letter,spelling.octave)-bottomIndex);
        const y=yFromStep(step);
        if(prevStep!==null&&Math.abs(step-prevStep)<=1)shiftToggle=!shiftToggle;else shiftToggle=false;
        prevStep=step;
        const x=baseX+(shiftToggle?260:0);
        const ledgers=[];
        if(step<4){for(let l=2;l>=step;l-=2)ledgers.push(l);}else if(step>12){for(let l=14;l<=step;l+=2)ledgers.push(l);}
        ledgers.forEach(L=>svg.appendChild(svgEl('line',{class:'staff-note-el',x1:x-LEDGER_LENGTH,x2:x+LEDGER_LENGTH,y1:yFromStep(L),y2:yFromStep(L),stroke:'#000','stroke-width':5})));
        const visibleAcc=visibleAccidentalForSpelling(spelling,keySig);
        if(visibleAcc){
          const accidental=svgEl('text',{class:'staff-note-el',x:x-235,y:y+64,'font-size':235,fill:'#222','font-family':'serif','text-anchor':'middle'});
          accidental.textContent=accidentalGlyph(visibleAcc); svg.appendChild(accidental);
        }
        svg.appendChild(svgEl('ellipse',{class:'staff-note-el',cx:x,cy:y,rx:110,ry:100,fill:'#000',stroke:'#222','stroke-width':1.5}));
        const lbl=svgEl('text',{class:'staff-note-el',x:x,y:y+3,'font-size':100,'text-anchor':'middle','dominant-baseline':'central',fill:'#fff','font-weight':'bold'});
        lbl.textContent=spelling.letter; svg.appendChild(lbl);
      });
    }

    /***************** CARGA DE PARTITURAS (PDF, MusicXML, imagen, web) *************************/
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
    const scoreTempo = document.getElementById('scoreTempo');
    const scoreTempoDown = document.getElementById('scoreTempoDown');
    const scoreTempoUp = document.getElementById('scoreTempoUp');
    const scoreZoomOutBtn = document.getElementById('scoreZoomOutBtn');
    const scoreZoomInBtn = document.getElementById('scoreZoomInBtn');
    const scoreLoopStartBtn = document.getElementById('scoreLoopStartBtn');
    const scoreLoopEndBtn = document.getElementById('scoreLoopEndBtn');
    const scoreLoopBtn = document.getElementById('scoreLoopBtn');
    const scoreLoopClearBtn = document.getElementById('scoreLoopClearBtn');
    const scoreLoopRepeats = document.getElementById('scoreLoopRepeats');
    const scoreBpmIncrement = document.getElementById('scoreBpmIncrement');
    const scoreIncrementEvery = document.getElementById('scoreIncrementEvery');
    const scoreCountIn = document.getElementById('scoreCountIn');
    const scoreSyncMetro = document.getElementById('scoreSyncMetro');

    let osmd = null;
    let currentPdfUrl = null;
    let currentImageUrl = null;

    // Estado de zoom/pan de imagen
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

    // ---------- SONIDO PARA LA PRÁCTICA DE PARTITURAS (sostenido hasta apagarlo) ----------
    const scoreActiveNotes = new Map(); // midi -> nodo de audio activo
    const scoreHighlightMidis = new Set(); // midis actualmente resaltados en diapasón/pentagrama

    function scoreNoteOn(midi) {
      if (!soundEnabled) return;
      const ctx = ensureCtx();
      if (!ctx) return;
      const vol = parseFloat(volumeSlider.value) / 10;
      if (isNaN(vol) || vol <= 0) return;
      scoreNoteOff(midi);
      scoreHighlightMidis.add(midi);
      draw();
      if (sfPlayer) {
        try {
          const sfNote = sfPlayer.play(midi, ctx.currentTime, { gain: vol });
          if (sfNote) {
            scoreActiveNotes.set(midi, { type: 'sf', node: sfNote });
            return;
          }
        } catch(e) { console.warn('Error al tocar nota de la partitura:', e); }
      }
      // Fallback oscilador, sostenido hasta llamar a scoreNoteOff
      const freq = 440 * Math.pow(2, (midi - 69) / 12);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol * 0.3, ctx.currentTime + 0.02);
      osc.connect(gain);
      gain.connect(masterBus);
      osc.start(ctx.currentTime);
      scoreActiveNotes.set(midi, { type: 'osc', osc, gain });
    }

    function scoreNoteOff(midi) {
      const entry = scoreActiveNotes.get(midi);
      scoreHighlightMidis.delete(midi);
      draw();
      if (!entry) return;
      const ctx = audioCtx;
      try {
        if (entry.type === 'sf') {
          if (entry.node && typeof entry.node.stop === 'function') entry.node.stop(ctx.currentTime);
        } else {
          entry.gain.gain.cancelScheduledValues(ctx.currentTime);
          entry.gain.gain.setValueAtTime(entry.gain.gain.value, ctx.currentTime);
          entry.gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);
          entry.osc.stop(ctx.currentTime + 0.06);
        }
      } catch(e) {}
      scoreActiveNotes.delete(midi);
    }

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

    function getTempo() { return parseFloat(scoreTempo.value) || 100; }

    let scorePlaying = false;
    let scorePlaybackTimer = null;
    let currentStepIndex = -1;
    const scoreActiveMidis = new Set();

    // ---------- LOOP / REPETICIÓN DE UN TRAMO ----------
    let loopStart = null;
    let loopEnd = null;
    let loopEnabled = false;
    let loopPassCount = 0;
    let scoreStartedMetro = false;
    let scoreCountInTimers = [];
    let scoreCountInActive = false;

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
      loopPassCount = 0;
      updateLoopUI();
    }

    function toggleLoop() {
      if (loopStart === null || loopEnd === null) return;
      if (loopEnabled) {
        loopEnabled = false;
        loopPassCount = 0;
        stopPlaybackAudio();
        updateLoopUI();
      } else {
        loopEnabled = true;
        loopPassCount = 0;
        stopPlaybackAudio();
        jumpToStep(loopStart);
        scorePlaying = true;
        updateLoopUI();
        scheduleScoreStep();
      }
    }

    function stopScoreCountIn(){
      scoreCountInTimers.forEach(t=>clearTimeout(t));
      scoreCountInTimers=[];
      scoreCountInActive=false;
    }
    function stopScoreOwnedMetro(){
      try{
        if(scoreStartedMetro && typeof stopMetro==='function' && typeof metroRunning!=='undefined' && metroRunning) stopMetro();
      }catch(e){}
      scoreStartedMetro=false;
    }
    function stopPlaybackAudio() {
      scorePlaying = false;
      stopScoreCountIn();
      if (scorePlaybackTimer) { clearTimeout(scorePlaybackTimer); scorePlaybackTimer = null; }
      scoreActiveMidis.forEach(midi => scoreNoteOff(midi));
      scoreActiveMidis.clear();
    }
    function pausePlayback() { stopPlaybackAudio(); stopScoreOwnedMetro(); }
    function fullStop() {
      stopPlaybackAudio();
      stopScoreOwnedMetro();
      loopEnabled = false;
      loopPassCount = 0;
      if (osmd && osmd.cursor) {
        try { osmd.cursor.reset(); osmd.cursor.hide(); } catch(e) {}
      }
      currentStepIndex = -1;
      try { osmdContainer.scrollLeft = 0; osmdContainer.scrollTop = 0; } catch(e) {}
      updateLoopUI();
    }

    function completedLoopPass(){
      loopPassCount++;
      const every=Math.max(1,+(scoreIncrementEvery?.value||1));
      const inc=Math.max(0,+(scoreBpmIncrement?.value||0));
      if(inc>0 && loopPassCount%every===0){
        scoreTempo.value=String(Math.min(300,Math.max(20,getTempo()+inc)));
        if(scoreSyncMetro?.checked && typeof setMetroBpm==='function') try{setMetroBpm(getTempo())}catch(e){}
      }
      const limit=Math.max(0,+(scoreLoopRepeats?.value||0));
      return limit>0 && loopPassCount>=limit;
    }

    function prepareSynchronizedMetro(){
      if(!scoreSyncMetro?.checked)return;
      try{
        if(typeof setMetroBpm==='function')setMetroBpm(getTempo());
        if(typeof metroRunning!=='undefined' && !metroRunning && typeof startMetro==='function'){
          startMetro(); scoreStartedMetro=true;
        }
      }catch(e){console.warn('No se pudo sincronizar el metrónomo:',e)}
    }

    function runScoreCountIn(onDone){
      stopScoreCountIn();
      const measures=Math.max(0,+(scoreCountIn?.value||0));
      if(!measures){onDone();return;}
      const meter=(document.getElementById('metroMeter')?.value||'4/4');
      const [numRaw,denRaw]=meter.split('/').map(Number), num=numRaw||4, den=denRaw||4;
      let pulses=num, secondsPerPulse=(60/getTempo())*(4/den);
      if(num===6 && den===8){pulses=2;secondsPerPulse=(60/getTempo())*1.5;}
      const total=pulses*measures;
      scoreCountInActive=true;
      if(scoreStatus)scoreStatus.textContent=`Entrada · ${measures} compás${measures===1?'':'es'}`;
      for(let i=0;i<total;i++){
        const timer=setTimeout(()=>{
          if(!scoreCountInActive)return;
          try{const c=ensureCtx(); if(typeof metroClick==='function')metroClick(c.currentTime+.005,i%pulses===0);}catch(e){}
          if(scoreStatus)scoreStatus.textContent=`Entrada · ${Math.floor(i/pulses)+1}:${(i%pulses)+1}`;
        },i*secondsPerPulse*1000);
        scoreCountInTimers.push(timer);
      }
      const done=setTimeout(()=>{
        scoreCountInActive=false;scoreCountInTimers=[];
        if(scoreStatus)scoreStatus.textContent='';
        onDone();
      },total*secondsPerPulse*1000);
      scoreCountInTimers.push(done);
    }

    function triggerCurrentStepNotes(tempo, hold, tutorIndex = null) {
      let stepSeconds = null;
      const tutorMidis = [];
      try {
        const entries = osmd.cursor.Iterator.CurrentVoiceEntries || [];
        entries.forEach(ve => {
          (ve.Notes || []).forEach(note => {
            if (!note || (note.isRest && note.isRest()) || note.Pitch == null) return;
            const midi = scoreMidiToSounding(note.Pitch.halfTone + 12);
            tutorMidis.push(midi);
            const lengthFraction = (note.Length && typeof note.Length.RealValue === 'number') ? note.Length.RealValue : 0.25;
            const durSeconds = lengthFraction * 4 * (60 / tempo);
            if (stepSeconds === null || durSeconds < stepSeconds) stepSeconds = durSeconds;
            scoreNoteOn(midi);
            scoreActiveMidis.add(midi);
            if (!hold) {
              setTimeout(() => {
                scoreNoteOff(midi);
                scoreActiveMidis.delete(midi);
              }, Math.max(30, durSeconds * 1000 - 30));
            }
          });
        });
      } catch(err) { console.warn('Error leyendo notas de la partitura:', err); }
      if (tutorMidis.length) updateTutorFromPlayback([...new Set(tutorMidis)], tutorIndex == null ? Math.max(0,currentStepIndex) : tutorIndex);
      if (stepSeconds === null) stepSeconds = 0.5 * (60 / tempo);
      return stepSeconds;
    }

    function scheduleScoreStep() {
      if (!scorePlaying || !osmd || !osmd.cursor || !osmd.cursor.Iterator) return;
      if (osmd.cursor.Iterator.EndReached) {
        if (loopEnabled && loopStart !== null) {
          if(completedLoopPass()){fullStop();return;}
          jumpToStep(loopStart);
          scorePlaybackTimer = setTimeout(scheduleScoreStep, 0);
          return;
        }
        fullStop();
        return;
      }
      const durationSeconds = triggerCurrentStepNotes(getTempo(), false, currentStepIndex + 1);
      if (loopEnabled && loopEnd !== null && currentStepIndex >= loopEnd) {
        scorePlaybackTimer = setTimeout(() => {
          if (!scorePlaying) return;
          if(completedLoopPass()){fullStop();return;}
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
      stopScoreOwnedMetro();
      loopPassCount=0;
      runScoreCountIn(()=>{
        if (currentStepIndex === -1) osmd.cursor.reset();
        osmd.cursor.show();
        prepareSynchronizedMetro();
        scorePlaying = true;
        // El metrónomo agenda su primer click ~60 ms por delante; aproximamos el arranque musical a ese click.
        scorePlaybackTimer=setTimeout(scheduleScoreStep,scoreSyncMetro?.checked?60:0);
      });
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
      triggerCurrentStepNotes(getTempo(), true, currentStepIndex);
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
        triggerCurrentStepNotes(getTempo(), true, currentStepIndex);
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
      if(tutorPlan[targetIndex])showTutorPlanIndex(targetIndex);
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
              scoreSteps.push({
                index: scoreSteps.length,
                left: r.left - containerRect.left + osmdContainer.scrollLeft,
                top: r.top - containerRect.top + osmdContainer.scrollTop,
                width: Math.max(r.width, 10),
                height: Math.max(r.height, 20)
              });
            }
          }
          osmd.cursor.next();
          guard++;
        }
      } catch(err) { console.warn('No se pudo generar mapa de clics:', err); scoreSteps = []; }
      try { osmd.cursor.reset(); osmd.cursor.hide(); } catch(e) {}
      currentStepIndex = -1;
      renderClickOverlay();
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
      tutorXmlEvents=[]; tutorPlan=[]; tutorExpectedCells=[]; tutorCompletedCells.clear(); tutorCurrentIndex=-1; tutorLastAssignment=null; tutorPlainXmlAvailable=false;
      if(tutorStepEl){tutorStepEl.textContent='—';tutorNoteEl.textContent='—';tutorStringEl.textContent='—';tutorFingerEl.textContent='—';tutorPositionEl.textContent='—';tutorBowEl.textContent='—';tutorTechniqueEl.textContent='Carga un MusicXML para analizar digitación, cambios de posición y articulaciones.';tutorStatusEl.textContent='';}
      scorePlayControls.classList.remove('visible');
      scoreStatus.textContent = '';
      pdfClearBtn.classList.remove('visible');
      const clef=chooseStaffClef([]);
      drawBaseStaff(clef);
      renderStaffNotes([],clef);
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
        return;
      }
      if (isMusicXML) {
        pdfViewer.style.display = 'none';
        scoreStatus.textContent = 'Cargando partitura…';
        try {
          const engine = ensureOSMD();
          const ext = name.split('.').pop();
          const content = (ext === 'mxl') ? await file.arrayBuffer() : await file.text();
          tutorXmlEvents = (ext === 'mxl') ? [] : parseMusicXMLTutor(content);
          if(tutorXmlEvents.length)buildTutorPlan();
          await engine.load(content);
          osmdContainer.classList.add('visible');
          engine.render();
          requestAnimationFrame(() => {
            try { engine.render(); buildScoreStepMap(); } catch(e) { console.warn('Error final render:', e); }
          });
          scorePlayControls.classList.add('visible');
          pdfClearBtn.classList.add('visible');
          scoreStatus.textContent = '';
          if(tutorStatusEl)tutorStatusEl.textContent=tutorXmlEvents.length?`MusicXML listo para Tutor · ${tutorXmlEvents.length} eventos detectados.`:'Partitura lista. Para técnicas completas, usa .musicxml/.xml sin comprimir.';
          const bpm = engine.Sheet && engine.Sheet.DefaultStartTempoInBpm;
          if (bpm && bpm > 0) scoreTempo.value = Math.round(bpm);
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
        scoreStatus.textContent = '';
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
    });

    // ---------- ATAJOS DE TECLADO PARA LA PARTITURA ----------
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (!osmd || !osmd.cursor) return;
        e.preventDefault();
        if (e.key === 'ArrowRight') stepForward();
        else stepBackward();
        return;
      }
      if (e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar') {
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') return;
        if (!osmd || !osmd.cursor) return;
        e.preventDefault();
        if (scorePlaying) pausePlayback();
        else playFromCurrentPosition();
      }
    });

    scoreTempo.addEventListener('change', function() {
      const bpm = parseInt(this.value) || 100;
    });

    function adjustScoreTempo(delta) {
      const min = parseInt(scoreTempo.min) || 20;
      const max = parseInt(scoreTempo.max) || 300;
      const current = parseInt(scoreTempo.value) || 100;
      const next = Math.min(max, Math.max(min, current + delta));
      scoreTempo.value = next;
      scoreTempo.dispatchEvent(new Event('change'));
    }
    scoreTempoDown.addEventListener('click', () => adjustScoreTempo(-1));
    scoreTempoUp.addEventListener('click', () => adjustScoreTempo(1));

    
    const INTERVAL_LABELS={0:"1",1:"2m",2:"2M",3:"3m",4:"3M",5:"4J",6:"4A",7:"5J",8:"6m",9:"6M",10:"7m",11:"7M"};
    const DEGREE_LABELS={0:"1",1:"♭2",2:"2",3:"♭3",4:"3",5:"4",6:"♯4",7:"5",8:"♭6",9:"6",10:"♭7",11:"7"};
    function markerLabel(pc,rootPc){
      const mode=labelModeSel?.value||"notes";
      if(mode==="notes"||rootPc<0)return NOTE[pc];
      const iv=(pc-rootPc+12)%12;
      return mode==="intervals" ? INTERVAL_LABELS[iv] : DEGREE_LABELS[iv];
    }

    /***************** Dibujado principal *************************/
    function draw(){
      const {w,h}=fitCanvas();
      const rows=rowsList(), pitches=activePitches(), stringCount=pitches.length;
      const centerY=PAD_Y+BODY_GAP*1.5, boardW=colCount()*COL_W;
      ctx.clearRect(0,0,w,h);

      // contorno cónico del diapasón
      const topNut=stringY(0,0,stringCount,centerY), botNut=stringY(stringCount-1,0,stringCount,centerY);
      const topBody=stringY(0,1,stringCount,centerY), botBody=stringY(stringCount-1,1,stringCount,centerY);
      ctx.beginPath();
      ctx.moveTo(BOARD_X,topNut);
      ctx.lineTo(BOARD_X+boardW,topBody);
      ctx.lineTo(BOARD_X+boardW,botBody);
      ctx.lineTo(BOARD_X,botNut);
      ctx.closePath();
      const bg=ctx.createLinearGradient(0,PAD_Y,0,PAD_Y+BODY_GAP*3);
      bg.addColorStop(0,"#5a3a24"); bg.addColorStop(0.5,"#2c1810"); bg.addColorStop(1,"#150b06");
      ctx.save(); ctx.fillStyle=bg; ctx.fill(); ctx.restore();
      ctx.lineWidth=2; ctx.strokeStyle="rgba(243,224,187,0.5)"; ctx.stroke();

      // líneas guía (en vez de trastes)
      rows.forEach((row,i)=>{
        if(i===0)return;
        const t=rowT(i), x=rowX(i);
        const yTop=stringY(0,t,stringCount,centerY), yBot=stringY(stringCount-1,t,stringCount,centerY);
        ctx.beginPath();
        ctx.moveTo(x,yTop-6); ctx.lineTo(x,yBot+6);
        if(row.color){
          ctx.strokeStyle=row.color; ctx.globalAlpha=0.85; ctx.lineWidth=6;
        }else{
          ctx.strokeStyle="rgba(255,250,240,0.35)"; ctx.globalAlpha=0.6; ctx.lineWidth=1.4;
          ctx.setLineDash([3,3]);
        }
        ctx.stroke();
        ctx.setLineDash([]); ctx.globalAlpha=1;
      });

      // cuerdas (líneas divergentes)
      for(let s=0;s<stringCount;s++){
        ctx.beginPath();
        ctx.moveTo(BOARD_X,stringY(s,0,stringCount,centerY));
        ctx.lineTo(BOARD_X+boardW,stringY(s,1,stringCount,centerY));
        ctx.strokeStyle="rgba(255,250,240,0.92)";
        ctx.lineWidth=1.3+(s*0.55);
        ctx.stroke();
      }

      // números de cuerda
      ctx.font="900 0.8rem Inter, sans-serif";
      ctx.textAlign="right";
      ctx.textBaseline="middle";
      ctx.fillStyle="rgba(255,250,240,0.75)";
      for(let s=0; s<stringCount; s++){
        ctx.fillText(String(s + 1), BOARD_X - 30, stringY(s, 0, stringCount, centerY));
      }

      const isBlank=blankMode(), isChord=!isBlank&&chordTypeSel.value!=="";
      legendButtons.forEach(b=>{b.closest('.legend').style.opacity=isBlank?"0.4":"1";b.disabled=isBlank;});

      ctx.font=`900 12px Inter, sans-serif`; ctx.textAlign="center"; ctx.textBaseline="middle";
      const RAD=13;

      function paintCell(rowIdx,stringIdx,fill,pc,rootPc=-1){
        const {x,y}=cellCenter(rowIdx,stringIdx);
        ctx.save();
        ctx.shadowColor='rgba(0,0,0,0.42)'; ctx.shadowBlur=8; ctx.shadowOffsetY=3;
        ctx.fillStyle=fill;
        ctx.beginPath(); ctx.arc(x,y,RAD,0,Math.PI*2); ctx.fill();
        ctx.restore();
        ctx.fillStyle="#161514";
        ctx.fillText(markerLabel(pc,rootPc),x,y+0.5);
        const finger=suggestedFinger(rows[rowIdx].semi);
        if(finger){
          ctx.save();
          ctx.font='900 9px Inter, sans-serif';
          ctx.fillStyle='rgba(255,250,240,.92)';
          ctx.fillText(finger,x,y+RAD+10);
          ctx.restore();
          ctx.font=`900 12px Inter, sans-serif`;
        }
      }

      // Recolectar notas para el pentagrama
      const staffNotes = [];

      if(!isBlank){
        const rootPc=NOTE.indexOf(rootSel.value);
        let pcs, spec=false, chordDef=null;
        if(isChord){ chordDef=CHORD_TYPES[chordTypeSel.value]; pcs=chordDef.intervals.map(iv=>(rootPc+iv)%12); }
        else { pcs=pcPattern(rootPc,SCALE[scaleSel.value]); spec=SPECIAL.includes(scaleSel.value); }

        for(let s=0;s<stringCount;s++){
          rows.forEach((row,i)=>{
            const pc=(pitches[s]+row.semi)%12;
            if(!pcs.includes(pc))return;
            let role;
            if(isChord){ role = pc===rootPc?"root":"structural"; }
            else { role = toneRole(pc,rootPc,pcs,spec); }
            if(!toneVisibility[role])return;
            const midi = pitches[s] + row.semi;
            staffNotes.push({ pc, midi });
            paintCell(i,s,TONE_COLORS[role],pc,rootPc);
          });
        }
      } else {
        for(let s=0;s<stringCount;s++){
          rows.forEach((row,i)=>{
            const key=`${s}-${i}`;
            const isSelected=manualSelections.has(key);
            const isHover=hoverCell&&hoverCell.s===s&&hoverCell.i===i;
            if(!isSelected&&!isHover)return;
            const pc=(pitches[s]+row.semi)%12;
            const midi = pitches[s] + row.semi;
            staffNotes.push({ pc, midi });
            ctx.save();
            ctx.globalAlpha=isSelected?1:0.55;
            const {x,y}=cellCenter(i,s);
            ctx.shadowColor='rgba(0,0,0,0.42)'; ctx.shadowBlur=8; ctx.shadowOffsetY=3;
            ctx.fillStyle=isSelected?"#d4a84f":"#fffaf0";
            ctx.beginPath(); ctx.arc(x,y,RAD,0,Math.PI*2); ctx.fill();
            ctx.restore();
            ctx.fillStyle="#161514"; ctx.fillText(NOTE[pc],x,y+0.5);
          });
        }
      }

      // Resaltado de la(s) nota(s) que suenan actualmente desde la partitura MusicXML
      if (typeof scoreHighlightMidis !== 'undefined' && scoreHighlightMidis.size) {
        scoreHighlightMidis.forEach(midi => {
          const pc = ((midi % 12) + 12) % 12;
          for (let s = 0; s < stringCount; s++) {
            rows.forEach((row, i) => {
              if (pitches[s] + row.semi !== midi) return;
              const {x, y} = cellCenter(i, s);
              ctx.save();
              ctx.shadowColor='rgba(0,0,0,0.42)'; ctx.shadowBlur=8; ctx.shadowOffsetY=3;
              ctx.fillStyle="#d4a84f";
              ctx.beginPath(); ctx.arc(x,y,RAD,0,Math.PI*2); ctx.fill();
              ctx.restore();
              ctx.fillStyle="#161514"; ctx.fillText(NOTE[pc],x,y+0.5);
            });
          }
          if (!staffNotes.some(n => n.midi === midi)) staffNotes.push({ pc, midi });
        });
      }


      // Posición recomendada por el Tutor MusicXML
      if(tutorActive()&&tutorExpectedCells&&tutorExpectedCells.length){
        tutorExpectedCells.forEach((rec,idx)=>{
          const rowIdx=rows.findIndex(r=>r.semi===rec.semi); if(rowIdx<0)return;
          const {x,y}=cellCenter(rowIdx,rec.s);
          ctx.save();
          ctx.strokeStyle=tutorCompletedCells.has(`${rec.s}-${rec.semi}`)?'#79c267':'#d4a84f';
          ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,RAD+5,0,Math.PI*2);ctx.stroke();
          ctx.fillStyle='#fffaf0';ctx.font='900 9px Inter, sans-serif';ctx.fillText(rec.finger||String(idx+1),x,y-RAD-10);ctx.restore();
          ctx.font=`900 12px Inter, sans-serif`;
        });
      }

      // Origen y destino del ejercicio de cambio de posición
      if(shiftPracticeRunning&&shiftPracticePlan){
        const p=shiftPracticePlan,oi=rows.findIndex(r=>r.semi===p.originSemi),di=rows.findIndex(r=>r.semi===p.destinationSemi);
        if(oi>=0&&di>=0){
          const a=cellCenter(oi,p.string),b=cellCenter(di,p.string);
          ctx.save();ctx.strokeStyle='rgba(212,168,79,.7)';ctx.lineWidth=3;ctx.setLineDash([6,5]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.setLineDash([]);
          [[a,'O',shiftPracticePhase==='origin'],[b,'D',shiftPracticePhase==='destination']].forEach(([pt,label,active])=>{ctx.strokeStyle=active?'#d4a84f':'rgba(255,250,240,.65)';ctx.lineWidth=active?4:2;ctx.beginPath();ctx.arc(pt.x,pt.y,RAD+7,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fffaf0';ctx.font='900 9px Inter, sans-serif';ctx.fillText(`${label} · ${p.finger}`,pt.x,pt.y-RAD-12);});ctx.restore();ctx.font=`900 12px Inter, sans-serif`;
        }
      }

      // Guía visual del intervalo de doble cuerda preparado
      if(doubleStopPlan&&doubleStopOverlayArmed&&document.documentElement.dataset.workspaceTab==='intonation'){
        [doubleStopPlan.lower,doubleStopPlan.upper].forEach((rec,idx)=>{const ri=rows.findIndex(r=>r.semi===rec.semi);if(ri<0)return;const {x,y}=cellCenter(ri,rec.string);ctx.save();ctx.strokeStyle=idx===0?'#79c267':'#d4a84f';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,RAD+8,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fffaf0';ctx.font='900 9px Inter, sans-serif';ctx.fillText(idx===0?'INF':'SUP',x,y-RAD-13);ctx.restore();ctx.font=`900 12px Inter, sans-serif`;});
      }

      // Ruta digitada de escala/arpegio
      if(scalePracticePlan.length){
        scalePracticePlan.forEach((rec,idx)=>{const ri=rows.findIndex(r=>r.semi===rec.semi);if(ri<0)return;const {x,y}=cellCenter(ri,rec.string);ctx.save();ctx.strokeStyle=idx===scalePracticeIndex&&scalePracticeRunning?'#d4a84f':idx<scalePracticeIndex&&scalePracticeRunning?'#79c267':'rgba(255,250,240,.45)';ctx.lineWidth=idx===scalePracticeIndex&&scalePracticeRunning?4:2;ctx.beginPath();ctx.arc(x,y,RAD+6,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fffaf0';ctx.font='900 8px Inter, sans-serif';ctx.fillText(rec.finger||String(idx+1),x,y-RAD-11);ctx.restore();ctx.font=`900 12px Inter, sans-serif`;});
      }

      // Secuencia técnica preparada
      if(technicalPatternPlan.length){
        technicalPatternPlan.forEach((rec,idx)=>{const ri=rows.findIndex(r=>r.semi===rec.semi);if(ri<0)return;const {x,y}=cellCenter(ri,rec.string);ctx.save();ctx.strokeStyle=idx===technicalPatternIndex&&technicalPatternRunning?'#d4a84f':idx<technicalPatternIndex&&technicalPatternRunning?'#79c267':'rgba(212,168,79,.35)';ctx.lineWidth=idx===technicalPatternIndex&&technicalPatternRunning?4:2;ctx.setLineDash(idx===technicalPatternIndex&&technicalPatternRunning?[]:[3,3]);ctx.beginPath();ctx.arc(x,y,RAD+9,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#fffaf0';ctx.font='900 8px Inter, sans-serif';ctx.fillText(rec.finger||String((idx%4)+1),x,y+RAD+13);ctx.restore();ctx.font=`900 12px Inter, sans-serif`;});
      }

      updateInfo();
      const clef=chooseStaffClef(staffNotes);
      drawBaseStaff(clef);
      renderStaffNotes(staffNotes,clef);
      if(techniqueStrip)techniqueStrip.innerHTML=techniqueDescription(clef);
    }


    // Dobles cuerdas: la superposición INF/SUP solo se activa al preparar explícitamente un intervalo.
    // Un cambio de instrumento la desactiva para evitar conservar una guía fuera de contexto.
    instrumentSel?.addEventListener('change',()=>{ doubleStopOverlayArmed=false; }, {capture:true});

    /***************** Info textual *************************/
    function updateInfo(){
      const isBlank=blankMode(), isChord=!isBlank&&chordTypeSel.value!=="";
      if(isChord){
        const rootPc=NOTE.indexOf(rootSel.value), def=CHORD_TYPES[chordTypeSel.value];
        chordSymbolEl.textContent=rootSel.value+def.suffix;
        chordQualityEl.textContent=def.quality;
      } else if(!isBlank){
        chordSymbolEl.textContent=`Escala: ${scaleSel.value.replace(/_/g,' ')} · Tónica ${rootSel.value}`;
        chordQualityEl.textContent=`Modo ${scaleSel.value.replace(/_/g,' ')}`;
      } else if(manualSelections.size>0){
        const pitches=activePitches(),rows=rowsList(),notes=[];
        manualSelections.forEach(key=>{const [s,i]=key.split('-').map(Number);const midi=pitches[s]+rows[i].semi;notes.push({pc:midi%12});});
        const detected=detectChord(notes.map(n=>n.pc));
        if(detected){ chordSymbolEl.textContent=NOTE[detected.root]+detected.def.suffix; chordQualityEl.textContent=detected.def.quality; }
        else { chordSymbolEl.textContent=`Notas: ${notes.map(n=>NOTE[n.pc]).join(' ')}`; chordQualityEl.textContent="No se reconoce un acorde con estas notas"; }
      } else {
        chordSymbolEl.textContent="Modo exploración";
        chordQualityEl.textContent="Haz clic en las posiciones para seleccionar notas";
      }
    }

    /***************** Interacción *************************/
    function cellFromEvent(evt){
      if(!blankMode()&&!tutorActive()&&!shiftPracticeRunning&&!scalePracticeRunning&&!technicalPatternRunning)return null;
      const rect=cvs.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const logicalWidth = cvs.width / dpr;
      const logicalHeight = cvs.height / dpr;
      const mx = (evt.clientX - rect.left) * (logicalWidth / rect.width);
      const my = (evt.clientY - rect.top) * (logicalHeight / rect.height);
      const rows=rowsList(), pitches=activePitches(), stringCount=pitches.length;
      let bestRow=0,bestRowDist=Infinity;
      rows.forEach((row,i)=>{ const d=Math.abs(mx-rowX(i)); if(d<bestRowDist){bestRowDist=d;bestRow=i;} });
      if(bestRowDist>COL_W*0.65)return null;
      const t=rowT(bestRow), centerY=PAD_Y+BODY_GAP*1.5;
      let bestS=0,bestSDist=Infinity;
      for(let s=0;s<stringCount;s++){ const d=Math.abs(my-stringY(s,t,stringCount,centerY)); if(d<bestSDist){bestSDist=d;bestS=s;} }
      if(bestSDist>gapAt(t)/2+6)return null;
      return {s:bestS,i:bestRow};
    }
    cvs.addEventListener('pointermove',evt=>{
      const cell=cellFromEvent(evt);
      const changed=(!cell&&hoverCell)||(cell&&(!hoverCell||hoverCell.s!==cell.s||hoverCell.i!==cell.i));
      hoverCell=cell; cvs.style.cursor=cell?"pointer":"default";
      if(changed)draw();
    });
    cvs.addEventListener('pointerleave',()=>{ if(hoverCell){hoverCell=null;draw();} });
    cvs.addEventListener('pointerup',evt=>{
      const cell=cellFromEvent(evt); if(!cell)return;
      const rows=rowsList();
      if(shiftPracticeRunning){handleShiftClick(cell);return;}
      if(scalePracticeRunning){handleScalePracticeClick(cell);return;}
      if(technicalPatternRunning){handleTechnicalPatternClick(cell);return;}
      if(tutorActive()&&tutorExpectedCells.length){
        const semi=rows[cell.i].semi;
        const expected=tutorExpectedCells.find(r=>r.s===cell.s&&r.semi===semi);
        const midi=activePitches()[cell.s]+semi; playNote(midi,1.3);
        if(!expected){tutorStatusEl.textContent=`Prueba otra posición · se espera ${tutorExpectedCells.map(r=>`cuerda ${r.s+1} +${r.semi}`).join(' / ')}`;return;}
        tutorCompletedCells.add(`${cell.s}-${semi}`);draw();
        if(tutorCompletedCells.size>=tutorExpectedCells.length){
          tutorStatusEl.textContent='Correcto · siguiente evento';
          const next=tutorCurrentIndex+1;
          if(next<tutorPlan.length)setTimeout(()=>{showTutorPlanIndex(next);try{jumpToStep(next);}catch(e){}},220);
          else tutorStatusEl.textContent='Frase completada.';
        }else tutorStatusEl.textContent='Correcto · completa la doble cuerda/acorde.';
        return;
      }
      const key=`${cell.s}-${cell.i}`;
      const wasSelected = manualSelections.has(key);
      if(wasSelected) {
        manualSelections.delete(key);
      } else {
        manualSelections.add(key);
        const pitches = activePitches();
        const rows = rowsList();
        const midi = pitches[cell.s] + rows[cell.i].semi;
        playNote(midi, 1.8);
      }
      draw();
    });
    clearSelectionBtn.onclick=()=>{ manualSelections.clear(); hoverCell=null; draw(); };
    clearAllBtn.onclick=()=>{ rootSel.value=""; scaleSel.value=""; chordTypeSel.value=""; manualSelections.clear(); hoverCell=null; draw(); };
    minus.onclick=()=>{ if(numBlocks>1){numBlocks--;posVal.textContent=numBlocks;manualSelections.clear();draw();} };
    plus.onclick=()=>{ if(numBlocks<4){numBlocks++;posVal.textContent=numBlocks;manualSelections.clear();draw();} };
    rootSel.onchange=()=>{ if(chordTypeSel.value!=="")chordTypeSel.value=chordTypeSel.value; manualSelections.clear(); hoverCell=null; draw(); };
    chordTypeSel.onchange=()=>{ if(chordTypeSel.value!=="")scaleSel.value=""; manualSelections.clear(); hoverCell=null; draw(); };
    scaleSel.onchange=()=>{ if(scaleSel.value!=="")chordTypeSel.value=""; manualSelections.clear(); hoverCell=null; draw(); };
    legendButtons.forEach(button=>{
      button.onclick=()=>{
        const role=button.dataset.toneFilter;
        toneVisibility[role]=!toneVisibility[role];
        button.setAttribute("aria-pressed",String(toneVisibility[role]));
        draw();
      };
    });

    instrumentSel.value="violin";
    posVal.textContent=numBlocks;
    window.addEventListener('load',()=>{
      draw();
      const clef=chooseStaffClef([]);
      drawBaseStaff(clef);
      renderStaffNotes([]);
    });
    const footerYearEl=document.getElementById('footerYear');
    if(footerYearEl)footerYearEl.textContent=new Date().getFullYear();
  
    // Preferencias visuales de Cuerdas Frotadas
    const STRINGS_SETTINGS_KEY='cuerdasFrotadas_settings_v10';
    function saveStringsPrefs(){
      try{localStorage.setItem(STRINGS_SETTINGS_KEY,JSON.stringify({
        instrument:instrumentSel.value, articulation:articulationSel.value,
        orientation:orientationSel?.value||'right', labelMode:labelModeSel?.value||'notes', keySignature:keySignatureSel?.value||'auto', spellingMode:spellingModeSel?.value||'auto', techPosition:techPositionSel?.value||'free',
        root:rootSel.value, chord:chordTypeSel.value, scale:scaleSel.value, volume:volumeSlider.value, tutorEnabled:!!tutorEnabledEl?.checked, tutorCriterion:tutorCriterionEl?.value||'phrase', tutorOpenStrings:tutorOpenStringsEl?.value||'neutral', tutorBowMode:tutorBowModeEl?.value||'score', tutorPhraseLength:tutorPhraseLengthEl?.value||'8',
        bowTechnique:bowTechniqueEl?.value||'detache', bowDirection:bowDirectionEl?.value||'alternate', bowStringPattern:bowStringPatternEl?.value||'s1', bowStrokesPerPulse:bowStrokesPerPulseEl?.value||'1', bowDistribution:bowDistributionEl?.value||'auto', bowMeasures:bowMeasuresEl?.value||'4', intonationTargetMode:intonationTargetModeEl?.value||'open', intonationString:intonationStringEl?.value||'0', intonationNote:intonationNoteEl?.value||'', intonationA4:intonationA4El?.value||'440', intonationTolerance:intonationToleranceEl?.value||'10', intonationDroneMode:intonationDroneModeEl?.value||'off', intonationShift:intonationShiftEl?.value||'0', shiftString:shiftStringEl?.value||'0', shiftOrigin:shiftOriginEl?.value||'', shiftDestination:shiftDestinationEl?.value||'', shiftGuideFinger:shiftGuideFingerEl?.value||'auto', shiftMotion:shiftMotionEl?.value||'guide', shiftBow:shiftBowEl?.value||'free', shiftRepetitions:shiftRepetitionsEl?.value||'4', shiftUseIntonation:!!shiftUseIntonationEl?.checked, doubleStopPair:doubleStopPairEl?.value||'0,1', doubleStopInterval:doubleStopIntervalEl?.value||'4', doubleStopTemperament:doubleStopTemperamentEl?.value||'equal', doubleStopZone:doubleStopZoneEl?.value||'auto', doubleStopDroneMode:doubleStopDroneModeEl?.value||'lower', scalePracticeKind:scalePracticeKindEl?.value||'scale', scalePracticeOctaves:scalePracticeOctavesEl?.value||'2', scalePracticeDirection:scalePracticeDirectionEl?.value||'updown', scalePracticeCriterion:scalePracticeCriterionEl?.value||'position', scalePracticeBow:scalePracticeBowEl?.value||'alternate', scalePracticeSubdivision:scalePracticeSubdivisionEl?.value||'2', technicalPatternMaterial:technicalPatternMaterialEl?.value||'scale', technicalPatternType:technicalPatternTypeEl?.value||'thirds', technicalPatternOctaves:technicalPatternOctavesEl?.value||'2', technicalPatternDirection:technicalPatternDirectionEl?.value||'updown', technicalPatternBow:technicalPatternBowEl?.value||'alternate', technicalPatternSubdivision:technicalPatternSubdivisionEl?.value||'2', rhythmPattern:rhythmPatternEl?.value||'eighths', rhythmAccents:rhythmAccentsEl?.value||'bar', rhythmBow:rhythmBowEl?.value||'alternate', rhythmMeasures:rhythmMeasuresEl?.value||'4', rhythmTolerance:rhythmToleranceEl?.value||'60', scoreLoopRepeats:scoreLoopRepeats?.value||'0', scoreBpmIncrement:scoreBpmIncrement?.value||'0', scoreIncrementEvery:scoreIncrementEvery?.value||'1', scoreCountIn:scoreCountIn?.value||'0', scoreSyncMetro:!!scoreSyncMetro?.checked
      }));}catch(e){}
    }
    function loadStringsPrefs(){
      try{
        const s=JSON.parse(localStorage.getItem(STRINGS_SETTINGS_KEY)||localStorage.getItem('cuerdasFrotadas_settings_v9')||'{}');
        if(s.instrument&&INSTRUMENTS[s.instrument])instrumentSel.value=s.instrument;
        if(s.articulation)articulationSel.value=s.articulation;
        if(s.orientation&&orientationSel)orientationSel.value=s.orientation;
        if(s.labelMode&&labelModeSel)labelModeSel.value=s.labelMode;
        if(s.keySignature&&keySignatureSel)keySignatureSel.value=s.keySignature;
        if(s.spellingMode&&spellingModeSel)spellingModeSel.value=s.spellingMode;
        populateTechniquePositions(s.techPosition);
        if(s.root&&[...rootSel.options].some(o=>o.value===s.root))rootSel.value=s.root;
        if(s.chord&&[...chordTypeSel.options].some(o=>o.value===s.chord))chordTypeSel.value=s.chord;
        if(s.scale&&[...scaleSel.options].some(o=>o.value===s.scale))scaleSel.value=s.scale;
        if(s.volume)volumeSlider.value=s.volume;
        if(tutorEnabledEl&&typeof s.tutorEnabled==='boolean')tutorEnabledEl.checked=s.tutorEnabled;
        if(tutorCriterionEl&&s.tutorCriterion)tutorCriterionEl.value=s.tutorCriterion;
        if(tutorOpenStringsEl&&s.tutorOpenStrings)tutorOpenStringsEl.value=s.tutorOpenStrings;
        if(tutorBowModeEl&&s.tutorBowMode)tutorBowModeEl.value=s.tutorBowMode;
        if(tutorPhraseLengthEl&&s.tutorPhraseLength)tutorPhraseLengthEl.value=s.tutorPhraseLength;
        if(bowTechniqueEl&&s.bowTechnique)bowTechniqueEl.value=s.bowTechnique;
        if(bowDirectionEl&&s.bowDirection)bowDirectionEl.value=s.bowDirection;
        if(bowStringPatternEl&&s.bowStringPattern)bowStringPatternEl.value=s.bowStringPattern;
        if(bowStrokesPerPulseEl&&s.bowStrokesPerPulse)bowStrokesPerPulseEl.value=s.bowStrokesPerPulse;
        if(bowDistributionEl&&s.bowDistribution)bowDistributionEl.value=s.bowDistribution;
        if(bowMeasuresEl&&s.bowMeasures)bowMeasuresEl.value=s.bowMeasures;
        if(intonationTargetModeEl&&s.intonationTargetMode)intonationTargetModeEl.value=s.intonationTargetMode;
        if(intonationA4El&&s.intonationA4)intonationA4El.value=s.intonationA4;
        if(intonationToleranceEl&&s.intonationTolerance)intonationToleranceEl.value=s.intonationTolerance;
        if(intonationDroneModeEl&&s.intonationDroneMode)intonationDroneModeEl.value=s.intonationDroneMode;
        if(intonationShiftEl&&s.intonationShift)intonationShiftEl.value=s.intonationShift;
        if(shiftGuideFingerEl&&s.shiftGuideFinger)shiftGuideFingerEl.value=s.shiftGuideFinger;
        if(shiftMotionEl&&s.shiftMotion)shiftMotionEl.value=s.shiftMotion;
        if(shiftBowEl&&s.shiftBow)shiftBowEl.value=s.shiftBow;
        if(shiftRepetitionsEl&&s.shiftRepetitions)shiftRepetitionsEl.value=s.shiftRepetitions;
        if(shiftUseIntonationEl&&typeof s.shiftUseIntonation==='boolean')shiftUseIntonationEl.checked=s.shiftUseIntonation;
        if(doubleStopIntervalEl&&s.doubleStopInterval)doubleStopIntervalEl.value=s.doubleStopInterval;
        if(doubleStopTemperamentEl&&s.doubleStopTemperament)doubleStopTemperamentEl.value=s.doubleStopTemperament;
        if(doubleStopZoneEl&&s.doubleStopZone)doubleStopZoneEl.value=s.doubleStopZone;
        if(doubleStopDroneModeEl&&s.doubleStopDroneMode)doubleStopDroneModeEl.value=s.doubleStopDroneMode;
        if(scalePracticeKindEl&&s.scalePracticeKind)scalePracticeKindEl.value=s.scalePracticeKind;
        if(scalePracticeOctavesEl&&s.scalePracticeOctaves)scalePracticeOctavesEl.value=s.scalePracticeOctaves;
        if(scalePracticeDirectionEl&&s.scalePracticeDirection)scalePracticeDirectionEl.value=s.scalePracticeDirection;
        if(scalePracticeCriterionEl&&s.scalePracticeCriterion)scalePracticeCriterionEl.value=s.scalePracticeCriterion;
        if(scalePracticeBowEl&&s.scalePracticeBow)scalePracticeBowEl.value=s.scalePracticeBow;
        if(scalePracticeSubdivisionEl&&s.scalePracticeSubdivision)scalePracticeSubdivisionEl.value=s.scalePracticeSubdivision;
        if(technicalPatternMaterialEl&&s.technicalPatternMaterial)technicalPatternMaterialEl.value=s.technicalPatternMaterial;
        if(technicalPatternTypeEl&&s.technicalPatternType)technicalPatternTypeEl.value=s.technicalPatternType;
        if(technicalPatternOctavesEl&&s.technicalPatternOctaves)technicalPatternOctavesEl.value=s.technicalPatternOctaves;
        if(technicalPatternDirectionEl&&s.technicalPatternDirection)technicalPatternDirectionEl.value=s.technicalPatternDirection;
        if(technicalPatternBowEl&&s.technicalPatternBow)technicalPatternBowEl.value=s.technicalPatternBow;
        if(technicalPatternSubdivisionEl&&s.technicalPatternSubdivision)technicalPatternSubdivisionEl.value=s.technicalPatternSubdivision;
        if(rhythmPatternEl&&s.rhythmPattern)rhythmPatternEl.value=s.rhythmPattern;
        if(rhythmAccentsEl&&s.rhythmAccents)rhythmAccentsEl.value=s.rhythmAccents;
        if(rhythmBowEl&&s.rhythmBow)rhythmBowEl.value=s.rhythmBow;
        if(rhythmMeasuresEl&&s.rhythmMeasures)rhythmMeasuresEl.value=s.rhythmMeasures;
        if(rhythmToleranceEl&&s.rhythmTolerance)rhythmToleranceEl.value=s.rhythmTolerance;
        if(scoreLoopRepeats&&s.scoreLoopRepeats)scoreLoopRepeats.value=s.scoreLoopRepeats;
        if(scoreBpmIncrement&&s.scoreBpmIncrement)scoreBpmIncrement.value=s.scoreBpmIncrement;
        if(scoreIncrementEvery&&s.scoreIncrementEvery)scoreIncrementEvery.value=s.scoreIncrementEvery;
        if(scoreCountIn&&s.scoreCountIn)scoreCountIn.value=s.scoreCountIn;
        if(scoreSyncMetro&&typeof s.scoreSyncMetro==='boolean')scoreSyncMetro.checked=s.scoreSyncMetro;
        populateDoubleStopPairs(s.doubleStopPair);
        populateShiftControls({string:s.shiftString,origin:s.shiftOrigin,destination:s.shiftDestination});
        populateIntonationTargets();
        if(intonationStringEl&&s.intonationString&&[...intonationStringEl.options].some(o=>o.value===s.intonationString))intonationStringEl.value=s.intonationString;
        if(intonationNoteEl&&s.intonationNote&&[...intonationNoteEl.options].some(o=>o.value===s.intonationNote))intonationNoteEl.value=s.intonationNote;
        updateIntonationTargetUI();
      }catch(e){}
    }
    [instrumentSel,articulationSel,orientationSel,labelModeSel,keySignatureSel,spellingModeSel,techPositionSel,rootSel,chordTypeSel,scaleSel,volumeSlider,
      tutorEnabledEl,tutorCriterionEl,tutorOpenStringsEl,tutorBowModeEl,tutorPhraseLengthEl,
      bowTechniqueEl,bowDirectionEl,bowStringPatternEl,bowStrokesPerPulseEl,bowDistributionEl,bowMeasuresEl,
      intonationTargetModeEl,intonationStringEl,intonationNoteEl,intonationA4El,intonationToleranceEl,intonationDroneModeEl,intonationShiftEl,
      shiftStringEl,shiftOriginEl,shiftDestinationEl,shiftGuideFingerEl,shiftMotionEl,shiftBowEl,shiftRepetitionsEl,shiftUseIntonationEl,
      doubleStopPairEl,doubleStopIntervalEl,doubleStopTemperamentEl,doubleStopZoneEl,doubleStopDroneModeEl,
      scalePracticeKindEl,scalePracticeOctavesEl,scalePracticeDirectionEl,scalePracticeCriterionEl,scalePracticeBowEl,scalePracticeSubdivisionEl,
      technicalPatternMaterialEl,technicalPatternTypeEl,technicalPatternOctavesEl,technicalPatternDirectionEl,technicalPatternBowEl,technicalPatternSubdivisionEl,
      rhythmPatternEl,rhythmAccentsEl,rhythmBowEl,rhythmMeasuresEl,rhythmToleranceEl,
      scoreLoopRepeats,scoreBpmIncrement,scoreIncrementEvery,scoreCountIn,scoreSyncMetro
    ].filter(Boolean).forEach(el=>el.addEventListener('change',saveStringsPrefs));

    populateIntonationTargets(); populateShiftControls(); populateDoubleStopPairs(); loadStringsPrefs(); populateTechniquePositions(techPositionSel?.value); populateShiftControls({string:shiftStringEl?.value,origin:shiftOriginEl?.value,destination:shiftDestinationEl?.value}); populateDoubleStopPairs(doubleStopPairEl?.value); updateIntonationTargetUI(); updateShiftPreview(); updateDoubleStopUI(); try{refresh();}catch(e){try{draw();}catch(_){} }
