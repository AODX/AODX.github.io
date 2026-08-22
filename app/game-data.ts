export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CardKind = 'unit' | 'spell' | 'trap' | 'fusion' | 'evolution';
export type MainDeckKind = 'unit' | 'spell' | 'trap';
export type ExtraDeckKind = 'fusion' | 'evolution';
export type Element = 'solar' | 'lunar' | 'storm' | 'verdant' | 'void' | 'neutral';
export type Keyword = 'guard' | 'charge' | 'lifesteal' | 'pierce';
export type SummonMode = 'normal' | 'rift' | 'fusion' | 'evolution';
export type VfxMoment = 'summon' | 'attack' | 'defense' | 'activation' | 'destroy';

export type Effect =
  | { kind: 'damage_unit'; amount: number }
  | { kind: 'damage_core'; amount: number }
  | { kind: 'heal_core'; amount: number }
  | { kind: 'draw'; amount: number }
  | { kind: 'buff_unit'; attack: number; health: number }
  | { kind: 'shield_unit'; amount: number }
  | { kind: 'aoe_enemy'; amount: number }
  | { kind: 'gain_energy'; amount: number }
  | { kind: 'destroy_weak'; maxHealth: number }
  | { kind: 'summon_token'; attack: number; health: number; name: string };

export type TrapTrigger =
  | 'spell_played'
  | 'unit_summoned'
  | 'special_summoned'
  | 'fusion_summoned'
  | 'evolution_summoned'
  | 'direct_attack'
  | 'unit_attacked'
  | 'friendly_destroyed';

export type RiftCondition =
  | { kind: 'empty_board'; label: string }
  | { kind: 'core_below'; value: number; label: string }
  | { kind: 'opponent_more_units'; label: string }
  | { kind: 'graveyard_min'; value: number; label: string }
  | { kind: 'ally_element'; element: Element; label: string };

export interface FusionMaterial {
  label: string;
  element?: Element;
  cardIds?: string[];
  minCost?: number;
}

export interface FusionRecipe {
  label: string;
  materials: FusionMaterial[];
}

export interface EvolutionRecipe {
  label: string;
  fromIds?: string[];
  element?: Element;
  minCost?: number;
  maxCost?: number;
}

export interface CardVfxProfile {
  summon?: string;
  attack?: string;
  defense?: string;
  activation?: string;
  destroy?: string;
}

export interface CardDefinition {
  id: string;
  name: string;
  subtitle: string;
  kind: CardKind;
  rarity: Rarity;
  element: Element;
  cost: number;
  attack?: number;
  health?: number;
  keywords?: Keyword[];
  summonMode?: SummonMode;
  riftCost?: number;
  riftCondition?: RiftCondition;
  fusionRecipe?: FusionRecipe;
  evolutionRecipe?: EvolutionRecipe;
  onSummon?: Effect;
  effect?: Effect;
  trapTrigger?: TrapTrigger;
  trapEffect?: Effect | { kind: 'negate' } | { kind: 'negate_and_damage'; amount: number };
  target: 'none' | 'enemy_unit' | 'friendly_unit' | 'enemy_core';
  text: string;
  flavor: string;
  sigil: string;
  vfx?: CardVfxProfile;
  series?: string;
}

export interface PackOdds {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
  guaranteedSlots: number;
  pickupRate?: number;
  ascensionRate?: number;
}

export interface PackDefinition {
  id: string;
  name: string;
  tagline: string;
  price: number;
  guaranteed: Rarity;
  pickupElement?: Element;
  accent: string;
  odds: PackOdds;
}

export const RARITY_LABEL: Record<Rarity, string> = {
  common: '일반',
  rare: '희귀',
  epic: '영웅',
  legendary: '전설',
};

export const KIND_LABEL: Record<CardKind, string> = {
  unit: '유닛',
  spell: '주문',
  trap: '함정',
  fusion: '공명 융합',
  evolution: '계승 진화',
};

export const ELEMENT_LABEL: Record<Element, string> = {
  solar: '태양',
  lunar: '달',
  storm: '폭풍',
  verdant: '대지',
  void: '공허',
  neutral: '중립',
};

