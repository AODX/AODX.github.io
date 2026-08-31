import type { EclipsePhase, SeriesId } from './game-data';

export type BossRaidId =
  | 'common_vanguard'
  | 'series_luminaknights'
  | 'series_kaisergear'
  | 'series_eclipsion'
  | 'series_nocturne'
  | 'series_arborian'
  | 'series_tempest_drive'
  | 'series_abyss_reaper'
  | 'series_primal_guardian'
  | 'series_chronorium'
  | 'series_arcana_protocol'
  | 'series_beastforge'
  | 'series_phantom_carnival'
  | 'series_astral_armada'
  | 'dawn_lord'
  | 'zenith_king'
  | 'twilight_knight'
  | 'midnight_silence'
  | 'eclipse_conductor';

export type BossRaidDeckKind = 'common' | 'series' | 'time';

export const BOSS_REWARD_BY_THREAT: Record<1 | 2 | 3 | 4 | 5, number> = {
  1: 200,
  2: 300,
  3: 400,
  4: 500,
  5: 700,
};

export type BossRaidDefinition = {
  id: BossRaidId;
  name: string;
  epithet: string;
  description: string;
  phase: EclipsePhase;
  signatureCardId: string;
  reward: number;
  threat: 1 | 2 | 3 | 4 | 5;
  core: number;
  startingEnergy: number;
  bonusOpeningCards: number;
  graveSeed: number;
  avatar: string;
  supportCardIds: string[];
  deckKind: BossRaidDeckKind;
  deckThemeLabel: string;
  seriesId?: SeriesId;
  apex?: boolean;
};

/**
 * V52 boss raid roster.
 *
 * Structure:
 * 1) a common-rarity-only entry boss,
 * 2) one dedicated boss for every named card series,
 * 3) five apex Time bosses.  All five Time bosses are THREAT 5.
 *
 * The large roster does not mean all bosses pay out every day.  The daily board still
 * exposes exactly three bosses, and the apex pool is intentionally rare so the 700 coin
 * final boss cannot become a routine faucet.
 */
