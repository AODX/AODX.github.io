const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;

const auth = document.getElementById('auth');
const characterScreen = document.getElementById('characterScreen');
const characterMenu = document.getElementById('characterMenu');
const help = document.getElementById('hudHelp');
const authBtn = document.getElementById('authBtn');
const authMsg = document.getElementById('authMsg');
const nickMsg = document.getElementById('nickMsg');
const createMsg = document.getElementById('createMsg');
const preview = document.getElementById('preview');
const menuPreview = document.getElementById('menuPreview');

const pctx = preview.getContext('2d');
const mctx = menuPreview.getContext('2d');
pctx.imageSmoothingEnabled = false;
mctx.imageSmoothingEnabled = false;

if (help) {
  help.textContent = 'A/D 이동 · Space 점프 · J 기본공격 · K 화염파 · L 화염기둥 · M 인벤토리 · C 스탯 · Q 퀘스트 · 1~4 물약';
}

const JOBS = {
  beginner: {
    id: 'beginner',
    name: '초보자',
    desc: '모든 능력치가 무난하지만 전문성은 낮습니다.',
    main: 'str',
    color: '#4f9cff',
    weapon: 'glove',
    statRate: { str: 1.0, dex: 1.0, int: 1.0, luk: 1.0 }
  },
  warrior: {
    id: 'warrior',
    name: '전사',
    desc: 'STR 효율이 높고 HP가 높습니다. 근접 공격에 강합니다.',
    main: 'str',
    color: '#ff6b6b',
    weapon: 'sword',
    statRate: { str: 1.45, dex: 0.75, int: 0.25, luk: 0.55 }
  },
  mage: {
    id: 'mage',
    name: '마법사',
    desc: 'INT 효율이 높고 MP와 스킬 피해가 강합니다.',
    main: 'int',
    color: '#845ef7',
    weapon: 'wand',
    statRate: { str: 0.25, dex: 0.45, int: 1.55, luk: 0.75 }
  },
  thief: {
    id: 'thief',
    name: '도적',
    desc: 'LUK/DEX 효율이 높고 치명타와 회피가 좋습니다.',
    main: 'luk',
    color: '#51cf66',
    weapon: 'dagger',
    statRate: { str: 0.55, dex: 1.1, int: 0.35, luk: 1.35 }
  }
};

const keys = new Set();

let last = performance.now();
let cameraX = 0;
let token = localStorage.getItem('pixel-rpg-token') || '';
let loginMode = 'login';
let currentUser = null;
let nickTimer = null;
let previewPulse = 0;

let selected = {
  job: 'beginner',
  skin: '#ffd6a6',
  hair: '#5b2d16',
  outfit: '#4f9cff',
  accent: '#ffd43b'
};

const state = {
  ready: false,
  scene: 'town',
  sceneWidth: 3300,
  groundY: 548,
  particles: [],
  texts: [],
  hitboxes: [],
  portals: [],
  npcs: [],
  monsters: [],
  platforms: [],
  dialogue: null,
  inventoryOpen: false,
  inventoryTab: 'equip',
  questOpen: false,
  selectedInventoryIndex: null,
  uiBoxes: [],
  saveFlash: 0,
  player: defaultPlayer()
};

function defaultPlayer() {
  return {
    x: 260,
    y: 548,
    vx: 0,
    vy: 0,
    face: 1,
    grounded: true,
    anim: 'idle',
    animTime: 0,
    attackCd: 0,
    skillCd: 0,
    skill2Cd: 0,
    inv: 0,
    levelUp: 0,
    comboStep: 0,
    comboWindow: 0,

    level: 1,
    exp: 0,
    nextExp: 80,

    hp: 120,
    maxHp: 120,
    mp: 40,
    maxMp: 40,

    gold: 120,

    statPoints: 5,
    stats: {
      str: 6,
      dex: 6,
      int: 6,
      luk: 6
    },

    character: {
      name: '초보자',
      job: 'beginner',
      skin: '#ffd6a6',
      hair: '#5b2d16',
      outfit: '#4f9cff',
      accent: '#ffd43b'
    },

    unlockedSkills: [],
    quests: {},
    quickSlots: ['red_potion', 'blue_potion', null, null],
    equipped: {
      weapon: null,
      armor: null
    },
    inventory: [
      { id: 'red_potion', name: '체력 물약', type: 'consume', qty: 15, healHp: 60, icon: 'hp' },
      { id: 'blue_potion', name: '마나 물약', type: 'consume', qty: 12, healMp: 40, icon: 'mp' },
      { id: 'beginner_glove', name: '초보자 장갑', type: 'weapon', qty: 1, atk: 2, job: 'beginner', icon: 'glove' },
      { id: 'training_sword', name: '수련용 검', type: 'weapon', qty: 1, atk: 6, job: 'warrior', icon: 'sword' },
      { id: 'oak_wand', name: '참나무 완드', type: 'weapon', qty: 1, matk: 7, job: 'mage', icon: 'wand' },
      { id: 'practice_dagger', name: '연습용 단검', type: 'weapon', qty: 1, atk: 5, job: 'thief', icon: 'dagger' }
    ]
  };
}

async function api(path, body) {
  const response = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error || '요청 실패');
  }

  return data;
}

function hideAllPanels() {
  auth.classList.add('hidden');
  characterScreen.classList.add('hidden');
  characterMenu.classList.add('hidden');
  help.classList.add('hidden');
}

function showAuth() {
  state.ready = false;
  hideAllPanels();
  auth.classList.remove('hidden');
}

function showCreator() {
  state.ready = false;
  hideAllPanels();
  characterScreen.classList.remove('hidden');
  injectJobSelector();
  drawPreview();
}

function showCharacterMenu(save) {
  state.ready = false;
  hideAllPanels();
  characterMenu.classList.remove('hidden');

  document.getElementById('menuName').textContent =
    `${save.player.character.name}  Lv.${save.player.level}`;

  drawMenuPreview(save.player.character);
}

function startWithSave(save) {
  state.player = {
    ...defaultPlayer(),
    ...(save?.player || {})
  };

  normalizePlayer(state.player);
  applyDerivedStats(state.player);

  setupScene(state.player.scene || 'town');

  state.player.y = state.groundY;
  state.player.vx = 0;
  state.player.vy = 0;

  hideAllPanels();
  help.classList.remove('hidden');
  state.ready = true;

  toast(`${state.player.character.name}님, 모험을 시작합니다!`, state.player.x, state.player.y - 120, '#ffe066');
}

function setMode(mode) {
  loginMode = mode;

  document.getElementById('tabLogin').classList.toggle('active', mode === 'login');
  document.getElementById('tabRegister').classList.toggle('active', mode === 'register');

  authBtn.textContent = mode === 'login' ? '로그인' : '회원가입';
  authMsg.textContent = '';
}

function injectJobSelector() {
  const creatorLeft = document.querySelector('.creator-left');
  if (!creatorLeft || document.getElementById('jobSelectBox')) return;

  const box = document.createElement('div');
  box.id = 'jobSelectBox';
  box.style.margin = '12px 0';
  box.innerHTML = `
    <p style="margin:8px 0 6px;color:#ffe082;font-weight:900;">직업 선택</p>
    <div class="job-buttons" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <button class="job-btn active" data-job="beginner">초보자</button>
      <button class="job-btn" data-job="warrior">전사</button>
      <button class="job-btn" data-job="mage">마법사</button>
      <button class="job-btn" data-job="thief">도적</button>
    </div>
    <p id="jobDesc" style="font-size:13px;color:#d6e4ff;margin:8px 0 0;">
      모든 능력치가 무난하지만 전문성은 낮습니다.
    </p>
  `;

  const startBtn = document.getElementById('startNewBtn');
  creatorLeft.insertBefore(box, startBtn);

  document.querySelectorAll('.job-btn').forEach(btn => {
    btn.style.border = '0';
    btn.style.borderRadius = '10px';
    btn.style.padding = '10px';
    btn.style.fontWeight = '900';
    btn.style.cursor = 'pointer';
    btn.style.background = '#263346';
    btn.style.color = '#fff';

    btn.onclick = () => {
      selected.job = btn.dataset.job;

      document.querySelectorAll('.job-btn').forEach(item => {
        item.classList.remove('active');
        item.style.background = '#263346';
      });

      btn.classList.add('active');
      btn.style.background = `linear-gradient(${JOBS[selected.job].color}, #1971c2)`;

      document.getElementById('jobDesc').textContent = JOBS[selected.job].desc;

      drawPreview();
    };
  });
}

document.getElementById('tabLogin').onclick = () => setMode('login');
document.getElementById('tabRegister').onclick = () => setMode('register');
authBtn.onclick = submitAuth;
document.getElementById('startNewBtn').onclick = createCharacterAndStart;
document.getElementById('continueBtn').onclick = () => startWithSave(currentUser.save);
document.getElementById('logoutBtn').onclick = logout;
document.getElementById('logoutBtn2').onclick = logout;

document.getElementById('charName').addEventListener('input', () => {
  drawPreview();
  checkNicknameSoon();
});

document.querySelectorAll('.swatches').forEach(group => {
  group.querySelectorAll('span').forEach(span => {
    span.onclick = () => {
      selected[group.dataset.target] = rgbToHex(span.style.backgroundColor);

      group.querySelectorAll('span').forEach(item => item.classList.remove('selected'));
      span.classList.add('selected');

      drawPreview();
    };
  });

  const first = group.querySelector('span');
  if (first) first.classList.add('selected');
});

async function submitAuth() {
  try {
    authMsg.textContent = '';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const data = await api(
      loginMode === 'login' ? '/api/login' : '/api/register',
      { username, password }
    );

    token = data.token;
    localStorage.setItem('pixel-rpg-token', token);

    currentUser = data.user;

    if (currentUser.hasCharacter && currentUser.save) {
      showCharacterMenu(currentUser.save);
    } else {
      showCreator();
    }
  } catch (err) {
    authMsg.textContent = err.message;
  }
}

