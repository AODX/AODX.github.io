
/* =========================================================
   RAID DUNGEON V14 - HARD CLICK AND STORAGE FIX FULL REPLACE public/src/game.js
   보스 레이드 + 가챠 + 보스별 랭킹 + 패턴 파훼 액션 게임

   적용 위치: public/src/game.js 전체 교체
   조작: WASD 이동 / 마우스 조준 / J 또는 좌클릭 일반공격 / 1~3 자유 장착 스킬 / Space 방향 구르기 / P 일시정지

   Supabase 랭킹 테이블은 V1~V3의 raid_records 그대로 사용합니다.
========================================================= */
'use strict';

(function () {
  const SUPABASE_URL = 'https://pofxjyjpkwhuugaesbyb.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_6ssOyoAVhA5qIEsXfI0vag_JqsNntpI';
  const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  const VERSION = 'Raid Dungeon V14 - Hard Click Storage Fix';
  try { document.title = 'Raid Dungeon'; } catch(e) {}
  const W = 1280;
  const H = 720;
  const SAVE_KEY = 'raid-build-v14-local-save';
  const LEGACY_SAVE_KEYS = ['raid-build-v14-local-save','raid-build-v12-local-save','raid-build-v11-local-save','raid-build-v10-local-save','raid-build-v9-local-save','raid-build-v7-local-save','raid-build-v6-local-save'];
  const LOCAL_RECORD_KEY = 'raid-build-v12-local-records';
  const INITIAL_TICKETS = { weapon: 1, armor: 1, skill: 3, passive: 1 }; // 처음 지급: 무기 1회, 방어구 1회, 스킬 3회, 패시브 1회
  const TICKET_LABEL = { weapon: '무기 뽑기 티켓', armor: '방어구 뽑기 티켓', skill: '스킬 뽑기 티켓', passive: '패시브 뽑기 티켓' };
  const PROFILE_TABLE = 'raid_profiles';
  const MAX_PARTICLES = 360;
  const MAX_TEXTS = 80;
  const MAX_PROJECTILES = 240;
  const MAX_HAZARDS = 180;
  const MAX_ZONES = 90;
  const MAX_MECHANICS = 80;

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
    bossDef('frost_oracle', '빙결 예언자 네이아', 3, 'ice', '#38bdf8', '#a5f3fc', 72000, '얼음창과 빙결 룬을 사용하는 냉기 보스입니다.', ['빙결 룬', '얼음창', '동상 장판']),
    bossDef('sand_reaper', '모래 사신 샤하르', 3, 'sand', '#f59e0b', '#fde68a', 76000, '모래 폭풍으로 시야와 이동을 방해합니다.', ['모래 폭풍', '낫 회전', '매몰 지대']),
    bossDef('void_serpent', '공허의 뱀 노크스', 4, 'void', '#8b5cf6', '#111827', 90000, '순간이동과 공허 독늪으로 플레이어를 압박합니다.', ['순간이동', '공허 늪', '추적 구체']),
    bossDef('iron_minotaur', '철갑 미노타우로스', 4, 'metal', '#94a3b8', '#f97316', 98000, '돌진을 유도해 벽에 부딪히게 해야 약화됩니다.', ['광폭 돌진', '철벽 보호막', '도끼 파동']),
    bossDef('blood_moon', '혈월의 사냥꾼 루나', 5, 'blood', '#be123c', '#fda4af', 104000, '체력이 낮아질수록 더 빠른 혈월 탄막을 사용합니다.', ['혈월 표식', '흡혈 칼날', '붉은 달 탄막']),
    bossDef('storm_colossus', '폭풍 거신 아스트라', 6, 'lightning', '#facc15', '#60a5fa', 122000, '낙뢰와 전류 룬을 파훼해야 하는 고난도 보스입니다.', ['낙뢰 예고', '전류 룬', '거신 충격파']),
    bossDef('plague_doctor', '역병 의사 모르비드', 6, 'poison', '#84cc16', '#14532d', 132000, '해독 구역을 밟지 않으면 지속 피해가 누적됩니다.', ['역병 안개', '해독 구역', '독침 난사']),
    bossDef('mirror_duelist', '거울 결투사 세렌', 7, 'mirror', '#e879f9', '#bae6fd', 136000, '분신 중 진짜를 찾아 공격해야 하는 특수 보스입니다.', ['거울 분신', '반사검', '진짜 찾기']),
    bossDef('gravity_core', '중력핵 아틀라스', 8, 'gravity', '#818cf8', '#1e1b4b', 158000, '중력장으로 플레이어와 탄막을 끌어당기는 괴랄한 보스입니다.', ['중력 흡입', '압축 폭발', '역중력 파동']),
    bossDef('solar_dragon', '태양룡 솔라리온', 8, 'solar', '#fb923c', '#fde047', 170000, '태양 광선과 불타는 낙하 패턴을 섞어 사용합니다.', ['태양 광선', '일식 안전지대', '태양 낙하']),
    bossDef('chrono_dragon', '시간룡 크로노스', 9, 'chrono', '#f472b6', '#fef08a', 184000, '시간 감속, 되감기 룬, 분신 탄막을 함께 사용하는 최종급 보스입니다.', ['시간 감속', '되감기 룬', '분신 탄막']),
    bossDef('abyss_leviathan', '심해의 레비아탄 아비스', 9, 'void', '#38bdf8', '#0f172a', 196000, '심해 물결, 흡입, 추적 파도를 섞는 최종권 보스입니다.', ['심해 파동', '흡입 소용돌이', '즉사 해일']),
    bossDef('puppet_emperor', '인형 황제 마리오네트', 10, 'mirror', '#f0abfc', '#fde68a', 205000, '실과 분신으로 이동을 제한하고 가짜 안전지대를 만드는 보스입니다.', ['실 조종', '가짜 안전지대', '즉사 단두대']),
    bossDef('black_sun', '검은 태양 아포칼립스', 10, 'solar', '#f97316', '#020617', 218000, '태양과 공허가 합쳐진 최상위 보스. 즉사 일식 패턴을 사용합니다.', ['일식 심판', '검은 태양 낙하', '즉사 안전지대']),
    bossDef('chaos_archon', '혼돈의 집정관 카이로스', 10, 'chaos', '#fb7185', '#7c3aed', 226000, '여러 보스의 패턴이 섞여 나오는 최종 도전 보스입니다.', ['무작위 속성', '혼돈 룬', '괴랄 탄막', '즉사 혼돈'])
  ];

  const WEAPONS = [
    // 일반 등급
    weapon('rust_sword', '낡은 검', 'normal', 'sword', '가볍고 빠른 기본 베기. 초반 안정성이 좋습니다.', '#d97706', 1.00, 92, .34, 0),
    weapon('oak_staff', '떡갈나무 스태프', 'normal', 'staff', '마력탄을 발사하는 기본 스태프.', '#60a5fa', .86, 430, .50, 0),
    weapon('hunter_bow', '사냥꾼 활', 'normal', 'bow', '빠른 화살을 발사합니다.', '#facc15', .92, 560, .30, 5),
    weapon('training_pole', '수련용 봉', 'normal', 'pole', '앞으로 길게 찌르는 안정적인 무기.', '#34d399', .96, 160, .38, 2),
    weapon('leather_whip', '가죽 채찍', 'normal', 'whip', '넓게 휘둘러 가까운 적을 견제합니다.', '#c084fc', .82, 170, .42, 3),
    weapon('kitchen_dagger', '녹슨 단검', 'normal', 'dagger', '짧지만 매우 빠른 연타 무기.', '#e5e7eb', .62, 72, .17, 14),
    weapon('stone_greatsword', '돌 대검', 'normal', 'greatsword', '느리지만 묵직한 초반 대검.', '#94a3b8', 1.36, 124, .82, 2),
    weapon('spark_gunstaff', '소형 마도총', 'normal', 'gunstaff', '작은 폭발 마도탄을 발사합니다.', '#22d3ee', .90, 470, .62, 4),

    // 희귀 등급
    weapon('silver_saber', '은빛 세이버', 'rare', 'sword', '부드러운 곡선으로 빠르게 베어냅니다.', '#cbd5e1', 1.08, 104, .31, 8),
    weapon('serpent_whip', '뱀가죽 채찍', 'rare', 'whip', '뱀처럼 휘어지는 부채꼴 타격.', '#a78bfa', .94, 200, .38, 8),
    weapon('shadow_dagger', '그림자 단검', 'rare', 'dagger', '짧은 거리를 순식간에 찌릅니다.', '#e879f9', .70, 78, .145, 22),
    weapon('ash_staff', '잿불 스태프', 'rare', 'staff', '붉은 잿불탄을 발사합니다.', '#fb7185', .98, 460, .48, 5),
    weapon('falcon_bow', '매의 장궁', 'rare', 'bow', '화살 속도가 빠르고 치명타가 높습니다.', '#fde047', .98, 610, .29, 12),
    weapon('jade_pole', '비취 봉', 'rare', 'pole', '긴 사거리와 균형 잡힌 공격속도.', '#34d399', 1.05, 180, .35, 6),
    weapon('chain_blade', '사슬검', 'rare', 'whip', '검과 채찍을 합친 듯한 넓은 공격.', '#38bdf8', 1.00, 205, .41, 9),
    weapon('burst_pistol_staff', '폭발 마도권총', 'rare', 'gunstaff', '작은 폭발을 일으키는 마도탄.', '#67e8f9', .98, 500, .58, 8),

    // 초희귀 등급
    weapon('flame_blade', '화염검', 'super', 'sword_fire', '불꽃 잔상을 남기는 검.', '#fb7185', 1.16, 115, .34, 10),
    weapon('storm_bow', '폭풍궁', 'super', 'bow_storm', '관통 번개 화살을 쏩니다.', '#fde047', 1.04, 640, .31, 14),
    weapon('moon_dagger', '월영 단검', 'super', 'dagger', '달빛 잔상을 남기는 고속 단검.', '#c4b5fd', .82, 86, .13, 28),
    weapon('thunder_pole', '뇌전 봉', 'super', 'pole', '찌르기 끝에 전류가 터집니다.', '#facc15', 1.13, 198, .33, 11),
    weapon('rose_whip', '가시 장미 채찍', 'super', 'whip', '넓은 범위에 가시 타격을 가합니다.', '#f472b6', 1.02, 222, .37, 13),
    weapon('rune_staff', '룬 스태프', 'super', 'staff', '룬 마법탄을 안정적으로 발사합니다.', '#818cf8', 1.10, 500, .44, 10),
    weapon('crystal_greatsword', '수정 대검', 'super', 'greatsword', '투명한 수정 참격을 날립니다.', '#7dd3fc', 1.62, 145, .72, 9),
    weapon('arcane_revolver', '비전 리볼버', 'super', 'gunstaff', '폭발 범위가 넓은 마도탄.', '#22d3ee', 1.12, 535, .54, 12),

    // 에픽 등급
    weapon('glacier_staff', '빙하 스태프', 'epic', 'staff_ice', '폭발하는 얼음 구체를 발사합니다.', '#7dd3fc', 1.18, 540, .43, 10),
    weapon('dragon_greatsword', '용살 대검', 'epic', 'greatsword', '느리지만 거대한 화염 참격.', '#f97316', 1.86, 158, .70, 13),
    weapon('phantom_dagger', '환영 단검', 'epic', 'dagger', '세 번 찌르는 듯한 잔상 연타.', '#d946ef', .92, 94, .115, 34),
    weapon('leviathan_whip', '레비아탄 채찍', 'epic', 'whip', '파도처럼 넓게 휘몰아치는 채찍.', '#38bdf8', 1.15, 245, .35, 16),
    weapon('sunpiercer_bow', '태양 관통궁', 'epic', 'bow_storm', '빛의 화살이 빠르게 관통합니다.', '#fef08a', 1.14, 690, .30, 18),
    weapon('meteor_sword', '유성검', 'epic', 'sword_fire', '베기 끝에 유성 파편이 튑니다.', '#fb923c', 1.32, 128, .32, 17),
    weapon('obsidian_pole', '흑요석 봉', 'epic', 'pole', '무거운 찌르기로 보스의 빈틈을 찌릅니다.', '#a78bfa', 1.30, 215, .34, 15),
    weapon('nova_gunstaff', '노바 마도총', 'epic', 'gunstaff', '폭발 마도탄의 위력이 강합니다.', '#67e8f9', 1.24, 570, .52, 18),

    // 레전더리 등급
    weapon('void_scythe', '공허 낫', 'legendary', 'scythe', '왕복하는 공허 낫을 날립니다.', '#a78bfa', 1.42, 460, .52, 20),
    weapon('arcane_gunstaff', '마도총 엑셀리온', 'legendary', 'gunstaff', '강력한 폭발 마도탄을 발사합니다.', '#22d3ee', 1.38, 590, .50, 22),
    weapon('storm_lord_bow', '폭풍군주의 활', 'legendary', 'bow_storm', '번개 화살이 보스를 꿰뚫습니다.', '#fde047', 1.30, 740, .27, 26),
    weapon('blood_moon_blades', '혈월 쌍단검', 'legendary', 'dagger', '흡혈의 붉은 잔상을 남기는 단검.', '#fb7185', 1.05, 102, .10, 42),
    weapon('solar_lance', '태양 장봉', 'legendary', 'pole', '태양빛이 응축된 긴 찌르기.', '#facc15', 1.48, 238, .31, 22),
    weapon('abyssal_whip', '심연 채찍', 'legendary', 'whip', '검은 균열을 그리며 휘둘러집니다.', '#8b5cf6', 1.28, 275, .33, 25),
    weapon('chronos_blade', '시간검 크로노엣지', 'legendary', 'sword', '공격 궤적이 늦게 한 번 더 베어냅니다.', '#f472b6', 1.50, 142, .30, 24),
    weapon('starfall_greatsword', '성운 대검', 'legendary', 'greatsword', '별빛 참격으로 넓게 베어냅니다.', '#fef08a', 2.05, 175, .66, 20),

    // 궁극 등급
    weapon('celestial_chakram', '천공 차크람', 'ultimate', 'chakram', '던진 뒤 되돌아오는 궁극 원형 무기.', '#fef08a', 1.62, 650, .39, 32),
    weapon('origin_grimoire', '근원 마도서', 'ultimate', 'grimoire', '자동 추적 마법탄이 연속 발사됩니다.', '#fb7185', 1.54, 700, .42, 30),
    weapon('genesis_sword', '창세검', 'ultimate', 'sword_fire', '검격마다 창세의 빛이 터집니다.', '#ffffff', 1.88, 162, .27, 35),
    weapon('apocalypse_bow', '종말궁', 'ultimate', 'bow_storm', '화살이 번개 폭풍처럼 관통합니다.', '#facc15', 1.58, 800, .25, 40),
    weapon('infinite_dagger', '무한 단검', 'ultimate', 'dagger', '거의 끊기지 않는 초고속 찌르기.', '#e879f9', 1.22, 116, .085, 52),
    weapon('world_tree_staff', '세계수 스태프', 'ultimate', 'staff', '생명과 별빛이 섞인 추적 마법탄.', '#86efac', 1.70, 760, .40, 34),
    weapon('ouroboros_whip', '우로보로스 채찍', 'ultimate', 'whip', '원형으로 휘감기는 궁극 채찍.', '#a78bfa', 1.48, 315, .30, 38),
    weapon('singularity_scythe', '특이점 낫', 'ultimate', 'scythe', '공간을 접어 왕복하는 검은 낫.', '#c084fc', 1.76, 560, .46, 36)
  ];


  const ARMORS = [
    armor('cotton_vest','낡은 천 조끼','normal','최대 체력 +12, 방어 +1. 기본 생존용 방어구입니다.','#cbd5e1',12,1,{}),
    armor('leather_mail','가죽 갑옷','normal','최대 체력 +16, 방어 +1. 움직임이 가벼운 방어구입니다.','#a16207',16,1,{}),
    armor('bronze_guard','청동 흉갑','normal','최대 체력 +20, 방어 +2. 초반용 흉갑입니다.','#d97706',20,2,{}),
    armor('ranger_coat','사냥꾼 코트','rare','최대 체력 +25, 방어 +2, 슬로우 저항. 이동 방해를 조금 줄입니다.','#38bdf8',25,2,{slow:.20}),
    armor('ember_cloak','잿불 망토','rare','최대 체력 +28, 방어 +2, 화상 저항. 화염 보스에 유리합니다.','#fb7185',28,2,{burn:.25}),
    armor('venom_mask','독막 마스크','rare','최대 체력 +24, 방어 +2, 독 저항. 독 피해를 줄입니다.','#84cc16',24,2,{poison:.25}),
    armor('frost_plate','빙결 판금','super','최대 체력 +34, 방어 +3, 빙결 저항. 얼음 패턴에 강합니다.','#7dd3fc',34,3,{freeze:.35}),
    armor('thunder_coat','뇌전 코트','super','최대 체력 +32, 방어 +3, 마비 저항. 번개 패턴에 강합니다.','#fde047',32,3,{paralysis:.35}),
    armor('thorn_mail','가시 갑옷','super','최대 체력 +36, 방어 +3, 독 저항. 자연/독 보스에 좋습니다.','#f472b6',36,3,{poison:.35}),
    armor('mirror_robe','거울 로브','epic','최대 체력 +44, 방어 +4, 슬로우/마비 저항. 기믹 대응력이 좋습니다.','#e879f9',44,4,{slow:.40,paralysis:.28}),
    armor('abyss_guard','심연 수호갑','epic','최대 체력 +48, 방어 +4, 독/화상 저항. 지속 피해에 강합니다.','#8b5cf6',48,4,{poison:.42,burn:.32}),
    armor('solar_aegis','태양 방벽갑','epic','최대 체력 +52, 방어 +4, 화상 저항. 큰 화염 공격을 버티기 쉽습니다.','#f97316',52,4,{burn:.48}),
    armor('storm_aegis','폭풍 방벽갑','legendary','최대 체력 +65, 방어 +5, 마비 면역 55%, 슬로우 저항. 폭풍 거신 대응용입니다.','#facc15',65,5,{paralysis:.55,slow:.35}),
    armor('chrono_mantle','시간 망토','legendary','최대 체력 +60, 방어 +5, 슬로우 면역 60%, 빙결 저항. 시간/빙결 기믹에 강합니다.','#f472b6',60,5,{slow:.60,freeze:.38}),
    armor('plague_saint','역병 성자의 예복','legendary','최대 체력 +62, 방어 +5, 독 면역 65%, 화상 저항. 역병 보스에 강합니다.','#bef264',62,5,{poison:.65,burn:.28}),
    armor('genesis_armor','창세 방어구','ultimate','최대 체력 +85, 방어 +7, 모든 상태이상 저항 45%. 궁극 등급 방어구입니다.','#ffffff',85,7,{burn:.45,poison:.45,freeze:.45,paralysis:.45,slow:.45}),
    armor('apocalypse_shell','종말의 외피','ultimate','최대 체력 +95, 방어 +6, 독/화상/마비 면역 60%. 후반 즉사 외 일반 패턴을 버티기 좋습니다.','#fb7185',95,6,{burn:.60,poison:.60,paralysis:.60}),
    armor('void_king_plate','공허왕의 판금','ultimate','최대 체력 +90, 방어 +8, 슬로우/빙결 면역 60%. 공허, 중력, 시간 패턴에 강합니다.','#a78bfa',90,8,{slow:.60,freeze:.60})
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
  let cloudSaveTimer = null;

  const state = {
    screen: 'menu',
    menuTab: 'dungeon',
    buildStep: 'weapon',
    selectedBossId: BOSSES[0].id,
    selectedWeaponId: null,
    selectedArmorId: null,
    selectedSkillIds: [null, null, null],
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
    authMode: 'login',
    authMessage: '',
    authBusy: false,
    authChecked: false,
    currentUser: null,
    cloudStatus: '로컬 저장',
    save: loadSave()
  };

  normalizeSave();
  bindEvents();
  initSupabase();
  renderMenu();
  loop(performance.now());

  function bossDef(id, name, tier, theme, color, sub, hp, desc, patterns) {
    // V10: 보스 등급을 1~10까지 확장. 초반은 연습용, 후반은 패턴 파훼 중심으로 오래 버티며 깨는 구조.
    const hpMul = 0.030 + tier * 0.014 + Math.max(0, tier - 5) * 0.010;
    const scaledHp = Math.max(1500, Math.floor(hp * hpMul));
    return { id, name, tier, theme, color, sub, hp: scaledHp, atk: 5.5 + tier * 2.35, speed: 55 + tier * 7.5, desc, patterns };
  }
  function weapon(id, name, rarity, kind, desc, color, atk, range, speed, crit) {
    const r = getRarity(rarity);
    const k = String(kind || '');
    const ranged = k.includes('staff') || k.includes('bow') || ['gunstaff','scythe','chakram','grimoire'].includes(k);
    const heavy = k === 'greatsword' || k === 'scythe';
    const dagger = k === 'dagger';
    // V10 밸런스: 무기 평타는 보조 딜링으로 하향. 스킬이 주 딜링이 되도록 조정.
    const atkMul = ranged ? 0.20 : dagger ? 0.21 : heavy ? 0.27 : 0.24;
    const adjustedSpeed = ranged ? speed + 0.42 : heavy ? speed * 0.94 : dagger ? Math.max(0.105, speed * 1.05) : Math.max(0.18, speed * 0.88);
    const adjustedRange = ranged ? range : Math.max(70, range * 0.96);
    return { id, name, rarity, kind, desc, color, atk: atk * r.power * atkMul, range: adjustedRange, speed: adjustedSpeed, crit, type: 'weapon' };
  }

  function armor(id, name, rarity, desc, color, hp, def, resist) {
    const r = getRarity(rarity);
    return {
      id,
      name,
      rarity,
      desc,
      color,
      hp: Math.max(0, Math.floor((hp || 0) * (0.85 + r.power * 0.15))),
      def: Math.max(0, Math.floor((def || 0) * (0.9 + r.power * 0.12))),
      resist: resist || {},
      type: 'armor'
    };
  }

  function getRarity(id) { return RARITIES.find(r => r.id === id) || RARITIES[0]; }
  function rarityLabel(id) { const r = getRarity(id); return `<span style="color:${r.color};font-weight:900">${r.name}</span>`; }
  function stars(n) { const v=clamp(Math.round(n),1,10); return '★'.repeat(v) + '☆'.repeat(10 - v); }
  function getBoss(id) { return BOSSES.find(b => b.id === id) || BOSSES[0]; }
  function getWeapon(id) { return WEAPONS.find(w => w.id === id) || null; }
  function getSkill(id) { return SKILLS.find(s => s.id === id) || null; }
  function getPassive(id) { return PASSIVES.find(p => p.id === id) || null; }
  function passiveLimit() { return 1; }
  function ownedWeapons() { return WEAPONS.filter(w => state.save.weapons.includes(w.id)); }
  function ownedSkills(cat) { return SKILLS.filter(s => state.save.skills.includes(s.id) && (!cat || s.category === cat)); }
  function ownedPassives() { return PASSIVES.filter(p => state.save.passives.includes(p.id)); }
  function skillCategoryName(cat) { return ({attack:'공격', buff:'버프', heal:'회복', debuff:'디버프', cleanse:'상태이상 해제', evasion:'회피'})[cat] || cat; }

  function buildSkills() {
    // V9: 스킬 분류를 공격/버프/회복/디버프/상태이상 해제로 재구성했습니다.
    const attackNames = [
      ['inferno_bloom','지옥화 개화','fire','burst'],['solar_spear','태양창 투척','solar','line'],['thunder_judgement','천둥 심판','lightning','chain'],['glacier_impale','빙하 관통','ice','line'],['void_collapse','공허 붕괴','void','burst'],['blade_rain','검우 낙하','metal','rain'],['dragon_tooth','용아 찌르기','fire','strike'],['moon_slash','월광 참격','arcane','line'],['meteor_call','운석 호출','fire','rain'],['tidal_crush','해일 압살','water','burst'],['starfall','성운 낙하','arcane','rain'],['soul_lance','영혼 창','spirit','line'],['quake_fist','대지권','earth','strike'],['ember_saw','화염 원반','fire','line'],['frost_ring','서리 고리','ice','burst'],['plasma_ray','플라즈마 광선','lightning','line'],['scarlet_mark','붉은 표식','blood','strike'],['thorn_prison','가시 감옥','nature','zone'],['comet_blade','혜성검','metal','line'],['dark_matter','암흑 물질','void','burst'],['sand_cutter','사막 절단','sand','line'],['holy_cross','성십자 폭발','solar','burst'],['gravity_hammer','중력 망치','gravity','strike'],['spirit_wolves','영혼 늑대','spirit','orb'],['lava_garden','용암 정원','fire','zone'],['ice_mirror','얼음 거울창','ice','rain'],['chaos_needle','혼돈 바늘','chaos','chain'],['blood_scythe','혈월 낫','blood','line'],['storm_falcon','폭풍 매','lightning','orb'],['crystal_barrage','수정 난사','arcane','rain'],['abyss_javelin','심연 투창','void','line'],['sunflare','태양섬광','solar','burst'],['iron_maw','강철 아가리','metal','strike'],['rose_burst','장미 폭발','nature','burst'],['time_spike','시간 가시','chrono','chain'],['star_cannon','별빛 포격','arcane','line'],['dragon_meteor','용성 낙하','fire','rain'],['ocean_blade','해류검','water','line'],['singularity_laser','특이점 광선','gravity','line']
    ];
    const buffNames = [
      ['war_cry','전장의 함성','fire','buff_damage'],['arcane_overload','비전 과부하','arcane','buff_skill'],['eagle_eye','매의 눈','lightning','buff_crit'],['haste_field','가속장','wind','buff_speed'],['blood_pact','피의 계약','blood','buff_life'],['cooling_core','냉각 핵','ice','buff_cool'],['sun_banner','태양 깃발','solar','buff_damage'],['void_contract','공허 계약','void','buff_skill'],['iron_focus','강철 집중','metal','buff_crit'],['nature_blessing','숲의 축복','nature','buff_life'],['storm_engine','폭풍 엔진','lightning','buff_speed'],['mirror_mind','거울 정신','mirror','buff_crit'],['gravity_anchor','중력 닻','gravity','buff_damage'],['dragon_heart','용의 심장','fire','buff_damage'],['ocean_rhythm','해류 리듬','water','buff_cool'],['star_prayer','별의 기도','arcane','buff_life'],['chaos_ignite','혼돈 점화','chaos','buff_skill'],['spirit_chant','영혼 성가','spirit','buff_life'],['lunar_focus','달빛 집중','arcane','buff_crit'],['berserk_signal','광폭 신호','blood','buff_damage'],['frost_engine','서리 엔진','ice','buff_speed'],['holy_oath','성스러운 맹세','solar','buff_life'],['void_accel','공허 가속','void','buff_cool'],['metal_overdrive','강철 오버드라이브','metal','buff_skill'],['time_focus','시간 집중','chrono','buff_cool']
    ];
    const healNames = [
      ['first_aid_light','응급 빛치유','solar','heal_small'],['water_mend','물결 봉합','water','heal_small'],['leaf_recover','새잎 회복','nature','heal_small'],['spirit_bandage','영혼 붕대','spirit','heal_small'],['moon_rest','달빛 휴식','arcane','heal_regen'],['holy_spring','성수 샘','solar','heal_zone'],['blood_return','혈류 회복','blood','heal_big'],['star_heal','별빛 치유','arcane','heal_big'],['aqua_sanctuary','물의 성역','water','heal_zone'],['phoenix_pulse','불사조 맥동','fire','heal_big'],['world_tree_grace','세계수 은총','nature','heal_big'],['origin_restore','근원 복원','spirit','heal_full']
    ];
    const debuffNames = [
      ['venom_brand','맹독 낙인','poison','debuff_poison'],['ember_curse','화염 저주','fire','debuff_burn'],['frost_lock','빙결 족쇄','ice','debuff_freeze'],['thunder_bind','뇌전 속박','lightning','debuff_paralyze'],['slow_hourglass','감속 모래시계','chrono','debuff_slow'],['armor_melt','장갑 용해','fire','debuff_vulnerable'],['void_exhaust','공허 탈진','void','debuff_weaken'],['rose_thorn_mark','가시장미 표식','nature','debuff_poison'],['plague_seal','역병 봉인','poison','debuff_poison'],['gravity_shackle','중력 족쇄','gravity','debuff_slow'],['ice_coffin','얼음 관','ice','debuff_freeze'],['storm_stun','폭풍 기절','lightning','debuff_paralyze'],['blood_decay','혈월 부식','blood','debuff_vulnerable'],['mirror_crack','거울 균열','mirror','debuff_weaken'],['chaos_brand','혼돈 표식','chaos','debuff_vulnerable'],['abyss_sleep','심연 무력화','void','debuff_weaken'],['toxic_sun','독성 태양','poison','debuff_poison'],['time_rust','시간 부식','chrono','debuff_slow']
    ];
    const cleanseNames = [
      ['cleanse_water','정화의 물결','water','cleanse_all'],['holy_purification','성스러운 정화','solar','cleanse_all'],['ice_dispel','빙결 해제','ice','cleanse_freeze'],['storm_grounding','전류 접지','lightning','cleanse_paralysis'],['antidote_bloom','해독의 꽃','nature','cleanse_poison'],['flame_seal','화상 봉인','fire','cleanse_burn'],['time_reset','시간 재정렬','chrono','cleanse_all'],['origin_purify','근원 정화','spirit','cleanse_all']
    ];
    const all = [];
    function add(list, category, rarityOffset) {
      list.forEach((a, i) => {
        const rarity = pickFixedRarity(i + (rarityOffset || 0), list.length + (rarityOffset || 0));
        const r = getRarity(rarity);
        const basePower = category === 'attack' ? 0.96 + i * 0.018 : category === 'heal' ? 0.80 + i * 0.020 : category === 'debuff' ? 0.62 + i * 0.015 : category === 'cleanse' ? 0.92 + i * 0.015 : 1.0;
        const baseCooldown = category === 'attack' ? 5.0 + (i % 8) * .38 : category === 'buff' ? 10.2 + (i % 7) * .55 : category === 'heal' ? 9.2 + (i % 6) * .62 : category === 'debuff' ? 8.4 + (i % 7) * .48 : 12.5 + (i % 5) * .70;
        all.push({
          id: a[0], name: a[1], element: a[2], type: a[3], category, rarity,
          color: elementColor(a[2]), power: basePower * r.power,
          cooldown: baseCooldown / Math.min(1.30, r.power),
          radius: 86 + (i % 7) * 13,
          duration: category === 'buff' ? 5 + (i % 5) : category === 'debuff' ? 4.8 + (i % 5) * .65 : (a[3] === 'zone' ? 3.8 : 1.0),
          desc: skillDesc(a[1], category, a[2], a[3])
        });
      });
    }
    add(attackNames, 'attack', 0); add(buffNames, 'buff', 4); add(healNames, 'heal', 10); add(debuffNames, 'debuff', 8); add(cleanseNames, 'cleanse', 20);
    return all.slice(0, 100);
  }

  function buildPassives() {
    const defs = [
      ['power_core','힘의 핵','normal','모든 피해 +8%', p=>p.damageMul*=1.08], ['iron_skin','강철 피부','normal','최대 체력 +15%', p=>p.maxHp*=1.15], ['swift_step','날렵한 발걸음','normal','이동속도 +12%', p=>p.speed*=1.12], ['focus_eye','집중의 눈','rare','치명타 확률 +10%', p=>p.crit+=10], ['boss_slayer','보스 슬레이어','rare','보스 피해 +14%', p=>p.damageMul*=1.14], ['cool_mind','냉정한 정신','rare','쿨타임 -10%', p=>p.cooldownMul*=.90], ['life_drain','흡혈 본능','super','흡혈 +2.5%', p=>p.lifesteal+=.025], ['giant_area','확장 마법진','super','스킬 범위 +18%', p=>p.areaMul*=1.18], ['quick_cast','빠른 시전','super','스킬 피해 +10%, 쿨타임 -6%', p=>{p.skillDamageMul*=1.10;p.cooldownMul*=.94;}], ['berserk','광전사의 심장','epic','체력이 낮을수록 피해 증가', p=>p.berserk=true], ['perfect_roll','완벽한 구르기','epic','구르기 쿨타임 -0.5초', p=>p.rollCdBonus=.5], ['dragon_blood','용혈','legendary','체력 +25%, 피해 +15%', p=>{p.maxHp*=1.25;p.damageMul*=1.15;}], ['time_engine','시간 엔진','legendary','모든 쿨타임 -18%', p=>p.cooldownMul*=.82], ['origin_star','근원의 별','ultimate','모든 능력 대폭 상승', p=>{p.damageMul*=1.28;p.skillDamageMul*=1.25;p.maxHp*=1.20;p.crit+=15;}]
    ];
    const arr = defs.map(d => ({ id:'passive_'+d[0], name:d[1], rarity:d[2], desc:d[3], apply:d[4], type:'passive' }));
    const names = ['용맹','마력','생명','질풍','예리함','치명상','스킬증폭','기본공격','재사용','재생','공격본능','비전력','강인함','가속','집중타','약점타','마법증폭','무기숙련','냉정함','회복순환','전투심','마나흐름','철벽심장','발걸음','정밀안','파괴상','주문강화','평타강화','시간단축','회복본능','압도','성운마력','근성','섬광보','사냥눈','분쇄력','스킬숙련','검술연마','쿨감각','자연치유','용맹한 핵','공허마력','태양생명','월광속도','별빛치명','혼돈치명상'];
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
      if (t===9){desc='5초마다 체력 회복 +'+v; apply=p=>p.regen5+=v;}
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
    if (cat === 'attack') return kor + ' 속성 공격 스킬. 이름에 맞는 큰 투사체, 폭발, 광선, 낙하 이펙트가 발생합니다.';
    if (cat === 'buff') return kor + ' 기운으로 일정 시간 피해, 치명타, 속도, 흡혈, 쿨타임을 강화합니다.';
    if (cat === 'heal') return kor + ' 회복 스킬. 즉시 회복, 지속 회복, 회복 장판 중 하나로 체력을 회복합니다.';
    if (cat === 'debuff') return kor + ' 디버프 스킬. 보스에게 화염, 독, 얼리기, 마비, 감속, 약화 효과를 부여합니다.';
    if (cat === 'cleanse') return kor + ' 정화 스킬. 보스가 건 마비, 독, 화염, 얼리기, 슬로우를 해제하는 높은 등급 유틸 스킬입니다.';
    return kor + ' 스킬입니다.';
  }

  function createDefaultSave() {
    return { first: true, tickets: {...INITIAL_TICKETS}, coins: 0, weapons: [], armors: [], skills: [], passives: [], playerName: 'Player', seenHelp: false, build:{weapon:null, armor:null, skills:[null,null,null], passives:[]} };
  }
  function loadSave() {
    // V14: 여러 과거 키와 백업 키를 모두 훑어서 가장 아이템이 많이 남아 있는 저장을 선택한다.
    // 예전 기본 저장이 먼저 잡혀서 뽑기 결과가 사라지는 문제를 막는다.
    let best = null;
    let bestScore = -1;
    const keys = [];
    LEGACY_SAVE_KEYS.forEach(k => { keys.push(k, k + '-backup'); });
    try {
      for (const k of keys) {
        const raw = localStorage.getItem(k);
        if (!raw) continue;
        const parsed = normalizeSaveData(JSON.parse(raw));
        const score = saveValueScore(parsed);
        if (score > bestScore) { best = parsed; bestScore = score; }
      }
    } catch(e) { console.warn('[RaidGame] loadSave scan failed:', e); }
    return best || createDefaultSave();
  }

  function saveValueScore(s) {
    if (!s) return -1;
    return (s.weapons?.length || 0) * 1000 + (s.armors?.length || 0) * 1000 + (s.skills?.length || 0) * 1000 + (s.passives?.length || 0) * 1000
      + (s.tickets?.weapon || 0) + (s.tickets?.armor || 0) + (s.tickets?.skill || 0) + (s.tickets?.passive || 0);
  }

  function writeAllLocalSaves() {
    state.save = normalizeSaveData(state.save);
    const raw = JSON.stringify(state.save);
    const keys = [SAVE_KEY, SAVE_KEY + '-backup', 'raid-build-v12-local-save', 'raid-build-v12-local-save-backup'];
    keys.forEach(k => { try { localStorage.setItem(k, raw); } catch(e) {} });
    return true;
  }
  function normalizeSave() {
    state.save = normalizeSaveData(state.save);
    writeAllLocalSaves();
  }
  function normalizeSaveData(data) {
    const s = Object.assign(createDefaultSave(), data || {});
    if (!Array.isArray(s.weapons)) s.weapons = [];
    if (!Array.isArray(s.armors)) s.armors = [];
    if (!Array.isArray(s.skills)) s.skills = [];
    if (!Array.isArray(s.passives)) s.passives = [];
    if (!s.tickets || typeof s.tickets !== 'object') s.tickets = {...INITIAL_TICKETS};
    ['weapon','armor','skill','passive'].forEach(k=>{ if(!Number.isFinite(s.tickets[k])) s.tickets[k] = INITIAL_TICKETS[k] || 0; });
    if (!Number.isFinite(s.coins)) s.coins = 0;
    if (!s.playerName) s.playerName = localStorage.getItem('raid-build-player-name-v1') || 'Player';
    if(!s.build||typeof s.build!=='object') s.build={weapon:null,skills:[null,null,null],passives:[]};
    if(!Array.isArray(s.build.skills)) s.build.skills=[null,null,null];
    if(!Array.isArray(s.build.passives)) s.build.passives=[];
    s.weapons = Array.from(new Set(s.weapons.filter(id=>getWeapon(id))));
    s.armors = Array.from(new Set(s.armors.filter(id=>getArmor(id))));
    s.skills = Array.from(new Set(s.skills.filter(id=>getSkill(id))));
    s.passives = Array.from(new Set(s.passives.filter(id=>getPassive(id))));
    return s;
  }
  function saveGame() {
    if(state && state.save){
      state.save.build={weapon:state.selectedWeaponId||null, armor:state.selectedArmorId||null, skills:(state.selectedSkillIds||[null,null,null]).slice(0,3), passives:(state.selectedPassiveIds||[]).slice()};
    }
    try { writeAllLocalSaves(); } catch(e) { console.warn('[RaidGame] local save failed:', e); }
    queueCloudSave();
  }

  function makePlayer() {
    return { x: W/2, y: H-120, r:16, hp:100, maxHp:100, shield:0, speed:265, atk:100, magic:100, def:0, crit:8, critDmg:1.7, damageMul:1, skillDamageMul:1, basicDamageMul:1, cooldownMul:1, areaMul:1, projectileSpeedMul:1, lifesteal:0, regen:.18, regen5:0, regen5Tick:0, statusResist:{burn:0,poison:0,freeze:0,paralysis:0,slow:0}, equippedArmor:null, invuln:0, slow:0, roll:0, rollCd:0, rollCdBonus:0, rollVx:0, rollVy:0, basicCd:0, skillCd:[0,0,0], damageTaken:0, aim:0, face:1, anim:0, attackAnim:0, attackAngle:0, tempBuffs:[], statuses:{burn:0,poison:0,freeze:0,paralysis:0,slow:0}, statusTick:0 };
  }
  function makeBoss(b) {
    return { id:b.id, name:b.name, tier:b.tier, theme:b.theme, x:W/2, y:150, r:44+b.tier*6, hp:b.hp, maxHp:b.hp, atk:b.atk, speed:b.speed, color:b.color, sub:b.sub, ai:0, patternCd:1.2, phase:1, vulnerable:0, guard:0, dead:false, hit:0, mechanicText:'패턴을 파훼하면 약화됩니다.', clones:[], realIndex:0, charge:0, vx:0, vy:0, statuses:{burn:0,poison:0,freeze:0,paralysis:0,slow:0,weaken:0,vulnerable:0}, statusTick:0 };
  }

  function hideLegacyDom() { ['auth','characterScreen','characterMenu','hudHelp'].forEach(id=>{const n=document.getElementById(id); if(n) n.style.display='none';}); }
  function createOverlay() {
    const root = document.createElement('div'); root.id = 'raidV4Root';
    root.innerHTML = `
      <style>
        #raidV4Root{position:fixed;inset:0;pointer-events:none;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:#e5e7eb;z-index:999999;user-select:none;-webkit-user-select:none}.v4-panel{pointer-events:auto;position:absolute;background:rgba(5,8,22,.90);border:1px solid rgba(148,163,184,.32);box-shadow:0 20px 70px rgba(0,0,0,.45);border-radius:20px;backdrop-filter:blur(14px)}.v4-menu{left:50%;top:50%;transform:translate(-50%,-50%);width:1120px;max-height:90vh;overflow:auto;padding:22px;scroll-behavior:auto}.v4-left{left:18px;top:18px;width:330px;max-height:calc(100vh - 36px);overflow:auto;padding:16px}.v4-right{right:18px;top:18px;width:360px;max-height:calc(100vh - 36px);overflow:auto;padding:16px}.hidden{display:none!important}.title{margin:0 0 8px;color:#fff;font-size:28px;font-weight:950;letter-spacing:-.05em}.sub{margin:0 0 14px;color:#94a3b8;font-size:13px;line-height:1.5}.btn{position:relative;z-index:5;appearance:none;border:0;border-radius:13px;background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff;font-weight:900;padding:13px 16px;cursor:pointer;touch-action:manipulation;min-height:42px}.btn.secondary{background:#111827;border:1px solid rgba(148,163,184,.28);color:#e5e7eb}.btn.danger{background:linear-gradient(135deg,#ef4444,#f97316)}.btn:disabled{opacity:.45;cursor:not-allowed}.nav{display:flex;gap:8px;margin:10px 0 16px}.tab{position:relative;z-index:5;padding:12px 16px;border-radius:999px;border:1px solid rgba(148,163,184,.25);background:#0f172a;color:#cbd5e1;font-weight:900;cursor:pointer;touch-action:manipulation}.tab.active{background:#2563eb;color:white;border-color:#60a5fa}.boss-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}.boss-card{position:relative;z-index:4;min-height:230px;position:relative;overflow:hidden;border-radius:18px;padding:14px;background:linear-gradient(180deg,rgba(15,23,42,.92),rgba(3,7,18,.92));border:1px solid rgba(148,163,184,.24);cursor:pointer;transition:border-color .12s,box-shadow .12s;touch-action:manipulation}.boss-card:hover{border-color:#93c5fd}.boss-card.active{border-color:#facc15;box-shadow:0 0 0 2px rgba(250,204,21,.15)}.boss-art{height:88px;margin:6px 0 9px;border-radius:16px;background:radial-gradient(circle at 50% 45%,rgba(255,255,255,.17),rgba(255,255,255,.02) 52%,rgba(0,0,0,.25));display:flex;align-items:center;justify-content:center}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.card{position:relative;z-index:4;border:1px solid rgba(148,163,184,.25);border-radius:15px;background:rgba(15,23,42,.72);padding:13px;cursor:pointer;transition:border-color .12s,background .12s;touch-action:manipulation}.card:hover{border-color:#93c5fd}.card.active{border-color:#60a5fa;background:linear-gradient(135deg,rgba(37,99,235,.32),rgba(124,58,237,.24))}.card.locked{opacity:.43}.card h3{margin:0 0 5px;font-size:15px;color:#fff}.card p{margin:0;color:#94a3b8;font-size:12px;line-height:1.45}.stepbar{display:flex;gap:8px;margin:12px 0 16px}.step{flex:1;text-align:center;padding:9px 7px;border-radius:999px;background:#111827;border:1px solid rgba(148,163,184,.22);font-size:12px;font-weight:900;color:#94a3b8;cursor:pointer;appearance:none;touch-action:manipulation}.step.active{background:linear-gradient(135deg,#2563eb,#7c3aed);color:#fff}.chip{display:inline-block;padding:4px 8px;border-radius:999px;background:#1e293b;color:#bfdbfe;font-size:11px;margin:2px}.row{display:flex;gap:10px;align-items:center}.row>*{flex:1}.input{width:100%;box-sizing:border-box;background:#0f172a;color:#e5e7eb;border:1px solid rgba(148,163,184,.32);border-radius:12px;padding:11px;font-weight:800}.record{display:grid;grid-template-columns:36px 1fr 82px;gap:8px;align-items:center;background:#0f172a;border:1px solid rgba(148,163,184,.2);border-radius:12px;padding:8px;margin-bottom:7px}.rank{font-weight:950;color:#facc15;text-align:center}.time{font-weight:950;color:#a7f3d0;text-align:right}.gacha-result{border-radius:18px;border:1px solid rgba(255,255,255,.25);background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.12),rgba(15,23,42,.9));padding:18px;text-align:center;margin-top:14px}.muted{color:#94a3b8;font-size:12px}@media(max-width:920px){.v4-menu{width:calc(100vw - 28px);padding:14px}.boss-grid{grid-template-columns:repeat(2,1fr)}.grid{grid-template-columns:1fr}.v4-left,.v4-right{left:14px;right:14px;width:auto}.v4-right{top:auto;bottom:14px;max-height:38vh}}
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
    canvas.addEventListener('mousemove', updateMouse, {passive:true});
    canvas.addEventListener('mousedown', e=>{updateMouse(e); mouse.down=true; if(state.screen==='raid') basicAttack();});
    canvas.addEventListener('mouseup', ()=>mouse.down=false);
    canvas.addEventListener('contextmenu', e=>e.preventDefault());
    bindResponsiveUiClicks();
  }

  let lastUiActionTime = 0;
  let lastUiActionKey = '';

  function bindResponsiveUiClicks() {
    // V14 HARD FIX:
    // document capture 방식은 일부 배포/브라우저에서 버튼을 가로막았다.
    // 이제 오버레이 루트에서 일반 click만 받는다. 메뉴가 다시 그려져도 위임 처리로 살아 있다.
    const root = document.getElementById('raidV4Root');
    if (root && !root.__raidDungeonRootClickBound) {
      root.__raidDungeonRootClickBound = true;
      root.addEventListener('click', handleUiAction, false);
    }
  }

  function handleUiAction(e) {
    const target = e.target;
    if(!target || !target.closest) return;
    const active = findRaidActionNode(target);
    if(!active) return;
    if(ui.root && !ui.root.contains(active)) return;
    e.preventDefault();
    e.stopPropagation();
    runUiAction(active);
  }

  function findRaidActionNode(target) {
    if(!target || !target.closest) return null;
    return target.closest('[data-authmode],[data-tab],[data-boss],[data-gacha],[data-step],[data-tabgo],[data-select-type],[data-passive],[data-prev-step],[data-next-step],#authSubmit,#goBuild,#goGacha,#backDungeon,#startRaid,#manualSaveBtn,#logoutBtn,#giveup,#pauseMenu,#resultMenu');
  }

  function runUiAction(active) {
    if(!active) return;
    if(active.disabled || active.getAttribute('aria-disabled') === 'true' || active.classList.contains('locked')) return;
    try {
      if(active.matches('[data-authmode]')){ state.authMode = active.dataset.authmode; state.authMessage=''; renderMenu(); return; }
      if(active.matches('#authSubmit')){ handleAuth(state.authMode === 'signup' ? 'signup' : 'login'); return; }
      if(active.matches('[data-tab]')){ state.menuTab = active.dataset.tab; renderMenu(); return; }
      if(active.matches('[data-boss]')){ state.selectedBossId=active.dataset.boss; trimSelectedPassives(); saveGame(); renderMenu(); refreshRankings(state.selectedBossId); return; }
      if(active.matches('#goBuild')){ state.menuTab='build'; state.buildStep='weapon'; renderMenu(); return; }
      if(active.matches('#goGacha')){ state.menuTab='gacha'; renderMenu(); return; }
      if(active.matches('[data-gacha]')){ rollGacha(active.dataset.gacha); return; }
      if(active.matches('[data-step]')){ state.buildStep=active.dataset.step; saveGame(); renderMenu(); return; }
      if(active.matches('[data-tabgo]')){ state.menuTab=active.dataset.tabgo; renderMenu(); return; }
      if(active.matches('#backDungeon')){ state.menuTab='dungeon'; renderMenu(); return; }
      if(active.matches('[data-select-type]')){ selectBuild(active.dataset.selectType, active.dataset.selectId || '', Number(active.dataset.slot || 0)); return; }
      if(active.matches('[data-passive]')){ togglePassive(active.dataset.passive); return; }
      if(active.matches('[data-prev-step]')){ stepMove(-1); return; }
      if(active.matches('[data-next-step]')){ stepMove(1); return; }
      if(active.matches('#startRaid')){ startRaid(); return; }
      if(active.matches('#manualSaveBtn')){ manualSaveProfile(); return; }
      if(active.matches('#logoutBtn')){ logout(); return; }
      if(active.matches('#giveup')){ renderMenu(); return; }
      if(active.matches('#pauseMenu')){ renderMenu(); return; }
      if(active.matches('#resultMenu')){ const id = boss && boss.id; state.menuTab = 'ranking'; renderMenu(); if(id) refreshRankings(id); return; }
    } catch(err) {
      console.error('[Raid UI click error]', err);
      state.cloudStatus = '버튼 처리 오류: ' + (err && err.message ? err.message : '알 수 없음');
      renderMenu();
    }
  }

  function getUiActionKey(node) {
    if(!node) return '';
    const candidates = ['id','data-authmode','data-tab','data-boss','data-gacha','data-step','data-tabgo','data-select-type','data-select-id','data-passive','data-prev-step','data-next-step'];
    if(node.id) return 'id:' + node.id;
    for(const key of candidates) {
      if(key !== 'id' && node.getAttribute && node.getAttribute(key) !== null) {
        return key + ':' + node.getAttribute(key) + ':' + (node.getAttribute('data-slot') || '');
      }
    }
    return node.tagName + ':' + (node.textContent || '').slice(0,40);
  }
  function updateMouse(e) { const r=canvas.getBoundingClientRect(); mouse.x=(e.clientX-r.left)*(W/r.width); mouse.y=(e.clientY-r.top)*(H/r.height); }

  async function initSupabase() {
    try {
      await loadScript(SUPABASE_CDN);
      if(!window.supabase) throw new Error('no sdk');
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
      supabaseReady = true;
      const { data } = await supabase.auth.getSession();
      state.currentUser = data && data.session ? data.session.user : null;
      state.authChecked = true;
      if(state.currentUser) await loadCloudProfile(true);
      supabase.auth.onAuthStateChange(async (_event, session)=>{
        state.currentUser = session ? session.user : null;
        if(state.currentUser) await loadCloudProfile(true);
        else { state.cloudStatus = '로그인이 필요합니다'; renderMenu(); }
      });
      refreshRankings(state.rankingBossId);
      renderMenu();
    } catch(e) {
      supabaseReady = false;
      state.authChecked = true;
      state.authMessage = 'Supabase 연결 실패: 로컬 저장으로만 실행됩니다.';
      refreshRankings(state.rankingBossId);
      renderMenu();
    }
  }
  function loadScript(src){return new Promise((res,rej)=>{if(document.querySelector('script[src="'+src+'"]')) return res(); const s=document.createElement('script'); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s);});}

  async function handleAuth(action) {
    if(!supabaseReady || !supabase) { state.authMessage = 'Supabase 연결이 아직 준비되지 않았습니다.'; renderMenu(); return; }
    const email = (document.getElementById('raidEmail')?.value || '').trim();
    const password = document.getElementById('raidPassword')?.value || '';
    const nickname = (document.getElementById('raidNickname')?.value || '').trim();
    if(!email || !password) { state.authMessage = '이메일과 비밀번호를 입력해주세요.'; renderMenu(); return; }
    if(password.length < 6) { state.authMessage = '비밀번호는 6자 이상이어야 합니다.'; renderMenu(); return; }
    state.authBusy = true; state.authMessage = '처리 중...'; renderMenu();
    try {
      let result;
      if(action === 'signup') {
        result = await supabase.auth.signUp({ email, password, options:{ data:{ player_name:nickname || email.split('@')[0] } } });
        if(result.error) throw result.error;
        if(result.data && result.data.user) state.currentUser = result.data.user;
        state.save.playerName = nickname || email.split('@')[0];
        state.authMessage = result.data && result.data.session ? '회원가입 완료!' : '회원가입 완료. Supabase 설정에 따라 이메일 확인 후 로그인해야 할 수 있습니다.';
      } else {
        result = await supabase.auth.signInWithPassword({ email, password });
        if(result.error) throw result.error;
        state.currentUser = result.data.user;
        state.authMessage = '로그인 완료!';
      }
      if(state.currentUser) await loadCloudProfile(true);
    } catch(e) {
      state.authMessage = e && e.message ? e.message : '로그인 처리 실패';
    } finally {
      state.authBusy = false;
      renderMenu();
    }
  }
  async function logout() {
    // V13: 로그아웃한다고 로컬 저장을 지우지 않는다.
    // 이전 버전은 여기서 SAVE_KEY를 삭제해서, 클라우드 저장 실패 시 뽑은 스킬/장비가 사라졌다.
    try { saveGame(); await saveCloudProfileNow(true); } catch(e) { console.warn('[RaidGame] logout save skipped:', e); }
    if(supabase) await supabase.auth.signOut();
    state.currentUser = null;
    state.cloudStatus = '로그아웃됨 · 로컬 저장 유지';
    renderMenu();
  }
  async function loadCloudProfile(mergeLocal) {
    if(!supabaseReady || !supabase || !state.currentUser) return;
    try {
      state.cloudStatus = '계정 저장 불러오는 중...';
      const { data, error } = await supabase
        .from(PROFILE_TABLE)
        .select('save_data, player_name, updated_at')
        .eq('user_id', state.currentUser.id)
        .maybeSingle();

      if(error) throw error;

      if(data && data.save_data) {
        const cloudSave = normalizeSaveData(data.save_data);
        const localSave = normalizeSaveData(mergeLocal ? state.save : createDefaultSave());
        // 클라우드 저장이 비어 있거나 과거 버전에서 일부 항목이 누락된 경우 로컬값으로 보정한다.
        state.save = mergeSaveData(localSave, cloudSave);
        if(data.player_name && !state.save.playerName) state.save.playerName = data.player_name;
        state.cloudStatus = '계정 저장 불러옴';
      } else {
        state.save = normalizeSaveData(mergeLocal ? state.save : createDefaultSave());
        const created = await saveCloudProfileNow(true);
        state.cloudStatus = created ? '새 계정 저장 생성' : '새 계정 로컬 저장만 사용';
      }
      trimSelectionsToOwned();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
    } catch(e) {
      console.error('[RaidGame] cloud profile load failed:', e);
      const localBackup = safeLoadLocalSave();
      state.save = normalizeSaveData(mergeLocal ? state.save : localBackup);
      trimSelectionsToOwned();
      localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
      state.cloudStatus = '계정 저장 불러오기 실패: ' + getSupabaseErrorText(e);
    }
  }

  function mergeSaveData(localSave, cloudSave) {
    const out = normalizeSaveData(cloudSave || {});
    const local = normalizeSaveData(localSave || {});
    // 클라우드에 아직 없는 새 데이터 구조는 로컬/기본값으로 보존한다.
    out.tickets = {
      weapon: Math.max(Number(local.tickets?.weapon || 0), Number(out.tickets?.weapon || 0)),
      armor: Math.max(Number(local.tickets?.armor || 0), Number(out.tickets?.armor || 0)),
      skill: Math.max(Number(local.tickets?.skill || 0), Number(out.tickets?.skill || 0)),
      passive: Math.max(Number(local.tickets?.passive || 0), Number(out.tickets?.passive || 0))
    };
    out.weapons = unique([...(out.weapons || []), ...(local.weapons || [])]);
    out.armors = unique([...(out.armors || []), ...(local.armors || [])]);
    out.skills = unique([...(out.skills || []), ...(local.skills || [])]);
    out.passives = unique([...(out.passives || []), ...(local.passives || [])]);
    out.records = Array.isArray(out.records) ? out.records : (local.records || []);
    out.build = { ...(local.build || {}), ...(out.build || {}) };
    if(!out.playerName) out.playerName = local.playerName || 'Player';
    return normalizeSaveData(out);
  }

  function safeLoadLocalSave(){
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || localStorage.getItem(SAVE_KEY + '-backup') || 'null') || createDefaultSave(); }
    catch(e) {
      try { return JSON.parse(localStorage.getItem(SAVE_KEY + '-backup') || 'null') || createDefaultSave(); }
      catch(err) { return createDefaultSave(); }
    }
  }

  function unique(arr){
    return Array.from(new Set((arr || []).filter(Boolean)));
  }

  function getSupabaseErrorText(e){
    const msg = (e && (e.message || e.details || e.hint || e.code)) ? String(e.message || e.details || e.hint || e.code) : '원인 알 수 없음';
    if(/does not exist|schema cache|PGRST205|42P01/i.test(msg)) return 'raid_profiles 테이블 없음';
    if(/row-level security|RLS|permission|policy|42501/i.test(msg)) return 'RLS 정책 오류';
    if(/JWT|session|auth|Invalid Refresh Token/i.test(msg)) return '로그인 세션 오류';
    return msg.slice(0, 80);
  }
  function queueCloudSave() {
    if(!state.currentUser || !supabaseReady || !supabase) return;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer = setTimeout(saveCloudProfileNow, 650);
  }
  async function saveCloudProfileNow(silent) {
    if(!state.currentUser || !supabaseReady || !supabase) {
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(state.save)); } catch(e) {}
      if(!silent) state.cloudStatus = '로컬 저장 완료';
      return false;
    }
    try {
      state.save = normalizeSaveData(state.save);
      localStorage.setItem(SAVE_KEY, JSON.stringify(state.save));
      localStorage.setItem(SAVE_KEY + '-backup', JSON.stringify(state.save));
      const payload = {
        user_id: state.currentUser.id,
        player_name: state.save.playerName || 'Player',
        save_data: state.save,
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from(PROFILE_TABLE).upsert(payload, { onConflict:'user_id' });
      if(error) throw error;
      if(!silent) state.cloudStatus = '계정 저장 완료';
      return true;
    } catch(e) {
      console.error('[RaidGame] cloud profile save failed:', e);
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(state.save)); localStorage.setItem(SAVE_KEY + '-backup', JSON.stringify(state.save)); } catch(err) {}
      if(!silent) state.cloudStatus = '계정 저장 실패: ' + getSupabaseErrorText(e);
      return false;
    }
  }
  async function manualSaveProfile() {
    saveGame();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(normalizeSaveData(state.save))); } catch(e) {}
    state.cloudStatus = '수동 저장 중...';
    renderMenu();
    const ok = await saveCloudProfileNow(true);
    if(ok) {
      state.cloudStatus = '수동 저장 완료';
    } else if(state.currentUser) {
      state.cloudStatus = '클라우드 저장 실패 · 로컬 저장 완료';
    } else {
      state.cloudStatus = '로컬 수동 저장 완료';
    }
    renderMenu();
  }

  function trimSelectionsToOwned(){
    if(state.save && state.save.build){
      if(!state.selectedWeaponId && state.save.build.weapon) state.selectedWeaponId = state.save.build.weapon;
      if(!state.selectedArmorId && state.save.build.armor) state.selectedArmorId = state.save.build.armor;
      if((!state.selectedSkillIds || !state.selectedSkillIds.some(Boolean)) && Array.isArray(state.save.build.skills)) state.selectedSkillIds = state.save.build.skills.slice(0,3);
      if((!state.selectedPassiveIds || !state.selectedPassiveIds.length) && Array.isArray(state.save.build.passives)) state.selectedPassiveIds = state.save.build.passives.slice();
    }
    const sw = new Set(state.save.weapons), sa = new Set(state.save.armors || []), ss = new Set(state.save.skills), sp = new Set(state.save.passives);
    if(state.selectedWeaponId && !sw.has(state.selectedWeaponId)) state.selectedWeaponId = null;
    if(state.selectedArmorId && !sa.has(state.selectedArmorId)) state.selectedArmorId = null;
    state.selectedSkillIds = (state.selectedSkillIds || [state.selectedAttackSkillId,state.selectedEvasionSkillId,state.selectedBuffSkillId]).map(id => id && ss.has(id) ? id : null).slice(0,3);
    while(state.selectedSkillIds.length < 3) state.selectedSkillIds.push(null);
    state.selectedAttackSkillId = state.selectedSkillIds[0];
    state.selectedEvasionSkillId = state.selectedSkillIds[1];
    state.selectedBuffSkillId = state.selectedSkillIds[2];
    state.selectedPassiveIds = state.selectedPassiveIds.filter(id=>sp.has(id));
  }

  function renderAuthMenu() {
    const loading = !state.authChecked ? '<p class="sub">Supabase 로그인 상태 확인 중...</p>' : '';
    const modeText = state.authMode === 'login' ? '로그인' : '회원가입';
    const nick = state.authMode === 'signup' ? '<input id="raidNickname" class="input" placeholder="닉네임" autocomplete="nickname" style="margin-bottom:8px">' : '';
    ui.menu.innerHTML = `<h1 class="title">보스 레이드 로그인</h1><p class="sub">계정에 로그인하면 뽑아둔 무기, 스킬, 패시브, 뽑기 티켓이 Supabase에 저장됩니다.<br>다른 컴퓨터에서 접속해도 같은 계정이면 그대로 이어서 플레이할 수 있습니다.</p>${loading}<div class="nav"><button class="tab ${state.authMode==='login'?'active':''}" data-authmode="login">로그인</button><button class="tab ${state.authMode==='signup'?'active':''}" data-authmode="signup">회원가입</button></div><div class="grid"><div class="card" style="cursor:default"><h3>${modeText}</h3><input id="raidEmail" class="input" placeholder="이메일" autocomplete="email" style="margin-bottom:8px"><input id="raidPassword" class="input" type="password" placeholder="비밀번호 6자 이상" autocomplete="current-password" style="margin-bottom:8px">${nick}<button id="authSubmit" class="btn" style="width:100%" ${state.authBusy?'disabled':''}>${modeText}</button><p class="sub" style="margin-top:10px;color:${state.authMessage && state.authMessage.includes('실패') ? '#fb7185' : '#fef08a'}">${escapeHtml(state.authMessage || state.cloudStatus || '')}</p></div><div class="card" style="cursor:default"><h3>처음 지급</h3><p>처음 로그인한 계정은 무기 뽑기 티켓 1장, 방어구 뽑기 티켓 1장, 스킬 뽑기 티켓 3장, 패시브 뽑기 티켓 1장을 받습니다.</p><p class="sub">Supabase에서 이메일 확인을 켜두었다면 회원가입 후 이메일 인증을 해야 로그인됩니다. 학교/개인 프로젝트라면 Auth 설정에서 이메일 확인을 꺼두면 바로 가입됩니다.</p></div></div>`;
  }

  function renderMenu() {
    state.screen='menu'; ui.menu.classList.remove('hidden'); ui.left.classList.add('hidden'); ui.right.classList.add('hidden');
    if(!state.currentUser) { renderAuthMenu(); return; }
    const nav = `<div class="nav">${['dungeon','gacha','build','ranking'].map(t=>`<button class="tab ${state.menuTab===t?'active':''}" data-tab="${t}">${({dungeon:'던전 선택',gacha:'뽑기 상점',build:'출격 준비',ranking:'레이드 랭킹'})[t]}</button>`).join('')}</div>`;
    let body = '';
    if(state.menuTab==='dungeon') body = renderDungeonTab();
    if(state.menuTab==='gacha') body = renderGachaTab();
    if(state.menuTab==='build') body = renderBuildTab();
    if(state.menuTab==='ranking') body = renderRankingTab();
    ui.menu.innerHTML = `<div class="row"><div><h1 class="title">Raid Dungeon</h1><p class="sub">보스를 선택하고, 티켓으로 무기/방어구/스킬/패시브를 뽑아 조합한 뒤 패턴을 파훼해서 클리어하세요.</p></div><div style="text-align:right"><div class="chip">${VERSION}</div><div class="chip">${escapeHtml(state.save.playerName || 'Player')}</div><div class="chip">무기티켓 ${state.save.tickets.weapon}</div><div class="chip">방어구티켓 ${state.save.tickets.armor||0}</div><div class="chip">스킬티켓 ${state.save.tickets.skill}</div><div class="chip">패시브티켓 ${state.save.tickets.passive}</div><div class="chip">${escapeHtml(state.cloudStatus || '계정 저장')}</div><button id="manualSaveBtn" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.save()" class="btn secondary" style="margin-top:8px;padding:8px 12px">수동 저장</button> <button id="logoutBtn" class="btn secondary" style="margin-top:8px;padding:8px 12px">로그아웃</button></div></div>${nav}${body}`;
    bindMenuButtons();
  }

  function renderDungeonTab() {
    return `<p class="sub">아래로 갈수록 난이도가 올라갑니다. 각 보스는 외형과 패턴이 모두 다르며, 후반 보스는 반투명 예고 후 큰 공격과 회전 레이저, 즉사 패턴을 사용합니다.</p><div class="boss-grid">${BOSSES.map(b=>`<div class="boss-card ${state.selectedBossId===b.id?'active':''}" data-boss="${b.id}"><div class="muted">${stars(b.tier)}</div><div class="boss-art">${bossMiniSvg(b)}</div><h3 style="margin:0 0 6px;color:white;font-size:15px">${b.name}</h3><p class="muted" style="line-height:1.4">${b.desc}</p><div style="margin-top:8px">${b.patterns.map(p=>`<span class="chip">${p}</span>`).join('')}</div></div>`).join('')}</div><div class="row" style="margin-top:14px"><button id="goBuild" class="btn" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.step('weapon')">선택한 보스로 출격 준비</button><button id="goGacha" class="btn secondary" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.gachaTab&&window.RaidDungeonUI.gachaTab()">뽑기 상점으로</button></div>`;
  }
  function renderGachaTab() {
    const rates = RARITIES.map(r=>`<span class="chip" style="color:${r.color}">${r.name}</span>`).join('');
    const result = state.gachaResult ? `<div class="gacha-result"><div style="font-size:14px;color:${getRarity(state.gachaResult.rarity).color};font-weight:950">${getRarity(state.gachaResult.rarity).name}</div><div style="font-size:25px;font-weight:950;color:#fff;margin:4px 0">${state.gachaResult.name}</div><p class="sub">${state.gachaResult.desc||'새로운 항목을 획득했습니다.'}</p></div>` : '';
    return `<h2 class="title" style="font-size:22px">뽑기 상점</h2><p class="sub">코인이 아니라 보스 클리어로 얻는 티켓으로 뽑습니다. 스킬 뽑기에는 공격, 버프, 회복, 디버프, 상태이상 해제가 모두 들어 있습니다.<br>${rates}</p><div class="grid"><div class="card"><h3>무기 뽑기 · 티켓 1장</h3><p>보유: ${state.save.tickets.weapon}장<br>검, 활, 채찍, 스태프, 단검, 대검, 마도총 등 무기를 획득합니다.</p><button class="btn" style="margin-top:10px;width:100%" data-gacha="weapon" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.gacha('weapon')">무기 뽑기</button></div><div class="card"><h3>방어구 뽑기 · 티켓 1장</h3><p>보유: ${state.save.tickets.armor||0}장<br>체력 증가, 방어력, 고등급 상태이상 저항/면역 효과가 있는 방어구를 획득합니다.</p><button class="btn" style="margin-top:10px;width:100%" data-gacha="armor" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.gacha('armor')">방어구 뽑기</button></div><div class="card"><h3>스킬 뽑기 · 티켓 1장</h3><p>보유: ${state.save.tickets.skill}장<br>공격, 버프, 회복, 디버프, 상태이상 해제 스킬 중 하나를 획득합니다. 총 100종류입니다.</p><button class="btn" style="margin-top:10px;width:100%" data-gacha="skill" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.gacha('skill')">스킬 뽑기</button></div><div class="card"><h3>패시브 뽑기 · 티켓 1장</h3><p>보유: ${state.save.tickets.passive}장<br>이제 패시브는 밸런스를 위해 보스와 관계없이 1개만 장착할 수 있습니다.</p><button class="btn" style="margin-top:10px;width:100%" data-gacha="passive" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.gacha('passive')">패시브 뽑기</button></div><div class="card"><h3>보유 현황</h3><p>무기 ${state.save.weapons.length}/${WEAPONS.length}<br>방어구 ${state.save.armors.length}/${ARMORS.length}<br>스킬 ${state.save.skills.length}/${SKILLS.length}<br>패시브 ${state.save.passives.length}/${PASSIVES.length}</p></div></div>${result}`;
  }
  function renderBuildTab() {
    const steps = [['weapon','무기'],['armor','방어구'],['skill1','스킬 1'],['skill2','스킬 2'],['skill3','스킬 3'],['passive','패시브'],['ready','출격']];
    let content='';
    if(state.buildStep==='weapon') content = selectionGrid(ownedWeapons(), state.selectedWeaponId, 'weapon');
    if(state.buildStep==='armor') content = selectionGrid(ownedArmors(), state.selectedArmorId, 'armor');
    if(state.buildStep==='skill1') content = skillSlotGrid(0);
    if(state.buildStep==='skill2') content = skillSlotGrid(1);
    if(state.buildStep==='skill3') content = skillSlotGrid(2);
    if(state.buildStep==='passive') content = passiveGrid();
    if(state.buildStep==='ready') content = readyPanel();
    return `<div class="row"><div><h2 class="title" style="font-size:22px">출격 준비 · ${getBoss(state.selectedBossId).name}</h2><p class="sub">현재 보스 난이도 ${stars(getBoss(state.selectedBossId).tier)} · 방어구 1개 장착 가능 · 패시브는 1개만 선택 가능 · 스킬은 종류 제한 없이 아무거나 3개 장착 가능</p></div><button id="backDungeon" class="btn secondary">보스 다시 선택</button></div><div class="stepbar">${steps.map(s=>`<button type="button" class="step ${state.buildStep===s[0]?'active':''}" data-step="${s[0]}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.step('${s[0]}')">${s[1]}</button>`).join('')}</div>${content}`;
  }

  function skillSlotGrid(slot) {
    const items = ownedSkills();
    const selected = state.selectedSkillIds[slot] || null;
    const noneCard = `<div class="card ${!selected?'active':''}" data-select-type="skill" data-slot="${slot}" data-select-id="" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('skill','',${slot})"><h3>스킬 ${slot+1} 비우기</h3><p>스킬을 끼지 않아도 레이드는 시작할 수 있습니다.</p></div>`;
    if(!items.length) return `<div class="grid">${noneCard}<div class="card"><h3>보유한 스킬이 없습니다.</h3><p>스킬 뽑기에서 공격, 버프, 회복, 디버프, 상태이상 해제 스킬을 모두 획득할 수 있습니다.</p><button class="btn" data-tabgo="gacha" style="margin-top:10px">뽑기 상점으로</button></div></div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.prev()">이전</button><button type="button" class="btn" data-next-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.next()">다음</button></div>`;
    return `<p class="sub">스킬 ${slot+1}번 칸입니다. 공격/버프/회복/디버프/상태이상 해제 구분 없이 원하는 스킬을 장착할 수 있습니다. 같은 스킬은 한 번만 장착됩니다.</p><div class="grid">${noneCard}${items.map(it=>`<div class="card ${selected===it.id?'active':''}" data-select-type="skill" data-slot="${slot}" data-select-id="${it.id}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('skill','${it.id}',${slot})"><h3>${it.name} ${rarityLabel(it.rarity)}</h3><p>${it.desc}<br>분류: ${skillCategoryName(it.category)} · 속성: ${it.element}</p></div>`).join('')}</div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.prev()">이전</button><button type="button" class="btn" data-next-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.next()">다음</button></div>`;
  }
  function selectionGrid(items, selected, type) {
    const noneTitle = type === 'weapon' ? '무기 없이 출격' : type === 'armor' ? '방어구 없이 출격' : '이 스킬칸 비우기';
    const noneDesc = type === 'weapon' ? '스킬만 가지고 레이드에 들어갈 수 있습니다. 일반공격은 사용할 수 없습니다.' : type === 'armor' ? '방어구는 생존을 돕지만 필수는 아닙니다.' : '스킬을 끼지 않아도 레이드는 시작할 수 있습니다.';
    const noneCard = `<div class="card ${!selected?'active':''}" data-select-type="${type}" data-select-id="" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('${type}','',0)"><h3>${noneTitle}</h3><p>${noneDesc}</p></div>`;
    if(!items.length) return `<div class="grid">${noneCard}<div class="card"><h3>보유한 항목이 없습니다.</h3><p>뽑기 상점에서 먼저 획득할 수 있습니다. 그래도 다른 장비/스킬이 있으면 출격은 가능합니다.</p><button class="btn" data-tabgo="gacha" style="margin-top:10px">뽑기 상점으로</button></div></div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.prev()">이전</button><button type="button" class="btn" data-next-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.next()">다음</button></div>`;
    return `<div class="grid">${noneCard}${items.map(it=>`<div class="card ${selected===it.id?'active':''}" data-select-type="${type}" data-select-id="${it.id}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('${type}','${it.id}',0)"><h3>${it.name} ${rarityLabel(it.rarity)}</h3><p>${it.desc}<br>${it.category?('분류: '+skillCategoryName(it.category)):(type==='armor'?('효과: 체력 +'+it.hp+' / 방어 +'+it.def):('종류: '+weaponKindName(it.kind)))}</p></div>`).join('')}</div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.prev()">이전</button><button type="button" class="btn" data-next-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.next()">다음</button></div>`;
  }
  function passiveGrid() {
    const items = ownedPassives(); const limit = passiveLimit();
    if(!items.length) return `<div class="card"><h3>보유한 패시브가 없습니다.</h3><p>패시브 뽑기로 획득해야 합니다.</p><button class="btn" data-tabgo="gacha" style="margin-top:10px">뽑기 상점으로</button></div>`;
    return `<p class="sub">${limit}개까지 선택 가능. 현재 ${state.selectedPassiveIds.length}/${limit}</p><div class="grid">${items.map(it=>`<div class="card ${state.selectedPassiveIds.includes(it.id)?'active':''}" data-passive="${it.id}"><h3>${it.name} ${rarityLabel(it.rarity)}</h3><p>${it.desc}</p></div>`).join('')}</div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.prev()">이전</button><button type="button" class="btn" data-next-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.next()">다음</button></div>`;
  }
  function readyPanel() {
    const ok = canStart();
    const b = getBoss(state.selectedBossId);
    const skillNames = (state.selectedSkillIds || []).map((id,i)=>`스킬 ${i+1}: ${getSkill(id)?.name || '없음'}`).join('<br>');
    return `<div class="grid"><div class="card active"><h3>${b.name}</h3><p>${stars(b.tier)}<br>${b.desc}</p><div>${b.patterns.map(p=>`<span class="chip">${p}</span>`).join('')}</div></div><div class="card"><h3>선택한 조합</h3><p>무기: ${getWeapon(state.selectedWeaponId)?.name || '없음'}<br>방어구: ${getArmor(state.selectedArmorId)?.name || '없음'}<br>${skillNames}<br>패시브: ${state.selectedPassiveIds.length}/${passiveLimit()} · 필수 아님</p><p class="sub">무기만 있어도, 스킬만 있어도 출격할 수 있습니다. 단, 무기와 스킬을 모두 비우면 공격 수단이 없어 시작할 수 없습니다.</p></div></div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" id="startRaid" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.start()" class="btn danger" ${ok?'':'disabled'}>레이드 시작</button></div>${ok?'':'<p class="sub">무기 또는 스킬 중 최소 하나는 장착해야 합니다. 패시브는 선택 사항입니다.</p>'}`;
  }
  function renderRankingTab() {
    const rows = state.rankings.length ? state.rankings.map((r,i)=>{
      const skills = Array.isArray(r.skills) ? r.skills : safeJsonArray(r.skills);
      const passives = Array.isArray(r.passives) ? r.passives : safeJsonArray(r.passives);
      const combo = `<div class="muted">무기: ${escapeHtml(r.weapon_name||'무기 없음')}</div><div class="muted">스킬: ${skills.length?skills.map(escapeHtml).join(' / '):'없음'}</div><div class="muted">방어구/패시브: ${passives.length?passives.map(escapeHtml).join(' / '):'없음'}</div><div class="muted">받은 피해: ${Number(r.damage_taken||0)}</div>`;
      return `<div class="record" style="align-items:flex-start"><div class="rank">#${i+1}</div><div style="flex:1"><b>${escapeHtml(r.player_name||'Player')}</b>${combo}</div><div class="time">${formatMs(r.clear_ms)}</div></div>`;
    }).join('') : '<p class="sub">아직 기록이 없습니다.</p>';
    return `<div class="row"><div><h2 class="title" style="font-size:22px">보스별 랭킹</h2><p class="sub">Supabase 온라인 랭킹을 전체 조회하므로 다른 유저의 기록도 함께 보입니다. 같은 닉네임은 최신 클리어 기록 1개만 표시됩니다.</p></div><select id="rankBoss" class="input">${BOSSES.map(b=>`<option value="${b.id}" ${state.rankingBossId===b.id?'selected':''}>${b.name}</option>`).join('')}</select></div><div style="margin-top:12px">${rows}</div>`;
  }
  function safeJsonArray(v){ try{ const x = typeof v === 'string' ? JSON.parse(v) : v; return Array.isArray(x) ? x : []; }catch(e){ return []; } }


  function bindMenuButtons() {
    // V13: 메뉴가 매번 innerHTML로 다시 그려져도 클릭이 살아있도록,
    // document 위임 + 현재 렌더된 요소 직접 onclick을 둘 다 연결한다.
    const selectors = '[data-authmode],[data-tab],[data-boss],[data-gacha],[data-step],[data-tabgo],[data-select-type],[data-passive],[data-prev-step],[data-next-step],#authSubmit,#goBuild,#goGacha,#backDungeon,#startRaid,#manualSaveBtn,#logoutBtn,#resultMenu';
    ui.menu.querySelectorAll(selectors).forEach(el => {
      el.onclick = ev => {
        ev.preventDefault();
        ev.stopPropagation();
        runUiAction(el);
      };
    });
    const rb = ui.menu.querySelector('#rankBoss');
    if (rb) rb.onchange = () => { state.rankingBossId = rb.value; refreshRankings(rb.value); renderMenu(); };
  }
  function selectBuild(type,id,slot){
    id = id || null;
    if(type==='weapon') state.selectedWeaponId = state.selectedWeaponId===id ? null : id;
    if(type==='armor') state.selectedArmorId = state.selectedArmorId===id ? null : id;
    if(type==='skill') {
      state.selectedSkillIds = state.selectedSkillIds || [null,null,null];
      if(id && state.selectedSkillIds.some((v,i)=>v===id && i!==slot)) {
        toast('같은 스킬은 다른 칸에 중복 장착할 수 없습니다.');
        return;
      }
      state.selectedSkillIds[slot] = state.selectedSkillIds[slot]===id ? null : id;
      state.selectedAttackSkillId = state.selectedSkillIds[0];
      state.selectedEvasionSkillId = state.selectedSkillIds[1];
      state.selectedBuffSkillId = state.selectedSkillIds[2];
    }
    saveGame();
    renderMenu();
  }
  function stepMove(dir){ const arr=['weapon','armor','skill1','skill2','skill3','passive','ready']; let i=arr.indexOf(state.buildStep); i=clamp(i+dir,0,arr.length-1); state.buildStep=arr[i]; renderMenu(); }
  function togglePassive(id){ const limit=passiveLimit(); const i=state.selectedPassiveIds.indexOf(id); if(i>=0) state.selectedPassiveIds.splice(i,1); else if(state.selectedPassiveIds.length<limit) state.selectedPassiveIds.push(id); else toast('이 보스는 패시브 '+limit+'개까지만 선택할 수 있습니다.'); saveGame(); renderMenu(); }
  function trimSelectedPassives(){ const owned = new Set(state.save.passives); state.selectedPassiveIds = state.selectedPassiveIds.filter(id=>owned.has(id)).slice(0, passiveLimit()); }
  function canStart(){ const hasWeapon=!!state.selectedWeaponId; const hasSkill=(state.selectedSkillIds||[]).some(Boolean); return (hasWeapon || hasSkill) && state.selectedPassiveIds.length <= passiveLimit(); }

  function rollGacha(kind) {
    if(!state.save.tickets || typeof state.save.tickets !== 'object') state.save.tickets = {...INITIAL_TICKETS};
    if((state.save.tickets[kind] || 0) <= 0){ toast(TICKET_LABEL[kind] + '이 부족합니다. 보스를 클리어하면 난이도에 따라 티켓을 얻습니다.'); return; }
    state.save.tickets[kind] -= 1;
    const rarity=pickRarity();
    const pool = kind==='weapon' ? WEAPONS.filter(x=>x.rarity===rarity) : kind==='armor' ? ARMORS.filter(x=>x.rarity===rarity) : kind==='skill' ? SKILLS.filter(x=>x.rarity===rarity) : PASSIVES.filter(x=>x.rarity===rarity);
    const list=pool.length?pool:(kind==='weapon'?WEAPONS:kind==='armor'?ARMORS:kind==='skill'?SKILLS:PASSIVES);
    const item=list[Math.floor(Math.random()*list.length)];
    const arr = kind==='weapon'?state.save.weapons:kind==='armor'?state.save.armors:kind==='skill'?state.save.skills:state.save.passives;
    if(!arr.includes(item.id)) arr.push(item.id);
    state.gachaResult=item;
    gachaCelebration(item);
    saveGame(); renderMenu();
  }

  function gachaCelebration(item){
    const r = getRarity(item.rarity);
    const count = {normal:30, rare:48, super:66, epic:92, legendary:130, ultimate:180}[item.rarity] || 40;
    const speed = {normal:240, rare:310, super:380, epic:470, legendary:590, ultimate:760}[item.rarity] || 300;
    burst(W/2, H/2, r.color, count, speed);
    if(item.rarity==='legendary' || item.rarity==='ultimate'){
      state.flash = Math.max(state.flash, item.rarity==='ultimate' ? 1.8 : 1.1);
      for(let i=0;i<14;i++) state.hazards.push({kind:'playerStrike',x:W/2+Math.cos(i/14*Math.PI*2)*150,y:H/2+Math.sin(i/14*Math.PI*2)*90,r:28,warn:.02+i*.03,life:.18,damage:0,color:r.color});
    }
  }

  function pickRarity() {
    const total = RARITIES.reduce((sum,r)=>sum+r.weight,0);
    let n = Math.random()*total;
    for(const r of RARITIES){ n-=r.weight; if(n<=0) return r.id; }
    return RARITIES[0].id;
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
    state.raid={ start:performance.now(), elapsed:0, clear:false, failed:false, weapon:getWeapon(state.selectedWeaponId), armor:getArmor(state.selectedArmorId), skills:(state.selectedSkillIds||[]).slice(0,3).map(getSkill), passives:state.selectedPassiveIds.map(getPassive).filter(Boolean) };
    renderRaidPanel(); toast(boss.name+' 레이드 시작!');
  }
  function applyBuild(){ const w=getWeapon(state.selectedWeaponId); const a=getArmor(state.selectedArmorId); if(w){player.atk*=w.atk; player.crit+=w.crit||0;} if(a){ player.equippedArmor=a; player.maxHp+=a.hp; player.hp=player.maxHp; player.def+=a.def; Object.keys(a.resist||{}).forEach(k=>player.statusResist[k]=Math.max(player.statusResist[k]||0,a.resist[k]||0)); } state.selectedPassiveIds.map(getPassive).filter(Boolean).forEach(p=>p.apply(player)); player.maxHp=Math.floor(player.maxHp); player.speed=Math.floor(player.speed); }
  function renderRaidPanel(){
    const weaponName = state.raid.weapon ? state.raid.weapon.name : '없음';
    const armorName = state.raid.armor ? state.raid.armor.name : '없음';
    const skillChips = state.raid.skills.map((s,i)=>`<span class="chip">${i+1}. ${s ? s.name : '비어 있음'}</span>`).join('');
    const passiveChips = state.raid.passives.length ? state.raid.passives.map(p=>`<span class="chip">${p.name}</span>`).join('') : '<span class="chip">패시브 없음</span>';
    ui.left.innerHTML=`<h1 class="title" style="font-size:21px">현재 빌드</h1><p class="sub">보스: <b>${boss.name}</b><br>무기: <b>${weaponName}</b><br>방어구: <b>${armorName}</b></p>${skillChips}<div style="height:8px"></div>${passiveChips}<p class="sub" style="margin-top:12px">J/좌클릭 일반공격 · 1/2/3 스킬 · Space 구르기(2.5초) · P 일시정지<br>무기가 없으면 일반공격은 비활성화되고, 비어 있는 스킬칸은 사용할 수 없습니다.<br>공격과 스킬은 마우스/바라보는 방향으로 나갑니다.</p><button id="giveup" class="btn secondary" style="width:100%">포기하고 메뉴로</button>`;
    ui.left.querySelector('#giveup').onclick=renderMenu;
  }
  function togglePause(){ if(state.screen==='raid'){state.screen='paused'; ui.right.classList.remove('hidden'); ui.right.innerHTML='<h1 class="title">일시정지</h1><p class="sub">P 또는 ESC로 계속합니다.</p><button id="pauseMenu" class="btn secondary">메뉴로</button>'; ui.right.querySelector('#pauseMenu').onclick=renderMenu;} else if(state.screen==='paused'){state.screen='raid'; ui.right.classList.add('hidden'); state.last=performance.now();} }

  function update(dt){
    dt = Math.min(dt || .016, .026);
    state.time+=dt;
    state.shake=Math.max(0,state.shake-dt*18);
    state.flash=Math.max(0,state.flash-dt*4);
    state.messageTime=Math.max(0,state.messageTime-dt);
    updateParticles(dt);
    updateTexts(dt);
    capCollections();
    if(state.screen!=='raid'||!state.raid) return;
    state.raid.elapsed+=dt;
    updatePlayer(dt);
    updateBuffs(dt);
    updateStatusEffects(dt);
    updateBoss(dt);
    updateProjectiles(dt);
    updateHazards(dt);
    updateZones(dt);
    updateMechanics(dt);
    capCollections();
    checkEnd();
  }

  function capCollections(){
    if(state.particles.length > MAX_PARTICLES) state.particles.splice(0, state.particles.length - MAX_PARTICLES);
    if(state.texts.length > MAX_TEXTS) state.texts.splice(0, state.texts.length - MAX_TEXTS);
    if(state.projectiles.length > MAX_PROJECTILES) state.projectiles.splice(0, state.projectiles.length - MAX_PROJECTILES);
    if(state.hazards.length > MAX_HAZARDS) state.hazards.splice(0, state.hazards.length - MAX_HAZARDS);
    if(state.zones.length > MAX_ZONES) state.zones.splice(0, state.zones.length - MAX_ZONES);
    if(state.mechanics.length > MAX_MECHANICS) state.mechanics.splice(0, state.mechanics.length - MAX_MECHANICS);
  }
  function updateStatusEffects(dt){
    const pst = player.statuses || (player.statuses={burn:0,poison:0,freeze:0,paralysis:0,slow:0});
    Object.keys(pst).forEach(k=>pst[k]=Math.max(0,(pst[k]||0)-dt));
    player.statusTick=(player.statusTick||0)-dt;
    if(player.statusTick<=0){ player.statusTick=.5; if(pst.burn>0) hurtPlayer(3,'#fb7185',true); if(pst.poison>0) hurtPlayer(2,'#bef264',true); }
    if(pst.slow>0) player.slow=Math.max(player.slow,.2);
    if(pst.freeze>0 || pst.paralysis>0) player.slow=Math.max(player.slow,.2);
    const bst = boss && (boss.statuses || (boss.statuses={burn:0,poison:0,freeze:0,paralysis:0,slow:0,weaken:0,vulnerable:0}));
    if(bst){ Object.keys(bst).forEach(k=>bst[k]=Math.max(0,(bst[k]||0)-dt)); boss.statusTick=(boss.statusTick||0)-dt; if(boss.statusTick<=0){ boss.statusTick=.5; if(bst.burn>0) damageBoss(85,'#fb7185',false); if(bst.poison>0) damageBoss(65,'#bef264',false); } }
  }

  function updatePlayer(dt){
    let dx=0,dy=0;
    if(keys.has('w')||keys.has('arrowup'))dy--;
    if(keys.has('s')||keys.has('arrowdown'))dy++;
    if(keys.has('a')||keys.has('arrowleft'))dx--;
    if(keys.has('d')||keys.has('arrowright'))dx++;
    const len=Math.hypot(dx,dy)||1;
    if(dx||dy){ player.aim=Math.atan2(dy,dx); if(dx<0) player.face=-1; if(dx>0) player.face=1; }
    else if(mouse.down){ player.aim=Math.atan2(mouse.y-player.y, mouse.x-player.x); player.face=Math.cos(player.aim)>=0?1:-1; }
    const disabled=(player.statuses&&((player.statuses.freeze||0)>0||(player.statuses.paralysis||0)>0));
    if(disabled){ dx=0; dy=0; len=1; }
    const statusSlow = player.statuses && (player.statuses.slow||0)>0;
    const moveSpeed=player.speed*((player.slow>0||statusSlow)?.55:1);
    player.x+=dx/len*moveSpeed*dt;
    player.y+=dy/len*moveSpeed*dt;
    if(player.roll>0){ player.x += player.rollVx*dt; player.y += player.rollVy*dt; }
    player.x=clamp(player.x,42,W-42); player.y=clamp(player.y,90,H-42);
    player.invuln=Math.max(0,player.invuln-dt); player.slow=Math.max(0,player.slow-dt); player.roll=Math.max(0,player.roll-dt); player.rollCd=Math.max(0,player.rollCd-dt); player.basicCd=Math.max(0,player.basicCd-dt); player.attackAnim=Math.max(0,(player.attackAnim||0)-dt); player.skillCd=player.skillCd.map(v=>Math.max(0,v-dt)); player.anim+=dt; player.hp=Math.min(player.maxHp,player.hp+player.regen*dt); if(player.regen5>0){ player.regen5Tick=(player.regen5Tick||0)+dt; if(player.regen5Tick>=5){ player.regen5Tick-=5; player.hp=Math.min(player.maxHp,player.hp+player.regen5); healText('5초 회복 +'+Math.floor(player.regen5),player.x,player.y-44); } }
    if(keys.has(' ')&&player.rollCd<=0){
      let rx=dx, ry=dy;
      if(!rx&&!ry){ rx=Math.cos(player.aim||0); ry=Math.sin(player.aim||0); }
      const rl=Math.hypot(rx,ry)||1; rx/=rl; ry/=rl;
      player.roll=.22; player.rollCd=Math.max(.8,2.5-(player.rollCdBonus||0)); player.invuln=Math.max(player.invuln,.30); player.rollVx=rx*900; player.rollVy=ry*900; player.aim=Math.atan2(ry,rx); if(rx<0)player.face=-1; if(rx>0)player.face=1;
      for(let i=0;i<10;i++) state.particles.push({x:player.x-rx*i*7,y:player.y-ry*i*7,vx:-rx*rand(60,180)+rand(-30,30),vy:-ry*rand(60,180)+rand(-30,30),r:4+i*.25,life:.18+i*.025,color:'#93c5fd'});
      burst(player.x,player.y,'#93c5fd',28,290); floatText('ROLL',player.x,player.y-26,'#93c5fd');
    }
  }
  function updateBuffs(dt){ if(!player.tempBuffs) return; for(let i=player.tempBuffs.length-1;i>=0;i--){const b=player.tempBuffs[i]; b.life-=dt; if(b.life<=0){ if(b.damageMul) player.damageMul/=b.damageMul; if(b.skillDamageMul) player.skillDamageMul/=b.skillDamageMul; if(b.speedMul) player.speed/=b.speedMul; if(b.cooldownMul) player.cooldownMul/=b.cooldownMul; if(b.critAdd) player.crit-=b.critAdd; if(b.critDmgAdd) player.critDmg-=b.critDmgAdd; if(b.lifestealAdd) player.lifesteal-=b.lifestealAdd; if(b.regenAdd) player.regen-=b.regenAdd; player.tempBuffs.splice(i,1); } } }

  function basicAttack(){
    if(!state.raid||player.basicCd>0) return;
    const w=state.raid.weapon;
    if(!w){ toast('장착한 무기가 없어 일반공격을 사용할 수 없습니다.'); player.basicCd=.6; return; }
    player.basicCd=w.speed;
    const angle=aimAngle();
    player.attackAnim=.18+Math.min(.18,w.speed*.25); player.attackAngle=angle; if(Math.cos(angle)<0)player.face=-1; if(Math.cos(angle)>0)player.face=1;
    const dmg=player.atk*player.basicDamageMul*w.atk;
    const ranged = w.kind.includes('staff') || w.kind.includes('bow') || ['gunstaff','scythe','chakram','grimoire'].includes(w.kind);
    if(ranged){
      const count=w.kind==='grimoire'?3:1;
      for(let i=0;i<count;i++){
        const a=angle+(i-(count-1)/2)*.12;
        const isBow = w.kind.includes('bow');
        spawnProjectile({owner:'player',x:player.x+Math.cos(a)*22,y:player.y+Math.sin(a)*22,vx:Math.cos(a)*(isBow?930:670),vy:Math.sin(a)*(isBow?930:670),r:w.kind==='gunstaff'?8:5,life:w.kind==='chakram'?1.3:.9,pierce:isBow?2:w.kind==='scythe'?4:0,color:w.color,damage:dmg,splash:w.kind==='gunstaff'?66:0,returning:w.kind==='chakram',homing:w.kind==='grimoire'});
      }
    } else if(w.kind==='whip'){
      damageBossCone(w.range,Math.PI*.62,angle,dmg,w.color); arcEffect(player.x,player.y,angle,w.range,w.color,Math.PI*.62);
    } else if(w.kind==='dagger'){
      for(let i=0;i<3;i++) setTimeout(()=>{damageBossRange(w.range,dmg*.48,w.color); stabEffect(player.x,player.y,angle,w.range,w.color);},i*45);
    } else if(w.kind==='greatsword'){
      damageBossCone(w.range,Math.PI*.42,angle,dmg*1.25,w.color); slashEffect(player.x,player.y,angle,w.range,w.color,16);
    } else if(w.kind==='pole'){
      damageBossLine(w.range,26,angle,dmg,w.color); thrustEffect(player.x,player.y,angle,w.range,w.color);
    } else {
      damageBossCone(w.range,Math.PI*.38,angle,dmg,w.color); slashEffect(player.x,player.y,angle,w.range,w.color,8);
    }
  }
  function aimAngle(){ if(mouse.down && Math.hypot(mouse.x-player.x,mouse.y-player.y)>8) return Math.atan2(mouse.y-player.y,mouse.x-player.x); return player.aim || (player.face>=0 ? 0 : Math.PI); }

  function useSkill(i){ if(!state.raid) return; const s=state.raid.skills[i]; if(!s||player.skillCd[i]>0) return; player.skillCd[i]=s.cooldown*player.cooldownMul; const power=(player.atk+player.magic)*.5*s.power*player.skillDamageMul; const angle=aimAngle(); const r=s.radius*player.areaMul; player.attackAnim=.22; player.attackAngle=angle; if(Math.cos(angle)<0)player.face=-1; if(Math.cos(angle)>0)player.face=1; if(s.category==='attack'){ castAttackSkill(s,power,angle,r); } else if(s.category==='buff'){ castBuffSkill(s,power); } else if(s.category==='heal'){ castHealSkill(s,power,r); } else if(s.category==='debuff'){ castDebuffSkill(s,power,angle,r); } else if(s.category==='cleanse'){ castCleanseSkill(s,power,r); } else { castBuffSkill(s,power); } }
  function castAttackSkill(s,power,angle,r){
    const rare = getRarity(s.rarity);
    const flashMul = {normal:1, rare:1.2, super:1.45, epic:1.9, legendary:2.45, ultimate:3.2}[s.rarity] || 1;
    fancySkillEffect(s, angle, r, flashMul);
    if(s.type==='burst'){
      const tx = mouse.down ? mouse.x : player.x + Math.cos(angle)*Math.min(420,r*3.5);
      const ty = mouse.down ? mouse.y : player.y + Math.sin(angle)*Math.min(420,r*3.5);
      state.zones.push({x:tx,y:ty,r:r*(.95+flashMul*.08),damage:power*1.7,life:.24,color:s.color,once:true,element:s.element});
      burst(tx,ty,s.color,Math.floor(42*flashMul),360*flashMul);
    } else if(s.type==='line'){
      const beamR = 8 + flashMul*4;
      spawnProjectile({owner:'player',x:player.x,y:player.y,vx:Math.cos(angle)*(900+flashMul*80),vy:Math.sin(angle)*(900+flashMul*80),r:beamR,life:1.15,pierce:99,color:s.color,damage:power*.86,type:'skill'});
      beamEffect(player.x,player.y,angle,s.color);
      for(let i=0;i<Math.floor(10*flashMul);i++) state.particles.push({x:player.x+Math.cos(angle)*i*34,y:player.y+Math.sin(angle)*i*34,vx:rand(-25,25),vy:rand(-25,25),r:3+flashMul,life:.25,color:s.color});
    } else if(s.type==='chain'){
      for(let k=0;k<6+Math.floor(flashMul*2);k++) state.hazards.push({kind:'playerStrike',x:boss.x+rand(-150,150),y:boss.y+rand(-105,140),r:30+flashMul*5,warn:.13+k*.045,life:.18,damage:power*.62,color:s.color});
    } else if(s.type==='rain'){
      for(let k=0;k<9+Math.floor(flashMul*4);k++) state.hazards.push({kind:'playerStrike',x:boss.x+rand(-r*1.1,r*1.1),y:boss.y+rand(-r*1.0,r*1.2),r:25+flashMul*4,warn:.14+k*.055,life:.18,damage:power*.46,color:s.color});
    } else if(s.type==='zone'){
      state.zones.push({x:boss.x,y:boss.y,r:r*(.9+flashMul*.08),damage:power*.25,life:s.duration+.4*flashMul,tick:0,color:s.color,dot:true});
      burst(boss.x,boss.y,s.color,Math.floor(26*flashMul),230*flashMul);
    } else if(s.type==='orb'){
      for(let k=0;k<5+Math.floor(flashMul);k++) spawnProjectile({owner:'player',x:player.x,y:player.y,vx:Math.cos(angle+(k-2)*.16)*650,vy:Math.sin(angle+(k-2)*.16)*650,r:7+flashMul,life:1.2,pierce:1,color:s.color,damage:power*.38,homing:true});
    } else {
      damageBoss(power*2.05,s.color,true); burst(boss.x,boss.y,s.color,Math.floor(42*flashMul),330*flashMul); state.shake=Math.max(state.shake,5+flashMul*2);
    }
    if(s.rarity==='legendary'||s.rarity==='ultimate') state.flash=Math.max(state.flash, s.rarity==='ultimate'?.8:.42);
  }

  function rarityFxMul(rarity){ return {normal:1, rare:1.35, super:1.75, epic:2.35, legendary:3.15, ultimate:4.15}[rarity] || 1; }

  function fancySkillEffect(s, angle, r, mul){
    const c=s.color;
    const power = Math.max(mul, rarityFxMul(s.rarity));
    const frontX = player.x + Math.cos(angle) * 42;
    const frontY = player.y + Math.sin(angle) * 42;
    const targetX = boss ? boss.x : frontX + Math.cos(angle) * 240;
    const targetY = boss ? boss.y : frontY + Math.sin(angle) * 240;

    // 시전자의 손끝에서 뻗어나가는 큰 에너지 궤적
    const lines = Math.floor(12 * power);
    for(let i=0;i<lines;i++){
      const a=angle+(i-(lines-1)/2)*(0.08+0.015*power);
      const sp=rand(260,620)*power;
      state.particles.push({kind:'line',x:frontX,y:frontY,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,r:rand(8,18)*power*.35,life:rand(.22,.55),color:c,angle:a,len:rand(18,44)*power});
      state.particles.push({kind:'star',x:frontX+Math.cos(a)*rand(20,80),y:frontY+Math.sin(a)*rand(20,80),vx:Math.cos(a)*sp*.35,vy:Math.sin(a)*sp*.35,r:rand(3,7)*power*.45,life:rand(.25,.65),color:c});
    }

    // 등급이 높을수록 화면 전체에서 바로 눈에 보이는 링/폭발 효과
    state.particles.push({kind:'ring',x:frontX,y:frontY,vx:0,vy:0,r:34*power,life:.38+power*.05,color:c,line:2+power});
    state.particles.push({kind:'ring',x:targetX,y:targetY,vx:0,vy:0,r:48*power,life:.48+power*.06,color:c,line:3+power});
    burst(targetX,targetY,c,Math.floor(28*power),270*power);
    if(power>=2){
      state.particles.push({kind:'ring',x:targetX,y:targetY,vx:0,vy:0,r:88*power,life:.55,color:'#ffffff',line:1.5+power*.45});
      state.shake=Math.max(state.shake,3+power*1.8);
    }
    if(power>=3){
      state.flash=Math.max(state.flash,.22+Math.min(.75,power*.12));
      for(let i=0;i<Math.floor(14*power);i++){
        const a=Math.random()*Math.PI*2;
        const rr=rand(45,160)*power*.35;
        state.particles.push({kind:'star',x:targetX+Math.cos(a)*rr,y:targetY+Math.sin(a)*rr,vx:Math.cos(a)*rand(120,360),vy:Math.sin(a)*rand(120,360),r:rand(4,10)*power*.33,life:rand(.35,.9),color:i%3===0?'#ffffff':c});
      }
    }

    // 속성별로 이름에 맞는 추가 연출
    if(s.element==='lightning'||s.element==='storm'){
      for(let i=0;i<Math.floor(12*power);i++){
        const x=targetX+rand(-r,r), y=targetY+rand(-r,r);
        state.particles.push({kind:'line',x,y:y-rand(80,180),vx:0,vy:rand(280,520),r:2+power,life:.24,color:'#fde047',angle:Math.PI/2,len:rand(55,120)});
        state.particles.push({kind:'ring',x,y,vx:0,vy:0,r:18+power*12,life:.28,color:'#fef08a',line:2});
      }
    }
    if(s.element==='fire'||s.element==='solar'){
      for(let i=0;i<Math.floor(18*power);i++) state.particles.push({kind:'star',x:targetX+rand(-r*.5,r*.5),y:targetY+rand(-r*.5,r*.5),vx:rand(-160,160),vy:rand(-260,60),r:rand(4,11)*power*.28,life:rand(.35,.85),color:i%2?'#fb923c':c});
    }
    if(s.element==='ice'){
      for(let i=0;i<Math.floor(12*power);i++) state.hazards.push({kind:'playerStrike',x:targetX+rand(-r,r),y:targetY+rand(-r,r),r:18+power*5,warn:.05+i*.018,life:.12,damage:0,color:c});
      for(let i=0;i<Math.floor(10*power);i++) state.particles.push({kind:'star',x:targetX+rand(-r,r),y:targetY+rand(-r,r),vx:rand(-70,70),vy:rand(-70,70),r:5+power,life:.65,color:'#e0f2fe'});
    }
    if(s.element==='void'||s.element==='gravity'||s.element==='chaos'){
      state.mechanics.push({kind:'gravity',x:targetX,y:targetY,r:r*1.35,power:0,life:.55,color:c});
      for(let i=0;i<Math.floor(4*power);i++) state.particles.push({kind:'ring',x:targetX,y:targetY,vx:0,vy:0,r:(30+i*24)*power*.45,life:.45+i*.04,color:i%2?'#ffffff':c,line:1.5+power*.25});
    }
  }

  function castEvasionSkill(s,power,angle,r){ if(s.type==='dash'){ player.invuln=.48; player.x=clamp(player.x+Math.cos(angle)*185,42,W-42); player.y=clamp(player.y+Math.sin(angle)*185,90,H-42); damageBossRange(130,power*1.1,s.color); burst(player.x,player.y,s.color,36,260); } else if(s.type==='heal'){ const heal=Math.floor(160+player.maxHp*.13+power*.28); player.hp=Math.min(player.maxHp,player.hp+heal); player.invuln=.28; healText('+'+heal,player.x,player.y-30); burst(player.x,player.y,s.color,30,220); } else { player.shield += Math.floor(160+power*.42); player.invuln=Math.max(player.invuln,.25); state.zones.push({x:player.x,y:player.y,r:r*.72,damage:power*.55,life:.25,color:s.color,once:true}); burst(player.x,player.y,s.color,32,230); } }
  function castBuffSkill(s,power){ const d=s.duration||6; const b={life:d,name:s.name,color:s.color}; if(s.type==='buff_damage'){b.damageMul=1.24; player.damageMul*=b.damageMul;} if(s.type==='buff_skill'){b.skillDamageMul=1.30; player.skillDamageMul*=b.skillDamageMul;} if(s.type==='buff_crit'){b.critAdd=18;b.critDmgAdd=.28;player.crit+=b.critAdd;player.critDmg+=b.critDmgAdd;} if(s.type==='buff_speed'){b.speedMul=1.22;b.cooldownMul=.88;player.speed*=b.speedMul;player.cooldownMul*=b.cooldownMul;} if(s.type==='buff_life'){b.lifestealAdd=.035;b.damageMul=1.10;player.lifesteal+=b.lifestealAdd;player.damageMul*=b.damageMul;} if(s.type==='buff_cool'){b.cooldownMul=.80;player.cooldownMul*=b.cooldownMul;} player.tempBuffs.push(b); burst(player.x,player.y,s.color,34,240); floatText(s.name,player.x,player.y-42,s.color); }
  function castHealSkill(s,power,r){
    const fx = rarityFxMul(s.rarity);
    fancySupportEffect(s, player.x, player.y, r, fx);
    let heal = Math.floor(16 + power * .13 + player.maxHp * (.10 + fx * .025));
    if(s.type==='heal_big') heal = Math.floor(heal * 1.65);
    if(s.type==='heal_full') heal = Math.floor(player.maxHp * .72);
    if(s.type==='heal_regen') { const b={life:6+fx,name:s.name,color:s.color,regenAdd:3+fx*1.8}; player.regen += b.regenAdd; player.tempBuffs.push(b); heal = Math.floor(heal * .72); }
    if(s.type==='heal_zone') { state.zones.push({x:player.x,y:player.y,r:95+fx*28,damage:-Math.max(5,Math.floor(heal*.28)),life:4.2+fx*.35,tick:0,color:s.color,heal:true}); heal = Math.floor(heal * .55); }
    player.hp = Math.min(player.maxHp, player.hp + heal); player.invuln = Math.max(player.invuln, .18 + fx*.035); healText('+'+heal, player.x, player.y-34); floatText(s.name,player.x,player.y-58,s.color);
  }
  function castDebuffSkill(s,power,angle,r){
    const fx=rarityFxMul(s.rarity); fancyDebuffEffect(s, boss.x, boss.y, r, fx); const d=s.duration || 5; if(!boss.statuses) boss.statuses={burn:0,poison:0,freeze:0,paralysis:0,slow:0,weaken:0,vulnerable:0};
    if(s.type==='debuff_burn'){ boss.statuses.burn=Math.max(boss.statuses.burn,d+fx*.45); damageBoss(power*.9,s.color,true); }
    else if(s.type==='debuff_poison'){ boss.statuses.poison=Math.max(boss.statuses.poison,d+fx*.55); damageBoss(power*.55,s.color,false); }
    else if(s.type==='debuff_freeze'){ boss.statuses.freeze=Math.max(boss.statuses.freeze,Math.min(3.2,d*.42+fx*.22)); boss.vulnerable=Math.max(boss.vulnerable,.8+fx*.18); }
    else if(s.type==='debuff_paralyze'){ boss.statuses.paralysis=Math.max(boss.statuses.paralysis,Math.min(2.8,d*.38+fx*.20)); boss.patternCd+=.6+fx*.12; }
    else if(s.type==='debuff_slow'){ boss.statuses.slow=Math.max(boss.statuses.slow,d+fx*.65); }
    else if(s.type==='debuff_weaken'){ boss.statuses.weaken=Math.max(boss.statuses.weaken,d+fx*.45); }
    else if(s.type==='debuff_vulnerable'){ boss.statuses.vulnerable=Math.max(boss.statuses.vulnerable,d+fx*.35); boss.vulnerable=Math.max(boss.vulnerable,1.0+fx*.22); }
    floatText(s.name,boss.x,boss.y-boss.r-44,s.color,18); burst(boss.x,boss.y,s.color,Math.floor(36*fx),260*fx);
  }
  function castCleanseSkill(s,power,r){
    const fx=rarityFxMul(s.rarity); let removed=0; const st=player.statuses || {}; const clearAll=s.type==='cleanse_all'; const map={cleanse_freeze:['freeze','slow'],cleanse_paralysis:['paralysis','slow'],cleanse_poison:['poison'],cleanse_burn:['burn']}; const list=clearAll?['burn','poison','freeze','paralysis','slow']:(map[s.type]||['burn','poison','freeze','paralysis','slow']);
    list.forEach(k=>{ if((st[k]||0)>0) removed++; st[k]=0; }); player.slow=0; const shield=Math.floor(10+power*.11+fx*10); player.shield += shield; player.hp=Math.min(player.maxHp, player.hp + Math.floor(6+fx*4)); player.invuln=Math.max(player.invuln,.28+fx*.045); fancySupportEffect(s, player.x, player.y, r, fx); healText(removed?('정화 '+removed):'정화 보호막', player.x, player.y-36); floatText(s.name,player.x,player.y-60,s.color,18);
  }
  function fancySupportEffect(s,x,y,r,fx){ const c=s.color; state.particles.push({kind:'ring',x,y,vx:0,vy:0,r:45*fx,life:.55,color:c,line:3+fx}); state.particles.push({kind:'ring',x,y,vx:0,vy:0,r:72*fx,life:.72,color:'#ffffff',line:1.4+fx*.25}); for(let i=0;i<Math.floor(20*fx);i++){ const a=Math.random()*Math.PI*2, rr=rand(15,75)*fx*.55; state.particles.push({kind:'star',x:x+Math.cos(a)*rr,y:y+Math.sin(a)*rr,vx:Math.cos(a)*rand(20,160),vy:Math.sin(a)*rand(20,160)-40,r:rand(3,8)*fx*.35,life:rand(.4,1.0),color:i%4===0?'#ffffff':c}); } burst(x,y,c,Math.floor(24*fx),190*fx); if(fx>=3) state.flash=Math.max(state.flash,.22); }
  function fancyDebuffEffect(s,x,y,r,fx){ const c=s.color; state.particles.push({kind:'ring',x,y,vx:0,vy:0,r:55*fx,life:.58,color:c,line:3+fx}); for(let i=0;i<Math.floor(18*fx);i++){ const a=Math.random()*Math.PI*2; state.particles.push({kind:'line',x:x+Math.cos(a)*rand(18,90),y:y+Math.sin(a)*rand(18,90),vx:-Math.cos(a)*rand(60,250),vy:-Math.sin(a)*rand(60,250),r:rand(5,12)*fx*.28,life:rand(.25,.75),color:c,angle:a+Math.PI,len:rand(24,70)*fx*.42}); } if(s.type.includes('poison')) state.zones.push({x,y,r:70+fx*24,damage:0,life:.55,color:c,dot:true}); if(s.type.includes('freeze')) for(let i=0;i<12*fx;i++) state.particles.push({kind:'star',x:x+rand(-r,r),y:y+rand(-r,r),vx:rand(-50,50),vy:rand(-80,50),r:rand(4,9),life:rand(.4,.9),color:'#bae6fd'}); if(s.type.includes('paralyze')) for(let i=0;i<8*fx;i++) state.particles.push({kind:'line',x:x+rand(-r,r),y:y-rand(50,140),vx:0,vy:rand(220,520),r:3+fx,life:.22,color:'#fde047',angle:Math.PI/2,len:rand(50,120)}); }


  function updateBoss(dt){
    if(boss.dead) return;
    const frozen = boss.statuses && ((boss.statuses.freeze||0)>0 || (boss.statuses.paralysis||0)>0);
    boss.ai += dt;
    boss.hit=Math.max(0,boss.hit-dt);
    boss.vulnerable=Math.max(0,boss.vulnerable-dt);
    if(!boss.phase) boss.phase = 1;
    const hpRate = boss.hp / boss.maxHp;
    const newPhase = hpRate < .28 ? 3 : hpRate < .62 ? 2 : 1;
    if(newPhase !== boss.phase){
      boss.phase = newPhase;
      boss.patternCd = .45;
      boss.mechanicText = `페이즈 ${newPhase}: 패턴이 강화됩니다!`;
      clearEnemyBullets(newPhase>=3);
      burst(boss.x,boss.y,boss.color,70+boss.tier*6,420);
      state.flash=Math.max(state.flash,.35);
      state.shake=Math.max(state.shake,6+boss.tier*.4);
    }
    if(!frozen){
      boss.patternCd-=dt;
      const dx=player.x-boss.x,dy=player.y-boss.y,distv=Math.hypot(dx,dy)||1;
      const slowMul = boss.statuses && boss.statuses.slow>0 ? .55 : 1;
      const chase=(boss.vulnerable>0?.28:1) * slowMul;
      boss.x+=dx/distv*boss.speed*chase*dt*(.22 + boss.tier*.012);
      boss.y+=dy/distv*boss.speed*chase*dt*(.13 + boss.tier*.010);
      boss.x=clamp(boss.x,90,W-90); boss.y=clamp(boss.y,100,H-120);
      if(distv<boss.r+player.r+4) hurtPlayer(boss.atk*dt*(2.4+boss.tier*.18),boss.color);
      if(boss.patternCd<=0){ bossPattern(); boss.patternCd=getBossPatternCooldown(); }
    } else {
      boss.patternCd += dt*.35;
    }
  }
  function getBossPatternCooldown(){
    const phaseMul = boss.phase===3 ? .55 : boss.phase===2 ? .72 : 1;
    const tierBase = Math.max(.48, 2.9 - boss.tier*.19);
    return tierBase * phaseMul + Math.random()*(.52 - Math.min(.32,boss.tier*.025));
  }
  function bossPattern(){
    const t=boss.theme; boss.mechanicText='';
    if(t==='fire'||t==='solar') firePattern(); else if(t==='ice') icePattern(); else if(t==='lightning') lightningPattern(); else if(t==='void') voidPattern(); else if(t==='nature') naturePattern(); else if(t==='sand') sandPattern(); else if(t==='metal') metalPattern(); else if(t==='blood') bloodPattern(); else if(t==='poison') poisonPattern(); else if(t==='mirror') mirrorPattern(); else if(t==='gravity') gravityPattern(); else if(t==='chrono') chronoPattern(); else if(t==='chaos') chaosPattern(); else slimePattern();
    if(boss.tier>=6 && Math.random()<.55) setTimeout(()=>secondaryPattern(), 520);
    if(boss.tier>=8 && boss.phase>=2 && Math.random()<.50) setTimeout(()=>secondaryPattern(true), 950);
    if(boss.tier>=7 && boss.phase>=2 && Math.random()<.38) setTimeout(()=>rotatingLaserSweep(boss.tier>=9), 680);
    if(boss.tier>=9 && boss.phase>=3 && Math.random()<.42) setTimeout(()=>instantKillPattern(), 1280);
  }
  function intensity(){ return Math.max(1, boss.tier + (boss.phase-1)*2); }
  function secondaryPattern(hard){
    if(!state.raid || boss.dead) return;
    const choices=[donutPattern, crossLaserPattern, chaseMarkerPattern, rotatingCurtainPattern, safeRuneBombPattern];
    choices[Math.floor(Math.random()*choices.length)](!!hard);
  }
  function slimePattern(){
    boss.mechanicText='젤리 점프: 착지 원 밖으로 피하세요. 후반은 방울이 튕깁니다.';
    warningCircle(player.x,player.y,62+boss.tier*4,.55,'#7ddf64',boss.atk*0.9);
    radialBullets(boss.x,boss.y,8+boss.phase*2,145+boss.tier*12,'#dbffb6',boss.atk*.42);
    if(boss.phase>=2) setTimeout(()=>radialBullets(boss.x,boss.y,10,180,'#a7f3d0',boss.atk*.35),260);
  }
  function firePattern(){
    const n=intensity();
    boss.mechanicText=boss.theme==='solar'?'태양룡: 광선, 낙하, 일식 안전지대를 번갈아 파훼하세요.':'화염 패턴: 용암 장판과 부채꼴 화염을 피하세요.';
    for(let i=0;i<3+Math.floor(n*.65);i++) warningCircle(rand(95,W-95),rand(120,H-78),36+n*3,.48,boss.color,boss.atk*(.72+n*.025),true);
    coneBullets(Math.atan2(player.y-boss.y,player.x-boss.x), .72, 5+Math.floor(n*.45), 260+n*8, boss.color, boss.atk*.45);
    if(boss.phase>=2) crossLaserPattern(false);
    if(boss.phase>=3) setTimeout(()=>donutPattern(true),360);
  }
  function icePattern(){
    const n=intensity();
    boss.mechanicText='빙결 예언: 얼음창을 피하고 파란 룬으로 BREAK를 만드세요.';
    spawnRune('#7dd3fc','break');
    for(let i=0;i<4+Math.floor(n*.7);i++) aimBullet(boss.x+rand(-30,30),boss.y+rand(-30,30),player.x+rand(-90,90),player.y+rand(-90,90),230+n*16,'#bae6fd',boss.atk*.48,'ice');
    if(boss.phase>=2) staggeredLineStrikes('#bae6fd','ice');
    if(boss.phase>=3) safeRuneBombPattern(true);
  }
  function lightningPattern(){
    const n=intensity();
    boss.mechanicText='폭풍 거신: 낙뢰 예고를 보고 빈칸으로 이동하세요. 후반은 전류 격자가 닫힙니다.';
    for(let i=0;i<5+n;i++) warningCircle(rand(80,W-80),rand(105,H-70),26+n*2,.34+i*.025,'#fde047',boss.atk*.75,'',null,'lightning');
    if(Math.random()<.70) spawnRune('#facc15','break');
    if(boss.phase>=2) setTimeout(()=>crossLaserPattern(true),300);
    if(boss.phase>=3) { rotatingCurtainPattern(true); rotatingLaserSweep(true); }
  }
  function voidPattern(){
    const n=intensity();
    boss.mechanicText='공허의 뱀: 순간이동 후 추적 구체와 공허 늪이 이어집니다.';
    const oldX=boss.x, oldY=boss.y;
    boss.x=rand(130,W-130); boss.y=rand(120,H-180);
    burst(oldX,oldY,boss.color,24+n*2,180); burst(boss.x,boss.y,boss.color,34+n*3,260);
    state.zones.push({x:player.x,y:player.y,r:64+n*5,damage:boss.atk*.08,life:2.4+boss.phase*.45,tick:0,color:'#7c3aed',enemy:true,dot:true});
    for(let i=0;i<2+boss.phase+Math.floor(n/4);i++) homingEnemy('#a78bfa');
    if(boss.phase>=3) donutPattern(true);
  }
  function naturePattern(){
    const n=intensity();
    boss.mechanicText='가시 여왕: 가시 벽의 빈틈과 독꽃 장판을 동시에 봐야 합니다.';
    const gap=rand(160,H-170);
    for(let i=0;i<5+boss.phase;i++){
      const y=120+i*90;
      if(Math.abs(y-gap)>75) state.hazards.push({kind:'wall',x:180+i*170,y,w:18,h:130+n*7,r:0,warn:.38,life:1.15,damage:boss.atk*.65,color:'#4ade80',tag:'poison'});
    }
    for(let i=0;i<2+boss.phase;i++) state.zones.push({x:rand(120,W-120),y:rand(130,H-80),r:55+n*3,damage:boss.atk*.055,life:2.6,tick:0,color:'#84cc16',enemy:true,dot:true});
    if(boss.phase>=2) spawnRune('#f472b6','break');
  }
  function sandPattern(){
    const n=intensity();
    boss.mechanicText='모래 사신: 감속 폭풍 속에서 낫 회전과 매몰 지대를 피하세요.';
    player.slow=Math.max(player.slow,1.2+boss.phase*.35);
    warningCircle(player.x,player.y,78+n*4,.62,'#f59e0b',boss.atk*.85,'',null,'sand');
    spiralBullets('#fde68a',10+n);
    if(boss.phase>=2) coneBullets(Math.atan2(player.y-boss.y,player.x-boss.x), 1.05, 8, 310, '#fbbf24', boss.atk*.48);
  }
  function metalPattern(){
    const n=intensity();
    boss.mechanicText='철갑 돌진: 돌진 예고를 보고 구르기로 통과하면 잠깐 약화됩니다.';
    const a=Math.atan2(player.y-boss.y,player.x-boss.x);
    state.hazards.push({kind:'beam',x:boss.x,y:boss.y,angle:a,len:900,w:30+n*2,warn:.42,life:.22,damage:boss.atk*1.05,color:'#e5e7eb',tag:'metal',callback:()=>{ if(player.roll>0) breakBoss(1.4); }});
    for(let k=0;k<6+boss.phase*2;k++) setTimeout(()=>radialBullets(boss.x,boss.y,7,190+k*18,'#94a3b8',boss.atk*.32),k*70);
  }
  function bloodPattern(){
    const n=intensity();
    boss.mechanicText='혈월 표식: 표식이 터지기 전에 자리를 바꾸고 흡혈 칼날을 피하세요.';
    chaseMarkerPattern(boss.phase>=2);
    for(let i=0;i<5+boss.phase*2;i++) aimBullet(boss.x,boss.y,player.x+rand(-140,140),player.y+rand(-140,140),260+n*14,'#fda4af',boss.atk*.42,'blood');
    if(boss.hp/boss.maxHp<.35) rotatingCurtainPattern(false);
  }
  function poisonPattern(){
    const n=intensity();
    boss.mechanicText='역병 의사: 해독 구역을 밟고 독안개와 독침 난사를 피하세요.';
    state.zones.push({x:W/2,y:H/2,r:215+n*8,damage:boss.atk*.075,life:3.0+boss.phase*.4,tick:0,color:'#84cc16',enemy:true,dot:true});
    spawnRune('#bef264','cleanse');
    for(let i=0;i<8+n;i++) aimBullet(boss.x,boss.y,rand(70,W-70),rand(110,H-60),230+n*8,'#bef264',boss.atk*.38,'poison');
    if(boss.phase>=3) safeRuneBombPattern(true);
  }
  function mirrorPattern(){
    const n=intensity();
    boss.mechanicText='거울 결투사: 밝은 진짜 분신을 찾고 반사 탄막 사이로 이동하세요.';
    boss.clones=[]; boss.realIndex=Math.floor(Math.random()*5);
    for(let i=0;i<5;i++) boss.clones.push({x:180+i*230,y:130+rand(-20,95),real:i===boss.realIndex,life:2.5+boss.phase*.35});
    radialBullets(boss.x,boss.y,12+boss.phase*4,210+n*8,'#e879f9',boss.atk*.36);
    if(boss.phase>=2) setTimeout(()=>staggeredLineStrikes('#f0abfc','mirror'),360);
    if(boss.phase>=3) crossLaserPattern(true);
  }
  function gravityPattern(){
    const n=intensity();
    boss.mechanicText='중력핵: 흡입, 도넛 폭발, 압축탄이 겹칩니다. 중심과 바깥을 번갈아 보세요.';
    state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:290+n*7,life:2.6+boss.phase*.35,power:210+n*8,color:'#818cf8'});
    warningCircle(W/2,H/2,95+n*4,1.25,'#818cf8',boss.atk*1.45,'',null,'gravity');
    donutPattern(boss.phase>=2);
    if(boss.phase>=3) for(let i=0;i<4;i++) homingEnemy('#c4b5fd');
  }
  function chronoPattern(){
    const n=intensity();
    boss.mechanicText='시간룡: 감속을 정화하거나 룬을 밟고, 지연 탄막을 예측하세요.';
    player.slow=Math.max(player.slow,1.7+boss.phase*.25);
    spawnRune('#f472b6','break');
    for(let i=0;i<10+boss.phase*4;i++) setTimeout(()=>radialBullets(boss.x,boss.y,5+boss.phase,145+i*9,'#fef08a',boss.atk*.25,i*.05), i*62);
    if(boss.phase>=2) safeRuneBombPattern(false);
    if(boss.phase>=3) setTimeout(()=>rotatingCurtainPattern(true),620);
  }
  function chaosPattern(){
    boss.mechanicText='혼돈의 집정관: 복합 패턴입니다. 안전지대, 탄막, 레이저를 동시에 판단하세요.';
    const funcs=[firePattern,icePattern,lightningPattern,voidPattern,sandPattern,gravityPattern,mirrorPattern,bloodPattern];
    funcs[Math.floor(Math.random()*funcs.length)]();
    setTimeout(()=>secondaryPattern(true),360);
    if(boss.phase>=2) setTimeout(()=>secondaryPattern(true),820);
    if(boss.phase>=3) { clearEnemyBullets(false); setTimeout(()=>{rotatingCurtainPattern(true); crossLaserPattern(true);},520); }
  }
  function instantKillPattern(){
    if(!state.raid || boss.dead) return;
    const safeR = boss.tier >= 10 ? 58 : 72;
    const sx = rand(130, W - 130), sy = rand(145, H - 95);
    boss.mechanicText += ' · 즉사 패턴: 초록 SAFE 안으로 들어가세요!';
    state.mechanics.push({kind:'safe',x:sx,y:sy,r:safeR,life:1.65,color:'#22c55e'});
    state.flash = Math.max(state.flash, .26);
    state.shake = Math.max(state.shake, 5);
    floatText('즉사기 예고!', W/2, 105, '#fb7185', 26);
    for(let i=0;i<8+boss.tier;i++) warningCircle(rand(80,W-80), rand(110,H-70), 26+boss.phase*5, .9+rand(0,.35), boss.color, boss.atk*.75, '', null, boss.theme);
    setTimeout(()=>{
      if(!state.raid || boss.dead || state.screen !== 'raid') return;
      if(dist(player.x, player.y, sx, sy) > safeR + player.r){
        hurtPlayer(9999, '#fb7185', true);
        floatText('즉사!', player.x, player.y - 52, '#fb7185', 28);
      } else {
        breakBoss(1.5);
        healText('즉사 회피!', player.x, player.y - 42);
      }
      burst(sx, sy, '#22c55e', 70, 360);
    }, 1650);
  }
  function donutPattern(hard){
    const r=hard?150:120;
    boss.mechanicText += ' · 도넛 폭발: 안쪽 원 밖, 바깥 원 안으로 이동';
    warningCircle(boss.x,boss.y,r*.55,.55,'#ffffff',boss.atk*.65,'',null,boss.theme);
    state.hazards.push({kind:'donut',x:boss.x,y:boss.y,inner:r*.75,outer:r*(hard?1.65:1.45),warn:.55,life:.24,damage:boss.atk*(hard?1.15:.85),color:boss.color,tag:boss.theme});
  }
  function crossLaserPattern(hard){
    const count=hard?4:2;
    boss.mechanicText += ' · 레이저 격자';
    for(let i=0;i<count;i++){
      const horizontal=i%2===0;
      state.hazards.push({kind:'beam',x:horizontal?W/2:rand(160,W-160),y:horizontal?rand(130,H-90):H/2,angle:horizontal?0:Math.PI/2,len:W*1.25,w:hard?34:26,warn:.58+i*.08,life:.28,damage:boss.atk*(hard?1.15:.8),color:boss.color,tag:boss.theme});
    }
  }
  function chaseMarkerPattern(hard){
    for(let i=0;i<(hard?4:2);i++) setTimeout(()=>warningCircle(player.x,player.y,44+boss.tier*2,.34,boss.color,boss.atk*(hard?.95:.72),'',()=>{ if(dist(player.x,player.y,boss.x,boss.y)>240) breakBoss(.75); },boss.theme),i*240);
  }
  function rotatingCurtainPattern(hard){
    const waves=hard?5:3;
    for(let k=0;k<waves;k++) setTimeout(()=>{
      const count=10+boss.phase*3+Math.floor(boss.tier*.8);
      const offset=state.time*1.4+k*.45;
      for(let i=0;i<count;i++){
        const a=offset+i/count*Math.PI*2;
        state.projectiles.push({owner:'boss',x:boss.x,y:boss.y,vx:Math.cos(a)*(150+boss.tier*12+k*10),vy:Math.sin(a)*(150+boss.tier*12+k*10),r:5+boss.phase,life:4.4,damage:boss.atk*.32,color:boss.color,tag:boss.theme});
      }
    },k*180);
  }

  function rotatingLaserSweep(hard){
    if(!state.raid || boss.dead) return;
    boss.mechanicText += ' · 회전 레이저: 맵을 도는 광선을 따라 피하세요';
    state.hazards.push({kind:'rotatingBeam',x:boss.x,y:boss.y,angle:Math.random()*Math.PI*2,spin:(hard?1.75:1.15)*(Math.random()<.5?-1:1),len:W*1.45,w:hard?22:16,warn:1.1,life:hard?2.45:1.85,damage:boss.atk*(hard?1.05:.78),color:boss.color,tag:boss.theme,tick:0});
    if(hard){
      state.hazards.push({kind:'rotatingBeam',x:boss.x,y:boss.y,angle:Math.random()*Math.PI*2+Math.PI/2,spin:-1.35,len:W*1.45,w:16,warn:1.35,life:2.1,damage:boss.atk*.82,color:boss.sub||boss.color,tag:boss.theme,tick:0});
    }
  }

  function safeRuneBombPattern(hard){
    boss.mechanicText += ' · 안전 룬: 폭발 전 룬 주변으로 이동';
    const sx=rand(140,W-140), sy=rand(150,H-100), safeR=hard?55:70;
    state.mechanics.push({kind:'safe',x:sx,y:sy,r:safeR,life:1.25,color:'#86efac'});
    setTimeout(()=>{
      if(!state.raid||boss.dead) return;
      if(dist(player.x,player.y,sx,sy)>safeR+player.r) hurtPlayer(boss.atk*(hard?2.2:1.55),'#fef08a');
      else { breakBoss(hard?1.2:.85); healText('SAFE',player.x,player.y-30); }
      burst(sx,sy,'#86efac',40,280);
    },1250);
  }
  function staggeredLineStrikes(color,tag){
    const baseA=Math.atan2(player.y-boss.y,player.x-boss.x);
    for(let i=-2;i<=2;i++) state.hazards.push({kind:'beam',x:boss.x,y:boss.y,angle:baseA+i*.22,len:950,w:22,warn:.34+(i+2)*.09,life:.20,damage:boss.atk*.65,color,tag});
  }
  function coneBullets(center,spread,count,speed,color,damage){
    for(let i=0;i<count;i++){const a=center-spread/2+spread*(count===1?.5:i/(count-1)); state.projectiles.push({owner:'boss',x:boss.x,y:boss.y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:6+boss.phase*.6,life:3.6,damage,color,tag:boss.theme});}
  }
  function clearEnemyBullets(all){
    if(all) state.projectiles = state.projectiles.filter(p=>p.owner!=='boss');
    else state.projectiles = state.projectiles.filter(p=>!(p.owner==='boss' && Math.random()<.45));
  }
  function warningCircle(x,y,r,warn,color,damage,zone,callback,tag){ state.hazards.push({kind:'circle',x,y,r,warn,life:.22,damage,color,zone,callback,tag}); }
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

  function updateProjectiles(dt){ state.projectiles.forEach(p=>{ if(p.delay){p.delay-=dt; return;} if(p.homing&&p.owner==='player'){const a=Math.atan2(boss.y-p.y,boss.x-p.x); p.vx+=(Math.cos(a)*520-p.vx)*dt*2.5; p.vy+=(Math.sin(a)*520-p.vy)*dt*2.5;} if(p.homingPlayer){const a=Math.atan2(player.y-p.y,player.x-p.x); p.vx+=(Math.cos(a)*260-p.vx)*dt*1.5; p.vy+=(Math.sin(a)*260-p.vy)*dt*1.5;} if(p.returning){const age=1.3-p.life; if(age>.55){const a=Math.atan2(player.y-p.y,player.x-p.x); p.vx=Math.cos(a)*600; p.vy=Math.sin(a)*600;}} p.x+=p.vx*dt; p.y+=p.vy*dt; p.life-=dt; if(p.owner==='player'&&!boss.dead&&dist(p.x,p.y,boss.x,boss.y)<p.r+boss.r){damageBoss(p.damage,p.color,false); if(p.splash) state.zones.push({x:p.x,y:p.y,r:p.splash,damage:p.damage*.65,life:.12,color:p.color,once:true}); if(!p.pierce) p.life=0; else p.pierce--; } if(p.owner==='boss'&&dist(p.x,p.y,player.x,player.y)<p.r+player.r){ hurtPlayer(p.damage,p.color); p.life=0; applyBossHitStatus(p.tag || boss.theme); } }); state.projectiles=state.projectiles.filter(p=>p.life>0&&p.x>-80&&p.x<W+80&&p.y>-80&&p.y<H+80); }
  function applyBossHitStatus(tag){
    const st = player.statuses || (player.statuses={burn:0,poison:0,freeze:0,paralysis:0,slow:0});
    const resist = player.statusResist || {};
    function blocked(k){ return Math.random() < clamp(resist[k] || 0, 0, .85); }
    if((tag==='slow'||tag==='sand'||tag==='chrono'||tag==='gravity') && !blocked('slow')) { st.slow=Math.max(st.slow,1.8); player.slow=Math.max(player.slow,1.8); }
    if((tag==='fire'||tag==='solar') && !blocked('burn')) st.burn=Math.max(st.burn,2.6);
    if(tag==='poison' && !blocked('poison')) st.poison=Math.max(st.poison,3.6);
    if(tag==='ice' && !blocked('freeze')) st.freeze=Math.max(st.freeze,.75);
    if(tag==='lightning' && !blocked('paralysis')) st.paralysis=Math.max(st.paralysis,.55);
  }

  function updateHazards(dt){
    state.hazards.forEach(h=>{
      if(!h || !Number.isFinite(h.life)) h.life = 0;
      if(h.warn>0){ h.warn-=dt; if(h.kind==='rotatingBeam') h.angle += (h.spin||0)*dt*.25; return; }
      h.life-=dt;
      if(h.kind==='circle'){
        if(dist(h.x,h.y,player.x,player.y)<h.r+player.r){ hurtPlayer(h.damage,h.color); if(h.tag) applyBossHitStatus(h.tag); }
        if(h.zone) state.zones.push({x:h.x,y:h.y,r:h.r,damage:h.damage*.08,life:2.4,tick:0,color:h.color,enemy:true,dot:true});
        if(h.callback) h.callback(); h.life=0;
      } else if(h.kind==='donut'){
        const d=dist(h.x,h.y,player.x,player.y);
        if(d>h.inner && d<h.outer){ hurtPlayer(h.damage,h.color); if(h.tag) applyBossHitStatus(h.tag); }
        h.life=0;
      } else if(h.kind==='beam' || h.kind==='rotatingBeam'){
        if(h.kind==='rotatingBeam') { h.angle += (h.spin||0)*dt; h.tick=(h.tick||0)-dt; }
        const px=player.x-h.x, py=player.y-h.y;
        const along=px*Math.cos(h.angle)+py*Math.sin(h.angle);
        const side=Math.abs(-px*Math.sin(h.angle)+py*Math.cos(h.angle));
        if(Math.abs(along)<h.len/2 && side<h.w+player.r && (h.kind!=='rotatingBeam' || (h.tick||0)<=0)){
          hurtPlayer(h.damage,h.color); if(h.tag) applyBossHitStatus(h.tag); if(h.kind==='rotatingBeam') h.tick=.32;
        }
        if(h.kind==='beam'){ if(h.callback) h.callback(); h.life=0; }
      } else if(h.kind==='playerStrike'){
        if(boss && !boss.dead && dist(h.x,h.y,boss.x,boss.y)<h.r+boss.r){damageBoss(h.damage,h.color,false); h.life=0;}
      } else if(h.kind==='wall'){
        if(Math.abs(player.x-h.x)<h.w+player.r && Math.abs(player.y-h.y)<h.h/2+player.r){ hurtPlayer(h.damage,h.color); if(h.tag) applyBossHitStatus(h.tag); }
      }
    });
    state.hazards=state.hazards.filter(h=>h && (h.life>0||h.warn>0));
  }
  function updateZones(dt){ state.zones.forEach(z=>{z.life-=dt; z.tick=(z.tick||0)-dt; if(z.once){ if(z.enemy){ if(dist(z.x,z.y,player.x,player.y)<z.r+player.r) hurtPlayer(z.damage,z.color); } else if(z.heal&&dist(z.x,z.y,player.x,player.y)<z.r+player.r){ player.hp=Math.min(player.maxHp,player.hp+Math.abs(z.damage)); healText('+'+Math.floor(Math.abs(z.damage)),player.x,player.y-28); } else if(dist(z.x,z.y,boss.x,boss.y)<z.r+boss.r) damageBoss(z.damage,z.color,false); z.life=0; return;} if(z.tick<=0){z.tick=.25; if(z.enemy){ if(dist(z.x,z.y,player.x,player.y)<z.r+player.r) hurtPlayer(z.damage,z.color); } else if(z.heal&&dist(z.x,z.y,player.x,player.y)<z.r+player.r){ player.hp=Math.min(player.maxHp,player.hp+Math.abs(z.damage)); healText('+'+Math.floor(Math.abs(z.damage)),player.x,player.y-28); } else if(dist(z.x,z.y,boss.x,boss.y)<z.r+boss.r) damageBoss(z.damage,z.color,false); }}); state.zones=state.zones.filter(z=>z.life>0); }
  function clearPlayerStatuses(){ const st=player.statuses||(player.statuses={}); ['burn','poison','freeze','paralysis','slow'].forEach(k=>st[k]=0); player.slow=0; }
  function updateMechanics(dt){ state.mechanics.forEach(m=>{m.life-=dt; if(m.kind==='rune'&&dist(m.x,m.y,player.x,player.y)<m.r+player.r){ if(m.action==='break') breakBoss(2.6); if(m.action==='cleanse'){clearPlayerStatuses(); player.slow=0; player.hp=Math.min(player.maxHp,player.hp+120); healText('해독',player.x,player.y-35);} m.life=0; } if(m.kind==='gravity'){const a=Math.atan2(m.y-player.y,m.x-player.x); const d=Math.max(60,dist(m.x,m.y,player.x,player.y)); player.x+=Math.cos(a)*m.power/d*80*dt; player.y+=Math.sin(a)*m.power/d*80*dt;} }); state.mechanics=state.mechanics.filter(m=>m.life>0); if(boss.clones&&boss.clones.length){boss.clones.forEach(c=>c.life-=dt); boss.clones=boss.clones.filter(c=>c.life>0);} }

  function breakBoss(sec){ boss.vulnerable=Math.max(boss.vulnerable,sec); boss.guard=0; burst(boss.x,boss.y,'#fef08a',46,330); floatText('BREAK!',boss.x,boss.y-boss.r-20,'#fef08a'); }
  function damageBoss(amount,color,big){ if(boss.dead) return; let mul=player.damageMul; if(player.berserk){mul*=1+(1-player.hp/player.maxHp)*.45;} if(boss.vulnerable<=0) mul*=.48; if(boss.statuses&&boss.statuses.vulnerable>0) mul*=1.35; if(boss.statuses&&boss.statuses.weaken>0) mul*=1.18; const crit=Math.random()*100<player.crit; let dmg=Math.max(1,Math.floor(amount*mul*(crit?player.critDmg:1))); boss.hp-=dmg; boss.hit=.12; floatText((crit?dmg+'!':'-'+dmg),boss.x+rand(-20,20),boss.y-boss.r-12,crit?'#fef08a':(color||'#fff'),big?22:16); if(player.lifesteal>0){player.hp=Math.min(player.maxHp,player.hp+dmg*player.lifesteal);} if(boss.hp<=0){boss.hp=0;boss.dead=true;} }
  function damageBossRange(range,dmg,color){ if(dist(player.x,player.y,boss.x,boss.y)<range+boss.r) damageBoss(dmg,color,false); }
  function damageBossLine(range,width,angle,dmg,color){ const px=boss.x-player.x, py=boss.y-player.y; const along=px*Math.cos(angle)+py*Math.sin(angle); const side=Math.abs(-px*Math.sin(angle)+py*Math.cos(angle)); if(along>0&&along<range+boss.r&&side<width+boss.r) damageBoss(dmg,color,false); }
  function damageBossCone(range,arc,angle,dmg,color){ const a=Math.atan2(boss.y-player.y,boss.x-player.x); let diff=Math.abs(normAngle(a-angle)); if(dist(player.x,player.y,boss.x,boss.y)<range+boss.r && diff<arc/2) damageBoss(dmg,color,false); }
  function hurtPlayer(amount,color,statusDamage){ if(!Number.isFinite(amount)) amount = 1; if(!statusDamage && (player.invuln>0||state.screen!=='raid')) return; let realAmount=amount; if(boss&&boss.statuses&&boss.statuses.weaken>0) realAmount*=.72; let dmg=Math.max(1,Math.floor(realAmount-player.def)); if(player.shield>0){const used=Math.min(player.shield,dmg); player.shield-=used; dmg-=used;} if(dmg>0){player.hp-=dmg; player.damageTaken+=dmg; floatText('-'+dmg,player.x,player.y-24,color||'#fb7185'); state.shake=Math.max(state.shake,4); player.invuln=.18;} }
  function checkEnd(){ if(!state.raid) return; if(player.hp<=0&&!state.raid.failed){state.raid.failed=true; endRaid(false);} if(boss.dead&&!state.raid.clear){state.raid.clear=true; endRaid(true);} }
  function endRaid(clear){ state.screen='result'; const elapsed=Math.floor(state.raid.elapsed*1000); let rewardText=''; if(clear){ const b=getBoss(boss.id); const rw=Math.max(0,Math.floor((b.tier+1)/3)); const rs=1+Math.floor(b.tier/2); const ra=b.tier>=2?Math.floor((b.tier+1)/4):0; const rp=b.tier>=3?1:0; state.save.tickets.weapon += rw; state.save.tickets.armor += ra; state.save.tickets.skill += rs; state.save.tickets.passive += rp; rewardText=`획득 티켓: 무기 ${rw}장 / 방어구 ${ra}장 / 스킬 ${rs}장 / 패시브 ${rp}장`; saveGame(); submitRecord(elapsed); } ui.right.classList.remove('hidden'); ui.right.innerHTML=`<h1 class="title">${clear?'클리어!':'실패'}</h1><p class="sub">${boss.name}<br>시간: ${formatMs(elapsed)}<br>받은 피해: ${player.damageTaken}<br>${clear?rewardText:'보스를 다시 분석해보세요.'}</p><button id="resultMenu" class="btn">메뉴로</button>`; ui.right.querySelector('#resultMenu').onclick=()=>{state.menuTab=clear?'ranking':'build'; renderMenu(); refreshRankings(boss.id);}; }

  function normalizedPlayerName(name){ return String(name || 'Player').trim() || 'Player'; }
  function dedupeLatestByPlayer(records){
    const map = new Map();
    records.forEach(r=>{
      const key = normalizedPlayerName(r.player_name).toLowerCase();
      const old = map.get(key);
      const rt = Date.parse(r.created_at || r.updated_at || 0) || 0;
      const ot = old ? (Date.parse(old.created_at || old.updated_at || 0) || 0) : -1;
      if(!old || rt >= ot) map.set(key, r);
    });
    return Array.from(map.values()).sort((a,b)=>(a.clear_ms||999999999)-(b.clear_ms||999999999));
  }

  async function submitRecord(ms){
    const playerName = normalizedPlayerName(state.save.playerName);
    const record={player_name:playerName,boss_id:boss.id,boss_name:boss.name,clear_ms:ms,weapon_id:state.raid.weapon?state.raid.weapon.id:'none',weapon_name:state.raid.weapon?state.raid.weapon.name:'무기 없음',skills:state.raid.skills.filter(Boolean).map(s=>s.name),passives:[state.raid.armor?('방어구: '+state.raid.armor.name):'방어구 없음'].concat(state.raid.passives.filter(Boolean).map(p=>p.name)),damage_taken:player.damageTaken,created_at:new Date().toISOString()};
    let local=getLocalRecords().filter(r=>!(r.boss_id===boss.id && normalizedPlayerName(r.player_name).toLowerCase()===playerName.toLowerCase()));
    local.push(record);
    local=dedupeLatestByPlayer(local).slice(0,250);
    localStorage.setItem(LOCAL_RECORD_KEY,JSON.stringify(local));
    if(supabaseReady&&supabase){
      try{
        const del = await supabase.from('raid_records').delete().eq('boss_id',boss.id).eq('player_name',playerName);
        if(del && del.error) console.warn('raid_records delete skipped:', del.error.message);
        const ins = await supabase.from('raid_records').insert(record);
        if(ins && ins.error) throw ins.error;
      }catch(e){
        console.warn('Supabase ranking save failed:', e && e.message ? e.message : e);
        toast('온라인 랭킹 저장 실패: SQL 정책을 확인하세요');
      }
    }
    refreshRankings(boss.id);
  }
  function getLocalRecords(){try{return JSON.parse(localStorage.getItem(LOCAL_RECORD_KEY)||localStorage.getItem('raid-build-v11-local-records')||localStorage.getItem('raid-build-v10-local-records')||localStorage.getItem('raid-build-v9-local-records')||localStorage.getItem('raid-build-v7-local-records')||'[]');}catch(e){return[];}}
  async function refreshRankings(bossId){
    state.rankingBossId=bossId;
    let records=getLocalRecords().filter(r=>r.boss_id===bossId);
    if(supabaseReady&&supabase){
      try{
        const {data,error}=await supabase.from('raid_records').select('*').eq('boss_id',bossId).order('created_at',{ascending:false}).limit(300);
        if(error) throw error;
        if(data) records=records.concat(data);
      }catch(e){
        console.warn('Supabase ranking load failed:', e && e.message ? e.message : e);
      }
    }
    records=dedupeLatestByPlayer(records).slice(0,10);
    state.rankings=records;
    if(state.menuTab==='ranking'&&state.screen==='menu') renderMenu();
  }

  function draw(){ ctx.clearRect(0,0,W,H); if(state.screen==='raid'||state.screen==='paused'||state.screen==='result'){ drawArena(); drawZones(); drawMechanics(); drawHazards(); drawProjectiles(); drawBoss(); drawPlayer(); drawParticles(); drawTexts(); drawHud(); drawControlHint(); } else { drawMenuBackground(); } if(state.flash>0){ctx.fillStyle=`rgba(255,255,255,${state.flash*.18})`;ctx.fillRect(0,0,W,H);} }
  function drawMenuBackground(){ const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#081126'); g.addColorStop(1,'#030712'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); for(let i=0;i<80;i++){ctx.fillStyle='rgba(147,197,253,.08)'; circle(ctx,(i*97+state.time*12)%W,40+(i*53)%H,1+(i%3));} }
  function drawArena(){ const b=getBoss(boss.id); const g=ctx.createLinearGradient(0,0,0,H); const theme={fire:['#210707','#45110c'],solar:['#281409','#5b2705'],ice:['#071b2c','#123247'],lightning:['#111827','#312e05'],void:['#080516','#1e103a'],nature:['#061a10','#0d3320'],sand:['#2b1907','#5a3610'],metal:['#111827','#334155'],blood:['#220611','#4c0519'],poison:['#0d1b05','#1f3f0b'],mirror:['#101828','#392056'],gravity:['#09091a','#1e1b4b'],chrono:['#19051c','#442054'],chaos:['#150616','#3b0f2f'],slime:['#061a10','#12331e']}[b.theme]||['#081126','#030712']; g.addColorStop(0,theme[0]); g.addColorStop(1,theme[1]); ctx.fillStyle=g; ctx.fillRect(0,0,W,H); ctx.save(); ctx.globalAlpha=.18; for(let i=0;i<16;i++){ctx.strokeStyle=b.color;ctx.beginPath();ctx.arc(W/2,H/2,80+i*45+Math.sin(state.time+i)*8,0,Math.PI*2);ctx.stroke();} ctx.restore(); }
  function drawBoss(){ if(!boss||boss.dead) return; ctx.save(); if(state.shake>0) ctx.translate(rand(-state.shake,state.shake),rand(-state.shake,state.shake)); ctx.globalAlpha=boss.hit>0?.72:1; drawBossShape(ctx,boss,boss.x,boss.y,boss.r); ctx.restore(); const bw=680,bh=18,x=(W-bw)/2,y=28; ctx.fillStyle='#000a'; roundRect(ctx,x,y,bw,bh,9); ctx.fillStyle=boss.vulnerable>0?'#fef08a':boss.color; roundRect(ctx,x,y,bw*clamp(boss.hp/boss.maxHp,0,1),bh,9); ctx.fillStyle='#fff'; ctx.font='900 16px system-ui'; ctx.textAlign='center'; ctx.fillText(`${boss.name}  ${stars(boss.tier)}  ${boss.vulnerable>0?'BREAK':'GUARD'}`,W/2,22); ctx.font='800 13px system-ui'; ctx.fillStyle='#cbd5e1'; ctx.fillText(boss.mechanicText||'패턴을 보고 움직이세요.',W/2,62); if(boss.clones) boss.clones.forEach(c=>drawBossShape(ctx,{...boss,color:c.real?'#fef08a':boss.color,sub:boss.sub,theme:boss.theme},c.x,c.y,boss.r*.65)); }
  function drawBossShape(c,b,x,y,r){
    c.save();
    c.translate(x,y);
    c.shadowColor=b.color;
    c.shadowBlur=20;
    const t = state.time;
    const id = b.id;

    function eye(ex,ey,size){ c.fillStyle='#020617'; circle(c,ex,ey,size); c.fillStyle='#fff8'; circle(c,ex-size*.25,ey-size*.25,size*.28); }
    function horn(x1,y1,x2,y2,x3,y3,color){ c.fillStyle=color||b.sub; c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.lineTo(x3,y3); c.closePath(); c.fill(); }

    if(id==='slime_king'){
      c.fillStyle=b.color; c.beginPath(); c.ellipse(0,18,r*1.42,r*.86,0,0,Math.PI*2); c.fill();
      c.fillStyle='rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-r*.35,-r*.05,r*.36,r*.22,-.4,0,Math.PI*2); c.fill();
      c.fillStyle=b.sub; c.beginPath(); c.moveTo(-r*.38,-r*.55); c.lineTo(-r*.2,-r*.92); c.lineTo(0,-r*.62); c.lineTo(r*.2,-r*.92); c.lineTo(r*.38,-r*.55); c.closePath(); c.fill();
      eye(-r*.35,6,6); eye(r*.35,6,6); c.strokeStyle='#14532d'; c.lineWidth=4; c.beginPath(); c.arc(0,18,r*.32,0,Math.PI); c.stroke();
    } else if(id==='ember_tyrant'){
      c.fillStyle=b.color; c.beginPath(); for(let i=0;i<18;i++){const a=i/18*Math.PI*2; const rr=r*(i%2?1.22:.72)+Math.sin(t*5+i)*4; c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);} c.closePath(); c.fill();
      c.fillStyle=b.sub; circle(c,0,0,r*.55); horn(-r*.35,-r*.25,-r*.9,-r*.9,-r*.65,-r*.05,'#7f1d1d'); horn(r*.35,-r*.25,r*.9,-r*.9,r*.65,-r*.05,'#7f1d1d'); eye(-r*.22,-r*.05,6); eye(r*.22,-r*.05,6);
    } else if(id==='thorn_queen'){
      c.fillStyle=b.color; for(let i=0;i<12;i++){const a=i/12*Math.PI*2; c.save(); c.rotate(a); horn(0,-r*.55,-r*.12,-r*1.25,r*.12,-r*1.25,b.sub); c.restore();}
      c.fillStyle='#f472b6'; c.beginPath(); for(let i=0;i<8;i++){const a=i/8*Math.PI*2; const rr=i%2?r*.85:r*1.15; c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);} c.closePath(); c.fill();
      c.fillStyle='#166534'; circle(c,0,0,r*.45); eye(-r*.18,-r*.05,5); eye(r*.18,-r*.05,5);
    } else if(id==='frost_oracle'){
      c.fillStyle=b.color; polygon(c,0,0,r*1.15,8); c.fill(); c.strokeStyle='#e0f2fe'; c.lineWidth=5; c.stroke();
      c.fillStyle=b.sub; polygon(c,0,0,r*.62,6); c.fill(); for(let i=0;i<6;i++){c.save(); c.rotate(i*Math.PI/3); c.fillStyle='#e0f2fe'; c.fillRect(-3,-r*1.45,6,r*.5); c.restore();} eye(-r*.2,-r*.08,5); eye(r*.2,-r*.08,5);
    } else if(id==='sand_reaper'){
      c.fillStyle='#78350f'; c.beginPath(); c.ellipse(0,8,r*.82,r*1.08,0,0,Math.PI*2); c.fill();
      c.fillStyle=b.color; c.beginPath(); c.arc(0,-r*.18,r*.72,Math.PI,0); c.lineTo(r*.55,r*.55); c.lineTo(-r*.55,r*.55); c.closePath(); c.fill();
      c.strokeStyle=b.sub; c.lineWidth=7; c.beginPath(); c.arc(r*.35,-r*.05,r*.8,-1.4,1.6); c.stroke(); eye(-r*.18,-r*.18,5); eye(r*.18,-r*.18,5);
    } else if(id==='void_serpent'){
      c.strokeStyle=b.color; c.lineWidth=20; c.lineCap='round'; c.beginPath(); for(let i=0;i<9;i++){const px=-r+i*r*.25; const py=Math.sin(i*.9+t*3)*r*.18; if(i)c.lineTo(px,py); else c.moveTo(px,py);} c.stroke();
      c.fillStyle=b.sub; circle(c,r*.95,0,r*.45); c.fillStyle=b.color; horn(r*1.18,-r*.1,r*1.55,-r*.32,r*1.22,r*.1,b.color); eye(r*.85,-r*.1,5); eye(r*1.05,-r*.1,5);
    } else if(id==='iron_minotaur'){
      c.fillStyle='#475569'; roundRect(c,-r*.8,-r*.6,r*1.6,r*1.35,18); c.fillStyle=b.color; roundRect(c,-r*.58,-r*.92,r*1.16,r*.82,14);
      horn(-r*.35,-r*.7,-r*1.05,-r*1.0,-r*.62,-r*.35,'#e5e7eb'); horn(r*.35,-r*.7,r*1.05,-r*1.0,r*.62,-r*.35,'#e5e7eb');
      c.strokeStyle=b.sub; c.lineWidth=9; c.beginPath(); c.moveTo(r*.7,-r*.05); c.lineTo(r*1.25,-r*.55); c.stroke(); eye(-r*.22,-r*.45,5); eye(r*.22,-r*.45,5);
    } else if(id==='blood_moon'){
      c.fillStyle=b.color; circle(c,0,0,r*.88); c.strokeStyle=b.sub; c.lineWidth=8; c.beginPath(); c.arc(0,0,r*1.05,-1.9,1.9); c.stroke();
      c.fillStyle='#020617'; c.beginPath(); c.arc(r*.16,-r*.1,r*.78,-1.65,1.65); c.fill(); c.fillStyle=b.sub; circle(c,0,0,r*.35); eye(-r*.12,-r*.05,5); eye(r*.12,-r*.05,5);
    } else if(id==='storm_colossus'){
      c.fillStyle='#334155'; roundRect(c,-r*.85,-r*.8,r*1.7,r*1.6,16); c.fillStyle=b.color; c.beginPath(); c.moveTo(-r*.2,-r*1.12); c.lineTo(r*.35,-r*.15); c.lineTo(r*.02,-r*.15); c.lineTo(r*.28,r*.72); c.lineTo(-r*.42,-r*.05); c.lineTo(-r*.08,-r*.05); c.closePath(); c.fill(); eye(-r*.3,-r*.25,6); eye(r*.3,-r*.25,6);
    } else if(id==='plague_doctor'){
      c.fillStyle='#111827'; c.beginPath(); c.ellipse(0,0,r*.75,r*1.05,0,0,Math.PI*2); c.fill(); c.fillStyle=b.color; c.beginPath(); c.moveTo(-r*.15,-r*.12); c.lineTo(r*1.05,0); c.lineTo(-r*.15,r*.2); c.closePath(); c.fill();
      c.fillStyle='#e5e7eb'; c.beginPath(); c.ellipse(-r*.2,-r*.15,r*.38,r*.55,-.25,0,Math.PI*2); c.fill(); eye(-r*.26,-r*.25,5); eye(-r*.04,-r*.21,5);
    } else if(id==='mirror_duelist'){
      c.fillStyle='rgba(255,255,255,.22)'; polygon(c,0,0,r*1.08,6); c.fill(); c.strokeStyle=b.color; c.lineWidth=6; polygon(c,0,0,r*1.08,6); c.stroke();
      c.fillStyle=b.sub; c.fillRect(-r*.12,-r*1.12,r*.24,r*2.24); c.strokeStyle='#fff'; c.lineWidth=3; c.beginPath(); c.moveTo(-r*.45,r*.65); c.lineTo(r*.72,-r*.65); c.stroke(); eye(-r*.2,-r*.05,5); eye(r*.2,-r*.05,5);
    } else if(id==='gravity_core'){
      c.strokeStyle=b.color; c.lineWidth=8; for(let i=0;i<4;i++){c.beginPath(); c.ellipse(0,0,r*(1-i*.13),r*.48*(1-i*.05),t*1.4+i*.9,0,Math.PI*2); c.stroke();}
      c.fillStyle=b.sub; circle(c,0,0,r*.42); c.fillStyle='#fff'; circle(c,0,0,r*.16);
    } else if(id==='solar_dragon'){
      c.fillStyle=b.color; c.beginPath(); c.ellipse(0,0,r*1.05,r*.72,0,0,Math.PI*2); c.fill(); horn(-r*.35,-r*.3,-r*.72,-r*1.0,-r*.12,-r*.58,b.sub); horn(r*.35,-r*.3,r*.72,-r*1.0,r*.12,-r*.58,b.sub);
      c.fillStyle=b.sub; for(let i=0;i<10;i++){c.save(); c.rotate(i*Math.PI/5+t*.3); c.fillRect(r*.58,-3,r*.55,6); c.restore();} eye(-r*.22,-r*.08,6); eye(r*.22,-r*.08,6);
    } else if(id==='chrono_dragon'){
      c.strokeStyle=b.color; c.lineWidth=7; circleStroke(c,0,0,r*1.05); c.strokeStyle=b.sub; c.beginPath(); c.arc(0,0,r*.75,-Math.PI/2,t%(Math.PI*2)); c.stroke();
      c.fillStyle='#312e81'; circle(c,0,0,r*.55); c.strokeStyle='#fef08a'; c.lineWidth=5; c.beginPath(); c.moveTo(0,0); c.lineTo(Math.cos(t)*r*.45,Math.sin(t)*r*.45); c.moveTo(0,0); c.lineTo(Math.cos(t*1.7)*r*.32,Math.sin(t*1.7)*r*.32); c.stroke(); eye(-r*.18,-r*.12,5); eye(r*.18,-r*.12,5);
    } else if(id==='abyss_leviathan'){
      c.strokeStyle=b.color; c.lineWidth=18; c.lineCap='round'; c.beginPath(); for(let i=0;i<12;i++){const px=-r*1.15+i*r*.22; const py=Math.sin(i*.75+t*2.6)*r*.26; if(i)c.lineTo(px,py); else c.moveTo(px,py);} c.stroke();
      c.fillStyle=b.sub; circle(c,r*1.22,0,r*.48); c.strokeStyle='#7dd3fc'; c.lineWidth=5; circleStroke(c,r*1.22,0,r*.65); eye(r*1.05,-r*.1,5); eye(r*1.25,-r*.1,5);
    } else if(id==='puppet_emperor'){
      c.strokeStyle='#fde68a'; c.lineWidth=3; for(let i=-2;i<=2;i++){c.beginPath(); c.moveTo(i*r*.22,-r*1.5); c.lineTo(i*r*.18,-r*.55); c.stroke();}
      c.fillStyle=b.color; roundRect(c,-r*.65,-r*.55,r*1.3,r*1.2,12); c.fillStyle=b.sub; polygon(c,0,-r*.82,r*.62,5); c.fill(); c.fillStyle='#020617'; roundRect(c,-r*.42,-r*.22,r*.84,r*.42,6); eye(-r*.18,-r*.1,5); eye(r*.18,-r*.1,5);
    } else if(id==='black_sun'){
      c.fillStyle='#020617'; circle(c,0,0,r*.92); c.strokeStyle=b.color; c.lineWidth=8; circleStroke(c,0,0,r*1.02); for(let i=0;i<14;i++){c.save(); c.rotate(i*Math.PI/7+t*.25); c.fillStyle=i%2?b.color:'#fef08a'; c.fillRect(r*.72,-4,r*.55,8); c.restore();}
      c.fillStyle=b.color; circle(c,0,0,r*.22); eye(-r*.22,-r*.06,5); eye(r*.22,-r*.06,5);
    } else if(id==='chaos_archon'){
      for(let i=0;i<7;i++){c.save(); c.rotate(t*.8+i*Math.PI*2/7); c.fillStyle=i%2?b.color:b.sub; polygon(c,0,-r*.48,r*.35,3); c.fill(); c.restore();}
      c.fillStyle='#020617'; circle(c,0,0,r*.72); c.strokeStyle=b.color; c.lineWidth=5; circleStroke(c,0,0,r*.72); c.fillStyle=b.sub; circle(c,0,0,r*.22); eye(-r*.22,-r*.1,5); eye(r*.22,-r*.1,5);
    } else {
      c.fillStyle=b.color; roundRect(c,-r,-r*.75,r*2,r*1.5,18); c.fill(); c.fillStyle=b.sub; circle(c,0,-r*.1,r*.48); eye(-r*.25,-r*.08,5); eye(r*.25,-r*.08,5);
    }
    c.shadowBlur=0;
    c.restore();
  }
  function drawPlayer(){
    ctx.save();
    ctx.translate(player.x,player.y);
    ctx.fillStyle='rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(0,6,22,8,0,0,Math.PI*2); ctx.fill();
    const bob = Math.sin(player.anim*11) * (keys.has('w')||keys.has('a')||keys.has('s')||keys.has('d') ? 2 : .5);
    ctx.translate(0,bob);
    const equippedArmorColor = state.raid && state.raid.armor ? state.raid.armor.color : '#e5e7eb'; ctx.fillStyle=player.roll>0?'#93c5fd':player.invuln>0?'#bfdbfe':equippedArmorColor; circle(ctx,0,0,player.r); if(state.raid&&state.raid.armor){ctx.strokeStyle='#ffffffaa';ctx.lineWidth=3;circleStroke(ctx,0,0,player.r+3);ctx.fillStyle='rgba(255,255,255,.18)';roundRect(ctx,-11,1,22,13,5);}
    ctx.fillStyle='#111827'; circle(ctx,5*player.face,-4,3); circle(ctx,5*player.face+3,-5,1.2);
    ctx.strokeStyle='#111827'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(2*player.face,4,5,0,Math.PI); ctx.stroke();
    if(player.attackAnim>0){
      const a=player.attackAngle||player.aim||0; const t=player.attackAnim/.28;
      ctx.save(); ctx.rotate(a); ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=3+6*t; ctx.beginPath(); ctx.arc(18,0,26+32*(1-t),-.9,.9); ctx.stroke(); ctx.restore();
    }
    drawWeaponHeld(ctx,state.raid?state.raid.weapon:null);
    ctx.restore();
  }
  function drawWeaponHeld(c,w){ if(!w) return; c.save(); const a=(player.attackAnim>0?player.attackAngle:player.aim)||0; const swing=player.attackAnim>0?Math.sin((player.attackAnim/.34)*Math.PI):0; c.rotate(a + swing * weaponSwingAmount(w)); c.translate(18 + swing*10,0); drawWeaponShape(c,w,1.0 + swing*.18); c.restore(); }
  function weaponSwingAmount(w){ const k=w&&w.kind||''; if(k.includes('bow')) return .08; if(k.includes('staff')||k==='grimoire'||k==='gunstaff') return .10; if(k==='dagger') return .55; if(k==='greatsword'||k==='scythe') return .95; if(k==='whip'||k==='chakram') return .70; if(k==='pole') return .25; return .65; }
  function weaponSwingAmount(w){ const k=w&&w.kind||''; if(k.includes('bow')) return .08; if(k.includes('staff')||k==='grimoire'||k==='gunstaff') return .10; if(k==='dagger') return .55; if(k==='greatsword'||k==='scythe') return .95; if(k==='whip'||k==='chakram') return .70; if(k==='pole') return .25; return .65; }
  function drawWeaponShape(c,w,scale){
    c.save(); c.scale(scale,scale); c.lineCap='round'; c.lineJoin='round'; c.shadowColor=w.color; c.shadowBlur=10+rarityFxMul(w.rarity)*2;
    const k=w.kind, rare=rarityFxMul(w.rarity);
    c.strokeStyle='#111827'; c.lineWidth=7;
    if(k.includes('bow')){
      c.beginPath(); c.arc(10,0,24,-1.25,1.25); c.stroke();
      c.strokeStyle=w.color; c.lineWidth=4; c.beginPath(); c.arc(10,0,23,-1.25,1.25); c.stroke();
      c.strokeStyle='#f8fafc'; c.lineWidth=1.5; c.beginPath(); c.moveTo(20,-22); c.lineTo(20,22); c.stroke();
      c.fillStyle=w.color; polygon(c,30,0,5+rare,3); c.fill();
    } else if(k.includes('staff')){
      c.strokeStyle='#1f2937'; c.lineWidth=7; c.beginPath(); c.moveTo(-6,20); c.lineTo(20,-25); c.stroke();
      c.strokeStyle=w.color; c.lineWidth=4; c.stroke();
      c.fillStyle=w.color; circle(c,23,-28,7+rare*1.5); c.fillStyle='#ffffff'; circle(c,23,-28,2+rare*.7);
      c.strokeStyle=w.color; c.lineWidth=2; circleStroke(c,23,-28,12+rare*2);
    } else if(k==='grimoire'){
      c.fillStyle='#111827'; roundRect(c,-6,-18,32,36,5); c.fill(); c.fillStyle=w.color; roundRect(c,-3,-15,27,30,4); c.fill(); c.strokeStyle='#fff'; c.lineWidth=1.5; c.beginPath(); c.moveTo(10,-12); c.lineTo(10,12); c.stroke(); circle(c,18,0,3+rare*.5);
    } else if(k==='whip'){
      c.strokeStyle=w.color; c.lineWidth=4; c.beginPath(); c.moveTo(0,0); for(let i=1;i<9;i++) c.lineTo(i*11,Math.sin(i*1.2+state.time*10)*12); c.stroke();
      for(let i=2;i<8;i+=2){c.fillStyle=i%4?w.color:'#fff'; circle(c,i*11,Math.sin(i*1.2+state.time*10)*12,2+rare*.3);}
    } else if(k==='dagger'){
      c.fillStyle=w.color; c.beginPath(); c.moveTo(0,0); c.lineTo(34,-8); c.lineTo(21,5); c.closePath(); c.fill(); c.fillStyle='#fff'; c.fillRect(3,-2,12,2); c.fillStyle='#111827'; c.fillRect(-5,-7,8,14);
    } else if(k==='greatsword'){
      c.fillStyle=w.color; c.fillRect(0,-8,52,16); c.fillStyle='#f8fafc'; c.fillRect(38,-13,12,26); c.fillStyle='#111827'; c.fillRect(-6,-11,8,22); c.strokeStyle='#fff'; c.lineWidth=2; c.beginPath(); c.moveTo(6,-4); c.lineTo(42,-4); c.stroke();
    } else if(k==='scythe'){
      c.strokeStyle=w.color; c.lineWidth=5; c.beginPath(); c.moveTo(0,20); c.lineTo(40,-22); c.stroke(); c.beginPath(); c.arc(43,-23,22,.15,2.8); c.stroke(); c.strokeStyle='#fff'; c.lineWidth=1.5; c.beginPath(); c.arc(43,-23,15,.2,2.3); c.stroke();
    } else if(k==='gunstaff'){
      c.fillStyle='#111827'; roundRect(c,-2,-8,45,16,4); c.fill(); c.fillStyle=w.color; roundRect(c,0,-5,40,10,3); c.fill(); circle(c,43,0,7+rare); c.fillStyle='#fff'; circle(c,45,0,2+rare*.4);
    } else if(k==='chakram'){
      c.strokeStyle=w.color; c.lineWidth=5; c.beginPath(); c.arc(22,0,19,0,Math.PI*2); c.stroke(); c.strokeStyle='#ffffff'; c.lineWidth=2; c.beginPath(); c.arc(22,0,10,0,Math.PI*2); c.stroke(); for(let i=0;i<4;i++){c.save(); c.translate(22,0); c.rotate(i*Math.PI/2); c.fillStyle=w.color; c.fillRect(8,-2,15,4); c.restore();}
    } else if(k==='pole'){
      c.strokeStyle=w.color; c.lineWidth=5; c.beginPath(); c.moveTo(-10,0); c.lineTo(58,0); c.stroke(); c.fillStyle='#fff'; c.beginPath(); c.moveTo(58,0); c.lineTo(45,-8); c.lineTo(45,8); c.closePath(); c.fill(); c.fillStyle=w.color; c.fillRect(36,-5,12,10);
    } else {
      c.fillStyle=w.color; c.beginPath(); c.moveTo(0,0); c.lineTo(43,-12); c.lineTo(33,10); c.closePath(); c.fill(); c.fillStyle='#ffffff'; c.beginPath(); c.moveTo(9,-1); c.lineTo(35,-8); c.lineTo(30,2); c.closePath(); c.fill(); c.fillStyle='#111827'; c.fillRect(-5,-9,8,18);
    }
    if(rare>=2.3){ c.strokeStyle=w.color; c.lineWidth=1.5; circleStroke(c,18,0,28+rare*2); }
    c.restore();
  }
  function drawHud(){ const hpw=260; ctx.fillStyle='rgba(0,0,0,.45)'; roundRect(ctx,18,H-88,360,72,14); ctx.fillStyle='#ef4444'; roundRect(ctx,38,H-72,hpw*clamp(player.hp/player.maxHp,0,1),12,6); ctx.fillStyle='#334155'; roundRect(ctx,38,H-52,hpw,8,4); ctx.fillStyle='#60a5fa'; roundRect(ctx,38,H-52,hpw*clamp(player.shield/500,0,1),8,4); ctx.fillStyle='#fff'; ctx.font='800 12px system-ui'; ctx.fillText(`HP ${Math.ceil(player.hp)}/${Math.ceil(player.maxHp)}  Shield ${Math.floor(player.shield)}`,38,H-77); const cds=[player.basicCd,player.skillCd[0],player.skillCd[1],player.skillCd[2],player.rollCd]; const labels=['J','1','2','3','Space']; for(let i=0;i<5;i++){const x=430+i*78,y=H-70; ctx.fillStyle='rgba(15,23,42,.78)'; roundRect(ctx,x,y,60,48,10); ctx.fillStyle='#fff'; ctx.font='900 13px system-ui'; ctx.textAlign='center'; ctx.fillText(labels[i],x+30,y+19); ctx.fillStyle=cds[i]>0?'#fb7185':'#86efac'; ctx.fillText(cds[i]>0?cds[i].toFixed(1):'OK',x+30,y+38);} ctx.textAlign='left'; }
  function drawControlHint(){ ctx.save(); ctx.globalAlpha=.55; ctx.fillStyle='#e5e7eb'; ctx.font='900 15px system-ui'; ctx.textAlign='center'; ctx.fillText('WASD 이동   ·   마우스 조준   ·   J/좌클릭 일반공격   ·   1/2/3 장착 스킬   ·   Space 누른 방향으로 구르기', W/2, H-10); ctx.restore(); }
  function drawProjectiles(){ state.projectiles.forEach(p=>{ if(p.delay&&p.delay>0){ctx.strokeStyle=p.color; ctx.globalAlpha=.25; circleStroke(ctx,p.x,p.y,18); ctx.globalAlpha=1; return;} ctx.save(); ctx.shadowColor=p.color; ctx.shadowBlur=14; ctx.fillStyle=p.color; circle(ctx,p.x,p.y,p.r); ctx.globalAlpha=.35; ctx.strokeStyle=p.color; ctx.lineWidth=Math.max(2,p.r*.35); ctx.beginPath(); ctx.moveTo(p.x-p.vx*.025,p.y-p.vy*.025); ctx.lineTo(p.x-p.vx*.075,p.y-p.vy*.075); ctx.stroke(); ctx.globalAlpha=1; ctx.restore(); }); }
  function drawHazards(){
    state.hazards.forEach(h=>{
      ctx.save();
      const warning = h.warn > 0;
      ctx.globalAlpha = warning ? .34 : .82;
      ctx.strokeStyle = h.color || '#fff';
      ctx.fillStyle = h.color || '#fff';
      ctx.lineWidth = warning ? 4 : 3;
      if(h.kind==='circle'||h.kind==='playerStrike'){
        if(warning){ ctx.globalAlpha=.22; circle(ctx,h.x,h.y,h.r); ctx.globalAlpha=.72; circleStroke(ctx,h.x,h.y,h.r); ctx.font='900 13px system-ui'; ctx.textAlign='center'; ctx.fillText('!',h.x,h.y+4); }
        else { ctx.globalAlpha=.38; circle(ctx,h.x,h.y,h.r); ctx.globalAlpha=.9; circleStroke(ctx,h.x,h.y,h.r); }
      } else if(h.kind==='donut'){
        circleStroke(ctx,h.x,h.y,h.outer); circleStroke(ctx,h.x,h.y,h.inner);
        if(warning){ ctx.globalAlpha=.18; ctx.lineWidth=18; circleStroke(ctx,h.x,h.y,(h.inner+h.outer)/2); }
        else { ctx.globalAlpha=.30; ctx.lineWidth=14; circleStroke(ctx,h.x,h.y,(h.inner+h.outer)/2); }
      } else if(h.kind==='beam'||h.kind==='rotatingBeam'){
        ctx.save(); ctx.translate(h.x,h.y); ctx.rotate(h.angle||0);
        ctx.globalAlpha = warning ? .26 : (h.kind==='rotatingBeam' ? .55 : .62);
        roundRect(ctx,-h.len/2,-h.w,h.len,h.w*2,8);
        ctx.globalAlpha = warning ? .82 : .92; ctx.strokeStyle = '#ffffffaa'; ctx.lineWidth = warning ? 2 : 1.5; ctx.strokeRect(-h.len/2,-h.w,h.len,h.w*2);
        ctx.restore();
      } else if(h.kind==='wall'){
        ctx.globalAlpha = warning ? .25 : .72; ctx.fillRect(h.x-h.w/2,h.y-h.h/2,h.w,h.h);
      }
      ctx.restore();
    });
  }
  function drawZones(){ state.zones.forEach(z=>{ctx.save(); ctx.globalAlpha=.22+.1*Math.sin(state.time*8); ctx.fillStyle=z.color; circle(ctx,z.x,z.y,z.r); ctx.globalAlpha=.65; ctx.strokeStyle=z.color; ctx.lineWidth=3; circleStroke(ctx,z.x,z.y,z.r); ctx.restore();});}
  function drawMechanics(){ state.mechanics.forEach(m=>{ctx.save(); ctx.strokeStyle=m.color; ctx.fillStyle=m.color; if(m.kind==='rune'){ctx.globalAlpha=.8; circleStroke(ctx,m.x,m.y,m.r+Math.sin(state.time*8)*4); ctx.font='900 20px system-ui'; ctx.textAlign='center'; ctx.fillText('룬',m.x,m.y+7);} if(m.kind==='safe'){ctx.globalAlpha=.30+.12*Math.sin(state.time*10); ctx.fillStyle=m.color; circle(ctx,m.x,m.y,m.r); ctx.globalAlpha=.9; ctx.strokeStyle='#ffffff'; circleStroke(ctx,m.x,m.y,m.r+Math.sin(state.time*8)*5); ctx.font='900 16px system-ui'; ctx.textAlign='center'; ctx.fillStyle='#ffffff'; ctx.fillText('SAFE',m.x,m.y+5);} if(m.kind==='gravity'){ctx.globalAlpha=.35; circleStroke(ctx,m.x,m.y,m.r); for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(m.x,m.y,m.r*(i+1)/5,state.time+i,state.time+i+1.2);ctx.stroke();}} ctx.restore();});}
  function drawParticles(){ state.particles.forEach(p=>{ const a=clamp(p.life,0,1); ctx.save(); ctx.globalAlpha=a; ctx.shadowColor=p.color; ctx.shadowBlur=p.kind==='ring'?8:14; if(p.kind==='ring'){ ctx.strokeStyle=p.color; ctx.lineWidth=p.line||3; circleStroke(ctx,p.x,p.y,Math.max(2,p.r*(1.25-a*.35))); } else if(p.kind==='line'){ ctx.strokeStyle=p.color; ctx.lineWidth=Math.max(1,p.r*.35); ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+Math.cos(p.angle||0)*(p.len||24),p.y+Math.sin(p.angle||0)*(p.len||24)); ctx.stroke(); } else if(p.kind==='star'){ drawStar(ctx,p.x,p.y,p.r,p.color); } else { ctx.fillStyle=p.color; circle(ctx,p.x,p.y,p.r); } ctx.restore(); });}
  function drawTexts(){ state.texts.forEach(t=>{ctx.globalAlpha=clamp(t.life,0,1); ctx.fillStyle=t.color; ctx.font=`900 ${t.size||16}px system-ui`; ctx.textAlign='center'; ctx.fillText(t.text,t.x,t.y); ctx.globalAlpha=1;});}

  function drawStar(c,x,y,r,color){ c.fillStyle=color; c.beginPath(); for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5; const rr=i%2===0?r:r*.45; const px=x+Math.cos(a)*rr, py=y+Math.sin(a)*rr; if(i===0)c.moveTo(px,py); else c.lineTo(px,py);} c.closePath(); c.fill(); }
  function burst(x,y,color,count,speed){ count=Math.min(count,48); for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2, v=rand(speed*.25,speed); state.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,r:rand(2,5),life:rand(.25,.75),color});} }
  function slashEffect(x,y,a,range,color,width){ const fx=1.3; for(let i=-5;i<=5;i++){const aa=a+i*.045; state.particles.push({kind:'line',x:x+Math.cos(aa)*range*.35,y:y+Math.sin(aa)*range*.35,vx:Math.cos(aa)*40,vy:Math.sin(aa)*40,r:(width||10)*.6,life:.18,color,angle:aa,len:range*.36});} state.particles.push({kind:'ring',x:x+Math.cos(a)*range*.55,y:y+Math.sin(a)*range*.55,vx:0,vy:0,r:(width||10)*fx,life:.18,color,line:3}); }
  function arcEffect(x,y,a,range,color){ for(let i=-8;i<=8;i++){const aa=a+i*.09; state.particles.push({kind:'line',x:x+Math.cos(aa)*range*.32,y:y+Math.sin(aa)*range*.32,vx:Math.cos(aa)*80,vy:Math.sin(aa)*80,r:5,life:.22,color,angle:aa,len:range*.22});} }
  function stabEffect(x,y,a,range,color){ for(let i=0;i<10;i++) state.particles.push({kind:'line',x:x+Math.cos(a)*range*i/10,y:y+Math.sin(a)*range*i/10,vx:Math.cos(a)*60,vy:Math.sin(a)*60,r:4,life:.16,color,angle:a,len:22+i*2}); }
  function thrustEffect(x,y,a,range,color){ stabEffect(x,y,a,range,color); }
  function beamEffect(x,y,a,color){ for(let i=0;i<12;i++) state.particles.push({x:x+Math.cos(a)*i*34,y:y+Math.sin(a)*i*34,vx:0,vy:0,r:4,life:.2,color}); }
  function floatText(text,x,y,color,size){ state.texts.push({text,x,y,vy:-38,life:1.0,color:color||'#fff',size:size||16}); }
  function healText(text,x,y){ floatText(text,x,y,'#86efac',18); }
  function updateParticles(dt){ state.particles.forEach(p=>{p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.03,dt);p.vy*=Math.pow(.03,dt);}); state.particles=state.particles.filter(p=>p.life>0); }
  function updateTexts(dt){ state.texts.forEach(t=>{t.life-=dt;t.y+=(t.vy||-30)*dt;}); state.texts=state.texts.filter(t=>t.life>0); }

  function bossMiniSvg(b){
    const shape = b.theme === 'slime'
      ? `<ellipse cx="60" cy="50" rx="35" ry="22" fill="${b.color}"/><circle cx="48" cy="45" r="4" fill="#020617"/><circle cx="72" cy="45" r="4" fill="#020617"/><path d="M45 30 L52 16 L60 29 L68 16 L75 30" fill="${b.sub}"/>`
      : b.theme === 'fire' || b.theme === 'solar'
        ? `<path d="M60 12 L73 33 L96 32 L78 50 L86 74 L60 60 L34 74 L42 50 L24 32 L47 33 Z" fill="${b.color}"/><circle cx="60" cy="46" r="18" fill="${b.sub}"/>`
      : b.theme === 'ice'
        ? `<polygon points="60,10 88,32 78,68 42,68 32,32" fill="${b.color}"/><polygon points="60,25 75,38 70,58 50,58 45,38" fill="${b.sub}"/>`
      : b.theme === 'lightning'
        ? `<path d="M58 8 L82 42 L65 42 L78 78 L38 35 L56 35 Z" fill="${b.color}"/>`
      : b.theme === 'void' || b.theme === 'gravity' || b.theme === 'chaos'
        ? `<ellipse cx="60" cy="44" rx="42" ry="20" fill="none" stroke="${b.color}" stroke-width="6"/><circle cx="60" cy="44" r="18" fill="${b.sub}"/>`
      : `<circle cx="60" cy="44" r="${22+b.tier*4}" fill="${b.color}" opacity=".95"/><circle cx="48" cy="38" r="4" fill="#020617"/><circle cx="72" cy="38" r="4" fill="#020617"/><path d="M40 58 Q60 72 80 58" stroke="${b.sub}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
    return `<svg width="120" height="86" viewBox="0 0 120 86"><defs><filter id="g${b.id}"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><g filter="url(#g${b.id})">${shape}</g></svg>`;
  }

  function weaponKindName(kind){
    if(!kind) return '없음';
    if(kind.includes('bow')) return '활';
    if(kind.includes('staff')) return '스태프';
    if(kind.includes('sword')) return '검';
    return ({whip:'채찍',pole:'봉',dagger:'단검',greatsword:'대검',gunstaff:'마도총',scythe:'낫',chakram:'차크람',grimoire:'마도서'})[kind] || kind;
  }


  // V14 global helpers: 인라인/콘솔/비상 버튼 처리용.
  try {
    window.RaidDungeonUI = {
      step: (name) => { state.menuTab='build'; state.buildStep=String(name || 'weapon'); saveGame(); renderMenu(); },
      next: () => stepMove(1),
      prev: () => stepMove(-1),
      start: () => startRaid(),
      gacha: (kind) => rollGacha(kind),
      select: (type,id,slot) => selectBuild(type, id || '', Number(slot || 0)),
      save: () => manualSaveProfile(),
      gachaTab: () => { state.menuTab='gacha'; renderMenu(); }
    };
  } catch(e) {}

  // V14 diagnostic helper: 브라우저 콘솔에서 window.RaidDungeonDebug.state()로 현재 저장 상태 확인 가능.
  try {
    window.RaidDungeonDebug = {
      state: () => JSON.parse(JSON.stringify({
        menuTab: state.menuTab,
        buildStep: state.buildStep,
        selectedWeaponId: state.selectedWeaponId,
        selectedArmorId: state.selectedArmorId,
        selectedSkillIds: state.selectedSkillIds,
        selectedPassiveIds: state.selectedPassiveIds,
        save: state.save,
        cloudStatus: state.cloudStatus
      })),
      saveNow: () => manualSaveProfile(),
      goArmor: () => { state.menuTab='build'; state.buildStep='armor'; renderMenu(); },
      goReady: () => { state.menuTab='build'; state.buildStep='ready'; renderMenu(); }
    };
  } catch(e) {}


  try {
    window.addEventListener('beforeunload', () => { try { saveGame(); writeAllLocalSaves(); } catch(e) {} });
    window.addEventListener('pagehide', () => { try { saveGame(); writeAllLocalSaves(); } catch(e) {} });
  } catch(e) {}

  function loop(now){ const dt=Math.min(.033,(now-state.last)/1000||.016); state.last=now; try{ update(dt); draw(); }catch(e){ console.error('Raid loop recovered:', e); toast('전투 오류를 복구했습니다. 콘솔 오류를 확인하세요.'); state.hazards=[]; state.projectiles=state.projectiles.filter(p=>p.owner==='player'); draw(); } requestAnimationFrame(loop); }
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
