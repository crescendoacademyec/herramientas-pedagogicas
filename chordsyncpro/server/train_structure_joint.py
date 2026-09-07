from __future__ import annotations
import argparse, json, math
from pathlib import Path
from collections import defaultdict
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

class D(Dataset):
    def __init__(self,p:Path):
        z=np.load(p,allow_pickle=False)
        self.x=z['x'].astype(np.float32); self.aux=z['aux'].astype(np.float32)
        self.boundary=z['boundary'].astype(np.float32); self.label=z['label'].astype(np.int64)
        self.labels=[str(x) for x in z['labels'].tolist()]
        self.song_id=np.array(z['song_id']).astype(str) if 'song_id' in z.files else np.array([f'row-{i}' for i in range(len(self.label))])
        self.center=z['center'].astype(np.float32) if 'center' in z.files else np.arange(len(self.label),dtype=np.float32)
    def __len__(self): return len(self.label)
    def __getitem__(self,i): return self.x[i],self.aux[i],self.boundary[i],self.label[i]

class JointStructureTransformer(nn.Module):
    def __init__(self,n_mels,aux_dim,classes,frames,d_model=128,heads=4,layers=4,dropout=.15):
        super().__init__(); self.proj=nn.Sequential(nn.Linear(n_mels,d_model),nn.LayerNorm(d_model),nn.GELU()); self.pos=nn.Parameter(torch.zeros(1,frames,d_model))
        enc=nn.TransformerEncoderLayer(d_model,heads,d_model*4,dropout,activation='gelu',batch_first=True,norm_first=True); self.enc=nn.TransformerEncoder(enc,layers)
        self.gate=nn.Linear(d_model,1); self.aux=nn.Sequential(nn.Linear(aux_dim,48),nn.GELU(),nn.Dropout(dropout),nn.Linear(48,32),nn.GELU())
        shared=d_model+32; self.boundary_head=nn.Sequential(nn.Linear(shared,96),nn.GELU(),nn.Dropout(dropout),nn.Linear(96,1)); self.semantic_head=nn.Sequential(nn.Linear(shared,128),nn.GELU(),nn.Dropout(dropout),nn.Linear(128,classes)); nn.init.trunc_normal_(self.pos,std=.02)
    def forward(self,x,aux):
        h=self.proj(x)+self.pos[:,:x.shape[1]]; h=self.enc(h); w=torch.softmax(self.gate(h).squeeze(-1),-1).unsqueeze(-1); pooled=(h*w).sum(1); z=torch.cat([pooled,self.aux(aux)],-1)
        return self.boundary_head(z), self.semantic_head(z)

def class_weights(y,classes,max_weight=4.):
    c=np.bincount(y,minlength=classes).astype(np.float64); w=np.ones(classes); nz=c>0
    if nz.any():
        target=c[nz].mean(); w[nz]=np.sqrt(target/c[nz]); w=np.clip(w,1/max_weight,max_weight); w/=max(1e-8,w[nz].mean())
    return torch.tensor(w,dtype=torch.float32)

def build_transition_prior(ds:D, alpha=.5, backoff=.18):
    """TRAIN-only semantic section transition prior.

    Consecutive duplicate labels are compressed per song so duration/oversampling does not
    dominate the transition counts. The final matrix is smoothed and backed off toward uniform.
    """
    classes=len(ds.labels); counts=np.zeros((classes,classes),dtype=np.float64); starts=np.zeros(classes,dtype=np.float64); seqs={}
    by_song=defaultdict(list)
    for i,(sid,t,y) in enumerate(zip(ds.song_id,ds.center,ds.label)): by_song[str(sid)].append((float(t),int(y),i))
    for sid,rows in by_song.items():
        rows.sort(key=lambda r:r[0]); compressed=[]
        for _,y,_ in rows:
            if not compressed or compressed[-1]!=y: compressed.append(y)
        if not compressed: continue
        starts[compressed[0]]+=1
        for a,b in zip(compressed[:-1],compressed[1:]): counts[a,b]+=1
        seqs[sid]=compressed
    smoothed=counts+float(alpha)
    probs=smoothed/np.maximum(smoothed.sum(axis=1,keepdims=True),1e-12)
    uniform=np.full_like(probs,1.0/classes)
    probs=(1-float(backoff))*probs+float(backoff)*uniform
    start_probs=(starts+float(alpha)); start_probs/=max(1e-12,start_probs.sum()); start_probs=(1-float(backoff))*start_probs+float(backoff)*(1/classes)
    tops=[]
    for i in range(classes):
        for j in range(classes):
            if counts[i,j]>0: tops.append({'from':ds.labels[i],'to':ds.labels[j],'count':int(counts[i,j]),'probability':float(probs[i,j])})
    tops.sort(key=lambda r:(-r['count'],-r['probability'],r['from'],r['to']))
    return {'schema':'chordsync-structure-section-transitions-v1','version':44,'fitSplit':'train','validationUsedForFit':False,'testUsedForFit':False,'labels':ds.labels,'alpha':float(alpha),'backoff':float(backoff),'songCount':len(seqs),'transitionCount':int(counts.sum()),'counts':counts.tolist(),'probabilities':probs.tolist(),'startProbabilities':start_probs.tolist(),'topTransitions':tops[:40]}, probs, start_probs