async function checkNicknameSoon() {
  clearTimeout(nickTimer);

  nickTimer = setTimeout(async () => {
    const nickname = document.getElementById('charName').value.trim();

    if (nickname.length < 2) {
      nickMsg.className = 'nick-msg bad';
      nickMsg.textContent = '닉네임은 2자 이상이어야 합니다.';
      return;
    }

    try {
      await api('/api/check-nickname', { nickname });
      nickMsg.className = 'nick-msg ok';
      nickMsg.textContent = '사용 가능한 닉네임입니다.';
    } catch (err) {
      nickMsg.className = 'nick-msg bad';
      nickMsg.textContent = err.message;
    }
  }, 250);
}

async function createCharacterAndStart() {
  try {
    createMsg.textContent = '';

    const character = {
      name: document.getElementById('charName').value.trim(),
      job: selected.job || 'beginner',
      skin: selected.skin,
      hair: selected.hair,
      outfit: selected.outfit,
      accent: selected.accent
    };

    const data = await api('/api/create-character', { character });

    currentUser = data.user;
    startWithSave(currentUser.save);
  } catch (err) {
    createMsg.textContent = err.message;
  }
}

async function boot() {
  setMode('login');
  setupScene('town');
  drawPreview();

  if (!token) {
    showAuth();
    return;
  }

  try {
    const data = await api('/api/profile');
    currentUser = data.user;

    if (currentUser.hasCharacter && currentUser.save) {
      showCharacterMenu(currentUser.save);
    } else {
      showCreator();
    }
  } catch {
    localStorage.removeItem('pixel-rpg-token');
    token = '';
    showAuth();
  }
}

async function logout() {
  try {
    await api('/api/logout', {});
  } catch {}

  token = '';
  currentUser = null;

  localStorage.removeItem('pixel-rpg-token');
  showAuth();
}

async function saveGame() {
  if (!state.ready) return;

  normalizePlayer(state.player);
  applyDerivedStats(state.player);

  const save = {
    player: pick(state.player, [
      'character',
      'scene',
      'x',
      'y',
      'level',
      'exp',
      'nextExp',
      'hp',
      'maxHp',
      'mp',
      'maxMp',
      'gold',
      'statPoints',
      'stats',
      'unlockedSkills',
      'quests',
      'inventory',
      'quickSlots',
      'equipped'
    ])
  };

  try {
    const data = await api('/api/save', save);

    currentUser = {
      ...(currentUser || {}),
      save,
      savedAt: data.savedAt,
      hasCharacter: true
    };

    state.saveFlash = 1;
    toast('서버 저장 완료', state.player.x, state.player.y - 110, '#9bf6ff');
  } catch {
    toast('저장 실패', state.player.x, state.player.y - 110, '#ff8787');
  }
}

function pick(obj, keys) {
  return Object.fromEntries(keys.map(key => [key, obj[key]]));
}

function normalizePlayer(player) {
  if (!player.character) player.character = defaultPlayer().character;
  if (!player.character.job) player.character.job = 'beginner';

  const job = player.character.job;

  if (!player.stats) {
    player.stats = {
      str: job === 'warrior' ? 12 : 6,
      dex: job === 'thief' ? 12 : 6,
      int: job === 'mage' ? 12 : 6,
      luk: job === 'thief' ? 10 : 6
    };
  }

  if (typeof player.statPoints !== 'number') player.statPoints = 0;
  if (!player.quickSlots) player.quickSlots = ['red_potion', 'blue_potion', null, null];
  if (!player.equipped) player.equipped = { weapon: null, armor: null };
  if (!player.inventory) player.inventory = [];

  const requiredItems = [
    { id: 'red_potion', name: '체력 물약', type: 'consume', qty: 15, healHp: 60, icon: 'hp' },
    { id: 'blue_potion', name: '마나 물약', type: 'consume', qty: 12, healMp: 40, icon: 'mp' },
    { id: 'beginner_glove', name: '초보자 장갑', type: 'weapon', qty: 1, atk: 2, job: 'beginner', icon: 'glove' },
    { id: 'training_sword', name: '수련용 검', type: 'weapon', qty: 1, atk: 6, job: 'warrior', icon: 'sword' },
    { id: 'oak_wand', name: '참나무 완드', type: 'weapon', qty: 1, matk: 7, job: 'mage', icon: 'wand' },
    { id: 'practice_dagger', name: '연습용 단검', type: 'weapon', qty: 1, atk: 5, job: 'thief', icon: 'dagger' }
  ];

  for (const item of requiredItems) {
    const found = player.inventory.find(inv => inv.id === item.id);

    if (!found) {
      player.inventory.push({ ...item });
    }
  }
}

function getJob(player = state.player) {
  return JOBS[player.character?.job || 'beginner'] || JOBS.beginner;
}

function getEquippedWeapon(player = state.player) {
  if (!player.equipped?.weapon) return null;
  return player.inventory.find(item => item.id === player.equipped.weapon) || null;
}

function applyDerivedStats(player = state.player) {
  normalizePlayer(player);

  const job = getJob(player);
  const s = player.stats;

  const hpBonus = Math.floor(s.str * (job.id === 'warrior' ? 4.5 : 2.2));
  const mpBonus = Math.floor(s.int * (job.id === 'mage' ? 4.8 : 1.7));

  player.maxHp = 110 + player.level * 12 + hpBonus;
  player.maxMp = 35 + player.level * 8 + mpBonus;

  player.hp = Math.min(player.hp, player.maxHp);
  player.mp = Math.min(player.mp, player.maxMp);
}

function calcPower(player = state.player, type = 'physical') {
  normalizePlayer(player);

  const job = getJob(player);
  const s = player.stats;
  const weapon = getEquippedWeapon(player);

  const weaponAtk = weapon?.atk || 0;
  const weaponMatk = weapon?.matk || 0;

  const physical =
    s.str * job.statRate.str * 1.15 +
    s.dex * job.statRate.dex * 0.65 +
    s.luk * job.statRate.luk * 0.45 +
    weaponAtk * 4 +
    player.level * 3;

  const magical =
    s.int * job.statRate.int * 1.35 +
    s.luk * job.statRate.luk * 0.45 +
    weaponMatk * 4 +
    player.level * 3;

  if (type === 'magic') return Math.floor(magical);
  return Math.floor(physical);
}

function calcCritRate(player = state.player) {
  const s = player.stats || {};
  const job = getJob(player);

  let rate = 5 + (s.luk || 0) * 0.15 + (s.dex || 0) * 0.05;

  if (job.id === 'thief') rate += 8;

  return clamp(rate, 0, 45);
}

function investStat(stat) {
  const p = state.player;

  normalizePlayer(p);

  if (p.statPoints <= 0) return;
  if (!['str', 'dex', 'int', 'luk'].includes(stat)) return;

  p.stats[stat]++;
  p.statPoints--;

  applyDerivedStats(p);

  toast(`${stat.toUpperCase()} +1`, p.x, p.y - 125, '#ffe066');
}

function equipItem(index) {
  const p = state.player;
  const item = p.inventory[index];

  if (!item) return;

  const job = p.character?.job || 'beginner';

  if (item.type === 'weapon') {
    if (item.job && item.job !== 'beginner' && item.job !== job) {
      toast('현재 직업이 착용할 수 없습니다', p.x, p.y - 110, '#ff8787');
      return;
    }

    p.equipped.weapon = item.id;
    toast(`${item.name} 장착`, p.x, p.y - 110, '#b2f2bb');
  }
}

function assignQuickSlot(slotIndex) {
  const p = state.player;
  const item = p.inventory[state.selectedInventoryIndex];

  if (!item || item.type !== 'consume') {
    toast('소모품만 프리셋에 등록할 수 있습니다', p.x, p.y - 110, '#ffd43b');
    return;
  }

  p.quickSlots[slotIndex] = item.id;
  toast(`${slotIndex + 1}번 슬롯에 ${item.name} 등록`, p.x, p.y - 110, '#b2f2bb');
}

function useQuickSlot(slotIndex) {
  const p = state.player;

  normalizePlayer(p);

  const itemId = p.quickSlots[slotIndex];
  if (!itemId) return;

  const item = p.inventory.find(inv => inv.id === itemId);

  if (!item || item.qty <= 0) {
    toast('아이템이 없습니다', p.x, p.y - 110, '#ff8787');
    return;
  }

  if (item.healHp) {
    if (p.hp >= p.maxHp) {
      toast('HP가 이미 가득 찼습니다', p.x, p.y - 110, '#ffd43b');
      return;
    }

    p.hp = Math.min(p.maxHp, p.hp + item.healHp);
    item.qty--;
    toast(`HP +${item.healHp}`, p.x, p.y - 110, '#ff8787');
  }

  if (item.healMp) {
    if (p.mp >= p.maxMp) {
      toast('MP가 이미 가득 찼습니다', p.x, p.y - 110, '#ffd43b');
      return;
    }

    p.mp = Math.min(p.maxMp, p.mp + item.healMp);
    item.qty--;
    toast(`MP +${item.healMp}`, p.x, p.y - 110, '#74c0fc');
  }
}

