from __future__ import annotations
import json, math, os
from pathlib import Path
from typing import Dict
import numpy as np
try:
    from .structure_model import extract_section_features
except ImportError:
    from structure_model import extract_section_features

DEFAULT_MODEL_PATH=Path(__file__).resolve().parents[1]/'models'/'structure_joint_model.onnx'
LABELS=['Intro','Verse','Pre-Chorus','Chorus','Bridge','Solo','Outro']

def _sigmoid(x):
    x=np.asarray(x,dtype=np.float64); return (1/(1+np.exp(-np.clip(x,-40,40)))).astype(np.float32)

def _softmax(x):
    x=np.asarray(x,dtype=np.float64); x=x-np.max(x,axis=-1,keepdims=True); e=np.exp(x); return (e/np.maximum(e.sum(axis=-1,keepdims=True),1e-12)).astype(np.float32)

def _normalize_rows(x):
    x=np.asarray(x,dtype=np.float64); x=np.maximum(x,1e-12); return x/np.maximum(x.sum(axis=1,keepdims=True),1e-12)



def _cosine_similarity(a,b):
    a=np.asarray(a,dtype=np.float64).reshape(-1); b=np.asarray(b,dtype=np.float64).reshape(-1)
    den=float(np.linalg.norm(a)*np.linalg.norm(b))
    return float(np.dot(a,b)/den) if den>1e-12 else 0.0

_NOTE_TO_PC={'C':0,'B#':0,'C#':1,'DB':1,'D':2,'D#':3,'EB':3,'E':4,'FB':4,'E#':5,'F':5,'F#':6,'GB':6,'G':7,'G#':8,'AB':8,'A':9,'A#':10,'BB':10,'B':11,'CB':11}

def _chord_root_quality(label):
    import re
    x=str(label or 'N').strip()
    if not x or x.upper() in {'N','NC','NO_CHORD'}: return None,None
    x=x.split('/')[0]
    m=re.match(r'^([A-Ga-g])([#b]?)(.*)$',x)
    if not m:return None,None
    note=(m.group(1).upper()+m.group(2)).upper().replace('♭','B').replace('♯','#')
    pc=_NOTE_TO_PC.get(note)
    if pc is None:return None,None
    q=m.group(3).lower()
    minor=q.startswith('m') and not q.startswith('maj')
    return pc, ('minor' if minor else 'major')



def _parse_key_root_mode(key_obj):
    """Return (pitch_class, mode, confidence) from ChordSync local/global key metadata."""
    if not isinstance(key_obj, dict):
        return None, None, 0.0
    key=str(key_obj.get('key') or '').strip()
    scale=str(key_obj.get('scale') or key_obj.get('mode') or '').strip().lower()
    if not key:
        return None, None, 0.0
    import re
    m=re.match(r'^([A-Ga-g])([#b]?)',key)
    if not m:
        return None, None, 0.0
    note=(m.group(1).upper()+m.group(2)).upper().replace('♭','B').replace('♯','#')
    pc=_NOTE_TO_PC.get(note)
    if pc is None:
        return None, None, 0.0
    mode='minor' if ('minor' in scale or scale in {'min','m'}) else 'major'
    try: conf=float(key_obj.get('confidence',0.0) or 0.0)
    except Exception: conf=0.0
    return int(pc),mode,max(0.0,min(1.0,conf))

def _key_at_time(t, chord_seg, context):
    """Resolve the strongest local key available at time t without inventing one."""
    lk=chord_seg.get('localKey') if isinstance(chord_seg,dict) else None
    pc,mode,conf=_parse_key_root_mode(lk)
    if pc is not None:
        return pc,mode,conf,'segment-local'
    for r in (context.get('keyRegions') or []):
        try:
            if float(r.get('start',0)) <= t < float(r.get('end',0)):
                pc,mode,conf=_parse_key_root_mode(r)
                if pc is not None:return pc,mode,conf,'key-region'
        except Exception:
            pass
    pc,mode,conf=_parse_key_root_mode(context.get('globalKey') or {})
    if pc is not None:return pc,mode,conf,'global'
    return None,None,0.0,'none'

def _resample_vector(values,n=16,fill=0.0):
    a=np.asarray(values,dtype=np.float64).reshape(-1)
    if len(a)==0:return np.full(n,fill,dtype=np.float64)
    if len(a)==1:return np.full(n,float(a[0]),dtype=np.float64)
    xp=np.linspace(0,1,len(a)); x=np.linspace(0,1,n)
    return np.interp(x,xp,a).astype(np.float64)

