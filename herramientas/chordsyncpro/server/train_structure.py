from __future__ import annotations

import argparse
import json
from pathlib import Path

import numpy as np
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, Dataset


class NPZDataset(Dataset):
    def __init__(self, path: Path):
        d = np.load(path, allow_pickle=False)
        self.x = d['x'].astype(np.float32)
        self.aux = d['aux'].astype(np.float32)
        self.y = d['label'].astype(np.int64)
        self.labels = [str(x) for x in d['labels'].tolist()] if 'labels' in d else []
    def __len__(self): return len(self.y)
    def __getitem__(self, i): return self.x[i], self.aux[i], self.y[i]


class StructureTransformer(nn.Module):
    def __init__(self, n_mels: int, aux_dim: int, classes: int, frames: int,
                 d_model: int = 128, heads: int = 4, layers: int = 3, dropout: float = 0.15):
        super().__init__()
        self.input_proj = nn.Sequential(nn.Linear(n_mels, d_model), nn.LayerNorm(d_model), nn.GELU())
        self.pos = nn.Parameter(torch.zeros(1, frames, d_model))
        enc = nn.TransformerEncoderLayer(d_model=d_model, nhead=heads, dim_feedforward=d_model*4,
                                         dropout=dropout, activation='gelu', batch_first=True, norm_first=True)
        self.encoder = nn.TransformerEncoder(enc, num_layers=layers)
        self.pool_gate = nn.Linear(d_model, 1)
        self.aux = nn.Sequential(nn.Linear(aux_dim, 48), nn.GELU(), nn.Dropout(dropout), nn.Linear(48, 32), nn.GELU())
        self.head = nn.Sequential(nn.Linear(d_model + 32, 128), nn.GELU(), nn.Dropout(dropout), nn.Linear(128, classes))
        nn.init.trunc_normal_(self.pos, std=0.02)
    def forward(self, x, aux):
        h = self.input_proj(x)
        h = h + self.pos[:, :h.shape[1], :]
        h = self.encoder(h)
        w = torch.softmax(self.pool_gate(h).squeeze(-1), dim=-1).unsqueeze(-1)
        pooled = torch.sum(h * w, dim=1)
        a = self.aux(aux)
        return self.head(torch.cat([pooled, a], dim=-1))


def class_weights(y: np.ndarray, classes: int, max_weight: float = 4.0) -> torch.Tensor:
    counts = np.bincount(y, minlength=classes).astype(np.float64)
    weights = np.ones(classes, np.float64)
    nz = counts > 0
    if nz.any():
        target = counts[nz].mean()
        weights[nz] = np.sqrt(target / counts[nz])
        weights = np.clip(weights, 1/max_weight, max_weight)
        weights /= max(1e-8, weights[nz].mean())
    return torch.tensor(weights, dtype=torch.float32)


def evaluate(model, loader, device, classes):
    model.eval(); correct=0; total=0; conf=np.zeros((classes, classes), np.int64); loss_sum=0.0
    ce = nn.CrossEntropyLoss()
    with torch.no_grad():
        for x, aux, y in loader:
            x,aux,y=x.to(device),aux.to(device),y.to(device)
            logits=model(x,aux); loss_sum += float(ce(logits,y))*len(y)
            p=logits.argmax(-1); correct += int((p==y).sum()); total += len(y)
            for a,b in zip(y.cpu().numpy(),p.cpu().numpy()): conf[int(a),int(b)] += 1
    recalls=[]
    for c in range(classes):
        den=conf[c].sum()
        if den: recalls.append(conf[c,c]/den)
    return {'loss':loss_sum/max(1,total),'accuracy':correct/max(1,total),'macroRecall':float(np.mean(recalls)) if recalls else 0.0,'confusion':conf.tolist()}


