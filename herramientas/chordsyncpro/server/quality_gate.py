#!/usr/bin/env python3
import argparse,json,sys
from pathlib import Path

def get(d,path):
    for p in path.split('.'):
        if not isinstance(d,dict) or p not in d:return None
        d=d[p]
    return d

def main():
    ap=argparse.ArgumentParser(description='ChordSync v60 quality gate for an end-to-end benchmark report.')
    ap.add_argument('report'); ap.add_argument('--min-score',type=float,default=0.75); ap.add_argument('--min-csr',type=float,default=None); ap.add_argument('--min-boundary-f1',type=float,default=None); ap.add_argument('--max-rtf',type=float,default=None)
    a=ap.parse_args(); d=json.loads(Path(a.report).read_text()); failures=[]
    checks=[('summary.score',a.min_score,lambda v,t:v>=t,'>='),('metrics.chords.csr',a.min_csr,lambda v,t:v>=t,'>='),('metrics.chords.boundary.f1',a.min_boundary_f1,lambda v,t:v>=t,'>='),('metrics.runtime.realtimeFactor',a.max_rtf,lambda v,t:v<=t,'<=')]
    for path,thr,fn,op in checks:
        if thr is None:continue
        v=get(d,path)
        if v is None:failures.append(f'{path}: missing (required {op} {thr})')
        elif not fn(float(v),thr):failures.append(f'{path}: {v} (required {op} {thr})')
    if failures:
        print('QUALITY GATE: FAIL'); [print(' - '+x) for x in failures]; sys.exit(2)
    print('QUALITY GATE: PASS')
if __name__=='__main__':main()
