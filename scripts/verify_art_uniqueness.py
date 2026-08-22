#!/usr/bin/env python3
from pathlib import Path
import re, hashlib, sys
from PIL import Image
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/'public/card-art'
DATA=(ROOT/'app/game-data.ts').read_text(encoding='utf-8')
# capture all id fields inside game data, then keep only IDs that have an art file/card-like prefixes.
ids=[]
for m in re.finditer(r'\bid:\s*[\"\']([^\"\']+)[\"\']', DATA):
    cid=m.group(1)
    if cid.startswith(('unit_','spell_','trap_','fusion_','evolution_','v26_')):
        ids.append(cid)
ids=list(dict.fromkeys(ids))

missing=[]; invalid=[]; hashes={}; vecs={}
def vec(img):
    a=np.array(img.resize((24,24)),dtype=np.float32).reshape(-1)
    a=(a-a.mean())/(a.std()+1e-6)
    return a/(np.linalg.norm(a)+1e-8)

for cid in ids:
    p=ART/f'{cid}.webp'
    if not p.exists():
        missing.append(cid); continue
    raw=p.read_bytes(); h=hashlib.sha256(raw).hexdigest(); hashes.setdefault(h,[]).append(cid)
    try:
        im=Image.open(p).convert('RGB'); im.verify() if False else None
        vecs[cid]=vec(im)
    except Exception as e:
        invalid.append((cid,str(e)))

dups=[g for g in hashes.values() if len(g)>1]
# Strong similarity is treated as a QA failure (threshold 0.940). This does not require every composition to be semantically unrelated,
# but catches accidental re-use / near-identical variants before shipping.
near=[]
names=list(vecs)
for i,a in enumerate(names):
    va=vecs[a]
    for b in names[i+1:]:
        c=float(va@vecs[b])
        if c>=0.940:
            near.append((a,b,c))

print(f'cards={len(ids)} art={len(vecs)} missing={len(missing)} invalid={len(invalid)} exact_duplicate_groups={len(dups)} near_duplicate_pairs={len(near)}')
if missing: print('MISSING', missing[:30])
if invalid: print('INVALID', invalid[:10])
if dups: print('EXACT', dups[:10])
if near:
    for a,b,c in sorted(near,key=lambda x:-x[2])[:20]: print(f'NEAR {c:.4f} {a} {b}')
if missing or invalid or dups or near:
    sys.exit(1)
