
/* =========================================================
   RAID DUNGEON V17 - NICKNAME RECORD SYNC, RAID PANEL REMOVED, FAIR BOSS PATTERNS public/src/game.js
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
  const VERSION = 'Raid Dungeon V26 - Mini Game Intro Dialogue';
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
  function getArmor(id) { return ARMORS.find(a => a.id === id) || null; }
  function getSkill(id) { return SKILLS.find(s => s.id === id) || null; }
  function getPassive(id) { return PASSIVES.find(p => p.id === id) || null; }
  function passiveLimit() { return 1; }
  function ownedWeapons() { return WEAPONS.filter(w => state.save.weapons.includes(w.id)); }
  function ownedArmors() { return ARMORS.filter(a => (state.save.armors || []).includes(a.id)); }
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
    return target.closest('[data-authmode],[data-tab],[data-boss],[data-gacha],[data-step],[data-tabgo],[data-select-type],[data-passive],[data-prev-step],[data-next-step],#authSubmit,#goBuild,#goGacha,#backDungeon,#startRaid,#manualSaveBtn,#changeNickBtn,#logoutBtn,#giveup,#pauseMenu,#resultMenu');
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
      if(active.matches('#changeNickBtn')){ changeNickname(); return; }
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


  async function syncNicknameRecords(oldName, nextName) {
    const oldKey = normalizedPlayerName(oldName || '').toLowerCase();
    const next = (nextName || '').trim();
    if (!oldKey || !next || oldKey === normalizedPlayerName(next).toLowerCase()) return;

    // 로컬 랭킹 기록의 예전 닉네임도 새 닉네임으로 변경
    try {
      const local = getLocalRecords().map(r => {
        if (normalizedPlayerName(r.player_name).toLowerCase() === oldKey) return { ...r, player_name: next };
        return r;
      });
      localStorage.setItem(LOCAL_RECORD_KEY, JSON.stringify(dedupeRecords(local)));
    } catch (e) {
      console.warn('[RaidDungeon] local nickname record sync failed:', e);
    }

    // Supabase 랭킹 기록도 변경. 정책상 실패할 수 있으므로 실패해도 게임 저장은 유지.
    if (supabaseReady && supabase) {
      try {
        const upd = await supabase.from('raid_records').update({ player_name: next }).eq('player_name', oldName);
        if (upd && upd.error) console.warn('[RaidDungeon] cloud nickname record sync skipped:', upd.error.message);
      } catch (e) {
        console.warn('[RaidDungeon] cloud nickname record sync failed:', e);
      }
    }
  }

  async function changeNickname() {
    const input = document.getElementById('nicknameEditInput');
    const next = (input && input.value ? input.value : '').trim();
    if (!next || next.length < 2) {
      toast('닉네임은 2자 이상으로 입력해주세요.');
      state.cloudStatus = '닉네임 변경 실패: 2자 이상 필요';
      renderMenu();
      return;
    }
    if (next.length > 12) {
      toast('닉네임은 12자 이하로 입력해주세요.');
      state.cloudStatus = '닉네임 변경 실패: 12자 이하 필요';
      renderMenu();
      return;
    }
    const oldName = state.save.playerName || 'Player';
    state.save.playerName = next;
    try { localStorage.setItem('raid-build-player-name-v1', next); } catch(e) {}
    state.cloudStatus = '닉네임 변경 중 · 기존 랭킹 기록 갱신 시도';
    saveGame();
    await syncNicknameRecords(oldName, next);
    await manualSaveProfile();
    await refreshRankings(state.rankingBossId);
    state.cloudStatus = '닉네임 변경 완료 · 기존 기록 갱신 완료';
    renderMenu();
  }

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
    ui.menu.innerHTML = `<div class="row"><div><h1 class="title">Raid Dungeon</h1><p class="sub">보스를 선택하고, 티켓으로 무기/방어구/스킬/패시브를 뽑아 조합한 뒤 패턴을 파훼해서 클리어하세요.</p></div><div style="text-align:right"><div class="chip">${VERSION}</div><div class="chip">닉네임 ${escapeHtml(state.save.playerName || 'Player')}</div><div style="display:flex;gap:6px;justify-content:flex-end;align-items:center;margin-top:6px"><input id="nicknameEditInput" class="input" value="${escapeHtml(state.save.playerName || 'Player')}" maxlength="12" style="width:120px;padding:7px;font-size:12px"><button id="changeNickBtn" class="btn secondary" style="padding:7px 9px;min-height:30px;font-size:12px">닉네임 변경</button></div><div class="chip">무기티켓 ${state.save.tickets.weapon}</div><div class="chip">방어구티켓 ${state.save.tickets.armor||0}</div><div class="chip">스킬티켓 ${state.save.tickets.skill}</div><div class="chip">패시브티켓 ${state.save.tickets.passive}</div><div class="chip">${escapeHtml(state.cloudStatus || '계정 저장')}</div><button id="manualSaveBtn" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.save()" class="btn secondary" style="margin-top:8px;padding:8px 12px">수동 저장</button> <button id="logoutBtn" class="btn secondary" style="margin-top:8px;padding:8px 12px">로그아웃</button></div></div>${nav}${body}`;
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
    // 전투 중 왼쪽 위 현재 빌드 패널이 시야를 가려서 숨김. 포기는 P 일시정지 메뉴에서 가능.
    ui.menu.classList.add('hidden'); ui.left.classList.add('hidden'); ui.right.classList.add('hidden'); state.screen='raid';
    Object.assign(player, makePlayer()); player.name=state.save.playerName||'Player'; applyBuild(); player.hp=player.maxHp;
    boss = makeBoss(getBoss(state.selectedBossId));
    state.projectiles=[]; state.hazards=[]; state.zones=[]; state.mechanics=[]; state.particles=[]; state.texts=[]; state.shake=0; state.flash=0;
    state.raid={ start:performance.now(), elapsed:0, clear:false, failed:false, weapon:getWeapon(state.selectedWeaponId), armor:getArmor(state.selectedArmorId), skills:(state.selectedSkillIds||[]).slice(0,3).map(getSkill), passives:state.selectedPassiveIds.map(getPassive).filter(Boolean) };
    toast(boss.name+' 레이드 시작!');
  }
  function applyBuild(){ const w=getWeapon(state.selectedWeaponId); const a=getArmor(state.selectedArmorId); if(w){player.atk*=w.atk; player.crit+=w.crit||0;} if(a){ player.equippedArmor=a; player.maxHp+=a.hp; player.hp=player.maxHp; player.def+=a.def; Object.keys(a.resist||{}).forEach(k=>player.statusResist[k]=Math.max(player.statusResist[k]||0,a.resist[k]||0)); } state.selectedPassiveIds.map(getPassive).filter(Boolean).forEach(p=>p.apply(player)); player.maxHp=Math.floor(player.maxHp); player.speed=Math.floor(player.speed); }
  function renderRaidPanel(){
    // V17: 전투 화면 좌측 안내 패널 제거. 화면을 가리지 않도록 유지하지 않음.
    if (ui.left) ui.left.classList.add('hidden');
  }
  function togglePause(){ if(state.screen==='raid'){state.screen='paused'; ui.right.classList.remove('hidden'); ui.right.innerHTML='<h1 class="title">일시정지</h1><p class="sub">P 또는 ESC로 계속합니다. 전투를 포기하려면 아래 버튼을 누르세요.</p><button id="pauseMenu" class="btn secondary">포기하고 메뉴로</button>'; ui.right.querySelector('#pauseMenu').onclick=renderMenu;} else if(state.screen==='paused'){state.screen='raid'; ui.right.classList.add('hidden'); state.last=performance.now();} }

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
      player.roll=.22; player.rollCd=Math.max(.45,1.25-(player.rollCdBonus||0)); player.invuln=Math.max(player.invuln,.30); player.rollVx=rx*900; player.rollVy=ry*900; player.aim=Math.atan2(ry,rx); if(rx<0)player.face=-1; if(rx>0)player.face=1;
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
    if(boss.tier>=6 && Math.random()<.38) setTimeout(()=>secondaryPattern(), 650);
    if(boss.tier>=8 && boss.phase>=2 && Math.random()<.34) setTimeout(()=>secondaryPattern(true), 1050);
    if(boss.tier>=7 && boss.phase>=2 && Math.random()<.24) setTimeout(()=>rotatingLaserSweep(boss.tier>=9 && Math.random()<.65), 780);
    if(boss.tier>=9 && boss.phase>=3 && Math.random()<.10) setTimeout(()=>instantKillPattern(), 1800);
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
    // V23: 즉사 패턴은 너무 자주 나오지 않게 내부 쿨타임을 둔다.
    if(boss._lastInstaAt && state.time - boss._lastInstaAt < 16) return;
    boss._lastInstaAt = state.time;

    const safeR = boss.tier >= 10 ? 78 : 92;
    const sx = rand(145, W - 145), sy = rand(150, H - 105);
    boss.mechanicText = (boss.mechanicText ? boss.mechanicText + ' · ' : '') + '즉사 패턴: 맵 전체 심판. 초록 SAFE 안으로 들어가세요!';
    floatText('즉사 패턴! SAFE로 이동!', W/2, 86, '#fb7185', 28);
    state.flash = Math.max(state.flash, .36);
    state.shake = Math.max(state.shake, 7);

    // 안전 구역은 길게 보여준다.
    state.mechanics.push({kind:'safe',x:sx,y:sy,r:safeR,life:2.45,color:'#22c55e'});

    // 맵 전체가 공격받는 느낌: SAFE 주변을 제외한 전장 전체를 큰 예고 사각형/줄로 덮는다.
    const cols = 6, rows = 4;
    const cellW = W / cols, cellH = (H - 90) / rows;
    for(let ix=0; ix<cols; ix++){
      for(let iy=0; iy<rows; iy++){
        const cx = cellW*(ix+.5), cy = 90 + cellH*(iy+.5);
        if(dist(cx,cy,sx,sy) < safeR + Math.max(cellW,cellH)*.72) continue;
        state.hazards.push({kind:'floor',x:cx,y:cy,w:cellW*.92,h:cellH*.86,warn:2.05 + Math.random()*.18,life:.72,damage:9999,color:'#fb7185',tag:boss.theme, lethal:true, label:'즉사'});
      }
    }
    // 외곽 레이저 십자도 예고해서 화면 전체 심판 느낌을 준다.
    state.hazards.push({kind:'beam',x:W/2,y:H/2,angle:0,len:W*1.25,w:18,warn:2.05,life:.72,damage:9999,color:'#fb7185',tag:boss.theme,lethal:true,label:'즉사'});
    state.hazards.push({kind:'beam',x:W/2,y:H/2,angle:Math.PI/2,len:H*1.45,w:18,warn:2.05,life:.72,damage:9999,color:'#fb7185',tag:boss.theme,lethal:true,label:'즉사'});

    setTimeout(()=>{
      if(!state.raid || boss.dead || state.screen !== 'raid') return;
      if(dist(player.x, player.y, sx, sy) > safeR + player.r){
        hurtPlayer(9999, '#fb7185', true);
        floatText('즉사!', player.x, player.y - 52, '#fb7185', 28);
      } else {
        breakBoss(1.7);
        healText('즉사 회피!', player.x, player.y - 42);
      }
      burst(sx, sy, '#22c55e', 72, 360);
    }, 2150);
  }

  function donutPattern(hard){
    const r=hard?150:120;
    boss.mechanicText += ' · 도넛 폭발: 안쪽 원 밖, 바깥 원 안으로 이동';
    warningCircle(boss.x,boss.y,r*.55,.55,'#ffffff',boss.atk*.65,'',null,boss.theme);
    state.hazards.push({kind:'donut',x:boss.x,y:boss.y,inner:r*.75,outer:r*(hard?1.65:1.45),warn:.55,life:.24,damage:boss.atk*(hard?1.15:.85),color:boss.color,tag:boss.theme});
  }
  function crossLaserPattern(hard){
    const count=hard?3:2;
    boss.mechanicText += ' · 레이저 격자';
    for(let i=0;i<count;i++){
      const horizontal=i%2===0;
      state.hazards.push({kind:'beam',x:horizontal?W/2:rand(160,W-160),y:horizontal?rand(130,H-90):H/2,angle:horizontal?0:Math.PI/2,len:W*1.25,w:hard?34:26,warn:.78+i*.10,life:.25,damage:boss.atk*(hard?.95:.72),color:boss.color,tag:boss.theme});
    }
  }
  function chaseMarkerPattern(hard){
    for(let i=0;i<(hard?3:2);i++) setTimeout(()=>warningCircle(player.x,player.y,44+boss.tier*2,.55,boss.color,boss.atk*(hard?.82:.62),'',()=>{ if(dist(player.x,player.y,boss.x,boss.y)>240) breakBoss(.75); },boss.theme),i*240);
  }
  function rotatingCurtainPattern(hard){
    const waves=hard?4:3;
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
    state.hazards.push({kind:'rotatingBeam',x:boss.x,y:boss.y,angle:Math.random()*Math.PI*2,spin:(hard?1.75:1.15)*(Math.random()<.5?-1:1),len:W*1.45,w:hard?22:16,warn:1.25,life:hard?2.05:1.65,damage:boss.atk*(hard?.88:.68),color:boss.color,tag:boss.theme,tick:0});
    if(hard){
      if(Math.random()<.55) state.hazards.push({kind:'rotatingBeam',x:boss.x,y:boss.y,angle:Math.random()*Math.PI*2+Math.PI/2,spin:-1.15,len:W*1.45,w:15,warn:1.45,life:1.75,damage:boss.atk*.68,color:boss.sub||boss.color,tag:boss.theme,tick:0});
    }
  }

  function safeRuneBombPattern(hard){
    boss.mechanicText += ' · SAFE 패턴: 맵 전체 폭발 전 안전 구역으로 이동';
    const sx=rand(145,W-145), sy=rand(150,H-100), safeR=hard?74:88;
    floatText('SAFE 안으로!', W/2, 92, '#86efac', 22);
    state.mechanics.push({kind:'safe',x:sx,y:sy,r:safeR,life:1.95,color:'#86efac'});
    // 전장 전체를 덮는 예고를 보여주되 SAFE 근처는 비워서 파훼가 눈에 보이게 한다.
    const cols=5, rows=4, cellW=W/cols, cellH=(H-100)/rows;
    for(let ix=0;ix<cols;ix++) for(let iy=0;iy<rows;iy++){
      const cx=cellW*(ix+.5), cy=100+cellH*(iy+.5);
      if(dist(cx,cy,sx,sy)<safeR+Math.max(cellW,cellH)*.62) continue;
      state.hazards.push({kind:'floor',x:cx,y:cy,w:cellW*.90,h:cellH*.82,warn:1.55,life:.55,damage:boss.atk*(hard?2.05:1.35),color:'#fef08a',tag:boss.theme,label:'SAFE'});
    }
    setTimeout(()=>{
      if(!state.raid||boss.dead) return;
      if(dist(player.x,player.y,sx,sy)>safeR+player.r) hurtPlayer(boss.atk*(hard?2.25:1.55),'#fef08a');
      else { breakBoss(hard?1.2:.85); healText('SAFE',player.x,player.y-30); }
      burst(sx,sy,'#86efac',48,280);
    },1650);
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

  function rollBossTicketRewards(b) {
    // V16: 스킬 티켓이 가장 자주 나오지만, 무기/방어구/패시브도 골고루 드랍되게 조정.
    // 낮은 보스는 무득표가 가능하고, 높은 보스는 여러 장이 나올 수 있음.
    const tier = clamp(Number(b && b.tier || 1), 1, 10);
    const rewards = { weapon: 0, armor: 0, skill: 0, passive: 0 };
    const noDropChance = Math.max(0.06, 0.30 - tier * 0.022);
    if (Math.random() < noDropChance) return rewards;
    const rolls = 1 + (tier >= 4 ? 1 : 0) + (tier >= 7 ? 1 : 0) + (tier >= 9 ? 1 : 0) + (Math.random() < tier * 0.045 ? 1 : 0);
    for (let i = 0; i < rolls; i++) {
      const r = Math.random();
      // 기본: 스킬 50%, 무기 18%, 방어구 18%, 패시브 14%
      // 고난도일수록 무기/방어구/패시브 쪽 비중이 소폭 상승.
      const skillCut = Math.max(0.38, 0.58 - tier * 0.018);
      const weaponCut = skillCut + 0.16 + tier * 0.006;
      const armorCut = weaponCut + 0.16 + tier * 0.006;
      if (r < skillCut) rewards.skill += 1;
      else if (r < weaponCut) rewards.weapon += 1;
      else if (r < armorCut) rewards.armor += 1;
      else rewards.passive += 1;
    }
    // 최상위권 보스는 완전 빈 보상 체감이 너무 크지 않도록 낮은 확률 보너스
    if (tier >= 8 && Math.random() < 0.35) rewards.weapon += 1;
    if (tier >= 8 && Math.random() < 0.35) rewards.armor += 1;
    if (tier >= 9 && Math.random() < 0.28) rewards.passive += 1;
    return rewards;
  }
  function rewardTextFromTickets(rw) {
    const parts = [];
    if (rw.weapon) parts.push(`무기 ${rw.weapon}장`);
    if (rw.armor) parts.push(`방어구 ${rw.armor}장`);
    if (rw.skill) parts.push(`스킬 ${rw.skill}장`);
    if (rw.passive) parts.push(`패시브 ${rw.passive}장`);
    return parts.length ? '획득 티켓: ' + parts.join(' / ') : '이번 클리어에서는 뽑기권이 나오지 않았습니다.';
  }

  function endRaid(clear){
    state.screen='result';
    const elapsed=Math.floor(state.raid.elapsed*1000);
    let rewardText='';
    if(clear){
      const b=getBoss(boss.id);
      const rw = rollBossTicketRewards(b);
      state.save.tickets.weapon = (state.save.tickets.weapon || 0) + rw.weapon;
      state.save.tickets.armor = (state.save.tickets.armor || 0) + rw.armor;
      state.save.tickets.skill = (state.save.tickets.skill || 0) + rw.skill;
      state.save.tickets.passive = (state.save.tickets.passive || 0) + rw.passive;
      rewardText = rewardTextFromTickets(rw);
      saveGame();
      submitRecord(elapsed);
    }
    ui.right.classList.remove('hidden');
    ui.right.innerHTML=`<h1 class="title">${clear?'클리어!':'실패'}</h1><p class="sub">${boss.name}<br>시간: ${formatMs(elapsed)}<br>받은 피해: ${player.damageTaken}<br>${clear?rewardText:'보스를 다시 분석해보세요.'}</p><button id="resultMenu" class="btn">메뉴로</button>`;
    ui.right.querySelector('#resultMenu').onclick=()=>{state.menuTab=clear?'ranking':'build'; renderMenu(); refreshRankings(boss.id);};
  }


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
  function drawWeaponShape(c,w,scale){
    c.save();
    c.scale(scale, scale);
    c.lineCap='round';
    c.lineJoin='round';
    const k = w.kind || 'sword';
    const rare = rarityFxMul(w.rarity);
    const glow = 10 + rare * 5;
    c.shadowColor = w.color;
    c.shadowBlur = glow;

    function outlineStroke(width){ c.strokeStyle='#020617'; c.lineWidth=width; }
    function metalStroke(width){ c.strokeStyle=w.color; c.lineWidth=width; }
    function brightStroke(width){ c.strokeStyle='rgba(255,255,255,.88)'; c.lineWidth=width; }

    if(k === 'gunstaff'){
      // V16: 마도권총은 더 이상 스태프처럼 보이지 않게, 권총 실루엣으로 그림.
      c.fillStyle='#020617';
      roundRect(c,-7,-8,42,16,5); c.fill();
      roundRect(c,28,-6,26,12,5); c.fill();
      c.fillStyle=w.color;
      roundRect(c,-4,-5,37,10,4); c.fill();
      c.fillStyle='rgba(255,255,255,.82)';
      roundRect(c,7,-3,13,3,2); c.fill();
      c.fillStyle='#111827';
      c.save(); c.translate(8,8); c.rotate(.38); roundRect(c,-3,-2,18,7,3); c.fill(); c.restore();
      c.strokeStyle=w.color; c.lineWidth=2; circleStroke(c,54,0,7+rare*1.2);
      c.fillStyle=w.color; circle(c,55,0,3+rare*.45);
      if(rare>=2){ c.globalAlpha=.75; c.strokeStyle=w.color; c.lineWidth=1.5; circleStroke(c,55,0,14+rare*2); c.globalAlpha=1; }
    } else if(k.includes('bow')){
      outlineStroke(7); c.beginPath(); c.arc(17,0,29,-1.30,1.30); c.stroke();
      metalStroke(4); c.beginPath(); c.arc(17,0,28,-1.30,1.30); c.stroke();
      brightStroke(1.5); c.beginPath(); c.moveTo(31,-27); c.lineTo(31,27); c.stroke();
      c.fillStyle='#e5e7eb'; c.beginPath(); c.moveTo(7,0); c.lineTo(49,-3); c.lineTo(49,3); c.closePath(); c.fill();
      c.fillStyle=w.color; polygon(c,54,0,7+rare,3); c.fill();
      if(k.includes('storm')){ c.strokeStyle='#fde047'; c.lineWidth=2; c.beginPath(); c.moveTo(20,-16); c.lineTo(28,-4); c.lineTo(21,2); c.lineTo(34,18); c.stroke(); }
    } else if(k.includes('staff')){
      outlineStroke(8); c.beginPath(); c.moveTo(-9,24); c.lineTo(23,-29); c.stroke();
      metalStroke(4); c.stroke();
      c.fillStyle='#020617'; circle(c,27,-34,12+rare*1.2);
      c.fillStyle=w.color; circle(c,27,-34,8+rare*1.5);
      brightStroke(2); circleStroke(c,27,-34,16+rare*2.2);
      c.strokeStyle=w.color; c.lineWidth=1.5; c.beginPath(); c.arc(27,-34,24+rare*2,0,Math.PI*2); c.stroke();
      if(k.includes('ice')){ c.fillStyle='#e0f2fe'; polygon(c,27,-34,15,6); c.fill(); }
    } else if(k==='grimoire'){
      c.fillStyle='#020617'; roundRect(c,-9,-22,40,44,6); c.fill();
      c.fillStyle=w.color; roundRect(c,-5,-18,34,36,5); c.fill();
      c.fillStyle='rgba(255,255,255,.16)'; c.fillRect(12,-17,2,34);
      brightStroke(1.5); c.beginPath(); c.arc(20,0,7+rare,0,Math.PI*2); c.stroke();
      c.fillStyle='#fff'; circle(c,20,0,2.5+rare*.35);
    } else if(k==='whip'){
      c.strokeStyle='#020617'; c.lineWidth=7; c.beginPath(); c.moveTo(-4,0); for(let i=1;i<10;i++) c.lineTo(i*12,Math.sin(i*1.15+state.time*10)*12); c.stroke();
      c.strokeStyle=w.color; c.lineWidth=4; c.beginPath(); c.moveTo(-4,0); for(let i=1;i<10;i++) c.lineTo(i*12,Math.sin(i*1.15+state.time*10)*12); c.stroke();
      c.fillStyle='#111827'; roundRect(c,-11,-5,16,10,4); c.fill();
      for(let i=3;i<9;i+=2){ c.fillStyle=i%4?w.color:'#fff'; circle(c,i*12,Math.sin(i*1.15+state.time*10)*12,2+rare*.4); }
    } else if(k==='dagger'){
      c.fillStyle='#020617'; c.beginPath(); c.moveTo(-5,0); c.lineTo(42,-13); c.lineTo(30,9); c.closePath(); c.fill();
      c.fillStyle=w.color; c.beginPath(); c.moveTo(1,0); c.lineTo(39,-9); c.lineTo(28,5); c.closePath(); c.fill();
      c.fillStyle='#fff'; c.beginPath(); c.moveTo(7,-1); c.lineTo(30,-6); c.lineTo(24,1); c.closePath(); c.fill();
      c.fillStyle='#111827'; roundRect(c,-10,-8,10,16,3); c.fill();
      if(rare>=2.4){ c.globalAlpha=.55; c.fillStyle=w.color; c.beginPath(); c.moveTo(8,10); c.lineTo(34,4); c.lineTo(24,17); c.closePath(); c.fill(); c.globalAlpha=1; }
    } else if(k==='greatsword'){
      c.fillStyle='#020617'; c.beginPath(); c.moveTo(-3,-14); c.lineTo(67,-10); c.lineTo(75,0); c.lineTo(67,10); c.lineTo(-3,14); c.closePath(); c.fill();
      c.fillStyle=w.color; c.beginPath(); c.moveTo(3,-9); c.lineTo(62,-7); c.lineTo(68,0); c.lineTo(62,7); c.lineTo(3,9); c.closePath(); c.fill();
      c.fillStyle='rgba(255,255,255,.76)'; c.beginPath(); c.moveTo(14,-4); c.lineTo(58,-3); c.lineTo(52,2); c.lineTo(14,3); c.closePath(); c.fill();
      c.fillStyle='#111827'; roundRect(c,-12,-17,12,34,4); c.fill();
      if(rare>=2){ c.strokeStyle=w.color; c.lineWidth=2; c.beginPath(); c.moveTo(4,-18); c.lineTo(72,-16); c.stroke(); }
    } else if(k==='scythe'){
      outlineStroke(7); c.beginPath(); c.moveTo(-2,24); c.lineTo(42,-26); c.stroke();
      metalStroke(4); c.stroke();
      outlineStroke(6); c.beginPath(); c.arc(47,-28,26,.05,2.85); c.stroke();
      metalStroke(4); c.beginPath(); c.arc(47,-28,25,.05,2.85); c.stroke();
      brightStroke(1.5); c.beginPath(); c.arc(47,-28,16,.15,2.25); c.stroke();
    } else if(k==='chakram'){
      outlineStroke(8); c.beginPath(); c.arc(25,0,24,0,Math.PI*2); c.stroke();
      metalStroke(5); c.beginPath(); c.arc(25,0,23,0,Math.PI*2); c.stroke();
      brightStroke(2); c.beginPath(); c.arc(25,0,12,0,Math.PI*2); c.stroke();
      for(let i=0;i<6;i++){ c.save(); c.translate(25,0); c.rotate(i*Math.PI/3); c.fillStyle=i%2?w.color:'#fff'; c.fillRect(10,-2,18,4); c.restore(); }
    } else if(k==='pole'){
      outlineStroke(8); c.beginPath(); c.moveTo(-13,0); c.lineTo(70,0); c.stroke();
      metalStroke(4); c.stroke();
      c.fillStyle='#e5e7eb'; c.beginPath(); c.moveTo(75,0); c.lineTo(58,-11); c.lineTo(62,0); c.lineTo(58,11); c.closePath(); c.fill();
      c.fillStyle=w.color; roundRect(c,40,-6,18,12,4); c.fill();
      if(rare>=2.2){ c.strokeStyle=w.color; c.lineWidth=2; circleStroke(c,53,0,16+rare); }
    } else {
      // sword and elemental sword variants
      c.fillStyle='#020617'; c.beginPath(); c.moveTo(-5,0); c.lineTo(58,-15); c.lineTo(49,12); c.closePath(); c.fill();
      c.fillStyle=w.color; c.beginPath(); c.moveTo(1,0); c.lineTo(54,-10); c.lineTo(45,8); c.closePath(); c.fill();
      c.fillStyle='rgba(255,255,255,.78)'; c.beginPath(); c.moveTo(12,-1); c.lineTo(45,-7); c.lineTo(40,1); c.lineTo(14,3); c.closePath(); c.fill();
      c.fillStyle='#111827'; roundRect(c,-11,-11,12,22,3); c.fill();
      if(k.includes('fire')){ c.fillStyle='rgba(251,113,133,.55)'; circle(c,52,-8,6+rare); }
    }
    if(rare>=2.3){ c.globalAlpha=.55; c.strokeStyle=w.color; c.lineWidth=1.5; circleStroke(c,22,0,31+rare*3); c.globalAlpha=1; }
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
      nickname: () => changeNickname(),
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
  /* =========================================================
     V18 PATCH: weapon balance boost + boss-specific mechanics
     - Uploaded pattern notes reflected as readable/parryable mechanics
     - Each boss now has a stronger identity and different gimmick
  ========================================================= */

  try { applyV18Tuning(); } catch(e) { console.warn('[RaidDungeon V18 tuning failed]', e); }

  function applyV18Tuning(){
    // V18: 평타가 너무 약하다는 피드백 반영. 스킬을 넘지 않게 하되 보조 딜이 체감되도록 상향.
    WEAPONS.forEach(w=>{
      if(w._v18Tuned) return;
      const k=String(w.kind||'');
      const ranged = k.includes('staff') || k.includes('bow') || ['gunstaff','scythe','chakram','grimoire'].includes(k);
      const meleeFast = k==='dagger';
      const heavy = k==='greatsword' || k==='scythe';
      const mid = k==='sword' || k==='sword_fire' || k==='pole' || k==='whip';
      const mul = ranged ? 1.72 : meleeFast ? 2.05 : heavy ? 1.68 : mid ? 2.12 : 1.95;
      w.atk = Number((w.atk * mul).toFixed(4));
      // 원거리 무기는 쿨이 너무 짧아지지 않게 유지, 근거리만 살짝 더 쾌적하게.
      if(!ranged && !heavy) w.speed = Math.max(0.075, w.speed * 0.92);
      if(ranged) w.speed = Math.max(w.speed, k.includes('bow') ? 0.28 : 0.42);
      w._v18Tuned = true;
    });

    // 던전 선택 화면에서도 보스의 정체성이 보이도록 설명/칩 갱신.
    const notes = {
      slime_king:['점프 착지', '젤리 장판', '방울 유도'],
      ember_tyrant:['불씨 설치', '용암 십자', '그을음 안전지대'],
      thorn_queen:['가시 미로', '독꽃 관리', '꽃봉오리 폭발'],
      frost_oracle:['빙벽 숨기', '얼음창 줄 피하기', '해동 룬'],
      sand_reaper:['모래 감속', '낫 원형 베기', '매몰 폭발'],
      void_serpent:['공허 포탈', '추적 구체', '도넛 균열'],
      iron_minotaur:['돌진 유도', '구르기 카운터', '갑옷 파괴'],
      blood_moon:['혈월 표식', '흡혈 칼날', '저체력 광폭'],
      storm_colossus:['낙뢰 기둥', '전류 격자', '회전 번개 레이저'],
      plague_doctor:['독안개', '해독 룬', '감염 지대'],
      mirror_duelist:['진짜 분신 찾기', '반사 레이저', '거울 베기'],
      gravity_core:['중력 흡입', '도넛 압축', '역중력 탄막'],
      solar_dragon:['일식 그림자', '태양 광선', '낙하 유성'],
      chrono_dragon:['시간 감속', '지연 탄막', '되감기 룬'],
      abyss_leviathan:['파도 장벽', '소용돌이 흡입', '심해 해일'],
      puppet_emperor:['실 조종', '거짓 안전지대', '단두대 선'],
      black_sun:['검은 일식', '태양 낙하', '즉사 안전지대'],
      chaos_archon:['복합 기믹', '무작위 속성', '혼돈 심판']
    };
    BOSSES.forEach(b=>{ if(notes[b.id]) b.patterns=notes[b.id]; });
    if(state && state.screen!=='raid' && typeof renderMenu==='function') setTimeout(()=>{try{renderMenu();}catch(e){}},0);
  }

  function getBossPatternCooldown(){
    // V18: 보스가 마구 난사하지 않도록 쿨타임을 조금 늘리고, 후반 보스는 '묵직한 기믹' 위주로 설계.
    const phaseMul = boss.phase===3 ? .66 : boss.phase===2 ? .82 : 1;
    const tierBase = Math.max(.72, 3.25 - boss.tier*.17);
    return tierBase * phaseMul + Math.random()*(.55 - Math.min(.30,boss.tier*.022));
  }

  function bossPattern(){
    boss.mechanicText='';
    const map={
      slime_king:slimeKingV18,
      ember_tyrant:emberTyrantV18,
      thorn_queen:thornQueenV18,
      frost_oracle:frostOracleV18,
      sand_reaper:sandReaperV18,
      void_serpent:voidSerpentV18,
      iron_minotaur:ironMinotaurV18,
      blood_moon:bloodMoonV18,
      storm_colossus:stormColossusV18,
      plague_doctor:plagueDoctorV18,
      mirror_duelist:mirrorDuelistV18,
      gravity_core:gravityCoreV18,
      solar_dragon:solarDragonV18,
      chrono_dragon:chronoDragonV18,
      abyss_leviathan:abyssLeviathanV18,
      puppet_emperor:puppetEmperorV18,
      black_sun:blackSunV18,
      chaos_archon:chaosArchonV18
    };
    (map[boss.id] || slimeKingV18)();
    // 보조 패턴은 너무 많이 겹치지 않게 제한. 최상위도 피할 틈은 유지.
    if(boss.tier>=6 && Math.random()<.20) setTimeout(()=>secondaryPattern(false),760);
    if(boss.tier>=9 && boss.phase>=3 && Math.random()<.08) setTimeout(()=>instantKillPattern(),1900);
  }

  function slimeKingV18(){
    boss.mechanicText='젤리 왕: 착지 원을 보고 빠진 뒤, 남는 젤리 장판을 밟지 마세요.';
    warningCircle(player.x,player.y,58+boss.phase*8,.78,'#7ddf64',boss.atk*.75,'',null,'slime');
    for(let i=0;i<3+boss.phase;i++) setTimeout(()=>{
      if(!state.raid||boss.dead) return;
      state.zones.push({x:rand(95,W-95),y:rand(130,H-75),r:42+boss.phase*4,damage:boss.atk*.045,life:2.2,tick:0,color:'#a7f3d0',enemy:true,dot:true});
    }, i*180);
    radialBullets(boss.x,boss.y,7+boss.phase*2,120+boss.phase*35,'#dbffb6',boss.atk*.28);
  }

  function emberTyrantV18(){
    boss.mechanicText='이그니스: 불씨가 깔린 뒤 십자 화염이 터집니다. 빈 대각선으로 빠지세요.';
    for(let i=0;i<4+boss.phase;i++) warningCircle(rand(100,W-100),rand(120,H-90),38+boss.phase*5,.90+i*.06,'#fb7185',boss.atk*.72,'',null,'fire');
    setTimeout(()=>{
      if(!state.raid||boss.dead) return;
      const px=player.x, py=player.y;
      state.hazards.push({kind:'beam',x:px,y:py,angle:0,len:W*1.4,w:26+boss.phase*4,warn:.55,life:.24,damage:boss.atk*.85,color:'#f97316',tag:'fire'});
      state.hazards.push({kind:'beam',x:px,y:py,angle:Math.PI/2,len:H*1.8,w:26+boss.phase*4,warn:.55,life:.24,damage:boss.atk*.85,color:'#f97316',tag:'fire'});
    },520);
    if(boss.phase>=2) state.zones.push({x:boss.x,y:boss.y+85,r:76,damage:boss.atk*.055,life:2.6,tick:0,color:'#ef4444',enemy:true,dot:true});
  }

  function thornQueenV18(){
    boss.mechanicText='로제리아: 가시 미로의 빈틈을 찾고 독꽃이 피기 전에 위치를 바꾸세요.';
    const gapX=rand(210,W-210);
    for(let i=0;i<7;i++){
      const x=95+i*(W-190)/6;
      if(Math.abs(x-gapX)>90) state.hazards.push({kind:'wall',x,y:H/2,w:18,h:H-160,r:0,warn:.75,life:1.05,damage:boss.atk*.65,color:'#22c55e',tag:'poison'});
    }
    for(let i=0;i<3+boss.phase;i++) setTimeout(()=>{
      if(!state.raid||boss.dead) return;
      const x=rand(100,W-100), y=rand(130,H-80);
      state.zones.push({x,y,r:48+boss.phase*5,damage:boss.atk*.06,life:2.8,tick:0,color:'#84cc16',enemy:true,dot:true});
      radialBullets(x,y,8,130,'#f472b6',boss.atk*.22);
    },i*280);
  }

  function frostOracleV18(){
    boss.mechanicText='네이아: 푸른 빙벽 뒤로 숨어 눈보라를 피하고, 얼음창 줄을 읽으세요.';
    const safeX=rand(135,W-135), safeY=rand(150,H-95), safeR=66;
    state.mechanics.push({kind:'safe',x:safeX,y:safeY,r:safeR,life:1.65,color:'#93c5fd'});
    setTimeout(()=>{
      if(!state.raid||boss.dead) return;
      if(dist(player.x,player.y,safeX,safeY)>safeR+player.r) hurtPlayer(boss.atk*1.55,'#7dd3fc'); else { breakBoss(.9); healText('빙벽 회피',player.x,player.y-34); }
      burst(safeX,safeY,'#93c5fd',34,250);
    },1650);
    for(let i=-2;i<=2;i++) state.hazards.push({kind:'beam',x:boss.x,y:boss.y,angle:Math.atan2(player.y-boss.y,player.x-boss.x)+i*.20,len:900,w:18,warn:.82+(i+2)*.06,life:.22,damage:boss.atk*.58,color:'#bae6fd',tag:'ice'});
    if(boss.phase>=2) spawnRune('#a5f3fc','break');
  }

  function sandReaperV18(){
    boss.mechanicText='샤하르: 모래폭풍으로 느려진 상태에서 낫 원형 베기와 매몰 원을 피하세요.';
    player.slow=Math.max(player.slow,1.25+boss.phase*.25);
    donutPattern(boss.phase>=2);
    for(let i=0;i<4+boss.phase;i++) warningCircle(rand(90,W-90),rand(120,H-70),34+boss.phase*5,.75+i*.08,'#f59e0b',boss.atk*.62,'',null,'sand');
    setTimeout(()=>coneBullets(Math.atan2(player.y-boss.y,player.x-boss.x),1.45,9+boss.phase*2,260+boss.phase*20,'#fde68a',boss.atk*.36),550);
  }

  function voidSerpentV18(){
    boss.mechanicText='노크스: 포탈 사이의 공허 선을 피하고, 추적 구체를 오래 끌지 마세요.';
    const p1={x:rand(120,W/2-80),y:rand(140,H-90)}, p2={x:rand(W/2+80,W-120),y:rand(140,H-90)};
    burst(boss.x,boss.y,'#8b5cf6',26,220); boss.x=rand(130,W-130); boss.y=rand(105,H-210); burst(boss.x,boss.y,'#8b5cf6',36,260);
    const a=Math.atan2(p2.y-p1.y,p2.x-p1.x), len=dist(p1.x,p1.y,p2.x,p2.y);
    state.hazards.push({kind:'beam',x:(p1.x+p2.x)/2,y:(p1.y+p2.y)/2,angle:a,len,w:24,warn:1.05,life:.35,damage:boss.atk*1.0,color:'#a78bfa',tag:'void'});
    state.zones.push({x:player.x,y:player.y,r:56,damage:boss.atk*.055,life:2.1,tick:0,color:'#7c3aed',enemy:true,dot:true});
    for(let i=0;i<2+boss.phase;i++) homingEnemy('#a78bfa');
  }

  function ironMinotaurV18(){
    boss.mechanicText='미노타우로스: 돌진선을 보고 구르기로 통과하면 갑옷이 깨져 BREAK 됩니다.';
    const a=Math.atan2(player.y-boss.y,player.x-boss.x);
    state.hazards.push({kind:'beam',x:boss.x,y:boss.y,angle:a,len:980,w:42,warn:1.05,life:.30,damage:boss.atk*1.25,color:'#e5e7eb',tag:'metal',callback:()=>{ if(player.roll>0) breakBoss(1.8); }});
    setTimeout(()=>{ if(state.raid&&!boss.dead) radialBullets(boss.x,boss.y,12,185,'#94a3b8',boss.atk*.30); },1180);
    if(boss.phase>=3) crossLaserPattern(false);
  }

  function bloodMoonV18(){
    boss.mechanicText='루나: 혈월 표식은 떨어져서 터뜨리고, 저체력 광폭 칼날은 정면을 피하세요.';
    chaseMarkerPattern(boss.phase>=2);
    const a=Math.atan2(player.y-boss.y,player.x-boss.x);
    for(let i=-2;i<=2;i++) state.hazards.push({kind:'beam',x:boss.x,y:boss.y,angle:a+i*.18,len:760,w:18,warn:.68+(i+2)*.07,life:.22,damage:boss.atk*.62,color:'#fb7185',tag:'blood'});
    if(boss.hp/boss.maxHp<.35) rotatingCurtainPattern(false);
  }

  function stormColossusV18(){
    boss.mechanicText='아스트라: 낙뢰 기둥 사이 빈칸을 찾고, 회전 레이저는 방향을 보고 따라 피하세요.';
    const lanes=5;
    const safeLane=Math.floor(Math.random()*lanes);
    for(let i=0;i<lanes;i++){
      if(i===safeLane) continue;
      const x=120+i*(W-240)/(lanes-1);
      state.hazards.push({kind:'beam',x,y:H/2,angle:Math.PI/2,len:H*1.25,w:30,warn:1.0,life:.25,damage:boss.atk*.86,color:'#fde047',tag:'lightning'});
    }
    for(let i=0;i<3+boss.phase;i++) warningCircle(rand(90,W-90),rand(120,H-80),27+boss.phase*3,.65+i*.08,'#facc15',boss.atk*.55,'',null,'lightning');
    if(boss.phase>=2) rotatingLaserSweep(false);
    if(boss.phase>=3) spawnRune('#fde047','break');
  }

  function plagueDoctorV18(){
    boss.mechanicText='모르비드: 독안개 안에서는 버티기 어렵습니다. 해독 룬을 밟아 상태를 풀어야 합니다.';
    state.zones.push({x:W/2,y:H/2,r:190+boss.phase*20,damage:boss.atk*.065,life:3.2,tick:0,color:'#84cc16',enemy:true,dot:true});
    spawnRune('#bef264','cleanse');
    for(let i=0;i<10+boss.phase*2;i++) setTimeout(()=>aimBullet(boss.x,boss.y,player.x+rand(-160,160),player.y+rand(-120,120),235+boss.phase*18,'#bef264',boss.atk*.32,'poison'),i*75);
    if(boss.phase>=3) safeRuneBombPattern(false);
  }

  function mirrorDuelistV18(){
    boss.mechanicText='세렌: 밝게 빛나는 진짜 분신을 찾고, 거울 레이저의 순서를 외워 피하세요.';
    boss.clones=[]; boss.realIndex=Math.floor(Math.random()*5);
    for(let i=0;i<5;i++) boss.clones.push({x:170+i*(W-340)/4,y:140+rand(-10,70),real:i===boss.realIndex,life:2.8});
    staggeredLineStrikes('#f0abfc','mirror');
    setTimeout(()=>radialBullets(boss.x,boss.y,14+boss.phase*4,190+boss.phase*18,'#e879f9',boss.atk*.32),580);
    if(boss.phase>=2) crossLaserPattern(false);
  }

  function gravityCoreV18(){
    boss.mechanicText='아틀라스: 중심으로 빨려 들어갑니다. 도넛 압축은 안/밖 위치를 번갈아 판단하세요.';
    state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:300,life:2.8+boss.phase*.25,power:230+boss.phase*25,color:'#818cf8'});
    donutPattern(true);
    setTimeout(()=>warningCircle(W/2,H/2,92,1.0,'#818cf8',boss.atk*1.35,'',null,'gravity'),550);
    if(boss.phase>=2) for(let i=0;i<3;i++) homingEnemy('#c4b5fd');
  }

  function solarDragonV18(){
    boss.mechanicText='솔라리온: 일식 그림자 안에서 태양 심판을 피하고, 이후 낙하 유성을 피하세요.';
    const sx=rand(135,W-135), sy=rand(145,H-95), safeR=62;
    state.mechanics.push({kind:'safe',x:sx,y:sy,r:safeR,life:1.55,color:'#0f172a'});
    setTimeout(()=>{ if(!state.raid||boss.dead)return; if(dist(player.x,player.y,sx,sy)>safeR+player.r) hurtPlayer(boss.atk*1.8,'#f97316'); else breakBoss(.9); burst(sx,sy,'#f97316',55,330); },1550);
    for(let i=0;i<5+boss.phase;i++) warningCircle(rand(90,W-90),rand(110,H-75),34+boss.phase*5,.95+i*.08,'#fb923c',boss.atk*.65,'',null,'fire');
    if(boss.phase>=3) rotatingLaserSweep(false);
  }

  function chronoDragonV18(){
    boss.mechanicText='크로노스: 느려진 상태에서 지연 탄막이 뒤늦게 옵니다. 미리 움직여 공간을 만드세요.';
    player.slow=Math.max(player.slow,1.6+boss.phase*.25);
    spawnRune('#f472b6','break');
    for(let wave=0;wave<4;wave++) setTimeout(()=>radialBullets(boss.x,boss.y,7+boss.phase*2,150+wave*28,'#fef08a',boss.atk*.24,wave*.08),wave*350);
    setTimeout(()=>crossLaserPattern(false),850);
    if(boss.phase>=3) safeRuneBombPattern(false);
  }

  function abyssLeviathanV18(){
    boss.mechanicText='아비스: 파도 장벽은 빈 틈으로 지나가고, 소용돌이 흡입에 휘말리지 마세요.';
    const gap=rand(145,H-110);
    for(let i=0;i<6;i++){
      const y=110+i*82;
      if(Math.abs(y-gap)>55) state.hazards.push({kind:'wall',x:W/2,y,w:W*.92,h:22,r:0,warn:.95,life:.36,damage:boss.atk*.78,color:'#38bdf8',tag:'ice'});
    }
    state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:230,life:2.2,power:150+boss.phase*20,color:'#38bdf8'});
    for(let i=0;i<3+boss.phase;i++) homingEnemy('#7dd3fc');
    if(boss.phase>=3) safeRuneBombPattern(true);
  }

  function puppetEmperorV18(){
    boss.mechanicText='마리오네트: 조종 실이 맵을 자릅니다. 거짓 안전지대에 속지 말고 진짜 빈칸을 찾으세요.';
    for(let i=0;i<4+boss.phase;i++){
      const vertical=Math.random()<.5;
      state.hazards.push({kind:'beam',x:vertical?rand(120,W-120):W/2,y:vertical?H/2:rand(125,H-80),angle:vertical?Math.PI/2:0,len:vertical?H*1.4:W*1.3,w:18,warn:.9+i*.08,life:.30,damage:boss.atk*.72,color:'#f0abfc',tag:'mirror'});
    }
    // 가짜 안전지대: 보이긴 하지만 실제 판정은 없음. 진짜는 하나만 생성.
    for(let i=0;i<2;i++) state.mechanics.push({kind:'safe',x:rand(110,W-110),y:rand(135,H-90),r:42,life:.85,color:'#ef4444'});
    safeRuneBombPattern(true);
  }

  function blackSunV18(){
    boss.mechanicText='아포칼립스: 검은 일식은 SAFE 안에서만 생존합니다. 이후 태양 낙하가 이어집니다.';
    instantKillPattern();
    setTimeout(()=>{ if(!state.raid||boss.dead)return; for(let i=0;i<7;i++) warningCircle(rand(85,W-85),rand(110,H-70),40+boss.phase*5,.65+i*.07,'#f97316',boss.atk*.78,'',null,'fire'); },700);
    if(boss.phase>=2) setTimeout(()=>rotatingLaserSweep(false),1150);
  }

  function chaosArchonV18(){
    boss.mechanicText='카이로스: 여러 보스의 핵심 기믹이 섞입니다. 먼저 화면의 안내 문구를 읽으세요.';
    const funcs=[stormColossusV18, gravityCoreV18, mirrorDuelistV18, chronoDragonV18, solarDragonV18, abyssLeviathanV18, puppetEmperorV18];
    funcs[Math.floor(Math.random()*funcs.length)]();
    if(boss.phase>=2) setTimeout(()=>secondaryPattern(false),1050);
    if(boss.phase>=3 && Math.random()<.10) setTimeout(()=>instantKillPattern(),2100);
  }


  /* =========================================================
     V19 PATCH - 상태이상 멈춤 수정 / 네온 실공격 / 후반 기믹형 패턴 강화
     - 빙결/마비는 완전 정지가 아니라 강한 둔화 + 스킬/정화 가능 상태로 변경
     - 경고 장판은 반투명, 실제 공격은 네온 사인처럼 선명하게 표시
     - 후반 보스 전용 미니게임/미로/소환수/부서지는 바닥 기믹 추가
  ========================================================= */

  function v19StatusMovePenalty(){
    const st = player && player.statuses ? player.statuses : {};
    let mul = 1;
    if((st.slow||0)>0 || player.slow>0) mul *= .58;
    if((st.freeze||0)>0) mul *= .42;
    if((st.paralysis||0)>0) mul *= .38;
    return clamp(mul, .24, 1);
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

    // V19: 빙결/마비로 캐릭터가 완전히 멈춰 게임이 정지된 것처럼 보이던 문제 수정.
    // 이제 강한 둔화만 적용하고, 이동/구르기/정화 스킬은 계속 사용할 수 있다.
    const moveSpeed = player.speed * v19StatusMovePenalty();
    player.x+=dx/len*moveSpeed*dt;
    player.y+=dy/len*moveSpeed*dt;
    if(player.roll>0){ player.x += player.rollVx*dt; player.y += player.rollVy*dt; }
    player.x=clamp(player.x,42,W-42); player.y=clamp(player.y,90,H-42);
    player.invuln=Math.max(0,player.invuln-dt); player.slow=Math.max(0,player.slow-dt); player.roll=Math.max(0,player.roll-dt); player.rollCd=Math.max(0,player.rollCd-dt); player.basicCd=Math.max(0,player.basicCd-dt); player.attackAnim=Math.max(0,(player.attackAnim||0)-dt); player.skillCd=player.skillCd.map(v=>Math.max(0,v-dt)); player.anim+=dt; player.hp=Math.min(player.maxHp,player.hp+player.regen*dt);
    if(player.regen5>0){ player.regen5Tick=(player.regen5Tick||0)+dt; if(player.regen5Tick>=5){ player.regen5Tick-=5; player.hp=Math.min(player.maxHp,player.hp+player.regen5); healText('5초 회복 +'+Math.floor(player.regen5),player.x,player.y-44); } }
    if(keys.has(' ')&&player.rollCd<=0){
      let rx=dx, ry=dy;
      if(!rx&&!ry){ rx=Math.cos(player.aim||0); ry=Math.sin(player.aim||0); }
      const rl=Math.hypot(rx,ry)||1; rx/=rl; ry/=rl;
      player.roll=.22; player.rollCd=Math.max(.45,1.25-(player.rollCdBonus||0)); player.invuln=Math.max(player.invuln,.30); player.rollVx=rx*900; player.rollVy=ry*900; player.aim=Math.atan2(ry,rx); if(rx<0)player.face=-1; if(rx>0)player.face=1;
      for(let i=0;i<10;i++) state.particles.push({x:player.x-rx*i*7,y:player.y-ry*i*7,vx:-rx*rand(60,180)+rand(-30,30),vy:-ry*rand(60,180)+rand(-30,30),r:4+i*.25,life:.18+i*.025,color:'#93c5fd'});
      burst(player.x,player.y,'#93c5fd',28,290); floatText('ROLL',player.x,player.y-26,'#93c5fd');
    }
  }

  function applyBossHitStatus(tag){
    const st = player.statuses || (player.statuses={burn:0,poison:0,freeze:0,paralysis:0,slow:0});
    const resist = player.statusResist || {};
    function blocked(k){ return Math.random() < clamp(resist[k] || 0, 0, .85); }
    if((tag==='slow'||tag==='sand'||tag==='chrono'||tag==='gravity') && !blocked('slow')) { st.slow=Math.max(st.slow,1.8); player.slow=Math.max(player.slow,1.8); floatText('감속',player.x,player.y-38,'#cbd5e1',14); }
    if((tag==='fire'||tag==='solar') && !blocked('burn')) { st.burn=Math.max(st.burn,2.6); floatText('화상',player.x,player.y-38,'#fb7185',14); }
    if(tag==='poison' && !blocked('poison')) { st.poison=Math.max(st.poison,3.6); floatText('독',player.x,player.y-38,'#bef264',14); }
    if(tag==='ice' && !blocked('freeze')) { st.freeze=Math.max(st.freeze,.95); floatText('빙결 둔화',player.x,player.y-38,'#bae6fd',14); }
    if(tag==='lightning' && !blocked('paralysis')) { st.paralysis=Math.max(st.paralysis,.75); floatText('마비 둔화',player.x,player.y-38,'#fde047',14); }
  }

  function drawHazards(){
    state.hazards.forEach(h=>{
      ctx.save();
      const warning = h.warn > 0;
      const c = h.color || '#fff';
      ctx.strokeStyle = c; ctx.fillStyle = c;
      if(warning){
        // 반투명 예고: 실제 공격 위치를 미리 보여주는 역할만 한다.
        ctx.globalAlpha = .18 + .08*Math.sin(state.time*10);
        ctx.shadowBlur = 0;
        ctx.lineWidth = 3;
      } else {
        // 실제 공격: 네온 사인처럼 강하게 보이도록 처리.
        ctx.globalAlpha = .86;
        ctx.shadowColor = c;
        ctx.shadowBlur = 22;
        ctx.lineWidth = 5;
      }
      if(h.kind==='circle'||h.kind==='playerStrike'){
        if(warning){ circle(ctx,h.x,h.y,h.r); ctx.globalAlpha=.72; circleStroke(ctx,h.x,h.y,h.r); ctx.font='900 13px system-ui'; ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.fillText(h.label||'예고',h.x,h.y+4); }
        else { ctx.globalAlpha=.32; circle(ctx,h.x,h.y,h.r); ctx.globalAlpha=.98; circleStroke(ctx,h.x,h.y,h.r); ctx.globalAlpha=.70; ctx.lineWidth=12; circleStroke(ctx,h.x,h.y,Math.max(4,h.r-5)); ctx.globalAlpha=1; ctx.fillStyle='#fff'; ctx.font='900 14px system-ui'; ctx.textAlign='center'; ctx.fillText(h.label?'HIT '+h.label:'HIT',h.x,h.y+5); }
      } else if(h.kind==='donut'){
        if(warning){ ctx.globalAlpha=.18; ctx.lineWidth=18; circleStroke(ctx,h.x,h.y,(h.inner+h.outer)/2); ctx.globalAlpha=.72; ctx.lineWidth=3; circleStroke(ctx,h.x,h.y,h.outer); circleStroke(ctx,h.x,h.y,h.inner); }
        else { ctx.globalAlpha=.98; ctx.lineWidth=7; circleStroke(ctx,h.x,h.y,h.outer); circleStroke(ctx,h.x,h.y,h.inner); ctx.globalAlpha=.45; ctx.lineWidth=24; circleStroke(ctx,h.x,h.y,(h.inner+h.outer)/2); }
      } else if(h.kind==='beam'||h.kind==='rotatingBeam'){
        ctx.save(); ctx.translate(h.x,h.y); ctx.rotate(h.angle||0);
        if(warning){ ctx.globalAlpha=.20; roundRect(ctx,-h.len/2,-h.w,h.len,h.w*2,8); ctx.globalAlpha=.70; ctx.strokeStyle=c; ctx.lineWidth=2; ctx.strokeRect(-h.len/2,-h.w,h.len,h.w*2); }
        else { ctx.globalAlpha=.92; roundRect(ctx,-h.len/2,-h.w,h.len,h.w*2,10); ctx.globalAlpha=1; ctx.strokeStyle='#ffffff'; ctx.lineWidth=2; ctx.strokeRect(-h.len/2,-h.w,h.len,h.w*2); ctx.globalAlpha=.62; ctx.strokeStyle=c; ctx.lineWidth=12; ctx.strokeRect(-h.len/2,-h.w*.6,h.len,h.w*1.2); ctx.globalAlpha=1; ctx.fillStyle='#fff'; ctx.font='900 13px system-ui'; ctx.textAlign='center'; ctx.fillText(h.label?'HIT '+h.label:'HIT',0,4); }
        ctx.restore();
      } else if(h.kind==='wall'){
        ctx.globalAlpha = warning ? .18 : .78;
        ctx.fillRect(h.x-h.w/2,h.y-h.h/2,h.w,h.h);
        if(!warning){ ctx.globalAlpha=.95; ctx.strokeStyle='#fff'; ctx.strokeRect(h.x-h.w/2,h.y-h.h/2,h.w,h.h); ctx.fillStyle='#fff'; ctx.font='900 12px system-ui'; ctx.textAlign='center'; ctx.fillText(h.label?'HIT '+h.label:'HIT',h.x,h.y+4); }
      } else if(h.kind==='floor'){
        ctx.globalAlpha = warning ? .14 : .62;
        ctx.fillRect(h.x-h.w/2,h.y-h.h/2,h.w,h.h);
        ctx.globalAlpha = warning ? .50 : .95;
        ctx.strokeStyle = warning ? c : '#fff';
        ctx.strokeRect(h.x-h.w/2,h.y-h.h/2,h.w,h.h);
      }
      ctx.restore();
    });
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
      } else if(h.kind==='floor'){
        if(Math.abs(player.x-h.x)<h.w/2+player.r && Math.abs(player.y-h.y)<h.h/2+player.r){ hurtPlayer(h.damage,h.color); if(h.tag) applyBossHitStatus(h.tag); h.life=0; }
      }
    });
    state.hazards=state.hazards.filter(h=>h && (h.life>0||h.warn>0));
  }

  function drawMechanics(){
    state.mechanics.forEach(m=>{
      ctx.save(); ctx.strokeStyle=m.color; ctx.fillStyle=m.color;
      if(m.kind==='rune'){ctx.globalAlpha=.8; circleStroke(ctx,m.x,m.y,m.r+Math.sin(state.time*8)*4); ctx.font='900 20px system-ui'; ctx.textAlign='center'; ctx.fillText('룬',m.x,m.y+7);}
      if(m.kind==='safe'){ctx.globalAlpha=.30+.12*Math.sin(state.time*10); ctx.fillStyle=m.color; circle(ctx,m.x,m.y,m.r); ctx.globalAlpha=.9; ctx.strokeStyle='#ffffff'; circleStroke(ctx,m.x,m.y,m.r+Math.sin(state.time*8)*5); ctx.font='900 16px system-ui'; ctx.textAlign='center'; ctx.fillStyle='#ffffff'; ctx.fillText(m.fake?'FAKE':'SAFE',m.x,m.y+5);}
      if(m.kind==='gravity'){ctx.globalAlpha=.35; circleStroke(ctx,m.x,m.y,m.r); for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(m.x,m.y,m.r*(i+1)/5,state.time+i,state.time+i+1.2);ctx.stroke();}}
      if(m.kind==='memory'){
        ctx.globalAlpha=.95; ctx.font='900 15px system-ui'; ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.fillText('순서대로 밟기 '+(m.index+1)+' / '+m.nodes.length, W/2, 92);
        m.nodes.forEach((n,i)=>{ ctx.globalAlpha = i < m.index ? .25 : .88; ctx.fillStyle=n.color; circle(ctx,n.x,n.y,n.r); ctx.globalAlpha=.95; ctx.strokeStyle = i===m.index ? '#ffffff' : n.color; circleStroke(ctx,n.x,n.y,n.r+4); ctx.fillStyle='#fff'; ctx.fillText(String(i+1),n.x,n.y+5); });
      }
      if(m.kind==='mazeExit'){ ctx.globalAlpha=.35+.15*Math.sin(state.time*8); ctx.fillStyle=m.color; circle(ctx,m.x,m.y,m.r); ctx.globalAlpha=1; ctx.strokeStyle='#fff'; circleStroke(ctx,m.x,m.y,m.r); ctx.font='900 14px system-ui'; ctx.textAlign='center'; ctx.fillStyle='#fff'; ctx.fillText('탈출',m.x,m.y+5); }
      if(m.kind==='add'){ ctx.globalAlpha=.95; ctx.shadowColor=m.color; ctx.shadowBlur=12; ctx.fillStyle=m.color; circle(ctx,m.x,m.y,m.r); ctx.fillStyle='#fff'; ctx.font='900 11px system-ui'; ctx.textAlign='center'; ctx.fillText('소환수',m.x,m.y-m.r-5); }
      ctx.restore();
    });
  }

  function updateMechanics(dt){
    state.mechanics.forEach(m=>{
      m.life-=dt;
      if(m.kind==='rune'&&dist(m.x,m.y,player.x,player.y)<m.r+player.r){ if(m.action==='break') breakBoss(2.6); if(m.action==='cleanse'){clearPlayerStatuses(); player.slow=0; player.hp=Math.min(player.maxHp,player.hp+120); healText('해독',player.x,player.y-35);} m.life=0; }
      if(m.kind==='gravity'){const a=Math.atan2(m.y-player.y,m.x-player.x); const d=Math.max(60,dist(m.x,m.y,player.x,player.y)); player.x+=Math.cos(a)*m.power/d*80*dt; player.y+=Math.sin(a)*m.power/d*80*dt;}
      if(m.kind==='memory'){
        if(m.life>0){
          m.wrongGrace=Math.max(0,(m.wrongGrace||0)-dt);
          const cur=m.nodes[m.index];
          if(cur && !cur.done && dist(player.x,player.y,cur.x,cur.y)<cur.r+player.r){
            cur.done=true; m.index++; m.wrongGrace=.22;
            burst(cur.x,cur.y,cur.color,26,210); healText('정답 '+m.index,cur.x,cur.y-28);
          }
          // 아직 밟을 차례가 아닌 룬을 밟으면 실패하지만, 정답 처리 직후에는 한 프레임 겹침을 무시한다.
          if(m.wrongGrace<=0){
            m.nodes.forEach((n,i)=>{ if(!n.done && i!==m.index && dist(player.x,player.y,n.x,n.y)<n.r+player.r){ hurtPlayer(boss.atk*.42,n.color,true); m.wrongGrace=.45; floatText('순서 확인!',player.x,player.y-42,'#fb7185',18); } });
          }
          if(m.index>=m.nodes.length){ breakBoss(2.6); m.life=0; floatText('기믹 성공!',W/2,100,'#86efac',22); }
        }
      }
      if(m.kind==='mazeExit' && dist(player.x,player.y,m.x,m.y)<m.r+player.r){ breakBoss(1.8); m.life=0; floatText('미로 탈출!',player.x,player.y-42,'#86efac',20); }
      if(m.kind==='add'){
        const a=Math.atan2(player.y-m.y,player.x-m.x); m.x+=Math.cos(a)*(m.speed||75)*dt; m.y+=Math.sin(a)*(m.speed||75)*dt;
        if(dist(m.x,m.y,player.x,player.y)<m.r+player.r){ hurtPlayer(boss.atk*.38,m.color); m.life=0; burst(m.x,m.y,m.color,20,180); }
      }
    });
    state.mechanics=state.mechanics.filter(m=>m.life>0);
    if(boss.clones&&boss.clones.length){boss.clones.forEach(c=>c.life-=dt); boss.clones=boss.clones.filter(c=>c.life>0);}
  }

  function damageAddsAt(x,y,r,dmg,color){
    let hit=false;
    state.mechanics.forEach(m=>{
      if(m.kind==='add' && dist(x,y,m.x,m.y)<r+m.r){ m.hp=(m.hp||90)-dmg; hit=true; floatText('-'+Math.floor(dmg),m.x,m.y-18,color||'#fff',13); if(m.hp<=0){ m.life=0; burst(m.x,m.y,m.color||color||'#fff',24,200); healText('소환수 제거',m.x,m.y-30); } }
    });
    return hit;
  }
  function damageBossRange(range,dmg,color){ if(damageAddsAt(player.x,player.y,range,dmg,color)) return; if(dist(player.x,player.y,boss.x,boss.y)<range+boss.r) damageBoss(dmg,color,false); }
  function damageBossLine(range,width,angle,dmg,color){
    state.mechanics.forEach(m=>{ if(m.kind==='add'){ const px=m.x-player.x, py=m.y-player.y; const along=px*Math.cos(angle)+py*Math.sin(angle); const side=Math.abs(-px*Math.sin(angle)+py*Math.cos(angle)); if(along>0&&along<range+m.r&&side<width+m.r){ m.hp=(m.hp||90)-dmg; if(m.hp<=0)m.life=0; } }});
    const px=boss.x-player.x, py=boss.y-player.y; const along=px*Math.cos(angle)+py*Math.sin(angle); const side=Math.abs(-px*Math.sin(angle)+py*Math.cos(angle)); if(along>0&&along<range+boss.r&&side<width+boss.r) damageBoss(dmg,color,false);
  }
  function damageBossCone(range,arc,angle,dmg,color){
    state.mechanics.forEach(m=>{ if(m.kind==='add'){ const a=Math.atan2(m.y-player.y,m.x-player.x); const diff=Math.abs(normAngle(a-angle)); if(dist(player.x,player.y,m.x,m.y)<range+m.r && diff<arc/2){ m.hp=(m.hp||90)-dmg; if(m.hp<=0)m.life=0; } }});
    const a=Math.atan2(boss.y-player.y,boss.x-player.x); let diff=Math.abs(normAngle(a-angle)); if(dist(player.x,player.y,boss.x,boss.y)<range+boss.r && diff<arc/2) damageBoss(dmg,color,false);
  }

  function spawnMemoryMiniGame(){
    boss.mechanicText='기억 룬: 숫자 룬을 1 → 2 → 3 순서로 밟으면 BREAK 됩니다. 잘못 밟아도 룬이 즉시 사라지지 않습니다.';
    const colors=['#60a5fa','#f472b6','#facc15'];
    const spots=[{x:W*.23,y:H*.34},{x:W*.78,y:H*.35},{x:W*.50,y:H*.72}];
    // 위치를 살짝 섞되 너무 붙지 않게 고정 기반으로 만든다.
    const nodes=spots.map((p,i)=>({x:clamp(p.x+rand(-55,55),105,W-105),y:clamp(p.y+rand(-40,40),125,H-85),r:42,color:colors[i],done:false}));
    state.mechanics.push({kind:'memory',nodes,index:0,life:9.5,color:'#fff',wrongGrace:0});
    floatText('기억 룬 1→2→3', W/2, 92, '#ffffff', 22);
  }

  function spawnMazeEscape(){
    boss.mechanicText='미로 탈출: 벽이 닫히기 전에 탈출 지점으로 이동하세요.';
    const exit={x:rand(W*.62,W-120),y:rand(140,H-90),r:38,color:'#22c55e'};
    state.mechanics.push({kind:'mazeExit',...exit,life:5.0});
    for(let i=0;i<5;i++){
      const vertical=i%2===0;
      state.hazards.push({kind:'wall',x:vertical?260+i*120:W/2,y:vertical?H/2:150+i*70,w:vertical?18:W*.62,h:vertical?H*.72:18,warn:1.15,life:3.8,damage:boss.atk*.55,color:'#a78bfa',tag:'void'});
    }
  }
  function spawnAddsPhase(){
    boss.mechanicText='소환수 처리: 소환수를 방치하면 계속 압박합니다. 평타나 스킬로 제거하세요.';
    const count=2+Math.min(4,boss.phase+Math.floor(boss.tier/4));
    for(let i=0;i<count;i++) state.mechanics.push({kind:'add',x:rand(90,W-90),y:rand(120,H-80),r:16+boss.phase*2,hp:90+boss.tier*20,life:7.5,speed:58+boss.tier*3,color:boss.sub||boss.color});
  }
  function spawnCrumblingFloor(){
    boss.mechanicText='부서지는 바닥: 전장 전체가 갈라집니다. 안전 칸을 찾아 이동하세요.';
    const cols=6, rows=4, cellW=W/cols, cellH=(H-110)/rows;
    const safe=Math.floor(Math.random()*cols*rows);
    for(let i=0;i<cols*rows;i++){
      const x=cellW*(i%cols+.5), y=105+cellH*(Math.floor(i/cols)+.5);
      if(i===safe){ state.mechanics.push({kind:'safe',x,y,r:Math.min(cellW,cellH)*.30,life:2.0,color:'#86efac'}); continue; }
      state.hazards.push({kind:'floor',x,y,w:cellW*.78,h:cellH*.65,warn:1.50+Math.random()*.30,life:.50,damage:boss.atk*.92,color:boss.color,tag:boss.theme});
    }
  }

  function spawnColorPolarity(){
    boss.mechanicText='양극 색상: 자기 색과 같은 원 안에 있으면 생존합니다.';
    const colors=['#60a5fa','#fb7185'];
    const pick=Math.random()<.5?0:1;
    floatText(pick===0?'파란 색으로!':'붉은 색으로!',W/2,100,colors[pick],24);
    const a={kind:'safe',x:W*.34,y:H*.55,r:62,life:2.0,color:colors[0],fake:pick!==0};
    const b={kind:'safe',x:W*.66,y:H*.55,r:62,life:2.0,color:colors[1],fake:pick!==1};
    state.mechanics.push(a,b);
    setTimeout(()=>{ if(!state.raid||boss.dead)return; const sx=pick===0?a.x:b.x, sy=pick===0?a.y:b.y, sr=62; if(dist(player.x,player.y,sx,sy)>sr+player.r) hurtPlayer(boss.atk*1.45,colors[pick],true); else breakBoss(1.2); },2000);
  }

  function cognitivePattern(){
    if(!state.raid || boss.dead) return;
    const table=[];
    if(boss.tier>=5) table.push(spawnAddsPhase);
    if(boss.tier>=6) table.push(spawnCrumblingFloor);
    if(boss.tier>=7) table.push(spawnMemoryMiniGame);
    if(boss.tier>=8) table.push(spawnMazeEscape);
    if(boss.tier>=9) table.push(spawnColorPolarity);
    if(!table.length) return;
    table[Math.floor(Math.random()*table.length)]();
  }

  function bossPattern(){
    boss.mechanicText='';
    const map={
      slime_king:slimeKingV18, ember_tyrant:emberTyrantV18, thorn_queen:thornQueenV18, frost_oracle:frostOracleV18,
      sand_reaper:sandReaperV18, void_serpent:voidSerpentV18, iron_minotaur:ironMinotaurV18, blood_moon:bloodMoonV18,
      storm_colossus:stormColossusV18, plague_doctor:plagueDoctorV18, mirror_duelist:mirrorDuelistV18, gravity_core:gravityCoreV18,
      solar_dragon:solarDragonV18, chrono_dragon:chronoDragonV18, abyss_leviathan:abyssLeviathanV18, puppet_emperor:puppetEmperorV18,
      black_sun:blackSunV18, chaos_archon:chaosArchonV18
    };
    (map[boss.id] || slimeKingV18)();
    // V19: 후반 보스는 피지컬 패턴 사이에 머리를 쓰는 기믹을 섞는다. 단, 겹침은 과하지 않게 확률 제한.
    if(boss.tier>=6 && boss.phase>=2 && Math.random()<.34) setTimeout(()=>cognitivePattern(), 900);
    if(boss.tier>=8 && boss.phase>=3 && Math.random()<.22) setTimeout(()=>cognitivePattern(), 1850);
    if(boss.tier>=6 && Math.random()<.16) setTimeout(()=>secondaryPattern(false),760);
    if(boss.tier>=9 && boss.phase>=3 && Math.random()<.07) setTimeout(()=>instantKillPattern(),2100);
  }



  /* =========================================================
     V20 - ATTACK VISIBILITY + 3-PATTERN BOSS ROTATION
     - 반투명 예고와 실제 공격을 확실히 분리
     - 실제 공격은 네온 잔상/충격파가 0.5초 이상 보이도록 유지
     - 보스 공격 모션 추가
     - 보스마다 최소 3개 패턴을 순환 사용
  ========================================================= */

  const V20_PATTERN_LABELS = {
    slime_king:['착지 충격파','젤리 방울 유도','분열 장판'],
    ember_tyrant:['불씨 십자 폭발','화염 부채꼴','용암 안전지대'],
    thorn_queen:['가시 미로','독꽃 성장','덩굴 포박선'],
    frost_oracle:['빙벽 숨기','얼음창 선긋기','해동 룬'],
    sand_reaper:['모래 매몰','낫 도넛베기','감속 모래폭풍'],
    void_serpent:['포탈 절단선','추적 공허구','균열 도넛'],
    iron_minotaur:['돌진 카운터','철갑 충격파','투기장 격자'],
    blood_moon:['혈월 표식','흡혈 칼날','붉은 달 장판'],
    storm_colossus:['낙뢰 빈칸 찾기','회전 번개 레이저','전류 룬'],
    plague_doctor:['독안개 해독룬','감염 소환수','역병 지대'],
    mirror_duelist:['진짜 분신 찾기','거울 레이저 순서','반사 탄막'],
    gravity_core:['중력 흡입','압축 도넛','역중력 낙하'],
    solar_dragon:['태양 낙하','일식 안전지대','광선 격자'],
    chrono_dragon:['시간 감속','지연 탄막','기억 룬'],
    abyss_leviathan:['해일 벽','소용돌이 미로','심해 소환수'],
    puppet_emperor:['실 조종선','가짜 안전지대','단두대 줄'],
    black_sun:['검은 일식','무너지는 바닥','태양 심판'],
    chaos_archon:['색상 양극','복합 기억룬','혼돈 판정']
  };
  try { BOSSES.forEach(b=>{ if(V20_PATTERN_LABELS[b.id]) b.patterns = V20_PATTERN_LABELS[b.id]; }); } catch(e) {}

  function v20BossCast(text, kind, color, angle){
    boss.mechanicText = text;
    boss.cast = {life:.85, max:.85, kind:kind||'blast', color:color||boss.color, angle:Number.isFinite(angle)?angle:Math.atan2(player.y-boss.y, player.x-boss.x)};
  }
  function v20PushHazard(h){
    h.warn = Math.max(h.warn || 1.05, .75);
    h.life = Math.max(h.life || .55, .55);
    h.v20 = true;
    h.hitTick = 0;
    state.hazards.push(h);
  }
  function v20Circle(x,y,r,warn,color,damage,tag){ v20PushHazard({kind:'circle',x,y,r,warn,life:.62,damage,color,tag}); }
  function v20Beam(x,y,angle,len,w,warn,color,damage,tag){ v20PushHazard({kind:'beam',x,y,angle,len,w,warn,life:.62,damage,color,tag}); }
  function v20Donut(x,y,inner,outer,warn,color,damage,tag){ v20PushHazard({kind:'donut',x,y,inner,outer,warn,life:.64,damage,color,tag}); }
  function v20Wall(x,y,w,h,warn,color,damage,tag){ v20PushHazard({kind:'wall',x,y,w,h,warn,life:.72,damage,color,tag}); }
  function v20Floor(x,y,w,h,warn,color,damage,tag){ v20PushHazard({kind:'floor',x,y,w,h,warn,life:.72,damage,color,tag}); }
  function v20RotBeam(x,y,angle,spin,len,w,warn,color,damage,tag){ v20PushHazard({kind:'rotatingBeam',x,y,angle,spin,len,w,warn,life:2.25,damage,color,tag,tick:0}); }

  // 기존 warningCircle이 실제 타격 순간 바로 사라져 보이지 않던 문제를 보정.
  warningCircle = function(x,y,r,warn,color,damage,zone,callback,tag){
    v20PushHazard({kind:'circle',x,y,r,warn:Math.max(warn||1,.85),life:.64,damage,color,zone,callback,tag});
  };

  function v20ActivateHazard(h){
    if(h._v20active) return;
    h._v20active = true;
    h.life = Math.max(h.life || .55, h.kind==='rotatingBeam' ? h.life : .55);
    if(h.kind==='beam' || h.kind==='rotatingBeam') boss.cast = {life:.45, max:.45, kind:'beam', color:h.color||boss.color, angle:h.angle||0};
    else if(h.kind==='circle' || h.kind==='donut') boss.cast = {life:.45, max:.45, kind:'slam', color:h.color||boss.color, angle:Math.atan2(h.y-boss.y,h.x-boss.x)};
    else boss.cast = {life:.45, max:.45, kind:'cast', color:h.color||boss.color, angle:Math.atan2(player.y-boss.y,player.x-boss.x)};
    burst(h.x||boss.x, h.y||boss.y, h.color||boss.color, h.kind==='beam'?18:26, 180);
  }

  updateHazards = function(dt){
    if(boss && boss.cast) boss.cast.life -= dt;
    state.hazards.forEach(h=>{
      if(!h || !Number.isFinite(h.life)) h.life = 0;
      if(h.warn>0){ h.warn-=dt; if(h.kind==='rotatingBeam') h.angle += (h.spin||0)*dt*.25; if(h.warn<=0) v20ActivateHazard(h); return; }
      v20ActivateHazard(h);
      h.life-=dt;
      h.hitTick=(h.hitTick||0)-dt;
      const canHit = h.hitTick<=0;
      if(h.kind==='circle'){
        if(canHit && dist(h.x,h.y,player.x,player.y)<h.r+player.r){ hurtPlayer(h.damage,h.color); h.hitTick=.28; if(h.tag) applyBossHitStatus(h.tag); }
        if(!h._zoneMade && h.zone){ h._zoneMade=true; state.zones.push({x:h.x,y:h.y,r:h.r,damage:h.damage*.08,life:2.4,tick:0,color:h.color,enemy:true,dot:true}); }
        if(h.callback && !h._cb){ h._cb=true; h.callback(); }
      } else if(h.kind==='donut'){
        const d=dist(h.x,h.y,player.x,player.y);
        if(canHit && d>h.inner && d<h.outer){ hurtPlayer(h.damage,h.color); h.hitTick=.28; if(h.tag) applyBossHitStatus(h.tag); }
      } else if(h.kind==='beam' || h.kind==='rotatingBeam'){
        if(h.kind==='rotatingBeam') { h.angle += (h.spin||0)*dt; }
        const px=player.x-h.x, py=player.y-h.y;
        const along=px*Math.cos(h.angle)+py*Math.sin(h.angle);
        const side=Math.abs(-px*Math.sin(h.angle)+py*Math.cos(h.angle));
        if(canHit && Math.abs(along)<h.len/2 && side<h.w+player.r){
          hurtPlayer(h.damage,h.color); h.hitTick=h.kind==='rotatingBeam'?.32:.26; if(h.tag) applyBossHitStatus(h.tag);
        }
        if(h.callback && !h._cb){ h._cb=true; h.callback(); }
      } else if(h.kind==='playerStrike'){
        if(boss && !boss.dead && dist(h.x,h.y,boss.x,boss.y)<h.r+boss.r){damageBoss(h.damage,h.color,false); h.life=0;}
      } else if(h.kind==='wall'){
        if(canHit && Math.abs(player.x-h.x)<h.w+player.r && Math.abs(player.y-h.y)<h.h/2+player.r){ hurtPlayer(h.damage,h.color); h.hitTick=.32; if(h.tag) applyBossHitStatus(h.tag); }
      } else if(h.kind==='floor'){
        if(canHit && Math.abs(player.x-h.x)<h.w/2+player.r && Math.abs(player.y-h.y)<h.h/2+player.r){ hurtPlayer(h.damage,h.color); h.hitTick=.32; if(h.tag) applyBossHitStatus(h.tag); }
      }
    });
    state.hazards=state.hazards.filter(h=>h && (h.life>0||h.warn>0));
  };

  drawHazards = function(){
    state.hazards.forEach(h=>{
      const warning=h.warn>0;
      const c=h.color||'#fff';
      ctx.save();
      ctx.fillStyle=c; ctx.strokeStyle=c; ctx.lineCap='round'; ctx.lineJoin='round';
      if(warning){
        ctx.globalAlpha=.16+.07*Math.sin(state.time*18);
        ctx.shadowBlur=0;
        ctx.lineWidth=2;
      } else {
        const pulse=.65+.35*Math.sin(state.time*42);
        ctx.globalAlpha=.84;
        ctx.shadowColor=c;
        ctx.shadowBlur=30+12*pulse;
        ctx.lineWidth=5;
      }
      if(h.kind==='circle'||h.kind==='playerStrike'){
        if(warning){ circle(ctx,h.x,h.y,h.r); ctx.globalAlpha=.74; circleStroke(ctx,h.x,h.y,h.r); ctx.globalAlpha=.95; ctx.fillStyle='#fff'; ctx.font='900 12px system-ui'; ctx.textAlign='center'; ctx.fillText(h.label||'예고',h.x,h.y+4); }
        else { ctx.globalAlpha=.24; circle(ctx,h.x,h.y,h.r); ctx.globalAlpha=1; ctx.lineWidth=5; circleStroke(ctx,h.x,h.y,h.r); ctx.globalAlpha=.72; ctx.lineWidth=15; circleStroke(ctx,h.x,h.y,Math.max(6,h.r-7)); ctx.globalAlpha=.92; ctx.fillStyle='#fff'; ctx.font='900 13px system-ui'; ctx.textAlign='center'; ctx.fillText('HIT',h.x,h.y+5); }
      } else if(h.kind==='donut'){
        const mid=(h.inner+h.outer)/2;
        if(warning){ ctx.globalAlpha=.18; ctx.lineWidth=Math.max(10,(h.outer-h.inner)); circleStroke(ctx,h.x,h.y,mid); ctx.globalAlpha=.72; ctx.lineWidth=3; circleStroke(ctx,h.x,h.y,h.outer); circleStroke(ctx,h.x,h.y,h.inner); }
        else { ctx.globalAlpha=.92; ctx.lineWidth=Math.max(18,(h.outer-h.inner)*.75); circleStroke(ctx,h.x,h.y,mid); ctx.globalAlpha=1; ctx.lineWidth=5; ctx.strokeStyle='#fff'; circleStroke(ctx,h.x,h.y,h.outer); circleStroke(ctx,h.x,h.y,h.inner); }
      } else if(h.kind==='beam'||h.kind==='rotatingBeam'){
        ctx.save(); ctx.translate(h.x,h.y); ctx.rotate(h.angle||0);
        if(warning){ ctx.globalAlpha=.18; roundRect(ctx,-h.len/2,-h.w,h.len,h.w*2,8); ctx.globalAlpha=.72; ctx.strokeStyle=c; ctx.lineWidth=2; ctx.strokeRect(-h.len/2,-h.w,h.len,h.w*2); }
        else { ctx.globalAlpha=.90; roundRect(ctx,-h.len/2,-h.w,h.len,h.w*2,10); ctx.globalAlpha=1; ctx.strokeStyle='#fff'; ctx.lineWidth=2.5; ctx.strokeRect(-h.len/2,-h.w,h.len,h.w*2); ctx.globalAlpha=.72; ctx.strokeStyle=c; ctx.lineWidth=14; ctx.beginPath(); ctx.moveTo(-h.len/2,0); ctx.lineTo(h.len/2,0); ctx.stroke(); }
        ctx.restore();
      } else if(h.kind==='wall'||h.kind==='floor'){
        ctx.globalAlpha=warning?.18:.82; ctx.fillRect(h.x-h.w/2,h.y-h.h/2,h.w,h.h);
        ctx.globalAlpha=warning?.62:1; ctx.strokeStyle=warning?c:'#fff'; ctx.lineWidth=warning?2:4; ctx.strokeRect(h.x-h.w/2,h.y-h.h/2,h.w,h.h);
      }
      ctx.restore();
    });
  };

  const __v20_originalBossShape = drawBossShape;
  drawBossShape = function(c,b,x,y,r){
    __v20_originalBossShape(c,b,x,y,r);
    if(b!==boss || !boss.cast || boss.cast.life<=0) return;
    const t=clamp(boss.cast.life/(boss.cast.max||.85),0,1);
    c.save(); c.translate(x,y); c.rotate(boss.cast.angle||0); c.globalAlpha=.35+.55*t; c.shadowColor=boss.cast.color||boss.color; c.shadowBlur=24; c.strokeStyle=boss.cast.color||boss.color; c.fillStyle=boss.cast.color||boss.color; c.lineCap='round';
    if(boss.cast.kind==='beam'){
      c.lineWidth=8+18*t; c.beginPath(); c.moveTo(r*.2,0); c.lineTo(r*1.75,0); c.stroke(); c.globalAlpha=.9*t; c.fillStyle='#fff'; circle(c,r*1.85,0,7+8*t);
    } else if(boss.cast.kind==='slam'){
      c.lineWidth=6+10*t; c.beginPath(); c.arc(0,0,r*(1.2+.7*(1-t)),0,Math.PI*2); c.stroke(); c.fillStyle=boss.cast.color||boss.color; c.fillRect(r*.4,-6,r*.85,12);
    } else {
      c.lineWidth=5+8*t; c.beginPath(); c.arc(0,0,r*(1.0+.5*(1-t)),0,Math.PI*2); c.stroke();
      for(let i=0;i<6;i++){ c.save(); c.rotate(i*Math.PI/3+state.time*2); c.fillRect(r*.8,-3,r*.45,6); c.restore(); }
    }
    c.restore();
  };

  function v20Cycle(){ boss._v20PatternIndex = (boss._v20PatternIndex||0) + 1; return (boss._v20PatternIndex-1)%3; }
  function v20MaybeCognitive(){
    if(boss.tier>=6 && boss.phase>=2 && Math.random()<.38) setTimeout(()=>cognitivePattern(), 1050);
    if(boss.tier>=9 && boss.phase>=3 && Math.random()<.22) setTimeout(()=>cognitivePattern(), 2100);
  }
  function v20P1LineFan(color, tag){ const a=Math.atan2(player.y-boss.y,player.x-boss.x); for(let i=-1;i<=1;i++) v20Beam(boss.x,boss.y,a+i*.33,900,18+boss.phase*4,1.0+i*.08,color,boss.atk*.68,tag); }
  function v20P2SafeCircle(color, tag){ const x=rand(120,W-120), y=rand(135,H-90), r=65; state.mechanics.push({kind:'safe',x,y,r,life:2.15,color}); setTimeout(()=>{ if(state.raid&&!boss.dead){ if(dist(player.x,player.y,x,y)>r+player.r) hurtPlayer(boss.atk*1.35,color,true); else { breakBoss(.9); healText('회피 성공',player.x,player.y-34); } burst(x,y,color,35,260); } }, 2150); }
  function v20P3Tiles(color, tag){ const cols=6, rows=4, cellW=W/cols, cellH=(H-105)/rows; const safe=Math.floor(Math.random()*cols*rows); boss.mechanicText += ' · 전장 붕괴: 맵 전체 칸 중 빈칸을 찾으세요'; for(let i=0;i<cols*rows;i++){ if(i===safe) continue; const x=cellW*(i%cols+.5), y=105+cellH*(Math.floor(i/cols)+.5); v20Floor(x, y, cellW*.76, cellH*.62, 1.30+Math.random()*.35, color, boss.atk*.72, tag); } const sx=cellW*(safe%cols+.5), sy=105+cellH*(Math.floor(safe/cols)+.5); state.mechanics.push({kind:'safe',x:sx,y:sy,r:Math.min(cellW,cellH)*.28,life:1.75,color:'#86efac'}); }
  function v20AddBullets(color, tag, n){ for(let i=0;i<n;i++) setTimeout(()=>aimBullet(boss.x,boss.y,player.x+rand(-120,120),player.y+rand(-90,90),225+boss.tier*12,color,boss.atk*.28,tag),i*110); }

  const V20_PATTERNS = {
    slime_king:[()=>{v20BossCast('젤리 왕: 착지 충격파가 실제 HIT 원으로 남습니다. 원 밖으로 빠지세요.','slam','#7ddf64'); v20Circle(player.x,player.y,72,1.05,'#7ddf64',boss.atk*.70,'slime');},()=>{v20BossCast('젤리 왕: 방울이 튕깁니다. 탄막 사이 빈틈을 찾으세요.','cast','#a7f3d0'); radialBullets(boss.x,boss.y,10+boss.phase*2,150,'#a7f3d0',boss.atk*.25);},()=>{v20BossCast('젤리 왕: 젤리 장판이 순서대로 깔립니다. 오래 밟지 마세요.','cast','#86efac'); for(let i=0;i<4;i++) setTimeout(()=>state.zones.push({x:rand(90,W-90),y:rand(125,H-70),r:50,damage:boss.atk*.045,life:2.2,tick:0,color:'#86efac',enemy:true,dot:true}),i*220);} ],
    ember_tyrant:[()=>{v20BossCast('이그니스: 불씨 십자가 폭발. 대각선으로 피하세요.','beam','#f97316'); const x=player.x,y=player.y; v20Beam(x,y,0,W*1.3,30,1.15,'#f97316',boss.atk*.82,'fire'); v20Beam(x,y,Math.PI/2,H*1.6,30,1.15,'#f97316',boss.atk*.82,'fire');},()=>{v20BossCast('이그니스: 정면 화염 부채꼴. 보스 측면으로 빠지세요.','beam','#fb7185'); v20P1LineFan('#fb7185','fire');},()=>{v20BossCast('이그니스: 용암 낙하 후 안전지대를 찾으세요.','slam','#fb923c'); for(let i=0;i<5+boss.phase;i++) v20Circle(rand(90,W-90),rand(120,H-80),34+boss.phase*4,.95+i*.07,'#fb923c',boss.atk*.55,'fire'); if(boss.phase>=2)v20P2SafeCircle('#fef3c7','fire');}],
    thorn_queen:[()=>{v20BossCast('로제리아: 가시 미로. 비어 있는 세로 길을 찾아 이동하세요.','beam','#4ade80'); const gap=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==gap) v20Wall(135+i*(W-270)/4,H/2,20,H*.72,1.05,'#4ade80',boss.atk*.62,'poison');},()=>{v20BossCast('로제리아: 독꽃이 자랍니다. 꽃 근처를 오래 밟지 마세요.','cast','#84cc16'); for(let i=0;i<3+boss.phase;i++) state.zones.push({x:rand(100,W-100),y:rand(130,H-80),r:54,damage:boss.atk*.055,life:2.8,tick:0,color:'#84cc16',enemy:true,dot:true});},()=>{v20BossCast('로제리아: 덩굴 포박선. 선이 켜진 뒤 실제 가시가 올라옵니다.','beam','#22c55e'); for(let i=0;i<4;i++) v20Beam(rand(120,W-120),H/2,Math.PI/2,H*1.15,16,1.0+i*.12,'#22c55e',boss.atk*.54,'poison');}],
    frost_oracle:[()=>frostOracleV18(),()=>{v20BossCast('네이아: 얼음창 3연속. 선의 순서를 보고 한 칸씩 이동하세요.','beam','#bae6fd'); v20P1LineFan('#bae6fd','ice');},()=>{v20BossCast('네이아: 얼어붙은 바닥. 금 간 칸은 터집니다.','slam','#7dd3fc'); v20P3Tiles('#7dd3fc','ice');}],
    sand_reaper:[()=>{v20BossCast('샤하르: 낫 도넛베기. 안쪽 또는 바깥쪽을 판단하세요.','slam','#f59e0b'); v20Donut(boss.x,boss.y,70,185,1.05,'#f59e0b',boss.atk*.85,'sand');},()=>{v20BossCast('샤하르: 매몰 폭발. 느려진 상태에서 예고 원을 빠져나오세요.','slam','#fbbf24'); player.slow=Math.max(player.slow,1.6); for(let i=0;i<4+boss.phase;i++) v20Circle(rand(80,W-80),rand(110,H-80),42,1.05+i*.1,'#fbbf24',boss.atk*.55,'sand');},()=>{v20BossCast('샤하르: 모래폭풍 미로. 막힌 벽 사이 빈틈을 찾으세요.','beam','#fde68a'); v20P1LineFan('#fde68a','sand'); if(boss.phase>=2) spawnMazeEscape();}],
    void_serpent:[()=>voidSerpentV18(),()=>{v20BossCast('노크스: 포탈 절단선. 두 포탈을 잇는 네온 선을 피하세요.','beam','#a78bfa'); for(let i=0;i<3;i++) v20Beam(rand(180,W-180),rand(140,H-90),rand(0,Math.PI),W*.9,18,1.2+i*.12,'#a78bfa',boss.atk*.68,'void');},()=>{v20BossCast('노크스: 균열 도넛. 공허 중심과 외곽을 번갈아 보세요.','slam','#8b5cf6'); v20Donut(W/2,H/2,95,250,1.2,'#8b5cf6',boss.atk*.82,'void'); for(let i=0;i<2+boss.phase;i++) homingEnemy('#a78bfa');}],
    iron_minotaur:[()=>ironMinotaurV18(),()=>{v20BossCast('미노타우로스: 철갑 충격파. 보스 주변 원 밖으로 피하세요.','slam','#94a3b8'); v20Circle(boss.x,boss.y,150,1.15,'#94a3b8',boss.atk*.75,'metal');},()=>{v20BossCast('미노타우로스: 투기장 격자. 네온 격자의 빈칸으로 이동하세요.','beam','#cbd5e1'); for(let i=0;i<4;i++) v20Beam(160+i*260,H/2,Math.PI/2,H*1.1,16,1.0+i*.08,'#cbd5e1',boss.atk*.55,'metal'); for(let j=0;j<2;j++) v20Beam(W/2,210+j*160,0,W*.9,16,1.15+j*.08,'#cbd5e1',boss.atk*.55,'metal');}],
    blood_moon:[()=>bloodMoonV18(),()=>{v20BossCast('루나: 흡혈 칼날. 부채꼴 선 사이 빈틈으로 빠지세요.','beam','#fb7185'); v20P1LineFan('#fb7185','blood');},()=>{v20BossCast('루나: 붉은 달 장판. 표식이 터진 뒤 지속 피해가 남습니다.','slam','#ef4444'); v20Circle(player.x,player.y,76,1.15,'#ef4444',boss.atk*.8,'blood'); setTimeout(()=>state.zones.push({x:player.x,y:player.y,r:72,damage:boss.atk*.05,life:2.4,tick:0,color:'#ef4444',enemy:true,dot:true}),1150);}],
    storm_colossus:[()=>stormColossusV18(),()=>{v20BossCast('아스트라: 회전 번개 레이저. 회전 방향을 보고 따라 움직이세요.','beam','#fde047'); v20RotBeam(W/2,H/2,rand(0,Math.PI),Math.random()<.5?1.1:-1.1,W*1.35,18,1.35,'#fde047',boss.atk*.55,'lightning');},()=>{v20BossCast('아스트라: 전류 룬. 룬을 밟으면 잠깐 BREAK 됩니다.','cast','#facc15'); spawnRune('#fde047','break'); for(let i=0;i<5;i++) v20Circle(rand(90,W-90),rand(115,H-75),30,1.0+i*.12,'#facc15',boss.atk*.45,'lightning');}],
    plague_doctor:[()=>plagueDoctorV18(),()=>{v20BossCast('모르비드: 감염 소환수. 빨리 처리하지 않으면 압박이 커집니다.','cast','#bef264'); spawnAddsPhase();},()=>{v20BossCast('모르비드: 해독 룬과 독안개. 룬을 먼저 밟으세요.','cast','#84cc16'); spawnRune('#bef264','cleanse'); state.zones.push({x:W/2,y:H/2,r:210,damage:boss.atk*.065,life:3.0,tick:0,color:'#84cc16',enemy:true,dot:true});}],
    mirror_duelist:[()=>mirrorDuelistV18(),()=>{v20BossCast('세렌: 거울 레이저 순서. 빛나는 순서대로 피하세요.','beam','#f0abfc'); for(let i=0;i<5;i++) v20Beam(180+i*220,H/2,Math.PI/2,H*1.1,18,1.0+i*.18,'#f0abfc',boss.atk*.55,'mirror');},()=>{v20BossCast('세렌: 진짜 분신 찾기. 밝은 분신이 보스 약점입니다.','cast','#e879f9'); boss.clones=[]; boss.realIndex=Math.floor(Math.random()*5); for(let i=0;i<5;i++) boss.clones.push({x:170+i*(W-340)/4,y:150+rand(-10,70),real:i===boss.realIndex,life:3.2}); radialBullets(boss.x,boss.y,16,210,'#e879f9',boss.atk*.26);}],
    gravity_core:[()=>gravityCoreV18(),()=>{v20BossCast('중력핵: 압축 도넛. 흡입 후 안전한 거리로 빠지세요.','slam','#818cf8'); state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:290,life:2.5,power:220,color:'#818cf8'}); v20Donut(W/2,H/2,85,245,1.55,'#818cf8',boss.atk*.85,'gravity');},()=>{v20BossCast('중력핵: 역중력 낙하. 그림자를 보고 떨어지는 위치를 피하세요.','slam','#a5b4fc'); for(let i=0;i<6;i++) v20Circle(rand(90,W-90),rand(110,H-80),38,1.0+i*.12,'#a5b4fc',boss.atk*.58,'gravity');}],
    solar_dragon:[()=>solarDragonV18(),()=>{v20BossCast('아우렐리온: 일식 안전지대. 어두운 원 밖은 불탑니다.','slam','#f97316'); v20P2SafeCircle('#fde68a','solar');},()=>{v20BossCast('아우렐리온: 태양 광선 격자. 가로/세로 순서를 읽으세요.','beam','#facc15'); for(let i=0;i<3;i++) v20Beam(W/2,170+i*130,0,W*.95,18,1.0+i*.18,'#facc15',boss.atk*.55,'solar'); for(let i=0;i<3;i++) v20Beam(230+i*320,H/2,Math.PI/2,H*.95,18,1.5+i*.18,'#f97316',boss.atk*.55,'solar');}],
    chrono_dragon:[()=>chronoDragonV18(),()=>{v20BossCast('크로노스: 기억 룬. 순서를 외워 밟으면 BREAK 됩니다.','cast','#fef08a'); spawnMemoryMiniGame();},()=>{v20BossCast('크로노스: 지연 탄막. 늦게 움직이는 탄을 예측하세요.','cast','#fde047'); for(let i=0;i<14;i++) setTimeout(()=>aimBullet(boss.x,boss.y,player.x+rand(-170,170),player.y+rand(-120,120),190,'#fde047',boss.atk*.25,'chrono'),i*120);}],
    abyss_leviathan:[()=>abyssLeviathanV18(),()=>{v20BossCast('아비스: 소용돌이 미로. 탈출 지점까지 벽 사이를 통과하세요.','cast','#38bdf8'); spawnMazeEscape();},()=>{v20BossCast('아비스: 심해 소환수. 소환수를 처리하며 해일을 피하세요.','cast','#7dd3fc'); spawnAddsPhase(); for(let i=0;i<3;i++) v20Wall(W/2,160+i*120,W*.8,22,1.1+i*.25,'#38bdf8',boss.atk*.58,'ice');}],
    puppet_emperor:[()=>puppetEmperorV18(),()=>{v20BossCast('마리오네트: 가짜 SAFE. 진짜 안전지대만 찾으세요.','cast','#facc15'); spawnColorPolarity();},()=>{v20BossCast('마리오네트: 단두대 줄. 선이 내려오기 전에 좌우로 빠지세요.','beam','#fde68a'); for(let i=0;i<5;i++) v20Beam(150+i*(W-300)/4,H/2,Math.PI/2,H*1.1,20,1.0+i*.08,'#fde68a',boss.atk*.65,'puppet');}],
    black_sun:[()=>blackSunV18(),()=>{v20BossCast('아포칼립스: 무너지는 바닥. 안전 칸 하나를 찾아야 합니다.','slam','#f97316'); v20P3Tiles('#f97316','solar');},()=>{v20BossCast('아포칼립스: 검은 일식. SAFE 안에 들어가지 못하면 큰 피해를 받습니다.','slam','#facc15'); v20P2SafeCircle('#facc15','solar');}],
    chaos_archon:[()=>chaosArchonV18(),()=>{v20BossCast('혼돈: 색상 양극. 지정 색 원을 빠르게 판단하세요.','cast','#c084fc'); spawnColorPolarity();},()=>{v20BossCast('혼돈: 복합 기억룬. 순서를 틀리면 큰 피해를 받습니다.','cast','#f472b6'); spawnMemoryMiniGame(); if(boss.phase>=3) setTimeout(()=>v20P3Tiles('#c084fc','chaos'),900); }]
  };

  bossPattern = function(){
    if(!boss || boss.dead) return;
    const arr=V20_PATTERNS[boss.id] || V20_PATTERNS.slime_king;
    const i=v20Cycle();
    try { arr[i%arr.length](); } catch(e) { console.warn('[V20 boss pattern fallback]', e); slimeKingV18(); }
    v20MaybeCognitive();
    if(boss.tier>=8 && boss.phase>=3 && Math.random()<.06) setTimeout(()=>instantKillPattern(),2400);
  };



