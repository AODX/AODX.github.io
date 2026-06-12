const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;
const keys = new Set();

let last = performance.now();
let cameraX = 0;
let token = localStorage.getItem('pixel-rpg-token') || '';
let loginMode = 'login';
let currentUser = null;
let nickTimer = null;

let selected = {
  skin: '#ffd6a6',
  hair: '#5b2d16',
  outfit: '#4f9cff',
  accent: '#ffd43b'
};

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

const state = {
  ready: false,
  scene: 'town',
  townWidth: 2450,
  fieldWidth: 3600,
  particles: [],
  texts: [],
  hitboxes: [],
  portals: [],
  npcs: [],
  monsters: [],
  dialogue: null,
  inventoryOpen: false,
  saveFlash: 0,
  player: defaultPlayer()
};

function defaultPlayer() {
  return {
    x: 260,
    y: 520,
    vx: 0,
    vy: 0,
    w: 42,
    h: 72,
    face: 1,
    grounded: true,
    anim: 'idle',
    animTime: 0,
    attackCd: 0,
    skillCd: 0,
    inv: 0,
    levelUp: 0,
    level: 1,
    exp: 0,
    nextExp: 80,
    hp: 120,
    maxHp: 120,
    mp: 40,
    maxMp: 40,
    gold: 120,
    unlockedSkills: [],
    quests: {},
    character: {
      name: '초보자',
      skin: '#ffd6a6',
      hair: '#5b2d16',
      outfit: '#4f9cff',
      accent: '#ffd43b'
    },
    inventory: [
      { id: 'red_potion', name: '빨간 포션', type: 'use', qty: 5 },
      { id: 'beginner_glove', name: '초보자 장갑', type: 'weapon', qty: 1, atk: 1 }
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

  document.getElementById('menuName').textContent = `${save.player.character.name}  Lv.${save.player.level}`;
  drawMenuPreview(save.player.character);
}

function startWithSave(save) {
  Object.assign(state.player, defaultPlayer(), save?.player || {});
  setupScene(state.player.scene || 'town');

  hideAllPanels();
  help.classList.remove('hidden');
  state.ready = true;

  toast(`${state.player.character.name}님, 환영합니다!`, state.player.x, state.player.y - 110, '#ffe066');
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

  group.querySelector('span').classList.add('selected');
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
      ...selected
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

  const player = state.player;
  player.scene = state.scene;

  const save = {
    player: pick(player, [
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
      'unlockedSkills',
      'quests',
      'inventory'
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
    toast('서버 저장 완료', player.x, player.y - 105, '#9bf6ff');
  } catch {
    toast('저장 실패', player.x, player.y - 105, '#ff8787');
  }
}

function pick(obj, keys) {
  return Object.fromEntries(keys.map(key => [key, obj[key]]));
}

function setupScene(scene) {
  state.scene = scene;
  state.particles = [];
  state.texts = [];
  state.hitboxes = [];
  state.monsters = [];

  if (scene === 'town') {
    state.portals = [
      { x: 2180, y: 515, w: 72, h: 110, to: 'field', label: '수련의 숲' }
    ];

    state.npcs = [
      {
        id: 'elder',
        name: '장로 구름',
        x: 650,
        y: 520,
        text: ['어서 오게, 초보자여!', '동쪽 포탈로 나가 슬라임 5마리를 처치해 보게.'],
        quest: 'slime_intro'
      },
      {
        id: 'smith',
        name: '대장장이 단단',
        x: 1100,
        y: 520,
        text: ['M키로 인벤토리를 열 수 있다네.', '초반에는 무기 없이 J키 주먹 공격만 가능하다네.']
      },
      {
        id: 'mage',
        name: '마법사 루나',
        x: 1540,
        y: 520,
        text: ['레벨 2가 되면 화염 스킬 K가 열릴 거야.', '지금은 기본 공격으로 수련해 봐!']
      }
    ];
  } else {
    state.portals = [
      { x: 90, y: 525, w: 70, h: 100, to: 'town', label: '초보자 마을' }
    ];

    state.npcs = [];
    spawnMonsters();
  }
}

function spawnMonsters() {
  state.monsters = [];

  for (let i = 0; i < 16; i++) {
    const mushroom = i % 3 === 2;

    state.monsters.push({
      type: mushroom ? 'mushroom' : 'slime',
      x: 520 + i * 190,
      y: 535,
      vx: mushroom ? 18 : 30,
      w: mushroom ? 48 : 42,
      h: mushroom ? 48 : 34,
      hp: mushroom ? 75 : 42,
      maxHp: mushroom ? 75 : 42,
      exp: mushroom ? 28 : 18,
      face: Math.random() < .5 ? -1 : 1,
      animTime: Math.random() * 5,
      hit: 0,
      dead: false,
      respawn: 0
    });
  }
}

addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  keys.add(key);

  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
    event.preventDefault();
  }

  if (!state.ready) return;

  if (key === 'm') state.inventoryOpen = !state.inventoryOpen;
  if (key === 'e') interact();
  if (key === 's') saveGame();
  if (key === 'j') punch();
  if (key === 'k') trySkill();
});

addEventListener('keyup', event => {
  keys.delete(event.key.toLowerCase());
});

function interact() {
  if (state.dialogue) {
    state.dialogue = null;
    return;
  }

  const player = state.player;

  for (const portal of state.portals) {
    if (Math.abs(player.x - (portal.x + portal.w / 2)) < 80) {
      player.x = portal.to === 'town' ? 2160 : 180;
      player.y = 520;

      setupScene(portal.to);

      toast(`${portal.label} 이동`, player.x, player.y - 90, '#c0eb75');
      return;
    }
  }

  const npc = state.npcs.find(item => Math.abs(item.x - player.x) < 90);

  if (npc) {
    openNpc(npc);
  }
}

function openNpc(npc) {
  const player = state.player;
  let lines = npc.text.slice();

  if (npc.quest === 'slime_intro') {
    const quest = player.quests.slime_intro;

    if (!quest) {
      player.quests.slime_intro = {
        status: 'active',
        killed: 0,
        need: 5
      };

      lines.push('퀘스트 시작: 슬라임 5마리 처치');
    } else if (quest.status === 'active' && quest.killed >= quest.need) {
      quest.status = 'done';

      gainExp(80);
      player.gold += 150;
      player.unlockedSkills = [...new Set([...player.unlockedSkills, 'fire'])];

      lines = ['훌륭하군! 보상을 받게.', 'EXP 80, 150 메소, 화염 스킬이 열렸네!'];
    } else if (quest.status === 'active') {
      lines.push(`진행도: ${quest.killed}/${quest.need}`);
    } else {
      lines = ['이미 훌륭히 해냈네.', '더 강한 모험은 다음 업데이트에서 준비하겠네!'];
    }
  }

  state.dialogue = {
    name: npc.name,
    lines
  };
}

function punch() {
  const player = state.player;

  if (player.attackCd > 0 || state.dialogue) return;

  player.attackCd = .38;
  player.anim = 'punch';
  player.animTime = 0;

  const hitX = player.x + player.face * 42;
  const hitY = player.y - 44;

  state.hitboxes.push({
    x: hitX,
    y: hitY,
    w: 58,
    h: 50,
    life: .12,
    damage: 14 + player.level * 3,
    owner: 'player',
    kind: 'punch'
  });

  for (let i = 0; i < 8; i++) {
    spark(
      hitX + rand(-10, 25),
      hitY + rand(-15, 20),
      '#fff3bf',
      player.face * rand(20, 80),
      rand(-80, -10)
    );
  }
}

function trySkill() {
  const player = state.player;

  if (!player.unlockedSkills.includes('fire') || player.level < 2) {
    toast('아직 스킬을 사용할 수 없습니다', player.x, player.y - 95, '#ffd43b');
    return;
  }

  if (player.mp < 12 || player.skillCd > 0) return;

  player.mp -= 12;
  player.skillCd = .8;
  player.anim = 'skill';
  player.animTime = 0;

  const hitX = player.x + player.face * 95;
  const hitY = player.y - 50;

  state.hitboxes.push({
    x: hitX,
    y: hitY,
    w: 130,
    h: 64,
    life: .25,
    damage: 36 + player.level * 4,
    owner: 'player',
    kind: 'fire'
  });

  for (let i = 0; i < 26; i++) {
    spark(
      player.x + player.face * rand(20, 140),
      hitY + rand(-25, 30),
      i % 2 ? '#ff922b' : '#ffd43b',
      player.face * rand(90, 220),
      rand(-120, 40)
    );
  }
}
function update(dt) {
  if (!state.ready) return;

  const player = state.player;

  player.animTime += dt;
  player.attackCd = Math.max(0, player.attackCd - dt);
  player.skillCd = Math.max(0, player.skillCd - dt);
  player.inv = Math.max(0, player.inv - dt);
  player.levelUp = Math.max(0, player.levelUp - dt);
  state.saveFlash = Math.max(0, state.saveFlash - dt);

  if (!state.dialogue && !state.inventoryOpen) {
    const left = keys.has('a') || keys.has('arrowleft');
    const right = keys.has('d') || keys.has('arrowright');
    const speed = 250;

    if (left) {
      player.vx = -speed;
      player.face = -1;
    } else if (right) {
      player.vx = speed;
      player.face = 1;
    } else {
      player.vx *= Math.pow(.001, dt);
    }

    if ((keys.has(' ') || keys.has('arrowup')) && player.grounded) {
      player.vy = -540;
      player.grounded = false;
      player.anim = 'jump';
      player.animTime = 0;
    }

    if (player.attackCd <= .18 && player.skillCd <= .4) {
      player.x += player.vx * dt;
    }
  } else {
    player.vx *= Math.pow(.001, dt);
  }

  player.vy += 1550 * dt;
  player.y += player.vy * dt;

  const ground = state.scene === 'town' ? 540 : 560;

  if (player.y > ground) {
    player.y = ground;
    player.vy = 0;
    player.grounded = true;
  }

  const maxWidth = state.scene === 'town' ? state.townWidth : state.fieldWidth;
  player.x = clamp(player.x, 80, maxWidth - 80);

  if (player.anim !== 'punch' && player.anim !== 'skill') {
    player.anim = !player.grounded ? 'jump' : Math.abs(player.vx) > 20 ? 'run' : 'idle';
  }

  if (
    (player.anim === 'punch' && player.attackCd <= .05) ||
    (player.anim === 'skill' && player.skillCd <= .1)
  ) {
    player.anim = 'idle';
  }

  player.mp = Math.min(player.maxMp, player.mp + dt * 4);

  updateHitboxes(dt);
  updateMonsters(dt);
  updateParticles(dt);

  cameraX += (
    clamp(player.x - W * .42, 0, maxWidth - W) - cameraX
  ) * Math.min(1, dt * 7);
}

function updateHitboxes(dt) {
  for (const hitbox of state.hitboxes) {
    hitbox.life -= dt;
  }

  for (const hitbox of state.hitboxes) {
    if (hitbox.owner !== 'player' || hitbox.used) continue;

    for (const monster of state.monsters) {
      if (
        monster.dead ||
        !rects(
          hitbox.x,
          hitbox.y,
          hitbox.w,
          hitbox.h,
          monster.x - monster.w / 2,
          monster.y - monster.h,
          monster.w,
          monster.h
        )
      ) {
        continue;
      }

      monster.hp -= hitbox.damage;
      monster.hit = .25;
      monster.face = state.player.x < monster.x ? -1 : 1;
      monster.x += state.player.face * 12;

      text(`-${hitbox.damage}`, monster.x, monster.y - monster.h - 15, '#ff6b6b', 20);

      for (let i = 0; i < 12; i++) {
        spark(
          monster.x + rand(-15, 15),
          monster.y - rand(10, monster.h),
          hitbox.kind === 'fire' ? '#ff922b' : '#fff',
          rand(-130, 130),
          rand(-170, 30)
        );
      }

      if (monster.hp <= 0) {
        killMonster(monster);
      }
    }

    hitbox.used = true;
  }

  state.hitboxes = state.hitboxes.filter(hitbox => hitbox.life > 0);
}

function updateMonsters(dt) {
  if (state.scene !== 'field') return;

  const player = state.player;

  for (const monster of state.monsters) {
    monster.animTime += dt;
    monster.hit = Math.max(0, monster.hit - dt);

    if (monster.dead) {
      monster.respawn -= dt;

      if (monster.respawn <= 0) {
        Object.assign(monster, {
          hp: monster.maxHp,
          dead: false,
          x: 520 + Math.random() * 2800
        });
      }

      continue;
    }

    monster.x += monster.face * monster.vx * dt;

    if (
      monster.x < 380 ||
      monster.x > state.fieldWidth - 180 ||
      Math.random() < dt * .25
    ) {
      monster.face *= -1;
    }

    if (
      Math.abs(monster.x - player.x) < 40 &&
      Math.abs(monster.y - player.y) < 60 &&
      player.inv <= 0
    ) {
      player.hp = Math.max(1, player.hp - (monster.type === 'mushroom' ? 12 : 8));
      player.inv = .8;
      text('-HP', player.x, player.y - 95, '#ff8787', 18);
    }
  }
}

function killMonster(monster) {
  monster.dead = true;
  monster.respawn = 5;

  gainExp(monster.exp);

  text(`EXP +${monster.exp}`, monster.x, monster.y - 80, '#c0eb75', 18);

  const quest = state.player.quests.slime_intro;

  if (quest && quest.status === 'active' && monster.type === 'slime') {
    quest.killed = Math.min(quest.need, quest.killed + 1);
  }
}

function gainExp(value) {
  const player = state.player;

  player.exp += value;

  while (player.exp >= player.nextExp) {
    player.exp -= player.nextExp;
    player.level++;
    player.nextExp = Math.floor(player.nextExp * 1.35 + 40);
    player.maxHp += 18;
    player.maxMp += 10;
    player.hp = player.maxHp;
    player.mp = player.maxMp;
    player.levelUp = 2.2;

    if (player.level >= 2 && !player.unlockedSkills.includes('fire')) {
      player.unlockedSkills.push('fire');
    }

    for (let i = 0; i < 60; i++) {
      spark(
        player.x + rand(-35, 35),
        player.y - rand(10, 100),
        i % 2 ? '#ffe066' : '#74c0fc',
        rand(-90, 90),
        rand(-260, -60)
      );
    }

    text('LEVEL UP!', player.x, player.y - 135, '#ffe066', 32);
  }
}

function updateParticles(dt) {
  for (const particle of state.particles) {
    particle.life -= dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 360 * dt;
    particle.r *= .985;
  }

  state.particles = state.particles.filter(particle => particle.life > 0);

  for (const item of state.texts) {
    item.life -= dt;
    item.y += item.vy * dt;
    item.vy -= 8 * dt;
  }

  state.texts = state.texts.filter(item => item.life > 0);
}

function spark(x, y, color, vx, vy) {
  state.particles.push({
    x,
    y,
    color,
    vx,
    vy,
    r: rand(2, 5),
    life: rand(.35, .8)
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
    drawAuthBackground();
    return;
  }

  ctx.save();
  ctx.translate(-Math.floor(cameraX), 0);

  if (state.scene === 'town') {
    drawTown();
  } else {
    drawField();
  }

  state.portals.forEach(drawPortal);
  state.npcs.forEach(drawNpc);
  state.monsters.forEach(drawMonster);

  drawPlayer(
    ctx,
    state.player,
    state.player.x,
    state.player.y,
    2.2,
    state.player.face,
    state.player.anim,
    state.player.animTime
  );

  drawWorldEffects();

  ctx.restore();

  drawHud();
  drawDialogue();
  drawInventory();
}

function drawAuthBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, '#5cc7ff');
  gradient.addColorStop(1, '#d8f5a2');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);

  for (let i = 0; i < 7; i++) {
    drawCloud((i * 230 + performance.now() / 80) % 1500 - 100, 80 + i % 3 * 38, 1.2);
  }

  ctx.fillStyle = '#6b4f2a';
  ctx.fillRect(0, 560, W, 160);

  ctx.fillStyle = '#87c95f';
  ctx.fillRect(0, 540, W, 30);

  for (let x = 40; x < W; x += 180) {
    drawTree(x, 540, 1.2);
  }
}

