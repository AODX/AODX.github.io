/* =========================================================
   Pixel RPG Clean Full Version
   - public/assets/references/player_body_sheet.png 사용
   - 로그인 / 캐릭터 생성 / 캐릭터 선택 유지
   - 마을 / 포탈 / 사냥터 / 몬스터 / 이동 / 점프 / 기본공격 구현
   - 기존 누적 패치 제거용 전체 교체판
========================================================= */

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
   Body Sheet
   현재 Git 구조:
   public/assets/references/player_body_sheet.png
========================================================= */

const bodySheet = new Image();
bodySheet.src = '/assets/references/player_body_sheet.png?v=body-sheet-03';

let bodySheetReady = false;
let processedSheet = null;

bodySheet.onload = () => {
  bodySheetReady = true;
  processedSheet = makeTransparentSheet(bodySheet);
  console.log('[Pixel RPG] body sheet loaded:', bodySheet.width, bodySheet.height);
};

bodySheet.onerror = () => {
  bodySheetReady = false;
  console.warn('[Pixel RPG] body sheet not found. fallback body will be used.');
};

/*
  사용자가 올린 몸체 시트는 정렬된 게임용 스프라이트가 아니라
  여러 동작이 모인 참고 시트이기 때문에, 대표 포즈 좌표를 사용한다.

  좌표가 조금 안 맞으면 BODY_FRAMES의 x, y만 조정하면 된다.
*/
const BODY_FRAMES = {
  idle: [
    { x: 8, y: 8, w: 44, h: 62 },
    { x: 58, y: 8, w: 44, h: 62 }
  ],
  walk: [
    { x: 108, y: 8, w: 44, h: 62 },
    { x: 158, y: 8, w: 44, h: 62 },
    { x: 208, y: 8, w: 44, h: 62 },
    { x: 258, y: 8, w: 44, h: 62 }
  ],
  jump: [
    { x: 360, y: 8, w: 46, h: 64 },
    { x: 410, y: 8, w: 46, h: 64 }
  ],
  attack: [
    { x: 10, y: 205, w: 58, h: 68 },
    { x: 78, y: 205, w: 58, h: 68 },
    { x: 146, y: 205, w: 64, h: 68 },
    { x: 220, y: 205, w: 68, h: 68 }
  ]
};

const game = {
  ready: false,
  scene: 'town',
  width: 3300,
  ground: 548,
  cameraX: 0,
  last: performance.now(),

  portals: [],
  npcs: [],
  monsters: [],
  particles: [],
  texts: [],

  player: createDefaultPlayer()
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

    level: 1,
    exp: 0,
    nextExp: 80,

    hp: 120,
    maxHp: 120,
    mp: 40,
    maxMp: 40,

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

  const save = user?.save;
  const p = save?.player;
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

  const savedPlayer = save?.player || {};

  game.player = {
    ...createDefaultPlayer(),
    ...savedPlayer,
    character: {
      ...createDefaultPlayer().character,
      ...(savedPlayer.character || {})
    }
  };

  if (!game.player.character.job) {
    game.player.character.job = 'beginner';
  }

  enterTown();

  game.player.x = savedPlayer.x || 260;
  game.player.y = game.ground;
  game.player.vx = 0;
  game.player.vy = 0;
  game.player.grounded = true;

  game.ready = true;
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
    }
  };

  try {
    await api('/api/save', save);
    makeText('저장 완료', game.player.x, game.player.y - 110, '#9bf6ff');
  } catch {
    makeText('저장 실패', game.player.x, game.player.y - 110, '#ff8787');
  }
}

function logout() {
  token = '';
  currentUser = null;
  localStorage.removeItem('pixel-rpg-token');
  showAuth();
}

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
  enterTown();

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
   Scene
========================================================= */

