#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import json, math, random, sys
from PIL import Image, ImageDraw, ImageFilter
ROOT=Path(__file__).resolve().parents[1]; ART=ROOT/'public'/'card-art'; MANIFEST=ROOT/'docs'/'V33A_CARD_MANIFEST.json'
sys.path.insert(0,str(ROOT/'scripts'))
from generate_unique_card_art import create_art, vec_for, seed_for, COLORS, mix
W,H=768,480

def add_type_signature(im,card,salt):
    ut=card.get('unitType')
    if not ut: return im
    rng=random.Random(seed_for(card['id'],salt+7000)); p,s,_=COLORS[card['element']]
    layer=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(layer,'RGBA'); cx=390+rng.randint(-45,45); cy=225+rng.randint(-35,35)
    if ut=='vanguard':
        for off in (-36,36):
            d.line((cx+off-110,cy+125,cx+off+85,cy-135),fill=(*s,150),width=7)
            d.polygon([(cx+off+38,cy-92),(cx+off+120,cy-112),(cx+off+54,cy-30)],fill=(*p,72))
        d.polygon([(cx-92,cy+80),(cx,cy-15),(cx+92,cy+80),(cx+68,cy+105),(cx,cy+33),(cx-68,cy+105)],outline=(*s,155))
    elif ut=='artificer':
        for rr in (38,72,112):
            d.ellipse((cx-rr,cy-rr,cx+rr,cy+rr),outline=(*s,105),width=4)
            for a in range(0,360,45):
                rad=math.radians(a+rng.randint(-5,5)); x=cx+math.cos(rad)*rr; y=cy+math.sin(rad)*rr
                d.rectangle((x-7,y-7,x+7,y+7),fill=(*p,105))
        d.ellipse((cx-15,cy-15,cx+15,cy+15),fill=(*s,180))
    elif ut=='spirit':
        for i in range(9):
            rr=18+i*9; ox=rng.randint(-100,100); oy=rng.randint(-75,80)
            d.ellipse((cx+ox-rr,cy+oy-rr,cx+ox+rr,cy+oy+rr),outline=(*mix(p,(255,255,255),.35),80),width=3)
        d.arc((cx-150,cy-115,cx+150,cy+135),20,320,fill=(*s,125),width=5)
    elif ut=='hunter':
        for rr in (45,90,135): d.arc((cx-rr,cy-rr,cx+rr,cy+rr),rng.randint(0,90),rng.randint(210,350),fill=(*s,125),width=4)
        d.line((cx-165,cy,cx-55,cy),fill=(*p,150),width=3); d.line((cx+55,cy,cx+165,cy),fill=(*p,150),width=3)
        d.line((cx,cy-150,cx,cy-55),fill=(*p,150),width=3); d.line((cx,cy+55,cx,cy+150),fill=(*p,150),width=3)
    elif ut=='relic':
        d.polygon([(cx-78,cy+140),(cx-98,cy-80),(cx,cy-145),(cx+98,cy-80),(cx+78,cy+140)],fill=(*mix((8,10,15),p,.18),150),outline=(*s,150))
        for rr in (22,48,74): d.ellipse((cx-rr,cy-rr,cx+rr,cy+rr),outline=(*s,100),width=3)
        d.line((cx-70,cy,cx+70,cy),fill=(*p,135),width=4); d.line((cx,cy-70,cx,cy+70),fill=(*p,135),width=4)
    elif ut=='oracle':
        pts=[]
        for i in range(7):
            a=(i/7)*math.tau+rng.random()*.25; rr=rng.randint(55,130); pts.append((cx+math.cos(a)*rr,cy+math.sin(a)*rr))
        for a,b in zip(pts,pts[1:]+pts[:1]): d.line((*a,*b),fill=(*s,95),width=2)
        for x,y in pts: d.ellipse((x-5,y-5,x+5,y+5),fill=(*mix(s,(255,255,255),.45),185))
        d.ellipse((cx-70,cy-36,cx+70,cy+36),outline=(*s,125),width=4); d.ellipse((cx-15,cy-15,cx+15,cy+15),fill=(*p,170))
    return Image.alpha_composite(im.convert('RGBA'),layer.filter(ImageFilter.GaussianBlur(.45))).convert('RGB')

def main():
    cards=json.loads(MANIFEST.read_text(encoding='utf-8'))['cards']; ART.mkdir(parents=True,exist_ok=True)
    made=[]
    # Card ids are hashed inside create_art, so every card receives a stable, unique composition seed.
    # A tiny deterministic salt is used only if exact output bytes ever collide (extremely unlikely).
    seen_hashes=set()
    import hashlib
    for i,card in enumerate(cards,1):
        salt=0
        while True:
            im=add_type_signature(create_art(card,salt),card,salt)
            raw=im.tobytes(); digest=hashlib.sha256(raw).hexdigest()
            if digest not in seen_hashes: break
            salt += 1
        seen_hashes.add(digest)
        out=ART/f"{card['id']}.webp"; im.save(out,'WEBP',quality=88,method=3); made.append(out)
        if i%25==0: print(f'generated {i}/{len(cards)}',flush=True)
    print('art_count',len(made),'unique_raw_hashes',len(seen_hashes),flush=True)
if __name__=='__main__': main()
