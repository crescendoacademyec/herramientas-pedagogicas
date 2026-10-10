"""Train/export ChordSync v35 multi-head chord model with imbalance-aware learning and post-hoc calibration.

Input NPZ keys:
  x: float32 [N,T,12] normalized chroma/HPCP
  root, triad, seventh, extension, bass: int64 [N,T]
  optional song_id [N]

v35 keeps the imbalance/calibration protections and adds key-relative functional-harmony context on top of the absolute transition prior:
  0) a smoothed root+triad transition prior is estimated only from TRAIN chord changes;
  1) a differentiable transition-context loss encourages plausible chord-to-chord motion at annotated boundaries;
  2) expected-cost loss keeps harmonically close mistakes cheaper than unrelated-chord mistakes;
  0) expected-cost loss makes harmonically close mistakes cheaper than unrelated-chord mistakes;
  1) class-balanced per-head cross entropy computed from TRAIN only;
  2) rarity/song-aware chunk sampling, also computed from TRAIN only;
  3) ECE/Brier/NLL measurement before/after temperature scaling. TEST is never used to fit temperatures.

Validation is never resampled or class-reweighted for metrics. Unknown/padded labels use -100.
No pretrained weights or datasets are bundled.
"""
from __future__ import annotations

import argparse
import json
import math
import random
from collections import Counter
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset, WeightedRandomSampler