def _context_section_features(a,b,context,y,sr,librosa):
    context=context or {}; out={}
    # 1) Harmonic progression fingerprint from ChordSync's decoded chord map.
    segs=[x for x in (context.get('segments') or []) if float(x.get('end',0))>a and float(x.get('start',0))<b]
    if segs:
        bins=16; harm=np.zeros((bins,14),dtype=np.float64)
        for bi,t in enumerate(np.linspace(a+1e-6,max(a+1e-6,b-1e-6),bins)):
            cand=[x for x in segs if float(x.get('start',0))<=t<float(x.get('end',0))]
            if not cand:cand=sorted(segs,key=lambda x:abs((float(x.get('start',0))+float(x.get('end',0)))/2-t))[:1]
            if cand:
                pc,q=_chord_root_quality(cand[0].get('chord'))
                if pc is not None:
                    harm[bi,pc]=1.0
                    harm[bi,12 if q=='major' else 13]=1.0
        out['harmony']=harm.reshape(-1)
        # v48: function-aware harmonic fingerprint. Roots are expressed as scale-degree
        # pitch classes relative to the strongest local key at each time bin. This makes
        # I-V-vi-IV comparable across keys and across detected modulations, while chord
        # quality and local mode remain explicit instead of being silently discarded.
        func=np.zeros((bins,16),dtype=np.float64)
        key_sources=[]
        for bi,t in enumerate(np.linspace(a+1e-6,max(a+1e-6,b-1e-6),bins)):
            cand=[x for x in segs if float(x.get('start',0))<=t<float(x.get('end',0))]
            if not cand:cand=sorted(segs,key=lambda x:abs((float(x.get('start',0))+float(x.get('end',0)))/2-t))[:1]
            if not cand:continue
            pc,q=_chord_root_quality(cand[0].get('chord'))
            kpc,kmode,kconf,ksrc=_key_at_time(float(t),cand[0],context)
            if pc is None or kpc is None:continue
            degree=(int(pc)-int(kpc))%12
            func[bi,degree]=max(.35,float(kconf)) if kconf>0 else .70
            func[bi,12 if q=='major' else 13]=1.0
            func[bi,14 if kmode=='major' else 15]=max(.45,float(kconf)) if kconf>0 else .70
            key_sources.append(ksrc)
        if np.any(func):
            out['functionalHarmony']=func.reshape(-1)
            out['functionalKeyCoverage']=float(np.count_nonzero(np.sum(func[:,:12],axis=1))/bins)
            if key_sources: out['functionalKeySource']=max(set(key_sources),key=key_sources.count)
    # 2) Rhythm fingerprint from beat map: normalized IOI contour + downbeat density.
    beats=[x for x in (context.get('beatMap') or []) if a<=float(x.get('time',0))<b]
    if len(beats)>=3:
        ts=np.asarray([float(x.get('time',0)) for x in beats],dtype=np.float64); io=np.diff(ts)
        med=float(np.median(io[io>1e-5])) if np.any(io>1e-5) else 1.0
        contour=_resample_vector(np.clip(io/max(med,1e-6),.45,1.9),16,1.0)
        density=len(beats)/max(1e-6,b-a); db=sum(1 for x in beats if x.get('downbeat'))/max(1,len(beats))
        out['rhythm']=np.concatenate([contour,[min(4.,density),db]])
    # 3) Energy contour from original audio.
    ia=max(0,int(round(a*sr))); ib=min(len(y),int(round(b*sr))); seg=np.asarray(y[ia:ib],dtype=np.float32)
    if len(seg)>64:
        chunks=np.array_split(seg,16); rms=np.asarray([float(np.sqrt(np.mean(np.square(c))+1e-12)) for c in chunks])
        scale=float(np.median(rms[rms>0])) if np.any(rms>0) else 1.0
        out['energy']=np.log1p(rms/max(scale,1e-8))
        # 4) Vocal/harmonic proxy. With no dedicated vocals file, use mid/high harmonicity shape.
        try:
            harm_y=librosa.effects.harmonic(seg)
            hc=np.array_split(harm_y,8); sc=np.array_split(seg,8)
            ratio=[]
            for h0,s0 in zip(hc,sc):
                hr=float(np.sqrt(np.mean(np.square(h0))+1e-12)); tr=float(np.sqrt(np.mean(np.square(s0))+1e-12)); ratio.append(hr/max(tr,1e-7))
            out['vocalProxy']=np.asarray(ratio,dtype=np.float64)
        except Exception:
            pass
    return out

