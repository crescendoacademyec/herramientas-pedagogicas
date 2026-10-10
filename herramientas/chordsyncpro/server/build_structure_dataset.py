"""Build a key-independent semantic song-structure dataset from audio + .sections.

Ground-truth format (UTF-8):
    0.000  8.400   Intro
    8.400  32.100  Verse
    32.100 48.000  Pre-Chorus
    48.000 72.000  Chorus

Accepted labels: Intro, Verse, Pre-Chorus, Chorus, Bridge, Solo, Outro.
Aliases in Spanish are normalized as well.

Outputs train.npz / validation.npz / test.npz containing:
    x         float32 [N, frames, n_mels]  time-normalized log-mel section patch
    aux       float32 [N, 8]               position, duration, RMS, onset, centroid,
                                               ZCR, chroma entropy, tempo
    label     int64   [N]
    song_id   unicode [N]
    start/end float32 [N]

Split is deterministic by song, preventing section leakage across train/validation/test.
"""
from __future__ import annotations
import argparse, hashlib, json, re
from pathlib import Path
import numpy as np
try:
    import librosa
except Exception as exc:
    raise SystemExit('librosa is required; install server/requirements-training.txt') from exc

AUDIO_EXTS={'.wav','.mp3','.flac','.ogg','.m4a','.aac','.aif','.aiff'}
LABELS=['Intro','Verse','Pre-Chorus','Chorus','Bridge','Solo','Outro']
ALIASES={
'intro':'Intro','introduction':'Intro','introduccion':'Intro','introducción':'Intro',
'verse':'Verse','verso':'Verse','estrofa':'Verse',
'pre-chorus':'Pre-Chorus','prechorus':'Pre-Chorus','pre chorus':'Pre-Chorus','pre-coro':'Pre-Chorus','precoro':'Pre-Chorus','pre coro':'Pre-Chorus',
'chorus':'Chorus','coro':'Chorus','refrain':'Chorus','estribillo':'Chorus',
'bridge':'Bridge','puente':'Bridge','solo':'Solo','instrumental':'Solo','instrumental solo':'Solo',
'outro':'Outro','ending':'Outro','final':'Outro','coda':'Outro'}

def norm_label(s:str):
    k=re.sub(r'\s+',' ',s.strip().lower().replace('_','-'))
    return ALIASES.get(k,next((x for x in LABELS if x.lower()==k),None))

def stable_unit(text,seed):
    h=hashlib.sha256(f'{seed}:{text}'.encode()).digest();return int.from_bytes(h[:8],'big')/2**64

def split_name(song_id,seed,ratios):
    u=stable_unit(song_id,seed); a,b=ratios[0],ratios[0]+ratios[1]
    return 'train' if u<a else ('validation' if u<b else 'test')

def parse_sections(path:Path,duration:float):
    rows=[]
    for raw in path.read_text(encoding='utf-8').splitlines():
        line=raw.strip()
        if not line or line.startswith(('#',';')):continue
        p=line.split()
        if len(p)<2:continue
        try:start=float(p[0])
        except:continue
        end=None; idx=1
        try:end=float(p[1]);idx=2
        except:pass
        label=norm_label(' '.join(p[idx:]))
        if label:rows.append([start,end,label])
    rows.sort(key=lambda x:x[0])
    for i,r in enumerate(rows):
        if r[1] is None or r[1]<=r[0]:r[1]=rows[i+1][0] if i+1<len(rows) else duration
    return [r for r in rows if r[1]>r[0]]

def time_resize(x:np.ndarray,frames:int):
    # x [mels,time] -> [frames,mels]
    if x.shape[1]==0:return np.zeros((frames,x.shape[0]),np.float32)
    old=np.linspace(0,1,x.shape[1]);new=np.linspace(0,1,frames)
    out=np.stack([np.interp(new,old,row) for row in x],axis=1)
    return out.astype(np.float32)

def entropy(v):
    v=np.maximum(v,1e-8);v=v/v.sum();return float(-(v*np.log(v)).sum()/np.log(len(v)))

