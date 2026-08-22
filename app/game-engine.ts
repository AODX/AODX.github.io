import {
  CARD_BY_ID,
  CardDefinition,
  Effect,
  FusionMaterial,
  TrapTrigger,
  isUnitCard,
  randomId,
  resolveCardVfx,
} from './game-data';

export type MatchPhase = 'main' | 'battle';
export type MatchStatus = 'waiting' | 'active' | 'finished';
export type SummonOrigin = 'normal' | 'rift' | 'fusion' | 'evolution' | 'token';
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
  label?: string;
  createdAt: number;
}

export interface CoinTossState {
  side: 'solar' | 'lunar';
  winnerId: string;
  startedAt: number;
  endsAt: number;
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

function drawCards(state: MatchState, privateState: PrivateState, playerId: string, amount: number): boolean {
  for (let index = 0; index < amount; index += 1) {
    const card = privateState.deck.shift();
    if (!card) {
      state.handCounts[playerId] = privateState.hand.length;
      state.deckCounts[playerId] = privateState.deck.length;
      state.status = 'finished';
      state.winnerId = otherPlayer(state, playerId);
      state.winReason = '덱 소진';
      appendLog(state, `${playerId.slice(0, 6)}의 덱이 소진되었습니다.`, 'victory');
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

function firstOpenUnit(board: PlayerBoard): number {
  return board.units.findIndex((slot) => slot === null);
}

function firstOpenSecret(board: PlayerBoard): number {
  return board.secrets.findIndex((slot) => slot === null);
}

function findTrap(privateState: PrivateState, trigger: TrapTrigger): { index: number; instance: CardInstance; card: CardDefinition } | null {
  for (let index = 0; index < privateState.secrets.length; index += 1) {
    const instance = privateState.secrets[index];
    if (!instance) continue;
    const card = CARD_BY_ID[instance.cardId];
    if (card?.kind === 'trap' && card.trapTrigger === trigger) return { index, instance, card };
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
): void {
  const opponentId = otherPlayer(state, actorId);
  const actorPrivate = privateStates[actorId];

  switch (effect.kind) {
    case 'damage_unit': {
      if (!target) throw new Error('대상 유닛을 선택해야 합니다.');
      damageUnit(state, target.ownerId, target.unitIndex, effect.amount);
      appendVisual(state, { kind: 'defense', vfx: 'effect-impact', ownerId: actorId, targetOwnerId: target.ownerId, targetZone: target.unitIndex, amount: effect.amount, label: '효과 피해' });
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
      unit.attack += effect.attack;
      unit.health += effect.health;
      unit.maxHealth += effect.health;
      appendVisual(state, { kind: 'buff', vfx: 'unit-empower', cardId: unit.cardId, ownerId: actorId, targetOwnerId: target.ownerId, targetZone: target.unitIndex, amount: Math.max(effect.attack, effect.health), label: '유닛 강화' });
      break;
    }
    case 'shield_unit': {
      if (!target) throw new Error('대상 유닛을 선택해야 합니다.');
      const unit = state.boards[target.ownerId].units[target.unitIndex];
      if (!unit) throw new Error('대상 유닛이 없습니다.');
      unit.shield += effect.amount;
      appendVisual(state, { kind: 'buff', vfx: 'shield-rise', cardId: unit.cardId, ownerId: actorId, targetOwnerId: target.ownerId, targetZone: target.unitIndex, amount: effect.amount, label: '보호막' });
      break;
    }
    case 'aoe_enemy':
      state.boards[opponentId].units.forEach((unit, index) => {
        if (unit) damageUnit(state, opponentId, index, effect.amount);
      });
      appendVisual(state, { kind: 'defense', vfx: 'aoe-wave', ownerId: actorId, targetOwnerId: opponentId, amount: effect.amount, label: '광역 피해' });
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
      };
      appendVisual(state, { kind: 'summon', vfx: 'token-birth', ownerId: actorId, targetZone: index, label: effect.name });
      break;
    }
  }
}

function triggerTrap(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  trapOwnerId: string,
  trigger: TrapTrigger,
  target?: { ownerId: string; unitIndex: number },
): { negated: boolean; retaliation: number } {
  const trap = findTrap(privateStates[trapOwnerId], trigger);
  if (!trap || !trap.card.trapEffect) return { negated: false, retaliation: 0 };
  consumeTrap(state, privateStates[trapOwnerId], trapOwnerId, trap.index, trap.card);
  if (trap.card.trapEffect.kind === 'negate') return { negated: true, retaliation: 0 };
  if (trap.card.trapEffect.kind === 'negate_and_damage') {
    return { negated: true, retaliation: trap.card.trapEffect.amount };
  }
  applyEffect(state, privateStates, trapOwnerId, trap.card.trapEffect, target);
  return { negated: false, retaliation: 0 };
}

function destroyDefeatedUnits(state: MatchState, privateStates: Record<string, PrivateState>): void {
  for (const playerId of state.playerOrder) {
    if (!playerId) continue;
    for (let index = 0; index < state.boards[playerId].units.length; index += 1) {
      const unit = state.boards[playerId].units[index];
      if (!unit || unit.health > 0) continue;
      const card = CARD_BY_ID[unit.cardId];
      state.graveyards[playerId].push(unit.cardId);
      state.boards[playerId].units[index] = null;
      appendLog(state, `${card?.name ?? unit.cardId.replace('token:', '')}이(가) 파괴되었습니다.`, 'attack');
      appendVisual(state, {
        kind: 'destroy',
        vfx: resolveCardVfx(card, 'destroy'),
        cardId: card?.id,
        ownerId: playerId,
        targetZone: index,
        label: card?.name ?? '토큰',
      });

      triggerTrap(state, privateStates, playerId, 'friendly_destroyed');
    }
  }
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
  };
}

function afterUnitSummoned(
  state: MatchState,
  privateStates: Record<string, PrivateState>,
  playerId: string,
  zone: number,
  card: CardDefinition,
  origin: SummonOrigin,
): void {
  const opponentId = otherPlayer(state, playerId);
  const target = { ownerId: playerId, unitIndex: zone };
  triggerTrap(state, privateStates, opponentId, 'unit_summoned', target);
  if (state.boards[playerId].units[zone] && origin !== 'normal' && origin !== 'token') {
    triggerTrap(state, privateStates, opponentId, 'special_summoned', target);
  }
  if (state.boards[playerId].units[zone] && origin === 'fusion') {
    triggerTrap(state, privateStates, opponentId, 'fusion_summoned', target);
  }
  if (state.boards[playerId].units[zone] && origin === 'evolution') {
    triggerTrap(state, privateStates, opponentId, 'evolution_summoned', target);
  }
  if (card.onSummon && state.boards[playerId].units[zone]) {
    const selfTarget = { ownerId: playerId, unitIndex: zone };
    applyEffect(state, privateStates, playerId, card.onSummon, card.onSummon.kind === 'shield_unit' ? selfTarget : undefined);
  }
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
    afterUnitSummoned(state, privateStates, playerId, zone, card, origin);
  } else if (card.kind === 'spell') {
    spendEnergy(state, playerId, card.cost);
    playerPrivate.hand.splice(handIndex, 1);
    appendLog(state, `주문 「${card.name}」 발동 선언.`, 'system');
    appendVisual(state, {
      kind: 'spell',
      vfx: resolveCardVfx(card, 'activation'),
      cardId: card.id,
      ownerId: playerId,
      targetOwnerId: target?.ownerId,
      targetZone: target?.unitIndex,
      label: card.name,
    });
    const counter = triggerTrap(state, privateStates, opponentId, 'spell_played');
    if (!counter.negated && card.effect) {
      const effectTarget = card.target === 'enemy_core' ? undefined : target;
      applyEffect(state, privateStates, playerId, card.effect, effectTarget);
      appendLog(state, `주문 「${card.name}」 효과 처리 완료.`, 'system');
    } else if (counter.negated) {
      if (counter.retaliation > 0) {
        const retaliation = damageCore(state, playerId, counter.retaliation);
        statsFor(state, opponentId).coreDamage += retaliation;
        appendVisual(state, { kind: 'core', vfx: 'trap-retaliation', ownerId: opponentId, targetOwnerId: playerId, amount: retaliation, label: '함정 반격' });
      }
      appendLog(state, `주문 「${card.name}」이(가) 무효화되었습니다.`, 'trap');
    }
    state.graveyards[playerId].push(card.id);
  } else {
    spendEnergy(state, playerId, card.cost);
    const zone = Number.isInteger(requestedZone) ? Number(requestedZone) : firstOpenSecret(state.boards[playerId]);
    if (zone < 0 || zone > 4 || state.boards[playerId].secrets[zone]) throw new Error('선택한 함정 칸을 사용할 수 없습니다.');
    playerPrivate.hand.splice(handIndex, 1);
    playerPrivate.secrets[zone] = instance;
    state.boards[playerId].secrets[zone] = { occupied: true };
    appendLog(state, '함정 카드 1장을 세트했습니다.', 'system');
    appendVisual(state, {
      kind: 'set',
      vfx: 'secret-set',
      ownerId: playerId,
      targetZone: zone,
      label: '함정 세트',
    });
  }

  state.handCounts[playerId] = playerPrivate.hand.length;
  state.turnActionTaken = true;
  destroyDefeatedUnits(state, privateStates);
  checkWinner(state);
  return { state, privateStates };
}

function materialMatches(unit: UnitState, requirement: FusionMaterial): boolean {
  const card = CARD_BY_ID[unit.cardId];
  if (!card) return false;
  if (requirement.cardIds?.length && !requirement.cardIds.includes(card.id)) return false;
  if (requirement.element && card.element !== requirement.element) return false;
  if (requirement.minCost !== undefined && card.cost < requirement.minCost) return false;
  return true;
}

function canAssignFusionMaterials(units: UnitState[], requirements: FusionMaterial[], requirementIndex = 0, used = new Set<number>()): boolean {
  if (requirementIndex >= requirements.length) return true;
  for (let index = 0; index < units.length; index += 1) {
    if (used.has(index) || !materialMatches(units[index], requirements[requirementIndex])) continue;
    used.add(index);
    if (canAssignFusionMaterials(units, requirements, requirementIndex + 1, used)) return true;
    used.delete(index);
  }
  return false;
}

function evolutionMatches(unit: UnitState, card: CardDefinition): boolean {
  const recipe = card.evolutionRecipe;
  const source = CARD_BY_ID[unit.cardId];
  if (!recipe || !source) return false;
  const exactMatch = Boolean(recipe.fromIds?.includes(source.id));
  const flexibleMatch = (!recipe.element || source.element === recipe.element)
    && (recipe.minCost === undefined || source.cost >= recipe.minCost)
    && (recipe.maxCost === undefined || source.cost <= recipe.maxCost);
  return exactMatch || flexibleMatch;
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
    if (!canAssignFusionMaterials(units, requirements)) throw new Error(`융합 조건이 맞지 않습니다: ${card.fusionRecipe?.label}`);
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
    if (!evolutionMatches(evolvedSource, card)) throw new Error(`진화 조건이 맞지 않습니다: ${card.evolutionRecipe?.label}`);
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
  const origin: SummonOrigin = card.kind === 'fusion' ? 'fusion' : 'evolution';
  const unit = makeUnit(state, playerId, instance, card, origin, units.map((item) => item.cardId));
  if (card.kind === 'evolution' && evolvedSource) {
    unit.attack += inheritedAttack;
    unit.maxHealth += inheritedHealth;
    unit.health = Math.max(1, unit.maxHealth - inheritedDamage);
    unit.shield = inheritedShield;
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

  afterUnitSummoned(state, privateStates, playerId, summonZone, card, origin);
  destroyDefeatedUnits(state, privateStates);
  checkWinner(state);
  return { state, privateStates };
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

  appendVisual(state, {
    kind: 'attack',
    vfx: resolveCardVfx(attackerCard, 'attack'),
    cardId: attackerCard?.id,
    ownerId: playerId,
    targetOwnerId: opponentId,
    sourceZone: attackerIndex,
    targetZone: target.kind === 'unit' ? target.unitIndex : undefined,
    amount: attacker.attack,
    label: attackerCard?.name ?? '유닛 공격',
  });

  if (target.kind === 'core') {
    if (state.boards[opponentId].units.some(Boolean)) throw new Error('상대 필드에 유닛이 남아 있어 직접 공격할 수 없습니다.');
    appendLog(state, `${attackerCard?.name ?? '유닛'} → 상대 코어 직접 공격 선언 (${attacker.attack})`, 'attack');
    const trap = triggerTrap(state, privateStates, opponentId, 'direct_attack');
    if (trap.negated) {
      if (trap.retaliation > 0) damageUnit(state, playerId, attackerIndex, trap.retaliation);
      attacker.canAttack = false;
      appendLog(state, `${attackerCard?.name ?? '유닛'}의 직접 공격이 무효화되었습니다.`, 'trap');
    } else {
      const actualDamage = damageCore(state, opponentId, attacker.attack);
      statsFor(state, playerId).coreDamage += actualDamage;
      if (attackerCard?.keywords?.includes('lifesteal')) {
        const healed = healCore(state, playerId, actualDamage);
        statsFor(state, playerId).healing += healed;
        if (healed > 0) appendVisual(state, { kind: 'heal', vfx: 'lifesteal-return', cardId: attackerCard?.id, ownerId: playerId, targetOwnerId: playerId, sourceZone: attackerIndex, amount: healed, label: '흡수' });
      }
      attacker.canAttack = false;
      appendLog(state, `${attackerCard?.name ?? '유닛'}이(가) 코어에 ${actualDamage} 피해.`, 'attack');
      appendVisual(state, { kind: 'core', vfx: 'core-break', cardId: attackerCard?.id, ownerId: playerId, targetOwnerId: opponentId, sourceZone: attackerIndex, amount: actualDamage, label: '직접 공격' });
    }
  } else {
    if (target.unitIndex < 0 || target.unitIndex > 4) throw new Error('올바른 공격 대상을 선택하세요.');
    if (guardIndexes.length > 0 && !guardIndexes.includes(target.unitIndex)) throw new Error('수호 유닛을 먼저 공격해야 합니다.');
    const defender = state.boards[opponentId].units[target.unitIndex];
    if (!defender) throw new Error('선택한 위치에 적 유닛이 없습니다.');
    const declaredDefenderCard = CARD_BY_ID[defender.cardId];
    appendLog(state, `${attackerCard?.name ?? '유닛'} → ${declaredDefenderCard?.name ?? '적 유닛'} 공격 선언 (${attacker.attack})`, 'attack');

    triggerTrap(state, privateStates, opponentId, 'unit_attacked', { ownerId: opponentId, unitIndex: target.unitIndex });
    const defenderAfterTrap = state.boards[opponentId].units[target.unitIndex];
    if (!defenderAfterTrap) throw new Error('방어 유닛 상태가 올바르지 않습니다.');
    const defenderCard = CARD_BY_ID[defenderAfterTrap.cardId];
    const defenderDurabilityBefore = Math.max(0, defenderAfterTrap.health) + Math.max(0, defenderAfterTrap.shield);
    const attackerDamage = attacker.attack;
    const defenderDamage = defenderAfterTrap.attack;
    const defenderReport = damageUnit(state, opponentId, target.unitIndex, attackerDamage);
    const attackerReport = damageUnit(state, playerId, attackerIndex, defenderDamage);

    if (defenderReport.absorbed > 0 || !defenderReport.destroyed) {
      appendVisual(state, {
        kind: 'defense',
        vfx: resolveCardVfx(defenderCard, 'defense'),
        cardId: defenderCard?.id,
        ownerId: opponentId,
        targetZone: target.unitIndex,
        amount: defenderReport.absorbed || defenderReport.healthDamage,
        label: defenderCard?.name ?? '방어',
      });
    }
    if (attackerReport.absorbed > 0) {
      appendVisual(state, {
        kind: 'defense',
        vfx: resolveCardVfx(attackerCard, 'defense'),
        cardId: attackerCard?.id,
        ownerId: playerId,
        targetZone: attackerIndex,
        amount: attackerReport.absorbed,
        label: attackerCard?.name ?? '방어',
      });
    }

    if (attackerCard?.keywords?.includes('lifesteal')) {
      const healed = healCore(state, playerId, defenderReport.healthDamage);
      statsFor(state, playerId).healing += healed;
      if (healed > 0) appendVisual(state, { kind: 'heal', vfx: 'lifesteal-return', cardId: attackerCard?.id, ownerId: playerId, targetOwnerId: playerId, sourceZone: attackerIndex, amount: healed, label: '흡수' });
    }
    if (attackerCard?.keywords?.includes('pierce') && defenderAfterTrap.health <= 0) {
      const overflow = Math.max(0, attackerDamage - defenderDurabilityBefore);
      if (overflow > 0) {
        const pierceDamage = damageCore(state, opponentId, overflow);
        statsFor(state, playerId).coreDamage += pierceDamage;
        if (pierceDamage > 0) appendVisual(state, { kind: 'core', vfx: 'pierce-impact', cardId: attackerCard?.id, ownerId: playerId, targetOwnerId: opponentId, sourceZone: attackerIndex, amount: pierceDamage, label: '관통 피해' });
      }
    }
    attacker.canAttack = false;
    appendLog(state, `${attackerCard?.name ?? '유닛'}이(가) ${defenderCard?.name ?? '적 유닛'}에게 ${attackerDamage} 피해 · 반격 ${defenderDamage} 피해.`, 'attack');
  }

  state.turnActionTaken = true;
  destroyDefeatedUnits(state, privateStates);
  checkWinner(state);
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
