from __future__ import annotations
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, random

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'card-art'
OUT.mkdir(parents=True, exist_ok=True)
W, H = 512, 736
FONT_BOLD = '/usr/share/fonts/truetype/nanum/NanumSquareB.ttf'
FONT_REG = '/usr/share/fonts/truetype/nanum/NanumSquareR.ttf'

PHASES = [
    ('여명', (250,178,101), (89,111,205), (255,233,176)),
    ('정점', (255,218,101), (239,111,64), (255,246,184)),
    ('황혼', (219,93,122), (88,54,151), (255,190,202)),
    ('심야', (42,71,142), (17,25,74), (159,184,255)),
    ('개기일식', (173,74,220), (31,16,54), (227,171,255)),
]

def lerp(a,b,t): return tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))
def rgba(c,a): return (*c,a)

def gradient(top,bottom):
    im=Image.new('RGB',(W,H)); px=im.load()
    for y in range(H):
        t=y/(H-1); col=lerp(top,bottom,t)
        for x in range(W): px[x,y]=col
    return im

def glow_circle(layer, center, radius, color, width=4, blur=8):
    g=Image.new('RGBA',(W,H),(0,0,0,0)); gd=ImageDraw.Draw(g)
    x,y=center
    for i in range(max(1,width)):
        r=radius+i
        gd.ellipse((x-r,y-r,x+r,y+r), outline=rgba(color,130), width=2)
    g=g.filter(ImageFilter.GaussianBlur(blur))
    layer.alpha_composite(g)
    d=ImageDraw.Draw(layer)
    d.ellipse((x-radius,y-radius,x+radius,y+radius), outline=rgba(color,205), width=2)

