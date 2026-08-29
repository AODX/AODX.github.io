import {
  CARDS,
  CARD_BY_ID,
  DECK_SIZE,
  EXTRA_DECK_SIZE,
  MAX_COPIES,
  type CardDefinition,
  extraRequiredUnitCount,
  isExtraDeckCard,
  isUnitCard,
} from './game-data';
import {
  type ActionResult,
  type CardActionTarget,
  type GameSnapshot,
  attack,
  beginBattlePhase,
  drawAndEndTurn,
  closeHandIntel,
  discardRevealedOpponentHand,
  endTurn,
  initializeMatch,
  playCard,
  respondTrap,
  resolveTurnTimeout,
  resolveExtraChoice,
  sacrificeFieldUnitForEnergy,
  sacrificeHandForEnergy,
  sendBattleEmote,
  spendEnergyToDraw,
  summonExtra,
  surrender,
} from './game-engine';

export type PracticeDifficulty = 'easy' | 'normal' | 'hard';

export const PRACTICE_DIFFICULTY_LABEL: Record<PracticeDifficulty, string> = {
  easy: '쉬움',
  normal: '보통',
  hard: '어려움',
};

export interface PracticeBotAction {
  gameAction: 'play_card' | 'extra_summon' | 'battle_phase' | 'attack' | 'trap_response' | 'draw_turn' | 'sacrifice_energy' | 'sacrifice_field_energy' | 'energy_draw' | 'battle_emote' | 'end_turn' | 'surrender' | 'resolve_timeout' | 'resolve_extra_choice';
  payload?: Record<string, unknown>;
  label: string;
}

function summonEffectNeedsFriendlyTarget(card: CardDefinition): boolean {
  const effect = card.onSummon;
  if (!effect || /자신에게|자신의/.test(card.text ?? '')) return false;
  return effect.kind === 'buff_unit'
    || effect.kind === 'shield_unit'
    || effect.kind === 'heal_unit'
    || effect.kind === 'ready_unit';
}

function summonTargetPayloads(snapshot: GameSnapshot, playerId: string, card: CardDefinition): Array<Record<string, unknown> | undefined> {
  if (!summonEffectNeedsFriendlyTarget(card)) return [undefined];
  const board = snapshot.state.boards[playerId];
  const targets: Array<Record<string, unknown>> = [{ ownerId: playerId, unitIndex: -1 }];
  board.units.forEach((unit, unitIndex) => {
    if (unit) targets.push({ ownerId: playerId, unitIndex });
  });
  return targets;
}

function rarityPower(card: CardDefinition): number {
  return card.rarity === 'legendary' ? 10 : card.rarity === 'epic' ? 6 : card.rarity === 'rare' ? 3 : 0;
}

function cardPower(card: CardDefinition): number {
  const body = isUnitCard(card) ? (card.attack ?? 0) * 1.05 + (card.health ?? 0) * 0.85 : 0;
  const keywordPower = (card.keywords?.length ?? 0) * 1.4;
  const effectPower = (card.effect ? 3 : 0) + (card.onSummon ? 3 : 0) + (card.trapEffect ? 3 : 0) + (card.extraChoices?.length ?? 0) * 1.8 + (card.eclipsePhasePulses?.length ?? 0) * 2.8;
  const temporalKinds = [card.effect?.kind, card.onSummon?.kind, card.trapEffect?.kind];
  const authoredTemporal = Object.values(card.eclipsePhaseModifiers ?? {});
  const authoredTemporalPower = authoredTemporal.reduce((sum, modifier) => {
    if (!modifier) return sum;
    const positive = Math.max(0, modifier.attack ?? 0) + Math.max(0, modifier.health ?? 0) * 0.8;
    const negative = Math.max(0, -(modifier.attack ?? 0)) + Math.max(0, -(modifier.health ?? 0)) * 0.8;
    return sum + positive * 0.52 - negative * 0.16;
  }, 0);
  const temporalPower = (card.eclipseAffinity ? 1.6 : 0)
    + authoredTemporalPower
    + (card.eclipseSummonPhases?.length ? 0.7 : 0)
    + (card.eclipsePhasePulses?.length ?? 0) * 2.6
    + (temporalKinds.some((kind) => kind?.startsWith('phase_') === true) ? 3.4 : 0)
    + (temporalKinds.some((kind) => kind === 'phase_rewind') ? 1.8 : 0);
  const efficiency = body > 0 ? body / Math.max(1, card.cost + 0.5) : 2.5 / Math.max(1, card.cost + 0.5);
  return rarityPower(card) + body * 0.8 + keywordPower + effectPower + temporalPower + efficiency * 2.2 - Math.max(0, card.cost - 6) * 0.8;
}