/* =========================================================
   RAID DUNGEON V21 - ARENA-WIDE ATTACKS + BOSS BASIC ATTACKS
   - 보스 중심 패턴만 반복되던 문제 완화
   - 모든 보스: 일반 공격 + 패턴 공격 구조
   - 후반 보스: 맵 전체를 활용하는 추가 패턴 삽입
   - 실제 공격 표시 유지 시간을 조금 더 늘림
========================================================= */
(function(){
  if (typeof state === 'undefined' || typeof bossPattern === 'undefined') return;

  // 실제 공격이 너무 빨리 사라져 맞은 이유를 알기 어려웠던 문제 보정.
  // 기존 V20의 예고/실공격 분리 구조를 유지하되 HIT 구간을 더 오래 보이게 한다.
  const __v21_oldPushHazard = v20PushHazard;
  v20PushHazard = function(h){
    h.warn = Math.max(h.warn || 1.05, boss && boss.tier >= 6 ? 1.05 : .88);
    if (h.kind === 'rotatingBeam') h.life = Math.max(h.life || 2.25, 2.45);
    else if (h.kind === 'beam') h.life = Math.max(h.life || .62, .82);
    else if (h.kind === 'wall' || h.kind === 'floor') h.life = Math.max(h.life || .72, .92);
    else h.life = Math.max(h.life || .62, .82);
    __v21_oldPushHazard(h);
  };

  function v21Color(){ return (boss && (boss.color || boss.sub)) || '#93c5fd'; }
  function v21Tag(){ return (boss && (boss.theme || boss.id)) || 'boss'; }
  function v21Announce(text, kind, color, angle){
    if (!boss || boss.dead) return;
    v20BossCast(text, kind || 'cast', color || v21Color(), Number.isFinite(angle) ? angle : undefined);
  }

  // ===== 보스 일반 공격: 패턴 사이에 짧게 섞이는 압박기 =====
  // 큰 기믹이 아니라, 플레이어가 계속 위치를 신경 쓰게 만드는 역할.
  function v21BossBasicAttack(){
    if (!state.raid || !boss || boss.dead) return;
    const c = v21Color(), tag = v21Tag();
    const a = Math.atan2(player.y - boss.y, player.x - boss.x);
    const tier = boss.tier || 1;
    const dmg = boss.atk * (.26 + Math.min(.18, tier * .015));
    const r = Math.random();

    // 테마별로 일반 공격 느낌을 다르게 준다.
    if (boss.theme === 'metal' || boss.id === 'iron_minotaur') {
      v21Announce('철갑 기본기: 짧은 돌진 예고선을 보고 옆으로 피하세요.', 'beam', c, a);
      v20Beam(boss.x, boss.y, a, Math.min(520, 320 + tier * 24), 13 + tier * .8, .52, c, dmg * 1.15, tag);
      return;
    }
    if (boss.theme === 'lightning' || boss.id === 'storm_colossus') {
      v21Announce('낙뢰 기본기: 플레이어 근처에 짧은 번개가 떨어집니다.', 'slam', c);
      v20Circle(player.x + rand(-55,55), player.y + rand(-42,42), 30 + tier * 1.4, .58, c, dmg, 'lightning');
      return;
    }
    if (boss.theme === 'ice' || boss.id === 'frost_oracle') {
      v21Announce('빙결 기본기: 위에서 떨어지는 얼음창을 보고 피하세요.', 'beam', c, Math.PI/2);
      v20Beam(player.x + rand(-75,75), H/2, Math.PI/2, H * .96, 12 + tier * .55, .62, c, dmg, 'ice');
      return;
    }
    if (boss.theme === 'fire' || boss.theme === 'solar') {
      v21Announce('화염 기본기: 작은 불씨가 부채꼴로 날아옵니다.', 'beam', c, a);
      for (let i=-1;i<=1;i++) aimBullet(boss.x, boss.y, player.x + Math.cos(a+i*.18)*120, player.y + Math.sin(a+i*.18)*120, 220 + tier*9, c, dmg * .55, 'fire');
      return;
    }
    if (boss.theme === 'poison' || boss.theme === 'nature') {
      v21Announce('독성 기본기: 발밑에 작은 독꽃이 피어납니다.', 'slam', c);
      v20Circle(player.x + rand(-40,40), player.y + rand(-35,35), 28 + tier, .56, c, dmg * .75, 'poison');
      setTimeout(()=>{ if(state.raid && !boss.dead) state.zones.push({x:player.x,y:player.y,r:35,damage:boss.atk*.018,life:1.4,tick:0,color:c,enemy:true,dot:true}); }, 620);
      return;
    }
    if (boss.theme === 'mirror' || boss.theme === 'chrono') {
      v21Announce('굴절 기본기: 한 박자 늦게 오는 직선 공격입니다.', 'beam', c, a);
      v20Beam((boss.x+player.x)/2, (boss.y+player.y)/2, a, 460 + tier*12, 12 + tier*.55, .72, c, dmg, tag);
      return;
    }
    if (boss.theme === 'gravity' || boss.theme === 'void' || boss.theme === 'chaos') {
      v21Announce('공간 기본기: 작은 균열탄이 유도됩니다.', 'cast', c);
      homingEnemy(c);
      if (r < .45 && tier >= 6) homingEnemy(boss.sub || c);
      return;
    }

    // 기본형: 단일 조준탄 + 짧은 경고선
    v21Announce('기본 공격: 보스가 플레이어 방향으로 견제 공격을 합니다.', 'beam', c, a);
    if (r < .5) aimBullet(boss.x, boss.y, player.x, player.y, 235 + tier*8, c, dmg, tag);
    else v20Beam((boss.x+player.x)/2, (boss.y+player.y)/2, a, 430, 11 + tier*.6, .54, c, dmg, tag);
  }

  // updateBoss에 일반 공격 타이머를 추가한다.
  const __v21_oldUpdateBoss = updateBoss;
  updateBoss = function(dt){
    __v21_oldUpdateBoss(dt);
    if (!state.raid || !boss || boss.dead || !player || player.hp <= 0) return;
    boss._v21BasicCd = (boss._v21BasicCd || (1.25 + Math.random()*.55)) - dt;
    if (boss._v21BasicCd <= 0) {
      v21BossBasicAttack();
      const phaseMul = boss.phase === 3 ? .72 : boss.phase === 2 ? .86 : 1;
      const tierMul = Math.max(.58, 1 - (boss.tier||1)*.035);
      boss._v21BasicCd = (1.45 + Math.random()*.55) * phaseMul * tierMul;
    }
  };

  // ===== 맵 전체를 활용하는 패턴들 =====
  function v21ArenaDiagonalCross(color, tag){
    color = color || v21Color(); tag = tag || v21Tag();
    v21Announce('전장 절단: 중앙이 아니라 맵 전체 대각선이 순서대로 베입니다.', 'beam', color, Math.PI/4);
    const cx = W/2, cy = H/2;
    v20Beam(cx, cy, Math.PI/4, W*1.35, 17 + boss.phase*4, 1.15, color, boss.atk*.58, tag);
    v20Beam(cx, cy, -Math.PI/4, W*1.35, 17 + boss.phase*4, 1.45, boss.sub || color, boss.atk*.58, tag);
    if (boss.phase >= 3) v20Beam(cx, cy, 0, W*.96, 15 + boss.phase*3, 1.75, color, boss.atk*.52, tag);
  }

  function v21SideSweep(color, tag){
    color = color || v21Color(); tag = tag || v21Tag();
    const vertical = Math.random() < .5;
    v21Announce(vertical ? '전장 세로 쓸기: 왼쪽/오른쪽 줄을 보고 빈칸으로 이동하세요.' : '전장 가로 쓸기: 위/아래 줄을 보고 빈칸으로 이동하세요.', 'beam', color, vertical ? Math.PI/2 : 0);
    const lanes = vertical ? 6 : 4;
    const safe = Math.floor(Math.random()*lanes);
    for (let i=0;i<lanes;i++) {
      if (i === safe) continue;
      if (vertical) {
        const x = 120 + i*(W-240)/(lanes-1);
        v20Beam(x, H/2, Math.PI/2, H*.96, 15 + boss.phase*4, 1.05 + i*.08, color, boss.atk*.50, tag);
      } else {
        const y = 135 + i*(H-220)/(lanes-1);
        v20Beam(W/2, y, 0, W*.94, 15 + boss.phase*4, 1.05 + i*.10, color, boss.atk*.50, tag);
      }
    }
  }

  function v21QuadrantBomb(color, tag){
    color = color || v21Color(); tag = tag || v21Tag();
    v21Announce('사분면 폭격: 안전 사분면을 빠르게 찾아야 합니다.', 'slam', color);
    const qs = [
      {x:W*.28,y:H*.32},{x:W*.72,y:H*.32},{x:W*.28,y:H*.70},{x:W*.72,y:H*.70}
    ];
    const safe = Math.floor(Math.random()*4);
    qs.forEach((q,i)=>{ if(i!==safe) v20Circle(q.x,q.y,105 + boss.phase*10,1.25 + i*.08,color,boss.atk*.62,tag); });
    state.mechanics.push({kind:'safe',x:qs[safe].x,y:qs[safe].y,r:72,life:2.0,color:'#93c5fd'});
  }

  function v21CornerToCornerLaser(color, tag){
    color = color || v21Color(); tag = tag || v21Tag();
    v21Announce('코너 레이저: 맵 모서리에서 선이 교차합니다. 중앙만 보지 마세요.', 'beam', color);
    const a1 = Math.atan2(H-150, W-160);
    const a2 = Math.atan2(-(H-150), W-160);
    v20Beam(W/2, H/2, a1, W*1.18, 18 + boss.phase*4, 1.1, color, boss.atk*.58, tag);
    v20Beam(W/2, H/2, a2, W*1.18, 18 + boss.phase*4, 1.42, boss.sub || color, boss.atk*.58, tag);
  }

  function v21MovingSafeZone(color, tag){
    color = color || v21Color(); tag = tag || v21Tag();
    const sx = rand(130,W-130), sy = rand(135,H-85);
    v21Announce('이동 안전지대: 안전 원 안에서 다음 공격을 버티세요.', 'cast', color);
    state.mechanics.push({kind:'safe',x:sx,y:sy,r:68,life:2.25,color:'#d1fae5'});
    setTimeout(()=>{
      if(!state.raid || !boss || boss.dead) return;
      if(dist(player.x,player.y,sx,sy) > 68 + player.r) hurtPlayer(boss.atk*1.15, color, true);
      else { breakBoss(.9); healText('안전',player.x,player.y-32); }
      burst(sx,sy,color,35,250);
    }, 2250);
    // 안전지대 밖을 전부 때리는 느낌을 주기 위한 맵 가장자리 레이저.
    v20Beam(W/2, 110, 0, W*.96, 16, 1.15, color, boss.atk*.40, tag);
    v20Beam(W/2, H-62, 0, W*.96, 16, 1.35, color, boss.atk*.40, tag);
  }

  function v21ArenaPattern(color, tag){
    const list = [v21ArenaDiagonalCross, v21SideSweep, v21QuadrantBomb, v21CornerToCornerLaser, v21MovingSafeZone];
    list[Math.floor(Math.random()*list.length)](color || v21Color(), tag || v21Tag());
  }

  // 후반 보스의 패턴 배열에 맵 활용 패턴을 추가해 보스 중심 레이저만 반복되는 문제 완화.
  try {
    Object.keys(V20_PATTERNS).forEach(id=>{
      const def = (BOSSES||[]).find(b=>b.id===id) || {};
      const c = def.color || '#93c5fd';
      const tag = def.theme || id;
      if (!Array.isArray(V20_PATTERNS[id])) return;
      // 각 보스 최소 3개는 이미 보장되어 있으나, 중후반 보스는 4~5번째 패턴으로 맵 전체 기믹을 추가한다.
      if (def.tier >= 4) V20_PATTERNS[id].push(()=>v21ArenaPattern(c, tag));
      if (def.tier >= 7) V20_PATTERNS[id].push(()=>{
        const r = Math.random();
        if (r < .34) v21SideSweep(c, tag);
        else if (r < .67) v21QuadrantBomb(c, tag);
        else v21CornerToCornerLaser(c, tag);
      });
    });
  } catch(e) { console.warn('[V21 pattern inject failed]', e); }

  // 기존 순환은 배열 길이를 사용하므로 추가 패턴도 자연스럽게 돌아간다.
  const __v21_oldBossPattern = bossPattern;
  bossPattern = function(){
    if(!boss || boss.dead) return;
    try {
      __v21_oldBossPattern();
      // 높은 등급 후반 페이즈에서는 보스 중심 패턴 이후, 낮은 확률로 맵 기반 패턴을 한 번 더 예고한다.
      // 단, 난사 방지를 위해 페이즈 2 이상에서만 낮은 확률로 실행한다.
      if (boss.tier >= 8 && boss.phase >= 2 && Math.random() < .18) {
        setTimeout(()=>{ if(state.raid && boss && !boss.dead) v21ArenaPattern(boss.sub || boss.color, boss.theme); }, 1250);
      }
    } catch(e) {
      console.warn('[V21 boss pattern recovered]', e);
      v21ArenaPattern(v21Color(), v21Tag());
    }
  };

  // 안내 문구 보강: 보스에게 일반 공격이 있다는 것을 플레이어가 알 수 있게 한다.
  try {
    BOSSES.forEach(b=>{
      if(Array.isArray(b.patterns) && !b.patterns.includes('일반 공격')) b.patterns.unshift('일반 공격');
      if(Array.isArray(b.patterns) && b.tier >= 4 && !b.patterns.includes('전장 패턴')) b.patterns.push('전장 패턴');
    });
  } catch(e) {}


/* =========================================================
   RAID DUNGEON V22 - MASSIVE CONTENT + BETTER BOSS QUALITY
   - 스킬 +50, 무기 +50, 방어구 +50, 패시브 +10
   - 보스 +5
   - 구르기 쿨타임 2.5초 -> 1.25초
   - 후반 보스 기믹 패턴 강화
========================================================= */
try { document.title = 'Raid Dungeon'; } catch(e) {}
try { if (typeof VERSION !== 'undefined') console.log('[RaidDungeon] V22 content patch loaded'); } catch(e) {}

(function applyV22ContentPatch(){
  const v22Rarities = ['normal','rare','super','epic','legendary','ultimate'];
  function rr(i, total){ return pickFixedRarity(i, total || 50); }

  // 1) 무기 50종 추가: 각 계열의 외형/공격 성격이 다르게 보이도록 kind와 설명을 다양화.
  const v22WeaponDefs = [
    ['brass_knuckle_blade','황동 건블레이드','normal','sword','총검처럼 짧게 베고 탄환 파편을 흩뿌리는 근접 무기.','#d6a15d',1.08,106,.30,8],
    ['blue_mage_pistol','청색 마도권총','normal','gunstaff','스태프가 아닌 권총 실루엣의 마도총. 작은 푸른 탄을 쏩니다.','#38bdf8',1.02,520,.55,8],
    ['hooked_spear','갈고리 장창','normal','pole','갈고리 달린 창으로 길게 찌르고 끌어당기는 느낌의 공격.','#94a3b8',1.10,188,.34,6],
    ['bone_knife','뼈 단검','normal','dagger','가벼운 찌르기와 빠른 후딜 회복이 특징.','#e5e7eb',.80,82,.12,20],
    ['nomad_crossbow','유목민 석궁','normal','bow','활보다 느리지만 일직선 압박이 강한 석궁.','#fbbf24',1.04,620,.44,12],
    ['apprentice_grimoire','견습 마도서','normal','grimoire','책장이 펼쳐지며 작은 추적 마법탄을 날립니다.','#a78bfa',.95,600,.50,10],
    ['ember_hatchet','잿불 손도끼','normal','sword_fire','짧은 도끼 베기에 작은 불씨가 튑니다.','#fb7185',1.14,104,.33,6],
    ['iron_chain_whip','철사슬 채찍','normal','whip','묵직하게 휘어지는 철사슬 공격.','#94a3b8',1.02,220,.40,8],
    ['crescent_ring','초승달 투륜','normal','chakram','작은 차크람을 던져 되돌아오게 합니다.','#cbd5e1',.96,560,.45,12],
    ['granite_maul','화강암 전투망치','normal','greatsword','검은 아니지만 대검 계열처럼 묵직하게 내려칩니다.','#64748b',1.58,135,.76,4],

    ['azure_dualpistol','쌍청 마도권총','rare','gunstaff','양손 권총처럼 번갈아 쏘는 마도탄.','#67e8f9',1.12,560,.50,14],
    ['wolf_fang_saber','늑대송곳니 세이버','rare','sword','곡선 검날로 빠르게 두 번 베는 세이버.','#cbd5e1',1.18,118,.28,12],
    ['ivy_lash','덩굴 채찍','rare','whip','덩굴이 휘어지며 넓은 부채꼴을 긁습니다.','#4ade80',1.05,240,.36,10],
    ['cryo_bow','서리 활','rare','bow_storm','서리 화살이 길게 뻗으며 냉기 잔상을 남깁니다.','#7dd3fc',1.09,660,.36,14],
    ['scarlet_dirk','선홍 단도','rare','dagger','짧은 거리에서 치명타 확률이 높은 단도.','#fb7185',.86,90,.11,28],
    ['sage_staff','현자의 수정봉','rare','staff','수정구가 달린 스태프에서 둥근 탄이 발사됩니다.','#a5b4fc',1.10,560,.46,12],
    ['blackthorn_pole','검은가시 장봉','rare','pole','찔린 자리에 가시 이펙트가 생기는 장봉.','#e879f9',1.18,205,.32,10],
    ['storm_chakram','폭풍 투륜','rare','chakram','던졌다 돌아올 때 작은 번개가 튑니다.','#fde047',1.05,620,.42,16],
    ['molten_cleaver','용암 절단검','rare','greatsword','두꺼운 칼날로 넓게 베어 불꽃 흔적을 남깁니다.','#f97316',1.74,150,.70,8],
    ['bone_scythe','백골 낫','rare','scythe','낫날이 원호를 그리며 되돌아옵니다.','#e5e7eb',1.16,500,.48,14],

    ['aurora_pistol','오로라 마도권총','super','gunstaff','총구 주변에 원형 마법진이 생기는 화려한 권총.','#93c5fd',1.24,595,.47,18],
    ['ruby_rapier','루비 레이피어','super','sword','가늘고 긴 찌르기 검. 전방 집중 타격이 강합니다.','#fb7185',1.30,126,.25,18],
    ['tempest_bow','폭풍 석궁','super','bow_storm','장전 후 더 굵은 번개 화살을 발사합니다.','#facc15',1.22,710,.41,20],
    ['phantom_grimoire','환영 마도서','super','grimoire','책장이 여러 장 펼쳐져 환영탄을 발사합니다.','#c084fc',1.18,650,.45,20],
    ['blue_dragon_pole','청룡 언월봉','super','pole','언월도처럼 넓은 창날을 휘두릅니다.','#38bdf8',1.35,230,.31,14],
    ['spider_whip','거미줄 채찍','super','whip','얇은 채찍 여러 줄이 한 번에 휘어집니다.','#e879f9',1.18,260,.34,18],
    ['eclipse_dagger','일식 단검','super','dagger','검은 잔상이 두 번 따라붙는 단검.','#a78bfa',.95,100,.10,36],
    ['meteor_hammerblade','유성 망치검','super','greatsword','검과 망치 사이의 무기. 내려칠 때 파편이 튑니다.','#fb923c',1.95,160,.68,12],
    ['frost_scythe','빙결 낫','super','scythe','얼음 원호가 왕복하며 베어냅니다.','#7dd3fc',1.30,540,.45,18],
    ['sun_chakram','태양 차크람','super','chakram','둥근 태양 고리가 날아갔다 돌아옵니다.','#fde047',1.22,650,.38,20],

    ['railgun_pistol','레일 마도권총','epic','gunstaff','권총 형태지만 탄이 길고 날카로운 레일빔처럼 나갑니다.','#67e8f9',1.40,650,.44,24],
    ['rose_dualblade','장미 쌍검','epic','sword','양손검처럼 좌우 베기 잔상이 생깁니다.','#f472b6',1.45,138,.25,22],
    ['wyrm_bow','비룡궁','epic','bow_storm','화살이 비룡처럼 휘며 관통합니다.','#fef08a',1.34,760,.35,24],
    ['forbidden_codex','금서 아르카눔','epic','grimoire','금서가 펼쳐져 여러 개의 룬탄을 만듭니다.','#a78bfa',1.33,700,.42,24],
    ['titan_halberd','거신 할버드','epic','pole','찌르기와 베기가 합쳐진 거대 장창.','#cbd5e1',1.55,250,.32,18],
    ['void_lash','공허 균열채찍','epic','whip','채찍이 지나간 자리에 검은 균열이 남습니다.','#8b5cf6',1.35,290,.32,22],
    ['needle_storm','바늘폭풍 단검','epic','dagger','짧은 찌르기가 폭풍처럼 몰아칩니다.','#e5e7eb',1.04,108,.095,44],
    ['oathbreaker','맹세파괴 대검','epic','greatsword','대검이 크게 돌아가며 붉은 참격을 만듭니다.','#ef4444',2.15,185,.64,18],
    ['time_scythe','시간 수확낫','epic','scythe','낫이 지나간 뒤 늦은 잔상이 한 번 더 베어냅니다.','#f472b6',1.48,590,.42,24],
    ['moon_chakram','월광 차크람','epic','chakram','달빛 원반이 넓게 회전합니다.','#c4b5fd',1.40,700,.36,28],

    ['nova_magnum','노바 매그넘','legendary','gunstaff','마도권총의 최종형. 총구에서 별빛 폭발탄이 발사됩니다.','#22d3ee',1.62,700,.42,32],
    ['heaven_saber','천검 세라핌','legendary','sword','빛의 날개 모양 참격이 생깁니다.','#fef08a',1.72,155,.23,30],
    ['apex_ballista','정점 발리스타','legendary','bow_storm','느리지만 아주 강한 관통 볼트를 쏩니다.','#fde047',1.60,830,.48,30],
    ['necro_grimoire','사령 마도서','legendary','grimoire','어두운 영혼탄이 보스를 추적합니다.','#a78bfa',1.55,760,.39,30],
    ['sundering_halberd','하늘가름 할버드','legendary','pole','긴 궤적의 창날이 화면을 가릅니다.','#60a5fa',1.76,280,.29,26],
    ['dragon_spine_whip','용척추 채찍','legendary','whip','용의 척추처럼 마디진 채찍을 휘두릅니다.','#fb923c',1.55,330,.30,28],
    ['assassin_star','암살성 단검','legendary','dagger','별빛이 찍히듯 빠른 찌르기를 반복합니다.','#f0abfc',1.18,120,.082,56],
    ['planet_splitter','행성분쇄 대검','legendary','greatsword','느리지만 화면을 찢는 거대한 참격.','#facc15',2.45,210,.62,24],
    ['abyss_reaper','심연 사신낫','legendary','scythe','검은 원호가 왕복하며 보스를 압박합니다.','#8b5cf6',1.68,640,.39,30],
    ['halo_chakram','성환 차크람','legendary','chakram','성스러운 고리가 되돌아오며 두 번 타격합니다.','#fde047',1.60,760,.34,34],

    ['omega_pistol','오메가 마도권총','ultimate','gunstaff','완전한 권총 실루엣. 총구 마법진에서 오메가 탄을 쏩니다.','#ffffff',1.92,770,.37,42],
    ['world_end_blade','세계종말검','ultimate','sword_fire','검격마다 붉은 균열과 빛의 파편이 터집니다.','#fb7185',2.10,180,.21,40],
    ['skyfall_bow','천추궁','ultimate','bow_storm','하늘에서 내려찍는 듯한 궁극 화살.','#fef08a',1.88,900,.40,42],
    ['akasha_grimoire','아카샤 마도서','ultimate','grimoire','책장 전체가 별자리처럼 펼쳐져 자동탄을 만듭니다.','#f0abfc',1.86,820,.36,40],
    ['axis_lance','세계축 장창','ultimate','pole','축을 찌르듯 길고 강한 광창을 냅니다.','#93c5fd',2.05,320,.27,34],
    ['ouroboros_chain','우로보로스 사슬채찍','ultimate','whip','원형 사슬이 뱀처럼 감기며 넓은 범위를 공격합니다.','#a78bfa',1.82,370,.27,38],
    ['zero_dagger','제로 단검','ultimate','dagger','거의 보이지 않는 고속 베기. 치명타가 매우 높습니다.','#e879f9',1.36,132,.070,64],
    ['cosmos_cleaver','우주절단 대검','ultimate','greatsword','느리지만 가장 강한 궁극 대검 참격.','#fef08a',2.80,230,.58,34],
    ['event_horizon_scythe','사건지평선 낫','ultimate','scythe','낫 궤적이 블랙홀처럼 휘어져 돌아옵니다.','#c084fc',1.98,710,.36,42],
    ['infinite_chakram','무한 차크람','ultimate','chakram','여러 개의 원반 잔상이 겹쳐 돌아옵니다.','#ffffff',1.92,840,.31,48]
  ];
  v22WeaponDefs.forEach(w=>WEAPONS.push(weapon(...w)));

  // 2) 방어구 50종 추가: 체력/방어/상태저항 중심, 고등급일수록 면역에 가까운 옵션.
  const v22ArmorDefs = [
    ['patched_cloak','기운 누더기 망토','normal','최대 체력 +10, 방어 +1. 임시 방어구입니다.','#94a3b8',10,1,{}],
    ['field_jacket','야전 재킷','normal','최대 체력 +15, 방어 +1. 움직임이 편합니다.','#64748b',15,1,{}],
    ['tin_mail','양철 흉갑','normal','최대 체력 +18, 방어 +2. 약하지만 튼튼합니다.','#cbd5e1',18,2,{}],
    ['herbal_band','약초 완장','normal','최대 체력 +14, 독 저항 10%.','#4ade80',14,1,{poison:.10}],
    ['ash_scarf','잿빛 목도리','normal','최대 체력 +14, 화상 저항 10%.','#fb7185',14,1,{burn:.10}],
    ['wool_coat','두꺼운 털코트','normal','최대 체력 +16, 빙결 저항 10%.','#bae6fd',16,1,{freeze:.10}],
    ['rubber_boots','고무 장화','normal','최대 체력 +12, 마비 저항 10%.','#fde047',12,1,{paralysis:.10}],
    ['runner_vest','주자의 조끼','normal','최대 체력 +12, 슬로우 저항 10%.','#93c5fd',12,1,{slow:.10}],
    ['guard_mail','수문장 갑옷','normal','최대 체력 +20, 방어 +2.','#94a3b8',20,2,{}],
    ['oak_bark_armor','참나무 껍질갑','normal','최대 체력 +22, 독 저항 12%.','#86efac',22,1,{poison:.12}],

    ['ember_guard','불씨 수호갑','rare','최대 체력 +28, 방어 +2, 화상 저항 25%.','#fb7185',28,2,{burn:.25}],
    ['glacier_robe','빙하 로브','rare','최대 체력 +26, 방어 +2, 빙결 저항 25%.','#7dd3fc',26,2,{freeze:.25}],
    ['storm_padding','폭풍 패딩','rare','최대 체력 +25, 방어 +2, 마비 저항 25%.','#facc15',25,2,{paralysis:.25}],
    ['venom_filter','맹독 필터갑','rare','최대 체력 +24, 방어 +2, 독 저항 28%.','#84cc16',24,2,{poison:.28}],
    ['swift_cape','질풍 망토','rare','최대 체력 +24, 슬로우 저항 28%.','#93c5fd',24,1,{slow:.28}],
    ['bronze_aegis','청동 방벽갑','rare','최대 체력 +32, 방어 +3.','#d97706',32,3,{}],
    ['rune_guard','룬 가드갑','rare','최대 체력 +30, 모든 저항 조금.','#a78bfa',30,2,{burn:.12,poison:.12,freeze:.12,paralysis:.12,slow:.12}],
    ['mirror_shawl','거울 숄','rare','최대 체력 +28, 마비/슬로우 저항.','#e879f9',28,2,{paralysis:.18,slow:.18}],
    ['sand_cuirass','사막 흉갑','rare','최대 체력 +31, 화상/슬로우 저항.','#f59e0b',31,2,{burn:.16,slow:.16}],
    ['blood_padding','혈월 패딩','rare','최대 체력 +30, 독/화상 저항.','#ef4444',30,2,{poison:.16,burn:.16}],

    ['crystal_plate','수정 판금갑','super','최대 체력 +40, 방어 +4, 빙결 저항 40%.','#7dd3fc',40,4,{freeze:.40}],
    ['thunder_frame','뇌전 프레임갑','super','최대 체력 +38, 방어 +4, 마비 저항 40%.','#fde047',38,4,{paralysis:.40}],
    ['plague_doctor_coat','역병 의사 코트','super','최대 체력 +36, 독 저항 45%.','#bef264',36,3,{poison:.45}],
    ['flameproof_plate','내화 판금갑','super','최대 체력 +42, 화상 저항 45%.','#fb923c',42,3,{burn:.45}],
    ['phase_boots','위상 장화','super','최대 체력 +35, 슬로우 저항 45%.','#c084fc',35,3,{slow:.45}],
    ['guardian_armor','수호자 갑옷','super','최대 체력 +48, 방어 +5.','#cbd5e1',48,5,{}],
    ['forest_heart','숲심장 흉갑','super','최대 체력 +44, 독/슬로우 저항.','#4ade80',44,3,{poison:.32,slow:.25}],
    ['moon_mail','월광 갑주','super','최대 체력 +42, 마비/빙결 저항.','#c4b5fd',42,3,{paralysis:.30,freeze:.30}],
    ['void_padding','공허 패딩','super','최대 체력 +41, 모든 저항 소폭.','#8b5cf6',41,3,{burn:.18,poison:.18,freeze:.18,paralysis:.18,slow:.18}],
    ['iron_tower','철탑 갑주','super','최대 체력 +55, 방어 +6. 느리지만 튼튼합니다.','#94a3b8',55,6,{}],

    ['phoenix_robe','불사조 로브','epic','최대 체력 +56, 방어 +4, 화상 저항 60%.','#fb7185',56,4,{burn:.60}],
    ['absolute_zero_mail','절대영도 갑주','epic','최대 체력 +54, 방어 +5, 빙결 저항 60%.','#bae6fd',54,5,{freeze:.60}],
    ['tesla_guard','테슬라 가드갑','epic','최대 체력 +52, 방어 +5, 마비 저항 60%.','#fde047',52,5,{paralysis:.60}],
    ['antidote_heart','해독 심장갑','epic','최대 체력 +50, 독 저항 65%.','#84cc16',50,4,{poison:.65}],
    ['timewalker_coat','시간보행자 코트','epic','최대 체력 +48, 슬로우 저항 65%.','#f472b6',48,4,{slow:.65}],
    ['paladin_plate','성기사 판금갑','epic','최대 체력 +68, 방어 +7.','#fef08a',68,7,{}],
    ['nightmare_shroud','악몽 장막','epic','최대 체력 +58, 독/화상/슬로우 저항.','#a78bfa',58,5,{poison:.38,burn:.38,slow:.38}],
    ['mirror_aegis','거울 방패갑','epic','최대 체력 +60, 마비/빙결 저항.','#e879f9',60,5,{paralysis:.42,freeze:.42}],
    ['gravity_suit','중력 슈트','epic','최대 체력 +62, 슬로우/마비 저항.','#818cf8',62,5,{slow:.45,paralysis:.32}],
    ['solar_plate','태양 판금갑','epic','최대 체력 +64, 화상/빙결 저항.','#f97316',64,5,{burn:.50,freeze:.22}],

    ['seraphim_armor','세라핌 갑주','legendary','최대 체력 +82, 방어 +8, 모든 저항 35%.','#fef08a',82,8,{burn:.35,poison:.35,freeze:.35,paralysis:.35,slow:.35}],
    ['abyss_barrier','심연 방벽갑','legendary','최대 체력 +78, 방어 +8, 독/슬로우 강저항.','#8b5cf6',78,8,{poison:.75,slow:.60}],
    ['storm_lord_plate','폭풍군주 갑주','legendary','최대 체력 +76, 방어 +8, 마비 거의 면역.','#fde047',76,8,{paralysis:.82}],
    ['frost_king_mail','빙왕 갑주','legendary','최대 체력 +76, 방어 +8, 빙결 거의 면역.','#7dd3fc',76,8,{freeze:.82}],
    ['red_dragon_scale','적룡 비늘갑','legendary','최대 체력 +80, 방어 +8, 화상 거의 면역.','#fb7185',80,8,{burn:.82}],
    ['world_tree_aegis','세계수 방벽','legendary','최대 체력 +84, 독 거의 면역, 슬로우 저항.','#86efac',84,8,{poison:.82,slow:.45}],
    ['chrono_mantle','크로노 망토','legendary','최대 체력 +74, 슬로우 거의 면역, 마비 저항.','#f472b6',74,7,{slow:.82,paralysis:.45}],
    ['moon_eclipse_guard','월식 수호갑','legendary','최대 체력 +78, 빙결/화상 강저항.','#c4b5fd',78,8,{freeze:.58,burn:.58}],
    ['iron_colossus_shell','거신 외골격','legendary','최대 체력 +96, 방어 +10.','#94a3b8',96,10,{}],
    ['chaos_resonance','혼돈 공명갑','legendary','최대 체력 +78, 모든 저항 42%.','#fb7185',78,8,{burn:.42,poison:.42,freeze:.42,paralysis:.42,slow:.42}],

    ['origin_aegis','근원 방벽갑','ultimate','최대 체력 +110, 방어 +12, 모든 저항 55%.','#ffffff',110,12,{burn:.55,poison:.55,freeze:.55,paralysis:.55,slow:.55}],
    ['immortal_ward','불멸 수호갑','ultimate','최대 체력 +125, 방어 +10, 독/화상/빙결 강저항.','#fef08a',125,10,{burn:.70,poison:.70,freeze:.70}],
    ['void_zero_suit','제로 공허복','ultimate','최대 체력 +108, 방어 +10, 슬로우/마비 거의 면역.','#c084fc',108,10,{slow:.88,paralysis:.88}],
    ['phoenix_core_plate','불사조 핵갑','ultimate','최대 체력 +115, 방어 +11, 화상 면역에 가까움.','#fb7185',115,11,{burn:.95}],
    ['absolute_crown_mail','절대왕관 갑주','ultimate','최대 체력 +120, 방어 +11, 빙결/마비 강저항.','#bae6fd',120,11,{freeze:.82,paralysis:.82}],
    ['plague_nullifier','역병무효 장갑','ultimate','최대 체력 +112, 방어 +10, 독 면역에 가까움.','#84cc16',112,10,{poison:.95}],
    ['singularity_shell','특이점 외피','ultimate','최대 체력 +118, 방어 +12, 모든 저항 50%.','#818cf8',118,12,{burn:.50,poison:.50,freeze:.50,paralysis:.50,slow:.50}],
    ['sun_moon_aegis','해와 달의 방벽','ultimate','최대 체력 +116, 방어 +11, 화상/빙결 거의 면역.','#fef08a',116,11,{burn:.85,freeze:.85}],
    ['endless_warplate','영겁 전쟁갑','ultimate','최대 체력 +132, 방어 +13. 순수 탱킹 최강.','#e5e7eb',132,13,{}],
    ['akasha_sanctum','아카샤 성역복','ultimate','최대 체력 +108, 방어 +10, 모든 저항 62%.','#f0abfc',108,10,{burn:.62,poison:.62,freeze:.62,paralysis:.62,slow:.62}]
  ];
  v22ArmorDefs.forEach(a=>ARMORS.push(armor(...a)));

  // 3) 스킬 50종 추가: 공격/버프/회복/디버프/정화가 섞여 스킬 뽑기 풀 확장.
  const v22SkillDefs = [
    ['flame_serpent','화염뱀 소환','fire','serpent','attack','불뱀 궤적이 보스를 향해 휘어집니다.'],
    ['blizzard_nail','빙설 못비','ice','rain','attack','얼음 못들이 일정 범위에 떨어집니다.'],
    ['thunder_judgement','천둥 심판','lightning','bolt','attack','보스 머리 위로 굵은 낙뢰가 떨어집니다.'],
    ['void_gate_cannon','공허문 포격','void','beam','attack','공허의 문에서 굵은 광선이 발사됩니다.'],
    ['iron_drill','강철 드릴','metal','pierce','attack','전방을 꿰뚫는 드릴 이펙트.'],
    ['toxic_swamp','맹독 늪','poison','zone','debuff','독 장판으로 보스를 중독시킵니다.'],
    ['solar_orbital','태양 궤도포','solar','orbital','attack','작은 태양이 궤도에서 떨어집니다.'],
    ['gravity_cage','중력 감옥','gravity','bind','debuff','보스의 이동과 패턴 템포를 늦춥니다.'],
    ['chrono_cut','시간 절단','chrono','slash','attack','시간이 늦게 베이는 추가 참격.'],
    ['rose_verdict','장미 판결','nature','thorn','debuff','가시가 보스에게 취약 표식을 겁니다.'],
    ['aqua_lance','수압 창','water','lance','attack','물기둥 창이 직선으로 치솟습니다.'],
    ['spirit_guard','영혼 수호','spirit','shield','buff','짧은 시간 받는 피해를 줄입니다.'],
    ['blood_surge','혈류 폭주','blood','buff','buff','피해와 흡혈을 잠시 올립니다.'],
    ['mirror_burst','거울 파열','mirror','burst','attack','거울 조각이 보스 주변에서 터집니다.'],
    ['sandglass_bind','모래시계 속박','sand','slow','debuff','보스에게 강한 슬로우를 겁니다.'],
    ['wind_afterimage','바람 잔상','wind','haste','buff','이동속도와 구르기 감각을 강화합니다.'],
    ['holy_recover','성광 회복','solar','heal','heal','즉시 체력을 회복합니다.'],
    ['worldtree_regen','세계수 재생','nature','regen','heal','짧은 시간 지속 회복을 부여합니다.'],
    ['pure_antidote','순백 해독','nature','cleanse_poison','cleanse','독을 해제하고 저항을 조금 줍니다.'],
    ['flame_purify','화상 정화','fire','cleanse_burn','cleanse','화상 상태를 해제합니다.'],
    ['frost_release','해빙 의식','ice','cleanse_freeze','cleanse','빙결 상태를 해제합니다.'],
    ['lightning_ground','전류 접지진','lightning','cleanse_paralysis','cleanse','마비 상태를 해제합니다.'],
    ['slow_breaker','슬로우 브레이커','chrono','cleanse_slow','cleanse','슬로우 상태를 해제합니다.'],
    ['origin_cleanse','근원 대정화','spirit','cleanse_all','cleanse','모든 상태이상을 해제합니다.'],
    ['starfall_chain','성운 사슬낙하','arcane','chain','attack','별빛 사슬이 순차적으로 낙하합니다.'],
    ['dragon_breath','용의 숨결','fire','cone','attack','전방 부채꼴 화염 숨결.'],
    ['ice_labyrinth','얼음 미궁','ice','zone','debuff','보스를 둔화시키는 얼음장판.'],
    ['storm_crown','폭풍 왕관','lightning','buff','buff','치명타와 스킬 피해를 올립니다.'],
    ['abyssal_mark','심연 낙인','void','mark','debuff','보스 받는 피해를 증가시킵니다.'],
    ['meteor_cluster','유성 군집','fire','rain','attack','여러 개 유성이 떨어집니다.'],
    ['tidal_prison','해류 감옥','water','bind','debuff','보스의 움직임을 약하게 묶습니다.'],
    ['iron_fortitude','강철 의지','metal','buff','buff','방어와 최대 체력을 잠시 올립니다.'],
    ['blood_heal','피의 역류 회복','blood','heal_big','heal','큰 회복을 얻지만 잠시 후퇴가 필요합니다.'],
    ['moon_barrier','달빛 장막','arcane','shield','buff','보호막을 얻습니다.'],
    ['chaos_grenade','혼돈 수류탄','chaos','burst','attack','무작위 속성 폭발이 일어납니다.'],
    ['plague_clean_room','무균 구역','poison','cleanse_all','cleanse','장판형 정화 구역을 만듭니다.'],
    ['gravity_pulse','중력 맥동','gravity','burst','attack','보스 주변 중력이 터집니다.'],
    ['time_overclock','시간 오버클럭','chrono','buff','buff','쿨타임 회복 속도를 잠시 높입니다.'],
    ['sun_spear_rain','태양창 비','solar','rain','attack','태양창이 순서대로 떨어집니다.'],
    ['mirror_decoy','거울 미끼','mirror','buff','buff','짧은 시간 피격 위험을 낮춥니다.'],
    ['venom_bite','독사의 이빨','poison','strike','debuff','보스에게 독과 취약을 함께 겁니다.'],
    ['arcane_missile_storm','비전 유도탄 폭풍','arcane','orb','attack','유도탄이 연속으로 발사됩니다.'],
    ['earth_shatter','대지 파쇄','earth','slam','attack','바닥을 깨며 원형 충격파를 냅니다.'],
    ['spirit_resurrection','영혼 소생','spirit','heal_big','heal','큰 회복과 잠깐의 보호막.'],
    ['freeze_null','냉기 무효화','ice','cleanse_freeze','cleanse','빙결 해제 후 냉기 저항을 줍니다.'],
    ['paralysis_null','마비 무효화','lightning','cleanse_paralysis','cleanse','마비 해제 후 전류 저항을 줍니다.'],
    ['burn_null','화염 무효화','fire','cleanse_burn','cleanse','화상 해제 후 화염 저항을 줍니다.'],
    ['poison_null','독성 무효화','poison','cleanse_poison','cleanse','독 해제 후 독 저항을 줍니다.'],
    ['void_singularity','공허 특이점','void','burst','attack','검은 구체가 터지며 큰 피해를 줍니다.'],
    ['ultimate_harmony','궁극 조화','spirit','cleanse_all','cleanse','모든 상태이상 해제와 회복을 동시에 노립니다.']
  ];
  v22SkillDefs.forEach((s,i)=>{
    const rarity = rr(i+7, v22SkillDefs.length+8);
    const r = getRarity(rarity);
    const cat = s[4];
    const cdBase = cat==='attack' ? 4.8+(i%6)*.45 : cat==='buff' ? 10.5+(i%5)*.7 : cat==='heal' ? 9.5+(i%5)*.8 : cat==='debuff' ? 8.5+(i%5)*.6 : 12.0+(i%4)*.8;
    SKILLS.push({
      id:'v22_'+s[0], name:s[1], element:s[2], type:s[3], category:cat, rarity,
      color:elementColor(s[2]), power:(cat==='attack'?1.15:cat==='heal'?1.00:cat==='debuff'?.80:1.0)*r.power,
      cooldown:cdBase/Math.min(1.32,r.power), radius:95+(i%8)*13,
      duration:cat==='buff'?6+(i%4):cat==='debuff'?5+(i%4)*.7:cat==='heal'?2.5:1,
      desc:s[5]
    });
  });

  // 4) 패시브 10종 추가. 회복은 여전히 5초당으로 밸런스 유지.
  const v22Passives = [
    ['passive_v22_weapon_master','무기 장인','epic','기본 공격 피해 +18%, 치명타 확률 +4%',p=>{p.basicDamageMul*=1.18;p.crit+=4;}],
    ['passive_v22_boss_reader','패턴 분석가','super','보스 피해 +10%, 이동속도 +6%',p=>{p.damageMul*=1.10;p.speed*=1.06;}],
    ['passive_v22_last_stand','최후의 집중','legendary','체력 35% 이하일 때 피해가 크게 증가',p=>{p.berserk=true;p.damageMul*=1.08;}],
    ['passive_v22_clean_breath','정화 호흡','rare','5초마다 체력 회복 +8, 독/화상 저항 소폭',p=>{p.regen5+=8;p.statusResist.poison+=.12;p.statusResist.burn+=.12;}],
    ['passive_v22_gale_roll','질풍 구르기','epic','구르기 쿨타임 추가 감소, 이동속도 +8%',p=>{p.rollCdBonus=(p.rollCdBonus||0)+.25;p.speed*=1.08;}],
    ['passive_v22_arcane_kernel','비전 핵','rare','스킬 피해 +12%',p=>{p.skillDamageMul*=1.12;}],
    ['passive_v22_steel_nerves','강철 신경','super','마비/슬로우 저항 +25%',p=>{p.statusResist.paralysis+=.25;p.statusResist.slow+=.25;}],
    ['passive_v22_frozen_blood','서리 피','super','빙결 저항 +35%, 최대 체력 +8%',p=>{p.statusResist.freeze+=.35;p.maxHp*=1.08;}],
    ['passive_v22_star_critical','성흔 치명','legendary','치명타 확률 +18%, 치명타 피해 +18%',p=>{p.crit+=18;p.critDmg+=.18;}],
    ['passive_v22_origin_optimizer','근원 최적화','ultimate','피해/스킬/체력/쿨타임을 모두 강화',p=>{p.damageMul*=1.16;p.skillDamageMul*=1.16;p.maxHp*=1.16;p.cooldownMul*=.90;}]
  ];
  v22Passives.forEach(d=>PASSIVES.push({id:d[0],name:d[1],rarity:d[2],desc:d[3],apply:d[4],type:'passive'}));

  // 5) 보스 5마리 추가: 각각 3개 이상의 고유 기믹 패턴 포함.
  const v22Bosses = [
    bossDef('crimson_train', '진홍 열차 오르페온', 7, 'metal', '#ef4444', '#facc15', 150000, '맵 전체를 가로지르는 열차 레일과 정차 신호를 읽어야 하는 보스입니다.', ['돌진 열차', '정차 신호', '레일 전환']),
    bossDef('oracle_cube', '예언 큐브 라플라스', 8, 'arcane', '#a78bfa', '#38bdf8', 168000, '큐브의 색과 순서를 기억해 안전 칸을 찾아야 합니다.', ['색상 기억', '큐브 회전', '안전 순서']),
    bossDef('hollow_gardener', '공허 정원사 엘드', 8, 'nature', '#22c55e', '#8b5cf6', 176000, '잡초 소환수와 독성 정원을 관리하며 싸우는 기믹형 보스입니다.', ['잡초 처리', '독성 정원', '꽃봉오리 파훼']),
    bossDef('magnet_judge', '자석 재판관 폴라리스', 9, 'gravity', '#60a5fa', '#fb7185', 194000, '양극/음극 표식을 보고 밀림과 끌림을 활용해야 합니다.', ['N/S 극성', '자력 벽', '극성 심판']),
    bossDef('dream_jester', '악몽 광대 니브', 10, 'chaos', '#f472b6', '#fde047', 214000, '가짜 예고와 진짜 예고를 구분해야 하는 최상위 속임수 보스입니다.', ['가짜 예고', '카드 선택', '악몽 미니게임'])
  ];
  v22Bosses.forEach(b=>BOSSES.push(b));

  // 6) 보스 패턴 퀄리티 강화: 전장 기반, 기억/선택/처리/도주 기믹을 더 섞는다.
  function v22Announce(text, kind, color){ v20BossCast(text, kind || 'cast', color || (boss&&boss.color)||'#fff'); }
  function v22LaneRail(color, tag){
    color=color||boss.color; tag=tag||boss.theme;
    v22Announce('전장 레일: 맵 전체 레일 중 밝아지지 않는 빈 레일로 이동하세요.', 'beam', color);
    const ys=[120,205,290,375,460,545,630].filter(y=>y<H-45);
    const safe=Math.floor(Math.random()*ys.length);
    ys.forEach((y,i)=>{ if(i!==safe) v20Wall(W/2,y,W*.98,36,1.10+i*.08,color,boss.atk*(.50+.04*boss.phase),tag); });
    state.mechanics.push({kind:'safe',x:W-118,y:ys[safe],r:62,life:2.05,color:'#d1fae5'});
  }

  function v22ClockPuzzle(color, tag){
    color=color||boss.color; tag=tag||boss.theme;
    v22Announce('시계 기믹: 시곗바늘 3개가 지나갑니다. 같은 방향으로 따라 움직이세요.', 'beam', color);
    const dir=Math.random()<.5?1:-1;
    for(let i=0;i<3;i++) v20RotBeam(W/2,H/2,i*Math.PI/3,dir*(.55+i*.18),W*1.45,14+i*3,1.05+i*.35,color,boss.atk*.42,tag);
  }
  function v22OrbHunt(color, tag){
    color=color||boss.color; tag=tag||boss.theme;
    v22Announce('핵 처리: 소환된 핵을 빠르게 처리하지 못하면 맵 전체 폭발이 옵니다.', 'cast', color);
    const count=2+(boss.phase>=3?1:0);
    for(let i=0;i<count;i++) homingEnemy(color);
    setTimeout(()=>{ if(state.raid && boss && !boss.dead && state.adds && state.adds.length>0) v20Circle(W/2,H/2,260,0.2,color,boss.atk*1.25,tag); }, 2600);
  }
  function v22SafeMemory(color, tag){
    color=color||boss.color; tag=tag||boss.theme;
    v22Announce('순서 기억: 룬 순서를 외워 밟으면 보스가 약화됩니다.', 'cast', color);
    spawnMemoryMiniGame();
    if(boss.phase>=3) setTimeout(()=>v22LaneRail(color,tag),900);
  }
  function v22BreakFloorPlus(color, tag){
    color=color||boss.color; tag=tag||boss.theme;
    v22Announce('붕괴 바닥: 금 간 칸을 피해 다음 안전 칸으로 이동하세요.', 'slam', color);
    v20P3Tiles(color,tag);
    if(boss.phase>=2) setTimeout(()=>v20P3Tiles(color,tag),850);
  }
  function v22ChoiceTrap(color, tag){
    color=color||boss.color; tag=tag||boss.theme;
    v22Announce('선택 함정: 진짜 안전지대와 가짜 안전지대를 구분하세요.', 'cast', color);
    spawnColorPolarity();
    if(boss.tier>=9) setTimeout(()=>v22ClockPuzzle(color,tag),1100);
  }
  function v22MazeAndChase(color, tag){
    color=color||boss.color; tag=tag||boss.theme;
    v22Announce('미로 추격: 벽이 닫히기 전에 탈출하고 추적탄을 피하세요.', 'cast', color);
    spawnMazeEscape();
    v20AddBullets(color,tag,6+boss.phase*2);
  }
  function v22ArenaCombo(color, tag){
    const choices=[v22LaneRail,v22ClockPuzzle,v22OrbHunt,v22SafeMemory,v22BreakFloorPlus,v22ChoiceTrap,v22MazeAndChase];
    choices[Math.floor(Math.random()*choices.length)](color||boss.color, tag||boss.theme);
  }

  // 기존 보스에도 패턴을 더 추가한다. 각 보스는 최소 3개 이상이며, 중후반은 5~7개까지 순환.
  Object.keys(V20_PATTERNS).forEach(id=>{
    const b=BOSSES.find(x=>x.id===id);
    if(!b || !Array.isArray(V20_PATTERNS[id])) return;
    const c=b.color, tag=b.theme;
    V20_PATTERNS[id].push(()=>v22ArenaCombo(c,tag));
    if(b.tier>=5) V20_PATTERNS[id].push(()=>v22OrbHunt(c,tag));
    if(b.tier>=7) V20_PATTERNS[id].push(()=>v22SafeMemory(c,tag));
    if(b.tier>=9) V20_PATTERNS[id].push(()=>v22ChoiceTrap(c,tag));
  });

  V20_PATTERNS.crimson_train = [
    ()=>v22LaneRail('#ef4444','metal'),
    ()=>{ v22Announce('진홍 열차: 정차 신호가 켜진 선은 잠시 후 돌진 열차가 지나갑니다.', 'beam', '#ef4444'); for(let i=0;i<4;i++) v20Wall(W/2,160+i*115,W*.95,30,1.0+i*.22,'#ef4444',boss.atk*.70,'metal'); },
    ()=>{ v22Announce('레일 전환: 가로 레일 뒤 세로 레일이 이어집니다.', 'beam', '#facc15'); v22LaneRail('#ef4444','metal'); setTimeout(()=>{ if(state.raid&&boss&&!boss.dead) for(let i=0;i<4;i++) v20Wall(210+i*285,H/2,26,H*.80,1.0+i*.11,'#facc15',boss.atk*.58,'metal'); },900); },
    ()=>v22OrbHunt('#ef4444','metal')
  ];
  V20_PATTERNS.oracle_cube = [
    ()=>v22SafeMemory('#a78bfa','arcane'),
    ()=>{ v22Announce('라플라스 큐브: 색상 판별 후 맞는 색 원에 들어가세요.', 'cast', '#38bdf8'); spawnColorPolarity(); },
    ()=>v22BreakFloorPlus('#a78bfa','arcane'),
    ()=>v22ClockPuzzle('#38bdf8','arcane')
  ];
  V20_PATTERNS.hollow_gardener = [
    ()=>{ v22Announce('엘드: 잡초 소환수를 처리하지 않으면 독 정원이 번집니다.', 'cast', '#22c55e'); spawnAddsPhase(); setTimeout(()=>state.zones.push({x:W/2,y:H/2,r:210,damage:boss.atk*.06,life:3.1,tick:0,color:'#22c55e',enemy:true,dot:true}),700); },
    ()=>{ v22Announce('꽃봉오리: 봉오리 주변은 곧 폭발합니다. 원 밖으로 이동하세요.', 'slam', '#8b5cf6'); for(let i=0;i<6;i++) v20Circle(rand(80,W-80),rand(120,H-80),44,1.0+i*.12,'#8b5cf6',boss.atk*.52,'poison'); },
    ()=>v22MazeAndChase('#22c55e','poison'),
    ()=>v22OrbHunt('#8b5cf6','poison')
  ];
  V20_PATTERNS.magnet_judge = [
    ()=>{ v22Announce('폴라리스: N/S 극성. 지정 색 안전지대에 들어가세요.', 'cast', '#60a5fa'); spawnColorPolarity(); },
    ()=>{ v22Announce('자력 벽: 밀려나는 방향을 예상하고 빈칸으로 이동하세요.', 'beam', '#fb7185'); v22LaneRail('#60a5fa','gravity'); state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:320,life:2.0,power:Math.random()<.5?260:-220,color:'#60a5fa'}); },
    ()=>v22ClockPuzzle('#60a5fa','gravity'),
    ()=>v22BreakFloorPlus('#fb7185','gravity')
  ];
  V20_PATTERNS.dream_jester = [
    ()=>{ v22Announce('니브: 가짜 예고가 섞입니다. 실제 HIT 네온만 믿고 이동하세요.', 'cast', '#f472b6'); for(let i=0;i<7;i++) v20Circle(rand(80,W-80),rand(120,H-80),38,1.0+i*.08, i%2?'#fde047':'#f472b6',boss.atk*(i%2?.22:.62),'chaos'); },
    ()=>v22ChoiceTrap('#fde047','chaos'),
    ()=>v22SafeMemory('#f472b6','chaos'),
    ()=>{ v22Announce('악몽 피날레: 미로, 탄막, 회전 레이저가 순서대로 옵니다.', 'beam', '#f472b6'); v22MazeAndChase('#f472b6','chaos'); setTimeout(()=>v22ClockPuzzle('#fde047','chaos'),1300); }
  ];

  // 안내 문구에도 추가된 기믹을 반영한다.
  BOSSES.forEach(b=>{
    if(b.tier>=5 && Array.isArray(b.patterns) && !b.patterns.includes('기믹 파훼')) b.patterns.push('기믹 파훼');
    if(b.tier>=8 && Array.isArray(b.patterns) && !b.patterns.includes('페이즈 강화')) b.patterns.push('페이즈 강화');
  });
})();

})();

