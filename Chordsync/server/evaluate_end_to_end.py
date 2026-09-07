#!/usr/bin/env python3
import argparse, json, math, re
from pathlib import Path
from collections import defaultdict

PC={'C':0,'C#':1,'DB':1,'D':2,'D#':3,'EB':3,'E':4,'F':5,'F#':6,'GB':6,'G':7,'G#':8,'AB':8,'A':9,'A#':10,'BB':10,'B':11}
SEC={'intro':'Intro','verse':'Verse','verso':'Verse','pre-chorus':'Pre-Chorus','prechorus':'Pre-Chorus','coro':'Chorus','chorus':'Chorus','bridge':'Bridge','puente':'Bridge','solo':'Solo','outro':'Outro'}
def canon_root(ch):
    if not ch or ch in ('N','X'): return ch or 'N'
    m=re.match(r'^([A-Ga-g])([#b]?)',str(ch).strip());
    if not m:return 'N'
    return m.group(1).upper()+m.group(2).replace('b','b')
def canon_chord(ch):
    if not ch:return 'N'
    x=str(ch).strip().replace('♭','b').replace('♯','#')
    if x.upper() in ('N','X'):return x.upper()
    root=canon_root(x); rest=x[len(root):] if x.startswith(root) else x[1:]
    rest=rest.split('/')[0].replace(':maj','').replace(':min','m').replace('min','m')
    return root+rest
def parse_lab(path):
    meta={}; rows=[]
    for raw in Path(path).read_text(errors='ignore').splitlines():
        line=raw.strip()
        if not line:continue
        if line.startswith('#'):
            m=re.match(r'#\s*(key|bpm)\s*:\s*(.+)',line,re.I)
            if m: meta[m.group(1).lower()]=m.group(2).strip()
            continue
        p=line.split();
        if len(p)>=3: rows.append([float(p[0]),float(p[1]),canon_chord(' '.join(p[2:]))])
        elif len(p)>=2: rows.append([float(p[0]),None,canon_chord(' '.join(p[1:]))])
    for i,r in enumerate(rows):
        if r[1] is None:r[1]=rows[i+1][0] if i+1<len(rows) else r[0]+1
    return rows,meta
def overlap_metrics(pred,truth):
    total=correct=root_ok=0.0
    for ts,te,tc in truth:
        for ps,pe,pc in pred:
            ov=max(0,min(te,pe)-max(ts,ps))
            if ov<=0:continue
            total+=ov
            if canon_chord(pc)==canon_chord(tc):correct+=ov
            if canon_root(pc)==canon_root(tc):root_ok+=ov
    return {'csr':correct/total if total else None,'rootRecall':root_ok/total if total else None,'seconds':total}
def boundary_f1(pred,truth,tol=.25):
    p=[x[0] for x in pred[1:]]; t=[x[0] for x in truth[1:]]; used=set(); hits=0; errs=[]
    for x in p:
        cand=[(abs(x-y),i) for i,y in enumerate(t) if i not in used and abs(x-y)<=tol]
        if cand:
            d,i=min(cand);used.add(i);hits+=1;errs.append(d)
    pr=hits/len(p) if p else (1 if not t else 0); rc=hits/len(t) if t else (1 if not p else 0); f=2*pr*rc/(pr+rc) if pr+rc else 0
    return {'precision':pr,'recall':rc,'f1':f,'meanErrorSec':sum(errs)/len(errs) if errs else None}
def parse_beats(path):
    out=[]
    for l in Path(path).read_text(errors='ignore').splitlines():
        p=l.strip().split();
        if len(p)>=1:
            try: out.append((float(p[0]),int(p[1]) if len(p)>1 else 0))
            except: pass
    return out
def event_f1(pred,truth,tol):
    used=set();hits=0
    for x in pred:
        cand=[(abs(x-y),i) for i,y in enumerate(truth) if i not in used and abs(x-y)<=tol]
        if cand:_,i=min(cand);used.add(i);hits+=1
    pr=hits/len(pred) if pred else 0;rc=hits/len(truth) if truth else 0;f=2*pr*rc/(pr+rc) if pr+rc else 0
    return {'precision':pr,'recall':rc,'f1':f}
def parse_sections(path):
    out=[]
    for l in Path(path).read_text(errors='ignore').splitlines():
        p=l.strip().split()
        if len(p)>=3:
            try:s,e=float(p[0]),float(p[1]); lab=' '.join(p[2:]).strip();out.append((s,e,SEC.get(lab.lower(),lab)))
            except:pass
    return out
