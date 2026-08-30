import {
  CARD_BY_ID,
  CardDefinition,
  Effect,
  EclipsePhase,
  ECLIPSE_PHASE_LABEL,
  ECLIPSE_PHASE_ORDER,
  FusionMaterial,
  SeriesId,
  TrapTrigger,
  isUnitCard,
  randomId,
  resolvedEclipsePhaseModifiers,
  resolveCardVfx,
} from './game-data';

export type MatchPhase = 'main' | 'battle';
export type MatchStatus = 'waiting' | 'active' | 'finished';
export type SummonOrigin = 'normal' | 'rift' | 'legendary' | 'fusion' | 'evolution' | 'token';
export type ExtraSummonKind = 'fusion' | 'evolution';
export type VisualEventKind = 'turn' | 'summon' | 'special' | 'fusion' | 'evolution' | 'spell' | 'trap' | 'set' | 'draw' | 'attack' | 'defense' | 'destroy' | 'core' | 'heal' | 'buff' | 'energy';

const INITIAL_ECLIPSE_PHASE: EclipsePhase = 'dawn';
function nextEclipsePhase(phase: EclipsePhase): EclipsePhase {
  const index = ECLIPSE_PHASE_ORDER.indexOf(phase);
  if (index < 0) return INITIAL_ECLIPSE_PHASE;
  return ECLIPSE_PHASE_ORDER[(index + 1) % ECLIPSE_PHASE_ORDER.length] ?? INITIAL_ECLIPSE_PHASE;
}

export interface CardInstance {
  instanceId: string;
  cardId: string;
}

export interface CardActionTarget {
  ownerId: string;
  unitIndex?: number;
  graveyardIndex?: number;
  deckCardId?: string;
}

interface UnitBoardTarget {
  ownerId: string;
  unitIndex: number;
}

export interface UnitState {
  instanceId: string;
  cardId: string;
  ownerId: string;
  attack: number;
  health: number;
  maxHealth: number;
  shield: number;
  canAttack: boolean;
  summonedTurn: number;
  summonedBy: SummonOrigin;
  originCardIds: string[];
  /** A unit can receive at most one buff-type spell/trap card during its lifetime. */
  buffCardApplied?: boolean;
  /** Turn number during which this unit remains unable to attack due to a spell/trap. */
  stunnedUntilTurn?: number;
  /** Dynamic ECLIPSE CYCLE stat delta currently applied to this unit. Replaced, never stacked, whenever the clock changes. */
  eclipseAttackModifier?: number;
  eclipseHealthModifier?: number;
  /** v39: marks that attack/maxHealth actually contain the stored temporal delta. */
  eclipseModifierVersion?: 2;
  /** Player-facing temporal state used by the board UI. */
  eclipseResonance?: 'resonant' | 'neutral' | 'strained';
}

export interface PublicSecret {
  occupied: boolean;
  revealedCardId?: string;
}

export interface PlayerBoard {
  units: Array<UnitState | null>;
  secrets: Array<PublicSecret | null>;
}

export interface EnergyState {
  current: number;
  max: number;
}

export interface MatchPlayerStats {
  cardsDrawn: number;
  cardsPlayed: number;
  unitsSummoned: number;
  specialSummons: number;
  coreDamage: number;
  healing: number;
}

export interface MatchLog {
  id: string;
  text: string;
  tone: 'normal' | 'attack' | 'system' | 'trap' | 'victory' | 'fusion' | 'evolution' | 'special';
  createdAt: number;
}

export interface VisualEvent {
  id: string;
  kind: VisualEventKind;
  vfx: string;
  cardId?: string;
  ownerId?: string;
  targetOwnerId?: string;
  sourceZone?: number;
  targetZone?: number;
  amount?: number;
  shieldAmount?: number;
  healthAmount?: number;
  label?: string;
  /** Human-readable resolution text that is safe to reveal to both duelists once the event resolves. */
  detail?: string;
  /** Source/material cards used to create this event (for fusion/evolution cinematics). */
  sourceCardIds?: string[];
  createdAt: number;
}

export interface CoinTossState {
  side: 'solar' | 'lunar';
  winnerId: string;
  startedAt: number;
  endsAt: number;
}

export type PendingTrapContinuation =
  | { kind: 'spell'; actorId: string; cardId: string; target?: CardActionTarget }
  | { kind: 'summon'; actorId: string; zone: number; cardId: string; origin: SummonOrigin; remainingTriggers: TrapTrigger[]; extraChoiceIndex?: number; target?: CardActionTarget }
  | { kind: 'attack_core'; actorId: string; attackerIndex: number; bonusDamage: number }
  | { kind: 'attack_unit'; actorId: string; attackerIndex: number; targetIndex: number; bonusDamage: number }
  | { kind: 'post_action' };

export interface PendingTrapWindow {
  id: string;
  ownerId: string;
  trigger: TrapTrigger;
  trapZone: number;
  targetOwnerId?: string;
  targetUnitIndex?: number;
  openedAt: number;
  endsAt: number;
  continuation: PendingTrapContinuation;
}

export interface PendingExtraChoiceWindow {
  ownerId: string;
  zone: number;
  cardId: string;
  openedAt: number;
}

export interface MatchState {
  status: MatchStatus;
  phase: MatchPhase;
  turnNumber: number;
  currentPlayerId: string | null;
  firstPlayerId: string | null;
  coinToss?: CoinTossState;
  turnEndsAt?: number | null;
  turnActionTaken?: boolean;
  pendingTrap?: PendingTrapWindow | null;
  pendingExtraChoice?: PendingExtraChoiceWindow | null;
  /** Temporary private hand-intel window granted by a spell. Only the viewer receives the revealed hand in API payloads. */
  pendingHandIntel?: { viewerId: string; targetId: string; mode: 'view' | 'discard'; sourceCardId?: string } | null;
  /** Turn number when each player last converted one hand card into +1 temporary energy. */
  energySacrificeTurn?: Record<string, number>;
  /** Turn number when each player last retired one of their own field units for +1 temporary energy. */
  fieldSacrificeTurn?: Record<string, number>;
  /** Turn number when each player last spent ENERGY to draw without ending the turn. */
  energyDrawTurn?: Record<string, number>;
  /** Number of ENERGY draws used during that same turn. Cost starts at 2 and rises by +1 per use. */
  energyDrawCount?: Record<string, number>;
  /** Deferred temporary ENERGY granted at the start of that player's next turn. */
  nextTurnEnergyBonus?: Record<string, number>;
  /** Permanent per-match ENERGY maximum bonus. Each point also raises that player's hard cap above the base cap of 10. */
  energyMaxBonus?: Record<string, number>;
  /** Global battlefield clock. Natural progression advances whenever a real unit card successfully enters the field. */
  eclipsePhase?: EclipsePhase;
  /** Source of the latest clock change, used by the HUD to distinguish unit-arrival shifts from card effects. */
  eclipseLastChangeSource?: 'unit' | 'effect';
  /** Automatic unit-arrival cycle advance is skipped while current turn number is at or below this value. */
  eclipsePhaseLockUntilTurn?: number;
  /** Actual phase-change history. Rewind spells pop from this stack instead of merely subtracting from the fixed cycle. */
  eclipsePhaseHistory?: EclipsePhase[];
  /** Last card/player-driven clock change. Used by TIME COUNTER spells; unit-arrival progression never overwrites it. */
  lastManualEclipseChange?: { actorId: string; from: EclipsePhase; to: EclipsePhase; turnNumber: number };
  /** Internal queue used to serialize multiple real-unit arrivals caused by one effect chain. Removed after resolution. */
  eclipseUnitArrivalShiftQueue?: Array<{ actorId: string; cardName: string }>;
  eclipseUnitArrivalShiftResolving?: boolean;
  /** Recent purchased battle emotes; retained only briefly in UI but kept in snapshot for realtime sync. */
  battleEmotes?: Array<{ id: string; senderId: string; emoteId: string; createdAt: number }>;
  /** Per-match hard cap: max 2 fusion summons and max 2 evolution summons per player. */
  extraSummonUsage?: Record<string, { fusion: number; evolution: number }>;
  /** Turn number when each extra summon type was last used, enforcing max once per turn per type. */
  extraSummonTurn?: Record<string, { fusion?: number; evolution?: number }>;
  playerOrder: [string, string] | [];
  core: Record<string, number>;
  /** Optional per-player core ceiling. Normal duels stay at CORE_MAX; boss raids may exceed it. */
  coreMax?: Record<string, number>;
  energy: Record<string, EnergyState>;
  boards: Record<string, PlayerBoard>;
  handCounts: Record<string, number>;
  deckCounts: Record<string, number>;
  extraCounts: Record<string, number>;
  graveyards: Record<string, string[]>;
  logs: MatchLog[];
  visualEvents: VisualEvent[];
  matchStats?: Record<string, MatchPlayerStats>;
  winnerId: string | null;
  winReason: string | null;
}

export interface PrivateState {
  deck: CardInstance[];
  hand: CardInstance[];
  secrets: Array<CardInstance | null>;
  extra: CardInstance[];
}

export interface GameSnapshot {
  state: MatchState;
  privateStates: Record<string, PrivateState>;
}

export interface ActionResult extends GameSnapshot {
  message?: string;
}

interface DamageReport {
  attempted: number;
  absorbed: number;
  healthDamage: number;
  destroyed: boolean;
}

const MAX_LOGS = 90;
const MAX_VISUAL_EVENTS = 18;
export const CORE_MAX = 30;
export const MAX_UNIT_SHIELD = 3;
export const TURN_DURATION_MS = 120_000;
export const TRAP_RESPONSE_MS = 12_000;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function appendLog(state: MatchState, text: string, tone: MatchLog['tone'] = 'normal'): void {
  state.logs.push({ id: randomId('log'), text, tone, createdAt: Date.now() });
  if (state.logs.length > MAX_LOGS) state.logs.splice(0, state.logs.length - MAX_LOGS);
}

function appendVisual(state: MatchState, event: Omit<VisualEvent, 'id' | 'createdAt'>): void {
  state.visualEvents.push({ ...event, id: randomId('vfx'), createdAt: Date.now() });
  if (state.visualEvents.length > MAX_VISUAL_EVENTS) {
    state.visualEvents.splice(0, state.visualEvents.length - MAX_VISUAL_EVENTS);
  }
}

function emptyMatchStats(): MatchPlayerStats {
  return { cardsDrawn: 0, cardsPlayed: 0, unitsSummoned: 0, specialSummons: 0, coreDamage: 0, healing: 0 };
}

function statsFor(state: MatchState, playerId: string): MatchPlayerStats {
  if (!state.matchStats) state.matchStats = {};
  if (!state.matchStats[playerId]) state.matchStats[playerId] = emptyMatchStats();
  return state.matchStats[playerId];
}

