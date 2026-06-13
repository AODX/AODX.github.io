const canvas = document.getElementById('game');

canvas.width = 1280;
canvas.height = 720;
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.display = 'block';

const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const W = 1280;
const H = 720;

console.log('[Pixel RPG] canvas fixed:', canvas.width, canvas.height);

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

const keys = new Set();
let last = performance.now();
let cameraX = 0;
let token = localStorage.getItem('pixel-rpg-token') || '';
let loginMode = 'login';
let currentUser = null;
let nickTimer = null;
let previewPulse = 0;

const JOBS = {
  beginner: {
    id: 'beginner',
    name: '초보자',
    desc: '아직 전직하지 않은 모험가입니다.',
    color: '#4f9cff',
    statRate: { str: 1, dex: 1, int: 1, luk: 1 }
  },
  warrior: {
    id: 'warrior',
    name: '전사',
    desc: 'STR 효율이 높은 근접 직업입니다.',
    color: '#ff6b6b',
    statRate: { str: 1.45, dex: 0.75, int: 0.25, luk: 0.55 }
  },
  mage: {
    id: 'mage',
    name: '마법사',
    desc: 'INT 효율이 높은 마법 직업입니다.',
    color: '#845ef7',
    statRate: { str: 0.25, dex: 0.45, int: 1.55, luk: 0.75 }
  },
  thief: {
    id: 'thief',
    name: '도적',
    desc: 'LUK/DEX 효율이 높은 민첩 직업입니다.',
    color: '#51cf66',
    statRate: { str: 0.55, dex: 1.1, int: 0.35, luk: 1.35 }
  }
};

