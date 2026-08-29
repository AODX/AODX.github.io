import type { EclipsePhase } from './game-data';

export type BossRaidId = 'dawn_lord' | 'zenith_king' | 'twilight_knight' | 'midnight_silence' | 'eclipse_conductor';

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
};

/**
 * V51 boss raid roster.
 * The weakest entry is deliberately built on top of the existing HARD practice AI,
 * while later bosses also receive stronger starting resources and deeper look-ahead.
 */
export const BOSS_RAIDS: BossRaidDefinition[] = [
  {
    id: 'dawn_lord',
    name: '여명의 지배자',
    epithet: '첫빛을 거느린 왕',
    description: '여명을 강제로 자신의 템포로 바꾸며 빠른 전개와 보호막으로 초반부터 압박합니다.',
    phase: 'dawn',
    signatureCardId: 'v41_premium_dawn_lord',
    reward: 80,
    threat: 1,
    core: 36,
    startingEnergy: 2,
    bonusOpeningCards: 0,
    graveSeed: 2,
    avatar: 'oracle',
    supportCardIds: ['v37_time_unit_01','v37_time_unit_02','v37_time_spell_01','v37_time_trap_01','v37_time_spell_06','v37_time_spell_08'],
  },
  {
    id: 'zenith_king',
    name: '정점의 왕',
    epithet: '태양이 가장 높은 순간의 지배자',
    description: '정점 전용 폭발력과 광역 압박으로 필드를 빠르게 무너뜨리는 공격형 보스입니다.',
    phase: 'zenith',
    signatureCardId: 'v41_premium_zenith_king',
    reward: 140,
    threat: 2,
    core: 40,
    startingEnergy: 2,
    bonusOpeningCards: 1,
    graveSeed: 3,
    avatar: 'warden',
    supportCardIds: ['v37_time_unit_03','v37_time_unit_04','v37_time_spell_02','v37_time_trap_02','v37_time_spell_06','v37_time_spell_09'],
  },
  {
    id: 'twilight_knight',
    name: '황혼의 기사',
    epithet: '낙일을 베는 최후의 수호자',
    description: '황혼을 고정한 뒤 수호와 돌진을 동시에 전개합니다. 중반 이후부터 전투 교환이 매우 까다롭습니다.',
    phase: 'dusk',
    signatureCardId: 'v44_premium_twilight_knight',
    reward: 220,
    threat: 3,
    core: 44,
    startingEnergy: 3,
    bonusOpeningCards: 1,
    graveSeed: 5,
    avatar: 'reaper',
    supportCardIds: ['v37_time_unit_05','v37_time_unit_06','v37_time_spell_03','v37_time_trap_03','v37_time_spell_07','v37_time_spell_08'],
  },
  {
    id: 'midnight_silence',
    name: '심야의 침묵',
    epithet: '자정을 잠그는 무언의 재앙',
    description: '심야를 유지하며 ENERGY와 손패 흐름을 끊고, 함정과 시간 조작으로 플레이 선택지를 제한합니다.',
    phase: 'midnight',
    signatureCardId: 'v41_premium_midnight_silence',
    reward: 340,
    threat: 4,
    core: 48,
    startingEnergy: 3,
    bonusOpeningCards: 2,
    graveSeed: 5,
    avatar: 'oracle',
    supportCardIds: ['v37_time_unit_07','v37_time_unit_08','v37_time_spell_04','v37_time_trap_04','v37_time_spell_10','v37_time_spell_13'],
  },
  {
    id: 'eclipse_conductor',
    name: '개기일식의 조율자',
    epithet: '모든 시간대를 지휘하는 최종 보스',
    description: '개기일식 카드와 최고급 시간 조작을 연계합니다. 높은 코어와 시작 자원, 깊은 수읽기를 동시에 갖춘 최종 난이도입니다.',
    phase: 'eclipse',
    signatureCardId: 'v41_premium_eclipse_conductor',
    reward: 700,
    threat: 5,
    core: 54,
    startingEnergy: 4,
    bonusOpeningCards: 2,
    graveSeed: 6,
    avatar: 'reaper',
    supportCardIds: ['v37_time_unit_09','v37_time_unit_10','v37_time_spell_05','v37_time_trap_05','v37_time_spell_09','v37_time_spell_14'],
  },
];

export const BOSS_RAID_BY_ID = Object.fromEntries(BOSS_RAIDS.map((boss) => [boss.id, boss])) as Record<BossRaidId, BossRaidDefinition>;

function stableHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/** Exactly three distinct bosses are selected for each Korea-day. */
export function bossRaidIdsForDay(dayKey: string): BossRaidId[] {
  const pool = BOSS_RAIDS.map((boss) => boss.id);
  let seed = stableHash(`ECLIPSE-BOSS-RAID:${dayKey}`) || 1;
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
  return pool.slice(0, 3);
}
