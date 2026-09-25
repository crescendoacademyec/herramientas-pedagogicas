/* OSMD durations are fractions of a whole note; audio uses seconds. */
(function(root){
  'use strict';
  function noteSeconds(note, tempo){
    const length=note?.Length?.RealValue;
    return (Number.isFinite(length) ? Math.max(0,length) : .25)*240/tempo;
  }
  function stepSeconds(iterator, tempo){
    const notes=(iterator.CurrentVoiceEntries||[]).flatMap(e=>e.Notes||[]);
    const lengths=notes.map(n=>noteSeconds(n,tempo)).filter(d=>d>0);
    let duration=lengths.length?Math.min(...lengths):30/tempo;
    // Read a separate iterator: looking ahead must not move the visible cursor.
    if(typeof iterator.clone==='function'){
      const next=iterator.clone();
      next.moveToNext();
      const delta=(next.CurrentSourceTimestamp?.RealValue-iterator.CurrentSourceTimestamp?.RealValue)*240/tempo;
      if(!next.EndReached && delta>0) return delta;
      // Final step, pickup or repeat jump: finish the current measure.
      // OSMD 1.8.4's relative timestamp getter stays at zero in this path.
      const relative=iterator.CurrentSourceTimestamp?.RealValue-iterator.CurrentMeasure?.AbsoluteTimestamp?.RealValue;
      const remaining=(iterator.CurrentMeasure?.Duration?.RealValue-relative)*240/tempo;
      if(Number.isFinite(remaining) && remaining>0) duration=remaining;
    }
    return duration;
  }
  function tiedSeconds(note,tempo){
    const notes=note.NoteTie?.Notes;
    const index=notes?.indexOf(note)??-1;
    return index<0?noteSeconds(note,tempo):notes.slice(index).reduce((sum,n)=>sum+noteSeconds(n,tempo),0);
  }
  const api={noteSeconds,stepSeconds,tiedSeconds};
  root.ScorePlaybackTiming=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window==='object'?window:globalThis);
