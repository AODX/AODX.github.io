#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import csv, hashlib, json, math, random, re
from collections import Counter
from typing import Iterable
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
ART = ROOT / 'public' / 'card-art'
OUT_W, OUT_H = 720, 480
W, H = OUT_W, OUT_H

PALETTES = {
    'solar':  {'bg1': (10, 12, 30),  'bg2': (58, 36, 27), 'a': (242, 193, 96),  'b': (255, 234, 170), 'c': (147, 83, 48)},
    'lunar':  {'bg1': (8, 14, 36),   'bg2': (25, 29, 68), 'a': (173, 168, 255), 'b': (235, 231, 255), 'c': (101, 100, 184)},
    'storm':  {'bg1': (4, 20, 40),   'bg2': (18, 66, 88), 'a': (110, 224, 255), 'b': (220, 252, 255), 'c': (55, 138, 187)},
    'verdant':{'bg1': (7, 28, 23),   'bg2': (20, 77, 47), 'a': (107, 221, 159), 'b': (219, 255, 214), 'c': (64, 151, 99)},
    'void':   {'bg1': (17, 8, 30),   'bg2': (51, 25, 76), 'a': (205, 122, 255), 'b': (248, 224, 255), 'c': (124, 78, 170)},
    'neutral':{'bg1': (12, 18, 28),  'bg2': (42, 48, 66), 'a': (197, 211, 226), 'b': (244, 246, 249), 'c': (115, 130, 150)},
}

TIME_WORDS = {
    'dawn': ['여명', '새벽', '해오름', '동녘', '아침', '일출', '첫빛', 'sunrise', 'dawn'],
    'zenith': ['정점', '천정', '정오', '백열', '광휘', '태양', '극점', '절정', 'zenith', 'noon'],
    'dusk': ['황혼', '노을', '석양', '낙일', '잔광', '저녁', '퇴광', '박명', 'dusk', 'sunset', 'twilight'],
    'midnight': ['심야', '자정', '무월', '별그늘', '야행', '밤', '흑청', '꿈길', 'midnight', 'night', 'nocturne'],
    'eclipse': ['개기', '일식', '흑일', '식', '엄브라', '코로나', '암영', '그림자', 'eclipse', 'umbra'],
}

WEAPON_WORDS = {
    'sword': ['검', '검객', '검사', '기사', '집행자', '선봉장', '전령', 'duelist', 'knight', 'vanguard', 'saber', 'blade', 'fencer', 'warrior'],
    'spear': ['창', '랜서', '기수', 'lancer', 'rider', 'cavalier', 'pike'],
    'bow': ['궁', '사냥꾼', '추적자', 'hunter', 'archer', 'hawk', 'falcon', 'scout'],
    'staff': ['성녀', '사제', '성가대원', '예언자', '술사', '연금사', '해석가', '관측사', '조율사', 'oracle', 'sage', 'priest', 'medic', 'weaver', 'mage', 'witch', 'wizard'],
    'shield': ['수호자', '파수꾼', '심문관', 'bastion', 'warden', 'guardian', 'shield', 'bear', 'wall'],
    'rifle': ['포격수', '기관병', '정비사', '항해사', 'interceptor', 'engineer', 'artillery', 'frigate', 'carrier', 'mechanic', 'mecha', 'gear'],
    'music': ['악사', 'conductor', 'bard', 'harp', 'lute', 'violin', 'song', 'melody'],
}

CREATURE_WORDS = {
    'dragon': ['용', 'dragon', 'drake'],
    'bird': ['매', 'phoenix', 'seraph', '천사', 'bird', 'wing'],
    'wolf': ['늑대', 'hound', 'wolf', 'fang', 'fox'],
    'lion': ['사자', 'lion', 'beast', 'horn'],
    'golem': ['골렘', '거인', 'titan', 'golem', 'colossus', 'giant'],
    'spirit': ['유령', '망령', '환영', 'spirit', 'reaper', 'phantom', 'shade', 'wraith'],
}

SPECIAL_MOTIFS = {
    'flame': ['불꽃', '홍염', '화염', '불멸', 'ember', 'phoenix', 'blaze', 'flare', 'fire'],
    'crystal': ['유리', '수정', '유리빛', '백금', 'crystal', 'glass', 'prism'],
    'royal': ['왕실', '왕', 'crown', 'royal', 'sovereign', 'king'],
    'star': ['별', '성광', '성검', '성녀', 'astral', 'nova', 'celestial', 'quasar', 'star'],
    'time': ['시간', 'chrono', '시계', '연대기', 'hour', 'clock', 'time', 'fate'],
    'grave': ['묘지', '사령', '잔향', 'grieve', 'grave', 'death', 'reaper', 'oblivion'],
    'forest': ['씨앗', '숲', '나무', '가시', 'leaf', 'seed', 'root', 'bloom'],
    'lightning': ['번개', '전격', '뇌', 'bolt', 'thunder', 'lightning', 'storm'],
    'dream': ['꿈', '환상', '몽환', '수면', 'dream', 'mirage', 'phantom'],
    'machine': ['기갑', '엔진', '장갑', '철갑', 'gear', 'mecha', 'metal', 'plate', 'armor'],
    'music': ['악사', '선율', '연주', 'harp', 'lute', 'song', 'conductor', 'melody'],
}

KIND_BY_ID_TOKEN = {
    'unit': 'unit', 'spell': 'spell', 'trap': 'trap', 'fusion': 'fusion', 'evolution': 'evolution',
}

MANUAL_RENAMES = {
    'v41_premium_eclipse_conductor': '개기일식의 악사 모르덴',
    'v44_premium_twilight_knight': '황혼의 검사 베스퍼',
    'v41_premium_dawn_lord': '여명성녀 아우렐리아',
}


def clamp(v: float) -> int:
    return max(0, min(255, int(round(v))))


def mix(a, b, t: float):
    return tuple(clamp(a[i] * (1 - t) + b[i] * t) for i in range(3))


