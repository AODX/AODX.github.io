'use strict';

/* =========================================================
   Pixel RPG Stable Full 01
   - 로그인/회원가입 클릭 복구
   - 캐릭터 생성/이어하기
   - 10개 도시
   - 택시 이동
   - 도시별 사냥터
   - 몬스터 접촉 피해
   - Z 줍기
   - 인벤토리 / 스탯 / 스킬 / 퀘스트
   - 장비 장착 시 외형 반영
   - HP/MP 자동 회복
   - 초보자 스킬 레벨 해금
========================================================= */

/* =========================================================
   DOM / Canvas
========================================================= */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 720;
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.display = 'block';
canvas.style.background = '#87ceeb';

ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;

const auth = document.getElementById('auth');
const characterScreen = document.getElementById('characterScreen');
const characterMenu = document.getElementById('characterMenu');
const help = document.getElementById('hudHelp');
const preview = document.getElementById('preview');
const menuPreview = document.getElementById('menuPreview');

function el(id) {
  return document.getElementById(id);
}

/* =========================================================
   Auth State
========================================================= */

let token = localStorage.getItem('pixel-rpg-token') || '';
let currentUser = null;
let loginMode = 'login';

const selected = {
  skin: '#ffd6a6',
  hair: '#2b160e',
  hairStyle: 'basic',
  faceStyle: 'normal'
};

/* =========================================================
   Input
========================================================= */

const keys = new Set();

/* =========================================================
   Data
========================================================= */

const TOWNS = [
  {
    id: 'lumina',
    name: '루미나',
    title: '초보자의 마을',
    theme: 'grass',
    taxiCost: 0,
    hunt: 'lumina_field',
    bgTop: '#7bd4ff',
    bgBottom: '#dff7ff'
  },
  {
    id: 'greenwood',
    name: '그린우드',
    title: '숲의 도시',
    theme: 'forest',
    taxiCost: 80,
    hunt: 'greenwood_forest',
    bgTop: '#74d4ff',
    bgBottom: '#e4ffe2'
  },
  {
    id: 'ellenium',
    name: '일레니움',
    title: '마법의 도시',
    theme: 'magic',
    taxiCost: 130,
    hunt: 'ellenium_grove',
    job: 'mage',
    bgTop: '#8dc7ff',
    bgBottom: '#eee2ff'
  },
  {
    id: 'valor',
    name: '발로란',
    title: '전사의 요새',
    theme: 'fortress',
    taxiCost: 150,
    hunt: 'valor_wall',
    job: 'warrior',
    bgTop: '#9cc9ff',
    bgBottom: '#fff0d6'
  },
  {
    id: 'shadowport',
    name: '섀도포트',
    title: '도적의 항구',
    theme: 'port',
    taxiCost: 180,
    hunt: 'shadow_alley',
    job: 'rogue',
    bgTop: '#5e8fc7',
    bgBottom: '#dae8ff'
  },
  {
    id: 'sylvania',
    name: '실바니아',
    title: '궁수의 마을',
    theme: 'forest',
    taxiCost: 180,
    hunt: 'sylvania_range',
    job: 'archer',
    bgTop: '#79d9ff',
    bgBottom: '#efffde'
  },
  {
    id: 'irondeep',
    name: '아이언딥',
    title: '광산 도시',
    theme: 'mine',
    taxiCost: 230,
    hunt: 'irondeep_mine',
    bgTop: '#87a8c5',
    bgBottom: '#d5d7da'
  },
  {
    id: 'frosthall',
    name: '프로스트홀',
    title: '얼음 마을',
    theme: 'ice',
    taxiCost: 260,
    hunt: 'frost_cave',
    bgTop: '#95eaff',
    bgBottom: '#f4fdff'
  },
  {
    id: 'solas',
    name: '솔라스',
    title: '사막 도시',
    theme: 'desert',
    taxiCost: 300,
    hunt: 'solas_dune',
    bgTop: '#ffd08a',
    bgBottom: '#fff0bd'
  },
  {
    id: 'nocturn',
    name: '노크턴',
    title: '폐허 도시',
    theme: 'ruin',
    taxiCost: 400,
    hunt: 'nocturn_ruins',
    bgTop: '#61708f',
    bgBottom: '#cad4e8'
  }
];

const JOBS = {
  beginner: {
    name: '초보자',
    main: 'str'
  },
  warrior: {
    name: '전사',
    main: 'str'
  },
  mage: {
    name: '마법사',
    main: 'int'
  },
  rogue: {
    name: '도적',
    main: 'luk'
  },
  archer: {
    name: '궁수',
    main: 'dex'
  }
};

const SKILLS = {
  strike: {
    id: 'strike',
    name: '강타',
    job: 'beginner',
    unlockLevel: 2,
    mp: 0,
    power: 1.25,
    range: 70,
    cooldown: 0.35,
    desc: '주먹으로 강하게 공격합니다.'
  },
  stone_throw: {
    id: 'stone_throw',
    name: '돌던지기',
    job: 'beginner',
    unlockLevel: 4,
    mp: 3,
    power: 1.1,
    range: 260,
    cooldown: 0.8,
    projectile: true,
    desc: '돌을 던져 원거리 공격을 합니다.'
  },
  first_aid: {
    id: 'first_aid',
    name: '숨고르기',
    job: 'beginner',
    unlockLevel: 6,
    mp: 6,
    heal: 45,
    cooldown: 6,
    desc: 'HP를 조금 회복합니다.'
  },
  power_slash: {
    id: 'power_slash',
    name: '파워 슬래시',
    job: 'warrior',
    unlockLevel: 10,
    mp: 10,
    power: 1.9,
    range: 110,
    cooldown: 0.8,
    desc: '강한 검기를 휘두릅니다.'
  },
  fireball: {
    id: 'fireball',
    name: '파이어볼',
    job: 'mage',
    unlockLevel: 10,
    mp: 14,
    power: 2.1,
    range: 310,
    cooldown: 1.3,
    projectile: true,
    magic: true,
    desc: '화염구를 발사합니다.'
  },
  double_stab: {
    id: 'double_stab',
    name: '더블 스탭',
    job: 'rogue',
    unlockLevel: 10,
    mp: 9,
    power: 1.35,
    hits: 2,
    range: 85,
    cooldown: 0.65,
    desc: '빠르게 두 번 공격합니다.'
  },
  arrow_shot: {
    id: 'arrow_shot',
    name: '화살 사격',
    job: 'archer',
    unlockLevel: 10,
    mp: 8,
    power: 1.6,
    range: 330,
    cooldown: 0.7,
    projectile: true,
    desc: '화살을 발사합니다.'
  }
};

const ITEMS = {
  hp_potion: {
    id: 'hp_potion',
    name: '체력 물약',
    type: 'consumable',
    icon: 'hp',
    price: 30,
    sell: 8,
    desc: 'HP 80 회복'
  },
  mp_potion: {
    id: 'mp_potion',
    name: '마나 물약',
    type: 'consumable',
    icon: 'mp',
    price: 35,
    sell: 9,
    desc: 'MP 50 회복'
  },
  slime_jelly: {
    id: 'slime_jelly',
    name: '슬라임 젤리',
    type: 'etc',
    icon: 'drop',
    sell: 5
  },
  mushroom_spore: {
    id: 'mushroom_spore',
    name: '버섯 포자',
    type: 'etc',
    icon: 'drop',
    sell: 8
  },
  blue_crystal: {
    id: 'blue_crystal',
    name: '푸른 결정',
    type: 'etc',
    icon: 'crystal',
    sell: 12
  },
  rusted_blade: {
    id: 'rusted_blade',
    name: '녹슨 검 파편',
    type: 'etc',
    icon: 'sword',
    sell: 12
  },
  black_hide: {
    id: 'black_hide',
    name: '검은 가죽',
    type: 'etc',
    icon: 'drop',
    sell: 12
  },
  hard_feather: {
    id: 'hard_feather',
    name: '단단한 깃털',
    type: 'etc',
    icon: 'feather',
    sell: 12
  },
  ore_piece: {
    id: 'ore_piece',
    name: '광석 조각',
    type: 'etc',
    icon: 'ore',
    sell: 18
  },
  ice_shard: {
    id: 'ice_shard',
    name: '얼음 조각',
    type: 'etc',
    icon: 'ice',
    sell: 20
  },
  desert_scale: {
    id: 'desert_scale',
    name: '사막 비늘',
    type: 'etc',
    icon: 'scale',
    sell: 24
  },
  ruin_core: {
    id: 'ruin_core',
    name: '폐허의 핵',
    type: 'etc',
    icon: 'core',
    sell: 35
  },
  wooden_sword: {
    id: 'wooden_sword',
    name: '나무 검',
    type: 'weapon',
    icon: 'sword',
    price: 80,
    sell: 20,
    atk: 4,
    desc: '공격력 +4'
  },
  iron_sword: {
    id: 'iron_sword',
    name: '철검',
    type: 'weapon',
    icon: 'sword',
    price: 240,
    sell: 60,
    atk: 12,
    desc: '공격력 +12'
  },
  mage_staff: {
    id: 'mage_staff',
    name: '수습 지팡이',
    type: 'weapon',
    icon: 'staff',
    price: 250,
    sell: 60,
    matk: 15,
    int: 3,
    desc: '마법공격 +15'
  },
  hunter_bow: {
    id: 'hunter_bow',
    name: '사냥꾼 활',
    type: 'weapon',
    icon: 'bow',
    price: 260,
    sell: 65,
    atk: 9,
    dex: 4,
    desc: '공격력 +9, DEX +4'
  },
  rogue_dagger: {
    id: 'rogue_dagger',
    name: '그림자 단검',
    type: 'weapon',
    icon: 'dagger',
    price: 280,
    sell: 70,
    atk: 8,
    luk: 5,
    desc: '공격력 +8, LUK +5'
  },
  cloth_armor: {
    id: 'cloth_armor',
    name: '천 갑옷',
    type: 'armor',
    icon: 'armor',
    price: 110,
    sell: 28,
    def: 4,
    hp: 20,
    desc: '방어 +4'
  },
  iron_armor: {
    id: 'iron_armor',
    name: '철 갑옷',
    type: 'armor',
    icon: 'armor',
    price: 320,
    sell: 80,
    def: 13,
    hp: 70,
    desc: '방어 +13'
  },
  magic_robe: {
    id: 'magic_robe',
    name: '마법 로브',
    type: 'armor',
    icon: 'armor',
    price: 330,
    sell: 82,
    def: 6,
    mp: 80,
    int: 5,
    desc: 'INT +5'
  },
  lucky_ring: {
    id: 'lucky_ring',
    name: '행운 반지',
    type: 'accessory',
    icon: 'ring',
    price: 250,
    sell: 60,
    luk: 5,
    crit: 3,
    desc: 'LUK +5'
  },
  swift_charm: {
    id: 'swift_charm',
    name: '민첩 부적',
    type: 'accessory',
    icon: 'ring',
    price: 260,
    sell: 65,
    dex: 5,
    speed: 12,
    desc: 'DEX +5'
  }
};

const SHOP_ITEMS = [
  'hp_potion',
  'mp_potion',
  'wooden_sword',
  'iron_sword',
  'mage_staff',
  'hunter_bow',
  'rogue_dagger',
  'cloth_armor',
  'iron_armor',
  'magic_robe',
  'lucky_ring',
  'swift_charm'
];

/* =========================================================
   Expanded Equipment Catalog / Tooltips / Enhancement
========================================================= */

const TOWN_LEVELS = {
  lumina: 'Lv.1~5',
  greenwood: 'Lv.4~9',
  ellenium: 'Lv.8~15',
  valor: 'Lv.8~15',
  shadowport: 'Lv.9~17',
  sylvania: 'Lv.9~17',
  irondeep: 'Lv.14~22',
  frosthall: 'Lv.18~28',
  solas: 'Lv.22~35',
  nocturn: 'Lv.28~45'
};

TOWNS.forEach(function (town) {
  town.recommendLevel = TOWN_LEVELS[town.id] || 'Lv.1~10';
});

function buildEquipmentCatalog() {
  const catalog = {};
  const groups = [
    { prefix: 'staff', type: 'weapon', weaponType: 'staff', equipSlot: 'weapon', icon: 'staff', korean: '스태프', main: 'int', atkKey: 'matk', base: 10, colorA: '#b197fc', colorB: '#74c0fc', count: 20 },
    { prefix: 'bow', type: 'weapon', weaponType: 'bow', equipSlot: 'weapon', icon: 'bow', korean: '활', main: 'dex', atkKey: 'atk', base: 8, colorA: '#ffd43b', colorB: '#8ce99a', count: 20 },
    { prefix: 'sword', type: 'weapon', weaponType: 'sword', equipSlot: 'weapon', icon: 'sword', korean: '검', main: 'str', atkKey: 'atk', base: 9, colorA: '#f97316', colorB: '#e5e7eb', count: 20 },
    { prefix: 'dagger', type: 'weapon', weaponType: 'dagger', equipSlot: 'weapon', icon: 'dagger', korean: '단검', main: 'luk', atkKey: 'atk', base: 7, colorA: '#e5e7eb', colorB: '#b197fc', count: 20 },
    { prefix: 'helmet', type: 'helmet', equipSlot: 'helmet', icon: 'helmet', korean: '헬멧', main: 'str', atkKey: 'def', base: 4, colorA: '#adb5bd', colorB: '#74c0fc', count: 20 },
    { prefix: 'knee', type: 'knee', equipSlot: 'knee', icon: 'knee', korean: '무릎 방어구', main: 'dex', atkKey: 'def', base: 3, colorA: '#94a3b8', colorB: '#ffd43b', count: 20 },
    { prefix: 'armor', type: 'armor', equipSlot: 'armor', icon: 'armor', korean: '갑옷', main: 'str', atkKey: 'def', base: 6, colorA: '#60a5fa', colorB: '#c084fc', count: 20 },
    { prefix: 'accessory', type: 'accessory', equipSlot: 'accessory', icon: 'ring', korean: '악세사리', main: 'luk', atkKey: 'crit', base: 2, colorA: '#ffd43b', colorB: '#f472b6', count: 30 }
  ];

  const grades = ['낡은', '수습', '견고한', '빛나는', '강화', '기사', '정령', '영웅', '신비', '전설'];

  groups.forEach(function (g) {
    for (let i = 1; i <= g.count; i++) {
      const req = Math.max(1, Math.floor((i - 1) * 3 + (g.type === 'accessory' ? 1 : 0)));
      const id = `${g.prefix}_${String(i).padStart(2, '0')}`;
      const grade = grades[Math.min(grades.length - 1, Math.floor((i - 1) / 2))];
      const item = {
        id,
        name: `${grade} ${g.korean} ${i}`,
        type: g.type,
        weaponType: g.weaponType,
        equipSlot: g.equipSlot,
        icon: g.icon,
        reqLevel: req,
        price: 80 + i * 55,
        sell: 20 + i * 14,
        pixel: {
          a: i % 2 ? g.colorA : g.colorB,
          b: i % 3 ? g.colorB : g.colorA,
          variant: i
        },
        desc: `장착 가능 레벨 ${req}`
      };

      item[g.atkKey] = g.base + i * (g.type === 'weapon' ? 3 : 2);
      item[g.main] = Math.floor(i / 3) + 1;
      if (g.type === 'armor') item.hp = 20 + i * 12;
      if (g.type === 'helmet') item.hp = 10 + i * 6;
      if (g.type === 'knee') item.speed = Math.floor(i / 2);
      if (g.type === 'accessory') item.crit = 1 + Math.floor(i / 4);
      catalog[id] = item;
    }
  });

  return catalog;
}

Object.assign(ITEMS, buildEquipmentCatalog());

Object.assign(ITEMS.wooden_sword, { equipSlot: 'weapon', weaponType: 'sword', reqLevel: 1, pixel: { a: '#a16207', b: '#f59e0b', variant: 1 } });
Object.assign(ITEMS.iron_sword, { equipSlot: 'weapon', weaponType: 'sword', reqLevel: 6, pixel: { a: '#e5e7eb', b: '#f97316', variant: 2 } });
Object.assign(ITEMS.mage_staff, { equipSlot: 'weapon', weaponType: 'staff', reqLevel: 8, pixel: { a: '#b197fc', b: '#74c0fc', variant: 3 } });
Object.assign(ITEMS.hunter_bow, { equipSlot: 'weapon', weaponType: 'bow', reqLevel: 8, pixel: { a: '#ffd43b', b: '#8ce99a', variant: 4 } });
Object.assign(ITEMS.rogue_dagger, { equipSlot: 'weapon', weaponType: 'dagger', reqLevel: 8, pixel: { a: '#e5e7eb', b: '#b197fc', variant: 5 } });
Object.assign(ITEMS.cloth_armor, { equipSlot: 'armor', reqLevel: 1, pixel: { a: '#60a5fa', b: '#f8f9ff', variant: 1 } });
Object.assign(ITEMS.iron_armor, { equipSlot: 'armor', reqLevel: 8, pixel: { a: '#8fa3b8', b: '#52677d', variant: 2 } });
Object.assign(ITEMS.magic_robe, { equipSlot: 'armor', reqLevel: 8, pixel: { a: '#8b5cf6', b: '#5b36b8', variant: 3 } });
Object.assign(ITEMS.lucky_ring, { equipSlot: 'accessory', reqLevel: 5, pixel: { a: '#ffd43b', b: '#f472b6', variant: 1 } });
Object.assign(ITEMS.swift_charm, { equipSlot: 'accessory', reqLevel: 5, pixel: { a: '#8ce99a', b: '#74c0fc', variant: 2 } });

SHOP_ITEMS.push(
  ...Object.keys(ITEMS).filter(function (id) {
    return /^(staff|bow|sword|dagger|helmet|knee|armor|accessory)_/.test(id) && Number(id.slice(-2)) <= 10;
  })
);

const BASIC_EQUIPMENT_SHOP_ITEMS = [
  'wooden_sword', 'cloth_armor', 'hp_potion', 'mp_potion',
  'staff_01', 'bow_01', 'sword_01', 'dagger_01',
  'helmet_01', 'knee_01', 'armor_01', 'accessory_01',
  'staff_02', 'bow_02', 'sword_02', 'dagger_02',
  'helmet_02', 'knee_02', 'armor_02', 'accessory_02'
];

function itemRefId(ref) {
  return typeof ref === 'string' ? ref : ref && ref.id;
}

function itemEnhance(ref) {
  return typeof ref === 'object' && ref ? (ref.enhance || 0) : 0;
}

function makeEquippedRef(id) {
  return { id, enhance: 0 };
}

function getItemData(ref) {
  return ITEMS[itemRefId(ref)] || null;
}

function getItemDisplayName(ref) {
  const item = getItemData(ref);
  const plus = itemEnhance(ref);
  return item ? `${plus ? '+' + plus + ' ' : ''}${item.name}` : '';
}

function getEquipSlotForItem(item) {
  if (!item) return null;
  if (item.equipSlot) return item.equipSlot;
  if (item.type === 'weapon') return 'weapon';
  if (item.type === 'armor') return 'armor';
  if (item.type === 'accessory') return 'accessory';
  return null;
}

function getEnhanceBonus(ref, statKey) {
  const plus = itemEnhance(ref);
  if (!plus) return 0;
  if (statKey === 'atk' || statKey === 'matk') return plus * 3;
  if (statKey === 'def') return plus * 2;
  if (statKey === 'hp') return plus * 12;
  if (statKey === 'mp') return plus * 10;
  if (statKey === 'crit') return Math.floor(plus / 2);
  return Math.floor(plus / 3);
}

function getEnhanceRate(plus) {
  return [1, 0.92, 0.84, 0.72, 0.60, 0.48, 0.36, 0.26, 0.18, 0.12][plus] || 0;
}

function getDestroyRate(plus) {
  if (plus < 5) return 0;
  return [0, 0, 0, 0, 0, 0.08, 0.12, 0.18, 0.25, 0.35][plus] || 0.45;
}

function getEnhanceCost(ref) {
  const item = getItemData(ref);
  const plus = itemEnhance(ref);
  return Math.floor(((item && item.price) || 100) * (0.35 + plus * 0.22));
}


const QUESTS = {
  tutorial: {
    id: 'tutorial',
    title: '초보자의 첫 사냥',
    town: 'lumina',
    npc: '장로 구름',
    desc: '초록 슬라임 5마리를 처치하세요.',
    goals: [
      {
        type: 'kill',
        family: 'slime',
        need: 5,
        count: 0
      }
    ],
    rewardGold: 80,
    rewardExp: 90,
    rewardItems: [
      {
        id: 'hp_potion',
        count: 3
      }
    ]
  },
  mage_job: {
    id: 'mage_job',
    title: '마법사의 길',
    town: 'ellenium',
    npc: '대마법사 이렌',
    desc: '마나 정령 12마리를 처치하고 푸른 결정 8개를 모으세요.',
    jobReward: 'mage',
    goals: [
      {
        type: 'kill',
        family: 'mana',
        need: 12,
        count: 0
      },
      {
        type: 'item',
        itemId: 'blue_crystal',
        need: 8,
        count: 0
      }
    ],
    rewardGold: 300,
    rewardExp: 250
  },
  warrior_job: {
    id: 'warrior_job',
    title: '전사의 증명',
    town: 'valor',
    npc: '기사단장 로한',
    desc: '철갑 멧돼지 12마리를 처치하고 녹슨 검 파편 8개를 모으세요.',
    jobReward: 'warrior',
    goals: [
      {
        type: 'kill',
        family: 'boar',
        need: 12,
        count: 0
      },
      {
        type: 'item',
        itemId: 'rusted_blade',
        need: 8,
        count: 0
      }
    ],
    rewardGold: 300,
    rewardExp: 250
  },
  rogue_job: {
    id: 'rogue_job',
    title: '그림자 시험',
    town: 'shadowport',
    npc: '그림자 란',
    desc: '그림자 몬스터 12마리를 처치하고 검은 가죽 8개를 모으세요.',
    jobReward: 'rogue',
    goals: [
      {
        type: 'kill',
        family: 'shadow',
        need: 12,
        count: 0
      },
      {
        type: 'item',
        itemId: 'black_hide',
        need: 8,
        count: 0
      }
    ],
    rewardGold: 300,
    rewardExp: 250
  },
  archer_job: {
    id: 'archer_job',
    title: '숲의 사수',
    town: 'sylvania',
    npc: '명궁 세리아',
    desc: '숲 벌레 12마리를 처치하고 단단한 깃털 8개를 모으세요.',
    jobReward: 'archer',
    goals: [
      {
        type: 'kill',
        family: 'bug',
        need: 12,
        count: 0
      },
      {
        type: 'item',
        itemId: 'hard_feather',
        need: 8,
        count: 0
      }
    ],
    rewardGold: 300,
    rewardExp: 250
  }
};

const HUNTS = {
  lumina_field: {
    town: 'lumina',
    name: '루미나 들판',
    baseLevel: 1,
    families: ['slime', 'mushroom']
  },
  greenwood_forest: {
    town: 'greenwood',
    name: '그린우드 숲',
    baseLevel: 4,
    families: ['mushroom', 'bug']
  },
  ellenium_grove: {
    town: 'ellenium',
    name: '마나 숲',
    baseLevel: 8,
    families: ['mana', 'slime']
  },
  valor_wall: {
    town: 'valor',
    name: '요새 외벽',
    baseLevel: 8,
    families: ['boar', 'mushroom']
  },
  shadow_alley: {
    town: 'shadowport',
    name: '어둠 골목',
    baseLevel: 9,
    families: ['shadow', 'slime']
  },
  sylvania_range: {
    town: 'sylvania',
    name: '실바니아 사냥터',
    baseLevel: 9,
    families: ['bug', 'mushroom']
  },
  irondeep_mine: {
    town: 'irondeep',
    name: '아이언딥 광산',
    baseLevel: 14,
    families: ['ore', 'boar']
  },
  frost_cave: {
    town: 'frosthall',
    name: '프로스트 동굴',
    baseLevel: 18,
    families: ['ice', 'mana']
  },
  solas_dune: {
    town: 'solas',
    name: '솔라스 사막',
    baseLevel: 22,
    families: ['desert', 'boar']
  },
  nocturn_ruins: {
    town: 'nocturn',
    name: '노크턴 폐허',
    baseLevel: 28,
    families: ['ruin', 'shadow']
  }
};

const FAMILY_DATA = {
  slime: {
    name: '슬라임',
    drop: 'slime_jelly',
    color: '#62df75',
    shape: 'slime'
  },
  mushroom: {
    name: '버섯',
    drop: 'mushroom_spore',
    color: '#d98a3a',
    shape: 'mushroom'
  },
  mana: {
    name: '마나 정령',
    drop: 'blue_crystal',
    color: '#74c0fc',
    shape: 'spirit'
  },
  boar: {
    name: '멧돼지',
    drop: 'rusted_blade',
    color: '#9b6b42',
    shape: 'boar'
  },
  shadow: {
    name: '그림자 괴물',
    drop: 'black_hide',
    color: '#5b4a7b',
    shape: 'ogre'
  },
  bug: {
    name: '숲 벌레',
    drop: 'hard_feather',
    color: '#77c76d',
    shape: 'bug'
  },
  ore: {
    name: '광석 골렘',
    drop: 'ore_piece',
    color: '#8b949e',
    shape: 'golem'
  },
  ice: {
    name: '얼음 정령',
    drop: 'ice_shard',
    color: '#8cecff',
    shape: 'spirit'
  },
  desert: {
    name: '모래 도마뱀',
    drop: 'desert_scale',
    color: '#d6a15d',
    shape: 'lizard'
  },
  ruin: {
    name: '폐허 수호자',
    drop: 'ruin_core',
    color: '#65708b',
    shape: 'golem'
  }
};

const MONSTER_PREFIX = [
  '작은',
  '초록',
  '파란',
  '붉은',
  '사나운',
  '빛나는',
  '거친',
  '검은',
  '오래된',
  '강화된'
];

/* =========================================================
   Game State
========================================================= */

function createPlayer() {
  return {
    x: 260,
    y: 560,
    vx: 0,
    vy: 0,
    face: 1,
    grounded: false,
    anim: 'idle',
    animTime: 0,
    attackTime: 0,
    invincible: 0,
    hurtTime: 0,

    level: 1,
    exp: 0,
    nextExp: 120,

    hp: 150,
    maxHp: 150,
    mp: 60,
    maxMp: 60,

    attackPower: 15,
    magicPower: 8,
    defense: 2,
    critRate: 5,
    speed: 235,

    character: {
      name: '초보자',
      job: 'beginner',
      skin: '#ffd6a6',
      hair: '#2b160e',
      hairStyle: 'basic',
      faceStyle: 'normal'
    }
  };
}

const game = {
  ready: false,
  mode: 'town',
  townId: 'lumina',
  huntId: 'lumina_field',
  width: 4300,
  ground: 560,
  cameraX: 0,
  last: performance.now(),

  platforms: [],
  portals: [],
  npcs: [],
  monsters: [],
  drops: [],
  particles: [],
  texts: [],
  projectiles: [],

  dialog: null,
  taxiOpen: false,
  shopOpen: false,
  shopScroll: 0,
  blacksmithOpen: false,
  autoSaveTimer: 0,
  saving: false,

  player: createPlayer()
};

const stats = {
  open: false,
  str: 4,
  dex: 4,
  int: 4,
  luk: 4,
  ap: 5
};

const inventory = {
  open: false,
  items: [
    stack('hp_potion', 10),
    stack('mp_potion', 10),
    stack('wooden_sword', 1),
    stack('cloth_armor', 1)
  ],
  quickSlots: ['hp_potion', 'mp_potion', null, null]
};

const EQUIP_SLOT_KEYS = ['weapon', 'helmet', 'armor', 'knee', 'accessory'];
const EQUIP_SLOT_NAMES = { weapon: '무기', helmet: '헬멧', armor: '갑옷', knee: '무릎 방어구', accessory: '악세사리' };

const equipment = {
  weapon: null,
  helmet: null,
  armor: null,
  knee: null,
  accessory: null
};

const dragState = {
  active: false,
  kind: null,
  index: -1,
  slot: null,
  item: null,
  x: 0,
  y: 0,
  startedAt: 0
};

