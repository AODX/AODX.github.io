'use strict';

/* V17 strict-mode global binding declarations for legacy patch assignments */
var acceptOrCompleteQuest, calcDamage, damageMonster, drawDialog, drawEquipmentBox, drawItemBox, drawItemIcon, drawMonster, drawMonsterShape, drawMonsters, drawShopPanel, drawTownObjects, drawWorld, enhanceEquippedItem, getMonsterRareEquipmentDrop, getRareDropRate, getShopItems, handleShopClick, handleTaxiClick, killMonster, loadHunt, loadTown, makeMonsterType, spawnMonsters, syncQuestItems, updateEnemyProjectiles, updateKillQuests, updateMonsters;


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


/* =========================================================
   HAIR STYLE / FACE / FOOT REFINEMENT PATCH
   - removes overly dark cheek ellipses
   - makes each hair style visually more distinct
   - turns feet outward for a more natural stance
========================================================= */

function __hairFillTop(c, color) {
  c.fillStyle = '#13233e';
  c.beginPath(); c.ellipse(0, -110, 29, 18, 0, Math.PI, 0); c.fill();
  c.fillStyle = color;
  c.beginPath(); c.ellipse(0, -110, 26, 16, 0, Math.PI, 0); c.fill();
}

function __hairFrontBand(c, x, y, w, h, r) {
  roundRect(c, x, y, w, h, r || 4);
}

function __hairSpikeRow(c, startX, y, count, size, gap) {
  const g = gap || size;
  for (let i = 0; i < count; i++) {
    const x = startX + i * g;
    c.beginPath();
    c.moveTo(x, y + size * 0.9);
    c.lineTo(x + size * 0.5, y - size * 0.5 - (i % 2) * 2);
    c.lineTo(x + size, y + size * 0.9);
    c.closePath();
    c.fill();
  }
}

function __hairSideLock(c, x, y, rx, ry, rot) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
  c.fill();
}

function __drawHairStyleByName(c, style, hair, skin, headY) {
  c.fillStyle = hair;

  switch (style) {
    case 'basic':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 1, 36, 7, 3);
      break;
    case 'short':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -15, headY + 1, 30, 6, 3);
      break;
    case 'spiky':
      __hairFillTop(c, hair);
      __hairSpikeRow(c, -22, headY - 2, 6, 7, 7);
      break;
    case 'pony':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 1, 36, 6.5, 3);
      __hairSideLock(c, 22, headY + 11, 6, 15, -0.35);
      break;
    case 'wave':
      __hairFillTop(c, hair);
      for (let i = -18; i <= 14; i += 9) __hairSideLock(c, i, headY + 8, 6, 8, 0);
      break;
    case 'bob':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -20, headY + 1, 40, 8, 4);
      __hairSideLock(c, -20, headY + 12, 6, 13, 0.16);
      __hairSideLock(c, 20, headY + 12, 6, 13, -0.16);
      break;
    case 'mushroom':
      c.fillStyle = '#13233e';
      c.beginPath(); c.ellipse(0, headY + 1, 30, 19, 0, Math.PI, 0); c.fill();
      c.fillStyle = hair;
      c.beginPath(); c.ellipse(0, headY + 2, 27, 17, 0, Math.PI, 0); c.fill();
      __hairFrontBand(c, -22, headY + 4, 44, 10, 5);
      break;
    case 'soft_bang':
      __hairFillTop(c, hair);
      for (let i = -18; i <= 9; i += 9) {
        c.beginPath(); c.moveTo(i, headY + 6); c.lineTo(i + 4, headY - 2); c.lineTo(i + 9, headY + 6); c.closePath(); c.fill();
      }
      break;
    case 'side_part':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -19, headY + 1, 38, 7, 3);
      c.beginPath(); c.moveTo(5, headY + 7); c.lineTo(17, headY - 8); c.lineTo(19, headY + 7); c.closePath(); c.fill();
      break;
    case 'curly':
      __hairFillTop(c, hair);
      for (let i = -18; i <= 18; i += 9) __hairSideLock(c, i, headY + 8, 5, 7, 0);
      __hairSideLock(c, -20, headY + 12, 5, 10, 0.1);
      __hairSideLock(c, 20, headY + 12, 5, 10, -0.1);
      break;
    case 'twin_tail':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 1, 36, 7, 3);
      __hairSideLock(c, -24, headY + 14, 6, 16, 0.3);
      __hairSideLock(c, 24, headY + 14, 6, 16, -0.3);
      break;
    case 'long_tail':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 1, 36, 7, 3);
      c.beginPath(); c.moveTo(16, headY + 3); c.quadraticCurveTo(33, headY + 14, 22, headY + 28); c.lineTo(12, headY + 25); c.quadraticCurveTo(23, headY + 12, 10, headY + 4); c.closePath(); c.fill();
      break;
    case 'wild':
      c.fillStyle = '#13233e';
      c.beginPath(); c.ellipse(0, headY, 31, 19, 0, Math.PI, 0); c.fill();
      c.fillStyle = hair;
      __hairSpikeRow(c, -25, headY - 4, 7, 8, 7);
      __hairSideLock(c, -23, headY + 10, 7, 11, 0.2);
      __hairSideLock(c, 23, headY + 10, 7, 11, -0.2);
      break;
    case 'flat':
      c.fillStyle = '#13233e';
      __hairFrontBand(c, -25, headY - 3, 50, 10, 2);
      c.fillStyle = hair;
      __hairFrontBand(c, -23, headY - 1, 46, 8, 2);
      break;
    case 'helmet_cut':
      c.fillStyle = '#13233e';
      c.beginPath(); c.ellipse(0, headY + 3, 29, 17, 0, Math.PI, 0); c.fill();
      c.fillStyle = hair;
      c.beginPath(); c.ellipse(0, headY + 4, 26.5, 15, 0, Math.PI, 0); c.fill();
      __hairFrontBand(c, -21, headY + 3, 42, 8, 2);
      __hairSideLock(c, -20, headY + 13, 5, 10, 0);
      __hairSideLock(c, 20, headY + 13, 5, 10, 0);
      break;
    case 'leaf_pin':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 1, 36, 7, 3);
      c.fillStyle = '#6cc56f';
      c.beginPath(); c.moveTo(15, headY - 3); c.quadraticCurveTo(24, headY - 8, 24, headY + 1); c.quadraticCurveTo(18, headY + 1, 15, headY - 3); c.fill();
      break;
    case 'mage_long':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -17, headY + 1, 34, 7, 3);
      __hairSideLock(c, -22, headY + 16, 6, 18, 0.12);
      __hairSideLock(c, 22, headY + 16, 6, 18, -0.12);
      break;
    case 'warrior_spike':
      __hairFillTop(c, hair);
      __hairSpikeRow(c, -20, headY - 6, 5, 9, 8);
      __hairFrontBand(c, -18, headY + 1, 36, 6, 3);
      break;
    case 'archer_feather':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 1, 36, 7, 3);
      c.fillStyle = '#38bdf8';
      c.beginPath(); c.moveTo(-18, headY - 4); c.lineTo(-28, headY - 12); c.lineTo(-20, headY + 1); c.closePath(); c.fill();
      c.fillStyle = hair;
      break;
    case 'rogue_shadow':
      __hairFillTop(c, hair);
      c.beginPath(); c.moveTo(-18, headY + 4); c.lineTo(-3, headY - 4); c.lineTo(7, headY + 5); c.closePath(); c.fill();
      __hairFrontBand(c, -6, headY + 1, 24, 7, 3);
      __hairSideLock(c, -22, headY + 10, 6, 12, 0.26);
      break;
    case 'prince':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 2, 36, 6, 3);
      c.beginPath(); c.moveTo(0, headY + 4); c.lineTo(6, headY - 3); c.lineTo(10, headY + 4); c.closePath(); c.fill();
      break;
    case 'princess':
      __hairFillTop(c, hair);
      __hairSideLock(c, -22, headY + 15, 7, 18, 0.12);
      __hairSideLock(c, 22, headY + 15, 7, 18, -0.12);
      __hairFrontBand(c, -16, headY + 1, 32, 6.5, 3);
      break;
    case 'round_bob':
      c.fillStyle = '#13233e';
      c.beginPath(); c.ellipse(0, headY + 5, 28, 18, 0, Math.PI, 0); c.fill();
      c.fillStyle = hair;
      c.beginPath(); c.ellipse(0, headY + 6, 25, 16.5, 0, Math.PI, 0); c.fill();
      __hairSideLock(c, -19, headY + 13, 7, 11, 0);
      __hairSideLock(c, 19, headY + 13, 7, 11, 0);
      break;
    case 'messy':
      __hairFillTop(c, hair);
      __hairSpikeRow(c, -21, headY - 3, 6, 6.5, 6.5);
      __hairSideLock(c, -18, headY + 11, 5, 11, 0.28);
      __hairSideLock(c, 22, headY + 12, 6, 10, -0.3);
      break;
    case 'samurai':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 1, 36, 6, 3);
      c.beginPath(); c.ellipse(0, headY - 10, 7, 6, 0, 0, Math.PI * 2); c.fill();
      break;
    case 'braid':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 1, 36, 6.5, 3);
      c.beginPath(); c.moveTo(19, headY + 5); c.lineTo(25, headY + 10); c.lineTo(19, headY + 15); c.lineTo(25, headY + 20); c.lineTo(18, headY + 24); c.lineTo(10, headY + 20); c.lineTo(16, headY + 15); c.lineTo(10, headY + 10); c.closePath(); c.fill();
      break;
    case 'cat_ear':
      __hairFillTop(c, hair);
      c.beginPath(); c.moveTo(-15, headY - 2); c.lineTo(-23, headY - 12); c.lineTo(-7, headY - 6); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(15, headY - 2); c.lineTo(23, headY - 12); c.lineTo(7, headY - 6); c.closePath(); c.fill();
      __hairFrontBand(c, -16, headY + 1, 32, 6.5, 3);
      break;
    case 'horn':
      __hairFillTop(c, hair);
      c.fillStyle = '#d9c1a0';
      c.beginPath(); c.moveTo(-12, headY - 5); c.lineTo(-21, headY - 16); c.lineTo(-16, headY - 4); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(12, headY - 5); c.lineTo(21, headY - 16); c.lineTo(16, headY - 4); c.closePath(); c.fill();
      c.fillStyle = hair;
      __hairFrontBand(c, -16, headY + 1, 32, 6.5, 3);
      break;
    case 'cloud':
      c.fillStyle = '#13233e';
      c.beginPath(); c.ellipse(0, headY + 4, 29, 17, 0, Math.PI, 0); c.fill();
      c.fillStyle = hair;
      for (let i = -14; i <= 14; i += 10) circle(c, i, headY + 6, 8);
      break;
    case 'flame':
      __hairFillTop(c, hair);
      __hairSpikeRow(c, -20, headY - 7, 5, 10, 8);
      break;
    case 'ice':
      c.fillStyle = '#13233e';
      c.beginPath(); c.ellipse(0, headY + 2, 28, 16, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#c9efff';
      __hairSpikeRow(c, -19, headY - 5, 5, 8, 8);
      __hairFrontBand(c, -17, headY + 2, 34, 6, 3);
      break;
    case 'star':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 1, 36, 6.5, 3);
      c.fillStyle = '#facc15';
      c.beginPath(); c.moveTo(18, headY - 4); c.lineTo(20, headY + 0); c.lineTo(24, headY + 0); c.lineTo(21, headY + 3); c.lineTo(22, headY + 7); c.lineTo(18, headY + 5); c.lineTo(14, headY + 7); c.lineTo(15, headY + 3); c.lineTo(12, headY + 0); c.lineTo(16, headY + 0); c.closePath(); c.fill();
      break;
    case 'noble':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 2, 36, 6, 3);
      c.fillStyle = '#f2f2f2'; roundRect(c, -12, headY - 4, 24, 3, 2);
      c.fillStyle = hair;
      break;
    case 'bandana':
      __hairFillTop(c, hair);
      c.fillStyle = '#ef4444'; roundRect(c, -24, headY - 3, 48, 8, 3);
      c.fillStyle = hair; __hairFrontBand(c, -16, headY + 3, 32, 5, 2);
      break;
    case 'cap':
      c.fillStyle = '#13233e'; roundRect(c, -26, headY - 5, 52, 10, 5);
      c.fillStyle = hair; roundRect(c, -18, headY + 2, 36, 6, 3);
      c.fillStyle = '#d1d5db'; c.beginPath(); c.ellipse(0, headY - 1, 15, 3, 0, 0, Math.PI); c.fill();
      break;
    case 'hood':
      c.fillStyle = '#2c4f8d';
      c.beginPath(); c.ellipse(0, headY + 4, 30, 19, 0, Math.PI, 0); c.fill();
      c.fillStyle = hair; __hairFrontBand(c, -14, headY + 2, 28, 6, 3);
      break;
    case 'half_up':
      __hairFillTop(c, hair);
      c.beginPath(); c.ellipse(0, headY - 8, 7, 5, 0, 0, Math.PI * 2); c.fill();
      __hairSideLock(c, -21, headY + 14, 6, 14, 0.15);
      __hairSideLock(c, 21, headY + 14, 6, 14, -0.15);
      break;
    case 'drill':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 1, 36, 6.5, 3);
      for (const sx of [-23, 23]) {
        c.beginPath(); c.moveTo(sx, headY + 7); c.lineTo(sx + (sx < 0 ? -4 : 4), headY + 11); c.lineTo(sx + (sx < 0 ? 0 : 0), headY + 15); c.lineTo(sx + (sx < 0 ? -4 : 4), headY + 19); c.lineTo(sx + (sx < 0 ? 2 : -2), headY + 24); c.lineTo(sx - (sx < 0 ? 2 : -2), headY + 19); c.lineTo(sx + (sx < 0 ? 2 : -2), headY + 15); c.lineTo(sx - (sx < 0 ? 2 : -2), headY + 11); c.closePath(); c.fill();
      }
      break;
    case 'mini_tail':
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 1, 36, 6.5, 3);
      c.beginPath(); c.ellipse(17, headY - 4, 5, 4, 0, 0, Math.PI * 2); c.fill();
      c.beginPath(); c.moveTo(19, headY - 2); c.lineTo(25, headY + 7); c.lineTo(18, headY + 8); c.closePath(); c.fill();
      break;
    case 'wind':
      __hairFillTop(c, hair);
      c.beginPath(); c.moveTo(-18, headY + 5); c.quadraticCurveTo(3, headY - 9, 22, headY + 1); c.lineTo(18, headY + 9); c.quadraticCurveTo(-1, headY - 2, -18, headY + 7); c.closePath(); c.fill();
      __hairSideLock(c, 24, headY + 10, 6, 11, -0.35);
      break;
    default:
      __hairFillTop(c, hair);
      __hairFrontBand(c, -18, headY + 1, 36, 7, 3);
      break;
  }
}

function drawHair(c, ch, headY) {
  const hair = ch.hair || '#2b160e';
  const skin = ch.skin || '#ffd8a8';
  const style = ch.hairStyle || 'basic';
  c.save();
  __drawHairStyleByName(c, style, hair, skin, headY);
  c.fillStyle = 'rgba(255,255,255,0.12)';
  roundRect(c, -8, headY - 4, 9, 2.4, 1.2);
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

  // very subtle blush only, removing the previous dark cheek ellipses look
  c.fillStyle = 'rgba(255,185,190,0.18)';
  c.beginPath(); c.ellipse(-13, headY + 7, 4.2, 2.6, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(13, headY + 7, 4.2, 2.6, 0, 0, Math.PI * 2); c.fill();

  // tiny nose
  c.fillStyle = 'rgba(70,40,24,0.22)';
  c.beginPath(); c.ellipse(0, headY + 2.5, 1.0, 0.8, 0, 0, Math.PI * 2); c.fill();
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
  const legMove = moving ? walk * 5 : 0;
  const armMove = moving ? -walk * 4 : 0;

  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';
  if (hurt) c.globalAlpha = 0.74;

  c.fillStyle = 'rgba(0,0,0,0.18)';
  c.beginPath();
  c.ellipse(0, 2, 20, 4.6, 0, 0, Math.PI * 2);
  c.fill();

  // outward-leaning legs for a more natural stance
  c.strokeStyle = '#2a1d16';
  c.lineWidth = 6.2;
  c.beginPath();
  c.moveTo(-5, -32);
  c.quadraticCurveTo(-7 - legMove * 0.2, -20, -14 - legMove * 0.8, -8);
  c.stroke();
  c.beginPath();
  c.moveTo(5, -32);
  c.quadraticCurveTo(7 + legMove * 0.2, -20, 14 + legMove * 0.8, -8);
  c.stroke();

  c.strokeStyle = skin;
  c.lineWidth = 3.8;
  c.beginPath();
  c.moveTo(-5, -32);
  c.quadraticCurveTo(-7 - legMove * 0.2, -20, -14 - legMove * 0.8, -8);
  c.stroke();
  c.beginPath();
  c.moveTo(5, -32);
  c.quadraticCurveTo(7 + legMove * 0.2, -20, 14 + legMove * 0.8, -8);
  c.stroke();

  // shoes are now spread outward instead of turned inward
  c.fillStyle = '#5b3b1e';
  roundRect(c, -24 - legMove * 0.2, -9, 15, 6, 3);
  roundRect(c, 9 + legMove * 0.2, -9, 15, 6, 3);

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

  c.fillStyle = '#13233e';
  roundRect(c, -5, -72, 10, 8, 4);
  c.fillStyle = skinShadow;
  roundRect(c, -3.5, -71, 7, 7, 3);
  c.fillStyle = skin;
  roundRect(c, -3.5, -73, 7, 5.5, 3);

  c.fillStyle = '#13233e';
  c.beginPath(); c.ellipse(0, -98, 29, 30.5, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(-22.5, -98, 4, 5.5, -0.2, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(22.5, -98, 4, 5.5, 0.2, 0, Math.PI * 2); c.fill();

  c.fillStyle = skin;
  c.beginPath(); c.ellipse(0, -98, 26, 28.5, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(-22, -98, 3.2, 4.5, -0.2, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(22, -98, 3.2, 4.5, 0.2, 0, Math.PI * 2); c.fill();

  drawHair(c, ch, -114);
  drawFace(c, ch, -100);

  const helmetObj = drawEq.helmet;
  const helmetId = helmetObj && (helmetObj.id || helmetObj);
  if (helmetId && ITEMS[helmetId]) drawSdHelmet(c, ITEMS[helmetId]);

  c.restore();
}


/* =========================================================
   QUEST ORDER / HELMET REMOVE / EXTRA HAIR / SWORD + STRIKE PATCH
========================================================= */

// 1) 머리 위에 떠 보이던 회색 모자/고리 제거: 헬멧은 머리에 붙은 낮은 캡처럼만 표시
function drawSdHelmet(c, item) {
  if (!item) return;
  c.save();
  c.fillStyle = 'rgba(17,24,39,0.92)';
  c.beginPath();
  c.ellipse(0, -119, 26, 9, 0, Math.PI, 0);
  c.fill();
  c.fillStyle = item.color || '#64748b';
  c.beginPath();
  c.ellipse(0, -118, 23, 7, 0, Math.PI, 0);
  c.fill();
  c.fillStyle = 'rgba(255,255,255,0.22)';
  roundRect(c, -8, -124, 12, 2.5, 1);
  c.restore();
}

// 2) 기존 40종에 확실히 다른 실루엣의 머리 10종 추가
(function addTenDistinctHairStyles() {
  const extra = [
    ['wolf_cut', '울프컷'],
    ['seaweed_long', '해초장발'],
    ['royal_roll', '로열롤'],
    ['thunder_spike', '번개스파이크'],
    ['ribbon_twin', '리본트윈'],
    ['mask_bang', '가림앞머리'],
    ['crescent_tail', '초승달꼬리'],
    ['square_cut', '사각단발'],
    ['fluffy_afro', '폭신아프로'],
    ['dragon_mohawk', '용갈기']
  ];

  extra.forEach(function (pair) {
    if (!SD_HAIR_STYLES_40.includes(pair[0])) {
      SD_HAIR_STYLES_40.push(pair[0]);
      SD_HAIR_LABELS.push(pair[1]);
    }
  });

  const hairBox = document.getElementById('hairStyleChoices');
  if (hairBox) {
    delete hairBox.dataset.sdExpanded;
    hairBox.innerHTML = '';
  }
  if (typeof populateSdCharacterChoicesFinal === 'function') populateSdCharacterChoicesFinal();
})();

const __previousDrawHairStyleByName = typeof __drawHairStyleByName === 'function' ? __drawHairStyleByName : null;
function __drawHairStyleByName(c, style, hair, skin, headY) {
  c.fillStyle = hair;

  if (style === 'wolf_cut') {
    __hairFillTop(c, hair);
    __hairSpikeRow(c, -22, headY - 3, 6, 7, 7);
    __hairSideLock(c, -24, headY + 14, 6, 17, 0.45);
    __hairSideLock(c, 24, headY + 14, 6, 17, -0.45);
    return;
  }

  if (style === 'seaweed_long') {
    __hairFillTop(c, hair);
    __hairFrontBand(c, -18, headY + 1, 36, 7, 3);
    for (let i = -24; i <= 24; i += 12) {
      c.beginPath();
      c.moveTo(i, headY + 7);
      c.quadraticCurveTo(i + (i < 0 ? -8 : 8), headY + 20, i, headY + 34);
      c.quadraticCurveTo(i + (i < 0 ? 5 : -5), headY + 21, i - (i < 0 ? 3 : -3), headY + 9);
      c.closePath();
      c.fill();
    }
    return;
  }

  if (style === 'royal_roll') {
    __hairFillTop(c, hair);
    __hairFrontBand(c, -17, headY + 1, 34, 7, 3);
    __hairSideLock(c, -25, headY + 14, 8, 13, 0.15);
    __hairSideLock(c, 25, headY + 14, 8, 13, -0.15);
    c.fillStyle = 'rgba(255,255,255,0.18)';
    c.beginPath(); c.arc(-25, headY + 14, 5, 0, Math.PI * 1.6); c.stroke();
    c.beginPath(); c.arc(25, headY + 14, 5, Math.PI * 1.4, Math.PI * 3); c.stroke();
    return;
  }

  if (style === 'thunder_spike') {
    __hairFillTop(c, hair);
    c.beginPath(); c.moveTo(-20, headY + 6); c.lineTo(-8, headY - 13); c.lineTo(-2, headY + 3); c.lineTo(10, headY - 16); c.lineTo(22, headY + 6); c.closePath(); c.fill();
    c.fillStyle = '#fde047';
    c.beginPath(); c.moveTo(15, headY - 8); c.lineTo(22, headY - 1); c.lineTo(17, headY - 1); c.lineTo(23, headY + 8); c.lineTo(12, headY - 2); c.lineTo(18, headY - 2); c.closePath(); c.fill();
    return;
  }

  if (style === 'ribbon_twin') {
    __hairFillTop(c, hair);
    __hairFrontBand(c, -18, headY + 1, 36, 7, 3);
    __hairSideLock(c, -26, headY + 15, 7, 18, 0.3);
    __hairSideLock(c, 26, headY + 15, 7, 18, -0.3);
    c.fillStyle = '#f472b6';
    c.beginPath(); c.moveTo(-24, headY + 2); c.lineTo(-35, headY - 4); c.lineTo(-30, headY + 8); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(24, headY + 2); c.lineTo(35, headY - 4); c.lineTo(30, headY + 8); c.closePath(); c.fill();
    return;
  }

  if (style === 'mask_bang') {
    __hairFillTop(c, hair);
    c.beginPath(); c.moveTo(-22, headY + 4); c.lineTo(-4, headY - 7); c.lineTo(6, headY + 7); c.lineTo(22, headY + 3); c.lineTo(16, headY + 10); c.lineTo(-22, headY + 10); c.closePath(); c.fill();
    // 앞머리는 크게 다르지만 눈 위치 바로 위까지만 내려오게 제한
    c.fillStyle = skin;
    c.fillRect(-19, headY + 12, 38, 4);
    return;
  }

  if (style === 'crescent_tail') {
    __hairFillTop(c, hair);
    __hairFrontBand(c, -17, headY + 1, 34, 7, 3);
    c.beginPath();
    c.moveTo(18, headY + 3);
    c.quadraticCurveTo(43, headY + 10, 28, headY + 29);
    c.quadraticCurveTo(36, headY + 12, 15, headY + 10);
    c.closePath();
    c.fill();
    return;
  }

  if (style === 'square_cut') {
    c.fillStyle = '#13233e';
    roundRect(c, -27, headY - 4, 54, 24, 6);
    c.fillStyle = hair;
    roundRect(c, -24, headY - 2, 48, 21, 5);
    c.fillStyle = skin;
    c.fillRect(-19, headY + 9, 38, 8);
    c.fillStyle = hair;
    __hairFrontBand(c, -22, headY + 3, 44, 7, 2);
    return;
  }

  if (style === 'fluffy_afro') {
    c.fillStyle = '#13233e';
    for (let i = -20; i <= 20; i += 10) circle(c, i, headY + 1 + (i % 20 ? 0 : -5), 10);
    c.fillStyle = hair;
    for (let i = -19; i <= 19; i += 10) circle(c, i, headY + 2 + (i % 20 ? 0 : -5), 8.5);
    return;
  }

  if (style === 'dragon_mohawk') {
    __hairFillTop(c, hair);
    c.beginPath(); c.moveTo(-8, headY + 4); c.lineTo(-2, headY - 18); c.lineTo(4, headY + 4); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(2, headY + 3); c.lineTo(11, headY - 12); c.lineTo(15, headY + 6); c.closePath(); c.fill();
    __hairSideLock(c, -22, headY + 10, 5, 12, 0.2);
    return;
  }

  if (__previousDrawHairStyleByName) {
    __previousDrawHairStyleByName(c, style, hair, skin, headY);
  } else {
    __hairFillTop(c, hair);
    __hairFrontBand(c, -18, headY + 1, 36, 7, 3);
  }
}

// 3) 메인 퀘스트 순서 강제 + 장로/대장장이 연계 흐름
QUESTS.elder_material_request = QUESTS.elder_material_request || {
  id: 'elder_material_request',
  title: '장로의 부탁: 대장장이에게',
  town: 'lumina',
  npc: '장로 구름',
  main: true,
  desc: '장로가 대장장이에게 전할 무기 재료를 모아오라고 부탁했습니다. 버섯 포자 3개와 슬라임 젤리 3개를 준비하세요.',
  goals: [
    { type: 'item', itemId: 'mushroom_spore', need: 3, count: 0 },
    { type: 'item', itemId: 'slime_jelly', need: 3, count: 0 }
  ],
  rewardGold: 160,
  rewardExp: 140,
  rewardItems: [{ id: 'hp_potion', count: 2 }]
};

QUESTS.travel_greenwood_order = QUESTS.travel_greenwood_order || {
  id: 'travel_greenwood_order',
  title: '장로의 부탁: 숲의 도시로',
  town: 'lumina',
  npc: '장로 구름',
  main: true,
  desc: '그린우드로 이동하여 숲의 상황을 살피라는 장로의 부탁입니다. 그린우드 숲의 버섯 4마리를 처치하세요.',
  goals: [{ type: 'kill', family: 'mushroom', need: 4, count: 0 }],
  rewardGold: 220,
  rewardExp: 210,
  rewardItems: [{ id: 'mp_potion', count: 2 }]
};

if (QUESTS.tutorial) QUESTS.tutorial.main = true;
const MAIN_QUEST_ORDER = ['tutorial', 'elder_material_request', 'travel_greenwood_order'];

function getCurrentMainQuestId() {
  for (const id of MAIN_QUEST_ORDER) {
    if (!quests.completed.includes(id)) return id;
  }
  return null;
}

function isMainQuestLocked(id) {
  const idx = MAIN_QUEST_ORDER.indexOf(id);
  if (idx < 0) return false;
  for (let i = 0; i < idx; i++) {
    if (!quests.completed.includes(MAIN_QUEST_ORDER[i])) return true;
  }
  return false;
}

function getMainQuestLockMessage(id) {
  const idx = MAIN_QUEST_ORDER.indexOf(id);
  if (idx <= 0) return '먼저 이전 메인 퀘스트를 진행해야 합니다.';
  const prev = QUESTS[MAIN_QUEST_ORDER[idx - 1]];
  return `먼저 '${prev ? prev.title : '이전 메인 퀘스트'}'를 완료해야 합니다.`;
}

const __orderedAcceptOrCompleteQuest = acceptOrCompleteQuest;
function acceptOrCompleteQuest(id) {
  const qBase = QUESTS[id];
  if (!qBase) return;

  if (qBase.main && isMainQuestLocked(id)) {
    makeText(getMainQuestLockMessage(id), game.player.x, game.player.y - 110, '#ffdd99');
    return;
  }

  __orderedAcceptOrCompleteQuest(id);
}

const __mainQuestHandleDialogClick = handleDialogClick;
function handleDialogClick(x, y) {
  if (!game.dialog) return;
  const npc = game.dialog.npc;

  // 장로는 현재 순서의 메인 퀘스트만 줌
  if ((npc.type === 'quest' || npc.name === '장로 구름') && hit(x, y, 210, 620, 190, 42)) {
    const mainId = getCurrentMainQuestId();
    if (mainId) {
      acceptOrCompleteQuest(mainId);
      return;
    }
  }

  __mainQuestHandleDialogClick(x, y);
}

const __mainQuestDrawDialog = drawDialog;
function drawDialog() {
  if (game.dialog && (game.dialog.npc.type === 'quest' || game.dialog.npc.name === '장로 구름')) {
    const mainId = getCurrentMainQuestId();
    if (mainId && QUESTS[mainId]) {
      const oldQuest = game.dialog.npc.quest;
      const oldText = game.dialog.npc.text;
      game.dialog.npc.quest = mainId;
      game.dialog.npc.text = `[메인] ${QUESTS[mainId].title}: ${QUESTS[mainId].desc}`;
      __mainQuestDrawDialog();
      game.dialog.npc.quest = oldQuest;
      game.dialog.npc.text = oldText;
      return;
    }
  }
  __mainQuestDrawDialog();
}

// 4) 히든 직업 힌트 양피지 추가 및 아주 낮은 확률 드랍
const HIDDEN_PARCHMENT_IDS = [
  'hidden_parchment_shadow_reaper',
  'hidden_parchment_star_sage',
  'hidden_parchment_dragon_knight',
  'hidden_parchment_void_archer',
  'hidden_parchment_rune_smith'
];

const HIDDEN_PARCHMENT_NAMES = [
  ['hidden_parchment_shadow_reaper', '그림자 사신 직업의 양피지'],
  ['hidden_parchment_star_sage', '별의 현자 직업의 양피지'],
  ['hidden_parchment_dragon_knight', '용기사 직업의 양피지'],
  ['hidden_parchment_void_archer', '공허 궁수 직업의 양피지'],
  ['hidden_parchment_rune_smith', '룬 대장장이 직업의 양피지']
];

HIDDEN_PARCHMENT_NAMES.forEach(function (pair) {
  if (!ITEMS[pair[0]]) {
    ITEMS[pair[0]] = {
      id: pair[0],
      name: pair[1],
      type: 'etc',
      icon: 'scroll',
      sell: 150,
      desc: '히든 직업을 찾는 단서가 적힌 낡은 양피지입니다.'
    };
  }
});

const __hiddenParchmentKillMonster = killMonster;
function killMonster(m) {
  const type = m.type;
  const dropX = m.x;
  const dropY = m.y;
  __hiddenParchmentKillMonster(m);

  if (Math.random() < 0.0035) {
    const itemId = HIDDEN_PARCHMENT_IDS[Math.floor(Math.random() * HIDDEN_PARCHMENT_IDS.length)];
    game.drops.push({
      kind: 'item',
      itemId,
      count: 1,
      x: dropX + rand(-20, 20),
      y: dropY - 24,
      vy: -155,
      picked: false
    });
    makeText('수상한 양피지!', dropX, dropY - 168, '#e9d5ff');
  }
}

// 5) 검이 캐릭터 쪽이 아니라 앞쪽을 베도록 무기 렌더링 수정
function drawWeapon(c, weaponId, handX, handY, attacking, attackKind, animTime) {
  if (!weaponId) return;

  const weaponData = ITEMS[weaponId] || {};
  const weaponKind = attackKind || weaponData.weaponType || (weaponId.includes('staff') ? 'staff' : weaponId.includes('bow') ? 'bow' : weaponId.includes('dagger') ? 'dagger' : 'sword');
  const px = weaponData.pixel || { a: '#e5e7eb', b: '#f97316', variant: 1 };
  const t = attacking ? Math.sin(Math.min(1, (animTime || 0) * 14) * Math.PI) : 0;

  c.save();
  c.translate(handX, handY);

  if (weaponKind === 'sword') {
    if (attacking) {
      // blade extends to local +X, which is the player's front after drawPlayer scaling
      c.rotate(-0.55 + t * 0.85);
      c.fillStyle = px.a;
      c.beginPath();
      c.moveTo(4, -5);
      c.lineTo(60, -9);
      c.lineTo(70, -1);
      c.lineTo(60, 7);
      c.lineTo(4, 5);
      c.closePath();
      c.fill();
      c.fillStyle = '#ffffff99';
      c.fillRect(14, -4, 40, 2);
      c.fillStyle = px.b;
      roundRect(c, -2, -8, 12, 16, 3);
      c.fillStyle = '#7c2d12';
      roundRect(c, -9, -4, 14, 8, 3);
    } else {
      c.rotate(-0.32);
      c.fillStyle = px.a;
      c.beginPath();
      c.moveTo(0, -52);
      c.lineTo(9, -34);
      c.lineTo(3, -17);
      c.lineTo(-3, -17);
      c.lineTo(-9, -34);
      c.closePath();
      c.fill();
      c.fillStyle = px.b;
      c.fillRect(-12, -20, 24, 5);
      c.fillStyle = '#7c2d12';
      c.fillRect(-4, -17, 8, 24);
    }
    c.restore();
    return;
  }

  if (weaponKind === 'staff') c.rotate(attacking ? -0.75 + t * 0.25 : -0.35);
  else if (weaponKind === 'bow') c.rotate(attacking ? -0.05 : -0.25);
  else if (weaponKind === 'dagger') c.rotate(attacking ? -0.25 : -0.35);
  else c.rotate(attacking ? -0.9 : -0.35);

  if (weaponKind === 'staff') {
    c.strokeStyle = '#111827'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 10); c.lineTo(0, -42); c.stroke();
    c.strokeStyle = px.a; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 10); c.lineTo(0, -42); c.stroke();
    c.fillStyle = px.b; circle(c, 0, -46, 6 + (px.variant % 3));
  } else if (weaponKind === 'bow') {
    c.strokeStyle = '#111827'; c.lineWidth = 5; c.beginPath(); c.arc(0, -9, 21, -Math.PI / 2, Math.PI / 2); c.stroke();
    c.strokeStyle = px.a; c.lineWidth = 3; c.beginPath(); c.arc(0, -9, 21, -Math.PI / 2, Math.PI / 2); c.stroke();
    c.strokeStyle = '#e5e7eb'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -30); c.lineTo(attacking ? -12 - t * 8 : 0, -9); c.lineTo(0, 12); c.stroke();
  } else if (weaponKind === 'dagger') {
    c.fillStyle = px.a; c.beginPath(); c.moveTo(0, -34); c.lineTo(7, -19); c.lineTo(-7, -19); c.closePath(); c.fill();
    c.fillStyle = px.b; c.fillRect(-7, -21, 14, 4); c.fillStyle = '#111827'; c.fillRect(-3, -17, 6, 21);
  }

  c.restore();
}

// 6) 강타는 기본 베기와 다르게: 큰 충격파 + 짧은 화면 전방 파동
function heavyStrikeEffect(x, y, face, color) {
  slashEffect(x + face * 52, y - 52, face, color || '#ff922b', 2.4);
  slashEffect(x + face * 74, y - 44, face, '#fff7ad', 1.55);
  for (let i = 0; i < 16; i++) {
    game.particles.push({
      type: 'spark',
      x: x + face * rand(32, 84),
      y: y - rand(30, 72),
      vx: face * rand(100, 260),
      vy: rand(-160, 70),
      life: rand(0.22, 0.58),
      color: i % 2 ? '#ffd43b' : '#fff3bf'
    });
  }
  makeText('강타!', x + face * 70, y - 96, '#ffe066');
}

const __skillBeforeStrikePatch = useSkill;
function useSkill(id) {
  if (id !== 'strike') {
    __skillBeforeStrikePatch(id);
    return;
  }

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
  skills.cooldowns[id] = Math.max(skill.cooldown || 0.35, 0.55);
  game.player.attackTime = 0.42;
  game.player.attackKind = 'heavy';
  game.player.anim = 'attack';
  game.player.animTime = 0;

  hitMonsters({
    range: 115,
    power: 1.65,
    hits: 1,
    magic: false
  });
  heavyStrikeEffect(game.player.x, game.player.y, game.player.face, '#ff922b');
}

/* =========================================================
   FACE / HAIR RESTORE PATCH
   - Restores missing hair and face even if an earlier hair helper failed
   - Keeps the floating gray cap/helmet hidden
   - Uses self-contained drawing code, so it does not depend on old helper functions
========================================================= */

function drawSdHelmet(c, item) {
  // Temporarily hidden because the previous helmet/cap was appearing as a floating gray object.
  return;
}

function __safeHairColor(ch) {
  const h = ch && ch.hair ? ch.hair : '#2b160e';
  if (h === (ch && ch.skin)) return '#2b160e';
  return h;
}

function __hairButtonShape(c, x, y, w, h, r) {
  if (typeof roundRect === 'function') roundRect(c, x, y, w, h, r || 4);
  else c.fillRect(x, y, w, h);
}

function __drawHairBlob(c, x, y, rx, ry, rot) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2);
  c.fill();
}

function __drawHairTop(c, hair, headY) {
  c.fillStyle = '#13233e';
  c.beginPath();
  c.ellipse(0, headY + 4, 29, 17, 0, Math.PI, 0);
  c.fill();
  c.fillStyle = hair;
  c.beginPath();
  c.ellipse(0, headY + 4, 26, 15, 0, Math.PI, 0);
  c.fill();
}

function __drawDistinctHair(c, style, hair, skin, headY) {
  c.save();
  c.fillStyle = hair;

  function bang(x, y, w, h, r) { __hairButtonShape(c, x, y, w, h, r); }
  function spike(startX, y, count, size, gap) {
    for (let i = 0; i < count; i++) {
      const x = startX + i * (gap || size);
      c.beginPath();
      c.moveTo(x, y + size);
      c.lineTo(x + size * 0.5, y - size * 0.55 - (i % 2) * 2);
      c.lineTo(x + size, y + size);
      c.closePath();
      c.fill();
    }
  }

  switch (style) {
    case 'short':
      __drawHairTop(c, hair, headY); bang(-15, headY + 1, 30, 6, 3); break;
    case 'spiky':
    case 'warrior_spike':
    case 'thunder_spike':
      __drawHairTop(c, hair, headY); spike(-22, headY - 4, 6, 8, 7); break;
    case 'pony':
    case 'long_tail':
    case 'crescent_tail':
      __drawHairTop(c, hair, headY); bang(-18, headY + 1, 36, 7, 3);
      c.beginPath(); c.moveTo(18, headY + 4); c.quadraticCurveTo(35, headY + 13, 23, headY + 30); c.lineTo(12, headY + 26); c.quadraticCurveTo(24, headY + 13, 10, headY + 5); c.closePath(); c.fill(); break;
    case 'wave':
    case 'curly':
      __drawHairTop(c, hair, headY);
      for (let i = -18; i <= 18; i += 9) __drawHairBlob(c, i, headY + 8, 6, 8, 0);
      __drawHairBlob(c, -22, headY + 13, 6, 12, 0.15); __drawHairBlob(c, 22, headY + 13, 6, 12, -0.15); break;
    case 'bob':
    case 'round_bob':
    case 'square_cut':
      __drawHairTop(c, hair, headY); bang(-22, headY + 1, 44, 10, style === 'square_cut' ? 1 : 5);
      __drawHairBlob(c, -21, headY + 13, 6, 12, 0); __drawHairBlob(c, 21, headY + 13, 6, 12, 0); break;
    case 'mushroom':
      c.fillStyle = '#13233e'; c.beginPath(); c.ellipse(0, headY + 2, 31, 19, 0, Math.PI, 0); c.fill();
      c.fillStyle = hair; c.beginPath(); c.ellipse(0, headY + 3, 28, 17, 0, Math.PI, 0); c.fill(); bang(-23, headY + 4, 46, 9, 4); break;
    case 'soft_bang':
    case 'mask_bang':
      __drawHairTop(c, hair, headY);
      for (let i = -20; i <= 13; i += 8) { c.beginPath(); c.moveTo(i, headY + 6); c.lineTo(i + 4, headY - 3); c.lineTo(i + 9, headY + 6); c.closePath(); c.fill(); }
      if (style === 'mask_bang') { bang(-24, headY + 4, 20, 8, 3); }
      break;
    case 'side_part':
      __drawHairTop(c, hair, headY); bang(-20, headY + 1, 40, 7, 3); c.beginPath(); c.moveTo(2, headY + 7); c.lineTo(18, headY - 7); c.lineTo(20, headY + 7); c.closePath(); c.fill(); break;
    case 'twin_tail':
    case 'ribbon_twin':
      __drawHairTop(c, hair, headY); bang(-18, headY + 1, 36, 7, 3);
      __drawHairBlob(c, -26, headY + 15, 7, 18, 0.3); __drawHairBlob(c, 26, headY + 15, 7, 18, -0.3);
      if (style === 'ribbon_twin') { c.fillStyle = '#f472b6'; __drawHairBlob(c, -23, headY + 3, 4, 3, 0); __drawHairBlob(c, 23, headY + 3, 4, 3, 0); c.fillStyle = hair; }
      break;
    case 'wild':
    case 'messy':
    case 'wolf_cut':
      __drawHairTop(c, hair, headY); spike(-24, headY - 3, 7, 7, 7); __drawHairBlob(c, -24, headY + 14, 6, 16, 0.4); __drawHairBlob(c, 24, headY + 14, 6, 16, -0.4); break;
    case 'flat':
      c.fillStyle = '#13233e'; bang(-26, headY - 3, 52, 11, 2); c.fillStyle = hair; bang(-24, headY - 1, 48, 8, 2); break;
    case 'helmet_cut':
      __drawHairTop(c, hair, headY); bang(-22, headY + 3, 44, 8, 2); __drawHairBlob(c, -20, headY + 13, 5, 10, 0); __drawHairBlob(c, 20, headY + 13, 5, 10, 0); break;
    case 'leaf_pin':
      __drawHairTop(c, hair, headY); bang(-18, headY + 1, 36, 7, 3); c.fillStyle = '#66c37a'; c.beginPath(); c.moveTo(15, headY - 3); c.quadraticCurveTo(25, headY - 9, 23, headY + 2); c.quadraticCurveTo(18, headY + 1, 15, headY - 3); c.fill(); break;
    case 'mage_long':
    case 'princess':
    case 'seaweed_long':
      __drawHairTop(c, hair, headY); bang(-17, headY + 1, 34, 7, 3);
      for (let i = -24; i <= 24; i += 12) { c.beginPath(); c.moveTo(i, headY + 7); c.quadraticCurveTo(i + (i < 0 ? -7 : 7), headY + 22, i, headY + 34); c.quadraticCurveTo(i + (i < 0 ? 5 : -5), headY + 20, i, headY + 9); c.closePath(); c.fill(); }
      break;
    case 'archer_feather':
      __drawHairTop(c, hair, headY); bang(-18, headY + 1, 36, 7, 3); c.fillStyle = '#38bdf8'; c.beginPath(); c.moveTo(-18, headY - 4); c.lineTo(-29, headY - 13); c.lineTo(-20, headY + 1); c.closePath(); c.fill(); break;
    case 'rogue_shadow':
      __drawHairTop(c, hair, headY); c.beginPath(); c.moveTo(-20, headY + 5); c.lineTo(-3, headY - 5); c.lineTo(8, headY + 6); c.closePath(); c.fill(); bang(-6, headY + 1, 25, 7, 3); __drawHairBlob(c, -22, headY + 11, 6, 12, 0.25); break;
    case 'prince':
      __drawHairTop(c, hair, headY); bang(-18, headY + 2, 36, 6, 3); c.beginPath(); c.moveTo(0, headY + 4); c.lineTo(7, headY - 4); c.lineTo(11, headY + 4); c.closePath(); c.fill(); break;
    case 'samurai':
    case 'half_up':
      __drawHairTop(c, hair, headY); bang(-18, headY + 1, 36, 6, 3); __drawHairBlob(c, 0, headY - 9, 7, 5, 0); break;
    case 'braid':
      __drawHairTop(c, hair, headY); bang(-18, headY + 1, 36, 6, 3); for (let j = 0; j < 4; j++) __drawHairBlob(c, 22, headY + 8 + j * 5, 5, 4, 0); break;
    case 'cat_ear':
      __drawHairTop(c, hair, headY); c.beginPath(); c.moveTo(-15, headY - 2); c.lineTo(-24, headY - 13); c.lineTo(-7, headY - 6); c.closePath(); c.fill(); c.beginPath(); c.moveTo(15, headY - 2); c.lineTo(24, headY - 13); c.lineTo(7, headY - 6); c.closePath(); c.fill(); bang(-16, headY + 1, 32, 6, 3); break;
    case 'horn':
    case 'dragon_mohawk':
      __drawHairTop(c, hair, headY); spike(-18, headY - 8, 5, 9, 8); if (style === 'horn') { c.fillStyle = '#d9c1a0'; c.beginPath(); c.moveTo(-12, headY - 5); c.lineTo(-22, headY - 16); c.lineTo(-16, headY - 4); c.closePath(); c.fill(); c.beginPath(); c.moveTo(12, headY - 5); c.lineTo(22, headY - 16); c.lineTo(16, headY - 4); c.closePath(); c.fill(); } break;
    case 'cloud':
    case 'fluffy_afro':
      c.fillStyle = '#13233e'; for (let i = -20; i <= 20; i += 10) __drawHairBlob(c, i, headY + 2, 9, 9, 0); c.fillStyle = hair; for (let i = -18; i <= 18; i += 9) __drawHairBlob(c, i, headY + 4, 8, 8, 0); break;
    case 'flame':
      __drawHairTop(c, hair, headY); spike(-20, headY - 8, 5, 10, 8); break;
    case 'ice':
      c.fillStyle = '#13233e'; c.beginPath(); c.ellipse(0, headY + 2, 28, 16, 0, Math.PI, 0); c.fill(); c.fillStyle = '#c9efff'; spike(-19, headY - 5, 5, 8, 8); bang(-17, headY + 2, 34, 6, 3); break;
    case 'star':
      __drawHairTop(c, hair, headY); bang(-18, headY + 1, 36, 6, 3); c.fillStyle = '#facc15'; c.beginPath(); c.moveTo(18, headY - 5); c.lineTo(20, headY); c.lineTo(25, headY); c.lineTo(21, headY + 3); c.lineTo(23, headY + 8); c.lineTo(18, headY + 5); c.lineTo(13, headY + 8); c.lineTo(15, headY + 3); c.lineTo(11, headY); c.lineTo(16, headY); c.closePath(); c.fill(); break;
    case 'noble':
      __drawHairTop(c, hair, headY); bang(-18, headY + 2, 36, 6, 3); c.fillStyle = '#f8fafc'; bang(-12, headY - 4, 24, 3, 2); break;
    case 'bandana':
      __drawHairTop(c, hair, headY); c.fillStyle = '#ef4444'; bang(-24, headY - 3, 48, 8, 3); c.fillStyle = hair; bang(-16, headY + 3, 32, 5, 2); break;
    case 'cap':
      c.fillStyle = '#1f2937'; bang(-26, headY - 5, 52, 10, 5); c.fillStyle = hair; bang(-18, headY + 2, 36, 6, 3); break;
    case 'hood':
      c.fillStyle = '#2c4f8d'; c.beginPath(); c.ellipse(0, headY + 4, 30, 19, 0, Math.PI, 0); c.fill(); c.fillStyle = hair; bang(-14, headY + 2, 28, 6, 3); break;
    case 'drill':
    case 'royal_roll':
      __drawHairTop(c, hair); bang(-18, headY + 1, 36, 7, 3); __drawHairBlob(c, -25, headY + 14, 8, 13, 0.15); __drawHairBlob(c, 25, headY + 14, 8, 13, -0.15); break;
    case 'mini_tail':
      __drawHairTop(c, hair, headY); bang(-18, headY + 1, 36, 7, 3); __drawHairBlob(c, 18, headY - 4, 5, 4, 0); c.beginPath(); c.moveTo(20, headY - 2); c.lineTo(27, headY + 7); c.lineTo(19, headY + 8); c.closePath(); c.fill(); break;
    case 'wind':
      __drawHairTop(c, hair, headY); c.beginPath(); c.moveTo(-18, headY + 5); c.quadraticCurveTo(3, headY - 10, 23, headY + 1); c.lineTo(18, headY + 9); c.quadraticCurveTo(-1, headY - 2, -18, headY + 7); c.closePath(); c.fill(); __drawHairBlob(c, 24, headY + 10, 6, 11, -0.35); break;
    default:
      __drawHairTop(c, hair, headY); bang(-18, headY + 1, 36, 7, 3); break;
  }
  c.restore();
}

function drawHair(c, ch, headY) {
  const hair = __safeHairColor(ch || {});
  const skin = (ch && ch.skin) || '#ffd8a8';
  const style = (ch && ch.hairStyle) || 'basic';
  __drawDistinctHair(c, style, hair, skin, headY);
  c.save();
  c.fillStyle = 'rgba(255,255,255,0.12)';
  __hairButtonShape(c, -8, headY - 4, 9, 2.4, 1.2);
  c.restore();
}

function drawFace(c, ch, headY) {
  const style = (ch && ch.faceStyle) || 'normal';
  const idx = SD_FACE_STYLES_40.indexOf(style) >= 0 ? SD_FACE_STYLES_40.indexOf(style) : 0;
  const eyeMode = idx % 8;
  const mouthMode = Math.floor(idx / 8) % 5;

  c.save();
  c.fillStyle = '#191919';
  c.strokeStyle = '#191919';
  c.lineWidth = 1.8;
  const ey = headY - 1;

  if (eyeMode === 0) { c.beginPath(); c.ellipse(-8, ey, 2.3, 4.6, -0.1, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(8, ey, 2.3, 4.6, 0.1, 0, Math.PI * 2); c.fill(); }
  else if (eyeMode === 1) { circle(c, -8, ey, 2.8); circle(c, 8, ey, 2.8); c.fillStyle = '#fff'; circle(c, -8.8, ey - 1, 0.8); circle(c, 7.2, ey - 1, 0.8); c.fillStyle = '#191919'; }
  else if (eyeMode === 2) { c.beginPath(); c.moveTo(-12, ey); c.quadraticCurveTo(-8, ey + 3, -4.5, ey); c.stroke(); c.beginPath(); c.moveTo(4.5, ey); c.quadraticCurveTo(8, ey + 3, 12, ey); c.stroke(); }
  else if (eyeMode === 3) { c.beginPath(); c.moveTo(-11, ey); c.lineTo(-5, ey); c.moveTo(5, ey); c.lineTo(11, ey); c.stroke(); }
  else if (eyeMode === 4) { c.fillRect(-11, ey - 1.5, 6, 2.4); c.fillRect(5, ey - 1.5, 6, 2.4); }
  else if (eyeMode === 5) { c.fillRect(-8.5, ey - 2, 2.4, 4.2); c.fillRect(6.1, ey - 2, 2.4, 4.2); }
  else if (eyeMode === 6) { c.beginPath(); c.ellipse(-9, ey, 3, 5.2, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.ellipse(9, ey, 3, 5.2, 0, 0, Math.PI * 2); c.fill(); }
  else { c.fillRect(-8.5, ey, 2, 2); c.fillRect(6.5, ey, 2, 2); }

  c.fillStyle = 'rgba(255,185,190,0.14)';
  c.beginPath(); c.ellipse(-13, headY + 7, 4.0, 2.4, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(13, headY + 7, 4.0, 2.4, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = 'rgba(70,40,24,0.18)';
  c.beginPath(); c.ellipse(0, headY + 2.5, 0.9, 0.7, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = '#191919';

  const my = headY + 10.5;
  if (mouthMode === 0) { c.beginPath(); c.arc(0, my - 1.5, 4.3, 0, Math.PI); c.stroke(); }
  else if (mouthMode === 1) c.fillRect(-3.4, my, 6.8, 1.8);
  else if (mouthMode === 2) { c.beginPath(); c.arc(0, my + 2.5, 4.2, Math.PI, Math.PI * 2); c.stroke(); }
  else if (mouthMode === 3) { c.beginPath(); c.ellipse(0, my, 2.4, 3.1, 0, 0, Math.PI * 2); c.fill(); }
  else { c.beginPath(); c.moveTo(-4.2, my - 1); c.quadraticCurveTo(0, my + 3.8, 4.6, my - 1); c.stroke(); }
  c.restore();
}

function drawPlayerBody(c, player) {
  const ch = (player && player.character) || (game.player && game.player.character) || selected;
  ensureSdCharacterStyle(ch);
  if (!ch.hair || ch.hair === ch.skin) ch.hair = '#2b160e';
  if (!ch.faceStyle) ch.faceStyle = 'normal';
  if (!ch.hairStyle) ch.hairStyle = 'basic';

  const drawEq = (player && player.__drawEquipment) || equipment || {};
  const outfit = (typeof __getOutfitForDraw === 'function') ? __getOutfitForDraw(ch, drawEq) : { main: '#6aa8ff', trim: '#3f72c9' };
  const animTime = player.animTime || 0;
  const walk = Math.sin(animTime * 11);
  const moving = player.anim === 'walk';
  const attacking = player.anim === 'attack';
  const jumping = player.anim === 'jump';
  const hurt = player.hurtTime && player.hurtTime > 0;
  const attackSwing = attacking ? Math.sin(Math.min(1, animTime * 11) * Math.PI) : 0;
  const skin = ch.skin || '#ffd8a8';
  const skinShadow = '#f0ba88';
  const legMove = moving ? walk * 5 : 0;
  const armMove = moving ? -walk * 4 : 0;

  c.save();
  c.lineCap = 'round';
  c.lineJoin = 'round';
  if (hurt) c.globalAlpha = 0.74;

  c.fillStyle = 'rgba(0,0,0,0.18)';
  c.beginPath(); c.ellipse(0, 2, 20, 4.6, 0, 0, Math.PI * 2); c.fill();

  c.strokeStyle = '#2a1d16'; c.lineWidth = 6.2;
  c.beginPath(); c.moveTo(-5, -32); c.quadraticCurveTo(-7 - legMove * 0.2, -20, -14 - legMove * 0.8, -8); c.stroke();
  c.beginPath(); c.moveTo(5, -32); c.quadraticCurveTo(7 + legMove * 0.2, -20, 14 + legMove * 0.8, -8); c.stroke();
  c.strokeStyle = skin; c.lineWidth = 3.8;
  c.beginPath(); c.moveTo(-5, -32); c.quadraticCurveTo(-7 - legMove * 0.2, -20, -14 - legMove * 0.8, -8); c.stroke();
  c.beginPath(); c.moveTo(5, -32); c.quadraticCurveTo(7 + legMove * 0.2, -20, 14 + legMove * 0.8, -8); c.stroke();
  c.fillStyle = '#5b3b1e'; __hairButtonShape(c, -24 - legMove * 0.2, -9, 15, 6, 3); __hairButtonShape(c, 9 + legMove * 0.2, -9, 15, 6, 3);

  c.fillStyle = '#13233e'; __hairButtonShape(c, -19, -66, 38, 36, 13);
  c.fillStyle = outfit.main || '#6aa8ff'; __hairButtonShape(c, -16, -63, 32, 31, 11);
  c.fillStyle = 'rgba(255,255,255,0.92)'; __hairButtonShape(c, -9, -58, 18, 5.5, 3);
  c.fillStyle = outfit.trim || '#3f72c9'; __hairButtonShape(c, -12, -40, 24, 6.5, 4);
  c.fillStyle = 'rgba(255,255,255,0.14)'; __hairButtonShape(c, -12, -61, 8, 14, 5);

  let leftHandX = -22 + armMove, leftHandY = -47, rightHandX = 22 - armMove + attackSwing * 21, rightHandY = -47 + attackSwing * 6;
  if (jumping) { leftHandX = -24; leftHandY = -56; rightHandX = 24; rightHandY = -56; }
  c.strokeStyle = '#13233e'; c.lineWidth = 7.8;
  c.beginPath(); c.moveTo(-15, -56); c.quadraticCurveTo(-22, -53, leftHandX, leftHandY); c.stroke();
  c.beginPath(); c.moveTo(15, -56); c.quadraticCurveTo(22, -53, rightHandX, rightHandY); c.stroke();
  c.strokeStyle = skin; c.lineWidth = 4.6;
  c.beginPath(); c.moveTo(-15, -56); c.quadraticCurveTo(-21, -53, leftHandX, leftHandY); c.stroke();
  c.beginPath(); c.moveTo(15, -56); c.quadraticCurveTo(21, -53, rightHandX, rightHandY); c.stroke();
  c.fillStyle = skin; circle(c, leftHandX, leftHandY, 3.8); circle(c, rightHandX, rightHandY, 3.8);

  const weaponObj = drawEq.weapon; const weaponId = weaponObj && (weaponObj.id || weaponObj);
  drawWeapon(c, weaponId, rightHandX, rightHandY, attacking);

  c.fillStyle = '#13233e'; __hairButtonShape(c, -5, -72, 10, 8, 4);
  c.fillStyle = skinShadow; __hairButtonShape(c, -3.5, -71, 7, 7, 3);
  c.fillStyle = skin; __hairButtonShape(c, -3.5, -73, 7, 5.5, 3);

  c.fillStyle = '#13233e';
  c.beginPath(); c.ellipse(0, -98, 29, 30.5, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(-22.5, -98, 4, 5.5, -0.2, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(22.5, -98, 4, 5.5, 0.2, 0, Math.PI * 2); c.fill();
  c.fillStyle = skin;
  c.beginPath(); c.ellipse(0, -98, 26, 28.5, 0, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(-22, -98, 3.2, 4.5, -0.2, 0, Math.PI * 2); c.fill();
  c.beginPath(); c.ellipse(22, -98, 3.2, 4.5, 0.2, 0, Math.PI * 2); c.fill();

  drawHair(c, ch, -114);
  drawFace(c, ch, -100);
  // Helmet intentionally hidden until a better attached design is added.
  c.restore();
}


/* =========================================================
   MINIMAL STAT CLICK FIX PATCH
   - Based on the user-provided working 251KB file.
   - Only fixes stat + button hit boxes and stat save trigger.
   - Does not replace or shrink the rest of the game code.
========================================================= */

function handleStatClick(x, y) {
  if (!stats.open) return;

  // drawStatsPanel() draws the panel at x=560, y=120.
  // drawStatRow(label, key, x + 25, rowY) draws the + button at rowX + 230.
  // So the actual + button rect is:
  //   x: 560 + 25 + 230 = 815
  //   y: rowY - 28
  // The older click handler used baseX=610/baseY=215, so it was shifted away
  // from the visible buttons and clicks did not register.
  const panelX = 560;
  const panelY = 120;
  const rowX = panelX + 25;
  const plusX = rowX + 230;

  const rows = [
    { key: 'str', y: panelY + 130 },
    { key: 'dex', y: panelY + 180 },
    { key: 'int', y: panelY + 230 },
    { key: 'luk', y: panelY + 280 }
  ];

  for (const row of rows) {
    // Hit box is slightly bigger than the drawn button so it is easier to click.
    if (hit(x, y, plusX - 8, row.y - 36, 58, 48)) {
      const beforeAp = stats.ap;
      const beforeValue = stats[row.key];

      addStat(row.key);

      if (stats.ap !== beforeAp || stats[row.key] !== beforeValue) {
        recalcStats();
        markAutoSaveSoon();
        if (typeof makeText === 'function' && game && game.player) {
          makeText(row.key.toUpperCase() + ' +1', game.player.x, game.player.y - 95, '#ffe066');
        }
      }
      return;
    }
  }
}

function addStat(key) {
  if (!['str', 'dex', 'int', 'luk'].includes(key)) return false;
  if ((stats.ap || 0) <= 0) {
    if (typeof makeText === 'function' && game && game.player) {
      makeText('AP가 부족합니다.', game.player.x, game.player.y - 90, '#cbd5e1');
    }
    return false;
  }

  stats[key] += 1;
  stats.ap -= 1;
  recalcStats();
  markAutoSaveSoon();
  return true;
}

/* =========================================================
   MINIMAL MONSTER DEATH / RESPAWN / ELDER QUEST FREEZE FIX
   - Based on the user's currently working stat-click-fixed file.
   - Fixes monsters staying alive at 0 HP.
   - Increases monster respawn delay.
   - Replaces the elder quest dialog/accept flow with a safe non-recursive version.
========================================================= */

const SAFE_MONSTER_RESPAWN_MIN = 9000;
const SAFE_MONSTER_RESPAWN_MAX = 22000;

function getSafeMonsterRespawnTime(type) {
  const base = type && Number.isFinite(type.respawn) ? type.respawn : 5000;
  return clamp(Math.floor(base * 2.7), SAFE_MONSTER_RESPAWN_MIN, SAFE_MONSTER_RESPAWN_MAX);
}

function damageMonster(m, skill) {
  if (!m || m.dead || m._deathHandled) return;

  const p = game.player;
  const base = skill && skill.magic ? p.magicPower : p.attackPower;
  const crit = Math.random() * 100 < p.critRate;
  const raw = base * ((skill && skill.power) || 1);
  const defense = m.type && Number.isFinite(m.type.def) ? m.type.def : 0;
  const damage = Math.max(1, Math.floor(raw - defense + Math.random() * 8)) * (crit ? 2 : 1);

  m.hp = Math.max(0, (m.hp || 0) - damage);
  m.hit = 0.15;
  m.x += p.face * 10;

  makeText(crit ? `${damage}!` : `-${damage}`, m.x, m.y - 78, crit ? '#ffe066' : '#ff6b6b');

  if (m.hp <= 0) {
    killMonster(m);
  }
}

function killMonster(m) {
  if (!m || m.dead || m._deathHandled) return;

  const type = m.type || {};
  m._deathHandled = true;
  m.dead = true;
  m.hp = 0;
  m.hit = 0;

  const levelGap = Math.max(0, (type.level || 1) - game.player.level);
  const expBonus = 1 + Math.min(1.5, levelGap * 0.08);
  const finalExp = Math.floor((type.exp || 0) * expBonus);
  const gold = Math.max(0, type.gold || 0);

  addExp(finalExp);
  wallet.gold += gold;

  makeText(`EXP +${finalExp}`, m.x, m.y - 108, '#c0eb75');
  makeText(`+${gold}G`, m.x, m.y - 130, '#ffd43b');

  game.drops.push({
    kind: 'gold',
    amount: Math.max(1, Math.floor(gold * 0.35)),
    x: m.x + rand(-15, 15),
    y: m.y - 12,
    vy: -120,
    picked: false
  });

  if (type.drop && Math.random() < (type.dropRate || 0.35)) {
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

  if (typeof getRareDropRate === 'function' && typeof getMonsterRareEquipmentDrop === 'function') {
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
  }

  if (typeof HIDDEN_PARCHMENT_IDS !== 'undefined' && Array.isArray(HIDDEN_PARCHMENT_IDS)) {
    if (Math.random() < 0.0035) {
      const itemId = HIDDEN_PARCHMENT_IDS[Math.floor(Math.random() * HIDDEN_PARCHMENT_IDS.length)];
      game.drops.push({
        kind: 'item',
        itemId,
        count: 1,
        x: m.x + rand(-20, 20),
        y: m.y - 24,
        vy: -155,
        picked: false
      });
      makeText('수상한 양피지!', m.x, m.y - 168, '#e9d5ff');
    }
  }

  updateKillQuests(type.family);
  markAutoSaveSoon();

  const respawnDelay = getSafeMonsterRespawnTime(type);
  clearTimeout(m._respawnTimer);
  m._respawnTimer = setTimeout(function () {
    m.dead = false;
    m._deathHandled = false;
    m.hp = m.maxHp || type.hp || 1;
    m.x = (m.baseX || m.x) + rand(-50, 50);
    m.y = m.spawnY || m.y;
    m.hit = 0;
    m.attackCooldown = 0;
  }, respawnDelay);
}

const __safeUpdateMonstersBase = updateMonsters;
function updateMonsters(dt) {
  if (game.mode !== 'hunt') return;

  // Safety net: if any earlier combat path leaves a monster at 0 HP without killing it,
  // process death before the normal monster AI update runs.
  game.monsters.forEach(function (m) {
    if (!m || m.dead || m._deathHandled) return;
    if ((m.hp || 0) <= 0) killMonster(m);
  });

  __safeUpdateMonstersBase(dt);
}

function getCurrentMainQuestId() {
  const order = (typeof MAIN_QUEST_ORDER !== 'undefined' && Array.isArray(MAIN_QUEST_ORDER))
    ? MAIN_QUEST_ORDER
    : ['tutorial', 'elder_material_request', 'travel_greenwood_order'];

  for (const id of order) {
    if (!quests.completed.includes(id)) return id;
  }
  return null;
}

function isMainQuestLocked(id) {
  const order = (typeof MAIN_QUEST_ORDER !== 'undefined' && Array.isArray(MAIN_QUEST_ORDER))
    ? MAIN_QUEST_ORDER
    : ['tutorial', 'elder_material_request', 'travel_greenwood_order'];

  const idx = order.indexOf(id);
  if (idx < 0) return false;
  for (let i = 0; i < idx; i++) {
    if (!quests.completed.includes(order[i])) return true;
  }
  return false;
}

function acceptOrCompleteQuest(id) {
  const qBase = QUESTS[id];
  if (!qBase) {
    makeText('퀘스트 정보를 찾을 수 없습니다.', game.player.x, game.player.y - 90, '#ff8787');
    return;
  }

  if (qBase.main && isMainQuestLocked(id)) {
    makeText('이전 메인 퀘스트를 먼저 완료해야 합니다.', game.player.x, game.player.y - 110, '#ffdd99');
    return;
  }

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
    markAutoSaveSoon();
    return;
  }

  syncQuestItems(q);

  if (!questComplete(q)) {
    makeText('아직 완료 조건이 부족합니다.', game.player.x, game.player.y - 90, '#ffdd99');
    return;
  }

  completeQuest(q);
  markAutoSaveSoon();
}

function getDialogQuestId(npc) {
  if (!npc) return null;
  if (npc.name === '장로 구름' || npc.type === 'quest') {
    return getCurrentMainQuestId() || npc.quest || null;
  }
  return npc.quest || null;
}

function handleDialogClick(x, y) {
  if (!game.dialog) return;

  const npc = game.dialog.npc;

  if (hit(x, y, 970, 620, 120, 40)) {
    game.dialog = null;
    return;
  }

  if (!hit(x, y, 210, 620, 190, 42)) return;

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

  if (npc.type === 'quest' || npc.type === 'job' || npc.name === '장로 구름') {
    const questId = getDialogQuestId(npc);
    if (questId) acceptOrCompleteQuest(questId);
  }
}

function wrapDialogText(text, maxChars) {
  const src = String(text || '무엇을 도와드릴까요?');
  const out = [];
  let line = '';
  src.split(' ').forEach(function (word) {
    if ((line + ' ' + word).trim().length > maxChars) {
      if (line) out.push(line);
      line = word;
    } else {
      line = (line + ' ' + word).trim();
    }
  });
  if (line) out.push(line);
  return out.slice(0, 2);
}

function drawDialog() {
  if (!game.dialog || !game.dialog.npc) return;

  const npc = game.dialog.npc;
  const questId = getDialogQuestId(npc);
  const qBase = questId ? QUESTS[questId] : null;

  let text = npc.text || '무엇을 도와드릴까요?';
  if ((npc.name === '장로 구름' || npc.type === 'quest') && qBase) {
    text = `[메인] ${qBase.title}: ${qBase.desc || ''}`;
  }

  ctx.fillStyle = 'rgba(15,23,42,0.96)';
  roundRect(ctx, 150, 545, 980, 125, 16);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(150, 545, 980, 125);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(npc.name || 'NPC', 180, 580);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '15px sans-serif';
  const lines = wrapDialogText(text, 58);
  lines.forEach(function (line, i) {
    ctx.fillText(line, 180, 608 + i * 20);
  });

  let action = '확인';
  if (npc.type === 'taxi') action = '이동하기';
  if (npc.type === 'merchant') action = '상점 열기';
  if (npc.type === 'weapon') action = '장비 보기';
  if (npc.type === 'blacksmith') action = '강화하기';

  if (npc.type === 'quest' || npc.type === 'job' || npc.name === '장로 구름') {
    const id = questId;
    const q = id ? quests.active.find(function (item) { return item.id === id; }) : null;
    if (id && quests.completed.includes(id)) action = '완료됨';
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


/* =========================================================
   QUEST ORDER MESSAGE / SKILL HOTKEY FIX PATCH
   - Shows which previous NPC/quest must be completed first
   - Prevents locked main quests from freezing dialog flow
   - Rebuilds useSkill as a standalone safe function so non-strike skills work
   - Sets Strike cooldown to 2.5 seconds only
========================================================= */

if (SKILLS && SKILLS.strike) {
  SKILLS.strike.cooldown = 2.5;
}

function getMainQuestOrderSafe() {
  if (typeof MAIN_QUEST_ORDER !== 'undefined' && Array.isArray(MAIN_QUEST_ORDER)) {
    return MAIN_QUEST_ORDER;
  }
  return ['tutorial', 'elder_material_request', 'travel_greenwood_order'];
}

function getPreviousMainQuestInfo(id) {
  const order = getMainQuestOrderSafe();
  const idx = order.indexOf(id);
  if (idx <= 0) return null;

  for (let i = 0; i < idx; i++) {
    const prevId = order[i];
    if (!quests.completed.includes(prevId)) {
      const q = QUESTS[prevId] || { id: prevId, title: '이전 메인 퀘스트', npc: '장로 구름' };
      return {
        id: prevId,
        title: q.title || '이전 메인 퀘스트',
        npc: q.npc || '장로 구름'
      };
    }
  }

  return null;
}

function getQuestLockMessage(id) {
  const prev = getPreviousMainQuestInfo(id);
  if (!prev) return '이전 메인 퀘스트를 먼저 완료해야 합니다.';
  return `먼저 ${prev.npc}에게 가서 '${prev.title}' 퀘스트를 완료하고 오세요.`;
}

function isMainQuestLocked(id) {
  return !!getPreviousMainQuestInfo(id);
}

function getCurrentMainQuestId() {
  const order = getMainQuestOrderSafe();
  for (const id of order) {
    if (!quests.completed.includes(id)) return id;
  }
  return null;
}

function acceptOrCompleteQuest(id) {
  const qBase = QUESTS[id];
  if (!qBase) {
    makeText('퀘스트 정보를 찾을 수 없습니다.', game.player.x, game.player.y - 90, '#ff8787');
    return;
  }

  const order = getMainQuestOrderSafe();
  const isMain = !!qBase.main || order.includes(id);

  if (isMain && isMainQuestLocked(id)) {
    makeText(getQuestLockMessage(id), game.player.x, game.player.y - 112, '#ffdd99');
    return;
  }

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
    markAutoSaveSoon();
    return;
  }

  syncQuestItems(q);

  if (!questComplete(q)) {
    makeText('아직 완료 조건이 부족합니다.', game.player.x, game.player.y - 90, '#ffdd99');
    return;
  }

  completeQuest(q);
  markAutoSaveSoon();
}

function getDialogQuestId(npc) {
  if (!npc) return null;

  if (npc.name === '장로 구름' || npc.type === 'quest') {
    return getCurrentMainQuestId() || npc.quest || null;
  }

  return npc.quest || null;
}

function handleDialogClick(x, y) {
  if (!game.dialog) return;

  const npc = game.dialog.npc;

  if (hit(x, y, 970, 620, 120, 40)) {
    game.dialog = null;
    return;
  }

  if (!hit(x, y, 210, 620, 190, 42)) return;

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

  if (npc.type === 'quest' || npc.type === 'job' || npc.name === '장로 구름') {
    const questId = getDialogQuestId(npc);
    if (!questId) {
      makeText('진행할 퀘스트가 없습니다.', game.player.x, game.player.y - 90, '#cbd5e1');
      return;
    }
    acceptOrCompleteQuest(questId);
  }
}

function drawDialog() {
  if (!game.dialog || !game.dialog.npc) return;

  const npc = game.dialog.npc;
  const questId = getDialogQuestId(npc);
  const qBase = questId ? QUESTS[questId] : null;
  const order = getMainQuestOrderSafe();
  const isMain = qBase && (!!qBase.main || order.includes(questId));
  const locked = qBase && isMain && isMainQuestLocked(questId);

  let text = npc.text || '무엇을 도와드릴까요?';

  if ((npc.name === '장로 구름' || npc.type === 'quest') && qBase) {
    text = locked ? getQuestLockMessage(questId) : `[메인] ${qBase.title}: ${qBase.desc || ''}`;
  } else if (qBase && locked) {
    text = getQuestLockMessage(questId);
  }

  ctx.fillStyle = 'rgba(15,23,42,0.96)';
  roundRect(ctx, 150, 545, 980, 125, 16);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(150, 545, 980, 125);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(npc.name || 'NPC', 180, 580);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '15px sans-serif';
  const lines = wrapDialogText(text, 58);
  lines.forEach(function (line, i) {
    ctx.fillText(line, 180, 608 + i * 20);
  });

  let action = '확인';
  if (npc.type === 'taxi') action = '이동하기';
  if (npc.type === 'merchant') action = '상점 열기';
  if (npc.type === 'weapon') action = '장비 보기';
  if (npc.type === 'blacksmith') action = '강화하기';

  if (npc.type === 'quest' || npc.type === 'job' || npc.name === '장로 구름') {
    const id = questId;
    const q = id ? quests.active.find(function (item) { return item.id === id; }) : null;
    if (locked) action = '이전 퀘스트 필요';
    else if (id && quests.completed.includes(id)) action = '완료됨';
    else if (q) {
      syncQuestItems(q);
      action = questComplete(q) ? '완료하기' : '진행 중';
    } else action = npc.type === 'job' ? '전직 퀘스트' : '퀘스트 수락';
  }

  ctx.fillStyle = locked ? '#64748b' : '#4dabf7';
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

function useSkill(id) {
  const skill = SKILLS[id];
  if (!skill) {
    makeText('스킬 정보를 찾을 수 없습니다.', game.player.x, game.player.y - 90, '#ff8787');
    return;
  }

  if (!skills.unlocked.includes(id)) {
    makeText('아직 배운 스킬이 아닙니다.', game.player.x, game.player.y - 90, '#ff8787');
    return;
  }

  if ((skills.cooldowns[id] || 0) > 0) {
    makeText('쿨타임 중', game.player.x, game.player.y - 90, '#cbd5e1');
    return;
  }

  if (game.player.mp < (skill.mp || 0)) {
    makeText('MP 부족', game.player.x, game.player.y - 90, '#74c0fc');
    return;
  }

  game.player.mp -= skill.mp || 0;
  skills.cooldowns[id] = id === 'strike' ? 2.5 : (skill.cooldown || 0.8);

  if (skill.heal) {
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + skill.heal);
    makeText(`+${skill.heal} HP`, game.player.x, game.player.y - 90, '#ff8787');
    circleEffect(game.player.x, game.player.y - 50, '#69db7c');
    markAutoSaveSoon();
    return;
  }

  game.player.attackTime = id === 'strike' ? 0.44 : 0.36;
  game.player.attackKind = id === 'strike' ? 'heavy' : (skill.magic ? 'staff' : 'skill');
  game.player.anim = 'attack';
  game.player.animTime = 0;

  if (skill.projectile) {
    spawnProjectile(skill);
    return;
  }

  if (id === 'strike') {
    hitMonsters({ range: 115, power: 1.65, hits: 1, magic: false });
    if (typeof heavyStrikeEffect === 'function') {
      heavyStrikeEffect(game.player.x, game.player.y, game.player.face, '#ff922b');
    } else {
      slashEffect(game.player.x + game.player.face * 54, game.player.y - 50, game.player.face, '#ff922b', 2.2);
      makeText('강타!', game.player.x + game.player.face * 65, game.player.y - 96, '#ffe066');
    }
    return;
  }

  hitMonsters(skill);
  slashEffect(
    game.player.x + game.player.face * 44,
    game.player.y - 46,
    game.player.face,
    skill.magic ? '#74c0fc' : '#ffb020',
    skill.power && skill.power > 1.5 ? 1.8 : 1.2
  );
}

/* =========================================================
   PORTAL SAFE INTERACT / SKILL COOLDOWN HOTKEY PATCH
   - Prevents E portal interaction from freezing the game
   - Sets stone_throw cooldown to 2.5 seconds
   - Sets first_aid cooldown to 3 seconds
   - Keeps strike cooldown at 2.5 seconds
   - Makes non-strike hotkey skills execute through a standalone safe path
========================================================= */

if (typeof SKILLS !== 'undefined') {
  if (SKILLS.strike) SKILLS.strike.cooldown = 2.5;
  if (SKILLS.stone_throw) SKILLS.stone_throw.cooldown = 2.5;
  if (SKILLS.first_aid) SKILLS.first_aid.cooldown = 3;
}

function __safeMakeText(msg, x, y, color) {
  if (typeof makeText === 'function') makeText(msg, x, y, color || '#ffdd99');
}

function __safeCloseActionWindowsForPortal() {
  game.dialog = null;
  game.taxiOpen = false;
  game.shopOpen = false;
  game.shopScroll = 0;
  game.blacksmithOpen = false;
}

function interact() {
  if (!game || !game.ready || !game.player) return;

  const p = game.player;

  for (const portal of game.portals || []) {
    if (Math.abs(p.x - portal.x) < 90 && Math.abs(p.y - portal.y) < 140) {
      __safeCloseActionWindowsForPortal();
      stopPlayerMovement();

      try {
        if (portal.type === 'hunt') {
          const town = getTown(game.townId || 'lumina');
          const targetHunt = town.hunt || game.huntId || 'lumina_field';
          loadHunt(targetHunt);
          game.player.x = 220;
          game.player.y = game.ground;
          game.player.vx = 0;
          game.player.vy = 0;
          game.player.grounded = true;
          __safeMakeText('사냥터 입장', game.player.x, game.player.y - 90, '#c0eb75');
        } else if (portal.type === 'town') {
          const targetTown = getTown(game.townId || 'lumina');
          loadTown(targetTown.id);
          game.player.x = Math.min(3880, Math.max(220, game.width - 420));
          game.player.y = game.ground;
          game.player.vx = 0;
          game.player.vy = 0;
          game.player.grounded = true;
          __safeMakeText(`${targetTown.name} 귀환`, game.player.x, game.player.y - 90, '#c0eb75');
        }
        game.cameraX = clamp(game.player.x - W * 0.42, 0, Math.max(0, game.width - W));
      } catch (err) {
        console.error('[portal interact failed]', err);
        game.mode = game.mode || 'town';
        game.ready = true;
        __safeMakeText('포탈 이동 오류가 발생했습니다.', p.x, p.y - 90, '#ff8787');
      }

      return;
    }
  }

  for (const npc of game.npcs || []) {
    if (Math.abs(p.x - npc.x) < 90 && Math.abs(p.y - npc.y) < 130) {
      stopPlayerMovement();
      game.dialog = { npc };
      return;
    }
  }
}

function useHotSkill(slot) {
  let id = skills.hotkeys[slot];

  if (!id) {
    const fallback = (skills.unlocked || []).find(function (skillId) {
      return skillId && SKILLS[skillId];
    });
    if (fallback) {
      id = fallback;
      skills.hotkeys[slot] = fallback;
    }
  }

  if (!id) {
    __safeMakeText('스킬이 없습니다.', game.player.x, game.player.y - 90, '#cbd5e1');
    return;
  }

  useSkill(id);
}

function useSkill(id) {
  const skill = SKILLS[id];
  if (!skill) {
    __safeMakeText('스킬 정보를 찾을 수 없습니다.', game.player.x, game.player.y - 90, '#ff8787');
    return;
  }

  if (!skills.unlocked.includes(id)) {
    __safeMakeText('아직 배운 스킬이 아닙니다.', game.player.x, game.player.y - 90, '#ff8787');
    return;
  }

  if ((skills.cooldowns[id] || 0) > 0) {
    __safeMakeText('쿨타임 중', game.player.x, game.player.y - 90, '#cbd5e1');
    return;
  }

  const mpCost = skill.mp || 0;
  if (game.player.mp < mpCost) {
    __safeMakeText('MP 부족', game.player.x, game.player.y - 90, '#74c0fc');
    return;
  }

  game.player.mp -= mpCost;

  if (id === 'strike') skills.cooldowns[id] = 2.5;
  else if (id === 'stone_throw') skills.cooldowns[id] = 2.5;
  else if (id === 'first_aid') skills.cooldowns[id] = 3;
  else skills.cooldowns[id] = skill.cooldown || 0.8;

  if (skill.heal) {
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + skill.heal);
    __safeMakeText(`+${skill.heal} HP`, game.player.x, game.player.y - 90, '#ff8787');
    if (typeof circleEffect === 'function') circleEffect(game.player.x, game.player.y - 50, '#69db7c');
    markAutoSaveSoon();
    return;
  }

  game.player.attackTime = id === 'strike' ? 0.44 : 0.36;
  game.player.attackKind = id === 'strike' ? 'heavy' : (skill.magic ? 'staff' : 'skill');
  game.player.anim = 'attack';
  game.player.animTime = 0;

  if (skill.projectile) {
    spawnProjectile(skill);
    return;
  }

  if (id === 'strike') {
    hitMonsters({ range: 115, power: 1.65, hits: 1, magic: false });
    if (typeof heavyStrikeEffect === 'function') {
      heavyStrikeEffect(game.player.x, game.player.y, game.player.face, '#ff922b');
    } else if (typeof slashEffect === 'function') {
      slashEffect(game.player.x + game.player.face * 54, game.player.y - 50, game.player.face, '#ff922b', 2.2);
    }
    return;
  }

  hitMonsters(skill);
  if (typeof slashEffect === 'function') {
    slashEffect(
      game.player.x + game.player.face * 44,
      game.player.y - 46,
      game.player.face,
      skill.magic ? '#74c0fc' : '#ffb020',
      skill.power && skill.power > 1.5 ? 1.8 : 1.2
    );
  }
}


/* =========================================================
   PORTAL HARD FIX V2 / SKILL COOLDOWN PATCH
   - Portal transition is handled by a minimal, non-recursive safe path
   - Prevents repeated E keydown from firing multiple transitions
   - stone_throw cooldown = 2.5s
   - first_aid cooldown = 3s
========================================================= */

if (typeof SKILLS !== 'undefined') {
  if (SKILLS.strike) SKILLS.strike.cooldown = 2.5;
  if (SKILLS.stone_throw) SKILLS.stone_throw.cooldown = 2.5;
  if (SKILLS.first_aid) SKILLS.first_aid.cooldown = 3;
}

function __portalNow() {
  return typeof performance !== 'undefined' && performance.now ? performance.now() : Date.now();
}

function __portalText(msg, color) {
  if (typeof makeText === 'function' && game && game.player) {
    makeText(msg, game.player.x, game.player.y - 90, color || '#ffdd99');
  }
}

function __portalStopAllPanels() {
  if (!game) return;
  game.dialog = null;
  game.taxiOpen = false;
  game.shopOpen = false;
  game.shopScroll = 0;
  game.blacksmithOpen = false;
}

function __portalGetTown(id) {
  if (typeof getTown === 'function') return getTown(id || 'lumina');
  return (TOWNS && TOWNS[0]) || { id: 'lumina', name: '루미나', hunt: 'lumina_field', bgTop: '#7bd4ff', bgBottom: '#dff7ff', theme: 'grass' };
}

function __portalGetHunt(id) {
  if (typeof getHunt === 'function') return getHunt(id || 'lumina_field');
  return (HUNTS && (HUNTS[id] || HUNTS.lumina_field)) || { town: 'lumina', name: '루미나 들판', baseLevel: 1, families: ['slime', 'mushroom'] };
}

function __portalFallbackSpawnMonsters(hunt) {
  game.monsters = [];
  const families = hunt && hunt.families && hunt.families.length ? hunt.families : ['slime', 'mushroom'];
  const rows = [
    { y: game.ground, count: 10, start: 520, gap: 330, tier: 0 },
    { y: 520, count: 6, start: 520, gap: 520, tier: 1 },
    { y: 455, count: 5, start: 1160, gap: 560, tier: 2 },
    { y: 390, count: 4, start: 1840, gap: 620, tier: 3 }
  ];

  rows.forEach(function (row) {
    for (let i = 0; i < row.count; i++) {
      const family = families[(i + row.tier) % families.length];
      const type = typeof makeMonsterType === 'function'
        ? makeMonsterType(family, (hunt.baseLevel || 1) + row.tier * 2 + (i % 2))
        : { family, name: family, level: 1, hp: 50, atk: 5, def: 0, exp: 10, gold: 5, drop: 'slime_jelly', dropRate: 0.45, color: '#62df75', shape: 'slime', speed: 20, respawn: 12000 };
      type.respawn = Math.max(type.respawn || 0, 9000);
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

function __portalEnterHunt() {
  const currentTown = __portalGetTown(game.townId || 'lumina');
  const huntId = currentTown.hunt || game.huntId || 'lumina_field';
  const hunt = __portalGetHunt(huntId);
  const huntTown = __portalGetTown(hunt.town || currentTown.id || 'lumina');

  game.mode = 'hunt';
  game.huntId = huntId;
  game.townId = huntTown.id || currentTown.id || 'lumina';
  game.width = 5400;
  game.ground = 610;
  game.npcs = [];
  game.drops = [];
  game.projectiles = [];
  game.particles = [];
  game.dialog = null;
  game.taxiOpen = false;
  game.shopOpen = false;
  game.blacksmithOpen = false;

  game.platforms = [
    { x: 360, y: 520, w: 560, h: 24 },
    { x: 1080, y: 455, w: 540, h: 24 },
    { x: 1760, y: 390, w: 560, h: 24 },
    { x: 2460, y: 325, w: 560, h: 24 },
    { x: 3160, y: 260, w: 560, h: 24 },
    { x: 3860, y: 195, w: 560, h: 24 },
    { x: 4560, y: 130, w: 560, h: 24 }
  ];

  game.portals = [{ x: 110, y: game.ground, type: 'town', label: huntTown.name || '마을' }];

  try {
    if (typeof spawnMonsters === 'function') {
      game.monsters = [];
      spawnMonsters(hunt);
      game.monsters.forEach(function (m) {
        if (m && m.type) m.type.respawn = Math.max(m.type.respawn || 0, 9000);
      });
    } else {
      __portalFallbackSpawnMonsters(hunt);
    }
  } catch (err) {
    console.error('[safe portal spawn failed]', err);
    __portalFallbackSpawnMonsters(hunt);
  }

  game.player.x = 220;
  game.player.y = game.ground;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.grounded = true;
  game.cameraX = 0;
  game.ready = true;
  if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
  __portalText('사냥터 입장', '#c0eb75');
}

function __portalReturnTown() {
  const town = __portalGetTown(game.townId || 'lumina');
  if (typeof loadTown === 'function') {
    try {
      loadTown(town.id || 'lumina');
    } catch (err) {
      console.error('[safe portal loadTown failed]', err);
      game.mode = 'town';
      game.townId = town.id || 'lumina';
      game.huntId = town.hunt || game.huntId || 'lumina_field';
      game.width = 4300;
      game.ground = 560;
      game.platforms = [];
      game.monsters = [];
      game.drops = [];
      game.projectiles = [];
      game.particles = [];
      game.portals = [{ x: 3970, y: game.ground, type: 'hunt', label: '사냥터' }];
      game.npcs = [];
    }
  }
  game.player.x = Math.min(3880, Math.max(260, game.width - 420));
  game.player.y = game.ground;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.grounded = true;
  game.cameraX = typeof clamp === 'function' ? clamp(game.player.x - W * 0.42, 0, Math.max(0, game.width - W)) : 0;
  game.ready = true;
  if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
  __portalText((town.name || '마을') + ' 귀환', '#c0eb75');
}

function interact() {
  if (!game || !game.ready || !game.player) return;

  const now = __portalNow();
  if (game.__portalLockUntil && now < game.__portalLockUntil) return;

  const p = game.player;

  for (const portal of game.portals || []) {
    if (!portal) continue;
    if (Math.abs(p.x - portal.x) < 105 && Math.abs(p.y - portal.y) < 165) {
      game.__portalLockUntil = now + 900;
      __portalStopAllPanels();
      if (typeof stopPlayerMovement === 'function') stopPlayerMovement();

      try {
        if (portal.type === 'hunt') __portalEnterHunt();
        else if (portal.type === 'town') __portalReturnTown();
        else __portalText('알 수 없는 포탈입니다.', '#ffdd99');
      } catch (err) {
        console.error('[portal hard fix failed]', err);
        game.ready = true;
        __portalText('포탈 이동 중 오류가 발생했습니다. 콘솔 오류를 확인해주세요.', '#ff8787');
      }
      return;
    }
  }

  for (const npc of game.npcs || []) {
    if (!npc) continue;
    if (Math.abs(p.x - npc.x) < 90 && Math.abs(p.y - npc.y) < 130) {
      if (typeof stopPlayerMovement === 'function') stopPlayerMovement();
      game.dialog = { npc };
      return;
    }
  }
}

const __portalHardUseSkill = useSkill;
function useSkill(id) {
  const skill = SKILLS[id];
  if (!skill) {
    __portalText('스킬 정보를 찾을 수 없습니다.', '#ff8787');
    return;
  }

  if (!skills.unlocked.includes(id)) {
    __portalText('아직 배운 스킬이 아닙니다.', '#ff8787');
    return;
  }

  if ((skills.cooldowns[id] || 0) > 0) {
    __portalText('쿨타임 중', '#cbd5e1');
    return;
  }

  const mpCost = skill.mp || 0;
  if (game.player.mp < mpCost) {
    __portalText('MP 부족', '#74c0fc');
    return;
  }

  game.player.mp -= mpCost;
  skills.cooldowns[id] = id === 'strike' ? 2.5 : id === 'stone_throw' ? 2.5 : id === 'first_aid' ? 3 : (skill.cooldown || 0.8);

  if (skill.heal) {
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + skill.heal);
    __portalText('+' + skill.heal + ' HP', '#ff8787');
    if (typeof circleEffect === 'function') circleEffect(game.player.x, game.player.y - 50, '#69db7c');
    if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
    return;
  }

  game.player.attackTime = id === 'strike' ? 0.44 : 0.36;
  game.player.attackKind = id === 'strike' ? 'heavy' : (skill.magic ? 'staff' : 'skill');
  game.player.anim = 'attack';
  game.player.animTime = 0;

  if (skill.projectile) {
    if (typeof spawnProjectile === 'function') spawnProjectile(skill);
    else __portalText('발사체 함수를 찾을 수 없습니다.', '#ff8787');
    return;
  }

  if (id === 'strike') {
    if (typeof hitMonsters === 'function') hitMonsters({ range: 115, power: 1.65, hits: 1, magic: false });
    if (typeof heavyStrikeEffect === 'function') heavyStrikeEffect(game.player.x, game.player.y, game.player.face, '#ff922b');
    else if (typeof slashEffect === 'function') slashEffect(game.player.x + game.player.face * 54, game.player.y - 50, game.player.face, '#ff922b', 2.2);
    return;
  }

  if (typeof hitMonsters === 'function') hitMonsters(skill);
  if (typeof slashEffect === 'function') {
    slashEffect(game.player.x + game.player.face * 44, game.player.y - 46, game.player.face, skill.magic ? '#74c0fc' : '#ffb020', skill.power && skill.power > 1.5 ? 1.8 : 1.2);
  }
}


/* =========================================================
   PORTAL / QUEST ELDER / QUEST CANCEL FINAL SAFE PATCH
   - portals ignore quest state and move freely
   - prevents draw/update exceptions from freezing the game loop
   - distinguishes each town elder NPC
   - blocks out-of-order main quests with clear previous NPC guide
   - adds quest cancel button in quest panel
========================================================= */

window.addEventListener('error', function (e) {
  console.error('[runtime error caught]', e.error || e.message);
  if (game) game.ready = true;
  try {
    if (typeof makeText === 'function' && game && game.player) {
      makeText('오류가 발생했지만 게임을 계속 실행합니다. 콘솔을 확인해주세요.', game.player.x, game.player.y - 120, '#ff8787');
    }
  } catch (_) {}
});

window.addEventListener('unhandledrejection', function (e) {
  console.error('[promise error caught]', e.reason);
  if (game) game.ready = true;
});

var __finalSafePreviousLoop = loop;
loop = function (now) {
  const dt = Math.min(0.033, ((now || performance.now()) - game.last) / 1000 || 0.016);
  game.last = now || performance.now();
  try {
    update(dt);
  } catch (err) {
    console.error('[safe update failed]', err);
    game.ready = true;
  }
  try {
    draw();
  } catch (err) {
    console.error('[safe draw failed]', err);
    try {
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText('화면 그리기 오류가 발생했습니다. 콘솔 오류를 확인해주세요.', 80, 120);
      ctx.font = '16px sans-serif';
      ctx.fillText(String(err && (err.message || err)).slice(0, 130), 80, 155);
    } catch (_) {}
  }
  requestAnimationFrame(loop);
};

const TOWN_ELDER_INFO = {
  lumina: { name: '루미나 장로 구름', quest: 'tutorial', text: '루미나의 첫 훈련부터 차근차근 시작해보세요.' },
  greenwood: { name: '그린우드 장로 라온', quest: 'main_greenwood', text: '숲의 도시에서 다음 여정을 준비합시다.' },
  ellenium: { name: '일레니움 현자 이렌', quest: 'main_ellenium', text: '마법 도시의 흐름을 살펴보세요.' },
  valor: { name: '발로란 장로 로한', quest: 'main_valor', text: '요새의 전사들이 도움을 기다립니다.' },
  shadowport: { name: '섀도포트 장로 란', quest: 'main_shadowport', text: '항구의 그림자를 조사해주세요.' },
  sylvania: { name: '실바니아 장로 세리아', quest: 'main_sylvania', text: '숲길 너머의 흔적을 따라가봅시다.' },
  irondeep: { name: '아이언딥 장로 브론', quest: 'main_irondeep', text: '광산 깊은 곳의 이상 현상을 조사해주세요.' },
  frosthall: { name: '프로스트홀 장로 노엘', quest: 'main_frosthall', text: '얼음 마을의 봉인을 확인해야 합니다.' },
  solas: { name: '솔라스 장로 아샤', quest: 'main_solas', text: '사막의 오래된 길을 다시 열어야 합니다.' },
  nocturn: { name: '노크턴 장로 베인', quest: 'main_nocturn', text: '폐허 도시의 마지막 흔적을 확인해주세요.' }
};

const MAIN_QUEST_CHAIN = [
  'tutorial',
  'main_greenwood',
  'main_ellenium',
  'main_valor',
  'main_shadowport',
  'main_sylvania',
  'main_irondeep',
  'main_frosthall',
  'main_solas',
  'main_nocturn'
];

function __ensureTownMainQuestDefinitions() {
  if (!QUESTS) return;
  const defs = {
    main_greenwood: { title: '숲의 도시로', town: 'greenwood', npc: '그린우드 장로 라온', desc: '그린우드 숲에서 버섯 6마리를 처치하세요.', family: 'mushroom', need: 6, rewardGold: 120, rewardExp: 130 },
    main_ellenium: { title: '마법 도시의 빛', town: 'ellenium', npc: '일레니움 현자 이렌', desc: '마나 정령 6마리를 처치하세요.', family: 'mana', need: 6, rewardGold: 150, rewardExp: 160 },
    main_valor: { title: '요새의 시험', town: 'valor', npc: '발로란 장로 로한', desc: '멧돼지 7마리를 처치하세요.', family: 'boar', need: 7, rewardGold: 170, rewardExp: 180 },
    main_shadowport: { title: '항구의 그림자', town: 'shadowport', npc: '섀도포트 장로 란', desc: '그림자 괴물 7마리를 처치하세요.', family: 'shadow', need: 7, rewardGold: 190, rewardExp: 200 },
    main_sylvania: { title: '숲길 정찰', town: 'sylvania', npc: '실바니아 장로 세리아', desc: '숲 벌레 8마리를 처치하세요.', family: 'bug', need: 8, rewardGold: 210, rewardExp: 220 },
    main_irondeep: { title: '광산의 울림', town: 'irondeep', npc: '아이언딥 장로 브론', desc: '광석 골렘 8마리를 처치하세요.', family: 'ore', need: 8, rewardGold: 240, rewardExp: 260 },
    main_frosthall: { title: '얼음 봉인 조사', town: 'frosthall', npc: '프로스트홀 장로 노엘', desc: '얼음 정령 9마리를 처치하세요.', family: 'ice', need: 9, rewardGold: 280, rewardExp: 310 },
    main_solas: { title: '사막길의 흔적', town: 'solas', npc: '솔라스 장로 아샤', desc: '모래 도마뱀 9마리를 처치하세요.', family: 'desert', need: 9, rewardGold: 320, rewardExp: 360 },
    main_nocturn: { title: '폐허의 마지막 빛', town: 'nocturn', npc: '노크턴 장로 베인', desc: '폐허 수호자 10마리를 처치하세요.', family: 'ruin', need: 10, rewardGold: 400, rewardExp: 460 }
  };
  Object.keys(defs).forEach(function (id) {
    if (!QUESTS[id]) {
      const d = defs[id];
      QUESTS[id] = {
        id,
        title: d.title,
        town: d.town,
        npc: d.npc,
        desc: d.desc,
        goals: [{ type: 'kill', family: d.family, need: d.need, count: 0 }],
        rewardGold: d.rewardGold,
        rewardExp: d.rewardExp
      };
    }
  });
}

function __mainQuestPreviousInfo(id) {
  const idx = MAIN_QUEST_CHAIN.indexOf(id);
  if (idx <= 0) return null;
  for (let i = 0; i < idx; i++) {
    const prevId = MAIN_QUEST_CHAIN[i];
    if (!quests.completed.includes(prevId)) {
      const q = QUESTS[prevId];
      return q ? { id: prevId, title: q.title, npc: q.npc || '이전 NPC' } : { id: prevId, title: prevId, npc: '이전 NPC' };
    }
  }
  return null;
}

function __adjustTownElders() {
  __ensureTownMainQuestDefinitions();
  const info = TOWN_ELDER_INFO[game.townId] || TOWN_ELDER_INFO.lumina;
  (game.npcs || []).forEach(function (npc) {
    if (!npc) return;
    if (npc.type === 'quest' || npc.name === '장로 구름' || npc.quest === 'tutorial') {
      npc.type = 'quest';
      npc.name = info.name;
      npc.quest = info.quest;
      npc.text = info.text;
      npc.townId = game.townId;
    }
  });
}

var __finalPrevLoadTown = loadTown;
loadTown = function (townId) {
  __finalPrevLoadTown(townId);
  __adjustTownElders();
};
try { if (game && game.mode === 'town') __adjustTownElders(); } catch (_) {}

function __safeToast(msg, color) {
  try {
    if (typeof makeText === 'function' && game && game.player) makeText(msg, game.player.x, game.player.y - 95, color || '#ffdd99');
  } catch (_) {}
}

function __makeMonsterRows(hunt) {
  const families = hunt && hunt.families && hunt.families.length ? hunt.families : ['slime', 'mushroom'];
  game.monsters = [];
  const rows = [
    { y: game.ground, count: 12, start: 520, gap: 310, tier: 0 },
    { y: 520, count: 8, start: 470, gap: 470, tier: 1 },
    { y: 455, count: 7, start: 1160, gap: 480, tier: 2 },
    { y: 390, count: 6, start: 1840, gap: 520, tier: 3 },
    { y: 325, count: 5, start: 2540, gap: 580, tier: 4 }
  ];
  rows.forEach(function (row) {
    for (let i = 0; i < row.count; i++) {
      const family = families[(i + row.tier) % families.length];
      const type = typeof makeMonsterType === 'function'
        ? makeMonsterType(family, (hunt.baseLevel || 1) + row.tier * 2 + (i % 2))
        : { family, name: family, level: 1, hp: 40, atk: 5, def: 0, exp: 10, gold: 5, drop: 'slime_jelly', dropRate: 0.5, color: '#62df75', shape: 'slime', speed: 22, respawn: 15000 };
      type.respawn = Math.max(12000, type.respawn || 0);
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

function __freeEnterHuntNoQuestCheck() {
  const town = typeof getTown === 'function' ? getTown(game.townId || 'lumina') : (TOWNS[0]);
  const huntId = (town && town.hunt) || game.huntId || 'lumina_field';
  const hunt = typeof getHunt === 'function' ? getHunt(huntId) : (HUNTS[huntId] || HUNTS.lumina_field);

  game.ready = true;
  game.mode = 'hunt';
  game.townId = (hunt && hunt.town) || (town && town.id) || game.townId || 'lumina';
  game.huntId = huntId;
  game.width = 5400;
  game.ground = 610;
  game.dialog = null;
  game.taxiOpen = false;
  game.shopOpen = false;
  game.shopScroll = 0;
  game.blacksmithOpen = false;
  game.npcs = [];
  game.drops = [];
  game.projectiles = [];
  game.particles = [];
  game.platforms = [
    { x: 360, y: 520, w: 560, h: 24 },
    { x: 1080, y: 455, w: 540, h: 24 },
    { x: 1760, y: 390, w: 560, h: 24 },
    { x: 2460, y: 325, w: 560, h: 24 },
    { x: 3160, y: 260, w: 560, h: 24 }
  ];
  game.portals = [{ x: 110, y: game.ground, type: 'town', label: '마을' }];
  __makeMonsterRows(hunt);
  game.player.x = 220;
  game.player.y = game.ground;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.grounded = true;
  game.cameraX = 0;
  __safeToast('사냥터 입장', '#c0eb75');
}

function __freeReturnTownNoQuestCheck() {
  const id = game.townId || ((typeof getHunt === 'function' && getHunt(game.huntId || '').town) || 'lumina');
  try {
    loadTown(id);
  } catch (err) {
    console.error('[return town failed]', err);
    const town = typeof getTown === 'function' ? getTown(id) : TOWNS[0];
    game.mode = 'town';
    game.townId = town.id || 'lumina';
    game.huntId = town.hunt || 'lumina_field';
    game.width = 4300;
    game.ground = 560;
    game.platforms = [];
    game.monsters = [];
    game.drops = [];
    game.projectiles = [];
    game.particles = [];
    game.portals = [{ x: 3970, y: game.ground, type: 'hunt', label: '사냥터' }];
    game.npcs = [];
  }
  game.dialog = null;
  game.player.x = Math.min(3880, Math.max(260, game.width - 420));
  game.player.y = game.ground;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.grounded = true;
  game.cameraX = typeof clamp === 'function' ? clamp(game.player.x - W * 0.42, 0, Math.max(0, game.width - W)) : 0;
  __safeToast('마을 귀환', '#c0eb75');
}

interact = function () {
  if (!game || !game.ready || !game.player) return;
  const now = performance.now();
  if (game.__finalInteractLock && now < game.__finalInteractLock) return;
  const p = game.player;

  for (const portal of game.portals || []) {
    if (!portal) continue;
    if (Math.abs(p.x - portal.x) < 115 && Math.abs(p.y - portal.y) < 180) {
      game.__finalInteractLock = now + 1000;
      try {
        if (typeof stopPlayerMovement === 'function') stopPlayerMovement();
        game.dialog = null;
        game.taxiOpen = false;
        game.shopOpen = false;
        game.blacksmithOpen = false;
        // 포탈은 퀘스트 상태와 완전히 분리해서 자유롭게 이동 가능하게 처리
        if (portal.type === 'hunt') __freeEnterHuntNoQuestCheck();
        else if (portal.type === 'town') __freeReturnTownNoQuestCheck();
        else __safeToast('알 수 없는 포탈입니다.', '#ffdd99');
      } catch (err) {
        console.error('[final portal interact failed]', err);
        game.ready = true;
        __safeToast('포탈 오류가 발생했습니다. 콘솔 오류를 확인해주세요.', '#ff8787');
      }
      return;
    }
  }

  for (const npc of game.npcs || []) {
    if (!npc) continue;
    if (Math.abs(p.x - npc.x) < 90 && Math.abs(p.y - npc.y) < 130) {
      if (typeof stopPlayerMovement === 'function') stopPlayerMovement();
      game.dialog = { npc };
      return;
    }
  }
};

var __finalPreviousAcceptOrCompleteQuest = acceptOrCompleteQuest;
acceptOrCompleteQuest = function (id) {
  __ensureTownMainQuestDefinitions();
  const qBase = QUESTS[id];
  if (!qBase) {
    __safeToast('퀘스트 정보를 찾을 수 없습니다.', '#ff8787');
    return;
  }

  const prev = __mainQuestPreviousInfo(id);
  if (prev) {
    __safeToast('먼저 ' + prev.npc + '에게 가서 ' + prev.title + ' 퀘스트를 완료하고 오세요.', '#ffdd99');
    if (game.dialog && game.dialog.npc) {
      game.dialog.npc.text = '먼저 ' + prev.npc + '에게 가서 [' + prev.title + '] 퀘스트를 완료하고 오세요.';
    }
    return;
  }

  try {
    return __finalPreviousAcceptOrCompleteQuest(id);
  } catch (err) {
    console.error('[quest accept failed - fallback]', err);
    if (quests.completed.includes(id)) {
      __safeToast('이미 완료했습니다.', '#cbd5e1');
      return;
    }
    let q = quests.active.find(function (item) { return item.id === id; });
    if (!q) {
      q = JSON.parse(JSON.stringify(qBase));
      quests.active.push(q);
      __safeToast('퀘스트 수락!', '#ffe066');
      if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
      return;
    }
    if (typeof syncQuestItems === 'function') syncQuestItems(q);
    if (typeof questComplete === 'function' && questComplete(q)) {
      if (typeof completeQuest === 'function') completeQuest(q);
    } else {
      __safeToast('아직 완료 조건이 부족합니다.', '#ffdd99');
    }
  }
};

function cancelQuest(id) {
  const q = quests.active.find(function (item) { return item && item.id === id; });
  if (!q) return;
  quests.active = quests.active.filter(function (item) { return item && item.id !== id; });
  __safeToast('[' + (q.title || id) + '] 퀘스트를 취소했습니다.', '#cbd5e1');
  if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
}

function __getQuestCancelButtonAt(x, y) {
  const panelX = 70;
  const panelY = 105;
  const panelW = 650;
  const panelH = 500;
  if (typeof hit === 'function' && !hit(x, y, panelX, panelY, panelW, panelH)) return null;
  let cy = panelY + 110;
  for (let i = 0; i < quests.active.length; i++) {
    const q = quests.active[i];
    const goals = q && q.goals ? q.goals.length : 0;
    const buttonY = cy - 21;
    if (typeof hit === 'function' && hit(x, y, panelX + panelW - 112, buttonY, 78, 28)) return q.id;
    cy += 24 + 24 + goals * 19 + 26;
  }
  return null;
}

var __finalPreviousDrawQuestsPanel = drawQuestsPanel;
drawQuestsPanel = function () {
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
  ctx.textAlign = 'left';
  ctx.fillText('퀘스트', x + 25, y + 44);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '14px sans-serif';
  ctx.fillText('진행 중인 퀘스트는 오른쪽 취소 버튼으로 포기할 수 있습니다.', x + 25, y + 70);

  let cy = y + 110;
  if (!quests.active.length) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('진행 중인 퀘스트가 없습니다.', x + 25, cy);
    return;
  }

  quests.active.forEach(function (q) {
    if (typeof syncQuestItems === 'function') syncQuestItems(q);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(q.title || q.id, x + 25, cy);

    ctx.fillStyle = '#ef4444';
    roundRect(ctx, x + w - 112, cy - 21, 78, 28, 7);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('취소', x + w - 73, cy - 2);
    ctx.textAlign = 'left';

    cy += 24;
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px sans-serif';
    ctx.fillText(q.desc || '', x + 35, cy);
    cy += 24;
    (q.goals || []).forEach(function (goal) {
      const done = goal.count >= goal.need;
      ctx.fillStyle = done ? '#c0eb75' : '#e2e8f0';
      let label = '';
      if (goal.type === 'kill') label = goal.family + ' 처치';
      else label = ITEMS[goal.itemId] ? ITEMS[goal.itemId].name : goal.itemId;
      ctx.fillText(label + ': ' + goal.count + '/' + goal.need, x + 45, cy);
      cy += 19;
    });
    cy += 26;
  });
};

canvas.addEventListener('click', function (e) {
  if (!game.ready || !quests.open) return;
  const pos = getMouse(e);
  const id = __getQuestCancelButtonAt(pos.x, pos.y);
  if (id) {
    e.preventDefault();
    e.stopPropagation();
    cancelQuest(id);
  }
}, true);

// 현재 저장 데이터가 꼬여서 여러 도시의 기본 tutorial 퀘스트가 이미 들어간 경우를 완화
(function __normalizeExistingTownQuests() {
  __ensureTownMainQuestDefinitions();
  try {
    const seen = new Set();
    quests.active = (quests.active || []).filter(function (q) {
      if (!q || !q.id) return false;
      if (seen.has(q.id)) return false;
      seen.add(q.id);
      return true;
    });
  } catch (_) {}
})();


/* =========================================================
   HUNT AI / PARTICLE CLEANUP / CITY ELDER QUEST FIX PATCH
   - Monster AI keeps updating even if older quest/combat code throws
   - Slash particles and texts now always expire
   - City elders keep their own quest id instead of all showing tutorial
   - Quest cancel button is kept and made safer
   - Stone Throw projectile is drawn as a gray rock
========================================================= */

(function () {
  if (typeof SKILLS !== 'undefined') {
    if (SKILLS.strike) SKILLS.strike.cooldown = 2.5;
    if (SKILLS.stone_throw) SKILLS.stone_throw.cooldown = 2.5;
    if (SKILLS.first_aid) SKILLS.first_aid.cooldown = 3;
  }

  function __safeRand(a, b) {
    if (typeof rand === 'function') return rand(a, b);
    return a + Math.random() * (b - a);
  }

  function __safeClamp(v, a, b) {
    if (typeof clamp === 'function') return clamp(v, a, b);
    return Math.max(a, Math.min(b, v));
  }

  function __toastSafe(text, color) {
    try {
      if (typeof makeText === 'function' && game && game.player) {
        makeText(text, game.player.x, game.player.y - 92, color || '#ffdd99');
      }
    } catch (_) {}
  }

  function __mainOrderFinal() {
    if (typeof MAIN_QUEST_CHAIN !== 'undefined' && Array.isArray(MAIN_QUEST_CHAIN)) return MAIN_QUEST_CHAIN.slice();
    return ['tutorial','main_greenwood','main_ellenium','main_valor','main_shadowport','main_sylvania','main_irondeep','main_frosthall','main_solas','main_nocturn'];
  }

  getMainQuestOrderSafe = function () {
    return __mainOrderFinal();
  };

  function __ensureFinalMainQuests() {
    try {
      if (typeof __ensureTownMainQuestDefinitions === 'function') __ensureTownMainQuestDefinitions();
      __mainOrderFinal().forEach(function (id) {
        if (QUESTS[id]) QUESTS[id].main = true;
      });
      if (QUESTS.tutorial) {
        QUESTS.tutorial.main = true;
        QUESTS.tutorial.town = 'lumina';
        QUESTS.tutorial.npc = QUESTS.tutorial.npc || '루미나 장로 구름';
      }
    } catch (err) {
      console.error('[ensure final quests failed]', err);
    }
  }

  getPreviousMainQuestInfo = function (id) {
    __ensureFinalMainQuests();
    const order = __mainOrderFinal();
    const idx = order.indexOf(id);
    if (idx <= 0) return null;

    for (let i = 0; i < idx; i++) {
      const prevId = order[i];
      if (!quests.completed.includes(prevId)) {
        const q = QUESTS[prevId] || { id: prevId, title: '이전 메인 퀘스트', npc: '이전 NPC' };
        return { id: prevId, title: q.title || prevId, npc: q.npc || '이전 NPC' };
      }
    }
    return null;
  };

  getQuestLockMessage = function (id) {
    const prev = getPreviousMainQuestInfo(id);
    if (!prev) return '이전 메인 퀘스트를 먼저 완료해야 합니다.';
    return '먼저 ' + prev.npc + '에게 가서 [' + prev.title + '] 퀘스트를 완료하고 오세요.';
  };

  isMainQuestLocked = function (id) {
    return !!getPreviousMainQuestInfo(id);
  };

  getCurrentMainQuestId = function () {
    const order = __mainOrderFinal();
    for (let i = 0; i < order.length; i++) {
      if (!quests.completed.includes(order[i])) return order[i];
    }
    return null;
  };

  // Important: a city elder must use its own quest id.
  // The previous version forced every elder to the first incomplete main quest,
  // which made Frosthall show Lumina/tutorial content.
  getDialogQuestId = function (npc) {
    if (!npc) return null;
    if (npc.quest) return npc.quest;
    if (npc.type === 'quest' || npc.name === '장로 구름') return getCurrentMainQuestId();
    return null;
  };

  function __cityElderInfoFinal(townId) {
    const map = {
      lumina: { name: '루미나 장로 구름', quest: 'tutorial', text: '루미나의 첫 훈련부터 차근차근 시작해보세요.' },
      greenwood: { name: '그린우드 장로 라온', quest: 'main_greenwood', text: '숲의 도시에서 다음 여정을 준비합시다.' },
      ellenium: { name: '일레니움 현자 이렌', quest: 'main_ellenium', text: '마법 도시의 흐름을 살펴보세요.' },
      valor: { name: '발로란 장로 로한', quest: 'main_valor', text: '요새의 전사들이 도움을 기다립니다.' },
      shadowport: { name: '섀도포트 장로 란', quest: 'main_shadowport', text: '항구의 그림자를 조사해주세요.' },
      sylvania: { name: '실바니아 장로 세리아', quest: 'main_sylvania', text: '숲길 너머의 흔적을 따라가봅시다.' },
      irondeep: { name: '아이언딥 장로 브론', quest: 'main_irondeep', text: '광산 깊은 곳의 이상 현상을 조사해주세요.' },
      frosthall: { name: '프로스트홀 장로 노엘', quest: 'main_frosthall', text: '얼음 마을의 봉인을 확인해야 합니다.' },
      solas: { name: '솔라스 장로 아샤', quest: 'main_solas', text: '사막의 오래된 길을 다시 열어야 합니다.' },
      nocturn: { name: '노크턴 장로 베인', quest: 'main_nocturn', text: '폐허 도시의 마지막 흔적을 확인해주세요.' }
    };
    return map[townId] || map.lumina;
  }

  function __patchTownElderForCurrentTown() {
    __ensureFinalMainQuests();
    const townId = game && game.townId ? game.townId : 'lumina';
    const info = __cityElderInfoFinal(townId);
    (game.npcs || []).forEach(function (npc) {
      if (!npc) return;
      const isElder = npc.type === 'quest' || npc.quest === 'tutorial' || /장로|현자/.test(npc.name || '');
      if (!isElder) return;
      npc.type = 'quest';
      npc.name = info.name;
      npc.quest = info.quest;
      npc.text = info.text;
      npc.townId = townId;
    });
  }

  const __prevLoadTownFinalFix = loadTown;
  loadTown = function (townId) {
    __prevLoadTownFinalFix(townId);
    __patchTownElderForCurrentTown();
  };
  try { if (game && game.mode === 'town') __patchTownElderForCurrentTown(); } catch (_) {}

  acceptOrCompleteQuest = function (id) {
    __ensureFinalMainQuests();
    const qBase = QUESTS[id];
    if (!qBase) {
      __toastSafe('퀘스트 정보를 찾을 수 없습니다.', '#ff8787');
      return;
    }

    const isMain = qBase.main || __mainOrderFinal().indexOf(id) >= 0;
    if (isMain && isMainQuestLocked(id)) {
      __toastSafe(getQuestLockMessage(id), '#ffdd99');
      if (game.dialog && game.dialog.npc) game.dialog.npc.text = getQuestLockMessage(id);
      return;
    }

    if (quests.completed.includes(id)) {
      __toastSafe('이미 완료했습니다.', '#cbd5e1');
      return;
    }

    let q = quests.active.find(function (item) { return item && item.id === id; });
    if (!q) {
      q = JSON.parse(JSON.stringify(qBase));
      q.main = !!isMain;
      quests.active.push(q);
      __toastSafe('퀘스트 수락!', '#ffe066');
      if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
      return;
    }

    if (typeof syncQuestItems === 'function') syncQuestItems(q);
    if (typeof questComplete === 'function' && questComplete(q)) {
      if (typeof completeQuest === 'function') completeQuest(q);
      if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
    } else {
      __toastSafe('아직 완료 조건이 부족합니다.', '#ffdd99');
    }
  };

  handleDialogClick = function (x, y) {
    if (!game.dialog || !game.dialog.npc) return;
    const npc = game.dialog.npc;
    if (hit(x, y, 970, 620, 120, 40)) {
      game.dialog = null;
      return;
    }
    if (!hit(x, y, 210, 620, 190, 42)) return;

    if (npc.type === 'taxi') { game.dialog = null; game.taxiOpen = true; return; }
    if (npc.type === 'merchant' || npc.type === 'weapon') { game.dialog = null; game.shopOpen = npc.type; game.shopScroll = 0; return; }
    if (npc.type === 'blacksmith') { game.dialog = null; game.blacksmithOpen = true; inventory.open = true; return; }
    if (npc.type === 'quest' || npc.type === 'job' || npc.quest) {
      const questId = getDialogQuestId(npc);
      if (!questId) { __toastSafe('진행할 퀘스트가 없습니다.', '#cbd5e1'); return; }
      acceptOrCompleteQuest(questId);
    }
  };

  drawDialog = function () {
    if (!game.dialog || !game.dialog.npc) return;
    const npc = game.dialog.npc;
    const questId = getDialogQuestId(npc);
    const qBase = questId ? QUESTS[questId] : null;
    const isMain = qBase && (qBase.main || __mainOrderFinal().indexOf(questId) >= 0);
    const locked = !!(qBase && isMain && isMainQuestLocked(questId));

    let text = npc.text || '무엇을 도와드릴까요?';
    if ((npc.type === 'quest' || npc.quest) && qBase) {
      text = locked ? getQuestLockMessage(questId) : '[메인] ' + qBase.title + ': ' + (qBase.desc || '');
    }

    ctx.fillStyle = 'rgba(15,23,42,0.96)';
    roundRect(ctx, 150, 545, 980, 125, 16);
    ctx.strokeStyle = '#93c5fd';
    ctx.strokeRect(150, 545, 980, 125);

    ctx.fillStyle = '#ffe066';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(npc.name || 'NPC', 180, 580);

    ctx.fillStyle = '#e2e8f0';
    ctx.font = '15px sans-serif';
    const lines = typeof wrapDialogText === 'function' ? wrapDialogText(text, 58) : [text];
    lines.slice(0, 2).forEach(function (line, i) { ctx.fillText(line, 180, 608 + i * 20); });

    let action = '확인';
    if (npc.type === 'taxi') action = '이동하기';
    if (npc.type === 'merchant') action = '상점 열기';
    if (npc.type === 'weapon') action = '장비 보기';
    if (npc.type === 'blacksmith') action = '강화하기';
    if (npc.type === 'quest' || npc.type === 'job' || npc.quest) {
      const q = questId ? quests.active.find(function (item) { return item && item.id === questId; }) : null;
      if (locked) action = '이전 퀘스트 필요';
      else if (questId && quests.completed.includes(questId)) action = '완료됨';
      else if (q) {
        if (typeof syncQuestItems === 'function') syncQuestItems(q);
        action = (typeof questComplete === 'function' && questComplete(q)) ? '완료하기' : '진행 중';
      } else action = npc.type === 'job' ? '전직 퀘스트' : '퀘스트 수락';
    }

    ctx.fillStyle = locked ? '#64748b' : '#4dabf7';
    roundRect(ctx, 210, 620, 190, 42, 8);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(action, 305, 647);

    ctx.fillStyle = '#334155';
    roundRect(ctx, 970, 620, 120, 40, 8);
    ctx.fillStyle = '#fff';
    ctx.fillText('닫기', 1030, 646);
  };

  updateMonsters = function (dt) {
    if (!game || game.mode !== 'hunt') return;
    dt = __safeClamp(Number(dt) || 0.016, 0.001, 0.05);
    const p = game.player;

    (game.monsters || []).forEach(function (m) {
      if (!m) return;
      if ((m.hp || 0) <= 0 && !m.dead) {
        if (typeof killMonster === 'function') killMonster(m);
        else m.dead = true;
        return;
      }
      if (m.dead) return;

      m.time = (m.time || 0) + dt;
      m.hit = Math.max(0, (m.hit || 0) - dt);
      m.attackCooldown = Math.max(0, (m.attackCooldown || 0) - dt);

      const dx = p.x - m.x;
      const dist = Math.abs(dx);
      const speed = (m.type && m.type.speed) || 24;
      if (dist < 420) {
        m.face = dx >= 0 ? 1 : -1;
        m.x += m.face * speed * dt;
      } else {
        m.x += Math.sin((m.time || 0) * 1.6) * 18 * dt;
        if (Math.sin((m.time || 0) * 1.6) > 0) m.face = 1;
        else m.face = -1;
      }
      m.x = __safeClamp(m.x, (m.baseX || m.x) - 220, (m.baseX || m.x) + 220);

      const touchX = Math.abs(p.x - m.x) < 48;
      const touchY = Math.abs(p.y - m.y) < 85;
      if (touchX && touchY && (p.invincible || 0) <= 0) {
        const damage = Math.max(1, Math.floor(((m.type && m.type.atk) || 5) - (p.defense || 0) * 0.45));
        p.hp = Math.max(0, p.hp - damage);
        p.invincible = 0.9;
        p.hurtTime = 0.2;
        p.vx = -m.face * 120;
        if (typeof makeText === 'function') makeText('-' + damage, p.x, p.y - 90, '#ff8787');
      }
    });
  };

  updateParticles = function (dt) {
    dt = __safeClamp(Number(dt) || 0.016, 0.001, 0.05);
    game.particles = (game.particles || []).filter(function (p) {
      if (!p) return false;
      if (!Number.isFinite(p.life)) p.life = 0.25;
      p.life -= dt;
      p.x += (p.vx || 0) * dt;
      p.y += (p.vy || 0) * dt;
      return p.life > 0;
    });
    if (game.particles.length > 240) game.particles.splice(0, game.particles.length - 240);
  };

  updateTexts = function (dt) {
    dt = __safeClamp(Number(dt) || 0.016, 0.001, 0.05);
    game.texts = (game.texts || []).filter(function (t) {
      if (!t) return false;
      if (!Number.isFinite(t.life)) t.life = 0.8;
      t.life -= dt;
      t.y += (t.vy || -45) * dt;
      return t.life > 0;
    });
    if (game.texts.length > 80) game.texts.splice(0, game.texts.length - 80);
  };

  updateProjectiles = function (dt) {
    dt = __safeClamp(Number(dt) || 0.016, 0.001, 0.05);
    game.projectiles = (game.projectiles || []).filter(function (p) {
      if (!p) return false;
      p.life -= dt;
      p.x += (p.vx || 0) * dt;
      p.y += (p.vy || 0) * dt;
      (game.monsters || []).forEach(function (m) {
        if (!m || m.dead || (p.hitSet && p.hitSet.has(m.uid))) return;
        if (Math.abs(p.x - m.x) < 44 && Math.abs(p.y - (m.y - 45)) < 62) {
          if (!p.hitSet) p.hitSet = new Set();
          p.hitSet.add(m.uid);
          if (typeof damageMonster === 'function') damageMonster(m, p.skill || { power: 1, range: 250 });
          if (typeof circleEffect === 'function') circleEffect(p.x, p.y, p.color || '#9ca3af');
          p.life = 0;
        }
      });
      return p.life > 0;
    });
  };

  spawnProjectile = function (skill) {
    const p = game.player;
    const isStone = skill && skill.id === 'stone_throw';
    game.projectiles.push({
      x: p.x + p.face * 35,
      y: p.y - 48,
      vx: p.face * (isStone ? 430 : 450),
      vy: isStone ? -22 : 0,
      life: isStone ? 0.95 : 0.85,
      face: p.face,
      kind: isStone ? 'stone' : (skill && skill.magic ? 'magic' : 'skill'),
      skill,
      hitSet: new Set(),
      color: isStone ? '#8b8f97' : (skill && skill.magic ? '#74c0fc' : '#ffd43b')
    });
  };

  drawProjectiles = function () {
    (game.projectiles || []).forEach(function (p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.scale(p.face || 1, 1);
      if (p.kind === 'stone') {
        ctx.shadowColor = '#64748b';
        ctx.shadowBlur = 6;
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.moveTo(-10, -6);
        ctx.lineTo(0, -11);
        ctx.lineTo(11, -5);
        ctx.lineTo(9, 6);
        ctx.lineTo(-3, 10);
        ctx.lineTo(-12, 2);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.ellipse(-3, -3, 4, 2.5, -0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'arrow') {
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(-20, 0); ctx.lineTo(18, 0); ctx.stroke();
        ctx.fillStyle = '#e5e7eb';
        ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(12, -5); ctx.lineTo(12, 5); ctx.closePath(); ctx.fill();
      } else if (p.kind === 'magic') {
        ctx.shadowColor = p.color || '#74c0fc';
        ctx.shadowBlur = 12;
        ctx.fillStyle = p.color || '#74c0fc';
        ctx.beginPath(); ctx.ellipse(0, 0, 15, 10, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff8'; ctx.beginPath(); ctx.ellipse(5, -3, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = p.color || '#ffd43b';
        ctx.beginPath(); ctx.ellipse(0, 0, 14, 7, 0, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    });
  };

  const __drawParticlesOldFinal = drawParticles;
  drawParticles = function () {
    (game.particles || []).forEach(function (p) {
      if (!p || p.life <= 0) return;
      if (p.type === 'slash') {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.scale(p.face || 1, 1);
        ctx.globalAlpha = __safeClamp(p.life * 4, 0, 0.85);
        const power = p.power || 1;
        ctx.strokeStyle = p.color || '#ffe066';
        ctx.lineWidth = 3 + power;
        ctx.beginPath(); ctx.arc(0, 0, 18 + power * 7, -0.8, 0.9); ctx.stroke();
        ctx.strokeStyle = '#fff8';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(3, -2, 11 + power * 5, -0.7, 0.82); ctx.stroke();
        ctx.restore();
      } else if (p.type === 'spark') {
        ctx.save();
        ctx.globalAlpha = __safeClamp(p.life * 3, 0, 0.9);
        ctx.fillStyle = p.color || '#fff';
        circle(ctx, p.x, p.y, 3.2);
        ctx.restore();
      }
    });
  };

  update = function (dt) {
    if (!game.ready) return;
    const tasks = [
      updateCooldowns,
      updateRegen,
      updatePlayer,
      updateMonsters,
      updateProjectiles,
      updateDrops,
      updateParticles,
      updateTexts,
      updateCamera,
      updateAutoSave
    ];
    tasks.forEach(function (fn) {
      try { if (typeof fn === 'function') fn(dt); }
      catch (err) { console.error('[safe subsystem update failed]', fn && fn.name, err); }
    });
  };

  function __questCancelAtFinal(x, y) {
    const panelX = 70, panelY = 105, panelW = 650, panelH = 500;
    if (typeof hit === 'function' && !hit(x, y, panelX, panelY, panelW, panelH)) return null;
    let cy = panelY + 110;
    for (let i = 0; i < (quests.active || []).length; i++) {
      const q = quests.active[i];
      if (typeof hit === 'function' && hit(x, y, panelX + panelW - 112, cy - 21, 78, 28)) return q && q.id;
      cy += 24 + 24 + ((q && q.goals ? q.goals.length : 0) * 19) + 26;
    }
    return null;
  }

  cancelQuest = function (id) {
    const q = (quests.active || []).find(function (item) { return item && item.id === id; });
    if (!q) return;
    quests.active = quests.active.filter(function (item) { return item && item.id !== id; });
    __toastSafe('[' + (q.title || id) + '] 퀘스트를 취소했습니다.', '#cbd5e1');
    if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
  };

  drawQuestsPanel = function () {
    const x = 70, y = 105, w = 650, h = 500;
    ctx.fillStyle = 'rgba(15,23,42,0.96)';
    roundRect(ctx, x, y, w, h, 14);
    ctx.strokeStyle = '#93c5fd'; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#ffe066'; ctx.font = 'bold 25px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('퀘스트', x + 25, y + 44);
    ctx.fillStyle = '#cbd5e1'; ctx.font = '14px sans-serif'; ctx.fillText('진행 중인 퀘스트는 오른쪽 [취소] 버튼으로 없앨 수 있습니다.', x + 25, y + 70);
    let cy = y + 110;
    if (!(quests.active || []).length) { ctx.fillStyle = '#94a3b8'; ctx.fillText('진행 중인 퀘스트가 없습니다.', x + 25, cy); return; }
    (quests.active || []).forEach(function (q) {
      if (!q) return;
      if (typeof syncQuestItems === 'function') syncQuestItems(q);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(q.title || q.id, x + 25, cy);
      ctx.fillStyle = '#ef4444'; roundRect(ctx, x + w - 112, cy - 21, 78, 28, 7);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('취소', x + w - 73, cy - 2);
      ctx.textAlign = 'left'; cy += 24;
      ctx.fillStyle = '#cbd5e1'; ctx.font = '13px sans-serif'; ctx.fillText(q.desc || '', x + 35, cy); cy += 24;
      (q.goals || []).forEach(function (goal) {
        const done = (goal.count || 0) >= (goal.need || 0);
        ctx.fillStyle = done ? '#c0eb75' : '#e2e8f0';
        let label = goal.type === 'kill' ? goal.family + ' 처치' : ((ITEMS[goal.itemId] && ITEMS[goal.itemId].name) || goal.itemId || '목표');
        ctx.fillText(label + ': ' + (goal.count || 0) + '/' + (goal.need || 0), x + 45, cy);
        cy += 19;
      });
      cy += 26;
    });
  };

  canvas.addEventListener('click', function (e) {
    if (!game.ready || !quests.open) return;
    const pos = getMouse(e);
    const id = __questCancelAtFinal(pos.x, pos.y);
    if (id) {
      e.preventDefault();
      e.stopPropagation();
      cancelQuest(id);
    }
  }, true);
})();


/* =========================================================
   MULTIPLAYER CLIENT INTEGRATION PATCH 01
   - Keeps existing single-player features intact
   - Adds Socket.IO presence, profile hover, trade request UI
   - Adds shared monster death/respawn sync when server module is installed
   Required server side: socket.io + multiplayer_server_socketio_module.js
========================================================= */
(function () {
  if (window.__PIXEL_RPG_MULTIPLAYER_PATCH_01__) return;
  window.__PIXEL_RPG_MULTIPLAYER_PATCH_01__ = true;

  const MP = window.PixelRpgMultiplayer = {
    enabled: true,
    connected: false,
    socket: null,
    id: null,
    room: null,
    players: {},
    hoverId: null,
    menuId: null,
    lastSend: 0,
    portalLockUntil: 0,
    lastRoomSend: 0,
    pendingTradeFrom: null,
    chatOpen: false,
    chatMessages: [],
    chatUnread: 0,
    chatInput: null,
    chatBox: null,
    chatLog: null,
    chatHint: null
  };

  function mpSafe(fn, label) {
    try { return fn(); }
    catch (err) { console.error('[multiplayer ' + (label || 'error') + ']', err); return null; }
  }

  function mpPlayerName() {
    const ch = game && game.player && game.player.character ? game.player.character : null;
    return (ch && ch.name) || (currentUser && currentUser.username) || '모험가';
  }

  function mpJobName(job) {
    return (JOBS && JOBS[job] && JOBS[job].name) || job || '초보자';
  }

  function mpRoomId() {
    if (!game) return 'unknown';
    if (game.mode === 'hunt') return 'hunt:' + (game.huntId || (getTown(game.townId || 'lumina').hunt));
    return 'town:' + (game.townId || 'lumina');
  }

  function mpPublicState() {
    const p = game.player;
    const ch = p.character || {};
    return {
      name: mpPlayerName(),
      level: p.level || 1,
      job: ch.job || 'beginner',
      jobName: mpJobName(ch.job || 'beginner'),
      x: Math.round(p.x || 0),
      y: Math.round(p.y || 0),
      face: p.face || 1,
      anim: p.anim || 'idle',
      animTime: p.animTime || 0,
      hp: Math.round(p.hp || 0),
      maxHp: Math.round(p.maxHp || 1),
      townId: game.townId || 'lumina',
      huntId: game.huntId || null,
      mode: game.mode || 'town',
      character: {
        name: ch.name || mpPlayerName(),
        job: ch.job || 'beginner',
        skin: ch.skin || '#ffd6a6',
        hair: ch.hair || '#2b160e',
        hairStyle: ch.hairStyle || 'basic',
        faceStyle: ch.faceStyle || 'normal'
      }
    };
  }

  function mpLoadSocketScript(cb) {
    if (window.io) { cb(); return; }
    const old = document.getElementById('socketio-client-script');
    if (old) { old.addEventListener('load', cb, { once: true }); return; }
    const s = document.createElement('script');
    s.id = 'socketio-client-script';
    s.src = '/socket.io/socket.io.js';
    s.async = true;
    s.onload = cb;
    s.onerror = function () {
      console.warn('[multiplayer] /socket.io/socket.io.js 를 찾지 못했습니다. 서버 모듈 설치 전에는 싱글 플레이로 동작합니다.');
    };
    document.head.appendChild(s);
  }

  function mpConnect() {
    if (!MP.enabled || MP.socket || !game || !game.ready) return;
    mpLoadSocketScript(function () {
      if (!window.io || MP.socket) return;
      MP.socket = window.io({
        transports: ['websocket', 'polling'],
        auth: { token: token || '', name: mpPlayerName() }
      });

      MP.socket.on('connect', function () {
        MP.connected = true;
        MP.id = MP.socket.id;
        mpJoinRoom(true);
        mpToast('멀티 서버 연결됨', '#9bf6ff');
        mpRenderChat();
      });

      MP.socket.on('disconnect', function () {
        MP.connected = false;
        MP.players = {};
        mpRenderChat();
      });

      MP.socket.on('players:snapshot', function (list) {
        MP.players = {};
        (list || []).forEach(function (p) {
          if (p && p.id && p.id !== MP.id) MP.players[p.id] = p;
        });
      });

      MP.socket.on('player:joined', function (p) {
        if (p && p.id && p.id !== MP.id) {
          MP.players[p.id] = p;
          mpToast((p.name || '다른 유저') + ' 입장', '#c0eb75');
        }
      });

      MP.socket.on('player:left', function (id) {
        if (id && MP.players[id]) delete MP.players[id];
      });

      MP.socket.on('player:update', function (p) {
        if (p && p.id && p.id !== MP.id) MP.players[p.id] = Object.assign(MP.players[p.id] || {}, p);
      });

      MP.socket.on('trade:request', function (payload) {
        if (!payload) return;
        MP.pendingTradeFrom = payload;
        mpToast((payload.fromName || '다른 유저') + '님이 거래를 요청했습니다.', '#ffe066');
      });

      MP.socket.on('chat:history', function (payload) {
        if (!payload || payload.room !== mpRoomId()) return;
        MP.chatMessages = Array.isArray(payload.messages) ? payload.messages.slice(-40) : [];
        mpRenderChat();
      });

      MP.socket.on('chat:message', function (msg) {
        if (!msg || msg.room !== mpRoomId()) return;
        MP.chatMessages.push(msg);
        if (MP.chatMessages.length > 40) MP.chatMessages.shift();
        if (!MP.chatOpen) MP.chatUnread += 1;
        mpRenderChat();
      });

      MP.socket.on('monster:snapshot', function (payload) {
        mpApplyMonsterSnapshot(payload);
      });

      MP.socket.on('monster:update', function (payload) {
        mpApplyMonsterUpdate(payload);
      });

      MP.socket.on('monster:killed', function (payload) {
        mpApplyMonsterKilled(payload);
      });

      MP.socket.on('monster:respawn', function (payload) {
        mpApplyMonsterRespawn(payload);
      });
    });
  }

  function mpToast(text, color) {
    if (typeof makeText === 'function' && game && game.player && game.ready) {
      makeText(text, game.player.x, game.player.y - 120, color || '#fff');
    } else {
      console.log('[multiplayer]', text);
    }
  }

  function mpJoinRoom(force) {
    if (!MP.socket || !MP.connected || !game || !game.ready) return;
    const room = mpRoomId();
    const now = performance.now();
    if (!force && MP.room === room && now - MP.lastRoomSend < 700) return;
    if (MP.room !== room) { MP.chatMessages = []; MP.chatUnread = 0; }
    MP.room = room;
    MP.lastRoomSend = now;
    MP.socket.emit('room:join', { room, state: mpPublicState() });
    mpSyncLocalMonsterIds();
    if (game.mode === 'hunt') {
      MP.socket.emit('monster:seed', { room, huntId: game.huntId, monsters: mpMonsterSeed() });
    }
  }

  function mpSendState(force) {
    if (!MP.socket || !MP.connected || !game || !game.ready) return;
    const now = performance.now();
    if (!force && now - MP.lastSend < 100) return;
    MP.lastSend = now;
    MP.socket.emit('player:update', { room: mpRoomId(), state: mpPublicState() });
  }

  function mpSyncLocalMonsterIds() {
    if (!game || !Array.isArray(game.monsters)) return;
    game.monsters.forEach(function (m, i) {
      if (!m) return;
      if (!m.sharedId) m.sharedId = (game.huntId || 'hunt') + ':' + i;
      m.sharedIndex = i;
    });
  }

  function mpMonsterSeed() {
    mpSyncLocalMonsterIds();
    return (game.monsters || []).map(function (m, i) {
      return {
        id: m.sharedId || ((game.huntId || 'hunt') + ':' + i),
        index: i,
        family: m.type && m.type.family,
        name: m.type && m.type.name,
        level: m.type && m.type.level,
        x: Math.round(m.x || 0),
        y: Math.round(m.y || 0),
        baseX: Math.round(m.baseX || m.x || 0),
        spawnY: Math.round(m.spawnY || m.y || 0),
        hp: Math.max(0, Math.round(m.hp || 0)),
        maxHp: Math.max(1, Math.round(m.maxHp || (m.type && m.type.hp) || 1)),
        dead: !!m.dead,
        respawn: (m.type && m.type.respawn) || 12000
      };
    });
  }

  function mpFindMonster(id, index) {
    if (!game || !Array.isArray(game.monsters)) return null;
    return game.monsters.find(function (m) { return m && m.sharedId === id; }) || game.monsters[index] || null;
  }

  function mpApplyMonsterSnapshot(payload) {
    if (!payload || payload.room !== mpRoomId() || game.mode !== 'hunt') return;
    mpSyncLocalMonsterIds();
    (payload.monsters || []).forEach(function (s) {
      const m = mpFindMonster(s.id, s.index);
      if (!m) return;
      m.sharedId = s.id;
      m.hp = Math.max(0, Number(s.hp) || 0);
      m.maxHp = Math.max(1, Number(s.maxHp) || m.maxHp || 1);
      m.dead = !!s.dead;
      if (Number.isFinite(s.x)) m.x = s.x;
      if (Number.isFinite(s.y)) m.y = s.y;
    });
  }

  function mpApplyMonsterUpdate(payload) {
    if (!payload || payload.room !== mpRoomId() || game.mode !== 'hunt') return;
    const m = mpFindMonster(payload.id, payload.index);
    if (!m) return;
    m.sharedId = payload.id || m.sharedId;
    if (Number.isFinite(payload.hp)) m.hp = Math.max(0, payload.hp);
    if (Number.isFinite(payload.x)) m.x = payload.x;
    if (Number.isFinite(payload.y)) m.y = payload.y;
    if (payload.dead) m.dead = true;
  }

  function mpApplyMonsterKilled(payload) {
    if (!payload || payload.room !== mpRoomId() || game.mode !== 'hunt') return;
    const m = mpFindMonster(payload.id, payload.index);
    if (!m) return;
    if (!m.dead) {
      m.dead = true;
      m.hp = 0;
      if (typeof makeText === 'function') makeText('다른 유저가 처치', m.x, m.y - 100, '#cbd5e1');
    }
  }

  function mpApplyMonsterRespawn(payload) {
    if (!payload || payload.room !== mpRoomId() || game.mode !== 'hunt') return;
    const m = mpFindMonster(payload.id, payload.index);
    if (!m) return;
    m.dead = false;
    m.hp = m.maxHp || (m.type && m.type.hp) || 1;
    m.x = Number.isFinite(payload.x) ? payload.x : ((m.baseX || m.x) + (Math.random() * 80 - 40));
    m.y = Number.isFinite(payload.y) ? payload.y : (m.spawnY || m.y);
    m.hit = 0;
  }

  function mpDrawRemotePlayers() {
    if (!game || !game.ready) return;
    const list = Object.values(MP.players || {}).filter(function (p) {
      return p && p.room === mpRoomId() && p.state;
    });
    if (!list.length) return;

    ctx.save();
    ctx.translate(-Math.floor(game.cameraX || 0), 0);
    list.forEach(function (entry) {
      const s = entry.state;
      const fake = {
        x: s.x,
        y: s.y,
        face: s.face || 1,
        anim: s.anim || 'idle',
        animTime: s.animTime || 0,
        hurtTime: 0,
        attackKind: 'fist',
        character: Object.assign({ name: entry.name || s.name || '유저', job: s.job || 'beginner', skin: '#ffd6a6', hair: '#2b160e', hairStyle: 'basic', faceStyle: 'normal' }, s.character || {})
      };
      ctx.globalAlpha = 0.92;
      if (typeof drawPlayer === 'function') drawPlayer(fake, fake.x, fake.y, 0.74);
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#dbeafe';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((s.name || entry.name || '유저') + ' Lv.' + (s.level || 1), fake.x, fake.y - 142);
    });
    ctx.restore();
  }

  function mpDrawHoverProfile() {
    const id = MP.hoverId;
    if (!id || !MP.players[id] || !game.mouse) return;
    const entry = MP.players[id];
    const s = entry.state || {};
    const x = Math.min(W - 230, Math.max(10, game.mouse.x + 16));
    const y = Math.min(H - 120, Math.max(10, game.mouse.y + 16));
    ctx.save();
    ctx.fillStyle = 'rgba(15,23,42,0.96)';
    roundRect(ctx, x, y, 220, 104, 10);
    ctx.strokeStyle = '#93c5fd'; ctx.strokeRect(x, y, 220, 104);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(s.name || entry.name || '유저', x + 14, y + 25);
    ctx.fillStyle = '#cbd5e1'; ctx.font = '13px sans-serif';
    ctx.fillText('레벨: ' + (s.level || 1), x + 14, y + 48);
    ctx.fillText('직업: ' + (s.jobName || mpJobName(s.job || 'beginner')), x + 14, y + 68);
    ctx.fillStyle = '#ffe066'; ctx.font = 'bold 12px sans-serif';
    ctx.fillText('클릭: 거래 요청', x + 14, y + 90);
    ctx.restore();
  }

  function mpUpdateHover() {
    MP.hoverId = null;
    if (!game || !game.mouse) return;
    const mx = game.mouse.x + (game.cameraX || 0);
    const my = game.mouse.y;
    Object.keys(MP.players).forEach(function (id) {
      const s = MP.players[id] && MP.players[id].state;
      if (!s) return;
      if (s.room && s.room !== mpRoomId()) return;
      if (Math.abs(mx - s.x) < 42 && Math.abs(my - s.y + 55) < 105) MP.hoverId = id;
    });
  }


  function mpEnsureChatUi() {
    if (MP.chatBox && MP.chatInput && MP.chatLog) return;

    const style = document.createElement('style');
    style.id = 'pixel-rpg-chat-style';
    style.textContent = `
      #pixel-rpg-chat-box {
        position: fixed;
        left: 14px;
        bottom: 14px;
        width: 380px;
        max-width: calc(100vw - 28px);
        z-index: 9999;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        color: #fff;
        pointer-events: none;
      }
      #pixel-rpg-chat-log {
        height: 145px;
        overflow: hidden;
        padding: 10px 12px;
        border-radius: 12px;
        background: rgba(15, 23, 42, 0.72);
        border: 1px solid rgba(148, 163, 184, 0.45);
        box-shadow: 0 10px 30px rgba(0,0,0,0.25);
        font-size: 13px;
        line-height: 1.35;
      }
      #pixel-rpg-chat-log .chat-row { margin: 0 0 4px 0; word-break: break-word; }
      #pixel-rpg-chat-log .chat-name { color: #93c5fd; font-weight: 800; }
      #pixel-rpg-chat-log .chat-meta { color: #cbd5e1; font-size: 11px; margin-left: 3px; }
      #pixel-rpg-chat-log .chat-self .chat-name { color: #facc15; }
      #pixel-rpg-chat-input {
        display: none;
        width: 100%;
        box-sizing: border-box;
        margin-top: 8px;
        padding: 10px 12px;
        border-radius: 10px;
        border: 1px solid rgba(147,197,253,0.9);
        outline: none;
        background: rgba(15, 23, 42, 0.96);
        color: #fff;
        font-size: 14px;
        pointer-events: auto;
      }
      #pixel-rpg-chat-hint {
        margin-top: 6px;
        color: #dbeafe;
        font-size: 12px;
        text-shadow: 0 1px 3px rgba(0,0,0,0.65);
      }
      #pixel-rpg-chat-box.open #pixel-rpg-chat-input { display: block; }
      #pixel-rpg-chat-box.open { pointer-events: auto; }
    `;
    if (!document.getElementById(style.id)) document.head.appendChild(style);

    const box = document.createElement('div');
    box.id = 'pixel-rpg-chat-box';
    box.innerHTML = `
      <div id="pixel-rpg-chat-log"></div>
      <input id="pixel-rpg-chat-input" maxlength="120" autocomplete="off" placeholder="채팅 입력 후 Enter / 닫기 Esc" />
      <div id="pixel-rpg-chat-hint">Enter: 채팅 열기 · 같은 마을/사냥터 유저에게만 보임</div>
    `;
    document.body.appendChild(box);
    MP.chatBox = box;
    MP.chatLog = box.querySelector('#pixel-rpg-chat-log');
    MP.chatInput = box.querySelector('#pixel-rpg-chat-input');
    MP.chatHint = box.querySelector('#pixel-rpg-chat-hint');

    MP.chatInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        mpSendChat(MP.chatInput.value);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        mpCloseChat();
      }
    });

    mpRenderChat();
  }

  function mpEscapeHtml(text) {
    return String(text || '').replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }

  function mpRenderChat() {
    mpEnsureChatUi();
    const rows = MP.chatMessages.slice(-8).map(function (msg) {
      const mine = msg.from && msg.from === MP.id;
      const name = mpEscapeHtml(msg.name || '모험가');
      const text = mpEscapeHtml(msg.text || '');
      const meta = 'Lv.' + (msg.level || 1) + ' ' + mpEscapeHtml(msg.jobName || '초보자');
      return '<div class="chat-row ' + (mine ? 'chat-self' : '') + '"><span class="chat-name">' + name + '</span><span class="chat-meta">' + meta + '</span> : ' + text + '</div>';
    }).join('');
    MP.chatLog.innerHTML = rows || '<div class="chat-row"><span class="chat-meta">아직 채팅이 없습니다.</span></div>';
    if (MP.chatHint) {
      const status = MP.connected ? '온라인' : '오프라인';
      const unread = MP.chatUnread > 0 ? ' · 새 메시지 ' + MP.chatUnread : '';
      MP.chatHint.textContent = 'Enter: 채팅 열기 · ' + status + ' · 현재 채널 ' + mpRoomId() + unread;
    }
  }

  function mpOpenChat() {
    mpEnsureChatUi();
    MP.chatOpen = true;
    MP.chatUnread = 0;
    MP.chatBox.classList.add('open');
    MP.chatInput.focus();
    mpRenderChat();
  }

  function mpCloseChat() {
    if (!MP.chatBox || !MP.chatInput) return;
    MP.chatOpen = false;
    MP.chatBox.classList.remove('open');
    MP.chatInput.value = '';
    MP.chatInput.blur();
    if (canvas && canvas.focus) canvas.focus();
    mpRenderChat();
  }

  function mpSendChat(text) {
    const msg = String(text || '').trim();
    if (!msg) { mpCloseChat(); return; }
    if (!MP.socket || !MP.connected) {
      mpToast('멀티 서버 연결 후 채팅할 수 있습니다.', '#ffdd99');
      return;
    }
    MP.socket.emit('chat:send', { room: mpRoomId(), text: msg });
    MP.chatInput.value = '';
  }

  window.addEventListener('keydown', function (e) {
    if (!game || !game.ready) return;
    const target = e.target;
    const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
    if (MP.chatOpen) {
      if (target === MP.chatInput) return;
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    if (e.key === 'Enter' && !typing && !game.dialog && !game.taxiOpen && !game.shopOpen && !game.blacksmithOpen) {
      e.preventDefault();
      e.stopPropagation();
      mpOpenChat();
    }
  }, true);

  function mpRequestTrade(id) {
    if (!id || !MP.socket || !MP.connected || !MP.players[id]) return;
    MP.socket.emit('trade:request', { to: id, fromName: mpPlayerName() });
    mpToast((MP.players[id].name || '상대') + '에게 거래 요청을 보냈습니다.', '#ffe066');
  }

  const __mpOldStartGame = typeof startGame === 'function' ? startGame : null;
  if (__mpOldStartGame) {
    startGame = function (save) {
      const ret = __mpOldStartGame.apply(this, arguments);
      setTimeout(function () { mpConnect(); mpJoinRoom(true); mpSendState(true); }, 80);
      return ret;
    };
  }

  const __mpOldLoadTown = typeof loadTown === 'function' ? loadTown : null;
  if (__mpOldLoadTown) {
    loadTown = function (townId) {
      const ret = __mpOldLoadTown.apply(this, arguments);
      MP.players = {};
      setTimeout(function () { mpJoinRoom(true); mpSendState(true); }, 60);
      return ret;
    };
  }

  const __mpOldLoadHunt = typeof loadHunt === 'function' ? loadHunt : null;
  if (__mpOldLoadHunt) {
    loadHunt = function (huntId) {
      const ret = __mpOldLoadHunt.apply(this, arguments);
      mpSyncLocalMonsterIds();
      MP.players = {};
      setTimeout(function () { mpJoinRoom(true); mpSendState(true); }, 60);
      return ret;
    };
  }

  const __mpOldDamageMonster = typeof damageMonster === 'function' ? damageMonster : null;
  if (__mpOldDamageMonster) {
    damageMonster = function (m, skill) {
      const beforeDead = !!(m && m.dead);
      const ret = __mpOldDamageMonster.apply(this, arguments);
      if (MP.socket && MP.connected && game.mode === 'hunt' && m && m.sharedId) {
        MP.socket.emit('monster:update', {
          room: mpRoomId(),
          id: m.sharedId,
          index: m.sharedIndex,
          hp: Math.max(0, Math.round(m.hp || 0)),
          maxHp: Math.max(1, Math.round(m.maxHp || 1)),
          x: Math.round(m.x || 0),
          y: Math.round(m.y || 0),
          dead: !!m.dead,
          by: mpPlayerName()
        });
        if (!beforeDead && m.dead) {
          MP.socket.emit('monster:killed', {
            room: mpRoomId(),
            id: m.sharedId,
            index: m.sharedIndex,
            hp: 0,
            maxHp: Math.max(1, Math.round(m.maxHp || 1)),
            x: Math.round(m.x || 0),
            y: Math.round(m.y || 0),
            respawn: (m.type && m.type.respawn) || 12000,
            by: mpPlayerName()
          });
        }
      }
      return ret;
    };
  }

  const __mpOldKillMonster = typeof killMonster === 'function' ? killMonster : null;
  if (__mpOldKillMonster) {
    killMonster = function (m) {
      const already = !!(m && m.dead);
      const ret = __mpOldKillMonster.apply(this, arguments);
      if (!already && MP.socket && MP.connected && game.mode === 'hunt' && m && m.sharedId) {
        MP.socket.emit('monster:killed', {
          room: mpRoomId(),
          id: m.sharedId,
          index: m.sharedIndex,
          hp: 0,
          maxHp: Math.max(1, Math.round(m.maxHp || 1)),
          x: Math.round(m.x || 0),
          y: Math.round(m.y || 0),
          respawn: (m.type && m.type.respawn) || 12000,
          by: mpPlayerName()
        });
      }
      return ret;
    };
  }

  const __mpOldUpdate = typeof update === 'function' ? update : null;
  if (__mpOldUpdate) {
    update = function (dt) {
      const ret = __mpOldUpdate.apply(this, arguments);
      if (game && game.ready) {
        mpJoinRoom(false);
        mpSendState(false);
      }
      return ret;
    };
  }

  const __mpOldDraw = typeof draw === 'function' ? draw : null;
  if (__mpOldDraw) {
    draw = function () {
      const ret = __mpOldDraw.apply(this, arguments);
      if (game && game.ready) {
        mpUpdateHover();
        mpDrawRemotePlayers();
        mpDrawHoverProfile();
      }
      return ret;
    };
  }

  canvas.addEventListener('click', function (e) {
    if (!game || !game.ready || !MP.hoverId) return;
    const pos = getMouse(e);
    const entry = MP.players[MP.hoverId];
    const s = entry && entry.state;
    if (!s) return;
    const worldX = pos.x + (game.cameraX || 0);
    if (Math.abs(worldX - s.x) < 45 && Math.abs(pos.y - s.y + 55) < 110) {
      e.preventDefault();
      e.stopPropagation();
      mpRequestTrade(MP.hoverId);
    }
  }, true);

  window.addEventListener('beforeunload', function () {
    if (MP.socket) MP.socket.emit('player:leave', { room: mpRoomId() });
  });

  setTimeout(function () {
    mpEnsureChatUi();
    if (game && game.ready) mpConnect();
  }, 600);
})();

/* =========================================================
   ONLINE MONSTER AI / GIMMICK PATCH 01
   - Stops multiplayer position jitter by using local smooth AI movement
   - Adds charge, ranged attack, and split monster gimmicks
   - Adds enemy projectiles and safe cleanup
========================================================= */
(function () {
  if (window.__PIXEL_RPG_MONSTER_GIMMICK_PATCH_01__) return;
  window.__PIXEL_RPG_MONSTER_GIMMICK_PATCH_01__ = true;

  function safeNum(v, fallback) {
    return Number.isFinite(v) ? v : fallback;
  }

  function monsterGimmickFor(type) {
    const fam = type && type.family;
    const lv = (type && type.level) || 1;
    if (fam === 'boar' || fam === 'desert') return 'charge';
    if (fam === 'mana' || fam === 'ice' || fam === 'ruin') return 'ranged';
    if (fam === 'slime' && lv >= 3) return 'split';
    if (fam === 'shadow') return lv >= 12 ? 'ranged' : 'charge';
    return 'normal';
  }

  function setupMonsterAI(m, i) {
    if (!m || !m.type) return;
    if (!m.uid) m.uid = Math.random().toString(36).slice(2);
    if (!m.sharedId && typeof game !== 'undefined') m.sharedId = (game.huntId || 'hunt') + ':' + (Number.isFinite(i) ? i : 0);
    if (!Number.isFinite(m.sharedIndex)) m.sharedIndex = Number.isFinite(i) ? i : 0;
    m.type.gimmick = m.type.gimmick || monsterGimmickFor(m.type);
    m.aiKind = m.aiKind || m.type.gimmick || 'normal';
    m.baseX = safeNum(m.baseX, m.x || 0);
    m.spawnY = safeNum(m.spawnY, m.y || 0);
    m.patrolDir = m.patrolDir || (Math.random() < 0.5 ? -1 : 1);
    m.aiCooldown = safeNum(m.aiCooldown, 0.8 + Math.random() * 1.8);
    m.chargeState = m.chargeState || 'idle';
    m.chargeTimer = safeNum(m.chargeTimer, 0);
  }

  const oldMakeMonsterType = typeof makeMonsterType === 'function' ? makeMonsterType : null;
  if (oldMakeMonsterType) {
    makeMonsterType = function (family, level) {
      const type = oldMakeMonsterType.apply(this, arguments);
      if (type) {
        type.gimmick = monsterGimmickFor(type);
        if (type.gimmick === 'charge') {
          type.speed = Math.max(type.speed || 30, 42 + (type.level || 1) * 1.2);
          type.chargeSpeed = 420 + Math.min(180, (type.level || 1) * 5);
        }
        if (type.gimmick === 'ranged') {
          type.projectileSpeed = 260 + Math.min(140, (type.level || 1) * 3);
          type.projectileCooldown = 2.0 + Math.random() * 0.8;
        }
        if (type.gimmick === 'split') {
          type.splitCount = 2;
        }
      }
      return type;
    };
  }

  const oldSpawnMonsters = typeof spawnMonsters === 'function' ? spawnMonsters : null;
  if (oldSpawnMonsters) {
    spawnMonsters = function () {
      const ret = oldSpawnMonsters.apply(this, arguments);
      if (game && Array.isArray(game.monsters)) game.monsters.forEach(setupMonsterAI);
      return ret;
    };
  }

  function hurtPlayerFromMonster(amount, sourceX) {
    const p = game.player;
    if (!p || p.invincible > 0) return;
    const damage = Math.max(1, Math.floor(amount - p.defense * 0.45));
    p.hp = Math.max(0, p.hp - damage);
    p.invincible = 0.9;
    p.hurtTime = 0.22;
    p.vx = (p.x < sourceX ? -1 : 1) * 150;
    makeText('-' + damage, p.x, p.y - 90, '#ff8787');
  }

  function spawnEnemyProjectile(m) {
    if (!game.enemyProjectiles) game.enemyProjectiles = [];
    const face = m.face || (game.player.x > m.x ? 1 : -1);
    const fam = m.type.family;
    const color = fam === 'ice' ? '#a5f3fc' : fam === 'ruin' ? '#a78bfa' : '#74c0fc';
    game.enemyProjectiles.push({
      x: m.x + face * 24,
      y: m.y - 44,
      vx: face * ((m.type && m.type.projectileSpeed) || 280),
      vy: fam === 'ruin' ? -30 : 0,
      life: 2.0,
      face,
      kind: fam === 'ice' ? 'iceShard' : fam === 'ruin' ? 'ruinBolt' : 'manaBolt',
      color,
      damage: (m.type && m.type.atk) || 8,
      from: m.uid
    });
    circleEffect(m.x + face * 18, m.y - 48, color);
  }

  function updateEnemyProjectiles(dt) {
    if (!game.enemyProjectiles) game.enemyProjectiles = [];
    const p = game.player;
    game.enemyProjectiles.forEach(function (b) {
      b.life -= dt;
      b.vy = (b.vy || 0) + (b.kind === 'ruinBolt' ? 85 : 0) * dt;
      b.x += b.vx * dt;
      b.y += (b.vy || 0) * dt;
      if (p && p.invincible <= 0 && Math.abs(b.x - p.x) < 28 && Math.abs(b.y - (p.y - 48)) < 42) {
        hurtPlayerFromMonster(b.damage || 8, b.x);
        circleEffect(b.x, b.y, b.color || '#74c0fc');
        b.life = 0;
      }
    });
    game.enemyProjectiles = game.enemyProjectiles.filter(function (b) {
      return b.life > 0 && b.x > -200 && b.x < game.width + 200 && b.y < H + 80;
    });
  }

  const oldUpdateProjectiles = typeof updateProjectiles === 'function' ? updateProjectiles : null;
  if (oldUpdateProjectiles) {
    updateProjectiles = function (dt) {
      oldUpdateProjectiles.apply(this, arguments);
      if (game && game.mode === 'hunt') updateEnemyProjectiles(dt);
      else if (game) game.enemyProjectiles = [];
    };
  }

  const oldDrawProjectiles = typeof drawProjectiles === 'function' ? drawProjectiles : null;
  if (oldDrawProjectiles) {
    drawProjectiles = function () {
      oldDrawProjectiles.apply(this, arguments);
      if (!game || !Array.isArray(game.enemyProjectiles)) return;
      game.enemyProjectiles.forEach(function (b) {
        ctx.save();
        ctx.translate(b.x, b.y);
        ctx.scale(b.face || 1, 1);
        ctx.shadowColor = b.color || '#74c0fc';
        ctx.shadowBlur = 10;
        if (b.kind === 'iceShard') {
          ctx.fillStyle = '#dffcff';
          ctx.beginPath();
          ctx.moveTo(16, 0); ctx.lineTo(-7, -8); ctx.lineTo(-2, 0); ctx.lineTo(-7, 8);
          ctx.closePath(); ctx.fill();
          ctx.strokeStyle = '#67e8f9'; ctx.stroke();
        } else if (b.kind === 'ruinBolt') {
          ctx.fillStyle = '#a78bfa';
          roundRect(ctx, -9, -9, 18, 18, 4);
          ctx.fillStyle = '#fff8'; ctx.fillRect(-3, -3, 6, 6);
        } else {
          ctx.fillStyle = b.color || '#74c0fc';
          ctx.beginPath(); ctx.ellipse(0, 0, 13, 8, 0, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#fff8'; ctx.beginPath(); ctx.ellipse(4, -3, 4, 2, 0, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
      });
    };
  }

  function moveMonsterNormally(m, dt, dx, dist, dy) {
    const chase = dist < 430 && dy < 130;
    if (chase) {
      const targetFace = dx > 0 ? 1 : -1;
      m.face = targetFace;
      m.x += m.face * (m.type.speed || 32) * dt;
    } else {
      if (m.x < m.baseX - 220) m.patrolDir = 1;
      if (m.x > m.baseX + 220) m.patrolDir = -1;
      m.x += m.patrolDir * (18 + Math.sin(m.time * 1.3) * 5) * dt;
      m.face = m.patrolDir;
    }
    m.x = clamp(m.x, m.baseX - 240, m.baseX + 240);
  }

  function updateChargeMonster(m, dt, dx, dist, dy) {
    if (m.chargeState === 'windup') {
      m.chargeTimer -= dt;
      if (m.chargeTimer <= 0) {
        m.chargeState = 'dash';
        m.chargeTimer = 0.55;
        m.vx = (m.face || 1) * ((m.type && m.type.chargeSpeed) || 460);
        makeText('돌진!', m.x, m.y - 95, '#fbbf24');
      }
      return;
    }

    if (m.chargeState === 'dash') {
      m.chargeTimer -= dt;
      m.x += (m.vx || 0) * dt;
      if (Math.abs(game.player.x - m.x) < 58 && Math.abs(game.player.y - m.y) < 90) {
        hurtPlayerFromMonster((m.type.atk || 8) * 1.45, m.x);
      }
      if (m.chargeTimer <= 0 || m.x < m.baseX - 260 || m.x > m.baseX + 260) {
        m.chargeState = 'idle';
        m.aiCooldown = 2.2 + Math.random() * 1.0;
        m.vx = 0;
      }
      m.x = clamp(m.x, m.baseX - 270, m.baseX + 270);
      return;
    }

    if (m.aiCooldown <= 0 && dist < 470 && dy < 90) {
      m.face = dx > 0 ? 1 : -1;
      m.chargeState = 'windup';
      m.chargeTimer = 0.38;
      for (let i = 0; i < 7; i++) {
        game.particles.push({ x: m.x - m.face * rand(6, 22), y: m.y - rand(5, 25), vx: -m.face * rand(35, 90), vy: rand(-40, 10), life: 0.35, color: '#d6a15d' });
      }
      return;
    }

    moveMonsterNormally(m, dt, dx, dist, dy);
  }

  function updateRangedMonster(m, dt, dx, dist, dy) {
    if (dist < 560 && dy < 135) {
      m.face = dx > 0 ? 1 : -1;
      if (m.aiCooldown <= 0) {
        spawnEnemyProjectile(m);
        m.aiCooldown = (m.type.projectileCooldown || 2.2) + Math.random() * 0.5;
      }
      if (dist < 220) m.x -= m.face * (m.type.speed || 26) * 0.55 * dt;
      else if (dist > 360) m.x += m.face * (m.type.speed || 26) * 0.45 * dt;
      else m.x += Math.sin(m.time * 2) * 12 * dt;
      m.x = clamp(m.x, m.baseX - 240, m.baseX + 240);
      return;
    }
    moveMonsterNormally(m, dt, dx, dist, dy);
  }

  function updateContactDamage(m) {
    const touchX = Math.abs(game.player.x - m.x) < 48;
    const touchY = Math.abs(game.player.y - m.y) < 85;
    if (touchX && touchY) hurtPlayerFromMonster(m.type.atk || 5, m.x);
  }

  updateMonsters = function (dt) {
    if (!game || game.mode !== 'hunt') return;
    if (!Array.isArray(game.monsters)) game.monsters = [];

    game.monsters.forEach(function (m, i) {
      if (!m) return;
      setupMonsterAI(m, i);
      if (m.dead) return;
      if ((m.hp || 0) <= 0) { killMonster(m); return; }

      m.time = (m.time || 0) + dt;
      m.hit = Math.max(0, (m.hit || 0) - dt);
      m.attackCooldown = Math.max(0, (m.attackCooldown || 0) - dt);
      m.aiCooldown = Math.max(0, (m.aiCooldown || 0) - dt);

      const dx = game.player.x - m.x;
      const dist = Math.abs(dx);
      const dy = Math.abs(game.player.y - m.y);

      if (m.aiKind === 'charge') updateChargeMonster(m, dt, dx, dist, dy);
      else if (m.aiKind === 'ranged') updateRangedMonster(m, dt, dx, dist, dy);
      else moveMonsterNormally(m, dt, dx, dist, dy);

      updateContactDamage(m);
    });
  };

  const oldKillMonster = typeof killMonster === 'function' ? killMonster : null;
  if (oldKillMonster) {
    killMonster = function (m) {
      if (m && !m.dead && m.aiKind === 'split' && !m.splitChild && !m._splitSpawned && game && Array.isArray(game.monsters)) {
        m._splitSpawned = true;
        for (let i = 0; i < 2; i++) {
          const t = makeMonsterType('slime', Math.max(1, ((m.type && m.type.level) || 1) - 1));
          t.name = '분열된 ' + ((FAMILY_DATA.slime && FAMILY_DATA.slime.name) || '슬라임');
          t.hp = Math.max(16, Math.floor(((m.maxHp || t.hp || 30) * 0.38)));
          t.atk = Math.max(2, Math.floor((m.type.atk || 5) * 0.65));
          t.exp = Math.max(1, Math.floor((m.type.exp || 8) * 0.35));
          t.gold = Math.max(1, Math.floor((m.type.gold || 4) * 0.25));
          t.dropRate = 0.08;
          t.gimmick = 'normal';
          const child = {
            uid: Math.random().toString(36).slice(2),
            type: t,
            x: m.x + (i === 0 ? -38 : 38),
            baseX: m.x + (i === 0 ? -38 : 38),
            y: m.y,
            spawnY: m.y,
            hp: t.hp,
            maxHp: t.hp,
            face: i === 0 ? -1 : 1,
            time: Math.random() * 10,
            hit: 0,
            dead: false,
            splitChild: true,
            aiKind: 'normal',
            aiCooldown: 1.0
          };
          setupMonsterAI(child, game.monsters.length + i);
          game.monsters.push(child);
        }
        makeText('분열!', m.x, m.y - 128, '#bef264');
      }
      return oldKillMonster.apply(this, arguments);
    };
  }

  // Existing multiplayer code may send HP updates with x/y, but local clients should not
  // force monster x/y from frequent hit packets. This small marker is used by the server
  // patch too; no action is needed here except keeping local AI authoritative for motion.
  if (game && Array.isArray(game.monsters)) game.monsters.forEach(setupMonsterAI);
})();


/* =========================================================
   HUNT LADDER FLOORS / GROUNDED MONSTERS / MONSTER VISUAL PATCH
   - Replaces stair-like hunting maps with flat floors connected by ladders
   - Keeps monsters attached to the correct floor instead of floating
   - Improves monster sprites, especially boars
========================================================= */
(function () {
  'use strict';

  function __huntTheme() {
    try { return getTown(game.townId).theme || 'grass'; } catch (err) { return 'grass'; }
  }

  function __huntFloorSegments() {
    return [
      { x: 360,  y: 505, w: 1420, h: 24, floor: 1 },
      { x: 2050, y: 505, w: 1420, h: 24, floor: 1 },
      { x: 3730, y: 505, w: 1220, h: 24, floor: 1 },

      { x: 520,  y: 390, w: 1320, h: 24, floor: 2 },
      { x: 2190, y: 390, w: 1320, h: 24, floor: 2 },
      { x: 3840, y: 390, w: 1040, h: 24, floor: 2 },

      { x: 700,  y: 275, w: 1260, h: 24, floor: 3 },
      { x: 2390, y: 275, w: 1260, h: 24, floor: 3 },
      { x: 4030, y: 275, w: 860,  h: 24, floor: 3 },

      { x: 950,  y: 165, w: 1160, h: 24, floor: 4 },
      { x: 2670, y: 165, w: 1160, h: 24, floor: 4 }
    ];
  }

  function __huntLadders() {
    return [
      { x: 430,  y1: 505, y2: game.ground, label: '1층' },
      { x: 1080, y1: 390, y2: 505, label: '2층' },
      { x: 1640, y1: 275, y2: 390, label: '3층' },
      { x: 1040, y1: 165, y2: 275, label: '4층' },

      { x: 2260, y1: 505, y2: game.ground, label: '1층' },
      { x: 2880, y1: 390, y2: 505, label: '2층' },
      { x: 3480, y1: 275, y2: 390, label: '3층' },
      { x: 3260, y1: 165, y2: 275, label: '4층' },

      { x: 4050, y1: 505, y2: game.ground, label: '1층' },
      { x: 4520, y1: 390, y2: 505, label: '2층' },
      { x: 4720, y1: 275, y2: 390, label: '3층' }
    ];
  }

  function __applyLadderHuntLayout() {
    if (!game || game.mode !== 'hunt') return;
    game.ground = 610;
    game.width = Math.max(game.width || 0, 5400);
    game.platforms = __huntFloorSegments();
    game.ladders = __huntLadders();
  }

  function __makeHuntMonsters(hunt) {
    const floors = [
      { y: game.ground, count: 10, ranges: [[520, 1680], [2140, 3420], [3820, 5000]], tier: 0 },
      { y: 505, count: 9, ranges: [[460, 1700], [2160, 3380], [3840, 4820]], tier: 1 },
      { y: 390, count: 8, ranges: [[620, 1740], [2280, 3400], [3950, 4740]], tier: 2 },
      { y: 275, count: 6, ranges: [[800, 1840], [2480, 3540], [4110, 4800]], tier: 3 },
      { y: 165, count: 4, ranges: [[1050, 2000], [2800, 3720]], tier: 4 }
    ];
    const monsters = [];
    floors.forEach(function (row) {
      for (let i = 0; i < row.count; i++) {
        const range = row.ranges[i % row.ranges.length];
        const t = i / Math.max(1, row.count - 1);
        const family = hunt.families[(i + row.tier) % hunt.families.length];
        const type = makeMonsterType(family, hunt.baseLevel + row.tier * 2 + (i % 2));
        const span = range[1] - range[0];
        const x = Math.round(range[0] + (span * ((t * 1.37 + (i % 3) * 0.21) % 1)));
        const m = {
          uid: Math.random().toString(36).slice(2),
          type,
          x,
          baseX: x,
          y: row.y,
          spawnY: row.y,
          floorY: row.y,
          hp: type.hp,
          maxHp: type.hp,
          face: i % 2 ? -1 : 1,
          time: Math.random() * 10,
          hit: 0,
          dead: false,
          attackCooldown: 0,
          poison: 0,
          patrolDir: i % 2 ? -1 : 1,
          aiCooldown: 1 + Math.random()
        };
        if (typeof setupMonsterAI === 'function') setupMonsterAI(m, monsters.length);
        monsters.push(m);
      }
    });
    return monsters;
  }

  const __oldLoadHuntLadder = typeof loadHunt === 'function' ? loadHunt : null;
  if (__oldLoadHuntLadder) {
    loadHunt = function (huntId) {
      const ret = __oldLoadHuntLadder.apply(this, arguments);
      try {
        const hunt = getHunt(huntId || game.huntId);
        const town = getTown(hunt.town);
        game.mode = 'hunt';
        game.huntId = huntId || game.huntId;
        game.townId = town.id;
        game.ground = 610;
        game.width = 5400;
        __applyLadderHuntLayout();
        game.monsters = __makeHuntMonsters(hunt);
        if (typeof mpSyncLocalMonsterIds === 'function') mpSyncLocalMonsterIds();
        game.player.x = 220;
        game.player.y = game.ground;
        game.player.vx = 0;
        game.player.vy = 0;
        game.player.grounded = true;
        game.player.climbing = false;
        game.cameraX = 0;
        if (window.PixelRpgMultiplayer && window.PixelRpgMultiplayer.socket && window.PixelRpgMultiplayer.connected) {
          setTimeout(function () {
            try {
              const MP = window.PixelRpgMultiplayer;
              const room = 'hunt:' + (game.huntId || hunt.id || 'hunt');
              MP.socket.emit('monster:seed', { room: room, huntId: game.huntId, layout: 'ladder-v2', monsters: (game.monsters || []).map(function (m, i) {
                return {
                  id: m.sharedId || ((game.huntId || 'hunt') + ':' + i),
                  index: i,
                  family: m.type && m.type.family,
                  name: m.type && m.type.name,
                  level: m.type && m.type.level,
                  x: Math.round(m.x || 0),
                  y: Math.round(m.y || 0),
                  baseX: Math.round(m.baseX || m.x || 0),
                  spawnY: Math.round(m.spawnY || m.y || 0),
                  hp: Math.max(0, Math.round(m.hp || 0)),
                  maxHp: Math.max(1, Math.round(m.maxHp || (m.type && m.type.hp) || 1)),
                  dead: !!m.dead,
                  respawn: (m.type && m.type.respawn) || 12000
                };
              }) });
            } catch (err) {}
          }, 120);
        }
      } catch (err) {
        console.error('ladder hunt layout failed', err);
      }
      return ret;
    };
  }

  function __nearestFloorY(x, y) {
    let best = game.ground;
    const list = (game.platforms || []).filter(function (pf) {
      return x >= pf.x - 28 && x <= pf.x + pf.w + 28 && y <= pf.y + 35;
    });
    list.forEach(function (pf) {
      if (pf.y < best && y <= pf.y + 35) best = pf.y;
    });
    return best;
  }

  function __getLadderAt(x, y) {
    if (!Array.isArray(game.ladders)) return null;
    for (const l of game.ladders) {
      const top = Math.min(l.y1, l.y2);
      const bottom = Math.max(l.y1, l.y2);
      if (Math.abs(x - l.x) <= 28 && y >= top - 14 && y <= bottom + 18) return l;
    }
    return null;
  }

  updatePlayer = function (dt) {
    const p = game.player;
    if (!p) return;

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
    const up = keys.has('w') || keys.has('arrowup');
    const down = keys.has('arrowdown');
    const locked = !!(game.dialog || game.taxiOpen || game.shopOpen || game.blacksmithOpen);
    const ladder = __getLadderAt(p.x, p.y - 20) || __getLadderAt(p.x, p.y - 70);
    const wantsClimb = game.mode === 'hunt' && ladder && (up || down || p.climbing);

    if (!locked) {
      if (left) { p.vx = -p.speed; p.face = -1; }
      else if (right) { p.vx = p.speed; p.face = 1; }
      else {
        p.vx *= Math.pow(0.001, dt);
        if (Math.abs(p.vx) < 2) p.vx = 0;
      }
    }

    if (wantsClimb && !locked) {
      const top = Math.min(ladder.y1, ladder.y2);
      const bottom = Math.max(ladder.y1, ladder.y2);
      p.climbing = true;
      p.x += (ladder.x - p.x) * Math.min(1, dt * 10);
      p.vy = 0;
      p.grounded = false;
      if (up) p.y -= p.speed * 0.72 * dt;
      else if (down) p.y += p.speed * 0.72 * dt;
      p.y = clamp(p.y, top, bottom);
      if (!up && !down) p.vy = 0;
      if (p.y <= top + 2 && up) {
        p.y = top;
        p.climbing = false;
        p.grounded = true;
      }
      if (p.y >= bottom - 2 && down) {
        p.y = bottom;
        p.climbing = false;
        p.grounded = true;
      }
    } else {
      p.climbing = false;
      if (!locked && jump && p.grounded) {
        p.vy = -560;
        p.grounded = false;
      }
      p.vy += 1550 * dt;
      p.y += p.vy * dt;
    }

    p.x += p.vx * dt;
    if (!p.climbing) p.grounded = false;

    if (p.y >= game.ground) {
      p.y = game.ground;
      p.vy = 0;
      p.grounded = true;
    }

    (game.platforms || []).forEach(function (pf) {
      const falling = p.vy >= 0;
      const insideX = p.x > pf.x - 24 && p.x < pf.x + pf.w + 24;
      const nearTop = p.y >= pf.y - 16 && p.y <= pf.y + 24;
      if (!p.climbing && falling && insideX && nearTop) {
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
    else if (p.climbing) p.anim = 'walk';
    else if (!p.grounded) p.anim = 'jump';
    else if (Math.abs(p.vx) > 10) p.anim = 'walk';
    else p.anim = 'idle';
  };

  function __fixMonsterFloor(m) {
    if (!m || m.dead) return;
    if (!m.floorY) m.floorY = m.spawnY || __nearestFloorY(m.baseX || m.x || 0, m.y || game.ground);
    m.y = m.floorY;
    m.spawnY = m.floorY;
  }

  const __oldUpdateMonstersLadder = typeof updateMonsters === 'function' ? updateMonsters : null;
  if (__oldUpdateMonstersLadder) {
    updateMonsters = function (dt) {
      if (game && game.mode === 'hunt') __applyLadderHuntLayout();
      __oldUpdateMonstersLadder.apply(this, arguments);
      if (game && Array.isArray(game.monsters)) game.monsters.forEach(__fixMonsterFloor);
    };
  }

  updateDrops = function (dt) {
    game.drops.forEach(function (d) {
      d.vy += 620 * dt;
      d.y += d.vy * dt;
      const floorY = __nearestFloorY(d.x, d.y);
      if (d.y > floorY - 10) {
        d.y = floorY - 10;
        d.vy = 0;
      }
    });
  };

  function __drawLadder(l) {
    const top = Math.min(l.y1, l.y2);
    const bottom = Math.max(l.y1, l.y2);
    ctx.save();
    ctx.strokeStyle = '#7c4a22';
    ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(l.x - 16, top); ctx.lineTo(l.x - 16, bottom); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(l.x + 16, top); ctx.lineTo(l.x + 16, bottom); ctx.stroke();
    ctx.strokeStyle = '#b7793b';
    ctx.lineWidth = 4;
    for (let y = top + 14; y < bottom; y += 22) {
      ctx.beginPath(); ctx.moveTo(l.x - 18, y); ctx.lineTo(l.x + 18, y); ctx.stroke();
    }
    ctx.restore();
  }

  const __oldDrawWorldLadder = typeof drawWorld === 'function' ? drawWorld : null;
  if (__oldDrawWorldLadder) {
    drawWorld = function () {
      __oldDrawWorldLadder.apply(this, arguments);
      if (game && game.mode === 'hunt' && Array.isArray(game.ladders)) {
        game.ladders.forEach(__drawLadder);
      }
    };
  }

  drawPlatform = function (x, y, w, h, theme) {
    const top = getGroundColor(theme || __huntTheme());
    const dirt = getDirtColor(theme || __huntTheme());
    ctx.fillStyle = 'rgba(0,0,0,0.20)';
    roundRect(ctx, x + 4, y + 8, w, h, 10);
    ctx.fillStyle = top;
    roundRect(ctx, x, y, w, h, 9);
    ctx.fillStyle = dirt;
    ctx.fillRect(x + 7, y + h - 7, w - 14, 11);
    ctx.strokeStyle = 'rgba(255,255,255,0.23)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 6);
    ctx.lineTo(x + w - 12, y + 6);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    for (let i = 22; i < w; i += 70) ctx.fillRect(x + i, y + h - 4, 32, 5);
  };

  drawMonsters = function () {
    game.monsters.forEach(function (m) {
      if (m.dead) return;
      __fixMonsterFloor(m);
      ctx.save();
      ctx.translate(m.x, m.y + Math.sin((m.time || 0) * 6) * 1.2);
      ctx.scale(m.face || 1, 1);
      if (m.hit > 0) ctx.globalAlpha = 0.62;
      drawMonsterShape(m.type);
      ctx.restore();

      const big = m.type.shape === 'golem' || m.type.shape === 'ogre' || m.type.shape === 'boar';
      const barW = big ? 76 : 52;
      const barY = m.y - (big ? 94 : 62);
      ctx.fillStyle = '#0009'; ctx.fillRect(m.x - barW / 2, barY, barW, 7);
      ctx.fillStyle = '#ff4d4f'; ctx.fillRect(m.x - barW / 2, barY, barW * clamp(m.hp / m.maxHp, 0, 1), 7);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText('Lv.' + m.type.level, m.x, barY - 5);
    });
  };

  drawMonsterShape = function (type) {
    const color = type.color || '#62df75';
    const fam = type.family || 'slime';

    if (type.shape === 'slime') {
      ctx.fillStyle = '#0f172a';
      ctx.beginPath(); ctx.ellipse(0, -18, 31, 21, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(0, -20, 28, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = lighten(color, 28); ctx.beginPath(); ctx.ellipse(-9, -28, 10, 5, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a'; ctx.fillRect(-10, -23, 5, 6); ctx.fillRect(6, -23, 5, 6);
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(1, -15, 6, 0.2, Math.PI - 0.2); ctx.stroke();
      return;
    }

    if (type.shape === 'mushroom') {
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.ellipse(0, -46, 34, 23, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, -47, 31, 21, 0, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#fff7d6'; roundRect(ctx, -18, -43, 36, 31, 9);
      ctx.fillStyle = '#ffffff'; circle(ctx, -15, -51, 5); circle(ctx, 7, -58, 4); circle(ctx, 18, -48, 4);
      ctx.fillStyle = '#6b3f22'; roundRect(ctx, -8, -17, 16, 18, 6);
      ctx.fillStyle = '#0f172a'; ctx.fillRect(-10, -33, 4, 5); ctx.fillRect(6, -33, 4, 5);
      return;
    }

    if (type.shape === 'spirit') {
      ctx.shadowColor = color; ctx.shadowBlur = 16;
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.ellipse(0, -40, 28, 34, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, -42, 24, 31, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = lighten(color, 34); ctx.beginPath(); ctx.ellipse(-7, -51, 8, 11, -0.4, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#0f172a'; ctx.fillRect(-9, -47, 5, 6); ctx.fillRect(5, -47, 5, 6);
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -35, 7, 0.25, Math.PI - 0.25); ctx.stroke();
      return;
    }

    if (type.shape === 'boar') {
      const body = color;
      const dark = darken(color, 22);
      ctx.fillStyle = 'rgba(0,0,0,0.22)'; ctx.beginPath(); ctx.ellipse(0, -5, 38, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a'; roundRect(ctx, -45, -54, 86, 42, 20);
      ctx.fillStyle = body; roundRect(ctx, -41, -58, 82, 40, 19);
      ctx.fillStyle = dark; roundRect(ctx, -35, -30, 70, 16, 8);
      ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(31, -43, 24, 19, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f2c9a5'; ctx.beginPath(); ctx.ellipse(48, -39, 14, 10, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#0f172a'; circle(ctx, 38, -49, 3.5); circle(ctx, 53, -41, 2); circle(ctx, 45, -41, 2);
      ctx.fillStyle = '#fff7d6';
      ctx.beginPath(); ctx.moveTo(48, -32); ctx.lineTo(61, -27); ctx.lineTo(52, -41); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(35, -32); ctx.lineTo(24, -27); ctx.lineTo(34, -41); ctx.closePath(); ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath(); ctx.moveTo(-25, -57); ctx.lineTo(-16, -76); ctx.lineTo(-5, -55); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(8, -58); ctx.lineTo(20, -76); ctx.lineTo(27, -54); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2f1d12'; ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(-25, -18); ctx.lineTo(-29, -1); ctx.moveTo(-4, -18); ctx.lineTo(-6, -1); ctx.moveTo(18, -18); ctx.lineTo(20, -1); ctx.moveTo(36, -18); ctx.lineTo(39, -1); ctx.stroke();
      ctx.fillStyle = '#2f1d12'; roundRect(ctx, -36, -2, 15, 6, 2); roundRect(ctx, -13, -2, 15, 6, 2); roundRect(ctx, 14, -2, 15, 6, 2); roundRect(ctx, 32, -2, 15, 6, 2);
      ctx.strokeStyle = dark; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-40, -42); ctx.quadraticCurveTo(-58, -56, -48, -66); ctx.stroke();
      return;
    }

    if (type.shape === 'bug') {
      ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.ellipse(0, -31, 34, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, -33, 30, 16, 0, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = lighten(color, 24); ctx.beginPath(); ctx.ellipse(-8, -40, 9, 7, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (let i = -20; i <= 20; i += 13) { ctx.beginPath(); ctx.moveTo(i, -23); ctx.lineTo(i - 11, -3); ctx.moveTo(i, -23); ctx.lineTo(i + 11, -3); ctx.stroke(); }
      ctx.fillStyle = '#0f172a'; ctx.fillRect(-9, -38, 4, 5); ctx.fillRect(6, -38, 4, 5);
      return;
    }

    if (type.shape === 'lizard') {
      ctx.fillStyle = '#0f172a'; roundRect(ctx, -44, -48, 80, 34, 14);
      ctx.fillStyle = color; roundRect(ctx, -40, -50, 76, 31, 13);
      ctx.fillStyle = darken(color, 20); ctx.beginPath(); ctx.moveTo(-37, -35); ctx.lineTo(-66, -22); ctx.lineTo(-36, -20); ctx.closePath(); ctx.fill();
      ctx.fillStyle = lighten(color, 28); for (let i = -20; i <= 24; i += 15) circle(ctx, i, -47, 4);
      ctx.fillStyle = '#0f172a'; circle(ctx, 18, -41, 3.2);
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-20, -18); ctx.lineTo(-28, -3); ctx.moveTo(15, -18); ctx.lineTo(25, -3); ctx.stroke();
      return;
    }

    // golem / ogre / ruin guardian
    ctx.fillStyle = '#0f172a'; roundRect(ctx, -39, -96, 78, 80, 17);
    ctx.fillStyle = color; roundRect(ctx, -34, -92, 68, 72, 15);
    ctx.fillStyle = lighten(color, 32); roundRect(ctx, -28, -121, 56, 39, 12);
    ctx.fillStyle = darken(color, 24); roundRect(ctx, -54, -66, 20, 50, 8); roundRect(ctx, 34, -66, 20, 50, 8);
    ctx.fillStyle = '#0f172a'; ctx.fillRect(-12, -107, 6, 7); ctx.fillRect(7, -107, 6, 7); ctx.fillRect(-9, -92, 18, 3);
    ctx.fillStyle = 'rgba(255,255,255,0.20)'; roundRect(ctx, -22, -82, 18, 8, 4); roundRect(ctx, 4, -72, 18, 8, 4);
  };

  // Keep monsters on the new floor layout for a short time after server snapshots.
  setInterval(function () {
    if (game && game.mode === 'hunt' && Array.isArray(game.monsters)) {
      __applyLadderHuntLayout();
      game.monsters.forEach(__fixMonsterFloor);
    }
  }, 700);
})();


/* =========================================================
   JOB / WEAPON / HIDDEN CLASS / MONSTER VARIETY PATCH 01
   - Adds 10 jobs including 3 global-unique hidden jobs
   - Adds staged job advancement metadata
   - Adds special NPC quests for hidden jobs
   - Improves dagger speed / double hit
   - Adds level-based weapon visuals and swing effects
   - Adds enhancement success / destruction effects
   - Gives job NPCs unique appearances
   - Adds town layered building decoration
   - Gives monster families and towns more distinct visuals
========================================================= */
(function () {
  if (window.__PIXEL_RPG_JOB_WEAPON_HIDDEN_PATCH_01__) return;
  window.__PIXEL_RPG_JOB_WEAPON_HIDDEN_PATCH_01__ = true;

  const HIDDEN_JOB_IDS = ['shadow_reaper', 'dragon_knight', 'star_sage'];
  const HIDDEN_JOB_LABELS = {
    shadow_reaper: '그림자 사신',
    dragon_knight: '용기사',
    star_sage: '별의 현자'
  };

  const EXTRA_JOBS = {
    paladin: { name: '성기사', main: 'str', tier: 2, baseJob: 'warrior', advanceFrom: 'warrior', nextJobs: ['crusader'] },
    berserker: { name: '광전사', main: 'str', tier: 2, baseJob: 'warrior', advanceFrom: 'warrior', nextJobs: ['war_lord'] },
    cleric: { name: '성직자', main: 'int', tier: 2, baseJob: 'mage', advanceFrom: 'mage', nextJobs: ['bishop'] },
    summoner: { name: '소환사', main: 'int', tier: 2, baseJob: 'mage', advanceFrom: 'mage', nextJobs: ['spirit_lord'] },
    gunslinger: { name: '건슬링어', main: 'dex', tier: 2, baseJob: 'archer', advanceFrom: 'archer', nextJobs: ['sniper_commander'] },
    lancer: { name: '창기사', main: 'str', tier: 2, baseJob: 'warrior', advanceFrom: 'warrior' },
    engineer: { name: '기계공', main: 'dex', tier: 2, baseJob: 'beginner', advanceFrom: 'beginner' },
    bard: { name: '음유시인', main: 'int', tier: 2, baseJob: 'beginner', advanceFrom: 'beginner' },
    shadow_reaper: { name: '그림자 사신', main: 'luk', tier: 'hidden', hidden: true, unique: true, baseJob: 'rogue' },
    dragon_knight: { name: '용기사', main: 'str', tier: 'hidden', hidden: true, unique: true, baseJob: 'warrior' },
    star_sage: { name: '별의 현자', main: 'int', tier: 'hidden', hidden: true, unique: true, baseJob: 'mage' },
    crusader: { name: '크루세이더', main: 'str', tier: 3, baseJob: 'warrior', advanceFrom: 'paladin' },
    bishop: { name: '비숍', main: 'int', tier: 3, baseJob: 'mage', advanceFrom: 'cleric' },
    sniper_commander: { name: '저격대장', main: 'dex', tier: 3, baseJob: 'archer', advanceFrom: 'gunslinger' }
  };

  Object.assign(JOBS, EXTRA_JOBS);

  const EXTRA_SKILLS = {
    holy_cross: { id: 'holy_cross', name: '성광 십자', job: 'paladin', unlockLevel: 15, mp: 18, power: 2.4, range: 135, cooldown: 3.2, desc: '빛의 십자로 전방을 공격합니다.' },
    rage_burst: { id: 'rage_burst', name: '분노 폭발', job: 'berserker', unlockLevel: 15, mp: 16, power: 2.7, hits: 2, range: 105, cooldown: 3.6, desc: '거칠게 두 번 베어냅니다.' },
    heal_breeze: { id: 'heal_breeze', name: '회복의 바람', job: 'cleric', unlockLevel: 15, mp: 20, heal: 120, cooldown: 5, desc: '자신의 HP를 크게 회복합니다.' },
    summon_wisp: { id: 'summon_wisp', name: '정령탄', job: 'summoner', unlockLevel: 15, mp: 16, power: 2.0, range: 360, cooldown: 2.2, projectile: true, magic: true, desc: '정령의 구체를 발사합니다.' },
    bullet_rain: { id: 'bullet_rain', name: '탄환 난사', job: 'gunslinger', unlockLevel: 15, mp: 14, power: 1.05, hits: 4, range: 320, cooldown: 2.8, projectile: true, desc: '빠른 탄환을 연속으로 발사합니다.' },
    pierce_lance: { id: 'pierce_lance', name: '관통창', job: 'lancer', unlockLevel: 15, mp: 13, power: 2.1, range: 150, cooldown: 2.4, desc: '긴 창으로 앞의 적을 찌릅니다.' },
    drone_zap: { id: 'drone_zap', name: '드론 전격', job: 'engineer', unlockLevel: 15, mp: 15, power: 1.8, range: 330, cooldown: 2.5, projectile: true, magic: true, desc: '기계 드론의 전격을 발사합니다.' },
    echo_note: { id: 'echo_note', name: '메아리 음표', job: 'bard', unlockLevel: 15, mp: 12, power: 1.7, range: 310, cooldown: 2.2, projectile: true, magic: true, desc: '음표를 날려 적을 공격합니다.' },
    reaper_cut: { id: 'reaper_cut', name: '사신절단', job: 'shadow_reaper', unlockLevel: 1, mp: 16, power: 2.8, hits: 3, range: 125, cooldown: 2.6, desc: '그림자 낫으로 세 번 베어냅니다.' },
    dragon_roar: { id: 'dragon_roar', name: '용의 포효', job: 'dragon_knight', unlockLevel: 1, mp: 22, power: 3.1, range: 160, cooldown: 3.8, desc: '용의 기운으로 전방을 강타합니다.' },
    starfall: { id: 'starfall', name: '별똥별', job: 'star_sage', unlockLevel: 1, mp: 24, power: 3.0, range: 390, cooldown: 3.5, projectile: true, magic: true, desc: '별빛 탄환을 발사합니다.' }
  };
  Object.assign(SKILLS, EXTRA_SKILLS);

  // Some existing beginner cooldown balancing retained.
  if (SKILLS.strike) SKILLS.strike.cooldown = 2.5;
  if (SKILLS.stone_throw) SKILLS.stone_throw.cooldown = 2.5;
  if (SKILLS.first_aid) SKILLS.first_aid.cooldown = 3;

  const HIDDEN_QUESTS = {
    hidden_shadow_reaper: {
      id: 'hidden_shadow_reaper', title: '검은 달의 계약', town: 'shadowport', npc: '검은 달의 사신', hiddenJob: 'shadow_reaper', jobReward: 'shadow_reaper',
      desc: '그림자 괴물 18마리를 처치하고 검은 가죽 12개를 모아오세요.',
      goals: [{ type: 'kill', family: 'shadow', need: 18, count: 0 }, { type: 'item', itemId: 'black_hide', need: 12, count: 0 }],
      rewardGold: 900, rewardExp: 1000
    },
    hidden_dragon_knight: {
      id: 'hidden_dragon_knight', title: '잠든 용의 피', town: 'valor', npc: '용혈 기사 아르딘', hiddenJob: 'dragon_knight', jobReward: 'dragon_knight',
      desc: '멧돼지 18마리를 처치하고 녹슨 검 파편 12개를 모아오세요.',
      goals: [{ type: 'kill', family: 'boar', need: 18, count: 0 }, { type: 'item', itemId: 'rusted_blade', need: 12, count: 0 }],
      rewardGold: 900, rewardExp: 1000
    },
    hidden_star_sage: {
      id: 'hidden_star_sage', title: '별의 문장', town: 'ellenium', npc: '별빛 예언자 루미엘', hiddenJob: 'star_sage', jobReward: 'star_sage',
      desc: '마나 정령 18마리를 처치하고 푸른 결정 12개를 모아오세요.',
      goals: [{ type: 'kill', family: 'mana', need: 18, count: 0 }, { type: 'item', itemId: 'blue_crystal', need: 12, count: 0 }],
      rewardGold: 900, rewardExp: 1000
    },
    special_engineer: {
      id: 'special_engineer', title: '고장난 드론 수리', town: 'irondeep', npc: '기계공 노바', jobReward: 'engineer',
      desc: '광석 골렘 10마리를 처치하고 광석 조각 10개를 모아오세요.',
      goals: [{ type: 'kill', family: 'ore', need: 10, count: 0 }, { type: 'item', itemId: 'ore_piece', need: 10, count: 0 }], rewardGold: 550, rewardExp: 650
    },
    special_bard: {
      id: 'special_bard', title: '잃어버린 선율', town: 'greenwood', npc: '음유시인 리라', jobReward: 'bard',
      desc: '숲 벌레 10마리를 처치하고 단단한 깃털 8개를 모아오세요.',
      goals: [{ type: 'kill', family: 'bug', need: 10, count: 0 }, { type: 'item', itemId: 'hard_feather', need: 8, count: 0 }], rewardGold: 500, rewardExp: 620
    }
  };
  Object.assign(QUESTS, HIDDEN_QUESTS);

  const EXTRA_NPCS_BY_TOWN = {
    shadowport: [{ type: 'hidden_job', hiddenJob: 'shadow_reaper', name: '검은 달의 사신', x: 2140, quest: 'hidden_shadow_reaper', text: '그림자와 계약할 자격이 있는가?', lookJob: 'shadow_reaper' }],
    valor: [{ type: 'hidden_job', hiddenJob: 'dragon_knight', name: '용혈 기사 아르딘', x: 2140, quest: 'hidden_dragon_knight', text: '용의 피는 단 한 명에게만 깨어난다.', lookJob: 'dragon_knight' }],
    ellenium: [{ type: 'hidden_job', hiddenJob: 'star_sage', name: '별빛 예언자 루미엘', x: 2140, quest: 'hidden_star_sage', text: '별의 문장은 한 시대에 한 사람만 품는다.', lookJob: 'star_sage' }],
    irondeep: [{ type: 'job', name: '기계공 노바', x: 2020, quest: 'special_engineer', text: '기계와 함께 싸우는 법을 알려주지.', lookJob: 'engineer' }],
    greenwood: [{ type: 'job', name: '음유시인 리라', x: 2020, quest: 'special_bard', text: '전투에도 선율이 필요한 법이야.', lookJob: 'bard' }]
  };

  const HIDDEN_STATUS = window.PixelRpgHiddenJobs = window.PixelRpgHiddenJobs || { claimed: {}, owners: {} };

  function getMP() { return window.PixelRpgMultiplayer || null; }
  function hiddenJobName(id) { return (JOBS[id] && JOBS[id].name) || HIDDEN_JOB_LABELS[id] || id; }
  function hiddenClaimed(id) { return !!(HIDDEN_STATUS.claimed && HIDDEN_STATUS.claimed[id]); }

  function requestHiddenClaim(jobId, cb) {
    const MP = getMP();
    if (!MP || !MP.socket || !MP.connected) {
      cb({ ok: false, error: '히든 직업은 온라인 서버 연결 후에만 획득할 수 있습니다.' });
      return;
    }
    MP.socket.emit('hidden:claim', { jobId, name: (game.player.character && game.player.character.name) || '모험가' }, function (res) {
      cb(res || { ok: false, error: '서버 응답이 없습니다.' });
    });
  }

  // Hook multiplayer connection once socket exists.
  const __oldMpConnectWatch = setInterval(function () {
    const MP = getMP();
    if (!MP || !MP.socket || MP.__hiddenHooked) return;
    MP.__hiddenHooked = true;
    MP.socket.on('hidden:status', function (payload) {
      HIDDEN_STATUS.claimed = (payload && payload.claimed) || {};
      HIDDEN_STATUS.owners = (payload && payload.owners) || {};
    });
    MP.socket.on('hidden:claimed', function (payload) {
      if (!payload || !payload.jobId) return;
      HIDDEN_STATUS.claimed[payload.jobId] = true;
      HIDDEN_STATUS.owners[payload.jobId] = payload.name || '알 수 없음';
      if (typeof makeText === 'function' && game && game.player) {
        makeText(hiddenJobName(payload.jobId) + '의 주인이 탄생했습니다.', game.player.x, game.player.y - 135, '#facc15');
      }
    });
    MP.socket.emit('hidden:status');
  }, 900);

  const __oldLoadTownJobs = typeof loadTown === 'function' ? loadTown : null;
  if (__oldLoadTownJobs) {
    loadTown = function (townId) {
      const ret = __oldLoadTownJobs.apply(this, arguments);
      const list = EXTRA_NPCS_BY_TOWN[game.townId] || [];
      list.forEach(function (template, idx) {
        if (!game.npcs.some(function (n) { return n.name === template.name; })) {
          game.npcs.push(Object.assign({ y: game.ground, uniqueNpc: true }, template, { x: template.x + idx * 120 }));
        }
      });
      return ret;
    };
  }

  const __oldGetBasicAttackProfileJobs = typeof getBasicAttackProfile === 'function' ? getBasicAttackProfile : null;
  if (__oldGetBasicAttackProfileJobs) {
    getBasicAttackProfile = function () {
      const profile = __oldGetBasicAttackProfileJobs.apply(this, arguments) || {};
      if (profile.kind === 'dagger') {
        profile.cooldown = 0.14;
        profile.range = Math.max(profile.range || 58, 72);
        profile.power = Math.max(profile.power || 0.72, 0.82);
        profile.hits = 2;
        profile.color = '#c084fc';
      }
      return profile;
    };
  }

  function weaponTier(weaponId) {
    const item = ITEMS[weaponId] || {};
    const req = item.reqLevel || 1;
    const variant = item.pixel && item.pixel.variant || 1;
    return Math.max(1, Math.min(6, Math.floor(req / 10) + Math.floor(variant / 7) + 1));
  }

  function weaponGlowColor(kind, tier) {
    if (kind === 'staff') return tier >= 4 ? '#a78bfa' : '#74c0fc';
    if (kind === 'bow') return tier >= 4 ? '#fde047' : '#8ce99a';
    if (kind === 'dagger') return tier >= 4 ? '#f0abfc' : '#c084fc';
    return tier >= 4 ? '#fb7185' : '#ff922b';
  }

  drawWeapon = function (c, weaponId, handX, handY, attacking, attackKind, animTime) {
    if (!weaponId) return;
    const item = ITEMS[weaponId] || {};
    const kind = attackKind || item.weaponType || (weaponId.includes('staff') ? 'staff' : weaponId.includes('bow') ? 'bow' : weaponId.includes('dagger') ? 'dagger' : 'sword');
    const px = item.pixel || { a: '#e5e7eb', b: '#f97316', variant: 1 };
    const tier = weaponTier(weaponId);
    const t = attacking ? Math.sin(Math.min(1, (animTime || 0) * 14) * Math.PI) : 0;
    const glow = weaponGlowColor(kind, tier);

    c.save();
    c.translate(handX, handY);
    c.shadowColor = attacking || tier >= 4 ? glow : 'transparent';
    c.shadowBlur = (attacking ? 6 : 0) + Math.max(0, tier - 2) * 4;

    if (kind === 'staff') c.rotate(attacking ? -0.75 + t * 0.35 : -0.35);
    else if (kind === 'bow') c.rotate(attacking ? -0.06 : -0.25);
    else if (kind === 'dagger') c.rotate(attacking ? 0.30 + t * 0.40 : -0.30);
    else c.rotate(attacking ? -1.35 + t * 1.95 : -0.35);

    if (kind === 'staff') {
      c.strokeStyle = '#111827'; c.lineWidth = 5; c.beginPath(); c.moveTo(0, 12); c.lineTo(0, -42 - tier * 5); c.stroke();
      c.strokeStyle = px.a || '#74c0fc'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 12); c.lineTo(0, -42 - tier * 5); c.stroke();
      c.fillStyle = glow; circle(c, 0, -47 - tier * 5, 6 + tier);
      if (tier >= 3) { c.strokeStyle = '#ffffffaa'; c.lineWidth = 2; c.beginPath(); c.arc(0, -47 - tier * 5, 12 + tier * 3, 0, Math.PI * 2); c.stroke(); }
      if (tier >= 5) { c.strokeStyle = glow; c.beginPath(); c.arc(0, -47 - tier * 5, 23 + t * 10, 0, Math.PI * 2); c.stroke(); }
    } else if (kind === 'bow') {
      c.strokeStyle = '#111827'; c.lineWidth = 5; c.beginPath(); c.arc(0, -9, 21 + tier * 2, -Math.PI / 2, Math.PI / 2); c.stroke();
      c.strokeStyle = px.a || '#ffd43b'; c.lineWidth = 3; c.beginPath(); c.arc(0, -9, 21 + tier * 2, -Math.PI / 2, Math.PI / 2); c.stroke();
      c.strokeStyle = '#e5e7eb'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, -31 - tier); c.lineTo(attacking ? -13 - t * (9 + tier) : 0, -9); c.lineTo(0, 13 + tier); c.stroke();
      if (tier >= 4) { c.strokeStyle = glow; c.lineWidth = 2; c.beginPath(); c.moveTo(-21 - t * 10, -9); c.lineTo(28 + tier * 2, -9); c.stroke(); }
    } else if (kind === 'dagger') {
      c.fillStyle = glow; c.beginPath(); c.moveTo(0, -34 - tier * 3); c.lineTo(7 + tier, -19); c.lineTo(-7 - tier, -19); c.closePath(); c.fill();
      c.fillStyle = '#ffffffaa'; c.fillRect(-1.5, -31 - tier * 2, 3, 13 + tier * 2);
      c.fillStyle = px.b || '#111827'; c.fillRect(-9, -21, 18, 4); c.fillStyle = '#111827'; c.fillRect(-3, -17, 6, 21);
      if (tier >= 4) { c.strokeStyle = glow; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, -25); c.lineTo(12, -42 - tier * 3); c.stroke(); }
    } else {
      c.fillStyle = glow; c.beginPath(); c.moveTo(0, -56 - tier * 6); c.lineTo(10 + tier, -35); c.lineTo(4, -18); c.lineTo(-4, -18); c.lineTo(-10 - tier, -35); c.closePath(); c.fill();
      c.fillStyle = '#ffffffaa'; c.fillRect(-2, -50 - tier * 5, 4, 30 + tier * 4);
      c.fillStyle = px.b || '#f97316'; c.fillRect(-14 - tier, -21, 28 + tier * 2, 5); c.fillStyle = '#7c2d12'; c.fillRect(-4, -18, 8, 26);
      if (tier >= 4) { c.strokeStyle = glow; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-10, -50); c.lineTo(10, -66 - tier * 6); c.stroke(); }
    }
    c.restore();
  };

  const __oldSlashEffectJobs = typeof slashEffect === 'function' ? slashEffect : null;
  slashEffect = function (x, y, face, color, power) {
    const pwr = power || getCurrentWeaponEffectPower && getCurrentWeaponEffectPower() || 1;
    const kind = getEquippedWeaponKind ? getEquippedWeaponKind() : 'sword';
    const col = color || getCurrentWeaponEffectColor && getCurrentWeaponEffectColor() || '#ffb020';
    if (__oldSlashEffectJobs) __oldSlashEffectJobs(x, y, face, col, pwr);
    const extra = Math.max(0, Math.floor(pwr));
    for (let i = 0; i < 5 + extra * 3; i++) {
      game.particles.push({
        x: x + rand(-12, 12), y: y + rand(-18, 18),
        vx: face * rand(40, 150 + extra * 40), vy: rand(-80, 40),
        life: 0.22 + extra * 0.04,
        color: kind === 'dagger' ? '#d8b4fe' : kind === 'staff' ? '#93c5fd' : kind === 'bow' ? '#fde68a' : col
      });
    }
    if (kind === 'dagger') {
      game.particles.push({ x: x + face * 20, y: y - 4, vx: face * 210, vy: -20, life: 0.18, color: '#f0abfc' });
    }
  };

  const __oldEnhanceJobs = typeof enhanceEquippedItem === 'function' ? enhanceEquippedItem : null;
  if (__oldEnhanceJobs) {
    enhanceEquippedItem = function (slot) {
      const before = equipment[slot] ? { id: itemRefId(equipment[slot]), enhance: itemEnhance(equipment[slot]) } : null;
      const beforeGold = wallet.gold;
      const ret = __oldEnhanceJobs.apply(this, arguments);
      const after = equipment[slot] ? { id: itemRefId(equipment[slot]), enhance: itemEnhance(equipment[slot]) } : null;
      const x = game.player.x, y = game.player.y - 58;
      if (before && after && after.enhance > before.enhance) {
        for (let i = 0; i < 34; i++) game.particles.push({ x: x + rand(-20, 20), y: y + rand(-20, 20), vx: rand(-170, 170), vy: rand(-210, -20), life: rand(0.45, 0.95), color: i % 2 ? '#facc15' : '#ffffff' });
        makeText('강화 빛폭발!', x, y - 42, '#facc15');
      } else if (before && !after && wallet.gold < beforeGold) {
        for (let i = 0; i < 42; i++) game.particles.push({ x: x + rand(-24, 24), y: y + rand(-24, 18), vx: rand(-230, 230), vy: rand(-230, 70), life: rand(0.55, 1.2), color: i % 3 ? '#fb7185' : '#111827' });
        makeText('장비 파괴!', x, y - 48, '#fb7185');
      }
      return ret;
    };
  }

  const __oldAcceptQuestJobs = typeof acceptOrCompleteQuest === 'function' ? acceptOrCompleteQuest : null;
  acceptOrCompleteQuest = function (id) {
    const qBase = QUESTS[id];
    if (!qBase) return;

    if (qBase.hiddenJob && hiddenClaimed(qBase.hiddenJob)) {
      const owner = HIDDEN_STATUS.owners[qBase.hiddenJob] || '다른 유저';
      makeText('이미 전직한 자가 있는 직업입니다.', game.player.x, game.player.y - 110, '#ff8787');
      if (game.dialog && game.dialog.npc) game.dialog.npc.text = hiddenJobName(qBase.hiddenJob) + '은(는) 이미 ' + owner + '님이 계승했습니다.';
      return;
    }

    let active = quests.active.find(function (q) { return q.id === id; });
    if (active && qBase.hiddenJob) {
      syncQuestItems(active);
      if (!questComplete(active)) {
        makeText('아직 완료 조건이 부족합니다.', game.player.x, game.player.y - 90, '#ffdd99');
        return;
      }
      requestHiddenClaim(qBase.hiddenJob, function (res) {
        if (!res || !res.ok) {
          makeText((res && res.error) || '이미 전직한 자가 있는 직업입니다.', game.player.x, game.player.y - 110, '#ff8787');
          return;
        }
        HIDDEN_STATUS.claimed[qBase.hiddenJob] = true;
        HIDDEN_STATUS.owners[qBase.hiddenJob] = game.player.character.name || '나';
        completeQuest(active);
        refreshUnlockedSkills();
        markAutoSaveSoon();
      });
      return;
    }

    if (__oldAcceptQuestJobs) return __oldAcceptQuestJobs.apply(this, arguments);
  };

  const __oldDrawDialogJobs = typeof drawDialog === 'function' ? drawDialog : null;
  if (__oldDrawDialogJobs) {
    drawDialog = function () {
      if (game.dialog && game.dialog.npc && game.dialog.npc.hiddenJob && hiddenClaimed(game.dialog.npc.hiddenJob)) {
        game.dialog.npc.text = '이미 전직한 자가 있는 직업입니다.';
      }
      return __oldDrawDialogJobs.apply(this, arguments);
    };
  }

  const __oldDrawNPCBodyJobs = typeof drawNPCBody === 'function' ? drawNPCBody : null;
  drawNPCBody = function (npc) {
    if (!npc || !(npc.lookJob || npc.type === 'job' || npc.type === 'hidden_job')) {
      return __oldDrawNPCBodyJobs ? __oldDrawNPCBodyJobs.apply(this, arguments) : null;
    }
    const job = npc.lookJob || (npc.quest || '').replace('_job', '');
    const palette = {
      warrior: ['#9a3412', '#f97316', '#e5e7eb'], mage: ['#4c1d95', '#a78bfa', '#93c5fd'], rogue: ['#111827', '#64748b', '#c084fc'], archer: ['#166534', '#22c55e', '#fde68a'],
      paladin: ['#78350f', '#facc15', '#ffffff'], berserker: ['#7f1d1d', '#ef4444', '#111827'], cleric: ['#f8fafc', '#60a5fa', '#fef3c7'], summoner: ['#14532d', '#34d399', '#a78bfa'],
      gunslinger: ['#334155', '#94a3b8', '#fbbf24'], lancer: ['#1e3a8a', '#60a5fa', '#e5e7eb'], engineer: ['#78350f', '#f59e0b', '#94a3b8'], bard: ['#831843', '#f472b6', '#fde68a'],
      shadow_reaper: ['#020617', '#7e22ce', '#f0abfc'], dragon_knight: ['#7f1d1d', '#dc2626', '#fbbf24'], star_sage: ['#172554', '#2563eb', '#fef08a']
    }[job] || ['#1e293b', '#60a5fa', '#e2e8f0'];
    ctx.save();
    ctx.translate(npc.x, npc.y + Math.sin(performance.now() / 330) * 1.2);
    ctx.scale(0.78, 0.78);
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(0, 3, 25, 5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#171717'; roundRect(ctx, -18, -66, 36, 40, 10);
    ctx.fillStyle = palette[0]; roundRect(ctx, -15, -63, 30, 36, 9);
    ctx.fillStyle = palette[1]; roundRect(ctx, -12, -38, 24, 8, 4);
    ctx.strokeStyle = '#171717'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(-14, -56); ctx.lineTo(-28, -44); ctx.moveTo(14, -56); ctx.lineTo(28, -44); ctx.stroke();
    ctx.strokeStyle = palette[1]; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-14, -56); ctx.lineTo(-28, -44); ctx.moveTo(14, -56); ctx.lineTo(28, -44); ctx.stroke();
    ctx.fillStyle = '#ffd6a6'; circle(ctx, -28, -44, 4); circle(ctx, 28, -44, 4);
    ctx.fillStyle = '#171717'; roundRect(ctx, -14, -31, 10, 28, 5); roundRect(ctx, 4, -31, 10, 28, 5); roundRect(ctx, -20, -6, 16, 6, 2); roundRect(ctx, 4, -6, 16, 6, 2);
    ctx.fillStyle = '#171717'; ctx.beginPath(); ctx.ellipse(0, -92, 23, 24, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd6a6'; ctx.beginPath(); ctx.ellipse(0, -92, 19, 21, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = palette[2];
    if (job === 'mage' || job === 'star_sage' || job === 'cleric' || job === 'summoner') { ctx.beginPath(); ctx.moveTo(-24, -110); ctx.lineTo(0, -140); ctx.lineTo(24, -110); ctx.closePath(); ctx.fill(); }
    else if (job === 'dragon_knight') { ctx.beginPath(); ctx.moveTo(-22, -110); ctx.lineTo(-12, -132); ctx.lineTo(0, -112); ctx.lineTo(12, -132); ctx.lineTo(22, -110); ctx.closePath(); ctx.fill(); }
    else if (job === 'shadow_reaper') { roundRect(ctx, -24, -121, 48, 15, 8); ctx.fillStyle = '#111827'; roundRect(ctx, -20, -113, 40, 11, 6); }
    else { roundRect(ctx, -21, -118, 42, 13, 7); }
    ctx.fillStyle = '#111827'; ctx.fillRect(-8, -99, 4, 5); ctx.fillRect(5, -99, 4, 5); ctx.fillRect(-4, -88, 8, 2);
    // job prop
    ctx.strokeStyle = palette[2]; ctx.lineWidth = 4;
    if (job === 'archer' || job === 'gunslinger') { ctx.beginPath(); ctx.arc(35, -48, 16, -Math.PI / 2, Math.PI / 2); ctx.stroke(); }
    else if (job === 'mage' || job === 'star_sage') { ctx.beginPath(); ctx.moveTo(32, -32); ctx.lineTo(32, -78); ctx.stroke(); ctx.fillStyle = palette[2]; circle(ctx, 32, -83, 6); }
    else { ctx.beginPath(); ctx.moveTo(32, -28); ctx.lineTo(38, -78); ctx.stroke(); }
    ctx.restore();
  };

  const __oldDrawTownObjectsJobs = typeof drawTownObjects === 'function' ? drawTownObjects : null;
  drawTownObjects = function (town) {
    if (__oldDrawTownObjectsJobs) __oldDrawTownObjectsJobs.apply(this, arguments);
    // Layered city terraces and upper houses. Decoration only, so it will not block movement.
    const theme = town && town.theme || 'grass';
    const ys = [game.ground - 155, game.ground - 285];
    for (let layer = 0; layer < ys.length; layer++) {
      const y = ys[layer];
      for (let x = 260 + layer * 130; x < game.width; x += 720) {
        drawPlatform(x, y, 420, 22, theme);
        if (theme === 'magic') drawMagicTower(x + 210, y);
        else if (theme === 'ice') drawIceHouse(x + 210, y);
        else if (theme === 'ruin') drawRuin(x + 210, y);
        else if (theme === 'mine') drawMineEntrance(x + 210, y);
        else drawHouse(x + 210, y, theme);
      }
    }
  };

  // Monster visual variety: same family looks different depending on town/level.
  function monsterVariant(type) {
    const level = type.level || 1;
    const townSeed = (game.townId || '').split('').reduce(function (a, ch) { return a + ch.charCodeAt(0); }, 0);
    return (level + townSeed) % 5;
  }

  const __oldDrawMonsterShapeJobs = typeof drawMonsterShape === 'function' ? drawMonsterShape : null;
  drawMonsterShape = function (type) {
    const v = monsterVariant(type || {});
    const fam = type.family || 'slime';
    ctx.save();
    if (v === 1) ctx.scale(1.12, 0.95);
    if (v === 2) ctx.scale(0.95, 1.12);
    if (v === 3) ctx.rotate(0.03);
    if (v === 4) ctx.rotate(-0.03);
    if (__oldDrawMonsterShapeJobs) __oldDrawMonsterShapeJobs.apply(this, arguments);
    ctx.restore();

    // extra horns/spikes/marks per variant to avoid recycled look
    ctx.save();
    const color = type.color || '#62df75';
    if (fam === 'boar') {
      ctx.fillStyle = v % 2 ? '#fef3c7' : '#9f1239';
      ctx.beginPath(); ctx.moveTo(-8, -60); ctx.lineTo(0, -85 - v * 3); ctx.lineTo(8, -60); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#2f1d12'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-28, -50); ctx.lineTo(22, -42); ctx.stroke();
    } else if (fam === 'slime') {
      ctx.fillStyle = v >= 2 ? '#ffffff88' : '#0f172a55';
      circle(ctx, -18 + v * 4, -34, 4 + v);
      if (v >= 3) { ctx.fillStyle = '#a7f3d0'; circle(ctx, 18, -31, 5); }
    } else if (fam === 'mushroom') {
      ctx.fillStyle = v % 2 ? '#fef08a' : '#ffffff';
      circle(ctx, -22, -57, 4 + v); circle(ctx, 18, -52, 3 + v);
    } else if (fam === 'mana' || fam === 'ice') {
      ctx.strokeStyle = fam === 'ice' ? '#e0f2fe' : '#d8b4fe'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, -42, 30 + v * 3, 0, Math.PI * 2); ctx.stroke();
    } else if (fam === 'bug') {
      ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-18, -47); ctx.lineTo(-28, -62 - v * 2); ctx.moveTo(18, -47); ctx.lineTo(28, -62 - v * 2); ctx.stroke();
    } else if (fam === 'ruin' || fam === 'ore') {
      ctx.fillStyle = '#ffffff33'; roundRect(ctx, -20, -115, 40, 7 + v, 4);
    }
    ctx.restore();
  };

  // Make current equipment catalog look more impressive by item level.
  Object.keys(ITEMS).forEach(function (id) {
    const item = ITEMS[id];
    if (!item || !getEquipSlotForItem(item)) return;
    const tier = Math.max(1, Math.min(6, Math.floor((item.reqLevel || 1) / 10) + 1));
    item.visualTier = tier;
    if (item.type === 'weapon' && tier >= 3 && !/★|◆|✦/.test(item.name)) {
      const prefix = tier >= 5 ? '✦' : tier >= 4 ? '◆' : '★';
      item.name = prefix + ' ' + item.name;
      item.desc = (item.desc || '') + ' / 고급 외형';
    }
  });
})();

/* =========================================================
   PERSISTENT HIDDEN JOB + JOB RESET NPC PATCH 01
   - Sends stable user id when claiming/releasing hidden jobs
   - Adds job reset NPC that releases a unique hidden job slot
   - Hidden jobs remain owned after server restart until this reset is used
========================================================= */
(function () {
  if (window.__PIXEL_RPG_PERSISTENT_HIDDEN_RESET_PATCH_01__) return;
  window.__PIXEL_RPG_PERSISTENT_HIDDEN_RESET_PATCH_01__ = true;

  const HIDDEN_IDS = ['shadow_reaper', 'dragon_knight', 'star_sage'];
  const HIDDEN_LABELS = {
    shadow_reaper: '그림자 사신',
    dragon_knight: '용기사',
    star_sage: '별의 현자'
  };

  function getMP() { return window.PixelRpgMultiplayer || null; }
  function isHiddenJob(jobId) { return HIDDEN_IDS.includes(jobId); }
  function jobLabel(jobId) { return (JOBS[jobId] && JOBS[jobId].name) || HIDDEN_LABELS[jobId] || jobId || '알 수 없음'; }
  function myUserId() { return currentUser && currentUser.id ? String(currentUser.id) : ''; }
  function myName() { return game && game.player && game.player.character ? (game.player.character.name || '모험가') : '모험가'; }

  function hiddenStatus() {
    return window.PixelRpgHiddenJobs || (window.PixelRpgHiddenJobs = { claimed: {}, owners: {} });
  }

  function sendHiddenStatusRequest() {
    const MP = getMP();
    if (MP && MP.socket && MP.connected) MP.socket.emit('hidden:status');
  }

  function claimHiddenPersistent(jobId, cb) {
    const MP = getMP();
    if (!MP || !MP.socket || !MP.connected) {
      cb({ ok: false, error: '히든 직업은 온라인 서버 연결 후에만 획득할 수 있습니다.' });
      return;
    }
    MP.socket.emit('hidden:claim', { jobId, userId: myUserId(), name: myName() }, function (res) {
      cb(res || { ok: false, error: '서버 응답이 없습니다.' });
    });
  }

  function releaseHiddenPersistent(jobId, cb) {
    const MP = getMP();
    if (!MP || !MP.socket || !MP.connected) {
      cb({ ok: false, error: '직업 초기화는 온라인 서버 연결 후에만 가능합니다.' });
      return;
    }
    MP.socket.emit('hidden:release', { jobId, userId: myUserId(), name: myName() }, function (res) {
      cb(res || { ok: false, error: '서버 응답이 없습니다.' });
    });
  }

  function installPersistentHiddenSocketHooks() {
    const MP = getMP();
    if (!MP || !MP.socket || MP.__persistentHiddenHooks) return;
    MP.__persistentHiddenHooks = true;

    MP.socket.on('hidden:status', function (payload) {
      const status = hiddenStatus();
      status.claimed = (payload && payload.claimed) || {};
      status.owners = (payload && payload.owners) || {};
    });

    MP.socket.on('hidden:released', function (payload) {
      if (!payload || !payload.jobId) return;
      const status = hiddenStatus();
      if (status.claimed) delete status.claimed[payload.jobId];
      if (status.owners) delete status.owners[payload.jobId];
      if (typeof makeText === 'function' && game && game.player) {
        makeText(jobLabel(payload.jobId) + ' 직업 자리가 다시 비었습니다.', game.player.x, game.player.y - 135, '#9bf6ff');
      }
    });

    MP.socket.on('connect', sendHiddenStatusRequest);
    sendHiddenStatusRequest();
  }
  setInterval(installPersistentHiddenSocketHooks, 800);

  const __oldLoadTownPersistentReset = typeof loadTown === 'function' ? loadTown : null;
  if (__oldLoadTownPersistentReset) {
    loadTown = function (townId) {
      const ret = __oldLoadTownPersistentReset.apply(this, arguments);
      if (game && Array.isArray(game.npcs) && !game.npcs.some(function (n) { return n.type === 'job_reset'; })) {
        game.npcs.push({
          type: 'job_reset',
          name: '직업 초기화 관리자',
          x: Math.min((game.width || 4300) - 520, 2460),
          y: game.ground,
          text: '현재 직업을 초보자로 되돌립니다. 히든 직업이라면 서버의 단독 소유권도 해제됩니다.',
          lookJob: 'beginner'
        });
      }
      return ret;
    };
  }

  function removeHiddenQuestRecords(jobId) {
    const related = {
      shadow_reaper: 'hidden_shadow_reaper',
      dragon_knight: 'hidden_dragon_knight',
      star_sage: 'hidden_star_sage'
    }[jobId];
    if (!related) return;
    quests.active = quests.active.filter(function (q) { return q.id !== related; });
    quests.completed = quests.completed.filter(function (id) { return id !== related; });
  }

  function resetLocalJobAfterRelease(oldJob) {
    if (!game || !game.player || !game.player.character) return;
    const oldName = jobLabel(oldJob);
    game.player.character.job = 'beginner';
    if (skills) {
      skills.unlocked = (skills.unlocked || []).filter(function (id) {
        const s = SKILLS[id];
        return s && s.job === 'beginner';
      });
      skills.hotkeys = { k: null, l: null, semicolon: null };
    }
    if (isHiddenJob(oldJob)) removeHiddenQuestRecords(oldJob);
    if (typeof refreshUnlockedSkills === 'function') refreshUnlockedSkills();
    if (typeof recalcStats === 'function') recalcStats();
    if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
    if (typeof saveGame === 'function') saveGame(true);
    makeText(oldName + ' 직업을 초기화했습니다.', game.player.x, game.player.y - 100, '#9bf6ff');
  }

  function resetMyJob() {
    const oldJob = game && game.player && game.player.character ? (game.player.character.job || 'beginner') : 'beginner';
    if (oldJob === 'beginner') {
      makeText('이미 초보자입니다.', game.player.x, game.player.y - 95, '#cbd5e1');
      return;
    }

    if (!isHiddenJob(oldJob)) {
      resetLocalJobAfterRelease(oldJob);
      return;
    }

    releaseHiddenPersistent(oldJob, function (res) {
      if (!res || !res.ok) {
        makeText((res && res.error) || '히든 직업 초기화 실패', game.player.x, game.player.y - 110, '#ff8787');
        return;
      }
      const status = hiddenStatus();
      if (status.claimed) delete status.claimed[oldJob];
      if (status.owners) delete status.owners[oldJob];
      resetLocalJobAfterRelease(oldJob);
    });
  }

  const __oldHandleDialogClickPersistentReset = typeof handleDialogClick === 'function' ? handleDialogClick : null;
  if (__oldHandleDialogClickPersistentReset) {
    handleDialogClick = function (x, y) {
      if (game.dialog && game.dialog.npc && game.dialog.npc.type === 'job_reset') {
        if (hit(x, y, 970, 620, 120, 40)) {
          game.dialog = null;
          return;
        }
        if (hit(x, y, 210, 620, 190, 42)) {
          resetMyJob();
          game.dialog = null;
          return;
        }
      }
      return __oldHandleDialogClickPersistentReset.apply(this, arguments);
    };
  }

  const __oldDrawDialogPersistentReset = typeof drawDialog === 'function' ? drawDialog : null;
  if (__oldDrawDialogPersistentReset) {
    drawDialog = function () {
      if (game.dialog && game.dialog.npc && game.dialog.npc.type === 'job_reset') {
        const oldText = game.dialog.npc.text;
        const job = game.player && game.player.character ? game.player.character.job : 'beginner';
        game.dialog.npc.text = job === 'beginner'
          ? '이미 초보자입니다.'
          : '현재 직업 [' + jobLabel(job) + ']을 초기화할까요? 히든 직업이면 다른 유저가 다시 획득할 수 있게 됩니다.';
        const ret = __oldDrawDialogPersistentReset.apply(this, arguments);
        game.dialog.npc.text = oldText;
        return ret;
      }
      return __oldDrawDialogPersistentReset.apply(this, arguments);
    };
  }

  const __oldAcceptPersistentHidden = typeof acceptOrCompleteQuest === 'function' ? acceptOrCompleteQuest : null;
  acceptOrCompleteQuest = function (id) {
    const qBase = QUESTS[id];
    if (!qBase || !qBase.hiddenJob) {
      return __oldAcceptPersistentHidden ? __oldAcceptPersistentHidden.apply(this, arguments) : undefined;
    }

    const status = hiddenStatus();
    if (status.claimed && status.claimed[qBase.hiddenJob]) {
      const owner = status.owners && status.owners[qBase.hiddenJob] ? status.owners[qBase.hiddenJob] : '다른 유저';
      makeText('이미 전직한 자가 있는 직업입니다.', game.player.x, game.player.y - 110, '#ff8787');
      if (game.dialog && game.dialog.npc) game.dialog.npc.text = jobLabel(qBase.hiddenJob) + '은(는) 이미 ' + owner + '님이 계승했습니다.';
      return;
    }

    if (quests.completed.includes(id)) {
      makeText('이미 완료했습니다.', game.player.x, game.player.y - 90, '#cbd5e1');
      return;
    }

    let q = quests.active.find(function (item) { return item.id === id; });
    if (!q) {
      q = JSON.parse(JSON.stringify(qBase));
      quests.active.push(q);
      makeText('히든 직업 퀘스트 수락!', game.player.x, game.player.y - 90, '#ffe066');
      if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
      return;
    }

    syncQuestItems(q);
    if (!questComplete(q)) {
      makeText('아직 완료 조건이 부족합니다.', game.player.x, game.player.y - 90, '#ffdd99');
      return;
    }

    claimHiddenPersistent(qBase.hiddenJob, function (res) {
      if (!res || !res.ok) {
        makeText((res && res.error) || '이미 전직한 자가 있는 직업입니다.', game.player.x, game.player.y - 110, '#ff8787');
        sendHiddenStatusRequest();
        return;
      }
      const status = hiddenStatus();
      status.claimed[qBase.hiddenJob] = true;
      status.owners[qBase.hiddenJob] = myName();
      completeQuest(q);
      refreshUnlockedSkills();
      markAutoSaveSoon();
    });
  };
})();


/* =========================================================
   TOWN LADDER / REPEAT QUEST / WON CURRENCY / AGGRO PATCH 01
   - Town upper platforms can be reached by ladder or stronger jump
   - Adds upper-town repeatable quests with level-scaled rewards
   - Replaces Gold/G/메소 labels with 원
   - Monsters attack only after the player hits them first
========================================================= */
(function () {
  'use strict';
  if (window.__PIXEL_RPG_TOWN_REPEAT_WON_AGGRO_PATCH_01__) return;
  window.__PIXEL_RPG_TOWN_REPEAT_WON_AGGRO_PATCH_01__ = true;

  const TOWN_ORDER_FOR_REWARD = ['lumina','greenwood','ellenium','valor','shadowport','sylvania','irondeep','frosthall','solas','nocturn'];
  const TOWN_REPEAT_NPCS = {
    lumina: [
      { type: 'repeat_quest', name: '언덕 위 농부 포포', x: 980, y: 392, quest: 'repeat_lumina_slime', text: '매일 들판을 어지럽히는 슬라임을 좀 줄여주세요.', lookJob: 'beginner' },
      { type: 'repeat_quest', name: '지붕 청소부 미오', x: 1640, y: 277, quest: 'repeat_lumina_mushroom', text: '위쪽 지붕 근처에 버섯 포자가 너무 많아요.', lookJob: 'bard' }
    ],
    greenwood: [
      { type: 'repeat_quest', name: '나무꾼 라임', x: 980, y: 392, quest: 'repeat_greenwood_bug', text: '숲 벌레가 목재 창고를 갉아먹고 있어요.', lookJob: 'archer' },
      { type: 'repeat_quest', name: '숲 약초상 세나', x: 1640, y: 277, quest: 'repeat_greenwood_mushroom', text: '약초를 지키려면 버섯들을 정리해야 해요.', lookJob: 'cleric' }
    ],
    ellenium: [
      { type: 'repeat_quest', name: '마력 연구원 비비', x: 980, y: 392, quest: 'repeat_ellenium_mana', text: '마나 정령의 흐름을 조사하고 있어요.', lookJob: 'mage' },
      { type: 'repeat_quest', name: '별빛 기록관 노아', x: 1640, y: 277, quest: 'repeat_ellenium_crystal', text: '푸른 결정을 더 모아주세요.', lookJob: 'star_sage' }
    ],
    valor: [
      { type: 'repeat_quest', name: '성벽 경비병 하론', x: 980, y: 392, quest: 'repeat_valor_boar', text: '성벽 아래의 멧돼지가 계속 돌진합니다.', lookJob: 'warrior' },
      { type: 'repeat_quest', name: '무기 수습병 케인', x: 1640, y: 277, quest: 'repeat_valor_blade', text: '훈련용 검 파편이 부족합니다.', lookJob: 'lancer' }
    ],
    shadowport: [
      { type: 'repeat_quest', name: '항구 감시자 렌', x: 980, y: 392, quest: 'repeat_shadowport_shadow', text: '어둠 골목의 그림자를 감시해야 합니다.', lookJob: 'rogue' },
      { type: 'repeat_quest', name: '정보상 카일', x: 1640, y: 277, quest: 'repeat_shadowport_hide', text: '검은 가죽은 늘 수요가 있죠.', lookJob: 'shadow_reaper' }
    ],
    sylvania: [
      { type: 'repeat_quest', name: '깃털 수집가 루루', x: 980, y: 392, quest: 'repeat_sylvania_feather', text: '좋은 화살깃을 만들 재료가 필요해요.', lookJob: 'archer' },
      { type: 'repeat_quest', name: '숲길 안내원 피아', x: 1640, y: 277, quest: 'repeat_sylvania_bug', text: '위층 숲길의 벌레를 치워주세요.', lookJob: 'bard' }
    ],
    irondeep: [
      { type: 'repeat_quest', name: '광부 토르', x: 980, y: 392, quest: 'repeat_irondeep_ore', text: '광석 조각을 가져오면 수당을 드리죠.', lookJob: 'engineer' },
      { type: 'repeat_quest', name: '용광로 관리인 다나', x: 1640, y: 277, quest: 'repeat_irondeep_golem', text: '광산 골렘이 용광로를 막고 있어요.', lookJob: 'blacksmith' }
    ],
    frosthall: [
      { type: 'repeat_quest', name: '얼음 채집꾼 유리', x: 980, y: 392, quest: 'repeat_frosthall_ice', text: '맑은 얼음 조각이 필요합니다.', lookJob: 'mage' },
      { type: 'repeat_quest', name: '북풍 감시자 노엘라', x: 1640, y: 277, quest: 'repeat_frosthall_spirit', text: '위쪽 냉기층의 정령을 진정시켜 주세요.', lookJob: 'cleric' }
    ],
    solas: [
      { type: 'repeat_quest', name: '사막 상인 아딘', x: 980, y: 392, quest: 'repeat_solas_scale', text: '사막 비늘은 비싸게 팔립니다.', lookJob: 'gunslinger' },
      { type: 'repeat_quest', name: '오아시스 수비병 라샤', x: 1640, y: 277, quest: 'repeat_solas_lizard', text: '모래 도마뱀이 물길을 망가뜨립니다.', lookJob: 'lancer' }
    ],
    nocturn: [
      { type: 'repeat_quest', name: '폐허 조사관 벨', x: 980, y: 392, quest: 'repeat_nocturn_core', text: '폐허의 핵을 회수해야 합니다.', lookJob: 'star_sage' },
      { type: 'repeat_quest', name: '밤의 파수꾼 케르', x: 1640, y: 277, quest: 'repeat_nocturn_guardian', text: '폐허 수호자를 잠시 잠재워 주세요.', lookJob: 'dragon_knight' }
    ]
  };

  const REPEAT_QUEST_DEFS = {
    repeat_lumina_slime: ['루미나 반복 의뢰: 젤리 정리', 'lumina', '언덕 위 농부 포포', 'slime', 8, null, 0],
    repeat_lumina_mushroom: ['루미나 반복 의뢰: 지붕 포자', 'lumina', '지붕 청소부 미오', 'mushroom', 6, null, 0],
    repeat_greenwood_bug: ['그린우드 반복 의뢰: 목재 창고 방어', 'greenwood', '나무꾼 라임', 'bug', 9, null, 1],
    repeat_greenwood_mushroom: ['그린우드 반복 의뢰: 약초밭 보호', 'greenwood', '숲 약초상 세나', 'mushroom', 10, null, 1],
    repeat_ellenium_mana: ['일레니움 반복 의뢰: 마나 흐름 조사', 'ellenium', '마력 연구원 비비', 'mana', 10, null, 2],
    repeat_ellenium_crystal: ['일레니움 반복 의뢰: 푸른 결정 수집', 'ellenium', '별빛 기록관 노아', null, 0, 'blue_crystal', 2],
    repeat_valor_boar: ['발로란 반복 의뢰: 성벽 아래 돌진', 'valor', '성벽 경비병 하론', 'boar', 11, null, 3],
    repeat_valor_blade: ['발로란 반복 의뢰: 검 파편 회수', 'valor', '무기 수습병 케인', null, 0, 'rusted_blade', 3],
    repeat_shadowport_shadow: ['섀도포트 반복 의뢰: 골목 정찰', 'shadowport', '항구 감시자 렌', 'shadow', 11, null, 4],
    repeat_shadowport_hide: ['섀도포트 반복 의뢰: 검은 가죽 거래', 'shadowport', '정보상 카일', null, 0, 'black_hide', 4],
    repeat_sylvania_feather: ['실바니아 반복 의뢰: 깃털 수집', 'sylvania', '깃털 수집가 루루', null, 0, 'hard_feather', 5],
    repeat_sylvania_bug: ['실바니아 반복 의뢰: 숲길 방역', 'sylvania', '숲길 안내원 피아', 'bug', 12, null, 5],
    repeat_irondeep_ore: ['아이언딥 반복 의뢰: 광석 조각 납품', 'irondeep', '광부 토르', null, 0, 'ore_piece', 6],
    repeat_irondeep_golem: ['아이언딥 반복 의뢰: 골렘 제어', 'irondeep', '용광로 관리인 다나', 'ore', 12, null, 6],
    repeat_frosthall_ice: ['프로스트홀 반복 의뢰: 얼음 조각 채집', 'frosthall', '얼음 채집꾼 유리', null, 0, 'ice_shard', 7],
    repeat_frosthall_spirit: ['프로스트홀 반복 의뢰: 냉기 진정', 'frosthall', '북풍 감시자 노엘라', 'ice', 13, null, 7],
    repeat_solas_scale: ['솔라스 반복 의뢰: 사막 비늘 납품', 'solas', '사막 상인 아딘', null, 0, 'desert_scale', 8],
    repeat_solas_lizard: ['솔라스 반복 의뢰: 오아시스 방어', 'solas', '오아시스 수비병 라샤', 'desert', 14, null, 8],
    repeat_nocturn_core: ['노크턴 반복 의뢰: 폐허의 핵 회수', 'nocturn', '폐허 조사관 벨', null, 0, 'ruin_core', 9],
    repeat_nocturn_guardian: ['노크턴 반복 의뢰: 수호자 잠재우기', 'nocturn', '밤의 파수꾼 케르', 'ruin', 15, null, 9]
  };

  function townRank(id) {
    const i = TOWN_ORDER_FOR_REWARD.indexOf(id || game.townId || 'lumina');
    return Math.max(0, i);
  }

  function scaledReward(townId, kind) {
    const rank = townRank(townId);
    const lv = Math.max(1, (game.player && game.player.level) || 1);
    if (kind === 'gold') return Math.floor(120 + rank * 85 + lv * (10 + rank * 2));
    return Math.floor(140 + rank * 115 + lv * (15 + rank * 3));
  }

  function ensureRepeatQuestDefinitions() {
    if (typeof QUESTS !== 'object') return;
    Object.keys(REPEAT_QUEST_DEFS).forEach(function (id) {
      const d = REPEAT_QUEST_DEFS[id];
      const goals = [];
      if (d[3]) goals.push({ type: 'kill', family: d[3], need: d[4], count: 0 });
      if (d[5]) goals.push({ type: 'item', itemId: d[5], need: 8 + d[6], count: 0 });
      QUESTS[id] = {
        id,
        title: d[0],
        town: d[1],
        npc: d[2],
        repeatable: true,
        desc: '반복 의뢰입니다. 완료 후 다시 받을 수 있습니다.',
        goals,
        rewardGold: scaledReward(d[1], 'gold'),
        rewardExp: scaledReward(d[1], 'exp')
      };
    });
  }

  function townLayerPlatforms() {
    const width = Math.max(4300, game.width || 4300);
    return [
      { x: 0, y: game.ground, w: width, h: 24, floor: 0, townFloor: true },
      { x: 0, y: 505, w: 820, h: 24, floor: 1, townFloor: true },
      { x: 960, y: 505, w: 760, h: 24, floor: 1, townFloor: true },
      { x: 1880, y: 505, w: 880, h: 24, floor: 1, townFloor: true },
      { x: 3040, y: 505, w: 840, h: 24, floor: 1, townFloor: true },
      { x: 520, y: 390, w: 820, h: 24, floor: 2, townFloor: true },
      { x: 1600, y: 390, w: 960, h: 24, floor: 2, townFloor: true },
      { x: 2860, y: 390, w: 860, h: 24, floor: 2, townFloor: true },
      { x: 1120, y: 275, w: 780, h: 24, floor: 3, townFloor: true },
      { x: 2440, y: 275, w: 780, h: 24, floor: 3, townFloor: true }
    ];
  }

  function townLadders() {
    return [
      { x: 350, y1: 505, y2: game.ground, town: true },
      { x: 1120, y1: 390, y2: 505, town: true },
      { x: 1680, y1: 275, y2: 390, town: true },
      { x: 2140, y1: 505, y2: game.ground, town: true },
      { x: 2380, y1: 390, y2: 505, town: true },
      { x: 2880, y1: 275, y2: 390, town: true },
      { x: 3300, y1: 505, y2: game.ground, town: true }
    ];
  }

  function addTownRepeatNpcs() {
    const list = TOWN_REPEAT_NPCS[game.townId] || [];
    const existing = new Set((game.npcs || []).map(function (n) { return n.name + ':' + (n.quest || ''); }));
    list.forEach(function (npc) {
      const key = npc.name + ':' + npc.quest;
      if (existing.has(key)) return;
      game.npcs.push(Object.assign({ y: game.ground }, npc));
    });
  }

  const oldLoadTown = typeof loadTown === 'function' ? loadTown : null;
  if (oldLoadTown) {
    loadTown = function (townId) {
      const ret = oldLoadTown.apply(this, arguments);
      try {
        ensureRepeatQuestDefinitions();
        game.platforms = townLayerPlatforms();
        game.ladders = townLadders();
        addTownRepeatNpcs();
      } catch (err) {
        console.error('town ladder/repeat npc patch failed', err);
      }
      return ret;
    };
  }

  function getLadderAt(x, y) {
    if (!Array.isArray(game.ladders)) return null;
    for (const l of game.ladders) {
      const top = Math.min(l.y1, l.y2);
      const bottom = Math.max(l.y1, l.y2);
      if (Math.abs(x - l.x) <= 30 && y >= top - 18 && y <= bottom + 22) return l;
    }
    return null;
  }

  function platformTopAt(x, y, vy) {
    let bestY = game.ground;
    const wasFalling = vy >= 0;
    (game.platforms || []).forEach(function (pf) {
      if (!pf) return;
      const insideX = x > pf.x - 24 && x < pf.x + pf.w + 24;
      const nearTop = y >= pf.y - 18 && y <= pf.y + 30;
      if (wasFalling && insideX && nearTop && pf.y < bestY) bestY = pf.y;
    });
    return bestY;
  }

  updatePlayer = function (dt) {
    const p = game.player;
    if (!p) return;

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
    const up = keys.has('w') || keys.has('arrowup');
    const down = keys.has('s') || keys.has('arrowdown');
    const locked = !!(game.dialog || game.taxiOpen || game.shopOpen || game.blacksmithOpen);
    const ladder = getLadderAt(p.x, p.y - 18) || getLadderAt(p.x, p.y - 72);
    const wantsClimb = ladder && (up || down || p.climbing);

    if (!locked) {
      if (wantsClimb) {
        const top = Math.min(ladder.y1, ladder.y2);
        const bottom = Math.max(ladder.y1, ladder.y2);
        p.climbing = true;
        p.grounded = false;
        p.vx = 0;
        p.vy = 0;
        p.x += (ladder.x - p.x) * Math.min(1, dt * 10);
        if (up) p.y -= 215 * dt;
        else if (down) p.y += 215 * dt;
        if (p.y < top) { p.y = top; p.climbing = false; p.grounded = true; }
        if (p.y > bottom) { p.y = bottom; p.climbing = false; p.grounded = true; }
      } else {
        p.climbing = false;
        if (left) { p.vx = -p.speed; p.face = -1; }
        else if (right) { p.vx = p.speed; p.face = 1; }
        else {
          p.vx *= Math.pow(0.001, dt);
          if (Math.abs(p.vx) < 2) p.vx = 0;
        }
        if (jump && p.grounded) {
          p.vy = -720; // upper town floors can be reached even without using a ladder perfectly
          p.grounded = false;
        }
      }
    }

    if (!p.climbing) {
      p.vy += 1550 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.grounded = false;

      const topY = platformTopAt(p.x, p.y, p.vy);
      if (p.y >= topY) {
        p.y = topY;
        p.vy = 0;
        p.grounded = true;
      }
    }

    p.x = clamp(p.x, 70, game.width - 80);
    p.attackTime = Math.max(0, (p.attackTime || 0) - dt);
    p.invincible = Math.max(0, (p.invincible || 0) - dt);
    p.hurtTime = Math.max(0, (p.hurtTime || 0) - dt);
    p.animTime += dt;

    if (p.climbing) p.anim = 'walk';
    else if (p.attackTime > 0) p.anim = 'attack';
    else if (!p.grounded) p.anim = 'jump';
    else if (Math.abs(p.vx) > 10) p.anim = 'walk';
    else p.anim = 'idle';
  };

  const oldDrawTownObjects = typeof drawTownObjects === 'function' ? drawTownObjects : null;
  if (oldDrawTownObjects) {
    drawTownObjects = function (town) {
      oldDrawTownObjects.apply(this, arguments);
      if (!game || game.mode !== 'town') return;
      const theme = (town && town.theme) || 'grass';
      ctx.save();
      (game.platforms || []).filter(function (pf) { return pf.townFloor && pf.y < game.ground; }).forEach(function (pf, i) {
        ctx.fillStyle = theme === 'desert' ? '#d1a861' : theme === 'ice' ? '#bfefff' : '#d6b36b';
        roundRect(ctx, pf.x, pf.y, pf.w, pf.h, 9);
        ctx.fillStyle = 'rgba(90,54,20,0.25)';
        for (let x = pf.x + 18; x < pf.x + pf.w - 30; x += 120) ctx.fillRect(x, pf.y + 9, 70, 5);
        if (i % 2 === 0) {
          ctx.fillStyle = theme === 'desert' ? '#c8954e' : '#b98146';
          roundRect(ctx, pf.x + 86, pf.y - 104, 145, 104, 14);
          ctx.fillStyle = '#3b2416'; ctx.fillRect(pf.x + 142, pf.y - 62, 32, 62);
          ctx.fillStyle = '#fff7bd'; ctx.fillRect(pf.x + 105, pf.y - 78, 36, 28); ctx.fillRect(pf.x + 176, pf.y - 78, 36, 28);
        }
      });
      (game.ladders || []).forEach(function (l) {
        if (!l.town && game.mode === 'town') return;
        const top = Math.min(l.y1, l.y2), bottom = Math.max(l.y1, l.y2);
        ctx.strokeStyle = '#7c4a22'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(l.x - 11, top); ctx.lineTo(l.x - 11, bottom); ctx.moveTo(l.x + 11, top); ctx.lineTo(l.x + 11, bottom); ctx.stroke();
        ctx.lineWidth = 4;
        for (let y = top + 14; y < bottom; y += 28) { ctx.beginPath(); ctx.moveTo(l.x - 13, y); ctx.lineTo(l.x + 13, y); ctx.stroke(); }
      });
      ctx.restore();
    };
  }

  const oldAcceptOrCompleteQuest = typeof acceptOrCompleteQuest === 'function' ? acceptOrCompleteQuest : null;
  acceptOrCompleteQuest = function (id) {
    ensureRepeatQuestDefinitions();
    const qBase = QUESTS[id];
    if (!qBase || !qBase.repeatable) {
      return oldAcceptOrCompleteQuest ? oldAcceptOrCompleteQuest.apply(this, arguments) : undefined;
    }

    let q = (quests.active || []).find(function (item) { return item && item.id === id; });
    if (!q) {
      q = JSON.parse(JSON.stringify(qBase));
      q.rewardGold = scaledReward(q.town, 'gold');
      q.rewardExp = scaledReward(q.town, 'exp');
      quests.active.push(q);
      makeText('반복 퀘스트 수락!', game.player.x, game.player.y - 90, '#ffe066');
      if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
      return;
    }

    if (typeof syncQuestItems === 'function') syncQuestItems(q);
    const complete = (q.goals || []).every(function (goal) { return (goal.count || 0) >= (goal.need || 0); });
    if (!complete) {
      makeText('아직 완료 조건이 부족합니다.', game.player.x, game.player.y - 90, '#ffdd99');
      return;
    }

    const gold = scaledReward(q.town, 'gold');
    const exp = scaledReward(q.town, 'exp');
    wallet.gold += gold;
    if (typeof addExp === 'function') addExp(exp);
    quests.active = quests.active.filter(function (item) { return item && item.id !== q.id; });
    makeText('반복 퀘스트 완료!', game.player.x, game.player.y - 95, '#c0eb75');
    makeText('+' + gold + '원', game.player.x, game.player.y - 120, '#ffd43b');
    if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
  };

  const oldCompleteQuest = typeof completeQuest === 'function' ? completeQuest : null;
  if (oldCompleteQuest) {
    completeQuest = function (q) {
      if (q && q.rewardGold) q.rewardGold = Math.max(q.rewardGold, scaledReward(q.town || game.townId, 'gold'));
      if (q && q.rewardExp) q.rewardExp = Math.max(q.rewardExp, scaledReward(q.town || game.townId, 'exp'));
      return oldCompleteQuest.apply(this, arguments);
    };
  }

  const oldMakeText = typeof makeText === 'function' ? makeText : null;
  if (oldMakeText) {
    makeText = function (text) {
      if (typeof text === 'string') {
        text = text.replace(/Gold/g, '원').replace(/골드/g, '원').replace(/메소/g, '원').replace(/(\d+)G\b/g, '$1원');
      }
      const args = Array.prototype.slice.call(arguments);
      args[0] = text;
      return oldMakeText.apply(this, args);
    };
  }

  const oldDraw = typeof draw === 'function' ? draw : null;
  if (oldDraw && ctx && ctx.fillText) {
    draw = function () {
      const originalFillText = ctx.fillText;
      ctx.fillText = function (text) {
        if (typeof text === 'string') {
          text = text.replace(/Gold/g, '원').replace(/골드/g, '원').replace(/메소/g, '원').replace(/(\d+)G\b/g, '$1원');
        }
        const args = Array.prototype.slice.call(arguments);
        args[0] = text;
        return originalFillText.apply(this, args);
      };
      try { return oldDraw.apply(this, arguments); }
      finally { ctx.fillText = originalFillText; }
    };
  }

  const oldDrawDrops = typeof drawDrops === 'function' ? drawDrops : null;
  if (oldDrawDrops) {
    drawDrops = function () {
      oldDrawDrops.apply(this, arguments);
      // no extra drawing; kept as a stable hook after the currency text wrapper
    };
  }

  const oldDamageMonster = typeof damageMonster === 'function' ? damageMonster : null;
  if (oldDamageMonster) {
    damageMonster = function (m, skill) {
      if (m) {
        m.aggroUntil = performance.now() + 10000;
        m.aggroByPlayer = true;
      }
      return oldDamageMonster.apply(this, arguments);
    };
  }

  function monsterIsAggro(m) {
    return !!(m && m.aggroByPlayer && (!m.aggroUntil || m.aggroUntil > performance.now()));
  }

  function fixMonsterFloor(m) {
    if (!m) return;
    if (!Number.isFinite(m.floorY)) m.floorY = m.spawnY || m.y || game.ground;
    m.y = m.floorY;
    m.spawnY = m.floorY;
  }

  function hurtPlayerOnce(amount, sourceX) {
    const p = game.player;
    if (!p || p.invincible > 0) return;
    const damage = Math.max(1, Math.floor(amount - p.defense * 0.45));
    p.hp = Math.max(0, p.hp - damage);
    p.invincible = 0.9;
    p.hurtTime = 0.22;
    p.vx = (p.x < sourceX ? -1 : 1) * 150;
    makeText('-' + damage, p.x, p.y - 90, '#ff8787');
  }

  function patrolMonster(m, dt) {
    if (!m.patrolDir) m.patrolDir = Math.random() < 0.5 ? -1 : 1;
    if (m.x < m.baseX - 180) m.patrolDir = 1;
    if (m.x > m.baseX + 180) m.patrolDir = -1;
    m.x += m.patrolDir * (12 + Math.sin((m.time || 0) * 1.2) * 3) * dt;
    m.face = m.patrolDir;
    m.x = clamp(m.x, m.baseX - 190, m.baseX + 190);
  }

  function chaseMonster(m, dt, dx, dist, dy) {
    if (dist < 430 && dy < 130) {
      m.face = dx > 0 ? 1 : -1;
      m.x += m.face * ((m.type && m.type.speed) || 32) * dt;
      m.x = clamp(m.x, m.baseX - 260, m.baseX + 260);
    } else patrolMonster(m, dt);
  }

  updateMonsters = function (dt) {
    if (!game || game.mode !== 'hunt') return;
    if (!Array.isArray(game.monsters)) game.monsters = [];
    game.monsters.forEach(function (m) {
      if (!m) return;
      fixMonsterFloor(m);
      if (m.dead) return;
      if ((m.hp || 0) <= 0) { if (typeof killMonster === 'function') killMonster(m); return; }
      m.time = (m.time || 0) + dt;
      m.hit = Math.max(0, (m.hit || 0) - dt);
      m.attackCooldown = Math.max(0, (m.attackCooldown || 0) - dt);
      m.aiCooldown = Math.max(0, (m.aiCooldown || 0) - dt);
      const dx = game.player.x - m.x;
      const dist = Math.abs(dx);
      const dy = Math.abs(game.player.y - m.y);

      if (!monsterIsAggro(m)) {
        patrolMonster(m, dt);
        return;
      }

      const kind = m.aiKind || (m.type && m.type.gimmick) || 'normal';
      if (kind === 'charge' && dist < 470 && dy < 90 && m.aiCooldown <= 0) {
        m.face = dx > 0 ? 1 : -1;
        m.x += m.face * (((m.type && m.type.chargeSpeed) || 420) * dt);
        m.aiCooldown = 0.18;
        if (Math.abs(game.player.x - m.x) < 58 && Math.abs(game.player.y - m.y) < 90) hurtPlayerOnce(((m.type && m.type.atk) || 8) * 1.45, m.x);
      } else if (kind === 'ranged' && dist < 560 && dy < 135 && m.aiCooldown <= 0 && typeof game.enemyProjectiles !== 'undefined') {
        m.face = dx > 0 ? 1 : -1;
        game.enemyProjectiles = game.enemyProjectiles || [];
        game.enemyProjectiles.push({ x: m.x + m.face * 24, y: m.y - 44, vx: m.face * (((m.type && m.type.projectileSpeed) || 280)), vy: 0, life: 2.0, face: m.face, kind: 'manaBolt', color: '#74c0fc', damage: (m.type && m.type.atk) || 8, from: m.uid });
        m.aiCooldown = ((m.type && m.type.projectileCooldown) || 2.2) + Math.random() * 0.5;
      } else {
        chaseMonster(m, dt, dx, dist, dy);
      }

      if (Math.abs(game.player.x - m.x) < 48 && Math.abs(game.player.y - m.y) < 85) {
        hurtPlayerOnce((m.type && m.type.atk) || 5, m.x);
      }
    });
  };

  // Apply when this patch is loaded after the player is already in a town.
  try {
    ensureRepeatQuestDefinitions();
    if (game && game.mode === 'town') {
      game.platforms = townLayerPlatforms();
      game.ladders = townLadders();
      addTownRepeatNpcs();
    }
  } catch (_) {}
})();


/* =========================================================
   AIRLESS MONSTER / HALF SPAWN / TOWN-UNIQUE MONSTER PATCH 01
   - Monsters no longer walk in the air; every monster snaps to the nearest floor below it.
   - Remote players are drawn on the nearest valid floor if their saved y is unsupported.
   - Hunting fields spawn about half as many monsters, spread farther apart.
   - Every town now uses a more distinct monster family set.
   - Multiplayer monster sync shares HP/death only, not walking position, to remove jitter.
========================================================= */
(function () {
  if (window.__PIXEL_RPG_AIRLESS_MONSTER_HALF_SPAWN_PATCH_01__) return;
  window.__PIXEL_RPG_AIRLESS_MONSTER_HALF_SPAWN_PATCH_01__ = true;

  const EXTRA_FAMILY_DATA = {
    leaf_sprite: { name: '나뭇잎 요정', drop: 'hard_feather', color: '#65c86f', shape: 'spirit' },
    moss_pig: { name: '이끼 멧돼지', drop: 'mushroom_spore', color: '#6a8f47', shape: 'boar' },
    arcane_wisp: { name: '비전 위습', drop: 'blue_crystal', color: '#9d7cff', shape: 'spirit' },
    rune_mush: { name: '룬 버섯', drop: 'blue_crystal', color: '#b46cff', shape: 'mushroom' },
    iron_tusk: { name: '강철 엄니', drop: 'rusted_blade', color: '#8b7358', shape: 'boar' },
    shield_golem: { name: '방패 골렘', drop: 'ore_piece', color: '#8b949e', shape: 'golem' },
    dock_rat: { name: '항구 쥐도적', drop: 'black_hide', color: '#5b4a7b', shape: 'lizard' },
    night_bat: { name: '밤그림자 박쥐', drop: 'black_hide', color: '#4b3b6f', shape: 'bug' },
    thorn_bug: { name: '가시 벌레', drop: 'hard_feather', color: '#5faf6a', shape: 'bug' },
    wind_hawk: { name: '바람 매', drop: 'hard_feather', color: '#7fc7a8', shape: 'bug' },
    copper_golem: { name: '동광 골렘', drop: 'ore_piece', color: '#a97142', shape: 'golem' },
    cave_mole: { name: '광산 두더지', drop: 'ore_piece', color: '#7a6252', shape: 'boar' },
    frost_wolf: { name: '서리 늑대', drop: 'ice_shard', color: '#9adfff', shape: 'lizard' },
    snow_imp: { name: '눈 장난꾼', drop: 'ice_shard', color: '#cfefff', shape: 'spirit' },
    dune_scorpion: { name: '모래 전갈', drop: 'desert_scale', color: '#c28a4a', shape: 'bug' },
    sun_lizard: { name: '태양 도마뱀', drop: 'desert_scale', color: '#e0a05b', shape: 'lizard' },
    broken_armor: { name: '부서진 갑주', drop: 'ruin_core', color: '#6d7485', shape: 'golem' },
    cursed_orb: { name: '저주받은 구체', drop: 'ruin_core', color: '#7c5fb3', shape: 'spirit' }
  };

  Object.keys(EXTRA_FAMILY_DATA).forEach(function (id) {
    FAMILY_DATA[id] = Object.assign({ family: id }, EXTRA_FAMILY_DATA[id]);
  });

  const UNIQUE_HUNT_FAMILIES = {
    lumina_field: ['slime', 'leaf_sprite'],
    greenwood_forest: ['thorn_bug', 'moss_pig'],
    ellenium_grove: ['arcane_wisp', 'rune_mush'],
    valor_wall: ['iron_tusk', 'shield_golem'],
    shadow_alley: ['dock_rat', 'night_bat'],
    sylvania_range: ['wind_hawk', 'thorn_bug'],
    irondeep_mine: ['copper_golem', 'cave_mole'],
    frost_cave: ['frost_wolf', 'snow_imp'],
    solas_dune: ['dune_scorpion', 'sun_lizard'],
    nocturn_ruins: ['broken_armor', 'cursed_orb']
  };

  Object.keys(UNIQUE_HUNT_FAMILIES).forEach(function (huntId) {
    if (HUNTS[huntId]) HUNTS[huntId].families = UNIQUE_HUNT_FAMILIES[huntId].slice();
  });

  function isFiniteNumber(v) { return Number.isFinite(Number(v)); }

  function getFloorYAt(x, currentY) {
    let best = game.ground || 560;
    const fromY = isFiniteNumber(currentY) ? Number(currentY) : -9999;
    const platforms = Array.isArray(game.platforms) ? game.platforms : [];

    platforms.forEach(function (pf) {
      if (!pf) return;
      const left = (pf.x || 0) - 20;
      const right = (pf.x || 0) + (pf.w || 0) + 20;
      const y = Number(pf.y);
      if (!Number.isFinite(y)) return;
      if (x >= left && x <= right && y >= fromY - 4 && y <= best) best = y;
    });

    return best;
  }

  function getNearestFloorYAt(x, y) {
    const floors = [{ y: game.ground || 560, dist: Math.abs((game.ground || 560) - y) }];
    (game.platforms || []).forEach(function (pf) {
      if (!pf) return;
      const left = (pf.x || 0) - 26;
      const right = (pf.x || 0) + (pf.w || 0) + 26;
      if (x < left || x > right) return;
      floors.push({ y: pf.y, dist: Math.abs(pf.y - y) });
    });
    floors.sort(function (a, b) { return a.dist - b.dist; });
    return floors[0].y;
  }

  function lockMonsterToFloor(m) {
    if (!m) return;
    const x = Number.isFinite(m.x) ? m.x : (m.baseX || 100);
    const floor = getNearestFloorYAt(x, Number.isFinite(m.y) ? m.y : (m.spawnY || game.ground || 560));
    m.y = floor;
    m.spawnY = floor;
    m.vy = 0;
  }

  function getWalkSegmentForFloor(floorY) {
    const segments = [];
    (game.platforms || []).forEach(function (pf) {
      if (!pf || Math.abs((pf.y || 0) - floorY) > 2) return;
      segments.push({ x1: (pf.x || 0) + 35, x2: (pf.x || 0) + (pf.w || 0) - 35, y: pf.y });
    });
    segments.push({ x1: 90, x2: Math.max(120, (game.width || 5400) - 120), y: game.ground || 560 });
    return segments.filter(function (s) { return s.x2 > s.x1; });
  }

  function floorSegmentAt(x, floorY) {
    const segs = getWalkSegmentForFloor(floorY);
    for (let i = 0; i < segs.length; i++) {
      const s = segs[i];
      if (x >= s.x1 && x <= s.x2 && Math.abs(s.y - floorY) < 4) return s;
    }
    return segs.find(function (s) { return Math.abs(s.y - floorY) < 4; }) || segs[segs.length - 1];
  }

  const oldMakeMonsterType = typeof makeMonsterType === 'function' ? makeMonsterType : null;
  if (oldMakeMonsterType) {
    makeMonsterType = function (family, level) {
      const type = oldMakeMonsterType.apply(this, arguments);
      const extra = FAMILY_DATA[family] || {};
      type.family = family;
      type.name = type.name && extra.name ? type.name.replace((FAMILY_DATA.slime && FAMILY_DATA.slime.name) || '슬라임', extra.name) : (type.name || extra.name || family);
      if (extra.name) {
        const prefix = MONSTER_PREFIX[level % MONSTER_PREFIX.length] || '';
        type.name = (prefix ? prefix + ' ' : '') + extra.name;
      }
      type.color = extra.color || type.color;
      type.shape = extra.shape || type.shape;
      type.drop = extra.drop || type.drop;
      type.speed = Math.max(12, Math.min(type.speed || 24, 34));
      type.respawn = Math.max(type.respawn || 9000, 11000 + level * 260);
      return type;
    };
  }

  spawnMonsters = function (hunt) {
    game.monsters = [];
    hunt = hunt || getHunt(game.huntId);
    const families = (UNIQUE_HUNT_FAMILIES[game.huntId] || hunt.families || ['slime']).slice();

    // About half the old count: 24 instead of roughly 47, with wider spacing and balanced floors.
    const floors = [];
    floors.push(game.ground || 610);
    (game.platforms || []).forEach(function (pf) {
      if (pf && Number.isFinite(pf.y) && !floors.includes(pf.y)) floors.push(pf.y);
    });
    floors.sort(function (a, b) { return b - a; });

    const total = 24;
    for (let i = 0; i < total; i++) {
      const floorY = floors[i % floors.length] || (game.ground || 610);
      const segs = getWalkSegmentForFloor(floorY);
      const seg = segs[Math.floor(i / floors.length) % segs.length] || { x1: 120, x2: game.width - 120 };
      const slot = Math.floor(i / Math.max(1, floors.length));
      const spread = Math.max(220, (seg.x2 - seg.x1) / 6);
      const x = Math.max(seg.x1 + 30, Math.min(seg.x2 - 30, seg.x1 + 90 + slot * spread + (i % 2) * 110));
      const family = families[i % families.length];
      const type = makeMonsterType(family, (hunt.baseLevel || 1) + Math.floor(i / 4));

      game.monsters.push({
        uid: Math.random().toString(36).slice(2),
        sharedId: (game.huntId || hunt.town || 'hunt') + ':' + i,
        sharedIndex: i,
        type,
        x,
        baseX: x,
        y: floorY,
        spawnY: floorY,
        hp: type.hp,
        maxHp: type.hp,
        face: i % 2 ? -1 : 1,
        time: Math.random() * 10,
        hit: 0,
        dead: false,
        attackCooldown: 0,
        poison: 0,
        aggro: false,
        targetX: x + (i % 2 ? -90 : 90)
      });
    }
  };

  function smoothMonsterWalk(m, dt) {
    if (!m || m.dead) return;
    lockMonsterToFloor(m);
    const floorY = m.y;
    const seg = floorSegmentAt(m.x, floorY);
    if (!seg) return;

    const playerNearSameFloor = game.player && Math.abs((game.player.y || 0) - floorY) < 55 && Math.abs((game.player.x || 0) - m.x) < 360;
    let desired = m.face || 1;

    if (m.aggro && playerNearSameFloor) {
      desired = game.player.x > m.x ? 1 : -1;
    } else {
      if (!m.targetX || Math.abs(m.x - m.targetX) < 12 || m.x <= seg.x1 + 6 || m.x >= seg.x2 - 6) {
        const span = Math.min(260, Math.max(100, (seg.x2 - seg.x1) * 0.38));
        const center = Math.max(seg.x1 + span, Math.min(seg.x2 - span, m.baseX || m.x));
        m.targetX = center + (Math.random() < 0.5 ? -1 : 1) * (80 + Math.random() * span);
        m.targetX = Math.max(seg.x1 + 25, Math.min(seg.x2 - 25, m.targetX));
      }
      desired = m.targetX > m.x ? 1 : -1;
    }

    m.face = desired;
    const speed = (m.aggro && playerNearSameFloor ? 1.25 : 0.55) * ((m.type && m.type.speed) || 22);
    m.x += desired * speed * dt;

    if (m.x < seg.x1) { m.x = seg.x1; m.face = 1; m.targetX = Math.min(seg.x2 - 30, m.x + 160); }
    if (m.x > seg.x2) { m.x = seg.x2; m.face = -1; m.targetX = Math.max(seg.x1 + 30, m.x - 160); }
    m.y = floorY;
  }

  updateMonsters = function (dt) {
    if (game.mode !== 'hunt') return;

    game.monsters.forEach(function (m) {
      if (!m) return;
      if (!m.dead && (m.hp || 0) <= 0) killMonster(m);
      if (m.dead) return;

      m.time = (m.time || 0) + dt;
      m.hit = Math.max(0, (m.hit || 0) - dt);
      m.attackCooldown = Math.max(0, (m.attackCooldown || 0) - dt);
      smoothMonsterWalk(m, dt);

      // Monsters only attack after being hit or when explicitly aggroed.
      if (!m.aggro) return;

      const touchX = Math.abs(game.player.x - m.x) < 48;
      const touchY = Math.abs(game.player.y - m.y) < 85;
      if (touchX && touchY && game.player.invincible <= 0) {
        const damage = Math.max(1, Math.floor((m.type.atk || 1) - game.player.defense * 0.45));
        game.player.hp = Math.max(0, game.player.hp - damage);
        game.player.invincible = 0.9;
        game.player.hurtTime = 0.2;
        game.player.vx = -(m.face || 1) * 120;
        makeText(`-${damage}`, game.player.x, game.player.y - 90, '#ff8787');
      }
    });
  };

  const oldDamageMonster = typeof damageMonster === 'function' ? damageMonster : null;
  if (oldDamageMonster) {
    damageMonster = function (m, skill) {
      if (m) m.aggro = true;
      const ret = oldDamageMonster.apply(this, arguments);
      if (m) lockMonsterToFloor(m);
      return ret;
    };
  }

  const oldKillMonster = typeof killMonster === 'function' ? killMonster : null;
  if (oldKillMonster) {
    killMonster = function (m) {
      if (m) lockMonsterToFloor(m);
      return oldKillMonster.apply(this, arguments);
    };
  }

  const oldUpdateDrops = typeof updateDrops === 'function' ? updateDrops : null;
  if (oldUpdateDrops) {
    updateDrops = function (dt) {
      oldUpdateDrops.apply(this, arguments);
      (game.drops || []).forEach(function (d) {
        const floor = getFloorYAt(d.x || 0, d.y || 0);
        if ((d.y || 0) > floor - 10) {
          d.y = floor - 10;
          d.vy = 0;
        }
      });
    };
  }

  // Multiplayer fix: do not accept remote monster x/y walking positions.
  if (typeof mpApplyMonsterSnapshot === 'function') {
    const oldSnapshot = mpApplyMonsterSnapshot;
    mpApplyMonsterSnapshot = function (payload) {
      if (!payload || payload.room !== mpRoomId() || game.mode !== 'hunt') return;
      mpSyncLocalMonsterIds();
      (payload.monsters || []).forEach(function (s) {
        const m = mpFindMonster(s.id, s.index);
        if (!m) return;
        m.sharedId = s.id;
        if (Number.isFinite(s.hp)) m.hp = Math.max(0, Number(s.hp) || 0);
        if (Number.isFinite(s.maxHp)) m.maxHp = Math.max(1, Number(s.maxHp) || m.maxHp || 1);
        m.dead = !!s.dead;
        lockMonsterToFloor(m);
      });
    };
  }

  if (typeof mpApplyMonsterUpdate === 'function') {
    mpApplyMonsterUpdate = function (payload) {
      if (!payload || payload.room !== mpRoomId() || game.mode !== 'hunt') return;
      const m = mpFindMonster(payload.id, payload.index);
      if (!m) return;
      m.sharedId = payload.id || m.sharedId;
      if (Number.isFinite(payload.hp)) m.hp = Math.max(0, payload.hp);
      if (payload.dead) m.dead = true;
      lockMonsterToFloor(m);
    };
  }

  if (typeof mpApplyMonsterRespawn === 'function') {
    mpApplyMonsterRespawn = function (payload) {
      if (!payload || payload.room !== mpRoomId() || game.mode !== 'hunt') return;
      const m = mpFindMonster(payload.id, payload.index);
      if (!m) return;
      m.dead = false;
      m._deathHandled = false;
      m.hp = m.maxHp || (m.type && m.type.hp) || 1;
      const seg = floorSegmentAt(m.baseX || m.x || 120, m.spawnY || game.ground || 610);
      if (seg) m.x = Math.max(seg.x1 + 30, Math.min(seg.x2 - 30, m.baseX || m.x || seg.x1 + 60));
      lockMonsterToFloor(m);
      m.hit = 0;
      m.aggro = false;
    };
  }

  // Remote players cannot visually stand in the air. If their y is unsupported, draw them on the nearest floor.
  if (typeof mpDrawRemotePlayers === 'function') {
    const oldDrawRemotePlayers = mpDrawRemotePlayers;
    mpDrawRemotePlayers = function () {
      if (!game || !game.ready) return;
      const list = Object.values(MP.players || {}).filter(function (p) {
        return p && p.room === mpRoomId() && p.state;
      });
      if (!list.length) return;
      ctx.save();
      ctx.translate(-Math.floor(game.cameraX || 0), 0);
      list.forEach(function (entry) {
        const s = entry.state || {};
        const drawY = getNearestFloorYAt(s.x || 0, s.y || game.ground || 560);
        const fake = {
          x: s.x,
          y: drawY,
          face: s.face || 1,
          anim: s.anim || 'idle',
          animTime: s.animTime || 0,
          hurtTime: 0,
          attackKind: 'fist',
          character: Object.assign({ name: entry.name || s.name || '유저', job: s.job || 'beginner', skin: '#ffd6a6', hair: '#2b160e', hairStyle: 'basic', faceStyle: 'normal' }, s.character || {})
        };
        ctx.globalAlpha = 0.92;
        if (typeof drawPlayer === 'function') drawPlayer(fake, fake.x, fake.y, 0.74);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#dbeafe';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((s.name || entry.name || '유저') + ' Lv.' + (s.level || 1), fake.x, fake.y - 142);
      });
      ctx.restore();
    };
  }
})();


/* =========================================================
   MOBILE / TABLET TOUCH PLAY + TOP 3 RANKING PATCH
   - iPhone / Android / iPad touch controls
   - Uses the same online Render + Socket.IO server
   - Adds Top 3 highest level leaderboard panel
========================================================= */
(function () {
  'use strict';

  const MOBILE_PATCH_VERSION = 'touch-online-leaderboard-01';
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0 || window.matchMedia('(pointer: coarse)').matches;

  function prevent(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  function setKey(key, down) {
    if (!key) return;
    if (down) keys.add(key);
    else keys.delete(key);
  }

  function pulseKey(key, ms) {
    setKey(key, true);
    window.setTimeout(function () { setKey(key, false); }, ms || 120);
  }

  function safeCall(fn) {
    try { if (typeof fn === 'function') fn(); }
    catch (err) { console.warn('[Mobile controls action failed]', err); }
  }

  function button(label, className, holdKey, action, extra) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'prg-touch-btn ' + (className || '');
    b.textContent = label;
    if (extra) Object.keys(extra).forEach(function (k) { b.setAttribute(k, extra[k]); });

    function down(e) {
      prevent(e);
      if (holdKey) setKey(holdKey, true);
    }
    function up(e) {
      prevent(e);
      if (holdKey) setKey(holdKey, false);
    }
    function tap(e) {
      prevent(e);
      if (action) action();
      else if (holdKey) pulseKey(holdKey, 120);
    }

    b.addEventListener('touchstart', down, { passive: false });
    b.addEventListener('touchend', up, { passive: false });
    b.addEventListener('touchcancel', up, { passive: false });
    b.addEventListener('mousedown', down);
    b.addEventListener('mouseup', up);
    b.addEventListener('mouseleave', up);
    b.addEventListener('click', tap);
    return b;
  }

  function ensureTouchCss() {
    if (document.getElementById('pixel-rpg-touch-style')) return;
    const style = document.createElement('style');
    style.id = 'pixel-rpg-touch-style';
    style.textContent = `
      html, body {
        touch-action: none;
        overscroll-behavior: none;
        -webkit-user-select: none;
        user-select: none;
      }
      #pixel-rpg-touch-controls {
        position: fixed;
        inset: 0;
        z-index: 10020;
        pointer-events: none;
        display: none;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      body.pixel-rpg-touch-mode #pixel-rpg-touch-controls { display: block; }
      #pixel-rpg-touch-controls .left-pad,
      #pixel-rpg-touch-controls .right-pad,
      #pixel-rpg-touch-controls .top-pad {
        position: absolute;
        pointer-events: auto;
      }
      #pixel-rpg-touch-controls .left-pad {
        left: max(12px, env(safe-area-inset-left));
        bottom: max(18px, env(safe-area-inset-bottom));
        width: 210px;
        height: 156px;
      }
      #pixel-rpg-touch-controls .right-pad {
        right: max(12px, env(safe-area-inset-right));
        bottom: max(18px, env(safe-area-inset-bottom));
        width: 312px;
        height: 182px;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: repeat(2, 1fr);
        gap: 9px;
      }
      #pixel-rpg-touch-controls .top-pad {
        right: max(12px, env(safe-area-inset-right));
        top: max(10px, env(safe-area-inset-top));
        display: flex;
        gap: 8px;
        align-items: center;
      }
      .prg-touch-btn {
        border: 1px solid rgba(255,255,255,0.30);
        color: #fff;
        background: rgba(15, 23, 42, 0.58);
        box-shadow: 0 8px 20px rgba(0,0,0,0.26), inset 0 1px rgba(255,255,255,0.18);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        border-radius: 18px;
        font-weight: 900;
        font-size: 15px;
        line-height: 1;
        text-shadow: 0 1px 2px rgba(0,0,0,0.6);
        touch-action: none;
      }
      .prg-touch-btn:active { transform: translateY(2px) scale(0.98); background: rgba(37, 99, 235, 0.68); }
      .prg-touch-dir {
        position: absolute;
        width: 70px;
        height: 62px;
      }
      .prg-touch-left { left: 0; bottom: 34px; }
      .prg-touch-right { left: 140px; bottom: 34px; }
      .prg-touch-up { left: 70px; bottom: 88px; }
      .prg-touch-down { left: 70px; bottom: 0; }
      .prg-touch-main { background: rgba(30, 64, 175, 0.66); }
      .prg-touch-skill { background: rgba(88, 28, 135, 0.62); }
      .prg-touch-menu { padding: 9px 12px; border-radius: 14px; font-size: 12px; min-width: 58px; }
      #pixel-rpg-rank-panel {
        position: fixed;
        right: max(12px, env(safe-area-inset-right));
        top: calc(max(10px, env(safe-area-inset-top)) + 50px);
        z-index: 10025;
        display: none;
        width: min(340px, calc(100vw - 24px));
        padding: 13px;
        border-radius: 16px;
        color: #fff;
        background: rgba(15, 23, 42, 0.90);
        border: 1px solid rgba(147,197,253,0.52);
        box-shadow: 0 14px 34px rgba(0,0,0,0.35);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      }
      #pixel-rpg-rank-panel.open { display: block; }
      #pixel-rpg-rank-panel .rank-title { font-size: 15px; font-weight: 900; color: #fde68a; margin-bottom: 8px; }
      #pixel-rpg-rank-panel .rank-row {
        display: grid;
        grid-template-columns: 38px 1fr auto;
        gap: 8px;
        padding: 8px 6px;
        border-radius: 10px;
        background: rgba(255,255,255,0.055);
        margin-bottom: 6px;
        align-items: center;
      }
      #pixel-rpg-rank-panel .rank-place { font-weight: 900; color: #93c5fd; }
      #pixel-rpg-rank-panel .rank-name { font-weight: 900; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      #pixel-rpg-rank-panel .rank-job { color: #cbd5e1; font-size: 12px; }
      #pixel-rpg-rank-panel .rank-level { color: #86efac; font-weight: 900; }
      #pixel-rpg-rank-panel .rank-note { color: #cbd5e1; font-size: 12px; margin-top: 8px; }
      @media (pointer: fine) and (min-width: 900px) {
        body:not(.pixel-rpg-force-touch) #pixel-rpg-touch-controls { display: none !important; }
      }
      @media (max-width: 720px) {
        #pixel-rpg-touch-controls .left-pad { width: 178px; height: 136px; }
        .prg-touch-dir { width: 58px; height: 54px; font-size: 13px; }
        .prg-touch-right { left: 116px; bottom: 30px; }
        .prg-touch-up { left: 58px; bottom: 76px; }
        .prg-touch-down { left: 58px; bottom: 0; }
        #pixel-rpg-touch-controls .right-pad { width: 248px; height: 148px; gap: 7px; }
        .prg-touch-btn { font-size: 12px; border-radius: 14px; }
        .prg-touch-menu { min-width: 45px; padding: 8px 9px; }
      }
    `;
    document.head.appendChild(style);
  }

  function ensureLeaderboardPanel() {
    let panel = document.getElementById('pixel-rpg-rank-panel');
    if (panel) return panel;
    panel = document.createElement('div');
    panel.id = 'pixel-rpg-rank-panel';
    panel.innerHTML = '<div class="rank-title">🏆 최고 레벨 TOP 3</div><div class="rank-note">불러오는 중...</div>';
    document.body.appendChild(panel);
    return panel;
  }

  function jobLabel(job) {
    if (typeof JOBS !== 'undefined' && JOBS && JOBS[job] && JOBS[job].name) return JOBS[job].name;
    const map = {
      beginner: '초보자', warrior: '전사', mage: '마법사', rogue: '도적', archer: '궁수',
      paladin: '성기사', berserker: '광전사', cleric: '성직자', summoner: '소환사', gunslinger: '건슬링어',
      lancer: '창기사', mechanic: '기계공', bard: '음유시인', shadow_reaper: '그림자 사신', dragon_knight: '용기사', star_sage: '별의 현자'
    };
    return map[job] || String(job || '초보자');
  }

  async function fetchLeaderboard() {
    const panel = ensureLeaderboardPanel();
    panel.innerHTML = '<div class="rank-title">🏆 최고 레벨 TOP 3</div><div class="rank-note">랭킹을 불러오는 중...</div>';
    try {
      const res = await fetch('/api/leaderboard?limit=3', {
        headers: token ? { Authorization: 'Bearer ' + token } : {}
      });
      const data = await res.json().catch(function () { return {}; });
      if (!res.ok || data.ok === false) throw new Error(data.error || '랭킹 조회 실패');
      const rows = Array.isArray(data.players) ? data.players.slice(0, 3) : [];
      if (!rows.length) {
        panel.innerHTML = '<div class="rank-title">🏆 최고 레벨 TOP 3</div><div class="rank-note">아직 랭킹에 표시할 캐릭터가 없습니다.</div>';
        return;
      }
      panel.innerHTML = '<div class="rank-title">🏆 최고 레벨 TOP 3</div>' + rows.map(function (p, i) {
        const name = String(p.name || p.username || '모험가').replace(/[&<>'"]/g, function (ch) { return ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[ch]; });
        const job = String(p.jobName || jobLabel(p.job)).replace(/[&<>'"]/g, function (ch) { return ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'})[ch]; });
        return '<div class="rank-row"><div class="rank-place">#' + (i + 1) + '</div><div><div class="rank-name">' + name + '</div><div class="rank-job">' + job + '</div></div><div class="rank-level">Lv.' + (p.level || 1) + '</div></div>';
      }).join('') + '<div class="rank-note">서버 저장 데이터 기준입니다.</div>';
    } catch (err) {
      panel.innerHTML = '<div class="rank-title">🏆 최고 레벨 TOP 3</div><div class="rank-note">랭킹을 불러오지 못했습니다: ' + String(err.message || err) + '</div>';
    }
  }

  function toggleLeaderboard() {
    const panel = ensureLeaderboardPanel();
    const open = panel.classList.toggle('open');
    if (open) fetchLeaderboard();
  }

  function ensureTouchControls() {
    if (document.getElementById('pixel-rpg-touch-controls')) return;
    ensureTouchCss();
    if (isTouchDevice) document.body.classList.add('pixel-rpg-touch-mode');

    const wrap = document.createElement('div');
    wrap.id = 'pixel-rpg-touch-controls';

    const leftPad = document.createElement('div');
    leftPad.className = 'left-pad';
    leftPad.appendChild(button('←', 'prg-touch-dir prg-touch-left', 'arrowleft'));
    leftPad.appendChild(button('→', 'prg-touch-dir prg-touch-right', 'arrowright'));
    leftPad.appendChild(button('↑', 'prg-touch-dir prg-touch-up', 'arrowup'));
    leftPad.appendChild(button('↓', 'prg-touch-dir prg-touch-down', 's'));

    const rightPad = document.createElement('div');
    rightPad.className = 'right-pad';
    rightPad.appendChild(button('공격', 'prg-touch-main', null, function () { safeCall(basicAttack); }));
    rightPad.appendChild(button('스킬K', 'prg-touch-skill', null, function () { safeCall(function () { useHotSkill('k'); }); }));
    rightPad.appendChild(button('스킬L', 'prg-touch-skill', null, function () { safeCall(function () { useHotSkill('l'); }); }));
    rightPad.appendChild(button('스킬;', 'prg-touch-skill', null, function () { safeCall(function () { useHotSkill('semicolon'); }); }));
    rightPad.appendChild(button('대화/E', '', null, function () { safeCall(interact); }));
    rightPad.appendChild(button('줍기/Z', '', null, function () { safeCall(pickNearbyDrops); }));
    rightPad.appendChild(button('채팅', '', null, function () { window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })); }));
    rightPad.appendChild(button('물약1', '', null, function () { safeCall(function () { useQuickSlot(0); }); }));

    const topPad = document.createElement('div');
    topPad.className = 'top-pad';
    topPad.appendChild(button('가방', 'prg-touch-menu', null, function () { inventory.open = !inventory.open; stats.open = skills.open = quests.open = false; }));
    topPad.appendChild(button('스탯', 'prg-touch-menu', null, function () { stats.open = !stats.open; inventory.open = skills.open = quests.open = false; }));
    topPad.appendChild(button('스킬', 'prg-touch-menu', null, function () { skills.open = !skills.open; inventory.open = stats.open = quests.open = false; }));
    topPad.appendChild(button('퀘스트', 'prg-touch-menu', null, function () { quests.open = !quests.open; inventory.open = stats.open = skills.open = false; }));
    topPad.appendChild(button('랭킹', 'prg-touch-menu', null, toggleLeaderboard));

    wrap.appendChild(leftPad);
    wrap.appendChild(rightPad);
    wrap.appendChild(topPad);
    document.body.appendChild(wrap);
    ensureLeaderboardPanel();

    // Triple tap the top-left area to force controls on desktop testing too.
    let taps = [];
    document.addEventListener('pointerdown', function (e) {
      if (e.clientX > 80 || e.clientY > 80) return;
      const now = Date.now();
      taps = taps.filter(function (t) { return now - t < 900; });
      taps.push(now);
      if (taps.length >= 3) {
        document.body.classList.toggle('pixel-rpg-force-touch');
        document.body.classList.toggle('pixel-rpg-touch-mode');
        taps = [];
      }
    });
  }

  ensureTouchControls();

  // Keep game canvas responsive on mobile orientation changes.
  function resizeCanvasCss() {
    if (!canvas) return;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
  }
  window.addEventListener('resize', resizeCanvasCss);
  window.addEventListener('orientationchange', function () { setTimeout(resizeCanvasCss, 250); });
  resizeCanvasCss();

  console.log('[PixelRPG]', MOBILE_PATCH_VERSION, 'loaded. Touch:', isTouchDevice);
})();


/* =========================================================
   MOBILE / PLATFORM / SELL / SKILL EFFECT REFINEMENT PATCH 01
   - Restores taller ladder-hunt floors with lower jump power
   - Makes players, other players, monsters and drops obey solid floors
   - Adds S/Down platform drop-through and changes manual save key to R
   - Allows merchant to sell a clicked inventory weapon/equipment/etc item
   - Gives every job at least 3 skills and adds rare-job visual effects
========================================================= */
(function () {
  'use strict';
  if (window.__PIXEL_RPG_MOBILE_PLATFORM_SKILL_PATCH_01__) return;
  window.__PIXEL_RPG_MOBILE_PLATFORM_SKILL_PATCH_01__ = true;

  const HUNT_FLOOR_LAYOUT_ID = 'ladder-tall-solid-v4';

  function safeArr(v) { return Array.isArray(v) ? v : []; }
  function nowMs() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }

  function moneyLabel(amount) { return String(Math.floor(amount || 0)) + '원'; }

  function finalHuntPlatforms() {
    const w = Math.max(5600, game.width || 5600);
    const floors = [
      { y: game.ground, ranges: [[0, w]] },
      { y: 500, ranges: [[300, 1820], [2180, 3720], [4050, 5420]] },
      { y: 365, ranges: [[520, 2040], [2460, 3940], [4260, 5360]] },
      { y: 230, ranges: [[780, 2220], [2700, 4120], [4460, 5320]] },
      { y: 105, ranges: [[1120, 2440], [3060, 4300]] }
    ];
    const out = [];
    floors.forEach(function (row, fi) {
      row.ranges.forEach(function (r, ri) {
        out.push({ x: r[0], y: row.y, w: r[1] - r[0], h: 24, floor: fi, solidFloor: true, huntFloor: true, seg: ri });
      });
    });
    return out;
  }

  function finalHuntLadders() {
    return [
      { x: 420, y1: 500, y2: game.ground, label: '1층' },
      { x: 1120, y1: 365, y2: 500, label: '2층' },
      { x: 1720, y1: 230, y2: 365, label: '3층' },
      { x: 1260, y1: 105, y2: 230, label: '4층' },
      { x: 2320, y1: 500, y2: game.ground, label: '1층' },
      { x: 2920, y1: 365, y2: 500, label: '2층' },
      { x: 3540, y1: 230, y2: 365, label: '3층' },
      { x: 3300, y1: 105, y2: 230, label: '4층' },
      { x: 4160, y1: 500, y2: game.ground, label: '1층' },
      { x: 4680, y1: 365, y2: 500, label: '2층' },
      { x: 4980, y1: 230, y2: 365, label: '3층' }
    ];
  }

  function finalTownPlatforms() {
    const width = Math.max(4600, game.width || 4600);
    return [
      { x: 0, y: game.ground, w: width, h: 24, floor: 0, townFloor: true, solidFloor: true },
      { x: 0, y: 505, w: 780, h: 24, floor: 1, townFloor: true, solidFloor: true },
      { x: 940, y: 505, w: 850, h: 24, floor: 1, townFloor: true, solidFloor: true },
      { x: 2000, y: 505, w: 900, h: 24, floor: 1, townFloor: true, solidFloor: true },
      { x: 3160, y: 505, w: 900, h: 24, floor: 1, townFloor: true, solidFloor: true },
      { x: 520, y: 370, w: 860, h: 24, floor: 2, townFloor: true, solidFloor: true },
      { x: 1640, y: 370, w: 980, h: 24, floor: 2, townFloor: true, solidFloor: true },
      { x: 3000, y: 370, w: 900, h: 24, floor: 2, townFloor: true, solidFloor: true },
      { x: 1040, y: 235, w: 900, h: 24, floor: 3, townFloor: true, solidFloor: true },
      { x: 2540, y: 235, w: 920, h: 24, floor: 3, townFloor: true, solidFloor: true }
    ];
  }

  function finalTownLadders() {
    return [
      { x: 350, y1: 505, y2: game.ground, town: true },
      { x: 1080, y1: 370, y2: 505, town: true },
      { x: 1690, y1: 235, y2: 370, town: true },
      { x: 2140, y1: 505, y2: game.ground, town: true },
      { x: 2380, y1: 370, y2: 505, town: true },
      { x: 2920, y1: 235, y2: 370, town: true },
      { x: 3300, y1: 505, y2: game.ground, town: true }
    ];
  }

  const CITY_MONSTER_FAMILIES = {
    lumina: ['lumina_slime', 'leaf_sprite', 'green_mushroom'],
    greenwood: ['thorn_bug', 'moss_boar', 'forest_spore'],
    ellenium: ['arcane_wisp', 'rune_mushroom', 'mana_orb'],
    valor: ['iron_tusk', 'shield_golem', 'training_dummy'],
    shadowport: ['dock_rat', 'night_bat', 'alley_shadow'],
    sylvania: ['feather_bee', 'bark_lizard', 'wild_spore'],
    irondeep: ['ore_golem', 'gear_rat', 'steam_eye'],
    frosthall: ['frost_wolf', 'snow_prankster', 'ice_orb'],
    solas: ['sand_scorpion', 'sun_lizard', 'dune_spirit'],
    nocturn: ['broken_armor', 'cursed_orb', 'ruin_eye']
  };

  const EXTRA_FAMILY_DATA = {
    lumina_slime: ['루미나 젤리', 'slime_jelly', '#68e27c', 'slime'], leaf_sprite: ['잎사귀 요정', 'hard_feather', '#8bd166', 'spirit'], green_mushroom: ['초록 버섯돌이', 'mushroom_spore', '#b77937', 'mushroom'],
    thorn_bug: ['가시 벌레', 'hard_feather', '#6fbf5e', 'bug'], moss_boar: ['이끼 멧돼지', 'rusted_blade', '#7d6a42', 'boar'], forest_spore: ['숲 포자', 'mushroom_spore', '#a86f3a', 'mushroom'],
    arcane_wisp: ['비전 위습', 'blue_crystal', '#9b8cff', 'spirit'], rune_mushroom: ['룬 버섯', 'blue_crystal', '#7dd3fc', 'mushroom'], mana_orb: ['마나 구체', 'blue_crystal', '#60a5fa', 'spirit'],
    iron_tusk: ['강철 엄니', 'rusted_blade', '#8b6f55', 'boar'], shield_golem: ['방패 골렘', 'ore_piece', '#7f8a99', 'golem'], training_dummy: ['훈련 허수아비', 'rusted_blade', '#b98549', 'golem'],
    dock_rat: ['항구 쥐도적', 'black_hide', '#6b5b7b', 'bug'], night_bat: ['밤그림자 박쥐', 'black_hide', '#4b3b63', 'spirit'], alley_shadow: ['골목 그림자', 'black_hide', '#3f355f', 'ogre'],
    feather_bee: ['깃털 벌', 'hard_feather', '#d7c65a', 'bug'], bark_lizard: ['나무껍질 도마뱀', 'desert_scale', '#7e9a55', 'lizard'], wild_spore: ['들꽃 포자', 'mushroom_spore', '#e083b5', 'mushroom'],
    ore_golem: ['광맥 골렘', 'ore_piece', '#7b8794', 'golem'], gear_rat: ['톱니 쥐', 'ore_piece', '#8a8073', 'bug'], steam_eye: ['증기 눈알', 'blue_crystal', '#94a3b8', 'spirit'],
    frost_wolf: ['서리 늑대', 'ice_shard', '#a7dfff', 'lizard'], snow_prankster: ['눈 장난꾼', 'ice_shard', '#dbeafe', 'slime'], ice_orb: ['냉기 구체', 'ice_shard', '#93e4ff', 'spirit'],
    sand_scorpion: ['모래 전갈', 'desert_scale', '#c9964e', 'bug'], sun_lizard: ['태양 도마뱀', 'desert_scale', '#e1a447', 'lizard'], dune_spirit: ['사막 혼령', 'blue_crystal', '#f5c16b', 'spirit'],
    broken_armor: ['부서진 갑주', 'rusted_blade', '#636b78', 'golem'], cursed_orb: ['저주받은 구체', 'ruin_core', '#7c3aed', 'spirit'], ruin_eye: ['폐허의 눈', 'ruin_core', '#9f1239', 'ogre']
  };

  Object.keys(EXTRA_FAMILY_DATA).forEach(function (id) {
    const d = EXTRA_FAMILY_DATA[id];
    FAMILY_DATA[id] = { name: d[0], drop: d[1], color: d[2], shape: d[3] };
  });

  function applyHuntFamilies() {
    Object.keys(HUNTS || {}).forEach(function (hid) {
      const h = HUNTS[hid];
      if (!h || !h.town) return;
      if (CITY_MONSTER_FAMILIES[h.town]) h.families = CITY_MONSTER_FAMILIES[h.town].slice();
    });
  }
  applyHuntFamilies();

  function platformAtXNearY(x, y) {
    let best = null;
    let bestDist = Infinity;
    safeArr(game.platforms).forEach(function (pf) {
      if (!pf) return;
      if (x < pf.x - 8 || x > pf.x + pf.w + 8) return;
      const dy = (pf.y || 0) - (y || 0);
      if (dy >= -12 && dy < bestDist) { best = pf; bestDist = dy; }
    });
    return best || { x: 0, y: game.ground, w: game.width || 5000, h: 24, floor: 0 };
  }

  function floorYAt(x, y) {
    return platformAtXNearY(x, y).y;
  }

  function nearestPlatformForEntity(x, y) {
    let best = null;
    let score = Infinity;
    safeArr(game.platforms).forEach(function (pf) {
      const cx = Math.max(pf.x + 16, Math.min(pf.x + pf.w - 16, x));
      const vertical = Math.max(0, pf.y - y);
      const s = Math.abs(cx - x) * 0.18 + vertical + Math.abs((pf.y || game.ground) - (y || game.ground)) * 0.08;
      if (s < score) { score = s; best = pf; }
    });
    return best || { x: 0, y: game.ground, w: game.width || 5000, h: 24, floor: 0 };
  }

  function clampEntityToPlatform(ent, pf) {
    if (!ent || !pf) return;
    ent.x = clamp(ent.x || 0, pf.x + 28, pf.x + pf.w - 28);
    ent.y = pf.y;
    ent.floorY = pf.y;
    ent.spawnY = pf.y;
    ent.platformX1 = pf.x + 28;
    ent.platformX2 = pf.x + pf.w - 28;
    if (!ent.baseX || ent.baseX < ent.platformX1 || ent.baseX > ent.platformX2) ent.baseX = ent.x;
  }

  function findLadderAt(x, y) {
    for (const l of safeArr(game.ladders)) {
      const top = Math.min(l.y1, l.y2);
      const bottom = Math.max(l.y1, l.y2);
      if (Math.abs(x - l.x) <= 30 && y >= top - 18 && y <= bottom + 24) return l;
    }
    return null;
  }

  function applyCurrentMapLayout() {
    if (!game) return;
    if (game.mode === 'hunt') {
      game.width = Math.max(game.width || 0, 5600);
      game.ground = 610;
      game.platforms = finalHuntPlatforms();
      game.ladders = finalHuntLadders();
    } else if (game.mode === 'town') {
      game.width = Math.max(game.width || 0, 4600);
      game.platforms = finalTownPlatforms();
      game.ladders = finalTownLadders();
    }
  }

  function makeReducedMonsters(hunt) {
    const platforms = finalHuntPlatforms().filter(function (pf) { return pf.huntFloor && pf.y < game.ground; });
    const families = (CITY_MONSTER_FAMILIES[hunt.town] || hunt.families || ['slime']).slice();
    const target = 14;
    const monsters = [];
    for (let i = 0; i < target; i++) {
      const pf = platforms[i % platforms.length];
      const perPlatformIndex = Math.floor(i / platforms.length);
      const spacing = pf.w / 4.2;
      const x = Math.round(pf.x + 120 + ((perPlatformIndex * spacing + (i % 3) * 170) % Math.max(220, pf.w - 240)));
      const family = families[i % families.length];
      const type = makeMonsterType(family, hunt.baseLevel + Math.floor(i / 3));
      const m = {
        uid: Math.random().toString(36).slice(2),
        type: type,
        x: clamp(x, pf.x + 42, pf.x + pf.w - 42),
        baseX: clamp(x, pf.x + 42, pf.x + pf.w - 42),
        y: pf.y,
        spawnY: pf.y,
        floorY: pf.y,
        platformX1: pf.x + 32,
        platformX2: pf.x + pf.w - 32,
        hp: type.hp,
        maxHp: type.hp,
        face: i % 2 ? -1 : 1,
        time: Math.random() * 9,
        hit: 0,
        dead: false,
        attackCooldown: 0,
        poison: 0,
        patrolDir: i % 2 ? -1 : 1,
        aiCooldown: 0.6 + Math.random(),
        aggro: false,
        localMotion: true
      };
      if (typeof setupMonsterAI === 'function') setupMonsterAI(m, i);
      monsters.push(m);
    }
    return monsters;
  }

  const oldLoadHunt = typeof loadHunt === 'function' ? loadHunt : null;
  if (oldLoadHunt) {
    loadHunt = function (huntId) {
      const ret = oldLoadHunt.apply(this, arguments);
      try {
        const hunt = getHunt(huntId || game.huntId);
        if (!hunt) return ret;
        game.mode = 'hunt';
        game.huntId = huntId || game.huntId;
        game.townId = hunt.town || game.townId;
        applyCurrentMapLayout();
        game.monsters = makeReducedMonsters(hunt);
        game.player.x = Math.max(220, Math.min(game.player.x || 220, game.width - 120));
        game.player.y = game.ground;
        game.player.vy = 0;
        game.player.grounded = true;
        game.player.dropTimer = 0;
        if (typeof mpSyncLocalMonsterIds === 'function') mpSyncLocalMonsterIds();
        if (window.PixelRpgMultiplayer && window.PixelRpgMultiplayer.socket && window.PixelRpgMultiplayer.connected) {
          setTimeout(function () {
            try {
              const MP = window.PixelRpgMultiplayer;
              const room = 'hunt:' + (game.huntId || hunt.id || 'hunt');
              MP.socket.emit('monster:seed', { room: room, huntId: game.huntId, layout: HUNT_FLOOR_LAYOUT_ID, monsters: safeArr(game.monsters).map(function (m, i) {
                return { id: m.sharedId || ((game.huntId || 'hunt') + ':' + i), index: i, family: m.type && m.type.family, name: m.type && m.type.name, level: m.type && m.type.level, x: Math.round(m.x), y: Math.round(m.y), baseX: Math.round(m.baseX), spawnY: Math.round(m.spawnY), hp: Math.max(0, Math.round(m.hp || 0)), maxHp: Math.max(1, Math.round(m.maxHp || 1)), dead: !!m.dead, respawn: (m.type && m.type.respawn) || 12000 };
              }) });
            } catch (err) {}
          }, 180);
        }
      } catch (err) { console.error('final hunt layout failed', err); }
      return ret;
    };
  }

  const oldLoadTown = typeof loadTown === 'function' ? loadTown : null;
  if (oldLoadTown) {
    loadTown = function (townId) {
      const ret = oldLoadTown.apply(this, arguments);
      try { applyCurrentMapLayout(); } catch (err) {}
      return ret;
    };
  }

  // Capture S / Down before the older save-on-S listener. R is now manual save.
  window.addEventListener('keydown', function (e) {
    const key = String(e.key || '').toLowerCase();
    if (!game || !game.ready) return;
    if (key === 'r') {
      e.preventDefault();
      try { saveGame(false); } catch (err) {}
      return;
    }
    if ((key === 's' || key === 'arrowdown') && !(e.ctrlKey || e.metaKey || e.altKey)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      keys.add(key === 'arrowdown' ? 'arrowdown' : 's');
      if (game.player) game.player.wantDropDown = true;
    }
  }, true);

  function solidPlayerUpdate(dt) {
    const p = game.player;
    if (!p) return;
    applyCurrentMapLayout();

    if (p.hp <= 0) {
      p.hp = p.maxHp; p.mp = p.maxMp; loadTown(game.townId); p.x = 260; p.y = game.ground; makeText('마을에서 부활', p.x, p.y - 90, '#ff8787'); return;
    }

    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');
    const jump = keys.has(' ') || keys.has('arrowup');
    const up = keys.has('w') || keys.has('arrowup');
    const down = keys.has('s') || keys.has('arrowdown');
    const locked = !!(game.dialog || game.taxiOpen || game.shopOpen || game.blacksmithOpen);
    const ladder = findLadderAt(p.x, p.y - 22) || findLadderAt(p.x, p.y - 70);
    const wantsClimb = ladder && (up || down || p.climbing);

    p.dropTimer = Math.max(0, (p.dropTimer || 0) - dt);
    if (!locked && down && p.grounded && !p.climbing && !ladder) {
      const onUpper = safeArr(game.platforms).some(function (pf) { return pf.y < game.ground && Math.abs(p.y - pf.y) < 6 && p.x > pf.x + 8 && p.x < pf.x + pf.w - 8; });
      if (onUpper) { p.dropTimer = 0.24; p.grounded = false; p.y += 18; p.vy = Math.max(90, p.vy || 0); }
    }

    if (!locked) {
      if (left) { p.vx = -p.speed; p.face = -1; }
      else if (right) { p.vx = p.speed; p.face = 1; }
      else { p.vx *= Math.pow(0.001, dt); if (Math.abs(p.vx) < 2) p.vx = 0; }
    }

    if (wantsClimb && !locked) {
      const top = Math.min(ladder.y1, ladder.y2);
      const bottom = Math.max(ladder.y1, ladder.y2);
      p.climbing = true; p.x += (ladder.x - p.x) * Math.min(1, dt * 12); p.vy = 0; p.grounded = false;
      if (up) p.y -= p.speed * 0.72 * dt;
      else if (down) p.y += p.speed * 0.72 * dt;
      p.y = clamp(p.y, top, bottom);
      if (p.y <= top + 2 && up) { p.y = top; p.climbing = false; p.grounded = true; }
      if (p.y >= bottom - 2 && down) { p.y = bottom; p.climbing = false; p.grounded = true; }
    } else {
      p.climbing = false;
      if (!locked && jump && p.grounded && !down) { p.vy = -430; p.grounded = false; }
      p.vy += 1500 * dt;
      p.y += p.vy * dt;
    }

    p.x += p.vx * dt;
    if (!p.climbing) p.grounded = false;

    if (p.y >= game.ground) { p.y = game.ground; p.vy = 0; p.grounded = true; }

    if (!p.climbing && (p.dropTimer || 0) <= 0) {
      safeArr(game.platforms).forEach(function (pf) {
        const falling = p.vy >= 0;
        const insideX = p.x > pf.x - 24 && p.x < pf.x + pf.w + 24;
        const nearTop = p.y >= pf.y - 16 && p.y <= pf.y + 26;
        if (falling && insideX && nearTop && pf.y < game.ground + 1) { p.y = pf.y; p.vy = 0; p.grounded = true; }
      });
    }

    if (!p.grounded && !p.climbing && p.y > game.ground) { p.y = game.ground; p.vy = 0; p.grounded = true; }

    p.x = clamp(p.x, 70, game.width - 80);
    p.attackTime = Math.max(0, p.attackTime - dt);
    p.invincible = Math.max(0, p.invincible - dt);
    p.hurtTime = Math.max(0, p.hurtTime - dt);
    p.animTime += dt;

    if (p.attackTime > 0) p.anim = 'attack';
    else if (p.climbing) p.anim = 'walk';
    else if (!p.grounded) p.anim = 'jump';
    else if (Math.abs(p.vx) > 10) p.anim = 'walk';
    else p.anim = 'idle';
  }

  updatePlayer = solidPlayerUpdate;

  function solidMonsterUpdate(dt) {
    if (game.mode !== 'hunt') return;
    applyCurrentMapLayout();
    safeArr(game.monsters).forEach(function (m, idx) {
      if (!m || m.dead) return;
      if (!m.platformX1 || !m.platformX2 || !m.floorY) clampEntityToPlatform(m, nearestPlatformForEntity(m.x || m.baseX || 0, m.y || game.ground));
      m.time = (m.time || 0) + dt;
      m.hit = Math.max(0, (m.hit || 0) - dt);
      m.attackCooldown = Math.max(0, (m.attackCooldown || 0) - dt);
      m.y = m.floorY;
      m.spawnY = m.floorY;

      const dx = game.player.x - m.x;
      const sameFloor = Math.abs(game.player.y - m.y) < 70;
      const hostile = !!m.aggro || !!m.hasBeenHit;
      let speed = (m.type && m.type.speed) || 28;
      if (hostile && sameFloor && Math.abs(dx) < 430) {
        m.face = dx > 0 ? 1 : -1;
        m.x += m.face * speed * 0.78 * dt;
      } else {
        if (!m.patrolDir) m.patrolDir = idx % 2 ? -1 : 1;
        m.x += m.patrolDir * speed * 0.32 * dt;
        if (m.x <= m.platformX1 + 20) { m.x = m.platformX1 + 20; m.patrolDir = 1; m.face = 1; }
        if (m.x >= m.platformX2 - 20) { m.x = m.platformX2 - 20; m.patrolDir = -1; m.face = -1; }
      }
      m.x = clamp(m.x, m.platformX1, m.platformX2);

      const touchX = Math.abs(game.player.x - m.x) < 48;
      const touchY = Math.abs(game.player.y - m.y) < 80;
      if (hostile && touchX && touchY && game.player.invincible <= 0) {
        const damage = Math.max(1, Math.floor(((m.type && m.type.atk) || 5) - game.player.defense * 0.45));
        game.player.hp = Math.max(0, game.player.hp - damage);
        game.player.invincible = 0.9; game.player.hurtTime = 0.2; game.player.vx = -m.face * 120;
        makeText('-' + damage, game.player.x, game.player.y - 90, '#ff8787');
      }
    });
  }

  updateMonsters = solidMonsterUpdate;

  const oldDamageMonster = typeof damageMonster === 'function' ? damageMonster : null;
  if (oldDamageMonster) {
    damageMonster = function (m, skill) {
      if (m) { m.aggro = true; m.hasBeenHit = true; if (!m.floorY) clampEntityToPlatform(m, nearestPlatformForEntity(m.x || 0, m.y || game.ground)); }
      return oldDamageMonster.apply(this, arguments);
    };
  }

  const oldKillMonster = typeof killMonster === 'function' ? killMonster : null;
  if (oldKillMonster) {
    killMonster = function (m) {
      if (m) { m.y = m.floorY || floorYAt(m.x || 0, m.y || game.ground); }
      return oldKillMonster.apply(this, arguments);
    };
  }

  const oldUpdateDrops = typeof updateDrops === 'function' ? updateDrops : null;
  updateDrops = function (dt) {
    if (oldUpdateDrops) oldUpdateDrops.apply(this, arguments);
    safeArr(game.drops).forEach(function (d) {
      if (!d || d.picked) return;
      d.vy = (d.vy || 0) + 1200 * dt;
      d.y += d.vy * dt;
      const fy = floorYAt(d.x || 0, d.y || game.ground);
      if (d.y >= fy) { d.y = fy; d.vy = 0; }
    });
  };

  // Other online players are display-only, but should never appear walking in the air.
  const oldDrawOtherPlayers = typeof drawOtherPlayers === 'function' ? drawOtherPlayers : null;
  if (oldDrawOtherPlayers) {
    drawOtherPlayers = function () {
      try {
        const MP = window.PixelRpgMultiplayer;
        if (MP && MP.players) {
          Object.keys(MP.players).forEach(function (id) {
            const op = MP.players[id];
            if (!op) return;
            const target = floorYAt(op.x || 0, op.y || game.ground);
            if (!Number.isFinite(op.y) || op.y > target || Math.abs(op.y - target) > 120) op.y = target;
          });
        }
      } catch (err) {}
      return oldDrawOtherPlayers.apply(this, arguments);
    };
  }

  const oldDrawGold = typeof drawGold === 'function' ? drawGold : null;
  drawGold = function () {
    ctx.fillStyle = 'rgba(17,24,39,0.9)';
    roundRect(ctx, W - 190, 98, 170, 34, 8);
    ctx.fillStyle = '#ffd43b'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('원 ' + wallet.gold, W - 172, 121);
  };

  // Merchant sell: click an item in your inventory while merchant shop is open.
  function inventorySlotAtPoint(x, y) {
    if (!inventory.open && !game.shopOpen) return -1;
    const panelX = 730;
    const panelY = 150;
    const cols = 5;
    const size = 52;
    const gap = 10;
    // Most patched inventory panels use the right side area. Support broad hit zones.
    for (let i = 0; i < inventory.items.length; i++) {
      const sx = panelX + 24 + (i % cols) * (size + gap);
      const sy = panelY + 72 + Math.floor(i / cols) * (size + gap);
      if (hit(x, y, sx, sy, size, size)) return i;
    }
    // Fallback for older panel grids.
    const px = 650, py = 185;
    for (let i = 0; i < inventory.items.length; i++) {
      const sx = px + 20 + (i % 6) * 58;
      const sy = py + 50 + Math.floor(i / 6) * 58;
      if (hit(x, y, sx, sy, 52, 52)) return i;
    }
    return -1;
  }

  function sellInventoryIndex(index) {
    const st = inventory.items[index];
    if (!st) return false;
    const item = ITEMS[st.id];
    if (!item) return false;
    const slot = getEquipSlotForItem(item);
    if (!slot && item.type !== 'etc') { makeText('판매할 수 없는 아이템입니다', game.player.x, game.player.y - 90, '#ff8787'); return true; }
    const unit = Math.max(1, Math.floor((item.sell || Math.floor((item.price || 20) * 0.35) || 1) * (1 + itemEnhance(st) * 0.12)));
    const count = slot ? 1 : Math.max(1, st.count || 1);
    const gain = unit * count;
    wallet.gold += gain;
    if (slot) {
      st.count -= 1;
      if (st.count <= 0) inventory.items.splice(index, 1);
    } else {
      inventory.items.splice(index, 1);
    }
    markAutoSaveSoon();
    makeText((item.name || st.id) + ' 판매 +' + moneyLabel(gain), game.player.x, game.player.y - 90, '#ffd43b');
    return true;
  }

  const oldHandleShopClick = typeof handleShopClick === 'function' ? handleShopClick : null;
  handleShopClick = function (x, y) {
    if (game.shopOpen === 'merchant') {
      const idx = inventorySlotAtPoint(x, y);
      if (idx >= 0) { sellInventoryIndex(idx); return; }
    }
    if (oldHandleShopClick) return oldHandleShopClick.apply(this, arguments);
  };

  const oldSellAllEtc = typeof sellAllEtc === 'function' ? sellAllEtc : null;
  sellAllEtc = function () {
    let gained = 0;
    inventory.items.slice().forEach(function (stackItem) {
      const item = ITEMS[stackItem.id];
      if (!item || item.type !== 'etc') return;
      gained += (item.sell || 1) * (stackItem.count || 1);
      inventory.items = inventory.items.filter(function (v) { return v !== stackItem; });
    });
    wallet.gold += gained; markAutoSaveSoon(); makeText('판매 +' + moneyLabel(gained), game.player.x, game.player.y - 90, '#ffd43b');
  };

  // Job skills: make every job have at least 3 skills, rare jobs get flashier 4-6 skill sets.
  const JOB_SKILL_PACK = {
    beginner: [['quick_slash','빠른 베기','slash',1.15,65,0.9], ['stone_throw','돌던지기','stone',1.25,330,2.5], ['first_aid','숨고르기','heal',0,0,3.0]],
    warrior: [['power_swing','파워 스윙','slash',1.8,95,1.6], ['guard_break','가드 브레이크','impact',2.0,90,2.2], ['iron_will','강철 의지','buff',0,0,5.0]],
    mage: [['fire_spark','화염탄','fire',1.7,360,1.8], ['ice_bloom','얼음꽃','ice',1.9,330,2.4], ['mana_burst','마나 폭발','arcane',2.1,150,3.0]],
    rogue: [['double_stab','이중 찌르기','shadow',1.15,76,0.9], ['poison_pin','독침','poison',1.5,300,1.9], ['shadow_step','그림자 걸음','shadow',2.1,100,2.8]],
    archer: [['rapid_arrow','연속 화살','arrow',1.2,390,1.3], ['piercing_arrow','관통 화살','lightning',1.9,420,2.5], ['wind_trap','바람 덫','wind',1.7,250,2.8]],
    dragon_knight: [['dragon_claw','용조격','dragon_fire',2.2,140,1.8], ['dragon_roar','용의 포효','dragon_ring',3.2,210,3.8], ['flame_wing','화염 날개','dragon_wave',2.8,360,3.0], ['ancient_scale','고룡의 비늘','buff',0,0,5.5], ['wyrm_crash','비룡 추락','meteor',3.7,260,5.0]],
    shadow_reaper: [['reaper_cut','사신절단','shadow',2.7,130,2.3], ['black_moon','검은 달','dark_orb',3.1,360,3.4], ['soul_chain','영혼 사슬','chain',2.6,280,3.0], ['death_blossom','죽음의 꽃','dark_burst',3.8,190,5.0]],
    star_sage: [['starfall','별똥별','star',2.6,420,3.1], ['nova_ring','노바 링','star_ring',3.0,220,3.6], ['comet_ray','혜성 광선','comet',3.4,460,4.4], ['galaxy_gate','은하문','galaxy',4.0,250,5.5]],
    paladin: [['holy_cross','성광 십자','holy',2.2,150,2.5], ['shield_smite','방패 응징','impact',2.3,110,2.8], ['blessing_guard','축복 수호','buff',0,0,5.0]],
    berserker: [['rage_burst','분노 폭발','fire',2.3,120,2.6], ['blood_spin','피의 회전','red_spin',2.6,150,3.4], ['wild_howl','야성 포효','impact',2.1,190,3.2]],
    cleric: [['heal_breeze','회복의 바람','heal',0,0,4.0], ['holy_spark','성광탄','holy',1.9,330,2.2], ['purify_wave','정화 파동','holy_ring',2.3,180,3.5]],
    summoner: [['summon_wisp','정령탄','arcane',1.8,360,1.8], ['beast_echo','야수 메아리','wind',2.2,260,2.8], ['spirit_gate','정령문','galaxy',2.6,210,4.0]],
    gunslinger: [['bullet_rain','탄환 난사','bullet',1.1,420,1.4], ['blast_shot','폭발탄','fire',2.2,380,2.8], ['silver_reload','실버 리로드','buff',0,0,4.2]],
    lancer: [['pierce_lance','관통창','lightning',2.1,175,2.2], ['spear_wall','창벽','impact',2.4,150,3.0], ['sky_thrust','천공 찌르기','wind',2.7,190,3.5]],
    engineer: [['drone_zap','드론 전격','lightning',1.8,360,1.9], ['gear_bomb','기어 폭탄','fire',2.5,300,3.2], ['repair_kit','수리 키트','heal',0,0,4.5]],
    bard: [['echo_note','메아리 음표','star',1.7,330,1.8], ['crescendo','크레센도','holy_ring',2.4,200,3.2], ['healing_song','치유의 노래','heal',0,0,4.8]]
  };

  function addSkillDef(id, name, visual, power, range, cooldown, job) {
    if (SKILLS[id]) {
      SKILLS[id].job = SKILLS[id].job || job;
      SKILLS[id].visual = SKILLS[id].visual || visual;
      SKILLS[id].cooldown = cooldown || SKILLS[id].cooldown || 2;
      return;
    }
    SKILLS[id] = { id, name, job, unlockLevel: 1, mp: visual === 'heal' || visual === 'buff' ? 12 : 10, power: power || 1.5, range: range || 120, cooldown: cooldown || 2.2, visual, projectile: range >= 260, magic: /fire|ice|holy|arcane|star|dragon|galaxy|dark|lightning|wind|comet/.test(visual), desc: name + ' 스킬' };
  }

  Object.keys(JOBS || {}).forEach(function (jobId) {
    const pack = JOB_SKILL_PACK[jobId] || JOB_SKILL_PACK.beginner;
    pack.forEach(function (s) { addSkillDef(s[0], s[1], s[2], s[3], s[4], s[5], jobId); });
    const existing = Object.keys(SKILLS).filter(function (sid) { return SKILLS[sid].job === jobId; });
    let n = 0;
    while (existing.length + n < 3) {
      const id = jobId + '_tech_' + (n + 1);
      addSkillDef(id, (JOBS[jobId] && JOBS[jobId].name || jobId) + ' 기술 ' + (n + 1), n % 2 ? 'impact' : 'slash', 1.4 + n * 0.25, 110 + n * 30, 2.1 + n * 0.4, jobId);
      n++;
    }
  });

  function skillColor(visual) {
    return {
      fire: '#fb923c', ice: '#7dd3fc', holy: '#fde68a', holy_ring: '#fef3c7', arcane: '#a78bfa', star: '#fef08a', star_ring: '#fde047', galaxy: '#818cf8',
      dragon_fire: '#f97316', dragon_ring: '#fb7185', dragon_wave: '#fdba74', meteor: '#facc15', shadow: '#c084fc', dark_orb: '#7e22ce', dark_burst: '#d946ef', chain: '#94a3b8',
      lightning: '#fef08a', wind: '#86efac', poison: '#a3e635', bullet: '#e5e7eb', stone: '#9ca3af', impact: '#fca5a5', slash: '#ffd166', red_spin: '#ef4444', heal: '#86efac', buff: '#93c5fd', comet: '#60a5fa'
    }[visual] || '#ffd43b';
  }

  function pushParticle(x, y, color, vx, vy, life, size) {
    game.particles.push({ x, y, vx, vy, life, color, size: size || 2 });
  }

  function emitSkillEffect(skill) {
    const p = game.player;
    if (!p || !skill) return;
    const visual = skill.visual || (skill.magic ? 'arcane' : 'slash');
    const color = skillColor(visual);
    const dir = p.face || 1;
    const ox = p.x + dir * 55;
    const oy = p.y - 55;
    const rare = ['dragon_knight','shadow_reaper','star_sage'].includes(p.character && p.character.job) ? 1.7 : 1;
    const count = Math.floor((visual.includes('dragon') || visual.includes('galaxy') || visual.includes('dark') || visual.includes('star')) ? 42 * rare : 22 * rare);

    if (visual === 'heal' || visual === 'buff') {
      for (let i = 0; i < 34; i++) {
        const a = Math.PI * 2 * i / 34;
        pushParticle(p.x + Math.cos(a) * 28, p.y - 62 + Math.sin(a) * 14, color, Math.cos(a) * 30, -60 + Math.sin(a) * 20, 0.8, 3);
      }
      return;
    }

    if (/dragon/.test(visual)) {
      for (let i = 0; i < count; i++) {
        const t = i / count;
        pushParticle(ox + dir * t * 190, oy + Math.sin(t * Math.PI * 3) * 35, i % 3 ? color : '#fff7ed', dir * (160 + i * 2), -80 + Math.sin(i) * 80, 0.55 + t * 0.35, 3 + (i % 4));
      }
      makeText('용의 기운!', p.x + dir * 85, p.y - 130, '#fb923c');
    } else if (/star|galaxy|comet/.test(visual)) {
      for (let i = 0; i < count; i++) {
        const a = i * 2.399;
        const r = 10 + i * 2.2;
        pushParticle(ox + Math.cos(a) * r, oy + Math.sin(a) * r * 0.55, i % 2 ? color : '#ffffff', Math.cos(a) * 90 + dir * 40, Math.sin(a) * 80, 0.75, 2.6);
      }
    } else if (/dark|shadow|chain/.test(visual)) {
      for (let i = 0; i < count; i++) {
        pushParticle(ox + dir * rand(0, 170), oy + rand(-45, 35), i % 2 ? color : '#111827', dir * rand(80, 240), rand(-100, 80), 0.65, 3);
      }
    } else if (/fire|meteor/.test(visual)) {
      for (let i = 0; i < count; i++) pushParticle(ox + dir * rand(0, 170), oy + rand(-30, 35), i % 2 ? color : '#fde047', dir * rand(80, 260), rand(-120, 50), 0.65, 3);
    } else if (/ice/.test(visual)) {
      for (let i = 0; i < count; i++) pushParticle(ox + dir * rand(0, 150), oy + rand(-35, 25), i % 2 ? color : '#e0f2fe', dir * rand(70, 210), rand(-100, 40), 0.72, 2.8);
    } else {
      for (let i = 0; i < count; i++) pushParticle(ox + dir * rand(0, 140), oy + rand(-30, 30), color, dir * rand(70, 220), rand(-80, 80), 0.55, 2.5);
    }
  }

  const oldUseSkill = typeof useSkill === 'function' ? useSkill : null;
  if (oldUseSkill) {
    useSkill = function (id) {
      const skill = SKILLS[id];
      const beforeMp = game.player.mp;
      const ret = oldUseSkill.apply(this, arguments);
      if (skill && game.player.mp < beforeMp + 0.001) emitSkillEffect(skill);
      return ret;
    };
  }

  const oldSpawnProjectile = typeof spawnProjectile === 'function' ? spawnProjectile : null;
  spawnProjectile = function (skill) {
    const visual = skill && skill.visual || (skill && skill.magic ? 'arcane' : 'stone');
    const p = game.player;
    if (!p) return oldSpawnProjectile ? oldSpawnProjectile.apply(this, arguments) : null;
    const kind = visual === 'stone' ? 'stone' : (/arrow|bullet/.test(visual) ? 'arrow' : 'magic');
    game.projectiles.push({ x: p.x + p.face * 35, y: p.y - 52, vx: p.face * (visual === 'stone' ? 420 : 520), life: 0.9, face: p.face, skill, hitSet: new Set(), color: skillColor(visual), kind, visual, effectPower: Math.max(1, (skill && skill.power) || 1) });
  };

  const oldDrawProjectiles = typeof drawProjectiles === 'function' ? drawProjectiles : null;
  drawProjectiles = function () {
    safeArr(game.projectiles).forEach(function (p) {
      if (p.kind !== 'stone') return;
      ctx.save(); ctx.translate(p.x, p.y); ctx.scale(p.face || 1, 1);
      ctx.shadowColor = '#6b7280'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#4b5563'; ctx.beginPath(); ctx.ellipse(0, 0, 14, 10, -0.25, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#9ca3af'; ctx.beginPath(); ctx.ellipse(-4, -3, 5, 3, -0.2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
    if (oldDrawProjectiles) {
      const old = game.projectiles;
      game.projectiles = old.filter(function (p) { return p.kind !== 'stone'; });
      oldDrawProjectiles();
      game.projectiles = old;
    }
  };

  // Update HUD hint to the new save/drop keys.
  const oldDrawHUD = typeof drawHUD === 'function' ? drawHUD : null;
  drawHUD = function () {
    if (oldDrawHUD) oldDrawHUD.apply(this, arguments);
    ctx.fillStyle = 'rgba(15,23,42,0.72)'; roundRect(ctx, 18, 132, 570, 24, 8);
    ctx.fillStyle = '#dbeafe'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('R 저장 · S/↓ 윗층에서 아래층 내려가기 · 사다리에서는 W/S 또는 ↑/↓', 30, 149);
  };

  // Keep current map corrected after older sync/load patches run.
  setInterval(function () {
    try {
      applyCurrentMapLayout();
      if (game.mode === 'hunt') {
        safeArr(game.monsters).forEach(function (m) { if (!m.dead) clampEntityToPlatform(m, nearestPlatformForEntity(m.x || 0, m.y || game.ground)); });
      }
    } catch (err) {}
  }, 850);

  try { applyCurrentMapLayout(); } catch (err) {}
})();


/* =========================================================
   SKILL PANEL SCROLL / NPC GROUNDING / 50 SKILL PATTERNS PATCH 01
   - Skill list is scrollable and click coordinates follow scroll
   - NPCs are snapped to solid town floors before drawing
   - Adds many different skill attack forms instead of recolored Smash/Throw
========================================================= */
(function(){
  'use strict';
  if (window.__PIXEL_RPG_SKILL_SCROLL_NPC_EFFECT_PATCH_01__) return;
  window.__PIXEL_RPG_SKILL_SCROLL_NPC_EFFECT_PATCH_01__ = true;

  const skillPanelState = { scroll: 0, max: 0 };
  function arr(v){ return Array.isArray(v) ? v : []; }
  function nrand(a,b){ return a + Math.random()*(b-a); }
  function now(){ return (performance && performance.now) ? performance.now() : Date.now(); }
  function clampLocal(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function safePlayer(){ return game && game.player ? game.player : null; }
  function effectQualityForSkill(skill){
    const job = (skill && skill.job) || 'beginner';
    const hidden = /dragon|star|shadow|void|rune|soul|abyss|용|별|그림자|공허|룬|사신/i.test(job + ' ' + (skill.id||'') + ' ' + (skill.name||''));
    if (hidden) return 3.0;
    if (/paladin|berserker|summoner|gunslinger|mechanic|bard|dragoon|priest|crusader|bishop|성기사|광전사|소환|기계|음유/i.test(job + ' ' + (skill.name||''))) return 2.35;
    if (skill && (skill.unlockLevel || 1) >= 18) return 2.1;
    if (skill && (skill.unlockLevel || 1) >= 10) return 1.65;
    return 1.15;
  }
  function hashString(s){
    s=String(s||''); let h=0;
    for(let i=0;i<s.length;i++) h=((h<<5)-h+s.charCodeAt(i))|0;
    return Math.abs(h);
  }
  const PATTERN_NAMES = [
    'crescent_slash','triple_lance','dragon_breath','meteor_rain','star_burst','shadow_dash','ice_spikes','thunder_chain','fire_column','wind_tornado',
    'holy_cross','dark_orb','rune_circle','boomerang_blade','homing_wisps','laser_beam','ground_wave','poison_cloud','summon_claw','gravity_well',
    'spear_rush','arrow_rain','fan_knives','shield_bash','song_pulse','gear_mines','solar_flare','frost_nova','sand_vortex','moon_slicer',
    'spirit_birds','crystal_shards','flame_wheel','water_burst','leaf_storm','iron_stomp','void_rift','dragon_tail','starfall_line','shadow_needles',
    'healing_grove','mana_bloom','rapid_shots','double_dagger','earth_pillar','electric_spark','bubble_splash','sonic_slicer','orbital_blades','phoenix_dash'
  ];
  function skillPattern(skill){
    if (!skill) return 'crescent_slash';
    const s = ((skill.id||'')+' '+(skill.name||'')+' '+(skill.job||'')).toLowerCase();
    if (/용|dragon/.test(s)) return /포효|roar|breath/.test(s) ? 'dragon_breath' : /돌격|rush|strike/.test(s) ? 'dragon_tail' : 'phoenix_dash';
    if (/별|star/.test(s)) return /낙|fall/.test(s) ? 'starfall_line' : 'star_burst';
    if (/그림자|shadow|assassin|도적|rogue/.test(s)) return /침|needle/.test(s) ? 'shadow_needles' : /빠|dash|베기/.test(s) ? 'shadow_dash' : 'double_dagger';
    if (/궁|archer|bow|arrow/.test(s)) return /비|rain/.test(s) ? 'arrow_rain' : 'rapid_shots';
    if (/마법|mage|wizard|mana|비전/.test(s)) return /룬|rune/.test(s) ? 'rune_circle' : 'homing_wisps';
    if (/전사|warrior|sword|검|강타/.test(s)) return /방패|shield/.test(s) ? 'shield_bash' : 'crescent_slash';
    if (/성직|priest|holy|성/.test(s)) return /회복|heal/.test(s) ? 'healing_grove' : 'holy_cross';
    if (/기계|mechanic|gear/.test(s)) return 'gear_mines';
    if (/음유|bard|song/.test(s)) return 'song_pulse';
    if (/얼음|ice|frost/.test(s)) return 'frost_nova';
    if (/불|fire|flame/.test(s)) return 'fire_column';
    return PATTERN_NAMES[hashString(skill.id || skill.name || 'skill') % PATTERN_NAMES.length];
  }
  function paletteFor(skill, pattern){
    const s = ((skill && (skill.id+' '+skill.name+' '+skill.job)) || '') + ' ' + pattern;
    if (/dragon|용|fire|flame|phoenix|meteor|solar/i.test(s)) return ['#ff9f1c','#ff4d00','#ffd166','#fff1a8'];
    if (/star|별|holy|성|priest/i.test(s)) return ['#ffe066','#ffffff','#facc15','#a7f3d0'];
    if (/shadow|void|dark|그림자|공허|abyss/i.test(s)) return ['#a78bfa','#5b21b6','#f0abfc','#111827'];
    if (/ice|frost|얼음|서리|water|bubble/i.test(s)) return ['#7dd3fc','#38bdf8','#ffffff','#93c5fd'];
    if (/leaf|wind|green|poison|숲|독/i.test(s)) return ['#86efac','#22c55e','#bef264','#16a34a'];
    if (/thunder|electric|번개/i.test(s)) return ['#fef08a','#60a5fa','#ffffff','#fde047'];
    return ['#f97316','#fb923c','#ffffff','#facc15'];
  }
  function pushParticle(x,y,vx,vy,life,color,size,shape){
    if (!game.particles) game.particles=[];
    game.particles.push({x:x,y:y,vx:vx||0,vy:vy||0,life:life||0.5,color:color||'#fff',size:size||3,shape:shape||'dot',rot:nrand(0,Math.PI*2),spin:nrand(-7,7)});
  }
  function burst(x,y,colors,count,radius,life,kind){
    colors = colors || ['#fff'];
    for(let i=0;i<count;i++){
      const a = Math.PI*2*i/count + nrand(-0.22,0.22);
      const sp = nrand(radius*1.7, radius*4.5);
      pushParticle(x+nrand(-8,8), y+nrand(-8,8), Math.cos(a)*sp, Math.sin(a)*sp, nrand(life*0.55, life*1.25), colors[i%colors.length], nrand(2,6), kind||'spark');
    }
  }
  function lineParticles(x1,y1,x2,y2,colors,count,size,life,shape){
    for(let i=0;i<count;i++){
      const t=i/Math.max(1,count-1);
      const x=x1+(x2-x1)*t+nrand(-5,5), y=y1+(y2-y1)*t+nrand(-5,5);
      pushParticle(x,y,nrand(-30,30),nrand(-70,20),nrand(life*0.7,life*1.2),colors[i%colors.length],size||3,shape||'spark');
    }
  }
  function addProjectileEx(skill, kind, x, y, vx, vy, life, color, extra){
    if (!game.projectiles) game.projectiles=[];
    const p={ x:x, y:y, vx:vx||0, vy:vy||0, life:life||0.8, face:(game.player&&game.player.face)||1, kind:kind, skill:skill, hitSet:new Set(), color:color||'#fff', effectPower:effectQualityForSkill(skill) };
    if (extra) Object.assign(p, extra);
    game.projectiles.push(p);
  }
  function damageArea(skill, cx, cy, w, h, hits){
    if (game.mode !== 'hunt') return 0;
    let count=0; hits=hits||1;
    arr(game.monsters).forEach(function(m){
      if(!m||m.dead) return;
      if(Math.abs(m.x-cx)<=w && Math.abs((m.y-45)-cy)<=h){
        m.aggro=true; m.hasBeenHit=true;
        for(let i=0;i<hits;i++) damageMonster(m, skill);
        count++;
      }
    });
    return count;
  }
  function castPattern(skill, pattern){
    const p=safePlayer(); if(!p) return;
    const face=p.face||1, q=effectQualityForSkill(skill), colors=paletteFor(skill, pattern);
    const ox=p.x+face*50, oy=p.y-52;
    const powerSkill=Object.assign({}, skill, { range: Math.max(skill.range||130, 120+q*50), power:(skill.power||1)*Math.min(2.4,0.9+q*0.28), hits: skill.hits||1 });
    p.attackTime=0.46; p.anim='attack'; p.animTime=0;
    switch(pattern){
      case 'crescent_slash': case 'moon_slicer': case 'sonic_slicer':
        for(let i=0;i<3+Math.floor(q);i++) lineParticles(p.x+face*(18+i*20), oy-32+i*7, p.x+face*(92+i*18), oy+28-i*3, colors, 9, 4, .42, 'slash');
        damageArea(powerSkill, p.x+face*(80+q*10), p.y-50, 110+q*30, 80, Math.ceil(q)); break;
      case 'double_dagger': case 'fan_knives':
        for(let k=0;k<2+Math.floor(q);k++) addProjectileEx(powerSkill,'knife',p.x+face*(28+k*6),oy-12+k*10,face*(640+q*90),nrand(-25,25),.45,colors[k%colors.length],{pierce:1});
        lineParticles(p.x+face*20,oy,p.x+face*105,oy-40,colors,18,3,.25,'slash'); damageArea(powerSkill,p.x+face*85,p.y-50,105,70,2); break;
      case 'triple_lance': case 'spear_rush':
        for(let k=-1;k<=1;k++) addProjectileEx(powerSkill,'lance',p.x+face*42,oy+k*18,face*(720+q*80),0,.55,colors[(k+1)%colors.length],{pierce:2});
        damageArea(powerSkill,p.x+face*120,p.y-52,160,80,1); break;
      case 'dragon_breath':
        for(let i=0;i<48*q;i++){ const a=nrand(-0.35,0.35); pushParticle(ox,oy+nrand(-18,22),face*nrand(260,620),Math.sin(a)*260+nrand(-60,60),nrand(.25,.75),colors[i%4],nrand(4,10),'flame'); }
        damageArea(powerSkill,p.x+face*170,p.y-55,210,95,Math.ceil(q)); break;
      case 'dragon_tail': case 'phoenix_dash':
        burst(p.x+face*70,oy,colors,30+q*10,60,.45,'flame'); lineParticles(p.x-face*15,oy+20,p.x+face*180,oy-20,colors,36,5,.38,'slash'); damageArea(powerSkill,p.x+face*115,p.y-50,185,105,2); break;
      case 'meteor_rain': case 'starfall_line': case 'arrow_rain':
        for(let i=0;i<8+q*4;i++){ const tx=p.x+face*nrand(80,420); addProjectileEx(powerSkill, pattern==='arrow_rain'?'rain_arrow':'meteor', tx-face*nrand(30,120), p.y-360-nrand(0,100), face*nrand(40,120), nrand(560,760), 1.05, colors[i%4],{targetY:p.y-45, splash:70+q*18}); }
        break;
      case 'star_burst': case 'solar_flare':
        burst(ox,oy,colors,55+q*14,90,.72,'star'); damageArea(powerSkill,ox,oy,155+q*25,130,Math.ceil(q)); break;
      case 'shadow_dash':
        for(let i=0;i<32;i++) pushParticle(p.x-face*nrand(10,75),p.y-nrand(25,90),face*nrand(-80,40),nrand(-70,50),nrand(.25,.55),colors[i%4],nrand(3,7),'smoke');
        damageArea(powerSkill,p.x+face*120,p.y-54,200,85,2+Math.floor(q)); break;
      case 'shadow_needles':
        for(let i=0;i<10+q*5;i++) addProjectileEx(powerSkill,'needle',p.x+face*35,p.y-nrand(25,95),face*nrand(580,820),nrand(-80,80),.55,colors[i%4],{pierce:1}); break;
      case 'ice_spikes': case 'earth_pillar':
        for(let i=0;i<6+q*3;i++){ const x=p.x+face*(70+i*42); burst(x,p.y-10,colors,8,24,.45,'shard'); damageArea(powerSkill,x,p.y-48,38,95,1); }
        break;
      case 'frost_nova': case 'water_burst': case 'bubble_splash':
        burst(p.x,p.y-55,colors,70+q*15,130,.7,'bubble'); damageArea(powerSkill,p.x,p.y-55,180+q*45,140,Math.ceil(q)); break;
      case 'thunder_chain': case 'electric_spark':
        for(let i=0;i<6+q*2;i++){ const x=p.x+face*(50+i*58); lineParticles(x,oy+nrand(-40,30),x+face*50,oy+nrand(-40,30),colors,6,3,.22,'spark'); damageArea(powerSkill,x+face*25,p.y-50,45,85,1); } break;
      case 'fire_column': case 'flame_wheel':
        for(let i=0;i<5+q*2;i++){ const x=p.x+face*(70+i*55); for(let k=0;k<18;k++) pushParticle(x+nrand(-12,12),p.y-8, nrand(-25,25), nrand(-350,-120), nrand(.25,.75), colors[k%4], nrand(4,9),'flame'); damageArea(powerSkill,x,p.y-62,48,120,1); } break;
      case 'wind_tornado': case 'sand_vortex': case 'leaf_storm':
        addProjectileEx(powerSkill,'tornado',ox,p.y-65,face*(220+q*60),0,1.35,colors[0],{radius:58+q*16,pierce:8}); break;
      case 'holy_cross':
        lineParticles(ox-55,oy,ox+55,oy,colors,28,4,.55,'star'); lineParticles(ox,oy-62,ox,oy+42,colors,28,4,.55,'star'); burst(ox,oy,colors,30,55,.5,'star'); damageArea(powerSkill,ox,oy,125,125,Math.ceil(q)); break;
      case 'dark_orb': case 'void_rift': case 'gravity_well':
        addProjectileEx(powerSkill,'gravity',ox,oy,face*(180+q*30),0,1.25,colors[0],{radius:80+q*25,pull:true,pierce:10}); break;
      case 'rune_circle': case 'mana_bloom':
        burst(p.x+face*115,p.y-55,colors,65+q*10,110,.9,'rune'); damageArea(powerSkill,p.x+face*115,p.y-55,150,120,Math.ceil(q)); break;
      case 'boomerang_blade':
        addProjectileEx(powerSkill,'boomerang',ox,oy,face*(560+q*50),0,1.1,colors[0],{originX:p.x,returnAt:.48,pierce:5}); break;
      case 'homing_wisps': case 'spirit_birds':
        for(let i=0;i<4+q*2;i++) addProjectileEx(powerSkill,'wisp',p.x+face*30,p.y-70+nrand(-20,20),face*nrand(260,380),nrand(-90,90),1.4,colors[i%4],{homing:true,pierce:1}); break;
      case 'laser_beam':
        lineParticles(p.x+face*30,oy,p.x+face*(430+q*80),oy,colors,70,3,.32,'beam'); damageArea(powerSkill,p.x+face*(230+q*40),oy,260+q*60,32,Math.ceil(q*2)); break;
      case 'ground_wave':
        for(let i=0;i<5+q*2;i++) addProjectileEx(powerSkill,'ground_wave',p.x+face*(35+i*20),p.y-18,face*(360+q*55),0,.85,colors[i%4],{radius:28+q*7,pierce:4}); break;
      case 'poison_cloud':
        for(let i=0;i<38+q*12;i++) pushParticle(p.x+face*nrand(65,230),p.y-nrand(35,110),nrand(-35,35),nrand(-25,5),nrand(.8,1.7),colors[i%4],nrand(8,18),'cloud'); damageArea(powerSkill,p.x+face*150,p.y-70,190,105,Math.ceil(q)); break;
      case 'summon_claw':
        for(let i=0;i<4+q;i++){ const x=p.x+face*(70+i*50); lineParticles(x-25,p.y-105,x+face*35,p.y-25,colors,12,4,.35,'slash'); damageArea(powerSkill,x,p.y-60,55,90,1); } break;
      case 'shield_bash': case 'iron_stomp':
        burst(p.x+face*55,p.y-40,colors,36,65,.42,'shard'); damageArea(powerSkill,p.x+face*65,p.y-45,100,100,Math.ceil(q)); break;
      case 'song_pulse':
        for(let r=40;r<190+q*30;r+=32) burst(p.x,p.y-60,colors,18,r/3,.35,'note'); damageArea(powerSkill,p.x,p.y-60,220+q*35,150,1); break;
      case 'gear_mines':
        for(let i=0;i<5+q*2;i++) addProjectileEx(powerSkill,'mine',p.x+face*(70+i*45),p.y-8,0,0,2.4,colors[i%4],{armed:.28,radius:55+q*8}); break;
      case 'crystal_shards':
        for(let i=0;i<9+q*4;i++) addProjectileEx(powerSkill,'shard',p.x+face*35,p.y-70,face*nrand(380,620),nrand(-190,150),.75,colors[i%4],{pierce:1}); break;
      case 'healing_grove':
        game.player.hp=Math.min(game.player.maxHp, game.player.hp + Math.floor(30+q*20)); burst(p.x,p.y-55,colors,50,110,.9,'leaf'); break;
      case 'rapid_shots':
        for(let i=0;i<6+q*3;i++) addProjectileEx(powerSkill,'arrow',p.x+face*38,p.y-50+nrand(-20,20),face*(700+q*80),nrand(-35,35),.55,colors[i%4],{pierce:1}); break;
      case 'orbital_blades':
        for(let i=0;i<8+q*2;i++){ const a=i*Math.PI*2/(8+q*2); addProjectileEx(powerSkill,'orbit',p.x+Math.cos(a)*55,p.y-60+Math.sin(a)*32,face*(220+q*45),0,1.0,colors[i%4],{angle:a,centerX:p.x,centerY:p.y-60,pierce:5}); } break;
      default:
        addProjectileEx(powerSkill,'magic',ox,oy,face*(470+q*80),0,.85,colors[0],{pierce:1}); burst(ox,oy,colors,24,50,.5,'spark');
    }
    makeText(skill.name, p.x, p.y-112, colors[0]);
  }

  const oldUseSkill = typeof useSkill === 'function' ? useSkill : null;
  useSkill = function(id){
    const skill = SKILLS && SKILLS[id];
    if(!skill) return;
    if(!skills.unlocked.includes(id)){ makeText('아직 배운 스킬이 아닙니다.', game.player.x, game.player.y-90, '#ff8787'); return; }
    if((skills.cooldowns[id]||0)>0){ makeText('쿨타임 중', game.player.x, game.player.y-90, '#cbd5e1'); return; }
    if(game.player.mp < (skill.mp||0)){ makeText('MP 부족', game.player.x, game.player.y-90, '#74c0fc'); return; }
    game.player.mp -= skill.mp||0;
    skills.cooldowns[id] = skill.cooldown || 1.2;
    if(skill.heal && !/dragon|shadow|star|slash|strike|throw|bolt|blast/i.test(id+' '+skill.name)){
      game.player.hp = Math.min(game.player.maxHp, game.player.hp + skill.heal);
      makeText('+'+skill.heal+' HP', game.player.x, game.player.y-90, '#ff8787');
      burst(game.player.x, game.player.y-55, ['#86efac','#ffffff','#22c55e'], 42, 90, .7, 'leaf');
      return;
    }
    castPattern(skill, skillPattern(skill));
  };

  const oldUpdateProjectiles = typeof updateProjectiles === 'function' ? updateProjectiles : null;
  updateProjectiles = function(dt){
    arr(game.projectiles).forEach(function(p){
      if(!p) return;
      p.life -= dt;
      p.age = (p.age || 0) + dt;
      p.x += (p.vx||0)*dt; p.y += (p.vy||0)*dt;
      const colors = paletteFor(p.skill||{}, p.kind||'');
      if(p.kind==='meteor' || p.kind==='rain_arrow'){
        pushParticle(p.x, p.y, nrand(-20,20), nrand(-20,20), .25, p.color, 4, p.kind==='meteor'?'flame':'spark');
        if(p.y >= (p.targetY||game.ground-50)){ burst(p.x,p.y,colors,28,p.splash||70,.55,p.kind==='meteor'?'flame':'spark'); damageArea(p.skill,p.x,p.y,p.splash||75,p.splash||75,1); p.life=0; }
      } else if(p.kind==='tornado'){
        for(let i=0;i<8;i++){ const a=p.age*10+i; pushParticle(p.x+Math.cos(a)*(p.radius||70), p.y+Math.sin(a)*45, nrand(-25,25), nrand(-30,30), .3, colors[i%4], 4, 'swirl'); }
        damageArea(p.skill,p.x,p.y,p.radius||70,85,1);
      } else if(p.kind==='gravity'){
        for(let i=0;i<10;i++){ const a=nrand(0,Math.PI*2); pushParticle(p.x+Math.cos(a)*(p.radius||75), p.y+Math.sin(a)*(p.radius||75)*.55, -Math.cos(a)*120, -Math.sin(a)*80, .35, colors[i%4], 5, 'orb'); }
        damageArea(p.skill,p.x,p.y,p.radius||90,p.radius||90,1);
      } else if(p.kind==='boomerang'){
        if(p.age > (p.returnAt||.5)) p.vx = -Math.sign(p.vx||1)*Math.abs(p.vx||450);
        pushParticle(p.x,p.y,nrand(-10,10),nrand(-10,10),.28,p.color,5,'slash');
      } else if(p.kind==='wisp'){
        let target=null, dist=99999; arr(game.monsters).forEach(function(m){ if(!m||m.dead) return; const d=Math.abs(m.x-p.x)+Math.abs((m.y-50)-p.y); if(d<dist){dist=d;target=m;} });
        if(target){ const dx=target.x-p.x, dy=(target.y-50)-p.y, len=Math.max(1,Math.hypot(dx,dy)); p.vx += dx/len*520*dt; p.vy += dy/len*520*dt; }
        pushParticle(p.x,p.y,0,0,.25,p.color,4,'orb');
      } else if(p.kind==='mine'){
        pushParticle(p.x,p.y,nrand(-8,8),nrand(-50,-10),.3,p.color,3,'gear');
        if(p.age>(p.armed||.25)){ const hit=damageArea(p.skill,p.x,p.y,p.radius||60,p.radius||60,1); if(hit){ burst(p.x,p.y,colors,35,80,.55,'shard'); p.life=0; } }
      } else if(p.kind==='orbit'){
        p.angle=(p.angle||0)+dt*8; p.y += Math.sin(p.angle)*20*dt; pushParticle(p.x,p.y,0,0,.23,p.color,4,'slash');
      } else if(p.kind==='ground_wave'){
        p.y = (game.ground && p.y>game.ground-15) ? game.ground-18 : p.y;
        pushParticle(p.x,p.y,nrand(-20,20),nrand(-70,-10),.28,p.color,5,'shard');
      } else {
        pushParticle(p.x,p.y,nrand(-10,10),nrand(-10,10),.18,p.color,3,'spark');
      }
      arr(game.monsters).forEach(function(m){
        if(!m||m.dead) return;
        if(!p.hitSet) p.hitSet=new Set();
        if(p.hitSet.has(m.uid) && !p.pierce) return;
        const rad = p.radius || 42;
        if(Math.abs(p.x-m.x)<rad && Math.abs(p.y-(m.y-48))<Math.max(55,rad)){
          p.hitSet.add(m.uid); m.aggro=true; m.hasBeenHit=true; damageMonster(m,p.skill||{power:1,range:90}); burst(p.x,p.y,colors,12,35,.35,'spark');
          if(!p.pierce || p.hitSet.size>(p.pierce||0)) p.life=0;
        }
      });
    });
    game.projectiles = arr(game.projectiles).filter(function(p){ return p && p.life>0; });
  };

  function drawShapeParticle(pt){
    const s=pt.size||3;
    ctx.save(); ctx.translate(pt.x,pt.y); ctx.rotate(pt.rot||0); ctx.globalAlpha=Math.max(0, Math.min(1, (pt.life||0.2)*2));
    ctx.fillStyle=pt.color||'#fff'; ctx.strokeStyle=pt.color||'#fff'; ctx.shadowColor=pt.color||'#fff'; ctx.shadowBlur=10;
    const sh=pt.shape||'dot';
    if(sh==='slash'){ ctx.lineWidth=s; ctx.beginPath(); ctx.moveTo(-s*4,s*1.5); ctx.quadraticCurveTo(0,-s*3,s*5,-s); ctx.stroke(); }
    else if(sh==='star'){ ctx.beginPath(); for(let i=0;i<10;i++){ const r=i%2?s*1.4:s*3.2; const a=-Math.PI/2+i*Math.PI/5; ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r); } ctx.closePath(); ctx.fill(); }
    else if(sh==='flame'){ ctx.beginPath(); ctx.moveTo(0,-s*4); ctx.quadraticCurveTo(s*4,-s,0,s*4); ctx.quadraticCurveTo(-s*3,0,0,-s*4); ctx.fill(); }
    else if(sh==='bubble'||sh==='orb'){ ctx.globalAlpha*=.85; ctx.beginPath(); ctx.arc(0,0,s*2.2,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(0,0,s*1.1,0,Math.PI*2); ctx.fill(); }
    else if(sh==='rune'){ ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,s*3,0,Math.PI*2); ctx.stroke(); ctx.fillRect(-s*.7,-s*.7,s*1.4,s*1.4); }
    else if(sh==='beam'){ ctx.fillRect(-s*4,-s*.5,s*8,s); }
    else if(sh==='cloud'){ ctx.globalAlpha*=.45; ctx.beginPath(); ctx.ellipse(0,0,s*3,s*1.7,0,0,Math.PI*2); ctx.fill(); }
    else { ctx.beginPath(); ctx.arc(0,0,s,0,Math.PI*2); ctx.fill(); }
    ctx.restore();
  }
  const oldDrawParticles = typeof drawParticles === 'function' ? drawParticles : null;
  drawParticles = function(){ arr(game.particles).forEach(drawShapeParticle); };

  const oldDrawProjectiles = typeof drawProjectiles === 'function' ? drawProjectiles : null;
  drawProjectiles = function(){
    arr(game.projectiles).forEach(function(p){
      const colors=paletteFor(p.skill||{},p.kind||''); ctx.save(); ctx.translate(p.x,p.y); ctx.scale(p.face||1,1); ctx.shadowColor=p.color||colors[0]; ctx.shadowBlur=14+(p.effectPower||1)*5; ctx.fillStyle=p.color||colors[0]; ctx.strokeStyle=p.color||colors[0]; ctx.lineWidth=3;
      if(p.kind==='knife'||p.kind==='needle'){ ctx.beginPath(); ctx.moveTo(20,0); ctx.lineTo(-12,-5); ctx.lineTo(-6,0); ctx.lineTo(-12,5); ctx.closePath(); ctx.fill(); }
      else if(p.kind==='lance'){ ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(-28,0); ctx.lineTo(24,0); ctx.stroke(); ctx.beginPath(); ctx.moveTo(31,0); ctx.lineTo(15,-9); ctx.lineTo(15,9); ctx.closePath(); ctx.fill(); }
      else if(p.kind==='meteor'){ ctx.fillStyle=colors[1]; ctx.beginPath(); ctx.arc(0,0,14,0,Math.PI*2); ctx.fill(); ctx.fillStyle=colors[2]; ctx.beginPath(); ctx.moveTo(-28,-18); ctx.lineTo(-5,-3); ctx.lineTo(-25,10); ctx.fill(); }
      else if(p.kind==='tornado'||p.kind==='gravity'){ ctx.strokeStyle=colors[0]; for(let r=14;r<(p.radius||60);r+=14){ ctx.beginPath(); ctx.ellipse(0,0,r,r*.55,0,0,Math.PI*2); ctx.stroke(); } }
      else if(p.kind==='boomerang'){ ctx.beginPath(); ctx.arc(0,0,18,Math.PI*.2,Math.PI*1.65); ctx.stroke(); }
      else if(p.kind==='wisp'||p.kind==='magic'){ ctx.beginPath(); ctx.ellipse(0,0,18,11,0,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.arc(0,0,24,0,Math.PI*2); ctx.stroke(); }
      else if(p.kind==='mine'){ ctx.beginPath(); ctx.arc(0,0,13,0,Math.PI*2); ctx.fill(); ctx.strokeStyle=colors[2]; ctx.strokeRect(-8,-8,16,16); }
      else if(p.kind==='ground_wave'){ ctx.beginPath(); ctx.moveTo(-25,12); ctx.quadraticCurveTo(0,-14,28,8); ctx.lineTo(20,15); ctx.lineTo(-28,15); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(0,0,12,0,Math.PI*2); ctx.fill(); }
      ctx.restore();
    });
  };

  function visibleSkillList(){ return (typeof getVisibleSkills === 'function' ? getVisibleSkills() : []).slice(); }
  drawSkillsPanel = function(){
    const x=55,y=70,w=820,h=Math.min(570,H-100); const list=visibleSkillList(); const rowH=58; const viewTop=y+100, viewH=h-145;
    skillPanelState.max=Math.max(0,list.length*rowH-viewH); skillPanelState.scroll=clampLocal(skillPanelState.scroll,0,skillPanelState.max);
    ctx.fillStyle='rgba(15,23,42,0.97)'; roundRect(ctx,x,y,w,h,14); ctx.strokeStyle='#93c5fd'; ctx.strokeRect(x,y,w,h);
    ctx.fillStyle='#ffe066'; ctx.font='bold 27px sans-serif'; ctx.textAlign='left'; ctx.fillText('스킬',x+25,y+42);
    ctx.fillStyle='#cbd5e1'; ctx.font='14px sans-serif'; ctx.fillText('마우스 휠/터치패드로 내리고, 해금된 스킬을 클릭하면 K → L → ; 순서로 장착됩니다.',x+25,y+70);
    ctx.save(); ctx.beginPath(); ctx.rect(x+20,viewTop,w-230,viewH); ctx.clip();
    list.forEach(function(skill,i){
      const rowY=viewTop+i*rowH-skillPanelState.scroll; if(rowY<viewTop-60||rowY>viewTop+viewH+10) return;
      const unlocked=skills.unlocked.includes(skill.id); ctx.fillStyle=unlocked?'#1e293b':'#111827'; roundRect(ctx,x+30,rowY,w-270,48,8);
      drawSkillIcon(skill,x+62,rowY+24,28); ctx.fillStyle=unlocked?'#fff':'#64748b'; ctx.font='bold 15px sans-serif'; ctx.fillText(skill.name,x+100,rowY+19);
      ctx.fillStyle=unlocked?'#cbd5e1':'#64748b'; ctx.font='12px sans-serif'; let desc='Lv.'+(skill.unlockLevel||1)+' / MP '+(skill.mp||0)+' / '+(skill.desc||'스킬'); if(desc.length>64) desc=desc.slice(0,61)+'...'; ctx.fillText(desc,x+100,rowY+38);
      if(!unlocked){ ctx.fillStyle='rgba(0,0,0,0.35)'; roundRect(ctx,x+30,rowY,w-270,48,8); }
    }); ctx.restore();
    ctx.fillStyle='#334155'; roundRect(ctx,x+w-230,viewTop,8,viewH,4); if(skillPanelState.max>0){ const bh=Math.max(36,viewH*(viewH/(viewH+skillPanelState.max))); const by=viewTop+(viewH-bh)*(skillPanelState.scroll/skillPanelState.max); ctx.fillStyle='#93c5fd'; roundRect(ctx,x+w-230,by,8,bh,4); }
    ctx.fillStyle='#ffe066'; ctx.font='bold 16px sans-serif'; ctx.fillText('단축키',x+w-170,viewTop+10); drawSkillSlot('K',skills.hotkeys.k,x+w-170,viewTop+55); drawSkillSlot('L',skills.hotkeys.l,x+w-170,viewTop+107); drawSkillSlot(';',skills.hotkeys.semicolon,x+w-170,viewTop+159);
  };
  handleSkillClick = function(mx,my){
    const x=55,y=70,w=820,h=Math.min(570,H-100); const viewTop=y+100, viewH=h-145; const list=visibleSkillList(); const rowH=58;
    if(mx>=x+30&&mx<=x+w-240&&my>=viewTop&&my<=viewTop+viewH){ const idx=Math.floor((my-viewTop+skillPanelState.scroll)/rowH); const skill=list[idx]; if(skill&&skills.unlocked.includes(skill.id)){ const id=skill.id; if(!skills.hotkeys.k||skills.hotkeys.k===id) skills.hotkeys.k=id; else if(!skills.hotkeys.l||skills.hotkeys.l===id) skills.hotkeys.l=id; else skills.hotkeys.semicolon=id; makeText(skill.name+' 장착',game.player.x,game.player.y-90,'#ffe066'); markAutoSaveSoon(); } return; }
    if(hit(mx,my,x+w-170,viewTop+30,140,38)) skills.hotkeys.k=null; if(hit(mx,my,x+w-170,viewTop+82,140,38)) skills.hotkeys.l=null; if(hit(mx,my,x+w-170,viewTop+134,140,38)) skills.hotkeys.semicolon=null;
  };
  if (typeof canvas !== 'undefined' && canvas && !canvas.__skillScrollWheel01) { canvas.__skillScrollWheel01=true; canvas.addEventListener('wheel',function(e){ if(skills&&skills.open){ skillPanelState.scroll=clampLocal(skillPanelState.scroll+e.deltaY,0,skillPanelState.max); e.preventDefault(); }},{passive:false}); }

  function floorForNpc(x,y){ let best=null,score=Infinity; arr(game.platforms).forEach(function(pf){ if(!pf) return; if(x<pf.x-60||x>pf.x+pf.w+60) return; const dy=Math.abs((pf.y||game.ground)-(y||game.ground)); if(dy<score){score=dy;best=pf;} }); return best?best.y:game.ground; }
  const oldDrawNPCs2 = typeof drawNPCs === 'function' ? drawNPCs : null;
  drawNPCs = function(){
    arr(game.npcs).forEach(function(npc){ if(!npc) return; const gy=floorForNpc(npc.x,npc.y); if(!Number.isFinite(npc.y)||Math.abs(npc.y-gy)>22) npc.y=gy; drawSdNpc(npc,npc.x,npc.y); ctx.textAlign='center'; ctx.font='bold 14px sans-serif'; const name=String(npc.name||'NPC'); const tw=ctx.measureText(name).width+26; ctx.fillStyle='rgba(15,23,42,0.92)'; roundRect(ctx,npc.x-tw/2,npc.y-111,tw,24,8); ctx.fillStyle='#fff'; ctx.fillText(name,npc.x,npc.y-94); if(Math.abs(game.player.x-npc.x)<90&&Math.abs(game.player.y-npc.y)<100){ ctx.fillStyle='#ffe066'; ctx.font='bold 14px sans-serif'; ctx.fillText('E 대화',npc.x,npc.y-120); } });
  };
})();


/* =========================================================
   80 UNIQUE JOB SKILLS / NAME-MATCHED EFFECT PATCH
   - Every job has five named skills, 80 total definitions.
   - Each skill uses its own visual pattern matched to the skill name.
   - Adds job skill instructors in towns; talk to learn current job skills.
========================================================= */
(function () {
  'use strict';
  const SKILL80 = [["beginner", "swift_cut", "빠른 베기", "swiftCut", "slash", 1.15, 82, 0.75, 0, "짧은 거리의 빠른 칼자국을 냅니다."], ["beginner", "stone_throw", "돌던지기", "stoneArc", "stone", 1.25, 300, 2.5, 3, "회색 돌을 포물선으로 던집니다."], ["beginner", "breathing", "숨고르기", "greenBreath", "heal", 0, 0, 3.0, 6, "호흡을 가다듬어 HP를 회복합니다."], ["beginner", "sand_kick", "모래 차기", "sandKick", "sand", 1.05, 95, 1.1, 2, "앞쪽에 흙먼지를 차올립니다."], ["beginner", "lucky_pebble", "행운 조약돌", "pebbleBurst", "stone", 1.35, 180, 1.8, 4, "작은 조약돌이 튀며 공격합니다."], ["warrior", "power_slash", "파워 슬래시", "heavySlash", "slash", 1.9, 125, 1.2, 10, "묵직한 검기를 휘두릅니다."], ["warrior", "rising_blade", "올려베기", "upperCutWave", "slash", 1.75, 110, 1.5, 11, "위로 솟는 검풍을 만듭니다."], ["warrior", "shield_crash", "방패 충격", "shieldCrash", "impact", 2.0, 105, 2.1, 12, "방패 모양 충격파로 밀어냅니다."], ["warrior", "iron_cleave", "철벽 가르기", "ironCleave", "metal", 2.25, 145, 2.7, 14, "은빛 금속 검광으로 베어냅니다."], ["warrior", "earth_splitter", "대지 가르기", "groundSplit", "earth", 2.6, 180, 3.3, 16, "땅을 타고 균열 충격파가 나갑니다."], ["mage", "fireball", "파이어볼", "fireOrb", "fire", 2.1, 340, 1.7, 14, "불덩이를 발사합니다."], ["mage", "ice_bloom", "얼음꽃", "iceBloom", "ice", 2.0, 300, 2.2, 16, "얼음 결정 꽃이 피어납니다."], ["mage", "arcane_missile", "비전탄", "arcaneMissile", "arcane", 1.7, 380, 1.25, 12, "보라빛 마력탄을 날립니다."], ["mage", "thunder_spark", "번개 스파크", "thunderSpark", "lightning", 2.35, 320, 2.6, 18, "갈라지는 번개가 튑니다."], ["mage", "meteor_seed", "작은 메테오", "miniMeteor", "fire", 2.9, 260, 4.0, 24, "작은 유성이 떨어집니다."], ["rogue", "double_stab", "이중 찌르기", "doubleStab", "shadow", 1.35, 88, 0.7, 7, "두 번 빠르게 찌릅니다."], ["rogue", "shadow_step", "그림자 걸음", "shadowDash", "shadow", 1.8, 140, 1.8, 10, "그림자를 남기며 돌진합니다."], ["rogue", "poison_needle", "독침", "poisonNeedle", "poison", 1.65, 330, 1.9, 10, "가느다란 독침을 쏩니다."], ["rogue", "fan_of_knives", "칼날 부채", "knifeFan", "shadow", 2.0, 260, 2.4, 13, "부채처럼 단검을 흩뿌립니다."], ["rogue", "night_lotus", "밤연꽃", "darkLotus", "shadow", 2.6, 170, 3.6, 18, "검은 꽃잎 폭발을 만듭니다."], ["archer", "rapid_arrow", "연속 화살", "rapidArrow", "wind", 1.25, 410, 1.0, 8, "화살을 연속 발사합니다."], ["archer", "piercing_arrow", "관통 화살", "pierceArrow", "wind", 2.05, 460, 2.2, 12, "긴 관통 화살빛을 쏩니다."], ["archer", "arrow_rain", "화살비", "arrowRain", "wind", 2.25, 360, 3.0, 15, "위에서 화살비가 떨어집니다."], ["archer", "wind_trap", "바람 덫", "windTrap", "wind", 1.95, 240, 2.8, 14, "초록 바람 소용돌이를 설치합니다."], ["archer", "hawk_shot", "매의 사격", "hawkShot", "wind", 2.8, 480, 4.1, 20, "매 형상의 화살이 날아갑니다."], ["paladin", "holy_cross", "성광 십자", "holyCross", "holy", 2.3, 170, 2.4, 15, "빛나는 십자가가 폭발합니다."], ["paladin", "shield_smite", "방패 응징", "goldShield", "holy", 2.25, 120, 2.6, 13, "황금 방패 충격을 냅니다."], ["paladin", "judgement_ray", "심판의 광선", "judgementRay", "holy", 2.75, 420, 3.5, 22, "하늘에서 성스러운 광선이 내려옵니다."], ["paladin", "sanctuary_ring", "성역의 고리", "sanctuaryRing", "holy", 1.8, 190, 3.0, 18, "성스러운 고리가 퍼집니다."], ["paladin", "sun_lance", "태양 창", "sunLance", "holy", 3.1, 390, 4.4, 26, "태양빛 창을 던집니다."], ["berserker", "rage_burst", "분노 폭발", "rageBurst", "fire", 2.2, 135, 2.4, 14, "붉은 분노가 터집니다."], ["berserker", "blood_spin", "피의 회전", "bloodSpin", "fire", 2.45, 170, 3.0, 16, "붉은 회전 베기를 합니다."], ["berserker", "wild_howl", "야성 포효", "howlShock", "impact", 2.0, 210, 2.8, 15, "포효 충격파를 냅니다."], ["berserker", "skull_crusher", "해골 분쇄", "skullCrush", "impact", 2.9, 145, 3.7, 21, "해골 형상의 충격이 떨어집니다."], ["berserker", "lava_rush", "용암 돌진", "lavaRush", "fire", 3.35, 290, 4.8, 28, "용암 흔적을 남기며 돌진합니다."], ["cleric", "heal_breeze", "회복의 바람", "healBreeze", "heal", 0, 0, 3.5, 16, "초록 바람으로 회복합니다."], ["cleric", "holy_spark", "성광탄", "holySpark", "holy", 1.85, 340, 1.7, 12, "작은 성광탄을 발사합니다."], ["cleric", "purify_wave", "정화 파동", "purifyWave", "holy", 2.2, 220, 3.0, 17, "하얀 파동으로 정화합니다."], ["cleric", "angel_feather", "천사의 깃털", "angelFeather", "holy", 2.5, 360, 3.6, 21, "깃털 빛이 흩날립니다."], ["cleric", "divine_pillar", "신성 기둥", "divinePillar", "holy", 3.0, 230, 4.5, 26, "빛의 기둥이 솟습니다."], ["summoner", "summon_wisp", "정령탄", "wispHoming", "arcane", 1.75, 360, 1.6, 12, "유도 정령탄을 보냅니다."], ["summoner", "beast_echo", "야수 메아리", "beastEcho", "wind", 2.1, 260, 2.6, 15, "야수 발톱의 메아리가 나갑니다."], ["summoner", "spirit_gate", "정령문", "spiritGate", "arcane", 2.55, 230, 3.6, 22, "정령문에서 마력탄이 나옵니다."], ["summoner", "thorn_familiar", "가시 사역마", "thornFamiliar", "poison", 2.4, 330, 3.2, 19, "가시 사역마가 튀어나옵니다."], ["summoner", "phantom_pack", "환영 무리", "phantomPack", "arcane", 3.1, 360, 4.8, 30, "환영 무리가 돌진합니다."], ["gunslinger", "bullet_rain", "탄환 난사", "bulletRain", "bullet", 1.1, 430, 1.0, 9, "작은 탄환을 빠르게 쏩니다."], ["gunslinger", "blast_shot", "폭발탄", "blastShot", "fire", 2.25, 370, 2.5, 15, "폭발하는 탄환을 쏩니다."], ["gunslinger", "silver_reload", "실버 리로드", "silverReload", "buff", 0, 0, 3.8, 14, "은빛 탄환 기운을 두릅니다."], ["gunslinger", "ricochet", "도탄 사격", "ricochet", "bullet", 2.35, 420, 3.0, 17, "벽에 튕기는 듯한 탄환을 쏩니다."], ["gunslinger", "rail_buster", "레일 버스터", "railBuster", "lightning", 3.25, 520, 4.7, 28, "긴 전자포를 발사합니다."], ["lancer", "pierce_lance", "관통창", "pierceLance", "lightning", 2.1, 185, 2.0, 12, "길게 뻗는 창격을 냅니다."], ["lancer", "spear_wall", "창벽", "spearWall", "metal", 2.35, 165, 2.8, 16, "창벽을 세워 찌릅니다."], ["lancer", "sky_thrust", "천공 찌르기", "skyThrust", "wind", 2.65, 200, 3.4, 20, "하늘로 솟는 찌르기입니다."], ["lancer", "dragon_piercer", "용창 관통", "dragonPiercer", "fire", 3.15, 340, 4.3, 26, "용 문양 창기가 관통합니다."], ["lancer", "storm_javelin", "폭풍 투창", "stormJavelin", "wind", 3.0, 430, 4.0, 24, "폭풍을 두른 투창을 던집니다."], ["engineer", "drone_zap", "드론 전격", "droneZap", "lightning", 1.85, 360, 1.8, 12, "드론 전격탄을 쏩니다."], ["engineer", "gear_bomb", "기어 폭탄", "gearBomb", "metal", 2.5, 280, 3.0, 18, "기어 모양 폭탄을 던집니다."], ["engineer", "repair_kit", "수리 키트", "repairKit", "heal", 0, 0, 4.0, 15, "기계를 수리하듯 회복합니다."], ["engineer", "magnet_mine", "자석 지뢰", "magnetMine", "lightning", 2.7, 250, 3.5, 22, "자석 지뢰가 적을 끌어당깁니다."], ["engineer", "laser_grid", "레이저 격자", "laserGrid", "lightning", 3.15, 410, 4.7, 30, "격자 레이저를 펼칩니다."], ["bard", "echo_note", "메아리 음표", "echoNote", "star", 1.7, 340, 1.7, 12, "음표가 튕겨 나갑니다."], ["bard", "crescendo", "크레센도", "crescendo", "holy", 2.35, 230, 3.0, 17, "점점 커지는 음파를 냅니다."], ["bard", "healing_song", "치유의 노래", "healingSong", "heal", 0, 0, 4.2, 18, "노래로 회복합니다."], ["bard", "sonic_boom", "소닉 붐", "sonicBoom", "wind", 2.8, 360, 3.6, 23, "푸른 음파가 전방으로 나갑니다."], ["bard", "finale_star", "피날레 스타", "finaleStar", "star", 3.25, 360, 4.8, 30, "별빛 피날레가 터집니다."], ["dragon_knight", "dragon_claw", "용조격", "dragonClaw", "dragon", 2.45, 150, 1.8, 16, "용 발톱 자국으로 찢습니다."], ["dragon_knight", "dragon_roar", "용의 포효", "dragonRoar", "dragon", 3.2, 230, 3.5, 22, "용의 포효가 전방을 흔듭니다."], ["dragon_knight", "flame_wing", "화염 날개", "flameWing", "dragon", 2.85, 360, 3.0, 20, "화염 날개가 앞으로 펼쳐집니다."], ["dragon_knight", "ancient_scale", "고룡의 비늘", "ancientScale", "buff", 0, 0, 5.0, 22, "고룡의 비늘이 몸을 감쌉니다."], ["dragon_knight", "wyrm_crash", "비룡 추락", "wyrmCrash", "dragon", 3.9, 300, 5.0, 34, "비룡 형상의 화염이 추락합니다."], ["shadow_reaper", "reaper_cut", "사신절단", "reaperCut", "dark", 2.85, 145, 2.2, 16, "낫 모양 그림자가 베어냅니다."], ["shadow_reaper", "black_moon", "검은 달", "blackMoon", "dark", 3.05, 340, 3.2, 24, "검은 초승달이 날아갑니다."], ["shadow_reaper", "soul_chain", "영혼 사슬", "soulChain", "dark", 2.75, 290, 3.0, 22, "영혼 사슬이 적을 묶습니다."], ["shadow_reaper", "death_blossom", "죽음의 꽃", "deathBlossom", "dark", 3.55, 210, 4.5, 30, "검은 꽃잎이 폭발합니다."], ["shadow_reaper", "eclipse_gate", "일식문", "eclipseGate", "dark", 4.1, 280, 5.6, 38, "일식의 문이 열립니다."], ["star_sage", "starfall", "별똥별", "starfall", "star", 2.7, 420, 3.0, 22, "별똥별이 사선으로 떨어집니다."], ["star_sage", "nova_ring", "노바 링", "novaRing", "star", 3.05, 230, 3.4, 25, "노바 고리가 확장됩니다."], ["star_sage", "comet_ray", "혜성 광선", "cometRay", "star", 3.35, 480, 4.2, 30, "혜성 같은 광선을 발사합니다."], ["star_sage", "galaxy_gate", "은하문", "galaxyGate", "star", 3.8, 280, 5.0, 36, "은하의 문에서 별빛이 쏟아집니다."], ["star_sage", "constellation_end", "성좌 종언", "constellationEnd", "star", 4.4, 360, 6.2, 44, "성좌가 이어지며 폭발합니다."]];
  const JOB_LABEL_PATCH = {
    beginner:'초보자', warrior:'전사', mage:'마법사', rogue:'도적', archer:'궁수',
    paladin:'성기사', berserker:'광전사', cleric:'성직자', summoner:'소환사', gunslinger:'건슬링어',
    lancer:'창기사', engineer:'기계공', mechanic:'기계공', bard:'음유시인',
    dragon_knight:'용기사', shadow_reaper:'그림자 사신', star_sage:'별의 현자'
  };
  const JOB_TRAINER_INFO = {
    beginner: ['초보 교관 루루', '기본 전투 기술을 알려줄게요.'],
    warrior: ['검술 교관 카론', '검을 휘두르는 법은 힘만으로 되는 게 아닙니다.'],
    mage: ['원소술사 미렌', '마력은 모양을 이해해야 강해집니다.'],
    rogue: ['그림자 교관 세라', '빠르게, 조용하게, 두 번 찌르세요.'],
    archer: ['궁술 교관 리아', '바람의 길을 읽으면 화살이 빗나가지 않습니다.'],
    paladin: ['성기사 교관 아벨', '방패와 빛의 맹세를 가르치겠습니다.'],
    berserker: ['광전사 교관 브라크', '분노를 휘두르되, 분노에 먹히지 마라.'],
    cleric: ['성직자 교관 엘린', '회복과 정화의 흐름을 익혀 보세요.'],
    summoner: ['소환술사 노아', '정령은 부르는 이름에 반응합니다.'],
    gunslinger: ['건술 교관 레온', '총알은 빠르지만 손은 더 빨라야 합니다.'],
    lancer: ['창술 교관 바론', '창끝의 선을 잃지 마세요.'],
    engineer: ['기계공 교관 톤', '장치는 전투의 또 다른 동료입니다.'],
    mechanic: ['기계공 교관 톤', '장치는 전투의 또 다른 동료입니다.'],
    bard: ['음유시인 세린', '음표도 무기가 될 수 있어요.'],
    dragon_knight: ['용혈 스승 아르딘', '용의 기술은 용의 이름에 맞게 펼쳐야 합니다.'],
    shadow_reaper: ['사신 교관 녹스', '그림자는 베는 순간에만 모습을 드러냅니다.'],
    star_sage: ['성좌 스승 루미엘', '별은 순서를 알 때 가장 밝게 터집니다.']
  };

  function arr(v) { return Array.isArray(v) ? v : []; }
  function rnd(a,b) { return a + Math.random() * (b-a); }
  function clamp2(v,a,b) { return Math.max(a, Math.min(b, v)); }
  function nowPlayer() { return game && game.player ? game.player : null; }
  function jobNameOf(id) { return (JOBS && JOBS[id] && JOBS[id].name) || JOB_LABEL_PATCH[id] || id || '직업'; }
  Object.keys(JOB_LABEL_PATCH).forEach(function (job) {
    if (typeof JOBS !== 'undefined' && JOBS && !JOBS[job]) JOBS[job] = { name: JOB_LABEL_PATCH[job], main: 'str' };
  });

  function addOrReplaceSkill(row, idx) {
    const job=row[0], id=row[1], name=row[2], fx=row[3], element=row[4], power=row[5], range=row[6], cooldown=row[7], mp=row[8], desc=row[9];
    SKILLS[id] = Object.assign({}, SKILLS[id] || {}, {
      id, name, job, fx, visual: fx, element,
      unlockLevel: Math.max(1, Math.floor(idx % 5) * 4 + 1),
      mp, power, range, cooldown, desc,
      projectile: range >= 250,
      magic: /mage|cleric|summoner|star_sage/.test(job) || /fire|ice|holy|arcane|star|dark|dragon|lightning|wind/.test(element)
    });
  }
  SKILL80.forEach(addOrReplaceSkill);

  function currentJobId() {
    const p=nowPlayer(); return (p && p.character && p.character.job) || 'beginner';
  }
  function jobSkillIds(job) {
    return SKILL80.filter(function (r) { return r[0] === job || (job === 'engineer' && r[0] === 'mechanic'); }).map(function (r) { return r[1]; });
  }

  function learnCurrentJobSkills(sourceName) {
    const p=nowPlayer(); if(!p) return;
    const job=currentJobId();
    const ids = jobSkillIds(job).length ? jobSkillIds(job) : jobSkillIds('beginner');
    let learned=0;
    ids.forEach(function(id) { if(!skills.unlocked.includes(id)) { skills.unlocked.push(id); learned++; } });
    if (!skills.hotkeys.k && ids[0]) skills.hotkeys.k = ids[0];
    if (!skills.hotkeys.l && ids[1]) skills.hotkeys.l = ids[1];
    if (!skills.hotkeys.semicolon && ids[2]) skills.hotkeys.semicolon = ids[2];
    makeText((sourceName || jobNameOf(job)+' 교관') + ': ' + (learned ? learned + '개 스킬 전수!' : '이미 모든 스킬을 배웠습니다.'), p.x, p.y - 105, learned ? '#ffe066' : '#cbd5e1');
    if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
  }

  const oldRefreshUnlockedSkills80 = typeof refreshUnlockedSkills === 'function' ? refreshUnlockedSkills : null;
  refreshUnlockedSkills = function () {
    if (oldRefreshUnlockedSkills80) oldRefreshUnlockedSkills80.apply(this, arguments);
    const job=currentJobId();
    jobSkillIds('beginner').forEach(function(id) {
      const sk=SKILLS[id]; const p=nowPlayer();
      if(sk && p && p.level >= (sk.unlockLevel||1) && !skills.unlocked.includes(id)) skills.unlocked.push(id);
    });
    // If a character already had only legacy skills, give at least the first job skill so they are not locked out.
    const p=nowPlayer();
    if(p && p.level >= 10 && job !== 'beginner') {
      const ids=jobSkillIds(job); if(ids[0] && !skills.unlocked.some(function(id) { return SKILLS[id] && SKILLS[id].job === job; })) skills.unlocked.push(ids[0]);
    }
  };

  function groundYForNpc(x) {
    let best = null, by = game.ground || 560;
    arr(game.platforms).forEach(function(pf) { if(x >= pf.x - 20 && x <= pf.x + pf.w + 20) { if(best === null || pf.y > best) { best = pf.y; by = pf.y; } } });
    return by;
  }
  function addSkillTrainerNpc() {
    if(!game || !Array.isArray(game.npcs)) return;
    const job=currentJobId();
    const info=JOB_TRAINER_INFO[job] || JOB_TRAINER_INFO.beginner;
    if(game.npcs.some(function(n) { return n && n.type === 'skill_teacher'; })) return;
    const x = clamp2((game.player && game.player.x ? game.player.x + 260 : 1960), 360, Math.max(800, (game.width || 4300)-380));
    game.npcs.push({ type:'skill_teacher', name:info[0], x:x, y:groundYForNpc(x), text:info[1], lookJob:job });
  }
  const oldLoadTown80 = typeof loadTown === 'function' ? loadTown : null;
  if (oldLoadTown80) loadTown = function() { oldLoadTown80.apply(this, arguments); addSkillTrainerNpc(); };
  const oldLoadHunt80 = typeof loadHunt === 'function' ? loadHunt : null;
  if (oldLoadHunt80) loadHunt = function() { oldLoadHunt80.apply(this, arguments); };

  const oldInteract80 = typeof interact === 'function' ? interact : null;
  interact = function () {
    const p=nowPlayer();
    if(p && Array.isArray(game.npcs)) {
      for (const npc of game.npcs) {
        if(npc && npc.type === 'skill_teacher' && Math.abs(p.x-npc.x)<95 && Math.abs(p.y-npc.y)<145) {
          if (typeof stopPlayerMovement === 'function') stopPlayerMovement();
          learnCurrentJobSkills(npc.name);
          return;
        }
      }
    }
    if(oldInteract80) return oldInteract80.apply(this, arguments);
  };

  const PALETTE = {
    slash:['#fff7ad','#ffd166','#fb923c'], stone:['#d1d5db','#8b8f98','#4b5563'], heal:['#bbf7d0','#4ade80','#16a34a'], sand:['#fde68a','#d6a34d','#92400e'],
    earth:['#ca8a04','#854d0e','#facc15'], fire:['#fff7ad','#fb923c','#dc2626'], ice:['#e0f2fe','#67e8f9','#2563eb'], arcane:['#ddd6fe','#a78bfa','#7c3aed'],
    lightning:['#fef08a','#facc15','#60a5fa'], shadow:['#e9d5ff','#a855f7','#1e1b4b'], poison:['#d9f99d','#84cc16','#365314'], wind:['#dcfce7','#86efac','#22c55e'],
    holy:['#fff7ed','#fde68a','#f59e0b'], metal:['#e5e7eb','#94a3b8','#475569'], impact:['#fecaca','#fb7185','#7f1d1d'], dark:['#f0abfc','#7e22ce','#020617'],
    star:['#fef9c3','#fde047','#60a5fa'], dragon:['#fed7aa','#f97316','#7f1d1d'], bullet:['#f8fafc','#cbd5e1','#64748b']
  };
  function pal(skill) { return PALETTE[skill.element] || PALETTE[skill.magic ? 'arcane' : 'slash']; }
  function pushFx(x,y,vx,vy,life,color,size,shape,rot) {
    if(!game.particles) game.particles=[];
    game.particles.push({ x,y,vx:vx||0,vy:vy||0,life:life||0.35,color:color||'#fff',size:size||4,shape:shape||'dot',rot:rot||0 });
  }
  function lineBurst(x1,y1,x2,y2,colors,n,shape) {
    for(let i=0;i<n;i++) { const t=i/Math.max(1,n-1); pushFx(x1+(x2-x1)*t+rnd(-5,5), y1+(y2-y1)*t+rnd(-5,5), rnd(-20,20), rnd(-40,15), rnd(.25,.55), colors[i%colors.length], rnd(3,8), shape||'slash', Math.atan2(y2-y1,x2-x1)); }
  }
  function ringBurst(x,y,colors,n,r,shape) {
    for(let i=0;i<n;i++) { const a=i*Math.PI*2/n; pushFx(x+Math.cos(a)*r*.35,y+Math.sin(a)*r*.35,Math.cos(a)*rnd(50,140),Math.sin(a)*rnd(50,140),rnd(.35,.75),colors[i%colors.length],rnd(3,9),shape||'spark',a); }
  }
  function rainFx(cx,top,colors,n,shape,slant) {
    for(let i=0;i<n;i++) { const x=cx+rnd(-180,180); const y=top+rnd(-180,-30); lineBurst(x,y,x+(slant||1)*rnd(30,90),y+rnd(90,170),colors,4,shape||'beam'); }
  }
  function spiralFx(cx,cy,colors,n,r,shape) {
    for(let i=0;i<n;i++) { const a=i*.55, rr=(i/n)*r; pushFx(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr,Math.cos(a)*rnd(20,100),Math.sin(a)*rnd(20,100),rnd(.4,.85),colors[i%colors.length],rnd(3,8),shape||'orb',a); }
  }
  function damageBox(skill,cx,cy,rx,ry,hits) {
    if(game.mode !== 'hunt') return 0; let count=0;
    arr(game.monsters).forEach(function(m) {
      if(!m || m.dead) return;
      if(Math.abs(m.x-cx)<=rx && Math.abs((m.y-50)-cy)<=ry) {
        m.aggro=true; m.hasBeenHit=true;
        for(let i=0;i<(hits||1);i++) damageMonster(m, skill);
        count++;
      }
    });
    return count;
  }
  function damageLine(skill,x1,y1,x2,y2,width,hits) {
    if(game.mode !== 'hunt') return 0; let count=0;
    const dx=x2-x1, dy=y2-y1, len2=dx*dx+dy*dy || 1;
    arr(game.monsters).forEach(function(m) {
      if(!m || m.dead) return;
      const px=m.x, py=m.y-50; let t=((px-x1)*dx+(py-y1)*dy)/len2; t=clamp2(t,0,1); const qx=x1+dx*t, qy=y1+dy*t;
      if(Math.hypot(px-qx,py-qy)<=width) { m.aggro=true; m.hasBeenHit=true; for(let i=0;i<(hits||1);i++) damageMonster(m, skill); count++; }
    });
    return count;
  }

  const SHAPES = ['slash','star','flame','orb','rune','beam','cloud','shard','spark','bubble','gear'];
  function uniqueFallbackPattern(skill, colors, p, dir, ox, oy, idx) {
    const mode = idx % 10;
    if(mode===0) { lineBurst(p.x+dir*20,oy-25,p.x+dir*(150+idx%5*18),oy+20,colors,16,'slash'); damageLine(skill,p.x,oy,p.x+dir*skill.range,oy,55,skill.hits||1); }
    else if(mode===1) { ringBurst(ox,oy,colors,24+idx%12,45+idx%30,'star'); damageBox(skill,ox,oy,90,75,skill.hits||1); }
    else if(mode===2) { rainFx(ox,oy-80,colors,10+idx%8,'beam',dir); damageBox(skill,ox,oy,170,140,skill.hits||1); }
    else if(mode===3) { spiralFx(ox,oy,colors,28+idx%12,85,SHAPES[idx%SHAPES.length]); damageBox(skill,ox,oy,100,90,skill.hits||1); }
    else if(mode===4) { for(let i=0;i<5;i++) lineBurst(p.x+dir*25,oy-35+i*14,p.x+dir*(130+i*18),oy-25+i*10,colors,6,'beam'); damageLine(skill,p.x,oy,p.x+dir*skill.range,oy,65,skill.hits||1); }
    else if(mode===5) { for(let i=0;i<3;i++) ringBurst(ox+dir*i*45,oy-rnd(0,25),colors,14,25+i*12,'orb'); damageBox(skill,ox+dir*45,oy,150,80,skill.hits||1); }
    else if(mode===6) { lineBurst(p.x+dir*10,p.y-18,p.x+dir*(skill.range||160),p.y-18,colors,22,'shard'); damageLine(skill,p.x,p.y-22,p.x+dir*skill.range,p.y-22,48,skill.hits||1); }
    else if(mode===7) { for(let i=0;i<4;i++) lineBurst(ox-dir*15,oy-50+i*22,ox+dir*(100+rnd(0,50)),oy-40+i*15,colors,8,'slash'); damageBox(skill,ox+dir*60,oy,150,100,skill.hits||1); }
    else if(mode===8) { ringBurst(ox,oy,colors,34,70,'rune'); lineBurst(ox-dir*70,oy,ox+dir*90,oy,colors,16,'beam'); damageBox(skill,ox,oy,125,100,skill.hits||1); }
    else { rainFx(ox+dir*80,oy,colors,8,'star',dir); spiralFx(ox,oy,colors,22,60,'spark'); damageBox(skill,ox+dir*65,oy,155,120,skill.hits||1); }
  }

  const FX_INDEX = {};
  SKILL80.forEach(function(r,i) { FX_INDEX[r[3]] = i; });
  const oldUseSkill80 = typeof useSkill === 'function' ? useSkill : null;
  useSkill = function(id) {
    const skill=SKILLS[id]; const p=nowPlayer(); if(!skill || !p) return;
    if(!skills.unlocked.includes(id)) { makeText('아직 배운 스킬이 아닙니다.',p.x,p.y-90,'#ff8787'); return; }
    if((skills.cooldowns[id]||0)>0) { makeText('쿨타임 중',p.x,p.y-90,'#cbd5e1'); return; }
    if(p.mp < (skill.mp||0)) { makeText('MP 부족',p.x,p.y-90,'#74c0fc'); return; }
    p.mp -= skill.mp||0; skills.cooldowns[id]=skill.cooldown||1.5; p.attackTime=.42; p.anim='attack'; p.animTime=0;
    const colors=pal(skill), dir=p.face||1, ox=p.x+dir*70, oy=p.y-58;
    if(skill.element==='heal' || skill.fx==='greenBreath' || skill.fx==='healBreeze' || skill.fx==='healingSong' || skill.fx==='repairKit') {
      const heal=Math.max(35, Math.floor((p.maxHp||100)*0.18)); p.hp=Math.min(p.maxHp,p.hp+heal); ringBurst(p.x,p.y-55,colors,30,65,'bubble'); spiralFx(p.x,p.y-60,colors,24,45,'spark'); makeText('+'+heal+' HP',p.x,p.y-95,'#86efac'); return;
    }
    if(skill.element==='buff' || skill.fx==='silverReload' || skill.fx==='ancientScale') {
      ringBurst(p.x,p.y-55,colors,36,75,'rune'); for(let i=0;i<18;i++) pushFx(p.x+rnd(-25,25),p.y-85+rnd(-25,35),rnd(-25,25),rnd(-80,-20),.65,colors[i%colors.length],rnd(4,8),'star'); makeText(skill.name+'!',p.x,p.y-100,colors[1]); return;
    }
    switch(skill.fx) {
      case 'swiftCut': lineBurst(p.x+dir*18,oy-18,p.x+dir*105,oy+18,colors,12,'slash'); damageLine(skill,p.x,oy,p.x+dir*115,oy,46,1); break;
      case 'stoneArc': lineBurst(p.x+dir*25,oy,p.x+dir*230,oy-35,colors,10,'shard'); ringBurst(p.x+dir*250,oy-28,colors,14,28,'shard'); damageBox(skill,p.x+dir*250,oy-25,52,48,1); break;
      case 'heavySlash': lineBurst(p.x+dir*20,oy-38,p.x+dir*145,oy+34,colors,22,'slash'); ringBurst(ox,oy,colors,10,36,'spark'); damageLine(skill,p.x,oy,p.x+dir*155,oy,70,1); break;
      case 'upperCutWave': lineBurst(p.x+dir*30,p.y-22,p.x+dir*105,p.y-118,colors,20,'slash'); damageBox(skill,p.x+dir*80,p.y-70,80,95,1); break;
      case 'shieldCrash': ringBurst(ox,oy,colors,26,55,'gear'); lineBurst(p.x+dir*30,oy,p.x+dir*130,oy,colors,14,'beam'); damageBox(skill,ox,oy,95,70,1); break;
      case 'groundSplit': lineBurst(p.x+dir*15,p.y-18,p.x+dir*220,p.y-18,colors,26,'shard'); for(let i=0;i<8;i++) pushFx(p.x+dir*(45+i*24),p.y-24,rnd(-15,15),rnd(-90,-35),.55,colors[i%3],rnd(5,11),'shard'); damageLine(skill,p.x,p.y-20,p.x+dir*230,p.y-20,60,1); break;
      case 'fireOrb': spiralFx(ox,oy,colors,24,38,'flame'); lineBurst(p.x+dir*35,oy,p.x+dir*330,oy,colors,24,'flame'); damageLine(skill,p.x,oy,p.x+dir*340,oy,55,1); break;
      case 'iceBloom': ringBurst(ox+dir*80,oy,colors,32,74,'shard'); for(let i=0;i<10;i++) lineBurst(ox+dir*80,oy,ox+dir*80+Math.cos(i*.63)*70,oy+Math.sin(i*.63)*70,colors,4,'beam'); damageBox(skill,ox+dir*80,oy,115,90,1); break;
      case 'thunderSpark': for(let i=0;i<5;i++) lineBurst(p.x+dir*(40+i*48),oy+rnd(-30,25),p.x+dir*(85+i*48),oy+rnd(-35,35),colors,7,'beam'); damageLine(skill,p.x,oy,p.x+dir*330,oy,70,1); break;
      case 'miniMeteor': rainFx(ox+dir*90,oy+60,colors,7,'flame',dir); ringBurst(ox+dir*95,oy+25,colors,26,62,'flame'); damageBox(skill,ox+dir*100,oy+25,120,120,1); break;
      case 'doubleStab': lineBurst(p.x+dir*20,oy-12,p.x+dir*95,oy-12,colors,10,'beam'); lineBurst(p.x+dir*20,oy+12,p.x+dir*95,oy+12,colors,10,'beam'); damageLine(skill,p.x,oy,p.x+dir*105,oy,45,2); break;
      case 'shadowDash': lineBurst(p.x-dir*25,oy,p.x+dir*155,oy,colors,24,'cloud'); ringBurst(p.x+dir*135,oy,colors,20,45,'slash'); damageLine(skill,p.x,oy,p.x+dir*160,oy,65,1); break;
      case 'poisonNeedle': for(let i=0;i<6;i++) lineBurst(p.x+dir*25,oy-25+i*8,p.x+dir*320,oy-25+i*8+rnd(-10,10),colors,5,'beam'); damageLine(skill,p.x,oy,p.x+dir*330,oy,75,1); break;
      case 'knifeFan': for(let i=-3;i<=3;i++) lineBurst(p.x+dir*28,oy,p.x+dir*250,oy+i*22,colors,7,'slash'); damageBox(skill,ox+dir*120,oy,190,95,1); break;
      case 'darkLotus': ringBurst(ox,oy,colors,38,80,'star'); spiralFx(ox,oy,colors,30,90,'slash'); damageBox(skill,ox,oy,125,95,2); break;
      case 'rapidArrow': for(let i=0;i<4;i++) lineBurst(p.x+dir*30,oy-18+i*12,p.x+dir*400,oy-18+i*12,colors,8,'beam'); damageLine(skill,p.x,oy,p.x+dir*410,oy,65,2); break;
      case 'pierceArrow': lineBurst(p.x+dir*30,oy,p.x+dir*470,oy,colors,36,'beam'); ringBurst(p.x+dir*470,oy,colors,10,28,'spark'); damageLine(skill,p.x,oy,p.x+dir*470,oy,45,1); break;
      case 'arrowRain': rainFx(ox+dir*120,oy+60,colors,14,'beam',dir); damageBox(skill,ox+dir*125,oy+35,210,135,1); break;
      case 'windTrap': spiralFx(ox+dir*70,oy+25,colors,40,85,'cloud'); damageBox(skill,ox+dir*70,oy+25,105,105,1); break;
      case 'hawkShot': lineBurst(p.x+dir*35,oy-10,p.x+dir*480,oy-55,colors,30,'star'); for(let i=0;i<8;i++) pushFx(p.x+dir*(120+i*35),oy-45+rnd(-8,8),0,rnd(-30,20),.55,colors[i%3],8,'slash'); damageLine(skill,p.x,oy,p.x+dir*490,oy-55,70,1); break;
      case 'holyCross': lineBurst(ox,oy-70,ox,oy+70,colors,18,'beam'); lineBurst(ox-dir*70,oy,ox+dir*70,oy,colors,18,'beam'); ringBurst(ox,oy,colors,24,58,'star'); damageBox(skill,ox,oy,105,105,1); break;
      case 'judgementRay': for(let i=0;i<5;i++) lineBurst(ox+dir*i*30,oy-180,ox+dir*i*30,oy+45,colors,12,'beam'); damageBox(skill,ox+dir*60,oy,155,150,1); break;
      case 'sanctuaryRing': ringBurst(p.x,p.y-55,colors,46,115,'rune'); damageBox(skill,p.x,p.y-55,130,110,1); break;
      case 'sunLance': lineBurst(p.x+dir*30,oy,p.x+dir*400,oy-35,colors,30,'beam'); ringBurst(p.x+dir*400,oy-35,colors,18,50,'star'); damageLine(skill,p.x,oy,p.x+dir*420,oy-35,65,1); break;
      case 'rageBurst': ringBurst(ox,oy,colors,34,72,'flame'); damageBox(skill,ox,oy,105,85,1); break;
      case 'bloodSpin': spiralFx(p.x,p.y-55,colors,44,105,'slash'); damageBox(skill,p.x,p.y-55,130,100,2); break;
      case 'howlShock': for(let r=35;r<170;r+=28) ringBurst(p.x+dir*r,oy,colors,14,r*.25,'cloud'); damageLine(skill,p.x,oy,p.x+dir*220,oy,95,1); break;
      case 'lavaRush': lineBurst(p.x, p.y-18, p.x+dir*300, p.y-18, colors, 42, 'flame'); damageLine(skill,p.x,p.y-20,p.x+dir*310,p.y-20,75,1); break;
      case 'healBreeze': case 'healingSong': ringBurst(p.x,p.y-55,colors,32,80,'bubble'); spiralFx(p.x,p.y-65,colors,26,55,'star'); break;
      case 'holySpark': lineBurst(p.x+dir*30,oy,p.x+dir*330,oy-15,colors,22,'star'); damageLine(skill,p.x,oy,p.x+dir*340,oy-15,55,1); break;
      case 'purifyWave': for(let i=0;i<4;i++) ringBurst(p.x+dir*(55+i*45),oy,colors,16,38+i*6,'bubble'); damageLine(skill,p.x,oy,p.x+dir*230,oy,80,1); break;
      case 'angelFeather': rainFx(ox+dir*100,oy+20,colors,16,'star',dir); damageBox(skill,ox+dir*100,oy,180,120,1); break;
      case 'divinePillar': for(let i=0;i<4;i++) lineBurst(ox+dir*i*35,oy+55,ox+dir*i*35,oy-155,colors,14,'beam'); damageBox(skill,ox+dir*55,oy,140,150,1); break;
      case 'wispHoming': for(let i=0;i<5;i++) { spiralFx(p.x+dir*(70+i*36),oy+rnd(-30,30),colors,10,25,'orb'); } damageLine(skill,p.x,oy,p.x+dir*370,oy,80,1); break;
      case 'spiritGate': ringBurst(ox,oy,colors,34,75,'rune'); for(let i=0;i<6;i++) lineBurst(ox,oy,ox+dir*rnd(130,240),oy+rnd(-60,60),colors,5,'orb'); damageBox(skill,ox+dir*100,oy,170,110,1); break;
      case 'phantomPack': for(let i=0;i<5;i++) lineBurst(p.x+dir*30,oy-40+i*20,p.x+dir*340,oy-20+i*12,colors,10,'cloud'); damageBox(skill,ox+dir*130,oy,240,110,2); break;
      case 'bulletRain': for(let i=0;i<9;i++) lineBurst(p.x+dir*35,oy-30+i*7,p.x+dir*430,oy-30+i*7,colors,4,'beam'); damageLine(skill,p.x,oy,p.x+dir*430,oy,80,2); break;
      case 'blastShot': lineBurst(p.x+dir*35,oy,p.x+dir*360,oy,colors,18,'beam'); ringBurst(p.x+dir*365,oy,colors,30,65,'flame'); damageBox(skill,p.x+dir*365,oy,95,80,1); break;
      case 'ricochet': lineBurst(p.x+dir*35,oy,p.x+dir*210,oy-55,colors,12,'beam'); lineBurst(p.x+dir*210,oy-55,p.x+dir*400,oy+30,colors,12,'beam'); damageLine(skill,p.x,oy,p.x+dir*420,oy,80,1); break;
      case 'railBuster': lineBurst(p.x+dir*35,oy,p.x+dir*540,oy,colors,50,'beam'); ringBurst(p.x+dir*530,oy,colors,22,55,'spark'); damageLine(skill,p.x,oy,p.x+dir*540,oy,75,1); break;
      case 'pierceLance': lineBurst(p.x+dir*30,oy,p.x+dir*190,oy,colors,26,'beam'); damageLine(skill,p.x,oy,p.x+dir*200,oy,48,1); break;
      case 'spearWall': for(let i=0;i<5;i++) lineBurst(p.x+dir*(55+i*25),oy+45,p.x+dir*(55+i*25),oy-65,colors,8,'beam'); damageBox(skill,ox,oy,120,100,1); break;
      case 'skyThrust': lineBurst(ox,oy+50,ox,oy-125,colors,26,'beam'); ringBurst(ox,oy-100,colors,16,38,'star'); damageBox(skill,ox,oy-35,95,130,1); break;
      case 'dragonPiercer': lineBurst(p.x+dir*30,oy,p.x+dir*350,oy-10,PALETTE.dragon,36,'flame'); damageLine(skill,p.x,oy,p.x+dir*360,oy-10,65,1); break;
      case 'stormJavelin': lineBurst(p.x+dir*35,oy,p.x+dir*430,oy-45,colors,26,'beam'); spiralFx(p.x+dir*280,oy-30,colors,22,60,'cloud'); damageLine(skill,p.x,oy,p.x+dir*440,oy-45,70,1); break;
      case 'droneZap': for(let i=0;i<4;i++) lineBurst(p.x+dir*(40+i*45),oy-50+i*25,p.x+dir*(115+i*55),oy-30+i*20,colors,8,'beam'); damageLine(skill,p.x,oy,p.x+dir*370,oy,80,1); break;
      case 'gearBomb': lineBurst(p.x+dir*35,oy,p.x+dir*260,oy-30,colors,10,'gear'); ringBurst(p.x+dir*280,oy-30,colors,34,70,'gear'); damageBox(skill,p.x+dir*280,oy-30,110,95,1); break;
      case 'magnetMine': ringBurst(ox+dir*80,oy+35,colors,38,88,'gear'); spiralFx(ox+dir*80,oy+35,colors,30,70,'rune'); damageBox(skill,ox+dir*80,oy+35,130,115,1); break;
      case 'laserGrid': for(let i=-2;i<=2;i++) lineBurst(p.x+dir*60,oy+i*28,p.x+dir*430,oy-i*22,colors,16,'beam'); for(let i=0;i<5;i++) lineBurst(p.x+dir*(100+i*65),oy-80,p.x+dir*(100+i*65),oy+80,colors,8,'beam'); damageBox(skill,p.x+dir*250,oy,240,120,1); break;
      case 'echoNote': for(let i=0;i<5;i++) ringBurst(p.x+dir*(70+i*48),oy+Math.sin(i)*20,colors,10,24+i*4,'orb'); damageLine(skill,p.x,oy,p.x+dir*340,oy,85,1); break;
      case 'crescendo': for(let r=35;r<180;r+=30) ringBurst(p.x+dir*r,oy,colors,12,r*.25,'bubble'); damageLine(skill,p.x,oy,p.x+dir*240,oy,100,1); break;
      case 'sonicBoom': lineBurst(p.x+dir*35,oy,p.x+dir*370,oy,colors,20,'cloud'); for(let i=0;i<5;i++) ringBurst(p.x+dir*(90+i*55),oy,colors,10,32,'bubble'); damageLine(skill,p.x,oy,p.x+dir*380,oy,90,1); break;
      case 'finaleStar': rainFx(ox+dir*130,oy+70,colors,18,'star',dir); ringBurst(ox+dir*130,oy,colors,42,95,'star'); damageBox(skill,ox+dir*130,oy,190,145,2); break;
      case 'dragonClaw': for(let i=0;i<3;i++) lineBurst(p.x+dir*30,oy-35+i*28,p.x+dir*155,oy-20+i*15,PALETTE.dragon,14,'slash'); damageBox(skill,ox,oy,120,95,2); break;
      case 'dragonRoar': for(let r=45;r<260;r+=36) ringBurst(p.x+dir*r,oy,PALETTE.dragon,16,r*.18,'flame'); damageLine(skill,p.x,oy,p.x+dir*260,oy,115,1); break;
      case 'flameWing': for(let i=-3;i<=3;i++) lineBurst(p.x+dir*35,oy,p.x+dir*330,oy+i*28,PALETTE.dragon,10,'flame'); damageBox(skill,ox+dir*120,oy,230,130,1); break;
      case 'wyrmCrash': rainFx(ox+dir*130,oy+100,PALETTE.dragon,12,'flame',dir); ringBurst(ox+dir*130,oy+35,PALETTE.dragon,52,105,'flame'); damageBox(skill,ox+dir*130,oy+35,190,150,2); break;
      case 'reaperCut': lineBurst(p.x+dir*25,oy-60,p.x+dir*165,oy+42,PALETTE.dark,30,'slash'); ringBurst(ox,oy,PALETTE.dark,20,50,'cloud'); damageLine(skill,p.x,oy,p.x+dir*175,oy,85,2); break;
      case 'blackMoon': lineBurst(p.x+dir*35,oy,p.x+dir*360,oy-45,PALETTE.dark,34,'slash'); ringBurst(p.x+dir*350,oy-45,PALETTE.dark,24,60,'orb'); damageLine(skill,p.x,oy,p.x+dir*370,oy-45,85,1); break;
      case 'soulChain': for(let i=0;i<8;i++) lineBurst(p.x+dir*(40+i*32),oy+Math.sin(i)*25,p.x+dir*(70+i*32),oy-Math.sin(i)*25,PALETTE.dark,6,'beam'); damageLine(skill,p.x,oy,p.x+dir*300,oy,75,2); break;
      case 'deathBlossom': ringBurst(ox+dir*55,oy,PALETTE.dark,60,95,'star'); spiralFx(ox+dir*55,oy,PALETTE.dark,44,100,'slash'); damageBox(skill,ox+dir*55,oy,155,125,2); break;
      case 'eclipseGate': ringBurst(ox+dir*120,oy,PALETTE.dark,70,125,'rune'); for(let i=0;i<10;i++) lineBurst(ox+dir*120,oy,ox+dir*rnd(20,170),oy+rnd(-90,90),PALETTE.dark,5,'beam'); damageBox(skill,ox+dir*120,oy,210,160,3); break;
      case 'starfall': rainFx(ox+dir*130,oy+90,PALETTE.star,18,'star',dir); damageBox(skill,ox+dir*130,oy+15,220,160,1); break;
      case 'novaRing': ringBurst(ox+dir*70,oy,PALETTE.star,64,120,'star'); damageBox(skill,ox+dir*70,oy,160,125,2); break;
      case 'cometRay': lineBurst(p.x+dir*35,oy,p.x+dir*500,oy-30,PALETTE.star,50,'beam'); ringBurst(p.x+dir*500,oy-30,PALETTE.star,25,65,'star'); damageLine(skill,p.x,oy,p.x+dir*510,oy-30,85,1); break;
      case 'galaxyGate': ringBurst(ox+dir*100,oy,PALETTE.star,72,135,'rune'); rainFx(ox+dir*100,oy+60,PALETTE.star,16,'orb',dir); damageBox(skill,ox+dir*100,oy,220,165,2); break;
      case 'constellationEnd': for(let i=0;i<7;i++) ringBurst(ox+dir*(i*38),oy+Math.sin(i)*45,PALETTE.star,18,36,'star'); for(let i=0;i<6;i++) lineBurst(ox+dir*(i*45),oy+Math.sin(i)*45,ox+dir*((i+1)*45),oy+Math.sin(i+1)*45,PALETTE.star,8,'beam'); damageBox(skill,ox+dir*130,oy,260,160,3); break;
      default: uniqueFallbackPattern(skill, colors, p, dir, ox, oy, FX_INDEX[skill.fx] || 0);
    }
    makeText(skill.name, p.x, p.y - 100, colors[1]);
  };

  // Make visible skill list stable and name-matched for current job.
  getVisibleSkills = function () {
    const job=currentJobId();
    const ids=[...jobSkillIds('beginner'), ...jobSkillIds(job)];
    const seen={};
    return ids.concat(Object.keys(SKILLS)).filter(function(id) { if(seen[id]) return false; seen[id]=true; const sk=SKILLS[id]; return sk && (sk.job==='beginner' || sk.job===job); }).map(function(id) { return SKILLS[id]; });
  };
})();


/* =========================================================
   JOB RARITY COLOR + STRICT NAME-MATCHED UNIQUE SKILL FX PATCH
   - Fixes legacy skills using the same default effect
   - Adds visible job rarity colors: normal gray / rare blue / epic purple / hidden white
   - Forces every skill to use a name/job-matched visual signature
========================================================= */
(function(){
  if (window.__JOB_RARITY_AND_STRICT_SKILL_FX_01__) return;
  window.__JOB_RARITY_AND_STRICT_SKILL_FX_01__ = true;

  const JOB_RARITY = {
    beginner: 'normal', warrior: 'normal', mage: 'normal', rogue: 'normal', archer: 'normal',
    lancer: 'normal', cleric: 'normal', engineer: 'rare', mechanic: 'rare', gunslinger: 'rare', bard: 'rare', summoner: 'rare',
    paladin: 'epic', berserker: 'epic',
    dragon_knight: 'hidden', shadow_reaper: 'hidden', star_sage: 'hidden'
  };
  const RARITY_LABEL = { normal:'일반', rare:'레어', epic:'에픽', hidden:'히든' };
  const RARITY_COLOR = { normal:'#cbd5e1', rare:'#60a5fa', epic:'#c084fc', hidden:'#ffffff' };
  window.PIXEL_RPG_JOB_RARITY = JOB_RARITY;
  window.PIXEL_RPG_JOB_RARITY_COLOR = RARITY_COLOR;

  function arr(v){ return Array.isArray(v) ? v : []; }
  function rnd(a,b){ return a + Math.random() * (b-a); }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function p(){ return game && game.player; }
  function nowJob(){ const pp=p(); return (pp && pp.character && pp.character.job) || 'beginner'; }
  function jobName(id){ return (JOBS && JOBS[id] && JOBS[id].name) || id || '직업'; }
  function rarityOf(job){ return JOB_RARITY[job] || 'normal'; }
  function colorOfJob(job){ return RARITY_COLOR[rarityOf(job)] || '#cbd5e1'; }
  function seedOf(s){ s=String(s||''); let h=0; for(let i=0;i<s.length;i++) h=(h*31+s.charCodeAt(i))>>>0; return h; }

  // Force legacy/beginner skills to have non-identical, name-correct signatures.
  function setSkill(id, data){ if(SKILLS && SKILLS[id]) Object.assign(SKILLS[id], data); }
  setSkill('strike',      { fx:'palm_burst',     visual:'palm_burst',     element:'impact', desc:'주먹에 힘을 모아 가까운 적을 강하게 밀쳐냅니다.', cooldown:2.5, power:1.35, range:80, mp:0 });
  setSkill('quick_slash', { fx:'quick_slash',    visual:'quick_slash',    element:'slash',  desc:'짧고 빠른 검흔으로 전방을 베어냅니다.', cooldown:1.0, power:1.18, range:90, mp:10 });
  setSkill('first_aid',   { fx:'breathing_aura', visual:'breathing_aura', element:'heal',   desc:'숨을 고르며 초록빛 기운으로 HP를 회복합니다.', cooldown:3.0, heal:45, power:0, range:0, mp:6 });
  setSkill('stone_throw', { fx:'gray_stone_arc', visual:'gray_stone_arc', element:'stone',  desc:'회색 돌을 포물선으로 던져 공격합니다.', cooldown:2.5, power:1.25, range:330, mp:3, projectile:true });

  // Dragon Knight visible skills: all different and aligned with names.
  setSkill('dragon_claw',   { fx:'dragon_claw_rake', visual:'dragon_claw_rake', element:'dragon', desc:'용의 발톱 형상으로 전방을 세 번 찢습니다.' });
  setSkill('dragon_roar',   { fx:'dragon_roar_wave', visual:'dragon_roar_wave', element:'dragon', desc:'용의 포효 파동이 전방으로 퍼집니다.' });
  setSkill('flame_wing',    { fx:'flame_wing_fan',   visual:'flame_wing_fan',   element:'fire',   desc:'불꽃 날개가 좌우로 펼쳐지며 적을 태웁니다.' });
  setSkill('ancient_scale', { fx:'ancient_scale_barrier', visual:'ancient_scale_barrier', element:'buff', desc:'고룡의 비늘이 몸을 감싸 방어 기운을 두릅니다.' });
  setSkill('wyrm_crash',    { fx:'wyrm_crash_dive',  visual:'wyrm_crash_dive',  element:'dragon', desc:'비룡 형상의 화염이 위에서 추락합니다.' });

  const OLD_DRAW_HUD = typeof drawHUD === 'function' ? drawHUD : null;
  drawHUD = function(){
    const pp = p();
    if(!pp || !pp.character || !OLD_DRAW_HUD) { if(OLD_DRAW_HUD) OLD_DRAW_HUD.apply(this, arguments); return; }
    OLD_DRAW_HUD.apply(this, arguments);
    const job = pp.character.job || 'beginner';
    const rare = rarityOf(job);
    const x = 92, y = 58;
    // repaint job label area with rarity color, leaving original HUD intact
    ctx.save();
    ctx.fillStyle = 'rgba(17,24,39,0.92)';
    ctx.fillRect(88, 40, 170, 28);
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = colorOfJob(job);
    ctx.fillText(jobName(job), x, y);
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = colorOfJob(job);
    ctx.fillText('[' + RARITY_LABEL[rare] + ']', x + ctx.measureText(jobName(job)).width + 8, y);
    ctx.restore();
  };

  function addFx(x,y,vx,vy,life,color,size,shape){
    if(!game.particles) game.particles=[];
    game.particles.push({x,y,vx: vx||0, vy: vy||0, life: life||0.45, color: color||'#fff', size: size||4, shape: shape||'spark', alpha:1});
  }
  function text(msg,x,y,color){ if(typeof makeText==='function') makeText(msg,x,y,color||'#fff'); }
  function hitArea(skill,cx,cy,w,h,hits){
    let count=0;
    arr(game.monsters).forEach(function(m){
      if(!m || m.dead) return;
      if(Math.abs((m.x||0)-cx) <= w/2 && Math.abs(((m.y||0)-48)-cy) <= h/2){
        m.aggro=true; m.hasBeenHit=true;
        for(let i=0;i<(hits||1);i++) if(typeof damageMonster==='function') damageMonster(m, skill);
        count++;
      }
    });
    return count;
  }
  function hitLine(skill,x1,y1,x2,y2,thick,hits){
    const steps = Math.max(8, Math.ceil(Math.abs(x2-x1)/30)); let count=0;
    arr(game.monsters).forEach(function(m){
      if(!m || m.dead) return;
      let hit=false;
      for(let i=0;i<=steps;i++){
        const t=i/steps, x=x1+(x2-x1)*t, y=y1+(y2-y1)*t;
        if(Math.abs((m.x||0)-x)<(thick||55) && Math.abs(((m.y||0)-48)-y)<(thick||55)){ hit=true; break; }
      }
      if(hit){ m.aggro=true; m.hasBeenHit=true; for(let k=0;k<(hits||1);k++) if(typeof damageMonster==='function') damageMonster(m, skill); count++; }
    });
    return count;
  }
  function burst(cx,cy,pal,n,rad,shape){
    for(let i=0;i<n;i++){ const a=Math.PI*2*i/n + rnd(-.08,.08), r=rnd(rad*.25,rad); addFx(cx+Math.cos(a)*r*.25, cy+Math.sin(a)*r*.18, Math.cos(a)*rnd(80,240), Math.sin(a)*rnd(45,160), rnd(.35,.9), pal[i%pal.length], rnd(3,8), shape); }
  }
  function slashArc(cx,cy,dir,pal,n,span,rad,tilt){
    for(let i=0;i<n;i++){ const t=i/(n-1||1); const a=(-span/2 + span*t) + (tilt||0); const x=cx + dir*Math.cos(a)*rad; const y=cy + Math.sin(a)*rad*.55; addFx(x,y,dir*rnd(60,180),rnd(-40,40),rnd(.22,.55),pal[i%pal.length],rnd(4,10),'slash'); }
  }
  function lineFx(x1,y1,x2,y2,pal,n,shape){
    for(let i=0;i<n;i++){ const t=i/(n-1||1); addFx(x1+(x2-x1)*t+rnd(-5,5), y1+(y2-y1)*t+rnd(-5,5), rnd(-25,25), rnd(-35,35), rnd(.22,.55), pal[i%pal.length], rnd(3,8), shape); }
  }
  function rain(cx,cy,pal,n,shape,dir){
    for(let i=0;i<n;i++){ const x=cx+rnd(-110,110), y=cy-rnd(150,280); addFx(x,y,dir*rnd(-80,40),rnd(300,520),rnd(.55,1.05),pal[i%pal.length],rnd(5,12),shape); }
  }
  function ring(cx,cy,pal,n,rad,shape){
    for(let i=0;i<n;i++){ const a=Math.PI*2*i/n; addFx(cx+Math.cos(a)*rad,cy+Math.sin(a)*rad*.62,-Math.cos(a)*70,-Math.sin(a)*40,rnd(.4,.9),pal[i%pal.length],rnd(3,8),shape); }
  }

  function palette(skill){
    const e = String(skill.element || skill.visual || skill.fx || '').toLowerCase();
    if(e.includes('dragon')) return ['#ff3b1f','#ff8a00','#ffd166','#7c2d12'];
    if(e.includes('fire')) return ['#ff6b35','#ffb703','#fff3b0','#dc2626'];
    if(e.includes('shadow')||e.includes('dark')) return ['#111827','#7e22ce','#c084fc','#f0abfc'];
    if(e.includes('star')||e.includes('comet')) return ['#fff7ad','#facc15','#93c5fd','#ffffff'];
    if(e.includes('holy')) return ['#ffffff','#fde68a','#60a5fa','#fef3c7'];
    if(e.includes('ice')) return ['#bae6fd','#38bdf8','#ffffff','#0ea5e9'];
    if(e.includes('lightning')) return ['#fef08a','#ffffff','#a7f3d0','#fde047'];
    if(e.includes('heal')) return ['#86efac','#bbf7d0','#ffffff','#22c55e'];
    if(e.includes('stone')) return ['#9ca3af','#6b7280','#d1d5db','#4b5563'];
    if(e.includes('slash')) return ['#ffe066','#ffffff','#f59e0b','#fef3c7'];
    return ['#f97316','#ffffff','#facc15','#fed7aa'];
  }

  function exactPattern(skill){
    const id = skill.id || '', name = skill.name || '', fx = skill.fx || skill.visual || '';
    if(id==='strike' || name==='강타') return 'palm_burst';
    if(id==='first_aid' || name==='숨고르기') return 'breathing_aura';
    if(id==='quick_slash' || name==='빠른 베기') return 'quick_slash';
    if(id==='stone_throw' || name==='돌던지기') return 'gray_stone_arc';
    if(id==='dragon_claw' || name.includes('용조격')) return 'dragon_claw_rake';
    if(id==='dragon_roar' || name.includes('용의 포효')) return 'dragon_roar_wave';
    if(id==='flame_wing' || name.includes('화염 날개')) return 'flame_wing_fan';
    if(id==='ancient_scale' || name.includes('고룡의 비늘')) return 'ancient_scale_barrier';
    if(id==='wyrm_crash' || name.includes('비룡 추락')) return 'wyrm_crash_dive';
    return fx || 'unique_' + (seedOf(id+name)%97);
  }

  function castStrictNameEffect(skill){
    const pp=p(); if(!pp||!skill) return;
    const dir=pp.face||1, ox=pp.x+dir*70, oy=pp.y-58, pal=palette(skill), pat=exactPattern(skill), seed=seedOf((skill.id||'')+(skill.name||''));
    pp.attackTime=.42; pp.anim='attack'; pp.animTime=0;
    switch(pat){
      case 'palm_burst':
        burst(ox,oy,pal,22,46,'spark');
        ring(ox,oy,pal,18,38,'impact');
        lineFx(pp.x+dir*22,oy,pp.x+dir*95,oy,pal,12,'impact');
        hitArea(skill,ox,oy,95,75,1);
        break;
      case 'breathing_aura':
        pp.hp = Math.min(pp.maxHp, pp.hp + (skill.heal || 45));
        ring(pp.x,pp.y-58,pal,38,48,'leaf');
        for(let i=0;i<22;i++) addFx(pp.x+rnd(-22,22),pp.y-32+rnd(-25,10),rnd(-12,12),rnd(-110,-40),rnd(.5,1.0),pal[i%pal.length],rnd(3,7),'leaf');
        text('+'+(skill.heal||45)+' HP', pp.x, pp.y-95, '#86efac');
        break;
      case 'quick_slash':
        slashArc(pp.x+dir*65,oy,dir,pal,22,1.0,64,-0.15);
        slashArc(pp.x+dir*78,oy+12,dir,['#ffffff','#ffd166','#f97316'],13,.65,46,0.22);
        hitLine(skill,pp.x+dir*20,oy,pp.x+dir*135,oy+6,42,1);
        break;
      case 'gray_stone_arc':
        for(let i=0;i<18;i++){ const t=i/17, x=pp.x+dir*(35+t*250), y=oy-20-Math.sin(t*Math.PI)*78; addFx(x,y,dir*rnd(110,220),rnd(-50,90),rnd(.28,.7),pal[i%pal.length],rnd(4,9),'stone'); }
        burst(pp.x+dir*300,oy-12,pal,22,42,'stone'); hitArea(skill,pp.x+dir*300,oy-12,80,70,1);
        break;
      case 'dragon_claw_rake':
        for(let k=0;k<3;k++){ slashArc(pp.x+dir*(72+k*15),oy-22+k*22,dir,pal,18,.82,78, -0.45+k*.16); }
        hitArea(skill,pp.x+dir*105,oy,150,105,2);
        break;
      case 'dragon_roar_wave':
        for(let r=45;r<285;r+=34){ ring(pp.x+dir*r,oy,pal,18,r*.16,'flame'); lineFx(pp.x+dir*(r-18),oy-r*.05,pp.x+dir*(r+18),oy+r*.05,pal,8,'wave'); }
        hitLine(skill,pp.x+dir*35,oy,pp.x+dir*300,oy,105,1);
        break;
      case 'flame_wing_fan':
        for(let row=-3; row<=3; row++){ lineFx(pp.x+dir*42,oy,pp.x+dir*330,oy+row*28,pal,16,'flame'); }
        for(let i=0;i<28;i++){ const a=-1.1 + i*(2.2/27); addFx(pp.x+dir*(55+Math.cos(a)*135), oy+Math.sin(a)*80, dir*rnd(80,180), rnd(-70,70), rnd(.35,.8), pal[i%pal.length], rnd(6,13), 'flame'); }
        hitArea(skill,pp.x+dir*185,oy,270,150,1);
        break;
      case 'ancient_scale_barrier':
        ring(pp.x,pp.y-60,pal,46,62,'scale'); ring(pp.x,pp.y-60,['#ffffff','#fdba74','#ffedd5'],24,36,'scale');
        for(let i=0;i<18;i++){ addFx(pp.x+rnd(-35,35),pp.y-60+rnd(-45,35),rnd(-20,20),rnd(-60,10),rnd(.45,1),pal[i%pal.length],rnd(4,9),'scale'); }
        text('고룡의 비늘!',pp.x,pp.y-110,'#fdba74');
        break;
      case 'wyrm_crash_dive':
        rain(pp.x+dir*150,oy+70,pal,20,'flame',dir);
        lineFx(pp.x+dir*65,oy-170,pp.x+dir*185,oy+30,pal,38,'dragon');
        burst(pp.x+dir*170,oy+35,pal,58,115,'flame'); hitArea(skill,pp.x+dir*170,oy+35,220,160,2);
        break;
      default:
        // Still unique: the same category uses different arc/ring/rain quantities and offsets by skill seed.
        const mode = seed % 12;
        if(/베기|절단|참|slash|cut/i.test((skill.name||'')+pat)) { slashArc(pp.x+dir*(62+seed%28),oy+(seed%17-8),dir,pal,16+(seed%10),.65+(seed%5)*.12,54+(seed%42),((seed%7)-3)*.09); hitLine(skill,pp.x+dir*20,oy,pp.x+dir*(120+seed%120),oy+(seed%45-22),45+(seed%25),1); }
        else if(/비|추락|meteor|rain|별똥/i.test((skill.name||'')+pat)) { rain(pp.x+dir*(115+seed%80),oy+60,pal,10+(seed%13),'star',dir); hitArea(skill,pp.x+dir*(125+seed%80),oy+25,150+(seed%80),130,1); }
        else if(/포효|파동|wave|sonic/i.test((skill.name||'')+pat)) { for(let r=40;r<220+(seed%90);r+=30) ring(pp.x+dir*r,oy,pal,12+(seed%7),r*.18,'wave'); hitLine(skill,pp.x,oy,pp.x+dir*(230+seed%110),oy,80,1); }
        else if(/화염|불|fire|flame|용/i.test((skill.name||'')+pat)) { for(let i=0;i<4+(seed%5);i++){ const x=pp.x+dir*(70+i*45); burst(x,pp.y-38,pal,16,48,'flame'); hitArea(skill,x,pp.y-55,65,110,1); } }
        else if(/별|star|nova|galaxy|성좌/i.test((skill.name||'')+pat)) { ring(ox+dir*(seed%100),oy,pal,34+(seed%20),64+(seed%40),'star'); hitArea(skill,ox+dir*(seed%100),oy,150,130,1); }
        else if(/그림자|사신|dark|shadow|검은/i.test((skill.name||'')+pat)) { lineFx(pp.x-dir*25,oy,pp.x+dir*(175+seed%130),oy+(seed%55-25),pal,28,'shadow'); burst(pp.x+dir*(140+seed%80),oy,pal,24,55,'cloud'); hitLine(skill,pp.x,oy,pp.x+dir*(230+seed%130),oy,70,2); }
        else if(/탄|총|bullet|shot|laser|레이저/i.test((skill.name||'')+pat)) { for(let i=0;i<3+(seed%7);i++) lineFx(pp.x+dir*35,oy-28+i*10,pp.x+dir*(320+seed%180),oy-28+i*10+rnd(-8,8),pal,8,'beam'); hitLine(skill,pp.x,oy,pp.x+dir*(380+seed%160),oy,50,1); }
        else if(/회복|숨|heal|song/i.test((skill.name||'')+pat)) { pp.hp=Math.min(pp.maxHp,pp.hp+(skill.heal||35)); ring(pp.x,pp.y-60,pal,36,52+(seed%28),'leaf'); }
        else { ring(ox,oy,pal,22+(seed%18),45+(seed%40), mode%2?'rune':'spark'); hitArea(skill,ox,oy,110+(seed%80),90+(seed%70),1); }
    }
    text(skill.name, pp.x, pp.y-108, pal[1] || pal[0]);
  }

  const OLD_USE = typeof useSkill === 'function' ? useSkill : null;
  useSkill = function(id){
    const skill = SKILLS && SKILLS[id]; const pp=p();
    if(!skill || !pp) return;
    if(!skills.unlocked.includes(id)){ text('아직 배운 스킬이 아닙니다.', pp.x, pp.y-90, '#ff8787'); return; }
    if((skills.cooldowns[id]||0)>0){ text('쿨타임 중', pp.x, pp.y-90, '#cbd5e1'); return; }
    if(pp.mp < (skill.mp||0)){ text('MP 부족', pp.x, pp.y-90, '#74c0fc'); return; }
    pp.mp -= skill.mp || 0;
    skills.cooldowns[id] = skill.cooldown || 1.2;
    castStrictNameEffect(skill);
    if(typeof markAutoSaveSoon==='function') markAutoSaveSoon();
  };

  // Repaint skill panel job name with rarity info while keeping existing scroll patch.
  const OLD_DRAW_SKILLS = typeof drawSkillsPanel === 'function' ? drawSkillsPanel : null;
  drawSkillsPanel = function(){
    if(OLD_DRAW_SKILLS) OLD_DRAW_SKILLS.apply(this, arguments);
    const job=nowJob(), rare=rarityOf(job);
    ctx.save();
    ctx.textAlign='left';
    ctx.font='bold 15px sans-serif';
    ctx.fillStyle=colorOfJob(job);
    ctx.fillText('현재 직업: ['+RARITY_LABEL[rare]+'] '+jobName(job), 260, 150);
    ctx.restore();
  };
})();


/* =========================================================
   HUD JOB LABEL / JOB RARITY QUEST DIFFICULTY PATCH
   - Moves job rarity text so it no longer covers MP bar
   - Adds rarity-based job quest difficulty and guidance
   - Moves rare/epic/hidden job NPCs to harder-to-find spots
========================================================= */

(function(){
  const JOB_RARITY_PATCH = {
    beginner: 'normal', warrior: 'normal', mage: 'normal', rogue: 'normal', archer: 'normal',
    lancer: 'normal', gunslinger: 'rare', paladin: 'rare', berserker: 'rare', cleric: 'rare',
    summoner: 'epic', engineer: 'epic', mechanic: 'epic', bard: 'epic',
    dragon_knight: 'hidden', shadow_reaper: 'hidden', star_sage: 'hidden'
  };
  const RARITY_LABEL_PATCH = { normal:'일반', rare:'레어', epic:'에픽', hidden:'히든' };
  const RARITY_COLOR_PATCH = { normal:'#9ca3af', rare:'#60a5fa', epic:'#c084fc', hidden:'#ffffff' };
  const RARITY_REQ_PATCH = {
    normal: { level: 10, kills: 10, text:'기본 전직 시험' },
    rare: { level: 18, kills: 24, text:'숙련자 전직 시험' },
    epic: { level: 28, kills: 45, text:'상급 전직 시험' },
    hidden: { level: 38, kills: 80, text:'숨겨진 전설 시험' }
  };

  function safeJobId() {
    return (game && game.player && game.player.character && game.player.character.job) || 'beginner';
  }
  function jobName(id) {
    return (typeof JOBS !== 'undefined' && JOBS && JOBS[id] && JOBS[id].name) || id || '직업';
  }
  function jobRarity(id) {
    if (typeof JOBS !== 'undefined' && JOBS && JOBS[id] && JOBS[id].rarity) return JOBS[id].rarity;
    return JOB_RARITY_PATCH[id] || 'normal';
  }
  function jobRarityLabel(id) { return RARITY_LABEL_PATCH[jobRarity(id)] || '일반'; }
  function jobRarityColor(id) { return RARITY_COLOR_PATCH[jobRarity(id)] || '#9ca3af'; }
  window.__pixelJobRarity = jobRarity;
  window.__pixelJobRarityLabel = jobRarityLabel;
  window.__pixelJobRarityColor = jobRarityColor;

  if (typeof JOBS !== 'undefined' && JOBS) {
    Object.keys(JOBS).forEach(function(id){ if (!JOBS[id].rarity) JOBS[id].rarity = jobRarity(id); });
  }

  function drawJobBadge(x, y, jobId, compact) {
    const rarity = jobRarity(jobId);
    const color = jobRarityColor(jobId);
    const label = '[' + jobRarityLabel(jobId) + '] ' + jobName(jobId);
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = compact ? 'bold 11px sans-serif' : 'bold 13px sans-serif';
    const w = Math.min(compact ? 138 : 170, Math.max(compact ? 84 : 104, ctx.measureText(label).width + 18));
    ctx.fillStyle = 'rgba(15,23,42,0.72)';
    if (typeof roundRect === 'function') roundRect(ctx, x, y - 15, w, compact ? 19 : 22, 8);
    else ctx.fillRect(x, y - 15, w, compact ? 19 : 22);
    ctx.strokeStyle = color;
    ctx.globalAlpha = rarity === 'hidden' ? 0.95 : 0.72;
    ctx.strokeRect(x, y - 15, w, compact ? 19 : 22);
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.fillText(label.length > (compact ? 11 : 15) ? label.slice(0, compact ? 11 : 15) + '…' : label, x + 9, y);
    ctx.restore();
  }

  // HUD override: job badge is placed below name and away from MP bar.
  const oldDrawHUDRarity = typeof drawHUD === 'function' ? drawHUD : null;
  drawHUD = function() {
    const p = game.player;
    const jobId = safeJobId();

    ctx.fillStyle = 'rgba(17,24,39,0.92)';
    if (typeof roundRect === 'function') roundRect(ctx, 12, 10, 620, 88, 12); else ctx.fillRect(12,10,620,88);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('LV. ' + p.level, 28, 34);
    ctx.fillText(p.character.name || '초보자', 92, 34);
    drawJobBadge(92, 62, jobId, false);

    drawBar(282, 20, 150, 14, p.hp / p.maxHp, '#ff4d4f', 'HP ' + Math.floor(p.hp) + '/' + p.maxHp);
    drawBar(282, 45, 150, 14, p.mp / p.maxMp, '#4dabf7', 'MP ' + Math.floor(p.mp) + '/' + p.maxMp);
    drawBar(446, 20, 170, 14, p.exp / p.nextExp, '#ffd43b', 'EXP ' + Math.floor(p.exp) + '/' + p.nextExp);

    ctx.fillStyle = 'rgba(17,24,39,0.82)';
    if (typeof roundRect === 'function') roundRect(ctx, 12, 104, 840, 36, 10); else ctx.fillRect(12,104,840,36);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('A/D 이동 · Space 점프 · J 공격 · K/L/; 스킬 · E 대화/포탈 · Z 줍기 · M 인벤 · C 스탯 · U 스킬 · Q 퀘스트', 28, 127);

    ctx.fillStyle = 'rgba(17,24,39,0.78)';
    if (typeof roundRect === 'function') roundRect(ctx, 12, 143, 660, 26, 8); else ctx.fillRect(12,143,660,26);
    ctx.fillStyle = '#e5e7eb';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('R 저장 · S/↓ 윗층에서 아래층 내려가기 · 사다리에서는 W/S 또는 ↑/↓', 28, 161);

    if (typeof drawMiniMap === 'function') drawMiniMap();
    if (typeof drawGold === 'function') drawGold();
    if (typeof drawQuickSlots === 'function') drawQuickSlots();
    if (typeof drawSkillHotbar === 'function') drawSkillHotbar();
    if (typeof drawQuestTracker === 'function') drawQuestTracker();
  };

  // Put rarity label in skill panel/job text too when possible.
  const oldDrawSkillPanelRarity = typeof drawSkillPanel === 'function' ? drawSkillPanel : null;
  if (oldDrawSkillPanelRarity) {
    drawSkillPanel = function() {
      oldDrawSkillPanelRarity.apply(this, arguments);
      if (!skillPanel || !skillPanel.open) return;
      const jobId = safeJobId();
      drawJobBadge(500, 82, jobId, false);
    };
  }

  function ensureJobQuestDifficulty() {
    if (typeof QUESTS === 'undefined' || !QUESTS) return;
    Object.keys(QUESTS).forEach(function(id){
      const q = QUESTS[id];
      if (!q || !q.jobReward) return;
      const r = jobRarity(q.jobReward);
      const req = RARITY_REQ_PATCH[r] || RARITY_REQ_PATCH.normal;
      q.rarity = r;
      q.requiredLevel = Math.max(q.requiredLevel || 0, req.level);
      q.title = q.title && q.title.indexOf('[') === 0 ? q.title : '[' + jobRarityLabel(q.jobReward) + '] ' + (q.title || jobName(q.jobReward) + ' 전직');
      q.desc = (q.desc || '') + '\n난이도: ' + jobRarityLabel(q.jobReward) + ' · 권장 레벨 ' + req.level + ' 이상';
      if (!Array.isArray(q.goals)) q.goals = [];
      const hasKill = q.goals.some(function(g){ return g.type === 'kill'; });
      if (!hasKill) q.goals.push({ type:'kill', family:'any', count:0, need:req.kills });
      else q.goals.forEach(function(g){ if (g.type === 'kill') g.need = Math.max(g.need || 0, req.kills); });
      if (r === 'epic' || r === 'hidden') {
        const itemNeed = r === 'hidden' ? 3 : 1;
        const already = q.goals.some(function(g){ return g.type === 'item' && String(g.itemId||'').indexOf('job_token') >= 0; });
        if (!already) q.goals.push({ type:'item', itemId:'job_token_' + q.jobReward, count:0, need:itemNeed });
      }
    });
  }
  ensureJobQuestDifficulty();

  // Add virtual token items so harder quests can ask for proof without breaking inventory rendering.
  if (typeof ITEMS !== 'undefined' && ITEMS) {
    Object.keys(JOB_RARITY_PATCH).forEach(function(job){
      const id = 'job_token_' + job;
      if (!ITEMS[id]) ITEMS[id] = { id:id, name:jobName(job) + ' 전직 증표', type:'etc', rarity:jobRarity(job), price:1500, desc:'상급 전직 시험에 필요한 증표입니다.' };
    });
  }

  const oldAcceptOrCompleteQuestRarity = typeof acceptOrCompleteQuest === 'function' ? acceptOrCompleteQuest : null;
  acceptOrCompleteQuest = function(id) {
    ensureJobQuestDifficulty();
    const q = typeof QUESTS !== 'undefined' && QUESTS ? QUESTS[id] : null;
    if (q && q.jobReward) {
      const r = jobRarity(q.jobReward);
      const req = RARITY_REQ_PATCH[r] || RARITY_REQ_PATCH.normal;
      if (game.player.level < req.level) {
        makeText(jobRarityLabel(q.jobReward) + ' 직업은 Lv.' + req.level + ' 이상부터 도전할 수 있습니다.', game.player.x, game.player.y - 95, '#ff8787');
        return;
      }
      if (r === 'hidden' && typeof window.__hiddenJobOwnerCache !== 'undefined' && window.__hiddenJobOwnerCache && window.__hiddenJobOwnerCache[q.jobReward]) {
        makeText('이미 전직한 자가 있는 직업입니다.', game.player.x, game.player.y - 95, '#ffffff');
        return;
      }
    }
    if (oldAcceptOrCompleteQuestRarity) return oldAcceptOrCompleteQuestRarity.apply(this, arguments);
  };

  function floorForNpcRarity(x, fallbackY) {
    let best = null;
    const ground = game.ground || fallbackY || 560;
    (game.platforms || []).forEach(function(pf){
      if (x >= pf.x - 30 && x <= pf.x + pf.w + 30) {
        if (best === null || pf.y < best) best = pf.y;
      }
    });
    return best !== null ? best : ground;
  }

  function rearrangeJobNpcDifficulty() {
    if (!game || !Array.isArray(game.npcs) || !game.player) return;
    const worldW = game.width || 4200;
    const platforms = game.platforms || [];
    game.npcs.forEach(function(npc, i){
      if (!npc || !(npc.type === 'job' || npc.hiddenJob || npc.type === 'hidden_job' || npc.type === 'skill_teacher')) return;
      let reward = npc.jobReward || npc.job || npc.lookJob || (typeof QUESTS !== 'undefined' && QUESTS[npc.quest] && QUESTS[npc.quest].jobReward) || 'beginner';
      const r = jobRarity(reward);
      if (npc.__rarityPlaced) return;
      if (r === 'normal') {
        npc.x = Math.max(260, Math.min(worldW - 260, npc.x || 650 + i * 120));
      } else if (r === 'rare') {
        npc.x = Math.max(900, Math.min(worldW - 420, (worldW * 0.48) + i * 95));
      } else if (r === 'epic') {
        npc.x = Math.max(1200, Math.min(worldW - 300, worldW * 0.70 + i * 70));
      } else if (r === 'hidden') {
        npc.x = Math.max(1700, Math.min(worldW - 180, worldW - 420 - i * 85));
      }
      npc.y = floorForNpcRarity(npc.x, npc.y);
      npc.__rarityPlaced = true;
      npc.difficultyLabel = jobRarityLabel(reward);
    });
  }

  const oldLoadTownRarity = typeof loadTown === 'function' ? loadTown : null;
  if (oldLoadTownRarity) {
    loadTown = function() {
      const result = oldLoadTownRarity.apply(this, arguments);
      setTimeout(rearrangeJobNpcDifficulty, 0);
      rearrangeJobNpcDifficulty();
      return result;
    };
  }

  const oldDrawNPCsRarity = typeof drawNPCs === 'function' ? drawNPCs : null;
  drawNPCs = function() {
    rearrangeJobNpcDifficulty();
    if (oldDrawNPCsRarity) oldDrawNPCsRarity.apply(this, arguments);
    if (!game || !Array.isArray(game.npcs)) return;
    game.npcs.forEach(function(npc){
      if (!npc || !npc.difficultyLabel) return;
      const color = RARITY_COLOR_PATCH[String(npc.difficultyLabel).includes('히든') ? 'hidden' : String(npc.difficultyLabel).includes('에픽') ? 'epic' : String(npc.difficultyLabel).includes('레어') ? 'rare' : 'normal'];
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = color;
      ctx.fillText('[' + npc.difficultyLabel + ']', npc.x, npc.y - 124);
      ctx.restore();
    });
  };

  // Better dialog text for job difficulty.
  const oldDrawDialogRarity = typeof drawDialog === 'function' ? drawDialog : null;
  if (oldDrawDialogRarity) {
    drawDialog = function() {
      oldDrawDialogRarity.apply(this, arguments);
      if (!game.dialog || !game.dialog.npc) return;
      const npc = game.dialog.npc;
      const q = npc.quest && typeof QUESTS !== 'undefined' && QUESTS[npc.quest];
      if (!q || !q.jobReward) return;
      const r = jobRarity(q.jobReward);
      const req = RARITY_REQ_PATCH[r] || RARITY_REQ_PATCH.normal;
      ctx.save();
      ctx.textAlign = 'left';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = jobRarityColor(q.jobReward);
      ctx.fillText('직업 등급: ' + jobRarityLabel(q.jobReward) + ' · 필요 Lv.' + req.level + ' · ' + req.text, 215, 594);
      ctx.restore();
    };
  }
})();

/* =========================================================
   ITEM RARITY / MERCHANT SELL / NAMED MONSTER GIMMICK PATCH
   - potion shop tiers
   - inventory selling at merchant
   - item rarity + better fantasy item icons
   - monster gimmicks by family and named monsters with 5 min respawn
========================================================= */

(function () {
  const RARITY_INFO = {
    common: { label: '일반', color: '#cbd5e1', rate: 1 },
    rare: { label: '희귀', color: '#60a5fa', rate: 0.35 },
    ultra: { label: '초희귀', color: '#22d3ee', rate: 0.12 },
    epic: { label: '에픽', color: '#c084fc', rate: 0.035 },
    legendary: { label: '레전더리', color: '#facc15', rate: 0.009 }
  };
  window.ITEM_RARITY_INFO = RARITY_INFO;

  function defineItem(id, data) {
    if (!ITEMS[id]) ITEMS[id] = Object.assign({ id }, data);
    else Object.assign(ITEMS[id], data);
  }

  defineItem('hp_potion_small', { name: '초급 회복 물약', type: 'consumable', heal: 80, price: 50, sell: 12, desc: 'HP를 조금 회복합니다.', icon: 'potion_hp_small', rarity: 'common' });
  defineItem('hp_potion_mid', { name: '중급 회복 물약', type: 'consumable', heal: 260, price: 180, sell: 45, desc: 'HP를 적당히 회복합니다.', icon: 'potion_hp_mid', rarity: 'rare' });
  defineItem('hp_potion_high', { name: '상급 회복 물약', type: 'consumable', heal: 720, price: 650, sell: 160, desc: 'HP를 크게 회복합니다.', icon: 'potion_hp_high', rarity: 'ultra' });
  defineItem('mp_potion_small', { name: '초급 마나 물약', type: 'consumable', mana: 50, price: 60, sell: 15, desc: 'MP를 조금 회복합니다.', icon: 'potion_mp_small', rarity: 'common' });
  defineItem('mp_potion_mid', { name: '중급 마나 물약', type: 'consumable', mana: 160, price: 220, sell: 55, desc: 'MP를 적당히 회복합니다.', icon: 'potion_mp_mid', rarity: 'rare' });
  defineItem('mp_potion_high', { name: '상급 마나 물약', type: 'consumable', mana: 430, price: 760, sell: 190, desc: 'MP를 크게 회복합니다.', icon: 'potion_mp_high', rarity: 'ultra' });

  if (ITEMS.hp_potion) Object.assign(ITEMS.hp_potion, { name: '초급 회복 물약', icon: 'potion_hp_small', rarity: 'common', heal: ITEMS.hp_potion.heal || 80, price: ITEMS.hp_potion.price || 50, sell: 12 });
  if (ITEMS.mp_potion) Object.assign(ITEMS.mp_potion, { name: '초급 마나 물약', icon: 'potion_mp_small', rarity: 'common', mana: ITEMS.mp_potion.mana || 50, price: ITEMS.mp_potion.price || 60, sell: 15 });

  const MERCHANT_POTION_IDS = ['hp_potion', 'hp_potion_mid', 'hp_potion_high', 'mp_potion', 'mp_potion_mid', 'mp_potion_high'];
  window.MERCHANT_POTION_IDS = MERCHANT_POTION_IDS;

  function inferItemRarity(id, item) {
    if (!item) return 'common';
    if (item.rarity) return item.rarity;
    const req = item.reqLevel || 1;
    const plusName = String(item.name || id || '').toLowerCase();
    if (plusName.includes('legend') || plusName.includes('레전') || req >= 80) return 'legendary';
    if (plusName.includes('dragon') || plusName.includes('용') || plusName.includes('별') || req >= 55) return 'epic';
    if (plusName.includes('crystal') || plusName.includes('수정') || req >= 35) return 'ultra';
    if (req >= 12 || getEquipSlotForItem(item)) return 'rare';
    return 'common';
  }

  Object.keys(ITEMS).forEach(function (id) {
    const item = ITEMS[id];
    if (!item) return;
    item.rarity = inferItemRarity(id, item);
    if (item.type === 'etc' && !item.sell) item.sell = Math.max(3, Math.floor((item.price || 20) * 0.25));
    if (getEquipSlotForItem(item)) {
      const rarity = item.rarity;
      const mul = { common: 1, rare: 1.22, ultra: 1.48, epic: 1.9, legendary: 2.7 }[rarity] || 1;
      if (item.atk) item.atk = Math.max(item.atk, Math.round(item.atk * mul));
      if (item.matk) item.matk = Math.max(item.matk, Math.round(item.matk * mul));
      if (item.def) item.def = Math.max(item.def, Math.round(item.def * (1 + (mul - 1) * 0.45)));
      item.sell = item.sell || Math.max(10, Math.floor((item.price || (item.reqLevel || 1) * 90) * 0.35));
      item.price = item.price || Math.max(80, (item.reqLevel || 1) * 120);
    }
  });

  window.getItemRarity = function getItemRarity(idOrItem) {
    const item = typeof idOrItem === 'string' ? ITEMS[idOrItem] : idOrItem;
    return inferItemRarity(item && item.id, item);
  };
  window.getItemRarityColor = function getItemRarityColor(idOrItem) {
    return (RARITY_INFO[getItemRarity(idOrItem)] || RARITY_INFO.common).color;
  };
  window.getItemRarityLabel = function getItemRarityLabel(idOrItem) {
    return (RARITY_INFO[getItemRarity(idOrItem)] || RARITY_INFO.common).label;
  };

  function itemSellPrice(stack) {
    const item = ITEMS[itemRefId(stack) || stack.id];
    if (!item) return 0;
    const rarityMul = { common: 1, rare: 1.35, ultra: 1.75, epic: 2.5, legendary: 4 }[getItemRarity(item)] || 1;
    const plusMul = 1 + (itemEnhance(stack) || 0) * 0.15;
    return Math.max(1, Math.floor((item.sell || Math.floor((item.price || 10) * 0.35) || 1) * rarityMul * plusMul));
  }

  window.sellInventoryIndex = function sellInventoryIndex(index) {
    const st = inventory.items[index];
    if (!st) return false;
    const item = ITEMS[st.id];
    if (!item) return false;
    const slot = getEquipSlotForItem(item);
    if (!slot && item.type !== 'etc' && item.type !== 'material') {
      makeText('상인에게 팔 수 없는 아이템입니다.', game.player.x, game.player.y - 95, '#ff8787');
      return true;
    }
    const count = slot ? 1 : Math.max(1, st.count || 1);
    const gain = itemSellPrice(st) * count;
    wallet.gold += gain;
    if (slot && st.count > 1) st.count -= 1;
    else inventory.items.splice(index, 1);
    makeText(`${item.name} 판매 +${gain}원`, game.player.x, game.player.y - 96, '#ffd43b');
    markAutoSaveSoon();
    return true;
  };

  window.sellAllEtc = function sellAllEtc() {
    let gained = 0;
    for (let i = inventory.items.length - 1; i >= 0; i--) {
      const st = inventory.items[i];
      const item = ITEMS[st.id];
      if (!item || (item.type !== 'etc' && item.type !== 'material')) continue;
      gained += itemSellPrice(st) * Math.max(1, st.count || 1);
      inventory.items.splice(i, 1);
    }
    wallet.gold += gained;
    makeText(`부산물 판매 +${gained}원`, game.player.x, game.player.y - 96, '#ffd43b');
    markAutoSaveSoon();
  };

  function inventoryIndexAt(x, y) {
    const grids = [
      { x: 650, y: 185, cols: 6, size: 52, gap: 6 },
      { x: 730, y: 222, cols: 5, size: 52, gap: 10 },
      { x: 690, y: 205, cols: 6, size: 52, gap: 8 }
    ];
    for (const g of grids) {
      for (let i = 0; i < inventory.items.length; i++) {
        const sx = g.x + (i % g.cols) * (g.size + g.gap);
        const sy = g.y + Math.floor(i / g.cols) * (g.size + g.gap);
        if (hit(x, y, sx, sy, g.size, g.size)) return i;
      }
    }
    return -1;
  }

  const oldHandleShopClick2 = typeof handleShopClick === 'function' ? handleShopClick : null;
  window.handleShopClick = handleShopClick = function handleShopClickRarityShop(x, y) {
    if (game.shopOpen === 'merchant') {
      const idx = inventoryIndexAt(x, y);
      if (idx >= 0) { sellInventoryIndex(idx); return; }
      if (hit(x, y, 760, 610, 190, 40)) { sellAllEtc(); return; }
    }
    if (oldHandleShopClick2) return oldHandleShopClick2.apply(this, arguments);
  };

  const oldDrawItemIcon2 = typeof drawItemIcon === 'function' ? drawItemIcon : null;
  window.drawItemIcon = drawItemIcon = function drawItemIconRarity(itemOrIcon, x, y, size) {
    const item = typeof itemOrIcon === 'object' && itemOrIcon ? itemOrIcon : null;
    const icon = item ? (item.icon || item.id || item.type) : itemOrIcon;
    const rarity = item ? getItemRarity(item) : 'common';
    const color = (RARITY_INFO[rarity] || RARITY_INFO.common).color;
    const s = size || 24;
    ctx.save();
    ctx.translate(x, y);
    ctx.lineWidth = Math.max(1, s / 18);
    ctx.shadowColor = color;
    ctx.shadowBlur = rarity === 'legendary' ? 14 : rarity === 'epic' ? 10 : rarity === 'ultra' ? 7 : 0;
    ctx.strokeStyle = color;
    ctx.fillStyle = 'rgba(15,23,42,0.75)';
    roundRect(ctx, -s * 0.46, -s * 0.46, s * 0.92, s * 0.92, s * 0.16);
    ctx.strokeRect(-s * 0.46, -s * 0.46, s * 0.92, s * 0.92);

    function blade(a, b, glow) {
      ctx.strokeStyle = '#1f2937'; ctx.lineWidth = s * 0.16;
      ctx.beginPath(); ctx.moveTo(-s * 0.28, s * 0.26); ctx.lineTo(s * 0.28, -s * 0.28); ctx.stroke();
      ctx.strokeStyle = glow || '#e5e7eb'; ctx.lineWidth = s * 0.10;
      ctx.beginPath(); ctx.moveTo(-s * 0.25, s * 0.23); ctx.lineTo(s * 0.25, -s * 0.25); ctx.stroke();
      ctx.fillStyle = a || '#f59e0b'; roundRect(ctx, -s * 0.34, s * 0.18, s * 0.22, s * 0.12, 2);
      ctx.fillStyle = b || color; circle(ctx, -s * 0.38, s * 0.32, s * 0.07);
    }
    function axe() {
      ctx.strokeStyle = '#7c3f1d'; ctx.lineWidth = s * 0.11; ctx.beginPath(); ctx.moveTo(-s*.2,s*.32); ctx.lineTo(s*.2,-s*.32); ctx.stroke();
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(s*.08,-s*.22); ctx.quadraticCurveTo(s*.42,-s*.25,s*.33,s*.08); ctx.quadraticCurveTo(s*.12,s*.02,s*.03,-s*.09); ctx.closePath(); ctx.fill();
    }
    function staff() {
      ctx.strokeStyle = '#7c3f1d'; ctx.lineWidth = s*.1; ctx.beginPath(); ctx.moveTo(-s*.28,s*.34); ctx.lineTo(s*.18,-s*.28); ctx.stroke();
      ctx.fillStyle = color; circle(ctx, s*.22, -s*.32, s*.14); ctx.fillStyle = '#fff'; circle(ctx, s*.22, -s*.32, s*.06);
    }
    function bow() {
      ctx.strokeStyle = color; ctx.lineWidth = s*.09; ctx.beginPath(); ctx.arc(-s*.03,0,s*.35,-1.1,1.1); ctx.stroke();
      ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = s*.035; ctx.beginPath(); ctx.moveTo(s*.13,-s*.28); ctx.lineTo(s*.13,s*.28); ctx.stroke();
    }
    function potion(kind) {
      ctx.fillStyle = kind === 'mp' ? '#60a5fa' : '#fb7185';
      ctx.beginPath(); ctx.ellipse(0, s*.08, s*.19, s*.25, 0, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = '#e5e7eb'; roundRect(ctx, -s*.09, -s*.28, s*.18, s*.16, 2);
      ctx.fillStyle = '#fff'; circle(ctx, -s*.06, -s*.02, s*.04);
    }
    function armor() { ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0,-s*.32); ctx.lineTo(s*.28,-s*.13); ctx.lineTo(s*.22,s*.32); ctx.lineTo(-s*.22,s*.32); ctx.lineTo(-s*.28,-s*.13); ctx.closePath(); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.35)'; roundRect(ctx,-s*.12,-s*.1,s*.24,s*.08,2); }
    function ring() { ctx.strokeStyle=color; ctx.lineWidth=s*.12; ctx.beginPath(); ctx.arc(0,0,s*.24,0,Math.PI*2); ctx.stroke(); ctx.fillStyle='#fff'; circle(ctx,s*.08,-s*.22,s*.06); }
    function material() { ctx.fillStyle=color; ctx.beginPath(); ctx.moveTo(0,-s*.29); ctx.lineTo(s*.24,0); ctx.lineTo(0,s*.29); ctx.lineTo(-s*.24,0); ctx.closePath(); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.35)'; circle(ctx,-s*.06,-s*.08,s*.06); }

    const idText = String((item && item.id) || icon || '').toLowerCase();
    if (idText.includes('potion_hp') || idText.includes('hp_potion')) potion('hp');
    else if (idText.includes('potion_mp') || idText.includes('mp_potion')) potion('mp');
    else if (item && item.weaponType === 'staff') staff();
    else if (item && item.weaponType === 'bow') bow();
    else if (item && item.weaponType === 'dagger') blade('#4c1d95', color, '#e9d5ff');
    else if (item && item.weaponType === 'sword') blade('#7c2d12', color, '#f8fafc');
    else if (idText.includes('axe')) axe();
    else if (getEquipSlotForItem(item || {}) === 'armor' || idText.includes('armor') || idText.includes('robe')) armor();
    else if (getEquipSlotForItem(item || {}) === 'accessory' || idText.includes('ring') || idText.includes('charm')) ring();
    else if (item && (item.type === 'etc' || item.type === 'material')) material();
    else if (oldDrawItemIcon2) oldDrawItemIcon2(itemOrIcon, 0, 0, s * .75);
    else material();
    ctx.restore();
  };

  const oldDrawShopPanel2 = typeof drawShopPanel === 'function' ? drawShopPanel : null;
  window.drawShopPanel = drawShopPanel = function drawShopPanelTierPotions() {
    if (game.shopOpen !== 'merchant') {
      if (oldDrawShopPanel2) return oldDrawShopPanel2();
      return;
    }
    const list = MERCHANT_POTION_IDS.filter(id => ITEMS[id]);
    const panelX = 70, panelY = 80, panelW = 1110, panelH = 590;
    ctx.fillStyle = 'rgba(15,23,42,0.97)'; roundRect(ctx, panelX, panelY, panelW, panelH, 18);
    ctx.strokeStyle = '#93c5fd'; ctx.strokeRect(panelX, panelY, panelW, panelH);
    ctx.fillStyle = '#ffe066'; ctx.font = 'bold 27px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('상점', 105, 122);
    ctx.fillStyle = '#cbd5e1'; ctx.font = '14px sans-serif'; ctx.fillText(`보유 원: ${wallet.gold}`, 105, 150);
    ctx.fillText('물약 구매 / 오른쪽 인벤토리의 부산물·쓸모 없는 장비를 클릭하면 판매됩니다.', 255, 150);
    list.forEach(function (id, i) {
      const item = ITEMS[id]; const x = 105 + (i % 2) * 470; const y = 180 + Math.floor(i / 2) * 68;
      ctx.fillStyle = '#1e293b'; roundRect(ctx, x, y, 430, 56, 9);
      drawItemIcon(item, x + 30, y + 28, 34);
      ctx.fillStyle = getItemRarityColor(item); ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(`[${getItemRarityLabel(item)}] ${item.name}`, x + 58, y + 22);
      ctx.fillStyle = '#cbd5e1'; ctx.font = '12px sans-serif'; ctx.fillText(`${item.desc || ''} / ${item.price || 0}원`, x + 58, y + 42);
    });
    ctx.fillStyle = '#22c55e'; roundRect(ctx, 760, 610, 190, 40, 8);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('부산물 모두 판매', 855, 636);
    ctx.fillStyle = '#334155'; roundRect(ctx, 1010, 610, 120, 40, 8); ctx.fillStyle = '#fff'; ctx.fillText('닫기', 1070, 636);
    ctx.fillStyle = 'rgba(15,23,42,0.78)'; roundRect(ctx, 650, 170, 470, 420, 12);
    ctx.strokeStyle = '#475569'; ctx.strokeRect(650, 170, 470, 420);
    ctx.fillStyle = '#e5e7eb'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left'; ctx.fillText('내 인벤토리 판매', 675, 200);
    const cols = 6, size = 52, gap = 8;
    inventory.items.forEach(function (st, i) {
      const item = ITEMS[st.id]; if (!item) return;
      const x = 675 + (i % cols) * (size + gap); const y = 222 + Math.floor(i / cols) * (size + gap);
      if (y > 555) return;
      ctx.fillStyle = 'rgba(30,41,59,0.95)'; roundRect(ctx, x, y, size, size, 8);
      drawItemIcon(item, x + size / 2, y + size / 2, 34);
      if ((st.count || 1) > 1) { ctx.fillStyle = '#fff'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'right'; ctx.fillText(String(st.count), x + size - 4, y + size - 5); }
      ctx.fillStyle = '#ffd43b'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(itemSellPrice(st) + '원', x + size / 2, y + size + 11);
    });
  };

  const OLD_MAKE_MONSTER_TYPE = typeof makeMonsterType === 'function' ? makeMonsterType : null;
  const FAMILY_GIMMICK = {
    boar: 'charge', desert: 'charge', lizard: 'charge',
    mana: 'ranged', ice: 'ice_dot', frost: 'ice_dot',
    mushroom: 'poison_dot', bug: 'poison_dot', shadow: 'stun', ruin: 'stun', ore: 'guard', slime: 'split'
  };
  const NAMED_BY_TOWN = {
    lumina: ['왕관 슬라임', '숲의 뿔멧돼지'], greenwood: ['가시등 벌레 여왕', '이끼엄니 돌격대장'], ellenium: ['대마나 위습 엘리온', '룬버섯 현자'], valor: ['강철엄니 브루트', '방패골렘 가르단'], shadowport: ['항구 쥐두목 네로', '밤그림자 박쥐왕'], sylvania: ['고목 사슴수호자', '꽃가루 요정장'], irondeep: ['광산 파쇄자', '붉은 광석 골렘'], frosthall: ['서리늑대 칼라크', '눈장난꾼 포포'], solas: ['사막전갈 사르칸', '태양도마뱀 라자'], nocturn: ['부서진 갑주 카론', '저주구체 모르스']
  };

  window.makeMonsterType = makeMonsterType = function makeMonsterTypeGimmick(family, level) {
    const t = OLD_MAKE_MONSTER_TYPE ? OLD_MAKE_MONSTER_TYPE(family, level) : { family, name: family, level, hp: 30 + level * 10, atk: 5 + level, exp: 10 + level * 2, gold: 5 + level, speed: 25, dropRate: .12 };
    t.gimmick = FAMILY_GIMMICK[family] || (level >= 25 ? 'ranged' : 'wander');
    if (level >= 35 && t.gimmick === 'wander') t.gimmick = 'stun';
    t.respawn = t.respawn || 14000;
    return t;
  };

  function currentTownKeyForHunt(hunt) { return (hunt && hunt.town) || game.townId || 'lumina'; }
  function monsterFloorYForX(x) {
    let best = game.ground || 610;
    if (Array.isArray(game.platforms)) {
      game.platforms.forEach(function (pl) {
        if (x >= pl.x - 12 && x <= pl.x + pl.w + 12 && pl.y <= best + 2) best = pl.y;
      });
    }
    return best;
  }

  window.spawnMonsters = spawnMonsters = function spawnMonstersNamedGimmicks(hunt) {
    game.monsters = [];
    const familiesByTown = {
      lumina: ['slime','boar'], greenwood: ['bug','boar'], ellenium: ['mana','mushroom'], valor: ['boar','ore'], shadowport: ['shadow','bug'], sylvania: ['mushroom','mana'], irondeep: ['ore','ruin'], frosthall: ['ice','boar'], solas: ['desert','lizard'], nocturn: ['ruin','shadow']
    };
    const townKey = currentTownKeyForHunt(hunt);
    const families = familiesByTown[townKey] || hunt.families || ['slime','mushroom'];
    const floors = [game.ground || 610].concat((game.platforms || []).map(p => p.y)).sort((a,b) => b-a);
    let index = 0;
    floors.forEach(function (fy, fi) {
      const count = fi === 0 ? 4 : 2;
      for (let i = 0; i < count; i++) {
        const family = families[(i + fi) % families.length];
        const x = 620 + fi * 420 + i * 760 + rand(-80, 80);
        const type = makeMonsterType(family, (hunt.baseLevel || 1) + fi * 3 + i);
        const id = `${townKey}:mob:${index}:${Math.round(x)}`;
        game.monsters.push({ id, uid: id, type, x, baseX: x, y: fy, spawnY: fy, hp: type.hp, maxHp: type.hp, face: i % 2 ? -1 : 1, time: Math.random() * 10, hit: 0, dead: false, attackCooldown: rand(0.3, 1.7), poison: 0, aggro: false, gimmick: type.gimmick });
        index++;
      }
    });
    const namedNames = NAMED_BY_TOWN[townKey] || ['떠도는 네임드', '잊힌 네임드'];
    namedNames.slice(0, 2).forEach(function (name, ni) {
      const family = families[ni % families.length];
      const fy = floors[Math.min(floors.length - 1, ni * 2 + 1)] || game.ground;
      const x = 1250 + ni * 2100;
      const type = makeMonsterType(family, (hunt.baseLevel || 1) + 8 + ni * 5);
      type.name = name; type.hp = Math.floor(type.hp * 4.2); type.atk = Math.floor(type.atk * 1.8); type.exp = Math.floor(type.exp * 5.5); type.gold = Math.floor(type.gold * 6); type.dropRate = Math.min(0.95, (type.dropRate || .15) * 3); type.respawn = 300000; type.gimmick = ni % 2 ? 'stun' : (type.gimmick === 'wander' ? 'charge' : type.gimmick);
      const id = `${townKey}:named:${ni}`;
      game.monsters.push({ id, uid: id, type, isNamed: true, x, baseX: x, y: fy, spawnY: fy, hp: type.hp, maxHp: type.hp, face: -1, time: Math.random() * 10, hit: 0, dead: false, attackCooldown: 1.5, poison: 0, aggro: false, gimmick: type.gimmick });
    });
  };

  const oldDamageMonster2 = typeof damageMonster === 'function' ? damageMonster : null;
  window.damageMonster = damageMonster = function damageMonsterAggro(m, skill) {
    if (m) { m.aggro = true; m.aggroTime = 12; }
    return oldDamageMonster2 ? oldDamageMonster2.apply(this, arguments) : undefined;
  };

  const oldKillMonster2 = typeof killMonster === 'function' ? killMonster : null;
  window.killMonster = killMonster = function killMonsterNamed(m) {
    if (m && m.isNamed && m.type) {
      m.type.respawn = 300000;
      makeText('네임드 처치! 보상이 크게 증가합니다', m.x, m.y - 175, '#facc15');
      const oldGold = m.type.gold; const oldExp = m.type.exp;
      m.type.gold = Math.floor(oldGold * 1.4); m.type.exp = Math.floor(oldExp * 1.25);
      const result = oldKillMonster2 ? oldKillMonster2.apply(this, arguments) : undefined;
      m.type.gold = oldGold; m.type.exp = oldExp;
      return result;
    }
    return oldKillMonster2 ? oldKillMonster2.apply(this, arguments) : undefined;
  };

  function enemyProjectile(m, kind) {
    game.enemyProjectiles = game.enemyProjectiles || [];
    const dx = game.player.x - m.x; const face = dx >= 0 ? 1 : -1;
    game.enemyProjectiles.push({ x: m.x + face * 28, y: m.y - 48, vx: face * (kind === 'stun' ? 250 : 190), vy: kind === 'ice_dot' ? -20 : 0, life: 2.6, kind, damage: Math.max(2, Math.floor((m.type.atk || 5) * .8)), from: m.id || m.uid });
  }
  function applyStatus(kind, seconds) {
    game.player.status = game.player.status || {};
    game.player.status[kind] = Math.max(game.player.status[kind] || 0, seconds);
  }
  const oldUpdateEnemyProjectiles = typeof updateEnemyProjectiles === 'function' ? updateEnemyProjectiles : null;
  window.updateEnemyProjectiles = updateEnemyProjectiles = function updateEnemyProjectilesGimmick(dt) {
    if (oldUpdateEnemyProjectiles) oldUpdateEnemyProjectiles(dt);
    game.enemyProjectiles = game.enemyProjectiles || [];
    game.enemyProjectiles.forEach(function (p) {
      p.life -= dt; p.x += p.vx * dt; p.y += (p.vy || 0) * dt;
      if (Math.abs(p.x - game.player.x) < 30 && Math.abs(p.y - (game.player.y - 48)) < 48 && game.player.invincible <= 0) {
        const dmg = Math.max(1, p.damage || 1);
        game.player.hp = Math.max(0, game.player.hp - dmg); game.player.invincible = .6; makeText('-' + dmg, game.player.x, game.player.y - 90, '#ff8787');
        if (p.kind === 'poison_dot' || p.kind === 'ice_dot') applyStatus(p.kind, 4);
        if (p.kind === 'stun') applyStatus('stun', 1.2);
        p.life = 0;
      }
    });
    game.enemyProjectiles = game.enemyProjectiles.filter(p => p.life > 0);
  };

  const oldUpdateMonsters2 = typeof updateMonsters === 'function' ? updateMonsters : null;
  window.updateMonsters = updateMonsters = function updateMonstersGimmicks(dt) {
    if (game.mode !== 'hunt') return;
    game.player.status = game.player.status || {};
    Object.keys(game.player.status).forEach(function (k) { game.player.status[k] = Math.max(0, game.player.status[k] - dt); });
    game.monsters.forEach(function (m) {
      if (!m || m.dead) return;
      m.time = (m.time || 0) + dt; m.hit = Math.max(0, (m.hit || 0) - dt); m.attackCooldown = Math.max(0, (m.attackCooldown || 0) - dt); m.aggroTime = Math.max(0, (m.aggroTime || 0) - dt);
      if (m.aggroTime <= 0) m.aggro = false;
      const floorY = monsterFloorYForX(m.x); if (m.y < floorY) m.y = Math.min(floorY, m.y + 720 * dt); else m.y = floorY;
      const dx = game.player.x - m.x; const dist = Math.abs(dx); m.face = dx >= 0 ? 1 : -1;
      const chase = m.aggro && dist < (m.isNamed ? 620 : 420);
      const speed = (m.type.speed || 25) * (m.isNamed ? 1.15 : 1);
      if (chase) {
        if (m.gimmick === 'charge' && m.attackCooldown <= 0 && dist < 420) { m.chargeTime = .45; m.attackCooldown = m.isNamed ? 2.2 : 3.2; makeText('돌진!', m.x, m.y - 92, '#fb923c'); }
        if ((m.gimmick === 'ranged' || m.gimmick === 'ice_dot' || m.gimmick === 'poison_dot' || m.gimmick === 'stun') && m.attackCooldown <= 0 && dist < 520) { enemyProjectile(m, m.gimmick); m.attackCooldown = m.isNamed ? 1.6 : 2.8; }
        if (m.gimmick === 'guard') m.x += Math.sign(dx) * speed * .45 * dt;
        else if (m.chargeTime > 0) { m.x += m.face * speed * 5.2 * dt; m.chargeTime -= dt; }
        else if (dist > 55) m.x += Math.sign(dx) * speed * dt;
      } else {
        m.x += Math.sin(m.time * 1.2 + (m.baseX || 0) * .01) * 10 * dt;
      }
      m.x = clamp(m.x, (m.baseX || m.x) - (m.isNamed ? 340 : 230), (m.baseX || m.x) + (m.isNamed ? 340 : 230));
      if (m.hp <= 0) killMonster(m);
      if (m.aggro && Math.abs(game.player.x - m.x) < 46 && Math.abs(game.player.y - m.y) < 76 && game.player.invincible <= 0) {
        const damage = Math.max(1, Math.floor((m.type.atk || 4) - game.player.defense * .35));
        game.player.hp = Math.max(0, game.player.hp - damage); game.player.invincible = .85; game.player.hurtTime = .2; game.player.vx = -m.face * 130;
        makeText('-' + damage, game.player.x, game.player.y - 90, '#ff8787');
      }
    });
    updateEnemyProjectiles(dt);
  };

  const oldDrawMonsterShape2 = typeof drawMonsterShape === 'function' ? drawMonsterShape : null;
  window.drawMonsterShape = drawMonsterShape = function drawMonsterShapeGimmick(type, m) {
    const named = m && m.isNamed;
    ctx.save();
    if (named) { ctx.scale(1.25, 1.25); ctx.shadowColor = '#facc15'; ctx.shadowBlur = 14; }
    const fam = (type && type.family) || 'slime';
    if (fam === 'boar' || fam === 'desert' || fam === 'lizard') {
      ctx.fillStyle = fam === 'desert' ? '#c08457' : '#795548'; roundRect(ctx, -36, -46, 72, 42, 18);
      ctx.fillStyle = '#5b341e'; circle(ctx, 27, -31, 20); ctx.fillStyle = '#fff7ed'; ctx.beginPath(); ctx.moveTo(38,-28); ctx.lineTo(53,-23); ctx.lineTo(38,-19); ctx.fill(); ctx.fillStyle = '#111827'; circle(ctx, 31, -35, 3); ctx.fillStyle = '#3f2a1f'; for (let x of [-22,-5,12,28]) roundRect(ctx, x, -12, 8, 18, 4);
    } else if (fam === 'mana' || fam === 'ice') {
      ctx.fillStyle = fam === 'ice' ? '#93c5fd' : '#a78bfa'; circle(ctx, 0, -34, 28); ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0,-34,38,0,Math.PI*1.5); ctx.stroke(); ctx.fillStyle = '#1e1b4b'; circle(ctx,-9,-38,3); circle(ctx,9,-38,3);
    } else if (fam === 'bug') {
      ctx.fillStyle = '#65a30d'; roundRect(ctx,-30,-48,60,36,16); ctx.strokeStyle='#bef264'; ctx.beginPath(); for(let i=-2;i<=2;i++){ctx.moveTo(i*10,-14);ctx.lineTo(i*14,-2);} ctx.stroke(); ctx.fillStyle='#111827'; circle(ctx,-10,-36,3); circle(ctx,10,-36,3);
    } else if (fam === 'ruin' || fam === 'ore') {
      ctx.fillStyle = fam === 'ore' ? '#64748b' : '#57534e'; roundRect(ctx,-32,-70,64,64,10); ctx.fillStyle='rgba(255,255,255,.22)'; roundRect(ctx,-18,-56,18,8,3); roundRect(ctx,6,-44,18,8,3); ctx.fillStyle='#111827'; roundRect(ctx,-14,-30,8,6,2); roundRect(ctx,8,-30,8,6,2);
    } else if (fam === 'shadow') {
      ctx.fillStyle = '#312e81'; circle(ctx,0,-34,30); ctx.fillStyle='#020617'; ctx.beginPath(); ctx.arc(0,-34,28,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#c4b5fd'; circle(ctx,-9,-39,4); circle(ctx,9,-39,4);
    } else if (oldDrawMonsterShape2) oldDrawMonsterShape2(type, m); else { ctx.fillStyle='#7dd3fc'; circle(ctx,0,-32,28); }
    if (named) { ctx.fillStyle = '#facc15'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('NAMED', 0, -88); }
    ctx.restore();
  };

  const oldGetRareDropRate2 = typeof getRareDropRate === 'function' ? getRareDropRate : null;
  window.getRareDropRate = getRareDropRate = function getRareDropRateByRarity(type) {
    const base = oldGetRareDropRate2 ? oldGetRareDropRate2(type) : .04;
    return type && type.name && String(type.name).includes('네임드') ? base * 2.5 : base;
  };

  const oldGetMonsterRareEquipmentDrop2 = typeof getMonsterRareEquipmentDrop === 'function' ? getMonsterRareEquipmentDrop : null;
  window.getMonsterRareEquipmentDrop = getMonsterRareEquipmentDrop = function getMonsterRareEquipmentDropWeighted(type) {
    const level = type && type.level || 1;
    const candidates = Object.keys(ITEMS).filter(function (id) {
      const item = ITEMS[id]; if (!item || !getEquipSlotForItem(item)) return false;
      const req = item.reqLevel || 1; return req <= level + 8 && req >= Math.max(1, level - 10);
    });
    if (!candidates.length) return oldGetMonsterRareEquipmentDrop2 ? oldGetMonsterRareEquipmentDrop2(type) : null;
    const roll = Math.random();
    const wanted = roll < .006 ? 'legendary' : roll < .035 ? 'epic' : roll < .11 ? 'ultra' : roll < .35 ? 'rare' : 'common';
    const filtered = candidates.filter(id => getItemRarity(ITEMS[id]) === wanted);
    const pool = filtered.length ? filtered : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
  };
})();

/* =========================================================
   BALANCE / ELITE / MOBILE / ENHANCE HARD PATCH
   - enhancement success and destruction effects
   - destroyed item is permanently removed from equipment/inventory
   - stronger monster gimmicks and elite seal drops
   - hidden job quests require elite seals
   - town level gates
   - level-scaled item drops by zone rarity
   - player is slightly weaker / monsters more threatening
   - compact full mobile control panel
========================================================= */
(function () {
  function A(v) { return Array.isArray(v) ? v : []; }
  function N(v, d) { v = Number(v); return Number.isFinite(v) ? v : d; }
  function R(a, b) { return a + Math.random() * (b - a); }
  function choice(arr) { arr = A(arr); return arr[Math.floor(Math.random() * arr.length)] || null; }
  function text(msg, x, y, color) { if (typeof makeText === 'function') makeText(msg, x, y, color || '#fff'); }
  function slotOf(item) { return typeof getEquipSlotForItem === 'function' ? getEquipSlotForItem(item) : (item && item.slot); }
  function refId(ref) { return typeof itemRefId === 'function' ? itemRefId(ref) : (typeof ref === 'string' ? ref : ref && ref.id); }
  function refPlus(ref) { return typeof itemEnhance === 'function' ? itemEnhance(ref) : (ref && ref.enhance) || 0; }

  // -------------------------------
  // 1) Better enhancement feedback and real destruction
  // -------------------------------
  function addFx(x, y, color, n, kind) {
    if (!game.particles) game.particles = [];
    for (let i = 0; i < n; i++) {
      game.particles.push({
        x: x + R(-20, 20),
        y: y + R(-32, 8),
        vx: R(-190, 190),
        vy: R(-230, 45),
        life: R(0.55, 1.25),
        color: color || '#fff',
        size: R(3, kind === 'break' ? 8 : 6),
        shape: kind === 'success' ? (i % 3 ? 'star' : 'spark') : (i % 2 ? 'shard' : 'smoke'),
        rot: R(0, Math.PI * 2),
        spin: R(-7, 7)
      });
    }
  }

  function removeInventoryCopiesOfDestroyed(ref) {
    const id = refId(ref);
    const plus = refPlus(ref);
    if (!id || !inventory || !Array.isArray(inventory.items)) return;
    // Defensive cleanup: if an old drag/equip path duplicated the destroyed item back into inventory, remove exact enhanced copies.
    for (let i = inventory.items.length - 1; i >= 0; i--) {
      const st = inventory.items[i];
      if (!st) continue;
      const item = ITEMS && ITEMS[st.id];
      if (!item || !slotOf(item)) continue;
      if (st.id === id && refPlus(st) === plus) inventory.items.splice(i, 1);
    }
  }

  window.enhanceEquippedItem = enhanceEquippedItem = function enhanceEquippedItemHard(slot) {
    const ref = equipment && equipment[slot];
    const item = typeof getItemData === 'function' ? getItemData(ref) : (ITEMS && ITEMS[refId(ref)]);
    if (!item) return;
    const plus = refPlus(ref);
    if (plus >= 10) { text('이미 최대 강화입니다.', game.player.x, game.player.y - 90, '#ffe066'); return; }
    const cost = typeof getEnhanceCost === 'function' ? getEnhanceCost(ref) : (120 + plus * 80);
    const money = wallet && (wallet.gold || 0);
    if (money < cost) { text('강화 비용 ' + cost + '원 필요', game.player.x, game.player.y - 90, '#ff8787'); return; }
    wallet.gold -= cost;
    const rate = typeof getEnhanceRate === 'function' ? getEnhanceRate(plus) : Math.max(0.25, 0.86 - plus * 0.07);
    const destroyRate = typeof getDestroyRate === 'function' ? getDestroyRate(plus) : (plus >= 5 ? Math.min(0.55, 0.07 + (plus - 5) * 0.08) : 0);
    const x = game.player.x, y = game.player.y - 48;
    if (Math.random() < rate) {
      equipment[slot] = { id: item.id, enhance: plus + 1 };
      if (typeof recalcStats === 'function') recalcStats();
      if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
      text('강화 성공 +' + (plus + 1) + '!', x, y - 70, '#fef08a');
      addFx(x, y, '#facc15', 58, 'success');
      addFx(x, y, '#ffffff', 22, 'success');
      if (typeof circleEffect === 'function') circleEffect(x, y, '#facc15');
      return;
    }
    if (plus >= 5 && Math.random() < destroyRate) {
      const destroyedRef = { id: item.id, enhance: plus };
      equipment[slot] = null;
      removeInventoryCopiesOfDestroyed(destroyedRef);
      if (typeof recalcStats === 'function') recalcStats();
      if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
      text('장비 파괴!', x, y - 72, '#fb7185');
      addFx(x, y, '#fb7185', 64, 'break');
      addFx(x, y, '#111827', 34, 'break');
      return;
    }
    if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
    text('강화 실패', x, y - 70, '#cbd5e1');
    addFx(x, y, '#94a3b8', 22, 'break');
  };

  // -------------------------------
  // 2) Item grade, zone-scaled drops, potions and merchant sale safety
  // -------------------------------
  const ITEM_RARITIES = {
    common: { label: '일반', color: '#cbd5e1', chance: 0.72, pow: 1.00 },
    rare: { label: '희귀', color: '#60a5fa', chance: 0.22, pow: 1.18 },
    ultra: { label: '초희귀', color: '#22d3ee', chance: 0.06, pow: 1.42 },
    epic: { label: '에픽', color: '#c084fc', chance: 0.016, pow: 1.82 },
    legendary: { label: '레전더리', color: '#facc15', chance: 0.0035, pow: 2.55 }
  };
  window.ITEM_RARITY_INFO = Object.assign(window.ITEM_RARITY_INFO || {}, ITEM_RARITIES);
  function ensureItem(id, data) { if (!ITEMS[id]) ITEMS[id] = Object.assign({ id: id }, data); else Object.assign(ITEMS[id], data); }
  ['small','mid','high'].forEach(function (tier, i) {
    const hpVals = [80, 260, 720], mpVals = [50, 160, 430], prices = [50,180,650];
    ensureItem('hp_potion_' + tier, { name: ['초급','중급','상급'][i] + ' 회복 물약', type: 'consumable', heal: hpVals[i], price: prices[i], sell: Math.floor(prices[i] * .25), rarity: i === 0 ? 'common' : i === 1 ? 'rare' : 'ultra', icon: 'potion_hp_' + tier });
    ensureItem('mp_potion_' + tier, { name: ['초급','중급','상급'][i] + ' 마나 물약', type: 'consumable', mana: mpVals[i], price: Math.floor(prices[i] * 1.12), sell: Math.floor(prices[i] * .28), rarity: i === 0 ? 'common' : i === 1 ? 'rare' : 'ultra', icon: 'potion_mp_' + tier });
  });

  const RARITY_KO = { common: '일반', rare: '희귀', ultra: '초희귀', epic: '에픽', legendary: '레전더리' };
  const RARITY_COLOR = { common: '#cbd5e1', rare: '#60a5fa', ultra: '#22d3ee', epic: '#c084fc', legendary: '#facc15' };
  window.getItemRarityLabel = function (itemOrId) { const item = typeof itemOrId === 'string' ? ITEMS[itemOrId] : itemOrId; return RARITY_KO[(item && item.rarity) || 'common'] || '일반'; };
  window.getItemRarityColor = function (itemOrId) { const item = typeof itemOrId === 'string' ? ITEMS[itemOrId] : itemOrId; return RARITY_COLOR[(item && item.rarity) || 'common'] || '#cbd5e1'; };

  const WEAPON_TYPES = ['sword','dagger','bow','staff'];
  function makeZoneGear(level, rarity, weaponType) {
    const rInfo = ITEM_RARITIES[rarity] || ITEM_RARITIES.common;
    const zone = Math.max(1, Math.floor(level / 5) * 5);
    const id = 'zone_' + weaponType + '_' + zone + '_' + rarity;
    const names = { sword:'검', dagger:'단검', bow:'활', staff:'지팡이' };
    const prefixes = { common:'낡은', rare:'빛나는', ultra:'수정', epic:'왕가의', legendary:'신화의' };
    const atk = Math.max(3, Math.round((level * 1.1 + 5) * rInfo.pow));
    ensureItem(id, { id, name: prefixes[rarity] + ' Lv.' + zone + ' ' + names[weaponType], type:'weapon', weaponType, atk: weaponType === 'staff' ? Math.floor(atk * .55) : atk, matk: weaponType === 'staff' ? atk + 3 : 0, reqLevel: Math.max(1, zone - 3), price: Math.floor((level * 95 + 150) * rInfo.pow), sell: Math.floor((level * 32 + 60) * rInfo.pow), rarity, icon: weaponType + '_' + rarity, desc: RARITY_KO[rarity] + ' 등급의 지역 장비입니다.' });
    return id;
  }
  function randomRarityForDrop(monster) {
    const bonus = monster && monster.isElite ? 2.0 : monster && monster.isNamed ? 1.55 : 1;
    const r = Math.random();
    if (r < ITEM_RARITIES.legendary.chance * bonus) return 'legendary';
    if (r < ITEM_RARITIES.epic.chance * bonus) return 'epic';
    if (r < ITEM_RARITIES.ultra.chance * bonus) return 'ultra';
    if (r < ITEM_RARITIES.rare.chance * bonus) return 'rare';
    return 'common';
  }
  window.getMonsterRareEquipmentDrop = getMonsterRareEquipmentDrop = function getZoneScaledEquipmentDrop(type, monster) {
    const level = (type && type.level) || (monster && monster.type && monster.type.level) || 1;
    const rarity = randomRarityForDrop(monster || type || {});
    const family = (type && type.family) || '';
    let preferred = 'sword';
    if (/shadow|desert|lizard|rogue/i.test(family)) preferred = 'dagger';
    if (/bug|wind|forest|ice/i.test(family)) preferred = 'bow';
    if (/mana|spirit|ruin|mushroom/i.test(family)) preferred = 'staff';
    if (Math.random() < .34) preferred = choice(WEAPON_TYPES) || preferred;
    return makeZoneGear(level, rarity, preferred);
  };

  const oldShopItems = typeof getShopItems === 'function' ? getShopItems : null;
  window.getShopItems = getShopItems = function getShopItemsPotionTiers(type) {
    const base = oldShopItems ? oldShopItems(type) : [];
    if (type === 'merchant') {
      const add = ['hp_potion_small','hp_potion_mid','hp_potion_high','mp_potion_small','mp_potion_mid','mp_potion_high'];
      return Array.from(new Set(add.concat(base || [])));
    }
    return base || [];
  };

  window.sellInventoryIndex = function sellInventoryIndexHard(index) {
    const st = inventory && inventory.items && inventory.items[index];
    if (!st) return false;
    const item = ITEMS[st.id];
    if (!item) return false;
    const canSell = slotOf(item) || item.type === 'etc' || item.type === 'material' || item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory';
    if (!canSell) { text('상인에게 팔 수 없는 아이템입니다.', game.player.x, game.player.y - 90, '#ff8787'); return true; }
    const count = slotOf(item) ? 1 : Math.max(1, st.count || 1);
    const unit = Math.max(1, Math.floor((item.sell || Math.floor((item.price || 10) * .35)) * (1 + refPlus(st) * .15)));
    const gain = unit * count;
    wallet.gold += gain;
    if (!slotOf(item) && st.count > count) st.count -= count; else inventory.items.splice(index, 1);
    text(item.name + ' 판매 +' + gain + '원', game.player.x, game.player.y - 96, '#facc15');
    if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon();
    return true;
  };

  // -------------------------------
  // 3) Elite monster, gimmicks, hidden-job seal requirement
  // -------------------------------
  const HIDDEN_SEALS = {
    dragon_knight: { id:'seal_dragon_knight', name:'용기사의 인장', color:'#fb923c' },
    shadow_reaper: { id:'seal_shadow_reaper', name:'그림자 사신의 인장', color:'#c084fc' },
    star_sage: { id:'seal_star_sage', name:'별의 현자의 인장', color:'#fef08a' }
  };
  Object.keys(HIDDEN_SEALS).forEach(function (job) {
    const s = HIDDEN_SEALS[job];
    ensureItem(s.id, { id:s.id, name:s.name, type:'material', rarity:'epic', sell:5000, price:20000, color:s.color, icon:'seal', desc:'히든 직업 전직 퀘스트를 받기 위한 희귀 인장입니다.' });
  });
  function hasItem(id) { return A(inventory && inventory.items).some(function (it) { return it && it.id === id && (it.count || 1) > 0; }); }
  function consumeItem(id, count) {
    count = count || 1;
    for (let i = A(inventory && inventory.items).length - 1; i >= 0 && count > 0; i--) {
      const it = inventory.items[i]; if (!it || it.id !== id) continue;
      const n = Math.min(count, it.count || 1); it.count = (it.count || 1) - n; count -= n;
      if (it.count <= 0) inventory.items.splice(i, 1);
    }
  }

  const oldAcceptQuest = typeof acceptOrCompleteQuest === 'function' ? acceptOrCompleteQuest : null;
  window.acceptOrCompleteQuest = acceptOrCompleteQuest = function acceptQuestHiddenSeal(id) {
    const q = QUESTS && QUESTS[id];
    if (q && q.jobReward && HIDDEN_SEALS[q.jobReward]) {
      const active = A(quests && quests.active).some(function (x) { return x && x.id === id; });
      const done = A(quests && quests.completed).includes(id);
      if (!active && !done) {
        const seal = HIDDEN_SEALS[q.jobReward];
        if (!hasItem(seal.id)) {
          text(seal.name + '이 있어야 전직 퀘스트를 받을 수 있습니다.', game.player.x, game.player.y - 118, '#fef3c7');
          text('각 도시 엘리트 몬스터에게서 낮은 확률로 획득합니다.', game.player.x, game.player.y - 94, '#facc15');
          return;
        }
        consumeItem(seal.id, 1);
        text(seal.name + '을 사용했습니다.', game.player.x, game.player.y - 118, seal.color);
      }
    }
    return oldAcceptQuest ? oldAcceptQuest.apply(this, arguments) : null;
  };

  const CITY_LEVEL_REQ = { lumina:1, greenwood:3, ellenium:7, valor:10, shadowport:14, sylvania:14, irondeep:20, frosthall:26, solas:32, nocturn:40 };
  TOWNS.forEach(function (t) { t.requiredLevel = CITY_LEVEL_REQ[t.id] || t.requiredLevel || 1; });
  const oldTaxiClick = typeof handleTaxiClick === 'function' ? handleTaxiClick : null;
  window.handleTaxiClick = handleTaxiClick = function handleTaxiLevelGate(x, y) {
    for (let i = 0; i < TOWNS.length; i++) {
      const town = TOWNS[i];
      const tx = 145 + (i % 2) * 360;
      const ty = 190 + Math.floor(i / 2) * 82;
      if (hit(x, y, tx, ty, 320, 62) && town.id !== game.townId) {
        const req = town.requiredLevel || 1;
        if ((game.player.level || 1) < req) { text(town.name + ' 입장 필요 레벨 Lv.' + req, game.player.x, game.player.y - 95, '#ff8787'); return; }
      }
    }
    return oldTaxiClick ? oldTaxiClick.apply(this, arguments) : null;
  };
  const oldLoadTown = typeof loadTown === 'function' ? loadTown : null;
  window.loadTown = loadTown = function loadTownLevelGate(id) {
    const town = TOWNS.find(function (t) { return t.id === id; });
    if (town && town.id !== game.townId && (game.player.level || 1) < (town.requiredLevel || 1)) {
      text(town.name + '은 Lv.' + town.requiredLevel + '부터 이동할 수 있습니다.', game.player.x, game.player.y - 100, '#ff8787');
      return false;
    }
    return oldLoadTown ? oldLoadTown.apply(this, arguments) : null;
  };

  function currentTownKey() { return game.townId || (TOWNS.find(t => t.hunt === game.huntId) || {}).id || 'lumina'; }
  const ELITE_BY_TOWN = {
    lumina: [{ name:'킹 슬라임', family:'slime', gimmick:'split' }, { name:'고대 잎새정령', family:'forest', gimmick:'poison_dot' }],
    greenwood: [{ name:'이끼 돌진왕', family:'boar', gimmick:'charge' }, { name:'가시 독충 여왕', family:'bug', gimmick:'poison_dot' }],
    ellenium: [{ name:'마나 폭풍 위습', family:'mana', gimmick:'ranged' }, { name:'룬버섯 현자', family:'mushroom', gimmick:'stun' }],
    valor: [{ name:'강철 엄니 장군', family:'boar', gimmick:'charge' }, { name:'방패 골렘 브론', family:'ore', gimmick:'guard' }],
    shadowport: [{ name:'검은 항구의 그림자', family:'shadow', gimmick:'stun' }, { name:'밤날개 도적박쥐', family:'bug', gimmick:'ranged' }],
    sylvania: [{ name:'바람매 칼리스', family:'forest', gimmick:'ranged' }, { name:'숲의 독가시', family:'bug', gimmick:'poison_dot' }],
    irondeep: [{ name:'동광 파수꾼', family:'ore', gimmick:'guard' }, { name:'광산 분쇄두더지', family:'boar', gimmick:'charge' }],
    frosthall: [{ name:'서리늑대 알카', family:'ice', gimmick:'ice_dot' }, { name:'빙결 장난꾼 노크', family:'ice', gimmick:'stun' }],
    solas: [{ name:'태양전갈 라자', family:'desert', gimmick:'burn_dot' }, { name:'모래왕 도마뱀', family:'lizard', gimmick:'charge' }],
    nocturn: [{ name:'저주갑주 모르간', family:'ruin', gimmick:'stun' }, { name:'공허구체 네르', family:'shadow', gimmick:'ranged' }]
  };
  function strengthenMonsterType(type, elite) {
    if (!type) return type;
    type.hp = Math.floor((type.hp || 30) * (elite ? 6.5 : 1.35));
    type.atk = Math.max(2, Math.floor((type.atk || 3) * (elite ? 2.3 : 1.28)));
    type.exp = Math.floor((type.exp || 8) * (elite ? 8.5 : 1.2));
    type.gold = Math.floor((type.gold || 4) * (elite ? 9.0 : 1.25));
    type.dropRate = Math.min(0.96, (type.dropRate || 0.28) * (elite ? 3.0 : 1.2));
    type.respawn = elite ? 300000 : (type.respawn || 18000);
    return type;
  }
  const oldMakeMonsters = window.__makeHuntMonsters || (typeof makeReducedMonsters === 'function' ? makeReducedMonsters : null);
  if (oldMakeMonsters) {
    window.__makeHuntMonsters = function makeEliteHuntMonsters(hunt) {
      const list = oldMakeMonsters(hunt) || [];
      list.forEach(function (m) { if (m && m.type) { strengthenMonsterType(m.type, false); m.gimmick = m.gimmick || (m.type && m.type.gimmick); } });
      const town = currentTownKey();
      const elites = ELITE_BY_TOWN[town] || ELITE_BY_TOWN.lumina;
      const floorFn = typeof monsterFloorYForX === 'function' ? monsterFloorYForX : function () { return game.ground || 520; };
      elites.slice(0, 2).forEach(function (e, i) {
        const src = (list.find(function (m) { return m && m.type && (m.type.family === e.family || m.type.gimmick === e.gimmick); }) || list[i] || {}).type || { level: 1, hp: 40, atk: 4, exp: 10, gold: 5, color: '#a78bfa', shape:'slime', speed:22, drop:'slime_jelly' };
        const type = JSON.parse(JSON.stringify(src));
        type.name = e.name; type.family = e.family || type.family; type.gimmick = e.gimmick; type.level = Math.max(type.level || 1, (src.level || 1) + 2); type.color = i ? '#c084fc' : '#facc15'; type.shape = type.shape || (e.family === 'ore' ? 'golem' : 'slime');
        strengthenMonsterType(type, true);
        const x = 380 + i * 520 + Math.random() * 140;
        const y = floorFn(x);
        list.push({ id:'elite:' + town + ':' + i, uid:'elite:' + town + ':' + i, isElite:true, isNamed:true, type, x, baseX:x, y, spawnY:y, hp:type.hp, maxHp:type.hp, face:-1, time:0, hit:0, dead:false, attackCooldown:1.4, aggro:false, aggroTime:0, gimmick:e.gimmick });
      });
      return list;
    };
  }

  function applyPlayerStatus(kind, sec) {
    game.player.status = game.player.status || {};
    game.player.status[kind] = Math.max(game.player.status[kind] || 0, sec || 2);
    if (kind === 'stun') text('기절!', game.player.x, game.player.y - 115, '#c084fc');
    if (kind === 'poison_dot') text('중독!', game.player.x, game.player.y - 115, '#a3e635');
    if (kind === 'burn_dot') text('화상!', game.player.x, game.player.y - 115, '#fb923c');
    if (kind === 'ice_dot') text('빙결!', game.player.x, game.player.y - 115, '#93c5fd');
  }
  window.applyStatus = applyPlayerStatus;

  function monsterGimmickFor(m) {
    const fam = (m && m.type && m.type.family) || (m && m.type && m.type.shape) || '';
    const name = (m && m.type && m.type.name) || '';
    if (m && (m.gimmick || (m.type && m.type.gimmick))) return m.gimmick || m.type.gimmick;
    if (/boar|desert|lizard|멧돼지|도마뱀|전갈|엄니/i.test(fam + name)) return 'charge';
    if (/mana|spirit|ice|위습|정령|마나|서리/i.test(fam + name)) return fam === 'ice' ? 'ice_dot' : 'ranged';
    if (/mushroom|bug|벌레|버섯|독/i.test(fam + name)) return 'poison_dot';
    if (/shadow|ruin|저주|그림자|폐허/i.test(fam + name)) return 'stun';
    if (/solar|sun|fire|태양|화염/i.test(fam + name)) return 'burn_dot';
    return 'wander';
  }
  function spawnEnemyShot(m, kind) {
    game.enemyProjectiles = game.enemyProjectiles || [];
    const face = game.player.x >= m.x ? 1 : -1;
    const color = kind === 'poison_dot' ? '#a3e635' : kind === 'burn_dot' ? '#fb923c' : kind === 'ice_dot' ? '#93c5fd' : kind === 'stun' ? '#c084fc' : '#fef08a';
    game.enemyProjectiles.push({ x:m.x + face*34, y:m.y - 48, vx:face*(m.isElite?280:220), vy:R(-30,10), life:2.4, kind, color, damage:Math.max(2, Math.floor((m.type.atk || 4) * (m.isElite ? .95 : .75))) });
  }
  function updateEnemyShots(dt) {
    game.enemyProjectiles = game.enemyProjectiles || [];
    game.enemyProjectiles.forEach(function (p) {
      p.x += (p.vx || 0) * dt; p.y += (p.vy || 0) * dt; p.life -= dt;
      if (Math.abs(p.x - game.player.x) < 28 && Math.abs(p.y - (game.player.y - 42)) < 52 && (game.player.invincible || 0) <= 0) {
        game.player.hp = Math.max(0, game.player.hp - (p.damage || 1)); game.player.invincible = .75; p.life = 0;
        text('-' + (p.damage || 1), game.player.x, game.player.y - 94, '#ff8787');
        if (p.kind !== 'ranged') applyPlayerStatus(p.kind, p.kind === 'stun' ? 1.2 : 4);
      }
    });
    game.enemyProjectiles = game.enemyProjectiles.filter(function (p) { return p.life > 0; });
  }
  window.updateMonsters = updateMonsters = function updateMonstersEliteGimmicks(dt) {
    if (game.mode !== 'hunt') return;
    game.player.status = game.player.status || {};
    Object.keys(game.player.status).forEach(function (k) {
      game.player.status[k] = Math.max(0, game.player.status[k] - dt);
      if ((k === 'poison_dot' || k === 'burn_dot' || k === 'ice_dot') && game.player.status[k] > 0) {
        game._dotTick = (game._dotTick || 0) - dt;
        if (game._dotTick <= 0) { game._dotTick = .7; const d = k === 'burn_dot' ? 3 : 2; game.player.hp = Math.max(0, game.player.hp - d); text('-' + d, game.player.x, game.player.y - 112, k === 'burn_dot' ? '#fb923c' : '#a3e635'); }
      }
    });
    const floorFn = typeof monsterFloorYForX === 'function' ? monsterFloorYForX : function () { return game.ground || 520; };
    A(game.monsters).forEach(function (m) {
      if (!m || m.dead) return;
      m.type = strengthenMonsterType(m.type || {}, !!m.isElite);
      m.gimmick = monsterGimmickFor(m);
      m.time = (m.time || 0) + dt; m.attackCooldown = Math.max(0, (m.attackCooldown || 0) - dt); m.hit = Math.max(0, (m.hit || 0) - dt);
      m.y = Math.min(floorFn(m.x), (m.y || floorFn(m.x)) + 900 * dt); if (m.y >= floorFn(m.x) - 1) m.y = floorFn(m.x);
      const dx = game.player.x - m.x, dy = Math.abs(game.player.y - m.y), dist = Math.abs(dx); m.face = dx >= 0 ? 1 : -1;
      const active = !!m.aggro || !!m.isElite;
      const spd = (m.type.speed || 24) * (m.isElite ? 1.22 : 1);
      if (!active) { m.x += Math.sin(m.time * 1.1 + (m.baseX || 0) * .01) * 9 * dt; return; }
      if (m.gimmick === 'charge') {
        if (!m.chargeTime && dist < 450 && m.attackCooldown <= 0 && dy < 100) { m.chargeTime = .55; m.attackCooldown = m.isElite ? 2.1 : 3.1; text('돌진!', m.x, m.y - 95, '#fb923c'); }
        if (m.chargeTime > 0) { m.x += m.face * spd * 5.6 * dt; m.chargeTime -= dt; }
        else if (dist > 60) m.x += Math.sign(dx) * spd * dt;
      } else if (['ranged','poison_dot','burn_dot','ice_dot','stun'].includes(m.gimmick)) {
        if (m.attackCooldown <= 0 && dist < 560 && dy < 170) { spawnEnemyShot(m, m.gimmick); m.attackCooldown = m.isElite ? 1.35 : 2.6; }
        if (dist > 230) m.x += Math.sign(dx) * spd * .55 * dt; else if (dist < 150) m.x -= Math.sign(dx) * spd * .45 * dt;
      } else if (m.gimmick === 'guard') {
        if (dist > 70) m.x += Math.sign(dx) * spd * .42 * dt;
      } else if (dist > 70) m.x += Math.sign(dx) * spd * .85 * dt;
      m.x = clamp(m.x, (m.baseX || m.x) - (m.isElite ? 460 : 250), (m.baseX || m.x) + (m.isElite ? 460 : 250));
      if (m.hp <= 0 && typeof killMonster === 'function') killMonster(m);
      if (active && dist < 44 && dy < 75 && (game.player.invincible || 0) <= 0) {
        const dmg = Math.max(1, Math.floor((m.type.atk || 4) - (game.player.defense || 0) * .25));
        game.player.hp = Math.max(0, game.player.hp - dmg); game.player.invincible = .75; game.player.vx = -m.face * 130; text('-' + dmg, game.player.x, game.player.y - 90, '#ff8787');
        if (m.gimmick === 'stun') applyPlayerStatus('stun', .8);
      }
    });
    updateEnemyShots(dt);
  };

  const oldKill = typeof killMonster === 'function' ? killMonster : null;
  window.killMonster = killMonster = function killMonsterEliteDrops(m) {
    if (!m || m._deathHandled) return;
    const wasElite = !!m.isElite;
    const x = m.x, y = m.y;
    const result = oldKill ? oldKill.apply(this, arguments) : null;
    if (wasElite) {
      const jobs = Object.keys(HIDDEN_SEALS);
      if (Math.random() < 0.12) {
        const s = HIDDEN_SEALS[choice(jobs)];
        if (s && game.drops) game.drops.push({ kind:'item', itemId:s.id, count:1, x:x + R(-18,18), y:y - 38, vy:-160, picked:false });
        if (s) text(s.name + '!', x, y - 145, s.color);
      }
      const eq = getMonsterRareEquipmentDrop(m.type, m);
      if (eq && game.drops) game.drops.push({ kind:'item', itemId:eq, count:1, x:x + R(-25,25), y:y - 52, vy:-190, picked:false });
      text('<' + ((m.type && m.type.name) || '엘리트') + '> 처치!', x, y - 172, '#facc15');
    }
    return result;
  };

  // Display elite names over monsters.
  window.drawMonsters = drawMonsters = function drawMonstersNames() {
    A(game.monsters).forEach(function (m) {
      if (!m || m.dead) return;
      ctx.save(); ctx.translate(m.x, m.y + Math.sin((m.time || 0) * 6) * 2); ctx.scale(m.face || 1, 1); if (m.hit > 0) ctx.globalAlpha = .55; drawMonsterShape(m.type, m); ctx.restore();
      const big = m.isElite || m.isNamed || (m.type && (m.type.shape === 'golem' || m.type.shape === 'ogre'));
      const barW = big ? 76 : 48; const barY = m.y - (big ? 104 : 58);
      ctx.fillStyle = '#0008'; ctx.fillRect(m.x - barW/2, barY, barW, 7);
      ctx.fillStyle = m.isElite ? '#facc15' : '#ff4d4f'; ctx.fillRect(m.x - barW/2, barY, barW * clamp((m.hp || 0)/(m.maxHp || 1), 0, 1), 7);
      ctx.textAlign = 'center'; ctx.font = m.isElite ? 'bold 12px sans-serif' : 'bold 11px sans-serif';
      ctx.fillStyle = m.isElite ? '#fef3c7' : '#fff';
      ctx.fillText((m.isElite ? '<' + (m.type.name || '엘리트') + '> ' : '') + 'Lv.' + ((m.type && m.type.level) || 1), m.x, barY - 5);
    });
  };

  // Player starts less overpowered: reduce computed final damage a bit and increase monster pressure.
  const oldCalcDamage = typeof calcDamage === 'function' ? calcDamage : null;
  if (oldCalcDamage) window.calcDamage = calcDamage = function calcDamageTighter() { return Math.max(1, Math.floor(oldCalcDamage.apply(this, arguments) * 0.82)); };

  // -------------------------------
  // 4) Compact mobile controls with full PC actions
  // -------------------------------
  function pressKey(k, ms) { keys[k] = true; setTimeout(function () { keys[k] = false; }, ms || 120); }
  function callSafe(fn) { try { if (typeof fn === 'function') fn(); } catch (e) { console.warn(e); } }
  function rebuildMobileControls() {
    const old = document.getElementById('pixel-rpg-touch-controls'); if (old) old.remove();
    let style = document.getElementById('pixel-rpg-touch-style-compact');
    if (!style) {
      style = document.createElement('style'); style.id = 'pixel-rpg-touch-style-compact';
      style.textContent = `
      body.pixel-rpg-touch-mode canvas{touch-action:none}#pixel-rpg-touch-controls{position:fixed;inset:0;z-index:9999;pointer-events:none;font-family:sans-serif}.prg-pad{position:absolute;pointer-events:auto;display:flex;gap:6px;align-items:center}.prg-touch-btn{border:1px solid rgba(255,255,255,.25);background:rgba(15,23,42,.62);color:white;border-radius:14px;min-width:44px;height:42px;padding:0 9px;font-weight:800;box-shadow:0 4px 12px rgba(0,0,0,.25);backdrop-filter:blur(4px)}.prg-touch-btn:active{transform:scale(.96);background:rgba(37,99,235,.78)}#prg-left-pad{left:18px;bottom:22px;width:178px;height:132px;display:block}.prg-dir{position:absolute;width:56px;height:48px}.prg-left{left:0;bottom:38px}.prg-right{left:116px;bottom:38px}.prg-up{left:58px;bottom:78px}.prg-down{left:58px;bottom:0}#prg-action-pad{right:16px;bottom:18px;width:286px;justify-content:flex-end;flex-wrap:wrap}.prg-main{background:rgba(185,28,28,.72)}.prg-skill{background:rgba(88,28,135,.68)}.prg-sub{background:rgba(30,64,175,.65)}#prg-menu-pad{top:8px;right:8px;left:8px;justify-content:flex-end;flex-wrap:wrap}.prg-menu{height:34px;min-width:42px;font-size:12px;background:rgba(15,23,42,.54)}@media(pointer:fine) and (min-width:900px){body:not(.pixel-rpg-force-touch) #pixel-rpg-touch-controls{display:none!important}}`;
      document.head.appendChild(style);
    }
    document.body.classList.add('pixel-rpg-touch-mode');
    const wrap = document.createElement('div'); wrap.id = 'pixel-rpg-touch-controls';
    const b = function (label, cls, fn) { const e = document.createElement('button'); e.type='button'; e.className='prg-touch-btn '+(cls||''); e.textContent=label; const h=function(ev){ev.preventDefault();ev.stopPropagation();callSafe(fn);}; e.addEventListener('touchstart',h,{passive:false}); e.addEventListener('mousedown',h); return e; };
    const hold = function (label, cls, key) { const e = document.createElement('button'); e.type='button'; e.className='prg-touch-btn '+cls; e.textContent=label; const down=function(ev){ev.preventDefault();keys[key]=true;}; const up=function(ev){ev&&ev.preventDefault();keys[key]=false;}; e.addEventListener('touchstart',down,{passive:false}); e.addEventListener('touchend',up,{passive:false}); e.addEventListener('touchcancel',up,{passive:false}); e.addEventListener('mousedown',down); window.addEventListener('mouseup',up); return e; };
    const left = document.createElement('div'); left.id='prg-left-pad'; left.className='prg-pad'; left.appendChild(hold('←','prg-dir prg-left','arrowleft')); left.appendChild(hold('→','prg-dir prg-right','arrowright')); left.appendChild(hold('↑','prg-dir prg-up','arrowup')); left.appendChild(hold('↓','prg-dir prg-down','s'));
    const act = document.createElement('div'); act.id='prg-action-pad'; act.className='prg-pad';
    act.appendChild(b('공격','prg-main',function(){ basicAttack(); })); act.appendChild(b('K','prg-skill',function(){ useHotSkill('k'); })); act.appendChild(b('L','prg-skill',function(){ useHotSkill('l'); })); act.appendChild(b(';','prg-skill',function(){ useHotSkill('semicolon'); }));
    act.appendChild(b('대화','prg-sub',function(){ interact(); })); act.appendChild(b('줍기','prg-sub',function(){ pickDrops(); })); act.appendChild(b('HP','prg-sub',function(){ quickPotion('hp'); })); act.appendChild(b('MP','prg-sub',function(){ quickPotion('mp'); })); act.appendChild(b('하강','prg-sub',function(){ pressKey('s',260); }));
    const menu = document.createElement('div'); menu.id='prg-menu-pad'; menu.className='prg-pad';
    menu.appendChild(b('가방','prg-menu',function(){ inventory.open=!inventory.open; stats.open=skills.open=quests.open=false; })); menu.appendChild(b('스탯','prg-menu',function(){ stats.open=!stats.open; inventory.open=skills.open=quests.open=false; })); menu.appendChild(b('스킬','prg-menu',function(){ skills.open=!skills.open; inventory.open=stats.open=quests.open=false; })); menu.appendChild(b('퀘','prg-menu',function(){ quests.open=!quests.open; inventory.open=stats.open=skills.open=false; })); menu.appendChild(b('상점','prg-menu',function(){ interact(); })); menu.appendChild(b('저장','prg-menu',function(){ saveGame && saveGame(); text('저장 완료', game.player.x, game.player.y-100, '#93c5fd'); })); if (typeof toggleLeaderboard === 'function') menu.appendChild(b('랭킹','prg-menu',toggleLeaderboard)); if (typeof toggleChat === 'function') menu.appendChild(b('채팅','prg-menu',toggleChat));
    wrap.appendChild(menu); wrap.appendChild(left); wrap.appendChild(act); document.body.appendChild(wrap);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', rebuildMobileControls); else setTimeout(rebuildMobileControls, 100);
})();


/* =========================================================
   QUEST PROGRESS / DIALOG SIZE / DISTINCT JOB NPC PATCH
   - fixes kill quest progress not increasing for renamed/elite/variant monsters
   - makes NPC dialog wider/taller with wrapped text and quest detail lines
   - diversifies rare/epic/hidden job NPC names, looks, quests, and positions
========================================================= */
(function () {
  'use strict';
  if (window.__PIXEL_RPG_QUEST_DIALOG_JOBNPC_PATCH_01__) return;
  window.__PIXEL_RPG_QUEST_DIALOG_JOBNPC_PATCH_01__ = true;

  function arr(v) { return Array.isArray(v) ? v : []; }
  function safeText(msg, color) {
    try {
      if (typeof makeText === 'function' && game && game.player) makeText(msg, game.player.x, game.player.y - 105, color || '#ffe066');
    } catch (_) {}
  }
  function itemCount(id) {
    try {
      if (typeof getItemCount === 'function') return getItemCount(id);
      return arr(inventory && inventory.items).reduce(function (sum, it) {
        return sum + (it && it.id === id ? (it.count || 1) : 0);
      }, 0);
    } catch (_) { return 0; }
  }

  const FAMILY_ALIASES_PATCH = {
    slime: ['slime','leaf','forest','gel','jelly','초록','젤리','슬라임','잎새','나뭇잎','킹 슬라임'],
    mushroom: ['mushroom','fungus','spore','버섯','포자','룬버섯'],
    mana: ['mana','spirit','wisp','arcane','마나','정령','위습','비전'],
    boar: ['boar','tusk','wolf','lizard','desert','멧돼지','엄니','늑대','도마뱀','전갈','돌진'],
    bug: ['bug','insect','bat','bee','벌레','독충','박쥐','가시'],
    shadow: ['shadow','night','dark','rogue','그림자','밤','검은','도적','사신'],
    ore: ['ore','golem','stone','iron','광석','골렘','강철','갑주','파수꾼'],
    ice: ['ice','frost','snow','서리','얼음','빙결','눈'],
    desert: ['desert','sand','solar','sun','lizard','scorpion','사막','모래','태양','도마뱀','전갈'],
    ruin: ['ruin','curse','void','guardian','폐허','저주','공허','수호자','갑주']
  };

  function monsterTokens(monsterOrType) {
    const m = monsterOrType || {};
    const t = m.type || m;
    return [
      t.family, t.baseFamily, t.shape, t.kind, t.id, t.name, t.drop, t.gimmick,
      m.family, m.id, m.uid, m.name, m.gimmick, m.eliteId, m.namedId,
      m.isElite ? 'elite' : '', m.isNamed ? 'named' : ''
    ].filter(Boolean).map(function (x) { return String(x).toLowerCase(); }).join(' ');
  }

  function goalMatchesMonster(goal, monster) {
    if (!goal || goal.type !== 'kill') return false;
    const text = monsterTokens(monster);
    const target = String(goal.family || goal.monster || goal.monsterId || goal.name || goal.target || '').toLowerCase();
    if (!target || target === 'any' || target === 'all') return true;
    if (text.indexOf(target) >= 0) return true;
    const aliases = FAMILY_ALIASES_PATCH[target] || [];
    for (let i = 0; i < aliases.length; i++) {
      if (text.indexOf(String(aliases[i]).toLowerCase()) >= 0) return true;
    }
    return false;
  }

  window.updateKillQuests = updateKillQuests = function updateKillQuestsRobust(monsterOrFamily) {
    const isString = typeof monsterOrFamily === 'string';
    const fake = isString ? { family: monsterOrFamily, type: { family: monsterOrFamily, name: monsterOrFamily } } : monsterOrFamily;
    let changed = false;
    arr(quests && quests.active).forEach(function (q) {
      arr(q && q.goals).forEach(function (goal) {
        if (goal.type === 'item') goal.count = itemCount(goal.itemId);
        if (goal.type === 'kill' && goalMatchesMonster(goal, fake)) {
          goal.count = Math.min(goal.need || 1, (goal.count || 0) + 1);
          changed = true;
        }
      });
    });
    if (changed) {
      try { if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon(); } catch (_) {}
    }
  };

  const __oldKillQuestProgressPatch = typeof killMonster === 'function' ? killMonster : null;
  if (__oldKillQuestProgressPatch) {
    window.killMonster = killMonster = function killMonsterQuestProgressFixed(m) {
      if (!m || m.__questProgressAlreadyCounted) return __oldKillQuestProgressPatch.apply(this, arguments);
      m.__questProgressAlreadyCounted = true;
      // Count before old kill logic, because older kill functions sometimes pass only family strings.
      try { updateKillQuests(m); } catch (err) { console.error('[quest kill progress failed]', err); }
      return __oldKillQuestProgressPatch.apply(this, arguments);
    };
  }

  const __oldSyncQuestItemsPatch = typeof syncQuestItems === 'function' ? syncQuestItems : null;
  window.syncQuestItems = syncQuestItems = function syncQuestItemsFixed(q) {
    if (__oldSyncQuestItemsPatch) {
      try { __oldSyncQuestItemsPatch.apply(this, arguments); } catch (_) {}
    }
    arr(q && q.goals).forEach(function (goal) {
      if (goal.type === 'item') goal.count = itemCount(goal.itemId);
    });
  };

  function wrapLines(ctx, text, maxWidth) {
    text = String(text || '').replace(/\r/g, '');
    const raw = text.split('\n');
    const lines = [];
    raw.forEach(function (part) {
      let line = '';
      const words = part.split(/\s+/);
      words.forEach(function (word) {
        const test = line ? line + ' ' + word : word;
        if (ctx.measureText(test).width > maxWidth && line) {
          lines.push(line);
          line = word;
        } else line = test;
      });
      if (line) lines.push(line);
      if (!part.trim()) lines.push('');
    });
    return lines;
  }

  function currentDialogAction(npc) {
    let action = '확인';
    if (!npc) return action;
    if (npc.type === 'taxi') action = '이동하기';
    if (npc.type === 'merchant') action = '상점 열기';
    if (npc.type === 'weapon') action = '장비 보기';
    if (npc.type === 'blacksmith') action = '강화하기';
    if (npc.type === 'quest' || npc.type === 'job' || npc.type === 'hidden_job' || npc.type === 'repeat_quest' || npc.quest) {
      const q = arr(quests && quests.active).find(function (item) { return item && item.id === npc.quest; });
      if (arr(quests && quests.completed).includes(npc.quest) && !(QUESTS[npc.quest] && QUESTS[npc.quest].repeatable)) action = '완료됨';
      else if (q) {
        syncQuestItems(q);
        action = (typeof questComplete === 'function' && questComplete(q)) ? '완료하기' : '진행 중';
      } else action = npc.type === 'repeat_quest' ? '반복 의뢰' : (npc.type === 'job' || npc.type === 'hidden_job' ? '전직 퀘스트' : '퀘스트 수락');
    }
    return action;
  }

  function questDialogExtra(npc) {
    const q = npc && npc.quest && QUESTS && QUESTS[npc.quest];
    if (!q) return [];
    const out = [];
    if (q.title) out.push('[' + q.title + ']');
    if (q.requiredLevel) out.push('필요 레벨: Lv.' + q.requiredLevel);
    if (q.rarity) out.push('난이도/등급: ' + q.rarity);
    if (q.desc) out.push(q.desc);
    const active = arr(quests && quests.active).find(function (a) { return a && a.id === q.id; });
    const show = active || q;
    arr(show.goals).forEach(function (g) {
      let label = '';
      let count = g.count || 0;
      if (g.type === 'item') {
        count = itemCount(g.itemId);
        label = (ITEMS[g.itemId] && ITEMS[g.itemId].name) || g.itemId;
      } else if (g.type === 'kill') {
        label = g.label || g.monster || g.name || g.family || '몬스터';
      }
      if (label) out.push('목표: ' + label + ' ' + count + '/' + (g.need || 1));
    });
    if (q.rewardExp || q.rewardGold) out.push('보상: EXP ' + (q.rewardExp || 0) + ' / ' + (q.rewardGold || 0) + '원');
    return out;
  }

  window.drawDialog = drawDialog = function drawDialogLargeWrapped() {
    if (!game.dialog || !game.dialog.npc) return;
    const npc = game.dialog.npc;
    const x = 120, y = 455, w = 1040, h = 210;
    ctx.save();
    ctx.fillStyle = 'rgba(15,23,42,0.97)';
    roundRect(ctx, x, y, w, h, 16);
    ctx.strokeStyle = '#93c5fd';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffe066';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(npc.name || 'NPC', x + 26, y + 36);

    ctx.font = '15px sans-serif';
    ctx.fillStyle = '#e2e8f0';
    const textLines = wrapLines(ctx, npc.text || '무엇을 도와드릴까요?', w - 70);
    let cy = y + 65;
    textLines.slice(0, 3).forEach(function (line) {
      ctx.fillText(line, x + 26, cy);
      cy += 21;
    });

    const extra = questDialogExtra(npc);
    ctx.font = '13px sans-serif';
    extra.slice(0, 5).forEach(function (line, idx) {
      ctx.fillStyle = idx === 0 ? '#bfdbfe' : '#cbd5e1';
      const lines = wrapLines(ctx, line, w - 90);
      lines.slice(0, 2).forEach(function (l) {
        if (cy < y + 163) {
          ctx.fillText(l, x + 34, cy);
          cy += 18;
        }
      });
    });

    const action = currentDialogAction(npc);
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
    ctx.restore();
  };

  const JOB_NPC_VARIANTS = {
    lumina: [
      { type:'job', name:'수련 교관 도윤', quest:'beginner_mastery_job', jobReward:'beginner', lookJob:'beginner', x:760, yLevel:0, text:'초보자라도 기초를 끝까지 다지면 더 강해질 수 있습니다.' }
    ],
    greenwood: [
      { type:'job', name:'음유시인 리라', quest:'special_bard', jobReward:'bard', lookJob:'bard', x:1460, yLevel:2, text:'잃어버린 선율을 찾아오면 전장의 노래를 가르쳐줄게요.' },
      { type:'job', name:'숲의 성기사 오르웬', quest:'paladin_job', jobReward:'paladin', lookJob:'paladin', x:3020, yLevel:1, text:'성스러운 방패는 약자를 지키는 자에게만 반응합니다.' }
    ],
    ellenium: [
      { type:'job', name:'대마법사 이렌', quest:'mage_job', jobReward:'mage', lookJob:'mage', x:1320, yLevel:1, text:'마법의 길은 지식보다 집중을 먼저 요구합니다.' },
      { type:'job', name:'별빛 예언자 루미엘', quest:'hidden_star_sage', jobReward:'star_sage', hiddenJob:'star_sage', lookJob:'star_sage', x:3740, yLevel:3, text:'별의 인장을 지닌 자만 성좌의 문을 두드릴 수 있습니다.' }
    ],
    valor: [
      { type:'job', name:'기사단장 로한', quest:'warrior_job', jobReward:'warrior', lookJob:'warrior', x:1180, yLevel:1, text:'전사는 힘보다 물러서지 않는 마음으로 증명됩니다.' },
      { type:'job', name:'용혈 감시자 세르칸', quest:'hidden_dragon_knight', jobReward:'dragon_knight', hiddenJob:'dragon_knight', lookJob:'dragon_knight', x:3860, yLevel:3, text:'아르딘은 떠났습니다. 지금은 내가 용혈의 시험을 지킵니다.' },
      { type:'job', name:'붉은 투사 마르크', quest:'berserker_job', jobReward:'berserker', lookJob:'berserker', x:2560, yLevel:2, text:'분노를 제어할 수 있다면 광전사의 길을 열어주마.' }
    ],
    shadowport: [
      { type:'job', name:'그림자 란', quest:'rogue_job', jobReward:'rogue', lookJob:'rogue', x:960, yLevel:1, text:'그림자는 빠르게 움직이는 자에게만 길을 보여줍니다.' },
      { type:'job', name:'검은 달의 사신 네라', quest:'hidden_shadow_reaper', jobReward:'shadow_reaper', hiddenJob:'shadow_reaper', lookJob:'shadow_reaper', x:3900, yLevel:3, text:'검은 달의 인장을 가져온 자에게만 사신의 계약을 허락합니다.' }
    ],
    sylvania: [
      { type:'job', name:'명궁 세리아', quest:'archer_job', jobReward:'archer', lookJob:'archer', x:1020, yLevel:1, text:'숲의 사수는 한 발을 쏘기 전에 바람을 읽습니다.' },
      { type:'job', name:'바람 추적자 피엔', quest:'ranger_job', jobReward:'ranger', lookJob:'archer', x:2960, yLevel:2, text:'멀리서 적을 제압하는 법을 배우고 싶나요?' }
    ],
    irondeep: [
      { type:'job', name:'기계공 노바', quest:'special_engineer', jobReward:'engineer', lookJob:'engineer', x:1440, yLevel:2, text:'고장난 드론을 고치면 기계 전투술을 알려주죠.' },
      { type:'job', name:'강철 창장 카르도', quest:'lancer_job', jobReward:'lancer', lookJob:'lancer', x:3280, yLevel:1, text:'긴 창은 거리를 지배하는 무기입니다.' }
    ],
    frosthall: [
      { type:'job', name:'빙설 성직자 엘린', quest:'cleric_job', jobReward:'cleric', lookJob:'cleric', x:1420, yLevel:2, text:'상처를 치유하는 힘은 차가운 인내에서 나옵니다.' },
      { type:'job', name:'서리 소환사 니브', quest:'summoner_job', jobReward:'summoner', lookJob:'summoner', x:3380, yLevel:3, text:'정령과 계약하려면 먼저 냉기의 시험을 견뎌야 합니다.' }
    ],
    solas: [
      { type:'job', name:'황야의 총잡이 제드', quest:'gunslinger_job', jobReward:'gunslinger', lookJob:'gunslinger', x:1680, yLevel:2, text:'사막에서는 빠른 손과 더 빠른 판단이 생명입니다.' }
    ],
    nocturn: [
      { type:'job', name:'폐허 조율사 베인', quest:'epic_ruin_job', jobReward:'engineer', lookJob:'engineer', x:3500, yLevel:3, text:'폐허의 장치를 이해하는 자만 상급 기술을 다룰 수 있습니다.' }
    ]
  };

  function platformYForLevel(level, fallbackX) {
    const ground = game.ground || 560;
    if (!level) return ground;
    const candidates = arr(game.platforms).filter(function (pf) { return pf && pf.townFloor && (pf.floor === level || Math.abs((pf.floor || 0) - level) <= 1); });
    if (candidates.length) {
      const sorted = candidates.slice().sort(function (a, b) {
        const ax = Math.abs((a.x + a.w / 2) - fallbackX);
        const bx = Math.abs((b.x + b.w / 2) - fallbackX);
        return ax - bx;
      });
      return sorted[0].y;
    }
    return level === 3 ? 275 : level === 2 ? 390 : level === 1 ? 505 : ground;
  }

  function pruneGenericDuplicateJobNpcs() {
    const keepNames = new Set();
    arr(JOB_NPC_VARIANTS[game.townId]).forEach(function (n) { keepNames.add(n.name); });
    const questToVariant = {};
    arr(JOB_NPC_VARIANTS[game.townId]).forEach(function (n) { if (n.quest) questToVariant[n.quest] = n.name; });
    game.npcs = arr(game.npcs).filter(function (npc) {
      if (!npc) return false;
      if (!(npc.type === 'job' || npc.type === 'hidden_job' || npc.hiddenJob)) return true;
      // Keep if it is a custom variant in the current town.
      if (keepNames.has(npc.name)) return true;
      // Remove old generic Ardin/Lumiel/same-position NPC when a town-specific variant handles the same quest.
      if (npc.quest && questToVariant[npc.quest]) return false;
      // Remove repeated generic hidden NPC that appeared in every city.
      if (/아르딘|루미엘|검은 달의 사신$/.test(String(npc.name || '')) && !keepNames.has(npc.name)) return false;
      return true;
    });
  }

  function ensureVariantQuest(npc) {
    if (!npc || !npc.quest || !npc.jobReward || !QUESTS) return;
    if (QUESTS[npc.quest]) {
      QUESTS[npc.quest].npc = npc.name;
      QUESTS[npc.quest].town = game.townId;
      if (!QUESTS[npc.quest].desc || /스킬|전직|시험/.test(QUESTS[npc.quest].desc)) {
        QUESTS[npc.quest].desc = npc.text + ' ' + npc.name + '의 전용 시험을 완료하세요.';
      }
      return;
    }
    const familyByTown = { lumina:'slime', greenwood:'bug', ellenium:'mana', valor:'boar', shadowport:'shadow', sylvania:'bug', irondeep:'ore', frosthall:'ice', solas:'desert', nocturn:'ruin' };
    const rank = Math.max(0, ['lumina','greenwood','ellenium','valor','shadowport','sylvania','irondeep','frosthall','solas','nocturn'].indexOf(game.townId));
    QUESTS[npc.quest] = {
      id: npc.quest,
      title: npc.name + '의 전직 시험',
      town: game.townId,
      npc: npc.name,
      jobReward: npc.jobReward,
      desc: npc.text + ' 이 도시의 몬스터를 처치하고 전직 자격을 증명하세요.',
      goals: [{ type:'kill', family: familyByTown[game.townId] || 'any', need: 8 + rank * 2, count: 0 }],
      rewardGold: 350 + rank * 120,
      rewardExp: 400 + rank * 180
    };
  }

  function addDistinctJobNpcs() {
    if (!game || !Array.isArray(game.npcs)) return;
    pruneGenericDuplicateJobNpcs();
    const list = JOB_NPC_VARIANTS[game.townId] || [];
    const existing = new Set(game.npcs.map(function (n) { return (n.name || '') + ':' + (n.quest || ''); }));
    list.forEach(function (template, idx) {
      ensureVariantQuest(template);
      const key = template.name + ':' + template.quest;
      if (existing.has(key)) return;
      const npc = Object.assign({}, template);
      npc.y = platformYForLevel(template.yLevel || 0, template.x);
      npc.uniqueNpc = true;
      npc.difficultyLabel = npc.hiddenJob ? '히든' : (QUESTS[npc.quest] && QUESTS[npc.quest].rarity) || npc.difficultyLabel;
      game.npcs.push(npc);
    });
    // Ground every NPC to the nearest intended platform so the dialogue prompt is not visually messy.
    game.npcs.forEach(function (npc) {
      if (!npc) return;
      if (npc.yLevel !== undefined) npc.y = platformYForLevel(npc.yLevel, npc.x || 0);
      else if (typeof floorForNpc === 'function') {
        try { npc.y = floorForNpc(npc.x || 0, npc.y || game.ground); } catch (_) {}
      }
    });
  }

  const __oldLoadTownJobNpcPatch = typeof loadTown === 'function' ? loadTown : null;
  if (__oldLoadTownJobNpcPatch) {
    window.loadTown = loadTown = function loadTownDistinctJobNpcs() {
      const ret = __oldLoadTownJobNpcPatch.apply(this, arguments);
      try { addDistinctJobNpcs(); setTimeout(addDistinctJobNpcs, 0); } catch (err) { console.error('[job npc variant patch failed]', err); }
      return ret;
    };
  }

  // If currently in a town after hot reload/redeploy, repair it once.
  try { if (game && game.mode === 'town') addDistinctJobNpcs(); } catch (_) {}
})();


/* =========================================================
   CAMERA / RESPAWN / NPC / SHOP / ITEM VISUAL FINAL PATCH
   - vertical camera follows the player so top platforms do not hide behind HUD
   - normal monster respawn minimum 10 sec and can be hit immediately after respawn
   - hidden/rare/epic job NPCs are separated by town/level/position and require scrolls
   - merchant purchase and sale are separated into tabs
   - equipment names, rarity borders, weapon/armor visuals and attack effects improved
========================================================= */
(function () {
  'use strict';

  const RARITY_COLOR_FINAL = {
    common: '#9ca3af', normal: '#9ca3af', rare: '#60a5fa', ultra: '#22d3ee', epic: '#c084fc', legendary: '#facc15', hidden: '#ffffff'
  };
  const RARITY_LABEL_FINAL = {
    common: '일반', normal: '일반', rare: '희귀', ultra: '초희귀', epic: '에픽', legendary: '레전더리', hidden: '히든'
  };

  function finalSafeArr(v) { return Array.isArray(v) ? v : []; }
  function finalNow() { return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
  function finalClamp(v, a, b) { return typeof clamp === 'function' ? clamp(v, a, b) : Math.max(a, Math.min(b, v)); }
  function finalItemId(ref) { return typeof itemRefId === 'function' ? itemRefId(ref) : (typeof ref === 'string' ? ref : (ref && ref.id)); }
  function finalItemEnhance(ref) { return typeof itemEnhance === 'function' ? itemEnhance(ref) : ((ref && ref.enhance) || 0); }
  function finalItemData(ref) { return typeof getItemData === 'function' ? getItemData(ref) : (ITEMS && ITEMS[finalItemId(ref)]); }
  function finalHit(x, y, rx, ry, rw, rh) { return typeof hit === 'function' ? hit(x, y, rx, ry, rw, rh) : (x >= rx && x <= rx + rw && y >= ry && y <= ry + rh); }
  function finalRound(c, x, y, w, h, r) { if (typeof roundRect === 'function') roundRect(c, x, y, w, h, r); else c.fillRect(x, y, w, h); }
  function finalCircle(c, x, y, r) { if (typeof circle === 'function') circle(c, x, y, r); else { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); } }
  function finalMoney(v) { return (typeof moneyLabel === 'function') ? moneyLabel(v) : ((v || 0) + '원'); }
  function finalText(msg, color) { if (typeof makeText === 'function' && game && game.player) makeText(msg, game.player.x, game.player.y - 110, color || '#fff'); }
  function finalSaveSoon() { if (typeof markAutoSaveSoon === 'function') markAutoSaveSoon(); }

  function finalRarity(itemOrRef) {
    const item = finalItemData(itemOrRef) || itemOrRef || {};
    const raw = String(item.rarity || item.grade || item.tierName || 'common').toLowerCase();
    if (raw.includes('legend') || raw.includes('레전')) return 'legendary';
    if (raw.includes('epic') || raw.includes('에픽')) return 'epic';
    if (raw.includes('ultra') || raw.includes('초희귀')) return 'ultra';
    if (raw.includes('rare') || raw.includes('희귀')) return 'rare';
    return 'common';
  }
  function finalRarityColor(itemOrRef) { return RARITY_COLOR_FINAL[finalRarity(itemOrRef)] || RARITY_COLOR_FINAL.common; }

  function finalPrettyWeaponName(id, item) {
    item = item || (ITEMS && ITEMS[id]) || {};
    const lv = Number(item.reqLevel || item.level || 1);
    const kind = item.weaponType || (id && id.includes('dagger') ? 'dagger' : id && id.includes('bow') ? 'bow' : id && id.includes('staff') ? 'staff' : 'sword');
    const rarity = finalRarity(item);
    if (rarity === 'legendary') {
      if (kind === 'sword') return lv >= 50 ? '아르티온' : lv >= 25 ? '태양왕의 검' : '여명의 성검';
      if (kind === 'dagger') return lv >= 50 ? '그림자 심장' : lv >= 25 ? '달빛 단검' : '밤까마귀';
      if (kind === 'bow') return lv >= 50 ? '별사냥꾼' : lv >= 25 ? '바람왕의 활' : '새벽 장궁';
      if (kind === 'staff') return lv >= 50 ? '은하의 지팡이' : lv >= 25 ? '대현자의 홀' : '별빛 완드';
    }
    if (rarity === 'epic') {
      if (kind === 'sword') return lv >= 35 ? '용사의 검' : '기사의 검';
      if (kind === 'dagger') return lv >= 35 ? '암살자의 비수' : '그림자 단검';
      if (kind === 'bow') return lv >= 35 ? '숲수호자의 활' : '사냥꾼의 장궁';
      if (kind === 'staff') return lv >= 35 ? '룬술사의 지팡이' : '마도사의 완드';
    }
    if (rarity === 'rare' || rarity === 'ultra') {
      if (kind === 'sword') return lv >= 15 ? '강철 장검' : '견습 검';
      if (kind === 'dagger') return lv >= 15 ? '쌍날 단검' : '견습 단검';
      if (kind === 'bow') return lv >= 15 ? '강화 장궁' : '견습 활';
      if (kind === 'staff') return lv >= 15 ? '마력 지팡이' : '견습 지팡이';
    }
    if (kind === 'dagger') return '견습 단검';
    if (kind === 'bow') return '견습 활';
    if (kind === 'staff') return '나무 지팡이';
    return '견습 검';
  }

  finalSafeArr(Object.keys(typeof ITEMS !== 'undefined' ? ITEMS : {})).forEach(function (id) {
    const item = ITEMS[id];
    if (!item) return;
    if (item.type === 'weapon' || item.equipSlot === 'weapon') {
      item.name = finalPrettyWeaponName(id, item);
      if (!item.rarity) {
        const lv = Number(item.reqLevel || 1);
        item.rarity = lv >= 55 ? 'legendary' : lv >= 35 ? 'epic' : lv >= 22 ? 'ultra' : lv >= 10 ? 'rare' : 'common';
      }
    }
    if (item.type === 'armor' || item.equipSlot === 'armor') {
      const lv = Number(item.reqLevel || 1);
      if (!item.rarity) item.rarity = lv >= 55 ? 'legendary' : lv >= 35 ? 'epic' : lv >= 20 ? 'rare' : 'common';
      if (/armor_\d+/.test(id)) item.name = finalRarity(item) === 'legendary' ? '수호왕의 갑옷' : finalRarity(item) === 'epic' ? '용사의 흉갑' : finalRarity(item) === 'rare' ? '강철 갑옷' : '견습 갑옷';
    }
  });

  const __oldGetItemDisplayNameFinal = typeof getItemDisplayName === 'function' ? getItemDisplayName : null;
  getItemDisplayName = function getItemDisplayNameFinal(ref) {
    const item = finalItemData(ref);
    if (!item) return __oldGetItemDisplayNameFinal ? __oldGetItemDisplayNameFinal(ref) : String(finalItemId(ref) || '아이템');
    const plus = finalItemEnhance(ref);
    const r = finalRarity(item);
    const label = RARITY_LABEL_FINAL[r] || '일반';
    const name = item.name || finalPrettyWeaponName(finalItemId(ref), item);
    return (plus ? '+' + plus + ' ' : '') + '[' + label + '] ' + name;
  };

  function finalGroundYAt(x, currentY) {
    let best = game.ground || 610;
    finalSafeArr(game.platforms).forEach(function (pf) {
      if (!pf) return;
      if (x >= pf.x - 36 && x <= pf.x + pf.w + 36) {
        if ((currentY == null || pf.y >= currentY - 24) && pf.y < best) best = pf.y;
      }
    });
    return best;
  }

  const __oldUpdateCameraFinal = typeof updateCamera === 'function' ? updateCamera : null;
  updateCamera = function updateCameraFinal(dt) {
    const targetX = finalClamp(game.player.x - W * 0.42, 0, Math.max(0, game.width - W));
    game.cameraX += (targetX - (game.cameraX || 0)) * Math.min(1, dt * 8);
    // Negative cameraY moves the world down on screen. This keeps upper floors below the fixed HUD.
    const wanted = finalClamp((game.player.y || game.ground || 610) - H * 0.48, -260, 0);
    game.cameraY = (game.cameraY || 0) + (wanted - (game.cameraY || 0)) * Math.min(1, dt * 7);
  };

  const __oldUpdatePlayerFinal = typeof updatePlayer === 'function' ? updatePlayer : null;
  updatePlayer = function updatePlayerFinal(dt) {
    const ret = __oldUpdatePlayerFinal ? __oldUpdatePlayerFinal.apply(this, arguments) : undefined;
    if (game && game.player && game.player.y < -260) game.player.y = -260;
    return ret;
  };

  const __oldDrawFinal = typeof draw === 'function' ? draw : null;
  draw = function drawFinalCameraFollow() {
    ctx.clearRect(0, 0, W, H);
    if (!game.ready) {
      if (typeof drawMenuBackground === 'function') drawMenuBackground();
      if (typeof drawPreviews === 'function') drawPreviews();
      return;
    }
    const town = typeof getTown === 'function' ? getTown(game.townId) : { bgTop: '#7bd4ff', bgBottom: '#dff7ff' };
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, town.bgTop || '#7bd4ff');
    g.addColorStop(0.65, town.bgBottom || '#dff7ff');
    g.addColorStop(1, '#eaffce');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(-Math.floor(game.cameraX || 0), -Math.floor(game.cameraY || 0));
    if (typeof drawWorld === 'function') drawWorld();
    if (typeof drawPortals === 'function') drawPortals();
    if (typeof drawNPCs === 'function') drawNPCs();
    if (typeof drawDrops === 'function') drawDrops();
    if (typeof drawMonsters === 'function') drawMonsters();
    if (typeof drawProjectiles === 'function') drawProjectiles();
    if (typeof drawPlayer === 'function') drawPlayer(game.player, game.player.x, game.player.y, 0.74);
    // Remote players, redrawn with the same vertical camera so they no longer float over the HUD.
    const MP = window.PixelRpgMultiplayer;
    if (MP && MP.players) {
      const room = game.mode === 'hunt' ? 'hunt:' + game.huntId : 'town:' + game.townId;
      Object.keys(MP.players).forEach(function (id) {
        const entry = MP.players[id];
        if (!entry || entry.room !== room || !entry.state) return;
        const s = entry.state;
        const fake = {
          x: s.x || 0,
          y: finalGroundYAt(s.x || 0, s.y || 0),
          face: s.face || 1,
          anim: s.anim || 'idle',
          animTime: s.animTime || 0,
          hurtTime: 0,
          character: Object.assign({ name: entry.name || s.name || '유저', job: s.job || 'beginner', skin: '#ffd6a6', hair: '#2b160e', hairStyle: 'basic', faceStyle: 'normal' }, s.character || {})
        };
        ctx.globalAlpha = 0.9;
        drawPlayer(fake, fake.x, fake.y, 0.74);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#dbeafe';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText((s.name || entry.name || '유저') + ' Lv.' + (s.level || 1), fake.x, fake.y - 142);
      });
    }
    if (typeof drawParticles === 'function') drawParticles();
    if (typeof drawTexts === 'function') drawTexts();
    ctx.restore();

    if (typeof drawHUD === 'function') drawHUD();
    if (inventory && inventory.open && typeof drawInventoryPanel === 'function') drawInventoryPanel();
    if (stats && stats.open && typeof drawStatsPanel === 'function') drawStatsPanel();
    if (skills && skills.open && typeof drawSkillsPanel === 'function') drawSkillsPanel();
    if (quests && quests.open && typeof drawQuestsPanel === 'function') drawQuestsPanel();
    if (game.dialog && typeof drawDialog === 'function') drawDialog();
    if (game.taxiOpen && typeof drawTaxiPanel === 'function') drawTaxiPanel();
    if (game.shopOpen && typeof drawShopPanel === 'function') drawShopPanel();
    if (game.blacksmithOpen && typeof drawBlacksmithPanel === 'function') drawBlacksmithPanel();
    if (inventory && inventory.open && typeof drawItemTooltip === 'function') drawItemTooltip();
    if (typeof drawDraggedItem === 'function') drawDraggedItem();
  };

  function finalSetMonsterRespawn(m) {
    if (!m) return;
    const isElite = !!(m.isElite || m.isNamed || (m.type && (m.type.isElite || m.type.isNamed)));
    const ms = isElite ? 300000 : 10000;
    m.respawn = ms;
    if (m.type) m.type.respawn = ms;
  }

  const __oldSpawnMonstersFinal = typeof spawnMonsters === 'function' ? spawnMonsters : null;
  spawnMonsters = function spawnMonstersFinal(hunt) {
    const ret = __oldSpawnMonstersFinal ? __oldSpawnMonstersFinal.apply(this, arguments) : undefined;
    const seen = {};
    game.monsters = finalSafeArr(game.monsters).filter(function (m) {
      if (!m) return false;
      const elite = !!(m.isElite || m.isNamed || (m.type && (m.type.isElite || m.type.isNamed)));
      if (elite) {
        const key = (m.namedKey || m.name || m.family || 'elite') + ':' + (game.huntId || 'hunt');
        if (seen[key]) return false;
        seen[key] = true;
      }
      finalSetMonsterRespawn(m);
      m.y = finalGroundYAt(m.x || m.baseX || 0, m.y || game.ground);
      m.spawnY = m.y;
      m.canHitAt = 0;
      return true;
    });
    return ret;
  };

  const __oldKillMonsterFinal = typeof killMonster === 'function' ? killMonster : null;
  killMonster = function killMonsterFinal(m) {
    if (!m || m.__finalKilled) return;
    finalSetMonsterRespawn(m);
    const ret = __oldKillMonsterFinal ? __oldKillMonsterFinal.apply(this, arguments) : undefined;
    m.__finalKilled = true;
    m.dead = true;
    m.hp = 0;
    m.killedAt = finalNow();
    m.respawnAt = finalNow() + (m.respawn || ((m.isElite || m.isNamed) ? 300000 : 10000));
    m.canHitAt = m.respawnAt + 50;
    return ret;
  };

  const __oldUpdateMonstersFinal = typeof updateMonsters === 'function' ? updateMonsters : null;
  updateMonsters = function updateMonstersFinal(dt) {
    const ret = __oldUpdateMonstersFinal ? __oldUpdateMonstersFinal.apply(this, arguments) : undefined;
    const nowMs = finalNow();
    finalSafeArr(game.monsters).forEach(function (m) {
      if (!m) return;
      finalSetMonsterRespawn(m);
      if (m.dead) {
        if (!m.respawnAt) m.respawnAt = (m.killedAt || nowMs) + (m.respawn || 10000);
        if (nowMs >= m.respawnAt) {
          m.dead = false;
          m.__finalKilled = false;
          m.hp = m.maxHp || (m.type && m.type.hp) || 1;
          m.x = (m.baseX || m.x || 0) + Math.round(Math.random() * 80 - 40);
          m.y = finalGroundYAt(m.x, m.spawnY || m.y || game.ground);
          m.spawnY = m.y;
          m.canHitAt = nowMs + 60;
          m.hit = 0;
        }
      } else {
        m.y = finalGroundYAt(m.x || m.baseX || 0, m.y || game.ground);
      }
    });
    return ret;
  };

  const __oldDamageMonsterFinal = typeof damageMonster === 'function' ? damageMonster : null;
  damageMonster = function damageMonsterFinal(m, skill) {
    if (!m || m.dead) return;
    if (m.canHitAt && finalNow() < m.canHitAt) m.canHitAt = 0; // immediately hittable after visible respawn
    return __oldDamageMonsterFinal ? __oldDamageMonsterFinal.apply(this, arguments) : undefined;
  };

  const __oldMpSeedFinal = typeof mpMonsterSeed === 'function' ? mpMonsterSeed : null;
  if (__oldMpSeedFinal) {
    mpMonsterSeed = function mpMonsterSeedFinal() {
      return __oldMpSeedFinal.apply(this, arguments).map(function (m) {
        if (!m) return m;
        const named = !!m.isNamed || !!m.isElite;
        m.respawn = named ? 300000 : 10000;
        return m;
      });
    };
  }

  const MERCHANT_BUY_FINAL = ['hp_potion', 'hp_potion_small', 'hp_potion_mid', 'hp_potion_high', 'mp_potion', 'mp_potion_small', 'mp_potion_mid', 'mp_potion_high'].filter(function (id, i, arr) {
    return ITEMS && ITEMS[id] && arr.indexOf(id) === i;
  });
  game.shopTab = game.shopTab || 'buy';

  function finalSellPrice(ref) {
    const item = finalItemData(ref);
    if (!item) return 0;
    const rarityMul = { common: 1, rare: 1.25, ultra: 1.6, epic: 2.2, legendary: 3.2 }[finalRarity(item)] || 1;
    return Math.max(1, Math.floor((item.sell || Math.max(1, Math.floor((item.price || 20) * 0.35))) * rarityMul * (1 + finalItemEnhance(ref) * 0.12)));
  }
  function finalCanSell(ref) {
    const item = finalItemData(ref);
    if (!item) return false;
    return item.type === 'etc' || item.type === 'weapon' || item.type === 'armor' || item.type === 'equipment' || item.equipSlot;
  }
  function finalSellIndex(idx) {
    const ref = inventory.items[idx];
    if (!ref) return;
    if (!finalCanSell(ref)) { finalText('판매할 수 없는 아이템입니다', '#ff8787'); return; }
    const item = finalItemData(ref);
    const count = item.type === 'etc' ? Math.max(1, ref.count || 1) : 1;
    const gain = finalSellPrice(ref) * count;
    wallet.gold += gain;
    if (item.type === 'etc') inventory.items.splice(idx, 1);
    else {
      ref.count = Math.max(0, (ref.count || 1) - 1);
      if (ref.count <= 0) inventory.items.splice(idx, 1);
    }
    finalText((item.name || ref.id) + ' 판매 +' + finalMoney(gain), '#ffd43b');
    finalSaveSoon();
  }

  const __oldBuyItemFinal = typeof buyItem === 'function' ? buyItem : null;
  buyItem = function buyItemFinal(id) {
    const item = ITEMS && ITEMS[id];
    if (!item) return;
    if ((wallet.gold || 0) < (item.price || 0)) { finalText('돈이 부족합니다', '#ff8787'); return; }
    wallet.gold -= item.price || 0;
    if (typeof addItem === 'function') addItem(id, 1);
    finalText((item.name || id) + ' 구매', '#c0eb75');
    finalSaveSoon();
  };

  drawShopPanel = function drawShopPanelFinal() {
    const x = 70, y = 72, w = 1120, h = 610;
    ctx.fillStyle = 'rgba(15,23,42,0.97)'; finalRound(ctx, x, y, w, h, 18);
    ctx.strokeStyle = '#93c5fd'; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = '#ffe066'; ctx.font = 'bold 28px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(game.shopOpen === 'weapon' ? '장비 상점' : '상점', x + 28, y + 42);
    ctx.fillStyle = '#ffd43b'; ctx.font = 'bold 16px sans-serif'; ctx.fillText('보유: ' + finalMoney(wallet.gold || 0), x + 28, y + 70);

    if (game.shopOpen === 'merchant') {
      ctx.fillStyle = game.shopTab === 'buy' ? '#4dabf7' : '#334155'; finalRound(ctx, x + 300, y + 26, 120, 36, 8);
      ctx.fillStyle = game.shopTab === 'sell' ? '#4dabf7' : '#334155'; finalRound(ctx, x + 430, y + 26, 120, 36, 8);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('구매', x + 360, y + 49); ctx.fillText('판매', x + 490, y + 49);
    }

    const clipX = x + 28, clipY = y + 92, clipW = w - 56, clipH = 440;
    ctx.save(); ctx.beginPath(); ctx.rect(clipX, clipY, clipW, clipH); ctx.clip();
    const list = game.shopOpen === 'merchant' && game.shopTab === 'sell' ? inventory.items : (game.shopOpen === 'merchant' ? MERCHANT_BUY_FINAL : (typeof getShopItemsForCurrentTown === 'function' ? getShopItemsForCurrentTown() : []));
    const rowH = 68; const scroll = game.shopScroll || 0;
    list.forEach(function (entry, i) {
      const id = typeof entry === 'string' ? entry : finalItemId(entry);
      const item = finalItemData(entry) || (ITEMS && ITEMS[id]);
      if (!item) return;
      const col = i % 2; const row = Math.floor(i / 2);
      const rx = clipX + 16 + col * 520; const ry = clipY + 12 + row * rowH - scroll;
      if (ry < clipY - rowH || ry > clipY + clipH) return;
      const color = finalRarityColor(item);
      ctx.fillStyle = '#1e293b'; finalRound(ctx, rx, ry, 490, 56, 10);
      ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.strokeRect(rx, ry, 490, 56);
      if (typeof drawItemIcon === 'function') drawItemIcon(item, rx + 30, ry + 28, 34);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left'; ctx.fillText(finalGetShortName(entry, item), rx + 58, ry + 22);
      ctx.fillStyle = '#cbd5e1'; ctx.font = '12px sans-serif';
      const price = game.shopOpen === 'merchant' && game.shopTab === 'sell' ? ('판매가 ' + finalMoney(finalSellPrice(entry) * (item.type === 'etc' ? (entry.count || 1) : 1))) : ('가격 ' + finalMoney(item.price || 0));
      ctx.fillText((item.desc || '') + ' / ' + price, rx + 58, ry + 42);
      if (entry && entry.count > 1) { ctx.fillStyle = '#ffe066'; ctx.textAlign = 'right'; ctx.fillText('x' + entry.count, rx + 475, ry + 22); }
    });
    ctx.restore();
    const contentRows = Math.ceil(Math.max(1, list.length) / 2);
    const maxScroll = Math.max(0, contentRows * rowH + 30 - clipH);
    game.shopScroll = finalClamp(game.shopScroll || 0, 0, maxScroll);
    if (maxScroll > 0) {
      ctx.fillStyle = '#334155'; finalRound(ctx, x + w - 26, clipY, 10, clipH, 5);
      ctx.fillStyle = '#94a3b8'; finalRound(ctx, x + w - 26, clipY + (clipH - 60) * ((game.shopScroll || 0) / maxScroll), 10, 60, 5);
    }
    ctx.fillStyle = '#334155'; finalRound(ctx, x + w - 150, y + h - 52, 110, 38, 8);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('닫기', x + w - 95, y + h - 28);
  };

  function finalGetShortName(ref, item) {
    const s = (typeof getItemDisplayName === 'function') ? getItemDisplayName(ref) : (item && item.name) || finalItemId(ref);
    return s.length > 32 ? s.slice(0, 32) + '...' : s;
  }

  handleShopWheel = function handleShopWheelFinal(e) {
    if (!game.ready || !game.shopOpen) return;
    const pos = typeof getMouse === 'function' ? getMouse(e) : { x: 0, y: 0 };
    if (!finalHit(pos.x, pos.y, 70, 72, 1120, 610)) return;
    e.preventDefault();
    game.shopScroll = finalClamp((game.shopScroll || 0) + e.deltaY * 1.1, 0, 9999);
  };

  handleShopClick = function handleShopClickFinal(mx, my) {
    const x = 70, y = 72, w = 1120, h = 610;
    if (finalHit(mx, my, x + w - 150, y + h - 52, 110, 38)) { game.shopOpen = false; game.shopTab = 'buy'; game.shopScroll = 0; return; }
    if (game.shopOpen === 'merchant') {
      if (finalHit(mx, my, x + 300, y + 26, 120, 36)) { game.shopTab = 'buy'; game.shopScroll = 0; return; }
      if (finalHit(mx, my, x + 430, y + 26, 120, 36)) { game.shopTab = 'sell'; game.shopScroll = 0; return; }
    }
    const clipX = x + 28, clipY = y + 92, rowH = 68, scroll = game.shopScroll || 0;
    const list = game.shopOpen === 'merchant' && game.shopTab === 'sell' ? inventory.items : (game.shopOpen === 'merchant' ? MERCHANT_BUY_FINAL : (typeof getShopItemsForCurrentTown === 'function' ? getShopItemsForCurrentTown() : []));
    for (let i = 0; i < list.length; i++) {
      const rx = clipX + 16 + (i % 2) * 520; const ry = clipY + 12 + Math.floor(i / 2) * rowH - scroll;
      if (finalHit(mx, my, rx, ry, 490, 56)) {
        if (game.shopOpen === 'merchant' && game.shopTab === 'sell') finalSellIndex(i);
        else buyItem(list[i]);
        return;
      }
    }
  };

  function finalApplyNpcFloor(npc, index) {
    if (!npc) return;
    const x = Number(npc.x || 300 + index * 140);
    npc.y = finalGroundYAt(x, npc.y || game.ground);
  }

  const __oldLoadTownFinal = typeof loadTown === 'function' ? loadTown : null;
  loadTown = function loadTownFinal(townId) {
    const ret = __oldLoadTownFinal ? __oldLoadTownFinal.apply(this, arguments) : undefined;
    const townIndex = Math.max(0, finalSafeArr(TOWNS).findIndex(function (t) { return t.id === game.townId; }));
    const level = game.player && game.player.level || 1;
    const extra = [];
    // Common NPCs stay easy to find. Higher rarity NPCs appear later and farther away.
    if (level >= 8 && townIndex >= 2) extra.push({ type: 'job', rarity: 'rare', name: '청풍 검사 렌', x: 2120 + townIndex * 30, y: game.ground, quest: 'rare_sword_trial', text: '희귀 직업은 도시를 넘나드는 실전 시험을 요구합니다.' });
    if (level >= 18 && townIndex >= 5) extra.push({ type: 'job', rarity: 'epic', name: '붉은 서약자 카이론', x: 3020 + townIndex * 35, y: game.ground, quest: 'epic_oath_trial', text: '에픽 직업은 엘리트 몬스터의 증표와 높은 전투력을 요구합니다.' });
    if (level >= 25 && townIndex >= 7) {
      extra.push({ type: 'job', rarity: 'hidden', hiddenJob: 'dragon_knight', requiredScroll: 'dragon_knight_scroll', name: '용혈 감시자 세르칸', x: 3650, y: game.ground, quest: 'dragon_knight_hidden', text: '용기사의 양피지를 가진 자만 용의 시험을 시작할 수 있습니다.' });
      extra.push({ type: 'job', rarity: 'hidden', hiddenJob: 'shadow_reaper', requiredScroll: 'shadow_reaper_scroll', name: '검은 달의 사신 모르트', x: 3920, y: game.ground, quest: 'shadow_reaper_hidden', text: '그림자 사신의 양피지를 가져오면 밤의 시험을 열어주지.' });
      extra.push({ type: 'job', rarity: 'hidden', hiddenJob: 'star_sage', requiredScroll: 'star_sage_scroll', name: '별빛 예언자 루미엘', x: 4190, y: game.ground, quest: 'star_sage_hidden', text: '별의 현자의 양피지가 별문을 여는 열쇠입니다.' });
    }
    extra.forEach(function (npc) { if (!game.npcs.some(function (n) { return n.name === npc.name; })) game.npcs.push(npc); });
    finalSafeArr(game.npcs).forEach(finalApplyNpcFloor);
    return ret;
  };

  const __oldInteractFinal = typeof interact === 'function' ? interact : null;
  interact = function interactFinal() {
    const near = finalSafeArr(game.npcs).find(function (n) { return Math.abs((game.player.x || 0) - (n.x || 0)) < 90 && Math.abs((game.player.y || 0) - (n.y || game.ground)) < 130; });
    if (near && near.requiredScroll && typeof countItem === 'function' && countItem(near.requiredScroll) <= 0) {
      game.dialog = {
        title: near.name,
        text: '[' + (near.rarity === 'hidden' ? '히든' : '전직') + '] ' + near.text + '\n\n필요 아이템: ' + (ITEMS[near.requiredScroll] ? ITEMS[near.requiredScroll].name : near.requiredScroll) + '\n엘리트 몬스터에게서 낮은 확률로 얻을 수 있습니다.',
        buttons: [{ label: '닫기', action: function () { game.dialog = null; } }]
      };
      return;
    }
    return __oldInteractFinal ? __oldInteractFinal.apply(this, arguments) : undefined;
  };

  const __oldDrawItemIconFinal = typeof drawItemIcon === 'function' ? drawItemIcon : null;
  drawItemIcon = function drawItemIconFinal(itemOrIcon, x, y, size) {
    const item = typeof itemOrIcon === 'object' && itemOrIcon ? itemOrIcon : (ITEMS && ITEMS[itemOrIcon]) || null;
    const s = size || 24;
    const rarity = finalRarity(item || {});
    const color = finalRarityColor(item || {});
    ctx.save(); ctx.translate(x, y);
    ctx.shadowColor = color; ctx.shadowBlur = rarity === 'legendary' ? 14 : rarity === 'epic' ? 9 : 0;
    ctx.fillStyle = 'rgba(15,23,42,0.80)'; finalRound(ctx, -s * .48, -s * .48, s * .96, s * .96, s * .14);
    ctx.strokeStyle = color; ctx.lineWidth = Math.max(1.5, s * .07); ctx.strokeRect(-s * .48, -s * .48, s * .96, s * .96);
    const id = String((item && item.id) || itemOrIcon || '').toLowerCase();
    const kind = item && (item.weaponType || item.equipSlot || item.type) || id;
    function star(cx, cy, r) { ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5; const rr = i % 2 ? r * .45 : r; const px = cx + Math.cos(a) * rr; const py = cy + Math.sin(a) * rr; if (i) ctx.lineTo(px, py); else ctx.moveTo(px, py); } ctx.closePath(); ctx.fill(); }
    if (kind === 'sword' || id.includes('sword')) {
      ctx.strokeStyle = '#111827'; ctx.lineWidth = s * .15; ctx.beginPath(); ctx.moveTo(-s*.28,s*.30); ctx.lineTo(s*.30,-s*.34); ctx.stroke();
      ctx.strokeStyle = color; ctx.lineWidth = s * .09; ctx.beginPath(); ctx.moveTo(-s*.24,s*.25); ctx.lineTo(s*.27,-s*.30); ctx.stroke();
      ctx.fillStyle = rarity === 'legendary' ? '#f59e0b' : '#8b5cf6'; star(s*.22,-s*.28,s*.08);
    } else if (kind === 'dagger' || id.includes('dagger')) {
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(s*.12,-s*.35); ctx.lineTo(s*.22,-s*.04); ctx.lineTo(-s*.08,s*.24); ctx.lineTo(-s*.18,s*.12); ctx.lineTo(s*.03,-s*.05); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#111827'; finalRound(ctx, -s*.22, s*.16, s*.18, s*.08, 2);
    } else if (kind === 'bow' || id.includes('bow')) {
      ctx.strokeStyle = color; ctx.lineWidth = s*.1; ctx.beginPath(); ctx.arc(-s*.05,0,s*.34,-1.1,1.1); ctx.stroke(); ctx.strokeStyle='#fff'; ctx.lineWidth=s*.035; ctx.beginPath(); ctx.moveTo(s*.1,-s*.29); ctx.lineTo(s*.1,s*.29); ctx.stroke();
    } else if (kind === 'staff' || id.includes('staff')) {
      ctx.strokeStyle = '#7c3f1d'; ctx.lineWidth = s*.09; ctx.beginPath(); ctx.moveTo(-s*.25,s*.32); ctx.lineTo(s*.18,-s*.27); ctx.stroke(); ctx.fillStyle=color; finalCircle(ctx,s*.23,-s*.31,s*.13); ctx.fillStyle='#fff'; finalCircle(ctx,s*.24,-s*.32,s*.05);
    } else if (kind === 'armor' || kind === 'helmet' || id.includes('armor')) {
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0,-s*.34); ctx.lineTo(s*.30,-s*.12); ctx.lineTo(s*.23,s*.33); ctx.lineTo(-s*.23,s*.33); ctx.lineTo(-s*.30,-s*.12); ctx.closePath(); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.35)'; finalRound(ctx,-s*.12,-s*.12,s*.24,s*.08,2);
    } else if (id.includes('potion')) {
      ctx.fillStyle = id.includes('mp') ? '#60a5fa' : '#fb7185'; ctx.beginPath(); ctx.ellipse(0,s*.08,s*.18,s*.25,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#e5e7eb'; finalRound(ctx,-s*.08,-s*.30,s*.16,s*.15,2);
    } else {
      ctx.fillStyle = color; ctx.beginPath(); ctx.moveTo(0,-s*.30); ctx.lineTo(s*.25,0); ctx.lineTo(0,s*.30); ctx.lineTo(-s*.25,0); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  };

  const __oldDrawItemBoxFinal = typeof drawItemBox === 'function' ? drawItemBox : null;
  drawItemBox = function drawItemBoxFinal(x, y) {
    const beforeStroke = ctx.strokeStyle;
    if (__oldDrawItemBoxFinal) return __oldDrawItemBoxFinal.apply(this, arguments);
    ctx.fillStyle = '#111827'; finalRound(ctx, x, y, 52, 52, 7); ctx.strokeStyle = '#475569'; ctx.strokeRect(x, y, 52, 52); ctx.strokeStyle = beforeStroke;
  };

  const __oldDrawWeaponFinal = typeof drawWeapon === 'function' ? drawWeapon : null;
  drawWeapon = function drawWeaponFinal(c, weaponId, handX, handY, attacking, attackKind, animTime) {
    if (!weaponId) return;
    const item = ITEMS && ITEMS[weaponId] || {};
    const rarity = finalRarity(item);
    const color = finalRarityColor(item);
    const kind = attackKind || item.weaponType || (weaponId.includes('staff') ? 'staff' : weaponId.includes('bow') ? 'bow' : weaponId.includes('dagger') ? 'dagger' : 'sword');
    const t = attacking ? Math.sin(Math.min(1, (animTime || 0) * 14) * Math.PI) : 0;
    const lv = Number(item.reqLevel || 1);
    const len = 34 + Math.min(32, lv * 0.7) + (rarity === 'legendary' ? 14 : rarity === 'epic' ? 8 : 0);
    c.save(); c.translate(handX, handY);
    if (kind === 'dagger') c.rotate(attacking ? 0.65 + t * 0.55 : -0.45);
    else if (kind === 'bow') c.rotate(attacking ? -0.05 : -0.28);
    else if (kind === 'staff') c.rotate(attacking ? -0.70 + t * 0.35 : -0.35);
    else c.rotate(attacking ? -1.25 + t * 1.65 : -0.35);
    c.shadowColor = color; c.shadowBlur = rarity === 'legendary' ? 16 : rarity === 'epic' ? 10 : 0;
    if (kind === 'staff') {
      c.strokeStyle = '#2b160e'; c.lineWidth = 6; c.beginPath(); c.moveTo(0, 12); c.lineTo(0, -len); c.stroke();
      c.strokeStyle = color; c.lineWidth = 3; c.beginPath(); c.moveTo(0, 9); c.lineTo(0, -len + 4); c.stroke();
      c.fillStyle = color; finalCircle(c, 0, -len - 8, rarity === 'legendary' ? 12 : 8); c.fillStyle = '#fff'; finalCircle(c, 0, -len - 9, 3);
    } else if (kind === 'bow') {
      c.strokeStyle = color; c.lineWidth = 5; c.beginPath(); c.arc(0, -8, len * .45, -Math.PI / 2, Math.PI / 2); c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0,-len*.48); c.lineTo(attacking ? -14 - t*10 : 0,-8); c.lineTo(0,len*.33); c.stroke();
    } else if (kind === 'dagger') {
      c.fillStyle = color; c.beginPath(); c.moveTo(0, -len); c.lineTo(8, -18); c.lineTo(-8, -18); c.closePath(); c.fill(); c.fillStyle = '#111827'; finalRound(c,-4,-18,8,24,2); c.fillStyle='#fff8'; c.fillRect(-1,-len+6,2,len-30);
    } else {
      c.fillStyle = color; c.beginPath(); c.moveTo(0, -len); c.lineTo(12, -len * .55); c.lineTo(5, -18); c.lineTo(-5, -18); c.lineTo(-12, -len * .55); c.closePath(); c.fill(); c.fillStyle = '#fff9'; c.fillRect(-2, -len + 8, 3, len - 30); c.fillStyle = '#7c2d12'; finalRound(c,-5,-17,10,26,3);
    }
    if (attacking && (rarity === 'epic' || rarity === 'legendary')) {
      c.strokeStyle = color; c.lineWidth = 3; c.beginPath(); c.arc(0, -20, 30 + t * 20, -0.2, 1.8); c.stroke();
    }
    c.restore();
  };

  // Mobile: compact groups and PC-equivalent buttons.
  function finalRebuildTouch() {
    if (!('ontouchstart' in window) && window.innerWidth > 900) return;
    let root = document.getElementById('prg-touch-ui-final');
    if (root) return;
    root = document.createElement('div'); root.id = 'prg-touch-ui-final';
    root.innerHTML = '<div class="prg-left"><button data-k="a">◀</button><button data-k="d">▶</button><button data-k=" ">점프</button><button data-k="s">하강</button></div><div class="prg-right"><button data-t="attack">공격</button><button data-k="k">K</button><button data-k="l">L</button><button data-k=";">;</button><button data-k="e">대화</button><button data-k="z">줍기</button></div><div class="prg-menu"><button data-k="m">가방</button><button data-k="c">스탯</button><button data-k="u">스킬</button><button data-k="q">퀘스트</button><button data-k="r">저장</button><button data-t="chat">채팅</button></div>';
    const style = document.createElement('style');
    style.textContent = '#prg-touch-ui-final{position:fixed;left:0;right:0;bottom:0;z-index:50;pointer-events:none;font-family:sans-serif}#prg-touch-ui-final div{position:absolute;display:flex;gap:6px;pointer-events:auto}#prg-touch-ui-final button{border:1px solid #93c5fd;background:rgba(15,23,42,.72);color:#fff;border-radius:10px;font-weight:800;font-size:14px;min-width:46px;min-height:42px;backdrop-filter:blur(4px)}#prg-touch-ui-final .prg-left{left:12px;bottom:14px}#prg-touch-ui-final .prg-right{right:12px;bottom:14px}#prg-touch-ui-final .prg-menu{left:50%;transform:translateX(-50%);bottom:66px}@media(max-width:720px){#prg-touch-ui-final button{min-width:40px;min-height:38px;font-size:12px}#prg-touch-ui-final .prg-menu{bottom:112px;flex-wrap:wrap;width:260px;justify-content:center}}';
    document.head.appendChild(style); document.body.appendChild(root);
    root.querySelectorAll('button').forEach(function (b) {
      const key = b.getAttribute('data-k'); const task = b.getAttribute('data-t');
      const down = function (ev) { ev.preventDefault(); ev.stopPropagation(); if (key) { keys.add(key); setTimeout(function(){ keys.delete(key); }, key === 'a' || key === 'd' || key === ' ' || key === 's' ? 180 : 80); } if (task === 'attack' && typeof basicAttack === 'function') basicAttack(); if (task === 'chat' && typeof mpOpenChat === 'function') mpOpenChat(); };
      b.addEventListener('touchstart', down, { passive: false }); b.addEventListener('mousedown', down);
    });
  }
  setTimeout(finalRebuildTouch, 500);

  finalText('카메라/상점/리스폰/장비 보정 적용', '#9bf6ff');
})();


/* =========================================================
   VISIBILITY / ELITE / JOB NPC / ITEM ICON / CLEAN TOWN PATCH 01
   - Guarantees elite monsters appear in every hunt
   - Guarantees class-change NPCs appear with town/rank-specific names/positions
   - Cleans duplicate/overlapping town floors
   - Makes item icons visually distinct by weapon/armor/rarity/name
========================================================= */
(function(){
  'use strict';
  if (window.__PIXEL_RPG_VISIBILITY_ELITE_JOB_ITEM_CLEAN_PATCH_01__) return;
  window.__PIXEL_RPG_VISIBILITY_ELITE_JOB_ITEM_CLEAN_PATCH_01__ = true;

  function A(v){ return Array.isArray(v) ? v : []; }
  function C(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function now(){ return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
  function text(msg,color){ try { if (typeof addFloatingText === 'function') addFloatingText(msg, game.player.x, game.player.y-100, color||'#fff'); } catch(_){} }
  function hash(s){ s=String(s||''); let h=0; for(let i=0;i<s.length;i++) h=((h<<5)-h+s.charCodeAt(i))|0; return Math.abs(h); }
  function rr(c,x,y,w,h,r){ if (typeof roundRect === 'function') return roundRect(c,x,y,w,h,r); c.beginPath(); c.rect(x,y,w,h); c.fill(); }
  function circ(c,x,y,r){ if (typeof circle === 'function') return circle(c,x,y,r); c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }
  function rarityOf(item){
    const r = String((item && (item.rarity || item.grade)) || '').toLowerCase();
    if (/legend|레전/.test(r)) return 'legendary';
    if (/epic|에픽/.test(r)) return 'epic';
    if (/ultra|초희귀/.test(r)) return 'unique';
    if (/rare|희귀/.test(r)) return 'rare';
    return 'common';
  }
  function rarityColor(item){ return ({common:'#9ca3af', rare:'#38bdf8', unique:'#22d3ee', epic:'#a855f7', legendary:'#facc15'})[rarityOf(item)] || '#9ca3af'; }
  function townIndex(id){ const order=['lumina','greenwood','ellenium','valor','shadowport','sylvania','irondeep','frosthall','solas','nocturn']; const i=order.indexOf(id||game.townId||'lumina'); return i<0?0:i; }

  function cleanTownPlatforms(){
    const w = Math.max(4700, game.width || 4700);
    return [
      {x:0,y:game.ground,w:w,h:24,floor:0,townFloor:true,solidFloor:true},
      {x:260,y:455,w:820,h:24,floor:1,townFloor:true,solidFloor:true},
      {x:1520,y:455,w:900,h:24,floor:1,townFloor:true,solidFloor:true},
      {x:3000,y:455,w:920,h:24,floor:1,townFloor:true,solidFloor:true},
      {x:700,y:300,w:900,h:24,floor:2,townFloor:true,solidFloor:true},
      {x:2380,y:300,w:940,h:24,floor:2,townFloor:true,solidFloor:true}
    ];
  }
  function cleanTownLadders(){
    return [
      {x:420,y1:455,y2:game.ground,town:true},
      {x:860,y1:300,y2:455,town:true},
      {x:1740,y1:455,y2:game.ground,town:true},
      {x:2600,y1:300,y2:455,town:true},
      {x:3240,y1:455,y2:game.ground,town:true}
    ];
  }
  function floorForLevel(level,x){
    const p = cleanTownPlatforms().filter(p=>p.floor===level && (x===undefined || (x>=p.x-80 && x<=p.x+p.w+80)))[0] || cleanTownPlatforms()[0];
    return p.y;
  }

  const oldDrawTownObjects = typeof drawTownObjects === 'function' ? drawTownObjects : null;
  window.drawTownObjects = drawTownObjects = function drawTownObjectsCleaned(town){
    const theme = town && town.theme || 'grass';
    const houses = [
      {x:150,y:game.ground,scale:1.0},{x:1180,y:game.ground,scale:.95},{x:2500,y:game.ground,scale:1.05},{x:3900,y:game.ground,scale:.95},
      {x:520,y:455,scale:.75},{x:1880,y:455,scale:.78},{x:3360,y:455,scale:.78},
      {x:1030,y:300,scale:.68},{x:2820,y:300,scale:.68}
    ];
    houses.forEach(function(h,i){
      ctx.save(); ctx.translate(h.x,h.y); ctx.scale(h.scale,h.scale); ctx.translate(-h.x,-h.y);
      try {
        if (theme==='magic' && typeof drawMagicTower==='function') drawMagicTower(h.x,h.y);
        else if (theme==='fortress' && typeof drawCastleWall==='function') drawCastleWall(h.x,h.y);
        else if (theme==='port' && typeof drawPortHouse==='function') drawPortHouse(h.x,h.y);
        else if (theme==='mine' && typeof drawMineEntrance==='function') drawMineEntrance(h.x,h.y);
        else if (theme==='ice' && typeof drawIceHouse==='function') drawIceHouse(h.x,h.y);
        else if (theme==='desert' && typeof drawDesertHouse==='function') drawDesertHouse(h.x,h.y);
        else if (theme==='ruin' && typeof drawRuin==='function') drawRuin(h.x,h.y);
        else if (typeof drawHouse==='function') drawHouse(h.x,h.y,theme);
      } catch(_) { if (oldDrawTownObjects && i===0) oldDrawTownObjects(town); }
      ctx.restore();
    });
    [320,760,1440,2220,3100,4180].forEach(function(x){ try { if (typeof drawTree==='function') drawTree(x, game.ground, theme); } catch(_){} });
  };

  const JOB_NPC_BY_TOWN = {
    lumina:[
      {name:'초보 교관 모란', job:'warrior', type:'job', quest:'job_warrior', label:'일반', x:430, level:0, color:'#9ca3af'},
      {name:'바람궁수 리아', job:'archer', type:'job', quest:'job_archer', label:'일반', x:940, level:1, color:'#9ca3af'}
    ],
    greenwood:[
      {name:'숲의 도적 카린', job:'rogue', type:'job', quest:'job_rogue', label:'일반', x:530, level:1, color:'#9ca3af'},
      {name:'성창 수련관 노아', job:'lancer', type:'job', quest:'job_lancer', label:'레어', x:1320, level:2, color:'#38bdf8'}
    ],
    ellenium:[
      {name:'룬마법사 에일라', job:'mage', type:'job', quest:'job_mage', label:'일반', x:780, level:1, color:'#9ca3af'},
      {name:'소환학자 페린', job:'summoner', type:'job', quest:'job_summoner', label:'레어', x:2700, level:2, color:'#38bdf8'}
    ],
    valor:[
      {name:'성기사단장 브론', job:'paladin', type:'job', quest:'job_paladin', label:'레어', x:680, level:1, color:'#38bdf8'},
      {name:'광전사 우르칸', job:'berserker', type:'job', quest:'job_berserker', label:'레어', x:2880, level:2, color:'#38bdf8'}
    ],
    shadowport:[
      {name:'총잡이 레오', job:'gunslinger', type:'job', quest:'job_gunslinger', label:'에픽', x:560, level:1, color:'#a855f7'},
      {name:'밤의 음유시인 세라', job:'bard', type:'job', quest:'job_bard', label:'에픽', x:2700, level:2, color:'#a855f7'}
    ],
    sylvania:[
      {name:'정화의 성직자 미엘', job:'cleric', type:'job', quest:'job_cleric', label:'레어', x:880, level:1, color:'#38bdf8'},
      {name:'기계공 길드장 렌치', job:'mechanic', type:'job', quest:'job_mechanic', label:'에픽', x:3060, level:2, color:'#a855f7'}
    ],
    irondeep:[
      {name:'용혈 감시자 세르칸', job:'dragon_knight', hiddenJob:'dragon_knight', type:'hidden_job', quest:'hidden_dragon_knight', label:'히든', x:3160, level:2, color:'#ffffff', requires:'용기사 전직의 양피지'},
      {name:'강철 심판관 오르딘', job:'crusader', type:'job', quest:'job_crusader', label:'에픽', x:760, level:1, color:'#a855f7'}
    ],
    frosthall:[
      {name:'별빛 예언자 루미엘', job:'star_sage', hiddenJob:'star_sage', type:'hidden_job', quest:'hidden_star_sage', label:'히든', x:2860, level:2, color:'#ffffff', requires:'별의 현자 전직의 양피지'},
      {name:'서리 비숍 엘린', job:'bishop', type:'job', quest:'job_bishop', label:'에픽', x:560, level:1, color:'#a855f7'}
    ],
    solas:[
      {name:'태양 저격대장 카이든', job:'sniper_captain', type:'job', quest:'job_sniper_captain', label:'에픽', x:920, level:1, color:'#a855f7'}
    ],
    nocturn:[
      {name:'검은 달의 사도 네이라', job:'shadow_reaper', hiddenJob:'shadow_reaper', type:'hidden_job', quest:'hidden_shadow_reaper', label:'히든', x:3020, level:2, color:'#ffffff', requires:'그림자 사신 전직의 양피지'},
      {name:'공허의 전승자 로엔', job:'void_archer', type:'job', quest:'job_void_archer', label:'에픽', x:690, level:1, color:'#a855f7'}
    ]
  };

  function ensureQuestForNpc(npc){
    if (!window.QUESTS || !npc || !npc.quest) return;
    if (!QUESTS[npc.quest]) {
      const idx=townIndex(game.townId), rare = npc.label || '일반';
      QUESTS[npc.quest] = {
        id:npc.quest, title:'['+rare+'] '+npc.name+'의 전직 시험', npc:npc.name, town:game.townId,
        desc:(npc.requires? npc.requires+'를 소지한 뒤 ':'') + npc.name + '이 주는 전직 시험입니다.',
        jobReward:npc.job || npc.hiddenJob,
        goals:[{type:'kill', family:'any', need:npc.hiddenJob?22+idx*3:8+idx*2, count:0}],
        rewardGold:500+idx*180, rewardExp:500+idx*240,
        rarity:rare, requiredItem:npc.requires || null
      };
    } else {
      QUESTS[npc.quest].npc = npc.name; QUESTS[npc.quest].town = game.townId; QUESTS[npc.quest].jobReward = QUESTS[npc.quest].jobReward || npc.job || npc.hiddenJob; if (npc.requires) QUESTS[npc.quest].requiredItem = npc.requires;
    }
  }
  function addVisibleJobNpcs(){
    if (!game || !Array.isArray(game.npcs) || game.mode !== 'town') return;
    const allowed = JOB_NPC_BY_TOWN[game.townId] || [];
    const allowedNames = new Set(allowed.map(n=>n.name));
    game.npcs = game.npcs.filter(function(n){
      if (!n) return false;
      if (!(n.type==='job' || n.type==='hidden_job' || n.hiddenJob || /아르딘|루미엘|사신|전직/.test(String(n.name||'')))) return true;
      return allowedNames.has(n.name);
    });
    const existing = new Set(game.npcs.map(n=>n.name));
    allowed.forEach(function(t){
      ensureQuestForNpc(t);
      if (existing.has(t.name)) return;
      const npc = Object.assign({}, t);
      npc.y = floorForLevel(t.level || 0, t.x);
      npc.yLevel = t.level || 0;
      npc.text = (t.hiddenJob ? '나는 '+t.label+' 전직을 감시한다. ' + (t.requires||'전직 양피지') + '를 가져오면 시험을 열어주겠다.' : t.label+' 전직 시험을 맡고 있다. 이 도시의 시험을 통과하면 새로운 길을 열어주겠다.');
      npc.uniqueNpc = true;
      game.npcs.push(npc);
    });
  }

  const oldLoadTown = typeof loadTown === 'function' ? loadTown : null;
  if (oldLoadTown) window.loadTown = loadTown = function(id){
    const ret = oldLoadTown.apply(this, arguments);
    try { game.mode='town'; game.width=Math.max(game.width||0,4700); game.platforms=cleanTownPlatforms(); game.ladders=cleanTownLadders(); addVisibleJobNpcs(); setTimeout(addVisibleJobNpcs, 60); } catch(e){ console.error('[clean town/job npc patch]', e); }
    return ret;
  };

  const ELITE_BY_TOWN_PATCH = {
    lumina:[['킹 슬라임','slime','#50e26d','slime','dragon_seal',8],['고대 잎새정령','spirit','#7ddf70','spirit','star_seal',9]],
    greenwood:[['이끼엄니 보로스','boar','#7a5c36','boar','dragon_seal',16],['가시왕 벌레','bug','#70c45b','bug','shadow_seal',17]],
    ellenium:[['마나 폭풍 위습','spirit','#8b5cf6','spirit','star_seal',24],['룬포자 현자','mushroom','#67e8f9','mushroom','star_seal',25]],
    valor:[['철갑 돌진왕','boar','#8b735b','boar','dragon_seal',32],['방패 골렘 그란','golem','#94a3b8','golem','dragon_seal',33]],
    shadowport:[['검은 부두의 라트','bug','#4b3869','bug','shadow_seal',40],['야월 박쥐 네크','spirit','#5b21b6','spirit','shadow_seal',41]],
    sylvania:[['꽃독 여왕 베라','bug','#db2777','bug','star_seal',48],['나무비늘 라그','lizard','#6b8e3b','lizard','dragon_seal',49]],
    irondeep:[['용철 골렘 바르칸','golem','#64748b','golem','dragon_seal',58],['증기눈 코어','spirit','#94a3b8','spirit','star_seal',59]],
    frosthall:[['서리늑대 알카','lizard','#93c5fd','lizard','dragon_seal',68],['빙결 구체 노엘','spirit','#bfdbfe','spirit','star_seal',69]],
    solas:[['태양전갈 라샤','bug','#f59e0b','bug','shadow_seal',78],['모래용 비늘주인','lizard','#d97706','lizard','dragon_seal',79]],
    nocturn:[['폐허갑주 모로스','golem','#52525b','golem','shadow_seal',90],['저주핵 아비스','spirit','#7c3aed','spirit','star_seal',91]]
  };
  function typeForElite(def, hunt){
    const t = { family:def[1], name:'<'+def[0]+'>', color:def[2], shape:def[3], level:Math.max(def[5], (hunt&&hunt.baseLevel||1)+6), drop:def[4], isElite:true, isNamed:true, gimmick:def[3]==='boar'||def[3]==='lizard'?'charge':def[3]==='spirit'?'ranged':def[3]==='bug'?'poison':def[3]==='golem'?'stun':'split' };
    const lv=t.level; t.hp=220+lv*34; t.maxHp=t.hp; t.atk=10+Math.floor(lv*1.3); t.exp=180+lv*34; t.gold=200+lv*20; t.dropRate=.85; t.respawn=300000; return t;
  }
  function ensureElites(){
    if (!game || game.mode !== 'hunt' || !Array.isArray(game.monsters)) return;
    const hunt = (typeof getHunt==='function') ? getHunt(game.huntId) : null;
    const town = (hunt && hunt.town) || game.townId || 'lumina';
    const defs = ELITE_BY_TOWN_PATCH[town] || ELITE_BY_TOWN_PATCH.lumina;
    const existing = new Set(game.monsters.filter(m=>m&&(m.isElite||m.isNamed)).map(m=>String(m.name || (m.type&&m.type.name) || '')));
    const floors = A(game.platforms).filter(p=>p.huntFloor || p.solidFloor).sort((a,b)=>b.y-a.y);
    defs.slice(0,2).forEach(function(def,i){
      const nm='<'+def[0]+'>'; if (existing.has(nm)) return;
      const pf=floors[(i*2+1)%Math.max(1,floors.length)] || {x:200,y:game.ground,w:800};
      const x=C(pf.x+Math.round(pf.w*(.35+i*.25)), pf.x+50, pf.x+pf.w-50);
      const type=typeForElite(def,hunt);
      const m={ uid:'elite-visible:'+town+':'+i, id:'elite-visible:'+town+':'+i, name:nm, isElite:true, isNamed:true, type:type, x:x, baseX:x, y:pf.y, spawnY:pf.y, floorY:pf.y, platformX1:pf.x+30, platformX2:pf.x+pf.w-30, hp:type.hp, maxHp:type.hp, face:i?1:-1, time:Math.random()*3, hit:0, dead:false, aggro:false, gimmick:type.gimmick, respawn:300000, canHitAt:0 };
      if (typeof setupMonsterAI === 'function') try{ setupMonsterAI(m, 100+i); }catch(_){}
      game.monsters.push(m);
    });
  }
  const oldLoadHuntPatch = typeof loadHunt === 'function' ? loadHunt : null;
  if (oldLoadHuntPatch) window.loadHunt = loadHunt = function(){
    const ret = oldLoadHuntPatch.apply(this, arguments);
    try { ensureElites(); if (typeof mpMonsterSeed === 'function') setTimeout(function(){ try{ if (typeof mpSyncLocalMonsterIds === 'function') mpSyncLocalMonsterIds(); }catch(_){} }, 120); } catch(e){ console.error('[elite visible patch]',e); }
    return ret;
  };
  const oldUpdateMonstersPatch = typeof updateMonsters === 'function' ? updateMonsters : null;
  window.updateMonsters = updateMonsters = function(dt){ const ret = oldUpdateMonstersPatch ? oldUpdateMonstersPatch.apply(this, arguments) : undefined; try { ensureElites(); } catch(_){} return ret; };

  const oldDrawMonster = typeof drawMonster === 'function' ? drawMonster : null;
  if (oldDrawMonster) window.drawMonster = drawMonster = function(m){
    oldDrawMonster.apply(this, arguments);
    if (m && (m.isElite || m.isNamed)) {
      ctx.save(); ctx.translate(m.x - camera.x, m.y - 84); ctx.textAlign='center'; ctx.font='bold 15px sans-serif'; ctx.fillStyle='#111827'; rr(ctx,-72,-18,144,24,8); ctx.fillStyle='#facc15'; ctx.fillText(m.name || (m.type&&m.type.name) || '<엘리트>',0,0); ctx.restore();
    }
  };

  window.drawItemIcon = drawItemIcon = function drawItemIconDistinct(itemOrIcon,x,y,size){
    const item = typeof itemOrIcon === 'object' && itemOrIcon ? itemOrIcon : (window.ITEMS && ITEMS[itemOrIcon]) || { id:String(itemOrIcon||'item') };
    const id=String(item.id||item.name||itemOrIcon||'item'); const h=hash(id); const s=size||28; const r=rarityOf(item), col=rarityColor(item); const kind=String(item.weaponType||item.equipSlot||item.type||id).toLowerCase();
    ctx.save(); ctx.translate(x,y); ctx.shadowColor=col; ctx.shadowBlur=r==='legendary'?18:r==='epic'?12:r==='unique'?8:0; ctx.fillStyle='rgba(15,23,42,.86)'; rr(ctx,-s*.5,-s*.5,s,s,Math.max(4,s*.13)); ctx.strokeStyle=col; ctx.lineWidth=Math.max(2,s*.08); ctx.strokeRect(-s*.5,-s*.5,s,s);
    const hue=['#e5e7eb','#60a5fa','#a78bfa','#fb7185','#facc15','#34d399','#f97316'][h%7];
    if (kind.includes('sword')||id.includes('검')) { ctx.rotate((h%9-4)*.025); ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(0,-s*.45); ctx.lineTo(s*(.13+(h%4)*.025),-s*.08); ctx.lineTo(s*.05,s*.34); ctx.lineTo(-s*.05,s*.34); ctx.lineTo(-s*(.13+(h%3)*.025),-s*.08); ctx.closePath(); ctx.fill(); ctx.fillStyle='#fff8'; ctx.fillRect(-1,-s*.36,2,s*.48); ctx.fillStyle=hue; rr(ctx,-s*.22,s*.12,s*.44,s*.08,2); }
    else if (kind.includes('dagger')||id.includes('단검')) { ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(s*.18,-s*.42); ctx.lineTo(s*.28,-s*.02); ctx.lineTo(-s*.12,s*.34); ctx.lineTo(-s*.24,s*.20); ctx.lineTo(s*.04,-s*.08); ctx.closePath(); ctx.fill(); ctx.fillStyle=hue; rr(ctx,-s*.28,s*.18,s*.18,s*.10,2); }
    else if (kind.includes('bow')||id.includes('활')) { ctx.strokeStyle=col; ctx.lineWidth=s*.10; ctx.beginPath(); ctx.arc(-s*.06,0,s*.36,-1.20,1.20); ctx.stroke(); ctx.strokeStyle=hue; ctx.lineWidth=s*.04; ctx.beginPath(); ctx.moveTo(s*.12,-s*.32); ctx.lineTo(s*.12,s*.32); ctx.stroke(); ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(s*.30,0); ctx.lineTo(s*.08,-s*.05); ctx.lineTo(s*.08,s*.05); ctx.closePath(); ctx.fill(); }
    else if (kind.includes('staff')||id.includes('스태프')||id.includes('지팡')) { ctx.strokeStyle='#6b3f20'; ctx.lineWidth=s*.10; ctx.beginPath(); ctx.moveTo(-s*.26,s*.36); ctx.lineTo(s*.18,-s*.30); ctx.stroke(); ctx.fillStyle=col; circ(ctx,s*.22,-s*.34,s*(.10+(h%4)*.015)); ctx.strokeStyle=hue; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(s*.22,-s*.34,s*.18,0,Math.PI*2); ctx.stroke(); }
    else if (kind.includes('armor')||kind.includes('helmet')||id.includes('갑옷')||id.includes('투구')) { const wing=h%3; ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(0,-s*.40); ctx.lineTo(s*.34,-s*.16); ctx.lineTo(s*(.22+wing*.03),s*.38); ctx.lineTo(-s*(.22+wing*.03),s*.38); ctx.lineTo(-s*.34,-s*.16); ctx.closePath(); ctx.fill(); ctx.fillStyle='rgba(255,255,255,.32)'; rr(ctx,-s*.13,-s*.14,s*.26,s*.09,2); ctx.strokeStyle=hue; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-s*.20,s*.10); ctx.lineTo(s*.20,s*.10); ctx.stroke(); }
    else if (id.includes('potion')||id.includes('물약')) { const mp=id.includes('mp')||id.includes('마나'); ctx.fillStyle=mp?'#60a5fa':'#fb7185'; ctx.beginPath(); ctx.ellipse(0,s*.08,s*.20,s*.28,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#e5e7eb'; rr(ctx,-s*.08,-s*.32,s*.16,s*.15,2); ctx.fillStyle='#fff7'; ctx.fillRect(-s*.06,-s*.04,s*.08,s*.18); }
    else { ctx.fillStyle=col; const n=4+(h%4); ctx.beginPath(); for(let i=0;i<n;i++){ const a=-Math.PI/2+i*Math.PI*2/n; const px=Math.cos(a)*s*.34, py=Math.sin(a)*s*.34; if(i)ctx.lineTo(px,py); else ctx.moveTo(px,py); } ctx.closePath(); ctx.fill(); ctx.fillStyle='#fff8'; circ(ctx,-s*.08,-s*.08,s*.05); }
    ctx.restore();
  };

  try { if (game && game.mode==='town') { game.platforms=cleanTownPlatforms(); game.ladders=cleanTownLadders(); addVisibleJobNpcs(); } if (game && game.mode==='hunt') ensureElites(); } catch(_){}
  text('엘리트/NPC/아이콘/도시층 보정 적용', '#facc15');
})();

/* Multiplayer elite seed refresh: re-seed the shared room after local elites are guaranteed. */
(function(){
  'use strict';
  if (window.__PIXEL_RPG_ELITE_SEED_REFRESH_PATCH_01__) return;
  window.__PIXEL_RPG_ELITE_SEED_REFRESH_PATCH_01__ = true;
  function A(v){return Array.isArray(v)?v:[];}
  function seedVisibleElitesSoon(){
    setTimeout(function(){
      try {
        if (!game || game.mode !== 'hunt' || !window.PixelRpgMultiplayer || !PixelRpgMultiplayer.socket || !PixelRpgMultiplayer.connected) return;
        const room = 'hunt:' + (game.huntId || 'hunt');
        PixelRpgMultiplayer.socket.emit('monster:seed', { room: room, huntId: game.huntId, layout:'elite-visible-clean-v1', monsters:A(game.monsters).map(function(m,i){
          const t=m.type||{};
          return { id:m.sharedId || m.uid || ((game.huntId||'hunt')+':'+i), index:i, family:t.family||m.family, name:m.name||t.name, level:t.level||m.level||1, x:Math.round(m.x||0), y:Math.round(m.y||0), baseX:Math.round(m.baseX||m.x||0), spawnY:Math.round(m.spawnY||m.y||0), hp:Math.max(0,Math.round(m.hp||0)), maxHp:Math.max(1,Math.round(m.maxHp||t.hp||1)), dead:!!m.dead, respawn:(m.isElite||m.isNamed)?300000:Math.max(10000,m.respawn||10000), isElite:!!m.isElite, isNamed:!!m.isNamed, gimmick:m.gimmick||t.gimmick||'' };
        }) });
      } catch(e) { console.warn('[elite seed refresh failed]', e); }
    }, 320);
  }
  const oldLoadHuntSeedRefresh = typeof loadHunt === 'function' ? loadHunt : null;
  if (oldLoadHuntSeedRefresh) window.loadHunt = loadHunt = function(){ const ret=oldLoadHuntSeedRefresh.apply(this, arguments); seedVisibleElitesSoon(); return ret; };
})();

/* =========================================================
   INVENTORY ITEM VISUAL / RARITY BORDER / TOWN LAYER FIX
   - Inventory grid now passes the real item object into icon drawing
   - Equipment and inventory borders use item rarity colors
   - Item icons use item id/name/kind/rarity so weapons/armor no longer look identical
   - Town platforms are rebuilt as clean non-overlapping floors
   - Town objects are drawn after platforms so buildings sit on floors instead of being covered
========================================================= */
(function(){
  'use strict';
  if (window.__PIXEL_RPG_ITEM_TOWN_FINAL_VISUAL_FIX__) return;
  window.__PIXEL_RPG_ITEM_TOWN_FINAL_VISUAL_FIX__ = true;

  function A(v){ return Array.isArray(v) ? v : []; }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function hashStr(s){ s=String(s||''); let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return Math.abs(h); }
  function rr(c,x,y,w,h,r){ if (typeof roundRect === 'function') return roundRect(c,x,y,w,h,r); c.beginPath(); c.roundRect(x,y,w,h,r||4); c.fill(); }
  function circ(c,x,y,r){ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }
  function itemData(ref){
    if (!ref) return null;
    if (typeof ref === 'object') {
      const base = (window.ITEMS && ref.id && ITEMS[ref.id]) ? ITEMS[ref.id] : {};
      return Object.assign({}, base, ref);
    }
    return (window.ITEMS && ITEMS[ref]) ? ITEMS[ref] : { id:String(ref), name:String(ref) };
  }
  function itemRarity(item){
    item=itemData(item)||{};
    const s=String(item.rarity||item.grade||item.tier||'').toLowerCase();
    const id=String(item.id||item.name||'').toLowerCase();
    if (/legend|레전|myth|전설/.test(s+id)) return 'legendary';
    if (/epic|에픽/.test(s+id)) return 'epic';
    if (/unique|초희귀|ultra/.test(s+id)) return 'unique';
    if (/rare|희귀/.test(s+id)) return 'rare';
    return 'common';
  }
  function rarityColorOf(item){
    return ({ common:'#9ca3af', rare:'#3b82f6', unique:'#22d3ee', epic:'#a855f7', legendary:'#facc15' })[itemRarity(item)] || '#9ca3af';
  }
  function itemKind(item){
    item=itemData(item)||{};
    const s=(String(item.weaponType||'')+' '+String(item.equipSlot||'')+' '+String(item.type||'')+' '+String(item.id||'')+' '+String(item.name||'')).toLowerCase();
    if (/dagger|단검/.test(s)) return 'dagger';
    if (/sword|검|blade/.test(s)) return 'sword';
    if (/bow|활/.test(s)) return 'bow';
    if (/staff|wand|스태프|지팡/.test(s)) return 'staff';
    if (/helmet|투구|헬멧/.test(s)) return 'helmet';
    if (/armor|갑옷|robe|mail|plate/.test(s)) return 'armor';
    if (/knee|boot|무릎|부츠/.test(s)) return 'boots';
    if (/accessory|ring|neck|방어구|반지|목걸/.test(s)) return 'accessory';
    if (/potion|물약|hp|mp|mana/.test(s)) return 'potion';
    return 'misc';
  }
  function displayName(ref){
    try { if (typeof getItemDisplayName === 'function') return getItemDisplayName(ref); } catch(_){}
    const d=itemData(ref); return d && (d.name || d.id) || '';
  }

  window.__pixelItemRarityColor = rarityColorOf;

  window.drawItemIcon = drawItemIcon = function drawItemIconDistinctFinal(itemOrIcon,x,y,size){
    const item=itemData(itemOrIcon) || { id:String(itemOrIcon||'item') };
    const id=String(item.id||item.name||itemOrIcon||'item');
    const h=hashStr(id);
    const s=size||32;
    const kind=itemKind(item);
    const rarity=itemRarity(item);
    const col=rarityColorOf(item);
    const accent=['#f87171','#fb923c','#facc15','#34d399','#22d3ee','#60a5fa','#a78bfa','#f472b6'][h%8];
    const dark=['#0f172a','#1e293b','#111827','#312e81','#422006'][h%5];
    ctx.save();
    ctx.translate(x,y);
    ctx.shadowColor=col;
    ctx.shadowBlur=rarity==='legendary'?18:rarity==='epic'?13:rarity==='unique'?9:rarity==='rare'?5:0;
    ctx.fillStyle='rgba(15,23,42,.94)';
    rr(ctx,-s*.5,-s*.5,s,s,Math.max(4,s*.12));
    ctx.strokeStyle=col;
    ctx.lineWidth=Math.max(2,s*.09);
    ctx.strokeRect(-s*.5+1,-s*.5+1,s-2,s-2);

    if (kind==='sword') {
      const bladeW=s*(.10+(h%5)*.012), bladeL=s*(.56+(h%5)*.04);
      ctx.rotate((h%7-3)*0.035);
      ctx.fillStyle=col;
      ctx.beginPath(); ctx.moveTo(0,-bladeL*.58); ctx.lineTo(bladeW,-s*.06); ctx.lineTo(bladeW*.45,s*.24); ctx.lineTo(-bladeW*.45,s*.24); ctx.lineTo(-bladeW,-s*.06); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.65)'; ctx.fillRect(-1,-bladeL*.42,2,bladeL*.55);
      ctx.fillStyle=accent; rr(ctx,-s*.24,s*.10,s*.48,s*.08,2); ctx.fillStyle='#7c2d12'; rr(ctx,-s*.06,s*.12,s*.12,s*.24,2);
      if (rarity==='legendary'||rarity==='epic') { ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(0,-s*.05,s*.30,0,Math.PI*2); ctx.stroke(); }
    } else if (kind==='dagger') {
      ctx.rotate((h%9-4)*0.08);
      ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(s*.22,-s*.40); ctx.lineTo(s*.32,-s*.02); ctx.lineTo(-s*.10,s*.34); ctx.lineTo(-s*.25,s*.19); ctx.lineTo(s*.04,-s*.08); ctx.closePath(); ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.65)'; ctx.beginPath(); ctx.moveTo(s*.17,-s*.28); ctx.lineTo(s*.23,-s*.04); ctx.lineTo(-s*.08,s*.22); ctx.lineTo(s*.05,-s*.06); ctx.closePath(); ctx.fill();
      ctx.fillStyle=accent; rr(ctx,-s*.28,s*.18,s*.20,s*.09,2);
      if (rarity==='legendary'||rarity==='epic') { ctx.strokeStyle=accent; ctx.beginPath(); ctx.moveTo(-s*.34,s*.30); ctx.quadraticCurveTo(0,-s*.20,s*.34,-s*.32); ctx.stroke(); }
    } else if (kind==='bow') {
      ctx.strokeStyle=col; ctx.lineWidth=s*.09; ctx.beginPath(); ctx.arc(-s*.05,0,s*.36,-1.25,1.25); ctx.stroke();
      ctx.strokeStyle='#dbeafe'; ctx.lineWidth=s*.025; ctx.beginPath(); ctx.moveTo(s*.13,-s*.32); ctx.lineTo(s*.13,s*.32); ctx.stroke();
      ctx.fillStyle=accent; ctx.beginPath(); ctx.moveTo(s*.34,0); ctx.lineTo(s*.07,-s*.06); ctx.lineTo(s*.07,s*.06); ctx.closePath(); ctx.fill();
      ctx.strokeStyle=accent; ctx.lineWidth=s*.035; ctx.beginPath(); ctx.moveTo(-s*.20,0); ctx.lineTo(s*.28,0); ctx.stroke();
    } else if (kind==='staff') {
      ctx.strokeStyle='#7c4a1e'; ctx.lineWidth=s*.08; ctx.beginPath(); ctx.moveTo(-s*.28,s*.38); ctx.lineTo(s*.18,-s*.28); ctx.stroke();
      const orbR=s*(.105+(h%4)*.012); ctx.fillStyle=col; circ(ctx,s*.22,-s*.33,orbR); ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(s*.22,-s*.33,s*.20,0,Math.PI*2); ctx.stroke();
      if (rarity==='legendary'||rarity==='epic') { for(let i=0;i<5;i++){ ctx.fillStyle=i%2?accent:col; circ(ctx, Math.cos(i*1.26+h)*s*.26, -s*.25+Math.sin(i*1.26+h)*s*.18, s*.025); } }
    } else if (kind==='helmet') {
      ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(0,-s*.06,s*.30,s*.22,0,Math.PI,0); ctx.lineTo(s*.27,s*.18); ctx.lineTo(-s*.27,s*.18); ctx.closePath(); ctx.fill();
      ctx.fillStyle=dark; rr(ctx,-s*.19,s*.02,s*.38,s*.10,3);
      ctx.fillStyle='rgba(255,255,255,.45)'; rr(ctx,-s*.11,-s*.16,s*.22,s*.045,2);
      if (h%3===0) { ctx.fillStyle=accent; ctx.beginPath(); ctx.moveTo(0,-s*.34); ctx.lineTo(s*.08,-s*.15); ctx.lineTo(-s*.08,-s*.15); ctx.closePath(); ctx.fill(); }
    } else if (kind==='armor') {
      ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(0,-s*.38); ctx.lineTo(s*.33,-s*.17); ctx.lineTo(s*.24,s*.38); ctx.lineTo(-s*.24,s*.38); ctx.lineTo(-s*.33,-s*.17); ctx.closePath(); ctx.fill();
      ctx.fillStyle=dark; rr(ctx,-s*.17,-s*.10,s*.34,s*.30,4); ctx.fillStyle='rgba(255,255,255,.35)'; rr(ctx,-s*.12,-s*.22,s*.24,s*.07,2);
      ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-s*.22,s*.13); ctx.lineTo(s*.22,s*.13); ctx.stroke();
    } else if (kind==='boots') {
      ctx.fillStyle=col; rr(ctx,-s*.33,s*.02,s*.24,s*.26,4); rr(ctx,s*.09,s*.02,s*.24,s*.26,4); ctx.fillStyle=dark; rr(ctx,-s*.38,s*.22,s*.30,s*.10,3); rr(ctx,s*.08,s*.22,s*.30,s*.10,3);
    } else if (kind==='accessory') {
      ctx.strokeStyle=col; ctx.lineWidth=s*.08; ctx.beginPath(); ctx.arc(0,0,s*.25,0,Math.PI*2); ctx.stroke(); ctx.fillStyle=accent; circ(ctx,0,-s*.27,s*.09); ctx.fillStyle='rgba(255,255,255,.55)'; circ(ctx,-s*.03,-s*.30,s*.025);
    } else if (kind==='potion') {
      const mp=/mp|mana|마나/i.test(id+item.name); ctx.fillStyle=mp?'#60a5fa':'#fb7185'; ctx.beginPath(); ctx.ellipse(0,s*.08,s*.19,s*.28,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#e5e7eb'; rr(ctx,-s*.08,-s*.31,s*.16,s*.13,2); ctx.fillStyle='rgba(255,255,255,.65)'; rr(ctx,-s*.07,-s*.02,s*.08,s*.18,2);
    } else {
      const n=4+(h%5); ctx.fillStyle=col; ctx.beginPath(); for(let i=0;i<n;i++){ const a=-Math.PI/2+i*Math.PI*2/n; const rad=s*(i%2?.22:.35); const px=Math.cos(a)*rad, py=Math.sin(a)*rad; if(i)ctx.lineTo(px,py); else ctx.moveTo(px,py); } ctx.closePath(); ctx.fill(); ctx.fillStyle=accent; circ(ctx,0,0,s*.08); ctx.fillStyle='rgba(255,255,255,.60)'; circ(ctx,-s*.07,-s*.08,s*.035);
    }
    ctx.restore();
  };

  function drawRaritySlot(cx,cy,w,h,item){
    ctx.fillStyle='#eef6ff'; ctx.fillRect(cx,cy,w,h);
    ctx.strokeStyle=rarityColorOf(item); ctx.lineWidth=item?3:2; ctx.strokeRect(cx,cy,w,h);
    if (item && itemRarity(item)==='legendary') { ctx.strokeStyle='rgba(250,204,21,.35)'; ctx.lineWidth=1; ctx.strokeRect(cx+4,cy+4,w-8,h-8); }
  }

  window.drawEquipmentBox = drawEquipmentBox = function drawEquipmentBoxRarityFinal(x,y){
    const w=340,h=455;
    ctx.fillStyle='#f8fbff'; ctx.fillRect(x,y,w,h); ctx.strokeStyle='#8eb2d5'; ctx.lineWidth=2; ctx.strokeRect(x,y,w,h);
    ctx.fillStyle='#2f5f91'; ctx.font='bold 17px sans-serif'; ctx.textAlign='left'; ctx.fillText('EQUIPMENT INVENTORY',x+14,y+28);
    const slots=[{name:'헬멧',key:'helmet',x:134,y:48},{name:'무기',key:'weapon',x:28,y:158},{name:'갑옷',key:'armor',x:134,y:158},{name:'무릎',key:'knee',x:240,y:158},{name:'악세',key:'accessory',x:134,y:275}];
    ctx.strokeStyle='#bfd7ea'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(x+170,y+235,78,155,0,0,Math.PI*2); ctx.stroke();
    slots.forEach(function(slot){
      const sx=x+slot.x, sy=y+slot.y; const ref=equipment[slot.key]; const data=itemData(ref);
      drawRaritySlot(sx,sy,72,72,data);
      ctx.fillStyle='#5b7ea6'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.fillText(slot.name,sx+36,sy-8);
      if(data){ drawItemIcon(Object.assign({},data,typeof ref==='object'?ref:{}),sx+36,sy+36,44); ctx.fillStyle='#233'; ctx.font='11px sans-serif'; ctx.fillText(displayName(ref).slice(0,11),sx+36,sy+88); }
    });
    const fake=Object.assign({},game.player,{anim:'idle',animTime:performance.now()/1000,face:1}); ctx.save(); ctx.translate(x+170,y+410); ctx.scale(1.05,1.05); try{drawPlayerBody(ctx,fake);}catch(_){} ctx.restore();
  };

  window.drawItemBox = drawItemBox = function drawItemBoxRarityFinal(x,y){
    const w=410,h=455;
    ctx.fillStyle='#fff'; ctx.fillRect(x,y,w,h); ctx.strokeStyle='#8eb2d5'; ctx.lineWidth=2; ctx.strokeRect(x,y,w,h);
    ctx.fillStyle='#2f5f91'; ctx.font='bold 17px sans-serif'; ctx.textAlign='left'; ctx.fillText('ITEM INVENTORY '+inventory.items.length+'/100',x+14,y+28);
    const tabs=['장비','소비','기타']; tabs.forEach(function(tab,i){ const tx=x+14+i*74; ctx.fillStyle=i===0?'#ff7aa2':'#d9e6f4'; ctx.fillRect(tx,y+42,68,32); ctx.strokeStyle='#8eb2d5'; ctx.strokeRect(tx,y+42,68,32); ctx.fillStyle='#1f2937'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.fillText(tab,tx+34,y+64); });
    const gridX=x+18, gridY=y+88, cell=56;
    for(let i=0;i<36;i++){
      const cx=gridX+(i%6)*cell, cy=gridY+Math.floor(i/6)*cell; const item=inventory.items[i]; const data=itemData(item);
      drawRaritySlot(cx,cy,48,48,data);
      if(item){ drawItemIcon(Object.assign({},data||{},item),cx+24,cy+24,36); ctx.fillStyle='#1f2937'; ctx.font='bold 11px sans-serif'; ctx.textAlign='right'; ctx.fillText(String(item.count||1),cx+43,cy+43); }
    }
    ctx.fillStyle='#f8fafc'; ctx.fillRect(x+14,y+405,300,34); ctx.strokeStyle='#8eb2d5'; ctx.strokeRect(x+14,y+405,300,34); ctx.fillStyle='#111827'; ctx.font='bold 14px sans-serif'; ctx.textAlign='left'; ctx.fillText((game.gold||0)+' 원',x+26,y+427);
  };

  function cleanTownPlatformsFinal(){
    const gw=Math.max(4700,game.width||4700), g=game.ground;
    return [
      {x:0,y:g,w:gw,h:24,floor:0,townFloor:true,solidFloor:true},
      {x:560,y:430,w:820,h:24,floor:1,townFloor:true,solidFloor:true},
      {x:2060,y:430,w:840,h:24,floor:1,townFloor:true,solidFloor:true},
      {x:3520,y:430,w:760,h:24,floor:1,townFloor:true,solidFloor:true},
      {x:1380,y:270,w:820,h:24,floor:2,townFloor:true,solidFloor:true},
      {x:3060,y:270,w:800,h:24,floor:2,townFloor:true,solidFloor:true}
    ];
  }
  function cleanTownLaddersFinal(){ const g=game.ground; return [
    {x:650,y1:430,y2:g,town:true},{x:1220,y1:270,y2:430,town:true},
    {x:2160,y1:430,y2:g,town:true},{x:3140,y1:270,y2:430,town:true},
    {x:3650,y1:430,y2:g,town:true}
  ]; }
  function platformYForFloor(f,x){ const ps=cleanTownPlatformsFinal().filter(p=>p.floor===f && (x==null || (x>=p.x-60 && x<=p.x+p.w+60))); return (ps[0]||cleanTownPlatformsFinal()[0]).y; }
  function drawSimpleHouseAt(x,y,theme,scale){
    scale=scale||1; ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
    const wall=theme==='ice'?'#c7efff':theme==='desert'?'#c6924c':theme==='ruin'?'#888b92':theme==='magic'?'#9b8cff':'#c08a4b';
    const roof=theme==='ice'?'#e0f7ff':theme==='desert'?'#d8b46e':theme==='ruin'?'#555b64':theme==='magic'?'#6750a4':'#7a4f31';
    ctx.fillStyle=wall; rr(ctx,-70,-82,140,82,8); ctx.fillStyle=roof; ctx.beginPath(); ctx.ellipse(0,-82,78,28,0,Math.PI,0); ctx.fill();
    ctx.fillStyle='#3b2415'; ctx.fillRect(-12,-40,24,40); ctx.fillStyle='#fff7bd'; ctx.fillRect(-52,-58,35,22); ctx.fillRect(17,-58,35,22); ctx.restore();
  }
  function drawCleanTownObjectsFinal(town){
    const theme=(town&&town.theme)||'grass';
    const ps=cleanTownPlatformsFinal();
    const houses=[
      {x:180,y:ps[0].y,sc:1.0},{x:1040,y:ps[1].y,sc:.75},{x:1780,y:ps[4].y,sc:.67},
      {x:2500,y:ps[2].y,sc:.76},{x:3440,y:ps[5].y,sc:.67},{x:3940,y:ps[3].y,sc:.74}
    ];
    houses.forEach(h=>drawSimpleHouseAt(h.x,h.y,theme,h.sc));
    [360,1620,2960,4380].forEach(function(tx){ try{ if(typeof drawTree==='function') drawTree(tx,game.ground,theme); }catch(_){} });
  }
  function drawCleanPlatform(p,town){
    const theme=(town&&town.theme)||'grass';
    const top=typeof getGroundColor==='function'?getGroundColor(theme):'#9bd36a';
    const dirt=typeof getDirtColor==='function'?getDirtColor(theme):'#8b6b3d';
    ctx.fillStyle=top; rr(ctx,p.x,p.y,p.w,p.h,8); ctx.fillStyle=dirt; ctx.fillRect(p.x+8,p.y+p.h-7,p.w-16,10); ctx.fillStyle='rgba(0,0,0,.16)'; for(let i=20;i<p.w-20;i+=120) ctx.fillRect(p.x+i,p.y+p.h-9,78,4);
  }
  const oldDrawWorldForHunt = typeof drawWorld === 'function' ? drawWorld : null;
  window.drawWorld = drawWorld = function drawWorldCleanTownLayered(){
    const town=typeof getTown==='function'?getTown(game.townId):{bgTop:'#a8ddff',bgBottom:'#dff4ff',theme:'grass',title:'',name:''};
    if (game.mode !== 'town') return oldDrawWorldForHunt ? oldDrawWorldForHunt.apply(this,arguments) : undefined;
    if (!game.__cleanTownFixed) { game.platforms=cleanTownPlatformsFinal(); game.ladders=cleanTownLaddersFinal(); game.__cleanTownFixed=true; }
    const sky=ctx.createLinearGradient(0,0,0,H); sky.addColorStop(0,town.bgTop||'#a8ddff'); sky.addColorStop(.55,town.bgBottom||'#dff4ff'); sky.addColorStop(1,'#eaffce'); ctx.fillStyle=sky; ctx.fillRect(0,0,game.width,H);
    try{ if(typeof drawBackgroundLayers==='function') drawBackgroundLayers(town); }catch(_){}
    cleanTownPlatformsFinal().forEach(p=>drawCleanPlatform(p,town));
    try{ if(typeof drawGround==='function') drawGround(town); }catch(_){ ctx.fillStyle='#9bd36a'; ctx.fillRect(0,game.ground,game.width,H-game.ground); }
    drawCleanTownObjectsFinal(town);
    ctx.fillStyle='#fff'; ctx.font='bold 26px sans-serif'; ctx.textAlign='left'; ctx.fillText((town.title||'')+' '+(town.name||''),34,46);
  };
  const oldLoadTownFix = typeof loadTown === 'function' ? loadTown : null;
  if (oldLoadTownFix) window.loadTown = loadTown = function(id){ const ret=oldLoadTownFix.apply(this,arguments); try{ game.__cleanTownFixed=false; game.platforms=cleanTownPlatformsFinal(); game.ladders=cleanTownLaddersFinal(); if(typeof addVisibleJobNpcs==='function') addVisibleJobNpcs(); }catch(e){ console.warn('[town/item final fix]',e); } return ret; };
  try{ if(game && game.mode==='town'){ game.__cleanTownFixed=false; game.platforms=cleanTownPlatformsFinal(); game.ladders=cleanTownLaddersFinal(); } }catch(_){}
  if (typeof text === 'function') text('아이템 외형/등급 테두리/도시층 겹침 보정 적용','#facc15');
})();


/* =========================================================
   ELITE ONLINE VISIBILITY + DISTINCT EQUIP VISUAL PATCH 02
   - Forces 1~2 elite monsters to exist locally and re-seeds them to the online room
   - Makes inventory/equipment icons, equipped weapon/armor, swing/projectile visuals distinct
========================================================= */
(function(){
  'use strict';
  if (window.__PIXEL_RPG_ELITE_ITEM_EQUIP_VISUAL_PATCH_02__) return;
  window.__PIXEL_RPG_ELITE_ITEM_EQUIP_VISUAL_PATCH_02__ = true;

  function arr(v){ return Array.isArray(v) ? v : []; }
  function now(){ return Date.now ? Date.now() : +new Date(); }
  function hsh(s){ s=String(s||''); let h=0; for(let i=0;i<s.length;i++) h=(Math.imul(h,31)+s.charCodeAt(i))|0; return Math.abs(h); }
  function rr(c,x,y,w,h,r){ if (typeof roundRect==='function') return roundRect(c,x,y,w,h,r||4); c.beginPath(); c.roundRect(x,y,w,h,r||4); c.fill(); }
  function circ(c,x,y,r){ c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }
  function poly(c, pts){ c.beginPath(); pts.forEach(function(p,i){ if(i)c.lineTo(p[0],p[1]); else c.moveTo(p[0],p[1]); }); c.closePath(); c.fill(); }
  function item(ref){
    if (!ref) return null;
    if (typeof ref === 'object') return Object.assign({}, (window.ITEMS && ref.id && ITEMS[ref.id]) || {}, ref);
    return (window.ITEMS && ITEMS[ref]) ? Object.assign({}, ITEMS[ref], {id:ITEMS[ref].id||ref}) : { id:String(ref), name:String(ref) };
  }
  function rarity(it){
    it=item(it)||{};
    const s=String([it.rarity,it.grade,it.tier,it.id,it.name].join(' ')).toLowerCase();
    if (/legend|legendary|레전|전설|myth|신화/.test(s)) return 'legendary';
    if (/epic|에픽|영웅/.test(s)) return 'epic';
    if (/ultra|unique|초희귀|유니크/.test(s)) return 'ultra';
    if (/rare|희귀|blue/.test(s)) return 'rare';
    return 'common';
  }
  const RCOL={ common:'#9ca3af', rare:'#3b82f6', ultra:'#22d3ee', epic:'#a855f7', legendary:'#facc15' };
  const RKO={ common:'일반', rare:'희귀', ultra:'초희귀', epic:'에픽', legendary:'레전더리' };
  function rcol(it){ return RCOL[rarity(it)] || RCOL.common; }
  function kind(it){
    it=item(it)||{}; const s=String([it.weaponType,it.slot,it.equipSlot,it.type,it.id,it.name,it.icon].join(' ')).toLowerCase();
    if (/dagger|단검|knife|암살/.test(s)) return 'dagger';
    if (/bow|활|궁|arrow/.test(s)) return 'bow';
    if (/staff|wand|rod|스태프|지팡|마법/.test(s)) return 'staff';
    if (/sword|blade|검|소드|칼/.test(s)) return 'sword';
    if (/axe|도끼/.test(s)) return 'axe';
    if (/spear|창|lance/.test(s)) return 'spear';
    if (/gun|총|pistol|rifle/.test(s)) return 'gun';
    if (/helmet|helm|투구|헬멧/.test(s)) return 'helmet';
    if (/armor|robe|mail|plate|갑옷|로브|흉갑/.test(s)) return 'armor';
    if (/knee|boot|boots|부츠|무릎|신발/.test(s)) return 'boots';
    if (/accessory|ring|neck|amulet|반지|목걸|장신구/.test(s)) return 'accessory';
    if (/potion|물약|hp|mp|mana/.test(s)) return 'potion';
    if (/seal|scroll|양피지|인장/.test(s)) return 'seal';
    return 'misc';
  }
  function tierName(it){ return RKO[rarity(it)] || '일반'; }
  window.__pixelItemKind = kind;
  window.__pixelItemRarity = rarity;
  window.__pixelItemRarityColor = rcol;

  function drawSlot(c,x,y,w,h,it){
    const col=it?rcol(it):'#64748b';
    c.save(); c.fillStyle='rgba(15,23,42,.72)'; rr(c,x,y,w,h,8); c.strokeStyle=col; c.lineWidth=it?3:2; c.strokeRect(x+1,y+1,w-2,h-2);
    if(it && rarity(it)==='legendary'){ c.strokeStyle='rgba(250,204,21,.45)'; c.lineWidth=1; c.strokeRect(x+6,y+6,w-12,h-12); }
    c.restore();
  }

  function drawMiniSpark(c,s, col, count){
    c.strokeStyle=col; c.lineWidth=Math.max(1,s*.035);
    for(let i=0;i<count;i++){ const a=i*Math.PI*2/count; c.beginPath(); c.moveTo(Math.cos(a)*s*.28,Math.sin(a)*s*.28); c.lineTo(Math.cos(a)*s*.40,Math.sin(a)*s*.40); c.stroke(); }
  }

  window.drawItemIcon = drawItemIcon = function drawItemIconReallyDistinct(itemOrIcon,x,y,size){
    const it=item(itemOrIcon)||{id:String(itemOrIcon||'item'),name:String(itemOrIcon||'item')};
    const k=kind(it), r=rarity(it), col=rcol(it), seed=hsh((it.id||'')+(it.name||''));
    const s=size||34;
    const accent=['#ef4444','#f97316','#facc15','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899'][seed%8];
    const metal=['#e5e7eb','#cbd5e1','#94a3b8','#fef3c7','#bfdbfe'][seed%5];
    ctx.save(); ctx.translate(x,y);
    ctx.shadowColor=col; ctx.shadowBlur=r==='legendary'?18:r==='epic'?12:r==='ultra'?8:r==='rare'?5:0;
    ctx.fillStyle='rgba(2,6,23,.88)'; rr(ctx,-s*.50,-s*.50,s,s,Math.max(5,s*.13));
    ctx.strokeStyle=col; ctx.lineWidth=Math.max(2,s*.09); ctx.strokeRect(-s*.48,-s*.48,s*.96,s*.96);
    if(r==='legendary') drawMiniSpark(ctx,s,col,8);

    if(k==='sword'){
      const wide=seed%3===0; ctx.rotate((seed%9-4)*.035);
      ctx.fillStyle=metal; poly(ctx,[[0,-s*.45],[s*(wide?.16:.10),-s*.10],[s*.06,s*.31],[-s*.06,s*.31],[-s*(wide?.16:.10),-s*.10]]);
      ctx.fillStyle=col; rr(ctx,-s*.32,s*.05,s*.64,s*.09,2); ctx.fillStyle='#7c2d12'; rr(ctx,-s*.07,s*.09,s*.14,s*.31,2);
      ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-s*.05,-s*.33); ctx.lineTo(s*.06,-s*.02); ctx.stroke();
      if(seed%4===0){ ctx.fillStyle=accent; poly(ctx,[[0,-s*.52],[s*.08,-s*.42],[0,-s*.35],[-s*.08,-s*.42]]); }
    }else if(k==='dagger'){
      ctx.rotate(-.72+(seed%5)*.09); ctx.fillStyle=metal; poly(ctx,[[s*.14,-s*.42],[s*.29,-s*.08],[-s*.13,s*.36],[-s*.25,s*.23],[s*.02,-s*.10]]);
      ctx.fillStyle=col; rr(ctx,-s*.30,s*.16,s*.28,s*.08,2); ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-s*.35,s*.33); ctx.quadraticCurveTo(s*.02,-s*.18,s*.33,-s*.34); ctx.stroke();
    }else if(k==='bow'){
      ctx.strokeStyle=col; ctx.lineWidth=s*.08; ctx.beginPath(); ctx.arc(-s*.05,0,s*.37,-1.28,1.28); ctx.stroke();
      ctx.strokeStyle='#f8fafc'; ctx.lineWidth=s*.025; ctx.beginPath(); ctx.moveTo(s*.13,-s*.34); ctx.lineTo(s*.13,s*.34); ctx.stroke();
      ctx.fillStyle=accent; poly(ctx,[[s*.38,0],[s*.10,-s*.07],[s*.10,s*.07]]); ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-s*.25,0); ctx.lineTo(s*.34,0); ctx.stroke();
      if(seed%2){ctx.fillStyle=col; circ(ctx,-s*.20,-s*.14,s*.045); circ(ctx,-s*.20,s*.14,s*.045);}
    }else if(k==='staff'){
      ctx.strokeStyle='#8b5a2b'; ctx.lineWidth=s*.07; ctx.beginPath(); ctx.moveTo(-s*.30,s*.38); ctx.lineTo(s*.18,-s*.27); ctx.stroke();
      ctx.fillStyle=col; circ(ctx,s*.23,-s*.33,s*.13); ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(s*.23,-s*.33,s*.24,0,Math.PI*2); ctx.stroke();
      if(seed%3===0){ctx.beginPath(); ctx.arc(s*.23,-s*.33,s*.34,0,Math.PI*2); ctx.stroke();}
    }else if(k==='axe'){
      ctx.strokeStyle='#8b5a2b'; ctx.lineWidth=s*.08; ctx.beginPath(); ctx.moveTo(-s*.20,s*.38); ctx.lineTo(s*.15,-s*.35); ctx.stroke(); ctx.fillStyle=metal; poly(ctx,[[s*.06,-s*.34],[s*.40,-s*.22],[s*.23,s*.05],[s*.02,-s*.04]]); ctx.fillStyle=col; poly(ctx,[[s*.00,-s*.30],[-s*.28,-s*.18],[-s*.12,s*.05],[s*.06,-s*.03]]);
    }else if(k==='spear'){
      ctx.strokeStyle='#8b5a2b'; ctx.lineWidth=s*.06; ctx.beginPath(); ctx.moveTo(-s*.25,s*.40); ctx.lineTo(s*.12,-s*.23); ctx.stroke(); ctx.fillStyle=col; poly(ctx,[[s*.18,-s*.45],[s*.31,-s*.18],[s*.07,-s*.25]]); ctx.fillStyle=metal; poly(ctx,[[s*.12,-s*.25],[s*.23,-s*.08],[-s*.02,-s*.08]]);
    }else if(k==='gun'){
      ctx.fillStyle=metal; rr(ctx,-s*.32,-s*.12,s*.55,s*.16,4); ctx.fillStyle=col; rr(ctx,s*.10,-s*.18,s*.26,s*.07,2); ctx.fillStyle='#4b5563'; rr(ctx,-s*.06,s*.02,s*.13,s*.28,2); ctx.fillStyle=accent; circ(ctx,s*.38,-s*.15,s*.05);
    }else if(k==='helmet'){
      ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(0,-s*.07,s*.33,s*.24,0,Math.PI,0); ctx.lineTo(s*.28,s*.18); ctx.lineTo(-s*.28,s*.18); ctx.closePath(); ctx.fill(); ctx.fillStyle='rgba(2,6,23,.8)'; rr(ctx,-s*.22,s*.01,s*.44,s*.11,4); ctx.fillStyle=accent; if(seed%2) poly(ctx,[[0,-s*.43],[s*.08,-s*.17],[-s*.08,-s*.17]]); else rr(ctx,-s*.17,-s*.27,s*.34,s*.06,2);
    }else if(k==='armor'){
      ctx.fillStyle=col; poly(ctx,[[0,-s*.42],[s*.36,-s*.20],[s*.28,s*.39],[-s*.28,s*.39],[-s*.36,-s*.20]]); ctx.fillStyle='rgba(2,6,23,.55)'; rr(ctx,-s*.18,-s*.10,s*.36,s*.32,5); ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-s*.26,s*.08); ctx.lineTo(s*.26,s*.08); ctx.stroke(); if(seed%3===0){ctx.fillStyle=metal; circ(ctx,0,-s*.22,s*.07);}
    }else if(k==='boots'){
      ctx.fillStyle=col; rr(ctx,-s*.35,s*.00,s*.26,s*.27,5); rr(ctx,s*.09,s*.00,s*.26,s*.27,5); ctx.fillStyle='rgba(2,6,23,.6)'; rr(ctx,-s*.39,s*.22,s*.31,s*.10,4); rr(ctx,s*.08,s*.22,s*.31,s*.10,4);
    }else if(k==='accessory'){
      ctx.strokeStyle=col; ctx.lineWidth=s*.08; ctx.beginPath(); ctx.arc(0,0,s*.25,0,Math.PI*2); ctx.stroke(); ctx.fillStyle=accent; circ(ctx,0,-s*.28,s*.10); ctx.fillStyle='#fff'; circ(ctx,-s*.03,-s*.31,s*.025);
    }else if(k==='potion'){
      const mp=/mp|mana|마나/i.test((it.id||'')+(it.name||'')); ctx.fillStyle=mp?'#60a5fa':'#fb7185'; ctx.beginPath(); ctx.ellipse(0,s*.08,s*.20,s*.29,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#e5e7eb'; rr(ctx,-s*.09,-s*.33,s*.18,s*.14,3); ctx.fillStyle='rgba(255,255,255,.65)'; rr(ctx,-s*.07,-s*.02,s*.08,s*.18,2);
    }else if(k==='seal'){
      ctx.fillStyle=col; poly(ctx,[[0,-s*.37],[s*.33,-s*.12],[s*.20,s*.34],[-s*.20,s*.34],[-s*.33,-s*.12]]); ctx.fillStyle='rgba(255,255,255,.8)'; rr(ctx,-s*.16,-s*.05,s*.32,s*.10,2); ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,s*.29,0,Math.PI*2); ctx.stroke();
    }else{
      const n=5+(seed%4); ctx.fillStyle=col; ctx.beginPath(); for(let i=0;i<n*2;i++){ const a=-Math.PI/2+i*Math.PI/n; const rad=i%2?s*.18:s*.34; const px=Math.cos(a)*rad, py=Math.sin(a)*rad; if(i)ctx.lineTo(px,py); else ctx.moveTo(px,py);} ctx.closePath(); ctx.fill(); ctx.fillStyle=accent; circ(ctx,0,0,s*.09);
    }
    ctx.restore();
  };

  // Repaint inventory/equipment with rarity borders. This override is intentionally last.
  drawEquipmentBox = window.drawEquipmentBox = function drawEquipmentBoxDistinct(x,y){
    ctx.fillStyle='#f8fbff'; ctx.fillRect(x,y,340,455); ctx.strokeStyle='#8eb2d5'; ctx.lineWidth=2; ctx.strokeRect(x,y,340,455);
    ctx.fillStyle='#2f5f91'; ctx.font='bold 17px sans-serif'; ctx.textAlign='left'; ctx.fillText('EQUIPMENT INVENTORY',x+14,y+28);
    const slots=[['헬멧','helmet',134,48],['무기','weapon',28,158],['갑옷','armor',134,158],['무릎','knee',240,158],['악세','accessory',134,275]];
    ctx.strokeStyle='#bfd7ea'; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(x+170,y+235,78,155,0,0,Math.PI*2); ctx.stroke();
    slots.forEach(function(s){ const ref=equipment[s[1]], it=item(ref), sx=x+s[2], sy=y+s[3]; drawSlot(ctx,sx,sy,72,72,it); ctx.fillStyle='#5b7ea6'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.fillText(s[0],sx+36,sy-8); if(it){ drawItemIcon(Object.assign({},it,typeof ref==='object'?ref:{}),sx+36,sy+36,46); ctx.fillStyle=rcol(it); ctx.font='bold 10px sans-serif'; ctx.fillText(tierName(it),sx+36,sy+86); } });
    const fake=Object.assign({},game.player,{anim:'idle',animTime:performance.now()/1000,face:1}); ctx.save(); ctx.translate(x+170,y+410); ctx.scale(1.05,1.05); try{ drawPlayerBody(ctx,fake); }catch(e){} ctx.restore();
  };
  drawItemBox = window.drawItemBox = function drawItemBoxDistinct(x,y){
    ctx.fillStyle='#fff'; ctx.fillRect(x,y,410,455); ctx.strokeStyle='#8eb2d5'; ctx.lineWidth=2; ctx.strokeRect(x,y,410,455);
    ctx.fillStyle='#2f5f91'; ctx.font='bold 17px sans-serif'; ctx.textAlign='left'; ctx.fillText('ITEM INVENTORY '+arr(inventory.items).length+'/100',x+14,y+28);
    const tabs=['장비','소비','기타']; tabs.forEach(function(tab,i){ const tx=x+14+i*74; ctx.fillStyle=i===0?'#ff7aa2':'#d9e6f4'; ctx.fillRect(tx,y+42,68,32); ctx.strokeStyle='#8eb2d5'; ctx.strokeRect(tx,y+42,68,32); ctx.fillStyle='#1f2937'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.fillText(tab,tx+34,y+64); });
    const gridX=x+18, gridY=y+88, cell=56;
    for(let i=0;i<36;i++){ const cx=gridX+(i%6)*cell, cy=gridY+Math.floor(i/6)*cell, ref=inventory.items[i], it=item(ref); drawSlot(ctx,cx,cy,48,48,it); if(it){ drawItemIcon(Object.assign({},it,typeof ref==='object'?ref:{}),cx+24,cy+24,38); ctx.fillStyle='#fff'; ctx.strokeStyle='#000'; ctx.lineWidth=3; ctx.font='bold 11px sans-serif'; ctx.textAlign='right'; const cnt=String((ref&&ref.count)||1); ctx.strokeText(cnt,cx+44,cy+43); ctx.fillText(cnt,cx+44,cy+43); } }
    ctx.fillStyle='#f8fafc'; ctx.fillRect(x+14,y+405,300,34); ctx.strokeStyle='#8eb2d5'; ctx.strokeRect(x+14,y+405,300,34); ctx.fillStyle='#111827'; ctx.font='bold 14px sans-serif'; ctx.textAlign='left'; ctx.fillText((game.gold||0)+' 원',x+26,y+427);
  };

  // Equipped weapon: same identity/rarity as the inventory icon, but drawn as a real held object.
  drawWeapon = window.drawWeapon = function drawWeaponUnique(c, weaponId, handX, handY, attacking, attackKind, animTime){
    const it=item(weaponId || (equipment && equipment.weapon));
    if(!it) return;
    const k=kind(it), r=rarity(it), col=rcol(it), seed=hsh((it.id||'')+(it.name||''));
    const level=Number(it.reqLevel||it.level||it.lv||1);
    const len=32+Math.min(42,level*.65)+(r==='legendary'?20:r==='epic'?13:r==='ultra'?8:0);
    const t=Number(animTime||0), sw=attacking?Math.sin(Math.min(1,t*10)*Math.PI):0;
    c.save(); c.translate(handX,handY); c.rotate((attacking?(-0.85+sw*1.45):-0.45)*(game.player&&game.player.face||1)); c.scale(game.player&&game.player.face||1,1);
    c.shadowColor=col; c.shadowBlur=r==='legendary'?22:r==='epic'?14:r==='ultra'?9:0;
    if(k==='dagger'){
      c.rotate(.55); c.fillStyle=col; poly(c,[[0,-len*.72],[9,-6],[2,12],[-5,12],[-8,-6]]); c.fillStyle='#e5e7eb'; poly(c,[[0,-len*.62],[4,-5],[0,4],[-4,-5]]); c.fillStyle='#5b3415'; rr(c,-12,8,24,7,2); if(attacking){ c.strokeStyle=col; c.lineWidth=3; for(let i=0;i<2;i++){ c.beginPath(); c.arc(5+i*5,-18-i*10,28+i*10,-1.6,.45); c.stroke(); } }
    }else if(k==='bow'){
      c.strokeStyle=col; c.lineWidth=5; c.beginPath(); c.arc(0,-20,34,-1.35,1.35); c.stroke(); c.strokeStyle='#f8fafc'; c.lineWidth=1.5; c.beginPath(); c.moveTo(12,-52); c.lineTo(12,12); c.stroke(); c.strokeStyle=col; c.beginPath(); c.moveTo(-12,-20); c.lineTo(42,-20); c.stroke(); if(attacking){ c.strokeStyle='#facc15'; c.lineWidth=2; c.beginPath(); c.moveTo(8,-20); c.lineTo(80,-20); c.stroke(); }
    }else if(k==='staff'){
      c.strokeStyle='#7c4a1e'; c.lineWidth=5; c.beginPath(); c.moveTo(0,20); c.lineTo(0,-len); c.stroke(); c.fillStyle=col; circ(c,0,-len-8,r==='legendary'?13:9); c.strokeStyle=col; c.lineWidth=2; c.beginPath(); c.arc(0,-len-8,18,0,Math.PI*2); c.stroke(); if(attacking){ drawMiniSpark(c,Math.min(70,len),col,10); }
    }else if(k==='axe'){
      c.strokeStyle='#7c4a1e'; c.lineWidth=5; c.beginPath(); c.moveTo(0,18); c.lineTo(0,-len); c.stroke(); c.fillStyle=col; poly(c,[[0,-len+2],[26,-len+12],[18,-len+40],[0,-len+28]]); c.fillStyle='#cbd5e1'; poly(c,[[0,-len+2],[-24,-len+14],[-15,-len+38],[0,-len+28]]); if(attacking){ c.strokeStyle=col; c.lineWidth=4; c.beginPath(); c.arc(0,-len+20,45,-.8,1.8); c.stroke(); }
    }else if(k==='spear'){
      c.strokeStyle='#8b5a2b'; c.lineWidth=4; c.beginPath(); c.moveTo(0,22); c.lineTo(0,-len-18); c.stroke(); c.fillStyle=col; poly(c,[[0,-len-38],[13,-len-12],[0,-len],[-13,-len-12]]); if(attacking){ c.strokeStyle=col; c.lineWidth=3; c.beginPath(); c.moveTo(0,-len-25); c.lineTo(80,-len-25); c.stroke(); }
    }else if(k==='gun'){
      c.fillStyle='#cbd5e1'; rr(c,-6,-20,43,12,3); c.fillStyle=col; rr(c,24,-24,24,6,2); c.fillStyle='#374151'; rr(c,6,-8,9,22,2); if(attacking){ c.fillStyle='#facc15'; poly(c,[[53,-21],[76,-29],[70,-19],[78,-10]]); }
    }else{
      c.fillStyle='#cbd5e1'; poly(c,[[0,-len],[12,-12],[7,16],[-7,16],[-12,-12]]); c.fillStyle=col; rr(c,-19,7,38,8,2); c.fillStyle='#7c2d12'; rr(c,-6,13,12,22,2); if(attacking){ c.strokeStyle=col; c.lineWidth=4; c.beginPath(); c.arc(0,-len*.38,44,-.95,1.1); c.stroke(); if(r==='legendary'||r==='epic'){ c.strokeStyle='rgba(255,255,255,.8)'; c.beginPath(); c.arc(0,-len*.45,58,-.7,.9); c.stroke(); } }
    }
    c.restore();
  };

  // Armor/helmet overlay on the already drawn body so equipped armor is visibly different.
  const oldBody=typeof drawPlayerBody==='function'?drawPlayerBody:null;
  drawPlayerBody = window.drawPlayerBody = function drawPlayerBodyWithEquipOverlay(c, player){
    if(oldBody) oldBody.apply(this,arguments);
    const eq=(player&&player.__drawEquipment)||equipment||{};
    const armor=item(eq.armor), helm=item(eq.helmet), boots=item(eq.knee||eq.boots);
    c.save();
    if(armor){ const col=rcol(armor), r=rarity(armor); c.shadowColor=col; c.shadowBlur=r==='legendary'?14:r==='epic'?9:0; c.fillStyle=col; poly(c,[[-15,-62],[15,-62],[21,-47],[14,-32],[-14,-32],[-21,-47]]); c.fillStyle='rgba(2,6,23,.35)'; rr(c,-9,-55,18,15,4); c.strokeStyle='rgba(255,255,255,.6)'; c.lineWidth=2; c.beginPath(); c.moveTo(-12,-45); c.lineTo(12,-45); c.stroke(); }
    if(helm){ const col=rcol(helm); c.fillStyle=col; c.beginPath(); c.ellipse(0,-118,24,12,0,Math.PI,0); c.lineTo(21,-106); c.lineTo(-21,-106); c.closePath(); c.fill(); c.fillStyle='rgba(2,6,23,.55)'; rr(c,-16,-110,32,5,2); }
    if(boots){ const col=rcol(boots); c.fillStyle=col; rr(c,-24,-9,15,6,3); rr(c,9,-9,15,6,3); }
    c.restore();
  };

  // Projectiles: bow/staff/gun/stone/skill visuals are not all the same orb anymore.
  const oldDrawProjectiles=typeof drawProjectiles==='function'?drawProjectiles:null;
  drawProjectiles = window.drawProjectiles = function drawProjectilesDistinct(){
    arr(game.projectiles).forEach(function(p){
      if(!p) return; const v=String(p.visual||p.kind||''); const col=p.color||'#facc15'; ctx.save(); ctx.translate(p.x,p.y);
      ctx.shadowColor=col; ctx.shadowBlur=12; ctx.globalAlpha=Math.max(.2,Math.min(1,p.life||1));
      if(/arrow|bow/.test(v)){ ctx.strokeStyle='#f8fafc'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-22,0); ctx.lineTo(20,0); ctx.stroke(); ctx.fillStyle=col; poly(ctx,[[24,0],[10,-6],[10,6]]); }
      else if(/bullet|gun/.test(v)){ ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(0,0,14,5,0,0,Math.PI*2); ctx.fill(); ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.beginPath(); ctx.moveTo(-24,0); ctx.lineTo(-6,0); ctx.stroke(); }
      else if(/stone/.test(v)){ ctx.fillStyle='#9ca3af'; ctx.beginPath(); ctx.ellipse(0,0,9,7,.4,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#64748b'; circ(ctx,-3,-2,2); }
      else if(/fire|dragon/.test(v)){ ctx.fillStyle='#fb923c'; poly(ctx,[[18,0],[-8,-10],[-18,0],[-8,10]]); ctx.fillStyle='#fef08a'; circ(ctx,0,0,5); }
      else if(/ice|frost/.test(v)){ ctx.fillStyle='#93c5fd'; poly(ctx,[[20,0],[0,-9],[-20,0],[0,9]]); ctx.strokeStyle='#e0f2fe'; ctx.stroke(); }
      else if(/dark|shadow/.test(v)){ ctx.fillStyle='#4c1d95'; circ(ctx,0,0,11); ctx.strokeStyle='#c084fc'; ctx.beginPath(); ctx.arc(0,0,18,0,Math.PI*1.4); ctx.stroke(); }
      else { ctx.fillStyle=col; circ(ctx,0,0,9); ctx.strokeStyle='rgba(255,255,255,.8)'; ctx.beginPath(); ctx.arc(0,0,16,0,Math.PI*2); ctx.stroke(); }
      ctx.restore();
    });
    if(oldDrawProjectiles){
      // Prevent duplicate old orb draw by only letting enemy-projectile extensions run if they draw separate arrays.
      try { /* intentionally not calling the old player projectile orb renderer */ } catch(_){}
    }
  };

  // Elite monster guarantee, even on online rooms whose old server snapshot was seeded before elites existed.
  const ELITES={
    lumina:[['킹 슬라임','slime','split'],['고대 잎새정령','sprite','ranged']],
    greenwood:[['이끼엄니 브루토','boar','charge'],['가시여왕 베르다','bug','poison']],
    ellenium:[['마나 폭풍 위습','spirit','ranged'],['룬버섯 모르간','mushroom','stun']],
    valoran:[['강철돌격대장','boar','charge'],['방패골렘 가론','golem','guard']],
    shadowport:[['밤그림자 카론','bat','stun'],['항구쥐 두목 리코','rat','poison']],
    frostholm:[['서리늑대 알카','wolf','frost'],['얼음혼령 네비아','spirit','ranged']],
    solas:[['태양전갈 사르','scorpion','burn'],['모래도마뱀 라자','lizard','charge']],
    nocturn:[['부서진 기사 넬','armor','stun'],['저주구체 오르브','orb','ranged']]
  };
  function townKey(){ const h=String(game&&game.huntId||game&&game.townId||'lumina'); return (h.split('_')[0]||h.split(':')[0]||'lumina').replace(/field|hunt/g,'') || 'lumina'; }
  function floorY(x){ const ps=arr(game&&game.platforms); let best=game&&game.ground||520, bd=1e9; ps.forEach(function(p){ if(!p) return; const inside=x>=p.x-80 && x<=p.x+(p.w||0)+80; const d=inside?Math.abs((p.y||best)-best):1e9; if(inside && d<bd){ best=p.y; bd=d; } }); return best; }
  function typeForElite(name,fam,gim,i){ const lv=Math.max(3, (game&&game.player&&game.player.level||1)+3+i*2); return { family:fam, name:name, level:lv, hp:120+lv*55, atk:5+lv*3, exp:60+lv*20, gold:90+lv*28, respawn:300000, dropRate:.85, gimmick:gim, isElite:true, isNamed:true }; }
  function ensureElitesVisible(sendSeed){
    if(!game || game.mode!=='hunt') return;
    game.monsters=arr(game.monsters);
    const key=townKey(); const defs=ELITES[key]||ELITES.lumina;
    defs.forEach(function(d,i){
      const id='elite:'+key+':'+i;
      let m=game.monsters.find(function(mm){ return mm && (mm.uid===id || mm.sharedId===id || mm.eliteId===id || mm.name===d[0]); });
      if(!m){ const x=760+i*1220; const y=floorY(x); const t=typeForElite(d[0],d[1],d[2],i); m={ uid:id, sharedId:id, eliteId:id, isElite:true, isNamed:true, name:d[0], family:d[1], type:t, x:x, baseX:x, y:y, spawnY:y, hp:t.hp, maxHp:t.hp, face:-1, time:0, hit:0, dead:false, respawn:300000, gimmick:d[2], aggro:false, canHitAt:0 }; game.monsters.push(m); }
      else { m.uid=m.uid||id; m.sharedId=m.sharedId||id; m.eliteId=id; m.isElite=true; m.isNamed=true; m.name=d[0]; m.gimmick=m.gimmick||d[2]; if(m.type){ m.type.name=d[0]; m.type.isElite=true; m.type.isNamed=true; m.type.gimmick=m.gimmick; m.type.respawn=300000; } if(!m.dead && (!m.hp || m.hp<1)) m.hp=m.maxHp||(m.type&&m.type.hp)||100; }
    });
    if(sendSeed && window.PixelRpgMultiplayer && PixelRpgMultiplayer.socket && PixelRpgMultiplayer.connected){
      try{ PixelRpgMultiplayer.socket.emit('monster:seed',{ room:'hunt:'+(game.huntId||'hunt'), huntId:game.huntId, layout:'force-elite-visible-v2', monsters:game.monsters.map(function(m,i){ const t=m.type||{}; return { id:m.sharedId||m.uid||((game.huntId||'hunt')+':'+i), index:i, family:t.family||m.family, name:m.name||t.name, level:t.level||m.level||1, x:Math.round(m.x||0), y:Math.round(m.y||0), baseX:Math.round(m.baseX||m.x||0), spawnY:Math.round(m.spawnY||m.y||0), hp:Math.max(0,Math.round(m.hp||0)), maxHp:Math.max(1,Math.round(m.maxHp||t.hp||1)), dead:!!m.dead, respawn:(m.isElite||m.isNamed)?300000:Math.max(10000,m.respawn||10000), isElite:!!m.isElite, isNamed:!!m.isNamed, namedKey:m.eliteId||m.namedKey||null, gimmick:m.gimmick||t.gimmick||'' }; }) }); }catch(e){ console.warn('[elite force seed failed]',e); }
    }
  }
  window.__ensureElitesVisible = ensureElitesVisible;
  const oldSpawn=typeof spawnMonsters==='function'?spawnMonsters:null;
  if(oldSpawn) spawnMonsters = window.spawnMonsters = function(){ const r=oldSpawn.apply(this,arguments); ensureElitesVisible(true); return r; };
  const oldLoadH=typeof loadHunt==='function'?loadHunt:null;
  if(oldLoadH) loadHunt = window.loadHunt = function(){ const r=oldLoadH.apply(this,arguments); setTimeout(function(){ensureElitesVisible(true);},120); setTimeout(function(){ensureElitesVisible(true);},900); return r; };
  const oldUpd=typeof updateMonsters==='function'?updateMonsters:null;
  let lastEliteCheck=0;
  if(oldUpd) updateMonsters = window.updateMonsters = function(dt){ const r=oldUpd.apply(this,arguments); const n=performance.now(); if(n-lastEliteCheck>2000){ lastEliteCheck=n; ensureElitesVisible(true); } return r; };
  const oldDrawMons=typeof drawMonsters==='function'?drawMonsters:null;
  if(oldDrawMons) drawMonsters = window.drawMonsters = function(){ ensureElitesVisible(false); oldDrawMons.apply(this,arguments); };

  if(typeof text==='function') text('엘리트/아이템 외형/장착 외형 보정 적용','#facc15');
})();


/* =========================================================
   V13 FINAL FORCE PATCH
   - 기존 저장 캐릭터 데이터는 건드리지 않음
   - TOWNS/HUNTS/ITEMS가 window에 붙지 않는 const 구조에서도 직접 접근
   - 택시 레벨 제한, 도시 추가, 직업 NPC/오브젝트, 상점 분리,
     몬스터 수/엘리트/기믹, NPC 외형, 아이템 아이콘 위치 보정
========================================================= */
(function V13_FINAL_FORCE_PATCH(){
  'use strict';
  if (window.__PIXEL_RPG_V13_FINAL_PATCHED__) return;
  window.__PIXEL_RPG_V13_FINAL_PATCHED__ = true;
  window.PIXEL_RPG_PATCH_VERSION = 'V13_FINAL_VISIBLE_20260618';

  function okData(){ return typeof TOWNS !== 'undefined' && typeof HUNTS !== 'undefined' && typeof ITEMS !== 'undefined'; }
  function okGame(){ return typeof game !== 'undefined' && game && game.player; }
  function arr(v){ return Array.isArray(v) ? v : []; }
  function num(v,d){ v = Number(v); return Number.isFinite(v) ? v : d; }
  function clampV(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function rnd(a,b){ return a + Math.random() * (b - a); }
  function idOf(ref){ try { return typeof itemRefId === 'function' ? itemRefId(ref) : (typeof ref === 'string' ? ref : ref && ref.id); } catch (_) { return typeof ref === 'string' ? ref : ref && ref.id; } }
  function hitBox(x,y,rx,ry,rw,rh){ return typeof hit === 'function' ? hit(x,y,rx,ry,rw,rh) : (x>=rx && x<=rx+rw && y>=ry && y<=ry+rh); }
  function text(msg,x,y,color){ try { if (typeof makeText === 'function' && okGame()) makeText(msg,x,y,color||'#ffe066'); } catch(_){} }
  function circle2(c,x,y,r,col){ c.fillStyle = col; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }
  function round2(c,x,y,w,h,r){ if (typeof roundRect === 'function') roundRect(c,x,y,w,h,r||6); else c.fillRect(x,y,w,h); }
  function poly2(c,pts,col){ c.fillStyle=col; c.beginPath(); pts.forEach(function(p,i){ if(i)c.lineTo(p[0],p[1]); else c.moveTo(p[0],p[1]); }); c.closePath(); c.fill(); }
  function burst(x,y,color,count){ if(!okGame() || !game.particles) return; for(var i=0;i<(count||24);i++) game.particles.push({x:x+rnd(-16,16),y:y+rnd(-16,16),vx:rnd(-150,150),vy:rnd(-210,45),life:rnd(.35,.95),color:color||'#ffe066'}); }

  var V13_LEVELS = {
    lumina:1, greenwood:4, ellenium:8, valor:8, shadowport:9, sylvania:9,
    irondeep:14, frosthall:18, solas:22, nocturn:28,
    aurora:34, emberfall:40, stormpeak:46, celestia:54, abyssgate:62
  };
  var V13_TOWN_LABELS = {
    lumina:'Lv.1~5', greenwood:'Lv.4~9', ellenium:'Lv.8~15', valor:'Lv.8~15', shadowport:'Lv.9~17', sylvania:'Lv.9~17',
    irondeep:'Lv.14~22', frosthall:'Lv.18~28', solas:'Lv.22~35', nocturn:'Lv.28~45',
    aurora:'Lv.34~42', emberfall:'Lv.40~50', stormpeak:'Lv.46~58', celestia:'Lv.54~66', abyssgate:'Lv.62+'
  };
  var V13_EXTRA_TOWNS = [
    { id:'aurora', name:'오로라', title:'극광 성역', theme:'ice', taxiCost:520, minLevel:34, hunt:'aurora_sanctum', bgTop:'#8be9ff', bgBottom:'#eefbff' },
    { id:'emberfall', name:'엠버폴', title:'화염 협곡', theme:'desert', taxiCost:680, minLevel:40, hunt:'emberfall_crater', bgTop:'#ff9b73', bgBottom:'#ffe1b8' },
    { id:'stormpeak', name:'스톰피크', title:'폭풍 산맥', theme:'fortress', taxiCost:840, minLevel:46, hunt:'stormpeak_cliff', bgTop:'#7186ff', bgBottom:'#dbe3ff' },
    { id:'celestia', name:'셀레스티아', title:'별빛 도시', theme:'magic', taxiCost:1100, minLevel:54, hunt:'celestia_orbit', bgTop:'#7566ff', bgBottom:'#f3e8ff' },
    { id:'abyssgate', name:'어비스게이트', title:'심연의 관문', theme:'ruin', taxiCost:1500, minLevel:62, hunt:'abyssgate_depth', bgTop:'#312e81', bgBottom:'#a5b4fc' }
  ];
  var V13_EXTRA_HUNTS = {
    aurora_sanctum:{town:'aurora',name:'오로라 성역',baseLevel:34,families:['ice','mana']},
    emberfall_crater:{town:'emberfall',name:'엠버폴 분화구',baseLevel:40,families:['desert','boar']},
    stormpeak_cliff:{town:'stormpeak',name:'스톰피크 절벽',baseLevel:46,families:['ore','bug']},
    celestia_orbit:{town:'celestia',name:'셀레스티아 궤도',baseLevel:54,families:['mana','ruin']},
    abyssgate_depth:{town:'abyssgate',name:'심연의 깊은 문',baseLevel:62,families:['ruin','shadow']}
  };
  var V13_JOBS = {
    lumina:[
      {id:'v13_warrior',name:'기사단장 로한',type:'job',role:'warrior',quest:'warrior_job',text:'전사 1차 전직을 담당합니다.'},
      {id:'v13_mage',name:'대마법사 이렌',type:'job',role:'mage',quest:'mage_job',text:'마법사 1차 전직을 담당합니다.'},
      {id:'v13_rogue',name:'그림자 교관 란',type:'job',role:'rogue',quest:'rogue_job',text:'도적 1차 전직을 담당합니다.'},
      {id:'v13_archer',name:'명궁 세리아',type:'job',role:'archer',quest:'archer_job',text:'궁수 1차 전직을 담당합니다.'},
      {id:'v13_sacred_sword',name:'바닥에 꽂힌 성검',type:'job_object',role:'sacred_sword',quest:'warrior_job',text:'검에 손을 대면 용사의 전직 시험이 열립니다.'}
    ],
    greenwood:[
      {id:'v13_ranger',name:'숲의 수호자 리아',type:'job',role:'archer',quest:'archer_job',text:'희귀 궁수 계열 전직을 담당합니다.'},
      {id:'v13_cross',name:'빛나는 십자가',type:'job_object',role:'cross',quest:'mage_job',text:'성스러운 전직 시험이 시작됩니다.'}
    ],
    ellenium:[
      {id:'v13_rune_sage',name:'룬 현자 벨라',type:'job',role:'mage',quest:'mage_job',text:'희귀/에픽 마법 계열 전직을 담당합니다.'},
      {id:'v13_rune_stone',name:'고대 룬석',type:'job_object',role:'rune',quest:'mage_job',text:'룬석의 마력 시험이 시작됩니다.'}
    ],
    valor:[{id:'v13_knight_master',name:'왕국 기사단장 카일',type:'job',role:'warrior',quest:'warrior_job',text:'전사 2차/3차 전직을 담당합니다.'}],
    shadowport:[{id:'v13_assassin',name:'암살교관 카론',type:'job',role:'rogue',quest:'rogue_job',text:'희귀 도적 계열 전직을 담당합니다.'}],
    celestia:[
      {id:'v13_star_sage',name:'별의 현자 아스텔',type:'job',role:'star_sage',quest:'mage_job',text:'히든 직업 별의 현자를 담당합니다.'},
      {id:'v13_star_orb',name:'별빛 오브',type:'job_object',role:'star_orb',quest:'mage_job',text:'별빛 오브가 히든 전직 시험을 엽니다.'}
    ],
    abyssgate:[
      {id:'v13_dragon_knight',name:'용혈 스승 아르딘',type:'job',role:'dragon_knight',quest:'warrior_job',text:'히든 직업 용기사는 마지막 도시에서만 전직할 수 있습니다.'},
      {id:'v13_reaper',name:'심연 사신 모르가',type:'job',role:'shadow_reaper',quest:'rogue_job',text:'히든 직업 그림자 사신을 담당합니다.'},
      {id:'v13_abyss_crack',name:'심연의 균열',type:'job_object',role:'abyss_crack',quest:'rogue_job',text:'균열이 히든 전직 시험을 엽니다.'}
    ]
  };
  var V13_ELITES = {
    lumina:['킹 슬라임','slime','split'], greenwood:['독가시 여왕 베르다','bug','poison'], ellenium:['마나 폭풍 위습','mana','ranged'], valor:['강철 돌격대장','boar','charge'],
    shadowport:['밤그림자 카론','shadow','stun'], sylvania:['숲의 포식자 아라크','bug','grab'], irondeep:['광석 골렘 가론','ore','stun'], frosthall:['서리혼 네비아','ice','frost'],
    solas:['태양전갈 사르','desert','burn'], nocturn:['저주받은 기사 넬','ruin','grab'], aurora:['극광 수호자 루멘','ice','frost'], emberfall:['화염군주 이그니스','desert','burn'],
    stormpeak:['폭풍 도끼왕 브론','ore','charge'], celestia:['별무리 감시자 오르비스','mana','ranged'], abyssgate:['심연룡 아카로스','ruin','grab']
  };

  function installV13Data(){
    if (!okData()) return false;
    V13_EXTRA_TOWNS.forEach(function(t){ if(!TOWNS.some(function(x){return x.id===t.id;})) TOWNS.push(Object.assign({}, t)); });
    Object.keys(V13_EXTRA_HUNTS).forEach(function(k){ if(!HUNTS[k]) HUNTS[k]=Object.assign({}, V13_EXTRA_HUNTS[k]); });
    TOWNS.forEach(function(t){
      var lv = V13_LEVELS[t.id];
      if (!lv && t.id === 'valoran') lv = 8;
      t.minLevel = lv || 1;
      t.requiredLevel = t.minLevel;
      t.recommendLevel = V13_TOWN_LABELS[t.id] || ('Lv.' + t.minLevel + '+');
    });
    Object.assign(ITEMS, {
      hp_potion_mid:{id:'hp_potion_mid',name:'[희귀] 중급 회복 물약',type:'consumable',icon:'hp',price:180,sell:45,healHp:260,desc:'HP 260 회복'},
      hp_potion_high:{id:'hp_potion_high',name:'[에픽] 상급 회복 물약',type:'consumable',icon:'hp',price:650,sell:160,healHp:720,desc:'HP 720 회복'},
      hp_potion_best:{id:'hp_potion_best',name:'[전설] 최상급 회복 물약',type:'consumable',icon:'hp',price:1800,sell:450,healHp:1800,desc:'HP 1800 회복'},
      mp_potion_mid:{id:'mp_potion_mid',name:'[희귀] 중급 마나 물약',type:'consumable',icon:'mp',price:220,sell:55,healMp:190,desc:'MP 190 회복'},
      mp_potion_high:{id:'mp_potion_high',name:'[에픽] 상급 마나 물약',type:'consumable',icon:'mp',price:720,sell:180,healMp:560,desc:'MP 560 회복'},
      mp_potion_best:{id:'mp_potion_best',name:'[전설] 최상급 마나 물약',type:'consumable',icon:'mp',price:2000,sell:500,healMp:1400,desc:'MP 1400 회복'}
    });
    if (ITEMS.hp_potion) Object.assign(ITEMS.hp_potion,{name:'[일반] 초급 회복 물약',price:30,healHp:80,desc:'HP 80 회복'});
    if (ITEMS.mp_potion) Object.assign(ITEMS.mp_potion,{name:'[일반] 초급 마나 물약',price:35,healMp:50,desc:'MP 50 회복'});
    Object.keys(ITEMS).forEach(function(id){ var it=ITEMS[id]; if(!it) return; if(/staff/.test(id)) it.weaponType='staff'; else if(/bow/.test(id)) it.weaponType='bow'; else if(/dagger/.test(id)) it.weaponType='dagger'; else if(/axe/.test(id)) it.weaponType='axe'; else if(/spear|lance/.test(id)) it.weaponType='spear'; else if((/sword|blade/.test(id)) && it.type==='weapon') it.weaponType='sword'; });
    return true;
  }
  function reqLevel(townId){ installV13Data(); var t=TOWNS.find(function(x){return x.id===townId;}); return t ? num(t.minLevel,1) : 1; }
  function playerLevel(){ return okGame() ? num(game.player.level,1) : 1; }
  function canGo(townId){ return playerLevel() >= reqLevel(townId); }

  function ensureQuest(id, job, title){ if(typeof QUESTS === 'undefined') return; if(!QUESTS[id]) QUESTS[id]={id:id,title:title,town:'lumina',npc:'전직 시험',desc:'전직 시험 몬스터 3마리를 처치하세요.',jobReward:job,goals:[{type:'kill',family:'slime',need:3,count:0}],rewardGold:150,rewardExp:180}; }
  function installV13Quests(){ ensureQuest('warrior_job','warrior','전사의 증명'); ensureQuest('mage_job','mage','마법사의 길'); ensureQuest('rogue_job','rogue','그림자 시험'); ensureQuest('archer_job','archer','숲의 사수'); }

  function uniqueTownNPCs(){
    if(!okGame() || game.mode !== 'town') return;
    installV13Data(); installV13Quests();
    game.npcs = arr(game.npcs).filter(function(n){
      if(!n) return false;
      var s=String((n.id||'')+' '+(n.name||''));
      if(n.__v13Job || n.type === 'job_object') return false;
      if(/용혈|아르딘|심연 사신|별의 현자|기사단장 로한|대마법사 이렌|그림자 교관|그림자 란|명궁 세리아|성검|십자가|룬석|오브|균열|수호자 리아|룬 현자|왕국 기사단장|암살교관/.test(s)) return false;
      return true;
    });
    var list = arr(V13_JOBS[game.townId]);
    var baseX = game.townId === 'lumina' ? 1500 : 1700;
    list.forEach(function(j,i){ game.npcs.push(Object.assign({__v13Job:true,x:baseX+i*190,y:game.ground,text:j.text||'전직을 담당합니다.'}, j)); });
  }

  var oldLoadTownV13 = typeof loadTown === 'function' ? loadTown : null;
  if(oldLoadTownV13){
    loadTown = window.loadTown = function loadTownV13(id){
      installV13Data();
      id = id || 'lumina';
      if(!canGo(id)){
        text('Lv.'+reqLevel(id)+'부터 이동할 수 있습니다.', okGame()?game.player.x:260, okGame()?game.player.y-120:430, '#ff8787');
        id = okGame() && game.townId ? game.townId : 'lumina';
      }
      var r = oldLoadTownV13.call(this,id);
      uniqueTownNPCs(); setTimeout(uniqueTownNPCs,80);
      return r;
    };
  }

  function drawJobObject(role){
    if(role==='sacred_sword'){ ctx.strokeStyle='#f8fafc'; ctx.lineWidth=9; ctx.beginPath(); ctx.moveTo(0,-72); ctx.lineTo(0,-8); ctx.stroke(); ctx.fillStyle='#facc15'; ctx.fillRect(-25,-32,50,9); circle2(ctx,0,-80,11,'#60a5fa'); }
    else if(role==='cross'){ ctx.fillStyle='#fef3c7'; ctx.fillRect(-8,-78,16,74); ctx.fillRect(-30,-58,60,13); ctx.shadowColor='#fde68a'; ctx.shadowBlur=16; }
    else if(role==='rune'){ ctx.fillStyle='#64748b'; round2(ctx,-28,-66,56,58,10); ctx.strokeStyle='#a78bfa'; ctx.lineWidth=5; ctx.strokeRect(-17,-55,34,38); }
    else if(role==='star_orb'){ ctx.shadowColor='#f0abfc'; ctx.shadowBlur=18; circle2(ctx,0,-46,25,'#c084fc'); circle2(ctx,0,-46,12,'#fef3c7'); }
    else { ctx.shadowColor='#818cf8'; ctx.shadowBlur=18; ctx.strokeStyle='#312e81'; ctx.lineWidth=8; ctx.beginPath(); ctx.arc(0,-42,30,0,Math.PI*2); ctx.stroke(); }
  }
  function inferRole(npc){
    var s=String((npc&&npc.name)||'')+' '+String((npc&&npc.type)||'')+' '+String((npc&&npc.role)||'');
    if(/택시/.test(s)) return 'taxi';
    if(/장비/.test(s)) return 'weapon_shop';
    if(/대장장이|브론/.test(s)) return 'blacksmith';
    if(/상인/.test(s)) return 'merchant';
    if(/마법|현자|이렌|벨라|아스텔/.test(s)) return 'mage';
    if(/도적|그림자|암살|사신|카론|란|모르가/.test(s)) return 'rogue';
    if(/궁수|명궁|숲의 수호자|세리아|리아/.test(s)) return 'archer';
    if(/용혈|용기사|아르딘|dragon/.test(s)) return 'dragon_knight';
    if(/기사|전사|로한|카일/.test(s)) return 'warrior';
    if(/장로|퀘스트/.test(s)) return 'quest';
    return 'villager';
  }
  drawNPCBody = window.drawNPCBody = function drawNPCBodyV13(npc){
    if(!npc) return;
    var role = npc.role || inferRole(npc);
    ctx.save(); ctx.translate(npc.x,npc.y); ctx.scale(.78,.78);
    ctx.fillStyle='rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(0,4,30,7,0,0,Math.PI*2); ctx.fill();
    if(npc.type==='job_object'){ drawJobObject(role); ctx.restore(); return; }
    var main='#2563eb', trim='#dbeafe', hair='#111827', prop='none';
    if(role==='taxi'){ main='#facc15'; trim='#111827'; hair='#111827'; prop='taxi'; }
    else if(role==='merchant'){ main='#f97316'; trim='#fed7aa'; hair='#78350f'; prop='bag'; }
    else if(role==='weapon_shop'){ main='#64748b'; trim='#cbd5e1'; hair='#334155'; prop='shield'; }
    else if(role==='blacksmith'){ main='#7c2d12'; trim='#f59e0b'; hair='#292524'; prop='hammer'; }
    else if(role==='quest'){ main='#7c3aed'; trim='#fef08a'; hair='#e5e7eb'; prop='scroll'; }
    else if(role==='warrior'){ main='#475569'; trim='#facc15'; hair='#78350f'; prop='sword'; }
    else if(role==='mage' || role==='star_sage'){ main=role==='star_sage'?'#7c3aed':'#4f46e5'; trim='#93c5fd'; hair='#e5e7eb'; prop='staff'; }
    else if(role==='rogue' || role==='shadow_reaper'){ main='#111827'; trim='#c084fc'; hair='#0f172a'; prop='dagger'; }
    else if(role==='archer'){ main='#166534'; trim='#86efac'; hair='#78350f'; prop='bow'; }
    else if(role==='dragon_knight'){ main='#7f1d1d'; trim='#fb923c'; hair='#f97316'; prop='dragon'; }
    ctx.fillStyle=hair; ctx.beginPath(); ctx.arc(0,-92,27,Math.PI,0); ctx.fill();
    if(role==='taxi'){ ctx.fillStyle='#111827'; ctx.fillRect(-28,-110,56,16); ctx.fillStyle='#facc15'; ctx.fillText('TAXI',-18,-98); }
    ctx.fillStyle='#ffd6a6'; ctx.beginPath(); ctx.arc(0,-78,25,0,Math.PI*2); ctx.fill();
    circle2(ctx,-8,-79,3,'#111827'); circle2(ctx,8,-79,3,'#111827'); ctx.strokeStyle='#111827'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,-72,8,.1,Math.PI-.1); ctx.stroke();
    ctx.fillStyle=main; round2(ctx,-24,-53,48,42,10); ctx.fillStyle=trim; ctx.fillRect(-20,-44,40,8);
    ctx.strokeStyle='#ffd6a6'; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(-24,-42); ctx.lineTo(-40,-22); ctx.moveTo(24,-42); ctx.lineTo(40,-22); ctx.stroke();
    ctx.strokeStyle='#7c4a20'; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(-12,-12); ctx.lineTo(-20,14); ctx.moveTo(12,-12); ctx.lineTo(20,14); ctx.stroke();
    if(prop==='taxi'){ ctx.fillStyle='#facc15'; round2(ctx,39,-44,48,26,6); ctx.fillStyle='#111827'; ctx.fillRect(46,-30,12,8); ctx.fillRect(70,-30,12,8); }
    if(prop==='bag'){ ctx.fillStyle='#92400e'; round2(ctx,42,-40,28,34,7); ctx.fillStyle='#facc15'; ctx.fillRect(50,-46,12,8); }
    if(prop==='shield'){ ctx.fillStyle='#94a3b8'; round2(ctx,44,-55,32,42,6); ctx.strokeStyle='#e5e7eb'; ctx.lineWidth=3; ctx.strokeRect(50,-48,20,28); }
    if(prop==='hammer'){ ctx.strokeStyle='#92400e'; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(42,-18); ctx.lineTo(73,-50); ctx.stroke(); ctx.fillStyle='#cbd5e1'; ctx.fillRect(62,-62,36,16); }
    if(prop==='scroll'){ ctx.fillStyle='#fef3c7'; round2(ctx,42,-58,36,34,6); ctx.strokeStyle='#7c3aed'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(49,-48); ctx.lineTo(71,-48); ctx.moveTo(49,-39); ctx.lineTo(66,-39); ctx.stroke(); }
    if(prop==='sword'){ ctx.strokeStyle='#e5e7eb'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(42,-35); ctx.lineTo(74,-80); ctx.stroke(); ctx.fillStyle='#facc15'; ctx.fillRect(38,-47,32,7); }
    if(prop==='staff'){ ctx.strokeStyle='#7c3aed'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(42,-15); ctx.lineTo(66,-84); ctx.stroke(); circle2(ctx,69,-90,10,role==='star_sage'?'#f0abfc':'#93c5fd'); }
    if(prop==='bow'){ ctx.strokeStyle='#facc15'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(50,-52,35,-1.2,1.2); ctx.stroke(); }
    if(prop==='dagger'){ ctx.strokeStyle='#c084fc'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(40,-25); ctx.lineTo(68,-58); ctx.stroke(); }
    if(prop==='dragon'){ poly2(ctx,[[52,-98],[95,-120],[82,-78]],'#ef4444'); poly2(ctx,[[75,-70],[110,-70],[88,-42]],'#f97316'); ctx.strokeStyle='#e5e7eb'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(42,-25); ctx.lineTo(78,-76); ctx.stroke(); }
    ctx.restore();
  };

  var potionShop = ['hp_potion','hp_potion_mid','hp_potion_high','hp_potion_best','mp_potion','mp_potion_mid','mp_potion_high','mp_potion_best'];
  function shopBuyList(){ installV13Data(); return game && game.shopOpen==='merchant' ? potionShop.filter(function(id){return ITEMS[id];}) : (typeof getShopItemsForCurrentTown==='function' ? getShopItemsForCurrentTown() : potionShop).filter(function(id){return ITEMS[id];}).slice(0,18); }
  drawShopPanel = window.drawShopPanel = function drawShopPanelV13(){
    installV13Data(); ctx.save(); ctx.fillStyle='rgba(15,23,42,.94)'; ctx.fillRect(0,0,W,H);
    ctx.fillStyle='#ffe066'; ctx.font='bold 32px sans-serif'; ctx.textAlign='left'; ctx.fillText('V13 상점 - 구매 / 판매 완전 분리',40,62);
    ctx.fillStyle='#dbeafe'; ctx.font='bold 17px sans-serif'; ctx.fillText('왼쪽은 구매, 오른쪽은 내 인벤토리 판매입니다. 서로 겹치지 않습니다.',40,92);
    var list=shopBuyList(); var bx=45, by=125, bw=580, row=58;
    ctx.fillStyle='rgba(30,41,59,.95)'; round2(ctx,bx,by,bw,460,8); ctx.fillStyle='#93c5fd'; ctx.font='bold 20px sans-serif'; ctx.fillText('구매 목록',bx+20,by+32);
    for(var i=0;i<list.length;i++){ var it=ITEMS[list[i]], y=by+52+i*row; if(y>by+430) break; ctx.fillStyle='rgba(51,65,85,.85)'; round2(ctx,bx+18,y,bw-36,48,8); drawItemIcon(it,bx+48,y+24,34); ctx.fillStyle='#fff'; ctx.font='bold 16px sans-serif'; ctx.fillText(it.name,bx+78,y+20); ctx.fillStyle='#facc15'; ctx.font='14px sans-serif'; ctx.fillText((it.desc||'')+' / '+(it.price||0)+'원',bx+78,y+40); }
    var sx=675, sy=125, sw=560; ctx.fillStyle='rgba(15,23,42,.98)'; ctx.strokeStyle='#64748b'; ctx.lineWidth=3; round2(ctx,sx,sy,sw,460,8); ctx.strokeRect(sx,sy,sw,460); ctx.fillStyle='#93c5fd'; ctx.font='bold 20px sans-serif'; ctx.fillText('내 인벤토리 판매',sx+20,sy+32);
    var inv=arr(inventory.items); for(var j=0;j<Math.min(inv.length,30);j++){ var st=inv[j], item=ITEMS[idOf(st)]; if(!item) continue; var cx=sx+28+(j%6)*84, cy=sy+60+Math.floor(j/6)*76; ctx.fillStyle='rgba(30,41,59,.95)'; round2(ctx,cx,cy,64,58,8); drawItemIcon(item,cx+32,cy+26,36); ctx.fillStyle='#facc15'; ctx.font='bold 12px sans-serif'; ctx.textAlign='center'; ctx.fillText(((item.sell||0)*(st.count||1))+'원',cx+32,cy+54); ctx.textAlign='left'; }
    ctx.fillStyle='#22c55e'; round2(ctx,805,610,280,46,8); ctx.fillStyle='#fff'; ctx.font='bold 20px sans-serif'; ctx.textAlign='center'; ctx.fillText('부산물 모두 판매',945,640);
    ctx.fillStyle='#475569'; round2(ctx,1110,610,130,46,8); ctx.fillStyle='#fff'; ctx.fillText('닫기',1175,640); ctx.restore();
  };
  handleShopClick = window.handleShopClick = function handleShopClickV13(x,y){
    if(hitBox(x,y,1110,610,130,46)){ game.shopOpen=false; game.shopScroll=0; return; }
    if(hitBox(x,y,805,610,280,46)){ if(typeof sellAllEtc==='function') sellAllEtc(); return; }
    var list=shopBuyList(), bx=45, by=125, row=58;
    for(var i=0;i<list.length;i++){ var yy=by+52+i*row; if(yy>by+430) break; if(hitBox(x,y,bx+18,yy,544,48)){ if(typeof buyItem==='function') buyItem(list[i]); return; } }
    var sx=675, sy=125, inv=arr(inventory.items);
    for(var j=0;j<Math.min(inv.length,30);j++){ var cx=sx+28+(j%6)*84, cy=sy+60+Math.floor(j/6)*76; if(hitBox(x,y,cx,cy,64,58)){ var st=inv[j], it=ITEMS[idOf(st)]; if(!it) return; wallet.gold += (it.sell||1)*(st.count||1); inventory.items.splice(j,1); text(it.name+' 판매',game.player.x,game.player.y-90,'#facc15'); return; } }
  };

  drawTaxiPanel = window.drawTaxiPanel = function drawTaxiPanelV13(){
    installV13Data(); ctx.save(); ctx.fillStyle='rgba(15,23,42,.95)'; ctx.fillRect(0,0,W,H); ctx.fillStyle='#ffe066'; ctx.font='bold 36px sans-serif'; ctx.textAlign='left'; ctx.fillText('V13 택시 이동 - 도시별 요구 레벨 적용',50,72); ctx.fillStyle='#dbeafe'; ctx.font='bold 17px sans-serif'; ctx.fillText('레벨이 부족한 도시는 클릭해도 이동할 수 없습니다.',50,103);
    for(var i=0;i<TOWNS.length;i++){ var t=TOWNS[i], col=i%2, row=Math.floor(i/2), x=60+col*560, y=130+row*55, ok=canGo(t.id), cur=t.id===game.townId; ctx.fillStyle=cur?'rgba(100,116,139,.88)':ok?'rgba(30,41,59,.92)':'rgba(80,32,45,.9)'; round2(ctx,x,y,510,46,6); ctx.fillStyle=ok?'#fff':'#fecaca'; ctx.font='bold 18px sans-serif'; ctx.fillText(t.title+' '+t.name,x+20,y+19); ctx.fillStyle=cur?'#facc15':ok?'#facc15':'#fb7185'; ctx.font='bold 14px sans-serif'; ctx.fillText('필요 Lv.'+reqLevel(t.id)+' · '+(t.taxiCost||0)+'원'+(cur?' · 현재 위치':ok?'':' · 레벨 부족'),x+20,y+39); }
    ctx.fillStyle='#475569'; round2(ctx,1085,632,130,44,8); ctx.fillStyle='#fff'; ctx.font='bold 18px sans-serif'; ctx.textAlign='center'; ctx.fillText('닫기',1150,661); ctx.restore();
  };
  handleTaxiClick = window.handleTaxiClick = function handleTaxiClickV13(x,y){
    if(hitBox(x,y,1085,632,130,44) || hitBox(x,y,1000,610,160,60)){ game.taxiOpen=false; return; }
    installV13Data();
    for(var i=0;i<TOWNS.length;i++){ var t=TOWNS[i], bx=60+(i%2)*560, by=130+Math.floor(i/2)*55; if(hitBox(x,y,bx,by,510,46)){
      if(t.id===game.townId){ text('이미 현재 도시입니다.',game.player.x,game.player.y-90,'#cbd5e1'); game.taxiOpen=false; return; }
      if(!canGo(t.id)){ text('Lv.'+reqLevel(t.id)+'부터 이동할 수 있습니다.',game.player.x,game.player.y-115,'#ff8787'); return; }
      if(wallet.gold < (t.taxiCost||0)){ text('택시비 '+(t.taxiCost||0)+'원 필요',game.player.x,game.player.y-90,'#ff8787'); return; }
      wallet.gold -= (t.taxiCost||0); game.taxiOpen=false; loadTown(t.id); game.player.x=360; game.player.y=game.ground; return;
    }}
  };

  function familyData(f){ return (typeof FAMILY_DATA !== 'undefined' && FAMILY_DATA[f]) ? FAMILY_DATA[f] : {name:f,drop:'slime_jelly',color:'#94a3b8',shape:'slime'}; }
  function behaviorFor(f){ return {slime:'split',mushroom:'poison',mana:'ranged',boar:'charge',shadow:'stun',bug:'poison',ore:'stun',ice:'frost',desert:'burn',ruin:'grab'}[f] || 'melee'; }
  function monsterType(f,level,name,behavior){ var d=familyData(f); return {family:f,name:name || d.name,level:level,hp:55+level*24,atk:7+level*4,def:Math.floor(level*.8),exp:18+level*9,gold:12+level*6,drop:d.drop,dropRate:.45,color:d.color,shape:d.shape,speed:clampV(28+level*.55,28,64),respawn:10000,gimmick:behavior||behaviorFor(f)}; }
  function townFromHunt(h){ return (h && h.town) || (okGame()?game.townId:'lumina'); }
  function makeV13Monsters(hunt){
    if(!okGame() || game.mode !== 'hunt') return;
    installV13Data(); hunt = hunt || (typeof getHunt==='function' ? getHunt(game.huntId) : null) || {town:game.townId,baseLevel:1,families:['slime','mushroom']};
    var families=arr(hunt.families).length ? arr(hunt.families) : ['slime','mushroom']; var base=num(hunt.baseLevel,1), mons=[];
    families.forEach(function(f,fi){ for(var i=0;i<8;i++){ var x=640+i*520+fi*190; var y=fi%2?520:game.ground; var lv=base+(i%4)+fi*2, type=monsterType(f,lv,null,behaviorFor(f)); mons.push({uid:'v13:'+game.huntId+':'+f+':'+i,sharedId:'v13:'+game.huntId+':'+f+':'+i,v13Base:true,type:type,x:x,baseX:x,y:y,spawnY:y,hp:type.hp,maxHp:type.hp,face:i%2?1:-1,time:Math.random()*4,hit:0,dead:false,attackCooldown:rnd(.6,2.2),behavior:type.gimmick}); } });
    var town=townFromHunt(hunt), ed=V13_ELITES[town]||V13_ELITES.lumina, et=monsterType(ed[1],base+8,ed[0],ed[2]); et.hp*=4; et.atk*=1.8; et.exp*=5; et.gold*=5;
    mons.push({uid:'v13:elite:'+town,sharedId:'v13:elite:'+town,v13Base:true,isElite:true,isNamed:true,name:ed[0],type:et,x:4550,baseX:4550,y:game.ground,spawnY:game.ground,hp:et.hp,maxHp:et.hp,face:-1,time:0,hit:0,dead:false,attackCooldown:1,behavior:ed[2],gimmick:ed[2]});
    game.monsters=mons; game.enemyProjectiles=[];
  }
  spawnMonsters = window.spawnMonsters = function spawnMonstersV13(hunt){ makeV13Monsters(hunt); };
  var oldLoadHuntV13 = typeof loadHunt === 'function' ? loadHunt : null;
  if(oldLoadHuntV13) loadHunt = window.loadHunt = function loadHuntV13(id){ var r=oldLoadHuntV13.apply(this,arguments); setTimeout(function(){ makeV13Monsters(typeof getHunt==='function'?getHunt(game.huntId):null); },50); return r; };

  function damagePlayer(dmg,label,color){ if(!okGame() || game.player.invincible>0) return; dmg=Math.max(1,Math.floor(dmg-game.player.defense*.35)); game.player.hp=Math.max(0,game.player.hp-dmg); game.player.invincible=.45; game.player.hurtTime=.2; text(label||('-'+dmg),game.player.x,game.player.y-92,color||'#ff8787'); }
  function status(k,s){ if(!okGame()) return; game.player.v13Status=game.player.v13Status||{}; game.player.v13Status[k]=Math.max(game.player.v13Status[k]||0,s); text(k==='poison'?'중독':k==='burn'?'화상':k==='stun'?'기절':k==='frost'?'빙결 둔화':'상태 이상',game.player.x,game.player.y-125,'#c084fc'); }
  function enemyShot(m,kind){ game.enemyProjectiles=arr(game.enemyProjectiles); var dx=game.player.x-m.x, dist=Math.max(1,Math.abs(dx)); game.enemyProjectiles.push({x:m.x,y:m.y-55,vx:dx/dist*(kind==='fast'?470:335),vy:0,life:2.2,dmg:m.type.atk*.85,kind:kind,color:kind==='fire'?'#fb923c':kind==='ice'?'#93c5fd':kind==='poison'?'#86efac':'#c084fc'}); }
  updateMonsters = window.updateMonsters = function updateMonstersV13(dt){
    if(!okGame() || game.mode !== 'hunt') return;
    var hunt=typeof getHunt==='function'?getHunt(game.huntId):null, expected=(arr(hunt&&hunt.families).length||2)*8+1, baseCount=arr(game.monsters).filter(function(m){return m && m.v13Base;}).length;
    if(!arr(game.monsters).some(function(m){return m&&m.isElite;}) || baseCount!==expected) makeV13Monsters(hunt);
    var p=game.player; p.v13Status=p.v13Status||{}; Object.keys(p.v13Status).forEach(function(k){ p.v13Status[k]=Math.max(0,p.v13Status[k]-dt); });
    if(p.v13Status.poison>0) p.hp=Math.max(0,p.hp-(5+p.level*.2)*dt); if(p.v13Status.burn>0) p.hp=Math.max(0,p.hp-(9+p.level*.25)*dt);
    arr(game.monsters).forEach(function(m){ if(!m||m.dead) return; m.time+=dt; m.hit=Math.max(0,(m.hit||0)-dt); m.attackCooldown=Math.max(0,(m.attackCooldown||0)-dt); var dx=p.x-m.x, ad=Math.abs(dx); m.face=dx>=0?1:-1; var sp=(m.type.speed||36)*(m.isElite?1.08:1);
      var targetX = ad<560 ? m.x + Math.sign(dx)*sp*dt : m.baseX + Math.sin(m.time*.8)*130;
      m.x += (targetX-m.x)*Math.min(1,dt*6); m.x=clampV(m.x,m.baseX-300,m.baseX+300);
      var touch=Math.abs(p.x-m.x)<52 && Math.abs(p.y-m.y)<92; if(touch){ damagePlayer(m.type.atk,'접촉 피해','#ff8787'); var b=m.gimmick||m.behavior; if(b==='poison')status('poison',4); if(b==='burn')status('burn',4); if(b==='stun')status('stun',1); if(b==='frost')status('frost',3); }
      if(ad<650 && m.attackCooldown<=0){ var g=m.gimmick||m.behavior||'melee'; m.attackCooldown=m.isElite?1.05:2.1;
        if(g==='ranged') enemyShot(m,'dark'); else if(g==='poison'){enemyShot(m,'poison');} else if(g==='burn'){enemyShot(m,'fire');} else if(g==='frost'){enemyShot(m,'ice');} else if(g==='charge'){m.x+=m.face*145; burst(m.x,m.y-40,'#fb923c',18); if(Math.abs(p.x-m.x)<120)damagePlayer(m.type.atk*1.5,'돌진 피해','#fb923c');} else if(g==='grab'){ if(ad<245){p.x+=(m.x-p.x)*.28; status('stun',.6); damagePlayer(m.type.atk*.75,'잡기','#c084fc');} } else if(g==='split' && m.isElite && arr(game.monsters).filter(function(mm){return mm&&mm.v13Split;}).length<2){ for(var s=0;s<2;s++){ var t=monsterType('slime',Math.max(1,m.type.level-3),null,'melee'); game.monsters.push({uid:'v13split'+Date.now()+s,v13Split:true,type:t,x:m.x+rnd(-90,90),baseX:m.x+rnd(-90,90),y:m.y,spawnY:m.y,hp:t.hp,maxHp:t.hp,face:s?1:-1,time:0,hit:0,dead:false,attackCooldown:1,behavior:'melee'}); } text('분열!',m.x,m.y-120,'#86efac'); } else if(ad<130) damagePlayer(m.type.atk,'근접 공격','#ff8787');
      }
    });
    game.enemyProjectiles=arr(game.enemyProjectiles).filter(function(e){ e.life-=dt; e.x+=e.vx*dt; if(Math.abs(e.x-p.x)<38 && Math.abs(e.y-(p.y-50))<52){ damagePlayer(e.dmg,'원거리 피해',e.color); if(e.kind==='fire')status('burn',3); if(e.kind==='ice')status('frost',3); if(e.kind==='poison')status('poison',3); return false; } return e.life>0; });
  };
  var oldDrawProjectilesV13 = typeof drawProjectiles === 'function' ? drawProjectiles : null;
  drawProjectiles = window.drawProjectiles = function drawProjectilesV13(){ if(oldDrawProjectilesV13) oldDrawProjectilesV13.apply(this,arguments); arr(game.enemyProjectiles).forEach(function(e){ctx.save();ctx.translate(e.x,e.y);ctx.shadowColor=e.color;ctx.shadowBlur=14;circle2(ctx,0,0,10,e.color||'#c084fc');ctx.restore();}); };
  var oldDrawMonstersV13 = typeof drawMonsters === 'function' ? drawMonsters : null;
  drawMonsters = window.drawMonsters = function drawMonstersV13(){ if(oldDrawMonstersV13) oldDrawMonstersV13.apply(this,arguments); arr(game.monsters).forEach(function(m){ if(!m||m.dead||!m.isElite)return; ctx.save(); ctx.fillStyle='#facc15'; ctx.font='bold 22px sans-serif'; ctx.textAlign='center'; ctx.strokeStyle='#111827'; ctx.lineWidth=5; var s='엘리트 보스 · '+(m.name||m.type.name)+' · '+(m.gimmick||m.behavior); ctx.strokeText(s,m.x,m.y-145); ctx.fillText(s,m.x,m.y-145); ctx.restore(); }); };

  drawItemIcon = window.drawItemIcon = function drawItemIconV13(iconOrItem,x,y,size){
    var it=typeof iconOrItem==='object'?iconOrItem:(ITEMS[iconOrItem]||{id:iconOrItem,icon:iconOrItem}); var id=String(it.id||it.icon||iconOrItem||''); var s=size||36; ctx.save(); ctx.translate(x,y); ctx.fillStyle='#172033'; round2(ctx,-s*.48,-s*.48,s*.96,s*.96,4); ctx.strokeStyle='#60a5fa'; ctx.lineWidth=2; ctx.strokeRect(-s*.42,-s*.42,s*.84,s*.84);
    if(/staff/.test(id)||it.weaponType==='staff'){ctx.strokeStyle='#a78bfa';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-8,14);ctx.lineTo(8,-12);ctx.stroke();circle2(ctx,10,-14,7,'#93c5fd');}
    else if(/bow/.test(id)||it.weaponType==='bow'){ctx.strokeStyle='#facc15';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,17,-1.2,1.2);ctx.stroke();ctx.strokeStyle='#e5e7eb';ctx.beginPath();ctx.moveTo(-15,0);ctx.lineTo(17,0);ctx.stroke();}
    else if(/dagger/.test(id)||it.weaponType==='dagger'){ctx.strokeStyle='#c084fc';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-13,14);ctx.lineTo(12,-12);ctx.stroke();ctx.fillStyle='#e5e7eb';ctx.fillRect(7,-16,8,15);}
    else if(/axe/.test(id)||it.weaponType==='axe'){ctx.strokeStyle='#92400e';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-10,15);ctx.lineTo(10,-14);ctx.stroke();poly2(ctx,[[10,-18],[26,-10],[12,2]],'#e5e7eb');}
    else if(/spear|lance/.test(id)||it.weaponType==='spear'){ctx.strokeStyle='#94a3b8';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-13,15);ctx.lineTo(13,-15);ctx.stroke();poly2(ctx,[[13,-18],[22,-8],[8,-10]],'#e5e7eb');}
    else if(/sword|blade/.test(id)||it.weaponType==='sword'){ctx.strokeStyle='#e5e7eb';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-13,14);ctx.lineTo(12,-15);ctx.stroke();ctx.fillStyle='#f97316';ctx.fillRect(-10,4,25,6);}
    else if(/hp/.test(id)){circle2(ctx,0,0,13,'#fb7185');ctx.fillStyle='#fff';ctx.fillRect(-4,-10,8,20);ctx.fillRect(-10,-4,20,8);}
    else if(/mp/.test(id)){circle2(ctx,0,0,13,'#60a5fa');circle2(ctx,0,0,6,'#dbeafe');}
    else if(/armor|helmet|knee/.test(id)){ctx.fillStyle='#60a5fa';round2(ctx,-11,-12,22,24,5);ctx.fillStyle='#bfdbfe';ctx.fillRect(-7,-8,14,6);} else {circle2(ctx,0,0,12,'#facc15');}
    ctx.restore();
  };
  drawWeapon = window.drawWeapon = function drawWeaponV13(c,weaponId,handX,handY,attacking){ var it=ITEMS[weaponId]||{}, kind=it.weaponType||(/staff/.test(weaponId)?'staff':/bow/.test(weaponId)?'bow':/dagger/.test(weaponId)?'dagger':/axe/.test(weaponId)?'axe':/spear|lance/.test(weaponId)?'spear':'sword'); c.save(); c.translate(handX,handY); c.rotate(attacking?.78:-.35); if(kind==='staff'){c.strokeStyle='#7c3aed';c.lineWidth=5;c.beginPath();c.moveTo(0,12);c.lineTo(36,-38);c.stroke();circle2(c,40,-42,9,'#93c5fd');} else if(kind==='bow'){c.strokeStyle='#facc15';c.lineWidth=4;c.beginPath();c.arc(20,-10,34,-1.25,1.25);c.stroke();c.strokeStyle='#e5e7eb';c.beginPath();c.moveTo(-2,-10);c.lineTo(54,-10);c.stroke();} else if(kind==='dagger'){c.strokeStyle='#c084fc';c.lineWidth=6;c.beginPath();c.moveTo(0,8);c.lineTo(28,-22);c.stroke();c.fillStyle='#e5e7eb';c.fillRect(24,-28,10,18);} else if(kind==='axe'){c.strokeStyle='#92400e';c.lineWidth=6;c.beginPath();c.moveTo(0,12);c.lineTo(34,-34);c.stroke();poly2(c,[[34,-40],[62,-30],[38,-10]],'#e5e7eb');} else if(kind==='spear'){c.strokeStyle='#94a3b8';c.lineWidth=5;c.beginPath();c.moveTo(0,12);c.lineTo(50,-46);c.stroke();poly2(c,[[50,-52],[68,-36],[44,-34]],'#e5e7eb');} else {c.strokeStyle='#e5e7eb';c.lineWidth=7;c.beginPath();c.moveTo(0,10);c.lineTo(42,-38);c.stroke();c.fillStyle='#f97316';c.fillRect(14,-10,34,7);} c.restore(); };

  var oldEnhanceV13 = typeof enhanceEquippedItem === 'function' ? enhanceEquippedItem : null;
  if(oldEnhanceV13) enhanceEquippedItem = window.enhanceEquippedItem = function enhanceEquippedItemV13(slot){ var before=equipment[slot]?JSON.stringify(equipment[slot]):''; var r=oldEnhanceV13.apply(this,arguments); var after=equipment[slot]?JSON.stringify(equipment[slot]):''; if(before&&!after){burst(game.player.x,game.player.y-80,'#ef4444',48);text('파괴 이펙트!',game.player.x,game.player.y-122,'#ef4444');} else if(before!==after){burst(game.player.x,game.player.y-80,'#facc15',42);text('강화 성공 이펙트!',game.player.x,game.player.y-122,'#facc15');} return r; };

  var oldHudV13 = typeof drawHUD === 'function' ? drawHUD : null;
  if(oldHudV13) drawHUD = window.drawHUD = function drawHUDV13(){ oldHudV13.apply(this,arguments); try{ctx.save();ctx.textAlign='right';ctx.font='bold 17px sans-serif';ctx.fillStyle='#86efac';ctx.strokeStyle='rgba(15,23,42,.95)';ctx.lineWidth=5;var line1='V13 FINAL 적용됨';var line2=game.mode==='hunt'?('일반 '+arr(game.monsters).filter(function(m){return m&&!m.isElite&&!m.dead;}).length+' / 엘리트 '+(arr(game.monsters).some(function(m){return m&&m.isElite&&!m.dead;})?'1마리':'없음')):('도시 '+(typeof TOWNS!=='undefined'?TOWNS.length:0)+'개 / 레벨 제한 ON');ctx.strokeText(line1,W-22,190);ctx.fillText(line1,W-22,190);ctx.fillStyle='#facc15';ctx.strokeText(line2,W-22,212);ctx.fillText(line2,W-22,212);ctx.restore();}catch(_){}};

  installV13Data(); installV13Quests();
  try{ if(okGame()&&game.mode==='town') uniqueTownNPCs(); if(okGame()&&game.mode==='hunt') makeV13Monsters(typeof getHunt==='function'?getHunt(game.huntId):null); }catch(e){ console.warn('[V13 init]',e); }
  setInterval(function(){ try{ installV13Data(); if(okGame()&&game.mode==='town') uniqueTownNPCs(); if(okGame()&&game.mode==='hunt'){ var h=typeof getHunt==='function'?getHunt(game.huntId):null; var expected=(arr(h&&h.families).length||2)*8+1; var baseCount=arr(game.monsters).filter(function(m){return m&&m.v13Base;}).length; if(!arr(game.monsters).some(function(m){return m&&m.isElite;}) || baseCount!==expected) makeV13Monsters(h); } }catch(e){ console.warn('[V13 interval]',e); } },1200);
  console.log('[PixelRPG] V13_FINAL_FORCE_PATCH installed');
})();


/* =========================================================
   V14 VISUAL HOTFIX
   - NPCs no longer hold player weapons.
   - NPCs use role emblems instead of weapons.
   - Weapon / accessory icons are redrawn in a richer pixel style.
   - Equipped weapon appearance is more varied.
========================================================= */
(function(){
  'use strict';
  if (window.__PIXEL_RPG_V14_VISUAL_HOTFIX__) return;
  window.__PIXEL_RPG_V14_VISUAL_HOTFIX__ = true;
  window.PIXEL_RPG_PATCH_VERSION = 'V14_VISUAL_HOTFIX';

  function A(v){ return Array.isArray(v) ? v : []; }
  function idOf(ref){
    try { return typeof itemRefId === 'function' ? itemRefId(ref) : (typeof ref === 'string' ? ref : ref && ref.id); }
    catch(_) { return typeof ref === 'string' ? ref : ref && ref.id; }
  }
  function itemOf(ref){
    if (!ref) return null;
    if (typeof ref === 'object' && (ref.id || ref.icon || ref.name)) return ref;
    var id = idOf(ref);
    return (typeof ITEMS !== 'undefined' && ITEMS && ITEMS[id]) ? ITEMS[id] : (id ? { id:id, icon:id, name:id } : null);
  }
  function H(s){ s = String(s || ''); var h = 0; for (var i=0;i<s.length;i++) h = ((h<<5)-h+s.charCodeAt(i))|0; return Math.abs(h); }
  function V(it,n){ return H((it&&it.id||'')+(it&&it.name||'')) % Math.max(1,n); }
  function rr(c,x,y,w,h,r){ r=Math.min(r||0,w/2,h/2); c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }
  function fr(c,x,y,w,h,r,col){ c.fillStyle=col; rr(c,x,y,w,h,r); c.fill(); }
  function sr(c,x,y,w,h,r,col,lw){ c.strokeStyle=col; c.lineWidth=lw||1; rr(c,x,y,w,h,r); c.stroke(); }
  function poly(c,pts,col){ c.fillStyle=col; c.beginPath(); pts.forEach(function(p,i){ if(i)c.lineTo(p[0],p[1]); else c.moveTo(p[0],p[1]); }); c.closePath(); c.fill(); }
  function line(c,x1,y1,x2,y2,col,lw){ c.strokeStyle=col; c.lineWidth=lw||2; c.lineCap='round'; c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke(); }
  function dot(c,x,y,r,col){ c.fillStyle=col; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); }

  function kind(it){
    var s = ((it&&it.id||'')+' '+(it&&it.name||'')+' '+(it&&it.icon||'')+' '+(it&&it.weaponType||'')).toLowerCase();
    if (/bow|활/.test(s)) return 'bow';
    if (/dagger|knife|단검|비수/.test(s)) return 'dagger';
    if (/staff|wand|rod|지팡이|스태프/.test(s)) return 'staff';
    if (/hammer|mace|club|망치|철퇴/.test(s)) return 'hammer';
    if (/axe|도끼/.test(s)) return 'axe';
    if (/spear|lance|창/.test(s)) return 'spear';
    if (/ring|반지/.test(s)) return 'ring';
    if (/necklace|amulet|pendant|charm|목걸이|부적/.test(s)) return 'amulet';
    if (/helmet|helm|투구|모자/.test(s)) return 'helmet';
    if (/armor|robe|갑옷|로브/.test(s)) return 'armor';
    if (/knee|boot|shoe|신발|무릎/.test(s)) return 'boots';
    if (/hp|체력/.test(s)) return 'hp';
    if (/mp|mana|마나/.test(s)) return 'mp';
    return 'sword';
  }

  function npcRole(npc){
    var t=String(npc&&npc.type||'').toLowerCase();
    var r=String(npc&&npc.role||'').toLowerCase();
    var n=String(npc&&npc.name||'');
    if(t==='taxi') return 'taxi';
    if(t==='merchant') return 'merchant';
    if(t==='weapon') return 'weaponshop';
    if(t==='blacksmith') return 'blacksmith';
    if(t==='quest') return 'quest';
    if(t==='job_object' || /성검|십자가|룬석|룬|오브|보주|유물|비석/.test(n)) return 'object';
    if(/용기사|드래곤/.test(n+' '+r)) return 'dragon';
    if(/마법|현자|대마법|mage|sage/.test(n+' '+r)) return 'mage';
    if(/궁|archer|명궁|세리아|레인저/.test(n+' '+r)) return 'archer';
    if(/도적|암살|그림자|rogue|assassin/.test(n+' '+r)) return 'rogue';
    if(/기사|전사|warrior|knight/.test(n+' '+r)) return 'warrior';
    if(t==='job') return 'job';
    return 'villager';
  }

  function npcStyle(role){
    var m={
      taxi:{main:'#facc15',trim:'#1f2937',hair:'#4b5563',hairStyle:'flat',faceStyle:'bright',emblem:'taxi'},
      merchant:{main:'#fb923c',trim:'#7c2d12',hair:'#78350f',hairStyle:'bob',faceStyle:'bright',emblem:'bag'},
      weaponshop:{main:'#94a3b8',trim:'#475569',hair:'#111827',hairStyle:'side_part',faceStyle:'cool',emblem:'anvil'},
      blacksmith:{main:'#78716c',trim:'#f97316',hair:'#292524',hairStyle:'bandana',faceStyle:'serious',emblem:'forge'},
      quest:{main:'#84cc16',trim:'#365314',hair:'#eab308',hairStyle:'round_bob',faceStyle:'smile',emblem:'scroll'},
      warrior:{main:'#64748b',trim:'#0f172a',hair:'#3f3f46',hairStyle:'short',faceStyle:'cool',emblem:'shield'},
      mage:{main:'#8b5cf6',trim:'#312e81',hair:'#dbeafe',hairStyle:'wave',faceStyle:'smile',emblem:'orb'},
      rogue:{main:'#475569',trim:'#111827',hair:'#1f2937',hairStyle:'spiky',faceStyle:'cool',emblem:'shadow'},
      archer:{main:'#16a34a',trim:'#14532d',hair:'#713f12',hairStyle:'pony',faceStyle:'bright',emblem:'feather'},
      dragon:{main:'#0f766e',trim:'#134e4a',hair:'#7c2d12',hairStyle:'wild',faceStyle:'angry',emblem:'dragon'},
      job:{main:'#a78bfa',trim:'#4c1d95',hair:'#f8fafc',hairStyle:'long_tail',faceStyle:'smile',emblem:'star'},
      villager:{main:'#60a5fa',trim:'#1e3a8a',hair:'#334155',hairStyle:'soft_bang',faceStyle:'smile',emblem:'none'}
    };
    return m[role] || m.villager;
  }

  function drawEmblem(c,e){
    c.save(); c.translate(24,-76);
    if(e==='none'){ c.restore(); return; }
    fr(c,-15,-15,30,30,8,'rgba(15,23,42,.92)');
    sr(c,-15,-15,30,30,8,'rgba(255,255,255,.22)',1);
    if(e==='taxi'){ fr(c,-11,-4,22,10,3,'#fde047'); fr(c,-6,-7,12,5,2,'#f59e0b'); dot(c,-6,6,3,'#111827'); dot(c,6,6,3,'#111827'); }
    else if(e==='bag'){ fr(c,-9,-5,18,15,4,'#92400e'); line(c,-4,-6,4,-6,'#fbbf24',2); fr(c,-3,-1,6,4,1,'#fbbf24'); }
    else if(e==='anvil'){ poly(c,[[-11,2],[-4,-6],[9,-6],[12,-1],[3,2],[-1,7]],'#cbd5e1'); fr(c,-3,7,6,5,1,'#64748b'); }
    else if(e==='forge'){ fr(c,-9,-1,12,13,3,'#94a3b8'); fr(c,5,-8,13,9,2,'#e5e7eb'); line(c,0,8,11,-4,'#7c2d12',3); }
    else if(e==='scroll'){ fr(c,-8,-8,16,18,4,'#fef3c7'); line(c,-5,-2,5,-2,'#92400e',1.5); line(c,-5,3,5,3,'#92400e',1.5); }
    else if(e==='shield'){ poly(c,[[0,-11],[10,-6],[7,8],[0,13],[-7,8],[-10,-6]],'#cbd5e1'); poly(c,[[0,-6],[6,-3],[4,5],[0,8],[-4,5],[-6,-3]],'#64748b'); }
    else if(e==='orb'){ dot(c,0,0,9,'#93c5fd'); c.strokeStyle='#c4b5fd'; c.lineWidth=2; c.beginPath(); c.arc(0,0,12,0,Math.PI*2); c.stroke(); dot(c,-3,-3,2,'#fff'); }
    else if(e==='shadow'){ poly(c,[[0,-10],[4,-2],[11,-2],[5,3],[7,11],[0,6],[-7,11],[-5,3],[-11,-2],[-4,-2]],'#a78bfa'); dot(c,0,0,2,'#111827'); }
    else if(e==='feather'){ poly(c,[[-5,9],[0,-10],[6,-8],[3,0],[9,6],[1,5]],'#d9f99d'); line(c,-2,7,5,-4,'#365314',1.2); }
    else if(e==='dragon'){ poly(c,[[-8,4],[-3,-8],[3,-6],[9,-2],[6,3],[0,8]],'#5eead4'); line(c,-6,2,-10,-3,'#134e4a',2); line(c,-2,-5,2,-10,'#134e4a',2); dot(c,4,-2,1.5,'#111827'); }
    else { poly(c,[[0,-11],[3,-3],[11,-2],[5,3],[7,11],[0,6],[-7,11],[-5,3],[-11,-2],[-3,-3]],'#fef08a'); }
    c.restore();
  }

  function drawObjectNpc(npc,x,y){
    ctx.save(); ctx.translate(x,y); ctx.imageSmoothingEnabled=false;
    var s=String((npc&&npc.role||'')+' '+(npc&&npc.name||'')).toLowerCase();
    var bob=Math.sin(performance.now()/350 + x*.01)*2; ctx.translate(0,bob);
    if(/sacred_sword|sword|성검/.test(s)){ fr(ctx,-18,-10,36,14,5,'#6b7280'); line(ctx,0,-6,0,-56,'#e5e7eb',4); fr(ctx,-10,-18,20,4,2,'#f59e0b'); fr(ctx,-3,-14,6,14,2,'#1d4ed8'); dot(ctx,0,-61,2,'#fef3c7'); }
    else if(/cross|십자가/.test(s)){ fr(ctx,-6,-50,12,42,3,'#e5e7eb'); fr(ctx,-20,-36,40,10,3,'#e5e7eb'); fr(ctx,-14,-5,28,10,4,'#94a3b8'); }
    else if(/rune|룬/.test(s)){ fr(ctx,-18,-50,36,50,10,'#64748b'); line(ctx,-8,-38,8,-30,'#93c5fd',2); line(ctx,8,-30,-4,-18,'#93c5fd',2); line(ctx,-4,-18,10,-10,'#93c5fd',2); dot(ctx,-3,-25,2,'#bfdbfe'); dot(ctx,8,-11,2,'#bfdbfe'); }
    else { fr(ctx,-16,-42,32,42,9,'#475569'); dot(ctx,0,-21,8,'#93c5fd'); }
    ctx.fillStyle='#fff'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; if(npc.name) ctx.fillText(npc.name,0,-70);
    if(game&&game.player&&Math.abs(game.player.x-x)<90){ ctx.fillStyle='#ffe066'; ctx.font='bold 13px sans-serif'; ctx.fillText('E 조사',0,-90); }
    ctx.restore();
  }

  drawSdNpc = window.drawSdNpc = function(npc,x,y){
    if(!npc) return;
    var role=npcRole(npc);
    if(role==='object') { drawObjectNpc(npc,x,y); return; }
    var st=npcStyle(role);
    var fake=Object.assign({}, game&&game.player?game.player:{}, {
      character:{ name:npc.name, job:'beginner', skin:'#ffd7a8', hair:st.hair, hairStyle:st.hairStyle, faceStyle:st.faceStyle },
      __drawEquipment:{ weapon:null, helmet:null, armor:null, knee:null, accessory:null },
      anim:'idle', animTime:performance.now()/1000, face:1
    });
    ctx.save(); ctx.translate(x,y); ctx.scale(.82,.82);
    try{ drawPlayerBody(ctx,fake); }catch(e){}
    fr(ctx,-17,-72,34,34,10,st.main);
    fr(ctx,-13,-46,26,7,3,st.trim);
    drawEmblem(ctx,st.emblem);
    ctx.restore();
  };

  drawNPCs = window.drawNPCs = function(){
    A(game&&game.npcs).forEach(function(npc){
      if(!npc) return;
      var x=npc.x||0, y=npc.y||0, role=npcRole(npc);
      drawSdNpc(npc,x,y);
      if(role==='object') return;
      var name=npc.name||'', near=game&&game.player&&Math.abs(game.player.x-x)<90;
      var labelY=y-125, bw=Math.max(72,Math.min(148,name.length*12+22));
      ctx.fillStyle='rgba(15,23,42,.90)'; rr(ctx,x-bw/2,labelY-15,bw,22,10); ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,.16)'; ctx.lineWidth=1; rr(ctx,x-bw/2,labelY-15,bw,22,10); ctx.stroke();
      ctx.fillStyle='#fff'; ctx.font='bold 14px sans-serif'; ctx.textAlign='center'; ctx.fillText(name,x,labelY);
      if(near){ ctx.fillStyle='#ffe066'; ctx.font='bold 13px sans-serif'; ctx.fillText('E 대화',x,labelY-22); }
    });
  };

  var P={
    sword:[['#e5e7eb','#fff','#1d4ed8','#f59e0b'],['#84cc16','#d9f99d','#7c3aed','#92400e'],['#cbd5e1','#fff','#111827','#fb923c'],['#60a5fa','#dbeafe','#1e3a8a','#f59e0b'],['#f97316','#fde68a','#7c2d12','#111827']],
    bow:[['#fb923c','#1d4ed8','#e5e7eb'],['#b45309','#22c55e','#e5e7eb'],['#ea580c','#2563eb','#e5e7eb'],['#6b7280','#facc15','#d1d5db'],['#2563eb','#ef4444','#e5e7eb']],
    dagger:[['#e5e7eb','#7c3aed','#111827'],['#cbd5e1','#60a5fa','#92400e'],['#d1d5db','#ec4899','#f59e0b'],['#93c5fd','#1d4ed8','#0f172a']],
    staff:[['#8b5a2b','#93c5fd','#c4b5fd'],['#7c3aed','#fef08a','#f97316'],['#92400e','#5eead4','#16a34a'],['#6b7280','#c084fc','#312e81']],
    hammer:[['#8b5a2b','#9ca3af','#ef4444'],['#8b5a2b','#f59e0b','#60a5fa'],['#7c2d12','#64748b','#dbeafe']],
    axe:[['#8b5a2b','#9ca3af','#111827'],['#8b5a2b','#94a3b8','#475569'],['#1d4ed8','#f59e0b','#dbeafe'],['#16a34a','#e5e7eb','#ef4444']],
    ring:[['#f59e0b','#60a5fa'],['#eab308','#ef4444'],['#d1d5db','#22c55e']],
    amulet:[['#7c2d12','#60a5fa'],['#a16207','#c084fc'],['#92400e','#22c55e']]
  };
  function pal(k,it){ var a=P[k]||P.sword; return a[V(it,a.length)]; }

  drawItemIcon = window.drawItemIcon = function(iconOrItem,x,y,size){
    var it=(typeof iconOrItem==='object'&&iconOrItem)?iconOrItem:itemOf(iconOrItem)||{id:String(iconOrItem||''),icon:String(iconOrItem||'')};
    var k=kind(it), p=pal(k,it), s=size||36, v=V(it,9);
    ctx.save(); ctx.translate(x,y); ctx.imageSmoothingEnabled=false;
    fr(ctx,-s*.44,-s*.44,s*.88,s*.88,5,'#1a1320'); sr(ctx,-s*.44,-s*.44,s*.88,s*.88,5,'#d97706',1.8); sr(ctx,-s*.38,-s*.38,s*.76,s*.76,4,'rgba(251,146,60,.55)',1);
    if(k==='hp'){ dot(ctx,-s*.08,-s*.06,s*.14,'#fb7185'); dot(ctx,s*.08,-s*.06,s*.14,'#fb7185'); poly(ctx,[[-s*.22,-s*.02],[0,s*.24],[s*.22,-s*.02]],'#fb7185'); }
    else if(k==='mp'){ poly(ctx,[[0,-s*.24],[s*.16,0],[0,s*.24],[-s*.16,0]],'#60a5fa'); dot(ctx,0,0,s*.05,'#dbeafe'); }
    else if(k==='sword'){ ctx.rotate(-.75); poly(ctx,[[0,-s*.35],[s*.10,-s*.07],[s*.07,s*.28],[-s*.07,s*.28],[-s*.10,-s*.07]],p[0]); line(ctx,-1,-s*.29,2,s*.18,p[1],1.2); fr(ctx,-s*.18,s*.17,s*.36,s*.08,2,p[3]); fr(ctx,-s*.06,s*.23,s*.12,s*.18,2,p[2]); if(v===4) poly(ctx,[[0,-s*.43],[s*.11,-s*.25],[s*.03,-s*.08],[s*.14,.02],[-s*.05,.04]],'#fde68a'); }
    else if(k==='bow'){ ctx.strokeStyle=p[0]; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,s*.27,-1.22,1.22); ctx.stroke(); line(ctx,s*.07,-s*.25,s*.07,s*.25,p[2],1.4); fr(ctx,-s*.03,-s*.06,s*.06,s*.12,1,p[1]); }
    else if(k==='dagger'){ ctx.rotate(-.7); poly(ctx,[[0,-s*.28],[s*.10,-s*.06],[s*.05,s*.18],[-s*.05,s*.18],[-s*.10,-s*.06]],p[0]); fr(ctx,-s*.14,s*.1,s*.28,s*.06,2,p[2]); fr(ctx,-s*.05,s*.15,s*.10,s*.18,2,p[1]); }
    else if(k==='staff'){ ctx.rotate(-.55); line(ctx,0,s*.28,0,-s*.26,p[0],3); dot(ctx,0,-s*.35,s*.10,p[1]); ctx.strokeStyle=p[2]; ctx.lineWidth=1.6; ctx.beginPath(); ctx.arc(0,-s*.35,s*.16,0,Math.PI*2); ctx.stroke(); }
    else if(k==='hammer'){ ctx.rotate(-.5); line(ctx,0,s*.30,0,-s*.12,p[0],3.3); if(v%2) poly(ctx,[[0,-s*.34],[s*.18,-s*.24],[s*.08,-s*.08],[-s*.08,-s*.08],[-s*.18,-s*.24]],p[1]); else fr(ctx,-s*.18,-s*.28,s*.36,s*.16,2,p[1]); }
    else if(k==='axe'){ ctx.rotate(-.48); line(ctx,0,s*.30,0,-s*.26,p[0],3.2); poly(ctx,[[0,-s*.28],[s*.22,-s*.20],[s*.14,-s*.01],[0,-s*.05]],p[1]); if(v%3) poly(ctx,[[0,-s*.26],[-s*.18,-s*.17],[-s*.10,-s*.03],[0,-s*.06]],'#cbd5e1'); }
    else if(k==='ring'){ ctx.lineWidth=3; ctx.strokeStyle=p[0]; ctx.beginPath(); ctx.arc(0,3,s*.16,0,Math.PI*2); ctx.stroke(); dot(ctx,0,-s*.16,s*.08,p[1]); }
    else if(k==='amulet'){ ctx.strokeStyle=p[0]; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,-s*.05,s*.18,Math.PI*.15,Math.PI*.85,true); ctx.stroke(); dot(ctx,0,s*.12,s*.11,p[1]); fr(ctx,-s*.05,s*.03,s*.10,s*.22,2,p[1]); }
    else if(k==='armor'){ fr(ctx,-s*.18,-s*.20,s*.36,s*.38,4,'#60a5fa'); fr(ctx,-s*.12,-s*.14,s*.24,s*.12,2,'#dbeafe'); }
    else if(k==='helmet'){ poly(ctx,[[-s*.22,-s*.02],[-s*.10,-s*.22],[s*.10,-s*.22],[s*.22,-s*.02],[s*.18,s*.14],[-s*.18,s*.14]],'#94a3b8'); fr(ctx,-s*.12,-s*.02,s*.24,s*.07,2,'#1e3a8a'); }
    else if(k==='boots'){ fr(ctx,-s*.22,-s*.02,s*.18,s*.16,3,'#64748b'); fr(ctx,s*.04,-s*.02,s*.18,s*.16,3,'#64748b'); }
    else dot(ctx,0,0,s*.18,'#facc15');
    ctx.restore();
  };

  drawWeapon = window.drawWeapon = function(c,weaponRef,handX,handY,attacking,attackKind,animTime){
    var it=itemOf(weaponRef || (typeof equipment!=='undefined' && equipment && equipment.weapon)); if(!it) return;
    var k=kind(it), p=pal(k,it), v=V(it,9), len=(k==='dagger'?40:k==='bow'?52:k==='staff'?56:k==='hammer'?50:k==='axe'?54:k==='spear'?68:58);
    var face=(game&&game.player&&game.player.face)||1, swing=attacking?Math.sin(Math.min(1,Number(animTime||0)*10)*Math.PI):0;
    c.save(); c.translate(handX,handY); c.scale(face,1); c.rotate(attacking?(-.88+swing*1.35):-.45);
    if(k==='sword'){ poly(c,[[0,-len],[12,-20],[7,18],[-7,18],[-12,-20]],p[0]); line(c,-2,-len+8,2,10,p[1],1.3); fr(c,-18,8,36,8,2,p[3]); fr(c,-5,14,10,22,2,p[2]); if(v===4) poly(c,[[0,-len-8],[12,-len+8],[4,-len+28],[16,-len+44],[-2,-len+40],[4,-len+18]],'#fde68a'); }
    else if(k==='bow'){ c.strokeStyle=p[0]; c.lineWidth=5; c.beginPath(); c.arc(10,-14,34,-1.35,1.35); c.stroke(); line(c,18,-48,18,20,p[2],1.6); fr(c,6,-18,6,10,2,p[1]); if(attacking){ line(c,14,-14,78,-14,'#f8fafc',2); poly(c,[[84,-14],[70,-20],[70,-8]],'#facc15'); } }
    else if(k==='dagger'){ c.rotate(.5); poly(c,[[0,-len*.72],[9,-6],[2,12],[-5,12],[-8,-6]],p[0]); fr(c,-11,8,22,7,2,p[2]); fr(c,-4,14,8,18,2,p[1]); }
    else if(k==='staff'){ line(c,0,22,0,-len,p[0],5); dot(c,0,-len-8,v%2?10:12,p[1]); c.strokeStyle=p[2]; c.lineWidth=2; c.beginPath(); c.arc(0,-len-8,18,0,Math.PI*2); c.stroke(); }
    else if(k==='hammer'){ line(c,0,20,0,-len+18,p[0],5); if(v%2) poly(c,[[0,-len-10],[18,-len+2],[8,-len+18],[-8,-len+18],[-18,-len+2]],p[1]); else fr(c,-20,-len,40,16,3,p[1]); }
    else if(k==='axe'){ line(c,0,22,0,-len,p[0],5); poly(c,[[0,-len+2],[26,-len+14],[18,-len+42],[0,-len+28]],p[1]); if(v%3) poly(c,[[0,-len+4],[-24,-len+14],[-14,-len+38],[0,-len+28]],'#cbd5e1'); }
    else if(k==='spear'){ line(c,0,22,0,-len-10,'#8b5a2b',4.5); poly(c,[[0,-len-30],[14,-len-6],[0,-len],[-14,-len-6]],'#e5e7eb'); }
    c.restore();
  };

  var oldHud = typeof drawHUD === 'function' ? drawHUD : null;
  if(oldHud){
    drawHUD = window.drawHUD = function(){
      oldHud.apply(this,arguments);
      try{
        ctx.save(); ctx.textAlign='right'; ctx.font='bold 16px sans-serif'; ctx.fillStyle='#a7f3d0'; ctx.strokeStyle='rgba(15,23,42,.95)'; ctx.lineWidth=5;
        ctx.strokeText('V14 NPC / 무기 외형 적용됨', W-22, 236); ctx.fillText('V14 NPC / 무기 외형 적용됨', W-22, 236);
        ctx.fillStyle='#fcd34d'; ctx.strokeText('NPC 무기 제거 · 무기 외형 개선', W-22, 258); ctx.fillText('NPC 무기 제거 · 무기 외형 개선', W-22, 258);
        ctx.restore();
      }catch(_){}
    };
  }
  console.log('[PixelRPG] V14 visual hotfix installed');
})();

/* =========================================================
   V17 CONSOLIDATED SAFETY PATCH
   - Fixes strict-mode ReferenceError for legacy patch assignments.
   - Provides fallback getShopItems and updateEnemyProjectiles.
   - Removes dependency on index.html embedded force patch.
   - Keeps original-style HP/MP potion icons.
========================================================= */
(function(){
  'use strict';
  if (window.__PIXEL_RPG_V17_CONSOLIDATED_FIX__) return;
  window.__PIXEL_RPG_V17_CONSOLIDATED_FIX__ = true;
  window.PIXEL_RPG_PATCH_VERSION = 'V17_CONSOLIDATED_FIX';

  function safeArr(v){ return Array.isArray(v) ? v : []; }
  function circleSafe(c, x, y, r){ c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }

  // Fallback shop provider, used by older patches that reference getShopItems().
  if (typeof getShopItems !== 'function') {
    getShopItems = window.getShopItems = function getShopItemsV17(type){
      if (type === 'merchant') {
        return [
          'hp_potion', 'mp_potion',
          'hp_potion_small', 'hp_potion_mid', 'hp_potion_high', 'hp_potion_ultimate',
          'mp_potion_small', 'mp_potion_mid', 'mp_potion_high', 'mp_potion_ultimate'
        ].filter(function(id){ return typeof ITEMS !== 'undefined' && ITEMS && ITEMS[id]; });
      }
      if (typeof getShopItemsForCurrentTown === 'function') return getShopItemsForCurrentTown();
      if (typeof BASIC_EQUIPMENT_SHOP_ITEMS !== 'undefined') {
        return BASIC_EQUIPMENT_SHOP_ITEMS.filter(function(id){ return typeof ITEMS !== 'undefined' && ITEMS && ITEMS[id]; });
      }
      return [];
    };
  } else {
    window.getShopItems = getShopItems;
  }

  // Fallback enemy projectile updater.
  if (typeof updateEnemyProjectiles !== 'function') {
    updateEnemyProjectiles = window.updateEnemyProjectiles = function updateEnemyProjectilesV17(dt){
      if (typeof game === 'undefined' || !game) return;
      if (!game.enemyProjectiles) game.enemyProjectiles = [];

      var player = game.player || {};
      game.enemyProjectiles.forEach(function(b){
        if (!b) return;
        b.life = Number.isFinite(b.life) ? b.life - (dt || 0) : 0;
        b.x += (b.vx || 0) * (dt || 0);
        b.y += (b.vy || 0) * (dt || 0);
        if (b.gravity) b.vy = (b.vy || 0) + b.gravity * (dt || 0);

        var hitX = Math.abs((b.x || 0) - (player.x || 0)) < (b.hitW || 36);
        var hitY = Math.abs((b.y || 0) - ((player.y || 0) - 50)) < (b.hitH || 58);
        if (hitX && hitY && (player.invincible || 0) <= 0) {
          var damage = Math.max(1, Math.floor((b.damage || b.dmg || 8) - ((player.defense || 0) * 0.3)));
          player.hp = Math.max(0, (player.hp || 0) - damage);
          player.invincible = 0.85;
          player.hurtTime = 0.2;
          if (typeof makeText === 'function') makeText('-' + damage, player.x, player.y - 90, b.color || '#ff8787');

          if (b.status) {
            player.v13Status = player.v13Status || {};
            player.v13Status[b.status] = Math.max(player.v13Status[b.status] || 0, b.statusTime || 3);
          }
          b.life = 0;
        }
      });

      game.enemyProjectiles = game.enemyProjectiles.filter(function(b){
        return b && b.life > 0 && b.x > -400 && b.x < (game.width || 6000) + 400 && b.y > -400 && b.y < 1100;
      });
    };
  } else {
    window.updateEnemyProjectiles = updateEnemyProjectiles;
  }

  var oldUpdateProjectilesV17 = typeof updateProjectiles === 'function' ? updateProjectiles : null;
  if (oldUpdateProjectilesV17 && !oldUpdateProjectilesV17.__v17Wrapped) {
    var wrappedUpdateProjectiles = function updateProjectilesV17(dt){
      oldUpdateProjectilesV17.apply(this, arguments);
      if (typeof game !== 'undefined' && game && game.mode === 'hunt') {
        try {
          if (typeof updateEnemyProjectiles === 'function') updateEnemyProjectiles(dt || 0);
        } catch (err) {
          console.warn('[PixelRPG V17] enemy projectile update skipped:', err);
        }
      } else if (typeof game !== 'undefined' && game) {
        game.enemyProjectiles = [];
      }
    };
    wrappedUpdateProjectiles.__v17Wrapped = true;
    updateProjectiles = window.updateProjectiles = wrappedUpdateProjectiles;
  }

  var oldDrawProjectilesV17 = typeof drawProjectiles === 'function' ? drawProjectiles : null;
  if (oldDrawProjectilesV17 && !oldDrawProjectilesV17.__v17Wrapped) {
    var wrappedDrawProjectiles = function drawProjectilesV17(){
      oldDrawProjectilesV17.apply(this, arguments);
      if (typeof game === 'undefined' || !game || !Array.isArray(game.enemyProjectiles)) return;

      game.enemyProjectiles.forEach(function(b){
        if (!b) return;
        ctx.save();
        ctx.translate(b.x || 0, b.y || 0);
        ctx.shadowColor = b.color || '#c084fc';
        ctx.shadowBlur = 12;

        var k = String(b.kind || b.visual || '');
        if (/fire|burn/.test(k)) {
          ctx.fillStyle = '#fb923c';
          ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(-8,-10); ctx.lineTo(-18,0); ctx.lineTo(-8,10); ctx.closePath(); ctx.fill();
          ctx.fillStyle = '#fef08a'; circleSafe(ctx, 0, 0, 5);
        } else if (/ice|frost/.test(k)) {
          ctx.fillStyle = '#93c5fd';
          ctx.beginPath(); ctx.moveTo(18,0); ctx.lineTo(0,-9); ctx.lineTo(-18,0); ctx.lineTo(0,9); ctx.closePath(); ctx.fill();
        } else if (/poison/.test(k)) {
          ctx.fillStyle = '#86efac'; circleSafe(ctx, 0, 0, 10);
          ctx.fillStyle = '#14532d'; circleSafe(ctx, -3, -2, 2); circleSafe(ctx, 4, 3, 2);
        } else {
          ctx.fillStyle = b.color || '#c084fc'; circleSafe(ctx, 0, 0, 10);
          ctx.strokeStyle = 'rgba(255,255,255,0.75)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0,0,16,0,Math.PI*2); ctx.stroke();
        }

        ctx.restore();
      });
    };
    wrappedDrawProjectiles.__v17Wrapped = true;
    drawProjectiles = window.drawProjectiles = wrappedDrawProjectiles;
  }

  // Keep potion icons close to the original game style.
  var oldDrawItemIconV17 = typeof drawItemIcon === 'function' ? drawItemIcon : null;
  if (oldDrawItemIconV17 && !oldDrawItemIconV17.__v17PotionWrapped) {
    var wrappedDrawItemIcon = function drawItemIconV17(iconOrItem, x, y, size){
      var item = typeof iconOrItem === 'object' ? iconOrItem : null;
      var icon = item ? item.icon : iconOrItem;
      var id = String((item && item.id) || icon || '');
      var s = size || 36;

      if (id === 'hp_potion' || icon === 'hp' || /hp_potion|체력 물약/.test(id)) {
        ctx.save(); ctx.translate(x, y); ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#ff4d4f';
        circleSafe(ctx, -s * 0.14, -s * 0.09, s * 0.20);
        circleSafe(ctx,  s * 0.14, -s * 0.09, s * 0.20);
        ctx.beginPath(); ctx.moveTo(-s * 0.34, 0); ctx.lineTo(0, s * 0.36); ctx.lineTo(s * 0.34, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.85)'; circleSafe(ctx, -s * 0.09, -s * 0.12, s * 0.055);
        ctx.restore(); return;
      }

      if (id === 'mp_potion' || icon === 'mp' || /mp_potion|마나 물약/.test(id)) {
        ctx.save(); ctx.translate(x, y); ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = '#4dabf7';
        ctx.beginPath(); ctx.moveTo(0, -s * 0.38); ctx.quadraticCurveTo(s * 0.35, 0, 0, s * 0.38); ctx.quadraticCurveTo(-s * 0.35, 0, 0, -s * 0.38); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.75)'; circleSafe(ctx, -s * 0.08, -s * 0.08, s * 0.06);
        ctx.restore(); return;
      }

      oldDrawItemIconV17.apply(this, arguments);
    };
    wrappedDrawItemIcon.__v17PotionWrapped = true;
    drawItemIcon = window.drawItemIcon = wrappedDrawItemIcon;
  }

  var oldDrawHUDV17 = typeof drawHUD === 'function' ? drawHUD : null;
  if (oldDrawHUDV17 && !oldDrawHUDV17.__v17Wrapped) {
    var wrappedDrawHUD = function drawHUDV17(){
      oldDrawHUDV17.apply(this, arguments);
      try {
        ctx.save();
        ctx.textAlign = 'right';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillStyle = '#86efac';
        ctx.strokeStyle = 'rgba(15,23,42,0.95)';
        ctx.lineWidth = 5;
        ctx.strokeText('V17 통합 오류수정 적용됨', W - 22, 326);
        ctx.fillText('V17 통합 오류수정 적용됨', W - 22, 326);
        ctx.fillStyle = '#fcd34d';
        ctx.strokeText('strict 전역선언 · 상점함수 · 투사체함수 보정', W - 22, 348);
        ctx.fillText('strict 전역선언 · 상점함수 · 투사체함수 보정', W - 22, 348);
        ctx.restore();
      } catch (_) {}
    };
    wrappedDrawHUD.__v17Wrapped = true;
    drawHUD = window.drawHUD = wrappedDrawHUD;
  }

  console.log('[PixelRPG] V17 consolidated fix installed');
})();
