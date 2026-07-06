/* =========================================================
   RAID BUILD GAME V2 - FULL REPLACE src/game.js
   보스 패턴 파훼형 레이드 빌드 게임
   - 검/봉/활/채찍/스태프/단검/대검/권총형 마도구 무기
   - 보스 난이도에 따라 패시브 1~5개 선택
   - 스킬 100종 중 3개 조합
   - 보스 레이드 클리어 기록 저장
   - Supabase 리더보드 연동

   적용 방법
   1) 기존 src/game.js 전체 삭제
   2) 이 파일 전체 붙여넣기
   3) 아래 SQL을 Supabase SQL Editor에서 1회 실행

   CREATE TABLE IF NOT EXISTS public.raid_records (
     id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
     player_name text NOT NULL,
     boss_id text NOT NULL,
     boss_name text NOT NULL,
     clear_ms integer NOT NULL,
     weapon_id text NOT NULL,
     weapon_name text NOT NULL,
     skills jsonb NOT NULL DEFAULT '[]'::jsonb,
     passives jsonb NOT NULL DEFAULT '[]'::jsonb,
     damage_taken integer NOT NULL DEFAULT 0,
     created_at timestamptz NOT NULL DEFAULT now()
   );

   ALTER TABLE public.raid_records ENABLE ROW LEVEL SECURITY;

   DROP POLICY IF EXISTS "raid_records_select_all" ON public.raid_records;
   CREATE POLICY "raid_records_select_all"
   ON public.raid_records FOR SELECT
   TO anon, authenticated
   USING (true);

   DROP POLICY IF EXISTS "raid_records_insert_all" ON public.raid_records;
   CREATE POLICY "raid_records_insert_all"
   ON public.raid_records FOR INSERT
   TO anon, authenticated
   WITH CHECK (true);
========================================================= */

'use strict';

