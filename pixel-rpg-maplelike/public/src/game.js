/* =========================================================
   Pixel RPG World Expansion 01
   - 10개 도시
   - 택시 이동
   - 도시별 사냥터
   - 50종 이상 몬스터 데이터
   - 몬스터 접촉 피해
   - 돈 / 부산물 / 판매 / 장비 구매 / 장착
   - 인벤토리 / 스탯 / 스킬 / 퀘스트 UI
   - 초보자 기본 스킬 3개
   - 전직 퀘스트 구조
   - 화면 우측 퀘스트 진행도
   - public/assets/references/player_body_sheet.png 지원
========================================================= */

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

canvas.width = 1280;
canvas.height = 720;
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.display = 'block';
ctx.imageSmoothingEnabled = false;

const W = 1280;
const H = 720;

const auth = document.getElementById('auth');
const characterScreen = document.getElementById('characterScreen');
const characterMenu = document.getElementById('characterMenu');
const help = document.getElementById('hudHelp');
const preview = document.getElementById('preview');
const menuPreview = document.getElementById('menuPreview');

let token = localStorage.getItem('pixel-rpg-token') || '';
let currentUser = null;
let loginMode = 'login';

const keys = new Set();

const selected = {
  skin: '#ffd6a6',
  hair: '#2b160e',
  hairStyle: 'basic',
  faceStyle: 'normal'
};

/* =========================================================
   Asset
========================================================= */

const bodySheet = new Image();
bodySheet.src = '/assets/references/player_body_sheet.png?v=world-expansion-01';

let bodySheetReady = false;
let processedBodySheet = null;

bodySheet.onload = () => {
  bodySheetReady = true;
  processedBodySheet = makeTransparentSheet(bodySheet);
  console.log('[Pixel RPG] loaded player_body_sheet.png', bodySheet.width, bodySheet.height);
};

bodySheet.onerror = () => {
  bodySheetReady = false;
  console.warn('[Pixel RPG] player_body_sheet.png not found. fallback character is used.');
};

const BODY_FRAMES = {
  idle: [
    { x: 8, y: 8, w: 42, h: 58 },
    { x: 58, y: 8, w: 42, h: 58 }
  ],
  walk: [
    { x: 108, y: 8, w: 42, h: 58 },
    { x: 158, y: 8, w: 42, h: 58 },
    { x: 208, y: 8, w: 42, h: 58 },
    { x: 258, y: 8, w: 42, h: 58 }
  ],
  jump: [
    { x: 358, y: 8, w: 44, h: 60 },
    { x: 408, y: 8, w: 44, h: 60 }
  ],
  attack: [
    { x: 10, y: 205, w: 58, h: 68 },
    { x: 78, y: 205, w: 58, h: 68 },
    { x: 146, y: 205, w: 64, h: 68 },
    { x: 220, y: 205, w: 68, h: 68 }
  ]
};

/* =========================================================
   World Data
========================================================= */

const TOWNS = [
  {
    id: 'lumina',
    name: '루미나',
    title: '초보자의 마을',
    taxiCost: 0,
    theme: 'grass',
    bg1: '#65caff',
    bg2: '#d9f8ff',
    ground: 548,
    hunt: 'lumina_field'
  },
  {
    id: 'greenwood',
    name: '그린우드',
    title: '숲의 도시',
    taxiCost: 80,
    theme: 'forest',
    bg1: '#75d6ff',
    bg2: '#dfffe7',
    ground: 548,
    hunt: 'greenwood_forest'
  },
  {
    id: 'ellenium',
    name: '일레니움',
    title: '마법의 도시',
    taxiCost: 130,
    theme: 'magic',
    bg1: '#8dd6ff',
    bg2: '#efe6ff',
    ground: 548,
    hunt: 'ellenium_mana_grove',
    jobNpc: 'mage'
  },
  {
    id: 'valorant',
    name: '발로란',
    title: '전사의 요새',
    taxiCost: 150,
    theme: 'fortress',
    bg1: '#9fd1ff',
    bg2: '#fff2d6',
    ground: 548,
    hunt: 'valorant_wall',
    jobNpc: 'warrior'
  },
  {
    id: 'shadowport',
    name: '섀도포트',
    title: '도적의 항구',
    taxiCost: 180,
    theme: 'port',
    bg1: '#6ca6d9',
    bg2: '#d8e6ff',
    ground: 548,
    hunt: 'shadowport_alley',
    jobNpc: 'rogue'
  },
  {
    id: 'sylvania',
    name: '실바니아',
    title: '궁수의 마을',
    taxiCost: 180,
    theme: 'forest',
    bg1: '#7ed7ff',
    bg2: '#e9ffe2',
    ground: 548,
    hunt: 'sylvania_range',
    jobNpc: 'archer'
  },
  {
    id: 'irondeep',
    name: '아이언딥',
    title: '광산 도시',
    taxiCost: 230,
    theme: 'mine',
    bg1: '#85a6c9',
    bg2: '#d8d8d8',
    ground: 548,
    hunt: 'irondeep_mine'
  },
  {
    id: 'frosthall',
    name: '프로스트홀',
    title: '얼음 마을',
    taxiCost: 260,
    theme: 'ice',
    bg1: '#9ee8ff',
    bg2: '#f2fdff',
    ground: 548,
    hunt: 'frosthall_cave'
  },
  {
    id: 'solas',
    name: '솔라스',
    title: '사막 도시',
    taxiCost: 300,
    theme: 'desert',
    bg1: '#ffd089',
    bg2: '#fff1c2',
    ground: 548,
    hunt: 'solas_dune'
  },
  {
    id: 'nocturn',
    name: '노크턴',
    title: '폐허 도시',
    taxiCost: 400,
    theme: 'ruin',
    bg1: '#5f6f92',
    bg2: '#c6d2e8',
    ground: 548,
    hunt: 'nocturn_ruins'
  }
];

const JOBS = {
  beginner: {
    name: '초보자',
    main: 'str',
    skills: ['strike', 'stone_throw', 'first_aid']
  },
  warrior: {
    name: '전사',
    main: 'str',
    skills: ['power_slash', 'guard_stance', 'charge']
  },
  mage: {
    name: '마법사',
    main: 'int',
    skills: ['magic_bolt', 'fireball', 'mana_shield']
  },
  rogue: {
    name: '도적',
    main: 'luk',
    skills: ['double_stab', 'poison_needle', 'shadow_step']
  },
  archer: {
    name: '궁수',
    main: 'dex',
    skills: ['arrow_shot', 'rapid_arrow', 'eagle_eye']
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
  range: 62,
  cooldown: 0.35,
  desc: 'Lv.2 해금. 주먹으로 강하게 공격합니다.'
},
stone_throw: {
  id: 'stone_throw',
  name: '돌던지기',
  job: 'beginner',
  unlockLevel: 4,
  mp: 3,
  power: 1.05,
  range: 170,
  cooldown: 0.8,
  projectile: true,
  desc: 'Lv.4 해금. 돌을 던져 원거리의 적을 공격합니다.'
},
first_aid: {
  id: 'first_aid',
  name: '숨고르기',
  job: 'beginner',
  unlockLevel: 6,
  mp: 6,
  power: 0,
  range: 0,
  cooldown: 5,
  heal: 35,
  desc: 'Lv.6 해금. HP를 회복합니다.'
},
  power_slash: {
    id: 'power_slash',
    name: '파워 슬래시',
    job: 'warrior',
    mp: 8,
    power: 1.8,
    range: 95,
    cooldown: 0.7,
    desc: '강한 검기를 날립니다.'
  },
  guard_stance: {
    id: 'guard_stance',
    name: '방어 태세',
    job: 'warrior',
    mp: 10,
    cooldown: 8,
    buff: 'guard',
    desc: '잠시 방어력이 증가합니다.'
  },
  charge: {
    id: 'charge',
    name: '돌진',
    job: 'warrior',
    mp: 12,
    power: 1.5,
    range: 115,
    cooldown: 2.2,
    dash: true,
    desc: '앞으로 돌진하며 적을 공격합니다.'
  },
  magic_bolt: {
    id: 'magic_bolt',
    name: '매직 볼트',
    job: 'mage',
    mp: 8,
    power: 1.65,
    range: 220,
    cooldown: 0.75,
    projectile: true,
    magic: true,
    desc: '마력 구체를 발사합니다.'
  },
  fireball: {
    id: 'fireball',
    name: '파이어볼',
    job: 'mage',
    mp: 16,
    power: 2.2,
    range: 250,
    cooldown: 1.6,
    projectile: true,
    magic: true,
    splash: 70,
    desc: '폭발하는 화염구를 발사합니다.'
  },
  mana_shield: {
    id: 'mana_shield',
    name: '마나 실드',
    job: 'mage',
    mp: 18,
    cooldown: 10,
    buff: 'manaShield',
    desc: '일정 시간 피해를 줄입니다.'
  },
  double_stab: {
    id: 'double_stab',
    name: '더블 스탭',
    job: 'rogue',
    mp: 8,
    power: 1.35,
    hits: 2,
    range: 78,
    cooldown: 0.65,
    desc: '빠르게 두 번 찌릅니다.'
  },
  poison_needle: {
    id: 'poison_needle',
    name: '독침',
    job: 'rogue',
    mp: 12,
    power: 1.35,
    range: 210,
    cooldown: 1.3,
    projectile: true,
    poison: true,
    desc: '독침을 던져 지속 피해를 줍니다.'
  },
  shadow_step: {
    id: 'shadow_step',
    name: '그림자 이동',
    job: 'rogue',
    mp: 10,
    cooldown: 3.5,
    dash: true,
    desc: '짧은 거리를 빠르게 이동합니다.'
  },
  arrow_shot: {
    id: 'arrow_shot',
    name: '화살 사격',
    job: 'archer',
    mp: 7,
    power: 1.55,
    range: 260,
    cooldown: 0.65,
    projectile: true,
    desc: '화살을 발사합니다.'
  },
  rapid_arrow: {
    id: 'rapid_arrow',
    name: '연속 사격',
    job: 'archer',
    mp: 14,
    power: 0.9,
    hits: 3,
    range: 260,
    cooldown: 1.4,
    projectile: true,
    desc: '빠르게 세 발을 발사합니다.'
  },
  eagle_eye: {
    id: 'eagle_eye',
    name: '매의 눈',
    job: 'archer',
    mp: 12,
    cooldown: 8,
    buff: 'eagleEye',
    desc: '치명타 확률이 증가합니다.'
  }
};

const QUESTS = {
  tutorial: {
    id: 'tutorial',
    title: '초보자의 첫 사냥',
    town: 'lumina',
    npc: '장로 구름',
    desc: '루미나 들판에서 초록 슬라임 5마리를 처치하세요.',
    goals: [{ type: 'kill', monsterFamily: 'slime', need: 5, count: 0 }],
    rewardGold: 80,
    rewardExp: 70,
    rewardItems: [{ id: 'hp_potion', count: 3 }]
  },
  mage_job: {
    id: 'mage_job',
    title: '마법사의 길',
    town: 'ellenium',
    npc: '대마법사 이렌',
    jobReward: 'mage',
    desc: '마나 정령 12마리를 처치하고 푸른 결정 8개를 모으세요.',
    goals: [
      { type: 'kill', monsterFamily: 'mana', need: 12, count: 0 },
      { type: 'item', itemId: 'blue_crystal', need: 8, count: 0 }
    ],
    rewardGold: 300,
    rewardExp: 250
  },
  warrior_job: {
    id: 'warrior_job',
    title: '전사의 증명',
    town: 'valorant',
    npc: '기사단장 로한',
    jobReward: 'warrior',
    desc: '철갑 멧돼지 12마리를 처치하고 녹슨 검 파편 8개를 모으세요.',
    goals: [
      { type: 'kill', monsterFamily: 'boar', need: 12, count: 0 },
      { type: 'item', itemId: 'rusted_blade', need: 8, count: 0 }
    ],
    rewardGold: 300,
    rewardExp: 250
  },
  rogue_job: {
    id: 'rogue_job',
    title: '그림자 시험',
    town: 'shadowport',
    npc: '그림자 란',
    jobReward: 'rogue',
    desc: '그림자 슬라임 14마리를 처치하고 검은 가죽 8개를 모으세요.',
    goals: [
      { type: 'kill', monsterFamily: 'shadow', need: 14, count: 0 },
      { type: 'item', itemId: 'black_hide', need: 8, count: 0 }
    ],
    rewardGold: 300,
    rewardExp: 250
  },
  archer_job: {
    id: 'archer_job',
    title: '숲의 사수',
    town: 'sylvania',
    npc: '명궁 세리아',
    jobReward: 'archer',
    desc: '숲 벌레 14마리를 처치하고 단단한 깃털 8개를 모으세요.',
    goals: [
      { type: 'kill', monsterFamily: 'bug', need: 14, count: 0 },
      { type: 'item', itemId: 'hard_feather', need: 8, count: 0 }
    ],
    rewardGold: 300,
    rewardExp: 250
  }
};