def alpha(c, a: int):
    return (*c, max(0, min(255, int(a))))


def seed_for(card_id: str) -> int:
    return int(hashlib.sha256(card_id.encode()).hexdigest()[:16], 16)


def line(draw, pts, fill, width=1):
    draw.line(pts, fill=fill, width=int(width), joint='curve')


def poly(draw, pts, fill, outline=None, width=1):
    draw.polygon(pts, fill=fill)
    if outline:
        draw.line(pts + [pts[0]], fill=outline, width=int(width), joint='curve')


def ellipse(draw, box, fill=None, outline=None, width=1):
    draw.ellipse(box, fill=fill, outline=outline, width=int(width) if outline else 1)


def rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=int(radius), fill=fill, outline=outline, width=int(width) if outline else 1)


def parse_single_quoted_cards(text: str) -> list[dict]:
    pat = re.compile(r"id:\s*'([^']+)',\s*name:\s*'([^']+)',.*?kind:\s*'([^']+)',\s*rarity:\s*'([^']+)',\s*element:\s*'([^']+)'", re.S)
    return [dict(id=a, name=b, kind=c, rarity=d, element=e) for a, b, c, d, e in pat.findall(text)]


def parse_double_quoted_cards(text: str) -> list[dict]:
    pat = re.compile(r'"id":\s*"([^"]+)".*?"name":\s*"([^"]+)".*?"kind":\s*"([^"]+)".*?"rarity":\s*"([^"]+)".*?"element":\s*"([^"]+)"', re.S)
    return [dict(id=a, name=b, kind=c, rarity=d, element=e) for a, b, c, d, e in pat.findall(text)]


def parse_game_data_cards(text: str) -> list[dict]:
    pat = re.compile(r'\{ id: "([^"]+)", name: "([^"]+)", subtitle: "[^"]*", kind: "([^"]+)", rarity: "([^"]+)", element: "([^"]+)"')
    return [dict(id=a, name=b, kind=c, rarity=d, element=e) for a, b, c, d, e in pat.findall(text)]


def parse_overrides(path: Path) -> dict[str, str]:
    if not path.exists():
        return {}
    text = path.read_text(encoding='utf-8')
    return {m.group(1): m.group(2) for m in re.finditer(r"'([^']+)': '([^']+)'", text)}


def clean_name(raw: str) -> str:
    x = raw.replace('·', ' · ').strip()
    x = re.sub(r'\s+', ' ', x)
    return x


def title_from_id(card_id: str) -> str:
    tokens = [t for t in re.split(r'[_-]+', card_id) if t and t not in {'v26', 'v32y', 'v33a', 'v34', 'v37', 'v41', 'v44', 'v60', 'premium', 'cycle'} and not t.isdigit()]
    return ' '.join(t.capitalize() for t in tokens) if tokens else card_id


def infer_kind(card_id: str) -> str:
    for tok, kind in KIND_BY_ID_TOKEN.items():
        if tok in card_id:
            return kind
    if card_id.startswith('unit_'):
        return 'unit'
    if card_id.startswith('spell_'):
        return 'spell'
    if card_id.startswith('trap_'):
        return 'trap'
    return 'unit'


def infer_element(card_id: str, name: str) -> str:
    low = f'{card_id} {name}'.lower()
    if any(w in low for w in ['solar', 'sun', 'dawn', 'lumina', 'light', '성녀', '여명']):
        return 'solar'
    if any(w in low for w in ['lunar', 'moon', 'night', 'nocturne', '황혼', '심야']):
        return 'lunar'
    if any(w in low for w in ['storm', 'tempest', 'bolt', 'thunder', 'astral', '천뢰']):
        return 'storm'
    if any(w in low for w in ['verdant', 'arbor', 'forest', 'seed', 'bloom', '나무', '숲']):
        return 'verdant'
    if any(w in low for w in ['void', 'eclipse', 'phantom', 'grave', 'shadow', '흑일', '공허']):
        return 'void'
    return 'neutral'


def infer_rarity(card_id: str) -> str:
    low = card_id.lower()
    if 'premium' in low:
        return 'legendary'
    if 'fusion' in low or 'evolution' in low:
        return 'epic'
    return 'rare'


def load_metadata() -> dict[str, dict]:
    meta: dict[str, dict] = {}
    def add_many(cards: Iterable[dict]):
        for c in cards:
            if not c.get('id'):
                continue
            meta[c['id']] = {
                'id': c['id'],
                'name': clean_name(c.get('name', c['id'])),
                'kind': c.get('kind') or infer_kind(c['id']),
                'rarity': c.get('rarity') or infer_rarity(c['id']),
                'element': c.get('element') or infer_element(c['id'], c.get('name', '')),
            }
    # csv sources
    for path in [ROOT/'ART_MANIFEST_v8.csv', ROOT/'docs/CARD_CATALOG_520.csv', ROOT/'CARD_CATALOG_v8_320.csv']:
        if path.exists():
            with path.open(encoding='utf-8-sig', newline='') as f:
                rows = list(csv.DictReader(f))
            cards = []
            for r in rows:
                cid = r.get('card_id') or r.get('id')
                if not cid:
                    continue
                cards.append({'id': cid, 'name': r.get('name', cid), 'kind': r.get('kind') or infer_kind(cid), 'rarity': r.get('rarity', 'rare'), 'element': r.get('element') or infer_element(cid, r.get('name', ''))})
            add_many(cards)
    # json sources
    jpath = ROOT/'docs/V33A_CARD_MANIFEST.json'
    if jpath.exists():
        j = json.loads(jpath.read_text(encoding='utf-8'))
        add_many(j.get('cards', []))
    # ts sources
    paths = [ROOT/'app/v34-card-data.ts', ROOT/'app/v37-time-card-data.ts', ROOT/'app/v41-premium-time-cards.ts', ROOT/'app/v60-premium-time-devourer.ts', ROOT/'app/game-data.ts']
    for path in paths:
        if not path.exists():
            continue
        text = path.read_text(encoding='utf-8')
        if path.name == 'v34-card-data.ts':
            add_many(parse_double_quoted_cards(text))
        elif path.name == 'game-data.ts':
            add_many(parse_game_data_cards(text))
        else:
            add_many(parse_single_quoted_cards(text))
    # overrides and manual renames
    overrides = parse_overrides(ROOT/'app/v74-card-name-overrides.ts')
    for cid, name in overrides.items():
        if cid in meta:
            meta[cid]['name'] = clean_name(name)
    for cid, name in MANUAL_RENAMES.items():
        meta.setdefault(cid, {'id': cid, 'kind': infer_kind(cid), 'rarity': infer_rarity(cid), 'element': infer_element(cid, name)})
        meta[cid]['name'] = name
    return meta