const skills = {
  open: false,
  unlocked: [],
  hotkeys: {
    k: null,
    l: null,
    semicolon: null
  },
  cooldowns: {}
};

const quests = {
  open: false,
  active: [],
  completed: []
};

const wallet = {
  gold: 120
};

function stack(id, count, enhance) {
  const out = { id, count };
  if (enhance) out.enhance = enhance;
  return out;
}

function sameItemRef(a, b) {
  return itemRefId(a) === itemRefId(b) && itemEnhance(a) === itemEnhance(b);
}

function cloneItemRef(ref, count) {
  return stack(itemRefId(ref), count, itemEnhance(ref));
}

/* =========================================================
   Auth / API
========================================================= */

async function api(path, body) {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  let data = null;

  try {
    data = await res.json();
  } catch (err) {
    throw new Error('서버 응답을 읽지 못했습니다.');
  }

  if (!data.ok) {
    throw new Error(data.error || '요청 실패');
  }

  return data;
}

function hideAllPanels() {
  if (auth) auth.classList.add('hidden');
  if (characterScreen) characterScreen.classList.add('hidden');
  if (characterMenu) characterMenu.classList.add('hidden');
  if (help) help.classList.add('hidden');
}

function showAuth() {
  game.ready = false;
  hideAllPanels();
  if (auth) auth.classList.remove('hidden');
}

function showCreator() {
  game.ready = false;
  hideAllPanels();
  if (characterScreen) characterScreen.classList.remove('hidden');
}

function showCharacterMenu(user) {
  game.ready = false;
  hideAllPanels();

  if (characterMenu) characterMenu.classList.remove('hidden');

  const menuName = el('menuName');
  const p = user && user.save && user.save.player ? user.save.player : null;

  if (menuName && p && p.character) {
    menuName.textContent = `${p.character.name} Lv.${p.level || 1}`;
  }
}

function setMode(mode) {
  loginMode = mode;

  const loginTab = el('tabLogin');
  const registerTab = el('tabRegister');
  const authBtn = el('authBtn');
  const authMsg = el('authMsg');

  if (loginTab) loginTab.classList.toggle('active', mode === 'login');
  if (registerTab) registerTab.classList.toggle('active', mode === 'register');
  if (authBtn) authBtn.textContent = mode === 'login' ? '로그인' : '회원가입';
  if (authMsg) authMsg.textContent = '';
}

async function submitAuth(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const authMsg = el('authMsg');

  try {
    if (authMsg) authMsg.textContent = '';

    const usernameInput = el('username');
    const passwordInput = el('password');

    const username = usernameInput ? usernameInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!username || !password) {
      throw new Error('아이디와 비밀번호를 입력해주세요.');
    }

    const path = loginMode === 'login' ? '/api/login' : '/api/register';
    const data = await api(path, { username, password });

    token = data.token;
    localStorage.setItem('pixel-rpg-token', token);

    currentUser = data.user;

    if (currentUser.hasCharacter && currentUser.save) {
      showCharacterMenu(currentUser);
    } else {
      showCreator();
    }
  } catch (err) {
    if (authMsg) authMsg.textContent = err.message;
  }
}

async function createCharacterAndStart() {
  const createMsg = el('createMsg');

  try {
    if (createMsg) createMsg.textContent = '';

    const nameInput = el('charName');
    const nickname = nameInput ? nameInput.value.trim() : '';

    if (!nickname || nickname.length < 2) {
      throw new Error('닉네임은 2자 이상이어야 합니다.');
    }

    const character = {
      name: nickname,
      job: 'beginner',
      skin: selected.skin,
      hair: selected.hair,
      hairStyle: selected.hairStyle,
      faceStyle: selected.faceStyle
    };

    const data = await api('/api/create-character', { character });

    currentUser = data.user;
    startGame(currentUser.save);
  } catch (err) {
    if (createMsg) createMsg.textContent = err.message;
  }
}

function logout() {
  token = '';
  currentUser = null;
  localStorage.removeItem('pixel-rpg-token');
  showAuth();
}

function startGame(save) {
  hideAllPanels();
  if (help) help.classList.remove('hidden');

  hydrateSave(save || {});

  const town = getTown(game.townId || 'lumina');
  loadTown(town.id);

  game.player.y = game.ground;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.grounded = true;

  recalcStats();
  refreshUnlockedSkills();

  game.ready = true;
}

function hydrateSave(save) {
  const basePlayer = createPlayer();
  const savedPlayer = save.player || {};

  game.player = {
    ...basePlayer,
    ...savedPlayer,
    character: {
      ...basePlayer.character,
      ...(savedPlayer.character || {})
    }
  };

  wallet.gold = Number.isFinite(save.gold) ? save.gold : wallet.gold;
  game.townId = save.townId || 'lumina';
  game.huntId = save.huntId || getTown(game.townId).hunt;

  if (save.stats) {
    stats.str = save.stats.str ?? stats.str;
    stats.dex = save.stats.dex ?? stats.dex;
    stats.int = save.stats.int ?? stats.int;
    stats.luk = save.stats.luk ?? stats.luk;
    stats.ap = save.stats.ap ?? stats.ap;
  }

  if (save.inventory) {
    if (Array.isArray(save.inventory.items)) inventory.items = save.inventory.items;
    if (Array.isArray(save.inventory.quickSlots)) inventory.quickSlots = save.inventory.quickSlots;
  }

  if (save.equipment) {
    EQUIP_SLOT_KEYS.forEach(function (slot) {
      equipment[slot] = save.equipment[slot] || null;
    });
  }

  if (save.skills) {
    if (Array.isArray(save.skills.unlocked)) skills.unlocked = save.skills.unlocked;
    if (save.skills.hotkeys) {
      skills.hotkeys.k = save.skills.hotkeys.k || null;
      skills.hotkeys.l = save.skills.hotkeys.l || null;
      skills.hotkeys.semicolon = save.skills.hotkeys.semicolon || null;
    }
  }

  if (save.quests) {
    quests.active = Array.isArray(save.quests.active) ? save.quests.active : [];
    quests.completed = Array.isArray(save.quests.completed) ? save.quests.completed : [];
  }
}

async function saveGame(silent) {
  if (!game.ready || !token || game.saving) return;

  const save = {
    player: {
      x: game.player.x,
      y: game.player.y,
      level: game.player.level,
      exp: game.player.exp,
      nextExp: game.player.nextExp,
      hp: game.player.hp,
      maxHp: game.player.maxHp,
      mp: game.player.mp,
      maxMp: game.player.maxMp,
      character: game.player.character
    },
    gold: wallet.gold,
    townId: game.townId,
    huntId: game.huntId,
    stats: {
      str: stats.str,
      dex: stats.dex,
      int: stats.int,
      luk: stats.luk,
      ap: stats.ap
    },
    inventory: {
      items: inventory.items,
      quickSlots: inventory.quickSlots
    },
    equipment,
    skills: {
      unlocked: skills.unlocked,
      hotkeys: skills.hotkeys
    },
    quests: {
      active: quests.active,
      completed: quests.completed
    }
  };

  game.saving = true;

  try {
    await api('/api/save', save);
    if (!silent) makeText('저장 완료', game.player.x, game.player.y - 90, '#9bf6ff');
  } catch (err) {
    if (!silent) makeText('저장 실패', game.player.x, game.player.y - 90, '#ff8787');
  } finally {
    game.saving = false;
  }
}

function markAutoSaveSoon() {
  if (!game.ready) return;
  game.autoSaveTimer = Math.max(game.autoSaveTimer, 4);
}

function updateAutoSave(dt) {
  if (!game.ready || !token) return;
  game.autoSaveTimer += dt;
  if (game.autoSaveTimer >= 30) {
    game.autoSaveTimer = 0;
    saveGame(true);
  }
}

/* =========================================================
   UI Binding
========================================================= */

function bindUI() {
  const tabLogin = el('tabLogin');
  const tabRegister = el('tabRegister');
  const authBtn = el('authBtn');
  const startNewBtn = el('startNewBtn');
  const continueBtn = el('continueBtn');
  const logoutBtn = el('logoutBtn');
  const logoutBtn2 = el('logoutBtn2');

  if (tabLogin) {
    tabLogin.addEventListener('click', function () {
      setMode('login');
    });
  }

  if (tabRegister) {
    tabRegister.addEventListener('click', function () {
      setMode('register');
    });
  }

  if (authBtn) {
    authBtn.addEventListener('click', submitAuth);
  }

  if (startNewBtn) {
    startNewBtn.addEventListener('click', createCharacterAndStart);
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', function () {
      startGame(currentUser ? currentUser.save : {});
    });
  }

  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  if (logoutBtn2) logoutBtn2.addEventListener('click', logout);

  document.querySelectorAll('.swatches').forEach(function (group) {
    const target = group.dataset.target;

    group.querySelectorAll('span').forEach(function (span) {
      span.addEventListener('click', function () {
        if (!target) return;

        selected[target] = rgbToHex(getComputedStyle(span).backgroundColor);

        group.querySelectorAll('span').forEach(function (s) {
          s.classList.remove('selected');
        });

        span.classList.add('selected');
      });
    });
  });

  document.querySelectorAll('#hairStyleChoices .choice').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selected.hairStyle = btn.dataset.value || 'basic';

      document.querySelectorAll('#hairStyleChoices .choice').forEach(function (b) {
        b.classList.remove('active');
      });

      btn.classList.add('active');
    });
  });

  document.querySelectorAll('#faceStyleChoices .choice').forEach(function (btn) {
    btn.addEventListener('click', function () {
      selected.faceStyle = btn.dataset.value || 'normal';

      document.querySelectorAll('#faceStyleChoices .choice').forEach(function (b) {
        b.classList.remove('active');
      });

      btn.classList.add('active');
    });
  });
}

async function boot() {
  bindUI();
  setMode('login');
  loadTown('lumina');

  if (!token) {
    showAuth();
    return;
  }

  try {
    const data = await api('/api/profile');
    currentUser = data.user;

    if (currentUser.hasCharacter && currentUser.save) {
      showCharacterMenu(currentUser);
    } else {
      showCreator();
    }
  } catch (err) {
    token = '';
    localStorage.removeItem('pixel-rpg-token');
    showAuth();
  }
}

/* =========================================================
   World Loading
========================================================= */

function getTown(id) {
  return TOWNS.find(function (t) {
    return t.id === id;
  }) || TOWNS[0];
}

function getHunt(id) {
  return HUNTS[id] || HUNTS.lumina_field;
}

function loadTown(townId) {
  const town = getTown(townId);

  game.mode = 'town';
  game.townId = town.id;
  game.huntId = town.hunt;
  game.width = 4300;
  game.ground = 560;
  game.platforms = [];
  game.monsters = [];
  game.drops = [];
  game.projectiles = [];
  game.particles = [];

  game.portals = [
    {
      x: 3970,
      y: game.ground,
      type: 'hunt',
      label: '사냥터'
    }
  ];

  game.npcs = [
    {
      type: 'taxi',
      name: '택시 기사',
      x: 420,
      y: game.ground,
      text: '돈을 내고 다른 도시로 이동할 수 있습니다.'
    },
    {
      type: 'merchant',
      name: '상인',
      x: 760,
      y: game.ground,
      text: '부산물을 판매하거나 물약을 구매할 수 있습니다.'
    },
    {
      type: 'weapon',
      name: '장비 상인',
      x: 1100,
      y: game.ground,
      text: '무기, 방어구, 장신구를 판매합니다.'
    },
    {
      type: 'blacksmith',
      name: '대장장이 브론',
      x: 1280,
      y: game.ground,
      text: '장착 중인 장비를 최대 +10까지 강화할 수 있습니다.'
    },
    {
      type: 'quest',
      name: '장로 구름',
      x: 1460,
      y: game.ground,
      quest: 'tutorial',
      text: '처음이라면 사냥 훈련을 받아보세요.'
    }
  ];

  if (town.job === 'mage') {
    game.npcs.push({
      type: 'job',
      name: '대마법사 이렌',
      x: 1840,
      y: game.ground,
      quest: 'mage_job',
      text: '마법사의 길을 걷고 싶나요?'
    });
  }

  if (town.job === 'warrior') {
    game.npcs.push({
      type: 'job',
      name: '기사단장 로한',
      x: 1840,
      y: game.ground,
      quest: 'warrior_job',
      text: '전사의 증명을 보이십시오.'
    });
  }

  if (town.job === 'rogue') {
    game.npcs.push({
      type: 'job',
      name: '그림자 란',
      x: 1840,
      y: game.ground,
      quest: 'rogue_job',
      text: '그림자의 시험을 통과해보겠습니까?'
    });
  }

  if (town.job === 'archer') {
    game.npcs.push({
      type: 'job',
      name: '명궁 세리아',
      x: 1840,
      y: game.ground,
      quest: 'archer_job',
      text: '숲의 사수가 될 준비가 되었나요?'
    });
  }

  game.player.x = clamp(game.player.x || 260, 80, game.width - 100);
  game.player.y = game.ground;
  game.cameraX = clamp(game.player.x - W * 0.42, 0, Math.max(0, game.width - W));
}

function loadHunt(huntId) {
  const hunt = getHunt(huntId);
  const town = getTown(hunt.town);

  game.mode = 'hunt';
  game.huntId = huntId;
  game.townId = town.id;
  game.width = 5400;
  game.ground = 610;
  game.npcs = [];
  game.drops = [];
  game.projectiles = [];
  game.particles = [];
  game.monsters = [];

  game.platforms = [
    { x: 360, y: 520, w: 560, h: 24 },
    { x: 1080, y: 455, w: 540, h: 24 },
    { x: 1760, y: 390, w: 560, h: 24 },
    { x: 2460, y: 325, w: 560, h: 24 },
    { x: 3160, y: 260, w: 560, h: 24 },
    { x: 3860, y: 195, w: 560, h: 24 },
    { x: 4560, y: 130, w: 560, h: 24 }
  ];

  game.portals = [
    {
      x: 110,
      y: game.ground,
      type: 'town',
      label: town.name
    }
  ];

  spawnMonsters(hunt);

  game.player.x = 220;
  game.player.y = game.ground;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.grounded = true;
  game.cameraX = 0;
}

function spawnMonsters(hunt) {
  const rows = [
    { y: game.ground, count: 12, start: 520, gap: 310, tier: 0 },
    { y: 520, count: 8, start: 470, gap: 470, tier: 1 },
    { y: 455, count: 7, start: 1160, gap: 480, tier: 2 },
    { y: 390, count: 6, start: 1840, gap: 520, tier: 3 },
    { y: 325, count: 5, start: 2540, gap: 580, tier: 4 },
    { y: 260, count: 4, start: 3240, gap: 660, tier: 5 },
    { y: 195, count: 3, start: 3960, gap: 720, tier: 6 },
    { y: 130, count: 2, start: 4660, gap: 560, tier: 7 }
  ];

  rows.forEach(function (row) {
    for (let i = 0; i < row.count; i++) {
      const family = hunt.families[(i + row.tier) % hunt.families.length];
      const type = makeMonsterType(family, hunt.baseLevel + row.tier * 2 + (i % 2));

      game.monsters.push({
        uid: Math.random().toString(36).slice(2),
        type,
        x: row.start + i * row.gap,
        baseX: row.start + i * row.gap,
        y: row.y,
        spawnY: row.y,
        hp: type.hp,
        maxHp: type.hp,
        face: i % 2 ? -1 : 1,
        time: Math.random() * 10,
        hit: 0,
        dead: false,
        attackCooldown: 0,
        poison: 0
      });
    }
  });
}

function makeMonsterType(family, level) {
  const data = FAMILY_DATA[family] || FAMILY_DATA.slime;
  const prefix = MONSTER_PREFIX[level % MONSTER_PREFIX.length];

  return {
    family,
    name: `${prefix} ${data.name}`,
    level,
    hp: 35 + level * 18,
    atk: 5 + level * 3,
    def: Math.floor(level * 0.7),
    exp: 12 + level * 7,
    gold: 8 + level * 5,
    drop: data.drop,
    dropRate: clamp(0.55 - level * 0.007, 0.2, 0.55),
    color: data.color,
    shape: data.shape,
    speed: clamp(18 + level * 0.8, 18, 48),
    respawn: clamp(1800 + level * 120, 1800, 7000)
  };
}

/* =========================================================
   Input Events
========================================================= */

window.addEventListener('keydown', function (e) {
  const key = String(e.key || '').toLowerCase();

  keys.add(key);

  if ([' ', 'arrowup', 'arrowleft', 'arrowright'].includes(key)) {
    e.preventDefault();
  }

  if (!game.ready) return;

  if (key === 's' || (key === 's' && e.ctrlKey)) {
    e.preventDefault();
    saveGame(false);
    return;
  }

  if (game.dialog || game.taxiOpen || game.shopOpen || game.blacksmithOpen) {
    if (key === 'escape') closeWindows();
    return;
  }

  if (key === 'j') basicAttack();
  if (key === 'k') useHotSkill('k');
  if (key === 'l') useHotSkill('l');
  if (key === ';') useHotSkill('semicolon');
  if (key === 'e') interact();
  if (key === 'z') pickNearbyDrops();

  if (key === 'm') {
    inventory.open = !inventory.open;
    stats.open = false;
    skills.open = false;
    quests.open = false;
  }

  if (key === 'c') {
    stats.open = !stats.open;
    inventory.open = false;
    skills.open = false;
    quests.open = false;
  }

  if (key === 'u') {
    skills.open = !skills.open;
    inventory.open = false;
    stats.open = false;
    quests.open = false;
  }

  if (key === 'q') {
    quests.open = !quests.open;
    inventory.open = false;
    stats.open = false;
    skills.open = false;
  }

  if (key === '1') useQuickSlot(0);
  if (key === '2') useQuickSlot(1);
  if (key === '3') useQuickSlot(2);
  if (key === '4') useQuickSlot(3);
});

window.addEventListener('keyup', function (e) {
  const key = String(e.key || '').toLowerCase();
  keys.delete(key);
});

canvas.addEventListener('click', function (e) {
  if (!game.ready) return;

  const pos = getMouse(e);

  if (game.dialog) {
    handleDialogClick(pos.x, pos.y);
    return;
  }

  if (game.taxiOpen) {
    handleTaxiClick(pos.x, pos.y);
    return;
  }

  if (game.shopOpen) {
    handleShopClick(pos.x, pos.y);
    return;
  }

  if (game.blacksmithOpen) {
    handleBlacksmithClick(pos.x, pos.y);
    return;
  }

  if (inventory.open) {
    handleInventoryClick(pos.x, pos.y);
    return;
  }

  if (stats.open) {
    handleStatClick(pos.x, pos.y);
    return;
  }

  if (skills.open) {
    handleSkillClick(pos.x, pos.y);
  }
});



canvas.addEventListener('mousemove', function (e) {
  const pos = getMouse(e);
  game.mouse = pos;
  dragState.x = pos.x;
  dragState.y = pos.y;
});

canvas.addEventListener('mousedown', function (e) {
  if (!game.ready || !inventory.open || e.button !== 0) return;
  const pos = getMouse(e);
  beginInventoryDrag(pos.x, pos.y);
});

canvas.addEventListener('mouseup', function (e) {
  if (!game.ready || !dragState.active) return;
  const pos = getMouse(e);
  finishInventoryDrag(pos.x, pos.y);
});

function handleShopWheel(e) {
  if (!game.ready) return;
  if (!game.shopOpen) return;

  const pos = getMouse(e);
  if (!hit(pos.x, pos.y, 80, 80, 1080, 590)) return;

  e.preventDefault();

  const list = game.shopOpen === 'merchant' ? ['hp_potion', 'mp_potion'] : getShopItemsForCurrentTown();
  const rowH = 64;
  const clipH = 410;
  const rowCount = Math.ceil(list.length / 2);
  const contentH = rowCount * rowH;
  const maxScroll = Math.max(0, contentH - clipH);

  game.shopScroll = clamp((game.shopScroll || 0) + e.deltaY * 1.15, 0, maxScroll);
}

canvas.addEventListener('wheel', handleShopWheel, { passive: false });
window.addEventListener('wheel', handleShopWheel, { passive: false });

function getMouse(e) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: (e.clientX - rect.left) * (W / rect.width),
    y: (e.clientY - rect.top) * (H / rect.height)
  };
}

/* =========================================================
   Interaction
========================================================= */

function interact() {
  const p = game.player;

  for (const portal of game.portals) {
    if (Math.abs(p.x - portal.x) < 90 && Math.abs(p.y - portal.y) < 130) {
      if (portal.type === 'hunt') {
        loadHunt(getTown(game.townId).hunt);
      } else {
        loadTown(game.townId);
        game.player.x = 3880;
        game.player.y = game.ground;
      }

      return;
    }
  }

  for (const npc of game.npcs) {
    if (Math.abs(p.x - npc.x) < 90 && Math.abs(p.y - npc.y) < 130) {
      stopPlayerMovement();
      game.dialog = {
        npc
      };
      return;
    }
  }
}

function closeWindows() {
  game.dialog = null;
  game.taxiOpen = false;
  game.shopOpen = false;
  game.shopScroll = 0;
  game.blacksmithOpen = false;
  stopPlayerMovement();
}

function stopPlayerMovement() {
  if (!game || !game.player) return;
  game.player.vx = 0;
  if (game.player.grounded) game.player.vy = 0;
  game.player.anim = 'idle';
  game.player.animTime = 0;
  keys.delete('a');
  keys.delete('d');
  keys.delete('arrowleft');
  keys.delete('arrowright');
}

function handleDialogClick(x, y) {
  if (!game.dialog) return;

  const npc = game.dialog.npc;

  if (hit(x, y, 970, 620, 120, 40)) {
    game.dialog = null;
    return;
  }

  if (hit(x, y, 210, 620, 190, 42)) {
    if (npc.type === 'taxi') {
      game.dialog = null;
      game.taxiOpen = true;
      return;
    }

    if (npc.type === 'merchant' || npc.type === 'weapon') {
      game.dialog = null;
      game.shopOpen = npc.type;
      game.shopScroll = 0;
      return;
    }

    if (npc.type === 'blacksmith') {
      game.dialog = null;
      game.blacksmithOpen = true;
      inventory.open = true;
      return;
    }

    if (npc.type === 'quest' || npc.type === 'job') {
      acceptOrCompleteQuest(npc.quest);
      return;
    }
  }
}

function acceptOrCompleteQuest(id) {
  const qBase = QUESTS[id];
  if (!qBase) return;

  if (quests.completed.includes(id)) {
    makeText('이미 완료했습니다.', game.player.x, game.player.y - 90, '#cbd5e1');
    return;
  }

  let q = quests.active.find(function (item) {
    return item.id === id;
  });

  if (!q) {
    q = JSON.parse(JSON.stringify(qBase));
    quests.active.push(q);
    makeText('퀘스트 수락!', game.player.x, game.player.y - 90, '#ffe066');
    return;
  }

  syncQuestItems(q);

  if (!questComplete(q)) {
    makeText('아직 완료 조건이 부족합니다.', game.player.x, game.player.y - 90, '#ffdd99');
    return;
  }

  completeQuest(q);
}

function syncQuestItems(q) {
  q.goals.forEach(function (goal) {
    if (goal.type === 'item') {
      goal.count = getItemCount(goal.itemId);
    }
  });
}

function questComplete(q) {
  return q.goals.every(function (goal) {
    return goal.count >= goal.need;
  });
}

function completeQuest(q) {
  wallet.gold += q.rewardGold || 0;
  addExp(q.rewardExp || 0);

  if (Array.isArray(q.rewardItems)) {
    q.rewardItems.forEach(function (reward) {
      addItem(reward.id, reward.count);
    });
  }

  if (q.jobReward) {
    game.player.character.job = q.jobReward;
    refreshUnlockedSkills();
    makeText(`${JOBS[q.jobReward].name} 전직 완료!`, game.player.x, game.player.y - 120, '#ffe066');
  }

  quests.active = quests.active.filter(function (item) {
    return item.id !== q.id;
  });

  quests.completed.push(q.id);
  makeText('퀘스트 완료!', game.player.x, game.player.y - 95, '#c0eb75');
}

function handleTaxiClick(x, y) {
  if (hit(x, y, 1000, 610, 120, 40)) {
    game.taxiOpen = false;
    return;
  }

  for (let i = 0; i < TOWNS.length; i++) {
    const town = TOWNS[i];
    const tx = 145 + (i % 2) * 360;
    const ty = 190 + Math.floor(i / 2) * 82;

    if (hit(x, y, tx, ty, 320, 62)) {
      if (town.id === game.townId) {
        makeText('이미 현재 도시입니다.', game.player.x, game.player.y - 90, '#cbd5e1');
        game.taxiOpen = false;
        return;
      }

      if (wallet.gold < town.taxiCost) {
        makeText(`택시비 ${town.taxiCost}G 필요`, game.player.x, game.player.y - 90, '#ff8787');
        return;
      }

      wallet.gold -= town.taxiCost;
      game.taxiOpen = false;
      loadTown(town.id);

      game.player.x = 360;
      game.player.y = game.ground;
      game.player.vx = 0;
      game.player.vy = 0;
      game.player.grounded = true;

      makeText(`${town.name} 도착!`, game.player.x, game.player.y - 90, '#ffe066');
      return;
    }
  }
}


function getShopItemsForCurrentTown() {
  return BASIC_EQUIPMENT_SHOP_ITEMS.filter(function (id) {
    return ITEMS[id];
  });
}

function handleShopClick(x, y) {
  if (hit(x, y, 1010, 610, 120, 40)) {
    game.shopOpen = false;
    game.shopScroll = 0;
    return;
  }

  if (game.shopOpen === 'merchant' && hit(x, y, 760, 610, 190, 40)) {
    sellAllEtc();
    return;
  }

  const list = game.shopOpen === 'merchant'
    ? ['hp_potion', 'mp_potion']
    : getShopItemsForCurrentTown();

  const startY = 175;
  const rowH = 64;
  const scroll = game.shopScroll || 0;

  for (let i = 0; i < list.length; i++) {
    const sx = 110 + (i % 2) * 500;
    const sy = startY + Math.floor(i / 2) * rowH - scroll;

    if (sy < 160 || sy > 580) continue;

    if (hit(x, y, sx, sy, 455, 52)) {
      buyItem(list[i]);
      return;
    }
  }
}

/* =========================================================
   Combat
========================================================= */

function getEquippedWeaponKind() {
  const weaponId = itemRefId(equipment.weapon);
  const item = ITEMS[weaponId] || {};
  if (!weaponId) return 'fist';
  return item.weaponType || (weaponId.includes('staff') ? 'staff' : weaponId.includes('bow') ? 'bow' : weaponId.includes('dagger') ? 'dagger' : 'sword');
}

function getBasicAttackProfile() {
  const kind = getEquippedWeaponKind();

  if (kind === 'staff') {
    return { kind, cooldown: 0.52, range: 330, power: 1.05, magic: true, projectile: 'magic', color: '#74c0fc' };
  }

  if (kind === 'bow') {
    return { kind, cooldown: 0.43, range: 360, power: 0.95, magic: false, projectile: 'arrow', color: '#ffd43b' };
  }

  if (kind === 'dagger') {
    return { kind, cooldown: 0.18, range: 58, power: 0.72, hits: 2, magic: false, color: '#d8b4fe' };
  }

  if (kind === 'sword') {
    return { kind, cooldown: 0.34, range: 86, power: 1.15, hits: 1, magic: false, color: '#ffb020' };
  }

  return { kind, cooldown: 0.28, range: 65, power: 1.0, hits: 1, magic: false, color: '#ffb020' };
}


function getCurrentWeaponEffectPower() {
  const ref = equipment.weapon;
  const item = getItemData(ref);
  if (!item) return 1;

  const reqLevel = item.reqLevel || 1;
  const enhance = itemEnhance(ref);
  const priceTier = Math.min(1.2, (item.price || 100) / 1200);

  return clamp(1 + reqLevel / 16 + enhance * 0.16 + priceTier, 1, 4.8);
}

function getCurrentWeaponEffectColor() {
  const item = getItemData(equipment.weapon);
  if (!item) return '#ffb020';

  if (item.weaponType === 'staff') return '#74c0fc';
  if (item.weaponType === 'bow') return '#ffd43b';
  if (item.weaponType === 'dagger') return '#c084fc';
  return '#ff922b';
}