function drawTown() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, '#1193ff');
  gradient.addColorStop(.75, '#b7e8ff');
  gradient.addColorStop(1, '#c3f085');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.townWidth, H);

  for (let i = 0; i < 18; i++) {
    drawCloud(i * 170 + 40, 55 + (i % 4) * 45, 1 + (i % 3) * .25);
  }

  ctx.fillStyle = '#92cf58';
  ctx.fillRect(0, 535, state.townWidth, 28);

  ctx.fillStyle = '#8a6740';
  ctx.fillRect(0, 563, state.townWidth, 160);

  for (let x = 0; x < state.townWidth; x += 36) {
    ctx.fillStyle = x % 72 ? '#9b7447' : '#7d5934';
    ctx.fillRect(x, 570, 34, 150);
  }

  drawHouse(130, 480, 1.25);
  drawHouse(420, 500, .95);
  drawHouse(820, 500, 1.05);
  drawHouse(1300, 493, 1.12);
  drawHouse(1760, 502, 1);
  drawBigTree(35, 535, 1.4);
  drawBigTree(720, 535, 1.1);
  drawBigTree(1650, 535, 1.25);
  drawClockTower(1880, 535);

  ctx.fillStyle = '#5f3dc4';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('초보자 마을', 40, 42);
}

function drawField() {
  const gradient = ctx.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, '#8bd7ff');
  gradient.addColorStop(1, '#effaf0');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, state.fieldWidth, H);

  for (let x = 0; x < state.fieldWidth; x += 500) {
    ctx.fillStyle = '#94d2a5';
    ctx.beginPath();
    ctx.moveTo(x, 540);
    ctx.lineTo(x + 260, 290);
    ctx.lineTo(x + 560, 540);
    ctx.fill();
  }

  for (let i = 0; i < 30; i++) {
    drawTree(i * 130 + 30, 560, .8 + (i % 4) * .16);
  }

  ctx.fillStyle = '#6da544';
  ctx.fillRect(0, 555, state.fieldWidth, 26);

  ctx.fillStyle = '#63452d';
  ctx.fillRect(0, 580, state.fieldWidth, 140);

  for (let x = 0; x < state.fieldWidth; x += 50) {
    ctx.fillStyle = x % 100 ? '#74513a' : '#5e402d';
    ctx.fillRect(x, 585, 48, 135);
  }

  ctx.fillStyle = '#2f9e44';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('수련의 숲', 220, 42);
}