def detect_phase(name: str) -> str | None:
    low = name.lower()
    for phase, words in TIME_WORDS.items():
        if any(w.lower() in low for w in words):
            return phase
    return None


def detect_archetype(name: str) -> str:
    low = name.lower()
    for creature, words in CREATURE_WORDS.items():
        if any(w.lower() in low for w in words):
            return creature
    for kind, words in WEAPON_WORDS.items():
        if any(w.lower() in low for w in words):
            return kind
    if '기수' in name:
        return 'spear'
    if '기사' in name:
        return 'sword'
    return 'sword'


def motif_flags(text: str) -> set[str]:
    out = set()
    low = text.lower()
    for k, words in SPECIAL_MOTIFS.items():
        if any(w.lower() in low for w in words):
            out.add(k)
    return out


def themed_palette(element: str, phase: str | None, motifs: set[str]):
    pal = dict(PALETTES.get(element, PALETTES['neutral']))
    if phase == 'dawn':
        pal['a'] = mix(pal['a'], (255, 214, 124), 0.25); pal['b'] = mix(pal['b'], (255, 245, 202), 0.2)
    elif phase == 'zenith':
        pal['a'] = mix(pal['a'], (255, 232, 129), 0.32)
    elif phase == 'dusk':
        pal['a'] = mix(pal['a'], (235, 150, 176), 0.25); pal['c'] = mix(pal['c'], (185, 92, 120), 0.25)
    elif phase == 'midnight':
        pal['bg1'] = mix(pal['bg1'], (3, 8, 26), 0.35); pal['a'] = mix(pal['a'], (162, 183, 255), 0.2)
    elif phase == 'eclipse':
        pal['a'] = mix(pal['a'], (240, 145, 221), 0.28); pal['bg2'] = mix(pal['bg2'], (40, 12, 54), 0.28)
    if 'flame' in motifs:
        pal['a'] = mix(pal['a'], (255, 138, 92), 0.35)
    if 'crystal' in motifs:
        pal['b'] = mix(pal['b'], (225, 248, 255), 0.35)
    if 'royal' in motifs:
        pal['a'] = mix(pal['a'], (255, 215, 141), 0.24)
    if 'lightning' in motifs:
        pal['a'] = mix(pal['a'], (137, 234, 255), 0.28)
    if 'forest' in motifs:
        pal['a'] = mix(pal['a'], (118, 227, 160), 0.22)
    return pal


def draw_gradient(img: Image.Image, pal):
    d = ImageDraw.Draw(img, 'RGBA')
    for y in range(H):
        t = y / max(1, H - 1)
        c = mix(pal['bg1'], pal['bg2'], t)
        d.line((0, y, W, y), fill=c + (255,), width=1)


def draw_background(rng: random.Random, pal: dict, phase: str | None, motifs: set[str], kind: str) -> Image.Image:
    img = Image.new('RGBA', (W, H), pal['bg1'] + (255,))
    draw_gradient(img, pal)
    glow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow, 'RGBA')
    centers = [(0.5, 0.24, 0.34, 105), (0.25, 0.74, 0.26, 72), (0.76, 0.72, 0.30, 72)]
    if kind in ('spell', 'trap'):
        centers[0] = (0.5, 0.34, 0.34, 115)
    for cxn, cyn, rn, strength in centers:
        cx, cy, rr = int(W * cxn), int(H * cyn), int(W * rn)
        for r in range(rr, 0, -18):
            a = int(strength * (r / rr) ** 2)
            gd.ellipse((cx-r, cy-r, cx+r, cy+r), fill=alpha(pal['a'], a))
    img = Image.alpha_composite(img, glow)
    d = ImageDraw.Draw(img, 'RGBA')
    # stars and particles
    density = 95 if kind in ('spell', 'trap') else 80
    for _ in range(density):
        x, y = rng.randrange(0, W), rng.randrange(0, int(H * 0.85))
        r = rng.choice([1, 1, 1, 2])
        ellipse(d, (x-r, y-r, x+r, y+r), fill=alpha(pal['b'], rng.randint(90, 220)))
        if rng.random() < 0.16:
            line(d, [(x-4, y), (x+4, y)], alpha(pal['b'], 110), 1)
            line(d, [(x, y-4), (x, y+4)], alpha(pal['b'], 110), 1)
    # framework rings
    cx, cy = W / 2, H * (0.31 if kind not in ('spell', 'trap') else 0.38)
    rings = (92, 144, 198, 252, 310) if kind not in ('fusion', 'evolution') else (110, 170, 240, 300)
    for idx, rr in enumerate(rings):
        ellipse(d, (cx-rr, cy-rr, cx+rr, cy+rr), outline=alpha(pal['b'], max(24, 95 - idx * 14)), width=2)
    for a in range(0, 360, 45):
        rad = math.radians(a)
        p1 = (cx + math.cos(rad) * 64, cy + math.sin(rad) * 64)
        p2 = (cx + math.cos(rad) * 248, cy + math.sin(rad) * 248)
        line(d, [p1, p2], alpha(pal['a'], 68), 1)
    # phase motif
    if phase == 'dawn':
        ellipse(d, (390, 70, 570, 250), outline=alpha(pal['a'], 160), width=4)
        for a in range(0, 360, 30):
            rad = math.radians(a)
            line(d, [(480 + math.cos(rad) * 102, 160 + math.sin(rad) * 102), (480 + math.cos(rad) * 128, 160 + math.sin(rad) * 128)], alpha(pal['a'], 130), 2)
    elif phase == 'dusk':
        ellipse(d, (404, 82, 552, 230), outline=alpha(pal['a'], 160), width=3)
        ellipse(d, (434, 82, 582, 230), fill=alpha(pal['bg1'], 220))
    elif phase == 'midnight':
        ellipse(d, (404, 82, 552, 230), outline=alpha(pal['b'], 145), width=3)
        ellipse(d, (444, 96, 566, 218), fill=alpha(pal['bg1'], 255))
    elif phase == 'eclipse':
        ellipse(d, (392, 72, 568, 248), fill=alpha((6, 6, 16), 245), outline=alpha(pal['a'], 180), width=4)
        ellipse(d, (380, 72, 556, 248), outline=alpha(pal['b'], 165), width=3)
    elif phase == 'zenith':
        ellipse(d, (420, 92, 540, 212), fill=alpha(pal['a'], 95), outline=alpha(pal['b'], 180), width=3)
    # floor or altar
    if kind in ('spell', 'trap'):
        ellipse(d, (190, 500, 770, 670), fill=alpha(mix(pal['bg2'], pal['a'], 0.25), 105))
        ellipse(d, (230, 520, 730, 650), outline=alpha(pal['b'], 110), width=3)
    else:
        ellipse(d, (220, 500, 740, 660), fill=alpha(mix(pal['bg2'], pal['a'], 0.28), 110))
        ellipse(d, (250, 515, 710, 640), outline=alpha(pal['b'], 110), width=3)
        ellipse(d, (310, 545, 650, 625), outline=alpha(pal['a'], 90), width=2)
    return img