function basicAttack() {
  const p = game.player;

  if (p.attackTime > 0) return;

  const profile = getBasicAttackProfile();
  const effectPower = getCurrentWeaponEffectPower();
  const effectColor = getCurrentWeaponEffectColor();

  p.attackTime = profile.cooldown;
  p.attackKind = profile.kind;
  p.anim = 'attack';
  p.animTime = 0;

  if (profile.projectile) {
    spawnBasicWeaponProjectile({ ...profile, effectPower, color: effectColor });
    return;
  }

  hitMonsters({
    range: profile.range,
    power: profile.power,
    hits: profile.hits || 1,
    magic: profile.magic
  });

  if (profile.kind === 'dagger') {
    slashEffect(p.x + p.face * 30, p.y - 42, p.face, effectColor, effectPower * 0.9);
    slashEffect(p.x + p.face * 45, p.y - 52, p.face, '#ffffff', Math.max(1, effectPower * 0.65));
  } else {
    slashEffect(p.x + p.face * 46, p.y - 48, p.face, effectColor, effectPower);
  }
}

function spawnBasicWeaponProjectile(profile) {
  const p = game.player;
  const speed = profile.projectile === 'arrow' ? 620 : 430;

  game.projectiles.push({
    x: p.x + p.face * 42,
    y: p.y - 52,
    vx: p.face * speed,
    life: profile.projectile === 'arrow' ? 0.7 : 0.95,
    face: p.face,
    kind: profile.projectile,
    skill: {
      power: profile.power,
      range: profile.range,
      magic: profile.magic
    },
    hitSet: new Set(),
    color: profile.color,
    effectPower: profile.effectPower || 1
  });
}
function useHotSkill(slot) {
  const id = skills.hotkeys[slot];

  if (!id) {
    makeText('스킬이 없습니다.', game.player.x, game.player.y - 90, '#cbd5e1');
    return;
  }

  useSkill(id);
}

function useSkill(id) {
  const skill = SKILLS[id];

  if (!skill) return;

  if (!skills.unlocked.includes(id)) {
    makeText('아직 배운 스킬이 아닙니다.', game.player.x, game.player.y - 90, '#ff8787');
    return;
  }

  if ((skills.cooldowns[id] || 0) > 0) {
    makeText('쿨타임 중', game.player.x, game.player.y - 90, '#cbd5e1');
    return;
  }

  if (game.player.mp < skill.mp) {
    makeText('MP 부족', game.player.x, game.player.y - 90, '#74c0fc');
    return;
  }

  game.player.mp -= skill.mp;
  skills.cooldowns[id] = skill.cooldown;

  if (skill.heal) {
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + skill.heal);
    makeText(`+${skill.heal} HP`, game.player.x, game.player.y - 90, '#ff8787');
    circleEffect(game.player.x, game.player.y - 50, '#69db7c');
    return;
  }

  game.player.attackTime = 0.36;
  game.player.anim = 'attack';
  game.player.animTime = 0;

  if (skill.projectile) {
    spawnProjectile(skill);
  } else {
    hitMonsters(skill);
    slashEffect(game.player.x + game.player.face * 44, game.player.y - 46, game.player.face, skill.magic ? '#74c0fc' : '#ffb020');
  }
}

function hitMonsters(skill) {
  if (game.mode !== 'hunt') return;

  const p = game.player;
  const hits = skill.hits || 1;

  for (let h = 0; h < hits; h++) {
    game.monsters.forEach(function (m) {
      if (m.dead) return;

      const dx = m.x - p.x;
      const dy = Math.abs(m.y - p.y);

      if (Math.sign(dx) === p.face && Math.abs(dx) <= skill.range && dy < 95) {
        damageMonster(m, skill);
      }
    });
  }
}

function damageMonster(m, skill) {
  const p = game.player;

  const base = skill.magic ? p.magicPower : p.attackPower;
  const crit = Math.random() * 100 < p.critRate;
  const raw = base * (skill.power || 1);
  const damage = Math.max(1, Math.floor(raw - m.type.def + Math.random() * 8)) * (crit ? 2 : 1);

  m.hp -= damage;
  m.hit = 0.15;
  m.x += p.face * 10;

  makeText(crit ? `${damage}!` : `-${damage}`, m.x, m.y - 78, crit ? '#ffe066' : '#ff6b6b');

  if (m.hp <= 0) {
    killMonster(m);
  }
}

function killMonster(m) {
  const type = m.type;

  m.dead = true;

  const levelGap = Math.max(0, type.level - game.player.level);
  const expBonus = 1 + Math.min(1.5, levelGap * 0.08);
  const finalExp = Math.floor(type.exp * expBonus);

  addExp(finalExp);
  wallet.gold += type.gold;

  makeText(`EXP +${finalExp}`, m.x, m.y - 108, '#c0eb75');
  makeText(`+${type.gold}G`, m.x, m.y - 130, '#ffd43b');

  game.drops.push({
    kind: 'gold',
    amount: Math.max(1, Math.floor(type.gold * 0.35)),
    x: m.x + rand(-15, 15),
    y: m.y - 12,
    vy: -120,
    picked: false
  });

  if (Math.random() < type.dropRate) {
    game.drops.push({
      kind: 'item',
      itemId: type.drop,
      count: 1,
      x: m.x + rand(-15, 15),
      y: m.y - 12,
      vy: -130,
      picked: false
    });
  }

  if (Math.random() < getRareDropRate(type)) {
    const rareId = getMonsterRareEquipmentDrop(type);
    if (rareId) {
      game.drops.push({
        kind: 'item',
        itemId: rareId,
        count: 1,
        x: m.x + rand(-22, 22),
        y: m.y - 18,
        vy: -150,
        picked: false
      });
      makeText('희귀 장비!', m.x, m.y - 155, '#facc15');
    }
  }

  updateKillQuests(type.family);
  markAutoSaveSoon();

  setTimeout(function () {
    m.dead = false;
    m.hp = m.maxHp;
    m.x = m.baseX + rand(-50, 50);
    m.y = m.spawnY;
    m.hit = 0;
  }, type.respawn);
}


function getMonsterRareEquipmentDrop(type) {
  const level = type.level || 1;
  const list = Object.keys(ITEMS).filter(function (id) {
    const item = ITEMS[id];
    if (!item || !getEquipSlotForItem(item)) return false;
    if (BASIC_EQUIPMENT_SHOP_ITEMS.includes(id)) return false;
    const req = item.reqLevel || 1;
    return req >= Math.max(1, level - 5) && req <= level + 5;
  });

  if (!list.length) return null;

  const familyBias = {
    mana: ['staff_', 'accessory_'],
    ice: ['staff_', 'armor_'],
    bug: ['bow_', 'knee_'],
    boar: ['sword_', 'armor_'],
    shadow: ['dagger_', 'accessory_'],
    ruin: ['sword_', 'helmet_', 'armor_'],
    ore: ['helmet_', 'armor_'],
    desert: ['bow_', 'dagger_'],
    slime: ['accessory_', 'helmet_'],
    mushroom: ['staff_', 'knee_']
  }[type.family] || [];

  const biased = list.filter(function (id) {
    return familyBias.some(function (prefix) { return id.indexOf(prefix) === 0; });
  });

  const pickList = biased.length ? biased : list;
  return pickList[Math.floor(Math.random() * pickList.length)];
}

function getRareDropRate(type) {
  return clamp(0.035 + (type.level || 1) * 0.0015, 0.035, 0.085);
}

function updateKillQuests(family) {
  quests.active.forEach(function (q) {
    q.goals.forEach(function (goal) {
      if (goal.type === 'kill' && goal.family === family) {
        goal.count = Math.min(goal.need, goal.count + 1);
      }
    });
  });
}

function spawnProjectile(skill) {
  const p = game.player;

  game.projectiles.push({
    x: p.x + p.face * 35,
    y: p.y - 48,
    vx: p.face * 450,
    life: 0.85,
    face: p.face,
    skill,
    hitSet: new Set(),
    color: skill.magic ? '#74c0fc' : '#ffd43b'
  });
}

function addExp(amount) {
  const p = game.player;

  p.exp += amount;

  while (p.exp >= p.nextExp) {
    p.exp -= p.nextExp;
    p.level += 1;
    p.nextExp = Math.floor(p.nextExp * 1.35 + 35);
    stats.ap += 5;
    markAutoSaveSoon();
    p.hp = p.maxHp;
    p.mp = p.maxMp;

    makeText('LEVEL UP!', p.x, p.y - 125, '#ffe066');
    refreshUnlockedSkills();
  }
}

function refreshUnlockedSkills() {
  const p = game.player;
  const job = p.character.job || 'beginner';

  Object.keys(SKILLS).forEach(function (id) {
    const skill = SKILLS[id];

    const correctJob = skill.job === 'beginner' || skill.job === job;
    const levelOk = !skill.unlockLevel || p.level >= skill.unlockLevel;

    if (correctJob && levelOk && !skills.unlocked.includes(id)) {
      skills.unlocked.push(id);
      makeText(`${skill.name} 해금!`, p.x, p.y - 112, '#ffe066');
    }
  });

  if (!skills.hotkeys.k && skills.unlocked[0]) skills.hotkeys.k = skills.unlocked[0];
  if (!skills.hotkeys.l && skills.unlocked[1]) skills.hotkeys.l = skills.unlocked[1];
  if (!skills.hotkeys.semicolon && skills.unlocked[2]) skills.hotkeys.semicolon = skills.unlocked[2];
}

/* =========================================================
   Inventory / Equipment / Stats
========================================================= */

function addItem(ref, count) {
  const id = itemRefId(ref);
  const enhance = itemEnhance(ref);
  const data = ITEMS[id];
  if (!id || !data) return;

  // 장비는 강화 수치가 다르면 서로 다른 칸으로 보관한다.
  // 예: +7 나무 검과 일반 나무 검이 섞여서 강화 기록이 사라지는 문제 방지.
  const shouldStack = data.type === 'consumable' || data.type === 'etc';
  const found = inventory.items.find(function (item) {
    return item.id === id && (shouldStack || itemEnhance(item) === enhance);
  });

  if (found && shouldStack) {
    found.count += count;
  } else if (found && itemEnhance(found) === enhance) {
    found.count += count;
  } else {
    inventory.items.push(stack(id, count, enhance));
  }
}

function removeItem(ref, count) {
  const id = itemRefId(ref);
  const enhance = itemEnhance(ref);
  const found = inventory.items.find(function (item) {
    return item.id === id && itemEnhance(item) === enhance;
  });

  if (!found || found.count < count) return false;

  found.count -= count;

  if (found.count <= 0) {
    inventory.items = inventory.items.filter(function (item) {
      return item !== found;
    });
  }

  return true;
}

function getItemCount(id) {
  return inventory.items.reduce(function (sum, item) {
    return sum + (item.id === id ? item.count : 0);
  }, 0);
}

function findInventoryItemRef(id) {
  return inventory.items.find(function (item) {
    return item.id === id;
  }) || null;
}

function useQuickSlot(index) {
  const itemId = inventory.quickSlots[index];

  if (!itemId) return;

  useItem(itemId);
}

function useItem(ref) {
  const id = itemRefId(ref);
  const item = ITEMS[id];

  if (!item) return;

  if (item.type === 'consumable') {
    if (!removeItem(id, 1)) return;

    if (id === 'hp_potion') {
      game.player.hp = Math.min(game.player.maxHp, game.player.hp + 80);
      makeText('+80 HP', game.player.x, game.player.y - 90, '#ff8787');
    }

    if (id === 'mp_potion') {
      game.player.mp = Math.min(game.player.maxMp, game.player.mp + 50);
      makeText('+50 MP', game.player.x, game.player.y - 90, '#74c0fc');
    }

    markAutoSaveSoon();
    return;
  }

  if (getEquipSlotForItem(item)) {
    equipItem(ref);
  }
}

function equipItem(ref) {
  const id = itemRefId(ref);
  const item = ITEMS[id];

  if (!item) return;
  const invRef = typeof ref === 'string' ? findInventoryItemRef(id) : ref;
  if (!invRef || !removeItem(invRef, 0)) return;

  const slot = getEquipSlotForItem(item);
  if (!slot) return;

  if ((item.reqLevel || 1) > game.player.level) {
    makeText(`Lv.${item.reqLevel}부터 장착 가능`, game.player.x, game.player.y - 90, '#ff8787');
    return;
  }

  if (equipment[slot]) {
    addItem(equipment[slot], 1);
  }

  removeItem(invRef, 1);
  equipment[slot] = makeEquippedRef(id);
  equipment[slot].enhance = itemEnhance(invRef);
  recalcStats();
  markAutoSaveSoon();

  makeText(`${getItemDisplayName(equipment[slot])} 장착`, game.player.x, game.player.y - 90, '#ffe066');
}

function getEquipmentBonus() {
  const bonus = {
    str: 0,
    dex: 0,
    int: 0,
    luk: 0,
    atk: 0,
    matk: 0,
    def: 0,
    hp: 0,
    mp: 0,
    crit: 0,
    speed: 0
  };

  EQUIP_SLOT_KEYS.forEach(function (slot) {
    const ref = equipment[slot];
    const item = getItemData(ref);

    if (!item) return;

    Object.keys(bonus).forEach(function (key) {
      bonus[key] += (item[key] || 0) + getEnhanceBonus(ref, key);
    });
  });

  return bonus;
}

function recalcStats() {
  const p = game.player;
  const bonus = getEquipmentBonus();

  p.maxHp = 150 + stats.str * 8 + bonus.hp;
  p.maxMp = 60 + stats.int * 7 + bonus.mp;

  p.attackPower = 12 + stats.str * 2 + Math.floor(stats.dex * 0.6) + bonus.atk;
  p.magicPower = 8 + stats.int * 3 + bonus.matk;
  p.defense = 2 + Math.floor(stats.str * 0.4) + bonus.def;
  p.critRate = Math.min(70, 5 + stats.luk * 0.7 + bonus.crit);
  p.speed = 235 + bonus.speed;

  p.hp = Math.min(p.hp, p.maxHp);
  p.mp = Math.min(p.mp, p.maxMp);
}

function addStat(key) {
  if (stats.ap <= 0) return;
  if (!['str', 'dex', 'int', 'luk'].includes(key)) return;

  stats[key] += 1;
  stats.ap -= 1;
  recalcStats();
  markAutoSaveSoon();
}

function buyItem(id) {
  const item = ITEMS[id];

  if (!item || !item.price) return;

  if (wallet.gold < item.price) {
    makeText('골드 부족', game.player.x, game.player.y - 90, '#ff8787');
    return;
  }

  wallet.gold -= item.price;
  addItem(id, 1);
  markAutoSaveSoon();

  makeText(`${item.name} 구매`, game.player.x, game.player.y - 90, '#c0eb75');
}

function sellAllEtc() {
  let gold = 0;

  inventory.items.slice().forEach(function (stackItem) {
    const item = ITEMS[stackItem.id];

    if (!item || item.type !== 'etc') return;

    gold += item.sell * stackItem.count;

    inventory.items = inventory.items.filter(function (v) {
      return v !== stackItem;
    });
  });

  wallet.gold += gold;
  markAutoSaveSoon();
  makeText(`판매 +${gold}G`, game.player.x, game.player.y - 90, '#ffd43b');
}

function pickNearbyDrops() {
  const p = game.player;

  game.drops.forEach(function (d) {
    if (d.picked) return;

    if (Math.abs(d.x - p.x) < 65 && Math.abs(d.y - p.y) < 90) {
      d.picked = true;

      if (d.kind === 'gold') {
        wallet.gold += d.amount;
        makeText(`+${d.amount}G`, p.x, p.y - 90, '#ffd43b');
      } else {
        const pickedRef = d.itemRef || d.itemId;
        addItem(pickedRef, d.count);
        makeText(`${getItemDisplayName(pickedRef) || ITEMS[d.itemId].name} +${d.count}`, p.x, p.y - 90, '#c0eb75');
      }
    }
  });

  game.drops = game.drops.filter(function (d) {
    return !d.picked;
  });
}

/* =========================================================
   UI Click Handlers
========================================================= */


function getInventoryPanelRect() {
  return { x: 50, y: 96, w: 850, h: 560 };
}

function getInventorySlotAt(x, y) {
  const gridX = 50 + 395 + 18;
  const gridY = 96 + 62 + 88;
  const cell = 56;

  for (let i = 0; i < 36; i++) {
    const cx = gridX + (i % 6) * cell;
    const cy = gridY + Math.floor(i / 6) * cell;
    if (hit(x, y, cx, cy, 48, 48)) return i;
  }

  return -1;
}

function getEquipmentSlotAt(x, y) {
  const ox = 50 + 20;
  const oy = 96 + 62;
  const slots = [
    { key: 'helmet', x: 134, y: 48, w: 72, h: 72 },
    { key: 'weapon', x: 28, y: 158, w: 72, h: 72 },
    { key: 'armor', x: 134, y: 158, w: 72, h: 72 },
    { key: 'knee', x: 240, y: 158, w: 72, h: 72 },
    { key: 'accessory', x: 134, y: 275, w: 72, h: 72 }
  ];

  for (const slot of slots) {
    if (hit(x, y, ox + slot.x, oy + slot.y, slot.w, slot.h)) return slot.key;
  }

  return null;
}

function beginInventoryDrag(x, y) {
  const invIndex = getInventorySlotAt(x, y);
  if (invIndex >= 0 && inventory.items[invIndex]) {
    dragState.active = true;
    dragState.kind = 'inventory';
    dragState.index = invIndex;
    dragState.slot = null;
    dragState.item = inventory.items[invIndex];
    dragState.x = x;
    dragState.y = y;
    dragState.startedAt = performance.now();
    return;
  }

  const slot = getEquipmentSlotAt(x, y);
  if (slot && equipment[slot]) {
    const ref = equipment[slot];
    dragState.active = true;
    dragState.kind = 'equipment';
    dragState.index = -1;
    dragState.slot = slot;
    dragState.item = { id: itemRefId(ref), count: 1, enhance: itemEnhance(ref) };
    dragState.x = x;
    dragState.y = y;
    dragState.startedAt = performance.now();
  }
}

function finishInventoryDrag(x, y) {
  const dragged = dragState.item;
  const id = itemRefId(dragged);
  const item = ITEMS[id];
  if (!dragged || !item) {
    dragState.active = false;
    return;
  }

  const panel = getInventoryPanelRect();
  const targetSlot = getEquipmentSlotAt(x, y);
  const targetInv = getInventorySlotAt(x, y);
  const isOutsidePanel = !hit(x, y, panel.x, panel.y, panel.w, panel.h);

  if (targetSlot && getEquipSlotForItem(item) === targetSlot) {
    if ((item.reqLevel || 1) > game.player.level) {
      makeText(`Lv.${item.reqLevel}부터 장착 가능`, game.player.x, game.player.y - 90, '#ff8787');
    } else {
      if (dragState.kind === 'inventory') removeItem(id, 1);
      if (dragState.kind === 'equipment') equipment[dragState.slot] = null;
      if (equipment[targetSlot]) addItem(equipment[targetSlot], 1);
      equipment[targetSlot] = makeEquippedRef(id);
      equipment[targetSlot].enhance = itemEnhance(dragged);
      recalcStats();
      makeText(`${item.name} 장착`, game.player.x, game.player.y - 90, '#ffe066');
    }
  } else if (targetInv >= 0) {
    if (dragState.kind === 'equipment') {
      addItem(equipment[dragState.slot], 1);
      equipment[dragState.slot] = null;
      recalcStats();
    } else if (targetInv !== dragState.index) {
      const tmp = inventory.items[targetInv];
      inventory.items[targetInv] = inventory.items[dragState.index];
      inventory.items[dragState.index] = tmp;
    }
  } else if (isOutsidePanel) {
    if (dragState.kind === 'inventory') removeItem(id, 1);
    if (dragState.kind === 'equipment') {
      equipment[dragState.slot] = null;
      recalcStats();
    }
    game.drops.push({ kind: 'item', itemId: id, itemRef: cloneItemRef(dragged, 1), count: 1, x: game.player.x + game.player.face * 36, y: game.player.y - 30, vy: -130, picked: false });
    makeText(`${item.name} 버림`, game.player.x, game.player.y - 90, '#cbd5e1');
  }

  dragState.active = false;
  dragState.kind = null;
  dragState.index = -1;
  dragState.slot = null;
  dragState.item = null;
}

function getHoveredItemRef() {
  if (!inventory.open || !game.mouse) return null;
  const invIndex = getInventorySlotAt(game.mouse.x, game.mouse.y);
  if (invIndex >= 0 && inventory.items[invIndex]) return inventory.items[invIndex];
  const slot = getEquipmentSlotAt(game.mouse.x, game.mouse.y);
  if (slot && equipment[slot]) return equipment[slot];
  return null;
}

function handleInventoryClick(x, y) {
  if (dragState.active) return;
  const i = getInventorySlotAt(x, y);
  if (i >= 0 && inventory.items[i]) useItem(inventory.items[i]);
}

function handleStatClick(x, y) {
  const baseX = 610;
  const baseY = 215;

  const rows = [
    ['str', baseY],
    ['dex', baseY + 50],
    ['int', baseY + 100],
    ['luk', baseY + 150]
  ];

  rows.forEach(function (row) {
    if (hit(x, y, baseX + 230, row[1] - 28, 42, 34)) {
      addStat(row[0]);
    }
  });
}

function handleSkillClick(x, y) {
  const list = getVisibleSkills();

  for (let i = 0; i < list.length; i++) {
    const rowY = 190 + i * 56;

    if (hit(x, y, 100, rowY, 430, 46)) {
      const id = list[i].id;

      if (!skills.hotkeys.k) skills.hotkeys.k = id;
      else if (!skills.hotkeys.l) skills.hotkeys.l = id;
      else skills.hotkeys.semicolon = id;

      makeText(`${list[i].name} 장착`, game.player.x, game.player.y - 90, '#ffe066');
      return;
    }
  }

  if (hit(x, y, 660, 200, 130, 38)) skills.hotkeys.k = null;
  if (hit(x, y, 660, 252, 130, 38)) skills.hotkeys.l = null;
  if (hit(x, y, 660, 304, 130, 38)) skills.hotkeys.semicolon = null;
}

function getVisibleSkills() {
  const job = game.player.character.job || 'beginner';

  return Object.keys(SKILLS)
    .map(function (id) {
      return SKILLS[id];
    })
    .filter(function (skill) {
      return skill.job === 'beginner' || skill.job === job;
    });
}

/* =========================================================
   Update
========================================================= */

function update(dt) {
  if (!game.ready) return;

  updateCooldowns(dt);
  updateRegen(dt);
  updatePlayer(dt);
  updateMonsters(dt);
  updateProjectiles(dt);
  updateDrops(dt);
  updateParticles(dt);
  updateTexts(dt);
  updateCamera(dt);
  updateAutoSave(dt);
}

function updateCooldowns(dt) {
  Object.keys(skills.cooldowns).forEach(function (id) {
    skills.cooldowns[id] = Math.max(0, skills.cooldowns[id] - dt);
  });
}

function updateRegen(dt) {
  const p = game.player;

  if (p.hp > 0) {
    p.hp = Math.min(p.maxHp, p.hp + (1.5 + p.level * 0.08 + stats.str * 0.015) * dt);
    p.mp = Math.min(p.maxMp, p.mp + (1.2 + p.level * 0.06 + stats.int * 0.025) * dt);
  }
}

function updatePlayer(dt) {
  const p = game.player;

  if (p.hp <= 0) {
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    loadTown(game.townId);
    p.x = 260;
    p.y = game.ground;
    makeText('마을에서 부활', p.x, p.y - 90, '#ff8787');
    return;
  }

  const left = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  const jump = keys.has(' ') || keys.has('arrowup');

  if (!game.dialog && !game.taxiOpen && !game.shopOpen) {
    if (left) {
      p.vx = -p.speed;
      p.face = -1;
    } else if (right) {
      p.vx = p.speed;
      p.face = 1;
    } else {
      p.vx *= Math.pow(0.001, dt);
      if (Math.abs(p.vx) < 2) p.vx = 0;
    }

    if (jump && p.grounded) {
      p.vy = -560;
      p.grounded = false;
    }
  }

  p.vy += 1550 * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  p.grounded = false;

  if (p.y >= game.ground) {
    p.y = game.ground;
    p.vy = 0;
    p.grounded = true;
  }

  game.platforms.forEach(function (pf) {
    const falling = p.vy >= 0;
    const insideX = p.x > pf.x - 24 && p.x < pf.x + pf.w + 24;
    const nearTop = p.y >= pf.y - 12 && p.y <= pf.y + 24;

    if (falling && insideX && nearTop) {
      p.y = pf.y;
      p.vy = 0;
      p.grounded = true;
    }
  });

  p.x = clamp(p.x, 70, game.width - 80);

  p.attackTime = Math.max(0, p.attackTime - dt);
  p.invincible = Math.max(0, p.invincible - dt);
  p.hurtTime = Math.max(0, p.hurtTime - dt);
  p.animTime += dt;

  if (p.attackTime > 0) p.anim = 'attack';
  else if (!p.grounded) p.anim = 'jump';
  else if (Math.abs(p.vx) > 10) p.anim = 'walk';
  else p.anim = 'idle';
}

function updateMonsters(dt) {
  if (game.mode !== 'hunt') return;

  game.monsters.forEach(function (m) {
    if (m.dead) return;

    m.time += dt;
    m.hit = Math.max(0, m.hit - dt);
    m.attackCooldown = Math.max(0, m.attackCooldown - dt);

    const dx = game.player.x - m.x;
    const dist = Math.abs(dx);

    if (dist < 380) {
      m.face = dx > 0 ? 1 : -1;
      m.x += m.face * m.type.speed * dt;
    } else {
      m.x += Math.sin(m.time * 1.5) * 13 * dt;
    }

    m.x = clamp(m.x, m.baseX - 200, m.baseX + 200);

    const touchX = Math.abs(game.player.x - m.x) < 48;
    const touchY = Math.abs(game.player.y - m.y) < 85;

    if (touchX && touchY && game.player.invincible <= 0) {
      const damage = Math.max(1, Math.floor(m.type.atk - game.player.defense * 0.45));

      game.player.hp = Math.max(0, game.player.hp - damage);
      game.player.invincible = 0.9;
      game.player.hurtTime = 0.2;
      game.player.vx = -m.face * 120;

      makeText(`-${damage}`, game.player.x, game.player.y - 90, '#ff8787');
    }
  });
}

function updateProjectiles(dt) {
  game.projectiles.forEach(function (p) {
    p.life -= dt;
    p.x += p.vx * dt;

    game.monsters.forEach(function (m) {
      if (m.dead || p.hitSet.has(m.uid)) return;

      if (Math.abs(p.x - m.x) < 42 && Math.abs(p.y - (m.y - 45)) < 60) {
        p.hitSet.add(m.uid);
        damageMonster(m, p.skill);
        circleEffect(p.x, p.y, p.color);
        p.life = 0;
      }
    });
  });

  game.projectiles = game.projectiles.filter(function (p) {
    return p.life > 0;
  });
}

function updateDrops(dt) {
  game.drops.forEach(function (d) {
    d.vy += 620 * dt;
    d.y += d.vy * dt;

    if (d.y > game.ground - 10) {
      d.y = game.ground - 10;
      d.vy = 0;
    }
  });
}

function updateParticles(dt) {
  game.particles.forEach(function (p) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
  });

  game.particles = game.particles.filter(function (p) {
    return p.life > 0;
  });
}

function updateTexts(dt) {
  game.texts.forEach(function (t) {
    t.life -= dt;
    t.y += t.vy * dt;
  });

  game.texts = game.texts.filter(function (t) {
    return t.life > 0;
  });
}

function updateCamera(dt) {
  const target = clamp(game.player.x - W * 0.42, 0, Math.max(0, game.width - W));
  game.cameraX += (target - game.cameraX) * Math.min(1, dt * 8);
}

/* =========================================================
   Draw
========================================================= */

