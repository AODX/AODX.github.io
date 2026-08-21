import { CARD_BY_ID, CardDefinition, Effect, randomId } from './game-data';

export type MatchPhase = 'main' | 'battle';
export type MatchStatus = 'waiting' | 'active' | 'finished';

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

export interface MatchLog {
  id: string;
  text: string;
  tone: 'normal' | 'attack' | 'system' | 'trap' | 'victory';
  createdAt: number;
}

export interface MatchState {
  status: MatchStatus;
  phase: MatchPhase;
  turnNumber: number;
  currentPlayerId: string | null;
  firstPlayerId: string | null;
  playerOrder: [string, string] | [];
  core: Record<string, number>;
  energy: Record<string, EnergyState>;
  boards: Record<string, PlayerBoard>;
  handCounts: Record<string, number>;
  deckCounts: Record<string, number>;
  graveyards: Record<string, string[]>;
  logs: MatchLog[];
  winnerId: string | null;
  winReason: string | null;
}

export interface PrivateState {
  deck: CardInstance[];
  hand: CardInstance[];
  secrets: Array<CardInstance | null>;
}

export interface GameSnapshot {
  state: MatchState;
  privateStates: Record<string, PrivateState>;
}

export interface ActionResult extends GameSnapshot {
  message?: string;
}

const MAX_LOGS = 80;
const CORE_MAX = 25;

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function appendLog(state: MatchState, text: string, tone: MatchLog['tone'] = 'normal'): void {
  state.logs.push({ id: randomId('log'), text, tone, createdAt: Date.now() });
  if (state.logs.length > MAX_LOGS) state.logs.splice(0, state.logs.length - MAX_LOGS);
}