function enterTown() {
  game.scene = 'town';
  game.width = 3300;
  game.ground = 548;

  game.portals = [
    { x: 2860, y: 548, to: 'field', label: '사냥터' }
  ];

  game.npcs = [
    {
      name: '장로 구름',
      x: 620,
      y: 548,
      character: { skin: '#ffd6a6', hair: '#d9dde8', hairStyle: 'bob', faceStyle: 'normal' }
    },
    {
      name: '교관',
      x: 1040,
      y: 548,
      character: { skin: '#f1c28e', hair: '#5a2f1c', hairStyle: 'short', faceStyle: 'cool' }
    },
    {
      name: '상인',
      x: 1450,
      y: 548,
      character: { skin: '#ffd6a6', hair: '#6b4b32', hairStyle: 'basic', faceStyle: 'bright' }
    }
  ];

  game.monsters = [];
}

function enterField() {
  game.scene = 'field';
  game.width = 4200;
  game.ground = 566;

  game.portals = [
    { x: 120, y: 566, to: 'town', label: '마을' }
  ];

  game.npcs = [];
  game.monsters = [];

  for (let i = 0; i < 9; i++) {
    game.monsters.push({
      type: 'slime',
      x: 520 + i * 180,
      y: 566,
      hp: 40,
      maxHp: 40,
      face: i % 2 ? -1 : 1,
      time: Math.random() * 10,
      hit: 0,
      dead: false
    });
  }

  for (let i = 0; i < 5; i++) {
    game.monsters.push({
      type: 'mushroom',
      x: 1300 + i * 260,
      y: 566,
      hp: 70,
      maxHp: 70,
      face: i % 2 ? -1 : 1,
      time: Math.random() * 10,
      hit: 0,
      dead: false
    });
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

  if (key === 'j') attack();
  if (key === 'e') usePortal();
  if (key === 's') saveGame();
});

window.addEventListener('keyup', e => {
  const key = String(e.key || '').toLowerCase();
  keys.delete(key);
});

function usePortal() {
  const p = game.player;

  for (const portal of game.portals) {
    if (Math.abs(p.x - portal.x) < 95) {
      if (portal.to === 'field') {
        enterField();
        p.x = 220;
      } else {
        enterTown();
        p.x = 2720;
      }

      p.y = game.ground;
      p.vx = 0;
      p.vy = 0;
      p.grounded = true;

      return;
    }
  }
}

function attack() {
  const p = game.player;

  if (p.attackTime > 0) return;

  p.attackTime = 0.34;
  p.anim = 'attack';
  p.animTime = 0;

  makeSlash(p.x + p.face * 52, p.y - 68, p.face);

  if (game.scene !== 'field') return;

  for (const m of game.monsters) {
    if (m.dead) continue;

    const dx = m.x - p.x;
    const dy = Math.abs(m.y - p.y);

    if (Math.sign(dx) === p.face && Math.abs(dx) < 110 && dy < 90) {
      m.hp -= 25;
      m.hit = 0.18;
      m.x += p.face * 24;

      makeText('-25', m.x, m.y - 70, '#ff6b6b');

      if (m.hp <= 0) {
        m.dead = true;
        makeText('EXP +15', m.x, m.y - 94, '#c0eb75');

        p.exp += 15;

        if (p.exp >= p.nextExp) {
          p.exp -= p.nextExp;
          p.level += 1;
          p.nextExp = Math.floor(p.nextExp * 1.35 + 30);
          p.hp = p.maxHp;
          p.mp = p.maxMp;
          makeText('LEVEL UP!', p.x, p.y - 130, '#ffe066');
        }

        setTimeout(() => {
          m.dead = false;
          m.hp = m.maxHp;
          m.x += 320;
          if (m.x > game.width - 200) m.x = 520;
        }, 3000);
      }
    }
  }
}

/* =========================================================
   Update
========================================================= */