def draw_motif(layer, idx, accent, dark):
    d=ImageDraw.Draw(layer)
    cx,cy=256,350
    # Common arcane frame: spell-like geometry only, intentionally no humanoid silhouette.
    for r,a in [(82,120),(122,85),(166,55)]:
        d.ellipse((cx-r,cy-r,cx+r,cy+r), outline=rgba(accent,a), width=2)
    for ang in range(0,360,45):
        rr=166; x=cx+math.cos(math.radians(ang))*rr; y=cy+math.sin(math.radians(ang))*rr
        d.ellipse((x-3,y-3,x+3,y+3), fill=rgba(accent,150))
    if idx==0:  # phase acceleration
        for r in [45,72,104]:
            d.arc((cx-r,cy-r,cx+r,cy+r), 205, 505, fill=rgba(accent,235), width=4)
        for off in [-48,0,48]:
            d.polygon([(cx+off,cy-118),(cx+off-9,cy-96),(cx+off+9,cy-96)], fill=rgba(accent,220))
    elif idx==1:  # celestial rewind
        for r in [55,95,135]:
            d.arc((cx-r,cy-r,cx+r,cy+r), 25, 300, fill=rgba(accent,220), width=3)
        d.polygon([(cx-142,cy-16),(cx-115,cy-31),(cx-121,cy-2)], fill=rgba(accent,235))
        d.ellipse((cx-24,cy-24,cx+24,cy+24), outline=rgba(dark,240), width=8)
    elif idx==2:  # observer selection / lens
        d.ellipse((cx-108,cy-62,cx+108,cy+62), outline=rgba(accent,235), width=4)
        d.ellipse((cx-36,cy-36,cx+36,cy+36), fill=rgba(dark,185), outline=rgba(accent,245), width=4)
        d.ellipse((cx-8,cy-8,cx+8,cy+8), fill=rgba(accent,250))
        for off in [-150,150]: d.line((cx+off,cy,cx+off//2,cy),fill=rgba(accent,160),width=2)
    elif idx==3:  # boundary lock
        pts=[]
        for i in range(6):
            a=math.radians(60*i-30); pts.append((cx+120*math.cos(a),cy+120*math.sin(a)))
        d.polygon(pts, outline=rgba(accent,235), width=4)
        pts2=[]
        for i in range(6):
            a=math.radians(60*i); pts2.append((cx+72*math.cos(a),cy+72*math.sin(a)))
        d.polygon(pts2, outline=rgba(accent,170), width=3)
        d.rectangle((cx-28,cy-28,cx+28,cy+28), outline=rgba(accent,240), width=4)
    elif idx==4:  # afterglow collection
        for a in range(0,360,30):
            rr=145; x=cx+math.cos(math.radians(a))*rr; y=cy+math.sin(math.radians(a))*rr
            d.line((x,y,cx,cy),fill=rgba(accent,70),width=2)
            d.ellipse((x-4,y-4,x+4,y+4),fill=rgba(accent,190))
        d.polygon([(cx,cy-56),(cx+42,cy),(cx,cy+56),(cx-42,cy)], fill=rgba(dark,160), outline=rgba(accent,245))
        d.polygon([(cx,cy-28),(cx+20,cy),(cx,cy+28),(cx-20,cy)], fill=rgba(accent,210))
    elif idx==5:  # corona explosion
        d.ellipse((cx-54,cy-54,cx+54,cy+54), fill=rgba(dark,220), outline=rgba(accent,245), width=5)
        for a in range(0,360,15):
            r1=72; r2=140 if a%30==0 else 112
            x1=cx+math.cos(math.radians(a))*r1; y1=cy+math.sin(math.radians(a))*r1
            x2=cx+math.cos(math.radians(a))*r2; y2=cy+math.sin(math.radians(a))*r2
            d.line((x1,y1,x2,y2), fill=rgba(accent,220 if a%30==0 else 120), width=3)
        glow_circle(layer,(cx,cy),68,accent,3,12)
    elif idx==6:  # star clock restart
        d.ellipse((cx-115,cy-115,cx+115,cy+115), outline=rgba(accent,240), width=4)
        for a in range(0,360,30):
            r1=94;r2=112
            d.line((cx+math.cos(math.radians(a))*r1,cy+math.sin(math.radians(a))*r1,cx+math.cos(math.radians(a))*r2,cy+math.sin(math.radians(a))*r2),fill=rgba(accent,190),width=3)
        d.line((cx,cy,cx,cy-72),fill=rgba(accent,245),width=5)
        d.line((cx,cy,cx+56,cy+34),fill=rgba(accent,245),width=5)
        d.ellipse((cx-9,cy-9,cx+9,cy+9),fill=rgba(accent,250))
    else:  # eclipse omen
        d.ellipse((cx-82,cy-82,cx+82,cy+82), fill=rgba(dark,235), outline=rgba(accent,225), width=4)
        d.arc((cx-105,cy-105,cx+105,cy+105), 250, 470, fill=rgba(accent,245), width=12)
        for r in [122,150]: d.arc((cx-r,cy-r,cx+r,cy+r), 190, 350, fill=rgba(accent,130), width=3)
        d.polygon([(cx,cy-145),(cx+12,cy-120),(cx,cy-128),(cx-12,cy-120)], fill=rgba(accent,235))

def render(card_no:int):
    phase_i=(card_no-1)//8; action_i=(card_no-1)%8
    phase,top,bottom,accent=PHASES[phase_i]
    im=gradient(top,bottom).convert('RGBA')
    layer=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(layer)
    random.seed(card_no*713)
    # star/energy dust
    for _ in range(90):
        x=random.randint(20,W-20); y=random.randint(95,H-42); r=random.choice([1,1,1,2])
        d.ellipse((x-r,y-r,x+r,y+r),fill=(255,255,255,random.randint(50,175)))
    # subtle phase triangle / diagonals
    d.polygon([(256,165),(128,515),(384,515)], outline=rgba(accent,55), width=2)
    draw_motif(layer,action_i,accent,bottom)
    im=Image.alpha_composite(im,layer)
    d=ImageDraw.Draw(im)
    try:
        fphase=ImageFont.truetype(FONT_BOLD,27 if phase!='개기일식' else 22)
        fcode=ImageFont.truetype(FONT_BOLD,18)
    except Exception:
        fphase=ImageFont.load_default();fcode=ImageFont.load_default()
    # phase pill
    label_w=132 if phase!='개기일식' else 154
    d.rounded_rectangle((28,28,28+label_w,78),radius=11,fill=(20,24,34,155),outline=rgba(accent,140),width=1)
    d.text((45,40),phase,font=fphase,fill=(247,248,252,245))
    d.text((31,678),f'SPELL_{card_no:03d}',font=fcode,fill=(245,245,250,220))
    im.convert('RGB').save(OUT/f'v34_cycle_spell_{card_no:03d}.webp','WEBP',quality=88,method=6)

if __name__=='__main__':
    for n in range(1,41): render(n)
    print('Generated 40 abstract spell artworks with no character silhouette.')