def draw_cloak(d, cx, base_y, height, width, dark, outline, inner=None):
    poly(d, [(cx - width * 0.38, base_y - height * 0.88), (cx - width * 0.22, base_y - height), (cx, base_y - height * 1.05), (cx + width * 0.22, base_y - height), (cx + width * 0.38, base_y - height * 0.88), (cx + width * 0.50, base_y), (cx + width * 0.22, base_y - height * 0.06), (cx, base_y + height * 0.07), (cx - width * 0.22, base_y - height * 0.06), (cx - width * 0.50, base_y)], dark, outline, 3)
    if inner:
        poly(d, [(cx - width * 0.16, base_y - height * 0.82), (cx, base_y - height * 0.95), (cx + width * 0.16, base_y - height * 0.82), (cx + width * 0.10, base_y - height * 0.10), (cx - width * 0.10, base_y - height * 0.10)], inner, outline, 2)


def draw_humanoid(d, rng, name, archetype, pal, rarity, kind='unit'):
    cx = 480 + rng.randint(-24, 24)
    base_y = 560 if kind != 'evolution' else 540
    height = 245 + (25 if rarity in ('epic', 'legendary') else 0) + (24 if kind in ('fusion', 'evolution') else 0)
    width = 265 + rng.randint(-16, 18) + (20 if kind == 'fusion' else 0)
    dark = alpha(mix((10, 12, 22), pal['bg1'], 0.25), 248)
    mid = alpha(mix((36, 32, 52), pal['a'], 0.14), 245)
    outline = alpha(pal['a'], 210)
    bright = alpha(pal['b'], 220)

    if archetype in ('staff', 'music') or '성녀' in name or 'seraph' in name.lower() or kind == 'evolution':
        for side in (-1, 1):
            poly(d, [(cx, base_y - height * 0.68), (cx + side * width * 0.58, base_y - height * 0.52), (cx + side * width * 0.26, base_y - height * 0.95)], alpha(pal['a'], 70))
        ellipse(d, (cx - 60, base_y - height * 1.22, cx + 60, base_y - height * 0.74), outline=alpha(pal['b'], 180), width=3)

    draw_cloak(d, cx, base_y, height, width, dark, outline, inner=mid)
    ellipse(d, (cx - 38, base_y - height * 1.24, cx + 38, base_y - height * 0.92), fill=dark, outline=outline, width=3)
    poly(d, [(cx - 55, base_y - height * 0.98), (cx - 85, base_y - height * 0.90), (cx - 62, base_y - height * 0.74)], alpha(mix((24, 22, 34), pal['a'], 0.12), 245), outline, 2)
    poly(d, [(cx + 55, base_y - height * 0.98), (cx + 85, base_y - height * 0.90), (cx + 62, base_y - height * 0.74)], alpha(mix((24, 22, 34), pal['a'], 0.12), 245), outline, 2)
    line(d, [(cx - 18, base_y - height * 1.06), (cx + 18, base_y - height * 1.06)], bright, 2)
    ellipse(d, (cx - 24, base_y - height * 0.62, cx + 24, base_y - height * 0.46), fill=alpha(mix(pal['a'], pal['c'], 0.4), 220), outline=bright, width=2)
    poly(d, [(cx - 38, base_y - height * 0.10), (cx - 4, base_y - height * 0.10), (cx - 10, base_y + 18), (cx - 52, base_y + 30)], alpha(mix((18,18,26), pal['a'], 0.10), 245), outline, 2)
    poly(d, [(cx + 38, base_y - height * 0.10), (cx + 4, base_y - height * 0.10), (cx + 52, base_y + 30), (cx + 10, base_y + 18)], alpha(mix((18,18,26), pal['a'], 0.10), 245), outline, 2)
    left_shoulder = (cx - 42, base_y - height * 0.74)
    right_shoulder = (cx + 42, base_y - height * 0.74)
    left_hand = (cx - 112, base_y - height * 0.42)
    right_hand = (cx + 112, base_y - height * 0.42)
    line(d, [left_shoulder, left_hand], outline, 10)
    line(d, [right_shoulder, right_hand], outline, 10)
    ellipse(d, (left_hand[0] - 10, left_hand[1] - 10, left_hand[0] + 10, left_hand[1] + 10), fill=bright)
    ellipse(d, (right_hand[0] - 10, right_hand[1] - 10, right_hand[0] + 10, right_hand[1] + 10), fill=bright)

    if archetype == 'sword':
        ang = rng.uniform(-1.0, -0.55)
        hilt = (cx + 60, base_y - height * 0.52)
        tip = (hilt[0] + math.cos(ang) * 240, hilt[1] + math.sin(ang) * 240)
        line(d, [hilt, tip], outline, 8)
        line(d, [(hilt[0] - 18, hilt[1] + 10), (hilt[0] + 18, hilt[1] - 10)], bright, 3)
        if '쌍' in name or 'dual' in name.lower():
            ang2 = rng.uniform(-2.4, -1.9)
            hilt2 = (cx - 52, base_y - height * 0.54)
            tip2 = (hilt2[0] + math.cos(ang2) * 220, hilt2[1] + math.sin(ang2) * 220)
            line(d, [hilt2, tip2], alpha(mix(pal['b'], pal['a'], 0.3), 205), 7)
    elif archetype == 'spear':
        shaft_x = cx + 115
        line(d, [(shaft_x, base_y - height * 1.16), (shaft_x, base_y + 10)], outline, 7)
        poly(d, [(shaft_x, base_y - height * 1.22), (shaft_x - 16, base_y - height * 1.08), (shaft_x + 16, base_y - height * 1.08)], bright)
    elif archetype == 'bow':
        bx, by = cx + 92, base_y - height * 0.56
        ellipse(d, (bx - 45, by - 110, bx + 45, by + 110), outline=outline, width=4)
        line(d, [(bx - 42, by - 95), (bx + 42, by + 95)], bright, 2)
        line(d, [(cx - 90, base_y - height * 0.50), (bx + 30, by - 4)], bright, 3)
    elif archetype == 'staff':
        sx = cx + 120
        line(d, [(sx, base_y - height * 1.16), (sx, base_y + 18)], outline, 7)
        ellipse(d, (sx - 28, base_y - height * 1.24, sx + 28, base_y - height * 1.08), outline=bright, width=3)
        line(d, [(sx, base_y - height * 1.28), (sx, base_y - height * 1.36)], bright, 2)
    elif archetype == 'shield':
        rounded_rect(d, (cx - 158, base_y - height * 0.62, cx - 64, base_y - height * 0.26), 22, alpha(mix(pal['c'], pal['a'], 0.2), 220), outline, 3)
        line(d, [(cx + 58, base_y - height * 0.52), (cx + 220, base_y - height * 0.80)], bright, 5)
    elif archetype == 'rifle':
        line(d, [(cx - 30, base_y - height * 0.52), (cx + 210, base_y - height * 0.62)], outline, 9)
        rounded_rect(d, (cx + 140, base_y - height * 0.68, cx + 210, base_y - height * 0.56), 10, alpha(mix(pal['a'], (255,255,255), 0.15), 220), outline, 2)
    elif archetype == 'music':
        ellipse(d, (cx - 34, base_y - height * 0.48, cx + 40, base_y - height * 0.20), fill=alpha(mix(pal['c'], pal['a'], 0.22), 230), outline=outline, width=3)
        ellipse(d, (cx - 6, base_y - height * 0.39, cx + 15, base_y - height * 0.30), fill=alpha((10, 10, 18), 230), outline=alpha(pal['a'], 155), width=2)
        line(d, [(cx + 18, base_y - height * 0.44), (cx + 152, base_y - height * 0.78)], outline, 7)
        for off in (-10, -2, 6, 14):
            line(d, [(cx - 8 + off, base_y - height * 0.46), (cx + 12 + off, base_y - height * 0.23)], alpha(pal['b'], 165), 1)
        for yoff in (-26, 0, 26):
            pts = []
            for i in range(7):
                x = 120 + i * 110
                y = base_y - height * 0.86 + yoff + math.sin(i * 0.7) * 16
                pts.append((x, y))
            line(d, pts, alpha(pal['a'], 70), 2)
    if 'royal' in motif_flags(name) or '왕' in name or kind == 'evolution':
        poly(d, [(cx - 32, base_y - height * 1.28), (cx - 10, base_y - height * 1.36), (cx, base_y - height * 1.26), (cx + 10, base_y - height * 1.36), (cx + 32, base_y - height * 1.28), (cx + 32, base_y - height * 1.18), (cx - 32, base_y - height * 1.18)], alpha(pal['a'], 160), bright, 2)