function draw() {
  ctx.clearRect(0, 0, W, H);

  if (!game.ready) {
    drawMenuBackground();
    drawPreviews();
    return;
  }

  ctx.save();
  ctx.translate(-Math.floor(game.cameraX), 0);

  drawWorld();
  drawPortals();
  drawNPCs();
  drawDrops();
  drawMonsters();
  drawProjectiles();
  drawPlayer(game.player, game.player.x, game.player.y, 0.74);
  drawParticles();
  drawTexts();

  ctx.restore();

  drawHUD();

  if (inventory.open) drawInventoryPanel();
  if (stats.open) drawStatsPanel();
  if (skills.open) drawSkillsPanel();
  if (quests.open) drawQuestsPanel();

  if (game.dialog) drawDialog();
  if (game.taxiOpen) drawTaxiPanel();
  if (game.shopOpen) drawShopPanel();
  if (game.blacksmithOpen) drawBlacksmithPanel();
  if (inventory.open) drawItemTooltip();
  drawDraggedItem();
}

function drawMenuBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#7bd4ff');
  g.addColorStop(1, '#c9f3ff');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  drawCloud(150, 90, 1.1);
  drawCloud(470, 140, 0.8);
  drawCloud(970, 110, 1.2);
}

function drawPreviews() {
  const creatorVisible = characterScreen && !characterScreen.classList.contains('hidden');
  const menuVisible = characterMenu && !characterMenu.classList.contains('hidden');

  if (creatorVisible && preview) drawPreviewCanvas(preview, selected);
  if (menuVisible && menuPreview) {
    const ch = currentUser && currentUser.save && currentUser.save.player
      ? currentUser.save.player.character
      : selected;

    drawPreviewCanvas(menuPreview, ch);
  }
}

function drawPreviewCanvas(target, ch) {
  target.width = 300;
  target.height = 300;

  const c = target.getContext('2d');
  c.imageSmoothingEnabled = false;

  c.clearRect(0, 0, 300, 300);

  c.fillStyle = '#202938';
  c.fillRect(0, 0, 300, 300);

  c.fillStyle = '#25344c';
  c.fillRect(50, 257, 200, 12);

  const fake = {
    ...createPlayer(),
    character: {
      ...createPlayer().character,
      ...ch
    },
    anim: 'idle',
    animTime: performance.now() / 1000,
    face: 1
  };

  c.save();
  c.translate(150, 258);
  c.scale(1.55, 1.55);
  drawPlayerBody(c, fake);
  c.restore();
}

function drawWorld() {
  const town = getTown(game.townId);
  const sky = ctx.createLinearGradient(0, 0, 0, H);

  sky.addColorStop(0, town.bgTop);
  sky.addColorStop(0.55, town.bgBottom);
  sky.addColorStop(1, '#eaffce');

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, game.width, H);

  drawBackgroundLayers(town);

  if (game.mode === 'town') {
    drawTownObjects(town);
  } else {
    drawHuntObjects(town);
  }

  game.platforms.forEach(function (pf) {
    drawPlatform(pf.x, pf.y, pf.w, pf.h, town.theme);
  });

  drawGround(town);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(game.mode === 'town' ? `${town.title} ${town.name} (${town.recommendLevel})` : `${getHunt(game.huntId).name} · 권장 ${town.recommendLevel}`, 34, 46);
}