export const BOSS_RAIDS: BossRaidDefinition[] = [
  {
    id: 'common_vanguard',
    name: '기초전선의 지휘관',
    epithet: '일반 카드만으로 완성한 첫 관문',
    description: '메인 덱을 일반 등급 카드만으로 구성합니다. 카드의 희귀도 대신 정확한 교환과 수읽기로 압박하는 입문 보스입니다.',
    phase: 'dawn',
    signatureCardId: 'unit_v8_solar_01',
    reward: BOSS_REWARD_BY_THREAT[1],
    threat: 1,
    core: 36,
    startingEnergy: 2,
    bonusOpeningCards: 1,
    graveSeed: 0,
    avatar: 'warden',
    supportCardIds: [],
    deckKind: 'common',
    deckThemeLabel: '일반 등급 전용 덱',
  },

  {
    id: 'series_luminaknights',
    name: '성휘전대 총대장',
    epithet: '루미나이츠 연계의 지휘관',
    description: '루미나이츠를 중심으로 연속 소환과 전개 강화를 이어가는 시리즈 보스입니다.',
    phase: 'dawn',
    signatureCardId: 'unit_v8_neutral_13',
    reward: BOSS_REWARD_BY_THREAT[2],
    threat: 2,
    core: 36,
    startingEnergy: 2,
    bonusOpeningCards: 0,
    graveSeed: 1,
    avatar: 'warden',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '루미나이츠 시리즈 덱',
    seriesId: 'luminaknights',
  },
  {
    id: 'series_kaisergear',
    name: '황제기갑 총사령관',
    epithet: '카이저기어 강철 전선',
    description: '보호막과 에너지 가속으로 대형 기갑을 빠르게 완성하는 카이저기어 보스입니다.',
    phase: 'zenith',
    signatureCardId: 'unit_v8_solar_14',
    reward: BOSS_REWARD_BY_THREAT[2],
    threat: 2,
    core: 38,
    startingEnergy: 2,
    bonusOpeningCards: 1,
    graveSeed: 1,
    avatar: 'warden',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '카이저기어 시리즈 덱',
    seriesId: 'kaisergear',
  },
  {
    id: 'series_eclipsion',
    name: '일식공명 집정관',
    epithet: '이클립시온 균열의 관리자',
    description: '묘지와 균열을 자원으로 사용해 끊임없이 전장을 복구하는 이클립시온 보스입니다.',
    phase: 'eclipse',
    signatureCardId: 'unit_v8_solar_09',
    reward: BOSS_REWARD_BY_THREAT[4],
    threat: 4,
    core: 43,
    startingEnergy: 3,
    bonusOpeningCards: 1,
    graveSeed: 4,
    avatar: 'oracle',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '이클립시온 시리즈 덱',
    seriesId: 'eclipsion',
  },
  {
    id: 'series_nocturne',
    name: '월영환상 무대감독',
    epithet: '녹턴 미라주의 환영 지배자',
    description: '회복과 서치, 손패 우위를 차곡차곡 쌓아 상대의 선택지를 줄이는 녹턴 미라주 보스입니다.',
    phase: 'midnight',
    signatureCardId: 'unit_v8_void_16',
    reward: BOSS_REWARD_BY_THREAT[3],
    threat: 3,
    core: 39,
    startingEnergy: 2,
    bonusOpeningCards: 1,
    graveSeed: 2,
    avatar: 'oracle',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '녹턴 미라주 시리즈 덱',
    seriesId: 'nocturne',
  },
  {
    id: 'series_arborian',
    name: '세계수의 대수호자',
    epithet: '아르보리아 생장의 심장',
    description: '유닛을 키우고 보호하며 장기전으로 갈수록 전장이 거대해지는 아르보리아 보스입니다.',
    phase: 'dawn',
    signatureCardId: 'unit_v8_lunar_06',
    reward: BOSS_REWARD_BY_THREAT[3],
    threat: 3,
    core: 42,
    startingEnergy: 2,
    bonusOpeningCards: 1,
    graveSeed: 2,
    avatar: 'warden',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '아르보리아 시리즈 덱',
    seriesId: 'arborian',
  },
  {
    id: 'series_tempest_drive',
    name: '천뢰기동 선봉장',
    epithet: '템페스트 드라이브 최고속 돌격대',
    description: '속공과 에너지 연계를 이용해 한 턴에 여러 행동을 몰아치는 템페스트 드라이브 보스입니다.',
    phase: 'zenith',
    signatureCardId: 'unit_v8_neutral_02',
    reward: BOSS_REWARD_BY_THREAT[3],
    threat: 3,
    core: 38,
    startingEnergy: 3,
    bonusOpeningCards: 1,
    graveSeed: 1,
    avatar: 'reaper',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '템페스트 드라이브 시리즈 덱',
    seriesId: 'tempest_drive',
  },
  {
    id: 'series_abyss_reaper',
    name: '심연포식 처형자',
    epithet: '어비스 리퍼의 굶주린 낫',
    description: '묘지를 되살리고 코어를 직접 압박해 장기적으로 자원을 갉아먹는 어비스 리퍼 보스입니다.',
    phase: 'midnight',
    signatureCardId: 'unit_v8_storm_08',
    reward: BOSS_REWARD_BY_THREAT[3],
    threat: 3,
    core: 41,
    startingEnergy: 2,
    bonusOpeningCards: 1,
    graveSeed: 4,
    avatar: 'reaper',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '어비스 리퍼 시리즈 덱',
    seriesId: 'abyss_reaper',
  },
  {
    id: 'series_primal_guardian',
    name: '원초수호 야수왕',
    epithet: '프라이멀 가디언의 불굴 전선',
    description: '수호와 전장 강화를 겹쳐 쉽게 무너지지 않는 프라이멀 가디언 보스입니다.',
    phase: 'dusk',
    signatureCardId: 'unit_v8_storm_03',
    reward: BOSS_REWARD_BY_THREAT[3],
    threat: 3,
    core: 44,
    startingEnergy: 2,
    bonusOpeningCards: 0,
    graveSeed: 2,
    avatar: 'warden',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '프라이멀 가디언 시리즈 덱',
    seriesId: 'primal_guardian',
  },
  {
    id: 'series_chronorium',
    name: '시간성전 대심판관',
    epithet: '크로노리움의 시간 집행자',
    description: '시간을 앞당기고 되감으며 ENERGY 우위를 강제로 만드는 크로노리움 상급 보스입니다.',
    phase: 'eclipse',
    signatureCardId: 'v26_chronorium_unit_21',
    reward: BOSS_REWARD_BY_THREAT[4],
    threat: 4,
    core: 44,
    startingEnergy: 3,
    bonusOpeningCards: 1,
    graveSeed: 3,
    avatar: 'oracle',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '크로노리움 시리즈 덱',
    seriesId: 'chronorium',
  },
  {
    id: 'series_arcana_protocol',
    name: '마도규약 대마도사',
    epithet: '아르카나 프로토콜 제13집행관',
    description: '주문 연쇄와 서치로 필요한 답을 빠르게 확보하는 아르카나 프로토콜 상급 보스입니다.',
    phase: 'midnight',
    signatureCardId: 'v26_arcana_protocol_unit_21',
    reward: BOSS_REWARD_BY_THREAT[4],
    threat: 4,
    core: 41,
    startingEnergy: 3,
    bonusOpeningCards: 2,
    graveSeed: 2,
    avatar: 'oracle',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '아르카나 프로토콜 시리즈 덱',
    seriesId: 'arcana_protocol',
  },
  {
    id: 'series_beastforge',
    name: '야수기갑 제련왕',
    epithet: '비스트포지의 강철 야수',
    description: '야수와 기갑을 함께 성장시키고 보호막으로 교환 이득을 누적하는 비스트포지 보스입니다.',
    phase: 'dusk',
    signatureCardId: 'v26_beastforge_unit_21',
    reward: BOSS_REWARD_BY_THREAT[3],
    threat: 3,
    core: 43,
    startingEnergy: 2,
    bonusOpeningCards: 1,
    graveSeed: 2,
    avatar: 'warden',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '비스트포지 시리즈 덱',
    seriesId: 'beastforge',
  },
  {
    id: 'series_phantom_carnival',
    name: '몽환극단 단장',
    epithet: '팬텀 카니발의 마지막 앙코르',
    description: '함정과 묘지 회수로 공격 타이밍을 뒤틀며 역전 각을 만드는 팬텀 카니발 보스입니다.',
    phase: 'midnight',
    signatureCardId: 'v26_phantom_carnival_unit_21',
    reward: BOSS_REWARD_BY_THREAT[4],
    threat: 4,
    core: 41,
    startingEnergy: 2,
    bonusOpeningCards: 2,
    graveSeed: 3,
    avatar: 'reaper',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '팬텀 카니발 시리즈 덱',
    seriesId: 'phantom_carnival',
  },
  {
    id: 'series_astral_armada',
    name: '성해함대 대제독',
    epithet: '아스트라 아르마다 전 함대 지휘관',
    description: '편대 전개와 실드·에너지 운용을 동시에 수행하는 아스트라 아르마다 상급 보스입니다.',
    phase: 'zenith',
    signatureCardId: 'v26_astral_armada_unit_21',
    reward: BOSS_REWARD_BY_THREAT[4],
    threat: 4,
    core: 43,
    startingEnergy: 3,
    bonusOpeningCards: 1,
    graveSeed: 2,
    avatar: 'warden',
    supportCardIds: [],
    deckKind: 'series',
    deckThemeLabel: '아스트라 아르마다 시리즈 덱',
    seriesId: 'astral_armada',
  },

  // Apex Time bosses: these five alone occupy THREAT 5.
  {
    id: 'dawn_lord',
    name: '여명성녀 아우렐리아',
    epithet: '첫빛을 거느린 시간 군주',
    description: '여명성녀 아우렐리아를 핵심으로 여명 시간 카드를 연쇄해 초반부터 턴의 흐름 자체를 장악합니다.',
    phase: 'dawn',
    signatureCardId: 'v41_premium_dawn_lord',
    reward: BOSS_REWARD_BY_THREAT[5],
    threat: 5,
    core: 46,
    startingEnergy: 3,
    bonusOpeningCards: 1,
    graveSeed: 3,
    avatar: 'oracle',
    supportCardIds: ['v37_time_unit_01','v37_time_unit_02','v37_time_spell_01','v37_time_trap_01','v37_time_spell_06','v37_time_spell_08'],
    deckKind: 'time',
    deckThemeLabel: '최상위 TIME · 여명 덱',
    apex: true,
  },
  {
    id: 'zenith_king',
    name: '태양전차 라그나크',
    epithet: '태양이 가장 높은 순간의 시간 군주',
    description: '태양전차 라그나크를 중심으로 정점 고정과 폭발적인 전투 교환을 반복하는 최상위 시간 보스입니다.',
    phase: 'zenith',
    signatureCardId: 'v41_premium_zenith_king',
    reward: BOSS_REWARD_BY_THREAT[5],
    threat: 5,
    core: 48,
    startingEnergy: 3,
    bonusOpeningCards: 1,
    graveSeed: 4,
    avatar: 'warden',
    supportCardIds: ['v37_time_unit_03','v37_time_unit_04','v37_time_spell_02','v37_time_trap_02','v37_time_spell_06','v37_time_spell_09'],
    deckKind: 'time',
    deckThemeLabel: '최상위 TIME · 정점 덱',
    apex: true,
  },
  {
    id: 'twilight_knight',
    name: '황혼의 검사 베스퍼',
    epithet: '낙일을 베는 시간 군주',
    description: '황혼의 검사 베스퍼를 중심으로 수호·돌진·시간 고정을 겹쳐 중반 이후 전투 교환을 압도합니다.',
    phase: 'dusk',
    signatureCardId: 'v44_premium_twilight_knight',
    reward: BOSS_REWARD_BY_THREAT[5],
    threat: 5,
    core: 50,
    startingEnergy: 4,
    bonusOpeningCards: 1,
    graveSeed: 5,
    avatar: 'reaper',
    supportCardIds: ['v37_time_unit_05','v37_time_unit_06','v37_time_spell_03','v37_time_trap_03','v37_time_spell_07','v37_time_spell_08'],
    deckKind: 'time',
    deckThemeLabel: '최상위 TIME · 황혼 덱',
    apex: true,
  },
  {
    id: 'midnight_silence',
    name: '심야 무성권역',
    epithet: '자정을 잠그는 시간 군주',
    description: '심야 무성권역을 중심으로 ENERGY·손패·함정 타이밍을 통제해 플레이 선택지를 계속 줄입니다.',
    phase: 'midnight',
    signatureCardId: 'v41_premium_midnight_silence',
    reward: BOSS_REWARD_BY_THREAT[5],
    threat: 5,
    core: 53,
    startingEnergy: 4,
    bonusOpeningCards: 2,
    graveSeed: 6,
    avatar: 'oracle',
    supportCardIds: ['v37_time_unit_07','v37_time_unit_08','v37_time_spell_04','v37_time_trap_04','v37_time_spell_10','v37_time_spell_13'],
    deckKind: 'time',
    deckThemeLabel: '최상위 TIME · 심야 덱',
    apex: true,
  },
  {
    id: 'eclipse_conductor',
    name: '개기일식의 악사 모르덴',
    epithet: '모든 시간대를 지휘하는 최종 시간 군주',
    description: '개기일식의 악사 모르덴을 중심으로 최고급 시간 조작과 시간대 전환을 연계하는 최종 보스입니다.',
    phase: 'eclipse',
    signatureCardId: 'v41_premium_eclipse_conductor',
    reward: BOSS_REWARD_BY_THREAT[5],
    threat: 5,
    core: 58,
    startingEnergy: 5,
    bonusOpeningCards: 2,
    graveSeed: 7,
    avatar: 'reaper',
    supportCardIds: ['v37_time_unit_09','v37_time_unit_10','v37_time_spell_05','v37_time_trap_05','v37_time_spell_09','v37_time_spell_14'],
    deckKind: 'time',
    deckThemeLabel: '최상위 TIME · 개기일식 덱',
    apex: true,
  },
];

