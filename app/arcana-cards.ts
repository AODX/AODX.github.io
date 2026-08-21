export type CardType = 'unit' | 'spell' | 'trap';
export type CardRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CardTarget =
  | 'none'
  | 'enemy_any'
  | 'enemy_unit'
  | 'friendly_any'
  | 'friendly_unit'
  | 'empty_friendly_lane';

export type UnitKeyword = 'haste' | 'lifesteal' | 'pierce' | 'barrier';
export type TrapTrigger = 'enemy_spell' | 'enemy_summon' | 'core_attack' | 'friendly_attacked' | 'friendly_destroyed';

export type CardEffect =
  | { kind: 'damage'; amount: number }
  | { kind: 'heal'; amount: number }
  | { kind: 'buff'; attack: number; health: number }
  | { kind: 'draw'; amount: number }
  | { kind: 'aoe'; amount: number }
  | { kind: 'energy'; amount: number }
  | { kind: 'shield'; amount: number }
  | { kind: 'freeze' };

export type OnPlayEffect =
  | { kind: 'draw'; amount: number }
  | { kind: 'heal_core'; amount: number }
  | { kind: 'damage_enemy_core'; amount: number }
  | { kind: 'shield_self'; amount: number }
  | { kind: 'buff_ally'; attack: number; health: number };

export type ArcanaCard = {
  id: string;
  name: string;
  type: CardType;
  rarity: CardRarity;
  cost: number;
  faction: 'ember' | 'tide' | 'grove' | 'void' | 'crown' | 'neutral';
  icon: string;
  text: string;
  flavor: string;
  attack?: number;
  health?: number;
  keywords?: UnitKeyword[];
  onPlay?: OnPlayEffect;
  target?: CardTarget;
  effect?: CardEffect;
  trigger?: TrapTrigger;
};

export const RARITY_LABEL: Record<CardRarity, string> = {
  common: '일반',
  rare: '희귀',
  epic: '영웅',
  legendary: '전설',
};

export const TYPE_LABEL: Record<CardType, string> = {
  unit: '유닛',
  spell: '주문',
  trap: '함정',
};