function drawBackgroundLayers(town) {
  for (let i = 0; i < 18; i++) {
    drawCloud(130 + i * 220, 70 + (i % 4) * 38, 0.8 + (i % 3) * 0.15);
  }

  ctx.fillStyle = town.theme === 'desert'
    ? '#dcb173'
    : town.theme === 'ruin'
      ? '#7b8492'
      : town.theme === 'ice'
        ? '#b7ecff'
        : '#8cb8da';

  ctx.beginPath();
  ctx.moveTo(0, 380);

  for (let x = -120; x < game.width + 280; x += 240) {
    ctx.lineTo(x + 120, 260 + Math.sin(x * 0.02) * 24);
    ctx.lineTo(x + 250, 380);
  }

  ctx.lineTo(game.width, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  const treeColor = town.theme === 'ice'
    ? '#c5f3ff'
    : town.theme === 'desert'
      ? '#94a75b'
      : town.theme === 'ruin'
        ? '#5a675e'
        : '#6fb66f';

  ctx.fillStyle = treeColor;

  for (let x = -120; x < game.width + 180; x += 170) {
    ctx.beginPath();
    ctx.ellipse(x, game.ground - 72, 150, 68, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTownObjects(town) {
  if (town.theme === 'magic') {
    for (let x = 180; x < game.width; x += 560) drawMagicTower(x, game.ground);
    for (let x = 280; x < game.width; x += 520) drawCrystal(x, game.ground - 18);
    return;
  }

  if (town.theme === 'fortress') {
    for (let x = 160; x < game.width; x += 520) drawCastleWall(x, game.ground);
    return;
  }

  if (town.theme === 'port') {
    for (let x = 160; x < game.width; x += 620) drawPortHouse(x, game.ground);
    return;
  }

  if (town.theme === 'mine') {
    for (let x = 160; x < game.width; x += 520) drawMineEntrance(x, game.ground);
    return;
  }

  if (town.theme === 'ice') {
    for (let x = 160; x < game.width; x += 520) drawIceHouse(x, game.ground);
    return;
  }

  if (town.theme === 'desert') {
    for (let x = 160; x < game.width; x += 520) drawDesertHouse(x, game.ground);
    return;
  }

  if (town.theme === 'ruin') {
    for (let x = 180; x < game.width; x += 460) drawRuin(x, game.ground);
    for (let x = 500; x < game.width; x += 760) drawBrokenArch(x, game.ground);
    return;
  }

  for (let i = 0; i < 8; i++) {
    drawHouse(180 + i * 500, game.ground, town.theme);
  }

  for (let i = 0; i < 10; i++) {
    drawTree(90 + i * 430, game.ground, town.theme);
  }
}

function drawHuntObjects(town) {
  if (town.theme === 'forest' || town.theme === 'grass') {
    for (let x = 80; x < game.width; x += 160) drawPine(x, game.ground, town.theme);
  }

  if (town.theme === 'magic') {
    for (let x = 160; x < game.width; x += 340) drawCrystal(x, game.ground - 10);
  }

  if (town.theme === 'mine') {
    for (let x = 200; x < game.width; x += 470) drawMineRock(x, game.ground);
  }

  if (town.theme === 'ice') {
    for (let x = 200; x < game.width; x += 430) drawIcePillar(x, game.ground);
  }

  if (town.theme === 'desert') {
    for (let x = 260; x < game.width; x += 430) drawCactus(x, game.ground);
  }

  if (town.theme === 'ruin' || town.theme === 'fortress') {
    for (let x = 250; x < game.width; x += 430) drawRuin(x, game.ground);
  }
}

function drawGround(town) {
  const top = getGroundColor(town.theme);
  const dirt = getDirtColor(town.theme);

  ctx.fillStyle = top;
  ctx.fillRect(0, game.ground, game.width, 28);

  ctx.fillStyle = dirt;
  ctx.fillRect(0, game.ground + 28, game.width, H - game.ground);

  for (let x = 0; x < game.width; x += 44) {
    ctx.fillStyle = x % 88 === 0 ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.08)';
    ctx.fillRect(x, game.ground + 36, 38, H - game.ground - 36);
  }
}

function drawPlatform(x, y, w, h, theme) {
  ctx.fillStyle = getGroundColor(theme);
  roundRect(ctx, x, y, w, h, 10);

  ctx.fillStyle = getDirtColor(theme);
  ctx.fillRect(x + 8, y + h - 6, w - 16, 10);

  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  for (let i = 0; i < w; i += 30) {
    ctx.fillRect(x + 8 + i, y + 4, 16, 3);
  }
}

function drawPortals() {
  game.portals.forEach(function (p) {
    const t = performance.now() / 350;

    ctx.save();
    ctx.translate(p.x, p.y - 58);

    ctx.shadowColor = '#74c0fc';
    ctx.shadowBlur = 18;

    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28 + Math.sin(t) * 2, 52, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#74c0fc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 19 + Math.cos(t) * 2, 44, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(75,230,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 44, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('E', 0, -75);
    ctx.fillText(p.label, 0, 82);

    ctx.restore();
  });
}

function drawNPCs() {
  game.npcs.forEach(function (npc) {
    drawNPCBody(npc);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, npc.x, npc.y - 64);

    if (Math.abs(game.player.x - npc.x) < 90) {
      ctx.fillStyle = '#ffe066';
      ctx.fillText('E 대화', npc.x, npc.y - 84);
    }
  });
}

function drawNPCBody(npc) {
  const t = performance.now() / 1000;
  const bob = Math.sin(t * 3) * 1.2;

  const look = {
    taxi: { skin: '#8d5524', hair: '#111827', hat: '#1f2937', body: '#facc15', sub: '#111827', pants: '#374151', prop: 'taxi' },
    merchant: { skin: '#f1c27d', hair: '#7c2d12', hat: '#b45309', body: '#22c55e', sub: '#fef3c7', pants: '#14532d', prop: 'bag' },
    weapon: { skin: '#c68642', hair: '#3f2a1d', hat: '#374151', body: '#64748b', sub: '#f97316', pants: '#1f2937', prop: 'hammer' },
    blacksmith: { skin: '#c68642', hair: '#1f2937', hat: '#4b5563', body: '#7c2d12', sub: '#f59e0b', pants: '#292524', prop: 'hammer' },
    quest: { skin: '#f1c27d', hair: '#e5e7eb', hat: '#6d28d9', body: '#7c3aed', sub: '#fef08a', pants: '#312e81', prop: 'scroll' },
    job: { skin: '#f1c27d', hair: '#e5e7eb', hat: '#0f172a', body: '#2563eb', sub: '#bfdbfe', pants: '#1e3a8a', prop: 'star' }
  }[npc.type] || { skin: '#ffd6a6', hair: '#6b3f22', hat: '#334155', body: '#60a5fa', sub: '#f8fafc', pants: '#374151', prop: 'none' };

  ctx.save();
  ctx.translate(npc.x, npc.y + bob);
  ctx.scale(0.72, 0.72);

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(0, 3, 24, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#171717';
  roundRect(ctx, -16, -33, 13, 25, 6);
  roundRect(ctx, 3, -33, 13, 25, 6);
  ctx.fillStyle = look.pants;
  roundRect(ctx, -13, -31, 9, 22, 5);
  roundRect(ctx, 4, -31, 9, 22, 5);
  ctx.fillStyle = '#171717';
  roundRect(ctx, -22, -12, 21, 7, 2);
  roundRect(ctx, 1, -12, 21, 7, 2);

  ctx.fillStyle = '#171717';
  roundRect(ctx, -21, -66, 42, 40, 10);
  ctx.fillStyle = look.body;
  roundRect(ctx, -18, -63, 36, 36, 9);
  ctx.fillStyle = look.sub;
  ctx.fillRect(-11, -58, 22, 6);
  ctx.fillRect(-15, -37, 30, 8);

  ctx.strokeStyle = '#171717';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(-16, -57); ctx.lineTo(-28, -45);
  ctx.moveTo(16, -57); ctx.lineTo(28, -45);
  ctx.stroke();
  ctx.strokeStyle = look.body;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-16, -57); ctx.lineTo(-28, -45);
  ctx.moveTo(16, -57); ctx.lineTo(28, -45);
  ctx.stroke();

  ctx.fillStyle = '#171717';
  circle(ctx, -28, -45, 5);
  circle(ctx, 28, -45, 5);
  ctx.fillStyle = look.skin;
  circle(ctx, -28, -45, 3.4);
  circle(ctx, 28, -45, 3.4);

  if (look.prop === 'hammer') {
    ctx.save();
    ctx.translate(30, -48);
    ctx.rotate(-0.6);
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(-12, -31, 24, 10);
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(-3, -22, 6, 34);
    ctx.restore();
  } else if (look.prop === 'bag') {
    ctx.fillStyle = '#92400e';
    roundRect(ctx, 22, -39, 18, 20, 5);
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(27, -35, 8, 3);
  } else if (look.prop === 'scroll') {
    ctx.fillStyle = '#fef3c7';
    roundRect(ctx, 22, -49, 16, 24, 4);
    ctx.fillStyle = '#92400e';
    ctx.fillRect(25, -42, 10, 2);
    ctx.fillRect(25, -36, 8, 2);
  } else if (look.prop === 'taxi') {
    ctx.fillStyle = '#facc15';
    roundRect(ctx, -38, -26, 23, 14, 4);
    ctx.fillStyle = '#111827';
    circle(ctx, -32, -11, 3);
    circle(ctx, -21, -11, 3);
  }

  ctx.fillStyle = '#171717';
  circle(ctx, -20, -90, 5);
  circle(ctx, 20, -90, 5);
  ctx.beginPath();
  ctx.ellipse(0, -92, 22, 23, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = look.skin;
  circle(ctx, -19, -90, 3.7);
  circle(ctx, 19, -90, 3.7);
  ctx.beginPath();
  ctx.ellipse(0, -92, 18.5, 20.5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = look.hair;
  roundRect(ctx, -16, -113, 32, 12, 8);

  ctx.fillStyle = look.hat;
  if (npc.type === 'taxi') {
    roundRect(ctx, -18, -120, 36, 9, 4);
    ctx.fillRect(-13, -127, 26, 9);
  } else if (npc.type === 'merchant') {
    ctx.beginPath();
    ctx.ellipse(0, -113, 25, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    roundRect(ctx, -12, -126, 24, 14, 5);
  } else if (npc.type === 'job' || npc.type === 'quest') {
    ctx.beginPath();
    ctx.moveTo(-22, -112); ctx.lineTo(0, -138); ctx.lineTo(22, -112);
    ctx.closePath();
    ctx.fill();
  } else {
    roundRect(ctx, -18, -119, 36, 12, 5);
  }

  ctx.fillStyle = '#111827';
  ctx.fillRect(-8, -99, 3.5, 5);
  ctx.fillRect(4.5, -99, 3.5, 5);
  ctx.fillRect(-3, -88, 6, 1.5);
  ctx.restore();
}
function drawMonsters() {
  game.monsters.forEach(function (m) {
    if (m.dead) return;

    ctx.save();
    ctx.translate(m.x, m.y + Math.sin(m.time * 6) * 2);
    ctx.scale(m.face, 1);

    if (m.hit > 0) ctx.globalAlpha = 0.55;

    drawMonsterShape(m.type);

    ctx.restore();

    const big = m.type.shape === 'golem' || m.type.shape === 'ogre';
    const barW = big ? 70 : 48;
    const barY = big ? m.y - 95 : m.y - 54;

    ctx.fillStyle = '#0008';
    ctx.fillRect(m.x - barW / 2, barY, barW, 6);

    ctx.fillStyle = '#ff4d4f';
    ctx.fillRect(m.x - barW / 2, barY, barW * clamp(m.hp / m.maxHp, 0, 1), 6);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv.${m.type.level}`, m.x, barY - 4);
  });
}

function drawMonsterShape(type) {
  const color = type.color;

  if (type.shape === 'slime') {
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.ellipse(0, -18, 25, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -20, 22, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.fillRect(-8, -23, 4, 4);
    ctx.fillRect(5, -23, 4, 4);
    return;
  }

  if (type.shape === 'mushroom') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -42, 28, 19, 0, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#fff1cc';
    ctx.fillRect(-18, -40, 36, 24);

    ctx.fillStyle = '#7a4d27';
    ctx.fillRect(-7, -18, 14, 18);

    ctx.fillStyle = '#111827';
    ctx.fillRect(-9, -31, 4, 4);
    ctx.fillRect(5, -31, 4, 4);
    return;
  }

  if (type.shape === 'spirit') {
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -40, 23, 30, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.fillRect(-8, -45, 4, 5);
    ctx.fillRect(5, -45, 4, 5);

    ctx.shadowBlur = 0;
    return;
  }

  if (type.shape === 'boar') {
    ctx.fillStyle = color;
    roundRect(ctx, -36, -47, 72, 32, 14);

    ctx.fillStyle = '#f8f0c8';
    ctx.fillRect(22, -36, 12, 5);

    ctx.fillStyle = '#111827';
    ctx.fillRect(10, -38, 4, 4);

    ctx.strokeStyle = '#3a2a1d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-18, -18);
    ctx.lineTo(-22, 0);
    ctx.moveTo(18, -18);
    ctx.lineTo(22, 0);
    ctx.stroke();
    return;
  }

  if (type.shape === 'bug') {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -30, 28, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;

    for (let i = -18; i <= 18; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, -22);
      ctx.lineTo(i - 8, -5);
      ctx.moveTo(i, -22);
      ctx.lineTo(i + 8, -5);
      ctx.stroke();
    }

    ctx.fillStyle = '#111827';
    ctx.fillRect(-8, -34, 4, 4);
    ctx.fillRect(5, -34, 4, 4);
    return;
  }

  if (type.shape === 'lizard') {
    ctx.fillStyle = color;
    roundRect(ctx, -36, -44, 68, 28, 12);

    ctx.beginPath();
    ctx.moveTo(-34, -31);
    ctx.lineTo(-60, -23);
    ctx.lineTo(-34, -20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.fillRect(12, -36, 4, 4);
    return;
  }

  ctx.fillStyle = '#111827';
  roundRect(ctx, -36, -95, 72, 78, 16);

  ctx.fillStyle = color;
  roundRect(ctx, -31, -90, 62, 70, 14);

  ctx.fillStyle = lighten(color, 35);
  roundRect(ctx, -25, -116, 50, 34, 10);

  ctx.fillStyle = '#111827';
  ctx.fillRect(-10, -103, 5, 6);
  ctx.fillRect(6, -103, 5, 6);

  ctx.fillStyle = darken(color, 25);
  roundRect(ctx, -51, -62, 18, 48, 8);
  roundRect(ctx, 33, -62, 18, 48, 8);
}

function drawDrops() {
  game.drops.forEach(function (d) {
    ctx.save();
    ctx.translate(d.x, d.y);

    if (d.kind === 'gold') {
      ctx.fillStyle = '#ffd43b';
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#9c6b00';
      ctx.strokeRect(-5, -4, 10, 8);
    } else {
      drawItemIcon(ITEMS[d.itemId] || 'drop', 0, 0, 18);
    }

    ctx.restore();
  });
}

function drawProjectiles() {
  game.projectiles.forEach(function (p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.scale(p.face, 1);

    const power = p.effectPower || 1;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10 + power * 5;

    if (p.kind === 'arrow') {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3 + Math.min(2, power * 0.3);
      ctx.beginPath();
      ctx.moveTo(-20 - power * 3, 0);
      ctx.lineTo(18 + power * 2, 0);
      ctx.stroke();

      ctx.fillStyle = '#e5e7eb';
      ctx.beginPath();
      ctx.moveTo(22 + power * 2, 0);
      ctx.lineTo(12, -5 - power);
      ctx.lineTo(12, 5 + power);
      ctx.closePath();
      ctx.fill();

      if (power >= 2) {
        ctx.strokeStyle = p.color || '#ffd43b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-30 - power * 4, 0);
        ctx.lineTo(-5, 0);
        ctx.stroke();
      }

      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(-24, -5, 7, 3);
      ctx.fillRect(-24, 2, 7, 3);
    } else if (p.kind === 'magic') {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 15 + power * 3, 10 + power * 2, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#ffffffaa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 20 + power * 5, 0, Math.PI * 2);
      ctx.stroke();

      if (power >= 2.4) {
        ctx.strokeStyle = p.color || '#74c0fc';
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, 29 + power * 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      ctx.fillStyle = '#fff8';
      ctx.beginPath();
      ctx.ellipse(6, -4, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, 16, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fff8';
      ctx.beginPath();
      ctx.ellipse(5, -1, 5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });
}

function drawPlayer(player, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(player.face * scale, scale);

  if (player.hurtTime > 0) ctx.globalAlpha = 0.55;

  drawPlayerBody(ctx, player);

  ctx.restore();
}

function drawPlayerBody(c, player) {
  const ch = player.character || game.player.character;
  const walk = Math.sin(player.animTime * 13);
  const moving = player.anim === 'walk';
  const leg = moving ? walk * 5 : 0;
  const arm = moving ? -walk * 4 : 0;

  const armorId = itemRefId(equipment.armor);
  const helmetId = itemRefId(equipment.helmet);
  const kneeId = itemRefId(equipment.knee);
  const weaponId = itemRefId(equipment.weapon);

  let bodyColor = '#4f93f5';
  let bodyDark = '#2f6fbd';
  let pantsColor = '#374151';

  if (armorId === 'iron_armor') {
    bodyColor = '#8fa3b8';
    bodyDark = '#52677d';
  }

  if (armorId === 'magic_robe') {
    bodyColor = '#8b5cf6';
    bodyDark = '#5b36b8';
    pantsColor = '#4c1d95';
  }

  if (kneeId) pantsColor = '#475569';

  c.lineCap = 'round';
  c.lineJoin = 'round';

  c.fillStyle = 'rgba(0,0,0,0.24)';
  c.beginPath();
  c.ellipse(0, 3, 22, 5, 0, 0, Math.PI * 2);
  c.fill();

  // neck
  c.fillStyle = '#171717';
  c.fillRect(-6, -72, 12, 10);
  c.fillStyle = ch.skin || '#ffd6a6';
  c.fillRect(-4, -71, 8, 9);

  // connected legs and shoes
  c.fillStyle = '#171717';
  roundRect(c, -16 + leg, -33, 13, 25, 6);
  roundRect(c, 3 - leg, -33, 13, 25, 6);
  c.fillStyle = pantsColor;
  roundRect(c, -13 + leg, -31, 9, 22, 5);
  roundRect(c, 4 - leg, -31, 9, 22, 5);

  c.fillStyle = '#171717';
  roundRect(c, -22 + leg, -12, 21, 7, 2);
  roundRect(c, 1 - leg, -12, 21, 7, 2);
  c.fillStyle = '#5a3821';
  roundRect(c, -19 + leg, -10.5, 16, 4.5, 1);
  roundRect(c, 4 - leg, -10.5, 16, 4.5, 1);

  // torso, waist, shoulders
  c.fillStyle = '#171717';
  roundRect(c, -20, -66, 40, 40, 10);
  c.fillStyle = bodyColor;
  roundRect(c, -17, -63, 34, 36, 9);
  c.fillStyle = bodyDark;
  roundRect(c, -15, -36, 30, 9, 4);
  c.fillStyle = '#f8f9ff';
  c.fillRect(-11, -58, 22, 5);

  let lx = -21 + arm;
  let ly = -46;
  let rx = 21 - arm;
  let ry = -46;

  if (player.anim === 'attack') {
    const kind = player.attackKind || (weaponId ? ((ITEMS[weaponId] || {}).weaponType || 'sword') : 'fist');
    const atk = Math.sin(Math.min(1, player.animTime * 14) * Math.PI);

    if (kind === 'sword') {
      rx = 23 + atk * 33;
      ry = -58 + atk * 13;
      lx = -19 - atk * 4;
      ly = -48;
    } else if (kind === 'dagger') {
      const jab = Math.sin(Math.min(1, player.animTime * 28) * Math.PI);
      rx = 24 + jab * 30;
      ry = -45;
      lx = -20;
      ly = -47;
    } else if (kind === 'bow') {
      rx = 30;
      ry = -51;
      lx = -29 - atk * 9;
      ly = -52;
    } else if (kind === 'staff') {
      rx = 35;
      ry = -66 + atk * 8;
      lx = -19;
      ly = -47;
    } else {
      rx = 24 + atk * 24;
      ry = -48;
    }
  }

  if (player.anim === 'jump') {
    lx = -22;
    rx = 22;
    ly = -53;
    ry = -53;
  }

  // connected arms: dark sleeve plus hands
  c.strokeStyle = '#171717';
  c.lineWidth = 9;
  c.beginPath();
  c.moveTo(-15, -57);
  c.lineTo(lx, ly);
  c.stroke();
  c.beginPath();
  c.moveTo(15, -57);
  c.lineTo(rx, ry);
  c.stroke();

  c.strokeStyle = bodyDark;
  c.lineWidth = 6;
  c.beginPath();
  c.moveTo(-15, -57);
  c.lineTo(lx, ly);
  c.stroke();
  c.beginPath();
  c.moveTo(15, -57);
  c.lineTo(rx, ry);
  c.stroke();

  c.fillStyle = '#171717';
  circle(c, lx, ly, 5);
  circle(c, rx, ry, 5);
  c.fillStyle = ch.skin || '#ffd6a6';
  circle(c, lx, ly, 3.4);
  circle(c, rx, ry, 3.4);

  drawWeapon(c, weaponId, rx, ry, player.anim === 'attack', player.attackKind, player.animTime);

  // ears, face, hair
  c.fillStyle = '#171717';
  circle(c, -20, -90, 5);
  circle(c, 20, -90, 5);
  c.beginPath();
  c.ellipse(0, -92, 22, 23, 0, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = ch.skin || '#ffd6a6';
  circle(c, -19, -90, 3.7);
  circle(c, 19, -90, 3.7);
  c.beginPath();
  c.ellipse(0, -92, 18.5, 20.5, 0, 0, Math.PI * 2);
  c.fill();

  drawHair(c, ch, -92);
  drawFace(c, ch, -92);
  drawEquippedHelmet(c, helmetId, -92);

  if (player.anim === 'attack') {
    const kind = player.attackKind || (weaponId ? ((ITEMS[weaponId] || {}).weaponType || 'sword') : 'fist');
    const t = Math.sin(Math.min(1, player.animTime * 14) * Math.PI);

    if (kind === 'sword') {
      c.strokeStyle = '#ffe066';
      c.lineWidth = 5;
      c.beginPath();
      c.arc(35, -51, 20 + t * 22, -1.15, 0.85);
      c.stroke();
    } else if (kind === 'dagger') {
      c.strokeStyle = '#d8b4fe';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(26, -47);
      c.lineTo(58 + t * 12, -47);
      c.stroke();
    } else if (kind === 'staff') {
      c.strokeStyle = '#74c0fc';
      c.lineWidth = 3;
      c.beginPath();
      c.arc(38, -72, 8 + t * 7, 0, Math.PI * 2);
      c.stroke();
    } else if (kind === 'bow') {
      c.strokeStyle = '#ffd43b';
      c.lineWidth = 3;
      c.beginPath();
      c.moveTo(34, -52);
      c.lineTo(60 + t * 18, -52);
      c.stroke();
    } else {
      c.strokeStyle = '#ffe066';
      c.lineWidth = 4;
      c.beginPath();
      c.arc(30, -44, 12 + t * 18, -0.7, 0.85);
      c.stroke();
    }
  }
}

function drawFace(c, ch, headY) {
  const style = ch.faceStyle || 'normal';

  c.fillStyle = 'rgba(255,120,150,0.22)';
  c.fillRect(-13, headY + 1, 5, 2.5);
  c.fillRect(8, headY + 1, 5, 2.5);

  c.fillStyle = '#111827';

  if (style === 'sleepy') {
    c.strokeStyle = '#111827';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(-9, headY - 6);
    c.lineTo(-4, headY - 6);
    c.moveTo(4, headY - 6);
    c.lineTo(9, headY - 6);
    c.stroke();
  } else {
    c.fillRect(-8, headY - 7, 3.5, 5.5);
    c.fillRect(4.5, headY - 7, 3.5, 5.5);

    c.fillStyle = '#fff';
    c.fillRect(-7.5, headY - 6.5, 1.2, 1.5);
    c.fillRect(5, headY - 6.5, 1.2, 1.5);
  }

  c.strokeStyle = '#111827';
  c.lineWidth = 1.5;

  if (style === 'bright' || style === 'cute') {
    c.beginPath();
    c.arc(0, headY + 3, 3.5, 0, Math.PI);
    c.stroke();
  } else {
    c.fillStyle = '#111827';
    c.fillRect(-3, headY + 3, 6, 1.5);
  }
}

function drawHair(c, ch, headY) {
  const hair = ch.hair || '#2b160e';
  const style = ch.hairStyle || 'basic';

  c.fillStyle = '#111827';

  if (style === 'spiky') {
    c.beginPath();
    c.moveTo(-19, headY - 9);
    c.lineTo(-13, headY - 23);
    c.lineTo(-7, headY - 14);
    c.lineTo(0, headY - 26);
    c.lineTo(7, headY - 14);
    c.lineTo(14, headY - 22);
    c.lineTo(19, headY - 9);
    c.lineTo(16, headY - 5);
    c.lineTo(-16, headY - 5);
    c.closePath();
    c.fill();
  } else {
    roundRect(c, -20, headY - 24, 40, 19, 12);
    c.fillRect(-15, headY - 9, 30, 4);
  }

  c.fillStyle = hair;

  if (style === 'spiky') {
    c.beginPath();
    c.moveTo(-16, headY - 9);
    c.lineTo(-12, headY - 20);
    c.lineTo(-6, headY - 12);
    c.lineTo(0, headY - 23);
    c.lineTo(6, headY - 12);
    c.lineTo(12, headY - 20);
    c.lineTo(16, headY - 9);
    c.lineTo(13, headY - 6);
    c.lineTo(-13, headY - 6);
    c.closePath();
    c.fill();
  } else {
    roundRect(c, -17.5, headY - 21.5, 35, 16, 10);
    c.fillRect(-12, headY - 8, 24, 3.5);
  }

  if (style === 'short') {
    for (let i = -13; i <= 7; i += 6) {
      c.beginPath();
      c.moveTo(i, headY - 8);
      c.lineTo(i + 4, headY - 3);
      c.lineTo(i + 8, headY - 8);
      c.fill();
    }
  }

  if (style === 'pony') {
    c.beginPath();
    c.ellipse(20, headY - 5, 7, 12, -0.25, 0, Math.PI * 2);
    c.fill();
  }

  if (style === 'wave' || style === 'bob') {
    circle(c, -15, headY - 1, 5);
    circle(c, 15, headY - 1, 5);

    if (style === 'bob') {
      c.fillRect(-14, headY - 4, 28, 4);
    }
  }

  c.fillStyle = 'rgba(255,255,255,0.22)';
  c.fillRect(-8, headY - 18, 7, 2);
}

function drawEquippedHelmet(c, helmetId, headY) {
  if (!helmetId) return;
  const item = ITEMS[helmetId];
  const px = item && item.pixel ? item.pixel : { a: '#adb5bd', b: '#74c0fc', variant: 1 };
  c.fillStyle = '#111827';
  roundRect(c, -21, headY - 27, 42, 17, 8);
  c.fillStyle = px.a;
  roundRect(c, -18, headY - 25, 36, 13, 7);
  c.fillStyle = px.b;
  c.fillRect(-10, headY - 28, 20, 4);
}

function drawWeapon(c, weaponId, handX, handY, attacking, attackKind, animTime) {
  if (!weaponId) return;

  const weaponData = ITEMS[weaponId] || {};
  const weaponKind = attackKind || weaponData.weaponType || (weaponId.includes('staff') ? 'staff' : weaponId.includes('bow') ? 'bow' : weaponId.includes('dagger') ? 'dagger' : 'sword');
  const px = weaponData.pixel || { a: '#e5e7eb', b: '#f97316', variant: 1 };
  const t = attacking ? Math.sin(Math.min(1, (animTime || 0) * 14) * Math.PI) : 0;

  c.save();
  c.translate(handX, handY);

  if (weaponKind === 'sword') c.rotate(attacking ? -1.35 + t * 1.75 : -0.35);
  else if (weaponKind === 'dagger') c.rotate(attacking ? -0.25 : -0.35);
  else if (weaponKind === 'bow') c.rotate(attacking ? -0.05 : -0.25);
  else if (weaponKind === 'staff') c.rotate(attacking ? -0.75 + t * 0.25 : -0.35);
  else c.rotate(attacking ? -0.9 : -0.35);

  if (weaponKind === 'staff') {
    c.strokeStyle = '#111827';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(0, 10);
    c.lineTo(0, -42);
    c.stroke();

    c.strokeStyle = px.a;
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 10);
    c.lineTo(0, -42);
    c.stroke();

    c.fillStyle = px.b;
    circle(c, 0, -46, 6 + (px.variant % 3));

    if (attacking) {
      c.strokeStyle = '#bfdbfe';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, -46, 11 + t * 8, 0, Math.PI * 2);
      c.stroke();
    }
  } else if (weaponKind === 'bow') {
    c.strokeStyle = '#111827';
    c.lineWidth = 5;
    c.beginPath();
    c.arc(0, -9, 21, -Math.PI / 2, Math.PI / 2);
    c.stroke();

    c.strokeStyle = px.a;
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, -9, 21, -Math.PI / 2, Math.PI / 2);
    c.stroke();

    c.strokeStyle = '#e5e7eb';
    c.lineWidth = 1.5;
    c.beginPath();
    c.moveTo(0, -30);
    c.lineTo(attacking ? -12 - t * 8 : 0, -9);
    c.lineTo(0, 12);
    c.stroke();

    if (attacking) {
      c.strokeStyle = '#fef3c7';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-16 - t * 8, -9);
      c.lineTo(22, -9);
      c.stroke();
    }
  } else if (weaponKind === 'dagger') {
    c.fillStyle = px.a;
    c.beginPath();
    c.moveTo(0, -34);
    c.lineTo(7, -19);
    c.lineTo(-7, -19);
    c.closePath();
    c.fill();

    c.fillStyle = px.b;
    c.fillRect(-7, -21, 14, 4);
    c.fillStyle = '#111827';
    c.fillRect(-3, -17, 6, 21);
  } else {
    c.fillStyle = px.a;
    c.beginPath();
    c.moveTo(0, -56);
    c.lineTo(10, -35);
    c.lineTo(3, -18);
    c.lineTo(-3, -18);
    c.lineTo(-10, -35);
    c.closePath();
    c.fill();

    c.fillStyle = '#ffffff88';
    c.fillRect(-2, -49, 3, 27);
    c.fillStyle = px.b;
    c.fillRect(-13, -21, 26, 5);
    c.fillStyle = '#7c2d12';
    c.fillRect(-4, -18, 8, 26);
  }

  c.restore();
}

/* =========================================================
   HUD / Panels
========================================================= */

function drawHUD() {
  const p = game.player;
  const job = JOBS[p.character.job] || JOBS.beginner;

  ctx.fillStyle = 'rgba(17,24,39,0.92)';
  roundRect(ctx, 12, 10, 560, 82, 12);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`LV. ${p.level}`, 28, 34);
  ctx.fillText(p.character.name || '초보자', 92, 34);

  ctx.fillStyle = '#4f9cff';
  ctx.fillText(job.name, 92, 58);

  drawBar(210, 20, 150, 14, p.hp / p.maxHp, '#ff4d4f', `HP ${Math.floor(p.hp)}/${p.maxHp}`);
  drawBar(210, 42, 150, 14, p.mp / p.maxMp, '#4dabf7', `MP ${Math.floor(p.mp)}/${p.maxMp}`);
  drawBar(374, 20, 170, 14, p.exp / p.nextExp, '#ffd43b', `EXP ${Math.floor(p.exp)}/${p.nextExp}`);

  ctx.fillStyle = 'rgba(17,24,39,0.82)';
  roundRect(ctx, 12, 95, 800, 36, 10);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('A/D 이동 · Space 점프 · J 공격 · K/L/; 스킬 · E 대화/포탈 · Z 줍기 · M 인벤 · C 스탯 · U 스킬 · Q 퀘스트', 28, 118);

  drawMiniMap();
  drawGold();
  drawQuickSlots();
  drawSkillHotbar();
  drawQuestTracker();
}

function drawBar(x, y, w, h, ratio, color, label) {
  ctx.fillStyle = '#0008';
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * clamp(ratio, 0, 1), h);

  ctx.strokeStyle = '#ffffff99';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText(label, x + 5, y + h - 3);
}

function drawMiniMap() {
  const x = W - 215;
  const y = 16;
  const w = 195;
  const h = 72;

  ctx.fillStyle = 'rgba(15,23,42,0.9)';
  roundRect(ctx, x, y, w, h, 10);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(game.mode === 'town' ? getTown(game.townId).name : getHunt(game.huntId).name, x + 10, y + 18);

  ctx.fillStyle = '#69db7c';
  ctx.fillRect(x + 12, y + 42, w - 24, 5);

  const px = x + 12 + (game.player.x / game.width) * (w - 24);

  ctx.fillStyle = '#ffdd57';
  ctx.beginPath();
  ctx.arc(px, y + 44, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawGold() {
  ctx.fillStyle = 'rgba(17,24,39,0.9)';
  roundRect(ctx, W - 190, 98, 170, 34, 8);

  ctx.fillStyle = '#ffd43b';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Gold ${wallet.gold}`, W - 172, 121);
}

function drawQuickSlots() {
  const startX = W - 265;
  const y = H - 70;

  for (let i = 0; i < 4; i++) {
    const x = startX + i * 58;

    ctx.fillStyle = 'rgba(17,24,39,0.9)';
    roundRect(ctx, x, y, 48, 48, 8);

    ctx.strokeStyle = '#ffffff88';
    ctx.strokeRect(x, y, 48, 48);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(String(i + 1), x + 6, y + 15);

    const id = inventory.quickSlots[i];
    const owned = id ? getItemCount(id) : 0;

    if (id && owned > 0) {
      drawItemIcon(ITEMS[id].icon, x + 24, y + 26, 28);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(owned), x + 43, y + 43);
      ctx.textAlign = 'left';
    }
  }
}

function drawSkillHotbar() {
  const startX = 380;
  const y = H - 70;

  const data = [
    ['J', '기본공격', null],
    ['K', skills.hotkeys.k, skills.hotkeys.k],
    ['L', skills.hotkeys.l, skills.hotkeys.l],
    [';', skills.hotkeys.semicolon, skills.hotkeys.semicolon]
  ];

  data.forEach(function (slot, i) {
    const x = startX + i * 76;
    const key = slot[0];
    const id = slot[2];

    ctx.fillStyle = 'rgba(17,24,39,0.9)';
    roundRect(ctx, x, y, 66, 48, 8);

    ctx.strokeStyle = '#ffffff88';
    ctx.strokeRect(x, y, 66, 48);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(key, x + 6, y + 15);

    if (id && SKILLS[id]) {
      drawSkillIcon(SKILLS[id], x + 33, y + 28, 26);

      const cd = skills.cooldowns[id] || 0;

      if (cd > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(x, y, 66, 48);

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(cd.toFixed(1), x + 33, y + 30);
      }
    } else {
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(slot[1] || '-', x + 33, y + 34);
    }
  });
}

function drawQuestTracker() {
  if (!quests.active.length) return;

  const x = W - 310;
  const y = 145;
  const w = 290;
  const h = 46 + quests.active.length * 78;

  ctx.fillStyle = 'rgba(15,23,42,0.82)';
  roundRect(ctx, x, y, w, h, 10);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('진행 중 퀘스트', x + 14, y + 22);

  let cy = y + 50;

  quests.active.slice(0, 4).forEach(function (q) {
    syncQuestItems(q);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(q.title, x + 14, cy);

    cy += 18;

    q.goals.forEach(function (goal) {
      ctx.fillStyle = goal.count >= goal.need ? '#c0eb75' : '#cbd5e1';
      ctx.font = '12px sans-serif';

      let label = '';

      if (goal.type === 'kill') label = `${goal.family} 처치`;
      else label = ITEMS[goal.itemId] ? ITEMS[goal.itemId].name : goal.itemId;

      ctx.fillText(`${label}: ${goal.count}/${goal.need}`, x + 24, cy);
      cy += 16;
    });

    cy += 10;
  });
}

function drawInventoryPanel() {
  const x = 50;
  const y = 96;
  const w = 850;
  const h = 560;

  ctx.fillStyle = 'rgba(235,245,255,0.96)';
  roundRect(ctx, x, y, w, h, 10);

  ctx.strokeStyle = '#5b87b7';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#2f5f91';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('EQUIPMENT / ITEM INVENTORY', x + 22, y + 36);

  drawEquipmentBox(x + 20, y + 62);
  drawItemBox(x + 395, y + 62);
}

function drawEquipmentBox(x, y) {
  const w = 340;
  const h = 455;

  ctx.fillStyle = '#f8fbff';
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = '#8eb2d5';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#2f5f91';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('EQUIPMENT INVENTORY', x + 14, y + 28);

  const slots = [
    { name: '헬멧', key: 'helmet', x: 134, y: 48 },
    { name: '무기', key: 'weapon', x: 28, y: 158 },
    { name: '갑옷', key: 'armor', x: 134, y: 158 },
    { name: '무릎', key: 'knee', x: 240, y: 158 },
    { name: '악세', key: 'accessory', x: 134, y: 275 }
  ];

  ctx.strokeStyle = '#bfd7ea';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.ellipse(x + 170, y + 235, 78, 155, 0, 0, Math.PI * 2);
  ctx.stroke();

  slots.forEach(function (slot) {
    const sx = x + slot.x;
    const sy = y + slot.y;

    ctx.fillStyle = '#dbeafe';
    ctx.fillRect(sx, sy, 72, 72);

    ctx.strokeStyle = '#9bb7d6';
    ctx.strokeRect(sx, sy, 72, 72);

    ctx.fillStyle = '#5b7ea6';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(slot.name, sx + 36, sy - 8);

    const ref = equipment[slot.key];
    const data = getItemData(ref);

    if (data) {
      drawItemIcon(data, sx + 36, sy + 36, 42);

      ctx.fillStyle = '#233';
      ctx.font = '11px sans-serif';
      ctx.fillText(getItemDisplayName(ref).slice(0, 10), sx + 36, sy + 88);
    }
  });

  const fake = {
    ...game.player,
    anim: 'idle',
    animTime: performance.now() / 1000,
    face: 1
  };

  ctx.save();
  ctx.translate(x + 170, y + 410);
  ctx.scale(1.05, 1.05);
  drawPlayerBody(ctx, fake);
  ctx.restore();
}

function drawItemBox(x, y) {
  const w = 410;
  const h = 455;

  ctx.fillStyle = '#fff';
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = '#8eb2d5';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#2f5f91';
  ctx.font = 'bold 17px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`ITEM INVENTORY ${inventory.items.length}/100`, x + 14, y + 28);

  const tabs = ['장비', '소비', '기타'];

  tabs.forEach(function (tab, i) {
    const tx = x + 14 + i * 74;

    ctx.fillStyle = i === 0 ? '#ff7aa2' : '#d9e6f4';
    ctx.fillRect(tx, y + 42, 68, 32);

    ctx.strokeStyle = '#8eb2d5';
    ctx.strokeRect(tx, y + 42, 68, 32);

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tab, tx + 34, y + 64);
  });

  const gridX = x + 18;
  const gridY = y + 88;
  const cell = 56;

  for (let i = 0; i < 36; i++) {
    const cx = gridX + (i % 6) * cell;
    const cy = gridY + Math.floor(i / 6) * cell;

    ctx.fillStyle = '#eef6ff';
    ctx.fillRect(cx, cy, 48, 48);

    ctx.strokeStyle = '#cad9e8';
    ctx.strokeRect(cx, cy, 48, 48);

    const item = inventory.items[i];

    if (item) {
      const data = ITEMS[item.id];

      drawItemIcon(data || 'drop', cx + 24, cy + 24, 34);

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(item.count), cx + 43, cy + 43);
    }
  }

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(x + 14, y + 405, 300, 34);

  ctx.strokeStyle = '#8eb2d5';
  ctx.strokeRect(x + 14, y + 405, 300, 34);

  ctx.fillStyle = '#111827';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${wallet.gold} 메소`, x + 26, y + 428);
}

function drawStatsPanel() {
  const x = 560;
  const y = 120;
  const w = 410;
  const h = 440;

  ctx.fillStyle = 'rgba(15,23,42,0.96)';
  roundRect(ctx, x, y, w, h, 14);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 25px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('스탯', x + 25, y + 45);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`남은 AP: ${stats.ap}`, x + 25, y + 82);

  drawStatRow('STR', 'str', x + 25, y + 130);
  drawStatRow('DEX', 'dex', x + 25, y + 180);
  drawStatRow('INT', 'int', x + 25, y + 230);
  drawStatRow('LUK', 'luk', x + 25, y + 280);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '13px sans-serif';

  ctx.fillText(`공격력: ${game.player.attackPower}`, x + 25, y + 330);
  ctx.fillText(`마법공격: ${game.player.magicPower}`, x + 160, y + 330);
  ctx.fillText(`방어력: ${game.player.defense}`, x + 25, y + 354);
  ctx.fillText(`치명타: ${game.player.critRate.toFixed(1)}%`, x + 160, y + 354);
  ctx.fillText(`속도: ${game.player.speed}`, x + 25, y + 378);

  ctx.fillStyle = '#94a3b8';
  ctx.fillText('전사 STR / 마법사 INT / 궁수 DEX / 도적 LUK 효율이 좋습니다.', x + 25, y + 412);
}

function drawStatRow(label, key, x, y) {
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${label}: ${stats[key]}`, x, y);

  ctx.fillStyle = stats.ap > 0 ? '#4dabf7' : '#475569';
  roundRect(ctx, x + 230, y - 28, 42, 34, 8);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('+', x + 244, y - 3);
}

function drawSkillsPanel() {
  const x = 70;
  const y = 105;
  const w = 760;
  const h = 500;

  ctx.fillStyle = 'rgba(15,23,42,0.96)';
  roundRect(ctx, x, y, w, h, 14);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 25px sans-serif';
  ctx.fillText('스킬', x + 25, y + 44);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '14px sans-serif';
  ctx.fillText('해금된 스킬을 클릭하면 K → L → ; 순서로 장착됩니다.', x + 25, y + 70);

  const list = getVisibleSkills();

  list.forEach(function (skill, i) {
    const rowY = 190 + i * 56;
    const unlocked = skills.unlocked.includes(skill.id);

    ctx.fillStyle = unlocked ? '#1e293b' : '#111827';
    roundRect(ctx, 100, rowY, 430, 46, 8);

    drawSkillIcon(skill, 126, rowY + 23, 28);

    ctx.fillStyle = unlocked ? '#fff' : '#64748b';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(skill.name, 154, rowY + 18);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Lv.${skill.unlockLevel || 1} / MP ${skill.mp} / ${skill.desc}`, 154, rowY + 36);
  });

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('단축키', 650, 170);

  drawSkillSlot('K', skills.hotkeys.k, 650, 210);
  drawSkillSlot('L', skills.hotkeys.l, 650, 262);
  drawSkillSlot(';', skills.hotkeys.semicolon, 650, 314);
}

function drawSkillSlot(key, id, x, y) {
  ctx.fillStyle = '#1e293b';
  roundRect(ctx, x, y - 25, 140, 38, 8);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`${key}: ${id ? SKILLS[id].name : '-'}`, x + 12, y);
}

function drawQuestsPanel() {
  const x = 70;
  const y = 105;
  const w = 650;
  const h = 500;

  ctx.fillStyle = 'rgba(15,23,42,0.96)';
  roundRect(ctx, x, y, w, h, 14);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 25px sans-serif';
  ctx.fillText('퀘스트', x + 25, y + 44);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '14px sans-serif';
  ctx.fillText('NPC에게 말을 걸어 퀘스트를 수락하거나 완료하세요.', x + 25, y + 70);

  let cy = y + 110;

  if (!quests.active.length) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('진행 중인 퀘스트가 없습니다.', x + 25, cy);
    return;
  }

  quests.active.forEach(function (q) {
    syncQuestItems(q);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(q.title, x + 25, cy);

    cy += 24;

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px sans-serif';
    ctx.fillText(q.desc, x + 35, cy);

    cy += 24;

    q.goals.forEach(function (goal) {
      const done = goal.count >= goal.need;

      ctx.fillStyle = done ? '#c0eb75' : '#e2e8f0';

      let label = '';

      if (goal.type === 'kill') label = `${goal.family} 처치`;
      else label = ITEMS[goal.itemId] ? ITEMS[goal.itemId].name : goal.itemId;

      ctx.fillText(`${label}: ${goal.count}/${goal.need}`, x + 45, cy);
      cy += 19;
    });

    cy += 26;
  });
}

function drawDialog() {
  const npc = game.dialog.npc;

  ctx.fillStyle = 'rgba(15,23,42,0.96)';
  roundRect(ctx, 150, 545, 980, 125, 16);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(150, 545, 980, 125);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(npc.name, 180, 580);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '15px sans-serif';
  ctx.fillText(npc.text || '무엇을 도와드릴까요?', 180, 610);

  let action = '확인';

  if (npc.type === 'taxi') action = '이동하기';
  if (npc.type === 'merchant') action = '상점 열기';
  if (npc.type === 'weapon') action = '장비 보기';
  if (npc.type === 'blacksmith') action = '강화하기';

  if (npc.type === 'quest' || npc.type === 'job') {
    const q = quests.active.find(function (item) {
      return item.id === npc.quest;
    });

    if (quests.completed.includes(npc.quest)) action = '완료됨';
    else if (q) {
      syncQuestItems(q);
      action = questComplete(q) ? '완료하기' : '진행 중';
    } else action = npc.type === 'job' ? '전직 퀘스트' : '퀘스트 수락';
  }

  ctx.fillStyle = '#4dabf7';
  roundRect(ctx, 210, 620, 190, 42, 8);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(action, 305, 647);

  ctx.fillStyle = '#334155';
  roundRect(ctx, 970, 620, 120, 40, 8);

  ctx.fillStyle = '#fff';
  ctx.fillText('닫기', 1030, 646);
}

function drawTaxiPanel() {
  ctx.fillStyle = 'rgba(15,23,42,0.97)';
  roundRect(ctx, 100, 80, 1040, 590, 18);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(100, 80, 1040, 590);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('택시 이동', 135, 122);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '15px sans-serif';
  ctx.fillText('골드를 지불하고 다른 도시로 이동합니다.', 135, 150);

  TOWNS.forEach(function (town, i) {
    const x = 145 + (i % 2) * 360;
    const y = 190 + Math.floor(i / 2) * 82;

    ctx.fillStyle = town.id === game.townId ? '#334155' : '#1e293b';
    roundRect(ctx, x, y, 320, 62, 10);

    ctx.strokeStyle = '#475569';
    ctx.strokeRect(x, y, 320, 62);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 17px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${town.title} ${town.name}`, x + 18, y + 25);

    ctx.fillStyle = '#ffd43b';
    ctx.font = '14px sans-serif';
    ctx.fillText(`${town.recommendLevel} · ${town.id === game.townId ? '현재 위치' : town.taxiCost + ' Gold'}`, x + 18, y + 48);
  });

  ctx.fillStyle = '#334155';
  roundRect(ctx, 1000, 610, 120, 40, 8);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('닫기', 1060, 636);
}

function drawShopPanel() {
  const title = game.shopOpen === 'weapon' ? '장비 상점' : '상점';
  const list = game.shopOpen === 'merchant'
    ? ['hp_potion', 'mp_potion']
    : getShopItemsForCurrentTown();

  const panelX = 80;
  const panelY = 80;
  const panelW = 1080;
  const panelH = 590;
  const startY = 175;
  const rowH = 64;
  const rowCount = Math.ceil(list.length / 2);
  const maxScroll = Math.max(0, rowCount * rowH - 410);
  game.shopScroll = clamp(game.shopScroll || 0, 0, maxScroll);

  ctx.fillStyle = 'rgba(15,23,42,0.97)';
  roundRect(ctx, panelX, panelY, panelW, panelH, 18);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(panelX, panelY, panelW, panelH);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, 110, 122);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '15px sans-serif';
  ctx.fillText(`보유 골드: ${wallet.gold}`, 110, 150);
  if (game.shopOpen === 'weapon') {
    ctx.fillText('기본 장비만 판매합니다. 강한 장비는 몬스터에게서 낮은 확률로 획득하세요.', 250, 150);
  }

  ctx.save();
  ctx.beginPath();
  ctx.rect(90, 165, 1025, 410);
  ctx.clip();

  list.forEach(function (id, i) {
    const item = ITEMS[id];
    if (!item) return;

    const x = 110 + (i % 2) * 500;
    const y = startY + Math.floor(i / 2) * rowH - game.shopScroll;
    if (y < 140 || y > 585) return;

    ctx.fillStyle = '#1e293b';
    roundRect(ctx, x, y, 455, 52, 8);

    drawItemIcon(item, x + 28, y + 26, 30);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, x + 58, y + 20);

    const req = item.reqLevel ? `Lv.${item.reqLevel} / ` : '';
    const line = `${req}${item.desc || ''} / ${item.price || 0}G`;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px sans-serif';
    ctx.fillText(line.length > 48 ? line.slice(0, 48) + '...' : line, x + 58, y + 39);
  });

  ctx.restore();

  if (maxScroll > 0) {
    const trackX = 1125;
    const trackY = 170;
    const trackH = 395;
    const thumbH = Math.max(42, trackH * (410 / (rowCount * rowH)));
    const thumbY = trackY + (trackH - thumbH) * (game.shopScroll / maxScroll);
    ctx.fillStyle = '#334155';
    roundRect(ctx, trackX, trackY, 12, trackH, 6);
    ctx.fillStyle = '#94a3b8';
    roundRect(ctx, trackX, thumbY, 12, thumbH, 6);
  }

  if (game.shopOpen === 'merchant') {
    ctx.fillStyle = '#4dabf7';
    roundRect(ctx, 760, 610, 190, 40, 8);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('부산물 모두 판매', 855, 636);
  }

  ctx.fillStyle = '#334155';
  roundRect(ctx, 1010, 610, 120, 40, 8);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('닫기', 1070, 636);
}


function drawBlacksmithPanel() {
  const x = 790;
  const y = 105;
  const w = 430;
  const h = 500;

  ctx.fillStyle = 'rgba(15,23,42,0.97)';
  roundRect(ctx, x, y, w, h, 16);
  ctx.strokeStyle = '#f59e0b';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('대장장이 강화', x + 22, y + 38);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '13px sans-serif';
  ctx.fillText('장착 중인 장비를 선택해서 강화합니다.', x + 22, y + 64);
  ctx.fillText('5강 이후 실패 시 파괴 확률이 생깁니다.', x + 22, y + 83);

  EQUIP_SLOT_KEYS.forEach(function (slot, i) {
    const ref = equipment[slot];
    const item = getItemData(ref);
    const rowY = y + 112 + i * 64;
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, x + 18, rowY, w - 36, 54, 8);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'left';
    const name = item ? getItemDisplayName(ref) : '-';
    ctx.fillText(`${EQUIP_SLOT_NAMES[slot]}: ${name.length > 20 ? name.slice(0, 20) + '...' : name}`, x + 30, rowY + 20);

    if (item) {
      const plus = itemEnhance(ref);
      const cost = getEnhanceCost(ref);
      const rate = Math.round(getEnhanceRate(plus) * 100);
      const destroy = Math.round(getDestroyRate(plus) * 100);
      const atkUp = getEnhanceBonus({ id: item.id, enhance: plus + 1 }, 'atk') - getEnhanceBonus(ref, 'atk');
      const matkUp = getEnhanceBonus({ id: item.id, enhance: plus + 1 }, 'matk') - getEnhanceBonus(ref, 'matk');
      let effect = '';
      if ((item.atk || 0) || atkUp) effect += ` ATK +${atkUp || 3}`;
      if ((item.matk || 0) || matkUp) effect += ` MATK +${matkUp || 3}`;
      if (!effect) effect = ' 능력치 상승';
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '12px sans-serif';
      ctx.fillText(`비용 ${cost}G · 성공 ${rate}% · 다음:${effect}`, x + 30, rowY + 39);
      if (destroy > 0) {
        ctx.fillStyle = '#fca5a5';
        ctx.textAlign = 'right';
        ctx.fillText(`파괴 ${destroy}%`, x + w - 32, rowY + 20);
      }
    } else {
      ctx.fillStyle = '#94a3b8';
      ctx.font = '12px sans-serif';
      ctx.fillText('장착한 장비가 없습니다.', x + 30, rowY + 39);
    }
  });

  ctx.fillStyle = '#334155';
  roundRect(ctx, x + w - 120, y + h - 48, 92, 34, 8);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('닫기', x + w - 74, y + h - 26);
}

