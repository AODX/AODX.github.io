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
  text: '【고유 특성 · 시대별 섭식】 개기일식 전용 전설 캐릭터. 【전설 특수 소환】 ENERGY 10만 지불하면 추가 조건 없이 소환할 수 있다. 【상시 효과】 모든 시간대에서 항상 +5/+5를 얻는다. 【등장】 상대 필드의 캐릭터와 세트 함정을 모두 제거하고, 내 코어 10 회복, 카드 3장 드로우, ENERGY 3 회복, 보호막 3을 얻는다. 【시간 포식】 여명: 코어 4 회복 / 정점: 상대 ENERGY 2 흡수 / 황혼: 상대 코어 2 흡수 / 심야: 상대 묘지 2장 소멸 / 개기일식: 상대 코어 4 피해.',
  uniqueTrait: { name: '시대별 섭식', description: '시간대마다 다른 자원을 삼키며 계속 이득을 챙기는 최상위 고유 특성이다.' },
  flavor: '시간은 모두를 삼킨다. 하지만 끝내 시간마저 먹어 치우는 것이 나타났다.',
  sigil: '⌛',
  summonMode: 'legendary',
  legendarySummonRule: {
    name: '시간 포식 강림',
    label: 'ENERGY 10을 지불하고 소환 · 시간대/코어/묘지 추가 조건 없음',
    release: 'none',
  },
  eclipseAffinity: 'eclipse',
  eclipseSummonPhases: ['eclipse'],
  temporalProfileName: '전 시간대 · 상시 포식',
  eclipsePhaseModifiers: {
    dawn: { attack: 5, health: 5, label: '여명 포식' },
    zenith: { attack: 5, health: 5, label: '정점 포식' },
    dusk: { attack: 5, health: 5, label: '황혼 포식' },
    midnight: { attack: 5, health: 5, label: '심야 포식' },
    eclipse: { attack: 5, health: 5, label: '일식 포식' },
  },
  eclipsePhasePulses: [
    { phase: 'dawn', name: '여명 섭식 · 생명', description: '여명 진입 시 새로 태어나는 생명을 먹어 내 코어 4를 회복한다.', effect: { kind: 'heal_core', amount: 4 } },
    { phase: 'zenith', name: '정점 섭식 · 열원', description: '정점 진입 시 가장 뜨거운 열원을 먹어 상대 ENERGY 2를 흡수한다.', effect: { kind: 'steal_energy', amount: 2 } },
    { phase: 'dusk', name: '황혼 섭식 · 잔광', description: '황혼 진입 시 사라지는 잔광을 먹어 상대 코어 2를 흡수한다.', effect: { kind: 'drain_core', amount: 2 } },
    { phase: 'midnight', name: '심야 섭식 · 기억', description: '심야 진입 시 남은 기억을 먹어 상대 묘지 2장을 소멸시킨다.', effect: { kind: 'banish_enemy_grave', amount: 2 } },
    { phase: 'eclipse', name: '일식 섭식 · 종말', description: '개기일식 진입 시 시간의 종말을 먹어 상대 코어에 4 피해를 준다.', effect: { kind: 'damage_core', amount: 4 } },
  ],
  vfx: {
    summon: 'time-devourer-arrival',
    attack: 'time-devourer-rend',
    defense: 'time-devourer-guard',
    destroy: 'time-devourer-collapse',
  },
};
