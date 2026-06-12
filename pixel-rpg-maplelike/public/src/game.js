const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const W = canvas.width;
const H = canvas.height;
const GROUND = 570;
const keys = new Set();
let cameraX = 0;
let shake = 0;
let flash = 0;
let last = performance.now();

const state = {
  mapWidth: 3600,
  particles: [],
  damageTexts: [],
  hitboxes: [],
  monsters: [],
  bgBirds: Array.from({ length: 18 }, () => ({ x: Math.random() * 3600, y: 70 + Math.random() * 220, s: .5 + Math.random() * 1.4 })),
  player: {
    x: 160, y: GROUND, vx: 0, vy: 0, w: 42, h: 58, face: 1,
    hp: 120, maxHp: 120, mp: 80, maxMp: 80, level: 1, exp: 0, nextExp: 100,
    attackCd: 0, skillCd: 0, anim: 'idle', animTime: 0, grounded: true, inv: 0
  }
};

function resetMonsters() {
  state.monsters = [];
  for (let i = 0; i < 14; i++) {
    const isGolem = i % 5 === 4;
    state.monsters.push({
      type: isGolem ? 'golem' : 'slime',
      x: 620 + i * 210 + Math.random() * 90,
      y: GROUND,
      vx: isGolem ? 10 : 24,
      w: isGolem ? 58 : 42,
      h: isGolem ? 70 : 34,
      hp: isGolem ? 120 : 48,
      maxHp: isGolem ? 120 : 48,
      exp: isGolem ? 40 : 18,
      face: -1,
      animTime: Math.random() * 10,
      hit: 0,
      dead: false
    });
  }
}
resetMonsters();

addEventListener('keydown', e => {
  keys.add(e.key.toLowerCase());
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(e.key.toLowerCase())) e.preventDefault();
  if (e.key.toLowerCase() === 's') saveGame();
  if (e.key.toLowerCase() === 'r') { localStorage.removeItem('pixel-rpg-local'); location.reload(); }
});
addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));

async function loadGame() {
  const local = JSON.parse(localStorage.getItem('pixel-rpg-local') || 'null');
  try {
    const res = await fetch('/api/save');
    const data = await res.json();
    const save = data.save || local;
    if (save) Object.assign(state.player, save.player || {});
  } catch { if (local) Object.assign(state.player, local.player || {}); }
}

