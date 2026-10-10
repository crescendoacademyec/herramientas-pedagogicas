"""Integrity + imbalance report for ChordSync v30 multi-head NPZ datasets."""
import argparse, json
from pathlib import Path
import numpy as np

HEADS=("root","triad","seventh","extension","bass")


def head_report(y):
    valid=y[y!=-100]
    if not valid.size:
        return {"valid":0,"ignored":int((y==-100).sum()),"classes":{},"imbalanceRatio":None,"entropyNormalized":None,"effectiveClasses":0}
    vals,counts=np.unique(valid,return_counts=True)
    probs=counts/counts.sum()
    entropy=float(-(probs*np.log(np.maximum(probs,1e-12))).sum())
    entropy_norm=float(entropy/np.log(len(vals))) if len(vals)>1 else 1.0
    return {
        "valid":int(valid.size),
        "ignored":int((y==-100).sum()),
        "classes":{str(int(v)):int(c) for v,c in zip(vals,counts)},
        "imbalanceRatio":round(float(counts.max()/max(1,counts.min())),3),
        "entropyNormalized":round(entropy_norm,5),
        "effectiveClasses":round(float(np.exp(entropy)),3),
        "rarestClasses":[{"class":int(v),"count":int(c)} for v,c in sorted(zip(vals,counts),key=lambda z:z[1])[:5]],
        "mostCommonClasses":[{"class":int(v),"count":int(c)} for v,c in sorted(zip(vals,counts),key=lambda z:z[1],reverse=True)[:5]],
    }


def main():
    ap=argparse.ArgumentParser(); ap.add_argument("npz",type=Path); args=ap.parse_args()
    d=np.load(args.npz)
    report={"schema":"chordsync-dataset-inspection-v30","file":str(args.npz),"xShape":list(d["x"].shape),"heads":{}}
    for h in HEADS:
        report["heads"][h]=head_report(d[h])
    if "song_id" in d:
        ids=np.asarray(d["song_id"]).astype(str)
        unique,counts=np.unique(ids,return_counts=True)
        report["songs"]={
            "count":int(len(unique)),
            "chunkImbalanceRatio":round(float(counts.max()/max(1,counts.min())),3) if len(counts) else None,
            "minChunks":int(counts.min()) if len(counts) else 0,
            "medianChunks":float(np.median(counts)) if len(counts) else 0,
            "maxChunks":int(counts.max()) if len(counts) else 0,
        }
    else:
        report["songs"]=None
    print(json.dumps(report,indent=2))
if __name__=="__main__": main()