function handleBlacksmithClick(x, y) {
  if (hit(x, y, 1100, 557, 92, 34)) {
    game.blacksmithOpen = false;
    return;
  }

  const panelX = 790;
  const panelY = 105;

  EQUIP_SLOT_KEYS.forEach(function (slot, i) {
    const rowY = panelY + 112 + i * 64;
    if (hit(x, y, panelX + 18, rowY, 394, 54)) enhanceEquippedItem(slot);
  });
}

function enhanceEquippedItem(slot) {
  const ref = equipment[slot];
  const item = getItemData(ref);
  if (!item) return;

  const plus = itemEnhance(ref);
  if (plus >= 10) {
    makeText('이미 최대 강화입니다.', game.player.x, game.player.y - 90, '#ffe066');
    return;
  }

  const cost = getEnhanceCost(ref);
  if (wallet.gold < cost) {
    makeText(`강화 비용 ${cost}G 필요`, game.player.x, game.player.y - 90, '#ff8787');
    return;
  }

  wallet.gold -= cost;

  if (Math.random() < getEnhanceRate(plus)) {
    equipment[slot] = { id: item.id, enhance: plus + 1 };
    recalcStats();
    markAutoSaveSoon();
    makeText(`강화 성공 +${plus + 1}!`, game.player.x, game.player.y - 90, '#c0eb75');
    circleEffect(game.player.x, game.player.y - 55, '#ffd43b');
    return;
  }

  if (plus >= 5 && Math.random() < getDestroyRate(plus)) {
    equipment[slot] = null;
    recalcStats();
    markAutoSaveSoon();
    makeText('강화 실패: 장비 파괴', game.player.x, game.player.y - 90, '#ff6b6b');
    return;
  }

  markAutoSaveSoon();
  makeText('강화 실패', game.player.x, game.player.y - 90, '#cbd5e1');
}

function wrapTooltipLine(text, maxChars) {
  const out = [];
  let line = '';
  String(text).split(' ').forEach(function (word) {
    if ((line + ' ' + word).trim().length > maxChars) {
      if (line) out.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  });
  if (line) out.push(line);
  return out;
}

function drawItemTooltip() {
  if (dragState.active) return;
  const ref = getHoveredItemRef();
  const item = getItemData(ref);
  if (!item || !game.mouse) return;

  const statsText = [];
  ['str', 'dex', 'int', 'luk', 'atk', 'matk', 'def', 'hp', 'mp', 'crit', 'speed'].forEach(function (key) {
    const base = item[key] || 0;
    const extra = getEnhanceBonus(ref, key);
    const v = base + extra;
    if (v) statsText.push(`${key.toUpperCase()} +${v}${extra ? ' (강화 +' + extra + ')' : ''}`);
  });

  const rawLines = [];
  rawLines.push(getItemDisplayName(ref) || item.name);
  if (item.reqLevel) rawLines.push(`장착 가능 레벨: Lv.${item.reqLevel}`);
  if (getEquipSlotForItem(item)) rawLines.push(`부위: ${EQUIP_SLOT_NAMES[getEquipSlotForItem(item)]}`);
  if (item.type === 'etc') rawLines.push(`${item.name}은(는) 몬스터에게서 얻은 부산물입니다.`);
  if (statsText.length) rawLines.push(statsText.join(' / '));
  if (item.desc) rawLines.push(item.desc);
  if (getEquipSlotForItem(item)) {
    const plus = itemEnhance(ref);
    const nextRate = Math.round(getEnhanceRate(plus) * 100);
    const atkEnhance = getEnhanceBonus(ref, 'atk');
    const matkEnhance = getEnhanceBonus(ref, 'matk');
    rawLines.push(`강화: +${plus}/10 · 다음 성공률 ${nextRate}%`);
    if (atkEnhance || matkEnhance) rawLines.push(`강화 추가 공격력: ATK +${atkEnhance} / MATK +${matkEnhance}`);
    if (plus >= 5) rawLines.push(`실패 시 파괴 확률 ${Math.round(getDestroyRate(plus) * 100)}%`);
  }

  const lines = [];
  rawLines.forEach(function (line, i) {
    wrapTooltipLine(line, i === 0 ? 34 : 44).forEach(function (v) {
      lines.push({ text: v, title: i === 0 });
    });
  });

  const w = 410;
  const h = 30 + lines.length * 19;
  const x = Math.min(game.mouse.x + 18, W - w - 12);
  const y = Math.min(game.mouse.y + 18, H - h - 12);

  ctx.fillStyle = 'rgba(15,15,15,0.96)';
  roundRect(ctx, x, y, w, h, 8);
  ctx.strokeStyle = '#facc15';
  ctx.strokeRect(x, y, w, h);

  lines.forEach(function (line, i) {
    ctx.fillStyle = line.title ? '#ffff00' : '#e5e7eb';
    ctx.font = line.title ? 'bold 16px sans-serif' : '13px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(line.text, x + 14, y + 23 + i * 19);
  });
}

function drawDraggedItem() {
  if (!dragState.active || !dragState.item) return;
  const item = ITEMS[itemRefId(dragState.item)];
  if (!item) return;
  ctx.save();
  ctx.globalAlpha = 0.78;
  drawItemIcon(item, dragState.x, dragState.y, 42);
  ctx.restore();
}


/* =========================================================
   Effects / Icons / Props
========================================================= */

function makeText(text, x, y, color) {
  game.texts.push({
    text,
    x,
    y,
    vy: -45,
    life: 0.9,
    color
  });
}

function slashEffect(x, y, face, color, power) {
  const effectPower = clamp(power || 1, 1, 5);
  const slashCount = Math.ceil(effectPower);

  for (let i = 0; i < slashCount; i++) {
    game.particles.push({
      type: 'slash',
      x: x + face * i * 7,
      y: y - i * 5,
      face,
      color,
      power: effectPower,
      vx: face * (80 + i * 28),
      vy: -20 - i * 8,
      life: 0.23 + i * 0.045
    });
  }

  if (effectPower >= 1.8) {
    for (let i = 0; i < effectPower * 5; i++) {
      game.particles.push({
        type: 'spark',
        x: x + rand(-16, 16),
        y: y + rand(-20, 12),
        vx: face * rand(45, 175),
        vy: rand(-120, 70),
        life: rand(0.24, 0.58),
        color
      });
    }
  }
}

function circleEffect(x, y, color) {
  for (let i = 0; i < 10; i++) {
    const a = i / 10 * Math.PI * 2;

    game.particles.push({
      type: 'spark',
      x,
      y,
      vx: Math.cos(a) * 80,
      vy: Math.sin(a) * 80,
      life: 0.45,
      color
    });
  }
}

function drawParticles() {
  game.particles.forEach(function (p) {
    if (p.type === 'slash') {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(p.face, 1);
      ctx.globalAlpha = clamp(p.life * 4, 0, 1);

      const power = p.power || 1;

      ctx.strokeStyle = p.color || '#ffe066';
      ctx.lineWidth = 4 + power;
      ctx.beginPath();
      ctx.arc(0, 0, 22 + power * 8, -0.8, 0.9);
      ctx.stroke();

      ctx.strokeStyle = '#fff8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(4, -2, 14 + power * 6, -0.75, 0.82);
      ctx.stroke();

      if (power >= 2.2) {
        ctx.strokeStyle = p.color || '#fff';
        ctx.globalAlpha = clamp(p.life * 2.8, 0, 0.55);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(8, -4, 34 + power * 9, -0.65, 0.7);
        ctx.stroke();
      }

      ctx.restore();
    }

    if (p.type === 'spark') {
      ctx.save();
      ctx.globalAlpha = clamp(p.life * 2.5, 0, 1);
      ctx.fillStyle = p.color || '#fff';
      circle(ctx, p.x, p.y, 4);
      ctx.restore();
    }
  });
}

function drawTexts() {
  game.texts.forEach(function (t) {
    ctx.fillStyle = t.color;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
  });
}

function drawItemIcon(icon, x, y, size) {
  const item = typeof icon === 'object' ? icon : null;
  const iconType = item ? item.icon : icon;
  const px = item && item.pixel ? item.pixel : { a: '#e5e7eb', b: '#74c0fc', variant: 1 };
  const v = px.variant || 1;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = '#111827';
  roundRect(ctx, x - size * 0.42, y - size * 0.42, size * 0.84, size * 0.84, 4);

  if (iconType === 'hp') {
    ctx.fillStyle = '#ff4d4f';
    circle(ctx, x - 5, y - 3, size * 0.22);
    circle(ctx, x + 5, y - 3, size * 0.22);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.34, y);
    ctx.lineTo(x, y + size * 0.36);
    ctx.lineTo(x + size * 0.34, y);
    ctx.closePath();
    ctx.fill();
  } else if (iconType === 'mp') {
    ctx.fillStyle = '#4dabf7';
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.38);
    ctx.quadraticCurveTo(x + size * 0.35, y, x, y + size * 0.38);
    ctx.quadraticCurveTo(x - size * 0.35, y, x, y - size * 0.38);
    ctx.fill();
  } else if (iconType === 'sword') {
    ctx.strokeStyle = px.a;
    ctx.lineWidth = Math.max(3, size * 0.12);
    ctx.beginPath();
    ctx.moveTo(x - size * 0.28, y + size * 0.28);
    ctx.lineTo(x + size * 0.30, y - size * 0.30);
    ctx.stroke();
    ctx.fillStyle = px.b;
    ctx.fillRect(x - size * 0.09, y + size * 0.10, size * 0.28, size * 0.08);
  } else if (iconType === 'dagger') {
    ctx.fillStyle = px.a;
    ctx.beginPath();
    ctx.moveTo(x + size * 0.25, y - size * 0.34);
    ctx.lineTo(x + size * 0.06, y + size * 0.04);
    ctx.lineTo(x - size * 0.08, y - size * 0.10);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = px.b;
    ctx.fillRect(x - size * 0.20, y + size * 0.06, size * 0.24, size * 0.08);
  } else if (iconType === 'staff') {
    ctx.strokeStyle = px.a;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.25, y + size * 0.32);
    ctx.lineTo(x + size * 0.20, y - size * 0.25);
    ctx.stroke();
    ctx.fillStyle = px.b;
    circle(ctx, x + size * 0.23, y - size * 0.28, size * (0.13 + (v % 3) * 0.02));
  } else if (iconType === 'bow') {
    ctx.strokeStyle = px.a;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.32, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
    ctx.strokeStyle = px.b;
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.32);
    ctx.lineTo(x, y + size * 0.32);
    ctx.stroke();
  } else if (iconType === 'helmet') {
    ctx.fillStyle = px.a;
    ctx.beginPath();
    ctx.ellipse(x, y, size * 0.32, size * 0.25, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = px.b;
    ctx.fillRect(x - size * 0.22, y - size * 0.02, size * 0.44, size * 0.08);
  } else if (iconType === 'knee') {
    ctx.fillStyle = px.a;
    roundRect(ctx, x - size * 0.25, y - size * 0.28, size * 0.5, size * 0.58, 5);
    ctx.fillStyle = px.b;
    ctx.fillRect(x - size * 0.20, y - size * 0.02, size * 0.40, size * 0.08);
  } else if (iconType === 'armor') {
    ctx.fillStyle = px.a;
    roundRect(ctx, x - size * 0.3, y - size * 0.3, size * 0.6, size * 0.6, 5);
    ctx.fillStyle = px.b;
    ctx.fillRect(x - size * 0.18, y - size * 0.15, size * 0.36, size * 0.25);
  } else if (iconType === 'ring') {
    ctx.strokeStyle = px.a;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.25, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = px.b;
    circle(ctx, x, y - size * 0.28, size * 0.10);
  } else if (iconType === 'crystal' || iconType === 'ice' || iconType === 'ore' || iconType === 'core') {
    ctx.fillStyle = iconType === 'ice' ? '#8cecff' : iconType === 'ore' ? '#adb5bd' : iconType === 'core' ? '#b197fc' : '#74c0fc';
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.36);
    ctx.lineTo(x + size * 0.28, y);
    ctx.lineTo(x, y + size * 0.36);
    ctx.lineTo(x - size * 0.28, y);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = '#c0eb75';
    circle(ctx, x, y, size * 0.28);
  }

  ctx.restore();
}

function drawSkillIcon(skill, x, y, size) {
  const color = skill.magic ? '#74c0fc' : skill.heal ? '#69db7c' : '#ff922b';

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  ctx.fillStyle = color;
  circle(ctx, x, y, size / 2);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(skill.name.slice(0, 1), x, y + 4);

  ctx.restore();
}

function drawCloud(x, y, s) {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#fff';

  circle(ctx, x, y, 17 * s);
  circle(ctx, x + 22 * s, y - 9 * s, 24 * s);
  circle(ctx, x + 50 * s, y - 4 * s, 20 * s);
  circle(ctx, x + 75 * s, y, 15 * s);

  ctx.fillRect(x - 8 * s, y, 88 * s, 17 * s);

  ctx.restore();
}

function drawHouse(x, y, theme) {
  const wall = theme === 'ice' ? '#dbeafe' : theme === 'desert' ? '#c98c43' : '#8a6237';
  const roof = theme === 'magic' ? '#a78bfa' : theme === 'desert' ? '#e6b564' : '#dcc879';

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = wall;
  ctx.fillRect(-75, -92, 150, 92);

  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.ellipse(0, -92, 84, 38, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#f3e8aa';
  ctx.fillRect(-55, -65, 36, 28);
  ctx.fillRect(20, -65, 36, 28);

  ctx.fillStyle = '#4e321e';
  ctx.fillRect(-14, -48, 28, 48);

  ctx.restore();
}

function drawTree(x, y, theme) {
  const leaf = theme === 'ice' ? '#c2f2ff' : theme === 'desert' ? '#7faa50' : '#2f7f3b';

  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#764927';
  ctx.fillRect(-10, -80, 20, 80);

  ctx.fillStyle = leaf;
  circle(ctx, -28, -82, 28);
  circle(ctx, 0, -105, 34);
  circle(ctx, 31, -82, 28);
  circle(ctx, 0, -64, 30);

  ctx.restore();
}

function drawPine(x, y, theme) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#70472e';
  ctx.fillRect(-8, -82, 16, 82);

  ctx.fillStyle = theme === 'ice' ? '#b9f2ff' : theme === 'ruin' ? '#53645a' : '#2b6f35';

  ctx.beginPath();
  ctx.moveTo(0, -170);
  ctx.lineTo(-48, -82);
  ctx.lineTo(48, -82);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, -135);
  ctx.lineTo(-42, -52);
  ctx.lineTo(42, -52);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, -102);
  ctx.lineTo(-34, -25);
  ctx.lineTo(34, -25);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawMagicTower(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#4c1d95';
  ctx.fillRect(-38, -170, 76, 170);

  ctx.fillStyle = '#a78bfa';
  ctx.fillRect(-30, -160, 60, 160);

  ctx.fillStyle = '#312e81';
  ctx.beginPath();
  ctx.moveTo(-52, -170);
  ctx.lineTo(0, -240);
  ctx.lineTo(52, -170);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(-14, -122, 28, 42);

  ctx.shadowColor = '#93c5fd';
  ctx.shadowBlur = 20;
  ctx.fillStyle = '#93c5fd';
  circle(ctx, 0, -210, 10);
  ctx.shadowBlur = 0;

  ctx.restore();
}

function drawCastleWall(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#495057';
  ctx.fillRect(-80, -130, 160, 130);

  ctx.fillStyle = '#868e96';

  for (let bx = -70; bx < 80; bx += 32) {
    for (let by = -120; by < -10; by += 26) {
      ctx.fillRect(bx, by, 24, 16);
    }
  }

  ctx.fillStyle = '#343a40';
  ctx.fillRect(-90, -158, 180, 28);

  for (let bx = -78; bx <= 78; bx += 36) {
    ctx.fillRect(bx, -190, 24, 38);
  }

  ctx.restore();
}

function drawPortHouse(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#7c3f25';
  ctx.fillRect(-75, -100, 150, 100);

  ctx.fillStyle = '#c08457';
  ctx.fillRect(-65, -92, 130, 92);

  ctx.fillStyle = '#1e6091';
  ctx.beginPath();
  ctx.moveTo(-90, -100);
  ctx.lineTo(0, -155);
  ctx.lineTo(90, -100);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(-42, -70, 32, 28);
  ctx.fillRect(16, -70, 32, 28);

  ctx.restore();
}