export const CARD_POOL: ArcanaCard[] = [
  // Units — Ember
  {
    id: 'ember_scout', name: '잿불 정찰병', type: 'unit', rarity: 'common', cost: 1,
    faction: 'ember', icon: 'E1', attack: 2, health: 1, keywords: ['haste'],
    text: '속공 — 소환한 턴에도 공격할 수 있습니다.',
    flavor: '가장 먼저 불길 속으로 달려드는 자.',
  },
  {
    id: 'cinder_hound', name: '잿빛 사냥개', type: 'unit', rarity: 'common', cost: 2,
    faction: 'ember', icon: 'E2', attack: 3, health: 2,
    text: '단순하지만 빠르고 강한 공격형 유닛입니다.',
    flavor: '냄새가 아니라 열기를 추적한다.',
  },
  {
    id: 'furnace_guard', name: '용광로 수호병', type: 'unit', rarity: 'rare', cost: 3,
    faction: 'ember', icon: 'E3', attack: 3, health: 5, keywords: ['barrier'],
    text: '보호막 — 소환될 때 보호막 2를 얻습니다.',
    flavor: '쇳물이 식어도 그의 갑옷은 식지 않는다.',
  },
  {
    id: 'scarlet_duelist', name: '진홍 결투가', type: 'unit', rarity: 'rare', cost: 4,
    faction: 'ember', icon: 'E4', attack: 5, health: 4, keywords: ['pierce'],
    text: '관통 — 유닛을 처치하고 남은 피해가 적 코어에 들어갑니다.',
    flavor: '한 번 뽑은 검은 반드시 무언가를 벤다.',
  },
  {
    id: 'phoenix_heir', name: '불사조의 후계자', type: 'unit', rarity: 'legendary', cost: 7,
    faction: 'ember', icon: 'EL', attack: 7, health: 6, keywords: ['haste', 'lifesteal'],
    text: '속공, 흡수 — 입힌 피해만큼 내 코어를 회복합니다.',
    flavor: '재가 되는 것은 끝이 아니라 다음 공격의 시작이다.',
  },

  // Units — Tide
  {
    id: 'tide_apprentice', name: '파도 견습생', type: 'unit', rarity: 'common', cost: 2,
    faction: 'tide', icon: 'T1', attack: 2, health: 3,
    text: '균형 잡힌 기본 유닛입니다.',
    flavor: '잔잔한 물결도 때를 만나면 성벽을 무너뜨린다.',
  },
  {
    id: 'mist_oracle', name: '안개 예언자', type: 'unit', rarity: 'rare', cost: 3,
    faction: 'tide', icon: 'T2', attack: 2, health: 4, onPlay: { kind: 'draw', amount: 1 },
    text: '소환 — 카드를 1장 뽑습니다.',
    flavor: '보이지 않는 길을 먼저 걷는 자.',
  },
  {
    id: 'coral_knight', name: '산호 기사', type: 'unit', rarity: 'rare', cost: 4,
    faction: 'tide', icon: 'T3', attack: 4, health: 6, keywords: ['barrier'],
    text: '보호막 — 소환될 때 보호막 2를 얻습니다.',
    flavor: '바다가 세운 벽은 파도처럼 다시 일어난다.',
  },
  {
    id: 'abyss_serpent', name: '심해의 뱀', type: 'unit', rarity: 'epic', cost: 6,
    faction: 'tide', icon: 'TE', attack: 6, health: 7, keywords: ['lifesteal'],
    text: '흡수 — 입힌 피해만큼 내 코어를 회복합니다.',
    flavor: '깊은 곳의 포식자는 소리보다 먼저 도착한다.',
  },

  // Units — Grove
  {
    id: 'mossling', name: '이끼 정령', type: 'unit', rarity: 'common', cost: 1,
    faction: 'grove', icon: 'G1', attack: 1, health: 3,
    text: '낮은 비용으로 전선을 지키는 생존형 유닛입니다.',
    flavor: '작지만 쉽게 사라지지 않는다.',
  },
  {
    id: 'thorn_wolf', name: '가시 늑대', type: 'unit', rarity: 'common', cost: 3,
    faction: 'grove', icon: 'G2', attack: 4, health: 3,
    text: '공격적인 능력치를 가진 야수입니다.',
    flavor: '쫓기는 순간에도 이빨은 앞을 향한다.',
  },
  {
    id: 'bloom_priestess', name: '개화의 사제', type: 'unit', rarity: 'rare', cost: 3,
    faction: 'grove', icon: 'G3', attack: 2, health: 4, onPlay: { kind: 'heal_core', amount: 3 },
    text: '소환 — 내 코어를 3 회복합니다.',
    flavor: '전장 한가운데서도 꽃은 피어난다.',
  },
  {
    id: 'ancient_stag', name: '태고의 숫사슴', type: 'unit', rarity: 'epic', cost: 5,
    faction: 'grove', icon: 'GE', attack: 5, health: 7, onPlay: { kind: 'buff_ally', attack: 1, health: 1 },
    text: '소환 — 다른 아군 유닛 하나에게 공격력과 체력 +1을 부여합니다.',
    flavor: '그가 지나간 자리에는 숲이 다시 선다.',
  },
  {
    id: 'worldroot_colossus', name: '세계뿌리 거신', type: 'unit', rarity: 'legendary', cost: 8,
    faction: 'grove', icon: 'GL', attack: 8, health: 10, keywords: ['barrier'],
    text: '보호막 — 소환될 때 보호막 2를 얻습니다.',
    flavor: '대지의 맥박이 거대한 몸을 얻었다.',
  },

  // Units — Void
  {
    id: 'rift_imp', name: '균열 임프', type: 'unit', rarity: 'common', cost: 1,
    faction: 'void', icon: 'V1', attack: 2, health: 1, onPlay: { kind: 'damage_enemy_core', amount: 1 },
    text: '소환 — 적 코어에 피해 1을 줍니다.',
    flavor: '작은 균열도 방치하면 세계를 삼킨다.',
  },
  {
    id: 'shade_assassin', name: '그림자 암살자', type: 'unit', rarity: 'rare', cost: 3,
    faction: 'void', icon: 'V2', attack: 4, health: 2, keywords: ['haste'],
    text: '속공 — 소환한 턴에도 공격할 수 있습니다.',
    flavor: '보이기 전에 이미 칼끝이 닿는다.',
  },
  {
    id: 'soul_collector', name: '영혼 수집가', type: 'unit', rarity: 'rare', cost: 4,
    faction: 'void', icon: 'V3', attack: 4, health: 5, keywords: ['lifesteal'],
    text: '흡수 — 입힌 피해만큼 내 코어를 회복합니다.',
    flavor: '패배자의 마지막 숨까지 전리품으로 삼는다.',
  },
  {
    id: 'rift_devourer', name: '균열 포식자', type: 'unit', rarity: 'epic', cost: 6,
    faction: 'void', icon: 'VE', attack: 7, health: 5, keywords: ['pierce'],
    text: '관통 — 유닛을 처치하고 남은 피해가 적 코어에 들어갑니다.',
    flavor: '빈 공간마저 먹어 치우는 굶주림.',
  },

  // Units — Crown / Neutral
  {
    id: 'silver_page', name: '은빛 시종', type: 'unit', rarity: 'common', cost: 2,
    faction: 'crown', icon: 'C1', attack: 2, health: 4,
    text: '초반 전선을 안정적으로 지키는 유닛입니다.',
    flavor: '왕관보다 먼저 검을 드는 자.',
  },
  {
    id: 'royal_lancer', name: '왕실 창기병', type: 'unit', rarity: 'rare', cost: 4,
    faction: 'crown', icon: 'C2', attack: 5, health: 4, keywords: ['pierce'],
    text: '관통 — 유닛을 처치하고 남은 피해가 적 코어에 들어갑니다.',
    flavor: '직선으로 달려드는 의지는 쉽게 꺾이지 않는다.',
  },
  {
    id: 'clockwork_golem', name: '태엽 골렘', type: 'unit', rarity: 'rare', cost: 5,
    faction: 'neutral', icon: 'N1', attack: 5, health: 8,
    text: '높은 체력으로 한 라인을 오래 지키는 유닛입니다.',
    flavor: '명령이 끝날 때까지 멈추지 않는다.',
  },
  {
    id: 'star_archon', name: '성좌 집정관', type: 'unit', rarity: 'legendary', cost: 9,
    faction: 'crown', icon: 'CL', attack: 9, health: 9, onPlay: { kind: 'draw', amount: 2 },
    text: '소환 — 카드를 2장 뽑습니다.',
    flavor: '별빛 아래의 판결은 뒤집히지 않는다.',
  },

  // Spells
  {
    id: 'arc_spark', name: '비전 섬광', type: 'spell', rarity: 'common', cost: 2,
    faction: 'ember', icon: 'S1', target: 'enemy_any', effect: { kind: 'damage', amount: 3 },
    text: '적 유닛 하나 또는 적 코어에 피해 3을 줍니다.',
    flavor: '짧은 빛, 확실한 상처.',
  },
  {
    id: 'tidal_mend', name: '밀물의 치유', type: 'spell', rarity: 'common', cost: 2,
    faction: 'tide', icon: 'S2', target: 'friendly_any', effect: { kind: 'heal', amount: 4 },
    text: '아군 유닛 하나 또는 내 코어를 4 회복합니다.',
    flavor: '바다는 빼앗은 것을 때로 돌려준다.',
  },
  {
    id: 'battle_anthem', name: '전장의 찬가', type: 'spell', rarity: 'rare', cost: 2,
    faction: 'crown', icon: 'S3', target: 'friendly_unit', effect: { kind: 'buff', attack: 2, health: 2 },
    text: '아군 유닛 하나에게 공격력과 체력 +2를 부여합니다.',
    flavor: '한 구절이 군대를 일으킨다.',
  },
  {
    id: 'deep_insight', name: '심층 통찰', type: 'spell', rarity: 'rare', cost: 3,
    faction: 'tide', icon: 'S4', target: 'none', effect: { kind: 'draw', amount: 2 },
    text: '카드를 2장 뽑습니다.',
    flavor: '답은 보이지 않는 곳에서 먼저 떠오른다.',
  },
  {
    id: 'thorn_storm', name: '가시 폭풍', type: 'spell', rarity: 'rare', cost: 4,
    faction: 'grove', icon: 'S5', target: 'none', effect: { kind: 'aoe', amount: 2 },
    text: '모든 적 유닛에게 피해 2를 줍니다.',
    flavor: '숲이 화나면 피할 길은 없다.',
  },
  {
    id: 'mana_surge', name: '마나 폭주', type: 'spell', rarity: 'common', cost: 1,
    faction: 'neutral', icon: 'S6', target: 'none', effect: { kind: 'energy', amount: 2 },
    text: '이번 턴에 사용할 에너지를 2 회복합니다.',
    flavor: '지금의 힘을 미래에서 빌려온다.',
  },
  {
    id: 'crystal_aegis', name: '수정 방벽', type: 'spell', rarity: 'rare', cost: 2,
    faction: 'crown', icon: 'S7', target: 'friendly_unit', effect: { kind: 'shield', amount: 4 },
    text: '아군 유닛 하나에게 보호막 4를 부여합니다.',
    flavor: '깨지기 전까지는 완벽한 벽.',
  },
  {
    id: 'void_bolt', name: '공허의 화살', type: 'spell', rarity: 'epic', cost: 4,
    faction: 'void', icon: 'S8', target: 'enemy_unit', effect: { kind: 'damage', amount: 6 },
    text: '적 유닛 하나에게 피해 6을 줍니다.',
    flavor: '맞은 자보다 사라진 자가 많다.',
  },
  {
    id: 'winter_bind', name: '겨울의 속박', type: 'spell', rarity: 'rare', cost: 3,
    faction: 'tide', icon: 'S9', target: 'enemy_unit', effect: { kind: 'freeze' },
    text: '적 유닛 하나를 지치게 만들어 다음 공격을 막습니다.',
    flavor: '한순간의 정지가 전투의 결말을 바꾼다.',
  },
  {
    id: 'meteor_crown', name: '왕관의 유성', type: 'spell', rarity: 'legendary', cost: 7,
    faction: 'crown', icon: 'SL', target: 'enemy_any', effect: { kind: 'damage', amount: 8 },
    text: '적 유닛 하나 또는 적 코어에 피해 8을 줍니다.',
    flavor: '하늘에서 내려오는 최종 판결.',
  },
  {
    id: 'second_breath', name: '두 번째 숨', type: 'spell', rarity: 'common', cost: 2,
    faction: 'grove', icon: 'SA', target: 'friendly_any', effect: { kind: 'heal', amount: 3 },
    text: '아군 유닛 하나 또는 내 코어를 3 회복하고 카드를 1장 뽑습니다.',
    flavor: '쓰러지기 직전의 한 호흡은 길다.',
  },
  {
    id: 'shadow_bargain', name: '그림자 거래', type: 'spell', rarity: 'epic', cost: 2,
    faction: 'void', icon: 'SB', target: 'none', effect: { kind: 'draw', amount: 3 },
    text: '카드를 3장 뽑고 내 코어에 피해 3을 줍니다.',
    flavor: '대가는 언제나 나중에 청구된다.',
  },

  // Traps
  {
    id: 'mirror_snare', name: '거울 올가미', type: 'trap', rarity: 'rare', cost: 2,
    faction: 'tide', icon: 'X1', trigger: 'core_attack',
    text: '적 유닛이 내 코어를 공격할 때 발동. 공격자에게 피해 4를 주고 코어 피해를 2 줄입니다.',
    flavor: '달려든 힘이 그대로 되돌아온다.',
  },
  {
    id: 'thorn_circle', name: '가시의 원', type: 'trap', rarity: 'common', cost: 1,
    faction: 'grove', icon: 'X2', trigger: 'friendly_attacked',
    text: '내 유닛이 공격받을 때 발동. 공격자에게 피해 3을 줍니다.',
    flavor: '건드리지 말라는 경고는 이미 늦었다.',
  },
  {
    id: 'null_seal', name: '무효의 인장', type: 'trap', rarity: 'epic', cost: 3,
    faction: 'void', icon: 'X3', trigger: 'enemy_spell',
    text: '상대가 주문을 사용할 때 발동. 그 주문의 효과를 무효화합니다.',
    flavor: '말해진 주문을 없던 일로 만든다.',
  },
  {
    id: 'pitfall_glyph', name: '함몰 문양', type: 'trap', rarity: 'common', cost: 1,
    faction: 'neutral', icon: 'X4', trigger: 'enemy_summon',
    text: '상대가 유닛을 소환할 때 발동. 그 유닛에게 피해 3을 줍니다.',
    flavor: '첫발부터 잘못 디딘 전투.',
  },
  {
    id: 'frozen_sigil', name: '빙결의 문장', type: 'trap', rarity: 'rare', cost: 2,
    faction: 'tide', icon: 'X5', trigger: 'core_attack',
    text: '적 유닛이 내 코어를 공격할 때 발동. 그 공격을 완전히 취소합니다.',
    flavor: '칼끝과 시간 사이에 얼음이 낀다.',
  },
  {
    id: 'guardian_oath', name: '수호자의 맹세', type: 'trap', rarity: 'rare', cost: 2,
    faction: 'crown', icon: 'X6', trigger: 'core_attack',
    text: '내 코어가 공격받을 때 발동. 그 피해를 5 줄입니다.',
    flavor: '왕좌보다 먼저 무릎 꿇지 않는 약속.',
  },
  {
    id: 'reversal_gate', name: '역전의 문', type: 'trap', rarity: 'epic', cost: 3,
    faction: 'void', icon: 'X7', trigger: 'friendly_destroyed',
    text: '내 유닛이 파괴될 때 발동. 빈 라인에 2/2 그림자 토큰을 소환합니다.',
    flavor: '끝난 자리가 새로운 입구가 된다.',
  },
  {
    id: 'counter_pulse', name: '반격 파동', type: 'trap', rarity: 'legendary', cost: 4,
    faction: 'ember', icon: 'XL', trigger: 'core_attack',
    text: '내 코어가 공격받을 때 발동. 피해를 3 줄이고 적 코어에 피해 4를 줍니다.',
    flavor: '마지막 방어선은 동시에 첫 번째 반격이다.',
  },
];

