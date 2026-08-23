export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CardKind = 'unit' | 'spell' | 'trap' | 'fusion' | 'evolution';
export type MainDeckKind = 'unit' | 'spell' | 'trap';
export type ExtraDeckKind = 'fusion' | 'evolution';
export type Element = 'solar' | 'lunar' | 'storm' | 'verdant' | 'void' | 'neutral';
export type Keyword = 'guard' | 'charge' | 'lifesteal' | 'pierce' | 'corestrike';
export type SummonMode = 'normal' | 'rift' | 'fusion' | 'evolution';
export type VfxMoment = 'summon' | 'attack' | 'defense' | 'activation' | 'destroy';
export type SeriesId = 'luminaknights' | 'kaisergear' | 'eclipsion' | 'nocturne' | 'arborian' | 'tempest_drive' | 'abyss_reaper' | 'primal_guardian' | 'chronorium' | 'arcana_protocol' | 'beastforge' | 'phantom_carnival' | 'astral_armada';

export type SeriesAbility =
  | { kind: 'search_series'; amount: number }
  | { kind: 'buff_series'; attack: number; health: number }
  | { kind: 'shield_series'; amount: number }
  | { kind: 'heal_per_series'; amount: number; cap: number }
  | { kind: 'damage_core_per_series'; amount: number; cap: number }
  | { kind: 'gain_energy_if_series'; amount: number; minimumAllies?: number }
  | { kind: 'recover_series'; amount: number };


export type SeriesTacticalPassive =
  | 'lumina_rally' | 'lumina_cover' | 'lumina_combo' | 'lumina_victory'
  | 'kaiser_armor' | 'kaiser_thruster' | 'kaiser_salvage' | 'kaiser_emergency'
  | 'eclipse_gloom' | 'eclipse_graveblade' | 'eclipse_feast' | 'eclipse_afterimage'
  | 'nocturne_veil' | 'nocturne_moonreturn' | 'nocturne_dreamdraw' | 'nocturne_fade'
  | 'arborian_pulse' | 'arborian_root' | 'arborian_sap' | 'arborian_seedfall'
  | 'tempest_afterburner' | 'tempest_overcurrent' | 'tempest_recharge' | 'tempest_residual'
  | 'abyss_devour_echo' | 'abyss_grave_armor' | 'abyss_void_edge' | 'abyss_last_curse'
  | 'primal_packguard' | 'primal_alpha' | 'primal_hunt' | 'primal_spirit_guard'
  | 'chrono_priority' | 'chrono_accel_strike' | 'chrono_forecast' | 'chrono_restore'
  | 'arcana_rewrite' | 'arcana_conduit' | 'arcana_runeblade' | 'arcana_sealburst'
  | 'beast_plating_passive' | 'beast_alloy_strike' | 'beast_predatory_repair' | 'beast_legacy'
  | 'phantom_backstage' | 'phantom_ambush' | 'phantom_encore_passive' | 'phantom_smoke'
  | 'astral_formation_wall' | 'astral_photon_thrust' | 'astral_supply' | 'astral_lastship';

export type SeriesSignature =
  | 'lumina_beacon' | 'lumina_reinforce' | 'lumina_united' | 'lumina_finisher'
  | 'kaiser_repair' | 'kaiser_battery' | 'kaiser_overdrive' | 'kaiser_fortress'
  | 'eclipse_echo' | 'eclipse_devour' | 'eclipse_rebirth' | 'eclipse_resonance'
  | 'nocturne_moonheal' | 'nocturne_illusion' | 'nocturne_dreamsearch' | 'nocturne_mirrorveil'
  | 'arborian_seed' | 'arborian_growth' | 'arborian_regrowth' | 'arborian_bloom'
  | 'tempest_afterburn' | 'tempest_voltage' | 'tempest_chainbolt' | 'tempest_momentum'
  | 'abyss_feast' | 'abyss_harvest' | 'abyss_execute' | 'abyss_drain'
  | 'primal_spirit' | 'primal_pack' | 'primal_shelter' | 'primal_vitality'
  | 'chrono_accelerate' | 'chrono_rewind' | 'chrono_foresee' | 'chrono_reset'
  | 'arcana_inscribe' | 'arcana_recycle' | 'arcana_chain' | 'arcana_hex'
  | 'beast_repair' | 'beast_plating' | 'beast_hunt' | 'beast_rage'
  | 'phantom_set' | 'phantom_encore' | 'phantom_misdirect' | 'phantom_applause'
  | 'astral_drone' | 'astral_salvo' | 'astral_recharge' | 'astral_formation';

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
  | { kind: 'summon_token'; attack: number; health: number; name: string }
  | { kind: 'steal_unit' }
  | { kind: 'revive_unit' }
  | { kind: 'mass_recall' }
  | { kind: 'invert_all_units' }
  | { kind: 'erase_opponent_grave'; amount: number; draw: number }
  | { kind: 'reweave_hand'; bonusDraw: number }
  | { kind: 'mirror_unit' }
  | { kind: 'exchange_hands' }
  | { kind: 'ready_unit' }
  | { kind: 'bounce_unit' }
  | { kind: 'heal_unit'; amount: number }
  | { kind: 'sacrifice_draw'; amount: number }
  | { kind: 'damage_draw_if_destroyed'; amount: number; draw: number }
  | { kind: 'recruit_unit'; maxCost: number }
  | { kind: 'recover_grave_unit'; amount: number }
  | { kind: 'draw_if_outnumbered'; base: number; bonus: number }
  | { kind: 'swap_stats' };

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
  | { kind: 'empty_board_and_graveyard_min'; value: number; label: string }
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

export interface ExtraSummonRule {
  tier: 'elite' | 'legendary' | 'apex';
  /** Extra field units consumed in addition to the printed fusion recipe / evolution source. */
  additionalTributes: number;
  /** Minimum printed cost for every additional tribute. */
  tributeMinCost: number;
  /** Minimum sum of printed costs across every consumed unit. */
  minTotalMaterialCost: number;
  /** Apex legends require at least one Epic/Legendary body among all consumed units. */
  requireHighRarityMaterial?: boolean;
  /** Series apex cards require one additional tribute from the same series. */
  requireSameSeriesTribute?: boolean;
  /** Extra global-turn gap added to the normal evolution survival requirement. */
  sourceExtraTurnGap?: number;
}

export interface ExtraChoice {
  id: string;
  label: string;
  description: string;
  effects: Effect[];
}

export interface CardSeriesDefinition {
  id: SeriesId;
  name: string;
  shortName: string;
  packName: string;
  tagline: string;
  mechanic: string;
  accent: string;
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
  extraSummonRule?: ExtraSummonRule;
  /** Shadowverse-style CHOOSE package used by premium legendary Extra Deck cards. */
  extraChoices?: ExtraChoice[];
  onSummon?: Effect;
  effect?: Effect;
  trapTrigger?: TrapTrigger;
  trapEffect?: Effect | { kind: 'negate' } | { kind: 'negate_and_damage'; amount: number };
  target: 'none' | 'enemy_unit' | 'friendly_unit' | 'enemy_core' | 'friendly_graveyard_unit';
  text: string;
  flavor: string;
  sigil: string;
  vfx?: CardVfxProfile;
  series?: string;
  seriesId?: SeriesId;
  seriesAbility?: SeriesAbility;
  /** One of four themed signature effects unique to this card series. */
  seriesSignature?: SeriesSignature;
  /** One of four unit passives unique to this series. */
  seriesTacticalPassive?: SeriesTacticalPassive;
}

export interface PackOdds {
  common: number;
  rare: number;
  epic: number;
  legendary: number;
  guaranteedSlots: number;
  pickupRate?: number;
  ascensionRate?: number;
  seriesRate?: number;
  seriesGuaranteedSlots?: number;
}