function setupScene(scene) {
  state.scene = scene;
  state.particles = [];
  state.texts = [];
  state.hitboxes = [];
  state.monsters = [];
  state.dialogue = null;
  state.platforms = [];

  if (scene === 'town') {
    state.sceneWidth = 3300;
    state.groundY = 548;

    state.platforms = [
      { x: 220, y: 466, w: 380, h: 18 },
      { x: 650, y: 430, w: 360, h: 18 },
      { x: 1090, y: 486, w: 320, h: 18 },
      { x: 1500, y: 438, w: 420, h: 18 },
      { x: 2050, y: 470, w: 360, h: 18 }
    ];

    state.portals = [
      { x: 2860, y: state.groundY - 105, w: 74, h: 110, to: 'field', label: '수련의 숲' }
    ];

    state.npcs = [
      {
        id: 'elder',
        name: '장로 구름',
        x: 620,
        y: state.groundY,
        palette: { skin: '#ffe0bd', hair: '#d5d8dc', outfit: '#4c6ef5', accent: '#ffd43b' },
        text: ['어서 오게, 신입 모험가여.', '동쪽 포탈로 나가 슬라임 5마리를 처치해 보게.'],
        quest: 'slime_intro'
      },
      {
        id: 'trainer',
        name: '직업 교관',
        x: 1080,
        y: state.groundY,
        palette: { skin: '#f4c28a', hair: '#5b2d16', outfit: '#ff6b6b', accent: '#ffd43b' },
        text: ['직업마다 스탯 효율이 다르다.', '전사 STR, 마법사 INT, 도적 LUK/DEX가 핵심이다.']
      },
      {
        id: 'smith',
        name: '대장장이 단단',
        x: 1450,
        y: state.groundY,
        palette: { skin: '#f4c28a', hair: '#6b4f2d', outfit: '#6c584c', accent: '#ff922b' },
        text: ['M키로 장비와 아이템을 확인할 수 있다네.', '아이템을 클릭하고 퀵슬롯을 클릭하면 프리셋 등록이 된다네.']
      },
      {
        id: 'mage',
        name: '루나',
        x: 1850,
        y: state.groundY,
        palette: { skin: '#ffe0c7', hair: '#845ef7', outfit: '#20c997', accent: '#74c0fc' },
        text: ['Q키로 퀘스트 창을 열 수 있어.', 'C키를 누르면 바로 스탯 창을 볼 수 있어.']
      }
    ];
  } else {
    state.sceneWidth = 4400;
    state.groundY = 566;

    state.platforms = [
      { x: 480, y: 482, w: 320, h: 18 },
      { x: 1050, y: 430, w: 280, h: 18 },
      { x: 1580, y: 500, w: 320, h: 18 },
      { x: 2450, y: 450, w: 360, h: 18 }
    ];

    state.portals = [
      { x: 110, y: state.groundY - 105, w: 74, h: 110, to: 'town', label: '초보자 마을' }
    ];

    state.npcs = [];
    spawnMonsters();
  }

  state.player.scene = scene;
}

function spawnMonsters() {
  const ground = state.groundY;

  state.monsters = [
    ...Array.from({ length: 8 }, (_, i) => ({
      type: 'slime',
      x: 500 + i * 170,
      y: ground,
      face: Math.random() < 0.5 ? -1 : 1,
      hp: 42,
      maxHp: 42,
      exp: 18,
      dead: false,
      animTime: Math.random() * 3,
      hit: 0,
      ai: 'hop',
      speed: 40,
      respawn: 0,
      w: 40,
      h: 28
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      type: 'mushroom',
      x: 1000 + i * 260,
      y: ground,
      face: Math.random() < 0.5 ? -1 : 1,
      hp: 65,
      maxHp: 65,
      exp: 25,
      dead: false,
      animTime: Math.random() * 3,
      hit: 0,
      ai: 'walk',
      speed: 28,
      respawn: 0,
      w: 46,
      h: 48
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
      type: i % 2 ? 'frost_core' : 'ember_core',
      x: 2050 + i * 260,
      y: ground,
      face: Math.random() < 0.5 ? -1 : 1,
      hp: 95,
      maxHp: 95,
      exp: 38,
      dead: false,
      animTime: Math.random() * 3,
      hit: 0,
      ai: 'float',
      speed: 22,
      respawn: 0,
      w: 46,
      h: 54
    })),
    {
      type: 'ogre',
      x: 3100,
      y: ground,
      face: -1,
      hp: 180,
      maxHp: 180,
      exp: 70,
      dead: false,
      animTime: 0,
      hit: 0,
      ai: 'heavy',
      speed: 24,
      respawn: 0,
      w: 64,
      h: 88,
      attackWindup: 0
    },
    {
      type: 'ghoul',
      x: 3620,
      y: ground,
      face: -1,
      hp: 150,
      maxHp: 150,
      exp: 60,
      dead: false,
      animTime: 0,
      hit: 0,
      ai: 'dash',
      speed: 38,
      respawn: 0,
      w: 54,
      h: 82,
      attackWindup: 0
    }
  ];
}

addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  keys.add(key);

  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    event.preventDefault();
  }

  if (!state.ready) return;

  if (key === 'm') state.inventoryOpen = !state.inventoryOpen;
  if (key === 'c') {
    state.inventoryOpen = true;
    state.inventoryTab = 'stat';
  }
  if (key === 'q') state.questOpen = !state.questOpen;
  if (key === 'e') interact();
  if (key === 's') saveGame();
  if (key === 'j') punch();
  if (key === 'k') castSkill1();
  if (key === 'l') castSkill2();

  if (key === '1') useQuickSlot(0);
  if (key === '2') useQuickSlot(1);
  if (key === '3') useQuickSlot(2);
  if (key === '4') useQuickSlot(3);
});