/* =========================================================
   V24 PATCH - more fair safe zones, movement speed, mini-game gimmicks
========================================================= */
(function raidDungeonV24Patch(){
  // 1) 기본 이동속도 상향. 이후 레이드 시작 때도 적용되도록 makePlayer를 감싼다.
  const v24OldMakePlayer = makePlayer;
  makePlayer = function(){
    const p = v24OldMakePlayer();
    p.speed = Math.max(p.speed || 0, 305);
    return p;
  };
  player.speed = Math.max(player.speed || 0, 305);

  // 2) 이동속도 옵션이 붙은 방어구/패시브 추가.
  function addArmorIfMissing(item){
    if(!ARMORS.some(a=>a.id===item.id)) ARMORS.push(item);
  }
  const runnerCape = armor('v24_runner_cape','질주자의 경량 망토','rare','최대 체력 +22, 방어 +1, 이동속도 +8%. 기믹 회피에 좋은 경량 방어구입니다.','#38bdf8',22,1,{slow:.15});
  runnerCape.speedMul = 1.08;
  const galeBoots = armor('v24_gale_boots','질풍 전투 장화','super','최대 체력 +30, 방어 +2, 이동속도 +12%, 슬로우 저항. 이동 기믹에 강합니다.','#86efac',30,2,{slow:.28});
  galeBoots.speedMul = 1.12;
  const phantomSuit = armor('v24_phantom_suit','환영 기동복','epic','최대 체력 +42, 방어 +3, 이동속도 +15%, 마비 저항. 후반 기믹 대응용입니다.','#c084fc',42,3,{paralysis:.32,slow:.28});
  phantomSuit.speedMul = 1.15;
  const cometArmor = armor('v24_comet_armor','혜성 돌파갑','legendary','최대 체력 +66, 방어 +5, 이동속도 +18%, 빙결/슬로우 저항. 안전지대 이동에 특화됩니다.','#fef08a',66,5,{freeze:.35,slow:.45});
  cometArmor.speedMul = 1.18;
  const horizonAegis = armor('v24_horizon_aegis','지평선 기동 방벽','ultimate','최대 체력 +92, 방어 +7, 이동속도 +22%, 모든 상태이상 저항. 궁극 기동 방어구입니다.','#ffffff',92,7,{burn:.35,poison:.35,freeze:.35,paralysis:.35,slow:.55});
  horizonAegis.speedMul = 1.22;
  [runnerCape,galeBoots,phantomSuit,cometArmor,horizonAegis].forEach(addArmorIfMissing);

  function addPassiveIfMissing(item){
    if(!PASSIVES.some(p=>p.id===item.id)) PASSIVES.push(item);
  }
  addPassiveIfMissing({id:'v24_pathfinder',name:'길잡이의 발걸음',rarity:'rare',desc:'이동속도 +10%. 미로와 안전지대 기믹 대응력이 좋아집니다.',type:'passive',apply:p=>{p.speed*=1.10;}});
  addPassiveIfMissing({id:'v24_gimmick_runner',name:'기믹 러너',rarity:'epic',desc:'이동속도 +14%, 구르기 쿨타임 추가 감소. 후반 보스 파훼에 유리합니다.',type:'passive',apply:p=>{p.speed*=1.14;p.rollCdBonus=(p.rollCdBonus||0)+.18;}});
  addPassiveIfMissing({id:'v24_labyrinth_sense',name:'미궁 감각',rarity:'legendary',desc:'이동속도 +16%, 슬로우 저항 +20%. 미니게임형 기믹에 강합니다.',type:'passive',apply:p=>{p.speed*=1.16;p.statusResist.slow=(p.statusResist.slow||0)+.20;}});

  const v24OldApplyBuild = applyBuild;
  applyBuild = function(){
    v24OldApplyBuild();
    const a = getArmor(state.selectedArmorId);
    if(a && a.speedMul) player.speed = Math.floor(player.speed * a.speedMul);
  };

  // 3) 맵 전체 기준의 안전 칸 패턴. 쉬운 보스일수록 안전 칸이 많고, 어려워도 최소 2개는 남긴다.
  function v24SafeCount(hard){
    const t = boss ? boss.tier : 5;
    let n = t <= 3 ? 6 : t <= 5 ? 5 : t <= 7 ? 4 : t <= 9 ? 3 : 2;
    if(hard) n = Math.max(2, n - 1);
    return n;
  }
  function v24MapwideSafeGrid(opts){
    opts = opts || {};
    const cols = opts.cols || 6;
    const rows = opts.rows || 4;
    const top = 102;
    const bottom = H - 52;
    const cellW = W / cols;
    const cellH = (bottom - top) / rows;
    const total = cols * rows;
    const safeCount = Math.max(2, Math.min(total - 2, opts.safeCount || v24SafeCount(!!opts.hard)));
    const safe = new Set();
    let guard = 0;
    while(safe.size < safeCount && guard++ < 300){
      const idx = Math.floor(Math.random() * total);
      // 안전 칸이 전부 붙지 않도록 약간 흩뿌린다.
      if([...safe].some(v => Math.abs((v%cols)-(idx%cols)) + Math.abs(Math.floor(v/cols)-Math.floor(idx/cols)) <= 0)) continue;
      safe.add(idx);
    }
    const spots = [];
    for(let i=0;i<total;i++){
      const x = cellW * (i % cols + .5);
      const y = top + cellH * (Math.floor(i / cols) + .5);
      if(safe.has(i)){
        const r = Math.min(cellW, cellH) * .28;
        spots.push({x,y,r});
        state.mechanics.push({kind:'safe',x,y,r,life:(opts.warn||1.65)+.72,color:opts.safeColor||'#86efac'});
      } else {
        state.hazards.push({kind:'floor',x,y,w:cellW*.88,h:cellH*.76,warn:opts.warn||1.65,life:opts.life||.72,damage:opts.damage||boss.atk*.82,color:opts.color||boss.color,tag:opts.tag||boss.theme,label:opts.label||'MAP'});
      }
    }
    return spots;
  }
  function v24InAnySafe(spots){
    return spots && spots.some(s => dist(player.x, player.y, s.x, s.y) < s.r + player.r);
  }
  function v24MapwideSafeResolve(spots, delay, damage, color, successText, failText){
    setTimeout(()=>{
      if(!state.raid || !boss || boss.dead) return;
      if(v24InAnySafe(spots)){
        breakBoss(.95);
        healText(successText || '안전지대', player.x, player.y - 34);
      } else {
        hurtPlayer(damage || boss.atk*1.35, color || boss.color, true);
        floatText(failText || '전장 공격 피격!', player.x, player.y - 44, '#fb7185', 20);
      }
    }, Math.floor((delay || 1.75) * 1000));
  }

  // 기존 전장/SAFE 계열을 교체한다.
  safeRuneBombPattern = function(hard){
    boss.mechanicText = '전장 폭발: 맵 전체 칸 중 빛나지 않는 SAFE 칸 2개 이상을 찾아 이동하세요.';
    floatText('전장 공격! SAFE 칸으로 이동!', W/2, 86, '#86efac', 24);
    const warn = hard ? 1.75 : 1.95;
    const spots = v24MapwideSafeGrid({hard, warn, color: hard ? '#facc15' : '#93c5fd', safeColor:'#86efac', damage:boss.atk*(hard?1.45:1.05), label:'SAFE'});
    v24MapwideSafeResolve(spots, warn+.08, boss.atk*(hard?1.65:1.18), hard?'#facc15':'#93c5fd', 'SAFE 성공', 'SAFE 실패');
  };
  instantKillPattern = function(){
    if(!boss) return;
    boss.lastInstantAt = state.time;
    boss.mechanicText = '즉사 패턴! 맵 전체 심판입니다. SAFE 칸 2개 이상 중 하나로 들어가세요.';
    floatText('즉사 패턴! SAFE 칸으로!', W/2, 84, '#fb7185', 30);
    const spots = v24MapwideSafeGrid({hard:true,warn:2.20,color:'#ef4444',safeColor:'#22c55e',damage:boss.atk*2.4,label:'INSTANT'});
    setTimeout(()=>{
      if(!state.raid || !boss || boss.dead) return;
      if(v24InAnySafe(spots)){
        breakBoss(1.35);
        healText('즉사 회피', player.x, player.y - 36);
      } else {
        hurtPlayer(Math.max(player.maxHp*0.82,boss.atk*2.8),'#ef4444',true);
        floatText('즉사급 피해!', player.x, player.y - 48, '#ef4444', 24);
      }
      state.flash = Math.max(state.flash,.28);
    }, 2280);
  };
  spawnCrumblingFloor = function(){
    boss.mechanicText = '부서지는 바닥: 맵 전체가 갈라집니다. 안전 칸은 여러 개 남습니다.';
    const spots = v24MapwideSafeGrid({hard:boss.tier>=8,warn:1.55,color:boss.color,safeColor:'#86efac',damage:boss.atk*.86,label:'FLOOR'});
    floatText('안전 칸을 찾으세요', W/2, 92, '#86efac', 22);
    return spots;
  };
  v20P3Tiles = function(color, tag){
    boss.mechanicText += ' · 전장 붕괴: 맵 전체 칸 중 SAFE 칸을 찾으세요.';
    v24MapwideSafeGrid({hard:boss.tier>=8,warn:1.45,color:color||boss.color,safeColor:'#86efac',damage:boss.atk*.78,tag:tag||boss.theme,label:'TILE'});
  };
  if(typeof v22BreakFloorPlus !== 'undefined'){
    v22BreakFloorPlus = function(color, tag){
      v22Announce('전장 붕괴: 전체 바닥이 순차적으로 무너집니다. 여러 SAFE 칸 중 하나로 이동하세요.', 'slam', color || boss.color);
      v24MapwideSafeGrid({hard:boss.tier>=8,warn:1.55,color:color||boss.color,safeColor:'#86efac',damage:boss.atk*.82,tag:tag||boss.theme,label:'BREAK'});
    };
  }

  // 4) 순서 룬: 룬이 너무 빨리 사라지지 않도록 시간과 판정 안정화.
  spawnMemoryMiniGame = function(){
    boss.mechanicText = '기억 룬: 1 → 2 → 3 순서로 밟으세요. 정답 룬은 완료 표시로 남습니다.';
    const colors=['#60a5fa','#f472b6','#facc15'];
    const spots=[{x:W*.25,y:H*.34},{x:W*.72,y:H*.36},{x:W*.50,y:H*.72}];
    const nodes=spots.map((p,i)=>({x:clamp(p.x+rand(-55,55),110,W-110),y:clamp(p.y+rand(-42,42),128,H-92),r:48,color:colors[i],done:false}));
    state.mechanics.push({kind:'memory',nodes,index:0,life:13.5,color:'#fff',wrongGrace:.75});
    floatText('기억 룬 1 → 2 → 3', W/2, 92, '#ffffff', 22);
  };

  // 5) 별도 미니게임형 기믹. 보스와 싸우지 않고 제한 시간 안에 작은 과제를 수행한다.
  state.miniGame = null;
  state.pendingMiniGame = null;

  function v24MiniGameBossLine(type){
    const name = boss && boss.name ? boss.name : '보스';
    if(type === 'maze') return `${name}가 환영 미궁을 시작합니다! 제한 시간 안에 탈출하세요!`;
    if(type === 'quiz') return `${name}가 심판의 질문을 시작합니다! 정답 원을 밟으세요!`;
    if(type === 'shell') return `${name}가 야바위 환상을 시작합니다! 처음 빛난 컵을 찾으세요!`;
    return `${name}가 특수 기믹을 시작합니다!`;
  }

  function v24QueueMiniGame(type){
    if(state.miniGame || state.pendingMiniGame || !state.raid || !boss || boss.dead) return;
    clearEnemyBullets(true);
    state.hazards.length = 0;
    state.zones.length = 0;
    state.pendingMiniGame = {
      type,
      life: 1.75,
      maxLife: 1.75,
      line: v24MiniGameBossLine(type),
      color: boss.color || '#ffffff'
    };
    boss.mechanicText = state.pendingMiniGame.line;
    boss.patternCd = Math.max(boss.patternCd || 0, 3.0);
    boss.basicCd = Math.max(boss.basicCd || 0, 2.4);
    floatText(state.pendingMiniGame.line, W/2, 92, '#ffffff', 24);
  }

  function v24StartMiniGame(type){
    if(state.miniGame || !state.raid || !boss || boss.dead) return;
    clearEnemyBullets(true);
    state.hazards.length = 0;
    state.zones.length = 0;
    const base = {type, life: type==='maze'?9.5:type==='quiz'?7.0:7.5, maxLife: type==='maze'?9.5:type==='quiz'?7.0:7.5, solved:false, failed:false};
    if(type==='maze'){
      base.title = '미니게임: 제한 시간 안에 미로를 탈출하세요';
      base.exit = {x:W-130,y:140,r:42};
      base.walls = [
        {x:W*.25,y:H*.48,w:22,h:H*.56}, {x:W*.48,y:H*.38,w:W*.36,h:22}, {x:W*.62,y:H*.63,w:22,h:H*.42},
        {x:W*.33,y:H*.72,w:W*.42,h:22}, {x:W*.76,y:H*.36,w:W*.30,h:22}
      ];
    } else if(type==='quiz'){
      const questions = [
        {q:'빛난 순서의 마지막 번호는?', answers:['1','2','3'], correct:2},
        {q:'SAFE 칸은 몇 개 이상 남는다고 했나요?', answers:['1개','2개 이상','없음'], correct:1},
        {q:'즉사 패턴 문구가 보이면?', answers:['보스에게 붙기','SAFE로 이동','가만히 있기'], correct:1}
      ];
      base.quiz = questions[Math.floor(Math.random()*questions.length)];
      base.title = '미니게임: 정답 원을 밟으세요';
      base.choices = [
        {x:W*.26,y:H*.58,r:55,i:0,color:'#60a5fa'},
        {x:W*.50,y:H*.58,r:55,i:1,color:'#f472b6'},
        {x:W*.74,y:H*.58,r:55,i:2,color:'#facc15'}
      ];
    } else {
      base.title = '미니게임: 처음 빛난 컵을 찾아 밟으세요';
      base.correct = Math.floor(Math.random()*3);
      base.reveal = 1.15;
      base.cups = [
        {x:W*.30,y:H*.56,r:54,i:0},
        {x:W*.50,y:H*.56,r:54,i:1},
        {x:W*.70,y:H*.56,r:54,i:2}
      ];
    }
    state.miniGame = base;
    boss.mechanicText = base.title;
    floatText(base.title, W/2, 88, '#ffffff', 24);
    boss.patternCd = Math.max(boss.patternCd, 3.0);
  }
  function v24SolveMiniGame(){
    const g = state.miniGame; if(!g || g.solved || g.failed) return;
    g.solved = true;
    breakBoss(2.0);
    burst(player.x, player.y, '#86efac', 48, 280);
    floatText('미니게임 성공!', W/2, 96, '#86efac', 26);
    setTimeout(()=>{ if(state.miniGame===g) state.miniGame=null; }, 450);
  }
  function v24FailMiniGame(reason){
    const g = state.miniGame; if(!g || g.solved || g.failed) return;
    g.failed = true;
    hurtPlayer(Math.max(22, player.maxHp*.28 + boss.atk*.55), '#fb7185', true);
    burst(player.x, player.y, '#fb7185', 38, 240);
    floatText(reason || '미니게임 실패', player.x, player.y - 48, '#fb7185', 24);
    setTimeout(()=>{ if(state.miniGame===g) state.miniGame=null; }, 550);
  }
  function v24UpdateMiniGame(dt){
    const g = state.miniGame; if(!g) return;
    g.life -= dt;
    if(g.type==='maze'){
      if(dist(player.x,player.y,g.exit.x,g.exit.y) < g.exit.r + player.r) v24SolveMiniGame();
      // 벽을 밟으면 즉사 대신 작은 피해와 넉백. 완전히 불공정하지 않게 처리한다.
      if(!g.wallTick) g.wallTick=0; g.wallTick-=dt;
      if(g.wallTick<=0){
        for(const w of g.walls){
          if(Math.abs(player.x-w.x)<w.w/2+player.r && Math.abs(player.y-w.y)<w.h/2+player.r){
            g.wallTick=.55; hurtPlayer(Math.max(5,boss.atk*.18),'#a78bfa');
            const a=Math.atan2(player.y-w.y,player.x-w.x); player.x+=Math.cos(a)*28; player.y+=Math.sin(a)*28;
            break;
          }
        }
      }
    } else if(g.type==='quiz'){
      for(const c of g.choices){
        if(dist(player.x,player.y,c.x,c.y)<c.r+player.r){
          if(c.i===g.quiz.correct) v24SolveMiniGame(); else v24FailMiniGame('오답!');
          break;
        }
      }
    } else if(g.type==='shell'){
      g.reveal -= dt;
      if(g.reveal<=0){
        for(const c of g.cups){
          if(dist(player.x,player.y,c.x,c.y)<c.r+player.r){
            if(c.i===g.correct) v24SolveMiniGame(); else v24FailMiniGame('야바위 실패!');
            break;
          }
        }
      }
    }
    if(g.life<=0 && !g.solved && !g.failed) v24FailMiniGame('시간 초과!');
  }
  function v24DrawPendingMiniGame(){
    const p = state.pendingMiniGame; if(!p) return;
    const t = clamp(p.life / p.maxLife, 0, 1);
    ctx.save();
    ctx.globalAlpha = .94;
    ctx.fillStyle = 'rgba(2,6,23,.78)';
    roundRect(ctx, W/2 - 430, 80, 860, 88, 24);
    ctx.strokeStyle = p.color || '#ffffff';
    ctx.lineWidth = 3;
    roundRect(ctx, W/2 - 430, 80, 860, 88, 24, true);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#ffffff';
    ctx.font = '900 26px system-ui';
    ctx.fillText('기믹 시작', W/2, 118);
    ctx.font = '800 18px system-ui';
    ctx.fillStyle = '#e0f2fe';
    ctx.fillText(p.line, W/2, 148);
    ctx.fillStyle = p.color || '#93c5fd';
    roundRect(ctx, W/2 - 260, 158, 520 * t, 7, 6);
    ctx.restore();
  }

  function v24DrawMiniGame(){
    const g = state.miniGame; if(!g) return;
    ctx.save();
    ctx.fillStyle='rgba(2,6,23,.34)'; ctx.fillRect(0,88,W,H-88);
    ctx.textAlign='center'; ctx.font='900 24px system-ui'; ctx.fillStyle='#fff'; ctx.fillText(g.title, W/2, 118);
    ctx.font='900 18px system-ui'; ctx.fillStyle = g.life<3 ? '#fb7185' : '#fef08a'; ctx.fillText('남은 시간 '+Math.max(0,g.life).toFixed(1)+'초', W/2, 145);
    if(g.type==='maze'){
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=5; ctx.shadowColor='#a78bfa'; ctx.shadowBlur=18;
      g.walls.forEach(w=>{ctx.fillStyle='rgba(167,139,250,.45)'; ctx.fillRect(w.x-w.w/2,w.y-w.h/2,w.w,w.h); ctx.strokeRect(w.x-w.w/2,w.y-w.h/2,w.w,w.h);});
      ctx.fillStyle='rgba(34,197,94,.45)'; circle(ctx,g.exit.x,g.exit.y,g.exit.r); ctx.strokeStyle='#fff'; circleStroke(ctx,g.exit.x,g.exit.y,g.exit.r); ctx.fillStyle='#fff'; ctx.font='900 16px system-ui'; ctx.fillText('탈출',g.exit.x,g.exit.y+5);
    } else if(g.type==='quiz'){
      ctx.font='900 22px system-ui'; ctx.fillStyle='#ffffff'; ctx.fillText(g.quiz.q, W/2, 178);
      g.choices.forEach(c=>{ctx.fillStyle=c.color+'88'; ctx.shadowColor=c.color; ctx.shadowBlur=15; circle(ctx,c.x,c.y,c.r); ctx.strokeStyle='#fff'; ctx.lineWidth=3; circleStroke(ctx,c.x,c.y,c.r); ctx.fillStyle='#fff'; ctx.font='900 20px system-ui'; ctx.fillText(g.quiz.answers[c.i],c.x,c.y+7);});
    } else if(g.type==='shell'){
      const reveal = g.reveal > 0;
      ctx.font='900 20px system-ui'; ctx.fillStyle='#ffffff'; ctx.fillText(reveal?'빛나는 컵을 기억하세요':'처음 빛난 컵을 밟으세요', W/2, 178);
      g.cups.forEach(c=>{ const good = reveal && c.i===g.correct; ctx.fillStyle=good?'rgba(250,204,21,.72)':'rgba(148,163,184,.45)'; ctx.shadowColor=good?'#facc15':'#93c5fd'; ctx.shadowBlur=good?25:12; roundRect(ctx,c.x-c.r,c.y-c.r,c.r*2,c.r*1.45,18); ctx.strokeStyle='#fff'; ctx.lineWidth=3; ctx.strokeRect(c.x-c.r,c.y-c.r,c.r*2,c.r*1.45); ctx.fillStyle='#fff'; ctx.font='900 18px system-ui'; ctx.fillText(String(c.i+1),c.x,c.y+8); });
    }
    ctx.restore();
  }
  function v24PickMiniGameType(){
    if(!boss) return 'maze';
    if(boss.id && (boss.id.includes('jester') || boss.id.includes('puppet'))) return 'shell';
    if(boss.id && (boss.id.includes('cube') || boss.id.includes('chrono') || boss.id.includes('oracle'))) return 'quiz';
    if(boss.theme==='nature' || boss.theme==='void' || boss.theme==='chaos') return Math.random()<.5?'maze':'shell';
    return Math.random()<.5?'maze':'quiz';
  }

  const v24OldUpdateBoss = updateBoss;
  updateBoss = function(dt){
    if(state.pendingMiniGame){
      clearEnemyBullets(true);
      state.hazards.length = 0;
      state.zones.length = 0;
      boss.hit=Math.max(0,boss.hit-dt);
      boss.vulnerable=Math.max(0,boss.vulnerable-dt);
      boss.patternCd=Math.max(boss.patternCd || 0, 2.0);
      boss.basicCd=Math.max(boss.basicCd || 0, 1.8);
      state.pendingMiniGame.life -= Math.min(dt || .016, .04);
      if(state.pendingMiniGame.life <= 0){
        const nextType = state.pendingMiniGame.type;
        state.pendingMiniGame = null;
        v24StartMiniGame(nextType);
      }
      return;
    }
    if(state.miniGame){
      boss.hit=Math.max(0,boss.hit-dt);
      boss.vulnerable=Math.max(0,boss.vulnerable-dt);
      boss.patternCd=Math.max(boss.patternCd,1.2);
      return;
    }
    v24OldUpdateBoss(dt);
    if(!state.raid || !boss || boss.dead) return;
    if(boss.tier < 7) return;
    if(!boss.v24MiniDone) boss.v24MiniDone = {};
    const hpRate = boss.hp / boss.maxHp;
    const gates = boss.tier>=10 ? [{k:'g75',r:.75},{k:'g50',r:.50},{k:'g25',r:.25}] : boss.tier>=8 ? [{k:'g60',r:.60},{k:'g32',r:.32}] : [{k:'g45',r:.45}];
    for(const g of gates){
      if(hpRate < g.r && !boss.v24MiniDone[g.k]){
        boss.v24MiniDone[g.k] = true;
        setTimeout(()=>{ if(state.raid && boss && !boss.dead && !state.miniGame && !state.pendingMiniGame) v24QueueMiniGame(v24PickMiniGameType()); }, 300);
        break;
      }
    }
  };
  const v24OldUpdate = update;
  update = function(dt){
    v24OldUpdate(dt);
    if(state.screen==='raid' && state.raid) v24UpdateMiniGame(Math.min(dt||.016,.026));
  };
  const v24OldDraw = draw;
  draw = function(){
    v24OldDraw();
    v24DrawPendingMiniGame();
    v24DrawMiniGame();
  };
})();