const ITEMS = {
  hp_potion: { id: 'hp_potion', name: '체력 물약', type: 'consumable', price: 30, sell: 8, icon: 'hp', desc: 'HP를 50 회복합니다.' },
  mp_potion: { id: 'mp_potion', name: '마나 물약', type: 'consumable', price: 35, sell: 9, icon: 'mp', desc: 'MP를 30 회복합니다.' },

  slime_jelly: { id: 'slime_jelly', name: '슬라임 젤리', type: 'etc', price: 0, sell: 5, icon: 'drop', desc: '상인에게 판매할 수 있습니다.' },
  mushroom_spore: { id: 'mushroom_spore', name: '버섯 포자', type: 'etc', price: 0, sell: 7, icon: 'drop', desc: '상인에게 판매할 수 있습니다.' },
  blue_crystal: { id: 'blue_crystal', name: '푸른 결정', type: 'etc', price: 0, sell: 12, icon: 'crystal', desc: '마법 지역 몬스터의 부산물입니다.' },
  rusted_blade: { id: 'rusted_blade', name: '녹슨 검 파편', type: 'etc', price: 0, sell: 12, icon: 'sword', desc: '전사 전직 퀘스트 재료입니다.' },
  black_hide: { id: 'black_hide', name: '검은 가죽', type: 'etc', price: 0, sell: 12, icon: 'drop', desc: '도적 전직 퀘스트 재료입니다.' },
  hard_feather: { id: 'hard_feather', name: '단단한 깃털', type: 'etc', price: 0, sell: 12, icon: 'feather', desc: '궁수 전직 퀘스트 재료입니다.' },
  ore_piece: { id: 'ore_piece', name: '광석 조각', type: 'etc', price: 0, sell: 18, icon: 'ore', desc: '광산 몬스터의 부산물입니다.' },
  ice_shard: { id: 'ice_shard', name: '얼음 조각', type: 'etc', price: 0, sell: 20, icon: 'ice', desc: '얼음 몬스터의 부산물입니다.' },
  desert_scale: { id: 'desert_scale', name: '사막 비늘', type: 'etc', price: 0, sell: 24, icon: 'scale', desc: '사막 몬스터의 부산물입니다.' },
  ruin_core: { id: 'ruin_core', name: '폐허의 핵', type: 'etc', price: 0, sell: 35, icon: 'core', desc: '폐허 몬스터의 부산물입니다.' },

  wooden_sword: { id: 'wooden_sword', name: '나무 검', type: 'weapon', price: 80, sell: 20, icon: 'sword', atk: 4, desc: '공격력 +4' },
  iron_sword: { id: 'iron_sword', name: '철검', type: 'weapon', price: 240, sell: 60, icon: 'sword', atk: 12, desc: '공격력 +12' },
  apprentice_staff: { id: 'apprentice_staff', name: '수습 지팡이', type: 'weapon', price: 250, sell: 60, icon: 'staff', matk: 14, int: 3, desc: '마법공격 +14, INT +3' },
  hunter_bow: { id: 'hunter_bow', name: '사냥꾼 활', type: 'weapon', price: 260, sell: 65, icon: 'bow', atk: 9, dex: 4, desc: '공격력 +9, DEX +4' },
  shadow_dagger: { id: 'shadow_dagger', name: '그림자 단검', type: 'weapon', price: 280, sell: 70, icon: 'dagger', atk: 8, luk: 5, desc: '공격력 +8, LUK +5' },

  cloth_armor: { id: 'cloth_armor', name: '천 갑옷', type: 'armor', price: 110, sell: 28, icon: 'armor', def: 4, hp: 20, desc: '방어 +4, HP +20' },
  iron_armor: { id: 'iron_armor', name: '철 갑옷', type: 'armor', price: 320, sell: 80, icon: 'armor', def: 13, hp: 70, desc: '방어 +13, HP +70' },
  magic_robe: { id: 'magic_robe', name: '마법 로브', type: 'armor', price: 330, sell: 82, icon: 'armor', def: 6, mp: 80, int: 5, desc: '방어 +6, MP +80, INT +5' },

  lucky_ring: { id: 'lucky_ring', name: '행운 반지', type: 'accessory', price: 250, sell: 60, icon: 'ring', luk: 5, crit: 3, desc: 'LUK +5, 치명타 +3%' },
  swift_charm: { id: 'swift_charm', name: '민첩 부적', type: 'accessory', price: 260, sell: 65, icon: 'ring', dex: 5, speed: 10, desc: 'DEX +5, 이동속도 +10' },
  power_badge: { id: 'power_badge', name: '힘의 배지', type: 'accessory', price: 280, sell: 70, icon: 'ring', str: 5, atk: 3, desc: 'STR +5, 공격력 +3' }
};

const SHOP_ITEMS = [
  'hp_potion',
  'mp_potion',
  'wooden_sword',
  'iron_sword',
  'apprentice_staff',
  'hunter_bow',
  'shadow_dagger',
  'cloth_armor',
  'iron_armor',
  'magic_robe',
  'lucky_ring',
  'swift_charm',
  'power_badge'
];

const MONSTER_PREFIXES = [
  '초록', '파란', '붉은', '검은', '빛나는',
  '사나운', '작은', '거친', '날카로운', '오래된'
];

const MONSTER_BASES = [
  { family: 'slime', name: '슬라임', drop: 'slime_jelly', color: '#64e77a', shape: 'slime' },
  { family: 'mushroom', name: '버섯', drop: 'mushroom_spore', color: '#d98233', shape: 'mushroom' },
  { family: 'mana', name: '마나 정령', drop: 'blue_crystal', color: '#74c0fc', shape: 'spirit' },
  { family: 'boar', name: '멧돼지', drop: 'rusted_blade', color: '#9c6b43', shape: 'boar' },
  { family: 'shadow', name: '그림자 괴물', drop: 'black_hide', color: '#4c3d70', shape: 'ogre' },
  { family: 'bug', name: '숲 벌레', drop: 'hard_feather', color: '#7bc96f', shape: 'bug' },
  { family: 'ore', name: '광석 골렘', drop: 'ore_piece', color: '#89929c', shape: 'golem' },
  { family: 'ice', name: '얼음 정령', drop: 'ice_shard', color: '#8cecff', shape: 'spirit' },
  { family: 'desert', name: '모래 도마뱀', drop: 'desert_scale', color: '#d6a15d', shape: 'lizard' },
  { family: 'ruin', name: '폐허 수호자', drop: 'ruin_core', color: '#65708b', shape: 'golem' }
];

const MONSTER_TYPES = generateMonsterTypes();

function generateMonsterTypes() {
  const list = [];
  let level = 1;

  for (let b = 0; b < MONSTER_BASES.length; b++) {
    for (let p = 0; p < MONSTER_PREFIXES.length; p++) {
      const base = MONSTER_BASES[b];
      const prefix = MONSTER_PREFIXES[p];

      list.push({
        id: `${base.family}_${p}`,
        family: base.family,
        name: `${prefix} ${base.name}`,
        level,
        hp: 28 + level * 16,
        atk: 5 + level * 3,
        def: Math.floor(level * 0.8),
        exp: 10 + level * 6,
        gold: 8 + level * 5,
        drop: base.drop,
        dropRate: clamp(0.56 - level * 0.008, 0.18, 0.56),
        color: base.color,
        shape: base.shape,
        respawn: clamp(1800 + level * 130, 1800, 6500),
        speed: clamp(18 + level * 0.7, 18, 45)
      });

      level += 1;
    }
  }

  return list;
}

const HUNT_MAPS = {
  lumina_field: { town: 'lumina', title: '루미나 들판', baseIndex: 0 },
  greenwood_forest: { town: 'greenwood', title: '그린우드 숲', baseIndex: 5 },
  ellenium_mana_grove: { town: 'ellenium', title: '마나 숲', baseIndex: 20 },
  valorant_wall: { town: 'valorant', title: '요새 외벽', baseIndex: 30 },
  shadowport_alley: { town: 'shadowport', title: '어둠 골목', baseIndex: 40 },
  sylvania_range: { town: 'sylvania', title: '실바니아 사냥터', baseIndex: 50 },
  irondeep_mine: { town: 'irondeep', title: '아이언딥 광산', baseIndex: 60 },
  frosthall_cave: { town: 'frosthall', title: '프로스트 동굴', baseIndex: 70 },
  solas_dune: { town: 'solas', title: '솔라스 사막', baseIndex: 80 },
  nocturn_ruins: { town: 'nocturn', title: '노크턴 폐허', baseIndex: 90 }
};

/* =========================================================
   Main State
========================================================= */

const game = {
  ready: false,
  mode: 'town',
  townId: 'lumina',
  huntId: 'lumina_field',

  width: 4200,
  ground: 548,
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
  shopOpen: false,
  taxiOpen: false,

  selectedShopIndex: 0,
  selectedInventoryIndex: 0,

  player: createDefaultPlayer()
};

const inventory = {
  open: false,
  tab: 'all',
  items: [
    makeItemStack('hp_potion', 10),
    makeItemStack('mp_potion', 10),
    makeItemStack('wooden_sword', 1),
    makeItemStack('cloth_armor', 1)
  ],
  quickSlots: ['hp_potion', 'mp_potion', null, null]
};

const stats = {
  open: false,
  str: 4,
  dex: 4,
  int: 4,
  luk: 4,
  ap: 5
};

const skills = {
  open: false,
  unlocked: [],
  hotkeys: {
    k: null,
    l: null,
    semicolon: null
  },

   function refreshUnlockedSkills() {
  const p = game.player;
  const job = p.character.job || 'beginner';

  const allowed = [];

  for (const id of Object.keys(SKILLS)) {
    const skill = SKILLS[id];

    const correctJob =
      skill.job === 'beginner' ||
      skill.job === job;

    const levelOk =
      !skill.unlockLevel ||
      p.level >= skill.unlockLevel;

    if (correctJob && levelOk) {
      allowed.push(id);
    }
  }

  for (const id of allowed) {
    if (!skills.unlocked.includes(id)) {
      skills.unlocked.push(id);
      makeText(`${SKILLS[id].name} 해금!`, p.x, p.y - 115, '#ffe066');
    }
  }

  if (!skills.hotkeys.k && skills.unlocked[0]) skills.hotkeys.k = skills.unlocked[0];
  if (!skills.hotkeys.l && skills.unlocked[1]) skills.hotkeys.l = skills.unlocked[1];
  if (!skills.hotkeys.semicolon && skills.unlocked[2]) skills.hotkeys.semicolon = skills.unlocked[2];
}
  cooldowns: {}
};

const quests = {
  open: false,
  active: [],
  completed: []
};

const equipment = {
  weapon: null,
  armor: null,
  accessory: null
};

const wallet = {
  gold: 120
};

const buffs = {
  guard: 0,
  manaShield: 0,
  eagleEye: 0
};