function otherPlayer(state: MatchState, playerId: string): string {
  const [a, b] = state.playerOrder;
  if (!a || !b) throw new Error('플레이어 구성이 완료되지 않았습니다.');
  return a === playerId ? b : a;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const random = new Uint32Array(1);
    globalThis.crypto.getRandomValues(random);
    const target = random[0] % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function buildInstances(cardIds: string[], shuffleCards = true): CardInstance[] {
  const instances = cardIds.map((cardId) => ({ instanceId: randomId('ci'), cardId }));
  return shuffleCards ? shuffle(instances) : instances;
}

function emptyBoard(): PlayerBoard {
  return {
    units: Array.from({ length: 5 }, () => null),
    secrets: Array.from({ length: 5 }, () => null),
  };
}

function createPrivate(cardIds: string[], extraCardIds: string[]): PrivateState {
  return {
    deck: buildInstances(cardIds),
    hand: [],
    secrets: Array.from({ length: 5 }, () => null),
    extra: buildInstances(extraCardIds, false),
  };
}

function recycleGraveyardIntoDeck(state: MatchState, privateState: PrivateState, playerId: string): boolean {
  const graveyard = state.graveyards[playerId] ?? [];
  const recyclable: string[] = [];
  const remains: string[] = [];
  for (const cardId of graveyard) {
    const card = CARD_BY_ID[cardId];
    if (card && (card.kind === 'unit' || card.kind === 'spell' || card.kind === 'trap')) recyclable.push(cardId);
    else remains.push(cardId);
  }
  if (recyclable.length === 0) return false;
  privateState.deck = buildInstances(recyclable, true);
  state.graveyards[playerId] = remains;
  state.deckCounts[playerId] = privateState.deck.length;
  appendLog(state, `덱이 비어 묘지의 메인 덱 카드 ${recyclable.length}장을 무작위로 다시 섞었습니다.`, 'system');
  appendVisual(state, { kind: 'draw', vfx: 'grave-reshuffle', ownerId: playerId, amount: recyclable.length, label: `묘지 재편성 ${recyclable.length}장` });
  return true;
}

const V33A_CROWN_FRAGMENT_IDS = [
  'v33a_crown_fragment_eye',
  'v33a_crown_fragment_ear',
  'v33a_crown_fragment_hand',
  'v33a_crown_fragment_heart',
  'v33a_crown_fragment_voice',
] as const;

function checkV33AHandComboVictory(state: MatchState, privateState: PrivateState, playerId: string): boolean {
  if (state.status !== 'active') return false;
  const handIds = new Set(privateState.hand.map((card) => card.cardId));
  if (!V33A_CROWN_FRAGMENT_IDS.every((cardId) => handIds.has(cardId))) return false;
  state.status = 'finished';
  state.winnerId = playerId;
  state.winReason = '오관 집결 · 잊힌 왕의 귀환';
  appendLog(state, '【오관 집결】 잊힌 왕의 다섯 조각이 손패에 모였습니다. 즉시 승리합니다.', 'victory');
  appendVisual(state, { kind: 'special', vfx: 'forgotten-king-awakening', ownerId: playerId, label: 'FORGOTTEN KING · COMPLETE', detail: '망각왕의 오관 5종 완성' });
  return true;
}

function drawCards(state: MatchState, privateState: PrivateState, playerId: string, amount: number): boolean {
  for (let index = 0; index < amount; index += 1) {
    if (privateState.deck.length === 0) recycleGraveyardIntoDeck(state, privateState, playerId);
    const card = privateState.deck.shift();
    if (!card) {
      state.handCounts[playerId] = privateState.hand.length;
      state.deckCounts[playerId] = privateState.deck.length;
      state.status = 'finished';
      state.winnerId = otherPlayer(state, playerId);
      state.winReason = '덱·묘지 소진';
      appendLog(state, `${playerId.slice(0, 6)}의 덱과 재편성 가능한 묘지가 모두 소진되었습니다.`, 'victory');
      return false;
    }
    privateState.hand.push(card);
    statsFor(state, playerId).cardsDrawn += 1;
  }
  state.handCounts[playerId] = privateState.hand.length;
  state.deckCounts[playerId] = privateState.deck.length;
  checkV33AHandComboVictory(state, privateState, playerId);
  return true;
}

export function initializeMatch(
  playerA: string,
  deckA: string[],
  extraA: string[],
  playerB: string,
  deckB: string[],
  extraB: string[],
): GameSnapshot {
  const random = new Uint32Array(1);
  globalThis.crypto.getRandomValues(random);
  const coinSide: 'solar' | 'lunar' = random[0] % 2 === 0 ? 'solar' : 'lunar';
  const first = coinSide === 'solar' ? playerA : playerB;
  const second = first === playerA ? playerB : playerA;
  const tossStartedAt = Date.now();
  const tossEndsAt = tossStartedAt + 4800;

  const privateStates: Record<string, PrivateState> = {
    [playerA]: createPrivate(deckA, extraA),
    [playerB]: createPrivate(deckB, extraB),
  };

  const state: MatchState = {
    status: 'active',
    phase: 'main',
    turnNumber: 1,
    currentPlayerId: first,
    firstPlayerId: first,
    coinToss: { side: coinSide, winnerId: first, startedAt: tossStartedAt, endsAt: tossEndsAt },
    turnEndsAt: tossEndsAt + TURN_DURATION_MS,
    turnActionTaken: false,
    energySacrificeTurn: {},
    fieldSacrificeTurn: {},
    energyDrawTurn: {},
    energyDrawCount: {},
    nextTurnEnergyBonus: {},
    energyMaxBonus: { [playerA]: 0, [playerB]: 0 },
    // Every new duel starts at Dawn. Card/spell effects may change it later,
    // Natural time now advances when a real unit card enters the field.
    eclipsePhase: INITIAL_ECLIPSE_PHASE,
    eclipseLastChangeSource: 'effect',
    eclipsePhaseLockUntilTurn: 0,
    eclipsePhaseHistory: [],
    battleEmotes: [],
    extraSummonUsage: { [playerA]: { fusion: 0, evolution: 0 }, [playerB]: { fusion: 0, evolution: 0 } },
    extraSummonTurn: { [playerA]: {}, [playerB]: {} },
    pendingExtraChoice: null,
    playerOrder: [first, second],
    core: { [playerA]: CORE_MAX, [playerB]: CORE_MAX },
    coreMax: { [playerA]: CORE_MAX, [playerB]: CORE_MAX },
    energy: {
      // V59: the 10-point storage cap is open from the beginning. The first player
      // receives the natural +1 income immediately; the second player receives its
      // +1 when their first personal turn begins. Unspent ENERGY is carried forward.
      [playerA]: { current: playerA === first ? 1 : 0, max: BASE_ENERGY_HARD_CAP },
      [playerB]: { current: playerB === first ? 1 : 0, max: BASE_ENERGY_HARD_CAP },
    },
    boards: { [playerA]: emptyBoard(), [playerB]: emptyBoard() },
    handCounts: { [playerA]: 0, [playerB]: 0 },
    deckCounts: { [playerA]: privateStates[playerA].deck.length, [playerB]: privateStates[playerB].deck.length },
    extraCounts: { [playerA]: privateStates[playerA].extra.length, [playerB]: privateStates[playerB].extra.length },
    graveyards: { [playerA]: [], [playerB]: [] },
    logs: [],
    visualEvents: [],
    matchStats: { [playerA]: emptyMatchStats(), [playerB]: emptyMatchStats() },
    winnerId: null,
    winReason: null,
  };

  drawCards(state, privateStates[playerA], playerA, 5);
  drawCards(state, privateStates[playerB], playerB, 5);
  appendLog(state, '결투가 시작되었습니다.', 'system');
  appendLog(state, `${coinSide === 'solar' ? '태양면' : '월식면'}이 나왔습니다. ${first.slice(0, 6)}의 선공입니다.`, 'system');
  appendVisual(state, { kind: 'summon', vfx: 'duel-genesis', label: 'DUEL START' });
  appendVisual(state, { kind: 'turn', vfx: 'turn-shift', ownerId: first, label: 'FIRST TURN' });
  return { state, privateStates };
}

function assertActiveTurn(state: MatchState, playerId: string): void {
  if (state.status !== 'active') throw new Error('이미 종료된 결투입니다.');
  if (state.pendingTrap) throw new Error('함정 발동 여부를 결정하는 중입니다. 잠시만 기다려 주세요.');
  if (state.coinToss && Date.now() < state.coinToss.endsAt) throw new Error('선공 결정 연출이 끝날 때까지 잠시 기다려 주세요.');
  if (state.turnEndsAt && Date.now() >= state.turnEndsAt) throw new Error('턴 제한 시간 120초가 종료되었습니다.');
  if (state.currentPlayerId !== playerId) throw new Error('상대 턴입니다.');
}

function getCardFromHand(privateState: PrivateState, instanceId: string): { index: number; instance: CardInstance; card: CardDefinition } {
  const index = privateState.hand.findIndex((item) => item.instanceId === instanceId);
  if (index < 0) throw new Error('손패에서 카드를 찾을 수 없습니다.');
  const instance = privateState.hand[index];
  const card = CARD_BY_ID[instance.cardId];
  if (!card) throw new Error('카드 정의를 찾을 수 없습니다.');
  return { index, instance, card };
}

function getCardFromExtra(privateState: PrivateState, instanceId: string): { index: number; instance: CardInstance; card: CardDefinition } {
  const index = privateState.extra.findIndex((item) => item.instanceId === instanceId);
  if (index < 0) throw new Error('엑스트라 덱에서 카드를 찾을 수 없습니다.');
  const instance = privateState.extra[index];
  const card = CARD_BY_ID[instance.cardId];
  if (!card || (card.kind !== 'fusion' && card.kind !== 'evolution')) throw new Error('사용할 수 없는 엑스트라 카드입니다.');
  return { index, instance, card };
}

function spendEnergy(state: MatchState, playerId: string, amount: number): void {
  const energy = state.energy[playerId];
  if (!energy || energy.current < amount) throw new Error(`에너지가 부족합니다. ${amount} 에너지가 필요합니다.`);
  energy.current -= amount;
}

const EXTRA_SUMMON_LIMIT_PER_MATCH = 2;
const EXTRA_SUMMON_FIRST_ROUND = 3;
const EXTRA_SUMMON_SECOND_ROUND = 5;

function extraUsageFor(state: MatchState, playerId: string): { fusion: number; evolution: number } {
  if (!state.extraSummonUsage) state.extraSummonUsage = {};
  if (!state.extraSummonUsage[playerId]) state.extraSummonUsage[playerId] = { fusion: 0, evolution: 0 };
  return state.extraSummonUsage[playerId];
}

function extraTurnFor(state: MatchState, playerId: string): { fusion?: number; evolution?: number } {
  if (!state.extraSummonTurn) state.extraSummonTurn = {};
  if (!state.extraSummonTurn[playerId]) state.extraSummonTurn[playerId] = {};
  return state.extraSummonTurn[playerId];
}

function assertExtraSummonAvailable(state: MatchState, playerId: string, kind: ExtraSummonKind): void {
  const usage = extraUsageFor(state, playerId);
  const turnUse = extraTurnFor(state, playerId);
  const label = kind === 'fusion' ? '공명 융합' : '계승 진화';
  const round = Math.max(1, Math.ceil(state.turnNumber / 2));
  const totalUsed = usage.fusion + usage.evolution;
  if (round < EXTRA_SUMMON_FIRST_ROUND) throw new Error(`엑스트라 소환은 ROUND ${EXTRA_SUMMON_FIRST_ROUND}부터 사용할 수 있습니다.`);
  if (totalUsed >= EXTRA_SUMMON_LIMIT_PER_MATCH) throw new Error(`엑스트라 소환은 공명/계승을 합쳐 한 게임에 최대 ${EXTRA_SUMMON_LIMIT_PER_MATCH}번만 사용할 수 있습니다.`);
  if (totalUsed >= 1 && round < EXTRA_SUMMON_SECOND_ROUND) throw new Error(`두 번째 엑스트라 소환은 ROUND ${EXTRA_SUMMON_SECOND_ROUND}부터 사용할 수 있습니다.`);
  if (usage[kind] >= EXTRA_SUMMON_LIMIT_PER_MATCH) throw new Error(`${label}은 한 게임에 최대 ${EXTRA_SUMMON_LIMIT_PER_MATCH}번만 사용할 수 있습니다.`);
  if (turnUse[kind] === state.turnNumber) throw new Error(`${label}은 한 턴에 1번만 사용할 수 있습니다.`);
}

function recordExtraSummon(state: MatchState, playerId: string, kind: ExtraSummonKind): void {
  const usage = extraUsageFor(state, playerId);
  const turnUse = extraTurnFor(state, playerId);
  usage[kind] += 1;
  turnUse[kind] = state.turnNumber;
}

function isBuffCardEffect(effect: Effect): boolean {
  return effect.kind === 'buff_unit' || effect.kind === 'shield_unit' || effect.kind === 'ready_unit' || effect.kind === 'buff_by_hand';
}

function summonEffectTargetsSelf(card: CardDefinition): boolean {
  return /자신에게|자신의/.test(card.text ?? '');
}

function summonEffectNeedsFriendlyTarget(card: CardDefinition): boolean {
  const effect = card.onSummon;
  if (!effect || summonEffectTargetsSelf(card)) return false;
  return effect.kind === 'buff_unit'
    || effect.kind === 'shield_unit'
    || effect.kind === 'heal_unit'
    || effect.kind === 'ready_unit';
}

function resolveSummonEffectTarget(
  state: MatchState,
  actorId: string,
  zone: number,
  card: CardDefinition,
  requested?: CardActionTarget,
): CardActionTarget | undefined {
  const effect = card.onSummon;
  if (!effect) return undefined;
  if (summonEffectTargetsSelf(card)) return { ownerId: actorId, unitIndex: zone };
  if (!summonEffectNeedsFriendlyTarget(card)) return undefined;
  if (!requested || requested.ownerId !== actorId || !Number.isInteger(requested.unitIndex)) {
    throw new Error('등장 효과를 받을 아군 캐릭터를 선택해야 합니다.');
  }

  const requestedIndex = Number(requested.unitIndex);
  const unitIndex = requestedIndex === -1 ? zone : requestedIndex;
  if (unitIndex < 0 || unitIndex > 4) throw new Error('등장 효과를 받을 올바른 아군 캐릭터를 선택하세요.');
  if (!state.boards[actorId].units[unitIndex]) throw new Error('선택한 아군 캐릭터가 필드에 없습니다.');
  return { ownerId: actorId, unitIndex };
}

function sourceConsumesUnitBuffSlot(sourceCard: CardDefinition | undefined, effect: Effect): boolean {
  return Boolean(sourceCard && (sourceCard.kind === 'spell' || sourceCard.kind === 'trap') && isBuffCardEffect(effect));
}

function firstOpenUnit(board: PlayerBoard): number {
  return board.units.findIndex((slot) => slot === null);
}

function firstOpenSecret(board: PlayerBoard): number {
  return board.secrets.findIndex((slot) => slot === null);
}

function findTrap(privateState: PrivateState, trigger: TrapTrigger, predicate?: (card: CardDefinition) => boolean): { index: number; instance: CardInstance; card: CardDefinition } | null {
  for (let index = 0; index < privateState.secrets.length; index += 1) {
    const instance = privateState.secrets[index];
    if (!instance) continue;
    const card = CARD_BY_ID[instance.cardId];
    if (card?.kind === 'trap' && card.trapTrigger === trigger && (!predicate || predicate(card))) return { index, instance, card };
  }
  return null;
}

function consumeTrap(state: MatchState, privateState: PrivateState, ownerId: string, trapIndex: number, card: CardDefinition): void {
  privateState.secrets[trapIndex] = null;
  state.boards[ownerId].secrets[trapIndex] = null;
  state.graveyards[ownerId].push(card.id);
  appendLog(state, `함정 「${card.name}」 발동 — ${card.text}`, 'trap');
  appendVisual(state, {
    kind: 'trap',
    vfx: resolveCardVfx(card, 'activation'),
    cardId: card.id,
    ownerId,
    label: card.name,
    detail: card.text,
  });
}

function grantUnitShield(unit: UnitState, amount: number): number {
  const before = Math.max(0, Math.min(MAX_UNIT_SHIELD, Math.trunc(unit.shield ?? 0)));
  const requested = Math.max(0, Math.trunc(amount));
  unit.shield = Math.min(MAX_UNIT_SHIELD, before + requested);
  return unit.shield - before;
}

function damageUnit(state: MatchState, ownerId: string, unitIndex: number, amount: number): DamageReport {
  const unit = state.boards[ownerId].units[unitIndex];
  if (!unit || amount <= 0) return { attempted: amount, absorbed: 0, healthDamage: 0, destroyed: false };
  // Old room snapshots could contain shields above the new playtest cap. Normalize
  // them before any combat calculation so a legacy +8 shield cannot survive.
  unit.shield = Math.max(0, Math.min(MAX_UNIT_SHIELD, Math.trunc(unit.shield ?? 0)));
  let remaining = amount;
  let absorbed = 0;
  if (unit.shield > 0) {
    absorbed = Math.min(unit.shield, remaining);
    unit.shield -= absorbed;
    remaining -= absorbed;
  }
  const healthBefore = Math.max(0, unit.health);
  const healthDamage = Math.min(healthBefore, Math.max(0, remaining));
  // Keep the state value identical to the damage we report to the UI. Overkill is
  // handled separately by pierce, so a normal hit should never leave hidden -HP.
  unit.health = Math.max(0, healthBefore - healthDamage);
  return { attempted: amount, absorbed, healthDamage, destroyed: unit.health <= 0 };
}

function damageCore(state: MatchState, playerId: string, amount: number): number {
  const before = Math.max(0, state.core[playerId] ?? 0);
  const actual = Math.min(before, Math.max(0, amount));
  state.core[playerId] = Math.max(0, before - Math.max(0, amount));
  return actual;
}

function healCore(state: MatchState, playerId: string, amount: number): number {
  const before = Math.max(0, state.core[playerId] ?? 0);
  const after = Math.min(state.coreMax?.[playerId] ?? CORE_MAX, before + Math.max(0, amount));
  state.core[playerId] = after;
  return Math.max(0, after - before);
}

export function currentEclipsePhase(state: MatchState): EclipsePhase {
  return state.eclipsePhase ?? 'dawn';
}

const ECLIPSE_MATCH_BONUS: Record<EclipsePhase, { attack: number; health: number }> = {
  dawn: { attack: 1, health: 1 },
  zenith: { attack: 2, health: 0 },
  dusk: { attack: 0, health: 2 },
  midnight: { attack: 1, health: 1 },
  eclipse: { attack: 2, health: 1 },
};

const V38_ENGINE_RARITY_SCORE: Record<CardDefinition['rarity'], number> = {
  common: 0,
  rare: 1,
  epic: 2,
  legendary: 3,
};

function eclipseDistance(a: EclipsePhase, b: EclipsePhase): number {
  const order = ECLIPSE_PHASE_ORDER;
  const ai = order.indexOf(a);
  const bi = order.indexOf(b);
  if (ai < 0 || bi < 0) return 0;
  const raw = Math.abs(ai - bi);
  return Math.min(raw, order.length - raw);
}

function desiredEclipseModifier(card: CardDefinition | undefined, phase: EclipsePhase): { attack: number; health: number; resonance: 'resonant' | 'neutral' | 'strained' } {
  if (!card || !isUnitCard(card)) return { attack: 0, health: 0, resonance: 'neutral' };
  if (card.temporalImmunity) return { attack: 0, health: 0, resonance: 'neutral' };
  const profile = resolvedEclipsePhaseModifiers(card);
  const resolved = profile?.[phase];
  if (!resolved) return { attack: 0, health: 0, resonance: 'neutral' };
  const attack = Math.trunc(resolved.attack ?? 0);
  const health = Math.trunc(resolved.health ?? 0);
  const hasPenalty = attack < 0 || health < 0;
  const hasBonus = attack > 0 || health > 0;
  return { attack, health, resonance: hasPenalty ? 'strained' : hasBonus ? 'resonant' : 'neutral' };
}

function refreshUnitEclipseModifier(state: MatchState, unit: UnitState): void {
  const card = CARD_BY_ID[unit.cardId];
  let oldAttack = Math.trunc(unit.eclipseAttackModifier ?? 0);
  let oldHealth = Math.trunc(unit.eclipseHealthModifier ?? 0);

  // Migration for the reported "TIME number is visible but combat still uses the
  // printed body" bug. Some older snapshots stored eclipseAttackModifier /
  // eclipseHealthModifier for UI only without actually adding the delta to the
  // authoritative body. If the body is still exactly the printed stat, do not
  // subtract that UI-only delta before applying the v39 authoritative modifier.
  if (unit.eclipseModifierVersion !== 2 && card && isUnitCard(card)) {
    if (oldAttack > 0 && unit.attack === Math.max(0, card.attack ?? 0)) oldAttack = 0;
    if (oldHealth > 0 && unit.maxHealth === Math.max(1, card.health ?? 1)) oldHealth = 0;
  }

  const wasDestroyed = unit.health <= 0;
  const damageTaken = Math.max(0, Math.max(1, unit.maxHealth) - Math.max(0, unit.health));
  const printedAttack = card && isUnitCard(card) ? Math.max(0, card.attack ?? 0) : 0;
  const printedHealth = card && isUnitCard(card) ? Math.max(1, card.health ?? 1) : 1;
  let baseAttack = Math.max(0, unit.attack - oldAttack);
  let baseMaxHealth = Math.max(1, unit.maxHealth - oldHealth);

  // v44 hard repair: rooms created before the authoritative TIME-stat fix can
  // still have modifier fields such as +3 while unit.attack/maxHealth remain at
  // the printed body. In that case subtracting the modifier makes the hidden base
  // too small, so later combat still behaves like the bonus was visual-only. Clamp
  // the hidden base back to the printed card body before re-applying the current
  // phase modifier.
  if (card && isUnitCard(card)) {
    if (oldAttack !== 0 && baseAttack < printedAttack) baseAttack = printedAttack;
    if (oldHealth !== 0 && baseMaxHealth < printedHealth) baseMaxHealth = printedHealth;
  }
  const baseHealth = wasDestroyed ? 0 : Math.max(1, baseMaxHealth - damageTaken);

  const desired = desiredEclipseModifier(card, currentEclipsePhase(state));
  const effectiveAttack = Math.max(0, baseAttack + desired.attack);
  const effectiveMaxHealth = Math.max(1, baseMaxHealth + desired.health);
  const appliedAttack = effectiveAttack - baseAttack;
  const appliedHealth = effectiveMaxHealth - baseMaxHealth;

  unit.attack = effectiveAttack;
  unit.maxHealth = effectiveMaxHealth;
  unit.health = wasDestroyed ? 0 : Math.min(effectiveMaxHealth, Math.max(1, baseHealth + appliedHealth));
  unit.eclipseAttackModifier = appliedAttack;
  unit.eclipseHealthModifier = appliedHealth;
  unit.eclipseModifierVersion = 2;
  unit.eclipseResonance = desired.resonance;
}

function refreshBattlefieldEclipseModifiers(state: MatchState): void {
  for (const playerId of state.playerOrder) {
    if (!playerId) continue;
    for (const unit of state.boards[playerId]?.units ?? []) {
      if (unit) refreshUnitEclipseModifier(state, unit);
    }
  }
}

type EclipsePhasePulseDefinition = NonNullable<CardDefinition['eclipsePhasePulses']>[number];

function resolveEclipsePhasePulse(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  ownerId: string,
  sourceZone: number,
  card: CardDefinition,
  pulse: EclipsePhasePulseDefinition,
): void {
  const opponentId = otherPlayer(state, ownerId);
  const ownerPrivate = privateStates[ownerId];
  const effect = pulse.effect;
  const pulseLabel = `${ECLIPSE_PHASE_LABEL[pulse.phase]} · ${pulse.name}`;
  let detail = pulse.description;

  switch (effect.kind) {
    case 'draw': {
      const before = ownerPrivate?.hand.length ?? 0;
      if (ownerPrivate) drawCards(state, ownerPrivate, ownerId, Math.max(0, effect.amount));
      const drew = Math.max(0, (ownerPrivate?.hand.length ?? before) - before);
      detail = `카드 ${drew}장 드로우`;
      appendVisual(state, { kind: 'draw', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: ownerId, targetZone: sourceZone, amount: drew, label: pulse.name });
      break;
    }
    case 'gain_energy': {
      const energy = state.energy[ownerId];
      if (!energy) break;
      const before = energy.current;
      energy.current = Math.min(energyHardCap(state, ownerId), energy.current + Math.max(0, effect.amount));
      const gained = energy.current - before;
      detail = `ENERGY ${gained} 회복`;
      appendVisual(state, { kind: 'energy', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: ownerId, targetZone: sourceZone, amount: gained, label: pulse.name });
      break;
    }
    case 'recover_grave': {
      if (!ownerPrivate) break;
      const grave = state.graveyards[ownerId] ?? [];
      let recovered = 0;
      for (let index = grave.length - 1; index >= 0 && recovered < Math.max(0, effect.amount); index -= 1) {
        const cardId = grave[index];
        const recoveredCard = CARD_BY_ID[cardId];
        if (!recoveredCard || recoveredCard.kind === 'fusion' || recoveredCard.kind === 'evolution') continue;
        grave.splice(index, 1);
        ownerPrivate.hand.push({ instanceId: randomId('ci'), cardId });
        recovered += 1;
      }
      state.handCounts[ownerId] = ownerPrivate.hand.length;
      detail = `묘지의 메인 덱 카드 ${recovered}장 회수`;
      appendVisual(state, { kind: 'special', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: ownerId, targetZone: sourceZone, amount: recovered, label: pulse.name });
      break;
    }
    case 'damage_core': {
      const actual = damageCore(state, opponentId, Math.max(0, effect.amount));
      statsFor(state, ownerId).coreDamage += actual;
      detail = `상대 코어 ${actual} 피해`;
      appendVisual(state, { kind: 'core', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: opponentId, targetZone: sourceZone, amount: actual, label: pulse.name });
      break;
    }
    case 'mass_buff': {
      let affected = 0;
      for (const unit of state.boards[ownerId]?.units ?? []) {
        if (!unit) continue;
        unit.attack = Math.max(0, unit.attack + effect.attack);
        unit.health = Math.max(1, unit.health + effect.health);
        unit.maxHealth = Math.max(1, unit.maxHealth + effect.health);
        affected += 1;
      }
      detail = `아군 ${affected}체 ATK ${effect.attack >= 0 ? '+' : ''}${effect.attack} / DEF ${effect.health >= 0 ? '+' : ''}${effect.health}`;
      appendVisual(state, { kind: 'buff', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: ownerId, targetZone: sourceZone, amount: affected, label: pulse.name });
      break;
    }
    case 'ready_all': {
      let readied = 0;
      for (const unit of state.boards[ownerId]?.units ?? []) {
        if (!unit) continue;
        const stunned = Boolean(unit.stunnedUntilTurn && unit.stunnedUntilTurn >= state.turnNumber);
        if (stunned) continue;
        if (!unit.canAttack) readied += 1;
        unit.canAttack = true;
      }
      detail = `아군 ${readied}체 공격 준비`;
      appendVisual(state, { kind: 'buff', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: ownerId, targetZone: sourceZone, amount: readied, label: pulse.name });
      break;
    }
    case 'mass_shield': {
      let affected = 0;
      for (const unit of state.boards[ownerId]?.units ?? []) {
        if (!unit) continue;
        grantUnitShield(unit, Math.max(0, effect.amount));
        affected += 1;
      }
      detail = `아군 ${affected}체 보호막 +${Math.max(0, effect.amount)}`;
      appendVisual(state, { kind: 'buff', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: ownerId, targetZone: sourceZone, amount: effect.amount, label: pulse.name });
      break;
    }
    case 'heal_core': {
      const healed = healCore(state, ownerId, Math.max(0, effect.amount));
      statsFor(state, ownerId).healing += healed;
      detail = `코어 ${healed} 회복`;
      appendVisual(state, { kind: 'heal', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: ownerId, targetZone: sourceZone, amount: healed, label: pulse.name });
      break;
    }
    case 'summon_token': {
      const zone = firstOpenUnit(state.boards[ownerId]);
      if (zone < 0) {
        detail = '빈 유닛 칸이 없어 잔영 소환 실패';
        break;
      }
      state.boards[ownerId].units[zone] = {
        instanceId: randomId('token'),
        cardId: `token:${effect.name}`,
        ownerId,
        attack: Math.max(0, effect.attack),
        health: Math.max(1, effect.health),
        maxHealth: Math.max(1, effect.health),
        shield: 0,
        canAttack: false,
        summonedTurn: state.turnNumber,
        summonedBy: 'token',
        originCardIds: [card.id],
        buffCardApplied: false,
      };
      detail = `${effect.name} ${Math.max(0, effect.attack)}/${Math.max(1, effect.health)} 소환`;
      appendVisual(state, { kind: 'summon', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: ownerId, targetZone: zone, label: effect.name });
      break;
    }
    case 'freeze_strongest': {
      const candidates = (state.boards[opponentId]?.units ?? [])
        .map((unit, index) => ({ unit, index }))
        .filter((entry): entry is { unit: UnitState; index: number } => Boolean(entry.unit))
        .sort((a, b) => b.unit.attack - a.unit.attack || b.unit.health - a.unit.health || a.index - b.index);
      const target = candidates[0];
      if (!target) {
        detail = '빙결할 적이 없음';
        break;
      }
      const until = state.turnNumber + Math.max(1, effect.turns);
      target.unit.stunnedUntilTurn = Math.max(target.unit.stunnedUntilTurn ?? 0, until);
      target.unit.canAttack = false;
      const targetCard = CARD_BY_ID[target.unit.cardId];
      detail = `${targetCard?.name ?? '가장 강한 적'} ${Math.max(1, effect.turns)}턴 공격 봉쇄`;
      appendVisual(state, { kind: 'special', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: opponentId, targetZone: target.index, amount: effect.turns, label: pulse.name });
      break;
    }
    case 'drain_core': {
      const actual = damageCore(state, opponentId, Math.max(0, effect.amount));
      statsFor(state, ownerId).coreDamage += actual;
      const healed = healCore(state, ownerId, actual);
      statsFor(state, ownerId).healing += healed;
      detail = `상대 코어 ${actual} 흡수 · 내 코어 ${healed} 회복`;
      appendVisual(state, { kind: 'core', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: opponentId, targetZone: sourceZone, amount: actual, label: pulse.name });
      break;
    }
    case 'banish_enemy_grave': {
      const grave = state.graveyards[opponentId] ?? [];
      let banished = 0;
      for (let index = grave.length - 1; index >= 0 && banished < Math.max(0, effect.amount); index -= 1) {
        const targetCard = CARD_BY_ID[grave[index]];
        if (!targetCard || targetCard.kind === 'fusion' || targetCard.kind === 'evolution') continue;
        grave.splice(index, 1);
        banished += 1;
      }
      detail = `상대 묘지 ${banished}장 소멸`;
      appendVisual(state, { kind: 'special', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: opponentId, targetZone: sourceZone, amount: banished, label: pulse.name });
      break;
    }
    case 'steal_energy': {
      const mine = state.energy[ownerId];
      const theirs = state.energy[opponentId];
      if (!mine || !theirs) break;
      const room = Math.max(0, energyHardCap(state, ownerId) - mine.current);
      const stolen = Math.min(Math.max(0, effect.amount), theirs.current, room);
      theirs.current -= stolen;
      mine.current += stolen;
      detail = `상대 ENERGY ${stolen} 흡수`;
      appendVisual(state, { kind: 'energy', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: opponentId, targetZone: sourceZone, amount: stolen, label: pulse.name });
      break;
    }
    case 'heal_allies': {
      let healedTotal = 0;
      for (const unit of state.boards[ownerId]?.units ?? []) {
        if (!unit) continue;
        const before = unit.health;
        unit.health = Math.min(unit.maxHealth, unit.health + Math.max(0, effect.amount));
        healedTotal += unit.health - before;
      }
      detail = `아군 전열 체력 총 ${healedTotal} 회복`;
      appendVisual(state, { kind: 'heal', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: ownerId, targetZone: sourceZone, amount: healedTotal, label: pulse.name });
      break;
    }
    case 'recall_strongest_enemy': {
      const candidates = (state.boards[opponentId]?.units ?? [])
        .map((unit, index) => ({ unit, index }))
        .filter((entry): entry is { unit: UnitState; index: number } => Boolean(entry.unit))
        .sort((a, b) => (b.unit.attack + b.unit.health + b.unit.shield) - (a.unit.attack + a.unit.health + a.unit.shield) || b.unit.attack - a.unit.attack || a.index - b.index);
      const target = candidates[0];
      if (!target) {
        detail = '되돌릴 적 캐릭터가 없음';
        break;
      }
      const targetName = CARD_BY_ID[target.unit.cardId]?.name ?? '상대 최강 캐릭터';
      bounceUnitToOwner(state, privateStates, opponentId, target.index, `eclipse-pulse-${pulse.phase}`);
      detail = `${targetName}을(를) 전장에서 강제 퇴장`;
      appendVisual(state, { kind: 'special', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: opponentId, targetZone: target.index, label: pulse.name });
      break;
    }
    case 'mirror_strongest_enemy': {
      const zone = firstOpenUnit(state.boards[ownerId]);
      const candidates = (state.boards[opponentId]?.units ?? [])
        .map((unit, index) => ({ unit, index }))
        .filter((entry): entry is { unit: UnitState; index: number } => Boolean(entry.unit))
        .sort((a, b) => (b.unit.attack + b.unit.health) - (a.unit.attack + a.unit.health) || b.unit.attack - a.unit.attack || a.index - b.index);
      const target = candidates[0];
      if (zone < 0 || !target) {
        detail = zone < 0 ? '빈 아군 칸이 없어 역상 복제 실패' : '복제할 적 캐릭터가 없음';
        break;
      }
      const copiedAttack = Math.max(1, Math.min(effect.cap, Math.round(target.unit.attack * Math.max(0.1, effect.scale))));
      const copiedHealth = Math.max(1, Math.min(effect.cap, Math.round(target.unit.health * Math.max(0.1, effect.scale))));
      const targetName = CARD_BY_ID[target.unit.cardId]?.name ?? '적 캐릭터';
      state.boards[ownerId].units[zone] = {
        instanceId: randomId('time_mirror'),
        cardId: `token:${targetName}의 역상`,
        ownerId,
        attack: copiedAttack,
        health: copiedHealth,
        maxHealth: copiedHealth,
        shield: 0,
        canAttack: false,
        summonedTurn: state.turnNumber,
        summonedBy: 'token',
        originCardIds: [card.id],
        buffCardApplied: false,
      };
      detail = `${targetName}의 역상 ${copiedAttack}/${copiedHealth} 소환`;
      appendVisual(state, { kind: 'summon', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: ownerId, targetZone: zone, label: pulse.name });
      break;
    }
    case 'revive_best_grave': {
      const zone = firstOpenUnit(state.boards[ownerId]);
      const grave = state.graveyards[ownerId] ?? [];
      const candidates = grave
        .map((cardId, index) => ({ cardId, index, card: CARD_BY_ID[cardId] }))
        .filter((entry): entry is { cardId: string; index: number; card: CardDefinition } => Boolean(entry.card?.kind === 'unit'))
        .sort((a, b) => b.card.cost - a.card.cost || V38_ENGINE_RARITY_SCORE[b.card.rarity] - V38_ENGINE_RARITY_SCORE[a.card.rarity] || b.index - a.index);
      const selected = candidates[0];
      if (zone < 0 || !selected) {
        detail = zone < 0 ? '빈 아군 칸이 없어 과거 호출 실패' : '묘지에 부활 가능한 메인 덱 캐릭터가 없음';
        break;
      }
      grave.splice(selected.index, 1);
      const instance = { instanceId: randomId('time_reborn'), cardId: selected.cardId };
      const revived = makeUnit(state, ownerId, instance, selected.card, 'normal');
      revived.health = Math.max(1, Math.min(revived.maxHealth, Math.ceil(revived.maxHealth * Math.max(0.1, effect.healthRatio))));
      revived.canAttack = Boolean(effect.ready);
      state.boards[ownerId].units[zone] = revived;
      statsFor(state, ownerId).unitsSummoned += 1;
      statsFor(state, ownerId).specialSummons += 1;
      detail = `${selected.card.name} 부활 · DEF ${revived.health}/${revived.maxHealth}${effect.ready ? ' · 즉시 공격 가능' : ''}`;
      appendVisual(state, { kind: 'summon', vfx: `eclipse-pulse-${pulse.phase}`, cardId: selected.card.id, ownerId, targetOwnerId: ownerId, targetZone: zone, label: pulse.name });
      registerRealUnitArrivalTimeShift(state, privateStates, ownerId, selected.card.name);
      break;
    }
    case 'collapse_weakest_enemy': {
      const candidates = (state.boards[opponentId]?.units ?? [])
        .map((unit, index) => ({ unit, index, power: unit ? Math.max(0, unit.attack) + Math.max(0, unit.health) : Number.POSITIVE_INFINITY }))
        .filter((entry): entry is { unit: UnitState; index: number; power: number } => Boolean(entry.unit) && entry.power <= effect.maxPower)
        .sort((a, b) => a.power - b.power || a.unit.health - b.unit.health || a.index - b.index);
      const target = candidates[0];
      if (!target) {
        detail = `ATK+DEF ${effect.maxPower} 이하인 붕괴 대상이 없음`;
        break;
      }
      const targetCard = CARD_BY_ID[target.unit.cardId];
      state.boards[opponentId].units[target.index] = null;
      if (targetCard && !target.unit.cardId.startsWith('token:')) state.graveyards[opponentId].push(targetCard.id);
      detail = `${targetCard?.name ?? '가장 약한 적'} 즉시 파괴`;
      appendVisual(state, { kind: 'destroy', vfx: `eclipse-pulse-${pulse.phase}`, cardId: targetCard?.id ?? card.id, ownerId, targetOwnerId: opponentId, targetZone: target.index, label: pulse.name });
      break;
    }
    case 'discard_highest_cost_enemy': {
      const opponentPrivate = privateStates[opponentId];
      let discarded = 0;
      const discardedNames: string[] = [];
      while (opponentPrivate && opponentPrivate.hand.length > 0 && discarded < Math.max(1, effect.amount)) {
        let bestIndex = 0;
        let bestCost = -1;
        for (let index = 0; index < opponentPrivate.hand.length; index += 1) {
          const candidate = CARD_BY_ID[opponentPrivate.hand[index].cardId];
          const cost = candidate?.cost ?? 0;
          if (cost > bestCost) {
            bestCost = cost;
            bestIndex = index;
          }
        }
        const [removed] = opponentPrivate.hand.splice(bestIndex, 1);
        if (!removed) break;
        state.graveyards[opponentId].push(removed.cardId);
        discardedNames.push(CARD_BY_ID[removed.cardId]?.name ?? '카드');
        discarded += 1;
      }
      if (opponentPrivate) state.handCounts[opponentId] = opponentPrivate.hand.length;
      detail = discarded > 0 ? `상대 최고 비용 카드 ${discarded}장 폐기 · ${discardedNames.join(', ')}` : '상대 손패가 없어 미래 압수 실패';
      appendVisual(state, { kind: 'special', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: opponentId, targetZone: sourceZone, amount: discarded, label: pulse.name });
      break;
    }
    case 'reset_strongest_enemy': {
      const candidates = (state.boards[opponentId]?.units ?? [])
        .map((unit, index) => ({ unit, index, card: unit ? CARD_BY_ID[unit.cardId] : undefined }))
        .filter((entry): entry is { unit: UnitState; index: number; card: CardDefinition } => Boolean(entry.unit && entry.card && isUnitCard(entry.card)))
        .sort((a, b) => (b.unit.attack + b.unit.health + b.unit.shield) - (a.unit.attack + a.unit.health + a.unit.shield) || b.unit.attack - a.unit.attack || a.index - b.index);
      const target = candidates[0];
      if (!target) {
        detail = '초기화할 적 캐릭터가 없음';
        break;
      }
      target.unit.attack = Math.max(0, target.card.attack ?? 0);
      target.unit.maxHealth = Math.max(1, target.card.health ?? 1);
      target.unit.health = target.unit.maxHealth;
      target.unit.shield = 0;
      target.unit.eclipseAttackModifier = 0;
      target.unit.eclipseHealthModifier = 0;
      target.unit.eclipseResonance = 'neutral';
      refreshUnitEclipseModifier(state, target.unit);
      detail = `${target.card.name}의 누적 강화와 보호막 제거 · ${target.unit.attack}/${target.unit.health}`;
      appendVisual(state, { kind: 'special', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: opponentId, targetZone: target.index, label: pulse.name });
      break;
    }
    case 'core_equalize': {
      const mine = Math.max(0, state.core[ownerId] ?? 0);
      const theirs = Math.max(0, state.core[opponentId] ?? 0);
      if (mine >= theirs) {
        detail = '내 코어가 뒤처지지 않아 균형추가 움직이지 않음';
        break;
      }
      const transfer = Math.max(1, Math.min(Math.max(1, effect.cap), Math.ceil((theirs - mine) / 4)));
      const actual = damageCore(state, opponentId, transfer);
      const healed = healCore(state, ownerId, transfer);
      statsFor(state, ownerId).coreDamage += actual;
      statsFor(state, ownerId).healing += healed;
      detail = `코어 격차 보정 · 상대 ${actual} 피해 / 내 코어 ${healed} 회복`;
      appendVisual(state, { kind: 'core', vfx: `eclipse-pulse-${pulse.phase}`, cardId: card.id, ownerId, targetOwnerId: opponentId, targetZone: sourceZone, amount: actual, label: pulse.name });
      break;
    }
    case 'phase_lock': {
      const turns = Math.max(1, effect.turns);
      state.eclipsePhaseLockUntilTurn = Math.max(state.eclipsePhaseLockUntilTurn ?? 0, state.turnNumber + turns);
      detail = `현재 시간 자동 진행 ${turns}턴 고정`;
      appendVisual(state, { kind: 'special', vfx: 'eclipse-cycle-lock', cardId: card.id, ownerId, targetOwnerId: ownerId, targetZone: sourceZone, amount: turns, label: pulse.name });
      break;
    }
  }

  appendLog(state, `【${pulseLabel}】 「${card.name}」 시간 발동 — ${detail}.`, 'special');
}

function triggerEclipsePhasePulses(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  phase: EclipsePhase,
): void {
  const priority = [state.currentPlayerId, ...state.playerOrder.filter((id) => id && id !== state.currentPlayerId)].filter(Boolean) as string[];
  for (const ownerId of priority) {
    const units = state.boards[ownerId]?.units ?? [];
    for (let zone = 0; zone < units.length; zone += 1) {
      const unit = units[zone];
      if (!unit) continue;
      const card = CARD_BY_ID[unit.cardId];
      if (!card?.eclipsePhasePulses?.length) continue;
      for (const pulse of card.eclipsePhasePulses) {
        if (pulse.phase !== phase) continue;
        resolveEclipsePhasePulse(state, privateStates, ownerId, zone, card, pulse);
        if (state.status === 'finished') return;
      }
    }
  }
  checkWinner(state);
}

function triggerAlignedSummonPulses(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  ownerId: string,
  zone: number,
  card: CardDefinition,
): void {
  if (!card.eclipsePhasePulses?.length || !state.boards[ownerId]?.units[zone]) return;
  const phase = currentEclipsePhase(state);
  for (const pulse of card.eclipsePhasePulses) {
    if (pulse.phase !== phase) continue;
    resolveEclipsePhasePulse(state, privateStates, ownerId, zone, card, pulse);
    if (state.status === 'finished') return;
  }
  checkWinner(state);
}

function resolveTemporalDisappearances(state: MatchState): void {
  const phase = currentEclipsePhase(state);
  for (const ownerId of state.playerOrder) {
    if (!ownerId) continue;
    for (let zone = 0; zone < state.boards[ownerId].units.length; zone += 1) {
      const unit = state.boards[ownerId].units[zone];
      if (!unit) continue;
      const card = CARD_BY_ID[unit.cardId];
      if (!card) continue;
      const lifespanEnded = Boolean(card.eclipseLifespanPhases?.length && !card.eclipseLifespanPhases.includes(phase));
      const vanishNow = Boolean(card.eclipseVanishPhases?.includes(phase));
      if (!lifespanEnded && !vanishNow) continue;
      state.boards[ownerId].units[zone] = null;
      if (!unit.cardId.startsWith('token:')) state.graveyards[ownerId].push(unit.cardId);
      appendLog(state, `시간 소멸 — 「${card.name}」이(가) ${ECLIPSE_PHASE_LABEL[phase]} 도래와 함께 사라졌습니다.`, 'special');
      appendVisual(state, { kind: 'destroy', vfx: 'eclipse-time-vanish', cardId: card.id, ownerId, targetOwnerId: ownerId, targetZone: zone, label: '시간 소멸' });
    }
  }
}

function setEclipsePhase(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  phase: EclipsePhase,
  actorId?: string,
  reason = '위상 조율',
  options: { recordHistory?: boolean; source?: 'unit' | 'effect'; recordManual?: boolean } = {},
): void {
  const before = currentEclipsePhase(state);
  if (before === phase) {
    refreshBattlefieldEclipseModifiers(state);
    appendLog(state, `ECLIPSE CYCLE · ${ECLIPSE_PHASE_LABEL[phase]} 유지 · ${reason}`, 'special');
    appendVisual(state, { kind: 'special', vfx: `eclipse-cycle-${phase}`, ownerId: actorId, label: `CYCLE · ${ECLIPSE_PHASE_LABEL[phase]}` });
    return;
  }
  if (options.recordHistory !== false) {
    const history = state.eclipsePhaseHistory ?? [];
    history.push(before);
    state.eclipsePhaseHistory = history.slice(-12);
  }
  state.eclipsePhase = phase;
  state.eclipseLastChangeSource = options.source ?? 'effect';
  if (actorId && options.recordManual !== false) {
    state.lastManualEclipseChange = { actorId, from: before, to: phase, turnNumber: state.turnNumber };
  }
  refreshBattlefieldEclipseModifiers(state);
  resolveTemporalDisappearances(state);
  appendLog(state, `ECLIPSE CYCLE · ${ECLIPSE_PHASE_LABEL[before]} → ${ECLIPSE_PHASE_LABEL[phase]} · ${reason}`, 'special');
  appendVisual(state, { kind: 'special', vfx: `eclipse-cycle-${phase}`, ownerId: actorId, label: `CYCLE · ${ECLIPSE_PHASE_LABEL[phase]}` });
  triggerEclipsePhasePulses(state, privateStates, phase);
}

/**
 * Real unit cards advance the global clock exactly once when they successfully enter the field.
 * Tokens are intentionally excluded so a phase pulse that creates tokens cannot recursively spin
 * the clock forever. Effect chains that recruit/revive multiple real cards are queued and resolved
 * one by one after the current phase transition finishes.
 */
function registerRealUnitArrivalTimeShift(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  actorId: string,
  cardName: string,
): void {
  if (!state.eclipseUnitArrivalShiftQueue) state.eclipseUnitArrivalShiftQueue = [];
  state.eclipseUnitArrivalShiftQueue.push({ actorId, cardName });
  if (state.eclipseUnitArrivalShiftResolving) return;

  state.eclipseUnitArrivalShiftResolving = true;
  let safety = 0;
  try {
    while ((state.eclipseUnitArrivalShiftQueue?.length ?? 0) > 0 && safety < 24 && state.status === 'active') {
      safety += 1;
      const arrival = state.eclipseUnitArrivalShiftQueue?.shift();
      if (!arrival) break;
      const current = currentEclipsePhase(state);
      if ((state.eclipsePhaseLockUntilTurn ?? 0) >= state.turnNumber) {
        appendLog(state, `ECLIPSE CYCLE · 「${arrival.cardName}」 등장 · 시간 고정 효과로 ${ECLIPSE_PHASE_LABEL[current]} 유지.`, 'special');
        continue;
      }
      setEclipsePhase(
        state,
        privateStates,
        nextEclipsePhase(current),
        arrival.actorId,
        `유닛 등장 · 「${arrival.cardName}」`,
        { source: 'unit', recordManual: false },
      );
    }
  } finally {
    delete state.eclipseUnitArrivalShiftResolving;
    delete state.eclipseUnitArrivalShiftQueue;
  }
}

function shiftEclipsePhase(state: MatchState, privateStates: Record<string, PrivateState>, steps: number, actorId?: string, reason = '위상 이동'): void {
  const order = ECLIPSE_PHASE_ORDER;
  const before = currentEclipsePhase(state);
  const index = order.indexOf(before);
  const next = order[((index + steps) % order.length + order.length) % order.length];
  setEclipsePhase(state, privateStates, next, actorId, reason);
}

function rewindEclipsePhase(state: MatchState, privateStates: Record<string, PrivateState>, steps = 1, actorId?: string): void {
  const count = Math.max(1, Math.min(5, Math.floor(steps)));
  const history = [...(state.eclipsePhaseHistory ?? [])];
  let target: EclipsePhase | undefined;
  for (let index = 0; index < count; index += 1) {
    const previous = history.pop();
    if (!previous) break;
    target = previous;
  }
  if (!target) {
    const order = ECLIPSE_PHASE_ORDER;
    const current = currentEclipsePhase(state);
    const index = order.indexOf(current);
    const fallback = order[((index - count) % order.length + order.length) % order.length];
    setEclipsePhase(state, privateStates, fallback, actorId, '시간 역행 · 이전 순환으로 복귀', { recordHistory: false });
    return;
  }
  state.eclipsePhaseHistory = history;
  setEclipsePhase(state, privateStates, target, actorId, '시간 역행 · 실제 직전 시간대로 복귀', { recordHistory: false });
}

function phaseAmount(state: MatchState, phase: EclipsePhase, base: number, bonus: number): { amount: number; aligned: boolean } {
  const aligned = currentEclipsePhase(state) === phase;
  return { amount: Math.max(0, base + (aligned ? bonus : 0)), aligned };
}

function counterableEnemyTimeChange(state: MatchState, actorId: string) {
  const opponentId = otherPlayer(state, actorId);
  const last = state.lastManualEclipseChange;
  if (!last || last.actorId !== opponentId) return null;
  if (state.turnNumber - last.turnNumber !== 1) return null;
  if (currentEclipsePhase(state) !== last.to) return null;
  return last;
}

function applyEffect(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  actorId: string,
  effect: Effect,
  target?: CardActionTarget,
  sourceCard?: CardDefinition,
): void {
  const opponentId = otherPlayer(state, actorId);
  const actorPrivate = privateStates[actorId];

  switch (effect.kind) {
    case 'damage_unit': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('대상 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const report = damageUnit(state, target.ownerId, unitIndex, effect.amount);
      appendVisual(state, { kind: 'defense', vfx: 'effect-impact', ownerId: actorId, targetOwnerId: target.ownerId, targetZone: unitIndex, amount: report.absorbed + report.healthDamage, shieldAmount: report.absorbed, healthAmount: report.healthDamage, label: '효과 피해' });
      break;
    }
    case 'damage_core': {
      const actualDamage = damageCore(state, opponentId, effect.amount);
      statsFor(state, actorId).coreDamage += actualDamage;
      appendVisual(state, { kind: 'core', vfx: 'core-impact', ownerId: actorId, targetOwnerId: opponentId, amount: actualDamage, label: '코어 피해' });
      appendLog(state, `효과로 상대 코어에 ${actualDamage} 피해.`, 'attack');
      break;
    }
    case 'heal_core': {
      const healed = healCore(state, actorId, effect.amount);
      statsFor(state, actorId).healing += healed;
      appendLog(state, `코어를 ${healed} 회복했습니다.`, 'system');
      appendVisual(state, { kind: 'heal', vfx: 'core-heal', ownerId: actorId, targetOwnerId: actorId, amount: healed, label: '코어 회복' });
      break;
    }
    case 'draw': {
      const drew = drawCards(state, actorPrivate, actorId, effect.amount);
      if (drew) appendVisual(state, { kind: 'draw', vfx: 'effect-draw', ownerId: actorId, amount: effect.amount, label: `효과 드로우 ${effect.amount}` });
      break;
    }
    case 'buff_unit': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('대상 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const unit = state.boards[target.ownerId].units[unitIndex];
      if (!unit) throw new Error('대상 유닛이 없습니다.');
      if (sourceConsumesUnitBuffSlot(sourceCard, effect) && unit.buffCardApplied) throw new Error('이 캐릭터는 이미 버프류 카드를 1번 적용받았습니다.');
      unit.attack += effect.attack;
      unit.health += effect.health;
      unit.maxHealth += effect.health;
      if (sourceConsumesUnitBuffSlot(sourceCard, effect)) unit.buffCardApplied = true;
      appendVisual(state, { kind: 'buff', vfx: 'unit-empower', cardId: unit.cardId, ownerId: actorId, targetOwnerId: target.ownerId, targetZone: unitIndex, amount: Math.max(effect.attack, effect.health), label: '유닛 강화' });
      break;
    }
    case 'shield_unit': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('대상 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const unit = state.boards[target.ownerId].units[unitIndex];
      if (!unit) throw new Error('대상 유닛이 없습니다.');
      if (sourceConsumesUnitBuffSlot(sourceCard, effect) && unit.buffCardApplied) throw new Error('이 캐릭터는 이미 버프류 카드를 1번 적용받았습니다.');
      grantUnitShield(unit, effect.amount);
      if (sourceConsumesUnitBuffSlot(sourceCard, effect)) unit.buffCardApplied = true;
      appendVisual(state, { kind: 'buff', vfx: 'shield-rise', cardId: unit.cardId, ownerId: actorId, targetOwnerId: target.ownerId, targetZone: unitIndex, amount: effect.amount, label: '보호막' });
      break;
    }
    case 'aoe_enemy':
      state.boards[opponentId].units.forEach((unit, index) => {
        if (!unit) return;
        const report = damageUnit(state, opponentId, index, effect.amount);
        appendVisual(state, { kind: 'defense', vfx: 'aoe-wave', ownerId: actorId, targetOwnerId: opponentId, targetZone: index, amount: report.absorbed + report.healthDamage, shieldAmount: report.absorbed, healthAmount: report.healthDamage, label: '광역 피해' });
      });
      break;
    case 'gain_energy':
      state.energy[actorId].current = Math.min(state.energy[actorId].max, state.energy[actorId].current + effect.amount);
      appendVisual(state, { kind: 'energy', vfx: 'energy-surge', ownerId: actorId, targetOwnerId: actorId, amount: effect.amount, label: '에너지 회복' });
      break;
    case 'increase_energy_max': {
      const energy = state.energy[actorId] ?? { current: 0, max: 0 };
      const gained = Math.max(0, effect.amount);
      if (gained <= 0) break;
      if (!state.energyMaxBonus) state.energyMaxBonus = {};
      state.energyMaxBonus[actorId] = Math.max(0, (state.energyMaxBonus[actorId] ?? 0) + gained);
      const hardCap = energyHardCap(state, actorId);
      // QUICK START expands both the current maximum and the match-long hard cap.
      // It intentionally does not restore current ENERGY when played.
      energy.max = hardCap;
      energy.current = Math.min(energy.current, hardCap);
      state.energy[actorId] = energy;
      appendLog(state, `보유 ENERGY 최대치 +${gained} · 최대 한도 ${hardCap} (${energy.current}/${energy.max}).`, 'special');
      appendVisual(state, { kind: 'energy', vfx: 'energy-capacity-up', cardId: sourceCard?.id, ownerId: actorId, targetOwnerId: actorId, amount: gained, label: `MAX CAP ${hardCap}` });
      break;
    }
    case 'end_turn_next_energy': {
      if (!state.nextTurnEnergyBonus) state.nextTurnEnergyBonus = {};
      state.nextTurnEnergyBonus[actorId] = Math.min(10, Math.max(0, (state.nextTurnEnergyBonus[actorId] ?? 0) + effect.amount));
      appendLog(state, `다음 내 턴에 임시 ENERGY +${effect.amount} 예약.`, 'special');
      appendVisual(state, { kind: 'energy', vfx: 'light-seal-charge', cardId: sourceCard?.id, ownerId: actorId, targetOwnerId: actorId, amount: effect.amount, label: `NEXT TURN +${effect.amount}` });
      break;
    }
    case 'destroy_weak': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('대상 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const unit = state.boards[target.ownerId].units[unitIndex];
      if (!unit) throw new Error('대상 유닛이 없습니다.');
      if (unit.health > effect.maxHealth) throw new Error(`현재 체력이 ${effect.maxHealth} 이하인 유닛만 파괴할 수 있습니다.`);
      unit.health = 0;
      break;
    }
    case 'summon_token': {
      const index = firstOpenUnit(state.boards[actorId]);
      if (index < 0) throw new Error('토큰을 소환할 빈 유닛 칸이 없습니다.');
      state.boards[actorId].units[index] = {
        instanceId: randomId('token'),
        cardId: `token:${effect.name}`,
        ownerId: actorId,
        attack: effect.attack,
        health: effect.health,
        maxHealth: effect.health,
        shield: 0,
        canAttack: false,
        summonedTurn: state.turnNumber,
        summonedBy: 'token',
        originCardIds: [],
        buffCardApplied: false,
      };
      appendVisual(state, { kind: 'summon', vfx: 'token-birth', ownerId: actorId, targetZone: index, label: effect.name });
      break;
    }
    case 'ready_unit': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('공격 준비시킬 아군 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const unit = state.boards[target.ownerId]?.units[unitIndex];
      if (!unit || target.ownerId !== actorId) throw new Error('내 필드의 유닛을 선택해야 합니다.');
      if (unit.summonedTurn !== state.turnNumber) throw new Error('이 효과는 이번 턴 소환한 유닛에게만 사용할 수 있습니다.');
      if (sourceConsumesUnitBuffSlot(sourceCard, effect) && unit.buffCardApplied) throw new Error('이 캐릭터는 이미 버프류 카드를 1번 적용받았습니다.');
      unit.canAttack = true;
      if (sourceConsumesUnitBuffSlot(sourceCard, effect)) unit.buffCardApplied = true;
      const unitCard = CARD_BY_ID[unit.cardId];
      appendLog(state, `「${unitCard?.name ?? '아군 유닛'}」이(가) 이번 턴 즉시 공격할 수 있게 되었습니다.`, 'special');
      appendVisual(state, { kind: 'buff', vfx: 'tempo-ready', cardId: unitCard?.id, ownerId: actorId, targetOwnerId: actorId, targetZone: unitIndex, label: '즉시 공격' });
      break;
    }
    case 'bounce_unit': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('되돌릴 적 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const board = state.boards[target.ownerId];
      const unit = board?.units[unitIndex];
      if (!unit || target.ownerId !== opponentId) throw new Error('적 유닛을 선택해야 합니다.');
      board.units[unitIndex] = null;
      const unitCard = CARD_BY_ID[unit.cardId];
      if (unitCard?.kind === 'fusion' || unitCard?.kind === 'evolution') {
        privateStates[target.ownerId].extra.push({ instanceId: randomId('ci'), cardId: unitCard.id });
        state.extraCounts[target.ownerId] = privateStates[target.ownerId].extra.length;
      } else if (unitCard?.kind === 'unit') {
        privateStates[target.ownerId].hand.push({ instanceId: randomId('ci'), cardId: unitCard.id });
        state.handCounts[target.ownerId] = privateStates[target.ownerId].hand.length;
      }
      appendLog(state, unitCard ? `「${unitCard.name}」을(를) 원래 영역으로 되돌렸습니다.` : '토큰을 필드에서 소멸시켰습니다.', 'special');
      appendVisual(state, { kind: 'special', vfx: 'tempo-recall', cardId: unitCard?.id, ownerId: actorId, targetOwnerId: target.ownerId, targetZone: unitIndex, label: '전장 이탈' });
      break;
    }
    case 'heal_unit': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('회복할 아군 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const unit = state.boards[target.ownerId]?.units[unitIndex];
      if (!unit || target.ownerId !== actorId) throw new Error('내 필드의 유닛을 선택해야 합니다.');
      const before = unit.health;
      unit.health = Math.min(unit.maxHealth, unit.health + Math.max(0, effect.amount));
      const restored = Math.max(0, unit.health - before);
      appendVisual(state, { kind: 'heal', vfx: 'unit-repair', cardId: unit.cardId, ownerId: actorId, targetOwnerId: actorId, targetZone: unitIndex, amount: restored, label: '유닛 회복' });
      break;
    }
    case 'sacrifice_draw': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('묘지로 보낼 아군 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const unit = state.boards[target.ownerId]?.units[unitIndex];
      if (!unit || target.ownerId !== actorId) throw new Error('내 필드의 유닛을 선택해야 합니다.');
      const unitCard = CARD_BY_ID[unit.cardId];
      state.boards[actorId].units[unitIndex] = null;
      if (unitCard) state.graveyards[actorId].push(unitCard.id);
      const drew = drawCards(state, actorPrivate, actorId, effect.amount);
      appendLog(state, `「${unitCard?.name ?? '토큰'}」을(를) 제물로 보내 카드 ${effect.amount}장을 뽑았습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'sacrifice-convert', cardId: unitCard?.id, ownerId: actorId, targetOwnerId: actorId, targetZone: unitIndex, amount: drew ? effect.amount : 0, label: '제물 전환' });
      break;
    }
    case 'damage_draw_if_destroyed': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('공격할 적 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const report = damageUnit(state, target.ownerId, unitIndex, effect.amount);
      appendVisual(state, { kind: 'defense', vfx: 'effect-impact', ownerId: actorId, targetOwnerId: target.ownerId, targetZone: unitIndex, amount: report.absorbed + report.healthDamage, shieldAmount: report.absorbed, healthAmount: report.healthDamage, label: '처치 연계 피해' });
      if (report.destroyed && effect.draw > 0) {
        drawCards(state, actorPrivate, actorId, effect.draw);
        appendLog(state, `유닛을 파괴해 카드 ${effect.draw}장을 추가로 뽑았습니다.`, 'special');
        appendVisual(state, { kind: 'draw', vfx: 'kill-draw', ownerId: actorId, amount: effect.draw, label: '처치 보상' });
      }
      break;
    }
    case 'recruit_unit': {
      const destination = firstOpenUnit(state.boards[actorId]);
      if (destination < 0) throw new Error('덱에서 유닛을 전개할 빈 필드 칸이 없습니다.');
      const candidates = actorPrivate.deck
        .map((instance, index) => ({ instance, index, card: CARD_BY_ID[instance.cardId] }))
        .filter((entry) => entry.card?.kind === 'unit' && (entry.card.cost ?? 99) <= effect.maxCost);
      if (candidates.length === 0) {
        appendLog(state, `덱에 비용 ${effect.maxCost} 이하의 전개 가능한 유닛이 없습니다.`, 'system');
        break;
      }
      const picked = shuffle(candidates)[0];
      actorPrivate.deck.splice(picked.index, 1);
      const recruitedCard = picked.card as CardDefinition;
      const recruited = makeUnit(state, actorId, picked.instance, recruitedCard, 'normal');
      recruited.canAttack = false;
      state.boards[actorId].units[destination] = recruited;
      state.deckCounts[actorId] = actorPrivate.deck.length;
      statsFor(state, actorId).unitsSummoned += 1;
      statsFor(state, actorId).specialSummons += 1;
      appendLog(state, `덱에서 「${recruitedCard.name}」을(를) 직접 전개했습니다. 소환 효과는 발동하지 않습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'deck-recruit', cardId: recruitedCard.id, ownerId: actorId, targetOwnerId: actorId, targetZone: destination, label: '덱 전개' });
      registerRealUnitArrivalTimeShift(state, privateStates, actorId, recruitedCard.name);
      break;
    }
    case 'recover_grave_unit': {
      const grave = state.graveyards[actorId] ?? [];
      const candidates = grave
        .map((cardId, index) => ({ cardId, index, card: CARD_BY_ID[cardId] }))
        .filter((entry) => entry.card?.kind === 'unit');
      const selected = shuffle(candidates).slice(0, Math.max(0, effect.amount)).sort((a, b) => b.index - a.index);
      if (selected.length === 0) {
        appendLog(state, '묘지에 회수할 유닛이 없습니다.', 'system');
        break;
      }
      const recoveredNames: string[] = [];
      for (const entry of selected) {
        grave.splice(entry.index, 1);
        actorPrivate.hand.push({ instanceId: randomId('ci'), cardId: entry.cardId });
        recoveredNames.push(entry.card?.name ?? entry.cardId);
      }
      state.handCounts[actorId] = actorPrivate.hand.length;
      appendLog(state, `묘지에서 ${recoveredNames.map((name) => `「${name}」`).join(', ')}을(를) 손으로 회수했습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'grave-recover', ownerId: actorId, targetOwnerId: actorId, amount: selected.length, label: '묘지 회수' });
      break;
    }
    case 'draw_if_outnumbered': {
      const myCount = state.boards[actorId].units.filter(Boolean).length;
      const enemyCount = state.boards[opponentId].units.filter(Boolean).length;
      const amount = effect.base + (enemyCount > myCount ? effect.bonus : 0);
      if (amount > 0) drawCards(state, actorPrivate, actorId, amount);
      appendLog(state, enemyCount > myCount ? `필드 열세 보너스로 카드 ${amount}장을 뽑았습니다.` : `카드 ${amount}장을 뽑았습니다.`, 'special');
      appendVisual(state, { kind: 'draw', vfx: 'catchup-draw', ownerId: actorId, amount, label: enemyCount > myCount ? '열세 보충' : '드로우' });
      break;
    }
    case 'swap_stats': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('능력치를 바꿀 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const unit = state.boards[target.ownerId]?.units[unitIndex];
      if (!unit) throw new Error('대상 유닛이 없습니다.');
      const oldAttack = unit.attack;
      const oldHealth = unit.health;
      unit.attack = Math.max(0, oldHealth);
      unit.health = Math.max(1, oldAttack);
      unit.maxHealth = Math.max(1, oldAttack);
      appendLog(state, `「${CARD_BY_ID[unit.cardId]?.name ?? '유닛'}」의 공격력과 체력을 뒤바꿨습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'stat-inversion', cardId: unit.cardId, ownerId: actorId, targetOwnerId: target.ownerId, targetZone: unitIndex, label: '능력치 역전' });
      break;
    }
    case 'tutor_card': {
      const wantedId = target?.deckCardId;
      if (!wantedId) throw new Error('덱에서 가져올 카드를 선택해야 합니다.');
      const deckIndex = actorPrivate.deck.findIndex((instance) => instance.cardId === wantedId);
      if (deckIndex < 0) throw new Error('선택한 카드를 현재 덱에서 찾을 수 없습니다.');
      const [found] = actorPrivate.deck.splice(deckIndex, 1);
      actorPrivate.hand.push(found);
      state.handCounts[actorId] = actorPrivate.hand.length;
      state.deckCounts[actorId] = actorPrivate.deck.length;
      statsFor(state, actorId).cardsDrawn += 1;
      appendLog(state, `정밀 서치 — 「${CARD_BY_ID[wantedId]?.name ?? wantedId}」을(를) 손패에 넣었습니다.`, 'special');
      appendVisual(state, { kind: 'draw', vfx: 'precision-tutor', cardId: wantedId, ownerId: actorId, amount: 1, label: '정밀 서치' });
      break;
    }
    case 'tutor_series_card': {
      const wantedId = target?.deckCardId;
      if (!wantedId) throw new Error('덱에서 가져올 같은 시리즈 카드를 선택해야 합니다.');
      const wanted = CARD_BY_ID[wantedId];
      if (!sourceCard?.seriesId || wanted?.seriesId !== sourceCard.seriesId) throw new Error('이 주문과 같은 시리즈의 카드만 선택할 수 있습니다.');
      const deckIndex = actorPrivate.deck.findIndex((instance) => instance.cardId === wantedId);
      if (deckIndex < 0) throw new Error('선택한 카드를 현재 덱에서 찾을 수 없습니다.');
      const [found] = actorPrivate.deck.splice(deckIndex, 1);
      actorPrivate.hand.push(found);
      state.handCounts[actorId] = actorPrivate.hand.length;
      state.deckCounts[actorId] = actorPrivate.deck.length;
      statsFor(state, actorId).cardsDrawn += 1;
      appendLog(state, `시리즈 서치 — 「${wanted?.name ?? wantedId}」을(를) 손패에 넣었습니다.`, 'special');
      appendVisual(state, { kind: 'draw', vfx: 'series-tutor', cardId: wantedId, ownerId: actorId, amount: 1, label: '시리즈 서치' });
      break;
    }
    case 'recover_any_grave': {
      if (!target || target.ownerId !== actorId || !Number.isInteger(target.graveyardIndex)) throw new Error('묘지에서 회수할 카드를 선택해야 합니다.');
      const graveIndex = Number(target.graveyardIndex);
      const cardId = state.graveyards[actorId]?.[graveIndex];
      const recovered = cardId ? CARD_BY_ID[cardId] : undefined;
      if (!recovered || !['unit','spell','trap'].includes(recovered.kind)) throw new Error('메인 덱 카드만 회수할 수 있습니다.');
      state.graveyards[actorId].splice(graveIndex, 1);
      actorPrivate.hand.push({ instanceId: randomId('ci'), cardId });
      state.handCounts[actorId] = actorPrivate.hand.length;
      appendLog(state, `묘지 회수 — 「${recovered.name}」을(를) 손패로 되돌렸습니다.`, 'special');
      appendVisual(state, { kind: 'draw', vfx: 'grave-card-recover', cardId, ownerId: actorId, amount: 1, label: '묘지 회수' });
      break;
    }
    case 'mill_draw': {
      let milled = 0;
      for (let i = 0; i < Math.max(0, effect.mill); i += 1) {
        const top = actorPrivate.deck.shift();
        if (!top) break;
        state.graveyards[actorId].push(top.cardId);
        milled += 1;
      }
      state.deckCounts[actorId] = actorPrivate.deck.length;
      if (milled > 0) appendLog(state, `덱 위 카드 ${milled}장을 묘지로 보냈습니다.`, 'special');
      const drew = drawCards(state, actorPrivate, actorId, Math.max(0, effect.draw));
      if (drew) appendVisual(state, { kind: 'draw', vfx: 'mill-draw-cycle', ownerId: actorId, amount: effect.draw, label: `재편 드로우 ${effect.draw}` });
      break;
    }
    case 'freeze_unit': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('행동을 봉인할 적 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const unit = state.boards[target.ownerId]?.units[unitIndex];
      if (!unit || target.ownerId !== opponentId) throw new Error('적 유닛을 선택해야 합니다.');
      const until = state.turnNumber + Math.max(1, effect.turns);
      unit.stunnedUntilTurn = Math.max(unit.stunnedUntilTurn ?? 0, until);
      unit.canAttack = false;
      appendLog(state, `「${CARD_BY_ID[unit.cardId]?.name ?? '적 유닛'}」의 다음 공격 기회를 봉인했습니다.`, 'special');
      appendVisual(state, { kind: 'buff', vfx: 'attack-freeze', cardId: unit.cardId, ownerId: actorId, targetOwnerId: target.ownerId, targetZone: unitIndex, label: '공격 봉인' });
      break;
    }
    case 'break_shield_damage': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('장갑을 파쇄할 적 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const unit = state.boards[target.ownerId]?.units[unitIndex];
      if (!unit || target.ownerId !== opponentId) throw new Error('적 유닛을 선택해야 합니다.');
      const removedShield = Math.max(0, unit.shield);
      unit.shield = 0;
      const report = damageUnit(state, target.ownerId, unitIndex, effect.amount);
      appendLog(state, `보호막 ${removedShield} 파쇄 후 체력 ${report.healthDamage} 피해.`, 'attack');
      appendVisual(state, { kind: 'defense', vfx: 'shield-shatter-spell', cardId: unit.cardId, ownerId: actorId, targetOwnerId: target.ownerId, targetZone: unitIndex, amount: report.healthDamage, shieldAmount: removedShield, healthAmount: report.healthDamage, label: '장갑 파쇄' });
      break;
    }
    case 'banish_own_grave_energy': {
      const grave = state.graveyards[actorId] ?? [];
      let removed = 0;
      for (let index = grave.length - 1; index >= 0 && removed < Math.max(0, effect.amount); index -= 1) {
        const candidate = CARD_BY_ID[grave[index]];
        if (!candidate || !['unit','spell','trap'].includes(candidate.kind)) continue;
        grave.splice(index, 1);
        removed += 1;
      }
      if (removed <= 0) throw new Error('소멸시켜 ENERGY로 바꿀 메인 덱 카드가 묘지에 없습니다.');
      const energy = state.energy[actorId];
      const before = energy.current;
      energy.current = Math.min(energy.max, energy.current + Math.max(0, effect.energy));
      const gained = energy.current - before;
      appendLog(state, `묘지 카드 ${removed}장 소멸 · ENERGY +${gained}.`, 'special');
      appendVisual(state, { kind: 'energy', vfx: 'grave-energy-convert', ownerId: actorId, targetOwnerId: actorId, amount: gained, label: '영혼 연료' });
      break;
    }
    case 'discard_draw': {
      const discardCount = Math.min(Math.max(0, effect.discard), actorPrivate.hand.length);
      for (let index = 0; index < discardCount; index += 1) {
        const [discarded] = actorPrivate.hand.splice(actorPrivate.hand.length - 1, 1);
        if (discarded) state.graveyards[actorId].push(discarded.cardId);
      }
      state.handCounts[actorId] = actorPrivate.hand.length;
      const drew = drawCards(state, actorPrivate, actorId, Math.max(0, effect.draw));
      appendLog(state, `손패 ${discardCount}장을 묘지로 보내고 카드 ${effect.draw}장을 뽑았습니다.`, 'special');
      if (drew) appendVisual(state, { kind: 'draw', vfx: 'v33a-hand-reweave', ownerId: actorId, amount: effect.draw, label: '손패 재봉' });
      break;
    }
    case 'steal_energy': {
      const mine = state.energy[actorId];
      const theirs = state.energy[opponentId];
      const room = Math.max(0, mine.max - mine.current);
      const transferred = Math.min(Math.max(0, effect.amount), Math.max(0, theirs.current), room);
      theirs.current -= transferred;
      mine.current += transferred;
      appendLog(state, `상대 ENERGY ${transferred}을 빼앗았습니다.`, 'special');
      appendVisual(state, { kind: 'energy', vfx: 'v33a-energy-siphon', ownerId: actorId, targetOwnerId: opponentId, amount: transferred, label: 'ENERGY 절도' });
      break;
    }
    case 'shield_burst': {
      if (!target || target.ownerId !== actorId || !Number.isInteger(target.unitIndex)) throw new Error('보호막을 폭발시킬 아군 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const unit = state.boards[actorId]?.units[unitIndex];
      if (!unit) throw new Error('아군 유닛을 선택해야 합니다.');
      const spent = Math.max(0, unit.shield);
      if (spent <= 0) throw new Error('보호막이 있는 아군 유닛을 선택해야 합니다.');
      unit.shield = 0;
      const attempted = Math.min(Math.max(0, effect.cap), spent * Math.max(0, effect.multiplier));
      const actual = damageCore(state, opponentId, attempted);
      statsFor(state, actorId).coreDamage += actual;
      appendLog(state, `보호막 ${spent}을 폭발시켜 상대 코어에 ${actual} 피해.`, 'attack');
      appendVisual(state, { kind: 'core', vfx: 'v33a-shield-burst', cardId: unit.cardId, ownerId: actorId, targetOwnerId: opponentId, targetZone: unitIndex, amount: actual, shieldAmount: spent, label: '방벽 폭발' });
      break;
    }
    case 'heal_draw_if_behind': {
      const behind = (state.core[actorId] ?? 0) < (state.core[opponentId] ?? 0);
      const healed = healCore(state, actorId, Math.max(0, effect.heal));
      statsFor(state, actorId).healing += healed;
      let drew = false;
      if (behind && effect.draw > 0) drew = drawCards(state, actorPrivate, actorId, effect.draw);
      appendLog(state, `코어 ${healed} 회복${behind && drew ? ` · 열세 보너스로 ${effect.draw}장 드로우` : ''}.`, 'special');
      appendVisual(state, { kind: 'heal', vfx: 'v33a-comeback-pulse', ownerId: actorId, targetOwnerId: actorId, amount: healed, label: behind ? '역전의 숨' : '회복' });
      break;
    }
    case 'recycle_grave_draw': {
      const grave = state.graveyards[actorId] ?? [];
      const candidates = grave
        .map((cardId, index) => ({ cardId, index, card: CARD_BY_ID[cardId] }))
        .filter((entry) => entry.card && ['unit','spell','trap'].includes(entry.card.kind));
      const selected = shuffle(candidates).slice(0, Math.max(0, effect.amount)).sort((a, b) => b.index - a.index);
      const returnedIds: string[] = [];
      for (const entry of selected) {
        grave.splice(entry.index, 1);
        returnedIds.push(entry.cardId);
      }
      if (returnedIds.length) actorPrivate.deck = shuffle([...actorPrivate.deck, ...buildInstances(returnedIds, false)]);
      state.deckCounts[actorId] = actorPrivate.deck.length;
      const drew = effect.draw > 0 ? drawCards(state, actorPrivate, actorId, effect.draw) : true;
      appendLog(state, `묘지 카드 ${returnedIds.length}장을 덱에 섞고 카드 ${effect.draw}장을 뽑았습니다.`, 'special');
      if (drew) appendVisual(state, { kind: 'draw', vfx: 'v33a-grave-recycle', ownerId: actorId, amount: returnedIds.length, label: '묘지 환류' });
      break;
    }
    case 'damage_by_hand': {
      const attempted = Math.min(Math.max(0, effect.cap), actorPrivate.hand.length * Math.max(0, effect.per));
      const actual = damageCore(state, opponentId, attempted);
      statsFor(state, actorId).coreDamage += actual;
      appendLog(state, `손패 ${actorPrivate.hand.length}장을 힘으로 바꿔 상대 코어에 ${actual} 피해.`, 'attack');
      appendVisual(state, { kind: 'core', vfx: 'v33a-hand-barrage', ownerId: actorId, targetOwnerId: opponentId, amount: actual, label: '손안의 폭풍' });
      break;
    }
    case 'damage_by_grave': {
      const graveCount = state.graveyards[actorId]?.length ?? 0;
      const attempted = Math.min(Math.max(0, effect.cap), graveCount * Math.max(0, effect.per));
      const actual = damageCore(state, opponentId, attempted);
      statsFor(state, actorId).coreDamage += actual;
      appendLog(state, `묘지 ${graveCount}장의 잔향으로 상대 코어에 ${actual} 피해.`, 'attack');
      appendVisual(state, { kind: 'core', vfx: 'v33a-grave-barrage', ownerId: actorId, targetOwnerId: opponentId, amount: actual, label: '묘향 포격' });
      break;
    }
    case 'buff_by_hand': {
      if (!target || target.ownerId !== actorId || !Number.isInteger(target.unitIndex)) throw new Error('강화할 아군 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const unit = state.boards[actorId]?.units[unitIndex];
      if (!unit) throw new Error('아군 유닛을 선택해야 합니다.');
      if (sourceConsumesUnitBuffSlot(sourceCard, effect) && unit.buffCardApplied) throw new Error('이 캐릭터는 이미 버프류 카드를 1번 적용받았습니다.');
      const steps = Math.min(Math.max(0, effect.cap), actorPrivate.hand.length);
      const attackGain = steps * Math.max(0, effect.attackPer);
      const healthGain = steps * Math.max(0, effect.healthPer);
      unit.attack += attackGain;
      unit.health += healthGain;
      unit.maxHealth += healthGain;
      if (sourceConsumesUnitBuffSlot(sourceCard, effect)) unit.buffCardApplied = true;
      appendLog(state, `손패 ${actorPrivate.hand.length}장 기준으로 +${attackGain}/+${healthGain} 강화.`, 'special');
      appendVisual(state, { kind: 'buff', vfx: 'v33a-calculated-growth', cardId: unit.cardId, ownerId: actorId, targetOwnerId: actorId, targetZone: unitIndex, amount: attackGain + healthGain, label: '계산된 성장' });
      break;
    }
    case 'banish_enemy_grave': {
      const grave = state.graveyards[opponentId] ?? [];
      const candidates = grave.map((cardId, index) => ({ cardId, index, card: CARD_BY_ID[cardId] }))
        .filter((entry) => entry.card && ['unit','spell','trap'].includes(entry.card.kind));
      const selected = shuffle(candidates).slice(0, Math.max(0, effect.amount)).sort((a, b) => b.index - a.index);
      for (const entry of selected) grave.splice(entry.index, 1);
      appendLog(state, `상대 묘지의 메인 덱 카드 ${selected.length}장을 소멸시켰습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'v33a-memory-erasure', ownerId: actorId, targetOwnerId: opponentId, amount: selected.length, label: '기억 말소' });
      break;
    }
    case 'field_count_blast': {
      const count = state.boards[actorId].units.filter(Boolean).length;
      const attempted = Math.min(Math.max(0, effect.cap), count * Math.max(0, effect.per));
      const actual = damageCore(state, opponentId, attempted);
      statsFor(state, actorId).coreDamage += actual;
      appendLog(state, `내 필드 ${count}체의 화력을 모아 상대 코어에 ${actual} 피해.`, 'attack');
      appendVisual(state, { kind: 'core', vfx: 'v33a-formation-volley', ownerId: actorId, targetOwnerId: opponentId, amount: actual, label: '전열 포화' });
      break;
    }
    case 'mass_shield': {
      let affected = 0;
      for (const [index, unit] of state.boards[actorId].units.entries()) {
        if (!unit) continue;
        grantUnitShield(unit, Math.max(0, effect.amount));
        affected += 1;
        appendVisual(state, { kind: 'buff', vfx: 'v33a-mass-shield', cardId: unit.cardId, ownerId: actorId, targetOwnerId: actorId, targetZone: index, amount: effect.amount, label: '집단 방벽' });
      }
      appendLog(state, `아군 ${affected}체에게 보호막 ${effect.amount} 부여.`, 'special');
      break;
    }
    case 'mass_buff': {
      let affected = 0;
      for (const [index, unit] of state.boards[actorId].units.entries()) {
        if (!unit) continue;
        unit.attack += effect.attack;
        unit.health += effect.health;
        unit.maxHealth += effect.health;
        affected += 1;
        appendVisual(state, { kind: 'buff', vfx: 'v33a-mass-rally', cardId: unit.cardId, ownerId: actorId, targetOwnerId: actorId, targetZone: index, amount: effect.attack + effect.health, label: '무소속 진군' });
      }
      appendLog(state, `아군 ${affected}체 전부 +${effect.attack}/+${effect.health}.`, 'special');
      break;
    }
    case 'type_rally': {
      let affected = 0;
      for (const [index, unit] of state.boards[actorId].units.entries()) {
        if (!unit) continue;
        const card = CARD_BY_ID[unit.cardId];
        if (card?.unitType !== effect.unitType) continue;
        unit.attack += effect.attack;
        unit.health += effect.health;
        unit.maxHealth += effect.health;
        affected += 1;
        appendVisual(state, { kind: 'buff', vfx: 'v33a-type-rally', cardId: unit.cardId, ownerId: actorId, targetOwnerId: actorId, targetZone: index, amount: effect.attack + effect.health, label: '타입 집결' });
      }
      appendLog(state, `${effect.unitType} 타입 아군 ${affected}체를 +${effect.attack}/+${effect.health} 강화.`, 'special');
      break;
    }
    case 'type_recruit': {
      const destination = firstOpenUnit(state.boards[actorId]);
      if (destination < 0) throw new Error('덱에서 유닛을 전개할 빈 필드 칸이 없습니다.');
      const candidates = actorPrivate.deck
        .map((instance, index) => ({ instance, index, card: CARD_BY_ID[instance.cardId] }))
        .filter((entry) => entry.card?.kind === 'unit' && entry.card.unitType === effect.unitType && entry.card.cost <= effect.maxCost);
      if (!candidates.length) {
        appendLog(state, `조건에 맞는 ${effect.unitType} 타입 유닛이 덱에 없습니다.`, 'system');
        break;
      }
      const picked = shuffle(candidates)[0];
      actorPrivate.deck.splice(picked.index, 1);
      const recruitedCard = picked.card as CardDefinition;
      const recruited = makeUnit(state, actorId, picked.instance, recruitedCard, 'normal');
      recruited.canAttack = false;
      state.boards[actorId].units[destination] = recruited;
      state.deckCounts[actorId] = actorPrivate.deck.length;
      statsFor(state, actorId).unitsSummoned += 1;
      statsFor(state, actorId).specialSummons += 1;
      appendLog(state, `타입 호출 — 「${recruitedCard.name}」을(를) 덱에서 전개했습니다. 등장 효과는 발동하지 않습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'v33a-type-recruit', cardId: recruitedCard.id, ownerId: actorId, targetOwnerId: actorId, targetZone: destination, label: '타입 호출' });
      registerRealUnitArrivalTimeShift(state, privateStates, actorId, recruitedCard.name);
      break;
    }
    case 'reset_unit': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('초기화할 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const unit = state.boards[target.ownerId]?.units[unitIndex];
      if (!unit) throw new Error('대상 유닛이 없습니다.');
      const printed = CARD_BY_ID[unit.cardId];
      if (!printed || !isUnitCard(printed)) throw new Error('토큰은 원형 복귀의 대상으로 선택할 수 없습니다.');
      unit.attack = Math.max(0, printed.attack ?? 0);
      unit.health = Math.max(1, printed.health ?? 1);
      unit.maxHealth = Math.max(1, printed.health ?? 1);
      unit.shield = 0;
      unit.eclipseAttackModifier = 0;
      unit.eclipseHealthModifier = 0;
      refreshUnitEclipseModifier(state, unit);
      appendLog(state, `「${printed.name}」의 능력치를 카드 원래 수치로 초기화하고 현재 시간대 보정을 다시 적용했습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'v33a-unit-reset', cardId: printed.id, ownerId: actorId, targetOwnerId: target.ownerId, targetZone: unitIndex, label: '원형 복귀' });
      break;
    }
    case 'phase_shift': {
      shiftEclipsePhase(state, privateStates, effect.steps, actorId, effect.steps >= 0 ? '궤도 가속' : '천체 역행');
      break;
    }
    case 'phase_rewind': {
      rewindEclipsePhase(state, privateStates, effect.steps ?? 1, actorId);
      break;
    }
    case 'phase_set': {
      setEclipsePhase(state, privateStates, effect.phase, actorId, '관측자의 선택');
      break;
    }
    case 'phase_lock': {
      const turns = Math.max(1, effect.turns);
      state.eclipsePhaseLockUntilTurn = Math.max(state.eclipsePhaseLockUntilTurn ?? 0, state.turnNumber + turns);
      appendLog(state, `ECLIPSE CYCLE 자동 이동을 ${turns}턴 동안 고정했습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'eclipse-cycle-lock', ownerId: actorId, label: `CYCLE LOCK · ${turns}` });
      break;
    }
    case 'phase_counter_enemy': {
      const last = counterableEnemyTimeChange(state, actorId);
      if (!last) throw new Error('카운터할 상대의 직전 시간 변경이 없습니다. 상대가 직전 턴에 바꾼 시간이 그대로 유지 중일 때만 사용할 수 있습니다.');
      const counteredFrom = last.from;
      const counteredTo = last.to;
      setEclipsePhase(state, privateStates, counteredFrom, actorId, `시간 카운터 · ${ECLIPSE_PHASE_LABEL[counteredTo]} 변경 부정`);

      const extraBackSteps = Math.max(0, Math.min(2, effect.extraBackSteps ?? 0));
      if (extraBackSteps > 0) {
        shiftEclipsePhase(state, privateStates, -extraBackSteps, actorId, `시간 카운터 · 추가 ${extraBackSteps}단계 역행`);
      }
      if (effect.lockTurns) {
        const turns = Math.max(1, effect.lockTurns);
        state.eclipsePhaseLockUntilTurn = Math.max(state.eclipsePhaseLockUntilTurn ?? 0, state.turnNumber + turns);
        appendLog(state, `시간 카운터 후 현재 시간을 ${turns}턴 고정했습니다.`, 'special');
      }
      if (effect.stealEnergy) {
        const requested = Math.max(0, effect.stealEnergy);
        const opponentEnergy = state.energy[opponentId] ?? { current: 0, max: 0 };
        const actorEnergy = state.energy[actorId] ?? { current: 0, max: 0 };
        const stolen = Math.min(requested, opponentEnergy.current, Math.max(0, energyHardCap(state, actorId) - actorEnergy.current));
        opponentEnergy.current -= stolen;
        actorEnergy.current += stolen;
        state.energy[opponentId] = opponentEnergy;
        state.energy[actorId] = actorEnergy;
        if (stolen > 0) appendLog(state, `시간 탈취로 상대 ENERGY ${stolen}을 가져왔습니다.`, 'special');
      }
      if (effect.draw) {
        drawCards(state, actorPrivate, actorId, Math.max(0, effect.draw));
      }
      appendLog(state, `TIME COUNTER — 상대의 ${ECLIPSE_PHASE_LABEL[counteredFrom]} → ${ECLIPSE_PHASE_LABEL[counteredTo]} 조작을 되돌렸습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'eclipse-time-counter', ownerId: actorId, targetOwnerId: opponentId, label: 'TIME COUNTER' });
      break;
    }
    case 'phase_draw': {
      const { amount, aligned } = phaseAmount(state, effect.phase, effect.base, effect.bonus);
      if (amount > 0) drawCards(state, actorPrivate, actorId, amount);
      appendLog(state, `${ECLIPSE_PHASE_LABEL[effect.phase]} ${aligned ? '공명 성공' : '비공명'} · 카드 ${amount}장 드로우.`, 'special');
      appendVisual(state, { kind: 'draw', vfx: aligned ? `eclipse-aligned-${effect.phase}` : 'eclipse-offphase', ownerId: actorId, amount, label: aligned ? '위상 공명 드로우' : '위상 드로우' });
      break;
    }
    case 'phase_damage_core': {
      const { amount, aligned } = phaseAmount(state, effect.phase, effect.base, effect.bonus);
      const actual = damageCore(state, opponentId, amount);
      statsFor(state, actorId).coreDamage += actual;
      appendLog(state, `${ECLIPSE_PHASE_LABEL[effect.phase]} ${aligned ? '공명' : '비공명'} 포격 · 상대 코어 ${actual} 피해.`, 'attack');
      appendVisual(state, { kind: 'core', vfx: aligned ? `eclipse-aligned-${effect.phase}` : 'eclipse-offphase', ownerId: actorId, targetOwnerId: opponentId, amount: actual, label: '위상 포격' });
      break;
    }
    case 'phase_gain_energy': {
      const { amount, aligned } = phaseAmount(state, effect.phase, effect.base, effect.bonus);
      const energy = state.energy[actorId] ?? { current: 0, max: 0 };
      const before = energy.current;
      energy.current = Math.min(energyHardCap(state, actorId), energy.current + amount);
      state.energy[actorId] = energy;
      const gained = energy.current - before;
      appendLog(state, `${ECLIPSE_PHASE_LABEL[effect.phase]} ${aligned ? '공명' : '비공명'} · ENERGY +${gained}.`, 'special');
      appendVisual(state, { kind: 'energy', vfx: aligned ? `eclipse-aligned-${effect.phase}` : 'eclipse-offphase', ownerId: actorId, amount: gained, label: '위상 ENERGY' });
      break;
    }
    case 'phase_heal_core': {
      const { amount, aligned } = phaseAmount(state, effect.phase, effect.base, effect.bonus);
      const healed = healCore(state, actorId, amount);
      statsFor(state, actorId).healing += healed;
      appendLog(state, `${ECLIPSE_PHASE_LABEL[effect.phase]} ${aligned ? '공명' : '비공명'} · 코어 ${healed} 회복.`, 'special');
      appendVisual(state, { kind: 'heal', vfx: aligned ? `eclipse-aligned-${effect.phase}` : 'eclipse-offphase', ownerId: actorId, targetOwnerId: actorId, amount: healed, label: '위상 회복' });
      break;
    }
    case 'phase_mass_buff': {
      const aligned = currentEclipsePhase(state) === effect.phase;
      const attack = Math.max(0, effect.attack + (aligned ? effect.bonusAttack : 0));
      const health = Math.max(0, effect.health + (aligned ? effect.bonusHealth : 0));
      let affected = 0;
      for (const [index, unit] of state.boards[actorId].units.entries()) {
        if (!unit) continue;
        unit.attack += attack; unit.health += health; unit.maxHealth += health; affected += 1;
        appendVisual(state, { kind: 'buff', vfx: aligned ? `eclipse-aligned-${effect.phase}` : 'eclipse-offphase', cardId: unit.cardId, ownerId: actorId, targetOwnerId: actorId, targetZone: index, amount: attack + health, label: '위상 전군 강화' });
      }
      appendLog(state, `${ECLIPSE_PHASE_LABEL[effect.phase]} ${aligned ? '공명' : '비공명'} · 아군 ${affected}체 +${attack}/+${health}.`, 'special');
      break;
    }
    case 'phase_mass_shield': {
      const { amount, aligned } = phaseAmount(state, effect.phase, effect.base, effect.bonus);
      let affected = 0;
      for (const [index, unit] of state.boards[actorId].units.entries()) {
        if (!unit) continue;
        grantUnitShield(unit, amount); affected += 1;
        appendVisual(state, { kind: 'buff', vfx: aligned ? `eclipse-aligned-${effect.phase}` : 'eclipse-offphase', cardId: unit.cardId, ownerId: actorId, targetOwnerId: actorId, targetZone: index, amount, label: '위상 방벽' });
      }
      appendLog(state, `${ECLIPSE_PHASE_LABEL[effect.phase]} ${aligned ? '공명' : '비공명'} · 아군 ${affected}체 보호막 +${amount}.`, 'special');
      break;
    }
    case 'phase_aoe_enemy': {
      const { amount, aligned } = phaseAmount(state, effect.phase, effect.base, effect.bonus);
      let total = 0;
      state.boards[opponentId].units.forEach((unit, index) => {
        if (!unit) return;
        const report = damageUnit(state, opponentId, index, amount); total += report.absorbed + report.healthDamage;
        appendVisual(state, { kind: 'defense', vfx: aligned ? `eclipse-aligned-${effect.phase}` : 'eclipse-offphase', ownerId: actorId, targetOwnerId: opponentId, targetZone: index, amount: report.absorbed + report.healthDamage, label: '위상 파동' });
      });
      appendLog(state, `${ECLIPSE_PHASE_LABEL[effect.phase]} ${aligned ? '공명' : '비공명'} · 적 전열에 총 ${total} 피해.`, 'attack');
      break;
    }
    case 'phase_recover_grave': {
      const { amount, aligned } = phaseAmount(state, effect.phase, effect.base, effect.bonus);
      const grave = state.graveyards[actorId] ?? [];
      const candidates = grave.map((cardId, index) => ({ cardId, index, card: CARD_BY_ID[cardId] })).filter((entry) => entry.card && ['unit','spell','trap'].includes(entry.card.kind));
      const selected = shuffle(candidates).slice(0, amount).sort((a, b) => b.index - a.index);
      for (const entry of selected) { grave.splice(entry.index, 1); actorPrivate.hand.push({ instanceId: randomId('ci'), cardId: entry.cardId }); }
      state.handCounts[actorId] = actorPrivate.hand.length;
      appendLog(state, `${ECLIPSE_PHASE_LABEL[effect.phase]} ${aligned ? '공명' : '비공명'} · 묘지에서 ${selected.length}장 회수.`, 'special');
      appendVisual(state, { kind: 'special', vfx: aligned ? `eclipse-aligned-${effect.phase}` : 'eclipse-offphase', ownerId: actorId, amount: selected.length, label: '위상 회수' });
      break;
    }
    case 'phase_summon_token': {
      const slot = firstOpenUnit(state.boards[actorId]);
      if (slot < 0) { appendLog(state, '빈 필드가 없어 위상 잔영을 소환하지 못했습니다.', 'system'); break; }
      const aligned = currentEclipsePhase(state) === effect.phase;
      const attack = Math.max(0, effect.attack + (aligned ? effect.bonusAttack : 0));
      const health = Math.max(1, effect.health + (aligned ? effect.bonusHealth : 0));
      const tokenId = randomId('token');
      state.boards[actorId].units[slot] = { instanceId: tokenId, cardId: `token:${effect.name}`, ownerId: actorId, attack, health, maxHealth: health, shield: 0, canAttack: false, summonedTurn: state.turnNumber, summonedBy: 'token', originCardIds: [] };
      appendLog(state, `${effect.name} ${attack}/${health} 소환${aligned ? ' · 위상 공명 강화' : ''}.`, 'special');
      appendVisual(state, { kind: 'summon', vfx: aligned ? `eclipse-aligned-${effect.phase}` : 'eclipse-offphase', ownerId: actorId, targetOwnerId: actorId, targetZone: slot, label: effect.name });
      break;
    }
    case 'steal_unit': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('강탈할 적 유닛을 선택해야 합니다.');
      const unitIndex = Number(target.unitIndex);
      const sourceBoard = state.boards[target.ownerId];
      const stolen = sourceBoard?.units[unitIndex];
      if (!stolen) throw new Error('강탈할 유닛이 없습니다.');
      const destination = firstOpenUnit(state.boards[actorId]);
      if (destination < 0) throw new Error('강탈한 유닛을 놓을 빈 유닛 칸이 없습니다.');
      sourceBoard.units[unitIndex] = null;
      stolen.ownerId = actorId;
      stolen.canAttack = false;
      stolen.shield = 0;
      stolen.summonedTurn = state.turnNumber;
      state.boards[actorId].units[destination] = stolen;
      const stolenCard = CARD_BY_ID[stolen.cardId];
      appendLog(state, `전설 주문으로 「${stolenCard?.name ?? '유닛'}」의 지배권을 강탈했습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'legendary-seizure', cardId: stolenCard?.id, ownerId: actorId, targetOwnerId: actorId, targetZone: destination, label: '지배권 강탈' });
      break;
    }
    case 'revive_unit': {
      if (!target || target.ownerId !== actorId || !Number.isInteger(target.graveyardIndex)) throw new Error('묘지에서 부활할 유닛을 선택해야 합니다.');
      const graveyardIndex = Number(target.graveyardIndex);
      const cardId = state.graveyards[actorId]?.[graveyardIndex];
      const revivedCard = cardId ? CARD_BY_ID[cardId] : undefined;
      if (!revivedCard || revivedCard.kind !== 'unit') throw new Error('메인 덱 유닛만 부활시킬 수 있습니다.');
      const destination = firstOpenUnit(state.boards[actorId]);
      if (destination < 0) throw new Error('부활시킬 빈 유닛 칸이 없습니다.');
      state.graveyards[actorId].splice(graveyardIndex, 1);
      const revived = makeUnit(state, actorId, { instanceId: randomId('revive'), cardId }, revivedCard, 'normal');
      revived.canAttack = false;
      revived.shield = 0;
      revived.buffCardApplied = false;
      state.boards[actorId].units[destination] = revived;
      statsFor(state, actorId).unitsSummoned += 1;
      statsFor(state, actorId).specialSummons += 1;
      appendLog(state, `묘지에서 「${revivedCard.name}」을(를) 부활시켰습니다. 소환 효과는 재발동하지 않습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'grave-revival', cardId: revivedCard.id, ownerId: actorId, targetOwnerId: actorId, targetZone: destination, label: '묘지 부활' });
      registerRealUnitArrivalTimeShift(state, privateStates, actorId, revivedCard.name);
      break;
    }
    case 'mass_recall': {
      let recalled = 0;
      for (const ownerId of state.playerOrder) {
        if (!ownerId) continue;
        const board = state.boards[ownerId];
        const privateState = privateStates[ownerId];
        board.units.forEach((unit, index) => {
          if (!unit) return;
          const unitCard = CARD_BY_ID[unit.cardId];
          board.units[index] = null;
          if (!unitCard) return; // tokens vanish
          if (unitCard.kind === 'fusion' || unitCard.kind === 'evolution') {
            privateState.extra.push({ instanceId: randomId('ci'), cardId: unitCard.id });
          } else if (unitCard.kind === 'unit') {
            privateState.hand.push({ instanceId: randomId('ci'), cardId: unitCard.id });
          }
          recalled += 1;
        });
        state.handCounts[ownerId] = privateState.hand.length;
        state.extraCounts[ownerId] = privateState.extra.length;
      }
      appendLog(state, `시간의 대회수로 필드 유닛 ${recalled}장을 원래 영역으로 되돌렸습니다. 토큰은 소멸했습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'grand-recall', ownerId: actorId, amount: recalled, label: '시간의 대회수' });
      break;
    }
    case 'invert_all_units': {
      let changed = 0;
      for (const ownerId of state.playerOrder) {
        if (!ownerId) continue;
        for (const unit of state.boards[ownerId].units) {
          if (!unit) continue;
          const oldAttack = unit.attack;
          const oldHealth = unit.health;
          unit.attack = Math.max(0, oldHealth);
          unit.health = Math.max(1, oldAttack);
          unit.maxHealth = Math.max(1, oldAttack);
          changed += 1;
        }
      }
      appendLog(state, `전장의 역위상으로 ${changed}장 유닛의 현재 공격력과 체력이 뒤바뀌었습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'battlefield-inversion', ownerId: actorId, amount: changed, label: '전장 역위상' });
      break;
    }
    case 'erase_opponent_grave': {
      const grave = state.graveyards[opponentId] ?? [];
      const removeCount = Math.min(effect.amount, grave.length);
      const selectedIndexes = shuffle(grave.map((_, index) => index)).slice(0, removeCount).sort((a, b) => b - a);
      for (const index of selectedIndexes) grave.splice(index, 1);
      let drew = false;
      if (effect.draw > 0) drew = drawCards(state, actorPrivate, actorId, effect.draw);
      appendLog(state, `상대 묘지의 카드 ${removeCount}장을 소멸시켰${drew ? `고 카드 ${effect.draw}장을 뽑았습니다` : '습니다'}.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'grave-oblivion', ownerId: actorId, targetOwnerId: opponentId, amount: removeCount, label: '묘지 소멸' });
      break;
    }
    case 'reweave_hand': {
      const handCount = actorPrivate.hand.length;
      const rewoven = actorPrivate.hand.splice(0, actorPrivate.hand.length);
      actorPrivate.deck = shuffle([...actorPrivate.deck, ...rewoven]);
      state.handCounts[actorId] = actorPrivate.hand.length;
      state.deckCounts[actorId] = actorPrivate.deck.length;
      const drawAmount = handCount + effect.bonusDraw;
      const drew = drawCards(state, actorPrivate, actorId, drawAmount);
      appendLog(state, `남은 손패 ${handCount}장을 덱에 다시 섞고 ${drawAmount}장을 새로 뽑았습니다.`, 'special');
      if (drew) appendVisual(state, { kind: 'draw', vfx: 'fate-reweave', ownerId: actorId, amount: drawAmount, label: '운명 재봉' });
      break;
    }
    case 'mirror_unit': {
      if (!target || !Number.isInteger(target.unitIndex)) throw new Error('복제할 적 유닛을 선택해야 합니다.');
      const source = state.boards[target.ownerId]?.units[Number(target.unitIndex)];
      if (!source) throw new Error('복제할 유닛이 없습니다.');
      const destination = firstOpenUnit(state.boards[actorId]);
      if (destination < 0) throw new Error('거울 토큰을 소환할 빈 유닛 칸이 없습니다.');
      const sourceCard = CARD_BY_ID[source.cardId];
      const tokenName = `${sourceCard?.name ?? '유닛'}의 거울상`;
      const copiedHealth = Math.max(1, source.health);
      state.boards[actorId].units[destination] = {
        instanceId: randomId('mirror'), cardId: `token:${tokenName}`, ownerId: actorId,
        attack: Math.max(0, source.attack), health: copiedHealth, maxHealth: copiedHealth, shield: 0, canAttack: false,
        summonedTurn: state.turnNumber, summonedBy: 'token', originCardIds: [], buffCardApplied: false,
      };
      appendLog(state, `「${sourceCard?.name ?? '적 유닛'}」의 현재 능력치를 복사한 거울 토큰을 소환했습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'mirror-incarnation', cardId: sourceCard?.id, ownerId: actorId, targetOwnerId: actorId, targetZone: destination, label: '거울의 현현' });
      break;
    }
    case 'inspect_opponent_hand': {
      state.pendingHandIntel = { viewerId: actorId, targetId: opponentId, mode: 'view', sourceCardId: sourceCard?.id };
      appendLog(state, '상대의 손패 정보를 확인했습니다.', 'special');
      appendVisual(state, { kind: 'special', vfx: 'hand-intel-scan', cardId: sourceCard?.id, ownerId: actorId, targetOwnerId: opponentId, label: '손패 정찰' });
      break;
    }
    case 'discard_opponent_hand': {
      const opponentPrivate = privateStates[opponentId];
      if (!opponentPrivate || opponentPrivate.hand.length === 0) {
        appendLog(state, '상대의 손패가 없어 제거할 카드가 없습니다.', 'system');
        break;
      }
      state.pendingHandIntel = { viewerId: actorId, targetId: opponentId, mode: 'discard', sourceCardId: sourceCard?.id };
      appendLog(state, '상대 손패를 확인했습니다. 제거할 카드 1장을 선택하세요.', 'special');
      appendVisual(state, { kind: 'special', vfx: 'hand-intel-break', cardId: sourceCard?.id, ownerId: actorId, targetOwnerId: opponentId, label: '기억 절제' });
      break;
    }
    case 'exchange_hands': {
      const opponentPrivate = privateStates[opponentId];
      const myHand = actorPrivate.hand;
      actorPrivate.hand = opponentPrivate.hand;
      opponentPrivate.hand = myHand;
      state.handCounts[actorId] = actorPrivate.hand.length;
      state.handCounts[opponentId] = opponentPrivate.hand.length;
      appendLog(state, `패러독스 교환으로 서로의 남은 손패를 맞바꿨습니다.`, 'special');
      appendVisual(state, { kind: 'special', vfx: 'hand-paradox', ownerId: actorId, targetOwnerId: opponentId, label: '손패 교환' });
      break;
    }
  }
  for (const playerId of state.playerOrder) {
    if (playerId) checkV33AHandComboVictory(state, privateStates[playerId], playerId);
  }
}


export function closeHandIntel(snapshot: GameSnapshot, playerId: string): ActionResult {
  const next = clone(snapshot);
  const pending = next.state.pendingHandIntel;
  if (!pending || pending.viewerId !== playerId) return next;
  if (pending.mode === 'discard') throw new Error('제거할 상대 손패 1장을 선택해야 합니다.');
  next.state.pendingHandIntel = null;
  return next;
}

export function discardRevealedOpponentHand(snapshot: GameSnapshot, playerId: string, instanceId: string): ActionResult {
  const next = clone(snapshot);
  const pending = next.state.pendingHandIntel;
  if (!pending || pending.viewerId !== playerId || pending.mode !== 'discard') throw new Error('현재 상대 손패 제거 효과를 처리할 수 없습니다.');
  const targetPrivate = next.privateStates[pending.targetId];
  if (!targetPrivate) throw new Error('상대 손패 정보를 찾을 수 없습니다.');
  const index = targetPrivate.hand.findIndex((card) => card.instanceId === instanceId);
  if (index < 0) throw new Error('선택한 카드는 더 이상 상대 손패에 없습니다.');
  const [discarded] = targetPrivate.hand.splice(index, 1);
  if (discarded) next.state.graveyards[pending.targetId].push(discarded.cardId);
  next.state.handCounts[pending.targetId] = targetPrivate.hand.length;
  next.state.pendingHandIntel = null;
  appendLog(next.state, `상대 손패에서 「${CARD_BY_ID[discarded?.cardId ?? '']?.name ?? '카드'}」 1장을 묘지로 보냈습니다.`, 'special');
  appendVisual(next.state, { kind: 'special', vfx: 'hand-intel-discard', cardId: discarded?.cardId, ownerId: playerId, targetOwnerId: pending.targetId, label: '손패 제거' });
  return next;
}

function seriesUnitCount(state: MatchState, playerId: string, seriesId: SeriesId): number {
  return state.boards[playerId].units.filter((unit) => unit?.ownerId === playerId && CARD_BY_ID[unit.cardId]?.seriesId === seriesId).length;
}

function searchSeriesCards(
  state: MatchState,
  privateState: PrivateState,
  playerId: string,
  seriesId: SeriesId,
  amount: number,
): number {
  let moved = 0;
  for (let count = 0; count < amount; count += 1) {
    const index = privateState.deck.findIndex((instance) => CARD_BY_ID[instance.cardId]?.seriesId === seriesId);
    if (index < 0) break;
    const [instance] = privateState.deck.splice(index, 1);
    privateState.hand.push(instance);
    statsFor(state, playerId).cardsDrawn += 1;
    moved += 1;
  }
  state.handCounts[playerId] = privateState.hand.length;
  state.deckCounts[playerId] = privateState.deck.length;
  return moved;
}

function recoverSeriesCards(
  state: MatchState,
  privateState: PrivateState,
  playerId: string,
  seriesId: SeriesId,
  amount: number,
  sourceCardId: string,
): number {
  let moved = 0;
  for (let count = 0; count < amount; count += 1) {
    let index = state.graveyards[playerId].findIndex((cardId) => cardId !== sourceCardId && CARD_BY_ID[cardId]?.seriesId === seriesId);
    if (index < 0) break;
    const [cardId] = state.graveyards[playerId].splice(index, 1);
    privateState.hand.push({ instanceId: randomId('ci'), cardId });
    moved += 1;
  }
  state.handCounts[playerId] = privateState.hand.length;
  return moved;
}


type SeriesUnitEntry = { unit: UnitState; index: number; card: CardDefinition };

function seriesUnitEntries(state: MatchState, playerId: string, seriesId: SeriesId): SeriesUnitEntry[] {
  const result: SeriesUnitEntry[] = [];
  state.boards[playerId].units.forEach((unit, index) => {
    if (!unit || unit.ownerId !== playerId) return;
    const card = CARD_BY_ID[unit.cardId];
    if (!card || card.seriesId !== seriesId) return;
    result.push({ unit, index, card });
  });
  return result;
}

function gainSignatureEnergy(state: MatchState, playerId: string, amount: number): number {
  const energy = state.energy[playerId];
  if (!energy || amount <= 0) return 0;
  const before = energy.current;
  energy.current = Math.min(energy.max, energy.current + amount);
  return energy.current - before;
}

function searchSeriesCardByKind(
  state: MatchState,
  privateState: PrivateState,
  playerId: string,
  seriesId: SeriesId,
  kind?: CardDefinition['kind'],
): CardDefinition | undefined {
  const index = privateState.deck.findIndex((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    return Boolean(card && card.seriesId === seriesId && (!kind || card.kind === kind));
  });
  if (index < 0) return undefined;
  const [instance] = privateState.deck.splice(index, 1);
  privateState.hand.push(instance);
  state.handCounts[playerId] = privateState.hand.length;
  state.deckCounts[playerId] = privateState.deck.length;
  statsFor(state, playerId).cardsDrawn += 1;
  return CARD_BY_ID[instance.cardId];
}

function recoverSeriesCardByKind(
  state: MatchState,
  privateState: PrivateState,
  playerId: string,
  seriesId: SeriesId,
  kind?: CardDefinition['kind'],
): CardDefinition | undefined {
  const grave = state.graveyards[playerId] ?? [];
  const index = grave.findIndex((cardId) => {
    const card = CARD_BY_ID[cardId];
    const mainDeckCard = card && card.kind !== 'fusion' && card.kind !== 'evolution';
    return Boolean(mainDeckCard && card.seriesId === seriesId && (!kind || card.kind === kind));
  });
  if (index < 0) return undefined;
  const [cardId] = grave.splice(index, 1);
  privateState.hand.push({ instanceId: randomId('ci'), cardId });
  state.handCounts[playerId] = privateState.hand.length;
  return CARD_BY_ID[cardId];
}

function summonSeriesToken(
  state: MatchState,
  playerId: string,
  attack: number,
  health: number,
  name: string,
  vfx: string,
): number {
  const zone = firstOpenUnit(state.boards[playerId]);
  if (zone < 0) return -1;
  state.boards[playerId].units[zone] = {
    instanceId: randomId('sig-token'),
    cardId: `token:${name}`,
    ownerId: playerId,
    attack,
    health,
    maxHealth: health,
    shield: 0,
    canAttack: false,
    summonedTurn: state.turnNumber,
    summonedBy: 'token',
    originCardIds: [],
    buffCardApplied: false,
  };
  appendVisual(state, { kind: 'summon', vfx, ownerId: playerId, targetZone: zone, label: name });
  return zone;
}

function recruitSeriesUnitFromDeck(
  state: MatchState,
  privateState: PrivateState,
  playerId: string,
  seriesId: SeriesId,
  maxCost: number,
): CardDefinition | undefined {
  const zone = firstOpenUnit(state.boards[playerId]);
  if (zone < 0) return undefined;
  const candidates = privateState.deck
    .map((instance, index) => ({ instance, index, card: CARD_BY_ID[instance.cardId] }))
    .filter((entry) => entry.card?.kind === 'unit' && entry.card.seriesId === seriesId && entry.card.cost <= maxCost);
  if (!candidates.length) return undefined;
  const selected = candidates.sort((a, b) => (b.card?.cost ?? 0) - (a.card?.cost ?? 0))[0];
  const [instance] = privateState.deck.splice(selected.index, 1);
  const card = CARD_BY_ID[instance.cardId];
  if (!card || card.kind !== 'unit') return undefined;
  const unit = makeUnit(state, playerId, instance, card, 'normal');
  unit.canAttack = false;
  state.boards[playerId].units[zone] = unit;
  state.deckCounts[playerId] = privateState.deck.length;
  statsFor(state, playerId).unitsSummoned += 1;
  appendVisual(state, { kind: 'summon', vfx: 'series-reinforcement', cardId: card.id, ownerId: playerId, targetZone: zone, label: '시리즈 증원' });
  return card;
}

function reviveSeriesUnitFromGrave(
  state: MatchState,
  privateState: PrivateState,
  playerId: string,
  seriesId: SeriesId,
  maxCost: number,
): CardDefinition | undefined {
  const zone = firstOpenUnit(state.boards[playerId]);
  if (zone < 0) return undefined;
  const grave = state.graveyards[playerId] ?? [];
  const candidates = grave
    .map((cardId, index) => ({ cardId, index, card: CARD_BY_ID[cardId] }))
    .filter((entry) => entry.card?.kind === 'unit' && entry.card.seriesId === seriesId && entry.card.cost <= maxCost);
  if (!candidates.length) return undefined;
  const selected = candidates.sort((a, b) => (b.card?.cost ?? 0) - (a.card?.cost ?? 0))[0];
  grave.splice(selected.index, 1);
  const card = selected.card;
  if (!card || card.kind !== 'unit') return undefined;
  const instance = { instanceId: randomId('reborn'), cardId: card.id };
  const unit = makeUnit(state, playerId, instance, card, 'normal');
  unit.health = 1;
  unit.canAttack = false;
  state.boards[playerId].units[zone] = unit;
  statsFor(state, playerId).unitsSummoned += 1;
  statsFor(state, playerId).specialSummons += 1;
  appendVisual(state, { kind: 'special', vfx: 'series-rebirth', cardId: card.id, ownerId: playerId, targetZone: zone, label: '시리즈 재생' });
  return card;
}

function bounceUnitToOwner(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  ownerId: string,
  unitIndex: number,
  vfx: string,
): CardDefinition | undefined {
  const board = state.boards[ownerId];
  const unit = board?.units[unitIndex];
  if (!unit) return undefined;
  const card = CARD_BY_ID[unit.cardId];
  board.units[unitIndex] = null;
  if (!card) {
    appendVisual(state, { kind: 'special', vfx, ownerId, targetZone: unitIndex, label: '토큰 소멸' });
    return undefined;
  }
  const privateState = privateStates[ownerId];
  if (card.kind === 'fusion' || card.kind === 'evolution') {
    privateState.extra.push({ instanceId: randomId('ci'), cardId: card.id });
    state.extraCounts[ownerId] = privateState.extra.length;
  } else {
    privateState.hand.push({ instanceId: randomId('ci'), cardId: card.id });
    state.handCounts[ownerId] = privateState.hand.length;
  }
  appendVisual(state, { kind: 'special', vfx, cardId: card.id, ownerId, targetZone: unitIndex, label: '전장 이탈' });
  return card;
}

function setSeriesTrapFromDeck(
  state: MatchState,
  privateState: PrivateState,
  playerId: string,
  seriesId: SeriesId,
): CardDefinition | undefined {
  const secretZone = firstOpenSecret(state.boards[playerId]);
  if (secretZone < 0) return undefined;
  const deckIndex = privateState.deck.findIndex((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    return card?.kind === 'trap' && card.seriesId === seriesId;
  });
  if (deckIndex < 0) return undefined;
  const [instance] = privateState.deck.splice(deckIndex, 1);
  const card = CARD_BY_ID[instance.cardId];
  if (!card || card.kind !== 'trap') return undefined;
  privateState.secrets[secretZone] = instance;
  state.boards[playerId].secrets[secretZone] = { occupied: true };
  state.deckCounts[playerId] = privateState.deck.length;
  appendVisual(state, { kind: 'set', vfx: 'phantom-backstage-set', cardId: card.id, ownerId: playerId, targetZone: secretZone, label: '함정 자동 세트' });
  return card;
}

function applySeriesSignature(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  actorId: string,
  sourceCard: CardDefinition,
  sourceZone?: number,
): void {
  const signature = sourceCard.seriesSignature;
  const seriesId = sourceCard.seriesId;
  if (!signature || !seriesId) return;

  const actorPrivate = privateStates[actorId];
  const opponentId = otherPlayer(state, actorId);
  const allies = () => seriesUnitEntries(state, actorId, seriesId);
  const enemies = () => state.boards[opponentId].units
    .map((unit, index) => ({ unit, index, card: unit ? CARD_BY_ID[unit.cardId] : undefined }))
    .filter((entry): entry is { unit: UnitState; index: number; card: CardDefinition | undefined } => Boolean(entry.unit));
  const hasSetTrap = () => state.boards[actorId].secrets.some(Boolean);
  const emit = (label: string, detail: string, kind: VisualEventKind = 'special', amount?: number) => {
    appendLog(state, `SERIES SIGNATURE · ${label} — ${detail}`, 'special');
    appendVisual(state, { kind, vfx: `series-signature-${seriesId}`, cardId: sourceCard.id, ownerId: actorId, targetOwnerId: kind === 'core' ? opponentId : actorId, amount, label });
  };

  switch (signature) {
    // LUMINAKNIGHTS — wide-board formation / reinforcement / finishing pressure.
    case 'lumina_beacon': {
      if (allies().length < 2 || !drawCards(state, actorPrivate, actorId, 1)) break;
      emit('성휘 신호', '대형을 갖춰 카드 1장을 뽑았습니다.', 'draw', 1);
      break;
    }
    case 'lumina_reinforce': {
      if (allies().length < 2) break;
      const recruited = recruitSeriesUnitFromDeck(state, actorPrivate, actorId, seriesId, 2);
      if (recruited) emit('히어로 증원', `덱에서 「${recruited.name}」을(를) 전개했습니다.`);
      break;
    }
    case 'lumina_united': {
      const formation = allies();
      if (formation.length < 3) break;
      for (const entry of formation) { entry.unit.health += 1; entry.unit.maxHealth += 1; }
      emit('연합 방진', `루미나이츠 ${formation.length}장의 체력이 +1 되었습니다.`, 'buff', 1);
      break;
    }
    case 'lumina_finisher': {
      if (allies().length < 4) break;
      const dealt = damageCore(state, opponentId, 2);
      if (dealt > 0) { statsFor(state, actorId).coreDamage += dealt; emit('결전 섬광', `상대 코어에 ${dealt} 피해.`, 'core', dealt); }
      break;
    }

    // KAISERGEAR — shields are the engine; defense first, then resource efficiency.
    case 'kaiser_repair': {
      const target = allies().sort((a, b) => a.unit.shield - b.unit.shield)[0];
      if (!target) break;
      grantUnitShield(target.unit, 2);
      emit('긴급 수리', `「${target.card.name}」 보호막 +2.`, 'buff', 2);
      break;
    }
    case 'kaiser_battery': {
      const shield = allies().reduce((sum, entry) => sum + entry.unit.shield, 0);
      if (shield < 4) break;
      const gained = gainSignatureEnergy(state, actorId, 1);
      if (gained > 0) emit('실드 배터리', `보호막 동력으로 에너지 ${gained} 회복.`, 'energy', gained);
      break;
    }
    case 'kaiser_overdrive': {
      const target = allies().filter((entry) => entry.unit.shield > 0).sort((a, b) => b.unit.attack - a.unit.attack)[0];
      if (!target) break;
      target.unit.attack += 1;
      emit('장갑 오버드라이브', `「${target.card.name}」 공격력 +1.`, 'buff', 1);
      break;
    }
    case 'kaiser_fortress': {
      const formation = allies();
      if (formation.length < 3) break;
      for (const entry of formation) grantUnitShield(entry.unit, 1);
      emit('황제 방벽', `카이저기어 ${formation.length}장에 보호막 1.`, 'buff', 1);
      break;
    }

    // ECLIPSION — use the graveyard as a second resource zone.
    case 'eclipse_echo': {
      if ((state.graveyards[actorId]?.length ?? 0) < 4) break;
      const recovered = recoverSeriesCardByKind(state, actorPrivate, actorId, seriesId);
      if (recovered) emit('묘지의 잔향', `묘지의 「${recovered.name}」을(를) 회수했습니다.`, 'draw', 1);
      break;
    }
    case 'eclipse_devour': {
      const grave = state.graveyards[actorId] ?? [];
      if (grave.length < 3) break;
      const [banished] = grave.splice(0, 1);
      const dealt = damageCore(state, opponentId, 1);
      if (dealt > 0) statsFor(state, actorId).coreDamage += dealt;
      emit('공허 섭식', `「${CARD_BY_ID[banished]?.name ?? '묘지 카드'}」을(를) 소멸시키고 코어 ${dealt} 피해.`, 'core', dealt);
      break;
    }
    case 'eclipse_rebirth': {
      if ((state.graveyards[actorId]?.length ?? 0) < 5) break;
      const revived = reviveSeriesUnitFromGrave(state, actorPrivate, actorId, seriesId, 2);
      if (revived) emit('일식 재생', `「${revived.name}」을(를) 체력 1로 되살렸습니다.`);
      break;
    }
    case 'eclipse_resonance': {
      if ((state.graveyards[actorId]?.length ?? 0) < 7) break;
      const drew = drawCards(state, actorPrivate, actorId, 1);
      const gained = gainSignatureEnergy(state, actorId, 1);
      if (drew || gained > 0) emit('심층 공명', `카드 ${drew ? 1 : 0}장 · 에너지 ${gained} 회복.`, drew ? 'draw' : 'energy', drew ? 1 : gained);
      break;
    }

    // NOCTURNE MIRAGE — comeback/control tools rather than raw damage.
    case 'nocturne_moonheal': {
      if ((state.core[actorId] ?? 0) >= (state.core[opponentId] ?? 0)) break;
      const healed = healCore(state, actorId, 2);
      if (healed > 0) { statsFor(state, actorId).healing += healed; emit('월영 치유', `코어 ${healed} 회복.`, 'heal', healed); }
      break;
    }
    case 'nocturne_illusion': {
      if ((state.core[actorId] ?? 0) >= (state.core[opponentId] ?? 0)) break;
      const target = enemies().filter((entry) => (entry.card?.cost ?? 99) <= 3).sort((a, b) => (b.card?.cost ?? 0) - (a.card?.cost ?? 0))[0];
      if (!target) break;
      const recalled = bounceUnitToOwner(state, privateStates, opponentId, target.index, 'nocturne-illusion');
      emit('환영 퇴장', `「${recalled?.name ?? '토큰'}」을(를) 전장에서 되돌렸습니다.`);
      break;
    }
    case 'nocturne_dreamsearch': {
      if (allies().length < 2) break;
      const searched = searchSeriesCardByKind(state, actorPrivate, actorId, seriesId, 'spell');
      if (searched) emit('몽환 탐색', `덱에서 「${searched.name}」을(를) 손으로 가져왔습니다.`, 'draw', 1);
      break;
    }
    case 'nocturne_mirrorveil': {
      const formation = allies();
      if (formation.length < 2) break;
      const target = formation.sort((a, b) => a.unit.health - b.unit.health)[0];
      if (!target) break;
      grantUnitShield(target.unit, 2);
      emit('거울 장막', `「${target.card.name}」 보호막 +2.`, 'buff', 2);
      break;
    }

    // ARBORIAN — grow a living board and outlast the opponent.
    case 'arborian_seed': {
      if (allies().length < 1) break;
      const zone = summonSeriesToken(state, actorId, 1, 2, '세계수 새싹', 'arborian-seed');
      if (zone >= 0) emit('세계수의 씨앗', '1/2 세계수 새싹 토큰을 소환했습니다.');
      break;
    }
    case 'arborian_growth': {
      const formation = allies();
      if (formation.length < 2) break;
      const target = formation.sort((a, b) => a.unit.health - b.unit.health)[0];
      if (!target) break;
      target.unit.health += 2; target.unit.maxHealth += 2;
      emit('급속 생장', `「${target.card.name}」 체력 +2.`, 'buff', 2);
      break;
    }
    case 'arborian_regrowth': {
      const formation = allies();
      if (formation.length < 2) break;
      let healedTotal = 0;
      for (const entry of formation) {
        const before = entry.unit.health;
        entry.unit.health = Math.min(entry.unit.maxHealth, entry.unit.health + 1);
        healedTotal += entry.unit.health - before;
      }
      if (healedTotal > 0) emit('재생 수액', `전열 체력을 총 ${healedTotal} 회복.`, 'heal', healedTotal);
      break;
    }
    case 'arborian_bloom': {
      if (allies().length < 3) break;
      const healed = healCore(state, actorId, 2);
      if (healed > 0) { statsFor(state, actorId).healing += healed; emit('만개', `코어 ${healed} 회복.`, 'heal', healed); }
      break;
    }

    // TEMPEST DRIVE — immediate tempo, energy, and chained pressure.
    case 'tempest_afterburn': {
      const candidates = allies().filter((entry) => entry.unit.summonedTurn === state.turnNumber && !entry.unit.canAttack);
      const target = (sourceZone !== undefined ? candidates.find((entry) => entry.index === sourceZone) : undefined) ?? candidates[0];
      if (!target) break;
      target.unit.canAttack = true;
      emit('애프터버너 점화', `「${target.card.name}」이(가) 즉시 공격 가능해졌습니다.`, 'energy', 1);
      break;
    }
    case 'tempest_voltage': {
      if (allies().length < 2) break;
      const gained = gainSignatureEnergy(state, actorId, 1);
      if (gained > 0) emit('전압 축적', `에너지 ${gained} 회복.`, 'energy', gained);
      break;
    }
    case 'tempest_chainbolt': {
      if (allies().length < 2) break;
      const target = enemies().sort((a, b) => a.unit.health - b.unit.health)[0];
      if (target) {
        const report = damageUnit(state, opponentId, target.index, 1);
        emit('연쇄 낙뢰', `「${target.card?.name ?? '적 유닛'}」에 ${report.absorbed + report.healthDamage} 피해.`, 'defense', report.absorbed + report.healthDamage);
      } else {
        const dealt = damageCore(state, opponentId, 1);
        if (dealt > 0) statsFor(state, actorId).coreDamage += dealt;
        if (dealt > 0) emit('연쇄 낙뢰', `상대 코어에 ${dealt} 피해.`, 'core', dealt);
      }
      break;
    }
    case 'tempest_momentum': {
      if (allies().length < 3 || !drawCards(state, actorPrivate, actorId, 1)) break;
      emit('초가속 모멘텀', '카드 1장을 뽑았습니다.', 'draw', 1);
      break;
    }

    // ABYSS REAPER — pressure both graveyards and convert death into sustain.
    case 'abyss_feast': {
      const grave = state.graveyards[opponentId] ?? [];
      if (!grave.length) break;
      const [banished] = grave.splice(0, 1);
      const healed = healCore(state, actorId, 1);
      if (healed > 0) statsFor(state, actorId).healing += healed;
      emit('영혼 포식', `상대 묘지의 「${CARD_BY_ID[banished]?.name ?? '카드'}」을(를) 소멸시키고 코어 ${healed} 회복.`, 'heal', healed);
      break;
    }
    case 'abyss_harvest': {
      if ((state.graveyards[actorId]?.length ?? 0) < 4 || !drawCards(state, actorPrivate, actorId, 1)) break;
      emit('심연 수확', '카드 1장을 뽑았습니다.', 'draw', 1);
      break;
    }
    case 'abyss_execute': {
      if ((state.graveyards[opponentId]?.length ?? 0) < 2) break;
      const target = enemies().sort((a, b) => a.unit.health - b.unit.health)[0];
      if (!target) break;
      const report = damageUnit(state, opponentId, target.index, 2);
      emit('사형 집행', `「${target.card?.name ?? '적 유닛'}」에 ${report.absorbed + report.healthDamage} 피해.`, 'defense', report.absorbed + report.healthDamage);
      break;
    }
    case 'abyss_drain': {
      if ((state.graveyards[opponentId]?.length ?? 0) < 4) break;
      const dealt = damageCore(state, opponentId, 1);
      const healed = healCore(state, actorId, 1);
      if (dealt > 0) statsFor(state, actorId).coreDamage += dealt;
      if (healed > 0) statsFor(state, actorId).healing += healed;
      if (dealt > 0 || healed > 0) emit('검은 흡수', `상대 코어 ${dealt} 피해 · 내 코어 ${healed} 회복.`, 'core', dealt);
      break;
    }

    // PRIMAL GUARDIAN — pack size converts into bodies, stats, shields and recovery.
    case 'primal_spirit': {
      if (allies().length < 2) break;
      const zone = summonSeriesToken(state, actorId, 2, 2, '원초 수호령', 'primal-spirit');
      if (zone >= 0) emit('수호령 현현', '2/2 원초 수호령 토큰을 소환했습니다.');
      break;
    }
    case 'primal_pack': {
      const formation = allies();
      if (formation.length < 2) break;
      const target = formation.sort((a, b) => a.unit.health - b.unit.health)[0];
      if (!target) break;
      target.unit.attack += 1; target.unit.health += 1; target.unit.maxHealth += 1;
      emit('무리의 결속', `「${target.card.name}」 +1/+1.`, 'buff', 1);
      break;
    }
    case 'primal_shelter': {
      const formation = allies();
      if (formation.length < 3) break;
      for (const entry of formation) grantUnitShield(entry.unit, 1);
      emit('대지의 품', `프라이멀 ${formation.length}장에 보호막 1.`, 'buff', 1);
      break;
    }
    case 'primal_vitality': {
      const amount = Math.min(2, Math.floor(allies().length / 2));
      if (amount <= 0) break;
      const healed = healCore(state, actorId, amount);
      if (healed > 0) { statsFor(state, actorId).healing += healed; emit('야생 생명력', `코어 ${healed} 회복.`, 'heal', healed); }
      break;
    }

    // CHRONORIUM — flexible tempo without raw burst; existing tactical passive is already strong.
    case 'chrono_accelerate': {
      if ((state.energy[actorId]?.current ?? 0) > 2) break;
      const gained = gainSignatureEnergy(state, actorId, 1);
      if (gained > 0) emit('시간 가속', `에너지 ${gained} 회복.`, 'energy', gained);
      break;
    }
    case 'chrono_rewind': {
      const recovered = recoverSeriesCardByKind(state, actorPrivate, actorId, seriesId, 'unit');
      if (recovered) emit('시간 되감기', `묘지의 「${recovered.name}」을(를) 회수했습니다.`, 'draw', 1);
      break;
    }
    case 'chrono_foresee': {
      if (allies().length < 2 || !drawCards(state, actorPrivate, actorId, 1)) break;
      emit('미래 관측', '카드 1장을 뽑았습니다.', 'draw', 1);
      break;
    }
    case 'chrono_reset': {
      const target = allies().sort((a, b) => a.unit.health - b.unit.health)[0];
      if (!target) break;
      const before = target.unit.health;
      target.unit.health = Math.min(target.unit.maxHealth, target.unit.health + 2);
      grantUnitShield(target.unit, 1);
      emit('상태 복원', `「${target.card.name}」 체력 ${target.unit.health - before} 회복 · 보호막 1.`, 'buff', 1);
      break;
    }

    // ARCANA PROTOCOL — the spell graveyard is a combo counter and recursion engine.
    case 'arcana_inscribe': {
      const spellCount = (state.graveyards[actorId] ?? []).filter((cardId) => CARD_BY_ID[cardId]?.kind === 'spell').length;
      if (spellCount < 1) break;
      const searched = searchSeriesCardByKind(state, actorPrivate, actorId, seriesId, 'spell');
      if (searched) emit('주문 각인', `덱에서 「${searched.name}」을(를) 서치했습니다.`, 'draw', 1);
      break;
    }
    case 'arcana_recycle': {
      const spellCount = (state.graveyards[actorId] ?? []).filter((cardId) => CARD_BY_ID[cardId]?.kind === 'spell').length;
      if (spellCount < 3) break;
      const recovered = recoverSeriesCardByKind(state, actorPrivate, actorId, seriesId, 'spell');
      if (recovered) emit('규약 재사용', `묘지의 「${recovered.name}」을(를) 회수했습니다.`, 'draw', 1);
      break;
    }
    case 'arcana_chain': {
      const spellCount = (state.graveyards[actorId] ?? []).filter((cardId) => CARD_BY_ID[cardId]?.kind === 'spell').length;
      if (spellCount < 2) break;
      const gained = gainSignatureEnergy(state, actorId, 1);
      if (gained > 0) emit('마법 연쇄', `에너지 ${gained} 회복.`, 'energy', gained);
      break;
    }
    case 'arcana_hex': {
      const spellCount = (state.graveyards[actorId] ?? []).filter((cardId) => CARD_BY_ID[cardId]?.kind === 'spell').length;
      if (spellCount < 4) break;
      const target = enemies().sort((a, b) => a.unit.health - b.unit.health)[0];
      if (!target) break;
      const report = damageUnit(state, opponentId, target.index, 2);
      emit('봉인식', `「${target.card?.name ?? '적 유닛'}」에 ${report.absorbed + report.healthDamage} 피해.`, 'defense', report.absorbed + report.healthDamage);
      break;
    }

    // BEASTFORGE — armor becomes offense; unlike Kaiser, shields are expendable fuel.
    case 'beast_repair': {
      const target = allies().sort((a, b) => a.unit.health - b.unit.health)[0];
      if (!target) break;
      const before = target.unit.health;
      target.unit.health = Math.min(target.unit.maxHealth, target.unit.health + 2);
      if (target.unit.health > before) emit('야수 수복', `「${target.card.name}」 체력 ${target.unit.health - before} 회복.`, 'heal', target.unit.health - before);
      break;
    }
    case 'beast_plating': {
      const target = allies().sort((a, b) => a.unit.shield - b.unit.shield)[0];
      if (!target) break;
      grantUnitShield(target.unit, 2);
      emit('합금 장갑', `「${target.card.name}」 보호막 +2.`, 'buff', 2);
      break;
    }
    case 'beast_hunt': {
      if (!allies().some((entry) => entry.unit.shield > 0)) break;
      const target = enemies().sort((a, b) => a.unit.health - b.unit.health)[0];
      if (!target) break;
      const report = damageUnit(state, opponentId, target.index, 2);
      emit('포식 추적', `「${target.card?.name ?? '적 유닛'}」에 ${report.absorbed + report.healthDamage} 피해.`, 'defense', report.absorbed + report.healthDamage);
      break;
    }
    case 'beast_rage': {
      const target = allies().filter((entry) => entry.unit.shield > 0).sort((a, b) => b.unit.attack - a.unit.attack)[0];
      if (!target) break;
      target.unit.shield = Math.max(0, target.unit.shield - 1);
      target.unit.attack += 2;
      emit('장갑 격노', `「${target.card.name}」 보호막 1 소모 · 공격력 +2.`, 'buff', 2);
      break;
    }

    // PHANTOM CARNIVAL — traps are part of the board engine, not just reactions.
    case 'phantom_set': {
      if (allies().length < 2) break;
      const trap = setSeriesTrapFromDeck(state, actorPrivate, actorId, seriesId);
      if (trap) emit('무대 뒤 장치', `덱의 「${trap.name}」을(를) 바로 세트했습니다.`, 'set', 1);
      break;
    }
    case 'phantom_encore': {
      if (!hasSetTrap()) break;
      const recovered = recoverSeriesCardByKind(state, actorPrivate, actorId, seriesId, 'trap');
      if (recovered) emit('앙코르 회수', `묘지의 「${recovered.name}」을(를) 회수했습니다.`, 'draw', 1);
      break;
    }
    case 'phantom_misdirect': {
      if (!hasSetTrap()) break;
      const target = enemies().filter((entry) => (entry.card?.cost ?? 99) <= 3).sort((a, b) => (b.card?.cost ?? 0) - (a.card?.cost ?? 0))[0];
      if (!target) break;
      const recalled = bounceUnitToOwner(state, privateStates, opponentId, target.index, 'phantom-misdirect');
      emit('시선 돌리기', `「${recalled?.name ?? '토큰'}」을(를) 전장에서 되돌렸습니다.`);
      break;
    }
    case 'phantom_applause': {
      if (allies().length < 2 || !hasSetTrap() || !drawCards(state, actorPrivate, actorId, 1)) break;
      emit('관객의 박수', '함정 무대가 완성되어 카드 1장을 뽑았습니다.', 'draw', 1);
      break;
    }

    // ASTRAL ARMADA — formation count, drones, shields and coordinated salvo.
    case 'astral_drone': {
      if (allies().length < 2) break;
      const zone = summonSeriesToken(state, actorId, 1, 2, '성해 드론', 'astral-drone');
      if (zone >= 0) emit('정찰 드론 출격', '1/2 성해 드론 토큰을 소환했습니다.');
      break;
    }
    case 'astral_salvo': {
      if (allies().length < 3) break;
      const dealt = damageCore(state, opponentId, 1);
      if (dealt > 0) { statsFor(state, actorId).coreDamage += dealt; emit('편대 일제사격', `상대 코어에 ${dealt} 피해.`, 'core', dealt); }
      break;
    }
    case 'astral_recharge': {
      const shield = allies().reduce((sum, entry) => sum + entry.unit.shield, 0);
      if (shield < 3) break;
      const gained = gainSignatureEnergy(state, actorId, 1);
      if (gained > 0) emit('함대 재충전', `에너지 ${gained} 회복.`, 'energy', gained);
      break;
    }
    case 'astral_formation': {
      const formation = allies();
      if (formation.length < 3) break;
      for (const entry of formation) grantUnitShield(entry.unit, 1);
      emit('성해 진형', `아스트라 ${formation.length}장에 보호막 1.`, 'buff', 1);
      break;
    }
  }
}

function applySeriesAbility(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  actorId: string,
  sourceCard: CardDefinition,
  sourceZone?: number,
): void {
  const ability = sourceCard.seriesAbility;
  const seriesId = sourceCard.seriesId;
  if (!ability || !seriesId) return;

  const actorPrivate = privateStates[actorId];
  const opponentId = otherPlayer(state, actorId);
  const seriesName = sourceCard.series ?? seriesId;
  const vfx = `series-link-${seriesId}`;
  let result = 0;

  switch (ability.kind) {
    case 'search_series': {
      result = searchSeriesCards(state, actorPrivate, actorId, seriesId, ability.amount);
      if (result > 0) {
        appendLog(state, `SERIES LINK — 「${seriesName}」 카드 ${result}장을 서치했습니다.`, 'special');
        appendVisual(state, { kind: 'draw', vfx, cardId: sourceCard.id, ownerId: actorId, targetOwnerId: actorId, amount: result, label: 'SERIES SEARCH' });
      }
      break;
    }
    case 'recover_series': {
      result = recoverSeriesCards(state, actorPrivate, actorId, seriesId, ability.amount, sourceCard.id);
      if (result > 0) {
        appendLog(state, `SERIES LINK — 묘지의 「${seriesName}」 카드 ${result}장을 회수했습니다.`, 'special');
        appendVisual(state, { kind: 'draw', vfx, cardId: sourceCard.id, ownerId: actorId, targetOwnerId: actorId, amount: result, label: 'SERIES RECOVER' });
      }
      break;
    }
    case 'buff_series': {
      for (let unitIndex = 0; unitIndex < state.boards[actorId].units.length; unitIndex += 1) {
        const unit = state.boards[actorId].units[unitIndex];
        if (!unit || CARD_BY_ID[unit.cardId]?.seriesId !== seriesId) continue;
        // A unit whose SERIES LINK grants a field-wide stat boost should support
        // its formation, not silently buff itself on the same summon. The old
        // behavior made a 1 ATK unit become 2 ATK first, so a TIME -1 penalty
        // still left 1 damage even though the battlefield looked like 1 - 1.
        // Spells/traps have no sourceZone and still buff every matching unit.
        if (sourceZone !== undefined && unitIndex === sourceZone) continue;
        unit.attack += ability.attack;
        unit.health += ability.health;
        unit.maxHealth += ability.health;
        result += 1;
      }
      if (result > 0) {
        appendLog(state, `SERIES LINK — 「${seriesName}」 유닛 ${result}장이 강화되었습니다.`, 'special');
        appendVisual(state, { kind: 'buff', vfx, cardId: sourceCard.id, ownerId: actorId, targetOwnerId: actorId, amount: Math.max(ability.attack, ability.health), label: 'SERIES BOOST' });
      }
      break;
    }
    case 'shield_series': {
      for (const unit of state.boards[actorId].units) {
        if (!unit || CARD_BY_ID[unit.cardId]?.seriesId !== seriesId) continue;
        grantUnitShield(unit, ability.amount);
        result += 1;
      }
      if (result > 0) {
        appendLog(state, `SERIES LINK — 「${seriesName}」 유닛 ${result}장에 보호막 ${ability.amount}.`, 'special');
        appendVisual(state, { kind: 'buff', vfx, cardId: sourceCard.id, ownerId: actorId, targetOwnerId: actorId, amount: ability.amount, label: 'SERIES SHIELD' });
      }
      break;
    }
    case 'heal_per_series': {
      const units = seriesUnitCount(state, actorId, seriesId);
      const requested = Math.min(ability.cap, units * ability.amount);
      result = healCore(state, actorId, requested);
      if (result > 0) {
        statsFor(state, actorId).healing += result;
        appendLog(state, `SERIES LINK — 「${seriesName}」 공명으로 코어 ${result} 회복.`, 'special');
        appendVisual(state, { kind: 'heal', vfx, cardId: sourceCard.id, ownerId: actorId, targetOwnerId: actorId, amount: result, label: 'SERIES HEAL' });
      }
      break;
    }
    case 'damage_core_per_series': {
      const units = seriesUnitCount(state, actorId, seriesId);
      const requested = Math.min(ability.cap, units * ability.amount);
      result = damageCore(state, opponentId, requested);
      if (result > 0) {
        statsFor(state, actorId).coreDamage += result;
        appendLog(state, `SERIES LINK — 「${seriesName}」 연계로 상대 코어에 ${result} 피해.`, 'special');
        appendVisual(state, { kind: 'core', vfx, cardId: sourceCard.id, ownerId: actorId, targetOwnerId: opponentId, amount: result, label: 'SERIES IMPACT' });
      }
      break;
    }
    case 'gain_energy_if_series': {
      const units = seriesUnitCount(state, actorId, seriesId);
      if (units < (ability.minimumAllies ?? 2)) break;
      const energy = state.energy[actorId];
      const before = energy.current;
      energy.current = Math.min(energy.max, energy.current + ability.amount);
      result = energy.current - before;
      if (result > 0) {
        appendLog(state, `SERIES LINK — 「${seriesName}」 연계로 에너지 ${result} 회복.`, 'special');
        appendVisual(state, { kind: 'energy', vfx, cardId: sourceCard.id, ownerId: actorId, targetOwnerId: actorId, amount: result, label: 'SERIES ENERGY' });
      }
      break;
    }
  }
}

type TrapResolution = { negated: boolean; retaliation: number };

function tacticalFormation(state: MatchState, playerId: string, seriesId: SeriesId) {
  return state.boards[playerId].units
    .map((unit, index) => ({ unit, index, card: unit ? CARD_BY_ID[unit.cardId] : undefined }))
    .filter((entry): entry is { unit: UnitState; index: number; card: CardDefinition } => Boolean(entry.unit && entry.unit.ownerId === playerId && entry.card?.seriesId === seriesId));
}

function tacticalEnemyFormation(state: MatchState, playerId: string) {
  const opponentId = otherPlayer(state, playerId);
  return state.boards[opponentId].units
    .map((unit, index) => ({ unit, index, card: unit ? CARD_BY_ID[unit.cardId] : undefined }))
    .filter((entry): entry is { unit: UnitState; index: number; card: CardDefinition | undefined } => Boolean(entry.unit));
}

function weakenStrongestEnemy(state: MatchState, ownerId: string, amount: number, label: string, sourceCard?: CardDefinition): void {
  const opponentId = otherPlayer(state, ownerId);
  const target = tacticalEnemyFormation(state, ownerId).sort((a, b) => b.unit.attack - a.unit.attack || a.unit.health - b.unit.health)[0];
  if (!target || target.unit.attack <= 0) return;
  const reduced = Math.min(amount, target.unit.attack);
  target.unit.attack -= reduced;
  appendLog(state, `전술 · ${label} — 「${target.card?.name ?? '적 유닛'}」 공격력 -${reduced}.`, 'special');
  appendVisual(state, { kind: 'buff', vfx: 'tactical-weaken', cardId: sourceCard?.id, ownerId, targetOwnerId: opponentId, targetZone: target.index, amount: reduced, label });
}

function buffSurvivingSeriesUnit(
  state: MatchState,
  ownerId: string,
  seriesId: SeriesId,
  sourceCard: CardDefinition,
  mode: 'shield' | 'attack',
  amount: number,
  label: string,
): void {
  const target = tacticalFormation(state, ownerId, seriesId).sort((a, b) => a.unit.health - b.unit.health || a.unit.attack - b.unit.attack)[0];
  if (!target) return;
  if (mode === 'shield') grantUnitShield(target.unit, amount);
  else target.unit.attack += amount;
  appendLog(state, `전술 · ${label} — 「${target.card.name}」 ${mode === 'shield' ? `보호막 +${amount}` : `공격력 +${amount}`}.`, 'special');
  appendVisual(state, { kind: 'buff', vfx: 'tactical-inherit', cardId: sourceCard.id, ownerId, targetZone: target.index, amount, label });
}

function applyTacticalOnSummon(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  playerId: string,
  zone: number,
  card: CardDefinition,
): void {
  if (!card.seriesId || !card.seriesTacticalPassive) return;
  const unit = state.boards[playerId].units[zone];
  if (!unit) return;
  const passive = card.seriesTacticalPassive;
  const formation = tacticalFormation(state, playerId, card.seriesId);
  const allies = formation.filter((entry) => entry.index !== zone);
  const opponentId = otherPlayer(state, playerId);

  switch (passive) {
    case 'lumina_rally':
      if (allies.length > 0) {
        unit.attack += 1; unit.health += 1; unit.maxHealth += 1;
        appendLog(state, `전술 · 집결 출격 — 「${card.name}」 +1/+1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-rally', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '집결 출격' });
      }
      break;
    case 'lumina_cover': {
      if (allies.length < 2) break;
      const target = [...allies].sort((a, b) => a.unit.health - b.unit.health)[0];
      grantUnitShield(target.unit, 1);
      appendLog(state, `전술 · 동료 엄호 — 「${target.card.name}」 보호막 +1.`, 'special');
      appendVisual(state, { kind: 'buff', vfx: 'tactical-cover', cardId: card.id, ownerId: playerId, targetZone: target.index, amount: 1, label: '동료 엄호' });
      break;
    }
    case 'kaiser_armor':
      if (allies.length > 0) {
        grantUnitShield(unit, 1);
        appendLog(state, `전술 · 중장 장갑 — 「${card.name}」 보호막 +1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-armor', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '중장 장갑' });
      }
      break;
    case 'eclipse_gloom':
      if ((state.graveyards[playerId]?.length ?? 0) >= 3) {
        grantUnitShield(unit, 1);
        appendLog(state, `전술 · 일식 장막 — 「${card.name}」 보호막 +1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-eclipse-veil', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '일식 장막' });
      }
      break;
    case 'nocturne_veil':
      if ((state.core[playerId] ?? 0) < (state.core[opponentId] ?? 0)) {
        grantUnitShield(unit, 1);
        appendLog(state, `전술 · 월영 장막 — 「${card.name}」 보호막 +1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-moon-veil', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '월영 장막' });
      }
      break;
    case 'arborian_pulse': {
      if (!allies.length) break;
      const target = [...allies].sort((a, b) => a.unit.health - b.unit.health)[0];
      target.unit.health += 1; target.unit.maxHealth += 1;
      appendLog(state, `전술 · 생장 맥동 — 「${target.card.name}」 최대 체력/체력 +1.`, 'special');
      appendVisual(state, { kind: 'buff', vfx: 'tactical-growth', cardId: card.id, ownerId: playerId, targetZone: target.index, amount: 1, label: '생장 맥동' });
      break;
    }
    case 'arborian_root':
      if (allies.length >= 2) {
        unit.health += 2; unit.maxHealth += 2;
        appendLog(state, `전술 · 깊은 뿌리 — 「${card.name}」 최대 체력/체력 +2.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-root', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 2, label: '깊은 뿌리' });
      }
      break;
    case 'tempest_afterburner':
      if (allies.length > 0 && !unit.canAttack) {
        unit.canAttack = true;
        appendLog(state, `전술 · 애프터버너 — 「${card.name}」이(가) 즉시 공격 가능.`, 'special');
        appendVisual(state, { kind: 'energy', vfx: 'tactical-afterburner', cardId: card.id, ownerId: playerId, targetZone: zone, label: '애프터버너' });
      }
      break;
    case 'abyss_grave_armor':
      if ((state.graveyards[opponentId]?.length ?? 0) >= 2) {
        grantUnitShield(unit, 1);
        appendLog(state, `전술 · 묘향 갑주 — 「${card.name}」 보호막 +1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-grave-armor', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '묘향 갑주' });
      }
      break;
    case 'primal_packguard':
      if (allies.length > 0) {
        grantUnitShield(unit, 1); unit.health += 1; unit.maxHealth += 1;
        appendLog(state, `전술 · 군집 수호 — 「${card.name}」 보호막 +1 · 체력 +1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-packguard', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '군집 수호' });
      }
      break;
    case 'chrono_priority':
      if ((state.energy[playerId]?.current ?? 0) >= 2) {
        unit.attack += 1; grantUnitShield(unit, 1);
        appendLog(state, `전술 · 시간 선점 — 「${card.name}」 공격력 +1 · 보호막 +1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-chrono', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '시간 선점' });
      }
      break;
    case 'arcana_rewrite': {
      const spellCount = (state.graveyards[playerId] ?? []).filter((id) => CARD_BY_ID[id]?.kind === 'spell').length;
      if (spellCount >= 2 && drawCards(state, privateStates[playerId], playerId, 1)) {
        appendLog(state, `전술 · 규약 재기록 — 「${card.name}」 효과로 카드 1장 드로우.`, 'special');
        appendVisual(state, { kind: 'draw', vfx: 'tactical-protocol', cardId: card.id, ownerId: playerId, amount: 1, label: '규약 재기록' });
      }
      break;
    }
    case 'beast_plating_passive':
      if (allies.length > 0) {
        grantUnitShield(unit, 1);
        appendLog(state, `전술 · 야수 장갑 — 「${card.name}」 보호막 +1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-beast-plating', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '야수 장갑' });
      }
      break;
    case 'phantom_backstage': {
      const setCount = state.boards[playerId].secrets.filter(Boolean).length;
      if (setCount > 0) {
        grantUnitShield(unit, 1);
        appendLog(state, `전술 · 비밀 무대 — 「${card.name}」 보호막 +1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-backstage', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '비밀 무대' });
      }
      break;
    }
    case 'astral_formation_wall':
      if (formation.length >= 2) {
        for (const ally of formation) grantUnitShield(ally.unit, 1);
        appendLog(state, `전술 · 편대 방벽 — 아스트라 ${formation.length}체 보호막 +1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-formation', cardId: card.id, ownerId: playerId, amount: 1, label: '편대 방벽' });
      }
      break;
    default:
      break;
  }
}

function applyTacticalOnAttackStart(state: MatchState, playerId: string, attackerIndex: number): number {
  const attacker = state.boards[playerId].units[attackerIndex];
  if (!attacker) return 0;
  const card = CARD_BY_ID[attacker.cardId];
  if (!card?.seriesId || !card.seriesTacticalPassive) return 0;
  const passive = card.seriesTacticalPassive;
  const opponentId = otherPlayer(state, playerId);
  const formation = tacticalFormation(state, playerId, card.seriesId);
  const otherAllies = formation.filter((entry) => entry.index !== attackerIndex);
  let bonus = 0;

  const addBonus = (amount: number, label: string, vfx: string) => {
    bonus += amount;
    appendLog(state, `전술 · ${label} — 「${card.name}」의 이번 공격 피해 +${amount}.`, 'special');
    appendVisual(state, { kind: 'buff', vfx, cardId: card.id, ownerId: playerId, sourceZone: attackerIndex, amount, label });
  };

  switch (passive) {
    case 'lumina_combo':
      if (otherAllies.length > 0) addBonus(1, '연계 돌격', 'tactical-combo');
      break;
    case 'kaiser_thruster':
      if (attacker.shield > 0) {
        attacker.shield -= 1;
        addBonus(2, '장갑 추진', 'tactical-thruster');
      }
      break;
    case 'eclipse_graveblade':
      if ((state.graveyards[playerId]?.length ?? 0) >= 4) addBonus(1, '묘지 공명검', 'tactical-graveblade');
      break;
    case 'nocturne_moonreturn': {
      if ((state.core[playerId] ?? 0) < (state.core[opponentId] ?? 0)) {
        const healed = healCore(state, playerId, 1);
        if (healed > 0) {
          statsFor(state, playerId).healing += healed;
          appendLog(state, `전술 · 월영 회귀 — 「${card.name}」 공격 선언으로 코어 ${healed} 회복.`, 'special');
          appendVisual(state, { kind: 'heal', vfx: 'tactical-moon-return', cardId: card.id, ownerId: playerId, targetOwnerId: playerId, sourceZone: attackerIndex, amount: healed, label: '월영 회귀' });
        }
      }
      break;
    }
    case 'arborian_sap':
      if (otherAllies.length > 0 && attacker.health >= attacker.maxHealth) addBonus(1, '수액 돌진', 'tactical-sap');
      break;
    case 'tempest_overcurrent':
      if ((state.energy[playerId]?.current ?? 0) <= 2) addBonus(1, '과전류 돌입', 'tactical-overcurrent');
      break;
    case 'abyss_void_edge':
      if ((state.graveyards[opponentId]?.length ?? 0) >= 4) addBonus(1, '공허 칼날', 'tactical-void-edge');
      break;
    case 'primal_alpha':
      if (otherAllies.length >= 2) addBonus(1, '알파의 포효', 'tactical-alpha');
      break;
    case 'chrono_accel_strike':
      if ((state.energy[playerId]?.current ?? 0) >= 1) addBonus(1, '가속 타격', 'tactical-chrono-strike');
      break;
    case 'arcana_runeblade': {
      const spells = (state.graveyards[playerId] ?? []).filter((id) => CARD_BY_ID[id]?.kind === 'spell').length;
      if (spells >= 3) addBonus(1, '룬 블레이드', 'tactical-runeblade');
      break;
    }
    case 'beast_alloy_strike':
      if (attacker.shield > 0) addBonus(1, '합금 충격', 'tactical-alloy');
      break;
    case 'phantom_ambush':
      if (state.boards[playerId].secrets.some(Boolean)) addBonus(1, '기습 배우', 'tactical-ambush');
      break;
    case 'astral_photon_thrust':
      if (otherAllies.length > 0) addBonus(1, '광자 추진', 'tactical-photon');
      break;
    default:
      break;
  }
  return bonus;
}

function applyTacticalOnKill(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  playerId: string,
  attackerIndex: number,
): void {
  const attacker = state.boards[playerId].units[attackerIndex];
  const card = attacker ? CARD_BY_ID[attacker.cardId] : undefined;
  if (!attacker || !card?.seriesId || !card.seriesTacticalPassive) return;
  const passive = card.seriesTacticalPassive;
  const opponentId = otherPlayer(state, playerId);
  const formation = tacticalFormation(state, playerId, card.seriesId);

  switch (passive) {
    case 'lumina_victory':
      if (formation.length >= 2 && drawCards(state, privateStates[playerId], playerId, 1)) {
        appendLog(state, `전술 · 승전 신호 — 「${card.name}」의 승리로 카드 1장 드로우.`, 'special');
        appendVisual(state, { kind: 'draw', vfx: 'tactical-victory', cardId: card.id, ownerId: playerId, sourceZone: attackerIndex, amount: 1, label: '승전 신호' });
      }
      break;
    case 'kaiser_salvage':
      grantUnitShield(attacker, 1);
      appendLog(state, `전술 · 전투 수복 — 「${card.name}」 보호막 +1.`, 'special');
      appendVisual(state, { kind: 'buff', vfx: 'tactical-salvage', cardId: card.id, ownerId: playerId, sourceZone: attackerIndex, amount: 1, label: '전투 수복' });
      break;
    case 'eclipse_feast':
      if ((state.graveyards[playerId]?.length ?? 0) >= 5) {
        const healed = healCore(state, playerId, 1);
        if (healed > 0) {
          statsFor(state, playerId).healing += healed;
          appendLog(state, `전술 · 잔향 섭식 — 코어 ${healed} 회복.`, 'special');
          appendVisual(state, { kind: 'heal', vfx: 'tactical-eclipse-feast', cardId: card.id, ownerId: playerId, targetOwnerId: playerId, sourceZone: attackerIndex, amount: healed, label: '잔향 섭식' });
        }
      }
      break;
    case 'nocturne_dreamdraw':
      if ((state.core[playerId] ?? 0) < (state.core[opponentId] ?? 0) && drawCards(state, privateStates[playerId], playerId, 1)) {
        appendLog(state, `전술 · 몽중 전리품 — 카드 1장 드로우.`, 'special');
        appendVisual(state, { kind: 'draw', vfx: 'tactical-dreamdraw', cardId: card.id, ownerId: playerId, sourceZone: attackerIndex, amount: 1, label: '몽중 전리품' });
      }
      break;
    case 'tempest_recharge':
      attacker.attack += 1;
      appendLog(state, `전술 · 전격 재충전 — 「${card.name}」 공격력 +1.`, 'special');
      appendVisual(state, { kind: 'buff', vfx: 'tactical-recharge', cardId: card.id, ownerId: playerId, sourceZone: attackerIndex, amount: 1, label: '전격 재충전' });
      break;
    case 'abyss_devour_echo': {
      const healed = healCore(state, playerId, 1);
      if (healed > 0) {
        statsFor(state, playerId).healing += healed;
        appendLog(state, `전술 · 포식 반향 — 「${card.name}」이(가) 적을 파괴해 코어 1 회복.`, 'special');
        appendVisual(state, { kind: 'heal', vfx: 'tactical-devour', cardId: card.id, ownerId: playerId, targetOwnerId: playerId, sourceZone: attackerIndex, amount: healed, label: '포식 반향' });
      }
      break;
    }
    case 'primal_hunt':
      attacker.health += 1; attacker.maxHealth += 1;
      appendLog(state, `전술 · 야생 사냥 — 「${card.name}」 최대 체력/체력 +1.`, 'special');
      appendVisual(state, { kind: 'buff', vfx: 'tactical-hunt', cardId: card.id, ownerId: playerId, sourceZone: attackerIndex, amount: 1, label: '야생 사냥' });
      break;
    case 'chrono_forecast':
      if ((state.energy[playerId]?.current ?? 0) >= 1 && drawCards(state, privateStates[playerId], playerId, 1)) {
        appendLog(state, `전술 · 미래 확보 — 카드 1장 드로우.`, 'special');
        appendVisual(state, { kind: 'draw', vfx: 'tactical-forecast', cardId: card.id, ownerId: playerId, sourceZone: attackerIndex, amount: 1, label: '미래 확보' });
      }
      break;
    case 'beast_predatory_repair': {
      const before = attacker.health;
      attacker.health = Math.min(attacker.maxHealth, attacker.health + 2);
      const healed = attacker.health - before;
      if (healed > 0) {
        appendLog(state, `전술 · 포식 수복 — 「${card.name}」 체력 ${healed} 회복.`, 'special');
        appendVisual(state, { kind: 'heal', vfx: 'tactical-beast-repair', cardId: card.id, ownerId: playerId, targetOwnerId: playerId, sourceZone: attackerIndex, targetZone: attackerIndex, amount: healed, label: '포식 수복' });
      }
      break;
    }
    case 'astral_supply':
      grantUnitShield(attacker, 1);
      appendLog(state, `전술 · 함대 보급 — 「${card.name}」 보호막 +1.`, 'special');
      appendVisual(state, { kind: 'buff', vfx: 'tactical-supply', cardId: card.id, ownerId: playerId, sourceZone: attackerIndex, amount: 1, label: '함대 보급' });
      break;
    default:
      break;
  }
}

function applyTacticalOnDestroyed(state: MatchState, ownerId: string, card: CardDefinition | undefined): void {
  if (!card?.seriesId || !card.seriesTacticalPassive) return;
  const passive = card.seriesTacticalPassive;
  const opponentId = otherPlayer(state, ownerId);

  switch (passive) {
    case 'kaiser_emergency':
      buffSurvivingSeriesUnit(state, ownerId, 'kaisergear', card, 'shield', 1, '잔해 회수');
      break;
    case 'eclipse_afterimage':
      if ((state.graveyards[ownerId]?.length ?? 0) >= 4) {
        const actual = damageCore(state, opponentId, 1);
        if (actual > 0) {
          statsFor(state, ownerId).coreDamage += actual;
          appendLog(state, `전술 · 잔향 포식 — 「${card.name}」의 잔향이 상대 코어에 ${actual} 피해.`, 'special');
          appendVisual(state, { kind: 'core', vfx: 'tactical-echo', cardId: card.id, ownerId, targetOwnerId: opponentId, amount: actual, label: '잔향 포식' });
        }
      }
      break;
    case 'nocturne_fade':
      if ((state.core[ownerId] ?? 0) < (state.core[opponentId] ?? 0)) weakenStrongestEnemy(state, ownerId, 1, '환영 소실', card);
      break;
    case 'arborian_seedfall': {
      const zone = summonSeriesToken(state, ownerId, 1, 1, '아르보리아 새싹', 'tactical-seedfall');
      if (zone >= 0) appendLog(state, `전술 · 낙엽 발아 — 1/1 새싹 토큰을 소환했습니다.`, 'special');
      break;
    }
    case 'tempest_residual':
      if (tacticalFormation(state, ownerId, 'tempest_drive').length > 0) {
        const actual = damageCore(state, opponentId, 1);
        if (actual > 0) {
          statsFor(state, ownerId).coreDamage += actual;
          appendLog(state, `전술 · 잔류 낙뢰 — 상대 코어 ${actual} 피해.`, 'special');
          appendVisual(state, { kind: 'core', vfx: 'tactical-residual', cardId: card.id, ownerId, targetOwnerId: opponentId, amount: actual, label: '잔류 낙뢰' });
        }
      }
      break;
    case 'abyss_last_curse':
      if ((state.graveyards[opponentId]?.length ?? 0) >= 3) {
        const actual = damageCore(state, opponentId, 1);
        if (actual > 0) {
          statsFor(state, ownerId).coreDamage += actual;
          appendLog(state, `전술 · 최후의 저주 — 「${card.name}」이(가) 파괴되며 상대 코어에 ${actual} 피해.`, 'special');
          appendVisual(state, { kind: 'core', vfx: 'tactical-last-curse', cardId: card.id, ownerId, targetOwnerId: opponentId, amount: actual, label: '최후의 저주' });
        }
      }
      break;
    case 'primal_spirit_guard':
      buffSurvivingSeriesUnit(state, ownerId, 'primal_guardian', card, 'shield', 1, '수호령 계승');
      break;
    case 'chrono_restore': {
      const target = tacticalFormation(state, ownerId, 'chronorium').sort((a, b) => a.unit.health - b.unit.health)[0];
      if (!target) break;
      const before = target.unit.health;
      target.unit.health = Math.min(target.unit.maxHealth, target.unit.health + 2);
      const healed = target.unit.health - before;
      if (healed > 0) {
        appendLog(state, `전술 · 시간 복원 — 「${target.card.name}」 체력 ${healed} 회복.`, 'special');
        appendVisual(state, { kind: 'heal', vfx: 'tactical-restore', cardId: card.id, ownerId, targetZone: target.index, amount: healed, label: '시간 복원' });
      }
      break;
    }
    case 'arcana_sealburst': {
      const spells = (state.graveyards[ownerId] ?? []).filter((id) => CARD_BY_ID[id]?.kind === 'spell').length;
      if (spells >= 4) weakenStrongestEnemy(state, ownerId, 1, '봉인 잔광', card);
      break;
    }
    case 'beast_legacy':
      buffSurvivingSeriesUnit(state, ownerId, 'beastforge', card, 'attack', 1, '강철 유산');
      break;
    case 'phantom_smoke':
      weakenStrongestEnemy(state, ownerId, 1, '퇴장 연막', card);
      break;
    case 'astral_lastship':
      buffSurvivingSeriesUnit(state, ownerId, 'astral_armada', card, 'shield', 1, '잔존 편대');
      break;
    default:
      break;
  }
}

function applyTacticalOnSpellResolved(
  state: MatchState,
  playerId: string,
  spellCard: CardDefinition,
): void {
  if (spellCard.kind !== 'spell' || spellCard.seriesId !== 'arcana_protocol') return;
  const candidates = tacticalFormation(state, playerId, 'arcana_protocol')
    .filter((entry) => entry.card.seriesTacticalPassive === 'arcana_conduit')
    .sort((a, b) => a.unit.shield - b.unit.shield || a.unit.health - b.unit.health);
  const target = candidates[0];
  if (!target) return;
  grantUnitShield(target.unit, 1);
  appendLog(state, `전술 · 마력 도관 — 「${target.card.name}」 보호막 +1.`, 'special');
  appendVisual(state, { kind: 'buff', vfx: 'tactical-conduit', cardId: target.card.id, ownerId: playerId, targetZone: target.index, amount: 1, label: '마력 도관' });
}

function applyTacticalOnTrap(state: MatchState, trapOwnerId: string, trapCard: CardDefinition): void {
  if (trapCard.seriesId !== 'phantom_carnival') return;
  const candidates = tacticalFormation(state, trapOwnerId, 'phantom_carnival')
    .filter((entry) => entry.card.seriesTacticalPassive === 'phantom_encore_passive')
    .sort((a, b) => a.unit.attack + a.unit.health - (b.unit.attack + b.unit.health));
  const target = candidates[0];
  if (!target) return;
  target.unit.attack += 1; target.unit.health += 1; target.unit.maxHealth += 1;
  appendLog(state, `전술 · 앙코르 트릭 — 「${target.card.name}」 +1/+1.`, 'special');
  appendVisual(state, { kind: 'buff', vfx: 'tactical-encore', cardId: target.card.id, ownerId: trapOwnerId, targetZone: target.index, amount: 1, label: '앙코르 트릭' });
}

function activateTrapAt(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  trapOwnerId: string,
  trigger: TrapTrigger,
  trapIndex: number,
  target?: UnitBoardTarget,
): TrapResolution {
  const instance = privateStates[trapOwnerId]?.secrets[trapIndex];
  const card = instance ? CARD_BY_ID[instance.cardId] : undefined;
  if (!instance || !card || card.kind !== 'trap' || card.trapTrigger !== trigger || !card.trapEffect) {
    throw new Error('발동할 수 있는 함정 카드를 찾을 수 없습니다.');
  }
  if (card.eclipseTriggerPhases?.length && !card.eclipseTriggerPhases.includes(currentEclipsePhase(state))) {
    throw new Error(`이 함정은 ${card.eclipseTriggerPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' · ')}에서만 발동할 수 있습니다.`);
  }
  consumeTrap(state, privateStates[trapOwnerId], trapOwnerId, trapIndex, card);
  applyTacticalOnTrap(state, trapOwnerId, card);
  if (card.trapEffect.kind === 'negate') {
    applySeriesAbility(state, privateStates, trapOwnerId, card);
    applySeriesSignature(state, privateStates, trapOwnerId, card);
    return { negated: true, retaliation: 0 };
  }
  if (card.trapEffect.kind === 'negate_and_damage') {
    applySeriesAbility(state, privateStates, trapOwnerId, card);
    applySeriesSignature(state, privateStates, trapOwnerId, card);
    return { negated: true, retaliation: card.trapEffect.amount };
  }
  applyEffect(state, privateStates, trapOwnerId, card.trapEffect, target, card);
  applySeriesAbility(state, privateStates, trapOwnerId, card);
  applySeriesSignature(state, privateStates, trapOwnerId, card);
  return { negated: false, retaliation: 0 };
}

function openTrapWindow(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  trapOwnerId: string,
  trigger: TrapTrigger,
  continuation: PendingTrapContinuation,
  target?: UnitBoardTarget,
): boolean {
  if (state.pendingTrap) return true;
  const trap = findTrap(privateStates[trapOwnerId], trigger, (card) => {
    if (card.eclipseTriggerPhases?.length && !card.eclipseTriggerPhases.includes(currentEclipsePhase(state))) return false;
    if (!target || !card.trapEffect || (card.trapEffect.kind !== 'buff_unit' && card.trapEffect.kind !== 'shield_unit')) return true;
    return !state.boards[target.ownerId]?.units[target.unitIndex]?.buffCardApplied;
  });
  if (!trap || !trap.card.trapEffect) return false;
  const now = Date.now();
  state.pendingTrap = {
    id: randomId('trap-window'),
    ownerId: trapOwnerId,
    trigger,
    trapZone: trap.index,
    targetOwnerId: target?.ownerId,
    targetUnitIndex: target?.unitIndex,
    openedAt: now,
    endsAt: now + TRAP_RESPONSE_MS,
    continuation,
  };
  if (state.turnEndsAt) state.turnEndsAt += TRAP_RESPONSE_MS;
  appendLog(state, `함정 대응 가능 — ${trapOwnerId.slice(0, 6)}의 선택을 기다립니다.`, 'trap');
  return true;
}

function destroyDefeatedUnits(state: MatchState, privateStates: Record<string, PrivateState>): boolean {
  const possibleTrapOwners: string[] = [];
  for (const playerId of state.playerOrder) {
    if (!playerId) continue;
    let destroyedAny = false;
    for (let index = 0; index < state.boards[playerId].units.length; index += 1) {
      const unit = state.boards[playerId].units[index];
      if (!unit || unit.health > 0) continue;
      const card = CARD_BY_ID[unit.cardId];
      state.graveyards[playerId].push(unit.cardId);
      state.boards[playerId].units[index] = null;
      destroyedAny = true;
      appendLog(state, `${card?.name ?? unit.cardId.replace('token:', '')}이(가) 파괴되었습니다.`, 'attack');
      appendVisual(state, {
        kind: 'destroy',
        vfx: resolveCardVfx(card, 'destroy'),
        cardId: card?.id,
        ownerId: playerId,
        targetZone: index,
        label: card?.name ?? '토큰',
      });
      applyTacticalOnDestroyed(state, playerId, card);
    }
    if (destroyedAny && findTrap(privateStates[playerId], 'friendly_destroyed')) possibleTrapOwners.push(playerId);
  }

  if (!state.pendingTrap) {
    const ownerId = possibleTrapOwners[0];
    if (ownerId && openTrapWindow(state, privateStates, ownerId, 'friendly_destroyed', { kind: 'post_action' })) return true;
  }
  return Boolean(state.pendingTrap);
}

function checkWinner(state: MatchState): void {
  if (state.status === 'finished') return;
  const [a, b] = state.playerOrder;
  if (!a || !b) return;
  if (state.core[a] <= 0 && state.core[b] <= 0) {
    state.status = 'finished';
    state.winnerId = state.currentPlayerId;
    state.winReason = '동시 파괴 판정';
  } else if (state.core[a] <= 0) {
    state.status = 'finished';
    state.winnerId = b;
    state.winReason = '코어 파괴';
  } else if (state.core[b] <= 0) {
    state.status = 'finished';
    state.winnerId = a;
    state.winReason = '코어 파괴';
  }
  if (state.status === 'finished' && state.winnerId) appendLog(state, '결투가 종료되었습니다.', 'victory');
}

function validateTarget(state: MatchState, actorId: string, card: CardDefinition, target?: CardActionTarget): void {
  const opponentId = otherPlayer(state, actorId);
  if (card.target === 'none' || card.target === 'enemy_core') return;

  if (card.target === 'own_deck_card') {
    if (!target?.deckCardId) throw new Error('내 덱에서 가져올 카드를 선택하세요.');
    return;
  }

  if (card.target === 'friendly_graveyard_card') {
    if (!target || target.ownerId !== actorId || !Number.isInteger(target.graveyardIndex)) throw new Error('내 묘지에서 회수할 카드를 선택하세요.');
    const graveyardIndex = Number(target.graveyardIndex);
    const cardId = state.graveyards[actorId]?.[graveyardIndex];
    const graveCard = cardId ? CARD_BY_ID[cardId] : undefined;
    if (!graveCard || !['unit','spell','trap'].includes(graveCard.kind)) throw new Error('메인 덱 카드만 회수할 수 있습니다.');
    return;
  }

  if (card.target === 'friendly_graveyard_unit') {
    if (!target || target.ownerId !== actorId || !Number.isInteger(target.graveyardIndex)) throw new Error('내 묘지에서 부활할 유닛을 선택하세요.');
    const graveyardIndex = Number(target.graveyardIndex);
    const cardId = state.graveyards[actorId]?.[graveyardIndex];
    const graveCard = cardId ? CARD_BY_ID[cardId] : undefined;
    if (!graveCard || graveCard.kind !== 'unit') throw new Error('부활할 수 있는 메인 덱 유닛을 선택하세요.');
    if (firstOpenUnit(state.boards[actorId]) < 0) throw new Error('부활시킬 빈 유닛 칸이 없습니다.');
    return;
  }

  if (!target || !Number.isInteger(target.unitIndex)) throw new Error('올바른 대상 유닛을 선택하세요.');
  const unitIndex = Number(target.unitIndex);
  if (unitIndex < 0 || unitIndex > 4) throw new Error('올바른 대상 유닛을 선택하세요.');
  const unit = state.boards[target.ownerId]?.units[unitIndex];
  if (!unit) throw new Error('선택한 위치에 유닛이 없습니다.');
  if (card.target === 'enemy_unit' && target.ownerId !== opponentId) throw new Error('적 유닛을 선택해야 합니다.');
  if (card.target === 'friendly_unit' && target.ownerId !== actorId) throw new Error('아군 유닛을 선택해야 합니다.');
  if (card.effect?.kind === 'ready_unit' && unit.summonedTurn !== state.turnNumber) throw new Error('이번 턴 소환한 유닛만 즉시 공격 상태로 만들 수 있습니다.');
  if (card.effect?.kind === 'shield_burst' && unit.shield <= 0) throw new Error('보호막이 있는 아군 유닛을 선택하세요.');
  if (card.effect?.kind === 'reset_unit' && !CARD_BY_ID[unit.cardId]) throw new Error('토큰은 원형 복귀의 대상으로 선택할 수 없습니다.');
  if ((card.effect?.kind === 'steal_unit' || card.effect?.kind === 'mirror_unit') && firstOpenUnit(state.boards[actorId]) < 0) {
    throw new Error(card.effect.kind === 'steal_unit' ? '강탈한 유닛을 놓을 빈 유닛 칸이 없습니다.' : '거울 토큰을 소환할 빈 유닛 칸이 없습니다.');
  }
}

function riftConditionMet(state: MatchState, playerId: string, card: CardDefinition): boolean {
  const condition = card.riftCondition;
  if (!condition) return false;
  const opponentId = otherPlayer(state, playerId);
  const myUnits = state.boards[playerId].units.filter(Boolean);
  const enemyUnits = state.boards[opponentId].units.filter(Boolean);
  switch (condition.kind) {
    case 'empty_board': return myUnits.length === 0;
    case 'empty_board_and_graveyard_min': return myUnits.length === 0 && (state.graveyards[playerId]?.length ?? 0) >= condition.value;
    case 'core_below': return (state.core[playerId] ?? CORE_MAX) <= condition.value;
    case 'opponent_more_units': return enemyUnits.length > myUnits.length;
    case 'graveyard_min': return (state.graveyards[playerId]?.length ?? 0) >= condition.value;
    case 'ally_element': return myUnits.some((unit) => CARD_BY_ID[unit?.cardId ?? '']?.element === condition.element);
  }
}

function sameLegendarySeries(source: CardDefinition | undefined, legendary: CardDefinition): boolean {
  if (!source) return false;
  if (legendary.seriesId) return source.seriesId === legendary.seriesId;
  if (legendary.series) return source.series === legendary.series;
  return false;
}

function legendarySameSeriesEntries(state: MatchState, playerId: string, card: CardDefinition): Array<{ zone: number; unit: UnitState; card: CardDefinition }> {
  return state.boards[playerId].units.flatMap((unit, zone) => {
    if (!unit) return [];
    const source = CARD_BY_ID[unit.cardId];
    return source && sameLegendarySeries(source, card) ? [{ zone, unit, card: source }] : [];
  });
}

function legendarySummonBlockReason(state: MatchState, playerId: string, card: CardDefinition): string | null {
  if (card.summonMode !== 'legendary') return null;
  const rule = card.legendarySummonRule;
  if (!rule) return '전설 특수 소환 조건이 설정되지 않았습니다.';
  const opponentId = otherPlayer(state, playerId);
  const myUnits = state.boards[playerId].units.filter((unit): unit is UnitState => Boolean(unit));
  const enemyUnits = state.boards[opponentId].units.filter(Boolean);
  const graveyard = state.graveyards[playerId] ?? [];

  if (rule.requireEmptyField && myUnits.length > 0) return `내 필드가 비어 있어야 합니다. 현재 내 유닛 ${myUnits.length}체.`;
  if (rule.minimumAllies !== undefined && myUnits.length < rule.minimumAllies) return `내 필드에 유닛이 ${rule.minimumAllies}체 이상 필요합니다. 현재 ${myUnits.length}체.`;
  if (rule.minimumSameSeries !== undefined) {
    const sameSeries = legendarySameSeriesEntries(state, playerId, card).length;
    if (sameSeries < rule.minimumSameSeries) return `같은 시리즈 유닛이 ${rule.minimumSameSeries}체 필요합니다. 현재 ${sameSeries}체.`;
  }
  if (rule.graveyardMin !== undefined && graveyard.length < rule.graveyardMin) return `내 묘지에 카드가 ${rule.graveyardMin}장 이상 필요합니다. 현재 ${graveyard.length}장.`;
  if (rule.graveyardKind && rule.graveyardKindMin !== undefined) {
    const kindCount = graveyard.filter((cardId) => CARD_BY_ID[cardId]?.kind === rule.graveyardKind).length;
    if (kindCount < rule.graveyardKindMin) {
      const kindLabel = rule.graveyardKind === 'spell' ? '주문' : rule.graveyardKind === 'trap' ? '함정' : '유닛';
      return `내 묘지에 ${kindLabel} 카드가 ${rule.graveyardKindMin}장 이상 필요합니다. 현재 ${kindCount}장.`;
    }
  }
  if (rule.coreAtMost !== undefined && (state.core[playerId] ?? CORE_MAX) > rule.coreAtMost) return `내 코어가 ${rule.coreAtMost} 이하여야 합니다. 현재 ${state.core[playerId] ?? CORE_MAX}.`;
  if (rule.requireOutnumbered && enemyUnits.length <= myUnits.length) return `상대 필드 유닛이 내 필드보다 많아야 합니다. 현재 나 ${myUnits.length} / 상대 ${enemyUnits.length}.`;

  const willRelease = rule.release === 'all' ? myUnits.length > 0 : rule.release === 'same_series' && (rule.minimumSameSeries ?? 0) > 0;
  if (!willRelease && firstOpenUnit(state.boards[playerId]) < 0) return '전설을 놓을 빈 유닛 칸이 없습니다.';
  return null;
}

function legendaryTributeZones(state: MatchState, playerId: string, card: CardDefinition): number[] {
  const rule = card.legendarySummonRule;
  if (!rule || rule.release === 'none') return [];
  if (rule.release === 'all') return state.boards[playerId].units.flatMap((unit, zone) => unit ? [zone] : []);

  const required = rule.minimumSameSeries ?? 0;
  return legendarySameSeriesEntries(state, playerId, card)
    .sort((a, b) => a.card.cost - b.card.cost || a.zone - b.zone)
    .slice(0, required)
    .map((entry) => entry.zone);
}

function performLegendaryTribute(state: MatchState, playerId: string, card: CardDefinition): string[] {
  const tributeZones = legendaryTributeZones(state, playerId, card);
  const releasedNames: string[] = [];
  for (const zone of tributeZones) {
    const unit = state.boards[playerId].units[zone];
    if (!unit) continue;
    const source = CARD_BY_ID[unit.cardId];
    releasedNames.push(source?.name ?? unit.cardId);
    state.graveyards[playerId].push(unit.cardId);
    state.boards[playerId].units[zone] = null;
  }
  if (releasedNames.length > 0) {
    const ritualName = card.legendarySummonRule?.name ?? '전설 의식';
    appendLog(state, `${ritualName} — ${releasedNames.join(', ')} 릴리스.`, 'special');
    appendVisual(state, { kind: 'special', vfx: 'legendary-tribute', cardId: card.id, ownerId: playerId, label: `${ritualName} · 릴리스`, detail: `${releasedNames.length}체` });
  }
  return releasedNames;
}

function makeUnit(
  state: MatchState,
  playerId: string,
  instance: CardInstance,
  card: CardDefinition,
  summonedBy: SummonOrigin,
  originCardIds: string[] = [],
): UnitState {
  if (!isUnitCard(card)) throw new Error('유닛 카드가 아닙니다.');
  const unit: UnitState = {
    instanceId: instance.instanceId,
    cardId: instance.cardId,
    ownerId: playerId,
    attack: card.attack ?? 0,
    health: card.health ?? 1,
    maxHealth: card.health ?? 1,
    shield: 0,
    canAttack: Boolean(card.keywords?.includes('charge')),
    summonedTurn: state.turnNumber,
    summonedBy,
    originCardIds,
    buffCardApplied: false,
  };
  refreshUnitEclipseModifier(state, unit);
  return unit;
}

function summonReactionTriggers(origin: SummonOrigin): TrapTrigger[] {
  const triggers: TrapTrigger[] = ['unit_summoned'];
  if (origin !== 'normal' && origin !== 'token') triggers.push('special_summoned');
  if (origin === 'fusion') triggers.push('fusion_summoned');
  if (origin === 'evolution') triggers.push('evolution_summoned');
  return triggers;
}

function applyExtraChoice(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  actorId: string,
  zone: number,
  card: CardDefinition,
  choiceIndex: number | undefined,
): void {
  if (!card.extraChoices?.length) return;
  if (!Number.isInteger(choiceIndex) || choiceIndex === undefined || !card.extraChoices[choiceIndex]) {
    throw new Error('전설 엑스트라의 선택 효과가 지정되지 않았습니다.');
  }
  const choice = card.extraChoices[choiceIndex];
  for (const effect of choice.effects) {
    const autoTarget = effect.kind === 'buff_unit' || effect.kind === 'shield_unit'
      ? { ownerId: actorId, unitIndex: zone }
      : undefined;
    applyEffect(state, privateStates, actorId, effect, autoTarget, card);
  }
  appendLog(state, `CHOOSE ${choiceIndex + 1} — 「${card.name}」의 ${choice.label} 발동: ${choice.description}`, 'special');
  appendVisual(state, {
    kind: 'special',
    vfx: card.kind === 'fusion' ? 'legendary-fusion-choice' : 'legendary-evolution-choice',
    cardId: card.id,
    ownerId: actorId,
    targetOwnerId: actorId,
    targetZone: zone,
    label: `CHOOSE ${choiceIndex + 1} · ${choice.label}`,
    detail: choice.description,
  });
}

function finalizeSummonPostChoice(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  actorId: string,
  zone: number,
  card: CardDefinition,
): void {
  if (state.boards[actorId].units[zone]) {
    applyPremiumTimeSignature(state, privateStates, actorId, card, zone);
    applySeriesAbility(state, privateStates, actorId, card, zone);
    applySeriesSignature(state, privateStates, actorId, card, zone);
    applyTacticalOnSummon(state, privateStates, actorId, zone, card);
  }
  destroyDefeatedUnits(state, privateStates);
  checkWinner(state);
}

function continueSummonResolution(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  continuation: Extract<PendingTrapContinuation, { kind: 'summon' }>,
  trapResult: TrapResolution = { negated: false, retaliation: 0 },
): void {
  const { actorId, zone, cardId, origin, target } = continuation;
  const opponentId = otherPlayer(state, actorId);
  const card = CARD_BY_ID[cardId];
  const unit = state.boards[actorId].units[zone];

  // A trap may deal lethal damage before the remaining summon reactions resolve.
  // Do not keep offering summon-trigger windows for a unit that has already died.
  if (unit && unit.health <= 0) {
    destroyDefeatedUnits(state, privateStates);
    checkWinner(state);
    return;
  }

  if (trapResult.negated && unit) {
    state.graveyards[actorId].push(unit.cardId);
    state.boards[actorId].units[zone] = null;
    appendLog(state, `「${card?.name ?? '유닛'}」의 소환이 함정으로 무효화되었습니다.`, 'trap');
    appendVisual(state, { kind: 'destroy', vfx: 'summon-negated', cardId: card?.id, ownerId: actorId, targetZone: zone, label: '소환 무효' });
    destroyDefeatedUnits(state, privateStates);
    checkWinner(state);
    return;
  }

  if (!unit || !card) {
    destroyDefeatedUnits(state, privateStates);
    checkWinner(state);
    return;
  }

  const [nextTrigger, ...remaining] = continuation.remainingTriggers;
  if (nextTrigger) {
    const nextContinuation: Extract<PendingTrapContinuation, { kind: 'summon' }> = { ...continuation, remainingTriggers: remaining };
    if (openTrapWindow(state, privateStates, opponentId, nextTrigger, nextContinuation, { ownerId: actorId, unitIndex: zone })) return;
    continueSummonResolution(state, privateStates, nextContinuation);
    return;
  }

  // v43: every successfully resolved real unit arrival advances the global time once.
  // This happens before the unit's own printed time-setting effect, so dedicated time manipulators
  // can still override the natural arrival shift as part of their card text.
  const eclipsePhaseBeforeArrivalShift = currentEclipsePhase(state);
  if (state.boards[actorId].units[zone]) {
    registerRealUnitArrivalTimeShift(state, privateStates, actorId, card.name);
  }
  const arrivalShiftChangedPhase = eclipsePhaseBeforeArrivalShift !== currentEclipsePhase(state);

  if (card.eclipseSetOnSummon && state.boards[actorId].units[zone]) {
    setEclipsePhase(state, privateStates, card.eclipseSetOnSummon, actorId, `「${card.name}」 · 시각 조율`);
  }

  const temporalPhaseBeforeSummonEffects = currentEclipsePhase(state);
  if (card.onSummon && state.boards[actorId].units[zone]) {
    const effectTarget = resolveSummonEffectTarget(state, actorId, zone, card, target);
    applyEffect(state, privateStates, actorId, card.onSummon, effectTarget, card);
  }
  // If the printed summon effect itself changed the clock into this unit's payoff time,
  // the phase-transition resolver already fired the pulse. Otherwise an aligned summon
  // gets exactly one immediate pulse here. This prevents double activation.
  if (
    state.boards[actorId].units[zone]
    && temporalPhaseBeforeSummonEffects === currentEclipsePhase(state)
    && !(card.id === 'v60_premium_time_devourer' && arrivalShiftChangedPhase)
  ) {
    triggerAlignedSummonPulses(state, privateStates, actorId, zone, card);
  }
  if (state.boards[actorId].units[zone] && card.extraChoices?.length) {
    state.pendingExtraChoice = {
      ownerId: actorId,
      zone,
      cardId: card.id,
      openedAt: Date.now(),
    };
    appendLog(state, `「${card.name}」의 선택 효과를 고를 수 있습니다.`, 'special');
    appendVisual(state, {
      kind: 'special',
      vfx: card.kind === 'fusion' ? 'legendary-fusion-choice' : 'legendary-evolution-choice',
      cardId: card.id,
      ownerId: actorId,
      targetOwnerId: actorId,
      targetZone: zone,
      label: '효과 선택',
      detail: '소환 후 발휘할 1개의 효과를 선택하세요.',
    });
    return;
  }
  finalizeSummonPostChoice(state, privateStates, actorId, zone, card);
}

function resolveSpellContinuation(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  continuation: Extract<PendingTrapContinuation, { kind: 'spell' }>,
  trapResult: TrapResolution = { negated: false, retaliation: 0 },
): void {
  const card = CARD_BY_ID[continuation.cardId];
  if (!card) throw new Error('주문 카드 정의를 찾을 수 없습니다.');
  const opponentId = otherPlayer(state, continuation.actorId);

  if (!trapResult.negated) {
    if (card.effect) {
      const effectTarget = card.target === 'enemy_core' ? undefined : continuation.target;
      applyEffect(state, privateStates, continuation.actorId, card.effect, effectTarget, card);
    }
    applyPremiumTimeSignature(state, privateStates, continuation.actorId, card);
    applySeriesAbility(state, privateStates, continuation.actorId, card);
    applySeriesSignature(state, privateStates, continuation.actorId, card);
    applyTacticalOnSpellResolved(state, continuation.actorId, card);
    appendLog(state, `주문 「${card.name}」 효과 처리 완료.`, 'system');
  } else {
    if (trapResult.retaliation > 0) {
      const retaliation = damageCore(state, continuation.actorId, trapResult.retaliation);
      statsFor(state, opponentId).coreDamage += retaliation;
      appendVisual(state, { kind: 'core', vfx: 'trap-retaliation', ownerId: opponentId, targetOwnerId: continuation.actorId, amount: retaliation, label: '함정 반격' });
    }
    appendLog(state, `주문 「${card.name}」이(가) 무효화되었습니다.`, 'trap');
  }
  state.graveyards[continuation.actorId].push(card.id);
  destroyDefeatedUnits(state, privateStates);
  checkWinner(state);

  if (!trapResult.negated && card.effect?.kind === 'end_turn_next_energy' && state.status === 'active' && state.currentPlayerId === continuation.actorId) {
    appendVisual(state, { kind: 'turn', vfx: 'light-seal-end', cardId: card.id, ownerId: continuation.actorId, label: '빛의 봉인 · 턴 종료' });
    advanceTurn(state, privateStates, continuation.actorId, Date.now(), `「${card.name}」으로 턴을 즉시 종료했습니다.`);
  }
}

function freezeAllEnemyUnits(state: MatchState, actorId: string, turns: number, sourceCard: CardDefinition) {
  const opponentId = otherPlayer(state, actorId);
  const until = state.turnNumber + Math.max(1, turns);
  let frozen = 0;
  for (let index = 0; index < state.boards[opponentId].units.length; index += 1) {
    const unit = state.boards[opponentId].units[index];
    if (!unit) continue;
    unit.stunnedUntilTurn = Math.max(unit.stunnedUntilTurn ?? 0, until);
    unit.canAttack = false;
    frozen += 1;
    appendVisual(state, {
      kind: 'buff',
      vfx: 'attack-freeze',
      cardId: sourceCard.id,
      ownerId: actorId,
      targetOwnerId: opponentId,
      targetZone: index,
      label: '심야 동결',
    });
  }
  appendLog(state, frozen > 0 ? `「${sourceCard.name}」이(가) 적 유닛 ${frozen}체의 움직임을 묶었습니다.` : `「${sourceCard.name}」이(가) 심야를 호출했지만 동결할 적이 없었습니다.`, 'special');
}

function discardHighestCostCardsFromOpponent(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  actorId: string,
  amount: number,
  sourceCard: CardDefinition,
) {
  const opponentId = otherPlayer(state, actorId);
  const opponentPrivate = privateStates[opponentId];
  const ranked = opponentPrivate.hand
    .map((instance, index) => ({ instance, index, card: CARD_BY_ID[instance.cardId] }))
    .filter((entry): entry is { instance: CardInstance; index: number; card: CardDefinition } => Boolean(entry.card))
    .sort((a, b) => b.card.cost - a.card.cost || a.index - b.index)
    .slice(0, Math.max(0, amount));
  if (!ranked.length) {
    appendLog(state, `「${sourceCard.name}」이(가) 손패를 잠그려 했지만 상대 손패가 비어 있었습니다.`, 'special');
    return;
  }

  const picked = new Set(ranked.map((entry) => entry.instance.instanceId));
  const discardedNames = ranked.map((entry) => entry.card.name);
  opponentPrivate.hand = opponentPrivate.hand.filter((instance) => {
    if (!picked.has(instance.instanceId)) return true;
    state.graveyards[opponentId].push(instance.cardId);
    return false;
  });
  state.handCounts[opponentId] = opponentPrivate.hand.length;
  appendLog(state, `「${sourceCard.name}」이(가) 상대 손패의 고비용 카드 ${discardedNames.length}장을 침묵 속으로 떨어뜨렸습니다: ${discardedNames.join(', ')}`, 'special');
  appendVisual(state, {
    kind: 'special',
    vfx: 'midnight-silence-rend',
    cardId: sourceCard.id,
    ownerId: actorId,
    targetOwnerId: opponentId,
    amount: discardedNames.length,
    label: '심야 강제 버림',
  });
}

function recallStrongestEnemyUnit(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  actorId: string,
  sourceCard: CardDefinition,
) {
  const opponentId = otherPlayer(state, actorId);
  const candidates = (state.boards[opponentId]?.units ?? [])
    .map((unit, index) => ({ unit, index }))
    .filter((entry): entry is { unit: UnitState; index: number } => Boolean(entry.unit))
    .sort((a, b) => (b.unit.attack + b.unit.health + b.unit.shield) - (a.unit.attack + a.unit.health + a.unit.shield) || b.unit.attack - a.unit.attack || a.index - b.index);
  const target = candidates[0];
  if (!target) {
    appendLog(state, `「${sourceCard.name}」이(가) 되돌릴 적을 찾지 못했습니다.`, 'special');
    return;
  }
  const targetName = CARD_BY_ID[target.unit.cardId]?.name ?? '상대 최강 캐릭터';
  bounceUnitToOwner(state, privateStates, opponentId, target.index, 'premium-eclipse-recall');
  appendLog(state, `「${sourceCard.name}」이(가) ${targetName}을(를) 손패로 되돌렸습니다.`, 'special');
}

function applyTimeDevourerArrival(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  actorId: string,
  card: CardDefinition,
  zone: number,
): void {
  const devourer = state.boards[actorId]?.units?.[zone];
  if (!devourer) return;
  const opponentId = otherPlayer(state, actorId);
  let swallowedUnits = 0;
  let swallowedTraps = 0;

  for (let index = 0; index < state.boards[opponentId].units.length; index += 1) {
    const target = state.boards[opponentId].units[index];
    if (!target) continue;
    state.boards[opponentId].units[index] = null;
    if (!target.cardId.startsWith('token:')) state.graveyards[opponentId].push(target.cardId);
    swallowedUnits += 1;
    appendVisual(state, {
      kind: 'destroy',
      vfx: 'time-devourer-field-consume',
      cardId: target.cardId,
      ownerId: actorId,
      targetOwnerId: opponentId,
      targetZone: index,
      label: '시간 포식',
      detail: '시간 탐식자가 상대 유닛을 시간 밖으로 삼켰습니다.',
    });
  }

  const opponentPrivate = privateStates[opponentId];
  if (opponentPrivate) {
    for (let index = 0; index < opponentPrivate.secrets.length; index += 1) {
      const secret = opponentPrivate.secrets[index];
      if (!secret) continue;
      opponentPrivate.secrets[index] = null;
      state.boards[opponentId].secrets[index] = null;
      state.graveyards[opponentId].push(secret.cardId);
      swallowedTraps += 1;
    }
  }

  const healed = healCore(state, actorId, 10);
  const beforeHand = privateStates[actorId]?.hand.length ?? 0;
  if (privateStates[actorId]) drawCards(state, privateStates[actorId], actorId, 3);
  const drew = Math.max(0, (privateStates[actorId]?.hand.length ?? beforeHand) - beforeHand);
  const energy = state.energy[actorId];
  const beforeEnergy = energy?.current ?? 0;
  if (energy) energy.current = Math.min(energyHardCap(state, actorId), energy.current + 3);
  const gainedEnergy = Math.max(0, (energy?.current ?? beforeEnergy) - beforeEnergy);
  devourer.shield = Math.max(devourer.shield, MAX_UNIT_SHIELD);
  devourer.canAttack = true;

  appendLog(
    state,
    `「시간 탐식자」 절대 등장 — 적 유닛 ${swallowedUnits}체와 세트 함정 ${swallowedTraps}장을 삼키고, 코어 ${healed} 회복 · ${drew}장 드로우 · ENERGY ${gainedEnergy} 회복 · 보호막 ${MAX_UNIT_SHIELD}.`,
    'special',
  );
  appendVisual(state, {
    kind: 'special',
    vfx: 'time-devourer-absolute-consume',
    cardId: card.id,
    ownerId: actorId,
    targetOwnerId: opponentId,
    targetZone: zone,
    amount: swallowedUnits + swallowedTraps,
    shieldAmount: MAX_UNIT_SHIELD,
    healthAmount: healed,
    label: 'TIME DEVOURER · ABSOLUTE ARRIVAL',
    detail: `적 필드 ${swallowedUnits + swallowedTraps}장 포식 · 코어 ${healed} 회복 · ${drew}장 드로우 · ENERGY ${gainedEnergy}`,
  });
}

function applyPremiumTimeSignature(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  actorId: string,
  card: CardDefinition,
  zone?: number,
) {
  if (card.id === 'v60_premium_time_devourer' && typeof zone === 'number' && state.boards[actorId].units[zone]) {
    applyTimeDevourerArrival(state, privateStates, actorId, card, zone);
    return;
  }

  if (card.id === 'v41_premium_dawn_lord' && typeof zone === 'number' && state.boards[actorId].units[zone]) {
    const actorPrivate = privateStates[actorId];
    drawCards(state, actorPrivate, actorId, 2);
    applyEffect(state, privateStates, actorId, { kind: 'increase_energy_max', amount: 1 }, undefined, card);
    applyEffect(state, privateStates, actorId, { kind: 'heal_core', amount: 4 }, undefined, card);
    appendLog(state, '「여명의 지배자」가 새벽의 보너스를 열어 카드 2장, ENERGY 최대치 +1, 코어 4 회복을 제공합니다.', 'special');
    return;
  }

  if (card.id === 'v41_premium_zenith_king' && typeof zone === 'number' && state.boards[actorId].units[zone]) {
    applyEffect(state, privateStates, actorId, { kind: 'phase_lock', turns: 2 }, undefined, card);
    applyEffect(state, privateStates, actorId, { kind: 'mass_buff', attack: 2, health: 3 }, undefined, card);
    applyEffect(state, privateStates, actorId, { kind: 'mass_shield', amount: 4 }, undefined, card);
    appendLog(state, '「정점의 왕」이 절정 군림 효과로 2턴 시간 고정과 아군 전체 +2/+3, 보호막 4를 부여했습니다.', 'special');
    return;
  }

  if (card.id === 'v41_premium_eclipse_conductor' && typeof zone === 'number' && state.boards[actorId].units[zone]) {
    applyEffect(state, privateStates, actorId, { kind: 'phase_lock', turns: 2 }, undefined, card);
    recallStrongestEnemyUnit(state, privateStates, actorId, card);
    applyEffect(state, privateStates, actorId, { kind: 'banish_enemy_grave', amount: 2 }, undefined, card);
    appendLog(state, '「개기일식의 조율자」가 가장 강한 적을 되돌리고 상대 묘지 2장을 소멸시켰습니다.', 'special');
    return;
  }

  if (card.id === 'v44_premium_twilight_knight' && typeof zone === 'number' && state.boards[actorId].units[zone]) {
    const actorPrivate = privateStates[actorId];
    drawCards(state, actorPrivate, actorId, 1);
    appendLog(state, '「황혼의 기사」가 황혼의 서막으로 카드 1장을 추가로 준비했습니다.', 'special');
    return;
  }

  if (card.id === 'v41_premium_midnight_silence' && card.kind === 'spell') {
    const actorPrivate = privateStates[actorId];
    applyEffect(state, privateStates, actorId, { kind: 'phase_lock', turns: 2 }, undefined, card);
    freezeAllEnemyUnits(state, actorId, 1, card);
    discardHighestCostCardsFromOpponent(state, privateStates, actorId, 2, card);
    applyEffect(state, privateStates, actorId, { kind: 'damage_core', amount: 5 }, undefined, card);
    drawCards(state, actorPrivate, actorId, 2);
    applyEffect(state, privateStates, actorId, { kind: 'gain_energy', amount: 2 }, undefined, card);
    appendLog(state, '심야 후속 효과 발동 — 상대 코어 5 피해, 카드 2장 드로우, 이번 턴 ENERGY 2 회복.', 'special');
  }
}

export function playCard(
  snapshot: GameSnapshot,
  playerId: string,
  instanceId: string,
  requestedZone?: number,
  target?: CardActionTarget,
): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  assertActiveTurn(state, playerId);
  if (state.phase !== 'main') throw new Error('메인 단계에서만 카드를 사용할 수 있습니다.');

  const playerPrivate = privateStates[playerId];
  const { index: handIndex, instance, card } = getCardFromHand(playerPrivate, instanceId);
  if (card.kind === 'fusion' || card.kind === 'evolution') throw new Error('융합·진화 카드는 엑스트라 덱에서 소환해야 합니다.');
  if (card.eclipsePlayPhases?.length && !card.eclipsePlayPhases.includes(currentEclipsePhase(state))) {
    const allowed = card.eclipsePlayPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' · ');
    throw new Error(`시간대 사용 조건이 맞지 않습니다. 「${card.name}」은(는) ${allowed}에서만 사용할 수 있습니다. 현재 ${ECLIPSE_PHASE_LABEL[currentEclipsePhase(state)]}.`);
  }
  if (card.kind === 'spell' && card.effect?.kind === 'phase_counter_enemy' && !counterableEnemyTimeChange(state, playerId)) {
    throw new Error(`「${card.name}」은(는) 상대가 직전 턴에 변경한 시간이 그대로 유지 중일 때만 사용할 수 있습니다.`);
  }
  validateTarget(state, playerId, card, target);
  if (card.kind === 'spell' && (card.effect?.kind === 'recruit_unit' || card.effect?.kind === 'type_recruit') && firstOpenUnit(state.boards[playerId]) < 0) {
    throw new Error('덱에서 유닛을 전개할 빈 필드 칸이 없습니다.');
  }
  if (card.kind === 'spell' && card.effect && isBuffCardEffect(card.effect) && target && Number.isInteger(target.unitIndex)) {
    const targetUnit = state.boards[target.ownerId]?.units[Number(target.unitIndex)];
    if (targetUnit?.buffCardApplied) throw new Error('이 캐릭터는 이미 버프류 카드를 1번 적용받았습니다. 다른 캐릭터를 선택하세요.');
  }
  const opponentId = otherPlayer(state, playerId);

  if (card.kind === 'unit' && card.eclipseSummonPhases?.length && !card.eclipseSummonPhases.includes(currentEclipsePhase(state))) {
    const allowed = card.eclipseSummonPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' · ');
    throw new Error(`시간대 소환 조건이 맞지 않습니다. 이 캐릭터는 ${allowed}에서만 소환할 수 있습니다. 현재 ${ECLIPSE_PHASE_LABEL[currentEclipsePhase(state)]}.`);
  }

  statsFor(state, playerId).cardsPlayed += 1;

  if (card.kind === 'unit') {
    const isRift = card.summonMode === 'rift';
    const isLegendarySpecial = card.summonMode === 'legendary';
    if (card.rarity === 'legendary' && !isRift && !isLegendarySpecial) {
      throw new Error('메인 덱 전설 유닛은 일반 소환할 수 없습니다. 카드의 전설 특수 소환 조건을 확인하세요.');
    }
    if (isRift && !riftConditionMet(state, playerId, card)) {
      throw new Error(`${card.traitSpecialSummonTier ? '전투 특성 특수 소환' : '균열 소환'} 조건이 충족되지 않았습니다: ${card.riftCondition?.label ?? '조건 확인 필요'}`);
    }
    if (isLegendarySpecial) {
      const blockReason = legendarySummonBlockReason(state, playerId, card);
      if (blockReason) throw new Error(`전설 특수 소환 조건이 충족되지 않았습니다: ${blockReason}`);
    }

    spendEnergy(state, playerId, isRift ? (card.riftCost ?? card.cost) : card.cost);
    if (isLegendarySpecial) performLegendaryTribute(state, playerId, card);

    const requested = Number.isInteger(requestedZone) ? Number(requestedZone) : -1;
    const zone = requested >= 0 && requested <= 4 && !state.boards[playerId].units[requested]
      ? requested
      : firstOpenUnit(state.boards[playerId]);
    if (zone < 0 || zone > 4 || state.boards[playerId].units[zone]) throw new Error('선택한 유닛 칸을 사용할 수 없습니다.');
    playerPrivate.hand.splice(handIndex, 1);
    const origin: SummonOrigin = isRift ? 'rift' : isLegendarySpecial ? 'legendary' : 'normal';
    statsFor(state, playerId).unitsSummoned += 1;
    if (isRift || isLegendarySpecial) statsFor(state, playerId).specialSummons += 1;
    state.boards[playerId].units[zone] = makeUnit(state, playerId, instance, card, origin);
    // Validate targeted summon effects before any trap window can be committed.
    // This prevents a summon from entering a pending response state without the
    // ally target that its printed [등장] effect explicitly asks the player to choose.
    if (card.onSummon) resolveSummonEffectTarget(state, playerId, zone, card, target);
    appendLog(state, isRift ? `${card.traitSpecialSummonTier ? '전투 특성 특수 소환' : '균열 소환'} — 「${card.name}」!` : isLegendarySpecial ? `전설 특수 소환 — 「${card.name}」!` : `${card.name} 소환.`, isRift || isLegendarySpecial ? 'special' : 'system');
    appendVisual(state, {
      kind: isRift || isLegendarySpecial ? 'special' : 'summon',
      vfx: resolveCardVfx(card, 'summon'),
      cardId: card.id,
      ownerId: playerId,
      targetZone: zone,
      label: card.name,
      detail: isLegendarySpecial ? card.legendarySummonRule?.name : undefined,
    });
    continueSummonResolution(state, privateStates, {
      kind: 'summon', actorId: playerId, zone, cardId: card.id, origin, remainingTriggers: summonReactionTriggers(origin), target,
    });
  } else if (card.kind === 'spell') {
    spendEnergy(state, playerId, card.cost);
    playerPrivate.hand.splice(handIndex, 1);
    appendLog(state, `주문 「${card.name}」 발동 선언.`, 'system');
    const spellEffectKind = card.effect?.kind;
    const spellTargetsOpponent = card.target === 'enemy_core'
      || spellEffectKind === 'damage_core'
      || spellEffectKind === 'aoe_enemy'
      || spellEffectKind === 'erase_opponent_grave'
      || spellEffectKind === 'mass_recall'
      || spellEffectKind === 'steal_energy'
      || spellEffectKind === 'banish_enemy_grave'
      || spellEffectKind === 'damage_by_hand'
      || spellEffectKind === 'damage_by_grave'
      || spellEffectKind === 'field_count_blast'
      || spellEffectKind === 'phase_counter_enemy';
    const spellVisualTargetOwnerId = target?.ownerId ?? (spellTargetsOpponent ? opponentId : playerId);
    appendVisual(state, {
      kind: 'spell', vfx: resolveCardVfx(card, 'activation'), cardId: card.id, ownerId: playerId,
      targetOwnerId: spellVisualTargetOwnerId, targetZone: target?.unitIndex, label: card.name,
    });
    const continuation: Extract<PendingTrapContinuation, { kind: 'spell' }> = { kind: 'spell', actorId: playerId, cardId: card.id, target };
    const unitTarget: UnitBoardTarget | undefined = target && Number.isInteger(target.unitIndex)
      ? { ownerId: target.ownerId, unitIndex: Number(target.unitIndex) }
      : undefined;
    if (!openTrapWindow(state, privateStates, opponentId, 'spell_played', continuation, unitTarget)) {
      resolveSpellContinuation(state, privateStates, continuation);
    }
  } else {
    spendEnergy(state, playerId, card.cost);
    const zone = Number.isInteger(requestedZone) ? Number(requestedZone) : firstOpenSecret(state.boards[playerId]);
    if (zone < 0 || zone > 4 || state.boards[playerId].secrets[zone]) throw new Error('선택한 함정 칸을 사용할 수 없습니다.');
    playerPrivate.hand.splice(handIndex, 1);
    playerPrivate.secrets[zone] = instance;
    state.boards[playerId].secrets[zone] = { occupied: true };
    appendLog(state, '함정 카드 1장을 세트했습니다.', 'system');
    appendVisual(state, { kind: 'set', vfx: 'secret-set', ownerId: playerId, targetZone: zone, label: '함정 세트' });
  }

  state.handCounts[playerId] = playerPrivate.hand.length;
  if (state.currentPlayerId === playerId) state.turnActionTaken = true;
  if (!state.pendingTrap) {
    destroyDefeatedUnits(state, privateStates);
    checkWinner(state);
  }
  return { state, privateStates };
}

function fusionMaterialMinimumCost(card: CardDefinition, requirement?: FusionMaterial): number {
  // Exact named recipes are already restrictive enough, so keep the v31 floor there.
  // Broad element-only recipes were still too easy to assemble; those now need stronger bodies.
  const exactRecipe = Boolean(requirement?.cardIds?.length);
  const floor = exactRecipe
    ? 3
    : (card.rarity === 'legendary' ? 5 : 4);
  return Math.max(requirement?.minCost ?? 0, floor);
}

function fusionRequirementSummary(card: CardDefinition): string {
  const materials = card.fusionRecipe?.materials ?? [];
  const hasBroadMaterial = materials.some((requirement) => !requirement.cardIds?.length);
  if (!hasBroadMaterial) return '지정된 카드 소재 조합이 정확히 필요합니다.';
  return `범용 소재는 각 비용 ${card.rarity === 'legendary' ? 5 : 4} 이상이어야 합니다.`;
}

function materialMatches(unit: UnitState, requirement: FusionMaterial, fusionCard: CardDefinition): boolean {
  const card = CARD_BY_ID[unit.cardId];
  if (!card) return false;
  if (requirement.cardIds?.length && !requirement.cardIds.includes(card.id)) return false;
  if (requirement.element && card.element !== requirement.element) return false;
  const requiredMinCost = fusionMaterialMinimumCost(fusionCard, requirement);
  if (card.cost < requiredMinCost) return false;
  return true;
}

function findFusionMaterialAssignment(
  units: UnitState[],
  requirements: FusionMaterial[],
  fusionCard: CardDefinition,
  requirementIndex = 0,
  used = new Set<number>(),
): Set<number> | null {
  if (requirementIndex >= requirements.length) return new Set(used);
  for (let index = 0; index < units.length; index += 1) {
    if (used.has(index) || !materialMatches(units[index], requirements[requirementIndex], fusionCard)) continue;
    used.add(index);
    const resolved = findFusionMaterialAssignment(units, requirements, fusionCard, requirementIndex + 1, used);
    if (resolved) return resolved;
    used.delete(index);
  }
  return null;
}

function canAssignFusionMaterials(units: UnitState[], requirements: FusionMaterial[], fusionCard: CardDefinition): boolean {
  return Boolean(findFusionMaterialAssignment(units, requirements, fusionCard));
}

function indexCombinations(indexes: number[], count: number): number[][] {
  if (count <= 0) return [[]];
  const result: number[][] = [];
  const pick = (start: number, chosen: number[]) => {
    if (chosen.length === count) {
      result.push([...chosen]);
      return;
    }
    for (let at = start; at < indexes.length; at += 1) {
      chosen.push(indexes[at]);
      pick(at + 1, chosen);
      chosen.pop();
    }
  };
  pick(0, []);
  return result;
}

function consumedCardDefinitions(units: UnitState[]): CardDefinition[] {
  return units.map((unit) => CARD_BY_ID[unit.cardId]).filter((card): card is CardDefinition => Boolean(card));
}

function extraRuleBlockReason(card: CardDefinition, units: UnitState[], primaryIndexes: Set<number>): string | null {
  const rule = card.extraSummonRule;
  if (!rule) return null;
  const definitions = consumedCardDefinitions(units);
  const totalCost = definitions.reduce((sum, material) => sum + material.cost, 0);
  if (totalCost < rule.minTotalMaterialCost) return `릴리스할 캐릭터들의 비용 합이 ${rule.minTotalMaterialCost} 이상이어야 합니다. 현재 ${totalCost}.`;

  const tributeIndexes = units.map((_, index) => index).filter((index) => !primaryIndexes.has(index));
  const tributeDefinitions = tributeIndexes.map((index) => CARD_BY_ID[units[index].cardId]).filter((material): material is CardDefinition => Boolean(material));
  if (tributeDefinitions.length !== rule.additionalTributes) return `추가 릴리스 캐릭터 ${rule.additionalTributes}장이 필요합니다.`;
  if (tributeDefinitions.some((material) => material.cost < rule.tributeMinCost)) return `추가 릴리스 캐릭터는 각각 비용 ${rule.tributeMinCost} 이상이어야 합니다.`;
  if (rule.requireHighRarityMaterial && !definitions.some((material) => material.rarity === 'epic' || material.rarity === 'legendary')) {
    return '최상위 전설은 릴리스 소재 중 영웅 또는 전설 캐릭터가 1장 이상 필요합니다.';
  }
  if (rule.requireSameSeriesTribute && card.seriesId && !tributeDefinitions.some((material) => material.seriesId === card.seriesId)) {
    return '최상위 시리즈 전설은 추가 릴리스 소재 중 같은 시리즈 캐릭터가 1장 이상 필요합니다.';
  }
  return null;
}

function findFusionAssignmentForExtraRule(
  units: UnitState[],
  requirements: FusionMaterial[],
  fusionCard: CardDefinition,
  requirementIndex = 0,
  used = new Set<number>(),
): Set<number> | null {
  if (requirementIndex >= requirements.length) {
    return extraRuleBlockReason(fusionCard, units, used) ? null : new Set(used);
  }
  for (let index = 0; index < units.length; index += 1) {
    if (used.has(index) || !materialMatches(units[index], requirements[requirementIndex], fusionCard)) continue;
    used.add(index);
    const resolved = findFusionAssignmentForExtraRule(units, requirements, fusionCard, requirementIndex + 1, used);
    if (resolved) return resolved;
    used.delete(index);
  }
  return null;
}

function evolutionRequiredTurnGap(sourceCard: CardDefinition, evolutionCard: CardDefinition): number {
  const namedRecipe = Boolean(evolutionCard.evolutionRecipe?.fromIds?.length);
  let baseGap = 4;

  // This value now defines a GLOBAL match-round unlock threshold.
  // 2 global turns = 1 full ROUND; the source itself does not need to survive.
  if (namedRecipe) {
    if (evolutionCard.rarity === 'legendary') {
      if (sourceCard.cost <= 3) baseGap = 6;
      else if (sourceCard.cost <= 5) baseGap = 4;
      else baseGap = 2;
    } else if (sourceCard.cost <= 2) baseGap = 6;
    else if (sourceCard.cost <= 4) baseGap = 4;
    else baseGap = 2;
  }

  // v31f apex legends unlock one full ROUND later.
  return baseGap + (evolutionCard.extraSummonRule?.sourceExtraTurnGap ?? 0);
}

function evolutionBaseMatches(unit: UnitState, card: CardDefinition): boolean {
  const recipe = card.evolutionRecipe;
  const source = CARD_BY_ID[unit.cardId];
  if (!recipe || !source) return false;
  // If a named predecessor exists, only that exact predecessor can evolve.
  if (recipe.fromIds?.length) return recipe.fromIds.includes(source.id);
  // Broad element/cost evolutions need a higher rarity-based body floor as well.
  const hardenedMinCost = Math.max(recipe.minCost ?? 0, card.rarity === 'legendary' ? 6 : 5);
  return (!recipe.element || source.element === recipe.element)
    && source.cost >= hardenedMinCost
    && (recipe.maxCost === undefined || source.cost <= recipe.maxCost);
}

function globalRoundNumber(turnNumber: number): number {
  return Math.max(1, Math.ceil(turnNumber / 2));
}

function evolutionProgress(unit: UnitState, card: CardDefinition, turnNumber: number) {
  const source = CARD_BY_ID[unit.cardId];
  if (!source || !evolutionBaseMatches(unit, card)) return null;
  const requiredGap = evolutionRequiredTurnGap(source, card);
  const requiredRounds = Math.max(1, Math.ceil(requiredGap / 2));
  const currentRound = globalRoundNumber(turnNumber);
  const remainingRounds = Math.max(0, requiredRounds - currentRound);
  return {
    source,
    requiredGap,
    requiredRounds,
    currentRound,
    completedRounds: Math.min(requiredRounds, currentRound),
    remainingRounds,
    ready: currentRound >= requiredRounds,
  };
}

function evolutionMatches(unit: UnitState, card: CardDefinition, turnNumber: number): boolean {
  return Boolean(evolutionProgress(unit, card, turnNumber)?.ready);
}

function evolutionProgressFailureReasons(units: UnitState[], card: CardDefinition, turnNumber: number): string[] {
  const reasons: string[] = [];
  const requiredSources = card.extraSummonRule?.requiredSourceCopies ?? 1;
  const sourceLabel = (card.evolutionRecipe?.label ?? '계승 원본').replace(/\s*계승$/, '');
  const candidates = units
    .map((unit) => ({ unit, progress: evolutionProgress(unit, card, turnNumber) }))
    .filter((entry): entry is { unit: UnitState; progress: NonNullable<ReturnType<typeof evolutionProgress>> } => Boolean(entry.progress));

  if (candidates.length < requiredSources) {
    reasons.push(`계승 원본 「${sourceLabel}」이 ${candidates.length}/${requiredSources}체입니다.`);
  }

  const blockedByRound = candidates.filter((entry) => !entry.progress.ready);
  if (blockedByRound.length > 0) {
    const requiredRound = Math.max(...blockedByRound.map((entry) => entry.progress.requiredRounds));
    const currentRound = globalRoundNumber(turnNumber);
    reasons.push(
      `ROUND ${requiredRound}부터 계승 진화할 수 있습니다. 현재 ROUND ${currentRound}${currentRound < requiredRound ? ` · 앞으로 ${requiredRound - currentRound}라운드` : ''}.`,
    );
  }
  return reasons;
}

function findEvolutionSourceAssignment(units: UnitState[], card: CardDefinition, turnNumber: number): Set<number> | null {
  const requiredSources = card.extraSummonRule?.requiredSourceCopies ?? 1;
  const eligibleIndexes = units
    .map((unit, index) => evolutionMatches(unit, card, turnNumber) ? index : -1)
    .filter((index) => index >= 0);
  if (eligibleIndexes.length < requiredSources) return null;
  for (const combination of indexCombinations(eligibleIndexes, requiredSources)) {
    const primary = new Set(combination);
    if (!extraRuleBlockReason(card, units, primary)) return primary;
  }
  return null;
}

export function summonExtra(
  snapshot: GameSnapshot,
  playerId: string,
  extraInstanceId: string,
  materialZones: number[],
  extraChoiceIndex?: number,
  target?: CardActionTarget,
): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  assertActiveTurn(state, playerId);
  if (state.phase !== 'main') throw new Error('메인 단계에서만 융합·진화할 수 있습니다.');

  const playerPrivate = privateStates[playerId];
  const { index: extraIndex, instance, card } = getCardFromExtra(playerPrivate, extraInstanceId);
  if (card.kind !== 'fusion' && card.kind !== 'evolution') throw new Error('엑스트라 덱의 융합·진화 카드만 소환할 수 있습니다.');
  if (card.eclipseSummonPhases?.length && !card.eclipseSummonPhases.includes(currentEclipsePhase(state))) {
    const allowed = card.eclipseSummonPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' · ');
    throw new Error(`시간대 소환 조건이 맞지 않습니다. 이 엑스트라 캐릭터는 ${allowed}에서만 소환할 수 있습니다. 현재 ${ECLIPSE_PHASE_LABEL[currentEclipsePhase(state)]}.`);
  }
  const extraKind: ExtraSummonKind = card.kind;
  assertExtraSummonAvailable(state, playerId, extraKind);
  if (card.extraChoices?.length && (!Number.isInteger(extraChoiceIndex) || extraChoiceIndex === undefined || !card.extraChoices[extraChoiceIndex])) {
    throw new Error('전설 엑스트라는 소환 전에 1·2·3번 효과 중 하나를 선택해야 합니다.');
  }

  const uniqueZones = Array.from(new Set(materialZones.map(Number))).filter((zone) => Number.isInteger(zone) && zone >= 0 && zone <= 4);
  const selectedEntries = uniqueZones
    .map((zone) => ({ zone, unit: state.boards[playerId].units[zone] }))
    .filter((entry): entry is { zone: number; unit: UnitState } => Boolean(entry.unit));
  const units = selectedEntries.map((entry) => entry.unit);

  let summonZone = -1;
  let evolvedSource: UnitState | null = null;
  let inheritedAttack = 0;
  let inheritedHealth = 0;
  let inheritedDamage = 0;
  let inheritedShield = 0;

  if (card.kind === 'fusion') {
    const requirements = card.fusionRecipe?.materials ?? [];
    const additionalTributes = card.extraSummonRule?.additionalTributes ?? 0;
    const requiredCount = requirements.length + additionalTributes;
    if (requirements.length < 2) throw new Error('융합 소재 정보가 올바르지 않습니다.');
    if (uniqueZones.length !== requiredCount || units.length !== requiredCount) {
      throw new Error(`공명 융합에는 필드 캐릭터 ${requiredCount}장을 선택해야 합니다.`);
    }
    const baseAssignment = findFusionMaterialAssignment(units, requirements, card);
    if (!baseAssignment) throw new Error(`융합 조건이 맞지 않습니다: ${card.fusionRecipe?.label} · ${fusionRequirementSummary(card)}`);
    const assignment = findFusionAssignmentForExtraRule(units, requirements, card);
    if (!assignment) {
      const ruleReason = extraRuleBlockReason(card, units, baseAssignment);
      throw new Error(`전설 융합 추가 조건: ${ruleReason ?? '선택한 소재 조합이 추가 릴리스 조건을 만족하지 않습니다.'}`);
    }
    spendEnergy(state, playerId, card.cost);
    summonZone = uniqueZones[0];
    for (const zone of uniqueZones) {
      const material = state.boards[playerId].units[zone];
      if (!material) continue;
      state.graveyards[playerId].push(material.cardId);
      state.boards[playerId].units[zone] = null;
    }
  } else {
    const sourceCopies = card.extraSummonRule?.requiredSourceCopies ?? 1;
    const additionalTributes = card.extraSummonRule?.additionalTributes ?? 0;
    const requiredCount = sourceCopies + additionalTributes;
    if (uniqueZones.length !== requiredCount || units.length !== requiredCount) {
      throw new Error(`계승 진화에는 계승 원본 ${sourceCopies}체를 포함해 필드 캐릭터 ${requiredCount}체를 선택해야 합니다.`);
    }

    const eligibleIndexes = units
      .map((unit, index) => evolutionMatches(unit, card, state.turnNumber) ? index : -1)
      .filter((index) => index >= 0);
    if (eligibleIndexes.length < sourceCopies) {
      const progressReasons = evolutionProgressFailureReasons(units, card, state.turnNumber);
      throw new Error(
        progressReasons.length > 0
          ? `계승 진화 준비가 부족합니다: ${progressReasons.join(' / ')}`
          : `진화 조건이 맞지 않습니다: ${card.evolutionRecipe?.label} · ROUND 조건을 만족한 계승 원본 ${sourceCopies}체가 필요합니다.`,
      );
    }

    const sourceAssignment = findEvolutionSourceAssignment(units, card, state.turnNumber);
    if (!sourceAssignment) {
      let bestReason: string | null = null;
      for (const combination of indexCombinations(eligibleIndexes, sourceCopies)) {
        bestReason = extraRuleBlockReason(card, units, new Set(combination));
        if (bestReason) break;
      }
      if (bestReason) throw new Error(`계승 추가 조건: ${bestReason}`);
      throw new Error(`진화 조건이 맞지 않습니다: ${card.evolutionRecipe?.label} · 지정 원본과 추가 릴리스 조건을 모두 만족해야 합니다.`);
    }

    // When several valid predecessors are released together, inherit from the
    // one carrying the most accumulated combat investment instead of choosing
    // an arbitrary field slot.
    const sourceEntryIndex = Array.from(sourceAssignment).sort((a, b) => {
      const aBase = CARD_BY_ID[units[a].cardId];
      const bBase = CARD_BY_ID[units[b].cardId];
      const aInvestment = Math.max(0, units[a].attack - (aBase?.attack ?? units[a].attack))
        + Math.max(0, units[a].maxHealth - (aBase?.health ?? units[a].maxHealth))
        + units[a].shield;
      const bInvestment = Math.max(0, units[b].attack - (bBase?.attack ?? units[b].attack))
        + Math.max(0, units[b].maxHealth - (bBase?.health ?? units[b].maxHealth))
        + units[b].shield;
      return bInvestment - aInvestment;
    })[0];

    evolvedSource = units[sourceEntryIndex];
    spendEnergy(state, playerId, card.cost);
    summonZone = selectedEntries[sourceEntryIndex].zone;
    const sourceCard = CARD_BY_ID[evolvedSource.cardId];
    inheritedAttack = Math.max(0, evolvedSource.attack - (sourceCard?.attack ?? evolvedSource.attack));
    inheritedHealth = Math.max(0, evolvedSource.maxHealth - (sourceCard?.health ?? evolvedSource.maxHealth));
    inheritedDamage = Math.max(0, evolvedSource.maxHealth - evolvedSource.health);
    inheritedShield = evolvedSource.shield;
    for (const zone of uniqueZones) {
      const material = state.boards[playerId].units[zone];
      if (!material) continue;
      state.graveyards[playerId].push(material.cardId);
      state.boards[playerId].units[zone] = null;
    }
  }

  playerPrivate.extra.splice(extraIndex, 1);
  recordExtraSummon(state, playerId, extraKind);
  const origin: SummonOrigin = card.kind === 'fusion' ? 'fusion' : 'evolution';
  const unit = makeUnit(state, playerId, instance, card, origin, units.map((item) => item.cardId));
  if (card.kind === 'evolution' && evolvedSource) {
    unit.attack += inheritedAttack;
    unit.maxHealth += inheritedHealth;
    unit.health = Math.max(1, unit.maxHealth - inheritedDamage);
    unit.shield = Math.min(MAX_UNIT_SHIELD, Math.max(0, inheritedShield));
    unit.buffCardApplied = Boolean(evolvedSource.buffCardApplied);
    unit.canAttack = Boolean(card.keywords?.includes('charge')) || (evolvedSource.canAttack && evolvedSource.summonedTurn < state.turnNumber);
  }
  state.boards[playerId].units[summonZone] = unit;
  if (card.onSummon) resolveSummonEffectTarget(state, playerId, summonZone, card, target);
  state.extraCounts[playerId] = playerPrivate.extra.length;
  state.turnActionTaken = true;
  statsFor(state, playerId).cardsPlayed += 1;
  statsFor(state, playerId).unitsSummoned += 1;
  statsFor(state, playerId).specialSummons += 1;

  if (card.kind === 'fusion') {
    appendLog(state, `공명 융합 — 「${card.name}」 강림!`, 'fusion');
    appendVisual(state, { kind: 'fusion', vfx: resolveCardVfx(card, 'summon'), cardId: card.id, ownerId: playerId, targetZone: summonZone, label: card.name, detail: card.fusionRecipe?.label ?? '소재를 공명시켜 새로운 존재로 융합', sourceCardIds: units.map((item) => item.cardId) });
  } else {
    appendLog(state, `계승 진화 — 「${card.name}」 각성!`, 'evolution');
    appendVisual(state, { kind: 'evolution', vfx: resolveCardVfx(card, 'summon'), cardId: card.id, ownerId: playerId, targetZone: summonZone, label: card.name, detail: card.evolutionRecipe?.label ?? '원본의 힘을 계승해 상위 형태로 각성', sourceCardIds: units.map((item) => item.cardId) });
  }

  continueSummonResolution(state, privateStates, {
    kind: 'summon', actorId: playerId, zone: summonZone, cardId: card.id, origin, remainingTriggers: summonReactionTriggers(origin), target,
  });
  if (!state.pendingTrap) {
    destroyDefeatedUnits(state, privateStates);
    checkWinner(state);
  }
  return { state, privateStates };
}

