#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math, random, hashlib

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'card-art'
W, H = 720, 480

LEGENDARIES = [
    # Chronorium
    dict(id='v26_chronorium_unit_21', name='크로노리움 크로노스 레갈리아', kind='unit', palette='storm', bg='clockstorm', scene='clock_king'),
    dict(id='v26_chronorium_unit_22', name='크로노리움 제로월드 아비터', kind='unit', palette='neutral', bg='clockvoid', scene='clock_judge'),
    dict(id='v26_chronorium_spell_08', name='크로노리움 오더 - 최후시각 00:00', kind='spell', palette='storm', bg='clockstorm', scene='spell_final_clock'),
    dict(id='v26_chronorium_trap_06', name='크로노리움 리액터 - 파이널 카운트', kind='trap', palette='lunar', bg='clockvoid', scene='trap_countdown'),
    # Arcana Protocol
    dict(id='v26_arcana_protocol_unit_21', name='아르카나 프로토콜 그랜드 마기스터', kind='unit', palette='neutral', bg='arcana', scene='grand_magister'),
    dict(id='v26_arcana_protocol_unit_22', name='아르카나 프로토콜 프로토콜 오메가', kind='unit', palette='lunar', bg='arcana', scene='protocol_omega'),
    dict(id='v26_arcana_protocol_spell_08', name='아르카나 프로토콜 오더 - 금단규약 제13식', kind='spell', palette='neutral', bg='arcana', scene='spell_forbidden_formula'),
    dict(id='v26_arcana_protocol_trap_06', name='아르카나 프로토콜 리액터 - 금서 봉인진', kind='trap', palette='void', bg='arcana_void', scene='trap_book_seal'),
    # Beastforge
    dict(id='v26_beastforge_unit_21', name='비스트포지 비스트 카이저', kind='unit', palette='neutral', bg='forge', scene='beast_kaiser'),
    dict(id='v26_beastforge_unit_22', name='비스트포지 포지 레비아탄', kind='unit', palette='verdant', bg='forge', scene='forge_leviathan'),
    dict(id='v26_beastforge_spell_08', name='비스트포지 오더 - 비스트포지 오버클래드', kind='spell', palette='neutral', bg='forge', scene='spell_overclad'),
    dict(id='v26_beastforge_trap_06', name='비스트포지 리액터 - 카이저 하울링 월', kind='trap', palette='solar', bg='forge', scene='trap_howling_wall'),
    # Phantom Carnival
    dict(id='v26_phantom_carnival_unit_21', name='팬텀 카니발 팬텀 디렉터', kind='unit', palette='storm', bg='carnival', scene='phantom_director'),
    dict(id='v26_phantom_carnival_unit_22', name='팬텀 카니발 제로 스테이지 마스터', kind='unit', palette='void', bg='carnival_void', scene='zero_stage_master'),
    dict(id='v26_phantom_carnival_spell_08', name='팬텀 카니발 오더 - 그랜드 피날레', kind='spell', palette='storm', bg='carnival', scene='spell_grand_finale'),
    dict(id='v26_phantom_carnival_trap_06', name='팬텀 카니발 리액터 - 라스트 앙코르 함정', kind='trap', palette='lunar', bg='carnival_void', scene='trap_last_encore'),
    # Astral Armada
    dict(id='v26_astral_armada_unit_21', name='아스트라 아르마다 아르마다 소버린', kind='unit', palette='lunar', bg='astral', scene='astral_sovereign'),
    dict(id='v26_astral_armada_unit_22', name='아스트라 아르마다 세레스티얼 타이탄', kind='unit', palette='storm', bg='astral', scene='celestial_titan'),
    dict(id='v26_astral_armada_spell_08', name='아스트라 아르마다 오더 - 성해포격 오메가', kind='spell', palette='lunar', bg='astral', scene='spell_omega_bombardment'),
    dict(id='v26_astral_armada_trap_06', name='아스트라 아르마다 리액터 - 아르마다 최종방어선', kind='trap', palette='solar', bg='astral', scene='trap_final_defense'),
    # Premium Time
    dict(id='v41_premium_zenith_king', name='정점의 왕 솔라리온', kind='unit', palette='solar', bg='zenith', scene='zenith_king'),
    dict(id='v41_premium_dawn_lord', name='여명성녀 아우렐리아', kind='unit', palette='solar', bg='dawn', scene='dawn_priestess'),
    dict(id='v41_premium_eclipse_conductor', name='개기일식의 악사 모르덴', kind='unit', palette='void', bg='eclipse', scene='eclipse_conductor'),
    dict(id='v44_premium_twilight_knight', name='황혼의 검사 베스퍼', kind='unit', palette='lunar', bg='dusk', scene='twilight_knight'),
    dict(id='v41_premium_midnight_silence', name='심야의 무성 권역', kind='spell', palette='lunar', bg='midnight', scene='midnight_silence'),
    # Absolute premium
    dict(id='v60_premium_time_devourer', name='시간 탐식자 아이온', kind='unit', palette='void', bg='devourer', scene='time_devourer'),
]

