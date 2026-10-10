from __future__ import annotations
import argparse, json, hashlib
from pathlib import Path
import numpy as np
import librosa
from structure_model import extract_section_features
from build_structure_dataset import AUDIO_EXTS, parse_sections, split_name

def main():
    ap=argparse.ArgumentParser(description='Build boundary-window dataset from audio + .sections'); ap.add_argument('corpus',type=Path); ap.add_argument('--out-dir',type=Path,default=Path('structure_boundary_dataset_v44')); ap.add_argument('--seed',type=int,default=4242); ap.add_argument('--sample-rate',type=int,default=22050); ap.add_argument('--frames',type=int,default=96); ap.add_argument('--n-mels',type=int,default=64); ap.add_argument('--window-seconds',type=float,default=8.0); ap.add_argument('--negative-ratio',type=float,default=2.0); ap.add_argument('--positive-jitter',type=float,default=.25); ap.add_argument('--negative-margin',type=float,default=2.0); ap.add_argument('--split',default='0.70,0.15,0.15'); args=ap.parse_args()
    ratios=tuple(map(float,args.split.split(','))); rng=np.random.default_rng(args.seed); buckets={k:[] for k in ('train','validation','test')}; skipped=[]
    audios=[p for p in args.corpus.rglob('*') if p.suffix.lower() in AUDIO_EXTS]
    for audio in audios:
        ann=audio.with_suffix('.sections');
        if not ann.exists(): continue
        song_id=str(audio.relative_to(args.corpus).with_suffix(''))
        try:
            y,sr=librosa.load(audio,sr=args.sample_rate,mono=True); duration=len(y)/sr; truth=parse_sections(ann,duration); bounds=[float(r[0]) for r in truth[1:]]
            tempo=float(np.asarray(librosa.beat.beat_track(y=y,sr=sr)[0]).reshape(-1)[0]) if len(y)>sr else 0.; split=split_name(song_id,args.seed,ratios)
            centers=[]
            for b in bounds:
                centers.append((b,1));
                if args.positive_jitter>0:
                    centers.append((max(0,min(duration,b+args.positive_jitter)),1)); centers.append((max(0,min(duration,b-args.positive_jitter)),1))
            target_neg=max(1,int(len(centers)*args.negative_ratio)); attempts=0
            while sum(1 for _,l in centers if l==0)<target_neg and attempts<target_neg*50:
                attempts+=1; c=float(rng.uniform(args.window_seconds/2,max(args.window_seconds/2+1e-3,duration-args.window_seconds/2)))
                if all(abs(c-b)>=args.negative_margin for b in bounds): centers.append((c,0))
            for c,label in centers:
                a=max(0.,c-args.window_seconds/2); b=min(duration,c+args.window_seconds/2); x,aux=extract_section_features(y,sr,a,b,duration,tempo,args.n_mels,args.frames); buckets[split].append((x,aux,label,song_id,c))
        except Exception as e: skipped.append({'song':song_id,'error':str(e)})
    args.out_dir.mkdir(parents=True,exist_ok=True); counts={}
    for split,rows in buckets.items():
        counts[split]=len(rows)
        if rows: np.savez_compressed(args.out_dir/f'{split}.npz',x=np.stack([r[0] for r in rows]),aux=np.stack([r[1] for r in rows]),label=np.array([r[2] for r in rows],np.float32),song_id=np.array([r[3] for r in rows]),center=np.array([r[4] for r in rows],np.float32))
        else: np.savez_compressed(args.out_dir/f'{split}.npz',x=np.empty((0,args.frames,args.n_mels),np.float32),aux=np.empty((0,8),np.float32),label=np.empty((0,),np.float32),song_id=np.empty((0,),dtype='<U1'),center=np.empty((0,),np.float32))
    manifest={'schema':'chordsync-structure-boundary-dataset-v1','version':42,'seed':args.seed,'split':ratios,'sampleRate':args.sample_rate,'frames':args.frames,'nMels':args.n_mels,'windowSeconds':args.window_seconds,'negativeRatio':args.negative_ratio,'positiveJitter':args.positive_jitter,'negativeMargin':args.negative_margin,'counts':counts,'skipped':skipped}
    (args.out_dir/'dataset_manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8'); print(json.dumps(manifest,indent=2))
if __name__=='__main__': main()
