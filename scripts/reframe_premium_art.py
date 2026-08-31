from PIL import Image, ImageDraw, ImageFilter
from pathlib import Path
import math

BASE = Path(__file__).resolve().parents[1]
ART = BASE / 'public' / 'card-art'

# This script deliberately edits the EXISTING AODX premium art rather than
# generating a new art style. Background/orbit art is preserved; only the
# central unit silhouette (or spell seal) is strengthened.

def S(v): return int(round(v*2))

def load2(name):
    img = Image.open(ART / name).convert('RGBA')
    return img.resize((img.width*2, img.height*2), Image.Resampling.LANCZOS)

def save1(img, name):
    img = img.resize((960, 640), Image.Resampling.LANCZOS).convert('RGB')
    img.save(ART / name, 'WEBP', quality=92, method=6)

def poly(d, pts, fill, outline=None, width=1):
    pts=[(S(x),S(y)) for x,y in pts]
    d.polygon(pts, fill=fill)
    if outline:
        d.line(pts+[pts[0]], fill=outline, width=S(width), joint='curve')

def ellipse(d, box, fill, outline=None, width=1):
    box=tuple(S(x) for x in box)
    d.ellipse(box, fill=fill, outline=outline, width=S(width) if outline else 1)

def line(d, pts, fill, width):
    d.line([(S(x),S(y)) for x,y in pts], fill=fill, width=S(width), joint='curve')

# --- 쌍월검사 베스퍼 -------------------------------------------------------
def twilight():
    name='v44_premium_twilight_knight.webp'
    img=load2(name)
    d=ImageDraw.Draw(img, 'RGBA')
    # Large cloak first, so the body reads clearly against the existing moons.
    poly(d, [(355,300),(410,240),(480,220),(550,242),(605,302),(645,565),(530,520),(480,585),(425,520),(315,565)],
         (24,18,39,235), (107,76,149,230), 3)
    # legs
    poly(d, [(426,430),(474,430),(463,585),(405,590)], (35,29,53,255), (128,95,173,235), 2)
    poly(d, [(486,430),(534,430),(555,590),(497,585)], (35,29,53,255), (128,95,173,235), 2)
    # torso + armor
    poly(d, [(402,265),(445,232),(515,232),(558,265),(535,430),(425,430)], (48,38,69,255), (154,112,205,245), 3)
    poly(d, [(422,282),(480,252),(538,282),(515,350),(445,350)], (66,48,94,240), (183,135,236,220), 2)
    # shoulder plates
    poly(d, [(396,270),(441,246),(425,310),(376,322)], (72,54,101,245), (169,124,220,235), 2)
    poly(d, [(564,270),(519,246),(535,310),(584,322)], (72,54,101,245), (169,124,220,235), 2)
    # arms
    poly(d, [(390,303),(425,315),(390,430),(354,420)], (42,34,61,255), (139,101,190,225), 2)
    poly(d, [(570,303),(535,315),(570,430),(606,420)], (42,34,61,255), (139,101,190,225), 2)
    # head / helmet
    ellipse(d, (438,165,522,247), (30,24,44,255), (175,132,229,245), 3)
    poly(d, [(445,185),(480,150),(515,185),(507,225),(480,241),(453,225)], (40,30,58,255), (187,144,240,240), 2)
    poly(d, [(468,173),(480,139),(492,173)], (91,65,127,255), (213,173,255,235), 2)
    # visor highlight
    line(d, [(459,203),(501,203)], (198,159,255,230), 3)
    # belt/chest emblem
    ellipse(d,(464,337,496,369),(20,15,34,255),(199,159,255,240),2)
    # two swords, kept outside the face/body as much as possible
    line(d, [(350,505),(590,190)], (213,190,255,255), 11)
    line(d, [(610,505),(370,190)], (148,204,255,255), 11)
    line(d, [(350,505),(590,190)], (255,248,255,205), 3)
    line(d, [(610,505),(370,190)], (238,250,255,190), 3)
    save1(img,name)