def draw_beast(d, rng, name, archetype, pal, rarity, kind='unit'):
    cx = 480 + rng.randint(-35, 35)
    cy = 430 if kind != 'fusion' else 410
    outline = alpha(pal['a'], 210)
    dark = alpha(mix((12, 13, 18), pal['bg1'], 0.15), 248)
    bright = alpha(pal['b'], 200)
    large = rarity in ('epic', 'legendary') or kind == 'fusion'
    if archetype == 'dragon':
        poly(d, [(cx - 210, cy + 70), (cx - 130, cy), (cx - 40, cy - 56), (cx + 40, cy - 70), (cx + 120, cy - 24), (cx + 195, cy + 60), (cx + 140, cy + 86), (cx + 42, cy + 56), (cx - 58, cy + 76)], dark, outline, 4)
        poly(d, [(cx - 70, cy - 40), (cx - 195, cy - 150), (cx - 70, cy - 118)], alpha(pal['a'], 92), outline, 2)
        poly(d, [(cx + 35, cy - 44), (cx + 185, cy - 164), (cx + 88, cy - 82)], alpha(pal['a'], 82), outline, 2)
        line(d, [(cx + 160, cy + 28), (cx + 240, cy - 34)], bright, 5)
        for ox in (-130, -20, 80):
            poly(d, [(cx + ox, cy - 58), (cx + ox + 14, cy - 98), (cx + ox + 26, cy - 52)], bright)
        ellipse(d, (cx + 70, cy - 22, cx + 94, cy + 2), fill=bright)
    elif archetype in ('wolf', 'lion', 'bird'):
        body = [(cx - 170, cy + 48), (cx - 92, cy - 24), (cx + 22, cy - 52), (cx + 132, cy - 16), (cx + 180, cy + 42), (cx + 94, cy + 72), (cx - 36, cy + 70)]
        poly(d, body, dark, outline, 4)
        if archetype == 'bird':
            poly(d, [(cx - 30, cy - 18), (cx - 196, cy - 132), (cx - 76, cy - 4)], alpha(pal['a'], 90), outline, 2)
            poly(d, [(cx + 12, cy - 34), (cx + 196, cy - 144), (cx + 108, cy - 2)], alpha(pal['a'], 90), outline, 2)
            line(d, [(cx + 158, cy - 10), (cx + 248, cy - 22)], bright, 4)
        else:
            poly(d, [(cx + 134, cy - 36), (cx + 198, cy - 68), (cx + 170, cy - 10)], dark, outline, 3)
            poly(d, [(cx + 124, cy - 48), (cx + 144, cy - 98), (cx + 158, cy - 44)], dark, outline, 3)
            line(d, [(cx - 170, cy + 46), (cx - 250, cy + 6)], bright, 4)
        for lx in (-110, -32, 60, 122):
            line(d, [(cx + lx, cy + 48), (cx + lx + rng.randint(-12, 12), cy + 136)], outline, 6)
        ellipse(d, (cx + 102, cy - 20, cx + 126, cy + 4), fill=bright)
    elif archetype == 'golem':
        poly(d, [(cx - 160, cy + 90), (cx - 146, cy - 20), (cx - 72, cy - 128), (cx + 42, cy - 142), (cx + 136, cy - 42), (cx + 154, cy + 90), (cx + 92, cy + 110), (cx - 90, cy + 110)], dark, outline, 5)
        poly(d, [(cx - 240, cy - 20), (cx - 146, cy - 16), (cx - 118, cy + 54), (cx - 210, cy + 74)], alpha(mix(pal['c'], pal['a'], 0.12), 240), outline, 3)
        poly(d, [(cx + 240, cy - 22), (cx + 146, cy - 16), (cx + 122, cy + 52), (cx + 220, cy + 72)], alpha(mix(pal['c'], pal['a'], 0.12), 240), outline, 3)
        for ex in (-28, 28):
            ellipse(d, (cx + ex - 14, cy - 80, cx + ex + 14, cy - 52), fill=bright)
        ellipse(d, (cx - 30, cy - 18, cx + 30, cy + 42), fill=alpha(pal['a'], 115), outline=bright, width=2)
        if large:
            for ox in (-120, -30, 60):
                poly(d, [(cx + ox, cy - 130), (cx + ox + 18, cy - 182), (cx + ox + 34, cy - 128)], bright)
    else:
        draw_humanoid(d, rng, name, 'staff', pal, rarity, kind)