function drawCloud(x, y, scale) {
  ctx.fillStyle = '#fff';
  ctx.globalAlpha = .9;

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc(x + i * 22 * scale, y + (i % 2) * -8 * scale, 18 * scale, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillRect(x - 16 * scale, y, 90 * scale, 18 * scale);
  ctx.globalAlpha = 1;
}

function drawHouse(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#7a4f2b';
  ctx.fillRect(0, 28, 140, 72);

  ctx.fillStyle = '#e0b45c';
  ctx.fillRect(12, 45, 45, 35);
  ctx.fillRect(82, 45, 38, 35);

  ctx.fillStyle = '#51341f';
  ctx.fillRect(58, 55, 22, 45);

  ctx.fillStyle = '#d8a63e';
  ctx.beginPath();
  ctx.ellipse(70, 30, 82, 34, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#b8872f';

  for (let i = 0; i < 7; i++) {
    ctx.fillRect(i * 22 - 2, 18, 15, 15);
  }

  ctx.restore();
}

function drawTree(x, y, scale) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);

  ctx.fillStyle = '#7b4f2d';
  ctx.fillRect(-8, -45, 16, 45);

  ctx.fillStyle = '#328b3d';

  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.arc((i - 1.5) * 14, -62 - (i % 2) * 12, 25, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawBigTree(x, y, scale) {
  drawTree(x, y, scale * 1.9);
}

function drawClockTower(x, y) {
  ctx.fillStyle = '#7c5b3a';
  ctx.fillRect(x, y - 180, 55, 180);

  ctx.fillStyle = '#efe3b0';
  ctx.fillRect(x + 8, y - 165, 39, 46);

  ctx.beginPath();
  ctx.arc(x + 28, y - 142, 14, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#654';
  ctx.beginPath();
  ctx.moveTo(x + 28, y - 142);
  ctx.lineTo(x + 28, y - 154);
  ctx.moveTo(x + 28, y - 142);
  ctx.lineTo(x + 38, y - 138);
  ctx.stroke();
}

function drawPortal(portal) {
  const time = performance.now() / 350;

  ctx.save();
  ctx.translate(portal.x + portal.w / 2, portal.y - 45);

  ctx.strokeStyle = '#b197fc';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#74c0fc';
  ctx.shadowBlur = 16;

  ctx.beginPath();
  ctx.ellipse(0, 0, 30 + Math.sin(time) * 3, 54, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#d0ebff';
  ctx.globalAlpha = .35;
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 48, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('E', 0, -68);
  ctx.fillText(portal.label, 0, 76);

  ctx.restore();
}

function drawNpc(npc) {
  drawPlayer(
    ctx,
    {
      character: {
        name: npc.name,
        skin: '#ffe0b2',
        hair: npc.id === 'mage' ? '#845ef7' : '#868e96',
        outfit: npc.id === 'smith' ? '#6c584c' : '#20c997',
        accent: '#ffd43b'
      },
      levelUp: 0
    },
    npc.x,
    npc.y,
    2.0,
    1,
    'idle',
    performance.now() / 600
  );

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 15px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(npc.name, npc.x, npc.y - 105);

  if (Math.abs(state.player.x - npc.x) < 90) {
    ctx.fillText('E 대화', npc.x, npc.y - 125);
  }
}

function drawMonster(monster) {
  if (monster.dead) return;

  ctx.save();
  ctx.translate(monster.x, monster.y);
  ctx.scale(monster.face, 1);

  const bob = Math.sin(monster.animTime * 7) * 3;

  if (monster.hit) ctx.globalAlpha = .55;

  if (monster.type === 'slime') {
    ctx.fillStyle = '#79e65c';
    ctx.beginPath();
    ctx.ellipse(0, bob - 14, 24, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#226b31';
    ctx.fillRect(-9, bob - 19, 5, 5);
    ctx.fillRect(6, bob - 19, 5, 5);
  } else {
    ctx.fillStyle = '#cf8f45';
    ctx.beginPath();
    ctx.ellipse(0, bob - 22, 23, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f1c27d';
    ctx.fillRect(-17, bob - 45, 34, 24);

    ctx.fillStyle = '#693b15';
    ctx.fillRect(-12, bob - 38, 7, 7);
    ctx.fillRect(6, bob - 38, 7, 7);
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.fillStyle = '#111a';
  ctx.fillRect(monster.x - 28, monster.y - monster.h - 18, 56, 6);

  ctx.fillStyle = '#ff6b6b';
  ctx.fillRect(monster.x - 28, monster.y - monster.h - 18, 56 * (monster.hp / monster.maxHp), 6);
}

function drawPlayer(context, player, x, y, scale = 2, face = 1, anim = 'idle', time = 0) {
  const ch = player.character || selected;

  const run = Math.sin(time * 12);
  const walk = Math.sin(time * 10);
  const punch = anim === 'punch' ? Math.max(0, 1 - time / .25) : 0;
  const skill = anim === 'skill' ? Math.sin(Math.min(1, time / .4) * Math.PI) : 0;
  const jumping = anim === 'jump';

  const legA = anim === 'run' ? run * .55 : jumping ? .35 : walk * .08;
  const armA = anim === 'run' ? -run * .45 : 0;

  context.save();
  context.translate(x, y);
  context.scale(face * scale, scale);
  context.lineCap = 'round';
  context.lineJoin = 'round';

  context.strokeStyle = '#30231d';
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(-6, -30);
  context.lineTo(-12 + legA * 8, -8);
  context.moveTo(8, -30);
  context.lineTo(14 - legA * 8, -8);
  context.stroke();

  context.strokeStyle = ch.outfit;
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(-5, -56);
  context.lineTo(-13 + legA * 10, -30);
  context.moveTo(7, -56);
  context.lineTo(15 - legA * 10, -30);
  context.stroke();

  context.fillStyle = ch.outfit;
  context.fillRect(-14, -80, 28, 30);

  context.strokeStyle = ch.skin;
  context.lineWidth = 6;
  context.beginPath();
  context.moveTo(-12, -72);
  context.lineTo(-22 + armA * 8, -50);
  context.moveTo(12, -72);
  context.lineTo(22 + punch * 26 + skill * 18 - armA * 8, -50 - skill * 15);
  context.stroke();

  context.fillStyle = ch.skin;
  context.beginPath();
  context.arc(0, -104, 19, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = ch.hair;
  context.beginPath();
  context.ellipse(0, -116, 21, 13, 0, Math.PI, 0);
  context.fill();

  context.fillRect(-18, -113, 36, 8);

  context.fillStyle = '#1b1b1b';
  context.fillRect(6, -104, 3, 3);

  context.fillStyle = ch.accent;
  context.fillRect(-9, -80, 18, 7);

  context.strokeStyle = '#2b2b2b';
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(-13, -8);
  context.lineTo(-24, -8);
  context.moveTo(13, -8);
  context.lineTo(25, -8);
  context.stroke();

  if (player.levelUp > 0) {
    context.strokeStyle = '#ffe066';
    context.lineWidth = 2;
    context.beginPath();
    context.arc(0, -70, 35 + Math.sin(time * 16) * 5, 0, Math.PI * 2);
    context.stroke();
  }

  context.restore();
}

function drawWorldEffects() {
  for (const hitbox of state.hitboxes) {
    if (hitbox.kind === 'fire') {
      ctx.fillStyle = '#ff922bcc';
      ctx.beginPath();
      ctx.ellipse(hitbox.x, hitbox.y + 20, hitbox.w / 2, hitbox.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = '#fff9';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(hitbox.x, hitbox.y, 30, -1, 1);
      ctx.stroke();
    }
  }

  for (const particle of state.particles) {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.max(0, particle.life);
    ctx.fillRect(particle.x - particle.r / 2, particle.y - particle.r / 2, particle.r, particle.r);
    ctx.globalAlpha = 1;
  }

  for (const item of state.texts) {
    ctx.fillStyle = item.color;
    ctx.font = `bold ${item.size}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(item.content, item.x, item.y);
  }
}

function drawHud() {
  const player = state.player;

  ctx.fillStyle = '#111a';
  ctx.fillRect(18, 18, 380, 96);

  bar(34, 42, 230, 16, player.hp / player.maxHp, '#ff6b6b', 'HP');
  bar(34, 68, 230, 16, player.mp / player.maxMp, '#4dabf7', 'MP');
  bar(34, 94, 230, 12, player.exp / player.nextExp, '#ffd43b', 'EXP');

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 18px sans-serif';
  ctx.fillText(`Lv.${player.level} ${player.character.name}`, 34, 32);
  ctx.fillText(`${player.gold} 메소`, 280, 72);
  ctx.fillText(state.scene === 'town' ? '마을' : '사냥터', 280, 96);

  if (state.saveFlash > 0) {
    ctx.fillStyle = '#9bf6ff';
    ctx.fillText('저장됨', W - 110, 42);
  }

  const quest = player.quests.slime_intro;

  if (quest && quest.status === 'active') {
    ctx.fillStyle = '#111a';
    ctx.fillRect(W - 310, 20, 285, 70);

    ctx.fillStyle = '#ffe066';
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('퀘스트: 첫 수련', W - 292, 45);

    ctx.fillStyle = '#fff';
    ctx.fillText(`슬라임 처치 ${quest.killed}/${quest.need}`, W - 292, 72);
  }
}

function bar(x, y, w, h, ratio, color, label) {
  ctx.fillStyle = '#0009';
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * clamp(ratio, 0, 1), h);

  ctx.strokeStyle = '#fff8';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(label, x + 6, y + h - 4);
}

function drawDialogue() {
  if (!state.dialogue) return;

  const dialogue = state.dialogue;

  ctx.fillStyle = '#101827ee';
  ctx.fillRect(160, 520, 960, 150);

  ctx.strokeStyle = '#90caf9';
  ctx.lineWidth = 3;
  ctx.strokeRect(160, 520, 960, 150);

  ctx.fillStyle = '#ffe066';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(dialogue.name, 190, 554);

  ctx.fillStyle = '#fff';
  ctx.font = '20px sans-serif';

  dialogue.lines.slice(0, 4).forEach((line, index) => {
    ctx.fillText(line, 190, 590 + index * 25);
  });

  ctx.fillStyle = '#9bf6ff';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('E 닫기', 1030, 640);
}

function drawInventory() {
  if (!state.inventoryOpen) return;

  const player = state.player;

  ctx.fillStyle = '#dbe9fbf2';
  ctx.fillRect(330, 100, 620, 500);

  ctx.strokeStyle = '#426a9b';
  ctx.lineWidth = 4;
  ctx.strokeRect(330, 100, 620, 500);

  ctx.fillStyle = '#1c2b3f';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('EQUIPMENT / INVENTORY', 360, 140);

  ctx.fillStyle = '#8db7e8';
  ctx.fillRect(360, 165, 230, 360);

  ctx.fillStyle = '#fff';
  ctx.fillRect(390, 195, 70, 70);
  ctx.fillRect(490, 195, 70, 70);
  ctx.fillRect(440, 290, 70, 90);
  ctx.fillRect(390, 405, 70, 70);
  ctx.fillRect(490, 405, 70, 70);

  drawPlayer(ctx, player, 475, 390, 2.4, 1, 'idle', performance.now() / 500);

  ctx.fillStyle = '#1c2b3f';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText('캐릭터 장비창', 408, 505);

  const startX = 620;
  const startY = 165;
  const cell = 64;

  for (let i = 0; i < 30; i++) {
    ctx.fillStyle = '#eef5ff';
    ctx.fillRect(startX + (i % 5) * cell, startY + Math.floor(i / 5) * cell, 54, 54);

    ctx.strokeStyle = '#9db5d1';
    ctx.strokeRect(startX + (i % 5) * cell, startY + Math.floor(i / 5) * cell, 54, 54);
  }

  player.inventory.forEach((item, index) => {
    const x = startX + (index % 5) * cell;
    const y = startY + Math.floor(index / 5) * cell;

    drawItemIcon(item, x + 27, y + 27);

    ctx.fillStyle = '#111';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(item.qty || 1, x + 38, y + 49);
  });

  ctx.fillStyle = '#1c2b3f';
  ctx.font = '18px sans-serif';
  ctx.fillText('M 키로 닫기', 785, 565);
}

function drawItemIcon(item, x, y) {
  ctx.save();
  ctx.translate(x, y);

  if (item.id === 'red_potion') {
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(-10, -8, 20, 24);

    ctx.fillStyle = '#ffd8d8';
    ctx.fillRect(-5, -15, 10, 8);
  } else {
    ctx.strokeStyle = '#70481f';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(-13, 8);
    ctx.lineTo(13, 8);
    ctx.stroke();

    ctx.fillStyle = '#ced4da';
    ctx.fillRect(-9, -2, 18, 10);
  }

  ctx.restore();
}

function drawPreview() {
  pctx.clearRect(0, 0, preview.width, preview.height);

  pctx.fillStyle = '#1d2636';
  pctx.fillRect(0, 0, preview.width, preview.height);

  drawPlayer(
    pctx,
    {
      character: {
        name: document.getElementById('charName')?.value || '초보자',
        ...selected
      },
      levelUp: 0
    },
    140,
    260,
    2.35,
    1,
    'run',
    performance.now() / 400
  );

  requestAnimationFrame(() => {
    if (!characterScreen.classList.contains('hidden')) {
      drawPreview();
    }
  });
}

function drawMenuPreview(character) {
  mctx.clearRect(0, 0, menuPreview.width, menuPreview.height);

  mctx.fillStyle = '#1d2636';
  mctx.fillRect(0, 0, menuPreview.width, menuPreview.height);

  drawPlayer(
    mctx,
    {
      character,
      levelUp: 0
    },
    120,
    220,
    2.3,
    1,
    'idle',
    performance.now() / 500
  );
}

function rects(x, y, w, h, x2, y2, w2, h2) {
  return x < x2 + w2 && x + w > x2 && y < y2 + h2 && y + h > y2;
}

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rgbToHex(value) {
  if (!value.startsWith('rgb')) return value;

  const nums = value.match(/\d+/g).map(Number);

  return '#' + nums
    .slice(0, 3)
    .map(number => number.toString(16).padStart(2, '0'))
    .join('');
}

function loop(now) {
  const dt = Math.min(.033, (now - last) / 1000);
  last = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}

boot();
requestAnimationFrame(loop);