function rankForDifficulty(cards: CardDefinition[], difficulty: PracticeDifficulty): CardDefinition[] {
  const sorted = [...cards].sort((a, b) => cardPower(b) - cardPower(a) || a.cost - b.cost || a.id.localeCompare(b.id));
  if (difficulty === 'hard') return sorted;
  if (difficulty === 'normal') {
    const cut = Math.max(1, Math.floor(sorted.length * 0.15));
    return [...sorted.slice(cut), ...sorted.slice(0, cut)];
  }
  return [...sorted].reverse();
}

function addCardsWithCopyLimits(output: string[], pool: CardDefinition[], wanted: number, difficulty: PracticeDifficulty): void {
  if (wanted <= 0 || pool.length === 0) return;
  const ranked = rankForDifficulty(pool, difficulty);
  let pass = 0;
  while (wanted > 0 && pass < 4) {
    for (const card of ranked) {
      if (wanted <= 0) break;
      const used = output.filter((id) => id === card.id).length;
      if (used >= MAX_COPIES[card.rarity]) continue;
      output.push(card.id);
      wanted -= 1;
    }
    pass += 1;
  }
}

function inCostRange(card: CardDefinition, min: number, max = Number.POSITIVE_INFINITY): boolean {
  return card.cost >= min && card.cost <= max;
}

/**
 * Builds a deterministic practice deck from the current card catalogue. The bot does not
 * consume the user's collection, so training keeps progression/rewards completely separate.
 */
export function buildPracticeBotDeck(difficulty: PracticeDifficulty): { deck: string[]; extra: string[] } {
  const main = CARDS.filter((card) => !isExtraDeckCard(card));
  const units = main.filter((card) => card.kind === 'unit');
  const spells = main.filter((card) => card.kind === 'spell');
  const traps = main.filter((card) => card.kind === 'trap');
  const deck: string[] = [];

  // Stable curve: enough early bodies to prevent the hard bot from simply bricking on legends.
  addCardsWithCopyLimits(deck, units.filter((card) => inCostRange(card, 0, 2)), 8, difficulty);
  addCardsWithCopyLimits(deck, units.filter((card) => inCostRange(card, 3, 4)), 8, difficulty);
  addCardsWithCopyLimits(deck, units.filter((card) => inCostRange(card, 5, 6)), 6, difficulty);
  addCardsWithCopyLimits(deck, units.filter((card) => inCostRange(card, 7)), 4, difficulty);
  addCardsWithCopyLimits(deck, spells.filter((card) => inCostRange(card, 0, 2)), 4, difficulty);
  addCardsWithCopyLimits(deck, spells.filter((card) => inCostRange(card, 3, 4)), 4, difficulty);
  addCardsWithCopyLimits(deck, spells.filter((card) => inCostRange(card, 5)), 3, difficulty);
  addCardsWithCopyLimits(deck, traps, 8, difficulty);

  if (deck.length < DECK_SIZE) addCardsWithCopyLimits(deck, main, DECK_SIZE - deck.length, difficulty);
  if (deck.length > DECK_SIZE) deck.length = DECK_SIZE;

  const extraPool = CARDS.filter(isExtraDeckCard);
  const extra = rankForDifficulty(extraPool, difficulty).slice(0, EXTRA_DECK_SIZE).map((card) => card.id);
  return { deck, extra };
}