async function saveGame() {
  const save = { player: pick(state.player, ['x','y','hp','mp','level','exp','nextExp']) };
  localStorage.setItem('pixel-rpg-local', JSON.stringify(save));
  try { await fetch('/api/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(save) }); } catch {}
  toast('저장 완료');
}
function pick(o, props) { return Object.fromEntries(props.map(k => [k, o[k]])); }
function toast(text) { state.damageTexts.push({ text, x: state.player.x, y: state.player.y - 90, vy: -22, life: 1.2, color: '#9bf6ff', size: 22 }); }

function update(dt) {
  const p = state.player;
  p.animTime += dt;
  p.attackCd = Math.max(0, p.attackCd - dt);
  p.skillCd = Math.max(0, p.skillCd - dt);
  p.inv = Math.max(0, p.inv - dt);
  p.mp = Math.min(p.maxMp, p.mp + 6 * dt);

  const left = keys.has('a') || keys.has('arrowleft');
  const right = keys.has('d') || keys.has('arrowright');
  const jump = keys.has(' ') || keys.has('w') || keys.has('arrowup');
  const atk = keys.has('j');
  const fire = keys.has('k');
  const bolt = keys.has('l');

  p.vx *= Math.pow(0.0008, dt);
  if (left) { p.vx -= 1300 * dt; p.face = -1; }
  if (right) { p.vx += 1300 * dt; p.face = 1; }
  p.vx = clamp(p.vx, -260, 260);
  if (jump && p.grounded) { p.vy = -560; p.grounded = false; burst(p.x, p.y, 10, '#d1d5db', 80); }

  if (atk && p.attackCd <= 0) meleeAttack();
  if (fire && p.skillCd <= 0 && p.mp >= 18) { p.mp -= 18; p.skillCd = .42; spawnSkill('fire'); }
  if (bolt && p.skillCd <= 0 && p.mp >= 25) { p.mp -= 25; p.skillCd = .65; spawnSkill('bolt'); }

  p.vy += 1250 * dt;
  p.x = clamp(p.x + p.vx * dt, 40, state.mapWidth - 60);
  p.y += p.vy * dt;
  if (p.y > GROUND) { p.y = GROUND; p.vy = 0; p.grounded = true; }

  p.anim = !p.grounded ? 'jump' : (p.attackCd > .18 ? 'attack' : (Math.abs(p.vx) > 35 ? 'run' : 'idle'));

  updateMonsters(dt);
  updateHitboxes(dt);
  updateParticles(dt);
  updateTexts(dt);
  cameraX = clamp(p.x - W * .42, 0, state.mapWidth - W);
  shake = Math.max(0, shake - dt * 28);
  flash = Math.max(0, flash - dt * 1.8);
}

function meleeAttack() {
  const p = state.player;
  p.attackCd = .34;
  addHitbox(p.x + p.face * 42, p.y - 40, 70, 62, p.face, 24, .09, 'slash');
  arcSlash(p.x + p.face * 44, p.y - 38, p.face, '#ffd166');
}

function spawnSkill(kind) {
  const p = state.player;
  if (kind === 'fire') {
    for (let i = 0; i < 5; i++) {
      state.hitboxes.push({ kind: 'fireball', x: p.x + p.face * (44 + i * 18), y: p.y - 42 + Math.sin(i) * 8, vx: p.face * (470 + i * 25), vy: -25 + i * 8, w: 32, h: 28, dmg: 18, life: .85, age: 0, hit: new Set(), color: '#ff8c1a' });
    }
    shake = 6;
  } else {
    for (let i = 0; i < 4; i++) {
      const x = p.x + p.face * (110 + i * 80);
      state.hitboxes.push({ kind: 'bolt', x, y: p.y - 170, vx: 0, vy: 0, w: 52, h: 170, dmg: 34, life: .26 + i * .03, age: -i * .05, hit: new Set(), color: '#9bf6ff' });
    }
    flash = .35; shake = 12;
  }
}

function addHitbox(x, y, w, h, face, dmg, life, kind) {
  state.hitboxes.push({ kind, x, y, vx: 0, vy: 0, w, h, face, dmg, life, age: 0, hit: new Set(), color: '#fff' });
}

function updateHitboxes(dt) {
  for (const h of state.hitboxes) {
    h.age += dt;
    if (h.age < 0) continue;
    h.x += (h.vx || 0) * dt;
    h.y += (h.vy || 0) * dt;
    if (h.kind === 'fireball') {
      burst(h.x, h.y, 2, ['#ffb703','#fb5607','#ffd166'], 40);
    }
    for (const m of state.monsters) {
      if (m.dead || h.hit.has(m)) continue;
      if (rects(h.x - h.w/2, h.y - h.h/2, h.w, h.h, m.x - m.w/2, m.y - m.h, m.w, m.h)) {
        h.hit.add(m); damageMonster(m, h.dmg);
      }
    }
  }
  state.hitboxes = state.hitboxes.filter(h => h.age < h.life && h.x > -100 && h.x < state.mapWidth + 100);
}

function damageMonster(m, dmg) {
  const real = Math.round(dmg * (0.85 + Math.random() * .4));
  m.hp -= real; m.hit = .15; shake = Math.max(shake, 4);
  state.damageTexts.push({ text: String(real), x: m.x, y: m.y - m.h - 10, vy: -45, life: .75, color: '#ffe66d', size: 26 });
  burst(m.x, m.y - m.h/2, 12, ['#fff','#ffd166','#fb5607'], 120);
  if (m.hp <= 0) killMonster(m);
}
function killMonster(m) {
  m.dead = true;
  burst(m.x, m.y - m.h/2, 38, m.type === 'golem' ? ['#9ca3af','#6b7280','#d1d5db'] : ['#90be6d','#43aa8b','#d9ed92'], 190);
  gainExp(m.exp);
  setTimeout(() => {
    Object.assign(m, { x: 650 + Math.random() * (state.mapWidth - 800), hp: m.maxHp, dead: false, hit: 0 });
  }, 1800);
}

function gainExp(amount) {
  const p = state.player;
  p.exp += amount;
  while (p.exp >= p.nextExp) {
    p.exp -= p.nextExp; p.level++; p.nextExp = Math.round(p.nextExp * 1.35); p.maxHp += 12; p.maxMp += 7; p.hp = p.maxHp; p.mp = p.maxMp;
    levelUpEffect();
  }
}
function levelUpEffect() {
  const p = state.player;
  flash = .7; shake = 16;
  toast('LEVEL UP!');
  for (let i = 0; i < 100; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 40 + Math.random() * 80;
    state.particles.push({ x: p.x + Math.cos(a) * r, y: p.y - 45 + Math.sin(a) * r, vx: Math.cos(a) * 50, vy: -160 - Math.random() * 140, life: 1.2, age: 0, size: 2 + Math.random() * 4, color: ['#fff','#ffd60a','#9bf6ff'][i % 3] });
  }
}

function updateMonsters(dt) {
  const p = state.player;
  for (const m of state.monsters) {
    if (m.dead) continue;
    m.animTime += dt;
    m.hit = Math.max(0, m.hit - dt);
    const dx = p.x - m.x;
    if (Math.abs(dx) < 360) m.face = Math.sign(dx) || m.face;
    m.x += m.face * m.vx * dt;
    if (Math.random() < .008 || m.x < 500 || m.x > state.mapWidth - 120) m.face *= -1;
    if (Math.abs(dx) < 48 && p.inv <= 0 && Math.abs(p.y - m.y) < 40) {
      p.hp = Math.max(0, p.hp - (m.type === 'golem' ? 18 : 8));
      p.inv = .75; p.vx = -Math.sign(dx || 1) * 260; p.vy = -260; shake = 10;
      state.damageTexts.push({ text: 'HIT', x: p.x, y: p.y - 90, vy: -40, life: .6, color: '#ff595e', size: 24 });
      if (p.hp <= 0) { p.hp = p.maxHp; p.x = 160; p.y = GROUND; toast('부활!'); }
    }
  }
}

function updateParticles(dt) {
  for (const p of state.particles) { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 330 * dt; }
  state.particles = state.particles.filter(p => p.age < p.life);
}
function updateTexts(dt) {
  for (const t of state.damageTexts) { t.life -= dt; t.y += t.vy * dt; t.vy += 50 * dt; }
  state.damageTexts = state.damageTexts.filter(t => t.life > 0);
}

function draw() {
  ctx.save();
  const sx = (Math.random() - .5) * shake;
  const sy = (Math.random() - .5) * shake;
  ctx.translate(Math.round(sx), Math.round(sy));
  drawBackground();
  ctx.translate(-Math.round(cameraX), 0);
  drawWorld();
  ctx.translate(Math.round(cameraX), 0);
  drawUi();
  if (flash > 0) { ctx.fillStyle = `rgba(255,255,255,${Math.min(.35, flash)})`; ctx.fillRect(0,0,W,H); }
  ctx.restore();
}

function drawBackground() {
  const g = ctx.createLinearGradient(0,0,0,H);
  g.addColorStop(0, '#77c7e8'); g.addColorStop(.55, '#bde7ef'); g.addColorStop(1, '#2f604b');
  ctx.fillStyle = g; ctx.fillRect(0,0,W,H);
  const layers = [
    { y: 170, s: .18, c: '#7aa5be', a: .75 },
    { y: 255, s: .32, c: '#527891', a: .8 },
    { y: 380, s: .58, c: '#355b57', a: .92 }
  ];
  for (const l of layers) {
    ctx.globalAlpha = l.a; ctx.fillStyle = l.c;
    for (let x = -200 - (cameraX*l.s % 500); x < W + 400; x += 160) {
      const h = 120 + ((x*13) % 90);
      ctx.fillRect(x, l.y + 80 - h, 36, h);
      ctx.fillRect(x+45, l.y + 100 - h*.75, 55, h*.75);
      ctx.fillRect(x+112, l.y + 90 - h*.55, 28, h*.55);
      if (l.s > .5) { ctx.beginPath(); ctx.arc(x+80,l.y+70,40,0,Math.PI*2); ctx.fill(); }
    }
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#111827';
  for (const b of state.bgBirds) {
    const x = (b.x - cameraX*.24) % (W+200) - 100;
    ctx.fillRect(x, b.y, 5*b.s, 2*b.s); ctx.fillRect(x+8*b.s, b.y-2*b.s, 5*b.s, 2*b.s);
  }
}

function drawWorld() {
  drawPlatforms();
  for (const m of state.monsters) if (!m.dead) m.type === 'golem' ? drawGolem(m) : drawSlime(m);
  drawHitboxes();
  drawHero(state.player);
  drawParticles();
  drawTexts();
}

function drawPlatforms() {
  ctx.fillStyle = '#2d1f17'; ctx.fillRect(0, GROUND+5, state.mapWidth, 160);
  for (let x = 0; x < state.mapWidth; x += 48) {
    ctx.fillStyle = x % 96 === 0 ? '#8f6c3b' : '#a8824b';
    ctx.fillRect(x, GROUND, 48, 34);
    ctx.strokeStyle = '#5c4033'; ctx.strokeRect(x, GROUND, 48, 34);
  }
  for (let x = 260; x < state.mapWidth; x += 520) {
    ctx.fillStyle = '#5b4034'; ctx.fillRect(x, GROUND-100, 210, 24);
    ctx.fillStyle = '#7f5539'; for (let i=0;i<7;i++) ctx.fillRect(x+i*30, GROUND-98, 26, 18);
  }
  drawRuins(120, GROUND-210); drawRuins(1900, GROUND-260); drawTree(960, GROUND); drawTree(2750, GROUND);
}
function drawRuins(x,y){ ctx.fillStyle='#6b7280'; ctx.fillRect(x,y+50,28,160); ctx.fillRect(x+130,y+20,28,190); ctx.fillRect(x-15,y+45,190,24); ctx.fillStyle='#374151'; ctx.fillRect(x-6,y+70,42,8); ctx.fillRect(x+122,y+45,44,8); }
function drawTree(x,y){ ctx.fillStyle='#6b3f22'; ctx.fillRect(x-18,y-170,36,170); ctx.fillStyle='#31572c'; for(let i=0;i<7;i++){ ctx.beginPath(); ctx.arc(x+(i-3)*23,y-170-Math.sin(i)*24,55,0,Math.PI*2); ctx.fill(); } }

function drawHero(p) {
  const t = p.animTime;
  const bob = p.anim === 'run' ? Math.sin(t*18)*3 : Math.sin(t*5)*2;
  const atk = p.anim === 'attack' ? Math.sin(t*35)*12 : 0;
  ctx.save(); ctx.translate(Math.round(p.x), Math.round(p.y + bob)); ctx.scale(p.face, 1);
  if (p.inv > 0 && Math.floor(t*20)%2===0) ctx.globalAlpha = .45;
  shadow(0, 0, 35);
  // cape
  ctx.fillStyle = '#7f1d1d'; pix(-22,-45,13,35); pix(-26,-20,10,20);
  // legs
  ctx.fillStyle = '#1e293b'; pix(-12,-22,9,24); pix(5,-22,9,24);
  ctx.fillStyle = '#f59e0b'; pix(-14,0,13,7); pix(4,0,13,7);
  // body and head
  ctx.fillStyle = '#2563eb'; pix(-17,-50,34,30); ctx.fillStyle = '#f2b179'; pix(-13,-78,26,24);
  ctx.fillStyle = '#3f2a1d'; pix(-17,-84,34,11); pix(-20,-76,9,14);
  ctx.fillStyle = '#0f172a'; pix(7,-70,4,4);
  // arms and sword
  ctx.fillStyle = '#f2b179'; pix(14,-46,10,21); pix(-23,-46,9,20);
  ctx.strokeStyle = '#e5e7eb'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(19,-40); ctx.lineTo(65+atk,-68+atk*.3); ctx.stroke();
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(22,-40); ctx.lineTo(70+atk,-70+atk*.3); ctx.stroke();
  ctx.restore();
}

function drawSlime(m) {
  const squish = 1 + Math.sin(m.animTime*8)*.09;
  ctx.save(); ctx.translate(m.x, m.y); ctx.scale(m.face, 1);
  shadow(0, 0, 30);
  ctx.scale(1/squish, squish);
  ctx.fillStyle = m.hit ? '#eaffd0' : '#69db7c'; pix(-22,-27,44,27); pix(-16,-36,32,12); pix(-8,-43,16,10);
  ctx.fillStyle = '#123524'; pix(-11,-26,5,5); pix(8,-26,5,5);
  ctx.fillStyle = '#b7efc5'; pix(-16,-36,12,5);
  ctx.restore(); hpBar(m.x, m.y - 54, 52, m.hp / m.maxHp);
}

function drawGolem(m) {
  const swing = Math.sin(m.animTime*4)*5;
  ctx.save(); ctx.translate(m.x, m.y); ctx.scale(m.face, 1);
  shadow(0, 0, 45);
  ctx.fillStyle = m.hit ? '#f8fafc' : '#8d99ae'; pix(-24,-70,48,42); pix(-18,-98,36,28); pix(-34,-55,15,31); pix(20,-55+swing,15,31); pix(-20,-27,14,27); pix(8,-27,14,27);
  ctx.fillStyle = '#374151'; pix(-8,-88,5,5); pix(9,-88,5,5); pix(-15,-73,31,5);
  ctx.fillStyle = '#4ade80'; pix(-26,-101,12,6); pix(8,-104,18,6);
  ctx.restore(); hpBar(m.x, m.y - 112, 72, m.hp / m.maxHp);
}

function drawHitboxes() {
  for (const h of state.hitboxes) {
    if (h.age < 0) continue;
    if (h.kind === 'fireball') {
      ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.age * 15); ctx.fillStyle = '#ffb703'; star(0,0,22,8); ctx.fillStyle = '#fb5607'; star(0,0,14,6); ctx.restore();
    } else if (h.kind === 'bolt') {
      ctx.strokeStyle = '#9bf6ff'; ctx.lineWidth = 6; ctx.beginPath(); let x = h.x, y = h.y; ctx.moveTo(x, y); for(let i=0;i<7;i++){ x += (Math.random()-.5)*35; y += h.h/7; ctx.lineTo(x,y); } ctx.stroke(); ctx.fillStyle='rgba(155,246,255,.18)'; ctx.fillRect(h.x-h.w/2,h.y,h.w,h.h);
    }
  }
}

function drawParticles() { for (const p of state.particles) { ctx.globalAlpha = 1 - p.age/p.life; ctx.fillStyle = Array.isArray(p.color) ? p.color[0] : p.color; pix(p.x, p.y, p.size, p.size); } ctx.globalAlpha = 1; }
function drawTexts() { ctx.textAlign='center'; ctx.font='bold 24px monospace'; for (const t of state.damageTexts) { ctx.globalAlpha = Math.max(0, t.life); ctx.fillStyle = '#000'; ctx.fillText(t.text, t.x+2, t.y+2); ctx.fillStyle=t.color; ctx.font=`bold ${t.size}px monospace`; ctx.fillText(t.text, t.x, t.y); } ctx.globalAlpha=1; }

function drawUi() {
  const p = state.player;
  ctx.fillStyle = 'rgba(15,23,42,.72)'; roundRect(18,18,360,108,16,true);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 22px monospace'; ctx.fillText(`LV ${p.level}  Hero`, 42, 48);
  bar(42,62,290,18,p.hp/p.maxHp,'#ef4444','HP');
  bar(42,86,290,14,p.mp/p.maxMp,'#38bdf8','MP');
  bar(42,108,290,12,p.exp/p.nextExp,'#facc15','EXP');
  ctx.fillStyle = 'rgba(15,23,42,.72)'; roundRect(W-290,18,260,62,12,true);
  ctx.fillStyle='#e5e7eb'; ctx.font='16px monospace'; ctx.fillText('J:Slash  K:Fire  L:Bolt', W-260, 45); ctx.fillText('S:Save  R:Reset', W-260, 68);
}

function bar(x,y,w,h,pct,color,label){ ctx.fillStyle='#111827'; ctx.fillRect(x,y,w,h); ctx.fillStyle=color; ctx.fillRect(x,y,w*clamp(pct,0,1),h); ctx.strokeStyle='#e5e7eb'; ctx.strokeRect(x,y,w,h); ctx.fillStyle='#fff'; ctx.font='bold 11px monospace'; ctx.fillText(label,x+5,y+h-4); }
function hpBar(x,y,w,pct){ ctx.fillStyle='#111827'; ctx.fillRect(x-w/2,y,w,7); ctx.fillStyle='#ef4444'; ctx.fillRect(x-w/2,y,w*clamp(pct,0,1),7); }

function pix(x,y,w,h){ ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h)); }
function shadow(x,y,r){ ctx.fillStyle='rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(x,y+4,r,9,0,0,Math.PI*2); ctx.fill(); }
function burst(x,y,n,colors,power){ for(let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, s=Math.random()*power; state.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-80,life:.35+Math.random()*.55,age:0,size:2+Math.random()*4,color:Array.isArray(colors)?colors[i%colors.length]:colors}); } }
function arcSlash(x,y,face,color){ for(let i=0;i<26;i++){ const a=-1.2+i/25*2.4; state.particles.push({x:x+Math.cos(a)*face*55,y:y+Math.sin(a)*32,vx:face*120,vy:-20,life:.18+i*.004,age:0,size:5,color}); } }
function star(x,y,r,n){ ctx.beginPath(); for(let i=0;i<n*2;i++){ const rr=i%2?r:r*.45; const a=i*Math.PI/n; ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } ctx.closePath(); ctx.fill(); }
function roundRect(x,y,w,h,r,fill){ ctx.beginPath(); ctx.roundRect(x,y,w,h,r); if(fill) ctx.fill(); }
function rects(ax,ay,aw,ah,bx,by,bw,bh){ return ax < bx+bw && ax+aw > bx && ay < by+bh && ay+ah > by; }
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

function loop(now) { const dt = Math.min(.033, (now-last)/1000); last = now; update(dt); draw(); requestAnimationFrame(loop); }

loadGame().then(() => requestAnimationFrame(loop));