def section_features(y,sr,start,end,duration,tempo,n_mels,frames):
    a=max(0,int(start*sr));b=min(len(y),max(a+1,int(end*sr)));z=y[a:b]
    mel=librosa.feature.melspectrogram(y=z,sr=sr,n_fft=2048,hop_length=512,n_mels=n_mels,power=2.0)
    db=librosa.power_to_db(mel+1e-10,ref=np.max); db=np.clip((db+80)/80,0,1)
    x=time_resize(db,frames)
    rms=float(np.mean(librosa.feature.rms(y=z))) if len(z)>0 else 0
    onset=float(np.mean(librosa.onset.onset_strength(y=z,sr=sr))) if len(z)>1024 else 0
    centroid=float(np.mean(librosa.feature.spectral_centroid(y=z,sr=sr))/(sr/2)) if len(z)>1024 else 0
    zcr=float(np.mean(librosa.feature.zero_crossing_rate(z))) if len(z)>0 else 0
    chroma=librosa.feature.chroma_cqt(y=z,sr=sr) if len(z)>4096 else np.zeros((12,1))
    ce=entropy(np.mean(chroma,axis=1)+1e-8)
    mid=(start+end)/2
    aux=np.array([mid/max(duration,1e-6),(end-start)/max(duration,1e-6),rms,np.tanh(onset/4),centroid,zcr,ce,min(float(tempo or 0),240)/240],np.float32)
    return x,aux

def main():
    ap=argparse.ArgumentParser();ap.add_argument('corpus',type=Path);ap.add_argument('--out-dir',type=Path,default=Path('structure_dataset_v41'));ap.add_argument('--seed',type=int,default=4040);ap.add_argument('--sample-rate',type=int,default=22050);ap.add_argument('--frames',type=int,default=192);ap.add_argument('--n-mels',type=int,default=64);ap.add_argument('--split',default='0.70,0.15,0.15');args=ap.parse_args()
    ratios=tuple(map(float,args.split.split(',')))
    if len(ratios)!=3 or abs(sum(ratios)-1)>1e-6:raise SystemExit('--split must sum to 1')
    audios=[p for p in args.corpus.rglob('*') if p.suffix.lower() in AUDIO_EXTS]
    buckets={k:[] for k in ('train','validation','test')}; skipped=[]
    for audio in audios:
        ann=audio.with_suffix('.sections')
        if not ann.exists():continue
        song_id=str(audio.relative_to(args.corpus).with_suffix(''))
        try:
            y,sr=librosa.load(audio,sr=args.sample_rate,mono=True);duration=len(y)/sr
            truth=parse_sections(ann,duration)
            tempo=float(np.asarray(librosa.beat.beat_track(y=y,sr=sr)[0]).reshape(-1)[0]) if len(y)>sr else 0
            if not truth:raise ValueError('no valid sections')
            split=split_name(song_id,args.seed,ratios)
            for start,end,label in truth:
                x,aux=section_features(y,sr,start,end,duration,tempo,args.n_mels,args.frames)
                buckets[split].append((x,aux,LABELS.index(label),song_id,start,end))
        except Exception as e:skipped.append({'song':song_id,'error':str(e)})
    args.out_dir.mkdir(parents=True,exist_ok=True)
    counts={}
    for split,rows in buckets.items():
        counts[split]=len(rows)
        if rows:
            np.savez_compressed(args.out_dir/f'{split}.npz',x=np.stack([r[0] for r in rows]),aux=np.stack([r[1] for r in rows]),label=np.array([r[2] for r in rows],np.int64),song_id=np.array([r[3] for r in rows]),start=np.array([r[4] for r in rows],np.float32),end=np.array([r[5] for r in rows],np.float32),labels=np.array(LABELS))
        else:np.savez_compressed(args.out_dir/f'{split}.npz',x=np.empty((0,args.frames,args.n_mels),np.float32),aux=np.empty((0,8),np.float32),label=np.empty((0,),np.int64),song_id=np.empty((0,),dtype='<U1'),start=np.empty((0,),np.float32),end=np.empty((0,),np.float32),labels=np.array(LABELS))
    manifest={'schema':'chordsync-structure-dataset-v1','version':41,'seed':args.seed,'split':ratios,'labels':LABELS,'sampleRate':args.sample_rate,'frames':args.frames,'nMels':args.n_mels,'counts':counts,'songsWithAnnotations':len({r[3] for xs in buckets.values() for r in xs}),'skipped':skipped}
    (args.out_dir/'dataset_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    print(json.dumps(manifest,indent=2))
if __name__=='__main__':main()