export function createPracticeMatch(
  playerId: string,
  playerDeck: string[],
  playerExtra: string[],
  botId: string,
  difficulty: PracticeDifficulty,
): GameSnapshot {
  const botDeck = buildPracticeBotDeck(difficulty);
  // Practice uses the exact same match clock and turn rules as an online duel.
  // The only difference is that the opponent's decisions are generated locally by AI.
  return initializeMatch(playerId, playerDeck, playerExtra, botId, botDeck.deck, botDeck.extra);
}

export function applyPracticeGameAction(
  snapshot: GameSnapshot,
  playerId: string,
  gameAction: string,
  payload: Record<string, unknown> = {},
): ActionResult {
  let next: ActionResult;
  if (gameAction === 'play_card') {
    const rawTarget = payload.target && typeof payload.target === 'object' ? payload.target as Record<string, unknown> : undefined;
    const target: CardActionTarget | undefined = rawTarget
      ? {
          ownerId: String(rawTarget.ownerId ?? ''),
          unitIndex: rawTarget.unitIndex === undefined ? undefined : Number(rawTarget.unitIndex),
          graveyardIndex: rawTarget.graveyardIndex === undefined ? undefined : Number(rawTarget.graveyardIndex),
          deckCardId: rawTarget.deckCardId === undefined ? undefined : String(rawTarget.deckCardId),
        }
      : undefined;
    next = playCard(snapshot, playerId, String(payload.instanceId ?? ''), payload.zone === undefined ? undefined : Number(payload.zone), target);
  } else if (gameAction === 'discard_opponent_hand') {
    next = discardRevealedOpponentHand(snapshot, playerId, String(payload.instanceId ?? ''));
  } else if (gameAction === 'close_hand_reveal') {
    next = closeHandIntel(snapshot, playerId);
  } else if (gameAction === 'extra_summon') {
    const rawTarget = payload.target && typeof payload.target === 'object' ? payload.target as Record<string, unknown> : undefined;
    const target: CardActionTarget | undefined = rawTarget
      ? {
          ownerId: String(rawTarget.ownerId ?? ''),
          unitIndex: rawTarget.unitIndex === undefined ? undefined : Number(rawTarget.unitIndex),
        }
      : undefined;
    next = summonExtra(
      snapshot,
      playerId,
      String(payload.extraInstanceId ?? ''),
      Array.isArray(payload.materialZones) ? payload.materialZones.map(Number) : [],
      payload.extraChoiceIndex === undefined ? undefined : Number(payload.extraChoiceIndex),
      target,
    );
  } else if (gameAction === 'battle_phase') {
    next = beginBattlePhase(snapshot, playerId);
  } else if (gameAction === 'attack') {
    const rawTarget = payload.target as Record<string, unknown> | undefined;
    if (!rawTarget || (rawTarget.kind !== 'unit' && rawTarget.kind !== 'core')) throw new Error('공격 대상을 선택하세요.');
    const target = rawTarget.kind === 'core'
      ? ({ kind: 'core' } as const)
      : ({ kind: 'unit', unitIndex: Number(rawTarget.unitIndex) } as const);
    next = attack(snapshot, playerId, Number(payload.attackerIndex), target);
  } else if (gameAction === 'resolve_extra_choice') {
    next = resolveExtraChoice(snapshot, playerId, Number(payload.choiceIndex ?? 0));
  } else if (gameAction === 'trap_response') {
    next = respondTrap(snapshot, playerId, payload.activate === true);
  } else if (gameAction === 'draw_turn') {
    next = drawAndEndTurn(snapshot, playerId);
  } else if (gameAction === 'sacrifice_energy') {
    next = sacrificeHandForEnergy(snapshot, playerId, String(payload.instanceId ?? ''));
  } else if (gameAction === 'sacrifice_field_energy') {
    next = sacrificeFieldUnitForEnergy(snapshot, playerId, Number(payload.unitIndex));
  } else if (gameAction === 'energy_draw') {
    next = spendEnergyToDraw(snapshot, playerId);
  } else if (gameAction === 'battle_emote') {
    next = sendBattleEmote(snapshot, playerId, String(payload.emoteId ?? ''));
  } else if (gameAction === 'end_turn') {
    next = endTurn(snapshot, playerId);
  } else if (gameAction === 'surrender') {
    next = surrender(snapshot, playerId);
  } else if (gameAction === 'resolve_timeout') {
    next = resolveTurnTimeout(snapshot, Date.now());
  } else {
    throw new Error('알 수 없는 연습 모드 행동입니다.');
  }
  return next;
}