def viterbi_semantic(emissions, trans, starts, weight=.28, max_bonus=.35, max_penalty=.45):
    e=np.asarray(emissions,dtype=np.float64); n,k=e.shape
    if n==0:return np.empty((0,),np.int64)
    loge=np.log(np.clip(e,1e-8,1.0)); logt=np.log(np.clip(trans,1e-8,1.0)); baseline=-math.log(max(1,k))
    adj=np.clip(logt-baseline,-float(max_penalty),float(max_bonus))
    dp=np.full((n,k),-1e30,dtype=np.float64); back=np.zeros((n,k),dtype=np.int64)
    dp[0]=loge[0]+0.12*np.log(np.clip(starts,1e-8,1.0))
    for i in range(1,n):
        # When acoustic/semantic head is confident, transition context is intentionally weaker.
        conf=float(np.max(e[i])); uncertainty=max(.18,1-conf)
        w=float(weight)*(0.45+0.85*uncertainty)
        score=dp[i-1][:,None]+w*adj
        back[i]=np.argmax(score,axis=0); dp[i]=loge[i]+score[back[i],np.arange(k)]
    out=np.zeros(n,dtype=np.int64); out[-1]=int(np.argmax(dp[-1]))
    for i in range(n-2,-1,-1): out[i]=back[i+1,out[i+1]]
    return out

def predict_semantic_probs(model,ds:D,device,batch=64):
    loader=DataLoader(ds,batch_size=batch,shuffle=False); probs=[]
    model.eval()
    with torch.no_grad():
        for x,a,_,_ in loader:
            _,sl=model(x.to(device),a.to(device)); probs.append(torch.softmax(sl,-1).cpu().numpy())
    return np.concatenate(probs,axis=0) if probs else np.empty((0,len(ds.labels)),np.float32)

def sequence_metrics(model,ds:D,device,trans,starts,weight=.28,batch=64):
    probs=predict_semantic_probs(model,ds,device,batch); raw=np.argmax(probs,axis=1) if len(probs) else np.empty((0,),np.int64); decoded=np.array(raw,copy=True)
    by_song=defaultdict(list)
    for i,(sid,t) in enumerate(zip(ds.song_id,ds.center)): by_song[str(sid)].append((float(t),i))
    for rows in by_song.values():
        rows.sort(); idx=[i for _,i in rows]; decoded[idx]=viterbi_semantic(probs[idx],trans,starts,weight=weight)
    y=ds.label; raw_acc=float(np.mean(raw==y)) if len(y) else 0.; ctx_acc=float(np.mean(decoded==y)) if len(y) else 0.
    changes_raw=sum(int(a!=b) for rows in by_song.values() for a,b in zip([raw[i] for _,i in sorted(rows)[:-1]],[raw[i] for _,i in sorted(rows)[1:]]))
    changes_ctx=sum(int(a!=b) for rows in by_song.values() for a,b in zip([decoded[i] for _,i in sorted(rows)[:-1]],[decoded[i] for _,i in sorted(rows)[1:]]))
    return {'rawAccuracy':raw_acc,'contextAccuracy':ctx_acc,'deltaAccuracy':ctx_acc-raw_acc,'rawChanges':int(changes_raw),'contextChanges':int(changes_ctx),'songCount':len(by_song)}