def _transpose_invariant_harmony_similarity(a,b):
    """Compare 16x14 harmonic fingerprints while allowing a global key shift.

    The first 12 columns are root pitch classes and the final two are major/minor
    quality indicators. A single circular root shift is applied to the whole
    progression; this preserves interval motion and chord quality while making
    repeated sections robust to modulation/transposition.
    """
    va=np.asarray(a,dtype=np.float64).reshape(-1)
    vb=np.asarray(b,dtype=np.float64).reshape(-1)
    if va.size!=vb.size or va.size<14 or va.size%14!=0:
        sim=_cosine_similarity(va,vb)
        return float(sim),0,float(sim),float(sim),float(sim)
    aa=va.reshape(-1,14); bb=vb.reshape(-1,14)
    ar,br=aa[:,:12],bb[:,:12]; aq,bq=aa[:,12:14],bb[:,12:14]
    abs_root=max(0.0,min(1.0,_cosine_similarity(ar,br)))
    quality=max(0.0,min(1.0,_cosine_similarity(aq,bq)))
    best=(-1.0,0,0.0)
    for shift in range(12):
        shifted=np.roll(br,shift,axis=1)
        root=max(0.0,min(1.0,_cosine_similarity(ar,shifted)))
        # Root contour is the main signal; quality agreement prevents a major/minor
        # lookalike from becoming a strong repeat only because interval roots align.
        score=.82*root+.18*quality
        if score>best[0]:best=(score,shift,root)
    best_score,best_shift,best_root=best
    absolute=.82*abs_root+.18*quality
    return float(best_score),int(best_shift),float(absolute),float(best_root),float(quality)


def _functional_harmony_similarity(a,b):
    """Similarity of local-key-relative harmonic fingerprints.

    Root degrees dominate, while chord quality and key mode act as softer evidence.
    This is intentionally tolerant of borrowed/altered chords: one quality variation
    should not erase the identity of an otherwise repeated functional progression.
    """
    va=np.asarray(a,dtype=np.float64).reshape(-1)
    vb=np.asarray(b,dtype=np.float64).reshape(-1)
    if va.size!=vb.size or va.size<16 or va.size%16!=0:
        return max(0.0,min(1.0,_cosine_similarity(va,vb))),0.0,0.0,0.0
    aa=va.reshape(-1,16); bb=vb.reshape(-1,16)
    ar,br=aa[:,:12],bb[:,:12]
    aq,bq=aa[:,12:14],bb[:,12:14]
    am,bm=aa[:,14:16],bb[:,14:16]
    root=max(0.0,min(1.0,_cosine_similarity(ar,br)))
    quality=max(0.0,min(1.0,_cosine_similarity(aq,bq)))
    mode=max(0.0,min(1.0,_cosine_similarity(am,bm)))
    score=.78*root+.15*quality+.07*mode
    return float(score),float(root),float(quality),float(mode)



def _functional_tokens(vec):
    """Decode the 16-bin local-key-relative fingerprint into a compact chord sequence."""
    v=np.asarray(vec,dtype=np.float64).reshape(-1)
    if v.size<16 or v.size%16!=0:return []
    x=v.reshape(-1,16); out=[]
    for row in x:
        roots=row[:12]
        if float(np.max(roots))<=1e-9:continue
        degree=int(np.argmax(roots)); q='major' if row[12]>=row[13] else 'minor'
        mode='major' if row[14]>=row[15] else 'minor'
        conf=float(np.max(roots))
        tok=(degree,q,mode,conf)
        if not out or out[-1][:3]!=tok[:3]:out.append(tok)
    return out

def _functional_role(degree,quality,mode):
    d=int(degree)%12
    # Broad tonal-role families, intentionally permissive for modal mixture.
    if mode=='major':
        if d in {0,4,9,3,8}: role='tonic'
        elif d in {2,5}: role='predominant'
        elif d in {7,11}: role='dominant'
        else: role='color'
    else:
        if d in {0,3,8}: role='tonic'
        elif d in {2,5}: role='predominant'
        elif d in {7,11}: role='dominant'
        else: role='color'
    # Major chromatic chords a fifth above common diatonic targets often behave as secondary dominants.
    if quality=='major' and d in {2,4,9,11}: role='dominant'
    # Borrowed iv / bVII are common functional substitutes rather than unrelated color.
    if quality=='minor' and d==5: role='predominant'
    if quality=='major' and d==10: role='dominant'
    return role

def _functional_token_cost(a,b):
    da,qa,ma,_=a; db,qb,mb,_=b
    if da==db and qa==qb:return 0.0 if ma==mb else 0.05
    sem=min((da-db)%12,(db-da)%12)
    pitch_cost=min(1.0,sem/6.0)
    ra,rb=_functional_role(da,qa,ma),_functional_role(db,qb,mb)
    role_cost=0.0 if ra==rb else (0.28 if {ra,rb}<={'tonic','predominant','dominant'} else 0.48)
    quality_cost=0.0 if qa==qb else 0.18
    mode_cost=0.0 if ma==mb else 0.08
    # Functional substitutes may differ substantially in root while preserving section identity.
    return float(min(1.0,0.42*pitch_cost+0.38*role_cost+quality_cost+mode_cost))