function combinations(values: number[], count: number): number[][] {
  if (count <= 0) return [[]];
  const result: number[][] = [];
  const walk = (start: number, picked: number[]) => {
    if (picked.length === count) {
      result.push([...picked]);
      return;
    }
    for (let index = start; index < values.length; index += 1) {
      picked.push(values[index]);
      walk(index + 1, picked);
      picked.pop();
    }
  };
  walk(0, []);
  return result;
}

function opponentOf(snapshot: GameSnapshot, playerId: string): string {
  return snapshot.state.playerOrder.find((id) => id !== playerId) ?? '';
}

function candidateKey(action: PracticeBotAction): string {
  return `${action.gameAction}:${JSON.stringify(action.payload ?? {})}`;
}

function enumerateBotActions(snapshot: GameSnapshot, botId: string): PracticeBotAction[] {
  const state = snapshot.state;
  const botPrivate = snapshot.privateStates[botId];
  const opponentId = opponentOf(snapshot, botId);
  if (!botPrivate || !opponentId || state.status !== 'active') return [];

  if (state.pendingTrap) {
    if (state.pendingTrap.ownerId !== botId) return [];
    return [
      { gameAction: 'trap_response', payload: { activate: true }, label: '함정 발동' },
      { gameAction: 'trap_response', payload: { activate: false }, label: '함정 보류' },
    ];
  }
  if (state.pendingExtraChoice) {
    if (state.pendingExtraChoice.ownerId !== botId) return [];
    const choiceCard = CARD_BY_ID[state.pendingExtraChoice.cardId];
    return (choiceCard?.extraChoices ?? []).map((choice, index) => ({ gameAction: 'resolve_extra_choice', payload: { choiceIndex: index }, label: `${choiceCard.name} · ${choice.label}` }));
  }
  if (state.currentPlayerId !== botId) return [];

  const actions: PracticeBotAction[] = [];
  const ownBoard = state.boards[botId];
  const enemyBoard = state.boards[opponentId];

  if (state.phase === 'main') {
    for (const instance of botPrivate.hand) {
      const card = CARD_BY_ID[instance.cardId];
      if (!card) continue;
      if (card.kind === 'unit') {
        const summonTargets = summonTargetPayloads(snapshot, botId, card);
        if (card.summonMode === 'legendary') {
          for (const target of summonTargets) {
            actions.push({ gameAction: 'play_card', payload: { instanceId: instance.instanceId, ...(target ? { target } : {}) }, label: `${card.name} 특수 소환` });
          }
        } else {
          ownBoard.units.forEach((unit, zone) => {
            if (!unit) {
              for (const target of summonTargets) {
                actions.push({ gameAction: 'play_card', payload: { instanceId: instance.instanceId, zone, ...(target ? { target } : {}) }, label: `${card.name} 소환` });
              }
            }
          });
        }
      } else if (card.kind === 'trap') {
        ownBoard.secrets.forEach((secret, zone) => {
          if (!secret) actions.push({ gameAction: 'play_card', payload: { instanceId: instance.instanceId, zone }, label: `${card.name} 세트` });
        });
      } else if (card.kind === 'spell') {
        if (card.target === 'enemy_unit') {
          enemyBoard.units.forEach((unit, unitIndex) => {
            if (unit) actions.push({ gameAction: 'play_card', payload: { instanceId: instance.instanceId, target: { ownerId: opponentId, unitIndex } }, label: `${card.name} 사용` });
          });
        } else if (card.target === 'friendly_unit') {
          ownBoard.units.forEach((unit, unitIndex) => {
            if (unit) actions.push({ gameAction: 'play_card', payload: { instanceId: instance.instanceId, target: { ownerId: botId, unitIndex } }, label: `${card.name} 사용` });
          });
        } else if (card.target === 'friendly_graveyard_unit') {
          (state.graveyards[botId] ?? []).forEach((cardId, graveyardIndex) => {
            if (CARD_BY_ID[cardId]?.kind === 'unit') actions.push({ gameAction: 'play_card', payload: { instanceId: instance.instanceId, target: { ownerId: botId, graveyardIndex } }, label: `${card.name} 부활` });
          });
        } else if (card.target === 'friendly_graveyard_card') {
          (state.graveyards[botId] ?? []).forEach((cardId, graveyardIndex) => {
            if (CARD_BY_ID[cardId]) actions.push({ gameAction: 'play_card', payload: { instanceId: instance.instanceId, target: { ownerId: botId, graveyardIndex } }, label: `${card.name} 회수` });
          });
        } else if (card.target === 'own_deck_card') {
          const uniqueDeckIds = Array.from(new Set(botPrivate.deck.map((item) => item.cardId)));
          for (const deckCardId of uniqueDeckIds) actions.push({ gameAction: 'play_card', payload: { instanceId: instance.instanceId, target: { ownerId: botId, deckCardId } }, label: `${card.name} 탐색` });
        } else {
          actions.push({ gameAction: 'play_card', payload: { instanceId: instance.instanceId }, label: `${card.name} 발동` });
        }
      }
    }

    const occupiedZones = ownBoard.units.flatMap((unit, index) => unit ? [index] : []);
    for (const instance of botPrivate.extra) {
      const card = CARD_BY_ID[instance.cardId];
      if (!card || (card.kind !== 'fusion' && card.kind !== 'evolution')) continue;
      const required = extraRequiredUnitCount(card);
      if (required <= 0 || required > occupiedZones.length) continue;
      const summonTargets = summonTargetPayloads(snapshot, botId, card);
      for (const materialZones of combinations(occupiedZones, required)) {
        for (const target of summonTargets) {
          actions.push({ gameAction: 'extra_summon', payload: { extraInstanceId: instance.instanceId, materialZones, ...(target ? { target } : {}) }, label: `${card.name} 엑스트라 소환` });
        }
      }
    }

    for (const instance of botPrivate.hand) {
      actions.push({ gameAction: 'sacrifice_energy', payload: { instanceId: instance.instanceId }, label: '손패 에너지 전환' });
    }
    ownBoard.units.forEach((unit, unitIndex) => {
      if (unit) actions.push({ gameAction: 'sacrifice_field_energy', payload: { unitIndex }, label: '필드 에너지 전환' });
    });
    actions.push({ gameAction: 'energy_draw', label: '에너지 드로우' });
    actions.push({ gameAction: 'draw_turn', label: '턴 소비 드로우' });
    actions.push({ gameAction: 'battle_phase', label: '전투 단계 진입' });
    actions.push({ gameAction: 'end_turn', label: '턴 종료' });
  } else {
    ownBoard.units.forEach((unit, attackerIndex) => {
      if (!unit?.canAttack) return;
      enemyBoard.units.forEach((target, unitIndex) => {
        if (target) actions.push({ gameAction: 'attack', payload: { attackerIndex, target: { kind: 'unit', unitIndex } }, label: '유닛 공격' });
      });
      actions.push({ gameAction: 'attack', payload: { attackerIndex, target: { kind: 'core' } }, label: '코어 공격' });
    });
    actions.push({ gameAction: 'end_turn', label: '턴 종료' });
  }

  const legal: PracticeBotAction[] = [];
  const seen = new Set<string>();
  for (const action of actions) {
    const key = candidateKey(action);
    if (seen.has(key)) continue;
    seen.add(key);
    try {
      applyPracticeGameAction(snapshot, botId, action.gameAction, action.payload ?? {});
      legal.push(action);
    } catch {
      // Engine validation is the single source of truth. Invalid generated candidates are discarded.
    }
  }
  return legal;
}