HEAD_ORDER = ["root", "triad", "seventh", "extension", "bass"]
HEAD_SIZES = {"root": 13, "triad": 6, "seventh": 4, "extension": 7, "bass": 13}
HEAD_LABELS = {
    "root": ["N","C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
    "triad": ["major","minor","dim","aug","sus2","sus4"],
    "seventh": ["none","b7","maj7","dim7"],
    "extension": ["none","6","9","add9","11","add11","13"],
    "bass": ["N","C","C#","D","D#","E","F","F#","G","G#","A","A#","B"],
}
DEFAULT_HEAD_LOSS_WEIGHTS = {"root": 1.25, "triad": 1.10, "seventh": 0.95, "extension": 0.90, "bass": 0.85}
# For sample rarity only: advanced/rare structure gets somewhat more attention.
DEFAULT_RARITY_HEAD_WEIGHTS = {"root": 0.55, "triad": 1.00, "seventh": 1.25, "extension": 1.55, "bass": 1.15}

# v35: musically structured expected-cost regularization.
# Values are normalized 0..1 and deliberately encode *severity*, not a replacement label.
# This means Cmaj7 -> C is a smaller error than Cmaj7 -> F#m because root/triad stay intact.
DEFAULT_MUSICAL_HEAD_WEIGHTS = {"root": 1.35, "triad": 1.10, "seventh": 0.75, "extension": 0.55, "bass": 0.70}


def _circular_distance(a: int, b: int, mod: int = 12) -> float:
    d = abs(a - b) % mod
    return min(d, mod - d) / (mod / 2)


def _root_cost_matrix() -> np.ndarray:
    m = np.zeros((13, 13), dtype=np.float32)
    for a in range(13):
        for b in range(13):
            if a == b:
                continue
            if a == 0 or b == 0:  # N vs pitched root/bass
                m[a, b] = 0.85
                continue
            pa, pb = a - 1, b - 1
            semitone = _circular_distance(pa, pb)
            fifth_step = (7 * (pb - pa)) % 12
            fifth = min(fifth_step, 12 - fifth_step) / 6.0
            # Fifth proximity captures functional/harmonic closeness, semitone distance avoids odd aliases.
            m[a, b] = float(min(1.0, 0.65 * fifth + 0.35 * semitone))
    return m


def _triad_cost_matrix() -> np.ndarray:
    # major, minor, dim, aug, sus2, sus4
    m = np.array([
        [0.00,0.30,0.55,0.55,0.28,0.25],
        [0.30,0.00,0.45,0.65,0.32,0.32],
        [0.55,0.45,0.00,0.75,0.55,0.55],
        [0.55,0.65,0.75,0.00,0.60,0.60],
        [0.28,0.32,0.55,0.60,0.00,0.22],
        [0.25,0.32,0.55,0.60,0.22,0.00],
    ], dtype=np.float32)
    return m


def _seventh_cost_matrix() -> np.ndarray:
    # none, b7, maj7, dim7
    return np.array([
        [0.00,0.34,0.34,0.52],
        [0.34,0.00,0.24,0.34],
        [0.34,0.24,0.00,0.44],
        [0.52,0.34,0.44,0.00],
    ], dtype=np.float32)


def _extension_cost_matrix() -> np.ndarray:
    # none, 6, 9, add9, 11, add11, 13
    return np.array([
        [0.00,0.24,0.34,0.27,0.50,0.40,0.60],
        [0.24,0.00,0.26,0.25,0.42,0.38,0.28],
        [0.34,0.26,0.00,0.14,0.24,0.26,0.28],
        [0.27,0.25,0.14,0.00,0.28,0.20,0.34],
        [0.50,0.42,0.24,0.28,0.00,0.14,0.22],
        [0.40,0.38,0.26,0.20,0.14,0.00,0.26],
        [0.60,0.28,0.28,0.34,0.22,0.26,0.00],
    ], dtype=np.float32)


MUSICAL_COST_MATRICES = {
    "root": _root_cost_matrix(),
    "triad": _triad_cost_matrix(),
    "seventh": _seventh_cost_matrix(),
    "extension": _extension_cost_matrix(),
    "bass": _root_cost_matrix(),
}


def musical_expected_cost(logits: torch.Tensor, targets: torch.Tensor, head: str) -> torch.Tensor:
    """Differentiable expected musical distance E[cost(y, class)] over valid frames."""
    flat_logits = logits.reshape(-1, logits.shape[-1])
    flat_targets = targets.reshape(-1)
    valid = flat_targets != -100
    if not valid.any():
        return flat_logits.sum() * 0.0
    probs = torch.softmax(flat_logits[valid], dim=-1)
    matrix = torch.as_tensor(MUSICAL_COST_MATRICES[head], device=logits.device, dtype=probs.dtype)
    row_costs = matrix[flat_targets[valid]]
    return (probs * row_costs).sum(dim=-1).mean()




COARSE_TRIAD_COUNT = HEAD_SIZES["triad"]
COARSE_STATE_COUNT = 12 * COARSE_TRIAD_COUNT


def coarse_state_tensor(root: torch.Tensor, triad: torch.Tensor) -> torch.Tensor:
    """Map pitched root + triad to 0..71. Invalid/N/padding -> -100."""
    out = torch.full_like(root, -100)
    valid = (root >= 1) & (root <= 12) & (triad >= 0) & (triad < COARSE_TRIAD_COUNT)
    out[valid] = (root[valid] - 1) * COARSE_TRIAD_COUNT + triad[valid]
    return out


def coarse_state_name(state: int) -> str:
    if state < 0 or state >= COARSE_STATE_COUNT:
        return "N"
    root_i = state // COARSE_TRIAD_COUNT + 1
    triad_i = state % COARSE_TRIAD_COUNT
    return f"{HEAD_LABELS['root'][root_i]}:{HEAD_LABELS['triad'][triad_i]}"


def transition_prior_from_dataset(dataset: NPZChordDataset, alpha: float = 0.5, backoff: float = 0.20):
    """Estimate a coarse root+triad boundary-transition prior from TRAIN only.

    Repeated same-chord frames are deliberately excluded so the matrix models harmonic motion,
    not duration/self-transition. `alpha` is additive smoothing and `backoff` mixes a global
    next-chord distribution to avoid brittle zero-probability transitions.
    """
    counts = np.zeros((COARSE_STATE_COUNT, COARSE_STATE_COUNT), dtype=np.float64)
    next_counts = np.zeros(COARSE_STATE_COUNT, dtype=np.float64)
    transitions = 0
    for i in range(len(dataset)):
        r = dataset.y["root"][i].numpy()
        q = dataset.y["triad"][i].numpy()
        valid = (r >= 1) & (r <= 12) & (q >= 0) & (q < COARSE_TRIAD_COUNT)
        st = np.full(r.shape, -100, dtype=np.int64)
        st[valid] = (r[valid] - 1) * COARSE_TRIAD_COUNT + q[valid]
        if len(st) < 2:
            continue
        a, b = st[:-1], st[1:]
        m = (a >= 0) & (b >= 0) & (a != b)
        for x, y in zip(a[m], b[m]):
            counts[x, y] += 1.0
            next_counts[y] += 1.0
            transitions += 1
    alpha = max(1e-6, float(alpha))
    backoff = float(np.clip(backoff, 0.0, 0.9))
    row = counts + alpha
    row /= np.maximum(1e-12, row.sum(axis=1, keepdims=True))
    global_next = next_counts + alpha
    global_next /= max(1e-12, global_next.sum())
    prior = (1.0 - backoff) * row + backoff * global_next[None, :]
    prior /= np.maximum(1e-12, prior.sum(axis=1, keepdims=True))
    return prior.astype(np.float32), counts.astype(np.int64), int(transitions)


def transition_context_loss(root_logits: torch.Tensor, triad_logits: torch.Tensor,
                            root_targets: torch.Tensor, triad_targets: torch.Tensor,
                            transition_prior: torch.Tensor) -> torch.Tensor:
    """Differentiable -log expected TRAIN transition probability at true chord-change boundaries."""
    if root_logits.shape[1] < 2:
        return root_logits.sum() * 0.0
    pr = torch.softmax(root_logits, -1)[..., 1:13]
    pq = torch.softmax(triad_logits, -1)
    joint = (pr.unsqueeze(-1) * pq.unsqueeze(-2)).reshape(pr.shape[0], pr.shape[1], -1)
    target_states = coarse_state_tensor(root_targets, triad_targets)
    prev_t, next_t = target_states[:, :-1], target_states[:, 1:]
    mask = (prev_t >= 0) & (next_t >= 0) & (prev_t != next_t)
    if not mask.any():
        return joint.sum() * 0.0
    prev_p = joint[:, :-1, :]
    next_p = joint[:, 1:, :]
    # Expected transition probability sum_i,j p(i,t-1) P_train(j|i) p(j,t).
    compat = torch.einsum('bti,ij,btj->bt', prev_p, transition_prior, next_p)
    return (-torch.log(torch.clamp(compat[mask], min=1e-8))).mean()


def transition_metrics_from_batch(root_logits, triad_logits, root_targets, triad_targets, prior_np=None):
    pred_root = root_logits.argmax(-1)
    pred_triad = triad_logits.argmax(-1)
    true_state = coarse_state_tensor(root_targets, triad_targets)
    pred_state = coarse_state_tensor(pred_root, pred_triad)
    a, b = true_state[:, :-1], true_state[:, 1:]
    pa, pb = pred_state[:, :-1], pred_state[:, 1:]
    mask = (a >= 0) & (b >= 0) & (a != b)
    n = int(mask.sum().item())
    if n == 0:
        return 0, 0, 0.0
    pair_ok = ((pa == a) & (pb == b) & mask).sum().item()
    nll = 0.0
    if prior_np is not None:
        pp = pa[mask].detach().cpu().numpy()
        pn = pb[mask].detach().cpu().numpy()
        valid = (pp >= 0) & (pn >= 0)
        if valid.any():
            probs = np.clip(prior_np[pp[valid], pn[valid]], 1e-8, 1.0)
            nll = float(-np.log(probs).sum())
    return n, int(pair_ok), nll


def transition_report(prior: np.ndarray, counts: np.ndarray, transitions: int, alpha: float, backoff: float, top_k: int = 40):
    flat = []
    nz = np.argwhere(counts > 0)
    for i, j in nz:
        flat.append((int(counts[i, j]), float(prior[i, j]), int(i), int(j)))
    flat.sort(reverse=True)
    return {
        "schema": "chordsync-harmonic-transition-prior-v1",
        "fitSplit": "train",
        "validationUsedForFit": False,
        "testUsedForFit": False,
        "stateSpace": "12-roots-x-6-triads",
        "stateCount": COARSE_STATE_COUNT,
        "observedBoundaryTransitions": int(transitions),
        "smoothingAlpha": float(alpha),
        "backoff": float(backoff),
        "topTransitions": [
            {"from": coarse_state_name(i), "to": coarse_state_name(j), "count": c, "probability": round(p, 8)}
            for c, p, i, j in flat[:top_k]
        ],
        "probabilities": np.asarray(prior, dtype=np.float32).round(8).tolist(),
    }


FUNCTIONAL_STATE_COUNT = COARSE_STATE_COUNT


def _estimate_key_numpy(root: np.ndarray, triad: np.ndarray):
    """Estimate tonic/mode from annotated root+triad frames. Returns root 1..12, mode 0/1."""
    major_q = [0,1,1,0,0,1,2]
    minor_q = [1,2,0,1,1,0,0]
    degrees = [0,2,4,5,7,9,11]
    valid = (root >= 1) & (root <= 12) & (triad >= 0) & (triad < COARSE_TRIAD_COUNT)
    if not valid.any():
        return 1, 0
    rr = root[valid] - 1
    qq = triad[valid]
    best = None
    for tonic in range(12):
        for mode, quals in ((0, major_q),(1, minor_q)):
            score = 0.0; tonic_hits = 0.0
            for r,q in zip(rr,qq):
                rel = int((r-tonic) % 12)
                if rel in degrees:
                    di = degrees.index(rel)
                    score += 1.0 if int(q) == quals[di] else 0.28
                    if rel == 0:
                        tonic_hits += 1.0 if int(q) == quals[0] else 0.2
                else:
                    score -= 0.10
            score += 0.18 * tonic_hits
            cand = (score, tonic_hits, -mode, tonic+1, mode)
            if best is None or cand > best:
                best = cand
    return int(best[3]), int(best[4])


def dataset_keys(dataset: NPZChordDataset):
    """Use v35 key metadata when present; otherwise estimate key from each chunk's annotations."""
    roots = np.asarray(dataset.key_root, dtype=np.int64).copy()
    modes = np.asarray(dataset.key_mode, dtype=np.int64).copy()
    for i in range(len(dataset)):
        if not (1 <= roots[i] <= 12 and modes[i] in (0,1)):
            roots[i], modes[i] = _estimate_key_numpy(dataset.y['root'][i].numpy(), dataset.y['triad'][i].numpy())
    return roots, modes


def functional_state_numpy(root: np.ndarray, triad: np.ndarray, key_root: int):
    st = np.full(root.shape, -100, dtype=np.int64)
    valid = (root >= 1) & (root <= 12) & (triad >= 0) & (triad < COARSE_TRIAD_COUNT)
    degree = ((root[valid] - key_root) % 12).astype(np.int64)
    st[valid] = degree * COARSE_TRIAD_COUNT + triad[valid]
    return st


def functional_state_name(state: int):
    if state < 0 or state >= FUNCTIONAL_STATE_COUNT:
        return 'N'
    degree = state // COARSE_TRIAD_COUNT
    triad_i = state % COARSE_TRIAD_COUNT
    degree_names = ['I','bII','II','bIII','III','IV','#IV/bV','V','bVI','VI','bVII','VII']
    return f"{degree_names[degree]}:{HEAD_LABELS['triad'][triad_i]}"


def functional_transition_prior_from_dataset(dataset: NPZChordDataset, alpha: float = 0.5, backoff: float = 0.20):
    """TRAIN-only transition priors in key-relative degree+triad space, conditioned on major/minor mode."""
    counts = np.zeros((2, FUNCTIONAL_STATE_COUNT, FUNCTIONAL_STATE_COUNT), dtype=np.float64)
    next_counts = np.zeros((2, FUNCTIONAL_STATE_COUNT), dtype=np.float64)
    transitions = np.zeros(2, dtype=np.int64)
    keys, modes = dataset_keys(dataset)
    for i in range(len(dataset)):
        mode = int(modes[i]); key_root = int(keys[i])
        if mode not in (0,1) or not (1 <= key_root <= 12):
            continue
        r = dataset.y['root'][i].numpy(); q = dataset.y['triad'][i].numpy()
        st = functional_state_numpy(r, q, key_root)
        a,b = st[:-1], st[1:]
        m = (a >= 0) & (b >= 0) & (a != b)
        for x,y in zip(a[m], b[m]):
            counts[mode,x,y] += 1.0; next_counts[mode,y] += 1.0; transitions[mode] += 1
    alpha=max(1e-6,float(alpha)); backoff=float(np.clip(backoff,0.0,0.9))
    priors=np.zeros_like(counts,dtype=np.float64)
    for mode in (0,1):
        row=counts[mode]+alpha; row/=np.maximum(1e-12,row.sum(axis=1,keepdims=True))
        glob=next_counts[mode]+alpha; glob/=max(1e-12,glob.sum())
        priors[mode]=(1-backoff)*row+backoff*glob[None,:]
        priors[mode]/=np.maximum(1e-12,priors[mode].sum(axis=1,keepdims=True))
    return priors.astype(np.float32), counts.astype(np.int64), transitions


def _batch_key_estimates(root_targets: torch.Tensor, triad_targets: torch.Tensor):
    roots=[]; modes=[]
    for b in range(root_targets.shape[0]):
        kr,km=_estimate_key_numpy(root_targets[b].detach().cpu().numpy(), triad_targets[b].detach().cpu().numpy())
        roots.append(kr); modes.append(km)
    return roots,modes


def functional_transition_context_loss(root_logits, triad_logits, root_targets, triad_targets, functional_prior):
    """Differentiable key-invariant harmonic transition loss at true chord boundaries."""
    if root_logits.shape[1] < 2:
        return root_logits.sum()*0.0
    pr_abs=torch.softmax(root_logits,-1)[...,1:13]
    pq=torch.softmax(triad_logits,-1)
    keys,modes=_batch_key_estimates(root_targets,triad_targets)
    losses=[]
    for b,(kr,mode) in enumerate(zip(keys,modes)):
        tonic=kr-1
        order=[(tonic+d)%12 for d in range(12)]
        pr_rel=pr_abs[b,:,order]
        joint=(pr_rel.unsqueeze(-1)*pq[b].unsqueeze(-2)).reshape(pr_rel.shape[0],-1)
        rt=root_targets[b].detach().cpu().numpy(); qt=triad_targets[b].detach().cpu().numpy()
        st=torch.as_tensor(functional_state_numpy(rt,qt,kr),device=root_logits.device)
        a,bb=st[:-1],st[1:]
        mask=(a>=0)&(bb>=0)&(a!=bb)
        if not mask.any():
            continue
        prev=joint[:-1]; nxt=joint[1:]
        prior=functional_prior[mode]
        compat=torch.einsum('ti,ij,tj->t',prev,prior,nxt)
        losses.append((-torch.log(torch.clamp(compat[mask],min=1e-8))).mean())
    return torch.stack(losses).mean() if losses else root_logits.sum()*0.0


def functional_transition_metrics_from_batch(root_logits,triad_logits,root_targets,triad_targets,prior_np=None):
    pred_r=root_logits.argmax(-1).detach().cpu().numpy(); pred_q=triad_logits.argmax(-1).detach().cpu().numpy()
    true_r=root_targets.detach().cpu().numpy(); true_q=triad_targets.detach().cpu().numpy()
    total=correct=0; nll=0.0
    for b in range(true_r.shape[0]):
        kr,mode=_estimate_key_numpy(true_r[b],true_q[b])
        ts=functional_state_numpy(true_r[b],true_q[b],kr); ps=functional_state_numpy(pred_r[b],pred_q[b],kr)
        a,bb=ts[:-1],ts[1:]; pa,pb=ps[:-1],ps[1:]
        mask=(a>=0)&(bb>=0)&(a!=bb)
        total+=int(mask.sum())
        correct+=int(((pa==a)&(pb==bb)&mask).sum())
        if prior_np is not None and mask.any():
            valid=(pa[mask]>=0)&(pb[mask]>=0)
            if valid.any():
                probs=np.clip(prior_np[mode,pa[mask][valid],pb[mask][valid]],1e-8,1.0)
                nll+=float(-np.log(probs).sum())
    return total,correct,nll


def functional_transition_report(prior, counts, transitions, alpha, backoff, top_k=50):
    modes=['major','minor']; top={}
    for mode in (0,1):
        flat=[]
        for i,j in np.argwhere(counts[mode]>0):
            flat.append((int(counts[mode,i,j]),float(prior[mode,i,j]),int(i),int(j)))
        flat.sort(reverse=True)
        top[modes[mode]]=[{'from':functional_state_name(i),'to':functional_state_name(j),'count':c,'probability':round(p,8)} for c,p,i,j in flat[:top_k]]
    return {
        'schema':'chordsync-functional-harmony-prior-v1','fitSplit':'train','validationUsedForFit':False,'testUsedForFit':False,
        'stateSpace':'key-relative-12-degrees-x-6-triads','conditionedByMode':['major','minor'],'stateCount':FUNCTIONAL_STATE_COUNT,
        'observedBoundaryTransitions':{'major':int(transitions[0]),'minor':int(transitions[1])},
        'smoothingAlpha':float(alpha),'backoff':float(backoff),'topTransitions':top,
        'probabilities':np.asarray(prior,dtype=np.float32).round(8).tolist()
    }

def parse_named_weights(text: str, defaults: dict[str, float]) -> dict[str, float]:
    out = dict(defaults)
    if not text:
        return out
    for item in text.split(','):
        if not item.strip():
            continue
        k, sep, v = item.partition('=')
        if not sep or k.strip() not in out:
            raise ValueError(f"invalid head weight: {item}")
        out[k.strip()] = float(v)
    return out


class NPZChordDataset(Dataset):
    def __init__(self, path: str | Path):
        d = np.load(path)
        self.x = torch.as_tensor(np.asarray(d["x"], dtype=np.float32))
        self.y = {h: torch.as_tensor(np.asarray(d[h], dtype=np.int64)) for h in HEAD_ORDER}
        self.song_ids = np.asarray(d["song_id"]).astype(str) if "song_id" in d else np.asarray(["unknown"] * len(self.x))
        self.key_root = np.asarray(d["key_root"], dtype=np.int64) if "key_root" in d else np.zeros(len(self.x), dtype=np.int64)
        self.key_mode = np.asarray(d["key_mode"], dtype=np.int64) if "key_mode" in d else np.full(len(self.x), -1, dtype=np.int64)
        if len(self.x) != len(self.song_ids):
            raise ValueError("song_id length does not match x")

    def __len__(self):
        return len(self.x)

    def __getitem__(self, i):
        return (self.x[i],) + tuple(self.y[h][i] for h in HEAD_ORDER)


class MultiHeadChordNet(nn.Module):
    def __init__(self, d_model=128, nhead=4, layers=4, dropout=0.1):
        super().__init__()
        self.in_proj = nn.Sequential(nn.Linear(12, d_model), nn.LayerNorm(d_model), nn.GELU())
        enc = nn.TransformerEncoderLayer(
            d_model=d_model, nhead=nhead, dim_feedforward=d_model * 4,
            dropout=dropout, batch_first=True, norm_first=True, activation="gelu"
        )
        self.encoder = nn.TransformerEncoder(enc, num_layers=layers)
        self.heads = nn.ModuleDict({k: nn.Linear(d_model, v) for k, v in HEAD_SIZES.items()})

    def forward(self, chroma):
        z = self.encoder(self.in_proj(chroma))
        return tuple(self.heads[k](z) for k in HEAD_ORDER)


def set_seed(seed: int):
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed_all(seed)


def class_counts(dataset: NPZChordDataset):
    counts = {}
    for h in HEAD_ORDER:
        y = dataset.y[h].numpy().reshape(-1)
        y = y[y != -100]
        counts[h] = np.bincount(y, minlength=HEAD_SIZES[h]).astype(np.int64)
    return counts


def make_class_weights(counts: np.ndarray, mode: str, cap: float, beta: float):
    counts = np.asarray(counts, dtype=np.float64)
    observed = counts > 0
    w = np.zeros_like(counts, dtype=np.float64)
    if not observed.any():
        return w.astype(np.float32)
    if mode == "none":
        w[observed] = 1.0
    elif mode == "inverse-sqrt":
        w[observed] = 1.0 / np.sqrt(counts[observed])
    elif mode == "effective":
        # Cui et al.-style effective number. A moderate beta is safer than raw inverse frequency.
        w[observed] = (1.0 - beta) / np.maximum(1e-12, 1.0 - np.power(beta, counts[observed]))
    else:
        raise ValueError(f"unknown class weighting mode: {mode}")
    w[observed] /= max(1e-12, w[observed].mean())
    w[observed] = np.clip(w[observed], 1.0 / max(1.0, cap), max(1.0, cap))
    w[observed] /= max(1e-12, w[observed].mean())
    return w.astype(np.float32)


def build_class_weights(counts_by_head, mode: str, cap: float, beta: float):
    return {h: make_class_weights(counts_by_head[h], mode, cap, beta) for h in HEAD_ORDER}


def chunk_rarity_scores(dataset: NPZChordDataset, class_weights, strength: float, cap: float, song_balance: float):
    """Return one deterministic sampling weight per chunk.

    The score is based on *mean valid-frame rarity* for each head, so one isolated exotic
    label does not make a chunk dominate. Song balancing tempers long-song/augmentation
    dominance. All factors are capped.
    """
    n = len(dataset)
    if n == 0:
        return np.empty((0,), np.float64)
    song_counts = Counter(dataset.song_ids.tolist())
    median_song_chunks = float(np.median(list(song_counts.values()))) if song_counts else 1.0
    scores = np.ones(n, dtype=np.float64)
    rw_sum = sum(DEFAULT_RARITY_HEAD_WEIGHTS.values())

    for i in range(n):
        head_score = 0.0
        for h in HEAD_ORDER:
            y = dataset.y[h][i].numpy()
            valid = y != -100
            if not valid.any():
                rarity = 1.0
            else:
                rarity = float(np.mean(class_weights[h][y[valid]]))
                if not np.isfinite(rarity) or rarity <= 0:
                    rarity = 1.0
            head_score += DEFAULT_RARITY_HEAD_WEIGHTS[h] * rarity
        head_score /= rw_sum
        # Blend toward uniform sampling instead of replacing it entirely.
        score = (1.0 - strength) + strength * head_score
        if song_balance > 0:
            count = max(1, song_counts[str(dataset.song_ids[i])])
            song_factor = math.sqrt(median_song_chunks / count)
            score *= (1.0 - song_balance) + song_balance * song_factor
        scores[i] = np.clip(score, 1.0 / max(1.0, cap), max(1.0, cap))

    # Keep expected epoch size/scale intuitive.
    scores /= max(1e-12, scores.mean())
    return scores


def make_train_loader(dataset, batch, sampling, sample_weights, seed, workers=0):
    if sampling == "rare-chord" and len(dataset):
        gen = torch.Generator()
        gen.manual_seed(seed)
        sampler = WeightedRandomSampler(
            weights=torch.as_tensor(sample_weights, dtype=torch.double),
            num_samples=len(dataset), replacement=True, generator=gen
        )
        return DataLoader(dataset, batch_size=batch, sampler=sampler, num_workers=workers)
    gen = torch.Generator()
    gen.manual_seed(seed)
    return DataLoader(dataset, batch_size=batch, shuffle=True, generator=gen, num_workers=workers)


def evaluate(model, loader, device, transition_prior_np=None, functional_prior_np=None):
    model.eval()
    correct = {k: 0 for k in HEAD_ORDER}
    total = {k: 0 for k in HEAD_ORDER}
    confusion = {k: np.zeros((HEAD_SIZES[k], HEAD_SIZES[k]), np.int64) for k in HEAD_ORDER}
    musical_cost_sum = {k: 0.0 for k in HEAD_ORDER}
    transition_total = 0
    transition_pair_correct = 0
    transition_prior_nll_sum = 0.0
    functional_total = 0
    functional_pair_correct = 0
    functional_prior_nll_sum = 0.0
    with torch.no_grad():
        for batch in loader:
            x, *ys = [t.to(device) for t in batch]
            outs = model(x)
            ntr, ctr, nlltr = transition_metrics_from_batch(outs[0], outs[1], ys[0], ys[1], transition_prior_np)
            transition_total += ntr
            transition_pair_correct += ctr
            transition_prior_nll_sum += nlltr
            nf, cf, nllf = functional_transition_metrics_from_batch(outs[0], outs[1], ys[0], ys[1], functional_prior_np)
            functional_total += nf
            functional_pair_correct += cf
            functional_prior_nll_sum += nllf
            for k, out, y in zip(HEAD_ORDER, outs, ys):
                pred = out.argmax(-1)
                mask = y != -100
                count = mask.sum().item()
                total[k] += count
                if mask.any():
                    correct[k] += ((pred == y) & mask).sum().item()
                    yt = y[mask].detach().cpu().numpy()
                    yp = pred[mask].detach().cpu().numpy()
                    np.add.at(confusion[k], (yt, yp), 1)
                    musical_cost_sum[k] += float(MUSICAL_COST_MATRICES[k][yt, yp].sum())
    acc = {k: correct[k] / max(1, total[k]) for k in HEAD_ORDER}
    macro = {}
    hard_cost = {}
    for k in HEAD_ORDER:
        cm = confusion[k]
        support = cm.sum(axis=1)
        per_class = np.divide(np.diag(cm), support, out=np.zeros_like(support, dtype=float), where=support > 0)
        present = support > 0
        macro[k] = float(per_class[present].mean()) if present.any() else 0.0
        hard_cost[k] = musical_cost_sum[k] / max(1, total[k])
    weight_sum = sum(DEFAULT_MUSICAL_HEAD_WEIGHTS.values())
    aggregate_cost = sum(DEFAULT_MUSICAL_HEAD_WEIGHTS[h] * hard_cost[h] for h in HEAD_ORDER) / weight_sum
    return {
        "accuracy": acc, "macroRecall": macro, "musicalCost": hard_cost,
        "aggregateMusicalCost": float(aggregate_cost),
        "transitionBoundaryCount": int(transition_total),
        "transitionBoundaryAccuracy": float(transition_pair_correct / max(1, transition_total)),
        "transitionPriorNLL": float(transition_prior_nll_sum / max(1, transition_total)) if transition_prior_np is not None else None,
        "functionalBoundaryCount": int(functional_total),
        "functionalBoundaryAccuracy": float(functional_pair_correct / max(1, functional_total)),
        "functionalPriorNLL": float(functional_prior_nll_sum / max(1, functional_total)) if functional_prior_np is not None else None,
    }



def collect_logits_targets(model, loader, device):
    """Collect unweighted validation/test logits for calibration diagnostics."""
    if loader is None:
        return None
    model.eval()
    logits = {h: [] for h in HEAD_ORDER}
    targets = {h: [] for h in HEAD_ORDER}
    with torch.no_grad():
        for batch in loader:
            x, *ys = [t.to(device) for t in batch]
            outs = model(x)
            for h, out, y in zip(HEAD_ORDER, outs, ys):
                out = out.reshape(-1, out.shape[-1])
                y = y.reshape(-1)
                mask = y != -100
                if mask.any():
                    logits[h].append(out[mask].detach().cpu())
                    targets[h].append(y[mask].detach().cpu())
    packed = {}
    for h in HEAD_ORDER:
        if logits[h]:
            packed[h] = (torch.cat(logits[h], 0), torch.cat(targets[h], 0))
        else:
            packed[h] = (torch.empty((0, HEAD_SIZES[h])), torch.empty((0,), dtype=torch.long))
    return packed


def fit_temperature(logits, targets, min_temp=0.25, max_temp=8.0, steps=80):
    """Fit one scalar temperature by NLL. Optimization is deterministic and validation-only."""
    if logits.numel() == 0 or targets.numel() == 0:
        return 1.0
    logits = logits.float()
    targets = targets.long()
    log_t = torch.zeros(1, requires_grad=True)
    opt = torch.optim.LBFGS([log_t], lr=0.15, max_iter=steps, line_search_fn='strong_wolfe')
    lo, hi = math.log(min_temp), math.log(max_temp)
    def closure():
        opt.zero_grad()
        clamped = torch.clamp(log_t, lo, hi)
        loss = nn.functional.cross_entropy(logits / torch.exp(clamped), targets)
        loss.backward()
        return loss
    try:
        opt.step(closure)
        value = float(torch.exp(torch.clamp(log_t.detach(), lo, hi)).item())
    except Exception:
        value = 1.0
    return float(np.clip(value, min_temp, max_temp))


def calibration_metrics(logits, targets, temperature=1.0, bins=15):
    if logits.numel() == 0 or targets.numel() == 0:
        return {"n": 0, "temperature": float(temperature), "accuracy": None, "meanConfidence": None, "nll": None, "brier": None, "ece": None}
    z = logits.float() / max(1e-6, float(temperature))
    probs = torch.softmax(z, -1)
    conf, pred = probs.max(-1)
    correct = pred.eq(targets)
    nll = nn.functional.cross_entropy(z, targets).item()
    onehot = nn.functional.one_hot(targets, num_classes=probs.shape[-1]).float()
    brier = torch.sum((probs - onehot) ** 2, dim=-1).mean().item()
    ece = 0.0
    edges = torch.linspace(0, 1, bins + 1)
    for i in range(bins):
        if i == bins - 1:
            mask = (conf >= edges[i]) & (conf <= edges[i + 1])
        else:
            mask = (conf >= edges[i]) & (conf < edges[i + 1])
        if mask.any():
            frac = mask.float().mean().item()
            gap = abs(conf[mask].mean().item() - correct[mask].float().mean().item())
            ece += frac * gap
    return {
        "n": int(targets.numel()),
        "temperature": round(float(temperature), 6),
        "accuracy": round(float(correct.float().mean().item()), 6),
        "meanConfidence": round(float(conf.mean().item()), 6),
        "nll": round(float(nll), 6),
        "brier": round(float(brier), 6),
        "ece": round(float(ece), 6),
    }


def build_calibration_report(model, val_loader, test_loader, device, bins=15, min_temp=0.25, max_temp=8.0):
    val = collect_logits_targets(model, val_loader, device)
    if val is None:
        return None
    temperatures = {}
    heads = {}
    for h in HEAD_ORDER:
        logits, targets = val[h]
        t = fit_temperature(logits, targets, min_temp=min_temp, max_temp=max_temp)
        temperatures[h] = t
        heads[h] = {
            "temperature": round(t, 6),
            "validation": {
                "before": calibration_metrics(logits, targets, 1.0, bins),
                "after": calibration_metrics(logits, targets, t, bins),
            },
        }
    test = collect_logits_targets(model, test_loader, device) if test_loader else None
    if test is not None:
        for h in HEAD_ORDER:
            logits, targets = test[h]
            heads[h]["test"] = {
                "before": calibration_metrics(logits, targets, 1.0, bins),
                "after": calibration_metrics(logits, targets, temperatures[h], bins),
            }
    return {
        "schema": "chordsync-multihead-calibration-v1",
        "method": "per-head-temperature-scaling",
        "fitSplit": "validation",
        "testUsedForFit": False,
        "bins": int(bins),
        "temperatureBounds": [float(min_temp), float(max_temp)],
        "heads": heads,
    }


def _threshold_binary_metrics(scores, truth, threshold: float, beta: float):
    pred = scores >= float(threshold)
    truth = truth.astype(bool)
    tp = int(np.logical_and(pred, truth).sum())
    fp = int(np.logical_and(pred, ~truth).sum())
    fn = int(np.logical_and(~pred, truth).sum())
    precision = tp / max(1, tp + fp)
    recall = tp / max(1, tp + fn)
    b2 = float(beta) ** 2
    fbeta = (1 + b2) * precision * recall / max(1e-12, b2 * precision + recall)
    return {"tp": tp, "fp": fp, "fn": fn, "precision": precision, "recall": recall, "fbeta": fbeta}


def fit_class_threshold(scores, truth, beta=0.70, min_support=20, default_threshold=0.50):
    scores = np.asarray(scores, dtype=np.float64)
    truth = np.asarray(truth, dtype=bool)
    support = int(truth.sum())
    negatives = int((~truth).sum())
    if support < int(min_support) or negatives < 1:
        m = _threshold_binary_metrics(scores, truth, default_threshold, beta)
        return {"threshold": float(default_threshold), "learned": False, "support": support, "negatives": negatives, **m}
    # Deterministic dense grid; include score quantiles so small classes are not constrained to round cutoffs.
    grid = np.linspace(0.05, 0.95, 181)
    if scores.size:
        qs = np.quantile(scores, np.linspace(0.05, 0.95, 37))
        grid = np.unique(np.clip(np.concatenate([grid, qs]), 0.01, 0.99))
    best = None
    for t in grid:
        m = _threshold_binary_metrics(scores, truth, float(t), beta)
        # Primary objective: precision-favoring F-beta. Tie-break: precision, then higher threshold.
        key = (m["fbeta"], m["precision"], float(t))
        if best is None or key > best[0]:
            best = (key, float(t), m)
    _, t, m = best
    return {"threshold": t, "learned": True, "support": support, "negatives": negatives, **m}


def threshold_report_for_split(packed, temperatures, beta=0.70, min_support=20, default_threshold=0.50):
    if packed is None:
        return None
    heads = {}
    for h in HEAD_ORDER:
        logits, targets = packed[h]
        if logits.numel() == 0:
            heads[h] = {"labels": {}}
            continue
        t = max(1e-6, float(temperatures.get(h, 1.0)))
        probs = torch.softmax(logits.float() / t, -1).numpy()
        y = targets.numpy()
        labels = {}
        for ci, label in enumerate(HEAD_LABELS[h]):
            # 'none'/'N' are retained in the report for audit, but runtime only gates positive advanced components.
            r = fit_class_threshold(probs[:, ci], y == ci, beta=beta, min_support=min_support, default_threshold=default_threshold)
            labels[label] = {
                "threshold": round(float(r["threshold"]), 6),
                "learned": bool(r["learned"]),
                "support": int(r["support"]),
                "negatives": int(r["negatives"]),
                "precision": round(float(r["precision"]), 6),
                "recall": round(float(r["recall"]), 6),
                "fbeta": round(float(r["fbeta"]), 6),
            }
        heads[h] = {"temperature": round(t, 6), "labels": labels}
    return heads


def evaluate_fixed_thresholds(packed, threshold_report, temperatures, beta=0.70):
    if packed is None or not threshold_report:
        return None
    out = {}
    for h in HEAD_ORDER:
        logits, targets = packed[h]
        if logits.numel() == 0:
            out[h] = {"labels": {}}
            continue
        t = max(1e-6, float(temperatures.get(h, 1.0)))
        probs = torch.softmax(logits.float() / t, -1).numpy()
        y = targets.numpy()
        labels = {}
        for ci, label in enumerate(HEAD_LABELS[h]):
            spec = threshold_report[h]["labels"][label]
            thr = float(spec["threshold"])
            m = _threshold_binary_metrics(probs[:, ci], y == ci, thr, beta)
            labels[label] = {
                "threshold": round(thr, 6),
                "support": int((y == ci).sum()),
                "precision": round(float(m["precision"]), 6),
                "recall": round(float(m["recall"]), 6),
                "fbeta": round(float(m["fbeta"]), 6),
            }
        out[h] = {"temperature": round(t, 6), "labels": labels}
    return out


def build_threshold_report(model, val_loader, test_loader, device, calibration_report=None, beta=0.70, min_support=20, default_threshold=0.50):
    val = collect_logits_targets(model, val_loader, device)
    if val is None:
        return None
    temperatures = {h: 1.0 for h in HEAD_ORDER}
    if calibration_report:
        for h in HEAD_ORDER:
            v = calibration_report.get("heads", {}).get(h, {}).get("temperature")
            if v is not None:
                temperatures[h] = float(v)
    learned = threshold_report_for_split(val, temperatures, beta=beta, min_support=min_support, default_threshold=default_threshold)
    test = collect_logits_targets(model, test_loader, device) if test_loader else None
    return {
        "schema": "chordsync-multihead-thresholds-v1",
        "method": "per-class-validation-fbeta-thresholds",
        "fitSplit": "validation",
        "testUsedForFit": False,
        "beta": float(beta),
        "minSupport": int(min_support),
        "defaultThreshold": float(default_threshold),
        "runtimePolicy": {
            "triad": ["dim", "aug", "sus2", "sus4"],
            "seventh": "all-except-none",
            "extension": "all-except-none",
            "bass": "slash-bass-only",
            "gate": "soft-below-threshold",
        },
        "heads": learned,
        "test": evaluate_fixed_thresholds(test, learned, temperatures, beta=beta) if test is not None else None,
    }


def parse_head_weights(text: str):
    out = dict(DEFAULT_HEAD_LOSS_WEIGHTS)
    if not text:
        return out
    for item in text.split(","):
        if not item.strip():
            continue
        k, sep, v = item.partition("=")
        k = k.strip(); v = v.strip()
        if not sep or k not in out:
            raise ValueError(f"invalid head weight: {item}")
        out[k] = float(v)
    return out


def jsonable_balance_report(counts, class_weights, sample_weights, dataset, args):
    song_counts = Counter(dataset.song_ids.tolist())
    return {
        "schema": "chordsync-training-balance-v1",
        "classWeighting": args.class_weighting,
        "sampling": args.sampling,
        "classWeightCap": args.class_weight_cap,
        "sampleWeightCap": args.sample_weight_cap,
        "rareSamplingStrength": args.rare_sampling_strength,
        "songBalanceStrength": args.song_balance_strength,
        "effectiveBeta": args.effective_beta,
        "heads": {
            h: {
                "counts": counts[h].astype(int).tolist(),
                "weights": [round(float(x), 6) for x in class_weights[h]],
                "imbalanceRatioObserved": (
                    round(float(counts[h][counts[h] > 0].max() / max(1, counts[h][counts[h] > 0].min())), 3)
                    if (counts[h] > 0).any() else None
                ),
            } for h in HEAD_ORDER
        },
        "sampleWeights": {
            "min": round(float(sample_weights.min()), 6) if len(sample_weights) else None,
            "mean": round(float(sample_weights.mean()), 6) if len(sample_weights) else None,
            "max": round(float(sample_weights.max()), 6) if len(sample_weights) else None,
            "p90": round(float(np.quantile(sample_weights, .90)), 6) if len(sample_weights) else None,
            "p99": round(float(np.quantile(sample_weights, .99)), 6) if len(sample_weights) else None,
        },
        "songs": {"count": len(song_counts), "chunkCounts": dict(song_counts)},
    }


def main():
    ap = argparse.ArgumentParser(description="Train ChordSync v35 with imbalance-aware, calibrated and musically structured multi-head loss")
    ap.add_argument("train_npz")
    ap.add_argument("--val-npz")
    ap.add_argument("--test-npz", help="optional untouched TEST split for calibration reporting only")
    ap.add_argument("--out", default="multihead_chord_model.onnx")
    ap.add_argument("--epochs", type=int, default=20)
    ap.add_argument("--batch", type=int, default=16)
    ap.add_argument("--lr", type=float, default=3e-4)
    ap.add_argument("--seed", type=int, default=3007)
    ap.add_argument("--workers", type=int, default=0)
    ap.add_argument("--sampling", choices=["uniform", "rare-chord"], default="rare-chord")
    ap.add_argument("--class-weighting", choices=["none", "inverse-sqrt", "effective"], default="effective")
    ap.add_argument("--effective-beta", type=float, default=0.9995)
    ap.add_argument("--class-weight-cap", type=float, default=4.0)
    ap.add_argument("--sample-weight-cap", type=float, default=4.0)
    ap.add_argument("--rare-sampling-strength", type=float, default=0.65)
    ap.add_argument("--song-balance-strength", type=float, default=0.45)
    ap.add_argument("--label-smoothing", type=float, default=0.02)
    ap.add_argument("--head-loss-weights", default="root=1.25,triad=1.10,seventh=0.95,extension=0.90,bass=0.85")
    ap.add_argument("--musical-loss-weight", type=float, default=0.18, help="global weight for differentiable expected harmonic-distance regularizer")
    ap.add_argument("--musical-head-weights", default="root=1.35,triad=1.10,seventh=0.75,extension=0.55,bass=0.70", help="per-head severity weights for the musical regularizer")
    ap.add_argument("--no-musical-loss", action="store_true", help="disable v35 structured musical-distance regularization")
    ap.add_argument("--transition-loss-weight", type=float, default=0.08, help="global weight for TRAIN-only harmonic transition-context regularizer")
    ap.add_argument("--transition-alpha", type=float, default=0.5, help="additive smoothing for root+triad boundary transition prior")
    ap.add_argument("--transition-backoff", type=float, default=0.20, help="mix row transition prior with global next-chord distribution")
    ap.add_argument("--transition-report", default=None, help="defaults to <out>.transitions.json")
    ap.add_argument("--no-transition-loss", action="store_true", help="disable absolute TRAIN-only harmonic transition-context loss")
    ap.add_argument("--functional-loss-weight", type=float, default=0.10, help="v35 key-relative functional-harmony regularizer weight")
    ap.add_argument("--functional-report", default=None, help="defaults to <out>.functional-transitions.json")
    ap.add_argument("--no-functional-loss", action="store_true", help="disable v35 key-relative functional-harmony loss")
    ap.add_argument("--balance-report", default=None, help="defaults to <out>.balance.json")
    ap.add_argument("--calibration-report", default=None, help="defaults to <out>.calibration.json")
    ap.add_argument("--threshold-report", default=None, help="defaults to <out>.thresholds.json")
    ap.add_argument("--no-threshold-learning", action="store_true", help="skip validation-only per-class threshold fitting")
    ap.add_argument("--threshold-beta", type=float, default=0.70, help="F-beta objective; beta<1 favors precision")
    ap.add_argument("--threshold-min-support", type=int, default=20)
    ap.add_argument("--threshold-default", type=float, default=0.50)
    ap.add_argument("--no-calibration", action="store_true", help="skip post-hoc temperature fitting")
    ap.add_argument("--calibration-bins", type=int, default=15)
    ap.add_argument("--min-temperature", type=float, default=0.25)
    ap.add_argument("--max-temperature", type=float, default=8.0)
    ap.add_argument("--skip-export", action="store_true", help="run training/reporting without ONNX export (useful for smoke tests)")
    args = ap.parse_args()

    if not 0.0 <= args.rare_sampling_strength <= 1.0:
        raise SystemExit("--rare-sampling-strength must be 0..1")
    if not 0.0 <= args.song_balance_strength <= 1.0:
        raise SystemExit("--song-balance-strength must be 0..1")
    if not 0.0 <= args.label_smoothing < 1.0:
        raise SystemExit("--label-smoothing must be >=0 and <1")
    if not 0.0 <= args.musical_loss_weight <= 2.0:
        raise SystemExit("--musical-loss-weight must be 0..2")
    if not 0.0 <= args.functional_loss_weight <= 2.0:
        raise SystemExit("--functional-loss-weight must be 0..2")
    if not 0.0 <= args.transition_loss_weight <= 2.0:
        raise SystemExit("--transition-loss-weight must be 0..2")
    if not 0.0 < args.transition_alpha <= 10.0:
        raise SystemExit("--transition-alpha must be >0 and <=10")
    if not 0.0 <= args.transition_backoff <= 0.9:
        raise SystemExit("--transition-backoff must be 0..0.9")
    if not 0.0 < args.effective_beta < 1.0:
        raise SystemExit("--effective-beta must be between 0 and 1")
    if not 0.0 < args.threshold_beta <= 2.0:
        raise SystemExit("--threshold-beta must be >0 and <=2")
    if args.threshold_min_support < 1:
        raise SystemExit("--threshold-min-support must be >=1")
    if not 0.01 <= args.threshold_default <= 0.99:
        raise SystemExit("--threshold-default must be 0.01..0.99")

    set_seed(args.seed)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    train_ds = NPZChordDataset(args.train_npz)
    if len(train_ds) == 0:
        raise SystemExit("training dataset is empty")
    val_ds = NPZChordDataset(args.val_npz) if args.val_npz else None
    val_loader = DataLoader(val_ds, batch_size=args.batch, shuffle=False, num_workers=args.workers) if val_ds else None
    test_ds = NPZChordDataset(args.test_npz) if args.test_npz else None
    test_loader = DataLoader(test_ds, batch_size=args.batch, shuffle=False, num_workers=args.workers) if test_ds else None

    counts = class_counts(train_ds)
    class_weights = build_class_weights(counts, args.class_weighting, args.class_weight_cap, args.effective_beta)
    sample_weights = chunk_rarity_scores(
        train_ds, class_weights, args.rare_sampling_strength,
        args.sample_weight_cap, args.song_balance_strength
    )
    train_loader = make_train_loader(train_ds, args.batch, args.sampling, sample_weights, args.seed, args.workers)
    head_loss_weights = parse_head_weights(args.head_loss_weights)
    musical_head_weights = parse_named_weights(args.musical_head_weights, DEFAULT_MUSICAL_HEAD_WEIGHTS)
    transition_prior_np, transition_counts, transition_count = transition_prior_from_dataset(
        train_ds, alpha=args.transition_alpha, backoff=args.transition_backoff
    )
    functional_prior_np, functional_counts, functional_transition_count = functional_transition_prior_from_dataset(
        train_ds, alpha=args.transition_alpha, backoff=args.transition_backoff
    )

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    report_path = Path(args.balance_report) if args.balance_report else out.with_suffix(out.suffix + ".balance.json")
    transition_path = Path(args.transition_report) if args.transition_report else out.with_suffix(out.suffix + ".transitions.json")
    transition_audit = transition_report(transition_prior_np, transition_counts, transition_count, args.transition_alpha, args.transition_backoff)
    transition_path.write_text(json.dumps(transition_audit, indent=2), encoding="utf-8")
    functional_path = Path(args.functional_report) if args.functional_report else out.with_suffix(out.suffix + ".functional-transitions.json")
    functional_audit = functional_transition_report(functional_prior_np, functional_counts, functional_transition_count, args.transition_alpha, args.transition_backoff)
    functional_path.write_text(json.dumps(functional_audit, indent=2), encoding="utf-8")
    report = jsonable_balance_report(counts, class_weights, sample_weights, train_ds, args)
    report["headLossWeights"] = head_loss_weights
    report["musicalLoss"] = {"enabled": not args.no_musical_loss, "globalWeight": args.musical_loss_weight, "headWeights": musical_head_weights, "costMatrices": {h: MUSICAL_COST_MATRICES[h].round(4).tolist() for h in HEAD_ORDER}}
    report["transitionContext"] = {"enabled": not args.no_transition_loss, "globalWeight": args.transition_loss_weight, "fitSplit": "train", "transitionReport": str(transition_path), "observedBoundaryTransitions": transition_count, "smoothingAlpha": args.transition_alpha, "backoff": args.transition_backoff}
    report["functionalHarmonyContext"] = {"enabled": not args.no_functional_loss, "globalWeight": args.functional_loss_weight, "fitSplit": "train", "functionalReport": str(functional_path), "observedBoundaryTransitions": {"major": int(functional_transition_count[0]), "minor": int(functional_transition_count[1])}, "keyInvariant": True}
    report["seed"] = args.seed
    report_path.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps({"balanceReport": str(report_path), "transitionReport": str(transition_path), "functionalReport": str(functional_path), "sampling": args.sampling, "classWeighting": args.class_weighting, "trainBoundaryTransitions": transition_count, "functionalBoundaryTransitions": int(functional_transition_count.sum())}))

    model = MultiHeadChordNet().to(device)
    opt = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    criteria = {}
    for h in HEAD_ORDER:
        wt = torch.as_tensor(class_weights[h], dtype=torch.float32, device=device)
        criteria[h] = nn.CrossEntropyLoss(
            weight=wt if args.class_weighting != "none" else None,
            ignore_index=-100,
            label_smoothing=args.label_smoothing,
        )

    best = None
    history = []
    transition_prior_t = torch.as_tensor(transition_prior_np, dtype=torch.float32, device=device)
    functional_prior_t = torch.as_tensor(functional_prior_np, dtype=torch.float32, device=device)
    for epoch in range(1, args.epochs + 1):
        model.train(); loss_sum = 0.0; ce_sum = 0.0; musical_sum = 0.0; transition_sum = 0.0; functional_sum = 0.0; steps = 0
        for batch in train_loader:
            x, *ys = [t.to(device) for t in batch]
            outs = model(x)
            terms = []
            ce_total = x.sum() * 0.0
            musical_total = x.sum() * 0.0
            for h, out_logits, y in zip(HEAD_ORDER, outs, ys):
                if (y != -100).any():
                    ce = criteria[h](out_logits.reshape(-1, out_logits.shape[-1]), y.reshape(-1))
                    weighted_ce = head_loss_weights[h] * ce
                    ce_total = ce_total + weighted_ce
                    terms.append(weighted_ce)
                    if not args.no_musical_loss and args.musical_loss_weight > 0:
                        mc = musical_expected_cost(out_logits, y, h)
                        musical_total = musical_total + musical_head_weights[h] * mc
            transition_total = x.sum() * 0.0
            if not args.no_transition_loss and args.transition_loss_weight > 0:
                transition_total = transition_context_loss(outs[0], outs[1], ys[0], ys[1], transition_prior_t)
            functional_total = x.sum() * 0.0
            if not args.no_functional_loss and args.functional_loss_weight > 0:
                functional_total = functional_transition_context_loss(outs[0], outs[1], ys[0], ys[1], functional_prior_t)
            if not terms:
                continue
            loss = ce_total + (0.0 if args.no_musical_loss else args.musical_loss_weight * musical_total) + (0.0 if args.no_transition_loss else args.transition_loss_weight * transition_total) + (0.0 if args.no_functional_loss else args.functional_loss_weight * functional_total)
            opt.zero_grad(set_to_none=True)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()
            loss_sum += loss.item(); ce_sum += float(ce_total.detach().item()); musical_sum += float(musical_total.detach().item()); transition_sum += float(transition_total.detach().item()); functional_sum += float(functional_total.detach().item()); steps += 1

        metrics = evaluate(model, val_loader, device, transition_prior_np=transition_prior_np, functional_prior_np=functional_prior_np) if val_loader else None
        # Macro recall is deliberately part of model selection in v30 so rare classes matter.
        if metrics:
            acc_mean = float(np.mean(list(metrics["accuracy"].values())))
            macro_mean = float(np.mean(list(metrics["macroRecall"].values())))
            musical_similarity = 1.0 - float(metrics.get("aggregateMusicalCost", 1.0))
            transition_accuracy = float(metrics.get("transitionBoundaryAccuracy", 0.0))
            functional_accuracy = float(metrics.get("functionalBoundaryAccuracy", 0.0))
            # v35: key-relative function gets a small but explicit role; exact/macro metrics still dominate.
            score = 0.45 * acc_mean + 0.36 * macro_mean + 0.10 * musical_similarity + 0.03 * transition_accuracy + 0.06 * functional_accuracy
        else:
            score = -loss_sum / max(1, steps)
        row = {"epoch": epoch, "loss": loss_sum / max(1, steps), "crossEntropyLoss": ce_sum / max(1, steps), "musicalRegularizer": musical_sum / max(1, steps), "transitionRegularizer": transition_sum / max(1, steps), "functionalHarmonyRegularizer": functional_sum / max(1, steps), "val": metrics, "selectionScore": score}
        history.append(row)
        print(json.dumps(row))
        if best is None or score > best[0]:
            best = (score, {k: v.detach().cpu().clone() for k, v in model.state_dict().items()}, epoch)

    if best:
        model.load_state_dict(best[1])
    # v35: fit temperatures on VALIDATION only after selecting the best checkpoint.
    calibration_report = None
    calibration_path = Path(args.calibration_report) if args.calibration_report else out.with_suffix(out.suffix + ".calibration.json")
    if not args.no_calibration and val_loader is not None:
        calibration_report = build_calibration_report(
            model, val_loader, test_loader, device,
            bins=args.calibration_bins, min_temp=args.min_temperature, max_temp=args.max_temperature
        )
        if calibration_report is not None:
            calibration_report["model"] = str(out)
            calibration_report["seed"] = args.seed
            calibration_path.write_text(json.dumps(calibration_report, indent=2), encoding="utf-8")
            print(json.dumps({"calibrationReport": str(calibration_path), "temperatures": {h: calibration_report["heads"][h]["temperature"] for h in HEAD_ORDER}}))

    # v35: learn per-class decision thresholds on VALIDATION only, after temperature calibration.
    threshold_report = None
    threshold_path = Path(args.threshold_report) if args.threshold_report else out.with_suffix(out.suffix + ".thresholds.json")
    if not args.no_threshold_learning and val_loader is not None:
        threshold_report = build_threshold_report(
            model, val_loader, test_loader, device, calibration_report=calibration_report,
            beta=args.threshold_beta, min_support=args.threshold_min_support, default_threshold=args.threshold_default
        )
        if threshold_report is not None:
            threshold_report["model"] = str(out)
            threshold_report["seed"] = args.seed
            threshold_path.write_text(json.dumps(threshold_report, indent=2), encoding="utf-8")
            summary = {
                h: {k: v["threshold"] for k, v in threshold_report["heads"][h]["labels"].items() if v.get("learned")}
                for h in ["triad", "seventh", "extension", "bass"]
            }
            print(json.dumps({"thresholdReport": str(threshold_path), "learnedThresholds": summary}))

    model.eval().cpu()
    exported = False
    if not args.skip_export:
        try:
            import onnx  # noqa: F401 - explicit dependency check for a clearer message
        except ImportError as exc:
            raise SystemExit("ONNX export requires the 'onnx' package. Install server/requirements-training.txt or use --skip-export.") from exc
        dummy = torch.randn(1, 256, 12)
        torch.onnx.export(
            model, dummy, str(out),
            input_names=["chroma"],
            output_names=["root_logits", "triad_logits", "seventh_logits", "extension_logits", "bass_logits"],
            dynamic_axes={
                "chroma": {1: "time"}, "root_logits": {1: "time"}, "triad_logits": {1: "time"},
                "seventh_logits": {1: "time"}, "extension_logits": {1: "time"}, "bass_logits": {1: "time"}
            },
            opset_version=17, dynamo=False,
        )
        exported = True

    train_report = {
        "schema": "chordsync-multihead-training-v35",
        "bestEpoch": best[2] if best else None,
        "bestSelectionScore": best[0] if best else None,
        "device": str(device),
        "model": str(out) if exported else None,
        "exportSkipped": bool(args.skip_export),
        "balanceReport": str(report_path),
        "calibrationReport": str(calibration_path) if calibration_report is not None else None,
        "calibration": calibration_report,
        "thresholdReport": str(threshold_path) if threshold_report is not None else None,
        "thresholds": threshold_report,
        "musicalLoss": {
            "enabled": not args.no_musical_loss,
            "globalWeight": args.musical_loss_weight,
            "headWeights": musical_head_weights,
            "costMatrices": {h: MUSICAL_COST_MATRICES[h].round(4).tolist() for h in HEAD_ORDER},
        },
        "transitionContext": {
            "enabled": not args.no_transition_loss,
            "globalWeight": args.transition_loss_weight,
            "fitSplit": "train",
            "validationUsedForFit": False,
            "testUsedForFit": False,
            "transitionReport": str(transition_path),
            "observedBoundaryTransitions": transition_count,
            "smoothingAlpha": args.transition_alpha,
            "backoff": args.transition_backoff,
            "selectionMetric": "0.45*accuracy + 0.36*macroRecall + 0.10*(1-aggregateMusicalCost) + 0.03*absoluteTransitionAccuracy + 0.06*functionalBoundaryAccuracy",
        },
        "functionalHarmonyContext": {
            "enabled": not args.no_functional_loss,
            "globalWeight": args.functional_loss_weight,
            "fitSplit": "train",
            "validationUsedForFit": False,
            "testUsedForFit": False,
            "keyRelative": True,
            "conditionedByMode": ["major", "minor"],
            "functionalReport": str(functional_path),
            "observedBoundaryTransitions": {"major": int(functional_transition_count[0]), "minor": int(functional_transition_count[1])},
        },
        "history": history,
    }
    train_report_path = out.with_suffix(out.suffix + ".training.json")
    train_report_path.write_text(json.dumps(train_report, indent=2), encoding="utf-8")
    print(json.dumps({"exported": str(out) if exported else None, "trainingReport": str(train_report_path)}))


if __name__ == "__main__":
    main()
