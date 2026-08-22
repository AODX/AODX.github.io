import {
  CARD_BY_ID,
  CardDefinition,
  Effect,
  FusionMaterial,
  SeriesId,
  TrapTrigger,
  isUnitCard,
  randomId,
  resolveCardVfx,
} from './game-data';

export type MatchPhase = 'main' | 'battle';
export type MatchStatus = 'waiting' | 'active' | 'finished';
export type SummonOrigin = 'normal' | 'rift' | 'fusion' | 'evolution' | 'token';
export type ExtraSummonKind = 'fusion' | 'evolution';
export type VisualEventKind = 'turn' | 'summon' | 'special' | 'fusion' | 'evolution' | 'spell' | 'trap' | 'set' | 'draw' | 'attack' | 'defense' | 'destroy' | 'core' | 'heal' | 'buff' | 'energy';

export interface CardInstance {
  instanceId: string;
  cardId: string;
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
  createdAt: number;
}

export interface CoinTossState {
  side: 'solar' | 'lunar';
  winnerId: string;
  startedAt: number;
  endsAt: number;
}

export type PendingTrapContinuation =
  | { kind: 'spell'; actorId: string; cardId: string; target?: { ownerId: string; unitIndex: number } }
  | { kind: 'summon'; actorId: string; zone: number; cardId: string; origin: SummonOrigin; remainingTriggers: TrapTrigger[] }
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
  /** Turn number when each player last converted one hand card into +1 temporary energy. */
  energySacrificeTurn?: Record<string, number>;
  /** Per-match hard cap: max 2 fusion summons and max 2 evolution summons per player. */
  extraSummonUsage?: Record<string, { fusion: number; evolution: number }>;
  /** Turn number when each extra summon type was last used, enforcing max once per turn per type. */
  extraSummonTurn?: Record<string, { fusion?: number; evolution?: number }>;
  playerOrder: [string, string] | [];
  core: Record<string, number>;
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
const CORE_MAX = 25;
export const TURN_DURATION_MS = 60_000;
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
    extraSummonUsage: { [playerA]: { fusion: 0, evolution: 0 }, [playerB]: { fusion: 0, evolution: 0 } },
    extraSummonTurn: { [playerA]: {}, [playerB]: {} },
    playerOrder: [first, second],
    core: { [playerA]: CORE_MAX, [playerB]: CORE_MAX },
    energy: {
      [playerA]: { current: playerA === first ? 1 : 0, max: playerA === first ? 1 : 0 },
      [playerB]: { current: playerB === first ? 1 : 0, max: playerB === first ? 1 : 0 },
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
  if (state.turnEndsAt && Date.now() >= state.turnEndsAt) throw new Error('턴 제한 시간 60초가 종료되었습니다.');
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
  return effect.kind === 'buff_unit' || effect.kind === 'shield_unit';
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
  appendLog(state, `함정 「${card.name}」 발동!`, 'trap');
  appendVisual(state, {
    kind: 'trap',
    vfx: resolveCardVfx(card, 'activation'),
    cardId: card.id,
    ownerId,
    label: card.name,
  });
}

function damageUnit(state: MatchState, ownerId: string, unitIndex: number, amount: number): DamageReport {
  const unit = state.boards[ownerId].units[unitIndex];
  if (!unit || amount <= 0) return { attempted: amount, absorbed: 0, healthDamage: 0, destroyed: false };
  let remaining = amount;
  let absorbed = 0;
  if (unit.shield > 0) {
    absorbed = Math.min(unit.shield, remaining);
    unit.shield -= absorbed;
    remaining -= absorbed;
  }
  const healthBefore = Math.max(0, unit.health);
  const healthDamage = Math.min(healthBefore, Math.max(0, remaining));
  if (remaining > 0) unit.health -= remaining;
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
  const after = Math.min(CORE_MAX, before + Math.max(0, amount));
  state.core[playerId] = after;
  return Math.max(0, after - before);
}