function boardUnitValue(card: CardDefinition | undefined, attackValue: number, healthValue: number, shieldValue: number): number {
  return attackValue * 7 + healthValue * 5 + shieldValue * 3 + (card?.keywords?.length ?? 0) * 2 + (card ? rarityPower(card) : 0);
}

function snapshotScore(snapshot: GameSnapshot, botId: string): number {
  const state = snapshot.state;
  const opponentId = opponentOf(snapshot, botId);
  if (!opponentId) return -1_000_000;
  if (state.status === 'finished') {
    if (state.winnerId === botId) return 1_000_000;
    if (state.winnerId === opponentId) return -1_000_000;
  }
  let score = ((state.core[botId] ?? 0) - (state.core[opponentId] ?? 0)) * 90;
  for (const unit of state.boards[botId]?.units ?? []) {
    if (!unit) continue;
    score += boardUnitValue(CARD_BY_ID[unit.cardId], unit.attack, unit.health, unit.shield) + (unit.canAttack ? 5 : 0);
  }
  for (const unit of state.boards[opponentId]?.units ?? []) {
    if (!unit) continue;
    score -= boardUnitValue(CARD_BY_ID[unit.cardId], unit.attack, unit.health, unit.shield) + (unit.canAttack ? 3 : 0);
  }
  score += (state.handCounts[botId] ?? 0) * 7 - (state.handCounts[opponentId] ?? 0) * 4;
  score += (state.energy[botId]?.current ?? 0) * 5 + (state.energy[botId]?.max ?? 0) * 6;
  score -= (state.energy[opponentId]?.current ?? 0) * 2 + (state.energy[opponentId]?.max ?? 0) * 3;
  score += (state.boards[botId]?.secrets.filter(Boolean).length ?? 0) * 8;
  return score;
}

