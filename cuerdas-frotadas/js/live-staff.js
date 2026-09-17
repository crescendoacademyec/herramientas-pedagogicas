(function(global){
  'use strict';
  function musicXML(notes,clef,key){
    if(clef==='grand'){
      const staffBody=(staff)=>{const list=notes.filter(n=>(n.staff||1)===staff);return list.length?list.map((n,i)=>`<note>${i?'<chord/>':''}<pitch><step>${n.letter}</step><alter>${n.alter||0}</alter><octave>${n.octave}</octave></pitch><duration>4</duration><voice>${staff}</voice><type>whole</type><staff>${staff}</staff></note>`).join(''):`<note print-object="no"><rest/><duration>4</duration><voice>${staff}</voice><type>whole</type><staff>${staff}</staff></note>`;};
      return `<?xml version="1.0"?><score-partwise version="3.1"><part-list><score-part id="P1"><part-name></part-name></score-part></part-list><part id="P1"><measure number="1"><attributes><divisions>1</divisions><key><fifths>${key}</fifths></key><time print-object="no"><beats>4</beats><beat-type>4</beat-type></time><staves>2</staves><clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef></attributes>${staffBody(1)}<backup><duration>4</duration></backup>${staffBody(2)}</measure></part></score-partwise>`;
    }
    const [sign,line]=({treble:['G',2],bass:['F',4],alto:['C',3],tenor:['C',4]})[clef]||['G',2];
    const body=notes.length?notes.map((n,i)=>`<note>${i?'<chord/>':''}<pitch><step>${n.letter}</step><alter>${n.acc==='sharp'?1:n.acc==='flat'?-1:0}</alter><octave>${n.octave}</octave></pitch><duration>4</duration><type>whole</type></note>`).join(''):'<note print-object="no"><rest/><duration>4</duration><type>whole</type></note>';
    return `<?xml version="1.0"?><score-partwise version="3.1"><part-list><score-part id="P1"><part-name></part-name></score-part></part-list><part id="P1"><measure number="1"><attributes><divisions>1</divisions><key><fifths>${key}</fifths></key><time print-object="no"><beats>4</beats><beat-type>4</beat-type></time><clef><sign>${sign}</sign><line>${line}</line></clef></attributes>${body}<barline location="right"><bar-style>none</bar-style></barline></measure></part></score-partwise>`;
  }
  class LiveStaff{
    constructor(host){
      this.host=host;this.surface=host.querySelector('[data-live-score]');this.labels=host.querySelector('[data-live-labels]');
      this.pending=null;this.busy=false;this.last='';this.engine=null;
      this.width=this.surface.clientWidth;
      this.resize=new ResizeObserver(()=>{const width=this.surface.clientWidth;if(width===this.width)return;this.width=width;if(this.engine&&!this.busy&&width>0){try{this.engine.render();this.annotate();}catch(error){console.error(error);}}});
      this.resize.observe(this.surface);
    }
    update(notes,clef,key){
      const xml=musicXML(notes,clef,key);
      const signature=xml+JSON.stringify(notes.map(n=>n.label||''));
      if(signature===this.last)return;
      this.last=signature;this.pending={xml,notes,clef};this.flush();
    }
    annotate(){
      const svg=this.surface.querySelector('svg');
      if(!svg)return;
      svg.querySelectorAll('.live-note-label').forEach(el=>el.remove());
      // OSMD also emits transparent rest glyphs inside vf-notehead groups for
      // empty staves. They are layout placeholders, never notes to label.
      const heads=[...svg.querySelectorAll('.vf-notehead')].filter(head=>
        [...head.querySelectorAll('path')].some(path=>{
          const style=getComputedStyle(path),fill=style.fill.replace(/\s/g,'');
          return style.visibility!=='hidden'&&style.display!=='none'&&Number(style.opacity)!==0&&
            Number(style.fillOpacity)!==0&&fill!=='none'&&fill!=='transparent'&&
            !/^rgba\([^)]*,0(?:\.0+)?\)$/.test(fill)&&!/^#[\da-f]{6}00$/i.test(fill);
        })
      ).sort((a,b)=>b.getBoundingClientRect().top-a.getBoundingClientRect().top);
      const notes=[...(this.currentNotes||[])].sort((a,b)=>a.octave-b.octave||'CDEFGAB'.indexOf(a.letter)-'CDEFGAB'.indexOf(b.letter));
      const inverse=svg.getScreenCTM()?.inverse();
      if(!inverse)return;
      const positions=heads.map(head=>{
        const box=head.getBoundingClientRect(),p=svg.createSVGPoint();
        p.x=box.right;p.y=box.top+box.height/2;
        return p.matrixTransform(inverse);
      });
      const right=Math.max(0,...positions.map(p=>p.x))+12,columns=[];
      positions.forEach((p,i)=>{
        const note=notes[i];if(!note)return;
        let column=0;
        while(columns[column]!==undefined&&Math.abs(columns[column]-p.y)<14)column++;
        columns[column]=p.y;
        const text=document.createElementNS('http://www.w3.org/2000/svg','text');
        text.setAttribute('class','live-note-label');
        text.setAttribute('x',right+column*38);text.setAttribute('y',p.y);
        text.setAttribute('dominant-baseline','central');
        text.textContent=note.label||note.letter+(note.acc==='sharp'?'♯':note.acc==='flat'?'♭':'')+note.octave;
        svg.appendChild(text);
      });
      // Fit the actual engraving, not OSMD's page margins, to the original panel.
      // The bounding box includes note labels and ledger lines at either extreme.
      const bounds=svg.getBBox(),padding=6;
      if(bounds.width>0&&bounds.height>0){
        svg.setAttribute('viewBox',`${bounds.x-padding} ${bounds.y-padding} ${bounds.width+padding*2} ${bounds.height+padding*2}`);
        svg.setAttribute('width',bounds.width+padding*2);
        svg.setAttribute('height',bounds.height+padding*2);
      }
    }
    async flush(){
      if(this.busy)return;
      this.busy=true;
      try{
        if(!this.engine){
          this.engine=new global.opensheetmusicdisplay.OpenSheetMusicDisplay(this.surface,{backend:'svg',autoResize:false,drawTitle:false,drawSubtitle:false,drawComposer:false,drawPartNames:false,drawMeasureNumbers:false,drawTimeSignatures:false});
          this.engine.EngravingRules.DefaultVexFlowNoteFont='Bravura';
          this.engine.Zoom=1.05;
        }
        while(this.pending){
          const job=this.pending;this.pending=null;
          await this.engine.load(job.xml);
          if(this.pending)continue; // Skip stale notes if the player moved during loading.
          this.engine.Zoom=1.05;
          this.engine.render();
          this.currentNotes=job.notes;this.annotate();this.labels.textContent='';
          const names=job.notes.map(n=>n.label||n.letter+(n.acc==='sharp'?'♯':n.acc==='flat'?'♭':'')+n.octave).join(' · ');
          this.host.setAttribute('aria-label','Pentagrama: '+({grand:'claves de sol y fa',treble:'clave de sol',bass:'clave de fa',alto:'clave de do en tercera',tenor:'clave de do en cuarta'}[job.clef])+(names?', '+names:''));
        }
      }catch(error){
        this.last='';this.labels.textContent='No se pudo cargar el pentagrama. Vuelve a seleccionar una nota.';console.error(error);
      }finally{this.busy=false;}
    }
  }
  LiveStaff.musicXML=musicXML;
  global.CrescendoLiveStaff=LiveStaff;
  if(typeof module!=='undefined')module.exports=LiveStaff;
})(typeof window!=='undefined'?window:globalThis);