def draw_magic_circle(d, cx, cy, pal, motifs: set[str], density=1.0, trap=False):
    outline = alpha(pal['b'], 170)
    accent = alpha(pal['a'], 145)
    for rr, w in ((160, 3), (120, 2), (84, 2), (48, 2)):
        ellipse(d, (cx-rr, cy-rr, cx+rr, cy+rr), outline=outline if rr != 84 else accent, width=w)
    for a in range(0, 360, 30):
        rad = math.radians(a)
        x1, y1 = cx + math.cos(rad) * 42, cy + math.sin(rad) * 42
        x2, y2 = cx + math.cos(rad) * 160, cy + math.sin(rad) * 160
        line(d, [(x1, y1), (x2, y2)], accent, 1)
        px, py = cx + math.cos(rad) * 120, cy + math.sin(rad) * 120
        if trap:
            poly(d, [(px, py-8), (px+8, py), (px, py+8), (px-8, py)], alpha(pal['a'], 95))
        else:
            ellipse(d, (px-5, py-5, px+5, py+5), fill=alpha(pal['b'], 125))
    if trap:
        for off in range(-2, 3):
            line(d, [(cx-128, cy+off*14), (cx+128, cy+off*14)], alpha(pal['a'], 75), 2)
    if 'time' in motifs:
        ellipse(d, (cx-38, cy-38, cx+38, cy+38), outline=outline, width=3)
        line(d, [(cx, cy), (cx, cy-22)], outline, 3)
        line(d, [(cx, cy), (cx+18, cy+10)], outline, 2)
    if 'music' in motifs:
        line(d, [(cx-50, cy+20), (cx+50, cy-24)], accent, 3)
        for off in (-20, 10):
            ellipse(d, (cx+off-14, cy+off-14, cx+off+14, cy+off+14), outline=outline, width=2)
    if 'crystal' in motifs:
        for sx, sy in ((0,-72),(70,0),(0,72),(-70,0)):
            poly(d, [(cx+sx, cy+sy-18),(cx+sx-14, cy+sy+12),(cx+sx+6, cy+sy+26),(cx+sx+18, cy+sy+8)], alpha(pal['b'],120), outline, 2)
    if 'lightning' in motifs:
        poly(d, [(cx-18, cy-60),(cx+6, cy-60),(cx-8, cy-8),(cx+22, cy-8),(cx-10, cy+62),(cx, cy+16),(cx-26, cy+16)], alpha(pal['a'],160), outline, 2)
    if 'forest' in motifs:
        for a in range(0,360,60):
            rad=math.radians(a)
            x=cx+math.cos(rad)*68; y=cy+math.sin(rad)*68
            poly(d, [(x, y-16),(x-10,y+8),(x,y+18),(x+12,y+8)], alpha(pal['a'],110), outline, 2)