export const CARDS: CardDefinition[] = [
  {
    id: 'unit_ember_squire', name: '잿불의 종자', subtitle: '작은 불꽃의 맹세', kind: 'unit', rarity: 'common', element: 'solar', cost: 1,
    attack: 1, health: 2, target: 'none', text: '가볍고 빠르게 전선을 채우는 기본 유닛.', flavor: '꺼지지 않는 불씨는 언제나 가장 작은 손에서 시작된다.', sigil: '✦',
  },
  {
    id: 'unit_rift_hound', name: '균열 사냥개', subtitle: '경계를 물어뜯는 야수', kind: 'unit', rarity: 'common', element: 'void', cost: 2,
    attack: 3, health: 2, target: 'none', text: '공격적인 초반 전개에 적합한 유닛.', flavor: '울음소리가 들렸다면 균열은 이미 열렸다.', sigil: '◆',
  },
  {
    id: 'unit_iron_bastion', name: '철벽 수호병', subtitle: '움직이는 성벽', kind: 'unit', rarity: 'common', element: 'neutral', cost: 2,
    attack: 1, health: 5, keywords: ['guard'], target: 'none', text: '수호: 상대는 이 유닛을 먼저 공격해야 합니다.', flavor: '그가 버티는 동안 후방은 무너지지 않는다.', sigil: '⬢',
  },
  {
    id: 'unit_celestial_archer', name: '성광 궁수', subtitle: '빛을 꿰는 화살', kind: 'unit', rarity: 'common', element: 'solar', cost: 2,
    attack: 2, health: 2, onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '소환 시 상대 코어에 1 피해.', flavor: '별빛조차 그녀의 조준선에서는 피하지 못한다.', sigil: '➹',
  },
  {
    id: 'unit_verdant_sage', name: '푸른잎 현자', subtitle: '고목의 기억', kind: 'unit', rarity: 'common', element: 'verdant', cost: 2,
    attack: 1, health: 3, onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다.', flavor: '숲은 잊지 않는다. 다만 천천히 대답할 뿐이다.', sigil: '❈',
  },
  {
    id: 'unit_tide_medic', name: '월광 치유사', subtitle: '잔잔한 회복의 물결', kind: 'unit', rarity: 'common', element: 'lunar', cost: 2,
    attack: 1, health: 4, onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 내 코어를 2 회복.', flavor: '달빛은 상처를 지우지 않는다. 다시 싸울 시간을 준다.', sigil: '☾',
  },
  {
    id: 'unit_storm_lancer', name: '폭풍 창기병', subtitle: '번개보다 먼저', kind: 'unit', rarity: 'rare', element: 'storm', cost: 3,
    attack: 4, health: 3, keywords: ['charge'], target: 'none', text: '속공: 소환한 턴에도 공격할 수 있습니다.', flavor: '그가 출발한 뒤에야 천둥이 울린다.', sigil: 'ϟ',
  },
  {
    id: 'unit_moon_priest', name: '은월 사제', subtitle: '밤의 기도', kind: 'unit', rarity: 'rare', element: 'lunar', cost: 3,
    attack: 2, health: 4, onSummon: { kind: 'heal_core', amount: 3 }, target: 'none', text: '소환 시 내 코어를 3 회복.', flavor: '새벽이 늦어질수록 기도는 더 선명해진다.', sigil: '☽',
  },
  {
    id: 'unit_ashen_duelist', name: '재의 결투가', subtitle: '패배를 태우는 검', kind: 'unit', rarity: 'rare', element: 'solar', cost: 3,
    attack: 3, health: 4, keywords: ['pierce'], target: 'none', text: '관통: 유닛을 쓰러뜨리고 남은 피해를 상대 코어에 줍니다.', flavor: '검 끝에 남은 재는 모두 이전 승부의 흔적이다.', sigil: '✧',
  },
  {
    id: 'unit_crystal_warden', name: '수정 파수꾼', subtitle: '깨지지 않는 반사광', kind: 'unit', rarity: 'rare', element: 'neutral', cost: 4,
    attack: 3, health: 6, onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 자신에게 보호막 2.', flavor: '금이 가도 빛은 더 많은 방향으로 퍼진다.', sigil: '◇',
  },
  {
    id: 'unit_void_reaper', name: '공허 수확자', subtitle: '생명을 삼키는 낫', kind: 'unit', rarity: 'rare', element: 'void', cost: 4,
    attack: 5, health: 3, keywords: ['lifesteal'], target: 'none', text: '흡수: 입힌 피해만큼 내 코어를 회복합니다.', flavor: '그 낫은 살을 베지 않는다. 존재의 흔적을 거둔다.', sigil: '◈',
  },
  {
    id: 'unit_nova_golem', name: '신성 거신', subtitle: '별철로 빚은 방패', kind: 'unit', rarity: 'rare', element: 'solar', cost: 5,
    attack: 5, health: 7, keywords: ['guard'], target: 'none', text: '수호를 가진 단단한 중후반 유닛.', flavor: '별 하나가 무너지면 거신 하나가 깨어난다.', sigil: '✺',
  },
  {
    id: 'unit_timeweaver', name: '시간 직조사', subtitle: '한 박자 앞선 미래', kind: 'unit', rarity: 'epic', element: 'lunar', cost: 5,
    attack: 4, health: 5, onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복.', flavor: '미래는 정해져 있지 않다. 다만 그녀가 먼저 만져볼 뿐이다.', sigil: '⌛',
  },
  {
    id: 'unit_oracle_glass', name: '유리의 예언자', subtitle: '깨진 미래의 조각', kind: 'unit', rarity: 'epic', element: 'neutral', cost: 4,
    attack: 3, health: 4, onSummon: { kind: 'draw', amount: 2 }, target: 'none', text: '소환 시 카드 2장을 뽑습니다.', flavor: '모든 예언은 진실이다. 다만 어느 조각인지는 알 수 없다.', sigil: '◫',
  },
  {
    id: 'unit_eclipse_dragon', name: '식의 용', subtitle: '빛을 삼킨 날개', kind: 'unit', rarity: 'epic', element: 'void', cost: 6,
    attack: 7, health: 6, keywords: ['pierce'], target: 'none', text: '강력한 관통 공격으로 전선을 무너뜨립니다.', flavor: '해와 달이 겹치는 순간, 그림자가 하늘을 덮는다.', sigil: '☯',
  },
  {
    id: 'unit_phoenix_knight', name: '불사조 기사', subtitle: '재에서 다시 선 자', kind: 'unit', rarity: 'epic', element: 'solar', cost: 5,
    attack: 6, health: 4, keywords: ['charge', 'lifesteal'], target: 'none', text: '속공과 흡수를 동시에 가진 돌파 유닛.', flavor: '그의 갑옷은 장례의 불꽃 속에서 완성되었다.', sigil: '♨',
  },
  {
    id: 'unit_tempest_queen', name: '폭풍의 여왕', subtitle: '천공의 지배자', kind: 'unit', rarity: 'epic', element: 'storm', cost: 6,
    attack: 6, health: 6, onSummon: { kind: 'aoe_enemy', amount: 1 }, target: 'none', text: '소환 시 모든 적 유닛에 1 피해.', flavor: '그녀가 손을 들면 구름이 먼저 무릎 꿇는다.', sigil: '♛',
  },
  {
    id: 'unit_crownless_titan', name: '왕관 없는 거인', subtitle: '왕좌보다 큰 존재', kind: 'unit', rarity: 'legendary', element: 'neutral', cost: 8,
    attack: 9, health: 10, keywords: ['guard', 'pierce'], target: 'none', text: '수호와 관통을 가진 최상급 전선 지배자.', flavor: '왕관이 필요 없는 자에게 왕국은 너무 작았다.', sigil: '♜',
  },
  {
    id: 'unit_star_devourer', name: '성식의 포식자', subtitle: '별을 먹는 공허', kind: 'unit', rarity: 'legendary', element: 'void', cost: 9,
    attack: 10, health: 8, onSummon: { kind: 'aoe_enemy', amount: 2 }, keywords: ['lifesteal'], target: 'none', text: '소환 시 모든 적 유닛에 2 피해. 흡수.', flavor: '밤하늘의 빈자리마다 이 괴물의 식사가 남아 있다.', sigil: '✹',
  },
  {
    id: 'unit_dawn_seraph', name: '여명의 세라프', subtitle: '첫 빛의 날개', kind: 'unit', rarity: 'legendary', element: 'solar', cost: 7,
    attack: 6, health: 9, onSummon: { kind: 'heal_core', amount: 6 }, keywords: ['guard'], target: 'none', text: '소환 시 내 코어를 6 회복. 수호.', flavor: '가장 긴 밤의 끝에서 가장 큰 날개가 펼쳐진다.', sigil: '✵',
  },

  {
    id: 'spell_spark_bolt', name: '섬광탄', subtitle: '짧고 정확한 번개', kind: 'spell', rarity: 'common', element: 'storm', cost: 1,
    effect: { kind: 'damage_unit', amount: 2 }, target: 'enemy_unit', text: '적 유닛 하나에 2 피해.', flavor: '작은 번개도 정확하면 치명적이다.', sigil: 'ϟ',
  },
  {
    id: 'spell_battle_hymn', name: '전투 찬가', subtitle: '검을 깨우는 노래', kind: 'spell', rarity: 'common', element: 'solar', cost: 2,
    effect: { kind: 'buff_unit', attack: 2, health: 1 }, target: 'friendly_unit', text: '아군 유닛 하나에게 공격력 +2, 체력 +1.', flavor: '노래가 끝날 때까지 누구도 뒤로 물러서지 않는다.', sigil: '♫',
  },
  {
    id: 'spell_mending_light', name: '회복의 빛', subtitle: '금이 간 코어를 잇다', kind: 'spell', rarity: 'common', element: 'lunar', cost: 2,
    effect: { kind: 'heal_core', amount: 4 }, target: 'none', text: '내 코어를 4 회복.', flavor: '빛은 상처를 감추지 않고 다시 이어 붙인다.', sigil: '✚',
  },
  {
    id: 'spell_astral_insight', name: '성운의 통찰', subtitle: '별 사이의 답', kind: 'spell', rarity: 'rare', element: 'neutral', cost: 2,
    effect: { kind: 'draw', amount: 2 }, target: 'none', text: '카드 2장을 뽑습니다.', flavor: '별을 읽는다는 것은 아직 오지 않은 선택을 보는 일이다.', sigil: '✣',
  },
  {
    id: 'spell_void_lance', name: '공허의 창', subtitle: '방어를 가르는 검은 선', kind: 'spell', rarity: 'rare', element: 'void', cost: 3,
    effect: { kind: 'damage_unit', amount: 4 }, target: 'enemy_unit', text: '적 유닛 하나에 4 피해.', flavor: '검은 선이 지나간 자리에는 소리조차 남지 않는다.', sigil: '⟐',
  },
  {
    id: 'spell_overgrowth', name: '급속 성장', subtitle: '한순간의 거목', kind: 'spell', rarity: 'rare', element: 'verdant', cost: 3,
    effect: { kind: 'buff_unit', attack: 2, health: 3 }, target: 'friendly_unit', text: '아군 유닛 하나에게 공격력 +2, 체력 +3.', flavor: '숲의 시간은 전장보다 빠르게 흐를 수 있다.', sigil: '♣',
  },
  {
    id: 'spell_chain_lightning', name: '연쇄 번개', subtitle: '도망칠 곳 없는 전류', kind: 'spell', rarity: 'epic', element: 'storm', cost: 4,
    effect: { kind: 'aoe_enemy', amount: 2 }, target: 'none', text: '모든 적 유닛에 2 피해.', flavor: '첫 번째 섬광은 경고였고, 두 번째부터는 심판이었다.', sigil: '⌁',
  },
  {
    id: 'spell_cleanse', name: '월식 정화', subtitle: '약한 존재의 소거', kind: 'spell', rarity: 'epic', element: 'lunar', cost: 4,
    effect: { kind: 'destroy_weak', maxHealth: 3 }, target: 'enemy_unit', text: '현재 체력이 3 이하인 적 유닛 하나를 파괴.', flavor: '달이 가려지는 순간, 약한 그림자는 먼저 사라진다.', sigil: '◐',
  },
  {
    id: 'spell_supernova', name: '초신성 폭발', subtitle: '한 별의 마지막 명령', kind: 'spell', rarity: 'legendary', element: 'solar', cost: 7,
    effect: { kind: 'aoe_enemy', amount: 5 }, target: 'none', text: '모든 적 유닛에 5 피해.', flavor: '별은 죽는 순간 가장 밝게 명령한다.', sigil: '☀',
  },
  {
    id: 'spell_rebirth_seed', name: '재생의 씨앗', subtitle: '빈 전선에 돋는 생명', kind: 'spell', rarity: 'epic', element: 'verdant', cost: 4,
    effect: { kind: 'summon_token', attack: 3, health: 3, name: '수호 묘목' }, target: 'none', text: '빈 유닛 칸에 3/3 수호 묘목을 소환.', flavor: '전쟁이 끝나지 않아도 새싹은 기다리지 않는다.', sigil: '❉',
  },

  {
    id: 'trap_mirror_veil', name: '거울 장막', subtitle: '되돌아오는 살의', kind: 'trap', rarity: 'common', element: 'lunar', cost: 2,
    trapTrigger: 'direct_attack', trapEffect: { kind: 'negate_and_damage', amount: 2 }, target: 'none', text: '상대의 직접 공격을 무효로 하고 공격 유닛에 2 피해.', flavor: '가장 날카로운 공격은 종종 자신을 향해 돌아온다.', sigil: '▣',
  },
  {
    id: 'trap_thorn_snare', name: '가시 덫', subtitle: '발밑에서 자라는 반격', kind: 'trap', rarity: 'common', element: 'verdant', cost: 2,
    trapTrigger: 'unit_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '상대가 유닛을 소환하면 그 유닛에 2 피해.', flavor: '숲은 침입자를 기억하고 발목부터 붙잡는다.', sigil: '♧',
  },
  {
    id: 'trap_counter_sigil', name: '역전의 문장', subtitle: '주문을 삼키는 룬', kind: 'trap', rarity: 'rare', element: 'neutral', cost: 3,
    trapTrigger: 'spell_played', trapEffect: { kind: 'negate' }, target: 'none', text: '상대가 사용한 주문 1장을 무효화.', flavor: '말해진 주문은 문장 속에서 의미를 잃는다.', sigil: '⌘',
  },
  {
    id: 'trap_ambush', name: '그림자 매복', subtitle: '공격 순간의 반전', kind: 'trap', rarity: 'rare', element: 'void', cost: 2,
    trapTrigger: 'unit_attacked', trapEffect: { kind: 'buff_unit', attack: 2, health: 2 }, target: 'none', text: '내 유닛이 공격받을 때 그 유닛에게 공격력 +2, 체력 +2.', flavor: '보이지 않는 칼은 상대가 확신한 순간 가장 가까이 있다.', sigil: '◒',
  },
  {
    id: 'trap_last_stand', name: '최후의 방벽', subtitle: '쓰러진 자의 자리', kind: 'trap', rarity: 'epic', element: 'solar', cost: 3,
    trapTrigger: 'friendly_destroyed', trapEffect: { kind: 'summon_token', attack: 3, health: 4, name: '빛의 수호자' }, target: 'none', text: '내 유닛이 파괴되면 빈 칸에 3/4 빛의 수호자를 소환.', flavor: '한 명이 쓰러지면 그 자리에 맹세가 선다.', sigil: '✥',
  },
  {
    id: 'trap_storm_prison', name: '폭풍 감옥', subtitle: '번개로 묶인 발', kind: 'trap', rarity: 'epic', element: 'storm', cost: 3,
    trapTrigger: 'direct_attack', trapEffect: { kind: 'negate_and_damage', amount: 4 }, target: 'none', text: '직접 공격을 무효로 하고 공격 유닛에 4 피해.', flavor: '하늘이 닫히면 가장 빠른 자도 한 걸음도 나아갈 수 없다.', sigil: '☇',
  },
  {
    id: 'trap_null_horizon', name: '무의 지평선', subtitle: '모든 마력이 멈추는 곳', kind: 'trap', rarity: 'legendary', element: 'void', cost: 4,
    trapTrigger: 'spell_played', trapEffect: { kind: 'negate_and_damage', amount: 3 }, target: 'none', text: '상대 주문을 무효화하고 상대 코어에 3 피해.', flavor: '지평선 너머에서는 주문도 이름도 존재하지 않는다.', sigil: '◉',
  },
  {
    id: 'trap_crystal_reversal', name: '수정 반전', subtitle: '공격을 굴절시키는 각도', kind: 'trap', rarity: 'rare', element: 'neutral', cost: 2,
    trapTrigger: 'unit_attacked', trapEffect: { kind: 'shield_unit', amount: 4 }, target: 'none', text: '내 유닛이 공격받을 때 보호막 4 부여.', flavor: '정면으로 막을 수 없다면 빛처럼 비틀면 된다.', sigil: '⬡',
  },
  {
    id: 'trap_blooming_guard', name: '개화의 수호', subtitle: '상처 위에 피는 갑옷', kind: 'trap', rarity: 'common', element: 'verdant', cost: 2,
    trapTrigger: 'friendly_destroyed', trapEffect: { kind: 'heal_core', amount: 3 }, target: 'none', text: '내 유닛이 파괴되면 내 코어를 3 회복.', flavor: '꽃은 죽음을 부정하지 않는다. 그 위에 피어날 뿐이다.', sigil: '❀',
  },
  {
    id: 'trap_solar_rebuke', name: '태양의 질책', subtitle: '소환자에게 내리는 열', kind: 'trap', rarity: 'epic', element: 'solar', cost: 3,
    trapTrigger: 'unit_summoned', trapEffect: { kind: 'damage_unit', amount: 4 }, target: 'none', text: '상대가 유닛을 소환하면 그 유닛에 4 피해.', flavor: '빛 앞에 모습을 드러낸 자는 그 대가를 치른다.', sigil: '☼',
  },

  {
    id: 'unit_rift_wanderer', name: '균열의 유랑자', subtitle: '빈 전장에 먼저 닿는 발', kind: 'unit', rarity: 'rare', element: 'void', cost: 4,
    attack: 4, health: 3, keywords: ['charge'], summonMode: 'rift', riftCost: 1,
    riftCondition: { kind: 'empty_board', label: '내 유닛 존이 비어 있을 때' }, target: 'none',
    text: '균열 소환: 내 필드가 비어 있으면 에너지 1로 특수 소환. 속공.',
    flavor: '아무도 서 있지 않은 곳에 가장 먼저 그림자가 도착한다.', sigil: '◬',
    vfx: { summon: 'rift-tear', attack: 'void-lunge', defense: 'shadow-phase', destroy: 'void-fracture' },
  },
  {
    id: 'unit_lastlight_vanguard', name: '최후광 선봉대', subtitle: '패배 직전의 역광', kind: 'unit', rarity: 'rare', element: 'solar', cost: 5,
    attack: 4, health: 6, keywords: ['guard'], summonMode: 'rift', riftCost: 1,
    riftCondition: { kind: 'core_below', value: 12, label: '내 코어가 12 이하일 때' }, target: 'none',
    text: '균열 소환: 내 코어가 12 이하이면 에너지 1로 특수 소환. 수호.',
    flavor: '빛은 가장 약해진 순간, 가장 긴 그림자를 만든다.', sigil: '✷',
    vfx: { summon: 'dawn-pillar', attack: 'solar-cross', defense: 'aegis-flare', destroy: 'ember-fall' },
  },
  {
    id: 'unit_tempest_interceptor', name: '뇌광 요격수', subtitle: '수적 열세를 가르는 섬광', kind: 'unit', rarity: 'epic', element: 'storm', cost: 5,
    attack: 5, health: 4, keywords: ['charge'], summonMode: 'rift', riftCost: 2,
    riftCondition: { kind: 'opponent_more_units', label: '상대 유닛 수가 더 많을 때' }, target: 'none',
    text: '균열 소환: 상대 유닛이 더 많으면 에너지 2로 특수 소환. 속공.',
    flavor: '열세는 그에게 후퇴 명령이 아니라 좌표다.', sigil: 'Ϟ',
    vfx: { summon: 'storm-drop', attack: 'lightning-lance', defense: 'static-shell', destroy: 'spark-disperse' },
  },
  {
    id: 'unit_gravebloom_medium', name: '묘화의 영매', subtitle: '쓰러진 이름을 꽃피우다', kind: 'unit', rarity: 'epic', element: 'verdant', cost: 5,
    attack: 3, health: 5, summonMode: 'rift', riftCost: 2,
    riftCondition: { kind: 'graveyard_min', value: 4, label: '내 묘지에 카드가 4장 이상일 때' },
    onSummon: { kind: 'summon_token', attack: 2, health: 2, name: '기억의 꽃잎' }, target: 'none',
    text: '균열 소환: 내 묘지에 카드가 4장 이상이면 에너지 2. 소환 시 2/2 기억의 꽃잎 소환.',
    flavor: '죽은 이름은 사라지지 않는다. 뿌리의 언어로 바뀔 뿐이다.', sigil: '❋',
    vfx: { summon: 'grave-bloom', attack: 'vine-whip', defense: 'root-shell', destroy: 'petal-dissolve' },
  },

  {
    id: 'fusion_eclipse_chimera', name: '일식 공명수', subtitle: '빛과 공허가 겹친 포효', kind: 'fusion', rarity: 'legendary', element: 'void', cost: 3,
    attack: 9, health: 8, keywords: ['pierce'], summonMode: 'fusion',
    fusionRecipe: { label: '태양 유닛 1장 + 공허 유닛 1장', materials: [
      { label: '태양 유닛', element: 'solar' }, { label: '공허 유닛', element: 'void' },
    ] },
    onSummon: { kind: 'aoe_enemy', amount: 2 }, target: 'none',
    text: '공명 융합. 소환 시 모든 적 유닛에 2 피해. 관통.',
    flavor: '빛과 어둠은 적이 아니었다. 서로를 완성하지 못했을 뿐이다.', sigil: '☯',
    vfx: { summon: 'eclipse-convergence', attack: 'eclipse-maw', defense: 'umbra-corona', destroy: 'eclipse-collapse' },
  },
  {
    id: 'fusion_tempest_colossus', name: '천뢰 합금거신', subtitle: '금속에 갇힌 폭풍', kind: 'fusion', rarity: 'epic', element: 'storm', cost: 2,
    attack: 7, health: 10, keywords: ['guard'], summonMode: 'fusion',
    fusionRecipe: { label: '폭풍 유닛 1장 + 중립 유닛 1장', materials: [
      { label: '폭풍 유닛', element: 'storm' }, { label: '중립 유닛', element: 'neutral' },
    ] },
    onSummon: { kind: 'shield_unit', amount: 3 }, target: 'none',
    text: '공명 융합. 소환 시 자신에게 보호막 3. 수호.',
    flavor: '번개가 갑옷을 입자 산맥조차 움직이기 시작했다.', sigil: '⚙',
    vfx: { summon: 'magnet-storm', attack: 'rail-impact', defense: 'hex-bastion', destroy: 'metal-thunder' },
  },
  {
    id: 'fusion_worldroot_hydra', name: '세계근원 히드라', subtitle: '달빛을 마시는 고대 뿌리', kind: 'fusion', rarity: 'epic', element: 'verdant', cost: 2,
    attack: 6, health: 11, keywords: ['lifesteal'], summonMode: 'fusion',
    fusionRecipe: { label: '대지 유닛 1장 + 달 유닛 1장', materials: [
      { label: '대지 유닛', element: 'verdant' }, { label: '달 유닛', element: 'lunar' },
    ] },
    onSummon: { kind: 'heal_core', amount: 4 }, target: 'none',
    text: '공명 융합. 소환 시 내 코어 4 회복. 흡수.',
    flavor: '뿌리는 땅 아래에서 달의 조수를 기억하고 있었다.', sigil: '♆',
    vfx: { summon: 'worldroot-rise', attack: 'hydra-bloom', defense: 'ancient-bark', destroy: 'forest-eclipse' },
  },

  {
    id: 'evolution_ember_phoenix', name: '홍련계승 불사조', subtitle: '작은 불씨가 얻은 두 번째 하늘', kind: 'evolution', rarity: 'epic', element: 'solar', cost: 2,
    attack: 6, health: 6, keywords: ['charge', 'lifesteal'], summonMode: 'evolution',
    evolutionRecipe: { label: '잿불의 종자 또는 비용 2 이하 태양 유닛', fromIds: ['unit_ember_squire'], element: 'solar', maxCost: 2 },
    target: 'none', text: '계승 진화. 진화 전 유닛의 강화 수치와 보호막을 이어받습니다. 속공, 흡수.',
    flavor: '불씨는 자신이 작다는 사실을 잊는 순간 날개를 얻는다.', sigil: '♨',
    vfx: { summon: 'phoenix-ascend', attack: 'phoenix-dive', defense: 'rebirth-wings', destroy: 'ash-rebirth' },
  },
  {
    id: 'evolution_iron_sovereign', name: '철성계승 군주', subtitle: '성벽이 왕좌를 선택하다', kind: 'evolution', rarity: 'epic', element: 'neutral', cost: 2,
    attack: 4, health: 12, keywords: ['guard'], summonMode: 'evolution',
    evolutionRecipe: { label: '철벽 수호병 또는 비용 2 이하 중립 유닛', fromIds: ['unit_iron_bastion'], element: 'neutral', maxCost: 2 },
    onSummon: { kind: 'shield_unit', amount: 4 }, target: 'none',
    text: '계승 진화. 강화 수치와 보호막 계승. 소환 시 보호막 4. 수호.',
    flavor: '오랫동안 지킨 자는 결국 지켜야 할 나라 그 자체가 된다.', sigil: '♜',
    vfx: { summon: 'citadel-ascend', attack: 'sovereign-hammer', defense: 'royal-rampart', destroy: 'fortress-fall' },
  },
  {
    id: 'evolution_rift_alpha', name: '균열계승 알파', subtitle: '사냥개가 경계의 주인이 되다', kind: 'evolution', rarity: 'legendary', element: 'void', cost: 3,
    attack: 8, health: 6, keywords: ['charge', 'pierce'], summonMode: 'evolution',
    evolutionRecipe: { label: '균열 사냥개 또는 비용 3 이하 공허 유닛', fromIds: ['unit_rift_hound'], element: 'void', maxCost: 3 },
    target: 'none', text: '계승 진화. 강화 수치와 보호막 계승. 속공, 관통.',
    flavor: '경계를 물어뜯던 야수는 마침내 경계가 어디인지 정하는 존재가 되었다.', sigil: '◈',
    vfx: { summon: 'alpha-mutation', attack: 'rift-rend', defense: 'phase-hide', destroy: 'alpha-shatter' },
  },

  {
    id: 'trap_resonance_break', name: '공명 붕괴진', subtitle: '완성 직전 깨지는 파동', kind: 'trap', rarity: 'epic', element: 'neutral', cost: 3,
    trapTrigger: 'fusion_summoned', trapEffect: { kind: 'damage_unit', amount: 5 }, target: 'none',
    text: '상대가 공명 융합하면 그 융합 유닛에 5 피해.',
    flavor: '둘이 하나가 되는 순간은 동시에 가장 불안정한 순간이다.', sigil: '⨯',
    vfx: { activation: 'resonance-shatter', destroy: 'prism-break' },
  },
  {
    id: 'trap_ancestral_denial', name: '계승 거부', subtitle: '과거가 미래를 붙잡는 사슬', kind: 'trap', rarity: 'rare', element: 'lunar', cost: 2,
    trapTrigger: 'evolution_summoned', trapEffect: { kind: 'damage_unit', amount: 4 }, target: 'none',
    text: '상대가 계승 진화하면 그 진화 유닛에 4 피해.',
    flavor: '모든 조상이 후계자를 축복하는 것은 아니다.', sigil: '☒',
    vfx: { activation: 'ancestral-chain', destroy: 'moon-shatter' },
  },

  // === ECLIPSE DUEL v8: 268-card expansion ===
  { id: 'unit_v8_solar_01', name: '새벽의 성검기사', subtitle: '전장을 가르는 서약', kind: 'unit', rarity: 'common', element: 'solar', cost: 2, attack: 2, health: 4, keywords: ['guard'], onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '소환 시 상대 코어에 1 피해. 수호', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '여명 성기사단' },
  { id: 'unit_v8_solar_02', name: '침묵의 광휘사자', subtitle: '두 세계를 잇는 잔광', kind: 'unit', rarity: 'common', element: 'solar', cost: 3, attack: 3, health: 5, keywords: ['charge'], onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다. 속공', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '수정 자동기' },
  { id: 'unit_v8_solar_03', name: '망각의 홍염창병', subtitle: '끝나지 않는 행군', kind: 'unit', rarity: 'rare', element: 'solar', cost: 3, attack: 5, health: 4, keywords: ['lifesteal'], onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복. 흡수', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '일식 공명단' },
  { id: 'unit_v8_solar_04', name: '서약의 성광사냥꾼', subtitle: '숨겨진 별의 맹세', kind: 'unit', rarity: 'common', element: 'solar', cost: 3, attack: 2, health: 4, keywords: ['pierce'], onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '소환 시 상대 코어에 1 피해. 관통', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '여명 성기사단' },
  { id: 'unit_v8_solar_05', name: '유리빛 태양매', subtitle: '폭풍 앞의 침묵', kind: 'unit', rarity: 'rare', element: 'solar', cost: 3, attack: 4, health: 6, onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다.', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '수정 자동기' },
  { id: 'unit_v8_solar_06', name: '붉은달의 백금세라프', subtitle: '무너진 왕국의 기억', kind: 'unit', rarity: 'epic', element: 'solar', cost: 6, attack: 7, health: 6, summonMode: 'rift', riftCost: 4, riftCondition: { kind: 'empty_board', label: '내 필드에 유닛이 없을 때' }, onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 4. 소환 시 이번 턴 에너지 1 회복.', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '일식 공명단' },
  { id: 'unit_v8_solar_07', name: '심장부의 화염용', subtitle: '다시 타오르는 심장', kind: 'unit', rarity: 'common', element: 'solar', cost: 2, attack: 2, health: 4, keywords: ['guard'], onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '소환 시 상대 코어에 1 피해. 수호', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '여명 성기사단' },
  { id: 'unit_v8_solar_08', name: '황혼의 태양골렘', subtitle: '경계를 지키는 눈', kind: 'unit', rarity: 'rare', element: 'solar', cost: 4, attack: 4, health: 6, keywords: ['charge'], onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다. 속공', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '수정 자동기' },
  { id: 'unit_v8_solar_09', name: '고대의 여명수호자', subtitle: '별빛 아래의 결투', kind: 'unit', rarity: 'legendary', element: 'solar', cost: 7, attack: 9, health: 8, keywords: ['lifesteal'], summonMode: 'rift', riftCost: 5, riftCondition: { kind: 'graveyard_min', value: 4, label: '내 묘지에 카드가 4장 이상일 때' }, onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 5. 소환 시 이번 턴 에너지 1 회복. 흡수', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '일식 공명단' },
  { id: 'unit_v8_solar_10', name: '불멸의 불꽃무희', subtitle: '파멸을 거스르는 의지', kind: 'unit', rarity: 'common', element: 'solar', cost: 3, attack: 2, health: 4, keywords: ['pierce'], onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '소환 시 상대 코어에 1 피해. 관통', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '여명 성기사단' },
  { id: 'unit_v8_solar_11', name: '붕괴의 광륜마도사', subtitle: '전설이 시작된 밤', kind: 'unit', rarity: 'rare', element: 'solar', cost: 3, attack: 4, health: 6, onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다.', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '수정 자동기' },
  { id: 'unit_v8_solar_12', name: '검은별의 성창대장', subtitle: '최후까지 남은 수호', kind: 'unit', rarity: 'common', element: 'solar', cost: 3, attack: 4, health: 3, onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복.', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '일식 공명단' },
  { id: 'unit_v8_solar_13', name: '백은의 홍련늑대', subtitle: '잊힌 시대의 파편', kind: 'unit', rarity: 'common', element: 'solar', cost: 2, attack: 2, health: 4, keywords: ['guard'], summonMode: 'rift', riftCost: 1, riftCondition: { kind: 'opponent_more_units', label: '상대 필드의 유닛이 더 많을 때' }, onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 1. 소환 시 상대 코어에 1 피해. 수호', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '여명 성기사단' },
  { id: 'unit_v8_solar_14', name: '경계의 성화사제', subtitle: '균열 너머의 메아리', kind: 'unit', rarity: 'epic', element: 'solar', cost: 6, attack: 6, health: 8, keywords: ['charge'], onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다. 속공', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '수정 자동기' },
  { id: 'unit_v8_solar_15', name: '찬란한 태양거인', subtitle: '빛과 그림자의 약속', kind: 'unit', rarity: 'common', element: 'solar', cost: 2, attack: 4, health: 3, keywords: ['lifesteal'], onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복. 흡수', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '일식 공명단' },
  { id: 'unit_v8_solar_16', name: '유성의 빛의기수', subtitle: '전장을 가르는 서약', kind: 'unit', rarity: 'rare', element: 'solar', cost: 4, attack: 3, health: 5, keywords: ['pierce'], onSummon: { kind: 'damage_core', amount: 2 }, target: 'none', text: '소환 시 상대 코어에 2 피해. 관통', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '여명 성기사단' },
  { id: 'unit_v8_solar_17', name: '심연의 재탄생기사', subtitle: '두 세계를 잇는 잔광', kind: 'unit', rarity: 'epic', element: 'solar', cost: 5, attack: 6, health: 8, onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다.', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '수정 자동기' },
  { id: 'unit_v8_solar_18', name: '왕실의 일광포병', subtitle: '끝나지 않는 행군', kind: 'unit', rarity: 'common', element: 'solar', cost: 3, attack: 4, health: 3, onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복.', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '일식 공명단' },
  { id: 'unit_v8_solar_19', name: '푸른별의 화관수호수', subtitle: '숨겨진 별의 맹세', kind: 'unit', rarity: 'rare', element: 'solar', cost: 3, attack: 3, health: 5, keywords: ['guard'], onSummon: { kind: 'damage_core', amount: 2 }, target: 'none', text: '소환 시 상대 코어에 2 피해. 수호', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '여명 성기사단' },
  { id: 'unit_v8_solar_20', name: '천공의 성역집행관', subtitle: '폭풍 앞의 침묵', kind: 'unit', rarity: 'common', element: 'solar', cost: 3, attack: 3, health: 5, keywords: ['charge'], summonMode: 'rift', riftCost: 1, riftCondition: { kind: 'ally_element', element: 'solar', label: '내 필드에 태양 속성 유닛이 있을 때' }, onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 1. 소환 시 카드 1장을 뽑습니다. 속공', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '수정 자동기' },
  { id: 'unit_v8_lunar_01', name: '황혼의 은월검사', subtitle: '끝나지 않는 행군', kind: 'unit', rarity: 'common', element: 'lunar', cost: 2, attack: 2, health: 4, keywords: ['charge'], onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복. 속공', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '월영 몽환단' },
  { id: 'unit_v8_lunar_02', name: '고대의 몽환사제', subtitle: '숨겨진 별의 맹세', kind: 'unit', rarity: 'rare', element: 'lunar', cost: 4, attack: 4, health: 6, keywords: ['lifesteal'], onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 2. 흡수', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '세계수 생명군' },
  { id: 'unit_v8_lunar_03', name: '불멸의 월광여우', subtitle: '폭풍 앞의 침묵', kind: 'unit', rarity: 'epic', element: 'lunar', cost: 5, attack: 7, health: 6, keywords: ['pierce'], target: 'none', text: '관통', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '월영 몽환단' },
  { id: 'unit_v8_lunar_04', name: '붕괴의 수면마도사', subtitle: '무너진 왕국의 기억', kind: 'unit', rarity: 'common', element: 'lunar', cost: 3, attack: 2, health: 4, onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복.', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '세계수 생명군' },
  { id: 'unit_v8_lunar_05', name: '검은별의 초승궁수', subtitle: '다시 타오르는 심장', kind: 'unit', rarity: 'rare', element: 'lunar', cost: 3, attack: 4, health: 6, onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 2.', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '월영 몽환단' },
  { id: 'unit_v8_lunar_06', name: '백은의 거울기사', subtitle: '경계를 지키는 눈', kind: 'unit', rarity: 'legendary', element: 'lunar', cost: 8, attack: 9, health: 8, keywords: ['guard'], summonMode: 'rift', riftCost: 6, riftCondition: { kind: 'core_below', value: 12, label: '내 코어가 12 이하일 때' }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 6. 수호', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '세계수 생명군' },
  { id: 'unit_v8_lunar_07', name: '경계의 백야나비', subtitle: '별빛 아래의 결투', kind: 'unit', rarity: 'common', element: 'lunar', cost: 2, attack: 2, health: 4, keywords: ['charge'], onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복. 속공', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '월영 몽환단' },
  { id: 'unit_v8_lunar_08', name: '찬란한 월식사냥꾼', subtitle: '파멸을 거스르는 의지', kind: 'unit', rarity: 'rare', element: 'lunar', cost: 4, attack: 4, health: 6, keywords: ['lifesteal'], onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 2. 흡수', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '세계수 생명군' },
  { id: 'unit_v8_lunar_09', name: '유성의 별잠수호자', subtitle: '전설이 시작된 밤', kind: 'unit', rarity: 'common', element: 'lunar', cost: 2, attack: 4, health: 3, keywords: ['pierce'], target: 'none', text: '관통', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '월영 몽환단' },
  { id: 'unit_v8_lunar_10', name: '심연의 달빛치유사', subtitle: '최후까지 남은 수호', kind: 'unit', rarity: 'common', element: 'lunar', cost: 3, attack: 2, health: 4, onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복.', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '세계수 생명군' },
  { id: 'unit_v8_lunar_11', name: '왕실의 은하술사', subtitle: '잊힌 시대의 파편', kind: 'unit', rarity: 'epic', element: 'lunar', cost: 5, attack: 6, health: 8, onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 2.', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '월영 몽환단' },
  { id: 'unit_v8_lunar_12', name: '푸른별의 몽중무희', subtitle: '균열 너머의 메아리', kind: 'unit', rarity: 'common', element: 'lunar', cost: 3, attack: 4, health: 3, keywords: ['guard'], target: 'none', text: '수호', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '세계수 생명군' },
  { id: 'unit_v8_lunar_13', name: '천공의 서리늑대', subtitle: '빛과 그림자의 약속', kind: 'unit', rarity: 'rare', element: 'lunar', cost: 3, attack: 3, health: 5, keywords: ['charge'], summonMode: 'rift', riftCost: 1, riftCondition: { kind: 'graveyard_min', value: 4, label: '내 묘지에 카드가 4장 이상일 때' }, onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 1. 소환 시 코어를 2 회복. 속공', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '월영 몽환단' },
  { id: 'unit_v8_lunar_14', name: '새벽의 월궁수호자', subtitle: '전장을 가르는 서약', kind: 'unit', rarity: 'epic', element: 'lunar', cost: 6, attack: 6, health: 8, keywords: ['lifesteal'], onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 2. 흡수', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '세계수 생명군' },
  { id: 'unit_v8_lunar_15', name: '침묵의 야광용', subtitle: '두 세계를 잇는 잔광', kind: 'unit', rarity: 'common', element: 'lunar', cost: 2, attack: 4, health: 3, keywords: ['pierce'], target: 'none', text: '관통', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '월영 몽환단' },
  { id: 'unit_v8_lunar_16', name: '망각의 달의재판관', subtitle: '끝나지 않는 행군', kind: 'unit', rarity: 'rare', element: 'lunar', cost: 4, attack: 3, health: 5, onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복.', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '세계수 생명군' },
  { id: 'unit_v8_lunar_17', name: '서약의 미라지기수', subtitle: '숨겨진 별의 맹세', kind: 'unit', rarity: 'common', element: 'lunar', cost: 2, attack: 3, health: 5, onSummon: { kind: 'shield_unit', amount: 1 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 1.', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '월영 몽환단' },
  { id: 'unit_v8_lunar_18', name: '유리빛 월해정령', subtitle: '폭풍 앞의 침묵', kind: 'unit', rarity: 'common', element: 'lunar', cost: 3, attack: 4, health: 3, keywords: ['guard'], target: 'none', text: '수호', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '세계수 생명군' },
  { id: 'unit_v8_lunar_19', name: '붉은달의 은월거인', subtitle: '무너진 왕국의 기억', kind: 'unit', rarity: 'epic', element: 'lunar', cost: 5, attack: 5, health: 7, keywords: ['charge'], onSummon: { kind: 'heal_core', amount: 4 }, target: 'none', text: '소환 시 코어를 4 회복. 속공', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '월영 몽환단' },
  { id: 'unit_v8_lunar_20', name: '심장부의 꿈의기록자', subtitle: '다시 타오르는 심장', kind: 'unit', rarity: 'common', element: 'lunar', cost: 3, attack: 3, health: 5, keywords: ['lifesteal'], summonMode: 'rift', riftCost: 1, riftCondition: { kind: 'empty_board', label: '내 필드에 유닛이 없을 때' }, onSummon: { kind: 'shield_unit', amount: 1 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 1. 소환 시 아군 유닛 하나에게 보호막 1. 흡수', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '☾', series: '세계수 생명군' },
  { id: 'unit_v8_storm_01', name: '찬란한 뇌광기병', subtitle: '폭풍 앞의 침묵', kind: 'unit', rarity: 'common', element: 'storm', cost: 2, attack: 2, health: 4, keywords: ['lifesteal'], onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다. 흡수', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '천뢰 기동군' },
  { id: 'unit_v8_storm_02', name: '유성의 천둥사냥꾼', subtitle: '무너진 왕국의 기억', kind: 'unit', rarity: 'rare', element: 'storm', cost: 4, attack: 4, health: 6, keywords: ['pierce'], onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복. 관통', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '심연 포식군' },
  { id: 'unit_v8_storm_03', name: '심연의 폭풍매', subtitle: '다시 타오르는 심장', kind: 'unit', rarity: 'legendary', element: 'storm', cost: 7, attack: 9, health: 8, keywords: ['lifesteal'], summonMode: 'rift', riftCost: 5, riftCondition: { kind: 'ally_element', element: 'storm', label: '내 필드에 폭풍 속성 유닛이 있을 때' }, onSummon: { kind: 'damage_core', amount: 2 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 5. 소환 시 상대 코어에 2 피해. 흡수', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '원초의 수호령' },
  { id: 'unit_v8_storm_04', name: '왕실의 전격검사', subtitle: '경계를 지키는 눈', kind: 'unit', rarity: 'common', element: 'storm', cost: 3, attack: 2, health: 4, onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다.', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '천뢰 기동군' },
  { id: 'unit_v8_storm_05', name: '푸른별의 번개용', subtitle: '별빛 아래의 결투', kind: 'unit', rarity: 'rare', element: 'storm', cost: 3, attack: 4, health: 6, keywords: ['guard'], onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복. 수호', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '심연 포식군' },
  { id: 'unit_v8_storm_06', name: '천공의 뇌운술사', subtitle: '파멸을 거스르는 의지', kind: 'unit', rarity: 'common', element: 'storm', cost: 3, attack: 4, health: 3, keywords: ['charge'], summonMode: 'rift', riftCost: 1, riftCondition: { kind: 'opponent_more_units', label: '상대 필드의 유닛이 더 많을 때' }, onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 1. 소환 시 상대 코어에 1 피해. 속공', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '원초의 수호령' },
  { id: 'unit_v8_storm_07', name: '새벽의 폭풍거인', subtitle: '전설이 시작된 밤', kind: 'unit', rarity: 'common', element: 'storm', cost: 2, attack: 2, health: 4, keywords: ['lifesteal'], onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다. 흡수', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '천뢰 기동군' },
  { id: 'unit_v8_storm_08', name: '침묵의 청뢰기사', subtitle: '최후까지 남은 수호', kind: 'unit', rarity: 'epic', element: 'storm', cost: 6, attack: 6, health: 8, keywords: ['pierce'], onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복. 관통', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '심연 포식군' },
  { id: 'unit_v8_storm_09', name: '망각의 전류포병', subtitle: '잊힌 시대의 파편', kind: 'unit', rarity: 'common', element: 'storm', cost: 2, attack: 4, health: 3, onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '소환 시 상대 코어에 1 피해.', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '원초의 수호령' },
  { id: 'unit_v8_storm_10', name: '서약의 질풍무희', subtitle: '균열 너머의 메아리', kind: 'unit', rarity: 'rare', element: 'storm', cost: 4, attack: 3, health: 5, onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다.', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '천뢰 기동군' },
  { id: 'unit_v8_storm_11', name: '유리빛 벼락늑대', subtitle: '빛과 그림자의 약속', kind: 'unit', rarity: 'epic', element: 'storm', cost: 5, attack: 6, health: 8, keywords: ['guard'], onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복. 수호', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '심연 포식군' },
  { id: 'unit_v8_storm_12', name: '붉은달의 천공집행관', subtitle: '전장을 가르는 서약', kind: 'unit', rarity: 'common', element: 'storm', cost: 3, attack: 4, health: 3, keywords: ['charge'], onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '소환 시 상대 코어에 1 피해. 속공', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '원초의 수호령' },
  { id: 'unit_v8_storm_13', name: '심장부의 기류정찰병', subtitle: '두 세계를 잇는 잔광', kind: 'unit', rarity: 'rare', element: 'storm', cost: 3, attack: 3, health: 5, keywords: ['lifesteal'], summonMode: 'rift', riftCost: 1, riftCondition: { kind: 'ally_element', element: 'storm', label: '내 필드에 폭풍 속성 유닛이 있을 때' }, onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 1. 소환 시 카드 1장을 뽑습니다. 흡수', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '천뢰 기동군' },
  { id: 'unit_v8_storm_14', name: '황혼의 전하수호자', subtitle: '끝나지 않는 행군', kind: 'unit', rarity: 'common', element: 'storm', cost: 3, attack: 3, health: 5, keywords: ['pierce'], onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복. 관통', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '심연 포식군' },
  { id: 'unit_v8_storm_15', name: '고대의 폭뢰대장', subtitle: '숨겨진 별의 맹세', kind: 'unit', rarity: 'common', element: 'storm', cost: 2, attack: 4, health: 3, onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '소환 시 상대 코어에 1 피해.', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '원초의 수호령' },
  { id: 'unit_v8_storm_16', name: '불멸의 번개정령', subtitle: '폭풍 앞의 침묵', kind: 'unit', rarity: 'epic', element: 'storm', cost: 6, attack: 5, health: 7, onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다.', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '천뢰 기동군' },
  { id: 'unit_v8_storm_17', name: '붕괴의 질풍궁수', subtitle: '무너진 왕국의 기억', kind: 'unit', rarity: 'common', element: 'storm', cost: 2, attack: 3, health: 5, keywords: ['guard'], onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복. 수호', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '심연 포식군' },
  { id: 'unit_v8_storm_18', name: '검은별의 낙뢰골렘', subtitle: '다시 타오르는 심장', kind: 'unit', rarity: 'rare', element: 'storm', cost: 4, attack: 5, health: 4, keywords: ['charge'], onSummon: { kind: 'damage_core', amount: 2 }, target: 'none', text: '소환 시 상대 코어에 2 피해. 속공', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '원초의 수호령' },
  { id: 'unit_v8_storm_19', name: '백은의 전광기수', subtitle: '경계를 지키는 눈', kind: 'unit', rarity: 'epic', element: 'storm', cost: 5, attack: 5, health: 7, keywords: ['lifesteal'], onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다. 흡수', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '천뢰 기동군' },
  { id: 'unit_v8_storm_20', name: '경계의 천뢰군주', subtitle: '별빛 아래의 결투', kind: 'unit', rarity: 'common', element: 'storm', cost: 3, attack: 3, health: 5, keywords: ['pierce'], summonMode: 'rift', riftCost: 1, riftCondition: { kind: 'core_below', value: 12, label: '내 코어가 12 이하일 때' }, onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 1. 소환 시 이번 턴 에너지 1 회복. 관통', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: 'ϟ', series: '심연 포식군' },
  { id: 'unit_v8_verdant_01', name: '침묵의 수림기사', subtitle: '다시 타오르는 심장', kind: 'unit', rarity: 'common', element: 'verdant', cost: 2, attack: 2, health: 4, keywords: ['pierce'], onSummon: { kind: 'shield_unit', amount: 1 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 1. 관통', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '세계수 생명군' },
  { id: 'unit_v8_verdant_02', name: '망각의 고목현자', subtitle: '경계를 지키는 눈', kind: 'unit', rarity: 'rare', element: 'verdant', cost: 4, attack: 4, health: 6, target: 'none', text: '안정적인 전투 능력으로 전선을 유지합니다.', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '원초의 수호령' },
  { id: 'unit_v8_verdant_03', name: '서약의 꽃잎무희', subtitle: '별빛 아래의 결투', kind: 'unit', rarity: 'common', element: 'verdant', cost: 2, attack: 4, health: 3, onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복.', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '세계수 생명군' },
  { id: 'unit_v8_verdant_04', name: '유리빛 덩굴사냥꾼', subtitle: '파멸을 거스르는 의지', kind: 'unit', rarity: 'common', element: 'verdant', cost: 3, attack: 2, health: 4, keywords: ['guard'], onSummon: { kind: 'shield_unit', amount: 1 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 1. 수호', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '원초의 수호령' },
  { id: 'unit_v8_verdant_05', name: '붉은달의 세계수사제', subtitle: '전설이 시작된 밤', kind: 'unit', rarity: 'epic', element: 'verdant', cost: 5, attack: 6, health: 8, keywords: ['charge'], target: 'none', text: '속공', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '세계수 생명군' },
  { id: 'unit_v8_verdant_06', name: '심장부의 이끼골렘', subtitle: '최후까지 남은 수호', kind: 'unit', rarity: 'common', element: 'verdant', cost: 3, attack: 4, health: 3, keywords: ['lifesteal'], summonMode: 'rift', riftCost: 1, riftCondition: { kind: 'graveyard_min', value: 4, label: '내 묘지에 카드가 4장 이상일 때' }, onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 1. 소환 시 코어를 2 회복. 흡수', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '원초의 수호령' },
  { id: 'unit_v8_verdant_07', name: '황혼의 녹엽궁수', subtitle: '잊힌 시대의 파편', kind: 'unit', rarity: 'rare', element: 'verdant', cost: 3, attack: 3, health: 5, keywords: ['pierce'], onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 2. 관통', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '세계수 생명군' },
  { id: 'unit_v8_verdant_08', name: '고대의 수호사슴', subtitle: '균열 너머의 메아리', kind: 'unit', rarity: 'epic', element: 'verdant', cost: 6, attack: 6, health: 8, target: 'none', text: '안정적인 전투 능력으로 전선을 유지합니다.', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '원초의 수호령' },
  { id: 'unit_v8_verdant_09', name: '불멸의 꽃가루마도사', subtitle: '빛과 그림자의 약속', kind: 'unit', rarity: 'common', element: 'verdant', cost: 2, attack: 4, health: 3, onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복.', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '세계수 생명군' },
  { id: 'unit_v8_verdant_10', name: '붕괴의 뿌리거인', subtitle: '전장을 가르는 서약', kind: 'unit', rarity: 'rare', element: 'verdant', cost: 4, attack: 3, health: 5, keywords: ['guard'], onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 2. 수호', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '원초의 수호령' },
  { id: 'unit_v8_verdant_11', name: '검은별의 숲의기수', subtitle: '두 세계를 잇는 잔광', kind: 'unit', rarity: 'common', element: 'verdant', cost: 2, attack: 3, health: 5, keywords: ['charge'], target: 'none', text: '속공', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '세계수 생명군' },
  { id: 'unit_v8_verdant_12', name: '백은의 생명용', subtitle: '끝나지 않는 행군', kind: 'unit', rarity: 'common', element: 'verdant', cost: 3, attack: 4, health: 3, keywords: ['lifesteal'], onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복. 흡수', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '원초의 수호령' },
  { id: 'unit_v8_verdant_13', name: '경계의 초록늑대', subtitle: '숨겨진 별의 맹세', kind: 'unit', rarity: 'epic', element: 'verdant', cost: 5, attack: 5, health: 7, keywords: ['pierce'], summonMode: 'rift', riftCost: 3, riftCondition: { kind: 'empty_board', label: '내 필드에 유닛이 없을 때' }, onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 3. 소환 시 아군 유닛 하나에게 보호막 2. 관통', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '세계수 생명군' },
  { id: 'unit_v8_verdant_14', name: '찬란한 고목파수꾼', subtitle: '폭풍 앞의 침묵', kind: 'unit', rarity: 'common', element: 'verdant', cost: 3, attack: 3, health: 5, target: 'none', text: '안정적인 전투 능력으로 전선을 유지합니다.', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '원초의 수호령' },
  { id: 'unit_v8_verdant_15', name: '유성의 숲빛치유사', subtitle: '무너진 왕국의 기억', kind: 'unit', rarity: 'rare', element: 'verdant', cost: 3, attack: 5, health: 4, onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복.', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '세계수 생명군' },
  { id: 'unit_v8_verdant_16', name: '심연의 새싹전사', subtitle: '다시 타오르는 심장', kind: 'unit', rarity: 'epic', element: 'verdant', cost: 6, attack: 5, health: 7, keywords: ['guard'], onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 2. 수호', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '원초의 수호령' },
  { id: 'unit_v8_verdant_17', name: '왕실의 수액정령', subtitle: '경계를 지키는 눈', kind: 'unit', rarity: 'common', element: 'verdant', cost: 2, attack: 3, health: 5, keywords: ['charge'], target: 'none', text: '속공', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '세계수 생명군' },
  { id: 'unit_v8_verdant_18', name: '푸른별의 산림집행관', subtitle: '별빛 아래의 결투', kind: 'unit', rarity: 'rare', element: 'verdant', cost: 4, attack: 5, health: 4, keywords: ['lifesteal'], onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복. 흡수', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '원초의 수호령' },
  { id: 'unit_v8_verdant_19', name: '천공의 비취수호자', subtitle: '파멸을 거스르는 의지', kind: 'unit', rarity: 'legendary', element: 'verdant', cost: 7, attack: 7, health: 9, keywords: ['pierce'], summonMode: 'rift', riftCost: 5, riftCondition: { kind: 'core_below', value: 12, label: '내 코어가 12 이하일 때' }, onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 5. 소환 시 아군 유닛 하나에게 보호막 2. 관통', flavor: '세계수 생명군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '세계수 생명군' },
  { id: 'unit_v8_verdant_20', name: '새벽의 원시군주', subtitle: '전설이 시작된 밤', kind: 'unit', rarity: 'common', element: 'verdant', cost: 3, attack: 3, health: 5, summonMode: 'rift', riftCost: 1, riftCondition: { kind: 'opponent_more_units', label: '상대 필드의 유닛이 더 많을 때' }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 1.', flavor: '원초의 수호령의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '❈', series: '원초의 수호령' },
  { id: 'unit_v8_void_01', name: '고대의 균열사냥꾼', subtitle: '별빛 아래의 결투', kind: 'unit', rarity: 'common', element: 'void', cost: 2, attack: 2, health: 4, onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복.', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '월영 몽환단' },
  { id: 'unit_v8_void_02', name: '불멸의 심연검사', subtitle: '파멸을 거스르는 의지', kind: 'unit', rarity: 'epic', element: 'void', cost: 6, attack: 6, health: 8, onSummon: { kind: 'damage_core', amount: 2 }, target: 'none', text: '소환 시 상대 코어에 2 피해.', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '심연 포식군' },
  { id: 'unit_v8_void_03', name: '붕괴의 공허용', subtitle: '전설이 시작된 밤', kind: 'unit', rarity: 'common', element: 'void', cost: 2, attack: 4, health: 3, keywords: ['guard'], onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다. 수호', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '일식 공명단' },
  { id: 'unit_v8_void_04', name: '검은별의 그림자사제', subtitle: '최후까지 남은 수호', kind: 'unit', rarity: 'rare', element: 'void', cost: 4, attack: 3, health: 5, keywords: ['charge'], onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복. 속공', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '월영 몽환단' },
  { id: 'unit_v8_void_05', name: '백은의 식성포식자', subtitle: '잊힌 시대의 파편', kind: 'unit', rarity: 'epic', element: 'void', cost: 5, attack: 6, health: 8, keywords: ['lifesteal'], onSummon: { kind: 'damage_core', amount: 2 }, target: 'none', text: '소환 시 상대 코어에 2 피해. 흡수', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '심연 포식군' },
  { id: 'unit_v8_void_06', name: '경계의 균열늑대', subtitle: '균열 너머의 메아리', kind: 'unit', rarity: 'common', element: 'void', cost: 3, attack: 4, health: 3, keywords: ['pierce'], summonMode: 'rift', riftCost: 1, riftCondition: { kind: 'ally_element', element: 'void', label: '내 필드에 공허 속성 유닛이 있을 때' }, onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 1. 소환 시 카드 1장을 뽑습니다. 관통', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '일식 공명단' },
  { id: 'unit_v8_void_07', name: '찬란한 무명기사', subtitle: '빛과 그림자의 약속', kind: 'unit', rarity: 'rare', element: 'void', cost: 3, attack: 3, health: 5, onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복.', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '월영 몽환단' },
  { id: 'unit_v8_void_08', name: '유성의 흑성마도사', subtitle: '전장을 가르는 서약', kind: 'unit', rarity: 'common', element: 'void', cost: 3, attack: 3, health: 5, onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '소환 시 상대 코어에 1 피해.', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '심연 포식군' },
  { id: 'unit_v8_void_09', name: '심연의 심연거인', subtitle: '두 세계를 잇는 잔광', kind: 'unit', rarity: 'common', element: 'void', cost: 2, attack: 4, health: 3, keywords: ['guard'], onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다. 수호', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '일식 공명단' },
  { id: 'unit_v8_void_10', name: '왕실의 그림자궁수', subtitle: '끝나지 않는 행군', kind: 'unit', rarity: 'epic', element: 'void', cost: 6, attack: 5, health: 7, keywords: ['charge'], onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복. 속공', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '월영 몽환단' },
  { id: 'unit_v8_void_11', name: '푸른별의 소멸기수', subtitle: '숨겨진 별의 맹세', kind: 'unit', rarity: 'common', element: 'void', cost: 2, attack: 3, health: 5, keywords: ['lifesteal'], onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '소환 시 상대 코어에 1 피해. 흡수', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '심연 포식군' },
  { id: 'unit_v8_void_12', name: '천공의 공허수확자', subtitle: '폭풍 앞의 침묵', kind: 'unit', rarity: 'rare', element: 'void', cost: 4, attack: 5, health: 4, keywords: ['pierce'], onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다. 관통', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '일식 공명단' },
  { id: 'unit_v8_void_13', name: '새벽의 검은세라프', subtitle: '무너진 왕국의 기억', kind: 'unit', rarity: 'epic', element: 'void', cost: 5, attack: 5, health: 7, summonMode: 'rift', riftCost: 3, riftCondition: { kind: 'core_below', value: 12, label: '내 코어가 12 이하일 때' }, onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 3. 소환 시 이번 턴 에너지 1 회복.', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '월영 몽환단' },
  { id: 'unit_v8_void_14', name: '침묵의 차원포병', subtitle: '다시 타오르는 심장', kind: 'unit', rarity: 'common', element: 'void', cost: 3, attack: 3, health: 5, onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '소환 시 상대 코어에 1 피해.', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '심연 포식군' },
  { id: 'unit_v8_void_15', name: '망각의 무저갱수호자', subtitle: '경계를 지키는 눈', kind: 'unit', rarity: 'rare', element: 'void', cost: 3, attack: 5, health: 4, keywords: ['guard'], onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다. 수호', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '일식 공명단' },
  { id: 'unit_v8_void_16', name: '서약의 밤의집행관', subtitle: '별빛 아래의 결투', kind: 'unit', rarity: 'legendary', element: 'void', cost: 8, attack: 7, health: 9, keywords: ['charge'], onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복. 속공', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '월영 몽환단' },
  { id: 'unit_v8_void_17', name: '유리빛 균열정령', subtitle: '파멸을 거스르는 의지', kind: 'unit', rarity: 'common', element: 'void', cost: 2, attack: 3, health: 5, keywords: ['lifesteal'], onSummon: { kind: 'damage_core', amount: 1 }, target: 'none', text: '소환 시 상대 코어에 1 피해. 흡수', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '심연 포식군' },
  { id: 'unit_v8_void_18', name: '붉은달의 흑월무희', subtitle: '전설이 시작된 밤', kind: 'unit', rarity: 'rare', element: 'void', cost: 4, attack: 5, health: 4, keywords: ['pierce'], onSummon: { kind: 'draw', amount: 1 }, target: 'none', text: '소환 시 카드 1장을 뽑습니다. 관통', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '일식 공명단' },
  { id: 'unit_v8_void_19', name: '심장부의 공허군주', subtitle: '최후까지 남은 수호', kind: 'unit', rarity: 'common', element: 'void', cost: 2, attack: 2, health: 4, onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '소환 시 이번 턴 에너지 1 회복.', flavor: '월영 몽환단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '월영 몽환단' },
  { id: 'unit_v8_void_20', name: '황혼의 경계파괴자', subtitle: '잊힌 시대의 파편', kind: 'unit', rarity: 'rare', element: 'void', cost: 4, attack: 4, health: 6, summonMode: 'rift', riftCost: 2, riftCondition: { kind: 'graveyard_min', value: 4, label: '내 묘지에 카드가 4장 이상일 때' }, onSummon: { kind: 'damage_core', amount: 2 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 2. 소환 시 상대 코어에 2 피해.', flavor: '심연 포식군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◈', series: '심연 포식군' },
  { id: 'unit_v8_neutral_01', name: '유성의 성철기사', subtitle: '전설이 시작된 밤', kind: 'unit', rarity: 'rare', element: 'neutral', cost: 3, attack: 3, health: 5, target: 'none', text: '안정적인 전투 능력으로 전선을 유지합니다.', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '여명 성기사단' },
  { id: 'unit_v8_neutral_02', name: '심연의 수정파수꾼', subtitle: '최후까지 남은 수호', kind: 'unit', rarity: 'epic', element: 'neutral', cost: 6, attack: 6, health: 8, keywords: ['guard'], onSummon: { kind: 'heal_core', amount: 4 }, target: 'none', text: '소환 시 코어를 4 회복. 수호', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '천뢰 기동군' },
  { id: 'unit_v8_neutral_03', name: '왕실의 기계궁수', subtitle: '잊힌 시대의 파편', kind: 'unit', rarity: 'common', element: 'neutral', cost: 2, attack: 4, health: 3, keywords: ['charge'], onSummon: { kind: 'shield_unit', amount: 1 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 1. 속공', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '수정 자동기' },
  { id: 'unit_v8_neutral_04', name: '푸른별의 합금골렘', subtitle: '균열 너머의 메아리', kind: 'unit', rarity: 'rare', element: 'neutral', cost: 4, attack: 3, health: 5, keywords: ['lifesteal'], target: 'none', text: '흡수', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '여명 성기사단' },
  { id: 'unit_v8_neutral_05', name: '천공의 프리즘술사', subtitle: '빛과 그림자의 약속', kind: 'unit', rarity: 'common', element: 'neutral', cost: 2, attack: 3, health: 5, keywords: ['pierce'], onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복. 관통', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '천뢰 기동군' },
  { id: 'unit_v8_neutral_06', name: '새벽의 백금수호자', subtitle: '전장을 가르는 서약', kind: 'unit', rarity: 'common', element: 'neutral', cost: 3, attack: 4, health: 3, summonMode: 'rift', riftCost: 1, riftCondition: { kind: 'empty_board', label: '내 필드에 유닛이 없을 때' }, onSummon: { kind: 'shield_unit', amount: 1 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 1. 소환 시 아군 유닛 하나에게 보호막 1.', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '수정 자동기' },
  { id: 'unit_v8_neutral_07', name: '침묵의 기어기병', subtitle: '두 세계를 잇는 잔광', kind: 'unit', rarity: 'epic', element: 'neutral', cost: 5, attack: 5, health: 7, target: 'none', text: '안정적인 전투 능력으로 전선을 유지합니다.', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '여명 성기사단' },
  { id: 'unit_v8_neutral_08', name: '망각의 수정용', subtitle: '끝나지 않는 행군', kind: 'unit', rarity: 'common', element: 'neutral', cost: 3, attack: 3, health: 5, keywords: ['guard'], onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복. 수호', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '천뢰 기동군' },
  { id: 'unit_v8_neutral_09', name: '서약의 시계장치사제', subtitle: '숨겨진 별의 맹세', kind: 'unit', rarity: 'rare', element: 'neutral', cost: 3, attack: 5, health: 4, keywords: ['charge'], onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 2. 속공', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '수정 자동기' },
  { id: 'unit_v8_neutral_10', name: '유리빛 철갑거인', subtitle: '폭풍 앞의 침묵', kind: 'unit', rarity: 'epic', element: 'neutral', cost: 6, attack: 5, health: 7, keywords: ['lifesteal'], target: 'none', text: '흡수', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '여명 성기사단' },
  { id: 'unit_v8_neutral_11', name: '붉은달의 기계늑대', subtitle: '무너진 왕국의 기억', kind: 'unit', rarity: 'common', element: 'neutral', cost: 2, attack: 3, health: 5, keywords: ['pierce'], onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복. 관통', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '천뢰 기동군' },
  { id: 'unit_v8_neutral_12', name: '심장부의 프리즘무희', subtitle: '다시 타오르는 심장', kind: 'unit', rarity: 'rare', element: 'neutral', cost: 4, attack: 5, health: 4, onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 2.', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '수정 자동기' },
  { id: 'unit_v8_neutral_13', name: '황혼의 합금집행관', subtitle: '경계를 지키는 눈', kind: 'unit', rarity: 'legendary', element: 'neutral', cost: 7, attack: 7, health: 9, keywords: ['pierce'], summonMode: 'rift', riftCost: 5, riftCondition: { kind: 'opponent_more_units', label: '상대 필드의 유닛이 더 많을 때' }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 5. 관통', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '여명 성기사단' },
  { id: 'unit_v8_neutral_14', name: '고대의 기계포병', subtitle: '별빛 아래의 결투', kind: 'unit', rarity: 'common', element: 'neutral', cost: 3, attack: 3, health: 5, keywords: ['guard'], onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복. 수호', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '천뢰 기동군' },
  { id: 'unit_v8_neutral_15', name: '불멸의 수정사냥꾼', subtitle: '파멸을 거스르는 의지', kind: 'unit', rarity: 'rare', element: 'neutral', cost: 3, attack: 5, health: 4, keywords: ['charge'], onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 2. 속공', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '수정 자동기' },
  { id: 'unit_v8_neutral_16', name: '붕괴의 성철군주', subtitle: '전설이 시작된 밤', kind: 'unit', rarity: 'common', element: 'neutral', cost: 3, attack: 2, health: 4, keywords: ['lifesteal'], target: 'none', text: '흡수', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '여명 성기사단' },
  { id: 'unit_v8_neutral_17', name: '검은별의 기어수호병', subtitle: '최후까지 남은 수호', kind: 'unit', rarity: 'rare', element: 'neutral', cost: 3, attack: 4, health: 6, keywords: ['pierce'], onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '소환 시 코어를 2 회복. 관통', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '천뢰 기동군' },
  { id: 'unit_v8_neutral_18', name: '백은의 결정정령', subtitle: '잊힌 시대의 파편', kind: 'unit', rarity: 'epic', element: 'neutral', cost: 6, attack: 7, health: 6, onSummon: { kind: 'shield_unit', amount: 2 }, target: 'none', text: '소환 시 아군 유닛 하나에게 보호막 2.', flavor: '수정 자동기의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '수정 자동기' },
  { id: 'unit_v8_neutral_19', name: '경계의 백은검사', subtitle: '균열 너머의 메아리', kind: 'unit', rarity: 'common', element: 'neutral', cost: 2, attack: 2, health: 4, target: 'none', text: '안정적인 전투 능력으로 전선을 유지합니다.', flavor: '여명 성기사단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '여명 성기사단' },
  { id: 'unit_v8_neutral_20', name: '찬란한 자동기대장', subtitle: '빛과 그림자의 약속', kind: 'unit', rarity: 'rare', element: 'neutral', cost: 4, attack: 4, health: 6, keywords: ['guard'], summonMode: 'rift', riftCost: 2, riftCondition: { kind: 'ally_element', element: 'neutral', label: '내 필드에 성철 속성 유닛이 있을 때' }, onSummon: { kind: 'heal_core', amount: 2 }, target: 'none', text: '균열 소환: 조건을 만족하면 비용 2. 소환 시 코어를 2 회복. 수호', flavor: '천뢰 기동군의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '◇', series: '천뢰 기동군' },
  { id: 'spell_v8_solar_01', name: '새벽의 태양섬광', subtitle: '전장을 가르는 서약', kind: 'spell', rarity: 'epic', element: 'solar', cost: 4, effect: { kind: 'damage_unit', amount: 4 }, target: 'enemy_unit', text: '적 유닛 하나에 4 피해.', flavor: '여명 성기사단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☀', series: '여명 성기사단' },
  { id: 'spell_v8_solar_02', name: '황혼의 홍련폭발', subtitle: '끝나지 않는 행군', kind: 'spell', rarity: 'common', element: 'solar', cost: 2, effect: { kind: 'damage_core', amount: 2 }, target: 'enemy_core', text: '상대 코어에 2 피해.', flavor: '수정 자동기에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☀', series: '수정 자동기' },
  { id: 'spell_v8_solar_03', name: '찬란한 성광축복', subtitle: '폭풍 앞의 침묵', kind: 'spell', rarity: 'rare', element: 'solar', cost: 2, effect: { kind: 'heal_core', amount: 3 }, target: 'none', text: '내 코어를 3 회복.', flavor: '일식 공명단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☀', series: '일식 공명단' },
  { id: 'spell_v8_solar_04', name: '침묵의 여명검무', subtitle: '다시 타오르는 심장', kind: 'spell', rarity: 'legendary', element: 'solar', cost: 7, effect: { kind: 'draw', amount: 2 }, target: 'none', text: '카드 2장을 뽑습니다.', flavor: '여명 성기사단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☀', series: '여명 성기사단' },
  { id: 'spell_v8_solar_05', name: '고대의 백열충격', subtitle: '별빛 아래의 결투', kind: 'spell', rarity: 'common', element: 'solar', cost: 1, effect: { kind: 'buff_unit', attack: 2, health: 1 }, target: 'friendly_unit', text: '아군 유닛 하나에게 공격력 +2, 체력 +1.', flavor: '수정 자동기에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☀', series: '수정 자동기' },
  { id: 'spell_v8_solar_06', name: '유성의 성화의맹세', subtitle: '전설이 시작된 밤', kind: 'spell', rarity: 'rare', element: 'solar', cost: 3, effect: { kind: 'aoe_enemy', amount: 1 }, target: 'none', text: '모든 적 유닛에 1 피해.', flavor: '일식 공명단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☀', series: '일식 공명단' },
  { id: 'spell_v8_solar_07', name: '망각의 태양창', subtitle: '잊힌 시대의 파편', kind: 'spell', rarity: 'common', element: 'solar', cost: 1, effect: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '이번 턴 에너지 1 회복.', flavor: '여명 성기사단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☀', series: '여명 성기사단' },
  { id: 'spell_v8_solar_08', name: '불멸의 광휘폭풍', subtitle: '빛과 그림자의 약속', kind: 'spell', rarity: 'rare', element: 'solar', cost: 3, effect: { kind: 'shield_unit', amount: 2 }, target: 'friendly_unit', text: '아군 유닛 하나에게 보호막 2.', flavor: '수정 자동기에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☀', series: '수정 자동기' },
  { id: 'spell_v8_solar_09', name: '심연의 불꽃재생', subtitle: '두 세계를 잇는 잔광', kind: 'spell', rarity: 'epic', element: 'solar', cost: 4, effect: { kind: 'destroy_weak', maxHealth: 4 }, target: 'enemy_unit', text: '현재 체력이 4 이하인 적 유닛 하나를 파괴.', flavor: '일식 공명단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☀', series: '일식 공명단' },
  { id: 'spell_v8_solar_10', name: '서약의 성역선고', subtitle: '숨겨진 별의 맹세', kind: 'spell', rarity: 'common', element: 'solar', cost: 2, effect: { kind: 'summon_token', attack: 2, health: 2, name: '태양의 잔영' }, target: 'none', text: '빈 칸에 2/2 태양의 잔영을 소환.', flavor: '여명 성기사단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☀', series: '여명 성기사단' },
  { id: 'spell_v8_lunar_01', name: '찬란한 월광치유', subtitle: '두 세계를 잇는 잔광', kind: 'spell', rarity: 'legendary', element: 'lunar', cost: 6, effect: { kind: 'damage_core', amount: 4 }, target: 'enemy_core', text: '상대 코어에 4 피해.', flavor: '세계수 생명군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☽', series: '세계수 생명군' },
  { id: 'spell_v8_lunar_02', name: '침묵의 초승절단', subtitle: '숨겨진 별의 맹세', kind: 'spell', rarity: 'common', element: 'lunar', cost: 2, effect: { kind: 'heal_core', amount: 3 }, target: 'none', text: '내 코어를 3 회복.', flavor: '월영 몽환단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☽', series: '월영 몽환단' },
  { id: 'spell_v8_lunar_03', name: '고대의 몽환장막', subtitle: '무너진 왕국의 기억', kind: 'spell', rarity: 'rare', element: 'lunar', cost: 2, effect: { kind: 'draw', amount: 2 }, target: 'none', text: '카드 2장을 뽑습니다.', flavor: '세계수 생명군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☽', series: '세계수 생명군' },
  { id: 'spell_v8_lunar_04', name: '유성의 은월파동', subtitle: '경계를 지키는 눈', kind: 'spell', rarity: 'common', element: 'lunar', cost: 2, effect: { kind: 'buff_unit', attack: 2, health: 1 }, target: 'friendly_unit', text: '아군 유닛 하나에게 공격력 +2, 체력 +1.', flavor: '월영 몽환단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☽', series: '월영 몽환단' },
  { id: 'spell_v8_lunar_05', name: '망각의 거울반사', subtitle: '파멸을 거스르는 의지', kind: 'spell', rarity: 'rare', element: 'lunar', cost: 2, effect: { kind: 'aoe_enemy', amount: 1 }, target: 'none', text: '모든 적 유닛에 1 피해.', flavor: '세계수 생명군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☽', series: '세계수 생명군' },
  { id: 'spell_v8_lunar_06', name: '불멸의 별잠의계시', subtitle: '최후까지 남은 수호', kind: 'spell', rarity: 'epic', element: 'lunar', cost: 5, effect: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '이번 턴 에너지 1 회복.', flavor: '월영 몽환단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☽', series: '월영 몽환단' },
  { id: 'spell_v8_lunar_07', name: '심연의 월식정화', subtitle: '균열 너머의 메아리', kind: 'spell', rarity: 'common', element: 'lunar', cost: 1, effect: { kind: 'shield_unit', amount: 2 }, target: 'friendly_unit', text: '아군 유닛 하나에게 보호막 2.', flavor: '세계수 생명군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☽', series: '세계수 생명군' },
  { id: 'spell_v8_lunar_08', name: '서약의 서리달빛', subtitle: '전장을 가르는 서약', kind: 'spell', rarity: 'rare', element: 'lunar', cost: 3, effect: { kind: 'destroy_weak', maxHealth: 4 }, target: 'enemy_unit', text: '현재 체력이 4 이하인 적 유닛 하나를 파괴.', flavor: '월영 몽환단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☽', series: '월영 몽환단' },
  { id: 'spell_v8_lunar_09', name: '붕괴의 꿈결도약', subtitle: '끝나지 않는 행군', kind: 'spell', rarity: 'legendary', element: 'lunar', cost: 6, effect: { kind: 'summon_token', attack: 3, health: 3, name: '월영의 잔영' }, target: 'none', text: '빈 칸에 3/3 월영의 잔영을 소환.', flavor: '세계수 생명군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☽', series: '세계수 생명군' },
  { id: 'spell_v8_lunar_10', name: '왕실의 백야회복', subtitle: '폭풍 앞의 침묵', kind: 'spell', rarity: 'common', element: 'lunar', cost: 2, effect: { kind: 'damage_unit', amount: 2 }, target: 'enemy_unit', text: '적 유닛 하나에 2 피해.', flavor: '월영 몽환단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☽', series: '월영 몽환단' },
  { id: 'spell_v8_storm_01', name: '고대의 연쇄낙뢰', subtitle: '끝나지 않는 행군', kind: 'spell', rarity: 'common', element: 'storm', cost: 1, effect: { kind: 'heal_core', amount: 3 }, target: 'none', text: '내 코어를 3 회복.', flavor: '천뢰 기동군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☇', series: '천뢰 기동군' },
  { id: 'spell_v8_storm_02', name: '유성의 천둥창', subtitle: '폭풍 앞의 침묵', kind: 'spell', rarity: 'rare', element: 'storm', cost: 3, effect: { kind: 'draw', amount: 2 }, target: 'none', text: '카드 2장을 뽑습니다.', flavor: '심연 포식군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☇', series: '심연 포식군' },
  { id: 'spell_v8_storm_03', name: '망각의 전류폭주', subtitle: '다시 타오르는 심장', kind: 'spell', rarity: 'epic', element: 'storm', cost: 4, effect: { kind: 'buff_unit', attack: 2, health: 3 }, target: 'friendly_unit', text: '아군 유닛 하나에게 공격력 +2, 체력 +3.', flavor: '원초의 수호령에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☇', series: '원초의 수호령' },
  { id: 'spell_v8_storm_04', name: '불멸의 폭풍도약', subtitle: '별빛 아래의 결투', kind: 'spell', rarity: 'common', element: 'storm', cost: 2, effect: { kind: 'aoe_enemy', amount: 1 }, target: 'none', text: '모든 적 유닛에 1 피해.', flavor: '천뢰 기동군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☇', series: '천뢰 기동군' },
  { id: 'spell_v8_storm_05', name: '심연의 뇌운폭발', subtitle: '전설이 시작된 밤', kind: 'spell', rarity: 'rare', element: 'storm', cost: 2, effect: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '이번 턴 에너지 1 회복.', flavor: '심연 포식군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☇', series: '심연 포식군' },
  { id: 'spell_v8_storm_06', name: '서약의 자기장붕괴', subtitle: '잊힌 시대의 파편', kind: 'spell', rarity: 'legendary', element: 'storm', cost: 7, effect: { kind: 'shield_unit', amount: 4 }, target: 'friendly_unit', text: '아군 유닛 하나에게 보호막 4.', flavor: '원초의 수호령에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☇', series: '원초의 수호령' },
  { id: 'spell_v8_storm_07', name: '붕괴의 질풍가속', subtitle: '빛과 그림자의 약속', kind: 'spell', rarity: 'common', element: 'storm', cost: 1, effect: { kind: 'destroy_weak', maxHealth: 2 }, target: 'enemy_unit', text: '현재 체력이 2 이하인 적 유닛 하나를 파괴.', flavor: '천뢰 기동군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☇', series: '천뢰 기동군' },
  { id: 'spell_v8_storm_08', name: '왕실의 전격충전', subtitle: '두 세계를 잇는 잔광', kind: 'spell', rarity: 'rare', element: 'storm', cost: 3, effect: { kind: 'summon_token', attack: 2, health: 3, name: '폭풍의 잔영' }, target: 'none', text: '빈 칸에 2/3 폭풍의 잔영을 소환.', flavor: '심연 포식군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☇', series: '심연 포식군' },
  { id: 'spell_v8_storm_09', name: '유리빛 낙뢰심판', subtitle: '숨겨진 별의 맹세', kind: 'spell', rarity: 'common', element: 'storm', cost: 1, effect: { kind: 'damage_unit', amount: 2 }, target: 'enemy_unit', text: '적 유닛 하나에 2 피해.', flavor: '원초의 수호령에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☇', series: '원초의 수호령' },
  { id: 'spell_v8_storm_10', name: '검은별의 천뢰공명', subtitle: '무너진 왕국의 기억', kind: 'spell', rarity: 'common', element: 'storm', cost: 2, effect: { kind: 'damage_core', amount: 2 }, target: 'enemy_core', text: '상대 코어에 2 피해.', flavor: '천뢰 기동군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '☇', series: '천뢰 기동군' },
  { id: 'spell_v8_verdant_01', name: '망각의 급속성장', subtitle: '숨겨진 별의 맹세', kind: 'spell', rarity: 'common', element: 'verdant', cost: 1, effect: { kind: 'draw', amount: 1 }, target: 'none', text: '카드 1장을 뽑습니다.', flavor: '원초의 수호령에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '❉', series: '원초의 수호령' },
  { id: 'spell_v8_verdant_02', name: '불멸의 세계수축복', subtitle: '무너진 왕국의 기억', kind: 'spell', rarity: 'rare', element: 'verdant', cost: 3, effect: { kind: 'buff_unit', attack: 2, health: 3 }, target: 'friendly_unit', text: '아군 유닛 하나에게 공격력 +2, 체력 +3.', flavor: '세계수 생명군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '❉', series: '세계수 생명군' },
  { id: 'spell_v8_verdant_03', name: '심연의 덩굴폭발', subtitle: '경계를 지키는 눈', kind: 'spell', rarity: 'legendary', element: 'verdant', cost: 6, effect: { kind: 'aoe_enemy', amount: 3 }, target: 'none', text: '모든 적 유닛에 3 피해.', flavor: '원초의 수호령에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '❉', series: '원초의 수호령' },
  { id: 'spell_v8_verdant_04', name: '서약의 생명순환', subtitle: '파멸을 거스르는 의지', kind: 'spell', rarity: 'common', element: 'verdant', cost: 2, effect: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '이번 턴 에너지 1 회복.', flavor: '세계수 생명군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '❉', series: '세계수 생명군' },
  { id: 'spell_v8_verdant_05', name: '붕괴의 꽃잎폭풍', subtitle: '최후까지 남은 수호', kind: 'spell', rarity: 'rare', element: 'verdant', cost: 2, effect: { kind: 'shield_unit', amount: 2 }, target: 'friendly_unit', text: '아군 유닛 하나에게 보호막 2.', flavor: '원초의 수호령에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '❉', series: '원초의 수호령' },
  { id: 'spell_v8_verdant_06', name: '왕실의 뿌리봉쇄', subtitle: '균열 너머의 메아리', kind: 'spell', rarity: 'common', element: 'verdant', cost: 2, effect: { kind: 'destroy_weak', maxHealth: 2 }, target: 'enemy_unit', text: '현재 체력이 2 이하인 적 유닛 하나를 파괴.', flavor: '세계수 생명군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '❉', series: '세계수 생명군' },
  { id: 'spell_v8_verdant_07', name: '유리빛 숲의회복', subtitle: '전장을 가르는 서약', kind: 'spell', rarity: 'common', element: 'verdant', cost: 1, effect: { kind: 'summon_token', attack: 2, health: 2, name: '세계수의 잔영' }, target: 'none', text: '빈 칸에 2/2 세계수의 잔영을 소환.', flavor: '원초의 수호령에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '❉', series: '원초의 수호령' },
  { id: 'spell_v8_verdant_08', name: '검은별의 비취성장', subtitle: '끝나지 않는 행군', kind: 'spell', rarity: 'epic', element: 'verdant', cost: 5, effect: { kind: 'damage_unit', amount: 4 }, target: 'enemy_unit', text: '적 유닛 하나에 4 피해.', flavor: '세계수 생명군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '❉', series: '세계수 생명군' },
  { id: 'spell_v8_verdant_09', name: '푸른별의 수액재생', subtitle: '폭풍 앞의 침묵', kind: 'spell', rarity: 'common', element: 'verdant', cost: 1, effect: { kind: 'damage_core', amount: 2 }, target: 'enemy_core', text: '상대 코어에 2 피해.', flavor: '원초의 수호령에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '❉', series: '원초의 수호령' },
  { id: 'spell_v8_verdant_10', name: '붉은달의 원시각성', subtitle: '다시 타오르는 심장', kind: 'spell', rarity: 'rare', element: 'verdant', cost: 3, effect: { kind: 'heal_core', amount: 3 }, target: 'none', text: '내 코어를 3 회복.', flavor: '세계수 생명군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '❉', series: '세계수 생명군' },
  { id: 'spell_v8_void_01', name: '심연의 공허창', subtitle: '폭풍 앞의 침묵', kind: 'spell', rarity: 'common', element: 'void', cost: 1, effect: { kind: 'buff_unit', attack: 2, health: 1 }, target: 'friendly_unit', text: '아군 유닛 하나에게 공격력 +2, 체력 +1.', flavor: '월영 몽환단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '◉', series: '월영 몽환단' },
  { id: 'spell_v8_void_02', name: '서약의 균열붕괴', subtitle: '다시 타오르는 심장', kind: 'spell', rarity: 'rare', element: 'void', cost: 3, effect: { kind: 'aoe_enemy', amount: 1 }, target: 'none', text: '모든 적 유닛에 1 피해.', flavor: '심연 포식군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '◉', series: '심연 포식군' },
  { id: 'spell_v8_void_03', name: '붕괴의 심연흡수', subtitle: '별빛 아래의 결투', kind: 'spell', rarity: 'common', element: 'void', cost: 1, effect: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '이번 턴 에너지 1 회복.', flavor: '일식 공명단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '◉', series: '일식 공명단' },
  { id: 'spell_v8_void_04', name: '왕실의 그림자폭발', subtitle: '전설이 시작된 밤', kind: 'spell', rarity: 'common', element: 'void', cost: 2, effect: { kind: 'shield_unit', amount: 2 }, target: 'friendly_unit', text: '아군 유닛 하나에게 보호막 2.', flavor: '월영 몽환단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '◉', series: '월영 몽환단' },
  { id: 'spell_v8_void_05', name: '유리빛 차원절단', subtitle: '잊힌 시대의 파편', kind: 'spell', rarity: 'epic', element: 'void', cost: 4, effect: { kind: 'destroy_weak', maxHealth: 4 }, target: 'enemy_unit', text: '현재 체력이 4 이하인 적 유닛 하나를 파괴.', flavor: '심연 포식군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '◉', series: '심연 포식군' },
  { id: 'spell_v8_void_06', name: '검은별의 소멸파동', subtitle: '빛과 그림자의 약속', kind: 'spell', rarity: 'common', element: 'void', cost: 2, effect: { kind: 'summon_token', attack: 2, health: 2, name: '공허의 잔영' }, target: 'none', text: '빈 칸에 2/2 공허의 잔영을 소환.', flavor: '일식 공명단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '◉', series: '일식 공명단' },
  { id: 'spell_v8_void_07', name: '푸른별의 무의선고', subtitle: '두 세계를 잇는 잔광', kind: 'spell', rarity: 'rare', element: 'void', cost: 2, effect: { kind: 'damage_unit', amount: 2 }, target: 'enemy_unit', text: '적 유닛 하나에 2 피해.', flavor: '월영 몽환단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '◉', series: '월영 몽환단' },
  { id: 'spell_v8_void_08', name: '붉은달의 흑성침식', subtitle: '숨겨진 별의 맹세', kind: 'spell', rarity: 'epic', element: 'void', cost: 5, effect: { kind: 'damage_core', amount: 2 }, target: 'enemy_core', text: '상대 코어에 2 피해.', flavor: '심연 포식군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '◉', series: '심연 포식군' },
  { id: 'spell_v8_void_09', name: '백은의 경계파열', subtitle: '무너진 왕국의 기억', kind: 'spell', rarity: 'common', element: 'void', cost: 1, effect: { kind: 'heal_core', amount: 3 }, target: 'none', text: '내 코어를 3 회복.', flavor: '일식 공명단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '◉', series: '일식 공명단' },
  { id: 'spell_v8_void_10', name: '천공의 심연귀환', subtitle: '경계를 지키는 눈', kind: 'spell', rarity: 'rare', element: 'void', cost: 3, effect: { kind: 'draw', amount: 2 }, target: 'none', text: '카드 2장을 뽑습니다.', flavor: '월영 몽환단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '◉', series: '월영 몽환단' },
  { id: 'spell_v8_neutral_01', name: '붕괴의 수정증폭', subtitle: '무너진 왕국의 기억', kind: 'spell', rarity: 'common', element: 'neutral', cost: 1, effect: { kind: 'aoe_enemy', amount: 1 }, target: 'none', text: '모든 적 유닛에 1 피해.', flavor: '여명 성기사단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '⌘', series: '여명 성기사단' },
  { id: 'spell_v8_neutral_02', name: '왕실의 기계가속', subtitle: '경계를 지키는 눈', kind: 'spell', rarity: 'epic', element: 'neutral', cost: 5, effect: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '이번 턴 에너지 1 회복.', flavor: '천뢰 기동군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '⌘', series: '천뢰 기동군' },
  { id: 'spell_v8_neutral_03', name: '유리빛 프리즘장막', subtitle: '파멸을 거스르는 의지', kind: 'spell', rarity: 'common', element: 'neutral', cost: 1, effect: { kind: 'shield_unit', amount: 2 }, target: 'friendly_unit', text: '아군 유닛 하나에게 보호막 2.', flavor: '수정 자동기에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '⌘', series: '수정 자동기' },
  { id: 'spell_v8_neutral_04', name: '검은별의 철갑강화', subtitle: '최후까지 남은 수호', kind: 'spell', rarity: 'rare', element: 'neutral', cost: 3, effect: { kind: 'destroy_weak', maxHealth: 4 }, target: 'enemy_unit', text: '현재 체력이 4 이하인 적 유닛 하나를 파괴.', flavor: '여명 성기사단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '⌘', series: '여명 성기사단' },
  { id: 'spell_v8_neutral_05', name: '푸른별의 성철충격', subtitle: '균열 너머의 메아리', kind: 'spell', rarity: 'epic', element: 'neutral', cost: 4, effect: { kind: 'summon_token', attack: 3, health: 3, name: '성철의 잔영' }, target: 'none', text: '빈 칸에 3/3 성철의 잔영을 소환.', flavor: '천뢰 기동군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '⌘', series: '천뢰 기동군' },
  { id: 'spell_v8_neutral_06', name: '붉은달의 시계역행', subtitle: '전장을 가르는 서약', kind: 'spell', rarity: 'common', element: 'neutral', cost: 2, effect: { kind: 'damage_unit', amount: 2 }, target: 'enemy_unit', text: '적 유닛 하나에 2 피해.', flavor: '수정 자동기에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '⌘', series: '수정 자동기' },
  { id: 'spell_v8_neutral_07', name: '백은의 기어재구성', subtitle: '끝나지 않는 행군', kind: 'spell', rarity: 'rare', element: 'neutral', cost: 2, effect: { kind: 'damage_core', amount: 2 }, target: 'enemy_core', text: '상대 코어에 2 피해.', flavor: '여명 성기사단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '⌘', series: '여명 성기사단' },
  { id: 'spell_v8_neutral_08', name: '천공의 결정폭발', subtitle: '폭풍 앞의 침묵', kind: 'spell', rarity: 'common', element: 'neutral', cost: 2, effect: { kind: 'heal_core', amount: 3 }, target: 'none', text: '내 코어를 3 회복.', flavor: '천뢰 기동군에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '⌘', series: '천뢰 기동군' },
  { id: 'spell_v8_neutral_09', name: '심장부의 합금보강', subtitle: '다시 타오르는 심장', kind: 'spell', rarity: 'common', element: 'neutral', cost: 1, effect: { kind: 'draw', amount: 1 }, target: 'none', text: '카드 1장을 뽑습니다.', flavor: '수정 자동기에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '⌘', series: '수정 자동기' },
  { id: 'spell_v8_neutral_10', name: '경계의 프리즘통찰', subtitle: '별빛 아래의 결투', kind: 'spell', rarity: 'rare', element: 'neutral', cost: 3, effect: { kind: 'buff_unit', attack: 2, health: 3 }, target: 'friendly_unit', text: '아군 유닛 하나에게 공격력 +2, 체력 +3.', flavor: '여명 성기사단에서 전승되는 비전. 한 장의 주문이 전장의 우세를 뒤집는다.', sigil: '⌘', series: '여명 성기사단' },
  { id: 'trap_v8_solar_01', name: '새벽의 성화반격', subtitle: '전장을 가르는 서약', kind: 'trap', rarity: 'rare', element: 'solar', cost: 2, trapTrigger: 'spell_played', trapEffect: { kind: 'negate' }, target: 'none', text: '상대가 주문을 사용할 때, 그 행동을 무효화합니다.', flavor: '일식 공명단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '✥', series: '일식 공명단' },
  { id: 'trap_v8_solar_02', name: '찬란한 광휘방벽', subtitle: '두 세계를 잇는 잔광', kind: 'trap', rarity: 'common', element: 'solar', cost: 2, trapTrigger: 'unit_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '상대가 유닛을 소환할 때, 적 유닛 하나에 2 피해.', flavor: '여명 성기사단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '✥', series: '여명 성기사단' },
  { id: 'trap_v8_solar_03', name: '고대의 홍련역습', subtitle: '끝나지 않는 행군', kind: 'trap', rarity: 'common', element: 'solar', cost: 2, trapTrigger: 'direct_attack', trapEffect: { kind: 'negate_and_damage', amount: 2 }, target: 'none', text: '상대가 코어를 직접 공격할 때, 그 행동을 무효화하고 공격 유닛/상대 코어에 2 피해.', flavor: '수정 자동기의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '✥', series: '수정 자동기' },
  { id: 'trap_v8_solar_04', name: '망각의 태양심판', subtitle: '숨겨진 별의 맹세', kind: 'trap', rarity: 'rare', element: 'solar', cost: 2, trapTrigger: 'unit_attacked', trapEffect: { kind: 'buff_unit', attack: 2, health: 2 }, target: 'none', text: '내 유닛이 공격받을 때, 아군 유닛 하나에게 공격력 +2, 체력 +2.', flavor: '일식 공명단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '✥', series: '일식 공명단' },
  { id: 'trap_v8_solar_05', name: '심연의 여명매복', subtitle: '폭풍 앞의 침묵', kind: 'trap', rarity: 'common', element: 'solar', cost: 2, trapTrigger: 'friendly_destroyed', trapEffect: { kind: 'summon_token', attack: 2, health: 3, name: '태양 수호령' }, target: 'none', text: '내 유닛이 파괴될 때, 빈 칸에 2/3 태양 수호령을 소환.', flavor: '여명 성기사단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '✥', series: '여명 성기사단' },
  { id: 'trap_v8_solar_06', name: '붕괴의 성검봉인', subtitle: '무너진 왕국의 기억', kind: 'trap', rarity: 'rare', element: 'solar', cost: 2, trapTrigger: 'special_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '특수 소환이 발생할 때, 적 유닛 하나에 2 피해.', flavor: '수정 자동기의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '✥', series: '수정 자동기' },
  { id: 'trap_v8_solar_07', name: '유리빛 불꽃보복', subtitle: '다시 타오르는 심장', kind: 'trap', rarity: 'epic', element: 'solar', cost: 3, trapTrigger: 'fusion_summoned', trapEffect: { kind: 'damage_unit', amount: 4 }, target: 'none', text: '공명 융합이 발생할 때, 적 유닛 하나에 4 피해.', flavor: '일식 공명단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '✥', series: '일식 공명단' },
  { id: 'trap_v8_solar_08', name: '푸른별의 성역결계', subtitle: '경계를 지키는 눈', kind: 'trap', rarity: 'common', element: 'solar', cost: 2, trapTrigger: 'evolution_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '계승 진화가 발생할 때, 적 유닛 하나에 2 피해.', flavor: '여명 성기사단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '✥', series: '여명 성기사단' },
  { id: 'trap_v8_lunar_01', name: '황혼의 거울장막', subtitle: '두 세계를 잇는 잔광', kind: 'trap', rarity: 'rare', element: 'lunar', cost: 2, trapTrigger: 'unit_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '상대가 유닛을 소환할 때, 적 유닛 하나에 2 피해.', flavor: '세계수 생명군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '▣', series: '세계수 생명군' },
  { id: 'trap_v8_lunar_02', name: '침묵의 월영봉인', subtitle: '끝나지 않는 행군', kind: 'trap', rarity: 'common', element: 'lunar', cost: 2, trapTrigger: 'direct_attack', trapEffect: { kind: 'negate_and_damage', amount: 2 }, target: 'none', text: '상대가 코어를 직접 공격할 때, 그 행동을 무효화하고 공격 유닛/상대 코어에 2 피해.', flavor: '월영 몽환단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '▣', series: '월영 몽환단' },
  { id: 'trap_v8_lunar_03', name: '유성의 몽환덫', subtitle: '숨겨진 별의 맹세', kind: 'trap', rarity: 'rare', element: 'lunar', cost: 2, trapTrigger: 'unit_attacked', trapEffect: { kind: 'buff_unit', attack: 2, health: 2 }, target: 'none', text: '내 유닛이 공격받을 때, 아군 유닛 하나에게 공격력 +2, 체력 +2.', flavor: '세계수 생명군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '▣', series: '세계수 생명군' },
  { id: 'trap_v8_lunar_04', name: '불멸의 초승반격', subtitle: '폭풍 앞의 침묵', kind: 'trap', rarity: 'epic', element: 'lunar', cost: 3, trapTrigger: 'friendly_destroyed', trapEffect: { kind: 'summon_token', attack: 3, health: 3, name: '월영 수호령' }, target: 'none', text: '내 유닛이 파괴될 때, 빈 칸에 3/3 월영 수호령을 소환.', flavor: '월영 몽환단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '▣', series: '월영 몽환단' },
  { id: 'trap_v8_lunar_05', name: '서약의 은월미궁', subtitle: '무너진 왕국의 기억', kind: 'trap', rarity: 'common', element: 'lunar', cost: 2, trapTrigger: 'special_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '특수 소환이 발생할 때, 적 유닛 하나에 2 피해.', flavor: '세계수 생명군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '▣', series: '세계수 생명군' },
  { id: 'trap_v8_lunar_06', name: '왕실의 꿈결방벽', subtitle: '다시 타오르는 심장', kind: 'trap', rarity: 'rare', element: 'lunar', cost: 2, trapTrigger: 'fusion_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '공명 융합이 발생할 때, 적 유닛 하나에 2 피해.', flavor: '월영 몽환단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '▣', series: '월영 몽환단' },
  { id: 'trap_v8_lunar_07', name: '검은별의 달빛역전', subtitle: '경계를 지키는 눈', kind: 'trap', rarity: 'legendary', element: 'lunar', cost: 4, trapTrigger: 'evolution_summoned', trapEffect: { kind: 'damage_unit', amount: 4 }, target: 'none', text: '계승 진화가 발생할 때, 적 유닛 하나에 4 피해.', flavor: '세계수 생명군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '▣', series: '세계수 생명군' },
  { id: 'trap_v8_lunar_08', name: '붉은달의 백야봉인', subtitle: '별빛 아래의 결투', kind: 'trap', rarity: 'common', element: 'lunar', cost: 2, trapTrigger: 'spell_played', trapEffect: { kind: 'negate' }, target: 'none', text: '상대가 주문을 사용할 때, 그 행동을 무효화합니다.', flavor: '월영 몽환단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '▣', series: '월영 몽환단' },
  { id: 'trap_v8_storm_01', name: '찬란한 폭풍감옥', subtitle: '끝나지 않는 행군', kind: 'trap', rarity: 'epic', element: 'storm', cost: 3, trapTrigger: 'direct_attack', trapEffect: { kind: 'negate_and_damage', amount: 2 }, target: 'none', text: '상대가 코어를 직접 공격할 때, 그 행동을 무효화하고 공격 유닛/상대 코어에 2 피해.', flavor: '원초의 수호령의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '☇', series: '원초의 수호령' },
  { id: 'trap_v8_storm_02', name: '고대의 낙뢰덫', subtitle: '숨겨진 별의 맹세', kind: 'trap', rarity: 'common', element: 'storm', cost: 2, trapTrigger: 'unit_attacked', trapEffect: { kind: 'buff_unit', attack: 2, health: 2 }, target: 'none', text: '내 유닛이 공격받을 때, 아군 유닛 하나에게 공격력 +2, 체력 +2.', flavor: '천뢰 기동군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '☇', series: '천뢰 기동군' },
  { id: 'trap_v8_storm_03', name: '망각의 전류반격', subtitle: '폭풍 앞의 침묵', kind: 'trap', rarity: 'rare', element: 'storm', cost: 2, trapTrigger: 'friendly_destroyed', trapEffect: { kind: 'summon_token', attack: 2, health: 3, name: '폭풍 수호령' }, target: 'none', text: '내 유닛이 파괴될 때, 빈 칸에 2/3 폭풍 수호령을 소환.', flavor: '심연 포식군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '☇', series: '심연 포식군' },
  { id: 'trap_v8_storm_04', name: '심연의 천둥봉쇄', subtitle: '무너진 왕국의 기억', kind: 'trap', rarity: 'legendary', element: 'storm', cost: 4, trapTrigger: 'special_summoned', trapEffect: { kind: 'damage_unit', amount: 4 }, target: 'none', text: '특수 소환이 발생할 때, 적 유닛 하나에 4 피해.', flavor: '원초의 수호령의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '☇', series: '원초의 수호령' },
  { id: 'trap_v8_storm_05', name: '붕괴의 질풍역전', subtitle: '다시 타오르는 심장', kind: 'trap', rarity: 'common', element: 'storm', cost: 2, trapTrigger: 'fusion_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '공명 융합이 발생할 때, 적 유닛 하나에 2 피해.', flavor: '천뢰 기동군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '☇', series: '천뢰 기동군' },
  { id: 'trap_v8_storm_06', name: '유리빛 전격매복', subtitle: '경계를 지키는 눈', kind: 'trap', rarity: 'rare', element: 'storm', cost: 2, trapTrigger: 'evolution_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '계승 진화가 발생할 때, 적 유닛 하나에 2 피해.', flavor: '심연 포식군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '☇', series: '심연 포식군' },
  { id: 'trap_v8_storm_07', name: '푸른별의 뇌광장벽', subtitle: '별빛 아래의 결투', kind: 'trap', rarity: 'common', element: 'storm', cost: 2, trapTrigger: 'spell_played', trapEffect: { kind: 'negate' }, target: 'none', text: '상대가 주문을 사용할 때, 그 행동을 무효화합니다.', flavor: '원초의 수호령의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '☇', series: '원초의 수호령' },
  { id: 'trap_v8_storm_08', name: '백은의 자기장함정', subtitle: '파멸을 거스르는 의지', kind: 'trap', rarity: 'rare', element: 'storm', cost: 2, trapTrigger: 'unit_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '상대가 유닛을 소환할 때, 적 유닛 하나에 2 피해.', flavor: '천뢰 기동군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '☇', series: '천뢰 기동군' },
  { id: 'trap_v8_verdant_01', name: '침묵의 가시덫', subtitle: '숨겨진 별의 맹세', kind: 'trap', rarity: 'legendary', element: 'verdant', cost: 4, trapTrigger: 'unit_attacked', trapEffect: { kind: 'buff_unit', attack: 2, health: 4 }, target: 'none', text: '내 유닛이 공격받을 때, 아군 유닛 하나에게 공격력 +2, 체력 +4.', flavor: '원초의 수호령의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '♧', series: '원초의 수호령' },
  { id: 'trap_v8_verdant_02', name: '유성의 뿌리속박', subtitle: '폭풍 앞의 침묵', kind: 'trap', rarity: 'common', element: 'verdant', cost: 2, trapTrigger: 'friendly_destroyed', trapEffect: { kind: 'summon_token', attack: 2, health: 3, name: '세계수 수호령' }, target: 'none', text: '내 유닛이 파괴될 때, 빈 칸에 2/3 세계수 수호령을 소환.', flavor: '세계수 생명군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '♧', series: '세계수 생명군' },
  { id: 'trap_v8_verdant_03', name: '불멸의 꽃잎반격', subtitle: '무너진 왕국의 기억', kind: 'trap', rarity: 'rare', element: 'verdant', cost: 2, trapTrigger: 'special_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '특수 소환이 발생할 때, 적 유닛 하나에 2 피해.', flavor: '원초의 수호령의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '♧', series: '원초의 수호령' },
  { id: 'trap_v8_verdant_04', name: '서약의 숲의매복', subtitle: '다시 타오르는 심장', kind: 'trap', rarity: 'common', element: 'verdant', cost: 2, trapTrigger: 'fusion_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '공명 융합이 발생할 때, 적 유닛 하나에 2 피해.', flavor: '세계수 생명군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '♧', series: '세계수 생명군' },
  { id: 'trap_v8_verdant_05', name: '왕실의 세계수방벽', subtitle: '경계를 지키는 눈', kind: 'trap', rarity: 'rare', element: 'verdant', cost: 2, trapTrigger: 'evolution_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '계승 진화가 발생할 때, 적 유닛 하나에 2 피해.', flavor: '원초의 수호령의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '♧', series: '원초의 수호령' },
  { id: 'trap_v8_verdant_06', name: '검은별의 이끼봉인', subtitle: '별빛 아래의 결투', kind: 'trap', rarity: 'epic', element: 'verdant', cost: 3, trapTrigger: 'spell_played', trapEffect: { kind: 'negate' }, target: 'none', text: '상대가 주문을 사용할 때, 그 행동을 무효화합니다.', flavor: '세계수 생명군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '♧', series: '세계수 생명군' },
  { id: 'trap_v8_verdant_07', name: '붉은달의 생명역전', subtitle: '파멸을 거스르는 의지', kind: 'trap', rarity: 'common', element: 'verdant', cost: 2, trapTrigger: 'unit_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '상대가 유닛을 소환할 때, 적 유닛 하나에 2 피해.', flavor: '원초의 수호령의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '♧', series: '원초의 수호령' },
  { id: 'trap_v8_verdant_08', name: '천공의 덩굴감옥', subtitle: '전설이 시작된 밤', kind: 'trap', rarity: 'rare', element: 'verdant', cost: 2, trapTrigger: 'direct_attack', trapEffect: { kind: 'negate_and_damage', amount: 2 }, target: 'none', text: '상대가 코어를 직접 공격할 때, 그 행동을 무효화하고 공격 유닛/상대 코어에 2 피해.', flavor: '세계수 생명군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '♧', series: '세계수 생명군' },
  { id: 'trap_v8_void_01', name: '고대의 무의지평선', subtitle: '폭풍 앞의 침묵', kind: 'trap', rarity: 'common', element: 'void', cost: 2, trapTrigger: 'friendly_destroyed', trapEffect: { kind: 'summon_token', attack: 2, health: 3, name: '공허 수호령' }, target: 'none', text: '내 유닛이 파괴될 때, 빈 칸에 2/3 공허 수호령을 소환.', flavor: '일식 공명단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '◒', series: '일식 공명단' },
  { id: 'trap_v8_void_02', name: '망각의 균열매복', subtitle: '무너진 왕국의 기억', kind: 'trap', rarity: 'rare', element: 'void', cost: 2, trapTrigger: 'special_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '특수 소환이 발생할 때, 적 유닛 하나에 2 피해.', flavor: '월영 몽환단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '◒', series: '월영 몽환단' },
  { id: 'trap_v8_void_03', name: '심연의 심연봉인', subtitle: '다시 타오르는 심장', kind: 'trap', rarity: 'epic', element: 'void', cost: 3, trapTrigger: 'fusion_summoned', trapEffect: { kind: 'damage_unit', amount: 4 }, target: 'none', text: '공명 융합이 발생할 때, 적 유닛 하나에 4 피해.', flavor: '심연 포식군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '◒', series: '심연 포식군' },
  { id: 'trap_v8_void_04', name: '붕괴의 그림자역습', subtitle: '경계를 지키는 눈', kind: 'trap', rarity: 'common', element: 'void', cost: 2, trapTrigger: 'evolution_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '계승 진화가 발생할 때, 적 유닛 하나에 2 피해.', flavor: '일식 공명단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '◒', series: '일식 공명단' },
  { id: 'trap_v8_void_05', name: '유리빛 공허장벽', subtitle: '별빛 아래의 결투', kind: 'trap', rarity: 'rare', element: 'void', cost: 2, trapTrigger: 'spell_played', trapEffect: { kind: 'negate' }, target: 'none', text: '상대가 주문을 사용할 때, 그 행동을 무효화합니다.', flavor: '월영 몽환단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '◒', series: '월영 몽환단' },
  { id: 'trap_v8_void_06', name: '푸른별의 차원덫', subtitle: '파멸을 거스르는 의지', kind: 'trap', rarity: 'epic', element: 'void', cost: 3, trapTrigger: 'unit_summoned', trapEffect: { kind: 'damage_unit', amount: 4 }, target: 'none', text: '상대가 유닛을 소환할 때, 적 유닛 하나에 4 피해.', flavor: '심연 포식군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '◒', series: '심연 포식군' },
  { id: 'trap_v8_void_07', name: '백은의 소멸반격', subtitle: '전설이 시작된 밤', kind: 'trap', rarity: 'common', element: 'void', cost: 2, trapTrigger: 'direct_attack', trapEffect: { kind: 'negate_and_damage', amount: 2 }, target: 'none', text: '상대가 코어를 직접 공격할 때, 그 행동을 무효화하고 공격 유닛/상대 코어에 2 피해.', flavor: '일식 공명단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '◒', series: '일식 공명단' },
  { id: 'trap_v8_void_08', name: '심장부의 흑성결계', subtitle: '최후까지 남은 수호', kind: 'trap', rarity: 'rare', element: 'void', cost: 2, trapTrigger: 'unit_attacked', trapEffect: { kind: 'buff_unit', attack: 2, health: 2 }, target: 'none', text: '내 유닛이 공격받을 때, 아군 유닛 하나에게 공격력 +2, 체력 +2.', flavor: '월영 몽환단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '◒', series: '월영 몽환단' },
  { id: 'trap_v8_neutral_01', name: '유성의 수정반전', subtitle: '무너진 왕국의 기억', kind: 'trap', rarity: 'common', element: 'neutral', cost: 2, trapTrigger: 'special_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '특수 소환이 발생할 때, 적 유닛 하나에 2 피해.', flavor: '수정 자동기의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '⬢', series: '수정 자동기' },
  { id: 'trap_v8_neutral_02', name: '불멸의 프리즘봉인', subtitle: '다시 타오르는 심장', kind: 'trap', rarity: 'rare', element: 'neutral', cost: 2, trapTrigger: 'fusion_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '공명 융합이 발생할 때, 적 유닛 하나에 2 피해.', flavor: '여명 성기사단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '⬢', series: '여명 성기사단' },
  { id: 'trap_v8_neutral_03', name: '서약의 성철방벽', subtitle: '경계를 지키는 눈', kind: 'trap', rarity: 'epic', element: 'neutral', cost: 3, trapTrigger: 'evolution_summoned', trapEffect: { kind: 'damage_unit', amount: 4 }, target: 'none', text: '계승 진화가 발생할 때, 적 유닛 하나에 4 피해.', flavor: '천뢰 기동군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '⬢', series: '천뢰 기동군' },
  { id: 'trap_v8_neutral_04', name: '왕실의 기계매복', subtitle: '별빛 아래의 결투', kind: 'trap', rarity: 'common', element: 'neutral', cost: 2, trapTrigger: 'spell_played', trapEffect: { kind: 'negate' }, target: 'none', text: '상대가 주문을 사용할 때, 그 행동을 무효화합니다.', flavor: '수정 자동기의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '⬢', series: '수정 자동기' },
  { id: 'trap_v8_neutral_05', name: '검은별의 합금역전', subtitle: '파멸을 거스르는 의지', kind: 'trap', rarity: 'rare', element: 'neutral', cost: 2, trapTrigger: 'unit_summoned', trapEffect: { kind: 'damage_unit', amount: 2 }, target: 'none', text: '상대가 유닛을 소환할 때, 적 유닛 하나에 2 피해.', flavor: '여명 성기사단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '⬢', series: '여명 성기사단' },
  { id: 'trap_v8_neutral_06', name: '붉은달의 기어함정', subtitle: '전설이 시작된 밤', kind: 'trap', rarity: 'common', element: 'neutral', cost: 2, trapTrigger: 'direct_attack', trapEffect: { kind: 'negate_and_damage', amount: 2 }, target: 'none', text: '상대가 코어를 직접 공격할 때, 그 행동을 무효화하고 공격 유닛/상대 코어에 2 피해.', flavor: '천뢰 기동군의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '⬢', series: '천뢰 기동군' },
  { id: 'trap_v8_neutral_07', name: '천공의 결정결계', subtitle: '최후까지 남은 수호', kind: 'trap', rarity: 'common', element: 'neutral', cost: 2, trapTrigger: 'unit_attacked', trapEffect: { kind: 'buff_unit', attack: 2, health: 2 }, target: 'none', text: '내 유닛이 공격받을 때, 아군 유닛 하나에게 공격력 +2, 체력 +2.', flavor: '수정 자동기의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '⬢', series: '수정 자동기' },
  { id: 'trap_v8_neutral_08', name: '경계의 자동기반격', subtitle: '잊힌 시대의 파편', kind: 'trap', rarity: 'epic', element: 'neutral', cost: 3, trapTrigger: 'friendly_destroyed', trapEffect: { kind: 'summon_token', attack: 3, health: 3, name: '성철 수호령' }, target: 'none', text: '내 유닛이 파괴될 때, 빈 칸에 3/3 성철 수호령을 소환.', flavor: '여명 성기사단의 결투가들이 가장 마지막까지 숨기는 한 수.', sigil: '⬢', series: '여명 성기사단' },
  { id: 'fusion_v8_01', name: '천식 공명룡', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'legendary', element: 'solar', cost: 7, attack: 8, health: 9, keywords: ['pierce', 'pierce'], summonMode: 'fusion', fusionRecipe: { label: '태양 + 공허 공명', materials: [{ label: '태양 속성 유닛 1장', element: 'solar' }, { label: '공허 속성 유닛 1장', element: 'void' }] }, onSummon: { kind: 'aoe_enemy', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 모든 적 유닛에 2 피해.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_02', name: '성뢰 합금거신', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'storm', cost: 6, attack: 7, health: 8, keywords: ['guard'], summonMode: 'fusion', fusionRecipe: { label: '폭풍 + 성철 공명', materials: [{ label: '폭풍 속성 유닛 1장', element: 'storm' }, { label: '성철 속성 유닛 1장', element: 'neutral' }] }, onSummon: { kind: 'draw', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 카드 2장을 뽑습니다.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_03', name: '세계근원 환수', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'verdant', cost: 6, attack: 8, health: 6, keywords: ['charge'], summonMode: 'fusion', fusionRecipe: { label: '세계수 + 월영 공명', materials: [{ label: '세계수 속성 유닛 1장', element: 'verdant' }, { label: '월영 속성 유닛 1장', element: 'lunar' }] }, onSummon: { kind: 'heal_core', amount: 5 }, target: 'none', text: '공명 융합. 소환 시 내 코어를 5 회복.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_04', name: '홍뢰 성창황', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'solar', cost: 6, attack: 6, health: 7, keywords: ['lifesteal'], summonMode: 'fusion', fusionRecipe: { label: '태양 + 폭풍 공명', materials: [{ label: '태양 속성 유닛 1장', element: 'solar' }, { label: '폭풍 속성 유닛 1장', element: 'storm' }] }, onSummon: { kind: 'gain_energy', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 이번 턴 에너지 2 회복.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_05', name: '월식 심연마녀', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'legendary', element: 'void', cost: 7, attack: 9, health: 10, keywords: ['pierce', 'pierce'], summonMode: 'fusion', fusionRecipe: { label: '공허 + 월영 공명', materials: [{ label: '공허 속성 유닛 1장', element: 'void' }, { label: '월영 속성 유닛 1장', element: 'lunar' }] }, onSummon: { kind: 'aoe_enemy', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 모든 적 유닛에 2 피해.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_06', name: '비취 프리즘수', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'verdant', cost: 6, attack: 8, health: 6, keywords: ['guard'], summonMode: 'fusion', fusionRecipe: { label: '세계수 + 성철 공명', materials: [{ label: '세계수 속성 유닛 1장', element: 'verdant' }, { label: '성철 속성 유닛 1장', element: 'neutral' }] }, onSummon: { kind: 'draw', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 카드 2장을 뽑습니다.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_07', name: '쌍월 태양기사', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'solar', cost: 6, attack: 6, health: 7, keywords: ['charge'], summonMode: 'fusion', fusionRecipe: { label: '태양 + 월영 공명', materials: [{ label: '태양 속성 유닛 1장', element: 'solar' }, { label: '월영 속성 유닛 1장', element: 'lunar' }] }, onSummon: { kind: 'heal_core', amount: 5 }, target: 'none', text: '공명 융합. 소환 시 내 코어를 5 회복.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_08', name: '풍림 천공룡', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'storm', cost: 6, attack: 7, health: 8, keywords: ['lifesteal'], summonMode: 'fusion', fusionRecipe: { label: '폭풍 + 세계수 공명', materials: [{ label: '폭풍 속성 유닛 1장', element: 'storm' }, { label: '세계수 속성 유닛 1장', element: 'verdant' }] }, onSummon: { kind: 'gain_energy', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 이번 턴 에너지 2 회복.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_09', name: '무광 수정군주', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'legendary', element: 'void', cost: 7, attack: 10, health: 8, keywords: ['pierce', 'pierce'], summonMode: 'fusion', fusionRecipe: { label: '공허 + 성철 공명', materials: [{ label: '공허 속성 유닛 1장', element: 'void' }, { label: '성철 속성 유닛 1장', element: 'neutral' }] }, onSummon: { kind: 'aoe_enemy', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 모든 적 유닛에 2 피해.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_10', name: '성림 불멸수', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'solar', cost: 6, attack: 6, health: 7, keywords: ['guard'], summonMode: 'fusion', fusionRecipe: { label: '태양 + 세계수 공명', materials: [{ label: '태양 속성 유닛 1장', element: 'solar' }, { label: '세계수 속성 유닛 1장', element: 'verdant' }] }, onSummon: { kind: 'draw', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 카드 2장을 뽑습니다.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_11', name: '월뢰 환상기사', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'lunar', cost: 6, attack: 7, health: 8, keywords: ['charge'], summonMode: 'fusion', fusionRecipe: { label: '월영 + 폭풍 공명', materials: [{ label: '월영 속성 유닛 1장', element: 'lunar' }, { label: '폭풍 속성 유닛 1장', element: 'storm' }] }, onSummon: { kind: 'heal_core', amount: 5 }, target: 'none', text: '공명 융합. 소환 시 내 코어를 5 회복.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_12', name: '심록 포식화', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'verdant', cost: 6, attack: 8, health: 6, keywords: ['lifesteal'], summonMode: 'fusion', fusionRecipe: { label: '세계수 + 공허 공명', materials: [{ label: '세계수 속성 유닛 1장', element: 'verdant' }, { label: '공허 속성 유닛 1장', element: 'void' }] }, onSummon: { kind: 'gain_energy', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 이번 턴 에너지 2 회복.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_13', name: '은정 기계성녀', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'legendary', element: 'neutral', cost: 7, attack: 8, health: 9, keywords: ['pierce', 'pierce'], summonMode: 'fusion', fusionRecipe: { label: '성철 + 월영 공명', materials: [{ label: '성철 속성 유닛 1장', element: 'neutral' }, { label: '월영 속성 유닛 1장', element: 'lunar' }] }, onSummon: { kind: 'aoe_enemy', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 모든 적 유닛에 2 피해.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_14', name: '태양성철 황제', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'solar', cost: 6, attack: 7, health: 8, keywords: ['guard'], summonMode: 'fusion', fusionRecipe: { label: '태양 + 성철 공명', materials: [{ label: '태양 속성 유닛 1장', element: 'solar' }, { label: '성철 속성 유닛 1장', element: 'neutral' }] }, onSummon: { kind: 'draw', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 카드 2장을 뽑습니다.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_15', name: '폭허 차원수', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'storm', cost: 6, attack: 8, health: 6, keywords: ['charge'], summonMode: 'fusion', fusionRecipe: { label: '폭풍 + 공허 공명', materials: [{ label: '폭풍 속성 유닛 1장', element: 'storm' }, { label: '공허 속성 유닛 1장', element: 'void' }] }, onSummon: { kind: 'heal_core', amount: 5 }, target: 'none', text: '공명 융합. 소환 시 내 코어를 5 회복.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_16', name: '월림 꿈결현자', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'lunar', cost: 6, attack: 6, health: 7, keywords: ['lifesteal'], summonMode: 'fusion', fusionRecipe: { label: '월영 + 세계수 공명', materials: [{ label: '월영 속성 유닛 1장', element: 'lunar' }, { label: '세계수 속성 유닛 1장', element: 'verdant' }] }, onSummon: { kind: 'gain_energy', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 이번 턴 에너지 2 회복.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_17', name: '결정심연 집행자', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'legendary', element: 'neutral', cost: 7, attack: 9, health: 10, keywords: ['pierce', 'pierce'], summonMode: 'fusion', fusionRecipe: { label: '성철 + 공허 공명', materials: [{ label: '성철 속성 유닛 1장', element: 'neutral' }, { label: '공허 속성 유닛 1장', element: 'void' }] }, onSummon: { kind: 'aoe_enemy', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 모든 적 유닛에 2 피해.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_18', name: '일식 공명황', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'solar', cost: 6, attack: 8, health: 6, keywords: ['guard'], summonMode: 'fusion', fusionRecipe: { label: '태양 + 공허 공명', materials: [{ label: '태양 속성 유닛 1장', element: 'solar' }, { label: '공허 속성 유닛 1장', element: 'void' }] }, onSummon: { kind: 'draw', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 카드 2장을 뽑습니다.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_19', name: '뇌월 천공세라프', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'epic', element: 'storm', cost: 6, attack: 6, health: 7, keywords: ['charge'], summonMode: 'fusion', fusionRecipe: { label: '폭풍 + 월영 공명', materials: [{ label: '폭풍 속성 유닛 1장', element: 'storm' }, { label: '월영 속성 유닛 1장', element: 'lunar' }] }, onSummon: { kind: 'heal_core', amount: 5 }, target: 'none', text: '공명 융합. 소환 시 내 코어를 5 회복.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'fusion_v8_20', name: '녹광 태양신수', subtitle: '두 속성이 하나의 이름으로 합쳐진 궁극의 공명체', kind: 'fusion', rarity: 'legendary', element: 'verdant', cost: 7, attack: 9, health: 10, keywords: ['lifesteal', 'guard'], summonMode: 'fusion', fusionRecipe: { label: '세계수 + 태양 공명', materials: [{ label: '세계수 속성 유닛 1장', element: 'verdant' }, { label: '태양 속성 유닛 1장', element: 'solar' }] }, onSummon: { kind: 'gain_energy', amount: 2 }, target: 'none', text: '공명 융합. 소환 시 이번 턴 에너지 2 회복.', flavor: '서로 거부하던 두 힘이 완벽한 한순간에 겹쳐 탄생한 존재.', sigil: '☯', series: '일식 공명단' },
  { id: 'evolution_v8_01', name: '태양계승 성검기사 황', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'solar', cost: 5, attack: 7, health: 8, keywords: ['guard'], summonMode: 'evolution', evolutionRecipe: { label: '성검기사 계승', fromIds: ['unit_v8_solar_01'] }, onSummon: { kind: 'aoe_enemy', amount: 1 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 모든 적 유닛에 1 피해.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_02', name: '월영계승 몽환사제 오버로드', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'lunar', cost: 5, attack: 8, health: 7, keywords: ['charge'], summonMode: 'evolution', evolutionRecipe: { label: '몽환사제 계승', fromIds: ['unit_v8_lunar_02'] }, onSummon: { kind: 'shield_unit', amount: 3 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 아군 유닛 하나에게 보호막 3.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_03', name: '폭풍계승 폭풍매 아크', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'storm', cost: 5, attack: 7, health: 8, keywords: ['lifesteal'], summonMode: 'evolution', evolutionRecipe: { label: '폭풍매 계승', fromIds: ['unit_v8_storm_03'] }, onSummon: { kind: 'damage_core', amount: 2 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 상대 코어에 2 피해.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_04', name: '세계수계승 덩굴사냥꾼 프라임', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'verdant', cost: 5, attack: 8, health: 7, keywords: ['pierce'], summonMode: 'evolution', evolutionRecipe: { label: '덩굴사냥꾼 계승', fromIds: ['unit_v8_verdant_04'] }, onSummon: { kind: 'heal_core', amount: 4 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 내 코어를 4 회복.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_05', name: '공허계승 식성포식자 레퀴엠', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'void', cost: 5, attack: 7, health: 8, keywords: ['guard'], summonMode: 'evolution', evolutionRecipe: { label: '식성포식자 계승', fromIds: ['unit_v8_void_05'] }, onSummon: { kind: 'aoe_enemy', amount: 1 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 모든 적 유닛에 1 피해.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_06', name: '성철계승 백금수호자 이터널', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'legendary', element: 'neutral', cost: 7, attack: 10, health: 9, keywords: ['charge'], summonMode: 'evolution', evolutionRecipe: { label: '백금수호자 계승', fromIds: ['unit_v8_neutral_06'] }, onSummon: { kind: 'shield_unit', amount: 3 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 아군 유닛 하나에게 보호막 3.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_07', name: '태양계승 화염용 노바', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'solar', cost: 5, attack: 7, health: 8, keywords: ['lifesteal'], summonMode: 'evolution', evolutionRecipe: { label: '화염용 계승', fromIds: ['unit_v8_solar_07'] }, onSummon: { kind: 'damage_core', amount: 2 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 상대 코어에 2 피해.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_08', name: '월영계승 월식사냥꾼 제로', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'lunar', cost: 5, attack: 8, health: 7, keywords: ['pierce'], summonMode: 'evolution', evolutionRecipe: { label: '월식사냥꾼 계승', fromIds: ['unit_v8_lunar_08'] }, onSummon: { kind: 'heal_core', amount: 4 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 내 코어를 4 회복.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_09', name: '폭풍계승 전류포병 황', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'storm', cost: 5, attack: 7, health: 8, keywords: ['guard'], summonMode: 'evolution', evolutionRecipe: { label: '전류포병 계승', fromIds: ['unit_v8_storm_09'] }, onSummon: { kind: 'aoe_enemy', amount: 1 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 모든 적 유닛에 1 피해.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_10', name: '세계수계승 뿌리거인 오버로드', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'verdant', cost: 5, attack: 8, health: 7, keywords: ['charge'], summonMode: 'evolution', evolutionRecipe: { label: '뿌리거인 계승', fromIds: ['unit_v8_verdant_10'] }, onSummon: { kind: 'shield_unit', amount: 3 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 아군 유닛 하나에게 보호막 3.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_11', name: '공허계승 소멸기수 아크', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'void', cost: 5, attack: 7, health: 8, keywords: ['lifesteal'], summonMode: 'evolution', evolutionRecipe: { label: '소멸기수 계승', fromIds: ['unit_v8_void_11'] }, onSummon: { kind: 'damage_core', amount: 2 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 상대 코어에 2 피해.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_12', name: '성철계승 프리즘무희 프라임', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'legendary', element: 'neutral', cost: 7, attack: 10, health: 9, keywords: ['pierce'], summonMode: 'evolution', evolutionRecipe: { label: '프리즘무희 계승', fromIds: ['unit_v8_neutral_12'] }, onSummon: { kind: 'heal_core', amount: 4 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 내 코어를 4 회복.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_13', name: '태양계승 홍련늑대 레퀴엠', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'solar', cost: 5, attack: 7, health: 8, keywords: ['guard'], summonMode: 'evolution', evolutionRecipe: { label: '홍련늑대 계승', fromIds: ['unit_v8_solar_13'] }, onSummon: { kind: 'aoe_enemy', amount: 1 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 모든 적 유닛에 1 피해.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_14', name: '월영계승 월궁수호자 이터널', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'lunar', cost: 5, attack: 8, health: 7, keywords: ['charge'], summonMode: 'evolution', evolutionRecipe: { label: '월궁수호자 계승', fromIds: ['unit_v8_lunar_14'] }, onSummon: { kind: 'shield_unit', amount: 3 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 아군 유닛 하나에게 보호막 3.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_15', name: '폭풍계승 폭뢰대장 노바', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'storm', cost: 5, attack: 7, health: 8, keywords: ['lifesteal'], summonMode: 'evolution', evolutionRecipe: { label: '폭뢰대장 계승', fromIds: ['unit_v8_storm_15'] }, onSummon: { kind: 'damage_core', amount: 2 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 상대 코어에 2 피해.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_16', name: '세계수계승 새싹전사 제로', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'verdant', cost: 5, attack: 8, health: 7, keywords: ['pierce'], summonMode: 'evolution', evolutionRecipe: { label: '새싹전사 계승', fromIds: ['unit_v8_verdant_16'] }, onSummon: { kind: 'heal_core', amount: 4 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 내 코어를 4 회복.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_17', name: '공허계승 균열정령 황', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'void', cost: 5, attack: 7, health: 8, keywords: ['guard'], summonMode: 'evolution', evolutionRecipe: { label: '균열정령 계승', fromIds: ['unit_v8_void_17'] }, onSummon: { kind: 'aoe_enemy', amount: 1 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 모든 적 유닛에 1 피해.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_18', name: '성철계승 결정정령 오버로드', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'legendary', element: 'neutral', cost: 7, attack: 10, health: 9, keywords: ['charge'], summonMode: 'evolution', evolutionRecipe: { label: '결정정령 계승', fromIds: ['unit_v8_neutral_18'] }, onSummon: { kind: 'shield_unit', amount: 3 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 아군 유닛 하나에게 보호막 3.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_19', name: '태양계승 화관수호수 아크', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'epic', element: 'solar', cost: 5, attack: 7, health: 8, keywords: ['lifesteal'], summonMode: 'evolution', evolutionRecipe: { label: '화관수호수 계승', fromIds: ['unit_v8_solar_19'] }, onSummon: { kind: 'damage_core', amount: 2 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 상대 코어에 2 피해.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
  { id: 'evolution_v8_20', name: '월영계승 꿈의기록자 프라임', subtitle: '전장의 기억을 이어받아 한계를 넘어선 계승체', kind: 'evolution', rarity: 'legendary', element: 'lunar', cost: 7, attack: 10, health: 9, keywords: ['pierce'], summonMode: 'evolution', evolutionRecipe: { label: '꿈의기록자 계승', fromIds: ['unit_v8_lunar_20'] }, onSummon: { kind: 'heal_core', amount: 4 }, target: 'none', text: '계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 내 코어를 4 회복.', flavor: '진화는 새로운 존재가 되는 일이 아니라, 축적된 전투의 기억을 완성하는 일이다.', sigil: '✧', series: '계승자 연대기' },
];

// v8 확장 카드의 서사 문구를 카드별로 구분해 대량 생성 느낌을 줄이고,
// 룰 텍스트와 실제 엔진 판정을 일치시킵니다. 게임 밸런스 수치는 변경하지 않습니다.
const V8_SUBTITLE_BY_ELEMENT: Record<Element, string[]> = {
  solar: ['첫 빛을 가르는 선봉', '백열의 궤적을 남기는 자', '황혼까지 꺼지지 않는 맹세', '성화의 끝에서 선 결투가', '태양문을 지키는 마지막 검'],
  lunar: ['은빛 장막을 걷는 자', '꿈과 현실의 경계를 읽는 눈', '월식 아래 맺은 조용한 서약', '달그림자에 숨은 두 번째 칼날', '별이 지기 전 돌아오는 파수꾼'],
  storm: ['천둥보다 먼저 도착한 창끝', '폭풍의 심장을 겨눈 추적자', '번개가 새긴 전선의 좌표', '구름벽을 찢는 돌격 신호', '정전 뒤에도 남는 푸른 잔광'],
  verdant: ['뿌리 아래 잠든 맹세의 수호자', '새순과 고목을 잇는 전령', '세계수의 맥박을 듣는 자', '흙먼지 속에서 다시 선 방벽', '계절을 넘어 전장을 기억하는 씨앗'],
  void: ['균열 가장자리에서 돌아온 자', '빛이 닿지 않는 좌표의 사냥꾼', '심연의 침묵을 무기로 삼는 자', '공백 너머의 흔적을 추적하는 눈', '소멸 직전에 남은 마지막 의지'],
  neutral: ['결정 회로로 새긴 전술 규율', '성철 장갑에 봉인된 명령', '오차 없는 궤도를 걷는 집행자', '프리즘 코어가 선택한 수호기', '금속성 새벽을 여는 전진 신호'],
};

const V8_KIND_SUBTITLE: Record<CardKind, string[]> = {
  unit: ['전선 기록', '결투 기록', '수호 기록', '원정 기록'],
  spell: ['전술식', '공명식', '전장 술식', '비전식'],
  trap: ['역전식', '매복식', '봉쇄식', '반격식'],
  fusion: ['서로 다른 궤도의 완전 공명', '두 힘이 하나의 이름을 얻은 순간', '상극을 넘어선 공명체', '경계를 접어 만든 합일의 형상'],
  evolution: ['축적된 전투가 완성한 다음 형태', '기억을 갑옷으로 바꾼 계승체', '한계를 넘어 이어진 전장의 의지', '이전의 상처까지 힘으로 삼은 계승'],
};

const V8_LORE_BY_ELEMENT: Record<Element, string[]> = {
  solar: ['여명 전선의 기록에는 승리보다 먼저 버틴 이름이 적힌다.', '태양은 편을 들지 않는다. 끝까지 서 있는 자를 비출 뿐이다.', '불꽃이 작아질수록 기사단은 검을 더 높이 들었다.'],
  lunar: ['월영의 기록관은 꿈에서 본 경로도 전술 지도에 남긴다.', '달빛은 감추는 빛이다. 보이지 않는 움직임이 전황을 바꾼다.', '침묵은 후퇴가 아니라 다음 한 수를 숨기는 방식이었다.'],
  storm: ['천뢰 부대는 번개보다 빠른 판단만을 전술이라 불렀다.', '폭풍은 길을 만들지 않는다. 돌파한 자의 궤적이 길이 된다.', '한 번의 섬광 뒤에 남는 것은 속도가 아니라 정확한 결단이다.'],
  verdant: ['세계수 군단은 쓰러진 자리에서 다음 방어선을 자라게 했다.', '뿌리는 움직이지 않지만 전장의 모든 진동을 먼저 기억한다.', '생명은 약해서 버티는 것이 아니라, 다시 자랄 방법을 알기에 강하다.'],
  void: ['심연 부대의 지도에는 존재하지 않는 길이 가장 많이 표시돼 있다.', '공허는 비어 있지 않다. 사라진 것들의 방향이 그 안에 남아 있다.', '균열을 오래 바라본 자는 적보다 먼저 자신의 그림자를 경계한다.'],
  neutral: ['성철 기동군은 감정 대신 기록으로 실패를 반복하지 않았다.', '완벽한 기계는 없다. 그래서 그들은 오차까지 전술에 포함했다.', '결정 회로가 빛날 때마다 오래된 명령 하나가 새 전장에 맞게 고쳐졌다.'],
};

for (const card of CARDS) {
  if (card.keywords) card.keywords = Array.from(new Set(card.keywords));

  if (card.trapTrigger === 'direct_attack' && card.trapEffect?.kind === 'negate_and_damage') {
    card.text = `상대가 코어를 직접 공격할 때, 그 공격을 무효화하고 공격 유닛에 ${card.trapEffect.amount} 피해.`;
  }

  if (!card.id.includes('_v8_')) continue;
  const numericPart = Number(card.id.match(/(\d+)$/)?.[1] ?? 1);
  const elementLines = V8_SUBTITLE_BY_ELEMENT[card.element];
  const kindLines = V8_KIND_SUBTITLE[card.kind];
  if (card.kind === 'fusion' || card.kind === 'evolution') {
    card.subtitle = `${kindLines[(numericPart - 1) % kindLines.length]} · ${String(numericPart).padStart(2, '0')}`;
  } else {
    card.subtitle = `${elementLines[(numericPart - 1) % elementLines.length]} · ${kindLines[(numericPart - 1) % kindLines.length]}`;
  }

  const lore = V8_LORE_BY_ELEMENT[card.element][(numericPart - 1) % V8_LORE_BY_ELEMENT[card.element].length];
  if (card.kind === 'fusion') {
    card.flavor = `“${card.name}.” 공명 관측소는 두 파장이 완전히 겹친 그 순간에만 이 이름을 사용했다.`;
  } else if (card.kind === 'evolution') {
    card.flavor = `${card.name}은(는) 이전 형태의 전투 기록을 버리지 않았다. 상처와 승리 모두가 다음 형태의 설계도가 되었다.`;
  } else {
    card.flavor = `${lore} — ${card.name}, 현장 기록.`;
  }
}

// 기존 카드도 같은 속성의 공통 연출만 반복하지 않도록 카드별 시그니처 조합을 부여합니다.
// 신규 승격 카드가 직접 정의한 vfx는 아래 값보다 우선 유지됩니다.
const SIGNATURE_VFX: Partial<Record<string, CardVfxProfile>> = {
  unit_ember_squire: { summon: 'sunburst-seal', attack: 'solar-slash', defense: 'aegis-flare', destroy: 'ember-fall' },
  unit_rift_hound: { summon: 'rift-tear', attack: 'rift-rend', defense: 'phase-hide', destroy: 'void-fracture' },
  unit_iron_bastion: { summon: 'citadel-ascend', attack: 'iron-impact', defense: 'royal-rampart', destroy: 'fortress-fall' },
  unit_celestial_archer: { summon: 'dawn-pillar', attack: 'solar-cross', defense: 'aegis-flare', destroy: 'ember-fall' },
  unit_verdant_sage: { summon: 'bloom-circle', attack: 'vine-whip', defense: 'root-shell', destroy: 'petal-dissolve' },
  unit_tide_medic: { summon: 'moon-ripple', attack: 'crescent-cut', defense: 'mirror-moon', destroy: 'moon-dust' },
  unit_storm_lancer: { summon: 'storm-drop', attack: 'lightning-lance', defense: 'static-shell', destroy: 'spark-disperse' },
  unit_moon_priest: { summon: 'lunar-script', attack: 'crescent-cut', defense: 'mirror-moon', destroy: 'moon-shatter' },
  unit_ashen_duelist: { summon: 'ember-fall', attack: 'solar-slash', defense: 'sunburst-seal', destroy: 'ash-rebirth' },
  unit_crystal_warden: { summon: 'crystal-forge', attack: 'prism-break', defense: 'hex-bastion', destroy: 'prism-break' },
  unit_void_reaper: { summon: 'grave-bloom', attack: 'void-lunge', defense: 'shadow-phase', destroy: 'void-vortex' },
  unit_nova_golem: { summon: 'dawn-pillar', attack: 'sovereign-hammer', defense: 'aegis-flare', destroy: 'ember-fall' },
  unit_timeweaver: { summon: 'moon-ripple', attack: 'lunar-script', defense: 'phase-hide', destroy: 'moon-dust' },
  unit_oracle_glass: { summon: 'prism-script', attack: 'crystal-forge', defense: 'mirror-moon', destroy: 'prism-break' },
  unit_eclipse_dragon: { summon: 'eclipse-convergence', attack: 'eclipse-maw', defense: 'umbra-corona', destroy: 'eclipse-collapse' },
  unit_phoenix_knight: { summon: 'phoenix-ascend', attack: 'phoenix-dive', defense: 'rebirth-wings', destroy: 'ash-rebirth' },
  unit_tempest_queen: { summon: 'magnet-storm', attack: 'metal-thunder', defense: 'static-shell', destroy: 'spark-disperse' },
  unit_crownless_titan: { summon: 'citadel-ascend', attack: 'sovereign-hammer', defense: 'royal-rampart', destroy: 'fortress-fall' },
  unit_star_devourer: { summon: 'void-vortex', attack: 'eclipse-maw', defense: 'umbra-corona', destroy: 'eclipse-collapse' },
  unit_dawn_seraph: { summon: 'dawn-pillar', attack: 'solar-cross', defense: 'rebirth-wings', destroy: 'moon-dust' },

  spell_spark_bolt: { activation: 'thunder-glyph' },
  spell_battle_hymn: { activation: 'sunburst-seal' },
  spell_mending_light: { activation: 'moon-ripple' },
  spell_astral_insight: { activation: 'prism-script' },
  spell_void_lance: { activation: 'rift-rend' },
  spell_overgrowth: { activation: 'bloom-circle' },
  spell_chain_lightning: { activation: 'magnet-storm' },
  spell_cleanse: { activation: 'moon-shatter' },
  spell_supernova: { activation: 'solar-cross' },
  spell_rebirth_seed: { activation: 'worldroot-rise' },

  trap_mirror_veil: { activation: 'mirror-moon', destroy: 'moon-shatter' },
  trap_thorn_snare: { activation: 'vine-whip', destroy: 'petal-dissolve' },
  trap_counter_sigil: { activation: 'prism-script', destroy: 'prism-break' },
  trap_ambush: { activation: 'shadow-phase', destroy: 'void-fracture' },
  trap_last_stand: { activation: 'aegis-flare', destroy: 'ember-fall' },
  trap_storm_prison: { activation: 'static-shell', destroy: 'spark-disperse' },
  trap_null_horizon: { activation: 'void-vortex', destroy: 'eclipse-collapse' },
  trap_crystal_reversal: { activation: 'crystal-forge', destroy: 'prism-break' },
  trap_blooming_guard: { activation: 'root-shell', destroy: 'petal-dissolve' },
  trap_solar_rebuke: { activation: 'solar-cross', destroy: 'ember-fall' },
};

for (const card of CARDS) {
  const signature = SIGNATURE_VFX[card.id];
  if (signature) card.vfx = { ...signature, ...card.vfx };
}

export const CARD_BY_ID: Record<string, CardDefinition> = Object.fromEntries(CARDS.map((card) => [card.id, card]));

export const STARTER_DECK: string[] = [
  'unit_ember_squire', 'unit_ember_squire',
  'unit_rift_hound', 'unit_rift_hound',
  'unit_iron_bastion', 'unit_iron_bastion',
  'unit_celestial_archer', 'unit_celestial_archer',
  'unit_verdant_sage', 'unit_verdant_sage',
  'unit_tide_medic', 'unit_tide_medic',
  'unit_storm_lancer', 'unit_storm_lancer',
  'unit_moon_priest', 'unit_crystal_warden',
  'unit_rift_wanderer', 'unit_lastlight_vanguard',
  'spell_spark_bolt', 'spell_spark_bolt',
  'spell_battle_hymn', 'spell_battle_hymn',
  'spell_mending_light', 'spell_astral_insight', 'spell_void_lance',
  'trap_mirror_veil', 'trap_thorn_snare', 'trap_counter_sigil',
  'trap_blooming_guard', 'trap_ancestral_denial',
];

export const STARTER_EXTRA_DECK: string[] = [
  'fusion_eclipse_chimera',
  'fusion_tempest_colossus',
  'fusion_worldroot_hydra',
  'evolution_ember_phoenix',
  'evolution_iron_sovereign',
  'evolution_rift_alpha',
];

export const ASCENSION_STARTER_GRANTS: Record<string, number> = {
  unit_rift_wanderer: 1,
  unit_lastlight_vanguard: 1,
  unit_tempest_interceptor: 1,
  unit_gravebloom_medium: 1,
  fusion_eclipse_chimera: 1,
  fusion_tempest_colossus: 1,
  fusion_worldroot_hydra: 1,
  evolution_ember_phoenix: 1,
  evolution_iron_sovereign: 1,
  evolution_rift_alpha: 1,
  trap_resonance_break: 1,
  trap_ancestral_denial: 1,
};

export const PACKS: PackDefinition[] = [
  { id: 'standard', name: '시작의 성운', tagline: '희귀 이상 1장 보장', price: 120, guaranteed: 'rare', accent: '#7b86ff', odds: { common: 55, rare: 29, epic: 13.5, legendary: 2.5, guaranteedSlots: 1 } },
  { id: 'elite', name: '결투가의 금고', tagline: '희귀 이상 2장 보장', price: 360, guaranteed: 'rare', accent: '#dfb35f', odds: { common: 55, rare: 29, epic: 13.5, legendary: 2.5, guaranteedSlots: 2 } },
  { id: 'solar_pickup', name: '태양의 계시', tagline: '태양 카드 확률 상승 · 영웅 이상 1장 보장', price: 650, guaranteed: 'epic', pickupElement: 'solar', accent: '#ff845c', odds: { common: 55, rare: 29, epic: 13.5, legendary: 2.5, guaranteedSlots: 1, pickupRate: 60 } },
  { id: 'void_pickup', name: '공허의 속삭임', tagline: '공허 카드 확률 상승 · 영웅 이상 1장 보장', price: 650, guaranteed: 'epic', pickupElement: 'void', accent: '#9c6cff', odds: { common: 55, rare: 29, epic: 13.5, legendary: 2.5, guaranteedSlots: 1, pickupRate: 60 } },
  { id: 'mythic', name: '왕실 비전', tagline: '영웅 이상 2장 보장 · 전설 확률 상승', price: 950, guaranteed: 'epic', accent: '#f4d683', odds: { common: 55, rare: 29, epic: 9.5, legendary: 6.5, guaranteedSlots: 2 } },
  { id: 'ascension', name: '승격의 문', tagline: '균열·융합·진화 카드 확률 상승', price: 720, guaranteed: 'epic', accent: '#7d5cff', odds: { common: 55, rare: 29, epic: 13.5, legendary: 2.5, guaranteedSlots: 1, ascensionRate: 72 } },
  { id: 'lunar_pickup', name: '은월의 회랑', tagline: '달 카드 확률 상승 · 영웅 이상 1장 보장', price: 650, guaranteed: 'epic', pickupElement: 'lunar', accent: '#9fb7ff', odds: { common: 55, rare: 29, epic: 13.5, legendary: 2.5, guaranteedSlots: 1, pickupRate: 60 } },
  { id: 'storm_pickup', name: '천뢰 전선', tagline: '폭풍 카드 확률 상승 · 영웅 이상 1장 보장', price: 650, guaranteed: 'epic', pickupElement: 'storm', accent: '#62d9ff', odds: { common: 55, rare: 29, epic: 13.5, legendary: 2.5, guaranteedSlots: 1, pickupRate: 60 } },
  { id: 'verdant_pickup', name: '세계수의 맥동', tagline: '대지 카드 확률 상승 · 영웅 이상 1장 보장', price: 650, guaranteed: 'epic', pickupElement: 'verdant', accent: '#72d394', odds: { common: 55, rare: 29, epic: 13.5, legendary: 2.5, guaranteedSlots: 1, pickupRate: 60 } },
  { id: 'neutral_pickup', name: '성철 기동고', tagline: '중립 카드 확률 상승 · 영웅 이상 1장 보장', price: 650, guaranteed: 'epic', pickupElement: 'neutral', accent: '#c4d0df', odds: { common: 55, rare: 29, epic: 13.5, legendary: 2.5, guaranteedSlots: 1, pickupRate: 60 } },
  { id: 'archive', name: '일식 대기록고', tagline: '전 속성 · 영웅 이상 2장 · 전설 확률 대폭 상승', price: 1250, guaranteed: 'epic', accent: '#f3c96b', odds: { common: 55, rare: 29, epic: 6, legendary: 10, guaranteedSlots: 2 } },
  { id: 'genesis', name: '공명 창세팩', tagline: '융합·진화·균열 집중 · 영웅 이상 2장', price: 1100, guaranteed: 'epic', accent: '#bd7cff', odds: { common: 55, rare: 29, epic: 9, legendary: 7, guaranteedSlots: 2, ascensionRate: 72 } },
];

export const DECK_SIZE = 30;
export const EXTRA_DECK_SIZE = 6;
export const MAX_COPIES: Record<Rarity, number> = {
  common: 3,
  rare: 3,
  epic: 2,
  legendary: 1,
};

export function isExtraDeckCard(card: CardDefinition | undefined): card is CardDefinition & { kind: ExtraDeckKind } {
  return Boolean(card && (card.kind === 'fusion' || card.kind === 'evolution'));
}

export function isUnitCard(card: CardDefinition | undefined): boolean {
  return Boolean(card && (card.kind === 'unit' || card.kind === 'fusion' || card.kind === 'evolution'));
}

export function countCards(cardIds: string[]): Record<string, number> {
  return cardIds.reduce<Record<string, number>>((acc, cardId) => {
    acc[cardId] = (acc[cardId] ?? 0) + 1;
    return acc;
  }, {});
}

export function starterCollection(): Record<string, number> {
  const counts = countCards([...STARTER_DECK, ...STARTER_EXTRA_DECK]);
  for (const [cardId, quantity] of Object.entries(ASCENSION_STARTER_GRANTS)) {
    counts[cardId] = Math.max(counts[cardId] ?? 0, quantity);
  }
  for (const card of CARDS.filter((item) => item.rarity === 'common').slice(0, 8)) {
    counts[card.id] = Math.max(counts[card.id] ?? 0, 2);
  }
  return counts;
}

export function validateDeck(cardIds: string[], collection?: Record<string, number>): string | null {
  if (cardIds.length !== DECK_SIZE) return `메인 덱은 정확히 ${DECK_SIZE}장이어야 합니다.`;
  const counts = countCards(cardIds);
  let unitCount = 0;
  let spellCount = 0;
  let trapCount = 0;

  for (const [cardId, quantity] of Object.entries(counts)) {
    const card = CARD_BY_ID[cardId];
    if (!card) return `존재하지 않는 카드가 포함되어 있습니다: ${cardId}`;
    if (isExtraDeckCard(card)) return `${card.name}은(는) 엑스트라 덱에 넣어야 합니다.`;
    if (quantity > MAX_COPIES[card.rarity]) return `${card.name}은(는) 최대 ${MAX_COPIES[card.rarity]}장까지 넣을 수 있습니다.`;
    if (collection && quantity > (collection[cardId] ?? 0)) return `${card.name}의 보유 수량이 부족합니다.`;
    if (card.kind === 'unit') unitCount += quantity;
    if (card.kind === 'spell') spellCount += quantity;
    if (card.kind === 'trap') trapCount += quantity;
  }

  if (unitCount < 15) return '유닛 카드는 최소 15장 필요합니다.';
  if (spellCount > 10) return '주문 카드는 최대 10장까지 넣을 수 있습니다.';
  if (trapCount > 8) return '함정 카드는 최대 8장까지 넣을 수 있습니다.';
  return null;
}

export function validateExtraDeck(cardIds: string[], collection?: Record<string, number>): string | null {
  if (cardIds.length !== EXTRA_DECK_SIZE) return `엑스트라 덱은 정확히 ${EXTRA_DECK_SIZE}장이어야 합니다.`;
  const counts = countCards(cardIds);
  for (const [cardId, quantity] of Object.entries(counts)) {
    const card = CARD_BY_ID[cardId];
    if (!card) return `존재하지 않는 엑스트라 카드가 포함되어 있습니다: ${cardId}`;
    if (!isExtraDeckCard(card)) return `${card.name}은(는) 메인 덱에 넣어야 합니다.`;
    if (quantity > MAX_COPIES[card.rarity]) return `${card.name}은(는) 엑스트라 덱에 최대 ${MAX_COPIES[card.rarity]}장까지 넣을 수 있습니다.`;
    if (collection && quantity > (collection[cardId] ?? 0)) return `${card.name}의 보유 수량이 부족합니다.`;
  }
  return null;
}

const ELEMENT_VFX: Record<Element, CardVfxProfile> = {
  solar: { summon: 'dawn-pillar', attack: 'solar-slash', defense: 'aegis-flare', activation: 'sunburst-seal', destroy: 'ember-fall' },
  lunar: { summon: 'moon-ripple', attack: 'crescent-cut', defense: 'mirror-moon', activation: 'lunar-script', destroy: 'moon-dust' },
  storm: { summon: 'storm-drop', attack: 'lightning-lance', defense: 'static-shell', activation: 'thunder-glyph', destroy: 'spark-disperse' },
  verdant: { summon: 'worldroot-rise', attack: 'vine-whip', defense: 'root-shell', activation: 'bloom-circle', destroy: 'petal-dissolve' },
  void: { summon: 'rift-tear', attack: 'void-lunge', defense: 'shadow-phase', activation: 'void-vortex', destroy: 'void-fracture' },
  neutral: { summon: 'crystal-forge', attack: 'iron-impact', defense: 'hex-bastion', activation: 'prism-script', destroy: 'prism-break' },
};

export function resolveCardVfx(card: CardDefinition | undefined, moment: VfxMoment): string {
  if (!card) return moment === 'attack' ? 'iron-impact' : 'prism-script';
  return card.vfx?.[moment] || ELEMENT_VFX[card.element][moment] || 'prism-script';
}

export function randomId(prefix = 'card'): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    : Math.random().toString(36).slice(2, 14);
  return `${prefix}_${random}_${Date.now().toString(36)}`;
}
