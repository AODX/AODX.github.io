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
addEventListener('keydown', event => {
  const rawKey = event.key || event.code || '';
  const key = String(rawKey).toLowerCase();

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
  const rawKey = event.key || event.code || '';
  const key = String(rawKey).toLowerCase();

  if (!key) return;

  keys.delete(key);
});

addEventListener('keyup', event => {
  keys.delete(event.key.toLowerCase());
});

canvas.addEventListener('click', event =>
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
      lines = [
        '좋은 흐름이네.',
        '더 강해지면 전직 퀘스트도 열릴 걸세.'
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

    if (!characterScreen.classList.contains('hidden')) {
      drawPreview();
    }

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

  drawPlayer(
    ctx,
    state.player,
    state.player.x,
    state.player.y,
    2.35,
    state.player.face,
    state.player.anim,
    state.player.animTime,
    false
  );

  drawWorldEffects();

  ctx.restore();

  drawHud();
  drawDialogue();
  drawInventory();

  if (state.questOpen) {
    drawQuestWindow();
  }
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