addEventListener('keyup', event => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener('click', event => {
  if (!state.ready) return;

  const rect = canvas.getBoundingClientRect();
  const mx = (event.clientX - rect.left) * (canvas.width / rect.width);
  const my = (event.clientY - rect.top) * (canvas.height / rect.height);

  for (const box of state.uiBoxes) {
    if (mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
      if (box.action === 'tab') {
        state.inventoryTab = box.value;
        return;
      }

      if (box.action === 'stat') {
        investStat(box.value);
        return;
      }

      if (box.action === 'item') {
        state.selectedInventoryIndex = box.value;

        if (box.doubleAction === 'equip') {
          equipItem(box.value);
        }

        return;
      }

      if (box.action === 'quick') {
        assignQuickSlot(box.value);
        return;
      }
    }
  }
});

function interact() {
  if (state.dialogue) {
    state.dialogue = null;
    return;
  }

  const p = state.player;

  for (const portal of state.portals) {
    if (Math.abs(p.x - (portal.x + portal.w / 2)) < 82) {
      setupScene(portal.to);
      p.x = portal.to === 'town' ? 2760 : 190;
      p.y = state.groundY;
      p.vx = 0;
      p.vy = 0;

      toast(`${portal.label} 이동`, p.x, p.y - 100, '#c0eb75');
      return;
    }
  }

  const npc = state.npcs.find(item => Math.abs(item.x - p.x) < 92);

  if (npc) openNpc(npc);
}

function openNpc(npc) {
  const p = state.player;
  let lines = npc.text.slice();

  if (npc.quest === 'slime_intro') {
    const quest = p.quests.slime_intro;

    if (!quest) {
      p.quests.slime_intro = { status: 'active', killed: 0, need: 5 };
      lines.push('퀘스트 시작: 슬라임 5마리 처치');
    } else if (quest.status === 'active' && quest.killed >= quest.need) {
      quest.status = 'done';
      gainExp(80);
      p.gold += 150;

      if (!p.unlockedSkills.includes('flare')) {
        p.unlockedSkills.push('flare');
      }

      lines = [
        '훌륭하군! 이제 불꽃을 다룰 자격이 생겼네.',
        '보상: EXP 80, 150 메소, K 화염파 해금!'
      ];
    } else if (quest.status === 'active') {
      lines.push(`진행도: ${quest.killed}/${quest.need}`);
    } else {
      lines = [
        '좋은 흐름이네.',
        '더 강해지면 새로운 기술도 익히게 될 걸세.'
      ];
    }
  }

  state.dialogue = {
    name: npc.name,
    lines
  };
}

function punch() {
  const p = state.player;

  if (p.attackCd > 0 || state.dialogue || state.inventoryOpen) return;

  if (p.comboWindow > 0) p.comboStep = (p.comboStep + 1) % 3;
  else p.comboStep = 0;

  p.comboWindow = 0.42;
  p.attackCd = 0.2;
  p.anim = 'punch';
  p.animTime = 0;

  const dir = p.face;
  const power = calcPower(p, 'physical');
  const crit = Math.random() * 100 < calcCritRate(p);
  const mult = crit ? 1.8 : 1;
  const damage = Math.floor((12 + power * 0.38 + p.comboStep * 5) * mult);

  spawnPlayerHitbox({
    x: p.x + dir * 44,
    y: p.y - 72,
    w: 62,
    h: 46,
    life: 0.1,
    damage,
    owner: 'player',
    kind: crit ? 'crit' : 'punch'
  });

  if (crit) {
    text('CRITICAL!', p.x + dir * 36, p.y - 128, '#ffe066', 20);
  }

  arcEffect(p.x + dir * 42, p.y - 76, dir, 34 + p.comboStep * 8, '#fff3bf', '#ff922b', 0.18, -0.65, 0.75);
}

function castSkill1() {
  const p = state.player;

  if (!p.unlockedSkills.includes('flare') && p.level < 2) {
    toast('레벨 2부터 화염파를 사용할 수 있습니다', p.x, p.y - 110, '#ffd43b');
    return;
  }

  if (p.skillCd > 0 || p.mp < 12 || state.dialogue || state.inventoryOpen) return;

  p.mp -= 12;
  p.skillCd = 0.85;
  p.anim = 'cast';
  p.animTime = 0;

  const dir = p.face;
  const type = getJob(p).id === 'mage' ? 'magic' : 'physical';
  const damage = Math.floor(30 + calcPower(p, type) * 0.65);

  spawnPlayerHitbox({
    x: p.x + dir * 120,
    y: p.y - 105,
    w: 190,
    h: 90,
    life: 0.2,
    damage,
    owner: 'player',
    kind: 'flare'
  });

  fireWave(p.x + dir * 30, p.y - 74, dir, '#ff6b00', '#ffd43b', 0.42);

  for (let i = 0; i < 24; i++) {
    spark(
      p.x + dir * rand(8, 110),
      p.y - rand(40, 110),
      i % 2 ? '#ff922b' : '#ffd43b',
      dir * rand(80, 240),
      rand(-170, 40),
      rand(2, 5),
      rand(0.25, 0.7)
    );
  }
}

function castSkill2() {
  const p = state.player;

  if (!p.unlockedSkills.includes('inferno') && p.level < 4) {
    toast('레벨 4부터 화염기둥을 사용할 수 있습니다', p.x, p.y - 110, '#ffd43b');
    return;
  }

  if (p.skill2Cd > 0 || p.mp < 24 || state.dialogue || state.inventoryOpen) return;

  p.mp -= 24;
  p.skill2Cd = 3.2;
  p.anim = 'cast';
  p.animTime = 0;

  const dir = p.face;
  const type = getJob(p).id === 'mage' ? 'magic' : 'physical';
  const damage = Math.floor(55 + calcPower(p, type) * 0.9);
  const x = p.x + dir * 130;

  spawnPlayerHitbox({
    x,
    y: p.y - 120,
    w: 130,
    h: 180,
    life: 0.35,
    damage,
    owner: 'player',
    kind: 'inferno'
  });

  infernoEffect(x, p.y - 150, '#ff6b00', '#ffe066', 0.55);
}

function spawnPlayerHitbox(opts) {
  state.hitboxes.push({
    used: false,
    ...opts
  });
}

function update(dt) {
  previewPulse += dt;

  if (!state.ready) return;

  const p = state.player;

  normalizePlayer(p);
  applyDerivedStats(p);

  p.animTime += dt;
  p.attackCd = Math.max(0, p.attackCd - dt);
  p.skillCd = Math.max(0, p.skillCd - dt);
  p.skill2Cd = Math.max(0, p.skill2Cd - dt);
  p.inv = Math.max(0, p.inv - dt);
  p.levelUp = Math.max(0, p.levelUp - dt);
  p.comboWindow = Math.max(0, p.comboWindow - dt);

  state.saveFlash = Math.max(0, state.saveFlash - dt);

  const canMove = !state.dialogue && !state.inventoryOpen;

  if (canMove) {
    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');

    if (left) {
      p.vx = -250;
      p.face = -1;
    } else if (right) {
      p.vx = 250;
      p.face = 1;
    } else {
      p.vx *= Math.pow(0.001, dt);
    }

    if ((keys.has(' ') || keys.has('arrowup')) && p.grounded) {
      p.vy = -560;
      p.grounded = false;
      p.anim = 'jump';
      p.animTime = 0;
    }

    if (p.attackCd <= 0.1 && p.skillCd <= 0.2) {
      p.x += p.vx * dt;
    }
  } else {
    p.vx *= Math.pow(0.001, dt);
  }

  const prevY = p.y;

  p.vy += 1550 * dt;
  p.y += p.vy * dt;

  p.grounded = false;

  if (p.y >= state.groundY) {
    p.y = state.groundY;
    p.vy = 0;
    p.grounded = true;
  }

  if (p.vy >= 0) {
    for (const platform of state.platforms) {
      const withinX = p.x > platform.x && p.x < platform.x + platform.w;
      const crossed = prevY <= platform.y && p.y >= platform.y;

      if (withinX && crossed) {
        p.y = platform.y;
        p.vy = 0;
        p.grounded = true;
        break;
      }
    }
  }

  p.x = clamp(p.x, 80, state.sceneWidth - 80);

  if (p.anim !== 'punch' && p.anim !== 'cast') {
    p.anim = !p.grounded ? 'jump' : Math.abs(p.vx) > 30 ? 'run' : 'idle';
  }

  if (p.anim === 'punch' && p.attackCd <= 0.02) p.anim = 'idle';
  if (p.anim === 'cast' && p.skillCd <= 0.1 && p.skill2Cd <= 2.7) p.anim = 'idle';

  p.mp = Math.min(p.maxMp, p.mp + dt * 4);

  updateHitboxes(dt);
  updateMonsters(dt);
  updateParticles(dt);

  cameraX += (
    clamp(p.x - W * 0.42, 0, state.sceneWidth - W) - cameraX
  ) * Math.min(1, dt * 7);
}

function updateHitboxes(dt) {
  for (const hb of state.hitboxes) {
    hb.life -= dt;
  }

  for (const hb of state.hitboxes) {
    if (hb.owner !== 'player' || hb.used) continue;

    for (const m of state.monsters) {
      if (m.dead) continue;

      if (
        rects(
          hb.x - hb.w / 2,
          hb.y - hb.h / 2,
          hb.w,
          hb.h,
          m.x - m.w / 2,
          m.y - m.h,
          m.w,
          m.h
        )
      ) {
        hb.used = true;
        m.hp -= hb.damage;
        m.hit = 0.22;
        m.x += state.player.face * 18;

        text(`-${hb.damage}`, m.x, m.y - m.h - 16, '#ff6b6b', 20);

        for (let i = 0; i < 12; i++) {
          spark(
            m.x + rand(-15, 15),
            m.y - rand(12, m.h),
            hb.kind === 'inferno' || hb.kind === 'flare' ? '#ff922b' : '#ffffff',
            rand(-120, 120),
            rand(-160, 30),
            rand(2, 5),
            rand(0.2, 0.6)
          );
        }

        if (m.hp <= 0) killMonster(m);

        break;
      }
    }
  }

  state.hitboxes = state.hitboxes.filter(hb => hb.life > 0);
}

function updateMonsters(dt) {
  if (state.scene !== 'field') return;

  const p = state.player;

  for (const m of state.monsters) {
    m.animTime += dt;
    m.hit = Math.max(0, m.hit - dt);

    if (m.dead) {
      m.respawn -= dt;

      if (m.respawn <= 0) {
        m.dead = false;
        m.hp = m.maxHp;
        m.x = rand(400, state.sceneWidth - 250);
      }

      continue;
    }

    if (m.ai === 'hop') {
      m.x += m.face * m.speed * dt;
      if (Math.random() < dt * 0.8 || m.x < 300 || m.x > state.sceneWidth - 180) m.face *= -1;
      if (Math.abs(m.x - p.x) < 36 && p.inv <= 0) damagePlayer(8);
    }

    if (m.ai === 'walk') {
      m.x += m.face * m.speed * dt;
      if (Math.random() < dt * 0.45 || m.x < 350 || m.x > state.sceneWidth - 160) m.face *= -1;
      if (Math.abs(m.x - p.x) < 38 && p.inv <= 0) damagePlayer(10);
    }

    if (m.ai === 'float') {
      m.x += m.face * m.speed * dt;
      if (Math.random() < dt * 0.4 || m.x < 500 || m.x > state.sceneWidth - 180) m.face *= -1;
      if (Math.abs(m.x - p.x) < 42 && p.inv <= 0) damagePlayer(12);
    }

    if (m.ai === 'heavy') {
      const dist = p.x - m.x;

      if (Math.abs(dist) < 110) {
        m.face = dist > 0 ? 1 : -1;
        m.attackWindup = (m.attackWindup || 0) + dt;

        if (m.attackWindup > 0.7) {
          m.attackWindup = 0;
          enemySlashEffect(m.x + m.face * 20, m.y - 78, m.face, '#d8e2dc', '#adb5bd');

          if (Math.abs(dist) < 86 && p.inv <= 0) damagePlayer(18);
        }
      } else {
        m.attackWindup = 0;
        m.x += Math.sign(dist) * m.speed * dt;
      }
    }

    if (m.ai === 'dash') {
      const dist = p.x - m.x;
      m.face = dist > 0 ? 1 : -1;
      m.attackWindup = (m.attackWindup || 0) + dt;

      if (Math.abs(dist) > 90) {
        m.x += m.face * m.speed * dt;
      } else if (m.attackWindup > 1.1) {
        m.attackWindup = 0;
        enemySlashEffect(m.x + m.face * 18, m.y - 74, m.face, '#6c5ce7', '#2d1e57');
        m.x += m.face * 48;

        if (Math.abs(dist) < 88 && p.inv <= 0) damagePlayer(16);
      }
    }
  }
}

function damagePlayer(amount) {
  const p = state.player;

  p.hp = Math.max(1, p.hp - amount);
  p.inv = 0.8;

  text(`-${amount}`, p.x, p.y - 112, '#ff8787', 18);

  for (let i = 0; i < 8; i++) {
    spark(
      p.x + rand(-12, 12),
      p.y - rand(35, 95),
      '#ffd8d8',
      rand(-80, 80),
      rand(-140, 20),
      rand(2, 4),
      rand(0.2, 0.45)
    );
  }
}

function killMonster(m) {
  m.dead = true;
  m.respawn = 6;

  gainExp(m.exp);
  text(`EXP +${m.exp}`, m.x, m.y - m.h - 18, '#c0eb75', 18);

  const quest = state.player.quests.slime_intro;

  if (quest && quest.status === 'active' && m.type === 'slime') {
    quest.killed = Math.min(quest.need, quest.killed + 1);
  }
}

function gainExp(value) {
  const p = state.player;
  const before = p.level;

  p.exp += value;

  while (p.exp >= p.nextExp) {
    p.exp -= p.nextExp;
    p.level++;
    p.nextExp = Math.floor(p.nextExp * 1.35 + 40);

    p.statPoints += 5;

    p.maxHp += 18;
    p.maxMp += 10;
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    p.levelUp = 2.2;

    if (p.level >= 2 && !p.unlockedSkills.includes('flare')) {
      p.unlockedSkills.push('flare');
    }

    if (p.level >= 4 && !p.unlockedSkills.includes('inferno')) {
      p.unlockedSkills.push('inferno');
    }

    for (let i = 0; i < 60; i++) {
      spark(
        p.x + rand(-40, 40),
        p.y - rand(10, 120),
        i % 2 ? '#ffe066' : '#74c0fc',
        rand(-110, 110),
        rand(-260, -60),
        rand(2, 6),
        rand(0.35, 0.9)
      );
    }

    text('LEVEL UP!', p.x, p.y - 145, '#ffe066', 32);
  }

  if (p.level > before) {
    text(`AP +${(p.level - before) * 5}`, p.x, p.y - 170, '#b2f2bb', 22);
  }
}
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;

const auth = document.getElementById('auth');
const characterScreen = document.getElementById('characterScreen');
const characterMenu = document.getElementById('characterMenu');
const help = document.getElementById('hudHelp');
const authBtn = document.getElementById('authBtn');
const authMsg = document.getElementById('authMsg');
const nickMsg = document.getElementById('nickMsg');
const createMsg = document.getElementById('createMsg');
const preview = document.getElementById('preview');
const menuPreview = document.getElementById('menuPreview');

const pctx = preview.getContext('2d');
const mctx = menuPreview.getContext('2d');
pctx.imageSmoothingEnabled = false;
mctx.imageSmoothingEnabled = false;

if (help) {
  help.textContent = 'A/D 이동 · Space 점프 · J 기본공격 · K 화염파 · L 화염기둥 · M 인벤토리 · C 스탯 · Q 퀘스트 · 1~4 물약';
}

const JOBS = {
  beginner: {
    id: 'beginner',
    name: '초보자',
    desc: '모든 능력치가 무난하지만 전문성은 낮습니다.',
    main: 'str',
    color: '#4f9cff',
    weapon: 'glove',
    statRate: { str: 1.0, dex: 1.0, int: 1.0, luk: 1.0 }
  },
  warrior: {
    id: 'warrior',
    name: '전사',
    desc: 'STR 효율이 높고 HP가 높습니다. 근접 공격에 강합니다.',
    main: 'str',
    color: '#ff6b6b',
    weapon: 'sword',
    statRate: { str: 1.45, dex: 0.75, int: 0.25, luk: 0.55 }
  },
  mage: {
    id: 'mage',
    name: '마법사',
    desc: 'INT 효율이 높고 MP와 스킬 피해가 강합니다.',
    main: 'int',
    color: '#845ef7',
    weapon: 'wand',
    statRate: { str: 0.25, dex: 0.45, int: 1.55, luk: 0.75 }
  },
  thief: {
    id: 'thief',
    name: '도적',
    desc: 'LUK/DEX 효율이 높고 치명타와 회피가 좋습니다.',
    main: 'luk',
    color: '#51cf66',
    weapon: 'dagger',
    statRate: { str: 0.55, dex: 1.1, int: 0.35, luk: 1.35 }
  }
};

const keys = new Set();

let last = performance.now();
let cameraX = 0;
let token = localStorage.getItem('pixel-rpg-token') || '';
let loginMode = 'login';
let currentUser = null;
let nickTimer = null;
let previewPulse = 0;

let selected = {
  job: 'beginner',
  skin: '#ffd6a6',
  hair: '#5b2d16',
  outfit: '#4f9cff',
  accent: '#ffd43b'
};

const state = {
  ready: false,
  scene: 'town',
  sceneWidth: 3300,
  groundY: 548,
  particles: [],
  texts: [],
  hitboxes: [],
  portals: [],
  npcs: [],
  monsters: [],
  platforms: [],
  dialogue: null,
  inventoryOpen: false,
  inventoryTab: 'equip',
  questOpen: false,
  selectedInventoryIndex: null,
  uiBoxes: [],
  saveFlash: 0,
  player: defaultPlayer()
};

function defaultPlayer() {
  return {
    x: 260,
    y: 548,
    vx: 0,
    vy: 0,
    face: 1,
    grounded: true,
    anim: 'idle',
    animTime: 0,
    attackCd: 0,
    skillCd: 0,
    skill2Cd: 0,
    inv: 0,
    levelUp: 0,
    comboStep: 0,
    comboWindow: 0,

    level: 1,
    exp: 0,
    nextExp: 80,

    hp: 120,
    maxHp: 120,
    mp: 40,
    maxMp: 40,

    gold: 120,

    statPoints: 5,
    stats: {
      str: 6,
      dex: 6,
      int: 6,
      luk: 6
    },

    character: {
      name: '초보자',
      job: 'beginner',
      skin: '#ffd6a6',
      hair: '#5b2d16',
      outfit: '#4f9cff',
      accent: '#ffd43b'
    },

    unlockedSkills: [],
    quests: {},
    quickSlots: ['red_potion', 'blue_potion', null, null],
    equipped: {
      weapon: null,
      armor: null
    },
    inventory: [
      { id: 'red_potion', name: '체력 물약', type: 'consume', qty: 15, healHp: 60, icon: 'hp' },
      { id: 'blue_potion', name: '마나 물약', type: 'consume', qty: 12, healMp: 40, icon: 'mp' },
      { id: 'beginner_glove', name: '초보자 장갑', type: 'weapon', qty: 1, atk: 2, job: 'beginner', icon: 'glove' },
      { id: 'training_sword', name: '수련용 검', type: 'weapon', qty: 1, atk: 6, job: 'warrior', icon: 'sword' },
      { id: 'oak_wand', name: '참나무 완드', type: 'weapon', qty: 1, matk: 7, job: 'mage', icon: 'wand' },
      { id: 'practice_dagger', name: '연습용 단검', type: 'weapon', qty: 1, atk: 5, job: 'thief', icon: 'dagger' }
    ]
  };
}

async function api(path, body) {
  const response = await fetch(path, {
    method: body ? 'POST' : 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await response.json();

  if (!data.ok) {
    throw new Error(data.error || '요청 실패');
  }

  return data;
}

function hideAllPanels() {
  auth.classList.add('hidden');
  characterScreen.classList.add('hidden');
  characterMenu.classList.add('hidden');
  help.classList.add('hidden');
}

function showAuth() {
  state.ready = false;
  hideAllPanels();
  auth.classList.remove('hidden');
}

function showCreator() {
  state.ready = false;
  hideAllPanels();
  characterScreen.classList.remove('hidden');
  injectJobSelector();
  drawPreview();
}

function showCharacterMenu(save) {
  state.ready = false;
  hideAllPanels();
  characterMenu.classList.remove('hidden');

  document.getElementById('menuName').textContent =
    `${save.player.character.name}  Lv.${save.player.level}`;

  drawMenuPreview(save.player.character);
}

function startWithSave(save) {
  state.player = {
    ...defaultPlayer(),
    ...(save?.player || {})
  };

  normalizePlayer(state.player);
  applyDerivedStats(state.player);

  setupScene(state.player.scene || 'town');

  state.player.y = state.groundY;
  state.player.vx = 0;
  state.player.vy = 0;

  hideAllPanels();
  help.classList.remove('hidden');
  state.ready = true;

  toast(`${state.player.character.name}님, 모험을 시작합니다!`, state.player.x, state.player.y - 120, '#ffe066');
}

function setMode(mode) {
  loginMode = mode;

  document.getElementById('tabLogin').classList.toggle('active', mode === 'login');
  document.getElementById('tabRegister').classList.toggle('active', mode === 'register');

  authBtn.textContent = mode === 'login' ? '로그인' : '회원가입';
  authMsg.textContent = '';
}

function injectJobSelector() {
  const creatorLeft = document.querySelector('.creator-left');
  if (!creatorLeft || document.getElementById('jobSelectBox')) return;

  const box = document.createElement('div');
  box.id = 'jobSelectBox';
  box.style.margin = '12px 0';
  box.innerHTML = `
    <p style="margin:8px 0 6px;color:#ffe082;font-weight:900;">직업 선택</p>
    <div class="job-buttons" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
      <button class="job-btn active" data-job="beginner">초보자</button>
      <button class="job-btn" data-job="warrior">전사</button>
      <button class="job-btn" data-job="mage">마법사</button>
      <button class="job-btn" data-job="thief">도적</button>
    </div>
    <p id="jobDesc" style="font-size:13px;color:#d6e4ff;margin:8px 0 0;">
      모든 능력치가 무난하지만 전문성은 낮습니다.
    </p>
  `;

  const startBtn = document.getElementById('startNewBtn');
  creatorLeft.insertBefore(box, startBtn);

  document.querySelectorAll('.job-btn').forEach(btn => {
    btn.style.border = '0';
    btn.style.borderRadius = '10px';
    btn.style.padding = '10px';
    btn.style.fontWeight = '900';
    btn.style.cursor = 'pointer';
    btn.style.background = '#263346';
    btn.style.color = '#fff';

    btn.onclick = () => {
      selected.job = btn.dataset.job;

      document.querySelectorAll('.job-btn').forEach(item => {
        item.classList.remove('active');
        item.style.background = '#263346';
      });

      btn.classList.add('active');
      btn.style.background = `linear-gradient(${JOBS[selected.job].color}, #1971c2)`;

      document.getElementById('jobDesc').textContent = JOBS[selected.job].desc;

      drawPreview();
    };
  });
}

document.getElementById('tabLogin').onclick = () => setMode('login');
document.getElementById('tabRegister').onclick = () => setMode('register');
authBtn.onclick = submitAuth;
document.getElementById('startNewBtn').onclick = createCharacterAndStart;
document.getElementById('continueBtn').onclick = () => startWithSave(currentUser.save);
document.getElementById('logoutBtn').onclick = logout;
document.getElementById('logoutBtn2').onclick = logout;

document.getElementById('charName').addEventListener('input', () => {
  drawPreview();
  checkNicknameSoon();
});

document.querySelectorAll('.swatches').forEach(group => {
  group.querySelectorAll('span').forEach(span => {
    span.onclick = () => {
      selected[group.dataset.target] = rgbToHex(span.style.backgroundColor);

      group.querySelectorAll('span').forEach(item => item.classList.remove('selected'));
      span.classList.add('selected');

      drawPreview();
    };
  });

  const first = group.querySelector('span');
  if (first) first.classList.add('selected');
});

async function submitAuth() {
  try {
    authMsg.textContent = '';

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const data = await api(
      loginMode === 'login' ? '/api/login' : '/api/register',
      { username, password }
    );

    token = data.token;
    localStorage.setItem('pixel-rpg-token', token);

    currentUser = data.user;

    if (currentUser.hasCharacter && currentUser.save) {
      showCharacterMenu(currentUser.save);
    } else {
      showCreator();
    }
  } catch (err) {
    authMsg.textContent = err.message;
  }
}

async function checkNicknameSoon() {
  clearTimeout(nickTimer);

  nickTimer = setTimeout(async () => {
    const nickname = document.getElementById('charName').value.trim();

    if (nickname.length < 2) {
      nickMsg.className = 'nick-msg bad';
      nickMsg.textContent = '닉네임은 2자 이상이어야 합니다.';
      return;
    }

    try {
      await api('/api/check-nickname', { nickname });
      nickMsg.className = 'nick-msg ok';
      nickMsg.textContent = '사용 가능한 닉네임입니다.';
    } catch (err) {
      nickMsg.className = 'nick-msg bad';
      nickMsg.textContent = err.message;
    }
  }, 250);
}

async function createCharacterAndStart() {
  try {
    createMsg.textContent = '';

    const character = {
      name: document.getElementById('charName').value.trim(),
      job: selected.job || 'beginner',
      skin: selected.skin,
      hair: selected.hair,
      outfit: selected.outfit,
      accent: selected.accent
    };

    const data = await api('/api/create-character', { character });

    currentUser = data.user;
    startWithSave(currentUser.save);
  } catch (err) {
    createMsg.textContent = err.message;
  }
}

async function boot() {
  setMode('login');
  setupScene('town');
  drawPreview();

  if (!token) {
    showAuth();
    return;
  }

  try {
    const data = await api('/api/profile');
    currentUser = data.user;

    if (currentUser.hasCharacter && currentUser.save) {
      showCharacterMenu(currentUser.save);
    } else {
      showCreator();
    }
  } catch {
    localStorage.removeItem('pixel-rpg-token');
    token = '';
    showAuth();
  }
}

async function logout() {
  try {
    await api('/api/logout', {});
  } catch {}

  token = '';
  currentUser = null;

  localStorage.removeItem('pixel-rpg-token');
  showAuth();
}

async function saveGame() {
  if (!state.ready) return;

  normalizePlayer(state.player);
  applyDerivedStats(state.player);

  const save = {
    player: pick(state.player, [
      'character',
      'scene',
      'x',
      'y',
      'level',
      'exp',
      'nextExp',
      'hp',
      'maxHp',
      'mp',
      'maxMp',
      'gold',
      'statPoints',
      'stats',
      'unlockedSkills',
      'quests',
      'inventory',
      'quickSlots',
      'equipped'
    ])
  };

  try {
    const data = await api('/api/save', save);

    currentUser = {
      ...(currentUser || {}),
      save,
      savedAt: data.savedAt,
      hasCharacter: true
    };

    state.saveFlash = 1;
    toast('서버 저장 완료', state.player.x, state.player.y - 110, '#9bf6ff');
  } catch {
    toast('저장 실패', state.player.x, state.player.y - 110, '#ff8787');
  }
}

function pick(obj, keys) {
  return Object.fromEntries(keys.map(key => [key, obj[key]]));
}

function normalizePlayer(player) {
  if (!player.character) player.character = defaultPlayer().character;
  if (!player.character.job) player.character.job = 'beginner';

  const job = player.character.job;

  if (!player.stats) {
    player.stats = {
      str: job === 'warrior' ? 12 : 6,
      dex: job === 'thief' ? 12 : 6,
      int: job === 'mage' ? 12 : 6,
      luk: job === 'thief' ? 10 : 6
    };
  }

  if (typeof player.statPoints !== 'number') player.statPoints = 0;
  if (!player.quickSlots) player.quickSlots = ['red_potion', 'blue_potion', null, null];
  if (!player.equipped) player.equipped = { weapon: null, armor: null };
  if (!player.inventory) player.inventory = [];

  const requiredItems = [
    { id: 'red_potion', name: '체력 물약', type: 'consume', qty: 15, healHp: 60, icon: 'hp' },
    { id: 'blue_potion', name: '마나 물약', type: 'consume', qty: 12, healMp: 40, icon: 'mp' },
    { id: 'beginner_glove', name: '초보자 장갑', type: 'weapon', qty: 1, atk: 2, job: 'beginner', icon: 'glove' },
    { id: 'training_sword', name: '수련용 검', type: 'weapon', qty: 1, atk: 6, job: 'warrior', icon: 'sword' },
    { id: 'oak_wand', name: '참나무 완드', type: 'weapon', qty: 1, matk: 7, job: 'mage', icon: 'wand' },
    { id: 'practice_dagger', name: '연습용 단검', type: 'weapon', qty: 1, atk: 5, job: 'thief', icon: 'dagger' }
  ];

  for (const item of requiredItems) {
    const found = player.inventory.find(inv => inv.id === item.id);

    if (!found) {
      player.inventory.push({ ...item });
    }
  }
}

function getJob(player = state.player) {
  return JOBS[player.character?.job || 'beginner'] || JOBS.beginner;
}

function getEquippedWeapon(player = state.player) {
  if (!player.equipped?.weapon) return null;
  return player.inventory.find(item => item.id === player.equipped.weapon) || null;
}

function applyDerivedStats(player = state.player) {
  normalizePlayer(player);

  const job = getJob(player);
  const s = player.stats;

  const hpBonus = Math.floor(s.str * (job.id === 'warrior' ? 4.5 : 2.2));
  const mpBonus = Math.floor(s.int * (job.id === 'mage' ? 4.8 : 1.7));

  player.maxHp = 110 + player.level * 12 + hpBonus;
  player.maxMp = 35 + player.level * 8 + mpBonus;

  player.hp = Math.min(player.hp, player.maxHp);
  player.mp = Math.min(player.mp, player.maxMp);
}

function calcPower(player = state.player, type = 'physical') {
  normalizePlayer(player);

  const job = getJob(player);
  const s = player.stats;
  const weapon = getEquippedWeapon(player);

  const weaponAtk = weapon?.atk || 0;
  const weaponMatk = weapon?.matk || 0;

  const physical =
    s.str * job.statRate.str * 1.15 +
    s.dex * job.statRate.dex * 0.65 +
    s.luk * job.statRate.luk * 0.45 +
    weaponAtk * 4 +
    player.level * 3;

  const magical =
    s.int * job.statRate.int * 1.35 +
    s.luk * job.statRate.luk * 0.45 +
    weaponMatk * 4 +
    player.level * 3;

  if (type === 'magic') return Math.floor(magical);
  return Math.floor(physical);
}

function calcCritRate(player = state.player) {
  const s = player.stats || {};
  const job = getJob(player);

  let rate = 5 + (s.luk || 0) * 0.15 + (s.dex || 0) * 0.05;

  if (job.id === 'thief') rate += 8;

  return clamp(rate, 0, 45);
}

function investStat(stat) {
  const p = state.player;

  normalizePlayer(p);

  if (p.statPoints <= 0) return;
  if (!['str', 'dex', 'int', 'luk'].includes(stat)) return;

  p.stats[stat]++;
  p.statPoints--;

  applyDerivedStats(p);

  toast(`${stat.toUpperCase()} +1`, p.x, p.y - 125, '#ffe066');
}

function equipItem(index) {
  const p = state.player;
  const item = p.inventory[index];

  if (!item) return;

  const job = p.character?.job || 'beginner';

  if (item.type === 'weapon') {
    if (item.job && item.job !== 'beginner' && item.job !== job) {
      toast('현재 직업이 착용할 수 없습니다', p.x, p.y - 110, '#ff8787');
      return;
    }

    p.equipped.weapon = item.id;
    toast(`${item.name} 장착`, p.x, p.y - 110, '#b2f2bb');
  }
}

function assignQuickSlot(slotIndex) {
  const p = state.player;
  const item = p.inventory[state.selectedInventoryIndex];

  if (!item || item.type !== 'consume') {
    toast('소모품만 프리셋에 등록할 수 있습니다', p.x, p.y - 110, '#ffd43b');
    return;
  }

  p.quickSlots[slotIndex] = item.id;
  toast(`${slotIndex + 1}번 슬롯에 ${item.name} 등록`, p.x, p.y - 110, '#b2f2bb');
}

function useQuickSlot(slotIndex) {
  const p = state.player;

  normalizePlayer(p);

  const itemId = p.quickSlots[slotIndex];
  if (!itemId) return;

  const item = p.inventory.find(inv => inv.id === itemId);

  if (!item || item.qty <= 0) {
    toast('아이템이 없습니다', p.x, p.y - 110, '#ff8787');
    return;
  }

  if (item.healHp) {
    if (p.hp >= p.maxHp) {
      toast('HP가 이미 가득 찼습니다', p.x, p.y - 110, '#ffd43b');
      return;
    }

    p.hp = Math.min(p.maxHp, p.hp + item.healHp);
    item.qty--;
    toast(`HP +${item.healHp}`, p.x, p.y - 110, '#ff8787');
  }

  if (item.healMp) {
    if (p.mp >= p.maxMp) {
      toast('MP가 이미 가득 찼습니다', p.x, p.y - 110, '#ffd43b');
      return;
    }

    p.mp = Math.min(p.maxMp, p.mp + item.healMp);
    item.qty--;
    toast(`MP +${item.healMp}`, p.x, p.y - 110, '#74c0fc');
  }
}

function setupScene(scene) {
  state.scene = scene;
  state.particles = [];
  state.texts = [];
  state.hitboxes = [];
  state.monsters = [];
  state.dialogue = null;
  state.platforms = [];

  if (scene === 'town') {
    state.sceneWidth = 3300;
    state.groundY = 548;

    state.platforms = [
      { x: 220, y: 466, w: 380, h: 18 },
      { x: 650, y: 430, w: 360, h: 18 },
      { x: 1090, y: 486, w: 320, h: 18 },
      { x: 1500, y: 438, w: 420, h: 18 },
      { x: 2050, y: 470, w: 360, h: 18 }
    ];

    state.portals = [
      { x: 2860, y: state.groundY - 105, w: 74, h: 110, to: 'field', label: '수련의 숲' }
    ];

    state.npcs = [
      {
        id: 'elder',
        name: '장로 구름',
        x: 620,
        y: state.groundY,
        palette: { skin: '#ffe0bd', hair: '#d5d8dc', outfit: '#4c6ef5', accent: '#ffd43b' },
        text: ['어서 오게, 신입 모험가여.', '동쪽 포탈로 나가 슬라임 5마리를 처치해 보게.'],
        quest: 'slime_intro'
      },
      {
        id: 'trainer',
        name: '직업 교관',
        x: 1080,
        y: state.groundY,
        palette: { skin: '#f4c28a', hair: '#5b2d16', outfit: '#ff6b6b', accent: '#ffd43b' },
        text: ['직업마다 스탯 효율이 다르다.', '전사 STR, 마법사 INT, 도적 LUK/DEX가 핵심이다.']
      },
      {
        id: 'smith',
        name: '대장장이 단단',
        x: 1450,
        y: state.groundY,
        palette: { skin: '#f4c28a', hair: '#6b4f2d', outfit: '#6c584c', accent: '#ff922b' },
        text: ['M키로 장비와 아이템을 확인할 수 있다네.', '아이템을 클릭하고 퀵슬롯을 클릭하면 프리셋 등록이 된다네.']
      },
      {
        id: 'mage',
        name: '루나',
        x: 1850,
        y: state.groundY,
        palette: { skin: '#ffe0c7', hair: '#845ef7', outfit: '#20c997', accent: '#74c0fc' },
        text: ['Q키로 퀘스트 창을 열 수 있어.', 'C키를 누르면 바로 스탯 창을 볼 수 있어.']
      }
    ];
  } else {
    state.sceneWidth = 4400;
    state.groundY = 566;

    state.platforms = [
      { x: 480, y: 482, w: 320, h: 18 },
      { x: 1050, y: 430, w: 280, h: 18 },
      { x: 1580, y: 500, w: 320, h: 18 },
      { x: 2450, y: 450, w: 360, h: 18 }
    ];

    state.portals = [
      { x: 110, y: state.groundY - 105, w: 74, h: 110, to: 'town', label: '초보자 마을' }
    ];

    state.npcs = [];
    spawnMonsters();
  }

  state.player.scene = scene;
}

function spawnMonsters() {
  const ground = state.groundY;

  state.monsters = [
    ...Array.from({ length: 8 }, (_, i) => ({
      type: 'slime',
      x: 500 + i * 170,
      y: ground,
      face: Math.random() < 0.5 ? -1 : 1,
      hp: 42,
      maxHp: 42,
      exp: 18,
      dead: false,
      animTime: Math.random() * 3,
      hit: 0,
      ai: 'hop',
      speed: 40,
      respawn: 0,
      w: 40,
      h: 28
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      type: 'mushroom',
      x: 1000 + i * 260,
      y: ground,
      face: Math.random() < 0.5 ? -1 : 1,
      hp: 65,
      maxHp: 65,
      exp: 25,
      dead: false,
      animTime: Math.random() * 3,
      hit: 0,
      ai: 'walk',
      speed: 28,
      respawn: 0,
      w: 46,
      h: 48
    })),
    ...Array.from({ length: 3 }, (_, i) => ({
      type: i % 2 ? 'frost_core' : 'ember_core',
      x: 2050 + i * 260,
      y: ground,
      face: Math.random() < 0.5 ? -1 : 1,
      hp: 95,
      maxHp: 95,
      exp: 38,
      dead: false,
      animTime: Math.random() * 3,
      hit: 0,
      ai: 'float',
      speed: 22,
      respawn: 0,
      w: 46,
      h: 54
    })),
    {
      type: 'ogre',
      x: 3100,
      y: ground,
      face: -1,
      hp: 180,
      maxHp: 180,
      exp: 70,
      dead: false,
      animTime: 0,
      hit: 0,
      ai: 'heavy',
      speed: 24,
      respawn: 0,
      w: 64,
      h: 88,
      attackWindup: 0
    },
    {
      type: 'ghoul',
      x: 3620,
      y: ground,
      face: -1,
      hp: 150,
      maxHp: 150,
      exp: 60,
      dead: false,
      animTime: 0,
      hit: 0,
      ai: 'dash',
      speed: 38,
      respawn: 0,
      w: 54,
      h: 82,
      attackWindup: 0
    }
  ];
}

addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  keys.add(key);

  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    event.preventDefault();
  }

  if (!state.ready) return;

  if (key === 'm') state.inventoryOpen = !state.inventoryOpen;
  if (key === 'c') {
    state.inventoryOpen = true;
    state.inventoryTab = 'stat';
  }
  if (key === 'q') state.questOpen = !state.questOpen;
  if (key === 'e') interact();
  if (key === 's') saveGame();
  if (key === 'j') punch();
  if (key === 'k') castSkill1();
  if (key === 'l') castSkill2();

  if (key === '1') useQuickSlot(0);
  if (key === '2') useQuickSlot(1);
  if (key === '3') useQuickSlot(2);
  if (key === '4') useQuickSlot(3);
});