function otherPlayer(state: MatchState, playerId: string): string {
  const [a, b] = state.playerOrder;
  if (!a || !b) throw new Error('플레이어 구성이 완료되지 않았습니다.');
  return a === playerId ? b : a;
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const random = new Uint32Array(1);
    globalThis.crypto.getRandomValues(random);
    const j = random[0] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function buildInstances(cardIds: string[]): CardInstance[] {
  return shuffle(cardIds.map((cardId) => ({ instanceId: randomId('ci'), cardId })));
}

function emptyBoard(): PlayerBoard {
  return {
    units: Array.from({ length: 5 }, () => null),
    secrets: Array.from({ length: 5 }, () => null),
  };
}

function createPrivate(cardIds: string[]): PrivateState {
  return {
    deck: buildInstances(cardIds),
    hand: [],
    secrets: Array.from({ length: 5 }, () => null),
  };
}

function drawCards(state: MatchState, privateState: PrivateState, playerId: string, amount: number): boolean {
  for (let i = 0; i < amount; i += 1) {
    const card = privateState.deck.shift();
    if (!card) {
      state.status = 'finished';
      state.winnerId = otherPlayer(state, playerId);
      state.winReason = '덱 소진';
      appendLog(state, `${playerId.slice(0, 6)}의 덱이 소진되었습니다.`, 'victory');
      return false;
    }
    privateState.hand.push(card);
  }
  state.handCounts[playerId] = privateState.hand.length;
  state.deckCounts[playerId] = privateState.deck.length;
  return true;
}

export function initializeMatch(playerA: string, deckA: string[], playerB: string, deckB: string[]): GameSnapshot {
  const random = new Uint32Array(1);
  globalThis.crypto.getRandomValues(random);
  const first = random[0] % 2 === 0 ? playerA : playerB;
  const second = first === playerA ? playerB : playerA;

  const privateStates: Record<string, PrivateState> = {
    [playerA]: createPrivate(deckA),
    [playerB]: createPrivate(deckB),
  };

  const state: MatchState = {
    status: 'active',
    phase: 'main',
    turnNumber: 1,
    currentPlayerId: first,
    firstPlayerId: first,
    playerOrder: [first, second],
    core: { [playerA]: CORE_MAX, [playerB]: CORE_MAX },
    energy: {
      [playerA]: { current: playerA === first ? 1 : 0, max: playerA === first ? 1 : 0 },
      [playerB]: { current: playerB === first ? 1 : 0, max: playerB === first ? 1 : 0 },
    },
    boards: { [playerA]: emptyBoard(), [playerB]: emptyBoard() },
    handCounts: { [playerA]: 0, [playerB]: 0 },
    deckCounts: { [playerA]: privateStates[playerA].deck.length, [playerB]: privateStates[playerB].deck.length },
    graveyards: { [playerA]: [], [playerB]: [] },
    logs: [],
    winnerId: null,
    winReason: null,
  };

  drawCards(state, privateStates[playerA], playerA, 5);
  drawCards(state, privateStates[playerB], playerB, 5);
  appendLog(state, '결투가 시작되었습니다.', 'system');
  appendLog(state, `${first.slice(0, 6)}의 선공입니다.`, 'system');
  return { state, privateStates };
}

function assertActiveTurn(state: MatchState, playerId: string): void {
  if (state.status !== 'active') throw new Error('이미 종료된 결투입니다.');
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

function spendEnergy(state: MatchState, playerId: string, amount: number): void {
  const energy = state.energy[playerId];
  if (!energy || energy.current < amount) throw new Error('에너지가 부족합니다.');
  energy.current -= amount;
}

function firstOpenUnit(board: PlayerBoard): number {
  return board.units.findIndex((slot) => slot === null);
}

function firstOpenSecret(board: PlayerBoard): number {
  return board.secrets.findIndex((slot) => slot === null);
}

function findTrap(privateState: PrivateState, trigger: NonNullable<CardDefinition['trapTrigger']>): { index: number; instance: CardInstance; card: CardDefinition } | null {
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
}

function damageUnit(state: MatchState, ownerId: string, unitIndex: number, amount: number): number {
  const unit = state.boards[ownerId].units[unitIndex];
  if (!unit || amount <= 0) return 0;
  let remaining = amount;
  if (unit.shield > 0) {
    const absorbed = Math.min(unit.shield, remaining);
    unit.shield -= absorbed;
    remaining -= absorbed;
  }
  if (remaining > 0) unit.health -= remaining;
  return amount;
}

function healCore(state: MatchState, playerId: string, amount: number): void {
  state.core[playerId] = Math.min(CORE_MAX, (state.core[playerId] ?? 0) + amount);
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
      break;
    }
    case 'damage_core':
      state.core[opponentId] -= effect.amount;
      break;
    case 'heal_core':
      healCore(state, actorId, effect.amount);
      break;
    case 'draw':
      drawCards(state, actorPrivate, actorId, effect.amount);
      break;
    case 'buff_unit': {
      if (!target) throw new Error('대상 유닛을 선택해야 합니다.');
      const unit = state.boards[target.ownerId].units[target.unitIndex];
      if (!unit) throw new Error('대상 유닛이 없습니다.');
      unit.attack += effect.attack;
      unit.health += effect.health;
      unit.maxHealth += effect.health;
      break;
    }
    case 'shield_unit': {
      if (!target) throw new Error('대상 유닛을 선택해야 합니다.');
      const unit = state.boards[target.ownerId].units[target.unitIndex];
      if (!unit) throw new Error('대상 유닛이 없습니다.');
      unit.shield += effect.amount;
      break;
    }
    case 'aoe_enemy':
      state.boards[opponentId].units.forEach((unit, index) => {
        if (unit) damageUnit(state, opponentId, index, effect.amount);
      });
      break;
    case 'gain_energy':
      state.energy[actorId].current = Math.min(10, state.energy[actorId].current + effect.amount);
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
      };
      break;
    }
  }
}

