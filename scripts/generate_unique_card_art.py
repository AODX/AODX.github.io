#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import csv, json, hashlib, math, random
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'public' / 'card-art'
META = ROOT / 'docs' / 'V26_NEW_CARDS.json'
CATALOG = ROOT / 'docs' / 'CARD_CATALOG_320.csv'
W, H = 768, 480

COLORS = {
    'solar': ((255,126,68),(255,210,104),(89,17,14)),
    'lunar': ((126,155,255),(205,222,255),(18,29,74)),
    'storm': ((76,218,255),(181,247,255),(12,48,76)),
    'verdant': ((83,202,121),(196,255,172),(12,66,44)),
    'void': ((177,98,255),(235,164,255),(39,14,73)),
    'neutral': ((187,201,220),(255,226,151),(36,42,52)),
}
SERIES_ACCENT = {
    'chronorium': (111,216,255), 'arcana_protocol': (217,148,255), 'beastforge': (242,159,82),
    'phantom_carnival': (202,112,255), 'astral_armada': (85,220,255),
}

def clamp(v): return max(0,min(255,int(v)))
def mix(a,b,t): return tuple(clamp(a[i]*(1-t)+b[i]*t) for i in range(3))
def alpha(c,a): return (*c,a)

def seed_for(card_id:str, salt:int=0)->int:
    return int(hashlib.sha256(f'{card_id}:{salt}'.encode()).hexdigest()[:16],16)

def radial_layer(size, center, radius, color, strength=255):
    w,h=size; y,x=np.ogrid[:h,:w]; cx,cy=center
    d=np.sqrt((x-cx)**2+(y-cy)**2)/max(1,radius)
    a=np.clip(1-d,0,1)**2 * strength
    arr=np.zeros((h,w,4),dtype=np.uint8); arr[:,:,:3]=color; arr[:,:,3]=a.astype(np.uint8)
    return Image.fromarray(arr,'RGBA')

def gradient_background(rng, element, series_id=None):
    p,s,d=COLORS[element]
    if series_id in SERIES_ACCENT: p=mix(p,SERIES_ACCENT[series_id],.35)
    top=mix(d,p,.20); bottom=mix((2,5,10),d,.38)
    arr=np.zeros((H,W,3),dtype=np.uint8)
    for y in range(H):
        t=y/(H-1); c=mix(top,bottom,t)
        arr[y,:,:]=c
    im=Image.fromarray(arr,'RGB').convert('RGBA')
    # 3 unique glows
    for i in range(3):
        cx=rng.randint(-50,W+50); cy=rng.randint(-30,H+30); rad=rng.randint(120,300)
        col = p if i<2 else s
        im=Image.alpha_composite(im, radial_layer((W,H),(cx,cy),rad,col,rng.randint(55,120)))
    return im

def draw_stars(draw,rng,color,count=55):
    for _ in range(count):
        x=rng.randrange(W); y=rng.randrange(H); r=rng.choice([1,1,1,2,2,3])
        a=rng.randint(45,180)
        draw.ellipse((x-r,y-r,x+r,y+r), fill=alpha(color,a))

def draw_runes(draw,rng,color,count=7):
    for _ in range(count):
        cx=rng.randint(40,W-40); cy=rng.randint(30,H-30); rr=rng.randint(18,78)
        draw.ellipse((cx-rr,cy-rr,cx+rr,cy+rr), outline=alpha(color,rng.randint(35,90)), width=rng.randint(1,3))
        if rng.random()<.7:
            ang=rng.random()*math.tau
            x2=cx+math.cos(ang)*rr; y2=cy+math.sin(ang)*rr
            draw.line((cx,cy,x2,y2), fill=alpha(color,rng.randint(35,100)), width=1)

def subject_unit(layer,rng,p,s,rarity):
    d=ImageDraw.Draw(layer,'RGBA')
    cx=rng.randint(280,490); base_y=rng.randint(360,420)
    scale=rng.randint(85,130) + (20 if rarity=='legendary' else 0)
    # cape/wings
    if rng.random()<.55:
        wing=scale*1.15
        d.polygon([(cx,base_y-scale*.55),(cx-wing,base_y-scale*.10),(cx-scale*.45,base_y-scale*.75)], fill=alpha(mix(p,(255,255,255),.15),90))
        d.polygon([(cx,base_y-scale*.55),(cx+wing,base_y-scale*.10),(cx+scale*.45,base_y-scale*.75)], fill=alpha(mix(p,(255,255,255),.15),90))
    # body silhouette armor
    body=mix((5,8,15),p,.15)
    d.rounded_rectangle((cx-scale*.28,base_y-scale*.82,cx+scale*.28,base_y), radius=int(scale*.12), fill=alpha(body,245), outline=alpha(s,160), width=3)
    # head
    d.ellipse((cx-scale*.19,base_y-scale*1.10,cx+scale*.19,base_y-scale*.72), fill=alpha(body,250), outline=alpha(s,185), width=3)
    # visor
    d.line((cx-scale*.12,base_y-scale*.91,cx+scale*.12,base_y-scale*.91), fill=alpha(s,230), width=4)
    # shoulders
    d.polygon([(cx-scale*.28,base_y-scale*.72),(cx-scale*.62,base_y-scale*.60),(cx-scale*.30,base_y-scale*.44)], fill=alpha(mix(body,p,.15),245), outline=alpha(s,120))
    d.polygon([(cx+scale*.28,base_y-scale*.72),(cx+scale*.62,base_y-scale*.60),(cx+scale*.30,base_y-scale*.44)], fill=alpha(mix(body,p,.15),245), outline=alpha(s,120))
    # weapon, unique angle
    ang=rng.uniform(-1.2,1.2); length=scale*rng.uniform(.9,1.55)
    x1=cx+scale*.3; y1=base_y-scale*.55; x2=x1+math.cos(ang)*length; y2=y1+math.sin(ang)*length
    d.line((x1,y1,x2,y2), fill=alpha(s,235), width=rng.randint(5,10))
    d.ellipse((x2-6,y2-6,x2+6,y2+6), fill=alpha(p,230))
    # core
    rr=scale*.11; d.ellipse((cx-rr,base_y-scale*.58-rr,cx+rr,base_y-scale*.58+rr), fill=alpha(p,220), outline=alpha((255,255,255),180), width=2)