def evaluate(model,loader,device,classes,thr=.5):
    model.eval(); tp=fp=fn=tn=0; conf=np.zeros((classes,classes),np.int64)
    with torch.no_grad():
        for x,a,b,y in loader:
            x,a,b,y=x.to(device),a.to(device),b.to(device),y.to(device); bl,sl=model(x,a); bp=torch.sigmoid(bl.squeeze(-1))>=thr; bt=b>=.5
            tp+=int((bp&bt).sum()); fp+=int((bp&~bt).sum()); fn+=int((~bp&bt).sum()); tn+=int((~bp&~bt).sum()); pred=sl.argmax(-1)
            for aa,bb in zip(y.cpu().numpy(),pred.cpu().numpy()): conf[int(aa),int(bb)]+=1
    prec=tp/max(1,tp+fp); rec=tp/max(1,tp+fn); f1=2*prec*rec/max(1e-9,prec+rec); acc_sem=np.trace(conf)/max(1,conf.sum()); recalls=[conf[c,c]/conf[c].sum() for c in range(classes) if conf[c].sum()]
    return {'boundary':{'precision':prec,'recall':rec,'f1':f1,'accuracy':(tp+tn)/max(1,tp+tn+fp+fn),'tp':tp,'fp':fp,'fn':fn,'tn':tn},'semantic':{'accuracy':float(acc_sem),'macroRecall':float(np.mean(recalls)) if recalls else 0.,'confusion':conf.tolist()}}