export const BOSS_RAID_BY_ID = Object.fromEntries(BOSS_RAIDS.map((boss) => [boss.id, boss])) as Record<BossRaidId, BossRaidDefinition>;

export const BOSS_RAID_APEX_IDS = BOSS_RAIDS.filter((boss) => boss.apex).map((boss) => boss.id);
export const BOSS_RAID_SERIES_IDS = BOSS_RAIDS.filter((boss) => boss.deckKind === 'series').map((boss) => boss.id);
export const BOSS_RAID_STANDARD_IDS = BOSS_RAIDS.filter((boss) => !boss.apex).map((boss) => boss.id);

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function shuffled<T>(values: T[], seedText: string): T[] {
  const pool = [...values];
  let seed = stableHash(seedText) || 1;
  const next = () => {
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    return seed >>> 0;
  };
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swapIndex = next() % (index + 1);
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }
  return pool;
}

/**
 * Exactly three distinct bosses are shown each Korea-day.
 *
 * To protect the coin economy, two slots always come from the standard/series roster.
 * An apex Time boss occupies the third slot roughly once every three days; otherwise
 * the third slot is another series boss.  Therefore the 700 coin final boss is a rare
 * high-difficulty event rather than a daily income source.
 */
export function bossRaidIdsForDay(dayKey: string): BossRaidId[] {
  const standard = shuffled(BOSS_RAID_STANDARD_IDS, `ECLIPSE-BOSS-STANDARD:${dayKey}`);
  const series = shuffled(BOSS_RAID_SERIES_IDS, `ECLIPSE-BOSS-SERIES:${dayKey}`);
  const apex = shuffled(BOSS_RAID_APEX_IDS, `ECLIPSE-BOSS-APEX:${dayKey}`);
  const result: BossRaidId[] = [];

  const first = standard[0];
  if (first) result.push(first);

  const second = series.find((id) => !result.includes(id));
  if (second) result.push(second);

  const apexDay = stableHash(`ECLIPSE-BOSS-APEX-DAY:${dayKey}`) % 3 === 0;
  const thirdPool = apexDay ? apex : series;
  const third = thirdPool.find((id) => !result.includes(id))
    ?? standard.find((id) => !result.includes(id));
  if (third) result.push(third);

  return result.slice(0, 3);
}
