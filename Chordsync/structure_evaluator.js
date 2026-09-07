(function(global){
  'use strict';
  const LABELS=['Intro','Verse','Pre-Chorus','Chorus','Bridge','Solo','Outro','Unclassified'];
  const ALIASES={
    'intro':'Intro','introduction':'Intro','introduccion':'Intro','introducción':'Intro',
    'verse':'Verse','verso':'Verse','estrofa':'Verse',
    'pre-chorus':'Pre-Chorus','prechorus':'Pre-Chorus','pre chorus':'Pre-Chorus','pre-coro':'Pre-Chorus','precoro':'Pre-Chorus','pre coro':'Pre-Chorus',
    'chorus':'Chorus','coro':'Chorus','refrain':'Chorus','estribillo':'Chorus',
    'bridge':'Bridge','puente':'Bridge',
    'solo':'Solo','instrumental':'Solo','instrumental solo':'Solo',
    'outro':'Outro','ending':'Outro','final':'Outro','coda':'Outro',
    'unclassified':'Unclassified','unknown':'Unclassified','otro':'Unclassified','other':'Unclassified'
  };
  const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
  function normalizeLabel(x){
    let s=String(x||'').trim(); if(!s)return 'Unclassified';
    s=s.replace(/\s*·.*$/,'').trim();
    const k=s.toLowerCase().replace(/_/g,'-').replace(/\s+/g,' ');
    return ALIASES[k]||LABELS.find(v=>v.toLowerCase()===k)||'Unclassified';
  }
  function parseSections(text,duration){
    const rows=[]; const metadata={};
    for(const raw of String(text||'').split(/\r?\n/)){
      const line=raw.trim(); if(!line)continue;
      if(/^[#;]/.test(line)){
        const tm=line.match(/^[#;]\s*title\s*:\s*(.+)$/i); if(tm)metadata.title=tm[1].trim();
        continue;
      }
      const p=line.split(/\s+/);
      if(p.length>=3&&Number.isFinite(Number(p[0]))&&Number.isFinite(Number(p[1]))) rows.push({start:Number(p[0]),end:Number(p[1]),label:normalizeLabel(p.slice(2).join(' ')),rawLabel:p.slice(2).join(' ')});
      else if(p.length>=2&&Number.isFinite(Number(p[0]))) rows.push({start:Number(p[0]),end:null,label:normalizeLabel(p.slice(1).join(' ')),rawLabel:p.slice(1).join(' ')});
    }
    rows.sort((a,b)=>a.start-b.start);
    for(let i=0;i<rows.length;i++) if(!(rows[i].end>rows[i].start)) rows[i].end=i+1<rows.length?rows[i+1].start:Math.max(rows[i].start,Number(duration)||rows[i].start);
    return {sections:rows.filter(r=>r.end>r.start),metadata};
  }
  function predictedSections(analysis){
    return (analysis?.sections||[]).map(s=>({start:Number(s.start)||0,end:Number(s.end)||0,label:normalizeLabel(s.semanticLabel||s.label||'Unclassified'),confidence:Number(s.semanticConfidence)||0})).filter(s=>s.end>s.start).sort((a,b)=>a.start-b.start);
  }
  function labelAt(xs,t){for(const s of xs||[])if(t>=s.start&&t<s.end)return s.label;return 'Unclassified';}
  function durationMetrics(pred,truth,duration){
    const pts=new Set([0,Number(duration)||0]); for(const s of pred) {pts.add(s.start);pts.add(s.end);} for(const s of truth){pts.add(s.start);pts.add(s.end);}
    const arr=[...pts].filter(Number.isFinite).sort((a,b)=>a-b);
    const per={}; for(const l of LABELS)per[l]={tp:0,fp:0,fn:0,support:0,precision:null,recall:null,f1:null};
    let correct=0,total=0,classified=0; const confusion={};
    for(let i=0;i<arr.length-1;i++){
      const a=arr[i],b=arr[i+1]; if(!(b>a))continue; const w=b-a,t=(a+b)/2;
      const yt=labelAt(truth,t),yp=labelAt(pred,t); total+=w; if(yp!=='Unclassified')classified+=w;
      if(yt===yp)correct+=w; else {const k=`${yt}→${yp}`;confusion[k]=(confusion[k]||0)+w;}
      if(per[yt])per[yt].support+=w;
      for(const l of LABELS){if(yt===l&&yp===l)per[l].tp+=w; else if(yt!==l&&yp===l)per[l].fp+=w; else if(yt===l&&yp!==l)per[l].fn+=w;}
    }
    const f1s=[]; for(const l of LABELS){const m=per[l];m.precision=(m.tp+m.fp)?m.tp/(m.tp+m.fp):(m.fn?0:1);m.recall=(m.tp+m.fn)?m.tp/(m.tp+m.fn):(m.fp?0:1);m.f1=(m.precision+m.recall)?2*m.precision*m.recall/(m.precision+m.recall):0;if(l!=='Unclassified'&&m.support>0)f1s.push(m.f1);}
    return {accuracy:total?correct/total:0,macroF1:f1s.length?f1s.reduce((a,b)=>a+b,0)/f1s.length:0,coverage:total?classified/total:0,totalDuration:total,perLabel:per,confusions:Object.entries(confusion).sort((a,b)=>b[1]-a[1]).slice(0,12).map(([pair,seconds])=>({pair,seconds}))};
  }
  function boundaryMetrics(pred,truth,tol=1.0){
    const p=pred.slice(1).map(s=>s.start),t=truth.slice(1).map(s=>s.start),used=new Set();let matches=0,err=0;
    for(const x of p){let bi=-1,be=Infinity;for(let i=0;i<t.length;i++){if(used.has(i))continue;const e=Math.abs(x-t[i]);if(e<=tol&&e<be){be=e;bi=i;}}if(bi>=0){used.add(bi);matches++;err+=be;}}
    const precision=p.length?matches/p.length:(t.length?0:1),recall=t.length?matches/t.length:(p.length?0:1),f1=(precision+recall)?2*precision*recall/(precision+recall):0;
    return {precision,recall,f1,matches,predicted:p.length,truth:t.length,meanAbsoluteError:matches?err/matches:null,tolerance:tol};
  }
  function iou(a,b){const x=Math.max(a.start,b.start),y=Math.min(a.end,b.end),inter=Math.max(0,y-x),uni=Math.max(a.end,b.end)-Math.min(a.start,b.start);return uni>0?inter/uni:0;}
  function segmentMatchMetrics(pred,truth){
    let sum=0,n=0,same=0; const used=new Set();
    for(const tr of truth){let best=-1,score=0;for(let i=0;i<pred.length;i++){if(used.has(i))continue;const s=iou(tr,pred[i]);if(s>score){score=s;best=i;}}if(best>=0){used.add(best);sum+=score;n++;if(pred[best].label===tr.label)same++;}}
    return {meanIoU:n?sum/n:0,labelAccuracyOnMatched:n?same/n:0,matched:n,truth:truth.length,predicted:pred.length};
  }
  function evaluateStructure(analysis,text,options={}){
    const duration=Number(analysis?.duration)||Math.max(0,...(analysis?.sections||[]).map(s=>Number(s.end)||0));
    const truth=parseSections(text,duration); if(!truth.sections.length)throw new Error('La anotación de estructura no contiene secciones válidas. Usa: inicio fin etiqueta.');
    const pred=predictedSections(analysis);
    return {kind:'structure-ground-truth-evaluation',metricVersion:'chordsync-structure-eval-v1',semantic:durationMetrics(pred,truth.sections,duration),boundary:boundaryMetrics(pred,truth.sections,options.boundaryTolerance??1.0),segments:segmentMatchMetrics(pred,truth.sections),truthSections:truth.sections.length,predictedSections:pred.length,metadata:truth.metadata};
  }
  global.ChordSyncStructureEvaluator={LABELS,normalizeLabel,parseSections,evaluateStructure};
})(typeof self!=='undefined'?self:window);