function actionBias(snapshot: GameSnapshot, botId: string, action: PracticeBotAction): number {
  const state = snapshot.state;
  const opponentId = opponentOf(snapshot, botId);
  if (action.gameAction === 'battle_phase') {
    const ready = state.boards[botId]?.units.filter((unit) => unit?.canAttack).length ?? 0;
    return ready > 0 ? 18 + ready * 4 : -8;
  }
  if (action.gameAction === 'end_turn') {
    const ready = state.phase === 'battle' ? (state.boards[botId]?.units.filter((unit) => unit?.canAttack).length ?? 0) : 0;
    return ready > 0 ? -45 : -2;
  }
  if (action.gameAction === 'attack') {
    const target = action.payload?.target as Record<string, unknown> | undefined;
    if (target?.kind === 'core') {
      const attackerIndex = Number(action.payload?.attackerIndex);
      const attacker = state.boards[botId]?.units[attackerIndex];
      const lethal = Boolean(attacker && opponentId && attacker.attack >= (state.core[opponentId] ?? 999));
      return lethal ? 50_000 : 20;
    }
    return 12;
  }
  if (action.gameAction === 'extra_summon') return 24;
  if (action.gameAction === 'resolve_extra_choice') return 26;
  if (action.gameAction === 'play_card') {
    const instanceId = String(action.payload?.instanceId ?? '');
    const cardId = snapshot.privateStates[botId]?.hand.find((instance) => instance.instanceId === instanceId)?.cardId;
    const card = cardId ? CARD_BY_ID[cardId] : undefined;
    const temporalKind = card?.effect?.kind?.startsWith('phase_') || card?.onSummon?.kind?.startsWith('phase_') || Boolean(card?.eclipsePhasePulses?.length);
    const currentPhase = state.eclipsePhase ?? 'dawn';
    if (card?.eclipsePhasePulses?.length) {
      const alignedPulse = card.eclipsePhasePulses.some((pulse) => pulse.phase === currentPhase);
      const modifier = card.eclipsePhaseModifiers?.[currentPhase];
      const immediateBodyGain = Math.max(0, modifier?.attack ?? 0) + Math.max(0, modifier?.health ?? 0) * 0.8;
      const bestBodyGain = Math.max(0, ...Object.values(card.eclipsePhaseModifiers ?? {}).map((entry) => Math.max(0, entry?.attack ?? 0) + Math.max(0, entry?.health ?? 0) * 0.8));
      if (alignedPulse) return 30 + immediateBodyGain * 2 + card.eclipsePhasePulses.length * 6;
      if (bestBodyGain >= 5) return -18;
    }
    if (card?.temporalProfileName?.startsWith('극시공')) {
      // Extreme temporal units are intentionally awful outside their one payoff window.
      // Hard/normal practice bots therefore save them for the matching phase instead of
      // treating a 6~9 ENERGY 0/1 body as a normal curve play.
      return card.eclipseAffinity === currentPhase ? 42 : -34;
    }
    const phaseSetter = card?.effect?.kind === 'phase_set' ? card.effect.phase
      : card?.onSummon?.kind === 'phase_set' ? card.onSummon.phase
      : null;
    if (phaseSetter) {
      const waitingExtremes = snapshot.privateStates[botId]?.hand.filter((instance) => {
        const held = CARD_BY_ID[instance.cardId];
        return Boolean(held && ((held.temporalProfileName?.startsWith('극시공') && held.eclipseAffinity === phaseSetter) || held.eclipsePhasePulses?.some((pulse) => pulse.phase === phaseSetter)));
      }).length ?? 0;
      if (waitingExtremes > 0) return 18 + waitingExtremes * 12;
    }
    if (card?.effect?.kind === 'phase_lock') {
      const ownResonant = state.boards[botId]?.units.filter((unit) => unit?.eclipseResonance === 'resonant').length ?? 0;
      const enemyResonant = state.boards[opponentId]?.units.filter((unit) => unit?.eclipseResonance === 'resonant').length ?? 0;
      return 10 + (ownResonant > enemyResonant ? 16 : 2);
    }
    return 10 + (temporalKind ? 6 : 0);
  }
  if (action.gameAction === 'energy_draw') return 3;
  if (action.gameAction === 'draw_turn') return state.turnActionTaken ? -100 : 1;
  if (action.gameAction === 'sacrifice_field_energy') return -14;
  if (action.gameAction === 'sacrifice_energy') return 0;
  if (action.gameAction === 'trap_response') return action.payload?.activate === true ? 8 : 0;
  return 0;
}