def _functional_reharmonization_similarity(a,b,insert_delete_cost=.46):
    """Soft edit-distance over functional chord tokens.

    Tolerates substitutions, secondary dominants and inserted passing chords without
    treating every differing scale degree as a full mismatch.
    """
    aa=_functional_tokens(a); bb=_functional_tokens(b)
    if not aa or not bb:return 0.0,{'tokensA':len(aa),'tokensB':len(bb),'editCost':1.0}
    n,m=len(aa),len(bb); gap=float(insert_delete_cost)
    dp=np.zeros((n+1,m+1),dtype=np.float64)
    for i in range(1,n+1):dp[i,0]=i*gap
    for j in range(1,m+1):dp[0,j]=j*gap
    for i in range(1,n+1):
        for j in range(1,m+1):
            sub=dp[i-1,j-1]+_functional_token_cost(aa[i-1],bb[j-1])
            dp[i,j]=min(sub,dp[i-1,j]+gap,dp[i,j-1]+gap)
    norm=max(1.0,max(n,m)*gap)
    cost=min(1.0,float(dp[n,m]/norm)); sim=max(0.0,1.0-cost)
    return sim,{'tokensA':n,'tokensB':m,'editCost':cost}

def _multimodal_repeat_similarity(a,b,weights=None,transposition_invariant=True,functional_reharmonization=True,functional_reharm_weight=.68):
    weights=weights or {'acoustic':.28,'harmony':.18,'functionalHarmony':.22,'rhythm':.14,'energy':.09,'vocalProxy':.09}
    scores={}; active=[]
    for key,w in weights.items():
        va=a.get(key); vb=b.get(key)
        if va is None or vb is None:continue
        if key=='functionalHarmony':
            strict,root_sim,quality_sim,mode_sim=_functional_harmony_similarity(va,vb)
            flexible,reharm_diag=_functional_reharmonization_similarity(va,vb) if functional_reharmonization else (strict,{'tokensA':0,'tokensB':0,'editCost':1.0-strict})
            rw=max(0.0,min(1.0,float(functional_reharm_weight)))
            sim=(1-rw)*strict+rw*flexible
            scores['functionalHarmony']=float(sim)
            scores['functionalHarmonyStrict']=float(strict)
            scores['functionalHarmonyFlexible']=float(flexible)
            scores['functionalHarmonyRoot']=float(root_sim)
            scores['functionalHarmonyQuality']=float(quality_sim)
            scores['functionalHarmonyMode']=float(mode_sim)
            scores['functionalHarmonyReharmEditCost']=float(reharm_diag.get('editCost',1.0))
        elif key=='harmony' and transposition_invariant:
            sim,shift,absolute,root_sim,quality_sim=_transpose_invariant_harmony_similarity(va,vb)
            scores['harmony']=float(sim)
            scores['harmonyAbsolute']=float(absolute)
            scores['harmonyRoot']=float(root_sim)
            scores['harmonyQuality']=float(quality_sim)
            scores['harmonyAlignmentShiftSemitones']=int(shift)
            rel=(-int(shift))%12
            if rel>6: rel-=12
            scores['harmonyRelativeTransposeSemitones']=int(rel)
        elif key=='harmony':
            sim=max(-1.0,min(1.0,_cosine_similarity(va,vb)))
            scores['harmony']=float(sim)
            scores['harmonyAbsolute']=float(sim)
            scores['harmonyRoot']=float(sim)
            scores['harmonyQuality']=1.0
            scores['harmonyAlignmentShiftSemitones']=0
            scores['harmonyRelativeTransposeSemitones']=0
        else:
            sim=_cosine_similarity(va,vb)
            if key in {'rhythm','energy','vocalProxy'}: sim=max(0.0,min(1.0,sim))
            else: sim=max(-1.0,min(1.0,sim))
            scores[key]=float(sim)
        active.append((key,float(w)))
    if not active:return 0.0,scores
    den=sum(w for _,w in active) or 1.0
    combined=sum(scores[k]*w for k,w in active)/den
    # If harmonic context exists, prevent a pure timbral match from dominating a clearly different progression.
    if 'harmony' in scores and scores['harmony']<.42 and scores.get('functionalHarmony',0.0)<.62: combined*=.72
    # Functional agreement can rescue a modulated/reharmonized repeat, but a very
    # different local-key-relative progression should cap a pure timbral match.
    if 'functionalHarmony' in scores and scores['functionalHarmony']<.38: combined*=.76
    # A non-zero global transposition is accepted only when chord quality also agrees.
    # This keeps modulated choruses matchable without letting arbitrary root contours pair up.
    if scores.get('harmonyRelativeTransposeSemitones',0)!=0 and scores.get('harmonyQuality',1.0)<.52: combined*=.78
    return float(combined),scores