function destroyDefeatedUnits(state: MatchState, privateStates: Record<string, PrivateState>): void {
  for (const playerId of state.playerOrder) {
    if (!playerId) continue;
    const opponentId = otherPlayer(state, playerId);
    for (let index = 0; index < state.boards[playerId].units.length; index += 1) {
      const unit = state.boards[playerId].units[index];
      if (!unit || unit.health > 0) continue;
      const card = CARD_BY_ID[unit.cardId];
      state.graveyards[playerId].push(unit.cardId);
      state.boards[playerId].units[index] = null;
      appendLog(state, `${card?.name ?? '토큰'}이(가) 파괴되었습니다.`, 'attack');

      const trap = findTrap(privateStates[playerId], 'friendly_destroyed');
      if (trap && trap.card.trapEffect && trap.card.trapEffect.kind !== 'negate' && trap.card.trapEffect.kind !== 'negate_and_damage') {
        consumeTrap(state, privateStates[playerId], playerId, trap.index, trap.card);
        applyEffect(state, privateStates, playerId, trap.card.trapEffect);
      }
    }
    void opponentId;
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
  validateTarget(state, playerId, card, target);
  spendEnergy(state, playerId, card.cost);

  const opponentId = otherPlayer(state, playerId);

  if (card.kind === 'unit') {
    const zone = Number.isInteger(requestedZone) ? Number(requestedZone) : firstOpenUnit(state.boards[playerId]);
    if (zone < 0 || zone > 4 || state.boards[playerId].units[zone]) throw new Error('선택한 유닛 칸을 사용할 수 없습니다.');
    playerPrivate.hand.splice(handIndex, 1);
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
    };
    state.boards[playerId].units[zone] = unit;
    appendLog(state, `${card.name} 소환.`, 'system');

    const trap = findTrap(privateStates[opponentId], 'unit_summoned');
    if (trap && trap.card.trapEffect && trap.card.trapEffect.kind !== 'negate' && trap.card.trapEffect.kind !== 'negate_and_damage') {
      consumeTrap(state, privateStates[opponentId], opponentId, trap.index, trap.card);
      applyEffect(state, privateStates, opponentId, trap.card.trapEffect, { ownerId: playerId, unitIndex: zone });
    }

    if (card.onSummon && state.boards[playerId].units[zone]) {
      const selfTarget = { ownerId: playerId, unitIndex: zone };
      applyEffect(state, privateStates, playerId, card.onSummon, card.onSummon.kind === 'shield_unit' ? selfTarget : undefined);
    }
  } else if (card.kind === 'spell') {
    playerPrivate.hand.splice(handIndex, 1);
    const counter = findTrap(privateStates[opponentId], 'spell_played');
    let negated = false;
    if (counter && counter.card.trapEffect) {
      consumeTrap(state, privateStates[opponentId], opponentId, counter.index, counter.card);
      if (counter.card.trapEffect.kind === 'negate') negated = true;
      if (counter.card.trapEffect.kind === 'negate_and_damage') {
        negated = true;
        state.core[playerId] -= counter.card.trapEffect.amount;
      }
    }
    if (!negated && card.effect) {
      const effectTarget = card.target === 'enemy_core' ? undefined : target;
      applyEffect(state, privateStates, playerId, card.effect, effectTarget);
      appendLog(state, `주문 「${card.name}」 발동.`, 'system');
    } else if (negated) {
      appendLog(state, `주문 「${card.name}」이(가) 무효화되었습니다.`, 'trap');
    }
    state.graveyards[playerId].push(card.id);
  } else {
    const zone = Number.isInteger(requestedZone) ? Number(requestedZone) : firstOpenSecret(state.boards[playerId]);
    if (zone < 0 || zone > 4 || state.boards[playerId].secrets[zone]) throw new Error('선택한 함정 칸을 사용할 수 없습니다.');
    playerPrivate.hand.splice(handIndex, 1);
    playerPrivate.secrets[zone] = instance;
    state.boards[playerId].secrets[zone] = { occupied: true };
    appendLog(state, '함정 카드 1장을 세트했습니다.', 'system');
  }

  state.handCounts[playerId] = playerPrivate.hand.length;
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
  appendLog(state, '전투 단계로 이동했습니다.', 'system');
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

  if (target.kind === 'core') {
    if (state.boards[opponentId].units.some(Boolean)) throw new Error('상대 필드에 유닛이 남아 있어 직접 공격할 수 없습니다.');
    const trap = findTrap(privateStates[opponentId], 'direct_attack');
    if (trap && trap.card.trapEffect) {
      consumeTrap(state, privateStates[opponentId], opponentId, trap.index, trap.card);
      if (trap.card.trapEffect.kind === 'negate_and_damage') {
        damageUnit(state, playerId, attackerIndex, trap.card.trapEffect.amount);
        attacker.canAttack = false;
        appendLog(state, `${attackerCard?.name ?? '유닛'}의 직접 공격이 무효화되었습니다.`, 'trap');
      }
    } else {
      state.core[opponentId] -= attacker.attack;
      if (attackerCard?.keywords?.includes('lifesteal')) healCore(state, playerId, attacker.attack);
      attacker.canAttack = false;
      appendLog(state, `${attackerCard?.name ?? '유닛'}이(가) 코어에 ${attacker.attack} 피해.`, 'attack');
    }
  } else {
    if (target.unitIndex < 0 || target.unitIndex > 4) throw new Error('올바른 공격 대상을 선택하세요.');
    if (guardIndexes.length > 0 && !guardIndexes.includes(target.unitIndex)) throw new Error('수호 유닛을 먼저 공격해야 합니다.');
    const defender = state.boards[opponentId].units[target.unitIndex];
    if (!defender) throw new Error('선택한 위치에 적 유닛이 없습니다.');

    const ambush = findTrap(privateStates[opponentId], 'unit_attacked');
    if (ambush && ambush.card.trapEffect && ambush.card.trapEffect.kind !== 'negate' && ambush.card.trapEffect.kind !== 'negate_and_damage') {
      consumeTrap(state, privateStates[opponentId], opponentId, ambush.index, ambush.card);
      applyEffect(state, privateStates, opponentId, ambush.card.trapEffect, { ownerId: opponentId, unitIndex: target.unitIndex });
    }

    const defenderAfterTrap = state.boards[opponentId].units[target.unitIndex];
    if (!defenderAfterTrap) throw new Error('방어 유닛 상태가 올바르지 않습니다.');
    const attackerDamage = attacker.attack;
    const defenderDamage = defenderAfterTrap.attack;
    damageUnit(state, opponentId, target.unitIndex, attackerDamage);
    damageUnit(state, playerId, attackerIndex, defenderDamage);

    if (attackerCard?.keywords?.includes('lifesteal')) healCore(state, playerId, attackerDamage);
    if (attackerCard?.keywords?.includes('pierce') && defenderAfterTrap.health <= 0) {
      const overflow = Math.max(0, attackerDamage - Math.max(0, defenderAfterTrap.maxHealth + defenderAfterTrap.shield));
      if (overflow > 0) state.core[opponentId] -= overflow;
    }
    attacker.canAttack = false;
    appendLog(state, `${attackerCard?.name ?? '유닛'}이(가) 적 유닛과 충돌했습니다.`, 'attack');
  }

  destroyDefeatedUnits(state, privateStates);
  checkWinner(state);
  return { state, privateStates };
}