(function () {
  const SUPABASE_URL = 'https://pofxjyjpkwhuugaesbyb.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6ssOyoAVhA5qIEsXfI0vag_JqsNntpI';
  const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

  const VERSION = 'Raid Build Game V2.0 - Pattern Break Raid';
  const BASE_W = 1280;
  const BASE_H = 720;
  const ARENA_W = 1280;
  const ARENA_H = 720;

  let canvas = document.getElementById('game');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'game';
    document.body.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');
  canvas.width = BASE_W;
  canvas.height = BASE_H;
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.display = 'block';
  canvas.style.background = '#080b13';
  canvas.style.touchAction = 'none';
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';
  ctx.imageSmoothingEnabled = false;

  removeOldDomNoise();

  const ui = createOverlay();
  const keys = new Set();
  const mouse = { x: BASE_W / 2, y: BASE_H / 2, down: false, justDown: false };

  let supabase = null;
  let supabaseReady = false;
  let supabaseError = '';

  const localRecordsKey = 'raid-build-local-records-v1';
  const playerNameKey = 'raid-build-player-name-v1';

  const state = {
    screen: 'menu',
    last: performance.now(),
    time: 0,
    shake: 0,
    flash: 0,
    message: '',
    messageTime: 0,
    selectedBossId: 'ember_tyrant',
    selectedWeaponId: 'sword',
    selectedSkillIds: ['flame_burst_01', 'guard_break_21', 'heal_pulse_81'],
    selectedPassiveIds: ['passive_power_core'],
    rankings: [],
    rankingLoading: false,
    rankingBossId: 'ember_tyrant',
    pendingSubmit: null,
    particles: [],
    texts: [],
    projectiles: [],
    hazards: [],
    damageZones: [],
    floatingOrbs: [],
    mechanics: [],
    raid: null
  };

  const WEAPONS = [
    { id: 'sword', name: '검', desc: '균형 잡힌 근접 무기. 기본 공격이 안정적입니다.', atk: 1.05, range: 90, speed: 0.36, projectile: false, crit: 4, color: '#f59e0b' },
    { id: 'staff', name: '스태프', desc: '마법 공격 특화. 원거리 투사체와 스킬 피해가 강합니다.', atk: 0.86, magic: 1.2, range: 440, speed: 0.48, projectile: true, crit: 2, color: '#60a5fa' },
    { id: 'bow', name: '활', desc: '긴 사거리와 빠른 연사. 이동하면서 견제하기 좋습니다.', atk: 0.92, range: 560, speed: 0.30, projectile: true, crit: 8, color: '#facc15' },
    { id: 'whip', name: '채찍', desc: '넓은 부채꼴 범위. 가까운 탄막 정리에 유리합니다.', atk: 0.82, range: 180, speed: 0.40, arc: true, crit: 5, color: '#c084fc' },
    { id: 'pole', name: '봉', desc: '긴 근접 사거리와 높은 넉백. 안전한 거리 유지에 좋습니다.', atk: 0.98, range: 155, speed: 0.38, pierce: true, crit: 4, color: '#34d399' },
    { id: 'dagger', name: '단검', desc: '매우 빠른 공격과 높은 치명타. 숙련자용 무기입니다.', atk: 0.66, range: 72, speed: 0.16, crit: 18, color: '#e879f9' },
    { id: 'greatsword', name: '대검', desc: '느리지만 한 방 피해가 매우 강합니다.', atk: 1.65, range: 115, speed: 0.72, crit: 6, color: '#fb7185' },
    { id: 'gunstaff', name: '마도총', desc: '짧은 재장전 후 폭발 탄환을 발사합니다.', atk: 1.0, magic: 1.05, range: 500, speed: 0.58, projectile: true, splash: true, crit: 10, color: '#22d3ee' }
  ];

  const BOSSES = [
    {
      id: 'ember_tyrant', name: '화염 폭군 이그니스', tier: 1, hp: 52000, atk: 15, speed: 94,
      color: '#ef4444', sub: '#f97316', arena: 'volcano',
      desc: '화염 장판과 돌진을 반복하는 첫 번째 레이드 보스입니다.'
    },
    {
      id: 'frost_oracle', name: '빙결 예언자 네이아', tier: 2, hp: 68000, atk: 18, speed: 82,
      color: '#38bdf8', sub: '#a5f3fc', arena: 'ice',
      desc: '느려지는 얼음 장판과 유도 얼음창을 사용합니다.'
    },
    {
      id: 'void_serpent', name: '공허의 뱀 노크스', tier: 3, hp: 82000, atk: 22, speed: 126,
      color: '#8b5cf6', sub: '#111827', arena: 'void',
      desc: '순간이동과 독 장판으로 플레이어를 압박합니다.'
    },
    {
      id: 'storm_colossus', name: '폭풍 거신 아스트라', tier: 4, hp: 102000, atk: 26, speed: 74,
      color: '#facc15', sub: '#60a5fa', arena: 'storm',
      desc: '낙뢰와 거대한 충격파를 사용하는 고난도 보스입니다.'
    },
    {
      id: 'chrono_dragon', name: '시간룡 크로노스', tier: 5, hp: 128000, atk: 32, speed: 118,
      color: '#f472b6', sub: '#fef08a', arena: 'chrono',
      desc: '탄막, 시간 감속, 분신을 함께 사용하는 최종 보스입니다.'
    }
  ];

  const PASSIVES = buildPassives();
  const SKILLS = buildSkills();

  const player = makePlayer();
  const boss = makeBoss(getBoss(state.selectedBossId));

  bindEvents();
  initSupabase();
  rebuildMenus();
  showMenu();
  loop(performance.now());

  function removeOldDomNoise() {
    const ids = ['auth', 'characterScreen', 'characterMenu', 'hudHelp'];
    ids.forEach(function (id) {
      const node = document.getElementById(id);
      if (node) node.style.display = 'none';
    });
  }

  function createOverlay() {
    const root = document.createElement('div');
    root.id = 'raidBuildRoot';
    root.innerHTML = `
      <style>
        #raidBuildRoot{position:fixed;inset:0;pointer-events:none;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#e5e7eb;z-index:50}
        .rb-panel{pointer-events:auto;position:absolute;background:rgba(8,11,19,.88);border:1px solid rgba(148,163,184,.35);box-shadow:0 20px 70px rgba(0,0,0,.45);border-radius:18px;backdrop-filter:blur(12px)}
        .rb-title{font-size:28px;font-weight:900;letter-spacing:-.04em;color:#fff;margin:0 0 8px}
        .rb-sub{font-size:13px;color:#94a3b8;line-height:1.5;margin:0 0 14px}
        .rb-btn{appearance:none;border:0;border-radius:12px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:white;font-weight:800;padding:12px 16px;cursor:pointer;box-shadow:0 10px 30px rgba(37,99,235,.25)}
        .rb-btn.secondary{background:#1f2937;color:#e5e7eb;border:1px solid rgba(148,163,184,.28);box-shadow:none}
        .rb-btn.danger{background:linear-gradient(135deg,#ef4444,#f97316)}
        .rb-btn:disabled{opacity:.45;cursor:not-allowed}
        .rb-input{width:100%;box-sizing:border-box;background:#0f172a;color:#e5e7eb;border:1px solid rgba(148,163,184,.32);border-radius:12px;padding:12px;font-weight:700}
        .rb-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        .rb-card{border:1px solid rgba(148,163,184,.26);border-radius:14px;background:rgba(15,23,42,.72);padding:12px;cursor:pointer;transition:.15s}
        .rb-card:hover{transform:translateY(-1px);border-color:#93c5fd;background:rgba(30,41,59,.88)}
        .rb-card.active{border-color:#60a5fa;background:linear-gradient(135deg,rgba(37,99,235,.32),rgba(124,58,237,.22))}
        .rb-card h3{margin:0 0 5px;font-size:15px;color:#fff}.rb-card p{margin:0;color:#94a3b8;font-size:12px;line-height:1.4}
        .rb-menu{left:50%;top:50%;transform:translate(-50%,-50%);width:980px;max-height:88vh;padding:22px;overflow:auto}
        .rb-side{right:20px;top:20px;width:360px;max-height:calc(100vh - 40px);padding:16px;overflow:auto}
        .rb-left{left:20px;top:20px;width:330px;max-height:calc(100vh - 40px);padding:16px;overflow:auto}
        .rb-row{display:flex;gap:10px;align-items:center}.rb-row>*{flex:1}.rb-small{font-size:12px;color:#94a3b8}.rb-chip{display:inline-block;padding:4px 8px;border-radius:999px;background:#1e293b;color:#bfdbfe;font-size:11px;margin:2px}.rb-hidden{display:none!important}
        .rb-list{display:flex;flex-direction:column;gap:8px}.rb-record{display:grid;grid-template-columns:36px 1fr 82px;gap:8px;align-items:center;background:#0f172a;border:1px solid rgba(148,163,184,.2);border-radius:12px;padding:8px}.rb-rank{font-weight:900;color:#facc15;text-align:center}.rb-time{font-weight:900;color:#a7f3d0;text-align:right}
        @media(max-width:900px){.rb-menu{width:calc(100vw - 28px);padding:14px}.rb-grid{grid-template-columns:1fr}.rb-side,.rb-left{left:14px;right:14px;width:auto}.rb-side{top:auto;bottom:14px;max-height:38vh}.rb-left{max-height:45vh}}
      </style>
      <div id="menuPanel" class="rb-panel rb-menu"></div>
      <div id="leftPanel" class="rb-panel rb-left rb-hidden"></div>
      <div id="rightPanel" class="rb-panel rb-side rb-hidden"></div>
    `;
    document.body.appendChild(root);
    return {
      root,
      menu: root.querySelector('#menuPanel'),
      left: root.querySelector('#leftPanel'),
      right: root.querySelector('#rightPanel')
    };
  }

  function bindEvents() {
    window.addEventListener('keydown', function (e) {
      const k = e.key.toLowerCase();
      keys.add(k);
      if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
      if (state.screen === 'raid') {
        if (k === '1') useSkill(0);
        if (k === '2') useSkill(1);
        if (k === '3') useSkill(2);
        if (k === 'p' || k === 'escape') togglePause();
      } else if (state.screen === 'paused' && (k === 'p' || k === 'escape')) {
        togglePause();
      }
    });
    window.addEventListener('keyup', function (e) { keys.delete(e.key.toLowerCase()); });
    canvas.addEventListener('mousemove', updateMouse);
    canvas.addEventListener('mousedown', function (e) { updateMouse(e); mouse.down = true; mouse.justDown = true; });
    canvas.addEventListener('mouseup', function () { mouse.down = false; });
    canvas.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    window.addEventListener('resize', function () { ctx.imageSmoothingEnabled = false; });
  }

  function updateMouse(e) {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (BASE_W / r.width);
    mouse.y = (e.clientY - r.top) * (BASE_H / r.height);
  }

  function initSupabase() {
    loadScript(SUPABASE_CDN).then(function () {
      if (!window.supabase || !window.supabase.createClient) throw new Error('Supabase SDK를 불러오지 못했습니다.');
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      supabaseReady = true;
      supabaseError = '';
      refreshRankings(state.selectedBossId);
    }).catch(function (err) {
      supabaseReady = false;
      supabaseError = err.message || 'Supabase 연결 실패';
      refreshRankings(state.selectedBossId);
    });
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('스크립트 로딩 실패: ' + src)); };
      document.head.appendChild(s);
    });
  }

  function makePlayer() {
    return {
      x: BASE_W / 2, y: BASE_H / 2 + 170, r: 16,
      hp: 1000, maxHp: 1000, shield: 0,
      speed: 260, dash: 0, dashCd: 0,
      atk: 100, magic: 100, def: 0, crit: 8, critDmg: 1.7,
      cooldownMul: 1, damageMul: 1, skillDamageMul: 1, basicDamageMul: 1,
      projectileSpeedMul: 1, areaMul: 1, lifesteal: 0, regen: 1.5,
      invuln: 0, slow: 0, burnAura: 0, poisonAura: 0,
      basicCd: 0, skillsCd: [0, 0, 0], damageTaken: 0,
      face: 1, anim: 0, name: localStorage.getItem(playerNameKey) || 'Player'
    };
  }

  function makeBoss(data) {
    return {
      id: data.id, name: data.name, tier: data.tier, x: BASE_W / 2, y: 190, r: 48 + data.tier * 5,
      hp: data.hp, maxHp: data.hp, atk: data.atk, speed: data.speed, color: data.color, sub: data.sub,
      phase: 1, ai: 0, attackCd: 2, pattern: 0, invuln: 0, hit: 0, dead: false,
      vulnerable: 0, guardText: '보호막', mechanicText: '패턴을 파훼하면 보스가 약화됩니다.',
      vx: 0, vy: 0, clones: []
    };
  }

  function getWeapon(id) { return WEAPONS.find(w => w.id === id) || WEAPONS[0]; }
  function getBoss(id) { return BOSSES.find(b => b.id === id) || BOSSES[0]; }
  function getPassive(id) { return PASSIVES.find(p => p.id === id); }
  function getSkill(id) { return SKILLS.find(s => s.id === id); }
  function getPassiveLimit() { return clamp(getBoss(state.selectedBossId).tier, 1, 5); }
  function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }
  function trimPassiveSelection() {
    const limit = getPassiveLimit();
    if (state.selectedPassiveIds.length > limit) state.selectedPassiveIds = state.selectedPassiveIds.slice(0, limit);
    while (state.selectedPassiveIds.length < limit) {
      const cand = PASSIVES.find(p => !state.selectedPassiveIds.includes(p.id));
      if (!cand) break;
      state.selectedPassiveIds.push(cand.id);
    }
  }

  function buildPassives() {
    const fixed = [
      { id: 'passive_power_core', name: '힘의 핵', desc: '모든 피해 +12%', apply: p => p.damageMul *= 1.12 },
      { id: 'passive_iron_skin', name: '강철 피부', desc: '최대 체력 +18%, 방어 +8', apply: p => { p.maxHp *= 1.18; p.def += 8; } },
      { id: 'passive_swift_step', name: '날렵한 발걸음', desc: '이동속도 +16%', apply: p => p.speed *= 1.16 },
      { id: 'passive_focus_eye', name: '집중의 눈', desc: '치명타 확률 +12%', apply: p => p.crit += 12 },
      { id: 'passive_boss_slayer', name: '보스 슬레이어', desc: '보스에게 주는 피해 +14%', apply: p => p.damageMul *= 1.14 },
      { id: 'passive_cool_mind', name: '냉정한 정신', desc: '스킬 쿨타임 -12%', apply: p => p.cooldownMul *= 0.88 },
      { id: 'passive_life_drain', name: '흡혈 본능', desc: '준 피해의 2.2% 회복', apply: p => p.lifesteal += 0.022 },
      { id: 'passive_giant_area', name: '확장 마법진', desc: '스킬 범위 +18%', apply: p => p.areaMul *= 1.18 },
      { id: 'passive_quick_cast', name: '빠른 시전', desc: '스킬 피해 +8%, 쿨타임 -6%', apply: p => { p.skillDamageMul *= 1.08; p.cooldownMul *= 0.94; } },
      { id: 'passive_berserk', name: '광전사의 심장', desc: '체력 50% 이하일 때 피해 증가', apply: p => p.berserk = true }
    ];
    const names = ['용맹', '정밀', '집중', '가속', '재생', '수호', '관통', '폭발', '냉기', '화염', '독성', '감전', '영혼', '사냥꾼', '흐름', '파동', '섬광', '근성', '반격', '분노', '연마', '질풍', '철벽', '명상', '잔상', '도약', '응축', '혈기', '마력', '예열', '약점', '끈기', '격노', '흡수', '순환', '기민', '압도', '학살', '절제', '균형'];
    const generated = names.map(function (name, i) {
      const id = 'passive_auto_' + String(i + 1).padStart(2, '0');
      const type = i % 10;
      const value = 4 + Math.floor(i / 10) * 2 + (i % 4);
      const p = { id, name: name + ' 패시브', desc: '', apply: function () {} };
      if (type === 0) { p.desc = '공격력 +' + value + '%'; p.apply = pl => pl.atk *= 1 + value / 100; }
      if (type === 1) { p.desc = '마력 +' + value + '%'; p.apply = pl => pl.magic *= 1 + value / 100; }
      if (type === 2) { p.desc = '최대 체력 +' + (value * 2) + '%'; p.apply = pl => pl.maxHp *= 1 + value * 2 / 100; }
      if (type === 3) { p.desc = '이동속도 +' + value + '%'; p.apply = pl => pl.speed *= 1 + value / 100; }
      if (type === 4) { p.desc = '치명타 확률 +' + value + '%'; p.apply = pl => pl.crit += value; }
      if (type === 5) { p.desc = '치명타 피해 +' + value + '%'; p.apply = pl => pl.critDmg += value / 100; }
      if (type === 6) { p.desc = '스킬 피해 +' + value + '%'; p.apply = pl => pl.skillDamageMul *= 1 + value / 100; }
      if (type === 7) { p.desc = '기본 공격 피해 +' + value + '%'; p.apply = pl => pl.basicDamageMul *= 1 + value / 100; }
      if (type === 8) { p.desc = '쿨타임 -' + Math.min(14, value) + '%'; p.apply = pl => pl.cooldownMul *= 1 - Math.min(14, value) / 100; }
      if (type === 9) { p.desc = '초당 회복 +' + value; p.apply = pl => pl.regen += value; }
      return p;
    });
    return fixed.concat(generated).slice(0, 50);
  }

  function buildSkills() {
    const groups = [
      { base: 'flame_burst', element: 'fire', color: '#fb7185', name: '화염 폭발', type: 'burst' },
      { base: 'ice_lance', element: 'ice', color: '#7dd3fc', name: '빙결 창', type: 'line' },
      { base: 'storm_chain', element: 'storm', color: '#fde047', name: '번개 사슬', type: 'chain' },
      { base: 'shadow_dash', element: 'dark', color: '#a78bfa', name: '그림자 돌진', type: 'dash' },
      { base: 'earth_guard', element: 'earth', color: '#86efac', name: '대지 방벽', type: 'shield' },
      { base: 'arcane_orb', element: 'arcane', color: '#22d3ee', name: '비전 구체', type: 'orb' },
      { base: 'blade_rain', element: 'metal', color: '#e5e7eb', name: '검우', type: 'rain' },
      { base: 'poison_field', element: 'poison', color: '#bef264', name: '독성 지대', type: 'zone' },
      { base: 'heal_pulse', element: 'holy', color: '#f9a8d4', name: '회복 파동', type: 'heal' },
      { base: 'guard_break', element: 'force', color: '#fb923c', name: '파쇄 일격', type: 'strike' }
    ];
    const list = [];
    groups.forEach(function (g, gi) {
      for (let i = 1; i <= 10; i++) {
        const power = 0.8 + gi * 0.05 + i * 0.08;
        const cd = Math.max(2.2, 8.5 - i * 0.35 + gi * 0.12);
        list.push({
          id: g.base + '_' + String(gi * 10 + i).padStart(2, '0'),
          name: g.name + ' ' + roman(i),
          desc: makeSkillDesc(g.type, power, cd),
          type: g.type,
          element: g.element,
          color: g.color,
          power: Number(power.toFixed(2)),
          cooldown: Number(cd.toFixed(2)),
          radius: 70 + i * 7,
          count: 1 + Math.floor(i / 3),
          duration: 1.2 + i * 0.12
        });
      }
    });
    return list;
  }

  function roman(n) {
    return ['I','II','III','IV','V','VI','VII','VIII','IX','X'][n - 1] || String(n);
  }

  function makeSkillDesc(type, power, cd) {
    const dmg = Math.round(power * 100);
    const map = {
      burst: '마우스 위치에 폭발을 일으킵니다.', line: '조준 방향으로 관통 투사체를 발사합니다.', chain: '보스와 주변 지점에 연쇄 번개를 떨어뜨립니다.', dash: '무적 돌진 후 큰 피해를 줍니다.', shield: '보호막을 얻고 주변을 밀쳐냅니다.', orb: '자동 공격 구체를 소환합니다.', rain: '마우스 위치에 검을 떨어뜨립니다.', zone: '지속 피해 지대를 생성합니다.', heal: '체력을 회복하고 잠시 피해를 줄입니다.', strike: '보스에게 강력한 단일 타격을 가합니다.'
    };
    return (map[type] || '특수 스킬입니다.') + ' 피해 ' + dmg + '%, 쿨타임 ' + cd.toFixed(1) + '초';
  }

  function rebuildMenus() {
    ui.menu.innerHTML = `
      <h1 class="rb-title">보스 레이드 빌드 게임</h1>
      <p class="rb-sub">보스 목록은 아래로 갈수록 어려워집니다. 먼저 보스를 고르고, 그 보스 난이도만큼 패시브를 선택한 뒤, 스킬 3개와 무기를 조합해서 시작 버튼을 누르세요. 보스는 그냥 때리는 것보다 패턴을 파훼해 약화 시간을 만든 뒤 딜을 넣는 방식입니다. 조작: WASD 이동, 마우스 조준, 좌클릭 기본공격, 1/2/3 스킬, Space 대시, P 일시정지</p>
      <div class="rb-row" style="margin-bottom:12px">
        <input id="playerNameInput" class="rb-input" maxlength="14" placeholder="랭킹 이름" value="${escapeHtml(player.name)}">
        <button id="saveNameBtn" class="rb-btn secondary">이름 저장</button>
        <button id="startRaidBtn" class="rb-btn danger">레이드 시작</button>
      </div>
      <div class="rb-row" style="align-items:flex-start">
        <div>
          <h2 class="rb-title" style="font-size:18px">보스 선택</h2>
          <div id="bossGrid" class="rb-grid"></div>
          <h2 class="rb-title" style="font-size:18px;margin-top:16px">무기 선택</h2>
          <div id="weaponGrid" class="rb-grid"></div>
        </div>
        <div>
          <h2 class="rb-title" style="font-size:18px">스킬 3개 선택 <span class="rb-small" id="skillCount"></span></h2>
          <div id="skillGrid" class="rb-list" style="max-height:260px;overflow:auto"></div>
          <h2 class="rb-title" style="font-size:18px;margin-top:16px">패시브 선택 <span class="rb-small" id="passiveCount"></span></h2>
          <div id="passiveGrid" class="rb-list" style="max-height:260px;overflow:auto"></div>
        </div>
      </div>
      <div class="rb-row" style="margin-top:14px">
        <button id="rankingBtn" class="rb-btn secondary">선택 보스 랭킹 보기</button>
        <button id="randomBuildBtn" class="rb-btn secondary">랜덤 빌드</button>
      </div>
      <p class="rb-sub" style="margin-top:12px">Supabase 상태: <b>${supabaseReady ? '연결됨' : '로컬 기록 모드'}</b>${supabaseError ? ' · ' + escapeHtml(supabaseError) : ''}</p>
    `;

    const bossGrid = ui.menu.querySelector('#bossGrid');
    BOSSES.forEach(function (b) {
      const card = document.createElement('div');
      card.className = 'rb-card' + (b.id === state.selectedBossId ? ' active' : '');
      card.innerHTML = `<h3>${b.name}</h3><p><b style="color:#facc15">${stars(b.tier)}</b> · 난이도 ${b.tier} · 패시브 ${b.tier}개<br>HP ${num(b.hp)} · ${b.desc}</p>`;
      card.onclick = function () { state.selectedBossId = b.id; state.rankingBossId = b.id; trimPassiveSelection(); rebuildMenus(); refreshRankings(b.id); };
      bossGrid.appendChild(card);
    });

    const weaponGrid = ui.menu.querySelector('#weaponGrid');
    WEAPONS.forEach(function (w) {
      const card = document.createElement('div');
      card.className = 'rb-card' + (w.id === state.selectedWeaponId ? ' active' : '');
      card.innerHTML = `<h3>${w.name}</h3><p>${w.desc}<br>피해 x${w.atk} · 사거리 ${w.range}</p>`;
      card.onclick = function () { state.selectedWeaponId = w.id; rebuildMenus(); };
      weaponGrid.appendChild(card);
    });

    const skillGrid = ui.menu.querySelector('#skillGrid');
    SKILLS.forEach(function (s) {
      const active = state.selectedSkillIds.includes(s.id);
      const card = document.createElement('div');
      card.className = 'rb-card' + (active ? ' active' : '');
      card.innerHTML = `<h3>${s.name}</h3><p>${s.desc}</p>`;
      card.onclick = function () { toggleSkill(s.id); rebuildMenus(); };
      skillGrid.appendChild(card);
    });

    const passiveGrid = ui.menu.querySelector('#passiveGrid');
    PASSIVES.forEach(function (p) {
      const active = state.selectedPassiveIds.includes(p.id);
      const card = document.createElement('div');
      card.className = 'rb-card' + (active ? ' active' : '');
      card.innerHTML = `<h3>${p.name}</h3><p>${p.desc}</p>`;
      card.onclick = function () { togglePassive(p.id); rebuildMenus(); };
      passiveGrid.appendChild(card);
    });

    ui.menu.querySelector('#skillCount').textContent = '(' + state.selectedSkillIds.length + '/3)';
    ui.menu.querySelector('#passiveCount').textContent = '(' + state.selectedPassiveIds.length + '/' + getPassiveLimit() + ' · 보스 난이도별 제한)';
    ui.menu.querySelector('#saveNameBtn').onclick = saveNameFromInput;
    ui.menu.querySelector('#startRaidBtn').onclick = startRaid;
    ui.menu.querySelector('#rankingBtn').onclick = function () { showRankings(state.selectedBossId); };
    ui.menu.querySelector('#randomBuildBtn').onclick = randomBuild;
  }

  function toggleSkill(id) {
    const arr = state.selectedSkillIds;
    if (arr.includes(id)) state.selectedSkillIds = arr.filter(v => v !== id);
    else if (arr.length < 3) arr.push(id);
    else { arr.shift(); arr.push(id); }
  }

  function togglePassive(id) {
    const limit = getPassiveLimit();
    const arr = state.selectedPassiveIds;
    if (arr.includes(id)) state.selectedPassiveIds = arr.filter(v => v !== id);
    else if (arr.length < limit) arr.push(id);
    else { arr.shift(); arr.push(id); }
  }

  function randomBuild() {
    state.selectedWeaponId = pick(WEAPONS).id;
    state.selectedSkillIds = shuffle(SKILLS.slice()).slice(0, 3).map(s => s.id);
    state.selectedPassiveIds = shuffle(PASSIVES.slice()).slice(0, getPassiveLimit()).map(p => p.id);
    rebuildMenus();
  }

  function saveNameFromInput() {
    const input = ui.menu.querySelector('#playerNameInput');
    const name = sanitizeName(input.value || 'Player');
    player.name = name;
    localStorage.setItem(playerNameKey, name);
    input.value = name;
    toast('랭킹 이름 저장 완료');
  }

  function showMenu() {
    trimPassiveSelection();
    state.screen = 'menu';
    ui.menu.classList.remove('rb-hidden');
    ui.left.classList.add('rb-hidden');
    ui.right.classList.add('rb-hidden');
    rebuildMenus();
  }

  function showRankings(bossId) {
    state.screen = 'rankings';
    ui.menu.classList.add('rb-hidden');
    ui.left.classList.add('rb-hidden');
    ui.right.classList.remove('rb-hidden');
    state.rankingBossId = bossId;
    renderRankingPanel();
    refreshRankings(bossId);
  }

  function renderRankingPanel() {
    const b = getBoss(state.rankingBossId);
    const rows = state.rankings.length ? state.rankings.map(function (r, i) {
      return `<div class="rb-record"><div class="rb-rank">${i + 1}</div><div><b>${escapeHtml(r.player_name || 'Player')}</b><br><span class="rb-small">${escapeHtml(r.weapon_name || r.weapon_id || '')} · ${escapeHtml((r.skills || []).map(x => x.name || x).slice(0, 3).join(', '))}</span></div><div class="rb-time">${formatTime(r.clear_ms)}</div></div>`;
    }).join('') : '<p class="rb-sub">아직 기록이 없습니다. 첫 클리어 기록을 만들어보세요.</p>';
    ui.right.innerHTML = `
      <h1 class="rb-title" style="font-size:22px">${b.name} 랭킹</h1>
      <p class="rb-sub">빠른 클리어 시간 순으로 정렬됩니다. ${state.rankingLoading ? '불러오는 중...' : ''}</p>
      <div class="rb-list">${rows}</div>
      <div class="rb-row" style="margin-top:12px"><button id="backMenuBtn" class="rb-btn secondary">빌드 화면</button><button id="startFromRankBtn" class="rb-btn danger">도전</button></div>
    `;
    ui.right.querySelector('#backMenuBtn').onclick = showMenu;
    ui.right.querySelector('#startFromRankBtn').onclick = startRaid;
  }

  async function refreshRankings(bossId) {
    state.rankingLoading = true;
    state.rankings = [];
    if (state.screen === 'rankings') renderRankingPanel();
    try {
      if (supabaseReady && supabase) {
        const res = await supabase.from('raid_records').select('*').eq('boss_id', bossId).order('clear_ms', { ascending: true }).limit(20);
        if (res.error) throw res.error;
        state.rankings = res.data || [];
      } else {
        const all = JSON.parse(localStorage.getItem(localRecordsKey) || '[]');
        state.rankings = all.filter(r => r.boss_id === bossId).sort((a, b) => a.clear_ms - b.clear_ms).slice(0, 20);
      }
    } catch (err) {
      supabaseError = err.message || '랭킹 불러오기 실패';
      const all = JSON.parse(localStorage.getItem(localRecordsKey) || '[]');
      state.rankings = all.filter(r => r.boss_id === bossId).sort((a, b) => a.clear_ms - b.clear_ms).slice(0, 20);
    } finally {
      state.rankingLoading = false;
      if (state.screen === 'rankings') renderRankingPanel();
    }
  }

  function startRaid() {
    saveNameFromInput();
    if (state.selectedSkillIds.length !== 3) return toast('스킬은 정확히 3개 선택해야 합니다.');
    if (state.selectedPassiveIds.length !== getPassiveLimit()) return toast('이 보스는 패시브 ' + getPassiveLimit() + '개를 선택해야 합니다.');

    const bData = getBoss(state.selectedBossId);
    Object.assign(player, makePlayer());
    player.name = localStorage.getItem(playerNameKey) || 'Player';
    applyBuild(player);
    player.hp = player.maxHp;

    const newBoss = makeBoss(bData);
    Object.assign(boss, newBoss);

    state.raid = {
      bossId: bData.id,
      startedAt: performance.now(),
      elapsed: 0,
      clear: false,
      failed: false,
      weapon: getWeapon(state.selectedWeaponId),
      skills: state.selectedSkillIds.map(getSkill),
      passives: state.selectedPassiveIds.map(getPassive)
    };

    state.projectiles = [];
    state.particles = [];
    state.texts = [];
    state.hazards = [];
    state.damageZones = [];
    state.floatingOrbs = [];
    state.mechanics = [];
    state.shake = 0;
    state.flash = 0;
    state.screen = 'raid';
    ui.menu.classList.add('rb-hidden');
    ui.right.classList.add('rb-hidden');
    ui.left.classList.remove('rb-hidden');
    renderRaidSidePanel();
    toast(bData.name + ' 레이드 시작!');
  }

  function applyBuild(p) {
    const w = getWeapon(state.selectedWeaponId);
    p.atk *= w.atk || 1;
    p.magic *= w.magic || 1;
    p.crit += w.crit || 0;
    state.selectedPassiveIds.map(getPassive).filter(Boolean).forEach(passive => passive.apply(p));
    p.maxHp = Math.floor(p.maxHp);
    p.hp = p.maxHp;
    p.speed = Math.floor(p.speed);
  }

  function renderRaidSidePanel() {
    if (!state.raid) return;
    const skillRows = state.raid.skills.map((s, i) => `<span class="rb-chip">${i + 1}. ${s.name}</span>`).join('');
    const passiveRows = state.raid.passives.map(p => `<span class="rb-chip">${p.name}</span>`).join('');
    ui.left.innerHTML = `
      <h1 class="rb-title" style="font-size:20px">현재 빌드</h1>
      <p class="rb-sub">무기: <b>${state.raid.weapon.name}</b><br>보스: <b>${getBoss(state.raid.bossId).name}</b></p>
      <div>${skillRows}</div><div style="height:8px"></div><div>${passiveRows}</div>
      <p class="rb-sub" style="margin-top:12px">보스는 기본 보호막 상태라 피해가 줄어듭니다. 안전지대, 룬, 카운터 패턴을 파훼하면 잠시 약화되어 큰 피해가 들어갑니다.<br>WASD 이동 · 마우스 조준 · 좌클릭 기본공격 · 1/2/3 스킬 · Space 대시 · P 일시정지</p>
      <button id="giveUpBtn" class="rb-btn secondary" style="width:100%">포기하고 메뉴로</button>
    `;
    ui.left.querySelector('#giveUpBtn').onclick = showMenu;
  }

  function togglePause() {
    if (state.screen === 'raid') {
      state.screen = 'paused';
      ui.right.classList.remove('rb-hidden');
      ui.right.innerHTML = `<h1 class="rb-title">일시정지</h1><p class="rb-sub">P 또는 ESC를 누르면 계속 진행됩니다.</p><button id="pauseMenuBtn" class="rb-btn secondary">메뉴로 나가기</button>`;
      ui.right.querySelector('#pauseMenuBtn').onclick = showMenu;
    } else if (state.screen === 'paused') {
      state.screen = 'raid';
      ui.right.classList.add('rb-hidden');
      state.last = performance.now();
    }
  }

  function update(dt) {
    state.time += dt;
    state.shake = Math.max(0, state.shake - dt * 18);
    state.flash = Math.max(0, state.flash - dt * 4);
    state.messageTime = Math.max(0, state.messageTime - dt);

    if (state.screen !== 'raid' || !state.raid) return;
    state.raid.elapsed += dt;
    updatePlayer(dt);
    updateBoss(dt);
    updateProjectiles(dt);
    updateHazards(dt);
    updateDamageZones(dt);
    updateMechanics(dt);
    updateOrbs(dt);
    updateParticles(dt);
    updateTexts(dt);
    checkEnd();
  }

  function updatePlayer(dt) {
    let dx = 0, dy = 0;
    if (keys.has('w') || keys.has('arrowup')) dy -= 1;
    if (keys.has('s') || keys.has('arrowdown')) dy += 1;
    if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
    if (keys.has('d') || keys.has('arrowright')) dx += 1;
    const len = Math.hypot(dx, dy) || 1;
    let spd = player.speed * (player.slow > 0 ? 0.55 : 1);
    if (player.dash > 0) spd *= 2.8;
    player.x += dx / len * spd * dt;
    player.y += dy / len * spd * dt;
    player.x = clamp(player.x, 46, ARENA_W - 46);
    player.y = clamp(player.y, 92, ARENA_H - 46);
    player.face = mouse.x >= player.x ? 1 : -1;
    player.anim += dt;
    player.invuln = Math.max(0, player.invuln - dt);
    player.slow = Math.max(0, player.slow - dt);
    player.dash = Math.max(0, player.dash - dt);
    player.dashCd = Math.max(0, player.dashCd - dt);
    player.basicCd = Math.max(0, player.basicCd - dt);
    player.skillsCd = player.skillsCd.map(v => Math.max(0, v - dt));
    player.hp = Math.min(player.maxHp, player.hp + player.regen * dt);
    if (keys.has(' ') && player.dashCd <= 0) {
      player.dash = 0.18;
      player.dashCd = 1.4;
      player.invuln = Math.max(player.invuln, 0.18);
      burst(player.x, player.y, '#93c5fd', 16, 180);
    }
    if (mouse.down && player.basicCd <= 0) basicAttack();
    mouse.justDown = false;
  }

  function basicAttack() {
    const w = state.raid.weapon;
    player.basicCd = w.speed;
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    const baseDmg = player.atk * player.basicDamageMul * (w.atk || 1);
    if (w.projectile) {
      spawnProjectile({
        owner: 'player', x: player.x + Math.cos(angle) * 22, y: player.y + Math.sin(angle) * 22,
        vx: Math.cos(angle) * 720 * player.projectileSpeedMul, vy: Math.sin(angle) * 720 * player.projectileSpeedMul,
        r: w.splash ? 8 : 5, life: 0.9, pierce: w.id === 'bow' ? 2 : 0, color: w.color,
        damage: baseDmg, splash: w.splash ? 58 : 0, type: 'basic'
      });
    } else if (w.arc) {
      damageBossInCone(w.range, Math.PI * 0.55, angle, baseDmg, w.color);
      arcEffect(player.x, player.y, angle, w.range, w.color);
    } else {
      damageBossInRange(w.range, baseDmg, w.color);
      slashEffect(player.x, player.y, angle, w.range, w.color);
    }
  }

  function useSkill(index) {
    if (!state.raid) return;
    const s = state.raid.skills[index];
    if (!s || player.skillsCd[index] > 0) return;
    player.skillsCd[index] = s.cooldown * player.cooldownMul;
    const power = (player.atk + player.magic) * 0.5 * s.power * player.skillDamageMul;
    const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    const radius = s.radius * player.areaMul;
    if (s.type === 'burst') {
      state.damageZones.push({ x: mouse.x, y: mouse.y, r: radius, damage: power * 1.6, life: 0.18, tick: 0, color: s.color, once: true });
      burst(mouse.x, mouse.y, s.color, 42, 290);
    } else if (s.type === 'line') {
      spawnProjectile({ owner: 'player', x: player.x, y: player.y, vx: Math.cos(angle) * 880, vy: Math.sin(angle) * 880, r: 10, life: 1.2, pierce: 99, color: s.color, damage: power * 0.75, type: 'skill' });
      burst(player.x, player.y, s.color, 14, 140);
    } else if (s.type === 'chain') {
      for (let i = 0; i < s.count + 2; i++) {
        const x = boss.x + rand(-120, 120);
        const y = boss.y + rand(-80, 120);
        state.hazards.push({ kind: 'playerStrike', x, y, r: 38, warn: 0.18 + i * 0.05, life: 0.18, damage: power * 0.65, color: s.color });
      }
    } else if (s.type === 'dash') {
      player.invuln = 0.42;
      player.x = clamp(player.x + Math.cos(angle) * 170, 46, ARENA_W - 46);
      player.y = clamp(player.y + Math.sin(angle) * 170, 92, ARENA_H - 46);
      damageBossInRange(120, power * 1.5, s.color);
      burst(player.x, player.y, s.color, 36, 260);
    } else if (s.type === 'shield') {
      player.shield += Math.floor(170 + power * 0.45);
      state.damageZones.push({ x: player.x, y: player.y, r: radius, damage: power * 0.7, life: 0.24, tick: 0, color: s.color, once: true });
      burst(player.x, player.y, s.color, 34, 220);
    } else if (s.type === 'orb') {
      state.floatingOrbs.push({ angle: rand(0, Math.PI * 2), dist: 70, life: s.duration + 2.5, fire: 0, damage: power * 0.36, color: s.color });
    } else if (s.type === 'rain') {
      for (let i = 0; i < s.count + 3; i++) {
        state.hazards.push({ kind: 'playerStrike', x: mouse.x + rand(-radius, radius), y: mouse.y + rand(-radius, radius), r: 30, warn: 0.18 + i * 0.08, life: 0.16, damage: power * 0.48, color: s.color });
      }
    } else if (s.type === 'zone') {
      state.damageZones.push({ x: mouse.x, y: mouse.y, r: radius * 0.9, damage: power * 0.22, life: s.duration, tick: 0, color: s.color, dot: true });
    } else if (s.type === 'heal') {
      const heal = Math.floor(180 + player.maxHp * 0.12 + power * 0.35);
      player.hp = Math.min(player.maxHp, player.hp + heal);
      player.invuln = Math.max(player.invuln, 0.28);
      healText('+' + heal, player.x, player.y - 32);
      burst(player.x, player.y, s.color, 30, 190);
    } else if (s.type === 'strike') {
      damageBoss(power * 2.1, s.color, true);
      state.shake = 8;
      burst(boss.x, boss.y, s.color, 44, 330);
    }
  }

  function updateBoss(dt) {
    if (boss.dead) return;
    boss.ai += dt;
    boss.hit = Math.max(0, boss.hit - dt);
    boss.invuln = Math.max(0, boss.invuln - dt);
    boss.vulnerable = Math.max(0, boss.vulnerable - dt);
    boss.phase = boss.hp < boss.maxHp * 0.33 ? 3 : boss.hp < boss.maxHp * 0.66 ? 2 : 1;
    const dx = player.x - boss.x, dy = player.y - boss.y;
    const dist = Math.hypot(dx, dy) || 1;
    boss.x += dx / dist * boss.speed * (0.55 + boss.phase * 0.1) * dt;
    boss.y += dy / dist * boss.speed * (0.35 + boss.phase * 0.06) * dt;
    boss.x = clamp(boss.x, 80, ARENA_W - 80);
    boss.y = clamp(boss.y, 110, ARENA_H - 80);
    if (dist < boss.r + player.r + 6) damagePlayer(boss.atk * 0.7, boss.color);
    boss.attackCd -= dt;
    if (boss.attackCd <= 0) {
      boss.pattern = (boss.pattern + 1) % 5;
      boss.attackCd = Math.max(1.05, 2.7 - boss.phase * 0.22 - getBoss(boss.id).tier * 0.06);
      bossPattern();
    }
  }

  function bossPattern() {
    const data = getBoss(boss.id);
    const tier = data.tier;
    const angle = Math.atan2(player.y - boss.y, player.x - boss.x);

    if (boss.pattern === 0) {
      beginSafeZoneMechanic(data);
      const n = 12 + tier * 2 + boss.phase * 2;
      for (let i = 0; i < n; i++) {
        const a = Math.PI * 2 * i / n;
        spawnProjectile({ owner: 'boss', x: boss.x, y: boss.y, vx: Math.cos(a) * (145 + tier * 18), vy: Math.sin(a) * (145 + tier * 18), r: 8, life: 4.3, color: data.sub, damage: boss.atk * 0.85 });
      }
    } else if (boss.pattern === 1) {
      for (let i = 0; i < 4 + tier + boss.phase; i++) {
        state.hazards.push({ kind: 'bossStrike', x: player.x + rand(-260, 260), y: player.y + rand(-180, 180), r: 42 + boss.phase * 5, warn: 0.78, life: 0.25, damage: boss.atk * 2.1, color: data.color, slow: data.arena === 'ice' });
      }
    } else if (boss.pattern === 2) {
      beginRuneMechanic(data);
      state.damageZones.push({ x: player.x, y: player.y, r: 85 + boss.phase * 20, damage: boss.atk * 0.33, life: 3.8, tick: 0, color: data.sub, dot: true, bossZone: true, slow: data.arena === 'ice' });
    } else if (boss.pattern === 3) {
      beginCounterMechanic(data);
      boss.x = clamp(player.x + rand(-260, 260), 80, ARENA_W - 80);
      boss.y = clamp(player.y + rand(-180, 180), 110, ARENA_H - 80);
      burst(boss.x, boss.y, data.color, 34, 240);
    } else {
      const n = 10 + tier * 3 + boss.phase * 3;
      for (let i = 0; i < n; i++) {
        const a = angle + (i - n / 2) * 0.12;
        spawnProjectile({ owner: 'boss', x: boss.x, y: boss.y, vx: Math.cos(a) * (230 + tier * 18), vy: Math.sin(a) * (230 + tier * 18), r: 9, life: 3.6, color: data.color, damage: boss.atk * 0.95 });
      }
    }
  }

  function beginSafeZoneMechanic(data) {
    const safeX = clamp(rand(170, ARENA_W - 170), 120, ARENA_W - 120);
    const safeY = clamp(rand(180, ARENA_H - 130), 130, ARENA_H - 90);
    const time = Math.max(1.65, 2.5 - data.tier * 0.12);
    state.mechanics.push({ type: 'safe', x: safeX, y: safeY, r: 76 - data.tier * 3, time, maxTime: time, color: '#22c55e', text: '안전지대로 이동!' });
    boss.mechanicText = '안전지대로 들어가 폭발을 버티면 보스가 약화됩니다.';
    toast('패턴: 안전지대로 이동!');
    state.hazards.push({ kind: 'bossStrike', x: ARENA_W / 2, y: ARENA_H / 2 + 30, r: 430, warn: time, life: 0.25, damage: boss.atk * 2.8, color: data.color, safeX, safeY, safeR: 82 });
  }

  function beginRuneMechanic(data) {
    const count = clamp(data.tier, 1, 5);
    const runes = [];
    for (let i = 0; i < count; i++) {
      const a = Math.PI * 2 * i / count + state.time;
      runes.push({ x: ARENA_W / 2 + Math.cos(a) * 260, y: ARENA_H / 2 + 30 + Math.sin(a) * 160, r: 34, active: false, hold: 0 });
    }
    const time = 5.2 - data.tier * 0.18;
    state.mechanics.push({ type: 'runes', runes, time, maxTime: time, color: '#facc15', text: '봉인 룬 밟기' });
    boss.mechanicText = '모든 룬을 밟아 봉인을 해제하면 보스가 약화됩니다.';
    toast('패턴: 봉인 룬을 모두 밟아라!');
  }

  function beginCounterMechanic(data) {
    const time = Math.max(1.2, 1.85 - data.tier * 0.08);
    state.mechanics.push({ type: 'counter', time, maxTime: time, color: '#fb7185', text: '대시로 카운터!' });
    boss.mechanicText = '보스가 힘을 모읍니다. Space 대시로 보스 몸을 통과하면 카운터 성공입니다.';
    toast('패턴: Space 대시로 카운터!');
  }

  function exposeBoss(sec, text, color) {
    boss.vulnerable = Math.max(boss.vulnerable, sec);
    boss.invuln = 0;
    boss.mechanicText = text || '보스 약화! 지금 공격하세요.';
    floatText('BREAK!', boss.x, boss.y - boss.r - 34, color || '#facc15');
    burst(boss.x, boss.y, color || '#facc15', 70, 360);
    state.shake = 8;
  }

  function updateMechanics(dt) {
    state.mechanics.forEach(function (m) {
      m.time -= dt;
      if (m.type === 'safe') {
        if (m.time <= 0 && !m.done) {
          m.done = true;
          if (dist(player.x, player.y, m.x, m.y) < m.r + player.r) exposeBoss(5.0, '안전지대 파훼 성공! 약화 시간입니다.', m.color);
          else damagePlayer(boss.atk * 3.4, boss.color);
        }
      } else if (m.type === 'runes') {
        m.runes.forEach(function (r) {
          if (!r.active && dist(player.x, player.y, r.x, r.y) < r.r + player.r) {
            r.hold += dt;
            if (r.hold >= 0.28) {
              r.active = true;
              burst(r.x, r.y, m.color, 18, 180);
              floatText('룬 해제', r.x, r.y - 18, m.color);
            }
          }
        });
        if (!m.done && m.runes.every(r => r.active)) {
          m.done = true;
          exposeBoss(5.4, '봉인 룬 파훼 성공! 보스가 약화됩니다.', m.color);
        }
        if (m.time <= 0 && !m.done) {
          m.done = true;
          damagePlayer(boss.atk * 2.5, boss.color);
        }
      } else if (m.type === 'counter') {
        if (!m.done && player.dash > 0 && dist(player.x, player.y, boss.x, boss.y) < boss.r + player.r + 34) {
          m.done = true;
          exposeBoss(4.5, '카운터 성공! 보스가 크게 흔들립니다.', m.color);
          damageBoss(boss.maxHp * 0.018, m.color, true);
        }
        if (m.time <= 0 && !m.done) {
          m.done = true;
          state.hazards.push({ kind: 'bossStrike', x: player.x, y: player.y, r: 96, warn: 0.18, life: 0.25, damage: boss.atk * 2.8, color: boss.color });
        }
      }
    });
    state.mechanics = state.mechanics.filter(m => !m.done && m.time > 0);
  }

  function updateProjectiles(dt) {
    state.projectiles.forEach(function (p) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.owner === 'player') {
        if (!boss.dead && dist(p.x, p.y, boss.x, boss.y) < p.r + boss.r) {
          damageBoss(p.damage, p.color, p.type === 'skill');
          burst(p.x, p.y, p.color, 10, 110);
          if (p.splash) state.damageZones.push({ x: p.x, y: p.y, r: p.splash, damage: p.damage * 0.4, life: 0.12, tick: 0, color: p.color, once: true });
          if (p.pierce > 0) p.pierce -= 1; else p.life = 0;
        }
      } else {
        if (dist(p.x, p.y, player.x, player.y) < p.r + player.r) {
          damagePlayer(p.damage, p.color);
          p.life = 0;
          burst(p.x, p.y, p.color, 8, 90);
        }
      }
      if (p.x < -60 || p.x > ARENA_W + 60 || p.y < -60 || p.y > ARENA_H + 60) p.life = 0;
    });
    state.projectiles = state.projectiles.filter(p => p.life > 0);
  }

  function updateHazards(dt) {
    state.hazards.forEach(function (h) {
      h.warn -= dt;
      if (h.warn <= 0) {
        h.life -= dt;
        if (!h.done) {
          h.done = true;
          burst(h.x, h.y, h.color, 30, 260);
          if (h.kind === 'bossStrike') {
            if (dist(h.x, h.y, player.x, player.y) < h.r + player.r) {
              damagePlayer(h.damage, h.color);
              if (h.slow) player.slow = 1.6;
            }
          } else {
            if (dist(h.x, h.y, boss.x, boss.y) < h.r + boss.r) damageBoss(h.damage, h.color, true);
          }
        }
      }
    });
    state.hazards = state.hazards.filter(h => h.warn > 0 || h.life > 0);
  }

  function updateDamageZones(dt) {
    state.damageZones.forEach(function (z) {
      z.life -= dt;
      z.tick -= dt;
      if (z.bossZone) {
        if (z.tick <= 0 && dist(z.x, z.y, player.x, player.y) < z.r + player.r) {
          z.tick = 0.35;
          damagePlayer(z.damage, z.color);
          if (z.slow) player.slow = 1.2;
        }
      } else if (z.once) {
        if (!z.done && dist(z.x, z.y, boss.x, boss.y) < z.r + boss.r) {
          z.done = true;
          damageBoss(z.damage, z.color, true);
        }
      } else if (z.tick <= 0 && dist(z.x, z.y, boss.x, boss.y) < z.r + boss.r) {
        z.tick = 0.28;
        damageBoss(z.damage, z.color, true);
      }
    });
    state.damageZones = state.damageZones.filter(z => z.life > 0);
  }

  function updateOrbs(dt) {
    state.floatingOrbs.forEach(function (o) {
      o.life -= dt;
      o.angle += dt * 2.8;
      o.x = player.x + Math.cos(o.angle) * o.dist;
      o.y = player.y + Math.sin(o.angle) * o.dist;
      o.fire -= dt;
      if (o.fire <= 0) {
        o.fire = 0.35;
        const a = Math.atan2(boss.y - o.y, boss.x - o.x);
        spawnProjectile({ owner: 'player', x: o.x, y: o.y, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, r: 7, life: 1.1, color: o.color, damage: o.damage, type: 'skill' });
      }
    });
    state.floatingOrbs = state.floatingOrbs.filter(o => o.life > 0);
  }

  function damageBoss(amount, color, isSkill) {
    if (boss.dead || boss.invuln > 0) return;
    let dmg = amount * player.damageMul;
    if (boss.vulnerable > 0) dmg *= 1.35;
    else dmg *= 0.36;
    if (player.berserk && player.hp < player.maxHp * 0.5) dmg *= 1.22;
    const crit = Math.random() * 100 < player.crit;
    if (crit) dmg *= player.critDmg;
    dmg = Math.max(1, Math.floor(dmg));
    boss.hp = Math.max(0, boss.hp - dmg);
    boss.hit = 0.08;
    if (player.lifesteal) player.hp = Math.min(player.maxHp, player.hp + dmg * player.lifesteal);
    const prefix = boss.vulnerable > 0 ? 'BREAK ' : 'GUARD ';
    floatText(prefix + (crit ? 'CRIT ' : '') + '-' + num(dmg), boss.x + rand(-28, 28), boss.y - boss.r - rand(12, 48), boss.vulnerable > 0 ? '#facc15' : (crit ? '#fde047' : color));
    if (boss.hp <= 0) boss.dead = true;
  }

  function damageBossInRange(range, damage, color) {
    if (dist(player.x, player.y, boss.x, boss.y) < range + boss.r) damageBoss(damage, color, false);
  }

  function damageBossInCone(range, arc, angle, damage, color) {
    const d = dist(player.x, player.y, boss.x, boss.y);
    const a = Math.atan2(boss.y - player.y, boss.x - player.x);
    const diff = Math.abs(angleDiff(angle, a));
    if (d < range + boss.r && diff < arc / 2) damageBoss(damage, color, false);
  }

  function damagePlayer(amount, color) {
    if (player.invuln > 0 || state.screen !== 'raid') return;
    let dmg = Math.max(1, Math.floor(amount - player.def * 0.6));
    if (player.shield > 0) {
      const used = Math.min(player.shield, dmg);
      player.shield -= used;
      dmg -= used;
    }
    if (dmg > 0) {
      player.hp = Math.max(0, player.hp - dmg);
      player.damageTaken += dmg;
      player.invuln = 0.38;
      state.shake = 5;
      floatText('-' + dmg, player.x, player.y - 34, color || '#fb7185');
    }
  }

  function checkEnd() {
    if (!state.raid || state.raid.clear || state.raid.failed) return;
    if (boss.dead) {
      state.raid.clear = true;
      state.screen = 'result';
      state.flash = 1;
      const record = makeRecord();
      state.pendingSubmit = record;
      submitRecord(record);
      showResult(record, true);
    } else if (player.hp <= 0) {
      state.raid.failed = true;
      state.screen = 'result';
      showResult(null, false);
    }
  }

  function makeRecord() {
    const b = getBoss(state.raid.bossId);
    return {
      player_name: player.name,
      boss_id: b.id,
      boss_name: b.name,
      clear_ms: Math.max(1, Math.floor(state.raid.elapsed * 1000)),
      weapon_id: state.raid.weapon.id,
      weapon_name: state.raid.weapon.name,
      skills: state.raid.skills.map(s => ({ id: s.id, name: s.name })),
      passives: state.raid.passives.map(p => ({ id: p.id, name: p.name })),
      damage_taken: Math.floor(player.damageTaken)
    };
  }

  async function submitRecord(record) {
    saveLocalRecord(record);
    if (!supabaseReady || !supabase) return;
    try {
      const res = await supabase.from('raid_records').insert(record).select().single();
      if (res.error) throw res.error;
      toast('온라인 랭킹 저장 완료');
    } catch (err) {
      supabaseError = err.message || '랭킹 저장 실패';
      toast('온라인 저장 실패: Supabase 테이블/RLS 확인 필요');
    } finally {
      refreshRankings(record.boss_id);
    }
  }

  function saveLocalRecord(record) {
    const all = JSON.parse(localStorage.getItem(localRecordsKey) || '[]');
    all.push({ ...record, created_at: new Date().toISOString() });
    localStorage.setItem(localRecordsKey, JSON.stringify(all.slice(-200)));
  }

  function showResult(record, clear) {
    ui.left.classList.add('rb-hidden');
    ui.right.classList.remove('rb-hidden');
    const title = clear ? '레이드 클리어!' : '레이드 실패';
    const body = clear ? `<p class="rb-sub">기록: <b style="color:#a7f3d0">${formatTime(record.clear_ms)}</b><br>받은 피해: ${num(record.damage_taken)}<br>무기: ${record.weapon_name}</p>` : '<p class="rb-sub">체력이 0이 되었습니다. 빌드를 바꿔 다시 도전해보세요.</p>';
    ui.right.innerHTML = `
      <h1 class="rb-title">${title}</h1>${body}
      <div class="rb-row"><button id="againBtn" class="rb-btn danger">다시 도전</button><button id="rankAfterBtn" class="rb-btn secondary">랭킹 보기</button><button id="menuAfterBtn" class="rb-btn secondary">메뉴</button></div>
      <p class="rb-sub" style="margin-top:12px">${supabaseReady ? 'Supabase 온라인 저장 시도 완료' : '현재 로컬 기록으로 저장됨'}</p>
    `;
    ui.right.querySelector('#againBtn').onclick = startRaid;
    ui.right.querySelector('#rankAfterBtn').onclick = function () { showRankings(state.selectedBossId); };
    ui.right.querySelector('#menuAfterBtn').onclick = showMenu;
  }

  function draw() {
    const ox = state.shake ? rand(-state.shake, state.shake) : 0;
    const oy = state.shake ? rand(-state.shake, state.shake) : 0;
    ctx.save();
    ctx.translate(ox, oy);
    drawArena();
    if (state.screen === 'raid' || state.screen === 'paused' || state.screen === 'result') {
      drawDamageZones();
      drawMechanics();
      drawHazards();
      drawOrbs();
      drawBoss();
      drawProjectiles();
      drawPlayer();
      drawParticles();
      drawTexts();
      drawHud();
    } else {
      drawAttract();
    }
    ctx.restore();
    if (state.flash > 0) {
      ctx.fillStyle = 'rgba(255,255,255,' + (state.flash * 0.22) + ')';
      ctx.fillRect(0, 0, BASE_W, BASE_H);
    }
    if (state.messageTime > 0) drawToast();
  }

  function drawArena() {
    const b = getBoss(state.selectedBossId);
    const g = ctx.createLinearGradient(0, 0, 0, BASE_H);
    if (b.arena === 'volcano') { g.addColorStop(0, '#1f1010'); g.addColorStop(1, '#431407'); }
    else if (b.arena === 'ice') { g.addColorStop(0, '#061827'); g.addColorStop(1, '#164e63'); }
    else if (b.arena === 'void') { g.addColorStop(0, '#05030f'); g.addColorStop(1, '#221044'); }
    else if (b.arena === 'storm') { g.addColorStop(0, '#111827'); g.addColorStop(1, '#1e3a8a'); }
    else { g.addColorStop(0, '#13051a'); g.addColorStop(1, '#3b0764'); }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, BASE_W, BASE_H);
    ctx.strokeStyle = 'rgba(148,163,184,.16)';
    ctx.lineWidth = 1;
    for (let x = 40; x < BASE_W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 80); ctx.lineTo(x, BASE_H); ctx.stroke(); }
    for (let y = 120; y < BASE_H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(BASE_W, y); ctx.stroke(); }
    ctx.strokeStyle = 'rgba(255,255,255,.22)';
    ctx.lineWidth = 4;
    roundRect(ctx, 30, 80, BASE_W - 60, BASE_H - 110, 24, false, true);
  }

  function drawAttract() {
    const t = state.time;
    for (let i = 0; i < 8; i++) {
      const x = 120 + i * 150;
      const y = 560 + Math.sin(t * 2 + i) * 8;
      drawWeaponIcon(x, y, WEAPONS[i % WEAPONS.length], 1.2);
    }
    ctx.fillStyle = 'rgba(255,255,255,.06)';
    ctx.beginPath(); ctx.arc(BASE_W / 2, 250, 130 + Math.sin(t) * 10, 0, Math.PI * 2); ctx.fill();
  }

  function drawPlayer() {
    ctx.save();
    ctx.translate(player.x, player.y);
    const t = player.anim;
    const w = state.raid ? state.raid.weapon : getWeapon(state.selectedWeaponId);
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.beginPath(); ctx.ellipse(0, 18, 22, 7, 0, 0, Math.PI * 2); ctx.fill();
    if (player.invuln > 0) ctx.globalAlpha = 0.65;
    ctx.fillStyle = '#111827';
    circle(ctx, 0, 0, 18);
    ctx.fillStyle = '#d1d5db';
    circle(ctx, 0, -2, 14);
    ctx.fillStyle = '#60a5fa';
    roundRect(ctx, -12, 12, 24, 24, 6, true, false);
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(-9, 25); ctx.lineTo(-16 + Math.sin(t * 12) * 4, 42); ctx.moveTo(9, 25); ctx.lineTo(16 - Math.sin(t * 12) * 4, 42); ctx.stroke();
    ctx.strokeStyle = '#bfdbfe'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-9, 25); ctx.lineTo(-16 + Math.sin(t * 12) * 4, 42); ctx.moveTo(9, 25); ctx.lineTo(16 - Math.sin(t * 12) * 4, 42); ctx.stroke();
    ctx.fillStyle = '#111827'; ctx.fillRect(-6, -7, 4, 5); ctx.fillRect(4, -7, 4, 5);
    ctx.strokeStyle = w.color; ctx.lineWidth = 5; ctx.lineCap = 'round';
    const a = Math.atan2(mouse.y - player.y, mouse.x - player.x);
    ctx.rotate(a);
    drawWeaponShape(ctx, w);
    ctx.restore();
    if (player.shield > 0) {
      ctx.strokeStyle = 'rgba(96,165,250,.8)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(player.x, player.y, 28 + Math.sin(state.time * 7) * 2, 0, Math.PI * 2); ctx.stroke();
    }
  }

  function drawBoss() {
    if (boss.dead && state.screen !== 'result') return;
    ctx.save();
    ctx.translate(boss.x, boss.y);
    if (boss.hit > 0) ctx.globalAlpha = 0.6;
    ctx.fillStyle = 'rgba(0,0,0,.42)';
    ctx.beginPath(); ctx.ellipse(0, boss.r * 0.8, boss.r * 0.9, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#111827'; circle(ctx, 0, 0, boss.r + 5);
    const grad = ctx.createRadialGradient(-12, -18, 5, 0, 0, boss.r);
    grad.addColorStop(0, boss.sub); grad.addColorStop(1, boss.color);
    ctx.fillStyle = grad; circle(ctx, 0, 0, boss.r);
    ctx.fillStyle = '#fff'; circle(ctx, -boss.r * 0.32, -boss.r * 0.1, 7); circle(ctx, boss.r * 0.32, -boss.r * 0.1, 7);
    ctx.fillStyle = '#111827'; circle(ctx, -boss.r * 0.32, -boss.r * 0.1, 3); circle(ctx, boss.r * 0.32, -boss.r * 0.1, 3);
    ctx.strokeStyle = '#111827'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.arc(0, boss.r * 0.12, 18, 0.1, Math.PI - 0.1); ctx.stroke();
    if (boss.vulnerable <= 0) {
      ctx.strokeStyle = 'rgba(96,165,250,.85)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, boss.r + 14 + Math.sin(state.time * 8) * 3, 0, Math.PI * 2); ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const a = Math.PI * 2 * i / 8 + state.time;
      ctx.fillStyle = boss.sub;
      ctx.beginPath(); ctx.arc(Math.cos(a) * (boss.r + 18), Math.sin(a) * (boss.r + 18), 5, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }

  function drawHud() {
    if (!state.raid) return;
    const elapsedMs = Math.floor(state.raid.elapsed * 1000);
    bar(36, 24, 520, 22, boss.hp / boss.maxHp, '#ef4444', '#111827');
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText(boss.name + '  Phase ' + boss.phase + ' · ' + (boss.vulnerable > 0 ? '약화 ' + boss.vulnerable.toFixed(1) + '초' : '보호막'), 42, 19);
    ctx.textAlign = 'right'; ctx.fillText(num(Math.ceil(boss.hp)) + ' / ' + num(boss.maxHp), 552, 41);
    bar(36, BASE_H - 48, 320, 18, player.hp / player.maxHp, '#22c55e', '#111827');
    if (player.shield > 0) bar(36, BASE_H - 25, 320, 8, clamp(player.shield / 500, 0, 1), '#60a5fa', '#111827');
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'left';
    ctx.fillText('HP ' + Math.ceil(player.hp) + ' / ' + Math.ceil(player.maxHp), 44, BASE_H - 53);
    ctx.textAlign = 'center'; ctx.font = 'bold 28px monospace'; ctx.fillText(formatTime(elapsedMs), BASE_W / 2, 42);
    ctx.textAlign = 'center'; ctx.font = 'bold 15px sans-serif'; ctx.fillStyle = boss.vulnerable > 0 ? '#facc15' : '#cbd5e1'; ctx.fillText(boss.mechanicText || '', BASE_W / 2, 72);
    state.raid.skills.forEach(function (s, i) {
      const x = BASE_W / 2 - 135 + i * 90, y = BASE_H - 72;
      ctx.fillStyle = '#0f172a'; roundRect(ctx, x, y, 70, 54, 12, true, false);
      ctx.strokeStyle = s.color; ctx.lineWidth = 2; roundRect(ctx, x, y, 70, 54, 12, false, true);
      ctx.fillStyle = s.color; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(String(i + 1), x + 35, y + 23);
      ctx.fillStyle = '#e5e7eb'; ctx.font = '11px sans-serif'; ctx.fillText(s.name.split(' ')[0], x + 35, y + 42);
      if (player.skillsCd[i] > 0) {
        ctx.fillStyle = 'rgba(0,0,0,.65)'; roundRect(ctx, x, y, 70, 54, 12, true, false);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.fillText(player.skillsCd[i].toFixed(1), x + 35, y + 32);
      }
    });
  }

  function drawProjectiles() {
    state.projectiles.forEach(function (p) {
      ctx.save(); ctx.translate(p.x, p.y);
      ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    });
  }

  function drawMechanics() {
    state.mechanics.forEach(function (m) {
      if (m.type === 'safe') {
        ctx.save(); ctx.translate(m.x, m.y);
        ctx.globalAlpha = 0.26 + Math.sin(state.time * 10) * 0.08;
        ctx.fillStyle = m.color; ctx.beginPath(); ctx.arc(0, 0, m.r, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1; ctx.strokeStyle = '#bbf7d0'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, m.r + 5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SAFE ' + Math.max(0, m.time).toFixed(1), 0, 5);
        ctx.restore();
      } else if (m.type === 'runes') {
        m.runes.forEach(function (r) {
          ctx.save(); ctx.translate(r.x, r.y);
          ctx.globalAlpha = r.active ? 0.78 : 0.32 + Math.sin(state.time * 11) * 0.1;
          ctx.fillStyle = r.active ? '#22c55e' : m.color;
          ctx.beginPath(); ctx.arc(0, 0, r.r, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r.r + 5, 0, Math.PI * 2); ctx.stroke();
          ctx.fillStyle = '#111827'; ctx.font = 'bold 18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(r.active ? '✓' : '룬', 0, 6);
          ctx.restore();
        });
      } else if (m.type === 'counter') {
        ctx.save(); ctx.translate(boss.x, boss.y);
        ctx.strokeStyle = m.color; ctx.lineWidth = 5; ctx.globalAlpha = 0.8;
        ctx.beginPath(); ctx.arc(0, 0, boss.r + 35 + Math.sin(state.time * 18) * 5, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('DASH COUNTER ' + Math.max(0, m.time).toFixed(1), 0, -boss.r - 48);
        ctx.restore();
      }
    });
  }

  function drawHazards() {
    state.hazards.forEach(function (h) {
      ctx.save(); ctx.translate(h.x, h.y);
      if (h.warn > 0) {
        ctx.strokeStyle = h.color; ctx.globalAlpha = 0.35 + Math.sin(state.time * 22) * 0.15; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, h.r, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-h.r, 0); ctx.lineTo(h.r, 0); ctx.moveTo(0, -h.r); ctx.lineTo(0, h.r); ctx.stroke();
      } else {
        ctx.fillStyle = h.color; ctx.globalAlpha = 0.42;
        ctx.beginPath(); ctx.arc(0, 0, h.r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    });
  }

  function drawDamageZones() {
    state.damageZones.forEach(function (z) {
      ctx.save(); ctx.translate(z.x, z.y); ctx.globalAlpha = z.bossZone ? 0.22 : 0.28;
      ctx.fillStyle = z.color; ctx.beginPath(); ctx.arc(0, 0, z.r, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = z.color; ctx.lineWidth = 2; ctx.globalAlpha = 0.65; ctx.beginPath(); ctx.arc(0, 0, z.r + Math.sin(state.time * 8) * 3, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    });
  }

  function drawOrbs() {
    state.floatingOrbs.forEach(function (o) {
      ctx.fillStyle = o.color; ctx.shadowColor = o.color; ctx.shadowBlur = 10;
      ctx.beginPath(); ctx.arc(o.x, o.y, 9, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  function updateParticles(dt) {
    state.particles.forEach(p => { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.98; p.vy *= 0.98; });
    state.particles = state.particles.filter(p => p.life > 0);
  }

  function drawParticles() {
    state.particles.forEach(function (p) {
      ctx.globalAlpha = clamp(p.life / p.maxLife, 0, 1);
      ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function updateTexts(dt) {
    state.texts.forEach(t => { t.life -= dt; t.y -= 42 * dt; });
    state.texts = state.texts.filter(t => t.life > 0);
  }

  function drawTexts() {
    state.texts.forEach(function (t) {
      ctx.globalAlpha = clamp(t.life / t.maxLife, 0, 1);
      ctx.fillStyle = t.color; ctx.font = 'bold 17px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
      ctx.globalAlpha = 1;
    });
  }

  function drawToast() {
    ctx.save(); ctx.translate(BASE_W / 2, 82);
    ctx.fillStyle = 'rgba(15,23,42,.88)'; roundRect(ctx, -260, -24, 520, 48, 14, true, false);
    ctx.strokeStyle = 'rgba(148,163,184,.4)'; roundRect(ctx, -260, -24, 520, 48, 14, false, true);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(state.message, 0, 6);
    ctx.restore();
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - state.last) / 1000 || 0.016);
    state.last = now;
    update(dt);
    draw();
    requestAnimationFrame(loop);
  }

  function spawnProjectile(p) { state.projectiles.push(p); }
  function burst(x, y, color, count, speed) {
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2), s = rand(speed * 0.25, speed);
      state.particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: rand(2, 5), color, life: rand(0.25, 0.75), maxLife: 0.75 });
    }
  }
  function slashEffect(x, y, angle, range, color) {
    for (let i = 0; i < 16; i++) {
      const a = angle + rand(-0.45, 0.45), d = rand(25, range);
      state.particles.push({ x: x + Math.cos(a) * d, y: y + Math.sin(a) * d, vx: Math.cos(a) * 50, vy: Math.sin(a) * 50, r: rand(2, 4), color, life: 0.22, maxLife: 0.22 });
    }
  }
  function arcEffect(x, y, angle, range, color) { slashEffect(x, y, angle, range, color); slashEffect(x, y, angle + 0.32, range * 0.8, color); slashEffect(x, y, angle - 0.32, range * 0.8, color); }
  function floatText(text, x, y, color) { state.texts.push({ text, x, y, color, life: 0.85, maxLife: 0.85 }); }
  function healText(text, x, y) { floatText(text, x, y, '#86efac'); }
  function toast(msg) { state.message = msg; state.messageTime = 2.1; }

  function drawWeaponIcon(x, y, w, scale) { ctx.save(); ctx.translate(x, y); ctx.scale(scale, scale); ctx.rotate(-0.35); drawWeaponShape(ctx, w); ctx.restore(); }
  function drawWeaponShape(c, w) {
    c.strokeStyle = w.color; c.fillStyle = w.color; c.lineWidth = 5; c.lineCap = 'round';
    if (w.id === 'bow') { c.beginPath(); c.arc(8, 0, 28, -1.2, 1.2); c.stroke(); c.strokeStyle = '#e5e7eb'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(18, -26); c.lineTo(18, 26); c.stroke(); }
    else if (w.id === 'staff' || w.id === 'gunstaff') { c.beginPath(); c.moveTo(-24, 0); c.lineTo(34, 0); c.stroke(); c.beginPath(); c.arc(38, 0, 8, 0, Math.PI * 2); c.fill(); }
    else if (w.id === 'whip') { c.beginPath(); c.moveTo(-18, 0); c.quadraticCurveTo(18, -22, 52, 8); c.stroke(); }
    else if (w.id === 'pole') { c.beginPath(); c.moveTo(-34, 0); c.lineTo(45, 0); c.stroke(); c.beginPath(); c.moveTo(50, 0); c.lineTo(38, -8); c.lineTo(38, 8); c.closePath(); c.fill(); }
    else if (w.id === 'dagger') { c.beginPath(); c.moveTo(-12, 0); c.lineTo(28, 0); c.stroke(); c.beginPath(); c.moveTo(35, 0); c.lineTo(24, -7); c.lineTo(24, 7); c.closePath(); c.fill(); }
    else { c.beginPath(); c.moveTo(-20, 0); c.lineTo(40, 0); c.stroke(); c.beginPath(); c.moveTo(50, 0); c.lineTo(36, -10); c.lineTo(36, 10); c.closePath(); c.fill(); }
  }

  function bar(x, y, w, h, ratio, fill, back) {
    ctx.fillStyle = back; roundRect(ctx, x, y, w, h, h / 2, true, false);
    ctx.fillStyle = fill; roundRect(ctx, x, y, w * clamp(ratio, 0, 1), h, h / 2, true, false);
    ctx.strokeStyle = 'rgba(255,255,255,.3)'; roundRect(ctx, x, y, w, h, h / 2, false, true);
  }

  function roundRect(c, x, y, w, h, r, fill, stroke) {
    r = Math.min(r || 0, Math.abs(w) / 2, Math.abs(h) / 2);
    c.beginPath(); c.moveTo(x + r, y); c.lineTo(x + w - r, y); c.quadraticCurveTo(x + w, y, x + w, y + r); c.lineTo(x + w, y + h - r); c.quadraticCurveTo(x + w, y + h, x + w - r, y + h); c.lineTo(x + r, y + h); c.quadraticCurveTo(x, y + h, x, y + h - r); c.lineTo(x, y + r); c.quadraticCurveTo(x, y, x + r, y); c.closePath(); if (fill !== false) c.fill(); if (stroke) c.stroke();
  }
  function circle(c, x, y, r) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); }
  function dist(x1, y1, x2, y2) { return Math.hypot(x1 - x2, y1 - y2); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  function angleDiff(a, b) { return Math.atan2(Math.sin(a - b), Math.cos(a - b)); }
  function num(n) { return Math.floor(n).toLocaleString('ko-KR'); }
  function formatTime(ms) { const s = Math.floor(ms / 1000); const m = Math.floor(s / 60); const sec = s % 60; const cs = Math.floor((ms % 1000) / 10); return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0') + '.' + String(cs).padStart(2, '0'); }
  function sanitizeName(v) { return String(v || 'Player').replace(/[<>"'`]/g, '').trim().slice(0, 14) || 'Player'; }
  function escapeHtml(v) { return String(v == null ? '' : v).replace(/[&<>'"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[ch])); }
})();