/* =========================================================
   V25 PATCH - mini-game focus mode
   - 미니게임 중 보스 공격/장판/탄막/존을 정지 또는 제거
   - 보스는 관전 위치로 이동해 구경하는 느낌만 남김
   - 미니게임 종료 후 보스 위치/크기 복구
========================================================= */
(function raidDungeonV25MiniGameFocusPatch(){
  function v25ClearBossOffense(){
    if(!state) return;

    // 미니게임 중에는 보스가 만든 공격 판정이 남아서 플레이어를 방해하지 않도록 제거한다.
    if(Array.isArray(state.projectiles)) {
      state.projectiles = state.projectiles.filter(p => p && p.owner === 'player');
    }
    if(Array.isArray(state.hazards)) {
      // playerStrike는 플레이어 이펙트라 남겨도 피해가 없고, 그 외 보스 장판/레이저는 제거한다.
      state.hazards = state.hazards.filter(h => h && h.kind === 'playerStrike');
    }
    if(Array.isArray(state.zones)) {
      // 보스 독장판/도트존 제거. 플레이어 회복 장판만 남긴다.
      state.zones = state.zones.filter(z => z && z.heal && !z.enemy);
    }
    if(Array.isArray(state.mechanics)) {
      // 미니게임 전용 요소는 state.miniGame 안에서 따로 그려지므로 기존 보스 룬/안전지대는 제거한다.
      state.mechanics = state.mechanics.filter(m => m && m.kind === 'gravity' && m.fromPlayer);
    }
  }

  function v25EnterMiniGameFocus(){
    if(!boss || !state.miniGame) return;
    if(!boss.v25MiniFocus){
      boss.v25MiniFocus = {
        x: boss.x,
        y: boss.y,
        r: boss.r,
        patternCd: boss.patternCd,
        basicCd: boss.basicCd,
        mechanicText: boss.mechanicText
      };
      floatText('미니게임 시작! 보스는 공격하지 않습니다.', W/2, 76, '#ffffff', 22);
    }

    // 보스는 전투 공간 가장자리에서 관전하는 느낌으로 작게 이동한다.
    boss.x = W - 135;
    boss.y = 150;
    boss.r = Math.max(26, Math.min((boss.v25MiniFocus.r || boss.r) * 0.62, 46));
    boss.patternCd = Math.max(boss.patternCd || 0, 99);
    boss.basicCd = Math.max(boss.basicCd || 0, 99);
    boss.hit = 0;
    boss.vulnerable = Math.max(0, boss.vulnerable || 0);
    boss.mechanicText = '미니게임 진행 중: 보스는 공격하지 않고 지켜봅니다.';
    v25ClearBossOffense();
  }

  function v25ExitMiniGameFocus(){
    if(!boss || !boss.v25MiniFocus) return;
    const old = boss.v25MiniFocus;
    boss.x = old.x;
    boss.y = old.y;
    boss.r = old.r;
    boss.patternCd = Math.max(1.6, Math.min(old.patternCd || 2.0, 3.0));
    boss.basicCd = Math.max(1.0, Math.min(old.basicCd || 1.8, 2.6));
    boss.mechanicText = old.mechanicText || '패턴을 보고 움직이세요.';
    boss.v25MiniFocus = null;
  }

  const v25OldUpdate = update;
  update = function(dt){
    if(state.miniGame) v25EnterMiniGameFocus();
    if(state.pendingMiniGame) v25ClearBossOffense();
    v25OldUpdate(dt);
    if(state.miniGame) {
      v25EnterMiniGameFocus();
      // 미니게임 도중 새로 생긴 보스 공격도 즉시 제거한다.
      v25ClearBossOffense();
    } else if(state.pendingMiniGame) {
      v25ClearBossOffense();
    } else {
      v25ExitMiniGameFocus();
    }
  };

  const v25OldDraw = draw;
  draw = function(){
    v25OldDraw();
    if((state.miniGame || state.pendingMiniGame) && boss && !boss.dead){
      ctx.save();
      ctx.globalAlpha = 0.92;
      ctx.fillStyle = 'rgba(2,6,23,.70)';
      roundRect(ctx, W - 270, 96, 230, 72, 18);
      ctx.strokeStyle = boss.color || '#93c5fd';
      ctx.lineWidth = 2;
      roundRect(ctx, W - 270, 96, 230, 72, 18, true);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.font = '900 16px system-ui';
      ctx.fillText('보스 관전 중', W - 155, 124);
      ctx.font = '800 12px system-ui';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(state.pendingMiniGame ? '기믹 시작 준비 중' : '미니게임 동안 공격하지 않음', W - 155, 148);
      ctx.restore();
    }
  };
})();