def _repeat_consensus_sections(emissions, fingerprints, durations, weight=.26, similarity_threshold=.79, min_duration_ratio=.62, feature_weights=None, transposition_invariant=True, functional_reharmonization=True, functional_reharm_weight=.68):
    e=np.asarray(emissions,dtype=np.float64)
    n,k=e.shape if e.ndim==2 else (0,0)
    if n<2 or weight<=0:
        return e, {'applied':False,'reason':'disabled-or-too-few-sections','baseWeight':float(weight),'groups':0,'changedArgmax':0}
    parent=list(range(n))
    def find(x):
        while parent[x]!=x:
            parent[x]=parent[parent[x]]; x=parent[x]
        return x
    def union(a,b):
        ra,rb=find(a),find(b)
        if ra!=rb: parent[rb]=ra
    sims={}; component_acc={}
    for i in range(n):
        for j in range(i+1,n):
            dr=min(float(durations[i]),float(durations[j]))/max(1e-6,max(float(durations[i]),float(durations[j])))
            if dr<min_duration_ratio: continue
            sim,parts=_multimodal_repeat_similarity(fingerprints[i],fingerprints[j],weights=feature_weights,transposition_invariant=transposition_invariant,functional_reharmonization=functional_reharmonization,functional_reharm_weight=functional_reharm_weight); sims[(i,j)]={'combined':sim,**parts}
            for k0,v0 in parts.items():
                if 'ShiftSemitones' in k0 or 'TransposeSemitones' in k0: continue
                component_acc.setdefault(k0,[]).append(v0)
            if sim>=similarity_threshold: union(i,j)
    groups={}
    for i in range(n): groups.setdefault(find(i),[]).append(i)
    groups=[g for g in groups.values() if len(g)>=2]
    if not groups:
        return e, {'applied':False,'reason':'no-repeat-groups','baseWeight':float(weight),'groups':0,'changedArgmax':0,'similarityThreshold':float(similarity_threshold),'method':'multimodal-repeat-consensus-v5-functional-reharmonization-aware','componentMeanSimilarity':{k:float(np.mean(v)) for k,v in component_acc.items() if v},'transpositionInvariantHarmony':bool(transposition_invariant),'functionalReharmonization':bool(functional_reharmonization),'functionalReharmWeight':float(functional_reharm_weight)}
    out=e.copy(); changed=0; influenced=0; mean_weights=[]; details=[]
    for gi,g in enumerate(groups,1):
        conf=np.max(e[g],axis=1); donor_weights=np.clip((conf-.45)/.55,0,1)+.15
        consensus=np.average(e[g],axis=0,weights=donor_weights); consensus/=max(1e-12,consensus.sum()); group_changes=0
        pair_scores=[]
        for x in range(len(g)):
            for y0 in range(x+1,len(g)):
                key=(min(g[x],g[y0]),max(g[x],g[y0]));
                if key in sims:pair_scores.append(sims[key]['combined'])
        group_sim=float(np.mean(pair_scores)) if pair_scores else similarity_threshold
        for idx in g:
            raw=int(np.argmax(out[idx])); uncertainty=max(.10,1-float(np.max(e[idx])))
            adaptive=float(weight)*(0.30+0.95*uncertainty)*(0.72+0.36*max(0,min(1,group_sim)))
            adaptive=min(adaptive,.55)
            out[idx]=(1-adaptive)*out[idx]+adaptive*consensus; out[idx]/=max(1e-12,out[idx].sum())
            if int(np.argmax(out[idx]))!=raw: changed+=1; group_changes+=1
            influenced+=1; mean_weights.append(adaptive)
        transpositions=[]
        for x in range(len(g)):
            for y0 in range(x+1,len(g)):
                key=(min(g[x],g[y0]),max(g[x],g[y0]))
                if key in sims and 'harmonyRelativeTransposeSemitones' in sims[key]:
                    transpositions.append({'from':g[x],'to':g[y0],'semitones':int(sims[key]['harmonyRelativeTransposeSemitones']),'harmonySimilarity':round(float(sims[key].get('harmony',0.0)),4),'absoluteHarmonySimilarity':round(float(sims[key].get('harmonyAbsolute',0.0)),4)})
        nonzero=[x['semitones'] for x in transpositions if x['semitones']!=0]
        details.append({'id':f'repeat-{gi}','members':g,'size':len(g),'changedArgmax':group_changes,'consensusLabelIndex':int(np.argmax(consensus)),'meanSimilarity':round(group_sim,4),'transpositionAware':bool(transpositions),'modulatedPairs':len(nonzero),'transpositions':transpositions})
    return out, {'applied':True,'method':'multimodal-repeat-consensus-v5-functional-reharmonization-aware','baseWeight':float(weight),'meanAdaptiveWeight':float(np.mean(mean_weights)) if mean_weights else 0.0,'groups':len(groups),'influencedSections':influenced,'changedArgmax':changed,'similarityThreshold':float(similarity_threshold),'componentMeanSimilarity':{k:float(np.mean(v)) for k,v in component_acc.items() if v},'transpositionInvariantHarmony':bool(transposition_invariant),'functionalReharmonization':bool(functional_reharmonization),'functionalReharmWeight':float(functional_reharm_weight),'details':details}

