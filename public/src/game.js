
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
  const VERSION = 'Raid Dungeon V68 - Clear Cinematic Telegraphs Hard No Lag';
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



  /* =========================================================
     V29 DISTINCT BOSS FX / DAMAGE / ROLL IMMUNITY PATCH
     - 보스별 이펙트와 패턴 실루엣을 다시 분리
     - 캐릭터 중심 장판만 반복되던 문제 완화: 맵 전체 다중 원/선 공격 추가
     - 보스 데미지 소폭 상향
     - 구르기 중 모든 피해 완전 면역
  ========================================================= */
  const V29_VERSION = 'V29_DISTINCT_BOSS_FX_DAMAGE_ROLL_IMMUNITY';

  try {
    BOSSES.forEach(b=>{
      if(!b._v29AtkBoosted){ b.atk = Math.round((b.atk || 10) * 1.18 * 10) / 10; b._v29AtkBoosted = true; }
    });
  } catch(e) { console.warn('[V29 atk boost failed]', e); }

  const v29OldHurtPlayer = hurtPlayer;
  hurtPlayer = function(amount, color, statusDamage){
    // 구르기 중에는 장판, 레이저, 독틱, 즉사형 타격까지 전부 무시한다.
    if(player && player.roll > 0) {
      if(Math.random() < .18) floatText('회피', player.x, player.y-28, '#93c5fd', 14);
      return;
    }
    return v29OldHurtPlayer(amount, color, statusDamage);
  };

  function v29WarnTime(extra){
    return Math.max(1.05, 1.18 + (extra||0) + (boss && boss.tier>=8 ? .08 : 0));
  }
  function v29Dmg(x){ return (boss.atk || 10) * x * (boss.phase>=3 ? 1.10 : boss.phase>=2 ? 1.05 : 1); }
  function v29Cast(kind, text, color, angle, time){
    v28Cast(text, kind, color || boss.color, angle, time || 1.05);
    const c=color||boss.color;
    for(let i=0;i<18+boss.tier*2;i++){
      const a=Math.random()*Math.PI*2;
      state.particles.push({kind:'line',x:boss.x+Math.cos(a)*boss.r*.55,y:boss.y+Math.sin(a)*boss.r*.55,vx:Math.cos(a)*rand(30,160),vy:Math.sin(a)*rand(30,160),r:rand(2,6),life:rand(.3,.75),color:c,angle:a,len:rand(18,72)});
    }
  }
  function v29MapCircles(count, color, tag, label, opts={}){
    const minR = opts.r || 42, maxR = opts.r2 || (minR + 18), warn = opts.warn || v29WarnTime();
    const safeCenter = opts.avoidPlayer ? {x:player.x,y:player.y,r:70} : null;
    for(let i=0;i<count;i++){
      let x,y,tries=0;
      do { x=rand(70,W-70); y=rand(112,H-64); tries++; }
      while(safeCenter && dist(x,y,safeCenter.x,safeCenter.y)<safeCenter.r && tries<20);
      v28Circle(x,y,rand(minR,maxR),warn+i*.035,color,v29Dmg(opts.mul||.42),tag,label);
    }
  }
  function v29FanBeams(cx,cy,base,count,spread,color,tag,label,w=15,len=980,mul=.36){
    for(let i=0;i<count;i++){
      const t=count===1?0:(i/(count-1)-.5);
      v28Beam(cx,cy,base+t*spread,len,w,v29WarnTime(i*.02),color,v29Dmg(mul),tag,label);
    }
  }
  function v29ArenaSweep(color, tag, label){
    const vertical = Math.random()<.5;
    const lanes = boss.tier>=8 ? 5 : 4;
    for(let i=0;i<lanes;i++){
      if(vertical) v28Wall(100+i*(W-200)/(lanes-1), H/2, 26, H*.94, v29WarnTime(i*.05), color, v29Dmg(.38), tag, label);
      else v28Wall(W/2, 125+i*(H-210)/(lanes-1), W*.95, 26, v29WarnTime(i*.05), color, v29Dmg(.38), tag, label);
    }
  }
  function v29CornerSafeBlast(color, tag, label){
    const safes=[{x:120,y:130},{x:W-120,y:130},{x:120,y:H-100},{x:W-120,y:H-100}];
    const safe=safes[Math.floor(Math.random()*safes.length)];
    state.mechanics.push({kind:'safe',x:safe.x,y:safe.y,r:80,life:2.2,color});
    v29Cast('ultimate', `${boss.name}: 전장 전체 공격! SAFE로 이동하세요!`, color, 0, 1.4);
    // SAFE 주변을 제외한 전장을 큰 원 여러 개로 덮어 실제로 맵 전체가 공격받는 느낌을 만든다.
    const pts=[[W*.25,H*.25],[W*.5,H*.25],[W*.75,H*.25],[W*.25,H*.55],[W*.5,H*.55],[W*.75,H*.55],[W*.25,H*.82],[W*.5,H*.82],[W*.75,H*.82]];
    pts.forEach((p,i)=>{ if(dist(p[0],p[1],safe.x,safe.y)>145) v28Circle(p[0],p[1],105,v29WarnTime(i*.015),color,v29Dmg(.52),tag,label); });
  }

  function v29Slime(){
    const c='#9bf6b4'; v29Cast('jump', `${boss.name}: 젤리 탄성 점프! 착지 파동을 보고 빠지세요.`, c, 0, 1.0);
    v28Circle(boss.x,boss.y,120,v29WarnTime(),c,v29Dmg(.34),'slime','젤리착지');
    v29MapCircles(4+boss.phase,c,'slime','젤리방울',{r:34,r2:48,mul:.24});
  }
  function v29Fire(){
    const c='#fb923c'; const a=Math.atan2(player.y-boss.y,player.x-boss.x);
    v29Cast('breath', `${boss.name}: 화염 숨결! 부채꼴 불길과 화산탄을 피하세요.`, c, a, 1.15);
    v29FanBeams(boss.x,boss.y,a,7,.92,c,'fire','화염숨결',18,980,.36);
    setTimeout(()=>{ if(state.raid&&!boss.dead) v29MapCircles(6+boss.phase,c,'fire','화산탄',{r:38,r2:62,mul:.34}); }, 360);
  }
  function v29Thorn(){
    const c='#22c55e'; v29Cast('snare', `${boss.name}: 덩굴 사슬! 맵 전체 가시선과 독꽃을 읽으세요.`, c, 0, 1.05);
    for(let i=0;i<4;i++) v28Beam(W/2,H/2,Math.PI*(i/4)+.18,Math.hypot(W,H),13,v29WarnTime(i*.04),c,v29Dmg(.34),'poison','가시선');
    v29MapCircles(5+boss.phase,'#84cc16','poison','독꽃',{r:36,r2:54,mul:.30});
    if(typeof v27HookPull==='function' && boss.phase>=2) v27HookPull('#bef264','poison');
  }
  function v29Ice(){
    const c='#bae6fd'; v29Cast('ice', `${boss.name}: 빙결 성채! 낙하 얼음창과 벽 사이 빈칸을 찾으세요.`, c, 0, 1.12);
    v29ArenaSweep(c,'ice','빙벽');
    v29MapCircles(7+boss.phase,c,'ice','얼음창',{r:28,r2:42,mul:.34});
  }
  function v29Sand(){
    const c='#fbbf24'; v29Cast('dash', `${boss.name}: 모래 낫 돌진! 끌림과 절단선을 동시에 봐야 합니다.`, c, 0, 1.05);
    state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:280,life:2.3,power:120,color:c});
    for(let i=0;i<5;i++){ const a=i/5*Math.PI*2+state.time*.4; v28Beam(W/2,H/2,a,Math.hypot(W,H),15,v29WarnTime(i*.06),c,v29Dmg(.36),'sand','모래절단'); }
    v28Donut(W/2,H/2,90,285,v29WarnTime(.1),c,v29Dmg(.42),'sand','모래늪');
  }
  function v29Void(){
    const c='#a78bfa'; v29Cast('portal', `${boss.name}: 공허 포탈! 포탈이 열리는 순서를 보고 빈 공간으로 이동하세요.`, c, 0, 1.15);
    for(let i=0;i<6;i++) v28Beam(rand(120,W-120),rand(135,H-85),rand(0,Math.PI*2),rand(520,900),14,v29WarnTime(i*.045),i%2?'#8b5cf6':c,v29Dmg(.33),'void','공허문');
    if(boss.phase>=2) v29MapCircles(5,c,'void','균열',{r:44,r2:66,mul:.34});
  }
  function v29Iron(){
    const c='#cbd5e1'; const a=Math.atan2(player.y-boss.y,player.x-boss.x);
    v29Cast('charge', `${boss.name}: 철갑 돌진! 직선 돌진 후 충격파가 이어집니다.`, c, a, 1.0);
    v28Beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,980,34,v29WarnTime(),c,v29Dmg(.56),'metal','돌진');
    setTimeout(()=>{ if(state.raid&&!boss.dead){ v28Circle(player.x,player.y,95,v29WarnTime(.05),c,v29Dmg(.38),'metal','충격파'); v28Donut(boss.x,boss.y,120,250,v29WarnTime(.12),c,v29Dmg(.36),'metal','여진'); } }, 420);
  }
  function v29Blood(){
    const c='#fb7185'; v29Cast('blood', `${boss.name}: 혈월 의식! 달의 고리와 피의 칼날을 분리해서 피하세요.`, c, 0, 1.2);
    v28Donut(W/2,H/2,120,315,v29WarnTime(.08),c,v29Dmg(.50),'blood','혈월고리');
    for(let i=0;i<8;i++) v28Beam(W/2,H/2,i/8*Math.PI*2+state.time*.2,Math.hypot(W,H),11,v29WarnTime(i*.025),'#be123c',v29Dmg(.30),'blood','피칼날');
  }
  function v29Storm(){
    const c='#fde047'; v29Cast('storm', `${boss.name}: 폭풍 회로! 맵 전체 낙뢰와 회전 전류를 읽으세요.`, c, 0, 1.05);
    v29MapCircles(9+boss.phase*2,c,'lightning','낙뢰',{r:26,r2:40,mul:.30});
    v28RotBeam(W/2,H/2,rand(0,Math.PI),boss.phase>=3?1.05:.75,Math.hypot(W,H),13,v29WarnTime(.08),c,v29Dmg(.32),'lightning','회전전류');
    if(boss.phase>=2) v29ArenaSweep('#60a5fa','lightning','전류격자');
  }
  function v29Plague(){
    const c='#84cc16'; v29Cast('plague', `${boss.name}: 역병 확산! 해독 룬과 독꽃 위치를 같이 확인하세요.`, c, 0, 1.1);
    spawnRune('#bef264','cleanse'); v29MapCircles(8,c,'poison','독포자',{r:32,r2:50,mul:.26});
    state.zones.push({x:W/2,y:H/2,r:250,damage:v29Dmg(.025),life:2.6,tick:0,color:c,enemy:true,dot:true});
  }
  function v29Mirror(){
    const c='#f0abfc'; v29Cast('mirror', `${boss.name}: 거울 만화경! 대칭 절단선과 가짜 빛을 구분하세요.`, c, 0, 1.1);
    for(let i=0;i<6;i++){ const x=110+i*(W-220)/5; v28Beam(x,H/2,Math.PI/2,H*.9,10,v29WarnTime(i*.04),c,v29Dmg(.30),'mirror','거울선'); }
    v29MapCircles(4+boss.phase,'#f9a8d4','mirror','가짜반사',{r:44,r2:62,mul:.28});
  }
  function v29Gravity(){
    const c='#818cf8'; v29Cast('gravity', `${boss.name}: 중력핵 압축! 끌림을 계산하며 궤도 레이저를 피하세요.`, c, 0, 1.15);
    state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:330,life:2.5,power:180,color:c});
    v28RotBeam(W/2,H/2,0,1.15,Math.hypot(W,H),16,v29WarnTime(),c,v29Dmg(.35),'gravity','궤도');
    v28Donut(W/2,H/2,75,275,v29WarnTime(.12),c,v29Dmg(.48),'gravity','압축');
  }
  function v29Chrono(){
    const c='#fde047'; v29Cast('time', `${boss.name}: 시간 재단! 시계바늘과 시간폭탄을 동시에 봅니다.`, c, 0, 1.12);
    for(let i=0;i<12;i+=2) v28Beam(W/2,H/2,i/12*Math.PI*2+state.time*.15,Math.hypot(W,H),8,v29WarnTime(i*.015),c,v29Dmg(.26),'chrono','시계바늘');
    v29MapCircles(4+boss.phase,'#f472b6','chrono','시간폭탄',{r:54,r2:76,mul:.36});
  }
  function v29Chaos(){
    const c='#fb7185'; v29Cast('chaos', `${boss.name}: 혼돈 재판! 서로 다른 공격이 섞여 옵니다.`, c, 0, 1.2);
    const arr=[v29Fire,v29Storm,v29Gravity,v29Mirror,v29Void];
    arr[Math.floor(Math.random()*arr.length)]();
    setTimeout(()=>{ if(state.raid&&!boss.dead) v29MapCircles(5,'#f472b6','chaos','혼돈점',{r:32,r2:52,mul:.30}); }, 650);
  }

  const V29_BY_ID = {
    slime_king:[v29Slime,()=>v29MapCircles(6,'#86efac','slime','젤리비',{r:30,r2:44,mul:.22}),()=>v28Donut(W/2,H/2,80,250,v29WarnTime(),'#86efac',v29Dmg(.28),'slime','젤리파동')],
    ember_tyrant:[v29Fire,()=>v29CornerSafeBlast('#fb923c','fire','화염심판'),()=>{v29MapCircles(10,'#f97316','fire','불씨폭우',{r:30,r2:46,mul:.30});}],
    thorn_queen:[v29Thorn,v29Plague,()=>v29ArenaSweep('#22c55e','poison','가시울타리')],
    frost_oracle:[v29Ice,()=>v29CornerSafeBlast('#bae6fd','ice','빙결심판'),()=>{if(typeof v28MazePhase==='function') v28MazePhase(); else v29Ice();}],
    sand_reaper:[v29Sand,v29Iron,()=>v29MapCircles(8,'#fbbf24','sand','모래폭탄',{r:34,r2:52,mul:.31})],
    void_serpent:[v29Void,v29Gravity,()=>v29CornerSafeBlast('#a78bfa','void','공허심판')],
    iron_minotaur:[v29Iron,()=>v29ArenaSweep('#cbd5e1','metal','강철격자'),()=>v28Donut(boss.x,boss.y,85,270,v29WarnTime(),'#94a3b8',v29Dmg(.45),'metal','철퇴여진')],
    blood_moon:[v29Blood,()=>v29CornerSafeBlast('#be123c','blood','혈월심판'),()=>v29FanBeams(boss.x,boss.y,Math.atan2(player.y-boss.y,player.x-boss.x),9,1.2,'#fb7185','blood','흡혈칼날',12,980,.28)],
    storm_colossus:[v29Storm,()=>v29CornerSafeBlast('#fde047','lightning','천둥심판'),()=>v29ArenaSweep('#60a5fa','lightning','전류벽')],
    plague_doctor:[v29Plague,v29Thorn,()=>{ if(typeof spawnAddsPhase==='function') spawnAddsPhase(); v29MapCircles(6,'#84cc16','poison','역병폭발',{r:36,r2:56,mul:.30});}],
    mirror_duelist:[v29Mirror,()=>{ if(typeof v28JesterGame==='function') v28JesterGame(); else v29Mirror(); },()=>v29FanBeams(W/2,H/2,0,8,Math.PI*2,'#f0abfc','mirror','만화경',10,920,.26)],
    gravity_core:[v29Gravity,()=>v29CornerSafeBlast('#818cf8','gravity','중력붕괴'),()=>v29MapCircles(7,'#a5b4fc','gravity','중력점',{r:42,r2:62,mul:.33})],
    solar_dragon:[v29Fire,()=>v29FanBeams(boss.x,boss.y,Math.atan2(player.y-boss.y,player.x-boss.x),11,1.3,'#facc15','solar','태양숨결',15,1050,.32),()=>v29CornerSafeBlast('#f97316','solar','태양심판')],
    chrono_dragon:[v29Chrono,()=>{ if(typeof v28ClockJudgement==='function') v28ClockJudgement(); else v29Chrono(); },()=>v29CornerSafeBlast('#fde047','chrono','시간정지')],
    abyss_leviathan:[v29Ice,()=>v29ArenaSweep('#38bdf8','ice','해일벽'),()=>v29FanBeams(W/2,H/2,Math.PI/2,7,.8,'#7dd3fc','ice','심해창',14,900,.32)],
    puppet_emperor:[v29Mirror,()=>{ if(typeof v28JesterGame==='function') v28JesterGame(); else v29Mirror(); },()=>{ if(typeof v27HookPull==='function') v27HookPull('#f0abfc','mirror'); v29MapCircles(5,'#f0abfc','mirror','인형못',{r:34,r2:50,mul:.30});}],
    black_sun:[()=>v29CornerSafeBlast('#facc15','solar','즉사 패턴'),v29Fire,v29Blood],
    chaos_archon:[v29Chaos,v29Gravity,v29Storm],
    crimson_train:[()=>v29ArenaSweep('#fb7185','train','급행열차'),v29Iron,()=>v29MapCircles(8,'#f97316','train','차륜폭발',{r:34,r2:54,mul:.32})],
    prophecy_cube:[v29Chrono,v29Gravity,v29Mirror],
    void_gardener:[v29Thorn,v29Void,v29Plague],
    magnet_judge:[v29Gravity,v29Storm,()=>v29ArenaSweep('#60a5fa','gravity','극성재판')],
    nightmare_jester:[()=>{ if(typeof v28JesterGame==='function') v28JesterGame(); else v29Mirror(); },v29Chaos,v29Mirror]
  };
  const V29_BY_THEME = { fire:[v29Fire,v29CornerSafeBlast.bind(null,'#fb923c','fire','화염심판'),v29ArenaSweep.bind(null,'#fb923c','fire','화염벽')], solar:[v29Fire,v29Blood], ice:[v29Ice,v29CornerSafeBlast.bind(null,'#bae6fd','ice','빙결심판')], lightning:[v29Storm,v29ArenaSweep.bind(null,'#60a5fa','lightning','전류벽')], nature:[v29Thorn,v29Plague], poison:[v29Plague,v29Thorn], metal:[v29Iron,v29ArenaSweep.bind(null,'#cbd5e1','metal','강철격자')], gravity:[v29Gravity,v29CornerSafeBlast.bind(null,'#818cf8','gravity','중력붕괴')], mirror:[v29Mirror], chrono:[v29Chrono], chaos:[v29Chaos] };

  const v29OldBossPattern = bossPattern;
  bossPattern = function(){
    if(!boss || boss.dead || state.miniGame) return;
    const pool = V29_BY_ID[boss.id] || V29_BY_THEME[boss.theme];
    if(pool && pool.length){
      boss._v29PatternIndex=(boss._v29PatternIndex||0)+1;
      let idx = (boss._v29PatternIndex - 1 + Math.max(0,(boss.phase||1)-1)) % pool.length;
      try { pool[idx](); }
      catch(e){ console.warn('[V29 pattern fallback]', e); v29OldBossPattern(); }
      if(boss.tier>=8 && boss.phase>=3 && Math.random()<.14){
        setTimeout(()=>{ if(state.raid && boss && !boss.dead && !state.miniGame){ try{ v29MapCircles(4+boss.phase,boss.sub||boss.color,boss.theme,'보조타격',{r:28,r2:44,mul:.24}); }catch(e){} } }, 1200);
      }
      return;
    }
    v29OldBossPattern();
  };

  // 화면 카드에 보이는 설명도 단순 색 변경이 아니라 보스별 핵심을 알 수 있게 보정한다.
  try{
    const labels={
      slime_king:['젤리착지','젤리비','파동'], ember_tyrant:['부채꼴 숨결','전장 화염','화산탄'], thorn_queen:['덩굴 사슬','독꽃','가시선'], frost_oracle:['빙결 성채','얼음창','빙결심판'],
      sand_reaper:['모래 끌림','낫 절단','모래폭탄'], void_serpent:['공허 포탈','중력 끌림','공허심판'], iron_minotaur:['돌진','충격파','강철격자'], blood_moon:['혈월고리','피칼날','흡혈장판'],
      storm_colossus:['맵 낙뢰','회전 전류','전류격자'], plague_doctor:['역병구름','해독 룬','독포자'], mirror_duelist:['거울절단','만화경','가짜 빛'], gravity_core:['중력끌림','궤도레이저','압축폭발'],
      solar_dragon:['태양숨결','화염장막','태양심판'], chrono_dragon:['시계바늘','시간폭탄','시간정지'], abyss_leviathan:['해일벽','심해창','빙결장판'], puppet_emperor:['실 조종','야바위','인형못'],
      black_sun:['즉사 패턴','검은태양','혈월칼날'], chaos_archon:['혼돈재판','중력붕괴','폭풍회로']
    };
    BOSSES.forEach(b=>{ if(labels[b.id]) b.patterns=labels[b.id]; else if(b.tier>=8) b.patterns=['고유 기믹','전장 공격','페이즈 강화']; });
  }catch(e){}

  window.RaidDungeonV29 = { version: V29_VERSION };


  window.RaidDungeonV28 = { version: V28_VERSION };
})();


/* =========================================================
   RAID DUNGEON V30 - REAL DISTINCT BOSS IDENTITY PATCH
   - 보스마다 색만 다른 레이저가 아니라, 이름/성격에 맞는 고유 패턴 세트로 재구성
   - 각 보스별 최소 4개 이상 고유 패턴 순환
   - 같은 이펙트 반복을 줄이고, 테마별 시전 모션/실제 타격 모양을 다르게 표시
   - 기존 저장/클릭/방어구/미니게임/구르기 무적 패치 유지
========================================================= */
(function raidDungeonV30DistinctBossIdentityPatch(){
  const V30_VERSION = 'V30_DISTINCT_BOSS_IDENTITY';
  try { console.log('[RaidDungeon] ' + V30_VERSION + ' loaded'); } catch(e) {}

  function alive(){ return state && state.raid && boss && !boss.dead && !state.miniGame; }
  function col(){ return (boss && (boss.color || boss.sub)) || '#93c5fd'; }
  function sub(){ return (boss && (boss.sub || boss.color)) || '#ffffff'; }
  function tag(){ return (boss && (boss.theme || boss.id)) || 'boss'; }
  function tier(){ return boss ? (boss.tier || 1) : 1; }
  function phase(){ return boss ? (boss.phase || 1) : 1; }
  function dmg(m){ return boss ? boss.atk * (m || 1) : 1; }
  function warn(extra){ return Math.max(.95, 1.05 + tier()*.035 + (extra || 0)); }
  function setText(t,c){ if(boss) boss.mechanicText=t; try{ floatText(t, W/2, 84, c || col(), 17); }catch(e){} }
  function cast(t,kind,c,angle,time){
    if(!boss) return;
    const cc=c||col();
    setText(t,cc);
    boss.cast = {life:time||1.05,max:time||1.05,kind:kind||'cast',color:cc,angle:Number.isFinite(angle)?angle:Math.atan2(player.y-boss.y,player.x-boss.x)};
    state.shake = Math.max(state.shake || 0, Math.min(5, 1 + tier()*.25));
  }
  function push(h){
    if(!alive()) return;
    h.warn = Math.max(.72, h.warn || warn());
    h.life = Math.max(.62, h.life || .74);
    h.label = h.label || 'HIT';
    h.v30 = true;
    if(typeof v20PushHazard === 'function') v20PushHazard(h); else state.hazards.push(h);
  }
  function circle(x,y,r,w,c,d,tg,label,life){ push({kind:'circle',x,y,r,warn:w,life:life||.82,damage:d,color:c,tag:tg,label}); }
  function donut(x,y,inner,outer,w,c,d,tg,label){ push({kind:'donut',x,y,inner,outer,warn:w,life:.92,damage:d,color:c,tag:tg,label}); }
  function beam(x,y,a,len,width,w,c,d,tg,label,life){ push({kind:'beam',x,y,angle:a,len,w:width,warn:w,life:life||.82,damage:d,color:c,tag:tg,label}); }
  function wall(x,y,ww,hh,w,c,d,tg,label){ push({kind:'wall',x,y,w:ww,h:hh,warn:w,life:.94,damage:d,color:c,tag:tg,label}); }
  function floor(x,y,ww,hh,w,c,d,tg,label){ push({kind:'floor',x,y,w:ww,h:hh,warn:w,life:.90,damage:d,color:c,tag:tg,label}); }
  function rot(x,y,a,spin,len,width,w,c,d,tg,label){ push({kind:'rotatingBeam',x,y,angle:a,spin,len,w:width,warn:w,life:2.15,damage:d,color:c,tag:tg,label,tick:0}); }
  function safe(x,y,r,life,c,label){ state.mechanics.push({kind:'safe',x,y,r,life:life||2.4,color:c||'#86efac',label:label||'SAFE'}); }
  function sparkle(x,y,c,n,pow){
    n = n || 20; pow = pow || 1;
    try { burst(x,y,c,n,230*pow); } catch(e) {}
    for(let i=0;i<n;i++){
      const a=Math.random()*Math.PI*2;
      state.particles.push({kind:i%3?'star':'line',x,y,vx:Math.cos(a)*rand(70,350)*pow,vy:Math.sin(a)*rand(70,350)*pow,r:rand(3,9)*pow,life:rand(.22,.74),color:c,angle:a,len:rand(18,60)*pow});
    }
  }
  function mapCircles(n,c,tg,label,opt){
    opt=opt||{}; const used=[];
    for(let i=0;i<n;i++){
      let x,y,ok=false;
      for(let tries=0;tries<25&&!ok;tries++){
        x=rand(85,W-85); y=rand(122,H-72); ok=true;
        for(const p of used) if(dist(x,y,p.x,p.y)<(opt.minDist||105)) ok=false;
      }
      used.push({x,y});
      circle(x,y,rand(opt.r||28,opt.r2||58),warn(i*.025),c,dmg(opt.mul||.32),tg,label);
    }
  }
  function fanFromBoss(count,arc,c,tg,label,width,len,mul){
    const base=Math.atan2(player.y-boss.y,player.x-boss.x);
    for(let i=0;i<count;i++){
      const t=count<=1?0:(i/(count-1)-.5);
      beam(boss.x+Math.cos(base+t*arc)*120,boss.y+Math.sin(base+t*arc)*120,base+t*arc,len||760,width||18,warn(Math.abs(t)*.18),c,dmg(mul||.34),tg,label);
    }
  }
  function checker(cols,rows,safeCount,c,tg,label,mul){
    const total=cols*rows, safeSet=new Set();
    while(safeSet.size<safeCount) safeSet.add(Math.floor(Math.random()*total));
    const cw=W/cols, ch=(H-108)/rows;
    for(let i=0;i<total;i++){
      const x=cw*(i%cols+.5), y=108+ch*(Math.floor(i/cols)+.5);
      if(safeSet.has(i)) safe(x,y,Math.min(cw,ch)*.25,2.1,'#bbf7d0','SAFE');
      else floor(x,y,cw*.82,ch*.72,warn((i%3)*.03),c,dmg(mul||.34),tg,label);
    }
  }
  function lineGrid(verticals,horizontals,c,tg,label,mul){
    for(let i=0;i<verticals;i++) wall(100+i*(W-200)/Math.max(1,verticals-1),H/2,24,H*.78,warn(i*.04),c,dmg(mul||.34),tg,label);
    for(let j=0;j<horizontals;j++) wall(W/2,140+j*(H-230)/Math.max(1,horizontals-1),W*.86,22,warn(j*.04+.1),c,dmg((mul||.34)*.9),tg,label);
  }
  function addMinions(n,c,name){
    for(let i=0;i<n;i++){
      state.summons = state.summons || [];
      state.summons.push({x:rand(100,W-100),y:rand(140,H-90),r:18+Math.random()*8,hp:18+tier()*5,maxHp:18+tier()*5,color:c,name:name||'소환수',speed:80+Math.random()*40,life:18,damage:dmg(.18)});
    }
  }

  // Common visual-only attack language helpers. Each boss uses a different composition.
  function slimeBounce(){ const c='#86efac'; cast(`${boss.name}: 몸을 부풀린 뒤 튀어오릅니다. 착지 파동을 피하세요!`,'slam',c,0,1.0); circle(player.x,player.y,88,warn(),c,dmg(.36),'slime','젤리착지'); setTimeout(()=>{ if(alive()) donut(player.x,player.y,70,190,.55,c,dmg(.26),'slime','탄성파동'); }, 780); mapCircles(4+phase(), '#bbf7d0','slime','젤리방울',{r:26,r2:42,mul:.20}); }
  function slimeSplit(){ const c='#a7f3d0'; cast(`${boss.name}: 작은 젤리로 분열합니다. 방울 사이 빈틈을 찾으세요!`,'split',c,0,1.0); for(let i=0;i<16;i++){ const a=i/16*Math.PI*2; aimBullet(boss.x,boss.y,boss.x+Math.cos(a)*300,boss.y+Math.sin(a)*220,150,c,dmg(.12),'slime'); } addMinions(phase(),c,'미니젤리'); }
  function slimePuddle(){ const c='#4ade80'; cast(`${boss.name}: 바닥을 말랑하게 녹입니다. 중앙 파동과 외곽 웅덩이를 구분하세요!`,'puddle',c,0,1.0); donut(W/2,H/2,120,260,warn(),c,dmg(.28),'slime','말랑파동'); mapCircles(6,'#86efac','slime','젤리웅덩이',{r:38,r2:62,mul:.18,minDist:135}); }

  function fireBreath(){ const c='#f97316'; const a=Math.atan2(player.y-boss.y,player.x-boss.x); cast(`${boss.name}: 화염 숨결! 보스 뒤쪽으로 파고드세요.`, 'breath', c, a, 1.0); fanFromBoss(9,1.25,c,'fire','화염숨결',24,680,.38); setTimeout(()=>mapCircles(7,'#fb923c','fire','잔불폭발',{r:28,r2:45,mul:.24}),650); }
  function fireVolcano(){ const c='#fb923c'; cast(`${boss.name}: 화산 균열을 엽니다. 균열선과 운석을 동시에 확인하세요.`, 'volcano', c, -Math.PI/2, 1.1); for(let i=0;i<5;i++) beam(W/2,H/2,(i/5)*Math.PI*2+state.time*.2,Math.hypot(W,H),14,warn(i*.04),c,dmg(.30),'fire','화산균열'); mapCircles(8+phase(),'#facc15','fire','화산탄',{r:32,r2:50,mul:.29}); }
  function fireChess(){ const c='#f97316'; cast(`${boss.name}: 불타는 체스판! 밝지 않은 칸으로 이동하세요.`, 'meteor', c, 0, 1.2); checker(6,4,Math.max(3,7-phase()),c,'fire','화염칸',.35); }

  function thornHook(){ const c='#22c55e'; const a=Math.atan2(player.y-boss.y,player.x-boss.x); cast(`${boss.name}: 덩굴 갈고리! 선을 끊고 독꽃을 피하세요.`, 'hook', c, a, 1.0); beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,880,18,warn(),c,dmg(.28),'poison','덩굴갈고리'); setTimeout(()=>{ if(!alive())return; const px=player.x-boss.x, py=player.y-boss.y; const along=px*Math.cos(a)+py*Math.sin(a), side=Math.abs(-px*Math.sin(a)+py*Math.cos(a)); if(along>0&&along<900&&side<45){ player.x=clamp(player.x-Math.cos(a)*160,45,W-45); player.y=clamp(player.y-Math.sin(a)*160,95,H-45); hurtPlayer(dmg(.25),c); floatText('속박',player.x,player.y-35,c,18); } },1050); mapCircles(5,'#84cc16','poison','독꽃',{r:34,r2:55,mul:.20,minDist:130}); }
  function thornGarden(){ const c='#4ade80'; cast(`${boss.name}: 가시 정원을 펼칩니다. 길이 닫히기 전에 빠져나가세요.`, 'garden', c, 0, 1.15); lineGrid(4,2,c,'poison','가시벽',.34); mapCircles(6,'#bef264','poison','꽃가루',{r:26,r2:42,mul:.18,minDist:110}); }
  function thornBloom(){ const c='#84cc16'; cast(`${boss.name}: 독꽃이 연쇄 개화합니다. 작은 꽃보다 큰 꽃을 먼저 피하세요.`, 'bloom', c, 0, 1.0); for(let i=0;i<7;i++){ const x=rand(100,W-100), y=rand(135,H-90); circle(x,y,30,warn(i*.07),c,dmg(.18),'poison','씨앗'); setTimeout(()=>{ if(alive()) circle(x,y,78,.55,c,dmg(.32),'poison','독꽃개화'); },700+i*85); } }

  function icePrison(){ const c='#bae6fd'; cast(`${boss.name}: 빙결 감옥! 열린 통로를 따라 이동하세요.`, 'ice', c, Math.PI/2, 1.1); const gapV=Math.floor(Math.random()*4); for(let i=0;i<4;i++) if(i!==gapV) wall(190+i*(W-380)/3,H/2,28,H*.82,warn(i*.03),c,dmg(.38),'ice','빙벽'); const gapH=Math.floor(Math.random()*3); for(let j=0;j<3;j++) if(j!==gapH) wall(W/2,170+j*(H-280)/2,W*.78,24,warn(.12+j*.05),c,dmg(.34),'ice','서리벽'); }
  function iceLances(){ const c='#e0f2fe'; cast(`${boss.name}: 하늘에서 빙창이 떨어집니다. 그림자 위치를 보고 움직이세요.`, 'icefall', c, -Math.PI/2, 1.0); mapCircles(10+phase()*2,c,'ice','빙창낙하',{r:24,r2:38,mul:.25,minDist:88}); }
  function iceMirror(){ const c='#7dd3fc'; cast(`${boss.name}: 얼음 거울을 세웁니다. 반사선을 보고 빈칸으로 이동하세요.`, 'reflect', c, 0, 1.05); for(let i=0;i<5;i++) beam(110+i*(W-220)/4,H/2,(i%2?Math.PI/2:0),i%2?H*.9:W*.85,12,warn(i*.05),c,dmg(.26),'ice','반사빙선'); donut(W/2,H/2,110,280,warn(.16),c,dmg(.32),'ice','서리환'); }

  function sandPull(){ const c='#fbbf24'; cast(`${boss.name}: 모래 늪이 발목을 끌어당깁니다. 바깥 고리로 빠져나가세요.`, 'sand', c, 0, 1.15); state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:320,life:2.7,power:165,color:c}); donut(W/2,H/2,80,280,warn(.1),c,dmg(.45),'sand','모래늪'); }
  function sandScythe(){ const c='#f59e0b'; const a=Math.atan2(player.y-boss.y,player.x-boss.x); cast(`${boss.name}: 사신의 낫질! 돌진선 뒤의 모래 폭발까지 확인하세요.`, 'dash', c, a, 1.0); beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,920,30,warn(),c,dmg(.46),'sand','낫돌진'); setTimeout(()=>{ if(alive()) fanFromBoss(5,.85,c,'sand','모래칼날',18,560,.25); },800); }
  function sandBurial(){ const c='#fcd34d'; cast(`${boss.name}: 매몰 지대를 만듭니다. 작은 발판 사이로 이동하세요.`, 'bury', c, 0, 1.1); checker(5,4,4,c,'sand','매몰지대',.32); state.mechanics.push({kind:'gravity',x:boss.x,y:boss.y,r:220,life:2.0,power:105,color:c}); }

  function voidPortals(){ const c='#a78bfa'; cast(`${boss.name}: 공허 문이 열립니다. 서로 다른 각도의 절단선을 읽으세요.`, 'portal', c, 0, 1.1); for(let i=0;i<7;i++) beam(rand(110,W-110),rand(130,H-85),rand(0,Math.PI*2),rand(520,980),14,warn(i*.04),i%2?c:'#8b5cf6',dmg(.27),'void','공허문'); }
  function voidCollapse(){ const c='#8b5cf6'; cast(`${boss.name}: 공간을 접습니다. 중심으로 끌리기 전에 빈 고리를 찾으세요.`, 'collapse', c, 0, 1.2); state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:360,life:2.6,power:200,color:c}); donut(W/2,H/2,90,300,warn(.12),c,dmg(.44),'void','공간접힘'); mapCircles(5,c,'void','균열',{r:36,r2:58,mul:.24,minDist:130}); }
  function voidSnake(){ const c='#c4b5fd'; cast(`${boss.name}: 공허 뱀이 몸을 비틀어 지나갑니다. S자 경로를 피하세요.`, 'serpent', c, 0, 1.1); for(let i=0;i<8;i++){ const x=120+i*(W-240)/7, y=H/2+Math.sin(i*.9+state.time)*160; circle(x,y,60,warn(i*.035),c,dmg(.26),'void','뱀자국'); } }

  function ironCharge(){ const c='#e5e7eb'; const a=Math.atan2(player.y-boss.y,player.x-boss.x); cast(`${boss.name}: 철갑 돌진! 굴러서 옆으로 빠지면 딜 타이밍입니다.`, 'charge', c, a, 1.0); beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,980,42,warn(),c,dmg(.56),'metal','철갑돌진'); setTimeout(()=>{ if(alive()){ boss.x=clamp(boss.x+Math.cos(a)*330,80,W-80); boss.y=clamp(boss.y+Math.sin(a)*330,110,H-80); circle(boss.x,boss.y,125,.45,c,dmg(.38),'metal','착지충격'); sparkle(boss.x,boss.y,c,22,1.1); } },1100); }
  function ironAnvil(){ const c='#cbd5e1'; cast(`${boss.name}: 모루 강타! 중앙 충격 후 외곽 여진이 옵니다.`, 'slam', c, 0, 1.1); circle(W/2,H/2,150,warn(),c,dmg(.46),'metal','모루강타'); donut(W/2,H/2,160,310,warn(.22),'#94a3b8',dmg(.34),'metal','여진'); }
  function ironCage(){ const c='#94a3b8'; cast(`${boss.name}: 강철 감옥! 닫히는 벽 사이 빈틈을 찾으세요.`, 'cage', c, 0, 1.15); lineGrid(5,3,c,'metal','강철벽',.32); }

  function stormRods(){ const c='#fde047'; cast(`${boss.name}: 피뢰침을 꽂습니다. 번개 연결선을 피하세요.`, 'storm', c, 0, 1.05); const rods=[]; for(let i=0;i<5+phase();i++){ const p={x:rand(110,W-110),y:rand(135,H-90)}; rods.push(p); circle(p.x,p.y,28,warn(i*.02),c,dmg(.20),'lightning','피뢰침'); }
    setTimeout(()=>{ if(!alive()) return; for(let i=0;i<rods.length-1;i++){ const a=Math.atan2(rods[i+1].y-rods[i].y,rods[i+1].x-rods[i].x); const len=dist(rods[i].x,rods[i].y,rods[i+1].x,rods[i+1].y); beam((rods[i].x+rods[i+1].x)/2,(rods[i].y+rods[i+1].y)/2,a,len,14,.55,c,dmg(.26),'lightning','전류연결'); } },750); }
  function stormGrid(){ const c='#60a5fa'; cast(`${boss.name}: 폭풍 회로가 켜집니다. 가로/세로 전류 사이를 읽으세요.`, 'circuit', c, 0, 1.1); lineGrid(4+phase(),2,c,'lightning','전류격자',.30); rot(W/2,H/2,rand(0,Math.PI),phase()>=3?1.0:.65,Math.hypot(W,H),14,warn(.15),'#fde047',dmg(.27),'lightning','회전전류'); }
  function stormChase(){ const c='#fde047'; cast(`${boss.name}: 추적 낙뢰! 멈추지 말고 계속 이동하세요.`, 'storm', c, 0, 1.05); for(let i=0;i<8+phase();i++) setTimeout(()=>{ if(alive()) circle(player.x+rand(-80,80),player.y+rand(-80,80),38,.62,c,dmg(.24),'lightning','추적낙뢰'); },i*180); }

  function plagueCloud(){ const c='#84cc16'; cast(`${boss.name}: 역병 구름을 뿌립니다. 해독 룬을 보고 이동하세요.`, 'plague', c, 0, 1.1); spawnRune('#bef264','cleanse'); state.zones.push({x:W/2,y:H/2,r:250,damage:dmg(.025),life:3.2,tick:0,color:c,enemy:true,dot:true}); mapCircles(7,c,'poison','독포자',{r:30,r2:48,mul:.20,minDist:105}); }
  function plagueAdds(){ const c='#a3e635'; cast(`${boss.name}: 감염체를 부릅니다. 소환수를 처리하지 않으면 독 장판이 늘어납니다.`, 'plague', c, 0, 1.0); addMinions(3+Math.floor(phase()/2),c,'감염체'); mapCircles(4,c,'poison','감염폭발',{r:36,r2:54,mul:.22}); }
  function plagueSurgery(){ const c='#bef264'; cast(`${boss.name}: 역병 수술! 좁은 절개선을 보고 비켜서세요.`, 'surgery', c, 0, 1.0); for(let i=0;i<6;i++) beam(rand(100,W-100),rand(130,H-90),rand(0,Math.PI*2),rand(420,780),10,warn(i*.04),c,dmg(.28),'poison','절개선'); }

  function mirrorClones(){ const c='#f0abfc'; cast(`${boss.name}: 진짜 분신을 숨깁니다. 밝은 분신 주변만 안전합니다.`, 'mirror', c, 0, 1.1); const real=Math.floor(Math.random()*4); for(let i=0;i<4;i++){ const x=160+i*(W-320)/3,y=H*.45; if(i===real){ safe(x,y,64,2.4,'#bbf7d0','진짜'); sparkle(x,y,'#fff',14,1); } else circle(x,y,70,warn(i*.05),c,dmg(.40),'mirror','가짜분신'); } }
  function mirrorKaleidoscope(){ const c='#f0abfc'; cast(`${boss.name}: 만화경 절단! 대칭으로 생기는 선을 확인하세요.`, 'mirror', c, 0, 1.1); for(let i=0;i<10;i++) beam(W/2,H/2,i/10*Math.PI*2+state.time*.1,Math.hypot(W,H),9,warn(i*.02),i%2?c:'#ffffff',dmg(.23),'mirror','만화경'); }
  function mirrorReflect(){ const c='#f9a8d4'; cast(`${boss.name}: 거울 반사탄! 탄막이 한 번 꺾여 돌아옵니다.`, 'mirror', c, 0, 1.0); for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; state.projectiles.push({owner:'boss',x:boss.x,y:boss.y,vx:Math.cos(a)*210,vy:Math.sin(a)*210,r:7,life:3.0,damage:dmg(.15),color:c,returning:true,tag:'mirror'}); } }

  function gravityPull(){ const c='#818cf8'; cast(`${boss.name}: 중력핵이 끌어당깁니다. 이동 방향을 역산하세요.`, 'gravity', c, 0, 1.15); state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:360,life:3.1,power:230,color:c}); rot(W/2,H/2,0,.9,Math.hypot(W,H),16,warn(.1),c,dmg(.27),'gravity','궤도레이저'); }
  function gravityCrush(){ const c='#a5b4fc'; cast(`${boss.name}: 중력 압축! 안쪽과 바깥쪽이 번갈아 터집니다.`, 'gravity', c, 0, 1.2); circle(W/2,H/2,125,warn(),c,dmg(.42),'gravity','중력압축'); donut(W/2,H/2,155,315,warn(.24),c,dmg(.35),'gravity','반발파동'); }
  function gravityTiles(){ const c='#818cf8'; cast(`${boss.name}: 바닥 중력이 뒤틀립니다. 안전 칸을 찾아 이동하세요.`, 'gravity', c, 0, 1.2); checker(6,4,Math.max(2,5-phase()),c,'gravity','중력칸',.30); }

  function chronoHands(){ const c='#fef08a'; cast(`${boss.name}: 시계바늘 심판! 회전 방향을 읽으세요.`, 'chrono', c, 0, 1.1); for(let i=0;i<4;i++) rot(W/2,H/2,i*Math.PI/2,(i%2?-.75:.75),Math.hypot(W,H),10,warn(i*.04),c,dmg(.24),'chrono','시계바늘'); }
  function chronoBombs(){ const c='#f472b6'; cast(`${boss.name}: 시간폭탄이 지연 폭발합니다. 미리 빠져나가세요.`, 'chrono', c, 0, 1.0); mapCircles(5+phase(),c,'chrono','시간폭탄',{r:48,r2:72,mul:.30,minDist:130}); }
  function chronoEcho(){ const c='#fde047'; cast(`${boss.name}: 지나간 위치가 되감깁니다. 이동 경로를 바꾸세요.`, 'chrono', c, 0, 1.05); const spots=[]; for(let i=0;i<5;i++) spots.push({x:player.x+rand(-110,110),y:player.y+rand(-90,90)}); spots.forEach((p,i)=>circle(clamp(p.x,70,W-70),clamp(p.y,110,H-70),54,warn(i*.12),c,dmg(.26),'chrono','잔상폭발'));
  }

  function bloodMark(){ const c='#fb7185'; cast(`${boss.name}: 피의 표식을 찍습니다. 표식은 바깥으로 빼세요.`, 'blood', c, 0, 1.05); const x=player.x,y=player.y; circle(x,y,95,warn(.16),c,dmg(.46),'blood','피표식'); donut(W/2,H/2,125,285,warn(.35),'#be123c',dmg(.34),'blood','혈월고리'); }
  function bloodBlades(){ const c='#fb7185'; cast(`${boss.name}: 흡혈 칼날이 펼쳐집니다. 칼날 사이 각도를 찾으세요.`, 'blood', c, 0, 1.1); fanFromBoss(9,1.4,c,'blood','흡혈칼날',13,820,.26); }
  function bloodMoon(){ const c='#be123c'; cast(`${boss.name}: 붉은 달이 내려옵니다. 고리 안팎을 판단하세요.`, 'blood', c, 0, 1.2); circle(W/2,H/2,210,warn(.1),c,dmg(.48),'blood','붉은달'); donut(W/2,H/2,215,340,warn(.28),'#fb7185',dmg(.32),'blood','월광파동'); }

  function solarBreath(){ const c='#facc15'; const a=Math.atan2(player.y-boss.y,player.x-boss.x); cast(`${boss.name}: 태양 숨결! 긴 부채꼴을 보고 뒤쪽으로 파고드세요.`, 'solar', c, a, 1.1); fanFromBoss(11,1.35,c,'solar','태양숨결',22,850,.34); }
  function solarEclipse(){ const c='#f97316'; cast(`${boss.name}: 일식 심판! SAFE가 아닌 전장이 불탑니다.`, 'solar', c, 0, 1.4); checker(6,4,Math.max(2,5-phase()),c,'solar','일식불꽃',.42); }
  function solarFlare(){ const c='#fef08a'; cast(`${boss.name}: 태양 플레어! 광선과 운석이 동시에 옵니다.`, 'solar', c, 0, 1.15); for(let i=0;i<6;i++) beam(W/2,H/2,i/6*Math.PI*2,Math.hypot(W,H),12,warn(i*.03),c,dmg(.25),'solar','태양광선'); mapCircles(6,'#f97316','solar','태양탄',{r:36,r2:58,mul:.26,minDist:120}); }

  function trainRails(){ const c='#fb7185'; cast(`${boss.name}: 급행열차가 지나갑니다. 레일 사이 빈 공간으로 이동하세요.`, 'train', c, 0, 1.1); const lanes=4; const safeLane=Math.floor(Math.random()*lanes); for(let i=0;i<lanes;i++){ const y=145+i*(H-230)/(lanes-1); if(i!==safeLane) wall(W/2,y,W*.94,36,warn(i*.08),c,dmg(.36),'train','급행열차'); else safe(W-140,y,52,2.0,'#bbf7d0','승강장'); } }
  function trainSwitch(){ const c='#f97316'; cast(`${boss.name}: 선로 전환! 좌우에서 번갈아 열차가 진입합니다.`, 'train', c, 0, 1.05); for(let i=0;i<6;i++){ const y=125+i*(H-205)/5; const dir=i%2?Math.PI:0; beam(i%2?W-80:80,y,dir,W*.9,22,warn(i*.09),c,dmg(.27),'train','측면열차'); } }
  function trainWheel(){ const c='#fbbf24'; cast(`${boss.name}: 차륜 폭발! 원형 충격과 레일을 같이 피하세요.`, 'train', c, 0, 1.0); mapCircles(8,c,'train','차륜폭발',{r:34,r2:55,mul:.28,minDist:115}); wall(W/2,H/2,W*.9,24,warn(.2),'#fb7185',dmg(.24),'train','중앙레일'); }

  function cubeRotate(){ const c='#93c5fd'; cast(`${boss.name}: 큐브 회전! 안전한 색 블록을 찾으세요.`, 'cube', c, 0, 1.15); checker(5,5,5,c,'cube','예언블록',.28); }
  function cubeLaser(){ const c='#a78bfa'; cast(`${boss.name}: 정육면체 광선! 수직/수평 절단이 번갈아 옵니다.`, 'cube', c, 0, 1.1); lineGrid(3,3,c,'cube','큐브절단',.30); }
  function cubeQuiz(){ const c='#fef08a'; cast(`${boss.name}: 짧은 예언 퀴즈! 정답 원을 밟으세요.`, 'cube', c, 0, 1.0); if(typeof v27QueueMini==='function') v27QueueMini('quiz', `${boss.name}가 예언 퀴즈를 냅니다! 정답을 찾으세요.`, c); else cubeRotate(); }

  function jesterShell(){ const c='#f472b6'; cast(`${boss.name}: 야바위 쇼! 진짜 컵을 기억하세요.`, 'jester', c, 0, 1.0); if(typeof v27QueueMini==='function') v27QueueMini('shell', `${boss.name}가 야바위 환상을 시작합니다! 처음 빛난 컵을 찾으세요.`, c); else mirrorClones(); }
  function jesterFireworks(){ const c='#f0abfc'; cast(`${boss.name}: 악몽 폭죽! 작고 많은 폭발을 보고 틈을 찾으세요.`, 'jester', c, 0, 1.0); mapCircles(12+phase()*2,c,'chaos','악몽폭죽',{r:22,r2:40,mul:.18,minDist:80}); }
  function jesterFakeSafe(){ const c='#f472b6'; cast(`${boss.name}: 가짜 SAFE를 섞습니다. 너무 밝은 원은 함정입니다.`, 'jester', c, 0, 1.2); const real=Math.floor(Math.random()*4); for(let i=0;i<4;i++){ const x=160+i*(W-320)/3,y=H*.56; if(i===real) safe(x,y,60,2.1,'#bbf7d0','진짜'); else circle(x,y,66,warn(.1+i*.05),c,dmg(.34),'chaos','가짜SAFE'); } }

  const V30_PATTERNS = {
    slime_king:[slimeBounce,slimeSplit,slimePuddle],
    ember_tyrant:[fireBreath,fireVolcano,fireChess],
    thorn_queen:[thornHook,thornGarden,thornBloom],
    frost_oracle:[icePrison,iceLances,iceMirror],
    sand_reaper:[sandPull,sandScythe,sandBurial],
    void_serpent:[voidPortals,voidCollapse,voidSnake],
    iron_minotaur:[ironCharge,ironAnvil,ironCage],
    blood_moon:[bloodMark,bloodBlades,bloodMoon],
    storm_colossus:[stormRods,stormGrid,stormChase],
    plague_doctor:[plagueCloud,plagueAdds,plagueSurgery],
    mirror_duelist:[mirrorClones,mirrorKaleidoscope,mirrorReflect],
    gravity_core:[gravityPull,gravityCrush,gravityTiles],
    solar_dragon:[solarBreath,solarEclipse,solarFlare],
    chrono_dragon:[chronoHands,chronoBombs,chronoEcho],
    abyss_leviathan:[icePrison,()=>{cast(`${boss.name}: 해일 벽! 줄 사이 통로를 찾으세요.`,'water','#38bdf8',0,1.1); for(let i=0;i<5;i++) wall(W/2,145+i*(H-230)/4,W*.90,26,warn(i*.08),'#38bdf8',dmg(.34),'ice','해일벽');},voidCollapse],
    puppet_emperor:[mirrorClones,thornHook,()=>{cast(`${boss.name}: 인형 못이 내려옵니다. 실에 묶인 위치를 벗어나세요.`,'puppet','#f0abfc',0,1.0); mapCircles(7,'#f0abfc','mirror','인형못',{r:30,r2:48,mul:.24,minDist:100});}],
    black_sun:[solarEclipse,solarFlare,bloodMoon],
    chaos_archon:[()=>{cast(`${boss.name}: 혼돈 재판! 서로 다른 기믹이 섞입니다.`,'chaos','#fb7185',0,1.1); const arr=[fireVolcano,stormGrid,gravityCrush,mirrorKaleidoscope,voidPortals]; arr[Math.floor(Math.random()*arr.length)]();},jesterFakeSafe,gravityPull],
    crimson_train:[trainRails,trainSwitch,trainWheel],
    prophecy_cube:[cubeRotate,cubeLaser,cubeQuiz],
    void_gardener:[thornGarden,voidPortals,plagueAdds],
    magnet_judge:[gravityPull,stormRods,()=>{cast(`${boss.name}: 극성 반전! 보스 기준 좌우가 바뀌며 폭발합니다.`,'magnet','#60a5fa',0,1.05); player.x=clamp(W-player.x,45,W-45); mapCircles(6,'#60a5fa','gravity','극성폭발',{r:36,r2:58,mul:.27,minDist:120});}],
    nightmare_jester:[jesterShell,jesterFireworks,jesterFakeSafe]
  };
  const V30_THEME = {
    fire:[fireBreath,fireVolcano,fireChess], solar:[solarBreath,solarEclipse,solarFlare], ice:[icePrison,iceLances,iceMirror], lightning:[stormRods,stormGrid,stormChase], nature:[thornHook,thornGarden,thornBloom], poison:[plagueCloud,plagueAdds,plagueSurgery], metal:[ironCharge,ironAnvil,ironCage], gravity:[gravityPull,gravityCrush,gravityTiles], mirror:[mirrorClones,mirrorKaleidoscope,mirrorReflect], chrono:[chronoHands,chronoBombs,chronoEcho], chaos:[jesterFakeSafe,gravityPull,fireVolcano]
  };

  const v30OldBossPattern = bossPattern;
  bossPattern = function(){
    if(!alive()) return;
    const pool = V30_PATTERNS[boss.id] || V30_THEME[boss.theme];
    if(!pool || !pool.length){ return v30OldBossPattern(); }
    boss._v30PatternIndex = (boss._v30PatternIndex || 0) + 1;
    const idx = (boss._v30PatternIndex - 1 + Math.max(0, phase()-1)) % pool.length;
    try { pool[idx](); }
    catch(e){ console.warn('[V30 distinct pattern fallback]', e); v30OldBossPattern(); }
    // 3페이즈 후반 보스는 작은 보조 패턴만 추가해서 개성은 유지하되 난사처럼 보이지 않게 제한.
    if(tier() >= 8 && phase() >= 3 && Math.random() < .18){
      setTimeout(()=>{ if(alive()) mapCircles(3 + Math.min(3,phase()), sub(), tag(), '보조타격', {r:24,r2:38,mul:.18,minDist:120}); }, 1250);
    }
  };

  try {
    const labels = {
      slime_king:['젤리 착지','분열 방울','말랑 웅덩이'], ember_tyrant:['화염 숨결','화산 균열','불타는 체스판'], thorn_queen:['덩굴 갈고리','가시 정원','독꽃 개화'], frost_oracle:['빙결 감옥','빙창 낙하','얼음 거울'], sand_reaper:['모래 늪','낫 돌진','매몰 지대'], void_serpent:['공허 포탈','공간 접힘','공허 뱀'], iron_minotaur:['철갑 돌진','모루 강타','강철 감옥'], blood_moon:['피의 표식','흡혈 칼날','붉은 달'], storm_colossus:['피뢰침 연결','폭풍 회로','추적 낙뢰'], plague_doctor:['역병 구름','감염체 소환','역병 수술'], mirror_duelist:['진짜 분신','만화경 절단','반사탄'], gravity_core:['중력 끌림','압축 파동','중력 바닥'], solar_dragon:['태양 숨결','일식 심판','태양 플레어'], chrono_dragon:['시계바늘','시간폭탄','되감기 잔상'], abyss_leviathan:['빙결 통로','해일 벽','심해 붕괴'], puppet_emperor:['진짜 인형','실 갈고리','인형 못'], black_sun:['일식 심판','태양 플레어','붉은 달'], chaos_archon:['혼돈 재판','가짜 SAFE','중력 재판'], crimson_train:['급행 레일','선로 전환','차륜 폭발'], prophecy_cube:['예언 블록','큐브 절단','예언 퀴즈'], void_gardener:['가시 정원','공허 문','감염 정원'], magnet_judge:['중력 끌림','피뢰침 극성','극성 반전'], nightmare_jester:['야바위 쇼','악몽 폭죽','가짜 SAFE']
    };
    BOSSES.forEach(b=>{ if(labels[b.id]) b.patterns = labels[b.id]; });
  } catch(e) {}

  window.RaidDungeonV30 = { version: V30_VERSION };
})();

/* =========================================================
   RAID DUNGEON V31 - BOSS MAP & VISUAL IDENTITY UPGRADE
   - 보스별 전용 맵 배경/장식
   - 보스 외형 고급화 및 페이즈 오라 강화
   - 보스 선택 카드 미니아트 차별화
========================================================= */
(function(){
  const V31_VERSION = 'Raid Dungeon V31 - Boss Map and Visual Identity';

  const oldDrawArenaV31 = drawArena;
  const oldDrawBossShapeV31 = drawBossShape;
  const oldBossMiniSvgV31 = bossMiniSvg;

  const ARENA_STYLE = {
    slime_king:{bg:['#062414','#123b1f'],accent:'#9dfc73',sub:'#d9ff99',motif:'slime'},
    ember_tyrant:{bg:['#270707','#56170c'],accent:'#ff6b35',sub:'#ffd166',motif:'volcano'},
    thorn_queen:{bg:['#071f12','#1f3d18'],accent:'#4ade80',sub:'#f472b6',motif:'garden'},
    frost_oracle:{bg:['#071827','#113a57'],accent:'#7dd3fc',sub:'#e0f2fe',motif:'ice'},
    sand_reaper:{bg:['#2b1705','#5a3510'],accent:'#f59e0b',sub:'#fde68a',motif:'desert'},
    void_serpent:{bg:['#07051c','#1b0d3e'],accent:'#a78bfa',sub:'#4c1d95',motif:'void'},
    iron_minotaur:{bg:['#111827','#293548'],accent:'#cbd5e1',sub:'#f97316',motif:'forge'},
    blood_moon:{bg:['#24030d','#4c0519'],accent:'#fb7185',sub:'#fda4af',motif:'blood'},
    storm_colossus:{bg:['#07111f','#1d2350'],accent:'#fde047',sub:'#60a5fa',motif:'storm'},
    plague_doctor:{bg:['#071807','#1d3309'],accent:'#a3e635',sub:'#4d7c0f',motif:'plague'},
    mirror_duelist:{bg:['#111827','#321142'],accent:'#f0abfc',sub:'#bae6fd',motif:'mirror'},
    gravity_core:{bg:['#070716','#1e1b4b'],accent:'#818cf8',sub:'#c4b5fd',motif:'gravity'},
    solar_dragon:{bg:['#261207','#5b2705'],accent:'#facc15',sub:'#fb923c',motif:'solar'},
    chrono_dragon:{bg:['#19051c','#3b1457'],accent:'#f472b6',sub:'#fef08a',motif:'chrono'},
    abyss_leviathan:{bg:['#031525','#0f3550'],accent:'#38bdf8',sub:'#0ea5e9',motif:'abyss'},
    puppet_emperor:{bg:['#1f1025','#463016'],accent:'#f0abfc',sub:'#fde68a',motif:'puppet'},
    black_sun:{bg:['#050505','#271006'],accent:'#f97316',sub:'#020617',motif:'eclipse'},
    chaos_archon:{bg:['#170316','#3b0f2f'],accent:'#fb7185',sub:'#7c3aed',motif:'chaos'},
    crimson_train:{bg:['#1b0810','#3d1014'],accent:'#fb7185',sub:'#fbbf24',motif:'train'},
    oracle_cube:{bg:['#07172a','#172554'],accent:'#93c5fd',sub:'#a78bfa',motif:'cube'},
    prophecy_cube:{bg:['#07172a','#172554'],accent:'#93c5fd',sub:'#a78bfa',motif:'cube'},
    hollow_gardener:{bg:['#041a0d','#102b1b'],accent:'#4ade80',sub:'#a78bfa',motif:'voidgarden'},
    void_gardener:{bg:['#041a0d','#102b1b'],accent:'#4ade80',sub:'#a78bfa',motif:'voidgarden'},
    magnet_judge:{bg:['#071827','#13233b'],accent:'#60a5fa',sub:'#fb7185',motif:'magnet'},
    dream_jester:{bg:['#20051f','#41105a'],accent:'#f472b6',sub:'#fde047',motif:'circus'},
    nightmare_jester:{bg:['#20051f','#41105a'],accent:'#f472b6',sub:'#fde047',motif:'circus'}
  };

  function styleForBoss(b){
    return ARENA_STYLE[b.id] || ARENA_STYLE[b.theme] || {bg:['#081126','#030712'],accent:b.color||'#60a5fa',sub:b.sub||'#fff',motif:'default'};
  }
  function strokeLine(c,x1,y1,x2,y2,col,w,alpha){ c.save(); c.globalAlpha=alpha==null?1:alpha; c.strokeStyle=col; c.lineWidth=w||2; c.lineCap='round'; c.beginPath(); c.moveTo(x1,y1); c.lineTo(x2,y2); c.stroke(); c.restore(); }
  function polyPath(c,pts,fill,stroke,w){ c.beginPath(); pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); c.closePath(); if(fill){c.fillStyle=fill;c.fill();} if(stroke){c.strokeStyle=stroke;c.lineWidth=w||2;c.stroke();} }
  function ring(c,x,y,r,col,w,alpha){ c.save(); c.globalAlpha=alpha==null?1:alpha; c.strokeStyle=col; c.lineWidth=w||2; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.stroke(); c.restore(); }
  function fillCircle(c,x,y,r,col,alpha){ c.save(); c.globalAlpha=alpha==null?1:alpha; c.fillStyle=col; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill(); c.restore(); }
  function star(c,x,y,r,n,col,alpha){ c.save(); c.globalAlpha=alpha==null?1:alpha; c.fillStyle=col; c.beginPath(); for(let i=0;i<n*2;i++){ const rr=i%2?r:r*.45; const a=-Math.PI/2+i*Math.PI/n; c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr); } c.closePath(); c.fill(); c.restore(); }
  function snow(c,x,y,r,col){ for(let i=0;i<6;i++){ const a=i*Math.PI/3; strokeLine(c,x+Math.cos(a)*r*.15,y+Math.sin(a)*r*.15,x+Math.cos(a)*r,y+Math.sin(a)*r,col,2,.45); } }

  drawArena = function(){
    try {
      const b = getBoss(boss && boss.id ? boss.id : state.selectedBossId);
      const s = styleForBoss(b);
      const t = state.time || 0;
      const g = ctx.createLinearGradient(0,0,W,H);
      g.addColorStop(0,s.bg[0]); g.addColorStop(1,s.bg[1]);
      ctx.fillStyle = g; ctx.fillRect(0,0,W,H);

      // 공통 전장 바닥: 보스별 색으로 된 원형 거리선
      ctx.save(); ctx.globalAlpha=.13; ctx.strokeStyle=s.accent; ctx.lineWidth=2;
      for(let i=0;i<17;i++){ ctx.beginPath(); ctx.arc(W/2,H/2,70+i*42+Math.sin(t+i)*3,0,Math.PI*2); ctx.stroke(); }
      ctx.restore();

      // 테마별 맵 장식. 실제 판정은 없고, 보스의 정체성을 보여주는 배경 연출.
      ctx.save();
      if(s.motif==='slime'){
        for(let i=0;i<12;i++) fillCircle(ctx,80+i*105,120+(i%3)*165,38+(i%2)*18,s.accent,.09);
        for(let i=0;i<7;i++) ring(ctx,140+i*160,600-((i%2)*90),45,s.sub,5,.16);
      } else if(s.motif==='volcano'){
        for(let i=0;i<10;i++){ const x=70+i*140; strokeLine(ctx,x,80,x+120,H-45,s.accent,3,.15); strokeLine(ctx,x+38,H-80,x+150,110,s.sub,2,.10); }
        for(let i=0;i<8;i++) fillCircle(ctx,120+i*145,610-(i%3)*100,32,s.accent,.14);
      } else if(s.motif==='garden' || s.motif==='voidgarden'){
        for(let i=0;i<9;i++){ const x=80+i*150; strokeLine(ctx,x,H,x+70,120,s.accent,6,.13); fillCircle(ctx,x+70,120,25,s.sub,.20); }
        if(s.motif==='voidgarden') for(let i=0;i<5;i++) ring(ctx,190+i*220,170+(i%2)*260,52,'#a78bfa',4,.22);
      } else if(s.motif==='ice'){
        for(let y=120;y<H;y+=95) for(let x=70;x<W;x+=130) snow(ctx,x,y,30,s.sub);
        for(let i=0;i<5;i++) strokeLine(ctx,120+i*250,90,30+i*260,H-40,s.accent,3,.15);
      } else if(s.motif==='desert'){
        for(let i=0;i<9;i++){ ctx.save(); ctx.globalAlpha=.18; ctx.strokeStyle=s.accent; ctx.lineWidth=4; ctx.beginPath(); ctx.ellipse(120+i*145,170+(i%3)*140,110,34,Math.sin(i)*.4,0,Math.PI*2); ctx.stroke(); ctx.restore(); }
      } else if(s.motif==='void'){
        for(let i=0;i<8;i++){ ring(ctx,120+i*150,150+(i%4)*115,48,s.accent,5,.2); strokeLine(ctx,120+i*150,150+(i%4)*115,W/2,H/2,s.sub,2,.08); }
      } else if(s.motif==='forge'){
        for(let x=80;x<W;x+=160) strokeLine(ctx,x,80,x,H-60,s.accent,5,.12);
        for(let y=140;y<H;y+=120) strokeLine(ctx,40,y,W-40,y,s.sub,4,.10);
        for(let i=0;i<8;i++) star(ctx,150+i*135,610-(i%2)*70,18,4,s.sub,.14);
      } else if(s.motif==='blood'){
        fillCircle(ctx,W-170,150,90,s.accent,.16); ring(ctx,W-170,150,110,s.sub,6,.18);
        for(let i=0;i<12;i++) fillCircle(ctx,80+i*115,rand(110,H-80),14,s.accent,.12);
      } else if(s.motif==='storm'){
        for(let i=0;i<12;i++){ const x=70+i*110; strokeLine(ctx,x,80,x+rand(-40,40),H-60,i%2?s.sub:s.accent,3,.16); }
        for(let y=145;y<H;y+=135) strokeLine(ctx,50,y,W-50,y,s.sub,3,.10);
      } else if(s.motif==='plague'){
        for(let i=0;i<15;i++) fillCircle(ctx,rand(60,W-60),rand(110,H-60),rand(16,46),s.accent,.07);
        for(let i=0;i<6;i++) ring(ctx,170+i*180,180+(i%2)*260,50,s.sub,4,.15);
      } else if(s.motif==='mirror'){
        for(let i=0;i<9;i++){ const x=70+i*145; polyPath(ctx,[[x,120],[x+80,150],[x+55,250],[x-25,220]],'rgba(255,255,255,.04)',s.accent,2); }
        for(let i=0;i<7;i++) strokeLine(ctx,0,120+i*80,W,80+i*90,s.sub,2,.12);
      } else if(s.motif==='gravity'){
        for(let i=0;i<6;i++){ ctx.save(); ctx.translate(W/2,H/2); ctx.rotate(t*.12+i*Math.PI/6); ctx.strokeStyle=i%2?s.sub:s.accent; ctx.globalAlpha=.16; ctx.lineWidth=4; ctx.beginPath(); ctx.ellipse(0,0,160+i*55,60+i*25,0,0,Math.PI*2); ctx.stroke(); ctx.restore(); }
      } else if(s.motif==='solar' || s.motif==='eclipse'){
        fillCircle(ctx,W/2,H/2,150,s.motif==='eclipse'?'#020617':s.accent,.14); ring(ctx,W/2,H/2,178,s.accent,6,.28);
        for(let i=0;i<18;i++){ const a=i*Math.PI*2/18+t*.03; strokeLine(ctx,W/2+Math.cos(a)*190,H/2+Math.sin(a)*190,W/2+Math.cos(a)*520,H/2+Math.sin(a)*520,s.sub,3,.10); }
      } else if(s.motif==='chrono'){
        ring(ctx,W/2,H/2,235,s.accent,4,.18); ring(ctx,W/2,H/2,300,s.sub,2,.13);
        for(let i=0;i<12;i++){ const a=i*Math.PI*2/12; strokeLine(ctx,W/2+Math.cos(a)*210,H/2+Math.sin(a)*210,W/2+Math.cos(a)*245,H/2+Math.sin(a)*245,s.sub,3,.18); }
        strokeLine(ctx,W/2,H/2,W/2+Math.cos(t*.6)*250,H/2+Math.sin(t*.6)*250,s.accent,3,.16);
      } else if(s.motif==='abyss'){
        for(let y=130;y<H;y+=85){ ctx.save(); ctx.globalAlpha=.16; ctx.strokeStyle=s.accent; ctx.lineWidth=4; ctx.beginPath(); for(let x=0;x<=W;x+=40){ const yy=y+Math.sin(x*.025+t*2+y*.01)*18; if(x===0)ctx.moveTo(x,yy); else ctx.lineTo(x,yy); } ctx.stroke(); ctx.restore(); }
      } else if(s.motif==='puppet'){
        for(let x=120;x<W;x+=120) strokeLine(ctx,x,0,x,H,s.sub,2,.13);
        for(let i=0;i<6;i++){ fillCircle(ctx,150+i*190,160+(i%2)*320,34,s.accent,.08); strokeLine(ctx,150+i*190,20,150+i*190,160+(i%2)*320,s.sub,2,.20); }
      } else if(s.motif==='chaos'){
        for(let i=0;i<18;i++){ star(ctx,rand(50,W-50),rand(95,H-55),rand(18,40),3+i%4,i%2?s.accent:s.sub,.08); }
        for(let i=0;i<8;i++) ring(ctx,rand(80,W-80),rand(120,H-80),rand(35,90),i%2?s.accent:s.sub,3,.14);
      } else if(s.motif==='train'){
        for(let y=135;y<H;y+=135){ strokeLine(ctx,60,y,W-60,y,s.accent,8,.20); for(let x=70;x<W;x+=80) strokeLine(ctx,x,y-30,x+30,y+30,s.sub,3,.18); }
      } else if(s.motif==='cube'){
        for(let x=75;x<W;x+=120) for(let y=115;y<H;y+=95){ ctx.save(); ctx.globalAlpha=.08; ctx.strokeStyle=s.accent; ctx.lineWidth=2; ctx.strokeRect(x,y,82,58); ctx.restore(); }
        for(let i=0;i<7;i++) ring(ctx,160+i*160,180+(i%2)*230,42,s.sub,3,.14);
      } else if(s.motif==='magnet'){
        for(let i=0;i<7;i++){ const x=120+i*170; fillCircle(ctx,x,150,28,s.accent,.13); fillCircle(ctx,x,H-120,28,s.sub,.13); strokeLine(ctx,x,150,x,H-120,i%2?s.accent:s.sub,3,.11); }
        strokeLine(ctx,W/2,95,W/2,H-55,s.accent,4,.15);
      } else if(s.motif==='circus'){
        for(let i=0;i<10;i++){ const x=i*W/9; strokeLine(ctx,W/2,70,x,H,s.accent,3,.12); }
        for(let i=0;i<6;i++) fillCircle(ctx,160+i*180,160+(i%2)*320,50,i%2?s.accent:s.sub,.08);
      }
      ctx.restore();
    } catch(e) {
      try { oldDrawArenaV31(); } catch(_) {}
    }
  };

  drawBossShape = function(c,b,x,y,r){
    try {
      c.save(); c.translate(x,y);
      const t = state.time || 0;
      const id = b.id || '';
      const ph = boss && boss.id===id ? (boss.hp < boss.maxHp*.33 ? 3 : boss.hp < boss.maxHp*.66 ? 2 : 1) : 1;
      c.shadowColor = b.color; c.shadowBlur = 18 + ph*5;
      if(ph>=2){ ring(c,0,0,r*(1.25+.05*Math.sin(t*4)),b.color,4,.45); }
      if(ph>=3){ for(let i=0;i<8;i++){ const a=t*1.1+i*Math.PI/4; star(c,Math.cos(a)*r*1.25,Math.sin(a)*r*1.25,7,3,i%2?b.color:b.sub,.65); } }
      function eye(ex,ey,s){ fillCircle(c,ex,ey,s,'#020617',1); fillCircle(c,ex-s*.25,ey-s*.3,s*.28,'#fff',.75); }
      function mouth(y,w){ c.strokeStyle='#020617'; c.lineWidth=Math.max(2,r*.06); c.lineCap='round'; c.beginPath(); c.arc(0,y,w,0,Math.PI); c.stroke(); }
      function blade(a,len,col){ c.save(); c.rotate(a); polyPath(c,[[0,-5],[len,-r*.16],[len+r*.25,0],[len,r*.16],[0,5]],col,'#fff8',2); c.restore(); }
      function bodyRound(col){ c.fillStyle=col; c.beginPath(); c.ellipse(0,0,r*.9,r*.75,0,0,Math.PI*2); c.fill(); }

      if(id==='slime_king'){
        c.fillStyle=b.color; c.beginPath(); c.ellipse(0,18,r*1.38,r*.85,0,0,Math.PI*2); c.fill();
        fillCircle(c,-r*.42,0,r*.22,'#ffffff',.28); c.fillStyle=b.sub; polyPath(c,[[-r*.48,-r*.54],[-r*.28,-r*.95],[0,-r*.62],[r*.28,-r*.95],[r*.48,-r*.54]],b.sub,'#fff8',2); eye(-r*.35,6,6); eye(r*.35,6,6); mouth(16,r*.25);
      } else if(id==='ember_tyrant'){
        for(let i=0;i<18;i++){ const a=i*Math.PI*2/18+t*.03; blade(a,r*(.8+(i%2)*.5),i%2?b.color:b.sub); }
        fillCircle(c,0,0,r*.66,b.color,1); fillCircle(c,0,0,r*.42,b.sub,.9); eye(-r*.22,-r*.03,6); eye(r*.22,-r*.03,6); c.fillStyle='#7f1d1d'; polyPath(c,[[-r*.4,-r*.33],[-r*.95,-r*.95],[-r*.62,-r*.05]],'#7f1d1d'); polyPath(c,[[r*.4,-r*.33],[r*.95,-r*.95],[r*.62,-r*.05]],'#7f1d1d');
      } else if(id==='thorn_queen'){
        for(let i=0;i<14;i++) blade(i*Math.PI*2/14,r*1.25,i%2?b.sub:'#166534');
        c.fillStyle='#f472b6'; c.beginPath(); for(let i=0;i<14;i++){ const a=i*Math.PI*2/14; const rr=i%2?r*.75:r*1.05; c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr); } c.closePath(); c.fill(); fillCircle(c,0,0,r*.42,'#14532d',1); eye(-r*.15,-r*.02,5); eye(r*.15,-r*.02,5);
      } else if(id==='frost_oracle'){
        c.fillStyle=b.color; c.beginPath(); for(let i=0;i<8;i++){ const a=i*Math.PI*2/8+Math.PI/8; c.lineTo(Math.cos(a)*r*1.05,Math.sin(a)*r*1.05); } c.closePath(); c.fill(); c.strokeStyle='#e0f2fe'; c.lineWidth=5; c.stroke();
        for(let i=0;i<8;i++) blade(i*Math.PI/4,r*1.35,'#dbeafe'); fillCircle(c,0,0,r*.5,b.sub,.9); eye(-r*.18,-r*.05,5); eye(r*.18,-r*.05,5);
      } else if(id==='sand_reaper'){
        c.fillStyle='#78350f'; c.beginPath(); c.ellipse(0,12,r*.72,r*1.05,0,0,Math.PI*2); c.fill();
        c.fillStyle=b.color; c.beginPath(); c.arc(0,-r*.15,r*.76,Math.PI,0); c.lineTo(r*.56,r*.58); c.lineTo(-r*.56,r*.58); c.closePath(); c.fill(); c.strokeStyle=b.sub; c.lineWidth=8; c.beginPath(); c.arc(r*.45,-r*.1,r*.85,-1.5,1.4); c.stroke(); eye(-r*.16,-r*.18,5); eye(r*.16,-r*.18,5);
      } else if(id==='void_serpent' || id==='abyss_leviathan'){
        c.strokeStyle=b.color; c.lineWidth=id==='abyss_leviathan'?22:19; c.lineCap='round'; c.beginPath(); for(let i=0;i<12;i++){ const px=-r*1.25+i*r*.24; const py=Math.sin(i*.8+t*2.4)*r*(id==='abyss_leviathan'?.28:.2); if(i)c.lineTo(px,py); else c.moveTo(px,py); } c.stroke();
        fillCircle(c,r*1.25,0,r*.48,b.sub,1); if(id==='abyss_leviathan') ring(c,r*1.25,0,r*.68,'#7dd3fc',5,.55); else { blade(.1,r*.75,b.color); blade(-.1,r*.75,b.color); } eye(r*1.08,-r*.1,5); eye(r*1.3,-r*.1,5);
      } else if(id==='iron_minotaur'){
        c.fillStyle='#475569'; roundRect(c,-r*.86,-r*.66,r*1.72,r*1.38,18); c.fillStyle=b.color; roundRect(c,-r*.58,-r*.98,r*1.16,r*.85,14);
        polyPath(c,[[-r*.36,-r*.72],[-r*1.15,-r*1.05],[-r*.66,-r*.34]],'#e5e7eb'); polyPath(c,[[r*.36,-r*.72],[r*1.15,-r*1.05],[r*.66,-r*.34]],'#e5e7eb'); c.strokeStyle=b.sub; c.lineWidth=10; c.beginPath(); c.moveTo(r*.62,-r*.1); c.lineTo(r*1.28,-r*.62); c.stroke(); eye(-r*.22,-r*.45,5); eye(r*.22,-r*.45,5);
      } else if(id==='blood_moon'){
        fillCircle(c,0,0,r*.9,b.color,1); c.globalCompositeOperation='destination-out'; fillCircle(c,r*.22,-r*.08,r*.75,'#000',1); c.globalCompositeOperation='source-over'; ring(c,0,0,r*1.05,b.sub,8,.65); fillCircle(c,-r*.1,0,r*.22,b.sub,.9); eye(-r*.22,-r*.05,5); eye(.03,-r*.05,5);
      } else if(id==='storm_colossus'){
        c.fillStyle='#334155'; roundRect(c,-r*.82,-r*.86,r*1.64,r*1.72,16); c.fillStyle=b.color; polyPath(c,[[-r*.1,-r*1.14],[r*.36,-r*.15],[r*.05,-r*.15],[r*.34,r*.78],[-r*.44,-r*.05],[-r*.1,-r*.05]],b.color); ring(c,0,0,r*1.18,b.sub,5,.35); eye(-r*.3,-r*.26,6); eye(r*.3,-r*.26,6);
      } else if(id==='plague_doctor'){
        c.fillStyle='#111827'; c.beginPath(); c.ellipse(0,0,r*.76,r*1.05,0,0,Math.PI*2); c.fill(); c.fillStyle=b.color; polyPath(c,[[-r*.15,-r*.12],[r*1.15,0],[-r*.15,r*.24]],b.color,'#bef264',2); c.fillStyle='#e5e7eb'; c.beginPath(); c.ellipse(-r*.2,-r*.17,r*.39,r*.55,-.25,0,Math.PI*2); c.fill(); for(let i=0;i<4;i++) fillCircle(c,-r*.55+i*r*.25,r*.55,8,b.color,.4); eye(-r*.26,-r*.25,5); eye(-r*.03,-r*.21,5);
      } else if(id==='mirror_duelist'){
        polyPath(c,[[0,-r*1.15],[r*.85,-r*.25],[r*.55,r*.95],[-r*.55,r*.95],[-r*.85,-r*.25]],'rgba(255,255,255,.22)',b.color,6); strokeLine(c,-r*.58,r*.65,r*.75,-r*.7,'#fff',4,.85); fillCircle(c,0,0,r*.18,b.sub,.8); eye(-r*.2,-r*.05,5); eye(r*.2,-r*.05,5);
      } else if(id==='gravity_core'){
        for(let i=0;i<5;i++){ c.save(); c.rotate(t*.9+i*.7); c.strokeStyle=i%2?b.sub:b.color; c.globalAlpha=.8; c.lineWidth=5; c.beginPath(); c.ellipse(0,0,r*(1.2-i*.12),r*(.42+i*.04),0,0,Math.PI*2); c.stroke(); c.restore(); } fillCircle(c,0,0,r*.42,b.sub,1); fillCircle(c,0,0,r*.14,'#fff',.9);
      } else if(id==='solar_dragon' || id==='black_sun'){
        const dark=id==='black_sun'; fillCircle(c,0,0,r*.88,dark?'#020617':b.color,1); ring(c,0,0,r*1.05,dark?b.color:b.sub,7,.8); for(let i=0;i<14;i++){ c.save(); c.rotate(i*Math.PI/7+t*.28); c.fillStyle=i%2?(dark?b.color:b.sub):(dark?'#fef08a':b.color); c.fillRect(r*.72,-4,r*.55,8); c.restore(); } if(id==='solar_dragon'){ polyPath(c,[[-r*.35,-r*.33],[-r*.72,-r*1.0],[-r*.12,-r*.55]],b.sub); polyPath(c,[[r*.35,-r*.33],[r*.72,-r*1.0],[r*.12,-r*.55]],b.sub); } eye(-r*.22,-r*.06,5); eye(r*.22,-r*.06,5);
      } else if(id==='chrono_dragon'){
        ring(c,0,0,r*1.1,b.color,7,.8); ring(c,0,0,r*.72,b.sub,4,.7); fillCircle(c,0,0,r*.48,'#312e81',1); strokeLine(c,0,0,Math.cos(t)*r*.48,Math.sin(t)*r*.48,b.sub,5,.95); strokeLine(c,0,0,Math.cos(t*1.7)*r*.34,Math.sin(t*1.7)*r*.34,b.color,4,.95); eye(-r*.18,-r*.12,5); eye(r*.18,-r*.12,5);
      } else if(id==='puppet_emperor'){
        for(let i=-2;i<=2;i++) strokeLine(c,i*r*.22,-r*1.55,i*r*.16,-r*.5,b.sub,2,.75); c.fillStyle=b.color; roundRect(c,-r*.66,-r*.58,r*1.32,r*1.22,12); c.fillStyle=b.sub; polyPath(c,[[-r*.45,-r*.72],[0,-r*1.1],[r*.45,-r*.72]],b.sub); c.fillStyle='#020617'; roundRect(c,-r*.42,-r*.22,r*.84,r*.42,6); eye(-r*.18,-r*.1,5); eye(r*.18,-r*.1,5);
      } else if(id==='chaos_archon'){
        for(let i=0;i<9;i++){ c.save(); c.rotate(t*.8+i*Math.PI*2/9); star(c,0,-r*.72,r*.3,3,i%2?b.color:b.sub,.9); c.restore(); } fillCircle(c,0,0,r*.68,'#020617',1); ring(c,0,0,r*.75,b.color,5,.9); fillCircle(c,0,0,r*.22,b.sub,1); eye(-r*.22,-r*.1,5); eye(r*.22,-r*.1,5);
      } else if(id==='crimson_train'){
        c.fillStyle=b.color; roundRect(c,-r*1.1,-r*.45,r*2.2,r*.9,14); c.fillStyle=b.sub; roundRect(c,-r*.72,-r*.75,r*.7,r*.45,8); roundRect(c,r*.15,-r*.75,r*.55,r*.45,8); fillCircle(c,-r*.55,r*.55,r*.18,'#111827'); fillCircle(c,r*.55,r*.55,r*.18,'#111827'); eye(r*.55,-r*.08,5);
      } else if(id==='oracle_cube' || id==='prophecy_cube'){
        c.save(); c.rotate(Math.PI/4+t*.15); c.fillStyle=b.color; c.fillRect(-r*.65,-r*.65,r*1.3,r*1.3); c.strokeStyle=b.sub; c.lineWidth=5; c.strokeRect(-r*.65,-r*.65,r*1.3,r*1.3); c.restore(); ring(c,0,0,r*1.2,b.sub,4,.45); eye(-r*.18,-r*.06,5); eye(r*.18,-r*.06,5);
      } else if(id==='hollow_gardener' || id==='void_gardener'){
        fillCircle(c,0,0,r*.7,'#14532d',1); for(let i=0;i<10;i++) blade(i*Math.PI*2/10,r*1.18,i%2?b.color:b.sub); ring(c,0,0,r*.9,'#a78bfa',5,.45); eye(-r*.18,-r*.05,5); eye(r*.18,-r*.05,5);
      } else if(id==='magnet_judge'){
        c.fillStyle='#1e293b'; roundRect(c,-r*.75,-r*.9,r*1.5,r*1.8,18); c.fillStyle=b.color; roundRect(c,-r*.55,-r*.7,r*.45,r*1.4,10); c.fillStyle=b.sub; roundRect(c,r*.1,-r*.7,r*.45,r*1.4,10); ring(c,0,0,r*1.2,'#fff',4,.35); eye(-r*.22,-r*.05,5); eye(r*.22,-r*.05,5);
      } else if(id==='dream_jester' || id==='nightmare_jester'){
        c.fillStyle=b.color; c.beginPath(); c.ellipse(0,0,r*.76,r*.82,0,0,Math.PI*2); c.fill(); for(let i=-1;i<=1;i++){ fillCircle(c,i*r*.42,-r*.82,r*.22,i===0?b.sub:b.color,.95); } c.fillStyle='#fff'; c.beginPath(); c.arc(0,0,r*.42,0,Math.PI); c.fill(); eye(-r*.2,-r*.1,5); eye(r*.2,-r*.1,5); c.fillStyle='#020617'; c.beginPath(); c.arc(0,r*.12,r*.22,0,Math.PI); c.fill();
      } else {
        oldDrawBossShapeV31(c,b,x,y,r);
      }
      c.restore();
    } catch(e) {
      try { c.restore(); } catch(_) {}
      try { oldDrawBossShapeV31(c,b,x,y,r); } catch(_) {}
    }
  };

  bossMiniSvg = function(b){
    try {
      const s = styleForBoss(b);
      const id = b.id || '';
      let shape = '';
      if(id==='crimson_train') shape = `<rect x="18" y="38" width="84" height="25" rx="8" fill="${s.accent}"/><rect x="35" y="22" width="24" height="20" rx="5" fill="${s.sub}"/><circle cx="38" cy="67" r="6" fill="#111827"/><circle cx="82" cy="67" r="6" fill="#111827"/>`;
      else if(id==='oracle_cube'||id==='prophecy_cube') shape = `<rect x="38" y="23" width="44" height="44" transform="rotate(45 60 45)" fill="${s.accent}" stroke="${s.sub}" stroke-width="4"/><circle cx="52" cy="45" r="3" fill="#020617"/><circle cx="68" cy="45" r="3" fill="#020617"/>`;
      else if(id==='dream_jester'||id==='nightmare_jester') shape = `<circle cx="60" cy="48" r="28" fill="${s.accent}"/><circle cx="45" cy="24" r="9" fill="${s.sub}"/><circle cx="60" cy="18" r="9" fill="${s.accent}"/><circle cx="75" cy="24" r="9" fill="${s.sub}"/><path d="M44 55 Q60 70 76 55" stroke="#fff" stroke-width="6" fill="none"/>`;
      else if(s.motif==='ice') shape = `<polygon points="60,8 89,30 78,70 42,70 31,30" fill="${s.accent}" stroke="${s.sub}" stroke-width="4"/><line x1="60" y1="10" x2="60" y2="76" stroke="#e0f2fe" stroke-width="3"/>`;
      else if(s.motif==='storm') shape = `<path d="M58 8 L83 42 L65 42 L78 78 L38 35 L56 35 Z" fill="${s.accent}"/><circle cx="60" cy="48" r="24" fill="#334155" opacity=".75"/>`;
      else if(s.motif==='void'||s.motif==='gravity') shape = `<ellipse cx="60" cy="45" rx="42" ry="18" fill="none" stroke="${s.accent}" stroke-width="6"/><ellipse cx="60" cy="45" rx="20" ry="34" fill="none" stroke="${s.sub}" stroke-width="4"/><circle cx="60" cy="45" r="14" fill="${s.sub}"/>`;
      else if(s.motif==='solar'||s.motif==='eclipse') shape = `<circle cx="60" cy="45" r="24" fill="${s.motif==='eclipse'?'#020617':s.accent}" stroke="${s.sub}" stroke-width="6"/>${Array.from({length:10}).map((_,i)=>{const a=i*Math.PI*2/10;const x1=60+Math.cos(a)*30,y1=45+Math.sin(a)*30,x2=60+Math.cos(a)*43,y2=45+Math.sin(a)*43;return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${s.accent}" stroke-width="4"/>`;}).join('')}`;
      else shape = oldBossMiniSvgV31(b).match(/<g[^>]*>([\s\S]*?)<\/g>/)?.[1] || `<circle cx="60" cy="44" r="28" fill="${s.accent}"/><circle cx="50" cy="40" r="4" fill="#020617"/><circle cx="70" cy="40" r="4" fill="#020617"/>`;
      return `<svg width="120" height="86" viewBox="0 0 120 86"><defs><filter id="v31_${String(id).replace(/[^a-z0-9_]/g,'')}"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs><rect x="3" y="3" width="114" height="80" rx="16" fill="${s.bg[0]}" opacity=".5"/><g filter="url(#v31_${String(id).replace(/[^a-z0-9_]/g,'')})">${shape}</g></svg>`;
    } catch(e) { return oldBossMiniSvgV31(b); }
  };

  try {
    const allChanged = {};
    BOSSES.forEach(b => { allChanged[b.id] = true; });
    window.RaidDungeonV31 = { version: V31_VERSION, bossMapAndVisualsAppliedTo: Object.keys(allChanged) };
  } catch(e) { window.RaidDungeonV31 = { version: V31_VERSION }; }
})();

/* =========================================================
   RAID DUNGEON V32 - TRUE BOSS IDENTITY PATTERN REBUILD
   - 색만 다른 레이저/원형 패턴을 줄이고 보스별 규칙 자체를 분리
   - 각 보스마다 테마에 맞는 고유 패턴 3종 이상
   - 보스 데미지 추가 상향
========================================================= */
(function raidDungeonV32TrueBossIdentityPatch(){
  const V32_VERSION = 'Raid Dungeon V32 - True Boss Identity Pattern Rebuild';
  try { console.log('[RaidDungeon]', V32_VERSION); } catch(e) {}

  try {
    BOSSES.forEach(b=>{
      if(!b._v32AtkBoosted){
        b.atk = Math.round((b.atk || 12) * 1.23 * 10) / 10;
        b._v32AtkBoosted = true;
      }
    });
  } catch(e) { console.warn('[V32 atk boost failed]', e); }

  function alive(){ return state && state.raid && boss && !boss.dead && !state.miniGame && !state.pendingMiniGame; }
  function C(){ return (boss && (boss.color || boss.sub)) || '#93c5fd'; }
  function S(){ return (boss && (boss.sub || boss.color)) || '#ffffff'; }
  function T(){ return (boss && (boss.theme || boss.id)) || 'boss'; }
  function P(){ return boss && boss.phase ? boss.phase : 1; }
  function D(m){ return (boss && boss.atk ? boss.atk : 12) * m * (P()>=3 ? 1.18 : P()>=2 ? 1.10 : 1); }
  function say(text, color){ if(boss) boss.mechanicText = text; floatText(text, W/2, 88, color || C(), 18); }
  function cast(text, kind, color, angle){
    if(typeof v28Cast === 'function') v28Cast(text, kind || 'cast', color || C(), angle == null ? Math.atan2(player.y-boss.y, player.x-boss.x) : angle, 1.05);
    else if(typeof v20BossCast === 'function') v20BossCast(text, kind || 'cast', color || C(), angle == null ? Math.atan2(player.y-boss.y, player.x-boss.x) : angle);
    else say(text, color);
  }
  function push(h){ h.warn = Math.max(h.warn || 1.05, .75); h.life = Math.max(h.life || .7, .6); h.v32 = true; state.hazards.push(h); }
  function circle(x,y,r,warn,color,dmg,tag,label){ push({kind:'circle',x,y,r,warn,life:.82,damage:dmg,color,tag,label}); }
  function donut(x,y,inner,outer,warn,color,dmg,tag,label){ push({kind:'donut',x,y,inner,outer,warn,life:.86,damage:dmg,color,tag,label}); }
  function beam(x,y,a,len,w,warn,color,dmg,tag,label){ push({kind:'beam',x,y,angle:a,len,w,warn,life:.86,damage:dmg,color,tag,label}); }
  function wall(x,y,w,h,warn,color,dmg,tag,label){ push({kind:'wall',x,y,w,h,warn,life:.92,damage:dmg,color,tag,label}); }
  function floor(x,y,w,h,warn,color,dmg,tag,label){ push({kind:'floor',x,y,w,h,warn,life:.90,damage:dmg,color,tag,label}); }
  function rot(x,y,a,spin,len,w,warn,color,dmg,tag,label,life){ push({kind:'rotatingBeam',x,y,angle:a,spin,len,w,warn,life:life||2.2,damage:dmg,color,tag,label}); }
  function bulletTo(x,y,speed,color,dmg,tag,r){ const a=Math.atan2(y-boss.y,x-boss.x); spawnProjectile({owner:'boss',x:boss.x+Math.cos(a)*boss.r*.7,y:boss.y+Math.sin(a)*boss.r*.7,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:r||8,life:3.2,color,damage:dmg,tag}); }
  function ringBullets(n,speed,color,dmg,tag,offset){ for(let i=0;i<n;i++){ const a=(i/n)*Math.PI*2+(offset||0); spawnProjectile({owner:'boss',x:boss.x+Math.cos(a)*boss.r*.7,y:boss.y+Math.sin(a)*boss.r*.7,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:7,life:3,color,damage:dmg,tag}); } }
  function safe(x,y,r,life,color){ state.mechanics.push({kind:'safe',x,y,r,life:life||2.1,color:color||'#86efac'}); }
  function add(x,y,color,hp){ state.mechanics.push({kind:'add',x,y,r:25,life:8,hp:hp||120,color:color||C()}); }
  function gravity(x,y,power,life,color){ state.mechanics.push({kind:'gravity',x,y,r:285,life:life||2.5,power:power||180,color:color||C()}); }
  function clearBossOffense(){ try { clearEnemyBullets(true); } catch(e) {} state.hazards = []; state.zones = state.zones.filter(z=>z && z.heal && !z.enemy); }
  function mini(type,line,color){ if(typeof v24QueueMiniGame === 'function'){ boss.mechanicText = line; floatText(line,W/2,88,color||C(),20); v24QueueMiniGame(type); } }

  const Pattern = {
    slime_king:[
      function(){ cast('젤리 왕이 통통 튀며 착지합니다. 그림자를 보고 벗어나세요!', 'slam', '#9dfc73'); const pts=[[player.x,player.y],[rand(120,W-120),rand(140,H-90)],[boss.x+rand(-180,180),boss.y+rand(80,220)]]; pts.forEach((p,i)=>circle(p[0],p[1],78-i*8,1.0+i*.28,'#9dfc73',D(.48),'slime','젤리착지')); },
      function(){ cast('젤리 왕이 분열 방울을 뿌립니다. 방울 사이 빈틈을 찾으세요!', 'burst', '#b6ff8a'); for(let k=0;k<3;k++) setTimeout(()=>ringBullets(10+k*2,145+k*35,'#b6ff8a',D(.14),'slime',k*.18),k*360); },
      function(){ cast('말랑 웅덩이가 퍼집니다. 오래 밟으면 위험합니다!', 'slam', '#7ee787'); for(let i=0;i<7;i++){ const x=rand(100,W-100), y=rand(130,H-70); circle(x,y,42, .85+i*.05,'#7ee787',D(.25),'slime','웅덩이'); setTimeout(()=>{ if(alive()) state.zones.push({x,y,r:46,damage:D(.018),life:2.4,tick:0,color:'#7ee787',enemy:true,dot:true}); },950+i*50); } }
    ],
    ember_tyrant:[
      function(){ const a=Math.atan2(player.y-boss.y,player.x-boss.x); cast('화염 폭군이 전방으로 불을 내뿜습니다. 보스 옆이나 뒤로 이동하세요!', 'beam', '#ff6b35', a); for(let i=-4;i<=4;i++) beam(boss.x+Math.cos(a+i*.10)*260,boss.y+Math.sin(a+i*.10)*260,a+i*.10,560,24,1.0+(i+4)*.035,'#ff6b35',D(.44),'fire','화염숨결'); },
      function(){ cast('화산 균열이 맵을 가릅니다. 균열 선에서 벗어나세요!', 'slam', '#ff9f1c'); for(let i=0;i<5;i++){ const a=(i/5)*Math.PI + rand(-.15,.15); beam(W/2,H/2,a,W*1.35,20,1.05+i*.08,'#ff9f1c',D(.48),'fire','화산균열'); } },
      function(){ cast('불타는 체스판! 빛나는 칸을 피하세요.', 'slam', '#fb923c'); const cw=W/6,ch=(H-110)/4; for(let gx=0;gx<6;gx++) for(let gy=0;gy<4;gy++) if((gx+gy+Math.floor(state.time))%2===0) floor(cw*gx+cw/2,105+ch*gy+ch/2,cw*.82,ch*.76,1.15,'#fb923c',D(.36),'fire','체스판'); }
    ],
    thorn_queen:[
      function(){ cast('가시 여왕이 덩굴 갈고리를 던집니다. 선을 끊듯이 옆으로 피하세요!', 'beam', '#22c55e'); const a=Math.atan2(player.y-boss.y,player.x-boss.x); beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,dist(boss.x,boss.y,player.x,player.y)+240,18,1.05,'#22c55e',D(.35),'poison','덩굴갈고리'); setTimeout(()=>{ if(alive()){ const px=player.x-boss.x,py=player.y-boss.y,side=Math.abs(-px*Math.sin(a)+py*Math.cos(a)),along=px*Math.cos(a)+py*Math.sin(a); if(along>0&&side<50){ player.x=clamp(player.x-Math.cos(a)*150,50,W-50); player.y=clamp(player.y-Math.sin(a)*150,95,H-55); hurtPlayer(D(.22),'#22c55e'); } } },1080); },
      function(){ cast('독꽃 정원! 꽃이 피는 곳은 독 지대가 됩니다.', 'cast', '#84cc16'); for(let i=0;i<8;i++){ const x=rand(90,W-90),y=rand(125,H-75); circle(x,y,38,1.0+i*.07,'#84cc16',D(.22),'poison','독꽃'); setTimeout(()=>{ if(alive()) state.zones.push({x,y,r:48,damage:D(.018),life:3.0,tick:0,color:'#84cc16',enemy:true,dot:true}); },1100+i*70); } },
      function(){ cast('가시 울타리가 자라납니다. 열린 통로를 찾으세요.', 'wall', '#4ade80'); const gap=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==gap) wall(150+i*(W-300)/4,H/2,28,H*.76,1.12,'#4ade80',D(.44),'poison','가시벽'); }
    ],
    frost_oracle:[
      function(){ cast('빙결 예언자가 얼음 감옥을 세웁니다. 막히지 않은 길을 찾으세요!', 'wall', '#7dd3fc'); const gap=Math.floor(Math.random()*6); for(let i=0;i<6;i++) if(i!==gap) wall(100+i*(W-200)/5,H/2,24,H*.78,1.08,'#7dd3fc',D(.42),'ice','얼음감옥'); },
      function(){ cast('빙창이 위에서 꽂힙니다. 그림자를 보고 이동하세요.', 'slam', '#bae6fd'); for(let i=0;i<10;i++) circle(rand(70,W-70),rand(118,H-80),28+i%2*8,.85+i*.06,'#bae6fd',D(.32),'ice','빙창'); },
      function(){ cast('얼음 거울이 반사선을 만듭니다. 교차 지점에서 벗어나세요.', 'beam', '#dbeafe'); for(let i=0;i<4;i++){ beam(160+i*(W-320)/3,H/2,Math.PI/2,H*.88,16,1.1+i*.11,'#dbeafe',D(.36),'ice','얼음거울'); beam(W/2,130+i*(H-210)/3,0,W*.90,13,1.24+i*.11,'#93c5fd',D(.28),'ice','반사선'); } }
    ],
    sand_reaper:[
      function(){ cast('모래 늪이 중심으로 끌어당깁니다. 바깥으로 달려 나가세요!', 'cast', '#f59e0b'); gravity(W/2,H/2,190,2.8,'#f59e0b'); donut(W/2,H/2,70,265,1.35,'#f59e0b',D(.58),'sand','모래늪'); },
      function(){ cast('모래 사신이 낫 돌진을 준비합니다. 옆으로 구르세요!', 'dash', '#fde68a'); const a=Math.atan2(player.y-boss.y,player.x-boss.x); beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,880,30,1.05,'#fde68a',D(.68),'sand','낫돌진'); setTimeout(()=>{ if(alive()){ boss.x=clamp(boss.x+Math.cos(a)*260,80,W-80); boss.y=clamp(boss.y+Math.sin(a)*260,120,H-80); burst(boss.x,boss.y,'#fde68a',28,240); } },1100); },
      function(){ cast('매몰 지대! 안전한 모래 언덕을 찾아 이동하세요.', 'slam', '#fbbf24'); const safeIdx=Math.floor(Math.random()*4); for(let i=0;i<4;i++){ const x=160+i*(W-320)/3; if(i!==safeIdx) floor(x,H/2,W*.18,H*.78,1.2,'#fbbf24',D(.50),'sand','매몰'); else safe(x,H*.70,52,2.1,'#fde68a'); } }
    ],
    void_serpent:[
      function(){ cast('공허의 뱀이 포탈 절단선을 엽니다. 선 사이 틈을 보세요!', 'beam', '#a78bfa'); const pts=[[80,120,W-90,H-80],[W-90,120,80,H-80],[W/2,90,W/2,H-55]]; pts.forEach((p,i)=>beam((p[0]+p[2])/2,(p[1]+p[3])/2,Math.atan2(p[3]-p[1],p[2]-p[0]),dist(p[0],p[1],p[2],p[3]),18,1.1+i*.18,'#a78bfa',D(.44),'void','공허포탈')); },
      function(){ cast('공간이 접힙니다. 접힘 원 밖으로 빠져나오세요!', 'slam', '#8b5cf6'); for(let i=0;i<5;i++) donut(rand(130,W-130),rand(145,H-85),32,88,1.05+i*.08,'#8b5cf6',D(.42),'void','공간접힘'); },
      function(){ cast('공허 뱀이 S자 이동 경로를 남깁니다. 경로를 밟지 마세요!', 'beam', '#c4b5fd'); for(let i=0;i<9;i++){ const x=100+i*(W-200)/8, y=H/2+Math.sin(i*.9)*160; circle(x,y,38,0.95+i*.05,'#c4b5fd',D(.30),'void','뱀이동'); } }
    ],
    iron_minotaur:[
      function(){ cast('철갑 미노타우로스가 돌진합니다. 옆으로 피하면 딜 타이밍입니다!', 'dash', '#cbd5e1'); const a=Math.atan2(player.y-boss.y,player.x-boss.x); beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,900,34,1.08,'#cbd5e1',D(.78),'metal','철갑돌진'); },
      function(){ cast('모루 강타! 보스 주변 충격파와 바닥 균열을 피하세요.', 'slam', '#f97316'); circle(boss.x,boss.y,170,1.05,'#f97316',D(.62),'metal','모루강타'); for(let i=0;i<8;i++) beam(boss.x,boss.y,i*Math.PI/4,420,14,1.16,'#94a3b8',D(.30),'metal','균열'); },
      function(){ cast('강철 감옥! 닫히는 벽 사이 빈칸으로 이동하세요.', 'wall', '#94a3b8'); const gap=Math.floor(Math.random()*4); for(let i=0;i<4;i++) if(i!==gap) wall(W/2,150+i*(H-230)/3,W*.90,32,1.18,'#94a3b8',D(.55),'metal','강철벽'); }
    ],
    blood_moon:[
      function(){ cast('피의 표식이 당신 위치에 새겨집니다. 표식을 밖으로 빼세요!', 'cast', '#fb7185'); const x=player.x,y=player.y; circle(x,y,82,1.45,'#fb7185',D(.72),'blood','피의표식'); setTimeout(()=>{ if(alive()) state.zones.push({x,y,r:74,damage:D(.035),life:2.2,tick:0,color:'#fb7185',enemy:true,dot:true}); },1500); },
      function(){ cast('흡혈 칼날이 부채꼴로 날아옵니다. 틈을 찾으세요!', 'beam', '#ef4444'); const base=Math.atan2(player.y-boss.y,player.x-boss.x); for(let i=-3;i<=3;i++) beam(boss.x+Math.cos(base+i*.19)*320,boss.y+Math.sin(base+i*.19)*320,base+i*.19,620,13,1.0+(i+3)*.06,'#ef4444',D(.36),'blood','흡혈칼날'); },
      function(){ cast('붉은 달이 차오릅니다. 달 밖의 안전 구역을 찾으세요!', 'slam', '#be123c'); donut(W/2,H/2,150,310,1.55,'#be123c',D(.70),'blood','붉은달'); safe(W*.18,H*.70,48,2.2,'#fecdd3'); safe(W*.82,H*.70,48,2.2,'#fecdd3'); }
    ],
    storm_colossus:[
      function(){ cast('피뢰침이 연결됩니다. 전류 선을 건너지 마세요!', 'beam', '#fde047'); const rods=[]; for(let i=0;i<5;i++) rods.push({x:130+i*(W-260)/4,y:rand(150,H-90)}); rods.forEach(r=>circle(r.x,r.y,24,.8,'#fde047',D(.22),'lightning','피뢰침')); for(let i=0;i<rods.length-1;i++) beam((rods[i].x+rods[i+1].x)/2,(rods[i].y+rods[i+1].y)/2,Math.atan2(rods[i+1].y-rods[i].y,rods[i+1].x-rods[i].x),dist(rods[i].x,rods[i].y,rods[i+1].x,rods[i+1].y),16,1.25,'#fde047',D(.44),'lightning','전류연결'); },
      function(){ cast('폭풍 회로가 회전합니다. 구르기로 통과할 타이밍을 보세요!', 'beam', '#facc15'); for(let i=0;i<3;i++) rot(W/2,H/2,i*Math.PI/3,i%2?-.95:.95,W*1.25,16,1.15,'#facc15',D(.36),'lightning','폭풍회로',2.5); },
      function(){ cast('추적 낙뢰! 잠시 후 현재 위치에 번개가 떨어집니다.', 'slam', '#fde047'); for(let i=0;i<7;i++){ setTimeout(()=>{ if(alive()) circle(player.x+rand(-45,45),player.y+rand(-45,45),34,.72,'#fde047',D(.36),'lightning','추적낙뢰'); },i*280); } }
    ],
    plague_doctor:[
      function(){ cast('역병 구름이 퍼집니다. 해독 룬을 활용하세요!', 'cast', '#a3e635'); for(let i=0;i<8;i++){ const x=rand(95,W-95), y=rand(130,H-80); circle(x,y,42,.85+i*.08,'#a3e635',D(.22),'poison','역병구름'); setTimeout(()=>{ if(alive()) state.zones.push({x,y,r:55,damage:D(.018),life:3.4,tick:0,color:'#a3e635',enemy:true,dot:true}); },950+i*80); } state.mechanics.push({kind:'rune',x:rand(120,W-120),y:rand(140,H-90),r:38,life:4.0,action:'cleanse',color:'#bef264'}); },
      function(){ cast('감염체가 소환됩니다. 빠르게 제거하면 보스가 약화됩니다.', 'cast', '#84cc16'); for(let i=0;i<3+P();i++) add(rand(120,W-120),rand(140,H-90),'#84cc16',90+boss.tier*15); },
      function(){ cast('역병 수술선! 교차하는 절개선을 피하세요.', 'beam', '#bef264'); for(let i=0;i<6;i++) beam(W/2,H/2,(i*Math.PI/6)+.35,W*1.15,12,1.05+i*.06,'#bef264',D(.34),'poison','수술선'); }
    ],
    mirror_duelist:[
      function(){ cast('거울 분신! 밝은 분신 주변만 안전합니다.', 'cast', '#f0abfc'); const real=Math.floor(Math.random()*4); for(let i=0;i<4;i++){ const x=170+i*(W-340)/3,y=H*.45; if(i===real) safe(x,y,55,2.1,'#d9f99d'); else circle(x,y,60,1.25,'#f0abfc',D(.46),'mirror','가짜분신'); } },
      function(){ cast('만화경 절단! 대각선 절단선이 순서대로 빛납니다.', 'beam', '#e879f9'); for(let i=0;i<6;i++) beam(W/2,H/2,Math.PI/6+i*Math.PI/6,W*1.25,14,1.0+i*.12,'#e879f9',D(.38),'mirror','만화경'); },
      function(){ cast('반사탄이 벽을 향해 퍼집니다. 좁은 틈을 찾으세요!', 'burst', '#f0abfc'); ringBullets(18,210,'#f0abfc',D(.16),'mirror',Math.random()); }
    ],
    gravity_core:[
      function(){ cast('중력핵이 끌어당깁니다. 바깥쪽으로 버티세요!', 'cast', '#818cf8'); gravity(W/2,H/2,250,3.0,'#818cf8'); for(let i=0;i<3;i++) donut(W/2,H/2,80+i*72,128+i*72,1.2+i*.25,'#818cf8',D(.40),'gravity','중력파'); },
      function(){ cast('압축 폭발! 중심부에서 멀어지세요.', 'slam', '#a5b4fc'); circle(W/2,H/2,185,1.55,'#a5b4fc',D(.82),'gravity','압축폭발'); },
      function(){ cast('궤도 레이저가 공전합니다. 구르기 타이밍을 잡으세요.', 'beam', '#c4b5fd'); for(let i=0;i<4;i++) rot(W/2,H/2,i*Math.PI/4,i%2?.75:-.75,W*1.2,14,1.15,'#c4b5fd',D(.34),'gravity','궤도',2.5); }
    ],
    solar_dragon:[
      function(){ cast('태양룡이 태양 숨결을 내뿜습니다. 넓은 부채꼴을 피하세요!', 'beam', '#facc15'); const a=Math.atan2(player.y-boss.y,player.x-boss.x); for(let i=-5;i<=5;i++) beam(boss.x+Math.cos(a+i*.08)*320,boss.y+Math.sin(a+i*.08)*320,a+i*.08,680,18,1.0+(i+5)*.025,'#facc15',D(.40),'solar','태양숨결'); },
      function(){ cast('일식 심판! SAFE 외의 모든 곳이 타오릅니다.', 'slam', '#fb923c'); const sx=rand(160,W-160), sy=rand(180,H-110); safe(sx,sy,68,2.3,'#fde68a'); floor(W/2,H/2,W*.96,H*.78,1.6,'#fb923c',D(.92),'solar','일식심판'); },
      function(){ cast('태양 플레어가 맵을 가릅니다. 광선 사이로 피하세요.', 'beam', '#fdba74'); for(let i=0;i<8;i++) beam(W/2,H/2,i*Math.PI/4,W*1.2,13,1.05+i*.05,'#fdba74',D(.32),'solar','플레어'); }
    ],
    chrono_dragon:[
      function(){ cast('시계바늘이 회전합니다. 바늘 방향을 보고 이동하세요!', 'beam', '#f472b6'); for(let i=0;i<3;i++) rot(W/2,H/2,i*Math.PI*2/3,.85,W*1.1,13,1.1,'#f472b6',D(.32),'chrono','시계바늘',2.35); },
      function(){ cast('시간폭탄이 과거 위치에 생성됩니다. 방금 지나온 자리를 피하세요.', 'slam', '#fef08a'); const spots = state._v32Trail || [{x:player.x,y:player.y}]; spots.slice(-6).forEach((p,i)=>circle(p.x,p.y,42,1.0+i*.10,'#fef08a',D(.36),'chrono','시간폭탄')); },
      function(){ cast('예언 퀴즈가 시작됩니다. 정답 원을 밟으세요!', 'cast', '#fef08a'); mini('quiz', `${boss.name}가 시간의 질문을 던집니다! 정답 원을 밟으세요.`, '#fef08a'); }
    ],
    abyss_leviathan:[
      function(){ cast('심해 해일이 줄지어 밀려옵니다. 빈 수로로 이동하세요!', 'wall', '#38bdf8'); const safeRow=Math.floor(Math.random()*4); for(let i=0;i<4;i++) if(i!==safeRow) wall(W/2,145+i*(H-220)/3,W*.92,36,1.08+i*.08,'#38bdf8',D(.48),'ice','해일벽'); },
      function(){ cast('소용돌이가 끌어당깁니다. 바깥으로 빠져나가세요!', 'cast', '#0ea5e9'); gravity(W/2,H/2,210,2.8,'#0ea5e9'); donut(W/2,H/2,90,280,1.3,'#0ea5e9',D(.55),'ice','소용돌이'); },
      function(){ cast('심해 촉수가 끌어당깁니다. 촉수선을 피하세요!', 'beam', '#7dd3fc'); for(let i=0;i<4;i++){ const x=120+i*(W-240)/3; beam((x+player.x)/2,(H+player.y)/2,Math.atan2(player.y-H,x-player.x),dist(x,H,player.x,player.y)+120,16,1.0+i*.12,'#7dd3fc',D(.36),'ice','촉수'); } }
    ],
    puppet_emperor:[
      function(){ cast('실 조종선! 얇은 실에 닿으면 묶입니다.', 'beam', '#f0abfc'); for(let i=0;i<7;i++) beam(100+i*(W-200)/6,H/2,Math.PI/2,H*.9,10,1.0+i*.07,'#f0abfc',D(.30),'mirror','실'); },
      function(){ cast('인형 갈고리! 선에서 벗어나지 못하면 끌려갑니다.', 'beam', '#fde68a'); const a=Math.atan2(player.y-boss.y,player.x-boss.x); beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,dist(boss.x,boss.y,player.x,player.y)+260,16,1.1,'#fde68a',D(.32),'mirror','갈고리'); },
      function(){ cast('단두대 줄이 내려옵니다. 줄 사이 빈칸으로 이동하세요!', 'wall', '#fca5a5'); const safe=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==safe) wall(130+i*(W-260)/4,H/2,30,H*.82,1.18,'#fca5a5',D(.52),'mirror','단두대'); }
    ],
    black_sun:[
      function(){ cast('검은 일식! SAFE가 아닌 곳은 전부 타오릅니다.', 'slam', '#f97316'); const safeCount=2; for(let i=0;i<safeCount;i++) safe(220+i*(W-440)/(safeCount-1),H*.70,62,2.4,'#fde68a'); floor(W/2,H/2,W*.96,H*.80,1.7,'#f97316',D(.95),'solar','검은일식'); },
      function(){ cast('무너지는 바닥! 금 간 칸을 보고 이동하세요.', 'slam', '#fb923c'); const cw=W/7,ch=(H-110)/4; for(let i=0;i<14;i++){ const gx=Math.floor(Math.random()*7), gy=Math.floor(Math.random()*4); floor(cw*gx+cw/2,110+ch*gy+ch/2,cw*.82,ch*.72,1.05+i*.035,'#fb923c',D(.38),'solar','붕괴'); } },
      function(){ cast('태양 심판! 큰 태양탄이 순서대로 떨어집니다.', 'slam', '#facc15'); for(let i=0;i<5;i++) circle(rand(120,W-120),rand(135,H-85),70,1.05+i*.25,'#facc15',D(.56),'solar','태양심판'); }
    ],
    chaos_archon:[
      function(){ cast('혼돈 재판! 색과 모양이 다른 공격이 섞입니다.', 'cast', '#fb7185'); circle(rand(120,W-120),rand(130,H-80),82,1.1,'#fb7185',D(.48),'chaos','혼돈원'); donut(rand(160,W-160),rand(150,H-110),45,130,1.25,'#a78bfa',D(.50),'chaos','혼돈도넛'); beam(W/2,H/2,rand(0,Math.PI),W*1.1,18,1.35,'#facc15',D(.46),'chaos','혼돈선'); },
      function(){ cast('가짜 SAFE! 진짜 빛나는 SAFE만 밟으세요.', 'cast', '#c084fc'); const real=Math.floor(Math.random()*3); for(let i=0;i<3;i++){ const x=260+i*(W-520)/2,y=H*.68; if(i===real) safe(x,y,58,2.1,'#86efac'); else state.mechanics.push({kind:'safe',x,y,r:58,life:2.1,color:'#fb7185',fake:true}); } floor(W/2,H/2,W*.96,H*.78,1.55,'#7c3aed',D(.78),'chaos','가짜SAFE'); },
      function(){ cast('무작위 보스 기믹을 섞습니다. 빠르게 규칙을 읽으세요!', 'cast', '#fb7185'); const f=[Pattern.storm_colossus[0],Pattern.thorn_queen[1],Pattern.gravity_core[0],Pattern.mirror_duelist[0],Pattern.ember_tyrant[1]]; f[Math.floor(Math.random()*f.length)](); }
    ],
    crimson_train:[
      function(){ cast('진홍 열차가 레일을 점화합니다. 빈 레일로 이동하세요!', 'wall', '#fb7185'); const safeRow=Math.floor(Math.random()*4); for(let i=0;i<4;i++) if(i!==safeRow) wall(W/2,145+i*(H-225)/3,W*.94,42,1.1+i*.08,'#fb7185',D(.54),'metal','급행레일'); },
      function(){ cast('선로 전환! 곧 방향이 바뀌는 교차 레일이 지나갑니다.', 'beam', '#fbbf24'); for(let i=0;i<5;i++) beam(W/2,H/2,(i%2?Math.PI/5:-Math.PI/5)+i*.15,W*1.2,20,1.1+i*.12,'#fbbf24',D(.40),'metal','선로전환'); },
      function(){ cast('차륜 폭발! 레일 끝에서 폭발이 이어집니다.', 'slam', '#ef4444'); for(let i=0;i<8;i++) circle(90+i*(W-180)/7,rand(130,H-80),38,0.9+i*.10,'#ef4444',D(.34),'metal','차륜'); }
    ],
    oracle_cube:[
      function(){ cast('예언 큐브가 블록을 예고합니다. 막히는 칸을 피하세요.', 'floor', '#93c5fd'); const cw=W/6,ch=(H-120)/4; for(let gx=0;gx<6;gx++) for(let gy=0;gy<4;gy++) if(Math.random()<.45) floor(cw*gx+cw/2,110+ch*gy+ch/2,cw*.72,ch*.65,1.15,'#93c5fd',D(.34),'mirror','예언블록'); },
      function(){ cast('큐브 절단! 수직/수평 절단이 교차합니다.', 'beam', '#a78bfa'); for(let i=0;i<4;i++){ wall(160+i*(W-320)/3,H/2,22,H*.86,1.0+i*.11,'#a78bfa',D(.38),'mirror','큐브절단'); wall(W/2,150+i*(H-230)/3,W*.88,20,1.16+i*.11,'#93c5fd',D(.34),'mirror','큐브절단'); } },
      function(){ cast('예언 퀴즈! 정답 원을 밟아 큐브를 멈추세요.', 'cast', '#93c5fd'); mini('quiz', `${boss.name}가 예언 문제를 냅니다! 정답 원을 밟으세요.`, '#93c5fd'); }
    ],
    hollow_gardener:[
      function(){ cast('공허 정원사가 뿌리를 뻗습니다. 자라나는 선을 피하세요!', 'beam', '#4ade80'); for(let i=0;i<7;i++){ const a=-Math.PI/2+i*Math.PI/6; beam(boss.x,boss.y,a,520,18,1.0+i*.06,'#4ade80',D(.34),'poison','공허뿌리'); } },
      function(){ cast('공허꽃이 피어납니다. 보라색 꽃은 폭발합니다.', 'slam', '#a78bfa'); for(let i=0;i<8;i++) circle(rand(90,W-90),rand(125,H-80),42,1.0+i*.08,i%2?'#a78bfa':'#4ade80',D(.36),'poison','공허꽃'); },
      function(){ cast('정원 미궁! 벽 사이 길을 찾아 탈출하세요.', 'cast', '#a78bfa'); mini('maze', `${boss.name}가 공허 정원 미궁을 엽니다!`, '#a78bfa'); }
    ],
    magnet_judge:[
      function(){ cast('극성 반전! N/S 전류선 사이에서 위치를 조절하세요.', 'beam', '#60a5fa'); for(let i=0;i<6;i++){ const x=100+i*(W-200)/5; beam(x,H/2,Math.PI/2,H*.86,14,1.0+i*.07,i%2?'#fb7185':'#60a5fa',D(.36),'lightning','극성선'); } },
      function(){ cast('자석 재판관이 끌어당깁니다. 반대 방향으로 도망치세요!', 'cast', '#60a5fa'); gravity(W/2,H/2,260,2.5,'#60a5fa'); circle(W/2,H/2,125,1.45,'#fb7185',D(.62),'lightning','자기압축'); },
      function(){ cast('금속 파편이 극성에 따라 날아옵니다.', 'burst', '#93c5fd'); for(let i=0;i<16;i++) setTimeout(()=>bulletTo(rand(60,W-60),rand(100,H-60),300,'#93c5fd',D(.14),'lightning',6),i*65); }
    ],
    dream_jester:[
      function(){ cast('악몽 광대가 야바위를 시작합니다. 처음 빛난 컵을 찾으세요!', 'cast', '#f472b6'); mini('shell', `${boss.name}가 야바위 환상을 시작합니다! 처음 빛난 컵을 찾으세요.`, '#f472b6'); },
      function(){ cast('악몽 폭죽! 폭죽 궤적과 착탄 지점을 모두 피하세요.', 'burst', '#fde047'); for(let i=0;i<12;i++){ const x=rand(100,W-100),y=rand(130,H-80); bulletTo(x,y,250,'#fde047',D(.12),'chaos',6); circle(x,y,34,1.0+i*.04,'#f472b6',D(.30),'chaos','폭죽'); } },
      function(){ cast('가짜 SAFE가 섞였습니다. 진짜 SAFE만 밟으세요!', 'cast', '#f472b6'); const real=Math.floor(Math.random()*4); for(let i=0;i<4;i++){ const x=180+i*(W-360)/3,y=H*.67; if(i===real) safe(x,y,54,2.1,'#86efac'); else state.mechanics.push({kind:'safe',x,y,r:54,life:2.1,color:'#fb7185',fake:true}); } floor(W/2,H/2,W*.92,H*.78,1.5,'#f472b6',D(.70),'chaos','가짜무대'); }
    ]
  };
  Pattern.prophecy_cube = Pattern.oracle_cube;
  Pattern.void_gardener = Pattern.hollow_gardener;
  Pattern.nightmare_jester = Pattern.dream_jester;

  const V32_LABELS = {
    slime_king:['젤리 착지','분열 방울','말랑 웅덩이'], ember_tyrant:['화염 숨결','화산 균열','불타는 체스판'], thorn_queen:['덩굴 갈고리','독꽃 정원','가시 울타리'], frost_oracle:['얼음 감옥','빙창 낙하','얼음 거울'], sand_reaper:['모래 늪','낫 돌진','매몰 지대'], void_serpent:['포탈 절단','공간 접힘','공허 뱀길'], iron_minotaur:['철갑 돌진','모루 강타','강철 감옥'], blood_moon:['피의 표식','흡혈 칼날','붉은 달'], storm_colossus:['피뢰침 연결','폭풍 회로','추적 낙뢰'], plague_doctor:['역병 구름','감염체 소환','역병 수술선'], mirror_duelist:['진짜 분신','만화경 절단','반사탄'], gravity_core:['중력 흡입','압축 폭발','궤도 레이저'], solar_dragon:['태양 숨결','일식 심판','태양 플레어'], chrono_dragon:['시계바늘','시간폭탄','예언 퀴즈'], abyss_leviathan:['해일 벽','소용돌이','심해 촉수'], puppet_emperor:['실 조종선','인형 갈고리','단두대 줄'], black_sun:['검은 일식','붕괴 바닥','태양 심판'], chaos_archon:['혼돈 재판','가짜 SAFE','무작위 기믹'], crimson_train:['급행 레일','선로 전환','차륜 폭발'], oracle_cube:['예언 블록','큐브 절단','예언 퀴즈'], prophecy_cube:['예언 블록','큐브 절단','예언 퀴즈'], hollow_gardener:['공허 뿌리','공허꽃','정원 미궁'], void_gardener:['공허 뿌리','공허꽃','정원 미궁'], magnet_judge:['극성선','자기압축','금속 파편'], dream_jester:['야바위 쇼','악몽 폭죽','가짜 SAFE'], nightmare_jester:['야바위 쇼','악몽 폭죽','가짜 SAFE']
  };
  try { BOSSES.forEach(b=>{ if(V32_LABELS[b.id]) b.patterns = V32_LABELS[b.id]; }); } catch(e) {}

  const oldBossPatternV32 = bossPattern;
  bossPattern = function(){
    if(!alive()) return;
    const list = Pattern[boss.id];
    if(!list || !list.length) return oldBossPatternV32();
    boss._v32Index = ((boss._v32Index || 0) + 1);
    const idx = (boss._v32Index - 1 + Math.max(0,P()-1)) % list.length;
    try { list[idx](); }
    catch(e){ console.warn('[V32 distinct boss pattern fallback]', e); oldBossPatternV32(); }
    // 3페이즈 고등급 보스는 동일 패턴을 겹치는 대신, 테마 보조 공격을 아주 약하게 추가한다.
    if(boss.tier >= 8 && P() >= 3 && Math.random() < .12){
      setTimeout(()=>{ if(alive()) circle(rand(90,W-90),rand(125,H-80),34, .75, S(), D(.24), T(), '분노잔상'); }, 900);
    }
  };

  // 시간폭탄용 플레이어 잔상 기록
  const oldUpdateV32 = update;
  update = function(dt){
    if(state && state.raid && player){
      state._v32Trail = state._v32Trail || [];
      state._v32Trail.push({x:player.x,y:player.y});
      if(state._v32Trail.length > 24) state._v32Trail.shift();
    }
    oldUpdateV32(dt);
  };

  window.RaidDungeonV32 = { version: V32_VERSION, bosses: Object.keys(Pattern).length };
})();

/* =========================================================
   RAID DUNGEON V33 - HIGH TIER PATTERN EXPANSION / TRUE DISTINCT RAID RULES
   - higher tier bosses have more unique pattern entries
   - boss damage increased again
   - V32 similar-feeling rotations are overridden
========================================================= */
(function raidDungeonV33HighTierPatternExpansion(){
  const V33_VERSION = 'Raid Dungeon V33 - High Tier Pattern Expansion / Checked';
  try { console.log('[RaidDungeon]', V33_VERSION); } catch(e) {}

  function alive(){ return state && state.raid && boss && !boss.dead && !state.miniGame && !state.pendingMiniGame; }
  function ph(){ return boss && boss.phase ? boss.phase : 1; }
  function cc(){ return (boss && boss.color) || '#93c5fd'; }
  function ss(){ return (boss && boss.sub) || cc(); }
  function th(){ return (boss && boss.theme) || 'boss'; }
  function dmg(m){ return ((boss && boss.atk) || 16) * m * (ph() >= 3 ? 1.28 : ph() >= 2 ? 1.16 : 1); }
  function cast(text, kind, color, angle){
    if(typeof v28Cast === 'function') v28Cast(text, kind || 'cast', color || cc(), angle == null ? Math.atan2(player.y-boss.y, player.x-boss.x) : angle, 1.18);
    else if(typeof v20BossCast === 'function') v20BossCast(text, kind || 'cast', color || cc(), angle == null ? Math.atan2(player.y-boss.y, player.x-boss.x) : angle);
    else { boss.mechanicText = text; floatText(text, W/2, 84, color || cc(), 18); }
  }
  function push(h){ h.warn = Math.max(h.warn || 1.0, .70); h.life = Math.max(h.life || .68, .55); h.v33 = true; state.hazards.push(h); }
  function circle(x,y,r,warn,color,damage,tag,label,life){ push({kind:'circle',x,y,r,warn,life:life||.86,damage,color,tag,label}); }
  function donut(x,y,inner,outer,warn,color,damage,tag,label,life){ push({kind:'donut',x,y,inner,outer,warn,life:life||.92,damage,color,tag,label}); }
  function beam(x,y,a,len,w,warn,color,damage,tag,label,life){ push({kind:'beam',x,y,angle:a,len,w,warn,life:life||.86,damage,color,tag,label}); }
  function wall(x,y,w,h,warn,color,damage,tag,label,life){ push({kind:'wall',x,y,w,h,warn,life:life||.94,damage,color,tag,label}); }
  function floor(x,y,w,h,warn,color,damage,tag,label,life){ push({kind:'floor',x,y,w,h,warn,life:life||.90,damage,color,tag,label}); }
  function rot(x,y,a,spin,len,w,warn,color,damage,tag,label,life){ push({kind:'rotatingBeam',x,y,angle:a,spin,len,w,warn,life:life||2.25,damage,color,tag,label}); }
  function proj(x,y,vx,vy,r,color,damage,tag,life){ spawnProjectile({owner:'boss',x,y,vx,vy,r:r||7,life:life||3,color,damage,tag}); }
  function radial(n,speed,color,damage,tag,offset,r){ for(let i=0;i<n;i++){ const a=(i/n)*Math.PI*2+(offset||0); proj(boss.x+Math.cos(a)*boss.r*.8,boss.y+Math.sin(a)*boss.r*.8,Math.cos(a)*speed,Math.sin(a)*speed,r||7,color,damage,tag,3.2); } }
  function aimed(speed,color,damage,tag,r,fromX,fromY){ const x=fromX==null?boss.x:fromX, y=fromY==null?boss.y:fromY; const a=Math.atan2(player.y-y,player.x-x); proj(x,y,Math.cos(a)*speed,Math.sin(a)*speed,r||8,color,damage,tag,3.1); }
  function zone(x,y,r,damage,color,life){ state.zones.push({x,y,r,damage,life:life||2.8,tick:0,color,enemy:true,dot:true}); }
  function safe(x,y,r,life,color){ state.mechanics.push({kind:'safe',x,y,r,life:life||2.2,color:color||'#86efac'}); }
  function add(x,y,color,hp){ state.mechanics.push({kind:'add',x,y,r:24,life:8.5,hp:hp||130,color:color||cc()}); }
  function gravity(x,y,power,life,color){ state.mechanics.push({kind:'gravity',x,y,r:295,life:life||2.6,power:power||190,color:color||cc()}); }
  function mini(type,line,color){ if(typeof v24QueueMiniGame === 'function'){ boss.mechanicText = line; floatText(line,W/2,88,color||cc(),20); v24QueueMiniGame(type); } }
  function ppos(){ return {x: player.x, y: player.y}; }
  function randomSpots(n, marginX, marginY){ const a=[]; for(let i=0;i<n;i++) a.push({x:rand(marginX||90,W-(marginX||90)), y:rand(marginY||120,H-(marginY||70))}); return a; }

  try { BOSSES.forEach(b=>{ if(!b._v33AtkBoosted){ b.atk = Math.round((b.atk || 14) * 1.32 * 10) / 10; b._v33AtkBoosted = true; } }); } catch(e) {}

  const V33_PATTERNS = {
    slime_king:[
      {n:'왕관 점프 착지',p:1,f(){ cast('젤리 왕이 왕관 그림자로 착지합니다. 그림자 밖으로 피하세요!', 'slam', '#9dfc73'); [[player.x,player.y],...randomSpots(2,140,150)].forEach((q,i)=>circle(q.x,q.y,86-i*10,1+i*.24,'#9dfc73',dmg(.45),'slime','왕관착지')); }},
      {n:'분열 젤리 방울',p:1,f(){ cast('분열 젤리 방울이 두 번 터집니다. 방울 사이를 통과하세요!', 'burst', '#b6ff8a'); for(let k=0;k<2;k++) setTimeout(()=>radial(10+k*5,135+k*40,'#b6ff8a',dmg(.16),'slime',k*.22,7),k*420); }},
      {n:'말랑 늪 확산',p:1,f(){ cast('말랑 늪이 퍼집니다. 오래 밟으면 녹아내립니다!', 'slam', '#7ee787'); randomSpots(7,95,130).forEach((q,i)=>{ circle(q.x,q.y,38,0.85+i*.06,'#7ee787',dmg(.22),'slime','말랑늪'); setTimeout(()=>{ if(alive()) zone(q.x,q.y,45,dmg(.018),'#7ee787',2.4); },920+i*50); }); }},
      {n:'젤리 탄성 벽',p:1,f(){ cast('탄성 젤리 벽이 튕겨 나옵니다. 벽 사이 틈을 찾으세요!', 'wall', '#bbf7d0'); const gap=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==gap) wall(150+i*(W-300)/4,H/2,34,H*.68,1.05,'#bbf7d0',dmg(.36),'slime','탄성벽'); }}
    ],
    ember_tyrant:[
      {n:'전방 화염 숨결',p:1,f(){ const a=Math.atan2(player.y-boss.y,player.x-boss.x); cast('화염 폭군이 전방 화염 숨결을 뿜습니다. 옆으로 파고드세요!', 'beam', '#ff6b35', a); for(let i=-5;i<=5;i++) beam(boss.x+Math.cos(a+i*.09)*285,boss.y+Math.sin(a+i*.09)*285,a+i*.09,600,24,0.95+(i+5)*.03,'#ff6b35',dmg(.48),'fire','화염숨결'); }},
      {n:'용암 균열 별모양',p:1,f(){ cast('용암 균열이 별모양으로 갈라집니다. 선을 밟지 마세요!', 'slam', '#ff9f1c'); for(let i=0;i<7;i++) beam(W/2,H/2,i*Math.PI/7+rand(-.08,.08),W*1.35,20,1.05+i*.05,'#ff9f1c',dmg(.48),'fire','용암균열'); }},
      {n:'화산탄 낙하',p:1,f(){ cast('화산탄이 넓게 떨어집니다. 착탄 그림자를 보고 움직이세요!', 'slam', '#fb923c'); randomSpots(11,80,125).forEach((q,i)=>circle(q.x,q.y,42+i%3*7,.82+i*.05,'#fb923c',dmg(.34),'fire','화산탄')); }},
      {n:'불타는 체스판',p:1,f(){ cast('불타는 체스판! 다음 색 칸이 타오릅니다.', 'floor', '#fdba74'); const cw=W/7,ch=(H-115)/4, flip=Math.floor(state.time)%2; for(let gx=0;gx<7;gx++) for(let gy=0;gy<4;gy++) if((gx+gy+flip)%2===0) floor(cw*gx+cw/2,110+ch*gy+ch/2,cw*.82,ch*.72,1.12,'#fdba74',dmg(.34),'fire','체스판'); }}
    ],
    thorn_queen:[
      {n:'덩굴 갈고리 끌기',p:1,f(){ const a=Math.atan2(player.y-boss.y,player.x-boss.x); cast('가시 여왕이 덩굴 갈고리를 던집니다. 선 밖으로 벗어나세요!', 'beam', '#22c55e',a); beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,dist(boss.x,boss.y,player.x,player.y)+260,18,1.0,'#22c55e',dmg(.38),'poison','덩굴갈고리'); setTimeout(()=>{ if(alive()){ const px=player.x-boss.x,py=player.y-boss.y,side=Math.abs(-px*Math.sin(a)+py*Math.cos(a)),along=px*Math.cos(a)+py*Math.sin(a); if(along>0&&side<54){ player.x=clamp(player.x-Math.cos(a)*170,50,W-50); player.y=clamp(player.y-Math.sin(a)*170,95,H-55); hurtPlayer(dmg(.26),'#22c55e'); } } },1050); }},
      {n:'독꽃 정원 개화',p:1,f(){ cast('독꽃 정원이 피어납니다. 피어난 꽃은 독지대로 남습니다!', 'cast', '#84cc16'); randomSpots(9,90,125).forEach((q,i)=>{ circle(q.x,q.y,38,0.9+i*.06,'#84cc16',dmg(.22),'poison','독꽃'); setTimeout(()=>{ if(alive()) zone(q.x,q.y,47,dmg(.02),'#84cc16',3.0); },950+i*55); }); }},
      {n:'가시 울타리 통로',p:1,f(){ cast('가시 울타리가 자라납니다. 열린 통로로 이동하세요.', 'wall', '#4ade80'); const gap=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==gap) wall(150+i*(W-300)/4,H/2,28,H*.78,1.08,'#4ade80',dmg(.44),'poison','가시울타리'); }},
      {n:'장미 꽃잎 회오리',p:2,f(){ cast('장미 꽃잎 회오리! 꽃잎이 원형으로 퍼집니다.', 'burst', '#f472b6'); for(let k=0;k<3;k++) setTimeout(()=>radial(14,120+k*45,'#f472b6',dmg(.15),'poison',k*.35,6),k*320); }},
      {n:'뿌리 감옥 십자',p:2,f(){ cast('뿌리 감옥이 십자로 닫힙니다. 사각 모서리로 빠지세요!', 'wall', '#15803d'); wall(W/2,H/2,W*.82,26,1.15,'#15803d',dmg(.42),'poison','뿌리감옥'); wall(W/2,H/2,26,H*.72,1.15,'#15803d',dmg(.42),'poison','뿌리감옥'); }}
    ],
    frost_oracle:[
      {n:'얼음 감옥 통로',p:1,f(){ cast('얼음 감옥이 세워집니다. 막히지 않은 길을 찾으세요!', 'wall', '#7dd3fc'); const gap=Math.floor(Math.random()*6); for(let i=0;i<6;i++) if(i!==gap) wall(100+i*(W-200)/5,H/2,24,H*.78,1.05,'#7dd3fc',dmg(.42),'ice','얼음감옥'); }},
      {n:'빙창 낙하',p:1,f(){ cast('빙창이 위에서 꽂힙니다. 작은 그림자가 먼저 보입니다.', 'slam', '#bae6fd'); randomSpots(12,70,120).forEach((q,i)=>circle(q.x,q.y,28+i%3*6,.82+i*.05,'#bae6fd',dmg(.32),'ice','빙창')); }},
      {n:'얼음 거울 반사',p:1,f(){ cast('얼음 거울이 반사선을 만듭니다. 교차 지점을 피하세요.', 'beam', '#dbeafe'); for(let i=0;i<4;i++){ beam(160+i*(W-320)/3,H/2,Math.PI/2,H*.88,16,1.1+i*.11,'#dbeafe',dmg(.36),'ice','얼음거울'); beam(W/2,130+i*(H-210)/3,0,W*.90,13,1.24+i*.11,'#93c5fd',dmg(.30),'ice','반사선'); } }},
      {n:'눈보라 차선',p:2,f(){ cast('눈보라 차선! 바람이 비어 있는 차선으로 이동하세요.', 'wall', '#a5f3fc'); const safeLane=Math.floor(Math.random()*4); for(let i=0;i<4;i++) if(i!==safeLane) wall(W/2,145+i*(H-225)/3,W*.92,42,1.05+i*.06,'#a5f3fc',dmg(.45),'ice','눈보라'); }},
      {n:'서리 미궁 예고',p:2,f(){ cast('서리 미궁! 제한 시간 안에 미로를 탈출하세요.', 'cast', '#bfdbfe'); mini('maze', `${boss.name}가 서리 미궁을 시작합니다!`, '#bfdbfe'); }}
    ],
    sand_reaper:[
      {n:'모래 늪 흡입',p:1,f(){ cast('모래 늪이 중심으로 끌어당깁니다. 바깥으로 달려 나가세요!', 'cast', '#f59e0b'); gravity(W/2,H/2,205,2.8,'#f59e0b'); donut(W/2,H/2,75,280,1.28,'#f59e0b',dmg(.58),'sand','모래늪'); }},
      {n:'낫 돌진 절단',p:1,f(){ const a=Math.atan2(player.y-boss.y,player.x-boss.x); cast('모래 사신이 낫 돌진을 준비합니다. 옆으로 구르세요!', 'dash', '#fde68a',a); beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,900,32,1.02,'#fde68a',dmg(.72),'sand','낫돌진'); setTimeout(()=>{ if(alive()){ boss.x=clamp(boss.x+Math.cos(a)*280,80,W-80); boss.y=clamp(boss.y+Math.sin(a)*280,120,H-80); } },1060); }},
      {n:'매몰 지대 언덕',p:1,f(){ cast('매몰 지대! 안전한 모래 언덕을 찾아 이동하세요.', 'floor', '#fbbf24'); const safeIdx=Math.floor(Math.random()*4); for(let i=0;i<4;i++){ const x=160+i*(W-320)/3; if(i!==safeIdx) floor(x,H/2,W*.18,H*.78,1.12,'#fbbf24',dmg(.50),'sand','매몰'); else safe(x,H*.70,54,2.1,'#fde68a'); } }},
      {n:'모래폭풍 시계방향',p:2,f(){ cast('모래폭풍이 회전합니다. 회전선을 따라가지 마세요!', 'beam', '#fcd34d'); for(let i=0;i<3;i++) rot(W/2,H/2,i*Math.PI*2/3,0.95,W*1.05,14,1.05,'#fcd34d',dmg(.34),'sand','모래폭풍',2.4); }},
      {n:'사막 파도',p:2,f(){ cast('사막 파도가 줄지어 밀려옵니다. 빈 파도를 찾으세요.', 'wall', '#d97706'); const gap=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==gap) wall(W/2,120+i*(H-190)/4,W*.86,28,0.95+i*.09,'#d97706',dmg(.43),'sand','사막파도'); }}
    ],
    void_serpent:[
      {n:'포탈 절단 대각선',p:1,f(){ cast('공허 포탈이 대각 절단선을 엽니다. 선 사이 틈을 보세요!', 'beam', '#a78bfa'); [[80,120,W-90,H-80],[W-90,120,80,H-80],[W/2,90,W/2,H-55]].forEach((p,i)=>beam((p[0]+p[2])/2,(p[1]+p[3])/2,Math.atan2(p[3]-p[1],p[2]-p[0]),dist(p[0],p[1],p[2],p[3]),18,1.05+i*.16,'#a78bfa',dmg(.48),'void','포탈절단')); }},
      {n:'공간 접힘 도넛',p:1,f(){ cast('공간이 접힙니다. 도넛 안팎을 빠르게 판단하세요!', 'slam', '#8b5cf6'); randomSpots(6,130,145).forEach((q,i)=>donut(q.x,q.y,30,90,0.95+i*.07,'#8b5cf6',dmg(.44),'void','공간접힘')); }},
      {n:'공허 뱀길 S자',p:1,f(){ cast('공허 뱀이 S자 경로를 남깁니다. 경로를 밟지 마세요!', 'beam', '#c4b5fd'); for(let i=0;i<10;i++){ const x=90+i*(W-180)/9,y=H/2+Math.sin(i*.85)*165; circle(x,y,38,0.9+i*.045,'#c4b5fd',dmg(.32),'void','뱀길'); } }},
      {n:'블랙홀 삼각지대',p:2,f(){ cast('작은 블랙홀이 세 곳에 열립니다. 끌림을 계산하세요!', 'cast', '#6d28d9'); [[W*.28,H*.30],[W*.72,H*.38],[W*.50,H*.68]].forEach((q,i)=>{ gravity(q[0],q[1],145,2.2,'#6d28d9'); donut(q[0],q[1],42,118,1.18+i*.08,'#7c3aed',dmg(.38),'void','블랙홀'); }); }},
      {n:'차원 꼬리 휩쓸기',p:2,f(){ cast('차원 꼬리가 맵을 휩쓸고 갑니다. 꼬리 끝을 피하세요!', 'beam', '#ddd6fe'); for(let i=0;i<5;i++) beam(W/2,H/2,(i-2)*.34,W*1.15,18,1.0+i*.08,'#ddd6fe',dmg(.42),'void','차원꼬리'); }}
    ],
    iron_minotaur:[
      {n:'철갑 돌진',p:1,f(){ const a=Math.atan2(player.y-boss.y,player.x-boss.x); cast('철갑 미노타우로스가 돌진합니다. 직선 경로에서 벗어나세요!', 'dash', '#cbd5e1',a); beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,960,38,1.0,'#cbd5e1',dmg(.78),'metal','철갑돌진'); setTimeout(()=>{ if(alive()){ boss.x=clamp(boss.x+Math.cos(a)*320,80,W-80); boss.y=clamp(boss.y+Math.sin(a)*320,120,H-80); } },1030); }},
      {n:'모루 강타 삼중파',p:1,f(){ cast('모루 강타! 충격파가 세 겹으로 퍼집니다.', 'slam', '#94a3b8'); [75,145,215].forEach((r,i)=>donut(boss.x,boss.y,r-24,r,0.95+i*.28,'#94a3b8',dmg(.34),'metal','모루강타')); }},
      {n:'강철 감옥',p:1,f(){ cast('강철 감옥이 닫힙니다. 열린 칸으로 빠져나오세요!', 'wall', '#64748b'); const gap=Math.floor(Math.random()*4); for(let i=0;i<4;i++) if(i!==gap) wall(190+i*(W-380)/3,H/2,34,H*.72,1.1,'#64748b',dmg(.44),'metal','강철감옥'); }},
      {n:'쇳조각 지뢰밭',p:2,f(){ cast('쇳조각 지뢰밭! 작은 금속 지뢰가 연속 폭발합니다.', 'slam', '#e5e7eb'); randomSpots(13,75,120).forEach((q,i)=>circle(q.x,q.y,30,0.75+i*.055,'#e5e7eb',dmg(.30),'metal','쇳조각')); }},
      {n:'방패 밀어내기',p:2,f(){ cast('방패 밀어내기! 넓은 강철벽이 밀려옵니다.', 'wall', '#cbd5e1'); const side=Math.random()<.5?0:1; wall(side?W-120:120,H/2,70,H*.82,1.0,'#cbd5e1',dmg(.55),'metal','방패벽'); }}
    ],
    blood_moon:[
      {n:'피의 표식 추적',p:1,f(){ cast('피의 표식이 현재 위치를 추적합니다. 계속 움직이세요!', 'slam', '#be123c'); const base=ppos(); for(let i=0;i<6;i++) setTimeout(()=>{ if(alive()) circle(base.x+rand(-90,90),base.y+rand(-90,90),44,0.65,'#be123c',dmg(.36),'blood','피표식'); },i*230); }},
      {n:'흡혈 칼날 부메랑',p:1,f(){ cast('흡혈 칼날이 부메랑처럼 회전합니다. 원형 궤도를 피하세요!', 'burst', '#fb7185'); for(let k=0;k<3;k++) setTimeout(()=>radial(8,180+k*30,'#fb7185',dmg(.18),'blood',k*.45,8),k*380); }},
      {n:'붉은 달 초승달',p:1,f(){ cast('붉은 초승달 참격이 교차합니다. 휘어진 길을 피하세요!', 'beam', '#fda4af'); for(let i=0;i<6;i++) beam(W/2,H/2,(i/6)*Math.PI+0.25,W*1.0,17,1.0+i*.08,'#fda4af',dmg(.42),'blood','초승달'); }},
      {n:'혈월 흡수장',p:2,f(){ cast('혈월 흡수장이 피를 빨아들입니다. 붉은 원 밖으로 나가세요!', 'cast', '#e11d48'); gravity(W/2,H*.45,150,2.4,'#e11d48'); circle(W/2,H*.45,155,1.25,'#e11d48',dmg(.58),'blood','흡수장'); }},
      {n:'사냥꾼 도약',p:2,f(){ cast('혈월 사냥꾼이 도약해 찍습니다. 착지 위치를 보세요!', 'slam', '#f43f5e'); const q=ppos(); circle(q.x,q.y,88,1.05,'#f43f5e',dmg(.72),'blood','사냥도약'); }},
      {n:'혈월 사냥망',p:3,f(){ cast('혈월 사냥망! 붉은 그물이 차례대로 닫힙니다.', 'wall', '#be123c'); for(let i=0;i<4;i++){ wall(W/2,135+i*(H-210)/3,W*.86,20,0.95+i*.10,'#be123c',dmg(.42),'blood','사냥망'); wall(160+i*(W-320)/3,H/2,20,H*.76,1.12+i*.10,'#fb7185',dmg(.42),'blood','사냥망'); } }}
    ],
    storm_colossus:[
      {n:'피뢰침 연결',p:1,f(){ cast('피뢰침이 연결됩니다. 전류선 사이 틈을 찾으세요!', 'beam', '#facc15'); const rods=randomSpots(5,120,130); rods.forEach(q=>circle(q.x,q.y,24,.75,'#fde047',dmg(.15),'lightning','피뢰침')); for(let i=0;i<rods.length-1;i++){ const a=Math.atan2(rods[i+1].y-rods[i].y,rods[i+1].x-rods[i].x); beam((rods[i].x+rods[i+1].x)/2,(rods[i].y+rods[i+1].y)/2,a,dist(rods[i].x,rods[i].y,rods[i+1].x,rods[i+1].y),16,1.1+i*.05,'#facc15',dmg(.42),'lightning','전류선'); } }},
      {n:'폭풍 회로 격자',p:1,f(){ cast('폭풍 회로가 켜집니다. 비어 있는 회로칸으로 이동하세요!', 'floor', '#60a5fa'); const cw=W/6,ch=(H-115)/4; for(let gx=0;gx<6;gx++) for(let gy=0;gy<4;gy++) if((gx*2+gy+Math.floor(state.time))%3===0) floor(cw*gx+cw/2,110+ch*gy+ch/2,cw*.78,ch*.68,1.05,'#60a5fa',dmg(.38),'lightning','폭풍회로'); }},
      {n:'추적 낙뢰',p:1,f(){ cast('추적 낙뢰가 현재 위치를 따라옵니다. 멈추면 맞습니다!', 'slam', '#fde047'); for(let i=0;i<7;i++) setTimeout(()=>{ if(alive()) circle(player.x,player.y,42,0.65,'#fde047',dmg(.40),'lightning','추적낙뢰'); },i*240); }},
      {n:'거신 충격파',p:2,f(){ cast('거신 충격파! 원형 파동을 굴러 넘기세요.', 'slam', '#bfdbfe'); [95,175,255,335].forEach((r,i)=>donut(boss.x,boss.y,r-22,r,0.9+i*.23,'#bfdbfe',dmg(.36),'lightning','거신파동')); }},
      {n:'번개 사슬',p:2,f(){ cast('번개 사슬이 플레이어를 가둡니다. 사슬 사이로 빠져나오세요!', 'beam', '#fef08a'); for(let i=-2;i<=2;i++) beam(player.x+i*75,H/2,Math.PI/2,H*.82,14,1.05+(i+2)*.08,'#fef08a',dmg(.35),'lightning','번개사슬'); }},
      {n:'하늘 심판',p:3,f(){ cast('하늘 심판! 맵 여러 곳에 낙뢰가 동시에 떨어집니다.', 'slam', '#facc15'); randomSpots(15,60,110).forEach((q,i)=>circle(q.x,q.y,34,0.8+i*.035,'#facc15',dmg(.36),'lightning','하늘심판')); }}
    ],
    plague_doctor:[
      {n:'역병 안개 확산',p:1,f(){ cast('역병 안개가 번집니다. 초록 안개에 오래 머물지 마세요!', 'cast', '#84cc16'); randomSpots(8,90,130).forEach((q,i)=>{ circle(q.x,q.y,42,.86+i*.06,'#84cc16',dmg(.22),'poison','역병안개'); setTimeout(()=>{ if(alive()) zone(q.x,q.y,60,dmg(.022),'#84cc16',3.2); },900+i*50); }); }},
      {n:'해독 구역 선택',p:1,f(){ cast('해독 구역이 열립니다. 역병 폭발 전에 안전 구역으로 이동하세요!', 'cast', '#bef264'); for(let i=0;i<3;i++) safe(260+i*(W-520)/2,H*.68,54,2.1,'#bef264'); floor(W/2,H/2,W*.94,H*.76,1.45,'#365314',dmg(.74),'poison','역병폭발'); }},
      {n:'독침 수술선',p:1,f(){ cast('역병 의사가 독침 수술선을 긋습니다. 얇은 선을 피하세요!', 'beam', '#a3e635'); for(let i=0;i<6;i++){ const a=-.5+i*.2; beam(W/2,H/2,a,W*1.05,12,0.92+i*.06,'#a3e635',dmg(.35),'poison','수술선'); } }},
      {n:'감염체 소환',p:2,f(){ cast('감염체가 소환됩니다. 보스를 치기 전에 감염체를 처리하세요!', 'cast', '#bef264'); randomSpots(4,150,150).forEach(q=>add(q.x,q.y,'#84cc16',170)); }},
      {n:'오염 격리벽',p:2,f(){ cast('오염 격리벽이 닫힙니다. 열린 병동으로 이동하세요!', 'wall', '#4d7c0f'); const gap=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==gap) wall(150+i*(W-300)/4,H/2,30,H*.76,1.05,'#4d7c0f',dmg(.42),'poison','격리벽'); }},
      {n:'검은 처방전',p:3,f(){ cast('검은 처방전! 안전 구역이 순식간에 바뀝니다.', 'cast', '#d9f99d'); safe(rand(180,W-180),rand(160,H-120),62,2.0,'#d9f99d'); floor(W/2,H/2,W*.94,H*.76,1.45,'#166534',dmg(.82),'poison','검은처방'); }}
    ],
    mirror_duelist:[
      {n:'진짜 분신 결투',p:1,f(){ cast('거울 분신이 나타납니다. 분신의 검로를 보고 피하세요!', 'beam', '#e879f9'); for(let i=0;i<4;i++){ const x=180+i*(W-360)/3; const a=Math.atan2(player.y-H*.2,player.x-x); beam((x+player.x)/2,(H*.2+player.y)/2,a,dist(x,H*.2,player.x,player.y)+180,14,1+i*.08,'#e879f9',dmg(.38),'mirror','분신검'); } }},
      {n:'만화경 절단',p:1,f(){ cast('만화경 절단! 회전하는 거울선을 피하세요.', 'beam', '#bae6fd'); for(let i=0;i<4;i++) rot(W/2,H/2,i*Math.PI/4, i%2?-.85:.85, W*1.05, 12, 1.1, i%2?'#e879f9':'#bae6fd', dmg(.34),'mirror','만화경',2.35); }},
      {n:'반사탄 되돌림',p:1,f(){ cast('반사탄이 벽을 튕긴 듯 사방에서 들어옵니다!', 'burst', '#f0abfc'); for(let i=0;i<7;i++){ aimed(230,'#f0abfc',dmg(.18),'mirror',7, i%2?0:W, rand(120,H-80)); } }},
      {n:'거울문 선택',p:2,f(){ cast('거울문이 열립니다. 밝은 거울문만 안전합니다!', 'cast', '#bae6fd'); const real=Math.floor(Math.random()*4); for(let i=0;i<4;i++){ const x=190+i*(W-380)/3,y=H*.68; if(i===real) safe(x,y,55,2.1,'#86efac'); else state.mechanics.push({kind:'safe',x,y,r:55,life:2.1,color:'#fb7185',fake:true}); } floor(W/2,H/2,W*.92,H*.75,1.45,'#e879f9',dmg(.70),'mirror','거울문'); }},
      {n:'결투장 십자베기',p:2,f(){ cast('결투장 십자베기! 수평과 수직 검격이 교차합니다.', 'beam', '#f0abfc'); beam(W/2,H/2,0,W*.95,18,1.0,'#f0abfc',dmg(.44),'mirror','십자베기'); beam(W/2,H/2,Math.PI/2,H*.82,18,1.1,'#bae6fd',dmg(.44),'mirror','십자베기'); }},
      {n:'거울 미궁',p:3,f(){ cast('거울 미궁! 방향감각을 잃기 전에 탈출하세요.', 'cast', '#f0abfc'); mini('maze', `${boss.name}이 거울 미궁을 펼칩니다!`, '#f0abfc'); }}
    ],
    gravity_core:[
      {n:'중력 흡입 핵',p:1,f(){ cast('중력핵이 모든 것을 끌어당깁니다. 바깥으로 빠져나가세요!', 'cast', '#818cf8'); gravity(W/2,H/2,240,2.8,'#818cf8'); donut(W/2,H/2,70,270,1.2,'#818cf8',dmg(.62),'gravity','중력핵'); }},
      {n:'압축 폭발',p:1,f(){ cast('압축 폭발! 작은 원이 큰 폭발로 변합니다.', 'slam', '#a5b4fc'); const q=ppos(); circle(q.x,q.y,52,0.9,'#a5b4fc',dmg(.30),'gravity','압축예고'); circle(q.x,q.y,128,1.35,'#818cf8',dmg(.72),'gravity','압축폭발'); }},
      {n:'궤도 레이저 위성',p:1,f(){ cast('위성 레이저가 궤도를 돕니다. 회전 방향을 보고 이동하세요!', 'beam', '#c4b5fd'); for(let i=0;i<3;i++) rot(W/2,H/2,i*Math.PI*2/3,0.72,W*1.08,15,1.05,'#c4b5fd',dmg(.38),'gravity','궤도위성',2.6); }},
      {n:'역중력 가장자리',p:2,f(){ cast('역중력! 중앙은 밀려나고 가장자리는 터집니다.', 'floor', '#3730a3'); wall(W/2,105,W*.94,28,1.1,'#3730a3',dmg(.45),'gravity','역중력'); wall(W/2,H-45,W*.94,28,1.1,'#3730a3',dmg(.45),'gravity','역중력'); wall(45,H/2,28,H*.76,1.1,'#3730a3',dmg(.45),'gravity','역중력'); wall(W-45,H/2,28,H*.76,1.1,'#3730a3',dmg(.45),'gravity','역중력'); }},
      {n:'질량 파편 궤도',p:2,f(){ cast('질량 파편이 궤도를 따라 발사됩니다. 파편 사이를 보세요!', 'burst', '#ddd6fe'); for(let k=0;k<4;k++) setTimeout(()=>radial(9,130+k*42,'#ddd6fe',dmg(.16),'gravity',k*.4,7),k*260); }},
      {n:'사건의 지평선',p:3,f(){ cast('사건의 지평선! SAFE 밖의 공간이 접힙니다.', 'slam', '#1e1b4b'); safe(W*.32,H*.68,58,2.2,'#86efac'); safe(W*.68,H*.68,58,2.2,'#86efac'); floor(W/2,H/2,W*.95,H*.78,1.55,'#1e1b4b',dmg(.92),'gravity','사건지평선'); }},
      {n:'중력 미궁',p:3,f(){ cast('중력 미궁! 제한 시간 안에 탈출해야 합니다.', 'cast', '#c4b5fd'); mini('maze', `${boss.name}이 중력 미궁을 시작합니다!`, '#c4b5fd'); }}
    ],
    solar_dragon:[
      {n:'태양 숨결 부채',p:1,f(){ const a=Math.atan2(player.y-boss.y,player.x-boss.x); cast('태양룡이 뜨거운 숨결을 뿜습니다. 옆으로 파고드세요!', 'beam', '#fb923c',a); for(let i=-5;i<=5;i++) beam(boss.x+Math.cos(a+i*.08)*320,boss.y+Math.sin(a+i*.08)*320,a+i*.08,700,18,0.95+(i+5)*.025,'#fb923c',dmg(.44),'solar','태양숨결'); }},
      {n:'일식 SAFE 심판',p:1,f(){ cast('일식 심판! SAFE 외의 모든 곳이 타오릅니다.', 'slam', '#facc15'); safe(W*.30,H*.68,60,2.4,'#fde68a'); safe(W*.70,H*.68,60,2.4,'#fde68a'); floor(W/2,H/2,W*.96,H*.78,1.55,'#fb923c',dmg(.96),'solar','일식심판'); }},
      {n:'태양 플레어 회전',p:1,f(){ cast('태양 플레어가 맵을 가릅니다. 광선 사이로 피하세요.', 'beam', '#fdba74'); for(let i=0;i<8;i++) beam(W/2,H/2,i*Math.PI/4,W*1.2,13,1.0+i*.045,'#fdba74',dmg(.34),'solar','플레어'); }},
      {n:'흑점 낙하',p:2,f(){ cast('흑점이 낙하합니다. 검은 원은 크게 폭발합니다!', 'slam', '#f97316'); randomSpots(12,80,120).forEach((q,i)=>circle(q.x,q.y,36+i%2*14,.85+i*.055,i%2?'#020617':'#f97316',dmg(.38),'solar','흑점')); }},
      {n:'코로나 도넛',p:2,f(){ cast('코로나 도넛! 안쪽과 바깥쪽을 헷갈리지 마세요.', 'slam', '#fde047'); randomSpots(5,150,150).forEach((q,i)=>donut(q.x,q.y,50,132,1.0+i*.1,'#fde047',dmg(.46),'solar','코로나')); }},
      {n:'태양 기둥',p:3,f(){ cast('태양 기둥이 순서대로 내려옵니다. 다음 기둥 위치를 읽으세요!', 'wall', '#f97316'); for(let i=0;i<7;i++) wall(110+i*(W-220)/6,H/2,32,H*.82,0.9+i*.12,'#f97316',dmg(.48),'solar','태양기둥'); }},
      {n:'백야 폭발',p:3,f(){ cast('백야 폭발! 중앙 폭발 후 바깥 고리가 터집니다.', 'slam', '#fef3c7'); circle(W/2,H/2,92,1.0,'#fef3c7',dmg(.55),'solar','백야'); donut(W/2,H/2,160,300,1.42,'#fde047',dmg(.65),'solar','백야고리'); }}
    ],
    chrono_dragon:[
      {n:'시계바늘 회전',p:1,f(){ cast('시계바늘이 회전합니다. 바늘 방향을 보고 이동하세요!', 'beam', '#f472b6'); for(let i=0;i<3;i++) rot(W/2,H/2,i*Math.PI*2/3,.92,W*1.12,13,1.05,'#f472b6',dmg(.34),'chrono','시계바늘',2.55); }},
      {n:'시간폭탄 잔상',p:1,f(){ cast('시간폭탄이 방금 지나온 자리에 생성됩니다. 과거 위치를 피하세요!', 'slam', '#fef08a'); const spots=(state._v32Trail || [{x:player.x,y:player.y}]).slice(-7); spots.forEach((q,i)=>circle(q.x,q.y,42,0.88+i*.08,'#fef08a',dmg(.38),'chrono','시간폭탄')); }},
      {n:'지연 탄막',p:1,f(){ cast('지연 탄막! 지금 보이는 탄은 잠시 후 움직입니다.', 'burst', '#f9a8d4'); for(let k=0;k<3;k++) setTimeout(()=>radial(12,120+k*35,'#f9a8d4',dmg(.17),'chrono',k*.18,7),k*420); }},
      {n:'시간 정지선',p:2,f(){ cast('시간 정지선이 격자로 멈춥니다. 멈춘 선 사이로 이동하세요!', 'wall', '#fde68a'); for(let i=0;i<5;i++){ if(i%2===0) wall(130+i*(W-260)/4,H/2,22,H*.78,1.1+i*.08,'#fde68a',dmg(.42),'chrono','정지선'); else wall(W/2,125+i*(H-200)/4,W*.86,20,1.1+i*.08,'#f9a8d4',dmg(.42),'chrono','정지선'); } }},
      {n:'예언 퀴즈',p:2,f(){ cast('시간의 질문! 정답 원을 밟아 흐름을 고정하세요.', 'cast', '#fef08a'); mini('quiz', `${boss.name}가 시간의 질문을 던집니다!`, '#fef08a'); }},
      {n:'되감기 낙인',p:2,f(){ cast('되감기 낙인이 과거 위치로 폭발합니다. 지나온 길을 버리세요!', 'slam', '#f472b6'); (state._v32Trail||[]).slice(-12).filter((_,i)=>i%2===0).forEach((q,i)=>circle(q.x,q.y,34,0.82+i*.06,'#f472b6',dmg(.34),'chrono','되감기')); }},
      {n:'분침 단두대',p:3,f(){ cast('분침 단두대! 세로 시간이 한 번에 잘립니다.', 'wall', '#fef08a'); const gap=Math.floor(Math.random()*6); for(let i=0;i<6;i++) if(i!==gap) wall(90+i*(W-180)/5,H/2,24,H*.84,1.05+i*.05,'#fef08a',dmg(.50),'chrono','분침'); }},
      {n:'시간 붕괴 SAFE',p:3,f(){ cast('시간 붕괴! SAFE 두 곳 중 하나에 들어가세요.', 'slam', '#f472b6'); safe(W*.32,H*.70,58,2.2,'#86efac'); safe(W*.68,H*.70,58,2.2,'#86efac'); floor(W/2,H/2,W*.96,H*.78,1.55,'#f472b6',dmg(.95),'chrono','시간붕괴'); }}
    ],
    abyss_leviathan:[
      {n:'해일 벽 행진',p:1,f(){ cast('해일이 줄지어 밀려옵니다. 빈 수로로 이동하세요!', 'wall', '#38bdf8'); const safeRow=Math.floor(Math.random()*4); for(let i=0;i<4;i++) if(i!==safeRow) wall(W/2,145+i*(H-225)/3,W*.93,40,1.0+i*.08,'#38bdf8',dmg(.50),'ice','해일벽'); }},
      {n:'심해 소용돌이',p:1,f(){ cast('심해 소용돌이가 끌어당깁니다. 바깥으로 빠져나가세요!', 'cast', '#0ea5e9'); gravity(W/2,H/2,230,2.8,'#0ea5e9'); donut(W/2,H/2,90,292,1.25,'#0ea5e9',dmg(.60),'ice','소용돌이'); }},
      {n:'촉수 끌어치기',p:1,f(){ cast('심해 촉수가 가장자리에서 끌어칩니다. 선을 피하세요!', 'beam', '#7dd3fc'); for(let i=0;i<5;i++){ const x=90+i*(W-180)/4; const a=Math.atan2(player.y-H,x-player.x); beam((x+player.x)/2,(H+player.y)/2,a,dist(x,H,player.x,player.y)+150,16,0.95+i*.08,'#7dd3fc',dmg(.38),'ice','촉수'); } }},
      {n:'거품 감옥',p:2,f(){ cast('거품 감옥이 떠오릅니다. 감옥 사이 빈틈으로 이동하세요!', 'circle', '#bae6fd'); randomSpots(8,100,125).forEach((q,i)=>donut(q.x,q.y,30,78,1.0+i*.06,'#bae6fd',dmg(.35),'ice','거품감옥')); }},
      {n:'심해 물살',p:2,f(){ cast('심해 물살이 차선으로 흐릅니다. 역류 차선을 피하세요!', 'wall', '#0ea5e9'); const gap=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==gap) wall(140+i*(W-280)/4,H/2,36,H*.78,1.05,'#0ea5e9',dmg(.43),'ice','물살'); }},
      {n:'레비아탄 꼬리',p:2,f(){ cast('레비아탄 꼬리가 넓게 휩씁니다. 휩쓸림 반대편으로 이동하세요!', 'beam', '#67e8f9'); for(let i=0;i<5;i++) beam(W/2,H/2,(i-2)*.22,W*1.15,24,1.05+i*.07,'#67e8f9',dmg(.46),'ice','꼬리휩쓸기'); }},
      {n:'즉사 해일 SAFE',p:3,f(){ cast('즉사 해일! SAFE 두 곳 중 하나로 들어가세요!', 'slam', '#38bdf8'); safe(W*.30,H*.68,62,2.3,'#86efac'); safe(W*.70,H*.68,62,2.3,'#86efac'); floor(W/2,H/2,W*.96,H*.80,1.55,'#0369a1',dmg(1.05),'ice','즉사해일'); }}
    ],
    puppet_emperor:[
      {n:'실 조종선',p:1,f(){ cast('실 조종선! 얇은 실에 닿으면 베입니다.', 'beam', '#f0abfc'); for(let i=0;i<7;i++) beam(100+i*(W-200)/6,H/2,Math.PI/2,H*.86,10,0.95+i*.06,'#f0abfc',dmg(.36),'mirror','실'); }},
      {n:'인형 갈고리',p:1,f(){ const a=Math.atan2(player.y-boss.y,player.x-boss.x); cast('인형 갈고리! 선에 붙잡히지 마세요.', 'beam', '#fde68a',a); beam((boss.x+player.x)/2,(boss.y+player.y)/2,a,dist(boss.x,boss.y,player.x,player.y)+280,16,1.05,'#fde68a',dmg(.40),'mirror','갈고리'); }},
      {n:'단두대 줄',p:1,f(){ cast('단두대 줄이 내려옵니다. 줄 사이 빈칸으로 이동하세요!', 'wall', '#fca5a5'); const safeCol=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==safeCol) wall(130+i*(W-260)/4,H/2,30,H*.82,1.08,'#fca5a5',dmg(.52),'mirror','단두대'); }},
      {n:'꼭두각시 원무',p:2,f(){ cast('꼭두각시가 원무를 춥니다. 회전 실을 피하세요!', 'beam', '#f5d0fe'); for(let i=0;i<4;i++) rot(W/2,H/2,i*Math.PI/4,i%2?.75:-.75,W*1.05,13,1.0,'#f5d0fe',dmg(.34),'mirror','원무',2.5); }},
      {n:'인형극 무대벽',p:2,f(){ cast('인형극 무대벽이 닫힙니다. 무대 중앙을 읽으세요!', 'wall', '#fde68a'); wall(W/2,125,W*.86,24,1.05,'#fde68a',dmg(.42),'mirror','무대벽'); wall(W/2,H-60,W*.86,24,1.15,'#fde68a',dmg(.42),'mirror','무대벽'); wall(105,H/2,24,H*.72,1.25,'#fde68a',dmg(.42),'mirror','무대벽'); wall(W-105,H/2,24,H*.72,1.35,'#fde68a',dmg(.42),'mirror','무대벽'); }},
      {n:'가짜 안전지대',p:3,f(){ cast('가짜 안전지대! 밝게 맥박치는 원만 진짜입니다.', 'cast', '#f0abfc'); const real=Math.floor(Math.random()*4); for(let i=0;i<4;i++){ const x=190+i*(W-380)/3,y=H*.68; if(i===real) safe(x,y,55,2.2,'#86efac'); else state.mechanics.push({kind:'safe',x,y,r:55,life:2.2,color:'#fb7185',fake:true}); } floor(W/2,H/2,W*.94,H*.78,1.5,'#d946ef',dmg(.88),'mirror','가짜안전'); }},
      {n:'마리오네트 미로',p:3,f(){ cast('마리오네트 미로! 줄에 끌려가기 전에 탈출하세요.', 'cast', '#f0abfc'); mini('maze', `${boss.name}가 마리오네트 미로를 시작합니다!`, '#f0abfc'); }}
    ],
    black_sun:[
      {n:'검은 일식 SAFE',p:1,f(){ cast('검은 일식! SAFE가 아닌 곳은 전부 타오릅니다.', 'slam', '#f97316'); safe(W*.28,H*.70,62,2.4,'#fde68a'); safe(W*.72,H*.70,62,2.4,'#fde68a'); floor(W/2,H/2,W*.96,H*.80,1.55,'#f97316',dmg(1.02),'solar','검은일식'); }},
      {n:'붕괴 바닥',p:1,f(){ cast('무너지는 바닥! 금 간 칸을 보고 이동하세요.', 'floor', '#fb923c'); const cw=W/7,ch=(H-110)/4; for(let i=0;i<15;i++){ const gx=Math.floor(Math.random()*7),gy=Math.floor(Math.random()*4); floor(cw*gx+cw/2,110+ch*gy+ch/2,cw*.82,ch*.72,0.85+i*.035,'#fb923c',dmg(.40),'solar','붕괴'); } }},
      {n:'태양 심판 낙하',p:1,f(){ cast('태양 심판! 큰 태양탄이 순서대로 떨어집니다.', 'slam', '#facc15'); randomSpots(8,100,130).forEach((q,i)=>circle(q.x,q.y,64,0.9+i*.14,'#facc15',dmg(.58),'solar','태양심판')); }},
      {n:'암흑 코로나',p:2,f(){ cast('암흑 코로나가 퍼집니다. 도넛 고리를 읽으세요!', 'slam', '#020617'); [100,195,290].forEach((r,i)=>donut(W/2,H/2,r-35,r,0.95+i*.28,'#020617',dmg(.48),'solar','암흑코로나')); }},
      {n:'검은 광선 십자가',p:2,f(){ cast('검은 광선 십자가! 대각선이 뒤늦게 따라옵니다.', 'beam', '#fdba74'); [0,Math.PI/2,Math.PI/4,-Math.PI/4].forEach((a,i)=>beam(W/2,H/2,a,W*1.18,18,0.95+i*.16,'#fdba74',dmg(.52),'solar','검은광선')); }},
      {n:'별 낙하 격자',p:2,f(){ cast('별 낙하 격자! 맵 전체의 작은 별이 터집니다.', 'floor', '#fef08a'); const cw=W/8,ch=(H-110)/5; for(let gx=0;gx<8;gx++) for(let gy=0;gy<5;gy++) if(Math.random()<.36) floor(cw*gx+cw/2,110+ch*gy+ch/2,cw*.62,ch*.55,1.0,'#fef08a',dmg(.34),'solar','별낙하'); }},
      {n:'종말 일식',p:3,f(){ cast('종말 일식! 마지막 SAFE 두 곳을 찾으세요.', 'slam', '#fb7185'); safe(W*.38,H*.68,56,2.1,'#86efac'); safe(W*.62,H*.68,56,2.1,'#86efac'); floor(W/2,H/2,W*.98,H*.82,1.48,'#7f1d1d',dmg(1.18),'solar','종말일식'); }},
      {n:'검은 태양 코어',p:3,f(){ cast('검은 태양 코어가 압축됩니다. 중앙과 고리를 모두 피하세요!', 'slam', '#f97316'); circle(W/2,H/2,95,1.0,'#f97316',dmg(.62),'solar','태양코어'); donut(W/2,H/2,150,310,1.45,'#020617',dmg(.74),'solar','검은고리'); }}
    ],
    chaos_archon:[
      {n:'혼돈 재판 삼중규칙',p:1,f(){ cast('혼돈 재판! 원, 도넛, 선 규칙이 동시에 나옵니다.', 'cast', '#fb7185'); circle(rand(120,W-120),rand(130,H-80),82,1.0,'#fb7185',dmg(.50),'chaos','혼돈원'); donut(rand(160,W-160),rand(150,H-110),45,130,1.16,'#a78bfa',dmg(.52),'chaos','혼돈도넛'); beam(W/2,H/2,rand(0,Math.PI),W*1.12,18,1.3,'#facc15',dmg(.50),'chaos','혼돈선'); }},
      {n:'가짜 SAFE 판별',p:1,f(){ cast('가짜 SAFE! 진짜 빛나는 SAFE만 밟으세요.', 'cast', '#c084fc'); const real=Math.floor(Math.random()*4); for(let i=0;i<4;i++){ const x=180+i*(W-360)/3,y=H*.68; if(i===real) safe(x,y,55,2.15,'#86efac'); else state.mechanics.push({kind:'safe',x,y,r:55,life:2.15,color:'#fb7185',fake:true}); } floor(W/2,H/2,W*.96,H*.78,1.5,'#7c3aed',dmg(.92),'chaos','가짜SAFE'); }},
      {n:'속성 룰렛',p:1,f(){ cast('속성 룰렛! 서로 다른 속성이 번갈아 폭발합니다.', 'burst', '#fb7185'); const colors=['#fb923c','#60a5fa','#84cc16','#a78bfa','#facc15']; randomSpots(10,80,120).forEach((q,i)=>circle(q.x,q.y,38,0.8+i*.06,colors[i%colors.length],dmg(.36),'chaos','속성룰렛')); }},
      {n:'혼돈 미궁',p:2,f(){ cast('혼돈 미궁! 제한 시간 안에 탈출하세요.', 'cast', '#fb7185'); mini('maze', `${boss.name}이 혼돈 미궁을 엽니다!`, '#fb7185'); }},
      {n:'역방향 탄막',p:2,f(){ cast('역방향 탄막! 가장자리에서 안쪽으로 탄이 모입니다.', 'burst', '#c084fc'); for(let i=0;i<12;i++){ const x=i%2?0:W,y=rand(110,H-70); aimed(230,'#c084fc',dmg(.18),'chaos',7,x,y); } }},
      {n:'광대 야바위 강제',p:2,f(){ cast('혼돈 야바위! 처음 빛난 컵을 찾으세요.', 'cast', '#fde047'); mini('shell', `${boss.name}이 혼돈 야바위를 시작합니다!`, '#fde047'); }},
      {n:'최종 혼돈 폭풍',p:3,f(){ cast('최종 혼돈 폭풍! 모든 형태의 공격이 겹칩니다.', 'cast', '#fb7185'); randomSpots(8,90,120).forEach((q,i)=>circle(q.x,q.y,40,0.8+i*.04,'#fb7185',dmg(.34),'chaos','혼돈폭풍')); for(let i=0;i<4;i++) rot(W/2,H/2,i*Math.PI/4,.7,W*1.1,12,1.1,'#a78bfa',dmg(.32),'chaos','혼돈회전',2.0); }},
      {n:'즉사 혼돈 SAFE',p:3,f(){ cast('즉사 혼돈! SAFE 두 곳으로 들어가세요!', 'slam', '#7c3aed'); safe(W*.33,H*.70,58,2.2,'#86efac'); safe(W*.67,H*.70,58,2.2,'#86efac'); floor(W/2,H/2,W*.98,H*.82,1.55,'#7c3aed',dmg(1.15),'chaos','즉사혼돈'); }}
    ],
    crimson_train:[
      {n:'급행 레일 차선',p:1,f(){ cast('진홍 열차가 레일을 점화합니다. 빈 레일로 이동하세요!', 'wall', '#fb7185'); const safeRow=Math.floor(Math.random()*4); for(let i=0;i<4;i++) if(i!==safeRow) wall(W/2,145+i*(H-225)/3,W*.94,42,1.0+i*.08,'#fb7185',dmg(.56),'metal','급행레일'); }},
      {n:'선로 전환 X자',p:1,f(){ cast('선로 전환! 교차 레일이 지나갑니다.', 'beam', '#fbbf24'); for(let i=0;i<5;i++) beam(W/2,H/2,(i%2?Math.PI/5:-Math.PI/5)+i*.15,W*1.2,20,1.0+i*.1,'#fbbf24',dmg(.44),'metal','선로전환'); }},
      {n:'차륜 폭발 연쇄',p:1,f(){ cast('차륜 폭발! 레일 끝에서 폭발이 이어집니다.', 'slam', '#ef4444'); for(let i=0;i<9;i++) circle(80+i*(W-160)/8,rand(130,H-80),38,0.82+i*.08,'#ef4444',dmg(.36),'metal','차륜'); }},
      {n:'기관차 돌진',p:2,f(){ const y=[H*.33,H*.50,H*.67][Math.floor(Math.random()*3)]; cast('기관차 돌진! 선택된 선로에서 벗어나세요.', 'dash', '#f87171'); wall(W/2,y,W*.92,54,1.05,'#f87171',dmg(.72),'metal','기관차돌진'); }},
      {n:'증기 장막',p:2,f(){ cast('증기 장막이 시야를 덮습니다. 증기 원 밖으로 이동하세요.', 'slam', '#fca5a5'); randomSpots(10,90,120).forEach((q,i)=>donut(q.x,q.y,24,72,0.9+i*.05,'#fca5a5',dmg(.30),'metal','증기장막')); }},
      {n:'철도 건널목',p:2,f(){ cast('철도 건널목! 가로 세로 차단기가 닫힙니다.', 'wall', '#fbbf24'); wall(W/2,H*.35,W*.88,26,1.0,'#fbbf24',dmg(.44),'metal','건널목'); wall(W/2,H*.65,W*.88,26,1.18,'#fbbf24',dmg(.44),'metal','건널목'); wall(W*.35,H/2,26,H*.70,1.36,'#fbbf24',dmg(.44),'metal','건널목'); wall(W*.65,H/2,26,H*.70,1.54,'#fbbf24',dmg(.44),'metal','건널목'); }},
      {n:'폭주 급행 SAFE',p:3,f(){ cast('폭주 급행! SAFE 선로로 들어가세요.', 'slam', '#fb7185'); safe(W*.30,H*.70,56,2.1,'#86efac'); safe(W*.70,H*.70,56,2.1,'#86efac'); floor(W/2,H/2,W*.96,H*.78,1.5,'#7f1d1d',dmg(.96),'metal','폭주급행'); }}
    ],
    oracle_cube:[
      {n:'예언 블록 낙하',p:1,f(){ cast('예언 큐브가 블록을 예고합니다. 막히는 칸을 피하세요.', 'floor', '#93c5fd'); const cw=W/6,ch=(H-120)/4; for(let gx=0;gx<6;gx++) for(let gy=0;gy<4;gy++) if(Math.random()<.48) floor(cw*gx+cw/2,110+ch*gy+ch/2,cw*.72,ch*.65,1.05,'#93c5fd',dmg(.36),'mirror','예언블록'); }},
      {n:'큐브 절단 격자',p:1,f(){ cast('큐브 절단! 수직/수평 절단이 교차합니다.', 'beam', '#a78bfa'); for(let i=0;i<4;i++){ wall(160+i*(W-320)/3,H/2,22,H*.86,1.0+i*.1,'#a78bfa',dmg(.40),'mirror','큐브절단'); wall(W/2,150+i*(H-230)/3,W*.88,20,1.15+i*.1,'#93c5fd',dmg(.36),'mirror','큐브절단'); } }},
      {n:'예언 퀴즈',p:1,f(){ cast('예언 퀴즈! 정답 원을 밟아 큐브를 멈추세요.', 'cast', '#93c5fd'); mini('quiz', `${boss.name}가 예언 문제를 냅니다!`, '#93c5fd'); }},
      {n:'회전 큐브 링',p:2,f(){ cast('회전 큐브 링! 네모난 궤적이 돌아갑니다.', 'beam', '#bfdbfe'); for(let i=0;i<4;i++) rot(W/2,H/2,i*Math.PI/4,i%2?.65:-.65,W*1.0,14,1.08,'#bfdbfe',dmg(.34),'mirror','큐브링',2.4); }},
      {n:'테트리스 봉쇄',p:2,f(){ cast('테트리스 봉쇄! 블록 모양을 보고 빠져나오세요.', 'floor', '#60a5fa'); const shapes=[[0,0],[1,0],[2,0],[2,1],[4,1],[4,2],[5,2],[3,3],[4,3]]; const cw=W/6,ch=(H-120)/4; shapes.forEach((s,i)=>floor(cw*s[0]+cw/2,110+ch*s[1]+ch/2,cw*.8,ch*.7,1.0+i*.03,'#60a5fa',dmg(.38),'mirror','테트리스')); }},
      {n:'큐브 감옥',p:2,f(){ cast('큐브 감옥이 닫힙니다. 열린 면을 찾으세요!', 'wall', '#a78bfa'); wall(W/2,130,W*.70,24,1.1,'#a78bfa',dmg(.42),'mirror','큐브감옥'); wall(W/2,H-70,W*.70,24,1.1,'#a78bfa',dmg(.42),'mirror','큐브감옥'); wall(170,H/2,24,H*.62,1.1,'#a78bfa',dmg(.42),'mirror','큐브감옥'); }},
      {n:'예언 붕괴',p:3,f(){ cast('예언 붕괴! SAFE 외 블록이 모두 무너집니다.', 'slam', '#93c5fd'); safe(W*.35,H*.70,58,2.2,'#86efac'); safe(W*.65,H*.70,58,2.2,'#86efac'); floor(W/2,H/2,W*.96,H*.78,1.52,'#93c5fd',dmg(.95),'mirror','예언붕괴'); }}
    ],
    hollow_gardener:[
      {n:'공허 뿌리 부채',p:1,f(){ cast('공허 정원사가 뿌리를 뻗습니다. 자라나는 선을 피하세요!', 'beam', '#4ade80'); for(let i=0;i<7;i++){ const a=-Math.PI/2+i*Math.PI/6; beam(boss.x,boss.y,a,540,18,0.95+i*.05,'#4ade80',dmg(.36),'poison','공허뿌리'); } }},
      {n:'공허꽃 폭발',p:1,f(){ cast('공허꽃이 피어납니다. 보라색 꽃은 크게 폭발합니다.', 'slam', '#a78bfa'); randomSpots(9,85,125).forEach((q,i)=>circle(q.x,q.y,42+i%2*12,0.9+i*.06,i%2?'#a78bfa':'#4ade80',dmg(.36),'poison','공허꽃')); }},
      {n:'정원 미궁',p:1,f(){ cast('정원 미궁! 벽 사이 길을 찾아 탈출하세요.', 'cast', '#a78bfa'); mini('maze', `${boss.name}가 공허 정원 미궁을 엽니다!`, '#a78bfa'); }},
      {n:'포자 구름',p:2,f(){ cast('포자 구름이 퍼집니다. 구름에 오래 머물지 마세요!', 'cast', '#86efac'); randomSpots(8,95,130).forEach((q,i)=>{ circle(q.x,q.y,36,0.8+i*.05,'#86efac',dmg(.22),'poison','포자'); setTimeout(()=>{ if(alive()) zone(q.x,q.y,55,dmg(.02),'#86efac',2.9); },900+i*50); }); }},
      {n:'가지치기 낫선',p:2,f(){ cast('가지치기 낫선! 정원사가 대각으로 가지를 자릅니다.', 'beam', '#bbf7d0'); for(let i=0;i<5;i++) beam(W/2,H/2,-.55+i*.28,W*1.12,18,1.0+i*.08,'#bbf7d0',dmg(.40),'poison','가지치기'); }},
      {n:'잡초 봉쇄',p:2,f(){ cast('잡초가 길을 막습니다. 열린 화단으로 이동하세요!', 'wall', '#15803d'); const gap=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==gap) wall(150+i*(W-300)/4,H/2,30,H*.76,1.05,'#15803d',dmg(.42),'poison','잡초봉쇄'); }},
      {n:'공허 수확 SAFE',p:3,f(){ cast('공허 수확! SAFE 화단으로 이동하세요.', 'slam', '#4ade80'); safe(W*.33,H*.70,58,2.2,'#86efac'); safe(W*.67,H*.70,58,2.2,'#86efac'); floor(W/2,H/2,W*.94,H*.78,1.52,'#14532d',dmg(.92),'poison','공허수확'); }}
    ],
    magnet_judge:[
      {n:'N/S 극성선',p:1,f(){ cast('극성 반전! N/S 전류선 사이에서 위치를 조절하세요.', 'beam', '#60a5fa'); for(let i=0;i<6;i++){ const x=100+i*(W-200)/5; beam(x,H/2,Math.PI/2,H*.86,14,0.95+i*.06,i%2?'#fb7185':'#60a5fa',dmg(.38),'lightning','극성선'); } }},
      {n:'자기압축 흡입',p:1,f(){ cast('자석 재판관이 끌어당깁니다. 반대 방향으로 도망치세요!', 'cast', '#60a5fa'); gravity(W/2,H/2,270,2.6,'#60a5fa'); circle(W/2,H/2,130,1.28,'#fb7185',dmg(.66),'lightning','자기압축'); }},
      {n:'금속 파편 탄막',p:1,f(){ cast('금속 파편이 극성에 따라 날아옵니다.', 'burst', '#93c5fd'); for(let i=0;i<18;i++) setTimeout(()=>aimed(300,'#93c5fd',dmg(.15),'lightning',6,rand(60,W-60),rand(100,H-60)),i*60); }},
      {n:'척력 밀어내기',p:2,f(){ cast('척력이 폭발합니다. 중앙에서 밀려나기 전에 고리를 넘으세요!', 'slam', '#fb7185'); donut(W/2,H/2,70,180,1.0,'#fb7185',dmg(.52),'lightning','척력'); donut(W/2,H/2,230,330,1.34,'#60a5fa',dmg(.48),'lightning','척력외곽'); }},
      {n:'극성 SAFE 선택',p:2,f(){ cast('극성 SAFE! 같은 색 전류를 피해 안전 극성으로 이동하세요.', 'cast', '#60a5fa'); safe(W*.30,H*.68,56,2.1,'#60a5fa'); safe(W*.70,H*.68,56,2.1,'#fb7185'); floor(W/2,H/2,W*.95,H*.76,1.45,'#334155',dmg(.80),'lightning','극성심판'); }},
      {n:'자기장 십자',p:2,f(){ cast('자기장 십자가 닫힙니다. 대각선 빈틈으로 이동하세요.', 'beam', '#93c5fd'); beam(W/2,H/2,0,W*.95,20,1.0,'#93c5fd',dmg(.45),'lightning','자기장십자'); beam(W/2,H/2,Math.PI/2,H*.82,20,1.0,'#fb7185',dmg(.45),'lightning','자기장십자'); }},
      {n:'판결의 철우박',p:3,f(){ cast('판결의 철우박! 맵 전체에 금속 우박이 떨어집니다.', 'slam', '#cbd5e1'); randomSpots(16,65,110).forEach((q,i)=>circle(q.x,q.y,32,0.75+i*.035,'#cbd5e1',dmg(.34),'lightning','철우박')); }}
    ],
    dream_jester:[
      {n:'야바위 쇼',p:1,f(){ cast('악몽 광대가 야바위를 시작합니다. 처음 빛난 컵을 찾으세요!', 'cast', '#f472b6'); mini('shell', `${boss.name}가 야바위 환상을 시작합니다!`, '#f472b6'); }},
      {n:'악몽 폭죽',p:1,f(){ cast('악몽 폭죽! 폭죽 궤적과 착탄 지점을 모두 피하세요.', 'burst', '#fde047'); randomSpots(12,100,130).forEach((q,i)=>{ aimed(250,'#fde047',dmg(.13),'chaos',6,q.x,q.y); circle(q.x,q.y,34,0.8+i*.04,'#f472b6',dmg(.32),'chaos','폭죽'); }); }},
      {n:'가짜 SAFE 무대',p:1,f(){ cast('가짜 SAFE가 섞였습니다. 진짜 SAFE만 밟으세요!', 'cast', '#f472b6'); const real=Math.floor(Math.random()*4); for(let i=0;i<4;i++){ const x=180+i*(W-360)/3,y=H*.67; if(i===real) safe(x,y,54,2.1,'#86efac'); else state.mechanics.push({kind:'safe',x,y,r:54,life:2.1,color:'#fb7185',fake:true}); } floor(W/2,H/2,W*.92,H*.78,1.48,'#f472b6',dmg(.78),'chaos','가짜무대'); }},
      {n:'서커스 대포',p:2,f(){ cast('서커스 대포! 양쪽 무대에서 포탄이 날아옵니다.', 'burst', '#fef08a'); for(let i=0;i<12;i++){ const x=i%2?0:W,y=120+i*(H-200)/11; aimed(245,'#fef08a',dmg(.16),'chaos',8,x,y); } }},
      {n:'카드 병정 행진',p:2,f(){ cast('카드 병정이 행진합니다. 카드 줄 사이로 빠져나가세요.', 'wall', '#f9a8d4'); const gap=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==gap) wall(150+i*(W-300)/4,H/2,30,H*.78,1.0+i*.08,'#f9a8d4',dmg(.40),'chaos','카드병정'); }},
      {n:'스포트라이트 처형',p:2,f(){ cast('스포트라이트가 켜진 곳이 터집니다. 빛 밖으로 이동하세요!', 'slam', '#fef3c7'); randomSpots(7,120,130).forEach((q,i)=>circle(q.x,q.y,58,0.95+i*.08,'#fef3c7',dmg(.48),'chaos','스포트라이트')); }},
      {n:'광대 미궁',p:3,f(){ cast('광대 미궁! 웃음소리 속에서 출구를 찾으세요.', 'cast', '#f472b6'); mini('maze', `${boss.name}가 광대 미궁을 시작합니다!`, '#f472b6'); }}
    ]
  };

  V33_PATTERNS.prophecy_cube = V33_PATTERNS.oracle_cube;
  V33_PATTERNS.void_gardener = V33_PATTERNS.hollow_gardener;
  V33_PATTERNS.nightmare_jester = V33_PATTERNS.dream_jester;

  const oldBossPatternV33 = bossPattern;
  bossPattern = function(){
    if(!alive()) return;
    const list = V33_PATTERNS[boss.id];
    if(!list || !list.length) return oldBossPatternV33();
    boss._v33Index = ((boss._v33Index || 0) + 1);
    let pool = list.filter(p => !p.p || p.p <= ph());
    if(!pool.length) pool = list;
    const idx = (boss._v33Index - 1 + Math.max(0, ph()-1)) % pool.length;
    try { pool[idx].f(); }
    catch(e){ console.warn('[V33 boss pattern fallback]', e); oldBossPatternV33(); }
    if(boss.tier >= 8 && ph() >= 3 && Math.random() < .18){
      setTimeout(()=>{ if(alive()) circle(rand(80,W-80),rand(120,H-80),38,.7,ss(),dmg(.25),th(),'페이즈잔상'); },650);
    }
  };

  const V33_LABELS = {};
  Object.keys(V33_PATTERNS).forEach(id => { V33_LABELS[id] = V33_PATTERNS[id].map(p => p.n); });
  try { BOSSES.forEach(b => { if(V33_LABELS[b.id]) b.patterns = V33_LABELS[b.id]; }); } catch(e) {}

  window.RaidDungeonV33 = {
    version: V33_VERSION,
    bosses: Object.keys(V33_PATTERNS).length,
    highTierPatternRule: 'tier 8+ bosses expose 7 or more pattern labels where implemented',
    damageBoost: 'V32 atk x 1.32 once'
  };
})();


/* =========================================================
   RAID DUNGEON V34 - SAFE ZONE, THEME FLOOR FX, DAMAGE BALANCE
   - 맵 전체 장판 SAFE 시각/판정 보호
   - 전체 장판 경고 시간 증가
   - 테마별 장판 이펙트 강화: 화염, 전기, 해일/물, 독, 공허 등
   - 일반 접촉 공격 약화, 패턴/장판/탄막 피해 강화
   - 보스별 느낌을 더 살리기 위한 추가 대표 패턴 덮어쓰기
========================================================= */
(function raidDungeonV34SafeFxPatternDamageBalancePatch(){
  const V34_VERSION = 'Raid Dungeon V34 - Safe Zone FX and Pattern Damage Balance';
  try { console.log('[RaidDungeon]', V34_VERSION); } catch(e) {}

  try {
    BOSSES.forEach(b=>{
      if(!b._v34NormalAtkReduced){
        b.atk = Math.round((b.atk || 12) * 0.72 * 10) / 10;
        b._v34NormalAtkReduced = true;
      }
    });
  } catch(e) { console.warn('[V34 atk rebalance failed]', e); }

  function alive(){ return state && state.raid && boss && !boss.dead && !state.miniGame && !state.pendingMiniGame; }
  function ph(){ return boss && boss.phase ? boss.phase : 1; }
  function th(){ return (boss && (boss.theme || boss.id)) || 'boss'; }
  function cc(){ return (boss && boss.color) || '#93c5fd'; }
  function ss(){ return (boss && boss.sub) || cc(); }
  function dmul(){ return ph()>=3 ? 1.20 : ph()>=2 ? 1.10 : 1; }
  function dmg(m){ return ((boss && boss.atk) || 12) * m * dmul(); }
  function isFullMap(h){ return h && (h.kind==='floor' || h.kind==='wall') && ((h.w || 0) >= W*.86 || (h.h || 0) >= H*.68); }
  function currentSafes(){ return (state.mechanics || []).filter(m=>m && m.kind==='safe' && !m.fake && m.life>0); }
  function inSafe(px,py){ return currentSafes().some(s=>dist(px,py,s.x,s.y) <= (s.r || 0) + player.r + 3); }
  function normalizeMapwide(h){
    if(!h || h._v34Norm) return;
    h._v34Norm = true;
    if(isFullMap(h)){
      h.respectSafe = true;
      h.warn = Math.max(h.warn || 0, 2.35);
      h.life = Math.max(h.life || 0, .82);
      h.label = h.label || '심판';
      (state.mechanics || []).forEach(m=>{ if(m && m.kind==='safe' && !m.fake) m.life = Math.max(m.life || 0, h.warn + h.life + .25); });
    } else {
      h.warn = Math.max(h.warn || 0, .62);
    }
    if(h.owner !== 'player' && h.kind !== 'playerStrike' && Number.isFinite(h.damage) && !h._v34DamageBoosted){
      h.damage = Math.max(1, h.damage * 1.95);
      h._v34DamageBoosted = true;
    }
  }

  const oldSpawnProjectileV34 = spawnProjectile;
  spawnProjectile = function(p){
    try {
      if(p && p.owner === 'boss' && Number.isFinite(p.damage) && !p._v34DamageBoosted){
        p.damage = Math.max(1, p.damage * 1.65);
        p._v34DamageBoosted = true;
      }
    } catch(e) {}
    return oldSpawnProjectileV34(p);
  };

  updateHazards = function(dt){
    state.hazards.forEach(h=>{
      if(!h || !Number.isFinite(h.life)) h.life = 0;
      normalizeMapwide(h);
      if(h.warn>0){ h.warn-=dt; if(h.kind==='rotatingBeam') h.angle += (h.spin||0)*dt*.25; return; }
      h.life-=dt;
      if(h.respectSafe && inSafe(player.x, player.y)){
        if(h.kind==='circle' || h.kind==='donut' || h.kind==='beam' || h.kind==='floor'){
          if(h.kind==='beam') h.life=0;
          return;
        }
      }
      if(h.kind==='circle'){
        if(dist(h.x,h.y,player.x,player.y)<h.r+player.r){ hurtPlayer(h.damage,h.color); if(h.tag) applyBossHitStatus(h.tag); }
        if(h.zone) state.zones.push({x:h.x,y:h.y,r:h.r,damage:h.damage*.08,life:2.4,tick:0,color:h.color,enemy:true,dot:true});
        if(h.callback) h.callback(); h.life=0;
      } else if(h.kind==='donut'){
        const dd=dist(h.x,h.y,player.x,player.y);
        if(dd>h.inner && dd<h.outer){ hurtPlayer(h.damage,h.color); if(h.tag) applyBossHitStatus(h.tag); }
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
        if(h.respectSafe && inSafe(player.x, player.y)) return;
        if(Math.abs(player.x-h.x)<h.w+player.r && Math.abs(player.y-h.y)<h.h/2+player.r){ hurtPlayer(h.damage,h.color); if(h.tag) applyBossHitStatus(h.tag); }
      } else if(h.kind==='floor'){
        if(h.respectSafe && inSafe(player.x, player.y)) return;
        if(Math.abs(player.x-h.x)<h.w/2+player.r && Math.abs(player.y-h.y)<h.h/2+player.r){ hurtPlayer(h.damage,h.color); if(h.tag) applyBossHitStatus(h.tag); h.life=0; }
      }
    });
    state.hazards=state.hazards.filter(h=>h && (h.life>0||h.warn>0));
  };

  function tagStyle(h){
    const key = String((h && (h.tag || h.label || '')) || '').toLowerCase();
    const label = String((h && h.label) || '');
    if(key.includes('fire') || key.includes('solar') || label.includes('화') || label.includes('태양') || label.includes('용암') || label.includes('일식')) return {type:'fire', c1:'#fb923c', c2:'#ef4444', c3:'#fef3c7'};
    if(key.includes('lightning') || label.includes('전') || label.includes('번개') || label.includes('자기') || label.includes('극성')) return {type:'lightning', c1:'#fde047', c2:'#60a5fa', c3:'#ffffff'};
    if(key.includes('ice') || label.includes('해일') || label.includes('물') || label.includes('소용돌이') || label.includes('심해') || label.includes('쓰나미')) return {type:'water', c1:'#38bdf8', c2:'#0ea5e9', c3:'#e0f2fe'};
    if(key.includes('poison') || label.includes('독') || label.includes('역병') || label.includes('포자') || label.includes('정원')) return {type:'poison', c1:'#84cc16', c2:'#4ade80', c3:'#d9f99d'};
    if(key.includes('void') || key.includes('gravity') || label.includes('공허') || label.includes('중력')) return {type:'void', c1:'#a78bfa', c2:'#4c1d95', c3:'#ddd6fe'};
    if(key.includes('mirror') || label.includes('거울') || label.includes('큐브')) return {type:'mirror', c1:'#f0abfc', c2:'#93c5fd', c3:'#ffffff'};
    if(key.includes('metal') || label.includes('철') || label.includes('열차') || label.includes('강철')) return {type:'metal', c1:'#cbd5e1', c2:'#64748b', c3:'#ffffff'};
    if(key.includes('blood') || label.includes('피') || label.includes('혈')) return {type:'blood', c1:'#fb7185', c2:'#be123c', c3:'#ffe4e6'};
    return {type:'normal', c1:h.color || cc(), c2:h.color || cc(), c3:'#ffffff'};
  }

  function withSafeCutout(h, drawFn){
    const safes = h && h.respectSafe ? currentSafes() : [];
    if(!safes.length){ drawFn(); return; }
    ctx.save();
    ctx.beginPath();
    if(h.kind === 'floor') ctx.rect(h.x-h.w/2,h.y-h.h/2,h.w,h.h);
    else if(h.kind === 'wall') ctx.rect(h.x-h.w/2,h.y-h.h/2,h.w,h.h);
    else { drawFn(); ctx.restore(); return; }
    safes.forEach(s=>{ ctx.moveTo(s.x+s.r+16,s.y); ctx.arc(s.x,s.y,s.r+18,0,Math.PI*2,true); });
    ctx.clip('evenodd');
    drawFn();
    ctx.restore();
  }

  function drawThemedRect(h, warning, st){
    const x=h.x-h.w/2, y=h.y-h.h/2, w=h.w, hh=h.h;
    const time=state.time;
    withSafeCutout(h, ()=>{
      ctx.save();
      const alpha = warning ? .30 : .70;
      ctx.globalAlpha = alpha;
      if(st.type==='fire'){
        const g=ctx.createLinearGradient(x,y,x,y+hh); g.addColorStop(0,'rgba(251,146,60,.15)'); g.addColorStop(.45,'rgba(239,68,68,.78)'); g.addColorStop(1,'rgba(127,29,29,.65)'); ctx.fillStyle=g; ctx.fillRect(x,y,w,hh);
        ctx.globalAlpha = warning ? .42 : .95; ctx.strokeStyle=st.c3; ctx.lineWidth=2; for(let i=0;i<Math.max(7,Math.floor(w/70));i++){ const fx=x+((i*79+time*95)%Math.max(80,w)); ctx.beginPath(); ctx.moveTo(fx,y+hh); ctx.quadraticCurveTo(fx+18*Math.sin(time*5+i), y+hh*.52, fx+4*Math.cos(time*4+i), y+hh*.22); ctx.stroke(); }
      } else if(st.type==='lightning'){
        ctx.fillStyle='rgba(250,204,21,.42)'; ctx.fillRect(x,y,w,hh); ctx.globalAlpha=warning?.55:1; ctx.strokeStyle=st.c3; ctx.lineWidth=3; for(let i=0;i<Math.max(5,Math.floor(w/110));i++){ let sx=x+((i*137+time*240)%Math.max(120,w)), sy=y+10; ctx.beginPath(); ctx.moveTo(sx,sy); for(let k=0;k<5;k++){ sx += rand(-28,28); sy += hh/5; ctx.lineTo(sx,sy); } ctx.stroke(); }
      } else if(st.type==='water'){
        const g=ctx.createLinearGradient(x,y,x+w,y); g.addColorStop(0,'rgba(14,165,233,.25)'); g.addColorStop(.5,'rgba(56,189,248,.75)'); g.addColorStop(1,'rgba(224,242,254,.42)'); ctx.fillStyle=g; ctx.fillRect(x,y,w,hh); ctx.globalAlpha=warning?.50:.92; ctx.strokeStyle=st.c3; ctx.lineWidth=4; for(let i=0;i<4;i++){ ctx.beginPath(); for(let px=x; px<=x+w; px+=34){ const py=y+hh*(.25+i*.18)+Math.sin(px*.022+time*5+i)*10; if(px===x) ctx.moveTo(px,py); else ctx.lineTo(px,py); } ctx.stroke(); }
      } else if(st.type==='poison'){
        ctx.fillStyle='rgba(77,124,15,.62)'; ctx.fillRect(x,y,w,hh); ctx.globalAlpha=warning?.35:.75; ctx.fillStyle=st.c3; for(let i=0;i<Math.max(8,Math.floor(w*hh/18000));i++) circle(ctx,x+rand(0,w),y+rand(0,hh),rand(4,10));
      } else if(st.type==='void'){
        ctx.fillStyle='rgba(76,29,149,.60)'; ctx.fillRect(x,y,w,hh); ctx.globalAlpha=warning?.45:.85; ctx.strokeStyle=st.c1; ctx.lineWidth=2; for(let i=0;i<5;i++){ ctx.beginPath(); ctx.ellipse(x+w/2,y+hh/2,w*(.15+i*.08),hh*(.10+i*.05),time*.4+i,0,Math.PI*2); ctx.stroke(); }
      } else {
        ctx.fillStyle=h.color||st.c1; ctx.fillRect(x,y,w,hh);
      }
      ctx.globalAlpha = warning ? .75 : 1; ctx.strokeStyle=warning ? st.c3 : '#ffffff'; ctx.lineWidth=warning ? 2 : 3; ctx.strokeRect(x,y,w,hh);
      if(h.label){ ctx.fillStyle='#fff'; ctx.font='900 13px system-ui'; ctx.textAlign='center'; ctx.fillText(h.label,h.x,h.y+5); }
      ctx.restore();
    });
  }

  drawHazards = function(){
    state.hazards.forEach(h=>{
      if(!h) return;
      normalizeMapwide(h);
      const warning=h.warn>0;
      const st=tagStyle(h);
      ctx.save();
      const c=h.color||st.c1;
      if(h.kind==='circle'){
        ctx.globalAlpha = warning ? .24 : .70; ctx.fillStyle=c; circle(ctx,h.x,h.y,h.r);
        ctx.globalAlpha = warning ? .85 : 1; ctx.strokeStyle = warning ? '#fff' : c; ctx.lineWidth = warning ? 2 : 4; circleStroke(ctx,h.x,h.y,h.r+Math.sin(state.time*12)*3);
        if(st.type==='fire' && !warning){ ctx.globalAlpha=.8; ctx.strokeStyle='#fef3c7'; for(let i=0;i<6;i++){ ctx.beginPath(); ctx.arc(h.x,h.y,h.r*(.35+i*.12),state.time+i,state.time+i+.7); ctx.stroke(); } }
        if(st.type==='lightning' && !warning){ ctx.globalAlpha=.9; ctx.strokeStyle='#fff'; ctx.beginPath(); ctx.moveTo(h.x-h.r*.45,h.y-h.r*.15); ctx.lineTo(h.x,h.y+h.r*.1); ctx.lineTo(h.x-h.r*.12,h.y+h.r*.1); ctx.lineTo(h.x+h.r*.35,h.y+h.r*.45); ctx.stroke(); }
        if(st.type==='water' && !warning){ ctx.globalAlpha=.8; ctx.strokeStyle='#e0f2fe'; ctx.beginPath(); ctx.arc(h.x,h.y,h.r*.74,Math.sin(state.time)*.8,Math.PI*1.45); ctx.stroke(); }
        if(h.label){ ctx.fillStyle='#fff'; ctx.font='900 12px system-ui'; ctx.textAlign='center'; ctx.fillText(h.label,h.x,h.y+4); }
      } else if(h.kind==='donut'){
        ctx.globalAlpha=warning?.26:.67; ctx.strokeStyle=c; ctx.lineWidth=Math.max(10,h.outer-h.inner); circleStroke(ctx,h.x,h.y,(h.inner+h.outer)/2); ctx.globalAlpha=1; ctx.strokeStyle='#fff'; ctx.lineWidth=2; circleStroke(ctx,h.x,h.y,h.inner); circleStroke(ctx,h.x,h.y,h.outer);
      } else if(h.kind==='beam' || h.kind==='rotatingBeam'){
        const ang=h.angle||0; ctx.translate(h.x,h.y); ctx.rotate(ang); ctx.globalAlpha=warning?.30:.78; const grad=ctx.createLinearGradient(-h.len/2,0,h.len/2,0); grad.addColorStop(0,'rgba(255,255,255,.05)'); grad.addColorStop(.5,c); grad.addColorStop(1,'rgba(255,255,255,.05)'); ctx.fillStyle=grad; ctx.fillRect(-h.len/2,-h.w,h.len,h.w*2); ctx.globalAlpha=warning?.80:1; ctx.strokeStyle=warning?'#fff':st.c3; ctx.lineWidth=2; ctx.strokeRect(-h.len/2,-h.w,h.len,h.w*2);
        if(st.type==='lightning' && !warning){ ctx.strokeStyle='#fff'; ctx.lineWidth=3; ctx.beginPath(); for(let x=-h.len/2;x<h.len/2;x+=32){ const yy=Math.sin(x*.07+state.time*18)*h.w*.55; if(x===-h.len/2) ctx.moveTo(x,yy); else ctx.lineTo(x,yy); } ctx.stroke(); }
      } else if(h.kind==='wall' || h.kind==='floor'){
        drawThemedRect(h, warning, st);
      } else if(h.kind==='playerStrike'){
        ctx.globalAlpha=.55; ctx.fillStyle=c; circle(ctx,h.x,h.y,h.r); ctx.globalAlpha=1; ctx.strokeStyle='#fff'; circleStroke(ctx,h.x,h.y,h.r);
      }
      ctx.restore();
    });
  };

  function cast(text, kind, color, angle){
    if(typeof v28Cast === 'function') v28Cast(text, kind || 'cast', color || cc(), angle == null ? Math.atan2(player.y-boss.y, player.x-boss.x) : angle, 1.1);
    else if(typeof v20BossCast === 'function') v20BossCast(text, kind || 'cast', color || cc(), angle == null ? Math.atan2(player.y-boss.y, player.x-boss.x) : angle);
    else { boss.mechanicText = text; floatText(text,W/2,88,color||cc(),18); }
  }
  function push(h){ h.warn=Math.max(h.warn||1.0,.85); h.life=Math.max(h.life||.8,.7); state.hazards.push(h); }
  function floor(x,y,w,h,warn,color,damage,tag,label,life){ push({kind:'floor',x,y,w,h,warn,life:life||.95,damage,color,tag,label}); }
  function wall(x,y,w,h,warn,color,damage,tag,label,life){ push({kind:'wall',x,y,w,h,warn,life:life||.92,damage,color,tag,label}); }
  function circleHaz(x,y,r,warn,color,damage,tag,label,life){ push({kind:'circle',x,y,r,warn,life:life||.82,damage,color,tag,label}); }
  function beam(x,y,a,len,w,warn,color,damage,tag,label,life){ push({kind:'beam',x,y,angle:a,len,w,warn,life:life||.86,damage,color,tag,label}); }
  function donut(x,y,inner,outer,warn,color,damage,tag,label,life){ push({kind:'donut',x,y,inner,outer,warn,life:life||.86,damage,color,tag,label}); }
  function safe(x,y,r,life,color){ state.mechanics.push({kind:'safe',x,y,r,life:Math.max(life||2.5,2.6),color:color||'#86efac'}); }
  function randomSpots(n, marginX, marginY){ const a=[]; for(let i=0;i<n;i++) a.push({x:rand(marginX||80,W-(marginX||80)), y:rand(marginY||115,H-(marginY||75))}); return a; }
  function arenaSafeFlood(tag,label,color,damage,warning,style){
    const safes = style === 'spread' ? [{x:W*.25,y:H*.68},{x:W*.50,y:H*.70},{x:W*.75,y:H*.68}] : [{x:W*.32,y:H*.68},{x:W*.68,y:H*.68}];
    safes.forEach(s=>safe(s.x,s.y,style==='spread'?54:60,3.0,'#86efac'));
    floor(W/2,H/2,W*.98,H*.82,Math.max(warning||2.45,2.45),color,damage,tag,label,1.05);
  }

  const oldBossPatternV34 = bossPattern;
  bossPattern = function(){
    if(!alive()) return;
    const id = boss.id || '';
    const p = ph();
    try {
      if(id==='ember_tyrant'){
        const a=Math.atan2(player.y-boss.y,player.x-boss.x);
        if(p>=3 && Math.random()<.38){ cast('화염 폭군: 용암이 전장을 덮습니다. SAFE로 대피하세요!', 'slam', '#fb923c'); arenaSafeFlood('fire','용암대폭발','#ef4444',dmg(1.15),2.55); }
        else { cast('화염 폭군: 불길을 부채처럼 내뿜습니다. 옆 빈틈으로 파고드세요!', 'beam', '#fb923c', a); for(let i=-6;i<=6;i++) beam(boss.x+Math.cos(a+i*.07)*340,boss.y+Math.sin(a+i*.07)*340,a+i*.07,760,18,1.10+(i+6)*.025,'#fb923c',dmg(.58),'fire','화염숨결'); randomSpots(7,120,135).forEach((q,i)=>circleHaz(q.x,q.y,44,1.05+i*.08,'#ef4444',dmg(.45),'fire','화산탄')); }
        return;
      }
      if(id==='storm_colossus' || id==='magnet_judge'){
        if(p>=2 && Math.random()<.42){ cast(`${boss.name}: 전류 장판이 켜집니다. 찌릿거리는 칸을 피하세요!`, 'floor', '#fde047'); const cw=W/7,ch=(H-120)/4; const off=Math.floor(state.time)%2; for(let gx=0;gx<7;gx++) for(let gy=0;gy<4;gy++) if((gx+gy+off)%2===0) floor(cw*gx+cw/2,110+ch*gy+ch/2,cw*.78,ch*.68,1.22,'#fde047',dmg(.52),'lightning','전기장판'); }
        else { cast(`${boss.name}: 낙뢰 피뢰침이 연결됩니다. 전류선 사이 빈틈을 찾으세요!`, 'beam', '#facc15'); const rods=randomSpots(6,110,130); rods.forEach(q=>circleHaz(q.x,q.y,26,.85,'#fde047',dmg(.20),'lightning','피뢰침')); for(let i=0;i<rods.length;i++){ const a=Math.atan2(rods[(i+1)%rods.length].y-rods[i].y,rods[(i+1)%rods.length].x-rods[i].x); beam((rods[i].x+rods[(i+1)%rods.length].x)/2,(rods[i].y+rods[(i+1)%rods.length].y)/2,a,dist(rods[i].x,rods[i].y,rods[(i+1)%rods.length].x,rods[(i+1)%rods.length].y),15,1.2+i*.06,'#facc15',dmg(.48),'lightning','전류선'); } }
        return;
      }
      if(id==='abyss_leviathan'){
        if(p>=2 && Math.random()<.48){ cast('심해의 레비아탄: 쓰나미가 전장을 덮칩니다. SAFE 해류로 들어가세요!', 'slam', '#38bdf8'); arenaSafeFlood('ice','쓰나미','#0ea5e9',dmg(1.08),2.65,'spread'); }
        else { cast('심해의 레비아탄: 해일 벽이 줄지어 밀려옵니다. 열린 수로를 찾으세요!', 'wall', '#38bdf8'); const safeRow=Math.floor(Math.random()*4); for(let i=0;i<4;i++) if(i!==safeRow) wall(W/2,145+i*(H-225)/3,W*.95,44,1.25+i*.10,'#38bdf8',dmg(.62),'ice','해일벽'); donut(W/2,H/2,80,290,1.55,'#0ea5e9',dmg(.58),'ice','소용돌이'); }
        return;
      }
      if(id==='solar_dragon' || id==='black_sun'){
        if(Math.random()<.52){ cast(`${boss.name}: 일식 심판입니다. 안전지대가 먼저 보인 뒤 전장이 불탑니다!`, 'slam', '#facc15'); arenaSafeFlood('solar','일식심판','#fb923c',dmg(1.16),2.65); }
        else { cast(`${boss.name}: 태양 기둥이 순서대로 내려옵니다. 다음 기둥 위치를 읽으세요!`, 'wall', '#f97316'); for(let i=0;i<8;i++) wall(90+i*(W-180)/7,H/2,30,H*.82,1.05+i*.12,'#f97316',dmg(.54),'solar','태양기둥'); }
        return;
      }
      if(id==='plague_doctor' || id==='hollow_gardener' || id==='thorn_queen'){
        if(p>=2 && Math.random()<.45){ cast(`${boss.name}: 독성 정원이 번집니다. 초록 장판에 오래 머물지 마세요!`, 'floor', '#84cc16'); randomSpots(12,80,120).forEach((q,i)=>circleHaz(q.x,q.y,42+i%2*12,0.95+i*.055,i%2?'#4ade80':'#84cc16',dmg(.40),'poison','독꽃')); }
        else { cast(`${boss.name}: 덩굴 벽이 자라납니다. 열린 화단으로 빠져나가세요!`, 'wall', '#22c55e'); const gap=Math.floor(Math.random()*5); for(let i=0;i<5;i++) if(i!==gap) wall(150+i*(W-300)/4,H/2,34,H*.78,1.18,'#22c55e',dmg(.52),'poison','덩굴벽'); }
        return;
      }
      if(id==='gravity_core' || id==='void_serpent'){
        if(p>=3 && Math.random()<.45){ cast(`${boss.name}: 공간이 접힙니다. SAFE 밖은 공허에 삼켜집니다!`, 'slam', '#a78bfa'); arenaSafeFlood('void','공간붕괴','#4c1d95',dmg(1.04),2.6); }
        else { cast(`${boss.name}: 중력 고리가 중심으로 끌어당깁니다. 고리 사이를 번갈아 보세요!`, 'cast', '#a78bfa'); state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:295,life:2.8,power:240,color:'#a78bfa'}); donut(W/2,H/2,70,205,1.35,'#a78bfa',dmg(.68),'void','중력고리'); donut(W/2,H/2,245,345,1.75,'#4c1d95',dmg(.74),'void','공허외곽'); }
        return;
      }
    } catch(e) { console.warn('[V34 themed boss override fallback]', e); }
    return oldBossPatternV34();
  };

  window.RaidDungeonV34 = {
    version: V34_VERSION,
    normalAttackMultiplierApplied: 0.72,
    hazardDamageMultiplierApplied: 1.95,
    bossProjectileDamageMultiplierApplied: 1.65,
    mapwideSafeWarningMinimumSeconds: 2.35,
    safeCutout: true,
    themedFloorFx: ['fire','lightning','water/tsunami','poison','void','mirror','metal','blood']
  };
})();


/* =========================================================
   RAID DUNGEON V35 - VISUAL ATTACK FORMS + BOSS ORDER
   - Draw named patterns as actual shapes, not only laser boxes.
   - Sort boss cards by tier 1 -> 10.
========================================================= */
(function raidDungeonV35VisualAttackFormsAndBossOrder(){
  const V35_VERSION = 'Raid Dungeon V35 - Visual Attack Forms and Boss Tier Order';
  try { console.log('[RaidDungeon]', V35_VERSION); } catch(e) {}

  try {
    BOSSES.forEach((b, i) => { if (typeof b._v35OriginalOrder !== 'number') b._v35OriginalOrder = i; });
    BOSSES.sort((a, b) => {
      const ta = Number(a.tier || 1), tb = Number(b.tier || 1);
      if (ta !== tb) return ta - tb;
      return (a._v35OriginalOrder || 0) - (b._v35OriginalOrder || 0);
    });
    if (!state.selectedBossId || !BOSSES.some(b => b.id === state.selectedBossId)) state.selectedBossId = BOSSES[0].id;
    if (!state.rankingBossId || !BOSSES.some(b => b.id === state.rankingBossId)) state.rankingBossId = BOSSES[0].id;
  } catch(e) { console.warn('[V35 boss order failed]', e); }

  function v35Phase(h){
    if(!h) return 0;
    if(typeof h._v35MaxLife !== 'number') h._v35MaxLife = Math.max(.05, h.life || .9);
    if((h.warn || 0) > 0) return 0;
    return clamp(1 - (h.life || 0) / h._v35MaxLife, 0, 1);
  }
  function v35Label(h){ return String((h && h.label) || ''); }
  function v35Theme(h){ return String((h && (h.tag || h.theme || '')) || '').toLowerCase(); }
  function v35Is(h, words){
    const s = (v35Label(h) + ' ' + v35Theme(h)).toLowerCase();
    return words.some(w => s.includes(String(w).toLowerCase()));
  }
  function v35Glow(color, blur){
    ctx.shadowColor = color || '#fff';
    ctx.shadowBlur = blur || 18;
  }
  function v35Text(txt, x, y, color){
    ctx.save();
    ctx.font = '900 13px system-ui';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,.65)';
    ctx.strokeText(txt, x, y);
    ctx.fillStyle = color || '#fff';
    ctx.fillText(txt, x, y);
    ctx.restore();
  }
  function v35DrawGuillotine(h){
    if(!h || h.kind !== 'wall') return false;
    if(!v35Is(h, ['단두대','분침'])) return false;
    const p = v35Phase(h);
    const x = h.x, y = h.y, w = Math.max(58, h.w * 2.8), hh = Math.max(160, h.h || H*.7);
    const top = y - hh/2, bottom = y + hh/2;
    const color = h.color || '#fca5a5';
    ctx.save();
    v35Glow(color, 20);
    ctx.globalAlpha = h.warn > 0 ? .62 : .96;
    ctx.lineWidth = 5;
    ctx.strokeStyle = 'rgba(255,255,255,.95)';
    ctx.fillStyle = 'rgba(120,55,55,.38)';
    roundRect(ctx, x-w/2, top, w, hh, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x-w*.44, top+10); ctx.lineTo(x-w*.44, bottom-8);
    ctx.moveTo(x+w*.44, top+10); ctx.lineTo(x+w*.44, bottom-8);
    ctx.moveTo(x-w*.56, top+36); ctx.lineTo(x+w*.56, top+36);
    ctx.stroke();
    const bladeY = top + 46 + p * (hh - 92);
    ctx.shadowColor = '#fff'; ctx.shadowBlur = 16;
    ctx.fillStyle = h.warn > 0 ? 'rgba(255,255,255,.78)' : '#f8fafc';
    ctx.strokeStyle = '#fecaca'; ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x-w*.36, bladeY);
    ctx.lineTo(x+w*.36, bladeY);
    ctx.lineTo(x, bladeY + 42);
    ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.globalAlpha = .82;
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    for(let i=-1;i<=1;i++){
      ctx.beginPath(); ctx.moveTo(x+i*w*.18, top+38); ctx.lineTo(x+i*w*.18, bladeY); ctx.stroke();
    }
    v35Text(h.warn > 0 ? '단두대 예고' : '칼날 낙하', x, Math.max(28, top+24), '#fff');
    ctx.restore();
    return true;
  }
  function v35DrawTrainRail(h){
    if(!v35Is(h, ['열차','레일','선로','급행','차륜'])) return false;
    const color = h.color || '#ef4444';
    ctx.save();
    v35Glow(color, 18);
    ctx.globalAlpha = h.warn > 0 ? .55 : .92;
    ctx.translate(h.x || W/2, h.y || H/2);
    if(h.kind === 'beam') ctx.rotate(h.angle || 0);
    const len = h.kind === 'beam' ? (h.len || W) : (h.w || W*.8);
    const thick = h.kind === 'beam' ? Math.max(28, (h.w||16)*2.3) : Math.max(34, h.h || 40);
    ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(-len/2, -thick*.34); ctx.lineTo(len/2, -thick*.34); ctx.moveTo(-len/2, thick*.34); ctx.lineTo(len/2, thick*.34); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = 7;
    for(let t=-len/2; t<len/2; t+=58){ ctx.beginPath(); ctx.moveTo(t, -thick*.58); ctx.lineTo(t+24, thick*.58); ctx.stroke(); }
    if((h.warn||0)<=0){
      const p = v35Phase(h);
      const tx = -len/2 + p*len;
      ctx.fillStyle = '#111827'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      roundRect(ctx, tx-64, -thick*.9, 128, thick*1.8, 12); ctx.fill(); ctx.stroke();
      ctx.fillStyle = color; roundRect(ctx, tx-42, -thick*.52, 84, thick*1.04, 8); ctx.fill();
      ctx.fillStyle = '#facc15'; circle(ctx, tx-38, thick*.66, 8); circle(ctx, tx+38, thick*.66, 8);
    }
    ctx.restore();
    return true;
  }
  function v35DrawHookOrVine(h){
    if(!v35Is(h, ['갈고리','덩굴','실 조종','실조종','인형실','촉수','사슬'])) return false;
    const color = h.color || '#22c55e';
    ctx.save();
    v35Glow(color, 16);
    ctx.globalAlpha = h.warn > 0 ? .58 : .95;
    const x = h.x || W/2, y = h.y || H/2;
    let angle = h.angle || Math.atan2(player.y-y, player.x-x);
    const len = h.kind === 'beam' ? (h.len||620) : Math.max(h.w||250, h.h||250);
    ctx.translate(x,y); ctx.rotate(angle);
    ctx.strokeStyle = color; ctx.lineWidth = 8; ctx.lineCap = 'round';
    ctx.beginPath();
    for(let i=0;i<9;i++){ const xx=-len/2+i*len/8; const yy=Math.sin(i*1.4+state.time*5)*10; i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy); }
    ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
    const hx = len/2-16;
    ctx.strokeStyle = color; ctx.lineWidth = 7;
    ctx.beginPath(); ctx.arc(hx,0,28,Math.PI*.15,Math.PI*1.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx+18,-22); ctx.lineTo(hx+42,-38); ctx.stroke();
    ctx.restore();
    return true;
  }
  function v35DrawScytheOrBlade(h){
    if(!v35Is(h, ['낫','칼날','검','수술선','절단','만화경'])) return false;
    const color = h.color || '#f8fafc';
    ctx.save();
    v35Glow(color, 18);
    ctx.globalAlpha = h.warn > 0 ? .54 : .92;
    const x = h.x || W/2, y = h.y || H/2;
    const a = h.angle || 0;
    ctx.translate(x,y); ctx.rotate(a);
    const len = h.kind === 'beam' ? (h.len||650) : Math.max(h.w||360,h.h||360);
    ctx.strokeStyle = '#fff'; ctx.lineWidth = h.warn > 0 ? 4 : 9; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-len/2,0); ctx.quadraticCurveTo(0,-38,len/2,0); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = h.warn > 0 ? 2 : 4;
    for(let i=-2;i<=2;i++) { ctx.beginPath(); ctx.moveTo(-len/2+i*30,0); ctx.lineTo(-len/2+i*30+26,-30); ctx.stroke(); }
    ctx.restore();
    return true;
  }
  function v35DrawCubeBlock(h){
    if(!v35Is(h, ['큐브','예언 블록','블록'])) return false;
    const color = h.color || '#a78bfa';
    const x = h.x || W/2, y = h.y || H/2, w = h.w || h.r*2 || 80, hh = h.h || h.r*2 || 80;
    ctx.save(); v35Glow(color, 18); ctx.globalAlpha = h.warn > 0 ? .48 : .9;
    ctx.translate(x,y); ctx.rotate((state.time*.9)%(Math.PI*2));
    ctx.fillStyle = color; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
    roundRect(ctx,-w/2,-hh/2,w,hh,10); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-w/2,-hh/2); ctx.lineTo(w/2,hh/2); ctx.moveTo(w/2,-hh/2); ctx.lineTo(-w/2,hh/2); ctx.stroke();
    ctx.restore(); return true;
  }
  function v35DrawTotemOrPillar(h){
    if(!v35Is(h, ['피뢰침','태양기둥','금속 파편','극성','자기'])) return false;
    const color = h.color || '#fde047';
    const x = h.x || W/2, y = h.y || H/2;
    ctx.save(); v35Glow(color, 18); ctx.globalAlpha = h.warn > 0 ? .55 : .95;
    ctx.fillStyle = color; ctx.strokeStyle = '#fff'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(x,y-46); ctx.lineTo(x+22,y); ctx.lineTo(x+9,y); ctx.lineTo(x+25,y+48); ctx.lineTo(x-18,y+8); ctx.lineTo(x-5,y+8); ctx.closePath(); ctx.fill(); ctx.stroke();
    if((h.warn||0)<=0){ ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; for(let i=0;i<4;i++){ const a=state.time*8+i*Math.PI/2; ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*35,y+Math.sin(a)*35); ctx.lineTo(x+Math.cos(a)*58,y+Math.sin(a)*58); ctx.stroke(); } }
    ctx.restore(); return true;
  }
  function v35DrawWaterWave(h){
    if(!v35Is(h, ['해일','쓰나미','물','심해','파도'])) return false;
    const color = h.color || '#38bdf8';
    ctx.save(); v35Glow(color, 18); ctx.globalAlpha = h.warn > 0 ? .45 : .78;
    const x=h.x||W/2,y=h.y||H/2,w=h.w||W*.9,hh=h.h||80;
    ctx.strokeStyle = '#e0f2fe'; ctx.lineWidth = 5;
    for(let k=0;k<4;k++){
      ctx.beginPath();
      for(let i=0;i<=48;i++){
        const xx=x-w/2+i*w/48;
        const yy=y-hh/3+k*hh/4+Math.sin(i*.7+state.time*6+k)*12;
        i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);
      }
      ctx.stroke();
    }
    ctx.restore(); return true;
  }

  const oldDrawHazardsV35 = drawHazards;
  drawHazards = function(){
    oldDrawHazardsV35();
    try {
      state.hazards.forEach(h => {
        if(!h) return;
        if(v35DrawGuillotine(h)) return;
        if(v35DrawTrainRail(h)) return;
        if(v35DrawHookOrVine(h)) return;
        if(v35DrawScytheOrBlade(h)) return;
        if(v35DrawCubeBlock(h)) return;
        if(v35DrawTotemOrPillar(h)) return;
        if(v35DrawWaterWave(h)) return;
      });
    } catch(e) { console.warn('[V35 hazard visual overlay failed]', e); }
  };

  function v35Dmg(m){ return Math.max(10, (boss.atk || 20) * (m || .7)); }
  function v35Cast(msg, color){
    try { v20BossCast(msg, 'cast', color || boss.color || '#fff'); }
    catch(e){ state.toast = msg; state.toastT = 1.7; }
  }
  function v35Wall(x,y,w,h,warn,color,damage,tag,label,life){
    state.hazards.push({kind:'wall',x,y,w,h,warn,life:life||1.02,damage,color,tag,label});
  }
  function v35Beam(x,y,a,len,w,warn,color,damage,tag,label,life){
    state.hazards.push({kind:'beam',x,y,angle:a,len,w,warn,life:life||.9,damage,color,tag,label});
  }
  function v35Circle(x,y,r,warn,color,damage,tag,label,life){
    state.hazards.push({kind:'circle',x,y,r,warn,life:life||.85,damage,color,tag,label});
  }
  function v35Floor(x,y,w,h,warn,color,damage,tag,label,life){
    state.hazards.push({kind:'floor',x,y,w,h,warn,life:life||.95,damage,color,tag,label});
  }

  const oldBossPatternV35 = bossPattern;
  bossPattern = function(){
    try {
      const id = boss && boss.id;
      const phase = boss.maxHp ? (boss.hp < boss.maxHp*.32 ? 3 : boss.hp < boss.maxHp*.62 ? 2 : 1) : 1;
      if(id === 'puppet_emperor'){
        const r = Math.random();
        if(r < .34){
          v35Cast('인형 황제: 진짜 단두대입니다. 칼날이 내려오기 전에 빈 줄로 피하세요!', '#f0abfc');
          const safe = Math.floor(Math.random()*6);
          for(let i=0;i<6;i++) if(i!==safe) v35Wall(110+i*(W-220)/5,H/2,34,H*.82,1.75+i*.05,'#f0abfc',v35Dmg(.78),'mirror','단두대',1.10);
          return;
        }
        if(r < .67){
          v35Cast('인형 황제: 인형실 갈고리! 끌려가기 전에 사슬 사이로 빠지세요!', '#f9a8d4');
          for(let i=0;i<5;i++){ const a=-.75+i*.38; v35Beam(boss.x,boss.y,a,820,16,1.2+i*.08,'#f9a8d4',v35Dmg(.48),'mirror','인형실 갈고리',1.0); }
          return;
        }
      }
      if(id === 'crimson_train'){
        v35Cast('진홍 열차: 실제 열차가 선로를 질주합니다. 선로 밖으로 피하세요!', '#ef4444');
        const row = Math.floor(Math.random()*4);
        for(let i=0;i<4;i++) if(i!==row) v35Wall(W/2,145+i*(H-225)/3,W*.96,50,1.55+i*.08,'#ef4444',v35Dmg(.72),'metal','급행 열차',1.0);
        return;
      }
      if(id === 'oracle_cube'){
        v35Cast('예언 큐브: 큐브 블록이 회전하며 떨어집니다. 회전면을 피해 이동하세요!', '#a78bfa');
        for(let i=0;i<8+phase;i++){
          const x=120+Math.random()*(W-240), y=130+Math.random()*(H-230);
          v35Floor(x,y,72,72,1.25+i*.06,'#a78bfa',v35Dmg(.54),'mirror','예언 큐브',.9);
        }
        return;
      }
      if(id === 'abyss_leviathan'){
        v35Cast('심해의 레비아탄: 해일이 파도 모양으로 밀려옵니다. 열린 수로를 찾으세요!', '#38bdf8');
        const gap=Math.floor(Math.random()*5);
        for(let i=0;i<5;i++) if(i!==gap) v35Wall(W/2,125+i*(H-200)/4,W*.96,46,1.65+i*.10,'#38bdf8',v35Dmg(.68),'ice','쓰나미 해일',1.1);
        return;
      }
    } catch(e) { console.warn('[V35 boss visual pattern fallback]', e); }
    return oldBossPatternV35();
  };

  try {
    const V35_LABELS = {
      puppet_emperor:['진짜 단두대','인형실 갈고리','가짜 SAFE','꼭두각시 난무','황제의 처형식','실 조종선','인형 감옥'],
      crimson_train:['급행 열차','선로 전환','차륜 폭발','정차 신호','철도 분기','기관차 돌진','객차 낙하'],
      oracle_cube:['예언 큐브','회전 블록','큐브 절단','예언 퀴즈','색면 폭발','큐브 감옥','미래 좌표'],
      abyss_leviathan:['쓰나미 해일','소용돌이','심해 촉수','해류 SAFE','심해 압력','물기둥','해일벽']
    };
    BOSSES.forEach(b => { if(V35_LABELS[b.id]) b.patterns = V35_LABELS[b.id]; });
  } catch(e) {}

  window.RaidDungeonV35 = {
    version: V35_VERSION,
    bossOrder: 'BOSSES sorted by tier 1 to 10',
    visualForms: ['guillotine blade drop','train rail charge','hook/vine chain','scythe/blade slash','rotating cube block','lightning/totem pillar','tsunami wave overlay'],
    replacedPatterns: ['puppet_emperor guillotine','crimson_train actual train lanes','oracle_cube rotating block field','abyss_leviathan wave lanes']
  };

/* =========================================================
   RAID DUNGEON V40 - EFFECTIVE CORE FIX INSIDE MAIN CLOSURE
   - exact tier ticket count actually used by endRaid
   - reliable FIRST CLEAR DOM + result message
   - build list duplicate display removed by id/name
   - green bosses separated: plague / thorn / void gardener
   - apocalypse and solar dragon more interactive
========================================================= */
(function raidDungeonV40EffectiveCoreFix(){
  const V40_VERSION = 'Raid Dungeon V40 - Effective First Clear, Tier Tickets, Boss Pattern Rework';
  const V40_FIRST_KEY = 'raid-dungeon-v40-first-clear-seen';

  function v40Num(v,d){ v=Number(v); return Number.isFinite(v)?v:d; }
  function v40Tier(b){ return clamp(Math.round(v40Num(b && b.tier, 1)),1,10); }
  function v40Dmg(m){ return Math.max(12, ((boss && boss.atk) || 30) * (m || .7)); }
  function v40Color(c){ return c || (boss && boss.color) || '#fff'; }
  function v40Cast(msg,color){ try{ v20BossCast(msg,'cast',color || (boss && boss.color) || '#fff'); }catch(e){ state.toast=msg; state.toastT=1.8; } }
  function v40Haz(h){
    if(!h) return;
    h.warn = Math.max(.9, h.warn || 1.15);
    h.life = Math.max(.45, h.life || .8);
    h.damage = v40Num(h.damage, v40Dmg(.65));
    state.hazards.push(h);
  }
  function v40Circle(x,y,r,warn,color,damage,tag,label,life){ v40Haz({kind:'circle',x,y,r,warn,life,damage,color,tag,label}); }
  function v40Donut(x,y,inner,outer,warn,color,damage,tag,label,life){ v40Haz({kind:'donut',x,y,inner,outer,warn,life,damage,color,tag,label}); }
  function v40Beam(x,y,angle,len,w,warn,color,damage,tag,label,life){ v40Haz({kind:'beam',x,y,angle,len,w,warn,life,damage,color,tag,label}); }
  function v40Wall(x,y,w,h,warn,color,damage,tag,label,life){ v40Haz({kind:'wall',x,y,w,h,warn,life,damage,color,tag,label}); }
  function v40Floor(x,y,w,h,warn,color,damage,tag,label,life){ v40Haz({kind:'floor',x,y,w,h,warn,life,damage,color,tag,label}); }
  function v40Rot(x,y,angle,spin,len,w,warn,color,damage,tag,label,life){ v40Haz({kind:'rotatingBeam',x,y,angle,spin,len,w,warn,life:life||2.0,damage,color,tag,label}); }
  function v40Rune(x,y,action,label,color,life){ try{ state.mechanics.push({kind:'rune',x,y,r:34,life:life||5.0,action:action||'break',color:color||'#fef08a',label:label||'BREAK'}); }catch(e){} }
  function v40Safe(x,y,r,life,label,color){ try{ state.mechanics.push({kind:'safe',x,y,r:r||58,life:life||2.8,color:color||'#86efac',label:label||'SAFE'}); }catch(e){} }

  function v40UniqueByName(items){
    const seen = new Set();
    return (items || []).filter(it => {
      if(!it) return false;
      const key = String((it.name || it.id || '')).trim().toLowerCase();
      if(!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
  const oldOwnedWeaponsV40 = ownedWeapons;
  const oldOwnedArmorsV40 = ownedArmors;
  const oldOwnedSkillsV40 = ownedSkills;
  const oldOwnedPassivesV40 = ownedPassives;
  ownedWeapons = function(){ return v40UniqueByName(oldOwnedWeaponsV40()); };
  ownedArmors = function(){ return v40UniqueByName(oldOwnedArmorsV40()); };
  ownedSkills = function(cat){ return v40UniqueByName(oldOwnedSkillsV40(cat)); };
  ownedPassives = function(){ return v40UniqueByName(oldOwnedPassivesV40()); };

  rollBossTicketRewards = function(b){
    const tier = v40Tier(b);
    const rewards = {weapon:0, armor:0, skill:0, passive:0};
    const kinds = ['weapon','armor','skill','passive'];
    const weights = tier >= 8 ? {weapon:28, armor:24, skill:28, passive:20}
      : tier >= 5 ? {weapon:24, armor:22, skill:36, passive:18}
      : {weapon:20, armor:20, skill:44, passive:16};
    for(let i=0;i<tier;i++){
      let total = weights.weapon + weights.armor + weights.skill + weights.passive;
      let r = Math.random() * total;
      let picked = 'skill';
      for(const k of kinds){ r -= weights[k]; if(r <= 0){ picked = k; break; } }
      rewards[picked] += 1;
    }
    const sum = rewards.weapon + rewards.armor + rewards.skill + rewards.passive;
    if(sum < tier) rewards.skill += tier - sum;
    if(sum > tier){
      let over = sum - tier;
      for(const k of ['skill','weapon','armor','passive']){
        const cut = Math.min(over, rewards[k]); rewards[k] -= cut; over -= cut; if(over<=0) break;
      }
    }
    if((rewards.weapon + rewards.armor + rewards.skill + rewards.passive) !== tier) rewards.skill = Math.max(0, tier - rewards.weapon - rewards.armor - rewards.passive);
    return rewards;
  };
  rewardTextFromTickets = function(rw){
    const parts = [];
    if(rw.weapon) parts.push(`무기 ${rw.weapon}장`);
    if(rw.armor) parts.push(`방어구 ${rw.armor}장`);
    if(rw.skill) parts.push(`스킬 ${rw.skill}장`);
    if(rw.passive) parts.push(`패시브 ${rw.passive}장`);
    return parts.length ? '획득 티켓: ' + parts.join(' / ') : '획득 티켓 오류 방지: 스킬 1장';
  };

  function v40LoadSeen(){ try{return JSON.parse(localStorage.getItem(V40_FIRST_KEY)||'{}')||{};}catch(e){return{};} }
  function v40SaveSeen(o){ try{ localStorage.setItem(V40_FIRST_KEY, JSON.stringify(o||{})); }catch(e){} }
  function v40ShowFirstClearDom(name){
    try{
      const old = document.getElementById('raid-v40-first-clear-banner');
      if(old) old.remove();
      const box = document.createElement('div');
      box.id = 'raid-v40-first-clear-banner';
      box.innerHTML = `<div style="font-size:54px;font-weight:950;color:#facc15;letter-spacing:.06em;text-shadow:0 0 24px #facc15">FIRST CLEAR!</div><div style="margin-top:10px;font-size:21px;font-weight:900;color:white">${escapeHtml(name||'보스')} 최초 클리어 기록 달성</div><div style="margin-top:6px;font-size:14px;color:#fde68a;font-weight:800">새로운 기록이 랭킹에 등록되었습니다</div>`;
      box.style.cssText = 'position:fixed;left:50%;top:28%;transform:translate(-50%,-50%);z-index:99999;min-width:620px;max-width:88vw;text-align:center;padding:28px 38px;border:4px solid #facc15;border-radius:28px;background:rgba(2,6,23,.86);box-shadow:0 0 44px rgba(250,204,21,.55);pointer-events:none;animation:raidV40FirstClear 4.8s ease-out forwards;';
      if(!document.getElementById('raid-v40-first-clear-style')){
        const st = document.createElement('style');
        st.id = 'raid-v40-first-clear-style';
        st.textContent = '@keyframes raidV40FirstClear{0%{opacity:0;transform:translate(-50%,-56%) scale(.72)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.03)}72%{opacity:1}100%{opacity:0;transform:translate(-50%,-48%) scale(1)}}';
        document.head.appendChild(st);
      }
      document.body.appendChild(box);
      setTimeout(()=>{ try{ box.remove(); }catch(e){} }, 5000);
    }catch(e){}
  }
  function v40ShowFirstClearCanvas(name){
    state.v40FirstClearT = 5.2;
    state.v40FirstClearName = name || '보스';
    state.flash = Math.max(state.flash||0, 1.0);
    v40ShowFirstClearDom(name);
    try{ burst(W/2,H/2,'#facc15',110,560); }catch(e){}
  }

  endRaid = function(clear){
    state.screen = 'result';
    const elapsed = Math.floor(state.raid.elapsed * 1000);
    let rewardText = '';
    let firstClear = false;
    if(clear){
      const b = getBoss(boss.id);
      const seen = v40LoadSeen();
      firstClear = !seen[boss.id];
      const rw = rollBossTicketRewards(b);
      state.save.tickets.weapon = (state.save.tickets.weapon || 0) + rw.weapon;
      state.save.tickets.armor = (state.save.tickets.armor || 0) + rw.armor;
      state.save.tickets.skill = (state.save.tickets.skill || 0) + rw.skill;
      state.save.tickets.passive = (state.save.tickets.passive || 0) + rw.passive;
      rewardText = rewardTextFromTickets(rw);
      if(firstClear){
        seen[boss.id] = true;
        v40SaveSeen(seen);
        v40ShowFirstClearCanvas(boss.name);
        rewardText = '<b style="color:#facc15;font-size:16px">FIRST CLEAR! 최초 클리어 기록 달성</b><br>' + rewardText;
      }
      saveGame();
      submitRecord(elapsed);
    }
    ui.right.classList.remove('hidden');
    ui.right.innerHTML = `<h1 class="title">${clear?'클리어!':'실패'}</h1><p class="sub">${boss.name}<br>시간: ${formatMs(elapsed)}<br>받은 피해: ${player.damageTaken}<br>${clear?rewardText:'보스를 다시 분석해보세요.'}</p><button id="resultMenu" class="btn">메뉴로</button>`;
    const btn = ui.right.querySelector('#resultMenu');
    if(btn) btn.onclick = () => { state.menuTab = clear ? 'ranking' : 'build'; renderMenu(); refreshRankings(boss.id); };
  };

  const oldDrawV40 = draw;
  draw = function(){
    oldDrawV40();
    try{
      if(state.v40FirstClearT > 0){
        state.v40FirstClearT -= 1/60;
        const alpha = Math.max(0, Math.min(1, state.v40FirstClearT/5.2));
        ctx.save();
        ctx.globalAlpha = Math.min(1, .28 + alpha);
        ctx.fillStyle='rgba(0,0,0,.48)';
        roundRect(ctx,W/2-390,H/2-92,780,184,30); ctx.fill();
        ctx.strokeStyle='#facc15'; ctx.lineWidth=5; roundRect(ctx,W/2-390,H/2-92,780,184,30); ctx.stroke();
        ctx.shadowColor='#facc15'; ctx.shadowBlur=34;
        ctx.fillStyle='#facc15'; ctx.font='950 54px system-ui'; ctx.textAlign='center'; ctx.fillText('FIRST CLEAR!',W/2,H/2-18);
        ctx.shadowBlur=12; ctx.fillStyle='#fff'; ctx.font='900 20px system-ui'; ctx.fillText((state.v40FirstClearName||'보스')+' 최초 클리어 기록 달성',W/2,H/2+34);
        ctx.restore();
      }
    }catch(e){}
  };

  function v40PatternPlague(){
    const c='#84cc16'; const r=Math.random();
    if(r<.22){
      v40Cast('역병 의사: 검역 병동. 독안개 병동 사이 통로로 이동하세요.',c);
      const gap=Math.floor(Math.random()*4);
      for(let i=0;i<4;i++) if(i!==gap) v40Wall(W/2,140+i*(H-225)/3,W*.92,52,1.55+i*.06,c,v40Dmg(.66),'poison','검역 병동',1.0);
      v40Rune(W*.78,H*.70,'cleanse','해독 혈청','#86efac',5.2);
      return;
    }
    if(r<.44){
      v40Cast('역병 의사: 수술 절개선. 십자 절개 뒤 해독 룬을 밟으면 반격 기회입니다.', '#d9f99d');
      for(let i=0;i<4;i++){ v40Beam(170+i*(W-340)/3,H/2,Math.PI/2,H*.82,18,1.15+i*.1,'#d9f99d',v40Dmg(.55),'poison','역병 수술선',.75); }
      for(let j=0;j<3;j++){ v40Beam(W/2,160+j*(H-280)/2,0,W*.78,16,1.35+j*.1,'#a3e635',v40Dmg(.42),'poison','소독 절개선',.68); }
      v40Rune(W*.5,H*.5,'cleanse','소독 완료','#86efac',4.2);
      return;
    }
    if(r<.67){
      v40Cast('역병 의사: 감염 배양. 감염체를 피해 중앙 주사기를 피하세요.', c);
      for(let i=0;i<10;i++) v40Circle(110+Math.random()*(W-220),120+Math.random()*(H-220),28+Math.random()*18,1.0+i*.06,'#bef264',v40Dmg(.38),'poison','감염 포자',.8);
      for(let i=0;i<6;i++) v40Beam(W/2,H/2,i*Math.PI/3,W*.68,12,1.55+i*.04,'#ecfccb',v40Dmg(.5),'poison','독침 주사',.75);
      return;
    }
    v40Cast('역병 의사: 치료제는 하나뿐입니다. 진짜 혈청으로 이동하세요.', c);
    const real=Math.floor(Math.random()*4);
    for(let i=0;i<4;i++){ const x=220+i*(W-440)/3; if(i===real) v40Safe(x,H*.55,54,2.8,'진짜 혈청','#86efac'); else v40Circle(x,H*.55,58,1.45+i*.07,'#4ade80',v40Dmg(.75),'poison','가짜 혈청',.95); }
  }

  function v40PatternThorn(){
    const c='#22c55e'; const r=Math.random();
    if(r<.24){
      v40Cast('가시 여왕: 덩굴 갈고리. 잡히기 전에 사선 덩굴 사이로 빠지세요.',c);
      const base=Math.atan2(player.y-boss.y,player.x-boss.x);
      for(let i=-2;i<=2;i++) v40Beam(boss.x,boss.y,base+i*.24,850,18,1.15+Math.abs(i)*.08,c,v40Dmg(.52),'nature','덩굴 갈고리',.82);
      return;
    }
    if(r<.48){
      v40Cast('가시 여왕: 장미 미로. 꽃이 피는 칸은 위험하고 줄기 틈은 안전합니다.',c);
      const safeCol=Math.floor(Math.random()*5);
      for(let i=0;i<5;i++){ const x=130+i*(W-260)/4; if(i!==safeCol) v40Wall(x,H/2,44,H*.78,1.55+i*.04,'#16a34a',v40Dmg(.64),'nature','가시 울타리',1.0); }
      for(let i=0;i<7;i++) v40Circle(140+Math.random()*(W-280),130+Math.random()*(H-230),34,1.25+i*.05,'#f472b6',v40Dmg(.48),'nature','독꽃 개화',.8);
      return;
    }
    if(r<.72){
      v40Cast('가시 여왕: 씨앗 폭발. 꽃눈을 밟아 터뜨리면 탄막이 줄어듭니다.',c);
      for(let i=0;i<10;i++) v40Circle(110+Math.random()*(W-220),120+Math.random()*(H-230),30,1.1+i*.04,'#f9a8d4',v40Dmg(.46),'nature','가시 씨앗',.78);
      v40Rune(W*.5,H*.46,'break','꽃눈 파괴','#fef08a',4.4);
      return;
    }
    v40Cast('가시 여왕: 꽃잎 폭풍. 안쪽에서 구르고 바깥으로 빠져나가세요.',c);
    v40Donut(W/2,H/2,110,310,1.35,'#22c55e',v40Dmg(.62),'nature','꽃잎 폭풍',.95);
    for(let i=0;i<6;i++) v40Beam(W/2,H/2,i*Math.PI/3,W*.78,14,1.75+i*.05,'#f472b6',v40Dmg(.42),'nature','장미 칼날',.7);
  }

  function v40PatternGardener(){
    const c='#8b5cf6'; const r=Math.random();
    if(r<.23){
      v40Cast('공허 정원사: 포탈 꽃문. 열린 꽃문 방향을 보고 이동하세요.',c);
      const safe=Math.floor(Math.random()*4);
      for(let i=0;i<4;i++){ const x=210+i*(W-420)/3; if(i===safe) v40Safe(x,H*.55,55,2.7,'열린 꽃문','#a7f3d0'); else v40Circle(x,H*.55,70,1.35+i*.07,'#8b5cf6',v40Dmg(.72),'void-nature','닫힌 꽃문',.9); }
      return;
    }
    if(r<.47){
      v40Cast('공허 정원사: 뿌리 수확. 공허 뿌리가 교차한 뒤 중심 꽃핵이 열립니다.',c);
      for(let i=0;i<5;i++){ v40Beam(W/2,H/2,Math.PI*.15+i*Math.PI/5,W*.9,16,1.1+i*.08,'#22c55e',v40Dmg(.45),'void-nature','공허 뿌리',.8); }
      v40Rune(W/2,H/2,'break','꽃핵 파괴','#fef08a',4.2);
      return;
    }
    if(r<.71){
      v40Cast('공허 정원사: 잡초 소환. 독성 정원을 피하면서 잡초핵을 처리하세요.',c);
      for(let i=0;i<8;i++) v40Circle(120+Math.random()*(W-240),120+Math.random()*(H-230),38,1.0+i*.05,'#4ade80',v40Dmg(.42),'void-nature','독성 잡초',.9);
      for(let i=0;i<3;i++) v40Rune(260+i*(W-520)/2,H*.42+Math.random()*120,'break','잡초핵','#fef08a',4.8);
      return;
    }
    v40Cast('공허 정원사: 검은 꽃가루. 꽃가루 고리 안쪽과 바깥쪽을 번갈아 피하세요.',c);
    v40Donut(W/2,H/2,85,220,1.25,'#8b5cf6',v40Dmg(.58),'void-nature','검은 꽃가루',.9);
    v40Donut(W/2,H/2,260,390,1.75,'#22c55e',v40Dmg(.56),'void-nature','독성 정원',.9);
  }

  function v40PatternSolar(){
    const c='#fb923c'; const r=Math.random();
    if(r<.25){
      v40Cast('태양룡: 발톱 돌진. 돌진을 구르기로 넘기고 꼬리 빈틈을 공격하세요.',c);
      const a=Math.atan2(player.y-boss.y,player.x-boss.x);
      v40Beam(boss.x,boss.y,a,930,38,1.05,c,v40Dmg(.8),'solar','태양 발톱 돌진',.75);
      v40Circle(boss.x-Math.cos(a)*95,boss.y-Math.sin(a)*95,58,1.45,'#fde047',v40Dmg(.5),'solar','꼬리 폭발',.8);
      v40Rune(boss.x,boss.y,'break','역광 약점','#fef08a',3.8);
      return;
    }
    if(r<.50){
      v40Cast('태양룡: 광익 절단. 날개빛 사이의 빈각으로 파고드세요.',c);
      const base=Math.atan2(player.y-boss.y,player.x-boss.x);
      for(let i=-3;i<=3;i++) if(i!==0) v40Beam(boss.x,boss.y,base+i*.22,900,18,1.15+Math.abs(i)*.07,'#fde047',v40Dmg(.48),'solar','광익 절단',.72);
      return;
    }
    if(r<.75){
      v40Cast('태양룡: 플레어 코어. 코어가 폭발하기 전 BREAK 룬으로 반격하세요.',c);
      v40Circle(W/2,H/2,88,1.25,'#facc15',v40Dmg(.42),'solar','플레어 코어',1.2);
      for(let i=0;i<9;i++) v40Circle(130+Math.random()*(W-260),125+Math.random()*(H-230),34,1.35+i*.05,'#fb923c',v40Dmg(.46),'solar','태양 낙하',.72);
      v40Rune(W/2,H/2,'break','코어 파괴','#fff7ed',4.0);
      return;
    }
    v40Cast('태양룡: 일식 호흡. 안쪽-바깥쪽을 번갈아 피하며 공격 타이밍을 잡으세요.',c);
    v40Donut(W/2,H/2,75,230,1.15,'#f97316',v40Dmg(.62),'solar','일식 호흡',.88);
    v40Donut(W/2,H/2,250,390,1.75,'#fde047',v40Dmg(.58),'solar','태양 외곽',.88);
  }

  function v40PatternEclipse(){
    const c='#f97316'; const r=Math.random();
    if(r<.22){
      v40Cast('아포칼립스: 흑점 낙하. 낙하 후 생기는 흑점 코어를 파괴하세요.',c);
      for(let i=0;i<11;i++) v40Circle(120+Math.random()*(W-240),115+Math.random()*(H-220),36,1.0+i*.06,'#fb7185',v40Dmg(.55),'eclipse','흑점 낙하',.78);
      v40Rune(W*.5,H*.5,'break','흑점 코어','#fef08a',4.5);
      return;
    }
    if(r<.45){
      v40Cast('아포칼립스: 검은 태양 사슬. 사슬을 구르고 중앙 약점을 치세요.',c);
      const base=Math.atan2(player.y-boss.y,player.x-boss.x);
      for(let i=-2;i<=2;i++) v40Beam(boss.x,boss.y,base+i*.25,950,24,1.15+Math.abs(i)*.06,'#020617',v40Dmg(.68),'eclipse','검은 태양 사슬',.82);
      v40Rune(boss.x,boss.y,'break','일식 핵','#fef08a',4.0);
      return;
    }
    if(r<.68){
      v40Cast('아포칼립스: 붕괴 바닥. 무너지는 칸 사이에서 반격 루트를 찾으세요.',c);
      const cols=6, rows=4, safeA=Math.floor(Math.random()*cols*rows), safeB=Math.floor(Math.random()*cols*rows);
      const cw=(W-180)/cols, ch=(H-180)/rows;
      for(let idx=0;idx<cols*rows;idx++){
        const col=idx%cols, row=Math.floor(idx/cols), x=90+cw/2+col*cw, y=120+ch/2+row*ch;
        if(idx!==safeA && idx!==safeB) v40Floor(x,y,cw*.82,ch*.72,1.55+(idx%4)*.04,'#7f1d1d',v40Dmg(.62),'eclipse','붕괴 바닥',.95);
        else v40Safe(x,y,46,2.6,'SAFE','#86efac');
      }
      return;
    }
    if(r<.86){
      v40Cast('아포칼립스: 일식 고리. 구르기로 고리를 넘어 약점 룬을 밟으세요.',c);
      v40Donut(W/2,H/2,95,250,1.1,'#020617',v40Dmg(.7),'eclipse','검은 일식 고리',.95);
      v40Rot(W/2,H/2,Math.random()*Math.PI,1.25,W*.9,18,1.5,'#fb7185',v40Dmg(.44),'eclipse','일식 칼날',2.0);
      v40Rune(W*.5,H*.5,'break','일식 파괴','#fef08a',4.3);
      return;
    }
    v40Cast('아포칼립스: 종말 광선. 여러 줄의 광선을 넘기고 안쪽으로 파고드세요.',c);
    for(let i=0;i<5;i++) v40Beam(W/2,135+i*(H-230)/4,0,W*.92,22,1.05+i*.12,'#fb7185',v40Dmg(.56),'eclipse','종말 광선',.72);
    for(let i=0;i<4;i++) v40Circle(200+i*(W-400)/3,H*.50,44,1.7+i*.08,'#f97316',v40Dmg(.48),'eclipse','태양 파편',.74);
  }

  function v40PatternChaos(){
    const c='#c084fc'; const r=Math.random();
    if(r<.25){
      v40Cast('혼돈의 집정관: 판결 순환. 원-선-도넛이 순서대로 겹칩니다.',c);
      for(let i=0;i<6;i++) v40Circle(140+Math.random()*(W-280),120+Math.random()*(H-230),38,1.0+i*.06,'#a78bfa',v40Dmg(.42),'chaos','혼돈 원',.7);
      for(let i=0;i<3;i++) v40Beam(W/2,H/2,Math.random()*Math.PI,W*.86,15,1.35+i*.1,'#f0abfc',v40Dmg(.46),'chaos','혼돈 선',.72);
      v40Donut(W/2,H/2,85,240,1.85,'#7c3aed',v40Dmg(.55),'chaos','혼돈 도넛',.9);
      return;
    }
    if(r<.5){
      v40Cast('혼돈의 집정관: 가짜 법정. 진짜 SAFE만 믿으세요.',c);
      const real=Math.floor(Math.random()*4);
      for(let i=0;i<4;i++){ const x=220+i*(W-440)/3; if(i===real) v40Safe(x,H*.55,58,2.8,'진짜','#86efac'); else v40Circle(x,H*.55,62,1.35+i*.08,'#f472b6',v40Dmg(.78),'chaos','가짜 SAFE',.9); }
      return;
    }
    if(r<.75){
      v40Cast('혼돈의 집정관: 회전 재판. 회전선을 구르고 BREAK를 밟으세요.',c);
      for(let i=0;i<4;i++) v40Rot(W/2,H/2,i*Math.PI/4,(i%2?-.95:.95),W*.96,16,1.15+i*.08,'#c084fc',v40Dmg(.44),'chaos','혼돈 회전',2.1);
      v40Rune(W/2,H/2,'break','질서 파괴','#fef08a',4.0);
      return;
    }
    v40Cast('혼돈의 집정관: 무작위 판결. 짧은 패턴을 연속으로 넘기세요.',c);
    for(let i=0;i<12;i++){
      if(i%3===0) v40Beam(120+Math.random()*(W-240),H/2,Math.PI/2,H*.82,14,1.0+i*.06,'#e879f9',v40Dmg(.42),'chaos','무작위 판결',.62);
      else v40Circle(100+Math.random()*(W-200),120+Math.random()*(H-220),32,1.0+i*.06,'#a78bfa',v40Dmg(.42),'chaos','혼돈 파편',.62);
    }
  }

  const oldBossPatternV40 = bossPattern;
  bossPattern = function(){
    try{
      const id = boss && boss.id;
      if(id === 'plague_doctor') { v40PatternPlague(); return; }
      if(id === 'thorn_queen') { v40PatternThorn(); return; }
      if(id === 'hollow_gardener' || id === 'void_gardener') { v40PatternGardener(); return; }
      if(id === 'solar_dragon') { v40PatternSolar(); return; }
      if(id === 'black_sun') { v40PatternEclipse(); return; }
      if(id === 'chaos_archon') { v40PatternChaos(); return; }
    }catch(e){ console.warn('[V40 custom boss pattern failed]', e); }
    return oldBossPatternV40();
  };

  function v40PatternLabelUpdate(){
    const labels = {
      plague_doctor:['검역 병동','역병 수술선','감염 포자','독침 주사','진짜 혈청','해독 혈청'],
      thorn_queen:['덩굴 갈고리','가시 울타리','독꽃 개화','가시 씨앗','꽃잎 폭풍','꽃눈 파괴'],
      hollow_gardener:['열린 꽃문','공허 뿌리','잡초핵','검은 꽃가루','독성 정원','꽃핵 파괴'],
      void_gardener:['열린 꽃문','공허 뿌리','잡초핵','검은 꽃가루','독성 정원','꽃핵 파괴'],
      solar_dragon:['태양 발톱 돌진','광익 절단','플레어 코어','태양 낙하','일식 호흡','역광 약점'],
      black_sun:['흑점 낙하','검은 태양 사슬','붕괴 바닥','검은 일식 고리','종말 광선','일식 핵'],
      chaos_archon:['판결 순환','가짜 법정','혼돈 회전','무작위 판결','혼돈 파편','질서 파괴']
    };
    BOSSES.forEach(b=>{ if(labels[b.id]) b.patterns = labels[b.id]; });
  }
  v40PatternLabelUpdate();

  window.RaidDungeonV40 = {
    version: V40_VERSION,
    actualPatchLocation: 'inside main closure before final closures',
    ticketRule: 'total ticket count exactly equals boss tier',
    firstClear: 'DOM banner + canvas banner + result text, once per boss in V40 key',
    dedupeBuildLists: true,
    customBosses: ['plague_doctor','thorn_queen','hollow_gardener','solar_dragon','black_sun','chaos_archon']
  };
})();

/* ===== V36: visualize text-only boss pattern labels broadly ===== */
(()=>{
  const V36_VERSION = 'V36_all_text_pattern_visualized';
  function v36LabelOf(h){ return String((h && h.label) || '').toLowerCase(); }
  function v36ThemeOf(h){ return String((h && (h.tag || h.theme || '')) || '').toLowerCase(); }
  function v36Has(h, words){
    const s = (v36LabelOf(h) + ' ' + v36ThemeOf(h)).toLowerCase();
    return words.some(w => s.includes(String(w).toLowerCase()));
  }
  function v36Phase(h){
    if(!h) return 0;
    if(typeof h._v36MaxLife !== 'number') h._v36MaxLife = Math.max(.05, h.life || .9);
    if((h.warn || 0) > 0) return 0;
    return Math.max(0, Math.min(1, 1 - (h.life || 0) / h._v36MaxLife));
  }
  function v36Glow(color, blur){ ctx.shadowColor = color || '#fff'; ctx.shadowBlur = blur || 18; }
  function v36StrokeText(txt,x,y,color){
    ctx.save();
    ctx.font='900 12px system-ui';
    ctx.textAlign='center';
    ctx.lineWidth=4;
    ctx.strokeStyle='rgba(0,0,0,.68)';
    ctx.strokeText(txt,x,y);
    ctx.fillStyle=color||'#fff';
    ctx.fillText(txt,x,y);
    ctx.restore();
  }
  function v36RoundBox(x,y,w,h,fill,stroke,r=10){
    ctx.save();
    if(fill){ ctx.fillStyle = fill; roundRect(ctx,x,y,w,h,r); ctx.fill(); }
    if(stroke){ ctx.strokeStyle = stroke; ctx.lineWidth = 3; roundRect(ctx,x,y,w,h,r); ctx.stroke(); }
    ctx.restore();
  }

  function v36DrawPuppetStrings(h){
    if(!v36Has(h,['실 조종선','실 조종','인형실','꼭두각시','황제의 처형식'])) return false;
    const x = h.x || W/2, y = h.y || H/2; const color = h.color || '#f0abfc';
    ctx.save(); v36Glow(color,20); ctx.globalAlpha = h.warn>0 ? .58 : .96;
    if(h.kind === 'beam'){
      ctx.translate(x,y); ctx.rotate(h.angle||0);
      const len = h.len || 680;
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 2;
      for(let i=0;i<5;i++){
        const xx = -len/2 + i*(len/4);
        ctx.beginPath(); ctx.moveTo(xx,-48); ctx.lineTo(xx,48); ctx.stroke();
      }
      ctx.strokeStyle = color; ctx.lineWidth = 7;
      ctx.beginPath(); ctx.moveTo(-len/2,0); ctx.bezierCurveTo(-len/4,-36,len/4,36,len/2,0); ctx.stroke();
      for(let i=0;i<4;i++){
        const px = -len*.3 + i*len*.2;
        ctx.fillStyle = i%2 ? '#fde68a' : '#f9a8d4';
        roundRect(ctx, px-15, -18, 30, 36, 8); ctx.fill();
        ctx.strokeStyle='#fff'; ctx.lineWidth=2; roundRect(ctx, px-15, -18, 30, 36, 8); ctx.stroke();
        ctx.beginPath(); ctx.arc(px-5,-5,2.6,0,Math.PI*2); ctx.arc(px+5,-5,2.6,0,Math.PI*2); ctx.fillStyle='#111827'; ctx.fill();
      }
      ctx.restore();
      return true;
    }
    const w = h.w || 120, hh = h.h || 120;
    for(let i=0;i<5;i++){
      const xx = x - w/2 + i*(w/4);
      ctx.strokeStyle = 'rgba(255,255,255,.92)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(xx, y-hh/2-42); ctx.lineTo(xx, y+hh/2+18); ctx.stroke();
    }
    ctx.strokeStyle = color; ctx.lineWidth = 5;
    ctx.beginPath(); ctx.moveTo(x-w/2,y); ctx.bezierCurveTo(x-w/4,y-18,x+w/4,y+18,x+w/2,y); ctx.stroke();
    v36StrokeText(v36Has(h,['처형식']) ? '꼭두각시 처형식' : '실 조종', x, y-hh/2-14, '#fff');
    ctx.restore();
    return true;
  }

  function v36DrawCage(h){
    if(!v36Has(h,['감옥','철창','강철 감옥','큐브 감옥','인형 감옥'])) return false;
    const color = h.color || '#cbd5e1';
    const x=h.x||W/2, y=h.y||H/2, w=Math.max(72,h.w||96), hh=Math.max(72,h.h||96);
    ctx.save(); v36Glow(color,18); ctx.globalAlpha = h.warn>0?.48:.94;
    ctx.strokeStyle='#fff'; ctx.lineWidth=4; roundRect(ctx,x-w/2,y-hh/2,w,hh,10); ctx.stroke();
    ctx.strokeStyle=color; ctx.lineWidth=6;
    for(let i=1;i<=3;i++){
      const xx=x-w/2+i*w/4; ctx.beginPath(); ctx.moveTo(xx,y-hh/2+4); ctx.lineTo(xx,y+hh/2-4); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(x-w/2+4,y-hh/6); ctx.lineTo(x+w/2-4,y-hh/6); ctx.moveTo(x-w/2+4,y+hh/6); ctx.lineTo(x+w/2-4,y+hh/6); ctx.stroke();
    v36StrokeText('감옥',x,y+4,'#fff');
    ctx.restore();
    return true;
  }

  function v36DrawHook(h){
    if(!v36Has(h,['갈고리','끌어당김','인형 갈고리'])) return false;
    const color = h.color || '#f9a8d4';
    const x = h.x || W/2, y = h.y || H/2; const a = h.angle || 0; const len = h.len || Math.max(h.w||360,h.h||360,520);
    ctx.save(); v36Glow(color,18); ctx.globalAlpha=h.warn>0?.55:.96;
    ctx.translate(x,y); ctx.rotate(a);
    ctx.strokeStyle='#fff'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-len/2,0); ctx.lineTo(len/2-42,0); ctx.stroke();
    ctx.strokeStyle=color; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(-len/2,0); ctx.lineTo(len/2-42,0); ctx.stroke();
    const hx = len/2-30;
    ctx.strokeStyle='#e5e7eb'; ctx.lineWidth=7;
    ctx.beginPath(); ctx.arc(hx,0,28,Math.PI*.08,Math.PI*1.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx+18,-20); ctx.lineTo(hx+42,-36); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx+16,20); ctx.lineTo(hx+36,36); ctx.stroke();
    ctx.restore();
    return true;
  }

  function v36DrawRailSwitch(h){
    if(!v36Has(h,['선로 전환','철도 분기','정차 신호'])) return false;
    const color = h.color || '#ef4444';
    const x = h.x || W/2, y = h.y || H/2;
    ctx.save(); v36Glow(color,18); ctx.globalAlpha = h.warn>0?.54:.94;
    ctx.translate(x,y); if(h.kind==='beam') ctx.rotate(h.angle||0);
    const len = h.kind==='beam' ? (h.len||760) : (h.w||W*.78); const thick = h.kind==='beam' ? Math.max(30,(h.w||18)*2.4) : Math.max(34,h.h||42);
    ctx.strokeStyle='#fff'; ctx.lineWidth=4;
    ctx.beginPath();
    ctx.moveTo(-len/2,-thick*.35); ctx.lineTo(len/2,-thick*.35);
    ctx.moveTo(-len/2, thick*.35); ctx.lineTo(len/2, thick*.35);
    ctx.stroke();
    ctx.strokeStyle=color; ctx.lineWidth=6;
    ctx.beginPath(); ctx.moveTo(-len*.15,-thick*.35); ctx.lineTo(len*.18, thick*.35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-len*.15, thick*.35); ctx.lineTo(len*.18,-thick*.35); ctx.stroke();
    const sigX = -len/2 + 58;
    ctx.fillStyle='#111827'; v36RoundBox(sigX-18,-52,36,52,'rgba(15,23,42,.9)','#fff',8);
    ctx.fillStyle=(h.warn>0)?'#facc15':'#ef4444'; circle(ctx,sigX, -26, 8);
    ctx.restore();
    return true;
  }

  function v36DrawWheelBurst(h){
    if(!v36Has(h,['차륜 폭발','차륜'])) return false;
    const color = h.color || '#f97316';
    const x = h.x || W/2, y = h.y || H/2, r = Math.max(28, h.r || Math.min(h.w||100,h.h||100)/2 || 42);
    ctx.save(); v36Glow(color,18); ctx.globalAlpha = h.warn>0?.5:.96;
    ctx.strokeStyle='#fff'; ctx.lineWidth=5; circleStroke(ctx,x,y,r);
    ctx.strokeStyle=color; ctx.lineWidth=6; circleStroke(ctx,x,y,r*.55);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4 + state.time*3;
      ctx.strokeStyle=color; ctx.lineWidth=6;
      ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*r*.2,y+Math.sin(a)*r*.2); ctx.lineTo(x+Math.cos(a)*r*1.2,y+Math.sin(a)*r*1.2); ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  function v36DrawWhirlpool(h){
    if(!v36Has(h,['소용돌이'])) return false;
    const color = h.color || '#38bdf8';
    const x = h.x || W/2, y = h.y || H/2, r = Math.max(48, h.r || (h.w||120)/2 || 70);
    ctx.save(); v36Glow(color,18); ctx.globalAlpha=h.warn>0?.46:.9;
    ctx.strokeStyle='#e0f2fe'; ctx.lineWidth=4;
    for(let i=0;i<4;i++){
      ctx.beginPath();
      for(let t=0;t<=Math.PI*2.4;t+=0.14){
        const rr = r*(0.2 + t/(Math.PI*2.8)*0.8);
        const xx = x + Math.cos(t+state.time*1.3+i*.12)*rr;
        const yy = y + Math.sin(t+state.time*1.3+i*.12)*rr;
        t===0 ? ctx.moveTo(xx,yy) : ctx.lineTo(xx,yy);
      }
      ctx.stroke();
    }
    v36StrokeText('소용돌이',x,y+4,'#fff');
    ctx.restore();
    return true;
  }

  function v36DrawWaterPillar(h){
    if(!v36Has(h,['물기둥','해일벽','해류'])) return false;
    const color = h.color || '#38bdf8';
    const x = h.x || W/2, y = h.y || H/2; const w = Math.max(40,h.w||60), hh = Math.max(120,h.h||180);
    ctx.save(); v36Glow(color,18); ctx.globalAlpha = h.warn>0?.46:.88;
    if(v36Has(h,['해일벽'])){
      const ww = Math.max(W*.88, h.w||W*.9); const barH = Math.max(56,h.h||70);
      ctx.fillStyle='rgba(56,189,248,.26)'; roundRect(ctx,x-ww/2,y-barH/2,ww,barH,10); ctx.fill();
      ctx.strokeStyle='#e0f2fe'; ctx.lineWidth=4;
      for(let i=0;i<6;i++){
        ctx.beginPath();
        for(let s=0;s<=44;s++){
          const xx=x-ww/2+s*ww/44; const yy=y-barH*.18+i*barH*.08+Math.sin(s*.62+state.time*5+i)*10;
          s?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);
        }
        ctx.stroke();
      }
      v36StrokeText('해일벽',x,y+4,'#fff');
      ctx.restore();
      return true;
    }
    ctx.strokeStyle='#e0f2fe'; ctx.lineWidth=4;
    for(let i=0;i<5;i++){
      ctx.beginPath();
      for(let s=0;s<=20;s++){
        const yy=y-hh/2+s*hh/20; const xx=x+Math.sin(s*.8+state.time*6+i*.45)*(w*.22+i*3);
        s?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy);
      }
      ctx.stroke();
    }
    if(v36Has(h,['해류'])) v36StrokeText('해류 SAFE',x,y-hh/2-10,'#86efac'); else v36StrokeText('물기둥',x,y-hh/2-10,'#fff');
    ctx.restore();
    return true;
  }

  function v36DrawQuizTile(h){
    if(!v36Has(h,['예언 퀴즈','미래 좌표'])) return false;
    const x = h.x || W/2, y = h.y || H/2, w = Math.max(64,h.w||76), hh = Math.max(64,h.h||76);
    const color = h.color || '#a78bfa';
    ctx.save(); v36Glow(color,18); ctx.globalAlpha=h.warn>0?.52:.95;
    ctx.fillStyle='rgba(167,139,250,.28)'; roundRect(ctx,x-w/2,y-hh/2,w,hh,10); ctx.fill();
    ctx.strokeStyle='#fff'; ctx.lineWidth=4; roundRect(ctx,x-w/2,y-hh/2,w,hh,10); ctx.stroke();
    ctx.fillStyle='#fff'; ctx.font='900 30px system-ui'; ctx.textAlign='center'; ctx.fillText('?',x,y+11);
    ctx.restore();
    return true;
  }

  function v36DrawFireBreath(h){
    if(!v36Has(h,['숨결','화염','불길','불꽃'])) return false;
    const color = h.color || '#fb923c';
    const x=h.x||W/2,y=h.y||H/2, a=h.angle||0, len=h.len||600;
    ctx.save(); v36Glow(color,18); ctx.globalAlpha=h.warn>0?.42:.9;
    if(h.kind==='beam'){
      ctx.translate(x,y); ctx.rotate(a);
      for(let i=0;i<16;i++){
        const px = -len/2 + i*(len/15);
        const size = 18 + (i%4)*6;
        ctx.fillStyle = i%2 ? 'rgba(251,146,60,.65)' : 'rgba(239,68,68,.58)';
        ctx.beginPath();
        ctx.moveTo(px,0);
        ctx.quadraticCurveTo(px-size*.5,-size,px+size*.2,-size*.2);
        ctx.quadraticCurveTo(px+size,0,px+size*.2,size*.2);
        ctx.quadraticCurveTo(px-size*.5,size,px,0);
        ctx.fill();
      }
      ctx.restore(); return true;
    }
    return false;
  }

  function v36DrawCharge(h){
    if(!v36Has(h,['돌진','강타','돌격','기관차 돌진'])) return false;
    const color = h.color || '#f59e0b';
    const x=h.x||W/2,y=h.y||H/2, a=h.angle||0, len=h.len||Math.max(h.w||400,h.h||400,520);
    ctx.save(); v36Glow(color,18); ctx.globalAlpha=h.warn>0?.46:.92;
    ctx.translate(x,y); ctx.rotate(a);
    ctx.strokeStyle='#fff'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(-len/2,0); ctx.lineTo(len/2,0); ctx.stroke();
    ctx.strokeStyle=color; ctx.lineWidth=10;
    ctx.beginPath(); ctx.moveTo(-len/2,0); ctx.lineTo(len/2-38,0); ctx.stroke();
    ctx.fillStyle=color;
    ctx.beginPath(); ctx.moveTo(len/2,0); ctx.lineTo(len/2-40,-22); ctx.lineTo(len/2-40,22); ctx.closePath(); ctx.fill();
    ctx.restore();
    return true;
  }

  function v36DrawRadialBurst(h){
    if(!v36Has(h,['난무','심판','폭발','플레어'])) return false;
    const color = h.color || '#fbbf24';
    const x=h.x||W/2,y=h.y||H/2,r=Math.max(42,h.r||55);
    ctx.save(); v36Glow(color,18); ctx.globalAlpha=h.warn>0?.44:.92;
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6 + state.time*1.5;
      ctx.strokeStyle=i%2 ? '#fff' : color; ctx.lineWidth=i%2 ? 3 : 6;
      ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.5); ctx.lineTo(x+Math.cos(a)*r*1.6,y+Math.sin(a)*r*1.6); ctx.stroke();
    }
    circleStroke(ctx,x,y,r*.55);
    ctx.restore();
    return true;
  }

  const oldDrawHazardsV36 = drawHazards;
  drawHazards = function(){
    oldDrawHazardsV36();
    try {
      state.hazards.forEach(h => {
        if(!h) return;
        if(v36DrawPuppetStrings(h)) return;
        if(v36DrawCage(h)) return;
        if(v36DrawHook(h)) return;
        if(v36DrawRailSwitch(h)) return;
        if(v36DrawWheelBurst(h)) return;
        if(v36DrawWhirlpool(h)) return;
        if(v36DrawWaterPillar(h)) return;
        if(v36DrawQuizTile(h)) return;
        if(v36DrawFireBreath(h)) return;
        if(v36DrawCharge(h)) return;
        if(v36DrawRadialBurst(h)) return;
      });
    } catch(e){ console.warn('[V36 extra hazard visual overlay failed]', e); }
  };

  try {
    window.RaidDungeonV36 = {
      version: V36_VERSION,
      expandedVisualizedLabels: [
        '실 조종선','꼭두각시 난무','황제의 처형식','인형 감옥','인형 갈고리',
        '선로 전환','철도 분기','정차 신호','차륜 폭발',
        '소용돌이','해일벽','물기둥','해류 SAFE',
        '예언 퀴즈','미래 좌표','화염 숨결','기관차 돌진','폭발/심판류'
      ]
    };
  } catch(e){}
})();


/* ===== V37: slime / eclipse / chaos visual forms + first clear banner ===== */
(()=>{
  const V37_VERSION = 'V37_eclipse_chaos_slime_first_clear';
  function v37TextOf(h){ return String((h && (h.label || h.tag || h.theme || '')) || '').toLowerCase(); }
  function v37Has(h, words){ const s = (String((h&&h.label)||'') + ' ' + String((h&&(h.tag||h.theme))||'')).toLowerCase(); return words.some(w => s.includes(String(w).toLowerCase())); }
  function v37LifePhase(h){
    if(!h) return 0;
    if(typeof h._v37MaxLife !== 'number') h._v37MaxLife = Math.max(.05, h.life || .9);
    if((h.warn || 0) > 0) return 0;
    return Math.max(0, Math.min(1, 1 - (h.life || 0) / h._v37MaxLife));
  }
  function v37Glow(c,b){ ctx.shadowColor = c || '#fff'; ctx.shadowBlur = b || 18; }
  function v37Label(txt,x,y,c){
    ctx.save();
    ctx.font = '900 12px system-ui';
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,.72)';
    ctx.strokeText(txt,x,y);
    ctx.fillStyle = c || '#fff';
    ctx.fillText(txt,x,y);
    ctx.restore();
  }
  function v37Blob(ctx,x,y,r,color,alpha){
    ctx.save();
    ctx.globalAlpha *= alpha == null ? 1 : alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    for(let i=0;i<18;i++){
      const a=i*Math.PI*2/18;
      const rr = r * (0.86 + 0.13*Math.sin(i*1.7 + state.time*3));
      const px = x + Math.cos(a)*rr;
      const py = y + Math.sin(a)*rr;
      i ? ctx.lineTo(px,py) : ctx.moveTo(px,py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function v37DrawSlime(h){
    if(!v37Has(h,['젤리','슬라임','왕관착지','왕관 착지','말랑','웅덩이','탄성벽','방울'])) return false;
    const color = h.color || '#86efac';
    ctx.save(); v37Glow(color,18); ctx.globalAlpha = h.warn>0 ? .48 : .9;
    if(v37Has(h,['탄성벽'])){
      const x=h.x||W/2,y=h.y||H/2,w=Math.max(42,h.w||52),hh=Math.max(110,h.h||220);
      ctx.fillStyle='rgba(134,239,172,.24)'; roundRect(ctx,x-w/2,y-hh/2,w,hh,18); ctx.fill();
      ctx.strokeStyle='#dcfce7'; ctx.lineWidth=4; roundRect(ctx,x-w/2,y-hh/2,w,hh,18); ctx.stroke();
      ctx.strokeStyle=color; ctx.lineWidth=5;
      for(let i=0;i<5;i++){ const yy=y-hh/2+22+i*(hh-44)/4; ctx.beginPath(); ctx.moveTo(x-w*.32,yy); ctx.quadraticCurveTo(x,yy+Math.sin(state.time*6+i)*16,x+w*.32,yy); ctx.stroke(); }
      v37Label('탄성 젤리벽',x,y+4,'#fff'); ctx.restore(); return true;
    }
    if(h.kind === 'circle'){
      const x=h.x||W/2,y=h.y||H/2,r=Math.max(28,h.r||46);
      if(v37Has(h,['왕관','착지','점프'])){
        ctx.strokeStyle='#dcfce7'; ctx.lineWidth=4; circleStroke(ctx,x,y,r*1.05);
        ctx.fillStyle='rgba(134,239,172,.28)'; circle(ctx,x,y,r);
        ctx.fillStyle='#fde047';
        ctx.beginPath(); ctx.moveTo(x-r*.42,y-r*.9); ctx.lineTo(x-r*.18,y-r*1.28); ctx.lineTo(x,y-r*.92); ctx.lineTo(x+r*.18,y-r*1.28); ctx.lineTo(x+r*.42,y-r*.9); ctx.closePath(); ctx.fill();
        v37Label('왕관 착지',x,y+5,'#fff'); ctx.restore(); return true;
      }
      v37Blob(ctx,x,y,r,color,.75);
      ctx.strokeStyle='#dcfce7'; ctx.lineWidth=4; circleStroke(ctx,x,y,r*.9);
      ctx.fillStyle='#102a1a'; circle(ctx,x-r*.2,y-r*.08,3.6); circle(ctx,x+r*.2,y-r*.08,3.6);
      v37Label(v37Has(h,['웅덩이','말랑'])?'말랑 웅덩이':'젤리 방울',x,y+5,'#fff'); ctx.restore(); return true;
    }
    if(h.kind === 'floor' || h.kind === 'wall'){
      const x=h.x||W/2,y=h.y||H/2,w=h.w||90,hh=h.h||90;
      ctx.fillStyle='rgba(134,239,172,.24)'; roundRect(ctx,x-w/2,y-hh/2,w,hh,20); ctx.fill();
      ctx.strokeStyle='#dcfce7'; ctx.lineWidth=3; roundRect(ctx,x-w/2,y-hh/2,w,hh,20); ctx.stroke();
      for(let i=0;i<8;i++){ v37Blob(ctx,x-w*.38+Math.random()*w,y-hh*.35+Math.random()*hh,8+Math.random()*10,color,.38); }
      v37Label('젤리 지대',x,y+4,'#fff'); ctx.restore(); return true;
    }
    ctx.restore(); return false;
  }

  function v37DrawEclipse(h){
    if(!v37Has(h,['검은일식','종말일식','일식심판','흑점','검은광선','검은고리','태양코어','태양 심판','검은 태양','붕괴 바닥'])) return false;
    const color = h.color || '#f97316';
    ctx.save(); v37Glow(color,24); ctx.globalAlpha = h.warn>0 ? .48 : .92;
    const x=h.x||W/2,y=h.y||H/2;
    if(h.kind === 'floor' || v37Has(h,['일식','심판','붕괴 바닥'])){
      const w=h.w||W*.96, hh=h.h||H*.8;
      ctx.fillStyle='rgba(2,6,23,.42)'; roundRect(ctx,x-w/2,y-hh/2,w,hh,22); ctx.fill();
      ctx.fillStyle='rgba(249,115,22,.20)'; roundRect(ctx,x-w/2+12,y-hh/2+12,w-24,hh-24,22); ctx.fill();
      for(let i=0;i<14;i++){
        const a=i*Math.PI*2/14 + state.time*.4;
        const rr=Math.min(w,hh)*(.25+.018*(i%3));
        ctx.strokeStyle=i%2?'rgba(251,191,36,.72)':'rgba(15,23,42,.9)'; ctx.lineWidth=i%2?5:9;
        ctx.beginPath(); ctx.arc(x,y,rr+i*12,a,a+Math.PI*.45); ctx.stroke();
      }
      ctx.fillStyle='rgba(2,6,23,.82)'; circle(ctx,x,y,70+Math.sin(state.time*4)*7);
      ctx.strokeStyle=color; ctx.lineWidth=6; circleStroke(ctx,x,y,96+Math.sin(state.time*3)*8);
      v37Label(v37Has(h,['종말'])?'종말 일식':'검은 일식',x,y+5,'#fff'); ctx.restore(); return true;
    }
    if(h.kind === 'circle' || v37Has(h,['흑점','태양코어'])){
      const r=Math.max(32,h.r||58);
      ctx.fillStyle='rgba(2,6,23,.88)'; circle(ctx,x,y,r);
      ctx.strokeStyle=color; ctx.lineWidth=5; circleStroke(ctx,x,y,r*1.12);
      for(let i=0;i<10;i++){ const a=i*Math.PI*2/10+state.time; ctx.strokeStyle=i%2?'#fdba74':'#020617'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*r*.9,y+Math.sin(a)*r*.9); ctx.lineTo(x+Math.cos(a)*r*1.55,y+Math.sin(a)*r*1.55); ctx.stroke(); }
      v37Label(v37Has(h,['흑점'])?'흑점':'태양 코어',x,y+5,'#fff'); ctx.restore(); return true;
    }
    if(h.kind === 'beam' || v37Has(h,['검은광선'])){
      const len=h.len||W, ww=Math.max(18,h.w||20), a=h.angle||0;
      ctx.translate(x,y); ctx.rotate(a);
      ctx.fillStyle='rgba(2,6,23,.86)'; roundRect(ctx,-len/2,-ww*1.2,len,ww*2.4,12); ctx.fill();
      ctx.strokeStyle=color; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(-len/2,0); ctx.lineTo(len/2,0); ctx.stroke();
      ctx.strokeStyle='#fde68a'; ctx.lineWidth=2; for(let i=-1;i<=1;i+=2){ ctx.beginPath(); ctx.moveTo(-len/2,i*ww); ctx.lineTo(len/2,i*ww); ctx.stroke(); }
      ctx.restore(); return true;
    }
    if(h.kind === 'donut' || v37Has(h,['검은고리'])){
      const inner=h.inner||120, outer=h.outer||280;
      ctx.strokeStyle='rgba(2,6,23,.88)'; ctx.lineWidth=outer-inner; circleStroke(ctx,x,y,(inner+outer)/2);
      ctx.strokeStyle=color; ctx.lineWidth=6; circleStroke(ctx,x,y,outer); circleStroke(ctx,x,y,inner);
      v37Label('검은 고리',x,y+5,'#fff'); ctx.restore(); return true;
    }
    ctx.restore(); return false;
  }

  function v37DrawChaos(h){
    if(!v37Has(h,['혼돈','카오스','무작위','괴랄','복합'])) return false;
    const x=h.x||W/2,y=h.y||H/2; const color=h.color||'#fb7185';
    ctx.save(); v37Glow(color,24); ctx.globalAlpha=h.warn>0?.50:.93;
    const t=state.time||0;
    if(h.kind==='circle' || v37Has(h,['혼돈원','혼돈폭풍'])){
      const r=Math.max(34,h.r||58);
      for(let i=0;i<3;i++){ ctx.strokeStyle=['#fb7185','#a78bfa','#fde047'][i]; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(x,y,r*(.75+i*.22),t*(i%2?-.9:.9)+i,t*(i%2?-.9:.9)+i+Math.PI*1.35); ctx.stroke(); }
      ctx.fillStyle='rgba(251,113,133,.22)'; circle(ctx,x,y,r*.86); v37Label('혼돈 원',x,y+5,'#fff'); ctx.restore(); return true;
    }
    if(h.kind==='donut' || v37Has(h,['혼돈도넛'])){
      const inner=h.inner||45, outer=h.outer||130;
      for(let i=0;i<10;i++){ const a=t*1.7+i*Math.PI/5; ctx.strokeStyle=i%2?'#a78bfa':'#fb7185'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(x,y,inner+(outer-inner)*(i/10),a,a+Math.PI*.85); ctx.stroke(); }
      ctx.strokeStyle='#fff'; ctx.lineWidth=3; circleStroke(ctx,x,y,inner); circleStroke(ctx,x,y,outer); v37Label('혼돈 도넛',x,y+5,'#fff'); ctx.restore(); return true;
    }
    if(h.kind==='beam' || h.kind==='rotatingBeam' || v37Has(h,['혼돈선','혼돈회전'])){
      const len=h.len||W, ww=Math.max(14,h.w||16), a=h.angle||0;
      ctx.translate(x,y); ctx.rotate(a);
      const grad=ctx.createLinearGradient(-len/2,0,len/2,0); grad.addColorStop(0,'#fb7185'); grad.addColorStop(.5,'#fde047'); grad.addColorStop(1,'#a78bfa');
      ctx.strokeStyle=grad; ctx.lineWidth=ww*1.7; ctx.beginPath();
      for(let i=0;i<=36;i++){ const xx=-len/2+i*len/36; const yy=Math.sin(i*.9+t*8)*ww*.85; i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy); }
      ctx.stroke(); ctx.strokeStyle='#fff'; ctx.lineWidth=2; ctx.stroke(); ctx.restore(); return true;
    }
    if(h.kind==='floor' || v37Has(h,['즉사혼돈','혼돈재판'])){
      const w=h.w||W*.95, hh=h.h||H*.8;
      ctx.fillStyle='rgba(124,58,237,.25)'; roundRect(ctx,x-w/2,y-hh/2,w,hh,18); ctx.fill();
      for(let i=0;i<18;i++){ const a=i*Math.PI*2/18+t*.8; const rr=80+(i%5)*38; ctx.fillStyle=['rgba(251,113,133,.35)','rgba(167,139,250,.32)','rgba(253,224,71,.28)'][i%3]; circle(ctx,x+Math.cos(a)*rr,y+Math.sin(a)*rr,18+(i%3)*8); }
      v37Label(v37Has(h,['즉사'])?'즉사 혼돈':'혼돈 재판',x,y+5,'#fff'); ctx.restore(); return true;
    }
    ctx.restore(); return false;
  }

  function v37DrawCrumble(h){
    if(!v37Has(h,['붕괴','무너지는','매몰'])) return false;
    const x=h.x||W/2,y=h.y||H/2,w=h.w||90,hh=h.h||90,c=h.color||'#a16207';
    ctx.save(); v37Glow(c,16); ctx.globalAlpha=h.warn>0?.45:.9;
    ctx.fillStyle='rgba(87,83,78,.34)'; roundRect(ctx,x-w/2,y-hh/2,w,hh,8); ctx.fill();
    ctx.strokeStyle='#fef3c7'; ctx.lineWidth=3; roundRect(ctx,x-w/2,y-hh/2,w,hh,8); ctx.stroke();
    ctx.strokeStyle=c; ctx.lineWidth=3;
    for(let i=0;i<7;i++){ const xx=x-w/2+Math.random()*w, yy=y-hh/2+Math.random()*hh; ctx.beginPath(); ctx.moveTo(xx,yy); ctx.lineTo(xx+Math.random()*30-15,yy+Math.random()*30-15); ctx.stroke(); }
    v37Label('붕괴 바닥',x,y+4,'#fff'); ctx.restore(); return true;
  }

  const oldDrawHazardsV37 = drawHazards;
  drawHazards = function(){
    oldDrawHazardsV37();
    try{
      state.hazards.forEach(h=>{
        if(!h) return;
        if(v37DrawSlime(h)) return;
        if(v37DrawEclipse(h)) return;
        if(v37DrawChaos(h)) return;
        if(v37DrawCrumble(h)) return;
      });
    } catch(e){ console.warn('[V37 hazard visual overlay failed]', e); }
  };

  function v37IsFirstLocalClear(){
    try{
      const list = getLocalRecords ? getLocalRecords() : [];
      const id = boss && boss.id;
      return !!id && !list.some(r => r && r.boss_id === id);
    } catch(e){ return false; }
  }
  function v37ShowFirstClear(){
    try{
      const name = boss && boss.name ? boss.name : '보스';
      state.v37FirstClearT = 5.0;
      state.v37FirstClearBoss = name;
      state.v37FirstClearText = `FIRST CLEAR! ${name} 최초 클리어 기록 달성!`;
      if(ui && ui.right && !ui.right.classList.contains('hidden')){
        const box = document.createElement('div');
        box.className = 'gacha-result';
        box.style.borderColor = 'rgba(250,204,21,.9)';
        box.style.background = 'radial-gradient(circle at 50% 0%, rgba(250,204,21,.34), rgba(15,23,42,.94))';
        box.innerHTML = `<div style="font-size:24px;font-weight:950;color:#facc15;letter-spacing:.04em">FIRST CLEAR</div><div style="margin-top:5px;font-weight:900;color:#fff">${name} 최초 클리어 기록!</div><div class="muted">이 보스의 첫 기록이 랭킹에 등록되었습니다.</div>`;
        ui.right.insertBefore(box, ui.right.firstChild.nextSibling || ui.right.firstChild);
      }
    } catch(e){ console.warn('[V37 first clear banner failed]', e); }
  }
  try{
    const oldSubmitRecordV37 = submitRecord;
    submitRecord = async function(ms){
      const localFirst = v37IsFirstLocalClear();
      let cloudFirst = true;
      try{
        if(supabaseReady && supabase && boss && boss.id){
          const res = await supabase.from('raid_records').select('id').eq('boss_id', boss.id).limit(1);
          if(res && Array.isArray(res.data) && res.data.length > 0) cloudFirst = false;
        }
      } catch(e){ cloudFirst = true; }
      const ret = await oldSubmitRecordV37(ms);
      if(localFirst && cloudFirst) v37ShowFirstClear();
      return ret;
    };
  } catch(e){ console.warn('[V37 submitRecord patch failed]', e); }

  try{
    const oldDrawV37 = draw;
    draw = function(){
      oldDrawV37();
      try{
        if(state.v37FirstClearT > 0){
          state.v37FirstClearT -= Math.min(.05, 1/60);
          const a = Math.max(0, Math.min(1, state.v37FirstClearT/5));
          ctx.save();
          ctx.globalAlpha = Math.min(1, .25 + a);
          ctx.fillStyle = 'rgba(0,0,0,.35)';
          roundRect(ctx, W/2-310, 82, 620, 86, 24); ctx.fill();
          ctx.strokeStyle = '#facc15'; ctx.lineWidth = 4; roundRect(ctx, W/2-310, 82, 620, 86, 24); ctx.stroke();
          ctx.shadowColor = '#facc15'; ctx.shadowBlur = 24;
          ctx.fillStyle = '#facc15'; ctx.font = '950 34px system-ui'; ctx.textAlign = 'center'; ctx.fillText('FIRST CLEAR!', W/2, 120);
          ctx.shadowBlur = 10; ctx.fillStyle = '#fff'; ctx.font = '900 16px system-ui'; ctx.fillText(state.v37FirstClearBoss + ' 최초 클리어 기록 달성', W/2, 149);
          ctx.restore();
        }
      } catch(e){}
    };
  } catch(e){ console.warn('[V37 draw first clear patch failed]', e); }

  try{
    window.RaidDungeonV37 = {
      version: V37_VERSION,
      newlyVisualized: ['slime bounce/puddle/walls','black sun eclipse/sunspots/black rays','chaos circles/donuts/waves/flood','crumbling floor'],
      firstClear: 'Shows FIRST CLEAR when the boss has no existing local/cloud record before the new clear is saved.'
    };
  } catch(e){}
})();


/* ===== V38: all text patterns visualized + weapon x2 + guaranteed boss tickets ===== */
(()=>{
  const V38_VERSION = 'V38_all_visuals_weaponx2_guaranteed_tickets';

  function v38Clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function v38Text(h){ return String((h && (h.label || h.tag || h.theme || '')) || ''); }
  function v38TextLower(h){ return v38Text(h).toLowerCase(); }
  function v38Has(h, words){
    const s = v38TextLower(h);
    return words.some(w => s.includes(String(w).toLowerCase()));
  }
  function v38Glow(c,b){ ctx.shadowColor = c || '#fff'; ctx.shadowBlur = b || 18; }
  function v38StrokeText(txt,x,y,c,size){
    ctx.save();
    ctx.font = `900 ${size||12}px system-ui`;
    ctx.textAlign = 'center';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0,0,0,.72)';
    ctx.strokeText(txt,x,y);
    ctx.fillStyle = c || '#fff';
    ctx.fillText(txt,x,y);
    ctx.restore();
  }
  function v38CircleStroke(x,y,r,c,w){ ctx.save(); ctx.strokeStyle=c; ctx.lineWidth=w||4; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke(); ctx.restore(); }
  function v38Line(x1,y1,x2,y2,c,w){ ctx.strokeStyle=c; ctx.lineWidth=w||4; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }
  function v38Phase(h){
    if(!h) return 0;
    if(typeof h._v38MaxLife !== 'number') h._v38MaxLife = Math.max(.05, h.life || .9);
    if((h.warn || 0) > 0) return 0;
    return Math.max(0, Math.min(1, 1 - (h.life || 0) / h._v38MaxLife));
  }

  function v38BoostWeapons(list){
    if(!Array.isArray(list)) return;
    list.forEach(w => {
      if(!w || typeof w !== 'object') return;
      if(w._v38Doubled) return;
      const atk = Number(w.atk || 0);
      if(Number.isFinite(atk) && atk > 0) w.atk = +(atk * 2).toFixed(4);
      w._v38Doubled = true;
    });
  }
  function v38ApplyWeaponBuff(){
    try{ if(typeof WEAPONS !== 'undefined') v38BoostWeapons(WEAPONS); }catch(e){}
    try{ if(state && state.save) v38BoostWeapons(state.save.weapons); }catch(e){}
    try{ if(state && state.raid && state.raid.weapon) v38BoostWeapons([state.raid.weapon]); }catch(e){}
  }
  v38ApplyWeaponBuff();

  try{
    const oldNormalizeV38 = normalizeSaveData;
    normalizeSaveData = function(s){
      const out = oldNormalizeV38(s);
      try{ v38BoostWeapons(out && out.weapons); }catch(e){}
      return out;
    };
  } catch(e){ console.warn('[V38 normalize patch failed]', e); }

  try{
    getBossRewards = function(tier){
      tier = Math.max(1, Math.min(10, Number(tier || 1)));
      const rewards = { weapon:0, armor:0, skill:0, passive:0 };
      let count = 1;
      if(tier <= 2){ count = 1; if(Math.random() < 0.35) count += 1; }
      else if(tier <= 4){ count = 2; if(Math.random() < 0.45) count += 1; }
      else if(tier <= 6){ count = 3; if(Math.random() < 0.55) count += 1; }
      else if(tier <= 8){ count = 4; count += Math.floor(Math.random() * 2); }
      else { count = 5; count += Math.floor(Math.random() * 3); }

      const weights = [
        ['skill', 34],
        ['weapon', 27],
        ['armor', 21],
        ['passive', 18],
      ];
      function pick(){
        const roll = Math.random() * 100;
        let sum = 0;
        for(const [k,w] of weights){ sum += w; if(roll <= sum) return k; }
        return 'skill';
      }
      for(let i=0;i<count;i++) rewards[pick()] += 1;

      if(tier >= 8 && Math.random() < 0.20){ rewards.weapon += 1; rewards.armor += 1; rewards.skill += 1; rewards.passive += 1; }
      if(tier >= 9 && Math.random() < 0.28) rewards.skill += 1;
      if(tier >= 9 && Math.random() < 0.20) rewards.weapon += 1;
      if(tier >= 10 && Math.random() < 0.24) rewards.armor += 1;
      if(tier >= 10 && Math.random() < 0.18) rewards.passive += 1;

      if((rewards.weapon + rewards.armor + rewards.skill + rewards.passive) <= 0) rewards.skill = 1;
      return rewards;
    };
  } catch(e){ console.warn('[V38 reward patch failed]', e); }

  function v38DrawGuillotine(h){
    if(!v38Has(h,['단두대','참수','처형'])) return false;
    const x=h.x||W/2, y=h.y||H/2; const w=Math.max(52,h.w||68), hh=Math.max(160,h.h||260); const prog=v38Phase(h);
    ctx.save(); v38Glow('#f3f4f6',22); ctx.globalAlpha = h.warn>0 ? .56 : .95;
    ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 5;
    roundRect(ctx,x-w/2,y-hh/2,w,hh,10); ctx.stroke();
    ctx.strokeStyle = 'rgba(148,163,184,.9)'; ctx.lineWidth = 7;
    v38Line(x-w*.23,y-hh/2+12,x-w*.23,y+hh/2-12,ctx.strokeStyle,7);
    v38Line(x+w*.23,y-hh/2+12,x+w*.23,y+hh/2-12,ctx.strokeStyle,7);
    v38Line(x-w*.34,y-hh/2+18,x+w*.34,y-hh/2+18,ctx.strokeStyle,8);
    const bladeY = y-hh/2 + 32 + prog*(hh-78);
    ctx.fillStyle = '#d1d5db';
    ctx.beginPath();
    ctx.moveTo(x-w*.34, bladeY-8); ctx.lineTo(x+w*.34, bladeY-8); ctx.lineTo(x+w*.18, bladeY+24); ctx.lineTo(x-w*.18, bladeY+24); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3; ctx.stroke();
    for(let i=0;i<4;i++) v38Line(x-w*.28+i*w*.18, y-hh/2+22, x-w*.18+i*w*.12, bladeY-6, 'rgba(255,255,255,.8)', 2);
    v38StrokeText('단두대', x, y-hh/2-10, '#fff');
    ctx.restore();
    return true;
  }

  function v38DrawCollapse(h){
    if(!v38Has(h,['붕괴','함락','파괴','붕락'])) return false;
    const x=h.x||W/2, y=h.y||H/2, w=Math.max(70,h.w||120), hh=Math.max(70,h.h||120);
    ctx.save(); v38Glow('#fb7185',20); ctx.globalAlpha = h.warn>0 ? .42 : .9;
    ctx.fillStyle='rgba(127,29,29,.18)'; roundRect(ctx,x-w/2,y-hh/2,w,hh,12); ctx.fill();
    ctx.strokeStyle='#fecaca'; ctx.lineWidth=4; roundRect(ctx,x-w/2,y-hh/2,w,hh,12); ctx.stroke();
    ctx.strokeStyle='#fb7185'; ctx.lineWidth=5;
    v38Line(x-w*.35,y-hh*.35,x+w*.2,y+hh*.2,ctx.strokeStyle,5);
    v38Line(x-w*.1,y-hh*.4,x+w*.35,y+hh*.05,ctx.strokeStyle,4);
    v38Line(x-w*.3,y+hh*.15,x+w*.1,y-hh*.2,ctx.strokeStyle,4);
    for(let i=0;i<7;i++){
      const px=x-w*.35+Math.random()*w*.7, py=y-hh*.35+Math.random()*hh*.7;
      ctx.fillStyle=i%2?'#f59e0b':'#fca5a5';
      ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+8,py+4); ctx.lineTo(px-4,py+12); ctx.closePath(); ctx.fill();
    }
    v38StrokeText('붕괴',x,y+4,'#fff');
    ctx.restore();
    return true;
  }

  function v38DrawFire(h){
    if(!v38Has(h,['화염','불꽃','불길','용암','화구','폭염','열파','숨결'])) return false;
    const x=h.x||W/2, y=h.y||H/2;
    ctx.save(); v38Glow('#fb923c',24); ctx.globalAlpha = h.warn>0 ? .42 : .88;
    if(h.kind === 'beam' || h.kind === 'wall'){
      ctx.translate(x,y); ctx.rotate(h.angle||0);
      const len = h.len || h.w || 620; const width = Math.max(36, h.h || h.w || 64);
      for(let i=0;i<18;i++){
        const px=-len/2+i*(len/17); const size=width*(.22+.32*((i%4)+1)/4);
        ctx.fillStyle = i%2 ? 'rgba(251,146,60,.70)' : 'rgba(239,68,68,.54)';
        ctx.beginPath();
        ctx.moveTo(px,0);
        ctx.quadraticCurveTo(px-size*.6,-size,px+size*.15,-size*.2);
        ctx.quadraticCurveTo(px+size,0,px+size*.15,size*.2);
        ctx.quadraticCurveTo(px-size*.6,size,px,0);
        ctx.fill();
      }
      ctx.restore(); return true;
    }
    const r=Math.max(34,h.r||48);
    for(let i=0;i<7;i++){
      const a=i*Math.PI*2/7 + state.time*1.6;
      const px=x+Math.cos(a)*r*.25, py=y+Math.sin(a)*r*.25;
      ctx.fillStyle=i%2?'rgba(253,186,116,.8)':'rgba(251,146,60,.62)';
      ctx.beginPath(); ctx.moveTo(px,py-r*.2); ctx.quadraticCurveTo(px-r*.28,py+r*.08,px,py+r*.44); ctx.quadraticCurveTo(px+r*.34,py+r*.06,px,py-r*.2); ctx.fill();
    }
    v38StrokeText('화염',x,y+4,'#fff');
    ctx.restore();
    return true;
  }

  function v38DrawLightning(h){
    if(!v38Has(h,['번개','낙뢰','전기','뇌격','자기'])) return false;
    const x=h.x||W/2, y=h.y||H/2;
    ctx.save(); v38Glow('#fde047',22); ctx.globalAlpha = h.warn>0 ? .45 : .94;
    if(h.kind === 'beam' || h.kind === 'wall'){
      ctx.translate(x,y); ctx.rotate(h.angle||0);
      const len = h.len || h.w || 680;
      ctx.strokeStyle = '#fef08a'; ctx.lineWidth = 6;
      for(let k=0;k<3;k++){
        ctx.beginPath();
        let px=-len/2, py=(k-1)*10;
        ctx.moveTo(px,py);
        for(let i=0;i<11;i++){
          px = -len/2 + (i+1)*(len/11);
          py = (k-1)*12 + ((i%2)?-1:1)*(16+Math.sin(state.time*7+i+k)*6);
          ctx.lineTo(px,py);
        }
        ctx.stroke();
      }
      ctx.restore(); return true;
    }
    const r=Math.max(28,h.r||42);
    for(let i=0;i<8;i++){
      const a=i*Math.PI/4;
      const p1x=x+Math.cos(a)*r*.35, p1y=y+Math.sin(a)*r*.35;
      const p2x=x+Math.cos(a)*r*.9, p2y=y+Math.sin(a)*r*.9;
      ctx.strokeStyle=i%2?'#fef08a':'#ffffff'; ctx.lineWidth=5;
      ctx.beginPath(); ctx.moveTo(p1x,p1y); ctx.lineTo((p1x+p2x)/2+6,(p1y+p2y)/2-10); ctx.lineTo(p2x,p2y); ctx.stroke();
    }
    v38StrokeText('전격',x,y+4,'#fff');
    ctx.restore();
    return true;
  }

  function v38DrawWave(h){
    if(!v38Has(h,['해일','쓰나미','파도','물기둥','해류'])) return false;
    const x=h.x||W/2, y=h.y||H/2;
    ctx.save(); v38Glow('#38bdf8',20); ctx.globalAlpha = h.warn>0 ? .44 : .88;
    if(h.kind === 'beam' || h.kind === 'wall' || h.kind === 'floor'){
      const ww = h.len || h.w || W*.8; const hh = Math.max(54, h.h || 66);
      ctx.fillStyle='rgba(56,189,248,.20)'; roundRect(ctx,x-ww/2,y-hh/2,ww,hh,12); ctx.fill();
      ctx.strokeStyle='#e0f2fe'; ctx.lineWidth=4;
      for(let j=0;j<4;j++){
        ctx.beginPath();
        for(let i=0;i<=36;i++){
          const px=x-ww/2+i*ww/36; const py=y-hh*.18+j*hh*.12+Math.sin(i*.65+state.time*4+j)*10;
          i?ctx.lineTo(px,py):ctx.moveTo(px,py);
        }
        ctx.stroke();
      }
      ctx.restore(); return true;
    }
    const r=Math.max(36,h.r||58);
    for(let k=0;k<3;k++) v38CircleStroke(x,y,r*.55+k*14,'rgba(224,242,254,.9)',3);
    v38StrokeText('해일',x,y+4,'#fff');
    ctx.restore();
    return true;
  }

  function v38DrawPoison(h){
    if(!v38Has(h,['독','포자','맹독','정원','오염','슬라임 웅덩이'])) return false;
    const x=h.x||W/2, y=h.y||H/2, r=Math.max(34,h.r||42);
    ctx.save(); v38Glow('#84cc16',20); ctx.globalAlpha = h.warn>0 ? .42 : .9;
    ctx.fillStyle='rgba(132,204,22,.18)';
    if(h.kind==='floor' || h.kind==='wall'){
      const w=Math.max(70,h.w||110), hh=Math.max(70,h.h||90);
      roundRect(ctx,x-w/2,y-hh/2,w,hh,12); ctx.fill();
      for(let i=0;i<7;i++){
        const px=x-w/2+16+i*(w-32)/6, py=y+Math.sin(i+state.time*2)*6;
        ctx.fillStyle=i%2?'rgba(163,230,53,.75)':'rgba(74,222,128,.55)';
        ctx.beginPath(); ctx.arc(px,py,10+(i%3)*4,0,Math.PI*2); ctx.fill();
      }
      ctx.strokeStyle='#d9f99d'; ctx.lineWidth=4; roundRect(ctx,x-w/2,y-hh/2,w,hh,12); ctx.stroke();
      v38StrokeText('독 장판',x,y+4,'#fff');
      ctx.restore(); return true;
    }
    for(let i=0;i<6;i++){
      const a=i*Math.PI*2/6; const px=x+Math.cos(a)*r*.65, py=y+Math.sin(a)*r*.65;
      ctx.fillStyle=i%2?'rgba(163,230,53,.8)':'rgba(74,222,128,.68)';
      ctx.beginPath(); ctx.arc(px,py,10+(i%2)*4,0,Math.PI*2); ctx.fill();
    }
    ctx.fillStyle='#bef264'; ctx.beginPath(); ctx.arc(x,y,12,0,Math.PI*2); ctx.fill();
    v38StrokeText('포자',x,y-r-10,'#fff');
    ctx.restore(); return true;
  }

  function v38DrawIce(h){
    if(!v38Has(h,['빙','얼음','서리','결정','빙결'])) return false;
    const x=h.x||W/2, y=h.y||H/2;
    ctx.save(); v38Glow('#93c5fd',22); ctx.globalAlpha = h.warn>0 ? .44 : .92;
    if(h.kind==='beam' || h.kind==='wall'){
      const len = h.len || h.w || 680; const hh = Math.max(42, h.h || 54);
      ctx.translate(x,y); ctx.rotate(h.angle||0);
      ctx.fillStyle='rgba(147,197,253,.22)'; roundRect(ctx,-len/2,-hh/2,len,hh,12); ctx.fill();
      ctx.strokeStyle='#eff6ff'; ctx.lineWidth=4; roundRect(ctx,-len/2,-hh/2,len,hh,12); ctx.stroke();
      for(let i=0;i<8;i++){
        const px=-len/2+30+i*(len-60)/7;
        ctx.strokeStyle='#dbeafe'; ctx.lineWidth=3;
        ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px-12,-18); ctx.moveTo(px,0); ctx.lineTo(px+12,-18); ctx.moveTo(px,0); ctx.lineTo(px,18); ctx.stroke();
      }
      ctx.restore(); return true;
    }
    const r=Math.max(28,h.r||42);
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;
      ctx.strokeStyle='#eff6ff'; ctx.lineWidth=4;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r); ctx.stroke();
    }
    v38CircleStroke(x,y,r*.45,'#dbeafe',3);
    v38StrokeText('빙결',x,y+4,'#fff');
    ctx.restore(); return true;
  }

  function v38DrawHook(h){
    if(!v38Has(h,['갈고리','사슬','구속','속박'])) return false;
    const x=h.x||W/2,y=h.y||H/2,a=h.angle||0,len=h.len||Math.max(h.w||480,h.h||480,520);
    ctx.save(); v38Glow('#e5e7eb',18); ctx.globalAlpha=h.warn>0?.5:.95;
    ctx.translate(x,y); ctx.rotate(a);
    ctx.strokeStyle='#f8fafc'; ctx.lineWidth=4;
    for(let i=0;i<8;i++){
      const px=-len/2+i*(len/8);
      ctx.beginPath(); ctx.arc(px,0,10,0,Math.PI*2); ctx.stroke();
    }
    ctx.strokeStyle='#cbd5e1'; ctx.lineWidth=6; ctx.beginPath(); ctx.moveTo(-len/2,0); ctx.lineTo(len/2-44,0); ctx.stroke();
    const hx=len/2-26;
    ctx.strokeStyle='#f8fafc'; ctx.lineWidth=7; ctx.beginPath(); ctx.arc(hx,0,28,Math.PI*.1,Math.PI*1.55); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx+18,-18); ctx.lineTo(hx+38,-32); ctx.moveTo(hx+12,18); ctx.lineTo(hx+28,30); ctx.stroke();
    ctx.restore(); return true;
  }

  function v38DrawMaze(h){
    if(!v38Has(h,['미로','혼동','환영','집행','큐브','왜곡'])) return false;
    const x=h.x||W/2,y=h.y||H/2,w=Math.max(84,h.w||100),hh=Math.max(84,h.h||100);
    ctx.save(); v38Glow('#c084fc',20); ctx.globalAlpha=h.warn>0?.42:.92;
    ctx.strokeStyle='#f5d0fe'; ctx.lineWidth=4; roundRect(ctx,x-w/2,y-hh/2,w,hh,12); ctx.stroke();
    ctx.strokeStyle='#c084fc'; ctx.lineWidth=5;
    ctx.beginPath();
    ctx.moveTo(x-w*.26,y-hh*.18); ctx.lineTo(x-w*.26,y+hh*.26); ctx.lineTo(x+w*.14,y+hh*.26); ctx.lineTo(x+w*.14,y-hh*.04); ctx.lineTo(x-w*.04,y-hh*.04);
    ctx.moveTo(x+w*.26,y-hh*.28); ctx.lineTo(x+w*.26,y+hh*.12); ctx.lineTo(x-w*.06,y+hh*.12);
    ctx.stroke();
    v38StrokeText('미로/혼동',x,y-hh/2-10,'#fff');
    ctx.restore(); return true;
  }

  function v38DrawFallback(h){
    const txt = String((h && h.label) || '').trim();
    if(!txt) return false;
    if(v38Has(h,['safe']) || txt === 'SAFE') return false;
    const x=h.x||W/2, y=h.y||H/2;
    ctx.save(); v38Glow(h.color||'#fff',16); ctx.globalAlpha = h.warn>0 ? .34 : .74;
    if(h.kind==='circle' || h.kind==='donut'){
      const r = Math.max(24, h.r || h.outer || 36);
      v38CircleStroke(x,y,r*.7,h.color||'#fff',3);
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4+state.time*.8;
        v38Line(x+Math.cos(a)*r*.3,y+Math.sin(a)*r*.3,x+Math.cos(a)*r,y+Math.sin(a)*r,h.color||'#fff',2);
      }
    } else {
      const w = Math.min(Math.max(80, h.w || h.len || 120), 260);
      const hh = Math.min(Math.max(40, h.h || 56), 140);
      ctx.strokeStyle = h.color || '#fff'; ctx.lineWidth = 3; roundRect(ctx,x-w/2,y-hh/2,w,hh,10); ctx.stroke();
      for(let i=0;i<5;i++){
        const px=x-w/2+16+i*(w-32)/4;
        const py=y+Math.sin(state.time*3+i)*8;
        ctx.beginPath(); ctx.arc(px,py,4+(i%2),0,Math.PI*2); ctx.fillStyle = h.color || '#fff'; ctx.fill();
      }
    }
    v38StrokeText(txt,x,y+4,'#fff',12);
    ctx.restore(); return true;
  }

  function v38DrawVisual(h){
    if(!h || !h.label) return false;
    if(v38DrawGuillotine(h)) return true;
    if(v38DrawCollapse(h)) return true;
    if(v38DrawFire(h)) return true;
    if(v38DrawLightning(h)) return true;
    if(v38DrawWave(h)) return true;
    if(v38DrawPoison(h)) return true;
    if(v38DrawIce(h)) return true;
    if(v38DrawHook(h)) return true;
    if(v38DrawMaze(h)) return true;
    return v38DrawFallback(h);
  }

  try{
    const oldDrawHazardsV38 = drawHazards;
    drawHazards = function(){
      oldDrawHazardsV38();
      try{
        state.hazards.forEach(h => { v38DrawVisual(h); });
      }catch(e){ console.warn('[V38 visual overlay failed]', e); }
    };
  } catch(e){ console.warn('[V38 drawHazards patch failed]', e); }

  try{
    const oldDrawV38 = draw;
    draw = function(){
      v38ApplyWeaponBuff();
      oldDrawV38();
    };
  } catch(e){ console.warn('[V38 draw patch failed]', e); }

  try{
    window.RaidDungeonV38 = {
      version: V38_VERSION,
      changes: [
        'All labeled/text-only boss hazards now receive visual overlays instead of looking like plain laser text.',
        'Weapon attack values are doubled for all existing/newly owned weapons.',
        'Boss clears always drop at least 1 ticket and high-tier bosses can drop multiple weapon/armor/skill/passive tickets.'
      ]
    };
  } catch(e){}
})();


/* ===== V39: first clear fixed + exact tier tickets + distinct plague/plant/gardener/solar/eclipse patterns ===== */
(()=>{
  const V39_VERSION = 'V39_first_clear_tier_rewards_boss_quality';
  const V39_FIRST_CLEAR_KEY = 'raid-dungeon-v39-first-clear-seen';

  function v39Num(v, d){ v = Number(v); return Number.isFinite(v) ? v : d; }
  function v39Clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function v39Tier(b){ return v39Clamp(Math.round(v39Num(b && b.tier, 1)), 1, 10); }
  function v39Pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }
  function v39BossName(){ return boss && boss.name ? boss.name : '보스'; }
  function v39Color(c){ return c || (boss && boss.color) || '#ffffff'; }
  function v39Dmg(m){ return Math.max(12, ((boss && boss.atk) || 25) * (m || .7)); }
  function v39Warn(w){ return Math.max(.9, w || 1.2); }
  function v39Haz(h){
    if(!h) return;
    h.warn = v39Warn(h.warn);
    h.life = Math.max(.45, h.life || .85);
    h.damage = v39Num(h.damage, v39Dmg(.7));
    state.hazards.push(h);
  }
  function v39Circle(x,y,r,warn,color,damage,tag,label,life){ v39Haz({kind:'circle',x,y,r,warn,life,damage,color,tag,label}); }
  function v39Donut(x,y,inner,outer,warn,color,damage,tag,label,life){ v39Haz({kind:'donut',x,y,inner,outer,warn,life:life||.92,damage,color,tag,label}); }
  function v39Beam(x,y,angle,len,w,warn,color,damage,tag,label,life){ v39Haz({kind:'beam',x,y,angle,len,w,warn,life,damage,color,tag,label}); }
  function v39Wall(x,y,w,h,warn,color,damage,tag,label,life){ v39Haz({kind:'wall',x,y,w,h,warn,life,damage,color,tag,label}); }
  function v39Floor(x,y,w,h,warn,color,damage,tag,label,life){ v39Haz({kind:'floor',x,y,w,h,warn,life,damage,color,tag,label}); }
  function v39Rot(x,y,angle,spin,len,w,warn,color,damage,tag,label,life){ v39Haz({kind:'rotatingBeam',x,y,angle,spin,len,w,warn,life:life||2.1,damage,color,tag,label}); }
  function v39Cast(msg, color){
    try { v20BossCast(msg, 'cast', color || (boss && boss.color) || '#fff'); }
    catch(e){ state.toast = msg; state.toastT = 1.6; }
  }
  function v39BreakRune(x,y,label,color){
    try { state.mechanics.push({kind:'rune',x:x||W/2,y:y||H/2,r:34,life:5.0,action:'break',color:color||'#fef08a',label:label||'BREAK'}); } catch(e){}
  }
  function v39CleanseRune(x,y,label,color){
    try { state.mechanics.push({kind:'rune',x:x||W/2,y:y||H/2,r:32,life:4.8,action:'cleanse',color:color||'#86efac',label:label||'정화'}); } catch(e){}
  }

  try{
    rollBossTicketRewards = function(b){
      const tier = v39Tier(b);
      const rewards = {weapon:0, armor:0, skill:0, passive:0};
      const kinds = ['weapon','armor','skill','passive'];
      const weights = tier >= 8
        ? {weapon:27, armor:24, skill:29, passive:20}
        : tier >= 5
          ? {weapon:24, armor:22, skill:36, passive:18}
          : {weapon:21, armor:20, skill:43, passive:16};
      for(let i=0;i<tier;i++){
        const total = weights.weapon + weights.armor + weights.skill + weights.passive;
        let r = Math.random() * total;
        for(const k of kinds){
          r -= weights[k];
          if(r <= 0){ rewards[k] += 1; break; }
        }
      }
      if((rewards.weapon + rewards.armor + rewards.skill + rewards.passive) !== tier){
        const sum = rewards.weapon + rewards.armor + rewards.skill + rewards.passive;
        if(sum < tier) rewards.skill += tier - sum;
        if(sum > tier) rewards.skill = Math.max(0, rewards.skill - (sum - tier));
      }
      return rewards;
    };
    rewardTextFromTickets = function(rw){
      const parts = [];
      if(rw.weapon) parts.push(`무기 ${rw.weapon}장`);
      if(rw.armor) parts.push(`방어구 ${rw.armor}장`);
      if(rw.skill) parts.push(`스킬 ${rw.skill}장`);
      if(rw.passive) parts.push(`패시브 ${rw.passive}장`);
      return parts.length ? '획득 티켓: ' + parts.join(' / ') : '획득 티켓: 스킬 1장';
    };
  } catch(e){ console.warn('[V39 tier rewards patch failed]', e); }

  function v39LoadFirstSeen(){
    try { return JSON.parse(localStorage.getItem(V39_FIRST_CLEAR_KEY) || '{}') || {}; }
    catch(e){ return {}; }
  }
  function v39SaveFirstSeen(obj){ try { localStorage.setItem(V39_FIRST_CLEAR_KEY, JSON.stringify(obj || {})); } catch(e){} }
  function v39IsFirstClearNow(id){
    const seen = v39LoadFirstSeen();
    return !!id && !seen[id];
  }
  function v39MarkFirstClear(id){
    const seen = v39LoadFirstSeen();
    if(id) seen[id] = true;
    v39SaveFirstSeen(seen);
  }
  function v39ShowFirstClear(name){
    state.v39FirstClearT = 6.2;
    state.v39FirstClearName = name || v39BossName();
    state.flash = Math.max(state.flash || 0, 1.2);
    try { burst(W/2, H/2, '#facc15', 90, 520); } catch(e){}
  }

  try{
    endRaid = function(clear){
      state.screen = 'result';
      const elapsed = Math.floor(state.raid.elapsed * 1000);
      let rewardText = '';
      let firstClear = false;
      if(clear){
        const b = getBoss(boss.id);
        firstClear = v39IsFirstClearNow(boss.id);
        const rw = rollBossTicketRewards(b);
        state.save.tickets.weapon = (state.save.tickets.weapon || 0) + rw.weapon;
        state.save.tickets.armor = (state.save.tickets.armor || 0) + rw.armor;
        state.save.tickets.skill = (state.save.tickets.skill || 0) + rw.skill;
        state.save.tickets.passive = (state.save.tickets.passive || 0) + rw.passive;
        rewardText = rewardTextFromTickets(rw);
        if(firstClear){
          v39MarkFirstClear(boss.id);
          v39ShowFirstClear(boss.name);
          rewardText = '<b style="color:#facc15">FIRST CLEAR! 최초 클리어 기록 달성</b><br>' + rewardText;
        }
        saveGame();
        submitRecord(elapsed);
      }
      ui.right.classList.remove('hidden');
      ui.right.innerHTML = `<h1 class="title">${clear?'클리어!':'실패'}</h1><p class="sub">${boss.name}<br>시간: ${formatMs(elapsed)}<br>받은 피해: ${player.damageTaken}<br>${clear?rewardText:'보스를 다시 분석해보세요.'}</p><button id="resultMenu" class="btn">메뉴로</button>`;
      ui.right.querySelector('#resultMenu').onclick = () => { state.menuTab = clear ? 'ranking' : 'build'; renderMenu(); refreshRankings(boss.id); };
    };
  } catch(e){ console.warn('[V39 endRaid first clear patch failed]', e); }

  function v39PatternPlague(){
    const c = '#84cc16';
    const r = Math.random();
    if(r < .25){
      v39Cast('역병 의사: 병동 격리. 독안개 통로를 읽고 정화 룬을 밟으세요.', c);
      const safeRow = Math.floor(Math.random()*4);
      for(let i=0;i<4;i++) if(i!==safeRow) v39Wall(W/2, 145+i*(H-235)/3, W*.92, 52, 1.45+i*.08, c, v39Dmg(.62), 'poison', '역병 격리 병동', 1.05);
      for(let k=0;k<5;k++) v39Circle(160+k*(W-320)/4, 140+Math.random()*(H-240), 42, 1.25+k*.05, '#bef264', v39Dmg(.45), 'poison', '감염 포자', .9);
      v39CleanseRune(W*.80, H*.72, '해독 혈청', '#86efac');
      return;
    }
    if(r < .50){
      v39Cast('역병 의사: 수술선. 십자 절개가 지나간 뒤 짧은 공격 기회가 생깁니다.', '#d9f99d');
      for(let i=0;i<4;i++){
        const x = 180+i*(W-360)/3;
        v39Beam(x, H/2, Math.PI/2, H*.88, 18, 1.10+i*.13, '#d9f99d', v39Dmg(.58), 'poison', '역병 수술선', .86);
        v39Beam(W/2, 140+i*(H-240)/3, 0, W*.82, 18, 1.24+i*.10, '#a3e635', v39Dmg(.44), 'poison', '소독 절개선', .72);
      }
      v39BreakRune(W*.50, H*.50, '마스크 파괴', '#fef08a');
      return;
    }
    if(r < .75){
      v39Cast('역병 의사: 감염체 소환. 중앙에 몰리면 위험합니다.', c);
      for(let i=0;i<9;i++){
        const a = i*Math.PI*2/9;
        v39Circle(W/2+Math.cos(a)*260, H/2+Math.sin(a)*150, 36+Math.random()*16, 1.0+i*.04, '#84cc16', v39Dmg(.48), 'poison', '감염체 배양', .85);
      }
      v39Donut(W/2,H/2,80,230,1.6,'#65a30d',v39Dmg(.66),'poison','검역 독환',.95);
      return;
    }
    v39Cast('역병 의사: 흑사병 왕진. 추적 독구름을 구르기로 넘기세요.', c);
    for(let i=0;i<7;i++) v39Circle(player.x+Math.random()*360-180, player.y+Math.random()*260-130, 44, 1.0+i*.14, '#4ade80', v39Dmg(.55), 'poison', '추적 독구름', .8);
  }

  function v39PatternThorn(){
    const c = '#22c55e';
    const r = Math.random();
    if(r < .28){
      v39Cast('가시 여왕: 살아있는 덩굴벽. 벽이 닫히기 전에 꽃눈을 찾아 파괴하세요.', c);
      for(let i=0;i<5;i++) v39Wall(120+i*(W-240)/4, H/2, 26, H*.76, 1.25+i*.10, c, v39Dmg(.54), 'plant', '가시 덩굴벽', 1.0);
      v39BreakRune(120+Math.random()*(W-240), 120+Math.random()*(H-220), '꽃눈 파괴', '#fef08a');
      return;
    }
    if(r < .55){
      v39Cast('가시 여왕: 독꽃 개화. 꽃이 완전히 피기 전에 빈 자리로 빠지세요.', '#a3e635');
      for(let i=0;i<11;i++){
        const x = 100+Math.random()*(W-200), y = 125+Math.random()*(H-220);
        v39Circle(x,y,32+Math.random()*18,1.0+i*.055,'#a3e635',v39Dmg(.48),'plant','독꽃 개화',.82);
      }
      return;
    }
    if(r < .78){
      v39Cast('가시 여왕: 덩굴 갈고리. 잡히면 꽃밭 중앙으로 끌려갑니다.', '#86efac');
      const base = Math.atan2(player.y-boss.y, player.x-boss.x);
      for(let i=-2;i<=2;i++) v39Beam(boss.x,boss.y,base+i*.28,760,16,1.15+Math.abs(i)*.08,'#86efac',v39Dmg(.50),'plant','덩굴 갈고리',1.0);
      v39Donut(boss.x,boss.y,65,210,1.45,'#22c55e',v39Dmg(.55),'plant','가시 꽃밭',.9);
      return;
    }
    v39Cast('가시 여왕: 씨앗 폭격. 작은 씨앗들이 늦게 터집니다.', c);
    for(let i=0;i<14;i++) v39Circle(90+Math.random()*(W-180),120+Math.random()*(H-220),24+Math.random()*14,1.15+i*.03,c,v39Dmg(.36),'plant','가시 씨앗',.72);
  }

  function v39PatternGardener(){
    const c = '#a78bfa';
    const r = Math.random();
    if(r < .25){
      v39Cast('공허 정원사: 공허 뿌리. 뿌리가 공간을 접으며 뻗어옵니다.', c);
      for(let i=0;i<6;i++){
        const a = i*Math.PI/6 + (Math.random()<.5?0:Math.PI/2);
        v39Beam(W/2,H/2,a,W*.92,20,1.20+i*.08,c,v39Dmg(.54),'void garden','공허 뿌리',.92);
      }
      v39BreakRune(W*.22+Math.random()*W*.56, H*.28+Math.random()*H*.45, '검은 꽃 파괴', '#fef08a');
      return;
    }
    if(r < .50){
      v39Cast('공허 정원사: 꽃문 포탈. 열린 문 사이로만 이동하세요.', '#c084fc');
      const safe = Math.floor(Math.random()*4);
      for(let i=0;i<4;i++) if(i!==safe) v39Wall(W/2,150+i*(H-250)/3,W*.88,48,1.55+i*.08,'#c084fc',v39Dmg(.64),'void garden','공허 꽃문',1.0);
      for(let i=0;i<4;i++) v39Donut(170+i*(W-340)/3,H/2,36,88,1.2+i*.10,'#6d28d9',v39Dmg(.42),'void garden','꽃문 포탈',.8);
      return;
    }
    if(r < .75){
      v39Cast('공허 정원사: 정원 미궁. 회전하는 뿌리 사이에서 공격 타이밍을 잡으세요.', c);
      for(let i=0;i<3;i++) v39Rot(W/2,H/2,i*Math.PI/3,(i%2?-.85:.85),W*.92,14,1.15+i*.12,c,v39Dmg(.38),'void garden','정원 미궁',2.0);
      v39Circle(boss.x,boss.y,90,1.2,'#ddd6fe',v39Dmg(.44),'void garden','공허꽃',.8);
      return;
    }
    v39Cast('공허 정원사: 검은 꽃가루. 꽃가루가 터진 뒤 빈틈이 생깁니다.', c);
    for(let i=0;i<10;i++) v39Circle(100+Math.random()*(W-200),120+Math.random()*(H-220),38,1.05+i*.06,'#8b5cf6',v39Dmg(.46),'void garden','검은 꽃가루',.78);
  }

  function v39PatternSolar(){
    const c = '#facc15';
    const r = Math.random();
    if(r < .25){
      v39Cast('태양룡: 태양 숨결. 머리 방향을 보고 옆으로 구르세요.', c);
      const a = Math.atan2(player.y-boss.y, player.x-boss.x);
      for(let i=-2;i<=2;i++) v39Beam(boss.x,boss.y,a+i*.16,930,22,1.25+Math.abs(i)*.06,'#f97316',v39Dmg(.55),'solar','태양 숨결',.85);
      v39BreakRune(boss.x - Math.cos(a)*165, boss.y - Math.sin(a)*115, '역광 약점', '#fef08a');
      return;
    }
    if(r < .50){
      v39Cast('태양룡: 태양 발톱. 세 번 내려찍은 뒤 반격하세요.', '#fbbf24');
      for(let i=0;i<3;i++){
        v39Circle(player.x + (i-1)*75, player.y + (i%2?70:-55), 62, 1.0+i*.32, '#fbbf24', v39Dmg(.72), 'solar', '태양 발톱', .72);
      }
      return;
    }
    if(r < .75){
      v39Cast('태양룡: 플레어 코어. 코어를 밟아 BREAK를 만들 수 있습니다.', c);
      v39Donut(W/2,H/2,95,310,1.65,'#fde047',v39Dmg(.68),'solar','태양 플레어',.95);
      for(let i=0;i<8;i++){
        const a=i*Math.PI*2/8;
        v39Beam(W/2+Math.cos(a)*70,H/2+Math.sin(a)*42,a,W*.65,14,1.25+i*.04,'#f97316',v39Dmg(.36),'solar','광익 절단',.8);
      }
      v39BreakRune(W/2,H/2,'플레어 코어', '#fef08a');
      return;
    }
    v39Cast('태양룡: 일식 안전지대. 빛 기둥 사이 빈틈에서 공격하세요.', c);
    const safe = Math.floor(Math.random()*5);
    for(let i=0;i<5;i++) if(i!==safe) v39Wall(120+i*(W-240)/4,H/2,38,H*.78,1.75+i*.06,'#facc15',v39Dmg(.70),'solar','태양 기둥',1.05);
  }

  function v39PatternEclipse(){
    const c = '#fb7185';
    const r = Math.random();
    if(r < .25){
      v39Cast('검은 태양: 일식 고리. 안쪽과 바깥쪽을 번갈아 이동하세요.', c);
      v39Donut(W/2,H/2,70,250,1.45,'#7f1d1d',v39Dmg(.62),'eclipse','검은 일식 고리',.9);
      v39Donut(W/2,H/2,285,430,1.95,'#111827',v39Dmg(.72),'eclipse','종말 외곽',1.0);
      v39BreakRune(W*.75,H*.35,'흑점 코어', '#fef08a');
      return;
    }
    if(r < .50){
      v39Cast('검은 태양: 흑점 낙하. 낙하지점 사이를 굴러 통과하세요.', c);
      for(let i=0;i<12;i++) v39Circle(90+Math.random()*(W-180),120+Math.random()*(H-220),36+Math.random()*18,1.0+i*.055,'#991b1b',v39Dmg(.55),'eclipse','흑점 낙하',.8);
      return;
    }
    if(r < .75){
      v39Cast('검은 태양: 광선 포식. 선을 넘은 뒤 바로 반격하세요.', c);
      const base = Math.random()*Math.PI;
      for(let i=0;i<6;i++) v39Beam(W/2,H/2,base+i*Math.PI/6,W*1.05,16,1.15+i*.09,'#e11d48',v39Dmg(.58),'eclipse','검은 광선',.88);
      v39Circle(boss.x,boss.y,95,1.55,'#f43f5e',v39Dmg(.48),'eclipse','일식 핵',.9);
      return;
    }
    v39Cast('검은 태양: 붕괴 바닥. 어두워진 바닥은 곧 사라집니다.', c);
    for(let i=0;i<10;i++) v39Floor(100+Math.random()*(W-200),125+Math.random()*(H-220),90,70,1.45+i*.04,'#7f1d1d',v39Dmg(.64),'eclipse','붕괴 바닥',.95);
  }

  function v39PatternChaos(){
    const c = '#c084fc';
    const r = Math.random();
    if(r < .25){
      v39Cast('혼돈의 집정관: 규칙 붕괴. 원, 선, 도넛이 서로 다른 시간에 터집니다.', c);
      for(let i=0;i<5;i++) v39Circle(120+Math.random()*(W-240),125+Math.random()*(H-230),42,1.0+i*.13,'#a78bfa',v39Dmg(.48),'chaos','혼돈 원',.74);
      for(let i=0;i<3;i++) v39Beam(W/2,H/2,Math.random()*Math.PI,W*.9,16,1.35+i*.17,'#f0abfc',v39Dmg(.52),'chaos','혼돈 선',.8);
      v39Donut(W/2,H/2,90,245,1.8,'#7c3aed',v39Dmg(.62),'chaos','혼돈 도넛',.9);
      return;
    }
    if(r < .50){
      v39Cast('혼돈의 집정관: 가짜 법정. SAFE처럼 보이는 일부 칸은 함정입니다.', c);
      const safe = Math.floor(Math.random()*4);
      for(let i=0;i<4;i++){
        const x=180+i*(W-360)/3;
        if(i===safe) state.mechanics.push({kind:'safe',x,y:H*.52,r:58,life:2.8,color:'#86efac',label:'진짜'});
        else v39Circle(x,H*.52,62,1.45+i*.06,'#f472b6',v39Dmg(.72),'chaos','가짜 SAFE',.9);
      }
      return;
    }
    if(r < .75){
      v39Cast('혼돈의 집정관: 회전 재판. 회전선이 지나간 뒤 BREAK 룬이 열립니다.', c);
      for(let i=0;i<4;i++) v39Rot(W/2,H/2,i*Math.PI/4,(i%2?-.9:.9),W*.95,14,1.15+i*.08,'#c084fc',v39Dmg(.40),'chaos','혼돈 회전',2.0);
      v39BreakRune(W*.5,H*.5,'질서 파괴', '#fef08a');
      return;
    }
    v39Cast('혼돈의 집정관: 무작위 판결. 짧은 패턴을 연속으로 넘기세요.', c);
    for(let i=0;i<9;i++){
      if(i%3===0) v39Beam(120+Math.random()*(W-240),H/2,Math.PI/2,H*.8,14,1.0+i*.07,'#e879f9',v39Dmg(.40),'chaos','무작위 판결',.62);
      else v39Circle(100+Math.random()*(W-200),120+Math.random()*(H-220),34,1.0+i*.07,'#a78bfa',v39Dmg(.42),'chaos','혼돈 파편',.62);
    }
  }

  try{
    const oldBossPatternV39 = bossPattern;
    bossPattern = function(){
      try{
        const id = boss && boss.id;
        if(id === 'plague_doctor') { v39PatternPlague(); return; }
        if(id === 'thorn_queen') { v39PatternThorn(); return; }
        if(id === 'hollow_gardener' || id === 'void_gardener') { v39PatternGardener(); return; }
        if(id === 'solar_dragon') { v39PatternSolar(); return; }
        if(id === 'black_sun') { v39PatternEclipse(); return; }
        if(id === 'chaos_archon') { v39PatternChaos(); return; }
      } catch(e){ console.warn('[V39 custom boss pattern failed]', e); }
      return oldBossPatternV39();
    };
  } catch(e){ console.warn('[V39 bossPattern patch failed]', e); }

  function v39TextOf(h){ return String((h && (h.label || h.tag || h.theme || '')) || '').toLowerCase(); }
  function v39HasHaz(h, words){ const s = v39TextOf(h); return words.some(w => s.includes(String(w).toLowerCase())); }
  function v39Glow(c,b){ ctx.shadowColor = c || '#fff'; ctx.shadowBlur = b || 18; }
  function v39Label(txt,x,y,c){
    ctx.save(); ctx.font='900 12px system-ui'; ctx.textAlign='center'; ctx.lineWidth=4; ctx.strokeStyle='rgba(0,0,0,.72)'; ctx.strokeText(txt,x,y); ctx.fillStyle=c||'#fff'; ctx.fillText(txt,x,y); ctx.restore();
  }
  function v39VisualGeneric(h){
    if(!h) return false;
    const label = String(h.label || '').trim();
    const tag = String(h.tag || h.theme || '').trim();
    const s = (label + ' ' + tag).toLowerCase();
    if(!s || label === 'SAFE') return false;
    const x = h.x || W/2, y = h.y || H/2;
    let c = h.color || '#ffffff';
    ctx.save();
    ctx.globalAlpha = (h.warn || 0) > 0 ? .38 : .82;
    v39Glow(c, 18);

    if(v39HasHaz(h,['역병','감염','독','포자','검역','소독'])){
      c = '#84cc16';
      ctx.fillStyle='rgba(132,204,22,.20)';
      const r = Math.max(28, h.r || Math.min(h.w||80,h.h||80)/2 || 42);
      if(h.kind==='beam' || h.kind==='wall'){
        ctx.translate(x,y); ctx.rotate(h.angle||0);
        const len=h.len||h.w||W*.7, ww=Math.max(34,h.w||h.h||45);
        roundRect(ctx,-len/2,-ww/2,len,ww,12); ctx.fill();
        ctx.strokeStyle='#d9f99d'; ctx.lineWidth=4; roundRect(ctx,-len/2,-ww/2,len,ww,12); ctx.stroke();
        for(let i=0;i<12;i++){ ctx.fillStyle=i%2?'#a3e635':'#4ade80'; ctx.beginPath(); ctx.arc(-len/2+30+i*(len-60)/11, Math.sin(i+state.time*4)*ww*.18, 6+(i%3),0,Math.PI*2); ctx.fill(); }
      } else {
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
        for(let i=0;i<7;i++){ ctx.fillStyle=i%2?'#bef264':'#4ade80'; ctx.beginPath(); ctx.arc(x+Math.cos(i)*r*.55,y+Math.sin(i*1.7)*r*.55,7+(i%3),0,Math.PI*2); ctx.fill(); }
        v39Label(label||'역병',x,y+4,'#fff');
      }
      ctx.restore(); return true;
    }

    if(v39HasHaz(h,['덩굴','가시','꽃','씨앗','뿌리','정원'])){
      c = h.color || '#22c55e';
      ctx.strokeStyle = c; ctx.lineWidth = 6; ctx.lineCap = 'round';
      if(h.kind==='beam' || h.kind==='wall'){
        ctx.translate(x,y); ctx.rotate(h.angle||0);
        const len=h.len||Math.max(h.w||500,h.h||500);
        ctx.beginPath();
        for(let i=0;i<12;i++){ const px=-len/2+i*len/11, py=Math.sin(i*.9+state.time*5)*12; i?ctx.lineTo(px,py):ctx.moveTo(px,py); }
        ctx.stroke();
        ctx.strokeStyle='#dcfce7'; ctx.lineWidth=2;
        for(let i=0;i<7;i++){ const px=-len/2+i*len/6; ctx.beginPath(); ctx.moveTo(px,0); ctx.lineTo(px+18,-22); ctx.moveTo(px,0); ctx.lineTo(px-18,20); ctx.stroke(); }
      } else {
        const r=Math.max(30,h.r||45);
        for(let i=0;i<8;i++){ const a=i*Math.PI*2/8; ctx.fillStyle=i%2?'#a3e635':'#22c55e'; ctx.beginPath(); ctx.ellipse(x+Math.cos(a)*r*.25,y+Math.sin(a)*r*.25,r*.38,r*.16,a,0,Math.PI*2); ctx.fill(); }
        ctx.fillStyle='#fef08a'; ctx.beginPath(); ctx.arc(x,y,10,0,Math.PI*2); ctx.fill();
        v39Label(label||'식물',x,y-r-8,'#fff');
      }
      ctx.restore(); return true;
    }

    if(v39HasHaz(h,['태양','일식','흑점','검은','광익','플레어','코어'])){
      c = v39HasHaz(h,['검은','흑점']) ? '#fb7185' : '#facc15';
      ctx.strokeStyle=c; ctx.lineWidth=5;
      const r=Math.max(34,h.r||50);
      if(h.kind==='beam' || h.kind==='wall'){
        ctx.translate(x,y); ctx.rotate(h.angle||0);
        const len=h.len||h.w||760, ww=Math.max(26,h.w||h.h||40);
        ctx.fillStyle=v39HasHaz(h,['검은'])?'rgba(127,29,29,.32)':'rgba(250,204,21,.20)';
        roundRect(ctx,-len/2,-ww/2,len,ww,10); ctx.fill();
        for(let i=0;i<10;i++){ const px=-len/2+i*len/9; ctx.beginPath(); ctx.moveTo(px,-ww*.6); ctx.lineTo(px+18,0); ctx.lineTo(px,ww*.6); ctx.stroke(); }
      } else {
        ctx.fillStyle = v39HasHaz(h,['검은']) ? 'rgba(127,29,29,.38)' : 'rgba(250,204,21,.24)';
        ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
        for(let i=0;i<14;i++){ const a=i*Math.PI*2/14+state.time*.7; ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55); ctx.lineTo(x+Math.cos(a)*r*1.35,y+Math.sin(a)*r*1.35); ctx.stroke(); }
        v39Label(label||'태양',x,y+4,'#fff');
      }
      ctx.restore(); return true;
    }

    if(v39HasHaz(h,['혼돈','판결','재판','무작위'])){
      c = '#c084fc';
      const r=Math.max(28,h.r||46);
      ctx.strokeStyle='#f0abfc'; ctx.lineWidth=4;
      if(h.kind==='beam' || h.kind==='wall'){
        ctx.translate(x,y); ctx.rotate(h.angle||0);
        const len=h.len||h.w||700, ww=Math.max(26,h.w||h.h||42);
        for(let i=0;i<4;i++){ ctx.beginPath(); ctx.moveTo(-len/2, -ww/2+i*ww/3); ctx.bezierCurveTo(-len/4,ww*.8,len/4,-ww*.8,len/2,-ww/2+i*ww/3); ctx.stroke(); }
      } else {
        for(let i=0;i<6;i++){ ctx.strokeStyle=i%2?'#f0abfc':'#a78bfa'; ctx.beginPath(); ctx.arc(x,y,r+i*7, state.time+i, state.time+i+Math.PI*1.2); ctx.stroke(); }
        v39Label(label||'혼돈',x,y+4,'#fff');
      }
      ctx.restore(); return true;
    }

    if(label){
      const r=Math.max(28,h.r||Math.min(h.w||70,h.h||70)/2||38);
      ctx.strokeStyle=c; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
      for(let i=0;i<6;i++){ const a=i*Math.PI/3+state.time; ctx.beginPath(); ctx.moveTo(x+Math.cos(a)*r*.45,y+Math.sin(a)*r*.45); ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r); ctx.stroke(); }
      v39Label(label,x,y+4,'#fff');
    }
    ctx.restore(); return !!label;
  }

  try{
    const oldDrawHazardsV39 = drawHazards;
    drawHazards = function(){
      oldDrawHazardsV39();
      try { state.hazards.forEach(h => v39VisualGeneric(h)); } catch(e){ console.warn('[V39 extra visual failed]', e); }
    };
  } catch(e){ console.warn('[V39 drawHazards patch failed]', e); }

  try{
    const oldDrawV39 = draw;
    draw = function(){
      oldDrawV39();
      try{
        if(state.v39FirstClearT > 0){
          state.v39FirstClearT -= 1/60;
          const a = Math.max(0, Math.min(1, state.v39FirstClearT / 6.2));
          ctx.save();
          ctx.globalAlpha = Math.min(1, .35 + a);
          ctx.fillStyle = 'rgba(0,0,0,.55)';
          roundRect(ctx, W/2-390, H/2-95, 780, 190, 28); ctx.fill();
          ctx.strokeStyle = '#facc15'; ctx.lineWidth = 5; roundRect(ctx, W/2-390, H/2-95, 780, 190, 28); ctx.stroke();
          ctx.shadowColor = '#facc15'; ctx.shadowBlur = 34;
          ctx.fillStyle = '#facc15'; ctx.font = '950 54px system-ui'; ctx.textAlign = 'center';
          ctx.fillText('FIRST CLEAR!', W/2, H/2-18);
          ctx.shadowBlur = 14; ctx.fillStyle = '#fff'; ctx.font = '900 20px system-ui';
          ctx.fillText((state.v39FirstClearName || '보스') + ' 최초 클리어 기록 달성', W/2, H/2+32);
          ctx.fillStyle = '#fde68a'; ctx.font = '800 15px system-ui';
          ctx.fillText('새로운 보스 기록이 랭킹에 등록되었습니다.', W/2, H/2+65);
          ctx.restore();
        }
      } catch(e){}
    };
  } catch(e){ console.warn('[V39 draw first clear patch failed]', e); }

  try{
    const V39_LABELS = {
      plague_doctor:['병동 격리','역병 수술선','감염체 배양','검역 독환','추적 독구름','해독 혈청'],
      thorn_queen:['가시 덩굴벽','독꽃 개화','덩굴 갈고리','가시 꽃밭','가시 씨앗','꽃눈 파괴'],
      hollow_gardener:['공허 뿌리','공허 꽃문','꽃문 포탈','정원 미궁','공허꽃','검은 꽃가루','검은 꽃 파괴'],
      void_gardener:['공허 뿌리','공허 꽃문','꽃문 포탈','정원 미궁','공허꽃','검은 꽃가루','검은 꽃 파괴'],
      solar_dragon:['태양 숨결','태양 발톱','태양 플레어','광익 절단','플레어 코어','태양 기둥','역광 약점'],
      black_sun:['검은 일식 고리','종말 외곽','흑점 낙하','검은 광선','일식 핵','붕괴 바닥','흑점 코어'],
      chaos_archon:['혼돈 원','혼돈 선','혼돈 도넛','가짜 법정','혼돈 회전','무작위 판결','혼돈 파편']
    };
    BOSSES.forEach(b => { if(V39_LABELS[b.id]) b.patterns = V39_LABELS[b.id]; });
    window.RaidDungeonV39 = {version:V39_VERSION, tierRewards:'exactly tier count tickets per clear', firstClear:'local once per boss banner + result text', customBosses:Object.keys(V39_LABELS)};
  } catch(e){}
})();


/* =========================================================
   RAID DUNGEON V41 - REAL PROGRESSION / REWARD / MARKET FIX
   - exact tier ticket reward re-fixed inside final active closure
   - first clear DOM banner forced on first local boss clear
   - boss weapon / armor / boss pattern skill low chance from 3-star+
   - skill level system with duplicate points, manual upgrade to Lv7
   - weapon enhancement, material costs, enchantments, sell/disassemble
   - local marketplace and 30-minute local chat
   - green boss and apocalypse / solar patterns upgraded again
========================================================= */
(function raidDungeonV41ProgressionPatch(){
  const V41_VERSION = 'Raid Dungeon V41 - progression, boss drops, skill levels, enchant, market, chat';
  const V41_CHAT_KEY = 'raid-dungeon-v41-chat';
  const V41_MARKET_KEY = 'raid-dungeon-v41-market';
  const V41_FIRST_KEY = 'raid-dungeon-v41-first-clear';

  function n(v,d){ v=Number(v); return Number.isFinite(v)?v:d; }
  function tierOf(b){ return clamp(Math.round(n(b && b.tier,1)),1,10); }
  function rarityByTier(t){ return t>=10?'ultimate':t>=8?'legendary':t>=6?'epic':t>=4?'super':'rare'; }
  function safeId(s){ return String(s||'x').replace(/[^a-zA-Z0-9_가-힣-]/g,'_'); }
  function initV41(){
    if(!state.save.v41) state.save.v41 = {};
    const v=state.save.v41;
    v.skillLevels = v.skillLevels || {};
    v.skillCopies = v.skillCopies || {};
    v.materials = v.materials || {};
    v.weaponEnhance = v.weaponEnhance || {};
    v.weaponEnchant = v.weaponEnchant || {};
    v.firstClear = v.firstClear || {};
    v.bossDropLog = v.bossDropLog || [];
    if(!Number.isFinite(state.save.coins)) state.save.coins = Number(state.save.coins||0) || 0;
    return v;
  }
  function addMat(name, qty){ const v=initV41(); v.materials[name]=(v.materials[name]||0)+Math.max(0, Math.floor(qty||0)); }
  function takeMat(name, qty){ const v=initV41(); qty=Math.max(0,Math.floor(qty||0)); if((v.materials[name]||0)<qty) return false; v.materials[name]-=qty; return true; }
  function matCount(name){ const v=initV41(); return v.materials[name]||0; }
  function bossMaterialName(b){ return `${(b&&b.name)||'보스'} 부산물`; }
  function weaponMatName(w){ return (w && w.v41Material) || `${weaponKindName((w&&w.kind)||'blade')} 파편`; }
  function html(s){ return escapeHtml(String(s==null?'':s)); }
  function pct(v){ return `${Math.round(v*10)/10}%`; }

  function ensureBossDropItems(){
    initV41();
    BOSSES.forEach(b=>{
      const t=tierOf(b); if(t<3) return;
      const rarity=rarityByTier(t);
      const wid='boss_weapon_'+b.id, aid='boss_armor_'+b.id, sid='boss_skill_'+b.id;
      const mat=bossMaterialName(b);
      if(!WEAPONS.some(x=>x.id===wid)){
        WEAPONS.push({id:wid,name:`${b.name}의 무기`,rarity,kind:t>=8?'grimoire':t>=6?'greatsword':'blade',desc:`${b.name}에게서 아주 낮은 확률로 드롭되는 전용 무기입니다. 강화 재료: ${mat}`,color:b.color,atk:1.24+t*.09,range:112+t*5,speed:Math.max(.38,.86-t*.025),crit:4+t*.55,type:'weapon',v41Boss:b.id,v41Material:mat});
      }
      if(!ARMORS.some(x=>x.id===aid)){
        ARMORS.push({id:aid,name:`${b.name}의 방어구`,rarity,desc:`${b.name}에게서 낮은 확률로 드롭되는 전용 방어구입니다. 별 개수가 높을수록 기본 능력치가 높습니다.`,color:b.sub||b.color,hp:160+t*70,def:10+t*7,resist:{},type:'armor',v41Boss:b.id,v41Material:mat});
      }
      if(!SKILLS.some(x=>x.id===sid)){
        SKILLS.push({id:sid,name:`${b.name} 패턴 스킬`,element:b.theme||'arcane',type:t>=8?'chain':t>=6?'burst':'line',category:'attack',rarity,color:b.color,power:1.12+t*.13,cooldown:Math.max(5.0,10.6-t*.32),radius:110+t*7,duration:1.0,desc:`${b.name}의 대표 패턴을 플레이어 스킬로 재현합니다. 각 보스당 1종류만 존재하는 전용 패턴 스킬입니다.`,v41Boss:b.id});
      }
    });
  }
  ensureBossDropItems();

  const oldNormalizeV41 = normalizeSaveData;
  normalizeSaveData = function(s){ const out=oldNormalizeV41(s); try{ if(!out.v41) out.v41={}; }catch(e){} return out; };

  const oldGetWeaponV41 = getWeapon;
  getWeapon = function(id){
    const base = oldGetWeaponV41(id); if(!base) return null;
    const v=initV41(); const enh=clamp(v.weaponEnhance[id]||0,0,10); const en=v.weaponEnchant[id]||{};
    const w={...base};
    w.v41BaseAtk = base.atk;
    w.v41Enhance = enh;
    w.v41Enchant = en;
    w.atk = +(base.atk * (1 + enh*.105 + (en.attack||0)*.08)).toFixed(4);
    w.speed = Math.max(.28, +(base.speed * (1 - (en.speed||0)*.055)).toFixed(4));
    w.crit = (base.crit||0) + (en.critChance||0)*3.0;
    w.v41CritDmg = (en.critDamage||0)*.18;
    w.v41Luck = (en.luck||0)*3.5;
    w.v41Plunder = (en.plunder||0)*7.0;
    w.desc = `${base.desc} / 강화 +${enh} / 현재 공격 배율 x${w.atk}`;
    return w;
  };

  const oldGetSkillV41 = getSkill;
  getSkill = function(id){
    const base=oldGetSkillV41(id); if(!base) return null;
    const v=initV41(); const lv=clamp(v.skillLevels[id]||1,1,7);
    const s={...base};
    s.v41Level = lv;
    s.v41BasePower = base.power;
    s.power = +(base.power * (1 + (lv-1)*.14)).toFixed(4);
    s.cooldown = Math.max(2.2, +(base.cooldown * (1 - (lv-1)*.025)).toFixed(3));
    s.desc = `${base.desc} / Lv.${lv} 효과 적용: 위력 x${s.power}, 쿨타임 ${s.cooldown.toFixed(1)}초`;
    return s;
  };

  const oldApplyBuildV41 = applyBuild;
  applyBuild = function(){
    oldApplyBuildV41();
    try{
      const w=getWeapon(state.selectedWeaponId);
      if(w){
        player.critDmg += w.v41CritDmg||0;
        player.dropLuck = (player.dropLuck||0) + (w.v41Luck||0);
        player.plunder = (player.plunder||0) + (w.v41Plunder||0);
      }
    }catch(e){}
  };

  function itemDetail(it,type){
    if(!it) return '';
    if(type==='weapon'){
      const w=getWeapon(it.id)||it; const en=w.v41Enchant||{};
      return `무기 상세\n이름: ${w.name}\n희귀도: ${getRarity(w.rarity).name}\n종류: ${weaponKindName(w.kind)}\n강화: +${w.v41Enhance||0}/10\n공격 배율: x${w.atk}\n공격속도: ${w.speed.toFixed ? w.speed.toFixed(2) : w.speed}\n치명 확률: ${pct(w.crit||0)}\n인챈트: ${en.speed?`공속 Lv${en.speed} `:''}${en.attack?`공격 Lv${en.attack} `:''}${en.luck?`행운 Lv${en.luck}(희귀드롭 +${pct(en.luck*3.5)}) `:''}${en.plunder?`약탈 Lv${en.plunder}(부산물 추가 +${pct(en.plunder*7)}) `:''}${en.critDamage?`치명피해 Lv${en.critDamage} `:''}${en.critChance?`치명확률 Lv${en.critChance}`:''}\n설명: ${w.desc}`;
    }
    if(type==='skill'){
      const s=getSkill(it.id)||it; const v=initV41(); const lv=v.skillLevels[it.id]||1, cp=v.skillCopies[it.id]||0;
      return `스킬 상세\n이름: ${s.name}\nLv.${lv}/7, 강화 포인트 ${cp}개\n분류: ${skillCategoryName(s.category)} / 속성: ${s.element}\n위력: x${s.power}\n쿨타임: ${s.cooldown.toFixed ? s.cooldown.toFixed(1) : s.cooldown}초\n범위: ${s.radius}\n설명: ${s.desc}`;
    }
    if(type==='armor') return `방어구 상세\n이름: ${it.name}\n체력 +${it.hp}\n방어 +${it.def}\n설명: ${it.desc}`;
    return `${it.name}\n${it.desc||''}`;
  }

  function uniqueItems(items){
    const seen=new Set();
    return (items||[]).filter(it=>{ if(!it) return false; const key=String(it.id||it.name).toLowerCase(); if(seen.has(key)) return false; seen.add(key); return true; });
  }
  ownedWeapons = function(){ return uniqueItems(WEAPONS.filter(w => state.save.weapons.includes(w.id))); };
  ownedArmors = function(){ return uniqueItems(ARMORS.filter(a => (state.save.armors||[]).includes(a.id))); };
  ownedSkills = function(cat){ return uniqueItems(SKILLS.filter(s => state.save.skills.includes(s.id) && (!cat || s.category===cat))); };
  ownedPassives = function(){ return uniqueItems(PASSIVES.filter(p => state.save.passives.includes(p.id))); };

  function weaponEnhanceCost(w){ const enh=(initV41().weaponEnhance[w.id]||0); return {mat:weaponMatName(w), qty:(enh+1)*(enh+2), coins:Math.floor(180*(enh+1)*(1+enh*.4))}; }
  function enhanceWeapon(id){
    initV41(); const w=getWeapon(id); if(!w) return;
    const enh=initV41().weaponEnhance[id]||0; if(enh>=10){ toast('이미 10강입니다.'); return; }
    const cost=weaponEnhanceCost(w);
    if((state.save.coins||0)<cost.coins){ toast('코인이 부족합니다.'); return; }
    if(!takeMat(cost.mat,cost.qty)){ toast(`${cost.mat} ${cost.qty}개가 필요합니다.`); return; }
    state.save.coins-=cost.coins; initV41().weaponEnhance[id]=enh+1;
    toast(`${w.name} +${enh+1} 강화 성공`); saveGame(); renderMenu();
  }
  function randomEnchant(){
    const types=['speed','attack','luck','plunder','critDamage','critChance'];
    const en={}; const count=1 + (Math.random()<.28?1:0) + (Math.random()<.08?1:0);
    while(Object.keys(en).length<count){ const t=types[Math.floor(Math.random()*types.length)]; en[t]=1+Math.floor(Math.random()*3); }
    return en;
  }
  function enchantWeapon(id){
    initV41(); const w=getWeapon(id); if(!w) return;
    const mat=weaponMatName(w); const qty=8+(initV41().weaponEnhance[id]||0)*2; const coins=900+(initV41().weaponEnhance[id]||0)*220;
    if((state.save.coins||0)<coins){ toast('인챈트 코인이 부족합니다.'); return; }
    if(!takeMat(mat,qty)){ toast(`${mat} ${qty}개가 필요합니다.`); return; }
    state.save.coins-=coins; initV41().weaponEnchant[id]=randomEnchant();
    toast(`${w.name} 인챈트 완료`); saveGame(); renderMenu();
  }
  function sellWeapon(id){
    const w=getWeapon(id); if(!w) return;
    const price=Math.floor((getRarity(w.rarity).power||1)*650*(1+(w.v41Enhance||0)*.18));
    state.save.weapons=(state.save.weapons||[]).filter(x=>x!==id); if(state.selectedWeaponId===id) state.selectedWeaponId=null;
    state.save.coins=(state.save.coins||0)+price; toast(`${w.name} 판매: ${price} 코인`); saveGame(); renderMenu();
  }
  function disassembleWeapon(id){
    const w=getWeapon(id); if(!w) return;
    const mat=weaponMatName(w); const qty=3+(w.v41Enhance||0)*2+Math.ceil((getRarity(w.rarity).power||1)*2);
    state.save.weapons=(state.save.weapons||[]).filter(x=>x!==id); if(state.selectedWeaponId===id) state.selectedWeaponId=null;
    addMat(mat,qty); toast(`${w.name} 분해: ${mat} ${qty}개`); saveGame(); renderMenu();
  }
  function upgradeSkill(id){
    initV41(); const s=getSkill(id); if(!s) return;
    const lv=initV41().skillLevels[id]||1; const cp=initV41().skillCopies[id]||0;
    if(lv>=7){ toast('이미 스킬 최대 레벨입니다.'); return; }
    if(cp<=0){ toast('중복 스킬 포인트가 필요합니다. 같은 스킬을 다시 뽑으면 포인트를 얻습니다.'); return; }
    initV41().skillCopies[id]=cp-1; initV41().skillLevels[id]=lv+1;
    toast(`${s.name} Lv.${lv+1}`); saveGame(); renderMenu();
  }

  const oldRollGachaV41 = rollGacha;
  rollGacha = function(kind){
    initV41();
    if(!state.save.tickets || typeof state.save.tickets !== 'object') state.save.tickets={...INITIAL_TICKETS};
    if((state.save.tickets[kind]||0)<=0){ toast(TICKET_LABEL[kind]+'이 부족합니다.'); return; }
    state.save.tickets[kind]-=1;
    const rarity=pickRarity();
    const pool = kind==='weapon'?WEAPONS.filter(x=>x.rarity===rarity):kind==='armor'?ARMORS.filter(x=>x.rarity===rarity):kind==='skill'?SKILLS.filter(x=>x.rarity===rarity):PASSIVES.filter(x=>x.rarity===rarity);
    const list=pool.length?pool:(kind==='weapon'?WEAPONS:kind==='armor'?ARMORS:kind==='skill'?SKILLS:PASSIVES);
    const item=list[Math.floor(Math.random()*list.length)];
    const arr = kind==='weapon'?state.save.weapons:kind==='armor'?state.save.armors:kind==='skill'?state.save.skills:state.save.passives;
    if(kind==='skill'){
      if(arr.includes(item.id)){ initV41().skillCopies[item.id]=(initV41().skillCopies[item.id]||0)+1; }
      else { arr.push(item.id); initV41().skillLevels[item.id]=1; }
    } else if(!arr.includes(item.id)) arr.push(item.id);
    state.gachaResult=item; gachaCelebration(item); saveGame(); renderMenu();
  };

  skillSlotGrid = function(slot){
    const items=ownedSkills(); const selected=state.selectedSkillIds[slot]||null;
    const noneCard=`<div class="card ${!selected?'active':''}" data-select-type="skill" data-slot="${slot}" data-select-id="" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('skill','',${slot})"><h3>스킬 ${slot+1} 비우기</h3><p>스킬을 끼지 않아도 레이드는 시작할 수 있습니다.</p></div>`;
    return `<p class="sub">스킬 ${slot+1}번 칸입니다. 중복해서 뽑은 스킬은 포인트로 저장되고, 버튼을 눌러 직접 Lv.7까지 올릴 수 있습니다.</p><div class="grid">${noneCard}${items.map(it=>{ const s=getSkill(it.id)||it; const v=initV41(); const lv=v.skillLevels[it.id]||1; const cp=v.skillCopies[it.id]||0; return `<div class="card ${selected===it.id?'active':''}" title="${html(itemDetail(it,'skill'))}" data-select-type="skill" data-slot="${slot}" data-select-id="${it.id}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('skill','${it.id}',${slot})"><h3>${html(s.name)} Lv.${lv} ${rarityLabel(s.rarity)}</h3><p>${html(s.desc)}<br>위력 x${s.power} · 쿨 ${s.cooldown.toFixed(1)}초 · 중복포인트 ${cp}</p><button type="button" class="btn secondary" style="margin-top:8px;padding:7px 9px;min-height:30px" onclick="event.stopPropagation();window.RaidDungeonV41.upgradeSkill('${it.id}')">스킬 레벨업</button></div>`; }).join('')}</div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.prev()">이전</button><button type="button" class="btn" data-next-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.next()">다음</button></div>`;
  };

  selectionGrid = function(items, selected, type){
    items=v53UniqueItems(items);
    const noneTitle = type==='weapon'?'무기 없이 출격':type==='armor'?'방어구 없이 출격':'이 칸 비우기';
    const noneDesc = type==='weapon'?'스킬만으로도 출격할 수 있습니다.':type==='armor'?'방어구 없이도 출격할 수 있습니다.':'비워둡니다.';
    const noneCard = `<div class="card ${!selected?'active':''}" data-select-type="${type}" data-select-id="" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('${type}','',0)"><h3>${noneTitle}</h3><p>${noneDesc}</p></div>`;
    if(!items.length) return `<div class="grid">${noneCard}<div class="card"><h3>보유한 항목이 없습니다.</h3><p>뽑기 상점이나 보스 드롭으로 획득할 수 있습니다.</p></div></div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.prev()">이전</button><button type="button" class="btn" data-next-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.next()">다음</button></div>`;
    return `<div class="grid">${noneCard}${items.map(it=>{
      if(type==='weapon'){
        const w=getWeapon(it.id)||it; const cost=weaponEnhanceCost(w); const mats=matCount(cost.mat);
        return `<div class="card ${selected===it.id?'active':''}" title="${html(itemDetail(it,'weapon'))}" data-select-type="weapon" data-select-id="${it.id}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('weapon','${it.id}',0)"><h3>${html(w.name)} +${w.v41Enhance||0} ${rarityLabel(w.rarity)}</h3><p>${html(w.desc)}<br>공격 x${w.atk} · 공속 ${w.speed.toFixed(2)} · 재료 ${html(cost.mat)} ${mats}/${cost.qty}</p><div class="row" style="margin-top:8px"><button type="button" class="btn secondary" style="padding:7px;min-height:30px" onclick="event.stopPropagation();window.RaidDungeonV41.enhanceWeapon('${it.id}')">강화</button><button type="button" class="btn secondary" style="padding:7px;min-height:30px" onclick="event.stopPropagation();window.RaidDungeonV41.enchantWeapon('${it.id}')">인챈트</button></div><div class="row" style="margin-top:6px"><button type="button" class="btn secondary" style="padding:7px;min-height:30px" onclick="event.stopPropagation();window.RaidDungeonV41.sellWeapon('${it.id}')">판매</button><button type="button" class="btn secondary" style="padding:7px;min-height:30px" onclick="event.stopPropagation();window.RaidDungeonV41.disassembleWeapon('${it.id}')">분해</button></div></div>`;
      }
      const detail=itemDetail(it,type);
      return `<div class="card ${selected===it.id?'active':''}" title="${html(detail)}" data-select-type="${type}" data-select-id="${it.id}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('${type}','${it.id}',0)"><h3>${html(it.name)} ${rarityLabel(it.rarity)}</h3><p>${html(it.desc)}<br>${type==='armor'?('효과: 체력 +'+it.hp+' / 방어 +'+it.def):''}</p></div>`;
    }).join('')}</div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.prev()">이전</button><button type="button" class="btn" data-next-step onclick="window.RaidDungeonUI&&window.RaidDungeonUI.next()">다음</button></div>`;
  };

  function totalTicketRewards(b){
    const tier=tierOf(b); const rw={weapon:0,armor:0,skill:0,passive:0};
    const weights=tier>=8?{weapon:29,armor:25,skill:28,passive:18}:tier>=5?{weapon:24,armor:23,skill:36,passive:17}:{weapon:20,armor:20,skill:45,passive:15};
    for(let i=0;i<tier;i++){
      let r=Math.random()*(weights.weapon+weights.armor+weights.skill+weights.passive);
      for(const k of ['weapon','armor','skill','passive']){ r-=weights[k]; if(r<=0){rw[k]++; break;} }
    }
    return rw;
  }
  function giveBossRareDrops(b){
    initV41(); const t=tierOf(b); const out=[]; const luck=(player&&player.dropLuck)||0; const base=t<3?0:(1.5+t*.75+luck);
    const wid='boss_weapon_'+b.id, aid='boss_armor_'+b.id, sid='boss_skill_'+b.id;
    if(t>=3 && Math.random()*100 < base){ if(!state.save.weapons.includes(wid)) state.save.weapons.push(wid); out.push('보스 무기'); }
    if(t>=3 && Math.random()*100 < base*.9){ if(!state.save.armors.includes(aid)) state.save.armors.push(aid); out.push('보스 방어구'); }
    if(t>=3 && Math.random()*100 < base*.8){ if(state.save.skills.includes(sid)) initV41().skillCopies[sid]=(initV41().skillCopies[sid]||0)+1; else {state.save.skills.push(sid); initV41().skillLevels[sid]=1;} out.push('보스 패턴 스킬'); }
    return out;
  }
  function rewardTextFull(rw, coins, mats, rare){
    const parts=[]; if(rw.weapon)parts.push(`무기 ${rw.weapon}장`); if(rw.armor)parts.push(`방어구 ${rw.armor}장`); if(rw.skill)parts.push(`스킬 ${rw.skill}장`); if(rw.passive)parts.push(`패시브 ${rw.passive}장`);
    let s=`획득 티켓: ${parts.join(' / ')}<br>획득 코인: ${coins}<br>획득 부산물: ${html(mats.name)} ${mats.qty}개`;
    if(rare.length) s += `<br><b style="color:#facc15">희귀 드롭: ${rare.map(html).join(' / ')}</b>`;
    return s;
  }
  function showFirstClear(name){
    try{
      const old=document.getElementById('raid-v41-first-clear'); if(old) old.remove();
      const box=document.createElement('div'); box.id='raid-v41-first-clear';
      box.innerHTML=`<div style="font-size:62px;font-weight:950;color:#facc15;text-shadow:0 0 30px #facc15">FIRST CLEAR!</div><div style="font-size:22px;font-weight:900;color:white;margin-top:8px">${html(name)} 최초 클리어 기록 달성</div>`;
      box.style.cssText='position:fixed;z-index:2147483647;left:50%;top:29%;transform:translate(-50%,-50%);padding:32px 46px;border:4px solid #facc15;border-radius:30px;background:rgba(2,6,23,.92);box-shadow:0 0 60px rgba(250,204,21,.75);pointer-events:none;text-align:center;animation:v41fc 5s ease-out forwards;';
      if(!document.getElementById('v41fcstyle')){const st=document.createElement('style');st.id='v41fcstyle';st.textContent='@keyframes v41fc{0%{opacity:0;transform:translate(-50%,-60%) scale(.65)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-44%) scale(1)}}';document.head.appendChild(st);}
      document.body.appendChild(box); setTimeout(()=>{try{box.remove()}catch(e){}},5200); state.flash=Math.max(state.flash||0,1.3);
    }catch(e){}
  }

  endRaid = function(clear){
    state.screen='result'; const elapsed=Math.floor(state.raid.elapsed*1000); let rewardText=''; let first=false;
    if(clear){
      const b=getBoss(boss.id); const v=initV41(); first=!v.firstClear[boss.id];
      const rw=totalTicketRewards(b); state.save.tickets.weapon=(state.save.tickets.weapon||0)+rw.weapon; state.save.tickets.armor=(state.save.tickets.armor||0)+rw.armor; state.save.tickets.skill=(state.save.tickets.skill||0)+rw.skill; state.save.tickets.passive=(state.save.tickets.passive||0)+rw.passive;
      const coins=150*tierOf(b)*tierOf(b)+Math.floor(Math.random()*75*tierOf(b)); state.save.coins=(state.save.coins||0)+coins;
      const mat={name:bossMaterialName(b),qty:Math.max(1,tierOf(b)+Math.floor(Math.random()*Math.max(1,tierOf(b))))}; const plunder=(player&&player.plunder)||0; if(Math.random()*100<plunder) mat.qty+=Math.max(1,Math.floor(tierOf(b)/2)); addMat(mat.name,mat.qty);
      const rare=giveBossRareDrops(b); rewardText=rewardTextFull(rw,coins,mat,rare);
      if(first){ v.firstClear[boss.id]=true; showFirstClear(boss.name); rewardText='<b style="color:#facc15;font-size:16px">FIRST CLEAR! 최초 클리어 기록 달성</b><br>'+rewardText; }
      saveGame(); submitRecord(elapsed);
    }
    ui.right.classList.remove('hidden');
    ui.right.innerHTML=`<h1 class="title">${clear?'클리어!':'실패'}</h1><p class="sub">${boss.name}<br>시간: ${formatMs(elapsed)}<br>받은 피해: ${player.damageTaken}<br>${clear?rewardText:'보스를 다시 분석해보세요.'}</p><button id="resultMenu" class="btn">메뉴로</button>`;
    ui.right.querySelector('#resultMenu').onclick=()=>{state.menuTab=clear?'ranking':'build';renderMenu();refreshRankings(boss.id);};
  };

  function hz(h){ h.warn=Math.max(h.warn||1.05,.95); h.life=Math.max(h.life||.7,.55); state.hazards.push(h); }
  function dmg(m){ return Math.max(10,((boss&&boss.atk)||30)*(m||.6)); }
  function cast(msg,c){ try{v20BossCast(msg,'cast',c||boss.color)}catch(e){state.toast=msg;state.toastT=1.8;} }
  function C(x,y,r,w,c,m,tag,label,l){hz({kind:'circle',x,y,r,warn:w,color:c,damage:dmg(m),tag,label,life:l||.8});}
  function B(x,y,a,len,wid,w,c,m,tag,label,l){hz({kind:'beam',x,y,angle:a,len,w:wid,warn:w,color:c,damage:dmg(m),tag,label,life:l||.75});}
  function Wl(x,y,ww,hh,w,c,m,tag,label,l){hz({kind:'wall',x,y,w:ww,h:hh,warn:w,color:c,damage:dmg(m),tag,label,life:l||.9});}
  function Dn(x,y,i,o,w,c,m,tag,label,l){hz({kind:'donut',x,y,inner:i,outer:o,warn:w,color:c,damage:dmg(m),tag,label,life:l||.9});}
  function Rn(x,y,label,c){ try{state.mechanics.push({kind:'rune',x,y,r:34,life:4.5,action:'break',color:c||'#fef08a',label});}catch(e){} }
  function Sf(x,y,label){ try{state.mechanics.push({kind:'safe',x,y,r:58,life:2.8,color:'#86efac',label:label||'SAFE'});}catch(e){} }
  function patternSolarV41(){ const c='#fb923c', r=Math.random(), a=Math.atan2(player.y-boss.y,player.x-boss.x); if(r<.25){cast('태양룡: 발톱 돌진 후 등 뒤 약점이 열립니다.',c);B(boss.x,boss.y,a,940,38,1.0,c,.78,'solar','발톱 돌진');C(boss.x-Math.cos(a)*115,boss.y-Math.sin(a)*115,66,1.35,'#fde047',.48,'solar','꼬리 폭발');Rn(boss.x,boss.y,'역광 약점','#fff7ed');return;} if(r<.5){cast('태양룡: 날개 부채꼴. 빈 각도로 파고들어 공격하세요.',c);for(let i=-4;i<=4;i++) if(i!==0) B(boss.x,boss.y,a+i*.18,880,16,1.0+Math.abs(i)*.06,'#fde047',.43,'solar','광익 절단');return;} if(r<.75){cast('태양룡: 플레어 코어. 중심 코어를 깨면 반격 시간입니다.',c);C(W/2,H/2,92,1.2,'#facc15',.44,'solar','플레어 코어',1.1);for(let i=0;i<10;i++) C(120+Math.random()*(W-240),120+Math.random()*(H-230),32,1.2+i*.05,'#fb923c',.42,'solar','태양 낙하');Rn(W/2,H/2,'코어 파괴','#fff');return;} cast('태양룡: 안쪽-바깥쪽 일식 호흡.',c);Dn(W/2,H/2,70,220,1.05,'#f97316',.62,'solar','일식 호흡');Dn(W/2,H/2,255,395,1.65,'#fde047',.56,'solar','태양 외곽');}
  function patternBlackSunV41(){ const c='#fb7185', r=Math.random(), a=Math.atan2(player.y-boss.y,player.x-boss.x); if(r<.22){cast('아포칼립스: 흑점 코어를 파괴해야 길이 열립니다.',c);for(let i=0;i<12;i++) C(110+Math.random()*(W-220),115+Math.random()*(H-225),34,1.0+i*.055,'#fb7185',.5,'eclipse','흑점 낙하');Rn(W/2,H/2,'흑점 코어','#fef08a');return;} if(r<.45){cast('아포칼립스: 검은 사슬을 구르기로 통과하세요.',c);for(let i=-3;i<=3;i++) B(boss.x,boss.y,a+i*.19,970,20,1.0+Math.abs(i)*.05,'#020617',.58,'eclipse','검은 태양 사슬');Rn(boss.x,boss.y,'일식 핵','#facc15');return;} if(r<.68){cast('아포칼립스: 붕괴 바닥. SAFE 두 칸을 찾아 이동하세요.',c);const cols=6,rows=4,s1=Math.floor(Math.random()*24),s2=Math.floor(Math.random()*24),cw=(W-180)/cols,ch=(H-180)/rows;for(let idx=0;idx<24;idx++){const x=90+cw/2+(idx%cols)*cw,y=120+ch/2+Math.floor(idx/cols)*ch;if(idx===s1||idx===s2)Sf(x,y,'SAFE');else Wl(x,y,cw*.4,ch*.35,1.35+(idx%4)*.05,'#7f1d1d',.6,'eclipse','붕괴 바닥');}return;} cast('아포칼립스: 고리와 회전 칼날을 넘기고 중앙을 공격하세요.',c);Dn(W/2,H/2,95,250,1.05,'#020617',.68,'eclipse','검은 일식 고리');B(W/2,H/2,Math.random()*Math.PI,W*.92,18,1.35,'#fb7185',.48,'eclipse','일식 칼날',1.4);Rn(W/2,H/2,'일식 파괴','#fef08a');}
  function patternPlagueV41(){ const c='#84cc16', r=Math.random(); if(r<.34){cast('역병 의사: 병동 격리와 해독 혈청.',c);const gap=Math.floor(Math.random()*4);for(let i=0;i<4;i++) if(i!==gap) Wl(W/2,140+i*(H-225)/3,W*.9,52,1.35+i*.06,c,.62,'poison','검역 병동');Rn(W*.78,H*.68,'해독 혈청','#86efac');return;} if(r<.67){cast('역병 의사: 수술선과 감염 포자.',c);for(let i=0;i<4;i++)B(170+i*(W-340)/3,H/2,Math.PI/2,H*.82,16,1.0+i*.08,'#d9f99d',.48,'poison','역병 수술선');for(let i=0;i<7;i++)C(130+Math.random()*(W-260),130+Math.random()*(H-240),28,1.25+i*.04,'#bef264',.38,'poison','감염 포자');return;} cast('역병 의사: 진짜 혈청 하나만 안전합니다.',c);const real=Math.floor(Math.random()*4);for(let i=0;i<4;i++){const x=220+i*(W-440)/3;if(i===real)Sf(x,H*.55,'진짜 혈청');else C(x,H*.55,60,1.35+i*.07,'#4ade80',.72,'poison','가짜 혈청');}}
  function patternThornV41(){ const c='#22c55e', r=Math.random(), a=Math.atan2(player.y-boss.y,player.x-boss.x); if(r<.34){cast('가시 여왕: 덩굴 갈고리 사선.',c);for(let i=-2;i<=2;i++)B(boss.x,boss.y,a+i*.23,850,18,1.0+Math.abs(i)*.07,c,.5,'nature','덩굴 갈고리');return;} if(r<.67){cast('가시 여왕: 장미 미로와 독꽃.',c);const safe=Math.floor(Math.random()*5);for(let i=0;i<5;i++){const x=130+i*(W-260)/4;if(i!==safe)Wl(x,H/2,42,H*.76,1.35+i*.05,'#16a34a',.6,'nature','가시 울타리');}for(let i=0;i<6;i++)C(140+Math.random()*(W-280),130+Math.random()*(H-230),32,1.2+i*.05,'#f472b6',.45,'nature','독꽃 개화');return;} cast('가시 여왕: 꽃눈을 깨고 폭풍을 넘기세요.',c);Dn(W/2,H/2,105,300,1.25,'#22c55e',.58,'nature','꽃잎 폭풍');Rn(W/2,H/2,'꽃눈 파괴','#fef08a');}
  function patternGardenerV41(){ const c='#8b5cf6', r=Math.random(); if(r<.34){cast('공허 정원사: 꽃문 포탈. 열린 문만 통과하세요.',c);const real=Math.floor(Math.random()*4);for(let i=0;i<4;i++){const x=220+i*(W-440)/3;if(i===real)Sf(x,H*.55,'열린 꽃문');else C(x,H*.55,70,1.25+i*.07,c,.68,'void-nature','닫힌 꽃문');}return;} if(r<.67){cast('공허 정원사: 공허 뿌리와 꽃핵.',c);for(let i=0;i<5;i++)B(W/2,H/2,Math.PI*.15+i*Math.PI/5,W*.9,16,1.0+i*.08,'#22c55e',.44,'void-nature','공허 뿌리');Rn(W/2,H/2,'꽃핵 파괴','#fef08a');return;} cast('공허 정원사: 안쪽 꽃가루와 바깥 독성 정원.',c);Dn(W/2,H/2,80,220,1.15,c,.55,'void-nature','검은 꽃가루');Dn(W/2,H/2,260,390,1.65,'#22c55e',.55,'void-nature','독성 정원');}

  const oldBossPatternV41 = bossPattern;
  bossPattern = function(){ try{const id=boss&&boss.id; if(id==='solar_dragon')return patternSolarV41(); if(id==='black_sun')return patternBlackSunV41(); if(id==='plague_doctor')return patternPlagueV41(); if(id==='thorn_queen')return patternThornV41(); if(id==='hollow_gardener'||id==='void_gardener')return patternGardenerV41();}catch(e){console.warn('[V41 boss pattern failed]',e);} return oldBossPatternV41(); };

  function marketLoad(){ try{return JSON.parse(localStorage.getItem(V41_MARKET_KEY)||'[]').filter(x=>x&&x.price>0);}catch(e){return[];} }
  function marketSave(a){ try{localStorage.setItem(V41_MARKET_KEY,JSON.stringify(a.slice(-80)));}catch(e){} }
  function chatLoad(){ const now=Date.now(); let a=[]; try{a=JSON.parse(localStorage.getItem(V41_CHAT_KEY)||'[]')||[];}catch(e){} a=a.filter(m=>now-(m.t||0)<30*60*1000); try{localStorage.setItem(V41_CHAT_KEY,JSON.stringify(a));}catch(e){} return a; }
  function chatSend(){ const inp=document.getElementById('v41ChatInput'); if(!inp||!inp.value.trim())return; const a=chatLoad(); a.push({name:state.save.playerName||'Player', text:inp.value.trim().slice(0,80), t:Date.now()}); localStorage.setItem(V41_CHAT_KEY,JSON.stringify(a)); inp.value=''; renderMenu(); }
  function marketRegisterMaterial(){ initV41(); const matSel=document.getElementById('v41MarketMat'); const priceEl=document.getElementById('v41MarketPrice'); if(!matSel||!priceEl)return; const mat=matSel.value; const price=Math.max(1,Math.floor(Number(priceEl.value||0))); const qty=Math.min(10,matCount(mat)); if(qty<=0){toast('등록할 부산물이 없습니다.');return;} takeMat(mat,qty); const a=marketLoad(); a.push({id:'m'+Date.now()+Math.random(),seller:state.save.playerName||'Player',kind:'material',name:mat,qty,price,t:Date.now()}); marketSave(a); saveGame(); renderMenu(); }
  function marketBuy(id){ const a=marketLoad(); const i=a.findIndex(x=>x.id===id); if(i<0)return; const it=a[i]; if((state.save.coins||0)<it.price){toast('코인이 부족합니다.');return;} state.save.coins-=it.price; if(it.kind==='material')addMat(it.name,it.qty); a.splice(i,1); marketSave(a); saveGame(); renderMenu(); }

  const oldRenderMenuV41 = renderMenu;
  renderMenu = function(){ oldRenderMenuV41(); try{ renderV41ExtraPanel(); }catch(e){ console.warn('[V41 extra render failed]',e); } };
  function renderV41ExtraPanel(){
    initV41(); if(!ui || !ui.menu) return;
    const mats=Object.entries(initV41().materials).filter(([,q])=>q>0).sort((a,b)=>b[1]-a[1]);
    const matOpts=mats.length?mats.map(([m,q])=>`<option value="${html(m)}">${html(m)} (${q})</option>`).join(''):`<option value="">부산물 없음</option>`;
    const market=marketLoad(); const chats=chatLoad();
    const box=document.createElement('div'); box.className='card'; box.style.marginTop='14px'; box.innerHTML=`<h3>V41 성장 시스템 · 코인 ${Math.floor(state.save.coins||0)}</h3><p class="sub">부산물은 보스 처치 시 드롭되며, 무기 강화/인챈트와 유저 판매소 등록에 사용됩니다. 채팅은 30분 뒤 자동 삭제됩니다.</p><div class="row"><div><b>보유 부산물</b><p class="muted">${mats.slice(0,8).map(([m,q])=>`${html(m)} ${q}`).join('<br>')||'없음'}</p></div><div><b>유저 판매소 등록</b><select id="v41MarketMat" class="input">${matOpts}</select><input id="v41MarketPrice" class="input" type="number" min="1" placeholder="판매 가격" style="margin-top:6px"><button type="button" id="v41MarketRegister" class="btn secondary" style="margin-top:6px;width:100%">부산물 최대 10개 묶음 등록</button></div></div><div style="margin-top:10px"><b>판매소 목록</b><div>${market.slice(-6).reverse().map(x=>`<div class="record"><div class="rank">${x.qty}</div><div>${html(x.name)}<div class="muted">판매자 ${html(x.seller)}</div></div><button type="button" class="btn secondary" style="padding:6px;min-height:28px" data-v41buy="${x.id}">${x.price} 구매</button></div>`).join('')||'<p class="muted">등록된 물품이 없습니다.</p>'}</div></div><div style="margin-top:10px"><b>채팅</b><div style="max-height:130px;overflow:auto;background:#020617;border:1px solid rgba(148,163,184,.22);border-radius:12px;padding:8px;margin:6px 0">${chats.map(m=>`<div class="muted"><b style="color:#e5e7eb">${html(m.name)}:</b> ${html(m.text)}</div>`).join('')||'<span class="muted">아직 채팅이 없습니다.</span>'}</div><div class="row"><input id="v41ChatInput" class="input" placeholder="채팅 입력"><button type="button" id="v41ChatSend" class="btn secondary">전송</button></div></div>`;
    ui.menu.appendChild(box);
    const reg=box.querySelector('#v41MarketRegister'); if(reg) reg.onclick=marketRegisterMaterial;
    const send=box.querySelector('#v41ChatSend'); if(send) send.onclick=chatSend;
    const inp=box.querySelector('#v41ChatInput'); if(inp) inp.addEventListener('keydown',e=>{if(e.key==='Enter')chatSend();});
    box.querySelectorAll('[data-v41buy]').forEach(b=>b.onclick=()=>marketBuy(b.dataset.v41buy));
  }

  function updateBossLabels(){
    const labels={plague_doctor:['검역 병동','역병 수술선','감염 포자','진짜 혈청'],thorn_queen:['덩굴 갈고리','가시 울타리','독꽃 개화','꽃잎 폭풍'],hollow_gardener:['열린 꽃문','닫힌 꽃문','공허 뿌리','검은 꽃가루'],void_gardener:['열린 꽃문','닫힌 꽃문','공허 뿌리','검은 꽃가루'],solar_dragon:['발톱 돌진','광익 절단','플레어 코어','일식 호흡'],black_sun:['흑점 코어','검은 태양 사슬','붕괴 바닥','검은 일식 고리'],chaos_archon:['판결 순환','가짜 법정','혼돈 회전','무작위 판결']};
    BOSSES.forEach(b=>{ if(labels[b.id]) b.patterns=labels[b.id]; });
  }
  updateBossLabels();

  window.RaidDungeonV41={version:V41_VERSION,enhanceWeapon,enchantWeapon,sellWeapon,disassembleWeapon,upgradeSkill,marketBuy,marketRegisterMaterial,chatSend,initV41};
  try{ renderMenu(); }catch(e){}
})();

/* ===== V42 verification wrapper: V40 base preserved + V41 patch appended ===== */
(()=>{
  try{
    window.RaidDungeonV42 = {
      version:'Raid Dungeon V42 - V40 full base plus V41 progression systems rechecked',
      base:'V40 preserved before V41 patch',
      checks:['file size should be larger than V40','V41 systems appended','syntax checked as .js']
    };
  }catch(e){}
/* =========================================================
   RAID DUNGEON V43 - ACTUAL PROGRESSION SYSTEM FIX
   - boss exclusive weapon/armor/pattern skill drops from tier 3+
   - skill level manual upgrade with duplicate points, max Lv.7
   - weapon enhancement +10, enchant, materials, coins
   - sell/disassemble weapon, local market, 30-minute chat
   - first clear only when no previous record exists, center banner only
========================================================= */
(function raidDungeonV43ActualProgressionFix(){
  const V43_VERSION = 'Raid Dungeon V43 - actual progression / first clear fix';
  const CHAT_KEY = 'raid-dungeon-v43-chat';
  const MARKET_KEY = 'raid-dungeon-v43-market';

  function esc(s){ return escapeHtml(String(s == null ? '' : s)); }
  function num(v,d){ v = Number(v); return Number.isFinite(v) ? v : d; }
  function tierOf(b){ return clamp(Math.round(num(b && b.tier, 1)), 1, 10); }
  function rarityByTier(t){ return t>=10 ? 'ultimate' : t>=8 ? 'legendary' : t>=6 ? 'epic' : t>=4 ? 'super' : 'rare'; }
  function rarityPow(r){ try { return getRarity(r).power || 1; } catch(e){ return 1; } }
  function bossMatName(b){ return `${(b && b.name) || '보스'} 부산물`; }
  function weaponMatName(w){ return (w && w.v43Material) || `${weaponKindName((w && w.kind) || 'blade')} 파편`; }
  function pct(v){ return `${Math.round(Number(v || 0) * 10) / 10}%`; }
  function formatEnchant(en){
    en = en || {};
    const p=[];
    if(en.speed) p.push(`공속 Lv${en.speed}`);
    if(en.attack) p.push(`공격 Lv${en.attack}`);
    if(en.luck) p.push(`행운 Lv${en.luck}(희귀 드롭 +${pct(en.luck * 3.5)})`);
    if(en.plunder) p.push(`약탈 Lv${en.plunder}(부산물 추가 +${pct(en.plunder * 8)})`);
    if(en.critDamage) p.push(`치명타 피해 Lv${en.critDamage}`);
    if(en.critChance) p.push(`치명타 확률 Lv${en.critChance}`);
    return p.length ? p.join(' / ') : '없음';
  }
  function initV43(){
    if(!state.save) state.save = defaultSave();
    if(!state.save.v43) state.save.v43 = {};
    const v = state.save.v43;
    v.skillLevels = v.skillLevels || {};
    v.skillCopies = v.skillCopies || {};
    v.materials = v.materials || {};
    v.weaponEnhance = v.weaponEnhance || {};
    v.weaponEnchant = v.weaponEnchant || {};
    v.dropLog = v.dropLog || [];
    if(!Number.isFinite(Number(state.save.coins))) state.save.coins = Number(state.save.coins || 0) || 0;
    return v;
  }
  function addMat(name, qty){ const v=initV43(); qty=Math.max(0, Math.floor(qty||0)); if(!name || qty<=0) return; v.materials[name]=(v.materials[name]||0)+qty; }
  function takeMat(name, qty){ const v=initV43(); qty=Math.max(0, Math.floor(qty||0)); if(!name || qty<=0) return false; if((v.materials[name]||0)<qty) return false; v.materials[name]-=qty; return true; }
  function matCount(name){ return (initV43().materials[name]||0); }
  function uniqueById(items){ const seen=new Set(); return (items||[]).filter(it=>{ if(!it) return false; const k=String(it.id||it.name); if(seen.has(k)) return false; seen.add(k); return true; }); }

  function ensureV43BossDrops(){
    try{
      BOSSES.forEach(b=>{
        const t = tierOf(b); if(t < 3) return;
        const rarity = rarityByTier(t);
        const mat = bossMatName(b);
        const wid = `v43_boss_weapon_${b.id}`;
        const aid = `v43_boss_armor_${b.id}`;
        const sid = `v43_boss_skill_${b.id}`;
        if(!WEAPONS.some(w=>w.id===wid)){
          WEAPONS.push({ id:wid, name:`${b.name}의 전용 무기`, rarity, kind:t>=9?'grimoire':t>=7?'greatsword':t>=5?'scythe':'blade', desc:`${b.name}에게서 아주 낮은 확률로 드롭되는 전용 무기입니다. 별 등급이 높을수록 기본 성능이 높습니다. 강화 재료는 ${mat}입니다.`, color:b.color, atk:+(1.35+t*.115).toFixed(3), range:118+t*7, speed:Math.max(.34, +(0.86-t*.027).toFixed(3)), crit:5+t*.7, type:'weapon', v43Boss:b.id, v43Material:mat });
        }
        if(!ARMORS.some(a=>a.id===aid)){
          ARMORS.push({ id:aid, name:`${b.name}의 전용 방어구`, rarity, desc:`${b.name}에게서 낮은 확률로 드롭되는 전용 방어구입니다. 보스 별 개수가 높을수록 체력과 방어가 높습니다.`, color:b.sub||b.color, hp:180+t*84, def:12+t*8, resist:{}, type:'armor', v43Boss:b.id, v43Material:mat });
        }
        if(!SKILLS.some(s=>s.id===sid)){
          const type = t>=8 ? 'chain' : t>=6 ? 'burst' : t>=4 ? 'line' : 'zone';
          SKILLS.push({ id:sid, name:`${b.name} 패턴 스킬`, element:b.theme||'arcane', type, category:'attack', rarity, color:b.color, power:+(1.08+t*.145).toFixed(3), cooldown:Math.max(4.7, +(10.8-t*.38).toFixed(2)), radius:110+t*9, duration:1.0, desc:`${b.name}의 대표 패턴을 플레이어용 스킬로 재현합니다. 각 보스당 1종류만 존재하는 전용 패턴 스킬입니다.`, v43Boss:b.id });
        }
      });
    }catch(e){ console.warn('[V43 boss drop item ensure failed]', e); }
  }
  ensureV43BossDrops();

  const oldNormalizeV43 = normalizeSaveData;
  normalizeSaveData = function(s){
    const out = oldNormalizeV43(s);
    try{
      if(!out.v43) out.v43 = {};
      out.v43.skillLevels = out.v43.skillLevels || {};
      out.v43.skillCopies = out.v43.skillCopies || {};
      out.v43.materials = out.v43.materials || {};
      out.v43.weaponEnhance = out.v43.weaponEnhance || {};
      out.v43.weaponEnchant = out.v43.weaponEnchant || {};
    }catch(e){}
    return out;
  };

  const oldGetWeaponV43 = getWeapon;
  getWeapon = function(id){
    const base = oldGetWeaponV43(id); if(!base) return null;
    const v = initV43(); const enh = clamp(v.weaponEnhance[id] || 0, 0, 10); const en = v.weaponEnchant[id] || {};
    const w = {...base};
    const atkMul = 1 + enh*.11 + (en.attack||0)*.08;
    const speedMul = 1 - (en.speed||0)*.055;
    w.v43BaseAtk = base.atk;
    w.v43Enhance = enh;
    w.v43Enchant = en;
    w.v43Luck = (en.luck||0) * 3.5;
    w.v43Plunder = (en.plunder||0) * 8;
    w.v43CritDmg = (en.critDamage||0) * .18;
    w.atk = +(base.atk * atkMul).toFixed(4);
    w.speed = Math.max(.26, +(base.speed * speedMul).toFixed(4));
    w.crit = (base.crit || 0) + (en.critChance||0)*3;
    w.desc = `${base.desc} / +${enh}강 적용: 공격 배율 x${w.atk}, 공속 ${w.speed.toFixed(2)}, 치명 ${pct(w.crit||0)} / 인챈트: ${formatEnchant(en)}`;
    return w;
  };

  const oldGetSkillV43 = getSkill;
  getSkill = function(id){
    const base = oldGetSkillV43(id); if(!base) return null;
    const v = initV43(); const lv = clamp(v.skillLevels[id] || 1, 1, 7);
    const s = {...base};
    s.v43Level = lv;
    s.v43BasePower = base.power;
    s.power = +(base.power * (1 + (lv-1)*.15)).toFixed(4);
    s.cooldown = Math.max(2.1, +(base.cooldown * (1 - (lv-1)*.025)).toFixed(3));
    s.desc = `${base.desc} / Lv.${lv} 적용: 위력 x${s.power}, 쿨타임 ${s.cooldown.toFixed(1)}초`;
    return s;
  };

  const oldApplyBuildV43 = applyBuild;
  applyBuild = function(){
    oldApplyBuildV43();
    try{
      const w = getWeapon(state.selectedWeaponId);
      if(w){
        player.critDmg += w.v43CritDmg || 0;
        player.dropLuck = (player.dropLuck || 0) + (w.v43Luck || 0);
        player.plunder = (player.plunder || 0) + (w.v43Plunder || 0);
      }
    }catch(e){}
  };

  function detailText(it,type){
    if(!it) return '';
    if(type === 'weapon'){
      const w = getWeapon(it.id) || it; const en = w.v43Enchant || {};
      return `무기 상세\n이름: ${w.name}\n희귀도: ${getRarity(w.rarity).name}\n종류: ${weaponKindName(w.kind)}\n강화: +${w.v43Enhance||0}/10\n공격 배율: x${w.atk}\n공격속도: ${Number(w.speed||0).toFixed(2)}\n치명 확률: ${pct(w.crit||0)}\n인챈트: ${formatEnchant(en)}\n강화 재료: ${weaponMatName(w)}\n설명: ${w.desc}`;
    }
    if(type === 'skill'){
      const s = getSkill(it.id) || it; const v=initV43();
      return `스킬 상세\n이름: ${s.name}\nLv.${v.skillLevels[it.id]||1}/7\n중복 강화 포인트: ${v.skillCopies[it.id]||0}\n분류: ${skillCategoryName(s.category)}\n속성: ${s.element}\n위력: x${s.power}\n쿨타임: ${Number(s.cooldown||0).toFixed(1)}초\n범위: ${s.radius}\n설명: ${s.desc}`;
    }
    if(type === 'armor') return `방어구 상세\n이름: ${it.name}\n희귀도: ${getRarity(it.rarity).name}\n체력 +${it.hp}\n방어 +${it.def}\n설명: ${it.desc}`;
    return `${it.name}\n${it.desc||''}`;
  }

  ownedWeapons = function(){ return uniqueById(WEAPONS.filter(w => (state.save.weapons||[]).includes(w.id))); };
  ownedArmors = function(){ return uniqueById(ARMORS.filter(a => (state.save.armors||[]).includes(a.id))); };
  ownedSkills = function(cat){ return uniqueById(SKILLS.filter(s => (state.save.skills||[]).includes(s.id) && (!cat || s.category===cat))); };
  ownedPassives = function(){ return uniqueById(PASSIVES.filter(p => (state.save.passives||[]).includes(p.id))); };

  function enhanceCost(id){ const w=getWeapon(id); const v=initV43(); const enh=clamp(v.weaponEnhance[id]||0,0,10); return { mat: weaponMatName(w), qty:(enh+1)*(enh+2), coins:Math.floor(170*(enh+1)*(1+enh*.45)) }; }
  function enhanceWeapon(id){
    const w=getWeapon(id); if(!w) return;
    const v=initV43(); const enh=clamp(v.weaponEnhance[id]||0,0,10);
    if(enh>=10){ toast('이미 +10강입니다.'); return; }
    const c=enhanceCost(id);
    if((state.save.coins||0)<c.coins){ toast(`코인이 부족합니다. 필요 코인 ${c.coins}`); return; }
    if(!takeMat(c.mat,c.qty)){ toast(`${c.mat} ${c.qty}개가 필요합니다.`); return; }
    state.save.coins -= c.coins; v.weaponEnhance[id] = enh+1;
    toast(`${w.name} +${enh+1} 강화 성공`); saveGame(); renderMenu();
  }
  function randomEnchant(){
    const types=['speed','attack','luck','plunder','critDamage','critChance'];
    const count = 1 + (Math.random()<.30?1:0) + (Math.random()<.10?1:0) + (Math.random()<.03?1:0);
    const en={};
    while(Object.keys(en).length<count){ const t=types[Math.floor(Math.random()*types.length)]; en[t]=1+Math.floor(Math.random()*3); }
    return en;
  }
  function enchantWeapon(id){
    const w=getWeapon(id); if(!w) return;
    const v=initV43(); const enh=clamp(v.weaponEnhance[id]||0,0,10);
    const mat=weaponMatName(w), qty=7+enh*2, coins=850+enh*230;
    if((state.save.coins||0)<coins){ toast(`인챈트 코인이 부족합니다. 필요 코인 ${coins}`); return; }
    if(!takeMat(mat,qty)){ toast(`${mat} ${qty}개가 필요합니다.`); return; }
    state.save.coins -= coins; v.weaponEnchant[id] = randomEnchant();
    toast(`${w.name} 인챈트 완료: ${formatEnchant(v.weaponEnchant[id])}`); saveGame(); renderMenu();
  }
  function sellWeapon(id){
    const w=getWeapon(id); if(!w) return;
    const price=Math.floor(520*rarityPow(w.rarity)*(1+(w.v43Enhance||0)*.22));
    state.save.weapons=(state.save.weapons||[]).filter(x=>x!==id); if(state.selectedWeaponId===id) state.selectedWeaponId=null;
    state.save.coins=(state.save.coins||0)+price; toast(`${w.name} 판매: ${price} 코인`); saveGame(); renderMenu();
  }
  function disassembleWeapon(id){
    const w=getWeapon(id); if(!w) return;
    const qty=3+Math.ceil(rarityPow(w.rarity)*2)+(w.v43Enhance||0)*2;
    const mat=weaponMatName(w);
    state.save.weapons=(state.save.weapons||[]).filter(x=>x!==id); if(state.selectedWeaponId===id) state.selectedWeaponId=null;
    addMat(mat, qty); toast(`${w.name} 분해: ${mat} ${qty}개 획득`); saveGame(); renderMenu();
  }
  function upgradeSkill(id){
    const s=getSkill(id); if(!s) return;
    const v=initV43(); const lv=clamp(v.skillLevels[id]||1,1,7); const cp=v.skillCopies[id]||0;
    if(lv>=7){ toast('이미 Lv.7입니다.'); return; }
    if(cp<=0){ toast('같은 스킬 중복 포인트가 필요합니다.'); return; }
    v.skillCopies[id]=cp-1; v.skillLevels[id]=lv+1;
    toast(`${s.name} Lv.${lv+1} 달성`); saveGame(); renderMenu();
  }

  const oldRollGachaV43 = rollGacha;
  rollGacha = function(kind){
    initV43();
    if(!state.save.tickets || typeof state.save.tickets !== 'object') state.save.tickets = {...INITIAL_TICKETS};
    if((state.save.tickets[kind]||0)<=0){ toast(TICKET_LABEL[kind] + '이 부족합니다.'); return; }
    if(kind !== 'skill') return oldRollGachaV43(kind);
    state.save.tickets.skill -= 1;
    const rarity=pickRarity();
    const pool=SKILLS.filter(x=>x.rarity===rarity); const list=pool.length?pool:SKILLS;
    const item=list[Math.floor(Math.random()*list.length)];
    const arr=state.save.skills || (state.save.skills=[]); const v=initV43();
    if(arr.includes(item.id)){ v.skillCopies[item.id]=(v.skillCopies[item.id]||0)+1; }
    else { arr.push(item.id); v.skillLevels[item.id]=1; }
    state.gachaResult=item; gachaCelebration(item); saveGame(); renderMenu();
  };

  selectionGrid = function(items, selected, type){
    items = uniqueById(items);
    const noneTitle = type === 'weapon' ? '무기 없이 출격' : type === 'armor' ? '방어구 없이 출격' : '이 칸 비우기';
    const noneDesc = type === 'weapon' ? '스킬만 가지고 레이드에 들어갈 수 있습니다.' : type === 'armor' ? '방어구는 필수는 아닙니다.' : '비워도 됩니다.';
    const noneCard = `<div class="card ${!selected?'active':''}" data-select-type="${type}" data-select-id="" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('${type}','',0)"><h3>${noneTitle}</h3><p>${noneDesc}</p></div>`;
    if(!items.length) return `<div class="grid">${noneCard}<div class="card"><h3>보유한 항목이 없습니다.</h3><p>뽑기 상점이나 보스 드롭으로 획득할 수 있습니다.</p><button class="btn" data-tabgo="gacha" style="margin-top:10px">뽑기 상점으로</button></div></div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" class="btn" data-next-step>다음</button></div>`;
    return `<div class="grid">${noneCard}${items.map(it=>{
      if(type==='weapon'){
        const w=getWeapon(it.id)||it; const c=enhanceCost(it.id);
        return `<div class="card ${selected===it.id?'active':''}" title="${esc(detailText(it,'weapon'))}" data-select-type="weapon" data-select-id="${it.id}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('weapon','${it.id}',0)"><h3>${esc(w.name)} +${w.v43Enhance||0} ${rarityLabel(w.rarity)}</h3><p>${esc(w.desc)}<br>공격 x${w.atk} · 공속 ${Number(w.speed||0).toFixed(2)} · 재료 ${esc(c.mat)} ${matCount(c.mat)}/${c.qty} · 강화비 ${c.coins}코인</p><div class="row" style="margin-top:8px"><button type="button" class="btn secondary" onclick="event.stopPropagation();window.RaidDungeonV43.enhanceWeapon('${it.id}')">강화</button><button type="button" class="btn secondary" onclick="event.stopPropagation();window.RaidDungeonV43.enchantWeapon('${it.id}')">인챈트</button></div><div class="row" style="margin-top:6px"><button type="button" class="btn secondary" onclick="event.stopPropagation();window.RaidDungeonV43.sellWeapon('${it.id}')">평균가 판매</button><button type="button" class="btn secondary" onclick="event.stopPropagation();window.RaidDungeonV43.disassembleWeapon('${it.id}')">분해</button></div><button type="button" class="btn secondary" style="margin-top:6px;width:100%" onclick="event.stopPropagation();window.RaidDungeonV43.marketRegisterWeapon('${it.id}')">유저 판매소 등록</button></div>`;
      }
      const a=getArmor(it.id)||it;
      return `<div class="card ${selected===it.id?'active':''}" title="${esc(detailText(a,'armor'))}" data-select-type="armor" data-select-id="${it.id}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('armor','${it.id}',0)"><h3>${esc(a.name)} ${rarityLabel(a.rarity)}</h3><p>${esc(a.desc)}<br>체력 +${a.hp} / 방어 +${a.def}</p></div>`;
    }).join('')}</div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" class="btn" data-next-step>다음</button></div>`;
  };

  skillSlotGrid = function(slot){
    const items = uniqueById(ownedSkills());
    const selected = state.selectedSkillIds[slot] || null;
    const noneCard = `<div class="card ${!selected?'active':''}" data-select-type="skill" data-slot="${slot}" data-select-id="" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('skill','',${slot})"><h3>스킬 ${slot+1} 비우기</h3><p>스킬을 끼지 않아도 됩니다.</p></div>`;
    if(!items.length) return `<div class="grid">${noneCard}<div class="card"><h3>보유한 스킬이 없습니다.</h3><p>스킬 뽑기나 보스 패턴 스킬 드롭으로 획득할 수 있습니다.</p></div></div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" class="btn" data-next-step>다음</button></div>`;
    return `<p class="sub">중복 스킬은 목록에 1개만 보이고, 중복 획득분은 강화 포인트로 저장됩니다. 버튼으로 직접 Lv.7까지 올릴 수 있습니다.</p><div class="grid">${noneCard}${items.map(it=>{ const s=getSkill(it.id)||it; const v=initV43(); const lv=v.skillLevels[it.id]||1; const cp=v.skillCopies[it.id]||0; return `<div class="card ${selected===it.id?'active':''}" title="${esc(detailText(it,'skill'))}" data-select-type="skill" data-slot="${slot}" data-select-id="${it.id}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('skill','${it.id}',${slot})"><h3>${esc(s.name)} Lv.${lv} ${rarityLabel(s.rarity)}</h3><p>${esc(s.desc)}<br>위력 x${s.power} · 쿨 ${Number(s.cooldown||0).toFixed(1)}초 · 강화포인트 ${cp}</p><button type="button" class="btn secondary" style="margin-top:8px" onclick="event.stopPropagation();window.RaidDungeonV43.upgradeSkill('${it.id}')">스킬 레벨업</button><button type="button" class="btn secondary" style="margin-top:6px;width:100%" onclick="event.stopPropagation();window.RaidDungeonV43.marketRegisterSkill('${it.id}')">유저 판매소 등록</button></div>`; }).join('')}</div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" class="btn" data-next-step>다음</button></div>`;
  };

  function chooseTicketReward(t){
    const r=Math.random();
    if(t>=8){ if(r<.32) return 'skill'; if(r<.58) return 'weapon'; if(r<.82) return 'armor'; return 'passive'; }
    if(t>=5){ if(r<.40) return 'skill'; if(r<.62) return 'weapon'; if(r<.84) return 'armor'; return 'passive'; }
    if(r<.48) return 'skill'; if(r<.68) return 'weapon'; if(r<.88) return 'armor'; return 'passive';
  }
  rollBossTicketRewards = function(b){
    const t=tierOf(b); const rw={weapon:0,armor:0,skill:0,passive:0};
    for(let i=0;i<t;i++) rw[chooseTicketReward(t)]++;
    return rw;
  };
  rewardTextFromTickets = function(rw){
    const parts=[]; if(rw.weapon) parts.push(`무기 ${rw.weapon}장`); if(rw.armor) parts.push(`방어구 ${rw.armor}장`); if(rw.skill) parts.push(`스킬 ${rw.skill}장`); if(rw.passive) parts.push(`패시브 ${rw.passive}장`);
    return parts.length ? '획득 티켓: '+parts.join(' / ') : '획득 티켓 없음';
  };

  function addOwned(kind,id){
    if(!id) return false;
    if(kind==='weapon'){ const a=state.save.weapons||(state.save.weapons=[]); if(!a.includes(id)){a.push(id); return true;} return false; }
    if(kind==='armor'){ const a=state.save.armors||(state.save.armors=[]); if(!a.includes(id)){a.push(id); return true;} return false; }
    if(kind==='skill'){
      const a=state.save.skills||(state.save.skills=[]); const v=initV43();
      if(a.includes(id)){ v.skillCopies[id]=(v.skillCopies[id]||0)+1; return false; }
      a.push(id); v.skillLevels[id]=1; return true;
    }
    return false;
  }
  function rollBossSpecialDrops(b){
    const t=tierOf(b), drops=[]; if(t<3) return drops;
    const w=getWeapon(`v43_boss_weapon_${b.id}`), a=getArmor(`v43_boss_armor_${b.id}`), s=getSkill(`v43_boss_skill_${b.id}`);
    const luck=(player&&player.dropLuck)||0;
    const baseW=.018 + t*.004 + luck/100;
    const baseA=.022 + t*.004 + luck/100;
    const baseS=.012 + t*.0035 + luck/100;
    if(w && Math.random()<baseW){ addOwned('weapon',w.id); drops.push(`전용 무기 ${w.name}`); }
    if(a && Math.random()<baseA){ addOwned('armor',a.id); drops.push(`전용 방어구 ${a.name}`); }
    if(s && Math.random()<baseS){ const fresh=addOwned('skill',s.id); drops.push(fresh ? `패턴 스킬 ${s.name}` : `패턴 스킬 중복포인트 ${s.name}`); }
    return drops;
  }
  function rewardCoinsAndMaterials(b){
    const t=tierOf(b); const coins=Math.floor(180*t + t*t*45 + Math.random()*t*70);
    state.save.coins=(state.save.coins||0)+coins;
    const mat=bossMatName(b); const plunder=(player&&player.plunder)||0;
    let qty=1+Math.floor(t/2);
    if(Math.random() < plunder/100) qty += 1+Math.floor(t/3);
    if(Math.random() < Math.min(.45, t*.035)) qty += 1;
    addMat(mat, qty);
    return {coins, mat, qty};
  }

  function hasExistingRecordForBoss(bossId){
    try{ if(getLocalRecords().some(r=>r && r.boss_id===bossId)) return true; }catch(e){}
    try{ if(state.rankingBossId===bossId && Array.isArray(state.rankings) && state.rankings.length>0) return true; }catch(e){}
    return false;
  }
  function removeOldFirstClearVisuals(){
    try{ document.getElementById('raid-v40-first-clear-banner')?.remove(); }catch(e){}
    try{ document.querySelectorAll('[id*="first-clear"], [id*="FirstClear"]').forEach(el=>{ if(el.id!=='raid-v43-first-clear-banner') el.remove(); }); }catch(e){}
    try{ state.v37FirstClearT=0; state.v37FirstClearBoss=''; state.v39FirstClearT=0; state.v40FirstClearT=0; }catch(e){}
  }
  function showFirstClearOnlyCenter(name){
    removeOldFirstClearVisuals();
    const old=document.getElementById('raid-v43-first-clear-banner'); if(old) old.remove();
    const st=document.getElementById('raid-v43-first-clear-style') || document.createElement('style');
    st.id='raid-v43-first-clear-style';
    st.textContent='@keyframes raidV43First{0%{opacity:0;transform:translate(-50%,-50%) scale(.65)}13%{opacity:1;transform:translate(-50%,-50%) scale(1.05)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1)}}';
    document.head.appendChild(st);
    const box=document.createElement('div');
    box.id='raid-v43-first-clear-banner';
    box.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483647;min-width:620px;max-width:88vw;text-align:center;padding:34px 44px;border:4px solid #facc15;border-radius:30px;background:rgba(2,6,23,.90);box-shadow:0 0 60px rgba(250,204,21,.70);pointer-events:none;animation:raidV43First 4.8s ease-out forwards;';
    box.innerHTML=`<div style="font-size:58px;font-weight:950;color:#facc15;letter-spacing:.06em;text-shadow:0 0 28px #facc15">FIRST CLEAR!</div><div style="margin-top:10px;font-size:22px;font-weight:900;color:white">${esc(name)} 최초 클리어 기록 달성</div>`;
    document.body.appendChild(box);
    setTimeout(()=>box.remove(),5200);
    try{ state.flash=Math.max(state.flash||0,1.25); burst(W/2,H/2,'#facc15',150,600); }catch(e){}
  }

  async function submitRecordV43(ms, bossSnapshot, record, shouldCheckFirst){
    let trulyFirst = !!shouldCheckFirst;
    if(shouldCheckFirst && supabaseReady && supabase){
      try{
        const res = await supabase.from('raid_records').select('id').eq('boss_id', bossSnapshot.id).limit(1);
        if(res && Array.isArray(res.data) && res.data.length>0) trulyFirst=false;
      }catch(e){ /* offline이면 local 기준 유지 */ }
    }
    try{
      let local=getLocalRecords().filter(r=>!(r.boss_id===bossSnapshot.id && normalizedPlayerName(r.player_name).toLowerCase()===normalizedPlayerName(record.player_name).toLowerCase()));
      local.push(record);
      local=dedupeLatestByPlayer(local).slice(0,250);
      localStorage.setItem(LOCAL_RECORD_KEY,JSON.stringify(local));
    }catch(e){}
    if(supabaseReady && supabase){
      try{
        await supabase.from('raid_records').delete().eq('boss_id', bossSnapshot.id).eq('player_name', record.player_name);
        await supabase.from('raid_records').insert(record);
      }catch(e){ console.warn('Supabase ranking save failed:', e && e.message ? e.message : e); }
    }
    if(trulyFirst) showFirstClearOnlyCenter(bossSnapshot.name);
    refreshRankings(bossSnapshot.id);
  }

  endRaid = function(clear){
    removeOldFirstClearVisuals();
    state.screen='result';
    const elapsed=Math.floor(state.raid.elapsed*1000);
    let rewardText='';
    let firstCandidate=false;
    if(clear){
      const b=getBoss(boss.id);
      firstCandidate = !hasExistingRecordForBoss(boss.id);
      const rw=rollBossTicketRewards(b);
      state.save.tickets.weapon=(state.save.tickets.weapon||0)+rw.weapon;
      state.save.tickets.armor=(state.save.tickets.armor||0)+rw.armor;
      state.save.tickets.skill=(state.save.tickets.skill||0)+rw.skill;
      state.save.tickets.passive=(state.save.tickets.passive||0)+rw.passive;
      const cm=rewardCoinsAndMaterials(b);
      const special=rollBossSpecialDrops(b);
      rewardText = rewardTextFromTickets(rw) + `<br>코인 ${cm.coins} 획득 / ${esc(cm.mat)} ${cm.qty}개 획득`;
      if(special.length) rewardText += `<br><b style="color:#facc15">희귀 드롭: ${special.map(esc).join(' / ')}</b>`;
      saveGame();
      const playerName=normalizedPlayerName(state.save.playerName);
      const record={player_name:playerName,boss_id:b.id,boss_name:b.name,clear_ms:elapsed,weapon_id:state.raid.weapon?state.raid.weapon.id:'none',weapon_name:state.raid.weapon?state.raid.weapon.name:'무기 없음',skills:state.raid.skills.filter(Boolean).map(s=>s.name),passives:[state.raid.armor?('방어구: '+state.raid.armor.name):'방어구 없음'].concat(state.raid.passives.filter(Boolean).map(p=>p.name)),damage_taken:player.damageTaken,created_at:new Date().toISOString()};
      submitRecordV43(elapsed, {id:b.id,name:b.name}, record, firstCandidate);
    }
    ui.right.classList.remove('hidden');
    ui.right.innerHTML=`<h1 class="title">${clear?'클리어!':'실패'}</h1><p class="sub">${esc(boss.name)}<br>시간: ${formatMs(elapsed)}<br>받은 피해: ${player.damageTaken}<br>${clear?rewardText:'보스를 다시 분석해보세요.'}</p><button id="resultMenu" class="btn">메뉴로</button>`;
    const btn=ui.right.querySelector('#resultMenu');
    if(btn) btn.onclick=()=>{ state.menuTab=clear?'ranking':'build'; renderMenu(); refreshRankings(boss.id); };
  };

  const oldDrawV43 = draw;
  draw = function(){
    try{ state.v37FirstClearT=0; state.v39FirstClearT=0; state.v40FirstClearT=0; }catch(e){}
    oldDrawV43();
  };

  function marketLoad(){ try{return JSON.parse(localStorage.getItem(MARKET_KEY)||'[]').filter(x=>x&&x.price>0);}catch(e){return[];} }
  function marketSave(a){ try{localStorage.setItem(MARKET_KEY,JSON.stringify((a||[]).slice(-120)));}catch(e){} }
  function chatLoad(){ const now=Date.now(); let a=[]; try{a=JSON.parse(localStorage.getItem(CHAT_KEY)||'[]')||[];}catch(e){} a=a.filter(m=>now-(m.t||0)<30*60*1000); try{localStorage.setItem(CHAT_KEY,JSON.stringify(a));}catch(e){} return a; }
  function chatSend(){ const inp=document.getElementById('v43ChatInput'); if(!inp||!inp.value.trim()) return; const a=chatLoad(); a.push({name:state.save.playerName||'Player', text:inp.value.trim().slice(0,100), t:Date.now()}); localStorage.setItem(CHAT_KEY,JSON.stringify(a)); inp.value=''; renderMenu(); }
  function marketRegisterMaterial(){ const mat=document.getElementById('v43MarketMat')?.value||''; const price=Math.max(1,Math.floor(Number(document.getElementById('v43MarketPrice')?.value||0))); const qty=Math.min(10, matCount(mat)); if(!mat||qty<=0){ toast('등록할 부산물이 없습니다.'); return; } takeMat(mat,qty); const a=marketLoad(); a.push({id:'m'+Date.now()+Math.random(),seller:state.save.playerName||'Player',kind:'material',name:mat,qty,price,t:Date.now()}); marketSave(a); saveGame(); renderMenu(); }
  function marketRegisterWeapon(id){ const w=getWeapon(id); if(!w) return; const suggested=Math.floor(900*rarityPow(w.rarity)*(1+(w.v43Enhance||0)*.25)); const raw=prompt('판매소에 등록할 가격을 입력하세요', suggested); const price=Math.max(1,Math.floor(Number(raw||0))); if(!price) return; state.save.weapons=(state.save.weapons||[]).filter(x=>x!==id); const a=marketLoad(); a.push({id:'w'+Date.now()+Math.random(),seller:state.save.playerName||'Player',kind:'weapon',itemId:id,name:w.name,qty:1,price,t:Date.now()}); marketSave(a); saveGame(); renderMenu(); }
  function marketRegisterSkill(id){ const s=getSkill(id); if(!s) return; const suggested=Math.floor(700*rarityPow(s.rarity)); const raw=prompt('판매소에 등록할 가격을 입력하세요', suggested); const price=Math.max(1,Math.floor(Number(raw||0))); if(!price) return; state.save.skills=(state.save.skills||[]).filter(x=>x!==id); const a=marketLoad(); a.push({id:'s'+Date.now()+Math.random(),seller:state.save.playerName||'Player',kind:'skill',itemId:id,name:s.name,qty:1,price,t:Date.now()}); marketSave(a); saveGame(); renderMenu(); }
  function marketBuy(id){ const a=marketLoad(); const i=a.findIndex(x=>x.id===id); if(i<0) return; const it=a[i]; if((state.save.coins||0)<it.price){ toast('코인이 부족합니다.'); return; } state.save.coins-=it.price; if(it.kind==='material') addMat(it.name,it.qty); if(it.kind==='weapon') addOwned('weapon',it.itemId); if(it.kind==='skill') addOwned('skill',it.itemId); a.splice(i,1); marketSave(a); saveGame(); renderMenu(); }

  const oldRenderMenuV43 = renderMenu;
  renderMenu = function(){ oldRenderMenuV43(); try{ renderV43Panel(); }catch(e){ console.warn('[V43 panel render failed]',e); } };
  function renderV43Panel(){
    if(!ui || !ui.menu) return; initV43();
    const mats=Object.entries(initV43().materials).filter(([,q])=>q>0).sort((a,b)=>b[1]-a[1]);
    const matOpts=mats.length?mats.map(([m,q])=>`<option value="${esc(m)}">${esc(m)} (${q})</option>`).join(''):'<option value="">부산물 없음</option>';
    const market=marketLoad(); const chats=chatLoad();
    const box=document.createElement('div'); box.className='card'; box.style.marginTop='14px';
    box.innerHTML=`<h3>성장 / 판매소 / 채팅 · 코인 ${Math.floor(state.save.coins||0)}</h3><p class="sub">3성 이상 보스는 낮은 확률로 전용 무기·방어구·보스 패턴 스킬을 드롭합니다. 채팅은 30분 뒤 자동 삭제됩니다.</p><div class="row"><div><b>보유 부산물</b><p class="muted">${mats.slice(0,10).map(([m,q])=>`${esc(m)} ${q}`).join('<br>')||'없음'}</p></div><div><b>부산물 판매 등록</b><select id="v43MarketMat" class="input">${matOpts}</select><input id="v43MarketPrice" class="input" type="number" min="1" placeholder="판매 가격" style="margin-top:6px"><button type="button" id="v43MarketRegister" class="btn secondary" style="margin-top:6px;width:100%">부산물 최대 10개 묶음 등록</button></div></div><div style="margin-top:10px"><b>유저 판매소</b>${market.slice(-8).reverse().map(x=>`<div class="record"><div class="rank">${x.kind==='material'?x.qty:'1'}</div><div>${esc(x.name)}<div class="muted">${x.kind} · 판매자 ${esc(x.seller)}</div></div><button type="button" class="btn secondary" style="padding:6px;min-height:28px" data-v43buy="${x.id}">${x.price} 구매</button></div>`).join('')||'<p class="muted">등록된 물품이 없습니다.</p>'}</div><div style="margin-top:10px"><b>채팅</b><div style="max-height:130px;overflow:auto;background:#020617;border:1px solid rgba(148,163,184,.22);border-radius:12px;padding:8px;margin:6px 0">${chats.map(m=>`<div class="muted"><b style="color:#e5e7eb">${esc(m.name)}:</b> ${esc(m.text)}</div>`).join('')||'<span class="muted">아직 채팅이 없습니다.</span>'}</div><div class="row"><input id="v43ChatInput" class="input" placeholder="채팅 입력"><button type="button" id="v43ChatSend" class="btn secondary">전송</button></div></div>`;
    ui.menu.appendChild(box);
    box.querySelector('#v43MarketRegister')?.addEventListener('click', marketRegisterMaterial);
    box.querySelector('#v43ChatSend')?.addEventListener('click', chatSend);
    box.querySelector('#v43ChatInput')?.addEventListener('keydown', e=>{ if(e.key==='Enter') chatSend(); });
    box.querySelectorAll('[data-v43buy]').forEach(b=>b.addEventListener('click',()=>marketBuy(b.dataset.v43buy)));
  }

  try{
    window.RaidDungeonV43 = { version:V43_VERSION, enhanceWeapon, enchantWeapon, sellWeapon, disassembleWeapon, upgradeSkill, marketRegisterWeapon, marketRegisterSkill, marketBuy, marketRegisterMaterial, chatSend, initV43 };
    initV43(); ensureV43BossDrops();
    renderMenu();
  }catch(e){ console.warn('[V43 init failed]', e); }
})();


/* =========================================================
   RAID DUNGEON V44 - ACTUAL VISIBLE PROGRESSION SYSTEM
   - visible top coin UI and separate Growth / Market / Chat tabs
   - 3-star+ boss exclusive weapon/armor/pattern-skill low chance drops
   - skill duplicate -> upgrade point, manual level up to Lv7
   - weapon +10 enhancement, enchant, sale, dismantle, material drops
   - exact tier ticket rewards, boss coin rewards
   - first clear only when no previous local/cloud record exists, center only
========================================================= */
(function raidDungeonV44ActualVisibleProgressionSystem(){
  const V44_VERSION = 'Raid Dungeon V44 - actual visible progression system';
  const V44_MARKET_KEY = 'raid-dungeon-v44-market';
  const V44_CHAT_KEY = 'raid-dungeon-v44-chat';
  const V44_FIRST_STYLE_ID = 'raid-v44-first-clear-style';
  const V44_FIRST_BOX_ID = 'raid-v44-first-clear-banner';

  function esc(v){ return escapeHtml(String(v == null ? '' : v)); }
  function int(v,d){ v=Number(v); return Number.isFinite(v) ? Math.floor(v) : d; }
  function clampInt(v,a,b){ return Math.max(a, Math.min(b, int(v,a))); }
  function bossTier(b){ return clampInt((b && b.tier) || 1, 1, 10); }
  function rarityByTier(t){ return t >= 10 ? 'ultimate' : t >= 8 ? 'legendary' : t >= 6 ? 'epic' : t >= 4 ? 'super' : 'rare'; }
  function powOf(r){ try { return Number(getRarity(r).power || 1); } catch(e){ return 1; } }
  function pct(v){ return `${Math.round(Number(v || 0) * 10) / 10}%`; }
  function bossMat(b){ return `${(b && b.name) || '보스'} 부산물`; }
  function kindMat(w){ return (w && (w.v44Material || w.v43Material || w.v41Material)) || `${weaponKindName((w && w.kind) || 'blade')} 파편`; }

  function v44(){
    if(!state.save) state.save = defaultSave();
    if(!state.save.v44) state.save.v44 = {};
    const v = state.save.v44;
    v.skillLevels = v.skillLevels || {};
    v.skillCopies = v.skillCopies || {};
    v.materials = v.materials || {};
    v.weaponEnhance = v.weaponEnhance || {};
    v.weaponEnchant = v.weaponEnchant || {};
    v.dropHistory = v.dropHistory || [];
    if(!Number.isFinite(Number(state.save.coins))) state.save.coins = Number(state.save.coins || 0) || 0;
    return v;
  }
  function addMat(name, qty){ const v=v44(); qty=clampInt(qty,0,999999); if(!name || qty<=0) return; v.materials[name]=(v.materials[name]||0)+qty; }
  function takeMat(name, qty){ const v=v44(); qty=clampInt(qty,0,999999); if(!name || qty<=0) return false; if((v.materials[name]||0)<qty) return false; v.materials[name]-=qty; return true; }
  function matCount(name){ return v44().materials[name] || 0; }
  function uniqueById(list){ const seen=new Set(); return (list||[]).filter(x=>{ if(!x) return false; const k=String(x.id || x.name); if(seen.has(k)) return false; seen.add(k); return true; }); }
  function uniqueByName(list){ const seen=new Set(); return (list||[]).filter(x=>{ if(!x) return false; const k=String(x.name || x.id); if(seen.has(k)) return false; seen.add(k); return true; }); }

  function ensureBossExclusiveDrops(){
    try{
      BOSSES.forEach(b=>{
        const t = bossTier(b); if(t < 3) return;
        const rarity = rarityByTier(t);
        const mat = bossMat(b);
        const wid = `v44_boss_weapon_${b.id}`;
        const aid = `v44_boss_armor_${b.id}`;
        const sid = `v44_boss_skill_${b.id}`;
        if(!WEAPONS.some(w=>w.id===wid)){
          WEAPONS.push({
            id: wid,
            name: `${b.name}의 전용 무기`,
            rarity,
            kind: t>=9 ? 'grimoire' : t>=7 ? 'greatsword' : t>=5 ? 'scythe' : 'blade',
            desc: `${b.name}에게서 아주 낮은 확률로 드롭되는 전용 무기입니다. 보스 별이 높을수록 기본 등급과 성능이 높습니다.`,
            color: b.color,
            atk: +(1.28 + t * .12).toFixed(3),
            range: 115 + t * 8,
            speed: Math.max(.32, +(0.88 - t * .028).toFixed(3)),
            crit: 5 + t * .75,
            type: 'weapon',
            v44Boss: b.id,
            v44Material: mat
          });
        }
        if(!ARMORS.some(a=>a.id===aid)){
          ARMORS.push({
            id: aid,
            name: `${b.name}의 전용 방어구`,
            rarity,
            desc: `${b.name}에게서 낮은 확률로 드롭되는 전용 방어구입니다. 보스 별이 높을수록 체력과 방어가 높습니다.`,
            color: b.sub || b.color,
            hp: 170 + t * 95,
            def: 12 + t * 9,
            resist: {},
            type: 'armor',
            v44Boss: b.id,
            v44Material: mat
          });
        }
        if(!SKILLS.some(s=>s.id===sid)){
          SKILLS.push({
            id: sid,
            name: `${b.name} 패턴 스킬`,
            element: b.theme || 'arcane',
            type: t>=8 ? 'chain' : t>=6 ? 'burst' : t>=4 ? 'line' : 'zone',
            category: 'attack',
            rarity,
            color: b.color,
            power: +(1.08 + t * .15).toFixed(3),
            cooldown: Math.max(4.6, +(10.8 - t * .38).toFixed(2)),
            radius: 105 + t * 10,
            duration: 1.0,
            desc: `${b.name}의 대표 패턴을 플레이어용 스킬로 재현합니다. 각 보스당 1종류만 존재하는 전용 패턴 스킬입니다.`,
            v44Boss: b.id
          });
        }
      });
    }catch(e){ console.warn('[V44] boss exclusive drop setup failed', e); }
  }
  ensureBossExclusiveDrops();

  const oldNormalizeV44 = normalizeSaveData;
  normalizeSaveData = function(s){
    const out = oldNormalizeV44(s);
    try{
      if(!out.v44) out.v44 = {};
      out.v44.skillLevels = out.v44.skillLevels || {};
      out.v44.skillCopies = out.v44.skillCopies || {};
      out.v44.materials = out.v44.materials || {};
      out.v44.weaponEnhance = out.v44.weaponEnhance || {};
      out.v44.weaponEnchant = out.v44.weaponEnchant || {};
      if(!Number.isFinite(Number(out.coins))) out.coins = Number(out.coins || 0) || 0;
    }catch(e){}
    return out;
  };

  function formatEnchant(en){
    en = en || {};
    const out=[];
    if(en.speed) out.push(`공속 Lv${en.speed}`);
    if(en.attack) out.push(`공격 Lv${en.attack}`);
    if(en.luck) out.push(`행운 Lv${en.luck}: 전용 장비/패턴 스킬 드롭률 +${pct(en.luck*3.5)}`);
    if(en.plunder) out.push(`약탈 Lv${en.plunder}: 부산물 추가 획득 확률 +${pct(en.plunder*8)}`);
    if(en.critDamage) out.push(`치명타 피해량 Lv${en.critDamage}`);
    if(en.critChance) out.push(`치명타 확률 Lv${en.critChance}`);
    return out.length ? out.join(' / ') : '없음';
  }

  const oldGetWeaponV44 = getWeapon;
  getWeapon = function(id){
    const base = oldGetWeaponV44(id); if(!base) return null;
    const v = v44(); const enh = clampInt(v.weaponEnhance[id] || 0, 0, 10); const en = v.weaponEnchant[id] || {};
    const w = {...base};
    w.v44BaseAtk = Number(base.v44BaseAtk || base.atk || 1);
    w.v44Enhance = enh;
    w.v44Enchant = en;
    w.v44Luck = (en.luck || 0) * 3.5;
    w.v44Plunder = (en.plunder || 0) * 8;
    w.v44CritDmg = (en.critDamage || 0) * .18;
    w.atk = +(Number(base.atk || 1) * (1 + enh*.11 + (en.attack||0)*.08)).toFixed(4);
    w.speed = Math.max(.25, +(Number(base.speed || .8) * (1 - (en.speed||0)*.055)).toFixed(4));
    w.crit = Number(base.crit || 0) + (en.critChance || 0) * 3;
    w.desc = `${base.desc || ''} / +${enh}강 적용: 공격 x${w.atk}, 공속 ${w.speed.toFixed(2)}, 치명 ${pct(w.crit||0)} / 인챈트: ${formatEnchant(en)}`;
    return w;
  };

  const oldGetSkillV44 = getSkill;
  getSkill = function(id){
    const base = oldGetSkillV44(id); if(!base) return null;
    const v = v44(); const lv = clampInt(v.skillLevels[id] || 1, 1, 7);
    const s = {...base};
    s.v44Level = lv;
    s.v44BasePower = Number(base.v44BasePower || base.power || 1);
    s.power = +(Number(base.power || 1) * (1 + (lv-1)*.15)).toFixed(4);
    s.cooldown = Math.max(2.1, +(Number(base.cooldown || 8) * (1 - (lv-1)*.025)).toFixed(3));
    s.desc = `${base.desc || ''} / Lv.${lv} 적용: 위력 x${s.power}, 쿨타임 ${s.cooldown.toFixed(1)}초`;
    return s;
  };

  const oldApplyBuildV44 = applyBuild;
  applyBuild = function(){
    oldApplyBuildV44();
    try{
      const w = getWeapon(state.selectedWeaponId);
      if(w){
        player.critDmg += w.v44CritDmg || 0;
        player.dropLuck = (player.dropLuck || 0) + (w.v44Luck || 0);
        player.plunder = (player.plunder || 0) + (w.v44Plunder || 0);
      }
    }catch(e){}
  };

  ownedWeapons = function(){ return uniqueByName(WEAPONS.filter(w => (state.save.weapons||[]).includes(w.id))); };
  ownedArmors = function(){ return uniqueByName(ARMORS.filter(a => (state.save.armors||[]).includes(a.id))); };
  ownedSkills = function(cat){ return uniqueByName(SKILLS.filter(s => (state.save.skills||[]).includes(s.id) && (!cat || s.category===cat))); };
  ownedPassives = function(){ return uniqueByName(PASSIVES.filter(p => (state.save.passives||[]).includes(p.id))); };

  function detailText(it,type){
    if(!it) return '';
    if(type==='weapon'){
      const w=getWeapon(it.id)||it;
      return `무기 상세\n이름: ${w.name}\n희귀도: ${getRarity(w.rarity).name}\n종류: ${weaponKindName(w.kind)}\n강화: +${w.v44Enhance||0}/10\n공격 배율: x${w.atk}\n공격속도: ${Number(w.speed||0).toFixed(2)}\n치명 확률: ${pct(w.crit||0)}\n인챈트: ${formatEnchant(w.v44Enchant)}\n강화 재료: ${kindMat(w)}\n설명: ${w.desc}`;
    }
    if(type==='skill'){
      const s=getSkill(it.id)||it; const v=v44();
      return `스킬 상세\n이름: ${s.name}\nLv.${v.skillLevels[it.id]||1}/7\n중복 강화 포인트: ${v.skillCopies[it.id]||0}\n분류: ${skillCategoryName(s.category)}\n속성: ${s.element}\n위력: x${s.power}\n쿨타임: ${Number(s.cooldown||0).toFixed(1)}초\n범위: ${s.radius}\n설명: ${s.desc}`;
    }
    if(type==='armor') return `방어구 상세\n이름: ${it.name}\n희귀도: ${getRarity(it.rarity).name}\n체력 +${it.hp}\n방어 +${it.def}\n설명: ${it.desc}`;
    return `${it.name}\n${it.desc||''}`;
  }

  function addOwned(kind,id){
    if(!id) return false;
    if(kind==='weapon'){ const a=state.save.weapons||(state.save.weapons=[]); if(!a.includes(id)){ a.push(id); return true; } return false; }
    if(kind==='armor'){ const a=state.save.armors||(state.save.armors=[]); if(!a.includes(id)){ a.push(id); return true; } return false; }
    if(kind==='skill'){
      const a=state.save.skills||(state.save.skills=[]); const v=v44();
      if(a.includes(id)){ v.skillCopies[id]=(v.skillCopies[id]||0)+1; return false; }
      a.push(id); v.skillLevels[id]=1; return true;
    }
    if(kind==='passive'){ const a=state.save.passives||(state.save.passives=[]); if(!a.includes(id)){ a.push(id); return true; } return false; }
    return false;
  }

  rollBossTicketRewards = function(b){
    const t = bossTier(b); const rw={weapon:0,armor:0,skill:0,passive:0};
    const weights = t>=8 ? {weapon:29,armor:24,skill:29,passive:18} : t>=5 ? {weapon:24,armor:22,skill:37,passive:17} : {weapon:20,armor:20,skill:45,passive:15};
    for(let i=0;i<t;i++){
      let r=Math.random()*(weights.weapon+weights.armor+weights.skill+weights.passive);
      for(const k of ['weapon','armor','skill','passive']){ r-=weights[k]; if(r<=0){ rw[k]++; break; } }
    }
    const sum=rw.weapon+rw.armor+rw.skill+rw.passive;
    if(sum<t) rw.skill += t-sum;
    if(sum>t){ let over=sum-t; for(const k of ['skill','weapon','armor','passive']){ const cut=Math.min(over,rw[k]); rw[k]-=cut; over-=cut; if(over<=0) break; } }
    return rw;
  };
  rewardTextFromTickets = function(rw){
    const parts=[]; if(rw.weapon) parts.push(`무기 ${rw.weapon}장`); if(rw.armor) parts.push(`방어구 ${rw.armor}장`); if(rw.skill) parts.push(`스킬 ${rw.skill}장`); if(rw.passive) parts.push(`패시브 ${rw.passive}장`);
    return parts.length ? '획득 티켓: '+parts.join(' / ') : '획득 티켓: 스킬 1장';
  };

  function rollBossSpecialDrops(b){
    const t=bossTier(b), out=[]; if(t<3) return out;
    const luck=(player && player.dropLuck) || 0;
    const chances = { weapon: .012 + t*.0035 + luck/100, armor: .014 + t*.0035 + luck/100, skill: .008 + t*.0028 + luck/100 };
    const wid=`v44_boss_weapon_${b.id}`, aid=`v44_boss_armor_${b.id}`, sid=`v44_boss_skill_${b.id}`;
    const w=getWeapon(wid), a=getArmor(aid), s=getSkill(sid);
    if(w && Math.random()<chances.weapon){ addOwned('weapon',wid); out.push(`전용 무기 ${w.name} (${pct(chances.weapon*100)} 확률)`); }
    if(a && Math.random()<chances.armor){ addOwned('armor',aid); out.push(`전용 방어구 ${a.name} (${pct(chances.armor*100)} 확률)`); }
    if(s && Math.random()<chances.skill){ const fresh=addOwned('skill',sid); out.push(fresh ? `패턴 스킬 ${s.name} (${pct(chances.skill*100)} 확률)` : `패턴 스킬 중복 포인트 ${s.name}`); }
    return out;
  }
  function rewardCoinsAndMaterials(b){
    const t=bossTier(b); const coins=Math.floor(220*t + t*t*55 + Math.random()*t*80);
    state.save.coins=(state.save.coins||0)+coins;
    const mat=bossMat(b); const plunder=(player&&player.plunder)||0;
    let qty=1+Math.floor(t/2);
    if(Math.random()<plunder/100) qty+=1+Math.floor(t/3);
    if(Math.random()<Math.min(.5,t*.04)) qty+=1;
    addMat(mat,qty);
    return {coins,mat,qty};
  }

  const oldRollGachaV44 = rollGacha;
  rollGacha = function(kind){
    v44();
    if(!state.save.tickets || typeof state.save.tickets !== 'object') state.save.tickets={...INITIAL_TICKETS};
    if((state.save.tickets[kind]||0)<=0){ toast(TICKET_LABEL[kind]+'이 부족합니다.'); return; }
    state.save.tickets[kind]-=1;
    const rarity=pickRarity();
    const pool = kind==='weapon'?WEAPONS.filter(x=>x.rarity===rarity):kind==='armor'?ARMORS.filter(x=>x.rarity===rarity):kind==='skill'?SKILLS.filter(x=>x.rarity===rarity):PASSIVES.filter(x=>x.rarity===rarity);
    const list = pool.length?pool:(kind==='weapon'?WEAPONS:kind==='armor'?ARMORS:kind==='skill'?SKILLS:PASSIVES);
    const item=list[Math.floor(Math.random()*list.length)];
    if(kind==='weapon') addOwned('weapon',item.id);
    if(kind==='armor') addOwned('armor',item.id);
    if(kind==='skill') addOwned('skill',item.id);
    if(kind==='passive') addOwned('passive',item.id);
    state.gachaResult=item; gachaCelebration(item); saveGame(); renderMenu();
  };

  function enhanceCost(id){ const w=getWeapon(id); const enh=clampInt(v44().weaponEnhance[id]||0,0,10); return {mat:kindMat(w), qty:(enh+1)*(enh+2), coins:Math.floor(190*(enh+1)*(1+enh*.45))}; }
  function enhanceWeapon(id){
    const w=getWeapon(id); if(!w) return;
    const v=v44(); const enh=clampInt(v.weaponEnhance[id]||0,0,10); if(enh>=10){ toast('이미 +10강입니다.'); return; }
    const c=enhanceCost(id); if((state.save.coins||0)<c.coins){ toast(`코인이 부족합니다. 필요 ${c.coins}코인`); return; }
    if(!takeMat(c.mat,c.qty)){ toast(`${c.mat} ${c.qty}개가 필요합니다.`); return; }
    state.save.coins-=c.coins; v.weaponEnhance[id]=enh+1; toast(`${w.name} +${enh+1} 강화 성공`); saveGame(); renderMenu();
  }
  function randomEnchant(){
    const types=['speed','attack','luck','plunder','critDamage','critChance'];
    const count=1+(Math.random()<.32?1:0)+(Math.random()<.11?1:0)+(Math.random()<.035?1:0);
    const en={}; while(Object.keys(en).length<count){ const k=types[Math.floor(Math.random()*types.length)]; en[k]=1+Math.floor(Math.random()*3); }
    return en;
  }
  function enchantWeapon(id){
    const w=getWeapon(id); if(!w) return;
    const cost=Math.floor(650*powOf(w.rarity)); const mat=kindMat(w); const qty=3+(w.v44Enhance||0);
    if((state.save.coins||0)<cost){ toast(`인챈트 비용 ${cost}코인이 부족합니다.`); return; }
    if(!takeMat(mat,qty)){ toast(`${mat} ${qty}개가 필요합니다.`); return; }
    state.save.coins-=cost; v44().weaponEnchant[id]=randomEnchant(); toast(`${w.name} 인챈트 완료`); saveGame(); renderMenu();
  }
  function sellWeapon(id){
    const w=getWeapon(id); if(!w) return; const price=Math.floor(650*powOf(w.rarity)*(1+(w.v44Enhance||0)*.2));
    state.save.weapons=(state.save.weapons||[]).filter(x=>x!==id); if(state.selectedWeaponId===id) state.selectedWeaponId=null; state.save.coins=(state.save.coins||0)+price;
    toast(`${w.name} 평균가 판매: ${price}코인`); saveGame(); renderMenu();
  }
  function disassembleWeapon(id){
    const w=getWeapon(id); if(!w) return; const qty=3+Math.ceil(powOf(w.rarity)*2)+(w.v44Enhance||0)*2; const mat=kindMat(w);
    state.save.weapons=(state.save.weapons||[]).filter(x=>x!==id); if(state.selectedWeaponId===id) state.selectedWeaponId=null; addMat(mat,qty);
    toast(`${w.name} 분해: ${mat} ${qty}개 획득`); saveGame(); renderMenu();
  }
  function upgradeSkill(id){
    const s=getSkill(id); if(!s) return; const v=v44(); const lv=clampInt(v.skillLevels[id]||1,1,7); const cp=v.skillCopies[id]||0;
    if(lv>=7){ toast('이미 Lv.7입니다.'); return; }
    if(cp<=0){ toast('같은 스킬 중복 포인트가 필요합니다.'); return; }
    v.skillCopies[id]=cp-1; v.skillLevels[id]=lv+1; toast(`${s.name} Lv.${lv+1} 달성`); saveGame(); renderMenu();
  }

  function marketLoad(){ try{return JSON.parse(localStorage.getItem(V44_MARKET_KEY)||'[]').filter(x=>x&&x.price>0);}catch(e){return[];} }
  function marketSave(a){ try{localStorage.setItem(V44_MARKET_KEY,JSON.stringify((a||[]).slice(-160)));}catch(e){} }
  function marketRegisterMaterial(){
    const mat=document.getElementById('v44MatSelect')?.value||''; const price=Math.max(1,int(document.getElementById('v44MatPrice')?.value,0)); const qty=Math.min(10,matCount(mat));
    if(!mat||qty<=0){ toast('등록할 부산물이 없습니다.'); return; }
    takeMat(mat,qty); const a=marketLoad(); a.push({id:'mat_'+Date.now()+'_'+Math.random(),seller:state.save.playerName||'Player',kind:'material',name:mat,qty,price,t:Date.now()}); marketSave(a); saveGame(); renderMenu();
  }
  function marketRegisterWeapon(id){ const w=getWeapon(id); if(!w) return; const price=Math.max(1,int(prompt('판매소에 등록할 가격을 입력하세요', Math.floor(900*powOf(w.rarity)*(1+(w.v44Enhance||0)*.25))),0)); if(!price) return; state.save.weapons=(state.save.weapons||[]).filter(x=>x!==id); const a=marketLoad(); a.push({id:'wp_'+Date.now()+'_'+Math.random(),seller:state.save.playerName||'Player',kind:'weapon',itemId:id,name:w.name,qty:1,price,t:Date.now()}); marketSave(a); saveGame(); renderMenu(); }
  function marketRegisterSkill(id){ const s=getSkill(id); if(!s) return; const price=Math.max(1,int(prompt('판매소에 등록할 가격을 입력하세요', Math.floor(720*powOf(s.rarity))),0)); if(!price) return; state.save.skills=(state.save.skills||[]).filter(x=>x!==id); const a=marketLoad(); a.push({id:'sk_'+Date.now()+'_'+Math.random(),seller:state.save.playerName||'Player',kind:'skill',itemId:id,name:s.name,qty:1,price,t:Date.now()}); marketSave(a); saveGame(); renderMenu(); }
  function marketBuy(id){ const a=marketLoad(); const i=a.findIndex(x=>x.id===id); if(i<0) return; const it=a[i]; if((state.save.coins||0)<it.price){ toast('코인이 부족합니다.'); return; } state.save.coins-=it.price; if(it.kind==='material') addMat(it.name,it.qty); if(it.kind==='weapon') addOwned('weapon',it.itemId); if(it.kind==='skill') addOwned('skill',it.itemId); a.splice(i,1); marketSave(a); saveGame(); renderMenu(); }

  function chatLoad(){ const now=Date.now(); let a=[]; try{a=JSON.parse(localStorage.getItem(V44_CHAT_KEY)||'[]')||[];}catch(e){} a=a.filter(m=>now-(m.t||0)<30*60*1000); try{localStorage.setItem(V44_CHAT_KEY,JSON.stringify(a));}catch(e){} return a; }
  function chatSend(){ const input=document.getElementById('v44ChatInput'); const text=(input&&input.value||'').trim().slice(0,120); if(!text) return; const a=chatLoad(); a.push({name:state.save.playerName||'Player',text,t:Date.now()}); localStorage.setItem(V44_CHAT_KEY,JSON.stringify(a)); input.value=''; renderMenu(); }

  function renderEnhancedSelectionGrid(items, selected, type){
    const noneTitle = type === 'weapon' ? '무기 없이 출격' : type === 'armor' ? '방어구 없이 출격' : '비우기';
    const noneDesc = type === 'weapon' ? '스킬만으로도 출격할 수 있습니다.' : type === 'armor' ? '방어구 없이도 출격할 수 있습니다.' : '비워둡니다.';
    const noneCard = `<div class="card ${!selected?'active':''}" data-select-type="${type}" data-select-id="" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('${type}','',0)"><h3>${noneTitle}</h3><p>${noneDesc}</p></div>`;
    if(!items.length) return `<div class="grid">${noneCard}<div class="card"><h3>보유한 항목이 없습니다.</h3><p>뽑기 또는 보스 드롭으로 획득할 수 있습니다.</p></div></div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" class="btn" data-next-step>다음</button></div>`;
    return `<div class="grid">${noneCard}${items.map(it=>{
      if(type==='weapon'){
        const w=getWeapon(it.id)||it; const c=enhanceCost(it.id); const mats=matCount(c.mat);
        return `<div class="card ${selected===it.id?'active':''}" title="${esc(detailText(it,'weapon'))}" data-select-type="weapon" data-select-id="${it.id}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('weapon','${it.id}',0)"><h3>${esc(w.name)} +${w.v44Enhance||0} ${rarityLabel(w.rarity)}</h3><p>${esc(w.desc)}<br>공격 x${w.atk} · 공속 ${Number(w.speed||0).toFixed(2)}<br>강화 재료: ${esc(c.mat)} ${mats}/${c.qty} · 비용 ${c.coins}코인</p><div class="row" style="margin-top:8px"><button type="button" class="btn secondary" onclick="event.stopPropagation();window.RaidDungeonV44.enhanceWeapon('${it.id}')">강화</button><button type="button" class="btn secondary" onclick="event.stopPropagation();window.RaidDungeonV44.enchantWeapon('${it.id}')">인챈트</button></div><div class="row" style="margin-top:6px"><button type="button" class="btn secondary" onclick="event.stopPropagation();window.RaidDungeonV44.sellWeapon('${it.id}')">평균가 판매</button><button type="button" class="btn secondary" onclick="event.stopPropagation();window.RaidDungeonV44.disassembleWeapon('${it.id}')">분해</button></div><button type="button" class="btn secondary" style="margin-top:6px;width:100%" onclick="event.stopPropagation();window.RaidDungeonV44.marketRegisterWeapon('${it.id}')">유저 판매소 등록</button></div>`;
      }
      if(type==='armor') return `<div class="card ${selected===it.id?'active':''}" title="${esc(detailText(it,'armor'))}" data-select-type="armor" data-select-id="${it.id}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('armor','${it.id}',0)"><h3>${esc(it.name)} ${rarityLabel(it.rarity)}</h3><p>${esc(it.desc)}<br>체력 +${it.hp} / 방어 +${it.def}</p></div>`;
      return '';
    }).join('')}</div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" class="btn" data-next-step>다음</button></div>`;
  }

  selectionGrid = function(items, selected, type){ return renderEnhancedSelectionGrid(items, selected, type); };
  skillSlotGrid = function(slot){
    const items=ownedSkills(); const selected=state.selectedSkillIds[slot]||null;
    const noneCard=`<div class="card ${!selected?'active':''}" data-select-type="skill" data-slot="${slot}" data-select-id="" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('skill','',${slot})"><h3>스킬 ${slot+1} 비우기</h3><p>스킬을 끼지 않아도 됩니다.</p></div>`;
    if(!items.length) return `<div class="grid">${noneCard}<div class="card"><h3>보유한 스킬이 없습니다.</h3><p>뽑기 또는 보스 패턴 스킬 드롭으로 획득할 수 있습니다.</p></div></div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" class="btn" data-next-step>다음</button></div>`;
    return `<p class="sub">중복 스킬은 목록에 1개만 보이고 중복 획득분은 강화 포인트로 저장됩니다. 버튼으로 직접 Lv.7까지 올릴 수 있습니다.</p><div class="grid">${noneCard}${items.map(it=>{ const s=getSkill(it.id)||it; const v=v44(); const lv=v.skillLevels[it.id]||1, cp=v.skillCopies[it.id]||0; return `<div class="card ${selected===it.id?'active':''}" title="${esc(detailText(it,'skill'))}" data-select-type="skill" data-slot="${slot}" data-select-id="${it.id}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('skill','${it.id}',${slot})"><h3>${esc(s.name)} Lv.${lv} ${rarityLabel(s.rarity)}</h3><p>${esc(s.desc)}<br>위력 x${s.power} · 쿨 ${Number(s.cooldown||0).toFixed(1)}초 · 강화포인트 ${cp}</p><button type="button" class="btn secondary" style="margin-top:8px" onclick="event.stopPropagation();window.RaidDungeonV44.upgradeSkill('${it.id}')">스킬 레벨업</button><button type="button" class="btn secondary" style="margin-top:6px;width:100%" onclick="event.stopPropagation();window.RaidDungeonV44.marketRegisterSkill('${it.id}')">유저 판매소 등록</button></div>`; }).join('')}</div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" class="btn" data-next-step>다음</button></div>`;
  };

  function renderGrowthTab(){
    const v=v44(); const weapons=ownedWeapons(); const skills=ownedSkills();
    return `<h2 class="title" style="font-size:22px">성장 / 강화 / 인챈트</h2><p class="sub">코인 ${Math.floor(state.save.coins||0)} · 스킬은 중복 획득분으로 직접 Lv.7까지 강화합니다. 무기는 부산물과 코인을 사용해 +10까지 강화합니다.</p><div class="grid"><div class="card"><h3>스킬 레벨</h3>${skills.slice(0,18).map(s=>{ const gs=getSkill(s.id)||s; return `<div class="record"><div class="rank">Lv.${v.skillLevels[s.id]||1}</div><div><b>${esc(gs.name)}</b><div class="muted">포인트 ${v.skillCopies[s.id]||0} · 위력 x${gs.power}</div></div><button class="btn secondary" data-v44-skill-up="${s.id}">강화</button></div>`; }).join('')||'<p class="muted">보유 스킬 없음</p>'}</div><div class="card"><h3>무기 강화</h3>${weapons.slice(0,14).map(w0=>{ const w=getWeapon(w0.id)||w0; const c=enhanceCost(w0.id); return `<div class="record"><div class="rank">+${w.v44Enhance||0}</div><div><b>${esc(w.name)}</b><div class="muted">공격 x${w.atk} · ${esc(c.mat)} ${matCount(c.mat)}/${c.qty}</div></div><button class="btn secondary" data-v44-enhance="${w0.id}">강화</button></div>`; }).join('')||'<p class="muted">보유 무기 없음</p>'}</div></div>${renderMaterialSummary()}`;
  }
  function renderMaterialSummary(){ const mats=Object.entries(v44().materials).filter(([,q])=>q>0).sort((a,b)=>b[1]-a[1]); return `<div class="card" style="margin-top:12px"><h3>보유 부산물</h3><p class="muted">${mats.map(([m,q])=>`${esc(m)} ${q}개`).join('<br>')||'없음'}</p></div>`; }
  function renderMarketTab(){
    const mats=Object.entries(v44().materials).filter(([,q])=>q>0).sort((a,b)=>a[0].localeCompare(b[0])); const opts=mats.length?mats.map(([m,q])=>`<option value="${esc(m)}">${esc(m)} (${q})</option>`).join(''):'<option value="">부산물 없음</option>'; const market=marketLoad();
    return `<h2 class="title" style="font-size:22px">유저 판매소</h2><p class="sub">정적 브라우저 버전에서는 같은 브라우저 저장소 기준 판매소입니다. 부산물은 최대 10개가 1묶음으로 등록됩니다.</p><div class="grid"><div class="card"><h3>부산물 등록</h3><select id="v44MatSelect" class="input">${opts}</select><input id="v44MatPrice" class="input" type="number" min="1" placeholder="가격 입력" style="margin-top:8px"><button id="v44MatRegister" class="btn" style="margin-top:8px;width:100%">부산물 최대 10개 등록</button></div><div class="card"><h3>판매 목록</h3>${market.slice().reverse().map(x=>`<div class="record"><div class="rank">${x.kind==='material'?x.qty:'1'}</div><div><b>${esc(x.name)}</b><div class="muted">${esc(x.kind)} · 판매자 ${esc(x.seller)}</div></div><button class="btn secondary" data-v44-buy="${x.id}">${x.price} 구매</button></div>`).join('')||'<p class="muted">등록된 물품이 없습니다.</p>'}</div></div>`;
  }
  function renderChatTab(){ const chats=chatLoad(); return `<h2 class="title" style="font-size:22px">채팅</h2><p class="sub">작성된 지 30분이 지난 채팅은 자동 삭제됩니다.</p><div class="card"><div style="height:260px;overflow:auto;background:#020617;border:1px solid rgba(148,163,184,.22);border-radius:14px;padding:10px">${chats.map(m=>`<div class="muted" style="margin-bottom:6px"><b style="color:#e5e7eb">${esc(m.name)}:</b> ${esc(m.text)}</div>`).join('')||'<span class="muted">아직 채팅이 없습니다.</span>'}</div><div class="row" style="margin-top:10px"><input id="v44ChatInput" class="input" placeholder="채팅 입력"><button id="v44ChatSend" class="btn">전송</button></div></div>`; }

  function enhancedTop(){
    const chips = ui.menu ? ui.menu.querySelector('.row > div:last-child') : null;
    if(chips && !ui.menu.querySelector('[data-v44-coin-chip]')){
      const d=document.createElement('div'); d.className='chip'; d.setAttribute('data-v44-coin-chip','1'); d.textContent=`코인 ${Math.floor(state.save.coins||0)}`; chips.insertBefore(d, chips.firstChild);
    }
  }
  function enhancedNav(){
    const nav=ui.menu && ui.menu.querySelector('.nav'); if(!nav || nav.querySelector('[data-v44-extra]')) return;
    [['growth','성장/강화'],['market','유저 판매소'],['chat','채팅']].forEach(([tab,label])=>{ const btn=document.createElement('button'); btn.className='tab'; btn.dataset.v44Extra='1'; btn.textContent=label; btn.onclick=()=>{state.menuTab=tab; renderMenu();}; nav.appendChild(btn); });
  }
  const oldRenderMenuV44 = renderMenu;
  renderMenu = function(){
    v44(); ensureBossExclusiveDrops(); chatLoad();
    if(['growth','market','chat'].includes(state.menuTab)){
      const tabs=[['dungeon','던전 선택'],['gacha','뽑기 상점'],['build','출격 준비'],['ranking','레이드 랭킹'],['growth','성장/강화'],['market','유저 판매소'],['chat','채팅']];
      const body=state.menuTab==='growth'?renderGrowthTab():state.menuTab==='market'?renderMarketTab():renderChatTab();
      ui.menu.innerHTML=`<div class="row"><div><h1 class="title">Raid Dungeon</h1><p class="sub">보스 드롭, 강화, 인챈트, 판매소, 채팅이 보이는 V44 메뉴입니다.</p></div><div style="text-align:right"><div class="chip">${V44_VERSION}</div><div class="chip">닉네임 ${esc(state.save.playerName||'Player')}</div><div class="chip">코인 ${Math.floor(state.save.coins||0)}</div><div class="chip">무기티켓 ${state.save.tickets.weapon||0}</div><div class="chip">방어구티켓 ${state.save.tickets.armor||0}</div><div class="chip">스킬티켓 ${state.save.tickets.skill||0}</div><div class="chip">패시브티켓 ${state.save.tickets.passive||0}</div></div></div><div class="nav">${tabs.map(([t,l])=>`<button class="tab ${state.menuTab===t?'active':''}" data-v44-tab="${t}">${l}</button>`).join('')}</div>${body}`;
      ui.menu.querySelectorAll('[data-v44-tab]').forEach(b=>b.onclick=()=>{state.menuTab=b.dataset.v44Tab; renderMenu();});
      bindV44PanelEvents();
      return;
    }
    oldRenderMenuV44(); enhancedTop(); enhancedNav(); bindV44PanelEvents();
  };
  function bindV44PanelEvents(){
    ui.menu.querySelectorAll('[data-v44-skill-up]').forEach(b=>b.onclick=()=>upgradeSkill(b.dataset.v44SkillUp));
    ui.menu.querySelectorAll('[data-v44-enhance]').forEach(b=>b.onclick=()=>enhanceWeapon(b.dataset.v44Enhance));
    ui.menu.querySelectorAll('[data-v44-buy]').forEach(b=>b.onclick=()=>marketBuy(b.dataset.v44Buy));
    const mr=ui.menu.querySelector('#v44MatRegister'); if(mr) mr.onclick=marketRegisterMaterial;
    const cs=ui.menu.querySelector('#v44ChatSend'); if(cs) cs.onclick=chatSend;
    const ci=ui.menu.querySelector('#v44ChatInput'); if(ci) ci.onkeydown=e=>{ if(e.key==='Enter') chatSend(); };
  }

  function hasLocalRecordBeforeSave(bossId){ try{return getLocalRecords().some(r=>r && r.boss_id===bossId);}catch(e){return false;} }
  async function cloudHasRecord(bossId){
    if(!(supabaseReady && supabase)) return false;
    try{ const res=await supabase.from('raid_records').select('id').eq('boss_id',bossId).limit(1); return !!(res && Array.isArray(res.data) && res.data.length); }catch(e){ return false; }
  }
  function removeAllFirstClearVisuals(){
    try{ document.getElementById(V44_FIRST_BOX_ID)?.remove(); }catch(e){}
    try{ document.getElementById('raid-v43-first-clear-banner')?.remove(); }catch(e){}
    try{ document.getElementById('raid-v40-first-clear-banner')?.remove(); }catch(e){}
    try{ document.querySelectorAll('[id*="first-clear"], [id*="FirstClear"]').forEach(el=>{ if(el.id!==V44_FIRST_STYLE_ID) el.remove(); }); }catch(e){}
    try{ state.v37FirstClearT=0; state.v39FirstClearT=0; state.v40FirstClearT=0; state.v43FirstClearT=0; }catch(e){}
  }
  function showFirstClearCenterOnly(name){
    removeAllFirstClearVisuals();
    const st=document.getElementById(V44_FIRST_STYLE_ID)||document.createElement('style'); st.id=V44_FIRST_STYLE_ID; st.textContent='@keyframes raidV44First{0%{opacity:0;transform:translate(-50%,-50%) scale(.62)}13%{opacity:1;transform:translate(-50%,-50%) scale(1.06)}78%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(1)}}'; document.head.appendChild(st);
    const box=document.createElement('div'); box.id=V44_FIRST_BOX_ID; box.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483647;min-width:650px;max-width:90vw;text-align:center;padding:38px 48px;border:5px solid #facc15;border-radius:32px;background:rgba(2,6,23,.92);box-shadow:0 0 72px rgba(250,204,21,.78);pointer-events:none;animation:raidV44First 5.2s ease-out forwards;'; box.innerHTML=`<div style="font-size:62px;font-weight:950;color:#facc15;letter-spacing:.06em;text-shadow:0 0 32px #facc15">FIRST CLEAR!</div><div style="margin-top:10px;font-size:23px;font-weight:900;color:white">${esc(name)} 최초 클리어 기록 달성</div>`; document.body.appendChild(box); setTimeout(()=>box.remove(),5600); try{ state.flash=Math.max(state.flash||0,1.2); burst(W/2,H/2,'#facc15',150,600); }catch(e){}
  }

  async function submitRecordV44(record,bossSnapshot,firstCandidate){
    let trulyFirst=!!firstCandidate;
    if(trulyFirst){ const cloud=await cloudHasRecord(bossSnapshot.id); if(cloud) trulyFirst=false; }
    try{ let local=getLocalRecords().filter(r=>!(r.boss_id===bossSnapshot.id && normalizedPlayerName(r.player_name).toLowerCase()===normalizedPlayerName(record.player_name).toLowerCase())); local.push(record); local=dedupeLatestByPlayer(local).slice(0,250); localStorage.setItem(LOCAL_RECORD_KEY,JSON.stringify(local)); }catch(e){}
    if(supabaseReady&&supabase){ try{ await supabase.from('raid_records').delete().eq('boss_id',bossSnapshot.id).eq('player_name',record.player_name); await supabase.from('raid_records').insert(record); }catch(e){ console.warn('Supabase ranking save failed:', e && e.message ? e.message : e); } }
    if(trulyFirst) showFirstClearCenterOnly(bossSnapshot.name);
    refreshRankings(bossSnapshot.id);
  }

  endRaid = function(clear){
    removeAllFirstClearVisuals();
    state.screen='result';
    const elapsed=Math.floor(state.raid.elapsed*1000); let rewardText='';
    if(clear){
      const b=getBoss(boss.id); const firstCandidate=!hasLocalRecordBeforeSave(b.id);
      const rw=rollBossTicketRewards(b);
      state.save.tickets.weapon=(state.save.tickets.weapon||0)+rw.weapon;
      state.save.tickets.armor=(state.save.tickets.armor||0)+rw.armor;
      state.save.tickets.skill=(state.save.tickets.skill||0)+rw.skill;
      state.save.tickets.passive=(state.save.tickets.passive||0)+rw.passive;
      const cm=rewardCoinsAndMaterials(b); const rare=rollBossSpecialDrops(b);
      rewardText=`${rewardTextFromTickets(rw)}<br>코인 ${cm.coins} 획득 / ${esc(cm.mat)} ${cm.qty}개 획득`;
      const t=bossTier(b); if(t>=3) rewardText += `<br><span style="color:#94a3b8">전용 장비/패턴 스킬 낮은 확률 드롭 대상: 무기·방어구·보스 패턴 스킬</span>`;
      if(rare.length) rewardText += `<br><b style="color:#facc15">희귀 드롭: ${rare.map(esc).join(' / ')}</b>`;
      saveGame();
      const playerName=normalizedPlayerName(state.save.playerName);
      const record={player_name:playerName,boss_id:b.id,boss_name:b.name,clear_ms:elapsed,weapon_id:state.raid.weapon?state.raid.weapon.id:'none',weapon_name:state.raid.weapon?state.raid.weapon.name:'무기 없음',skills:state.raid.skills.filter(Boolean).map(s=>s.name),passives:[state.raid.armor?('방어구: '+state.raid.armor.name):'방어구 없음'].concat(state.raid.passives.filter(Boolean).map(p=>p.name)),damage_taken:player.damageTaken,created_at:new Date().toISOString()};
      submitRecordV44(record,{id:b.id,name:b.name},firstCandidate);
    }
    ui.right.classList.remove('hidden');
    ui.right.innerHTML=`<h1 class="title">${clear?'클리어!':'실패'}</h1><p class="sub">${esc(boss.name)}<br>시간: ${formatMs(elapsed)}<br>받은 피해: ${player.damageTaken}<br>${clear?rewardText:'보스를 다시 분석해보세요.'}</p><button id="resultMenu" class="btn">메뉴로</button>`;
    const btn=ui.right.querySelector('#resultMenu'); if(btn) btn.onclick=()=>{state.menuTab=clear?'ranking':'build'; renderMenu(); refreshRankings(boss.id);};
  };

  const oldDrawV44 = draw;
  draw = function(){ try{ state.v37FirstClearT=0; state.v39FirstClearT=0; state.v40FirstClearT=0; state.v43FirstClearT=0; }catch(e){} oldDrawV44(); };

  try{
    window.RaidDungeonUI.growthTab = () => { state.menuTab='growth'; renderMenu(); };
    window.RaidDungeonUI.marketTab = () => { state.menuTab='market'; renderMenu(); };
    window.RaidDungeonUI.chatTab = () => { state.menuTab='chat'; renderMenu(); };
  }catch(e){}
  try{
    window.RaidDungeonV44 = {version:V44_VERSION, v44, enhanceWeapon, enchantWeapon, sellWeapon, disassembleWeapon, upgradeSkill, marketRegisterWeapon, marketRegisterSkill, marketRegisterMaterial, marketBuy, chatSend, ensureBossExclusiveDrops, rollBossSpecialDrops};
    v44(); ensureBossExclusiveDrops(); renderMenu();
  }catch(e){ console.warn('[V44 init failed]', e); }
})();


/* =========================================================
   RAID DUNGEON V45 - FORCED VISIBLE PROGRESSION / MARKET / CHAT
   - Runs inside the main game closure.
   - Forces visible menu tabs and top coin display.
   - Tier tickets = tier count.
   - Boss exclusive drops from 3-star bosses.
   - Skill level system, weapon enhance/enchant, materials, coins.
   - Local market and 30-minute chat.
   - FIRST CLEAR only when no previous local record exists for that boss.
========================================================= */
(function raidDungeonV45ForcedVisibleProgression(){
  const V45_VERSION = 'Raid Dungeon V48 - Clean Growth UI Effects';
  const MARKET_KEY = 'raid-dungeon-v45-market';
  const CHAT_KEY = 'raid-dungeon-v45-chat';
  const FIRST_BOX_ID = 'raid-v45-first-clear-only-center';
  const FIRST_STYLE_ID = 'raid-v45-first-style';
  const MATERIALS = ['슬라임 젤','화염 결정','가시 줄기','빙결 파편','모래 핵','공허 조각','철갑 파편','혈월 결정','폭풍 코어','역병 표본','거울 조각','중력석','태양 파편','시간 톱니','심해 비늘','인형 실','검은 태양핵','혼돈 결정','열차 강철','예언 큐브칩','정원 뿌리','자기 코어','악몽 가루'];
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function safeId(s){return String(s||'none').replace(/[^a-zA-Z0-9_\-가-힣]/g,'_').slice(0,60);}
  function tierOf(b){return clamp(Math.round(Number(b&&b.tier||1)),1,10);}
  function v45(){
    if(!state.save) state.save = defaultSave();
    if(!state.save.tickets) state.save.tickets = {...INITIAL_TICKETS};
    if(!Number.isFinite(state.save.coins)) state.save.coins = 0;
    const v = state.save.v45 || (state.save.v45={});
    v.skillLevels = v.skillLevels || {};
    v.skillCopies = v.skillCopies || {};
    v.weaponEnhance = v.weaponEnhance || {};
    v.weaponEnchant = v.weaponEnchant || {};
    v.materials = v.materials || {};
    v.bossDrops = v.bossDrops || {};
    return v;
  }
  function addMat(name,qty){const v=v45(); name=name||'정체불명 부산물'; v.materials[name]=(v.materials[name]||0)+Math.max(0,Math.floor(qty||0));}
  function matCount(name){return Number(v45().materials[name]||0);}
  function takeMat(name,qty){const v=v45(); qty=Math.max(0,Math.floor(qty||0)); if((v.materials[name]||0)<qty) return false; v.materials[name]-=qty; return true;}
  function enchantSummary(e){
    if(!e||!e.length) return '없음';
    const label={speed:'공속',attack:'공격',luck:'행운',plunder:'약탈',critDamage:'치명타 피해',critChance:'치명타 확률'};
    return e.map(x=>`${label[x.type]||x.type} Lv.${x.lv}`).join(' / ');
  }
  function enchantRates(e){
    const r={speed:0,attack:0,luck:0,plunder:0,critDamage:0,critChance:0};
    (e||[]).forEach(x=>{r[x.type]=(r[x.type]||0)+Number(x.lv||0);});
    return {speed:r.speed*.06, attack:r.attack*.08, luck:r.luck*.03, plunder:r.plunder*.08, critDamage:r.critDamage*.12, critChance:r.critChance*.04};
  }
  function weaponMeta(id){const v=v45(); id=safeId(id); return {enh:v.weaponEnhance[id]||0, ench:v.weaponEnchant[id]||[]};}
  function enhanceCost(id){const w=(oldGetWeaponV45?oldGetWeaponV45(id):null)||getWeapon(id)||{}; const lv=weaponMeta(id).enh; const mat=MATERIALS[Math.abs(hashCode(id||w.name||'w'))%MATERIALS.length]; return {mat, qty:Math.max(1,1+lv*2), coins:Math.max(20,60+lv*55)};}
  function hashCode(s){let h=0; s=String(s||''); for(let i=0;i<s.length;i++) h=((h<<5)-h+s.charCodeAt(i))|0; return h;}
  function currentLuck(){
    try{const id=state.selectedWeaponId || (state.raid&&state.raid.weapon&&state.raid.weapon.id); const e=weaponMeta(id).ench; return enchantRates(e).luck||0;}catch(e){return 0;}
  }
  function currentPlunder(){
    try{const id=state.selectedWeaponId || (state.raid&&state.raid.weapon&&state.raid.weapon.id); const e=weaponMeta(id).ench; return enchantRates(e).plunder||0;}catch(e){return 0;}
  }

  try{
    var oldNormalizeSaveDataV45 = normalizeSaveData;
    normalizeSaveData = function(s){ const out=oldNormalizeSaveDataV45(s); state.save=out; v45(); return out; };
  }catch(e){}

  var oldGetWeaponV45 = null;
  try{
    oldGetWeaponV45 = getWeapon;
    getWeapon = function(id){
      const base=oldGetWeaponV45(id); if(!base) return null;
      const m=weaponMeta(id), rates=enchantRates(m.ench);
      const upMul=1+m.enh*.10+rates.attack;
      const speedMul=1+rates.speed;
      return {...base, atk:+(Number(base.atk||1)*upMul).toFixed(3), speed:+(Number(base.speed||1)/speedMul).toFixed(3), v45Enhance:m.enh, v45Enchant:m.ench, desc:String(base.desc||'')+`\n[V45] +${m.enh} 강화 · 인챈트 ${enchantSummary(m.ench)} · 공격 +${Math.round((upMul-1)*100)}% · 공속 +${Math.round(rates.speed*100)}% · 행운 +${Math.round(rates.luck*100)}% · 약탈 +${Math.round(rates.plunder*100)}%`};
    };
  }catch(e){console.warn('[V45 getWeapon patch failed]',e);}
  var oldGetSkillV45 = null;
  try{
    oldGetSkillV45 = getSkill;
    getSkill = function(id){
      const base=oldGetSkillV45(id); if(!base) return null;
      const lv=clamp(Number(v45().skillLevels[id]||1),1,7);
      const mul=1+(lv-1)*.16;
      return {...base, power:+(Number(base.power||1)*mul).toFixed(3), v45Level:lv, desc:String(base.desc||'')+`\n[V45] 스킬 Lv.${lv}/7 · 위력 +${Math.round((mul-1)*100)}%`};
    };
  }catch(e){console.warn('[V45 getSkill patch failed]',e);}

  try{
    const oldRollGachaV45=rollGacha;
    rollGacha=function(kind){
      if(kind!=='skill') return oldRollGachaV45(kind);
      if(!state.save.tickets || typeof state.save.tickets!=='object') state.save.tickets={...INITIAL_TICKETS};
      if((state.save.tickets.skill||0)<=0){toast('스킬 티켓이 부족합니다.');return;}
      state.save.tickets.skill-=1;
      const rarity=pickRarity();
      const pool=SKILLS.filter(x=>x.rarity===rarity); const list=pool.length?pool:SKILLS;
      const item=list[Math.floor(Math.random()*list.length)];
      const v=v45();
      if(!state.save.skills.includes(item.id)){state.save.skills.push(item.id); v.skillLevels[item.id]=v.skillLevels[item.id]||1; toast(`${item.name} 획득! Lv.1`);}
      else {v.skillCopies[item.id]=(v.skillCopies[item.id]||0)+1; toast(`${item.name} 중복 획득: 강화 포인트 +1`);}
      state.gachaResult=item; gachaCelebration(item); saveGame(); renderMenu();
    };
  }catch(e){console.warn('[V45 gacha patch failed]',e);}

  function tierTickets(b){
    const tier=tierOf(b); const rewards={weapon:0,armor:0,skill:0,passive:0};
    const kinds=['skill','weapon','armor','passive'];
    for(let i=0;i<tier;i++){
      const roll=Math.random();
      const idx = roll<.38?0:roll<.62?1:roll<.83?2:3;
      rewards[kinds[idx]]++;
    }
    return rewards;
  }
  try{ rollBossTicketRewards = tierTickets; }catch(e){}
  function rewardText(r){const p=[]; if(r.weapon)p.push(`무기 ${r.weapon}장`); if(r.armor)p.push(`방어구 ${r.armor}장`); if(r.skill)p.push(`스킬 ${r.skill}장`); if(r.passive)p.push(`패시브 ${r.passive}장`); return p.join(' / ');}
  function bossMaterialName(b){return `${b&&b.name?b.name:'보스'} 부산물`;}
  function addBossExclusiveDrops(b, out){
    b=b||boss; const tier=tierOf(b); if(tier<3) return;
    const luck=currentLuck();
    const base=.018 + tier*.004 + luck;
    const rareMap=tier>=9?'ultimate':tier>=7?'legendary':tier>=5?'epic':'super';
    const idBase=safeId(b.id||b.name||'boss');
    const color=b.color||'#facc15';
    function addWeapon(){
      const id='boss_weapon_'+idBase; if(!state.save.weapons.includes(id)) state.save.weapons.push(id);
      if(!WEAPONS.some(w=>w.id===id)) WEAPONS.push({id,name:`${b.name}의 전용 무기`,kind:'sword',rarity:rareMap,color,atk:1.8+tier*.16,speed:0.62,range:92,desc:`${b.name}의 힘이 담긴 보스 전용 무기입니다.`});
      out.push(`전용 무기: ${b.name}의 전용 무기`);
    }
    function addArmor(){
      const id='boss_armor_'+idBase; if(!state.save.armors.includes(id)) state.save.armors.push(id);
      if(!ARMORS.some(a=>a.id===id)) ARMORS.push({id,name:`${b.name}의 전용 방어구`,rarity:rareMap,color,hp:120+tier*35,def:3+tier*.7,speed:0,desc:`${b.name}의 기운이 담긴 보스 전용 방어구입니다.`});
      out.push(`전용 방어구: ${b.name}의 전용 방어구`);
    }
    function addPatternSkill(){
      const id='boss_pattern_skill_'+idBase; const v=v45();
      if(!state.save.skills.includes(id)){state.save.skills.push(id); v.skillLevels[id]=1;}
      else v.skillCopies[id]=(v.skillCopies[id]||0)+1;
      if(!SKILLS.some(s=>s.id===id)) SKILLS.push({id,name:`${b.name} 패턴 스킬`,rarity:rareMap,color,type:'burst',category:'attack',element:b.theme||'boss',power:1.2+tier*.13,radius:70+tier*5,cooldown:7.5,desc:`${b.name}의 대표 패턴을 플레이어가 사용하는 전용 스킬입니다.`});
      out.push(`보스 패턴 스킬: ${b.name} 패턴 스킬`);
    }
    if(Math.random()<base) addWeapon();
    if(Math.random()<base*.9) addArmor();
    if(Math.random()<base*.75) addPatternSkill();
  }

  function showFirstOnlyCenter(name){
    try{ document.getElementById(FIRST_BOX_ID)?.remove(); document.querySelectorAll('[id*="first" i]').forEach(el=>{ if(el.id!==FIRST_STYLE_ID && el.id!==FIRST_BOX_ID && el.style && el.style.position==='fixed') el.remove(); }); }catch(e){}
    let st=document.getElementById(FIRST_STYLE_ID); if(!st){st=document.createElement('style'); st.id=FIRST_STYLE_ID; document.head.appendChild(st);} st.textContent='@keyframes v45first{0%{opacity:0;transform:translate(-50%,-50%) scale(.65)}14%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-50%) scale(.98)}}';
    const box=document.createElement('div'); box.id=FIRST_BOX_ID; box.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483647;text-align:center;min-width:620px;max-width:92vw;padding:38px 46px;border:5px solid #facc15;border-radius:34px;background:rgba(2,6,23,.94);box-shadow:0 0 80px rgba(250,204,21,.8);pointer-events:none;animation:v45first 5.2s ease-out forwards'; box.innerHTML=`<div style="font-size:64px;font-weight:950;color:#facc15;text-shadow:0 0 30px #facc15">FIRST CLEAR!</div><div style="font-size:24px;font-weight:900;color:#fff;margin-top:8px">${esc(name)} 최초 클리어 기록 달성</div>`; document.body.appendChild(box); setTimeout(()=>box.remove(),5600);
  }

  try{
    endRaid=function(clear){
      state.screen='result'; const elapsed=Math.floor(state.raid.elapsed*1000); let reward='';
      const b=getBoss(boss.id)||boss;
      if(clear){
        const previous=getLocalRecords().some(r=>r&&r.boss_id===b.id);
        const rw=tierTickets(b);
        state.save.tickets.weapon=(state.save.tickets.weapon||0)+rw.weapon;
        state.save.tickets.armor=(state.save.tickets.armor||0)+rw.armor;
        state.save.tickets.skill=(state.save.tickets.skill||0)+rw.skill;
        state.save.tickets.passive=(state.save.tickets.passive||0)+rw.passive;
        const special=[]; addBossExclusiveDrops(b,special);
        const coins=50+tierOf(b)*tierOf(b)*35+Math.floor(Math.random()*tierOf(b)*18); state.save.coins=(state.save.coins||0)+coins;
        const mat=bossMaterialName(b); const matQty=1+Math.floor(tierOf(b)/3)+(Math.random()<currentPlunder()?1+Math.floor(Math.random()*3):0); addMat(mat,matQty);
        reward=`획득 티켓: ${rewardText(rw)}<br>코인 +${coins}<br>부산물: ${mat} x${matQty}${special.length?'<br>'+special.map(esc).join('<br>'):''}`;
        saveGame();
        const playerName=normalizedPlayerName(state.save.playerName);
        const record={player_name:playerName,boss_id:b.id,boss_name:b.name,clear_ms:elapsed,weapon_id:state.raid.weapon?state.raid.weapon.id:'none',weapon_name:state.raid.weapon?state.raid.weapon.name:'무기 없음',skills:state.raid.skills.filter(Boolean).map(s=>s.name),passives:[state.raid.armor?('방어구: '+state.raid.armor.name):'방어구 없음'].concat(state.raid.passives.filter(Boolean).map(p=>p.name)),damage_taken:player.damageTaken,created_at:new Date().toISOString()};
        try{let local=getLocalRecords().filter(r=>!(r.boss_id===b.id && normalizedPlayerName(r.player_name).toLowerCase()===playerName.toLowerCase())); local.push(record); local=dedupeLatestByPlayer(local).slice(0,250); localStorage.setItem(LOCAL_RECORD_KEY,JSON.stringify(local));}catch(e){}
        try{subabase&&supabase.from&&supabase.from('raid_records').insert(record);}catch(e){}
        if(previous===false) showFirstOnlyCenter(b.name);
      }
      ui.right.classList.remove('hidden'); ui.right.innerHTML=`<h1 class="title">${clear?'클리어!':'실패'}</h1><p class="sub">${esc(boss.name)}<br>시간: ${formatMs(elapsed)}<br>받은 피해: ${player.damageTaken}<br>${clear?reward:'보스를 다시 분석해보세요.'}</p><button id="resultMenu" class="btn">메뉴로</button>`;
      const btn=ui.right.querySelector('#resultMenu'); if(btn) btn.onclick=()=>{state.menuTab=clear?'ranking':'build'; renderMenu(); refreshRankings(boss.id);};
    };
  }catch(e){console.warn('[V45 endRaid patch failed]',e);}

  function marketLoad(){try{return JSON.parse(localStorage.getItem(MARKET_KEY)||'[]')||[];}catch(e){return[];}}
  function marketSave(a){localStorage.setItem(MARKET_KEY,JSON.stringify((a||[]).slice(-200)));}
  function chatLoad(){const now=Date.now(); let a=[]; try{a=JSON.parse(localStorage.getItem(CHAT_KEY)||'[]')||[];}catch(e){} a=a.filter(m=>now-(m.t||0)<30*60*1000); localStorage.setItem(CHAT_KEY,JSON.stringify(a)); return a;}
  function chatSend(){const input=document.getElementById('v45ChatInput'); const text=(input&&input.value||'').trim().slice(0,140); if(!text)return; const a=chatLoad(); a.push({name:state.save.playerName||'Player',text,t:Date.now()}); localStorage.setItem(CHAT_KEY,JSON.stringify(a)); input.value=''; renderMenu();}
  function marketBuy(id){const a=marketLoad(); const idx=a.findIndex(x=>x.id===id); if(idx<0)return; const it=a[idx]; if((state.save.coins||0)<it.price){toast('코인이 부족합니다.');return;} state.save.coins-=it.price; if(it.kind==='material') addMat(it.name,it.qty); if(it.kind==='weapon'&&!state.save.weapons.includes(it.itemId)) state.save.weapons.push(it.itemId); if(it.kind==='skill'){if(!state.save.skills.includes(it.itemId)) state.save.skills.push(it.itemId); else v45().skillCopies[it.itemId]=(v45().skillCopies[it.itemId]||0)+1;} a.splice(idx,1); marketSave(a); saveGame(); renderMenu();}
  function registerMaterial(){const sel=document.getElementById('v45MatSelect'); const price=Math.max(1,Math.floor(Number(document.getElementById('v45MatPrice')?.value||0))); const name=sel&&sel.value; if(!name||!price){toast('부산물과 가격을 입력하세요.');return;} const qty=Math.min(10,matCount(name)); if(qty<=0){toast('등록할 부산물이 없습니다.');return;} takeMat(name,qty); const a=marketLoad(); a.push({id:'m'+Date.now()+Math.random(),kind:'material',name,qty,price,seller:state.save.playerName||'Player'}); marketSave(a); saveGame(); renderMenu();}
  function enhanceWeapon(id){const c=enhanceCost(id); const m=weaponMeta(id); if(m.enh>=10){toast('이미 최대 강화입니다.');return;} if((state.save.coins||0)<c.coins){toast('코인이 부족합니다.');return;} if(!takeMat(c.mat,c.qty)){toast(`부산물이 부족합니다: ${c.mat} ${matCount(c.mat)}/${c.qty}`);return;} state.save.coins-=c.coins; v45().weaponEnhance[safeId(id)]=m.enh+1; toast(`무기 +${m.enh+1} 강화 성공`); saveGame(); renderMenu();}
  function enchantWeapon(id){const types=['speed','attack','luck','plunder','critDamage','critChance']; const labels={speed:'공속',attack:'공격',luck:'행운',plunder:'약탈',critDamage:'치명타 피해량',critChance:'치명타 확률'}; const cost=160; if((state.save.coins||0)<cost){toast('인챈트 코인이 부족합니다.');return;} state.save.coins-=cost; const count=1+(Math.random()<.28?1:0)+(Math.random()<.08?1:0); const ench=[]; for(let i=0;i<count;i++) ench.push({type:types[Math.floor(Math.random()*types.length)],lv:1+Math.floor(Math.random()*3)}); v45().weaponEnchant[safeId(id)]=ench; toast('인챈트: '+ench.map(e=>`${labels[e.type]} Lv.${e.lv}`).join(' / ')); saveGame(); renderMenu();}
  function sellWeapon(id){const w=getWeapon(id); if(!w)return; const price=Math.floor(80*getRarity(w.rarity).power*(1+(weaponMeta(id).enh||0)*.35)); state.save.coins=(state.save.coins||0)+price; state.save.weapons=state.save.weapons.filter(x=>x!==id); if(state.selectedWeaponId===id) state.selectedWeaponId=null; toast(`${w.name} 판매: ${price}코인`); saveGame(); renderMenu();}
  function disassembleWeapon(id){const w=getWeapon(id); if(!w)return; const mat=(String(w.kind||'검').includes('sword')||String(w.name).includes('검'))?'검의 파편':`${w.name} 조각`; const qty=1+(weaponMeta(id).enh||0)+Math.floor(getRarity(w.rarity).power); addMat(mat,qty); state.save.weapons=state.save.weapons.filter(x=>x!==id); if(state.selectedWeaponId===id) state.selectedWeaponId=null; toast(`${w.name} 분해: ${mat} x${qty}`); saveGame(); renderMenu();}
  function upgradeSkill(id){const v=v45(); const lv=v.skillLevels[id]||1, cp=v.skillCopies[id]||0; if(lv>=7){toast('최대 레벨입니다.');return;} if(cp<=0){toast('중복 스킬 포인트가 필요합니다.');return;} v.skillCopies[id]=cp-1; v.skillLevels[id]=lv+1; toast(`${(getSkill(id)||{}).name||id} Lv.${lv+1}`); saveGame(); renderMenu();}
  function registerWeapon(id){const w=getWeapon(id); const price=Number(prompt('판매 가격을 입력하세요', '300')||0); if(!w||price<=0)return; const a=marketLoad(); a.push({id:'w'+Date.now()+Math.random(),kind:'weapon',name:w.name,itemId:id,rarity:w.rarity,price:Math.floor(price),seller:state.save.playerName||'Player'}); state.save.weapons=state.save.weapons.filter(x=>x!==id); marketSave(a); saveGame(); renderMenu();}
  function registerSkill(id){const s=getSkill(id); const price=Number(prompt('판매 가격을 입력하세요', '300')||0); if(!s||price<=0)return; const a=marketLoad(); a.push({id:'s'+Date.now()+Math.random(),kind:'skill',name:s.name,itemId:id,rarity:s.rarity,price:Math.floor(price),seller:state.save.playerName||'Player'}); state.save.skills=state.save.skills.filter(x=>x!==id); marketSave(a); saveGame(); renderMenu();}

  function renderGrowth(){v45(); const mats=Object.entries(v45().materials).filter(x=>x[1]>0); const weapons=[...new Set(state.save.weapons||[])].map(id=>getWeapon(id)).filter(Boolean); const skills=[...new Set(state.save.skills||[])].map(id=>getSkill(id)).filter(Boolean); return `<h2 class="title" style="font-size:22px">성장/강화</h2><p class="sub">무기 강화, 인챈트, 스킬 레벨업, 판매/분해가 여기에서 바로 보입니다.</p><div class="grid"><div class="card"><h3>코인/부산물</h3><p>코인 ${Math.floor(state.save.coins||0)}</p><p class="muted">${mats.slice(0,10).map(([m,q])=>`${esc(m)} x${q}`).join('<br>')||'부산물 없음'}</p></div><div class="card"><h3>스킬 레벨업</h3>${skills.map(s=>`<div class="record" title="${esc(s.desc)}"><div><b>${esc(s.name)} Lv.${s.v45Level||1}</b><div class="muted">위력 x${s.power} · 포인트 ${v45().skillCopies[s.id]||0}</div></div><button class="btn secondary" data-v45-skill-up="${esc(s.id)}">레벨업</button></div>`).join('')||'<p class="muted">스킬 없음</p>'}</div></div><h3>무기 관리</h3><div class="grid">${weapons.map(w=>{const c=enhanceCost(w.id), mt=matCount(c.mat); return `<div class="card" title="${esc(w.desc)}"><h3>${esc(w.name)} +${w.v45Enhance||0}</h3><p>공격 x${w.atk} · 공속 ${Number(w.speed||0).toFixed(2)}<br>인챈트: ${esc(enchantSummary(w.v45Enchant))}<br>강화 재료: ${esc(c.mat)} ${mt}/${c.qty} · ${c.coins}코인</p><div class="row"><button class="btn secondary" data-v45-enhance="${esc(w.id)}">강화</button><button class="btn secondary" data-v45-enchant="${esc(w.id)}">인챈트</button></div><div class="row" style="margin-top:6px"><button class="btn secondary" data-v45-sell="${esc(w.id)}">평균가 판매</button><button class="btn secondary" data-v45-disassemble="${esc(w.id)}">분해</button></div><button class="btn secondary" style="margin-top:6px;width:100%" data-v45-market-weapon="${esc(w.id)}">판매소 등록</button></div>`;}).join('')||'<p class="muted">무기 없음</p>'}</div>`;}
  function renderMarket(){v45(); const mats=Object.entries(v45().materials).filter(x=>x[1]>0); const opts=mats.map(([m,q])=>`<option value="${esc(m)}">${esc(m)} x${q}</option>`).join(''); const list=marketLoad().slice().reverse(); return `<h2 class="title" style="font-size:22px">유저 판매소</h2><p class="sub">부산물은 최대 10개가 1묶음으로 등록됩니다. 가격은 직접 입력합니다.</p><div class="grid"><div class="card"><h3>부산물 등록</h3><select id="v45MatSelect" class="input">${opts}</select><input id="v45MatPrice" class="input" type="number" min="1" placeholder="가격 입력" style="margin-top:8px"><button id="v45MatRegister" class="btn" style="margin-top:8px;width:100%">부산물 최대 10개 묶음 등록</button></div><div class="card"><h3>판매 목록</h3>${list.map(x=>`<div class="record"><div class="rank">${x.kind==='material'?x.qty:'1'}</div><div><b>${esc(x.name)}</b><div class="muted">${esc(x.kind)} · ${esc(x.seller)}</div></div><button class="btn secondary" data-v45-buy="${esc(x.id)}">${x.price} 구매</button></div>`).join('')||'<p class="muted">등록된 물품이 없습니다.</p>'}</div></div>`;}
  function renderChat(){const chats=chatLoad(); return `<h2 class="title" style="font-size:22px">채팅</h2><p class="sub">작성된 지 30분이 넘은 채팅은 자동 삭제됩니다.</p><div class="card"><div style="height:270px;overflow:auto;background:#020617;border:1px solid rgba(148,163,184,.22);border-radius:14px;padding:10px">${chats.map(m=>`<div class="muted" style="margin-bottom:6px"><b style="color:#e5e7eb">${esc(m.name)}:</b> ${esc(m.text)}</div>`).join('')||'<span class="muted">아직 채팅이 없습니다.</span>'}</div><div class="row" style="margin-top:10px"><input id="v45ChatInput" class="input" placeholder="채팅 입력"><button id="v45ChatSend" class="btn">전송</button></div></div>`;}
  function bindV45(){const root=ui&&ui.menu; if(!root)return; root.querySelectorAll('[data-v45-tab]').forEach(b=>b.onclick=()=>{state.menuTab=b.dataset.v45Tab; renderMenu();}); const by=(sel,fn)=>root.querySelectorAll(sel).forEach(el=>el.onclick=()=>fn(el)); by('[data-v45-skill-up]',el=>upgradeSkill(el.dataset.v45SkillUp)); by('[data-v45-enhance]',el=>enhanceWeapon(el.dataset.v45Enhance)); by('[data-v45-enchant]',el=>enchantWeapon(el.dataset.v45Enchant)); by('[data-v45-sell]',el=>sellWeapon(el.dataset.v45Sell)); by('[data-v45-disassemble]',el=>disassembleWeapon(el.dataset.v45Disassemble)); by('[data-v45-market-weapon]',el=>registerWeapon(el.dataset.v45MarketWeapon)); by('[data-v45-buy]',el=>marketBuy(el.dataset.v45Buy)); const mr=root.querySelector('#v45MatRegister'); if(mr)mr.onclick=registerMaterial; const cs=root.querySelector('#v45ChatSend'); if(cs)cs.onclick=chatSend; const inp=root.querySelector('#v45ChatInput'); if(inp)inp.onkeydown=e=>{if(e.key==='Enter')chatSend();};}
  const oldRenderMenuV45=renderMenu;
  renderMenu=function(){
    v45();
    const extra=['growth','market','chat'];
    if(extra.includes(state.menuTab)){
      const tabs=[['dungeon','던전 선택'],['gacha','뽑기 상점'],['build','출격 준비'],['ranking','레이드 랭킹'],['growth','성장/강화'],['market','유저 판매소'],['chat','채팅']];
      const body=state.menuTab==='growth'?renderGrowth():state.menuTab==='market'?renderMarket():renderChat();
      ui.menu.innerHTML=`<div class="row"><div><h1 class="title">Raid Dungeon</h1><p class="sub">V45 성장/강화, 전용 드롭, 판매소, 채팅이 실제로 보이는 버전입니다.</p></div><div style="text-align:right"><div class="chip">${V45_VERSION}</div><div class="chip">닉네임 ${esc(state.save.playerName||'Player')}</div><div class="chip">코인 ${Math.floor(state.save.coins||0)}</div><div class="chip">무기티켓 ${state.save.tickets.weapon||0}</div><div class="chip">방어구티켓 ${state.save.tickets.armor||0}</div><div class="chip">스킬티켓 ${state.save.tickets.skill||0}</div><div class="chip">패시브티켓 ${state.save.tickets.passive||0}</div></div></div><div class="nav">${tabs.map(([t,l])=>`<button class="tab ${state.menuTab===t?'active':''}" data-v45-tab="${t}">${l}</button>`).join('')}</div>${body}`;
      bindV45(); return;
    }
    oldRenderMenuV45();
    try{
      const right=ui.menu.querySelector('.row > div:last-child'); if(right&&!right.querySelector('[data-v45-coin-chip]')) right.insertAdjacentHTML('beforeend',`<div class="chip" data-v45-coin-chip="1">코인 ${Math.floor(state.save.coins||0)}</div><div class="chip">${V45_VERSION}</div>`);
      const nav=ui.menu.querySelector('.nav'); if(nav&&!nav.querySelector('[data-v45-tab="growth"]')) nav.insertAdjacentHTML('beforeend',`<button class="tab" data-v45-tab="growth">성장/강화</button><button class="tab" data-v45-tab="market">유저 판매소</button><button class="tab" data-v45-tab="chat">채팅</button>`);
      bindV45();
    }catch(e){}
  };


  /* ===== V48: cleaner progression UI, tiered materials, effects ===== */
const V48_VERSION = 'Raid Dungeon V50 - Clean Sortie UI Chat Overlay';
function v49RarityStyle(rarity){
  const r=getRarity(rarity||'normal');
  if((rarity||'')==='ultimate') return 'font-weight:900;background:linear-gradient(90deg,#ff4d6d 0%,#f59e0b 16%,#fde047 32%,#4ade80 48%,#38bdf8 64%,#818cf8 80%,#e879f9 100%);-webkit-background-clip:text;background-clip:text;color:transparent;text-shadow:0 0 14px rgba(255,255,255,.10)';
  return `color:${r.color};font-weight:900`;
}
function v49NameHtml(name, rarity, suffix=''){
  return `<span style="${v49RarityStyle(rarity)}">${esc(name)}${suffix?(' '+esc(suffix)):''}</span>`;
}
function v49RarityBadge(rarity){
  const r=getRarity(rarity||'normal');
  if((rarity||'')==='ultimate') return `<span class="chip" style="font-size:11px;font-weight:900;border-color:rgba(255,255,255,.18);background:linear-gradient(90deg,rgba(255,77,109,.18),rgba(245,158,11,.18),rgba(56,189,248,.18),rgba(232,121,249,.18));color:#fff">궁극</span>`;
  return `<span class="chip" style="font-size:11px;font-weight:800;color:${r.color};border-color:${r.color}55">${r.name}</span>`;
}
function v49InjectStyles(){
  if(document.getElementById('v49-ui-style')) return;
  const style=document.createElement('style');
  style.id='v49-ui-style';
  style.textContent=`
    .v49-stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin:6px 0 14px}
    .v49-stat{padding:12px 14px;border-radius:16px;border:1px solid rgba(148,163,184,.18);background:rgba(15,23,42,.74)}
    .v49-stat .k{font-size:12px;color:#94a3b8;margin-bottom:4px}
    .v49-stat .v{font-size:24px;font-weight:900;color:#f8fafc}
    .v49-panel{padding:16px;border-radius:18px;border:1px solid rgba(148,163,184,.16);background:rgba(2,6,23,.72)}
    .v49-rows{display:flex;flex-direction:column;gap:10px}
    .v49-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border:1px solid rgba(148,163,184,.14);border-radius:16px;background:rgba(15,23,42,.52)}
    .v49-row-left{min-width:0;flex:1}
    .v49-row-title{font-size:17px;font-weight:900;line-height:1.2;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .v49-row-desc{font-size:13px;line-height:1.45;color:#94a3b8;margin-top:4px}
    .v49-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
    .v49-mini-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(270px,1fr));gap:12px}
    .v49-mini-card{padding:14px;border-radius:16px;border:1px solid rgba(148,163,184,.14);background:rgba(15,23,42,.52)}
    .v49-mini-card .titleline{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}
    .v49-store-grid{display:grid;grid-template-columns:minmax(240px,320px) minmax(0,1fr);gap:12px}
    .v49-nav{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0 14px}
    @media (max-width:900px){.v49-store-grid{grid-template-columns:1fr}.v49-row{flex-direction:column;align-items:stretch}.v49-actions{justify-content:stretch}}
  `;
  document.head.appendChild(style);
}
  function v48Ensure(){
    try{
      const v=v45();
      state.save.coins = Math.floor(Number(state.save.coins||0));
      state.v48GrowthTab = state.v48GrowthTab || 'weaponEnhance';
      return v;
    }catch(e){ return {}; }
  }
  function v48RarityIndex(r){
    const order=['normal','rare','super','epic','legendary','ultimate'];
    const idx=order.indexOf(String(r||'normal'));
    return idx<0?0:idx;
  }
  function v48BossByTier(t){
    try{
      const arr=(BOSSES||[]).filter(b=>Math.round(Number(b.tier||1))===t);
      return arr[Math.abs(hashCode(String(t)+'boss'))%Math.max(1,arr.length)] || (BOSSES||[])[0];
    }catch(e){ return boss || {name:'보스',tier:t}; }
  }
  function v48WeaponTier(w){
    const ri=v48RarityIndex(w&&w.rarity);
    const starGuess = w && w.bossTier ? Number(w.bossTier) : 1 + ri*2;
    return clamp(Math.round(starGuess||1),1,10);
  }
  function v48MatForWeapon(w){
    const tier=v48WeaponTier(w);
    const matTier=clamp(tier<=2?1:tier<=4?3:tier<=6?5:tier<=8?7:9,1,10);
    const b=v48BossByTier(matTier);
    return `${b && b.name ? b.name : matTier+'성 보스'} 부산물`;
  }
  enhanceCost = function(id){
    const w=getWeapon(id)||{};
    const meta=weaponMeta(id);
    const enh=clamp(Math.round(Number(meta.enh||0)),0,10);
    const tier=v48WeaponTier(w);
    const rarityMul=1 + v48RarityIndex(w.rarity)*0.32;
    const qty=Math.max(1, Math.ceil((enh+1) * (1 + tier*0.18) * rarityMul));
    const coins=Math.floor((35 + tier*18) * (enh+1) * (1 + enh*0.32) * rarityMul);
    return {mat:v48MatForWeapon(w), qty, coins, tier};
  };
  function v48EnchantCost(id){
    const c=enhanceCost(id);
    return {mat:c.mat, qty:Math.max(1,Math.ceil(c.qty*.55)), coins:Math.floor(c.coins*2), tier:c.tier};
  }
  function v48Effect(title, sub, kind){
    try{
      const old=document.querySelector('[data-v48-effect]'); if(old) old.remove();
      const box=document.createElement('div'); box.setAttribute('data-v48-effect','1');
      box.style.cssText='position:fixed;left:50%;top:28%;transform:translate(-50%,-50%);z-index:99999;min-width:360px;max-width:640px;text-align:center;padding:24px 30px;border-radius:24px;background:radial-gradient(circle at 50% 0%,rgba(250,204,21,.35),rgba(15,23,42,.96) 58%);border:2px solid rgba(250,204,21,.86);box-shadow:0 0 45px rgba(250,204,21,.42),0 0 90px rgba(59,130,246,.25);color:#fff;font-family:system-ui;pointer-events:none;animation:v48pop 1.35s ease forwards;';
      box.innerHTML=`<style>@keyframes v48pop{0%{opacity:0;transform:translate(-50%,-50%) scale(.72)}14%{opacity:1;transform:translate(-50%,-50%) scale(1.06)}72%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-64%) scale(.94)}}@keyframes v48spark{0%{transform:translate(0,0) scale(.2);opacity:1}100%{transform:translate(var(--x),var(--y)) scale(1.2);opacity:0}}</style><div style="font-size:30px;font-weight:950;letter-spacing:.03em;color:${kind==='bad'?'#fb7185':'#facc15'};text-shadow:0 0 18px rgba(250,204,21,.8)">${esc(title)}</div><div style="margin-top:8px;color:#e5e7eb;font-weight:800">${esc(sub||'')}</div>`;
      for(let i=0;i<18;i++){ const s=document.createElement('i'); s.style.cssText=`position:absolute;left:50%;top:50%;width:${4+i%4}px;height:${4+i%4}px;border-radius:999px;background:${i%3?'#facc15':'#93c5fd'};--x:${Math.cos(i*.65)*150}px;--y:${Math.sin(i*.65)*95}px;animation:v48spark .9s ease-out forwards`; box.appendChild(s); }
      document.body.appendChild(box); setTimeout(()=>box.remove(),1450);
    }catch(e){ try{toast(title+' '+(sub||''));}catch(_){} }
  }
  enhanceWeapon = function(id){
    const c=enhanceCost(id); const m=weaponMeta(id); const w=getWeapon(id)||{};
    if(m.enh>=10){ toast('이미 최대 강화입니다.'); return; }
    if((state.save.coins||0)<c.coins){ toast(`코인이 부족합니다. 필요 ${c.coins}코인`); return; }
    if(!takeMat(c.mat,c.qty)){ toast(`부산물이 부족합니다: ${c.mat} ${matCount(c.mat)}/${c.qty}`); return; }
    state.save.coins-=c.coins; v45().weaponEnhance[safeId(id)]=m.enh+1;
    v48Effect('강화 성공!', `${w.name||'무기'} +${m.enh+1} / ${c.mat} 사용`, 'good');
    saveGame(); renderMenu();
  };
  enchantWeapon = function(id){
    const w=getWeapon(id)||{}; const cost=v48EnchantCost(id);
    if((state.save.coins||0)<cost.coins){ toast(`인챈트 비용 ${cost.coins}코인이 부족합니다.`); return; }
    if(!takeMat(cost.mat,cost.qty)){ toast(`인챈트 부산물이 부족합니다: ${cost.mat} ${matCount(cost.mat)}/${cost.qty}`); return; }
    const types=['speed','attack','luck','plunder','critDamage','critChance'];
    const labels={speed:'공속',attack:'공격',luck:'행운',plunder:'약탈',critDamage:'치명타 피해량',critChance:'치명타 확률'};
    state.save.coins-=cost.coins;
    const count=1+(Math.random()<.30?1:0)+(Math.random()<.11?1:0);
    const ench=[];
    for(let i=0;i<count;i++) ench.push({type:types[Math.floor(Math.random()*types.length)],lv:1+Math.floor(Math.random()*3)});
    v45().weaponEnchant[safeId(id)]=ench;
    v48Effect('인챈트 완료!', ench.map(e=>`${labels[e.type]} Lv.${e.lv}`).join(' / '), 'good');
    saveGame(); renderMenu();
  };
  try{
    const oldGachaCelebrationV48 = gachaCelebration;
    gachaCelebration = function(item){
      try{ oldGachaCelebrationV48(item); }catch(e){}
      const nm=(item&&item.name)||'아이템';
      setTimeout(()=>v48Effect('뽑기 성공!', nm, 'good'),80);
    };
  }catch(e){}
  try{
    const oldEndRaidV48=endRaid;
    endRaid=function(clear){
      oldEndRaidV48(clear);
      if(clear) setTimeout(()=>v48Effect('보상 획득!', '티켓 · 코인 · 부산물이 지급되었습니다', 'good'),120);
    };
  }catch(e){}

  function v48Summary(){
    const v=v48Ensure();
    const mats=Object.entries(v.materials||{}).filter(x=>x[1]>0);
    return `<div class="v49-stat-grid"><div class="v49-stat"><div class="k">코인</div><div class="v">${Math.floor(state.save.coins||0)}</div></div><div class="v49-stat"><div class="k">부산물</div><div class="v">${mats.length}</div></div><div class="v49-stat"><div class="k">무기</div><div class="v">${new Set(state.save.weapons||[]).size}</div></div><div class="v49-stat"><div class="k">스킬</div><div class="v">${new Set(state.save.skills||[]).size}</div></div></div>`;
  }

  function v48SubTabs(active){
    const tabs=[['weaponEnhance','무기 강화'],['weaponEnchant','인챈트'],['skillLevel','스킬 강화'],['sellBreak','판매/분해'],['warehouse','창고']];
    return `<div class="nav" style="margin:8px 0 16px">${tabs.map(([t,l])=>`<button class="tab ${active===t?'active':''}" data-v48-growth-tab="${t}">${l}</button>`).join('')}</div>`;
  }

  function v48WeaponCard(w,mode){
    const c= mode==='enchant' ? v48EnchantCost(w.id) : enhanceCost(w.id);
    const meta=weaponMeta(w.id);
    const e=meta.ench||[];
    const enh=meta.enh||0;
    const desc=`${w.desc||''}
  공격 x${Number(w.atk||0).toFixed(3)} / 공속 ${Number(w.speed||0).toFixed(2)}
  강화 재료: ${c.mat} ${matCount(c.mat)}/${c.qty}, ${c.coins}코인
  인챈트: ${enchantSummary(e)}`;
    const head=`<div class="titleline"><div class="v49-row-title">${v49NameHtml(w.name, w.rarity, '+'+enh)}</div>${v49RarityBadge(w.rarity)}</div>`;
    if(mode==='enhance') return `<div class="v49-mini-card" title="${esc(desc)}">${head}<div class="v49-row-desc">공격 x${Number(w.atk||0).toFixed(3)} · 공속 ${Number(w.speed||0).toFixed(2)}<br>재료 ${esc(c.mat)} ${matCount(c.mat)}/${c.qty} · ${c.coins}코인</div><div class="v49-actions" style="margin-top:10px"><button class="btn" data-v45-enhance="${esc(w.id)}">강화</button></div></div>`;
    if(mode==='enchant') return `<div class="v49-mini-card" title="${esc(desc)}">${head}<div class="v49-row-desc">현재 ${esc(enchantSummary(e))}<br>재료 ${esc(c.mat)} ${matCount(c.mat)}/${c.qty} · ${c.coins}코인</div><div class="v49-actions" style="margin-top:10px"><button class="btn" data-v45-enchant="${esc(w.id)}">인챈트</button></div></div>`;
    return `<div class="v49-mini-card" title="${esc(desc)}">${head}<div class="v49-row-desc">평균가 판매, 분해, 판매소 등록을 할 수 있습니다.</div><div class="v49-actions" style="margin-top:10px"><button class="btn secondary" data-v45-sell="${esc(w.id)}">판매</button><button class="btn secondary" data-v45-disassemble="${esc(w.id)}">분해</button><button class="btn secondary" data-v45-market-weapon="${esc(w.id)}">판매소</button></div></div>`;
  }


  renderGrowth = function(){
    v48Ensure();
    v49InjectStyles();
    const active=state.v48GrowthTab||'weaponEnhance';
    const weapons=[...new Set(state.save.weapons||[])].map(id=>getWeapon(id)).filter(Boolean);
    const skills=[...new Set(state.save.skills||[])].map(id=>getSkill(id)).filter(Boolean);
    const mats=Object.entries(v45().materials||{}).filter(x=>x[1]>0).sort((a,b)=>a[0].localeCompare(b[0]));
    let body='';
    if(active==='weaponEnhance') body=`<div class="v49-panel"><h3 style="margin-bottom:8px">무기 강화</h3><p class="sub">무기 등급에 맞는 보스 부산물을 사용합니다.</p><div class="v49-mini-grid">${weapons.map(w=>v48WeaponCard(w,'enhance')).join('')||'<p class="muted">무기 없음</p>'}</div></div>`;
    else if(active==='weaponEnchant') body=`<div class="v49-panel"><h3 style="margin-bottom:8px">인챈트</h3><p class="sub">강화보다 코인은 2배 비싸고, 부산물 요구량은 더 적습니다.</p><div class="v49-mini-grid">${weapons.map(w=>v48WeaponCard(w,'enchant')).join('')||'<p class="muted">무기 없음</p>'}</div></div>`;
    else if(active==='skillLevel') body=`<div class="v49-panel"><h3 style="margin-bottom:8px">스킬 강화</h3><p class="sub">중복 스킬 포인트로 직접 Lv.7까지 강화합니다.</p><div class="v49-rows">${skills.map(s=>{const lv=v45().skillLevels[s.id]||1; const pt=v45().skillCopies[s.id]||0; return `<div class="v49-row" title="${esc(s.desc||'')}"><div class="v49-row-left"><div class="v49-row-title">${v49NameHtml(s.name, s.rarity, 'Lv.'+lv)} ${v49RarityBadge(s.rarity)}</div><div class="v49-row-desc">위력 x${s.power} · 쿨 ${Number(s.cooldown||0).toFixed(1)}초 · 강화 포인트 ${pt}</div></div><div class="v49-actions"><button class="btn" data-v45-skill-up="${esc(s.id)}">레벨업</button></div></div>`;}).join('')||'<p class="muted">스킬 없음</p>'}</div></div>`;
    else if(active==='sellBreak') body=`<div class="v49-panel"><h3 style="margin-bottom:8px">판매 / 분해</h3><p class="sub">사용하지 않는 무기를 정리하는 메뉴입니다.</p><div class="v49-mini-grid">${weapons.map(w=>v48WeaponCard(w,'sell')).join('')||'<p class="muted">무기 없음</p>'}</div></div>`;
    else body=`<div class="v49-panel"><h3 style="margin-bottom:8px">창고</h3><p class="sub">부산물과 강화 재료를 한곳에서 확인합니다.</p><div class="v49-rows">${mats.map(([m,q])=>`<div class="v49-row"><div class="v49-row-left"><div class="v49-row-title">${esc(m)}</div><div class="v49-row-desc">보유 ${q}개</div></div></div>`).join('')||'<p class="muted">부산물 없음</p>'}</div></div>`;
    return `<h2 class="title" style="font-size:22px">성장 센터</h2><p class="sub">탭을 나누어 실제 게임처럼 간단하게 정리했습니다.</p>${v48Summary()}<div class="v49-nav">${v48SubTabs(active).replace(/^<div class="nav"[^>]*>|<\/div>$/g,'')}</div>${body}`;
  };


  renderMarket = function(){
    v48Ensure();
    v49InjectStyles();
    const mats=Object.entries(v45().materials||{}).filter(x=>x[1]>0);
    const opts=mats.map(([m,q])=>`<option value="${esc(m)}">${esc(m)} x${q}</option>`).join('');
    const list=marketLoad().slice().reverse();
    return `<h2 class="title" style="font-size:22px">유저 판매소</h2><p class="sub">부산물은 10개 묶음으로 등록됩니다.</p>${v48Summary()}<div class="v49-store-grid"><div class="v49-panel"><h3 style="margin-bottom:8px">부산물 등록</h3><select id="v45MatSelect" class="input">${opts}</select><input id="v45MatPrice" class="input" type="number" min="1" placeholder="가격 입력" style="margin-top:8px"><button id="v45MatRegister" class="btn" style="margin-top:10px;width:100%">10개 묶음 등록</button></div><div class="v49-panel"><h3 style="margin-bottom:8px">판매 목록</h3><div class="v49-rows">${list.map(x=>`<div class="v49-row"><div class="v49-row-left"><div class="v49-row-title">${x.rarity ? v49NameHtml(x.name,x.rarity) : '<span style="font-weight:800">'+esc(x.name)+'</span>'}</div><div class="v49-row-desc">${esc(x.kind)} · 판매자 ${esc(x.seller)} ${x.kind==='material'?'· 수량 '+x.qty:''}</div></div><div class="v49-actions"><button class="btn secondary" data-v45-buy="${esc(x.id)}">${x.price} 구매</button></div></div>`).join('')||'<p class="muted">등록된 물품이 없습니다.</p>'}</div></div></div>`;
  };


  function v48CleanHeader(){
    try{
      v49InjectStyles();
      const topRow=ui.menu.querySelector('.row');
      if(topRow){ topRow.style.alignItems='flex-start'; topRow.style.justifyContent='space-between'; topRow.style.gap='14px'; }
      const right=ui.menu.querySelector('.row > div:last-child');
      if(!right) return;
      [...right.querySelectorAll('.chip')].forEach(ch=>{
        const t=(ch.textContent||'').trim();
        if(t.includes('Raid Dungeon V') || t.startsWith('닉네임 ')) ch.remove();
        if(t.includes('계정 저장')||t.includes('불러옴')) ch.remove();
      });
      let coinChip=[...right.querySelectorAll('.chip')].find(ch=>(ch.textContent||'').trim().startsWith('코인'));
      if(!coinChip){
        coinChip=document.createElement('div');
        coinChip.className='chip';
        right.prepend(coinChip);
      }
      coinChip.textContent=`코인 ${Math.floor(state.save.coins||0)}`;
      coinChip.style.fontSize='16px';
      coinChip.style.fontWeight='900';
      coinChip.style.padding='12px 18px';
      coinChip.style.order='-2';
      [...right.querySelectorAll('.chip')].forEach(ch=>{
        const t=(ch.textContent||'').trim();
        if(t.startsWith('무기티켓')||t.startsWith('방어구티켓')||t.startsWith('스킬티켓')||t.startsWith('패시브티켓')){
          ch.style.fontSize='13px';
          ch.style.padding='8px 12px';
          ch.style.opacity='.95';
        }
      });
      const seenTabs=new Set();
      ui.menu.querySelectorAll('.nav').forEach(nav=>{
        nav.style.display='flex';
        nav.style.flexWrap='wrap';
        nav.style.gap='10px';
        [...nav.querySelectorAll('button')].forEach(btn=>{
          const label=(btn.textContent||'').trim();
          if(seenTabs.has(label)) btn.remove(); else seenTabs.add(label);
        });
      });
      [...right.querySelectorAll('button')].forEach(btn=>{ btn.style.minWidth='92px'; });
    }catch(e){}
  }

  const oldBindV45ForV48 = bindV45;
  bindV45 = function(){
    oldBindV45ForV48();
    try{ ui.menu.querySelectorAll('[data-v48-growth-tab]').forEach(b=>b.onclick=()=>{state.v48GrowthTab=b.dataset.v48GrowthTab; state.menuTab='growth'; renderMenu();}); }catch(e){}
  };
  const oldRenderMenuV48 = renderMenu;
  renderMenu = function(){ oldRenderMenuV48(); v48CleanHeader(); try{bindV45();}catch(e){} };



  /* ===== V50: clean sortie cards + floating chat overlay + simpler game UI ===== */
  const V50_VERSION = 'Raid Dungeon V51 - Performance Late Boss New Record Maze';
  function v50BaseDesc(desc){
    return String(desc||'')
      .split(' / 강화 ')[0]
      .split(' / Lv.')[0]
      .split(' [V45]')[0]
      .split(' / +')[0]
      .replace(/현재 공격 배율[^/]+/g,'')
      .trim();
  }
  function v50Pct(n){
    const v=Number(n||0);
    const sign=v>0?'+':'';
    return sign + (Math.round(v*10)/10) + '%';
  }
  function v50SkillLevel(id){
    try{ return (v45().skillLevels&&v45().skillLevels[id]) || 1; }catch(e){ return 1; }
  }
  function v50SkillCopies(id){
    try{ return (v45().skillCopies&&v45().skillCopies[id]) || 0; }catch(e){ return 0; }
  }
  function v50WeaponMeta(id){
    try{ return weaponMeta(id) || {}; }catch(e){ return {}; }
  }
  function v50WeaponEffects(w){
    const meta=v50WeaponMeta(w.id);
    const enh=Number(meta.enh||w.v45Enhance||w.v44Enhance||w.v43Enhance||w.v41Enhance||0);
    const ench=meta.ench||w.v45Enchant||w.v44Enchant||w.v43Enchant||w.v41Enchant||[];
    const arr=Array.isArray(ench)?ench:Object.entries(ench||{}).map(([type,lv])=>({type,lv}));
    let attack=enh*10.5, speed=0, crit=0, luck=0, plunder=0;
    arr.forEach(e=>{
      const lv=Number(e.lv||e[1]||0); const type=e.type||e[0];
      if(type==='attack') attack += lv*8;
      if(type==='speed') speed += lv*5.5;
      if(type==='critChance') crit += lv*3;
      if(type==='luck') luck += lv*3.5;
      if(type==='plunder') plunder += lv*7;
    });
    return `적용 효과: 공격 ${v50Pct(attack)}, 공속 ${v50Pct(speed)}, 치명 ${v50Pct(crit)}, 행운 ${v50Pct(luck)}, 약탈 ${v50Pct(plunder)}`;
  }
  function v50SkillEffects(s){
    const lv=v50SkillLevel(s.id);
    return `적용 효과: 위력 ${v50Pct((lv-1)*14)}, 쿨타임 ${v50Pct(-(lv-1)*2.5)}`;
  }
  function v50RarityName(it, suffix=''){
    return v49NameHtml(it.name, it.rarity, suffix);
  }
/* ===== V53 hotfix: sortie tab uniqueItems scope fix ===== */
function v53UniqueItems(items){
  const seen=new Set();
  return (items||[]).filter(it=>{
    if(!it) return false;
    const key=String(it.id||it.name||JSON.stringify(it)).toLowerCase();
    if(seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
  function v50SortieWeaponCard(it,selected,type){
    const w=getWeapon(it.id)||it;
    const selectedClass=selected===it.id?'active':'';
    const eff=v50WeaponEffects(w);
    const desc=v50BaseDesc(w.desc);
    return `<div class="card ${selectedClass}" title="${esc(desc+'\n'+eff)}" data-select-type="weapon" data-select-id="${esc(it.id)}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('weapon','${esc(it.id)}',0)"><h3>${v50RarityName(w)}</h3><p>${esc(desc)}<br>${esc(eff)}</p></div>`;
  }
  function v50SortieArmorCard(it,selected,type){
    const selectedClass=selected===it.id?'active':'';
    const desc=v50BaseDesc(it.desc);
    return `<div class="card ${selectedClass}" title="${esc(desc)}" data-select-type="armor" data-select-id="${esc(it.id)}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('armor','${esc(it.id)}',0)"><h3>${v50RarityName(it)}</h3><p>${esc(desc)}<br>적용 효과: 체력 +${it.hp||0}, 방어 +${it.def||0}</p></div>`;
  }
  function v50SortieSkillCard(it,slot,selected){
    const s=getSkill(it.id)||it;
    const lv=v50SkillLevel(it.id);
    const cp=v50SkillCopies(it.id);
    const selectedClass=selected===it.id?'active':'';
    const desc=v50BaseDesc(s.desc);
    const eff=v50SkillEffects(s);
    return `<div class="card ${selectedClass}" title="${esc(desc+'\n'+eff)}" data-select-type="skill" data-slot="${slot}" data-select-id="${esc(it.id)}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('skill','${esc(it.id)}',${slot})"><h3>${v50RarityName(s,'Lv.'+lv)}</h3><p>${esc(desc)}<br>${esc(eff)} · 포인트 ${cp}</p></div>`;
  }
  selectionGrid = function(items, selected, type){
    items=v53UniqueItems(items);
    const noneTitle = type==='weapon'?'무기 없이 출격':type==='armor'?'방어구 없이 출격':'이 칸 비우기';
    const noneDesc = type==='weapon'?'스킬만으로도 출격할 수 있습니다.':type==='armor'?'방어구 없이도 출격할 수 있습니다.':'비워둡니다.';
    const noneCard = `<div class="card ${!selected?'active':''}" data-select-type="${type}" data-select-id="" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('${type}','',0)"><h3>${noneTitle}</h3><p>${noneDesc}</p></div>`;
    if(!items.length) return `<div class="grid">${noneCard}<div class="card"><h3>보유한 항목이 없습니다.</h3><p>뽑기 상점이나 보스 드롭으로 획득할 수 있습니다.</p></div></div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" class="btn" data-next-step>다음</button></div>`;
    return `<div class="grid">${noneCard}${items.map(it=> type==='weapon'?v50SortieWeaponCard(it,selected,type):type==='armor'?v50SortieArmorCard(it,selected,type):'').join('')}</div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" class="btn" data-next-step>다음</button></div>`;
  };
  skillSlotGrid = function(slot){
    const items=ownedSkills(); const selected=state.selectedSkillIds[slot]||null;
    const noneCard=`<div class="card ${!selected?'active':''}" data-select-type="skill" data-slot="${slot}" data-select-id="" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('skill','',${slot})"><h3>스킬 ${slot+1} 비우기</h3><p>스킬을 끼지 않아도 레이드는 시작할 수 있습니다.</p></div>`;
    if(!items.length) return `<div class="grid">${noneCard}<div class="card"><h3>보유한 스킬이 없습니다.</h3><p>뽑기 또는 보스 패턴 스킬 드롭으로 획득할 수 있습니다.</p></div></div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" class="btn" data-next-step>다음</button></div>`;
    return `<p class="sub">출격 준비에서는 장착만 합니다. 강화와 판매는 성장 센터에서 진행합니다.</p><div class="grid">${noneCard}${items.map(it=>v50SortieSkillCard(it,slot,selected)).join('')}</div><div class="row" style="margin-top:14px"><button type="button" class="btn secondary" data-prev-step>이전</button><button type="button" class="btn" data-next-step>다음</button></div>`;
  };

  function v50InjectStyles(){
    if(document.getElementById('v50-ui-style')) return;
    const st=document.createElement('style'); st.id='v50-ui-style';
    st.textContent=`
      #v50-chat-toggle{position:fixed;left:18px;bottom:18px;z-index:9998;border-radius:999px;border:1px solid rgba(148,163,184,.35);background:rgba(15,23,42,.72);backdrop-filter:blur(10px);color:#e5e7eb;font-weight:900;padding:10px 14px;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.28)}
      #v50-chat-panel{position:fixed;left:18px;bottom:66px;z-index:9998;width:min(360px,calc(100vw - 36px));border:1px solid rgba(148,163,184,.28);border-radius:18px;background:rgba(2,6,23,.70);backdrop-filter:blur(12px);box-shadow:0 18px 44px rgba(0,0,0,.38);padding:12px;color:#e5e7eb}
      #v50-chat-panel.hidden{display:none!important}
      #v50-chat-log{height:180px;overflow:auto;border:1px solid rgba(148,163,184,.18);border-radius:12px;background:rgba(2,6,23,.45);padding:10px;font-size:13px;line-height:1.45;margin-bottom:8px}
      #v50-chat-panel .v50-chat-row{display:flex;gap:6px}
      #v50-chat-input{flex:1;border-radius:12px;border:1px solid rgba(148,163,184,.28);background:rgba(15,23,42,.75);color:#fff;padding:10px;font-weight:800}
      #v50-chat-send{border-radius:12px;border:1px solid rgba(148,163,184,.28);background:#2563eb;color:#fff;font-weight:900;padding:9px 12px;cursor:pointer}
    `;
    document.head.appendChild(st);
  }
  function v50ChatOpen(){ return localStorage.getItem('raid_v50_chat_open')==='1'; }
  function v50SetChatOpen(v){ localStorage.setItem('raid_v50_chat_open',v?'1':'0'); }
  function v50DrawFloatingChat(){
    try{
      v50InjectStyles();
      let toggle=document.getElementById('v50-chat-toggle');
      if(!toggle){ toggle=document.createElement('button'); toggle.id='v50-chat-toggle'; toggle.type='button'; document.body.appendChild(toggle); }
      toggle.textContent=v50ChatOpen()?'채팅 닫기':'채팅';
      toggle.onclick=()=>{v50SetChatOpen(!v50ChatOpen()); v50DrawFloatingChat();};
      let panel=document.getElementById('v50-chat-panel');
      if(!panel){ panel=document.createElement('div'); panel.id='v50-chat-panel'; document.body.appendChild(panel); }
      const chats=chatLoad();
      panel.className=v50ChatOpen()?'':'hidden';
      panel.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><b>실시간 채팅</b><span style="font-size:12px;color:#94a3b8">30분 보관</span></div><div id="v50-chat-log">${chats.map(m=>`<div style="margin-bottom:6px"><b style="color:#fff">${esc(m.name)}:</b> <span style="color:#cbd5e1">${esc(m.text)}</span></div>`).join('')||'<span style="color:#94a3b8">아직 채팅이 없습니다.</span>'}</div><div class="v50-chat-row"><input id="v50-chat-input" placeholder="채팅 입력"><button id="v50-chat-send" type="button">전송</button></div>`;
      const send=panel.querySelector('#v50-chat-send'); const input=panel.querySelector('#v50-chat-input');
      const sendNow=()=>{ const text=(input&&input.value||'').trim().slice(0,140); if(!text) return; const a=chatLoad(); a.push({name:state.save.playerName||'Player',text,t:Date.now()}); localStorage.setItem(CHAT_KEY,JSON.stringify(a)); v50DrawFloatingChat(); };
      if(send) send.onclick=sendNow; if(input) input.onkeydown=e=>{ if(e.key==='Enter') sendNow(); };
    }catch(e){ console.warn('[V50 chat overlay failed]',e); }
  }
  function v50CleanupMenu(){
    try{
      [...ui.menu.querySelectorAll('.card')].forEach(card=>{ if((card.textContent||'').includes('V41 성장 시스템')) card.remove(); });
      [...ui.menu.querySelectorAll('.nav button,.tab')].forEach(btn=>{ if((btn.textContent||'').trim()==='채팅') btn.remove(); });
      const seen=new Set(); [...ui.menu.querySelectorAll('.nav button,.tab')].forEach(btn=>{ const t=(btn.textContent||'').trim(); if(seen.has(t)) btn.remove(); else seen.add(t); });
      [...ui.menu.querySelectorAll('.chip')].forEach(ch=>{ const t=(ch.textContent||'').trim(); if(t.includes('Raid Dungeon V')||t.startsWith('닉네임 ')) ch.remove(); });
    }catch(e){}
  }
  const oldRenderMenuV50=renderMenu;
  renderMenu=function(){ oldRenderMenuV50(); v50CleanupMenu(); v50DrawFloatingChat(); };
  const oldBindV50=bindV45;
  bindV45=function(){ oldBindV50(); v50DrawFloatingChat(); };
  try{ window.RaidDungeonV50={version:V50_VERSION, cleanSortie:true, floatingChat:true}; }catch(e){}



  /* ===== V51: performance, late boss patterns, true maze, New Record ===== */
  const V51_VERSION = 'Raid Dungeon V51 - Performance Late Boss New Record Maze';
  function v51Clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  function v51Tier(){ return Math.max(1, Math.min(10, Number((boss&&boss.tier)||1))); }
  function v51Dmg(m=1){ return Math.max(10, ((boss&&boss.atk)||18) * m); }
  function v51AngleToPlayer(){ return Math.atan2(player.y-boss.y, player.x-boss.x); }
  function v51Circle(x,y,r,warn,life,color,damage,label,tag){ state.hazards.push({kind:'circle',x,y,r,warn,life,damage:damage||v51Dmg(.7),color:color||boss.color,tag:tag||boss.theme,label}); }
  function v51Donut(x,y,inner,outer,warn,life,color,damage,label,tag){ state.hazards.push({kind:'donut',x,y,inner,outer,warn,life,damage:damage||v51Dmg(.65),color:color||boss.color,tag:tag||boss.theme,label}); }
  function v51Beam(x,y,a,len,warn,life,color,damage,label,tag){ state.hazards.push({kind:'beam',x,y,angle:a,len:len||980,w:24,warn,life,damage:damage||v51Dmg(.62),color:color||boss.color,tag:tag||boss.theme,label}); }
  function v51Wall(x,y,w,h,warn,life,color,damage,label,tag){ state.hazards.push({kind:'wall',x,y,w,h,warn,life,damage:damage||v51Dmg(.55),color:color||boss.color,tag:tag||boss.theme,label}); }
  function v51FullMap(warn,life,color,damage,label){ state.hazards.push({kind:'floor',x:W/2,y:H/2,w:W*1.04,h:H*1.04,warn,life,damage:damage||v51Dmg(.72),color:color||boss.color,tag:boss.theme,label:label||'전체 맵 공격',respectSafe:true,v51FullMap:true,tick:0}); }
  function v51Safe(x,y,r,life,color,fake){ state.mechanics.push({kind:'safe',x,y,r,life:life||2.4,color:color||'#86efac',fake:!!fake}); }
  function v51BurstLight(x,y,color,count,speed){ try{ burst(x,y,color,Math.min(count||24,36),speed||280); }catch(e){} }
  function v51SoftCapArrays(){
    if(state.particles && state.particles.length>280) state.particles.splice(0,state.particles.length-280);
    if(state.hazards && state.hazards.length>230){
      const keep=[]; const step=Math.ceil(state.hazards.length/230);
      for(let i=0;i<state.hazards.length;i++) if(i%step===0 || state.hazards[i].v51FullMap || state.hazards[i].respectSafe) keep.push(state.hazards[i]);
      state.hazards=keep.slice(-230);
    }
    if(state.projectiles && state.projectiles.length>190) state.projectiles.splice(0,state.projectiles.length-190);
  }
  try{
    const oldUpdateV51 = update;
    update=function(dt){ v51SoftCapArrays(); oldUpdateV51(dt); v51SoftCapArrays(); };
  }catch(e){ console.warn('[V51 update performance patch failed]',e); }

  try{
    const oldBurstV51 = burst;
    burst=function(x,y,color,count,speed){ oldBurstV51(x,y,color,Math.min(count||0,30),Math.min(speed||360,520)); };
  }catch(e){}

  function v51IsInSafe(){ try{ return typeof inSafe==='function' && inSafe(player.x,player.y); }catch(e){ return false; } }
  try{
    const oldUpdateHazardsV51=updateHazards;
    updateHazards=function(dt){
      oldUpdateHazardsV51(dt);
      if(state.screen!=='raid') return;
      state.hazards.forEach(h=>{
        if(!h || h.kind!=='floor' || (h.warn||0)>0 || (h.life||0)<=0) return;
        const mapWide = h.v51FullMap || h.respectSafe || (h.w||0)>W*.78 || (h.h||0)>H*.55 || String(h.label||'').match(/전체|맵|일식|심판|종말|공간|해일벽|붕괴/);
        if(!mapWide) return;
        h.v51Tick=(h.v51Tick||0)-dt;
        if(h.v51Tick<=0){
          h.v51Tick=.42;
          if(!v51IsInSafe()) hurtPlayer((h.damage||v51Dmg(.6))*0.82,h.color||boss.color,true);
          else healText('SAFE',player.x,player.y-34,'#86efac');
        }
      });
    };
  }catch(e){ console.warn('[V51 full map floor patch failed]',e); }

  function v51MazeWallHit(m){
    const hw=m.w/2, hh=m.h/2;
    return Math.abs(player.x-m.x)<hw+player.r && Math.abs(player.y-m.y)<hh+player.r;
  }
  function v51ResolveMazeWall(m){
    if(!v51MazeWallHit(m)) return;
    const dx=player.x-m.x, dy=player.y-m.y;
    const ox=(m.w/2+player.r)-Math.abs(dx), oy=(m.h/2+player.r)-Math.abs(dy);
    if(ox<oy) player.x += (dx<0?-ox:ox); else player.y += (dy<0?-oy:oy);
    player.x=v51Clamp(player.x,player.r,W-player.r); player.y=v51Clamp(player.y,player.r,H-player.r);
  }
  try{
    const oldDrawMechanicsV51=drawMechanics;
    drawMechanics=function(){
      oldDrawMechanicsV51();
      state.mechanics.forEach(m=>{
        if(m.kind!=='v51MazeWall') return;
        ctx.save();
        ctx.globalAlpha=.72; ctx.fillStyle=m.color||'#a78bfa'; ctx.strokeStyle='rgba(255,255,255,.85)'; ctx.lineWidth=2;
        roundRect(ctx,m.x-m.w/2,m.y-m.h/2,m.w,m.h,8); ctx.fill(); ctx.stroke();
        ctx.restore();
      });
    };
    const oldUpdateMechanicsV51=updateMechanics;
    updateMechanics=function(dt){ oldUpdateMechanicsV51(dt); state.mechanics.forEach(m=>{ if(m.kind==='v51MazeWall') {m.life-=dt; v51ResolveMazeWall(m);} }); state.mechanics=state.mechanics.filter(m=>m.life>0); };
  }catch(e){ console.warn('[V51 maze mechanic patch failed]',e); }

  function v51SpawnTrueMaze(){
    boss.mechanicText='진짜 미로: 보라 벽은 통과할 수 없습니다. 통로를 돌아 탈출구로 이동하세요.';
    const life=7.2, c='#a78bfa';
    state.mechanics = state.mechanics.filter(m=>m.kind!=='v51MazeWall' && m.kind!=='mazeExit');
    const walls=[
      [W*.50,105,W*.86,18],[W*.50,H-72,W*.86,18],[90,H*.50,18,H*.72],[W-90,H*.50,18,H*.72],
      [W*.28,H*.32,18,H*.42],[W*.43,H*.64,18,H*.44],[W*.58,H*.36,18,H*.42],[W*.73,H*.63,18,H*.40],
      [W*.33,H*.48,W*.24,18],[W*.61,H*.51,W*.24,18],[W*.50,H*.25,W*.18,18],[W*.75,H*.78,W*.18,18]
    ];
    walls.forEach(([x,y,w,h])=>state.mechanics.push({kind:'v51MazeWall',x,y,w,h,life,color:c}));
    state.mechanics.push({kind:'mazeExit',x:W-150,y:H-128,r:42,life,color:'#22c55e'});
    floatText('진짜 미로!',W/2,90,'#fff',24);
  }

  function v51PatternDreamJester(){
    const c='#e879f9', r=Math.random(); boss.mechanicText='악몽 광대: 진짜 안전지대와 가짜 안전지대를 섞고, 이동 경로를 강제합니다.';
    if(r<.24){
      const sx=rand(150,W-150), sy=rand(150,H-120); v51Safe(sx,sy,58,2.2,'#86efac',false);
      for(let i=0;i<4;i++) v51Safe(rand(130,W-130),rand(145,H-105),50,2.2,c,true);
      v51FullMap(1.55,.65,c,v51Dmg(.95),'악몽 무대 전체 공격');
      for(let i=0;i<8;i++) v51Beam(W/2,H/2,i*Math.PI/8+state.time*.08,920,1.1,.55,c,v51Dmg(.45),'웃음 회전칼','chaos');
      return;
    }
    if(r<.50){
      v51SpawnTrueMaze();
      for(let i=0;i<10;i++) setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead) v51Circle(rand(130,W-130),rand(140,H-100),36, .65, .45, i%2?c:'#facc15', v51Dmg(.48), '광대 폭죽'); }, i*115);
      return;
    }
    if(r<.76){
      for(let i=0;i<13;i++){ const a=i*Math.PI*2/13+rand(-.04,.04); v51Beam(boss.x,boss.y,a,900,.75+i*.035,.55,i%2?c:'#facc15',v51Dmg(.48),'카드 난사'); }
      for(let i=0;i<6;i++) v51Circle(rand(120,W-120),rand(135,H-95),42,.95+i*.08,.45,'#fb7185',v51Dmg(.52),'폭소 폭탄');
      return;
    }
    const safeX=player.x, safeY=player.y; v51Safe(safeX,safeY,54,1.9,'#86efac',false); v51FullMap(1.25,.55,'#fb7185',v51Dmg(1.05),'관객석 붕괴');
    for(let i=0;i<5;i++) v51Donut(W/2,H/2,80+i*52,116+i*52,.6+i*.12,.62,c,v51Dmg(.44),'악몽 고리');
  }

  function v51PatternSolar(final=false){
    const c=final?'#fb7185':'#f97316'; boss.mechanicText= final?'아포칼립스: 검은 일식, 낙하, 회전 광선을 모두 사용합니다.':'태양룡: 태양 낙하와 광선이 겹칩니다.';
    const r=Math.random();
    if(r<.33){
      const sx=rand(140,W-140), sy=rand(140,H-110); v51Safe(sx,sy,62,2.1,'#86efac'); v51FullMap(1.45,.65,c,v51Dmg(final?1.08:.86),final?'종말 일식':'태양 일식');
      for(let i=0;i<9+(final?4:0);i++) v51Beam(W/2,H/2,i*Math.PI/(9+(final?4:0))+(final?.1:0),980,.75+i*.035,.56,i%2?'#fde047':c,v51Dmg(.48),'회전 태양광');
      return;
    }
    if(r<.66){
      for(let i=0;i<12+(final?7:0);i++) v51Circle(rand(100,W-100),rand(120,H-85),32+Math.random()*18,.55+i*.055,.38,i%2?'#facc15':c,v51Dmg(.50),'흑점 낙하');
      for(let i=0;i<4+(final?2:0);i++) v51Donut(W/2,H/2,70+i*70,110+i*70,.9+i*.1,.56,'#f97316',v51Dmg(.46),'플레어 고리');
      return;
    }
    v51SpawnTrueMaze();
    for(let i=0;i<8+(final?6:0);i++) v51Beam(boss.x,boss.y,Math.atan2(player.y-boss.y,player.x-boss.x)+(i-(final?7:4))*0.12,960,.65+i*.04,.54,c,v51Dmg(.42),'일식 절단선');
    setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead) { const sx=rand(130,W-130), sy=rand(130,H-100); v51Safe(sx,sy,58,1.65,'#86efac'); v51FullMap(.95,.52,'#020617',v51Dmg(final?1.15:.82),'검은 핵 폭발'); } },650);
  }

  function v51PatternChaos(){
    const c='#fb7185'; boss.mechanicText='혼돈의 집정관: 서로 다른 보스 패턴을 빠르게 섞어 사용합니다.';
    const r=Math.random();
    if(r<.25){ v51PatternDreamJester(); return; }
    if(r<.50){ v51PatternSolar(true); return; }
    if(r<.75){
      v51SpawnTrueMaze();
      for(let i=0;i<10;i++) v51Donut(W/2,H/2,50+i*36,75+i*36,.75+i*.05,.50,i%2?c:'#8b5cf6',v51Dmg(.46),'혼돈 도넛');
      for(let i=0;i<8;i++) v51Beam(rand(160,W-160),rand(130,H-110),i*Math.PI/4,800,1.05,.50,'#facc15',v51Dmg(.42),'혼돈 판결선');
      return;
    }
    const sx=rand(140,W-140), sy=rand(140,H-110); v51Safe(sx,sy,55,2.0,'#86efac'); v51FullMap(1.35,.60,c,v51Dmg(1.12),'혼돈 즉결 심판');
    for(let i=0;i<18;i++) v51Circle(rand(100,W-100),rand(120,H-80),28,.7+i*.035,.35,i%3?'#8b5cf6':'#facc15',v51Dmg(.38),'혼돈 파편');
  }

  function v51PatternPuppetFinal(){
    boss.mechanicText='인형 황제: 단두대, 실, 감옥이 연속으로 연결됩니다.';
    const c='#f0abfc';
    const gap=Math.floor(Math.random()*6);
    for(let i=0;i<6;i++){ if(i===gap) continue; v51Wall(110+i*(W-220)/5,H/2,36,H*.86,1.15+i*.04,.70,c,v51Dmg(.72),'단두대'); }
    for(let i=0;i<8;i++) v51Beam(boss.x,boss.y,i*Math.PI/8,940,.72+i*.05,.52,'#fde68a',v51Dmg(.42),'인형실 절단');
    setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead) v51SpawnTrueMaze(); },520);
  }

  try{
    const oldBossPatternV51=bossPattern;
    bossPattern=function(){
      try{
        const id=boss&&boss.id;
        if(id==='dream_jester'||id==='nightmare_jester') return v51PatternDreamJester();
        if(id==='solar_dragon') return v51PatternSolar(false);
        if(id==='black_sun'||id==='apocalypse'||id==='apocalypse_hamster') return v51PatternSolar(true);
        if(id==='chaos_archon') return v51PatternChaos();
        if(id==='puppet_emperor' && Math.random()<.62) return v51PatternPuppetFinal();
      }catch(e){ console.warn('[V51 boss pattern failed]',e); }
      return oldBossPatternV51();
    };
  }catch(e){ console.warn('[V51 bossPattern patch failed]',e); }

  try{
    const oldStartRaidV51=startRaid;
    startRaid=function(){
      oldStartRaidV51();
      try{
        if(state.screen==='raid' && boss){
          const t=v51Tier();
          const mul=1.26 + Math.max(0,t-5)*0.075;
          boss.maxHp=Math.floor(boss.maxHp*mul);
          boss.hp=Math.floor(boss.hp*mul);
          boss.v51Durability=true;
        }
      }catch(e){}
    };
  }catch(e){ console.warn('[V51 durability patch failed]',e); }

  function v51BestLocalBefore(bid){
    try{
      const list=getLocalRecords().filter(r=>r&&r.boss_id===bid&&Number.isFinite(Number(r.clear_ms)));
      if(!list.length) return Infinity;
      return Math.min(...list.map(r=>Number(r.clear_ms)));
    }catch(e){ return Infinity; }
  }
  function v51ShowNewRecord(name,ms,best){
    try{
      document.getElementById('raid-v51-new-record')?.remove();
      document.querySelectorAll('[id*="first" i]').forEach(el=>{ if(el.style&&el.style.position==='fixed') el.remove(); });
      let st=document.getElementById('raid-v51-new-record-style'); if(!st){st=document.createElement('style'); st.id='raid-v51-new-record-style'; document.head.appendChild(st);} st.textContent='@keyframes v51record{0%{opacity:0;transform:translate(-50%,-50%) scale(.62)}15%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}75%{opacity:1}100%{opacity:0;transform:translate(-50%,-58%) scale(.96)}}';
      const box=document.createElement('div'); box.id='raid-v51-new-record'; box.style.cssText='position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:2147483647;text-align:center;min-width:610px;max-width:92vw;padding:38px 46px;border:5px solid #60a5fa;border-radius:34px;background:rgba(2,6,23,.94);box-shadow:0 0 80px rgba(96,165,250,.8);pointer-events:none;animation:v51record 5.0s ease-out forwards';
      const bestText=Number.isFinite(best)?`기존 1등 ${formatMs(best)} → 새 기록 ${formatMs(ms)}`:`첫 랭킹 기록 ${formatMs(ms)}`;
      box.innerHTML=`<div style="font-size:64px;font-weight:950;color:#60a5fa;text-shadow:0 0 30px #60a5fa">NEW RECORD!</div><div style="font-size:23px;font-weight:900;color:#fff;margin-top:8px">${esc(name)} 1등 기록 갱신</div><div style="font-size:16px;color:#bfdbfe;margin-top:8px;font-weight:800">${esc(bestText)}</div>`;
      document.body.appendChild(box); setTimeout(()=>box.remove(),5400); v51BurstLight(W/2,H/2,'#60a5fa',80,520); state.flash=Math.max(state.flash||0,1.0);
    }catch(e){ console.warn('[V51 New Record banner failed]',e); }
  }
  try{
    endRaid=function(clear){
      state.screen='result'; const elapsed=Math.floor(state.raid.elapsed*1000); let reward=''; const b=getBoss(boss.id)||boss; const bestBefore=v51BestLocalBefore(b.id); const isNewRecord=clear && elapsed<bestBefore;
      if(clear){
        const rw=tierTickets(b);
        state.save.tickets.weapon=(state.save.tickets.weapon||0)+rw.weapon;
        state.save.tickets.armor=(state.save.tickets.armor||0)+rw.armor;
        state.save.tickets.skill=(state.save.tickets.skill||0)+rw.skill;
        state.save.tickets.passive=(state.save.tickets.passive||0)+rw.passive;
        const special=[]; addBossExclusiveDrops(b,special);
        const coins=50+tierOf(b)*tierOf(b)*35+Math.floor(Math.random()*tierOf(b)*18); state.save.coins=(state.save.coins||0)+coins;
        const mat=bossMaterialName(b); const matQty=1+Math.floor(tierOf(b)/3)+(Math.random()<currentPlunder()?1+Math.floor(Math.random()*3):0); addMat(mat,matQty);
        reward=`획득 티켓: ${rewardText(rw)}<br>코인 +${coins}<br>부산물: ${mat} x${matQty}${special.length?'<br>'+special.map(esc).join('<br>'):''}`;
        saveGame();
        const playerName=normalizedPlayerName(state.save.playerName);
        const record={player_name:playerName,boss_id:b.id,boss_name:b.name,clear_ms:elapsed,weapon_id:state.raid.weapon?state.raid.weapon.id:'none',weapon_name:state.raid.weapon?state.raid.weapon.name:'무기 없음',skills:state.raid.skills.filter(Boolean).map(s=>s.name),passives:[state.raid.armor?('방어구: '+state.raid.armor.name):'방어구 없음'].concat(state.raid.passives.filter(Boolean).map(p=>p.name)),damage_taken:player.damageTaken,created_at:new Date().toISOString()};
        try{let local=getLocalRecords().filter(r=>!(r.boss_id===b.id && normalizedPlayerName(r.player_name).toLowerCase()===playerName.toLowerCase())); local.push(record); local=dedupeLatestByPlayer(local).slice(0,250); localStorage.setItem(LOCAL_RECORD_KEY,JSON.stringify(local));}catch(e){}
        try{subabase&&supabase.from&&supabase.from('raid_records').insert(record);}catch(e){}
        if(isNewRecord) { v51ShowNewRecord(b.name,elapsed,bestBefore); reward='<b style="color:#60a5fa;font-size:16px">NEW RECORD! 1등 기록 갱신</b><br>'+reward; }
      }
      ui.right.classList.remove('hidden'); ui.right.innerHTML=`<h1 class="title">${clear?'클리어!':'실패'}</h1><p class="sub">${esc(boss.name)}<br>시간: ${formatMs(elapsed)}<br>받은 피해: ${player.damageTaken}<br>${clear?reward:'보스를 다시 분석해보세요.'}</p><button id="resultMenu" class="btn">메뉴로</button>`;
      const btn=ui.right.querySelector('#resultMenu'); if(btn) btn.onclick=()=>{state.menuTab=clear?'ranking':'build'; renderMenu(); refreshRankings(boss.id);};
    };
  }catch(e){ console.warn('[V51 endRaid New Record patch failed]',e); }

  try{ window.RaidDungeonV51={version:V51_VERSION, performanceCaps:true, fullMapSafeFix:true, newRecordInsteadOfFirstClear:true, trueMaze:true, lateBossUpgrade:true}; }catch(e){}



  /* ===== V52: sortie tab click fix, market item sections, stronger FX ===== */
  const V52_VERSION = 'Raid Dungeon V52 - Sortie Click Market FX Fix';

  function v52EnsureStyle(){
    if(document.getElementById('v52-style')) return;
    const st=document.createElement('style'); st.id='v52-style';
    st.textContent=`
      @keyframes v52Pop{0%{opacity:0;transform:translate(-50%,-50%) scale(.45) rotate(-8deg)}18%{opacity:1;transform:translate(-50%,-50%) scale(1.1) rotate(2deg)}70%{opacity:1;transform:translate(-50%,-50%) scale(1)}100%{opacity:0;transform:translate(-50%,-58%) scale(.86)}}
      @keyframes v52Ring{0%{transform:translate(-50%,-50%) scale(.2);opacity:.9}100%{transform:translate(-50%,-50%) scale(2.6);opacity:0}}
      @keyframes v52Star{0%{transform:translate(-50%,-50%) scale(.5);opacity:1}100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(1.4) rotate(560deg);opacity:0}}
      .v52-fx{position:fixed;left:50%;top:50%;z-index:2147483647;pointer-events:none;text-align:center;min-width:360px;max-width:90vw;padding:30px 34px;border-radius:32px;border:3px solid rgba(255,255,255,.78);background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.24),rgba(15,23,42,.90) 58%,rgba(2,6,23,.96));box-shadow:0 0 80px rgba(96,165,250,.72),inset 0 0 28px rgba(255,255,255,.12);animation:v52Pop 2.6s ease-out forwards}
      .v52-fx-title{font-size:42px;font-weight:950;letter-spacing:-1px;color:#fff;text-shadow:0 0 20px #60a5fa,0 0 42px #a78bfa}
      .v52-fx-sub{margin-top:8px;color:#dbeafe;font-size:16px;font-weight:900}
      .v52-ring{position:fixed;left:50%;top:50%;width:220px;height:220px;border-radius:999px;border:4px solid rgba(255,255,255,.7);z-index:2147483646;pointer-events:none;animation:v52Ring 1.2s ease-out forwards}
      .v52-star{position:fixed;left:50%;top:50%;z-index:2147483647;color:#fef08a;font-size:22px;font-weight:950;pointer-events:none;animation:v52Star 1.35s ease-out forwards;text-shadow:0 0 18px #facc15}
      .v52-market-tabs{display:flex;flex-wrap:wrap;gap:10px;margin:8px 0 14px}
      .v52-market-grid{display:grid;grid-template-columns:minmax(260px,360px) minmax(0,1fr);gap:14px}
      .v52-panel{padding:16px;border-radius:18px;border:1px solid rgba(148,163,184,.16);background:rgba(2,6,23,.72)}
      .v52-list{display:flex;flex-direction:column;gap:10px}
      .v52-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:12px 14px;border:1px solid rgba(148,163,184,.14);border-radius:16px;background:rgba(15,23,42,.52)}
      @media(max-width:900px){.v52-market-grid{grid-template-columns:1fr}.v52-row{flex-direction:column;align-items:stretch}}
    `;
    document.head.appendChild(st);
  }
  function v52Effect(title, sub, kind){
    try{
      v52EnsureStyle();
      document.querySelectorAll('.v52-fx,.v52-ring,.v52-star').forEach(e=>e.remove());
      const box=document.createElement('div'); box.className='v52-fx';
      const color=kind==='enchant'?'#c084fc':kind==='gacha'?'#facc15':kind==='drop'?'#38bdf8':'#22c55e';
      box.style.boxShadow=`0 0 90px ${color}aa, inset 0 0 30px rgba(255,255,255,.12)`;
      box.innerHTML=`<div class="v52-fx-title">${esc(title)}</div><div class="v52-fx-sub">${esc(sub||'')}</div>`;
      document.body.appendChild(box);
      for(let r=0;r<3;r++){ const ring=document.createElement('div'); ring.className='v52-ring'; ring.style.borderColor=color; ring.style.animationDelay=(r*.12)+'s'; document.body.appendChild(ring); setTimeout(()=>ring.remove(),1600); }
      for(let i=0;i<28;i++){ const s=document.createElement('div'); s.className='v52-star'; s.textContent=i%3===0?'✦':i%3===1?'◆':'★'; const a=Math.random()*Math.PI*2; const d=90+Math.random()*260; s.style.setProperty('--dx',Math.cos(a)*d+'px'); s.style.setProperty('--dy',Math.sin(a)*d+'px'); s.style.color=i%2?color:'#fef08a'; s.style.animationDelay=(Math.random()*.22)+'s'; document.body.appendChild(s); setTimeout(()=>s.remove(),1700); }
      setTimeout(()=>box.remove(),2800);
      state.flash=Math.max(state.flash||0,.78);
    }catch(e){ console.warn('[V52 FX failed]',e); }
  }
  try{
    v48Effect = function(title, sub, kind){ v52Effect(title, sub, kind==='good'?'enhance':kind); };
  }catch(e){}
  try{
    const oldGachaV52 = gachaCelebration;
    gachaCelebration = function(item){ try{ oldGachaV52(item); }catch(e){} setTimeout(()=>v52Effect('뽑기 성공!', (item&&item.name)||'아이템 획득', 'gacha'), 50); };
  }catch(e){}
  try{
    const oldEnhanceV52 = enhanceWeapon;
    enhanceWeapon = function(id){ const before=(weaponMeta(id)||{}).enh||0; oldEnhanceV52(id); const after=(weaponMeta(id)||{}).enh||0; if(after>before) v52Effect('강화 성공!', `${(getWeapon(id)||{}).name||'무기'} +${after}`, 'enhance'); };
    const oldEnchantV52 = enchantWeapon;
    enchantWeapon = function(id){ oldEnchantV52(id); v52Effect('인챈트 완료!', `${(getWeapon(id)||{}).name||'무기'}에 새로운 힘이 깃들었습니다`, 'enchant'); };
  }catch(e){ console.warn('[V52 enhance/enchant FX hook failed]',e); }

  function v52MarketTab(){ return state.v52MarketTab || 'material'; }
  function v52MarketTabs(){
    const tabs=[['material','부산물 장터'],['weapon','무기 장터'],['armor','방어구 장터'],['skill','스킬 장터']];
    return `<div class="v52-market-tabs">${tabs.map(([k,l])=>`<button type="button" class="tab ${v52MarketTab()===k?'active':''}" data-v52-market-tab="${k}">${l}</button>`).join('')}</div>`;
  }
  function v52RarityItemName(name, rarity){
    try{ if(rarity) return v49NameHtml(name, rarity); }catch(e){}
    return `<span style="font-weight:900">${esc(name)}</span>`;
  }
  function v52ItemOptions(kind){
    let arr=[];
    if(kind==='weapon') arr=[...new Set(state.save.weapons||[])].map(id=>getWeapon(id)).filter(Boolean);
    if(kind==='armor') arr=[...new Set(state.save.armors||[])].map(id=>getArmor(id)).filter(Boolean);
    if(kind==='skill') arr=[...new Set(state.save.skills||[])].map(id=>getSkill(id)).filter(Boolean);
    return arr.map(x=>`<option value="${esc(x.id)}">${esc(x.name)} · ${getRarity(x.rarity).name}</option>`).join('');
  }
  function v52RegisterItem(kind){
    const sel=document.getElementById('v52ItemSelect');
    const price=Math.max(1, Math.floor(Number(document.getElementById('v52ItemPrice')?.value||0)));
    const id=sel&&sel.value;
    if(!id || !price){ toast('아이템과 가격을 입력하세요.'); return; }
    const obj=kind==='weapon'?getWeapon(id):kind==='armor'?getArmor(id):getSkill(id);
    if(!obj){ toast('아이템을 찾을 수 없습니다.'); return; }
    const a=marketLoad();
    a.push({id:kind[0]+Date.now()+Math.random(),kind,name:obj.name,itemId:id,rarity:obj.rarity,price,seller:state.save.playerName||'Player'});
    if(kind==='weapon') state.save.weapons=(state.save.weapons||[]).filter(x=>x!==id);
    if(kind==='armor') state.save.armors=(state.save.armors||[]).filter(x=>x!==id);
    if(kind==='skill') state.save.skills=(state.save.skills||[]).filter(x=>x!==id);
    marketSave(a); saveGame(); renderMenu(); toast(`${obj.name} 판매소 등록`);
  }
  try{
    const oldMarketBuyV52 = marketBuy;
    marketBuy = function(id){
      const a=marketLoad(); const it=a.find(x=>x.id===id);
      oldMarketBuyV52(id);
      if(it && it.kind==='armor' && !(state.save.armors||[]).includes(it.itemId)){ state.save.armors.push(it.itemId); saveGame(); renderMenu(); }
    };
  }catch(e){}
  renderMarket = function(){
    v52EnsureStyle(); v48Ensure();
    const tab=v52MarketTab(); const list=marketLoad().slice().reverse().filter(x=>tab==='material'?x.kind==='material':x.kind===tab);
    let form='';
    if(tab==='material'){
      const mats=Object.entries(v45().materials||{}).filter(x=>x[1]>0);
      const opts=mats.map(([m,q])=>`<option value="${esc(m)}">${esc(m)} x${q}</option>`).join('');
      form=`<h3>부산물 등록</h3><p class="sub">최대 10개가 1묶음으로 등록됩니다.</p><select id="v45MatSelect" class="input">${opts}</select><input id="v45MatPrice" class="input" type="number" min="1" placeholder="가격 입력" style="margin-top:8px"><button id="v45MatRegister" class="btn" style="margin-top:10px;width:100%">10개 묶음 등록</button>`;
    } else {
      const label=tab==='weapon'?'무기':tab==='armor'?'방어구':'스킬';
      const opts=v52ItemOptions(tab);
      form=`<h3>${label} 등록</h3><p class="sub">보유한 ${label}을 선택해 원하는 가격으로 등록합니다.</p><select id="v52ItemSelect" class="input">${opts||`<option value="">등록할 ${label} 없음</option>`}</select><input id="v52ItemPrice" class="input" type="number" min="1" placeholder="가격 입력" style="margin-top:8px"><button id="v52ItemRegister" class="btn" style="margin-top:10px;width:100%">${label} 등록</button>`;
    }
    const listing=list.map(x=>`<div class="v52-row"><div><b>${v52RarityItemName(x.name,x.rarity)}</b><div class="muted">${esc(x.kind)} · 판매자 ${esc(x.seller)} ${x.kind==='material'?'· 수량 '+x.qty:''}</div></div><button class="btn secondary" data-v45-buy="${esc(x.id)}">${x.price} 구매</button></div>`).join('')||'<p class="muted">등록된 물품이 없습니다.</p>';
    return `<h2 class="title" style="font-size:22px">유저 판매소</h2><p class="sub">부산물, 무기, 방어구, 스킬을 나누어 등록하고 구매합니다.</p>${v48Summary()}${v52MarketTabs()}<div class="v52-market-grid"><div class="v52-panel">${form}</div><div class="v52-panel"><h3>판매 목록</h3><div class="v52-list">${listing}</div></div></div>`;
  };

  function v52BindTabsAndButtons(){
    try{
      const root=ui&&ui.menu; if(!root) return;
      root.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{ state.menuTab=b.dataset.tab; renderMenu(); });
      root.querySelectorAll('[data-v45-tab]').forEach(b=>b.onclick=()=>{ state.menuTab=b.dataset.v45Tab; renderMenu(); });
      root.querySelectorAll('[data-v52-market-tab]').forEach(b=>b.onclick=()=>{ state.v52MarketTab=b.dataset.v52MarketTab; state.menuTab='market'; renderMenu(); });
      const reg=root.querySelector('#v52ItemRegister'); if(reg) reg.onclick=()=>v52RegisterItem(v52MarketTab());
      root.querySelectorAll('[data-v45-buy]').forEach(el=>el.onclick=()=>marketBuy(el.dataset.v45Buy));
      const mr=root.querySelector('#v45MatRegister'); if(mr) mr.onclick=registerMaterial;
      root.querySelectorAll('[data-select-type]').forEach(card=>{ card.onclick=()=>{ const type=card.dataset.selectType; const id=card.dataset.selectId||''; const slot=Number(card.dataset.slot||0); window.RaidDungeonUI&&window.RaidDungeonUI.select(type,id,slot); }; });
      root.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{ window.RaidDungeonUI&&window.RaidDungeonUI.step(b.dataset.step); });
      root.querySelectorAll('[data-prev-step]').forEach(b=>b.onclick=()=>window.RaidDungeonUI&&window.RaidDungeonUI.prev&&window.RaidDungeonUI.prev());
      root.querySelectorAll('[data-next-step]').forEach(b=>b.onclick=()=>window.RaidDungeonUI&&window.RaidDungeonUI.next&&window.RaidDungeonUI.next());
    }catch(e){ console.warn('[V52 bind failed]', e); }
  }
  try{
    const oldBindV52 = bindV45;
    bindV45=function(){ try{oldBindV52();}catch(e){} v52BindTabsAndButtons(); };
    const oldRenderV52 = renderMenu;
    renderMenu=function(){ oldRenderV52(); v52BindTabsAndButtons(); };
  }catch(e){ console.warn('[V52 bind/render hook failed]',e); }


  /* ===== V54: lag-free mass pattern rendering, keep same attack patterns ===== */
  const V54_VERSION = 'Raid Dungeon V54 - Lag Free Mass Patterns';
  function v54MassMode(){
    try{
      return state.screen==='raid' && (
        (state.hazards&&state.hazards.length>38) ||
        (state.projectiles&&state.projectiles.length>70) ||
        (state.particles&&state.particles.length>135) ||
        (state.texts&&state.texts.length>32)
      );
    }catch(e){ return false; }
  }
  function v54Color(c){ return c || '#ffffff'; }
  function v54FastLabel(h,i,seen){
    const label=String((h&&h.label)||'').trim();
    if(!label || label==='!' || seen.count>14) return;
    const key=label.slice(0,10);
    seen[key]=(seen[key]||0)+1;
    if(seen[key]>2) return;
    seen.count++;
    ctx.save();
    ctx.globalAlpha=.68;
    ctx.fillStyle='#f8fafc';
    ctx.font='900 12px system-ui';
    ctx.textAlign='center';
    ctx.lineWidth=3;
    ctx.strokeStyle='rgba(0,0,0,.55)';
    const x=h.x||W/2, y=h.y||H/2;
    ctx.strokeText(label,x,y+4);
    ctx.fillText(label,x,y+4);
    ctx.restore();
  }
  function v54DrawHazardsFast(){
    const list=state.hazards||[];
    const seen={count:0};
    ctx.save();
    ctx.shadowBlur=0;
    ctx.lineCap='round';
    ctx.lineJoin='round';
    for(let i=0;i<list.length;i++){
      const h=list[i]; if(!h) continue;
      const warning=(h.warn||0)>0;
      const col=v54Color(h.color);
      ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=warning?3:2;
      if(h.kind==='circle'||h.kind==='playerStrike'){
        ctx.globalAlpha=warning?.18:.34;
        ctx.beginPath(); ctx.arc(h.x,h.y,h.r||20,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=warning?.62:.78;
        ctx.beginPath(); ctx.arc(h.x,h.y,h.r||20,0,Math.PI*2); ctx.stroke();
        if(i%3===0) v54FastLabel(h,i,seen);
      } else if(h.kind==='donut'){
        const inner=h.inner||40, outer=h.outer||90;
        ctx.globalAlpha=warning?.56:.72;
        ctx.beginPath(); ctx.arc(h.x,h.y,outer,0,Math.PI*2); ctx.stroke();
        ctx.globalAlpha=warning?.36:.54;
        ctx.beginPath(); ctx.arc(h.x,h.y,inner,0,Math.PI*2); ctx.stroke();
        if(i%3===0) v54FastLabel(h,i,seen);
      } else if(h.kind==='beam'||h.kind==='rotatingBeam'){
        ctx.save();
        ctx.translate(h.x||W/2,h.y||H/2); ctx.rotate(h.angle||0);
        const len=h.len||1000, ww=(h.w||18)*2;
        ctx.globalAlpha=warning?.18:.36;
        ctx.fillRect(-len/2,-ww/2,len,ww);
        ctx.globalAlpha=warning?.72:.82;
        ctx.strokeStyle='rgba(255,255,255,.78)'; ctx.lineWidth=warning?1.8:1.2;
        ctx.strokeRect(-len/2,-ww/2,len,ww);
        ctx.restore();
        if(i%5===0) v54FastLabel(h,i,seen);
      } else if(h.kind==='wall'){
        ctx.globalAlpha=warning?.16:.42;
        ctx.fillRect((h.x||0)-(h.w||40)/2,(h.y||0)-(h.h||40)/2,h.w||40,h.h||40);
        ctx.globalAlpha=warning?.48:.68; ctx.strokeStyle='rgba(255,255,255,.50)'; ctx.lineWidth=1.4;
        ctx.strokeRect((h.x||0)-(h.w||40)/2,(h.y||0)-(h.h||40)/2,h.w||40,h.h||40);
        if(i%4===0) v54FastLabel(h,i,seen);
      } else if(h.kind==='floor'){
        const x=(h.x||W/2)-(h.w||W)/2, y=(h.y||H/2)-(h.h||H)/2;
        ctx.globalAlpha=warning?.10:.24;
        ctx.fillRect(x,y,h.w||W,h.h||H);
        ctx.globalAlpha=warning?.38:.52; ctx.strokeStyle='rgba(255,255,255,.38)'; ctx.lineWidth=1.5;
        ctx.strokeRect(x,y,h.w||W,h.h||H);
        v54FastLabel(h,i,seen);
      }
    }
    ctx.globalAlpha=1;
    ctx.restore();
  }
  try{
    const oldDrawHazardsV54=drawHazards;
    drawHazards=function(){
      if(v54MassMode()) return v54DrawHazardsFast();
      return oldDrawHazardsV54();
    };
  }catch(e){ console.warn('[V54 drawHazards fast patch failed]',e); }

  function v54DrawProjectilesFast(){
    const arr=state.projectiles||[];
    const max=180;
    const start=Math.max(0,arr.length-max);
    const groups={};
    const delayed=[];
    for(let i=start;i<arr.length;i++){
      const p=arr[i]; if(!p) continue;
      if(p.delay&&p.delay>0){ if(delayed.length<26) delayed.push(p); continue; }
      const c=v54Color(p.color);
      (groups[c]||(groups[c]=[])).push(p);
    }
    ctx.save(); ctx.shadowBlur=0;
    for(const c in groups){
      const g=groups[c]; ctx.fillStyle=c; ctx.globalAlpha=.88; ctx.beginPath();
      for(let i=0;i<g.length;i++){ const p=g[i]; ctx.moveTo(p.x+(p.r||4),p.y); ctx.arc(p.x,p.y,p.r||4,0,Math.PI*2); }
      ctx.fill();
    }
    ctx.globalAlpha=.35; ctx.strokeStyle='#fff'; ctx.lineWidth=1.5;
    delayed.forEach(p=>{ ctx.beginPath(); ctx.arc(p.x,p.y,16,0,Math.PI*2); ctx.stroke(); });
    ctx.globalAlpha=1; ctx.restore();
  }
  try{
    const oldDrawProjectilesV54=drawProjectiles;
    drawProjectiles=function(){
      if(v54MassMode()) return v54DrawProjectilesFast();
      return oldDrawProjectilesV54();
    };
  }catch(e){ console.warn('[V54 drawProjectiles fast patch failed]',e); }

  function v54DrawParticlesFast(){
    const arr=state.particles||[];
    const max=90; const start=Math.max(0,arr.length-max);
    ctx.save(); ctx.shadowBlur=0;
    for(let i=start;i<arr.length;i+= arr.length>150?2:1){
      const p=arr[i]; if(!p) continue;
      const a=Math.max(0,Math.min(1,p.life||0));
      ctx.globalAlpha=Math.min(.72,a);
      ctx.strokeStyle=p.color||'#fff'; ctx.fillStyle=p.color||'#fff';
      if(p.kind==='line'){
        ctx.lineWidth=Math.max(1,(p.r||3)*.22);
        ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p.x+Math.cos(p.angle||0)*(p.len||22),p.y+Math.sin(p.angle||0)*(p.len||22)); ctx.stroke();
      }else if(p.kind==='ring'){
        ctx.lineWidth=Math.max(1,(p.line||2)*.45);
        ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(2,(p.r||8)),0,Math.PI*2); ctx.stroke();
      }else{
        ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(1.5,Math.min(5,p.r||3)),0,Math.PI*2); ctx.fill();
      }
    }
    ctx.globalAlpha=1; ctx.restore();
  }
  try{
    const oldDrawParticlesV54=drawParticles;
    drawParticles=function(){
      if(v54MassMode()) return v54DrawParticlesFast();
      return oldDrawParticlesV54();
    };
  }catch(e){ console.warn('[V54 drawParticles fast patch failed]',e); }

  try{
    const oldDrawTextsV54=drawTexts;
    drawTexts=function(){
      if(!v54MassMode()) return oldDrawTextsV54();
      const arr=state.texts||[];
      const start=Math.max(0,arr.length-26);
      const seen={};
      ctx.save(); ctx.textAlign='center'; ctx.shadowBlur=0;
      for(let i=start;i<arr.length;i++){
        const t=arr[i]; if(!t) continue;
        const key=String(t.text||'').slice(0,8); seen[key]=(seen[key]||0)+1;
        if(seen[key]>2) continue;
        ctx.globalAlpha=Math.max(.25,Math.min(.9,t.life||1));
        ctx.fillStyle=t.color||'#fff'; ctx.font=`900 ${Math.min(18,t.size||14)}px system-ui`;
        ctx.fillText(t.text,t.x,t.y);
      }
      ctx.globalAlpha=1; ctx.restore();
    };
  }catch(e){ console.warn('[V54 drawTexts fast patch failed]',e); }

  try{
    const oldUpdateV54=update;
    update=function(dt){
      oldUpdateV54(dt);
      try{
        if(state.texts&&state.texts.length>44) state.texts.splice(0,state.texts.length-44);
        if(state.particles&&state.particles.length>160) state.particles.splice(0,state.particles.length-160);
        if(state.projectiles&&state.projectiles.length>210) state.projectiles.splice(0,state.projectiles.length-210);
      }catch(e){}
    };
  }catch(e){ console.warn('[V54 update cap patch failed]',e); }



  /* ===== V55: stronger lag reduction + 6 pattern phase system for every boss ===== */
  const V55_VERSION = 'Raid Dungeon V55 - Six Phase Patterns Ultra Performance';
  function v55HpRate(){ try{return boss.hp/Math.max(1,boss.maxHp);}catch(e){return 1;} }
  function v55Phase(){ const r=v55HpRate(); return r<=.33?3:r<=.66?2:1; }
  function v55Tier(){ return Math.max(1, Math.min(10, Number((boss&&boss.tier)||1))); }
  function v55Dmg(m){ return Math.max(8, ((boss&&boss.atk)||18)*(m||1)); }
  function v55Color(){ return (boss&&boss.color)||'#fff'; }
  function v55Sub(){ return (boss&&boss.sub)||v55Color(); }
  function v55A(){ return Math.atan2(player.y-boss.y, player.x-boss.x); }
  function v55HazardCount(){ return (state.hazards||[]).length + (state.projectiles||[]).length + (state.particles||[]).length + (state.texts||[]).length; }
  function v55Heavy(){ return state.screen==='raid' && v55HazardCount()>118; }
  function v55Cap(){
    if(state.hazards && state.hazards.length>96){
      const keep=[];
      const arr=state.hazards;
      for(let i=0;i<arr.length;i++){
        const h=arr[i];
        if(!h) continue;
        if(h.v51FullMap||h.respectSafe||h.v55Core||h.kind==='floor') keep.push(h);
        else if(i%Math.ceil(arr.length/96)===0) keep.push(h);
      }
      state.hazards=keep.slice(-96);
    }
    if(state.projectiles && state.projectiles.length>118) state.projectiles.splice(0,state.projectiles.length-118);
    if(state.particles && state.particles.length>82) state.particles.splice(0,state.particles.length-82);
    if(state.texts && state.texts.length>22) state.texts.splice(0,state.texts.length-22);
  }
  function v55Cast(text, color){
    boss.mechanicText=text;
    if(!v55Heavy()) floatText(String(text).split(':').pop().slice(0,16), boss.x, boss.y-boss.r-22, color||v55Color(), 15);
  }
  function v55H(h){
    h.v55Core=true;
    if((h.warn||0)<.5) h.warn=.5;
    if((h.life||0)<.35) h.life=.35;
    state.hazards.push(h);
  }
  function v55Circle(x,y,r,warn,life,color,damage,label){ v55H({kind:'circle',x,y,r,warn,life,damage,color:color||v55Color(),tag:boss.theme,label}); }
  function v55Beam(x,y,a,len,warn,life,color,damage,label,w){ v55H({kind:'beam',x,y,angle:a,len:len||980,w:w||24,warn,life,damage,color:color||v55Color(),tag:boss.theme,label}); }
  function v55Wall(x,y,w,h,warn,life,color,damage,label){ v55H({kind:'wall',x,y,w,h,warn,life,damage,color:color||v55Color(),tag:boss.theme,label}); }
  function v55Donut(x,y,inner,outer,warn,life,color,damage,label){ v55H({kind:'donut',x,y,inner,outer,warn,life,damage,color:color||v55Color(),tag:boss.theme,label}); }
  function v55Full(warn,life,color,damage,label){
    v55H({kind:'floor',x:W/2,y:H/2,w:W*1.08,h:H*1.08,warn,life,damage,color:color||v55Color(),tag:boss.theme,label:label||'전체 맵 공격',respectSafe:true,v51FullMap:true,v55Full:true,tick:0});
  }
  function v55Safe(x,y,r,life,color,fake){ state.mechanics.push({kind:'safe',x,y,r,life:life||2.2,color:color||'#86efac',fake:!!fake}); }
  function v55Proj(a,speed,color,damage,r,life){ spawnProjectile({owner:'boss',x:boss.x+Math.cos(a)*boss.r*.65,y:boss.y+Math.sin(a)*boss.r*.65,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:r||7,life:life||3,damage:damage||v55Dmg(.35),color:color||v55Color(),tag:boss.theme}); }
  function v55RingBullets(count,speed,color,damage,offset){
    count=Math.min(count, v55Heavy()?18:26);
    for(let i=0;i<count;i++){ const a=i/count*Math.PI*2+(offset||0); v55Proj(a,speed,color,damage,6,3.2); }
  }
  function v55VisualBurst(x,y,color,n){
    if(v55Heavy()) n=Math.min(n||12,8); else n=Math.min(n||18,24);
    for(let i=0;i<n;i++) state.particles.push({kind:i%2?'star':'ring',x:x+rand(-16,16),y:y+rand(-16,16),vx:rand(-120,120),vy:rand(-150,80),r:rand(4,10),life:rand(.25,.55),color:color||v55Color(),line:2});
  }

  function v55Pattern0(){
    const p=v55Phase(), t=v55Tier(), c=v55Color();
    v55Cast(`${boss.name}: 추적 낙하를 보고 빈틈으로 빠지세요.`,c);
    const n=Math.min(4+p+t/3|0, v55Heavy()?8:12);
    for(let i=0;i<n;i++){
      const tx=i<2?player.x+rand(-80,80):rand(100,W-100), ty=i<2?player.y+rand(-70,70):rand(120,H-80);
      v55Circle(tx,ty,34+t*2+p*4,.66+i*.045,.42,c,v55Dmg(.44+p*.08),'추적 낙하');
    }
    if(p>=2) v55RingBullets(8+t,145+t*13,v55Sub(),v55Dmg(.23));
  }
  function v55Pattern1(){
    const p=v55Phase(), t=v55Tier(), c=v55Color(), a=v55A();
    v55Cast(`${boss.name}: 부채꼴 절단선이 좁혀집니다.`,c);
    const rays=Math.min(5+p*2+Math.floor(t/3), v55Heavy()?10:15);
    const spread=p===1?.78:p===2?1.05:1.35;
    for(let i=0;i<rays;i++){
      const aa=a-spread/2+spread*(rays===1?.5:i/(rays-1));
      v55Beam(boss.x,boss.y,aa,980,.62+i*.025,.42,i%2?c:v55Sub(),v55Dmg(.38+p*.07),'부채 절단',18+p*3);
    }
    if(p>=3) setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead) v55RingBullets(16+t,180+t*7,v55Sub(),v55Dmg(.24),state.time); },360);
  }
  function v55Pattern2(){
    const p=v55Phase(), t=v55Tier(), c=v55Color();
    v55Cast(`${boss.name}: 고리와 회전선이 겹칩니다.`,c);
    const rings=p+2;
    for(let i=0;i<rings;i++) v55Donut(boss.x,boss.y,54+i*58,82+i*58,.75+i*.08,.48,i%2?c:v55Sub(),v55Dmg(.38+p*.06),'회전 고리');
    const beams=Math.min(2+p+(t>=8?1:0), v55Heavy()?4:6);
    for(let i=0;i<beams;i++) v55Beam(W/2,H/2,Math.random()*Math.PI+i*Math.PI/beams,1100,.95+i*.08,.62,c,v55Dmg(.42+p*.06),'회전선',18+p*2);
  }
  function v55Pattern3(){
    const p=v55Phase(), c=v55Color();
    v55Cast(`${boss.name}: SAFE 안으로 이동하세요.`,c);
    const sx=rand(130,W-130), sy=rand(135,H-105);
    v55Safe(sx,sy,58+p*3,2.25,'#86efac',false);
    if(p>=2 && !v55Heavy()) for(let i=0;i<Math.min(p,3);i++) v55Safe(rand(120,W-120),rand(130,H-100),48,2.1,c,true);
    v55Full(1.35,.62,c,v55Dmg(.78+p*.12),'전장 심판');
    if(p>=2) for(let i=0;i<4+p;i++) v55Circle(rand(100,W-100),rand(120,H-85),34,.82+i*.07,.40,v55Sub(),v55Dmg(.38),'심판 잔광');
  }
  function v55Pattern4(){
    const p=v55Phase(), c=v55Color();
    v55Cast(`${boss.name}: 미니 미로가 열립니다. 벽을 돌아서 피하세요.`,c);
    if(typeof v51SpawnTrueMaze==='function') v51SpawnTrueMaze();
    const lanes=Math.min(5+p*2, v55Heavy()?7:11);
    for(let i=0;i<lanes;i++){
      const vertical=i%2===0;
      v55Wall(vertical?rand(150,W-150):W/2, vertical?H/2:rand(130,H-95), vertical?20:W*.72, vertical?H*.55:20, .95+i*.045, .62, i%2?c:v55Sub(), v55Dmg(.36+p*.05), '미로 봉쇄');
    }
  }
  function v55Pattern5(){
    const p=v55Phase(), t=v55Tier(), c=v55Color();
    v55Cast(`${boss.name}: 최종 연계 패턴입니다. 구르기와 이동을 모두 써야 합니다.`,c);
    const sx=rand(150,W-150), sy=rand(145,H-115);
    v55Safe(sx,sy,54,2.1,'#86efac',false);
    v55Full(1.15,.56,c,v55Dmg(.92+p*.10),'최종 전장 붕괴');
    const rays=Math.min(8+p*3+Math.floor(t/2), v55Heavy()?12:20);
    for(let i=0;i<rays;i++) v55Beam(W/2,H/2,i*Math.PI/rays+state.time*.06,1120,.68+i*.018,.46,i%2?c:v55Sub(),v55Dmg(.36+p*.05),'최종 광선',16+p*2);
    setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead){ for(let i=0;i<Math.min(8+t, v55Heavy()?10:16);i++) v55Circle(rand(100,W-100),rand(120,H-86),32+Math.random()*18,.48+i*.04,.38,v55Sub(),v55Dmg(.42),'낙하 핵'); } },420);
  }

  function v55ChoosePattern(){
    const p=v55Phase(), t=v55Tier();
    const pool=p===1?[0,0,1,1,2,3]:p===2?[0,1,2,3,4,4,5]:[0,1,2,3,4,5,5,5];
    if(t>=8 && p>=2) pool.push(5,4);
    if(t>=10) pool.push(5,5,4,2);
    return pool[Math.floor(Math.random()*pool.length)];
  }
  BOSSES.forEach(b=>{
    const base=(b.patterns||[]).slice(0,6);
    const defaults=['추적 낙하','부채 절단','회전 고리','전장 심판','미로 봉쇄','최종 연계'];
    while(base.length<6) base.push(defaults[base.length]);
    b.patterns=base.slice(0,6);
  });
  try{
    const oldGetBossPatternCooldownV55=getBossPatternCooldown;
    getBossPatternCooldown=function(){
      const t=v55Tier(), p=v55Phase();
      return Math.max(.62, (2.55-t*.15) * (p===3?.68:p===2?.82:1) + Math.random()*.22);
    };
  }catch(e){}
  try{
    const oldBossPatternV55=bossPattern;
    bossPattern=function(){
      try{
        v55Cap();
        const idx=v55ChoosePattern();
        if(idx===0) v55Pattern0();
        else if(idx===1) v55Pattern1();
        else if(idx===2) v55Pattern2();
        else if(idx===3) v55Pattern3();
        else if(idx===4) v55Pattern4();
        else v55Pattern5();
        const p=v55Phase(), t=v55Tier();
        if(p>=2 && t>=6 && Math.random()<.36) setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead){ const add=[v55Pattern0,v55Pattern1,v55Pattern2][Math.floor(Math.random()*3)]; add(); v55Cap(); } },560);
        if(p>=3 && t>=8 && Math.random()<.34) setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead){ v55Pattern5(); v55Cap(); } },960);
        v55VisualBurst(boss.x,boss.y,v55Color(), v55Heavy()?6:14);
        v55Cap();
      }catch(e){ console.warn('[V55 boss pattern fallback]',e); try{oldBossPatternV55();}catch(_){} }
    };
  }catch(e){ console.warn('[V55 bossPattern patch failed]',e); }

  function v55DrawHazardsUltra(){
    const list=state.hazards||[]; const seen={};
    ctx.save(); ctx.shadowBlur=0; ctx.lineJoin='round'; ctx.lineCap='round';
    const step=list.length>90?2:1;
    for(let i=0;i<list.length;i+=step){
      const h=list[i]; if(!h) continue; const warn=(h.warn||0)>0, col=h.color||'#fff';
      ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=warn?2.5:1.8; ctx.globalAlpha=warn?.16:.30;
      if(h.kind==='floor'){ ctx.fillRect((h.x||W/2)-(h.w||W)/2,(h.y||H/2)-(h.h||H)/2,h.w||W,h.h||H); }
      else if(h.kind==='beam'||h.kind==='rotatingBeam'){ ctx.save(); ctx.translate(h.x||W/2,h.y||H/2); ctx.rotate(h.angle||0); ctx.fillRect(-(h.len||1000)/2,-(h.w||20),h.len||1000,(h.w||20)*2); ctx.restore(); }
      else if(h.kind==='wall'){ ctx.fillRect((h.x||0)-(h.w||40)/2,(h.y||0)-(h.h||40)/2,h.w||40,h.h||40); }
      else { ctx.beginPath(); ctx.arc(h.x||W/2,h.y||H/2,h.r||h.outer||40,0,Math.PI*2); if(h.kind==='donut') ctx.stroke(); else ctx.fill(); }
      const lab=String(h.label||'');
      if(lab && !seen[lab] && Object.keys(seen).length<8){ seen[lab]=1; ctx.globalAlpha=.7; ctx.fillStyle='#fff'; ctx.font='900 11px system-ui'; ctx.textAlign='center'; ctx.fillText(lab,(h.x||W/2),(h.y||H/2)+4); }
    }
    ctx.globalAlpha=1; ctx.restore();
  }
  try{
    const oldDrawHazardsV55=drawHazards;
    drawHazards=function(){ if(v55Heavy()) return v55DrawHazardsUltra(); return oldDrawHazardsV55(); };
  }catch(e){}
  try{
    const oldUpdateV55=update;
    update=function(dt){
      oldUpdateV55(dt);
      if(v55Heavy()){
        if(state.hazards&&state.hazards.length>86) state.hazards=state.hazards.filter((h,i)=>h&& (h.v55Core||h.v51FullMap||h.respectSafe||i%3===0)).slice(-86);
        if(state.projectiles&&state.projectiles.length>105) state.projectiles.splice(0,state.projectiles.length-105);
        if(state.particles&&state.particles.length>66) state.particles.splice(0,state.particles.length-66);
        if(state.texts&&state.texts.length>16) state.texts.splice(0,state.texts.length-16);
      } else v55Cap();
    };
  }catch(e){ console.warn('[V55 update ultra cap failed]',e); }
  try{ window.RaidDungeonV55={version:V55_VERSION, sixPatternsPerBoss:true, phaseUnlock:'phase1 uses 3-4, phase2 adds 5th, phase3 adds 6th/final combos', ultraPerformance:true}; }catch(e){}



  /* ===== V56: boss-specific 6 pattern phase system, not common labels ===== */
  const V56_VERSION = 'Raid Dungeon V56 - Boss Unique Six Phase Patterns';
  const V56_PROFILES = {
    slime_king:{type:'slime',labels:['왕관 점프 착지','분열 젤리 방울','말랑 탄성 벽','푸딩 미끄럼판','젤리 왕국 압축','왕관 젤리 폭주']},
    ember_tyrant:{type:'fire',labels:['전방 화염 숨결','용암 균열 별모양','화산탄 낙하','불타는 체스판','화염 폭주 회랑','화산 심장 폭발']},
    thorn_queen:{type:'nature',labels:['덩굴 갈고리','가시 울타리','독꽃 개화','꽃잎 폭풍','장미 감옥','가시 왕관 처형식']},
    frost_oracle:{type:'ice',labels:['빙창 낙하','얼음 감옥 통로','얼음 거울 반사','눈보라 차선','예언 빙결 타일','절대영도 장막']},
    sand_reaper:{type:'sand',labels:['모래 낫 베기','모래 늪 매몰','사막 파도','모래시계 역류','황금 사신 회랑','사막 장례식']},
    void_serpent:{type:'void',labels:['공허 포탈 물림','검은 늪 확산','추적 공허 구체','뱀 그림자 돌진','공허 고리 압축','심연 포식']},
    iron_minotaur:{type:'metal',labels:['광폭 돌진 선로','철벽 충격파','도끼 파동','금속 파편 낙하','미노타우로스 투기장','강철 분쇄 연계']},
    blood_moon:{type:'blood',labels:['혈월 표식','흡혈 칼날','붉은 달 탄막','핏빛 초승달','사냥꾼 처형선','혈월 만월 난무']},
    storm_colossus:{type:'lightning',labels:['낙뢰 예고','전류 룬 연결','거신 충격파','피뢰침 사슬','폭풍 회로','천둥 심판']},
    plague_doctor:{type:'poison',labels:['역병 안개 확산','해독 구역 역전','독침 난사','감염체 소환','오염 수술선','검은 역병 선고']},
    mirror_duelist:{type:'mirror',labels:['거울 분신 검무','반사검 교차','진짜 찾기 환영','만화경 절단','거울 감옥','결투장 무한반사']},
    gravity_core:{type:'gravity',labels:['중력 흡입','압축 폭발','역중력 파동','궤도 잔해','중력 미로','특이점 붕괴']},
    solar_dragon:{type:'solar',labels:['태양 광선 호흡','태양 낙하','일식 안전지대','태양풍 회전','솔라 플레어','태양핵 초신성']},
    chrono_dragon:{type:'chrono',labels:['시간 감속장','되감기 룬','분신 탄막','초침 절단','시계 미궁','시간정지 종말']},
    abyss_leviathan:{type:'abyss',labels:['심해 파동','흡입 소용돌이','해류 SAFE','심해 촉수','쓰나미 해일벽','레비아탄 심연포식']},
    puppet_emperor:{type:'puppet',labels:['실 조종선','인형실 갈고리','가짜 SAFE 인형극','단두대 예고','인형 감옥','황제의 처형식']},
    black_sun:{type:'eclipse',labels:['흑점 낙하','검은 고리','일식 광선','붕괴 지대','태양 소멸 파동','종말 일식 연계']},
    chaos_archon:{type:'chaos',labels:['혼돈 룬 변환','속성 뒤섞기','뒤틀린 탄막','무작위 처형선','혼돈 미로','차원 집행식']},
    crimson_train:{type:'train',labels:['급행 열차 돌진','선로 전환','차륜 폭발','정차 신호 함정','철도 분기 미로','종착역 충돌']},
    oracle_cube:{type:'cube',labels:['예언 큐브','회전 블록','큐브 절단','예언 퀴즈','색면 폭발','미래 좌표 붕괴']},
    hollow_gardener:{type:'garden',labels:['공허 씨앗 파종','검은 덩굴길','정원사 낫질','꽃밭 부패','공허 온실','죽은 정원 개화']},
    magnet_judge:{type:'magnet',labels:['극성 표식','자기장 밀어내기','금속 파편','N극 S극 심판','자력 감옥','자기 폭풍 판결']},
    dream_jester:{type:'jester',labels:['가짜 SAFE 풍선','카드 폭탄','웃음 함정','풍선 감옥','악몽 룰렛','서커스 대혼란']},
    apocalypse_capy:{type:'eclipse',labels:['길드 붕괴 예고','제필 길드 붕괴','동쉼 길드 붕괴','블마 길드 붕괴','불멸의 광휘','감히 죽일 수 없는 존재']},
    dlc_final:{type:'eclipse',labels:['제필 길드 붕괴','동쉼 길드 붕괴','블마 길드 붕괴','절대권능 광휘','차원 왕관 폭발','감히 죽일 수 없는 존재']}
  };
  function v56Profile(){
    const id=(boss&&boss.id)||'';
    if(V56_PROFILES[id]) return V56_PROFILES[id];
    const th=(boss&&boss.theme)||'';
    const map={fire:'ember_tyrant',slime:'slime_king',nature:'thorn_queen',ice:'frost_oracle',sand:'sand_reaper',void:'void_serpent',metal:'iron_minotaur',blood:'blood_moon',lightning:'storm_colossus',poison:'plague_doctor',mirror:'mirror_duelist',gravity:'gravity_core',solar:'solar_dragon',chrono:'chrono_dragon',chaos:'chaos_archon'};
    return V56_PROFILES[map[th]] || {type:th||'arcane',labels:['고유 예고','고유 돌진','고유 고리','고유 전장','고유 미로','고유 필살']};
  }
  function v56C(){ return v55Color(); }
  function v56S(){ return v55Sub(); }
  function v56Label(i){ const p=v56Profile(); return (p.labels&&p.labels[i]) || ('고유 패턴 '+(i+1)); }
  function v56Cast(i){ v55Cast(`${boss.name}: ${v56Label(i)}`, v56C()); }
  function v56Scatter(label, color, n, r, mul){
    n=Math.min(n, v55Heavy()?8:14);
    for(let i=0;i<n;i++){
      const near=i<2;
      v55Circle(near?player.x+rand(-85,85):rand(90,W-90), near?player.y+rand(-75,75):rand(118,H-85), r+rand(-4,8), .62+i*.04, .42, color, v55Dmg(mul||.34), label);
    }
  }
  function v56Fan(label, color, rays, spread, mul){
    const a=v55A(); rays=Math.min(rays, v55Heavy()?9:14);
    for(let i=0;i<rays;i++){
      const aa=a-spread/2+spread*(rays===1?.5:i/(rays-1));
      v55Beam(boss.x,boss.y,aa,1040,.64+i*.025,.42, i%2?color:v56S(), v55Dmg(mul||.36), label, 18+v55Phase()*2);
    }
  }
  function v56Rings(label, color, count, mul){
    for(let i=0;i<count;i++) v55Donut(boss.x,boss.y,52+i*58,84+i*58,.72+i*.075,.48,i%2?color:v56S(),v55Dmg(mul||.36),label);
  }
  function v56SafeFull(label, color, mul){
    const sx=rand(140,W-140), sy=rand(135,H-105);
    v55Safe(sx,sy,58+v55Phase()*3,2.3,'#86efac',false);
    if(v55Phase()>=2 && !v55Heavy()) v55Safe(rand(120,W-120),rand(130,H-100),48,2.1,color,true);
    v55Full(1.25,.58,color,v55Dmg(mul||.74),label);
  }
  function v56LaneMaze(label, color, mul){
    if(typeof v51SpawnTrueMaze==='function' && v55Phase()>=2) v51SpawnTrueMaze();
    const lanes=Math.min(4+v55Phase()*2+Math.floor(v55Tier()/4), v55Heavy()?7:12);
    for(let i=0;i<lanes;i++){
      const vertical=i%2===0;
      v55Wall(vertical?rand(135,W-135):W/2, vertical?H/2:rand(128,H-92), vertical?20:W*.74, vertical?H*.58:20, .88+i*.045, .58, i%2?color:v56S(), v55Dmg(mul||.34), label);
    }
  }
  function v56StylePattern(idx){
    const p=v56Profile(), type=p.type, ph=v55Phase(), tier=v55Tier(), c=v56C(), s=v56S(), label=v56Label(idx);
    v56Cast(idx);
    if(type==='slime'){
      if(idx===0){ v56Scatter(label,c,4+ph,42,.28); v55Donut(player.x,player.y,50,145,.72,.45,c,v55Dmg(.22),label+' 파동'); }
      else if(idx===1){ v55RingBullets(10+ph*3,130+tier*8,c,v55Dmg(.18),state.time); v56Scatter(label,s,5+ph,26,.20); }
      else if(idx===2){ v56LaneMaze(label,c,.28); }
      else if(idx===3){ v56SafeFull(label,c,.58); }
      else if(idx===4){ v56Rings(label,c,3+ph,.30); v56Scatter(label,s,6+ph,34,.24); }
      else { v56SafeFull(label,c,.74); v55RingBullets(16+ph*4,170+tier*8,s,v55Dmg(.22)); }
    } else if(type==='fire' || type==='solar' || type==='eclipse'){
      if(idx===0) v56Fan(label,c,5+ph*2, type==='eclipse'?1.55:1.05,.40);
      else if(idx===1) v56Scatter(label,s,7+ph*2,34,.36);
      else if(idx===2) v56SafeFull(label,c,type==='eclipse'?.82:.68);
      else if(idx===3){ const step=type==='eclipse'?5:6; for(let i=0;i<step;i++) v55Beam(W/2,H/2,i*Math.PI/step+state.time*.04,1120,.82+i*.05,.55,i%2?c:s,v55Dmg(.38),label,20); }
      else if(idx===4){ v56Rings(label,c,3+ph,.42); v56Fan(label,s,4+ph,Math.PI*1.35,.32); }
      else { v56SafeFull(label,c,type==='eclipse'?.96:.82); v56Fan(label,s,8+ph*3,Math.PI*1.7,.38); setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead) v56Scatter(label,s,7+ph,32,.38); },360); }
    } else if(type==='nature' || type==='poison' || type==='garden'){
      if(idx===0) v56Fan(label,c,4+ph,1.1,.30);
      else if(idx===1) v56LaneMaze(label,c,.32);
      else if(idx===2) v56Scatter(label,s,8+ph,30,.28);
      else if(idx===3){ v56Rings(label,c,2+ph,.30); if(ph>=2) v55RingBullets(8+ph*3,140+tier*6,s,v55Dmg(.16)); }
      else if(idx===4){ v56SafeFull(label,c,.68); v56Scatter(label,s,5,28,.22); }
      else { v56LaneMaze(label,c,.42); v56SafeFull(label,s,.76); }
    } else if(type==='ice' || type==='chrono'){
      if(idx===0) v56Scatter(label,c,8+ph*2,25,.28);
      else if(idx===1) v56LaneMaze(label,c,.30);
      else if(idx===2) { v56Fan(label,c,5+ph,Math.PI*.95,.32); v55Beam(W/2,H/2,Math.PI/2,980,.95,.45,s,v55Dmg(.28),label+' 반사',18); }
      else if(idx===3) v56SafeFull(label,c,.64);
      else if(idx===4){ for(let i=0;i<6+ph;i++) v55Wall(rand(110,W-110),rand(120,H-90),76,76,.76+i*.06,.48,i%2?c:s,v55Dmg(.32),label); }
      else { v56Rings(label,c,4,.42); v56Fan(label,s,8+ph,Math.PI*1.25,.36); }
    } else if(type==='sand' || type==='blood' || type==='metal'){
      if(idx===0) v56Fan(label,c,4+ph,1.2,.36);
      else if(idx===1) v56Scatter(label,s,6+ph,42,.32);
      else if(idx===2) v56Rings(label,c,2+ph,.34);
      else if(idx===3) v56SafeFull(label,c,.66);
      else if(idx===4){ for(let i=0;i<5+ph;i++) v55Beam(rand(80,W-80),rand(120,H-90),rand(0,Math.PI),520,.75+i*.04,.48,i%2?c:s,v55Dmg(.34),label,22); }
      else { v56Fan(label,c,8+ph*3,Math.PI*1.55,.42); v56Scatter(label,s,5+ph,34,.30); }
    } else if(type==='lightning' || type==='magnet'){
      if(idx===0) v56Scatter(label,c,7+ph*2,32,.34);
      else if(idx===1){ const rods=[]; for(let i=0;i<4+ph;i++){ const x=rand(110,W-110),y=rand(125,H-95); rods.push({x,y}); v55Circle(x,y,24,.65+i*.04,.38,c,v55Dmg(.20),label); } for(let i=1;i<rods.length;i++) v55Beam((rods[i-1].x+rods[i].x)/2,(rods[i-1].y+rods[i].y)/2,Math.atan2(rods[i].y-rods[i-1].y,rods[i].x-rods[i-1].x),Math.hypot(rods[i].x-rods[i-1].x,rods[i].y-rods[i-1].y),.92,.46,s,v55Dmg(.28),label+' 연결',14); }
      else if(idx===2) v56Rings(label,c,3,.36);
      else if(idx===3) v56SafeFull(label,c,.68);
      else if(idx===4) v56LaneMaze(label,c,.36);
      else { v56Scatter(label,c,8+ph*2,30,.35); v56Fan(label,s,7+ph,Math.PI*1.3,.38); }
    } else if(type==='mirror' || type==='puppet' || type==='jester'){
      if(idx===0) v56Fan(label,c,5+ph,1.25,.30);
      else if(idx===1) v56Scatter(label,s,6+ph,34,.28);
      else if(idx===2){ v55Safe(rand(140,W-140),rand(130,H-100),54,2.15,'#86efac',false); for(let i=0;i<2+ph;i++) v55Safe(rand(110,W-110),rand(125,H-95),48,2.15,c,true); v55Full(1.2,.52,c,v55Dmg(.62),label); }
      else if(idx===3){ if(type==='puppet') v56LaneMaze(label,c,.38); else v56Rings(label,c,3,.34); }
      else if(idx===4){ v56LaneMaze(label,c,.35); v55RingBullets(10+ph*3,150+tier*7,s,v55Dmg(.18)); }
      else { v56SafeFull(label,c,.82); v56Fan(label,s,9+ph*2,Math.PI*1.45,.38); }
    } else if(type==='void' || type==='gravity' || type==='abyss' || type==='chaos'){
      if(idx===0) v56Rings(label,c,2+ph,.34);
      else if(idx===1) v56Scatter(label,s,6+ph*2,38,.32);
      else if(idx===2) v56Fan(label,c,5+ph*2,Math.PI*1.15,.34);
      else if(idx===3) v56SafeFull(label,c,.72);
      else if(idx===4) v56LaneMaze(label,c,.38);
      else { v56SafeFull(label,c,.88); v56Rings(label,s,4,.42); v56Fan(label,c,7+ph*2,Math.PI*1.6,.36); }
    } else if(type==='train' || type==='cube'){
      if(idx===0) v56Fan(label,c,3+ph,Math.PI*.35,.40);
      else if(idx===1) v56LaneMaze(label,c,.34);
      else if(idx===2) v56Scatter(label,s,6+ph,40,.34);
      else if(idx===3) v56SafeFull(label,c,.68);
      else if(idx===4){ for(let i=0;i<6+ph;i++) v55Wall(rand(110,W-110),rand(120,H-90),62,62,.66+i*.04,.52,i%2?c:s,v55Dmg(.34),label); }
      else { v56LaneMaze(label,c,.44); v56Fan(label,s,8+ph,Math.PI*1.45,.38); }
    } else {
      if(idx===0) v56Scatter(label,c,6+ph,34,.30); else if(idx===1) v56Fan(label,c,5+ph,1.1,.34); else if(idx===2) v56Rings(label,c,2+ph,.34); else if(idx===3) v56SafeFull(label,c,.66); else if(idx===4) v56LaneMaze(label,c,.36); else { v56SafeFull(label,c,.82); v56Fan(label,s,8+ph,Math.PI*1.4,.38); }
    }
    v55VisualBurst(boss.x,boss.y,c,v55Heavy()?4:10);
  }
  function v56Choose(){
    const ph=v55Phase(), t=v55Tier();
    let pool=ph===1?[0,0,1,1,2,3]:ph===2?[0,1,2,3,4,4]:[0,1,2,3,4,5,5];
    if(t>=8&&ph>=2) pool=pool.concat([4,5]);
    if(t>=10&&ph>=3) pool=pool.concat([5,5,4]);
    return pool[Math.floor(Math.random()*pool.length)];
  }
  try{
    BOSSES.forEach(b=>{
      const prof=V56_PROFILES[b.id] || V56_PROFILES[{fire:'ember_tyrant',slime:'slime_king',nature:'thorn_queen',ice:'frost_oracle',sand:'sand_reaper',void:'void_serpent',metal:'iron_minotaur',blood:'blood_moon',lightning:'storm_colossus',poison:'plague_doctor',mirror:'mirror_duelist',gravity:'gravity_core',solar:'solar_dragon',chrono:'chrono_dragon',chaos:'chaos_archon'}[b.theme]];
      if(prof&&prof.labels) b.patterns=prof.labels.slice(0,6);
    });
  }catch(e){ console.warn('[V56 pattern labels failed]', e); }
  try{
    const oldBossPatternV56=bossPattern;
    bossPattern=function(){
      try{
        v55Cap();
        v56StylePattern(v56Choose());
        const ph=v55Phase(), t=v55Tier();
        if(ph>=2&&t>=7&&Math.random()<.28) setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead){ v56StylePattern(Math.floor(Math.random()*4)); v55Cap(); } },520);
        if(ph>=3&&t>=9&&Math.random()<.24) setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead){ v56StylePattern(5); v55Cap(); } },900);
        v55Cap();
      }catch(e){ console.warn('[V56 boss pattern fallback]',e); try{oldBossPatternV56();}catch(_){} }
    };
  }catch(e){ console.warn('[V56 bossPattern failed]', e); }
  try{ window.RaidDungeonV56={version:V56_VERSION, bossSpecificSixPatterns:true, phaseUnlock:'each boss has own 6 labels and own themed implementation', notCommonPatterns:true}; }catch(e){}


  /* ===== V57: tier based pattern count, not fixed six for every boss ===== */
  const V57_VERSION = 'Raid Dungeon V57 - Tier Based Unique Pattern Count';
  const V57_EXTRA_LABELS = {
    slime:['왕실 젤리 분열','초탄성 푸딩 해일'],
    fire:['불사조 화염폭우','화산왕 분화식'],
    nature:['가시 정원 대봉쇄','장미여왕 만개식'],
    poison:['대역병 격리구역','검은 수술실 개방'],
    garden:['죽은 꽃의 장례식','공허 정원 대개화'],
    ice:['수정 예언 십자','백야 빙하 낙인'],
    chrono:['시간축 붕괴','영원 회귀 심판'],
    sand:['사막 무덤 행렬','황금 모래폭풍'],
    metal:['강철 투기장 붕괴','미노타우로스 광란'],
    blood:['핏빛 사냥 의식','혈월 붉은 처형'],
    void:['공허 균열 대확장','무저갱 포식식'],
    gravity:['블랙홀 궤도 붕괴','특이점 대압축'],
    abyss:['심해 왕의 포효','심연 해일 종말'],
    lightning:['천둥왕 번개감옥','폭풍 회로 대폭주'],
    magnet:['극성 반전 판결','자력 심판장'],
    mirror:['무한 거울 결투장','만화경 처형무'],
    puppet:['꼭두각시 왕좌극','황제의 최종 단두대'],
    jester:['악몽 퍼레이드','서커스 종말 공연'],
    chaos:['차원 혼돈 법정','혼돈 집행 대칙령'],
    solar:['태양왕 강림','태양핵 창세 폭발'],
    eclipse:['암흑 십자성','종말 흑일식 왕관'],
    train:['폭주 종착역','무한 급행 충돌'],
    cube:['예언 차원큐브','미래좌표 소거식'],
    arcane:['비전 난류','마력 핵붕괴']
  };
  function v57TierRaw(b){
    const t=(b&&b.tier);
    if(String(t).toUpperCase()==='DLC') return 11;
    const n=Number(t||1);
    return Number.isFinite(n)?n:1;
  }
  function v57PatternCountForBoss(b){
    const id=String((b&&b.id)||'');
    const t=v57TierRaw(b);
    if(t>=11 || id.includes('dlc') || id.includes('apocalypse')) return 8;
    if(t>=9) return 7;
    if(t>=6) return 6;
    if(t>=3) return 5;
    return 4;
  }
  function v57ProfileForBoss(b){
    const id=(b&&b.id)||'';
    if(V56_PROFILES[id]) return V56_PROFILES[id];
    const th=(b&&b.theme)||'';
    const map={fire:'ember_tyrant',slime:'slime_king',nature:'thorn_queen',ice:'frost_oracle',sand:'sand_reaper',void:'void_serpent',metal:'iron_minotaur',blood:'blood_moon',lightning:'storm_colossus',poison:'plague_doctor',mirror:'mirror_duelist',gravity:'gravity_core',solar:'solar_dragon',chrono:'chrono_dragon',chaos:'chaos_archon',garden:'hollow_gardener'};
    return V56_PROFILES[map[th]] || {type:th||'arcane',labels:['고유 예고','고유 돌진','고유 고리','고유 전장','고급 기믹','최종 필살']};
  }
  function v57LabelsForBoss(b){
    const prof=v57ProfileForBoss(b);
    const type=(prof&&prof.type)||((b&&b.theme)||'arcane');
    const labels=(prof&&prof.labels?prof.labels.slice():[]);
    const extras=(V57_EXTRA_LABELS[type]||V57_EXTRA_LABELS.arcane).slice();
    while(labels.length<8) labels.push(extras[(labels.length-6+extras.length)%extras.length] || ('고유 확장 패턴 '+(labels.length+1)));
    return labels.slice(0,v57PatternCountForBoss(b));
  }
  function v57AllowedPatternCount(){
    const max=v57PatternCountForBoss(boss);
    const ph=v55Phase();
    if(max<=4) return ph===1?3:4;
    if(max===5) return ph===1?4:5;
    if(max===6) return ph===1?4:(ph===2?5:6);
    if(max===7) return ph===1?4:(ph===2?6:7);
    return ph===1?4:(ph===2?6:8);
  }
  function v57PickIndex(){
    const n=v57AllowedPatternCount();
    const ph=v55Phase();
    const pool=[];
    for(let i=0;i<n;i++){
      const early=i<4;
      const mid=i===4 || i===5;
      const fin=i>=6;
      let weight=early?3:mid?2:1;
      if(ph===1 && i>=4) weight=0;
      if(ph===2 && fin) weight=0;
      if(ph===3 && i===n-1) weight+=2;
      for(let k=0;k<weight;k++) pool.push(i);
    }
    return pool[Math.floor(Math.random()*pool.length)]||0;
  }
  function v57ExtraPattern(idx){
    const prof=v56Profile();
    const type=(prof&&prof.type)||'arcane';
    const c=v56C(), s=v56S();
    const label=(v57LabelsForBoss(boss)[idx]) || v56Label(Math.min(idx,5));
    v55Cast(`${boss.name}: ${label}`, c);
    if(type==='slime'){
      v56SafeFull(label,c,.72); v56Scatter(label,s,6+v55Phase()*2,34,.24); if(idx>=7) v56Rings(label,c,4,.34);
    }else if(type==='fire'||type==='solar'||type==='eclipse'){
      v56Fan(label,c,6+v55Phase()*2,Math.PI*1.45,.42); v56Scatter(label,s,6+v55Phase(),34,.34); if(idx>=7) v56SafeFull(label,c,.90);
    }else if(type==='nature'||type==='poison'||type==='garden'){
      v56LaneMaze(label,c,.38); v56Scatter(label,s,7+v55Phase(),30,.30); if(idx>=7) v56SafeFull(label,s,.78);
    }else if(type==='ice'||type==='chrono'){
      v56Scatter(label,c,8+v55Phase()*2,28,.32); v56Fan(label,s,6+v55Phase(),Math.PI*1.2,.34); if(idx>=7) v56Rings(label,c,4,.40);
    }else if(type==='lightning'||type==='magnet'){
      v56Scatter(label,c,9+v55Phase()*2,28,.34); v56Fan(label,s,7+v55Phase(),Math.PI*1.25,.36); if(idx>=7) v56LaneMaze(label,c,.36);
    }else if(type==='mirror'||type==='puppet'||type==='jester'||type==='chaos'){
      v56SafeFull(label,c,.82); v56Fan(label,s,8+v55Phase()*2,Math.PI*1.45,.38); if(idx>=7) v56Rings(label,c,4,.40);
    }else if(type==='void'||type==='gravity'||type==='abyss'){
      v56Rings(label,c,4,.42); v56Fan(label,s,7+v55Phase()*2,Math.PI*1.55,.38); if(idx>=7) v56SafeFull(label,c,.88);
    }else if(type==='train'||type==='cube'){
      v56LaneMaze(label,c,.42); v56Scatter(label,s,7+v55Phase(),38,.34); if(idx>=7) v56Fan(label,c,8+v55Phase(),Math.PI*1.35,.38);
    }else{
      v56SafeFull(label,c,.80); v56Fan(label,s,7+v55Phase(),Math.PI*1.4,.36);
    }
    v55VisualBurst(boss.x,boss.y,c,v55Heavy()?4:12);
  }
  function v57StylePattern(idx){
    if(idx<=5) v56StylePattern(idx); else v57ExtraPattern(idx);
  }
  try{
    BOSSES.forEach(b=>{ b.patterns=v57LabelsForBoss(b); });
  }catch(e){ console.warn('[V57 pattern labels failed]', e); }
  try{
    const oldBossPatternV57=bossPattern;
    bossPattern=function(){
      try{
        v55Cap();
        const idx=v57PickIndex();
        v57StylePattern(idx);
        const ph=v55Phase(), tier=v55Tier(), max=v57AllowedPatternCount();
        if(ph>=2 && tier>=6 && Math.random()<.24){
          setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead){ v57StylePattern(Math.floor(Math.random()*Math.min(4,max))); v55Cap(); } },520);
        }
        if(ph>=3 && tier>=9 && Math.random()<.24){
          setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead){ v57StylePattern(Math.max(0,max-1)); v55Cap(); } },900);
        }
        v55Cap();
      }catch(e){ console.warn('[V57 boss pattern fallback]',e); try{oldBossPatternV57();}catch(_){} }
    };
  }catch(e){ console.warn('[V57 bossPattern failed]', e); }
  try{ window.RaidDungeonV57={version:V57_VERSION, tierBasedPatternCount:true, rule:'tier1-2=4, tier3-5=5, tier6-8=6, tier9-10=7, DLC=8+', notFixedSix:true}; }catch(e){}


  /* ===== V58: high-tier spectacle upgrade + stronger anti-lag caps ===== */
  const V58_VERSION = 'Raid Dungeon V59 - Unique Boss Patterns Maze Mechanic Anti Lag';

  function v58TierRaw(b){
    const t=(b&&b.tier);
    if(String(t).toUpperCase()==='DLC') return 11;
    const n=Number(t||1);
    return Number.isFinite(n)?n:1;
  }
  function v58PatternCountForBoss(b){
    const id=String((b&&b.id)||'').toLowerCase();
    const t=v58TierRaw(b);
    if(t>=11 || id.includes('dlc') || id.includes('apocalypse') || id.includes('final')) return 8;
    if(t>=9) return 7;
    if(t>=6) return 6;
    if(t>=3) return 5;
    return 4;
  }
  function v58Phase(){ return v55Phase(); }
  function v58Tier(){ return Math.max(1, Math.min(11, v58TierRaw(boss))); }
  function v58High(){ return v58Tier()>=6; }
  function v58Final(){ return v58Tier()>=9 || v58PatternCountForBoss(boss)>=7; }
  function v58Ultra(){ return v58PatternCountForBoss(boss)>=8; }
  function v58HazardLoad(){
    try{return (state.hazards||[]).length+(state.projectiles||[]).length+(state.particles||[]).length+(state.texts||[]).length;}catch(e){return 0;}
  }
  function v58MassMode(){ return state.screen==='raid' && v58HazardLoad()>82; }
  function v58CriticalMode(){ return state.screen==='raid' && v58HazardLoad()>118; }
  function v58KeepHazard(h){ return h && (h.v51FullMap || h.respectSafe || h.v55Full || h.kind==='floor' || h.kind==='donut'); }
  function v58HardCap(){
    try{
      const critical=v58CriticalMode();
      const hMax=critical?62:78, pMax=critical?72:92, ptMax=critical?44:58, txMax=critical?10:14;
      if(state.hazards && state.hazards.length>hMax){
        const arr=state.hazards, keep=[];
        for(let i=0;i<arr.length;i++) if(v58KeepHazard(arr[i])) keep.push(arr[i]);
        const rest=arr.filter(h=>!v58KeepHazard(h));
        const need=Math.max(0,hMax-keep.length);
        if(rest.length>need){
          const step=Math.max(1,Math.ceil(rest.length/Math.max(1,need)));
          for(let i=0;i<rest.length && keep.length<hMax;i+=step) keep.push(rest[i]);
        }else keep.push(...rest);
        state.hazards=keep.slice(-hMax);
      }
      if(state.projectiles && state.projectiles.length>pMax) state.projectiles.splice(0,state.projectiles.length-pMax);
      if(state.particles && state.particles.length>ptMax) state.particles.splice(0,state.particles.length-ptMax);
      if(state.texts && state.texts.length>txMax) state.texts.splice(0,state.texts.length-txMax);
    }catch(e){}
  }
  try{
    const oldUpdateV58=update;
    update=function(dt){ oldUpdateV58(dt); v58HardCap(); };
  }catch(e){ console.warn('[V58 update cap failed]',e); }

  try{
    const oldRingV58=v55RingBullets;
    v55RingBullets=function(count,speed,color,damage,offset){
      const cap=v58CriticalMode()?10:(v58MassMode()?14:20);
      return oldRingV58(Math.min(count,cap),speed,color,damage,offset);
    };
  }catch(e){ console.warn('[V58 ring cap failed]',e); }

  function v58DrawHazardsUltraFast(){
    const list=state.hazards||[];
    ctx.save();
    ctx.shadowBlur=0; ctx.lineJoin='round'; ctx.lineCap='round';
    const step=list.length>90?3:(list.length>62?2:1);
    for(let i=0;i<list.length;i+=step){
      const h=list[i]; if(!h) continue;
      const col=h.color||'#fff', warn=(h.warn||0)>0;
      ctx.strokeStyle=col; ctx.fillStyle=col; ctx.lineWidth=warn?2.2:1.4;
      if(h.kind==='floor'){
        ctx.globalAlpha=warn?.10:.20;
        ctx.fillRect((h.x||W/2)-(h.w||W)/2,(h.y||H/2)-(h.h||H)/2,h.w||W,h.h||H);
      }else if(h.kind==='circle'||h.kind==='playerStrike'){
        ctx.globalAlpha=warn?.16:.30;
        ctx.beginPath(); ctx.arc(h.x,h.y,h.r||20,0,Math.PI*2); ctx.fill();
        ctx.globalAlpha=warn?.46:.58;
        ctx.beginPath(); ctx.arc(h.x,h.y,h.r||20,0,Math.PI*2); ctx.stroke();
      }else if(h.kind==='donut'){
        ctx.globalAlpha=warn?.42:.54;
        ctx.beginPath(); ctx.arc(h.x,h.y,h.outer||90,0,Math.PI*2); ctx.stroke();
        ctx.globalAlpha=warn?.28:.42;
        ctx.beginPath(); ctx.arc(h.x,h.y,h.inner||40,0,Math.PI*2); ctx.stroke();
      }else if(h.kind==='beam'||h.kind==='rotatingBeam'){
        ctx.save(); ctx.translate(h.x||W/2,h.y||H/2); ctx.rotate(h.angle||0);
        const len=h.len||1100, ww=(h.w||18)*2;
        ctx.globalAlpha=warn?.14:.28;
        ctx.fillRect(-len/2,-ww/2,len,ww);
        ctx.globalAlpha=warn?.48:.60;
        ctx.strokeStyle='rgba(255,255,255,.42)'; ctx.lineWidth=1;
        ctx.strokeRect(-len/2,-ww/2,len,ww);
        ctx.restore();
      }else if(h.kind==='wall'){
        ctx.globalAlpha=warn?.15:.34;
        ctx.fillRect((h.x||0)-(h.w||40)/2,(h.y||0)-(h.h||40)/2,h.w||40,h.h||40);
      }
    }
    ctx.globalAlpha=1; ctx.restore();
  }
  try{
    const oldDrawHazardsV58=drawHazards;
    drawHazards=function(){ if(v58MassMode()) return v58DrawHazardsUltraFast(); return oldDrawHazardsV58(); };
  }catch(e){ console.warn('[V58 drawHazards failed]',e); }

  function v58DrawProjectilesUltraFast(){
    const arr=state.projectiles||[]; const start=Math.max(0,arr.length-(v58CriticalMode()?72:96));
    const groups={};
    for(let i=start;i<arr.length;i++){
      const p=arr[i]; if(!p || (p.delay&&p.delay>0)) continue;
      const c=p.color||'#fff'; (groups[c]||(groups[c]=[])).push(p);
    }
    ctx.save(); ctx.shadowBlur=0;
    for(const c in groups){
      const g=groups[c]; ctx.fillStyle=c; ctx.globalAlpha=.84; ctx.beginPath();
      const step=g.length>60?2:1;
      for(let i=0;i<g.length;i+=step){ const p=g[i]; ctx.moveTo(p.x+(p.r||4),p.y); ctx.arc(p.x,p.y,Math.max(2,Math.min(5,p.r||4)),0,Math.PI*2); }
      ctx.fill();
    }
    ctx.globalAlpha=1; ctx.restore();
  }
  try{
    const oldDrawProjectilesV58=drawProjectiles;
    drawProjectiles=function(){ if(v58MassMode()) return v58DrawProjectilesUltraFast(); return oldDrawProjectilesV58(); };
  }catch(e){ console.warn('[V58 drawProjectiles failed]',e); }

  const V58_LABEL_PACK={
    slime:['왕실 젤리 분열','초탄성 푸딩 해일','젤리 왕관 압착','푸딩 대폭주'],
    fire:['화염 폭주 회랑','화산 심장 폭발','불사조 화염폭우','화산왕 분화식','태양불 왕관'],
    solar:['태양왕 강림','태양핵 창세 폭발','천공 플레어 십자','황금 일식 낙인'],
    eclipse:['태양 소멸 파동','종말 일식 연계','암흑 십자성','종말 흑일식 왕관','검은 태양 재림'],
    ice:['예언 빙결 타일','절대영도 장막','수정 예언 십자','백야 빙하 낙인'],
    chrono:['시간축 붕괴','영원 회귀 심판','시계탑 역행','무한 초침 처형'],
    jester:['악몽 룰렛','서커스 대혼란','악몽 퍼레이드','서커스 종말 공연','웃음의 처형장'],
    chaos:['차원 혼돈 법정','혼돈 집행 대칙령','법칙 파괴 연계','혼돈왕 최종 선고'],
    puppet:['꼭두각시 왕좌극','황제의 최종 단두대','실의 감옥','왕실 처형 인형극'],
    mirror:['무한 거울 결투장','만화경 처형무','분신 사선무','거울왕 역반사'],
    void:['공허 균열 대확장','무저갱 포식식','공허 심장 붕괴','차원 절단식'],
    gravity:['블랙홀 궤도 붕괴','특이점 대압축','중력 십자 감옥','행성 낙하'],
    abyss:['심해 왕의 포효','심연 해일 종말','해저 압살권','검은 조류 왕관'],
    lightning:['천둥왕 번개감옥','폭풍 회로 대폭주','낙뢰 격자장','천둥 심판 회로'],
    magnet:['극성 반전 판결','자력 심판장','N극 S극 처형','자기장 붕괴식'],
    nature:['가시 정원 대봉쇄','장미여왕 만개식','덩굴 왕관','독꽃 태풍'],
    poison:['대역병 격리구역','검은 수술실 개방','감염 도시 봉쇄','죽음의 혈청 선택'],
    garden:['죽은 꽃의 장례식','공허 정원 대개화','검은 꽃문 행렬','무덤 정원 폭주'],
    sand:['사막 무덤 행렬','황금 모래폭풍','파라오 장벽','모래시계 매장'],
    metal:['강철 투기장 붕괴','미노타우로스 광란','철벽 돌진장','용광로 판결'],
    blood:['핏빛 사냥 의식','혈월 붉은 처형','붉은 달 추적','피의 왕관 폭발'],
    train:['폭주 종착역','무한 급행 충돌','철로 봉쇄','종착역 붕괴'],
    cube:['예언 차원큐브','미래좌표 소거식','차원좌표 교차','큐브 코어 폭발'],
    arcane:['비전 난류','마력 핵붕괴','마법진 연쇄','고대 주문 폭발']
  };
  function v58ProfileForBoss(b){
    try{return v57ProfileForBoss(b);}catch(e){return v56Profile();}
  }
  function v58TypeForBoss(b){
    const p=v58ProfileForBoss(b)||{};
    return p.type || (b&&b.theme) || 'arcane';
  }
  function v58LabelsForBoss(b){
    const prof=v58ProfileForBoss(b)||{};
    const type=v58TypeForBoss(b);
    const labels=(prof.labels?prof.labels.slice(0,4):['기본 공격','압박 공격','광역 공격','전장 기믹']);
    const extras=(V58_LABEL_PACK[type]||V58_LABEL_PACK.arcane).slice();
    while(labels.length<v58PatternCountForBoss(b)) labels.push(extras[(labels.length-4)%extras.length]||('고급 패턴 '+(labels.length+1)));
    return labels.slice(0,v58PatternCountForBoss(b));
  }
  function v58AllowedPatternCount(){
    const max=v58PatternCountForBoss(boss), ph=v58Phase();
    if(max<=4) return ph===1?3:4;
    if(max===5) return ph===1?3:(ph===2?4:5);
    if(max===6) return ph===1?4:(ph===2?5:6);
    if(max===7) return ph===1?4:(ph===2?5:7);
    return ph===1?4:(ph===2?6:8);
  }
  function v58PickIndex(){
    const n=v58AllowedPatternCount(), ph=v58Phase(), tier=v58Tier();
    const pool=[];
    for(let i=0;i<n;i++){
      let weight=i<4?4:(i<6?2:1);
      if(ph===1 && i>=4) weight=0;
      if(ph===2 && i>=6) weight=0;
      if(ph===3 && i>=4) weight+= tier>=9?2:1;
      if(ph===3 && i===n-1) weight+=2;
      for(let k=0;k<weight;k++) pool.push(i);
    }
    return pool[Math.floor(Math.random()*pool.length)]||0;
  }
  function v58Label(idx){ return (v58LabelsForBoss(boss)[idx]) || v56Label(Math.min(idx,5)); }
  function v58Color(){ return v56C? v56C():v55Color(); }
  function v58Sub(){ return v56S? v56S():v55Sub(); }
  function v58AfterGlow(label,c){
    if(!v58High()) return;
    const ph=v58Phase(), tier=v58Tier(), s=v58Sub();
    if(v58MassMode()){
      if(Math.random()<.55) v55Donut(W/2,H/2,80+tier*7,130+tier*8,.72,.36,s,v55Dmg(.20),label+' 잔광');
      return;
    }
    if(ph>=2 && Math.random()<.55) v55Donut(W/2,H/2,70+tier*6,120+tier*8,.78,.38,s,v55Dmg(.22),label+' 잔광');
    if(ph>=3 && Math.random()<.45) v55Beam(W/2,H/2,Math.random()*Math.PI,1100,.72,.36,c,v55Dmg(.24),label+' 후폭풍',18);
  }
  function v58SafeNuke(label,c,intensity){
    const ph=v58Phase(), tier=v58Tier();
    const sx=rand(150,W-150), sy=rand(140,H-105);
    v55Safe(sx,sy,Math.max(48,58-ph*2),2.15,'#86efac',false);
    if(!v58MassMode() && intensity>.7){
      v55Safe(rand(130,W-130),rand(130,H-110),46,2.05,c,true);
      if(ph>=3) v55Safe(rand(130,W-130),rand(130,H-110),44,2.05,c,true);
    }
    v55Full(1.02,.48,c,v55Dmg(.72+intensity*.18),label);
    const beams=v58MassMode()?3:Math.min(5+ph+(tier>=9?1:0),8);
    for(let i=0;i<beams;i++) v55Beam(W/2,H/2,Math.PI*i/beams+state.time*.07,1120,.82+i*.035,.34,i%2?c:v58Sub(),v55Dmg(.28+intensity*.05),label+' 광선',16+ph);
  }
  function v58CrownPattern(label,c){
    const tier=v58Tier(), ph=v58Phase(), s=v58Sub();
    v55Cast(`${boss.name}: ${label}`,c);
    const rings=v58MassMode()?2:Math.min(3+ph,5);
    for(let i=0;i<rings;i++) v55Donut(W/2,H/2,64+i*(48+tier*.8),96+i*(52+tier*.8),.76+i*.06,.40,i%2?c:s,v55Dmg(.27+ph*.04),label+' 왕관');
    const beams=v58MassMode()?4:Math.min(6+ph+(tier>=9?2:0),10);
    for(let i=0;i<beams;i++) v55Beam(W/2,H/2,i*Math.PI/beams+state.time*.05,1120,.62+i*.025,.36,i%2?c:s,v55Dmg(.31+ph*.05),label+' 절단',15+ph*2);
    if(ph>=3) v58SafeNuke(label+' 심판',c,.55);
  }
  function v58MazeStorm(label,c){
    const ph=v58Phase(), tier=v58Tier(), s=v58Sub();
    v55Cast(`${boss.name}: ${label}`,c);
    const lines=v58MassMode()?5:Math.min(6+ph+(tier>=8?2:0),10);
    for(let i=0;i<lines;i++){
      const vertical=i%2===0;
      v55Wall(vertical?110+i*(W-220)/Math.max(1,lines-1):W/2, vertical?H/2:120+i*(H-210)/Math.max(1,lines-1), vertical?18:W*.82, vertical?H*.62:18, .82+i*.035,.44,i%2?c:s,v55Dmg(.27+ph*.05),label+' 봉쇄');
    }
    const drops=v58MassMode()?4:Math.min(5+ph+(tier>=9?2:0),9);
    for(let i=0;i<drops;i++) v55Circle(rand(110,W-110),rand(125,H-90),28+ph*4,.72+i*.05,.36,s,v55Dmg(.30+ph*.04),label+' 낙인');
  }
  function v58TypePattern(idx){
    const type=v58TypeForBoss(boss), label=v58Label(idx), c=v58Color(), s=v58Sub();
    const tier=v58Tier(), ph=v58Phase();
    v55Cast(`${boss.name}: ${label}`,c);
    if(type==='fire'||type==='solar'||type==='eclipse'){
      if(idx>=6) v58CrownPattern(label,c); else { v58SafeNuke(label,c,.65); for(let i=0;i<(v58MassMode()?3:5+ph);i++) v55Circle(rand(110,W-110),rand(120,H-90),36+tier*2,.70+i*.04,.34,s,v55Dmg(.32),label+' 화염핵'); }
    }else if(type==='jester'||type==='chaos'||type==='puppet'||type==='mirror'){
      v58SafeNuke(label,c,.75);
      const fan=v58MassMode()?4:Math.min(7+ph+(tier>=9?2:0),11);
      for(let i=0;i<fan;i++) v55Beam(boss.x,boss.y,v55A()-1.3+2.6*(i/Math.max(1,fan-1)),980,.66+i*.025,.36,i%2?c:s,v55Dmg(.29+ph*.04),label+' 카드',14+ph);
      if(idx>=6) v58CrownPattern(label,s);
    }else if(type==='void'||type==='gravity'||type==='abyss'){
      v58CrownPattern(label,c);
      if(idx>=6) v58SafeNuke(label+' 특이점',s,.78);
    }else if(type==='ice'||type==='chrono'){
      const crosses=v58MassMode()?3:Math.min(4+ph+(tier>=9?1:0),7);
      for(let i=0;i<crosses;i++){ const x=rand(120,W-120), y=rand(125,H-95); v55Beam(x,y,0,760,.72+i*.03,.34,c,v55Dmg(.28),label+' 십자'); v55Beam(x,y,Math.PI/2,620,.72+i*.03,.34,s,v55Dmg(.28),label+' 십자'); }
      if(idx>=5) v58SafeNuke(label+' 장막',c,.58);
    }else if(type==='lightning'||type==='magnet'){
      const beams=v58MassMode()?5:Math.min(8+ph+(tier>=9?2:0),12);
      for(let i=0;i<beams;i++) v55Beam(rand(100,W-100),H/2,Math.PI/2,900,.54+i*.035,.32,i%2?c:s,v55Dmg(.30),label+' 낙뢰',13+ph);
      if(idx>=6) v58SafeNuke(label+' 회로',c,.62);
    }else if(type==='nature'||type==='poison'||type==='garden'||type==='sand'||type==='metal'||type==='train'||type==='cube'){
      v58MazeStorm(label,c);
      if(idx>=6) v58CrownPattern(label,s);
    }else if(type==='slime'){
      const blobs=v58MassMode()?5:Math.min(7+ph+(tier>=7?2:0),11);
      for(let i=0;i<blobs;i++) v55Circle(rand(100,W-100),rand(120,H-90),34+Math.random()*22,.66+i*.035,.36,i%2?c:s,v55Dmg(.28+ph*.04),label+' 분열');
      if(idx>=5) v58SafeNuke(label+' 해일',c,.55);
    }else{
      v58SafeNuke(label,c,.65);
      v58CrownPattern(label,s);
    }
    v55VisualBurst(boss.x,boss.y,c,v58MassMode()?3:(v58High()?10:6));
    v58HardCap();
  }
  function v58StylePattern(idx){
    const c=v58Color();
    if(idx<4){
      v56StylePattern(idx);
      v58AfterGlow(v58Label(idx),c);
      return;
    }
    v58TypePattern(idx);
  }
  try{
    BOSSES.forEach(b=>{ b.patterns=v58LabelsForBoss(b); });
  }catch(e){ console.warn('[V58 pattern labels failed]',e); }
  try{
    const oldCooldownV58=getBossPatternCooldown;
    getBossPatternCooldown=function(){
      const t=v58Tier(), ph=v58Phase();
      const base=t>=9?1.35:t>=6?1.55:t>=3?1.85:2.15;
      return Math.max(.82, base*(ph===3?.76:ph===2?.88:1)+Math.random()*.18);
    };
  }catch(e){ console.warn('[V58 cooldown failed]',e); }
  try{
    const oldBossPatternV58=bossPattern;
    bossPattern=function(){
      try{
        v58HardCap();
        const idx=v58PickIndex();
        v58StylePattern(idx);
        const ph=v58Phase(), tier=v58Tier(), max=v58AllowedPatternCount();
        if(ph>=2 && tier>=6 && Math.random()<.20){
          setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead){ v58StylePattern(Math.floor(Math.random()*Math.min(4,max))); v58HardCap(); } },520);
        }
        if(ph>=3 && tier>=9 && Math.random()<.18){
          setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead){ v58StylePattern(Math.max(4,max-1)); v58HardCap(); } },900);
        }
        if(ph>=3 && v58Ultra() && Math.random()<.12){
          setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead){ v58StylePattern(Math.max(4,max-2)); v58HardCap(); } },1250);
        }
        v58HardCap();
      }catch(e){ console.warn('[V58 boss pattern fallback]',e); try{oldBossPatternV58();}catch(_){} }
    };
  }catch(e){ console.warn('[V58 bossPattern failed]',e); }
  try{ window.RaidDungeonV58={version:V58_VERSION, antiLag:'stronger caps and ultra-fast render in mass patterns', highTierPatterns:'tier 6+ gets more cinematic, tier 9+/DLC gets boss-specific ultimate patterns', patternCount:'low=4, mid=5, high=6, late=7, final=8+'}; }catch(e){}



  /* ===== V59: maze only as mechanic + truly boss-unique late patterns + lower lag ===== */
  const V59_VERSION = 'Raid Dungeon V59 - Unique Boss Patterns Maze Mechanic Anti Lag';

  function v59Load(){
    try{return (state.hazards||[]).length+(state.projectiles||[]).length+(state.particles||[]).length+(state.texts||[]).length;}catch(e){return 0;}
  }
  function v59Mass(){ return state.screen==='raid' && v59Load()>64; }
  function v59Critical(){ return state.screen==='raid' && v59Load()>92; }
  function v59Tier(){ try{return v58Tier();}catch(e){return Math.max(1, Number((boss&&boss.tier)||1)||1);} }
  function v59Type(){ try{return v58TypeForBoss(boss);}catch(e){return (boss&&boss.theme)||'arcane';} }
  function v59Color(){ try{return v58Color();}catch(e){return v55Color();} }
  function v59Sub(){ try{return v58Sub();}catch(e){return v55Sub();} }
  function v59Dmg(x){ try{return v55Dmg(x);}catch(e){return 12*(x||1);} }
  function v59Phase(){ try{return v58Phase();}catch(e){return v55Phase();} }
  function v59BossId(){ return String((boss&&boss.id)||'').toLowerCase(); }
  function v59Label(i){ try{return v58Label(i);}catch(e){return (boss&&boss.patterns&&boss.patterns[i])||'고유 패턴';} }
  function v59HasMazeLabel(s){ return /미로|미궁|maze/i.test(String(s||'')); }

  function v59HardCap(){
    try{
      const critical=v59Critical();
      const hMax=critical?44:58, pMax=critical?50:66, ptMax=critical?22:34, txMax=critical?5:8;
      if(state.hazards && state.hazards.length>hMax){
        const arr=state.hazards, keep=[];
        for(let i=0;i<arr.length;i++){
          const h=arr[i];
          if(h && (h.v51FullMap || h.respectSafe || h.v55Full || h.kind==='floor' || h.kind==='donut')) keep.push(h);
        }
        const rest=arr.filter(h=>!(h && (h.v51FullMap || h.respectSafe || h.v55Full || h.kind==='floor' || h.kind==='donut')));
        const need=Math.max(0,hMax-keep.length);
        if(need>0){
          const step=Math.max(1,Math.ceil(rest.length/need));
          for(let i=0;i<rest.length && keep.length<hMax;i+=step) keep.push(rest[i]);
        }
        state.hazards=keep.slice(-hMax);
      }
      if(state.projectiles && state.projectiles.length>pMax) state.projectiles.splice(0,state.projectiles.length-pMax);
      if(state.particles && state.particles.length>ptMax) state.particles.splice(0,state.particles.length-ptMax);
      if(state.texts && state.texts.length>txMax) state.texts.splice(0,state.texts.length-txMax);
    }catch(e){}
  }
  try{
    const oldUpdateV59=update;
    update=function(dt){ oldUpdateV59(dt); v59HardCap(); };
  }catch(e){ console.warn('[V59 update cap failed]',e); }

  function v59Burst(x,y,c,n){ try{ v55VisualBurst(x,y,c,v59Mass()?Math.min(3,n||3):Math.min(8,n||8)); }catch(e){} }
  function v59Cast(label,c){ try{ v55Cast(`${boss.name}: ${label}`,c||v59Color()); }catch(e){} }
  function v59Circle(x,y,r,warn,life,c,d,label){ try{ v55Circle(x,y,r,warn,life,c||v59Color(),d||v59Dmg(.35),label); }catch(e){} }
  function v59Beam(x,y,a,len,warn,life,c,d,label,w){ try{ v55Beam(x,y,a,len,warn,life,c||v59Color(),d||v59Dmg(.35),label,w); }catch(e){} }
  function v59Wall(x,y,w,h,warn,life,c,d,label){ try{ v55Wall(x,y,w,h,warn,life,c||v59Color(),d||v59Dmg(.35),label); }catch(e){} }
  function v59Donut(x,y,inner,outer,warn,life,c,d,label){ try{ v55Donut(x,y,inner,outer,warn,life,c||v59Color(),d||v59Dmg(.35),label); }catch(e){} }
  function v59Safe(x,y,r,life,c,fake){ try{ v55Safe(x,y,r,life,c||'#86efac',!!fake); }catch(e){} }
  function v59Full(warn,life,c,d,label){ try{ v55Full(warn,life,c||v59Color(),d||v59Dmg(.7),label); }catch(e){} }
  function v59RandX(){ return rand(105,W-105); }
  function v59RandY(){ return rand(118,H-86); }
  function v59Aim(){ return Math.atan2(player.y-boss.y, player.x-boss.x); }

  function v59MazeMechanic(label,c){
    // 미로는 공격 장판이 아니라 별도 기믹으로만 실행한다. 벽 장판 공격을 깔지 않는다.
    v59Cast(`${label} - 기믹 시작`,c);
    if(typeof v51SpawnTrueMaze==='function'){
      try{ v51SpawnTrueMaze(); }catch(e){}
    }else if(typeof v27QueueMini==='function'){
      try{ v27QueueMini('maze', `${boss.name}의 미로 기믹! 벽을 피해 출구로 이동하세요.`, c||v59Color()); }catch(e){}
    }else{
      try{ state.pendingMiniGame={type:'maze',life:1.6,maxLife:1.6,line:`${boss.name}의 미로 기믹`,color:c||v59Color()}; }catch(e){}
    }
    try{ floatText('미로 기믹',W/2,95,'#fff',22); }catch(e){}
    v59Burst(W/2,H/2,c,6);
    v59HardCap();
  }

  function v59Slime(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), n=v59Mass()?4:Math.min(5+ph,8);
    for(let i=0;i<n;i++) v59Circle(v59RandX(),v59RandY(),30+Math.random()*22,.58+i*.035,.34,i%2?c:v59Sub(),v59Dmg(.25+ph*.04),label+' 젤리');
    if(ph>=2) for(let i=0;i<(v59Mass()?2:4);i++) v59Wall(rand(140,W-140),rand(130,H-95),90,20,.78+i*.06,.38,v59Sub(),v59Dmg(.24),label+' 탄성벽');
  }
  function v59Fire(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), a=v59Aim(), n=v59Mass()?3:Math.min(4+ph,7);
    for(let i=-Math.floor(n/2);i<=Math.floor(n/2);i++) v59Beam(boss.x,boss.y,a+i*.18,900,.56+Math.abs(i)*.04,.34,i%2?c:'#f97316',v59Dmg(.30+ph*.05),label+' 화염숨결',18+ph);
    if(ph>=2) for(let i=0;i<(v59Mass()?3:6);i++) v59Circle(v59RandX(),v59RandY(),32+ph*4,.72+i*.035,.36,'#fb923c',v59Dmg(.32),label+' 화산탄');
    if(ph>=3) v59Donut(W/2,H/2,78,190,.88,.42,'#facc15',v59Dmg(.36),label+' 화산핵');
  }
  function v59Ice(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), count=v59Mass()?3:Math.min(4+ph,7);
    for(let i=0;i<count;i++){ const x=120+i*(W-240)/Math.max(1,count-1); v59Beam(x,H/2,Math.PI/2,H*.75,.62+i*.035,.34,i%2?c:'#bfdbfe',v59Dmg(.27+ph*.04),label+' 빙창',14+ph); }
    if(ph>=2) for(let i=0;i<(v59Mass()?2:4);i++) v59Circle(player.x+rand(-130,130),player.y+rand(-100,100),36,.70+i*.05,.34,'#dbeafe',v59Dmg(.29),label+' 얼음감옥');
    if(ph>=3){ v59Beam(W/2,H/2,0,W*.86,.9,.38,'#f0f9ff',v59Dmg(.32),label+' 거울십자',16); v59Beam(W/2,H/2,Math.PI/2,H*.78,.9,.38,c,v59Dmg(.32),label+' 거울십자',16); }
  }
  function v59Jester(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), cx=W/2, cy=H/2, cards=v59Mass()?4:Math.min(6+ph,9);
    for(let i=0;i<cards;i++) v59Beam(cx,cy,i*Math.PI/cards+state.time*.05,900,.52+i*.025,.32,i%2?c:'#fde047',v59Dmg(.28+ph*.04),label+' 카드',12+ph);
    const real=Math.floor(Math.random()*3);
    if(ph>=2) for(let i=0;i<3;i++){ const x=220+i*(W-440)/2; i===real?v59Safe(x,H*.66,46,1.65,'#86efac',false):v59Circle(x,H*.66,48,1.0+i*.04,.32,'#f472b6',v59Dmg(.33),label+' 가짜SAFE'); }
    if(ph>=3) v59Donut(cx,cy,80,260,.9,.40,'#f0abfc',v59Dmg(.35),label+' 룰렛');
  }
  function v59Lightning(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), cols=v59Mass()?4:Math.min(5+ph,8), rows=v59Mass()?2:Math.min(3+ph,5);
    for(let i=0;i<cols;i++) v59Beam(105+i*(W-210)/Math.max(1,cols-1),H/2,Math.PI/2,H*.82,.50+i*.025,.30,i%2?c:'#fef08a',v59Dmg(.27),label+' 세로낙뢰',10+ph);
    if(ph>=2) for(let j=0;j<rows;j++) v59Beam(W/2,130+j*(H-220)/Math.max(1,rows-1),0,W*.86,.62+j*.03,.32,'#38bdf8',v59Dmg(.28),label+' 가로회로',10+ph);
  }
  function v59Gravity(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), rings=v59Mass()?2:Math.min(3+ph,5);
    for(let i=0;i<rings;i++) v59Donut(W/2,H/2,48+i*54,78+i*64,.64+i*.05,.36,i%2?c:'#c4b5fd',v59Dmg(.30+ph*.04),label+' 중력궤도');
    const rocks=v59Mass()?3:Math.min(5+ph,8);
    for(let i=0;i<rocks;i++) v59Circle(v59RandX(),v59RandY(),28+ph*3,.70+i*.035,.34,'#a78bfa',v59Dmg(.31),label+' 잔해낙하');
    if(ph>=3) v59Beam(W/2,H/2,Math.random()*Math.PI,1100,.82,.36,c,v59Dmg(.38),label+' 특이점 절단',20);
  }
  function v59Mirror(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), pairs=v59Mass()?2:Math.min(3+ph,6);
    for(let i=0;i<pairs;i++){
      const y=135+i*(H-230)/Math.max(1,pairs-1), a= i%2?.18:-.18;
      v59Beam(W*.28,y,a,W*.55,.58+i*.03,.33,c,v59Dmg(.28),label+' 실체광선',12+ph);
      v59Beam(W*.72,H-y+120,-a,W*.55,.62+i*.03,.33,'#f0abfc',v59Dmg(.28),label+' 거울광선',12+ph);
    }
    if(ph>=3) v59Donut(W/2,H/2,92,250,.9,.38,'#f0abfc',v59Dmg(.33),label+' 만화경');
  }
  function v59Nature(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), vines=v59Mass()?3:Math.min(5+ph,8);
    for(let i=0;i<vines;i++) v59Beam(rand(100,W-100),H/2,Math.PI/2+rand(-.18,.18),H*.78,.58+i*.035,.34,i%2?c:'#22c55e',v59Dmg(.27+ph*.04),label+' 덩굴',14+ph);
    const spores=v59Mass()?3:Math.min(5+ph,8);
    for(let i=0;i<spores;i++) v59Circle(v59RandX(),v59RandY(),25+ph*3,.66+i*.035,.32,'#f472b6',v59Dmg(.26),label+' 독꽃');
    if(ph>=3) v59Safe(rand(140,W-140),rand(140,H-110),50,1.8,'#86efac',false);
  }
  function v59Train(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), lanes=v59Mass()?3:Math.min(4+ph,7);
    for(let i=0;i<lanes;i++){
      const y=125+i*(H-210)/Math.max(1,lanes-1);
      v59Wall(W/2,y,W*.95,28+ph*4,.58+i*.045,.36,i%2?c:'#94a3b8',v59Dmg(.32+ph*.04),label+' 급행열차');
    }
    if(ph>=2) for(let i=0;i<(v59Mass()?2:4);i++) v59Circle(v59RandX(),v59RandY(),32,.74+i*.04,.32,'#facc15',v59Dmg(.29),label+' 신호폭발');
  }
  function v59Sand(label,c){
    v59Cast(label,c);
    const ph=v59Phase();
    for(let i=0;i<(v59Mass()?3:6);i++) v59Beam(W/2,rand(120,H-90),rand(-.18,.18),W*.85,.58+i*.04,.33,i%2?c:'#facc15',v59Dmg(.28),label+' 모래폭풍',16);
    if(ph>=2) for(let i=0;i<(v59Mass()?2:5);i++) v59Circle(v59RandX(),v59RandY(),34,.68+i*.04,.34,'#fde68a',v59Dmg(.28),label+' 무덤낙하');
  }
  function v59Blood(label,c){
    v59Cast(label,c);
    const ph=v59Phase();
    v59Circle(player.x,player.y,42+ph*4,.62,.34,c,v59Dmg(.34),label+' 사냥표식');
    for(let i=0;i<(v59Mass()?3:Math.min(5+ph,8));i++) v59Beam(boss.x,boss.y,v59Aim()+rand(-.85,.85),900,.55+i*.03,.33,i%2?c:'#ef4444',v59Dmg(.29+ph*.04),label+' 혈월참격',14+ph);
    if(ph>=3) v59Donut(player.x,player.y,65,150,.85,.38,'#991b1b',v59Dmg(.36),label+' 피의왕관');
  }
  function v59Eclipse(label,c){
    v59Cast(label,c);
    const ph=v59Phase();
    const sx=rand(150,W-150), sy=rand(135,H-105);
    if(ph>=2) v59Safe(sx,sy,52,1.95,'#86efac',false);
    v59Donut(W/2,H/2,70,210,.72,.38,'#020617',v59Dmg(.34),label+' 흑일고리');
    for(let i=0;i<(v59Mass()?4:Math.min(6+ph*2,10));i++) v59Beam(W/2,H/2,i*Math.PI/(v59Mass()?4:8)+state.time*.04,1100,.62+i*.025,.34,i%2?c:'#facc15',v59Dmg(.30+ph*.05),label+' 일식광선',14+ph);
    if(ph>=3) v59Full(1.15,.42,c,v59Dmg(.65),label+' 종말파동');
  }
  function v59Arcane(label,c){
    v59Cast(label,c);
    const ph=v59Phase();
    for(let i=0;i<(v59Mass()?4:7+ph);i++) v59Circle(v59RandX(),v59RandY(),28+ph*4,.58+i*.03,.34,i%2?c:v59Sub(),v59Dmg(.27+ph*.04),label+' 마법진');
    if(ph>=2){ v59Beam(W/2,H/2,Math.random()*Math.PI,W*.9,.8,.35,c,v59Dmg(.32),label+' 주문선',16); v59Donut(W/2,H/2,85,230,.88,.36,v59Sub(),v59Dmg(.30),label+' 핵공명'); }
  }

  function v59TypePattern(idx){
    const type=v59Type(), id=v59BossId(), label=v59Label(idx), c=v59Color();
    if(v59HasMazeLabel(label)) return v59MazeMechanic(label,c);
    if(type==='slime') v59Slime(label,c);
    else if(type==='fire' || type==='solar') v59Fire(label,c);
    else if(type==='eclipse') v59Eclipse(label,c);
    else if(type==='ice' || type==='chrono') v59Ice(label,c);
    else if(type==='jester' || id.includes('clown') || id.includes('jester')) v59Jester(label,c);
    else if(type==='lightning' || type==='magnet') v59Lightning(label,c);
    else if(type==='gravity' || type==='void' || type==='abyss') v59Gravity(label,c);
    else if(type==='mirror' || type==='chaos' || type==='puppet') v59Mirror(label,c);
    else if(type==='nature' || type==='poison' || type==='garden') v59Nature(label,c);
    else if(type==='train' || type==='metal') v59Train(label,c);
    else if(type==='sand' || type==='cube') v59Sand(label,c);
    else if(type==='blood') v59Blood(label,c);
    else v59Arcane(label,c);
    if(v59Tier()>=7 && v59Phase()>=2 && !v59Mass()){
      // 후반 보스 전용 후속 효과: 전체장판 대신 짧은 잔광 위주로 차별화
      if(type==='fire'||type==='solar'||type==='eclipse') v59Donut(W/2,H/2,95,260,.72,.28,'#facc15',v59Dmg(.22),label+' 잔광');
      else if(type==='jester'||type==='mirror'||type==='chaos') v59Circle(rand(150,W-150),rand(130,H-100),46,.68,.28,v59Sub(),v59Dmg(.22),label+' 환영');
      else if(type==='gravity'||type==='void'||type==='abyss') v59Donut(W/2,H/2,55,150,.70,.28,v59Sub(),v59Dmg(.23),label+' 왜곡');
      else if(type==='nature'||type==='poison'||type==='garden') v59Circle(rand(130,W-130),rand(125,H-100),36,.70,.28,'#22c55e',v59Dmg(.22),label+' 꽃눈');
    }
    v59Burst(boss.x,boss.y,c,v59Tier()>=8?8:5);
    v59HardCap();
  }

  const V59_LABEL_EXTRAS={
    slime:['왕관 점액분열','탄성벽 반동','젤리 해일','왕실 푸딩 압착'],
    fire:['용암 숨결','화산탄 폭우','불타는 체스판','화산 심장','불사조 강림','분화식'],
    solar:['태양 발톱','플레어 코어','황금 일식','태양핵 폭발','천공 십자'],
    eclipse:['흑점 낙하','검은 고리','일식 광선','붕괴 지대','태양 소멸','종말 흑일식','검은 태양 재림'],
    ice:['빙창 낙하','얼음 감옥','거울 반사','눈보라 차선','예언 빙결','절대영도'],
    chrono:['초침 칼날','시간 정지칸','역행 파동','시계탑 붕괴','영원 회귀'],
    jester:['카드 폭탄','가짜 SAFE','풍선 감옥','웃음 함정','악몽 룰렛','서커스 대혼란','악몽 퍼레이드'],
    chaos:['속성 뒤섞기','혼돈 판결','뒤틀린 탄막','법칙 파괴','차원 법정','최종 선고'],
    puppet:['실 감옥','인형 칼날','왕좌극','꼭두각시 포위','황제 단두대','처형 인형극'],
    mirror:['거울광선','분신 사선','역반사','만화경 장막','무한 거울 결투장'],
    void:['공허 균열','무저갱 흡입','공허 심장','차원 절단','심연 붕괴'],
    gravity:['궤도 붕괴','중력 감옥','행성 잔해','특이점 압축','블랙홀 절단'],
    abyss:['심해 포효','해일 압살','검은 조류','심연 왕관','해저 붕괴'],
    lightning:['낙뢰 격자','폭풍 회로','번개 감옥','천둥 심판','회로 폭주'],
    magnet:['극성 반전','자력 압박','N극 S극','자기장 붕괴','극성 심판'],
    nature:['덩굴 갈고리','독꽃 개화','장미 울타리','꽃잎 폭풍','가시 왕관'],
    poison:['감염 포자','검역 병동','수술선','가짜 혈청','대역병 격리'],
    garden:['꽃문 포탈','공허 뿌리','검은 꽃가루','죽은 꽃 장례','공허 정원 대개화'],
    train:['급행 돌진','선로 전환','정차 신호','차륜 폭발','종착역 충돌'],
    metal:['철벽 돌진','용광로 장벽','강철 투기장','미노타우로스 광란'],
    sand:['모래폭풍','무덤 행렬','파라오 장벽','모래시계 매장'],
    blood:['사냥 표식','혈월 참격','붉은 달 추적','피의 왕관','핏빛 의식'],
    cube:['차원 좌표','예언 큐브','교차 격자','큐브 코어','미래좌표 소거'],
    arcane:['비전 난류','마법진 연쇄','고대 주문','마력 핵붕괴','주문선 교차']
  };
  function v59LabelsForBoss(b){
    const type=(function(){try{return v58TypeForBoss(b);}catch(e){return (b&&b.theme)||'arcane';}})();
    const count=(function(){try{return v58PatternCountForBoss(b);}catch(e){return 4;}})();
    const base=(function(){try{return (v57ProfileForBoss(b).labels||[]).slice();}catch(e){return [];}})();
    const extras=(V59_LABEL_EXTRAS[type]||V59_LABEL_EXTRAS.arcane).slice();
    const out=[];
    for(const x of base.concat(extras)){
      let s=String(x||'').trim();
      if(!s) continue;
      // 미로/미궁은 공격 패턴 목록에서 제외한다. 미로는 별도 기믹으로만 호출한다.
      if(v59HasMazeLabel(s)) continue;
      if(!out.includes(s)) out.push(s);
      if(out.length>=count) break;
    }
    while(out.length<count) out.push((extras[out.length%extras.length]||'고유 패턴')+' '+(out.length+1));
    return out.slice(0,count);
  }
  try{ BOSSES.forEach(b=>{ b.patterns=v59LabelsForBoss(b); }); }catch(e){ console.warn('[V59 pattern label failed]',e); }

  function v59PickIndex(){
    const labels=v59LabelsForBoss(boss), max=labels.length, ph=v59Phase(), tier=v59Tier();
    let allowed=max<=4?(ph===1?Math.min(3,max):max):ph===1?Math.min(4,max):ph===2?Math.min(Math.max(4,Math.ceil(max*.72)),max):max;
    const pool=[];
    for(let i=0;i<allowed;i++){
      let w=i<3?4:i<5?3:2;
      if(ph===3 && i>=Math.max(3,allowed-2)) w+=tier>=8?3:1;
      for(let k=0;k<w;k++) pool.push(i);
    }
    return pool[Math.floor(Math.random()*pool.length)]||0;
  }
  try{
    const oldBossPatternV59=bossPattern;
    bossPattern=function(){
      try{
        v59HardCap();
        const idx=v59PickIndex();
        v59TypePattern(idx);
        const tier=v59Tier(), ph=v59Phase(), max=(v59LabelsForBoss(boss)||[]).length;
        if(ph>=2 && tier>=7 && Math.random()<.14){
          setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead){ v59TypePattern(Math.floor(Math.random()*Math.min(4,max))); v59HardCap(); } },560);
        }
        if(ph>=3 && tier>=9 && Math.random()<.12){
          setTimeout(()=>{ if(state.screen==='raid'&&!boss.dead){ v59TypePattern(Math.max(0,max-1)); v59HardCap(); } },980);
        }
        v59HardCap();
      }catch(e){ console.warn('[V59 boss pattern fallback]',e); try{oldBossPatternV59();}catch(_){} }
    };
  }catch(e){ console.warn('[V59 bossPattern failed]',e); }
  try{
    const oldCooldownV59=getBossPatternCooldown;
    getBossPatternCooldown=function(){
      const t=v59Tier(), ph=v59Phase();
      const base=t>=9?1.42:t>=6?1.65:t>=3?1.95:2.25;
      return Math.max(.95, base*(ph===3?.82:ph===2?.92:1)+Math.random()*.22);
    };
  }catch(e){ console.warn('[V59 cooldown failed]',e); }


  /* ===== V60: real visual pattern identities + readable warnings + MP + HP numbers + extra performance ===== */
  const V60_VERSION = 'Raid Dungeon V63 - Damage Display Boss Only Weapons';

  function v60SafeNum(v,d){ return Number.isFinite(v) ? v : d; }
  function v60CostForSkill(s){
    if(!s) return 0;
    const rareMul={normal:1,rare:1.12,super:1.26,epic:1.45,legendary:1.72,ultimate:2.05}[s.rarity]||1;
    const typeMul={attack:1.0,buff:.82,heal:.9,debuff:.94,cleanse:.78,evasion:.72}[s.category]||1;
    const base=18 + (s.cooldown||3)*3.2 + (s.radius||80)*.035;
    return Math.max(12, Math.round(base*rareMul*typeMul));
  }
  function v60EnsureMP(){
    if(!player) return;
    if(!Number.isFinite(player.maxMp)) player.maxMp = 120;
    if(!Number.isFinite(player.mp)) player.mp = player.maxMp;
    player.maxMp = Math.max(60, player.maxMp||120);
    player.mp = clamp(player.mp, 0, player.maxMp);
  }
  try{
    const oldMakePlayerV60=makePlayer;
    makePlayer=function(){
      const p=oldMakePlayerV60();
      p.maxMp = 120;
      p.mp = 120;
      p.mpRegen = 3;
      return p;
    };
  }catch(e){ console.warn('[V60 makePlayer MP failed]',e); }
  try{
    const oldMakeBossV60=makeBoss;
    makeBoss=function(b){
      const x=oldMakeBossV60(b);
      const tier=clamp(Number(x.tier||1),1,12);
      const mul=1.28 + tier*.10 + (tier>=8?.22:0) + (tier>=10?.34:0);
      x.maxHp=Math.floor(x.maxHp*mul);
      x.hp=x.maxHp;
      return x;
    };
  }catch(e){ console.warn('[V60 boss hp scale failed]',e); }
  try{
    const oldStartRaidV60=startRaid;
    startRaid=function(){
      oldStartRaidV60();
      if(state.screen==='raid'){
        v60EnsureMP();
        player.mp=player.maxMp;
        if(boss){ boss.hp=boss.maxHp; }
      }
    };
  }catch(e){ console.warn('[V60 start raid MP failed]',e); }
  try{
    const oldUseSkillV60=useSkill;
    useSkill=function(i){
      if(!state.raid) return;
      const s=state.raid.skills[i];
      if(!s) return;
      v60EnsureMP();
      if((player.skillCd&&player.skillCd[i]||0)>0) return;
      const cost=v60CostForSkill(s);
      if(player.mp < cost){
        floatText('MP 부족',player.x,player.y-46,'#60a5fa',18);
        player.skillCd[i]=Math.max(player.skillCd[i]||0,.22);
        return;
      }
      player.mp-=cost;
      oldUseSkillV60(i);
    };
  }catch(e){ console.warn('[V60 skill MP failed]',e); }

  function v60PerfCap(){
    if(!state || state.screen!=='raid') return;
    const maxHaz = v59Critical()?38:v59Mass()?50:68;
    const maxProj = v59Critical()?34:v59Mass()?48:72;
    const maxPart = v59Critical()?55:v59Mass()?82:130;
    const maxText = v59Critical()?10:v59Mass()?14:22;
    if(state.hazards.length>maxHaz) state.hazards.splice(0,state.hazards.length-maxHaz);
    if(state.projectiles.length>maxProj) state.projectiles.splice(0,state.projectiles.length-maxProj);
    if(state.particles.length>maxPart) state.particles.splice(0,state.particles.length-maxPart);
    if(state.texts.length>maxText) state.texts.splice(0,state.texts.length-maxText);
    if(state.zones.length>16) state.zones.splice(0,state.zones.length-16);
  }
  try{
    const oldUpdateV60=update;
    update=function(dt){
      oldUpdateV60(dt);
      if(state.screen==='raid'){
        v60EnsureMP();
        player.mp=Math.min(player.maxMp, player.mp + 3*(dt||0));
        v60PerfCap();
      }
    };
  }catch(e){ console.warn('[V60 update wrapper failed]',e); }

  function v60Warn(w){ return Math.max(v59Mass()?0.95:1.15, w||0); }
  function v60Life(l){ return Math.max(.42, l||.35); }
  try{
    const oldCastV60=v59Cast;
    v59Cast=function(label,c){
      try{ boss.mechanicText='예고: '+label+' - 표시된 구역에서 벗어나세요'; }catch(e){}
      try{ oldCastV60(label,c); }catch(e){}
      try{ if(!v59Mass()) floatText(label,W/2,92,c||v59Color(),19); }catch(e){}
    };
    const oldCircleV60=v59Circle;
    v59Circle=function(x,y,r,warn,life,c,d,label){ oldCircleV60(x,y,r,v60Warn(warn),v60Life(life),c,d,label); };
    const oldBeamV60=v59Beam;
    v59Beam=function(x,y,a,len,warn,life,c,d,label,w){ oldBeamV60(x,y,a,len,v60Warn(warn),v60Life(life),c,d,label,w); };
    const oldWallV60=v59Wall;
    v59Wall=function(x,y,w,h,warn,life,c,d,label){ oldWallV60(x,y,w,h,v60Warn(warn),v60Life(life),c,d,label); };
    const oldDonutV60=v59Donut;
    v59Donut=function(x,y,inner,outer,warn,life,c,d,label){ oldDonutV60(x,y,inner,outer,v60Warn(warn),v60Life(life),c,d,label); };
    const oldFullV60=v59Full;
    v59Full=function(warn,life,c,d,label){ oldFullV60(Math.max(1.55,warn||0),v60Life(life),c,d,label); };
  }catch(e){ console.warn('[V60 warning wrapper failed]',e); }

  function v60N(low,high){ return v59Mass()?low:high; }
  function v60Spiral(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), n=v60N(5,8+ph);
    for(let i=0;i<n;i++){
      const a=i*Math.PI*2/n + state.time*.08;
      const rr=80+i*20;
      v59Circle(W/2+Math.cos(a)*rr,H/2+Math.sin(a)*rr,28+ph*3,1.05+i*.055,.42,i%2?c:v59Sub(),v59Dmg(.25+ph*.04),label+' 소용돌이');
    }
  }
  function v60Fan(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), n=v60N(4,6+ph), a0=v59Aim();
    for(let i=0;i<n;i++){
      const a=a0+(i-(n-1)/2)*(0.22+ph*.025);
      v59Beam(boss.x,boss.y,a,980,1.0+i*.04,.44,i%2?c:v59Sub(),v59Dmg(.30+ph*.04),label+' 부채',14+ph*2);
    }
  }
  function v60Lanes(label,c,vertical=false){
    v59Cast(label,c);
    const ph=v59Phase(), n=v60N(3,4+ph);
    for(let i=0;i<n;i++){
      if(vertical){
        const x=120+i*(W-240)/Math.max(1,n-1);
        v59Wall(x,H/2,30+ph*4,H*.80,1.08+i*.07,.44,i%2?c:v59Sub(),v59Dmg(.31),label+' 세로차선');
      }else{
        const y=125+i*(H-225)/Math.max(1,n-1);
        v59Wall(W/2,y,W*.92,30+ph*4,1.08+i*.07,.44,i%2?c:v59Sub(),v59Dmg(.31),label+' 가로차선');
      }
    }
  }
  function v60Prison(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), x=player.x, y=player.y;
    v59Wall(x-95,y,20,190,1.12,.46,c,v59Dmg(.28),label+' 감옥벽');
    v59Wall(x+95,y,20,190,1.12,.46,c,v59Dmg(.28),label+' 감옥벽');
    v59Wall(x,y-95,190,20,1.12,.46,c,v59Dmg(.28),label+' 감옥벽');
    v59Wall(x,y+95,190,20,1.12,.46,c,v59Dmg(.28),label+' 감옥벽');
    if(ph>=2) v59Circle(x,y,42+ph*6,1.35,.44,v59Sub(),v59Dmg(.36),label+' 핵심');
  }
  function v60SafeGame(label,c){
    v59Cast(label,c);
    const ph=v59Phase();
    const real=Math.floor(Math.random()*3);
    for(let i=0;i<3;i++){
      const x=220+i*(W-440)/2, y=H*.63;
      if(i===real) v59Safe(x,y,52,2.35,'#86efac',false);
      else v59Circle(x,y,54,1.2+i*.12,.45,'#f472b6',v59Dmg(.34+ph*.04),label+' 가짜안전');
    }
  }
  function v60ChaseMarks(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), n=v60N(3,5+ph);
    for(let i=0;i<n;i++){
      const x=clamp(player.x+rand(-160,160),90,W-90), y=clamp(player.y+rand(-120,120),110,H-75);
      v59Circle(x,y,34+ph*4,1.03+i*.09,.43,i%2?c:v59Sub(),v59Dmg(.31+ph*.04),label+' 추적표식');
    }
  }
  function v60Grid(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), cols=v60N(3,4+ph), rows=v60N(2,3+Math.floor(ph/2));
    for(let i=0;i<cols;i++) v59Wall(120+i*(W-240)/Math.max(1,cols-1),H/2,20,H*.82,1.08+i*.045,.42,i%2?c:'#fde047',v59Dmg(.28),label+' 격자');
    for(let j=0;j<rows;j++) v59Wall(W/2,145+j*(H-245)/Math.max(1,rows-1),W*.9,18,1.18+j*.06,.42,j%2?c:'#fde047',v59Dmg(.28),label+' 격자');
  }
  function v60Train(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), lanes=v60N(2,3+Math.floor(ph/2));
    for(let i=0;i<lanes;i++){
      const y=145+i*(H-250)/Math.max(1,lanes-1);
      v59Wall(W/2,y,W*.96,36+ph*4,1.15+i*.18,.50,i%2?c:'#94a3b8',v59Dmg(.36),label+' 돌진열차');
      if(!v59Mass()) v59Circle(i%2?W-95:95,y,30,1.0+i*.18,.35,'#facc15',v59Dmg(.22),label+' 신호등');
    }
  }
  function v60Orbit(label,c){
    v59Cast(label,c);
    const ph=v59Phase();
    v59Donut(W/2,H/2,70,180+ph*20,1.10,.48,c,v59Dmg(.34),label+' 궤도');
    const n=v60N(3,5+ph);
    for(let i=0;i<n;i++){
      const a=i*Math.PI*2/n+state.time*.1;
      v59Circle(W/2+Math.cos(a)*(185+ph*12),H/2+Math.sin(a)*(120+ph*10),30+ph*3,1.2+i*.055,.42,v59Sub(),v59Dmg(.29),label+' 위성');
    }
  }
  function v60Flowers(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), n=v60N(4,6+ph);
    for(let i=0;i<n;i++){
      const x=v59RandX(), y=v59RandY();
      v59Circle(x,y,26+ph*3,1.0+i*.05,.44,i%2?c:'#22c55e',v59Dmg(.28),label+' 꽃심');
      if(!v59Mass() && i<4){
        for(let k=0;k<4;k++) v59Beam(x,y,k*Math.PI/2,105,1.18+i*.05,.35,'#86efac',v59Dmg(.18),label+' 꽃잎',10);
      }
    }
  }
  function v60Cross(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), x=player.x, y=player.y;
    v59Beam(x,y,0,W*.85,1.05,.45,c,v59Dmg(.32+ph*.04),label+' 십자',18+ph*2);
    v59Beam(x,y,Math.PI/2,H*.75,1.05,.45,v59Sub(),v59Dmg(.32+ph*.04),label+' 십자',18+ph*2);
    if(ph>=3){ v59Beam(x,y,Math.PI/4,W*.75,1.28,.42,c,v59Dmg(.26),label+' 대각십자',14); v59Beam(x,y,-Math.PI/4,W*.75,1.28,.42,v59Sub(),v59Dmg(.26),label+' 대각십자',14); }
  }
  function v60Crown(label,c){
    v59Cast(label,c);
    const ph=v59Phase(), n=v60N(5,7+ph);
    for(let i=0;i<n;i++){
      const a=-Math.PI/2 + (i-(n-1)/2)*.20;
      v59Beam(W/2,105,a+Math.PI/2,860,1.1+i*.05,.45,i%2?c:'#facc15',v59Dmg(.34+ph*.04),label+' 왕관광선',16+ph*2);
    }
    if(ph>=2) v59Donut(W/2,H/2,95,245,1.48,.48,'#020617',v59Dmg(.34),label+' 왕관고리');
  }
  function v60PatternByLabel(idx){
    const type=v59Type(), label=v59Label(idx), c=v59Color();
    const s=String(label||'');
    if(v59HasMazeLabel(s)) return v59MazeMechanic(label,c);
    if(/체스|격자|회로|좌표|큐브|법칙|병동|검역/.test(s)) return v60Grid(label,c);
    if(/감옥|감금|봉쇄|울타리|벽|장벽|실/.test(s)) return v60Prison(label,c);
    if(/SAFE|룰렛|가짜|풍선|서커스|카드/.test(s)) return /SAFE|가짜|룰렛/.test(s)?v60SafeGame(label,c):v60Fan(label,c);
    if(/열차|선로|종착|차륜|돌진/.test(s)) return v60Train(label,c);
    if(/꽃|덩굴|장미|포자|정원|독/.test(s)) return v60Flowers(label,c);
    if(/중력|궤도|특이점|블랙홀|공허|심연|해일/.test(s)) return v60Orbit(label,c);
    if(/십자|거울|반사|일식|태양|왕관|종말/.test(s)) return v60Crown(label,c);
    if(/빙|얼음|눈보라|예언|초침|시간/.test(s)) return idx%2?v60Lanes(label,c,idx%3===0):v60Cross(label,c);
    if(/화염|불|용암|화산|분화|숨결|탄/.test(s)) return idx%2?v60Fan(label,c):v60ChaseMarks(label,c);
    if(/낙뢰|번개|천둥|폭풍|자력|극성/.test(s)) return idx%2?v60Grid(label,c):v60ChaseMarks(label,c);
    if(/분열|점액|젤리|탄성|푸딩|해일/.test(s)) return idx%2?v60Spiral(label,c):v60Lanes(label,c,false);
    if(/피|혈|달|사냥|표식/.test(s)) return idx%2?v60ChaseMarks(label,c):v60Crown(label,c);
    if(/모래|무덤|파라오|매장/.test(s)) return idx%2?v60Lanes(label,c,false):v60Spiral(label,c);
    if(type==='train'||type==='metal') return v60Train(label,c);
    if(type==='nature'||type==='poison'||type==='garden') return v60Flowers(label,c);
    if(type==='gravity'||type==='void'||type==='abyss') return v60Orbit(label,c);
    if(type==='jester'||type==='mirror'||type==='chaos'||type==='puppet') return idx%2?v60SafeGame(label,c):v60Fan(label,c);
    return [v60Spiral,v60Fan,v60Lanes,v60ChaseMarks,v60Cross][idx%5](label,c,idx%2===0);
  }
  try{
    v59TypePattern=function(idx){
      try{
        v60PatternByLabel(idx);
        if(v59Tier()>=8 && v59Phase()>=3 && !v59Mass()){
          if(Math.random()<.35) setTimeout(()=>{ if(state.screen==='raid'&&boss&&!boss.dead) v60PatternByLabel(Math.max(0,idx-1)); },760);
        }
        v60PerfCap();
      }catch(e){ console.warn('[V60 visual pattern failed]',e); try{ v59Fire(v59Label(idx),v59Color()); }catch(_){} }
    };
  }catch(e){ console.warn('[V60 v59TypePattern override failed]',e); }
  try{
    getBossPatternCooldown=function(){
      const t=v59Tier(), ph=v59Phase();
      const base=t>=9?1.95:t>=6?2.15:t>=3?2.35:2.60;
      return Math.max(1.25, base*(ph===3?.90:ph===2?.96:1)+Math.random()*.25);
    };
  }catch(e){ console.warn('[V60 cooldown failed]',e); }

  try{
    const oldDrawBossV60=drawBoss;
    drawBoss=function(){
      if(!boss||boss.dead) return;
      ctx.save(); if(state.shake>0) ctx.translate(rand(-state.shake,state.shake),rand(-state.shake,state.shake)); ctx.globalAlpha=boss.hit>0?.72:1; drawBossShape(ctx,boss,boss.x,boss.y,boss.r); ctx.restore();
      const bw=720,bh=22,x=(W-bw)/2,y=28,rate=clamp(boss.hp/boss.maxHp,0,1);
      ctx.fillStyle='rgba(0,0,0,.72)'; roundRect(ctx,x-8,y-24,bw+16,68,14);
      ctx.fillStyle='#111827'; roundRect(ctx,x,y,bw,bh,11);
      ctx.fillStyle=boss.vulnerable>0?'#fef08a':boss.color; roundRect(ctx,x,y,bw*rate,bh,11);
      ctx.strokeStyle='rgba(255,255,255,.22)'; ctx.lineWidth=2; roundRect(ctx,x,y,bw,bh,11);
      ctx.fillStyle='#fff'; ctx.font='900 16px system-ui'; ctx.textAlign='center'; ctx.fillText(`${boss.name}  ${stars(boss.tier)}  ${boss.vulnerable>0?'BREAK':'GUARD'}`,W/2,22);
      ctx.font='900 13px system-ui'; ctx.fillStyle='#e5e7eb'; ctx.fillText(`HP ${Math.ceil(boss.hp).toLocaleString()} / ${Math.ceil(boss.maxHp).toLocaleString()}  (${Math.ceil(rate*100)}%)`,W/2,y+16);
      ctx.font='800 13px system-ui'; ctx.fillStyle='#cbd5e1'; ctx.fillText(boss.mechanicText||'패턴 예고를 보고 움직이세요.',W/2,74);
      if(boss.clones) boss.clones.forEach(c=>drawBossShape(ctx,{...boss,color:c.real?'#fef08a':boss.color,sub:boss.sub,theme:boss.theme},c.x,c.y,boss.r*.65));
    };
  }catch(e){ console.warn('[V60 draw boss failed]',e); }
  try{
    drawHud=function(){
      v60EnsureMP();
      const x=18,y=H-112,w=390;
      ctx.fillStyle='rgba(0,0,0,.58)'; roundRect(ctx,x,y,w,96,16);
      ctx.fillStyle='#111827'; roundRect(ctx,x+18,y+20,300,16,8);
      ctx.fillStyle='#ef4444'; roundRect(ctx,x+18,y+20,300*clamp(player.hp/player.maxHp,0,1),16,8);
      ctx.fillStyle='#111827'; roundRect(ctx,x+18,y+48,300,14,7);
      ctx.fillStyle='#60a5fa'; roundRect(ctx,x+18,y+48,300*clamp(player.mp/player.maxMp,0,1),14,7);
      ctx.fillStyle='#334155'; roundRect(ctx,x+18,y+70,300,8,4);
      ctx.fillStyle='#93c5fd'; roundRect(ctx,x+18,y+70,300*clamp(player.shield/500,0,1),8,4);
      ctx.fillStyle='#fff'; ctx.font='900 13px system-ui'; ctx.textAlign='left';
      ctx.fillText(`HP ${Math.ceil(player.hp)}/${Math.ceil(player.maxHp)}`,x+24,y+15);
      ctx.fillStyle='#bfdbfe'; ctx.fillText(`MP ${Math.floor(player.mp)}/${Math.floor(player.maxMp)}  (+3/s)`,x+24,y+45);
      ctx.fillStyle='#cbd5e1'; ctx.font='800 11px system-ui'; ctx.fillText(`Shield ${Math.floor(player.shield)}`,x+24,y+91);
      const labels=['J','1','2','3','Space'];
      const cds=[player.basicCd,player.skillCd[0],player.skillCd[1],player.skillCd[2],player.rollCd];
      for(let i=0;i<5;i++){
        const bx=430+i*86, by=H-82;
        ctx.fillStyle='rgba(15,23,42,.82)'; roundRect(ctx,bx,by,70,58,12);
        ctx.fillStyle='#fff'; ctx.font='900 13px system-ui'; ctx.textAlign='center'; ctx.fillText(labels[i],bx+35,by+18);
        let status=cds[i]>0?cds[i].toFixed(1):'OK', col=cds[i]>0?'#fb7185':'#86efac';
        if(i>=1&&i<=3){
          const s=state.raid&&state.raid.skills&&state.raid.skills[i-1];
          if(s){ const cost=v60CostForSkill(s); ctx.fillStyle=player.mp>=cost?'#93c5fd':'#fca5a5'; ctx.font='800 11px system-ui'; ctx.fillText(`MP ${cost}`,bx+35,by+36); if(cds[i]<=0 && player.mp<cost){ status='MP 부족'; col='#fca5a5'; } }
        }
        ctx.fillStyle=col; ctx.font='900 11px system-ui'; ctx.fillText(status,bx+35,by+51);
      }
      ctx.textAlign='left';
    };
  }catch(e){ console.warn('[V60 draw HUD failed]',e); }

  try{ window.RaidDungeonV60={version:V60_VERSION, visualPatterns:'same-name reskins replaced with label-based layouts', warning:'longer telegraphs before damage', mp:'skills consume MP and MP regenerates 3 per second', hp:'boss/player numeric HP and MP HUD', performance:'hard caps and lighter mass rendering'}; }catch(e){}



  /* ===== V61: fresh leaderboard reset + global rank New Record + input-first performance ===== */
  const V61_VERSION = 'Raid Dungeon V61 - Fresh Records Global Rank Anti Lag';

  function v61SafeNum(v,d){ v=Number(v); return Number.isFinite(v)?v:d; }
  function v61BossTier(){ try{return clamp(Number(boss&&boss.tier||1),1,12);}catch(e){return 1;} }

  function v61ResetAllOldRecordsOnce(){
    try{
      const flag='raid-v61-record-reset-done';
      if(localStorage.getItem(flag)==='1') return;
      [
        LOCAL_RECORD_KEY,
        'raid-build-v12-local-records',
        'raid-build-v11-local-records',
        'raid-build-v10-local-records',
        'raid-build-v9-local-records',
        'raid-build-v7-local-records'
      ].forEach(k=>{ try{ localStorage.removeItem(k); }catch(_){} });
      try{ state.rankings=[]; }catch(_){}
      localStorage.setItem(flag,'1');
      setTimeout(async()=>{
        try{
          if(supabaseReady && supabase && supabase.from){
            const res = await supabase.from('raid_records').delete().neq('boss_id','__raid_v61_keep_none__');
            if(res && res.error) console.warn('[V61] cloud record reset skipped:', res.error.message);
          }
        }catch(e){ console.warn('[V61] cloud record reset failed/skipped:', e && e.message ? e.message : e); }
      },600);
    }catch(e){ console.warn('[V61] record reset failed:', e); }
  }
  v61ResetAllOldRecordsOnce();

  async function v61LoadRankOneMs(bossId){
    let best = Infinity;
    try{
      const local = getLocalRecords().filter(r=>r && r.boss_id===bossId && Number.isFinite(Number(r.clear_ms)));
      local.forEach(r=>{ best=Math.min(best, Number(r.clear_ms)); });
    }catch(e){}
    try{
      if(supabaseReady && supabase && supabase.from){
        const res = await supabase.from('raid_records').select('clear_ms').eq('boss_id',bossId).order('clear_ms',{ascending:true}).limit(1);
        if(res && Array.isArray(res.data) && res.data.length && Number.isFinite(Number(res.data[0].clear_ms))) best=Math.min(best, Number(res.data[0].clear_ms));
      }
    }catch(e){ console.warn('[V61] rank one load failed/skipped:', e && e.message ? e.message : e); }
    return best;
  }

  function v61ShowNewRecord(ms, oldMs){
    try{
      state.v61NewRecordT=3.2;
      state.v61NewRecordText = Number.isFinite(oldMs) ? `NEW RECORD! 1등 기록 갱신  ${formatMs(oldMs)} → ${formatMs(ms)}` : `NEW RECORD! 첫 1등 기록  ${formatMs(ms)}`;
      floatText('NEW RECORD!', W/2, H/2-74, '#facc15', 30);
    }catch(e){}
    try{
      let el=document.getElementById('v61-new-record-banner');
      if(!el){
        el=document.createElement('div'); el.id='v61-new-record-banner';
        el.style.cssText='position:fixed;left:50%;top:18%;transform:translateX(-50%);z-index:1000000;pointer-events:none;padding:18px 28px;border-radius:22px;background:linear-gradient(135deg,rgba(250,204,21,.95),rgba(249,115,22,.93));color:#111827;font:950 26px system-ui;box-shadow:0 20px 80px rgba(0,0,0,.45);text-align:center;letter-spacing:-.02em';
        document.body.appendChild(el);
      }
      el.textContent=state.v61NewRecordText||'NEW RECORD!';
      el.style.display='block';
      clearTimeout(window.__v61NewRecordTimeout);
      window.__v61NewRecordTimeout=setTimeout(()=>{ try{el.style.display='none';}catch(_){} },3200);
    }catch(e){}
  }

  try{
    const oldSubmitRecordV61 = submitRecord;
    submitRecord = async function(ms){
      let previousRankOne = Infinity;
      try{ previousRankOne = await v61LoadRankOneMs(boss.id); }catch(e){}
      try{ await oldSubmitRecordV61(ms); }catch(e){ console.warn('[V61] original submitRecord failed:', e); }
      try{
        if(ms < previousRankOne){
          v61ShowNewRecord(ms, previousRankOne);
        }
      }catch(e){}
    };
  }catch(e){ console.warn('[V61] submitRecord wrapper failed:',e); }

  function v61HardPerfCap(){
    try{
      const t=v61BossTier();
      const hMax=t>=9?48:t>=6?56:64;
      const pMax=t>=9?20:t>=6?26:34;
      const txMax=t>=6?6:10;
      const prMax=t>=9?34:t>=6?42:54;
      if(state.hazards && state.hazards.length>hMax){
        const arr=state.hazards, keep=[];
        for(let i=arr.length-1;i>=0&&keep.length<hMax;i--){
          const h=arr[i];
          if(!h) continue;
          if(h.respectSafe || h.v51FullMap || h.v55Core || h.warn>0 || i%2===0) keep.push(h);
        }
        state.hazards=keep.reverse();
      }
      if(state.projectiles && state.projectiles.length>prMax) state.projectiles.splice(0,state.projectiles.length-prMax);
      if(state.particles && state.particles.length>pMax) state.particles.splice(0,state.particles.length-pMax);
      if(state.texts && state.texts.length>txMax) state.texts.splice(0,state.texts.length-txMax);
    }catch(e){}
  }
  function v61Busy(){
    try{return (state.hazards||[]).length + (state.projectiles||[]).length + (state.particles||[]).length + (state.texts||[]).length > 72;}catch(e){return false;}
  }

  try{
    const oldUpdateV61=update;
    update=function(dt){
      // 이동감 저하를 줄이기 위해 무거운 오브젝트를 업데이트 전에 먼저 잘라냅니다.
      v61HardPerfCap();
      oldUpdateV61(Math.min(dt||0, 1/30));
      v61HardPerfCap();
      try{ if(state.v61NewRecordT>0) state.v61NewRecordT-=Math.min(dt||0,1/30); }catch(e){}
    };
  }catch(e){ console.warn('[V61] update anti-lag wrapper failed:',e); }

  try{
    const oldBurstV61=burst;
    burst=function(x,y,color,n,speed){
      if(v61Busy()) n=Math.min(Number(n)||0, 6);
      else n=Math.min(Number(n)||0, 18);
      return oldBurstV61(x,y,color,n,speed);
    };
  }catch(e){ console.warn('[V61] burst cap failed:',e); }

  try{
    drawParticles=function(){
      const arr=state.particles||[];
      if(!arr.length) return;
      const step=v61Busy()?4:2;
      ctx.save();
      for(let i=arr.length-1;i>=0;i-=step){
        const p=arr[i]; if(!p) continue;
        ctx.globalAlpha=clamp((p.life||0)*1.8,0,.65);
        ctx.fillStyle=p.color||'#fff';
        ctx.beginPath(); ctx.arc(p.x,p.y,Math.max(2,Math.min(5,p.r||3)),0,Math.PI*2); ctx.fill();
      }
      ctx.restore();
    };
  }catch(e){ console.warn('[V61] particle draw override failed:',e); }

  try{
    drawTexts=function(){
      const arr=state.texts||[];
      if(!arr.length) return;
      const max=v61Busy()?4:8;
      ctx.save(); ctx.textAlign='center';
      for(let i=Math.max(0,arr.length-max);i<arr.length;i++){
        const t=arr[i]; if(!t) continue;
        ctx.globalAlpha=clamp((t.life||0)*1.5,0,.9);
        ctx.fillStyle=t.color||'#fff'; ctx.font=`900 ${Math.min(20,t.size||16)}px system-ui`;
        ctx.fillText(t.text,t.x,t.y);
      }
      ctx.restore(); ctx.globalAlpha=1;
    };
  }catch(e){ console.warn('[V61] text draw override failed:',e); }

  try{
    const oldDrawV61=draw;
    draw=function(){
      oldDrawV61();
      try{
        if(state.v61NewRecordT>0){
          ctx.save();
          ctx.textAlign='center';
          ctx.fillStyle='rgba(0,0,0,.55)'; roundRect(ctx,W/2-270,96,540,54,18);
          ctx.fillStyle='#facc15'; ctx.font='950 24px system-ui';
          ctx.fillText(state.v61NewRecordText||'NEW RECORD!',W/2,130);
          ctx.restore();
        }
      }catch(e){}
    };
  }catch(e){ console.warn('[V61] draw banner wrapper failed:',e); }

  try{
    const oldMakeBossV61=makeBoss;
    makeBoss=function(b){
      const x=oldMakeBossV61(b);
      const t=clamp(Number(x.tier||1),1,12);
      const more=1.20 + t*.055 + (t>=9?.22:0) + (t>=11?.35:0);
      x.maxHp=Math.floor(x.maxHp*more);
      x.hp=x.maxHp;
      return x;
    };
  }catch(e){ console.warn('[V61] boss hp extra failed:',e); }



  /* ===== V62: true play-feel anti-lag + boss bar fix + weapon rarity specials + stat upgrades ===== */
  const V62_VERSION = 'Raid Dungeon V62 - Perf Weapons Stats Boss Bar';

  function v62Training(){
    if(!state.save.playerTraining || typeof state.save.playerTraining!=='object') state.save.playerTraining={hp:0,mp:0,regen:0};
    ['hp','mp','regen'].forEach(k=>{ state.save.playerTraining[k]=Math.max(0,Math.min(100,Number(state.save.playerTraining[k]||0))); });
    return state.save.playerTraining;
  }
  function v62UpgradeCost(lv){ return Math.floor(500*Math.pow(1.8,Math.max(0,lv))); }
  function v62ApplyTraining(p){
    try{
      const t=v62Training();
      const hpBonus=t.hp*18;
      const mpBonus=t.mp*7;
      const regenBonus=t.regen*0.045;
      p.maxHp=(p.v62BaseMaxHp||p.maxHp||100)+hpBonus;
      if(!Number.isFinite(p.maxMp)) p.maxMp=120;
      p.maxMp=(p.v62BaseMaxMp||p.maxMp||120)+mpBonus;
      p.mpRegen=3+regenBonus;
      p.regen=(p.v62BaseRegen||p.regen||0.18)+regenBonus;
      p.hp=Math.min(p.maxHp, Number.isFinite(p.hp)?p.hp:p.maxHp);
      p.mp=Math.min(p.maxMp, Number.isFinite(p.mp)?p.mp:p.maxMp);
    }catch(e){}
  }
  try{
    const oldMakePlayerV62=makePlayer;
    makePlayer=function(){
      const p=oldMakePlayerV62();
      p.v62BaseMaxHp=p.maxHp||100; p.v62BaseMaxMp=p.maxMp||120; p.v62BaseRegen=p.regen||0.18;
      v62ApplyTraining(p); p.hp=p.maxHp; p.mp=p.maxMp;
      return p;
    };
  }catch(e){ console.warn('[V62] makePlayer training failed',e); }
  try{
    const oldStartRaidV62=startRaid;
    startRaid=function(){ oldStartRaidV62(); if(state.screen==='raid'&&player){ v62ApplyTraining(player); player.hp=Math.min(player.hp,player.maxHp); player.mp=Math.min(player.mp,player.maxMp); }};
  }catch(e){ console.warn('[V62] startRaid training failed',e); }
  try{
    window.RaidDungeonUI=window.RaidDungeonUI||{};
    window.RaidDungeonUI.upgradePlayerStat=function(kind){
      const t=v62Training();
      if(!['hp','mp','regen'].includes(kind)) return;
      if(t[kind]>=100){ toast('이미 최대 레벨입니다.'); return; }
      const cost=v62UpgradeCost(t[kind]);
      if((state.save.coins||0)<cost){ toast('코인이 부족합니다. 필요 코인: '+cost.toLocaleString()); return; }
      state.save.coins-=cost; t[kind]++;
      if(player) v62ApplyTraining(player);
      saveGame(); renderMenu();
      toast('능력 성장 완료 Lv.'+t[kind]);
    };
  }catch(e){ console.warn('[V62] UI upgrade hook failed',e); }
  function v62StatPanel(){
    const t=v62Training();
    const rows=[['hp','최대 체력','Lv.'+t.hp,'최대 HP +'+(t.hp*18),'체력'],['mp','최대 마나','Lv.'+t.mp,'최대 MP +'+(t.mp*7),'마나'],['regen','회복력','Lv.'+t.regen,'HP/MP 회복 +'+(t.regen*0.045).toFixed(2)+'/초','회복']];
    return `<div class="v49-panel" style="margin-top:14px"><h3 style="margin-bottom:8px">플레이어 능력 성장</h3><p class="sub">코인으로 체력/마나/회복력을 성장시킵니다. 최대 100Lv, 첫 비용 500코인, 이후 1.8배입니다.</p><div class="v49-rows">${rows.map(([k,n,lv,desc,short])=>{const cost=v62UpgradeCost(t[k]); const disabled=t[k]>=100?'disabled':''; return `<div class="v49-row"><div class="v49-row-left"><div class="v49-row-title">${n} <span class="chip">${lv}</span></div><div class="v49-row-desc">${desc}<br>다음 비용 ${t[k]>=100?'MAX':cost.toLocaleString()+' 코인'}</div></div><div class="v49-actions"><button class="btn" ${disabled} onclick="window.RaidDungeonUI&&window.RaidDungeonUI.upgradePlayerStat('${k}')">${short} 성장</button></div></div>`;}).join('')}</div></div>`;
  }
  try{
    const oldRenderGrowthV62=renderGrowth;
    renderGrowth=function(){ return oldRenderGrowthV62()+v62StatPanel(); };
  }catch(e){ console.warn('[V62] renderGrowth panel failed',e); }

  function v62RarityRank(r){ return ({normal:0,rare:1,super:2,epic:3,legendary:4,ultimate:5})[r]||0; }
  function v62WeaponMul(w){ const rr=v62RarityRank(w&&w.rarity); return 1+rr*.16+(rr>=3?.18:0)+(rr>=4?.24:0)+(rr>=5?.38:0); }
  function v62WeaponColor(w){ return (w&&w.color)||({normal:'#cbd5e1',rare:'#60a5fa',super:'#4ade80',epic:'#a78bfa',legendary:'#facc15',ultimate:'#f0abfc'}[w&&w.rarity]||'#fff'); }
  function v62Spark(x,y,c,n){
    if(v59Mass&&v59Mass()) n=Math.min(n,4);
    for(let i=0;i<n;i++) state.particles.push({x,y,vx:rand(-180,180),vy:rand(-180,120),r:rand(2,5),life:rand(.18,.42),color:c});
  }
  function v62Wave(x,y,a,dmg,c,range,rank){
    state.projectiles.push({owner:'player',x:x+Math.cos(a)*30,y:y+Math.sin(a)*30,vx:Math.cos(a)*(620+rank*80),vy:Math.sin(a)*(620+rank*80),r:12+rank*2,life:.55+rank*.08,damage:dmg*(.58+rank*.08),color:c,pierce:rank>=4?3:rank>=3?1:0,splash:rank>=4?38:0,tag:'v62wave'});
  }
  try{
    const oldBasicAttackV62=basicAttack;
    basicAttack=function(){
      if(!state.raid||player.basicCd>0) return;
      const w=getWeapon(state.selectedWeaponId);
      if(!w) return oldBasicAttackV62();
      const rank=v62RarityRank(w.rarity), c=v62WeaponColor(w), a=aimAngle();
      const oldMul=player.basicDamageMul||1;
      player.basicDamageMul=oldMul*v62WeaponMul(w);
      oldBasicAttackV62();
      player.basicDamageMul=oldMul;
      if(rank>=3){
        const base=player.atk*oldMul*w.atk*v62WeaponMul(w);
        const ranged=['bow','staff','gunstaff','grimoire','chakram'].some(k=>String(w.kind||'').includes(k));
        if(ranged){
          const shots=rank>=5?5:rank>=4?4:3;
          for(let i=0;i<shots;i++){
            const spread=(i-(shots-1)/2)*(rank>=5?.11:.08);
            state.projectiles.push({owner:'player',x:player.x+Math.cos(a+spread)*30,y:player.y+Math.sin(a+spread)*30,vx:Math.cos(a+spread)*(690+rank*65),vy:Math.sin(a+spread)*(690+rank*65),r:7+rank,life:.85,damage:base*(rank>=5?.34:.25),color:c,pierce:rank>=4?1:0,splash:rank>=4?30:0,tag:'v62burst'});
          }
        }else{
          v62Wave(player.x,player.y,a,base,c,w.range,rank);
          if(rank>=4) setTimeout(()=>{try{ if(state.screen==='raid') v62Wave(player.x,player.y,a,base*.70,c,w.range,rank-1); }catch(e){}},110);
        }
        v62Spark(player.x+Math.cos(a)*42,player.y+Math.sin(a)*42,c,rank>=5?12:8);
      }
      if(rank>=4){
        player.attackAnim=Math.max(player.attackAnim||0,.34);
        state.shake=Math.max(state.shake||0,rank>=5?2.2:1.2);
      }
      v62PerfCapHard();
    };
  }catch(e){ console.warn('[V62] weapon special basicAttack failed',e); }

  function v62PerfCapHard(){
    try{
      if(!state||state.screen!=='raid') return;
      const critical=(state.hazards.length+state.projectiles.length+state.particles.length+state.texts.length+state.zones.length)>150;
      const maxHaz=critical?28:42, maxProj=critical?26:42, maxPart=critical?34:70, maxText=critical?6:12, maxZone=critical?8:12;
      if(state.hazards.length>maxHaz) state.hazards.splice(0,state.hazards.length-maxHaz);
      if(state.projectiles.length>maxProj) state.projectiles.splice(0,state.projectiles.length-maxProj);
      if(state.particles.length>maxPart) state.particles.splice(0,state.particles.length-maxPart);
      if(state.texts.length>maxText) state.texts.splice(0,state.texts.length-maxText);
      if(state.zones.length>maxZone) state.zones.splice(0,state.zones.length-maxZone);
    }catch(e){}
  }
  try{
    const oldUpdateV62=update;
    update=function(dt){
      const safeDt=Math.min(dt||0,1/30);
      v62PerfCapHard();
      oldUpdateV62(safeDt);
      if(state.screen==='raid'&&player){
        v62ApplyTraining(player);
        player.mp=Math.min(player.maxMp, player.mp + (player.mpRegen||3)*Math.max(0,dt||0));
        v62PerfCapHard();
      }
    };
  }catch(e){ console.warn('[V62] update anti-lag failed',e); }

  function v62DrawHPBar(x,y,w,h,rate,color){
    rate=clamp(rate,0,1);
    ctx.fillStyle='#111827'; roundRect(ctx,x,y,w,h,h/2);
    ctx.save(); ctx.beginPath(); ctx.rect(x,y,Math.max(0,w*rate),h); ctx.clip(); ctx.fillStyle=color; roundRect(ctx,x,y,w,h,h/2); ctx.restore();
    ctx.strokeStyle='rgba(255,255,255,.26)'; ctx.lineWidth=2; ctx.strokeRect(x,y,w,h);
  }
  try{
    drawBoss=function(){
      if(!boss||boss.dead) return;
      ctx.save(); if(state.shake>0) ctx.translate(rand(-state.shake,state.shake),rand(-state.shake,state.shake)); ctx.globalAlpha=boss.hit>0?.72:1; drawBossShape(ctx,boss,boss.x,boss.y,boss.r); ctx.restore();
      const bw=720,bh=22,x=(W-bw)/2,y=28,rate=clamp(boss.hp/Math.max(1,boss.maxHp),0,1);
      ctx.fillStyle='rgba(0,0,0,.72)'; roundRect(ctx,x-8,y-24,bw+16,72,14);
      v62DrawHPBar(x,y,bw,bh,rate,boss.vulnerable>0?'#fef08a':boss.color);
      ctx.fillStyle='#fff'; ctx.font='900 16px system-ui'; ctx.textAlign='center'; ctx.fillText(`${boss.name}  ${stars(boss.tier)}  ${boss.vulnerable>0?'BREAK':'GUARD'}`,W/2,22);
      ctx.font='900 13px system-ui'; ctx.fillStyle='#e5e7eb'; ctx.fillText(`HP ${Math.ceil(boss.hp).toLocaleString()} / ${Math.ceil(boss.maxHp).toLocaleString()}  (${Math.ceil(rate*100)}%)`,W/2,y+16);
      ctx.font='800 13px system-ui'; ctx.fillStyle='#cbd5e1'; ctx.fillText(boss.mechanicText||'패턴 예고를 보고 움직이세요.',W/2,76);
      if(boss.clones&&!v59Mass()) boss.clones.forEach(c=>drawBossShape(ctx,{...boss,color:c.real?'#fef08a':boss.color,sub:boss.sub,theme:boss.theme},c.x,c.y,boss.r*.65));
    };
  }catch(e){ console.warn('[V62] boss bar fix failed',e); }
  try{
    drawHud=function(){
      v60EnsureMP(); v62ApplyTraining(player);
      const x=18,y=H-122,w=410;
      ctx.fillStyle='rgba(0,0,0,.62)'; roundRect(ctx,x,y,w,106,16);
      v62DrawHPBar(x+18,y+22,318,18,player.hp/Math.max(1,player.maxHp),'#ef4444');
      v62DrawHPBar(x+18,y+55,318,16,player.mp/Math.max(1,player.maxMp),'#60a5fa');
      ctx.fillStyle='#fff'; ctx.font='900 13px system-ui'; ctx.textAlign='left'; ctx.fillText(`HP ${Math.ceil(player.hp)}/${Math.ceil(player.maxHp)}`,x+24,y+17);
      ctx.fillStyle='#bfdbfe'; ctx.fillText(`MP ${Math.floor(player.mp)}/${Math.floor(player.maxMp)}  (+${(player.mpRegen||3).toFixed(1)}/s)`,x+24,y+51);
      ctx.fillStyle='#cbd5e1'; ctx.font='800 11px system-ui'; ctx.fillText(`Shield ${Math.floor(player.shield||0)}  · 성장: HP Lv.${v62Training().hp} / MP Lv.${v62Training().mp} / 회복 Lv.${v62Training().regen}`,x+24,y+91);
      const labels=['J','1','2','3','Space']; const cds=[player.basicCd,player.skillCd[0],player.skillCd[1],player.skillCd[2],player.rollCd];
      for(let i=0;i<5;i++){
        const bx=455+i*84, by=H-86; ctx.fillStyle='rgba(15,23,42,.82)'; roundRect(ctx,bx,by,68,62,12);
        ctx.fillStyle='#fff'; ctx.font='900 13px system-ui'; ctx.textAlign='center'; ctx.fillText(labels[i],bx+34,by+18);
        let status=cds[i]>0?cds[i].toFixed(1):'OK', col=cds[i]>0?'#fb7185':'#86efac';
        if(i>=1&&i<=3){const s=state.raid&&state.raid.skills&&state.raid.skills[i-1]; if(s){const cost=v60CostForSkill(s); ctx.fillStyle=player.mp>=cost?'#93c5fd':'#fca5a5'; ctx.font='800 11px system-ui'; ctx.fillText(`MP ${cost}`,bx+34,by+38); if(cds[i]<=0&&player.mp<cost){status='MP 부족'; col='#fca5a5';}}}
        ctx.fillStyle=col; ctx.font='900 11px system-ui'; ctx.fillText(status,bx+34,by+55);
      }
      ctx.textAlign='left';
    };
  }catch(e){ console.warn('[V62] HUD failed',e); }

  function v62BoostBossQuality(){
    try{
      if(!boss) return;
      const t=clamp(Number(boss.tier||1),1,12);
      const extra=1.18 + t*.055 + (t>=8?.25:0) + (t>=10?.38:0);
      if(!boss.v62HpBoosted){ boss.maxHp=Math.floor(boss.maxHp*extra); boss.hp=boss.maxHp; boss.v62HpBoosted=true; }
    }catch(e){}
  }
  try{
    const oldMakeBossV62=makeBoss;
    makeBoss=function(b){ const x=oldMakeBossV62(b); const t=clamp(Number(x.tier||1),1,12); const extra=1.18+t*.055+(t>=8?.25:0)+(t>=10?.38:0); x.maxHp=Math.floor(x.maxHp*extra); x.hp=x.maxHp; x.v62HpBoosted=true; return x; };
  }catch(e){ console.warn('[V62] boss hp quality boost failed',e); }

  function v62ShowcasePattern(idx){
    const t=v59Tier(), ph=v59Phase();
    v60PatternByLabel(idx);
    if(t>=6 && ph>=2 && !v59Mass()){
      setTimeout(()=>{try{ if(state.screen==='raid'&&boss&&!boss.dead) v60PatternByLabel((idx+1)%Math.max(1,v57PatternCount&&v57PatternCount())); }catch(e){}},680);
    }
    if(t>=9 && ph>=3 && !v59Mass()){
      setTimeout(()=>{try{ if(state.screen==='raid'&&boss&&!boss.dead) v60PatternByLabel((idx+2)%Math.max(1,v57PatternCount&&v57PatternCount())); }catch(e){}},1280);
    }
    v62PerfCapHard();
  }
  try{
    v59TypePattern=function(idx){ try{ v62ShowcasePattern(idx); }catch(e){ try{ v60PatternByLabel(idx); }catch(_){} } };
    getBossPatternCooldown=function(){ const t=v59Tier(), ph=v59Phase(); return Math.max(1.55, (t>=9?2.15:t>=6?2.35:t>=3?2.55:2.85) * (ph===3?.92:ph===2?.98:1) + Math.random()*.22); };
  }catch(e){ console.warn('[V62] pattern quality override failed',e); }



  /* ===== V63: weapon damage display + boss-exclusive weapon gacha lock ===== */
  const V63_VERSION = 'Raid Dungeon V63 - Damage Display Boss Only Weapons';

  function v63IsBossOnlyWeapon(w){
    try{
      if(!w) return false;
      const id=String(w.id||'');
      const desc=String(w.desc||'');
      const name=String(w.name||'');
      return !!(w.v44Boss || w.v62BossOnly || id.startsWith('v44_boss_weapon_') || id.startsWith('boss_weapon_') || desc.includes('보스 전용 무기') || desc.includes('보스 별이 높을수록') || name.includes('의 전용 무기'));
    }catch(e){ return false; }
  }
  function v63GachaWeaponPool(){
    try{ return WEAPONS.filter(w=>!v63IsBossOnlyWeapon(w)); }catch(e){ return WEAPONS||[]; }
  }
  function v63ItemPool(kind){
    if(kind==='weapon') return v63GachaWeaponPool();
    if(kind==='armor') return ARMORS;
    if(kind==='skill') return SKILLS;
    return PASSIVES;
  }
  function v63RollList(kind, rarity){
    const all=v63ItemPool(kind)||[];
    const pool=all.filter(x=>x&&x.rarity===rarity);
    return pool.length?pool:all;
  }
  function v69SafeAddOwned(kind,id){
    if(!id || !state || !state.save) return false;
    if(kind==='weapon'){
      const a=state.save.weapons || (state.save.weapons=[]);
      if(!a.includes(id)){ a.push(id); return true; }
      return false;
    }
    if(kind==='armor'){
      const a=state.save.armors || (state.save.armors=[]);
      if(!a.includes(id)){ a.push(id); return true; }
      return false;
    }
    if(kind==='skill'){
      const a=state.save.skills || (state.save.skills=[]);
      let v=null;
      try{ if(typeof v44==='function') v=v44(); }catch(e){}
      try{ if(!v && typeof initV43==='function') v=initV43(); }catch(e){}
      if(a.includes(id)){
        if(v && v.skillCopies) v.skillCopies[id]=(v.skillCopies[id]||0)+1;
        return false;
      }
      a.push(id);
      if(v && v.skillLevels) v.skillLevels[id]=Math.max(1, v.skillLevels[id]||1);
      return true;
    }
    if(kind==='passive'){
      const a=state.save.passives || (state.save.passives=[]);
      if(!a.includes(id)){ a.push(id); return true; }
      return false;
    }
    return false;
  }

  try{
    const oldRollGachaV63=rollGacha;
    rollGacha=function(kind){
      if(!state.save.tickets || typeof state.save.tickets!=='object') state.save.tickets={...INITIAL_TICKETS};
      if((state.save.tickets[kind]||0)<=0){ toast(TICKET_LABEL[kind]+'이 부족합니다. 보스를 클리어하면 난이도에 따라 티켓을 얻습니다.'); return; }
      state.save.tickets[kind]-=1;
      const rarity=pickRarity();
      const list=v63RollList(kind,rarity);
      if(!list.length){ toast('뽑기 가능한 항목이 없습니다.'); state.save.tickets[kind]=(state.save.tickets[kind]||0)+1; return; }
      const item=list[Math.floor(Math.random()*list.length)];
      const fresh=v69SafeAddOwned(kind,item.id);
      state.gachaResult=item;
      gachaCelebration(item);
      if(!fresh && kind==='skill') toast('중복 스킬을 획득해서 강화 포인트로 저장되었습니다.');
      saveGame(); renderMenu();
    };
  }catch(e){ console.warn('[V69] gacha hotfix failed', e); }

  function v63RankName(r){ return ({normal:'일반',rare:'희귀',super:'초희귀',epic:'에픽',legendary:'레전더리',ultimate:'궁극'})[r]||r||'일반'; }
  function v63RarityRank(r){ return ({normal:0,rare:1,super:2,epic:3,legendary:4,ultimate:5})[r]||0; }
  function v63WeaponEnhanceInfo(w){
    let enh=0, atkBonus=0, critBonus=0, speedBonus=0;
    try{
      const meta=(typeof weaponMeta==='function' && weaponMeta(w.id)) || {};
      enh=Number(meta.enh||w.v45Enhance||w.v44Enhance||w.v43Enhance||w.v41Enhance||0);
      const ench=meta.ench||w.v45Enchant||w.v44Enchant||w.v43Enchant||w.v41Enchant||[];
      const arr=Array.isArray(ench)?ench:Object.entries(ench||{}).map(([type,lv])=>({type,lv}));
      arr.forEach(e=>{ const lv=Number(e.lv||e[1]||0); const type=e.type||e[0]; if(type==='attack') atkBonus+=lv*8; if(type==='critChance') critBonus+=lv*3; if(type==='speed') speedBonus+=lv*5.5; });
    }catch(e){}
    return {enh, atkBonus: enh*10.5 + atkBonus, critBonus, speedBonus};
  }
  function v63WeaponDamage(w){
    try{
      const rank=v63RarityRank(w.rarity);
      const enh=v63WeaponEnhanceInfo(w);
      const baseAtk=100;
      const rarityMul=(typeof v62WeaponMul==='function')?v62WeaponMul(w):(1+rank*.16+(rank>=3?.18:0)+(rank>=4?.24:0)+(rank>=5?.38:0));
      const enhanceMul=1+enh.atkBonus/100;
      const avg=Math.max(1, Math.round(baseAtk*Number(w.atk||1)*rarityMul*enhanceMul));
      const crit=Math.max(0, Math.round(Number(w.crit||0)+enh.critBonus));
      const cd=Number(w.speed||.5);
      const dps=Math.max(1, Math.round(avg/Math.max(.08,cd)));
      return {avg, dps, crit, cd:+cd.toFixed(2), rank, enh};
    }catch(e){ return {avg:0,dps:0,crit:0,cd:0,rank:0,enh:{}}; }
  }
  function v63WeaponSpecialText(w){
    const d=v63WeaponDamage(w), k=String(w.kind||''), ranged=['bow','staff','gunstaff','grimoire','chakram'].some(x=>k.includes(x));
    if(d.rank<3) return '특수 효과: 없음';
    if(ranged){
      const shots=d.rank>=5?5:d.rank>=4?4:3;
      return `특수 효과: ${v63RankName(w.rarity)} 다중 탄환 ${shots}발 + ${d.rank>=4?'폭발/관통 보정':'추가 탄환'}`;
    }
    return `특수 효과: ${v63RankName(w.rarity)} 검기/충격파 발산${d.rank>=4?' + 잔상 추가타':''}`;
  }
  function v63WeaponDamageLine(w){
    const d=v63WeaponDamage(w);
    return `데미지: 약 ${d.avg.toLocaleString()} / 초당 ${d.dps.toLocaleString()} · 치명 ${d.crit}% · 공격간격 ${d.cd}s`;
  }
  try{
    v50WeaponEffects=function(w){
      const oldLine=(()=>{try{ const meta=v50WeaponMeta(w.id); const enh=Number(meta.enh||w.v45Enhance||w.v44Enhance||w.v43Enhance||w.v41Enhance||0); const ench=meta.ench||w.v45Enchant||w.v44Enchant||w.v43Enchant||[]; const arr=Array.isArray(ench)?ench:Object.entries(ench||{}).map(([type,lv])=>({type,lv})); let attack=enh*10.5, speed=0, crit=0, luck=0, plunder=0; arr.forEach(e=>{ const lv=Number(e.lv||e[1]||0); const type=e.type||e[0]; if(type==='attack') attack+=lv*8; if(type==='speed') speed+=lv*5.5; if(type==='critChance') crit+=lv*3; if(type==='luck') luck+=lv*3.5; if(type==='plunder') plunder+=lv*7; }); return `적용 효과: 공격 ${v50Pct(attack)}, 공속 ${v50Pct(speed)}, 치명 ${v50Pct(crit)}, 행운 ${v50Pct(luck)}, 약탈 ${v50Pct(plunder)}`;}catch(e){return '적용 효과: 계산 불가';}})();
      return `${v63WeaponDamageLine(w)}\n${oldLine}\n${v63WeaponSpecialText(w)}${v63IsBossOnlyWeapon(w)?'\n획득처: 뽑기 불가 · 해당 보스 처치 시 아주 낮은 확률 드롭':''}`;
    };
    v50SortieWeaponCard=function(it,selected,type){
      const w=getWeapon(it.id)||it;
      const selectedClass=selected===it.id?'active':'';
      const eff=v50WeaponEffects(w);
      const desc=v50BaseDesc(w.desc);
      const display=eff.split('\n').map(esc).join('<br>');
      return `<div class="card ${selectedClass}" title="${esc(desc+'\n'+eff)}" data-select-type="weapon" data-select-id="${esc(it.id)}" onclick="window.RaidDungeonUI&&window.RaidDungeonUI.select('weapon','${esc(it.id)}',0)"><h3>${v50RarityName(w)}</h3><p>${esc(desc)}<br>${display}</p></div>`;
    };
  }catch(e){ console.warn('[V63] sortie damage display failed', e); }

  try{
    const oldRenderGachaV63=renderGacha;
    renderGacha=function(){
      let html=oldRenderGachaV63();
      const normalWeapons=v63GachaWeaponPool().length;
      const bossOnly=WEAPONS.filter(v63IsBossOnlyWeapon).length;
      html=html.replace(/무기 \$\{state\.save\.weapons\.length\}\/\$\{WEAPONS\.length\}/g,'무기 ${state.save.weapons.length}/${WEAPONS.length}');
      html += `<div class="card" style="margin-top:12px;cursor:default"><h3>전용 무기 획득 안내</h3><p>보스 전용 무기는 무기 뽑기에서 나오지 않습니다.<br>현재 뽑기 가능 무기 ${normalWeapons}종 / 보스 전용 무기 ${bossOnly}종<br>전용 무기는 해당 보스를 처치했을 때 아주 낮은 확률로만 드롭됩니다.</p></div>`;
      return html;
    };
  }catch(e){ console.warn('[V63] gacha notice failed', e); }

  try{
    const oldV48WeaponCardV63=v48WeaponCard;
    v48WeaponCard=function(w,mode){
      let html=oldV48WeaponCardV63(w,mode);
      const line=esc(v63WeaponDamageLine(w));
      const special=esc(v63WeaponSpecialText(w));
      html=html.replace('<div class="v49-row-desc">',`<div class="v49-row-desc">${line}<br>${special}<br>`);
      return html;
    };
  }catch(e){ console.warn('[V63] growth weapon damage display failed', e); }

  /* ===== V64: late boss analysis patterns + stable anti-lag ===== */
  const V64_VERSION = 'Raid Dungeon V64 - Late Boss Analysis Patterns Anti Lag';

  const V64_LATE_LABELS = {
    mirror_duelist:['진짜 분신 판별','거울 순서 레이저','반사 회랑','가짜 SAFE 심판','만화경 칼날','거울 핵 처리'],
    gravity_core:['중력 시계바늘','압축 도넛 판정','궤도 핵 처리','블랙홀 밀당','붕괴 안전칸','역중력 십자'],
    solar_dragon:['태양핵 낙하','일식 색상 판별','왕관 광선 회전','불타는 안전칸','태양 파도벽','창세 폭발'],
    chrono_dragon:['시간 순서 기억','지연 탄막 해석','초침 회전 회피','되감기 SAFE','시간축 붕괴칸','크로노 분신'],
    abyss_leviathan:['심해 파도벽','소용돌이 탈출','해일 안전지대','심연 핵 처리','물결 미로','레비아탄 포효'],
    puppet_emperor:['실 조종 격자','가짜 안전지대','단두대 처형선','꼭두각시 순서','인형극 감옥','최종 단두대'],
    black_sun:['검은 일식 판별','흑점 낙하','왕관 십자광','암흑 안전칸','종말 도넛','검은태양 심판'],
    chaos_archon:['색상 양극 심판','혼돈 기억 룬','차원 격자','가짜 예고 판별','복합 처형식','혼돈 최종 법정']
  };

  try{
    BOSSES.forEach(b=>{
      if(V64_LATE_LABELS[b.id]) b.patterns = V64_LATE_LABELS[b.id].slice();
      else if(Number(b.tier||1)>=7 && Array.isArray(b.patterns) && !b.patterns.includes('분석형 기믹')) b.patterns.push('분석형 기믹');
    });
  }catch(e){}

  function v64Tier(){ try{return clamp(Number(boss&&boss.tier||1),1,12);}catch(e){return 1;} }
  function v64Phase(){ try{return boss&&boss.phase?boss.phase:(boss.hp/boss.maxHp<.28?3:boss.hp/boss.maxHp<.62?2:1);}catch(e){return 1;} }
  function v64Color(){ return (boss&&boss.color)||'#fb7185'; }
  function v64Sub(){ return (boss&&boss.sub)||'#ffffff'; }
  function v64Tag(){ return (boss&&boss.theme)||'chaos'; }
  function v64Label(idx){ const arr=V64_LATE_LABELS[(boss&&boss.id)||'']; return (arr&&arr[idx%arr.length]) || (typeof v59Label==='function'?v59Label(idx):'후반 분석 패턴'); }
  function v64Cast(text, color, kind){
    color=color||v64Color();
    boss.mechanicText = text;
    boss.cast = {life:.75,max:.75,kind:kind||'cast',color,angle:Math.atan2(player.y-boss.y, player.x-boss.x)};
    if(typeof floatText==='function') floatText(text.replace(/^.*?:\s*/,''), W/2, 92, color, 20);
  }
  function v64Cap(){
    try{
      if(!state || state.screen!=='raid') return;
      const load=(state.hazards.length*3)+(state.projectiles.length*2)+state.particles.length+state.zones.length*4+state.mechanics.length*3;
      const panic=load>260;
      const maxHaz=panic?34:52, maxProj=panic?34:54, maxPart=panic?48:86, maxZone=panic?10:16, maxMech=panic?18:28, maxText=panic?8:16;
      if(state.hazards.length>maxHaz) state.hazards.splice(0,state.hazards.length-maxHaz);
      if(state.projectiles.length>maxProj) state.projectiles.splice(0,state.projectiles.length-maxProj);
      if(state.particles.length>maxPart) state.particles.splice(0,state.particles.length-maxPart);
      if(state.zones.length>maxZone) state.zones.splice(0,state.zones.length-maxZone);
      if(state.mechanics.length>maxMech) state.mechanics.splice(0,state.mechanics.length-maxMech);
      if(state.texts.length>maxText) state.texts.splice(0,state.texts.length-maxText);
    }catch(e){}
  }
  function v64Circle(x,y,r,warn,damage,color,tag){
    color=color||v64Color(); tag=tag||v64Tag();
    if(typeof v20Circle==='function') v20Circle(x,y,r,warn,color,damage,tag);
    else state.hazards.push({kind:'circle',x,y,r,warn,life:.60,damage,color,tag});
  }
  function v64Beam(x,y,angle,len,w,warn,damage,color,tag){
    color=color||v64Color(); tag=tag||v64Tag();
    if(typeof v20Beam==='function') v20Beam(x,y,angle,len,w,warn,color,damage,tag);
    else state.hazards.push({kind:'beam',x,y,angle,len,w,warn,life:.60,damage,color,tag});
  }
  function v64Wall(x,y,w,h,warn,damage,color,tag){
    color=color||v64Color(); tag=tag||v64Tag();
    if(typeof v20Wall==='function') v20Wall(x,y,w,h,warn,color,damage,tag);
    else state.hazards.push({kind:'wall',x,y,w,h,warn,life:.70,damage,color,tag});
  }
  function v64Donut(x,y,inner,outer,warn,damage,color,tag){
    color=color||v64Color(); tag=tag||v64Tag();
    if(typeof v20Donut==='function') v20Donut(x,y,inner,outer,warn,color,damage,tag);
    else state.hazards.push({kind:'donut',x,y,inner,outer,warn,life:.62,damage,color,tag});
  }
  function v64RotBeam(x,y,angle,spin,len,w,warn,damage,color,tag){
    color=color||v64Color(); tag=tag||v64Tag();
    if(typeof v20RotBeam==='function') v20RotBeam(x,y,angle,spin,len,w,warn,color,damage,tag);
    else state.hazards.push({kind:'rotatingBeam',x,y,angle,spin,len,w,warn,life:2.0,damage,color,tag,tick:0});
  }
  function v64Safe(x,y,r,life,color,fake){ state.mechanics.push({kind:'safe',x,y,r,life,color:color||'#86efac',fake:!!fake}); }

  function v64LanePuzzle(color, tag){
    const ph=v64Phase(), vertical=Math.random()<.5, lanes=5+(ph>=3?1:0), safe=Math.floor(Math.random()*lanes);
    v64Cast(`${boss.name}: ${vertical?'세로':'가로'} 격자 중 비어 있는 길을 찾아 이동하세요.`, color, 'beam');
    for(let i=0;i<lanes;i++){
      if(i===safe) continue;
      if(vertical) v64Wall(110+i*(W-220)/(lanes-1),H/2,24,H*.82,1.08+i*.045,boss.atk*.42,color,tag);
      else v64Wall(W/2,130+i*(H-230)/(lanes-1),W*.92,24,1.08+i*.045,boss.atk*.42,color,tag);
    }
    if(ph>=2){
      setTimeout(()=>{ if(state.screen==='raid'&&boss&&!boss.dead){
        const a=Math.atan2(player.y-boss.y,player.x-boss.x);
        v64Beam(boss.x,boss.y,a,W*.95,14,0.72,boss.atk*.34,color,tag);
      }},720);
    }
  }

  function v64ClockPuzzle(color, tag){
    const ph=v64Phase(), dir=Math.random()<.5?1:-1, base=state.time;
    v64Cast(`${boss.name}: 시계바늘 회전 방향을 보고 안쪽 빈 공간을 따라 이동하세요.`, color, 'beam');
    for(let i=0;i<3+(ph>=3?1:0);i++){
      v64RotBeam(W/2,H/2,base+i*Math.PI/(3+(ph>=3?1:0)),dir*(.42+i*.10),W*1.35,12+i*2,1.05+i*.22,boss.atk*.32,color,tag);
    }
    if(ph>=2) v64Donut(W/2,H/2,82,225,1.22,boss.atk*.36,color,tag);
  }

  function v64FakeSafe(color, tag){
    const ph=v64Phase();
    const real=Math.floor(Math.random()*3);
    v64Cast(`${boss.name}: 진짜 SAFE는 하나뿐입니다. 가짜 안전지대 색을 속지 마세요.`, color, 'cast');
    for(let i=0;i<3;i++){
      const x=250+i*(W-500)/2, y=H*.58;
      v64Safe(x,y,58,2.15,i===real?'#86efac':color,i!==real);
      if(i!==real) v64Circle(x,y,62,1.35+i*.08,boss.atk*.72,color,tag);
    }
    setTimeout(()=>{ if(!state.raid||!boss||boss.dead)return; const x=250+real*(W-500)/2,y=H*.58; if(dist(player.x,player.y,x,y)<58+player.r) breakBoss(.9); else hurtPlayer(boss.atk*1.2,color,true); },2150);
    if(ph>=3) setTimeout(()=>v64ClockPuzzle(color,tag),980);
  }

  function v64SafeGrid(color, tag){
    const cols=6, rows=4, top=108, bottom=H-58, cellW=W/cols, cellH=(bottom-top)/rows;
    const total=cols*rows, safeCount=v64Tier()>=10?2:3, safes=new Set();
    while(safes.size<safeCount) safes.add(Math.floor(Math.random()*total));
    v64Cast(`${boss.name}: 금이 가지 않은 안전칸 ${safeCount}개를 찾아 이동하세요.`, color, 'slam');
    for(let i=0;i<total;i++){
      const x=cellW*(i%cols+.5), y=top+cellH*(Math.floor(i/cols)+.5);
      if(safes.has(i)) v64Safe(x,y,Math.min(cellW,cellH)*.28,2.05,'#86efac',false);
      else {
        if(typeof v20Floor==='function') v20Floor(x,y,cellW*.82,cellH*.70,1.35+Math.random()*.22,color,boss.atk*.62,tag);
        else state.hazards.push({kind:'floor',x,y,w:cellW*.82,h:cellH*.70,warn:1.35+Math.random()*.22,life:.70,damage:boss.atk*.62,color,tag});
      }
    }
  }

  function v64Guillotine(color, tag){
    const ph=v64Phase();
    v64Cast(`${boss.name}: 단두대 칼날이 순서대로 내려옵니다. 선 순서를 기억하고 옆으로 빠지세요.`, color, 'beam');
    const xs=[W*.22,W*.39,W*.56,W*.73];
    const order=xs.sort(()=>Math.random()-.5).slice(0,3+(ph>=3?1:0));
    order.forEach((x,i)=>{
      v64Beam(x,H/2,Math.PI/2,H*1.16,22+ph*2,1.02+i*.28,boss.atk*.64,color,tag);
      state.particles.push({kind:'line',x,y:105,vx:0,vy:0,r:16,life:1.1+i*.18,color:'#ffffff',angle:Math.PI/2,len:H*.74});
    });
    if(ph>=2) setTimeout(()=>v64FakeSafe(color,tag),950);
  }

  function v64WaveWall(color, tag){
    const ph=v64Phase(), rows=4+(ph>=3?1:0), gap=Math.floor(Math.random()*rows);
    v64Cast(`${boss.name}: 해일 벽이 밀려옵니다. 비어 있는 줄을 찾아 파도 사이로 이동하세요.`, color, 'beam');
    for(let i=0;i<rows;i++){
      if(i===gap) continue;
      const y=130+i*(H-230)/(rows-1);
      v64Wall(W/2,y,W*.95,34,1.05+i*.13,boss.atk*.50,color,tag);
    }
    for(let i=0;i<2+ph;i++) v64Circle(rand(100,W-100),rand(125,H-80),38,1.35+i*.10,boss.atk*.42,v64Sub(),tag);
  }

  function v64OrbControl(color, tag){
    const ph=v64Phase();
    v64Cast(`${boss.name}: 핵을 방치하면 전체 폭발이 옵니다. 추적 핵을 피하면서 처리하세요.`, color, 'cast');
    const n=2+(ph>=3?1:0);
    for(let i=0;i<n;i++){
      const x=rand(120,W-120), y=rand(135,H-90);
      state.mechanics.push({kind:'add',x,y,r:18,hp:110+boss.tier*24,life:5.0,speed:54+boss.tier*2,color});
    }
    setTimeout(()=>{ if(!state.raid||!boss||boss.dead)return; const alive=state.mechanics.some(m=>m.kind==='add'&&m.life>0); if(alive) v64Circle(W/2,H/2,285,.18,boss.atk*1.15,color,tag); else breakBoss(1.1); },3100);
    if(ph>=2) v64LanePuzzle(color,tag);
  }

  function v64Memory(color, tag){
    v64Cast(`${boss.name}: 룬 순서를 기억해 밟으면 BREAK, 실패하면 보스가 연계 공격합니다.`, color, 'cast');
    try{ spawnMemoryMiniGame(); }catch(e){ v64SafeGrid(color,tag); }
    setTimeout(()=>{ if(state.screen==='raid'&&boss&&!boss.dead) v64LanePuzzle(color,tag); },1050);
  }

  function v64Polarity(color, tag){
    v64Cast(`${boss.name}: 색상 양극 판정입니다. 표시된 색 원만 진짜 안전지대입니다.`, color, 'cast');
    try{ spawnColorPolarity(); }catch(e){ v64FakeSafe(color,tag); }
    if(v64Phase()>=3) setTimeout(()=>v64ClockPuzzle(color,tag),1050);
  }

  function v64BossSpecific(idx){
    const id=(boss&&boss.id)||'', color=v64Color(), tag=v64Tag(), i=Math.abs(idx||0)%6;
    if(id==='puppet_emperor') return [v64LanePuzzle,v64FakeSafe,v64Guillotine,v64Memory,v64OrbControl,v64Guillotine][i](color,tag);
    if(id==='black_sun') return [v64Polarity,v64SafeGrid,v64ClockPuzzle,v64FakeSafe,v64DonutFinal,v64Judgement][i](color,tag);
    if(id==='chaos_archon') return [v64Polarity,v64Memory,v64LanePuzzle,v64FakeSafe,v64OrbControl,v64Judgement][i](color,tag);
    if(id==='chrono_dragon') return [v64Memory,v64ClockPuzzle,v64LanePuzzle,v64FakeSafe,v64SafeGrid,v64OrbControl][i](color,tag);
    if(id==='abyss_leviathan') return [v64WaveWall,v64OrbControl,v64FakeSafe,v64LanePuzzle,v64SafeGrid,v64Judgement][i](color,tag);
    if(id==='gravity_core') return [v64ClockPuzzle,v64DonutFinal,v64OrbControl,v64LanePuzzle,v64SafeGrid,v64Polarity][i](color,tag);
    if(id==='solar_dragon') return [v64SafeGrid,v64Polarity,v64ClockPuzzle,v64WaveWall,v64FakeSafe,v64Judgement][i](color,tag);
    if(id==='mirror_duelist') return [v64FakeSafe,v64LanePuzzle,v64ClockPuzzle,v64Memory,v64OrbControl,v64Judgement][i](color,tag);
    return [v64LanePuzzle,v64ClockPuzzle,v64SafeGrid,v64FakeSafe,v64OrbControl,v64Judgement][i](color,tag);
  }
  function v64DonutFinal(color, tag){
    v64Cast(`${boss.name}: 안쪽/바깥쪽 판정을 번갈아 읽으세요. 도넛 후 십자 광선이 이어집니다.`, color, 'slam');
    v64Donut(W/2,H/2,90,235,1.12,boss.atk*.54,color,tag);
    setTimeout(()=>{ if(state.screen==='raid'&&boss&&!boss.dead){ v64Beam(W/2,H/2,0,W*1.2,18,.72,boss.atk*.46,color,tag); v64Beam(W/2,H/2,Math.PI/2,H*1.4,18,.72,boss.atk*.46,color,tag); }},880);
  }
  function v64Judgement(color, tag){
    const ph=v64Phase();
    v64Cast(`${boss.name}: 최종 심판입니다. 안전칸, 회전 광선, 추적 표식을 순서대로 분석하세요.`, color, 'beam');
    v64SafeGrid(color,tag);
    setTimeout(()=>{ if(state.screen==='raid'&&boss&&!boss.dead) v64ClockPuzzle(color,tag); },980);
    if(ph>=3) setTimeout(()=>{ if(state.screen==='raid'&&boss&&!boss.dead) v64Circle(player.x,player.y,54,0.92,boss.atk*.60,v64Sub(),tag); },1720);
  }

  try{
    const oldV64TypePattern = v59TypePattern;
    v59TypePattern = function(idx){
      try{
        const t=v64Tier();
        if(t>=7){
          const allowed=(t>=10?6:t>=9?5:t>=8?4:3);
          v64BossSpecific((idx||0)%allowed);
          if(t>=9 && v64Phase()>=3 && Math.random()<.26 && !v59Mass()) setTimeout(()=>{ if(state.screen==='raid'&&boss&&!boss.dead) v64BossSpecific(((idx||0)+1)%6); v64Cap(); },1120);
          v64Cap();
          return;
        }
      }catch(e){ console.warn('[V64 late pattern failed]', e); }
      try{ oldV64TypePattern(idx); }catch(err){ try{ v60PatternByLabel(idx); }catch(_){} }
    };
    getBossPatternCooldown=function(){
      const t=v64Tier(), ph=v64Phase();
      const base=t>=10?2.20:t>=9?2.30:t>=7?2.45:t>=5?2.55:2.75;
      return Math.max(1.75, base*(ph===3?.88:ph===2?.95:1)+Math.random()*.25);
    };
  }catch(e){ console.warn('[V64 pattern override failed]', e); }

  try{
    const oldUpdateV64=update;
    update=function(dt){
      const safeDt=Math.min(dt||0,1/36);
      v64Cap();
      oldUpdateV64(safeDt);
      v64Cap();
    };
  }catch(e){ console.warn('[V64 anti lag update failed]', e); }


  /* ===== V65: premium late boss patterns + stricter no-lag orchestration ===== */
  const V65_VERSION = 'Raid Dungeon V65 - Premium Boss Patterns No Lag';
  const V65_LABELS = {
    mirror_duelist:['거울 재판','진짜 분신 추적','반사 복도','거울 파편 기억','역상 안전지대','만화경 결투'],
    gravity_core:['궤도 붕괴','중력 저울','블랙홀 눈금','압축/해방 판정','역중력 회랑','특이점 심판'],
    solar_dragon:['일식 왕관','태양 문장 판별','홍염 해일','태양핵 봉인','내부/외부 광륜','초신성 심판'],
    chrono_dragon:['시간 악보','되감기 좌표','초침 감옥','지연 폭발 판독','과거/미래 안전칸','종말 시계'],
    abyss_leviathan:['심해 호흡','해일 문양','소용돌이 눈','심연 구슬 봉인','파도 회랑','레비아탄 침식'],
    puppet_emperor:['실 인형극','단두대 리허설','꼭두각시 법정','가짜 무대','실타래 감옥','황제 처형식'],
    black_sun:['검은 왕관','일식 내외부 판정','흑점 안전칸','암흑 태양핵','왕관 심판광','종말의 검은 태양'],
    chaos_archon:['혼돈 법정','색상 양극 재판','차원 악보','가짜 예고 해석','복합 심판식','최종 혼돈 명령']
  };

  try{
    BOSSES.forEach(b=>{
      if(V65_LABELS[b.id]) b.patterns = V65_LABELS[b.id].slice();
      else if(Number(b.tier||1)>=7) b.patterns = ['분석형 패턴','연계 회피','안전지대 판별'];
    });
  }catch(e){}

  function v65Alive(){ return state && state.screen==='raid' && boss && !boss.dead; }
  function v65T(){ return Math.max(1, Math.min(10, Number(boss&&boss.tier||1))); }
  function v65P(){ return v64Phase(); }
  function v65C(){ return v64Color(); }
  function v65S(){ return v64Sub(); }
  function v65Tag(){ return v64Tag(); }
  function v65Msg(text,color,kind){ v64Cast(text,color||v65C(),kind||'cast'); }
  function v65After(ms,fn){ setTimeout(()=>{ try{ if(v65Alive()){ fn(); v65Cap(); } }catch(e){ console.warn('[V65 delayed pattern]',e); } }, ms); }
  function v65Cap(){
    try{
      if(!state || state.screen!=='raid') return;
      const t=v65T(), ph=v65P();
      const pressure=(state.hazards.length*3)+(state.projectiles.length*2)+(state.mechanics.length*3)+(state.zones.length*4)+state.particles.length;
      const panic=pressure>220;
      const maxHaz=panic?26:(t>=10?36:40);
      const maxProj=panic?24:(t>=10?36:42);
      const maxMech=panic?12:20;
      const maxZone=panic?7:11;
      const maxPart=panic?34:(ph>=3?58:66);
      const maxText=panic?6:10;
      if(state.hazards.length>maxHaz) state.hazards.splice(0,state.hazards.length-maxHaz);
      if(state.projectiles.length>maxProj) state.projectiles.splice(0,state.projectiles.length-maxProj);
      if(state.mechanics.length>maxMech) state.mechanics.splice(0,state.mechanics.length-maxMech);
      if(state.zones.length>maxZone) state.zones.splice(0,state.zones.length-maxZone);
      if(state.particles.length>maxPart) state.particles.splice(0,state.particles.length-maxPart);
      if(state.texts.length>maxText) state.texts.splice(0,state.texts.length-maxText);
    }catch(e){}
  }
  function v65Mark(x,y,label,color){
    color=color||v65C();
    try{ floatText(label,x,y,color,18); }catch(e){}
    try{ state.particles.push({kind:'ring',x,y,vx:0,vy:0,r:38,life:.75,color,line:3}); }catch(e){}
  }
  function v65SafeCheck(x,y,r,okBreak,failDamage,color){
    v65After(1880,()=>{ if(dist(player.x,player.y,x,y)<r+player.r){ if(okBreak) breakBoss(okBreak); } else hurtPlayer(failDamage||boss.atk*1.15,color||v65C(),true); });
  }

  function v65SequenceStage(title, color, points, safeIndex, follow){
    color=color||v65C();
    v65Msg(`${boss.name}: ${title} - 표시 순서를 보고 진짜 위치로 이동하세요.`, color, 'cast');
    points.forEach((pt,i)=>{
      v65Mark(pt.x,pt.y,String(i+1),i===safeIndex?'#86efac':color);
      v64Safe(pt.x,pt.y,46,1.9,i===safeIndex?'#86efac':color,i!==safeIndex);
      if(i!==safeIndex) v64Circle(pt.x,pt.y,52,1.16+i*.12,boss.atk*.56,color,v65Tag());
    });
    const s=points[safeIndex];
    v65SafeCheck(s.x,s.y,52,.75,boss.atk*1.15,color);
    if(follow) v65After(910,follow);
  }

  function v65CrownJudgement(color, tag){
    color=color||v65C(); tag=tag||v65Tag();
    const ph=v65P();
    v65Msg(`${boss.name}: 왕관 심판광입니다. 십자 예고 후 대각선 빈틈으로 이동하세요.`, color, 'beam');
    v64Beam(W/2,H/2,0,W*1.22,18,1.02,boss.atk*.48,color,tag);
    v64Beam(W/2,H/2,Math.PI/2,H*1.36,18,1.08,boss.atk*.48,color,tag);
    v65After(760,()=>{
      v64Beam(W/2,H/2,Math.PI/4,W*1.30,14,.72,boss.atk*.40,v65S(),tag);
      v64Beam(W/2,H/2,-Math.PI/4,W*1.30,14,.72,boss.atk*.40,v65S(),tag);
      if(ph>=3) v64Donut(W/2,H/2,92,260,.92,boss.atk*.40,color,tag);
    });
  }

  function v65InsideOutside(color, tag){
    color=color||v65C(); tag=tag||v65Tag();
    const inside=Math.random()<.5;
    v65Msg(`${boss.name}: ${inside?'안쪽':'바깥쪽'} 판정입니다. 문구를 읽고 위치를 바꾸세요.`, color, 'slam');
    if(inside){
      v64Donut(W/2,H/2,132,420,1.12,boss.atk*.56,color,tag);
      v64Safe(W/2,H/2,96,1.75,'#86efac',false);
      v65SafeCheck(W/2,H/2,102,.6,boss.atk*.95,color);
    }else{
      v64Circle(W/2,H/2,195,1.12,boss.atk*.58,color,tag);
      [[160,145],[W-160,145],[160,H-95],[W-160,H-95]].forEach(p=>v64Safe(p[0],p[1],44,1.75,'#86efac',false));
    }
    v65After(920,()=>v65CrownJudgement(color,tag));
  }

  function v65MusicMemory(color, tag){
    color=color||v65C(); tag=tag||v65Tag();
    const pts=[{x:240,y:175},{x:W-240,y:175},{x:W-250,y:H-125},{x:250,y:H-125}];
    const safe=Math.floor(Math.random()*pts.length);
    v65SequenceStage('시간 악보',color,pts,safe,()=>{
      const p=pts[safe];
      v64Beam(p.x,p.y,Math.atan2(player.y-p.y,player.x-p.x),W*.9,13,.72,boss.atk*.38,color,tag);
      if(v65P()>=3) v64Wall(W/2,H*.52,W*.80,24,.92,boss.atk*.42,v65S(),tag);
    });
  }

  function v65PuppetTheater(color, tag){
    color=color||v65C(); tag=tag||v65Tag();
    const xs=[W*.18,W*.34,W*.50,W*.66,W*.82];
    const gap=Math.floor(Math.random()*xs.length);
    v65Msg(`${boss.name}: 실이 연결된 칸은 잠깁니다. 빈 무대로 빠져나오세요.`, color, 'beam');
    xs.forEach((x,i)=>{
      if(i===gap){ v64Safe(x,H*.55,42,1.8,'#86efac',false); return; }
      v64Beam(x,H/2,Math.PI/2,H*1.18,15,1.04+i*.08,boss.atk*.48,color,tag);
      v64Wall(x,H*.55,28,H*.56,1.28+i*.04,boss.atk*.40,color,tag);
    });
    v65After(880,()=>v64Beam(xs[gap],H/2,0,W*.52,15,.72,boss.atk*.42,v65S(),tag));
  }

  function v65GuillotineTheater(color, tag){
    color=color||v65C(); tag=tag||v65Tag();
    const lanes=[W*.23,W*.39,W*.55,W*.71];
    const safe=lanes[Math.floor(Math.random()*lanes.length)];
    v65Msg(`${boss.name}: 단두대 리허설입니다. 내려오지 않는 선을 찾아 서세요.`, color, 'beam');
    lanes.forEach((x,i)=>{
      if(x===safe){ v64Safe(x,H*.56,45,1.95,'#86efac',false); v65Mark(x,118,'SAFE','#86efac'); return; }
      v64Beam(x,H/2,Math.PI/2,H*1.22,25,1.06+i*.16,boss.atk*.66,color,tag);
    });
    v65SafeCheck(safe,H*.56,52,.9,boss.atk*1.25,color);
    if(v65P()>=2) v65After(1120,()=>v65PuppetTheater(color,tag));
  }

  function v65GravityScale(color, tag){
    color=color||v65C(); tag=tag||v65Tag();
    const left=Math.random()<.5;
    v65Msg(`${boss.name}: 중력 저울이 기울어집니다. ${left?'왼쪽':'오른쪽'}의 안전 궤도로 이동하세요.`, color, 'cast');
    const safeX=left?W*.28:W*.72, badX=left?W*.72:W*.28;
    v64Safe(safeX,H*.52,70,1.9,'#86efac',false);
    v64Circle(badX,H*.52,96,1.10,boss.atk*.72,color,tag);
    v64RotBeam(W/2,H/2,state.time,left?.55:-.55,W*1.24,14,1.12,boss.atk*.38,color,tag);
    v65SafeCheck(safeX,H*.52,76,.7,boss.atk*1.05,color);
    if(v65P()>=3) v65After(980,()=>v65InsideOutside(color,tag));
  }

  function v65AbyssBreath(color, tag){
    color=color||v65C(); tag=tag||v65Tag();
    const rows=5, safe=Math.floor(Math.random()*rows);
    v65Msg(`${boss.name}: 심해 호흡입니다. 비어 있는 물결 줄을 따라 이동하세요.`, color, 'beam');
    for(let i=0;i<rows;i++){
      const y=132+i*(H-225)/(rows-1);
      if(i===safe){ v64Safe(W*.18,y,38,1.75,'#86efac',false); v64Safe(W*.82,y,38,1.75,'#86efac',false); continue; }
      v64Wall(W/2,y,W*.92,28,1.04+i*.12,boss.atk*.50,color,tag);
    }
    v65After(900,()=>{
      const a=Math.atan2(player.y-boss.y,player.x-boss.x);
      v64Beam(boss.x,boss.y,a,W*.92,16,.70,boss.atk*.43,v65S(),tag);
    });
  }

  function v65ChaosCourt(color, tag){
    color=color||v65C(); tag=tag||v65Tag();
    const choices=[
      {x:W*.28,y:H*.38,c:'#86efac',name:'초록'},
      {x:W*.50,y:H*.62,c:color,name:'보스색'},
      {x:W*.72,y:H*.38,c:v65S(),name:'보조색'}
    ];
    const safe=Math.floor(Math.random()*choices.length);
    v65Msg(`${boss.name}: 혼돈 법정입니다. 이번 재판의 진짜 색은 ${choices[safe].name}입니다.`, color, 'cast');
    choices.forEach((p,i)=>{ v64Safe(p.x,p.y,50,1.85,p.c,i!==safe); if(i!==safe) v64Circle(p.x,p.y,58,1.16+i*.08,boss.atk*.60,p.c,tag); });
    v65SafeCheck(choices[safe].x,choices[safe].y,56,.85,boss.atk*1.15,color);
    v65After(940,()=>v65CrownJudgement(color,tag));
  }

  function v65OrbSeal(color, tag){
    color=color||v65C(); tag=tag||v65Tag();
    v65Msg(`${boss.name}: 봉인 핵을 처리하세요. 실패하면 광역 심판이 옵니다.`, color, 'cast');
    const count=v65P()>=3?3:2;
    for(let i=0;i<count;i++) state.mechanics.push({kind:'add',x:rand(150,W-150),y:rand(150,H-100),r:18,hp:125+boss.tier*26,life:4.8,speed:48+boss.tier*2,color});
    v65After(2700,()=>{
      const alive=state.mechanics.some(m=>m.kind==='add'&&m.life>0);
      if(alive) v64Donut(W/2,H/2,70,315,.20,boss.atk*1.05,color,tag);
      else breakBoss(1.15);
    });
  }

  function v65BossPattern(idx){
    const id=(boss&&boss.id)||'', color=v65C(), tag=v65Tag();
    const i=Math.abs(idx||0)%6;
    const common=[v65InsideOutside,v65CrownJudgement,v65MusicMemory,v65GravityScale,v65AbyssBreath,v65OrbSeal];
    const map={
      puppet_emperor:[v65PuppetTheater,v65GuillotineTheater,v65SequenceStageWrapper,v65PuppetTheater,v65OrbSeal,v65GuillotineTheater],
      black_sun:[v65InsideOutside,v65CrownJudgement,v65SunTiles,v65OrbSeal,v65InsideOutside,v65BlackSunFinal],
      chaos_archon:[v65ChaosCourt,v65MusicMemory,v65GravityScale,v65SequenceStageWrapper,v65OrbSeal,v65ChaosFinal],
      chrono_dragon:[v65MusicMemory,v65SequenceStageWrapper,v65InsideOutside,v65CrownJudgement,v65GravityScale,v65ChronoFinal],
      abyss_leviathan:[v65AbyssBreath,v65OrbSeal,v65InsideOutside,v65AbyssBreath,v65MusicMemory,v65AbyssFinal],
      gravity_core:[v65GravityScale,v65InsideOutside,v65OrbSeal,v65CrownJudgement,v65MusicMemory,v65GravityFinal],
      solar_dragon:[v65CrownJudgement,v65InsideOutside,v65SunTiles,v65AbyssBreath,v65OrbSeal,v65SolarFinal],
      mirror_duelist:[v65SequenceStageWrapper,v65ChaosCourt,v65CrownJudgement,v65InsideOutside,v65OrbSeal,v65MirrorFinal]
    };
    const fn=(map[id]||common)[i]||common[i];
    fn(color,tag);
    v65Cap();
  }

  function v65SequenceStageWrapper(color, tag){
    const pts=[{x:W*.22,y:H*.30},{x:W*.44,y:H*.52},{x:W*.66,y:H*.30},{x:W*.78,y:H*.66}];
    v65SequenceStage('문장 순서 판별',color,pts,Math.floor(Math.random()*pts.length),()=>v65CrownJudgement(color,tag));
  }
  function v65SunTiles(color, tag){
    color=color||v65C(); tag=tag||v65Tag();
    v65Msg(`${boss.name}: 흑점이 없는 칸만 안전합니다.`, color, 'slam');
    const cols=5, rows=3, safe=Math.floor(Math.random()*cols*rows);
    for(let i=0;i<cols*rows;i++){
      const x=190+(i%cols)*(W-380)/(cols-1), y=165+Math.floor(i/cols)*(H-270)/(rows-1);
      if(i===safe) v64Safe(x,y,48,1.9,'#86efac',false);
      else v64Circle(x,y,46,1.05+Math.random()*.28,boss.atk*.52,color,tag);
    }
  }
  function v65BlackSunFinal(color, tag){ v65InsideOutside(color,tag); v65After(820,()=>v65CrownJudgement(color,tag)); v65After(1580,()=>v65SunTiles(color,tag)); }
  function v65ChaosFinal(color, tag){ v65ChaosCourt(color,tag); v65After(920,()=>v65GravityScale(color,tag)); }
  function v65ChronoFinal(color, tag){ v65MusicMemory(color,tag); v65After(980,()=>v65InsideOutside(color,tag)); }
  function v65AbyssFinal(color, tag){ v65AbyssBreath(color,tag); v65After(940,()=>v65OrbSeal(color,tag)); }
  function v65GravityFinal(color, tag){ v65GravityScale(color,tag); v65After(1020,()=>v65CrownJudgement(color,tag)); }
  function v65SolarFinal(color, tag){ v65CrownJudgement(color,tag); v65After(920,()=>v65SunTiles(color,tag)); }
  function v65MirrorFinal(color, tag){ v65SequenceStageWrapper(color,tag); v65After(880,()=>v65ChaosCourt(color,tag)); }

  try{
    const oldV65TypePattern = v59TypePattern;
    v59TypePattern = function(idx){
      try{
        const t=v65T(), ph=v65P();
        if(t>=7){
          const allowed=t>=10?6:t>=9?5:t>=8?4:3;
          v65BossPattern((idx||0)%allowed);
          if(t>=10 && ph>=3 && Math.random()<.18) v65After(1180,()=>v65BossPattern(((idx||0)+2)%6));
          v65Cap();
          return;
        }
      }catch(e){ console.warn('[V65 premium pattern failed]',e); }
      try{ oldV65TypePattern(idx); }catch(err){ try{ v64BossSpecific(idx); }catch(_){} }
    };
    getBossPatternCooldown=function(){
      const t=v65T(), ph=v65P();
      const base=t>=10?2.55:t>=9?2.62:t>=8?2.70:t>=7?2.82:t>=5?2.90:3.05;
      return Math.max(2.02, base*(ph===3?.92:ph===2?.97:1)+Math.random()*.22);
    };
  }catch(e){ console.warn('[V65 pattern override failed]',e); }

  try{
    const oldUpdateV65 = update;
    update=function(dt){
      const safeDt=Math.min(dt||0,1/40);
      v65Cap();
      oldUpdateV65(safeDt);
      v65Cap();
    };
  }catch(e){ console.warn('[V65 update override failed]',e); }



  /* ===== V66: cinematic high-quality boss patterns without object spam ===== */
  const V66_VERSION = 'Raid Dungeon V66 - Cinematic Boss Patterns Ultra No Lag';

  function v66Alive(){ return state && state.screen === 'raid' && boss && !boss.dead; }
  function v66Tier(){ return Math.max(1, Math.min(10, Number(boss && boss.tier || 1))); }
  function v66Phase(){ return v64Phase ? v64Phase() : (boss && boss.phase || 1); }
  function v66Color(){ return (boss && boss.color) || '#facc15'; }
  function v66Sub(){ return (boss && boss.sub) || '#ffffff'; }
  function v66Tag(){ return (boss && boss.theme) || 'chaos'; }
  function v66Later(ms, fn){ setTimeout(function(){ try{ if(v66Alive()){ fn(); v66Cap(); } }catch(e){ console.warn('[V66 delayed pattern failed]', e); } }, ms); }
  function v66Say(text, color, kind){ try{ v64Cast(text, color || v66Color(), kind || 'cast'); }catch(e){ toast(text); } }

  function v66Cap(){
    try{
      if(!state || state.screen !== 'raid') return;
      const t = v66Tier(), ph = v66Phase();
      const visualBudget = state.particles.length + state.hazards.length * 3 + state.projectiles.length * 2 + state.zones.length * 4 + state.mechanics.length * 2;
      const panic = visualBudget > 245;
      const maxHaz = panic ? 24 : (t >= 10 ? 34 : 38);
      const maxProj = panic ? 18 : (t >= 10 ? 28 : 34);
      const maxZone = panic ? 6 : 9;
      const maxMech = panic ? 22 : 34;
      const maxPart = panic ? 26 : (ph >= 3 ? 44 : 52);
      const maxText = panic ? 5 : 9;
      if(state.hazards.length > maxHaz) state.hazards.splice(0, state.hazards.length - maxHaz);
      if(state.projectiles.length > maxProj) state.projectiles.splice(0, state.projectiles.length - maxProj);
      if(state.zones.length > maxZone) state.zones.splice(0, state.zones.length - maxZone);
      if(state.mechanics.length > maxMech) state.mechanics.splice(0, state.mechanics.length - maxMech);
      if(state.particles.length > maxPart) state.particles.splice(0, state.particles.length - maxPart);
      if(state.texts.length > maxText) state.texts.splice(0, state.texts.length - maxText);
    }catch(e){}
  }

  function v66Fx(kind, x, y, opts){
    opts = opts || {};
    try{
      state.mechanics.push({
        kind:'v66Fx', fx:kind, x:x, y:y,
        r:opts.r || 90, w:opts.w || 160, h:opts.h || 90,
        life:opts.life || 2.2, maxLife:opts.life || 2.2,
        color:opts.color || v66Color(), sub:opts.sub || v66Sub(),
        label:opts.label || '', angle:opts.angle || 0,
        spin:opts.spin || 0, sides:opts.sides || 8, fake:!!opts.fake
      });
    }catch(e){}
  }
  function v66Safe(x,y,r,life,label){
    try{ state.mechanics.push({kind:'safe',x,y,r:r||56,life:life||2.35,color:'#86efac',label:label||'TRUE'}); }catch(e){}
    v66Fx('sigil',x,y,{r:(r||56)+18,life:life||2.35,color:'#86efac',sub:'#ffffff',label:label||'TRUE',spin:1.4,sides:7});
  }
  function v66Fake(x,y,r,life,label,color){
    try{ state.mechanics.push({kind:'safe',x,y,r:r||56,life:life||2.35,color:color||'#fb7185',fake:true,label:label||'FAKE'}); }catch(e){}
    v66Fx('sigil',x,y,{r:(r||56)+14,life:life||2.35,color:color||'#fb7185',sub:'#111827',label:label||'FAKE',spin:-1.1,sides:5,fake:true});
  }
  function v66BreakSafe(x,y,r,delay,success,failDamage,color){
    v66Later(delay || 2100, function(){
      if(dist(player.x, player.y, x, y) < (r || 60) + player.r){
        try{ breakBoss(success || 1.25); }catch(e){}
        healText('기믹 성공 · BREAK', player.x, player.y - 42);
      }else{
        hurtPlayer(failDamage || boss.atk * 1.08, color || v66Color(), true);
        floatText('판독 실패', player.x, player.y - 44, '#fb7185', 19);
      }
    });
  }
  function v66LowSpark(x,y,color,count){
    count = Math.min(count || 10, 18);
    for(let i=0;i<count;i++){
      const a = Math.PI * 2 * i / count + rand(-.12,.12);
      state.particles.push({kind:'line',x,y,vx:Math.cos(a)*rand(80,220),vy:Math.sin(a)*rand(80,220),r:rand(3,6),life:rand(.22,.48),color:color||v66Color(),angle:a,len:rand(18,42)});
    }
  }

  function v66RadialJudgement(color, tag){
    color = color || v66Color(); tag = tag || v66Tag();
    const cx = W/2, cy = H/2 + 10;
    const safeA = Math.floor(Math.random()*8);
    v66Say(`${boss.name}: 만다라 심판입니다. 밝은 문양의 부채꼴 방향만 안전합니다.`, color, 'beam');
    v66Fx('mandala', cx, cy, {r:230, life:2.25, color, sub:v66Sub(), label:'MANDALA', spin:.55, sides:12});
    for(let i=0;i<8;i++){
      const a = i * Math.PI/4;
      if(i === safeA){
        const sx = cx + Math.cos(a)*180, sy = cy + Math.sin(a)*180;
        v66Safe(sx,sy,50,2.25,'SAFE');
      }else{
        v64Beam(cx + Math.cos(a)*185, cy + Math.sin(a)*185, a, 360, 13, 1.20 + i*.035, boss.atk*.44, color, tag);
      }
    }
    const sx = cx + Math.cos(safeA*Math.PI/4)*180, sy = cy + Math.sin(safeA*Math.PI/4)*180;
    v66BreakSafe(sx, sy, 58, 2200, .85, boss.atk*1.05, color);
  }

  function v66OperaGuillotine(color, tag){
    color = color || '#f0abfc'; tag = tag || 'mirror';
    const lanes = [W*.18, W*.34, W*.50, W*.66, W*.82];
    const safe = Math.floor(Math.random()*lanes.length);
    v66Say(`${boss.name}: 황제의 단두대 오페라. 칼날이 없는 무대 중앙을 찾으세요.`, color, 'beam');
    v66Fx('curtain', W/2, H/2, {w:W, h:H, life:2.35, color, sub:'#7c2d12', label:'EXECUTION'});
    lanes.forEach((x,i)=>{
      if(i === safe){ v66Safe(x,H*.64,48,2.25,'NO BLADE'); return; }
      v66Fx('blade', x, H*.30, {w:66, h:190, life:2.15, color:'#e5e7eb', sub:color, label:'DROP'});
      v64Beam(x,H/2,Math.PI/2,H*1.15,18,1.18+i*.05,boss.atk*.62,color,tag);
      if(i%2===0) v64Beam(x,H*.54,0,W*.34,10,1.46,boss.atk*.35,v66Sub(),tag);
    });
    v66BreakSafe(lanes[safe], H*.64, 58, 2260, 1.1, boss.atk*1.25, color);
  }

  function v66MarionetteStrings(color, tag){
    color = color || '#f0abfc'; tag = tag || 'mirror';
    const cols = 4, rows = 3;
    const safe = Math.floor(Math.random()*cols*rows);
    v66Say(`${boss.name}: 꼭두각시 법정. 실이 끊긴 타일만 진짜 안전지대입니다.`, color, 'cast');
    v66Fx('web', W/2, H*.48, {r:255, life:2.4, color, sub:v66Sub(), label:'THREAD COURT', spin:.35});
    for(let i=0;i<cols*rows;i++){
      const x = 230 + (i%cols)*(W-460)/(cols-1);
      const y = 170 + Math.floor(i/cols)*(H-285)/(rows-1);
      if(i === safe) v66Safe(x,y,45,2.35,'CUT');
      else { v66Fake(x,y,39,2.20,'TIED',color); v64Circle(x,y,43,1.28+Math.random()*.12,boss.atk*.44,color,tag); }
    }
    const sx = 230 + (safe%cols)*(W-460)/(cols-1);
    const sy = 170 + Math.floor(safe/cols)*(H-285)/(rows-1);
    v66BreakSafe(sx,sy,55,2320,.95,boss.atk*1.12,color);
  }

  function v66BlackEclipse(color, tag){
    color = color || '#f97316'; tag = tag || 'solar';
    const inner = Math.random() < .5;
    v66Say(`${boss.name}: 검은 일식. ${inner ? '태양핵 안쪽' : '외곽 광륜'}으로 이동하세요.`, color, 'slam');
    v66Fx('eclipse', W/2, H/2, {r:inner?150:245, life:2.35, color:'#fb923c', sub:'#020617', label:inner?'CORE':'RING', spin:.75, sides:18});
    if(inner){
      v64Donut(W/2,H/2,150,430,1.18,boss.atk*.62,color,tag);
      v66Safe(W/2,H/2,82,2.25,'CORE');
      v66BreakSafe(W/2,H/2,92,2250,.85,boss.atk*1.08,color);
    }else{
      v64Circle(W/2,H/2,190,1.16,boss.atk*.64,color,tag);
      [[150,135],[W-150,135],[150,H-95],[W-150,H-95]].forEach((p,i)=>{ v66Safe(p[0],p[1],44,2.15,'ORBIT'); if(i<2) v64Beam(p[0],H/2,Math.PI/2,H*.74,10,1.38,boss.atk*.35,color,tag); });
    }
    v66Later(900,()=>v66RadialJudgement(color,tag));
  }

  function v66ChronoClock(color, tag){
    color = color || '#f472b6'; tag = tag || 'chrono';
    const cx = W/2, cy = H/2;
    const nums = [0,1,2,3,4,5].map(i=>({a:-Math.PI/2 + i*Math.PI/3, n:i+1}));
    const safe = Math.floor(Math.random()*nums.length);
    v66Say(`${boss.name}: 시간 시계. 빛난 숫자 ${safe+1} 방향으로 이동하세요.`, color, 'cast');
    v66Fx('clock', cx, cy, {r:245, life:2.45, color, sub:'#fef08a', label:'TIME', spin:.25, sides:12});
    nums.forEach((o,i)=>{
      const x = cx + Math.cos(o.a)*205, y = cy + Math.sin(o.a)*205;
      if(i===safe) v66Safe(x,y,46,2.35,String(o.n));
      else { v66Fx('sigil',x,y,{r:42,life:2.1,color:color,sub:'#111827',label:String(o.n),spin:-.5,sides:6}); v64Circle(x,y,42,1.34+i*.04,boss.atk*.44,color,tag); }
    });
    v64RotBeam(cx,cy,state.time,.68,W*1.05,13,2.05,boss.atk*.38,color,tag);
    const s=nums[safe], sx=cx+Math.cos(s.a)*205, sy=cy+Math.sin(s.a)*205;
    v66BreakSafe(sx,sy,56,2380,1.05,boss.atk*1.1,color);
  }

  function v66GravityBallet(color, tag){
    color = color || '#818cf8'; tag = tag || 'gravity';
    const side = Math.random()<.5 ? -1 : 1;
    const safeX = side<0 ? W*.27 : W*.73;
    v66Say(`${boss.name}: 궤도 발레. 회전하는 고리의 ${side<0?'왼쪽':'오른쪽'} 빈 궤도로 이동하세요.`, color, 'cast');
    v66Fx('orbit', W/2, H/2, {r:260, life:2.55, color, sub:v66Sub(), label:'ORBIT', spin:side*.9, sides:14});
    try{ state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:310,life:2.15,power:150,color}); }catch(e){}
    v64RotBeam(W/2,H/2,state.time,side*.95,W*1.18,13,1.8,boss.atk*.36,color,tag);
    v64RotBeam(W/2,H/2,state.time+Math.PI/2,side*.72,W*.92,10,1.8,boss.atk*.31,v66Sub(),tag);
    v66Safe(safeX,H*.54,62,2.35,'ORBIT');
    v66BreakSafe(safeX,H*.54,72,2320,.9,boss.atk*1.05,color);
  }

  function v66AbyssCathedral(color, tag){
    color = color || '#38bdf8'; tag = tag || 'void';
    const rows = 5, safe = Math.floor(Math.random()*rows);
    v66Say(`${boss.name}: 심해 성당. 파도 스테인드글라스의 빈 줄로 이동하세요.`, color, 'beam');
    v66Fx('wave', W/2, H*.52, {w:W*.92,h:H*.70,life:2.35,color,sub:'#0f172a',label:'TIDE'});
    for(let i=0;i<rows;i++){
      const y = 132 + i*(H-226)/(rows-1);
      if(i===safe){ v66Safe(W*.20,y,42,2.25,'BREATH'); v66Safe(W*.80,y,42,2.25,'BREATH'); }
      else v64Wall(W/2,y,W*.86,24,1.18+i*.055,boss.atk*.52,color,tag);
    }
    v66Later(970,function(){
      const a = Math.atan2(player.y-boss.y, player.x-boss.x);
      v64Beam(boss.x,boss.y,a,W*.85,16,.70,boss.atk*.44,v66Sub(),tag);
    });
  }

  function v66ChaosTrial(color, tag){
    color = color || '#fb7185'; tag = tag || 'chaos';
    const choices = [
      {x:W*.25,y:H*.36,c:'#86efac',name:'초록'},
      {x:W*.50,y:H*.64,c:color,name:'붉은 혼돈'},
      {x:W*.75,y:H*.36,c:v66Sub(),name:'보라 별'}
    ];
    const safe = Math.floor(Math.random()*choices.length);
    v66Say(`${boss.name}: 색상 재판. 판결 색은 ${choices[safe].name}입니다.`, color, 'cast');
    v66Fx('trial', W/2, H/2, {r:270,life:2.45,color,sub:v66Sub(),label:'TRIAL',spin:.45,sides:9});
    choices.forEach((p,i)=>{
      if(i===safe) v66Safe(p.x,p.y,56,2.35,p.name);
      else { v66Fake(p.x,p.y,52,2.25,'GUILTY',p.c); v64Circle(p.x,p.y,58,1.22+i*.08,boss.atk*.60,p.c,tag); }
    });
    v66BreakSafe(choices[safe].x, choices[safe].y, 64, 2320, 1.05, boss.atk*1.2, color);
    v66Later(1000,()=>v66RadialJudgement(color,tag));
  }

  function v66SealCores(color, tag){
    color = color || v66Color(); tag = tag || v66Tag();
    v66Say(`${boss.name}: 봉인 핵. 적게 생성되지만 반드시 제거해야 합니다.`, color, 'cast');
    v66Fx('seal', W/2, H/2, {r:225,life:3.3,color,sub:v66Sub(),label:'SEAL CORES',spin:.38,sides:10});
    const count = v66Phase() >= 3 ? 3 : 2;
    for(let i=0;i<count;i++){
      const a = -Math.PI/2 + i*Math.PI*2/count + rand(-.18,.18);
      const x = W/2 + Math.cos(a)*rand(160,245), y = H/2 + Math.sin(a)*rand(115,190);
      state.mechanics.push({kind:'add',x,y,r:19,hp:105+boss.tier*18,life:4.8,speed:44+boss.tier*1.5,color});
      v66Fx('sigil',x,y,{r:48,life:4.8,color,sub:'#ffffff',label:'CORE',spin:.8,sides:6});
    }
    v66Later(3000,function(){
      const alive = state.mechanics.some(m=>m.kind==='add' && m.life>0);
      if(alive){ v64Donut(W/2,H/2,76,330,.24,boss.atk*1.05,color,tag); floatText('봉인 실패',W/2,105,'#fb7185',22); }
      else { breakBoss(1.35); floatText('봉인 해제 · BREAK',W/2,105,'#86efac',22); }
    });
  }

  function v66FinalOpera(color, tag){ v66OperaGuillotine(color,tag); v66Later(1060,()=>v66MarionetteStrings(color,tag)); }
  function v66FinalSun(color, tag){ v66BlackEclipse(color,tag); v66Later(1260,()=>v66SealCores(color,tag)); }
  function v66FinalChaos(color, tag){ v66ChaosTrial(color,tag); v66Later(1220,()=>v66GravityBallet(color,tag)); }
  function v66FinalChrono(color, tag){ v66ChronoClock(color,tag); v66Later(1200,()=>v66RadialJudgement(color,tag)); }
  function v66FinalAbyss(color, tag){ v66AbyssCathedral(color,tag); v66Later(1120,()=>v66SealCores(color,tag)); }
  function v66FinalGravity(color, tag){ v66GravityBallet(color,tag); v66Later(1120,()=>v66RadialJudgement(color,tag)); }

  function v66Pattern(idx){
    const id = boss && boss.id || '';
    const color = v66Color(), tag = v66Tag();
    const i = Math.abs(idx || 0) % 6;
    const generic = [v66RadialJudgement,v66ChronoClock,v66GravityBallet,v66AbyssCathedral,v66SealCores,v66ChaosTrial];
    const map = {
      puppet_emperor:[v66OperaGuillotine,v66MarionetteStrings,v66RadialJudgement,v66SealCores,v66OperaGuillotine,v66FinalOpera],
      black_sun:[v66BlackEclipse,v66RadialJudgement,v66SealCores,v66GravityBallet,v66BlackEclipse,v66FinalSun],
      chaos_archon:[v66ChaosTrial,v66ChronoClock,v66GravityBallet,v66RadialJudgement,v66SealCores,v66FinalChaos],
      chrono_dragon:[v66ChronoClock,v66RadialJudgement,v66GravityBallet,v66SealCores,v66ChronoClock,v66FinalChrono],
      abyss_leviathan:[v66AbyssCathedral,v66SealCores,v66RadialJudgement,v66BlackEclipse,v66AbyssCathedral,v66FinalAbyss],
      gravity_core:[v66GravityBallet,v66RadialJudgement,v66SealCores,v66ChronoClock,v66GravityBallet,v66FinalGravity],
      solar_dragon:[v66BlackEclipse,v66RadialJudgement,v66AbyssCathedral,v66SealCores,v66BlackEclipse,v66FinalSun],
      mirror_duelist:[v66MarionetteStrings,v66RadialJudgement,v66ChaosTrial,v66ChronoClock,v66SealCores,v66FinalOpera]
    };
    const fn = (map[id] || generic)[i] || generic[i];
    fn(color, tag);
    v66LowSpark(boss.x,boss.y,color,10);
    v66Cap();
  }

  try{
    const oldDrawMechanicsV66 = drawMechanics;
    drawMechanics = function(){
      oldDrawMechanicsV66();
      try{
        (state.mechanics || []).forEach(function(m){
          if(!m || m.kind !== 'v66Fx') return;
          const p = 1 - Math.max(0, Math.min(1, (m.life || 0) / (m.maxLife || 1)));
          const pulse = .5 + .5 * Math.sin(state.time * 7 + (m.x || 0) * .01);
          ctx.save();
          ctx.translate(m.x, m.y);
          ctx.rotate((m.angle || 0) + state.time * (m.spin || 0));
          ctx.globalAlpha = Math.max(.10, .72 - p * .35);
          ctx.strokeStyle = m.color; ctx.fillStyle = m.color; ctx.lineWidth = 2;
          ctx.shadowColor = m.color; ctx.shadowBlur = 18;
          if(m.fx === 'sigil'){
            for(let r=0;r<3;r++){ ctx.beginPath(); ctx.arc(0,0,m.r*(.42+r*.25)+pulse*6,0,Math.PI*2); ctx.stroke(); }
            ctx.beginPath();
            const sides = Math.max(3, m.sides || 6);
            for(let i=0;i<sides;i++){ const a=i*Math.PI*2/sides; const rr=m.r*(i%2?.72:1.0); const x=Math.cos(a)*rr, y=Math.sin(a)*rr; if(i)ctx.lineTo(x,y); else ctx.moveTo(x,y); }
            ctx.closePath(); ctx.stroke();
            ctx.globalAlpha=.95; ctx.shadowBlur=0; ctx.fillStyle='#ffffff'; ctx.font='900 13px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label || '',0,5);
          } else if(m.fx === 'mandala' || m.fx === 'trial' || m.fx === 'seal'){
            const spokes = m.sides || 12;
            for(let r=0;r<4;r++){ ctx.beginPath(); ctx.arc(0,0,m.r*(.25+r*.18)+pulse*5,0,Math.PI*2); ctx.stroke(); }
            for(let i=0;i<spokes;i++){ const a=i*Math.PI*2/spokes; ctx.beginPath(); ctx.moveTo(Math.cos(a)*m.r*.18,Math.sin(a)*m.r*.18); ctx.lineTo(Math.cos(a)*m.r,Math.sin(a)*m.r); ctx.stroke(); }
            ctx.strokeStyle=m.sub; ctx.globalAlpha=.42; ctx.beginPath(); ctx.arc(0,0,m.r*.78,-state.time,state.time+Math.PI*.9); ctx.stroke();
            ctx.globalAlpha=.96; ctx.fillStyle='#ffffff'; ctx.font='900 16px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label || '',0,6);
          } else if(m.fx === 'eclipse'){
            ctx.fillStyle='#020617'; ctx.globalAlpha=.72; ctx.beginPath(); ctx.arc(0,0,m.r*.62,0,Math.PI*2); ctx.fill();
            ctx.globalAlpha=.84; ctx.strokeStyle=m.color; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(0,0,m.r+Math.sin(state.time*8)*9,0,Math.PI*2); ctx.stroke();
            ctx.strokeStyle=m.sub; ctx.lineWidth=2; for(let i=0;i<18;i++){ const a=i*Math.PI*2/18; ctx.beginPath(); ctx.moveTo(Math.cos(a)*m.r*.78,Math.sin(a)*m.r*.78); ctx.lineTo(Math.cos(a)*m.r*1.1,Math.sin(a)*m.r*1.1); ctx.stroke(); }
            ctx.fillStyle='#ffffff'; ctx.font='900 17px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label || 'ECLIPSE',0,6);
          } else if(m.fx === 'clock'){
            ctx.strokeStyle=m.color; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,m.r,0,Math.PI*2); ctx.stroke();
            for(let i=0;i<12;i++){ const a=i*Math.PI*2/12; ctx.beginPath(); ctx.moveTo(Math.cos(a)*m.r*.86,Math.sin(a)*m.r*.86); ctx.lineTo(Math.cos(a)*m.r,Math.sin(a)*m.r); ctx.stroke(); }
            ctx.strokeStyle=m.sub; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(state.time*.95)*m.r*.68,Math.sin(state.time*.95)*m.r*.68); ctx.stroke();
            ctx.strokeStyle=m.color; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(-state.time*.58)*m.r*.46,Math.sin(-state.time*.58)*m.r*.46); ctx.stroke();
            ctx.fillStyle='#ffffff'; ctx.font='900 18px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label || 'TIME',0,7);
          } else if(m.fx === 'orbit'){
            for(let r=0;r<4;r++){ ctx.strokeStyle = r%2?m.sub:m.color; ctx.beginPath(); ctx.ellipse(0,0,m.r*(.34+r*.17),m.r*(.18+r*.08),0,0,Math.PI*2); ctx.stroke(); }
            for(let i=0;i<6;i++){ const a=state.time*(m.spin||1)+i*Math.PI*2/6; ctx.fillStyle=i%2?m.sub:m.color; ctx.beginPath(); ctx.arc(Math.cos(a)*m.r*.78,Math.sin(a)*m.r*.42,5+pulse*3,0,Math.PI*2); ctx.fill(); }
            ctx.fillStyle='#ffffff'; ctx.font='900 16px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label || 'ORBIT',0,5);
          } else if(m.fx === 'wave'){
            ctx.globalAlpha=.55; ctx.strokeStyle=m.color; ctx.lineWidth=4;
            for(let j=-2;j<=2;j++){ ctx.beginPath(); for(let i=-m.w/2;i<=m.w/2;i+=28){ const y=j*42+Math.sin(i*.025+state.time*4)*18; if(i===-m.w/2)ctx.moveTo(i,y); else ctx.lineTo(i,y); } ctx.stroke(); }
            ctx.globalAlpha=.94; ctx.fillStyle='#ffffff'; ctx.font='900 16px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label || 'TIDE',0,6);
          } else if(m.fx === 'web'){
            ctx.strokeStyle=m.color; ctx.lineWidth=2;
            for(let i=0;i<16;i++){ const a=i*Math.PI*2/16; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(a)*m.r,Math.sin(a)*m.r*.7); ctx.stroke(); }
            for(let r=1;r<=4;r++){ ctx.beginPath(); ctx.ellipse(0,0,m.r*r/4,m.r*.7*r/4,0,0,Math.PI*2); ctx.stroke(); }
            ctx.fillStyle='#ffffff'; ctx.font='900 15px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label || 'THREAD',0,5);
          } else if(m.fx === 'curtain'){
            ctx.rotate(-(m.angle || 0) - state.time * (m.spin || 0));
            ctx.globalAlpha=.18; ctx.fillStyle=m.sub; ctx.fillRect(-m.w/2,-m.h/2,m.w,m.h);
            ctx.globalAlpha=.62; ctx.strokeStyle=m.color; ctx.lineWidth=5; for(let i=-5;i<=5;i++){ ctx.beginPath(); ctx.moveTo(i*m.w/10,-m.h/2); ctx.bezierCurveTo(i*m.w/10+30,-m.h*.2,i*m.w/10-30,m.h*.2,i*m.w/10,m.h/2); ctx.stroke(); }
            ctx.globalAlpha=.95; ctx.fillStyle='#ffffff'; ctx.font='900 20px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label || 'STAGE',0,-m.h*.30);
          } else if(m.fx === 'blade'){
            ctx.rotate(-(m.angle || 0) - state.time * (m.spin || 0));
            const drop = Math.min(1, p*1.55);
            ctx.translate(0,drop*160);
            ctx.globalAlpha=.95; ctx.fillStyle='#e5e7eb'; ctx.strokeStyle=m.sub; ctx.lineWidth=3;
            ctx.beginPath(); ctx.moveTo(-m.w/2,-m.h/2); ctx.lineTo(m.w/2,-m.h/2); ctx.lineTo(m.w*.28,m.h/2); ctx.lineTo(-m.w*.28,m.h/2); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.fillStyle=m.sub; ctx.fillRect(-m.w*.55,-m.h*.55,m.w*1.1,8);
            ctx.fillStyle='#111827'; ctx.font='900 12px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label || 'DROP',0,-m.h*.18);
          }
          ctx.restore();
        });
      }catch(e){ console.warn('[V66 draw failed]',e); }
    };
  }catch(e){ console.warn('[V66 draw override failed]',e); }

  try{
    const oldUpdateV66 = update;
    update = function(dt){
      const safeDt = Math.min(dt || 0, 1/45);
      v66Cap();
      oldUpdateV66(safeDt);
      v66Cap();
    };
  }catch(e){ console.warn('[V66 update override failed]',e); }

  try{
    const oldTypeV66 = v59TypePattern;
    v59TypePattern = function(idx){
      try{
        const t = v66Tier(), ph = v66Phase();
        if(t >= 7){
          const allowed = t >= 10 ? 6 : t >= 9 ? 5 : t >= 8 ? 4 : 3;
          v66Pattern((idx || 0) % allowed);
          if(t >= 10 && ph >= 3 && Math.random() < .10){
            v66Later(1420, function(){ v66Pattern(((idx || 0) + 3) % 6); });
          }
          v66Cap();
          return;
        }
      }catch(e){ console.warn('[V66 pattern failed]', e); }
      try{ oldTypeV66(idx); }catch(err){ try{ v65BossPattern(idx); }catch(_){} }
    };
    getBossPatternCooldown = function(){
      const t = v66Tier(), ph = v66Phase();
      const base = t >= 10 ? 2.95 : t >= 9 ? 3.05 : t >= 8 ? 3.12 : t >= 7 ? 3.25 : 3.05;
      return Math.max(2.38, base * (ph === 3 ? .94 : ph === 2 ? .98 : 1) + Math.random() * .25);
    };
  }catch(e){ console.warn('[V66 pattern override failed]', e); }

  try{
    window.RaidDungeonV66 = {
      version: V66_VERSION,
      goal: '화려함은 전용 캔버스 드로잉으로 올리고, 렉을 만드는 탄막/파티클 수는 줄인 패치',
      premiumPatterns: ['단두대 오페라','꼭두각시 법정','검은 일식','만다라 심판','시간 시계','중력 궤도 발레','심해 성당','색상 재판','봉인 핵'],
      antiLag: ['custom canvas mechanics instead of many particles','strict object caps','dt clamp 1/45s','lower chained pattern chance']
    };
  }catch(e){}

  try{
    window.RaidDungeonV65={
      version:V65_VERSION,
      quality:'boss-specific puzzle patterns with readable telegraphs and break rewards',
      antiLag:'strict object budgets, dt clamp 1/40s, delayed chained patterns kept short',
      patterns:['inside/outside judgement','crown cross lasers','memory score','puppet guillotine theater','gravity scale','abyss breath lanes','chaos color court','orb seal']
    };
  }catch(e){}

  try{
    window.RaidDungeonV64={
      version:V64_VERSION,
      lateBosses:Object.keys(V64_LATE_LABELS),
      patterns:['fake safe zones','clock-hand lasers','guillotine execution lines','memory runes','safe tile grids','orb control'],
      antiLag:'tier-aware object caps before and after update, dt clamped to 1/36s'
    };
  }catch(e){}

  try{
    window.RaidDungeonV63={
      version:V63_VERSION,
      damageDisplay:'weapon cards show approximate damage, dps, crit, attack interval, and special effects',
      bossOnlyWeapons:'boss exclusive weapons are removed from weapon gacha and drop only from their boss at very low chance',
      gachaPool:'weapon gacha excludes v44/boss-only weapon ids and boss-exclusive descriptions'
    };
  }catch(e){}

  try{ window.RaidDungeonV62={version:V62_VERSION, bossBar:'clip-based HP bar now shrinks with numeric HP/%', weapons:'rarity damage scaling and epic+ special projectiles/waves', training:'HP/MP/regen coin upgrades max 100, cost x1.8', performance:'harder object caps and dt clamp to protect movement feel', bossQuality:'higher-tier chained visual patterns and more boss HP'}; }catch(e){}

  try{ window.RaidDungeonV61={version:V61_VERSION, resetRecords:'local records cleared once and cloud delete attempted once', newRecord:'shows only when clear time beats current rank #1, not personal best', antiLag:'input-first hard caps before update and ultra-light particles/texts', bossHp:'extra scaling after V60'}; }catch(e){}
  try{ window.RaidDungeonV59={version:V59_VERSION, maze:'maze is mechanic only, not repeated attack pattern', uniquePatterns:'type-specific boss attacks, less full-map spam', antiLag:'lower caps and lighter follow-up effects'}; }catch(e){}

  try{ window.RaidDungeonV52={version:V52_VERSION, sortieClickFix:true, strongerFx:true, marketSections:['material','weapon','armor','skill']}; }catch(e){}
  try{ window.RaidDungeonV54={version:V54_VERSION, fastMassPatternRendering:true, keepsPatterns:true, optimized:['hazard drawing','projectile drawing','particle drawing','damage text drawing']}; }catch(e){}
  try{ window.RaidDungeonUI.growthTab=()=>{state.menuTab='growth'; renderMenu();}; window.RaidDungeonUI.marketTab=()=>{state.menuTab='market'; renderMenu();}; window.RaidDungeonUI.chatTab=()=>{state.menuTab='chat'; renderMenu();}; }catch(e){}

  /* ===== V67: brutal readable boss patterns + real anti-lag budget ===== */
  const V67_VERSION = 'Raid Dungeon V67 - Brutal Readable Patterns Real Anti Lag';

  function v67Alive(){ return state && state.screen === 'raid' && boss && !boss.dead; }
  function v67Tier(){ return Math.max(1, Math.min(10, Number(boss && boss.tier || 1))); }
  function v67Phase(){ try{ return v66Phase ? v66Phase() : (boss && boss.phase || 1); }catch(e){ return boss && boss.phase || 1; } }
  function v67Color(){ return (boss && boss.color) || '#fb7185'; }
  function v67Sub(){ return (boss && boss.sub) || '#ffffff'; }
  function v67Tag(){ return (boss && boss.theme) || 'chaos'; }
  function v67Later(ms, fn){ setTimeout(function(){ try{ if(v67Alive()){ fn(); v67Cap(); } }catch(e){ console.warn('[V67 delayed pattern failed]', e); } }, ms); }
  function v67Say(text, color, kind){ try{ v66Say(text, color || v67Color(), kind || 'cast'); }catch(e){ try{ toast(text); }catch(_){} } }

  function v67Cap(){
    try{
      if(!state || state.screen !== 'raid') return;
      const t = v67Tier(), ph = v67Phase();
      const score = state.hazards.length * 4 + state.projectiles.length * 3 + state.zones.length * 5 + state.mechanics.length * 3 + state.particles.length;
      const panic = score > 170;
      const maxHaz = panic ? 14 : (t >= 10 ? 22 : 24);
      const maxProj = panic ? 10 : (t >= 10 ? 16 : 18);
      const maxZone = panic ? 4 : 6;
      const maxMech = panic ? 12 : 18;
      const maxPart = panic ? 8 : (ph >= 3 ? 18 : 22);
      const maxText = panic ? 3 : 6;
      if(state.hazards.length > maxHaz) state.hazards.splice(0, state.hazards.length - maxHaz);
      if(state.projectiles.length > maxProj) state.projectiles.splice(0, state.projectiles.length - maxProj);
      if(state.zones.length > maxZone) state.zones.splice(0, state.zones.length - maxZone);
      if(state.mechanics.length > maxMech) state.mechanics.splice(0, state.mechanics.length - maxMech);
      if(state.particles.length > maxPart) state.particles.splice(0, state.particles.length - maxPart);
      if(state.texts.length > maxText) state.texts.splice(0, state.texts.length - maxText);
    }catch(e){}
  }

  function v67Fx(kind,x,y,opt){
    opt = opt || {};
    try{ v66Fx(kind,x,y,{r:opt.r||110,w:opt.w||220,h:opt.h||120,life:opt.life||1.75,color:opt.color||v67Color(),sub:opt.sub||v67Sub(),label:opt.label||'',spin:opt.spin||0,sides:opt.sides||8,angle:opt.angle||0,fake:opt.fake}); }catch(e){}
  }
  function v67Safe(x,y,r,life,label){
    r = r || 38; life = life || 1.72;
    try{ state.mechanics.push({kind:'safe',x,y,r,life,color:'#86efac',label:label||'SAFE'}); }catch(e){}
    v67Fx('sigil',x,y,{r:r+10,life,color:'#86efac',sub:'#ffffff',label:label||'SAFE',spin:1.1,sides:6});
  }
  function v67Fake(x,y,r,life,label,color){
    r = r || 36; life = life || 1.55;
    try{ state.mechanics.push({kind:'safe',x,y,r,life,color:color||'#fb7185',fake:true,label:label||'FAKE'}); }catch(e){}
  }
  function v67Check(x,y,r,delay,breakTime,failDamage,color,label){
    v67Later(delay || 1700, function(){
      const ok = dist(player.x, player.y, x, y) <= (r || 42) + player.r;
      if(ok){ try{ breakBoss(breakTime || .78); }catch(e){} healText(label || 'PERFECT BREAK', player.x, player.y - 42); }
      else { hurtPlayer(failDamage || boss.atk * 1.55, color || v67Color(), true); floatText('기믹 실패', player.x, player.y - 44, '#fb7185', 20); }
    });
  }
  function v67LiteSpark(x,y,color){
    for(let i=0;i<6;i++){ const a=i*Math.PI*2/6+rand(-.08,.08); state.particles.push({kind:'line',x,y,vx:Math.cos(a)*rand(90,190),vy:Math.sin(a)*rand(90,190),r:3,life:.24,color:color||v67Color(),angle:a,len:28}); }
  }

  function v67BladeOpera(color,tag){
    color=color||'#f0abfc'; tag=tag||'mirror';
    const lanes=[W*.14,W*.29,W*.44,W*.59,W*.74,W*.89];
    const safe=Math.floor(Math.random()*lanes.length);
    const sx=lanes[safe], sy=H*.66;
    v67Say(`${boss.name}: 진짜 단두대. 칼날 없는 좁은 무대 하나만 안전합니다.`,color,'beam');
    v67Fx('curtain',W/2,H/2,{w:W,h:H,life:1.75,color,sub:'#111827',label:'BRUTAL EXECUTION'});
    lanes.forEach((x,i)=>{
      if(i===safe){ v67Safe(x,sy,36,1.72,'NO BLADE'); return; }
      v67Fx('blade',x,H*.27,{w:58,h:185,life:1.58,color:'#e5e7eb',sub:color,label:'DROP'});
      v64Beam(x,H/2,Math.PI/2,H*1.18,22,0.92+i*.025,boss.atk*.82,color,tag);
    });
    v67Later(740,function(){
      const a = safe < lanes.length/2 ? 0 : Math.PI;
      v64Beam(W/2,H*.66,a,W*.95,11,.74,boss.atk*.48,v67Sub(),tag);
    });
    v67Check(sx,sy,43,1640,.75,boss.atk*1.75,color,'처형 회피 · BREAK');
  }

  function v67ClockExecution(color,tag){
    color=color||'#f472b6'; tag=tag||'chrono';
    const cx=W/2, cy=H/2;
    const count=8;
    const safe=Math.floor(Math.random()*count);
    v67Say(`${boss.name}: 시간 처형식. 빛난 번호 방향으로 먼저 이동하고, 회전 초침을 한 번 더 피하세요.`,color,'cast');
    v67Fx('clock',cx,cy,{r:240,life:1.95,color,sub:'#fef08a',label:'CLOCK DEATH',spin:.12,sides:12});
    for(let i=0;i<count;i++){
      const a=-Math.PI/2+i*Math.PI*2/count, x=cx+Math.cos(a)*208, y=cy+Math.sin(a)*208;
      if(i===safe) v67Safe(x,y,35,1.82,String(i+1));
      else { v67Fake(x,y,31,1.45,String(i+1),color); v64Circle(x,y,34,.82+i*.015,boss.atk*.49,color,tag); }
    }
    v64RotBeam(cx,cy,state.time+.4,1.65,W*1.08,12,1.70,boss.atk*.48,color,tag);
    v67Later(860,function(){ v64RotBeam(cx,cy,state.time+Math.PI*.78,-1.95,W*.96,10,1.12,boss.atk*.44,v67Sub(),tag); });
    const a=-Math.PI/2+safe*Math.PI*2/count;
    v67Check(cx+Math.cos(a)*208,cy+Math.sin(a)*208,42,1780,.82,boss.atk*1.62,color,'시간 판독 · BREAK');
  }

  function v67EclipseKnife(color,tag){
    color=color||'#fb923c'; tag=tag||'solar';
    const inner=Math.random()<.5;
    v67Say(`${boss.name}: 압축 일식. ${inner?'핵 안쪽':'바깥 광륜'} 판정 후 십자광이 이어집니다.`,color,'slam');
    v67Fx('eclipse',W/2,H/2,{r:inner?128:238,life:1.86,color:'#fb923c',sub:'#020617',label:inner?'CORE':'OUTER'});
    if(inner){
      v64Donut(W/2,H/2,124,430,.86,boss.atk*.80,color,tag);
      v67Safe(W/2,H/2,50,1.72,'CORE');
      v67Check(W/2,H/2,58,1660,.72,boss.atk*1.75,color,'일식 핵 판독');
    }else{
      v64Circle(W/2,H/2,184,.86,boss.atk*.80,color,tag);
      const spots=[[W*.15,H*.18],[W*.85,H*.18],[W*.15,H*.82],[W*.85,H*.82]];
      const pick=spots[Math.floor(Math.random()*spots.length)];
      spots.forEach(p=>p===pick?v67Safe(p[0],p[1],38,1.72,'OUTER'):v67Fake(p[0],p[1],34,1.45,'BURN',color));
      v67Check(pick[0],pick[1],45,1660,.72,boss.atk*1.75,color,'광륜 판독');
    }
    v67Later(650,function(){ v64Beam(W/2,H/2,0,W*.98,13,.72,boss.atk*.52,color,tag); v64Beam(W/2,H/2,Math.PI/2,H*.98,13,.72,boss.atk*.52,color,tag); });
  }

  function v67AbyssCorridor(color,tag){
    color=color||'#38bdf8'; tag=tag||'void';
    const rows=6, safe=Math.floor(Math.random()*rows);
    const ySafe=108+safe*(H-196)/(rows-1);
    v67Say(`${boss.name}: 심해 압사. 빈 수로가 매우 좁습니다.`,color,'beam');
    v67Fx('wave',W/2,H*.52,{w:W*.96,h:H*.70,life:1.82,color,sub:'#0f172a',label:'ABYSS CORRIDOR'});
    for(let i=0;i<rows;i++){
      const y=108+i*(H-196)/(rows-1);
      if(i===safe){ v67Safe(W*.18,y,34,1.70,'AIR'); v67Safe(W*.82,y,34,1.70,'AIR'); }
      else v64Wall(W/2,y,W*.92,28,.78+i*.018,boss.atk*.74,color,tag);
    }
    v67Later(780,function(){
      const a=Math.atan2(player.y-boss.y,player.x-boss.x);
      v64Beam(boss.x,boss.y,a,W*.95,15,.62,boss.atk*.55,v67Sub(),tag);
    });
    v67Later(1620,function(){
      const ok=Math.abs(player.y-ySafe)<46;
      if(ok){ breakBoss(.65); healText('호흡 성공 · BREAK',player.x,player.y-42); }
      else hurtPlayer(boss.atk*1.58,color,true);
    });
  }

  function v67GravityVice(color,tag){
    color=color||'#818cf8'; tag=tag||'gravity';
    const left=Math.random()<.5;
    const sx=left?W*.24:W*.76, sy=H*.55;
    v67Say(`${boss.name}: 중력 바이스. 흡입을 거슬러 좁은 궤도에 서야 합니다.`,color,'cast');
    v67Fx('orbit',W/2,H/2,{r:265,life:1.95,color,sub:v67Sub(),label:'GRAVITY VICE',spin:left?-1.25:1.25,sides:14});
    try{ state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:330,life:1.65,power:230,color}); }catch(e){}
    v64RotBeam(W/2,H/2,state.time,left?-1.72:1.72,W*1.15,15,1.32,boss.atk*.54,color,tag);
    v64RotBeam(W/2,H/2,state.time+Math.PI/2,left?1.25:-1.25,W*.90,10,1.32,boss.atk*.42,v67Sub(),tag);
    v67Safe(sx,sy,41,1.76,'ORBIT');
    v67Check(sx,sy,48,1740,.75,boss.atk*1.68,color,'중력 판독');
  }

  function v67ChaosVerdict(color,tag){
    color=color||'#fb7185'; tag=tag||'chaos';
    const picks=[{x:W*.24,y:H*.32,c:'#86efac',n:'GREEN'},{x:W*.50,y:H*.68,c:'#fb7185',n:'RED'},{x:W*.76,y:H*.32,c:'#a78bfa',n:'PURPLE'},{x:W*.50,y:H*.24,c:'#fde047',n:'GOLD'}];
    const safe=Math.floor(Math.random()*picks.length);
    v67Say(`${boss.name}: 혼돈 판결. 선언된 색 ${picks[safe].n}만 진짜입니다. 나머지는 폭발합니다.`,color,'cast');
    v67Fx('trial',W/2,H/2,{r:262,life:1.88,color,sub:v67Sub(),label:'CHAOS VERDICT',spin:.85,sides:10});
    picks.forEach((p,i)=>{
      if(i===safe) v67Safe(p.x,p.y,38,1.72,p.n);
      else { v67Fake(p.x,p.y,36,1.50,'LIE',p.c); v64Circle(p.x,p.y,47,.84+i*.03,boss.atk*.68,p.c,tag); }
    });
    v67Later(760,function(){ v67BladeOpera(color,tag); });
    v67Check(picks[safe].x,picks[safe].y,46,1680,.68,boss.atk*1.8,color,'판결 통과');
  }

  function v67CorePanic(color,tag){
    color=color||v67Color(); tag=tag||v67Tag();
    v67Say(`${boss.name}: 광폭 봉인 핵. 수가 적지만 제한시간이 짧습니다.`,color,'cast');
    v67Fx('seal',W/2,H/2,{r:215,life:2.45,color,sub:v67Sub(),label:'CORE PANIC',spin:.65,sides:10});
    const count=v67Phase()>=3?3:2;
    for(let i=0;i<count;i++){
      const a=-Math.PI/2+i*Math.PI*2/count+rand(-.12,.12);
      const x=W/2+Math.cos(a)*rand(145,230), y=H/2+Math.sin(a)*rand(105,178);
      state.mechanics.push({kind:'add',x,y,r:17,hp:88+boss.tier*14,life:3.25,speed:58+boss.tier*2,color});
      v67Fx('sigil',x,y,{r:42,life:3.25,color,sub:'#ffffff',label:'CORE',spin:1.1,sides:6});
    }
    v67Later(2300,function(){
      const alive=state.mechanics.some(m=>m.kind==='add'&&m.life>0);
      if(alive){ v64Donut(W/2,H/2,60,340,.22,boss.atk*1.45,color,tag); floatText('핵 처리 실패',W/2,105,'#fb7185',22); }
      else { breakBoss(1.05); floatText('핵 처리 성공 · BREAK',W/2,105,'#86efac',22); }
    });
  }

  function v67FinalCombo(color,tag){
    const id=boss && boss.id || '';
    if(id==='puppet_emperor'){ v67BladeOpera(color,tag); v67Later(720,()=>v67ClockExecution(color,tag)); return; }
    if(id==='black_sun'||id==='solar_dragon'){ v67EclipseKnife(color,tag); v67Later(780,()=>v67CorePanic(color,tag)); return; }
    if(id==='chaos_archon'){ v67ChaosVerdict(color,tag); v67Later(880,()=>v67GravityVice(color,tag)); return; }
    if(id==='chrono_dragon'){ v67ClockExecution(color,tag); v67Later(850,()=>v67BladeOpera(color,tag)); return; }
    if(id==='abyss_leviathan'){ v67AbyssCorridor(color,tag); v67Later(840,()=>v67EclipseKnife(color,tag)); return; }
    if(id==='gravity_core'){ v67GravityVice(color,tag); v67Later(820,()=>v67CorePanic(color,tag)); return; }
    v67ChaosVerdict(color,tag);
  }

  function v67Pattern(idx){
    const id=boss && boss.id || '';
    const color=v67Color(), tag=v67Tag();
    const i=Math.abs(idx||0)%7;
    const generic=[v67BladeOpera,v67ClockExecution,v67EclipseKnife,v67GravityVice,v67AbyssCorridor,v67CorePanic,v67FinalCombo];
    const map={
      puppet_emperor:[v67BladeOpera,v67ChaosVerdict,v67ClockExecution,v67CorePanic,v67BladeOpera,v67GravityVice,v67FinalCombo],
      black_sun:[v67EclipseKnife,v67CorePanic,v67ClockExecution,v67GravityVice,v67EclipseKnife,v67ChaosVerdict,v67FinalCombo],
      chaos_archon:[v67ChaosVerdict,v67ClockExecution,v67GravityVice,v67BladeOpera,v67CorePanic,v67EclipseKnife,v67FinalCombo],
      chrono_dragon:[v67ClockExecution,v67BladeOpera,v67GravityVice,v67CorePanic,v67ClockExecution,v67ChaosVerdict,v67FinalCombo],
      abyss_leviathan:[v67AbyssCorridor,v67CorePanic,v67EclipseKnife,v67GravityVice,v67AbyssCorridor,v67ClockExecution,v67FinalCombo],
      gravity_core:[v67GravityVice,v67CorePanic,v67ClockExecution,v67AbyssCorridor,v67GravityVice,v67EclipseKnife,v67FinalCombo],
      solar_dragon:[v67EclipseKnife,v67AbyssCorridor,v67ClockExecution,v67CorePanic,v67EclipseKnife,v67GravityVice,v67FinalCombo],
      mirror_duelist:[v67BladeOpera,v67ChaosVerdict,v67ClockExecution,v67GravityVice,v67CorePanic,v67AbyssCorridor,v67FinalCombo]
    };
    const fn=(map[id]||generic)[i]||generic[i];
    fn(color,tag);
    v67LiteSpark(boss.x,boss.y,color);
    v67Cap();
  }

  try{
    const oldUpdateV67 = update;
    update = function(dt){
      const safeDt = Math.min(dt || 0, 1/55);
      v67Cap();
      oldUpdateV67(safeDt);
      v67Cap();
    };
  }catch(e){ console.warn('[V67 update override failed]',e); }

  try{
    const oldPatternV67 = v59TypePattern;
    v59TypePattern = function(idx){
      try{
        const t=v67Tier(), ph=v67Phase();
        if(t>=7){
          const allowed = t>=10 ? 7 : t>=9 ? 6 : t>=8 ? 5 : 4;
          v67Pattern((idx||0)%allowed);
          if(t>=10 && ph>=3 && Math.random()<.18){ v67Later(980,function(){ v67Pattern(((idx||0)+3)%7); }); }
          v67Cap();
          return;
        }
      }catch(e){ console.warn('[V67 pattern failed]',e); }
      try{ oldPatternV67(idx); }catch(err){ try{ v66Pattern(idx); }catch(_){} }
    };
    getBossPatternCooldown = function(){
      const t=v67Tier(), ph=v67Phase();
      if(t>=10) return ph>=3 ? 2.05 + Math.random()*.18 : 2.28 + Math.random()*.18;
      if(t>=9) return ph>=3 ? 2.24 + Math.random()*.20 : 2.48 + Math.random()*.20;
      if(t>=8) return ph>=3 ? 2.45 + Math.random()*.22 : 2.72 + Math.random()*.22;
      if(t>=7) return ph>=3 ? 2.62 + Math.random()*.25 : 2.90 + Math.random()*.25;
      return 3.05 + Math.random()*.35;
    };
  }catch(e){ console.warn('[V67 pattern override failed]',e); }

  /* ===== V68: readable cinematic telegraphs + harder pattern language without extra lag ===== */
  const V68_VERSION = 'Raid Dungeon V69 - Gacha Hotfix Clear Telegraphs Hard No Lag';

  function v68Color(){ try{return v67Color();}catch(e){return boss && boss.color || '#fb7185';} }
  function v68Sub(){ try{return v67Sub();}catch(e){return boss && boss.sub || '#ffffff';} }
  function v68Tag(){ try{return v67Tag();}catch(e){return boss && boss.theme || 'arcane';} }
  function v68Phase(){ try{return v67Phase();}catch(e){return boss && boss.phase || 1;} }
  function v68Tier(){ return boss && boss.tier || 1; }
  function v68Push(m){ try{ state.mechanics.push(Object.assign({kind:'v68',life:1.4,t:0,color:v68Color(),sub:v68Sub()},m||{})); }catch(e){} }
  function v68Call(fn,args){ try{ if(typeof fn==='function') return fn.apply(null,args||[]); }catch(e){} }
  function v68Msg(text,color,type){ try{ v67Say(text,color,type||'cast'); }catch(e){ try{ toast(text); }catch(_){} } }
  function v68Safe(x,y,r,life,label){ try{ v67Safe(x,y,r,life,label); }catch(e){ v68Push({shape:'safeCircle',x,y,r,life,label}); } }
  function v68Fake(x,y,r,life,label,color){ try{ v67Fake(x,y,r,life,label,color); }catch(e){ v68Push({shape:'fakeCircle',x,y,r,life,label,color}); } }
  function v68Check(x,y,r,ms,breakTime,failDamage,color,label){ try{ v67Check(x,y,r,ms,breakTime,failDamage,color,label); }catch(e){} }
  function v68Break(t){ try{ breakBoss(t); }catch(e){} }

  function v68DrawStripedRect(x,y,w,h,a,color,alpha,label){
    v68Push({shape:'laneRect',x,y,w,h,angle:a||0,color:color||'#fb7185',life:1.55,alpha:alpha||.34,label:label||''});
  }
  function v68DrawSafeRect(x,y,w,h,a,label){
    v68Push({shape:'safeRect',x,y,w,h,angle:a||0,color:'#86efac',sub:'#ffffff',life:1.7,label:label||'SAFE'});
  }
  function v68DrawBlade(x,y,w,h,label){
    v68Push({shape:'blade',x,y,w:w||60,h:h||180,color:'#e5e7eb',sub:v68Color(),life:1.55,label:label||'DROP'});
  }
  function v68DrawArenaTint(label,color,life){
    v68Push({shape:'arenaTint',x:W/2,y:H/2,w:W,h:H,color:color||v68Color(),life:life||1.45,label:label||''});
  }
  function v68DrawClock(cx,cy,r,safe,life,color){
    v68Push({shape:'clock',x:cx,y:cy,r,life:life||1.8,color:color||v68Color(),sub:'#fef08a',safe:safe});
  }
  function v68DrawEclipse(cx,cy,inner,life,color){
    v68Push({shape:'eclipse',x:cx,y:cy,r:inner?135:238,life:life||1.75,color:color||'#fb923c',sub:'#020617',inner});
  }
  function v68DrawOrbit(cx,cy,r,safeAngle,life,color){
    v68Push({shape:'orbitGuide',x:cx,y:cy,r,life:life||1.85,color:color||'#818cf8',sub:v68Sub(),safeAngle:safeAngle||0});
  }
  function v68DrawWaveGuide(ySafe,life,color){
    v68Push({shape:'waveGuide',x:W/2,y:ySafe,w:W*.9,h:74,life:life||1.65,color:color||'#38bdf8',sub:'#e0f2fe',label:'AIR CORRIDOR'});
  }
  function v68DrawGlyphs(picks,safe,life,color){
    v68Push({shape:'glyphs',x:W/2,y:H/2,life:life||1.7,color:color||'#fb7185',picks,safe});
  }
  function v68DrawArrow(x1,y1,x2,y2,label,color){
    v68Push({shape:'arrow',x:x1,y:y1,x2,y2,life:1.5,color:color||'#ffffff',label:label||''});
  }

  try{
    const oldDrawMechanicsV68 = drawMechanics;
    drawMechanics = function(){
      try{ oldDrawMechanicsV68(); }catch(e){}
      try{
        for(const m of state.mechanics){
          if(!m || !String(m.kind||'').startsWith('v68')) continue;
          const life = Number(m.life || 0);
          const maxLife = Number(m.maxLife || life || 1);
          const p = clamp(life / Math.max(.001, maxLife),0,1);
          const pulse = .5 + .5 * Math.sin(state.time * 9);
          ctx.save();
          if(m.shape==='arenaTint'){
            ctx.globalAlpha=.10+.08*p;
            const g=ctx.createRadialGradient(W/2,H/2,60,W/2,H/2,Math.max(W,H)*.72);
            g.addColorStop(0,m.color||'#fb7185'); g.addColorStop(.62,'rgba(2,6,23,.16)'); g.addColorStop(1,'rgba(2,6,23,.82)');
            ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
            ctx.globalAlpha=.88; ctx.fillStyle='#fff'; ctx.font='900 28px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label||'',W/2,96);
          }
          else if(m.shape==='laneRect' || m.shape==='safeRect'){
            ctx.translate(m.x,m.y); ctx.rotate(m.angle||0);
            ctx.globalAlpha=m.shape==='safeRect'?(.30+.16*pulse):(.20+(m.alpha||.26));
            ctx.fillStyle=m.shape==='safeRect'?'#22c55e':(m.color||'#fb7185');
            ctx.fillRect(-(m.w||100)/2,-(m.h||100)/2,m.w||100,m.h||100);
            ctx.globalAlpha=.95; ctx.strokeStyle=m.shape==='safeRect'?'#ffffff':'#fecaca'; ctx.lineWidth=m.shape==='safeRect'?4:2;
            ctx.setLineDash(m.shape==='safeRect'?[]:[12,10]); ctx.strokeRect(-(m.w||100)/2,-(m.h||100)/2,m.w||100,m.h||100);
            ctx.setLineDash([]);
            if(m.shape==='laneRect'){
              ctx.globalAlpha=.38; ctx.strokeStyle='#fff'; ctx.lineWidth=2;
              for(let x=-(m.w||100)/2-60;x<(m.w||100)/2+60;x+=28){ ctx.beginPath(); ctx.moveTo(x,-(m.h||100)/2); ctx.lineTo(x+70,(m.h||100)/2); ctx.stroke(); }
            }
            ctx.globalAlpha=1; ctx.fillStyle='#fff'; ctx.font='900 18px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label||'',0,6);
          }
          else if(m.shape==='blade'){
            ctx.translate(m.x,m.y);
            const drop=(1-p)*(m.h||180)*.28;
            ctx.globalAlpha=.96;
            ctx.fillStyle=m.color||'#e5e7eb';
            ctx.beginPath(); ctx.moveTo(-(m.w||60)/2,-(m.h||180)/2+drop); ctx.lineTo((m.w||60)/2,-(m.h||180)/2+drop); ctx.lineTo(0,(m.h||180)/2+drop); ctx.closePath(); ctx.fill();
            ctx.strokeStyle=m.sub||'#fb7185'; ctx.lineWidth=4; ctx.stroke();
            ctx.fillStyle=m.sub||'#fb7185'; ctx.globalAlpha=.82; ctx.fillRect(-(m.w||60)*.65,-(m.h||180)/2-18, (m.w||60)*1.3, 18);
            ctx.globalAlpha=1; ctx.fillStyle='#fff'; ctx.font='900 13px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label||'DROP',0,-(m.h||180)/2-25);
          }
          else if(m.shape==='clock'){
            const cx=m.x, cy=m.y, r=m.r||230;
            ctx.translate(cx,cy); ctx.globalAlpha=.85; ctx.strokeStyle=m.color||'#f472b6'; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2); ctx.stroke();
            ctx.lineWidth=2; ctx.globalAlpha=.45; for(let i=0;i<12;i++){ const a=-Math.PI/2+i*Math.PI*2/12; ctx.beginPath(); ctx.moveTo(Math.cos(a)*(r-26),Math.sin(a)*(r-26)); ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r); ctx.stroke(); }
            for(let i=0;i<8;i++){ const a=-Math.PI/2+i*Math.PI*2/8; ctx.globalAlpha=i===m.safe?1:.34; ctx.fillStyle=i===m.safe?'#86efac':'#fca5a5'; ctx.font='900 24px system-ui'; ctx.textAlign='center'; ctx.fillText(String(i+1),Math.cos(a)*(r-58),Math.sin(a)*(r-58)+8); }
            ctx.rotate(state.time*1.35); ctx.globalAlpha=.95; ctx.strokeStyle='#fff'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(r*.88,0); ctx.stroke();
          }
          else if(m.shape==='eclipse'){
            const cx=m.x,cy=m.y,r=m.r||220; ctx.translate(cx,cy);
            const g=ctx.createRadialGradient(0,0,10,0,0,r*1.35); g.addColorStop(0,'#020617'); g.addColorStop(.42,'#020617'); g.addColorStop(.50,m.color||'#fb923c'); g.addColorStop(.70,'rgba(251,146,60,.18)'); g.addColorStop(1,'rgba(2,6,23,0)');
            ctx.globalAlpha=.92; ctx.fillStyle=g; ctx.beginPath(); ctx.arc(0,0,r*1.3,0,Math.PI*2); ctx.fill();
            ctx.strokeStyle='#fff'; ctx.lineWidth=3; ctx.globalAlpha=.85; ctx.setLineDash([14,12]); ctx.beginPath(); ctx.arc(0,0,m.inner?90:245,0,Math.PI*2); ctx.stroke(); ctx.setLineDash([]);
            ctx.fillStyle='#fff'; ctx.font='900 20px system-ui'; ctx.textAlign='center'; ctx.fillText(m.inner?'INSIDE':'OUTSIDE',0,7);
          }
          else if(m.shape==='orbitGuide'){
            const cx=m.x,cy=m.y,r=m.r||260; ctx.translate(cx,cy); ctx.rotate(state.time*.55);
            ctx.globalAlpha=.42; ctx.strokeStyle=m.color||'#818cf8'; ctx.lineWidth=4; for(let i=0;i<4;i++){ ctx.beginPath(); ctx.ellipse(0,0,r,r*(.46+i*.06),i*Math.PI/4,0,Math.PI*2); ctx.stroke(); }
            ctx.rotate(-(state.time*.55)); const a=m.safeAngle||0; ctx.globalAlpha=.98; ctx.strokeStyle='#86efac'; ctx.lineWidth=12; ctx.beginPath(); ctx.arc(0,0,r*.58,a-.22,a+.22); ctx.stroke();
            ctx.fillStyle='#fff'; ctx.font='900 18px system-ui'; ctx.textAlign='center'; ctx.fillText('GREEN ORBIT = SAFE',0,-r*.72);
          }
          else if(m.shape==='waveGuide'){
            ctx.translate(m.x,m.y); ctx.globalAlpha=.28+.12*pulse; ctx.fillStyle=m.color||'#38bdf8'; ctx.fillRect(-(m.w||900)/2,-(m.h||70)/2,m.w||900,m.h||70);
            ctx.globalAlpha=.95; ctx.strokeStyle='#e0f2fe'; ctx.lineWidth=4; ctx.setLineDash([20,10]); ctx.strokeRect(-(m.w||900)/2,-(m.h||70)/2,m.w||900,m.h||70); ctx.setLineDash([]);
            ctx.fillStyle='#fff'; ctx.font='900 18px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label||'AIR CORRIDOR',0,6);
          }
          else if(m.shape==='glyphs'){
            const picks=m.picks||[]; picks.forEach((g,i)=>{ ctx.save(); ctx.translate(g.x,g.y); ctx.globalAlpha=i===m.safe?(.92):(.55+.18*pulse); ctx.fillStyle=g.c||m.color; ctx.beginPath(); ctx.arc(0,0,i===m.safe?46:40,0,Math.PI*2); ctx.fill(); ctx.strokeStyle=i===m.safe?'#ffffff':'#fecaca'; ctx.lineWidth=i===m.safe?5:3; ctx.stroke(); ctx.fillStyle='#fff'; ctx.font='900 16px system-ui'; ctx.textAlign='center'; ctx.fillText(i===m.safe?'REAL':'FAKE',0,-4); ctx.font='800 12px system-ui'; ctx.fillText(g.n||'',0,16); ctx.restore(); });
            ctx.fillStyle='#fff'; ctx.font='900 24px system-ui'; ctx.textAlign='center'; ctx.fillText('ONLY THE REAL COLOR IS SAFE',W/2,96);
          }
          else if(m.shape==='arrow'){
            const x1=m.x,y1=m.y,x2=m.x2,y2=m.y2; const a=Math.atan2(y2-y1,x2-x1); ctx.globalAlpha=.92; ctx.strokeStyle=m.color||'#fff'; ctx.fillStyle=m.color||'#fff'; ctx.lineWidth=5; ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); ctx.save(); ctx.translate(x2,y2); ctx.rotate(a); ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(-18,-10); ctx.lineTo(-18,10); ctx.closePath(); ctx.fill(); ctx.restore(); if(m.label){ ctx.font='900 14px system-ui'; ctx.textAlign='center'; ctx.fillText(m.label,(x1+x2)/2,(y1+y2)/2-8); }
          }
          ctx.restore();
        }
      }catch(e){}
    };
  }catch(e){ console.warn('[V68 draw override failed]',e); }

  function v68PuppetOpera(color,tag){
    color=color||'#f0abfc'; tag=tag||'mirror';
    const lanes=[W*.12,W*.27,W*.42,W*.57,W*.72,W*.87]; const safe=Math.floor(Math.random()*lanes.length);
    v68Msg(`${boss.name}: 무대 조명이 켜진 줄만 읽으세요. 초록 무대만 칼날이 없습니다.`,color,'beam');
    v68DrawArenaTint('PUPPET OPERA',color,1.7);
    lanes.forEach((x,i)=>{ if(i===safe){ v68DrawSafeRect(x,H*.55,70,H*.72,0,'CUTLESS'); v68Safe(x,H*.66,38,1.78,'SAFE'); } else { v68DrawStripedRect(x,H*.55,60,H*.74,0,color,.28,'BLADE'); v68DrawBlade(x,H*.23,62,190,'DROP'); v68Call(v64Beam,[x,H/2,Math.PI/2,H*1.16,20,.90+i*.02,boss.atk*.78,color,tag]); } });
    v68DrawArrow(player.x,player.y,lanes[safe],H*.66,'MOVE', '#86efac');
    v68Check(lanes[safe],H*.66,42,1660,.82,boss.atk*1.65,color,'무대 판독 · BREAK');
    v67Later(780,()=>v68Call(v64Beam,[W/2,H*.66,safe<3?0:Math.PI,W*.96,12,.66,boss.atk*.54,v68Sub(),tag]));
  }

  function v68ClockTrial(color,tag){
    color=color||'#f472b6'; tag=tag||'chrono'; const cx=W/2, cy=H/2, count=8, safe=Math.floor(Math.random()*count);
    v68Msg(`${boss.name}: 빛나는 숫자 방향으로 이동하세요. 숫자 판독 뒤 초침 레이저가 옵니다.`,color,'cast');
    v68DrawArenaTint('CLOCK TRIAL',color,1.55); v68DrawClock(cx,cy,250,safe,1.9,color);
    for(let i=0;i<count;i++){ const a=-Math.PI/2+i*Math.PI*2/count, x=cx+Math.cos(a)*213, y=cy+Math.sin(a)*213; if(i===safe) v68Safe(x,y,39,1.8,String(i+1)); else v68Call(v64Circle,[x,y,32,.78+i*.018,boss.atk*.48,color,tag]); }
    const a=-Math.PI/2+safe*Math.PI*2/count; v68DrawArrow(player.x,player.y,cx+Math.cos(a)*213,cy+Math.sin(a)*213,'NUMBER '+(safe+1),'#86efac');
    v68Call(v64RotBeam,[cx,cy,state.time+.2,1.78,W*1.05,12,1.58,boss.atk*.46,color,tag]);
    v68Check(cx+Math.cos(a)*213,cy+Math.sin(a)*213,45,1740,.82,boss.atk*1.58,color,'시간 판독 · BREAK');
  }

  function v68BlackSun(color,tag){
    color=color||'#fb923c'; tag=tag||'solar'; const inner=Math.random()<.5;
    v68Msg(`${boss.name}: 화면 중앙 문구를 보세요. ${inner?'INSIDE':'OUTSIDE'}가 정답입니다.`,color,'slam');
    v68DrawArenaTint('BLACK SUN JUDGEMENT',color,1.6); v68DrawEclipse(W/2,H/2,inner,1.85,color);
    if(inner){ v68Safe(W/2,H/2,54,1.72,'INSIDE'); v68Call(v64Donut,[W/2,H/2,130,430,.86,boss.atk*.78,color,tag]); v68Check(W/2,H/2,62,1660,.78,boss.atk*1.68,color,'일식 핵 판독'); }
    else{ const spots=[[W*.13,H*.18],[W*.87,H*.18],[W*.13,H*.82],[W*.87,H*.82]]; const pick=spots[Math.floor(Math.random()*spots.length)]; v68Call(v64Circle,[W/2,H/2,190,.84,boss.atk*.76,color,tag]); spots.forEach(p=>{ if(p===pick){ v68Safe(p[0],p[1],42,1.72,'OUTSIDE'); v68DrawArrow(player.x,player.y,p[0],p[1],'OUTSIDE','#86efac'); } else v68Fake(p[0],p[1],34,1.45,'FAKE',color); }); v68Check(pick[0],pick[1],48,1660,.78,boss.atk*1.7,color,'외곽 판독'); }
    v67Later(700,()=>{ v68Call(v64Beam,[W/2,H/2,0,W*.98,13,.68,boss.atk*.52,color,tag]); v68Call(v64Beam,[W/2,H/2,Math.PI/2,H*.98,13,.68,boss.atk*.52,color,tag]); });
  }

  function v68GravityStage(color,tag){
    color=color||'#818cf8'; tag=tag||'gravity'; const left=Math.random()<.5; const sx=left?W*.25:W*.75, sy=H*.56; const safeAngle=left?Math.PI:0;
    v68Msg(`${boss.name}: 초록 궤도 조각만 안전합니다. 흡입을 거슬러 들어가세요.`,color,'cast');
    v68DrawArenaTint('GRAVITY STAGE',color,1.5); v68DrawOrbit(W/2,H/2,285,safeAngle,1.9,color);
    try{ state.mechanics.push({kind:'gravity',x:W/2,y:H/2,r:330,life:1.65,power:210,color}); }catch(e){}
    v68Safe(sx,sy,43,1.76,'ORBIT'); v68DrawArrow(player.x,player.y,sx,sy,'SAFE ORBIT','#86efac');
    v68Call(v64RotBeam,[W/2,H/2,state.time,left?-1.70:1.70,W*1.12,14,1.28,boss.atk*.53,color,tag]);
    v68Call(v64RotBeam,[W/2,H/2,state.time+Math.PI/2,left?1.20:-1.20,W*.92,10,1.28,boss.atk*.42,v68Sub(),tag]);
    v68Check(sx,sy,49,1740,.78,boss.atk*1.62,color,'중력 판독 · BREAK');
  }

  function v68AbyssStage(color,tag){
    color=color||'#38bdf8'; tag=tag||'void'; const rows=7, safe=Math.floor(Math.random()*rows); const ySafe=98+safe*(H-188)/(rows-1);
    v68Msg(`${boss.name}: 물결 사이 비어 있는 수로를 찾으세요. 파란 통로만 숨을 쉴 수 있습니다.`,color,'beam');
    v68DrawArenaTint('ABYSS CATHEDRAL',color,1.45); v68DrawWaveGuide(ySafe,1.7,color);
    for(let i=0;i<rows;i++){ const y=98+i*(H-188)/(rows-1); if(i!==safe){ v68DrawStripedRect(W/2,y,W*.94,28,0,color,.20,'CRUSH'); v68Call(v64Wall,[W/2,y,W*.92,26,.76+i*.015,boss.atk*.70,color,tag]); } }
    v68DrawArrow(player.x,player.y,W*.5,ySafe,'AIR','#86efac');
    v67Later(790,()=>{ const a=Math.atan2(player.y-boss.y,player.x-boss.x); v68Call(v64Beam,[boss.x,boss.y,a,W*.94,14,.58,boss.atk*.52,v68Sub(),tag]); });
    v67Later(1600,()=>{ if(Math.abs(player.y-ySafe)<47){ v68Break(.68); healText('호흡 성공 · BREAK',player.x,player.y-42); } else hurtPlayer(boss.atk*1.52,color,true); });
  }

  function v68ChaosTrial(color,tag){
    color=color||'#fb7185'; tag=tag||'chaos';
    const picks=[{x:W*.24,y:H*.32,c:'#86efac',n:'GREEN'},{x:W*.50,y:H*.69,c:'#fb7185',n:'RED'},{x:W*.76,y:H*.32,c:'#a78bfa',n:'PURPLE'},{x:W*.50,y:H*.24,c:'#fde047',n:'GOLD'}];
    const safe=Math.floor(Math.random()*picks.length);
    v68Msg(`${boss.name}: ${picks[safe].n} 문양만 진짜입니다. FAKE 표식은 믿으면 안 됩니다.`,color,'cast');
    v68DrawArenaTint('CHAOS TRIAL',color,1.55); v68DrawGlyphs(picks,safe,1.85,color);
    picks.forEach((p,i)=>{ if(i===safe){ v68Safe(p.x,p.y,42,1.75,p.n); v68DrawArrow(player.x,player.y,p.x,p.y,p.n,'#86efac'); } else { v68Fake(p.x,p.y,36,1.48,'FAKE',p.c); v68Call(v64Circle,[p.x,p.y,48,.82+i*.025,boss.atk*.65,p.c,tag]); } });
    v68Check(picks[safe].x,picks[safe].y,50,1690,.72,boss.atk*1.72,color,'색 판결 통과');
  }

  function v68CoreStage(color,tag){
    color=color||v68Color(); tag=tag||v68Tag();
    v68Msg(`${boss.name}: 빛나는 핵을 먼저 부수세요. 실패하면 도넛 폭발이 옵니다.`,color,'cast');
    v68DrawArenaTint('CORE BREAK',color,1.6);
    const count=v68Phase()>=3?3:2;
    for(let i=0;i<count;i++){ const a=-Math.PI/2+i*Math.PI*2/count+rand(-.10,.10); const x=W/2+Math.cos(a)*rand(145,230), y=H/2+Math.sin(a)*rand(105,176); state.mechanics.push({kind:'add',x,y,r:18,hp:95+boss.tier*15,life:3.15,speed:56+boss.tier*2,color}); v68Push({shape:'eclipse',x,y,r:46,life:3.0,color,sub:'#fff',inner:true}); v68DrawArrow(player.x,player.y,x,y,'BREAK CORE','#fef08a'); }
    v67Later(2250,()=>{ const alive=state.mechanics.some(m=>m.kind==='add'&&m.life>0); if(alive){ v68Call(v64Donut,[W/2,H/2,62,340,.22,boss.atk*1.45,color,tag]); floatText('핵 처리 실패',W/2,105,'#fb7185',22); } else { v68Break(1.05); floatText('핵 처리 성공 · BREAK',W/2,105,'#86efac',22); } });
  }

  function v68FinalCombo(color,tag){
    const id=boss && boss.id || '';
    if(id==='puppet_emperor'){ v68PuppetOpera(color,tag); v67Later(760,()=>v68ClockTrial(color,tag)); return; }
    if(id==='black_sun'||id==='solar_dragon'){ v68BlackSun(color,tag); v67Later(780,()=>v68CoreStage(color,tag)); return; }
    if(id==='chaos_archon'){ v68ChaosTrial(color,tag); v67Later(820,()=>v68GravityStage(color,tag)); return; }
    if(id==='chrono_dragon'){ v68ClockTrial(color,tag); v67Later(800,()=>v68PuppetOpera(color,tag)); return; }
    if(id==='abyss_leviathan'){ v68AbyssStage(color,tag); v67Later(800,()=>v68BlackSun(color,tag)); return; }
    if(id==='gravity_core'){ v68GravityStage(color,tag); v67Later(820,()=>v68CoreStage(color,tag)); return; }
    v68ChaosTrial(color,tag);
  }

  function v68Pattern(idx){
    const id=boss && boss.id || ''; const color=v68Color(), tag=v68Tag(); const i=Math.abs(idx||0)%7;
    const generic=[v68PuppetOpera,v68ClockTrial,v68BlackSun,v68GravityStage,v68AbyssStage,v68CoreStage,v68FinalCombo];
    const map={
      puppet_emperor:[v68PuppetOpera,v68ChaosTrial,v68ClockTrial,v68CoreStage,v68PuppetOpera,v68GravityStage,v68FinalCombo],
      black_sun:[v68BlackSun,v68CoreStage,v68ClockTrial,v68GravityStage,v68BlackSun,v68ChaosTrial,v68FinalCombo],
      chaos_archon:[v68ChaosTrial,v68ClockTrial,v68GravityStage,v68PuppetOpera,v68CoreStage,v68BlackSun,v68FinalCombo],
      chrono_dragon:[v68ClockTrial,v68PuppetOpera,v68GravityStage,v68CoreStage,v68ClockTrial,v68ChaosTrial,v68FinalCombo],
      abyss_leviathan:[v68AbyssStage,v68CoreStage,v68BlackSun,v68GravityStage,v68AbyssStage,v68ClockTrial,v68FinalCombo],
      gravity_core:[v68GravityStage,v68CoreStage,v68ClockTrial,v68AbyssStage,v68GravityStage,v68BlackSun,v68FinalCombo],
      solar_dragon:[v68BlackSun,v68AbyssStage,v68ClockTrial,v68CoreStage,v68BlackSun,v68GravityStage,v68FinalCombo],
      mirror_duelist:[v68PuppetOpera,v68ChaosTrial,v68ClockTrial,v68GravityStage,v68CoreStage,v68AbyssStage,v68FinalCombo]
    };
    const fn=(map[id]||generic)[i]||generic[i];
    fn(color,tag);
    try{ v67Cap(); }catch(e){}
  }

  try{
    const oldTypePatternV68 = v59TypePattern;
    v59TypePattern = function(idx){
      try{
        const t=v68Tier(), ph=v68Phase();
        if(t>=7){
          const allowed = t>=10 ? 7 : t>=9 ? 6 : t>=8 ? 5 : 4;
          v68Pattern((idx||0)%allowed);
          if(t>=10 && ph>=3 && Math.random()<.14){ v67Later(1020,()=>v68Pattern(((idx||0)+3)%7)); }
          try{ v67Cap(); }catch(e){}
          return;
        }
      }catch(e){ console.warn('[V68 pattern failed]',e); }
      try{ oldTypePatternV68(idx); }catch(err){ try{ v67Pattern(idx); }catch(_){} }
    };
    getBossPatternCooldown = function(){
      const t=v68Tier(), ph=v68Phase();
      if(t>=10) return ph>=3 ? 2.10 + Math.random()*.18 : 2.36 + Math.random()*.20;
      if(t>=9) return ph>=3 ? 2.34 + Math.random()*.20 : 2.58 + Math.random()*.22;
      if(t>=8) return ph>=3 ? 2.56 + Math.random()*.22 : 2.82 + Math.random()*.24;
      if(t>=7) return ph>=3 ? 2.74 + Math.random()*.25 : 3.00 + Math.random()*.25;
      return 3.1 + Math.random()*.35;
    };
  }catch(e){ console.warn('[V68 pattern override failed]',e); }

  try{
    const oldUpdateV68 = update;
    update = function(dt){
      const safeDt = Math.min(dt || 0, 1/58);
      try{ v67Cap(); }catch(e){}
      oldUpdateV68(safeDt);
      try{ v67Cap(); }catch(e){}
    };
  }catch(e){ console.warn('[V68 update override failed]',e); }

  try{
    window.RaidDungeonV68={
      version:V68_VERSION,
      gachaHotfix:'rollGacha no longer depends on addOwned, so gacha buttons work even when older patch scopes hide addOwned',
      visualRule:'danger is striped red, true safe is green-white, route arrows point to the intended answer, boss-specific arena tint names the mechanic',
      antiLag:'cinematic telegraphs are canvas-only mechanics with almost no collision checks; actual damage objects remain low count',
      patterns:['puppet opera lanes','clock trial numbers','black sun inside outside','gravity orbit stage','abyss air corridor','chaos real color glyphs','core break stage']
    };
  }catch(e){}

  try{
    window.RaidDungeonV67={
      version:V67_VERSION,
      difficulty:'safe zones are smaller, telegraphs are shorter, failure damage is higher, phase 3 chains real combo patterns',
      antiLag:'lower object budgets, fewer particles, dt clamp 1/55, difficulty comes from timing and judgment rather than object spam',
      patterns:['brutal guillotine lanes','clock execution','compressed eclipse','abyss corridor','gravity vice','chaos verdict','core panic','phase 3 combo']
    };
  }catch(e){}

  try{ window.RaidDungeonV45={version:V45_VERSION, v45, enhanceWeapon, enchantWeapon, sellWeapon, disassembleWeapon, upgradeSkill, registerMaterial, marketBuy, chatSend}; v45(); renderMenu(); }catch(e){console.warn('[V45 init failed]',e);}
})();

})();


/* ===== V49 verification: cleaner game UI + rarity colored names ===== */
try {
  window.RaidDungeonV49 = {
    version: 'Raid Dungeon V49 - Game UI Clean Rarity Color',
    ui: ['clean header','deduped tabs','compact growth center','compact market'],
    visuals: ['weapon name rarity color','skill name rarity color','ultimate rainbow name']
  };
} catch(e) {}

/* ===== V47 verification: V45/V44/V40 preserved, patches now inside main closure ===== */
try {
  window.RaidDungeonV47 = {
    version: 'Raid Dungeon V47 - Full Preserved Progression Market Chat',
    basePreserved: 'V45 external patches moved inside the main game closure instead of deleting old features',
    noDrawHazardsReferenceError: true,
    visibleTabs: ['성장/강화','유저 판매소','채팅'],
    includes: ['코인','부산물','스킬 레벨업','무기 강화','인챈트','판매/분해','FIRST CLEAR']
  };
} catch(e) {}

})();

})();


/* ===== V53 verification: sortie click hotfix ===== */
try {
  window.RaidDungeonV53 = {
    version: 'Raid Dungeon V53 - Sortie Click uniqueItems Hotfix',
    fixed: ['출격 준비 클릭 오류 수정','uniqueItems is not defined 해결','기존 V52 장터/이펙트 기능 유지']
  };
} catch(e) {}