function update(dt) {
  if (!game.ready) return;

  const p = game.player;

  const left = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  const jump = keys.has(' ') || keys.has('arrowup');

  if (left) {
    p.vx = -250;
    p.face = -1;
  } else if (right) {
    p.vx = 250;
    p.face = 1;
  } else {
    p.vx *= Math.pow(0.001, dt);
    if (Math.abs(p.vx) < 1) p.vx = 0;
  }

  if (jump && p.grounded) {
    p.vy = -560;
    p.grounded = false;
  }

  p.vy += 1550 * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  if (p.y >= game.ground) {
    p.y = game.ground;
    p.vy = 0;
    p.grounded = true;
  }

  p.x = clamp(p.x, 70, game.width - 80);

  p.animTime += dt;
  p.attackTime = Math.max(0, p.attackTime - dt);

  if (p.attackTime > 0) {
    p.anim = 'attack';
  } else if (!p.grounded) {
    p.anim = 'jump';
  } else if (Math.abs(p.vx) > 10) {
    p.anim = 'walk';
  } else {
    p.anim = 'idle';
  }

  game.cameraX += (
    clamp(p.x - W * 0.42, 0, Math.max(0, game.width - W)) - game.cameraX
  ) * Math.min(1, dt * 8);

  updateMonsters(dt);
  updateParticles(dt);
  updateTexts(dt);
}

