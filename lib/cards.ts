import type { BattleCard, CardCategory, CardRarity } from '@/types/game';

const rarityTable: { rarity: CardRarity; weight: number; multiplier: number }[] = [
  { rarity: '일반', weight: 60, multiplier: 1 },
  { rarity: '고급', weight: 24, multiplier: 1.4 },
  { rarity: '희귀', weight: 10, multiplier: 2 },
  { rarity: '영웅', weight: 5, multiplier: 3.5 },
  { rarity: '전설', weight: 1, multiplier: 120 },
];

const templates: Record<Exclude<CardCategory, 'location'>, { label: string; statKey: string; unit: string; base: number; desc: string }[]> = {
  physical: [
    { label: '심폐 지구력', statKey: 'endurance_sec', unit: '초', base: 10, desc: '지속적인 움직임과 회복에 영향을 줍니다.' },
    { label: '순간 근력', statKey: 'power', unit: '점', base: 8, desc: '밀기, 붙잡기, 버티기 같은 힘 대결에 영향을 줍니다.' },
    { label: '반응 속도', statKey: 'reaction_ms', unit: '단계', base: 5, desc: '공격 회피와 선제 대응에 영향을 줍니다.' },
    { label: '균형 감각', statKey: 'balance', unit: '점', base: 6, desc: '넘어짐과 자세 붕괴를 견디는 능력입니다.' },
  ],
  mental: [
    { label: '집중 지속력', statKey: 'focus_sec', unit: '초', base: 12, desc: '혼란 속에서도 판단을 유지하는 시간입니다.' },
    { label: '공포 저항', statKey: 'fear_resist', unit: '점', base: 7, desc: '위압감과 돌발 상황에 흔들리지 않는 정도입니다.' },
    { label: '통증 인내', statKey: 'pain_resist', unit: '점', base: 6, desc: '누적 부상으로 인한 행동 저하를 완화합니다.' },
    { label: '판단 회복', statKey: 'reset', unit: '점', base: 5, desc: '실수 후 전술을 재정비하는 능력입니다.' },
  ],
  verbal: [
    { label: '논리 압박', statKey: 'logic', unit: '점', base: 7, desc: '상대의 주장과 페이스를 무너뜨리는 능력입니다.' },
    { label: '도발 내성', statKey: 'taunt_resist', unit: '점', base: 7, desc: '도발을 받아도 침착함을 유지합니다.' },
    { label: '설득력', statKey: 'persuasion', unit: '점', base: 6, desc: '상황 해석과 심리전의 주도권에 영향을 줍니다.' },
    { label: '언어 순발력', statKey: 'wit', unit: '점', base: 5, desc: '즉각적인 반박과 말싸움 전개에 영향을 줍니다.' },
  ],
};

const locations = [
  ['비 내리는 옥상', '젖은 바닥 때문에 균형 감각과 반응 속도가 중요해집니다.'],
  ['좁은 지하 주차장', '거리 확보가 어렵고 순간 근력과 심리 압박이 강하게 작용합니다.'],
  ['사람 많은 광장', '주변 시선과 소음 때문에 집중력과 언어적 요소가 중요해집니다.'],
  ['어두운 창고', '시야가 제한되어 공포 저항과 반응 속도가 중요해집니다.'],
  ['모래사장', '발이 빠져 지구력 소모가 커지고 균형 감각이 중요해집니다.'],
  ['조용한 도서관', '큰 행동이 제약되어 언어·정신적 요인이 상대적으로 강해집니다.'],
] as const;

function uuid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
}

function pickRarity() {
  const roll = Math.random() * 100;
  let acc = 0;
  for (const row of rarityTable) {
    acc += row.weight;
    if (roll <= acc) return row;
  }
  return rarityTable[0];
}

export function drawCard(category: Exclude<CardCategory, 'location'>): BattleCard {
  const t = templates[category][Math.floor(Math.random() * templates[category].length)];
  const rarity = pickRarity();
  // 전설 심폐 지구력은 예시처럼 정확히 1시간(3600초)에 근접한 강력한 카드로 처리.
  let value = Math.max(1, Math.round(t.base * rarity.multiplier));
  if (rarity.rarity === '전설' && (t.statKey === 'endurance_sec' || t.statKey === 'focus_sec')) value = 3600;
  return {
    id: uuid(), category, label: t.label, statKey: t.statKey, value, unit: t.unit,
    rarity: rarity.rarity,
    description: `${t.desc} ${t.label} ${value}${t.unit}.`,
  };
}

export function drawLocation(): BattleCard {
  const [label, description] = locations[Math.floor(Math.random() * locations.length)];
  return { id: uuid(), category: 'location', label, statKey: 'location', value: 1, unit: '', rarity: '일반', description };
}

export function stackCards(cards: BattleCard[], incoming: BattleCard): BattleCard[] {
  const index = cards.findIndex(c => c.category === incoming.category && c.statKey === incoming.statKey && c.label === incoming.label);
  if (index === -1) return [...cards, incoming];
  const next = [...cards];
  const old = next[index];
  next[index] = {
    ...old,
    value: old.value + incoming.value,
    description: `${old.label} ${old.value + incoming.value}${old.unit} (중첩 강화)`,
  };
  return next;
}