def subject_spell(layer,rng,p,s,rarity):
    d=ImageDraw.Draw(layer,'RGBA'); cx=rng.randint(240,530); cy=rng.randint(170,310); R=rng.randint(75,135)
    rings=4 if rarity=='legendary' else 3
    for i in range(rings):
        r=R+i*25; box=(cx-r,cy-r,cx+r,cy+r)
        d.arc(box,start=rng.randint(0,150),end=rng.randint(220,350),fill=alpha(s,170-i*25),width=2+i)
    # central glyph polygon
    n=rng.randint(4,8); rot=rng.random()*math.tau
    pts=[]
    for i in range(n):
        a=rot+i*math.tau/n; rr=R*rng.uniform(.45,.75); pts.append((cx+math.cos(a)*rr,cy+math.sin(a)*rr))
    d.polygon(pts, outline=alpha((255,255,255),190), fill=alpha(p,65))
    for _ in range(rng.randint(5,10)):
        a=rng.random()*math.tau; r=rng.randint(R//2,R*2)
        x=cx+math.cos(a)*r; y=cy+math.sin(a)*r
        d.line((cx,cy,x,y),fill=alpha(p,rng.randint(50,130)),width=rng.randint(1,3))
    d.ellipse((cx-18,cy-18,cx+18,cy+18),fill=alpha(s,225))

def subject_trap(layer,rng,p,s,rarity):
    d=ImageDraw.Draw(layer,'RGBA'); cx=rng.randint(250,510); cy=rng.randint(180,310); w=rng.randint(180,300); h=rng.randint(90,170)
    # mechanical/rune plate
    d.rounded_rectangle((cx-w/2,cy-h/2,cx+w/2,cy+h/2),radius=18,fill=alpha(mix((5,8,13),p,.10),230),outline=alpha(s,175),width=3)
    for i in range(rng.randint(3,6)):
        off=(i-(rng.randint(2,3)))*rng.randint(18,35)
        d.line((cx-w*.42,cy+off,cx+w*.42,cy-off*.3),fill=alpha(p,95),width=2)
    for sx in (-1,1):
        px=cx+sx*w*.38; py=cy
        d.ellipse((px-14,py-14,px+14,py+14),fill=alpha(p,170),outline=alpha(s,190),width=2)
    # warning rays
    for i in range(8):
        a=i*math.tau/8+rng.random()*.2; r1=max(w,h)*.55; r2=r1+rng.randint(30,80)
        d.line((cx+math.cos(a)*r1,cy+math.sin(a)*r1,cx+math.cos(a)*r2,cy+math.sin(a)*r2),fill=alpha(s,80),width=2)

def subject_boss(layer,rng,p,s,rarity,kind):
    d=ImageDraw.Draw(layer,'RGBA'); cx=rng.randint(320,450); cy=rng.randint(235,300); R=rng.randint(125,175)
    # massive silhouette with horns/wings
    dark=mix((2,4,8),p,.12)
    body=[(cx-R*.55,cy+R*.75),(cx-R*.38,cy-R*.25),(cx,cy-R*.72),(cx+R*.38,cy-R*.25),(cx+R*.55,cy+R*.75)]
    d.polygon(body,fill=alpha(dark,248),outline=alpha(s,200),width=4)
    for sx in (-1,1):
        d.polygon([(cx+sx*R*.22,cy-R*.48),(cx+sx*R*1.18,cy-R*.80),(cx+sx*R*.62,cy-R*.04)],fill=alpha(mix(dark,p,.22),220),outline=alpha(s,120))
    d.ellipse((cx-22,cy-R*.34-12,cx+22,cy-R*.34+12),fill=alpha(s,235))
    # energy ring
    for rr in (R*.72,R*.9,R*1.12):
        d.arc((cx-rr,cy-rr,cx+rr,cy+rr),20,320,fill=alpha(p,110),width=3)
    if kind=='evolution':
        d.line((cx,cy-R*1.15,cx,cy+R*.9),fill=alpha((255,255,255),90),width=3)

def create_art(card, salt=0):
    rng=random.Random(seed_for(card['id'],salt)); p,s,dark=COLORS[card['element']]
    if card.get('seriesId') in SERIES_ACCENT: p=mix(p,SERIES_ACCENT[card['seriesId']],.28)
    base=gradient_background(rng,card['element'],card.get('seriesId'))
    details=Image.new('RGBA',(W,H),(0,0,0,0)); draw=ImageDraw.Draw(details,'RGBA')
    draw_stars(draw,rng,mix(s,(255,255,255),.25),count=rng.randint(34,72))
    draw_runes(draw,rng,p,count=rng.randint(4,9))
    # diagonal environment structures
    for _ in range(rng.randint(3,7)):
        x=rng.randint(-150,W); y=rng.randint(20,H); leng=rng.randint(160,430); ang=rng.uniform(-.9,.9)
        x2=x+math.cos(ang)*leng; y2=y+math.sin(ang)*leng
        draw.line((x,y,x2,y2),fill=alpha(s,rng.randint(25,80)),width=rng.randint(1,5))
    base=Image.alpha_composite(base,details)
    subject=Image.new('RGBA',(W,H),(0,0,0,0))
    kind=card['kind']
    if kind=='unit': subject_unit(subject,rng,p,s,card['rarity'])
    elif kind=='spell': subject_spell(subject,rng,p,s,card['rarity'])
    elif kind=='trap': subject_trap(subject,rng,p,s,card['rarity'])
    else: subject_boss(subject,rng,p,s,card['rarity'],kind)
    glow=subject.filter(ImageFilter.GaussianBlur(radius=18 if card['rarity']!='legendary' else 27))
    glow=ImageEnhance.Brightness(glow).enhance(1.25)
    base=Image.alpha_composite(base,glow)
    base=Image.alpha_composite(base,subject)
    # foreground floor + vignette
    fg=Image.new('RGBA',(W,H),(0,0,0,0)); fd=ImageDraw.Draw(fg,'RGBA')
    fd.polygon([(0,H*.78),(W,H*.66),(W,H),(0,H)],fill=(0,0,0,70))
    base=Image.alpha_composite(base,fg)
    # vignette numpy
    arr=np.array(base.convert('RGB')).astype(np.float32)
    yy,xx=np.mgrid[0:H,0:W]; dx=(xx-W/2)/(W/2); dy=(yy-H/2)/(H/2); dist=np.sqrt(dx*dx+dy*dy)
    v=np.clip(1-(dist*.34)**2,.58,1.0)[...,None]
    arr=np.clip(arr*v,0,255).astype(np.uint8)
    return Image.fromarray(arr,'RGB')

def vec_for(img):
    a=np.array(img.resize((24,24)),dtype=np.float32).reshape(-1)
    a=(a-a.mean())/(a.std()+1e-6); return a/(np.linalg.norm(a)+1e-8)

def load_existing_metadata():
    out={}
    with CATALOG.open(encoding='utf-8-sig',newline='') as f:
        for r in csv.DictReader(f): out[r['id']]={'id':r['id'],'kind':r['kind'],'rarity':r['rarity'],'element':r['element'],'seriesId':None}
    for c in json.loads(META.read_text(encoding='utf-8')): out[c['id']]=c
    return out

def find_existing_similar(th=.92):
    files=sorted(p for p in ART.glob('*.webp') if p.name!='fallback.webp' and not p.stem.startswith('v26_'))
    vecs={p.stem:vec_for(Image.open(p).convert('RGB')) for p in files}
    names=list(vecs); nodes=set()
    for i,n in enumerate(names):
        a=vecs[n]
        for m in names[i+1:]:
            if float(a@vecs[m])>=th: nodes|={n,m}
    nodes.update({'spell_overgrowth','trap_mirror_veil','trap_thorn_snare'})
    return nodes

def main():
    meta=load_existing_metadata(); regen=find_existing_similar(.92)
    new_ids={c['id'] for c in json.loads(META.read_text(encoding='utf-8'))}
    targets=sorted(regen|new_ids)
    made=[]; vectors=[]
    for idx,cid in enumerate(targets,1):
        c=meta.get(cid)
        if not c: continue
        # re-roll if too visually close to another generated image
        chosen=None; vv=None
        for salt in range(12):
            im=create_art(c,salt); v=vec_for(im)
            if not vectors or max(float(v@old) for old in vectors)<.935:
                chosen=im;vv=v;break
        if chosen is None: chosen=im; vv=v
        chosen.save(ART/f'{cid}.webp','WEBP',quality=90,method=6)
        vectors.append(vv); made.append(cid)
        if idx%50==0: print('generated',idx,'/',len(targets))
    (ROOT/'docs/V26_REGENERATED_ART.json').write_text(json.dumps({'regenerated_existing':sorted(regen),'new_cards':sorted(new_ids),'total_written':len(made)},ensure_ascii=False,indent=2),encoding='utf-8')
    print('existing similarity replacements',len(regen),'new',len(new_ids),'total',len(made))

if __name__=='__main__': main()