# --- 여명성녀 아우렐리아 ---------------------------------------------------
def dawn():
    name='v41_premium_dawn_lord.webp'
    img=load2(name)
    d=ImageDraw.Draw(img, 'RGBA')
    gold=(236,203,123,245); pale=(255,239,193,225)
    # broad robe, full body clearly visible
    poly(d, [(387,282),(425,235),(480,220),(535,235),(573,282),(642,585),(520,552),(480,600),(440,552),(318,585)],
         (42,36,57,245), (159,127,104,235), 3)
    # inner robe
    poly(d, [(430,300),(480,262),(530,300),(515,550),(445,550)], (58,48,70,245), gold, 2)
    # shoulders / mantle
    poly(d, [(382,282),(436,242),(455,304),(400,330)], (66,53,74,245), gold, 2)
    poly(d, [(578,282),(524,242),(505,304),(560,330)], (66,53,74,245), gold, 2)
    # head + hair/veil
    ellipse(d,(441,157,519,238),(41,34,51,255),gold,3)
    poly(d, [(442,192),(423,258),(463,244),(480,220),(497,244),(537,258),(518,192)], (72,58,73,225), pale, 2)
    # crown/halo mark
    ellipse(d,(424,143,536,255),(0,0,0,0),gold,3)
    line(d,[(480,135),(480,160)],pale,4)
    # arms open
    poly(d, [(399,315),(430,329),(334,410),(305,392)], (48,40,61,255), gold, 2)
    poly(d, [(561,315),(530,329),(626,410),(655,392)], (48,40,61,255), gold, 2)
    ellipse(d,(293,382,318,407),(92,75,82,255),pale,2)
    ellipse(d,(642,382,667,407),(92,75,82,255),pale,2)
    # vertical staff on right side, not over body
    line(d,[(678,180),(678,555)],gold,8)
    ellipse(d,(655,155,701,201),(0,0,0,0),pale,4)
    line(d,[(678,154),(678,130)],pale,4)
    # chest sun emblem
    ellipse(d,(458,305,502,349),(24,18,34,255),gold,3)
    for a in range(0,360,45):
        r1,r2=25,38
        cx,cy=480,327
        p1=(cx+math.cos(math.radians(a))*r1,cy+math.sin(math.radians(a))*r1)
        p2=(cx+math.cos(math.radians(a))*r2,cy+math.sin(math.radians(a))*r2)
        line(d,[p1,p2],pale,2)
    save1(img,name)

# --- 흑일악사 모르덴 -------------------------------------------------------
def eclipse():
    name='v41_premium_eclipse_conductor.webp'
    img=load2(name)
    d=ImageDraw.Draw(img, 'RGBA')
    gold=(230,199,114,245); purple=(116,74,139,235)
    # coat/cape full body
    poly(d, [(365,300),(412,245),(480,224),(548,245),(595,300),(635,570),(532,525),(480,590),(428,525),(325,570)],
         (24,20,34,248), purple, 3)
    # torso
    poly(d, [(408,274),(451,245),(509,245),(552,274),(530,430),(430,430)], (38,30,48,255), gold, 2)
    # head with broad musician hat; face remains visible as a silhouette
    ellipse(d,(441,165,519,240),(25,20,31,255),gold,2)
    poly(d,[(420,178),(480,145),(540,178),(525,194),(435,194)],(35,26,43,255),gold,2)
    poly(d,[(462,145),(480,116),(498,145)],(49,33,59,255),purple,2)
    # eyes / mask
    line(d,[(455,208),(475,204)],(211,158,238,220),3)
    line(d,[(485,204),(505,208)],(211,158,238,220),3)
    # arms around instrument
    poly(d,[(403,310),(438,326),(465,401),(430,418)],(32,25,42,255),purple,2)
    poly(d,[(557,310),(522,326),(493,398),(528,418)],(32,25,42,255),purple,2)
    # instrument body and neck (obvious '악사')
    ellipse(d,(432,342,523,447),(59,40,68,255),gold,3)
    ellipse(d,(458,369,496,407),(17,13,24,255),purple,2)
    line(d,[(500,360),(622,257)],gold,10)
    line(d,[(500,360),(622,257)],(255,231,164,180),3)
    for off in (-7,-2,3,8):
        line(d,[(463+off,348),(486+off,440)],(235,202,132,160),1)
    # legs
    poly(d,[(432,425),(476,425),(465,579),(411,586)],(29,23,38,255),purple,2)
    poly(d,[(484,425),(528,425),(549,586),(495,579)],(29,23,38,255),purple,2)
    save1(img,name)

# --- 심야 무성권역 (spell only; no humanoid) -------------------------------
def midnight():
    name='v41_premium_midnight_silence.webp'
    img=load2(name)
    d=ImageDraw.Draw(img, 'RGBA')
    cx,cy=480,320
    blues=[(112,135,214,205),(139,156,235,190),(173,183,250,165)]
    for i,r in enumerate((96,150,212,264)):
        box=(cx-r,cy-r,cx+r,cy+r)
        d.ellipse(tuple(S(x) for x in box), outline=blues[min(i,2)], width=S(2 if i<2 else 1))
    # cardinal seal arms and diamonds
    for a in range(0,360,45):
        rad=math.radians(a)
        p1=(cx+math.cos(rad)*86,cy+math.sin(rad)*86)
        p2=(cx+math.cos(rad)*250,cy+math.sin(rad)*250)
        line(d,[p1,p2],(119,140,221,135),2)
        px,py=p2
        poly(d,[(px,py-8),(px+8,py),(px,py+8),(px-8,py)],(162,175,245,155),None)
    # central void seal, still clearly a spell
    ellipse(d,(430,270,530,370),(3,7,18,240),(177,187,250,230),3)
    ellipse(d,(456,296,504,344),(18,24,58,255),(132,151,235,230),2)
    # crescent mark at top-right preserved and secondary small sigils
    for x,y in ((345,210),(615,215),(345,430),(615,425)):
        ellipse(d,(x-7,y-7,x+7,y+7),(170,183,244,175),None)
    save1(img,name)

if __name__=='__main__':
    twilight(); dawn(); eclipse(); midnight()
    print('Updated premium art using existing AODX WEBP backgrounds.')