function createDefaultPlayer() {
  return {
    x: 260,
    y: 548,
    vx: 0,
    vy: 0,
    face: 1,
    grounded: true,

    anim: 'idle',
    animTime: 0,
    attackTime: 0,
    hurtTime: 0,
    invincible: 0,

    level: 1,
    exp: 0,
    nextExp: 80,

    hp: 120,
    maxHp: 120,
    mp: 45,
    maxMp: 45,

    attackPower: 20,
    magicPower: 8,
    defense: 2,
    critRate: 5,
    evasion: 3,
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

function makeItemStack(id, count) {
  return {
    id,
    count
  };
}

/* =========================================================
   API / Auth
========================================================= */

function $(id) {
  return document.getElementById(id);
}

async function api(path, body) {
  const res = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json();

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

  const p = user?.save?.player;
  const menuName = $('menuName');

  if (menuName && p?.character) {
    menuName.textContent = `${p.character.name} Lv.${p.level || 1}`;
  }
}

function setMode(mode) {
  loginMode = mode;

  const loginTab = $('tabLogin');
  const registerTab = $('tabRegister');
  const authBtn = $('authBtn');
  const authMsg = $('authMsg');

  if (loginTab) loginTab.classList.toggle('active', mode === 'login');
  if (registerTab) registerTab.classList.toggle('active', mode === 'register');
  if (authBtn) authBtn.textContent = mode === 'login' ? '로그인' : '회원가입';
  if (authMsg) authMsg.textContent = '';
}

async function submitAuth() {
  const authMsg = $('authMsg');

  try {
    if (authMsg) authMsg.textContent = '';

    const username = $('username')?.value.trim();
    const password = $('password')?.value;

    if (!username || !password) {
      throw new Error('아이디와 비밀번호를 입력해주세요.');
    }

    const data = await api(loginMode === 'login' ? '/api/login' : '/api/register', {
      username,
      password
    });

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
  const createMsg = $('createMsg');

  try {
    if (createMsg) createMsg.textContent = '';

    const nickname = $('charName')?.value.trim();

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

function startGame(save) {
  hideAllPanels();
  if (help) help.classList.remove('hidden');

  hydrateSave(save || {});

  loadTown(game.townId || 'lumina');

  game.player.y = game.ground;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.grounded = true;
  game.ready = true;
}

function hydrateSave(save) {
  const savedPlayer = save.player || {};

  game.player = {
    ...createDefaultPlayer(),
    ...savedPlayer,
    character: {
      ...createDefaultPlayer().character,
      ...(savedPlayer.character || {})
    }
  };

  wallet.gold = save.gold ?? wallet.gold;

  if (save.stats) Object.assign(stats, { open: false }, save.stats);
  if (save.inventory) {
    inventory.items = Array.isArray(save.inventory.items) ? save.inventory.items : inventory.items;
    inventory.quickSlots = save.inventory.quickSlots || inventory.quickSlots;
  }
  if (save.equipment) Object.assign(equipment, save.equipment);
  if (save.skills) {
    skills.unlocked = save.skills.unlocked || skills.unlocked;
    skills.hotkeys = save.skills.hotkeys || skills.hotkeys;
  }
  if (save.quests) {
    quests.active = save.quests.active || [];
    quests.completed = save.quests.completed || [];
  }

  game.townId = save.townId || 'lumina';
  game.huntId = save.huntId || getTown(game.townId).hunt;

  recalcStats();
}

async function saveGame() {
  if (!game.ready) return;

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

  try {
    await api('/api/save', save);
    makeText('저장 완료', game.player.x, game.player.y - 90, '#9bf6ff');
  } catch {
    makeText('저장 실패', game.player.x, game.player.y - 90, '#ff8787');
  }
}

function logout() {
  token = '';
  currentUser = null;
  localStorage.removeItem('pixel-rpg-token');
  showAuth();
}

/* =========================================================
   UI Binding
========================================================= */

function bindUI() {
  $('tabLogin')?.addEventListener('click', () => setMode('login'));
  $('tabRegister')?.addEventListener('click', () => setMode('register'));
  $('authBtn')?.addEventListener('click', submitAuth);

  $('startNewBtn')?.addEventListener('click', createCharacterAndStart);
  $('continueBtn')?.addEventListener('click', () => startGame(currentUser?.save));

  $('logoutBtn')?.addEventListener('click', logout);
  $('logoutBtn2')?.addEventListener('click', logout);

  document.querySelectorAll('.swatches').forEach(group => {
    const target = group.dataset.target;

    group.querySelectorAll('span').forEach(span => {
      span.addEventListener('click', () => {
        if (!target) return;

        const color = getComputedStyle(span).backgroundColor;
        selected[target] = rgbToHex(color);

        group.querySelectorAll('span').forEach(item => item.classList.remove('selected'));
        span.classList.add('selected');
      });
    });
  });

  document.querySelectorAll('#hairStyleChoices .choice').forEach(btn => {
    btn.addEventListener('click', () => {
      selected.hairStyle = btn.dataset.value || 'basic';

      document.querySelectorAll('#hairStyleChoices .choice').forEach(item => {
        item.classList.remove('active');
      });

      btn.classList.add('active');
    });
  });

  document.querySelectorAll('#faceStyleChoices .choice').forEach(btn => {
    btn.addEventListener('click', () => {
      selected.faceStyle = btn.dataset.value || 'normal';

      document.querySelectorAll('#faceStyleChoices .choice').forEach(item => {
        item.classList.remove('active');
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
  } catch {
    token = '';
    localStorage.removeItem('pixel-rpg-token');
    showAuth();
  }
}

/* =========================================================
   Scene / Town / Hunt
========================================================= */

function getTown(id) {
  return TOWNS.find(t => t.id === id) || TOWNS[0];
}

function getHunt(id) {
  return HUNT_MAPS[id] || HUNT_MAPS.lumina_field;
}

function loadTown(townId) {
  const town = getTown(townId);

  game.mode = 'town';
  game.townId = town.id;
  game.huntId = town.hunt;
  game.width = 4200;
  game.ground = town.ground;
  game.platforms = [];
  game.monsters = [];
  game.drops = [];
  game.projectiles = [];

  game.portals = [
    { x: 3920, y: game.ground, type: 'hunt', label: '사냥터' }
  ];

  game.npcs = [
    { type: 'taxi', name: '택시 기사', x: 420, y: game.ground, text: '다른 도시로 이동할 수 있습니다.' },
    { type: 'merchant', name: '상인', x: 760, y: game.ground, text: '부산물을 판매하고 물약을 살 수 있습니다.' },
    { type: 'weapon', name: '장비 상인', x: 1100, y: game.ground, text: '무기와 방어구를 판매합니다.' },
    { type: 'quest', name: '장로 구름', x: 1450, y: game.ground, quest: 'tutorial', text: '초보자 사냥 훈련을 도와드리겠습니다.' }
  ];

  if (town.jobNpc === 'mage') {
    game.npcs.push({ type: 'job', job: 'mage', name: '대마법사 이렌', x: 1800, y: game.ground, quest: 'mage_job', text: '마법사의 길을 걷고 싶나요?' });
  }

  if (town.jobNpc === 'warrior') {
    game.npcs.push({ type: 'job', job: 'warrior', name: '기사단장 로한', x: 1800, y: game.ground, quest: 'warrior_job', text: '전사의 증명을 보이십시오.' });
  }

  if (town.jobNpc === 'rogue') {
    game.npcs.push({ type: 'job', job: 'rogue', name: '그림자 란', x: 1800, y: game.ground, quest: 'rogue_job', text: '그림자는 조용히 움직입니다.' });
  }

  if (town.jobNpc === 'archer') {
    game.npcs.push({ type: 'job', job: 'archer', name: '명궁 세리아', x: 1800, y: game.ground, quest: 'archer_job', text: '숲의 사수가 될 준비가 되었나요?' });
  }

  game.player.x = clamp(game.player.x || 260, 80, game.width - 120);
  game.player.y = game.ground;
  game.cameraX = clamp(game.player.x - W * 0.42, 0, game.width - W);
}

function loadHunt(huntId) {
  const hunt = getHunt(huntId);
  const town = getTown(hunt.town);

  game.mode = 'hunt';
  game.huntId = huntId;
  game.townId = town.id;
  game.width = 5200;
  game.ground = 610;
  game.npcs = [];
  game.monsters = [];
  game.drops = [];
  game.projectiles = [];

  game.platforms = [
    { x: 360, y: 520, w: 520, h: 24 },
    { x: 1040, y: 450, w: 540, h: 24 },
    { x: 1700, y: 380, w: 520, h: 24 },
    { x: 2400, y: 310, w: 560, h: 24 },
    { x: 3100, y: 240, w: 520, h: 24 },
    { x: 3760, y: 170, w: 560, h: 24 },
    { x: 4400, y: 110, w: 520, h: 24 }
  ];

  game.portals = [
    { x: 120, y: game.ground, type: 'town', label: town.name }
  ];

  spawnHuntMonsters(hunt);
  game.player.x = 220;
  game.player.y = game.ground;
  game.player.vx = 0;
  game.player.vy = 0;
  game.cameraX = 0;
}

function spawnHuntMonsters(hunt) {
  const base = hunt.baseIndex;

  const spawnRows = [
    { y: game.ground, count: 12, startX: 520, gap: 280, tier: 0 },
    { y: 520, count: 8, startX: 420, gap: 420, tier: 1 },
    { y: 450, count: 7, startX: 1100, gap: 450, tier: 2 },
    { y: 380, count: 6, startX: 1760, gap: 500, tier: 3 },
    { y: 310, count: 5, startX: 2460, gap: 550, tier: 4 },
    { y: 240, count: 4, startX: 3180, gap: 620, tier: 5 },
    { y: 170, count: 3, startX: 3860, gap: 680, tier: 6 },
    { y: 110, count: 2, startX: 4540, gap: 460, tier: 7 }
  ];

  for (const row of spawnRows) {
    for (let i = 0; i < row.count; i++) {
      const idx = clamp(base + row.tier * 2 + (i % 2), 0, MONSTER_TYPES.length - 1);
      const type = MONSTER_TYPES[idx];

      game.monsters.push({
        uid: Math.random().toString(36).slice(2),
        typeId: type.id,
        type,
        x: row.startX + i * row.gap,
        baseX: row.startX + i * row.gap,
        y: row.y,
        spawnY: row.y,
        hp: type.hp,
        maxHp: type.hp,
        face: i % 2 ? -1 : 1,
        time: Math.random() * 10,
        hit: 0,
        dead: false,
        respawnLeft: 0,
        attackCooldown: 0,
        poison: 0
      });
    }
  }
}

/* =========================================================
   Input
========================================================= */

window.addEventListener('keydown', e => {
  const key = String(e.key || '').toLowerCase();

  keys.add(key);

  if ([' ', 'arrowup', 'arrowleft', 'arrowright'].includes(key)) {
    e.preventDefault();
  }

  if (!game.ready) return;

  if (game.dialog || game.shopOpen || game.taxiOpen) {
    if (key === 'escape') closeAllWindows();
    return;
  }

  if (key === 'j') basicAttack();
  if (key === 'k') useHotSkill('k');
  if (key === 'l') useHotSkill('l');
  if (key === ';') useHotSkill('semicolon');
  if (key === 'e') interact();
  if (key === 'z') pickNearbyDrops();
  if (key === 's') saveGame();

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

  if (key === '1') usePotionSlot(0);
  if (key === '2') usePotionSlot(1);
  if (key === '3') usePotionSlot(2);
  if (key === '4') usePotionSlot(3);
});

window.addEventListener('keyup', e => {
  const key = String(e.key || '').toLowerCase();
  keys.delete(key);
});

canvas.addEventListener('click', e => {
  if (!game.ready) return;

  const pos = getMousePos(e);

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

  if (stats.open) {
    handleStatClick(pos.x, pos.y);
    return;
  }

  if (inventory.open) {
    handleInventoryClick(pos.x, pos.y);
    return;
  }

  if (skills.open) {
    handleSkillClick(pos.x, pos.y);
    return;
  }

  if (quests.open) {
    handleQuestClick(pos.x, pos.y);
  }
});

function getMousePos(e) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: (e.clientX - rect.left) * (W / rect.width),
    y: (e.clientY - rect.top) * (H / rect.height)
  };
}

function closeAllWindows() {
  game.dialog = null;
  game.shopOpen = false;
  game.taxiOpen = false;
}

/* =========================================================
   Interaction
========================================================= */

function interact() {
  const p = game.player;

  for (const portal of game.portals) {
    if (Math.abs(p.x - portal.x) < 90 && Math.abs(p.y - portal.y) < 120) {
      if (portal.type === 'hunt') {
        loadHunt(getTown(game.townId).hunt);
      } else {
        loadTown(game.townId);
        game.player.x = 3800;
      }

      return;
    }
  }

  for (const npc of game.npcs) {
    if (Math.abs(p.x - npc.x) < 90) {
      openNpcDialog(npc);
      return;
    }
  }

  pickNearbyDrops();
}

function openNpcDialog(npc) {
  game.dialog = {
    npc,
    page: 'main'
  };
}

function handleDialogClick(x, y) {
  const dialog = game.dialog;
  if (!dialog) return;

  const npc = dialog.npc;

  if (hit(x, y, 950, 616, 120, 40)) {
    game.dialog = null;
    return;
  }

  if (npc.type === 'taxi' && hit(x, y, 220, 620, 180, 42)) {
    game.dialog = null;
    game.taxiOpen = true;
    return;
  }

  if ((npc.type === 'merchant' || npc.type === 'weapon') && hit(x, y, 220, 620, 180, 42)) {
    game.dialog = null;
    game.shopOpen = npc.type;
    return;
  }

  if ((npc.type === 'quest' || npc.type === 'job') && hit(x, y, 220, 620, 180, 42)) {
    tryAcceptOrCompleteQuest(npc.quest);
    return;
  }
}

function tryAcceptOrCompleteQuest(questId) {
  const base = QUESTS[questId];
  if (!base) return;

  if (quests.completed.includes(questId)) {
    makeText('이미 완료한 퀘스트입니다.', game.player.x, game.player.y - 90, '#cbd5e1');
    return;
  }

  const active = quests.active.find(q => q.id === questId);

  if (!active) {
    const copy = JSON.parse(JSON.stringify(base));
    quests.active.push(copy);
    makeText('퀘스트 수락!', game.player.x, game.player.y - 90, '#ffe066');
    return;
  }

  syncItemQuestCounts(active);

  if (!isQuestComplete(active)) {
    makeText('아직 조건을 완료하지 못했습니다.', game.player.x, game.player.y - 90, '#ffdd99');
    return;
  }

  completeQuest(active);
}

function isQuestComplete(q) {
  return q.goals.every(g => g.count >= g.need);
}

function completeQuest(q) {
  wallet.gold += q.rewardGold || 0;
  addExp(q.rewardExp || 0);

  if (Array.isArray(q.rewardItems)) {
    for (const reward of q.rewardItems) {
      addItem(reward.id, reward.count);
    }
  }

  if (q.jobReward) {
    game.player.character.job = q.jobReward;

    for (const skill of JOBS[q.jobReward].skills) {
      if (!skills.unlocked.includes(skill)) skills.unlocked.push(skill);
    }

    makeText(`${JOBS[q.jobReward].name} 전직 완료!`, game.player.x, game.player.y - 130, '#ffe066');
  }

  quests.active = quests.active.filter(v => v.id !== q.id);
  quests.completed.push(q.id);
  makeText('퀘스트 완료!', game.player.x, game.player.y - 105, '#c0eb75');
}

function syncItemQuestCounts(q) {
  for (const goal of q.goals) {
    if (goal.type === 'item') {
      goal.count = getItemCount(goal.itemId);
    }
  }
}

function pickNearbyDrops() {
  const p = game.player;

  for (const d of game.drops) {
    if (d.picked) continue;

    if (Math.abs(d.x - p.x) < 54 && Math.abs(d.y - p.y) < 70) {
      d.picked = true;

      if (d.kind === 'gold') {
        wallet.gold += d.amount;
        makeText(`+${d.amount}G`, p.x, p.y - 82, '#ffd43b');
      } else {
        addItem(d.itemId, d.count);
        makeText(`${ITEMS[d.itemId]?.name || d.itemId} +${d.count}`, p.x, p.y - 82, '#c0eb75');
      }
    }
  }

  game.drops = game.drops.filter(d => !d.picked);
}

/* =========================================================
   Combat / Skills
========================================================= */

function basicAttack() {
  const p = game.player;

  if (p.attackTime > 0) return;

  p.attackTime = 0.32;
  p.anim = 'attack';
  p.animTime = 0;

  performHit({
    range: 56,
    power: 1.0,
    hits: 1,
    magic: false,
    splash: 0
  });

  makeSlash(p.x + p.face * 34, p.y - 38, p.face, '#ffb020');
}

function useHotSkill(key) {
  const skillId = skills.hotkeys[key];
  if (!skillId) return;

  useSkill(skillId);
}

function useSkill(skillId) {
  const skill = SKILLS[skillId];
  if (!skill) return;

  if (!skills.unlocked.includes(skillId)) {
    makeText('아직 배운 스킬이 아닙니다.', game.player.x, game.player.y - 90, '#ff8787');
    return;
  }

  const cd = skills.cooldowns[skillId] || 0;
  if (cd > 0) {
    makeText('쿨타임 중입니다.', game.player.x, game.player.y - 90, '#cbd5e1');
    return;
  }

  if (game.player.mp < skill.mp) {
    makeText('MP 부족', game.player.x, game.player.y - 90, '#74c0fc');
    return;
  }

  game.player.mp -= skill.mp;
  skills.cooldowns[skillId] = skill.cooldown;

  if (skill.heal) {
    game.player.hp = Math.min(game.player.maxHp, game.player.hp + skill.heal);
    makeText(`+${skill.heal} HP`, game.player.x, game.player.y - 90, '#ff8787');
    spawnCircleEffect(game.player.x, game.player.y - 45, '#69db7c');
    return;
  }

  if (skill.buff) {
    buffs[skill.buff] = 8;
    makeText(skill.name, game.player.x, game.player.y - 90, '#ffe066');
    spawnCircleEffect(game.player.x, game.player.y - 45, '#74c0fc');
    return;
  }

  if (skill.dash) {
    game.player.x += game.player.face * 120;
    game.player.x = clamp(game.player.x, 70, game.width - 80);
  }

  game.player.attackTime = 0.4;
  game.player.anim = 'attack';
  game.player.animTime = 0;

  if (skill.projectile) {
    spawnProjectile(skill);
  } else {
    performHit(skill);
    makeSlash(game.player.x + game.player.face * 44, game.player.y - 44, game.player.face, skill.magic ? '#74c0fc' : '#ffb020');
  }
}

function performHit(skill) {
  if (game.mode !== 'hunt') return;

  const p = game.player;
  const hits = skill.hits || 1;

  for (let h = 0; h < hits; h++) {
    for (const m of game.monsters) {
      if (m.dead) continue;

      const dx = m.x - p.x;
      const dy = Math.abs(m.y - p.y);

      if (Math.sign(dx) === p.face && Math.abs(dx) < skill.range && dy < 86) {
        damageMonster(m, skill);
      }
    }
  }
}

function spawnProjectile(skill) {
  const p = game.player;

  game.projectiles.push({
    x: p.x + p.face * 28,
    y: p.y - 42,
    vx: p.face * 440,
    life: 0.75,
    face: p.face,
    skill,
    color: skill.magic ? '#74c0fc' : '#ffd43b',
    hitSet: new Set()
  });
}

function damageMonster(m, skill) {
  const p = game.player;

  const base = skill.magic ? p.magicPower : p.attackPower;
  const critChance = p.critRate + (buffs.eagleEye > 0 ? 20 : 0);
  const crit = Math.random() * 100 < critChance;
  const raw = base * (skill.power || 1);
  const damage = Math.max(1, Math.floor(raw - m.type.def + Math.random() * 8)) * (crit ? 2 : 1);

  m.hp -= damage;
  m.hit = 0.16;
  m.x += p.face * 14;

  if (skill.poison) m.poison = 5;

  makeText(crit ? `${damage}!` : `-${damage}`, m.x, m.y - 78, crit ? '#ffe066' : '#ff6b6b');

  if (m.hp <= 0) {
    killMonster(m);
  }
}

function killMonster(m) {
  const type = m.type;

  m.dead = true;
  m.respawnLeft = type.respawn;

  const levelGap = Math.max(0, type.level - game.player.level);
const bonusRate = 1 + Math.min(1.5, levelGap * 0.08);
const finalExp = Math.floor(type.exp * bonusRate);

addExp(finalExp);
   
  wallet.gold += type.gold;

  makeText(`EXP +${finalExp}`, m.x, m.y - 104, '#c0eb75');
  makeText(`+${type.gold}G`, m.x, m.y - 124, '#ffd43b');

  game.drops.push({
    kind: 'gold',
    x: m.x + rand(-16, 16),
    y: m.y - 8,
    amount: Math.max(1, Math.floor(type.gold * 0.3)),
    vy: -120,
    picked: false
  });

  if (Math.random() < type.dropRate) {
    game.drops.push({
      kind: 'item',
      itemId: type.drop,
      count: 1,
      x: m.x + rand(-18, 18),
      y: m.y - 8,
      vy: -140,
      picked: false
    });
  }

  updateQuestKill(type.family);

  setTimeout(() => {
    m.dead = false;
    m.hp = m.maxHp;
    m.x = m.baseX + rand(-40, 40);
    m.y = m.spawnY;
    m.hit = 0;
    m.poison = 0;
  }, type.respawn);
}

function updateQuestKill(family) {
  for (const q of quests.active) {
    for (const goal of q.goals) {
      if (goal.type === 'kill' && goal.monsterFamily === family) {
        goal.count = Math.min(goal.need, goal.count + 1);
      }
    }
  }
}

function addExp(amount) {
  const p = game.player;
  refreshUnlockedSkills(); 
  p.exp += amount;

  while (p.exp >= p.nextExp) {
    p.exp -= p.nextExp;
    p.level += 1;
    p.nextExp = Math.floor(p.nextExp * 1.35 + 30);
    stats.ap += 5;
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    makeText('LEVEL UP!', p.x, p.y - 125, '#ffe066');
  }
}

/* =========================================================
   Inventory / Shop / Taxi / Stats
========================================================= */

function addItem(id, count = 1) {
  const stack = inventory.items.find(i => i.id === id);

  if (stack) {
    stack.count += count;
  } else {
    inventory.items.push(makeItemStack(id, count));
  }
}

function removeItem(id, count = 1) {
  const stack = inventory.items.find(i => i.id === id);
  if (!stack || stack.count < count) return false;

  stack.count -= count;

  if (stack.count <= 0) {
    inventory.items = inventory.items.filter(i => i !== stack);
  }

  return true;
}

function getItemCount(id) {
  return inventory.items
    .filter(i => i.id === id)
    .reduce((sum, i) => sum + i.count, 0);
}

function usePotionSlot(slotIndex) {
  const itemId = inventory.quickSlots[slotIndex];
  if (!itemId) return;

  useItem(itemId);
}

function useItem(itemId) {
  const item = ITEMS[itemId];
  if (!item) return;

  if (item.type === 'consumable') {
    if (itemId === 'hp_potion') {
      if (!removeItem(itemId, 1)) return;
      game.player.hp = Math.min(game.player.maxHp, game.player.hp + 50);
      makeText('+50 HP', game.player.x, game.player.y - 88, '#ff8787');
    }

    if (itemId === 'mp_potion') {
      if (!removeItem(itemId, 1)) return;
      game.player.mp = Math.min(game.player.maxMp, game.player.mp + 30);
      makeText('+30 MP', game.player.x, game.player.y - 88, '#74c0fc');
    }

    return;
  }

  if (item.type === 'weapon' || item.type === 'armor' || item.type === 'accessory') {
    equipItem(itemId);
  }
}

function equipItem(itemId) {
  const item = ITEMS[itemId];
  if (!item) return;

  if (!getItemCount(itemId)) return;

  if (equipment[item.type]) {
    addItem(equipment[item.type], 1);
  }

  removeItem(itemId, 1);
  equipment[item.type] = itemId;
  recalcStats();
  refreshUnlockedSkills();
  makeText(`${item.name} 장착`, game.player.x, game.player.y - 90, '#ffe066');
}

function sellEtcItems() {
  let gained = 0;

  for (const stack of [...inventory.items]) {
    const item = ITEMS[stack.id];
    if (!item || item.type !== 'etc') continue;

    gained += item.sell * stack.count;
    inventory.items = inventory.items.filter(i => i !== stack);
  }

  wallet.gold += gained;
  makeText(`판매 +${gained}G`, game.player.x, game.player.y - 90, '#ffd43b');
}

function buyItem(id) {
  const item = ITEMS[id];
  if (!item) return;

  if (wallet.gold < item.price) {
    makeText('골드가 부족합니다.', game.player.x, game.player.y - 90, '#ff8787');
    return;
  }

  wallet.gold -= item.price;
  addItem(id, 1);
  makeText(`${item.name} 구매`, game.player.x, game.player.y - 90, '#c0eb75');
}

function addStat(stat) {
  if (stats.ap <= 0) return;
  if (!['str', 'dex', 'int', 'luk'].includes(stat)) return;

  stats[stat] += 1;
  stats.ap -= 1;
  recalcStats();
}

function recalcStats() {
  const p = game.player;
  const eq = getEquipmentBonus();

  p.maxHp = 120 + stats.str * 8 + eq.hp;
  p.maxMp = 45 + stats.int * 7 + eq.mp;

  p.attackPower = 10 + stats.str * 2 + Math.floor(stats.dex * 0.7) + eq.atk;
  p.magicPower = 8 + stats.int * 3 + eq.matk;
  p.defense = 2 + Math.floor(stats.str * 0.4) + eq.def;
  p.critRate = Math.min(70, 5 + stats.luk * 0.8 + eq.crit);
  p.evasion = Math.min(55, 3 + stats.dex * 0.5 + stats.luk * 0.35);
  p.speed = 235 + eq.speed;

  p.hp = Math.min(p.hp, p.maxHp);
  p.mp = Math.min(p.mp, p.maxMp);
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

  for (const slot of ['weapon', 'armor', 'accessory']) {
    const id = equipment[slot];
    if (!id) continue;

    const item = ITEMS[id];
    if (!item) continue;

    for (const key of Object.keys(bonus)) {
      bonus[key] += item[key] || 0;
    }
  }

  return bonus;
}

/* =========================================================
   Click UI Handlers
========================================================= */

function handleStatClick(x, y) {
  const rows = [
    { key: 'str', x: 540 + 234, y: 105 + 96 },
    { key: 'dex', x: 540 + 234, y: 105 + 146 },
    { key: 'int', x: 540 + 234, y: 105 + 196 },
    { key: 'luk', x: 540 + 234, y: 105 + 246 }
  ];

  for (const row of rows) {
    if (hit(x, y, row.x, row.y, 42, 34)) {
      addStat(row.key);
      return;
    }
  }
}

function handleInventoryClick(x, y) {
  const gridX = 50 + 395 + 18;
  const gridY = 96 + 62 + 88;
  const cell = 56;

  for (let i = 0; i < 36; i++) {
    const cx = gridX + (i % 6) * cell;
    const cy = gridY + Math.floor(i / 6) * cell;

    if (hit(x, y, cx, cy, 48, 48)) {
      const stack = inventory.items[i];
      if (stack) useItem(stack.id);
      return;
    }
  }
}

function handleSkillClick(x, y) {
  const panelX = 70;
  const panelY = 105;

  const list = getVisibleSkills();

  for (let i = 0; i < list.length; i++) {
    const rowY = panelY + 88 + i * 54;

    if (hit(x, y, panelX + 24, rowY, 430, 44)) {
      const id = list[i].id;

      if (!skills.hotkeys.k) skills.hotkeys.k = id;
      else if (!skills.hotkeys.l) skills.hotkeys.l = id;
      else skills.hotkeys.semicolon = id;

      makeText(`${list[i].name} 단축키 등록`, game.player.x, game.player.y - 90, '#ffe066');
      return;
    }
  }

  if (hit(x, y, panelX + 510, panelY + 100, 120, 38)) skills.hotkeys.k = null;
  if (hit(x, y, panelX + 510, panelY + 150, 120, 38)) skills.hotkeys.l = null;
  if (hit(x, y, panelX + 510, panelY + 200, 120, 38)) skills.hotkeys.semicolon = null;
}

function handleQuestClick(x, y) {
  // 지금은 보기 전용.
}

function handleTaxiClick(x, y) {
  if (hit(x, y, 1000, 610, 120, 40)) {
    game.taxiOpen = false;
    return;
  }

  for (let i = 0; i < TOWNS.length; i++) {
    const tx = 145 + (i % 2) * 360;
    const ty = 190 + Math.floor(i / 2) * 82;

    if (hit(x, y, tx, ty, 320, 62)) {
      const town = TOWNS[i];

      if (town.id === game.townId) {
        makeText('이미 현재 도시에 있습니다.', game.player.x, game.player.y - 90, '#cbd5e1');
        game.taxiOpen = false;
        return;
      }

      if (wallet.gold < town.taxiCost) {
        makeText(`택시비 ${town.taxiCost}G가 필요합니다.`, game.player.x, game.player.y - 90, '#ff8787');
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

      makeText(`${town.name} 도착!`, game.player.x, game.player.y - 95, '#ffe066');
      return;
    }
  }
}   

function handleShopClick(x, y) {
  if (hit(x, y, 1010, 610, 120, 40)) {
    game.shopOpen = false;
    return;
  }

  if (game.shopOpen === 'merchant' && hit(x, y, 760, 610, 190, 40)) {
    sellEtcItems();
    return;
  }

  for (let i = 0; i < SHOP_ITEMS.length; i++) {
    const sx = 110 + (i % 2) * 380;
    const sy = 130 + Math.floor(i / 2) * 58;

    if (hit(x, y, sx, sy, 330, 46)) {
      buyItem(SHOP_ITEMS[i]);
      return;
    }
  }
}

/* =========================================================
   Update
========================================================= */

function update(dt) {
  if (!game.ready) return;

  updateCooldowns(dt);
  update(dt)
  updatePlayer(dt);
  updateMonsters(dt);
  updateProjectiles(dt);
  updateDrops(dt);
  updateParticles(dt);
  updateTexts(dt);
  updateCamera(dt);
}

function updateCooldowns(dt) {
  for (const key of Object.keys(skills.cooldowns)) {
    skills.cooldowns[key] = Math.max(0, skills.cooldowns[key] - dt);
  }

   function updateRegen(dt) {
  const p = game.player;

  if (p.hp > 0) {
    const hpRegen = 1.6 + p.level * 0.08 + stats.str * 0.015;
    const mpRegen = 1.2 + p.level * 0.06 + stats.int * 0.025;

    p.hp = Math.min(p.maxHp, p.hp + hpRegen * dt);
    p.mp = Math.min(p.maxMp, p.mp + mpRegen * dt);
  }
}

  for (const key of Object.keys(buffs)) {
    buffs[key] = Math.max(0, buffs[key] - dt);
  }
}

function updatePlayer(dt) {
  const p = game.player;

  if (p.hp <= 0) {
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    makeText('마을에서 부활했습니다.', p.x, p.y - 100, '#ff8787');
    loadTown(game.townId);
    p.x = 260;
    p.y = game.ground;
    return;
  }

  const left = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  const jump = keys.has(' ') || keys.has('arrowup');

  if (!game.dialog && !game.shopOpen && !game.taxiOpen) {
    if (left) {
      p.vx = -p.speed;
      p.face = -1;
    } else if (right) {
      p.vx = p.speed;
      p.face = 1;
    } else {
      p.vx *= Math.pow(0.001, dt);
      if (Math.abs(p.vx) < 1) p.vx = 0;
    }

    if (jump && p.grounded) {
      p.vy = -545;
      p.grounded = false;
    }
  } else {
    p.vx *= 0.8;
  }

  p.vy += 1500 * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  p.grounded = false;

  if (p.y >= game.ground) {
    p.y = game.ground;
    p.vy = 0;
    p.grounded = true;
  }

  for (const platform of game.platforms) {
    const falling = p.vy >= 0;
    const insideX = p.x > platform.x - 20 && p.x < platform.x + platform.w + 20;
    const nearTop = p.y >= platform.y - 12 && p.y <= platform.y + 20;

    if (falling && insideX && nearTop) {
      p.y = platform.y;
      p.vy = 0;
      p.grounded = true;
    }
  }

  p.x = clamp(p.x, 70, game.width - 80);

  p.animTime += dt;
  p.attackTime = Math.max(0, p.attackTime - dt);
  p.hurtTime = Math.max(0, p.hurtTime - dt);
  p.invincible = Math.max(0, p.invincible - dt);

  if (p.attackTime > 0) {
    p.anim = 'attack';
  } else if (!p.grounded) {
    p.anim = 'jump';
  } else if (Math.abs(p.vx) > 10) {
    p.anim = 'walk';
  } else {
    p.anim = 'idle';
  }
}

function updateMonsters(dt) {
  if (game.mode !== 'hunt') return;

  for (const m of game.monsters) {
    if (m.dead) continue;

    m.time += dt;
    m.hit = Math.max(0, m.hit - dt);
    m.attackCooldown = Math.max(0, m.attackCooldown - dt);

    if (m.poison > 0) {
      m.poison -= dt;

      if (Math.random() < dt * 2.5) {
        m.hp -= 2;
        makeText('-2', m.x, m.y - 80, '#b197fc');

        if (m.hp <= 0) {
          killMonster(m);
          continue;
        }
      }
    }

    const dx = game.player.x - m.x;
    const dist = Math.abs(dx);

    if (dist < 360) {
      m.face = dx > 0 ? 1 : -1;
      m.x += m.face * m.type.speed * dt;
    } else {
      m.x += Math.sin(m.time * 1.5) * 12 * dt;
    }

    m.x = clamp(m.x, m.baseX - 180, m.baseX + 180);

    const touchX = Math.abs(game.player.x - m.x) < (m.type.shape === 'slime' ? 34 : 52);
    const touchY = Math.abs(game.player.y - m.y) < (m.type.shape === 'slime' ? 45 : 78);

    if (touchX && touchY && game.player.invincible <= 0) {
      const block = buffs.guard > 0 ? 0.55 : buffs.manaShield > 0 ? 0.45 : 1;
      const raw = Math.max(1, Math.floor((m.type.atk - game.player.defense * 0.45) * block));

      game.player.hp = Math.max(0, game.player.hp - raw);
      game.player.invincible = 0.85;
      game.player.hurtTime = 0.22;
      game.player.vx = -m.face * 120;
      makeText(`-${raw}`, game.player.x, game.player.y - 90, '#ff8787');
    }
  }
}

function updateProjectiles(dt) {
  for (const pr of game.projectiles) {
    pr.life -= dt;
    pr.x += pr.vx * dt;

    for (const m of game.monsters) {
      if (m.dead) continue;
      if (pr.hitSet.has(m.uid)) continue;

      const dx = Math.abs(pr.x - m.x);
      const dy = Math.abs(pr.y - (m.y - 45));

      if (dx < 38 && dy < 55) {
        pr.hitSet.add(m.uid);
        damageMonster(m, pr.skill);
        spawnCircleEffect(pr.x, pr.y, pr.skill.magic ? '#74c0fc' : '#ffe066');

        if (!pr.skill.splash) {
          pr.life = 0;
          break;
        }
      }
    }
  }

  game.projectiles = game.projectiles.filter(pr => pr.life > 0);
}

function updateDrops(dt) {
  for (const d of game.drops) {
    d.vy += 600 * dt;
    d.y += d.vy * dt;

    if (d.y > game.ground - 10) {
      d.y = game.ground - 10;
      d.vy = 0;
    }
  }
}

function updateParticles(dt) {
  for (const fx of game.particles) {
    fx.life -= dt;
    fx.x += fx.vx * dt;
    fx.y += fx.vy * dt;
    fx.vy += 500 * dt;
  }

  game.particles = game.particles.filter(fx => fx.life > 0);
}

function updateTexts(dt) {
  for (const t of game.texts) {
    t.life -= dt;
    t.y += t.vy * dt;
  }

  game.texts = game.texts.filter(t => t.life > 0);
}

function updateCamera(dt) {
  const target = clamp(game.player.x - W * 0.42, 0, Math.max(0, game.width - W));

  game.cameraX += (target - game.cameraX) * Math.min(1, dt * 8);
}

/* =========================================================
   Draw Main
========================================================= */

function draw() {
  ctx.clearRect(0, 0, W, H);

  if (!game.ready) {
    drawMenuBackground();
    drawPreviewCharacter();
    return;
  }

  ctx.save();
  ctx.translate(-Math.floor(game.cameraX), 0);

  drawWorld();
  drawPortals();
  drawNpcs();
  drawDrops();
  drawMonsters();
  drawProjectiles();
  drawPlayer(game.player, game.player.x, game.player.y, 0.78);
  drawParticles();
  drawTexts();

  ctx.restore();

  drawHud();

  if (inventory.open) drawInventoryPanel();
  if (stats.open) drawStatPanel();
  if (skills.open) drawSkillPanel();
  if (quests.open) drawQuestPanel();

  if (game.dialog) drawDialog();
  if (game.taxiOpen) drawTaxiPanel();
  if (game.shopOpen) drawShopPanel();
}

/* =========================================================
   World Drawing
========================================================= */

function drawMenuBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#65caff');
  g.addColorStop(1, '#c9f3ff');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawWorld() {
  const town = getTown(game.townId);

  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, town.bg1);
  sky.addColorStop(0.55, town.bg2);
  sky.addColorStop(1, '#eaffcf');

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, game.width, H);

  drawParallaxBackground(town);

  if (game.mode === 'town') {
    drawTownObjects(town);
  } else {
    drawHuntObjects(town);
  }

  for (const platform of game.platforms) {
    drawPlatform(platform.x, platform.y, platform.w, platform.h, town.theme);
  }

  ctx.fillStyle = getGroundColor(town.theme);
  ctx.fillRect(0, game.ground, game.width, 28);

  ctx.fillStyle = getDirtColor(town.theme);
  ctx.fillRect(0, game.ground + 28, game.width, H - game.ground);

  for (let x = 0; x < game.width; x += 42) {
    ctx.fillStyle = x % 84 === 0 ? '#6e4d34' : '#987048';
    if (town.theme === 'ice') ctx.fillStyle = x % 84 === 0 ? '#8ea6b8' : '#b6d3e5';
    if (town.theme === 'desert') ctx.fillStyle = x % 84 === 0 ? '#c38a45' : '#d9a75e';
    if (town.theme === 'ruin') ctx.fillStyle = x % 84 === 0 ? '#535765' : '#6a6f7e';

    ctx.fillRect(x, game.ground + 38, 38, H - game.ground - 38);
  }

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(game.mode === 'town' ? `${town.title} ${town.name}` : getHunt(game.huntId).title, 34, 46);
}

function drawParallaxBackground(town) {
  for (let i = 0; i < 18; i++) {
    drawCloud(
      110 + i * 190 + Math.sin(performance.now() / 1000 + i) * 14,
      70 + (i % 4) * 38,
      1 + (i % 3) * 0.16
    );
  }

  ctx.fillStyle = town.theme === 'ruin' ? '#6f86a6' : town.theme === 'desert' ? '#dbb276' : '#8fbddd';
  ctx.beginPath();
  ctx.moveTo(0, 370);

  for (let x = -100; x < game.width + 300; x += 220) {
    ctx.lineTo(x + 110, 250 + Math.sin(x * 0.03) * 20);
    ctx.lineTo(x + 230, 370);
  }

  ctx.lineTo(game.width, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = town.theme === 'ice' ? '#b9ecff' : town.theme === 'desert' ? '#e1be72' : town.theme === 'ruin' ? '#77808d' : '#72b36f';

  for (let x = -120; x < game.width + 180; x += 165) {
    ctx.beginPath();
    ctx.ellipse(x, game.ground - 72, 150, 68, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTownObjects(town) {
  if (town.theme === 'magic') {
    for (let i = 0; i < 7; i++) {
      drawMagicTower(180 + i * 560, game.ground, 0.9 + (i % 2) * 0.15);
    }

    for (let x = 260; x < game.width; x += 520) {
      drawCrystal(x, game.ground - 20);
    }

    return;
  }

  if (town.theme === 'fortress') {
    for (let x = 120; x < game.width; x += 520) {
      drawCastleWall(x, game.ground);
    }

    return;
  }

  if (town.theme === 'port') {
    for (let x = 140; x < game.width; x += 620) {
      drawPortHouse(x, game.ground);
    }

    return;
  }

  if (town.theme === 'mine') {
    for (let x = 160; x < game.width; x += 520) {
      drawMineEntrance(x, game.ground);
    }

    return;
  }

  if (town.theme === 'ice') {
    for (let x = 150; x < game.width; x += 520) {
      drawIceHouse(x, game.ground);
    }

    return;
  }

  if (town.theme === 'desert') {
    for (let x = 130; x < game.width; x += 520) {
      drawDesertHouse(x, game.ground);
    }

    return;
  }

  if (town.theme === 'ruin') {
    for (let x = 180; x < game.width; x += 430) {
      drawRuin(x, game.ground);
    }

    for (let x = 500; x < game.width; x += 700) {
      drawBrokenArch(x, game.ground);
    }

    return;
  }

  for (let i = 0; i < 7; i++) {
    drawHouse(160 + i * 520, game.ground - 78 - (i % 2) * 22, 1.0 + (i % 3) * 0.05, town.theme);
  }

  for (let i = 0; i < 9; i++) {
    drawTree(80 + i * 460, game.ground, 1.05 + (i % 3) * 0.1, town.theme);
  }
}

function drawMagicTower(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

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
  circleCtx(ctx, 0, -210, 10);
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

  ctx.fillStyle = '#ffffffaa';
  ctx.fillRect(-40, -65, 32, 26);
  ctx.fillRect(15, -65, 32, 26);

  ctx.strokeStyle = '#bfdbfe';
  ctx.lineWidth = 5;
  ctx.strokeRect(-70, -90, 140, 90);

  ctx.restore();
}

function drawDesertHouse(x, y) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = '#c08457';
  roundRectCtx(ctx, -75, -100, 150, 100, 8);

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

function drawPortals() {
  for (const p of game.portals) {
    const t = performance.now() / 350;
    const cx = p.x;
    const cy = p.y - 55;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.shadowColor = '#74c0fc';
    ctx.shadowBlur = 18;

    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28 + Math.sin(t) * 2, 50, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#b197fc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 20 + Math.cos(t) * 2, 58, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = 'rgba(75, 230, 255, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 46, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('E', 0, -74);
    ctx.fillText(p.label, 0, 80);

    ctx.restore();
  }
}

function drawNpcs() {
  for (const npc of game.npcs) {
    const fake = {
      ...game.player,
      character: {
        name: npc.name,
        job: 'beginner',
        skin: '#ffd6a6',
        hair: npc.type === 'taxi' ? '#343a40' : npc.type === 'weapon' ? '#8b5e34' : npc.type === 'job' ? '#d9dde8' : '#6b4b32',
        hairStyle: npc.type === 'job' ? 'spiky' : 'basic',
        faceStyle: 'normal'
      },
      anim: 'idle',
      animTime: performance.now() / 1000,
      face: 1
    };

    drawPlayer(fake, npc.x, npc.y, 0.72);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, npc.x, npc.y - 64);

    if (Math.abs(game.player.x - npc.x) < 90) {
      ctx.fillStyle = '#ffe066';
      ctx.fillText('E 대화', npc.x, npc.y - 84);
    }
  }
}

/* =========================================================
   Monster / Drops / Projectiles Drawing
========================================================= */

function drawMonsters() {
  for (const m of game.monsters) {
    if (m.dead) continue;

    ctx.save();
    ctx.translate(m.x, m.y + Math.sin(m.time * 6) * 2);
    ctx.scale(m.face, 1);

    if (m.hit > 0) ctx.globalAlpha = 0.55;

    drawMonsterShape(m);

    ctx.restore();

    const big = m.type.shape === 'golem' || m.type.shape === 'ogre';
    const barW = big ? 68 : 46;
    const barY = big ? m.y - 92 : m.y - 50;

    ctx.fillStyle = '#0008';
    ctx.fillRect(m.x - barW / 2, barY, barW, 6);

    ctx.fillStyle = '#ff4d4f';
    ctx.fillRect(m.x - barW / 2, barY, barW * clamp(m.hp / m.maxHp, 0, 1), 6);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Lv.${m.type.level}`, m.x, barY - 4);
  }
}

function drawMonsterShape(m) {
  const type = m.type;
  const color = type.color;
  const bounce = Math.sin(m.time * 7) * 2;

  if (type.shape === 'slime') {
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.ellipse(0, -16 + bounce, 24, 19, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -17 + bounce, 21, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff55';
    ctx.beginPath();
    ctx.ellipse(-7, -24 + bounce, 7, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10251b';
    ctx.fillRect(-8, -20 + bounce, 4, 4);
    ctx.fillRect(5, -20 + bounce, 4, 4);
    return;
  }

  if (type.shape === 'mushroom') {
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.ellipse(0, -38, 27, 19, 0, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -37, 24, 17, 0, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#fff0c9';
    ctx.fillRect(-17, -36, 34, 21);

    ctx.fillStyle = '#7a4d27';
    ctx.fillRect(-7, -16, 14, 17);

    ctx.fillStyle = '#2c1a10';
    ctx.fillRect(-10, -28, 4, 4);
    ctx.fillRect(6, -28, 4, 4);
    return;
  }

  if (type.shape === 'spirit') {
    ctx.shadowColor = color;
    ctx.shadowBlur = 16;

    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.ellipse(0, -36, 24, 32, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -38, 20, 29, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.fillRect(-7, -43, 4, 6);
    ctx.fillRect(4, -43, 4, 6);
    ctx.shadowBlur = 0;
    return;
  }

  if (type.shape === 'boar') {
    ctx.fillStyle = '#111827';
    roundRectCtx(ctx, -34, -46, 68, 32, 14);

    ctx.fillStyle = color;
    roundRectCtx(ctx, -31, -44, 62, 28, 12);

    ctx.fillStyle = '#f8f0c8';
    ctx.fillRect(20, -33, 10, 4);

    ctx.fillStyle = '#111827';
    ctx.fillRect(10, -36, 4, 4);

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
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.ellipse(0, -28, 28, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.ellipse(0, -29, 24, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 3;

    for (let i = -18; i <= 18; i += 12) {
      ctx.beginPath();
      ctx.moveTo(i, -20);
      ctx.lineTo(i - 8, -4);
      ctx.moveTo(i, -20);
      ctx.lineTo(i + 8, -4);
      ctx.stroke();
    }

    ctx.fillStyle = '#111827';
    ctx.fillRect(-8, -32, 4, 4);
    ctx.fillRect(5, -32, 4, 4);
    return;
  }

  if (type.shape === 'lizard') {
    ctx.fillStyle = '#111827';
    roundRectCtx(ctx, -36, -44, 68, 28, 12);

    ctx.fillStyle = color;
    roundRectCtx(ctx, -33, -42, 62, 24, 10);

    ctx.beginPath();
    ctx.moveTo(-34, -31);
    ctx.lineTo(-58, -22);
    ctx.lineTo(-34, -20);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#111827';
    ctx.fillRect(13, -34, 4, 4);
    return;
  }

  const walk = Math.sin(m.time * 6);

  ctx.fillStyle = '#111827';
  roundRectCtx(ctx, -34, -92, 68, 74, 16);

  ctx.fillStyle = color;
  roundRectCtx(ctx, -30, -88, 60, 68, 15);

  ctx.fillStyle = lighten(color, 40);
  roundRectCtx(ctx, -25, -113, 50, 34, 10);

  ctx.fillStyle = '#26321e';
  ctx.fillRect(-12, -101, 5, 6);
  ctx.fillRect(7, -101, 5, 6);

  ctx.fillStyle = '#f8f0c8';
  ctx.fillRect(-8, -90, 5, 4);
  ctx.fillRect(3, -90, 5, 4);

  ctx.fillStyle = darken(color, 25);
  roundRectCtx(ctx, -48, -60 + walk * 2, 18, 48, 9);
  roundRectCtx(ctx, 30, -60 - walk * 2, 18, 48, 9);

  ctx.strokeStyle = '#26321e';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(-18, -20);
  ctx.lineTo(-22 + walk * 4, 0);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(18, -20);
  ctx.lineTo(22 - walk * 4, 0);
  ctx.stroke();
}

function drawDrops() {
  for (const d of game.drops) {
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
      drawItemIcon(ITEMS[d.itemId]?.icon || 'drop', 0, 0, 18);
    }

    ctx.restore();
  }
}

function drawProjectiles() {
  for (const pr of game.projectiles) {
    ctx.save();
    ctx.translate(pr.x, pr.y);
    ctx.scale(pr.face, 1);

    ctx.shadowColor = pr.color;
    ctx.shadowBlur = 14;

    ctx.fillStyle = pr.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, 15, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff8';
    ctx.beginPath();
    ctx.ellipse(5, -1, 5, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

/* =========================================================
   Player Drawing
========================================================= */

function drawPlayer(player, x, y, scale) {
  const frame = getBodyFrame(player.anim, player.animTime);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(player.face * scale, scale);

  if (player.anim === 'jump') {
    ctx.rotate(player.vy < 0 ? -0.08 : 0.08);
  }

  if (player.hurtTime > 0) {
    ctx.globalAlpha = 0.55;
  }

  ctx.fillStyle = 'rgba(0,0,0,0.24)';
  ctx.beginPath();
  ctx.ellipse(0, 3, 18, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();

  if (bodySheetReady && processedBodySheet && frameIsInside(frame)) {
    drawSheetBody(ctx, player, frame);
  } else {
    drawFallbackBody(ctx, player);
  }

  if (player.anim === 'attack') {
    const t = Math.sin(Math.min(1, player.animTime * 12) * Math.PI);
    drawAttackArc(ctx, t);
  }

  ctx.restore();
}

function getBodyFrame(anim, time) {
  const list = BODY_FRAMES[anim] || BODY_FRAMES.idle;
  const speed = anim === 'attack' ? 14 : anim === 'walk' ? 9 : anim === 'jump' ? 4 : 3;
  const index = Math.floor(time * speed) % list.length;
  return list[index];
}

function frameIsInside(frame) {
  if (!bodySheetReady || !processedBodySheet) return false;

  return (
    frame.x >= 0 &&
    frame.y >= 0 &&
    frame.x + frame.w <= processedBodySheet.width &&
    frame.y + frame.h <= processedBodySheet.height
  );
}

function drawSheetBody(c, player, frame) {
  const ch = player.character || game.player.character;

  const temp = document.createElement('canvas');
  temp.width = frame.w;
  temp.height = frame.h;

  const tc = temp.getContext('2d');
  tc.imageSmoothingEnabled = false;
  tc.drawImage(processedBodySheet, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);

  recolorSkin(tc, frame.w, frame.h, ch.skin || '#ffd6a6');

  const dw = 38;
  const dh = 54;

  c.drawImage(temp, -dw / 2, -dh - 4, dw, dh);

  drawCustomHair(c, ch, -78);
  drawCustomFace(c, ch, -78);
}

function drawFallbackBody(c, player) {
  const ch = player.character || game.player.character;
  const eq = equipment || {};

  const walk = Math.sin(player.animTime * 13);
  const run = player.anim === 'walk';
  const leg = run ? walk * 7 : 0;
  const arm = run ? -walk * 6 : 0;

  const armorId = eq.armor;
  const weaponId = eq.weapon;

  const hasIronArmor = armorId === 'iron_armor';
  const hasMagicRobe = armorId === 'magic_robe';
  const hasClothArmor = armorId === 'cloth_armor';

  const bodyColor = hasIronArmor ? '#8fa3b8' : hasMagicRobe ? '#8b5cf6' : hasClothArmor ? '#6aa2ff' : '#4f93f5';
  const bodyDark = hasIronArmor ? '#52677d' : hasMagicRobe ? '#5b36b8' : '#2f6fbd';

  c.lineCap = 'round';

  c.strokeStyle = '#171717';
  c.lineWidth = 4.2;

  c.beginPath();
  c.moveTo(-5, -29);
  c.lineTo(-9 + leg, -10);
  c.stroke();

  c.beginPath();
  c.moveTo(5, -29);
  c.lineTo(9 - leg, -10);
  c.stroke();

  c.strokeStyle = ch.skin || '#ffd6a6';
  c.lineWidth = 2.8;

  c.beginPath();
  c.moveTo(-5, -29);
  c.lineTo(-9 + leg, -10);
  c.stroke();

  c.beginPath();
  c.moveTo(5, -29);
  c.lineTo(9 - leg, -10);
  c.stroke();

  c.fillStyle = '#171717';
  roundRectCtx(c, -18 + leg, -12, 16, 7, 1.5);
  roundRectCtx(c, 2 - leg, -12, 16, 7, 1.5);

  c.fillStyle = '#5a3821';
  roundRectCtx(c, -16 + leg, -10.5, 12, 4.5, 1);
  roundRectCtx(c, 4 - leg, -10.5, 12, 4.5, 1);

  c.fillStyle = '#171717';
  roundRectCtx(c, -15, -62, 30, 33, 8);

  c.fillStyle = bodyColor;
  roundRectCtx(c, -12.5, -59.5, 25, 29, 7);

  if (hasIronArmor) {
    c.fillStyle = '#dbeafe';
    c.fillRect(-10, -55, 20, 4);
    c.fillStyle = '#64748b';
    c.fillRect(-10, -45, 20, 5);
    c.fillStyle = '#334155';
    c.fillRect(-4, -59, 8, 29);
  } else if (hasMagicRobe) {
    c.fillStyle = '#c4b5fd';
    c.fillRect(-10, -55, 20, 4);
    c.fillStyle = '#fde68a';
    c.fillRect(-2, -58, 4, 25);
  } else {
    c.fillStyle = '#f8f9ff';
    c.fillRect(-9, -57, 18, 5);
  }

  c.fillStyle = bodyDark;
  roundRectCtx(c, -10, -39, 20, 8, 3);

  let lx = -17 + arm;
  let ly = -45;
  let rx = 17 - arm;
  let ry = -45;

  if (player.anim === 'attack') {
    const atk = Math.sin(Math.min(1, player.animTime * 12) * Math.PI);
    rx = 20 + atk * 22;
    ry = -48;
  }

  if (player.anim === 'jump') {
    lx = -19;
    rx = 19;
    ly = -52;
    ry = -52;
  }

  c.strokeStyle = '#171717';
  c.lineWidth = 4.8;

  c.beginPath();
  c.moveTo(-12, -54);
  c.lineTo(lx, ly);
  c.stroke();

  c.beginPath();
  c.moveTo(12, -54);
  c.lineTo(rx, ry);
  c.stroke();

  c.strokeStyle = ch.skin || '#ffd6a6';
  c.lineWidth = 3;

  c.beginPath();
  c.moveTo(-12, -54);
  c.lineTo(lx, ly);
  c.stroke();

  c.beginPath();
  c.moveTo(12, -54);
  c.lineTo(rx, ry);
  c.stroke();

  c.fillStyle = '#171717';
  circleCtx(c, lx, ly, 3.8);
  circleCtx(c, rx, ry, 3.8);

  c.fillStyle = ch.skin || '#ffd6a6';
  circleCtx(c, lx, ly, 2.6);
  circleCtx(c, rx, ry, 2.6);

  drawEquippedWeapon(c, weaponId, rx, ry, player.anim === 'attack');

  c.fillStyle = '#171717';
  c.fillRect(-4, -68, 8, 8);

  c.fillStyle = ch.skin || '#ffd6a6';
  c.fillRect(-3, -67, 6, 7);

  c.fillStyle = '#171717';
  circleCtx(c, -17, -86, 4.5);
  circleCtx(c, 17, -86, 4.5);

  c.beginPath();
  c.ellipse(0, -89, 19, 21, 0, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = ch.skin || '#ffd6a6';
  circleCtx(c, -16.5, -86, 3.3);
  circleCtx(c, 16.5, -86, 3.3);

  c.beginPath();
  c.ellipse(0, -89, 16.5, 18.5, 0, 0, Math.PI * 2);
  c.fill();

  drawCustomFace(c, ch, -89);
  drawCustomHair(c, ch, -89);
}

function drawEquippedWeapon(c, weaponId, handX, handY, attacking) {
  if (!weaponId) return;

  c.save();
  c.translate(handX, handY);

  if (attacking) {
    c.rotate(-0.85);
  } else {
    c.rotate(-0.35);
  }

  if (weaponId.includes('staff')) {
    c.strokeStyle = '#111827';
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(0, 8);
    c.lineTo(0, -28);
    c.stroke();

    c.strokeStyle = '#b197fc';
    c.lineWidth = 3;
    c.beginPath();
    c.moveTo(0, 8);
    c.lineTo(0, -28);
    c.stroke();

    c.fillStyle = '#74c0fc';
    circleCtx(c, 0, -31, 5);
  } else if (weaponId.includes('bow')) {
    c.strokeStyle = '#111827';
    c.lineWidth = 5;
    c.beginPath();
    c.arc(0, -9, 17, -Math.PI / 2, Math.PI / 2);
    c.stroke();

    c.strokeStyle = '#ffd43b';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(0, -9, 17, -Math.PI / 2, Math.PI / 2);
    c.stroke();
  } else if (weaponId.includes('dagger')) {
    c.fillStyle = '#111827';
    c.fillRect(-3, -28, 6, 28);

    c.fillStyle = '#e9ecef';
    c.beginPath();
    c.moveTo(0, -40);
    c.lineTo(6, -24);
    c.lineTo(-6, -24);
    c.closePath();
    c.fill();
  } else {
    c.strokeStyle = '#111827';
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(0, 8);
    c.lineTo(0, -34);
    c.stroke();

    c.strokeStyle = '#f97316';
    c.lineWidth = 4;
    c.beginPath();
    c.moveTo(0, 8);
    c.lineTo(0, -34);
    c.stroke();

    c.fillStyle = '#f8fafc';
    c.beginPath();
    c.moveTo(0, -44);
    c.lineTo(9, -28);
    c.lineTo(0, -20);
    c.lineTo(-9, -28);
    c.closePath();
    c.fill();
  }

  c.restore();
}

function drawCustomHair(c, ch, headY) {
  const hair = ch.hair || '#2b160e';
  const style = ch.hairStyle || 'basic';

  c.save();

  c.fillStyle = '#111827';

  if (style === 'spiky') {
    c.beginPath();
    c.moveTo(-18, headY - 7);
    c.lineTo(-13, headY - 22);
    c.lineTo(-7, headY - 12);
    c.lineTo(0, headY - 25);
    c.lineTo(7, headY - 12);
    c.lineTo(14, headY - 22);
    c.lineTo(18, headY - 7);
    c.lineTo(16, headY + 2);
    c.lineTo(-16, headY + 2);
    c.closePath();
    c.fill();
  } else {
    roundRectCtx(c, -19, headY - 23, 38, 22, 12);
    c.fillRect(-16, headY - 10, 32, 8);
  }

  c.fillStyle = hair;

  if (style === 'spiky') {
    c.beginPath();
    c.moveTo(-16, headY - 7);
    c.lineTo(-12, headY - 20);
    c.lineTo(-6, headY - 10);
    c.lineTo(0, headY - 23);
    c.lineTo(6, headY - 10);
    c.lineTo(12, headY - 20);
    c.lineTo(16, headY - 7);
    c.lineTo(14, headY + 1);
    c.lineTo(-14, headY + 1);
    c.closePath();
    c.fill();
  } else {
    roundRectCtx(c, -17, headY - 21, 34, 19, 10);
    c.fillRect(-14, headY - 9, 28, 7);
  }

  if (style === 'short') {
    for (let i = -13; i <= 7; i += 6) {
      c.beginPath();
      c.moveTo(i, headY - 8);
      c.lineTo(i + 4, headY + 1);
      c.lineTo(i + 8, headY - 8);
      c.fill();
    }
  }

  if (style === 'pony') {
    c.beginPath();
    c.ellipse(19, headY - 2, 6, 11, -0.25, 0, Math.PI * 2);
    c.fill();
  }

  if (style === 'wave' || style === 'bob') {
    circleCtx(c, -14, headY + 2, 4.5);
    circleCtx(c, 14, headY + 2, 4.5);

    if (style === 'bob') {
      c.fillRect(-13, headY - 1, 26, 5);
    }
  }

  c.beginPath();
  c.moveTo(-16, headY - 9);
  c.lineTo(-10, headY - 18);
  c.lineTo(-4, headY - 8);
  c.lineTo(2, headY - 18);
  c.lineTo(8, headY - 8);
  c.lineTo(15, headY - 16);
  c.lineTo(16, headY - 1);
  c.lineTo(-16, headY - 1);
  c.closePath();
  c.fill();

  c.fillStyle = 'rgba(255,255,255,0.22)';
  c.fillRect(-8, headY - 18, 7, 2);

  c.restore();
}

function drawCustomFace(c, ch, headY) {
  const face = ch.faceStyle || 'normal';

  c.fillStyle = 'rgba(255,120,150,0.22)';
  c.fillRect(-13, headY + 1, 5, 2.5);
  c.fillRect(8, headY + 1, 5, 2.5);

  if (face === 'sleepy') {
    c.strokeStyle = '#111';
    c.lineWidth = 1.4;

    c.beginPath();
    c.moveTo(-9, headY - 6);
    c.lineTo(-4, headY - 6);
    c.moveTo(4, headY - 6);
    c.lineTo(9, headY - 6);
    c.stroke();
  } else {
    c.fillStyle = '#111';
    c.fillRect(-8, headY - 7, 3.5, 5.5);
    c.fillRect(4.5, headY - 7, 3.5, 5.5);

    c.fillStyle = '#fff';
    c.fillRect(-7.4, headY - 6.4, 1.2, 1.6);
    c.fillRect(5.1, headY - 6.4, 1.2, 1.6);
  }

  c.fillStyle = '#111';

  if (face === 'bright' || face === 'cute') {
    c.strokeStyle = '#111';
    c.lineWidth = 1.4;

    c.beginPath();
    c.arc(0, headY + 3, 3.3, 0, Math.PI);
    c.stroke();
  } else {
    c.fillRect(-3, headY + 3, 6, 1.5);
  }
}

function drawAttackArc(c, t) {
  c.strokeStyle = '#ffe066';
  c.lineWidth = 4;
  c.beginPath();
  c.arc(28, -42, 13 + t * 16, -0.7, 0.8);
  c.stroke();

  c.strokeStyle = '#ff922b';
  c.lineWidth = 2.5;
  c.beginPath();
  c.arc(30, -42, 9 + t * 14, -0.7, 0.78);
  c.stroke();
}

/* =========================================================
   Preview
========================================================= */

function drawPreviewCharacter() {
  const creatorVisible = characterScreen && !characterScreen.classList.contains('hidden');
  const menuVisible = characterMenu && !characterMenu.classList.contains('hidden');

  if (!creatorVisible && !menuVisible) return;

  const target = creatorVisible ? preview : menuPreview;
  if (!target) return;

  target.width = 300;
  target.height = 300;

  const pc = target.getContext('2d');
  pc.imageSmoothingEnabled = false;

  pc.clearRect(0, 0, 300, 300);

  pc.fillStyle = '#202938';
  pc.fillRect(0, 0, 300, 300);

  pc.fillStyle = '#25344c';
  pc.fillRect(50, 257, 200, 12);

  let character = {
    name: '초보자',
    job: 'beginner',
    skin: selected.skin,
    hair: selected.hair,
    hairStyle: selected.hairStyle,
    faceStyle: selected.faceStyle
  };

  if (menuVisible && currentUser?.save?.player?.character) {
    character = {
      ...character,
      ...currentUser.save.player.character
    };
  }

  const previewPlayer = {
    ...createDefaultPlayer(),
    character,
    anim: 'idle',
    animTime: performance.now() / 1000,
    face: 1
  };

  pc.save();
  pc.translate(150, 258);
  pc.scale(1.55, 1.55);

  drawFallbackBody(pc, previewPlayer);

  pc.restore();
}

/* =========================================================
   HUD / Panels
========================================================= */

function drawHud() {
  const p = game.player;
  const job = JOBS[p.character.job] || JOBS.beginner;

  ctx.fillStyle = 'rgba(17,24,39,0.92)';
  roundRectCtx(ctx, 12, 10, 560, 82, 12);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`LV. ${p.level}`, 28, 34);
  ctx.fillText(p.character?.name || '초보자', 92, 34);

  ctx.fillStyle = '#4f9cff';
  ctx.fillText(job.name, 92, 58);

  bar(210, 20, 150, 14, p.hp / p.maxHp, '#ff4d4f', `HP ${Math.floor(p.hp)}/${p.maxHp}`);
  bar(210, 42, 150, 14, p.mp / p.maxMp, '#4dabf7', `MP ${Math.floor(p.mp)}/${p.maxMp}`);
  bar(374, 20, 170, 14, p.exp / p.nextExp, '#ffd43b', `EXP ${p.exp}/${p.nextExp}`);

  ctx.fillStyle = 'rgba(17,24,39,0.82)';
  roundRectCtx(ctx, 12, 95, 760, 36, 10);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('A/D 이동 · Space 점프 · J 공격 · K/L/; 스킬 · E 대화/포탈 · Z 줍기 · M 인벤 · C 스탯 · U 스킬 · Q 퀘스트', 28, 118);

  drawMiniMap();
  drawQuickSlots();
  drawSkillHotbar();
  drawQuestTracker();
  drawGold();
}

function bar(x, y, w, h, ratio, color, label) {
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

function drawGold() {
  ctx.fillStyle = 'rgba(17,24,39,0.9)';
  roundRectCtx(ctx, W - 190, 96, 170, 34, 8);

  ctx.fillStyle = '#ffd43b';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Gold ${wallet.gold}`, W - 172, 119);
}

function drawMiniMap() {
  const x = W - 210;
  const y = 16;
  const w = 190;
  const h = 70;

  ctx.fillStyle = 'rgba(15,23,42,0.9)';
  roundRectCtx(ctx, x, y, w, h, 10);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(game.mode === 'town' ? getTown(game.townId).name : getHunt(game.huntId).title, x + 10, y + 18);

  const px = x + 12 + (game.player.x / game.width) * (w - 24);

  ctx.fillStyle = '#69db7c';
  ctx.fillRect(x + 12, y + 38, w - 24, 6);

  ctx.fillStyle = '#ffdd57';
  ctx.beginPath();
  ctx.arc(px, y + 41, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawQuickSlots() {
  const startX = W - 265;
  const y = H - 70;

  for (let i = 0; i < 4; i++) {
    const x = startX + i * 58;

    ctx.fillStyle = 'rgba(17,24,39,0.9)';
    roundRectCtx(ctx, x, y, 48, 48, 8);

    ctx.strokeStyle = '#ffffff88';
    ctx.strokeRect(x, y, 48, 48);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(String(i + 1), x + 6, y + 15);

    const itemId = inventory.quickSlots[i];
    const item = inventory.items.find(v => v.id === itemId);

    if (item) {
      drawItemIcon(ITEMS[itemId]?.icon || 'drop', x + 24, y + 26, 28);

      ctx.fillStyle = '#fff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(item.count), x + 42, y + 43);
      ctx.textAlign = 'left';
    }
  }
}

function drawSkillHotbar() {
  const startX = 380;
  const y = H - 70;

  const entries = [
    ['J', '기본공격', null],
    ['K', skills.hotkeys.k, skills.hotkeys.k],
    ['L', skills.hotkeys.l, skills.hotkeys.l],
    [';', skills.hotkeys.semicolon, skills.hotkeys.semicolon]
  ];

  for (let i = 0; i < entries.length; i++) {
    const x = startX + i * 76;
    const [key, label, skillId] = entries[i];

    ctx.fillStyle = 'rgba(17,24,39,0.9)';
    roundRectCtx(ctx, x, y, 66, 48, 8);

    ctx.strokeStyle = '#ffffff88';
    ctx.strokeRect(x, y, 66, 48);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(key, x + 6, y + 15);

    if (skillId && SKILLS[skillId]) {
      const skill = SKILLS[skillId];
      drawSkillIcon(skill, x + 33, y + 28, 26);

      const cd = skills.cooldowns[skillId] || 0;

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
      ctx.fillText(label || '-', x + 33, y + 34);
    }
  }
}

function drawQuestTracker() {
  const x = W - 305;
  const y = 140;
  const w = 285;

  if (!quests.active.length) return;

  ctx.fillStyle = 'rgba(15,23,42,0.82)';
  roundRectCtx(ctx, x, y, w, 32 + quests.active.length * 78, 10);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('진행 중 퀘스트', x + 14, y + 22);

  let cy = y + 50;

  for (const q of quests.active.slice(0, 4)) {
    syncItemQuestCounts(q);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(q.title, x + 14, cy);

    cy += 18;

    for (const goal of q.goals) {
      ctx.fillStyle = goal.count >= goal.need ? '#c0eb75' : '#cbd5e1';
      ctx.font = '12px sans-serif';

      const label = goal.type === 'kill'
        ? `${goal.monsterFamily} 처치`
        : `${ITEMS[goal.itemId]?.name || goal.itemId}`;

      ctx.fillText(`${label}: ${goal.count}/${goal.need}`, x + 24, cy);
      cy += 16;
    }

    cy += 10;
  }
}

function drawInventoryPanel() {
  const x = 50;
  const y = 96;
  const w = 850;
  const h = 560;

  ctx.fillStyle = 'rgba(235,245,255,0.96)';
  roundRectCtx(ctx, x, y, w, h, 10);

  ctx.strokeStyle = '#5b87b7';
  ctx.lineWidth = 3;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#2f5f91';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('EQUIPMENT / ITEM INVENTORY', x + 22, y + 36);

  drawEquipmentInventoryBox(x + 20, y + 62);
  drawItemInventoryBox(x + 395, y + 62);
}

function drawEquipmentInventoryBox(x, y) {
  const w = 340;
  const h = 455;

  ctx.fillStyle = '#f8fbff';
  ctx.fillRect(x, y, w, h);

  ctx.strokeStyle = '#8eb2d5';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#2f5f91';
  ctx.font = 'bold 17px sans-serif';
  ctx.fillText('EQUIPMENT INVENTORY', x + 14, y + 28);

  const slots = [
    { name: '무기', key: 'weapon', x: 115, y: 75 },
    { name: '방어구', key: 'armor', x: 115, y: 160 },
    { name: '장신구', key: 'accessory', x: 115, y: 245 }
  ];

  ctx.strokeStyle = '#bfd7ea';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.ellipse(x + 170, y + 235, 78, 155, 0, 0, Math.PI * 2);
  ctx.stroke();

  for (const slot of slots) {
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

    const itemId = equipment[slot.key];

    if (itemId && ITEMS[itemId]) {
      drawItemIcon(ITEMS[itemId].icon, sx + 36, sy + 36, 42);

      ctx.fillStyle = '#233';
      ctx.font = '11px sans-serif';
      ctx.fillText(ITEMS[itemId].name, sx + 36, sy + 88);
    }
  }

  const previewPlayer = {
    ...game.player,
    anim: 'idle',
    animTime: performance.now() / 1000,
    face: 1
  };

  ctx.save();
  ctx.translate(x + 170, y + 380);
  ctx.scale(1.15, 1.15);
  drawFallbackBody(ctx, previewPlayer);
  ctx.restore();
}

function drawItemInventoryBox(x, y) {
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
  for (let i = 0; i < tabs.length; i++) {
    const tx = x + 14 + i * 74;

    ctx.fillStyle = i === 0 ? '#ff7aa2' : '#d9e6f4';
    ctx.fillRect(tx, y + 42, 68, 32);

    ctx.strokeStyle = '#8eb2d5';
    ctx.strokeRect(tx, y + 42, 68, 32);

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(tabs[i], tx + 34, y + 64);
  }

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

    const stack = inventory.items[i];

    if (stack) {
      const item = ITEMS[stack.id];

      drawItemIcon(item?.icon || 'drop', cx + 24, cy + 24, 34);

      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(String(stack.count), cx + 43, cy + 43);
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

  const list = getVisibleSkills();

  for (let i = 0; i < list.length; i++) {
    const skill = list[i];
    const rowY = y + 88 + i * 54;

    ctx.fillStyle = skills.unlocked.includes(skill.id) ? '#1e293b' : '#111827';
    roundRectCtx(ctx, x + 24, rowY, 430, 44, 8);

    drawSkillIcon(skill, x + 48, rowY + 22, 28);

    ctx.fillStyle = skills.unlocked.includes(skill.id) ? '#fff' : '#64748b';
    ctx.font = 'bold 14px sans-serif';
    ctx.fillText(skill.name, x + 72, rowY + 18);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${skill.desc} MP ${skill.mp}`, x + 72, rowY + 35);
  }

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('단축키', x + 500, y + 82);

  drawSkillSlotText('K', skills.hotkeys.k, x + 500, y + 120);
  drawSkillSlotText('L', skills.hotkeys.l, x + 500, y + 170);
  drawSkillSlotText(';', skills.hotkeys.semicolon, x + 500, y + 220);
}

function getVisibleSkills() {
  const job = game.player.character.job || 'beginner';
  const ids = new Set([...JOBS.beginner.skills, ...(JOBS[job]?.skills || [])]);

  return [...ids].map(id => SKILLS[id]).filter(Boolean);
}

function drawSkillSlotText(key, id, x, y) {
  ctx.fillStyle = '#1e293b';
  roundRectCtx(ctx, x, y - 24, 150, 38, 8);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText(`${key}: ${id ? SKILLS[id].name : '-'}`, x + 12, y);
}

function drawQuestPanel() {
  const x = 70;
  const y = 105;
  const w = 620;
  const h = 470;

  ctx.fillStyle = 'rgba(15,23,42,0.96)';
  roundRectCtx(ctx, x, y, w, h, 14);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 24px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('퀘스트', x + 24, y + 40);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '14px sans-serif';
  ctx.fillText('Q 키로 닫기 / NPC에게 말을 걸어 수락 또는 완료', x + 24, y + 66);

  let cy = y + 105;

  if (!quests.active.length) {
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('진행 중인 퀘스트가 없습니다.', x + 24, cy);
    return;
  }

  for (const q of quests.active) {
    syncItemQuestCounts(q);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(q.title, x + 24, cy);

    cy += 22;

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '13px sans-serif';
    ctx.fillText(q.desc, x + 34, cy);

    cy += 24;

    for (const goal of q.goals) {
      const done = goal.count >= goal.need;

      ctx.fillStyle = done ? '#c0eb75' : '#e2e8f0';
      ctx.font = '13px sans-serif';

      const label = goal.type === 'kill'
        ? `${goal.monsterFamily} 처치`
        : `${ITEMS[goal.itemId]?.name || goal.itemId}`;

      ctx.fillText(`${label}: ${goal.count}/${goal.need}`, x + 44, cy);
      cy += 18;
    }

    cy += 24;
  }
}

function drawDialog() {
  const npc = game.dialog.npc;

  ctx.fillStyle = 'rgba(15,23,42,0.96)';
  roundRectCtx(ctx, 150, 545, 980, 125, 16);

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
  if (npc.type === 'quest' || npc.type === 'job') {
    const q = QUESTS[npc.quest];
    const active = quests.active.find(v => v.id === npc.quest);
    const completed = quests.completed.includes(npc.quest);

    if (completed) action = '완료됨';
    else if (active) action = isQuestComplete(active) ? '완료하기' : '진행 중';
    else action = q?.jobReward ? '전직 퀘스트' : '퀘스트 수락';
  }

  ctx.fillStyle = '#4dabf7';
  roundRectCtx(ctx, 220, 620, 180, 42, 8);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(action, 310, 647);

  ctx.fillStyle = '#334155';
  roundRectCtx(ctx, 950, 616, 120, 40, 8);

  ctx.fillStyle = '#fff';
  ctx.fillText('닫기', 1010, 642);
}

function drawTaxiPanel() {
  ctx.fillStyle = 'rgba(15,23,42,0.97)';
  roundRectCtx(ctx, 100, 80, 1040, 590, 18);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(100, 80, 1040, 590);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('택시 이동', 135, 122);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '15px sans-serif';
  ctx.fillText('골드를 지불하고 다른 도시로 이동합니다.', 135, 150);

  for (let i = 0; i < TOWNS.length; i++) {
    const town = TOWNS[i];
    const x = 145 + (i % 2) * 360;
    const y = 190 + Math.floor(i / 2) * 82;

    ctx.fillStyle = town.id === game.townId ? '#334155' : '#1e293b';
    roundRectCtx(ctx, x, y, 320, 62, 10);

    ctx.strokeStyle = '#475569';
    ctx.strokeRect(x, y, 320, 62);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText(`${town.title} ${town.name}`, x + 18, y + 25);

    ctx.fillStyle = '#ffd43b';
    ctx.font = '14px sans-serif';
    ctx.fillText(town.id === game.townId ? '현재 위치' : `${town.taxiCost} Gold`, x + 18, y + 48);
  }

  ctx.fillStyle = '#334155';
  roundRectCtx(ctx, 1000, 610, 120, 40, 8);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('닫기', 1060, 636);
}

function drawShopPanel() {
  const title = game.shopOpen === 'weapon' ? '장비 상점' : '상점';

  ctx.fillStyle = 'rgba(15,23,42,0.97)';
  roundRectCtx(ctx, 80, 80, 1080, 590, 18);

  ctx.strokeStyle = '#93c5fd';
  ctx.strokeRect(80, 80, 1080, 590);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(title, 110, 122);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '15px sans-serif';
  ctx.fillText(`보유 골드: ${wallet.gold}`, 110, 150);

  const items = game.shopOpen === 'weapon'
    ? SHOP_ITEMS.filter(id => ITEMS[id].type !== 'etc')
    : ['hp_potion', 'mp_potion'];

  for (let i = 0; i < items.length; i++) {
    const id = items[i];
    const item = ITEMS[id];

    const x = 110 + (i % 2) * 380;
    const y = 185 + Math.floor(i / 2) * 58;

    ctx.fillStyle = '#1e293b';
    roundRectCtx(ctx, x, y, 330, 46, 8);

    drawItemIcon(item.icon, x + 25, y + 23, 28);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(item.name, x + 50, y + 19);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${item.desc} / ${item.price}G`, x + 50, y + 36);
  }

  if (game.shopOpen === 'merchant') {
    ctx.fillStyle = '#4dabf7';
    roundRectCtx(ctx, 760, 610, 190, 40, 8);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('부산물 모두 판매', 855, 636);
  }

  ctx.fillStyle = '#334155';
  roundRectCtx(ctx, 1010, 610, 120, 40, 8);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('닫기', 1070, 636);
}

/* =========================================================
   Icons / Effects
========================================================= */

function drawItemIcon(icon, x, y, size) {
  ctx.save();

  if (icon === 'hp') {
    ctx.fillStyle = '#ff4d4f';
    ctx.beginPath();
    ctx.arc(x - 5, y - 3, size * 0.22, 0, Math.PI * 2);
    ctx.arc(x + 5, y - 3, size * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x - size * 0.34, y);
    ctx.lineTo(x, y + size * 0.36);
    ctx.lineTo(x + size * 0.34, y);
    ctx.closePath();
    ctx.fill();
  } else if (icon === 'mp') {
    ctx.fillStyle = '#4dabf7';
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.38);
    ctx.quadraticCurveTo(x + size * 0.35, y, x, y + size * 0.38);
    ctx.quadraticCurveTo(x - size * 0.35, y, x, y - size * 0.38);
    ctx.fill();
  } else if (icon === 'sword' || icon === 'dagger') {
    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - size * 0.28, y + size * 0.28);
    ctx.lineTo(x + size * 0.28, y - size * 0.28);
    ctx.stroke();
  } else if (icon === 'staff') {
    ctx.strokeStyle = '#b197fc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x - 8, y + 10);
    ctx.lineTo(x + 8, y - 12);
    ctx.stroke();

    ctx.fillStyle = '#74c0fc';
    circleCtx(ctx, x + 9, y - 13, 5);
  } else if (icon === 'bow') {
    ctx.strokeStyle = '#ffd43b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.36, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  } else if (icon === 'armor') {
    ctx.fillStyle = '#adb5bd';
    roundRectCtx(ctx, x - size * 0.3, y - size * 0.3, size * 0.6, size * 0.6, 5);
    ctx.fillStyle = '#748ffc';
    ctx.fillRect(x - size * 0.18, y - size * 0.15, size * 0.36, size * 0.25);
  } else if (icon === 'ring') {
    ctx.strokeStyle = '#ffd43b';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.26, 0, Math.PI * 2);
    ctx.stroke();
  } else if (icon === 'crystal' || icon === 'ice' || icon === 'ore' || icon === 'core') {
    ctx.fillStyle = icon === 'ice' ? '#8cecff' : icon === 'ore' ? '#adb5bd' : icon === 'core' ? '#b197fc' : '#74c0fc';
    ctx.beginPath();
    ctx.moveTo(x, y - size * 0.36);
    ctx.lineTo(x + size * 0.28, y);
    ctx.lineTo(x, y + size * 0.36);
    ctx.lineTo(x - size * 0.28, y);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = '#c0eb75';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawSkillIcon(skill, x, y, size) {
  const color = skill.magic ? '#74c0fc' : skill.heal ? '#69db7c' : skill.buff ? '#b197fc' : '#ff922b';

  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(skill.name.slice(0, 1), x, y + 4);

  ctx.restore();
}

function makeSlash(x, y, face, color = '#ffb020') {
  game.particles.push({
    type: 'slash',
    x,
    y,
    vx: face * 80,
    vy: -30,
    life: 0.25,
    face,
    color
  });
}

function spawnCircleEffect(x, y, color) {
  for (let i = 0; i < 10; i++) {
    game.particles.push({
      type: 'spark',
      x,
      y,
      vx: Math.cos(i / 10 * Math.PI * 2) * 80,
      vy: Math.sin(i / 10 * Math.PI * 2) * 80,
      life: 0.45,
      color
    });
  }
}

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

function drawParticles() {
  for (const fx of game.particles) {
    if (fx.type === 'slash') {
      ctx.save();
      ctx.translate(fx.x, fx.y);
      ctx.scale(fx.face, 1);

      ctx.globalAlpha = clamp(fx.life * 4, 0, 1);

      ctx.strokeStyle = fx.color || '#ffe066';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(0, 0, 24, -0.7, 0.8);
      ctx.stroke();

      ctx.strokeStyle = '#fff6';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(2, 0, 17, -0.7, 0.8);
      ctx.stroke();

      ctx.restore();
    }

    if (fx.type === 'spark') {
      ctx.save();
      ctx.globalAlpha = clamp(fx.life * 2.5, 0, 1);
      ctx.fillStyle = fx.color || '#fff';
      circleCtx(ctx, fx.x, fx.y, 4);
      ctx.restore();
    }
  }
}

function drawTexts() {
  for (const t of game.texts) {
    ctx.fillStyle = t.color;
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t.text, t.x, t.y);
  }
}

/* =========================================================
   Environment Props
========================================================= */

function drawCloud(x, y, s) {
  ctx.save();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = '#fff';

  circleCtx(ctx, x, y, 17 * s);
  circleCtx(ctx, x + 22 * s, y - 9 * s, 24 * s);
  circleCtx(ctx, x + 50 * s, y - 4 * s, 20 * s);
  circleCtx(ctx, x + 75 * s, y, 15 * s);

  ctx.fillRect(x - 8 * s, y, 88 * s, 17 * s);

  ctx.restore();
}

function drawHouse(x, y, s, theme) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  const wall = theme === 'ice' ? '#dbeafe' : theme === 'desert' ? '#c98c43' : theme === 'ruin' ? '#7a7f8c' : '#8a6237';
  const roof = theme === 'magic' ? '#a78bfa' : theme === 'desert' ? '#e6b564' : '#dcc879';

  ctx.fillStyle = '#6b472c';
  ctx.fillRect(-3, 25, 156, 92);

  ctx.fillStyle = wall;
  ctx.fillRect(0, 28, 150, 88);

  ctx.fillStyle = roof;
  ctx.beginPath();
  ctx.ellipse(75, 28, 84, 38, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#f3e8aa';
  ctx.fillRect(18, 52, 42, 30);
  ctx.fillRect(92, 52, 36, 30);

  ctx.fillStyle = '#4e321e';
  ctx.fillRect(62, 66, 28, 50);

  ctx.restore();
}

function drawTree(x, y, s, theme) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  ctx.fillStyle = '#764927';
  ctx.fillRect(-10, -78, 20, 78);

  const leaf = theme === 'ice' ? '#c2f2ff' : theme === 'desert' ? '#7faa50' : theme === 'ruin' ? '#596b55' : '#2f7f3b';

  ctx.fillStyle = leaf;
  circleCtx(ctx, -28, -82, 28);
  circleCtx(ctx, 0, -105, 34);
  circleCtx(ctx, 31, -82, 28);
  circleCtx(ctx, 0, -64, 30);

  ctx.fillStyle = '#56b85d';
  if (theme !== 'ice' && theme !== 'desert') circleCtx(ctx, -9, -113, 13);

  ctx.restore();
}

function drawPine(x, y, s, theme) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

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
  roundRectCtx(ctx, -12, -92, 24, 92, 10);
  roundRectCtx(ctx, -42, -62, 20, 45, 9);
  roundRectCtx(ctx, 24, -78, 20, 50, 9);

  ctx.restore();
}

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

/* =========================================================
   Image Processing
========================================================= */

function makeTransparentSheet(img) {
  const c = document.createElement('canvas');
  c.width = img.width;
  c.height = img.height;

  const cx = c.getContext('2d');
  cx.imageSmoothingEnabled = false;
  cx.drawImage(img, 0, 0);

  const imageData = cx.getImageData(0, 0, c.width, c.height);
  const d = imageData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];

    if (r > 245 && g > 245 && b > 245) {
      d[i + 3] = 0;
    }
  }

  cx.putImageData(imageData, 0, 0);
  return c;
}

function recolorSkin(c, w, h, skinHex) {
  const rgb = hexToRgb(skinHex || '#ffd6a6');
  const imageData = c.getImageData(0, 0, w, h);
  const d = imageData.data;

  for (let i = 0; i < d.length; i += 4) {
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    const a = d[i + 3];

    if (a === 0) continue;

    const looksLikeSkin =
      r > 170 &&
      g > 105 &&
      g < 225 &&
      b > 45 &&
      b < 190 &&
      r > g &&
      g > b;

    if (looksLikeSkin) {
      const shade = (r + g + b) / 3 / 185;

      d[i] = clamp(rgb.r * shade, 0, 255);
      d[i + 1] = clamp(rgb.g * shade, 0, 255);
      d[i + 2] = clamp(rgb.b * shade, 0, 255);
    }
  }

  c.putImageData(imageData, 0, 0);
}

/* =========================================================
   Helpers
========================================================= */

function roundRectCtx(c, x, y, w, h, r) {
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

function circleCtx(c, x, y, r) {
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
  if (!nums || nums.length < 3) return value;

  return '#' + nums
    .slice(0, 3)
    .map(n => Number(n).toString(16).padStart(2, '0'))
    .join('');
}

function hexToRgb(hex) {
  const clean = String(hex || '#ffd6a6').replace('#', '').padEnd(6, '0');

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