/* =========================================================
   RAID DUNGEON V27 - TRUE MAZE + NO MEMORY RUNES + UNIQUE BOSS PATTERNS + MELEE FIX
   - 1->2->3 순서 룬 완전 제거
   - 미니게임 미로를 실제 S자형 벽 미로로 교체
   - 보스별 색만 다른 레이저 반복을 줄이고 이름/테마별 고유 패턴 강화
   - 근접 무기는 실제 근접 판정 + 높은 피해, 원거리 무기는 투사체 유지
========================================================= */
(function raidDungeonV27TrueMazeUniqueBossPatch(){
  try { document.title = 'Raid Dungeon'; } catch(e) {}
  try { console.log('[RaidDungeon] V27 true maze / unique boss pattern patch loaded'); } catch(e) {}

  function v27BossColor(){ return (boss && (boss.color || boss.sub)) || '#93c5fd'; }
  function v27BossSub(){ return (boss && (boss.sub || boss.color)) || '#ffffff'; }
  function v27BossTag(){ return (boss && (boss.theme || boss.id)) || 'boss'; }
  function v27SafeText(text, color){ if(boss) boss.mechanicText = text; floatText(text, W/2, 82, color || '#ffffff', 16); }
  function v27IsRangedWeapon(w){ const k=(w && w.kind) || ''; return k.includes('staff') || k.includes('bow') || k === 'gunstaff' || k === 'grimoire' || k === 'chakram'; }
  function v27MeleeMul(w){ const k=(w && w.kind) || ''; if(k==='dagger') return 1.38; if(k==='greatsword') return 1.82; if(k==='pole') return 1.58; if(k==='whip') return 1.42; if(k==='scythe') return 1.66; if(k.includes('sword')) return 1.50; return 1.35; }
  function v27QueueMini(type, line, color){
    if(!state || state.miniGame || state.pendingMiniGame || !state.raid || !boss || boss.dead) return;
    state.pendingMiniGame = { type: type || 'maze', life: 1.55, maxLife: 1.55, line: line || '보스가 특수 기믹을 시작합니다!', color: color || v27BossColor() };
    clearEnemyBullets && clearEnemyBullets(true);
    if(Array.isArray(state.hazards)) state.hazards.length = 0;
    if(Array.isArray(state.zones)) state.zones = state.zones.filter(z=>z && z.heal && !z.enemy);
  }

  // 순서 룬은 요청대로 완전히 제거하고, 해당 패턴 호출은 짧은 퀴즈/색상 판별 기믹으로 대체한다.
  try {
    spawnMemoryMiniGame = function(){
      const color = (boss && (boss.sub || boss.color)) || '#fef08a';
      v27SafeText('순서 룬 기믹 제거: 대신 색상/퀴즈 판단 기믹이 시작됩니다.', color);
      if(typeof spawnColorPolarity === 'function') spawnColorPolarity();
      else v27QueueMini('quiz', `${boss ? boss.name : '보스'}가 판단 퀴즈를 시작합니다! 정답 원을 밟으세요!`, color);
    };
  } catch(e) {}

  // 기존에 남아 있는 memory mechanic도 즉시 삭제한다.
  const v27OldUpdateMechanics = updateMechanics;
  updateMechanics = function(dt){
    if(Array.isArray(state.mechanics)) state.mechanics = state.mechanics.filter(m => m && m.kind !== 'memory');
    v27OldUpdateMechanics(dt);
    if(Array.isArray(state.mechanics)) state.mechanics = state.mechanics.filter(m => m && m.kind !== 'memory');
  };

  // 미니게임형 미로를 실제 벽을 헤치고 나가는 S자 미로로 교체한다.
  function v27EnhanceMazeMiniGame(){
    const g = state && state.miniGame;
    if(!g || g.type !== 'maze' || g.v27TrueMaze) return;
    g.v27TrueMaze = true;
    g.title = '환영 미궁: 벽 사이 길을 찾아 탈출하세요';
    g.life = Math.max(g.life || 0, 12.0);
    g.maxLife = Math.max(g.maxLife || 0, 12.0);
    const top = 128, bottom = H - 56, left = 64, right = W - 72;
    const wallT = 22;
    const gapH = 132;
    const walls = [];
    // 외곽 벽
    walls.push({x:W/2,y:top,w:W-120,h:wallT});
    walls.push({x:W/2,y:bottom,w:W-120,h:wallT});
    walls.push({x:left,y:(top+bottom)/2,w:wallT,h:bottom-top});
    walls.push({x:right,y:(top+bottom)/2,w:wallT,h:bottom-top});
    const gates = [];
    const count = 6;
    for(let i=0;i<count;i++){
      const x = 205 + i * ((W - 410) / (count - 1));
      const gapY = i % 2 === 0 ? bottom - 94 : top + 94;
      gates.push({x, y:gapY});
      const upperH = Math.max(0, gapY - gapH/2 - top);
      const lowerH = Math.max(0, bottom - (gapY + gapH/2));
      if(upperH > 20) walls.push({x,y:top+upperH/2,w:wallT,h:upperH});
      if(lowerH > 20) walls.push({x,y:gapY+gapH/2+lowerH/2,w:wallT,h:lowerH});
      // 중간에 작은 보조 벽을 넣어 단순 직선 돌파를 막는다.
      if(i > 0 && i < count - 1){
        const hx = x - ((W - 410) / (count - 1)) / 2;
        const hy = i % 2 === 0 ? top + 170 : bottom - 170;
        walls.push({x:hx,y:hy,w:145,h:18});
      }
    }
    g.walls = walls;
    g.exit = {x:right-42,y:gates[gates.length-1].y,r:40,color:'#22c55e'};
    g.start = {x:left+46,y:gates[0].y};
    if(!state.v27MiniRestore) state.v27MiniRestore = {x:player.x,y:player.y};
    player.x = g.start.x;
    player.y = g.start.y;
    player.aim = 0;
    player.face = 1;
    v27SafeText('진짜 미로 시작! 벽에 닿으면 피해를 받습니다. 제한 시간 안에 탈출하세요!', '#a78bfa');
  }

  const v27OldUpdate = update;
  update = function(dt){
    v27OldUpdate(dt);
    if(state && state.miniGame && state.miniGame.type === 'maze') v27EnhanceMazeMiniGame();
    if(state && !state.miniGame && state.v27MiniRestore){
      state.v27MiniRestore = null;
    }
  };

  // 근접 무기는 원거리 투사체가 나가지 않도록 명확히 분리하고, 위험을 감수하는 만큼 피해를 올린다.
  basicAttack = function(){
    if(!state.raid || player.basicCd > 0) return;
    const w = state.raid.weapon;
    if(!w){ toast('장착한 무기가 없어 일반공격을 사용할 수 없습니다.'); player.basicCd = .6; return; }
    const angle = aimAngle();
    const ranged = v27IsRangedWeapon(w);
    const meleeMul = ranged ? 1.00 : v27MeleeMul(w);
    const dmg = player.atk * player.basicDamageMul * w.atk * meleeMul;
    player.basicCd = ranged ? Math.max(w.speed, .38) : Math.max(.08, w.speed * .82);
    player.attackAnim = .20 + Math.min(.20, player.basicCd * .28);
    player.attackAngle = angle;
    if(Math.cos(angle)<0) player.face=-1; if(Math.cos(angle)>0) player.face=1;

    if(ranged){
      const count = w.kind === 'grimoire' ? 3 : 1;
      for(let i=0;i<count;i++){
        const a = angle + (i-(count-1)/2) * .12;
        const isBow = w.kind.includes('bow');
        spawnProjectile({owner:'player',x:player.x+Math.cos(a)*22,y:player.y+Math.sin(a)*22,vx:Math.cos(a)*(isBow?930:670),vy:Math.sin(a)*(isBow?930:670),r:w.kind==='gunstaff'?8:5,life:w.kind==='chakram'?1.18:.90,pierce:isBow?2:0,color:w.color,damage:dmg,splash:w.kind==='gunstaff'?58:0,returning:w.kind==='chakram',homing:w.kind==='grimoire'});
      }
      return;
    }

    const k = w.kind || '';
    if(k === 'whip'){
      damageBossCone(Math.min(w.range, 305), Math.PI * .70, angle, dmg, w.color);
      arcEffect(player.x, player.y, angle, Math.min(w.range,305), w.color, Math.PI * .70);
    } else if(k === 'dagger'){
      for(let i=0;i<3;i++) setTimeout(()=>{ if(state.raid){ damageBossLine(Math.min(w.range + 12, 135), 24, angle, dmg*.50, w.color); stabEffect(player.x,player.y,angle,Math.min(w.range+12,135),w.color); } }, i*38);
    } else if(k === 'greatsword'){
      damageBossCone(Math.min(w.range + 24, 225), Math.PI * .52, angle, dmg*1.18, w.color);
      slashEffect(player.x,player.y,angle,Math.min(w.range+24,225),w.color,20);
    } else if(k === 'pole'){
      damageBossLine(Math.min(w.range + 18, 260), 28, angle, dmg*1.05, w.color);
      thrustEffect(player.x,player.y,angle,Math.min(w.range+18,260),w.color);
    } else if(k === 'scythe'){
      damageBossCone(Math.min(w.range*.45, 285), Math.PI * .82, angle, dmg*1.12, w.color);
      arcEffect(player.x,player.y,angle,Math.min(w.range*.45,285),w.color,Math.PI*.82);
      slashEffect(player.x,player.y,angle,Math.min(w.range*.45,285),w.color,16);
    } else {
      damageBossCone(Math.min(w.range + 12, 210), Math.PI * .46, angle, dmg, w.color);
      slashEffect(player.x,player.y,angle,Math.min(w.range+12,210),w.color,10);
    }
  };

  // 보스별 고유 패턴: 레이저 반복을 줄이고, 테마에 맞는 행동을 더 선명하게 분리한다.
  function v27Circle(x,y,r,warn,color,dmg,tag,label){ v20PushHazard({kind:'circle',x,y,r,warn,life:.85,damage:dmg,color,tag,label}); }
  function v27Beam(x,y,a,len,w,warn,color,dmg,tag,label){ v20PushHazard({kind:'beam',x,y,angle:a,len,w,warn,life:.78,damage:dmg,color,tag,label}); }
  function v27Wall(x,y,w,h,warn,color,dmg,tag,label){ v20PushHazard({kind:'wall',x,y,w,h,warn,life:.9,damage:dmg,color,tag,label}); }
  function v27HookPull(color, tag){
    const a = Math.atan2(player.y-boss.y, player.x-boss.x);
    v27SafeText(`${boss.name}: 갈고리를 던집니다! 선에서 벗어나세요.`, color);
    v27Beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,Math.min(760,dist(boss.x,boss.y,player.x,player.y)+160),16,1.05,color,boss.atk*.45,tag,'갈고리');
    setTimeout(()=>{
      if(!state.raid || !boss || boss.dead) return;
      const px=player.x-boss.x, py=player.y-boss.y;
      const along=px*Math.cos(a)+py*Math.sin(a);
      const side=Math.abs(-px*Math.sin(a)+py*Math.cos(a));
      if(along>0 && along<780 && side<42){
        player.x += Math.cos(a+Math.PI)*145; player.y += Math.sin(a+Math.PI)*145;
        player.x=clamp(player.x,42,W-42); player.y=clamp(player.y,90,H-42);
        hurtPlayer(boss.atk*.42,color); floatText('끌려감!',player.x,player.y-40,color,18);
      }
    },1080);
  }
  function v27FlameBreath(color, tag){
    const a=Math.atan2(player.y-boss.y,player.x-boss.x);
    v27SafeText(`${boss.name}: 부채꼴 화염 숨결! 보스 옆이나 뒤로 이동하세요.`, color);
    for(let i=-3;i<=3;i++){
      const aa=a+i*.13;
      setTimeout(()=>v27Beam(boss.x+Math.cos(aa)*190,boss.y+Math.sin(aa)*190,aa,470,22,0.72,color,boss.atk*.52,tag,'화염'),(i+3)*70);
    }
    for(let i=0;i<12;i++) setTimeout(()=>aimBullet(boss.x,boss.y,boss.x+Math.cos(a+rand(-.45,.45))*500,boss.y+Math.sin(a+rand(-.45,.45))*500,260,color,boss.atk*.18,tag),i*55);
  }
  function v27Charge(color, tag){
    const a=Math.atan2(player.y-boss.y,player.x-boss.x);
    v27SafeText(`${boss.name}: 돌진 준비! 옆으로 구르세요.`, color);
    v27Beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,850,26,1.10,color,boss.atk*.76,tag,'돌진');
    setTimeout(()=>{ if(state.raid && boss && !boss.dead){ boss.x=clamp(boss.x+Math.cos(a)*260,80,W-80); boss.y=clamp(boss.y+Math.sin(a)*260,120,H-80); burst(boss.x,boss.y,color,28,260); } },1150);
  }
  function v27PoisonGarden(color, tag){
    v27SafeText(`${boss.name}: 독꽃 정원을 피하세요. 꽃이 핀 곳은 잠시 위험합니다.`, color);
    for(let i=0;i<5+boss.phase;i++){
      const x=rand(100,W-100), y=rand(125,H-80);
      v27Circle(x,y,42+boss.phase*4,1.05+i*.08,color,boss.atk*.38,tag,'독꽃');
      setTimeout(()=>{ if(state.raid) state.zones.push({x,y,r:46,damage:boss.atk*.035,life:2.0,tick:0,color,enemy:true,dot:true}); },1150+i*80);
    }
  }
  function v27IcePrison(color, tag){
    v27SafeText(`${boss.name}: 얼음 감옥! 막히지 않는 길을 찾아 빠져나오세요.`, color);
    const gap = Math.floor(Math.random()*5);
    for(let i=0;i<5;i++) if(i!==gap) v27Wall(160+i*(W-320)/4,H/2,28,H*.72,1.15,color,boss.atk*.55,tag,'빙벽');
    for(let i=0;i<4;i++) v27Circle(player.x+rand(-130,130),player.y+rand(-90,90),32,1.0+i*.12,color,boss.atk*.38,tag,'빙창');
  }
  function v27SandSink(color, tag){
    v27SafeText(`${boss.name}: 모래 늪이 생깁니다. 중앙으로 빨려들기 전에 빠져나오세요.`, color);
    state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:260,life:2.6,power:150,color});
    v20PushHazard({kind:'donut',x:W/2,y:H/2,inner:70,outer:250,warn:1.5,life:.9,damage:boss.atk*.74,color,tag,label:'모래늪'});
  }
  function v27VoidPortal(color, tag){
    v27SafeText(`${boss.name}: 공허 포탈이 열립니다. 포탈 사이 절단선을 피하세요.`, color);
    const pts=[{x:110,y:130},{x:W-110,y:H-80},{x:W-120,y:135},{x:120,y:H-75}];
    for(let i=0;i<2;i++){ const p=pts[i*2], q=pts[i*2+1]; const a=Math.atan2(q.y-p.y,q.x-p.x); v27Beam((p.x+q.x)/2,(p.y+q.y)/2,a,dist(p.x,p.y,q.x,q.y),20,1.15+i*.25,color,boss.atk*.62,tag,'포탈'); }
    for(let i=0;i<2+boss.phase;i++) homingEnemy(color);
  }
  function v27BloodMark(color, tag){
    v27SafeText(`${boss.name}: 혈월 표식이 따라옵니다. 터지기 전에 멀리 빼세요.`, color);
    const x=player.x, y=player.y;
    v27Circle(x,y,84,1.45,color,boss.atk*.78,tag,'혈월');
    setTimeout(()=>{ if(state.raid) state.zones.push({x,y,r:72,damage:boss.atk*.045,life:2.2,tick:0,color,enemy:true,dot:true}); },1480);
  }
  function v27StormPillars(color, tag){
    v27SafeText(`${boss.name}: 낙뢰 기둥! 번개 사이 빈칸을 찾으세요.`, color);
    const lanes=6, safe=Math.floor(Math.random()*lanes);
    for(let i=0;i<lanes;i++) if(i!==safe) v27Wall(120+i*(W-240)/(lanes-1),H/2,34,H*.84,1.05+i*.06,color,boss.atk*.48,tag,'낙뢰');
    state.mechanics.push({kind:'safe',x:120+safe*(W-240)/(lanes-1),y:H*.72,r:55,life:2.0,color:'#d1fae5'});
  }
  function v27MirrorClone(color, tag){
    v27SafeText(`${boss.name}: 거울 분신! 밝은 분신 주변만 안전합니다.`, color);
    const real=Math.floor(Math.random()*4);
    for(let i=0;i<4;i++){
      const x=170+i*(W-340)/3, y=H*.38;
      if(i===real) state.mechanics.push({kind:'safe',x,y,r:55,life:2.0,color:'#d1fae5'});
      else v27Circle(x,y,58,1.25,color,boss.atk*.55,tag,'가짜');
    }
  }
  function v27GravityOrbit(color, tag){
    v27SafeText(`${boss.name}: 중력 궤도! 끌려가며 회전하는 궤도를 피하세요.`, color);
    state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:300,life:2.9,power:210,color});
    for(let i=0;i<4;i++) v20PushHazard({kind:'rotatingBeam',x:W/2,y:H/2,angle:i*Math.PI/2,spin:(i%2?-.9:.9),len:W*1.25,w:14,warn:1.25,life:2.2,damage:boss.atk*.38,color,tag,label:'중력'});
  }
  function v27TrainRails(color, tag){
    v27SafeText(`${boss.name}: 열차 레일! 불이 켜지지 않은 레일로 이동하세요.`, color);
    const rows=4, safe=Math.floor(Math.random()*rows);
    for(let i=0;i<rows;i++) if(i!==safe) v27Wall(W/2,150+i*(H-230)/(rows-1),W*.94,38,1.1+i*.08,color,boss.atk*.60,tag,'열차');
    state.mechanics.push({kind:'safe',x:W*.82,y:150+safe*(H-230)/(rows-1),r:50,life:2.0,color:'#86efac'});
  }
  function v27CubeQuiz(color, tag){
    v27SafeText(`${boss.name}: 확률 큐브! 정답 원을 밟는 퀴즈가 시작됩니다.`, color);
    v27QueueMini('quiz', `${boss.name}가 확률 큐브 문제를 냅니다! 정답 원을 밟으세요.`, color);
  }
  function v27JesterShell(color, tag){
    v27SafeText(`${boss.name}: 야바위 환상! 처음 빛난 컵을 기억하세요.`, color);
    v27QueueMini('shell', `${boss.name}가 야바위 환상을 시작합니다! 처음 빛난 컵을 찾으세요.`, color);
  }
  function v27TrueMazePattern(color, tag){
    v27SafeText(`${boss.name}: 환영 미궁! 전투 공간이 미로로 바뀝니다.`, color);
    v27QueueMini('maze', `${boss.name}가 환영 미궁을 시작합니다! 벽 사이 길을 찾아 탈출하세요.`, color);
  }

  const v27PatternPools = {
    slime_king:[()=>v27Circle(player.x,player.y,78,1.0,'#7ddf64',boss.atk*.50,'slime','점프'),()=>radialBullets(boss.x,boss.y,12,155,'#a7f3d0',boss.atk*.18),()=>{for(let i=0;i<4;i++) state.zones.push({x:rand(100,W-100),y:rand(130,H-80),r:44,damage:boss.atk*.025,life:2.2,tick:0,color:'#86efac',enemy:true,dot:true});}],
    ember_tyrant:[()=>v27FlameBreath('#f97316','fire'),()=>v27Circle(player.x,player.y,82,1.2,'#fb923c',boss.atk*.70,'fire','불꽃'),()=>{for(let i=0;i<5;i++) aimBullet(boss.x,boss.y,player.x+rand(-160,160),player.y+rand(-110,110),265,'#fb7185',boss.atk*.28,'fire');}],
    thorn_queen:[()=>v27PoisonGarden('#84cc16','poison'),()=>v27HookPull('#22c55e','poison'),()=>{const gap=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==gap) v27Wall(160+i*(W-320)/4,H/2,24,H*.70,1.10,'#22c55e',boss.atk*.50,'poison','가시');}],
    frost_oracle:[()=>v27IcePrison('#7dd3fc','ice'),()=>v27TrueMazePattern('#bae6fd','ice'),()=>{for(let i=0;i<6;i++) v27Circle(rand(90,W-90),rand(125,H-80),34,1.0+i*.08,'#bae6fd',boss.atk*.42,'ice','빙창');}],
    sand_reaper:[()=>v27SandSink('#f59e0b','sand'),()=>v27Charge('#fbbf24','sand'),()=>v27HookPull('#fde68a','sand')],
    void_serpent:[()=>v27VoidPortal('#8b5cf6','void'),()=>v27TrueMazePattern('#a78bfa','void'),()=>v27GravityOrbit('#a78bfa','void')],
    iron_minotaur:[()=>v27Charge('#94a3b8','metal'),()=>v27Circle(boss.x,boss.y,165,1.1,'#cbd5e1',boss.atk*.72,'metal','충격파'),()=>v27Wall(W/2,H/2,W*.92,34,1.1,'#94a3b8',boss.atk*.62,'metal','도끼파동')],
    blood_moon:[()=>v27BloodMark('#ef4444','blood'),()=>{for(let i=-2;i<=2;i++) v27Beam(boss.x,boss.y,Math.atan2(player.y-boss.y,player.x-boss.x)+i*.22,620,16,1.05,'#fb7185',boss.atk*.42,'blood','칼날');},()=>v27Circle(W/2,H/2,210,1.4,'#be123c',boss.atk*.70,'blood','혈월')],
    storm_colossus:[()=>v27StormPillars('#fde047','lightning'),()=>v27GravityOrbit('#facc15','lightning'),()=>{for(let i=0;i<7;i++) v27Circle(player.x+rand(-180,180),player.y+rand(-130,130),30,0.8+i*.10,'#fde047',boss.atk*.38,'lightning','낙뢰');}],
    plague_doctor:[()=>v27PoisonGarden('#84cc16','poison'),()=>spawnAddsPhase(),()=>{spawnRune('#bef264','cleanse'); state.zones.push({x:W/2,y:H/2,r:230,damage:boss.atk*.05,life:3.0,tick:0,color:'#84cc16',enemy:true,dot:true});}],
    mirror_duelist:[()=>v27MirrorClone('#e879f9','mirror'),()=>v27JesterShell('#f0abfc','mirror'),()=>{for(let i=0;i<4;i++) v27Beam(160+i*(W-320)/3,H/2,Math.PI/2,H*.88,16,1.0+i*.16,'#f0abfc',boss.atk*.45,'mirror','거울');}],
    gravity_core:[()=>v27GravityOrbit('#818cf8','gravity'),()=>v27Circle(W/2,H/2,120,1.4,'#a5b4fc',boss.atk*.80,'gravity','압축'),()=>{for(let i=0;i<7;i++) v27Circle(rand(90,W-90),rand(120,H-80),38,1.0+i*.08,'#a5b4fc',boss.atk*.45,'gravity','운석');}],
    solar_dragon:[()=>v27FlameBreath('#facc15','solar'),()=>v27Circle(player.x,player.y,100,1.25,'#fb923c',boss.atk*.72,'solar','태양'),()=>{const safe=rand(130,W-130); for(let i=0;i<6;i++){const x=110+i*(W-220)/5; if(Math.abs(x-safe)>95) v27Wall(x,H/2,36,H*.82,1.1,'#f97316',boss.atk*.54,'solar','태양기둥');} state.mechanics.push({kind:'safe',x:safe,y:H*.72,r:55,life:2.0,color:'#fde68a'});} ],
    chrono_dragon:[()=>v27CubeQuiz('#fef08a','chrono'),()=>{player.slow=Math.max(player.slow,1.4); for(let i=0;i<8;i++) setTimeout(()=>aimBullet(boss.x,boss.y,player.x+rand(-190,190),player.y+rand(-120,120),185,'#fde047',boss.atk*.25,'chrono'),i*130);},()=>v27Circle(player.x,player.y,88,1.35,'#f472b6',boss.atk*.68,'chrono','시간폭탄')],
    abyss_leviathan:[()=>v27TrueMazePattern('#38bdf8','void'),()=>v27HookPull('#7dd3fc','ice'),()=>{for(let i=0;i<4;i++) v27Wall(W/2,160+i*120,W*.86,26,1.1+i*.13,'#38bdf8',boss.atk*.52,'ice','해일');}],
    puppet_emperor:[()=>v27JesterShell('#fde68a','mirror'),()=>v27HookPull('#f0abfc','mirror'),()=>v27MirrorClone('#f0abfc','mirror')],
    black_sun:[()=>v27FlameBreath('#f97316','solar'),()=>spawnCrumblingFloor(),()=>v27Circle(W/2,H/2,270,1.7,'#facc15',boss.atk*.95,'solar','검은태양')],
    chaos_archon:[()=>v27JesterShell('#c084fc','chaos'),()=>v27TrueMazePattern('#fb7185','chaos'),()=>{[v27FlameBreath,v27StormPillars,v27GravityOrbit,v27PoisonGarden][Math.floor(Math.random()*4)](v27BossColor(), 'chaos');}]
  };

  // V22 추가 보스도 이름/컨셉 기반 고유 기믹을 준다.
  const extra = {
    crimson_train: [()=>v27TrainRails('#fb7185','train'),()=>v27Charge('#fb7185','train'),()=>v27Wall(W/2,H*.50,W*.96,40,1.15,'#f97316',boss.atk*.62,'train','급행열차')],
    prophecy_cube: [()=>v27CubeQuiz('#a5b4fc','cube'),()=>{const safe=Math.floor(Math.random()*4); for(let i=0;i<4;i++) if(i!==safe) v27Circle(W*(i%2?.72:.28),H*(i>1?.70:.34),110,1.2,'#818cf8',boss.atk*.58,'cube','확률');},()=>v27GravityOrbit('#818cf8','cube')],
    void_gardener: [()=>v27PoisonGarden('#4ade80','poison'),()=>spawnAddsPhase(),()=>v27HookPull('#86efac','poison')],
    magnet_judge: [()=>v27GravityOrbit('#60a5fa','gravity'),()=>v27StormPillars('#93c5fd','lightning'),()=>{player.x += (player.x < W/2 ? 110 : -110); player.x=clamp(player.x,42,W-42); v27Circle(player.x,player.y,80,1.15,'#60a5fa',boss.atk*.60,'gravity','자석');}],
    nightmare_jester: [()=>v27JesterShell('#f472b6','chaos'),()=>v27MirrorClone('#f472b6','mirror'),()=>{for(let i=0;i<5;i++) v27Circle(rand(90,W-90),rand(120,H-80),42,1.0+i*.12,'#f472b6',boss.atk*.45,'chaos','폭죽');}]
  };
  Object.keys(extra).forEach(k=>{ v27PatternPools[k] = extra[k]; });

  const v27OldBossPattern = bossPattern;
  bossPattern = function(){
    if(!boss || boss.dead) return;
    if(Array.isArray(state.mechanics)) state.mechanics = state.mechanics.filter(m => m && m.kind !== 'memory');
    const pool = v27PatternPools[boss.id] || v27PatternPools[boss.theme] || null;
    if(pool && pool.length){
      boss._v27PatternIndex = (boss._v27PatternIndex || 0) + 1;
      const fn = pool[(boss._v27PatternIndex - 1) % pool.length];
      try { fn(); } catch(e){ console.warn('[V27 unique pattern fallback]', e); v27OldBossPattern(); }
      if(boss.tier >= 8 && boss.phase >= 2 && Math.random() < .10) setTimeout(()=>{ if(state.raid && boss && !boss.dead) v27QueueMini(v27PickMiniGameType ? v27PickMiniGameType() : 'quiz', `${boss.name}가 추가 기믹을 시작합니다!`, v27BossColor()); }, 1450);
      return;
    }
    v27OldBossPattern();
  };

  try {
    BOSSES.forEach(b=>{
      if(b.id === 'chrono_dragon') b.patterns = ['시간 감속','퀴즈 기믹','지연 탄막'];
      if(b.id === 'chaos_archon') b.patterns = ['야바위','미궁','무작위 속성'];
      if(b.id === 'frost_oracle') b.patterns = ['얼음 감옥','환영 미궁','빙창'];
      if(Array.isArray(b.patterns)) b.patterns = b.patterns.filter(p=>!String(p).includes('룬') && !String(p).includes('순서'));
    });
  } catch(e) {}
})();