export function sacrificeHandForEnergy(
  snapshot: GameSnapshot,
  playerId: string,
  instanceId: string,
): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  assertActiveTurn(state, playerId);
  if (state.phase !== 'main') throw new Error('손패를 에너지로 전환하는 행동은 메인 단계에서만 사용할 수 있습니다.');
  if (state.energySacrificeTurn?.[playerId] === state.turnNumber) throw new Error('손패 에너지 전환은 한 턴에 1번만 사용할 수 있습니다.');

  const energy = state.energy[playerId];
  if (!energy) throw new Error('에너지 상태를 찾을 수 없습니다.');
  const hardCap = energyHardCap(state, playerId);
  if (energy.current >= hardCap) throw new Error(`현재 에너지가 이미 최대 한도 ${hardCap}입니다.`);

  const playerPrivate = privateStates[playerId];
  const { index, card } = getCardFromHand(playerPrivate, instanceId);
  playerPrivate.hand.splice(index, 1);
  state.graveyards[playerId].push(card.id);
  state.handCounts[playerId] = playerPrivate.hand.length;
  energy.current = Math.min(hardCap, energy.current + 1);
  if (!state.energySacrificeTurn) state.energySacrificeTurn = {};
  state.energySacrificeTurn[playerId] = state.turnNumber;
  state.turnActionTaken = true;

  appendLog(state, `에너지 전환 — 손패의 「${card.name}」을(를) 묘지로 보내 이번 턴 에너지 +1.`, 'system');
  appendVisual(state, { kind: 'energy', vfx: 'hand-sacrifice-energy', cardId: card.id, ownerId: playerId, targetOwnerId: playerId, amount: 1, label: '손패 → 에너지' });
  return { state, privateStates, message: '손패 1장을 묘지로 보내 에너지 1을 얻었습니다.' };
}