export const CARD_MAP = new Map(CARD_POOL.map((card) => [card.id, card]));

export const DECK_SIZE = 24;
export const MIN_UNIT_COUNT = 10;
export const MAX_SPELL_COUNT = 8;
export const MAX_TRAP_COUNT = 6;

export const COPY_LIMIT_BY_RARITY: Record<CardRarity, number> = {
  common: 3,
  rare: 2,
  epic: 2,
  legendary: 1,
};

export const STARTER_DECK: string[] = [
  'ember_scout', 'ember_scout',
  'cinder_hound', 'cinder_hound',
  'tide_apprentice', 'tide_apprentice',
  'mossling', 'mossling',
  'thorn_wolf', 'thorn_wolf',
  'rift_imp', 'rift_imp',
  'silver_page', 'silver_page',
  'arc_spark', 'arc_spark',
  'tidal_mend', 'tidal_mend',
  'battle_anthem',
  'deep_insight',
  'thorn_circle', 'thorn_circle',
  'pitfall_glyph', 'pitfall_glyph',
];

export const STARTER_BONUS_CARDS: string[] = [
  'furnace_guard',
  'mist_oracle',
  'winter_bind',
  'mirror_snare',
  'mana_surge',
  'second_breath',
];

export const PICKUP_CARD_IDS: string[] = [
  'phoenix_heir',
  'scarlet_duelist',
  'furnace_guard',
  'arc_spark',
  'meteor_crown',
  'counter_pulse',
];