function applyEffect(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  actorId: string,
  effect: Effect,
  target?: { ownerId: string; unitIndex: number },
  sourceCard?: CardDefinition,
): void {
  const opponentId = otherPlayer(state, actorId);
  const actorPrivate = privateStates[actorId];

  switch (effect.kind) {
    case 'damage_unit': {
      if (!target) throw new Error('대상 유닛을 선택해야 합니다.');
      const report = damageUnit(state, target.ownerId, target.unitIndex, effect.amount);
      appendVisual(state, { kind: 'defense', vfx: 'effect-impact', ownerId: actorId, targetOwnerId: target.ownerId, targetZone: target.unitIndex, amount: report.absorbed + report.healthDamage, shieldAmount: report.absorbed, healthAmount: report.healthDamage, label: '효과 피해' });
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
      if (!target) throw new Error('대상 유닛을 선택해야 합니다.');
      const unit = state.boards[target.ownerId].units[target.unitIndex];
      if (!unit) throw new Error('대상 유닛이 없습니다.');
      if (sourceConsumesUnitBuffSlot(sourceCard, effect) && unit.buffCardApplied) throw new Error('이 캐릭터는 이미 버프류 카드를 1번 적용받았습니다.');
      unit.attack += effect.attack;
      unit.health += effect.health;
      unit.maxHealth += effect.health;
      if (sourceConsumesUnitBuffSlot(sourceCard, effect)) unit.buffCardApplied = true;
      appendVisual(state, { kind: 'buff', vfx: 'unit-empower', cardId: unit.cardId, ownerId: actorId, targetOwnerId: target.ownerId, targetZone: target.unitIndex, amount: Math.max(effect.attack, effect.health), label: '유닛 강화' });
      break;
    }
    case 'shield_unit': {
      if (!target) throw new Error('대상 유닛을 선택해야 합니다.');
      const unit = state.boards[target.ownerId].units[target.unitIndex];
      if (!unit) throw new Error('대상 유닛이 없습니다.');
      if (sourceConsumesUnitBuffSlot(sourceCard, effect) && unit.buffCardApplied) throw new Error('이 캐릭터는 이미 버프류 카드를 1번 적용받았습니다.');
      unit.shield += effect.amount;
      if (sourceConsumesUnitBuffSlot(sourceCard, effect)) unit.buffCardApplied = true;
      appendVisual(state, { kind: 'buff', vfx: 'shield-rise', cardId: unit.cardId, ownerId: actorId, targetOwnerId: target.ownerId, targetZone: target.unitIndex, amount: effect.amount, label: '보호막' });
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
    case 'destroy_weak': {
      if (!target) throw new Error('대상 유닛을 선택해야 합니다.');
      const unit = state.boards[target.ownerId].units[target.unitIndex];
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
  }
}

function seriesUnitCount(state: MatchState, playerId: string, seriesId: SeriesId): number {
  return state.boards[playerId].units.filter((unit) => unit && CARD_BY_ID[unit.cardId]?.seriesId === seriesId).length;
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

function applySeriesAbility(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  actorId: string,
  sourceCard: CardDefinition,
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
        appendVisual(state, { kind: 'draw', vfx, cardId: sourceCard.id, ownerId: actorId, amount: result, label: 'SERIES SEARCH' });
      }
      break;
    }
    case 'recover_series': {
      result = recoverSeriesCards(state, actorPrivate, actorId, seriesId, ability.amount, sourceCard.id);
      if (result > 0) {
        appendLog(state, `SERIES LINK — 묘지의 「${seriesName}」 카드 ${result}장을 회수했습니다.`, 'special');
        appendVisual(state, { kind: 'draw', vfx, cardId: sourceCard.id, ownerId: actorId, amount: result, label: 'SERIES RECOVER' });
      }
      break;
    }
    case 'buff_series': {
      for (const unit of state.boards[actorId].units) {
        if (!unit || CARD_BY_ID[unit.cardId]?.seriesId !== seriesId) continue;
        unit.attack += ability.attack;
        unit.health += ability.health;
        unit.maxHealth += ability.health;
        result += 1;
      }
      if (result > 0) {
        appendLog(state, `SERIES LINK — 「${seriesName}」 유닛 ${result}장이 강화되었습니다.`, 'special');
        appendVisual(state, { kind: 'buff', vfx, cardId: sourceCard.id, ownerId: actorId, amount: Math.max(ability.attack, ability.health), label: 'SERIES BOOST' });
      }
      break;
    }
    case 'shield_series': {
      for (const unit of state.boards[actorId].units) {
        if (!unit || CARD_BY_ID[unit.cardId]?.seriesId !== seriesId) continue;
        unit.shield += ability.amount;
        result += 1;
      }
      if (result > 0) {
        appendLog(state, `SERIES LINK — 「${seriesName}」 유닛 ${result}장에 보호막 ${ability.amount}.`, 'special');
        appendVisual(state, { kind: 'buff', vfx, cardId: sourceCard.id, ownerId: actorId, amount: ability.amount, label: 'SERIES SHIELD' });
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
        appendVisual(state, { kind: 'energy', vfx, cardId: sourceCard.id, ownerId: actorId, amount: result, label: 'SERIES ENERGY' });
      }
      break;
    }
  }
}

type TrapResolution = { negated: boolean; retaliation: number };