def section_metrics(pred,truth):
    labels=sorted(set([x[2] for x in truth]+[x[2] for x in pred])); tp=defaultdict(float);fp=defaultdict(float);fn=defaultdict(float); total=correct=0
    for ts,te,tl in truth:
        total+=te-ts
        for ps,pe,pl in pred:
            ov=max(0,min(te,pe)-max(ts,ps))
            if ov<=0:continue
            if pl==tl:correct+=ov;tp[tl]+=ov
            else:fp[pl]+=ov;fn[tl]+=ov
    f1=[]
    for l in labels:
        pr=tp[l]/(tp[l]+fp[l]) if tp[l]+fp[l] else 0;rc=tp[l]/(tp[l]+fn[l]) if tp[l]+fn[l] else 0; f1.append(2*pr*rc/(pr+rc) if pr+rc else 0)
    return {'accuracy':correct/total if total else None,'macroF1':sum(f1)/len(f1) if f1 else None,'boundary':boundary_f1(pred,truth,1.0)}
def key_match(pred_key,pred_scale,truth):
    if not truth:return None
    m=re.match(r'\s*([A-Ga-g](?:#|b)?)\s*(major|minor|maj|min|m)?',truth,re.I)
    if not m:return None
    tr=PC.get(m.group(1).upper()); pr=PC.get(str(pred_key).upper()); mode=(m.group(2) or '').lower(); tm='minor' if mode in ('minor','min','m') else 'major'
    return bool(tr==pr and str(pred_scale).lower().startswith(tm[:3]))
def main():
    ap=argparse.ArgumentParser();ap.add_argument('analysis');ap.add_argument('--lab');ap.add_argument('--beats');ap.add_argument('--sections');ap.add_argument('--out');a=ap.parse_args()
    d=json.loads(Path(a.analysis).read_text()); pred=[(float(x.get('start',0)),float(x.get('end',x.get('start',0))),x.get('chord','N')) for x in d.get('segments',[])]
    report={'schema':'chordsync-e2e-benchmark-v1','analysis':a.analysis,'engine':d.get('analysisEngine'),'metrics':{}}
    scores=[]
    if a.lab:
        truth,meta=parse_lab(a.lab); m=overlap_metrics(pred,truth); m['boundary']=boundary_f1(pred,truth,.25); m['keyAccuracy']=key_match(d.get('key'),d.get('scale'),meta.get('key')); m['bpmError']=abs(float(d.get('bpm',0))-float(meta['bpm'])) if meta.get('bpm') else None; report['metrics']['chords']=m
        for x,w in ((m['csr'],.38),(m['rootRecall'],.08),(m['boundary']['f1'],.12),(1.0 if m['keyAccuracy'] else 0.0,.08)):
            if x is not None:scores.append((x,w))
    if a.beats:
        t=parse_beats(a.beats); pb=[float(x.get('time',x.get('curr_beat_time',0))) for x in d.get('beatMap',[])]; tb=[x[0] for x in t]; pd=[float(x.get('time',0)) for x in d.get('beatMap',[]) if x.get('downbeat')]; td=[x[0] for x in t if x[1]==1]
        bm={'beat':event_f1(pb,tb,.07),'downbeat':event_f1(pd,td,.10)};report['metrics']['rhythm']=bm;scores.extend([(bm['beat']['f1'],.08),(bm['downbeat']['f1'],.06)])
    if a.sections:
        truth=parse_sections(a.sections); predsec=[(float(x.get('start',0)),float(x.get('end',0)),x.get('semanticLabel') or x.get('label','Unclassified').split('·')[0].strip()) for x in d.get('sections',[])]; sm=section_metrics(predsec,truth);report['metrics']['structure']=sm;scores.extend([(sm['accuracy'],.05),(sm['macroF1'],.05)])
    rt=d.get('runtime') or {}; report['metrics']['runtime']=rt
    if rt.get('realtimeFactor') is not None: scores.append((max(0,min(1,1-float(rt['realtimeFactor'])/2)),.02))
    sw=sum(w for _,w in scores); report['summary']={'score':sum(x*w for x,w in scores)/sw if sw else None,'score100':round(100*sum(x*w for x,w in scores)/sw,2) if sw else None,'availableWeight':round(sw,3)}
    txt=json.dumps(report,indent=2,ensure_ascii=False); print(txt); Path(a.out).write_text(txt) if a.out else None
if __name__=='__main__':main()
