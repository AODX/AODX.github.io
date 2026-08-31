/**
 * V75: premium-style names for every legendary Main Deck card.
 *
 * Scope is intentionally limited to legendary unit / spell / trap cards.
 * Card IDs, effects, costs, artwork paths, rarity and all gameplay rules stay unchanged.
 * The Premium Time flagships are preserved as the naming reference point.
 */
export const V75_LEGENDARY_NAME_OVERRIDES: Readonly<Record<string, string>> = {
  // Core legends ------------------------------------------------------------
  unit_crownless_titan: '무관의 거신 바르칸',
  unit_star_devourer: '성식의 포식자 녹티스',
  unit_dawn_seraph: '첫빛의 세라프 아우론',
  spell_supernova: '종성의 장송 솔브레이크',
  trap_null_horizon: '무광계의 경계선',

  // V8 legends --------------------------------------------------------------
  unit_v8_solar_09: '여명의 수문장 라지엘',
  unit_v8_lunar_06: '거울월의 기사 셀레네',
  unit_v8_storm_03: '폭풍익의 군주 제피르',
  unit_v8_verdant_19: '비취천의 수호자 이베르',
  unit_v8_void_16: '밤서약의 집행자 녹스',
  unit_v8_neutral_13: '황혼강철의 집행자 아젠',
  spell_v8_solar_04: '두 번째 태양 헬리온',
  spell_v8_lunar_01: '세계근의 부름 이그드라',
  spell_v8_lunar_09: '몽화순환 블룸리브',
  spell_v8_storm_06: '야성해방 라그나로어',
  spell_v8_verdant_03: '심록돌진 베르디아',
  trap_v8_lunar_07: '대지거울의 역전문',
  trap_v8_storm_04: '야뢰의 반격진',
  trap_v8_verdant_01: '야수귀환의 가시문',

  // CHRONORIUM --------------------------------------------------------------
  v26_chronorium_unit_21: '시간왕 크로노스 레갈',
  v26_chronorium_unit_22: '무시계의 판관 제로스',
  v26_chronorium_spell_08: '종언시각 00:00',
  v26_chronorium_trap_06: '최후초침의 감옥',

  // ARCANA PROTOCOL ---------------------------------------------------------
  v26_arcana_protocol_unit_21: '금서대현자 아르카넬',
  v26_arcana_protocol_unit_22: '제13규약 오메기온',
  v26_arcana_protocol_spell_08: '금단규약 제13성문',
  v26_arcana_protocol_trap_06: '금서봉인 아카식 락',

  // BEASTFORGE --------------------------------------------------------------
  v26_beastforge_unit_21: '강철야왕 카이저 팽',
  v26_beastforge_unit_22: '용광해수 레비아단',
  v26_beastforge_spell_08: '초중갑화 오버클래드',
  v26_beastforge_trap_06: '황제포효의 철벽',

  // PHANTOM CARNIVAL --------------------------------------------------------
  v26_phantom_carnival_unit_21: '환극단장 모르페우스',
  v26_phantom_carnival_unit_22: '무대종결자 제로',
  v26_phantom_carnival_spell_08: '대환극 그랜드 피날레',
  v26_phantom_carnival_trap_06: '최후앙코르의 막',

  // ASTRAL ARMADA -----------------------------------------------------------
  v26_astral_armada_unit_21: '성해제독 아스트라엘',
  v26_astral_armada_unit_22: '천체거신 셀레스티온',
  v26_astral_armada_spell_08: '성해종포 오메가',
  v26_astral_armada_trap_06: '성해함대 최후방벽',

  // Legendary spell package ------------------------------------------------
  spell_v31d_sovereign_seizure: '왕관찬탈의 의식',
  spell_v31d_grave_rebirth: '황혼회귀의 성약',
  spell_v31d_grand_recall: '만시계 대회수',
  spell_v31d_battlefield_inversion: '천지역위의 장',
  spell_v31d_oblivion_archive: '망각서고 아카이브',
  spell_v31d_fate_reweave: '운명재봉의 은실',
  spell_v31d_mirror_incarnation: '거울현신 미라지',
  spell_v31d_hand_exchange: '패러독스 교환식',

  // V33A legends ------------------------------------------------------------
  v33a_unit_013: '홍련선봉장 카르민',
  v33a_unit_030: '몽경해석사 루시엘',
  v33a_unit_047: '금서수호상 오르비스',
  v33a_unit_064: '빙설추적자 프리제',
  v33a_unit_081: '첫빛정령 루미엘',
  v33a_spell_016: '혼령재점화 이그니스',
  v33a_spell_032: '패왕의 압도파',
  v33a_spell_048: '천리탐색의 성도',
  v33a_trap_012: '역전의 생명계',
  v33a_trap_024: '잔광수호의 환진',

  // ECLIPSE CYCLE — Dawn ----------------------------------------------------
  v34_cycle_unit_022: '새벽기상사 에오스',
  v34_cycle_unit_023: '동녘해석가 오리엔',
  v34_cycle_unit_024: '아침안개 봉인사 네벨',
  v34_cycle_spell_006: '첫빛폭발 에오스노바',
  v34_cycle_spell_008: '여명예고 새벽성문',

  // ECLIPSE CYCLE — Zenith --------------------------------------------------
  v34_cycle_unit_046: '백열파수꾼 솔렉스',
  v34_cycle_unit_047: '천정추적자 아페크스',
  v34_cycle_unit_048: '절정관측사 메리디안',
  v34_cycle_spell_014: '천정폭발 솔라크라운',
  v34_cycle_spell_016: '정점예고 정오성문',

  // ECLIPSE CYCLE — Dusk ----------------------------------------------------
  v34_cycle_unit_070: '적경기록관 베르밀',
  v34_cycle_unit_071: '석양선봉장 헤스페르',
  v34_cycle_unit_072: '퇴광술사 베스티아',
  v34_cycle_spell_022: '황혼폭발 베스퍼노바',
  v34_cycle_spell_024: '황혼예고 낙일성문',

  // ECLIPSE CYCLE — Midnight -----------------------------------------------
  v34_cycle_unit_094: '야행항해사 녹티아',
  v34_cycle_unit_095: '몽로포격수 셀룸',
  v34_cycle_unit_096: '밤비심문관 플루비아',
  v34_cycle_spell_030: '심야폭발 녹스노바',
  v34_cycle_spell_032: '심야예고 자정성문',

  // ECLIPSE CYCLE — Total Eclipse ------------------------------------------
  v34_cycle_unit_118: '암핵정비사 움브라',
  v34_cycle_unit_119: '식환성가대장 코로나',
  v34_cycle_unit_120: '암영집행자 에클립트',
  v34_cycle_spell_038: '흑일폭발 코로나제로',
  v34_cycle_spell_040: '일식예고 흑광성문',

  // TIME CORE ---------------------------------------------------------------
  v37_time_unit_09: '흑일룡 아포피스',
  v37_time_spell_05: '흑광종말 아포칼립스',
  v37_time_trap_05: '식광반전의 계',
  v37_time_spell_10: '영야선언 녹스이터나',
  v37_time_spell_14: '인과역전 크로노브레이크',

  // Premium Time — naming references (preserved) ---------------------------
  v41_premium_zenith_king: '정점의 왕 솔라리온',
  v41_premium_dawn_lord: '여명성녀 아우렐리아',
  v41_premium_eclipse_conductor: '개기일식의 악사 모르덴',
  v44_premium_twilight_knight: '황혼의 검사 베스퍼',
  v41_premium_midnight_silence: '심야의 무성 권역',

  // Absolute Premium --------------------------------------------------------
  v60_premium_time_devourer: '시간 탐식자 아이온',
};