export function sacrificeFieldUnitForEnergy(
  snapshot: GameSnapshot,
  playerId: string,
  unitIndex: number,
): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  assertActiveTurn(state, playerId);
  if (state.phase !== 'main') throw new Error('필드 캐릭터 정리는 메인 단계에서만 사용할 수 있습니다.');
  if (state.fieldSacrificeTurn?.[playerId] === state.turnNumber) throw new Error('필드 캐릭터 정리는 한 턴에 1번만 사용할 수 있습니다.');
  if (!Number.isInteger(unitIndex) || unitIndex < 0 || unitIndex > 4) throw new Error('정리할 내 캐릭터를 선택하세요.');

  const unit = state.boards[playerId]?.units[unitIndex];
  if (!unit) throw new Error('선택한 위치에 내 캐릭터가 없습니다.');
  const card = CARD_BY_ID[unit.cardId];
  const energy = state.energy[playerId];
  if (!energy) throw new Error('에너지 상태를 찾을 수 없습니다.');
  const hardCap = energyHardCap(state, playerId);

  // Voluntary retirement is not treated as combat destruction, so destroy-trigger traps
  // and tactical death bonuses cannot be farmed. Real cards go to the grave; tokens vanish.
  state.boards[playerId].units[unitIndex] = null;
  if (card) state.graveyards[playerId].push(card.id);
  if (!state.fieldSacrificeTurn) state.fieldSacrificeTurn = {};
  state.fieldSacrificeTurn[playerId] = state.turnNumber;
  state.turnActionTaken = true;

  const before = energy.current;
  energy.current = Math.min(hardCap, energy.current + 1);
  const gained = energy.current - before;
  const name = (card?.name ?? unit.cardId.replace('token:', '')) || '토큰';
  appendLog(state, `필드 정리 — 「${name}」을(를) ${card ? '묘지로 보내고' : '소멸시키고'}${gained > 0 ? ' 에너지 +1.' : ' 빈 유닛 칸을 확보했습니다.'}`, 'system');
  appendVisual(state, { kind: 'destroy', vfx: 'field-retire', cardId: card?.id, ownerId: playerId, targetOwnerId: playerId, targetZone: unitIndex, label: '필드 정리' });
  if (gained > 0) appendVisual(state, { kind: 'energy', vfx: 'field-retire-energy', cardId: card?.id, ownerId: playerId, targetOwnerId: playerId, amount: gained, label: '필드 → ENERGY' });
  return { state, privateStates, message: gained > 0 ? '필드 캐릭터 1장을 묘지로 보내 에너지 1을 얻었습니다.' : '필드 캐릭터를 정리해 빈 칸을 만들었습니다. (에너지는 이미 최대입니다.)' };
}