def main():
    ap=argparse.ArgumentParser(description='Train joint boundary + semantic structure Transformer with TRAIN-only section sequence context')
    ap.add_argument('train_npz',type=Path); ap.add_argument('--val-npz',type=Path,required=True); ap.add_argument('--test-npz',type=Path); ap.add_argument('--out',type=Path,default=Path('models/structure_joint_model.onnx')); ap.add_argument('--epochs',type=int,default=30); ap.add_argument('--batch-size',type=int,default=32); ap.add_argument('--lr',type=float,default=3e-4); ap.add_argument('--d-model',type=int,default=128); ap.add_argument('--layers',type=int,default=4); ap.add_argument('--heads',type=int,default=4); ap.add_argument('--dropout',type=float,default=.15); ap.add_argument('--boundary-loss-weight',type=float,default=.55); ap.add_argument('--semantic-loss-weight',type=float,default=1.0); ap.add_argument('--sequence-context-weight',type=float,default=.28); ap.add_argument('--transition-alpha',type=float,default=.5); ap.add_argument('--transition-backoff',type=float,default=.18); ap.add_argument('--no-sequence-context',action='store_true'); ap.add_argument('--seed',type=int,default=4444); args=ap.parse_args()
    torch.manual_seed(args.seed); np.random.seed(args.seed); tr=D(args.train_npz); va=D(args.val_npz); te=D(args.test_npz) if args.test_npz else None
    if not len(tr) or not len(va): raise SystemExit('TRAIN/VALIDATION vacíos')
    transition_report, trans, starts=build_transition_prior(tr,args.transition_alpha,args.transition_backoff)
    seq_weight=0.0 if args.no_sequence_context else float(args.sequence_context_weight)
    frames,n_mels=tr.x.shape[1:]; aux_dim=tr.aux.shape[1]; classes=len(tr.labels); device=torch.device('cuda' if torch.cuda.is_available() else 'cpu'); model=JointStructureTransformer(n_mels,aux_dim,classes,frames,args.d_model,args.heads,args.layers,args.dropout).to(device)
    pos=float(tr.boundary.sum()); neg=float(len(tr)-pos); pos_weight=torch.tensor([neg/max(1.,pos)],device=device); bce=nn.BCEWithLogitsLoss(pos_weight=pos_weight); ce=nn.CrossEntropyLoss(weight=class_weights(tr.label,classes).to(device),label_smoothing=.02); opt=torch.optim.AdamW(model.parameters(),lr=args.lr,weight_decay=1e-4)
    tl=DataLoader(tr,args.batch_size,shuffle=True); vl=DataLoader(va,args.batch_size); best=-1.; state=None; hist=[]
    for ep in range(1,args.epochs+1):
        model.train(); total=0.; n=0
        for x,a,b,y in tl:
            x,a,b,y=x.to(device),a.to(device),b.to(device),y.to(device); opt.zero_grad(set_to_none=True); bl,sl=model(x,a); lb=bce(bl.squeeze(-1),b); ls=ce(sl,y); loss=args.boundary_loss_weight*lb+args.semantic_loss_weight*ls; loss.backward(); torch.nn.utils.clip_grad_norm_(model.parameters(),1.); opt.step(); total+=float(loss)*len(y); n+=len(y)
        vm=evaluate(model,vl,device,classes); sm=sequence_metrics(model,va,device,trans,starts,weight=seq_weight,batch=args.batch_size)
        # Keep the local neural heads primary; sequence context gets a small validation role.
        joint=.47*vm['boundary']['f1']+.255*vm['semantic']['accuracy']+.205*vm['semantic']['macroRecall']+.07*sm['contextAccuracy']
        vm['semanticSequence']=sm; vm['jointScore']=float(joint)
        hist.append({'epoch':ep,'trainLoss':total/max(1,n),'validation':vm}); print(json.dumps({'epoch':ep,'trainLoss':total/max(1,n),'valJointScore':joint,'valBoundaryF1':vm['boundary']['f1'],'valSemanticAccuracy':vm['semantic']['accuracy'],'valSemanticMacroRecall':vm['semantic']['macroRecall'],'valSequenceAccuracy':sm['contextAccuracy'],'valSequenceDelta':sm['deltaAccuracy']}))
        if joint>best: best=joint; state={k:v.detach().cpu().clone() for k,v in model.state_dict().items()}
    model.load_state_dict(state); model.eval().cpu(); args.out.parent.mkdir(parents=True,exist_ok=True); dx=torch.zeros(1,frames,n_mels); da=torch.zeros(1,aux_dim)
    torch.onnx.export(model,(dx,da),args.out,input_names=['x','aux'],output_names=['boundary_logits','semantic_logits'],dynamic_axes={'x':{0:'batch'},'aux':{0:'batch'},'boundary_logits':{0:'batch'},'semantic_logits':{0:'batch'}},opset_version=17)
    transition_path=Path(str(args.out)+'.section-transitions.json'); transition_path.write_text(json.dumps(transition_report,indent=2),encoding='utf-8')
    test=None
    if te and len(te):
        test=evaluate(model,DataLoader(te,args.batch_size),torch.device('cpu'),classes); test['semanticSequence']=sequence_metrics(model,te,torch.device('cpu'),trans,starts,weight=seq_weight,batch=args.batch_size)
    meta={'schema':'chordsync-structure-joint-model-v3','version':3,'modelName':'ChordSync Joint Structure Transformer v48','architecture':'shared-logmel-transformer+boundary-head+semantic-head+section-sequence-decoder+multimodal-functional-repeat-consensus','labels':tr.labels,'sampleRate':22050,'frames':frames,'nMels':n_mels,'auxDim':aux_dim,'windowSeconds':10.0,'scanHopSeconds':0.75,'boundaryThreshold':0.55,'nmsSeconds':2.0,'minEdgeSeconds':2.0,'boundaryLossWeight':args.boundary_loss_weight,'semanticLossWeight':args.semantic_loss_weight,'sequenceContextWeight':seq_weight,'repeatContextWeight':0.26,'repeatSimilarityThreshold':0.79,'repeatTranspositionInvariant':True,'repeatFunctionalHarmony':True,'repeatHarmonyMode':'local-key-relative-degrees+global-root-shift-fallback-v2','repeatFeatureWeights':{'acoustic':0.28,'harmony':0.18,'functionalHarmony':0.22,'rhythm':0.14,'energy':0.09,'vocalProxy':0.09},'sectionTransitions':transition_path.name,'transitionAlpha':args.transition_alpha,'transitionBackoff':args.transition_backoff,'selectionMetric':'0.47 boundary F1 + 0.255 semantic accuracy + 0.205 semantic macro recall + 0.07 sequence-context accuracy','bestValidationScore':best,'test':test,'seed':args.seed}
    Path(str(args.out)+'.json').write_text(json.dumps(meta,indent=2),encoding='utf-8'); Path(str(args.out)+'.training.json').write_text(json.dumps({'schema':'chordsync-structure-joint-training-v2','history':hist,'bestValidationScore':best,'sectionTransitions':transition_report,'test':test},indent=2),encoding='utf-8'); print(json.dumps({'ok':True,'model':str(args.out),'sectionTransitions':str(transition_path),'bestValidationScore':best,'test':test},indent=2))

if __name__=='__main__': main()
