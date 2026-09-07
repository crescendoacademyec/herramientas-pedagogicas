from __future__ import annotations
import argparse, json
from pathlib import Path
import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset

class D(Dataset):
    def __init__(self,p):
        z=np.load(p,allow_pickle=False); self.x=z['x'].astype(np.float32); self.aux=z['aux'].astype(np.float32); self.y=z['label'].astype(np.float32)
    def __len__(self): return len(self.y)
    def __getitem__(self,i): return self.x[i],self.aux[i],self.y[i]

class BoundaryTransformer(nn.Module):
    def __init__(self,n_mels,aux_dim,frames,d_model=96,heads=4,layers=3,dropout=.15):
        super().__init__(); self.proj=nn.Sequential(nn.Linear(n_mels,d_model),nn.LayerNorm(d_model),nn.GELU()); self.pos=nn.Parameter(torch.zeros(1,frames,d_model))
        enc=nn.TransformerEncoderLayer(d_model,heads,d_model*4,dropout,activation='gelu',batch_first=True,norm_first=True); self.enc=nn.TransformerEncoder(enc,layers)
        self.gate=nn.Linear(d_model,1); self.aux=nn.Sequential(nn.Linear(aux_dim,32),nn.GELU()); self.head=nn.Sequential(nn.Linear(d_model+32,96),nn.GELU(),nn.Dropout(dropout),nn.Linear(96,1)); nn.init.trunc_normal_(self.pos,std=.02)
    def forward(self,x,aux):
        h=self.proj(x)+self.pos[:,:x.shape[1]]; h=self.enc(h); w=torch.softmax(self.gate(h).squeeze(-1),-1).unsqueeze(-1); p=(h*w).sum(1); return self.head(torch.cat([p,self.aux(aux)],-1))

def metrics(model,loader,device,thr=.5):
    model.eval(); tp=fp=fn=tn=0; loss=0.;n=0; ce=nn.BCEWithLogitsLoss()
    with torch.no_grad():
        for x,a,y in loader:
            x,a,y=x.to(device),a.to(device),y.to(device); l=model(x,a).squeeze(-1); loss+=float(ce(l,y))*len(y); n+=len(y); p=(torch.sigmoid(l)>=thr)
            yy=y>=.5; tp+=int((p&yy).sum()); fp+=int((p&~yy).sum()); fn+=int((~p&yy).sum()); tn+=int((~p&~yy).sum())
    prec=tp/max(1,tp+fp); rec=tp/max(1,tp+fn); f1=2*prec*rec/max(1e-9,prec+rec); acc=(tp+tn)/max(1,tp+tn+fp+fn)
    return {'loss':loss/max(1,n),'accuracy':acc,'precision':prec,'recall':rec,'f1':f1,'tp':tp,'fp':fp,'fn':fn,'tn':tn}

def main():
    ap=argparse.ArgumentParser(); ap.add_argument('train_npz',type=Path); ap.add_argument('--val-npz',type=Path,required=True); ap.add_argument('--test-npz',type=Path); ap.add_argument('--out',type=Path,default=Path('models/structure_boundary_model.onnx')); ap.add_argument('--epochs',type=int,default=25); ap.add_argument('--batch-size',type=int,default=32); ap.add_argument('--lr',type=float,default=3e-4); ap.add_argument('--seed',type=int,default=4242); args=ap.parse_args()
    torch.manual_seed(args.seed); np.random.seed(args.seed); tr=D(args.train_npz); va=D(args.val_npz); te=D(args.test_npz) if args.test_npz else None
    if not len(tr) or not len(va): raise SystemExit('TRAIN/VALIDATION vacíos')
    frames,n_mels=tr.x.shape[1:]; aux_dim=tr.aux.shape[1]; device=torch.device('cuda' if torch.cuda.is_available() else 'cpu'); model=BoundaryTransformer(n_mels,aux_dim,frames).to(device)
    pos=float(tr.y.sum()); neg=float(len(tr.y)-pos); pw=torch.tensor([neg/max(1.,pos)],device=device); crit=nn.BCEWithLogitsLoss(pos_weight=pw); opt=torch.optim.AdamW(model.parameters(),lr=args.lr,weight_decay=1e-4)
    tl=DataLoader(tr,args.batch_size,shuffle=True); vl=DataLoader(va,args.batch_size); best=-1; state=None; hist=[]
    for ep in range(1,args.epochs+1):
        model.train(); tot=0.;n=0
        for x,a,y in tl:
            x,a,y=x.to(device),a.to(device),y.to(device); opt.zero_grad(set_to_none=True); l=model(x,a).squeeze(-1); loss=crit(l,y); loss.backward(); torch.nn.utils.clip_grad_norm_(model.parameters(),1.); opt.step(); tot+=float(loss)*len(y); n+=len(y)
        vm=metrics(model,vl,device); hist.append({'epoch':ep,'trainLoss':tot/max(1,n),'validation':vm}); print(json.dumps({'epoch':ep,'trainLoss':tot/max(1,n),'valF1':vm['f1'],'valPrecision':vm['precision'],'valRecall':vm['recall']}))
        if vm['f1']>best: best=vm['f1']; state={k:v.detach().cpu().clone() for k,v in model.state_dict().items()}
    model.load_state_dict(state); model.eval().cpu(); args.out.parent.mkdir(parents=True,exist_ok=True); dx=torch.zeros(1,frames,n_mels); da=torch.zeros(1,aux_dim)
    torch.onnx.export(model,(dx,da),args.out,input_names=['x','aux'],output_names=['logits'],dynamic_axes={'x':{0:'batch'},'aux':{0:'batch'},'logits':{0:'batch'}},opset_version=17)
    test=metrics(model,DataLoader(te,args.batch_size),torch.device('cpu')) if te and len(te) else None
    meta={'schema':'chordsync-structure-boundary-model-v1','version':1,'modelName':'ChordSync Structure Boundary Transformer v44','sampleRate':22050,'frames':frames,'nMels':n_mels,'auxDim':aux_dim,'windowSeconds':8.0,'scanHopSeconds':0.75,'decisionThreshold':0.55,'nmsSeconds':2.0,'minEdgeSeconds':2.0,'bestValidationF1':best,'test':test,'seed':args.seed}
    Path(str(args.out)+'.json').write_text(json.dumps(meta,indent=2),encoding='utf-8'); Path(str(args.out)+'.training.json').write_text(json.dumps({'schema':'chordsync-structure-boundary-training-v1','history':hist,'bestValidationF1':best,'test':test},indent=2),encoding='utf-8')
    print(json.dumps({'ok':True,'model':str(args.out),'bestValidationF1':best,'test':test},indent=2))
if __name__=='__main__': main()