function drawMineEntrance(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#3f3f46';
  ctx.beginPath();
  ctx.moveTo(-90, 0);
  ctx.lineTo(-50, -120);
  ctx.lineTo(45, -150);
  ctx.lineTo(100, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.ellipse(0, -35, 42, 60, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(-85, -15, 170, 15);

  ctx.restore();
}

function drawIceHouse(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#dff8ff';
  ctx.fillRect(-70, -90, 140, 90);

  ctx.fillStyle = '#93c5fd';
  ctx.beginPath();
  ctx.moveTo(-85, -90);
  ctx.lineTo(0, -145);
  ctx.lineTo(85, -90);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 5;
  ctx.strokeRect(-70, -90, 140, 90);

  ctx.restore();
}

function drawDesertHouse(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#c08457';
  roundRect(ctx, -75, -100, 150, 100, 8);

  ctx.fillStyle = '#f2cc8f';
  ctx.fillRect(-62, -88, 124, 88);

  ctx.fillStyle = '#7f5539';
  ctx.beginPath();
  ctx.ellipse(0, -88, 82, 38, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#3a2618';
  ctx.fillRect(-14, -48, 28, 48);

  ctx.restore();
}

function drawRuin(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#495057';
  ctx.fillRect(-18, -92, 22, 92);
  ctx.fillRect(54, -112, 22, 112);

  ctx.fillStyle = '#868e96';

  for (let i = 0; i < 6; i++) {
    ctx.fillRect(-22, -92 + i * 15, 30, 8);
    ctx.fillRect(50, -112 + i * 15, 30, 8);
  }

  ctx.fillStyle = '#6c757d';
  ctx.fillRect(-30, -112, 120, 18);

  ctx.restore();
}

function drawBrokenArch(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#6b7280';
  ctx.fillRect(-65, -120, 24, 120);
  ctx.fillRect(45, -120, 24, 120);
  ctx.fillRect(-65, -140, 134, 24);

  ctx.fillStyle = '#374151';
  ctx.fillRect(-42, -116, 87, 18);

  ctx.restore();
}

function drawCrystal(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.shadowColor = '#74c0fc';
  ctx.shadowBlur = 14;

  ctx.fillStyle = '#74c0fc';
  ctx.beginPath();
  ctx.moveTo(0, -62);
  ctx.lineTo(24, -20);
  ctx.lineTo(0, 8);
  ctx.lineTo(-24, -20);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawMineRock(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#5b6470';
  ctx.beginPath();
  ctx.moveTo(-50, 0);
  ctx.lineTo(-20, -60);
  ctx.lineTo(30, -80);
  ctx.lineTo(70, -15);
  ctx.lineTo(40, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#adb5bd';
  ctx.fillRect(-8, -45, 16, 10);

  ctx.restore();
}

function drawIcePillar(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#9ee8ff';
  ctx.beginPath();
  ctx.moveTo(-25, 0);
  ctx.lineTo(-12, -100);
  ctx.lineTo(8, -130);
  ctx.lineTo(25, 0);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#ffffff66';
  ctx.fillRect(-4, -110, 6, 90);

  ctx.restore();
}

function drawCactus(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#4f8f46';
  roundRect(ctx, -12, -92, 24, 92, 10);
  roundRect(ctx, -42, -62, 20, 45, 9);
  roundRect(ctx, 24, -78, 20, 50, 9);

  ctx.restore();
}

/* =========================================================
   Helpers
========================================================= */

function getGroundColor(theme) {
  if (theme === 'ice') return '#b9f2ff';
  if (theme === 'desert') return '#d9b15f';
  if (theme === 'ruin') return '#777f8f';
  if (theme === 'mine') return '#8b8f94';
  return '#91d65e';
}

function getDirtColor(theme) {
  if (theme === 'ice') return '#8eb8ce';
  if (theme === 'desert') return '#c18843';
  if (theme === 'ruin') return '#535765';
  if (theme === 'mine') return '#555b60';
  return '#8d6740';
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
  c.fill();
}

function circle(c, x, y, r) {
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function hit(px, py, x, y, w, h) {
  return px >= x && px <= x + w && py >= y && py <= y + h;
}

function rgbToHex(value) {
  if (!value) return '#ffffff';
  if (value.startsWith('#')) return value;

  const nums = value.match(/\d+/g);

  if (!nums || nums.length < 3) return '#ffffff';

  return '#' + nums
    .slice(0, 3)
    .map(function (n) {
      return Number(n).toString(16).padStart(2, '0');
    })
    .join('');
}

function hexToRgb(hex) {
  const clean = String(hex || '#ffffff').replace('#', '').padEnd(6, '0');

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function lighten(hex, amount) {
  const c = hexToRgb(hex);

  return `rgb(${clamp(c.r + amount, 0, 255)}, ${clamp(c.g + amount, 0, 255)}, ${clamp(c.b + amount, 0, 255)})`;
}

function darken(hex, amount) {
  const c = hexToRgb(hex);

  return `rgb(${clamp(c.r - amount, 0, 255)}, ${clamp(c.g - amount, 0, 255)}, ${clamp(c.b - amount, 0, 255)})`;
}


/* =========================================================
   Stable SD Character + 40 Hair / 40 Face Visibility Patch
   - 안전한 안정 버전 위에 캐릭터/외형 선택만 다시 적용
   - 머리카락이 눈을 가리지 않도록 얼굴을 항상 마지막에 그림
   - 캐릭터 생성 화면에 머리 40종 / 표정 40종 버튼을 실제로 생성
   - 게임 배경이 안 보이던 대규모 패치 부분은 제거하고 안정 렌더링 유지
========================================================= */

const SD_HAIR_STYLES_40 = [
  'basic','short','spiky','pony','wave','bob','mushroom','soft_bang','side_part','curly',
  'twin_tail','long_tail','wild','flat','helmet_cut','leaf_pin','mage_long','warrior_spike','archer_feather','rogue_shadow',
  'prince','princess','round_bob','messy','samurai','braid','cat_ear','horn','cloud','flame',
  'ice','star','noble','bandana','cap','hood','half_up','drill','mini_tail','wind'
];

const SD_FACE_STYLES_40 = [
  'normal','bright','cute','sleepy','serious','smile','angry','surprise','wink','sad',
  'determined','shy','blank','sparkle','cat','dot','wide','calm','smirk','cry',
  'battle','hero','mage','rogue','archer','tired','confused','laugh','closed','focus',
  'glow','round','tiny','sharp','soft','nervous','proud','panic','evil','angel'
];

const SD_HAIR_LABELS = [
  '기본','짧은','삐죽','포니','웨이브','단발','버섯','앞머리','가르마','곱슬',
  '트윈','긴꼬리','와일드','납작','헬멧컷','잎핀','마법사','전사','깃털','그림자',
  '왕자','공주','둥근단발','헝클','사무라이','땋은','고양이','뿔','구름','불꽃',
  '얼음','별','귀족','반다나','모자','후드','반묶음','드릴','미니꼬리','바람'
];

const SD_FACE_LABELS = [
  '보통','밝음','귀염','졸림','진지','미소','화남','놀람','윙크','슬픔',
  '결의','수줍','무표정','반짝','고양','점눈','큰눈','차분','씨익','눈물',
  '전투','영웅','마법','도적','궁수','피곤','혼란','웃음','감은','집중',
  '빛남','동글','작은눈','날카','순함','긴장','당당','패닉','악동','천사'
];

function populateSdCharacterChoices() {
  const hairBox = document.getElementById('hairStyleChoices');
  const faceBox = document.getElementById('faceStyleChoices');

  function prepareBox(box) {
    if (!box) return;
    box.style.display = 'grid';
    box.style.gridTemplateColumns = 'repeat(5, minmax(0, 1fr))';
    box.style.gap = '6px';
    box.style.maxHeight = '190px';
    box.style.overflowY = 'auto';
    box.style.paddingRight = '4px';
  }

  function makeButton(value, label, active) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice' + (active ? ' active' : '');
    btn.dataset.value = value;
    btn.textContent = label;
    btn.style.minHeight = '28px';
    btn.style.fontSize = '11px';
    btn.style.borderRadius = '8px';
    btn.style.border = active ? '2px solid #ffe066' : '1px solid rgba(255,255,255,0.25)';
    btn.style.background = active ? 'rgba(255,224,102,0.20)' : 'rgba(15,23,42,0.42)';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    return btn;
  }

  if (hairBox && !hairBox.dataset.sdExpanded) {
    hairBox.dataset.sdExpanded = '1';
    hairBox.innerHTML = '';
    prepareBox(hairBox);
    SD_HAIR_STYLES_40.forEach(function (id, i) {
      hairBox.appendChild(makeButton(id, SD_HAIR_LABELS[i] || id, selected.hairStyle === id));
    });
  }

  if (faceBox && !faceBox.dataset.sdExpanded) {
    faceBox.dataset.sdExpanded = '1';
    faceBox.innerHTML = '';
    prepareBox(faceBox);
    SD_FACE_STYLES_40.forEach(function (id, i) {
      faceBox.appendChild(makeButton(id, SD_FACE_LABELS[i] || id, selected.faceStyle === id));
    });
  }
}


function bindUI() {
  populateSdCharacterChoices();

  const tabLogin = el('tabLogin');
  const tabRegister = el('tabRegister');
  const authBtn = el('authBtn');
  const startNewBtn = el('startNewBtn');
  const continueBtn = el('continueBtn');
  const logoutBtn = el('logoutBtn');
  const logoutBtn2 = el('logoutBtn2');

  [tabLogin, tabRegister, authBtn, startNewBtn, continueBtn, logoutBtn, logoutBtn2].forEach(function (node) {
    if (node && node.tagName === 'BUTTON') node.type = 'button';
    if (node) node.style.pointerEvents = 'auto';
  });

  if (tabLogin) {
    tabLogin.onclick = function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setMode('login');
    };
  }

  if (tabRegister) {
    tabRegister.onclick = function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      setMode('register');
    };
  }

  if (authBtn) {
    authBtn.onclick = function (e) {
      submitAuth(e);
    };
  }

  if (startNewBtn) {
    startNewBtn.onclick = function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      createCharacterAndStart();
    };
  }

  if (continueBtn) {
    continueBtn.onclick = function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      startGame(currentUser ? currentUser.save : {});
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = function (e) {
      if (e) e.preventDefault();
      logout();
    };
  }

  if (logoutBtn2) {
    logoutBtn2.onclick = function (e) {
      if (e) e.preventDefault();
      logout();
    };
  }

  document.querySelectorAll('.swatches').forEach(function (group) {
    const target = group.dataset.target;

    group.querySelectorAll('span').forEach(function (span) {
      span.onclick = function () {
        if (!target) return;

        selected[target] = rgbToHex(getComputedStyle(span).backgroundColor);

        group.querySelectorAll('span').forEach(function (s) {
          s.classList.remove('selected');
        });

        span.classList.add('selected');
      };
    });
  });

  document.querySelectorAll('#hairStyleChoices .choice').forEach(function (btn) {
    btn.onclick = function () {
      selected.hairStyle = btn.dataset.value || 'soft_bang';
      setChoiceActive('#hairStyleChoices', selected.hairStyle);
    };
  });

  document.querySelectorAll('#faceStyleChoices .choice').forEach(function (btn) {
    btn.onclick = function () {
      selected.faceStyle = btn.dataset.value || 'bright';
      setChoiceActive('#faceStyleChoices', selected.faceStyle);
    };
  });
}

function setChoiceActive(containerSelector, value) {
  document.querySelectorAll(containerSelector + ' .choice').forEach(function (btn) {
    const on = btn.dataset.value === value;
    btn.classList.toggle('active', on);
    btn.style.border = on ? '2px solid #ffe066' : '1px solid rgba(255,255,255,0.25)';
    btn.style.background = on ? 'rgba(255,224,102,0.20)' : 'rgba(15,23,42,0.42)';
  });
}

// 기존 bindUI가 버튼 이벤트를 묶은 뒤에도, 동적으로 만든 40종 버튼이 확실히 작동하게 보강
window.addEventListener('click', function (e) {
  const hairBtn = e.target && e.target.closest ? e.target.closest('#hairStyleChoices .choice') : null;
  const faceBtn = e.target && e.target.closest ? e.target.closest('#faceStyleChoices .choice') : null;

  if (hairBtn) {
    selected.hairStyle = hairBtn.dataset.value || 'basic';
    setChoiceActive('#hairStyleChoices', selected.hairStyle);
  }

  if (faceBtn) {
    selected.faceStyle = faceBtn.dataset.value || 'normal';
    setChoiceActive('#faceStyleChoices', selected.faceStyle);
  }
});

function ensureSdCharacterStyle(ch) {
  if (!ch) return;
  if (!SD_HAIR_STYLES_40.includes(ch.hairStyle)) ch.hairStyle = 'soft_bang';
  if (!SD_FACE_STYLES_40.includes(ch.faceStyle)) ch.faceStyle = 'bright';
}

function drawPlayerBody(c, player) {
  const ch = player.character || game.player.character;
  ensureSdCharacterStyle(ch);

  const walk = Math.sin((player.animTime || 0) * 12);
  const moving = player.anim === 'walk';
  const attacking = player.anim === 'attack';
  const jumping = player.anim === 'jump';
  const atk = attacking ? Math.sin(Math.min(1, (player.animTime || 0) * 10) * Math.PI) : 0;

  const skin = ch.skin || '#ffd7a8';
  const hair = ch.hair || '#2b160e';
  const outfit = getSdOutfit(ch);

  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';

  c.fillStyle = 'rgba(0,0,0,0.22)';
  c.beginPath();
  c.ellipse(0, 5, 25, 6, 0, 0, Math.PI * 2);
  c.fill();

  const leg = moving ? walk * 8 : 0;
  const arm = moving ? -walk * 8 : 0;

  // 몸통과 다리가 자연스럽게 붙은 SD 비율
  c.strokeStyle = '#2b2118';
  c.lineWidth = 9;
  c.beginPath(); c.moveTo(-9, -37); c.quadraticCurveTo(-15 - leg, -20, -18 - leg, -7); c.stroke();
  c.beginPath(); c.moveTo(9, -37); c.quadraticCurveTo(15 + leg, -20, 18 + leg, -7); c.stroke();

  c.strokeStyle = skin;
  c.lineWidth = 5;
  c.beginPath(); c.moveTo(-9, -37); c.quadraticCurveTo(-14 - leg, -20, -17 - leg, -8); c.stroke();
  c.beginPath(); c.moveTo(9, -37); c.quadraticCurveTo(14 + leg, -20, 17 + leg, -8); c.stroke();

  c.fillStyle = '#3f2d20';
  roundRect(c, -27 - leg, -9, 22, 8, 3);
  roundRect(c, 5 + leg, -9, 22, 8, 3);

  // 몸통
  c.fillStyle = '#111827';
  roundRect(c, -25, -78, 50, 48, 15);
  c.fillStyle = outfit.main;
  roundRect(c, -21, -75, 42, 42, 13);
  c.fillStyle = outfit.trim;
  roundRect(c, -16, -45, 32, 9, 4);
  c.fillStyle = '#f8fafc';
  c.fillRect(-11, -69, 22, 6);

  // 팔이 몸통에 붙어 보이도록 어깨부터 곡선
  let lx = -28 + arm;
  let ly = -57;
  let rx = 28 - arm + atk * 27;
  let ry = -57 + atk * 6;
  if (jumping) {
    lx = -30; ly = -66;
    rx = 30; ry = -66;
  }

  c.strokeStyle = '#111827';
  c.lineWidth = 11;
  c.beginPath(); c.moveTo(-20, -63); c.quadraticCurveTo(-28, -58, lx, ly); c.stroke();
  c.beginPath(); c.moveTo(20, -63); c.quadraticCurveTo(30, -58, rx, ry); c.stroke();

  c.strokeStyle = skin;
  c.lineWidth = 6;
  c.beginPath(); c.moveTo(-20, -63); c.quadraticCurveTo(-28, -58, lx, ly); c.stroke();
  c.beginPath(); c.moveTo(20, -63); c.quadraticCurveTo(30, -58, rx, ry); c.stroke();
  c.fillStyle = skin;
  circle(c, lx, ly, 4.5);
  circle(c, rx, ry, 4.5);

  const weaponObj = equipment.weapon;
  const weaponId = weaponObj && (weaponObj.id || weaponObj);
  drawWeapon(c, weaponId, rx, ry, attacking);

  // 목과 큰 머리
  c.fillStyle = '#111827';
  roundRect(c, -7, -86, 14, 11, 4);
  c.fillStyle = skin;
  roundRect(c, -5, -85, 10, 9, 4);

  c.fillStyle = '#111827';
  c.beginPath();
  c.ellipse(0, -113, 36, 39, 0, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = skin;
  c.beginPath();
  c.ellipse(0, -113, 33, 36, 0, 0, Math.PI * 2);
  c.fill();

  // 볼터치
  c.fillStyle = 'rgba(255,150,120,0.23)';
  c.beginPath(); c.ellipse(-18, -105, 8, 4, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(18, -105, 8, 4, 0, 0, Math.PI * 2); c.fill();

  // 머리카락은 위쪽/옆쪽만. 눈 위치를 침범하지 않도록 제한
  drawHair(c, { ...ch, hair }, -122);

  // 얼굴은 항상 머리카락 뒤가 아니라 마지막에 그려서 절대 눈이 가려지지 않게 함
  drawFace(c, ch, -112);

  const helmetObj = equipment.helmet;
  const helmetId = helmetObj && (helmetObj.id || helmetObj);
  if (helmetId && ITEMS[helmetId]) drawSdHelmet(c, ITEMS[helmetId]);

  c.restore();
}

function getSdOutfit(ch) {
  const job = JOBS[(ch && ch.job) || 'beginner'] || JOBS.beginner;
  const armorObj = equipment.armor;
  const armorId = armorObj && (armorObj.id || armorObj);
  const armor = ITEMS[armorId];
  if (armor && armor.color) {
    return { main: armor.color, trim: darken(armor.color, 40) };
  }
  const base = job.color || '#4f93f5';
  return { main: base, trim: darken(base, 45) };
}

function drawSdHelmet(c, item) {
  c.save();
  c.fillStyle = '#111827';
  c.beginPath(); c.ellipse(0, -138, 33, 15, 0, Math.PI, 0); c.fill();
  c.fillStyle = item.color || '#94a3b8';
  c.beginPath(); c.ellipse(0, -137, 30, 13, 0, Math.PI, 0); c.fill();
  c.fillStyle = 'rgba(255,255,255,0.35)';
  c.fillRect(-12, -145, 14, 3);
  c.restore();
}

function drawHair(c, ch, headY) {
  const hair = ch.hair || '#2b160e';
  const style = ch.hairStyle || 'soft_bang';
  const idx = Math.max(0, SD_HAIR_STYLES_40.indexOf(style));
  const mode = idx % 10;
  const deco = Math.floor(idx / 10);

  c.save();
  c.fillStyle = '#111827';
  c.beginPath();
  c.ellipse(0, headY - 9, 34, 19, 0, Math.PI, 0);
  c.fill();

  c.fillStyle = hair;
  c.beginPath();
  c.ellipse(0, headY - 10, 31, 17, 0, Math.PI, 0);
  c.fill();

  // 각 모드는 눈 높이보다 위에서 끝나도록 y를 제한한다.
  if (mode === 0) {
    for (let i = -23; i <= 17; i += 10) {
      c.beginPath();
      c.moveTo(i, headY - 5);
      c.quadraticCurveTo(i + 7, headY + 4, i + 3, headY + 10);
      c.quadraticCurveTo(i - 4, headY + 2, i, headY - 5);
      c.fill();
    }
  } else if (mode === 1) {
    roundRect(c, -28, headY - 18, 56, 22, 12);
    c.fillRect(-24, headY - 3, 48, 8);
  } else if (mode === 2) {
    for (let i = -28; i <= 21; i += 7) {
      c.beginPath();
      c.moveTo(i, headY - 4);
      c.lineTo(i + 5, headY - 24 - ((i + 28) % 3) * 3);
      c.lineTo(i + 11, headY - 4);
      c.closePath();
      c.fill();
    }
  } else if (mode === 3) {
    roundRect(c, -28, headY - 19, 50, 22, 12);
    c.beginPath(); c.ellipse(31, headY + 2, 10, 20, -0.25, 0, Math.PI * 2); c.fill();
  } else if (mode === 4) {
    for (let i = -27; i <= 21; i += 12) {
      c.beginPath(); c.ellipse(i, headY + 0, 10, 13, -0.2, 0, Math.PI * 2); c.fill();
    }
  } else if (mode === 5) {
    roundRect(c, -30, headY - 18, 60, 28, 15);
    c.fillStyle = ch.skin || '#ffd7a8';
    c.fillRect(-25, headY + 5, 50, 10);
    c.fillStyle = hair;
  } else if (mode === 6) {
    c.beginPath(); c.ellipse(-32, headY + 2, 10, 20, 0.25, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(32, headY + 2, 10, 20, -0.25, 0, Math.PI * 2); c.fill();
  } else if (mode === 7) {
    c.beginPath(); c.moveTo(-25, headY - 8); c.lineTo(-36, headY - 25); c.lineTo(-14, headY - 15); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(25, headY - 8); c.lineTo(36, headY - 25); c.lineTo(14, headY - 15); c.closePath(); c.fill();
  } else if (mode === 8) {
    c.fillStyle = '#ef4444';
    roundRect(c, -31, headY - 16, 62, 7, 3);
    c.fillStyle = hair;
  } else {
    c.beginPath(); c.ellipse(0, headY - 23, 18, 8, 0, 0, Math.PI * 2); c.fill();
  }

  // 10종 기본형에 장식 4단계 조합 = 40종
  if (deco === 1) {
    c.fillStyle = '#facc15'; circle(c, 24, headY - 9, 4);
  } else if (deco === 2) {
    c.fillStyle = '#93c5fd';
    c.beginPath(); c.moveTo(-25, headY - 7); c.lineTo(-34, headY - 15); c.lineTo(-22, headY - 18); c.closePath(); c.fill();
  } else if (deco === 3) {
    c.strokeStyle = '#f8fafc'; c.lineWidth = 2;
    c.beginPath(); c.arc(0, headY - 9, 37, Math.PI * 0.12, Math.PI * 0.88); c.stroke();
  }

  c.fillStyle = 'rgba(255,255,255,0.20)';
  c.fillRect(-13, headY - 24, 13, 3);
  c.restore();
}

function drawFace(c, ch, headY) {
  const style = ch.faceStyle || 'bright';
  const idx = Math.max(0, SD_FACE_STYLES_40.indexOf(style));
  const eyeMode = idx % 8;
  const mouth = Math.floor(idx / 8) % 5;

  c.save();
  c.fillStyle = '#111827';

  if (eyeMode === 0) {
    c.fillRect(-11, headY - 8, 4, 6); c.fillRect(7, headY - 8, 4, 6);
  } else if (eyeMode === 1) {
    circle(c, -10, headY - 7, 3.5); circle(c, 10, headY - 7, 3.5);
    c.fillStyle = '#fff'; circle(c, -11, headY - 8, 1); circle(c, 9, headY - 8, 1); c.fillStyle = '#111827';
  } else if (eyeMode === 2) {
    c.strokeStyle = '#111827'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-13, headY - 7); c.lineTo(-6, headY - 4); c.moveTo(6, headY - 4); c.lineTo(13, headY - 7); c.stroke();
  } else if (eyeMode === 3) {
    c.strokeStyle = '#111827'; c.lineWidth = 2;
    c.beginPath(); c.moveTo(-13, headY - 7); c.lineTo(-6, headY - 7); c.moveTo(6, headY - 7); c.lineTo(13, headY - 7); c.stroke();
  } else if (eyeMode === 4) {
    c.fillRect(-13, headY - 9, 6, 3); c.fillRect(7, headY - 9, 6, 3);
  } else if (eyeMode === 5) {
    c.fillRect(-11, headY - 8, 3, 4); c.fillRect(8, headY - 8, 3, 4);
  } else if (eyeMode === 6) {
    c.fillRect(-15, headY - 8, 5, 7); c.fillRect(10, headY - 8, 5, 7);
  } else {
    c.fillRect(-10, headY - 8, 2, 2); c.fillRect(8, headY - 8, 2, 2);
  }

  c.strokeStyle = '#111827';
  c.lineWidth = 2;
  if (mouth === 0) {
    c.beginPath(); c.arc(0, headY + 4, 5, 0, Math.PI); c.stroke();
  } else if (mouth === 1) {
    c.fillRect(-4, headY + 5, 8, 2);
  } else if (mouth === 2) {
    c.beginPath(); c.arc(0, headY + 8, 5, Math.PI, Math.PI * 2); c.stroke();
  } else if (mouth === 3) {
    c.beginPath(); c.ellipse(0, headY + 5, 3, 5, 0, 0, Math.PI * 2); c.fill();
  } else {
    c.beginPath(); c.moveTo(-4, headY + 4); c.quadraticCurveTo(0, headY + 8, 5, headY + 3); c.stroke();
  }

  c.restore();
}

// NPC도 같은 SD 비율을 쓰되, 역할별 옷/소품만 다르게 표시
function getNpcRoleStyle(type) {
  const map = {
    taxi: { main: '#facc15', trim: '#1f2937', hair: '#334155', prop: 'taxi' },
    merchant: { main: '#fb923c', trim: '#7c2d12', hair: '#78350f', prop: 'bag' },
    weapon: { main: '#94a3b8', trim: '#475569', hair: '#111827', prop: 'sword' },
    blacksmith: { main: '#78716c', trim: '#f97316', hair: '#292524', prop: 'hammer' },
    quest: { main: '#84cc16', trim: '#365314', hair: '#eab308', prop: 'scroll' },
    job: { main: '#a78bfa', trim: '#4c1d95', hair: '#f8fafc', prop: 'staff' },
    job_office: { main: '#38bdf8', trim: '#075985', hair: '#0f172a', prop: 'book' }
  };
  return map[type] || { main: '#60a5fa', trim: '#1e3a8a', hair: '#334155', prop: 'none' };
}

function drawNPCs() {
  game.npcs.forEach(function (npc) {
    drawSdNpc(npc, npc.x, npc.y);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, npc.x, npc.y - 76);

    if (Math.abs(game.player.x - npc.x) < 90) {
      ctx.fillStyle = '#ffe066';
      ctx.fillText('E 대화', npc.x, npc.y - 96);
    }
  });
}

function drawSdNpc(npc, x, y) {
  const st = getNpcRoleStyle(npc.type);
  const fake = {
    ...game.player,
    character: {
      name: npc.name,
      job: 'beginner',
      skin: '#ffd7a8',
      hair: st.hair,
      hairStyle: npc.type === 'job' ? 'mage_long' : npc.type === 'blacksmith' ? 'bandana' : 'soft_bang',
      faceStyle: npc.type === 'blacksmith' ? 'serious' : 'smile'
    },
    anim: 'idle',
    animTime: performance.now() / 1000,
    face: 1
  };

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.82, 0.82);
  drawNpcBodyWithStyle(ctx, fake, st);
  drawNpcProp(ctx, st.prop);
  ctx.restore();
}

function drawNpcBodyWithStyle(c, fake, st) {
  const originalGetSdOutfit = getSdOutfit;
  const oldJob = fake.character.job;
  fake.character.job = 'beginner';
  c.save();
  const savedEquipmentArmor = equipment.armor;
  // NPC 옷 색은 직접 칠하기 위해 몸통만 간단 복제해서 그림
  drawPlayerBody(c, fake);
  c.restore();
  equipment.armor = savedEquipmentArmor;

  // 역할별 색 덧입히기
  c.save();
  c.globalAlpha = 0.95;
  c.fillStyle = st.main;
  roundRect(c, -17, -72, 34, 34, 10);
  c.fillStyle = st.trim;
  roundRect(c, -13, -46, 26, 7, 3);
  c.restore();
  fake.character.job = oldJob;
}

function drawNpcProp(c, prop) {
  c.save();
  c.lineWidth = 4;
  c.lineCap = 'round';

  if (prop === 'hammer') {
    c.strokeStyle = '#5b3420'; c.beginPath(); c.moveTo(28, -42); c.lineTo(48, -62); c.stroke();
    c.fillStyle = '#9ca3af'; roundRect(c, 38, -72, 26, 14, 3);
  } else if (prop === 'bag') {
    c.fillStyle = '#92400e'; roundRect(c, 27, -46, 22, 28, 6); c.fillStyle = '#fbbf24'; c.fillRect(34, -39, 8, 5);
  } else if (prop === 'sword') {
    c.strokeStyle = '#e5e7eb'; c.beginPath(); c.moveTo(28, -30); c.lineTo(53, -70); c.stroke();
  } else if (prop === 'staff') {
    c.strokeStyle = '#c4b5fd'; c.beginPath(); c.moveTo(32, -24); c.lineTo(50, -82); c.stroke(); c.fillStyle = '#93c5fd'; circle(c, 52, -86, 7);
  } else if (prop === 'book') {
    c.fillStyle = '#1d4ed8'; roundRect(c, 26, -60, 25, 18, 3); c.fillStyle = '#f8fafc'; c.fillRect(37, -58, 2, 14);
  } else if (prop === 'taxi') {
    c.fillStyle = '#fde047'; roundRect(c, -20, -126, 40, 14, 5); c.fillStyle = '#111827'; c.font = 'bold 9px sans-serif'; c.textAlign = 'center'; c.fillText('TAXI', 0, -116);
  } else if (prop === 'scroll') {
    c.fillStyle = '#fef3c7'; roundRect(c, 28, -58, 20, 28, 4);
    c.strokeStyle = '#92400e'; c.lineWidth = 1; c.beginPath(); c.moveTo(32, -50); c.lineTo(44, -50); c.moveTo(32, -44); c.lineTo(43, -44); c.stroke();
  }

  c.restore();
}

// 혹시 이전 대규모 패치에서 꼬인 저장값이 들어와도 게임 시작 시 안정화
const __sdFixedStartGame = startGame;
function startGame(save) {
  if (save && save.player && save.player.character) ensureSdCharacterStyle(save.player.character);
  __sdFixedStartGame(save);
  ensureSdCharacterStyle(game.player.character);
  game.ready = true;
}


/* =========================================================
   FINAL CHIBI CHARACTER PATCH
   - reference-like SD body: large soft head, tiny connected body
   - hair never covers eyes
   - 40 hair / 40 face buttons forced visible in creator
========================================================= */

function populateSdCharacterChoicesFinal() {
  const hairBox = document.getElementById('hairStyleChoices');
  const faceBox = document.getElementById('faceStyleChoices');

  function styleBox(box) {
    if (!box) return;
    box.style.display = 'grid';
    box.style.gridTemplateColumns = 'repeat(5, minmax(58px, 1fr))';
    box.style.gap = '6px';
    box.style.maxHeight = '250px';
    box.style.overflowY = 'auto';
    box.style.padding = '6px';
    box.style.borderRadius = '10px';
    box.style.background = 'rgba(15,23,42,0.30)';
  }

  function makeChoiceButton(value, label, active) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'choice' + (active ? ' active' : '');
    btn.dataset.value = value;
    btn.textContent = label;
    btn.style.minHeight = '30px';
    btn.style.padding = '4px 5px';
    btn.style.fontSize = '11px';
    btn.style.fontWeight = '700';
    btn.style.borderRadius = '8px';
    btn.style.border = active ? '2px solid #ffe066' : '1px solid rgba(255,255,255,0.28)';
    btn.style.background = active ? 'rgba(255,224,102,0.24)' : 'rgba(30,41,59,0.86)';
    btn.style.color = '#fff';
    btn.style.cursor = 'pointer';
    return btn;
  }

  if (hairBox) {
    styleBox(hairBox);
    if (hairBox.children.length !== 40 || hairBox.dataset.finalChibiChoices !== '1') {
      hairBox.innerHTML = '';
      SD_HAIR_STYLES_40.forEach(function (id, i) {
        hairBox.appendChild(makeChoiceButton(id, SD_HAIR_LABELS[i] || ('머리' + (i + 1)), selected.hairStyle === id));
      });
      hairBox.dataset.finalChibiChoices = '1';
    }
  }

  if (faceBox) {
    styleBox(faceBox);
    if (faceBox.children.length !== 40 || faceBox.dataset.finalChibiChoices !== '1') {
      faceBox.innerHTML = '';
      SD_FACE_STYLES_40.forEach(function (id, i) {
        faceBox.appendChild(makeChoiceButton(id, SD_FACE_LABELS[i] || ('표정' + (i + 1)), selected.faceStyle === id));
      });
      faceBox.dataset.finalChibiChoices = '1';
    }
  }
}

const __finalChibiShowCreator = showCreator;
function showCreator() {
  __finalChibiShowCreator();
  populateSdCharacterChoicesFinal();
  setChoiceActive('#hairStyleChoices', selected.hairStyle || 'basic');
  setChoiceActive('#faceStyleChoices', selected.faceStyle || 'normal');
}

const __finalChibiBindUI = bindUI;
function bindUI() {
  __finalChibiBindUI();
  populateSdCharacterChoicesFinal();

  document.querySelectorAll('#hairStyleChoices .choice').forEach(function (btn) {
    btn.onclick = function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      selected.hairStyle = btn.dataset.value || 'basic';
      setChoiceActive('#hairStyleChoices', selected.hairStyle);
    };
  });

  document.querySelectorAll('#faceStyleChoices .choice').forEach(function (btn) {
    btn.onclick = function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      selected.faceStyle = btn.dataset.value || 'normal';
      setChoiceActive('#faceStyleChoices', selected.faceStyle);
    };
  });
}