def main():
    ap=argparse.ArgumentParser(description='Train ChordSync semantic section classifier')
    ap.add_argument('train_npz', type=Path)
    ap.add_argument('--val-npz', type=Path, required=True)
    ap.add_argument('--test-npz', type=Path)
    ap.add_argument('--out', type=Path, default=Path('models/structure_model.onnx'))
    ap.add_argument('--epochs', type=int, default=35)
    ap.add_argument('--batch-size', type=int, default=24)
    ap.add_argument('--lr', type=float, default=3e-4)
    ap.add_argument('--weight-decay', type=float, default=1e-4)
    ap.add_argument('--d-model', type=int, default=128)
    ap.add_argument('--layers', type=int, default=3)
    ap.add_argument('--heads', type=int, default=4)
    ap.add_argument('--dropout', type=float, default=0.15)
    ap.add_argument('--seed', type=int, default=4141)
    args=ap.parse_args()
    torch.manual_seed(args.seed); np.random.seed(args.seed)
    train=NPZDataset(args.train_npz); val=NPZDataset(args.val_npz); test=NPZDataset(args.test_npz) if args.test_npz else None
    if len(train)==0 or len(val)==0: raise SystemExit('TRAIN y VALIDATION deben contener ejemplos')
    labels=train.labels or ['Intro','Verse','Pre-Chorus','Chorus','Bridge','Solo','Outro']
    classes=len(labels); frames=train.x.shape[1]; n_mels=train.x.shape[2]; aux_dim=train.aux.shape[1]
    if train.x.shape[1:] != val.x.shape[1:] or train.aux.shape[1] != val.aux.shape[1]: raise SystemExit('TRAIN/VALIDATION incompatibles')
    device=torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    model=StructureTransformer(n_mels,aux_dim,classes,frames,args.d_model,args.heads,args.layers,args.dropout).to(device)
    weights=class_weights(train.y,classes).to(device)
    criterion=nn.CrossEntropyLoss(weight=weights,label_smoothing=0.02)
    optim=torch.optim.AdamW(model.parameters(),lr=args.lr,weight_decay=args.weight_decay)
    train_loader=DataLoader(train,batch_size=args.batch_size,shuffle=True,num_workers=0)
    val_loader=DataLoader(val,batch_size=args.batch_size,shuffle=False,num_workers=0)
    best=None; best_state=None; history=[]
    for epoch in range(1,args.epochs+1):
        model.train(); total=0.0;n=0
        for x,aux,y in train_loader:
            x,aux,y=x.to(device),aux.to(device),y.to(device)
            optim.zero_grad(set_to_none=True); logits=model(x,aux); loss=criterion(logits,y); loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(),1.0); optim.step(); total += float(loss)*len(y); n += len(y)
        vm=evaluate(model,val_loader,device,classes)
        score=0.55*vm['accuracy']+0.45*vm['macroRecall']
        row={'epoch':epoch,'trainLoss':total/max(1,n),'validation':vm,'selectionScore':score};history.append(row)
        print(json.dumps({k:v for k,v in row.items() if k!='validation'}|{'valAccuracy':vm['accuracy'],'valMacroRecall':vm['macroRecall']}))
        if best is None or score>best:
            best=score; best_state={k:v.detach().cpu().clone() for k,v in model.state_dict().items()}
    model.load_state_dict(best_state); model.eval().cpu()
    args.out.parent.mkdir(parents=True,exist_ok=True)
    dummy_x=torch.zeros(1,frames,n_mels,dtype=torch.float32);dummy_aux=torch.zeros(1,aux_dim,dtype=torch.float32)
    torch.onnx.export(model,(dummy_x,dummy_aux),args.out,input_names=['x','aux'],output_names=['logits'],dynamic_axes={'x':{0:'batch'},'aux':{0:'batch'},'logits':{0:'batch'}},opset_version=17)
    test_metrics=evaluate(model,DataLoader(test,batch_size=args.batch_size,shuffle=False),torch.device('cpu'),classes) if test and len(test) else None
    meta={'schema':'chordsync-structure-model-v1','version':1,'modelName':'ChordSync Structure Transformer v41','architecture':'logmel-transformer-attention-pooling+aux','labels':labels,'sampleRate':22050,'frames':frames,'nMels':n_mels,'auxDim':aux_dim,'trainExamples':len(train),'validationExamples':len(val),'testExamples':len(test) if test else 0,'selectionMetric':'0.55 accuracy + 0.45 macroRecall','bestValidationScore':best,'classWeights':weights.cpu().tolist(),'test':test_metrics,'seed':args.seed}
    Path(str(args.out)+'.json').write_text(json.dumps(meta,indent=2),encoding='utf-8')
    Path(str(args.out)+'.training.json').write_text(json.dumps({'schema':'chordsync-structure-training-v1','history':history,'bestValidationScore':best,'test':test_metrics},indent=2),encoding='utf-8')
    print(json.dumps({'ok':True,'model':str(args.out),'metadata':str(args.out)+'.json','bestValidationScore':best,'test':test_metrics},indent=2))

if __name__=='__main__': main()