/* =========================================================
   V28 PHASE QUALITY / BOSS PATTERN OVERHAUL PATCH
   - 고등급 보스 2/3페이즈 외형 변화
   - 보스별 패턴 퀄리티 강화: 숨결, 돌진, 갈고리, 미니게임, 장판, 전장 패턴
   - 보스 시전 모션/스킬 모션 강화
   - 기존 클릭/저장/방어구/미니게임 패치 유지
========================================================= */
(function raidDungeonV28PhaseQualityPatch(){
  const V28_VERSION = 'V28_PHASE_QUALITY';

  function v28Color(){ return (boss && (boss.color || boss.sub)) || '#93c5fd'; }
  function v28Sub(){ return (boss && (boss.sub || boss.color)) || '#ffffff'; }
  function v28Tag(){ return (boss && (boss.theme || boss.id)) || 'boss'; }
  function v28Phase(){ return boss ? (boss.phase || 1) : 1; }
  function v28Tier(){ return boss ? (boss.tier || 1) : 1; }
  function v28Msg(text, color){
    if(!boss) return;
    boss.mechanicText = text;
    floatText(text, W/2, 88, color || v28Color(), 18);
  }
  function v28Cast(text, kind, color, angle, time){
    if(!boss) return;
    const c = color || v28Color();
    boss.mechanicText = text;
    boss.cast = {life: time || 1.05, max: time || 1.05, kind: kind || 'cast', color: c, angle: Number.isFinite(angle) ? angle : Math.atan2(player.y-boss.y, player.x-boss.x)};
    boss.v28CastLabel = text;
    boss.v28CastPulse = Math.max(boss.v28CastPulse || 0, time || 1.05);
    state.shake = Math.max(state.shake, 1.5 + Math.min(4, v28Tier()*.25));
  }
  function v28Haz(h){
    h.label = h.label || 'HIT';
    h.warn = Math.max(h.warn || 1.0, v28Tier() >= 8 ? 1.05 : .9);
    h.life = Math.max(h.life || .72, .62);
    if(typeof v20PushHazard === 'function') v20PushHazard(h);
    else state.hazards.push(h);
  }
  function v28Circle(x,y,r,warn,color,dmg,tag,label){ v28Haz({kind:'circle',x,y,r,warn,life:.85,damage:dmg,color,tag,label}); }
  function v28Beam(x,y,a,len,w,warn,color,dmg,tag,label){ v28Haz({kind:'beam',x,y,angle:a,len,w,warn,life:.88,damage:dmg,color,tag,label}); }
  function v28Wall(x,y,w,h,warn,color,dmg,tag,label){ v28Haz({kind:'wall',x,y,w,h,warn,life:.95,damage:dmg,color,tag,label}); }
  function v28Donut(x,y,inner,outer,warn,color,dmg,tag,label){ v28Haz({kind:'donut',x,y,inner,outer,warn,life:.86,damage:dmg,color,tag,label}); }
  function v28RotBeam(x,y,a,spin,len,w,warn,color,dmg,tag,label){ v28Haz({kind:'rotatingBeam',x,y,angle:a,spin,len,w,warn,life:2.15,damage:dmg,color,tag,label}); }
  function v28Spark(x,y,color,n,power){
    const c=color||v28Color(), p=power||1;
    burst(x,y,c,Math.floor(n||20),220*p);
    for(let i=0;i<(n||20);i++){
      const a=Math.random()*Math.PI*2;
      state.particles.push({kind:i%3?'star':'line',x,y,vx:Math.cos(a)*rand(60,320)*p,vy:Math.sin(a)*rand(60,320)*p,r:rand(3,9)*p,life:rand(.25,.8),color:c,angle:a,len:rand(18,58)*p});
    }
  }

  // ---------- 스킬 모션 보강: 기존 스킬 판정은 유지하고, 등급/속성별 연출만 추가 ----------
  const v28OldCastAttackSkill = castAttackSkill;
  castAttackSkill = function(s,power,angle,r){
    const rarityPower = {normal:1,rare:1.2,super:1.55,epic:2.0,legendary:2.75,ultimate:3.6}[s.rarity] || 1;
    const c = s.color || '#93c5fd';
    const sx = player.x + Math.cos(angle)*34;
    const sy = player.y + Math.sin(angle)*34;
    state.particles.push({kind:'ring',x:sx,y:sy,vx:0,vy:0,r:30*rarityPower,life:.38,color:c,line:2+rarityPower});
    // 손끝에서 시작되는 시전 궤적
    for(let i=0;i<Math.floor(10+rarityPower*7);i++){
      const a=angle+rand(-.42,.42);
      state.particles.push({kind:'line',x:sx,y:sy,vx:Math.cos(a)*rand(120,460)*rarityPower,vy:Math.sin(a)*rand(120,460)*rarityPower,r:rand(3,9)*rarityPower*.35,life:rand(.22,.55),color:c,angle:a,len:rand(20,72)*rarityPower*.35});
    }
    if(s.element==='fire'||s.element==='solar'){
      for(let i=0;i<8*rarityPower;i++) state.particles.push({kind:'star',x:sx+rand(-20,20),y:sy+rand(-20,20),vx:Math.cos(angle+rand(-.55,.55))*rand(180,520),vy:Math.sin(angle+rand(-.55,.55))*rand(180,520),r:rand(5,12),life:rand(.28,.8),color:i%2?'#fb923c':'#fef08a'});
    } else if(s.element==='ice'){
      for(let i=0;i<8*rarityPower;i++) state.particles.push({kind:'line',x:sx+rand(-15,15),y:sy+rand(-15,15),vx:Math.cos(angle+rand(-.22,.22))*rand(220,560),vy:Math.sin(angle+rand(-.22,.22))*rand(220,560),r:4,life:rand(.35,.8),color:'#bae6fd',angle:angle+rand(-.2,.2),len:rand(38,90)});
    } else if(s.element==='lightning'||s.element==='storm'){
      for(let i=0;i<6*rarityPower;i++) state.particles.push({kind:'line',x:sx+rand(-35,35),y:sy+rand(-35,35),vx:0,vy:rand(80,260),r:4,life:.18,color:'#fde047',angle:Math.PI/2,len:rand(70,180)});
    } else if(s.element==='void'||s.element==='gravity'||s.element==='chaos'){
      state.particles.push({kind:'ring',x:boss.x,y:boss.y,vx:0,vy:0,r:70*rarityPower,life:.55,color:c,line:3+rarityPower});
      state.particles.push({kind:'ring',x:boss.x,y:boss.y,vx:0,vy:0,r:110*rarityPower,life:.72,color:'#ffffff',line:1.3+rarityPower*.35});
    }
    if(rarityPower>=2.7) state.flash=Math.max(state.flash,.18+rarityPower*.08);
    return v28OldCastAttackSkill(s,power,angle,r);
  };

  // ---------- 보스 외형: 고등급/페이즈별 모습 차이 ----------
  const v28OldDrawBossShape = drawBossShape;
  drawBossShape = function(c,b,x,y,r){
    const isMain = boss && b && boss.id === b.id;
    const ph = isMain ? (boss.phase || 1) : (b.phase || 1);
    const tier = b.tier || (boss && boss.tier) || 1;
    const phaseScale = ph===3 ? 1.18 : ph===2 ? 1.09 : 1;
    c.save();
    c.translate(x,y);
    // 페이즈 오라: 2페이즈부터 링, 3페이즈부터 왕관/균열 느낌
    if(ph>=2){
      c.globalAlpha = .35;
      c.strokeStyle = b.sub || b.color;
      c.shadowColor = b.color;
      c.shadowBlur = 22 + tier*2;
      c.lineWidth = 4;
      c.beginPath();
      c.arc(0,0,r*(1.32+.05*Math.sin(state.time*4)),0,Math.PI*2);
      c.stroke();
      if(ph>=3){
        c.globalAlpha = .55;
        for(let i=0;i<8;i++){
          c.save();
          c.rotate(i*Math.PI/4 + state.time*.35);
          c.fillStyle = i%2 ? (b.color||'#fff') : (b.sub||'#fff');
          c.beginPath();
          c.moveTo(r*1.02,0);
          c.lineTo(r*1.42,-8);
          c.lineTo(r*1.42,8);
          c.closePath();
          c.fill();
          c.restore();
        }
      }
    }
    c.restore();
    v28OldDrawBossShape(c,b,x,y,r*phaseScale);
  };

  const v28OldDrawBoss = drawBoss;
  drawBoss = function(){
    v28OldDrawBoss();
    if(!boss || boss.dead) return;
    // 시전 모션: 보스가 실제로 공격 준비 중임을 보이게 함
    if(boss.cast && boss.cast.life>0){
      const p = clamp(boss.cast.life / Math.max(.001,boss.cast.max||1),0,1);
      const c = boss.cast.color || boss.color;
      ctx.save();
      ctx.translate(boss.x,boss.y);
      ctx.rotate(boss.cast.angle||0);
      ctx.globalAlpha = .25 + .55*p;
      ctx.shadowColor = c;
      ctx.shadowBlur = 28;
      ctx.strokeStyle = c;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.arc(0,0,boss.r*(1.1+(1-p)*.5),-.9,.9);
      ctx.stroke();
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(boss.r*.65,0);
      ctx.lineTo(boss.r*(1.55+(1-p)*.7),0);
      ctx.stroke();
      ctx.restore();
    }
    if(boss.phase>=2){
      ctx.save();
      ctx.globalAlpha = boss.phase===3 ? .32 : .18;
      ctx.strokeStyle = boss.sub || boss.color;
      ctx.lineWidth = boss.phase===3 ? 5 : 3;
      ctx.shadowColor = boss.color;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.arc(boss.x,boss.y,boss.r*(boss.phase===3?1.8:1.45)+Math.sin(state.time*4)*8,0,Math.PI*2);
      ctx.stroke();
      ctx.restore();
    }
  };

  // ---------- 고퀄리티 패턴 모듈 ----------
  function v28FlameCurtain(){
    const c=v28Color(), tag='fire';
    v28Cast(`${boss.name}: 화염 장막! 비어 있는 틈으로 빠져나가세요.`, 'breath', c, 0, 1.1);
    const gap = rand(180,W-180);
    for(let i=0;i<7;i++){
      const x=90+i*(W-180)/6;
      if(Math.abs(x-gap)>95) v28Wall(x,H/2,34,H*.82,1.05+i*.04,c,boss.atk*.46,tag,'화염기둥');
    }
    setTimeout(()=>{ if(state.raid) v28FlameBreathCore(c,tag); }, 800);
  }
  function v28FlameBreathCore(c,tag){
    const a=Math.atan2(player.y-boss.y,player.x-boss.x);
    v28Cast(`${boss.name}: 불꽃 숨결을 내뿜습니다! 옆/뒤로 피하세요.`, 'breath', c, a, .9);
    for(let i=-4;i<=4;i++) v28Beam(boss.x+Math.cos(a+i*.10)*260,boss.y+Math.sin(a+i*.10)*260,a+i*.10,620,24,0.85+Math.abs(i)*.03,c,boss.atk*.38,tag,'화염숨결');
    for(let i=0;i<10;i++) setTimeout(()=>aimBullet(boss.x,boss.y,player.x+rand(-140,140),player.y+rand(-110,110),330,c,boss.atk*.18,tag),i*75);
  }
  function v28MeteorChess(color,tag){
    const c=color||v28Color();
    v28Cast(`${boss.name}: 운석 체스판! 밝은 칸을 보고 이동하세요.`, 'cast', c, -Math.PI/2, 1.2);
    const cols=5, rows=3;
    const safeA = Math.floor(Math.random()*cols*rows);
    const safeB = (safeA + 3 + Math.floor(Math.random()*5))%(cols*rows);
    for(let j=0;j<rows;j++) for(let i=0;i<cols;i++){
      const idx=j*cols+i, x=120+i*(W-240)/(cols-1), y=155+j*(H-250)/(rows-1);
      if(idx!==safeA && idx!==safeB) v28Circle(x,y,58,1.15+(idx%3)*.08,c,boss.atk*.50,tag,'운석');
      else state.mechanics.push({kind:'safe',x,y,r:48,life:2.05,color:'#d1fae5'});
    }
  }
  function v28IceCathedral(){
    const c='#bae6fd', tag='ice';
    v28Cast(`${boss.name}: 얼음 성당! 벽 사이 길을 찾아 이동하세요.`, 'cast', c, Math.PI/2, 1.1);
    const verticalGap = Math.floor(Math.random()*4);
    for(let i=0;i<4;i++) if(i!==verticalGap) v28Wall(210+i*(W-420)/3,H/2,28,H*.84,1.08,c,boss.atk*.46,tag,'빙벽');
    const horizontalGap = Math.floor(Math.random()*3);
    for(let j=0;j<3;j++) if(j!==horizontalGap) v28Wall(W/2,180+j*(H-300)/2,W*.75,24,1.22,c,boss.atk*.42,tag,'서리벽');
    for(let k=0;k<6;k++) v28Circle(rand(90,W-90),rand(120,H-75),30,1.0+k*.09,c,boss.atk*.32,tag,'빙창');
  }
  function v28StormCircuit(){
    const c='#fde047', tag='lightning';
    v28Cast(`${boss.name}: 회로 낙뢰! 전류가 없는 길을 찾으세요.`, 'beam', c, 0, 1.05);
    const safeCol = Math.floor(Math.random()*6);
    const safeRow = Math.floor(Math.random()*4);
    for(let i=0;i<6;i++) if(i!==safeCol) v28Wall(85+i*(W-170)/5,H/2,26,H*.86,1.05+i*.035,c,boss.atk*.42,tag,'세로전류');
    for(let j=0;j<4;j++) if(j!==safeRow) v28Wall(W/2,135+j*(H-220)/3,W*.92,22,1.15+j*.045,c,boss.atk*.38,tag,'가로전류');
    state.mechanics.push({kind:'safe',x:85+safeCol*(W-170)/5,y:135+safeRow*(H-220)/3,r:54,life:2.15,color:'#bbf7d0'});
  }
  function v28StormChase(){
    const c='#facc15', tag='lightning';
    v28Cast(`${boss.name}: 추적 낙뢰! 표식이 생긴 위치를 밖으로 빼세요.`, 'cast', c, 0, 1.0);
    for(let i=0;i<4+(boss.phase||1);i++){
      const x=player.x+rand(-160,160), y=player.y+rand(-120,120);
      v28Circle(clamp(x,80,W-80),clamp(y,110,H-70),40,0.95+i*.13,c,boss.atk*.36,tag,'추적낙뢰');
    }
    if(boss.phase>=3) for(let k=0;k<2;k++) v28RotBeam(W/2,H/2,k*Math.PI/2, k?-.9:.9, W*1.2, 11, 1.15, c, boss.atk*.22, tag, '회전전류');
  }
  function v28VineSnare(){
    const c='#4ade80', tag='poison';
    v28Cast(`${boss.name}: 덩굴 사슬! 끌려가기 전에 선에서 벗어나세요.`, 'cast', c, Math.atan2(player.y-boss.y,player.x-boss.x), 1.0);
    const a=Math.atan2(player.y-boss.y,player.x-boss.x);
    v28Beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,Math.min(900,dist(boss.x,boss.y,player.x,player.y)+180),18,1.0,c,boss.atk*.34,tag,'덩굴사슬');
    setTimeout(()=>{
      if(!state.raid || boss.dead) return;
      const px=player.x-boss.x, py=player.y-boss.y, along=px*Math.cos(a)+py*Math.sin(a), side=Math.abs(-px*Math.sin(a)+py*Math.cos(a));
      if(along>0&&along<920&&side<45){ player.x=clamp(player.x-Math.cos(a)*160,42,W-42); player.y=clamp(player.y-Math.sin(a)*160,90,H-42); hurtPlayer(boss.atk*.30,c); floatText('속박!',player.x,player.y-36,c,18); }
    },1030);
    for(let i=0;i<5;i++) v28Circle(rand(90,W-90),rand(120,H-80),42,1.05+i*.08,c,boss.atk*.30,tag,'독꽃');
  }
  function v28IronWarDance(){
    const c='#cbd5e1', tag='metal';
    const a=Math.atan2(player.y-boss.y,player.x-boss.x);
    v28Cast(`${boss.name}: 전투 돌진! 선을 보고 옆으로 굴러 피하세요.`, 'charge', c, a, 1.0);
    v28Beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,900,28,1.05,c,boss.atk*.58,tag,'돌진');
    setTimeout(()=>{ if(state.raid&&!boss.dead){ boss.x=clamp(boss.x+Math.cos(a)*320,80,W-80); boss.y=clamp(boss.y+Math.sin(a)*320,110,H-80); v28Circle(boss.x,boss.y,130,.42,c,boss.atk*.42,tag,'착지충격'); v28Spark(boss.x,boss.y,c,28,1.2);} },1100);
  }
  function v28MirrorTrial(){
    const c='#f0abfc', tag='mirror';
    v28Cast(`${boss.name}: 진짜 분신을 찾으세요! 밝은 분신 주변만 안전합니다.`, 'cast', c, 0, 1.1);
    const real=Math.floor(Math.random()*4);
    for(let i=0;i<4;i++){
      const x=165+i*(W-330)/3, y=H*.44;
      if(i===real){ state.mechanics.push({kind:'safe',x,y,r:62,life:2.25,color:'#bbf7d0'}); v28Spark(x,y,'#ffffff',18,1); }
      else v28Circle(x,y,68,1.18+i*.06,c,boss.atk*.52,tag,'가짜분신');
    }
    if(boss.phase>=2) v28Beam(W/2,H*.72,0,W*.86,16,1.35,c,boss.atk*.38,tag,'거울절단');
  }
  function v28GravityLabyrinth(){
    const c='#818cf8', tag='gravity';
    v28Cast(`${boss.name}: 중력 미궁! 끌림을 계산해서 안전지대로 이동하세요.`, 'cast', c, 0, 1.2);
    state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:330,life:3.1,power:220,color:c});
    for(let i=0;i<3+(boss.phase||1);i++) v28RotBeam(W/2,H/2,i*Math.PI/(3+(boss.phase||1)),i%2?-.65:.65,W*1.2,12,1.25+i*.08,c,boss.atk*.24,tag,'중력궤도');
    const safeX = rand(130,W-130), safeY = rand(150,H-95);
    state.mechanics.push({kind:'safe',x:safeX,y:safeY,r:58,life:2.75,color:'#bbf7d0'});
  }
  function v28BloodRitual(){
    const c='#ef4444', tag='blood';
    v28Cast(`${boss.name}: 피의 의식! 표식을 바깥으로 빼고 안쪽으로 돌아오세요.`, 'cast', c, 0, 1.1);
    const x=player.x,y=player.y;
    v28Circle(x,y,95,1.35,c,boss.atk*.62,tag,'혈월표식');
    v28Donut(W/2,H/2,120,285,1.55,c,boss.atk*.50,tag,'피의고리');
    setTimeout(()=>{ if(state.raid) state.zones.push({x,y,r:70,damage:boss.atk*.04,life:2.2,tick:0,color:c,enemy:true,dot:true}); },1450);
  }
  function v28ClockJudgement(){
    const c='#fef08a', tag='chrono';
    v28Cast(`${boss.name}: 시간 심판! 시계바늘의 회전 방향을 읽으세요.`, 'cast', c, 0, 1.15);
    for(let i=0;i<4;i++) v28RotBeam(W/2,H/2,i*Math.PI/2,(i%2?-.75:.75),W*1.16,10,1.20+i*.10,c,boss.atk*.25,tag,'시계바늘');
    setTimeout(()=>{ if(state.raid && typeof v27QueueMini==='function' && boss.phase>=3) v27QueueMini('quiz', `${boss.name}가 시간 문제를 냅니다! 정답 원을 밟으세요.`, c); }, 1550);
  }
  function v28JesterGame(){
    const c='#f472b6', tag='chaos';
    v28Cast(`${boss.name}: 속임수 쇼! 진짜 컵을 기억하세요.`, 'cast', c, 0, 1.0);
    if(typeof v27QueueMini==='function') v27QueueMini('shell', `${boss.name}가 야바위 쇼를 시작합니다! 처음 빛난 컵을 찾으세요.`, c);
    for(let i=0;i<5;i++) v28Circle(rand(90,W-90),rand(120,H-80),38,1.0+i*.08,c,boss.atk*.25,tag,'폭죽');
  }
  function v28MazePhase(){
    const c=v28Color();
    v28Cast(`${boss.name}: 공간이 뒤틀립니다. 미로 기믹을 준비하세요!`, 'cast', c, 0, 1.0);
    if(typeof v27QueueMini==='function') setTimeout(()=>v27QueueMini('maze', `${boss.name}가 진짜 미궁을 엽니다! 벽 사이 길을 찾아 탈출하세요.`, c),850);
  }
  function v28ChaosBlend(){
    const choices=[v28FlameCurtain,v28StormCircuit,v28GravityLabyrinth,v28MirrorTrial,v28VineSnare,v28MeteorChess];
    const fn=choices[Math.floor(Math.random()*choices.length)];
    fn();
  }

  const V28_PATTERNS_BY_ID = {
    slime_king:[()=>v28Circle(player.x,player.y,80,1.0,'#86efac',boss.atk*.38,'slime','젤리점프'),()=>{for(let i=0;i<5;i++) v28Circle(rand(100,W-100),rand(130,H-90),45,1.05+i*.08,'#86efac',boss.atk*.30,'slime','젤리방울');},()=>radialBullets(boss.x,boss.y,14,150,'#a7f3d0',boss.atk*.13)],
    ember_tyrant:[v28FlameCurtain,()=>v28FlameBreathCore('#fb923c','fire'),()=>v28MeteorChess('#f97316','fire')],
    thorn_queen:[v28VineSnare,()=>v28Wall(W/2,H/2,W*.88,28,1.08,'#22c55e',boss.atk*.46,'poison','가시횡단'),()=>{for(let i=0;i<8;i++) v28Circle(rand(90,W-90),rand(120,H-80),38,1.05+i*.06,'#84cc16',boss.atk*.30,'poison','독꽃');}],
    frost_oracle:[v28IceCathedral,()=>{for(let i=0;i<9;i++) v28Circle(rand(90,W-90),rand(120,H-80),32,0.95+i*.07,'#bae6fd',boss.atk*.34,'ice','빙창');},v28MazePhase],
    sand_reaper:[()=>{v28Cast(`${boss.name}: 모래 늪이 중앙으로 끌어당깁니다!`, 'cast', '#f59e0b', 0, 1); state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:280,life:2.8,power:160,color:'#f59e0b'}); v28Donut(W/2,H/2,80,270,1.35,'#fbbf24',boss.atk*.58,'sand','모래늪');},()=>{const a=Math.atan2(player.y-boss.y,player.x-boss.x); v28Beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,850,24,1.0,'#fbbf24',boss.atk*.52,'sand','낫돌진');},()=>{if(typeof v27HookPull==='function') v27HookPull('#fde68a','sand'); else v28VineSnare();}],
    void_serpent:[()=>{v28Cast(`${boss.name}: 공허 포탈을 엽니다! 대각 절단선을 피하세요.`, 'cast', '#a78bfa', 0, 1.1); v28Beam(W/2,H/2,Math.atan2(H,W),Math.hypot(W,H),18,1.15,'#a78bfa',boss.atk*.50,'void','포탈절단'); v28Beam(W/2,H/2,-Math.atan2(H,W),Math.hypot(W,H),18,1.30,'#8b5cf6',boss.atk*.50,'void','포탈절단');},v28GravityLabyrinth,v28MazePhase],
    iron_minotaur:[v28IronWarDance,()=>{v28Cast(`${boss.name}: 철퇴 지진! 원형 충격파를 보고 거리를 조절하세요.`, 'slam', '#cbd5e1', 0, 1); v28Circle(boss.x,boss.y,155,1.0,'#cbd5e1',boss.atk*.58,'metal','철퇴'); v28Donut(boss.x,boss.y,160,270,1.28,'#94a3b8',boss.atk*.44,'metal','여진');},()=>{for(let i=0;i<4;i++) v28Wall(130+i*(W-260)/3,H/2,24,H*.84,1.05+i*.12,'#94a3b8',boss.atk*.42,'metal','강철벽');}],
    blood_moon:[v28BloodRitual,()=>{for(let i=-2;i<=2;i++){const a=Math.atan2(player.y-boss.y,player.x-boss.x)+i*.22; v28Beam(boss.x+Math.cos(a)*250,boss.y+Math.sin(a)*250,a,600,16,1.04+Math.abs(i)*.05,'#fb7185',boss.atk*.34,'blood','혈월칼날');}},()=>v28Circle(W/2,H/2,225,1.5,'#be123c',boss.atk*.62,'blood','붉은달')],
    storm_colossus:[v28StormCircuit,v28StormChase,v28GravityLabyrinth],
    plague_doctor:[v28VineSnare,()=>{v28Cast(`${boss.name}: 역병 구름! 해독 룬을 찾아 회복하세요.`, 'cast', '#84cc16', 0, 1); spawnRune('#bef264','cleanse'); state.zones.push({x:W/2,y:H/2,r:235,damage:boss.atk*.04,life:3.0,tick:0,color:'#84cc16',enemy:true,dot:true});},()=>{if(typeof spawnAddsPhase==='function') spawnAddsPhase(); else v28MeteorChess('#84cc16','poison');}],
    mirror_duelist:[v28MirrorTrial,()=>{for(let i=0;i<5;i++) v28Beam(120+i*(W-240)/4,H/2,Math.PI/2,H*.86,13,1.0+i*.08,'#f0abfc',boss.atk*.34,'mirror','거울절단');},v28JesterGame],
    gravity_core:[v28GravityLabyrinth,()=>v28Circle(W/2,H/2,145,1.35,'#a5b4fc',boss.atk*.64,'gravity','중력압축'),()=>v28MeteorChess('#818cf8','gravity')],
    solar_dragon:[()=>v28FlameBreathCore('#facc15','solar'),v28FlameCurtain,()=>v28MeteorChess('#f97316','solar')],
    chrono_dragon:[v28ClockJudgement,()=>{player.slow=Math.max(player.slow,1.2); for(let i=0;i<8;i++) setTimeout(()=>aimBullet(boss.x,boss.y,player.x+rand(-180,180),player.y+rand(-120,120),190,'#fde047',boss.atk*.20,'chrono'),i*120);},()=>v28Circle(player.x,player.y,90,1.35,'#f472b6',boss.atk*.56,'chrono','시간폭탄')],
    abyss_leviathan:[v28MazePhase,()=>{for(let i=0;i<5;i++) v28Wall(W/2,145+i*(H-230)/4,W*.90,24,1.0+i*.1,'#38bdf8',boss.atk*.38,'ice','해일');},()=>{if(typeof v27HookPull==='function') v27HookPull('#7dd3fc','ice'); else v28StormChase();}],
    puppet_emperor:[v28JesterGame,v28MirrorTrial,()=>{if(typeof v27HookPull==='function') v27HookPull('#f0abfc','mirror'); else v28VineSnare();}],
    black_sun:[()=>v28Circle(W/2,H/2,285,1.7,'#facc15',boss.atk*.70,'solar','검은태양'),v28FlameCurtain,()=>{if(typeof spawnCrumblingFloor==='function') spawnCrumblingFloor(); else v28MeteorChess('#f97316','solar');}],
    chaos_archon:[v28ChaosBlend,v28JesterGame,v28MazePhase],
    crimson_train:[()=>{for(let i=0;i<4;i++) v28Wall(W/2,145+i*(H-230)/3,W*.94,34,1.0+i*.11,'#fb7185',boss.atk*.42,'train','급행열차');},v28IronWarDance,()=>v28MeteorChess('#f97316','train')],
    prophecy_cube:[v28ClockJudgement,v28MeteorChess,v28GravityLabyrinth],
    void_gardener:[v28VineSnare,v28MazePhase,()=>{if(typeof spawnAddsPhase==='function') spawnAddsPhase(); else v28MeteorChess('#84cc16','poison');}],
    magnet_judge:[v28GravityLabyrinth,v28StormCircuit,()=>{player.x=clamp(player.x+(player.x<W/2?110:-110),42,W-42); v28Circle(player.x,player.y,78,1.15,'#60a5fa',boss.atk*.48,'gravity','극성반전');}],
    nightmare_jester:[v28JesterGame,v28MirrorTrial,()=>{for(let i=0;i<7;i++) v28Circle(rand(90,W-90),rand(120,H-80),40,1.0+i*.08,'#f472b6',boss.atk*.30,'chaos','악몽폭죽');}]
  };
  const V28_PATTERNS_BY_THEME = {
    fire:[v28FlameCurtain,()=>v28FlameBreathCore('#fb923c','fire'),()=>v28MeteorChess('#f97316','fire')],
    solar:[()=>v28FlameBreathCore('#facc15','solar'),v28FlameCurtain,()=>v28MeteorChess('#f97316','solar')],
    ice:[v28IceCathedral,v28MazePhase,()=>{for(let i=0;i<8;i++)v28Circle(rand(90,W-90),rand(120,H-80),32,1+i*.07,'#bae6fd',boss.atk*.33,'ice','빙창');}],
    lightning:[v28StormCircuit,v28StormChase,v28GravityLabyrinth],
    nature:[v28VineSnare,()=>v28MeteorChess('#84cc16','poison'),v28MazePhase],
    poison:[v28VineSnare,()=>v28MeteorChess('#84cc16','poison'),()=>{if(typeof spawnAddsPhase==='function')spawnAddsPhase();}],
    metal:[v28IronWarDance,()=>v28Circle(boss.x,boss.y,160,1.05,'#cbd5e1',boss.atk*.60,'metal','철퇴'),()=>v28MeteorChess('#94a3b8','metal')],
    gravity:[v28GravityLabyrinth,()=>v28MeteorChess('#818cf8','gravity'),()=>v28Circle(W/2,H/2,160,1.35,'#a5b4fc',boss.atk*.60,'gravity','중력압축')],
    mirror:[v28MirrorTrial,v28JesterGame,()=>v28MeteorChess('#f0abfc','mirror')],
    chrono:[v28ClockJudgement,()=>v28MeteorChess('#fef08a','chrono'),()=>v28Circle(player.x,player.y,90,1.35,'#f472b6',boss.atk*.55,'chrono','시간폭탄')],
    chaos:[v28ChaosBlend,v28JesterGame,v28MazePhase]
  };

  const v28OldBossPattern = bossPattern;
  bossPattern = function(){
    if(!boss || boss.dead || state.miniGame) return;
    // 고등급 보스는 체력 구간에 따라 모션/패턴이 명확히 달라진다.
    const pool = V28_PATTERNS_BY_ID[boss.id] || V28_PATTERNS_BY_THEME[boss.theme];
    if(pool && pool.length){
      boss._v28PatternIndex = (boss._v28PatternIndex || 0) + 1;
      let offset = (boss.phase || 1) - 1;
      if(boss.tier >= 8 && boss.phase >= 2) offset += 1;
      if(boss.tier >= 9 && boss.phase >= 3) offset += 1;
      const fn = pool[(boss._v28PatternIndex + offset - 1) % pool.length];
      try { fn(); }
      catch(e){ console.warn('[V28 pattern fallback]', e); v28OldBossPattern(); }
      // 3페이즈 고등급 보스는 짧은 보조 패턴을 가끔만 연계한다.
      if(boss.tier >= 8 && boss.phase >= 3 && Math.random() < .18){
        setTimeout(()=>{ if(state.raid && boss && !boss.dead && !state.miniGame){ try { (V28_PATTERNS_BY_THEME[boss.theme]||[v28MeteorChess])[0](); } catch(e){} } }, 1300);
      }
      return;
    }
    v28OldBossPattern();
  };

  // 보스 설명도 페이즈/고유 기믹이 보이도록 보정
  try {
    BOSSES.forEach(b=>{
      const names = {
        fire:['화염 장막','부채꼴 숨결','운석 체스판'], solar:['태양 숨결','화염 장막','태양 기둥'], ice:['얼음 성당','미궁 기믹','빙창 낙하'],
        lightning:['전류 회로','추적 낙뢰','중력 전류'], nature:['덩굴 사슬','독꽃 정원','미궁 기믹'], poison:['역병 구름','해독 룬','소환수'],
        metal:['돌진','철퇴 지진','강철벽'], gravity:['중력 미궁','궤도 레이저','압축 폭발'], mirror:['진짜 분신','야바위','거울 절단'],
        chrono:['시계바늘','시간 퀴즈','시간 폭탄'], chaos:['무작위 기믹','야바위','환영 미궁']
      }[b.theme];
      if(names) b.patterns = names;
    });
  } catch(e) {}

  window.RaidDungeonV28 = { version: V28_VERSION };
})();

})();
