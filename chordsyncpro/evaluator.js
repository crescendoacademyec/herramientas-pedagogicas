// ChordSync Pro v29 — evaluación objetiva contra anotaciones .lab/.txt.
// Fase 7D: métricas jerárquicas por componente (root/triad/seventh/extension/alterations/bass).
(function (global) {
  'use strict';

  const NOTE_TO_PC = { C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11 };

  function normalizeSuffix(rawSuffix) {
    let s = String(rawSuffix || '').trim()
      .replace(/♭/g,'b').replace(/♯/g,'#')
      .replace(/Δ/g,'maj').replace(/−/g,'m')
      .replace(/min/ig,'m').replace(/major/ig,'maj')
      .replace(/\s+/g,'');
    if (!s) return '';
    s = s.replace(/^M(?=7|9|11|13)/,'maj');
    s = s.replace(/^mmaj/i,'mMaj');
    s = s.replace(/ø7?/ig,'m7b5');
    s = s.replace(/°7/ig,'dim7').replace(/°/ig,'dim');
    s = s.replace(/\+/g,'aug');
    s = s.replace(/^7sus$/i,'7sus4');
    return s;
  }

  function parseChord(label) {
    if (label == null) return { raw:'N', noChord:true };
    let raw = String(label).trim();
    if (!raw || /^(N|X|NC|N\.C\.)$/i.test(raw)) return { raw:'N', noChord:true };
    raw = raw.replace(/:/g,'');
    const m = raw.match(/^([A-Ga-g])([#b]?)([^/]*)?(?:\/([A-Ga-g])([#b]?))?$/);
    if (!m) return { raw, unknown:true };
    const rootName = m[1].toUpperCase() + (m[2] || '');
    const root = NOTE_TO_PC[rootName];
    if (root == null) return { raw, unknown:true };
    const suffix = normalizeSuffix(m[3] || '');
    const low = suffix.toLowerCase();
    let triad = 'major';
    if (low.startsWith('m7b5') || low.startsWith('dim')) triad = 'dim';
    else if (low.startsWith('aug')) triad = 'aug';
    else if (low.startsWith('sus2')) triad = 'sus2';
    else if (low.includes('sus4') || low === 'sus') triad = 'sus4';
    else if (low.startsWith('m') && !low.startsWith('maj')) triad = 'minor';

    let seventh = 'none';
    if (low.startsWith('dim7')) seventh = 'dim7';
    else if (low.startsWith('mmaj7')) seventh = 'maj7';
    else if (/^maj(?:7|9|11|13)/.test(low)) seventh = 'maj7';
    else if (/^(?:m?7|m?9|m?11|m?13|7sus4|m7b5)/.test(low)) seventh = 'b7';

    let extension = 'none';
    if (/(?:^|[^0-9])13/.test(low)) extension = '13';
    else if (/(?:^|[^0-9])11/.test(low)) extension = '11';
    else if (/(?:^|[^0-9])9/.test(low)) extension = low.includes('add9') ? 'add9' : '9';
    else if (low.includes('add11')) extension = 'add11';
    else if (/^(m?6)$/.test(low)) extension = '6';

    const alterations = (low.match(/(?:b5|#5|b9|#9|#11|b13)/g) || []).sort().join(',') || 'none';
    const bassName = m[4] ? m[4].toUpperCase() + (m[5] || '') : null;
    const bass = bassName ? NOTE_TO_PC[bassName] : null;
    return { raw, root, rootName, triad, seventh, extension, alterations, bass, bassName, hasBass:bassName != null, noChord:false };
  }

  function canonicalTriad(label) {
    const c = parseChord(label);
    if (c.noChord) return 'N';
    if (c.unknown) return String(label || 'N');
    return `${c.root}:${c.triad}`;
  }
  function canonicalRoot(label) {
    const c = parseChord(label);
    if (c.noChord) return 'N';
    return c.unknown ? String(label || 'N') : String(c.root);
  }

  function parseKey(text) {
    if (!text) return null;
    const m = String(text).trim().match(/^([A-Ga-g])([#b]?)(?:\s+|:)?(major|maj|minor|min|m)?$/i);
    if (!m) return null;
    const root = NOTE_TO_PC[m[1].toUpperCase() + (m[2] || '')];
    if (root == null) return null;
    const q = (m[3] || 'major').toLowerCase();
    return { root, scale: (q === 'm' || q.startsWith('min')) ? 'minor' : 'major' };
  }

  function parseLab(text, duration) {
    const metadata = {};
    const rows = [];
    for (const original of String(text || '').split(/\r?\n/)) {
      const line = original.trim();
      if (!line) continue;
      if (/^[#;]/.test(line)) {
        const km = line.match(/^[#;]\s*key\s*:\s*(.+)$/i); if (km) metadata.key = km[1].trim();
        const bm = line.match(/^[#;]\s*bpm\s*:\s*([0-9.]+)/i); if (bm) metadata.bpm = Number(bm[1]);
        continue;
      }
      const parts = line.split(/\s+/);
      if (parts.length >= 3 && Number.isFinite(Number(parts[0])) && Number.isFinite(Number(parts[1]))) {
        rows.push({ start:Number(parts[0]), end:Number(parts[1]), chord:parts.slice(2).join(' ') });
      } else if (parts.length >= 2 && Number.isFinite(Number(parts[0]))) {
        rows.push({ start:Number(parts[0]), end:null, chord:parts.slice(1).join(' ') });
      }
    }
    rows.sort((a,b)=>a.start-b.start);
    for (let i=0;i<rows.length;i++) {
      if (!(rows[i].end > rows[i].start)) rows[i].end = i+1 < rows.length ? rows[i+1].start : Math.max(rows[i].start, Number(duration) || rows[i].start);
    }
    return { segments: rows.filter(x => x.end > x.start), metadata };
  }

  function chordAt(segments, time) {
    for (const s of segments || []) if (time >= Number(s.start) && time < Number(s.end)) return s.chord || s.label || 'N';
    return 'N';
  }

  function durationWeightedAgreement(pred, truth, duration, mapper) {
    const boundaries = new Set([0, Number(duration) || 0]);
    for (const s of pred || []) { boundaries.add(Math.max(0, Number(s.start)||0)); boundaries.add(Math.max(0, Number(s.end)||0)); }
    for (const s of truth || []) { boundaries.add(Math.max(0, Number(s.start)||0)); boundaries.add(Math.max(0, Number(s.end)||0)); }
    const points = [...boundaries].filter(Number.isFinite).sort((a,b)=>a-b);
    let correct=0,total=0;
    for (let i=0;i<points.length-1;i++) {
      const a=points[i], b=points[i+1]; if (!(b>a)) continue;
      const mid=(a+b)/2, w=b-a; total += w;
      if (mapper(chordAt(pred,mid)) === mapper(chordAt(truth,mid))) correct += w;
    }
    return total > 0 ? correct/total : 0;
  }

  function componentMetrics(pred, truth, duration) {
    const boundaries = new Set([0, Number(duration) || 0]);
    for (const s of pred || []) { boundaries.add(Math.max(0, Number(s.start)||0)); boundaries.add(Math.max(0, Number(s.end)||0)); }
    for (const s of truth || []) { boundaries.add(Math.max(0, Number(s.start)||0)); boundaries.add(Math.max(0, Number(s.end)||0)); }
    const points=[...boundaries].filter(Number.isFinite).sort((a,b)=>a-b);
    const names=['root','triad','seventh','extension','alterations'];
    const out={};
    for (const n of names) out[n]={correctDuration:0,evaluatedDuration:0,accuracy:null};
    let invTP=0,invFP=0,invFN=0,bassCorrect=0,bassTruthDuration=0,recognizedTruthDuration=0;
    const confusion={root:{},triad:{},seventh:{},extension:{},alterations:{},bass:{}};
    const addConf=(name,t,p,w)=>{const k=`${t}→${p}`;confusion[name][k]=(confusion[name][k]||0)+w;};

    for(let i=0;i<points.length-1;i++){
      const a=points[i],b=points[i+1]; if(!(b>a)) continue;
      const mid=(a+b)/2,w=b-a;
      const tc=parseChord(chordAt(truth,mid)), pc=parseChord(chordAt(pred,mid));
      if(tc.noChord || tc.unknown) continue;
      recognizedTruthDuration += w;
      for(const n of names){
        out[n].evaluatedDuration += w;
        const tv = n==='root' ? tc.root : tc[n];
        const pv = (pc.noChord||pc.unknown) ? 'N' : (n==='root' ? pc.root : pc[n]);
        if(tv===pv) out[n].correctDuration += w; else addConf(n,String(tv),String(pv),w);
      }
      const truthInv=!!tc.hasBass, predInv=!!(!pc.noChord&&!pc.unknown&&pc.hasBass);
      if(truthInv && predInv) invTP += w;
      else if(!truthInv && predInv) invFP += w;
      else if(truthInv && !predInv) invFN += w;
      if(truthInv){
        bassTruthDuration += w;
        const pv=(pc.noChord||pc.unknown)?'N':(pc.hasBass?pc.bass:pc.root);
        if(pv===tc.bass) bassCorrect += w; else addConf('bass',String(tc.bass),String(pv),w);
      }
    }
    for(const n of names) out[n].accuracy = out[n].evaluatedDuration ? out[n].correctDuration/out[n].evaluatedDuration : null;
    const precision=(invTP+invFP)?invTP/(invTP+invFP):(invFN?0:1);
    const recall=(invTP+invFN)?invTP/(invTP+invFN):(invFP?0:1);
    const f1=(precision+recall)?2*precision*recall/(precision+recall):0;
    out.inversion={precision,recall,f1,truePositiveDuration:invTP,falsePositiveDuration:invFP,falseNegativeDuration:invFN,bassAccuracy:bassTruthDuration?bassCorrect/bassTruthDuration:null,evaluatedBassDuration:bassTruthDuration};
    out.recognizedTruthDuration=recognizedTruthDuration;
    out.confusions={};
    for(const [name,map] of Object.entries(confusion)) out.confusions[name]=Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([pair,seconds])=>({pair,seconds}));
    return out;
  }

  function boundariesOf(segments) { return (segments || []).slice(1).map(s=>Number(s.start)).filter(Number.isFinite).sort((a,b)=>a-b); }
  function boundaryMetrics(pred, truth, tolerance=0.25) {
    const p=boundariesOf(pred), t=boundariesOf(truth), used=new Set(); let matches=0,absError=0;
    for (const x of p) {
      let best=-1,bestErr=Infinity;
      for (let i=0;i<t.length;i++) { if (used.has(i)) continue; const e=Math.abs(x-t[i]); if (e<=tolerance && e<bestErr) { best=i; bestErr=e; } }
      if (best>=0) { used.add(best); matches++; absError += bestErr; }
    }
    const precision=p.length?matches/p.length:(t.length?0:1), recall=t.length?matches/t.length:(p.length?0:1);
    const f1=(precision+recall)?2*precision*recall/(precision+recall):0;
    return { precision, recall, f1, matches, predicted:p.length, truth:t.length, meanAbsoluteError:matches?absError/matches:null, tolerance };
  }

  function evaluateAnalysis(analysis, labText, options={}) {
    const duration = Number(analysis?.duration) || Math.max(0, ...(analysis?.segments || []).map(s=>Number(s.end)||0));
    const parsed = parseLab(labText, duration);
    if (!parsed.segments.length) throw new Error('La anotación no contiene segmentos válidos. Usa: inicio fin acorde, o tiempo acorde.');
    const pred = analysis?.segments || [];
    const triadCSR = durationWeightedAgreement(pred, parsed.segments, duration, canonicalTriad);
    const rootCSR = durationWeightedAgreement(pred, parsed.segments, duration, canonicalRoot);
    const components = componentMetrics(pred, parsed.segments, duration);
    const boundary = boundaryMetrics(pred, parsed.segments, options.boundaryTolerance ?? 0.25);
    let key = null;
    if (parsed.metadata.key) {
      const truthKey=parseKey(parsed.metadata.key), predKey=parseKey(`${analysis.key || ''} ${analysis.scale || ''}`);
      if (truthKey && predKey) key={ truth:parsed.metadata.key, correct:truthKey.root===predKey.root && truthKey.scale===predKey.scale };
    }
    let bpm=null;
    if (Number.isFinite(parsed.metadata.bpm) && Number.isFinite(Number(analysis.bpm))) {
      const err=Math.abs(Number(analysis.bpm)-parsed.metadata.bpm);
      bpm={ truth:parsed.metadata.bpm, predicted:Number(analysis.bpm), absoluteError:err, within1Bpm:err<=1 };
    }
    return {
      kind:'ground-truth-evaluation', metricVersion:'chordsync-eval-v2-components',
      chordSymbolRecall:triadCSR, rootRecall:rootCSR, components, boundary, key, bpm,
      truthSegments:parsed.segments.length, predictedSegments:pred.length, annotationMetadata:parsed.metadata
    };
  }

  global.ChordSyncEvaluator = { parseLab, evaluateAnalysis, canonicalTriad, canonicalRoot, parseChord, componentMetrics };
})(typeof self !== 'undefined' ? self : window);