export function beginBattlePhase(snapshot: GameSnapshot, playerId: string): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  assertActiveTurn(state, playerId);
  if (state.phase !== 'main') throw new Error('이미 전투 단계입니다.');
  state.phase = 'battle';
  state.turnActionTaken = true;
  appendLog(state, '전투 단계로 이동했습니다.', 'system');
  appendVisual(state, { kind: 'turn', vfx: 'battle-phase', ownerId: playerId, label: 'BATTLE PHASE' });
  return { state, privateStates };
}

function resolveCoreAttack(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  continuation: Extract<PendingTrapContinuation, { kind: 'attack_core' }>,
  trapResult: TrapResolution = { negated: false, retaliation: 0 },
): void {
  // A responding trap may itself move/rewind the battlefield clock. Re-resolve
  // temporal bodies after the trap window and immediately before damage.
  refreshBattlefieldEclipseModifiers(state);
  const playerId = continuation.actorId;
  const opponentId = otherPlayer(state, playerId);
  const attacker = state.boards[playerId].units[continuation.attackerIndex];
  if (!attacker) {
    appendLog(state, '공격 유닛이 사라져 공격이 취소되었습니다.', 'system');
    return;
  }
  const attackerCard = CARD_BY_ID[attacker.cardId];
  if (trapResult.negated) {
    if (trapResult.retaliation > 0) {
      const report = damageUnit(state, playerId, continuation.attackerIndex, trapResult.retaliation);
      appendVisual(state, { kind: 'defense', vfx: 'trap-retaliation', ownerId: opponentId, targetOwnerId: playerId, targetZone: continuation.attackerIndex, amount: report.absorbed + report.healthDamage, shieldAmount: report.absorbed, healthAmount: report.healthDamage, label: '함정 반격' });
    }
    attacker.canAttack = false;
    appendLog(state, `${attackerCard?.name ?? '유닛'}의 직접 공격이 무효화되었습니다.`, 'trap');
  } else {
    const damage = Math.max(0, attacker.attack + continuation.bonusDamage);
    const actualDamage = damageCore(state, opponentId, damage);
    statsFor(state, playerId).coreDamage += actualDamage;
    if (attackerCard?.keywords?.includes('lifesteal')) {
      const healed = healCore(state, playerId, actualDamage);
      statsFor(state, playerId).healing += healed;
      if (healed > 0) appendVisual(state, { kind: 'heal', vfx: 'lifesteal-return', cardId: attackerCard?.id, ownerId: playerId, targetOwnerId: playerId, sourceZone: continuation.attackerIndex, amount: healed, label: '흡수' });
    }
    attacker.canAttack = false;
    appendLog(state, `${attackerCard?.name ?? '유닛'}이(가) 코어에 ${actualDamage} 피해.`, 'attack');
    appendVisual(state, { kind: 'core', vfx: 'core-break', cardId: attackerCard?.id, ownerId: playerId, targetOwnerId: opponentId, sourceZone: continuation.attackerIndex, amount: actualDamage, label: '직접 공격' });
  }
  destroyDefeatedUnits(state, privateStates);
  checkWinner(state);
}