def _viterbi_sections(emissions, transition_probs, start_probs, weight=.28, max_bonus=.35, max_penalty=.45):
    e=np.asarray(emissions,dtype=np.float64); n,k=e.shape
    if n==0:return np.empty((0,),np.int64), {'applied':False,'reason':'empty'}
    t=_normalize_rows(transition_probs); s=np.asarray(start_probs,dtype=np.float64); s=np.maximum(s,1e-12); s/=s.sum()
    loge=np.log(np.clip(e,1e-8,1.)); logt=np.log(np.clip(t,1e-8,1.)); uniform_log=-math.log(max(1,k))
    # Center transition evidence around uniform so the prior can both help and penalize,
    # while keeping hard bounds that prevent the sequence model from overriding strong audio.
    adjustment=np.clip(logt-uniform_log,-float(max_penalty),float(max_bonus))
    dp=np.full((n,k),-1e30,dtype=np.float64); back=np.zeros((n,k),dtype=np.int64)
    dp[0]=loge[0]+0.10*np.log(np.clip(s,1e-8,1.))
    used=[]
    for i in range(1,n):
        conf=float(np.max(e[i])); uncertainty=max(.18,1-conf); adaptive=float(weight)*(0.45+0.85*uncertainty); used.append(adaptive)
        score=dp[i-1][:,None]+adaptive*adjustment
        back[i]=np.argmax(score,axis=0); dp[i]=loge[i]+score[back[i],np.arange(k)]
    out=np.zeros(n,dtype=np.int64); out[-1]=int(np.argmax(dp[-1]))
    for i in range(n-2,-1,-1):out[i]=back[i+1,out[i+1]]
    return out, {'applied':True,'meanAdaptiveWeight':float(np.mean(used)) if used else 0.,'baseWeight':float(weight),'maxBonus':float(max_bonus),'maxPenalty':float(max_penalty)}