addEventListener('keyup', event => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener('click', event => {
  if (!state.ready) return;

  const rect = canvas.getBoundingClientRect();
  const mx = (event.clientX - rect.left) * (canvas.width / rect.width);
  const my = (event.clientY - rect.top) * (canvas.height / rect.height);

  for (const box of state.uiBoxes) {
    if (mx >= box.x && mx <= box.x + box.w && my >= box.y && my <= box.y + box.h) {
      if (box.action === 'tab') {
        state.inventoryTab = box.value;
        return;
      }

      if (box.action === 'stat') {
        investStat(box.value);
        return;
      }

      if (box.action === 'item') {
        state.selectedInventoryIndex = box.value;

        if (box.doubleAction === 'equip') {
          equipItem(box.value);
        }

        return;
      }

      if (box.action === 'quick') {
        assignQuickSlot(box.value);
        return;
      }
    }
  }
});

function interact() {
  if (state.dialogue) {
    state.dialogue = null;
    return;
  }

  const p = state.player;

  for (const portal of state.portals) {
    if (Math.abs(p.x - (portal.x + portal.w / 2)) < 82) {
      setupScene(portal.to);
      p.x = portal.to === 'town' ? 2760 : 190;
      p.y = state.groundY;
      p.vx = 0;
      p.vy = 0;

      toast(`${portal.label} 이동`, p.x, p.y - 100, '#c0eb75');
      return;
    }
  }

  const npc = state.npcs.find(item => Math.abs(item.x - p.x) < 92);

  if (npc) openNpc(npc);
}

function openNpc(npc) {
  const p = state.player;
  let lines = npc.text.slice();

  if (npc.quest === 'slime_intro') {
    const quest = p.quests.slime_intro;

    if (!quest) {
      p.quests.slime_intro = { status: 'active', killed: 0, need: 5 };
      lines.push('퀘스트 시작: 슬라임 5마리 처치');
    } else if (quest.status === 'active' && quest.killed >= quest.need) {
      quest.status = 'done';
      gainExp(80);
      p.gold += 150;

      if (!p.unlockedSkills.includes('flare')) {
        p.unlockedSkills.push('flare');
      }

      lines = [
        '훌륭하군! 이제 불꽃을 다룰 자격이 생겼네.',
        '보상: EXP 80, 150 메소, K 화염파 해금!'
      ];
    } else if (quest.status === 'active') {
      lines.push(`진행도: ${quest.killed}/${quest.need}`);
    } else {
      lines = [
        '좋은 흐름이네.',
        '더 강해지면 새로운 기술도 익히게 될 걸세.'
      ];
    }
  }

  state.dialogue = {
    name: npc.name,
    lines
  };
}

function punch() {
  const p = state.player;

  if (p.attackCd > 0 || state.dialogue || state.inventoryOpen) return;

  if (p.comboWindow > 0) p.comboStep = (p.comboStep + 1) % 3;
  else p.comboStep = 0;

  p.comboWindow = 0.42;
  p.attackCd = 0.2;
  p.anim = 'punch';
  p.animTime = 0;

  const dir = p.face;
  const power = calcPower(p, 'physical');
  const crit = Math.random() * 100 < calcCritRate(p);
  const mult = crit ? 1.8 : 1;
  const damage = Math.floor((12 + power * 0.38 + p.comboStep * 5) * mult);

  spawnPlayerHitbox({
    x: p.x + dir * 44,
    y: p.y - 72,
    w: 62,
    h: 46,
    life: 0.1,
    damage,
    owner: 'player',
    kind: crit ? 'crit' : 'punch'
  });

  if (crit) {
    text('CRITICAL!', p.x + dir * 36, p.y - 128, '#ffe066', 20);
  }

  arcEffect(p.x + dir * 42, p.y - 76, dir, 34 + p.comboStep * 8, '#fff3bf', '#ff922b', 0.18, -0.65, 0.75);
}

function castSkill1() {
  const p = state.player;

  if (!p.unlockedSkills.includes('flare') && p.level < 2) {
    toast('레벨 2부터 화염파를 사용할 수 있습니다', p.x, p.y - 110, '#ffd43b');
    return;
  }

  if (p.skillCd > 0 || p.mp < 12 || state.dialogue || state.inventoryOpen) return;

  p.mp -= 12;
  p.skillCd = 0.85;
  p.anim = 'cast';
  p.animTime = 0;

  const dir = p.face;
  const type = getJob(p).id === 'mage' ? 'magic' : 'physical';
  const damage = Math.floor(30 + calcPower(p, type) * 0.65);

  spawnPlayerHitbox({
    x: p.x + dir * 120,
    y: p.y - 105,
    w: 190,
    h: 90,
    life: 0.2,
    damage,
    owner: 'player',
    kind: 'flare'
  });

  fireWave(p.x + dir * 30, p.y - 74, dir, '#ff6b00', '#ffd43b', 0.42);

  for (let i = 0; i < 24; i++) {
    spark(
      p.x + dir * rand(8, 110),
      p.y - rand(40, 110),
      i % 2 ? '#ff922b' : '#ffd43b',
      dir * rand(80, 240),
      rand(-170, 40),
      rand(2, 5),
      rand(0.25, 0.7)
    );
  }
}

function castSkill2() {
  const p = state.player;

  if (!p.unlockedSkills.includes('inferno') && p.level < 4) {
    toast('레벨 4부터 화염기둥을 사용할 수 있습니다', p.x, p.y - 110, '#ffd43b');
    return;
  }

  if (p.skill2Cd > 0 || p.mp < 24 || state.dialogue || state.inventoryOpen) return;

  p.mp -= 24;
  p.skill2Cd = 3.2;
  p.anim = 'cast';
  p.animTime = 0;

  const dir = p.face;
  const type = getJob(p).id === 'mage' ? 'magic' : 'physical';
  const damage = Math.floor(55 + calcPower(p, type) * 0.9);
  const x = p.x + dir * 130;

  spawnPlayerHitbox({
    x,
    y: p.y - 120,
    w: 130,
    h: 180,
    life: 0.35,
    damage,
    owner: 'player',
    kind: 'inferno'
  });

  infernoEffect(x, p.y - 150, '#ff6b00', '#ffe066', 0.55);
}

function spawnPlayerHitbox(opts) {
  state.hitboxes.push({
    used: false,
    ...opts
  });
}

function update(dt) {
  previewPulse += dt;

  if (!state.ready) return;

  const p = state.player;

  normalizePlayer(p);
  applyDerivedStats(p);

  p.animTime += dt;
  p.attackCd = Math.max(0, p.attackCd - dt);
  p.skillCd = Math.max(0, p.skillCd - dt);
  p.skill2Cd = Math.max(0, p.skill2Cd - dt);
  p.inv = Math.max(0, p.inv - dt);
  p.levelUp = Math.max(0, p.levelUp - dt);
  p.comboWindow = Math.max(0, p.comboWindow - dt);

  state.saveFlash = Math.max(0, state.saveFlash - dt);

  const canMove = !state.dialogue && !state.inventoryOpen;

  if (canMove) {
    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');

    if (left) {
      p.vx = -250;
      p.face = -1;
    } else if (right) {
      p.vx = 250;
      p.face = 1;
    } else {
      p.vx *= Math.pow(0.001, dt);
    }

    if ((keys.has(' ') || keys.has('arrowup')) && p.grounded) {
      p.vy = -560;
      p.grounded = false;
      p.anim = 'jump';
      p.animTime = 0;
    }

    if (p.attackCd <= 0.1 && p.skillCd <= 0.2) {
      p.x += p.vx * dt;
    }
  } else {
    p.vx *= Math.pow(0.001, dt);
  }

  const prevY = p.y;

  p.vy += 1550 * dt;
  p.y += p.vy * dt;

  p.grounded = false;

  if (p.y >= state.groundY) {
    p.y = state.groundY;
    p.vy = 0;
    p.grounded = true;
  }

  if (p.vy >= 0) {
    for (const platform of state.platforms) {
      const withinX = p.x > platform.x && p.x < platform.x + platform.w;
      const crossed = prevY <= platform.y && p.y >= platform.y;

      if (withinX && crossed) {
        p.y = platform.y;
        p.vy = 0;
        p.grounded = true;
        break;
      }
    }
  }

  p.x = clamp(p.x, 80, state.sceneWidth - 80);

  if (p.anim !== 'punch' && p.anim !== 'cast') {
    p.anim = !p.grounded ? 'jump' : Math.abs(p.vx) > 30 ? 'run' : 'idle';
  }

  if (p.anim === 'punch' && p.attackCd <= 0.02) p.anim = 'idle';
  if (p.anim === 'cast' && p.skillCd <= 0.1 && p.skill2Cd <= 2.7) p.anim = 'idle';

  p.mp = Math.min(p.maxMp, p.mp + dt * 4);

  updateHitboxes(dt);
  updateMonsters(dt);
  updateParticles(dt);

  cameraX += (
    clamp(p.x - W * 0.42, 0, state.sceneWidth - W) - cameraX
  ) * Math.min(1, dt * 7);
}

function updateHitboxes(dt) {
  for (const hb of state.hitboxes) {
    hb.life -= dt;
  }

  for (const hb of state.hitboxes) {
    if (hb.owner !== 'player' || hb.used) continue;

    for (const m of state.monsters) {
      if (m.dead) continue;

      if (
        rects(
          hb.x - hb.w / 2,
          hb.y - hb.h / 2,
          hb.w,
          hb.h,
          m.x - m.w / 2,
          m.y - m.h,
          m.w,
          m.h
        )
      ) {
        hb.used = true;
        m.hp -= hb.damage;
        m.hit = 0.22;
        m.x += state.player.face * 18;

        text(`-${hb.damage}`, m.x, m.y - m.h - 16, '#ff6b6b', 20);

        for (let i = 0; i < 12; i++) {
          spark(
            m.x + rand(-15, 15),
            m.y - rand(12, m.h),
            hb.kind === 'inferno' || hb.kind === 'flare' ? '#ff922b' : '#ffffff',
            rand(-120, 120),
            rand(-160, 30),
            rand(2, 5),
            rand(0.2, 0.6)
          );
        }

        if (m.hp <= 0) killMonster(m);

        break;
      }
    }
  }

  state.hitboxes = state.hitboxes.filter(hb => hb.life > 0);
}

function updateMonsters(dt) {
  if (state.scene !== 'field') return;

  const p = state.player;

  for (const m of state.monsters) {
    m.animTime += dt;
    m.hit = Math.max(0, m.hit - dt);

    if (m.dead) {
      m.respawn -= dt;

      if (m.respawn <= 0) {
        m.dead = false;
        m.hp = m.maxHp;
        m.x = rand(400, state.sceneWidth - 250);
      }

      continue;
    }

    if (m.ai === 'hop') {
      m.x += m.face * m.speed * dt;
      if (Math.random() < dt * 0.8 || m.x < 300 || m.x > state.sceneWidth - 180) m.face *= -1;
      if (Math.abs(m.x - p.x) < 36 && p.inv <= 0) damagePlayer(8);
    }

    if (m.ai === 'walk') {
      m.x += m.face * m.speed * dt;
      if (Math.random() < dt * 0.45 || m.x < 350 || m.x > state.sceneWidth - 160) m.face *= -1;
      if (Math.abs(m.x - p.x) < 38 && p.inv <= 0) damagePlayer(10);
    }

    if (m.ai === 'float') {
      m.x += m.face * m.speed * dt;
      if (Math.random() < dt * 0.4 || m.x < 500 || m.x > state.sceneWidth - 180) m.face *= -1;
      if (Math.abs(m.x - p.x) < 42 && p.inv <= 0) damagePlayer(12);
    }

    if (m.ai === 'heavy') {
      const dist = p.x - m.x;

      if (Math.abs(dist) < 110) {
        m.face = dist > 0 ? 1 : -1;
        m.attackWindup = (m.attackWindup || 0) + dt;

        if (m.attackWindup > 0.7) {
          m.attackWindup = 0;
          enemySlashEffect(m.x + m.face * 20, m.y - 78, m.face, '#d8e2dc', '#adb5bd');

          if (Math.abs(dist) < 86 && p.inv <= 0) damagePlayer(18);
        }
      } else {
        m.attackWindup = 0;
        m.x += Math.sign(dist) * m.speed * dt;
      }
    }

    if (m.ai === 'dash') {
      const dist = p.x - m.x;
      m.face = dist > 0 ? 1 : -1;
      m.attackWindup = (m.attackWindup || 0) + dt;

      if (Math.abs(dist) > 90) {
        m.x += m.face * m.speed * dt;
      } else if (m.attackWindup > 1.1) {
        m.attackWindup = 0;
        enemySlashEffect(m.x + m.face * 18, m.y - 74, m.face, '#6c5ce7', '#2d1e57');
        m.x += m.face * 48;

        if (Math.abs(dist) < 88 && p.inv <= 0) damagePlayer(16);
      }
    }
  }
}

function damagePlayer(amount) {
  const p = state.player;

  p.hp = Math.max(1, p.hp - amount);
  p.inv = 0.8;

  text(`-${amount}`, p.x, p.y - 112, '#ff8787', 18);

  for (let i = 0; i < 8; i++) {
    spark(
      p.x + rand(-12, 12),
      p.y - rand(35, 95),
      '#ffd8d8',
      rand(-80, 80),
      rand(-140, 20),
      rand(2, 4),
      rand(0.2, 0.45)
    );
  }
}

function killMonster(m) {
  m.dead = true;
  m.respawn = 6;

  gainExp(m.exp);
  text(`EXP +${m.exp}`, m.x, m.y - m.h - 18, '#c0eb75', 18);

  const quest = state.player.quests.slime_intro;

  if (quest && quest.status === 'active' && m.type === 'slime') {
    quest.killed = Math.min(quest.need, quest.killed + 1);
  }
}

function gainExp(value) {
  const p = state.player;
  const before = p.level;

  p.exp += value;

  while (p.exp >= p.nextExp) {
    p.exp -= p.nextExp;
    p.level++;
    p.nextExp = Math.floor(p.nextExp * 1.35 + 40);

    p.statPoints += 5;

    p.maxHp += 18;
    p.maxMp += 10;
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    p.levelUp = 2.2;

    if (p.level >= 2 && !p.unlockedSkills.includes('flare')) {
      p.unlockedSkills.push('flare');
    }

    if (p.level >= 4 && !p.unlockedSkills.includes('inferno')) {
      p.unlockedSkills.push('inferno');
    }

    for (let i = 0; i < 60; i++) {
      spark(
        p.x + rand(-40, 40),
        p.y - rand(10, 120),
        i % 2 ? '#ffe066' : '#74c0fc',
        rand(-110, 110),
        rand(-260, -60),
        rand(2, 6),
        rand(0.35, 0.9)
      );
    }

    text('LEVEL UP!', p.x, p.y - 145, '#ffe066', 32);
  }

  if (p.level > before) {
    text(`AP +${(p.level - before) * 5}`, p.x, p.y - 170, '#b2f2bb', 22);
  }
}