function resolveUnitAttack(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  continuation: Extract<PendingTrapContinuation, { kind: 'attack_unit' }>,
  trapResult: TrapResolution = { negated: false, retaliation: 0 },
): void {
  // Same guarantee as direct attacks: TIME stats at the instant of resolution are
  // the stats used for both outgoing damage and counterattack damage.
  refreshBattlefieldEclipseModifiers(state);
  const playerId = continuation.actorId;
  const opponentId = otherPlayer(state, playerId);
  const attacker = state.boards[playerId].units[continuation.attackerIndex];
  if (!attacker) {
    appendLog(state, '공격 유닛이 사라져 공격이 취소되었습니다.', 'system');
    return;
  }
  const attackerCard = CARD_BY_ID[attacker.cardId];
  if (trapResult.negated) {
    attacker.canAttack = false;
    if (trapResult.retaliation > 0) {
      const report = damageUnit(state, playerId, continuation.attackerIndex, trapResult.retaliation);
      appendVisual(state, { kind: 'defense', vfx: 'trap-retaliation', ownerId: opponentId, targetOwnerId: playerId, targetZone: continuation.attackerIndex, amount: report.absorbed + report.healthDamage, shieldAmount: report.absorbed, healthAmount: report.healthDamage, label: '함정 반격' });
    }
    appendLog(state, `${attackerCard?.name ?? '유닛'}의 공격이 함정으로 무효화되었습니다.`, 'trap');
    destroyDefeatedUnits(state, privateStates);
    checkWinner(state);
    return;
  }

  const defender = state.boards[opponentId].units[continuation.targetIndex];
  if (!defender) {
    // The attack was already declared and may have forced a trap response, so the
    // attack opportunity is consumed even if that response removed the target.
    attacker.canAttack = false;
    appendLog(state, '공격 대상이 사라져 공격이 취소되었습니다. 공격 기회는 소모됩니다.', 'system');
    destroyDefeatedUnits(state, privateStates);
    checkWinner(state);
    return;
  }
  const defenderCard = CARD_BY_ID[defender.cardId];
  const defenderDurabilityBefore = Math.max(0, defender.health) + Math.max(0, defender.shield);
  const attackerDamage = Math.max(0, attacker.attack + continuation.bonusDamage);
  const defenderDamage = Math.max(0, defender.attack);
  const defenderReport = damageUnit(state, opponentId, continuation.targetIndex, attackerDamage);
  const attackerReport = damageUnit(state, playerId, continuation.attackerIndex, defenderDamage);
  const sweepReports: DamageReport[] = [];

  if (attackerCard?.keywords?.includes('sweep')) {
    appendVisual(state, {
      kind: 'special',
      vfx: 'sweep-volley',
      cardId: attackerCard.id,
      ownerId: playerId,
      targetOwnerId: opponentId,
      sourceZone: continuation.attackerIndex,
      targetZone: continuation.targetIndex,
      amount: attackerDamage,
      label: '전체공격',
      detail: '지정 대상 외의 적 전열에도 같은 공격 피해를 적용합니다. 반격은 지정 대상만 합니다.',
    });
    for (let index = 0; index < state.boards[opponentId].units.length; index += 1) {
      if (index === continuation.targetIndex) continue;
      const extraTarget = state.boards[opponentId].units[index];
      if (!extraTarget) continue;
      const extraCard = CARD_BY_ID[extraTarget.cardId];
      const report = damageUnit(state, opponentId, index, attackerDamage);
      sweepReports.push(report);
      if (report.absorbed > 0 || report.healthDamage > 0) {
        appendVisual(state, {
          kind: 'defense',
          vfx: 'sweep-impact',
          cardId: extraCard?.id,
          ownerId: playerId,
          targetOwnerId: opponentId,
          targetZone: index,
          amount: report.absorbed + report.healthDamage,
          shieldAmount: report.absorbed,
          healthAmount: report.healthDamage,
          label: '전체공격 피해',
          detail: `${extraCard?.name ?? '적 유닛'} · 보호막 ${report.absorbed} / HP ${report.healthDamage} 피해`,
        });
      }
    }
  }

  if (defenderReport.absorbed > 0 || defenderReport.healthDamage > 0) {
    appendVisual(state, { kind: 'defense', vfx: resolveCardVfx(defenderCard, 'defense'), cardId: defenderCard?.id, ownerId: playerId, targetOwnerId: opponentId, targetZone: continuation.targetIndex, amount: defenderReport.absorbed + defenderReport.healthDamage, shieldAmount: defenderReport.absorbed, healthAmount: defenderReport.healthDamage, label: '공격 피해', detail: `${defenderCard?.name ?? '적 유닛'} · 보호막 ${defenderReport.absorbed} / HP ${defenderReport.healthDamage} 피해` });
  }
  if (attackerReport.absorbed > 0 || attackerReport.healthDamage > 0) {
    appendVisual(state, { kind: 'defense', vfx: resolveCardVfx(attackerCard, 'defense'), cardId: attackerCard?.id, ownerId: opponentId, targetOwnerId: playerId, targetZone: continuation.attackerIndex, amount: attackerReport.absorbed + attackerReport.healthDamage, shieldAmount: attackerReport.absorbed, healthAmount: attackerReport.healthDamage, label: '반격 피해', detail: `${attackerCard?.name ?? '공격 유닛'} · 반격 보호막 ${attackerReport.absorbed} / HP ${attackerReport.healthDamage} 피해` });
  }
  if (attackerCard?.keywords?.includes('lifesteal')) {
    const totalHealthDamage = defenderReport.healthDamage + sweepReports.reduce((sum, report) => sum + report.healthDamage, 0);
    const healed = healCore(state, playerId, totalHealthDamage);
    statsFor(state, playerId).healing += healed;
    if (healed > 0) appendVisual(state, { kind: 'heal', vfx: 'lifesteal-return', cardId: attackerCard?.id, ownerId: playerId, targetOwnerId: playerId, sourceZone: continuation.attackerIndex, amount: healed, label: '흡수' });
  }
  if (attackerCard?.keywords?.includes('pierce') && defenderReport.destroyed) {
    const overflow = Math.max(0, attackerDamage - defenderDurabilityBefore);
    if (overflow > 0) {
      const pierceDamage = damageCore(state, opponentId, overflow);
      statsFor(state, playerId).coreDamage += pierceDamage;
      if (pierceDamage > 0) appendVisual(state, { kind: 'core', vfx: 'pierce-impact', cardId: attackerCard?.id, ownerId: playerId, targetOwnerId: opponentId, sourceZone: continuation.attackerIndex, amount: pierceDamage, label: '관통 피해' });
    }
  }

  // 처형 is restricted to this successfully resolved BASIC unit-to-unit attack.
  // Direct core attacks are handled by resolveCoreAttack() and never reach this block;
  // effect damage, retaliation, and sweep secondary targets also do not trigger it.
  // The normal attack damage above always resolves first, then the selected defender is destroyed.
  const executionFromBasicAttack = attackerCard?.keywords?.includes('execute') === true;
  if (executionFromBasicAttack) {
    appendVisual(state, {
      kind: 'special',
      vfx: 'execution-scythe',
      cardId: attackerCard.id,
      ownerId: playerId,
      targetOwnerId: opponentId,
      sourceZone: continuation.attackerIndex,
      targetZone: continuation.targetIndex,
      label: '처형',
      detail: `${defenderCard?.name ?? '적 유닛'}에게 기본 공격이 적중했습니다. 피해 계산 후 사신의 낫으로 지정 대상을 처형합니다.`,
    });
    defender.health = 0;
  }

  const destroyedAny = defender.health <= 0 || sweepReports.some((report) => report.destroyed);
  if (destroyedAny) applyTacticalOnKill(state, privateStates, playerId, continuation.attackerIndex);
  attacker.canAttack = false;
  const traitNote = `${attackerCard?.keywords?.includes('sweep') ? ' · 전체공격' : ''}${attackerCard?.keywords?.includes('execute') ? ' · 처형' : ''}`;
  appendLog(state, `${attackerCard?.name ?? '유닛'}이(가) ${defenderCard?.name ?? '적 유닛'}에게 ${attackerDamage} 피해 · 반격 ${defenderDamage} 피해${traitNote}.`, 'attack');
  destroyDefeatedUnits(state, privateStates);
  checkWinner(state);
}