class StructureJointRuntime:
    def __init__(self,model_path:Path|None=None,meta_path:Path|None=None):
        self.model_path=Path(os.environ.get('CHORDSYNC_STRUCTURE_JOINT_MODEL',str(model_path or DEFAULT_MODEL_PATH)))
        self.meta_path=Path(os.environ.get('CHORDSYNC_STRUCTURE_JOINT_MODEL_META',str(meta_path or (str(self.model_path)+'.json')))); self._session=None; self._meta={}; self._error=None; self._transitions=None
    def _ort_available(self):
        try: import onnxruntime  # noqa
        except Exception: return False
        return True
    @property
    def available(self): return self.model_path.exists() and self._ort_available()
    def metadata(self)->Dict:
        if not self._meta and self.meta_path.exists():
            try:self._meta=json.loads(self.meta_path.read_text(encoding='utf-8'))
            except Exception as e:self._error=f'metadata: {e}'
        return self._meta
    def _transition_path(self):
        m=self.metadata(); rel=m.get('sectionTransitions')
        if rel:
            p=Path(rel); return p if p.is_absolute() else self.model_path.parent/p
        return Path(str(self.model_path)+'.section-transitions.json')
    def transition_prior(self):
        if self._transitions is not None:return self._transitions
        p=self._transition_path()
        if not p.exists():self._transitions={}; return self._transitions
        try:self._transitions=json.loads(p.read_text(encoding='utf-8'))
        except Exception as e:self._error=f'section transitions: {e}'; self._transitions={}
        return self._transitions
    def status(self):
        m=self.metadata(); tp=self.transition_prior(); return {'available':self.available,'modelPath':str(self.model_path),'metadataPath':str(self.meta_path),'modelName':m.get('modelName',self.model_path.name),'sequenceContextAvailable':bool(tp.get('probabilities')),'sequenceContextFitSplit':tp.get('fitSplit'),'repeatContextAvailable':True,'repeatContextMethod':'multimodal-repeat-consensus-v5-functional-reharmonization-aware','repeatTranspositionInvariant':bool(m.get('repeatTranspositionInvariant',True)),'repeatFunctionalHarmony':bool(m.get('repeatFunctionalHarmony',True)),'repeatFunctionalReharmonization':bool(m.get('repeatFunctionalReharmonization',True)),'error':self._error}
    def _ensure_session(self):
        if self._session is not None:return self._session
        if not self.model_path.exists():raise RuntimeError(f'Modelo conjunto no encontrado: {self.model_path}')
        try:import onnxruntime as ort
        except Exception as e:raise RuntimeError('onnxruntime no está instalado') from e
        providers=['CPUExecutionProvider']; avail=set(ort.get_available_providers())
        if 'CUDAExecutionProvider' in avail and os.environ.get('CHORDSYNC_STRUCTURE_DEVICE','auto').lower()!='cpu':providers=['CUDAExecutionProvider','CPUExecutionProvider']
        self._session=ort.InferenceSession(str(self.model_path),providers=providers); return self._session
    def analyze_file(self,input_path:Path,threshold:float|None=None,hop_seconds:float|None=None,sequence_context_weight:float|None=None,repeat_context_weight:float|None=None,context:Dict|None=None)->Dict:
        try:import librosa
        except Exception as e:raise RuntimeError('librosa no está instalado. Instala server/requirements-structure-neural.txt') from e
        m=self.metadata(); sr_target=int(m.get('sampleRate',22050)); frames=int(m.get('frames',128)); n_mels=int(m.get('nMels',64)); window=float(m.get('windowSeconds',10.0)); hop=float(hop_seconds or m.get('scanHopSeconds',.75)); threshold=float(threshold if threshold is not None else m.get('boundaryThreshold',.55)); nms=float(m.get('nmsSeconds',2.0)); edge=float(m.get('minEdgeSeconds',2.0)); labels=list(m.get('labels') or LABELS)
        seq_weight=float(sequence_context_weight if sequence_context_weight is not None else m.get('sequenceContextWeight',.28)); seq_weight=max(0.,min(.8,seq_weight))
        repeat_weight=float(repeat_context_weight if repeat_context_weight is not None else m.get('repeatContextWeight',.26)); repeat_weight=max(0.,min(.8,repeat_weight))
        repeat_similarity=float(m.get('repeatSimilarityThreshold',.79))
        repeat_feature_weights=m.get('repeatFeatureWeights') if isinstance(m.get('repeatFeatureWeights'),dict) else None
        repeat_transposition_invariant=bool(m.get('repeatTranspositionInvariant',True))
        repeat_functional_harmony=bool(m.get('repeatFunctionalHarmony',True))
        repeat_functional_reharmonization=bool(m.get('repeatFunctionalReharmonization',True))
        repeat_functional_reharm_weight=max(0.0,min(1.0,float(m.get('repeatFunctionalReharmWeight',.68))))
        if repeat_feature_weights and not repeat_functional_harmony: repeat_feature_weights={k:v for k,v in repeat_feature_weights.items() if k!='functionalHarmony'}
        y,sr=librosa.load(input_path,sr=sr_target,mono=True); duration=len(y)/max(1,sr)
        if duration<max(4.,window*.65):return {'provider':'chordsync-structure-joint-transformer-onnx','boundaries':[],'curve':[],'semanticCurve':[],'sections':[],'duration':duration,'sequenceContext':{'applied':False,'reason':'short-audio'},'repeatContext':{'applied':False,'reason':'short-audio'}}
        try: tempo=float(np.asarray(librosa.beat.beat_track(y=y,sr=sr)[0]).reshape(-1)[0]) if len(y)>sr else 0.
        except Exception: tempo=0.
        centers=np.arange(max(edge,hop),max(edge,duration-edge)+1e-9,hop)
        xs=[]; auxs=[]
        for c in centers:
            a=max(0.,float(c-window/2)); b=min(duration,float(c+window/2)); x,aux=extract_section_features(y,sr,a,b,duration,tempo,n_mels,frames); xs.append(x); auxs.append(aux)
        if not xs:return {'provider':'chordsync-structure-joint-transformer-onnx','boundaries':[],'curve':[],'semanticCurve':[],'sections':[],'duration':duration,'sequenceContext':{'applied':False,'reason':'no-windows'},'repeatContext':{'applied':False,'reason':'no-windows'}}
        s=self._ensure_session(); ins={i.name:i for i in s.get_inputs()}; xb=np.stack(xs).astype(np.float32); ab=np.stack(auxs).astype(np.float32); feed={'x' if 'x' in ins else next(iter(ins)):xb}
        if 'aux' in ins:feed['aux']=ab
        outs=s.run(None,feed)
        if len(outs)<2:raise RuntimeError('Modelo conjunto debe devolver boundary_logits y semantic_logits')
        b_logits=np.asarray(outs[0]); sem_logits=np.asarray(outs[1])
        if b_logits.ndim==2:b_logits=b_logits[:,0]
        b_probs=_sigmoid(b_logits); sem_probs=_softmax(sem_logits)
        curve=[{'time':round(float(t),6),'probability':round(float(p),6)} for t,p in zip(centers,b_probs)]
        semantic_curve=[]
        for i,t in enumerate(centers):
            p=sem_probs[i]; k=int(np.argmax(p)); semantic_curve.append({'time':round(float(t),6),'label':labels[k] if k<len(labels) else str(k),'confidence':round(float(p[k]),6),'probabilities':{labels[j]:round(float(p[j]),6) for j in range(min(len(labels),len(p)))}})
        cand=sorted([(float(p),float(t)) for t,p in zip(centers,b_probs) if p>=threshold],reverse=True); kept=[]
        for p,t in cand:
            if t<edge or duration-t<edge:continue
            if any(abs(t-u['time'])<nms for u in kept):continue
            kept.append({'time':round(t,6),'confidence':round(p,6)})
        kept.sort(key=lambda r:r['time'])
        pts=[0.0]+[float(x['time']) for x in kept]+[duration]; sections=[]; section_emissions=[]; section_fingerprints=[]; section_durations=[]
        for i in range(len(pts)-1):
            a,b=pts[i],pts[i+1]; idx=[j for j,t in enumerate(centers) if a<=t<b]
            if not idx:
                mid=(a+b)/2; j=int(np.argmin(np.abs(centers-mid))); idx=[j]
            avg=sem_probs[idx].mean(axis=0); avg=avg/np.maximum(avg.sum(),1e-12); section_emissions.append(avg)
            # v49 multimodal repeat fingerprint with transposition-invariant + local-key-relative functional harmony. Acoustic texture remains one component, but
            # ChordSync chord-map/rhythm context and local energy/harmonic profile make repeats
            # robust to arrangement, dynamics and vocal variations.
            fp0=xb[idx].mean(axis=(0,1)); fp0=np.asarray(fp0,dtype=np.float64); fp0=fp0-fp0.mean(); fp0/=max(1e-9,float(np.linalg.norm(fp0)))
            fp={'acoustic':fp0}
            fp.update(_context_section_features(a,b,context,y,sr,librosa))
            section_fingerprints.append(fp); section_durations.append(max(1e-3,b-a))
            k=int(np.argmax(avg)); sections.append({'index':i,'start':round(a,6),'end':round(b,6),'label':labels[k] if k<len(labels) else str(k),'confidence':round(float(avg[k]),6),'probabilities':{labels[j]:round(float(avg[j]),6) for j in range(min(len(labels),len(avg)))},'rawLabel':labels[k] if k<len(labels) else str(k),'rawConfidence':round(float(avg[k]),6)})
        repeated_emissions,repeat_diag=_repeat_consensus_sections(np.stack(section_emissions),section_fingerprints,section_durations,weight=repeat_weight,similarity_threshold=repeat_similarity,feature_weights=repeat_feature_weights,transposition_invariant=repeat_transposition_invariant,functional_reharmonization=repeat_functional_reharmonization,functional_reharm_weight=repeat_functional_reharm_weight)
        for i,avg in enumerate(repeated_emissions):
            raw=sections[i]['label']; k=int(np.argmax(avg)); sections[i]['repeatRawLabel']=raw; sections[i]['repeatAdjusted']=(labels[k] if k<len(labels) else str(k))!=raw
            sections[i]['label']=labels[k] if k<len(labels) else str(k); sections[i]['confidence']=round(float(avg[k]),6); sections[i]['probabilities']={labels[j]:round(float(avg[j]),6) for j in range(min(len(labels),len(avg)))}
        section_emissions=[x for x in repeated_emissions]
        # Attach repeat-group IDs for audit/UI.
        for g in repeat_diag.get('details',[]):
            for idx in g.get('members',[]):
                if 0<=idx<len(sections): sections[idx]['repeatGroup']=g.get('id')
        seq_diag={'applied':False,'reason':'transition-prior-unavailable','baseWeight':seq_weight}
        prior=self.transition_prior()
        try:
            probs=np.asarray(prior.get('probabilities'),dtype=np.float64); starts=np.asarray(prior.get('startProbabilities'),dtype=np.float64)
            prior_labels=list(prior.get('labels') or [])
            compatible=probs.shape==(len(labels),len(labels)) and starts.shape==(len(labels),) and (not prior_labels or prior_labels==labels)
            if compatible and seq_weight>0 and len(sections)>1:
                decoded,seq_diag=_viterbi_sections(np.stack(section_emissions),probs,starts,weight=seq_weight)
                changed=0
                for i,k in enumerate(decoded):
                    raw=sections[i]['label']; sections[i]['label']=labels[int(k)]; sections[i]['confidence']=round(float(section_emissions[i][int(k)]),6); sections[i]['sequenceAdjusted']=sections[i]['label']!=raw
                    if sections[i]['sequenceAdjusted']:changed+=1
                seq_diag.update({'changedSections':changed,'sectionCount':len(sections),'fitSplit':prior.get('fitSplit'),'transitionCount':prior.get('transitionCount'),'labels':labels})
            elif compatible and len(sections)<=1:seq_diag={'applied':False,'reason':'single-section','baseWeight':seq_weight}
        except Exception as e:
            seq_diag={'applied':False,'reason':f'transition-prior-error: {e}','baseWeight':seq_weight}
        return {'provider':'chordsync-structure-joint-transformer-onnx-functional-reharm-repeat-v49','modelName':m.get('modelName',self.model_path.name),'modelVersion':m.get('version',2),'threshold':threshold,'windowSeconds':window,'hopSeconds':hop,'nmsSeconds':nms,'boundaries':kept,'curve':curve,'semanticCurve':semantic_curve,'sections':sections,'labels':labels,'duration':round(duration,6),'tempo':round(tempo,3) if math.isfinite(tempo) else None,'sequenceContext':seq_diag,'repeatContext':repeat_diag}