function updateMonsters(dt) {
  for (const m of game.monsters) {
    if (m.dead) continue;

    m.time += dt;
    m.hit = Math.max(0, m.hit - dt);

    if (m.type === 'slime') {
      m.x += Math.sin(m.time * 2) * 10 * dt;
    } else {
      m.x += m.face * 22 * dt;

      if (Math.random() < dt * 0.35) {
        m.face *= -1;
      }
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

/* =========================================================
   Draw
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
  drawMonsters();
  drawPlayer(game.player, game.player.x, game.player.y, 2.1);

  drawParticles();
  drawTexts();

  ctx.restore();

  drawHud();
}

function drawMenuBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#65caff');
  g.addColorStop(1, '#c9f3ff');

  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

function drawWorld() {
  const sky = ctx.createLinearGradient(0, 0, 0, H);

  if (game.scene === 'field') {
    sky.addColorStop(0, '#7fd7ff');
    sky.addColorStop(0.7, '#d9f8ff');
    sky.addColorStop(1, '#eaffcf');
  } else {
    sky.addColorStop(0, '#65caff');
    sky.addColorStop(0.7, '#d9f8ff');
    sky.addColorStop(1, '#eaffcf');
  }

  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, game.width, H);

  for (let i = 0; i < 18; i++) {
    drawCloud(
      110 + i * 190 + Math.sin(performance.now() / 1000 + i) * 14,
      70 + (i % 4) * 38,
      1 + (i % 3) * 0.16
    );
  }

  ctx.fillStyle = game.scene === 'field' ? '#8fbddd' : '#8ecaea';
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

  ctx.fillStyle = game.scene === 'field' ? '#72b36f' : '#7fc879';

  for (let x = -120; x < game.width + 180; x += 165) {
    ctx.beginPath();
    ctx.ellipse(x, game.ground - 72, 150, 68, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  if (game.scene === 'town') {
    drawHouse(160, 470, 1.08);
    drawHouse(620, 438, 1.0);
    drawHouse(1190, 456, 1.05);
    drawHouse(1760, 438, 1.0);
    drawHouse(2460, 468, 1.05);

    drawTree(80, 548, 1.2);
    drawTree(500, 548, 1.0);
    drawTree(1510, 548, 1.15);
    drawTree(2220, 548, 1.05);
  } else {
    for (let i = 0; i < 28; i++) {
      drawPine(90 + i * 160, game.ground, 0.9 + (i % 3) * 0.12);
    }
  }

  ctx.fillStyle = game.scene === 'field' ? '#67bd55' : '#91d65e';
  ctx.fillRect(0, game.ground, game.width, 28);

  ctx.fillStyle = game.scene === 'field' ? '#6d4f37' : '#8d6740';
  ctx.fillRect(0, game.ground + 28, game.width, H - game.ground);

  for (let x = 0; x < game.width; x += 42) {
    ctx.fillStyle = x % 84 === 0 ? '#6e4d34' : '#987048';
    ctx.fillRect(x, game.ground + 38, 38, H - game.ground - 38);
  }

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(game.scene === 'town' ? '초보자 마을' : '수련의 숲', 34, 46);
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
        ...npc.character
      },
      anim: 'idle',
      animTime: performance.now() / 1000,
      face: 1
    };

    drawPlayer(fake, npc.x, npc.y, 1.8);

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 15px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(npc.name, npc.x, npc.y - 104);

    if (Math.abs(game.player.x - npc.x) < 90) {
      ctx.fillStyle = '#ffe066';
      ctx.fillText('E 대화', npc.x, npc.y - 124);
    }
  }
}

function drawMonsters() {
  for (const m of game.monsters) {
    if (m.dead) continue;

    ctx.save();
    ctx.translate(m.x, m.y + Math.sin(m.time * 6) * 2);
    ctx.scale(m.face, 1);

    if (m.hit > 0) ctx.globalAlpha = 0.55;

    if (m.type === 'slime') drawSlime();
    else drawMushroom();

    ctx.restore();

    ctx.fillStyle = '#0008';
    ctx.fillRect(m.x - 28, m.y - 60, 56, 6);

    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(m.x - 28, m.y - 60, 56 * clamp(m.hp / m.maxHp, 0, 1), 6);
  }
}

/* =========================================================
   Character Drawing
========================================================= */

function drawPlayer(player, x, y, scale) {
  const frame = getBodyFrame(player.anim, player.animTime);

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(player.face * scale, scale);

  if (player.anim === 'jump') {
    ctx.rotate(player.vy < 0 ? -0.08 : 0.08);
  }

  ctx.fillStyle = 'rgba(0,0,0,0.24)';
  ctx.beginPath();
  ctx.ellipse(0, 3, 18, 4.2, 0, 0, Math.PI * 2);
  ctx.fill();

  if (bodySheetReady && processedSheet && frame && frameIsInside(frame)) {
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
  if (!bodySheetReady || !processedSheet) return false;

  return (
    frame.x >= 0 &&
    frame.y >= 0 &&
    frame.x + frame.w <= processedSheet.width &&
    frame.y + frame.h <= processedSheet.height
  );
}

function drawSheetBody(c, player, frame) {
  const ch = player.character || game.player.character;

  const temp = document.createElement('canvas');
  temp.width = frame.w;
  temp.height = frame.h;

  const tc = temp.getContext('2d');
  tc.imageSmoothingEnabled = false;
  tc.drawImage(processedSheet, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);

  recolorSkin(tc, frame.w, frame.h, ch.skin || '#ffd6a6');

  /*
    몸체 시트를 실제로 그린다.
    시트의 포즈 자체를 사용하므로 걷기/점프/공격은 시트 프레임을 따라간다.
  */
  const dw = 46;
  const dh = 66;

  c.drawImage(temp, -dw / 2, -dh - 5, dw, dh);

  /*
    커스터마이징용 머리/표정은 몸체 위에 가볍게 얹는다.
    시트 자체가 머리 없는 기본 몸체라면 자연스럽게 보이고,
    시트에 얼굴이 있어도 위에 덮어서 사용 가능.
  */
  drawCustomHair(c, ch);
  drawCustomFace(c, ch);
}

function drawFallbackBody(c, player) {
  const ch = player.character || game.player.character;

  const walk = Math.sin(player.animTime * 13);
  const run = player.anim === 'walk';
  const leg = run ? walk * 8 : 0;
  const arm = run ? -walk * 7 : 0;

  c.lineCap = 'round';

  c.strokeStyle = '#171717';
  c.lineWidth = 5;

  c.beginPath();
  c.moveTo(-6, -31);
  c.lineTo(-11 + leg, -11);
  c.stroke();

  c.beginPath();
  c.moveTo(6, -31);
  c.lineTo(11 - leg, -11);
  c.stroke();

  c.strokeStyle = ch.skin || '#ffd6a6';
  c.lineWidth = 3.5;

  c.beginPath();
  c.moveTo(-6, -31);
  c.lineTo(-11 + leg, -11);
  c.stroke();

  c.beginPath();
  c.moveTo(6, -31);
  c.lineTo(11 - leg, -11);
  c.stroke();

  c.fillStyle = '#171717';
  roundRectCtx(c, -21 + leg, -12, 20, 7, 1.5);
  roundRectCtx(c, 1 - leg, -12, 20, 7, 1.5);

  c.fillStyle = '#5a3821';
  roundRectCtx(c, -19 + leg, -10.5, 16, 4.5, 1);
  roundRectCtx(c, 3 - leg, -10.5, 16, 4.5, 1);

  c.fillStyle = '#171717';
  roundRectCtx(c, -17, -66, 34, 35, 8);

  c.fillStyle = '#4f93f5';
  roundRectCtx(c, -14.5, -63.5, 29, 31, 7);

  c.fillStyle = '#f8f9ff';
  c.fillRect(-11, -61, 22, 5.5);

  c.fillStyle = '#2f6fbd';
  roundRectCtx(c, -12, -40, 24, 8, 3);

  let lx = -19 + arm;
  let ly = -47;
  let rx = 19 - arm;
  let ry = -47;

  if (player.anim === 'attack') {
    const atk = Math.sin(Math.min(1, player.animTime * 12) * Math.PI);
    rx = 22 + atk * 25;
    ry = -51;
  }

  if (player.anim === 'jump') {
    lx = -21;
    rx = 21;
    ly = -54;
    ry = -54;
  }

  c.strokeStyle = '#171717';
  c.lineWidth = 5.5;

  c.beginPath();
  c.moveTo(-14, -57);
  c.lineTo(lx, ly);
  c.stroke();

  c.beginPath();
  c.moveTo(14, -57);
  c.lineTo(rx, ry);
  c.stroke();

  c.strokeStyle = ch.skin || '#ffd6a6';
  c.lineWidth = 3.4;

  c.beginPath();
  c.moveTo(-14, -57);
  c.lineTo(lx, ly);
  c.stroke();

  c.beginPath();
  c.moveTo(14, -57);
  c.lineTo(rx, ry);
  c.stroke();

  c.fillStyle = '#171717';
  circleCtx(c, lx, ly, 4.1);
  circleCtx(c, rx, ry, 4.1);

  c.fillStyle = ch.skin || '#ffd6a6';
  circleCtx(c, lx, ly, 2.8);
  circleCtx(c, rx, ry, 2.8);

  c.fillStyle = '#171717';
  c.fillRect(-5.5, -72, 11, 9);

  c.fillStyle = ch.skin || '#ffd6a6';
  c.fillRect(-3.7, -71, 7.4, 8);

  c.fillStyle = '#171717';
  circleCtx(c, -19.5, -91, 5.2);
  circleCtx(c, 19.5, -91, 5.2);

  c.beginPath();
  c.ellipse(0, -94, 22, 24, 0, 0, Math.PI * 2);
  c.fill();

  c.fillStyle = ch.skin || '#ffd6a6';
  circleCtx(c, -19, -91, 3.8);
  circleCtx(c, 19, -91, 3.8);

  c.beginPath();
  c.ellipse(0, -94, 19.2, 21.2, 0, 0, Math.PI * 2);
  c.fill();

  drawCustomHair(c, ch);
  drawCustomFace(c, ch);
}

function drawCustomHair(c, ch) {
  const hair = ch.hair || '#2b160e';
  const style = ch.hairStyle || 'basic';

  c.fillStyle = '#171717';

  if (style === 'spiky') {
    c.beginPath();
    c.moveTo(-21, -96);
    c.lineTo(-16, -119);
    c.lineTo(-8, -104);
    c.lineTo(0, -121);
    c.lineTo(8, -104);
    c.lineTo(16, -119);
    c.lineTo(21, -96);
    c.lineTo(17, -84);
    c.lineTo(-17, -84);
    c.closePath();
    c.fill();
  } else {
    roundRectCtx(c, -22, -117, 44, 28, 13);
    c.fillRect(-20, -103, 40, 14);
  }

  c.fillStyle = hair;

  if (style === 'spiky') {
    c.beginPath();
    c.moveTo(-18, -97);
    c.lineTo(-14, -114);
    c.lineTo(-7, -101);
    c.lineTo(0, -117);
    c.lineTo(7, -101);
    c.lineTo(14, -114);
    c.lineTo(18, -97);
    c.lineTo(15, -86);
    c.lineTo(-15, -86);
    c.closePath();
    c.fill();
  } else {
    roundRectCtx(c, -19.5, -114.5, 39, 24, 11);
    c.fillRect(-17, -101, 34, 13);
  }

  if (style === 'short') {
    for (let i = -15; i <= 9; i += 6) {
      c.beginPath();
      c.moveTo(i, -100);
      c.lineTo(i + 4, -88);
      c.lineTo(i + 9, -100);
      c.fill();
    }
  }

  if (style === 'pony') {
    c.beginPath();
    c.ellipse(22, -94, 7, 13, -0.3, 0, Math.PI * 2);
    c.fill();
  }

  if (style === 'wave' || style === 'bob') {
    circleCtx(c, -16, -86, 5.5);
    circleCtx(c, 16, -86, 5.5);

    if (style === 'bob') {
      c.fillRect(-16, -91, 32, 7);
    }
  }

  c.beginPath();
  c.moveTo(-19, -101);
  c.lineTo(-12, -113);
  c.lineTo(-5, -99);
  c.lineTo(2, -114);
  c.lineTo(9, -99);
  c.lineTo(18, -111);
  c.lineTo(19, -90);
  c.lineTo(-19, -90);
  c.closePath();
  c.fill();

  c.fillStyle = 'rgba(255,255,255,0.2)';
  c.fillRect(-9, -111, 8, 2);
}

function drawCustomFace(c, ch) {
  const face = ch.faceStyle || 'normal';

  c.fillStyle = 'rgba(255,120,150,0.22)';
  c.fillRect(-14, -90, 5, 2.5);
  c.fillRect(9, -90, 5, 2.5);

  if (face === 'sleepy') {
    c.strokeStyle = '#111';
    c.lineWidth = 1.5;

    c.beginPath();
    c.moveTo(-10, -97);
    c.lineTo(-4, -97);
    c.moveTo(4, -97);
    c.lineTo(10, -97);
    c.stroke();
  } else {
    c.fillStyle = '#111';
    c.fillRect(-9, -98, 3.8, 6);
    c.fillRect(5.2, -98, 3.8, 6);

    c.fillStyle = '#fff';
    c.fillRect(-8.2, -97.2, 1.4, 1.8);
    c.fillRect(6, -97.2, 1.4, 1.8);
  }

  c.fillStyle = '#111';

  if (face === 'bright' || face === 'cute') {
    c.strokeStyle = '#111';
    c.lineWidth = 1.5;

    c.beginPath();
    c.arc(0, -88, 3.5, 0, Math.PI);
    c.stroke();
  } else {
    c.fillRect(-3, -88, 6, 1.7);
  }
}

function drawAttackArc(c, t) {
  c.strokeStyle = '#ffe066';
  c.lineWidth = 4;
  c.beginPath();
  c.arc(35, -50, 15 + t * 17, -0.7, 0.8);
  c.stroke();

  c.strokeStyle = '#ff922b';
  c.lineWidth = 2.5;
  c.beginPath();
  c.arc(37, -50, 10 + t * 15, -0.7, 0.78);
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
  pc.scale(2.15, 2.15);

  if (bodySheetReady && processedSheet && frameIsInside(BODY_FRAMES.idle[0])) {
    drawSheetBodyOnContext(pc, previewPlayer, BODY_FRAMES.idle[0]);
  } else {
    drawFallbackBodyOnContext(pc, previewPlayer);
  }

  pc.restore();
}

function drawSheetBodyOnContext(c, player, frame) {
  const ch = player.character || selected;

  const temp = document.createElement('canvas');
  temp.width = frame.w;
  temp.height = frame.h;

  const tc = temp.getContext('2d');
  tc.imageSmoothingEnabled = false;
  tc.drawImage(processedSheet, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);

  recolorSkin(tc, frame.w, frame.h, ch.skin || '#ffd6a6');

  const dw = 46;
  const dh = 66;

  c.drawImage(temp, -dw / 2, -dh - 5, dw, dh);

  drawCustomHair(c, ch);
  drawCustomFace(c, ch);
}

function drawFallbackBodyOnContext(c, player) {
  const savedCtx = ctx;
  const fake = {
    save: () => {},
    restore: () => {}
  };

  drawFallbackBody(c, player);

  return fake || savedCtx;
}

/* =========================================================
   HUD / Effects
========================================================= */

function drawHud() {
  const p = game.player;

  ctx.fillStyle = 'rgba(17,24,39,0.88)';
  roundRectCtx(ctx, 14, 12, 700, 72, 12);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`LV. ${p.level || 1}`, 32, 38);
  ctx.fillText(p.character?.name || '초보자', 96, 38);

  ctx.fillStyle = '#4f9cff';
  ctx.fillText('초보자', 96, 60);

  bar(220, 22, 160, 15, p.hp / p.maxHp, '#ff4d4f', 'HP');
  bar(220, 46, 160, 15, p.mp / p.maxMp, '#4dabf7', 'MP');
  bar(400, 22, 170, 15, p.exp / p.nextExp, '#ffd43b', 'EXP');

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 14px sans-serif';
  ctx.fillText('A/D 이동 · Space 점프 · J 공격 · E 포탈 · S 저장', 400, 61);
}

function bar(x, y, w, h, ratio, color, label) {
  ctx.fillStyle = '#0008';
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = color;
  ctx.fillRect(x, y, w * clamp(ratio, 0, 1), h);

  ctx.strokeStyle = '#ffffff99';
  ctx.strokeRect(x, y, w, h);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText(label, x + 5, y + h - 3);
}

function makeSlash(x, y, face) {
  game.particles.push({
    type: 'slash',
    x,
    y,
    vx: face * 80,
    vy: -30,
    life: 0.25,
    face
  });
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

      ctx.strokeStyle = '#ffe066';
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.arc(0, 0, 30, -0.7, 0.8);
      ctx.stroke();

      ctx.strokeStyle = '#ff922b';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(2, 0, 22, -0.7, 0.8);
      ctx.stroke();

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
   World Assets
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

function drawHouse(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  ctx.fillStyle = '#6b472c';
  ctx.fillRect(-3, 25, 156, 92);

  ctx.fillStyle = '#8a6237';
  ctx.fillRect(0, 28, 150, 88);

  ctx.fillStyle = '#dcc879';
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

function drawTree(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  ctx.fillStyle = '#764927';
  ctx.fillRect(-10, -78, 20, 78);

  ctx.fillStyle = '#2f7f3b';
  circleCtx(ctx, -28, -82, 28);
  circleCtx(ctx, 0, -105, 34);
  circleCtx(ctx, 31, -82, 28);
  circleCtx(ctx, 0, -64, 30);

  ctx.fillStyle = '#56b85d';
  circleCtx(ctx, -9, -113, 13);

  ctx.restore();
}

function drawPine(x, y, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);

  ctx.fillStyle = '#70472e';
  ctx.fillRect(-8, -82, 16, 82);

  ctx.fillStyle = '#2b6f35';

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

function drawSlime() {
  ctx.fillStyle = '#171717';
  ctx.beginPath();
  ctx.ellipse(0, -18, 25, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#6ee76b';
  ctx.beginPath();
  ctx.ellipse(0, -18, 22, 17, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#3ccf51';
  ctx.beginPath();
  ctx.ellipse(0, -29, 12, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#183a20';
  ctx.fillRect(-8, -22, 4, 4);
  ctx.fillRect(4, -22, 4, 4);
}

function drawMushroom() {
  ctx.fillStyle = '#171717';
  ctx.beginPath();
  ctx.ellipse(0, -35, 27, 20, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#d98233';
  ctx.beginPath();
  ctx.ellipse(0, -34, 24, 18, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#fff0c9';
  ctx.fillRect(-18, -34, 36, 20);

  ctx.fillStyle = '#7a4d27';
  ctx.fillRect(-7, -14, 14, 16);

  ctx.fillStyle = '#2c1a10';
  ctx.fillRect(-10, -27, 4, 4);
  ctx.fillRect(6, -27, 4, 4);
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
      g < 220 &&
      b > 55 &&
      b < 180 &&
      r > g &&
      g > b;

    if (looksLikeSkin) {
      const shade = (r + g + b) / 3 / 180;

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
  const clean = String(hex || '#ffd6a6').replace('#', '');

  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
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