PALETTE = {
    'solar':   dict(bg1=(14,10,26), bg2=(115,70,24), edge=(255,208,125), light=(255,241,211), mid=(230,190,109), dark=(18,18,38), extra=(255,138,84)),
    'lunar':   dict(bg1=(10,14,40), bg2=(35,44,108), edge=(193,188,255), light=(238,240,255), mid=(137,145,235), dark=(16,18,42), extra=(120,105,210)),
    'storm':   dict(bg1=(8,16,34), bg2=(16,72,100), edge=(118,236,255), light=(233,252,255), mid=(84,170,220), dark=(10,16,40), extra=(62,131,240)),
    'verdant': dict(bg1=(8,22,20), bg2=(30,92,48), edge=(123,224,159), light=(230,255,235), mid=(72,170,104), dark=(12,20,24), extra=(144,244,196)),
    'void':    dict(bg1=(18,8,30), bg2=(68,18,90), edge=(226,128,255), light=(245,230,255), mid=(156,82,210), dark=(18,10,26), extra=(255,104,188)),
    'neutral': dict(bg1=(10,14,24), bg2=(40,46,62), edge=(206,214,232), light=(245,248,255), mid=(130,142,168), dark=(18,22,32), extra=(145,160,182)),
}


def rng_for(s):
    return random.Random(int(hashlib.sha256(s.encode()).hexdigest()[:16], 16))


def rgba(c, a=255):
    return (int(c[0]), int(c[1]), int(c[2]), int(a))


def mix(a,b,t):
    return tuple(int(a[i]*(1-t)+b[i]*t) for i in range(3))


def circle(d,xy,fill=None,outline=None,width=1):
    d.ellipse(xy,fill=fill,outline=outline,width=width if outline else 1)


def poly(d,pts,fill=None,outline=None,width=1):
    d.polygon(pts, fill=fill)
    if outline:
        d.line(list(pts)+[pts[0]], fill=outline, width=width, joint='curve')


def line(d,pts,fill,width=1):
    d.line(pts, fill=fill, width=width, joint='curve')


def rrect(d,xy,r,fill=None,outline=None,width=1):
    d.rounded_rectangle(xy, radius=r, fill=fill, outline=outline, width=width if outline else 1)


def gradient(img, c1, c2):
    d=ImageDraw.Draw(img)
    for y in range(H):
        t=y/(H-1)
        c=mix(c1,c2,t)
        d.line((0,y,W,y), fill=c)