let selected = {
  skin: '#ffd6a6',
  hair: '#2b160e',
  hairStyle: 'basic',
  faceStyle: 'normal'
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
      hair: '#2b160e',
      hairStyle: 'basic',
      faceStyle: 'normal'
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
      { id: 'beginner_glove', name: '초보자 장갑', type: 'weapon', qty: 1, atk: 2, job: 'beginner', icon: 'glove' }
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

document.querySelectorAll('#hairStyleChoices .choice').forEach(button => {
  button.onclick = () => {
    selected.hairStyle = button.dataset.value;
    document.querySelectorAll('#hairStyleChoices .choice').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    drawPreview();
  };
});

document.querySelectorAll('#faceStyleChoices .choice').forEach(button => {
  button.onclick = () => {
    selected.faceStyle = button.dataset.value;
    document.querySelectorAll('#faceStyleChoices .choice').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    drawPreview();
  };
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
      job: 'beginner',
      skin: selected.skin,
      hair: selected.hair,
      hairStyle: selected.hairStyle,
      faceStyle: selected.faceStyle
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
  if (!player.character.skin) player.character.skin = '#ffd6a6';
  if (!player.character.hair) player.character.hair = '#2b160e';
  if (!player.character.hairStyle) player.character.hairStyle = 'basic';
  if (!player.character.faceStyle) player.character.faceStyle = 'normal';

  if (!player.stats) {
    player.stats = { str: 6, dex: 6, int: 6, luk: 6 };
  }

  if (typeof player.statPoints !== 'number') player.statPoints = 0;
  if (!player.quickSlots) player.quickSlots = ['red_potion', 'blue_potion', null, null];
  if (!player.equipped) player.equipped = { weapon: null, armor: null };
  if (!player.inventory) player.inventory = [];

  const requiredItems = [
    { id: 'red_potion', name: '체력 물약', type: 'consume', qty: 15, healHp: 60, icon: 'hp' },
    { id: 'blue_potion', name: '마나 물약', type: 'consume', qty: 12, healMp: 40, icon: 'mp' },
    { id: 'beginner_glove', name: '초보자 장갑', type: 'weapon', qty: 1, atk: 2, job: 'beginner', icon: 'glove' }
  ];

  for (const item of requiredItems) {
    const found = player.inventory.find(inv => inv.id === item.id);
    if (!found) player.inventory.push({ ...item });
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

  if (item.type === 'weapon') {
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
        palette: { skin: '#ffe0bd', hair: '#d5d8dc', hairStyle: 'bob', faceStyle: 'normal' },
        text: ['어서 오게, 신입 모험가여.', '동쪽 포탈로 나가 슬라임 5마리를 처치해 보게.'],
        quest: 'slime_intro'
      },
      {
        id: 'trainer',
        name: '직업 교관',
        x: 1080,
        y: state.groundY,
        palette: { skin: '#f4c28a', hair: '#5b2d16', hairStyle: 'spiky', faceStyle: 'cool' },
        text: ['지금은 모두 초보자로 시작한다.', '전직은 퀘스트를 완료한 뒤 진행하게 될 거다.']
      },
      {
        id: 'smith',
        name: '대장장이 단단',
        x: 1450,
        y: state.groundY,
        palette: { skin: '#f4c28a', hair: '#6b4f2d', hairStyle: 'short', faceStyle: 'angry' },
        text: ['M키로 장비와 아이템을 확인할 수 있다네.', '아이템을 클릭하고 퀵슬롯을 클릭하면 프리셋 등록이 된다네.']
      },
      {
        id: 'mage',
        name: '루나',
        x: 1850,
        y: state.groundY,
        palette: { skin: '#ffe0c7', hair: '#845ef7', hairStyle: 'wave', faceStyle: 'bright' },
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
    ...Array.from({ length: 5 }, (_, i) => ({
      type: 'mushroom',
      x: 1000 + i * 250,
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
    {
      type: 'ogre',
      x: 2950,
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
    }
  ];
}

function normalizeKey(event) {
  const rawKey = event.key || event.code || '';
  return String(rawKey).toLowerCase();
}

addEventListener('keydown', event => {
  const key = normalizeKey(event);
  if (!key) return;

  keys.add(key);

  if (
    key === ' ' ||
    key === 'space' ||
    key === 'spacebar' ||
    key === 'arrowup' ||
    key === 'arrowdown' ||
    key === 'arrowleft' ||
    key === 'arrowright'
  ) {
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
  const key = normalizeKey(event);
  if (!key) return;
  keys.delete(key);
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
        '보상: EXP 80, 150 메소, K 화염파 해금!',
        '전직 시스템은 다음 단계에서 이어서 열릴 예정이네.'
      ];
    } else if (quest.status === 'active') {
      lines.push(`진행도: ${quest.killed}/${quest.need}`);
    } else {
      lines = ['좋은 흐름이네.', '더 강해지면 전직 퀘스트도 열릴 걸세.'];
    }
  }

  state.dialogue = { name: npc.name, lines };
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

  if (crit) text('CRITICAL!', p.x + dir * 36, p.y - 128, '#ffe066', 20);
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
  const damage = Math.floor(30 + calcPower(p, 'physical') * 0.65);

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
  const damage = Math.floor(55 + calcPower(p, 'physical') * 0.9);
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
  state.hitboxes.push({ used: false, ...opts });
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
    const left = keys.has('a') || keys.has('arrowleft') || keys.has('keya');
    const right = keys.has('d') || keys.has('arrowright') || keys.has('keyd');

    if (left) {
      p.vx = -250;
      p.face = -1;
    } else if (right) {
      p.vx = 250;
      p.face = 1;
    } else {
      p.vx *= Math.pow(0.001, dt);
    }

    if (
      (keys.has(' ') || keys.has('space') || keys.has('spacebar') || keys.has('arrowup')) &&
      p.grounded
    ) {
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
  for (const hb of state.hitboxes) hb.life -= dt;

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

    if (m.ai === 'hop' || m.ai === 'walk') {
      m.x += m.face * m.speed * dt;
      if (Math.random() < dt * 0.6 || m.x < 300 || m.x > state.sceneWidth - 180) m.face *= -1;
      if (Math.abs(m.x - p.x) < 38 && p.inv <= 0) damagePlayer(m.ai === 'hop' ? 8 : 10);
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
  }
}

function damagePlayer(amount) {
  const p = state.player;
  p.hp = Math.max(1, p.hp - amount);
  p.inv = 0.8;
  text(`-${amount}`, p.x, p.y - 112, '#ff8787', 18);
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
        palette: { skin: '#ffe0bd', hair: '#d5d8dc', hairStyle: 'bob', faceStyle: 'normal' },
        text: ['어서 오게, 신입 모험가여.', '동쪽 포탈로 나가 슬라임 5마리를 처치해 보게.'],
        quest: 'slime_intro'
      },
      {
        id: 'trainer',
        name: '직업 교관',
        x: 1080,
        y: state.groundY,
        palette: { skin: '#f4c28a', hair: '#5b2d16', hairStyle: 'spiky', faceStyle: 'cool' },
        text: ['지금은 모두 초보자로 시작한다.', '전직은 퀘스트를 완료한 뒤 진행하게 될 거다.']
      },
      {
        id: 'smith',
        name: '대장장이 단단',
        x: 1450,
        y: state.groundY,
        palette: { skin: '#f4c28a', hair: '#6b4f2d', hairStyle: 'short', faceStyle: 'angry' },
        text: ['M키로 장비와 아이템을 확인할 수 있다네.', '아이템을 클릭하고 퀵슬롯을 클릭하면 프리셋 등록이 된다네.']
      },
      {
        id: 'mage',
        name: '루나',
        x: 1850,
        y: state.groundY,
        palette: { skin: '#ffe0c7', hair: '#845ef7', hairStyle: 'wave', faceStyle: 'bright' },
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
    ...Array.from({ length: 5 }, (_, i) => ({
      type: 'mushroom',
      x: 1000 + i * 250,
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
    {
      type: 'ogre',
      x: 2950,
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
    }
  ];
}

function normalizeKey(event) {
  const rawKey = event.key || event.code || '';
  return String(rawKey).toLowerCase();
}

addEventListener('keydown', event => {
  const key = normalizeKey(event);
  if (!key) return;

  keys.add(key);

  if (
    key === ' ' ||
    key === 'space' ||
    key === 'spacebar' ||
    key === 'arrowup' ||
    key === 'arrowdown' ||
    key === 'arrowleft' ||
    key === 'arrowright'
  ) {
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
  const key = normalizeKey(event);
  if (!key) return;
  keys.delete(key);
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
        '보상: EXP 80, 150 메소, K 화염파 해금!',
        '전직 시스템은 다음 단계에서 이어서 열릴 예정이네.'
      ];
    } else if (quest.status === 'active') {
      lines.push(`진행도: ${quest.killed}/${quest.need}`);
    } else {
      lines = ['좋은 흐름이네.', '더 강해지면 전직 퀘스트도 열릴 걸세.'];
    }
  }

  state.dialogue = { name: npc.name, lines };
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

  if (crit) text('CRITICAL!', p.x + dir * 36, p.y - 128, '#ffe066', 20);
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
  const damage = Math.floor(30 + calcPower(p, 'physical') * 0.65);

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
  const damage = Math.floor(55 + calcPower(p, 'physical') * 0.9);
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
  state.hitboxes.push({ used: false, ...opts });
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
    const left = keys.has('a') || keys.has('arrowleft') || keys.has('keya');
    const right = keys.has('d') || keys.has('arrowright') || keys.has('keyd');

    if (left) {
      p.vx = -250;
      p.face = -1;
    } else if (right) {
      p.vx = 250;
      p.face = 1;
    } else {
      p.vx *= Math.pow(0.001, dt);
    }

    if (
      (keys.has(' ') || keys.has('space') || keys.has('spacebar') || keys.has('arrowup')) &&
      p.grounded
    ) {
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
  for (const hb of state.hitboxes) hb.life -= dt;

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

    if (m.ai === 'hop' || m.ai === 'walk') {
      m.x += m.face * m.speed * dt;
      if (Math.random() < dt * 0.6 || m.x < 300 || m.x > state.sceneWidth - 180) m.face *= -1;
      if (Math.abs(m.x - p.x) < 38 && p.inv <= 0) damagePlayer(m.ai === 'hop' ? 8 : 10);
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
  }
}

function damagePlayer(amount) {
  const p = state.player;
  p.hp = Math.max(1, p.hp - amount);
  p.inv = 0.8;
  text(`-${amount}`, p.x, p.y - 112, '#ff8787', 18);
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
function updateParticles(dt) {
  for (const p of state.particles) {
    p.life -= dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += (p.gravity ?? 260) * dt;
    if (p.scaleDecay) p.scale *= p.scaleDecay;
  }

  state.particles = state.particles.filter(p => p.life > 0);

  for (const t of state.texts) {
    t.life -= dt;
    t.y += t.vy * dt;
    t.vy -= 8 * dt;
  }

  state.texts = state.texts.filter(t => t.life > 0);
}

function spark(x, y, color, vx, vy, r = 3, life = 0.5) {
  state.particles.push({
    type: 'spark',
    x,
    y,
    color,
    vx,
    vy,
    r,
    life,
    scale: 1,
    scaleDecay: 0.985,
    gravity: 280
  });
}

function arcEffect(x, y, dir, radius, inner, outer, life, startA, endA) {
  state.particles.push({
    type: 'arc',
    x,
    y,
    dir,
    radius,
    inner,
    outer,
    life,
    total: life,
    startA,
    endA,
    width: 10,
    vx: 0,
    vy: 0
  });
}

function fireWave(x, y, dir, c1, c2, life, scale = 1) {
  state.particles.push({
    type: 'fireWave',
    x,
    y,
    dir,
    life,
    total: life,
    c1,
    c2,
    scale,
    vx: 0,
    vy: 0
  });
}

function infernoEffect(x, y, c1, c2, life) {
  state.particles.push({
    type: 'inferno',
    x,
    y,
    life,
    total: life,
    c1,
    c2,
    vx: 0,
    vy: 0
  });
}

function enemySlashEffect(x, y, dir, c1, c2) {
  state.particles.push({
    type: 'enemySlash',
    x,
    y,
    dir,
    life: 0.24,
    total: 0.24,
    c1,
    c2,
    vx: 0,
    vy: 0
  });
}

function text(content, x, y, color, size) {
  state.texts.push({
    content,
    x,
    y,
    color,
    size,
    vy: -35,
    life: 1.1
  });
}

function toast(content, x, y, color) {
  text(content, x, y, color, 22);
}

function draw() {
  ctx.clearRect(0, 0, W, H);

  if (!state.ready) {
    drawMenuBackground();
    if (!characterScreen.classList.contains('hidden')) drawPreview();
    return;
  }

  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);

  if (state.scene === 'town') drawTown();
  else drawField();

  state.platforms.forEach(drawPlatform);
  state.portals.forEach(drawPortal);
  state.npcs.forEach(drawNpc);
  state.monsters.forEach(drawMonster);

  drawPlayer(ctx, state.player, state.player.x, state.player.y, 2.35, state.player.face, state.player.anim, state.player.animTime, false);
  drawWorldEffects();

  ctx.restore();

  drawHud();
  drawDialogue();
  drawInventory();

  if (state.questOpen) drawQuestWindow();
}

function drawMenuBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#59c1ff');
  g.addColorStop(0.75, '#d8f3ff');
  g.addColorStop(1, '#dff7b3');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 7; i++) {
    drawCloud(
      100 + i * 180 + Math.sin(previewPulse + i) * 12,
      80 + (i % 3) * 36,
      1 + (i % 2) * 0.3
    );
  }

  drawBackHills(0, 430, W, '#9ad38f');
  drawBackHills(0, 475, W, '#75b86f');

  ctx.fillStyle = '#86c65b';
  ctx.fillRect(0, 545, W, 24);

  ctx.fillStyle = '#8b6a43';
  ctx.fillRect(0, 568, W, 160);
}

function drawTown() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#1a94ff');
  g.addColorStop(0.78, '#c1f0ff');
  g.addColorStop(1, '#dff2a2');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, state.sceneWidth, H);

  for (let i = 0; i < 16; i++) {
    drawCloud(
      90 + i * 170 + Math.sin(previewPulse * 0.5 + i) * 18,
      62 + (i % 4) * 38,
      0.95 + (i % 3) * 0.18
    );
  }

  drawBackMountains('#87bfe7', 250, 1);
  drawBackMountains('#7cb2dc', 315, 1.3);
  drawBackHills(0, 420, state.sceneWidth, '#8bcf85');
  drawBackHills(0, 470, state.sceneWidth, '#6eb76e');

  drawTownPlateau(0, 500, 330, 90);
  drawTownPlateau(310, 470, 450, 120);
  drawTownPlateau(760, 450, 420, 140);
  drawTownPlateau(1170, 480, 360, 110);
  drawTownPlateau(1520, 450, 500, 140);
  drawTownPlateau(2010, 470, 360, 120);
  drawTownPlateau(2360, 495, 450, 95);

  drawHouse(120, 478, 1.18, true);
  drawHouse(620, 442, 1.08);
  drawHouse(1290, 446, 1.04);
  drawHouse(1905, 442, 1.0);
  drawHouse(2620, 468, 1.05);

  drawBigTree(55, 500, 1.38);
  drawBigTree(520, 468, 1.18);
  drawBigTree(1500, 448, 1.28);
  drawBigTree(2230, 495, 1.08);

  drawClockTower(2120, 434);
  drawPortalSign(2820, 420, '사냥터');

  ctx.fillStyle = '#89c95d';
  ctx.fillRect(0, 548, state.sceneWidth, 22);

  ctx.fillStyle = '#8a6740';
  ctx.fillRect(0, 570, state.sceneWidth, 170);

  for (let x = 0; x < state.sceneWidth; x += 34) {
    ctx.fillStyle = x % 68 ? '#9d7647' : '#7b5a37';
    ctx.fillRect(x, 578, 32, 160);
  }

  ctx.fillStyle = '#f0fffa';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('초보자 마을', 34, 42);
}

function drawField() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#8fd5ff');
  g.addColorStop(0.75, '#eefcff');
  g.addColorStop(1, '#d7f2c7');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, state.sceneWidth, H);

  drawBackMountains('#9cc8e6', 310, 1);
  drawBackHills(0, 430, state.sceneWidth, '#8ac28a');
  drawBackHills(0, 490, state.sceneWidth, '#6aae6d');

  for (let i = 0; i < 26; i++) {
    drawForestTree(80 + i * 150, 555, 0.88 + (i % 4) * 0.1);
  }

  ctx.fillStyle = '#86c95b';
  ctx.fillRect(0, 566, state.sceneWidth, 22);

  ctx.fillStyle = '#6f5034';
  ctx.fillRect(0, 588, state.sceneWidth, 150);

  for (let x = 0; x < state.sceneWidth; x += 48) {
    ctx.fillStyle = x % 96 ? '#785640' : '#5f4330';
    ctx.fillRect(x, 595, 46, 143);
  }

  ctx.fillStyle = '#1d3c2a';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('수련의 숲', 34, 42);
}

function drawPlatform(p) {
  ctx.fillStyle = state.scene === 'town' ? '#7c5b3a' : '#59402b';
  ctx.fillRect(p.x, p.y, p.w, p.h);

  ctx.fillStyle = state.scene === 'town' ? '#91d35b' : '#6fc157';
  ctx.fillRect(p.x, p.y - 8, p.w, 10);
}

function drawBackMountains(color, baseY, amp) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, baseY);

  for (let x = 0; x <= state.sceneWidth + 200; x += 180) {
    const peak = baseY - rand(70, 130) * amp;
    ctx.lineTo(x, peak);
    ctx.lineTo(x + 90, baseY);
  }

  ctx.lineTo(state.sceneWidth, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();
}

function drawBackHills(x, y, width, color) {
  ctx.fillStyle = color;

  for (let i = 0; i < width / 120 + 2; i++) {
    ctx.beginPath();
    ctx.ellipse(x + i * 140, y, 110, 55, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTownPlateau(x, y, w, h) {
  ctx.fillStyle = '#ab8351';
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = '#8d6942';
  for (let i = 0; i < w; i += 22) {
    ctx.fillRect(x + i, y + 18, 14, h - 18);
  }

  ctx.fillStyle = '#97d363';
  ctx.fillRect(x, y - 8, w, 12);
}

function drawCloud(x, y, scale) {
  ctx.save();
  ctx.globalAlpha = 0.93;
  ctx.fillStyle = '#fff';

  circle(ctx, x, y, 18 * scale);
  circle(ctx, x + 18 * scale, y - 10 * scale, 24 * scale);
  circle(ctx, x + 44 * scale, y - 6 * scale, 20 * scale);
  circle(ctx, x + 66 * scale, y, 17 * scale);
  ctx.fillRect(x - 12 * scale, y - 2 * scale, 88 * scale, 18 * scale);

  ctx.restore();
}

function drawTree(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#805332';
  ctx.fillRect(-8, -44, 16, 44);

  ctx.fillStyle = '#2f8f43';
  circle(ctx, -18, -58, 20);
  circle(ctx, 0, -72, 22);
  circle(ctx, 18, -56, 20);
  circle(ctx, 0, -46, 22);

  ctx.restore();
}

function drawForestTree(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#734a2e';
  ctx.fillRect(-10, -76, 20, 76);

  ctx.fillStyle = '#2b6d36';
  ctx.beginPath();
  ctx.moveTo(0, -150);
  ctx.lineTo(-42, -72);
  ctx.lineTo(42, -72);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, -120);
  ctx.lineTo(-36, -44);
  ctx.lineTo(36, -44);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawBigTree(x, y, scale) {
  drawTree(x, y, scale * 1.7);
}

function drawHouse(x, y, scale, temple = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  if (temple) {
    ctx.fillStyle = '#6e563a';
    ctx.fillRect(0, 22, 160, 85);

    ctx.fillStyle = '#34495e';
    ctx.beginPath();
    ctx.moveTo(-18, 28);
    ctx.lineTo(80, -30);
    ctx.lineTo(178, 28);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.fillStyle = '#8a6237';
    ctx.fillRect(0, 30, 140, 75);

    ctx.fillStyle = '#e6d58f';
    ctx.fillRect(15, 48, 44, 28);
    ctx.fillRect(82, 48, 36, 28);

    ctx.fillStyle = '#5b3a23';
    ctx.fillRect(58, 57, 22, 48);

    ctx.fillStyle = '#dccb87';
    ctx.beginPath();
    ctx.ellipse(70, 27, 80, 34, 0, Math.PI, 0);
    ctx.fill();
  }

  ctx.restore();
}

function drawClockTower(x, y) {
  ctx.fillStyle = '#876542';
  ctx.fillRect(x, y, 58, 112);

  ctx.fillStyle = '#eadfb0';
  ctx.fillRect(x + 6, y - 54, 46, 54);

  circle(ctx, x + 29, y - 26, 15);
}

function drawPortalSign(x, y, textValue) {
  ctx.fillStyle = '#7a5a39';
  ctx.fillRect(x, y, 8, 58);

  ctx.fillStyle = '#a77b4a';
  roundRect(ctx, x - 26, y - 16, 72, 24, 8, true);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText(textValue, x - 16, y + 2);
}
/* =========================================================
   EMERGENCY VISUAL FIX
   캐릭터/배경이 안 보이는 문제를 강제로 복구하는 패치
   이 코드는 기존 drawPlayer, drawPreview, drawMenuPreview,
   drawTown, drawField 함수를 덮어씁니다.
========================================================= */

console.log('[Pixel RPG] emergency visual fix loaded');

function drawPlayer(context, player, x, y, scale = 2.2, face = 1, anim = 'idle', time = 0, isNpc = false) {
  const ch = {
    skin: '#ffd6a6',
    hair: '#2b160e',
    hairStyle: 'basic',
    faceStyle: 'normal',
    ...(player && player.character ? player.character : {})
  };

  const run = anim === 'run';
  const jump = anim === 'jump';
  const punch = anim === 'punch';
  const cast = anim === 'cast';

  const walk = Math.sin(time * 12);
  const bob = run ? Math.abs(walk) * -2 : Math.sin(time * 3) * 0.8;
  const legMove = run ? walk * 7 : 0;
  const armMove = run ? -walk * 5 : 0;
  const punchPower = punch ? Math.sin(Math.min(1, time * 10) * Math.PI) : 0;
  const castPower = cast ? Math.sin(Math.min(1, time * 7) * Math.PI) : 0;

  context.save();
  context.translate(x, y + bob);
  context.scale(face * scale, scale);

  // 그림자
  context.fillStyle = 'rgba(0,0,0,0.28)';
  context.beginPath();
  context.ellipse(0, 2, 22, 6, 0, 0, Math.PI * 2);
  context.fill();

  // 다리 외곽선
  context.strokeStyle = '#151515';
  context.lineWidth = 7;
  context.lineCap = 'round';

  context.beginPath();
  context.moveTo(-8, -37);
  context.lineTo(-14 - legMove, -12);
  context.stroke();

  context.beginPath();
  context.moveTo(8, -37);
  context.lineTo(14 + legMove, -12);
  context.stroke();

  // 다리
  context.strokeStyle = ch.skin;
  context.lineWidth = 5;

  context.beginPath();
  context.moveTo(-8, -37);
  context.lineTo(-14 - legMove, -12);
  context.stroke();

  context.beginPath();
  context.moveTo(8, -37);
  context.lineTo(14 + legMove, -12);
  context.stroke();

  // 신발
  context.fillStyle = '#2b1d16';
  context.fillRect(-27 - legMove, -12, 23, 8);
  context.fillRect(4 + legMove, -12, 23, 8);

  // 몸 외곽
  context.fillStyle = '#151515';
  context.beginPath();
  context.roundRect(-22, -78, 44, 45, 10);
  context.fill();

  // 옷
  context.fillStyle = '#4f9cff';
  context.beginPath();
  context.roundRect(-19, -75, 38, 40, 9);
  context.fill();

  // 흰 카라
  context.fillStyle = '#f7f7ff';
  context.fillRect(-15, -72, 30, 8);

  // 하의
  context.fillStyle = '#2f75c9';
  context.beginPath();
  context.roundRect(-15, -45, 30, 11, 4);
  context.fill();

  // 팔 위치
  let leftX = -25 + armMove;
  let leftY = -50;
  let rightX = 25 - armMove;
  let rightY = -50;

  if (punch) {
    rightX = 30 + punchPower * 25;
    rightY = -55;
  }

  if (cast) {
    leftX = -30 - castPower * 8;
    rightX = 30 + castPower * 8;
    leftY = -62;
    rightY = -62;
  }

  // 팔 외곽
  context.strokeStyle = '#151515';
  context.lineWidth = 8;
  context.beginPath();
  context.moveTo(-17, -66);
  context.lineTo(leftX, leftY);
  context.stroke();

  context.beginPath();
  context.moveTo(17, -66);
  context.lineTo(rightX, rightY);
  context.stroke();

  // 팔
  context.strokeStyle = ch.skin;
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(-17, -66);
  context.lineTo(leftX, leftY);
  context.stroke();

  context.beginPath();
  context.moveTo(17, -66);
  context.lineTo(rightX, rightY);
  context.stroke();

  // 손
  context.fillStyle = '#151515';
  context.beginPath();
  context.arc(leftX, leftY, 5, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.arc(rightX, rightY, 5, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = ch.skin;
  context.beginPath();
  context.arc(leftX, leftY, 3.5, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.arc(rightX, rightY, 3.5, 0, Math.PI * 2);
  context.fill();

  // 목
  context.fillStyle = '#151515';
  context.fillRect(-8, -85, 16, 12);

  context.fillStyle = ch.skin;
  context.fillRect(-5, -84, 10, 11);

  // 귀 외곽
  context.fillStyle = '#151515';
  context.beginPath();
  context.arc(-25, -105, 7, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.arc(25, -105, 7, 0, Math.PI * 2);
  context.fill();

  // 얼굴 외곽
  context.fillStyle = '#151515';
  context.beginPath();
  context.ellipse(0, -106, 29, 30, 0, 0, Math.PI * 2);
  context.fill();

  // 귀
  context.fillStyle = ch.skin;
  context.beginPath();
  context.arc(-24, -105, 5, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.arc(24, -105, 5, 0, Math.PI * 2);
  context.fill();

  // 얼굴
  context.fillStyle = ch.skin;
  context.beginPath();
  context.ellipse(0, -106, 25, 26, 0, 0, Math.PI * 2);
  context.fill();

  // 머리카락
  drawEmergencyHair(context, ch.hairStyle, ch.hair);

  // 눈/표정
  drawEmergencyFace(context, ch.faceStyle);

  // 공격 이펙트
  if (punch) {
    context.strokeStyle = '#ffe066';
    context.lineWidth = 5;
    context.beginPath();
    context.arc(42, -56, 22 + punchPower * 18, -0.7, 0.8);
    context.stroke();

    context.strokeStyle = '#ff922b';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(43, -56, 16 + punchPower * 16, -0.7, 0.8);
    context.stroke();
  }

  if (cast) {
    context.strokeStyle = '#ff922b';
    context.lineWidth = 5;
    context.beginPath();
    context.arc(0, -75, 42 + castPower * 8, 0, Math.PI * 2);
    context.stroke();
  }

  // 레벨업 오라
  if (player && player.levelUp > 0) {
    context.strokeStyle = '#ffe066';
    context.lineWidth = 3;
    context.beginPath();
    context.arc(0, -78, 48 + Math.sin(time * 12) * 5, 0, Math.PI * 2);
    context.stroke();
  }

  context.restore();
}

function drawEmergencyHair(context, style, color) {
  context.fillStyle = '#151515';

  // 외곽
  context.beginPath();
  context.roundRect(-28, -134, 56, 33, 15);
  context.fill();

  if (style === 'pony') {
    context.beginPath();
    context.arc(-34, -111, 13, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.arc(34, -111, 13, 0, Math.PI * 2);
    context.fill();
  }

  if (style === 'spiky') {
    context.beginPath();
    context.moveTo(-29, -112);
    context.lineTo(-22, -137);
    context.lineTo(-12, -117);
    context.lineTo(0, -139);
    context.lineTo(10, -117);
    context.lineTo(22, -136);
    context.lineTo(30, -112);
    context.lineTo(24, -100);
    context.lineTo(-24, -100);
    context.closePath();
    context.fill();
  }

  // 색상
  context.fillStyle = color;

  if (style === 'spiky') {
    context.beginPath();
    context.moveTo(-26, -112);
    context.lineTo(-20, -132);
    context.lineTo(-11, -115);
    context.lineTo(0, -135);
    context.lineTo(10, -115);
    context.lineTo(20, -132);
    context.lineTo(26, -112);
    context.lineTo(21, -101);
    context.lineTo(-21, -101);
    context.closePath();
    context.fill();
  } else {
    context.beginPath();
    context.roundRect(-25, -132, 50, 29, 14);
    context.fill();
  }

  if (style === 'short') {
    for (let i = -20; i <= 14; i += 8) {
      context.beginPath();
      context.moveTo(i, -113);
      context.lineTo(i + 5, -99);
      context.lineTo(i + 12, -113);
      context.fill();
    }
  }

  if (style === 'pony') {
    context.beginPath();
    context.arc(-33, -111, 10, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.arc(33, -111, 10, 0, Math.PI * 2);
    context.fill();
  }

  if (style === 'wave' || style === 'bob') {
    context.beginPath();
    context.arc(-20, -101, 8, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.arc(20, -101, 8, 0, Math.PI * 2);
    context.fill();
  }

  // 앞머리
  context.beginPath();
  context.moveTo(-24, -114);
  context.lineTo(-14, -130);
  context.lineTo(-5, -112);
  context.lineTo(3, -130);
  context.lineTo(12, -112);
  context.lineTo(23, -124);
  context.lineTo(24, -101);
  context.lineTo(-24, -101);
  context.closePath();
  context.fill();

  // 하이라이트
  context.fillStyle = 'rgba(255,255,255,0.2)';
  context.fillRect(-12, -127, 12, 3);
}

function drawEmergencyFace(context, style) {
  context.fillStyle = 'rgba(255,120,150,0.28)';
  context.fillRect(-19, -101, 7, 4);
  context.fillRect(12, -101, 7, 4);

  context.fillStyle = '#151515';

  if (style === 'sleepy') {
    context.strokeStyle = '#151515';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(-13, -107);
    context.lineTo(-5, -107);
    context.moveTo(5, -107);
    context.lineTo(13, -107);
    context.stroke();

    context.fillRect(-3, -96, 6, 2);
    return;
  }

  if (style === 'angry') {
    context.strokeStyle = '#151515';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(-15, -113);
    context.lineTo(-5, -108);
    context.moveTo(15, -113);
    context.lineTo(5, -108);
    context.stroke();
  }

  if (style === 'cool') {
    context.strokeStyle = '#151515';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(-15, -111);
    context.lineTo(-5, -108);
    context.moveTo(5, -108);
    context.lineTo(15, -111);
    context.stroke();
  }

  // 큰 눈
  context.fillStyle = '#151515';
  context.fillRect(-12, -109, 5, 8);
  context.fillRect(7, -109, 5, 8);

  context.fillStyle = '#ffffff';
  context.fillRect(-11, -108, 2, 2);
  context.fillRect(8, -108, 2, 2);

  context.fillStyle = '#151515';

  if (style === 'bright' || style === 'cute') {
    context.strokeStyle = '#151515';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(0, -96, 5, 0, Math.PI);
    context.stroke();
  } else {
    context.fillRect(-4, -96, 8, 2);
  }
}

function drawPreview() {
  if (!preview) return;

  preview.width = 300;
  preview.height = 300;

  const context = preview.getContext('2d');
  context.imageSmoothingEnabled = false;

  context.clearRect(0, 0, preview.width, preview.height);

  context.fillStyle = '#202938';
  context.fillRect(0, 0, preview.width, preview.height);

  context.fillStyle = '#2c3a52';
  context.fillRect(42, 258, 216, 12);

  drawPlayer(
    context,
    {
      character: {
        name: document.getElementById('charName') ? document.getElementById('charName').value : '초보자',
        job: 'beginner',
        skin: selected.skin,
        hair: selected.hair,
        hairStyle: selected.hairStyle,
        faceStyle: selected.faceStyle
      },
      equipped: { weapon: null },
      inventory: [],
      levelUp: 0,
      vx: 0,
      vy: 0
    },
    150,
    258,
    1.75,
    1,
    'idle',
    previewPulse,
    false
  );
}

function drawMenuPreview(character) {
  if (!menuPreview) return;

  menuPreview.width = 300;
  menuPreview.height = 300;

  const context = menuPreview.getContext('2d');
  context.imageSmoothingEnabled = false;

  context.clearRect(0, 0, menuPreview.width, menuPreview.height);

  context.fillStyle = '#202938';
  context.fillRect(0, 0, menuPreview.width, menuPreview.height);

  context.fillStyle = '#2c3a52';
  context.fillRect(42, 258, 216, 12);

  drawPlayer(
    context,
    {
      character: {
        job: 'beginner',
        skin: '#ffd6a6',
        hair: '#2b160e',
        hairStyle: 'basic',
        faceStyle: 'normal',
        ...(character || {})
      },
      equipped: { weapon: null },
      inventory: [],
      levelUp: 0,
      vx: 0,
      vy: 0
    },
    150,
    258,
    1.75,
    1,
    'idle',
    previewPulse,
    false
  );
}

function drawTown() {
  // 하늘
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#69c9ff');
  sky.addColorStop(0.65, '#b8edff');
  sky.addColorStop(1, '#e7ffd4');

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, state.sceneWidth, H);

  // 구름
  for (let i = 0; i < 14; i++) {
    const x = 100 + i * 220 + Math.sin(previewPulse + i) * 20;
    const y = 70 + (i % 4) * 42;
    drawEmergencyCloud(x, y, 1 + (i % 3) * 0.2);
  }

  // 먼 산
  ctx.fillStyle = '#8cc6e8';
  ctx.beginPath();
  ctx.moveTo(0, 370);
  for (let x = 0; x < state.sceneWidth + 300; x += 220) {
    ctx.lineTo(x + 100, 250 + Math.sin(x) * 20);
    ctx.lineTo(x + 220, 370);
  }
  ctx.lineTo(state.sceneWidth, H);
  ctx.lineTo(0, H);
  ctx.closePath();
  ctx.fill();

  // 언덕
  ctx.fillStyle = '#80c978';
  for (let x = -100; x < state.sceneWidth; x += 170) {
    ctx.beginPath();
    ctx.ellipse(x, 465, 150, 65, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // 마을 발판
  ctx.fillStyle = '#95d45a';
  ctx.fillRect(0, 548, state.sceneWidth, 28);

  ctx.fillStyle = '#8b623b';
  ctx.fillRect(0, 576, state.sceneWidth, 180);

  for (let x = 0; x < state.sceneWidth; x += 42) {
    ctx.fillStyle = x % 84 === 0 ? '#745034' : '#9b7147';
    ctx.fillRect(x, 584, 38, 150);
  }

  // 집들
  drawEmergencyHouse(180, 470, 1.1);
  drawEmergencyHouse(650, 438, 1.0);
  drawEmergencyHouse(1230, 456, 1.05);
  drawEmergencyHouse(1760, 438, 1.0);
  drawEmergencyHouse(2440, 468, 1.05);

  // 나무
  drawEmergencyTree(70, 548, 1.25);
  drawEmergencyTree(520, 548, 1.0);
  drawEmergencyTree(1500, 548, 1.15);
  drawEmergencyTree(2200, 548, 1.05);

  // 포탈 위치 표시
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('초보자 마을', 34, 46);
}

function drawField() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#80d7ff');
  sky.addColorStop(0.75, '#e9fbff');
  sky.addColorStop(1, '#d8f7c4');

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, state.sceneWidth, H);

  // 숲 배경
  ctx.fillStyle = '#79b879';
  for (let x = -100; x < state.sceneWidth; x += 180) {
    ctx.beginPath();
    ctx.ellipse(x, 470, 160, 70, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  for (let i = 0; i < 28; i++) {
    drawEmergencyTree(80 + i * 160, 566, 0.9 + (i % 3) * 0.12);
  }

  ctx.fillStyle = '#7cc957';
  ctx.fillRect(0, 566, state.sceneWidth, 26);

  ctx.fillStyle = '#6f5034';
  ctx.fillRect(0, 592, state.sceneWidth, 160);

  for (let x = 0; x < state.sceneWidth; x += 48) {
    ctx.fillStyle = x % 96 === 0 ? '#5c3e2a' : '#76533a';
    ctx.fillRect(x, 600, 44, 140);
  }

  ctx.fillStyle = '#1d3c2a';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('수련의 숲', 34, 46);
}

function drawEmergencyCloud(x, y, scale) {
  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.92;

  ctx.beginPath();
  ctx.arc(x, y, 18 * scale, 0, Math.PI * 2);
  ctx.arc(x + 22 * scale, y - 10 * scale, 25 * scale, 0, Math.PI * 2);
  ctx.arc(x + 52 * scale, y - 4 * scale, 21 * scale, 0, Math.PI * 2);
  ctx.arc(x + 78 * scale, y, 16 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillRect(x - 8 * scale, y - 2 * scale, 92 * scale, 20 * scale);
  ctx.restore();
}

function drawEmergencyHouse(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#7d5835';
  ctx.fillRect(0, 28, 150, 88);

  ctx.fillStyle = '#d9c27e';
  ctx.beginPath();
  ctx.ellipse(75, 30, 82, 36, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#f2e3a2';
  ctx.fillRect(18, 52, 42, 30);
  ctx.fillRect(92, 52, 36, 30);

  ctx.fillStyle = '#4e321e';
  ctx.fillRect(62, 66, 28, 50);

  ctx.restore();
}

function drawEmergencyTree(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#7a4e2d';
  ctx.fillRect(-9, -70, 18, 70);

  ctx.fillStyle = '#2f8f43';
  ctx.beginPath();
  ctx.arc(-24, -76, 25, 0, Math.PI * 2);
  ctx.arc(0, -94, 30, 0, Math.PI * 2);
  ctx.arc(26, -76, 25, 0, Math.PI * 2);
  ctx.arc(0, -62, 28, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#52b65b';
  ctx.beginPath();
  ctx.arc(-8, -101, 12, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/* 캔버스 크기 강제 보정 */
if (typeof canvas !== 'undefined' && canvas) {
  canvas.width = 1280;
  canvas.height = 720;
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.display = 'block';
  console.log('[Pixel RPG] canvas size forced:', canvas.width, canvas.height);
}
/* =========================================================
   FINAL VISUAL RENDER PATCH v2
   - 캐릭터 선택 미리보기 강제 표시
   - 게임 시작 후 마을/땅/캐릭터/NPC/몬스터 강제 표시
   - 업로드한 공격 모션/도트 캐릭터 이미지를 참고한 벡터 도트풍 캐릭터
========================================================= */

(() => {
  console.log('[Pixel RPG] FINAL VISUAL RENDER PATCH v2 loaded');

  const FIX_W = 1280;
  const FIX_H = 720;

  function forceCanvasSize() {
    if (!canvas) return;

    if (canvas.width !== FIX_W) canvas.width = FIX_W;
    if (canvas.height !== FIX_H) canvas.height = FIX_H;

    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.display = 'block';

    if (ctx) ctx.imageSmoothingEnabled = false;
  }

  function visualClamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function visualRoundRect(c, x, y, w, h, r, fill = true, stroke = false) {
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

    if (fill) c.fill();
    if (stroke) c.stroke();
  }

  function visualCircle(c, x, y, r) {
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fill();
  }

  function getVisualCharacter(playerLike) {
    const base = {
      name: '초보자',
      job: 'beginner',
      skin: '#ffd6a6',
      hair: '#2b160e',
      hairStyle: 'basic',
      faceStyle: 'normal'
    };

    if (!playerLike || !playerLike.character) return base;

    return {
      ...base,
      ...playerLike.character
    };
  }

  function getVisualPlayer() {
    if (!state || !state.player) {
      return {
        x: 260,
        y: 548,
        face: 1,
        anim: 'idle',
        animTime: performance.now() / 1000,
        hp: 120,
        maxHp: 120,
        mp: 40,
        maxMp: 40,
        level: 1,
        exp: 0,
        nextExp: 80,
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

    return state.player;
  }

  function visualSceneGround() {
    if (state && state.scene === 'field') return 566;
    return 548;
  }

  function visualCameraX() {
    const p = getVisualPlayer();
    const sceneWidth = state && state.sceneWidth ? state.sceneWidth : 3300;
    return visualClamp(p.x - FIX_W * 0.42, 0, Math.max(0, sceneWidth - FIX_W));
  }

  function drawVisualBackground(c, scene) {
    const sceneWidth = state && state.sceneWidth ? state.sceneWidth : 3300;
    const groundY = visualSceneGround();

    const sky = c.createLinearGradient(0, 0, 0, FIX_H);

    if (scene === 'field') {
      sky.addColorStop(0, '#7fd7ff');
      sky.addColorStop(0.62, '#d9f7ff');
      sky.addColorStop(1, '#e4ffd0');
    } else {
      sky.addColorStop(0, '#62c9ff');
      sky.addColorStop(0.65, '#b8efff');
      sky.addColorStop(1, '#ecffd4');
    }

    c.fillStyle = sky;
    c.fillRect(0, 0, sceneWidth, FIX_H);

    drawVisualClouds(c, sceneWidth);

    c.fillStyle = scene === 'field' ? '#8fc1dd' : '#8fc9ea';
    c.beginPath();
    c.moveTo(0, 370);

    for (let x = -100; x < sceneWidth + 300; x += 220) {
      const peakY = scene === 'field' ? 245 : 265;
      c.lineTo(x + 110, peakY + Math.sin(x * 0.03) * 22);
      c.lineTo(x + 240, 370);
    }

    c.lineTo(sceneWidth, FIX_H);
    c.lineTo(0, FIX_H);
    c.closePath();
    c.fill();

    c.fillStyle = scene === 'field' ? '#6faf70' : '#7fc879';
    for (let x = -120; x < sceneWidth + 180; x += 160) {
      c.beginPath();
      c.ellipse(x, groundY - 75, 155, 70, 0, 0, Math.PI * 2);
      c.fill();
    }

    if (scene === 'town') {
      drawVisualTownObjects(c);
    } else {
      drawVisualForestObjects(c);
    }

    c.fillStyle = scene === 'field' ? '#6fc157' : '#94d65d';
    c.fillRect(0, groundY, sceneWidth, 28);

    c.fillStyle = scene === 'field' ? '#6d4f37' : '#8d6740';
    c.fillRect(0, groundY + 28, sceneWidth, FIX_H - groundY);

    for (let x = 0; x < sceneWidth; x += 42) {
      c.fillStyle = x % 84 === 0 ? '#6f4e33' : '#9a7148';
      c.fillRect(x, groundY + 38, 38, FIX_H - groundY - 38);
    }

    c.fillStyle = scene === 'field' ? '#1f3f28' : '#ffffff';
    c.font = 'bold 26px sans-serif';
    c.textAlign = 'left';
    c.fillText(scene === 'field' ? '수련의 숲' : '초보자 마을', 34, 46);
  }

  function drawVisualClouds(c, sceneWidth) {
    for (let i = 0; i < 16; i++) {
      const x = 90 + i * 190 + Math.sin(previewPulse * 0.6 + i) * 18;
      const y = 65 + (i % 4) * 38;
      const s = 0.9 + (i % 3) * 0.18;

      c.save();
      c.globalAlpha = 0.9;
      c.fillStyle = '#ffffff';

      visualCircle(c, x, y, 18 * s);
      visualCircle(c, x + 24 * s, y - 10 * s, 25 * s);
      visualCircle(c, x + 52 * s, y - 4 * s, 21 * s);
      visualCircle(c, x + 78 * s, y, 16 * s);
      c.fillRect(x - 8 * s, y - 1 * s, 92 * s, 20 * s);

      c.restore();
    }
  }

  function drawVisualTownObjects(c) {
    drawVisualHouse(c, 150, 470, 1.1);
    drawVisualHouse(c, 610, 438, 1.0);
    drawVisualHouse(c, 1180, 458, 1.05);
    drawVisualHouse(c, 1720, 438, 1.0);
    drawVisualHouse(c, 2450, 468, 1.05);

    drawVisualTree(c, 80, 548, 1.25);
    drawVisualTree(c, 500, 548, 1.0);
    drawVisualTree(c, 1510, 548, 1.15);
    drawVisualTree(c, 2220, 548, 1.05);

    drawVisualClockTower(c, 2100, 432);
  }

  function drawVisualForestObjects(c) {
    const groundY = visualSceneGround();

    for (let i = 0; i < 28; i++) {
      drawVisualPine(c, 90 + i * 160, groundY, 0.9 + (i % 3) * 0.12);
    }
  }

  function drawVisualHouse(c, x, y, s) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);

    c.fillStyle = '#6b472c';
    c.fillRect(-3, 25, 156, 92);

    c.fillStyle = '#8a6237';
    c.fillRect(0, 28, 150, 88);

    c.fillStyle = '#dcc879';
    c.beginPath();
    c.ellipse(75, 28, 84, 38, 0, Math.PI, 0);
    c.fill();

    c.fillStyle = '#f3e8aa';
    c.fillRect(18, 52, 42, 30);
    c.fillRect(92, 52, 36, 30);

    c.fillStyle = '#4e321e';
    c.fillRect(62, 66, 28, 50);

    c.fillStyle = '#2d2017';
    c.fillRect(67, 84, 4, 4);

    c.restore();
  }

  function drawVisualTree(c, x, y, s) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);

    c.fillStyle = '#764927';
    c.fillRect(-10, -78, 20, 78);

    c.fillStyle = '#2f7f3b';
    visualCircle(c, -28, -82, 28);
    visualCircle(c, 0, -105, 34);
    visualCircle(c, 31, -82, 28);
    visualCircle(c, 0, -64, 30);

    c.fillStyle = '#56b85d';
    visualCircle(c, -9, -113, 13);

    c.restore();
  }

  function drawVisualPine(c, x, y, s) {
    c.save();
    c.translate(x, y);
    c.scale(s, s);

    c.fillStyle = '#70472e';
    c.fillRect(-8, -82, 16, 82);

    c.fillStyle = '#2b6f35';

    c.beginPath();
    c.moveTo(0, -170);
    c.lineTo(-48, -82);
    c.lineTo(48, -82);
    c.closePath();
    c.fill();

    c.beginPath();
    c.moveTo(0, -135);
    c.lineTo(-42, -52);
    c.lineTo(42, -52);
    c.closePath();
    c.fill();

    c.beginPath();
    c.moveTo(0, -102);
    c.lineTo(-34, -25);
    c.lineTo(34, -25);
    c.closePath();
    c.fill();

    c.restore();
  }

  function drawVisualClockTower(c, x, y) {
    c.fillStyle = '#6f4d34';
    c.fillRect(x, y, 58, 116);

    c.fillStyle = '#dfcf95';
    c.fillRect(x + 6, y - 54, 46, 56);

    c.fillStyle = '#ffffff';
    visualCircle(c, x + 29, y - 27, 16);

    c.strokeStyle = '#3b2a1d';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(x + 29, y - 27);
    c.lineTo(x + 29, y - 38);
    c.moveTo(x + 29, y - 27);
    c.lineTo(x + 38, y - 27);
    c.stroke();
  }

  function drawVisualPortal(c, portal) {
    const t = performance.now() / 350;
    const cx = portal.x + portal.w / 2;
    const cy = portal.y + 58;

    ctx.save();
    ctx.translate(cx, cy);

    ctx.shadowColor = '#74c0fc';
    ctx.shadowBlur = 18;

    ctx.strokeStyle = '#ffe066';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 28 + Math.sin(t) * 2, 48, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#b197fc';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 21 + Math.cos(t) * 2, 58, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.shadowBlur = 0;

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('E', 0, -74);
    ctx.fillText(portal.label || '포탈', 0, 80);

    ctx.restore();
  }

  function drawVisualNPC(c, npc) {
    drawVisualCharacter(c, {
      character: {
        name: npc.name,
        job: 'beginner',
        skin: npc.palette?.skin || '#ffd6a6',
        hair: npc.palette?.hair || '#4b2e1d',
        hairStyle: npc.palette?.hairStyle || 'basic',
        faceStyle: npc.palette?.faceStyle || 'normal'
      },
      anim: 'idle',
      animTime: previewPulse
    }, npc.x, npc.y, 1.78, 1, 'idle', previewPulse, true);

    c.fillStyle = '#ffffff';
    c.font = 'bold 15px sans-serif';
    c.textAlign = 'center';
    c.fillText(npc.name || 'NPC', npc.x, npc.y - 118);

    const p = getVisualPlayer();

    if (Math.abs(p.x - npc.x) < 95) {
      c.fillStyle = '#ffe066';
      c.fillText('E 대화', npc.x, npc.y - 138);
    }
  }

  function drawVisualMonster(c, m) {
    if (!m || m.dead) return;

    c.save();
    c.translate(m.x, m.y + Math.sin((m.animTime || previewPulse) * 6) * 2);
    c.scale(m.face || 1, 1);

    if (m.hit > 0) c.globalAlpha = 0.55;

    if (m.type === 'slime') drawVisualSlime(c);
    else if (m.type === 'mushroom') drawVisualMushroom(c);
    else drawVisualOgre(c, m.attackWindup > 0.2);

    c.globalAlpha = 1;
    c.restore();

    const hpRatio = m.maxHp ? m.hp / m.maxHp : 1;
    c.fillStyle = '#0008';
    c.fillRect(m.x - 28, m.y - (m.h || 40) - 22, 56, 7);
    c.fillStyle = '#ff6b6b';
    c.fillRect(m.x - 28, m.y - (m.h || 40) - 22, 56 * visualClamp(hpRatio, 0, 1), 7);
  }

  function drawVisualSlime(c) {
    c.fillStyle = '#1b1b1b';
    c.beginPath();
    c.ellipse(0, -18, 25, 20, 0, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = '#6ee76b';
    c.beginPath();
    c.ellipse(0, -18, 22, 17, 0, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = '#3ccf51';
    c.beginPath();
    c.ellipse(0, -29, 12, 8, 0, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = '#183a20';
    c.fillRect(-8, -22, 4, 4);
    c.fillRect(4, -22, 4, 4);
  }

  function drawVisualMushroom(c) {
    c.fillStyle = '#1b1b1b';
    c.beginPath();
    c.ellipse(0, -35, 27, 20, 0, Math.PI, 0);
    c.fill();

    c.fillStyle = '#d98233';
    c.beginPath();
    c.ellipse(0, -34, 24, 18, 0, Math.PI, 0);
    c.fill();

    c.fillStyle = '#fff0c9';
    c.fillRect(-18, -34, 36, 20);

    c.fillStyle = '#7a4d27';
    c.fillRect(-7, -14, 14, 16);

    c.fillStyle = '#2c1a10';
    c.fillRect(-10, -27, 4, 4);
    c.fillRect(6, -27, 4, 4);
  }

  function drawVisualOgre(c, attacking) {
    c.fillStyle = '#1b1b1b';
    visualRoundRect(c, -25, -88, 50, 68, 14);

    c.fillStyle = '#85a26d';
    visualRoundRect(c, -22, -84, 44, 62, 12);

    c.fillStyle = '#b8d49a';
    visualRoundRect(c, -19, -105, 38, 30, 10);

    c.fillStyle = '#24331a';
    c.fillRect(-9, -95, 5, 5);
    c.fillRect(5, -95, 5, 5);

    c.fillStyle = '#526b3b';
    visualRoundRect(c, -37, -50, 17, 46, 10);
    visualRoundRect(c, 20, -50, 17, 46, 10);

    c.fillStyle = '#6c7f5b';
    c.fillRect(27, attacking ? -122 : -98, 10, 44);

    c.fillStyle = '#a9bbc8';
    c.fillRect(15, attacking ? -130 : -106, 35, 19);
  }

  function drawVisualCharacter(c, playerLike, x, y, scale = 2, face = 1, anim = 'idle', time = 0, isNpc = false) {
    const ch = getVisualCharacter(playerLike);

    const running = anim === 'run';
    const jumping = anim === 'jump';
    const punching = anim === 'punch';
    const casting = anim === 'cast';

    const walk = Math.sin(time * 12);
    const bob = running ? -Math.abs(walk) * 2.5 : Math.sin(time * 3) * 0.8;
    const legA = running ? walk * 8 : 0;
    const armA = running ? -walk * 7 : 0;
    const punchPower = punching ? Math.sin(Math.min(1, time * 10) * Math.PI) : 0;
    const castPower = casting ? Math.sin(Math.min(1, time * 7) * Math.PI) : 0;

    c.save();
    c.translate(x, y + bob);
    c.scale(face * scale, scale);

    c.fillStyle = 'rgba(0,0,0,0.28)';
    c.beginPath();
    c.ellipse(0, 3, 24, 6, 0, 0, Math.PI * 2);
    c.fill();

    if (jumping) {
      c.rotate((playerLike.vy || 0) < 0 ? -0.07 : 0.1);
    }

    // 다리: 업로드한 2번 이미지처럼 걷기/점프에서 팔다리 각도 변화
    c.lineCap = 'round';

    c.strokeStyle = '#151515';
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(-8, -38);
    c.lineTo(-15 - legA, -13);
    c.stroke();

    c.beginPath();
    c.moveTo(8, -38);
    c.lineTo(15 + legA, -13);
    c.stroke();

    c.strokeStyle = ch.skin;
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(-8, -38);
    c.lineTo(-15 - legA, -13);
    c.stroke();

    c.beginPath();
    c.moveTo(8, -38);
    c.lineTo(15 + legA, -13);
    c.stroke();

    c.fillStyle = '#151515';
    c.fillRect(-29 - legA, -14, 25, 9);
    c.fillRect(4 + legA, -14, 25, 9);

    c.fillStyle = '#5b3921';
    c.fillRect(-27 - legA, -12, 21, 6);
    c.fillRect(6 + legA, -12, 21, 6);

    // 몸
    c.fillStyle = '#151515';
    visualRoundRect(c, -23, -80, 46, 47, 10);

    c.fillStyle = '#4f9cff';
    visualRoundRect(c, -20, -77, 40, 42, 9);

    c.fillStyle = '#f6f8ff';
    c.fillRect(-16, -74, 32, 8);

    c.fillStyle = '#2f75c9';
    visualRoundRect(c, -16, -46, 32, 12, 4);

    // 팔
    let lx = -27 + armA;
    let ly = -52;
    let rx = 27 - armA;
    let ry = -52;

    if (punching) {
      rx = 30 + punchPower * 28;
      ry = -58 - punchPower * 2;
      lx = -26 - punchPower * 5;
    }

    if (casting) {
      lx = -32 - castPower * 8;
      rx = 32 + castPower * 8;
      ly = -63;
      ry = -63;
    }

    c.strokeStyle = '#151515';
    c.lineWidth = 8;
    c.beginPath();
    c.moveTo(-18, -68);
    c.lineTo(lx, ly);
    c.stroke();

    c.beginPath();
    c.moveTo(18, -68);
    c.lineTo(rx, ry);
    c.stroke();

    c.strokeStyle = ch.skin;
    c.lineWidth = 5;
    c.beginPath();
    c.moveTo(-18, -68);
    c.lineTo(lx, ly);
    c.stroke();

    c.beginPath();
    c.moveTo(18, -68);
    c.lineTo(rx, ry);
    c.stroke();

    c.fillStyle = '#151515';
    visualCircle(c, lx, ly, 5);
    visualCircle(c, rx, ry, 5);

    c.fillStyle = ch.skin;
    visualCircle(c, lx, ly, 3.5);
    visualCircle(c, rx, ry, 3.5);

    // 목
    c.fillStyle = '#151515';
    c.fillRect(-8, -86, 16, 12);

    c.fillStyle = ch.skin;
    c.fillRect(-5, -85, 10, 11);

    // 귀/얼굴
    c.fillStyle = '#151515';
    visualCircle(c, -26, -106, 7);
    visualCircle(c, 26, -106, 7);

    c.beginPath();
    c.ellipse(0, -108, 30, 31, 0, 0, Math.PI * 2);
    c.fill();

    c.fillStyle = ch.skin;
    visualCircle(c, -25, -106, 5);
    visualCircle(c, 25, -106, 5);

    c.beginPath();
    c.ellipse(0, -108, 26, 27, 0, 0, Math.PI * 2);
    c.fill();

    drawVisualHair(c, ch.hairStyle, ch.hair);
    drawVisualFace(c, ch.faceStyle);

    if (punching) {
      drawVisualAttackSlash(c, punchPower);
    }

    if (casting) {
      drawVisualCastAura(c, castPower);
    }

    if (playerLike && playerLike.levelUp > 0) {
      c.strokeStyle = '#ffe066';
      c.lineWidth = 3;
      c.beginPath();
      c.arc(0, -78, 52 + Math.sin(time * 14) * 5, 0, Math.PI * 2);
      c.stroke();
    }

    c.restore();
  }

  function drawVisualHair(c, style, color) {
    // 검은 외곽
    c.fillStyle = '#151515';

    if (style === 'spiky') {
      c.beginPath();
      c.moveTo(-30, -113);
      c.lineTo(-22, -138);
      c.lineTo(-12, -118);
      c.lineTo(0, -140);
      c.lineTo(11, -118);
      c.lineTo(23, -137);
      c.lineTo(31, -113);
      c.lineTo(24, -100);
      c.lineTo(-24, -100);
      c.closePath();
      c.fill();
    } else {
      visualRoundRect(c, -29, -136, 58, 36, 16);
    }

    if (style === 'pony') {
      visualCircle(c, -36, -112, 14);
      visualCircle(c, 36, -112, 14);
    }

    // 실제 머리색
    c.fillStyle = color || '#2b160e';

    if (style === 'spiky') {
      c.beginPath();
      c.moveTo(-27, -113);
      c.lineTo(-20, -133);
      c.lineTo(-11, -116);
      c.lineTo(0, -136);
      c.lineTo(10, -116);
      c.lineTo(21, -133);
      c.lineTo(27, -113);
      c.lineTo(22, -101);
      c.lineTo(-22, -101);
      c.closePath();
      c.fill();
    } else {
      visualRoundRect(c, -26, -133, 52, 31, 15);
    }

    if (style === 'short') {
      for (let i = -21; i <= 14; i += 8) {
        c.beginPath();
        c.moveTo(i, -115);
        c.lineTo(i + 5, -100);
        c.lineTo(i + 13, -115);
        c.fill();
      }
    }

    if (style === 'pony') {
      visualCircle(c, -35, -112, 11);
      visualCircle(c, 35, -112, 11);
    }

    if (style === 'wave' || style === 'bob') {
      visualCircle(c, -22, -101, 8);
      visualCircle(c, 22, -101, 8);
    }

    // 앞머리
    c.beginPath();
    c.moveTo(-25, -116);
    c.lineTo(-15, -132);
    c.lineTo(-6, -113);
    c.lineTo(3, -132);
    c.lineTo(12, -113);
    c.lineTo(24, -125);
    c.lineTo(25, -102);
    c.lineTo(-25, -102);
    c.closePath();
    c.fill();

    c.fillStyle = 'rgba(255,255,255,0.22)';
    c.fillRect(-13, -129, 12, 3);
  }

  function drawVisualFace(c, style) {
    c.fillStyle = 'rgba(255,120,150,0.26)';
    c.fillRect(-20, -102, 8, 4);
    c.fillRect(12, -102, 8, 4);

    c.fillStyle = '#151515';

    if (style === 'sleepy') {
      c.strokeStyle = '#151515';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-14, -108);
      c.lineTo(-5, -108);
      c.moveTo(5, -108);
      c.lineTo(14, -108);
      c.stroke();

      c.fillRect(-3, -97, 6, 2);
      return;
    }

    if (style === 'angry') {
      c.strokeStyle = '#151515';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-16, -114);
      c.lineTo(-5, -109);
      c.moveTo(16, -114);
      c.lineTo(5, -109);
      c.stroke();
    }

    if (style === 'cool') {
      c.strokeStyle = '#151515';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-15, -112);
      c.lineTo(-5, -109);
      c.moveTo(5, -109);
      c.lineTo(15, -112);
      c.stroke();
    }

    // 큰 눈
    c.fillStyle = '#151515';
    c.fillRect(-13, -110, 6, 9);
    c.fillRect(7, -110, 6, 9);

    c.fillStyle = '#ffffff';
    c.fillRect(-12, -109, 2, 2);
    c.fillRect(8, -109, 2, 2);

    c.fillStyle = '#151515';

    if (style === 'bright' || style === 'cute') {
      c.strokeStyle = '#151515';
      c.lineWidth = 2;
      c.beginPath();
      c.arc(0, -97, 5, 0, Math.PI);
      c.stroke();
    } else {
      c.fillRect(-4, -97, 8, 2);
    }
  }

  function drawVisualAttackSlash(c, power) {
    // 사용자가 준 1번 이미지의 주황색 궤적 느낌
    c.save();

    c.globalAlpha = 0.95;
    c.strokeStyle = '#ffe066';
    c.lineWidth = 7;
    c.beginPath();
    c.arc(48, -58, 24 + power * 22, -0.75, 0.85);
    c.stroke();

    c.strokeStyle = '#ff922b';
    c.lineWidth = 4;
    c.beginPath();
    c.arc(50, -58, 17 + power * 20, -0.7, 0.8);
    c.stroke();

    c.strokeStyle = '#ffffff';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(52, -60, 12 + power * 18, -0.6, 0.65);
    c.stroke();

    c.restore();
  }

  function drawVisualCastAura(c, power) {
    c.save();

    c.globalAlpha = 0.9;
    c.strokeStyle = '#ff922b';
    c.lineWidth = 5;
    c.beginPath();
    c.arc(0, -76, 43 + power * 9, 0, Math.PI * 2);
    c.stroke();

    c.strokeStyle = '#ffe066';
    c.lineWidth = 2;
    c.beginPath();
    c.arc(0, -76, 31 + power * 7, 0, Math.PI * 2);
    c.stroke();

    c.restore();
  }

  function drawVisualHUD(c) {
    const p = getVisualPlayer();
    const hpRatio = p.maxHp ? p.hp / p.maxHp : 1;
    const mpRatio = p.maxMp ? p.mp / p.maxMp : 1;
    const expRatio = p.nextExp ? p.exp / p.nextExp : 0;

    c.fillStyle = 'rgba(17,24,39,0.88)';
    visualRoundRect(c, 14, 12, 700, 72, 12);

    c.fillStyle = '#ffffff';
    c.font = 'bold 16px sans-serif';
    c.textAlign = 'left';
    c.fillText(`LV. ${p.level || 1}`, 32, 38);
    c.fillText(p.character?.name || '초보자', 96, 38);

    c.fillStyle = '#4f9cff';
    c.fillText('초보자', 96, 60);

    drawVisualBar(c, 220, 22, 160, 15, hpRatio, '#ff4d4f', 'HP');
    drawVisualBar(c, 220, 46, 160, 15, mpRatio, '#4dabf7', 'MP');
    drawVisualBar(c, 400, 22, 170, 15, expRatio, '#ffd43b', 'EXP');

    c.fillStyle = '#ffffff';
    c.font = 'bold 13px sans-serif';
    c.fillText('J 기본공격 · K 화염파 · L 화염기둥', 400, 61);
  }

  function drawVisualBar(c, x, y, w, h, ratio, color, label) {
    c.fillStyle = '#0008';
    c.fillRect(x, y, w, h);

    c.fillStyle = color;
    c.fillRect(x, y, w * visualClamp(ratio, 0, 1), h);

    c.strokeStyle = '#ffffff99';
    c.strokeRect(x, y, w, h);

    c.fillStyle = '#ffffff';
    c.font = 'bold 11px sans-serif';
    c.fillText(label, x + 5, y + h - 3);
  }

  function drawVisualGameFrame() {
    if (!state || !state.ready) return;

    forceCanvasSize();

    const p = getVisualPlayer();
    const scene = state.scene || 'town';
    const groundY = visualSceneGround();

    if (!p.y || p.y < 100 || p.y > 900) {
      p.y = groundY;
    }

    const camX = visualCameraX();

    ctx.clearRect(0, 0, FIX_W, FIX_H);

    ctx.save();
    ctx.translate(-Math.floor(camX), 0);

    drawVisualBackground(ctx, scene);

    if (state.platforms && state.platforms.length) {
      for (const pf of state.platforms) {
        ctx.fillStyle = '#6d4f37';
        ctx.fillRect(pf.x, pf.y, pf.w, pf.h);

        ctx.fillStyle = '#87d45a';
        ctx.fillRect(pf.x, pf.y - 8, pf.w, 10);
      }
    }

    if (state.portals && state.portals.length) {
      for (const portal of state.portals) drawVisualPortal(ctx, portal);
    }

    if (state.npcs && state.npcs.length) {
      for (const npc of state.npcs) drawVisualNPC(ctx, npc);
    }

    if (state.monsters && state.monsters.length) {
      for (const m of state.monsters) drawVisualMonster(ctx, m);
    }

    drawVisualCharacter(
      ctx,
      p,
      p.x || 260,
      p.y || groundY,
      1.95,
      p.face || 1,
      p.anim || 'idle',
      p.animTime || previewPulse,
      false
    );

    ctx.restore();

    drawVisualHUD(ctx);
  }

  function drawVisualPreviewFrame() {
    if (typeof preview === 'undefined' || !preview) return;

    const hidden = characterScreen && characterScreen.classList.contains('hidden');
    const menuHidden = characterMenu && characterMenu.classList.contains('hidden');

    if (hidden && menuHidden) return;

    const targetCanvas = !hidden ? preview : menuPreview;
    if (!targetCanvas) return;

    targetCanvas.width = 300;
    targetCanvas.height = 300;

    const pc = targetCanvas.getContext('2d');
    pc.imageSmoothingEnabled = false;

    pc.clearRect(0, 0, 300, 300);

    pc.fillStyle = '#202938';
    pc.fillRect(0, 0, 300, 300);

    pc.fillStyle = '#2c3a52';
    pc.fillRect(42, 258, 216, 12);

    let characterData = {
      name: '초보자',
      job: 'beginner',
      skin: selected?.skin || '#ffd6a6',
      hair: selected?.hair || '#2b160e',
      hairStyle: selected?.hairStyle || 'basic',
      faceStyle: selected?.faceStyle || 'normal'
    };

    if (hidden && currentUser?.save?.player?.character) {
      characterData = {
        ...characterData,
        ...currentUser.save.player.character
      };
    }

    drawVisualCharacter(
      pc,
      {
        character: characterData,
        anim: 'idle',
        animTime: previewPulse
      },
      150,
      258,
      1.8,
      1,
      'idle',
      previewPulse,
      false
    );
  }

  function visualPatchLoop() {
    try {
      drawVisualPreviewFrame();
      drawVisualGameFrame();
    } catch (err) {
      console.error('[Pixel RPG] visual patch error:', err);
    }

    requestAnimationFrame(visualPatchLoop);
  }

  forceCanvasSize();
  requestAnimationFrame(visualPatchLoop);
})();