export function attack(
  snapshot: GameSnapshot,
  playerId: string,
  attackerIndex: number,
  target: { kind: 'unit'; unitIndex: number } | { kind: 'core' },
): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  assertActiveTurn(state, playerId);
  if (state.phase !== 'battle') throw new Error('전투 단계에서만 공격할 수 있습니다.');

  // Keep temporal stats authoritative at the exact moment combat damage is calculated.
  // This also repairs older/stale room snapshots whose unit modifier fields were not
  // refreshed after a phase change.
  refreshBattlefieldEclipseModifiers(state);

  const opponentId = otherPlayer(state, playerId);
  const attacker = state.boards[playerId].units[attackerIndex];
  if (!attacker) throw new Error('공격할 유닛이 없습니다.');
  if (!attacker.canAttack) throw new Error('이 유닛은 이번 턴에 이미 공격했거나 아직 공격할 수 없습니다.');

  const attackerCard = CARD_BY_ID[attacker.cardId];
  const guardIndexes = state.boards[opponentId].units
    .map((unit, index) => ({ unit, index }))
    .filter(({ unit }) => unit && CARD_BY_ID[unit.cardId]?.keywords?.includes('guard'))
    .map(({ index }) => index);

  if (target.kind === 'core') {
    const hasCoreStrike = Boolean(attackerCard?.keywords?.includes('corestrike'));
    if (guardIndexes.length > 0) throw new Error('상대 필드에 수호 유닛이 있어 코어를 직접 공격할 수 없습니다.');
    if (state.boards[opponentId].units.some(Boolean) && !hasCoreStrike) throw new Error('상대 필드에 유닛이 남아 있어 직접 공격할 수 없습니다.');
  } else {
    if (target.unitIndex < 0 || target.unitIndex > 4) throw new Error('올바른 공격 대상을 선택하세요.');
    if (guardIndexes.length > 0 && !guardIndexes.includes(target.unitIndex)) throw new Error('수호 유닛을 먼저 공격해야 합니다.');
    if (!state.boards[opponentId].units[target.unitIndex]) throw new Error('선택한 위치에 적 유닛이 없습니다.');
  }

  const bonusDamage = applyTacticalOnAttackStart(state, playerId, attackerIndex);
  const declaredTargetCard = target.kind === 'unit' ? CARD_BY_ID[state.boards[opponentId].units[target.unitIndex]?.cardId ?? ''] : undefined;
  appendVisual(state, {
    kind: 'attack', vfx: resolveCardVfx(attackerCard, 'attack'), cardId: attackerCard?.id, ownerId: playerId,
    targetOwnerId: opponentId, sourceZone: attackerIndex, targetZone: target.kind === 'unit' ? target.unitIndex : undefined,
    amount: attacker.attack + bonusDamage, label: attackerCard?.name ?? '유닛 공격',
    detail: target.kind === 'unit' ? `${declaredTargetCard?.name ?? '적 유닛'}을 향해 공격` : `상대 코어를 향해 직접 공격`,
  });

  if (target.kind === 'core') {
    appendLog(state, `${attackerCard?.name ?? '유닛'} → 상대 코어 직접 공격 선언 (${attacker.attack + bonusDamage})`, 'attack');
    const continuation: Extract<PendingTrapContinuation, { kind: 'attack_core' }> = { kind: 'attack_core', actorId: playerId, attackerIndex, bonusDamage };
    if (!openTrapWindow(state, privateStates, opponentId, 'direct_attack', continuation)) resolveCoreAttack(state, privateStates, continuation);
  } else {
    const defenderCard = CARD_BY_ID[state.boards[opponentId].units[target.unitIndex]?.cardId ?? ''];
    appendLog(state, `${attackerCard?.name ?? '유닛'} → ${defenderCard?.name ?? '적 유닛'} 공격 선언 (${attacker.attack + bonusDamage})`, 'attack');
    const continuation: Extract<PendingTrapContinuation, { kind: 'attack_unit' }> = { kind: 'attack_unit', actorId: playerId, attackerIndex, targetIndex: target.unitIndex, bonusDamage };
    if (!openTrapWindow(state, privateStates, opponentId, 'unit_attacked', continuation, { ownerId: opponentId, unitIndex: target.unitIndex })) resolveUnitAttack(state, privateStates, continuation);
  }

  state.turnActionTaken = true;
  return { state, privateStates };
}

