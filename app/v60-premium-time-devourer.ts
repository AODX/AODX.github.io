import type { CardDefinition } from './game-data';

/**
 * V60 ultimate premium chase card.
 * Intentionally sits above the normal power band. Its acquisition source is a
 * dedicated one-card premium booster with a true 0.1% featured rate.
 */
export const V60_PREMIUM_TIME_DEVOURER: CardDefinition = {
  id: 'v60_premium_time_devourer',
  name: '시간 탐식자',
  subtitle: 'PREMIUM ABSOLUTE · 모든 시대의 종말',
  kind: 'unit',
  rarity: 'legendary',
  element: 'void',
  cost: 10,
  attack: 15,
  health: 18,
  unitType: 'spirit',
  target: 'none',
  keywords: ['guard', 'charge', 'lifesteal', 'pierce', 'corestrike', 'execute', 'sweep'],
  text: '전설 특수 소환 「시간 포식 강림」: ENERGY 10. 시간대·코어·묘지 조건 없이 소환 가능. 모든 시간대에서 항상 +5/+5. 소환이 성공하면 상대 필드의 모든 유닛과 세트 함정을 시간 밖으로 삼키고, 내 코어 10 회복, 카드 3장 드로우, ENERGY 3 회복, 자신에게 보호막 3을 부여한다. 모든 시간대 진입 시 상대 코어 2를 흡수한다. 수호·속공·흡수·관통·직격·처형·전체공격.',
  flavor: '시간은 모두를 삼킨다. 하지만 끝내 시간마저 먹어 치우는 것이 나타났다.',
  sigil: '⌛',
  summonMode: 'legendary',
  legendarySummonRule: {
    name: '시간 포식 강림',
    label: 'ENERGY 10을 지불하고 소환 · 시간대/코어/묘지 추가 조건 없음',
    release: 'none',
  },
  eclipseAffinity: 'eclipse',
  temporalProfileName: '전 시간대 · 상시 포식',
  eclipsePhaseModifiers: {
    dawn: { attack: 5, health: 5, label: '여명 포식' },
    zenith: { attack: 5, health: 5, label: '정점 포식' },
    dusk: { attack: 5, health: 5, label: '황혼 포식' },
    midnight: { attack: 5, health: 5, label: '심야 포식' },
    eclipse: { attack: 5, health: 5, label: '일식 포식' },
  },
  eclipsePhasePulses: [
    { phase: 'dawn', name: '여명 섭식', description: '여명 진입 시 상대 코어 2를 흡수한다.', effect: { kind: 'drain_core', amount: 2 } },
    { phase: 'zenith', name: '정점 섭식', description: '정점 진입 시 상대 코어 2를 흡수한다.', effect: { kind: 'drain_core', amount: 2 } },
    { phase: 'dusk', name: '황혼 섭식', description: '황혼 진입 시 상대 코어 2를 흡수한다.', effect: { kind: 'drain_core', amount: 2 } },
    { phase: 'midnight', name: '심야 섭식', description: '심야 진입 시 상대 코어 2를 흡수한다.', effect: { kind: 'drain_core', amount: 2 } },
    { phase: 'eclipse', name: '일식 섭식', description: '개기일식 진입 시 상대 코어 2를 흡수한다.', effect: { kind: 'drain_core', amount: 2 } },
  ],
  vfx: {
    summon: 'time-devourer-arrival',
    attack: 'time-devourer-rend',
    defense: 'time-devourer-guard',
    destroy: 'time-devourer-collapse',
  },
};