def draw_spell_scene(d, rng, name, pal, rarity):
    motifs = motif_flags(name)
    cx, cy = 480, 330
    draw_magic_circle(d, cx, cy, pal, motifs, density=1.2, trap=False)
    outline = alpha(pal['a'], 210)
    bright = alpha(pal['b'], 210)
    # altar / portal base
    ellipse(d, (240, 450, 720, 600), fill=alpha(mix(pal['bg2'], pal['a'], 0.23), 85), outline=alpha(pal['b'], 100), width=3)
    if 'grave' in motifs or 'void' in name.lower():
        ellipse(d, (360, 220, 600, 460), fill=alpha((12, 8, 28), 160), outline=bright, width=3)
    elif 'time' in motifs:
        for rr in (40, 82, 124):
            ellipse(d, (cx-rr, cy-rr, cx+rr, cy+rr), outline=alpha(pal['a'], 120), width=2)
        line(d, [(cx, cy), (cx, cy-90)], bright, 5)
        line(d, [(cx, cy), (cx+70, cy+34)], outline, 4)
    elif 'forest' in motifs:
        for off in (-110, -50, 10, 70):
            line(d, [(cx+off, cy+120), (cx+off, cy-40)], outline, 4)
            poly(d, [(cx+off, cy-50),(cx+off-24,cy-8),(cx+off,cy+14),(cx+off+26,cy-12)], alpha(pal['a'],120), bright, 2)
    elif 'lightning' in motifs:
        for off in (-120, -40, 60):
            poly(d, [(cx+off, cy-120),(cx+off+24, cy-58),(cx+off-4, cy-58),(cx+off+26, cy+28),(cx+off, cy+10),(cx+off+10, cy+72)], alpha(pal['a'],150), bright, 2)
    elif 'music' in motifs:
        for yoff in (-36, -10, 16, 42):
            pts=[]
            for i in range(7):
                x=140+i*110
                y=cy+yoff+math.sin(i*0.7)*14
                pts.append((x,y))
            line(d, pts, alpha(pal['a'],110), 2)
        line(d, [(cx-20, cy+44),(cx+112, cy-40)], outline, 7)
        ellipse(d, (cx-46, cy+18, cx+16, cy+78), fill=alpha(mix(pal['c'], pal['a'], 0.2), 220), outline=bright, width=3)
    else:
        # default: floating monolith / sigil
        poly(d, [(cx, cy-110), (cx-74, cy+14), (cx, cy+116), (cx+82, cy+10)], alpha(mix((20,20,28), pal['c'], 0.24), 210), outline, 3)
        ellipse(d, (cx-30, cy-26, cx+30, cy+34), fill=alpha(pal['a'],120), outline=bright, width=2)
    for i in range(12 + (6 if rarity in ('epic','legendary') else 0)):
        ang = i * (360 / 12) + rng.uniform(-8, 8)
        rad = math.radians(ang)
        r = rng.uniform(170, 225)
        x = cx + math.cos(rad) * r
        y = cy + math.sin(rad) * r * 0.66
        line(d, [(cx, cy), (x, y)], alpha(pal['b'], 55), 1)
        ellipse(d, (x-3, y-3, x+3, y+3), fill=alpha(pal['b'], 130))


def draw_trap_scene(d, rng, name, pal, rarity):
    motifs = motif_flags(name)
    cx, cy = 480, 330
    draw_magic_circle(d, cx, cy, pal, motifs, trap=True)
    outline = alpha(pal['a'], 215)
    bright = alpha(pal['b'], 205)
    # angular frame
    poly(d, [(cx, cy-138), (cx+138, cy), (cx, cy+138), (cx-138, cy)], alpha(mix((15,15,20), pal['bg2'], 0.3), 180), outline, 4)
    poly(d, [(cx, cy-64), (cx+64, cy), (cx, cy+64), (cx-64, cy)], alpha(pal['a'], 70), bright, 3)
    low = name.lower()
    if 'shield' in low or '방패' in name or '격벽' in name or '봉쇄' in name:
        rounded_rect(d, (cx-60, cy-90, cx+60, cy+80), 24, alpha(mix(pal['c'], pal['a'], 0.2), 180), outline, 3)
        line(d, [(cx-24, cy-10),(cx,cy+22),(cx+34,cy-36)], bright, 4)
    elif 'trap' in low or 'claw' in low or '파쇄' in name or '절단' in name or '역습' in name:
        for ang in (-55, -15, 15, 55):
            rad=math.radians(ang)
            x2=cx+math.cos(rad)*130; y2=cy+math.sin(rad)*130
            line(d, [(cx, cy), (x2, y2)], outline, 6)
            poly(d, [(x2,y2),(x2-18,y2-10),(x2-4,y2-28)], bright)
    elif 'negate' in low or '반사' in name or '반전' in name:
        line(d, [(cx-92, cy-92), (cx+92, cy+92)], bright, 5)
        line(d, [(cx-92, cy+92), (cx+92, cy-92)], bright, 5)
        ellipse(d, (cx-46, cy-46, cx+46, cy+46), outline=outline, width=4)
    else:
        poly(d, [(cx,cy-96),(cx+70,cy),(cx,cy+96),(cx-70,cy)], alpha(pal['a'],90), bright, 3)
        ellipse(d, (cx-20, cy-20, cx+20, cy+20), fill=alpha(pal['b'],140))
    # chain or warning spikes
    for off in (-220, -170, 170, 220):
        line(d, [(cx+off, 120), (cx+off*0.55, cy-110)], alpha(pal['a'], 110), 2)
    if rarity in ('epic','legendary'):
        for a in range(0,360,45):
            rad=math.radians(a)
            x=cx+math.cos(rad)*186; y=cy+math.sin(rad)*186
            poly(d, [(x,y),(x-10,y-22),(x+10,y-22)], alpha(pal['a'],95))