function applyTacticalOnSummon(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  playerId: string,
  zone: number,
  card: CardDefinition,
): void {
  if (!card.seriesId) return;
  const unit = state.boards[playerId].units[zone];
  if (!unit) return;
  const allies = state.boards[playerId].units
    .map((item, index) => ({ item, index, card: item ? CARD_BY_ID[item.cardId] : undefined }))
    .filter(({ item, index, card: allyCard }) => item && index !== zone && allyCard?.seriesId === card.seriesId);
  const opponentId = otherPlayer(state, playerId);

  switch (card.seriesId) {
    case 'luminaknights':
      if (allies.length > 0) {
        unit.attack += 1; unit.health += 1; unit.maxHealth += 1;
        appendLog(state, `전술 · 집결 출격 — 「${card.name}」 +1/+1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-rally', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '집결 출격' });
      }
      break;
    case 'kaisergear':
      if (allies.length > 0) {
        unit.shield += 1;
        appendLog(state, `전술 · 중장 장갑 — 「${card.name}」 보호막 1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-armor', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '중장 장갑' });
      }
      break;
    case 'arborian':
      if (allies.length > 0) {
        const target = allies.sort((a, b) => (a.item?.health ?? 99) - (b.item?.health ?? 99))[0];
        if (target.item) {
          target.item.health += 1; target.item.maxHealth += 1;
          appendLog(state, '전술 · 생장 맥동 — 기존 아르보리아 유닛의 체력이 성장했습니다.', 'special');
          appendVisual(state, { kind: 'buff', vfx: 'tactical-growth', cardId: target.card?.id, ownerId: playerId, targetZone: target.index, amount: 1, label: '생장 맥동' });
        }
      }
      break;
    case 'tempest_drive':
      if (allies.length > 0 && !unit.canAttack) {
        unit.canAttack = true;
        appendLog(state, `전술 · 애프터버너 — 「${card.name}」이(가) 즉시 공격 가능 상태가 되었습니다.`, 'special');
        appendVisual(state, { kind: 'energy', vfx: 'tactical-afterburner', cardId: card.id, ownerId: playerId, targetZone: zone, label: '애프터버너' });
      }
      break;
    case 'primal_guardian':
      if (allies.length > 0) {
        unit.shield += 1; unit.health += 1; unit.maxHealth += 1;
        appendLog(state, `전술 · 군집 수호 — 「${card.name}」 보호막 1 · 체력 +1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-packguard', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '군집 수호' });
      }
      break;
    case 'chronorium':
      if ((state.energy[playerId]?.current ?? 0) >= 2) {
        unit.attack += 1; unit.shield += 1;
        appendLog(state, `전술 · 시간 선점 — 「${card.name}」 공격력 +1 · 보호막 1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-chrono', cardId: card.id, ownerId: playerId, targetZone: zone, amount: 1, label: '시간 선점' });
      }
      break;
    case 'arcana_protocol': {
      const spellCount = (state.graveyards[playerId] ?? []).filter((id) => CARD_BY_ID[id]?.kind === 'spell').length;
      if (spellCount >= 2 && drawCards(state, privateStates[playerId], playerId, 1)) {
        appendLog(state, `전술 · 규약 재기록 — 「${card.name}」 효과로 카드 1장 드로우.`, 'special');
        appendVisual(state, { kind: 'draw', vfx: 'tactical-protocol', cardId: card.id, ownerId: playerId, amount: 1, label: '규약 재기록' });
      }
      break;
    }
    case 'astral_armada': {
      const formation = state.boards[playerId].units.filter((item) => item && CARD_BY_ID[item.cardId]?.seriesId === 'astral_armada');
      if (formation.length >= 2) {
        for (const ally of formation) if (ally) ally.shield += 1;
        appendLog(state, `전술 · 편대 방벽 — 아스트라 아르마다 ${formation.length}장에 보호막 1.`, 'special');
        appendVisual(state, { kind: 'buff', vfx: 'tactical-formation', cardId: card.id, ownerId: playerId, amount: 1, label: '편대 방벽' });
      }
      break;
    }
    default:
      void opponentId;
      break;
  }
}

function applyTacticalOnAttackStart(state: MatchState, playerId: string, attackerIndex: number): number {
  const attacker = state.boards[playerId].units[attackerIndex];
  if (!attacker) return 0;
  const card = CARD_BY_ID[attacker.cardId];
  if (!card?.seriesId) return 0;
  const opponentId = otherPlayer(state, playerId);
  if (card.seriesId === 'nocturne' && (state.core[playerId] ?? 0) < (state.core[opponentId] ?? 0)) {
    const healed = healCore(state, playerId, 1);
    if (healed > 0) {
      statsFor(state, playerId).healing += healed;
      appendLog(state, `전술 · 월영 회귀 — 「${card.name}」 공격 선언으로 코어 1 회복.`, 'special');
      appendVisual(state, { kind: 'heal', vfx: 'tactical-moon-return', cardId: card.id, ownerId: playerId, targetOwnerId: playerId, sourceZone: attackerIndex, amount: healed, label: '월영 회귀' });
    }
  }
  if (card.seriesId === 'beastforge' && attacker.shield > 0) {
    appendLog(state, `전술 · 합금 충격 — 「${card.name}」의 이번 공격 피해 +1.`, 'special');
    return 1;
  }
  return 0;
}

function applyTacticalOnKill(state: MatchState, playerId: string, attackerIndex: number): void {
  const attacker = state.boards[playerId].units[attackerIndex];
  const card = attacker ? CARD_BY_ID[attacker.cardId] : undefined;
  if (card?.seriesId !== 'abyss_reaper') return;
  const healed = healCore(state, playerId, 1);
  if (healed <= 0) return;
  statsFor(state, playerId).healing += healed;
  appendLog(state, `전술 · 포식 반향 — 「${card.name}」이(가) 적을 파괴해 코어 1 회복.`, 'special');
  appendVisual(state, { kind: 'heal', vfx: 'tactical-devour', cardId: card.id, ownerId: playerId, targetOwnerId: playerId, sourceZone: attackerIndex, amount: healed, label: '포식 반향' });
}

function applyTacticalOnDestroyed(state: MatchState, ownerId: string, card: CardDefinition | undefined): void {
  if (card?.seriesId !== 'eclipsion') return;
  if ((state.graveyards[ownerId]?.length ?? 0) < 4) return;
  const opponentId = otherPlayer(state, ownerId);
  const actual = damageCore(state, opponentId, 1);
  if (actual <= 0) return;
  statsFor(state, ownerId).coreDamage += actual;
  appendLog(state, `전술 · 잔향 포식 — 「${card.name}」의 파괴 잔향이 상대 코어에 1 피해.`, 'special');
  appendVisual(state, { kind: 'core', vfx: 'tactical-echo', cardId: card.id, ownerId, targetOwnerId: opponentId, amount: actual, label: '잔향 포식' });
}

function applyTacticalOnTrap(state: MatchState, trapOwnerId: string, trapCard: CardDefinition): void {
  if (trapCard.seriesId !== 'phantom_carnival') return;
  const targetIndex = state.boards[trapOwnerId].units.findIndex((unit) => unit && CARD_BY_ID[unit.cardId]?.seriesId === 'phantom_carnival');
  if (targetIndex < 0) return;
  const unit = state.boards[trapOwnerId].units[targetIndex];
  if (!unit) return;
  unit.attack += 1; unit.health += 1; unit.maxHealth += 1;
  const targetCard = CARD_BY_ID[unit.cardId];
  appendLog(state, `전술 · 앙코르 트릭 — 「${targetCard?.name ?? '팬텀 유닛'}」 +1/+1.`, 'special');
  appendVisual(state, { kind: 'buff', vfx: 'tactical-encore', cardId: targetCard?.id, ownerId: trapOwnerId, targetZone: targetIndex, amount: 1, label: '앙코르 트릭' });
}

function activateTrapAt(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  trapOwnerId: string,
  trigger: TrapTrigger,
  trapIndex: number,
  target?: { ownerId: string; unitIndex: number },
): TrapResolution {
  const instance = privateStates[trapOwnerId]?.secrets[trapIndex];
  const card = instance ? CARD_BY_ID[instance.cardId] : undefined;
  if (!instance || !card || card.kind !== 'trap' || card.trapTrigger !== trigger || !card.trapEffect) {
    throw new Error('발동할 수 있는 함정 카드를 찾을 수 없습니다.');
  }
  consumeTrap(state, privateStates[trapOwnerId], trapOwnerId, trapIndex, card);
  applyTacticalOnTrap(state, trapOwnerId, card);
  if (card.trapEffect.kind === 'negate') {
    applySeriesAbility(state, privateStates, trapOwnerId, card);
    return { negated: true, retaliation: 0 };
  }
  if (card.trapEffect.kind === 'negate_and_damage') {
    applySeriesAbility(state, privateStates, trapOwnerId, card);
    return { negated: true, retaliation: card.trapEffect.amount };
  }
  applyEffect(state, privateStates, trapOwnerId, card.trapEffect, target, card);
  applySeriesAbility(state, privateStates, trapOwnerId, card);
  return { negated: false, retaliation: 0 };
}

function openTrapWindow(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  trapOwnerId: string,
  trigger: TrapTrigger,
  continuation: PendingTrapContinuation,
  target?: { ownerId: string; unitIndex: number },
): boolean {
  if (state.pendingTrap) return true;
  const trap = findTrap(privateStates[trapOwnerId], trigger, (card) => {
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

function validateTarget(state: MatchState, actorId: string, card: CardDefinition, target?: { ownerId: string; unitIndex: number }): void {
  const opponentId = otherPlayer(state, actorId);
  if (card.target === 'none' || card.target === 'enemy_core') return;
  if (!target || target.unitIndex < 0 || target.unitIndex > 4) throw new Error('올바른 대상 유닛을 선택하세요.');
  const unit = state.boards[target.ownerId]?.units[target.unitIndex];
  if (!unit) throw new Error('선택한 위치에 유닛이 없습니다.');
  if (card.target === 'enemy_unit' && target.ownerId !== opponentId) throw new Error('적 유닛을 선택해야 합니다.');
  if (card.target === 'friendly_unit' && target.ownerId !== actorId) throw new Error('아군 유닛을 선택해야 합니다.');
}

function riftConditionMet(state: MatchState, playerId: string, card: CardDefinition): boolean {
  const condition = card.riftCondition;
  if (!condition) return false;
  const opponentId = otherPlayer(state, playerId);
  const myUnits = state.boards[playerId].units.filter(Boolean);
  const enemyUnits = state.boards[opponentId].units.filter(Boolean);
  switch (condition.kind) {
    case 'empty_board': return myUnits.length === 0;
    case 'core_below': return (state.core[playerId] ?? CORE_MAX) <= condition.value;
    case 'opponent_more_units': return enemyUnits.length > myUnits.length;
    case 'graveyard_min': return (state.graveyards[playerId]?.length ?? 0) >= condition.value;
    case 'ally_element': return myUnits.some((unit) => CARD_BY_ID[unit?.cardId ?? '']?.element === condition.element);
  }
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
  return {
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
}

function summonReactionTriggers(origin: SummonOrigin): TrapTrigger[] {
  const triggers: TrapTrigger[] = ['unit_summoned'];
  if (origin !== 'normal' && origin !== 'token') triggers.push('special_summoned');
  if (origin === 'fusion') triggers.push('fusion_summoned');
  if (origin === 'evolution') triggers.push('evolution_summoned');
  return triggers;
}

function continueSummonResolution(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  continuation: Extract<PendingTrapContinuation, { kind: 'summon' }>,
  trapResult: TrapResolution = { negated: false, retaliation: 0 },
): void {
  const { actorId, zone, cardId, origin } = continuation;
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

  if (card.onSummon && state.boards[actorId].units[zone]) {
    const selfTarget = { ownerId: actorId, unitIndex: zone };
    applyEffect(state, privateStates, actorId, card.onSummon, card.onSummon.kind === 'shield_unit' ? selfTarget : undefined);
  }
  if (state.boards[actorId].units[zone]) {
    applySeriesAbility(state, privateStates, actorId, card);
    applyTacticalOnSummon(state, privateStates, actorId, zone, card);
  }
  destroyDefeatedUnits(state, privateStates);
  checkWinner(state);
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
    applySeriesAbility(state, privateStates, continuation.actorId, card);
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
}

export function playCard(
  snapshot: GameSnapshot,
  playerId: string,
  instanceId: string,
  requestedZone?: number,
  target?: { ownerId: string; unitIndex: number },
): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  assertActiveTurn(state, playerId);
  if (state.phase !== 'main') throw new Error('메인 단계에서만 카드를 사용할 수 있습니다.');

  const playerPrivate = privateStates[playerId];
  const { index: handIndex, instance, card } = getCardFromHand(playerPrivate, instanceId);
  if (card.kind === 'fusion' || card.kind === 'evolution') throw new Error('융합·진화 카드는 엑스트라 덱에서 소환해야 합니다.');
  validateTarget(state, playerId, card, target);
  if (card.kind === 'spell' && card.effect && isBuffCardEffect(card.effect) && target) {
    const targetUnit = state.boards[target.ownerId]?.units[target.unitIndex];
    if (targetUnit?.buffCardApplied) throw new Error('이 캐릭터는 이미 버프류 카드를 1번 적용받았습니다. 다른 캐릭터를 선택하세요.');
  }
  const opponentId = otherPlayer(state, playerId);

  statsFor(state, playerId).cardsPlayed += 1;

  if (card.kind === 'unit') {
    const isRift = card.summonMode === 'rift';
    if (isRift && !riftConditionMet(state, playerId, card)) {
      throw new Error(`균열 소환 조건이 충족되지 않았습니다: ${card.riftCondition?.label ?? '조건 확인 필요'}`);
    }
    spendEnergy(state, playerId, isRift ? (card.riftCost ?? card.cost) : card.cost);
    const zone = Number.isInteger(requestedZone) ? Number(requestedZone) : firstOpenUnit(state.boards[playerId]);
    if (zone < 0 || zone > 4 || state.boards[playerId].units[zone]) throw new Error('선택한 유닛 칸을 사용할 수 없습니다.');
    playerPrivate.hand.splice(handIndex, 1);
    const origin: SummonOrigin = isRift ? 'rift' : 'normal';
    statsFor(state, playerId).unitsSummoned += 1;
    if (isRift) statsFor(state, playerId).specialSummons += 1;
    state.boards[playerId].units[zone] = makeUnit(state, playerId, instance, card, origin);
    appendLog(state, isRift ? `균열 소환 — 「${card.name}」!` : `${card.name} 소환.`, isRift ? 'special' : 'system');
    appendVisual(state, {
      kind: isRift ? 'special' : 'summon',
      vfx: resolveCardVfx(card, 'summon'),
      cardId: card.id,
      ownerId: playerId,
      targetZone: zone,
      label: card.name,
    });
    continueSummonResolution(state, privateStates, {
      kind: 'summon', actorId: playerId, zone, cardId: card.id, origin, remainingTriggers: summonReactionTriggers(origin),
    });
  } else if (card.kind === 'spell') {
    spendEnergy(state, playerId, card.cost);
    playerPrivate.hand.splice(handIndex, 1);
    appendLog(state, `주문 「${card.name}」 발동 선언.`, 'system');
    appendVisual(state, {
      kind: 'spell', vfx: resolveCardVfx(card, 'activation'), cardId: card.id, ownerId: playerId,
      targetOwnerId: target?.ownerId, targetZone: target?.unitIndex, label: card.name,
    });
    const continuation: Extract<PendingTrapContinuation, { kind: 'spell' }> = { kind: 'spell', actorId: playerId, cardId: card.id, target };
    if (!openTrapWindow(state, privateStates, opponentId, 'spell_played', continuation, target)) {
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
  state.turnActionTaken = true;
  if (!state.pendingTrap) {
    destroyDefeatedUnits(state, privateStates);
    checkWinner(state);
  }
  return { state, privateStates };
}

function fusionMaterialMinimumCost(card: CardDefinition): number {
  return card.rarity === 'legendary' ? 4 : 3;
}

function materialMatches(unit: UnitState, requirement: FusionMaterial, fusionCard: CardDefinition): boolean {
  const card = CARD_BY_ID[unit.cardId];
  if (!card) return false;
  if (requirement.cardIds?.length && !requirement.cardIds.includes(card.id)) return false;
  if (requirement.element && card.element !== requirement.element) return false;
  const requiredMinCost = Math.max(requirement.minCost ?? 0, fusionMaterialMinimumCost(fusionCard));
  if (card.cost < requiredMinCost) return false;
  return true;
}

function canAssignFusionMaterials(units: UnitState[], requirements: FusionMaterial[], fusionCard: CardDefinition, requirementIndex = 0, used = new Set<number>()): boolean {
  if (requirementIndex >= requirements.length) return true;
  for (let index = 0; index < units.length; index += 1) {
    if (used.has(index) || !materialMatches(units[index], requirements[requirementIndex], fusionCard)) continue;
    used.add(index);
    if (canAssignFusionMaterials(units, requirements, fusionCard, requirementIndex + 1, used)) return true;
    used.delete(index);
  }
  return false;
}

function evolutionMatches(unit: UnitState, card: CardDefinition, turnNumber: number): boolean {
  const recipe = card.evolutionRecipe;
  const source = CARD_BY_ID[unit.cardId];
  if (!recipe || !source) return false;
  // Evolution is intentionally slower now: the source must survive at least one turn.
  if (unit.summonedTurn >= turnNumber) return false;
  // If a named predecessor exists, only that exact predecessor can evolve. This closes
  // the old broad "same element + low cost" shortcut that made some evolutions trivial.
  if (recipe.fromIds?.length) return recipe.fromIds.includes(source.id);
  const hardenedMinCost = Math.max(recipe.minCost ?? 0, 3);
  return (!recipe.element || source.element === recipe.element)
    && source.cost >= hardenedMinCost
    && (recipe.maxCost === undefined || source.cost <= recipe.maxCost);
}

export function summonExtra(
  snapshot: GameSnapshot,
  playerId: string,
  extraInstanceId: string,
  materialZones: number[],
): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  assertActiveTurn(state, playerId);
  if (state.phase !== 'main') throw new Error('메인 단계에서만 융합·진화할 수 있습니다.');

  const playerPrivate = privateStates[playerId];
  const { index: extraIndex, instance, card } = getCardFromExtra(playerPrivate, extraInstanceId);
  if (card.kind !== 'fusion' && card.kind !== 'evolution') throw new Error('엑스트라 덱의 융합·진화 카드만 소환할 수 있습니다.');
  const extraKind: ExtraSummonKind = card.kind;
  assertExtraSummonAvailable(state, playerId, extraKind);
  const uniqueZones = Array.from(new Set(materialZones.map(Number))).filter((zone) => Number.isInteger(zone) && zone >= 0 && zone <= 4);
  const units = uniqueZones.map((zone) => state.boards[playerId].units[zone]).filter((unit): unit is UnitState => Boolean(unit));

  let summonZone = -1;
  let evolvedSource: UnitState | null = null;
  let inheritedAttack = 0;
  let inheritedHealth = 0;
  let inheritedDamage = 0;
  let inheritedShield = 0;

  if (card.kind === 'fusion') {
    const requirements = card.fusionRecipe?.materials ?? [];
    if (requirements.length < 2) throw new Error('융합 소재 정보가 올바르지 않습니다.');
    if (uniqueZones.length !== requirements.length || units.length !== requirements.length) {
      throw new Error(`융합 소재 ${requirements.length}장을 선택하세요.`);
    }
    if (!canAssignFusionMaterials(units, requirements, card)) throw new Error(`융합 조건이 맞지 않습니다: ${card.fusionRecipe?.label} · 각 소재 비용 ${fusionMaterialMinimumCost(card)} 이상 필요`);
    spendEnergy(state, playerId, card.cost);
    summonZone = uniqueZones[0];
    for (const zone of uniqueZones) {
      const material = state.boards[playerId].units[zone];
      if (!material) continue;
      state.graveyards[playerId].push(material.cardId);
      state.boards[playerId].units[zone] = null;
    }
  } else {
    if (uniqueZones.length !== 1 || units.length !== 1) throw new Error('진화시킬 아군 유닛 1장을 선택하세요.');
    evolvedSource = units[0];
    if (!evolutionMatches(evolvedSource, card, state.turnNumber)) throw new Error(`진화 조건이 맞지 않습니다: ${card.evolutionRecipe?.label} · 지정 원본이 이전 턴부터 생존해야 합니다.`);
    spendEnergy(state, playerId, card.cost);
    summonZone = uniqueZones[0];
    const sourceCard = CARD_BY_ID[evolvedSource.cardId];
    inheritedAttack = Math.max(0, evolvedSource.attack - (sourceCard?.attack ?? evolvedSource.attack));
    inheritedHealth = Math.max(0, evolvedSource.maxHealth - (sourceCard?.health ?? evolvedSource.maxHealth));
    inheritedDamage = Math.max(0, evolvedSource.maxHealth - evolvedSource.health);
    inheritedShield = evolvedSource.shield;
    state.graveyards[playerId].push(evolvedSource.cardId);
    state.boards[playerId].units[summonZone] = null;
  }

  playerPrivate.extra.splice(extraIndex, 1);
  recordExtraSummon(state, playerId, extraKind);
  const origin: SummonOrigin = card.kind === 'fusion' ? 'fusion' : 'evolution';
  const unit = makeUnit(state, playerId, instance, card, origin, units.map((item) => item.cardId));
  if (card.kind === 'evolution' && evolvedSource) {
    unit.attack += inheritedAttack;
    unit.maxHealth += inheritedHealth;
    unit.health = Math.max(1, unit.maxHealth - inheritedDamage);
    unit.shield = inheritedShield;
    unit.buffCardApplied = Boolean(evolvedSource.buffCardApplied);
    unit.canAttack = Boolean(card.keywords?.includes('charge')) || (evolvedSource.canAttack && evolvedSource.summonedTurn < state.turnNumber);
  }
  state.boards[playerId].units[summonZone] = unit;
  state.extraCounts[playerId] = playerPrivate.extra.length;
  state.turnActionTaken = true;
  statsFor(state, playerId).cardsPlayed += 1;
  statsFor(state, playerId).unitsSummoned += 1;
  statsFor(state, playerId).specialSummons += 1;

  if (card.kind === 'fusion') {
    appendLog(state, `공명 융합 — 「${card.name}」 강림!`, 'fusion');
    appendVisual(state, { kind: 'fusion', vfx: resolveCardVfx(card, 'summon'), cardId: card.id, ownerId: playerId, targetZone: summonZone, label: card.name });
  } else {
    appendLog(state, `계승 진화 — 「${card.name}」 각성!`, 'evolution');
    appendVisual(state, { kind: 'evolution', vfx: resolveCardVfx(card, 'summon'), cardId: card.id, ownerId: playerId, targetZone: summonZone, label: card.name });
  }

  continueSummonResolution(state, privateStates, {
    kind: 'summon', actorId: playerId, zone: summonZone, cardId: card.id, origin, remainingTriggers: summonReactionTriggers(origin),
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
  if (energy.current >= 10) throw new Error('현재 에너지가 이미 최대 10입니다.');

  const playerPrivate = privateStates[playerId];
  const { index, card } = getCardFromHand(playerPrivate, instanceId);
  playerPrivate.hand.splice(index, 1);
  state.graveyards[playerId].push(card.id);
  state.handCounts[playerId] = playerPrivate.hand.length;
  energy.current = Math.min(10, energy.current + 1);
  if (!state.energySacrificeTurn) state.energySacrificeTurn = {};
  state.energySacrificeTurn[playerId] = state.turnNumber;
  state.turnActionTaken = true;

  appendLog(state, `에너지 전환 — 손패의 「${card.name}」을(를) 묘지로 보내 이번 턴 에너지 +1.`, 'system');
  appendVisual(state, { kind: 'energy', vfx: 'hand-sacrifice-energy', cardId: card.id, ownerId: playerId, targetOwnerId: playerId, amount: 1, label: '손패 → 에너지' });
  return { state, privateStates, message: '손패 1장을 묘지로 보내 에너지 1을 얻었습니다.' };
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
  const defenderDamage = defender.attack;
  const defenderReport = damageUnit(state, opponentId, continuation.targetIndex, attackerDamage);
  const attackerReport = damageUnit(state, playerId, continuation.attackerIndex, defenderDamage);

  if (defenderReport.absorbed > 0 || defenderReport.healthDamage > 0) {
    appendVisual(state, { kind: 'defense', vfx: resolveCardVfx(defenderCard, 'defense'), cardId: defenderCard?.id, ownerId: playerId, targetOwnerId: opponentId, targetZone: continuation.targetIndex, amount: defenderReport.absorbed + defenderReport.healthDamage, shieldAmount: defenderReport.absorbed, healthAmount: defenderReport.healthDamage, label: defenderCard?.name ?? '피해' });
  }
  if (attackerReport.absorbed > 0 || attackerReport.healthDamage > 0) {
    appendVisual(state, { kind: 'defense', vfx: resolveCardVfx(attackerCard, 'defense'), cardId: attackerCard?.id, ownerId: opponentId, targetOwnerId: playerId, targetZone: continuation.attackerIndex, amount: attackerReport.absorbed + attackerReport.healthDamage, shieldAmount: attackerReport.absorbed, healthAmount: attackerReport.healthDamage, label: attackerCard?.name ?? '반격 피해' });
  }
  if (attackerCard?.keywords?.includes('lifesteal')) {
    const healed = healCore(state, playerId, defenderReport.healthDamage);
    statsFor(state, playerId).healing += healed;
    if (healed > 0) appendVisual(state, { kind: 'heal', vfx: 'lifesteal-return', cardId: attackerCard?.id, ownerId: playerId, targetOwnerId: playerId, sourceZone: continuation.attackerIndex, amount: healed, label: '흡수' });
  }
  if (attackerCard?.keywords?.includes('pierce') && defender.health <= 0) {
    const overflow = Math.max(0, attackerDamage - defenderDurabilityBefore);
    if (overflow > 0) {
      const pierceDamage = damageCore(state, opponentId, overflow);
      statsFor(state, playerId).coreDamage += pierceDamage;
      if (pierceDamage > 0) appendVisual(state, { kind: 'core', vfx: 'pierce-impact', cardId: attackerCard?.id, ownerId: playerId, targetOwnerId: opponentId, sourceZone: continuation.attackerIndex, amount: pierceDamage, label: '관통 피해' });
    }
  }
  if (defenderReport.destroyed) applyTacticalOnKill(state, playerId, continuation.attackerIndex);
  attacker.canAttack = false;
  appendLog(state, `${attackerCard?.name ?? '유닛'}이(가) ${defenderCard?.name ?? '적 유닛'}에게 ${attackerDamage} 피해 · 반격 ${defenderDamage} 피해.`, 'attack');
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
  appendVisual(state, {
    kind: 'attack', vfx: resolveCardVfx(attackerCard, 'attack'), cardId: attackerCard?.id, ownerId: playerId,
    targetOwnerId: opponentId, sourceZone: attackerIndex, targetZone: target.kind === 'unit' ? target.unitIndex : undefined,
    amount: attacker.attack + bonusDamage, label: attackerCard?.name ?? '유닛 공격',
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

function expectedEnergyMax(state: MatchState, playerId: string, turnNumber = state.turnNumber): number {
  if (!state.firstPlayerId) return Math.min(10, Math.max(1, Math.ceil(turnNumber / 2)));
  const personalTurn = playerId === state.firstPlayerId
    ? Math.ceil(turnNumber / 2)
    : Math.floor(turnNumber / 2);
  return Math.min(10, Math.max(0, personalTurn));
}

function repairCurrentTurnEnergy(state: MatchState): boolean {
  const playerId = state.currentPlayerId;
  if (!playerId || state.status !== 'active') return false;
  const expected = expectedEnergyMax(state, playerId);
  const energy = state.energy[playerId] ?? { current: 0, max: 0 };
  if (energy.max >= expected) return false;
  const beforeMax = energy.max;
  energy.max = expected;
  // Old rooms created before the energy-growth fix can enter a turn with a stale max.
  // Only refill the newly unlocked amount when no action has been taken yet.
  if (!state.turnActionTaken) energy.current = Math.min(expected, Math.max(energy.current + (expected - beforeMax), expected));
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
  const nextEnergy = state.energy[nextPlayer] ?? { current: 0, max: 0 };
  // Energy grows once whenever that player receives a new turn: 1, 2, 3 ... up to 10.
  // Deriving it from turn number also repairs stale rooms instead of relying on old state.
  nextEnergy.max = expectedEnergyMax(state, nextPlayer, state.turnNumber);
  nextEnergy.current = nextEnergy.max;
  state.energy[nextPlayer] = nextEnergy;
  state.boards[nextPlayer].units.forEach((unit) => {
    if (unit) unit.canAttack = true;
  });
  appendVisual(state, { kind: 'turn', vfx: 'turn-shift', ownerId: nextPlayer, label: `TURN ${state.turnNumber}` });
  const drew = drawCards(state, privateStates[nextPlayer], nextPlayer, 1);
  if (drew && state.status === 'active') {
    appendVisual(state, { kind: 'draw', vfx: 'turn-draw', ownerId: nextPlayer, label: '턴 시작 드로우' });
  }
  if (reason) appendLog(state, reason, 'system');
  if (drew && state.status === 'active') appendLog(state, `${nextPlayer.slice(0, 6)}의 턴 시작 · 카드 1장 드로우 · 에너지 ${nextEnergy.current}/${nextEnergy.max}.`, 'system');
  if (state.status !== 'active') state.turnEndsAt = null;
  checkWinner(state);
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
  appendLog(state, `${expiredPlayer.slice(0, 6)}의 제한 시간 60초가 종료되었습니다.`, 'system');
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