export function shuffleCardIds(cardIds: string[]): string[] {
  const deck = [...cardIds];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function deckCopyLimit(card: ArcanaCard): number {
  return COPY_LIMIT_BY_RARITY[card.rarity];
}

export function validateDeckList(cardIds: string[]): { ok: true } | { ok: false; message: string } {
  if (cardIds.length !== DECK_SIZE) {
    return { ok: false, message: `덱은 정확히 ${DECK_SIZE}장이어야 합니다.` };
  }

  const counts = new Map<string, number>();
  let units = 0;
  let spells = 0;
  let traps = 0;

  for (const cardId of cardIds) {
    const card = CARD_MAP.get(cardId);
    if (!card) return { ok: false, message: '존재하지 않는 카드가 덱에 포함되어 있습니다.' };
    counts.set(cardId, (counts.get(cardId) ?? 0) + 1);
    if (card.type === 'unit') units += 1;
    if (card.type === 'spell') spells += 1;
    if (card.type === 'trap') traps += 1;
  }

  for (const [cardId, count] of counts) {
    const card = CARD_MAP.get(cardId)!;
    const limit = deckCopyLimit(card);
    if (count > limit) {
      return { ok: false, message: `${card.name}은(는) 최대 ${limit}장까지 넣을 수 있습니다.` };
    }
  }

  if (units < MIN_UNIT_COUNT) return { ok: false, message: `유닛 카드는 최소 ${MIN_UNIT_COUNT}장 필요합니다.` };
  if (spells > MAX_SPELL_COUNT) return { ok: false, message: `주문 카드는 최대 ${MAX_SPELL_COUNT}장까지 넣을 수 있습니다.` };
  if (traps > MAX_TRAP_COUNT) return { ok: false, message: `함정 카드는 최대 ${MAX_TRAP_COUNT}장까지 넣을 수 있습니다.` };
  return { ok: true };
}

const rarityWeight: Record<CardRarity, number> = {
  common: 62,
  rare: 26,
  epic: 10,
  legendary: 2,
};

function weightedPick<T extends { rarity: CardRarity }>(pool: T[]): T {
  const total = pool.reduce((sum, item) => sum + rarityWeight[item.rarity], 0);
  let roll = Math.random() * total;
  for (const item of pool) {
    roll -= rarityWeight[item.rarity];
    if (roll <= 0) return item;
  }
  return pool[pool.length - 1];
}

function pickCards(type: CardType, count: number, duplicateLimit: number): string[] {
  const source = CARD_POOL.filter((card) => card.type === type);
  const result: string[] = [];
  const counts = new Map<string, number>();
  let safety = 0;
  while (result.length < count && safety < 1000) {
    safety += 1;
    const card = weightedPick(source);
    const current = counts.get(card.id) ?? 0;
    const limit = card.rarity === 'legendary' ? 1 : duplicateLimit;
    if (current >= limit) continue;
    counts.set(card.id, current + 1);
    result.push(card.id);
  }
  return result;
}

export function buildRandomDeck(): string[] {
  const deck = [
    ...pickCards('unit', 14, 2),
    ...pickCards('spell', 6, 2),
    ...pickCards('trap', 4, 2),
  ];
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

export function makeHandEntry(cardId: string) {
  return { uid: crypto.randomUUID(), cardId };
}