def add_foreground_fx(img: Image.Image, pal: dict, name: str, rarity: str, kind: str):
    fx = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(fx, 'RGBA')
    motifs = motif_flags(name)
    seed = seed_for(name)
    for i in range(34 + (8 if rarity == 'legendary' else 0) + (8 if kind in ('spell','trap','fusion','evolution') else 0)):
        rr = random.Random(seed + i * 37)
        x = rr.randrange(100, W - 100)
        y = rr.randrange(70, H - 20)
        r = 1 + (i % 3)
        ellipse(d, (x-r, y-r, x+r, y+r), fill=alpha(pal['b'], 70 + (i % 5) * 24))
    if 'star' in motifs:
        for x, y in ((180, 150), (742, 185), (688, 116), (235, 228)):
            line(d, [(x - 10, y), (x + 10, y)], alpha(pal['b'], 110), 2)
            line(d, [(x, y - 10), (x, y + 10)], alpha(pal['b'], 110), 2)
    if 'flame' in motifs:
        for x in (250, 706):
            poly(d, [(x, 530), (x - 22, 595), (x, 566), (x + 18, 602)], alpha(pal['a'], 78))
    if rarity == 'legendary':
        for rr in (70, 110, 150):
            ellipse(d, (480 - rr, 226 - rr, 480 + rr, 226 + rr), outline=alpha(pal['a'], 36), width=2)
    if kind == 'evolution':
        for side in (-1,1):
            poly(d, [(480, 210),(480+side*170,120),(480+side*65,255)], alpha(pal['a'],50))
    glow = fx.filter(ImageFilter.GaussianBlur(radius=6))
    glow = Image.blend(glow, fx, 0.55)
    return Image.alpha_composite(img, glow)


def render_card(card: dict) -> Image.Image:
    name = card['name']
    rng = random.Random(seed_for(card['id']))
    phase = detect_phase(name + ' ' + card['id'])
    motifs = motif_flags(name + ' ' + card['id'])
    kind = card['kind']
    pal = themed_palette(card['element'], phase, motifs)
    img = draw_background(rng, pal, phase, motifs, kind)
    d = ImageDraw.Draw(img, 'RGBA')
    arch = detect_archetype(name + ' ' + card['id'])
    if kind == 'spell':
        draw_spell_scene(d, rng, name + ' ' + card['id'], pal, card['rarity'])
    elif kind == 'trap':
        draw_trap_scene(d, rng, name + ' ' + card['id'], pal, card['rarity'])
    elif kind == 'fusion':
        if arch in ('dragon', 'wolf', 'lion', 'bird', 'golem'):
            draw_beast(d, rng, name, arch, pal, card['rarity'], kind)
        else:
            draw_humanoid(d, rng, name, arch, pal, card['rarity'], kind)
        # fusion ring accents
        for ang in range(0,360,60):
            rad=math.radians(ang)
            x=480+math.cos(rad)*200; y=250+math.sin(rad)*110
            ellipse(d,(x-14,y-14,x+14,y+14), fill=alpha(pal['a'],90), outline=alpha(pal['b'],150), width=2)
    elif kind == 'evolution':
        if arch in ('dragon', 'wolf', 'lion', 'bird', 'golem'):
            draw_beast(d, rng, name, arch, pal, card['rarity'], kind)
        else:
            draw_humanoid(d, rng, name, arch, pal, card['rarity'], kind)
        line(d, [(480, 530), (480, 150)], alpha(pal['b'], 90), 3)
        for y in (450, 380, 310, 240):
            poly(d, [(480,y-14),(494,y),(480,y+14),(466,y)], alpha(pal['a'], 85))
    else:
        if arch in ('dragon', 'wolf', 'lion', 'bird', 'golem'):
            draw_beast(d, rng, name, arch, pal, card['rarity'], kind)
        else:
            draw_humanoid(d, rng, name, arch, pal, card['rarity'], kind)
    img = add_foreground_fx(img, pal, name + ' ' + card['id'], card['rarity'], kind)
    # border vignette
    shade = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shade, 'RGBA')
    for margin, a in ((36, 18), (72, 28), (108, 42)):
        rounded_rect(sd, (margin, margin, W - margin, H - margin), 28, None, outline=(0, 0, 0, a), width=max(1, margin // 36 + 1))
    img = Image.alpha_composite(img, shade)
    return img.convert('RGB')


def all_target_ids(meta: dict[str, dict]) -> list[str]:
    current = [p.stem for p in ART.glob('*.webp') if p.stem != 'fallback']
    # include missing v37 ids present in metadata so total coverage is higher
    for cid in meta:
        if cid.startswith('v37_time_') and cid not in current:
            current.append(cid)
    return sorted(dict.fromkeys(current))


def normalize_card(cid: str, meta: dict[str, dict]) -> dict:
    if cid in meta:
        c = dict(meta[cid])
    else:
        c = {'id': cid, 'name': title_from_id(cid), 'kind': infer_kind(cid), 'rarity': infer_rarity(cid), 'element': infer_element(cid, cid)}
    c['name'] = MANUAL_RENAMES.get(cid, c['name'])
    c.setdefault('kind', infer_kind(cid))
    c.setdefault('rarity', infer_rarity(cid))
    c.setdefault('element', infer_element(cid, c['name']))
    return c


def main():
    meta = load_metadata()
    ids = all_target_ids(meta)
    cards = [normalize_card(cid, meta) for cid in ids]
    counts = Counter(c['kind'] for c in cards)
    print('targets', len(cards), 'kind counts', dict(counts))
    written = []
    for idx, card in enumerate(cards, 1):
        out = ART / f"{card['id']}.webp"
        img = render_card(card)
        out.parent.mkdir(parents=True, exist_ok=True)
        img.save(out, 'WEBP', quality=86, method=4)
        written.append(card['id'])
        if idx % 100 == 0 or idx == len(cards):
            print(f'generated {idx}/{len(cards)}')
    docs = ROOT / 'docs'
    docs.mkdir(exist_ok=True)
    (docs / 'FULL_CARD_ART_PATCH_IDS.txt').write_text('\n'.join(written), encoding='utf-8')
    summary = [f'total,{len(written)}'] + [f'{k},{v}' for k,v in counts.items()]
    (docs / 'FULL_CARD_ART_PATCH_SUMMARY.csv').write_text('\n'.join(summary), encoding='utf-8')
    print('done')

if __name__ == '__main__':
    main()