def field(img, card):
    pal=PALETTE[card['palette']]
    img = Image.new('RGBA', (W,H), pal['bg1']+(255,))
    gradient(img, pal['bg1'], pal['bg2'])
    d=ImageDraw.Draw(img, 'RGBA')
    mode=card['bg']
    rng=rng_for(card['id'])
    # universal stars
    for _ in range(150):
        x=rng.randint(0,W-1); y=rng.randint(0,int(H*0.82)); r=rng.choice([1,1,1,2])
        a=rng.randint(60,190)
        circle(d,(x-r,y-r,x+r,y+r),fill=rgba(pal['light'],a))
        if rng.random()<0.07:
            line(d,[(x-4,y),(x+4,y)],rgba(pal['light'],a//2),1)
            line(d,[(x,y-4),(x,y+4)],rgba(pal['light'],a//2),1)
    # glows
    for cx,cy,rr,col,a in [(W//2,110,180,pal['edge'],90),(W//2,340,240,pal['extra'],40),(130,380,120,pal['edge'],30),(590,380,120,pal['edge'],30)]:
        for r in range(rr,0,-14):
            aa=int(a*(r/rr)**2)
            d.ellipse((cx-r,cy-r,cx+r,cy+r), fill=rgba(col, aa))
    # theme background lines
    if 'clock' in mode or mode=='devourer':
        cx,cy=W//2,145
        for r,a in [(56,170),(92,130),(134,100),(184,70),(236,45)]:
            circle(d,(cx-r,cy-r,cx+r,cy+r),outline=rgba(pal['light'],a),width=2)
        for ang in range(0,360,30):
            rad=math.radians(ang)
            line(d,[(cx+math.cos(rad)*40,cy+math.sin(rad)*40),(cx+math.cos(rad)*236,cy+math.sin(rad)*236)],rgba(pal['edge'],70),1)
    if mode.startswith('arcana'):
        cx,cy=W//2,155
        for r,a in [(74,150),(124,110),(184,70)]:
            circle(d,(cx-r,cy-r,cx+r,cy+r),outline=rgba(pal['light'],a),width=2)
        for ang in range(0,360,45):
            rad=math.radians(ang)
            x,y=cx+math.cos(rad)*124, cy+math.sin(rad)*124
            poly(d,[(x,y-8),(x+8,y),(x,y+8),(x-8,y)],fill=rgba(pal['edge'],120))
        poly(d,[(cx,36),(cx+140,155),(cx,274),(cx-140,155)],outline=rgba(pal['edge'],90),width=2)
    if mode=='forge':
        for x in range(-40,W+80,120):
            line(d,[(x,0),(x+90,H)],rgba(pal['light'],28),3)
        for y in [90,180,270,360]:
            line(d,[(0,y),(W,y)],rgba(pal['extra'],18),2)
    if 'carnival' in mode:
        for x in range(60,W,90):
            line(d,[(x,0),(x,90)],rgba(pal['edge'],50),2)
        for y in [70,120,170]:
            pts=[]
            for i in range(9): pts.append((i*90, y + (10 if i%2 else -10)))
            line(d,pts,rgba(pal['light'],40),2)
        rrect(d,(70,55,W-70,210),22,outline=rgba(pal['light'],65),width=2)
    if mode=='astral':
        for x in [140,580]:
            line(d,[(x,20),(x+60,120),(x+30,220)],rgba(pal['edge'],55),2)
        for y in [110,170,230]:
            line(d,[(110,y),(610,y)],rgba(pal['light'],34),2)
        for x in [160,300,420,560]:
            line(d,[(x,110),(x,230)],rgba(pal['light'],28),1)
    if mode=='dawn':
        circle(d,(W//2-68,44,W//2+68,180),outline=rgba(pal['light'],180),width=3)
        for ang in range(0,360,30):
            rad=math.radians(ang)
            line(d,[(W//2+math.cos(rad)*76,112+math.sin(rad)*76),(W//2+math.cos(rad)*104,112+math.sin(rad)*104)],rgba(pal['edge'],140),2)
    if mode=='zenith':
        for y in [64,96,128,160,192]:
            line(d,[(120,y),(600,y)],rgba(pal['light'],55),2)
        circle(d,(W//2-54,52,W//2+54,160),outline=rgba(pal['light'],170),width=3)
        circle(d,(W//2-72,34,W//2+72,178),outline=rgba(pal['edge'],110),width=2)
    if mode=='dusk':
        circle(d,(W//2+128,72,W//2+208,152),outline=rgba(pal['light'],160),width=3)
        d.ellipse((W//2+144,72,W//2+224,152),fill=rgba((16,18,50),220))
        for i,r in enumerate([120,170,220]):
            circle(d,(W//2-r,140-r//2,W//2+r,140+r//2),outline=rgba(pal['edge'],90-i*20),width=2)
    if mode=='midnight':
        circle(d,(W//2+120,76,W//2+198,154),outline=rgba(pal['light'],180),width=3)
        d.ellipse((W//2+138,76,W//2+216,154),fill=rgba((8,10,28),230))
        for r in [80,128,176]:
            circle(d,(W//2-r,150-r,W//2+r,150+r),outline=rgba(pal['light'],80),width=2)
    if mode=='eclipse':
        circle(d,(W//2-48,58,W//2+48,154),outline=rgba(pal['light'],165),width=3)
        d.ellipse((W//2-18,58,W//2+78,154),fill=rgba((10,8,24),235))
        for ang in range(0,360,36):
            rad=math.radians(ang)
            line(d,[(W//2,106),(W//2+math.cos(rad)*116,106+math.sin(rad)*116)],rgba(pal['edge'],90),2)
    if mode=='devourer':
        for ang in range(0,360,24):
            rad=math.radians(ang)
            line(d,[(W//2,110),(W//2+math.cos(rad)*200,110+math.sin(rad)*160)],rgba(pal['edge'],55),1)
        for x in [130,590]:
            poly(d,[(x,52),(x+20,92),(x-12,92),(x+22,134),(x+4,118),(x+12,160)],fill=rgba(pal['extra'],90),outline=rgba(pal['light'],50),width=1)
    # floor
    d.ellipse((165,386,555,468), fill=rgba(mix(pal['bg2'],pal['dark'],0.3),140), outline=rgba(pal['light'],100), width=2)
    # corner frame
    for box in [(14,14,706,466),(28,28,692,452)]:
        rrect(d,box,24,outline=rgba(pal['light'],45 if box[0]==14 else 30),width=2)
    return img


def armor_colors(card):
    pal=PALETTE[card['palette']]
    return {
        'dark': rgba(mix(pal['dark'], (4,6,12), 0.22), 245),
        'mid': rgba(mix(pal['mid'], (50,56,74), 0.18), 242),
        'edge': rgba(pal['edge'], 230),
        'light': rgba(pal['light'], 225),
        'accent': rgba(pal['extra'], 200),
    }


def draw_head(d,cx,y,c,helm=False,crown=False,mask=False):
    circle(d,(cx-22,y-22,cx+22,y+22),fill=c['dark'],outline=c['edge'],width=3)
    if helm:
        line(d,[(cx-12,y),(cx+12,y)],c['light'],2)
    else:
        circle(d,(cx-12,y-4,cx+12,y+10),outline=c['light'],width=2)
    if crown:
        poly(d,[(cx-24,y-28),(cx-12,y-48),(cx-2,y-28),(cx+8,y-48),(cx+22,y-28),(cx+18,y-16),(cx-20,y-16)],fill=c['accent'],outline=c['light'],width=2)
    if mask:
        poly(d,[(cx-14,y-8),(cx,y-16),(cx+14,y-8),(cx+12,y+6),(cx,y+14),(cx-12,y+6)],fill=rgba((240,240,252),170),outline=c['edge'],width=2)


def draw_robes(d,cx,base,c,wide=1.0):
    w=110*wide
    poly(d,[(cx-w*0.2,base-216),(cx,base-260),(cx+w*0.2,base-216),(cx+w*0.44,base-42),(cx+w*0.38,base+18),(cx,base+28),(cx-w*0.38,base+18),(cx-w*0.44,base-42)],fill=c['dark'],outline=c['edge'],width=3)
    poly(d,[(cx-w*0.08,base-198),(cx,base-232),(cx+w*0.08,base-198),(cx+w*0.06,base-48),(cx-w*0.06,base-48)],fill=c['mid'],outline=c['light'],width=2)


def draw_armor(d,cx,base,c,wide=1.0):
    w=88*wide
    poly(d,[(cx-30,base-230),(cx+30,base-230),(cx+w,base-150),(cx+66,base-32),(cx+24,base+12),(cx-24,base+12),(cx-66,base-32),(cx-w,base-150)],fill=c['mid'],outline=c['edge'],width=3)
    poly(d,[(cx-18,base-214),(cx+18,base-214),(cx+34,base-164),(cx,base-132),(cx-34,base-164)],fill=rgba((255,255,255),45),outline=c['light'],width=2)
    poly(d,[(cx-82,base-176),(cx-52,base-162),(cx-56,base-120),(cx-92,base-136)],fill=c['dark'],outline=c['edge'],width=2)
    poly(d,[(cx+82,base-176),(cx+52,base-162),(cx+56,base-120),(cx+92,base-136)],fill=c['dark'],outline=c['edge'],width=2)


def draw_wings(d,cx,base,c):
    poly(d,[(cx-10,base-180),(cx-148,base-126),(cx-88,base-246)],fill=rgba(c['light'][:3],80),outline=c['edge'],width=2)
    poly(d,[(cx+10,base-180),(cx+148,base-126),(cx+88,base-246)],fill=rgba(c['light'][:3],80),outline=c['edge'],width=2)
    for side in (-1,1):
        for k in range(4):
            x1=cx+side*(18+k*18)
            x2=cx+side*(72+k*18)
            y1=base-176+k*8; y2=base-220+k*14
            line(d,[(x1,y1),(x2,y2)],rgba(c['light'][:3],120),2)


def draw_staff(d,x,y1,y2,c,head='ring'):
    line(d,[(x,y1),(x,y2)],c['edge'],4)
    if head=='ring':
        circle(d,(x-18,y1-18,x+18,y1+18),outline=c['light'],width=3)
        circle(d,(x-8,y1-8,x+8,y1+8),fill=c['accent'],outline=c['light'],width=2)
    elif head=='cross':
        line(d,[(x-18,y1),(x+18,y1)],c['light'],3)
        line(d,[(x,y1-18),(x,y1+18)],c['light'],3)
    elif head=='spear':
        poly(d,[(x,y1-24),(x-12,y1),(x+12,y1)],fill=c['light'],outline=c['edge'],width=2)
    elif head=='note':
        circle(d,(x-14,y1-6,x+6,y1+14),fill=c['accent'],outline=c['light'],width=2)
        line(d,[(x+4,y1-34),(x+4,y1+4)],c['light'],3)
        line(d,[(x+4,y1-34),(x+24,y1-24)],c['light'],2)


def unit_dawn_priestess(d, card):
    c=armor_colors(card); cx=360; base=382
    draw_wings(d,cx,base,c); draw_robes(d,cx,base,c,1.06); draw_head(d,cx,base-248,c,crown=True)
    draw_staff(d,cx+116,base-268,base+18,c,'ring')
    circle(d,(cx-36,base-286,cx+36,base-214),outline=c['light'],width=3)
    line(d,[(cx-82,base-164),(cx-138,base-104)],c['edge'],6)
    line(d,[(cx+72,base-162),(cx+120,base-118)],c['edge'],6)
    circle(d,(cx,base-130,cx+0,base-130),fill=c['accent'])


def unit_zenith_king(d, card):
    c=armor_colors(card); cx=360; base=385
    draw_armor(d,cx,base,c,1.1); draw_head(d,cx,base-248,c,helm=True,crown=True)
    # royal mantle
    poly(d,[(cx-48,base-212),(cx+48,base-212),(cx+118,base-120),(cx+64,base+22),(cx,base+36),(cx-64,base+22),(cx-118,base-120)],fill=rgba(c['dark'][:3],155),outline=c['edge'],width=2)
    draw_staff(d,cx+134,base-262,base+16,c,'spear')
    # throne arc
    rrect(d,(cx-110,base-162,cx+110,base+18),28,outline=rgba(c['light'][:3],120),width=2)
    for y in [base-130,base-96,base-62]: line(d,[(cx-92,y),(cx+92,y)],rgba(c['light'][:3],70),2)


def unit_twilight_knight(d, card):
    c=armor_colors(card); cx=360; base=388
    draw_armor(d,cx,base,c); draw_head(d,cx,base-248,c,helm=True)
    poly(d,[(cx-90,base-214),(cx+26,base-214),(cx+78,base-50),(cx,base+20),(cx-100,base-18)],fill=rgba(c['dark'][:3],190),outline=c['edge'],width=2)
    line(d,[(cx+94,base-164),(cx+190,base-254)],c['light'],5)
    line(d,[(cx+80,base-152),(cx+110,base-172)],c['edge'],3)
    line(d,[(cx-84,base-160),(cx-136,base-124)],c['edge'],6)
    # dusk ribbon slash
    line(d,[(144,300),(612,176)],rgba(c['accent'][:3],115),5)


def unit_eclipse_conductor(d, card):
    c=armor_colors(card); cx=360; base=386
    draw_robes(d,cx,base,c,1.0); draw_head(d,cx,base-246,c,mask=True)
    # instrument body + strings
    circle(d,(cx-42,base-172,cx+20,base-112),fill=c['mid'],outline=c['light'],width=3)
    line(d,[(cx+6,base-164),(cx+124,base-220)],c['edge'],5)
    for off in [-12,-4,4,12]: line(d,[(cx-6+off,base-168),(cx+12+off,base-116)],c['light'],1)
    # musical staff
    for y in [-244,-220,-196,-172]:
        pts=[(92,base+y),(190,base+y+4),(288,base+y-2),(384,base+y+6),(480,base+y-4),(586,base+y+2)]
        line(d,pts,rgba(c['light'][:3],80),2)
    draw_staff(d,cx+138,base-260,base+8,c,'note')


def unit_time_devourer(d, card):
    c=armor_colors(card); cx=360; base=386
    # body as maw cloak
    poly(d,[(cx-26,base-264),(cx+26,base-264),(cx+108,base-156),(cx+84,base-36),(cx+20,base+16),(cx-20,base+16),(cx-84,base-36),(cx-108,base-156)],fill=c['dark'],outline=c['edge'],width=4)
    circle(d,(cx-38,base-246,cx+38,base-170),fill=rgba((10,6,18),230),outline=c['light'],width=3)
    # teeth
    for x in [-24,-8,8,24]: poly(d,[(cx+x,base-176),(cx+x-8,base-154),(cx+x+8,base-154)],fill=c['light'])
    for x in [-24,-8,8,24]: poly(d,[(cx+x,base-240),(cx+x-8,base-260),(cx+x+8,base-260)],fill=c['light'])
    # clock hands and orbit shards
    line(d,[(cx,base-208),(cx,base-270)],c['light'],3)
    line(d,[(cx,base-208),(cx+44,base-182)],c['accent'],3)
    for ang in range(0,360,45):
        rad=math.radians(ang)
        x=cx+math.cos(rad)*122; y=base-208+math.sin(rad)*82
        poly(d,[(x,y-12),(x+12,y),(x,y+12),(x-12,y)],fill=rgba(c['accent'][:3],120),outline=c['edge'],width=1)
    line(d,[(cx-72,base-168),(cx-148,base-118)],c['edge'],7)
    line(d,[(cx+72,base-168),(cx+148,base-112)],c['edge'],7)


def unit_clock_king(d, card):
    c=armor_colors(card); cx=360; base=386
    draw_armor(d,cx,base,c,1.05); draw_head(d,cx,base-248,c,helm=True,crown=True)
    draw_staff(d,cx+126,base-262,base+10,c,'spear')
    for r in [28,48,68]: circle(d,(cx-r,base-250-r,cx+r,base-250+r),outline=rgba(c['light'][:3],80),width=2)
    line(d,[(cx-86,base-156),(cx-148,base-96)],c['edge'],6)


def unit_clock_judge(d, card):
    c=armor_colors(card); cx=360; base=386
    draw_armor(d,cx,base,c); draw_head(d,cx,base-248,c,helm=True)
    # scales
    line(d,[(cx+126,base-256),(cx+126,base-114)],c['light'],4)
    line(d,[(cx+96,base-224),(cx+156,base-224)],c['light'],3)
    for dx in [-22,22]:
        line(d,[(cx+126+dx,base-224),(cx+126+dx,base-176)],c['light'],2)
        circle(d,(cx+126+dx-20,base-162,cx+126+dx+20,base-136),outline=c['edge'],width=2)
    line(d,[(cx-82,base-156),(cx-140,base-108)],c['edge'],6)


def unit_grand_magister(d, card):
    c=armor_colors(card); cx=360; base=384
    draw_robes(d,cx,base,c,1.08); draw_head(d,cx,base-248,c,crown=True)
    rrect(d,(cx-136,base-188,cx-64,base-128),10,fill=c['mid'],outline=c['light'],width=3)
    line(d,[(cx-100,base-186),(cx-100,base-130)],c['light'],1)
    draw_staff(d,cx+124,base-264,base+10,c,'ring')
    for ang in range(0,360,60):
        rad=math.radians(ang); x=cx+110+math.cos(rad)*30; y=base-194+math.sin(rad)*30
        line(d,[(cx+110,base-194),(x,y)],rgba(c['edge'][:3],130),1)


def unit_protocol_omega(d, card):
    c=armor_colors(card); cx=360; base=386
    # angular body
    poly(d,[(cx-30,base-250),(cx+30,base-250),(cx+78,base-170),(cx+60,base-30),(cx,base+24),(cx-60,base-30),(cx-78,base-170)],fill=c['mid'],outline=c['edge'],width=4)
    poly(d,[(cx-18,base-214),(cx+18,base-214),(cx+26,base-170),(cx,base-138),(cx-26,base-170)],fill=rgba((255,255,255),45),outline=c['light'],width=2)
    circle(d,(cx-18,base-246,cx+18,base-210),fill=c['dark'],outline=c['light'],width=2)
    line(d,[(cx-10,base-228),(cx+10,base-228)],c['light'],2)
    line(d,[(cx-74,base-164),(cx-154,base-106)],c['edge'],6)
    line(d,[(cx+74,base-164),(cx+154,base-106)],c['edge'],6)
    for gx in [-96,96]:
        circle(d,(cx+gx-18,base-196,cx+gx+18,base-160),outline=c['light'],width=2)
        for ang in range(0,360,60):
            rad=math.radians(ang); line(d,[(cx+gx,base-178),(cx+gx+math.cos(rad)*18,base-178+math.sin(rad)*18)],c['edge'],1)


def unit_beast_kaiser(d, card):
    c=armor_colors(card); cx=350; cy=250
    poly(d,[(cx-154,cy+44),(cx-80,cy-8),(cx+14,cy-54),(cx+116,cy-20),(cx+164,cy+30),(cx+120,cy+64),(cx-20,cy+70)],fill=c['dark'],outline=c['edge'],width=4)
    circle(d,(cx+40,cy-76,cx+152,cy+16),outline=c['light'],width=3)
    line(d,[(cx-154,cy+44),(cx-222,cy+10)],c['light'],3)
    for lx in [-74,-10,58,118]: line(d,[(cx+lx,cy+40),(cx+lx,cy+130)],c['edge'],5)
    circle(d,(cx+92,cy-18,cx+108,cy-2),fill=c['light'])
    # crown mane spikes
    for ox in [42,62,82,102,122]: poly(d,[(cx+ox,cy-78),(cx+ox+8,cy-104),(cx+ox+16,cy-76)],fill=c['accent'])


def unit_forge_leviathan(d, card):
    c=armor_colors(card)
    pts=[(110,308),(182,256),(272,228),(366,226),(456,246),(556,206),(632,164)]
    line(d,pts,c['edge'],18)
    line(d,pts,rgba(c['dark'][:3],230),12)
    # body plates
    for x,y in pts[1:-1]:
        poly(d,[(x-18,y-18),(x+18,y-10),(x+10,y+18),(x-24,y+10)],fill=c['mid'],outline=c['light'],width=2)
    # head
    poly(d,[(590,190),(652,160),(672,180),(646,210),(592,212)],fill=c['dark'],outline=c['edge'],width=3)
    circle(d,(620,180,636,196),fill=c['light'])
    for i in range(4): poly(d,[(610+i*12,155),(616+i*12,138),(624+i*12,156)],fill=c['light'])


def unit_phantom_director(d, card):
    c=armor_colors(card); cx=360; base=386
    draw_robes(d,cx,base,c); draw_head(d,cx,base-250,c,mask=True)
    # top hat
    rrect(d,(cx-34,base-286,cx+34,base-262),6,fill=c['dark'],outline=c['light'],width=2)
    rrect(d,(cx-20,base-322,cx+20,base-286),4,fill=c['dark'],outline=c['edge'],width=2)
    draw_staff(d,cx+126,base-262,base+6,c,'cross')
    line(d,[(cx-88,base-160),(cx-162,base-112)],c['edge'],6)
    for i,x in enumerate([220,290,430,500]):
        line(d,[(x,36),(x+((i%2)*8-4),110)],rgba(c['light'][:3],70),2)
        circle(d,(x-8,110,x+8,126),fill=rgba(c['accent'][:3],90))


def unit_zero_stage_master(d, card):
    c=armor_colors(card); cx=360; base=386
    draw_robes(d,cx,base,c,1.02); draw_head(d,cx,base-250,c,mask=True,crown=True)
    # stage curtains
    poly(d,[(110,76),(180,76),(156,210),(124,210)],fill=rgba(c['accent'][:3],70),outline=c['edge'],width=2)
    poly(d,[(610,76),(540,76),(564,210),(596,210)],fill=rgba(c['accent'][:3],70),outline=c['edge'],width=2)
    # marionette cross
    line(d,[(cx+132,base-250),(cx+132,base-120)],c['light'],3)
    line(d,[(cx+98,base-220),(cx+166,base-220)],c['light'],2)
    for dx in [-20,20]: line(d,[(cx+132+dx,base-220),(cx+132+dx,base-162)],c['light'],1)


def unit_astral_sovereign(d, card):
    c=armor_colors(card); cx=360; base=386
    draw_armor(d,cx,base,c); draw_head(d,cx,base-248,c,helm=True,crown=True)
    draw_staff(d,cx+120,base-264,base+10,c,'spear')
    # ship hull behind
    poly(d,[(178,336),(278,292),(442,292),(542,336),(442,362),(278,362)],fill=rgba(c['mid'][:3],85),outline=rgba(c['light'][:3],100),width=2)
    for x in [280,330,390,440]: line(d,[(x,298),(x,356)],rgba(c['light'][:3],80),1)


def unit_celestial_titan(d, card):
    c=armor_colors(card); cx=360; base=390
    poly(d,[(cx-56,base-264),(cx+56,base-264),(cx+108,base-170),(cx+84,base-22),(cx+26,base+18),(cx-26,base+18),(cx-84,base-22),(cx-108,base-170)],fill=c['mid'],outline=c['edge'],width=4)
    poly(d,[(cx-28,base-222),(cx+28,base-222),(cx+42,base-174),(cx,base-138),(cx-42,base-174)],fill=rgba((255,255,255),55),outline=c['light'],width=2)
    circle(d,(cx-20,base-250,cx+20,base-210),fill=c['dark'],outline=c['light'],width=2)
    line(d,[(cx-10,base-232),(cx+10,base-232)],c['light'],2)
    # massive arms
    poly(d,[(cx-170,base-168),(cx-110,base-154),(cx-94,base-60),(cx-176,base-46)],fill=c['dark'],outline=c['edge'],width=3)
    poly(d,[(cx+170,base-168),(cx+110,base-154),(cx+94,base-60),(cx+176,base-46)],fill=c['dark'],outline=c['edge'],width=3)
    for sx in [-1,1]:
        circle(d,(cx+sx*110-20,base-196,cx+sx*110+20,base-156),outline=c['light'],width=2)


def spell_magic_core(d,cx,cy,c):
    for r,a in [(44,180),(84,140),(126,90)]: circle(d,(cx-r,cy-r,cx+r,cy+r),outline=rgba(c['light'][:3],a),width=2)
    for ang in range(0,360,30):
        rad=math.radians(ang)
        line(d,[(cx+math.cos(rad)*36,cy+math.sin(rad)*36),(cx+math.cos(rad)*126,cy+math.sin(rad)*126)],rgba(c['edge'][:3],80),1)


def spell_final_clock(d, card):
    c=armor_colors(card); cx=360; cy=236
    spell_magic_core(d,cx,cy,c)
    for r in [34,68,102]: circle(d,(cx-r,cy-r,cx+r,cy+r),outline=c['light'],width=2)
    line(d,[(cx,cy),(cx,cy-82)],c['light'],4)
    line(d,[(cx,cy),(cx+64,cy+26)],c['accent'],3)
    for x in [cx-18,cx,cx+18]: line(d,[(x,cy-102),(x,cy-132)],c['light'],2)


def trap_countdown(d, card):
    c=armor_colors(card); cx=360; cy=236
    poly(d,[(cx,cy-122),(cx+122,cy),(cx,cy+122),(cx-122,cy)],fill=rgba(c['dark'][:3],160),outline=c['edge'],width=3)
    for ang in range(0,360,30):
        rad=math.radians(ang)
        line(d,[(cx+math.cos(rad)*54,cy+math.sin(rad)*54),(cx+math.cos(rad)*114,cy+math.sin(rad)*114)],c['light'],2)
    circle(d,(cx-42,cy-42,cx+42,cy+42),outline=c['light'],width=3)
    line(d,[(cx-86,cy-86),(cx+86,cy+86)],c['accent'],4)


def spell_forbidden_formula(d, card):
    c=armor_colors(card); cx=360; cy=236
    spell_magic_core(d,cx,cy,c)
    poly(d,[(cx,cy-108),(cx+102,cy),(cx,cy+108),(cx-102,cy)],outline=c['edge'],width=3)
    poly(d,[(cx,cy-70),(cx+68,cy),(cx,cy+70),(cx-68,cy)],outline=c['light'],width=2)
    for off in [(-44,-28),(52,-20),(-10,52)]:
        x,y=cx+off[0],cy+off[1]
        poly(d,[(x,y-18),(x+18,y),(x,y+18),(x-18,y)],fill=rgba(c['accent'][:3],95),outline=c['light'],width=2)


def trap_book_seal(d, card):
    c=armor_colors(card); cx=360; cy=236
    spell_magic_core(d,cx,cy,c)
    rrect(d,(cx-54,cy-92,cx+54,cy+64),18,fill=rgba(c['accent'][:3],55),outline=c['light'],width=3)
    line(d,[(cx-18,cy-12),(cx+4,cy+14),(cx+32,cy-24)],c['light'],4)
    # chains
    for x in [cx-78,cx+78]:
        for yy in range(cy-70,cy+70,16): circle(d,(x-5,yy-5,x+5,yy+5),outline=c['edge'],width=2)


def spell_overclad(d, card):
    c=armor_colors(card); cx=360; cy=236
    spell_magic_core(d,cx,cy,c)
    poly(d,[(cx-48,cy-98),(cx+48,cy-98),(cx+104,cy-26),(cx+60,cy+74),(cx-60,cy+74),(cx-104,cy-26)],fill=rgba(c['mid'][:3],70),outline=c['light'],width=3)
    circle(d,(cx-14,cy-34,cx+14,cy-6),fill=c['accent'],outline=c['light'],width=2)
    for x in [cx-136,cx+136]: line(d,[(x,cy-90),(x*0.84+cx*0.16,cy-22)],c['edge'],3)


def trap_howling_wall(d, card):
    c=armor_colors(card); cx=360; cy=236
    poly(d,[(cx,cy-120),(cx+126,cy),(cx,cy+120),(cx-126,cy)],fill=rgba(c['mid'][:3],70),outline=c['light'],width=3)
    # central roaring maw
    circle(d,(cx-56,cy-56,cx+56,cy+56),fill=rgba(c['dark'][:3],180),outline=c['edge'],width=3)
    for x in [-34,-12,12,34]: poly(d,[(cx+x,cy-6),(cx+x-8,cy+16),(cx+x+8,cy+16)],fill=c['light'])
    for x in [-34,-12,12,34]: poly(d,[(cx+x,cy-50),(cx+x-8,cy-72),(cx+x+8,cy-72)],fill=c['light'])


def spell_grand_finale(d, card):
    c=armor_colors(card); cx=360; cy=236
    # stage and fireworks
    for y in [170,194,218,242]: line(d,[(112,y),(608,y)],rgba(c['light'][:3],95),2)
    for ang in range(0,360,30):
        rad=math.radians(ang)
        line(d,[(cx,cy),(cx+math.cos(rad)*118,cy+math.sin(rad)*118)],rgba(c['edge'][:3],120),2)
    circle(d,(cx-40,cy-40,cx+40,cy+40),outline=c['light'],width=3)
    for x in [180,540]:
        for ang in range(0,360,45):
            rad=math.radians(ang); line(d,[(x,140),(x+math.cos(rad)*42,140+math.sin(rad)*42)],rgba(c['accent'][:3],130),2)


def trap_last_encore(d, card):
    c=armor_colors(card); cx=360; cy=236
    poly(d,[(100,76),(190,76),(168,220),(124,220)],fill=rgba(c['accent'][:3],85),outline=c['light'],width=2)
    poly(d,[(620,76),(530,76),(552,220),(596,220)],fill=rgba(c['accent'][:3],85),outline=c['light'],width=2)
    spell_magic_core(d,cx,cy,c)
    line(d,[(cx-90,cy-84),(cx+90,cy+84)],c['light'],4)
    line(d,[(cx-90,cy+84),(cx+90,cy-84)],c['light'],4)


def spell_omega_bombardment(d, card):
    c=armor_colors(card); cx=360; cy=236
    spell_magic_core(d,cx,cy,c)
    for x in [220,300,420,500]:
        poly(d,[(x,310),(x+18,238),(x+42,238),(x+24,310)],fill=rgba(c['mid'][:3],90),outline=c['light'],width=2)
        line(d,[(x+24,238),(cx,cy-12)],c['edge'],3)
    circle(d,(cx-28,cy-28,cx+28,cy+28),fill=rgba(c['accent'][:3],100),outline=c['light'],width=2)


def trap_final_defense(d, card):
    c=armor_colors(card); cx=360; cy=236
    for y in [174,214,254,294]: line(d,[(132,y),(588,y)],rgba(c['light'][:3],80),2)
    for x in [180,260,340,420,500,580]: line(d,[(x,154),(x,314)],rgba(c['edge'][:3],70),2)
    rrect(d,(cx-52,cy-82,cx+52,cy+60),18,fill=rgba(c['mid'][:3],60),outline=c['light'],width=3)
    line(d,[(cx-18,cy-12),(cx+2,cy+14),(cx+28,cy-22)],c['light'],4)


def spell_midnight_silence(d, card):
    c=armor_colors(card); cx=360; cy=236
    # orbital silence zone
    for r,a in [(30,170),(58,150),(88,120),(118,85),(148,55)]: circle(d,(cx-r,cy-r,cx+r,cy+r),outline=rgba(c['light'][:3],a),width=2)
    line(d,[(cx,cy-148),(cx,cy+148)],rgba(c['light'][:3],80),2)
    line(d,[(cx-146,cy),(cx+146,cy)],rgba(c['edge'][:3],60),1)
    # mute sigil
    circle(d,(cx-22,cy-22,cx+22,cy+22),fill=rgba(c['dark'][:3],200),outline=c['light'],width=2)
    line(d,[(cx-10,cy-10),(cx+10,cy+10)],c['accent'],3)
    line(d,[(cx-10,cy+10),(cx+10,cy-10)],c['accent'],3)
    # small moon
    circle(d,(500,120,568,188),outline=c['light'],width=3)
    d.ellipse((518,120,586,188),fill=rgba((8,10,28),235))

SCENE_FN = {
    'dawn_priestess': unit_dawn_priestess,
    'zenith_king': unit_zenith_king,
    'twilight_knight': unit_twilight_knight,
    'eclipse_conductor': unit_eclipse_conductor,
    'time_devourer': unit_time_devourer,
    'clock_king': unit_clock_king,
    'clock_judge': unit_clock_judge,
    'grand_magister': unit_grand_magister,
    'protocol_omega': unit_protocol_omega,
    'beast_kaiser': unit_beast_kaiser,
    'forge_leviathan': unit_forge_leviathan,
    'phantom_director': unit_phantom_director,
    'zero_stage_master': unit_zero_stage_master,
    'astral_sovereign': unit_astral_sovereign,
    'celestial_titan': unit_celestial_titan,
    'spell_final_clock': spell_final_clock,
    'trap_countdown': trap_countdown,
    'spell_forbidden_formula': spell_forbidden_formula,
    'trap_book_seal': trap_book_seal,
    'spell_overclad': spell_overclad,
    'trap_howling_wall': trap_howling_wall,
    'spell_grand_finale': spell_grand_finale,
    'trap_last_encore': trap_last_encore,
    'spell_omega_bombardment': spell_omega_bombardment,
    'trap_final_defense': trap_final_defense,
    'midnight_silence': spell_midnight_silence,
}


def render(card):
    img = field(None, card)
    d=ImageDraw.Draw(img, 'RGBA')
    SCENE_FN[card['scene']](d, card)
    # sparkles overlay for finish
    pal=PALETTE[card['palette']]
    fx=Image.new('RGBA',(W,H),(0,0,0,0))
    fd=ImageDraw.Draw(fx,'RGBA')
    rng=rng_for(card['id']+'fx')
    for _ in range(24):
        x=rng.randint(50,W-50); y=rng.randint(40,H-60)
        line(fd,[(x-4,y),(x+4,y)],rgba(pal['light'],110),1)
        line(fd,[(x,y-4),(x,y+4)],rgba(pal['light'],110),1)
    fx=fx.filter(ImageFilter.GaussianBlur(0.4))
    img=Image.alpha_composite(img, fx)
    return img.convert('RGB')


def preview(paths):
    thumbs=[]
    for p in paths:
        im=Image.open(p).convert('RGB').resize((220,146))
        canvas=Image.new('RGB',(236,194),(10,14,24))
        canvas.paste(im,(8,8))
        d=ImageDraw.Draw(canvas)
        d.text((8,160), p.stem, fill=(244,247,255))
        thumbs.append(canvas)
    cols=3; rows=(len(thumbs)+cols-1)//cols
    sheet=Image.new('RGB',(cols*236,rows*194),(6,8,16))
    for i,im in enumerate(thumbs):
        sheet.paste(im,((i%cols)*236,(i//cols)*194))
    sheet.save(ROOT/'docs/LEGENDARY_PREVIEW.jpg', quality=90)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    out_paths=[]
    for card in LEGENDARIES:
        p=OUT/f"{card['id']}.webp"
        render(card).save(p, 'WEBP', quality=92, method=6)
        out_paths.append(p)
    preview(out_paths[:15] + out_paths[20:])
    # docs
    lines=['id,name,kind']+[f"{c['id']},{c['name']},{c['kind']}" for c in LEGENDARIES]
    (ROOT/'docs/LEGENDARY_PATCH_SUMMARY.csv').write_text('\n'.join(lines), encoding='utf-8')
    (ROOT/'docs/PATCH_SCOPE.txt').write_text(
        '전설 등급 카드(unit/spell/trap)만 이름/일러스트를 교체한 패치입니다.\n'
        '포함 카드: v26 시리즈 전설 20장 + premium time 5장 + time devourer 1장 = 총 26장.\n'
        '이 패치에는 public/card-art/* 대상 카드 26장, app/game-data.ts, app/v41-premium-time-cards.ts, scripts/generate_legendary_art_patch.py 가 포함됩니다.\n'
        , encoding='utf-8')
    print('generated', len(out_paths))

if __name__ == '__main__':
    main()
