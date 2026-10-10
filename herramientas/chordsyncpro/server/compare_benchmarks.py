#!/usr/bin/env python3
import argparse,json
from pathlib import Path

def metric(d,p):
    for x in p.split('.'):
        if not isinstance(d,dict):return None
        d=d.get(x)
    return d if isinstance(d,(int,float)) else None

def main():
    ap=argparse.ArgumentParser();ap.add_argument('baseline');ap.add_argument('candidate');a=ap.parse_args(); b=json.loads(Path(a.baseline).read_text());c=json.loads(Path(a.candidate).read_text())
    paths=['summary.score','metrics.chords.csr','metrics.chords.rootRecall','metrics.chords.boundary.f1','metrics.rhythm.beat.f1','metrics.rhythm.downbeat.f1','metrics.structure.accuracy','metrics.structure.macroF1','metrics.runtime.realtimeFactor']
    print('Metric\tBaseline\tCandidate\tDelta')
    for p in paths:
        x,y=metric(b,p),metric(c,p)
        if x is None and y is None:continue
        delta=(y-x) if x is not None and y is not None else None
        print(f'{p}\t{x if x is not None else "—"}\t{y if y is not None else "—"}\t{delta:+.5f}' if delta is not None else f'{p}\t{x}\t{y}\t—')
if __name__=='__main__':main()