function continueAfterTrapDecision(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  pending: PendingTrapWindow,
  trapResult: TrapResolution,
): void {
  const continuation = pending.continuation;
  if (continuation.kind === 'spell') resolveSpellContinuation(state, privateStates, continuation, trapResult);
  else if (continuation.kind === 'summon') continueSummonResolution(state, privateStates, continuation, trapResult);
  else if (continuation.kind === 'attack_core') resolveCoreAttack(state, privateStates, continuation, trapResult);
  else if (continuation.kind === 'attack_unit') resolveUnitAttack(state, privateStates, continuation, trapResult);
  else {
    destroyDefeatedUnits(state, privateStates);
    checkWinner(state);
  }
}

export function resolveExtraChoice(snapshot: GameSnapshot, playerId: string, choiceIndex: number): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  if (state.status !== 'active') throw new Error('이미 종료된 결투입니다.');
  if (state.currentPlayerId !== playerId) throw new Error('상대 턴입니다.');
  if (state.pendingTrap) throw new Error('함정 발동 여부를 결정하는 중입니다. 잠시만 기다려 주세요.');
  const pending = state.pendingExtraChoice;
  if (!pending) throw new Error('현재 선택할 수 있는 엑스트라 효과가 없습니다.');
  if (pending.ownerId !== playerId) throw new Error('상대의 선택 효과 처리 중입니다.');
  const card = CARD_BY_ID[pending.cardId];
  const unit = state.boards[playerId]?.units[pending.zone];
  if (!card || !unit || unit.cardId !== pending.cardId) {
    state.pendingExtraChoice = null;
    throw new Error('선택 효과를 적용할 유닛을 찾을 수 없습니다.');
  }
  if (!card.extraChoices?.[choiceIndex]) throw new Error('선택한 효과가 올바르지 않습니다.');
  state.pendingExtraChoice = null;
  applyExtraChoice(state, privateStates, playerId, pending.zone, card, choiceIndex);
  finalizeSummonPostChoice(state, privateStates, playerId, pending.zone, card);
  return { state, privateStates };
}

export function respondTrap(snapshot: GameSnapshot, playerId: string, activate: boolean): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  const pending = state.pendingTrap;
  if (!pending) throw new Error('현재 응답할 함정 타이밍이 없습니다.');
  if (pending.ownerId !== playerId) throw new Error('상대의 함정 선택을 기다리는 중입니다.');

  let result: TrapResolution = { negated: false, retaliation: 0 };
  if (activate) {
    const target = pending.targetOwnerId !== undefined && pending.targetUnitIndex !== undefined
      ? { ownerId: pending.targetOwnerId, unitIndex: pending.targetUnitIndex }
      : undefined;
    result = activateTrapAt(state, privateStates, playerId, pending.trigger, pending.trapZone, target);
  } else {
    const instance = privateStates[playerId]?.secrets[pending.trapZone];
    const card = instance ? CARD_BY_ID[instance.cardId] : undefined;
    appendLog(state, `함정 「${card?.name ?? '세트 카드'}」 발동을 이번 타이밍에는 보류했습니다.`, 'trap');
  }
  state.pendingTrap = null;
  continueAfterTrapDecision(state, privateStates, pending, result);
  return { state, privateStates };
}

const BASE_ENERGY_HARD_CAP = 10;

function energyHardCap(state: MatchState, playerId: string): number {
  const permanentBonus = Math.max(0, state.energyMaxBonus?.[playerId] ?? 0);
  return BASE_ENERGY_HARD_CAP + permanentBonus;
}

function personalTurnEnergyIncome(_state: MatchState, _playerId: string, _turnNumber = _state.turnNumber): number {
  // V59 banking rule: every personal turn adds exactly +1 natural ENERGY.
  // Unspent ENERGY carries over, so 1/10 -> 2/10 -> 3/10 when the player spends nothing.
  // Permanent max-increase spells only expand storage above 10; they do not increase this +1 income.
  return 1;
}

function repairCurrentTurnEnergy(state: MatchState): boolean {
  const playerId = state.currentPlayerId;
  if (!playerId || state.status !== 'active') return false;
  const energy = state.energy[playerId] ?? { current: 0, max: 0 };
  const expectedCap = energyHardCap(state, playerId);
  const changed = energy.max !== expectedCap || energy.current > expectedCap;
  if (!changed) return false;
  // V59 migration guard: old live rooms may still carry an earlier 1/2/3... max.
  // Open the full storage cap without granting free current ENERGY mid-turn.
  energy.max = expectedCap;
  energy.current = Math.min(expectedCap, Math.max(0, energy.current));
  state.energy[playerId] = energy;
  return true;
}

function advanceTurn(state: MatchState, privateStates: Record<string, PrivateState>, playerId: string, now = Date.now(), reason?: string): void {
  const nextPlayer = otherPlayer(state, playerId);
  state.currentPlayerId = nextPlayer;
  state.turnNumber += 1;
  state.phase = 'main';
  state.turnActionTaken = false;
  state.turnEndsAt = now + TURN_DURATION_MS;
  const nextEnergy = state.energy[nextPlayer] ?? { current: 0, max: energyHardCap(state, nextPlayer) };
  // V59 banking system: the capacity is open from the start and unused ENERGY carries over.
  // Every personal turn adds exactly +1 natural ENERGY, regardless of round number.
  // QUICK START / increase_energy_max keeps its original role by raising storage above 10.
  nextEnergy.max = energyHardCap(state, nextPlayer);
  const turnIncome = personalTurnEnergyIncome(state, nextPlayer, state.turnNumber);
  const beforeNaturalIncome = Math.max(0, nextEnergy.current);
  nextEnergy.current = Math.min(nextEnergy.max, beforeNaturalIncome + turnIncome);
  const naturalIncomeGained = nextEnergy.current - beforeNaturalIncome;
  const queuedEnergyBonus = Math.max(0, state.nextTurnEnergyBonus?.[nextPlayer] ?? 0);
  if (queuedEnergyBonus > 0) {
    const beforeBonus = nextEnergy.current;
    nextEnergy.current = Math.min(energyHardCap(state, nextPlayer), nextEnergy.current + queuedEnergyBonus);
    const gainedBonus = nextEnergy.current - beforeBonus;
    if (state.nextTurnEnergyBonus) delete state.nextTurnEnergyBonus[nextPlayer];
    if (gainedBonus > 0) {
      appendVisual(state, { kind: 'energy', vfx: 'light-seal-release', ownerId: nextPlayer, targetOwnerId: nextPlayer, amount: gainedBonus, label: `예약 ENERGY +${gainedBonus}` });
      appendLog(state, `빛의 봉인 효과로 이번 턴 임시 ENERGY +${gainedBonus}.`, 'special');
    }
  }
  state.energy[nextPlayer] = nextEnergy;
  state.boards[nextPlayer].units.forEach((unit) => {
    if (!unit) return;
    const stunnedNow = Boolean(unit.stunnedUntilTurn && unit.stunnedUntilTurn >= state.turnNumber);
    unit.canAttack = !stunnedNow;
    if (unit.stunnedUntilTurn && unit.stunnedUntilTurn < state.turnNumber) delete unit.stunnedUntilTurn;
  });

  // v43: ECLIPSE CYCLE no longer advances from turn count. Successful real-unit arrivals drive the clock.
  checkWinner(state);
  if (state.status !== 'active') {
    state.turnEndsAt = null;
    return;
  }

  appendVisual(state, { kind: 'turn', vfx: 'turn-shift', ownerId: nextPlayer, label: `TURN ${state.turnNumber}` });
  const drew = drawCards(state, privateStates[nextPlayer], nextPlayer, 1);
  if (drew && state.status === 'active') {
    appendVisual(state, { kind: 'draw', vfx: 'turn-draw', ownerId: nextPlayer, label: '턴 시작 드로우' });
  }
  if (reason) appendLog(state, reason, 'system');
  if (drew && state.status === 'active') appendLog(state, `${nextPlayer.slice(0, 6)}의 턴 시작 · 카드 1장 드로우 · 남은 ENERGY 누적 후 +${naturalIncomeGained} · ${nextEnergy.current}/${nextEnergy.max}.`, 'system');
  if (state.status !== 'active') state.turnEndsAt = null;
  checkWinner(state);
}

export function sendBattleEmote(snapshot: GameSnapshot, playerId: string, emoteId: string): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  if (state.status !== 'active') throw new Error('진행 중인 결투에서만 감정표현을 사용할 수 있습니다.');
  if (!(state.playerOrder as string[]).includes(playerId)) throw new Error('선수만 감정표현을 사용할 수 있습니다.');
  const now = Date.now();
  const recent = (state.battleEmotes ?? []).filter((entry) => now - entry.createdAt < 12_000);
  const lastMine = [...recent].reverse().find((entry) => entry.senderId === playerId);
  if (lastMine && now - lastMine.createdAt < 2200) throw new Error('감정표현은 2.2초에 한 번 사용할 수 있습니다.');
  recent.push({ id: randomId('emote'), senderId: playerId, emoteId, createdAt: now });
  state.battleEmotes = recent.slice(-8);
  appendVisual(state, { kind: 'special', vfx: 'battle-emote-pop', ownerId: playerId, label: 'EMOTE' });
  return { state, privateStates, message: '감정표현을 보냈습니다.' };
}

export function spendEnergyToDraw(snapshot: GameSnapshot, playerId: string): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  assertActiveTurn(state, playerId);
  if (state.phase !== 'main') throw new Error('메인 단계에서만 ENERGY 드로우를 사용할 수 있습니다.');

  const playerPrivate = privateStates[playerId];
  if (!state.energyDrawTurn) state.energyDrawTurn = {};
  if (!state.energyDrawCount) state.energyDrawCount = {};
  const previousDraws = state.energyDrawTurn[playerId] === state.turnNumber
    ? Math.max(1, Math.trunc(state.energyDrawCount[playerId] ?? 0))
    : 0;
  const cost = 2 + previousDraws;
  spendEnergy(state, playerId, cost);
  state.energyDrawTurn[playerId] = state.turnNumber;
  state.energyDrawCount[playerId] = previousDraws + 1;

  const drew = drawCards(state, playerPrivate, playerId, 1);
  appendLog(state, `${playerId.slice(0, 6)}이(가) ENERGY ${cost}를 소비해 카드 1장을 드로우했습니다. 같은 턴의 다음 ENERGY 드로우 비용은 ${cost + 1}입니다.`, 'system');
  if (drew) {
    appendVisual(state, { kind: 'draw', vfx: 'energy-draw', ownerId: playerId, amount: 1, label: `ENERGY ${cost} → DRAW` });
  }
  checkWinner(state);
  return { state, privateStates };
}

export function drawAndEndTurn(snapshot: GameSnapshot, playerId: string): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  assertActiveTurn(state, playerId);
  if (state.phase !== 'main') throw new Error('메인 단계에서만 턴 소비 드로우를 선택할 수 있습니다.');
  if (state.turnActionTaken) throw new Error('이번 턴에 이미 행동했습니다. 턴 소비 드로우는 다른 행동 전에만 사용할 수 있습니다.');
  const playerPrivate = privateStates[playerId];
  const drew = drawCards(state, playerPrivate, playerId, 1);
  appendLog(state, `${playerId.slice(0, 6)}이(가) 턴을 소비해 카드 1장을 추가로 드로우했습니다.`, 'system');
  appendVisual(state, { kind: 'draw', vfx: 'draw-pulse', ownerId: playerId, label: '턴 소비 드로우' });
  if (!drew || state.status !== 'active') {
    state.turnEndsAt = null;
    checkWinner(state);
    return { state, privateStates };
  }
  advanceTurn(state, privateStates, playerId, Date.now(), '추가 드로우를 선택해 턴을 종료했습니다.');
  return { state, privateStates };
}

export function resolveTurnTimeout(snapshot: GameSnapshot, now = Date.now()): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  if (state.status !== 'active' || !state.currentPlayerId) return { state, privateStates };

  if (state.pendingTrap) {
    if (now < state.pendingTrap.endsAt) return { state, privateStates };
    const pending = state.pendingTrap;
    state.pendingTrap = null;
    appendLog(state, '함정 응답 시간이 지나 자동으로 “사용하지 않기”가 선택되었습니다.', 'trap');
    continueAfterTrapDecision(state, privateStates, pending, { negated: false, retaliation: 0 });
    return { state, privateStates };
  }

  if (state.pendingExtraChoice) {
    if (!state.turnEndsAt || now < state.turnEndsAt) return { state, privateStates };
    const pending = state.pendingExtraChoice;
    const card = CARD_BY_ID[pending.cardId];
    if (card?.extraChoices?.[0] && state.boards[pending.ownerId]?.units[pending.zone]) {
      state.pendingExtraChoice = null;
      applyExtraChoice(state, privateStates, pending.ownerId, pending.zone, card, 0);
      finalizeSummonPostChoice(state, privateStates, pending.ownerId, pending.zone, card);
      appendLog(state, `시간 초과로 「${card.name}」의 첫 번째 선택 효과가 자동 발동되었습니다.`, 'system');
      return { state, privateStates };
    }
    state.pendingExtraChoice = null;
  }

  repairCurrentTurnEnergy(state);
  if (state.coinToss && now < state.coinToss.endsAt) {
    if (!state.turnEndsAt) state.turnEndsAt = state.coinToss.endsAt + TURN_DURATION_MS;
    return { state, privateStates };
  }
  if (!state.turnEndsAt) {
    state.turnEndsAt = now + TURN_DURATION_MS;
    state.turnActionTaken = Boolean(state.turnActionTaken);
    return { state, privateStates };
  }
  if (now < state.turnEndsAt) return { state, privateStates };
  const expiredPlayer = state.currentPlayerId;
  appendLog(state, `${expiredPlayer.slice(0, 6)}의 제한 시간 120초가 종료되었습니다.`, 'system');
  advanceTurn(state, privateStates, expiredPlayer, now, '시간 초과로 턴이 자동 종료되었습니다.');
  return { state, privateStates };
}

export function endTurn(snapshot: GameSnapshot, playerId: string): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  assertActiveTurn(state, playerId);
  advanceTurn(state, privateStates, playerId);
  return { state, privateStates };
}

export function surrender(snapshot: GameSnapshot, playerId: string): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  if (state.status !== 'active') throw new Error('진행 중인 결투가 아닙니다.');
  const winnerId = otherPlayer(state, playerId);
  state.status = 'finished';
  state.currentPlayerId = null;
  state.turnEndsAt = null;
  state.winnerId = winnerId;
  state.winReason = '항복';
  appendLog(state, `${playerId.slice(0, 6)}이(가) 항복했습니다.`, 'victory');
  appendVisual(state, { kind: 'core', vfx: 'core-break', ownerId: playerId, targetOwnerId: playerId, label: 'SURRENDER' });
  return { state, privateStates };
}

export function sanitizeForPlayer(snapshot: GameSnapshot, playerId: string): { state: MatchState; privateState: PrivateState | null } {
  const state = clone(snapshot.state);
  const privateState = snapshot.privateStates[playerId] ? clone(snapshot.privateStates[playerId]) : null;
  return { state, privateState };
}
