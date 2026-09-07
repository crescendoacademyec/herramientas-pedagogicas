#!/usr/bin/env python3
import argparse,json,re
from pathlib import Path
from importlib.util import spec_from_file_location,module_from_spec

def load_e2e():
    p=Path(__file__).with_name('evaluate_end_to_end.py'); spec=spec_from_file_location('e2e',p); m=module_from_spec(spec);spec.loader.exec_module(m);return m
E=load_e2e()

def deep_find_beats(obj):
    if isinstance(obj,dict):
        for k in ('beats','beatMap','beatsAndChords','beatschords'):
            v=obj.get(k)
            if isinstance(v,list) and v:return v
        for v in obj.values():
            r=deep_find_beats(v)
            if r:return r
    return None

def moises_segments(data):
    beats=deep_find_beats(data) or []
    rows=[]
    for b in beats:
        if not isinstance(b,dict):continue
        t=b.get('curr_beat_time',b.get('start',b.get('time')))
        try:t=float(t)
        except:continue
        ch=b.get('chord_v2_display') or b.get('chord_complex_pop') or b.get('chord_basic_pop') or b.get('chord_simple_pop') or b.get('chord') or 'N'
        rows.append((t,E.canon_chord(ch)))
    rows.sort()
    seg=[]
    for i,(t,ch) in enumerate(rows):
        e=rows[i+1][0] if i+1<len(rows) else t+1
        if seg and seg[-1][2]==ch: seg[-1]=(seg[-1][0],e,ch)
        else:seg.append((t,e,ch))
    return seg,beats

def chordsync_segments(data):
    return [(float(x.get('start',0)),float(x.get('end',x.get('start',0))),x.get('chord','N')) for x in data.get('segments',[])]

def evaluate_system(pred,data,lab=None,beats_truth=None):
    out={}
    if lab:
        truth,meta=E.parse_lab(lab); out.update(E.overlap_metrics(pred,truth));out['boundary']=E.boundary_f1(pred,truth,.25)
        out['keyAccuracy']=E.key_match(data.get('key') or data.get('rootKey'),data.get('scale') or data.get('keyScale') or 'major',meta.get('key'))
        if meta.get('bpm'):
            try:out['bpmError']=abs(float(data.get('bpm',0))-float(meta['bpm']))
            except:out['bpmError']=None
    if beats_truth:
        t=E.parse_beats(beats_truth); tb=[x[0] for x in t];td=[x[0] for x in t if x[1]==1]
        src=data.get('beatMap') or deep_find_beats(data) or []
        pb=[];pd=[]
        for b in src:
            if not isinstance(b,dict):continue
            try:x=float(b.get('time',b.get('curr_beat_time',0)))
            except:continue
            pb.append(x)
            if b.get('downbeat') or b.get('beat_num')==1 or b.get('beatNum')==1:pd.append(x)
        out['beat']=E.event_f1(pb,tb,.07);out['downbeat']=E.event_f1(pd,td,.10)
    return out

def agreement(a,b):
    total=agree=0
    for as_,ae,ac in a:
        for bs,be,bc in b:
            ov=max(0,min(ae,be)-max(as_,bs))
            if ov<=0:continue
            total+=ov
            if E.canon_chord(ac)==E.canon_chord(bc):agree+=ov
    return agree/total if total else None

def main():
    ap=argparse.ArgumentParser();ap.add_argument('--chordsync',required=True);ap.add_argument('--moises',required=True);ap.add_argument('--lab');ap.add_argument('--beats');ap.add_argument('--out');a=ap.parse_args()
    cs=json.loads(Path(a.chordsync).read_text());mo=json.loads(Path(a.moises).read_text()); cseg=chordsync_segments(cs);mseg,_=moises_segments(mo)
    rep={'schema':'chordsync-vs-moises-benchmark-v1','groundTruthAvailable':bool(a.lab),'warning':None if a.lab else 'Sin ground truth: agreement entre sistemas NO es accuracy.','chordsync':evaluate_system(cseg,cs,a.lab,a.beats),'moises':evaluate_system(mseg,mo,a.lab,a.beats),'systemAgreement':agreement(cseg,mseg),'counts':{'chordsyncSegments':len(cseg),'moisesSegments':len(mseg)}}
    if a.lab:
        for k in ('csr','rootRecall'):
            x=rep['chordsync'].get(k);y=rep['moises'].get(k);rep.setdefault('deltaChordSyncMinusMoises',{})[k]=(x-y) if x is not None and y is not None else None
        x=rep['chordsync'].get('boundary',{}).get('f1');y=rep['moises'].get('boundary',{}).get('f1');rep.setdefault('deltaChordSyncMinusMoises',{})['boundaryF1']=(x-y) if x is not None and y is not None else None
    txt=json.dumps(rep,indent=2,ensure_ascii=False);print(txt)
    if a.out:Path(a.out).write_text(txt)
if __name__=='__main__':main()