function drawPlayerBody(c, player) {
  const ch = player.character || game.player.character || selected;
  ensureSdCharacterStyle(ch);

  const animTime = player.animTime || 0;
  const walk = Math.sin(animTime * 12);
  const moving = player.anim === 'walk';
  const attacking = player.anim === 'attack';
  const jumping = player.anim === 'jump';
  const hurt = player.hurtTime && player.hurtTime > 0;
  const attackSwing = attacking ? Math.sin(Math.min(1, animTime * 11) * Math.PI) : 0;

  const skin = ch.skin || '#ffd8a8';
  const skinShadow = '#f1b983';
  const hair = ch.hair || '#2b160e';
  const outfit = getSdOutfit(ch);
  const legMove = moving ? walk * 6 : 0;
  const armMove = moving ? -walk * 5 : 0;

  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';
  if (hurt) c.globalAlpha = 0.72;

  // soft ground shadow
  c.fillStyle = 'rgba(0,0,0,0.22)';
  c.beginPath();
  c.ellipse(0, 4, 21, 5, 0, 0, Math.PI * 2);
  c.fill();

  // tiny chibi legs, attached closely to the body
  c.strokeStyle = '#241a13';
  c.lineWidth = 7;
  c.beginPath();
  c.moveTo(-8, -34);
  c.quadraticCurveTo(-10 - legMove, -21, -16 - legMove, -8);
  c.stroke();
  c.beginPath();
  c.moveTo(8, -34);
  c.quadraticCurveTo(10 + legMove, -21, 16 + legMove, -8);
  c.stroke();

  c.strokeStyle = skin;
  c.lineWidth = 4.5;
  c.beginPath();
  c.moveTo(-8, -34);
  c.quadraticCurveTo(-10 - legMove, -21, -15 - legMove, -8);
  c.stroke();
  c.beginPath();
  c.moveTo(8, -34);
  c.quadraticCurveTo(10 + legMove, -21, 15 + legMove, -8);
  c.stroke();

  c.fillStyle = '#3a2a1d';
  roundRect(c, -25 - legMove, -9, 20, 7, 3);
  roundRect(c, 5 + legMove, -9, 20, 7, 3);

  // compact rounded body like the reference, not a long rectangle
  c.fillStyle = '#101827';
  roundRect(c, -21, -69, 42, 39, 14);
  c.fillStyle = outfit.main || '#4f93f5';
  roundRect(c, -18, -66, 36, 34, 12);
  c.fillStyle = 'rgba(255,255,255,0.88)';
  roundRect(c, -10, -61, 20, 6, 3);
  c.fillStyle = outfit.trim || '#2f6fbd';
  roundRect(c, -13, -41, 26, 7, 4);

  // arms are curved and attached to the body; no detached puppet look
  let leftHandX = -25 + armMove;
  let leftHandY = -49;
  let rightHandX = 25 - armMove + attackSwing * 24;
  let rightHandY = -49 + attackSwing * 7;

  if (jumping) {
    leftHandX = -27;
    leftHandY = -58;
    rightHandX = 27;
    rightHandY = -58;
  }

  c.strokeStyle = '#101827';
  c.lineWidth = 9;
  c.beginPath();
  c.moveTo(-17, -59);
  c.quadraticCurveTo(-25, -55, leftHandX, leftHandY);
  c.stroke();
  c.beginPath();
  c.moveTo(17, -59);
  c.quadraticCurveTo(25, -55, rightHandX, rightHandY);
  c.stroke();

  c.strokeStyle = skin;
  c.lineWidth = 5.2;
  c.beginPath();
  c.moveTo(-17, -59);
  c.quadraticCurveTo(-24, -55, leftHandX, leftHandY);
  c.stroke();
  c.beginPath();
  c.moveTo(17, -59);
  c.quadraticCurveTo(24, -55, rightHandX, rightHandY);
  c.stroke();

  c.fillStyle = skin;
  circle(c, leftHandX, leftHandY, 4.2);
  circle(c, rightHandX, rightHandY, 4.2);

  const weaponObj = equipment.weapon;
  const weaponId = weaponObj && (weaponObj.id || weaponObj);
  drawWeapon(c, weaponId, rightHandX, rightHandY, attacking);

  // short neck
  c.fillStyle = '#101827';
  roundRect(c, -6, -76, 12, 10, 4);
  c.fillStyle = skinShadow;
  roundRect(c, -4, -75, 8, 8, 4);
  c.fillStyle = skin;
  roundRect(c, -4, -77, 8, 7, 4);

  // reference-like big soft head: slightly wider than body, not a strange circle
  c.fillStyle = '#101827';
  c.beginPath();
  c.ellipse(0, -103, 33, 35, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = skin;
  c.beginPath();
  c.ellipse(0, -103, 30, 32, 0, 0, Math.PI * 2);
  c.fill();

  // subtle cheek/face shading like the reference image
  c.fillStyle = 'rgba(233,150,95,0.14)';
  c.beginPath();
  c.ellipse(0, -92, 21, 8, 0, 0, Math.PI * 2);
  c.fill();
  c.fillStyle = 'rgba(255,145,110,0.22)';
  c.beginPath(); c.ellipse(-15, -98, 6, 3.3, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(15, -98, 6, 3.3, 0, 0, Math.PI * 2); c.fill();

  // hair first, but only on top/sides; then face last so eyes are never hidden
  drawHair(c, { ...ch, hair }, -119);
  drawFace(c, ch, -101);

  const helmetObj = equipment.helmet;
  const helmetId = helmetObj && (helmetObj.id || helmetObj);
  if (helmetId && ITEMS[helmetId]) drawSdHelmet(c, ITEMS[helmetId]);

  c.restore();
}

function drawHair(c, ch, headY) {
  const hair = ch.hair || '#2b160e';
  const style = ch.hairStyle || 'basic';
  const idx = Math.max(0, SD_HAIR_STYLES_40.indexOf(style));
  const mode = idx % 10;
  const deco = Math.floor(idx / 10);

  c.save();

  // black outline top cap
  c.fillStyle = '#101827';
  c.beginPath();
  c.ellipse(0, headY + 3, 32, 18, 0, Math.PI, 0);
  c.fill();

  c.fillStyle = hair;
  c.beginPath();
  c.ellipse(0, headY + 3, 29, 15.5, 0, Math.PI, 0);
  c.fill();

  // Side hair only. Bangs stop well above the eyes.
  if (mode === 0) {
    c.fillRect(-22, headY - 1, 44, 7);
  } else if (mode === 1) {
    roundRect(c, -27, headY - 2, 54, 12, 7);
  } else if (mode === 2) {
    for (let i = -24; i <= 18; i += 7) {
      c.beginPath();
      c.moveTo(i, headY + 3);
      c.lineTo(i + 5, headY - 12 - ((i + 24) % 3) * 2);
      c.lineTo(i + 10, headY + 3);
      c.closePath();
      c.fill();
    }
  } else if (mode === 3) {
    roundRect(c, -24, headY - 1, 45, 11, 6);
    c.beginPath(); c.ellipse(27, headY + 10, 8, 16, -0.35, 0, Math.PI * 2); c.fill();
  } else if (mode === 4) {
    for (let i = -24; i <= 18; i += 12) {
      c.beginPath(); c.ellipse(i, headY + 6, 8, 10, -0.15, 0, Math.PI * 2); c.fill();
    }
  } else if (mode === 5) {
    roundRect(c, -28, headY - 1, 56, 15, 9);
    c.fillStyle = ch.skin || '#ffd8a8';
    c.fillRect(-23, headY + 9, 46, 7);
    c.fillStyle = hair;
  } else if (mode === 6) {
    c.beginPath(); c.ellipse(-29, headY + 8, 8, 15, 0.28, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(29, headY + 8, 8, 15, -0.28, 0, Math.PI * 2); c.fill();
  } else if (mode === 7) {
    c.beginPath(); c.moveTo(-22, headY + 1); c.lineTo(-32, headY - 12); c.lineTo(-13, headY - 5); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(22, headY + 1); c.lineTo(32, headY - 12); c.lineTo(13, headY - 5); c.closePath(); c.fill();
  } else if (mode === 8) {
    roundRect(c, -30, headY - 2, 60, 10, 5);
    c.fillStyle = '#ef4444';
    roundRect(c, -29, headY + 1, 58, 4, 2);
    c.fillStyle = hair;
  } else {
    c.beginPath(); c.ellipse(0, headY - 8, 17, 7, 0, 0, Math.PI * 2); c.fill();
  }

  // Four decoration groups create 40 visually distinct styles without covering eyes.
  if (deco === 1) {
    c.fillStyle = '#facc15'; circle(c, 21, headY + 0, 4.5);
    c.fillStyle = '#fff7ad'; circle(c, 21, headY - 1, 2);
  } else if (deco === 2) {
    c.fillStyle = '#93c5fd';
    c.beginPath(); c.moveTo(-23, headY + 1); c.lineTo(-33, headY - 7); c.lineTo(-20, headY - 11); c.closePath(); c.fill();
  } else if (deco === 3) {
    c.strokeStyle = '#f8fafc'; c.lineWidth = 2;
    c.beginPath(); c.arc(0, headY + 1, 34, Math.PI * 0.10, Math.PI * 0.90); c.stroke();
  }

  c.fillStyle = 'rgba(255,255,255,0.20)';
  c.fillRect(-10, headY - 6, 12, 3);
  c.restore();
}

function drawFace(c, ch, headY) {
  const style = ch.faceStyle || 'normal';
  const idx = Math.max(0, SD_FACE_STYLES_40.indexOf(style));
  const eyeMode = idx % 8;
  const mouthMode = Math.floor(idx / 8) % 5;

  c.save();
  c.fillStyle = '#171717';
  c.strokeStyle = '#171717';
  c.lineWidth = 2;

  const ey = headY - 2;
  if (eyeMode === 0) {
    c.beginPath(); c.ellipse(-9, ey, 2.7, 6.2, -0.12, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(9, ey, 2.7, 6.2, 0.12, 0, Math.PI * 2); c.fill();
  } else if (eyeMode === 1) {
    circle(c, -9, ey, 3.3); circle(c, 9, ey, 3.3);
    c.fillStyle = '#fff'; circle(c, -10, ey - 1.3, 1); circle(c, 8, ey - 1.3, 1); c.fillStyle = '#171717';
  } else if (eyeMode === 2) {
    c.beginPath(); c.moveTo(-13, ey - 1); c.quadraticCurveTo(-9, ey + 3, -5, ey - 1); c.stroke();
    c.beginPath(); c.moveTo(5, ey - 1); c.quadraticCurveTo(9, ey + 3, 13, ey - 1); c.stroke();
  } else if (eyeMode === 3) {
    c.beginPath(); c.moveTo(-13, ey); c.lineTo(-5, ey); c.moveTo(5, ey); c.lineTo(13, ey); c.stroke();
  } else if (eyeMode === 4) {
    c.fillRect(-13, ey - 2, 7, 3); c.fillRect(6, ey - 2, 7, 3);
  } else if (eyeMode === 5) {
    c.fillRect(-10, ey - 2, 3, 5); c.fillRect(7, ey - 2, 3, 5);
  } else if (eyeMode === 6) {
    c.beginPath(); c.ellipse(-11, ey, 3.5, 6, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(11, ey, 3.5, 6, 0, 0, Math.PI * 2); c.fill();
  } else {
    c.fillRect(-10, ey, 2.5, 2.5); c.fillRect(8, ey, 2.5, 2.5);
  }

  const my = headY + 10;
  if (mouthMode === 0) {
    c.beginPath(); c.arc(0, my - 2, 5, 0, Math.PI); c.stroke();
  } else if (mouthMode === 1) {
    c.fillRect(-4, my, 8, 2);
  } else if (mouthMode === 2) {
    c.beginPath(); c.arc(0, my + 4, 5, Math.PI, Math.PI * 2); c.stroke();
  } else if (mouthMode === 3) {
    c.beginPath(); c.ellipse(0, my, 3, 4, 0, 0, Math.PI * 2); c.fill();
  } else {
    c.beginPath(); c.moveTo(-5, my - 1); c.quadraticCurveTo(0, my + 5, 6, my - 2); c.stroke();
  }

  c.restore();
}





/* =========================================================
   FINAL START BUTTON / GAME LAUNCH STABILITY PATCH
   - Fixes character start button not launching the game
   - Avoids recursive wrapper issues from previous patches
   - Starts the game even if server returns a slightly different save shape
========================================================= */

function hideAllPanelsStable() {
  [auth, characterScreen, characterMenu, help].forEach(function (node) {
    if (!node) return;
    node.classList.add('hidden');
    node.style.pointerEvents = 'none';
  });
}

function showAuth() {
  game.ready = false;
  hideAllPanelsStable();
  if (auth) {
    auth.classList.remove('hidden');
    auth.style.pointerEvents = 'auto';
  }
}

function showCreator() {
  game.ready = false;
  hideAllPanelsStable();
  if (characterScreen) {
    characterScreen.classList.remove('hidden');
    characterScreen.style.pointerEvents = 'auto';
  }
  if (typeof populateSdCharacterChoicesFinal === 'function') populateSdCharacterChoicesFinal();
  if (typeof setChoiceActive === 'function') {
    setChoiceActive('#hairStyleChoices', selected.hairStyle || 'basic');
    setChoiceActive('#faceStyleChoices', selected.faceStyle || 'normal');
  }
}

function showCharacterMenu(user) {
  game.ready = false;
  hideAllPanelsStable();
  if (characterMenu) {
    characterMenu.classList.remove('hidden');
    characterMenu.style.pointerEvents = 'auto';
  }

  const menuName = el('menuName');
  const p = user && user.save && user.save.player ? user.save.player : null;
  if (menuName && p && p.character) {
    menuName.textContent = `${p.character.name} Lv.${p.level || 1}`;
  }
}

function normalizeStartSave(save) {
  if (!save || typeof save !== 'object') return {};
  if (save.save && typeof save.save === 'object') return save.save;
  return save;
}

function startGame(save) {
  const safeSave = normalizeStartSave(save);

  hideAllPanelsStable();
  if (help) {
    help.classList.remove('hidden');
    help.style.pointerEvents = 'none';
  }

  hydrateSave(safeSave);

  if (!game.townId) game.townId = 'lumina';
  const town = getTown(game.townId || 'lumina');
  loadTown(town.id);

  game.player.x = Number.isFinite(game.player.x) ? game.player.x : 260;
  game.player.y = game.ground;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.grounded = true;
  game.cameraX = clamp(game.player.x - W * 0.42, 0, Math.max(0, game.width - W));

  if (game.player.character) ensureSdCharacterStyle(game.player.character);
  recalcStats();
  refreshUnlockedSkills();

  game.ready = true;
  game.last = performance.now();
}

async function createCharacterAndStart(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }

  const createMsg = el('createMsg');

  try {
    if (createMsg) createMsg.textContent = '';

    const nameInput = el('charName');
    const nickname = nameInput && nameInput.value.trim()
      ? nameInput.value.trim()
      : '초보자';

    const character = {
      name: nickname,
      job: 'beginner',
      skin: selected.skin || '#ffd6a6',
      hair: selected.hair || '#2b160e',
      hairStyle: selected.hairStyle || 'basic',
      faceStyle: selected.faceStyle || 'normal'
    };

    ensureSdCharacterStyle(character);

    let save = null;

    try {
      const data = await api('/api/create-character', { character });
      currentUser = data.user || currentUser || { hasCharacter: true };
      if (currentUser) currentUser.hasCharacter = true;
      save = data.save || (data.user && data.user.save) || null;
    } catch (apiErr) {
      // If the server refuses because a character already exists, still try to continue with known profile data.
      if (createMsg) createMsg.textContent = '서버 저장은 실패했지만 임시로 게임을 시작합니다. 게임 안에서 S키로 다시 저장해보세요.';
      currentUser = currentUser || { hasCharacter: true, save: null };
    }

    if (!save) {
      save = currentUser && currentUser.save ? currentUser.save : {
        player: {
          ...createPlayer(),
          character
        },
        townId: 'lumina',
        huntId: 'lumina_field'
      };
    }

    if (!save.player) save.player = createPlayer();
    save.player.character = {
      ...createPlayer().character,
      ...(save.player.character || {}),
      ...character
    };

    if (currentUser) currentUser.save = save;
    startGame(save);
  } catch (err) {
    if (createMsg) createMsg.textContent = err.message || '캐릭터 생성 중 오류가 발생했습니다.';
    console.error(err);
  }
}

function bindUI() {
  if (typeof populateSdCharacterChoicesFinal === 'function') populateSdCharacterChoicesFinal();

  const tabLogin = el('tabLogin');
  const tabRegister = el('tabRegister');
  const authBtn = el('authBtn');
  const startNewBtn = el('startNewBtn');
  const continueBtn = el('continueBtn');
  const logoutBtn = el('logoutBtn');
  const logoutBtn2 = el('logoutBtn2');

  [tabLogin, tabRegister, authBtn, startNewBtn, continueBtn, logoutBtn, logoutBtn2].forEach(function (node) {
    if (!node) return;
    if (node.tagName === 'BUTTON') node.type = 'button';
    node.style.pointerEvents = 'auto';
  });

  if (tabLogin) {
    tabLogin.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      setMode('login');
    };
  }

  if (tabRegister) {
    tabRegister.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      setMode('register');
    };
  }

  if (authBtn) {
    authBtn.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      submitAuth(e);
    };
  }

  if (startNewBtn) {
    startNewBtn.onclick = createCharacterAndStart;
  }

  if (continueBtn) {
    continueBtn.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      const save = currentUser && currentUser.save ? currentUser.save : {};
      startGame(save);
    };
  }

  if (logoutBtn) {
    logoutBtn.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      logout();
    };
  }

  if (logoutBtn2) {
    logoutBtn2.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      logout();
    };
  }

  document.querySelectorAll('.swatches').forEach(function (group) {
    const target = group.dataset.target;
    group.querySelectorAll('span').forEach(function (span) {
      span.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!target) return;
        selected[target] = rgbToHex(getComputedStyle(span).backgroundColor);
        group.querySelectorAll('span').forEach(function (s) { s.classList.remove('selected'); });
        span.classList.add('selected');
      };
    });
  });

  document.querySelectorAll('#hairStyleChoices .choice').forEach(function (btn) {
    btn.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      selected.hairStyle = btn.dataset.value || 'basic';
      if (typeof setChoiceActive === 'function') setChoiceActive('#hairStyleChoices', selected.hairStyle);
    };
  });

  document.querySelectorAll('#faceStyleChoices .choice').forEach(function (btn) {
    btn.onclick = function (e) {
      if (e) { e.preventDefault(); e.stopPropagation(); }
      selected.faceStyle = btn.dataset.value || 'normal';
      if (typeof setChoiceActive === 'function') setChoiceActive('#faceStyleChoices', selected.faceStyle);
    };
  });
}


/* =========================================================
   Loop
========================================================= */

function loop(now) {
  const dt = Math.min(0.033, (now - game.last) / 1000);
  game.last = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

boot();
requestAnimationFrame(loop);


/* =========================================================
   NPC LABEL / CHIBI VISUAL REFINEMENT PATCH
   - Moves NPC names above faces
   - Removes floating halo-like decoration
   - Makes characters cuter and closer to the provided SD reference
   - Prevents NPCs from inheriting the player's equipped helmet/weapon visuals
========================================================= */

function __getDrawEquipment(player) {
  return (player && player.__drawEquipment) || equipment || {};
}

function __getOutfitForDraw(ch, drawEq) {
  if (ch && ch.__outfit) {
    return {
      main: ch.__outfit.main || '#6aa8ff',
      trim: ch.__outfit.trim || '#336bc4'
    };
  }

  const armorObj = drawEq && drawEq.armor;
  const armorId = armorObj && (armorObj.id || armorObj);
  const armor = armorId && ITEMS[armorId] ? ITEMS[armorId] : null;
  if (armor && armor.color) {
    return { main: armor.color, trim: darken(armor.color, 40) };
  }

  const job = (JOBS && JOBS[ch.job]) ? JOBS[ch.job] : null;
  const base = (job && job.color) || '#5b93ff';
  return { main: base, trim: darken(base, 42) };
}

function drawPlayerBody(c, player) {
  const ch = (player && player.character) || (game.player && game.player.character) || selected;
  ensureSdCharacterStyle(ch);

  const drawEq = __getDrawEquipment(player);
  const outfit = __getOutfitForDraw(ch, drawEq);
  const animTime = player.animTime || 0;
  const walk = Math.sin(animTime * 11);
  const moving = player.anim === 'walk';
  const attacking = player.anim === 'attack';
  const jumping = player.anim === 'jump';
  const hurt = player.hurtTime && player.hurtTime > 0;
  const attackSwing = attacking ? Math.sin(Math.min(1, animTime * 11) * Math.PI) : 0;

  const skin = ch.skin || '#ffd8a8';
  const skinShadow = '#f0ba88';
  const hair = ch.hair || '#2b160e';
  const legMove = moving ? walk * 5 : 0;
  const armMove = moving ? -walk * 4 : 0;

  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';
  if (hurt) c.globalAlpha = 0.74;

  // ground shadow
  c.fillStyle = 'rgba(0,0,0,0.18)';
  c.beginPath();
  c.ellipse(0, 2, 20, 4.6, 0, 0, Math.PI * 2);
  c.fill();

  // legs - shorter and cleaner, closer to the reference
  c.strokeStyle = '#2a1d16';
  c.lineWidth = 6.2;
  c.beginPath();
  c.moveTo(-6, -32);
  c.quadraticCurveTo(-8 - legMove * 0.4, -20, -12 - legMove, -8);
  c.stroke();
  c.beginPath();
  c.moveTo(6, -32);
  c.quadraticCurveTo(8 + legMove * 0.4, -20, 12 + legMove, -8);
  c.stroke();

  c.strokeStyle = skin;
  c.lineWidth = 3.8;
  c.beginPath();
  c.moveTo(-6, -32);
  c.quadraticCurveTo(-8 - legMove * 0.3, -20, -12 - legMove * 0.8, -8);
  c.stroke();
  c.beginPath();
  c.moveTo(6, -32);
  c.quadraticCurveTo(8 + legMove * 0.3, -20, 12 + legMove * 0.8, -8);
  c.stroke();

  c.fillStyle = '#5b3b1e';
  roundRect(c, -17 - legMove * 0.5, -9, 15, 6, 3);
  roundRect(c, 2 + legMove * 0.5, -9, 15, 6, 3);

  // torso
  c.fillStyle = '#13233e';
  roundRect(c, -19, -66, 38, 36, 13);
  c.fillStyle = outfit.main || '#6aa8ff';
  roundRect(c, -16, -63, 32, 31, 11);
  c.fillStyle = 'rgba(255,255,255,0.92)';
  roundRect(c, -9, -58, 18, 5.5, 3);
  c.fillStyle = outfit.trim || '#3f72c9';
  roundRect(c, -12, -40, 24, 6.5, 4);
  c.fillStyle = 'rgba(255,255,255,0.14)';
  roundRect(c, -12, -61, 8, 14, 5);

  // arms
  let leftHandX = -22 + armMove;
  let leftHandY = -47;
  let rightHandX = 22 - armMove + attackSwing * 21;
  let rightHandY = -47 + attackSwing * 6;

  if (jumping) {
    leftHandX = -24; leftHandY = -56;
    rightHandX = 24; rightHandY = -56;
  }

  c.strokeStyle = '#13233e';
  c.lineWidth = 7.8;
  c.beginPath();
  c.moveTo(-15, -56);
  c.quadraticCurveTo(-22, -53, leftHandX, leftHandY);
  c.stroke();
  c.beginPath();
  c.moveTo(15, -56);
  c.quadraticCurveTo(22, -53, rightHandX, rightHandY);
  c.stroke();

  c.strokeStyle = skin;
  c.lineWidth = 4.6;
  c.beginPath();
  c.moveTo(-15, -56);
  c.quadraticCurveTo(-21, -53, leftHandX, leftHandY);
  c.stroke();
  c.beginPath();
  c.moveTo(15, -56);
  c.quadraticCurveTo(21, -53, rightHandX, rightHandY);
  c.stroke();

  c.fillStyle = skin;
  circle(c, leftHandX, leftHandY, 3.8);
  circle(c, rightHandX, rightHandY, 3.8);

  const weaponObj = drawEq.weapon;
  const weaponId = weaponObj && (weaponObj.id || weaponObj);
  drawWeapon(c, weaponId, rightHandX, rightHandY, attacking);

  // neck
  c.fillStyle = '#13233e';
  roundRect(c, -5, -72, 10, 8, 4);
  c.fillStyle = skinShadow;
  roundRect(c, -3.5, -71, 7, 7, 3);
  c.fillStyle = skin;
  roundRect(c, -3.5, -73, 7, 5.5, 3);

  // head and ears
  c.fillStyle = '#13233e';
  c.beginPath(); c.ellipse(0, -98, 29, 30.5, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(-22.5, -98, 4, 5.5, -0.2, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(22.5, -98, 4, 5.5, 0.2, 0, Math.PI * 2); c.fill();

  c.fillStyle = skin;
  c.beginPath(); c.ellipse(0, -98, 26, 28.5, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(-22, -98, 3.2, 4.5, -0.2, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(22, -98, 3.2, 4.5, 0.2, 0, Math.PI * 2); c.fill();

  // cheek tint
  c.fillStyle = 'rgba(255,154,118,0.22)';
  c.beginPath(); c.ellipse(-12.5, -93, 5.2, 3.0, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(12.5, -93, 5.2, 3.0, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(120,64,32,0.10)';
  c.beginPath(); c.ellipse(0, -86, 18, 6, 0, 0, Math.PI * 2); c.fill();

  drawHair(c, { ...ch, hair }, -114);
  drawFace(c, ch, -100);

  const helmetObj = drawEq.helmet;
  const helmetId = helmetObj && (helmetObj.id || helmetObj);
  if (helmetId && ITEMS[helmetId]) drawSdHelmet(c, ITEMS[helmetId]);

  c.restore();
}

function drawHair(c, ch, headY) {
  const hair = ch.hair || '#2b160e';
  const skin = ch.skin || '#ffd8a8';
  const style = ch.hairStyle || 'basic';
  const idx = Math.max(0, SD_HAIR_STYLES_40.indexOf(style));
  const mode = idx % 10;
  const deco = Math.floor(idx / 10);

  c.save();
  c.fillStyle = '#13233e';
  c.beginPath(); c.ellipse(0, headY + 4, 28, 16.5, 0, Math.PI, 0); c.fill();
  c.fillStyle = hair;
  c.beginPath(); c.ellipse(0, headY + 4, 25.5, 14.5, 0, Math.PI, 0); c.fill();

  // All bangs stay above the eyes.
  if (mode === 0) {
    roundRect(c, -20, headY + 1, 40, 6.5, 3);
  } else if (mode === 1) {
    roundRect(c, -23, headY - 1, 46, 10, 6);
  } else if (mode === 2) {
    for (let i = -19; i <= 15; i += 8) {
      c.beginPath();
      c.moveTo(i, headY + 5);
      c.lineTo(i + 4, headY - 8 - ((i + 19) % 3));
      c.lineTo(i + 8, headY + 5);
      c.closePath();
      c.fill();
    }
  } else if (mode === 3) {
    roundRect(c, -19, headY + 1, 38, 7.5, 4);
    c.beginPath(); c.ellipse(23, headY + 11, 7, 14, -0.3, 0, Math.PI * 2); c.fill();
  } else if (mode === 4) {
    for (let i = -16; i <= 16; i += 10) {
      c.beginPath(); c.ellipse(i, headY + 7, 6, 8.5, -0.1, 0, Math.PI * 2); c.fill();
    }
  } else if (mode === 5) {
    roundRect(c, -24, headY, 48, 12, 8);
    c.fillStyle = skin; c.fillRect(-19, headY + 8, 38, 5);
    c.fillStyle = hair;
  } else if (mode === 6) {
    c.beginPath(); c.ellipse(-25, headY + 10, 7, 13, 0.28, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(25, headY + 10, 7, 13, -0.28, 0, Math.PI * 2); c.fill();
  } else if (mode === 7) {
    c.beginPath(); c.moveTo(-18, headY + 2); c.lineTo(-28, headY - 8); c.lineTo(-12, headY - 3); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(18, headY + 2); c.lineTo(28, headY - 8); c.lineTo(12, headY - 3); c.closePath(); c.fill();
  } else if (mode === 8) {
    roundRect(c, -24, headY, 48, 8, 4);
    c.fillStyle = '#d9465f'; roundRect(c, -23, headY + 2.5, 46, 3.2, 2); c.fillStyle = hair;
  } else {
    c.beginPath(); c.ellipse(0, headY - 7, 14, 6, 0, 0, Math.PI * 2); c.fill();
  }

  // 4 decoration groups -> 40 visible variations, but no floating ring.
  if (deco === 1) {
    c.fillStyle = '#facc15'; circle(c, 19, headY + 2, 4);
    c.fillStyle = '#fff7c2'; circle(c, 19, headY + 1, 1.8);
  } else if (deco === 2) {
    c.fillStyle = '#93c5fd';
    c.beginPath(); c.moveTo(-20, headY + 2); c.lineTo(-28, headY - 5); c.lineTo(-17, headY - 9); c.closePath(); c.fill();
  } else if (deco === 3) {
    // Replaced the old halo-like arc with a small headband/ribbon near the hair.
    c.fillStyle = '#f8fafc'; roundRect(c, -14, headY - 2.5, 28, 3, 1.5);
    c.fillStyle = '#fda4af'; circle(c, -4, headY - 1, 1.8); circle(c, 4, headY - 1, 1.8);
  }

  c.fillStyle = 'rgba(255,255,255,0.18)';
  roundRect(c, -8, headY - 5, 10, 2.5, 1.2);
  c.restore();
}

function drawFace(c, ch, headY) {
  const style = ch.faceStyle || 'normal';
  const idx = Math.max(0, SD_FACE_STYLES_40.indexOf(style));
  const eyeMode = idx % 8;
  const mouthMode = Math.floor(idx / 8) % 5;

  c.save();
  c.fillStyle = '#191919';
  c.strokeStyle = '#191919';
  c.lineWidth = 1.8;

  const ey = headY - 1;
  if (eyeMode === 0) {
    c.beginPath(); c.ellipse(-8, ey, 2.3, 4.6, -0.1, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(8, ey, 2.3, 4.6, 0.1, 0, Math.PI * 2); c.fill();
  } else if (eyeMode === 1) {
    circle(c, -8, ey, 2.8); circle(c, 8, ey, 2.8);
    c.fillStyle = '#fff'; circle(c, -8.8, ey - 1, 0.8); circle(c, 7.2, ey - 1, 0.8); c.fillStyle = '#191919';
  } else if (eyeMode === 2) {
    c.beginPath(); c.moveTo(-12, ey); c.quadraticCurveTo(-8, ey + 3, -4.5, ey); c.stroke();
    c.beginPath(); c.moveTo(4.5, ey); c.quadraticCurveTo(8, ey + 3, 12, ey); c.stroke();
  } else if (eyeMode === 3) {
    c.beginPath(); c.moveTo(-11, ey); c.lineTo(-5, ey); c.moveTo(5, ey); c.lineTo(11, ey); c.stroke();
  } else if (eyeMode === 4) {
    c.fillRect(-11, ey - 1.5, 6, 2.4); c.fillRect(5, ey - 1.5, 6, 2.4);
  } else if (eyeMode === 5) {
    c.fillRect(-8.5, ey - 2, 2.4, 4.2); c.fillRect(6.1, ey - 2, 2.4, 4.2);
  } else if (eyeMode === 6) {
    c.beginPath(); c.ellipse(-9, ey, 3, 5.2, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.ellipse(9, ey, 3, 5.2, 0, 0, Math.PI * 2); c.fill();
  } else {
    c.fillRect(-8.5, ey, 2, 2); c.fillRect(6.5, ey, 2, 2);
  }

  // tiny nose
  c.fillStyle = 'rgba(70,40,24,0.35)';
  c.beginPath(); c.ellipse(0, headY + 2.5, 1.2, 0.9, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#191919';

  const my = headY + 10.5;
  if (mouthMode === 0) {
    c.beginPath(); c.arc(0, my - 1.5, 4.3, 0, Math.PI); c.stroke();
  } else if (mouthMode === 1) {
    c.fillRect(-3.4, my, 6.8, 1.8);
  } else if (mouthMode === 2) {
    c.beginPath(); c.arc(0, my + 2.5, 4.2, Math.PI, Math.PI * 2); c.stroke();
  } else if (mouthMode === 3) {
    c.beginPath(); c.ellipse(0, my, 2.4, 3.1, 0, 0, Math.PI * 2); c.fill();
  } else {
    c.beginPath(); c.moveTo(-4.2, my - 1); c.quadraticCurveTo(0, my + 3.8, 4.6, my - 1); c.stroke();
  }

  c.restore();
}

function drawNPCs() {
  game.npcs.forEach(function (npc) {
    drawSdNpc(npc, npc.x, npc.y);

    const near = Math.abs(game.player.x - npc.x) < 90;
    const labelY = npc.y - 125;
    const name = npc.name || '';
    const bubbleW = Math.max(68, Math.min(120, name.length * 12 + 18));

    ctx.fillStyle = 'rgba(15,23,42,0.88)';
    roundRect(ctx, npc.x - bubbleW / 2, labelY - 15, bubbleW, 22, 10);
    ctx.strokeStyle = 'rgba(255,255,255,0.16)';
    ctx.lineWidth = 1;
    ctx.strokeRect(npc.x - bubbleW / 2 + 2, labelY - 13, bubbleW - 4, 18);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(name, npc.x, labelY);

    if (near) {
      ctx.fillStyle = '#ffe066';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('E 대화', npc.x, labelY - 22);
    }
  });
}

function drawSdNpc(npc, x, y) {
  const st = getNpcRoleStyle(npc.type);
  const fake = {
    ...game.player,
    character: {
      name: npc.name,
      job: 'beginner',
      skin: '#ffd7a8',
      hair: st.hair,
      hairStyle: npc.type === 'job' ? 'mage_long' : npc.type === 'blacksmith' ? 'bandana' : (npc.type === 'quest' ? 'round_bob' : 'soft_bang'),
      faceStyle: npc.type === 'blacksmith' ? 'serious' : (npc.type === 'merchant' ? 'bright' : 'smile'),
      __outfit: { main: st.main, trim: st.trim }
    },
    __drawEquipment: { weapon: null, helmet: null, armor: null, knee: null, accessory: null },
    anim: 'idle',
    animTime: performance.now() / 1000,
    face: 1
  };

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(0.80, 0.80);
  drawPlayerBody(ctx, fake);
  drawNpcProp(ctx, st.prop);
  ctx.restore();
}
