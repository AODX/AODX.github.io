
/* =========================================================
   RAID BUILD GAME V4 - FULL REPLACE public/src/game.js
   보스 레이드 + 가챠 + 보스별 랭킹 + 패턴 파훼 액션 게임

   적용 위치: public/src/game.js 전체 교체
   조작: WASD 이동 / 마우스 조준 / J 또는 좌클릭 일반공격 / 1 공격스킬 / 2 회피스킬 / 3 버프스킬 / Space 구르기 / P 일시정지

   Supabase 랭킹 테이블은 V1~V3의 raid_records 그대로 사용합니다.
========================================================= */
'use strict';

(function () {
  const SUPABASE_URL = 'https://pofxjyjpkwhuugaesbyb.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6ssOyoAVhA5qIEsXfI0vag_JqsNntpI';
  const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  const VERSION = 'Raid Build Game V4.0 - Gacha Dungeon Raid';
  const W = 1280;
  const H = 720;
  const SAVE_KEY = 'raid-build-v4-save';
  const LOCAL_RECORD_KEY = 'raid-build-v4-local-records';
  const INITIAL_COINS = 1060; // 무기 1회 + 스킬 3회 + 패시브 1회 뽑기 비용
  const COST = { weapon: 300, skill: 180, passive: 220 };

  let canvas = document.getElementById('game');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'game';
    document.body.appendChild(canvas);
  }
  const ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.display = 'block';
  canvas.style.background = '#050816';
  canvas.style.touchAction = 'none';
  document.body.style.margin = '0';
  document.body.style.overflow = 'hidden';
  ctx.imageSmoothingEnabled = false;

  hideLegacyDom();

  const RARITIES = [
    { id: 'normal', name: '일반', weight: 7000, color: '#cbd5e1', power: 1.00 },
    { id: 'rare', name: '희귀', weight: 2100, color: '#38bdf8', power: 1.10 },
    { id: 'super', name: '초희귀', weight: 700, color: '#34d399', power: 1.22 },
    { id: 'epic', name: '에픽', weight: 170, color: '#a78bfa', power: 1.38 },
    { id: 'legendary', name: '레전더리', weight: 28, color: '#facc15', power: 1.65 },
    { id: 'ultimate', name: '궁극', weight: 2, color: '#fb7185', power: 2.05 }
  ];

  const BOSSES = [
    bossDef('slime_king', '젤리 왕 푸딩', 1, 'slime', '#7ddf64', '#dbffb6', 36000, '훈련용에 가까운 쉬운 보스. 점프 충격파와 젤리 방울을 사용합니다.', ['젤리 점프', '느린 방울', '작은 안전지대']),
    bossDef('ember_tyrant', '화염 폭군 이그니스', 1, 'fire', '#ef4444', '#f97316', 52000, '화염탄과 용암 장판을 사용하는 입문 화염 보스입니다.', ['화염탄', '용암 장판', '불꽃 안전지대']),
    bossDef('thorn_queen', '가시 여왕 로제리아', 2, 'nature', '#22c55e', '#f472b6', 65000, '가시 벽과 독 꽃을 피우는 숲의 보스입니다.', ['가시 감옥', '독 꽃밭', '꽃잎 탄막']),
    bossDef('frost_oracle', '빙결 예언자 네이아', 2, 'ice', '#38bdf8', '#a5f3fc', 72000, '얼음창과 빙결 룬을 사용하는 냉기 보스입니다.', ['빙결 룬', '얼음창', '동상 장판']),
    bossDef('sand_reaper', '모래 사신 샤하르', 2, 'sand', '#f59e0b', '#fde68a', 76000, '모래 폭풍으로 시야와 이동을 방해합니다.', ['모래 폭풍', '낫 회전', '매몰 지대']),
    bossDef('void_serpent', '공허의 뱀 노크스', 3, 'void', '#8b5cf6', '#111827', 90000, '순간이동과 공허 독늪으로 플레이어를 압박합니다.', ['순간이동', '공허 늪', '추적 구체']),
    bossDef('iron_minotaur', '철갑 미노타우로스', 3, 'metal', '#94a3b8', '#f97316', 98000, '돌진을 유도해 벽에 부딪히게 해야 약화됩니다.', ['광폭 돌진', '철벽 보호막', '도끼 파동']),
    bossDef('blood_moon', '혈월의 사냥꾼 루나', 3, 'blood', '#be123c', '#fda4af', 104000, '체력이 낮아질수록 더 빠른 혈월 탄막을 사용합니다.', ['혈월 표식', '흡혈 칼날', '붉은 달 탄막']),
    bossDef('storm_colossus', '폭풍 거신 아스트라', 4, 'lightning', '#facc15', '#60a5fa', 122000, '낙뢰와 전류 룬을 파훼해야 하는 고난도 보스입니다.', ['낙뢰 예고', '전류 룬', '거신 충격파']),
    bossDef('plague_doctor', '역병 의사 모르비드', 4, 'poison', '#84cc16', '#14532d', 132000, '해독 구역을 밟지 않으면 지속 피해가 누적됩니다.', ['역병 안개', '해독 구역', '독침 난사']),
    bossDef('mirror_duelist', '거울 결투사 세렌', 4, 'mirror', '#e879f9', '#bae6fd', 136000, '분신 중 진짜를 찾아 공격해야 하는 특수 보스입니다.', ['거울 분신', '반사검', '진짜 찾기']),
    bossDef('gravity_core', '중력핵 아틀라스', 5, 'gravity', '#818cf8', '#1e1b4b', 158000, '중력장으로 플레이어와 탄막을 끌어당기는 괴랄한 보스입니다.', ['중력 흡입', '압축 폭발', '역중력 파동']),
    bossDef('solar_dragon', '태양룡 솔라리온', 5, 'solar', '#fb923c', '#fde047', 170000, '태양 광선과 불타는 낙하 패턴을 섞어 사용합니다.', ['태양 광선', '일식 안전지대', '태양 낙하']),
    bossDef('chrono_dragon', '시간룡 크로노스', 5, 'chrono', '#f472b6', '#fef08a', 184000, '시간 감속, 되감기 룬, 분신 탄막을 함께 사용하는 최종급 보스입니다.', ['시간 감속', '되감기 룬', '분신 탄막']),
    bossDef('chaos_archon', '혼돈의 집정관 카이로스', 5, 'chaos', '#fb7185', '#7c3aed', 210000, '여러 보스의 패턴이 섞여 나오는 최종 도전 보스입니다.', ['무작위 속성', '혼돈 룬', '괴랄 탄막'])
  ];

  const WEAPONS = [
    weapon('rust_sword', '낡은 검', 'normal', 'sword', '짧고 빠른 기본 베기.', '#d97706', 1.00, 92, .34, 0),
    weapon('oak_staff', '떡갈나무 스태프', 'normal', 'staff', '느린 마법탄을 발사합니다.', '#60a5fa', .86, 430, .50, 0),
    weapon('hunter_bow', '사냥꾼 활', 'normal', 'bow', '빠른 화살을 발사합니다.', '#facc15', .92, 560, .30, 5),
    weapon('training_pole', '수련용 봉', 'normal', 'pole', '긴 찌르기 공격.', '#34d399', .96, 160, .38, 2),
    weapon('serpent_whip', '뱀가죽 채찍', 'rare', 'whip', '넓은 부채꼴 타격.', '#c084fc', .88, 190, .40, 6),
    weapon('shadow_dagger', '그림자 단검', 'rare', 'dagger', '초고속 연속 찌르기.', '#e879f9', .66, 76, .16, 18),
    weapon('flame_blade', '화염검', 'super', 'sword_fire', '불꽃 참격을 남기는 검.', '#fb7185', 1.16, 112, .36, 8),
    weapon('storm_bow', '폭풍궁', 'super', 'bow_storm', '관통 번개 화살.', '#fde047', 1.02, 600, .33, 12),
    weapon('glacier_staff', '빙하 스태프', 'epic', 'staff_ice', '폭발하는 얼음 구체.', '#7dd3fc', 1.05, 500, .48, 6),
    weapon('dragon_greatsword', '용살 대검', 'epic', 'greatsword', '느리지만 거대한 참격.', '#f97316', 1.70, 140, .75, 10),
    weapon('void_scythe', '공허 낫', 'legendary', 'scythe', '왕복하는 공허 낫.', '#a78bfa', 1.32, 430, .56, 14),
    weapon('arcane_gunstaff', '마도총 엑셀리온', 'legendary', 'gunstaff', '폭발 마도탄을 발사합니다.', '#22d3ee', 1.28, 540, .58, 16),
    weapon('celestial_chakram', '천공 차크람', 'ultimate', 'chakram', '원형 궤도로 되돌아오는 궁극 무기.', '#fef08a', 1.55, 620, .42, 25),
    weapon('origin_grimoire', '근원 마도서', 'ultimate', 'grimoire', '자동 추적 마법탄이 연속 발사됩니다.', '#fb7185', 1.46, 650, .46, 22)
  ];

  const SKILLS = buildSkills();
  const PASSIVES = buildPassives();

  const ui = createOverlay();
  const keys = new Set();
  const mouse = { x: W / 2, y: H / 2, down: false };
  const player = makePlayer();
  let boss = makeBoss(BOSSES[0]);
  let supabase = null;
  let supabaseReady = false;

  const state = {
    screen: 'menu',
    menuTab: 'dungeon',
    buildStep: 'weapon',
    selectedBossId: BOSSES[0].id,
    selectedWeaponId: null,
    selectedAttackSkillId: null,
    selectedEvasionSkillId: null,
    selectedBuffSkillId: null,
    selectedPassiveIds: [],
    skillFilter: 'attack',
    last: performance.now(),
    time: 0,
    particles: [],
    texts: [],
    projectiles: [],
    hazards: [],
    zones: [],
    mechanics: [],
    raid: null,
    shake: 0,
    flash: 0,
    message: '',
    messageTime: 0,
    rankingBossId: BOSSES[0].id,
    rankings: [],
    gachaResult: null,
    save: loadSave()
  };

  normalizeSave();
  bindEvents();
  initSupabase();
  renderMenu();
  loop(performance.now());

  function bossDef(id, name, tier, theme, color, sub, hp, desc, patterns) {
    return { id, name, tier, theme, color, sub, hp, atk: 12 + tier * 6, speed: 70 + tier * 12, desc, patterns };
  }
  function weapon(id, name, rarity, kind, desc, color, atk, range, speed, crit) {
    const r = getRarity(rarity);
    return { id, name, rarity, kind, desc, color, atk: atk * r.power, range, speed, crit, type: 'weapon' };
  }
  function getRarity(id) { return RARITIES.find(r => r.id === id) || RARITIES[0]; }
  function rarityLabel(id) { const r = getRarity(id); return `<span style="color:${r.color};font-weight:900">${r.name}</span>`; }
  function stars(n) { return '★'.repeat(n) + '☆'.repeat(5 - n); }
  function getBoss(id) { return BOSSES.find(b => b.id === id) || BOSSES[0]; }
  function getWeapon(id) { return WEAPONS.find(w => w.id === id) || null; }
  function getSkill(id) { return SKILLS.find(s => s.id === id) || null; }
  function getPassive(id) { return PASSIVES.find(p => p.id === id) || null; }
  function passiveLimit() { return clamp(getBoss(state.selectedBossId).tier, 1, 5); }
  function ownedWeapons() { return WEAPONS.filter(w => state.save.weapons.includes(w.id)); }
  function ownedSkills(cat) { return SKILLS.filter(s => state.save.skills.includes(s.id) && (!cat || s.category === cat)); }
  function ownedPassives() { return PASSIVES.filter(p => state.save.passives.includes(p.id)); }

  function buildSkills() {
    const attackNames = [
      ['inferno_bloom','지옥화 개화','fire','burst'],['solar_spear','태양창 투척','solar','line'],['thunder_judgement','천둥 심판','lightning','chain'],['glacier_impale','빙하 관통','ice','line'],['void_collapse','공허 붕괴','void','burst'],['blade_rain','검우 낙하','metal','rain'],['venom_swamp','맹독 늪','poison','zone'],['dragon_tooth','용아 찌르기','fire','strike'],['moon_slash','월광 참격','arcane','line'],['meteor_call','운석 호출','fire','rain'],['tidal_crush','해일 압살','water','burst'],['starfall','성운 낙하','arcane','rain'],['soul_lance','영혼 창','spirit','line'],['quake_fist','대지권','earth','strike'],['ember_saw','화염 원반','fire','line'],['frost_ring','서리 고리','ice','burst'],['plasma_ray','플라즈마 광선','lightning','line'],['scarlet_mark','붉은 표식','blood','strike'],['thorn_prison','가시 감옥','nature','zone'],['comet_blade','혜성검','metal','line'],['dark_matter','암흑 물질','void','burst'],['sand_cutter','사막 절단','sand','line'],['holy_cross','성십자 폭발','solar','burst'],['gravity_hammer','중력 망치','gravity','strike'],['spirit_wolves','영혼 늑대','spirit','orb'],['lava_garden','용암 정원','fire','zone'],['ice_mirror','얼음 거울창','ice','rain'],['chaos_needle','혼돈 바늘','chaos','chain'],['blood_scythe','혈월 낫','blood','line'],['storm_falcon','폭풍 매','lightning','orb'],['crystal_barrage','수정 난사','arcane','rain'],['abyss_javelin','심연 투창','void','line'],['sunflare','태양섬광','solar','burst'],['toxic_drill','맹독 송곳','poison','line'],['iron_maw','강철 아가리','metal','strike'],['rose_burst','장미 폭발','nature','burst'],['time_spike','시간 가시','chrono','chain'],['star_cannon','별빛 포격','arcane','line'],['dragon_meteor','용성 낙하','fire','rain'],['ocean_blade','해류검','water','line']
    ];
    const evasionNames = [
      ['phantom_roll','환영 구르기','void','dash'],['mist_step','안개 걸음','water','dash'],['lightning_blink','번개 점멸','lightning','dash'],['ice_slide','빙판 미끄러짐','ice','dash'],['wind_vault','질풍 도약','nature','dash'],['shadow_swap','그림자 교대','void','dash'],['mirror_escape','거울 탈출','mirror','dash'],['sand_burrow','모래 잠행','sand','dash'],['blood_reversal','혈류 역전','blood','heal'],['holy_guard','성역 방패','solar','shield'],['gravity_flip','중력 반전','gravity','dash'],['time_skip','시간 건너뛰기','chrono','dash'],['toxic_smoke','독안개 회피','poison','shield'],['iron_barrier','철벽 방패','metal','shield'],['petal_dance','꽃잎 춤','nature','dash'],['void_shell','공허 껍질','void','shield'],['storm_parry','폭풍 패리','lightning','shield'],['flame_rebirth','불꽃 소생','fire','heal'],['aqua_veil','물의 장막','water','shield'],['star_refuge','별빛 피난처','arcane','heal'],['phase_walk','위상 보행','chaos','dash'],['moon_guard','달빛 수호','arcane','shield'],['frost_skin','서리 피부','ice','shield'],['swift_mirage','쾌속 잔상','mirror','dash'],['last_breath','마지막 숨결','spirit','heal'],['comet_roll','혜성 구르기','solar','dash'],['needle_avoid','바늘 회피','metal','dash'],['thorn_guard','가시 수호','nature','shield'],['rift_jump','균열 점프','void','dash'],['guardian_pulse','수호 파동','solar','shield']
    ];
    const buffNames = [
      ['war_cry','전장의 함성','fire','buff_damage'],['arcane_overload','비전 과부하','arcane','buff_skill'],['eagle_eye','매의 눈','lightning','buff_crit'],['haste_field','가속장','wind','buff_speed'],['blood_pact','피의 계약','blood','buff_life'],['cooling_core','냉각 핵','ice','buff_cool'],['sun_banner','태양 깃발','solar','buff_damage'],['void_contract','공허 계약','void','buff_skill'],['iron_focus','강철 집중','metal','buff_crit'],['poison_drive','독성 구동','poison','buff_damage'],['nature_blessing','숲의 축복','nature','buff_life'],['sand_clock','모래시계','chrono','buff_cool'],['storm_engine','폭풍 엔진','lightning','buff_speed'],['mirror_mind','거울 정신','mirror','buff_crit'],['gravity_anchor','중력 닻','gravity','buff_damage'],['dragon_heart','용의 심장','fire','buff_damage'],['ocean_rhythm','해류 리듬','water','buff_cool'],['star_prayer','별의 기도','arcane','buff_life'],['chaos_ignite','혼돈 점화','chaos','buff_skill'],['spirit_chant','영혼 성가','spirit','buff_life'],['lunar_focus','달빛 집중','arcane','buff_crit'],['berserk_signal','광폭 신호','blood','buff_damage'],['frost_engine','서리 엔진','ice','buff_speed'],['toxic_adrenaline','맹독 아드레날린','poison','buff_speed'],['holy_oath','성스러운 맹세','solar','buff_life'],['void_accel','공허 가속','void','buff_cool'],['metal_overdrive','강철 오버드라이브','metal','buff_skill'],['wind_choir','바람 합창','wind','buff_speed'],['time_focus','시간 집중','chrono','buff_cool'],['origin_flame','근원의 불꽃','fire','buff_skill']
    ];
    const all = [];
    function add(list, category) {
      list.forEach((a, i) => {
        const rarity = pickFixedRarity(i, list.length);
        const r = getRarity(rarity);
        all.push({
          id: a[0], name: a[1], element: a[2], type: a[3], category, rarity,
          color: elementColor(a[2]),
          power: (category === 'attack' ? 0.95 + i * 0.018 : category === 'evasion' ? 0.65 + i * 0.012 : 1.0) * r.power,
          cooldown: (category === 'attack' ? 5.2 + (i % 8) * .45 : category === 'evasion' ? 8.0 + (i % 6) * .55 : 10.5 + (i % 7) * .55) / Math.min(1.28, r.power),
          radius: 82 + (i % 7) * 12,
          duration: category === 'buff' ? 5 + (i % 5) : (a[3] === 'zone' ? 3.6 : 1.0),
          desc: skillDesc(a[1], category, a[2], a[3])
        });
      });
    }
    add(attackNames, 'attack');
    add(evasionNames, 'evasion');
    add(buffNames, 'buff');
    return all.slice(0, 100);
  }

  function buildPassives() {
    const defs = [
      ['power_core','힘의 핵','normal','모든 피해 +8%', p=>p.damageMul*=1.08], ['iron_skin','강철 피부','normal','최대 체력 +15%', p=>p.maxHp*=1.15], ['swift_step','날렵한 발걸음','normal','이동속도 +12%', p=>p.speed*=1.12], ['focus_eye','집중의 눈','rare','치명타 확률 +10%', p=>p.crit+=10], ['boss_slayer','보스 슬레이어','rare','보스 피해 +14%', p=>p.damageMul*=1.14], ['cool_mind','냉정한 정신','rare','쿨타임 -10%', p=>p.cooldownMul*=.90], ['life_drain','흡혈 본능','super','흡혈 +2.5%', p=>p.lifesteal+=.025], ['giant_area','확장 마법진','super','스킬 범위 +18%', p=>p.areaMul*=1.18], ['quick_cast','빠른 시전','super','스킬 피해 +10%, 쿨타임 -6%', p=>{p.skillDamageMul*=1.10;p.cooldownMul*=.94;}], ['berserk','광전사의 심장','epic','체력이 낮을수록 피해 증가', p=>p.berserk=true], ['perfect_roll','완벽한 구르기','epic','구르기 쿨타임 -0.5초', p=>p.rollCdBonus=.5], ['dragon_blood','용혈','legendary','체력 +25%, 피해 +15%', p=>{p.maxHp*=1.25;p.damageMul*=1.15;}], ['time_engine','시간 엔진','legendary','모든 쿨타임 -18%', p=>p.cooldownMul*=.82], ['origin_star','근원의 별','ultimate','모든 능력 대폭 상승', p=>{p.damageMul*=1.28;p.skillDamageMul*=1.25;p.maxHp*=1.20;p.crit+=15;}]
    ];
    const arr = defs.map(d => ({ id:'passive_'+d[0], name:d[1], rarity:d[2], desc:d[3], apply:d[4], type:'passive' }));
    const names = ['용맹','정밀','집중','가속','재생','수호','관통','폭발','냉기','화염','독성','감전','영혼','사냥꾼','흐름','파동','섬광','근성','반격','분노','연마','질풍','철벽','명상','잔상','도약','응축','혈기','마력','예열','약점','끈기','격노','흡수','순환','기민','압도','학살','절제','균형','별빛','공허','태양','월광','중력','시간'];
    names.forEach((name,i)=>{
      const rarity = pickFixedRarity(i, names.length);
      const v = 5 + Math.floor(i/8)*2 + (i%4);
      let desc = '', apply = p=>{};
      const t = i % 10;
      if (t===0){desc='공격력 +'+v+'%'; apply=p=>p.atk*=1+v/100;}
      if (t===1){desc='마력 +'+v+'%'; apply=p=>p.magic*=1+v/100;}
      if (t===2){desc='최대 체력 +'+(v*2)+'%'; apply=p=>p.maxHp*=1+v*2/100;}
      if (t===3){desc='이동속도 +'+v+'%'; apply=p=>p.speed*=1+v/100;}
      if (t===4){desc='치명타 확률 +'+v+'%'; apply=p=>p.crit+=v;}
      if (t===5){desc='치명타 피해 +'+v+'%'; apply=p=>p.critDmg+=v/100;}
      if (t===6){desc='스킬 피해 +'+v+'%'; apply=p=>p.skillDamageMul*=1+v/100;}
      if (t===7){desc='기본 공격 피해 +'+v+'%'; apply=p=>p.basicDamageMul*=1+v/100;}
      if (t===8){desc='쿨타임 -'+Math.min(15,v)+'%'; apply=p=>p.cooldownMul*=1-Math.min(15,v)/100;}
      if (t===9){desc='초당 회복 +'+v; apply=p=>p.regen+=v;}
      arr.push({id:'passive_auto_'+String(i+1).padStart(2,'0'), name:name+' 패시브', rarity, desc, apply, type:'passive'});
    });
    return arr;
  }

  function pickFixedRarity(i, len) {
    const q = i / Math.max(1, len - 1);
    if (q > .97) return 'ultimate';
    if (q > .88) return 'legendary';
    if (q > .70) return 'epic';
    if (q > .47) return 'super';
    if (q > .22) return 'rare';
    return 'normal';
  }
  function elementColor(e) {
    return ({fire:'#fb7185', solar:'#fde047', lightning:'#facc15', ice:'#7dd3fc', void:'#a78bfa', metal:'#e5e7eb', poison:'#bef264', arcane:'#c4b5fd', water:'#38bdf8', spirit:'#f0abfc', earth:'#86efac', blood:'#ef4444', nature:'#4ade80', sand:'#f59e0b', gravity:'#818cf8', chrono:'#f472b6', chaos:'#fb7185', mirror:'#e879f9', wind:'#93c5fd'})[e] || '#93c5fd';
  }
  function skillDesc(name, cat, elem, type) {
    const kor = ({fire:'화염', solar:'태양', lightning:'번개', ice:'냉기', void:'공허', metal:'강철', poison:'독', arcane:'비전', water:'물', spirit:'영혼', earth:'대지', blood:'혈월', nature:'자연', sand:'모래', gravity:'중력', chrono:'시간', chaos:'혼돈', mirror:'거울', wind:'바람'})[elem] || '마력';
    if (cat === 'attack') return kor + ' 속성 공격. 이름처럼 고유 이펙트와 타격 방식이 다릅니다.';
    if (cat === 'evasion') return kor + ' 힘으로 회피하거나 방어합니다. 2번 키로 사용합니다.';
    return kor + ' 기운으로 일정 시간 능력치를 강화합니다. 3번 키로 사용합니다.';
  }

  function loadSave() {
    try { const s = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (s) return s; } catch(e) {}
    return { first: true, coins: INITIAL_COINS, weapons: [], skills: [], passives: [], playerName: 'Player', seenHelp: false };
  }
  function normalizeSave() {
    const s = state.save;
    if (!Array.isArray(s.weapons)) s.weapons = [];
    if (!Array.isArray(s.skills)) s.skills = [];
    if (!Array.isArray(s.passives)) s.passives = [];
    if (!Number.isFinite(s.coins)) s.coins = INITIAL_COINS;
    if (!s.playerName) s.playerName = localStorage.getItem('raid-build-player-name-v1') || 'Player';
    saveGame();
  }
  function saveGame() { localStorage.setItem(SAVE_KEY, JSON.stringify(state.save)); }

  function makePlayer() {
    return { x: W/2, y: H-120, r:16, hp:1000, maxHp:1000, shield:0, speed:265, atk:100, magic:100, def:0, crit:8, critDmg:1.7, damageMul:1, skillDamageMul:1, basicDamageMul:1, cooldownMul:1, areaMul:1, projectileSpeedMul:1, lifesteal:0, regen:2, invuln:0, slow:0, roll:0, rollCd:0, rollCdBonus:0, basicCd:0, skillCd:[0,0,0], damageTaken:0, aim:0, face:1, anim:0, tempBuffs:[] };
  }
  function makeBoss(b) {
    return { id:b.id, name:b.name, tier:b.tier, theme:b.theme, x:W/2, y:150, r:44+b.tier*6, hp:b.hp, maxHp:b.hp, atk:b.atk, speed:b.speed, color:b.color, sub:b.sub, ai:0, patternCd:1.2, phase:1, vulnerable:0, guard:0, dead:false, hit:0, mechanicText:'패턴을 파훼하면 약화됩니다.', clones:[], realIndex:0, charge:0, vx:0, vy:0 };
  }

  function hideLegacyDom() { ['auth','characterScreen','characterMenu','hudHelp'].forEach(id=>{const n=document.getElementById(id); if(n) n.style.display='none';}); }
  function createOverlay() {
    const root = document.createElement('div'); root.id = 'raidV4Root';
    root.innerHTML = `
      <style>
        #raidV4Root{position:fixed;inset:0;pointer-events:none;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#e5e7eb;z-index:60}.v4-panel{pointer-events:auto;position:absolute;background:rgba(5,8,22,.90);border:1px solid rgba(148,163,184,.32);box-shadow:0 20px 70px rgba(0,0,0,.45);border-radius:20px;backdrop-filter:blur(14px)}.v4-menu{left:50%;top:50%;transform:translate(-50%,-50%);width:1120px;max-height:90vh;overflow:auto;padding:22px}.v4-left{left:18px;top:18px;width:330px;max-height:calc(100vh - 36px);overflow:auto;padding:16px}.v4-right{right:18px;top:18px;width:360px;max-height:calc(100vh - 36px);overflow:auto;padding:16px}.hidden{display:none!important}.title{margin:0 0 8px;color:#fff;font-size:28px;font-weight:950;letter-spacing:-.05em}.sub{margin:0 0 14px;color:#94a3b8;font-size:13px;line-height:1.5}.btn{appearance:none;border:0;border-radius:13px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-weight:900;padding:12px 15px;cursor:pointer}.btn.secondary{background:#111827;border:1px solid rgba(148,163,184,.28);color:#e5e7eb}.btn.danger{background:linear-gradient(135deg,#ef4444,#f97316)}.btn:disabled{opacity:.45;cursor:not-allowed}.nav{display:flex;gap:8px;margin:10px 0 16px}.tab{padding:10px 14px;border-radius:999px;border:1px solid rgba(148,163,184,.25);background:#0f172a;color:#cbd5e1;font-weight:900;cursor:pointer}.tab.active{background:#2563eb;color:white;border-color:#60a5fa}.boss-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.boss-card{min-height:230px;position:relative;overflow:hidden;border-radius:18px;padding:13px;background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(3,7,18,.92));border:1px solid rgba(148,163,184,.24);cursor:pointer;transition:.15s}.boss-card:hover{transform:translateY(-3px);border-color:#93c5fd}.boss-card.active{border-color:#facc15;box-shadow:0 0 0 2px rgba(250,204,21,.15)}.boss-art{height:88px;margin:6px 0 9px;border-radius:16px;background:radial-gradient(circle at 50% 45%,rgba(255,255,255,.17),rgba(255,255,255,.02) 52%,rgba(0,0,0,.25));display:flex;align-items:center;justify-content:center}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.card{border:1px solid rgba(148,163,184,.25);border-radius:15px;background:rgba(15,23,42,.72);padding:12px;cursor:pointer;transition:.15s}.card:hover{transform:translateY(-1px);border-color:#93c5fd}.card.active{border-color:#60a5fa;background:linear-gradient(135deg,rgba(37,99,235,.32),rgba(124,58,237,.24))}.card.locked{opacity:.43}.card h3{margin:0 0 5px;font-size:15px;color:#fff}.card p{margin:0;color:#94a3b8;font-size:12px;line-height:1.45}.stepbar{display:flex;gap:8px;margin:12px 0 16px}.step{flex:1;text-align:center;padding:9px 7px;border-radius:999px;background:#111827;border:1px solid rgba(148,163,184,.22);font-size:12px;font-weight:900;color:#94a3b8}.step.active{background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff}.chip{display:inline-block;padding:4px 8px;border-radius:999px;background:#1e293b;color:#bfdbfe;font-size:11px;margin:2px}.row{display:flex;gap:10px;align-items:center}.row>*{flex:1}.input{width:100%;box-sizing:border-box;background:#0f172a;color:#e5e7eb;border:1px solid rgba(148,163,184,.32);border-radius:12px;padding:11px;font-weight:800}.record{display:grid;grid-template-columns:36px 1fr 82px;gap:8px;align-items:center;background:#0f172a;border:1px solid rgba(148,163,184,.2);border-radius:12px;padding:8px;margin-bottom:7px}.rank{font-weight:950;color:#facc15;text-align:center}.time{font-weight:950;color:#a7f3d0;text-align:right}.gacha-result{border-radius:18px;border:1px solid rgba(255,255,255,.25);background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.12),rgba(15,23,42,.9));padding:18px;text-align:center;margin-top:14px}.muted{color:#94a3b8;font-size:12px}@media(max-width:920px){.v4-menu{width:calc(100vw - 28px);padding:14px}.boss-grid{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr}.v4-left,.v4-right{left:14px;right:14px;width:auto}.v4-right{top:auto;bottom:14px;max-height:38vh}}
      </style><div id="v4Menu" class="v4-panel v4-menu"></div><div id="v4Left" class="v4-panel v4-left hidden"></div><div id="v4Right" class="v4-panel v4-right hidden"></div>`;
    document.body.appendChild(root);
    return { root, menu:root.querySelector('#v4Menu'), left:root.querySelector('#v4Left'), right:root.querySelector('#v4Right') };
  }

  function bindEvents() {
    window.addEventListener('keydown', e=>{
      const k = e.key.toLowerCase(); keys.add(k);
      if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault();
      if(state.screen==='raid'){
        if(k==='1') useSkill(0); if(k==='2') useSkill(1); if(k==='3') useSkill(2); if(k==='j') basicAttack(); if(k==='p'||k==='escape') togglePause();
      } else if(state.screen==='paused' && (k==='p'||k==='escape')) togglePause();
    });
    window.addEventListener('keyup', e=>keys.delete(e.key.toLowerCase()));
    canvas.addEventListener('mousemove', updateMouse); canvas.addEventListener('mousedown', e=>{updateMouse(e); mouse.down=true; if(state.screen==='raid') basicAttack();}); canvas.addEventListener('mouseup', ()=>mouse.down=false); canvas.addEventListener('contextmenu', e=>e.preventDefault());
  }
  function updateMouse(e) { const r=canvas.getBoundingClientRect(); mouse.x=(e.clientX-r.left)*(W/r.width); mouse.y=(e.clientY-r.top)*(H/r.height); }

  function initSupabase() { loadScript(SUPABASE_CDN).then(()=>{ if(!window.supabase) throw new Error('no sdk'); supabase=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY); supabaseReady=true; refreshRankings(state.rankingBossId); }).catch(()=>{ supabaseReady=false; refreshRankings(state.rankingBossId); }); }
  function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]')) return res(); const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s);});}

  function renderMenu() {
    state.screen='menu'; ui.menu.classList.remove('hidden'); ui.left.classList.add('hidden'); ui.right.classList.add('hidden');
    const nav = `<div class="nav">${['dungeon','gacha','build','ranking'].map(t=>`<button class="tab ${state.menuTab===t?'active':''}" data-tab="${t}">${({dungeon:'던전 선택',gacha:'뽑기 상점',build:'출격 준비',ranking:'레이드 랭킹'})[t]}</button>`).join('')}</div>`;
    let body = '';
    if(state.menuTab==='dungeon') body = renderDungeonTab();
    if(state.menuTab==='gacha') body = renderGachaTab();
    if(state.menuTab==='build') body = renderBuildTab();
    if(state.menuTab==='ranking') body = renderRankingTab();
    ui.menu.innerHTML = `<div class="row"><div><h1 class="title">보스 레이드 빌드 게임 V4</h1><p class="sub">보스를 선택하고, 코인으로 무기/스킬/패시브를 뽑아 조합한 뒤 패턴을 파훼해서 클리어하세요.</p></div><div style="text-align:right"><div class="chip">${VERSION}</div><div class="chip">보유 코인 ${state.save.coins}C</div></div></div>${nav}${body}`;
    ui.menu.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{state.menuTab=b.dataset.tab; renderMenu();});
    bindMenuButtons();
  }

  function renderDungeonTab() {
    return `<p class="sub">아래로 갈수록 난이도가 올라갑니다. 각 보스는 외형과 패턴이 모두 다르며, 별 개수만큼 패시브를 선택할 수 있습니다.</p><div class="boss-grid">${BOSSES.map(b=>`<div class="boss-card ${state.selectedBossId===b.id?'active':''}" data-boss="${b.id}"><div class="muted">${stars(b.tier)}</div><div class="boss-art">${bossMiniSvg(b)}</div><h3 style="margin:0 0 6px;color:white;font-size:15px">${b.name}</h3><p class="muted" style="line-height:1.4">${b.desc}</p><div style="margin-top:8px">${b.patterns.map(p=>`<span class="chip">${p}</span>`).join('')}</div></div>`).join('')}</div><div class="row" style="margin-top:14px"><button id="goBuild" class="btn">선택한 보스로 출격 준비</button><button id="goGacha" class="btn secondary">뽑기 상점으로</button></div>`;
  }
  function renderGachaTab() {
    const rates = RARITIES.map(r=>`<span class="chip" style="color:${r.color}">${r.name}</span>`).join('');
    const result = state.gachaResult ? `<div class="gacha-result"><div style="font-size:14px;color:${getRarity(state.gachaResult.rarity).color};font-weight:950">${getRarity(state.gachaResult.rarity).name}</div><div style="font-size:25px;font-weight:950;color:#fff;margin:4px 0">${state.gachaResult.name}</div><p class="sub">${state.gachaResult.desc||'새로운 항목을 획득했습니다.'}</p></div>` : '';
    return `<h2 class="title" style="font-size:22px">뽑기 상점</h2><p class="sub">처음 들어온 유저는 무기 1회, 스킬 3회, 패시브 1회를 뽑을 수 있는 ${INITIAL_COINS}코인을 받습니다. 높은 등급일수록 확률은 매우 낮습니다.<br>${rates}</p><div class="grid"><div class="card"><h3>무기 뽑기 · ${COST.weapon}C</h3><p>검, 활, 채찍, 스태프, 단검, 대검, 마도총 등 무기를 획득합니다.</p><button class="btn" style="margin-top:10px;width:100%" data-gacha="weapon">무기 뽑기</button></div><div class="card"><h3>스킬 뽑기 · ${COST.skill}C</h3><p>공격, 회피, 버프 스킬 중 하나를 획득합니다. 총 100종류입니다.</p><button class="btn" style="margin-top:10px;width:100%" data-gacha="skill">스킬 뽑기</button></div><div class="card"><h3>패시브 뽑기 · ${COST.passive}C</h3><p>보스 난이도에 따라 1~5개 장착 가능한 패시브를 획득합니다.</p><button class="btn" style="margin-top:10px;width:100%" data-gacha="passive">패시브 뽑기</button></div><div class="card"><h3>보유 현황</h3><p>무기 ${state.save.weapons.length}/${WEAPONS.length}<br>스킬 ${state.save.skills.length}/${SKILLS.length}<br>패시브 ${state.save.passives.length}/${PASSIVES.length}</p></div></div>${result}`;
  }
  function renderBuildTab() {
    const steps = [['weapon','무기'],['attack','공격 스킬'],['evasion','회피 스킬'],['buff','버프 스킬'],['passive','패시브'],['ready','출격']];
    let content='';
    if(state.buildStep==='weapon') content = selectionGrid(ownedWeapons(), state.selectedWeaponId, 'weapon');
    if(state.buildStep==='attack') content = selectionGrid(ownedSkills('attack'), state.selectedAttackSkillId, 'attack');
    if(state.buildStep==='evasion') content = selectionGrid(ownedSkills('evasion'), state.selectedEvasionSkillId, 'evasion');
    if(state.buildStep==='buff') content = selectionGrid(ownedSkills('buff'), state.selectedBuffSkillId, 'buff');
    if(state.buildStep==='passive') content = passiveGrid();
    if(state.buildStep==='ready') content = readyPanel();
    return `<div class="row"><div><h2 class="title" style="font-size:22px">출격 준비 · ${getBoss(state.selectedBossId).name}</h2><p class="sub">현재 보스 난이도 ${stars(getBoss(state.selectedBossId).tier)} · 패시브 ${passiveLimit()}개 선택 가능</p></div><button id="backDungeon" class="btn secondary">보스 다시 선택</button></div><div class="stepbar">${steps.map(s=>`<div class="step ${state.buildStep===s[0]?'active':''}" data-step="${s[0]}">${s[1]}</div>`).join('')}</div>${content}`;
  }
  function selectionGrid(items, selected, type) {
    if(!items.length) return `<div class="card"><h3>보유한 항목이 없습니다.</h3><p>뽑기 상점에서 먼저 획득해야 합니다.</p><button class="btn" data-tabgo="gacha" style="margin-top:10px">뽑기 상점으로</button></div>`;
    return `<div class="grid">${items.map(it=>`<div class="card ${selected===it.id?'active':''}" data-select-type="${type}" data-select-id="${it.id}"><h3>${it.name} ${rarityLabel(it.rarity)}</h3><p>${it.desc}<br>${it.category?('분류: '+({attack:'공격',evasion:'회피',buff:'버프'})[it.category]):('종류: '+it.kind)}</p></div>`).join('')}</div><div class="row" style="margin-top:14px"><button class="btn secondary" data-prev-step>이전</button><button class="btn" data-next-step>다음</button></div>`;
  }
  function passiveGrid() {
    const items = ownedPassives(); const limit = passiveLimit();
    if(!items.length) return `<div class="card"><h3>보유한 패시브가 없습니다.</h3><p>패시브 뽑기로 획득해야 합니다.</p><button class="btn" data-tabgo="gacha" style="margin-top:10px">뽑기 상점으로</button></div>`;
    return `<p class="sub">${limit}개까지 선택 가능. 현재 ${state.selectedPassiveIds.length}/${limit}</p><div class="grid">${items.map(it=>`<div class="card ${state.selectedPassiveIds.includes(it.id)?'active':''}" data-passive="${it.id}"><h3>${it.name} ${rarityLabel(it.rarity)}</h3><p>${it.desc}</p></div>`).join('')}</div><div class="row" style="margin-top:14px"><button class="btn secondary" data-prev-step>이전</button><button class="btn" data-next-step>다음</button></div>`;
  }
  function readyPanel() {
    const ok = canStart();
    const b = getBoss(state.selectedBossId);
    return `<div class="grid"><div class="card active"><h3>${b.name}</h3><p>${stars(b.tier)}<br>${b.desc}</p><div>${b.patterns.map(p=>`<span class="chip">${p}</span>`).join('')}</div></div><div class="card"><h3>선택한 조합</h3><p>무기: ${getWeapon(state.selectedWeaponId)?.name || '없음'}<br>공격: ${getSkill(state.selectedAttackSkillId)?.name || '없음'}<br>회피: ${getSkill(state.selectedEvasionSkillId)?.name || '없음'}<br>버프: ${getSkill(state.selectedBuffSkillId)?.name || '없음'}<br>패시브: ${state.selectedPassiveIds.length}/${passiveLimit()}</p></div></div><div class="row" style="margin-top:14px"><button class="btn secondary" data-prev-step>이전</button><button id="startRaid" class="btn danger" ${ok?'':'disabled'}>레이드 시작</button></div>${ok?'':'<p class="sub">필수 조합이 부족합니다. 무기, 공격/회피/버프 스킬 1개씩, 패시브를 난이도만큼 선택해야 합니다.</p>'}`;
  }
  function renderRankingTab() {
    return `<div class="row"><div><h2 class="title" style="font-size:22px">보스별 랭킹</h2><p class="sub">클리어 시간이 빠를수록 높은 순위입니다.</p></div><select id="rankBoss" class="input">${BOSSES.map(b=>`<option value="${b.id}" ${state.rankingBossId===b.id?'selected':''}>${b.name}</option>`).join('')}</select></div><div style="margin-top:12px">${state.rankings.length?state.rankings.map((r,i)=>`<div class="record"><div class="rank">#${i+1}</div><div><b>${escapeHtml(r.player_name||'Player')}</b><div class="muted">${r.weapon_name||''}</div></div><div class="time">${formatMs(r.clear_ms)}</div></div>`).join(''):'<p class="sub">아직 기록이 없습니다.</p>'}</div>`;
  }

  function bindMenuButtons() {
    ui.menu.querySelectorAll('[data-boss]').forEach(el=>el.onclick=()=>{state.selectedBossId=el.dataset.boss; trimSelectedPassives(); renderMenu(); refreshRankings(state.selectedBossId);});
    const goBuild = ui.menu.querySelector('#goBuild'); if(goBuild) goBuild.onclick=()=>{state.menuTab='build'; state.buildStep='weapon'; renderMenu();};
    const goGacha = ui.menu.querySelector('#goGacha'); if(goGacha) goGacha.onclick=()=>{state.menuTab='gacha'; renderMenu();};
    ui.menu.querySelectorAll('[data-gacha]').forEach(b=>b.onclick=()=>rollGacha(b.dataset.gacha));
    ui.menu.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{state.buildStep=b.dataset.step; renderMenu();});
    ui.menu.querySelectorAll('[data-tabgo]').forEach(b=>b.onclick=()=>{state.menuTab=b.dataset.tabgo; renderMenu();});
    const backDungeon=ui.menu.querySelector('#backDungeon'); if(backDungeon) backDungeon.onclick=()=>{state.menuTab='dungeon'; renderMenu();};
    ui.menu.querySelectorAll('[data-select-type]').forEach(el=>el.onclick=()=>selectBuild(el.dataset.selectType, el.dataset.selectId));
    ui.menu.querySelectorAll('[data-passive]').forEach(el=>el.onclick=()=>togglePassive(el.dataset.passive));
    const prev=ui.menu.querySelector('[data-prev-step]'); if(prev) prev.onclick=()=>stepMove(-1);
    const next=ui.menu.querySelector('[data-next-step]'); if(next) next.onclick=()=>stepMove(1);
    const start=ui.menu.querySelector('#startRaid'); if(start) start.onclick=startRaid;
    const rb=ui.menu.querySelector('#rankBoss'); if(rb) rb.onchange=()=>{state.rankingBossId=rb.value; refreshRankings(rb.value); renderMenu();};
  }
  function selectBuild(type,id){ if(type==='weapon') state.selectedWeaponId=id; if(type==='attack') state.selectedAttackSkillId=id; if(type==='evasion') state.selectedEvasionSkillId=id; if(type==='buff') state.selectedBuffSkillId=id; renderMenu(); }
  function stepMove(dir){ const arr=['weapon','attack','evasion','buff','passive','ready']; let i=arr.indexOf(state.buildStep); i=clamp(i+dir,0,arr.length-1); state.buildStep=arr[i]; renderMenu(); }
  function togglePassive(id){ const limit=passiveLimit(); const i=state.selectedPassiveIds.indexOf(id); if(i>=0) state.selectedPassiveIds.splice(i,1); else if(state.selectedPassiveIds.length<limit) state.selectedPassiveIds.push(id); else toast('이 보스는 패시브 '+limit+'개까지만 선택할 수 있습니다.'); renderMenu(); }
  function trimSelectedPassives(){ const owned = new Set(state.save.passives); state.selectedPassiveIds = state.selectedPassiveIds.filter(id=>owned.has(id)).slice(0, passiveLimit()); }
  function canStart(){ return !!state.selectedWeaponId && !!state.selectedAttackSkillId && !!state.selectedEvasionSkillId && !!state.selectedBuffSkillId && state.selectedPassiveIds.length===passiveLimit(); }

  function rollGacha(kind) {
    const price = COST[kind]; if(state.save.coins < price){ toast('코인이 부족합니다. 보스를 클리어해서 코인을 모아야 합니다.'); return; }
    state.save.coins -= price;
    let pool = kind==='weapon' ? WEAPONS : kind==='skill' ? SKILLS : PASSIVES;
    let item = weightedItem(pool);
    const listName = kind==='weapon'?'weapons':kind==='skill'?'skills':'passives';
    if(!state.save[listName].includes(item.id)) state.save[listName].push(item.id);
    state.gachaResult = item;
    saveGame(); renderMenu();
  }
  function weightedItem(pool) {
    const total = pool.reduce((s,it)=>s+getRarity(it.rarity).weight,0); let r=Math.random()*total;
    for(const it of pool){ r-=getRarity(it.rarity).weight; if(r<=0) return it; }
    return pool[0];
  }

  function startRaid() {
    if(!canStart()) return;
    ui.menu.classList.add('hidden'); ui.left.classList.remove('hidden'); ui.right.classList.add('hidden'); state.screen='raid';
    Object.assign(player, makePlayer()); player.name=state.save.playerName||'Player'; applyBuild(); player.hp=player.maxHp;
    boss = makeBoss(getBoss(state.selectedBossId));
    state.projectiles=[]; state.hazards=[]; state.zones=[]; state.mechanics=[]; state.particles=[]; state.texts=[]; state.shake=0; state.flash=0;
    state.raid={ start:performance.now(), elapsed:0, clear:false, failed:false, weapon:getWeapon(state.selectedWeaponId), skills:[getSkill(state.selectedAttackSkillId),getSkill(state.selectedEvasionSkillId),getSkill(state.selectedBuffSkillId)], passives:state.selectedPassiveIds.map(getPassive) };
    renderRaidPanel(); toast(boss.name+' 레이드 시작!');
  }
  function applyBuild(){ const w=getWeapon(state.selectedWeaponId); if(w){player.atk*=w.atk; player.crit+=w.crit||0;} state.selectedPassiveIds.map(getPassive).filter(Boolean).forEach(p=>p.apply(player)); player.maxHp=Math.floor(player.maxHp); player.speed=Math.floor(player.speed); }
  function renderRaidPanel(){ ui.left.innerHTML=`<h1 class="title" style="font-size:21px">현재 빌드</h1><p class="sub">보스: <b>${boss.name}</b><br>무기: <b>${state.raid.weapon.name}</b></p>${state.raid.skills.map((s,i)=>`<span class="chip">${i+1}. ${s.name}</span>`).join('')}<div style="height:8px"></div>${state.raid.passives.map(p=>`<span class="chip">${p.name}</span>`).join('')}<p class="sub" style="margin-top:12px">J/좌클릭 일반공격 · 1 공격스킬 · 2 회피스킬 · 3 버프스킬 · Space 구르기(2.5초) · P 일시정지<br>공격과 스킬은 마우스/바라보는 방향으로 나갑니다.</p><button id="giveup" class="btn secondary" style="width:100%">포기하고 메뉴로</button>`; ui.left.querySelector('#giveup').onclick=renderMenu; }
  function togglePause(){ if(state.screen==='raid'){state.screen='paused'; ui.right.classList.remove('hidden'); ui.right.innerHTML='<h1 class="title">일시정지</h1><p class="sub">P 또는 ESC로 계속합니다.</p><button id="pauseMenu" class="btn secondary">메뉴로</button>'; ui.right.querySelector('#pauseMenu').onclick=renderMenu;} else if(state.screen==='paused'){state.screen='raid'; ui.right.classList.add('hidden'); state.last=performance.now();} }

  function update(dt){ state.time+=dt; state.shake=Math.max(0,state.shake-dt*18); state.flash=Math.max(0,state.flash-dt*4); state.messageTime=Math.max(0,state.messageTime-dt); updateParticles(dt); updateTexts(dt); if(state.screen!=='raid'||!state.raid) return; state.raid.elapsed+=dt; updatePlayer(dt); updateBuffs(dt); updateBoss(dt); updateProjectiles(dt); updateHazards(dt); updateZones(dt); updateMechanics(dt); checkEnd(); }
  function updatePlayer(dt){ let dx=0,dy=0; if(keys.has('w')||keys.has('arrowup'))dy--; if(keys.has('s')||keys.has('arrowdown'))dy++; if(keys.has('a')||keys.has('arrowleft'))dx--; if(keys.has('d')||keys.has('arrowright'))dx++; const len=Math.hypot(dx,dy)||1; if(dx||dy){player.face=dx<0?-1:dx>0?1:player.face; player.aim=Math.atan2(dy,dx);} else {player.aim=Math.atan2(mouse.y-player.y, mouse.x-player.x); player.face=Math.cos(player.aim)>=0?1:-1;} let spd=player.speed*(player.slow>0?.55:1)*(player.roll>0?3.0:1); player.x+=dx/len*spd*dt; player.y+=dy/len*spd*dt; player.x=clamp(player.x,42,W-42); player.y=clamp(player.y,90,H-42); player.invuln=Math.max(0,player.invuln-dt); player.slow=Math.max(0,player.slow-dt); player.roll=Math.max(0,player.roll-dt); player.rollCd=Math.max(0,player.rollCd-dt); player.basicCd=Math.max(0,player.basicCd-dt); player.skillCd=player.skillCd.map(v=>Math.max(0,v-dt)); player.anim+=dt; player.hp=Math.min(player.maxHp,player.hp+player.regen*dt); if(keys.has(' ')&&player.rollCd<=0){player.roll=.20; player.rollCd=Math.max(.8,2.5-(player.rollCdBonus||0)); player.invuln=Math.max(player.invuln,.24); burst(player.x,player.y,'#93c5fd',22,240); floatText('ROLL',player.x,player.y-26,'#93c5fd');} }
  function updateBuffs(dt){ if(!player.tempBuffs) return; for(let i=player.tempBuffs.length-1;i>=0;i--){const b=player.tempBuffs[i]; b.life-=dt; if(b.life<=0){ if(b.damageMul) player.damageMul/=b.damageMul; if(b.skillDamageMul) player.skillDamageMul/=b.skillDamageMul; if(b.speedMul) player.speed/=b.speedMul; if(b.cooldownMul) player.cooldownMul/=b.cooldownMul; if(b.critAdd) player.crit-=b.critAdd; if(b.critDmgAdd) player.critDmg-=b.critDmgAdd; if(b.lifestealAdd) player.lifesteal-=b.lifestealAdd; player.tempBuffs.splice(i,1); } } }

  function basicAttack(){ if(!state.raid||player.basicCd>0) return; const w=state.raid.weapon; player.basicCd=w.speed; const angle=aimAngle(); const dmg=player.atk*player.basicDamageMul*w.atk; if(['staff','staff_ice','bow','bow_storm','gunstaff','scythe','chakram','grimoire'].includes(w.kind)){ const count=w.kind==='grimoire'?3:1; for(let i=0;i<count;i++){const a=angle+(i-(count-1)/2)*.12; spawnProjectile({owner:'player',x:player.x+Math.cos(a)*22,y:player.y+Math.sin(a)*22,vx:Math.cos(a)*(w.kind==='bow'||w.kind==='bow_storm'?900:650),vy:Math.sin(a)*(w.kind==='bow'||w.kind==='bow_storm'?900:650),r:w.kind==='gunstaff'?8:5,life:w.kind==='chakram'?1.3:.9,pierce:w.kind.includes('bow')?2:w.kind==='scythe'?4:0,color:w.color,damage:dmg,splash:w.kind==='gunstaff'?66:0,returning:w.kind==='chakram',homing:w.kind==='grimoire'}); } } else if(w.kind==='whip'){ damageBossCone(w.range,Math.PI*.62,angle,dmg,w.color); arcEffect(player.x,player.y,angle,w.range,w.color,Math.PI*.62); } else if(w.kind==='dagger'){ for(let i=0;i<3;i++) setTimeout(()=>{damageBossRange(w.range,dmg*.48,w.color); stabEffect(player.x,player.y,angle,w.range,w.color);},i*45); } else if(w.kind==='greatsword'){ damageBossCone(w.range,Math.PI*.42,angle,dmg*1.25,w.color); slashEffect(player.x,player.y,angle,w.range,w.color,16); } else if(w.kind==='pole'){ damageBossLine(w.range,26,angle,dmg,w.color); thrustEffect(player.x,player.y,angle,w.range,w.color); } else { damageBossCone(w.range,Math.PI*.38,angle,dmg,w.color); slashEffect(player.x,player.y,angle,w.range,w.color,8); } }
  function aimAngle(){ const mx=mouse.x,my=mouse.y; if(Math.hypot(mx-player.x,my-player.y)>8) return Math.atan2(my-player.y,mx-player.x); return player.aim||0; }

  function useSkill(i){ if(!state.raid) return; const s=state.raid.skills[i]; if(!s||player.skillCd[i]>0) return; player.skillCd[i]=s.cooldown*player.cooldownMul; const power=(player.atk+player.magic)*.5*s.power*player.skillDamageMul; const angle=aimAngle(); const r=s.radius*player.areaMul; if(s.category==='attack'){ castAttackSkill(s,power,angle,r); } else if(s.category==='evasion'){ castEvasionSkill(s,power,angle,r); } else { castBuffSkill(s,power); } }
  function castAttackSkill(s,power,angle,r){ if(s.type==='burst'){ state.zones.push({x:mouse.x,y:mouse.y,r,damage:power*1.7,life:.22,color:s.color,once:true,element:s.element}); burst(mouse.x,mouse.y,s.color,48,330); } else if(s.type==='line'){ spawnProjectile({owner:'player',x:player.x,y:player.y,vx:Math.cos(angle)*900,vy:Math.sin(angle)*900,r:10,life:1.2,pierce:99,color:s.color,damage:power*.82,type:'skill'}); beamEffect(player.x,player.y,angle,s.color); } else if(s.type==='chain'){ for(let k=0;k<6;k++) state.hazards.push({kind:'playerStrike',x:boss.x+rand(-130,130),y:boss.y+rand(-90,130),r:34,warn:.18+k*.05,life:.16,damage:power*.62,color:s.color}); } else if(s.type==='rain'){ for(let k=0;k<9;k++) state.hazards.push({kind:'playerStrike',x:mouse.x+rand(-r,r),y:mouse.y+rand(-r,r),r:28,warn:.18+k*.07,life:.16,damage:power*.46,color:s.color}); } else if(s.type==='zone'){ state.zones.push({x:mouse.x,y:mouse.y,r:r*.9,damage:power*.25,life:s.duration,tick:0,color:s.color,dot:true}); } else if(s.type==='orb'){ for(let k=0;k<5;k++) spawnProjectile({owner:'player',x:player.x,y:player.y,vx:Math.cos(angle+(k-2)*.18)*620,vy:Math.sin(angle+(k-2)*.18)*620,r:7,life:1.1,pierce:1,color:s.color,damage:power*.38,homing:true}); } else { damageBoss(power*2.05,s.color,true); burst(boss.x,boss.y,s.color,44,310); state.shake=8; } }
  function castEvasionSkill(s,power,angle,r){ if(s.type==='dash'){ player.invuln=.48; player.x=clamp(player.x+Math.cos(angle)*185,42,W-42); player.y=clamp(player.y+Math.sin(angle)*185,90,H-42); damageBossRange(130,power*1.1,s.color); burst(player.x,player.y,s.color,36,260); } else if(s.type==='heal'){ const heal=Math.floor(160+player.maxHp*.13+power*.28); player.hp=Math.min(player.maxHp,player.hp+heal); player.invuln=.28; healText('+'+heal,player.x,player.y-30); burst(player.x,player.y,s.color,30,220); } else { player.shield += Math.floor(160+power*.42); player.invuln=Math.max(player.invuln,.25); state.zones.push({x:player.x,y:player.y,r:r*.72,damage:power*.55,life:.25,color:s.color,once:true}); burst(player.x,player.y,s.color,32,230); } }
  function castBuffSkill(s,power){ const d=s.duration||6; const b={life:d,name:s.name,color:s.color}; if(s.type==='buff_damage'){b.damageMul=1.24; player.damageMul*=b.damageMul;} if(s.type==='buff_skill'){b.skillDamageMul=1.30; player.skillDamageMul*=b.skillDamageMul;} if(s.type==='buff_crit'){b.critAdd=18;b.critDmgAdd=.28;player.crit+=b.critAdd;player.critDmg+=b.critDmgAdd;} if(s.type==='buff_speed'){b.speedMul=1.22;b.cooldownMul=.88;player.speed*=b.speedMul;player.cooldownMul*=b.cooldownMul;} if(s.type==='buff_life'){b.lifestealAdd=.035;b.damageMul=1.10;player.lifesteal+=b.lifestealAdd;player.damageMul*=b.damageMul;} if(s.type==='buff_cool'){b.cooldownMul=.80;player.cooldownMul*=b.cooldownMul;} player.tempBuffs.push(b); burst(player.x,player.y,s.color,34,240); floatText(s.name,player.x,player.y-42,s.color); }

  function updateBoss(dt){ if(boss.dead) return; boss.ai+=dt; boss.hit=Math.max(0,boss.hit-dt); boss.vulnerable=Math.max(0,boss.vulnerable-dt); boss.patternCd-=dt; const dx=player.x-boss.x,dy=player.y-boss.y,dist=Math.hypot(dx,dy)||1; const chase=(boss.vulnerable>0?.35:1); boss.x+=dx/dist*boss.speed*chase*dt*.35; boss.y+=dy/dist*boss.speed*chase*dt*.20; boss.x=clamp(boss.x,90,W-90); boss.y=clamp(boss.y,100,H-120); if(dist<boss.r+player.r+4) hurtPlayer(boss.atk*dt*3.5,boss.color); if(boss.patternCd<=0){ bossPattern(); boss.patternCd=Math.max(.75,2.8-boss.tier*.22+Math.random()*.8); } }
  function bossPattern(){ const t=boss.theme; boss.mechanicText=''; if(t==='fire'||t==='solar') firePattern(); else if(t==='ice') icePattern(); else if(t==='lightning') lightningPattern(); else if(t==='void') voidPattern(); else if(t==='nature') naturePattern(); else if(t==='sand') sandPattern(); else if(t==='metal') metalPattern(); else if(t==='blood') bloodPattern(); else if(t==='poison') poisonPattern(); else if(t==='mirror') mirrorPattern(); else if(t==='gravity') gravityPattern(); else if(t==='chrono') chronoPattern(); else if(t==='chaos') chaosPattern(); else slimePattern(); }
  function slimePattern(){ boss.mechanicText='젤리 점프: 착지 원 밖으로 피하세요.'; warningCircle(player.x,player.y,70,.55,'#7ddf64',boss.atk*1.0); radialBullets(boss.x,boss.y,8,180,'#dbffb6',boss.atk*.7); }
  function firePattern(){ boss.mechanicText='화염 패턴: 용암 장판을 피하고 안전지대를 찾으세요.'; for(let i=0;i<4+boss.tier;i++) warningCircle(rand(100,W-100),rand(130,H-80),45+boss.tier*5,.55,boss.color,boss.atk*1.1,true); radialBullets(boss.x,boss.y,10+boss.tier*2,230,boss.color,boss.atk*.7); }
  function icePattern(){ boss.mechanicText='빙결 룬: 파란 룬을 밟으면 보스가 약화됩니다.'; spawnRune('#7dd3fc','break'); for(let i=0;i<5+boss.tier;i++) aimBullet(boss.x,boss.y,player.x+rand(-40,40),player.y+rand(-40,40),260,'#bae6fd',boss.atk*.85,'slow'); }
  function lightningPattern(){ boss.mechanicText='낙뢰 예고: 노란 원을 피하고 전류 룬을 밟으세요.'; for(let i=0;i<6+boss.tier;i++) warningCircle(rand(80,W-80),rand(110,H-70),34,.42,'#fde047',boss.atk*1.15); if(Math.random()<.6) spawnRune('#facc15','break'); }
  function voidPattern(){ boss.mechanicText='공허 순간이동: 보라 늪에서 빠져나오세요.'; boss.x=rand(130,W-130); boss.y=rand(120,H-180); burst(boss.x,boss.y,boss.color,30,200); state.zones.push({x:player.x,y:player.y,r:72,damage:boss.atk*.18,life:3.0,tick:0,color:'#7c3aed',enemy:true,dot:true}); for(let i=0;i<3+boss.tier;i++) homingEnemy('#a78bfa'); }
  function naturePattern(){ boss.mechanicText='가시 감옥: 초록 가시선 사이 빈틈으로 이동하세요.'; for(let i=0;i<5;i++) state.hazards.push({kind:'wall',x:180+i*220,y:rand(160,H-80),w:20,h:220,r:0,warn:.4,life:1.4,damage:boss.atk*.9,color:'#4ade80'}); spawnRune('#f472b6','break'); }
  function sandPattern(){ boss.mechanicText='모래 폭풍: 이동이 느려집니다. 원형 폭풍 밖으로 나가세요.'; player.slow=Math.max(player.slow,1.4); warningCircle(player.x,player.y,95,.7,'#f59e0b',boss.atk*1.25); spiralBullets('#fde68a',12+boss.tier*2); }
  function metalPattern(){ boss.mechanicText='철갑 돌진: 대시로 통과하면 약화됩니다.'; boss.charge=0.55; aimBullet(boss.x,boss.y,player.x,player.y,540,'#e5e7eb',boss.atk*1.2,'charge'); radialBullets(boss.x,boss.y,8,190,'#94a3b8',boss.atk*.65); }
  function bloodPattern(){ boss.mechanicText='혈월 표식: 붉은 표식을 피하면 보스가 지칩니다.'; warningCircle(player.x,player.y,58,.45,'#ef4444',boss.atk*1.4,false,()=>breakBoss(1.1)); for(let i=0;i<7;i++) aimBullet(boss.x,boss.y,player.x+rand(-120,120),player.y+rand(-120,120),300,'#fda4af',boss.atk*.65); }
  function poisonPattern(){ boss.mechanicText='해독 구역: 초록 룬을 밟지 않으면 독안개가 위험합니다.'; state.zones.push({x:W/2,y:H/2,r:260,damage:boss.atk*.12,life:3.2,tick:0,color:'#84cc16',enemy:true,dot:true}); spawnRune('#bef264','cleanse'); }
  function mirrorPattern(){ boss.mechanicText='거울 분신: 밝게 빛나는 진짜를 공격하세요.'; boss.clones=[]; boss.realIndex=Math.floor(Math.random()*4); for(let i=0;i<4;i++) boss.clones.push({x:260+i*250,y:150+rand(-20,80),real:i===boss.realIndex,life:2.2}); radialBullets(boss.x,boss.y,14,'230','#e879f9',boss.atk*.6); }
  function gravityPattern(){ boss.mechanicText='중력 흡입: 중앙으로 끌려갑니다. 구르기로 빠져나오세요.'; state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:310,life:3.0,power:210,color:'#818cf8'}); warningCircle(W/2,H/2,120,2.0,'#818cf8',boss.atk*2.2); }
  function chronoPattern(){ boss.mechanicText='시간 룬: 되감기 룬을 밟아 시간 감속을 해제하세요.'; player.slow=Math.max(player.slow,2.1); spawnRune('#f472b6','break'); for(let i=0;i<18;i++) setTimeout(()=>radialBullets(boss.x,boss.y,6,180+i*8,'#fef08a',boss.atk*.38,i*.18), i*70); }
  function chaosPattern(){ boss.mechanicText='혼돈 패턴: 여러 속성이 무작위로 섞입니다.'; const funcs=[firePattern,icePattern,lightningPattern,voidPattern,sandPattern,gravityPattern]; funcs[Math.floor(Math.random()*funcs.length)](); if(Math.random()<.45) spiralBullets('#fb7185',18); }

  function warningCircle(x,y,r,warn,color,damage,zone,callback){ state.hazards.push({kind:'circle',x,y,r,warn,life:.22,damage,color,zone,callback}); }
  function spawnRune(color,kind){ state.mechanics.push({kind:'rune',x:rand(120,W-120),y:rand(140,H-80),r:28,life:4.0,color,action:kind}); }
  function homingEnemy(color){ state.projectiles.push({owner:'boss',x:boss.x,y:boss.y,vx:rand(-60,60),vy:rand(120,240),r:8,life:4,damage:boss.atk*.8,color,homingPlayer:true}); }
  function radialBullets(x,y,count,speed,color,damage,delay){ for(let i=0;i<count;i++){const a=i/count*Math.PI*2+state.time*.3; state.projectiles.push({owner:'boss',x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:6,life:4,damage,color,delay:delay||0});} }
  function aimBullet(x,y,tx,ty,speed,color,damage,tag){ const a=Math.atan2(ty-y,tx-x); state.projectiles.push({owner:'boss',x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:tag==='charge'?18:7,life:3,damage,color,tag}); }
  function spiralBullets(color,count){ for(let i=0;i<count;i++){const a=state.time*2+i/count*Math.PI*2; state.projectiles.push({owner:'boss',x:boss.x,y:boss.y,vx:Math.cos(a)*220,vy:Math.sin(a)*220,r:6,life:4,damage:boss.atk*.55,color});} }


  function spawnProjectile(data) {
    state.projectiles.push(Object.assign({
      owner: 'player', x: player.x, y: player.y, vx: 0, vy: 0, r: 6,
      life: 1, damage: 10, color: '#ffffff', pierce: 0
    }, data));
  }

  function updateProjectiles(dt){ state.projectiles.forEach(p=>{ if(p.delay){p.delay-=dt; return;} if(p.homing&&p.owner==='player'){const a=Math.atan2(boss.y-p.y,boss.x-p.x); p.vx+=(Math.cos(a)*520-p.vx)*dt*2.5; p.vy+=(Math.sin(a)*520-p.vy)*dt*2.5;} if(p.homingPlayer){const a=Math.atan2(player.y-p.y,player.x-p.x); p.vx+=(Math.cos(a)*260-p.vx)*dt*1.5; p.vy+=(Math.sin(a)*260-p.vy)*dt*1.5;} if(p.returning){const age=1.3-p.life; if(age>.55){const a=Math.atan2(player.y-p.y,player.x-p.x); p.vx=Math.cos(a)*600; p.vy=Math.sin(a)*600;}} p.x+=p.vx*dt; p.y+=p.vy*dt; p.life-=dt; if(p.owner==='player'&&!boss.dead&&dist(p.x,p.y,boss.x,boss.y)<p.r+boss.r){damageBoss(p.damage,p.color,false); if(p.splash) state.zones.push({x:p.x,y:p.y,r:p.splash,damage:p.damage*.65,life:.12,color:p.color,once:true}); if(!p.pierce) p.life=0; else p.pierce--; } if(p.owner==='boss'&&dist(p.x,p.y,player.x,player.y)<p.r+player.r){ hurtPlayer(p.damage,p.color); p.life=0; if(p.tag==='slow') player.slow=Math.max(player.slow,1.5); } }); state.projectiles=state.projectiles.filter(p=>p.life>0&&p.x>-80&&p.x<W+80&&p.y>-80&&p.y<H+80); }
  function updateHazards(dt){ state.hazards.forEach(h=>{ if(h.warn>0){h.warn-=dt; return;} h.life-=dt; if(h.kind==='circle'){ if(dist(h.x,h.y,player.x,player.y)<h.r+player.r) hurtPlayer(h.damage,h.color); if(h.zone) state.zones.push({x:h.x,y:h.y,r:h.r,damage:h.damage*.08,life:2.4,tick:0,color:h.color,enemy:true,dot:true}); if(h.callback) h.callback(); h.life=0; } else if(h.kind==='playerStrike'){ if(dist(h.x,h.y,boss.x,boss.y)<h.r+boss.r){damageBoss(h.damage,h.color,false); h.life=0;} } else if(h.kind==='wall'){ if(Math.abs(player.x-h.x)<h.w+player.r && Math.abs(player.y-h.y)<h.h/2+player.r) hurtPlayer(h.damage,h.color); } }); state.hazards=state.hazards.filter(h=>h.life>0||h.warn>0); }
  function updateZones(dt){ state.zones.forEach(z=>{z.life-=dt; z.tick=(z.tick||0)-dt; if(z.once){ if(z.enemy){ if(dist(z.x,z.y,player.x,player.y)<z.r+player.r) hurtPlayer(z.damage,z.color); } else if(dist(z.x,z.y,boss.x,boss.y)<z.r+boss.r) damageBoss(z.damage,z.color,false); z.life=0; return;} if(z.tick<=0){z.tick=.25; if(z.enemy){ if(dist(z.x,z.y,player.x,player.y)<z.r+player.r) hurtPlayer(z.damage,z.color); } else if(dist(z.x,z.y,boss.x,boss.y)<z.r+boss.r) damageBoss(z.damage,z.color,false); }}); state.zones=state.zones.filter(z=>z.life>0); }
  function updateMechanics(dt){ state.mechanics.forEach(m=>{m.life-=dt; if(m.kind==='rune'&&dist(m.x,m.y,player.x,player.y)<m.r+player.r){ if(m.action==='break') breakBoss(2.6); if(m.action==='cleanse'){player.slow=0; player.hp=Math.min(player.maxHp,player.hp+120); healText('해독',player.x,player.y-35);} m.life=0; } if(m.kind==='gravity'){const a=Math.atan2(m.y-player.y,m.x-player.x); const d=Math.max(60,dist(m.x,m.y,player.x,player.y)); player.x+=Math.cos(a)*m.power/d*80*dt; player.y+=Math.sin(a)*m.power/d*80*dt;} }); state.mechanics=state.mechanics.filter(m=>m.life>0); if(boss.clones&&boss.clones.length){boss.clones.forEach(c=>c.life-=dt); boss.clones=boss.clones.filter(c=>c.life>0);} }

  function breakBoss(sec){ boss.vulnerable=Math.max(boss.vulnerable,sec); boss.guard=0; burst(boss.x,boss.y,'#fef08a',46,330); floatText('BREAK!',boss.x,boss.y-boss.r-20,'#fef08a'); }
  function damageBoss(amount,color,big){ if(boss.dead) return; let mul=player.damageMul; if(player.berserk){mul*=1+(1-player.hp/player.maxHp)*.45;} if(boss.vulnerable<=0) mul*=.48; const crit=Math.random()*100<player.crit; let dmg=Math.max(1,Math.floor(amount*mul*(crit?player.critDmg:1))); boss.hp-=dmg; boss.hit=.12; floatText((crit?dmg+'!':'-'+dmg),boss.x+rand(-20,20),boss.y-boss.r-12,crit?'#fef08a':(color||'#fff'),big?22:16); if(player.lifesteal>0){player.hp=Math.min(player.maxHp,player.hp+dmg*player.lifesteal);} if(boss.hp<=0){boss.hp=0;boss.dead=true;} }
  function damageBossRange(range,dmg,color){ if(dist(player.x,player.y,boss.x,boss.y)<range+boss.r) damageBoss(dmg,color,false); }
  function damageBossLine(range,width,angle,dmg,color){ const px=boss.x-player.x, py=boss.y-player.y; const along=px*Math.cos(angle)+py*Math.sin(angle); const side=Math.abs(-px*Math.sin(angle)+py*Math.cos(angle)); if(along>0&&along<range+boss.r&&side<width+boss.r) damageBoss(dmg,color,false); }
  function damageBossCone(range,arc,angle,dmg,color){ const a=Math.atan2(boss.y-player.y,boss.x-player.x); let diff=Math.abs(normAngle(a-angle)); if(dist(player.x,player.y,boss.x,boss.y)<range+boss.r && diff<arc/2) damageBoss(dmg,color,false); }
  function hurtPlayer(amount,color){ if(player.invuln>0||state.screen!=='raid') return; let dmg=Math.max(1,Math.floor(amount-player.def)); if(player.shield>0){const used=Math.min(player.shield,dmg); player.shield-=used; dmg-=used;} if(dmg>0){player.hp-=dmg; player.damageTaken+=dmg; floatText('-'+dmg,player.x,player.y-24,color||'#fb7185'); state.shake=Math.max(state.shake,4); player.invuln=.18;} }
  function checkEnd(){ if(!state.raid) return; if(player.hp<=0&&!state.raid.failed){state.raid.failed=true; endRaid(false);} if(boss.dead&&!state.raid.clear){state.raid.clear=true; endRaid(true);} }
  function endRaid(clear){ state.screen='result'; const elapsed=Math.floor(state.raid.elapsed*1000); let reward=0; if(clear){ const b=getBoss(boss.id); reward=b.tier*230+Math.floor(b.hp/1000)*6+Math.max(0,Math.floor(60000/Math.max(1000,elapsed))*20); state.save.coins+=reward; saveGame(); submitRecord(elapsed); } ui.right.classList.remove('hidden'); ui.right.innerHTML=`<h1 class="title">${clear?'클리어!':'실패'}</h1><p class="sub">${boss.name}<br>시간: ${formatMs(elapsed)}<br>받은 피해: ${player.damageTaken}<br>${clear?'획득 코인: '+reward+'C':'보스를 다시 분석해보세요.'}</p><button id="resultMenu" class="btn">메뉴로</button>`; ui.right.querySelector('#resultMenu').onclick=()=>{state.menuTab=clear?'ranking':'build'; renderMenu(); refreshRankings(boss.id);}; }

  async function submitRecord(ms){ const record={player_name:state.save.playerName||'Player',boss_id:boss.id,boss_name:boss.name,clear_ms:ms,weapon_id:state.raid.weapon.id,weapon_name:state.raid.weapon.name,skills:state.raid.skills.map(s=>s.name),passives:state.raid.passives.map(p=>p.name),damage_taken:player.damageTaken}; const local=getLocalRecords(); local.push(record); local.sort((a,b)=>a.clear_ms-b.clear_ms); localStorage.setItem(LOCAL_RECORD_KEY,JSON.stringify(local.slice(0,200))); if(supabaseReady&&supabase){ try{await supabase.from('raid_records').insert(record);}catch(e){} } refreshRankings(boss.id); }
  function getLocalRecords(){try{return JSON.parse(localStorage.getItem(LOCAL_RECORD_KEY)||'[]');}catch(e){return[];}}
  async function refreshRankings(bossId){ state.rankingBossId=bossId; let records=getLocalRecords().filter(r=>r.boss_id===bossId); if(supabaseReady&&supabase){ try{const {data}=await supabase.from('raid_records').select('*').eq('boss_id',bossId).order('clear_ms',{ascending:true}).limit(10); if(data) records=data;}catch(e){} } records.sort((a,b)=>a.clear_ms-b.clear_ms); state.rankings=records.slice(0,10); if(state.menuTab==='ranking'&&state.screen==='menu') renderMenu(); }

  function draw(){ ctx.clearRect(0,0,W,H); if(state.screen==='raid'||state.screen==='paused'||state.screen==='result'){ drawArena(); drawZones(); drawMechanics(); drawHazards(); drawProjectiles(); drawBoss(); drawPlayer(); drawParticles(); drawTexts(); drawHud(); drawControlHint(); } else { drawMenuBackground(); } if(state.flash>0){ctx.fillStyle=`rgba(255,255,255,${state.flash*.18})`;ctx.fillRect(0,0,W,H);} }
  function drawMenuBackground(){ const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#081126'); g.addColorStop(1,'#030712'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); for(let i=0;i<80;i++){ctx.fillStyle='rgba(147,197,253,.08)'; circle(ctx,(i*97+state.time*12)%W,40+(i*53)%H,1+(i%3));} }
  function drawArena(){ const b=getBoss(boss.id); const g=ctx.createLinearGradient(0,0,0,H); const theme={fire:['#210707','#45110c'],solar:['#281409','#5b2705'],ice:['#071b2c','#123247'],lightning:['#111827','#312e05'],void:['#080516','#1e103a'],nature:['#061a10','#0d3320'],sand:['#2b1907','#5a3610'],metal:['#111827','#334155'],blood:['#220611','#4c0519'],poison:['#0d1b05','#1f3f0b'],mirror:['#101828','#392056'],gravity:['#09091a','#1e1b4b'],chrono:['#19051c','#442054'],chaos:['#150616','#3b0f2f'],slime:['#061a10','#12331e']}[b.theme]||['#081126','#030712']; g.addColorStop(0,theme[0]); g.addColorStop(1,theme[1]); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.save(); ctx.globalAlpha=.18; for(let i=0;i<16;i++){ctx.strokeStyle=b.color;ctx.beginPath();ctx.arc(W/2,H/2,80+i*45+Math.sin(state.time+i)*8,0,Math.PI*2);ctx.stroke();} ctx.restore(); }
  function drawBoss(){ if(!boss||boss.dead) return; ctx.save(); if(state.shake>0) ctx.translate(rand(-state.shake,state.shake),rand(-state.shake,state.shake)); ctx.globalAlpha=boss.hit>0?.72:1; drawBossShape(ctx,boss,boss.x,boss.y,boss.r); ctx.restore(); const bw=680,bh=18,x=(W-bw)/2,y=28; ctx.fillStyle='#000a'; roundRect(ctx,x,y,bw,bh,9); ctx.fillStyle=boss.vulnerable>0?'#fef08a':boss.color; roundRect(ctx,x,y,bw*clamp(boss.hp/boss.maxHp,0,1),bh,9); ctx.fillStyle='#fff'; ctx.font='900 16px system-ui'; ctx.textAlign='center'; ctx.fillText(`${boss.name}  ${stars(boss.tier)}  ${boss.vulnerable>0?'BREAK':'GUARD'}`,W/2,22); ctx.font='800 13px system-ui'; ctx.fillStyle='#cbd5e1'; ctx.fillText(boss.mechanicText||'패턴을 보고 움직이세요.',W/2,62); if(boss.clones) boss.clones.forEach(c=>drawBossShape(ctx,{...boss,color:c.real?'#fef08a':boss.color,sub:boss.sub,theme:boss.theme},c.x,c.y,boss.r*.65)); }
  function drawBossShape(c,b,x,y,r){ c.save(); c.translate(x,y); c.shadowColor=b.color; c.shadowBlur=18; if(b.theme==='slime'){c.fillStyle=b.color; c.beginPath(); c.ellipse(0,10,r*1.2,r*.8,0,0,Math.PI*2); c.fill(); c.fillStyle='#052e16'; circle(c,-r*.32,0,5); circle(c,r*.32,0,5);} else if(b.theme==='fire'||b.theme==='solar'){c.fillStyle=b.color; c.beginPath(); for(let i=0;i<16;i++){const a=i/16*Math.PI*2; const rr=r*(i%2?1.15:.72); c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);} c.closePath(); c.fill(); c.fillStyle=b.sub; circle(c,0,0,r*.55);} else if(b.theme==='ice'){c.fillStyle=b.color; polygon(c,0,0,r,8); c.fill(); c.fillStyle=b.sub; polygon(c,0,0,r*.55,6); c.fill();} else if(b.theme==='lightning'){c.fillStyle=b.color; c.beginPath(); c.moveTo(-r*.2,-r); c.lineTo(r*.45,-r*.12); c.lineTo(r*.05,-r*.12); c.lineTo(r*.35,r); c.lineTo(-r*.55,-.02); c.lineTo(-r*.1,-.02); c.closePath(); c.fill();} else if(b.theme==='mirror'){c.fillStyle=b.color; polygon(c,0,0,r,6); c.fill(); c.strokeStyle=b.sub; c.lineWidth=5; c.stroke();} else if(b.theme==='gravity'||b.theme==='void'||b.theme==='chaos'){c.strokeStyle=b.color; c.lineWidth=8; for(let i=0;i<3;i++){c.beginPath(); c.ellipse(0,0,r*(1-i*.18),r*.55*(1-i*.12),state.time+i,0,Math.PI*2); c.stroke();} c.fillStyle=b.sub; circle(c,0,0,r*.42);} else {c.fillStyle=b.color; roundRect(c,-r,-r*.75,r*2,r*1.5,18); c.fill(); c.fillStyle=b.sub; circle(c,0,-r*.1,r*.48);} c.shadowBlur=0; c.fillStyle='#020617'; circle(c,-r*.25,-r*.08,5); circle(c,r*.25,-r*.08,5); c.restore(); }
  function drawPlayer(){ ctx.save(); ctx.translate(player.x,player.y); ctx.rotate(player.aim||0); ctx.fillStyle='rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0,6,22,8,0,0,Math.PI*2); ctx.fill(); ctx.rotate(-(player.aim||0)); ctx.fillStyle=player.invuln>0?'#bfdbfe':'#e5e7eb'; circle(ctx,0,0,player.r); ctx.fillStyle='#111827'; circle(ctx,5*player.face,-4,3); drawWeaponHeld(ctx,state.raid?state.raid.weapon:null); ctx.restore(); }
  function drawWeaponHeld(c,w){ if(!w) return; c.save(); c.rotate(player.aim||0); c.translate(18,0); drawWeaponShape(c,w,1.0); c.restore(); }
  function drawWeaponShape(c,w,scale){ c.save(); c.scale(scale,scale); c.strokeStyle=w.color; c.fillStyle=w.color; c.lineWidth=5; c.lineCap='round'; const k=w.kind; if(k.includes('bow')){c.beginPath(); c.arc(0,0,18,-1.2,1.2); c.stroke(); c.beginPath(); c.moveTo(10,-16); c.lineTo(10,16); c.strokeStyle='#f8fafc'; c.lineWidth=1.5; c.stroke();} else if(k.includes('staff')||k==='grimoire'){ if(k==='grimoire'){roundRect(c,-5,-14,24,28,4); c.fill();} else {c.beginPath(); c.moveTo(-5,18); c.lineTo(16,-22); c.stroke(); circle(c,18,-24,7);} } else if(k==='whip'){c.beginPath(); c.moveTo(0,0); for(let i=1;i<6;i++) c.lineTo(i*10,Math.sin(i+state.time*8)*10); c.stroke();} else if(k==='dagger'){c.beginPath(); c.moveTo(0,0); c.lineTo(28,-6); c.lineTo(20,4); c.closePath(); c.fill();} else if(k==='greatsword'){c.fillRect(0,-6,44,12); c.fillStyle='#f8fafc'; c.fillRect(34,-10,10,20);} else if(k==='scythe'){c.beginPath(); c.moveTo(0,18); c.lineTo(34,-18); c.stroke(); c.beginPath(); c.arc(35,-20,16,0.1,2.5); c.stroke();} else if(k==='gunstaff'){c.fillRect(0,-5,36,10); circle(c,38,0,7);} else if(k==='chakram'){c.lineWidth=4; c.beginPath(); c.arc(18,0,15,0,Math.PI*2); c.stroke();} else if(k==='pole'){c.beginPath(); c.moveTo(-8,0); c.lineTo(48,0); c.stroke(); c.fillRect(43,-5,12,10);} else {c.beginPath(); c.moveTo(0,0); c.lineTo(38,-10); c.lineTo(30,8); c.closePath(); c.fill();} c.restore(); }
  function drawHud(){ const hpw=260; ctx.fillStyle='rgba(0,0,0,.45)'; roundRect(ctx,18,H-88,360,72,14); ctx.fillStyle='#ef4444'; roundRect(ctx,38,H-72,hpw*clamp(player.hp/player.maxHp,0,1),12,6); ctx.fillStyle='#334155'; roundRect(ctx,38,H-52,hpw,8,4); ctx.fillStyle='#60a5fa'; roundRect(ctx,38,H-52,hpw*clamp(player.shield/500,0,1),8,4); ctx.fillStyle='#fff'; ctx.font='800 12px system-ui'; ctx.fillText(`HP ${Math.ceil(player.hp)}/${Math.ceil(player.maxHp)}  Shield ${Math.floor(player.shield)}`,38,H-77); const cds=[player.basicCd,player.skillCd[0],player.skillCd[1],player.skillCd[2],player.rollCd]; const labels=['J','1','2','3','Space']; for(let i=0;i<5;i++){const x=430+i*78,y=H-70; ctx.fillStyle='rgba(15,23,42,.78)'; roundRect(ctx,x,y,60,48,10); ctx.fillStyle='#fff'; ctx.font='900 13px system-ui'; ctx.textAlign='center'; ctx.fillText(labels[i],x+30,y+19); ctx.fillStyle=cds[i]>0?'#fb7185':'#86efac'; ctx.fillText(cds[i]>0?cds[i].toFixed(1):'OK',x+30,y+38);} ctx.textAlign='left'; }
  function drawControlHint(){ ctx.save(); ctx.globalAlpha=.55; ctx.fillStyle='#e5e7eb'; ctx.font='900 15px system-ui'; ctx.textAlign='center'; ctx.fillText('WASD 이동   ·   마우스 조준   ·   J/좌클릭 일반공격   ·   1 공격스킬   ·   2 회피스킬   ·   3 버프스킬   ·   Space 구르기', W/2, H-10); ctx.restore(); }
  function drawProjectiles(){ state.projectiles.forEach(p=>{ if(p.delay&&p.delay>0){ctx.strokeStyle=p.color; ctx.globalAlpha=.25; circleStroke(ctx,p.x,p.y,18); ctx.globalAlpha=1; return;} ctx.save(); ctx.shadowColor=p.color; ctx.shadowBlur=12; ctx.fillStyle=p.color; circle(ctx,p.x,p.y,p.r); ctx.restore(); }); }
  function drawHazards(){ state.hazards.forEach(h=>{ctx.save(); ctx.globalAlpha=h.warn>0?.35:.75; ctx.strokeStyle=h.color; ctx.fillStyle=h.kind==='wall'?h.color:'transparent'; ctx.lineWidth=3; if(h.kind==='circle'||h.kind==='playerStrike'){circleStroke(ctx,h.x,h.y,h.r); if(h.warn<=0){ctx.globalAlpha=.35; ctx.fillStyle=h.color; circle(ctx,h.x,h.y,h.r);}} else if(h.kind==='wall'){ctx.fillRect(h.x-h.w/2,h.y-h.h/2,h.w,h.h);} ctx.restore();});}
  function drawZones(){ state.zones.forEach(z=>{ctx.save(); ctx.globalAlpha=.22+.1*Math.sin(state.time*8); ctx.fillStyle=z.color; circle(ctx,z.x,z.y,z.r); ctx.globalAlpha=.65; ctx.strokeStyle=z.color; ctx.lineWidth=3; circleStroke(ctx,z.x,z.y,z.r); ctx.restore();});}
  function drawMechanics(){ state.mechanics.forEach(m=>{ctx.save(); ctx.strokeStyle=m.color; ctx.fillStyle=m.color; if(m.kind==='rune'){ctx.globalAlpha=.8; circleStroke(ctx,m.x,m.y,m.r+Math.sin(state.time*8)*4); ctx.font='900 20px system-ui'; ctx.textAlign='center'; ctx.fillText('룬',m.x,m.y+7);} if(m.kind==='gravity'){ctx.globalAlpha=.35; circleStroke(ctx,m.x,m.y,m.r); for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(m.x,m.y,m.r*(i+1)/5,state.time+i,state.time+i+1.2);ctx.stroke();}} ctx.restore();});}
  function drawParticles(){ state.particles.forEach(p=>{ctx.globalAlpha=clamp(p.life,0,1); ctx.fillStyle=p.color; circle(ctx,p.x,p.y,p.r); ctx.globalAlpha=1;});}
  function drawTexts(){ state.texts.forEach(t=>{ctx.globalAlpha=clamp(t.life,0,1); ctx.fillStyle=t.color; ctx.font=`900 ${t.size||16}px system-ui`; ctx.textAlign='center'; ctx.fillText(t.text,t.x,t.y); ctx.globalAlpha=1;});}

  function burst(x,y,color,count,speed){ for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2, v=rand(speed*.25,speed); state.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:rand(2,5),life:rand(.25,.75),color});} }
  function slashEffect(x,y,a,range,color,width){ state.particles.push({x:x+Math.cos(a)*range*.45,y:y+Math.sin(a)*range*.45,vx:0,vy:0,r:width||10,life:.12,color}); }
  function arcEffect(x,y,a,range,color){ for(let i=-4;i<=4;i++){const aa=a+i*.13; state.particles.push({x:x+Math.cos(aa)*range*.55,y:y+Math.sin(aa)*range*.55,vx:0,vy:0,r:5,life:.18,color});} }
  function stabEffect(x,y,a,range,color){ for(let i=0;i<6;i++) state.particles.push({x:x+Math.cos(a)*range*i/6,y:y+Math.sin(a)*range*i/6,vx:0,vy:0,r:3,life:.13,color}); }
  function thrustEffect(x,y,a,range,color){ stabEffect(x,y,a,range,color); }
  function beamEffect(x,y,a,color){ for(let i=0;i<12;i++) state.particles.push({x:x+Math.cos(a)*i*34,y:y+Math.sin(a)*i*34,vx:0,vy:0,r:4,life:.2,color}); }
  function floatText(text,x,y,color,size){ state.texts.push({text,x,y,vy:-38,life:1.0,color:color||'#fff',size:size||16}); }
  function healText(text,x,y){ floatText(text,x,y,'#86efac',18); }
  function updateParticles(dt){ state.particles.forEach(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.03,dt);p.vy*=Math.pow(.03,dt);}); state.particles=state.particles.filter(p=>p.life>0); }
  function updateTexts(dt){ state.texts.forEach(t=>{t.life-=dt;t.y+=(t.vy||-30)*dt;}); state.texts=state.texts.filter(t=>t.life>0); }

  function bossMiniSvg(b){ return `<svg width="120" height="86" viewBox="0 0 120 86"><defs><filter id="g${b.id}"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#g${b.id})"><circle cx="60" cy="44" r="${22+b.tier*4}" fill="${b.color}" opacity=".95"/><circle cx="48" cy="38" r="4" fill="#020617"/><circle cx="72" cy="38" r="4" fill="#020617"/><path d="M40 58 Q60 72 80 58" stroke="${b.sub}" stroke-width="5" fill="none" stroke-linecap="round"/></g></svg>`; }

  function loop(now){ const dt=Math.min(.033,(now-state.last)/1000||.016); state.last=now; update(dt); draw(); requestAnimationFrame(loop); }
  function toast(msg){state.message=msg; state.messageTime=2.0; floatText(msg,W/2,92,'#fef08a',20);}
  function formatMs(ms){const s=ms/1000; return s<60?s.toFixed(2)+'초':Math.floor(s/60)+'분 '+(s%60).toFixed(1)+'초';}
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function rand(a,b){return a+Math.random()*(b-a);}
  function dist(x1,y1,x2,y2){return Math.hypot(x1-x2,y1-y2);}
  function normAngle(a){while(a>Math.PI)a-=Math.PI*2; while(a<-Math.PI)a+=Math.PI*2; return a;}
  function circle(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
  function circleStroke(c,x,y,r){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.stroke();}
  function roundRect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.lineTo(x+w-r,y);c.quadraticCurveTo(x+w,y,x+w,y+r);c.lineTo(x+w,y+h-r);c.quadraticCurveTo(x+w,y+h,x+w-r,y+h);c.lineTo(x+r,y+h);c.quadraticCurveTo(x,y+h,x,y+h-r);c.lineTo(x,y+r);c.quadraticCurveTo(x,y,x+r,y);c.closePath();c.fill();}
  function polygon(c,x,y,r,n){c.beginPath(); for(let i=0;i<n;i++){const a=-Math.PI/2+i/n*Math.PI*2; const px=x+Math.cos(a)*r, py=y+Math.sin(a)*r; if(i)c.lineTo(px,py); else c.moveTo(px,py);} c.closePath();}
})();