export interface PackDefinition {
  id: string;
  name: string;
  tagline: string;
  price: number;
  guaranteed: Rarity;
  pickupElement?: Element;
  seriesId?: SeriesId;
  category?: 'core' | 'series';
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

export const CARD_SERIES: CardSeriesDefinition[] = [
  { id: 'luminaknights', name: '성휘전대 루미나이츠', shortName: '루미나이츠', packName: '성휘전대 루미나이츠', tagline: '전개와 연속 소환으로 전장을 장악하는 영웅 전대 시리즈', mechanic: '연계 소환 · 전개 강화', accent: '#ffbf6b' },
  { id: 'kaisergear', name: '황제기갑 카이저기어', shortName: '카이저기어', packName: '황제기갑 카이저기어', tagline: '보호막과 에너지 가속으로 거대 기갑을 완성하는 시리즈', mechanic: '보호막 · 에너지 가속', accent: '#92b9ff' },
  { id: 'eclipsion', name: '일식공명 이클립시온', shortName: '이클립시온', packName: '일식공명 이클립시온', tagline: '묘지와 균열을 자원으로 되살아나는 공명 시리즈', mechanic: '묘지 회수 · 균열 공명', accent: '#b587ff' },
  { id: 'nocturne', name: '월영환상 녹턴 미라주', shortName: '녹턴 미라주', packName: '월영환상 녹턴 미라주', tagline: '회복과 서치로 손패 우위를 쌓는 환상 시리즈', mechanic: '회복 · 서치 컨트롤', accent: '#9db7ff' },
  { id: 'arborian', name: '세계수권속 아르보리아', shortName: '아르보리아', packName: '세계수권속 아르보리아', tagline: '필드를 키우고 보호하며 장기전을 지배하는 생장 시리즈', mechanic: '성장 · 광역 강화', accent: '#7bd998' },
  { id: 'tempest_drive', name: '천뢰기동 템페스트 드라이브', shortName: '템페스트 드라이브', packName: '천뢰기동 템페스트 드라이브', tagline: '속공과 에너지 연계로 턴을 폭발시키는 고속 시리즈', mechanic: '속공 · 에너지 콤보', accent: '#66ddff' },
  { id: 'abyss_reaper', name: '심연포식 어비스 리퍼', shortName: '어비스 리퍼', packName: '심연포식 어비스 리퍼', tagline: '묘지 회수와 코어 압박으로 상대 자원을 갉아먹는 시리즈', mechanic: '회수 · 코어 압박', accent: '#c178ff' },
  { id: 'primal_guardian', name: '원초수호 프라이멀 가디언', shortName: '프라이멀 가디언', packName: '원초수호 프라이멀 가디언', tagline: '야수와 수호령이 서로를 강화하며 버티는 수호 시리즈', mechanic: '수호 · 전장 강화', accent: '#d0c49a' },
  { id: 'chronorium', name: '시간성전 크로노리움', shortName: '크로노리움', packName: '시간성전 크로노리움', tagline: '시간을 앞당기고 되감아 에너지 우위를 만드는 시공 기사단', mechanic: '시간 가속 · 에너지 재배치', accent: '#87d6ff' },
  { id: 'arcana_protocol', name: '마도규약 아르카나 프로토콜', shortName: '아르카나 프로토콜', packName: '마도규약 아르카나 프로토콜', tagline: '주문과 서치를 연쇄해 손패를 설계하는 마도 규약 시리즈', mechanic: '주문 연쇄 · 서치', accent: '#d49bff' },
  { id: 'beastforge', name: '야수기갑 비스트포지', shortName: '비스트포지', packName: '야수기갑 비스트포지', tagline: '야수 코어와 기갑을 결합해 필드를 점점 거대하게 만드는 시리즈', mechanic: '야수 강화 · 보호막', accent: '#f0a45d' },
  { id: 'phantom_carnival', name: '몽환극단 팬텀 카니발', shortName: '팬텀 카니발', packName: '몽환극단 팬텀 카니발', tagline: '함정과 묘지 회수로 상대의 타이밍을 비트는 환영 극단', mechanic: '함정 연계 · 묘지 회수', accent: '#c47cff' },
  { id: 'astral_armada', name: '성해함대 아스트라 아르마다', shortName: '아스트라 아르마다', packName: '성해함대 아스트라 아르마다', tagline: '함선 편대와 광자포로 에너지와 보호막을 동시에 운영하는 성해 함대', mechanic: '편대 전개 · 실드/에너지', accent: '#6fd8ff' },
];

export const SERIES_BY_ID: Record<SeriesId, CardSeriesDefinition> = Object.fromEntries(CARD_SERIES.map((series) => [series.id, series])) as Record<SeriesId, CardSeriesDefinition>;

export function seriesAbilityDescription(card: CardDefinition): string {
  const ability = card.seriesAbility;
  if (!ability || !card.seriesId) return '';
  const name = SERIES_BY_ID[card.seriesId].shortName;
  if (ability.kind === 'search_series') return `연계: 덱에서 「${name}」 카드 ${ability.amount}장을 찾아 손에 넣습니다.`;
  if (ability.kind === 'buff_series') return `연계: 내 필드의 「${name}」 유닛 전부 공격력 +${ability.attack}, 체력 +${ability.health}.`;
  if (ability.kind === 'shield_series') return `연계: 내 필드의 「${name}」 유닛 전부 보호막 ${ability.amount} 획득.`;
  if (ability.kind === 'heal_per_series') return `연계: 내 필드의 「${name}」 유닛 수만큼 코어를 ${ability.amount}씩 회복합니다. 최대 ${ability.cap}.`;
  if (ability.kind === 'damage_core_per_series') return `연계: 내 필드의 「${name}」 유닛 수만큼 상대 코어에 ${ability.amount}씩 피해. 최대 ${ability.cap}.`;
  if (ability.kind === 'gain_energy_if_series') return `연계: 「${name}」 유닛이 ${ability.minimumAllies ?? 2}장 이상이면 에너지 ${ability.amount} 회복.`;
  if (ability.kind === 'recover_series') return `연계: 내 묘지의 「${name}」 카드 ${ability.amount}장을 손으로 되돌립니다.`;
  return '';
}



export const SERIES_SIGNATURE_META: Record<SeriesSignature, { name: string; description: string }> = {
  lumina_beacon: { name: '성휘 신호', description: '루미나이츠 2체 이상이면 1장 드로우.' },
  lumina_reinforce: { name: '히어로 증원', description: '루미나이츠 2체 이상이면 덱의 2코스트 이하 루미나이츠 1체 전개.' },
  lumina_united: { name: '연합 방진', description: '루미나이츠 3체 이상이면 아군 루미나이츠 전원 체력 +1.' },
  lumina_finisher: { name: '결전 섬광', description: '루미나이츠 4체 이상이면 상대 코어 2 피해.' },

  kaiser_repair: { name: '긴급 수리', description: '카이저기어 1체의 보호막 +2.' },
  kaiser_battery: { name: '실드 배터리', description: '카이저기어 보호막 합계가 4 이상이면 에너지 1 회복.' },
  kaiser_overdrive: { name: '장갑 오버드라이브', description: '보호막이 있는 카이저기어 1체 공격력 +1.' },
  kaiser_fortress: { name: '황제 방벽', description: '카이저기어 3체 이상이면 전원 보호막 +1.' },

  eclipse_echo: { name: '묘지의 잔향', description: '내 묘지 4장 이상이면 이클립시온 카드 1장 회수.' },
  eclipse_devour: { name: '공허 섭식', description: '내 묘지 3장 이상이면 1장 소멸 후 상대 코어 1 피해.' },
  eclipse_rebirth: { name: '일식 재생', description: '내 묘지 5장 이상이면 2코스트 이하 이클립시온 1체를 체력 1로 부활.' },
  eclipse_resonance: { name: '심층 공명', description: '내 묘지 7장 이상이면 1장 드로우 + 에너지 1 회복.' },

  nocturne_moonheal: { name: '월영 치유', description: '내 코어가 더 낮으면 코어 2 회복.' },
  nocturne_illusion: { name: '환영 퇴장', description: '내 코어가 더 낮으면 3코스트 이하 적 1체를 되돌림.' },
  nocturne_dreamsearch: { name: '몽환 탐색', description: '녹턴 미라주 2체 이상이면 덱에서 녹턴 주문 1장 서치.' },
  nocturne_mirrorveil: { name: '거울 장막', description: '녹턴 미라주 2체 이상이면 아군 1체 보호막 +2.' },

  arborian_seed: { name: '세계수의 씨앗', description: '아르보리아가 있으면 빈 칸에 1/2 새싹 토큰 소환.' },
  arborian_growth: { name: '급속 생장', description: '아르보리아 2체 이상이면 아군 1체 체력 +2.' },
  arborian_regrowth: { name: '재생 수액', description: '아르보리아 2체 이상이면 아군 아르보리아 전원 체력 1 회복.' },
  arborian_bloom: { name: '만개', description: '아르보리아 3체 이상이면 코어 2 회복.' },

  tempest_afterburn: { name: '애프터버너 점화', description: '이번 턴 소환한 템페스트 1체를 즉시 공격 가능하게 함.' },
  tempest_voltage: { name: '전압 축적', description: '템페스트 2체 이상이면 에너지 1 회복.' },
  tempest_chainbolt: { name: '연쇄 낙뢰', description: '템페스트 2체 이상이면 가장 약한 적에게 1 피해. 적이 없으면 코어 1 피해.' },
  tempest_momentum: { name: '초가속 모멘텀', description: '템페스트 3체 이상이면 1장 드로우.' },

  abyss_feast: { name: '영혼 포식', description: '상대 묘지 1장을 소멸시키고 내 코어 1 회복.' },
  abyss_harvest: { name: '심연 수확', description: '내 묘지 4장 이상이면 1장 드로우.' },
  abyss_execute: { name: '사형 집행', description: '상대 묘지 2장 이상이면 가장 약한 적에게 2 피해.' },
  abyss_drain: { name: '검은 흡수', description: '상대 묘지 4장 이상이면 상대 코어 1 피해 + 내 코어 1 회복.' },

  primal_spirit: { name: '수호령 현현', description: '프라이멀 2체 이상이면 빈 칸에 2/2 수호령 토큰 소환.' },
  primal_pack: { name: '무리의 결속', description: '프라이멀 2체 이상이면 아군 1체 +1/+1.' },
  primal_shelter: { name: '대지의 품', description: '프라이멀 3체 이상이면 아군 프라이멀 전원 보호막 +1.' },
  primal_vitality: { name: '야생 생명력', description: '프라이멀 2체마다 코어 1 회복. 최대 2.' },

  chrono_accelerate: { name: '시간 가속', description: '남은 에너지가 2 이하이면 에너지 1 회복.' },
  chrono_rewind: { name: '시간 되감기', description: '묘지의 크로노리움 유닛 1장을 손으로 회수.' },
  chrono_foresee: { name: '미래 관측', description: '크로노리움 2체 이상이면 1장 드로우.' },
  chrono_reset: { name: '상태 복원', description: '크로노리움 1체 체력 2 회복 + 보호막 1.' },

  arcana_inscribe: { name: '주문 각인', description: '묘지에 주문이 있으면 덱에서 아르카나 주문 1장 서치.' },
  arcana_recycle: { name: '규약 재사용', description: '묘지 주문 3장 이상이면 아르카나 주문 1장 회수.' },
  arcana_chain: { name: '마법 연쇄', description: '묘지 주문 2장 이상이면 에너지 1 회복.' },
  arcana_hex: { name: '봉인식', description: '묘지 주문 4장 이상이면 가장 약한 적에게 2 피해.' },

  beast_repair: { name: '야수 수복', description: '비스트포지 1체의 체력을 2 회복.' },
  beast_plating: { name: '합금 장갑', description: '비스트포지 1체의 보호막 +2.' },
  beast_hunt: { name: '포식 추적', description: '보호막이 있는 비스트포지가 있으면 가장 약한 적에게 2 피해.' },
  beast_rage: { name: '장갑 격노', description: '보호막 1을 소모해 비스트포지 1체 공격력 +2.' },

  phantom_set: { name: '무대 뒤 장치', description: '팬텀 2체 이상이면 덱의 팬텀 함정 1장을 바로 세트.' },
  phantom_encore: { name: '앙코르 회수', description: '세트된 함정이 있으면 묘지의 팬텀 함정 1장 회수.' },
  phantom_misdirect: { name: '시선 돌리기', description: '세트된 함정이 있으면 3코스트 이하 적 1체를 되돌림.' },
  phantom_applause: { name: '관객의 박수', description: '팬텀 2체 이상 + 세트 함정이 있으면 1장 드로우.' },

  astral_drone: { name: '정찰 드론 출격', description: '아스트라 2체 이상이면 빈 칸에 1/2 드론 토큰 소환.' },
  astral_salvo: { name: '편대 일제사격', description: '아스트라 3체 이상이면 상대 코어 1 피해.' },
  astral_recharge: { name: '함대 재충전', description: '아스트라 보호막 합계가 3 이상이면 에너지 1 회복.' },
  astral_formation: { name: '성해 진형', description: '아스트라 3체 이상이면 아군 아스트라 전원 보호막 +1.' },
};

export const SERIES_TACTICAL_META: Record<SeriesTacticalPassive, { name: string; description: string }> = {
  lumina_rally: { name: '집결 출격', description: '같은 시리즈 아군이 있으면 소환 시 자신 +1/+1.' },
  lumina_cover: { name: '동료 엄호', description: '소환 시 다른 루미나이츠가 2체 이상이면 체력이 가장 낮은 아군 루미나이츠 보호막 +1.' },
  lumina_combo: { name: '연계 돌격', description: '공격할 때 다른 루미나이츠가 있으면 그 전투 피해 +1.' },
  lumina_victory: { name: '승전 신호', description: '전투로 적을 파괴하고 루미나이츠가 2체 이상이면 카드 1장 드로우.' },

  kaiser_armor: { name: '중장 장갑', description: '같은 시리즈 아군이 있으면 소환 시 보호막 1 획득.' },
  kaiser_thruster: { name: '장갑 추진', description: '보호막이 있으면 공격 시 보호막 1을 소모하고 그 전투 피해 +2.' },
  kaiser_salvage: { name: '전투 수복', description: '전투로 적을 파괴하면 자신의 보호막 +1.' },
  kaiser_emergency: { name: '잔해 회수', description: '파괴될 때 남은 카이저기어 1체의 보호막 +1.' },

  eclipse_gloom: { name: '일식 장막', description: '내 묘지가 3장 이상이면 소환 시 보호막 1 획득.' },
  eclipse_graveblade: { name: '묘지 공명검', description: '내 묘지가 4장 이상이면 공격 피해 +1.' },
  eclipse_feast: { name: '잔향 섭식', description: '전투로 적을 파괴하고 내 묘지가 5장 이상이면 코어 1 회복.' },
  eclipse_afterimage: { name: '잔향 포식', description: '파괴될 때 내 묘지가 4장 이상이면 상대 코어 1 피해.' },

  nocturne_veil: { name: '월영 장막', description: '내 코어가 상대보다 낮으면 소환 시 보호막 1 획득.' },
  nocturne_moonreturn: { name: '월영 회귀', description: '내 코어가 상대보다 낮으면 공격 선언 시 코어 1 회복.' },
  nocturne_dreamdraw: { name: '몽중 전리품', description: '내 코어가 상대보다 낮은 상태에서 적을 파괴하면 카드 1장 드로우.' },
  nocturne_fade: { name: '환영 소실', description: '파괴될 때 내 코어가 상대보다 낮으면 가장 강한 적의 공격력 -1.' },

  arborian_pulse: { name: '생장 맥동', description: '같은 시리즈 아군이 있으면 소환 시 체력이 가장 낮은 기존 아군의 최대 체력/체력 +1.' },
  arborian_root: { name: '깊은 뿌리', description: '다른 아르보리아가 2체 이상이면 소환 시 자신의 최대 체력/체력 +2.' },
  arborian_sap: { name: '수액 돌진', description: '자신의 체력이 가득 차 있고 다른 아르보리아가 있으면 공격 피해 +1.' },
  arborian_seedfall: { name: '낙엽 발아', description: '파괴될 때 빈 필드가 있으면 1/1 새싹 토큰 1체 소환.' },

  tempest_afterburner: { name: '애프터버너', description: '같은 시리즈 아군이 있으면 소환된 턴에도 즉시 공격 가능.' },
  tempest_overcurrent: { name: '과전류 돌입', description: '남은 에너지가 2 이하이면 공격 피해 +1.' },
  tempest_recharge: { name: '전격 재충전', description: '전투로 적을 파괴하면 자신의 공격력 +1.' },
  tempest_residual: { name: '잔류 낙뢰', description: '파괴될 때 다른 템페스트가 남아 있으면 상대 코어 1 피해.' },

  abyss_devour_echo: { name: '포식 반향', description: '전투로 적을 파괴하면 내 코어 1 회복.' },
  abyss_grave_armor: { name: '묘향 갑주', description: '소환할 때 상대 묘지가 2장 이상이면 보호막 1 획득.' },
  abyss_void_edge: { name: '공허 칼날', description: '공격할 때 상대 묘지가 4장 이상이면 그 전투 피해 +1.' },
  abyss_last_curse: { name: '최후의 저주', description: '파괴될 때 상대 묘지가 3장 이상이면 상대 코어 1 피해.' },

  primal_packguard: { name: '군집 수호', description: '같은 시리즈 아군이 있으면 소환 시 보호막 1과 체력 +1.' },
  primal_alpha: { name: '알파의 포효', description: '다른 프라이멀 아군이 2체 이상이면 공격 피해 +1.' },
  primal_hunt: { name: '야생 사냥', description: '전투로 적을 파괴하면 자신의 최대 체력/체력 +1.' },
  primal_spirit_guard: { name: '수호령 계승', description: '파괴될 때 남은 프라이멀 1체의 보호막 +1.' },

  chrono_priority: { name: '시간 선점', description: '소환 후 에너지가 2 이상 남아 있으면 공격력 +1과 보호막 1.' },
  chrono_accel_strike: { name: '가속 타격', description: '공격할 때 에너지가 1 이상 남아 있으면 그 전투 피해 +1.' },
  chrono_forecast: { name: '미래 확보', description: '에너지가 1 이상 남은 상태로 적을 파괴하면 카드 1장 드로우.' },
  chrono_restore: { name: '시간 복원', description: '파괴될 때 남은 크로노리움 중 체력이 가장 낮은 1체의 체력 2 회복.' },

  arcana_rewrite: { name: '규약 재기록', description: '내 묘지에 주문이 2장 이상이면 소환 시 카드 1장 드로우.' },
  arcana_conduit: { name: '마력 도관', description: '내 아르카나 주문이 해결될 때 이 패시브를 가진 아군 1체가 보호막 1 획득.' },
  arcana_runeblade: { name: '룬 블레이드', description: '내 묘지에 주문이 3장 이상이면 공격 피해 +1.' },
  arcana_sealburst: { name: '봉인 잔광', description: '파괴될 때 내 묘지에 주문이 4장 이상이면 가장 강한 적의 공격력 -1.' },

  beast_plating_passive: { name: '야수 장갑', description: '같은 시리즈 아군이 있으면 소환 시 보호막 1 획득.' },
  beast_alloy_strike: { name: '합금 충격', description: '보호막을 가진 상태로 공격하면 그 전투 피해 +1.' },
  beast_predatory_repair: { name: '포식 수복', description: '전투로 적을 파괴하면 자신의 체력 2 회복.' },
  beast_legacy: { name: '강철 유산', description: '파괴될 때 남은 비스트포지 1체의 공격력 +1.' },

  phantom_backstage: { name: '비밀 무대', description: '내 함정이 1장 이상 세트되어 있으면 소환 시 보호막 1 획득.' },
  phantom_ambush: { name: '기습 배우', description: '내 함정이 세트되어 있으면 공격 피해 +1.' },
  phantom_encore_passive: { name: '앙코르 트릭', description: '내 팬텀 함정이 발동하면 이 패시브를 가진 아군 1체 +1/+1.' },
  phantom_smoke: { name: '퇴장 연막', description: '파괴될 때 가장 강한 적의 공격력 -1.' },

  astral_formation_wall: { name: '편대 방벽', description: '소환 후 아스트라가 2체 이상이면 아스트라 전원 보호막 +1.' },
  astral_photon_thrust: { name: '광자 추진', description: '다른 아스트라가 있으면 공격 피해 +1.' },
  astral_supply: { name: '함대 보급', description: '전투로 적을 파괴하면 자신의 보호막 +1.' },
  astral_lastship: { name: '잔존 편대', description: '파괴될 때 남은 아스트라 1체의 보호막 +1.' },
};

export function seriesSignatureDescription(card: CardDefinition): string {
  if (!card.seriesSignature) return '';
  const meta = SERIES_SIGNATURE_META[card.seriesSignature];
  return `${meta.name} · ${meta.description}`;
}

export function tacticalAbilityDescription(card: CardDefinition): string {
  if (!isUnitCard(card) || !card.seriesTacticalPassive) return '';
  const meta = SERIES_TACTICAL_META[card.seriesTacticalPassive];
  return `${meta.name} · ${meta.description}`;
}

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
    id: 'spell_spark_bolt', name: '섬광탄', subtitle: '짧고 정확한 번개', kind: 'spell', rarity: 'common', element: 'storm', cost: 2,
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
    evolutionRecipe: { label: '잿불의 종자 계승', fromIds: ['unit_ember_squire'] },
    target: 'none', text: '계승 진화. 진화 전 유닛의 강화 수치와 보호막을 이어받습니다. 속공, 흡수.',
    flavor: '불씨는 자신이 작다는 사실을 잊는 순간 날개를 얻는다.', sigil: '♨',
    vfx: { summon: 'phoenix-ascend', attack: 'phoenix-dive', defense: 'rebirth-wings', destroy: 'ash-rebirth' },
  },
  {
    id: 'evolution_iron_sovereign', name: '철성계승 군주', subtitle: '성벽이 왕좌를 선택하다', kind: 'evolution', rarity: 'epic', element: 'neutral', cost: 2,
    attack: 4, health: 12, keywords: ['guard'], summonMode: 'evolution',
    evolutionRecipe: { label: '철벽 수호병 계승', fromIds: ['unit_iron_bastion'] },
    onSummon: { kind: 'shield_unit', amount: 4 }, target: 'none',
    text: '계승 진화. 강화 수치와 보호막 계승. 소환 시 보호막 4. 수호.',
    flavor: '오랫동안 지킨 자는 결국 지켜야 할 나라 그 자체가 된다.', sigil: '♜',
    vfx: { summon: 'citadel-ascend', attack: 'sovereign-hammer', defense: 'royal-rampart', destroy: 'fortress-fall' },
  },
  {
    id: 'evolution_rift_alpha', name: '균열계승 알파', subtitle: '사냥개가 경계의 주인이 되다', kind: 'evolution', rarity: 'legendary', element: 'void', cost: 3,
    attack: 8, health: 6, keywords: ['charge', 'pierce'], summonMode: 'evolution',
    evolutionRecipe: { label: '균열 사냥개 계승', fromIds: ['unit_rift_hound'] },
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
  { id: 'unit_v8_solar_06', name: '붉은달의 백금세라프', subtitle: '무너진 왕국의 기억', kind: 'unit', rarity: 'epic', element: 'solar', cost: 6, attack: 7, health: 6, summonMode: 'rift', riftCost: 4, riftCondition: { kind: 'empty_board_and_graveyard_min', value: 3, label: '내 필드가 비어 있고 묘지에 카드가 3장 이상일 때' }, onSummon: { kind: 'gain_energy', amount: 1 }, target: 'none', text: '균열 소환: 내 필드가 비어 있고 묘지에 카드가 3장 이상이면 비용 4. 소환 시 이번 턴 에너지 1 회복.', flavor: '일식 공명단의 기록에는 이 존재가 전장의 흐름을 바꾼 순간이 남아 있다.', sigil: '✦', series: '일식 공명단' },
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


/*
 * v22 live-balance normalization
 *
 * The v8 expansion contained a small cluster of low-cost units whose raw body,
 * keyword and summon effect all exceeded the baseline at the same time. These
 * are conservative stat-only corrections to the 24 clearest outliers; card
 * identity/effects are preserved. This is intentionally narrower than a full
 * meta rebalance so real match telemetry can drive later tuning.
 */
const V22_UNIT_BALANCE_OVERRIDES: Record<string, Pick<CardDefinition, 'attack' | 'health'>> = {
  unit_v8_solar_02: { attack: 2, health: 3 },
  unit_v8_solar_05: { attack: 3, health: 4 },
  unit_v8_solar_11: { attack: 3, health: 4 },
  unit_v8_solar_15: { attack: 2, health: 1 },
  unit_v8_solar_20: { attack: 1, health: 2 },
  unit_v8_lunar_13: { attack: 2, health: 2 },
  unit_v8_lunar_20: { attack: 2, health: 2 },
  unit_v8_storm_01: { attack: 1, health: 2 },
  unit_v8_storm_05: { attack: 2, health: 4 },
  unit_v8_storm_06: { attack: 2, health: 2 },
  unit_v8_storm_07: { attack: 1, health: 2 },
  unit_v8_storm_13: { attack: 1, health: 2 },
  unit_v8_storm_17: { attack: 1, health: 3 },
  unit_v8_storm_20: { attack: 1, health: 2 },
  unit_v8_verdant_06: { attack: 2, health: 2 },
  unit_v8_verdant_11: { attack: 2, health: 3 },
  unit_v8_verdant_17: { attack: 2, health: 3 },
  unit_v8_void_03: { attack: 1, health: 3 },
  unit_v8_void_06: { attack: 2, health: 1 },
  unit_v8_void_09: { attack: 1, health: 3 },
  unit_v8_void_11: { attack: 2, health: 2 },
  unit_v8_void_17: { attack: 2, health: 2 },
  unit_v8_neutral_05: { attack: 2, health: 2 },
  unit_v8_neutral_11: { attack: 2, health: 2 },
};

for (const card of CARDS) {
  const override = V22_UNIT_BALANCE_OVERRIDES[card.id];
  if (!override) continue;
  card.attack = override.attack;
  card.health = override.health;
}

/* --------------------------------------------------------------------------
 * v25 archetype / series identity layer
 * --------------------------------------------------------------------------
 * The original 320-card pool had useful internal "series" tags, but most cards
 * still read like unrelated standalone cards. v25 turns those tags into eight
 * real deck archetypes. Card IDs stay unchanged so existing collections/decks
 * remain valid; only player-facing names, series metadata and selected link
 * abilities are upgraded.
 */
const V25_LEGACY_SERIES_MAP: Record<string, SeriesId> = {
  '여명 성기사단': 'luminaknights',
  '수정 자동기': 'kaisergear',
  '일식 공명단': 'eclipsion',
  '월영 몽환단': 'nocturne',
  '세계수 생명군': 'arborian',
  '천뢰 기동군': 'tempest_drive',
  '심연 포식군': 'abyss_reaper',
  '원초의 수호령': 'primal_guardian',
};

const V25_EXTRA_SERIES_ORDER: SeriesId[] = [
  'luminaknights', 'kaisergear', 'eclipsion', 'nocturne',
  'arborian', 'tempest_drive', 'abyss_reaper', 'primal_guardian',
];

const V25_BASE_SERIES_OVERRIDES: Record<string, SeriesId> = {
  fusion_eclipse_chimera: 'eclipsion',
  fusion_tempest_colossus: 'tempest_drive',
  fusion_worldroot_hydra: 'arborian',
  evolution_ember_phoenix: 'luminaknights',
  evolution_iron_sovereign: 'kaisergear',
  evolution_rift_alpha: 'eclipsion',
  fusion_v8_17: 'abyss_reaper',
};

const V25_BASE_NAME_OVERRIDES: Record<string, { name: string; subtitle: string }> = {
  fusion_eclipse_chimera: { name: '이클립시온 크로스 - 네메시스 키메라', subtitle: '일식공명의 원형 융합체' },
  fusion_tempest_colossus: { name: '템페스트 드라이브 크로스 - 썬더 콜로서스', subtitle: '천뢰기동의 초고속 거신' },
  fusion_worldroot_hydra: { name: '아르보리아 크로스 - 에버그린 히드라', subtitle: '세계수권속의 다중 생장체' },
  evolution_ember_phoenix: { name: '루미나이츠 어센드 - 피닉스 브레이버', subtitle: '성휘전대의 재점화 계승체' },
  evolution_iron_sovereign: { name: '카이저기어 어센드 - 아이언 소버린', subtitle: '황제기갑의 최종 지휘 프레임' },
  evolution_rift_alpha: { name: '이클립시온 어센드 - 리프트 알파', subtitle: '균열을 계승한 최초의 공명체' },
};

type V25NameBank = {
  stems: string[];
  roles: string[];
  spells: string[];
  traps: string[];
  apex: string[];
};

const V25_NAME_BANKS: Record<SeriesId, V25NameBank> = {
  luminaknights: {
    stems: ['솔', '레이', '크림슨', '아크', '노바', '세라프', '오로라', '글로리', '브레이브', '크라운'],
    roles: ['세이버', '랜서'],
    spells: ['브레이브 콜', '라이트 크로스', '포메이션 체인지', '라이징 배너', '히어로즈 링크', '세컨드 선', '크라운 차지', '샤이닝 오더', '레스큐 비콘', '파이널 레이'],
    traps: ['가디언 인터셉트', '리플렉트 실드', '포메이션 브레이크', '세이비어 콜', '리턴 오브 라이트', '크로스 카운터', '제로 디펜스', '라스트 스탠드'],
    apex: ['그랜드 솔', '하이퍼 노바', '세라프 크라운', '아크 브레이버', '오메가 레이', '엑시드 세이버', '라디언트 킹', '유나이트 제로'],
  },
  kaisergear: {
    stems: ['알파', '아이언', '제로', '블리츠', '코어', '타이탄', '발칸', '시그마', '오메가', '임페리얼'],
    roles: ['프레임', '드라이버'],
    spells: ['오버클럭', '리액터 스타트', '풀 아머 전개', '임페리얼 코드', '메인 코어 링크', '포지 리부트', '부스터 이그니션', '아머 리페어', '제로 시퀀스', '카이저 커맨드'],
    traps: ['이머전시 셸', '리버스 기어', '아머드 카운터', '코어 락', '디코이 프레임', '오버히트 브레이크', '임페리얼 월', '리부트 프로토콜'],
    apex: ['기가 카이저', '오메가 프레임', '임페리얼 타이탄', '제로 엠페러', '아틀라스 기어', '크라운 드라이버', '그랜드 포트리스', '카이저 오버로드'],
  },
  eclipsion: {
    stems: ['블랙', '크로노', '아스트라', '베일', '리프트', '루인', '네메시스', '섀도', '엔드', '오메가'],
    roles: ['레조너', '키메라'],
    spells: ['리프트 콜', '블랙 레조넌스', '제로 호라이즌', '에코 리턴', '그레이브 튜닝', '일식 동조', '보이드 펄스', '네메시스 코드', '크로노 브레이크', '라스트 이클립스'],
    traps: ['리프트 리버설', '에코 스네어', '블랙 아웃', '그레이브 리콜', '공명 차단', '네메시스 미러', '제로 폴드', '이클립스 엔드'],
    apex: ['네메시스 키메라', '크로노 레비아탄', '아스트라 드래곤', '리프트 제로', '블랙 세라핌', '오메가 레조넌트', '이클립스 타이런트', '엔드 브링어'],
  },
  nocturne: {
    stems: ['루나', '베일', '드림', '미러', '실버', '크레센트', '나이트', '에코', '미스트', '페이즈'],
    roles: ['팬텀', '댄서'],
    spells: ['문라이트 리콜', '드림 셔플', '미러 스텝', '녹턴 드로우', '크레센트 위시', '실버 리커버리', '팬텀 패스', '루나 링크', '미스트 커튼', '미드나이트 앙코르'],
    traps: ['미러 트릭', '드림 캐처', '문 페이즈', '팬텀 리버스', '실버 베일', '녹턴 카운터', '미스트 룸', '라스트 문'],
    apex: ['풀문 디바', '미러 퀸', '녹턴 마제스티', '드림 이클립스', '루나 팬텀', '실버 오라클', '크레센트 엠프레스', '미드나이트 제로'],
  },
  arborian: {
    stems: ['브룸', '쏜', '루트', '베르드', '세이지', '가이아', '플로라', '크라운', '시드', '오크'],
    roles: ['가디언', '드루이드'],
    spells: ['월드루트 콜', '생장 폭주', '에버그린 링크', '가이아 리커버리', '브룸 사이클', '시드 리턴', '쏜 크라운', '루트 네트워크', '대지의 숨결', '아르보리아 블룸'],
    traps: ['쏜 월', '루트 바인드', '시드 셸터', '가이아 리버스', '브룸 가드', '에버그린 카운터', '월드루트 락', '숲의 최후방어'],
    apex: ['월드루트 킹', '가이아 드래곤', '에버그린 히드라', '크라운 트렌트', '아르보리아 타이탄', '블룸 세라프', '루트 엠페러', '제네시스 트리'],
  },
  tempest_drive: {
    stems: ['볼트', '제타', '스톰', '레일', '블리츠', '썬더', '스파크', '제노', '라이트닝', '터보'],
    roles: ['라이더', '랜서'],
    spells: ['오버드라이브', '볼트 체인', '제로 투 맥스', '썬더 콜', '부스트 시프트', '레일 점프', '터보 링크', '스파크 리로드', '라이트닝 패스', '템페스트 러시'],
    traps: ['브레이크 체크', '리버스 볼트', '스톰 인터셉트', '터보 카운터', '레일 락', '블리츠 리턴', '오버스피드 월', '라스트 드라이브'],
    apex: ['템페스트 엑시드', '볼트 카이저', '라이트닝 노바', '제타 오버로드', '스톰 브레이커', '터보 제네시스', '썬더 콜로서스', '인피니트 드라이브'],
  },
  abyss_reaper: {
    stems: ['블랙', '헝거', '베놈', '셰이드', '그레이브', '네더', '블러드', '다크', '헬', '보이드'],
    roles: ['리퍼', '하운드'],
    spells: ['그레이브 콜', '블랙 피드', '네더 체인', '보이드 헝거', '리퍼 리턴', '블러드 링크', '심연 동조', '베놈 드레인', '다크 리콜', '어비스 엔드'],
    traps: ['그레이브 스네어', '헝거 카운터', '보이드 바이트', '네더 리버스', '블랙 미러', '리퍼 마크', '심연 봉인', '라스트 디바우어'],
    apex: ['어비스 타이런트', '그레이브 킹', '보이드 리바이어던', '네더 드래곤', '블랙 리퍼 제로', '헝거 오메가', '다크 엠페러', '엔드 디바우어'],
  },
  primal_guardian: {
    stems: ['루인', '토템', '와일드', '스톤', '스카이', '플레임', '타이드', '테라', '팽', '혼'],
    roles: ['비스트', '워든'],
    spells: ['토템 콜', '야성 해방', '대지의 맹세', '프라이멀 링크', '비스트 차지', '스톤 하트', '스카이 로어', '테라 포스', '팽 러시', '가디언 어웨이크'],
    traps: ['토템 월', '와일드 카운터', '스톤 셸', '비스트 리버스', '테라 가드', '팽 트랩', '원초의 결계', '가디언 라스트'],
    apex: ['프라이멀 킹', '토템 타이탄', '와일드 드래곤', '테라 베히모스', '스톤 엠페러', '스카이 가루다', '가디언 오메가', '원초신수'],
  },
  chronorium: { stems: ['V26'], roles: ['V26'], spells: ['V26'], traps: ['V26'], apex: ['V26'] },
  arcana_protocol: { stems: ['V26'], roles: ['V26'], spells: ['V26'], traps: ['V26'], apex: ['V26'] },
  beastforge: { stems: ['V26'], roles: ['V26'], spells: ['V26'], traps: ['V26'], apex: ['V26'] },
  phantom_carnival: { stems: ['V26'], roles: ['V26'], spells: ['V26'], traps: ['V26'], apex: ['V26'] },
  astral_armada: { stems: ['V26'], roles: ['V26'], spells: ['V26'], traps: ['V26'], apex: ['V26'] },
};

const V25_SERIES_ABILITY_PLANS: Record<SeriesId, SeriesAbility[]> = {
  luminaknights: [
    { kind: 'search_series', amount: 1 },
    { kind: 'gain_energy_if_series', amount: 1, minimumAllies: 2 },
    { kind: 'buff_series', attack: 1, health: 0 },
    { kind: 'search_series', amount: 1 },
    { kind: 'shield_series', amount: 1 },
    { kind: 'buff_series', attack: 1, health: 1 },
    { kind: 'damage_core_per_series', amount: 1, cap: 3 },
  ],
  kaisergear: [
    { kind: 'shield_series', amount: 1 },
    { kind: 'gain_energy_if_series', amount: 1, minimumAllies: 2 },
    { kind: 'buff_series', attack: 0, health: 1 },
    { kind: 'search_series', amount: 1 },
    { kind: 'shield_series', amount: 2 },
    { kind: 'buff_series', attack: 1, health: 1 },
    { kind: 'gain_energy_if_series', amount: 2, minimumAllies: 3 },
  ],
  eclipsion: [
    { kind: 'recover_series', amount: 1 },
    { kind: 'damage_core_per_series', amount: 1, cap: 3 },
    { kind: 'search_series', amount: 1 },
    { kind: 'recover_series', amount: 1 },
    { kind: 'gain_energy_if_series', amount: 1, minimumAllies: 2 },
    { kind: 'damage_core_per_series', amount: 1, cap: 4 },
    { kind: 'recover_series', amount: 2 },
  ],
  nocturne: [
    { kind: 'search_series', amount: 1 },
    { kind: 'heal_per_series', amount: 1, cap: 4 },
    { kind: 'shield_series', amount: 1 },
    { kind: 'search_series', amount: 1 },
    { kind: 'heal_per_series', amount: 1, cap: 5 },
    { kind: 'buff_series', attack: 1, health: 0 },
    { kind: 'search_series', amount: 2 },
  ],
  arborian: [
    { kind: 'buff_series', attack: 0, health: 1 },
    { kind: 'shield_series', amount: 1 },
    { kind: 'heal_per_series', amount: 1, cap: 4 },
    { kind: 'search_series', amount: 1 },
    { kind: 'recover_series', amount: 1 },
    { kind: 'buff_series', attack: 1, health: 1 },
    { kind: 'shield_series', amount: 2 },
  ],
  tempest_drive: [
    { kind: 'gain_energy_if_series', amount: 1, minimumAllies: 2 },
    { kind: 'damage_core_per_series', amount: 1, cap: 2 },
    { kind: 'search_series', amount: 1 },
    { kind: 'buff_series', attack: 1, health: 0 },
    { kind: 'gain_energy_if_series', amount: 1, minimumAllies: 1 },
    { kind: 'damage_core_per_series', amount: 1, cap: 3 },
    { kind: 'gain_energy_if_series', amount: 2, minimumAllies: 3 },
  ],
  abyss_reaper: [
    { kind: 'recover_series', amount: 1 },
    { kind: 'damage_core_per_series', amount: 1, cap: 3 },
    { kind: 'search_series', amount: 1 },
    { kind: 'recover_series', amount: 1 },
    { kind: 'damage_core_per_series', amount: 1, cap: 2 },
    { kind: 'gain_energy_if_series', amount: 1, minimumAllies: 2 },
    { kind: 'recover_series', amount: 2 },
  ],
  primal_guardian: [
    { kind: 'buff_series', attack: 1, health: 1 },
    { kind: 'shield_series', amount: 1 },
    { kind: 'search_series', amount: 1 },
    { kind: 'heal_per_series', amount: 1, cap: 3 },
    { kind: 'shield_series', amount: 2 },
    { kind: 'buff_series', attack: 1, health: 1 },
    { kind: 'heal_per_series', amount: 1, cap: 5 },
  ],
  chronorium: [{ kind: "gain_energy_if_series", amount: 1, minimumAllies: 2 }, { kind: "search_series", amount: 1 }, { kind: "recover_series", amount: 1 }, { kind: "gain_energy_if_series", amount: 2, minimumAllies: 3 }],
  arcana_protocol: [{ kind: "search_series", amount: 1 }, { kind: "recover_series", amount: 1 }, { kind: "shield_series", amount: 1 }, { kind: "search_series", amount: 2 }],
  beastforge: [{ kind: "buff_series", attack: 1, health: 0 }, { kind: "shield_series", amount: 1 }, { kind: "buff_series", attack: 1, health: 1 }, { kind: "heal_per_series", amount: 1, cap: 4 }],
  phantom_carnival: [{ kind: "recover_series", amount: 1 }, { kind: "damage_core_per_series", amount: 1, cap: 3 }, { kind: "search_series", amount: 1 }, { kind: "recover_series", amount: 2 }],
  astral_armada: [{ kind: "shield_series", amount: 1 }, { kind: "gain_energy_if_series", amount: 1, minimumAllies: 2 }, { kind: "heal_per_series", amount: 1, cap: 4 }, { kind: "buff_series", attack: 1, health: 1 }],
};

function v25SeriesForCard(card: CardDefinition): SeriesId | undefined {
  const base = V25_BASE_SERIES_OVERRIDES[card.id];
  if (base) return base;

  const extraMatch = card.id.match(/^(?:fusion|evolution)_v8_(\d{2})$/);
  if (extraMatch) return V25_EXTRA_SERIES_ORDER[(Number(extraMatch[1]) - 1) % V25_EXTRA_SERIES_ORDER.length];

  if (card.series && V25_LEGACY_SERIES_MAP[card.series]) return V25_LEGACY_SERIES_MAP[card.series];
  return undefined;
}

function v25RenameSeriesCards(): void {
  const grouped = new Map<SeriesId, Record<CardKind, CardDefinition[]>>();
  for (const definition of CARD_SERIES) {
    grouped.set(definition.id, { unit: [], spell: [], trap: [], fusion: [], evolution: [] });
  }

  for (const card of CARDS) {
    const previousSeries = card.series;
    const seriesId = v25SeriesForCard(card);
    if (!seriesId) continue;
    const definition = SERIES_BY_ID[seriesId];
    card.seriesId = seriesId;
    card.series = definition.name;
    const baseName = V25_BASE_NAME_OVERRIDES[card.id];
    if (baseName) {
      card.name = baseName.name;
      card.subtitle = baseName.subtitle;
    }
    if (previousSeries && card.flavor.includes(previousSeries)) card.flavor = card.flavor.replace(previousSeries, definition.name);
    grouped.get(seriesId)?.[card.kind].push(card);
  }

  for (const definition of CARD_SERIES) {
    const bank = V25_NAME_BANKS[definition.id];
    const groups = grouped.get(definition.id)!;
    for (const kind of Object.keys(groups) as CardKind[]) groups[kind].sort((a, b) => a.id.localeCompare(b.id));

    groups.unit.forEach((card, index) => {
      if (!card.id.includes('_v8_')) return;
      const stem = bank.stems[index % bank.stems.length];
      const role = bank.roles[Math.floor(index / bank.stems.length) % bank.roles.length];
      card.name = `${definition.shortName} ${stem} ${role}`;
      card.subtitle = `${definition.mechanic}의 전개 요원`;
    });
    groups.spell.forEach((card, index) => {
      if (!card.id.includes('_v8_')) return;
      card.name = `${definition.shortName} 오더 - ${bank.spells[index % bank.spells.length]}`;
      card.subtitle = `${definition.shortName} 전용 전술 카드`;
    });
    groups.trap.forEach((card, index) => {
      if (!card.id.includes('_v8_')) return;
      card.name = `${definition.shortName} 리액터 - ${bank.traps[index % bank.traps.length]}`;
      card.subtitle = `${definition.shortName} 전용 대응 카드`;
    });
    [...groups.fusion, ...groups.evolution].forEach((card, index) => {
      if (!card.id.includes('_v8_')) return;
      const label = card.kind === 'fusion' ? '크로스' : '어센드';
      card.name = `${definition.shortName} ${label} - ${bank.apex[index % bank.apex.length]}`;
      card.subtitle = `${definition.shortName}의 최종 전개`;
    });

    const flagshipUnit = groups.unit.find((card) => card.rarity === 'legendary')
      ?? groups.unit.find((card) => card.rarity === 'epic')
      ?? groups.unit.find((card) => card.rarity === 'rare');
    const secondUnit = groups.unit.find((card) => card !== flagshipUnit && (card.rarity === 'epic' || card.rarity === 'rare'));
    const candidates = [
      flagshipUnit,
      secondUnit,
      groups.spell[0],
      groups.spell[1],
      groups.trap[0],
      groups.fusion[0],
      groups.evolution[0],
    ].filter((card): card is CardDefinition => Boolean(card));

    candidates.forEach((card, index) => {
      card.seriesAbility = V25_SERIES_ABILITY_PLANS[definition.id][index % V25_SERIES_ABILITY_PLANS[definition.id].length];
    });
  }
}

v25RenameSeriesCards();

/* --------------------------------------------------------------------------
 * v26 expansion: 200 cards across five new archetypes
 * -------------------------------------------------------------------------- */
export const V26_EXPANSION_CARDS: CardDefinition[] = [
  { id: "v26_chronorium_unit_01", name: "크로노리움 세컨드 랜서", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "common", element: "neutral", cost: 1, attack: 1, health: 4, target: "none", text: "시간성전 전개를 안정시키는 유닛.", flavor: "시간성전 크로노리움 전투기록 01. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_02", name: "크로노리움 미닛 위버", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "common", element: "lunar", cost: 2, attack: 1, health: 4, target: "none", text: "시간성전 전개를 안정시키는 유닛.", flavor: "시간성전 크로노리움 전투기록 02. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_03", name: "크로노리움 호로로그 가드", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "common", element: "storm", cost: 3, attack: 2, health: 4, onSummon: { kind: "damage_core", amount: 1 }, target: "none", text: "소환 시 상대 코어에 1 피해.", flavor: "시간성전 크로노리움 전투기록 03. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_04", name: "크로노리움 리와인드 블레이드", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "common", element: "neutral", cost: 4, attack: 3, health: 7, target: "none", text: "시간성전 전개를 안정시키는 유닛.", flavor: "시간성전 크로노리움 전투기록 04. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "search_series", amount: 1 } },
  { id: "v26_chronorium_unit_05", name: "크로노리움 스냅 러너", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "common", element: "lunar", cost: 5, attack: 4, health: 7, target: "none", text: "시간성전 전개를 안정시키는 유닛.", flavor: "시간성전 크로노리움 전투기록 05. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_06", name: "크로노리움 이온 클레릭", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "common", element: "storm", cost: 1, attack: 1, health: 2, onSummon: { kind: "shield_unit", amount: 1 }, target: "none", text: "소환 시 아군 유닛 하나에게 보호막 1.", flavor: "시간성전 크로노리움 전투기록 06. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_07", name: "크로노리움 타임 오라클", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "common", element: "neutral", cost: 2, attack: 1, health: 5, target: "none", text: "시간성전 전개를 안정시키는 유닛.", flavor: "시간성전 크로노리움 전투기록 07. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_08", name: "크로노리움 제로아워 집행관", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "common", element: "lunar", cost: 3, attack: 2, health: 5, target: "none", text: "시간성전 전개를 안정시키는 유닛.", flavor: "시간성전 크로노리움 전투기록 08. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "recover_series", amount: 1 } },
  { id: "v26_chronorium_unit_09", name: "크로노리움 틱 가디언", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "rare", element: "storm", cost: 4, attack: 3, health: 5, onSummon: { kind: "draw", amount: 1 }, target: "none", text: "소환 시 카드 1장을 뽑습니다.", flavor: "시간성전 크로노리움 전투기록 09. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_10", name: "크로노리움 크로노 샷", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "rare", element: "neutral", cost: 5, attack: 4, health: 8, keywords: ["charge"], target: "none", text: "속공. 시간성전 전개를 안정시키는 유닛.", flavor: "시간성전 크로노리움 전투기록 10. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_11", name: "크로노리움 에포크 세이버", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "rare", element: "lunar", cost: 2, attack: 1, health: 4, target: "none", text: "시간성전 전개를 안정시키는 유닛.", flavor: "시간성전 크로노리움 전투기록 11. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_12", name: "크로노리움 루프 메이지", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "rare", element: "storm", cost: 2, attack: 1, health: 3, keywords: ["pierce"], onSummon: { kind: "gain_energy", amount: 1 }, target: "none", text: "관통. 소환 시 이번 턴 에너지 1 회복.", flavor: "시간성전 크로노리움 전투기록 12. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "gain_energy_if_series", amount: 2, minimumAllies: 3 } },
  { id: "v26_chronorium_unit_13", name: "크로노리움 타임락 센티널", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "rare", element: "neutral", cost: 3, attack: 2, health: 6, target: "none", text: "시간성전 전개를 안정시키는 유닛.", flavor: "시간성전 크로노리움 전투기록 13. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_14", name: "크로노리움 델타 워처", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "rare", element: "lunar", cost: 4, attack: 3, health: 6, keywords: ["charge"], target: "none", text: "속공. 시간성전 전개를 안정시키는 유닛.", flavor: "시간성전 크로노리움 전투기록 14. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_15", name: "크로노리움 리버스 나이트", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "rare", element: "storm", cost: 5, attack: 4, health: 6, onSummon: { kind: "damage_core", amount: 1 }, target: "none", text: "소환 시 상대 코어에 1 피해.", flavor: "시간성전 크로노리움 전투기록 15. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_16", name: "크로노리움 아워글라스 비숍", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "epic", element: "neutral", cost: 3, attack: 3, health: 7, keywords: ["pierce"], onSummon: { kind: "gain_energy", amount: 1 }, target: "none", text: "관통. 소환 시 이번 턴 에너지 1 회복.", flavor: "시간성전 크로노리움 전투기록 16. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "gain_energy_if_series", amount: 1, minimumAllies: 2 } },
  { id: "v26_chronorium_unit_17", name: "크로노리움 모먼트 드라군", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "epic", element: "lunar", cost: 3, attack: 3, health: 6, onSummon: { kind: "draw", amount: 1 }, target: "none", text: "소환 시 카드 1장을 뽑습니다.", flavor: "시간성전 크로노리움 전투기록 17. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_18", name: "크로노리움 패러독스 워든", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "epic", element: "storm", cost: 3, attack: 3, health: 5, keywords: ["charge"], onSummon: { kind: "shield_unit", amount: 1 }, target: "none", text: "속공. 소환 시 아군 유닛 하나에게 보호막 1.", flavor: "시간성전 크로노리움 전투기록 18. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_19", name: "크로노리움 에이지 브레이커", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "epic", element: "neutral", cost: 4, attack: 4, health: 8, onSummon: { kind: "damage_core", amount: 1 }, target: "none", text: "소환 시 상대 코어에 1 피해.", flavor: "시간성전 크로노리움 전투기록 19. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_unit_20", name: "크로노리움 이터널 캡틴", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "epic", element: "lunar", cost: 5, attack: 5, health: 8, keywords: ["pierce"], onSummon: { kind: "gain_energy", amount: 1 }, target: "none", text: "관통. 소환 시 이번 턴 에너지 1 회복.", flavor: "시간성전 크로노리움 전투기록 20. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "search_series", amount: 1 } },
  { id: "v26_chronorium_unit_21", name: "크로노리움 크로노스 레갈리아", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "legendary", element: "storm", cost: 7, attack: 8, health: 10, keywords: ["charge"], onSummon: { kind: "draw", amount: 1 }, target: "none", text: "속공. 소환 시 카드 1장을 뽑습니다.", flavor: "시간성전 크로노리움 전투기록 21. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "search_series", amount: 1 } },
  { id: "v26_chronorium_unit_22", name: "크로노리움 제로월드 아비터", subtitle: "시간 가속 · 에너지 재배치 전개 유닛", kind: "unit", rarity: "legendary", element: "neutral", cost: 6, attack: 7, health: 11, keywords: ["charge", "lifesteal"], onSummon: { kind: "shield_unit", amount: 1 }, target: "none", text: "속공 · 흡수. 소환 시 아군 유닛 하나에게 보호막 1.", flavor: "시간성전 크로노리움 전투기록 22. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "search_series", amount: 1 } },
  { id: "v26_chronorium_spell_01", name: "크로노리움 오더 - 퀵 스타트", subtitle: "크로노리움 전용 전술 카드", kind: "spell", rarity: "common", element: "lunar", cost: 1, effect: { kind: "gain_energy", amount: 2 }, target: "none", text: "이번 턴 에너지 2 회복.", flavor: "크로노리움의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_spell_02", name: "크로노리움 오더 - 리와인드 코드", subtitle: "크로노리움 전용 전술 카드", kind: "spell", rarity: "common", element: "storm", cost: 2, effect: { kind: "shield_unit", amount: 3 }, target: "friendly_unit", text: "아군 유닛 하나에게 보호막 3.", flavor: "크로노리움의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_spell_03", name: "크로노리움 오더 - 스톱 더 모먼트", subtitle: "크로노리움 전용 전술 카드", kind: "spell", rarity: "rare", element: "neutral", cost: 2, effect: { kind: "damage_unit", amount: 4 }, target: "enemy_unit", text: "적 유닛 하나에 4 피해.", flavor: "크로노리움의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "gain_energy_if_series", amount: 2, minimumAllies: 3 } },
  { id: "v26_chronorium_spell_04", name: "크로노리움 오더 - 초침 가속", subtitle: "크로노리움 전용 전술 카드", kind: "spell", rarity: "rare", element: "lunar", cost: 3, effect: { kind: "draw", amount: 2 }, target: "none", text: "카드 2장을 뽑습니다.", flavor: "크로노리움의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_spell_05", name: "크로노리움 오더 - 타임 시프트", subtitle: "크로노리움 전용 전술 카드", kind: "spell", rarity: "rare", element: "storm", cost: 3, effect: { kind: "gain_energy", amount: 2 }, target: "none", text: "이번 턴 에너지 2 회복.", flavor: "크로노리움의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_spell_06", name: "크로노리움 오더 - 패러독스 루프", subtitle: "크로노리움 전용 전술 카드", kind: "spell", rarity: "epic", element: "neutral", cost: 4, effect: { kind: "shield_unit", amount: 3 }, target: "friendly_unit", text: "아군 유닛 하나에게 보호막 3.", flavor: "크로노리움의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "recover_series", amount: 1 } },
  { id: "v26_chronorium_spell_07", name: "크로노리움 오더 - 영겁의 윤환", subtitle: "크로노리움 전용 전술 카드", kind: "spell", rarity: "epic", element: "lunar", cost: 5, effect: { kind: "damage_unit", amount: 4 }, target: "enemy_unit", text: "적 유닛 하나에 4 피해.", flavor: "크로노리움의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_spell_08", name: "크로노리움 오더 - 최후시각 00:00", subtitle: "크로노리움 전용 전술 카드", kind: "spell", rarity: "legendary", element: "storm", cost: 6, effect: { kind: "draw", amount: 2 }, target: "none", text: "카드 2장을 뽑습니다.", flavor: "크로노리움의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "gain_energy_if_series", amount: 1, minimumAllies: 2 } },
  { id: "v26_chronorium_trap_01", name: "크로노리움 리액터 - 지연 발동", subtitle: "크로노리움 전용 대응 카드", kind: "trap", rarity: "common", element: "storm", cost: 1, trapTrigger: "unit_summoned", trapEffect: { kind: "damage_unit", amount: 2 }, target: "none", text: "상대가 유닛을 소환했을 때, 해당 유닛에 2 피해.", flavor: "크로노리움는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_trap_02", name: "크로노리움 리액터 - 스톱워치 봉인", subtitle: "크로노리움 전용 대응 카드", kind: "trap", rarity: "common", element: "neutral", cost: 2, trapTrigger: "spell_played", trapEffect: { kind: "negate" }, target: "none", text: "상대가 주문을 발동했을 때, 그 발동을 무효화.", flavor: "크로노리움는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_trap_03", name: "크로노리움 리액터 - 리버스 타이밍", subtitle: "크로노리움 전용 대응 카드", kind: "trap", rarity: "rare", element: "lunar", cost: 2, trapTrigger: "unit_attacked", trapEffect: { kind: "buff_unit", attack: 2, health: 2 }, target: "none", text: "내 유닛이 공격받을 때, 공격받은 아군에게 공격력 +2, 체력 +2.", flavor: "크로노리움는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_trap_04", name: "크로노리움 리액터 - 시간차 매복", subtitle: "크로노리움 전용 대응 카드", kind: "trap", rarity: "rare", element: "storm", cost: 3, trapTrigger: "direct_attack", trapEffect: { kind: "negate_and_damage", amount: 2 }, target: "none", text: "상대가 코어를 직접 공격했을 때, 그 행동을 무효화하고 2 피해를 되돌립니다.", flavor: "크로노리움는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "search_series", amount: 1 } },
  { id: "v26_chronorium_trap_05", name: "크로노리움 리액터 - 영원의 감옥", subtitle: "크로노리움 전용 대응 카드", kind: "trap", rarity: "epic", element: "neutral", cost: 4, trapTrigger: "special_summoned", trapEffect: { kind: "damage_unit", amount: 4 }, target: "none", text: "상대가 특수 소환했을 때, 해당 유닛에 4 피해.", flavor: "크로노리움는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "시간성전 크로노리움", seriesId: "chronorium" },
  { id: "v26_chronorium_trap_06", name: "크로노리움 리액터 - 파이널 카운트", subtitle: "크로노리움 전용 대응 카드", kind: "trap", rarity: "legendary", element: "lunar", cost: 5, trapTrigger: "direct_attack", trapEffect: { kind: "negate_and_damage", amount: 3 }, target: "none", text: "상대가 코어를 직접 공격했을 때, 그 행동을 무효화하고 3 피해를 되돌립니다.", flavor: "크로노리움는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "gain_energy_if_series", amount: 2, minimumAllies: 3 } },
  { id: "v26_chronorium_fusion_01", name: "크로노리움 크로스 - 패러독스 드래곤", subtitle: "크로노리움의 공명 융합 최종체", kind: "fusion", rarity: "epic", element: "neutral", cost: 6, attack: 8, health: 8, keywords: ["guard"], summonMode: "fusion", fusionRecipe: { label: "크로노리움 유닛 2장 공명", materials: [{ label: "크로노리움 소재 A", cardIds: ["v26_chronorium_unit_16", "v26_chronorium_unit_18"] }, { label: "크로노리움 소재 B", cardIds: ["v26_chronorium_unit_20", "v26_chronorium_unit_21"] }] }, onSummon: { kind: "draw", amount: 1 }, target: "none", text: "공명 융합. 소환 시 카드 1장을 뽑습니다.", flavor: "시간성전 크로노리움의 두 전술축이 하나의 프레임으로 합쳐진 결전형.", sigil: "☯", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "gain_energy_if_series", amount: 1, minimumAllies: 2 } },
  { id: "v26_chronorium_fusion_02", name: "크로노리움 크로스 - 이터널 레귤레이터", subtitle: "크로노리움의 공명 융합 최종체", kind: "fusion", rarity: "legendary", element: "lunar", cost: 7, attack: 10, health: 10, keywords: ["guard", "pierce"], summonMode: "fusion", fusionRecipe: { label: "크로노리움 유닛 2장 공명", materials: [{ label: "크로노리움 소재 A", cardIds: ["v26_chronorium_unit_16", "v26_chronorium_unit_18"] }, { label: "크로노리움 소재 B", cardIds: ["v26_chronorium_unit_20", "v26_chronorium_unit_21"] }] }, onSummon: { kind: "draw", amount: 2 }, target: "none", text: "공명 융합. 소환 시 카드 2장을 뽑습니다.", flavor: "시간성전 크로노리움의 두 전술축이 하나의 프레임으로 합쳐진 결전형.", sigil: "☯", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "search_series", amount: 1 } },
  { id: "v26_chronorium_evolution_01", name: "크로노리움 어센드 - 제로아워 엠페러", subtitle: "크로노리움의 계승 진화 최종체", kind: "evolution", rarity: "epic", element: "lunar", cost: 6, attack: 9, health: 8, keywords: ["charge"], summonMode: "evolution", evolutionRecipe: { label: "크로노리움 계승", fromIds: ["v26_chronorium_unit_19"] }, onSummon: { kind: "shield_unit", amount: 2 }, target: "none", text: "계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 소환 시 아군 유닛 하나에게 보호막 2.", flavor: "크로노리움의 전투 데이터가 임계점을 넘어 다음 세대의 형태로 계승되었다.", sigil: "✧", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "recover_series", amount: 1 } },
  { id: "v26_chronorium_evolution_02", name: "크로노리움 어센드 - 크로노스 오메가", subtitle: "크로노리움의 계승 진화 최종체", kind: "evolution", rarity: "legendary", element: "storm", cost: 7, attack: 11, health: 10, keywords: ["charge", "lifesteal"], summonMode: "evolution", evolutionRecipe: { label: "크로노리움 계승", fromIds: ["v26_chronorium_unit_20"] }, onSummon: { kind: "shield_unit", amount: 3 }, target: "none", text: "계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 소환 시 아군 유닛 하나에게 보호막 3.", flavor: "크로노리움의 전투 데이터가 임계점을 넘어 다음 세대의 형태로 계승되었다.", sigil: "✧", series: "시간성전 크로노리움", seriesId: "chronorium", seriesAbility: { kind: "gain_energy_if_series", amount: 2, minimumAllies: 3 } },
  { id: "v26_arcana_protocol_unit_01", name: "아르카나 프로토콜 룬 스크라이브", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "common", element: "lunar", cost: 1, attack: 1, health: 4, target: "none", text: "마도규약 전개를 안정시키는 유닛.", flavor: "마도규약 아르카나 프로토콜 전투기록 01. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_02", name: "아르카나 프로토콜 마나 리더", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "common", element: "void", cost: 2, attack: 1, health: 4, target: "none", text: "마도규약 전개를 안정시키는 유닛.", flavor: "마도규약 아르카나 프로토콜 전투기록 02. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_03", name: "아르카나 프로토콜 헥스 페이지", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "common", element: "neutral", cost: 3, attack: 2, health: 4, onSummon: { kind: "gain_energy", amount: 1 }, target: "none", text: "소환 시 이번 턴 에너지 1 회복.", flavor: "마도규약 아르카나 프로토콜 전투기록 03. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_04", name: "아르카나 프로토콜 아스트랄 리브라", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "common", element: "lunar", cost: 4, attack: 3, health: 7, target: "none", text: "마도규약 전개를 안정시키는 유닛.", flavor: "마도규약 아르카나 프로토콜 전투기록 04. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "recover_series", amount: 1 } },
  { id: "v26_arcana_protocol_unit_05", name: "아르카나 프로토콜 오브 위스퍼러", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "common", element: "void", cost: 5, attack: 4, health: 7, target: "none", text: "마도규약 전개를 안정시키는 유닛.", flavor: "마도규약 아르카나 프로토콜 전투기록 05. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_06", name: "아르카나 프로토콜 세븐스 시커", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "common", element: "neutral", cost: 1, attack: 1, health: 2, onSummon: { kind: "heal_core", amount: 2 }, target: "none", text: "소환 시 내 코어를 2 회복.", flavor: "마도규약 아르카나 프로토콜 전투기록 06. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_07", name: "아르카나 프로토콜 그리모어 가드", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "common", element: "lunar", cost: 2, attack: 1, health: 5, target: "none", text: "마도규약 전개를 안정시키는 유닛.", flavor: "마도규약 아르카나 프로토콜 전투기록 07. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_08", name: "아르카나 프로토콜 마기아 링크러", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "common", element: "void", cost: 3, attack: 2, health: 5, target: "none", text: "마도규약 전개를 안정시키는 유닛.", flavor: "마도규약 아르카나 프로토콜 전투기록 08. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "shield_series", amount: 1 } },
  { id: "v26_arcana_protocol_unit_09", name: "아르카나 프로토콜 펜타클 메이지", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "rare", element: "neutral", cost: 4, attack: 3, health: 5, onSummon: { kind: "shield_unit", amount: 1 }, target: "none", text: "소환 시 아군 유닛 하나에게 보호막 1.", flavor: "마도규약 아르카나 프로토콜 전투기록 09. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_10", name: "아르카나 프로토콜 아케인 레이더", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "rare", element: "lunar", cost: 5, attack: 4, health: 8, keywords: ["charge"], target: "none", text: "속공. 마도규약 전개를 안정시키는 유닛.", flavor: "마도규약 아르카나 프로토콜 전투기록 10. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_11", name: "아르카나 프로토콜 룬 브레이커", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "rare", element: "void", cost: 2, attack: 1, health: 4, target: "none", text: "마도규약 전개를 안정시키는 유닛.", flavor: "마도규약 아르카나 프로토콜 전투기록 11. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_12", name: "아르카나 프로토콜 미스틱 큐레이터", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "rare", element: "neutral", cost: 2, attack: 1, health: 3, keywords: ["pierce"], onSummon: { kind: "draw", amount: 1 }, target: "none", text: "관통. 소환 시 카드 1장을 뽑습니다.", flavor: "마도규약 아르카나 프로토콜 전투기록 12. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "search_series", amount: 2 } },
  { id: "v26_arcana_protocol_unit_13", name: "아르카나 프로토콜 소울 인덱서", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "rare", element: "lunar", cost: 3, attack: 2, health: 6, target: "none", text: "마도규약 전개를 안정시키는 유닛.", flavor: "마도규약 아르카나 프로토콜 전투기록 13. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_14", name: "아르카나 프로토콜 위치 크래프터", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "rare", element: "void", cost: 4, attack: 3, health: 6, keywords: ["charge"], target: "none", text: "속공. 마도규약 전개를 안정시키는 유닛.", flavor: "마도규약 아르카나 프로토콜 전투기록 14. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_15", name: "아르카나 프로토콜 포뮬러 나이트", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "rare", element: "neutral", cost: 5, attack: 4, health: 6, onSummon: { kind: "gain_energy", amount: 1 }, target: "none", text: "소환 시 이번 턴 에너지 1 회복.", flavor: "마도규약 아르카나 프로토콜 전투기록 15. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_16", name: "아르카나 프로토콜 오컬트 아카이비스트", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "epic", element: "lunar", cost: 3, attack: 3, health: 7, keywords: ["pierce"], onSummon: { kind: "draw", amount: 1 }, target: "none", text: "관통. 소환 시 카드 1장을 뽑습니다.", flavor: "마도규약 아르카나 프로토콜 전투기록 16. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "search_series", amount: 1 } },
  { id: "v26_arcana_protocol_unit_17", name: "아르카나 프로토콜 마나 엑시큐터", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "epic", element: "void", cost: 3, attack: 3, health: 6, onSummon: { kind: "shield_unit", amount: 1 }, target: "none", text: "소환 시 아군 유닛 하나에게 보호막 1.", flavor: "마도규약 아르카나 프로토콜 전투기록 17. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_18", name: "아르카나 프로토콜 아르카넘 프리스트", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "epic", element: "neutral", cost: 3, attack: 3, health: 5, keywords: ["charge"], onSummon: { kind: "heal_core", amount: 2 }, target: "none", text: "속공. 소환 시 내 코어를 2 회복.", flavor: "마도규약 아르카나 프로토콜 전투기록 18. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_19", name: "아르카나 프로토콜 시질 마스터", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "epic", element: "lunar", cost: 4, attack: 4, health: 8, onSummon: { kind: "gain_energy", amount: 1 }, target: "none", text: "소환 시 이번 턴 에너지 1 회복.", flavor: "마도규약 아르카나 프로토콜 전투기록 19. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_unit_20", name: "아르카나 프로토콜 코덱스 소버린", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "epic", element: "void", cost: 5, attack: 5, health: 8, keywords: ["pierce"], onSummon: { kind: "draw", amount: 1 }, target: "none", text: "관통. 소환 시 카드 1장을 뽑습니다.", flavor: "마도규약 아르카나 프로토콜 전투기록 20. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "recover_series", amount: 1 } },
  { id: "v26_arcana_protocol_unit_21", name: "아르카나 프로토콜 그랜드 마기스터", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "legendary", element: "neutral", cost: 7, attack: 8, health: 10, keywords: ["charge"], onSummon: { kind: "shield_unit", amount: 1 }, target: "none", text: "속공. 소환 시 아군 유닛 하나에게 보호막 1.", flavor: "마도규약 아르카나 프로토콜 전투기록 21. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "recover_series", amount: 1 } },
  { id: "v26_arcana_protocol_unit_22", name: "아르카나 프로토콜 프로토콜 오메가", subtitle: "주문 연쇄 · 서치 전개 유닛", kind: "unit", rarity: "legendary", element: "lunar", cost: 6, attack: 7, health: 11, keywords: ["charge", "lifesteal"], onSummon: { kind: "heal_core", amount: 2 }, target: "none", text: "속공 · 흡수. 소환 시 내 코어를 2 회복.", flavor: "마도규약 아르카나 프로토콜 전투기록 22. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "recover_series", amount: 1 } },
  { id: "v26_arcana_protocol_spell_01", name: "아르카나 프로토콜 오더 - 룬 인덱싱", subtitle: "아르카나 프로토콜 전용 전술 카드", kind: "spell", rarity: "common", element: "void", cost: 1, effect: { kind: "heal_core", amount: 4 }, target: "none", text: "내 코어를 4 회복.", flavor: "아르카나 프로토콜의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_spell_02", name: "아르카나 프로토콜 오더 - 그리모어 오픈", subtitle: "아르카나 프로토콜 전용 전술 카드", kind: "spell", rarity: "common", element: "neutral", cost: 2, effect: { kind: "damage_unit", amount: 4 }, target: "enemy_unit", text: "적 유닛 하나에 4 피해.", flavor: "아르카나 프로토콜의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_spell_03", name: "아르카나 프로토콜 오더 - 마나 리라이트", subtitle: "아르카나 프로토콜 전용 전술 카드", kind: "spell", rarity: "rare", element: "lunar", cost: 2, effect: { kind: "buff_unit", attack: 2, health: 2 }, target: "friendly_unit", text: "아군 유닛 하나에게 공격력 +2, 체력 +2.", flavor: "아르카나 프로토콜의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "search_series", amount: 2 } },
  { id: "v26_arcana_protocol_spell_04", name: "아르카나 프로토콜 오더 - 아스트랄 계산식", subtitle: "아르카나 프로토콜 전용 전술 카드", kind: "spell", rarity: "rare", element: "void", cost: 3, effect: { kind: "draw", amount: 2 }, target: "none", text: "카드 2장을 뽑습니다.", flavor: "아르카나 프로토콜의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_spell_05", name: "아르카나 프로토콜 오더 - 세븐스 포뮬러", subtitle: "아르카나 프로토콜 전용 전술 카드", kind: "spell", rarity: "rare", element: "neutral", cost: 3, effect: { kind: "heal_core", amount: 4 }, target: "none", text: "내 코어를 4 회복.", flavor: "아르카나 프로토콜의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_spell_06", name: "아르카나 프로토콜 오더 - 프로토콜 오버라이드", subtitle: "아르카나 프로토콜 전용 전술 카드", kind: "spell", rarity: "epic", element: "lunar", cost: 4, effect: { kind: "damage_unit", amount: 4 }, target: "enemy_unit", text: "적 유닛 하나에 4 피해.", flavor: "아르카나 프로토콜의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "shield_series", amount: 1 } },
  { id: "v26_arcana_protocol_spell_07", name: "아르카나 프로토콜 오더 - 아르카넘 리콜", subtitle: "아르카나 프로토콜 전용 전술 카드", kind: "spell", rarity: "epic", element: "void", cost: 5, effect: { kind: "buff_unit", attack: 2, health: 2 }, target: "friendly_unit", text: "아군 유닛 하나에게 공격력 +2, 체력 +2.", flavor: "아르카나 프로토콜의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_spell_08", name: "아르카나 프로토콜 오더 - 금단규약 제13식", subtitle: "아르카나 프로토콜 전용 전술 카드", kind: "spell", rarity: "legendary", element: "neutral", cost: 6, effect: { kind: "draw", amount: 2 }, target: "none", text: "카드 2장을 뽑습니다.", flavor: "아르카나 프로토콜의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "search_series", amount: 1 } },
  { id: "v26_arcana_protocol_trap_01", name: "아르카나 프로토콜 리액터 - 룬 카운터", subtitle: "아르카나 프로토콜 전용 대응 카드", kind: "trap", rarity: "common", element: "neutral", cost: 1, trapTrigger: "unit_summoned", trapEffect: { kind: "damage_unit", amount: 2 }, target: "none", text: "상대가 유닛을 소환했을 때, 해당 유닛에 2 피해.", flavor: "아르카나 프로토콜는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_trap_02", name: "아르카나 프로토콜 리액터 - 마나 실링", subtitle: "아르카나 프로토콜 전용 대응 카드", kind: "trap", rarity: "common", element: "lunar", cost: 2, trapTrigger: "spell_played", trapEffect: { kind: "negate" }, target: "none", text: "상대가 주문을 발동했을 때, 그 발동을 무효화.", flavor: "아르카나 프로토콜는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_trap_03", name: "아르카나 프로토콜 리액터 - 시질 리버설", subtitle: "아르카나 프로토콜 전용 대응 카드", kind: "trap", rarity: "rare", element: "void", cost: 2, trapTrigger: "unit_attacked", trapEffect: { kind: "buff_unit", attack: 2, health: 2 }, target: "none", text: "내 유닛이 공격받을 때, 공격받은 아군에게 공격력 +2, 체력 +2.", flavor: "아르카나 프로토콜는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_trap_04", name: "아르카나 프로토콜 리액터 - 그리모어 트랩", subtitle: "아르카나 프로토콜 전용 대응 카드", kind: "trap", rarity: "rare", element: "neutral", cost: 3, trapTrigger: "direct_attack", trapEffect: { kind: "negate_and_damage", amount: 2 }, target: "none", text: "상대가 코어를 직접 공격했을 때, 그 행동을 무효화하고 2 피해를 되돌립니다.", flavor: "아르카나 프로토콜는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "recover_series", amount: 1 } },
  { id: "v26_arcana_protocol_trap_05", name: "아르카나 프로토콜 리액터 - 프로토콜 차단", subtitle: "아르카나 프로토콜 전용 대응 카드", kind: "trap", rarity: "epic", element: "lunar", cost: 4, trapTrigger: "special_summoned", trapEffect: { kind: "damage_unit", amount: 4 }, target: "none", text: "상대가 특수 소환했을 때, 해당 유닛에 4 피해.", flavor: "아르카나 프로토콜는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol" },
  { id: "v26_arcana_protocol_trap_06", name: "아르카나 프로토콜 리액터 - 금서 봉인진", subtitle: "아르카나 프로토콜 전용 대응 카드", kind: "trap", rarity: "legendary", element: "void", cost: 5, trapTrigger: "direct_attack", trapEffect: { kind: "negate_and_damage", amount: 3 }, target: "none", text: "상대가 코어를 직접 공격했을 때, 그 행동을 무효화하고 3 피해를 되돌립니다.", flavor: "아르카나 프로토콜는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "search_series", amount: 2 } },
  { id: "v26_arcana_protocol_fusion_01", name: "아르카나 프로토콜 크로스 - 그리모어 세라프", subtitle: "아르카나 프로토콜의 공명 융합 최종체", kind: "fusion", rarity: "epic", element: "lunar", cost: 6, attack: 8, health: 8, keywords: ["guard"], summonMode: "fusion", fusionRecipe: { label: "아르카나 프로토콜 유닛 2장 공명", materials: [{ label: "아르카나 프로토콜 소재 A", cardIds: ["v26_arcana_protocol_unit_16", "v26_arcana_protocol_unit_18"] }, { label: "아르카나 프로토콜 소재 B", cardIds: ["v26_arcana_protocol_unit_20", "v26_arcana_protocol_unit_21"] }] }, onSummon: { kind: "draw", amount: 1 }, target: "none", text: "공명 융합. 소환 시 카드 1장을 뽑습니다.", flavor: "마도규약 아르카나 프로토콜의 두 전술축이 하나의 프레임으로 합쳐진 결전형.", sigil: "☯", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "search_series", amount: 1 } },
  { id: "v26_arcana_protocol_fusion_02", name: "아르카나 프로토콜 크로스 - 금단의 아카나", subtitle: "아르카나 프로토콜의 공명 융합 최종체", kind: "fusion", rarity: "legendary", element: "void", cost: 7, attack: 10, health: 10, keywords: ["guard", "pierce"], summonMode: "fusion", fusionRecipe: { label: "아르카나 프로토콜 유닛 2장 공명", materials: [{ label: "아르카나 프로토콜 소재 A", cardIds: ["v26_arcana_protocol_unit_16", "v26_arcana_protocol_unit_18"] }, { label: "아르카나 프로토콜 소재 B", cardIds: ["v26_arcana_protocol_unit_20", "v26_arcana_protocol_unit_21"] }] }, onSummon: { kind: "draw", amount: 2 }, target: "none", text: "공명 융합. 소환 시 카드 2장을 뽑습니다.", flavor: "마도규약 아르카나 프로토콜의 두 전술축이 하나의 프레임으로 합쳐진 결전형.", sigil: "☯", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "recover_series", amount: 1 } },
  { id: "v26_arcana_protocol_evolution_01", name: "아르카나 프로토콜 어센드 - 마기스터 제로", subtitle: "아르카나 프로토콜의 계승 진화 최종체", kind: "evolution", rarity: "epic", element: "void", cost: 6, attack: 9, health: 8, keywords: ["charge"], summonMode: "evolution", evolutionRecipe: { label: "아르카나 프로토콜 계승", fromIds: ["v26_arcana_protocol_unit_19"] }, onSummon: { kind: "shield_unit", amount: 2 }, target: "none", text: "계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 소환 시 아군 유닛 하나에게 보호막 2.", flavor: "아르카나 프로토콜의 전투 데이터가 임계점을 넘어 다음 세대의 형태로 계승되었다.", sigil: "✧", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "shield_series", amount: 1 } },
  { id: "v26_arcana_protocol_evolution_02", name: "아르카나 프로토콜 어센드 - 프로토콜 인피니티", subtitle: "아르카나 프로토콜의 계승 진화 최종체", kind: "evolution", rarity: "legendary", element: "neutral", cost: 7, attack: 11, health: 10, keywords: ["charge", "lifesteal"], summonMode: "evolution", evolutionRecipe: { label: "아르카나 프로토콜 계승", fromIds: ["v26_arcana_protocol_unit_20"] }, onSummon: { kind: "shield_unit", amount: 3 }, target: "none", text: "계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 소환 시 아군 유닛 하나에게 보호막 3.", flavor: "아르카나 프로토콜의 전투 데이터가 임계점을 넘어 다음 세대의 형태로 계승되었다.", sigil: "✧", series: "마도규약 아르카나 프로토콜", seriesId: "arcana_protocol", seriesAbility: { kind: "search_series", amount: 2 } },
  { id: "v26_beastforge_unit_01", name: "비스트포지 팽 스카우트", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "common", element: "verdant", cost: 1, attack: 1, health: 4, target: "none", text: "야수기갑 전개를 안정시키는 유닛.", flavor: "야수기갑 비스트포지 전투기록 01. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_02", name: "비스트포지 혼 러너", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "common", element: "solar", cost: 2, attack: 1, health: 4, target: "none", text: "야수기갑 전개를 안정시키는 유닛.", flavor: "야수기갑 비스트포지 전투기록 02. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_03", name: "비스트포지 클로 브루저", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "common", element: "neutral", cost: 3, attack: 2, health: 4, onSummon: { kind: "damage_core", amount: 1 }, target: "none", text: "소환 시 상대 코어에 1 피해.", flavor: "야수기갑 비스트포지 전투기록 03. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_04", name: "비스트포지 아이언 울프", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "common", element: "verdant", cost: 4, attack: 3, health: 7, target: "none", text: "야수기갑 전개를 안정시키는 유닛.", flavor: "야수기갑 비스트포지 전투기록 04. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "shield_series", amount: 1 } },
  { id: "v26_beastforge_unit_05", name: "비스트포지 브론즈 라이노", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "common", element: "solar", cost: 5, attack: 4, health: 7, target: "none", text: "야수기갑 전개를 안정시키는 유닛.", flavor: "야수기갑 비스트포지 전투기록 05. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_06", name: "비스트포지 엠버 타이거", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "common", element: "neutral", cost: 1, attack: 1, health: 2, onSummon: { kind: "heal_core", amount: 2 }, target: "none", text: "소환 시 내 코어를 2 회복.", flavor: "야수기갑 비스트포지 전투기록 06. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_07", name: "비스트포지 가이아 베어", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "common", element: "verdant", cost: 2, attack: 1, health: 5, target: "none", text: "야수기갑 전개를 안정시키는 유닛.", flavor: "야수기갑 비스트포지 전투기록 07. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_08", name: "비스트포지 스틸 호크", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "common", element: "solar", cost: 3, attack: 2, health: 5, target: "none", text: "야수기갑 전개를 안정시키는 유닛.", flavor: "야수기갑 비스트포지 전투기록 08. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "buff_series", attack: 1, health: 1 } },
  { id: "v26_beastforge_unit_09", name: "비스트포지 바이트 랜서", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "rare", element: "neutral", cost: 4, attack: 3, health: 5, onSummon: { kind: "shield_unit", amount: 2 }, target: "none", text: "소환 시 아군 유닛 하나에게 보호막 2.", flavor: "야수기갑 비스트포지 전투기록 09. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_10", name: "비스트포지 와일드 메카닉", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "rare", element: "verdant", cost: 5, attack: 4, health: 8, keywords: ["charge"], target: "none", text: "속공. 야수기갑 전개를 안정시키는 유닛.", flavor: "야수기갑 비스트포지 전투기록 10. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_11", name: "비스트포지 코어 라이온", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "rare", element: "solar", cost: 2, attack: 1, health: 4, target: "none", text: "야수기갑 전개를 안정시키는 유닛.", flavor: "야수기갑 비스트포지 전투기록 11. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_12", name: "비스트포지 기어 보어", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "rare", element: "neutral", cost: 2, attack: 1, health: 3, keywords: ["pierce"], onSummon: { kind: "buff_unit", attack: 1, health: 1 }, target: "none", text: "관통. 소환 시 아군 유닛 하나에게 공격력 +1, 체력 +1.", flavor: "야수기갑 비스트포지 전투기록 12. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "heal_per_series", amount: 1, cap: 4 } },
  { id: "v26_beastforge_unit_13", name: "비스트포지 썬더 재규어", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "rare", element: "verdant", cost: 3, attack: 2, health: 6, target: "none", text: "야수기갑 전개를 안정시키는 유닛.", flavor: "야수기갑 비스트포지 전투기록 13. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_14", name: "비스트포지 포지 맘모스", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "rare", element: "solar", cost: 4, attack: 3, health: 6, keywords: ["charge"], target: "none", text: "속공. 야수기갑 전개를 안정시키는 유닛.", flavor: "야수기갑 비스트포지 전투기록 14. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_15", name: "비스트포지 크롬 와이번", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "rare", element: "neutral", cost: 5, attack: 4, health: 6, onSummon: { kind: "damage_core", amount: 1 }, target: "none", text: "소환 시 상대 코어에 1 피해.", flavor: "야수기갑 비스트포지 전투기록 15. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_16", name: "비스트포지 야수장갑 세이버", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "epic", element: "verdant", cost: 3, attack: 3, health: 7, keywords: ["pierce"], onSummon: { kind: "buff_unit", attack: 1, health: 1 }, target: "none", text: "관통. 소환 시 아군 유닛 하나에게 공격력 +1, 체력 +1.", flavor: "야수기갑 비스트포지 전투기록 16. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "buff_series", attack: 1, health: 0 } },
  { id: "v26_beastforge_unit_17", name: "비스트포지 메탈 그리즐리", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "epic", element: "solar", cost: 3, attack: 3, health: 6, onSummon: { kind: "shield_unit", amount: 2 }, target: "none", text: "소환 시 아군 유닛 하나에게 보호막 2.", flavor: "야수기갑 비스트포지 전투기록 17. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_18", name: "비스트포지 베히모스 드라이버", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "epic", element: "neutral", cost: 3, attack: 3, health: 5, keywords: ["charge"], onSummon: { kind: "heal_core", amount: 2 }, target: "none", text: "속공. 소환 시 내 코어를 2 회복.", flavor: "야수기갑 비스트포지 전투기록 18. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_19", name: "비스트포지 알파 프레데터", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "epic", element: "verdant", cost: 4, attack: 4, health: 8, onSummon: { kind: "damage_core", amount: 1 }, target: "none", text: "소환 시 상대 코어에 1 피해.", flavor: "야수기갑 비스트포지 전투기록 19. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_unit_20", name: "비스트포지 타이탄 팽", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "epic", element: "solar", cost: 5, attack: 5, health: 8, keywords: ["pierce"], onSummon: { kind: "buff_unit", attack: 1, health: 1 }, target: "none", text: "관통. 소환 시 아군 유닛 하나에게 공격력 +1, 체력 +1.", flavor: "야수기갑 비스트포지 전투기록 20. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "shield_series", amount: 1 } },
  { id: "v26_beastforge_unit_21", name: "비스트포지 비스트 카이저", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "legendary", element: "neutral", cost: 7, attack: 8, health: 10, keywords: ["charge"], onSummon: { kind: "shield_unit", amount: 2 }, target: "none", text: "속공. 소환 시 아군 유닛 하나에게 보호막 2.", flavor: "야수기갑 비스트포지 전투기록 21. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "shield_series", amount: 1 } },
  { id: "v26_beastforge_unit_22", name: "비스트포지 포지 레비아탄", subtitle: "야수 강화 · 보호막 전개 유닛", kind: "unit", rarity: "legendary", element: "verdant", cost: 6, attack: 7, health: 11, keywords: ["charge", "lifesteal"], onSummon: { kind: "heal_core", amount: 2 }, target: "none", text: "속공 · 흡수. 소환 시 내 코어를 2 회복.", flavor: "야수기갑 비스트포지 전투기록 22. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "shield_series", amount: 1 } },
  { id: "v26_beastforge_spell_01", name: "비스트포지 오더 - 야수코어 점화", subtitle: "비스트포지 전용 전술 카드", kind: "spell", rarity: "common", element: "solar", cost: 1, effect: { kind: "shield_unit", amount: 4 }, target: "friendly_unit", text: "아군 유닛 하나에게 보호막 4.", flavor: "비스트포지의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_spell_02", name: "비스트포지 오더 - 클로 업그레이드", subtitle: "비스트포지 전용 전술 카드", kind: "spell", rarity: "common", element: "neutral", cost: 2, effect: { kind: "heal_core", amount: 4 }, target: "none", text: "내 코어를 4 회복.", flavor: "비스트포지의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_spell_03", name: "비스트포지 오더 - 아이언 하울", subtitle: "비스트포지 전용 전술 카드", kind: "spell", rarity: "rare", element: "verdant", cost: 2, effect: { kind: "summon_token", attack: 3, health: 3, name: "포지 비스트" }, target: "none", text: "빈 유닛 칸에 3/3 포지 비스트 토큰을 소환.", flavor: "비스트포지의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "heal_per_series", amount: 1, cap: 4 } },
  { id: "v26_beastforge_spell_04", name: "비스트포지 오더 - 와일드 싱크", subtitle: "비스트포지 전용 전술 카드", kind: "spell", rarity: "rare", element: "solar", cost: 3, effect: { kind: "buff_unit", attack: 2, health: 3 }, target: "friendly_unit", text: "아군 유닛 하나에게 공격력 +2, 체력 +3.", flavor: "비스트포지의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_spell_05", name: "비스트포지 오더 - 포지 리페어", subtitle: "비스트포지 전용 전술 카드", kind: "spell", rarity: "rare", element: "neutral", cost: 3, effect: { kind: "shield_unit", amount: 4 }, target: "friendly_unit", text: "아군 유닛 하나에게 보호막 4.", flavor: "비스트포지의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_spell_06", name: "비스트포지 오더 - 베히모스 드라이브", subtitle: "비스트포지 전용 전술 카드", kind: "spell", rarity: "epic", element: "verdant", cost: 4, effect: { kind: "heal_core", amount: 4 }, target: "none", text: "내 코어를 4 회복.", flavor: "비스트포지의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "buff_series", attack: 1, health: 1 } },
  { id: "v26_beastforge_spell_07", name: "비스트포지 오더 - 프레데터 코드", subtitle: "비스트포지 전용 전술 카드", kind: "spell", rarity: "epic", element: "solar", cost: 5, effect: { kind: "summon_token", attack: 3, health: 3, name: "포지 비스트" }, target: "none", text: "빈 유닛 칸에 3/3 포지 비스트 토큰을 소환.", flavor: "비스트포지의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_spell_08", name: "비스트포지 오더 - 비스트포지 오버클래드", subtitle: "비스트포지 전용 전술 카드", kind: "spell", rarity: "legendary", element: "neutral", cost: 6, effect: { kind: "buff_unit", attack: 2, health: 3 }, target: "friendly_unit", text: "아군 유닛 하나에게 공격력 +2, 체력 +3.", flavor: "비스트포지의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "buff_series", attack: 1, health: 0 } },
  { id: "v26_beastforge_trap_01", name: "비스트포지 리액터 - 아이언 스네어", subtitle: "비스트포지 전용 대응 카드", kind: "trap", rarity: "common", element: "neutral", cost: 1, trapTrigger: "unit_summoned", trapEffect: { kind: "damage_unit", amount: 2 }, target: "none", text: "상대가 유닛을 소환했을 때, 해당 유닛에 2 피해.", flavor: "비스트포지는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_trap_02", name: "비스트포지 리액터 - 와일드 카운터", subtitle: "비스트포지 전용 대응 카드", kind: "trap", rarity: "common", element: "verdant", cost: 2, trapTrigger: "spell_played", trapEffect: { kind: "negate" }, target: "none", text: "상대가 주문을 발동했을 때, 그 발동을 무효화.", flavor: "비스트포지는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_trap_03", name: "비스트포지 리액터 - 비스트 셸", subtitle: "비스트포지 전용 대응 카드", kind: "trap", rarity: "rare", element: "solar", cost: 2, trapTrigger: "unit_attacked", trapEffect: { kind: "buff_unit", attack: 2, health: 2 }, target: "none", text: "내 유닛이 공격받을 때, 공격받은 아군에게 공격력 +2, 체력 +2.", flavor: "비스트포지는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_trap_04", name: "비스트포지 리액터 - 포지 리액터", subtitle: "비스트포지 전용 대응 카드", kind: "trap", rarity: "rare", element: "neutral", cost: 3, trapTrigger: "direct_attack", trapEffect: { kind: "negate_and_damage", amount: 2 }, target: "none", text: "상대가 코어를 직접 공격했을 때, 그 행동을 무효화하고 2 피해를 되돌립니다.", flavor: "비스트포지는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "shield_series", amount: 1 } },
  { id: "v26_beastforge_trap_05", name: "비스트포지 리액터 - 타이탄 브레이크", subtitle: "비스트포지 전용 대응 카드", kind: "trap", rarity: "epic", element: "verdant", cost: 4, trapTrigger: "special_summoned", trapEffect: { kind: "damage_unit", amount: 4 }, target: "none", text: "상대가 특수 소환했을 때, 해당 유닛에 4 피해.", flavor: "비스트포지는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "야수기갑 비스트포지", seriesId: "beastforge" },
  { id: "v26_beastforge_trap_06", name: "비스트포지 리액터 - 카이저 하울링 월", subtitle: "비스트포지 전용 대응 카드", kind: "trap", rarity: "legendary", element: "solar", cost: 5, trapTrigger: "direct_attack", trapEffect: { kind: "negate_and_damage", amount: 3 }, target: "none", text: "상대가 코어를 직접 공격했을 때, 그 행동을 무효화하고 3 피해를 되돌립니다.", flavor: "비스트포지는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "heal_per_series", amount: 1, cap: 4 } },
  { id: "v26_beastforge_fusion_01", name: "비스트포지 크로스 - 기갑 키메라", subtitle: "비스트포지의 공명 융합 최종체", kind: "fusion", rarity: "epic", element: "verdant", cost: 6, attack: 8, health: 8, keywords: ["guard"], summonMode: "fusion", fusionRecipe: { label: "비스트포지 유닛 2장 공명", materials: [{ label: "비스트포지 소재 A", cardIds: ["v26_beastforge_unit_16", "v26_beastforge_unit_18"] }, { label: "비스트포지 소재 B", cardIds: ["v26_beastforge_unit_20", "v26_beastforge_unit_21"] }] }, onSummon: { kind: "draw", amount: 1 }, target: "none", text: "공명 융합. 소환 시 카드 1장을 뽑습니다.", flavor: "야수기갑 비스트포지의 두 전술축이 하나의 프레임으로 합쳐진 결전형.", sigil: "☯", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "buff_series", attack: 1, health: 0 } },
  { id: "v26_beastforge_fusion_02", name: "비스트포지 크로스 - 메탈 베히모스", subtitle: "비스트포지의 공명 융합 최종체", kind: "fusion", rarity: "legendary", element: "solar", cost: 7, attack: 10, health: 10, keywords: ["guard", "pierce"], summonMode: "fusion", fusionRecipe: { label: "비스트포지 유닛 2장 공명", materials: [{ label: "비스트포지 소재 A", cardIds: ["v26_beastforge_unit_16", "v26_beastforge_unit_18"] }, { label: "비스트포지 소재 B", cardIds: ["v26_beastforge_unit_20", "v26_beastforge_unit_21"] }] }, onSummon: { kind: "draw", amount: 2 }, target: "none", text: "공명 융합. 소환 시 카드 2장을 뽑습니다.", flavor: "야수기갑 비스트포지의 두 전술축이 하나의 프레임으로 합쳐진 결전형.", sigil: "☯", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "shield_series", amount: 1 } },
  { id: "v26_beastforge_evolution_01", name: "비스트포지 어센드 - 프레데터 카이저", subtitle: "비스트포지의 계승 진화 최종체", kind: "evolution", rarity: "epic", element: "solar", cost: 6, attack: 9, health: 8, keywords: ["charge"], summonMode: "evolution", evolutionRecipe: { label: "비스트포지 계승", fromIds: ["v26_beastforge_unit_19"] }, onSummon: { kind: "shield_unit", amount: 2 }, target: "none", text: "계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 소환 시 아군 유닛 하나에게 보호막 2.", flavor: "비스트포지의 전투 데이터가 임계점을 넘어 다음 세대의 형태로 계승되었다.", sigil: "✧", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "buff_series", attack: 1, health: 1 } },
  { id: "v26_beastforge_evolution_02", name: "비스트포지 어센드 - 오메가 레비아탄", subtitle: "비스트포지의 계승 진화 최종체", kind: "evolution", rarity: "legendary", element: "neutral", cost: 7, attack: 11, health: 10, keywords: ["charge", "lifesteal"], summonMode: "evolution", evolutionRecipe: { label: "비스트포지 계승", fromIds: ["v26_beastforge_unit_20"] }, onSummon: { kind: "shield_unit", amount: 3 }, target: "none", text: "계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 소환 시 아군 유닛 하나에게 보호막 3.", flavor: "비스트포지의 전투 데이터가 임계점을 넘어 다음 세대의 형태로 계승되었다.", sigil: "✧", series: "야수기갑 비스트포지", seriesId: "beastforge", seriesAbility: { kind: "heal_per_series", amount: 1, cap: 4 } },
  { id: "v26_phantom_carnival_unit_01", name: "팬텀 카니발 마스크 러너", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "common", element: "void", cost: 1, attack: 1, health: 4, target: "none", text: "몽환극단 전개를 안정시키는 유닛.", flavor: "몽환극단 팬텀 카니발 전투기록 01. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_02", name: "팬텀 카니발 미러 피에로", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "common", element: "lunar", cost: 2, attack: 1, health: 4, target: "none", text: "몽환극단 전개를 안정시키는 유닛.", flavor: "몽환극단 팬텀 카니발 전투기록 02. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_03", name: "팬텀 카니발 베일 댄서", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "common", element: "storm", cost: 3, attack: 2, health: 4, onSummon: { kind: "gain_energy", amount: 1 }, target: "none", text: "소환 시 이번 턴 에너지 1 회복.", flavor: "몽환극단 팬텀 카니발 전투기록 03. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_04", name: "팬텀 카니발 섀도 저글러", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "common", element: "void", cost: 4, attack: 3, health: 7, target: "none", text: "몽환극단 전개를 안정시키는 유닛.", flavor: "몽환극단 팬텀 카니발 전투기록 04. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "damage_core_per_series", amount: 1, cap: 3 } },
  { id: "v26_phantom_carnival_unit_05", name: "팬텀 카니발 루나 마임", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "common", element: "lunar", cost: 5, attack: 4, health: 7, target: "none", text: "몽환극단 전개를 안정시키는 유닛.", flavor: "몽환극단 팬텀 카니발 전투기록 05. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_06", name: "팬텀 카니발 트릭 나이트", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "common", element: "storm", cost: 1, attack: 1, health: 2, onSummon: { kind: "heal_core", amount: 2 }, target: "none", text: "소환 시 내 코어를 2 회복.", flavor: "몽환극단 팬텀 카니발 전투기록 06. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_07", name: "팬텀 카니발 커튼 콜러", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "common", element: "void", cost: 2, attack: 1, health: 5, target: "none", text: "몽환극단 전개를 안정시키는 유닛.", flavor: "몽환극단 팬텀 카니발 전투기록 07. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_08", name: "팬텀 카니발 팬텀 딜러", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "common", element: "lunar", cost: 3, attack: 2, health: 5, target: "none", text: "몽환극단 전개를 안정시키는 유닛.", flavor: "몽환극단 팬텀 카니발 전투기록 08. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "search_series", amount: 1 } },
  { id: "v26_phantom_carnival_unit_09", name: "팬텀 카니발 나이트 퍼펫", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "rare", element: "storm", cost: 4, attack: 3, health: 5, onSummon: { kind: "damage_core", amount: 1 }, target: "none", text: "소환 시 상대 코어에 1 피해.", flavor: "몽환극단 팬텀 카니발 전투기록 09. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_10", name: "팬텀 카니발 스펙터 링마스터", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "rare", element: "void", cost: 5, attack: 4, health: 8, keywords: ["charge"], target: "none", text: "속공. 몽환극단 전개를 안정시키는 유닛.", flavor: "몽환극단 팬텀 카니발 전투기록 10. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_11", name: "팬텀 카니발 에코 매지션", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "rare", element: "lunar", cost: 2, attack: 1, health: 4, target: "none", text: "몽환극단 전개를 안정시키는 유닛.", flavor: "몽환극단 팬텀 카니발 전투기록 11. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_12", name: "팬텀 카니발 미드나이트 클라운", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "rare", element: "storm", cost: 2, attack: 1, health: 3, keywords: ["pierce"], onSummon: { kind: "draw", amount: 1 }, target: "none", text: "관통. 소환 시 카드 1장을 뽑습니다.", flavor: "몽환극단 팬텀 카니발 전투기록 12. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "recover_series", amount: 2 } },
  { id: "v26_phantom_carnival_unit_13", name: "팬텀 카니발 드림 카드셔플러", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "rare", element: "void", cost: 3, attack: 2, health: 6, target: "none", text: "몽환극단 전개를 안정시키는 유닛.", flavor: "몽환극단 팬텀 카니발 전투기록 13. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_14", name: "팬텀 카니발 블랙 마리오네트", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "rare", element: "lunar", cost: 4, attack: 3, health: 6, keywords: ["charge"], target: "none", text: "속공. 몽환극단 전개를 안정시키는 유닛.", flavor: "몽환극단 팬텀 카니발 전투기록 14. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_15", name: "팬텀 카니발 문라이트 일루저니스트", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "rare", element: "storm", cost: 5, attack: 4, health: 6, onSummon: { kind: "gain_energy", amount: 1 }, target: "none", text: "소환 시 이번 턴 에너지 1 회복.", flavor: "몽환극단 팬텀 카니발 전투기록 15. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_16", name: "팬텀 카니발 스테이지 리퍼", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "epic", element: "void", cost: 3, attack: 3, health: 7, keywords: ["pierce"], onSummon: { kind: "draw", amount: 1 }, target: "none", text: "관통. 소환 시 카드 1장을 뽑습니다.", flavor: "몽환극단 팬텀 카니발 전투기록 16. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "recover_series", amount: 1 } },
  { id: "v26_phantom_carnival_unit_17", name: "팬텀 카니발 그림자 프리마", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "epic", element: "lunar", cost: 3, attack: 3, health: 6, onSummon: { kind: "damage_core", amount: 1 }, target: "none", text: "소환 시 상대 코어에 1 피해.", flavor: "몽환극단 팬텀 카니발 전투기록 17. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_18", name: "팬텀 카니발 오페라 팬텀", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "epic", element: "storm", cost: 3, attack: 3, health: 5, keywords: ["charge"], onSummon: { kind: "heal_core", amount: 2 }, target: "none", text: "속공. 소환 시 내 코어를 2 회복.", flavor: "몽환극단 팬텀 카니발 전투기록 18. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_19", name: "팬텀 카니발 라스트 앙코르", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "epic", element: "void", cost: 4, attack: 4, health: 8, onSummon: { kind: "gain_energy", amount: 1 }, target: "none", text: "소환 시 이번 턴 에너지 1 회복.", flavor: "몽환극단 팬텀 카니발 전투기록 19. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_unit_20", name: "팬텀 카니발 카니발 크라운", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "epic", element: "lunar", cost: 5, attack: 5, health: 8, keywords: ["pierce"], onSummon: { kind: "draw", amount: 1 }, target: "none", text: "관통. 소환 시 카드 1장을 뽑습니다.", flavor: "몽환극단 팬텀 카니발 전투기록 20. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "damage_core_per_series", amount: 1, cap: 3 } },
  { id: "v26_phantom_carnival_unit_21", name: "팬텀 카니발 팬텀 디렉터", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "legendary", element: "storm", cost: 7, attack: 8, health: 10, keywords: ["charge"], onSummon: { kind: "damage_core", amount: 1 }, target: "none", text: "속공. 소환 시 상대 코어에 1 피해.", flavor: "몽환극단 팬텀 카니발 전투기록 21. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "damage_core_per_series", amount: 1, cap: 3 } },
  { id: "v26_phantom_carnival_unit_22", name: "팬텀 카니발 제로 스테이지 마스터", subtitle: "함정 연계 · 묘지 회수 전개 유닛", kind: "unit", rarity: "legendary", element: "void", cost: 6, attack: 7, health: 11, keywords: ["charge", "lifesteal"], onSummon: { kind: "heal_core", amount: 2 }, target: "none", text: "속공 · 흡수. 소환 시 내 코어를 2 회복.", flavor: "몽환극단 팬텀 카니발 전투기록 22. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "damage_core_per_series", amount: 1, cap: 3 } },
  { id: "v26_phantom_carnival_spell_01", name: "팬텀 카니발 오더 - 커튼 오픈", subtitle: "팬텀 카니발 전용 전술 카드", kind: "spell", rarity: "common", element: "lunar", cost: 1, effect: { kind: "damage_core", amount: 2 }, target: "none", text: "상대 코어에 2 피해.", flavor: "팬텀 카니발의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_spell_02", name: "팬텀 카니발 오더 - 미러 셔플", subtitle: "팬텀 카니발 전용 전술 카드", kind: "spell", rarity: "common", element: "storm", cost: 2, effect: { kind: "destroy_weak", maxHealth: 3 }, target: "enemy_unit", text: "현재 체력이 3 이하인 적 유닛 하나를 파괴.", flavor: "팬텀 카니발의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_spell_03", name: "팬텀 카니발 오더 - 팬텀 티켓", subtitle: "팬텀 카니발 전용 전술 카드", kind: "spell", rarity: "rare", element: "void", cost: 2, effect: { kind: "heal_core", amount: 4 }, target: "none", text: "내 코어를 4 회복.", flavor: "팬텀 카니발의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "recover_series", amount: 2 } },
  { id: "v26_phantom_carnival_spell_04", name: "팬텀 카니발 오더 - 드림 앙코르", subtitle: "팬텀 카니발 전용 전술 카드", kind: "spell", rarity: "rare", element: "lunar", cost: 3, effect: { kind: "draw", amount: 2 }, target: "none", text: "카드 2장을 뽑습니다.", flavor: "팬텀 카니발의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_spell_05", name: "팬텀 카니발 오더 - 마스크 체인지", subtitle: "팬텀 카니발 전용 전술 카드", kind: "spell", rarity: "rare", element: "storm", cost: 3, effect: { kind: "damage_core", amount: 2 }, target: "none", text: "상대 코어에 2 피해.", flavor: "팬텀 카니발의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_spell_06", name: "팬텀 카니발 오더 - 스테이지 리버스", subtitle: "팬텀 카니발 전용 전술 카드", kind: "spell", rarity: "epic", element: "void", cost: 4, effect: { kind: "destroy_weak", maxHealth: 3 }, target: "enemy_unit", text: "현재 체력이 3 이하인 적 유닛 하나를 파괴.", flavor: "팬텀 카니발의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "search_series", amount: 1 } },
  { id: "v26_phantom_carnival_spell_07", name: "팬텀 카니발 오더 - 라스트 쇼타임", subtitle: "팬텀 카니발 전용 전술 카드", kind: "spell", rarity: "epic", element: "lunar", cost: 5, effect: { kind: "heal_core", amount: 4 }, target: "none", text: "내 코어를 4 회복.", flavor: "팬텀 카니발의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_spell_08", name: "팬텀 카니발 오더 - 그랜드 피날레", subtitle: "팬텀 카니발 전용 전술 카드", kind: "spell", rarity: "legendary", element: "storm", cost: 6, effect: { kind: "draw", amount: 2 }, target: "none", text: "카드 2장을 뽑습니다.", flavor: "팬텀 카니발의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "recover_series", amount: 1 } },
  { id: "v26_phantom_carnival_trap_01", name: "팬텀 카니발 리액터 - 미러 트랩", subtitle: "팬텀 카니발 전용 대응 카드", kind: "trap", rarity: "common", element: "storm", cost: 1, trapTrigger: "unit_summoned", trapEffect: { kind: "damage_unit", amount: 2 }, target: "none", text: "상대가 유닛을 소환했을 때, 해당 유닛에 2 피해.", flavor: "팬텀 카니발는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_trap_02", name: "팬텀 카니발 리액터 - 커튼 폴", subtitle: "팬텀 카니발 전용 대응 카드", kind: "trap", rarity: "common", element: "void", cost: 2, trapTrigger: "spell_played", trapEffect: { kind: "negate" }, target: "none", text: "상대가 주문을 발동했을 때, 그 발동을 무효화.", flavor: "팬텀 카니발는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_trap_03", name: "팬텀 카니발 리액터 - 팬텀 리버스", subtitle: "팬텀 카니발 전용 대응 카드", kind: "trap", rarity: "rare", element: "lunar", cost: 2, trapTrigger: "unit_attacked", trapEffect: { kind: "buff_unit", attack: 2, health: 2 }, target: "none", text: "내 유닛이 공격받을 때, 공격받은 아군에게 공격력 +2, 체력 +2.", flavor: "팬텀 카니발는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_trap_04", name: "팬텀 카니발 리액터 - 마리오네트 스네어", subtitle: "팬텀 카니발 전용 대응 카드", kind: "trap", rarity: "rare", element: "storm", cost: 3, trapTrigger: "direct_attack", trapEffect: { kind: "negate_and_damage", amount: 2 }, target: "none", text: "상대가 코어를 직접 공격했을 때, 그 행동을 무효화하고 2 피해를 되돌립니다.", flavor: "팬텀 카니발는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "damage_core_per_series", amount: 1, cap: 3 } },
  { id: "v26_phantom_carnival_trap_05", name: "팬텀 카니발 리액터 - 블랙아웃 스테이지", subtitle: "팬텀 카니발 전용 대응 카드", kind: "trap", rarity: "epic", element: "void", cost: 4, trapTrigger: "special_summoned", trapEffect: { kind: "damage_unit", amount: 4 }, target: "none", text: "상대가 특수 소환했을 때, 해당 유닛에 4 피해.", flavor: "팬텀 카니발는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival" },
  { id: "v26_phantom_carnival_trap_06", name: "팬텀 카니발 리액터 - 라스트 앙코르 함정", subtitle: "팬텀 카니발 전용 대응 카드", kind: "trap", rarity: "legendary", element: "lunar", cost: 5, trapTrigger: "direct_attack", trapEffect: { kind: "negate_and_damage", amount: 3 }, target: "none", text: "상대가 코어를 직접 공격했을 때, 그 행동을 무효화하고 3 피해를 되돌립니다.", flavor: "팬텀 카니발는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "recover_series", amount: 2 } },
  { id: "v26_phantom_carnival_fusion_01", name: "팬텀 카니발 크로스 - 미러 마리오네트", subtitle: "팬텀 카니발의 공명 융합 최종체", kind: "fusion", rarity: "epic", element: "void", cost: 6, attack: 8, health: 8, keywords: ["guard"], summonMode: "fusion", fusionRecipe: { label: "팬텀 카니발 유닛 2장 공명", materials: [{ label: "팬텀 카니발 소재 A", cardIds: ["v26_phantom_carnival_unit_16", "v26_phantom_carnival_unit_18"] }, { label: "팬텀 카니발 소재 B", cardIds: ["v26_phantom_carnival_unit_20", "v26_phantom_carnival_unit_21"] }] }, onSummon: { kind: "draw", amount: 1 }, target: "none", text: "공명 융합. 소환 시 카드 1장을 뽑습니다.", flavor: "몽환극단 팬텀 카니발의 두 전술축이 하나의 프레임으로 합쳐진 결전형.", sigil: "☯", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "recover_series", amount: 1 } },
  { id: "v26_phantom_carnival_fusion_02", name: "팬텀 카니발 크로스 - 나이트메어 링마스터", subtitle: "팬텀 카니발의 공명 융합 최종체", kind: "fusion", rarity: "legendary", element: "lunar", cost: 7, attack: 10, health: 10, keywords: ["guard", "pierce"], summonMode: "fusion", fusionRecipe: { label: "팬텀 카니발 유닛 2장 공명", materials: [{ label: "팬텀 카니발 소재 A", cardIds: ["v26_phantom_carnival_unit_16", "v26_phantom_carnival_unit_18"] }, { label: "팬텀 카니발 소재 B", cardIds: ["v26_phantom_carnival_unit_20", "v26_phantom_carnival_unit_21"] }] }, onSummon: { kind: "draw", amount: 2 }, target: "none", text: "공명 융합. 소환 시 카드 2장을 뽑습니다.", flavor: "몽환극단 팬텀 카니발의 두 전술축이 하나의 프레임으로 합쳐진 결전형.", sigil: "☯", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "damage_core_per_series", amount: 1, cap: 3 } },
  { id: "v26_phantom_carnival_evolution_01", name: "팬텀 카니발 어센드 - 그랜드 디렉터", subtitle: "팬텀 카니발의 계승 진화 최종체", kind: "evolution", rarity: "epic", element: "lunar", cost: 6, attack: 9, health: 8, keywords: ["charge"], summonMode: "evolution", evolutionRecipe: { label: "팬텀 카니발 계승", fromIds: ["v26_phantom_carnival_unit_19"] }, onSummon: { kind: "shield_unit", amount: 2 }, target: "none", text: "계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 소환 시 아군 유닛 하나에게 보호막 2.", flavor: "팬텀 카니발의 전투 데이터가 임계점을 넘어 다음 세대의 형태로 계승되었다.", sigil: "✧", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "search_series", amount: 1 } },
  { id: "v26_phantom_carnival_evolution_02", name: "팬텀 카니발 어센드 - 엔드리스 쇼", subtitle: "팬텀 카니발의 계승 진화 최종체", kind: "evolution", rarity: "legendary", element: "storm", cost: 7, attack: 11, health: 10, keywords: ["charge", "lifesteal"], summonMode: "evolution", evolutionRecipe: { label: "팬텀 카니발 계승", fromIds: ["v26_phantom_carnival_unit_20"] }, onSummon: { kind: "shield_unit", amount: 3 }, target: "none", text: "계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 소환 시 아군 유닛 하나에게 보호막 3.", flavor: "팬텀 카니발의 전투 데이터가 임계점을 넘어 다음 세대의 형태로 계승되었다.", sigil: "✧", series: "몽환극단 팬텀 카니발", seriesId: "phantom_carnival", seriesAbility: { kind: "recover_series", amount: 2 } },
  { id: "v26_astral_armada_unit_01", name: "아스트라 아르마다 코멧 파일럿", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "common", element: "storm", cost: 1, attack: 1, health: 4, target: "none", text: "성해함대 전개를 안정시키는 유닛.", flavor: "성해함대 아스트라 아르마다 전투기록 01. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_02", name: "아스트라 아르마다 노바 스카우트", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "common", element: "solar", cost: 2, attack: 1, health: 4, target: "none", text: "성해함대 전개를 안정시키는 유닛.", flavor: "성해함대 아스트라 아르마다 전투기록 02. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_03", name: "아스트라 아르마다 루멘 엔지니어", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "common", element: "lunar", cost: 3, attack: 2, health: 4, onSummon: { kind: "damage_core", amount: 1 }, target: "none", text: "소환 시 상대 코어에 1 피해.", flavor: "성해함대 아스트라 아르마다 전투기록 03. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_04", name: "아스트라 아르마다 스타보드 마린", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "common", element: "storm", cost: 4, attack: 3, health: 7, target: "none", text: "성해함대 전개를 안정시키는 유닛.", flavor: "성해함대 아스트라 아르마다 전투기록 04. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "gain_energy_if_series", amount: 1, minimumAllies: 2 } },
  { id: "v26_astral_armada_unit_05", name: "아스트라 아르마다 오비트 거너", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "common", element: "solar", cost: 5, attack: 4, health: 7, target: "none", text: "성해함대 전개를 안정시키는 유닛.", flavor: "성해함대 아스트라 아르마다 전투기록 05. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_06", name: "아스트라 아르마다 셀레스티얼 네비게이터", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "common", element: "lunar", cost: 1, attack: 1, health: 2, onSummon: { kind: "gain_energy", amount: 1 }, target: "none", text: "소환 시 이번 턴 에너지 1 회복.", flavor: "성해함대 아스트라 아르마다 전투기록 06. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_07", name: "아스트라 아르마다 광자 갑판병", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "common", element: "storm", cost: 2, attack: 1, health: 5, target: "none", text: "성해함대 전개를 안정시키는 유닛.", flavor: "성해함대 아스트라 아르마다 전투기록 07. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_08", name: "아스트라 아르마다 크루저 센티널", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "common", element: "solar", cost: 3, attack: 2, health: 5, target: "none", text: "성해함대 전개를 안정시키는 유닛.", flavor: "성해함대 아스트라 아르마다 전투기록 08. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "heal_per_series", amount: 1, cap: 4 } },
  { id: "v26_astral_armada_unit_09", name: "아스트라 아르마다 메테오 랜서", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "rare", element: "lunar", cost: 4, attack: 3, health: 5, onSummon: { kind: "draw", amount: 1 }, target: "none", text: "소환 시 카드 1장을 뽑습니다.", flavor: "성해함대 아스트라 아르마다 전투기록 09. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_10", name: "아스트라 아르마다 아스트라 캡틴", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "rare", element: "storm", cost: 5, attack: 4, health: 8, keywords: ["charge"], target: "none", text: "속공. 성해함대 전개를 안정시키는 유닛.", flavor: "성해함대 아스트라 아르마다 전투기록 10. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_11", name: "아스트라 아르마다 솔라 프리깃", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "rare", element: "solar", cost: 2, attack: 1, health: 4, target: "none", text: "성해함대 전개를 안정시키는 유닛.", flavor: "성해함대 아스트라 아르마다 전투기록 11. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_12", name: "아스트라 아르마다 루나 디스트로이어", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "rare", element: "lunar", cost: 2, attack: 1, health: 3, keywords: ["pierce"], onSummon: { kind: "shield_unit", amount: 2 }, target: "none", text: "관통. 소환 시 아군 유닛 하나에게 보호막 2.", flavor: "성해함대 아스트라 아르마다 전투기록 12. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "buff_series", attack: 1, health: 1 } },
  { id: "v26_astral_armada_unit_13", name: "아스트라 아르마다 네뷸라 캐리어", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "rare", element: "storm", cost: 3, attack: 2, health: 6, target: "none", text: "성해함대 전개를 안정시키는 유닛.", flavor: "성해함대 아스트라 아르마다 전투기록 13. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_14", name: "아스트라 아르마다 퀘이사 포병", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "rare", element: "solar", cost: 4, attack: 3, health: 6, keywords: ["charge"], target: "none", text: "속공. 성해함대 전개를 안정시키는 유닛.", flavor: "성해함대 아스트라 아르마다 전투기록 14. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_15", name: "아스트라 아르마다 스타실드 오퍼레이터", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "rare", element: "lunar", cost: 5, attack: 4, health: 6, onSummon: { kind: "damage_core", amount: 1 }, target: "none", text: "소환 시 상대 코어에 1 피해.", flavor: "성해함대 아스트라 아르마다 전투기록 15. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_16", name: "아스트라 아르마다 코스모스 제독", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "epic", element: "storm", cost: 3, attack: 3, health: 7, keywords: ["pierce"], onSummon: { kind: "shield_unit", amount: 2 }, target: "none", text: "관통. 소환 시 아군 유닛 하나에게 보호막 2.", flavor: "성해함대 아스트라 아르마다 전투기록 16. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "shield_series", amount: 1 } },
  { id: "v26_astral_armada_unit_17", name: "아스트라 아르마다 펄서 드레드노트", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "epic", element: "solar", cost: 3, attack: 3, health: 6, onSummon: { kind: "draw", amount: 1 }, target: "none", text: "소환 시 카드 1장을 뽑습니다.", flavor: "성해함대 아스트라 아르마다 전투기록 17. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_18", name: "아스트라 아르마다 성해 기사함", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "epic", element: "lunar", cost: 3, attack: 3, health: 5, keywords: ["charge"], onSummon: { kind: "gain_energy", amount: 1 }, target: "none", text: "속공. 소환 시 이번 턴 에너지 1 회복.", flavor: "성해함대 아스트라 아르마다 전투기록 18. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_19", name: "아스트라 아르마다 오로라 플래그십", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "epic", element: "storm", cost: 4, attack: 4, health: 8, onSummon: { kind: "damage_core", amount: 1 }, target: "none", text: "소환 시 상대 코어에 1 피해.", flavor: "성해함대 아스트라 아르마다 전투기록 19. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_unit_20", name: "아스트라 아르마다 갤럭시 커맨더", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "epic", element: "solar", cost: 5, attack: 5, health: 8, keywords: ["pierce"], onSummon: { kind: "shield_unit", amount: 2 }, target: "none", text: "관통. 소환 시 아군 유닛 하나에게 보호막 2.", flavor: "성해함대 아스트라 아르마다 전투기록 20. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "gain_energy_if_series", amount: 1, minimumAllies: 2 } },
  { id: "v26_astral_armada_unit_21", name: "아스트라 아르마다 아르마다 소버린", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "legendary", element: "lunar", cost: 7, attack: 8, health: 10, keywords: ["charge"], onSummon: { kind: "draw", amount: 1 }, target: "none", text: "속공. 소환 시 카드 1장을 뽑습니다.", flavor: "성해함대 아스트라 아르마다 전투기록 21. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "gain_energy_if_series", amount: 1, minimumAllies: 2 } },
  { id: "v26_astral_armada_unit_22", name: "아스트라 아르마다 세레스티얼 타이탄", subtitle: "편대 전개 · 실드/에너지 전개 유닛", kind: "unit", rarity: "legendary", element: "storm", cost: 6, attack: 7, health: 11, keywords: ["charge", "lifesteal"], onSummon: { kind: "gain_energy", amount: 1 }, target: "none", text: "속공 · 흡수. 소환 시 이번 턴 에너지 1 회복.", flavor: "성해함대 아스트라 아르마다 전투기록 22. 서로 다른 역할이 한 편대의 승리 조건을 완성한다.", sigil: "✦", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "gain_energy_if_series", amount: 1, minimumAllies: 2 } },
  { id: "v26_astral_armada_spell_01", name: "아스트라 아르마다 오더 - 플릿 런치", subtitle: "아스트라 아르마다 전용 전술 카드", kind: "spell", rarity: "common", element: "solar", cost: 1, effect: { kind: "aoe_enemy", amount: 2 }, target: "none", text: "모든 적 유닛에 2 피해.", flavor: "아스트라 아르마다의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_spell_02", name: "아스트라 아르마다 오더 - 오비탈 차지", subtitle: "아스트라 아르마다 전용 전술 카드", kind: "spell", rarity: "common", element: "lunar", cost: 2, effect: { kind: "draw", amount: 2 }, target: "none", text: "카드 2장을 뽑습니다.", flavor: "아스트라 아르마다의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_spell_03", name: "아스트라 아르마다 오더 - 광자포 일제사격", subtitle: "아스트라 아르마다 전용 전술 카드", kind: "spell", rarity: "rare", element: "storm", cost: 2, effect: { kind: "shield_unit", amount: 4 }, target: "friendly_unit", text: "아군 유닛 하나에게 보호막 4.", flavor: "아스트라 아르마다의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "buff_series", attack: 1, health: 1 } },
  { id: "v26_astral_armada_spell_04", name: "아스트라 아르마다 오더 - 네뷸라 항로", subtitle: "아스트라 아르마다 전용 전술 카드", kind: "spell", rarity: "rare", element: "solar", cost: 3, effect: { kind: "gain_energy", amount: 2 }, target: "none", text: "이번 턴 에너지 2 회복.", flavor: "아스트라 아르마다의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_spell_05", name: "아스트라 아르마다 오더 - 스타실드 전개", subtitle: "아스트라 아르마다 전용 전술 카드", kind: "spell", rarity: "rare", element: "lunar", cost: 3, effect: { kind: "aoe_enemy", amount: 2 }, target: "none", text: "모든 적 유닛에 2 피해.", flavor: "아스트라 아르마다의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_spell_06", name: "아스트라 아르마다 오더 - 퀘이사 부스트", subtitle: "아스트라 아르마다 전용 전술 카드", kind: "spell", rarity: "epic", element: "storm", cost: 4, effect: { kind: "draw", amount: 2 }, target: "none", text: "카드 2장을 뽑습니다.", flavor: "아스트라 아르마다의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "heal_per_series", amount: 1, cap: 4 } },
  { id: "v26_astral_armada_spell_07", name: "아스트라 아르마다 오더 - 아르마다 집결", subtitle: "아스트라 아르마다 전용 전술 카드", kind: "spell", rarity: "epic", element: "solar", cost: 5, effect: { kind: "shield_unit", amount: 4 }, target: "friendly_unit", text: "아군 유닛 하나에게 보호막 4.", flavor: "아스트라 아르마다의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_spell_08", name: "아스트라 아르마다 오더 - 성해포격 오메가", subtitle: "아스트라 아르마다 전용 전술 카드", kind: "spell", rarity: "legendary", element: "lunar", cost: 6, effect: { kind: "gain_energy", amount: 2 }, target: "none", text: "이번 턴 에너지 2 회복.", flavor: "아스트라 아르마다의 전술식은 단독 사용보다 시리즈 연계에서 더 큰 가치를 만든다.", sigil: "✧", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "shield_series", amount: 1 } },
  { id: "v26_astral_armada_trap_01", name: "아스트라 아르마다 리액터 - 디코이 프리깃", subtitle: "아스트라 아르마다 전용 대응 카드", kind: "trap", rarity: "common", element: "lunar", cost: 1, trapTrigger: "unit_summoned", trapEffect: { kind: "damage_unit", amount: 2 }, target: "none", text: "상대가 유닛을 소환했을 때, 해당 유닛에 2 피해.", flavor: "아스트라 아르마다는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_trap_02", name: "아스트라 아르마다 리액터 - 오비탈 인터셉트", subtitle: "아스트라 아르마다 전용 대응 카드", kind: "trap", rarity: "common", element: "storm", cost: 2, trapTrigger: "spell_played", trapEffect: { kind: "negate" }, target: "none", text: "상대가 주문을 발동했을 때, 그 발동을 무효화.", flavor: "아스트라 아르마다는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_trap_03", name: "아스트라 아르마다 리액터 - 스타실드 리액터", subtitle: "아스트라 아르마다 전용 대응 카드", kind: "trap", rarity: "rare", element: "solar", cost: 2, trapTrigger: "unit_attacked", trapEffect: { kind: "buff_unit", attack: 2, health: 2 }, target: "none", text: "내 유닛이 공격받을 때, 공격받은 아군에게 공격력 +2, 체력 +2.", flavor: "아스트라 아르마다는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_trap_04", name: "아스트라 아르마다 리액터 - 메테오 카운터", subtitle: "아스트라 아르마다 전용 대응 카드", kind: "trap", rarity: "rare", element: "lunar", cost: 3, trapTrigger: "direct_attack", trapEffect: { kind: "negate_and_damage", amount: 2 }, target: "none", text: "상대가 코어를 직접 공격했을 때, 그 행동을 무효화하고 2 피해를 되돌립니다.", flavor: "아스트라 아르마다는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "gain_energy_if_series", amount: 1, minimumAllies: 2 } },
  { id: "v26_astral_armada_trap_05", name: "아스트라 아르마다 리액터 - 플래그십 방벽", subtitle: "아스트라 아르마다 전용 대응 카드", kind: "trap", rarity: "epic", element: "storm", cost: 4, trapTrigger: "special_summoned", trapEffect: { kind: "damage_unit", amount: 4 }, target: "none", text: "상대가 특수 소환했을 때, 해당 유닛에 4 피해.", flavor: "아스트라 아르마다는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada" },
  { id: "v26_astral_armada_trap_06", name: "아스트라 아르마다 리액터 - 아르마다 최종방어선", subtitle: "아스트라 아르마다 전용 대응 카드", kind: "trap", rarity: "legendary", element: "solar", cost: 5, trapTrigger: "direct_attack", trapEffect: { kind: "negate_and_damage", amount: 3 }, target: "none", text: "상대가 코어를 직접 공격했을 때, 그 행동을 무효화하고 3 피해를 되돌립니다.", flavor: "아스트라 아르마다는 상대의 행동을 기다리는 시간조차 다음 연계를 준비하는 자원으로 사용한다.", sigil: "◇", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "buff_series", attack: 1, health: 1 } },
  { id: "v26_astral_armada_fusion_01", name: "아스트라 아르마다 크로스 - 네뷸라 드레드노트", subtitle: "아스트라 아르마다의 공명 융합 최종체", kind: "fusion", rarity: "epic", element: "storm", cost: 6, attack: 8, health: 8, keywords: ["guard"], summonMode: "fusion", fusionRecipe: { label: "아스트라 아르마다 유닛 2장 공명", materials: [{ label: "아스트라 아르마다 소재 A", cardIds: ["v26_astral_armada_unit_16", "v26_astral_armada_unit_18"] }, { label: "아스트라 아르마다 소재 B", cardIds: ["v26_astral_armada_unit_20", "v26_astral_armada_unit_21"] }] }, onSummon: { kind: "draw", amount: 1 }, target: "none", text: "공명 융합. 소환 시 카드 1장을 뽑습니다.", flavor: "성해함대 아스트라 아르마다의 두 전술축이 하나의 프레임으로 합쳐진 결전형.", sigil: "☯", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "shield_series", amount: 1 } },
  { id: "v26_astral_armada_fusion_02", name: "아스트라 아르마다 크로스 - 퀘이사 캐리어", subtitle: "아스트라 아르마다의 공명 융합 최종체", kind: "fusion", rarity: "legendary", element: "solar", cost: 7, attack: 10, health: 10, keywords: ["guard", "pierce"], summonMode: "fusion", fusionRecipe: { label: "아스트라 아르마다 유닛 2장 공명", materials: [{ label: "아스트라 아르마다 소재 A", cardIds: ["v26_astral_armada_unit_16", "v26_astral_armada_unit_18"] }, { label: "아스트라 아르마다 소재 B", cardIds: ["v26_astral_armada_unit_20", "v26_astral_armada_unit_21"] }] }, onSummon: { kind: "draw", amount: 2 }, target: "none", text: "공명 융합. 소환 시 카드 2장을 뽑습니다.", flavor: "성해함대 아스트라 아르마다의 두 전술축이 하나의 프레임으로 합쳐진 결전형.", sigil: "☯", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "gain_energy_if_series", amount: 1, minimumAllies: 2 } },
  { id: "v26_astral_armada_evolution_01", name: "아스트라 아르마다 어센드 - 갤럭시 제독", subtitle: "아스트라 아르마다의 계승 진화 최종체", kind: "evolution", rarity: "epic", element: "solar", cost: 6, attack: 9, health: 8, keywords: ["charge"], summonMode: "evolution", evolutionRecipe: { label: "아스트라 아르마다 계승", fromIds: ["v26_astral_armada_unit_19"] }, onSummon: { kind: "shield_unit", amount: 2 }, target: "none", text: "계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 소환 시 아군 유닛 하나에게 보호막 2.", flavor: "아스트라 아르마다의 전투 데이터가 임계점을 넘어 다음 세대의 형태로 계승되었다.", sigil: "✧", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "heal_per_series", amount: 1, cap: 4 } },
  { id: "v26_astral_armada_evolution_02", name: "아스트라 아르마다 어센드 - 성해황제 오리온", subtitle: "아스트라 아르마다의 계승 진화 최종체", kind: "evolution", rarity: "legendary", element: "lunar", cost: 7, attack: 11, health: 10, keywords: ["charge", "lifesteal"], summonMode: "evolution", evolutionRecipe: { label: "아스트라 아르마다 계승", fromIds: ["v26_astral_armada_unit_20"] }, onSummon: { kind: "shield_unit", amount: 3 }, target: "none", text: "계승 진화. 진화 전 유닛의 강화 상태를 이어받습니다. 소환 시 아군 유닛 하나에게 보호막 3.", flavor: "아스트라 아르마다의 전투 데이터가 임계점을 넘어 다음 세대의 형태로 계승되었다.", sigil: "✧", series: "성해함대 아스트라 아르마다", seriesId: "astral_armada", seriesAbility: { kind: "buff_series", attack: 1, health: 1 } },
];
CARDS.push(...V26_EXPANSION_CARDS);

/* --------------------------------------------------------------------------
 * v31d Legendary spell suite
 * --------------------------------------------------------------------------
 * These are deliberately high-cost, one-copy Legendary spells with effects
 * that change how a duel is played rather than simply inflating damage.
 */
export const V31D_LEGENDARY_SPELLS: CardDefinition[] = [
  {
    id: 'spell_v31d_sovereign_seizure', name: '왕권 강탈', subtitle: '지배권을 뒤집는 단 한 장',
    kind: 'spell', rarity: 'legendary', element: 'void', cost: 8, effect: { kind: 'steal_unit' }, target: 'enemy_unit',
    text: '적 유닛 1장의 지배권을 가져옵니다. 강탈한 유닛은 이번 턴 공격할 수 없고 보호막을 잃습니다.',
    flavor: '왕좌는 쓰러지는 것이 아니라, 주인이 바뀌는 순간 가장 조용히 무너진다.', sigil: '♜',
  },
  {
    id: 'spell_v31d_grave_rebirth', name: '황혼의 소생계약', subtitle: '기억이 육체를 다시 부른다',
    kind: 'spell', rarity: 'legendary', element: 'verdant', cost: 7, effect: { kind: 'revive_unit' }, target: 'friendly_graveyard_unit',
    text: '내 묘지의 메인 덱 유닛 1장을 선택해 빈 칸에 완전한 체력으로 부활시킵니다. 소환 효과는 다시 발동하지 않으며 이번 턴 공격할 수 없습니다.',
    flavor: '죽음은 끝이 아니라, 이름을 다시 불러낼 수 없게 되는 순간부터 시작된다.', sigil: '✿',
  },
  {
    id: 'spell_v31d_grand_recall', name: '시간의 대회수', subtitle: '전장을 한 순간 전으로 되감는다',
    kind: 'spell', rarity: 'legendary', element: 'neutral', cost: 9, effect: { kind: 'mass_recall' }, target: 'none',
    text: '양쪽 필드의 모든 유닛을 되돌립니다. 메인 덱 유닛은 손패, 엑스트라 유닛은 엑스트라 덱으로 돌아가고 토큰은 소멸합니다.',
    flavor: '누군가 시계를 되감았고, 전장은 자신이 싸웠다는 사실조차 잊었다.', sigil: '⌛',
  },
  {
    id: 'spell_v31d_battlefield_inversion', name: '전장의 역위상', subtitle: '힘과 생존의 기준을 뒤집다',
    kind: 'spell', rarity: 'legendary', element: 'lunar', cost: 7, effect: { kind: 'invert_all_units' }, target: 'none',
    text: '필드의 모든 유닛은 현재 공격력과 체력을 서로 바꿉니다. 보호막은 유지됩니다.',
    flavor: '강한 자는 버티지 못하고, 버티던 자는 갑자기 칼날이 된다.', sigil: '⇄',
  },
  {
    id: 'spell_v31d_oblivion_archive', name: '망각의 봉인서고', subtitle: '되살아날 미래 자체를 지운다',
    kind: 'spell', rarity: 'legendary', element: 'void', cost: 6, effect: { kind: 'erase_opponent_grave', amount: 5, draw: 1 }, target: 'none',
    text: '상대 묘지에서 카드 최대 5장을 무작위로 소멸시키고 카드 1장을 뽑습니다.',
    flavor: '기록이 없으면 귀환도 없다. 서고는 불타지 않고, 이름만 사라진다.', sigil: '▧',
  },
  {
    id: 'spell_v31d_fate_reweave', name: '운명 재봉', subtitle: '쥔 패를 버리지 않고 미래를 다시 고른다',
    kind: 'spell', rarity: 'legendary', element: 'neutral', cost: 6, effect: { kind: 'reweave_hand', bonusDraw: 2 }, target: 'none',
    text: '내 남은 손패를 덱에 섞고, 섞은 장수보다 2장 더 새로 뽑습니다.',
    flavor: '실패한 선택을 버리는 대신 실을 풀어 처음부터 다시 짠다.', sigil: '✧',
  },
  {
    id: 'spell_v31d_mirror_incarnation', name: '거울의 현현', subtitle: '상대의 힘만을 훔친 빈 형상',
    kind: 'spell', rarity: 'legendary', element: 'lunar', cost: 7, effect: { kind: 'mirror_unit' }, target: 'enemy_unit',
    text: '적 유닛 1장의 현재 공격력과 체력을 복사한 능력 없는 거울 토큰을 내 필드에 소환합니다. 이번 턴 공격할 수 없습니다.',
    flavor: '거울은 영혼을 복사하지 않는다. 그래서 더 위험한 순간도 있다.', sigil: '◇',
  },
  {
    id: 'spell_v31d_hand_exchange', name: '패러독스 교환', subtitle: '서로가 준비한 미래를 맞바꾼다',
    kind: 'spell', rarity: 'legendary', element: 'storm', cost: 8, effect: { kind: 'exchange_hands' }, target: 'none',
    text: '서로의 남은 손패를 전부 교환합니다.',
    flavor: '계획을 읽는 가장 확실한 방법은 그 계획을 직접 손에 쥐는 것이다.', sigil: '∞',
  },
];
CARDS.push(...V31D_LEGENDARY_SPELLS);


// v31 balance pass: keep non-Legendary spells within sane efficiency bands,
// while ensuring expensive Epic/Legendary units and Legendary spells feel worth their cost.
const DIRECT_CORE_STRIKE_IDS = new Set([
  'unit_star_devourer',
  'unit_v8_storm_03',
  'unit_v8_void_16',
  'unit_v8_neutral_13',
  'v26_chronorium_unit_21',
  'v26_arcana_protocol_unit_21',
  'v26_beastforge_unit_21',
  'v26_phantom_carnival_unit_21',
  'v26_astral_armada_unit_21',
]);

function spellEffectText(effect: Effect): string {
  switch (effect.kind) {
    case 'damage_unit': return `적 유닛 하나에 ${effect.amount} 피해.`;
    case 'damage_core': return `상대 코어에 ${effect.amount} 피해.`;
    case 'heal_core': return `내 코어를 ${effect.amount} 회복.`;
    case 'draw': return `카드 ${effect.amount}장을 뽑습니다.`;
    case 'buff_unit': return `아군 유닛 하나에게 공격력 +${effect.attack}, 체력 +${effect.health}.`;
    case 'shield_unit': return `아군 유닛 하나에게 보호막 ${effect.amount}.`;
    case 'aoe_enemy': return `모든 적 유닛에 ${effect.amount} 피해.`;
    case 'gain_energy': return `이번 턴 에너지 ${effect.amount} 회복.`;
    case 'destroy_weak': return `현재 체력이 ${effect.maxHealth} 이하인 적 유닛 하나를 파괴.`;
    case 'summon_token': return `${effect.name} ${effect.attack}/${effect.health} 토큰을 소환.`;
    case 'steal_unit': return '적 유닛 1장의 지배권을 가져옵니다. 강탈한 유닛은 이번 턴 공격할 수 없고 보호막을 잃습니다.';
    case 'revive_unit': return '내 묘지의 메인 덱 유닛 1장을 선택해 완전한 체력으로 부활시킵니다. 소환 효과는 다시 발동하지 않으며 이번 턴 공격할 수 없습니다.';
    case 'mass_recall': return '양쪽 필드의 모든 유닛을 되돌립니다. 메인 덱 유닛은 손패, 엑스트라 유닛은 엑스트라 덱으로 돌아가고 토큰은 소멸합니다.';
    case 'invert_all_units': return '필드의 모든 유닛은 현재 공격력과 체력을 서로 바꿉니다.';
    case 'erase_opponent_grave': return `상대 묘지에서 카드 최대 ${effect.amount}장을 무작위로 소멸시키고 카드 ${effect.draw}장을 뽑습니다.`;
    case 'reweave_hand': return `내 남은 손패를 덱에 섞고, 섞은 장수보다 ${effect.bonusDraw}장 더 새로 뽑습니다.`;
    case 'mirror_unit': return '적 유닛 1장의 현재 공격력과 체력을 복사한 능력 없는 거울 토큰을 내 필드에 소환합니다. 이번 턴 공격할 수 없습니다.';
    case 'exchange_hands': return '서로의 남은 손패를 전부 교환합니다.';
    case 'ready_unit': return '이번 턴 소환한 아군 유닛 1장을 즉시 공격 가능 상태로 만듭니다.';
    case 'bounce_unit': return '대상 유닛 1장을 원래 영역으로 되돌립니다.';
    case 'heal_unit': return `아군 유닛 하나의 체력을 ${effect.amount} 회복합니다.`;
    case 'sacrifice_draw': return `아군 유닛 1장을 묘지로 보내고 카드 ${effect.amount}장을 뽑습니다.`;
    case 'damage_draw_if_destroyed': return `적 유닛 하나에 ${effect.amount} 피해. 이 피해로 파괴하면 카드 ${effect.draw}장을 뽑습니다.`;
    case 'recruit_unit': return `덱에서 비용 ${effect.maxCost} 이하 유닛 1장을 전개합니다.`;
    case 'recover_grave_unit': return `내 묘지의 유닛 ${effect.amount}장을 손으로 되돌립니다.`;
    case 'draw_if_outnumbered': return `카드 ${effect.base}장을 뽑습니다. 필드가 열세면 ${effect.bonus}장 추가로 뽑습니다.`;
    case 'swap_stats': return '대상 유닛의 현재 공격력과 체력을 서로 바꿉니다.';
  }
}

function clampNonLegendarySpell(card: CardDefinition): void {
  if (card.kind !== 'spell' || !card.effect || card.rarity === 'legendary') return;
  const tier = card.rarity === 'common' ? 0 : card.rarity === 'rare' ? 1 : 2;
  const effect = card.effect;
  switch (effect.kind) {
    case 'damage_unit': effect.amount = Math.min(effect.amount, Math.max(2, card.cost + 1 + tier)); break;
    case 'damage_core': effect.amount = Math.min(effect.amount, Math.max(1, Math.ceil(card.cost * 0.72) + tier)); break;
    case 'aoe_enemy': effect.amount = Math.min(effect.amount, 1 + tier); break;
    case 'draw': effect.amount = Math.min(effect.amount, card.rarity === 'epic' ? 2 : 1); break;
    case 'gain_energy': effect.amount = Math.min(effect.amount, card.rarity === 'epic' ? 2 : 1); break;
    case 'buff_unit': {
      const cap = 1 + tier;
      effect.attack = Math.min(effect.attack, cap);
      effect.health = Math.min(effect.health, cap + (card.rarity === 'epic' ? 1 : 0));
      break;
    }
    case 'shield_unit': effect.amount = Math.min(effect.amount, 2 + tier); break;
    case 'destroy_weak': effect.maxHealth = Math.min(effect.maxHealth, 3 + tier * 2); break;
    case 'summon_token': {
      const statCap = Math.max(2, card.cost + tier);
      effect.attack = Math.min(effect.attack, statCap);
      effect.health = Math.min(effect.health, statCap + 1);
      break;
    }
    case 'heal_core': effect.amount = Math.min(effect.amount, Math.max(2, card.cost + 2 + tier)); break;
    case 'steal_unit':
    case 'revive_unit':
    case 'mass_recall':
    case 'invert_all_units':
    case 'erase_opponent_grave':
    case 'reweave_hand':
    case 'mirror_unit':
    case 'exchange_hands': break;
  }
  card.text = spellEffectText(effect);
}

function strengthenLegendarySpell(card: CardDefinition): void {
  if (card.kind !== 'spell' || card.rarity !== 'legendary' || !card.effect || card.cost < 6) return;
  const effect = card.effect;
  switch (effect.kind) {
    case 'damage_unit': effect.amount = Math.max(effect.amount, card.cost + 1); break;
    case 'damage_core': effect.amount = Math.max(effect.amount, Math.ceil(card.cost * 0.8)); break;
    case 'aoe_enemy': effect.amount = Math.max(effect.amount, 4); break;
    case 'draw': effect.amount = Math.max(effect.amount, 3); break;
    case 'gain_energy': effect.amount = Math.max(effect.amount, 3); break;
    case 'buff_unit': effect.attack = Math.max(effect.attack, 4); effect.health = Math.max(effect.health, 4); break;
    case 'shield_unit': effect.amount = Math.max(effect.amount, 5); break;
    case 'destroy_weak': effect.maxHealth = Math.max(effect.maxHealth, 8); break;
    case 'summon_token': effect.attack = Math.max(effect.attack, 5); effect.health = Math.max(effect.health, 6); break;
    case 'heal_core': effect.amount = Math.max(effect.amount, 8); break;
    case 'steal_unit':
    case 'revive_unit':
    case 'mass_recall':
    case 'invert_all_units':
    case 'erase_opponent_grave':
    case 'reweave_hand':
    case 'mirror_unit':
    case 'exchange_hands': break;
  }
  card.text = spellEffectText(effect);
}

function strengthenHighCostUnit(card: CardDefinition): void {
  if (!isUnitCard(card) || card.kind === 'fusion' || card.kind === 'evolution') return;
  if (card.rarity !== 'epic' && card.rarity !== 'legendary') return;
  if (card.cost < 6) return;
  const targetTotal = card.rarity === 'legendary' ? card.cost * 2 + 4 : card.cost * 2 + 1;
  const currentTotal = (card.attack ?? 0) + (card.health ?? 0);
  let missing = Math.max(0, targetTotal - currentTotal);
  if (missing > 0) {
    const attackGain = Math.ceil(missing * 0.45);
    const healthGain = missing - attackGain;
    card.attack = (card.attack ?? 0) + attackGain;
    card.health = (card.health ?? 0) + healthGain;
  }
  if (card.rarity === 'legendary' && !card.onSummon) {
    card.onSummon = { kind: 'draw', amount: 1 };
    card.text = `${card.text} 소환 시 카드 1장을 뽑습니다.`;
  }
}

for (const card of CARDS) {
  clampNonLegendarySpell(card);
  strengthenLegendarySpell(card);
  strengthenHighCostUnit(card);
  if (DIRECT_CORE_STRIKE_IDS.has(card.id) && isUnitCard(card) && card.rarity === 'legendary') {
    card.keywords = Array.from(new Set([...(card.keywords ?? []), 'corestrike']));
    if (!card.text.includes('직격')) card.text = `${card.text} 직격: 상대 수호가 없으면 다른 적 유닛을 무시하고 코어를 공격할 수 있습니다.`;
  }
}

/* --------------------------------------------------------------------------
 * v31c rarity / Ascension tuning
 * --------------------------------------------------------------------------
 * A handful of high-rarity units still felt too close to ordinary bodies.
 * This is intentionally a small, identity-preserving pass rather than a
 * blanket power increase across the whole pool.
 *
 * Ascension cards are premium Extra Deck payoffs, so the cheapest legacy
 * evolutions also receive a minimum ENERGY cost. Existing expensive cards are
 * untouched by this floor.
 */
const V31C_UNIT_TUNING: Record<string, {
  attack?: number;
  health?: number;
  addKeywords?: Keyword[];
  onSummon?: Effect;
  text?: string;
}> = {
  unit_timeweaver: {
    attack: 5,
    health: 6,
    text: '소환 시 이번 턴 에너지 1 회복.',
  },
  unit_eclipse_dragon: {
    attack: 8,
    health: 7,
    onSummon: { kind: 'damage_core', amount: 2 },
    text: '소환 시 상대 코어에 2 피해. 관통.',
  },
  unit_tempest_queen: {
    attack: 7,
    health: 7,
    onSummon: { kind: 'aoe_enemy', amount: 2 },
    text: '소환 시 모든 적 유닛에 2 피해.',
  },
  unit_v8_verdant_08: {
    attack: 7,
    health: 9,
    addKeywords: ['guard'],
    text: '수호.',
  },
  unit_v8_neutral_07: {
    attack: 6,
    health: 8,
    addKeywords: ['charge'],
    text: '속공.',
  },
};

for (const card of CARDS) {
  if (card.kind === 'evolution') {
    const minimumEvolutionCost = card.rarity === 'legendary' ? 5 : 4;
    card.cost = Math.max(card.cost, minimumEvolutionCost);
  }

  const tuning = V31C_UNIT_TUNING[card.id];
  if (!tuning || !isUnitCard(card) || card.kind === 'fusion' || card.kind === 'evolution') continue;
  if (tuning.attack !== undefined) card.attack = tuning.attack;
  if (tuning.health !== undefined) card.health = tuning.health;
  if (tuning.addKeywords?.length) card.keywords = Array.from(new Set([...(card.keywords ?? []), ...tuning.addKeywords]));
  if (tuning.onSummon) card.onSummon = tuning.onSummon;
  if (tuning.text) card.text = tuning.text;
}

/* --------------------------------------------------------------------------
 * v31f premium legendary Extra Deck rules + CHOOSE effects
 * --------------------------------------------------------------------------
 * Legendary Extra Deck cards are meant to be match-defining payoffs, not an
 * almost-free replacement for one field unit. Every legendary evolution now
 * consumes at least the predecessor + 1 tribute (2 bodies total), while the
 * cost-7 apex legends consume 3 bodies total and demand a heavier setup.
 * Cost-7 legendary fusions also consume a third tribute on top of their
 * printed two-material recipe. In return every legendary Extra Deck card gets
 * three selectable on-summon modes. The player chooses exactly one mode.
 */
const EXTRA_CHOICE_LABELS: Record<Element, [string, string, string]> = {
  solar: ['태양 단죄', '여명 재점화', '성광 갑주'],
  lunar: ['월식 침식', '몽환 회수', '백야 결계'],
  storm: ['천뢰 폭주', '전광 재배치', '뇌광 장갑'],
  verdant: ['세계수 압살', '생명순환', '고대수피'],
  void: ['심연 붕괴', '공허 재편', '균열 장막'],
  neutral: ['왕권 제압', '전술 재구성', '불멸 장갑'],
};

function buildLegendaryExtraChoices(card: CardDefinition, apex: boolean): ExtraChoice[] {
  const labels = EXTRA_CHOICE_LABELS[card.element];
  if (card.kind === 'fusion') {
    const aoe = apex ? 3 : 2;
    const core = apex ? 2 : 1;
    const draw = apex ? 2 : 1;
    const buff = apex ? 3 : 2;
    const shield = apex ? 3 : 2;
    return [
      {
        id: 'overwhelm',
        label: labels[0],
        description: `모든 적 유닛에 ${aoe} 피해를 주고 상대 코어에 ${core} 피해.`,
        effects: [{ kind: 'aoe_enemy', amount: aoe }, { kind: 'damage_core', amount: core }],
      },
      {
        id: 'resonance',
        label: labels[1],
        description: `카드 ${draw}장을 뽑고 이번 턴 에너지 1 회복.`,
        effects: [{ kind: 'draw', amount: draw }, { kind: 'gain_energy', amount: 1 }],
      },
      {
        id: 'fortress',
        label: labels[2],
        description: `이 유닛에게 +${buff}/+${buff} 및 보호막 ${shield}.`,
        effects: [{ kind: 'buff_unit', attack: buff, health: buff }, { kind: 'shield_unit', amount: shield }],
      },
    ];
  }

  const attack = apex ? 4 : 2;
  const health = apex ? 2 : 2;
  const core = apex ? 2 : 1;
  const draw = apex ? 2 : 1;
  const heal = apex ? 4 : 3;
  const shield = apex ? 4 : 2;
  const aoe = apex ? 2 : 1;
  return [
    {
      id: 'inherit-power',
      label: labels[0],
      description: `이 유닛에게 +${attack}/+${health}를 부여하고 상대 코어에 ${core} 피해.`,
      effects: [{ kind: 'buff_unit', attack, health }, { kind: 'damage_core', amount: core }],
    },
    {
      id: 'inherit-memory',
      label: labels[1],
      description: `카드 ${draw}장을 뽑고 내 코어를 ${heal} 회복.`,
      effects: [{ kind: 'draw', amount: draw }, { kind: 'heal_core', amount: heal }],
    },
    {
      id: 'inherit-aegis',
      label: labels[2],
      description: `이 유닛에게 보호막 ${shield}를 부여하고 모든 적 유닛에 ${aoe} 피해.`,
      effects: [{ kind: 'shield_unit', amount: shield }, { kind: 'aoe_enemy', amount: aoe }],
    },
  ];
}

for (const card of CARDS) {
  if (card.rarity !== 'legendary' || (card.kind !== 'fusion' && card.kind !== 'evolution')) continue;
  const apex = card.cost >= 7;
  card.extraSummonRule = card.kind === 'fusion'
    ? {
        tier: apex ? 'apex' : 'legendary',
        additionalTributes: apex ? 1 : 0,
        tributeMinCost: 3,
        minTotalMaterialCost: apex ? 13 : 10,
        requireHighRarityMaterial: apex,
        requireSameSeriesTribute: apex && Boolean(card.seriesId),
      }
    : {
        tier: apex ? 'apex' : 'legendary',
        additionalTributes: apex ? 2 : 1,
        tributeMinCost: 3,
        minTotalMaterialCost: apex ? 13 : 8,
        requireHighRarityMaterial: apex,
        requireSameSeriesTribute: apex && Boolean(card.seriesId),
        sourceExtraTurnGap: apex ? 2 : 0,
      };
  card.extraChoices = buildLegendaryExtraChoices(card, apex);
  const chooseText = card.extraChoices.map((choice, index) => `${index + 1}. ${choice.label}: ${choice.description}`).join(' / ');
  card.text = `${card.text} CHOOSE — ${chooseText}`;
}

export function extraRequiredUnitCount(card: CardDefinition): number {
  if (card.kind === 'fusion') return (card.fusionRecipe?.materials.length ?? 0) + (card.extraSummonRule?.additionalTributes ?? 0);
  if (card.kind === 'evolution') return 1 + (card.extraSummonRule?.additionalTributes ?? 0);
  return 0;
}


/* --------------------------------------------------------------------------
 * v31g readability + Extra balance + tactical spell variety
 * --------------------------------------------------------------------------
 * - Keep summon rules strict internally, but print them in short card-game
 *   language instead of implementation jargon.
 * - Tone down Phoenix Braver, which was over-rewarding its cheap predecessor.
 * - Iron Sovereign now needs Bastion + one real tribute instead of one body.
 * - Rework exactly 30 of the 60 v8 spells (50%) into board-manipulation,
 *   tempo, graveyard, recruitment and conditional effects instead of mostly
 *   energy/core-damage repeats.
 */
const V31G_CARD_TUNING: Record<string, Partial<Pick<CardDefinition, 'cost' | 'attack' | 'health' | 'keywords' | 'effect' | 'target' | 'text' | 'extraSummonRule'>>> = {
  evolution_ember_phoenix: {
    attack: 5,
    health: 5,
    keywords: ['charge'],
    text: '계승 진화. 진화 전 유닛의 강화 수치와 보호막을 이어받습니다. 속공.',
  },
  evolution_iron_sovereign: {
    extraSummonRule: {
      tier: 'elite',
      additionalTributes: 1,
      tributeMinCost: 4,
      minTotalMaterialCost: 6,
    },
  },

  // Solar: finishing blows, tempo and graveyard recovery.
  spell_v8_solar_01: { effect: { kind: 'damage_draw_if_destroyed', amount: 4, draw: 1 }, target: 'enemy_unit', text: '적 유닛 하나에 4 피해. 이 피해로 파괴하면 카드 1장을 뽑습니다.' },
  spell_v8_solar_03: { effect: { kind: 'ready_unit' }, target: 'friendly_unit', text: '이번 턴 소환한 아군 유닛 하나는 속공이 없어도 즉시 공격할 수 있습니다.' },
  spell_v8_solar_05: { effect: { kind: 'heal_unit', amount: 3 }, target: 'friendly_unit', text: '아군 유닛 하나의 체력을 3 회복합니다.' },
  spell_v8_solar_07: { cost: 2, effect: { kind: 'recover_grave_unit', amount: 1 }, target: 'none', text: '내 묘지의 유닛 1장을 무작위로 손에 되돌립니다.' },
  spell_v8_solar_09: { effect: { kind: 'bounce_unit' }, target: 'enemy_unit', text: '적 유닛 하나를 원래 영역으로 되돌립니다. 토큰은 소멸합니다.' },

  // Lunar: recall, hand renewal and stat tricks.
  spell_v8_lunar_01: { effect: { kind: 'mirror_unit' }, target: 'enemy_unit', text: '적 유닛 하나의 현재 공격력/체력을 복제한 거울 토큰을 내 필드에 소환합니다.' },
  spell_v8_lunar_03: { effect: { kind: 'recover_grave_unit', amount: 1 }, target: 'none', text: '내 묘지의 유닛 1장을 무작위로 손에 되돌립니다.' },
  spell_v8_lunar_05: { effect: { kind: 'swap_stats' }, target: 'enemy_unit', text: '적 유닛 하나의 현재 공격력과 체력을 서로 바꿉니다.' },
  spell_v8_lunar_07: { effect: { kind: 'heal_unit', amount: 2 }, target: 'friendly_unit', text: '아군 유닛 하나의 체력을 2 회복합니다.' },
  spell_v8_lunar_09: { effect: { kind: 'revive_unit' }, target: 'friendly_graveyard_unit', text: '내 묘지의 메인 덱 유닛 1장을 선택해 부활시킵니다. 소환 효과는 발동하지 않습니다.' },

  // Storm: immediate attacks, kill rewards and low-cost deployment.
  spell_v8_storm_01: { effect: { kind: 'ready_unit' }, target: 'friendly_unit', text: '이번 턴 소환한 아군 유닛 하나는 속공이 없어도 즉시 공격할 수 있습니다.' },
  spell_v8_storm_03: { effect: { kind: 'damage_draw_if_destroyed', amount: 4, draw: 1 }, target: 'enemy_unit', text: '적 유닛 하나에 4 피해. 이 피해로 파괴하면 카드 1장을 뽑습니다.' },
  spell_v8_storm_05: { effect: { kind: 'recruit_unit', maxCost: 2 }, target: 'none', text: '내 덱에서 비용 2 이하 유닛 1장을 무작위로 필드에 전개합니다. 소환 효과는 발동하지 않습니다.' },
  spell_v8_storm_07: { effect: { kind: 'swap_stats' }, target: 'friendly_unit', text: '아군 유닛 하나의 현재 공격력과 체력을 서로 바꿉니다.' },
  spell_v8_storm_09: { effect: { kind: 'damage_draw_if_destroyed', amount: 2, draw: 1 }, target: 'enemy_unit', text: '적 유닛 하나에 2 피해. 이 피해로 파괴하면 카드 1장을 뽑습니다.' },

  // Verdant: recycling, sacrifice value and board catch-up.
  spell_v8_verdant_01: { cost: 2, effect: { kind: 'recover_grave_unit', amount: 1 }, target: 'none', text: '내 묘지의 유닛 1장을 무작위로 손에 되돌립니다.' },
  spell_v8_verdant_03: { effect: { kind: 'recruit_unit', maxCost: 5 }, target: 'none', text: '내 덱에서 비용 5 이하 유닛 1장을 무작위로 필드에 전개합니다. 소환 효과는 발동하지 않습니다.' },
  spell_v8_verdant_05: { effect: { kind: 'heal_unit', amount: 4 }, target: 'friendly_unit', text: '아군 유닛 하나의 체력을 4 회복합니다.' },
  spell_v8_verdant_07: { effect: { kind: 'sacrifice_draw', amount: 2 }, target: 'friendly_unit', text: '아군 유닛 하나를 묘지로 보내고 카드 2장을 뽑습니다. 토큰은 소멸합니다.' },
  spell_v8_verdant_09: { effect: { kind: 'draw_if_outnumbered', base: 1, bonus: 1 }, target: 'none', text: '카드 1장을 뽑습니다. 상대 필드의 유닛이 더 많다면 대신 2장을 뽑습니다.' },

  // Void: sacrifice, grave recursion and removal tempo.
  spell_v8_void_01: { effect: { kind: 'sacrifice_draw', amount: 2 }, target: 'friendly_unit', text: '아군 유닛 하나를 묘지로 보내고 카드 2장을 뽑습니다. 토큰은 소멸합니다.' },
  spell_v8_void_03: { effect: { kind: 'recover_grave_unit', amount: 1 }, target: 'none', text: '내 묘지의 유닛 1장을 무작위로 손에 되돌립니다.' },
  spell_v8_void_05: { effect: { kind: 'bounce_unit' }, target: 'enemy_unit', text: '적 유닛 하나를 원래 영역으로 되돌립니다. 토큰은 소멸합니다.' },
  spell_v8_void_07: { effect: { kind: 'damage_draw_if_destroyed', amount: 2, draw: 1 }, target: 'enemy_unit', text: '적 유닛 하나에 2 피해. 이 피해로 파괴하면 카드 1장을 뽑습니다.' },
  spell_v8_void_09: { effect: { kind: 'draw_if_outnumbered', base: 1, bonus: 1 }, target: 'none', text: '카드 1장을 뽑습니다. 상대 필드의 유닛이 더 많다면 대신 2장을 뽑습니다.' },

  // Neutral: utility, repositioning and flexible deck access.
  spell_v8_neutral_01: { effect: { kind: 'swap_stats' }, target: 'friendly_unit', text: '아군 유닛 하나의 현재 공격력과 체력을 서로 바꿉니다.' },
  spell_v8_neutral_03: { effect: { kind: 'ready_unit' }, target: 'friendly_unit', text: '이번 턴 소환한 아군 유닛 하나는 속공이 없어도 즉시 공격할 수 있습니다.' },
  spell_v8_neutral_05: { effect: { kind: 'recruit_unit', maxCost: 3 }, target: 'none', text: '내 덱에서 비용 3 이하 유닛 1장을 무작위로 필드에 전개합니다. 소환 효과는 발동하지 않습니다.' },
  spell_v8_neutral_07: { cost: 3, effect: { kind: 'bounce_unit' }, target: 'enemy_unit', text: '적 유닛 하나를 원래 영역으로 되돌립니다. 토큰은 소멸합니다.' },
  spell_v8_neutral_09: { cost: 2, effect: { kind: 'recover_grave_unit', amount: 1 }, target: 'none', text: '내 묘지의 유닛 1장을 무작위로 손에 되돌립니다.' },
};

for (const card of CARDS) {
  const tuning = V31G_CARD_TUNING[card.id];
  if (!tuning) continue;
  Object.assign(card, tuning);
}


/* --------------------------------------------------------------------------
 * v31h series identity expansion
 * --------------------------------------------------------------------------
 * Each of the 13 series now owns four signature effects. Eight cards per
 * series carry one of those four signatures so the identity is visible in
 * actual deck play without putting extra text on every single card.
 */
const V31H_SERIES_SIGNATURES: Record<SeriesId, [SeriesSignature, SeriesSignature, SeriesSignature, SeriesSignature]> = {
  luminaknights: ['lumina_beacon', 'lumina_reinforce', 'lumina_united', 'lumina_finisher'],
  kaisergear: ['kaiser_repair', 'kaiser_battery', 'kaiser_overdrive', 'kaiser_fortress'],
  eclipsion: ['eclipse_echo', 'eclipse_devour', 'eclipse_rebirth', 'eclipse_resonance'],
  nocturne: ['nocturne_moonheal', 'nocturne_illusion', 'nocturne_dreamsearch', 'nocturne_mirrorveil'],
  arborian: ['arborian_seed', 'arborian_growth', 'arborian_regrowth', 'arborian_bloom'],
  tempest_drive: ['tempest_afterburn', 'tempest_voltage', 'tempest_chainbolt', 'tempest_momentum'],
  abyss_reaper: ['abyss_feast', 'abyss_harvest', 'abyss_execute', 'abyss_drain'],
  primal_guardian: ['primal_spirit', 'primal_pack', 'primal_shelter', 'primal_vitality'],
  chronorium: ['chrono_accelerate', 'chrono_rewind', 'chrono_foresee', 'chrono_reset'],
  arcana_protocol: ['arcana_inscribe', 'arcana_recycle', 'arcana_chain', 'arcana_hex'],
  beastforge: ['beast_repair', 'beast_plating', 'beast_hunt', 'beast_rage'],
  phantom_carnival: ['phantom_set', 'phantom_encore', 'phantom_misdirect', 'phantom_applause'],
  astral_armada: ['astral_drone', 'astral_salvo', 'astral_recharge', 'astral_formation'],
};

const V31H_SERIES_MECHANICS: Record<SeriesId, string> = {
  luminaknights: '같은 시리즈를 많이 전개할수록 드로우·증원·단체 강화·코어 마무리가 열립니다.',
  kaisergear: '보호막을 쌓아 버티고, 남은 보호막을 에너지와 공격 강화로 바꾸는 중장기 덱입니다.',
  eclipsion: '묘지를 쌓고 일부 카드를 소멸시키면서 회수·부활·드로우 보상을 얻습니다.',
  nocturne: '내 코어가 불리할 때 회복·바운스·서치로 흐름을 되찾는 역전형 컨트롤 덱입니다.',
  arborian: '작은 토큰을 늘리고 체력을 키우며 전장을 오래 유지할수록 강해지는 성장 덱입니다.',
  tempest_drive: '소환한 턴의 즉시 공격과 에너지 회복을 이어 빠르게 압박하는 템포 덱입니다.',
  abyss_reaper: '상대 묘지를 먹어 자원을 끊고, 묘지가 쌓이면 처형·흡수·추가 피해로 압박합니다.',
  primal_guardian: '아군 수를 늘려 수호령·강화·보호막을 함께 얻는 무리 전개형 덱입니다.',
  chronorium: '에너지를 앞당기고 묘지 카드를 되감아 한 턴의 선택지를 늘리는 운영형 덱입니다.',
  arcana_protocol: '주문을 여러 번 사용해 서치·재사용·에너지 회복·봉인 효과를 연결하는 주문 콤보 덱입니다.',
  beastforge: '보호막으로 버티다가 장갑을 공격력으로 전환해 큰 한 방을 노리는 기갑 덱입니다.',
  phantom_carnival: '함정을 세트·회수하고 상대 카드를 되돌리며 타이밍을 빼앗는 함정 컨트롤 덱입니다.',
  astral_armada: '편대를 늘려 드론·보호막·에너지를 확보하고 일제사격으로 마무리하는 함대 덱입니다.',
};

for (const series of CARD_SERIES) series.mechanic = V31H_SERIES_MECHANICS[series.id];

function pickFourSpread(cards: CardDefinition[]): CardDefinition[] {
  if (cards.length <= 4) return [...cards];
  const positions = [0, Math.round((cards.length - 1) / 3), Math.round(((cards.length - 1) * 2) / 3), cards.length - 1];
  const picked: CardDefinition[] = [];
  const used = new Set<string>();
  for (const position of positions) {
    const card = cards[Math.max(0, Math.min(cards.length - 1, position))];
    if (card && !used.has(card.id)) { picked.push(card); used.add(card.id); }
  }
  for (const card of cards) {
    if (picked.length >= 4) break;
    if (!used.has(card.id)) { picked.push(card); used.add(card.id); }
  }
  return picked.slice(0, 4);
}

// Keep the series package fair: exactly two cards per signature. One is a unit,
// the other is a support card. Existing SERIES LINK cards are skipped so a single
// card does not receive two extra engines and one series does not win by stacking.
// 1-cost support cards are also excluded from signature bonuses.
for (const card of CARDS) delete card.seriesSignature;
for (const series of CARD_SERIES) {
  const signatures = V31H_SERIES_SIGNATURES[series.id];
  const units = CARDS
    .filter((card) => card.seriesId === series.id && card.kind === 'unit' && card.cost >= 2 && !card.seriesAbility)
    .sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id));
  const spells = CARDS
    .filter((card) => card.seriesId === series.id && card.kind === 'spell' && card.cost >= 2 && !card.seriesAbility)
    .sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id));
  const traps = CARDS
    .filter((card) => card.seriesId === series.id && card.kind === 'trap' && card.cost >= 2 && !card.seriesAbility)
    .sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id));

  const selectedUnits = pickFourSpread(units);
  const selectedSupports = pickFourSpread(spells).slice(0, 4);
  for (const trap of pickFourSpread(traps)) {
    if (selectedSupports.length >= 4) break;
    if (!selectedSupports.some((card) => card.id === trap.id)) selectedSupports.push(trap);
  }

  signatures.forEach((signature, index) => {
    if (selectedUnits[index]) selectedUnits[index].seriesSignature = signature;
    if (selectedSupports[index]) selectedSupports[index].seriesSignature = signature;
  });
}

/* v31j: every series has four distinct tactical passives, distributed evenly
 * across that series' units / fusion / evolution cards. The four v31h series
 * signature effects remain separate, so each archetype now has at least eight
 * named mechanics (4 signatures + 4 unit passives) without stacking one series
 * above the others.
 */
const V31J_SERIES_PASSIVES: Record<SeriesId, [SeriesTacticalPassive, SeriesTacticalPassive, SeriesTacticalPassive, SeriesTacticalPassive]> = {
  luminaknights: ['lumina_rally', 'lumina_cover', 'lumina_combo', 'lumina_victory'],
  kaisergear: ['kaiser_armor', 'kaiser_thruster', 'kaiser_salvage', 'kaiser_emergency'],
  eclipsion: ['eclipse_gloom', 'eclipse_graveblade', 'eclipse_feast', 'eclipse_afterimage'],
  nocturne: ['nocturne_veil', 'nocturne_moonreturn', 'nocturne_dreamdraw', 'nocturne_fade'],
  arborian: ['arborian_pulse', 'arborian_root', 'arborian_sap', 'arborian_seedfall'],
  tempest_drive: ['tempest_afterburner', 'tempest_overcurrent', 'tempest_recharge', 'tempest_residual'],
  abyss_reaper: ['abyss_devour_echo', 'abyss_grave_armor', 'abyss_void_edge', 'abyss_last_curse'],
  primal_guardian: ['primal_packguard', 'primal_alpha', 'primal_hunt', 'primal_spirit_guard'],
  chronorium: ['chrono_priority', 'chrono_accel_strike', 'chrono_forecast', 'chrono_restore'],
  arcana_protocol: ['arcana_rewrite', 'arcana_conduit', 'arcana_runeblade', 'arcana_sealburst'],
  beastforge: ['beast_plating_passive', 'beast_alloy_strike', 'beast_predatory_repair', 'beast_legacy'],
  phantom_carnival: ['phantom_backstage', 'phantom_ambush', 'phantom_encore_passive', 'phantom_smoke'],
  astral_armada: ['astral_formation_wall', 'astral_photon_thrust', 'astral_supply', 'astral_lastship'],
};

for (const card of CARDS) delete card.seriesTacticalPassive;
for (const series of CARD_SERIES) {
  const passives = V31J_SERIES_PASSIVES[series.id];
  const units = CARDS
    .filter((card) => card.seriesId === series.id && (card.kind === 'unit' || card.kind === 'fusion' || card.kind === 'evolution'))
    .sort((a, b) => a.cost - b.cost || a.rarity.localeCompare(b.rarity) || a.id.localeCompare(b.id));
  for (const [index, card] of units.entries()) card.seriesTacticalPassive = passives[index % passives.length];
}

export function extraSummonRuleDescription(card: CardDefinition): string {
  const rule = card.extraSummonRule;
  if (!rule) return '';
  const parts: string[] = [];
  if (card.kind === 'fusion') {
    parts.push(`소재 ${extraRequiredUnitCount(card)}체`);
    parts.push(`합계 ${rule.minTotalMaterialCost}+`);
  } else if (rule.additionalTributes === 1) {
    const namedSource = card.evolutionRecipe?.fromIds?.length === 1 ? CARDS.find((item) => item.id === card.evolutionRecipe?.fromIds?.[0]) : undefined;
    const effectiveMin = Math.max(rule.tributeMinCost, namedSource ? rule.minTotalMaterialCost - namedSource.cost : rule.tributeMinCost);
    parts.push(`추가 아군 1체(${effectiveMin}+)`);
  } else if (rule.additionalTributes > 1) {
    parts.push(`추가 아군 ${rule.additionalTributes}체(각 ${rule.tributeMinCost}+)`);
    parts.push(`합계 ${rule.minTotalMaterialCost}+`);
  } else {
    parts.push(`합계 ${rule.minTotalMaterialCost}+`);
  }
  if (rule.requireHighRarityMaterial) parts.push('영웅+ 1체');
  if (rule.requireSameSeriesTribute) parts.push('동일 시리즈 1체');
  return parts.join(' · ');
}

export const CARD_BY_ID: Record<string, CardDefinition> = Object.fromEntries(CARDS.map((card) => [card.id, card]));

export const STARTER_DECK: string[] = [
  'unit_ember_squire', 'unit_ember_squire', 'unit_ember_squire',
  'unit_rift_hound', 'unit_rift_hound', 'unit_rift_hound',
  'unit_iron_bastion', 'unit_iron_bastion', 'unit_iron_bastion',
  'unit_celestial_archer', 'unit_celestial_archer', 'unit_celestial_archer',
  'unit_verdant_sage', 'unit_verdant_sage', 'unit_verdant_sage',
  'unit_tide_medic', 'unit_tide_medic', 'unit_tide_medic',
  'unit_storm_lancer', 'unit_storm_lancer', 'unit_storm_lancer',
  'unit_moon_priest', 'unit_moon_priest',
  'unit_crystal_warden', 'unit_crystal_warden',
  'unit_rift_wanderer', 'unit_rift_wanderer',
  'unit_lastlight_vanguard', 'unit_lastlight_vanguard',
  'spell_spark_bolt', 'spell_spark_bolt', 'spell_spark_bolt',
  'spell_battle_hymn', 'spell_battle_hymn', 'spell_battle_hymn',
  'spell_mending_light', 'spell_mending_light',
  'spell_astral_insight', 'spell_astral_insight',
  'spell_void_lance',
  'trap_mirror_veil', 'trap_thorn_snare', 'trap_counter_sigil',
  'trap_blooming_guard', 'trap_ancestral_denial',
];

export const STARTER_EXTRA_DECK: string[] = [
  'fusion_tempest_colossus',
  'fusion_worldroot_hydra',
  'evolution_ember_phoenix', 'evolution_ember_phoenix',
  'evolution_iron_sovereign',
  // Starter players receive exactly one Legendary: a clear first chase/signature card.
  'evolution_rift_alpha',
];

export const ASCENSION_STARTER_GRANTS: Record<string, number> = {
  unit_rift_wanderer: 1,
  unit_lastlight_vanguard: 1,
  unit_tempest_interceptor: 1,
  unit_gravebloom_medium: 1,
  fusion_tempest_colossus: 1,
  fusion_worldroot_hydra: 1,
  evolution_ember_phoenix: 2,
  evolution_iron_sovereign: 1,
  evolution_rift_alpha: 1,
  trap_resonance_break: 1,
  trap_ancestral_denial: 1,
};

export const PACKS: PackDefinition[] = [
  {
    id: 'standard', name: '일반 카드팩', tagline: '전 속성 랜덤 · 희귀 이상 1장 보장', price: 120, guaranteed: 'rare', category: 'core', accent: '#7b86ff',
    odds: { common: 55, rare: 29, epic: 13.5, legendary: 2.5, guaranteedSlots: 1 },
  },
  {
    id: 'rare', name: '희귀 카드팩', tagline: '전 속성 랜덤 · 희귀 이상 2장 보장', price: 420, guaranteed: 'rare', category: 'core', accent: '#4fc4ff',
    odds: { common: 30, rare: 45, epic: 20, legendary: 5, guaranteedSlots: 2 },
  },
  {
    id: 'legendary', name: '전설 카드팩', tagline: '전 속성 랜덤 · 전설 카드 1장 확정', price: 1600, guaranteed: 'legendary', category: 'core', accent: '#f1c766',
    odds: { common: 10, rare: 35, epic: 40, legendary: 15, guaranteedSlots: 1 },
  },
  ...CARD_SERIES.map((series) => ({
    id: `series_${series.id}`,
    name: series.packName,
    tagline: `${series.tagline} · 시리즈 카드 2장 이상 보장`,
    price: 560,
    guaranteed: 'rare' as Rarity,
    seriesId: series.id,
    category: 'series' as const,
    accent: series.accent,
    odds: { common: 45, rare: 32, epic: 18, legendary: 5, guaranteedSlots: 1, seriesRate: 75, seriesGuaranteedSlots: 2 },
  })),
];

export const DECK_SIZE = 45;
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

  if (unitCount < 22) return '유닛 카드는 최소 22장 필요합니다.';
  if (spellCount > 14) return '주문 카드는 최대 14장까지 넣을 수 있습니다.';
  if (trapCount > 10) return '함정 카드는 최대 10장까지 넣을 수 있습니다.';
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