export function endTurn(snapshot: GameSnapshot, playerId: string): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  assertActiveTurn(state, playerId);
  const nextPlayer = otherPlayer(state, playerId);
  state.currentPlayerId = nextPlayer;
  state.turnNumber += 1;
  state.phase = 'main';
  const nextEnergy = state.energy[nextPlayer] ?? { current: 0, max: 0 };
  nextEnergy.max = Math.min(10, nextEnergy.max + 1);
  nextEnergy.current = nextEnergy.max;
  state.energy[nextPlayer] = nextEnergy;
  state.boards[nextPlayer].units.forEach((unit) => {
    if (unit) unit.canAttack = true;
  });
  drawCards(state, privateStates[nextPlayer], nextPlayer, 1);
  appendLog(state, `${nextPlayer.slice(0, 6)}의 턴입니다.`, 'system');
  checkWinner(state);
  return { state, privateStates };
}

export function surrender(snapshot: GameSnapshot, playerId: string): ActionResult {
  const state = clone(snapshot.state);
  const privateStates = clone(snapshot.privateStates);
  if (state.status !== 'active') throw new Error('진행 중인 결투가 아닙니다.');
  state.status = 'finished';
  state.winnerId = otherPlayer(state, playerId);
  state.winReason = '상대 항복';
  appendLog(state, '한 플레이어가 항복했습니다.', 'victory');
  return { state, privateStates };
}

export function sanitizeForPlayer(snapshot: GameSnapshot, playerId: string): { state: MatchState; privateState: PrivateState | null } {
  const state = clone(snapshot.state);
  const privateState = snapshot.privateStates[playerId] ? clone(snapshot.privateStates[playerId]) : null;
  return { state, privateState };
}