function scoredCandidates(snapshot: GameSnapshot, botId: string, actions: PracticeBotAction[]): Array<{ action: PracticeBotAction; score: number }> {
  const before = snapshotScore(snapshot, botId);
  return actions.map((action) => {
    try {
      const next = applyPracticeGameAction(snapshot, botId, action.gameAction, action.payload ?? {});
      return { action, score: snapshotScore(next, botId) - before + actionBias(snapshot, botId, action) };
    } catch {
      return { action, score: -1_000_000 };
    }
  }).filter((entry) => entry.score > -999_999);
}

function randomItem<T>(items: T[]): T | null {
  return items.length ? items[Math.floor(Math.random() * items.length)] : null;
}

export function choosePracticeBotAction(snapshot: GameSnapshot, botId: string, difficulty: PracticeDifficulty): PracticeBotAction | null {
  const actions = enumerateBotActions(snapshot, botId);
  if (actions.length === 0) return null;

  if (snapshot.state.pendingTrap?.ownerId === botId) {
    if (difficulty === 'easy') return Math.random() < 0.45 ? actions.find((action) => action.payload?.activate === true) ?? actions[0] : actions.find((action) => action.payload?.activate === false) ?? actions[0];
    const scored = scoredCandidates(snapshot, botId, actions).sort((a, b) => b.score - a.score);
    if (difficulty === 'normal' && Math.random() < 0.2) return randomItem(actions);
    return scored[0]?.action ?? actions[0];
  }

  const scored = scoredCandidates(snapshot, botId, actions).sort((a, b) => b.score - a.score);
  if (difficulty === 'hard') return scored[0]?.action ?? actions[0];

  if (difficulty === 'normal') {
    const top = scored.slice(0, Math.min(4, scored.length));
    if (Math.random() < 0.72) return top[0]?.action ?? actions[0];
    return randomItem(top)?.action ?? actions[0];
  }

  // Easy bot understands legal rules but intentionally makes loose decisions and sometimes
  // ends a turn early, which gives new players room to learn card targeting and combat flow.
  const endAction = actions.find((action) => action.gameAction === 'end_turn');
  if (endAction && Math.random() < 0.18) return endAction;
  const nonDestructive = actions.filter((action) => action.gameAction !== 'sacrifice_field_energy');
  return randomItem(nonDestructive.length ? nonDestructive : actions);
}
