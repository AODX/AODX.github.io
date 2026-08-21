import { NextRequest, NextResponse } from 'next/server';
import { createHash, randomInt } from 'node:crypto';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import {
  CARD_MAP,
  CARD_POOL,
  DECK_SIZE,
  PICKUP_CARD_IDS,
  COPY_LIMIT_BY_RARITY,
  makeHandEntry,
  shuffleCardIds,
  validateDeckList,
  type ArcanaCard,
  type CardRarity,
  type CardTarget,
  type TrapTrigger,
} from '../../arcana-cards';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type HandEntry = { uid: string; cardId: string };
type TrapEntry = { uid: string; cardId: string };
type BoardUnit = {
  instanceId: string;
  cardId: string;
  name: string;
  ownerPlayerId: string;
  lane: number;
  attack: number;
  health: number;
  maxHealth: number;
  shield: number;
  exhausted: boolean;
  frozen: boolean;
  rarity: ArcanaCard['rarity'];
  faction: ArcanaCard['faction'];
  icon: string;
  keywords: NonNullable<ArcanaCard['keywords']>;
};

type PlayerPublicState = {
  core: number;
  maxCore: number;
  energy: number;
  maxEnergy: number;
  deckCount: number;
  handCount: number;
  trapCount: number;
  board: Array<BoardUnit | null>;
  fatigue: number;
};

type LogEntry = { id: string; text: string; tone: 'normal' | 'good' | 'bad' | 'system'; at: number };

type DuelState = {
  currentPlayerId: string | null;
  phase: 'main' | 'battle';
  turnNo: number;
  players: Record<string, PlayerPublicState>;
  log: LogEntry[];
  winnerPlayerId: string | null;
  lastActionAt: number;
};

type PrivateState = {
  deck: HandEntry[];
  hand: HandEntry[];
  traps: TrapEntry[];
  fatigue: number;
};

type RoomRow = {
  id: string;
  code: string;
  host_session_id: string;
  host_user_id: string | null;
  mode: 'quick' | 'grand';
  status: 'lobby' | 'playing' | 'finished';
  state: DuelState;
  winner_player_id: string | null;
  match_no: number;
  created_at: string;
  updated_at: string;
};

type PlayerRow = {
  id: string;
  room_id: string;
  session_id: string;
  user_id: string | null;
  deck_id: string | null;
  user_name: string;
  player_no: number;
  ready: boolean;
  created_at: string;
};

type PrivateRow = {
  id: string;
  room_id: string;
  player_id: string;
  session_id: string;
  state: PrivateState;
};

type ProfileRow = {
  id: string;
  display_name: string;
  friend_code: string;
  bio: string;
  title: string;
  avatar_id: string;
  level: number;
  xp: number;
  points: number;
  wins: number;
  losses: number;
  pickup_pity: number;
  starter_claimed: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
};

type PublicProfile = {
  id: string;
  displayName: string;
  friendCode: string;
  bio: string;
  title: string;
  avatarId: string;
  level: number;
  wins: number;
  losses: number;
  lastSeen: string;
  online: boolean;
};

type FriendRequestView = {
  id: string;
  profile: PublicProfile;
  createdAt: string;
};

type FriendView = PublicProfile & { friendsSince: string };

type SocialView = {
  friends: FriendView[];
  incoming: FriendRequestView[];
  outgoing: FriendRequestView[];
};

type MatchmakingView = {
  matched: boolean;
  waiting: boolean;
  waiters: number;
  view?: unknown;
};

type CollectionRow = { user_id: string; card_id: string; quantity: number };
type DeckRow = {
  id: string;
  user_id: string;
  name: string;
  cards: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type PackId = 'common' | 'rare' | 'pickup' | 'royal';
type PackCatalogItem = {
  id: PackId;
  name: string;
  subtitle: string;
  price: number;
  accent: string;
  guarantee: string;
  description: string;
};

type ActionBody = {
  action?: string;
  sessionId?: string;
  userId?: string;
  userName?: string;
  roomId?: string;
  code?: string;
  mode?: 'quick' | 'grand';
  cardUid?: string;
  lane?: number;
  target?: { kind: 'core'; playerId: string } | { kind: 'unit'; playerId: string; instanceId: string } | null;
  attackerId?: string;
  deckId?: string;
  deckName?: string;
  cards?: string[];
  packType?: PackId;
  message?: string;
  friendCode?: string;
  requestId?: string;
  friendId?: string;
  decision?: 'accept' | 'decline';
  displayName?: string;
  bio?: string;
  title?: string;
  avatarId?: string;
  messageId?: number;
};


const PROFILE_TITLES = [
  '신입 듀얼리스트',
  '전술 연구가',
  '덱 아키텍트',
  '아르카나 수집가',
  '연승의 도전자',
  '그랜드 마스터',
] as const;

const AVATAR_IDS = ['violet', 'ember', 'tide', 'grove', 'crown', 'void'] as const;
const CHAT_COOLDOWN_MS = 1200;
const ONLINE_WINDOW_MS = 150_000;

function profileOnline(lastSeen: string) {
  const timestamp = new Date(lastSeen).getTime();
  return Number.isFinite(timestamp) && Date.now() - timestamp < ONLINE_WINDOW_MS;
}

function toPublicProfile(profile: ProfileRow): PublicProfile {
  return {
    id: profile.id,
    displayName: profile.display_name,
    friendCode: profile.friend_code,
    bio: profile.bio,
    title: profile.title,
    avatarId: profile.avatar_id,
    level: profile.level,
    wins: profile.wins,
    losses: profile.losses,
    lastSeen: profile.last_seen,
    online: profileOnline(profile.last_seen),
  };
}

const PACK_CATALOG: PackCatalogItem[] = [
  {
    id: 'common', name: '일반 아르카나 팩', subtitle: 'COMMON PACK', price: 120, accent: 'slate',
    guarantee: '희귀 이상 1장 보장',
    description: '덱의 기본 골격을 빠르게 채우는 5장 팩입니다.',
  },
  {
    id: 'rare', name: '희귀 아르카나 팩', subtitle: 'RARE PACK', price: 360, accent: 'azure',
    guarantee: '희귀 이상 2장 보장',
    description: '주력 카드와 콤보 파츠를 노리기 좋은 5장 팩입니다.',
  },
  {
    id: 'pickup', name: '불사조의 귀환', subtitle: 'PICKUP PACK', price: 650, accent: 'ember',
    guarantee: '픽업 확률 상승 · 10회 내 영웅 이상',
    description: '불사조의 후계자와 화염·왕관 계열 카드가 크게 강화됩니다.',
  },
  {
    id: 'royal', name: '왕실 비전 팩', subtitle: 'ROYAL PACK', price: 950, accent: 'gold',
    guarantee: '영웅 이상 2장 보장',
    description: '고등급 카드 중심으로 구성된 최상위 5장 팩입니다.',
  },
];

function env(name: string, fallback?: string) {
  const value = process.env[name] || (fallback ? process.env[fallback] : undefined);
  if (!value) throw new Error(`Render 환경변수 ${name}${fallback ? ` 또는 ${fallback}` : ''}를 확인해 주세요.`);
  return value;
}

function serverClient(): SupabaseClient {
  const url = env('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error('Render 환경변수 SUPABASE_SECRET_KEY 또는 SUPABASE_SERVICE_ROLE_KEY를 확인해 주세요.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function authClient(): SupabaseClient {
  const url = env('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL');
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new Error('Render 환경변수 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 또는 NEXT_PUBLIC_SUPABASE_ANON_KEY를 확인해 주세요.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

async function requireUser(request: NextRequest): Promise<User> {
  const authorization = request.headers.get('authorization') || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token) throw new Error('로그인이 필요합니다.');
  const { data, error } = await authClient().auth.getUser(token);
  if (error || !data.user) throw new Error('로그인 세션이 만료되었습니다. 다시 로그인해 주세요.');
  return data.user;
}

function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function cleanText(value: unknown, max = 18) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').slice(0, max);
}

function hashSession(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function makeRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i += 1) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function log(state: DuelState, text: string, tone: LogEntry['tone'] = 'normal') {
  state.log.push({ id: crypto.randomUUID(), text, tone, at: Date.now() });
  if (state.log.length > 18) state.log = state.log.slice(-18);
  state.lastActionAt = Date.now();
}

function otherPlayerId(players: PlayerRow[], playerId: string) {
  return players.find((player) => player.id !== playerId)?.id ?? null;
}

function getPublicPlayer(state: DuelState, playerId: string) {
  const publicState = state.players[playerId];
  if (!publicState) throw new Error('플레이어 상태를 찾을 수 없습니다.');
  return publicState;
}

function syncCounts(state: DuelState, playerId: string, privateState: PrivateState) {
  const publicState = getPublicPlayer(state, playerId);
  publicState.deckCount = privateState.deck.length;
  publicState.handCount = privateState.hand.length;
  publicState.trapCount = privateState.traps.length;
  publicState.fatigue = privateState.fatigue;
}

function drawCards(
  state: DuelState,
  playerId: string,
  privateState: PrivateState,
  count: number,
  allowFatigue = true,
) {
  const publicState = getPublicPlayer(state, playerId);
  for (let i = 0; i < count; i += 1) {
    const top = privateState.deck.shift();
    if (!top) {
      if (allowFatigue) {
        privateState.fatigue += 1;
        publicState.core -= privateState.fatigue;
        log(state, `덱이 비어 피로 피해 ${privateState.fatigue}을 받았습니다.`, 'bad');
      }
      continue;
    }
    if (privateState.hand.length >= 9) {
      const card = CARD_MAP.get(top.cardId);
      log(state, `손패가 가득 차 ${card?.name ?? '카드'}가 소멸했습니다.`, 'bad');
      continue;
    }
    privateState.hand.push(top);
  }
  syncCounts(state, playerId, privateState);
}

function applyDamage(unit: BoardUnit, amount: number) {
  let remaining = Math.max(0, amount);
  const absorbed = Math.min(unit.shield, remaining);
  unit.shield -= absorbed;
  remaining -= absorbed;
  unit.health -= remaining;
  return { absorbed, healthDamage: remaining };
}

function healUnit(unit: BoardUnit, amount: number) {
  const before = unit.health;
  unit.health = Math.min(unit.maxHealth, unit.health + amount);
  return unit.health - before;
}

function findUnit(state: DuelState, playerId: string, instanceId: string) {
  const player = getPublicPlayer(state, playerId);
  const lane = player.board.findIndex((unit) => unit?.instanceId === instanceId);
  return lane >= 0 ? { unit: player.board[lane] as BoardUnit, lane, player } : null;
}

function firstEmptyLane(state: DuelState, playerId: string, preferred?: number) {
  const board = getPublicPlayer(state, playerId).board;
  if (typeof preferred === 'number' && preferred >= 0 && preferred < 3 && !board[preferred]) return preferred;
  return board.findIndex((unit) => unit === null);
}

function createToken(playerId: string, lane: number): BoardUnit {
  return {
    instanceId: crypto.randomUUID(),
    cardId: 'shadow_token',
    name: '그림자 토큰',
    ownerPlayerId: playerId,
    lane,
    attack: 2,
    health: 2,
    maxHealth: 2,
    shield: 0,
    exhausted: true,
    frozen: false,
    rarity: 'common',
    faction: 'void',
    icon: 'TK',
    keywords: [],
  };
}

function getTrapByTrigger(privateState: PrivateState, trigger: TrapTrigger) {
  const index = privateState.traps.findIndex((entry) => CARD_MAP.get(entry.cardId)?.trigger === trigger);
  if (index < 0) return null;
  const [entry] = privateState.traps.splice(index, 1);
  const card = CARD_MAP.get(entry.cardId);
  return card ? { entry, card } : null;
}

function triggerEnemySpellTrap(
  state: DuelState,
  defenderId: string,
  privateStates: Map<string, PrivateState>,
) {
  const defenderPrivate = privateStates.get(defenderId);
  if (!defenderPrivate) return false;
  const trap = getTrapByTrigger(defenderPrivate, 'enemy_spell');
  if (!trap) return false;
  syncCounts(state, defenderId, defenderPrivate);
  log(state, `${trap.card.name} 발동! 상대 주문이 무효화되었습니다.`, 'good');
  return true;
}

function triggerEnemySummonTrap(
  state: DuelState,
  defenderId: string,
  summoned: BoardUnit,
  privateStates: Map<string, PrivateState>,
) {
  const defenderPrivate = privateStates.get(defenderId);
  if (!defenderPrivate) return;
  const trap = getTrapByTrigger(defenderPrivate, 'enemy_summon');
  if (!trap) return;
  applyDamage(summoned, 3);
  syncCounts(state, defenderId, defenderPrivate);
  log(state, `${trap.card.name} 발동! ${summoned.name}에게 피해 3.`, 'bad');
}

function triggerFriendlyAttackedTrap(
  state: DuelState,
  defenderId: string,
  attacker: BoardUnit,
  privateStates: Map<string, PrivateState>,
) {
  const defenderPrivate = privateStates.get(defenderId);
  if (!defenderPrivate) return;
  const trap = getTrapByTrigger(defenderPrivate, 'friendly_attacked');
  if (!trap) return;
  applyDamage(attacker, 3);
  syncCounts(state, defenderId, defenderPrivate);
  log(state, `${trap.card.name} 발동! 공격자에게 피해 3.`, 'good');
}

function triggerCoreAttackTrap(
  state: DuelState,
  defenderId: string,
  attackerId: string,
  attacker: BoardUnit,
  privateStates: Map<string, PrivateState>,
) {
  const defenderPrivate = privateStates.get(defenderId);
  if (!defenderPrivate) return { cancelled: false, reduction: 0 };
  const trap = getTrapByTrigger(defenderPrivate, 'core_attack');
  if (!trap) return { cancelled: false, reduction: 0 };
  syncCounts(state, defenderId, defenderPrivate);
  switch (trap.card.id) {
    case 'frozen_sigil':
      log(state, `${trap.card.name} 발동! 코어 공격이 완전히 취소되었습니다.`, 'good');
      return { cancelled: true, reduction: 999 };
    case 'mirror_snare':
      applyDamage(attacker, 4);
      log(state, `${trap.card.name} 발동! 공격자에게 피해 4, 코어 피해 -2.`, 'good');
      return { cancelled: false, reduction: 2 };
    case 'guardian_oath':
      log(state, `${trap.card.name} 발동! 코어 피해가 5 감소합니다.`, 'good');
      return { cancelled: false, reduction: 5 };
    case 'counter_pulse': {
      const attackerPublic = getPublicPlayer(state, attackerId);
      attackerPublic.core -= 4;
      log(state, `${trap.card.name} 발동! 코어 피해 -3, 상대 코어에 피해 4.`, 'good');
      return { cancelled: false, reduction: 3 };
    }
    default:
      return { cancelled: false, reduction: 0 };
  }
}

function triggerFriendlyDestroyedTrap(
  state: DuelState,
  ownerId: string,
  preferredLane: number,
  privateStates: Map<string, PrivateState>,
) {
  const ownerPrivate = privateStates.get(ownerId);
  if (!ownerPrivate) return;
  const trap = getTrapByTrigger(ownerPrivate, 'friendly_destroyed');
  if (!trap) return;
  const lane = firstEmptyLane(state, ownerId, preferredLane);
  if (lane >= 0) {
    getPublicPlayer(state, ownerId).board[lane] = createToken(ownerId, lane);
    log(state, `${trap.card.name} 발동! 라인 ${lane + 1}에 2/2 그림자 토큰을 소환했습니다.`, 'good');
  } else {
    log(state, `${trap.card.name}이 발동했지만 빈 라인이 없습니다.`, 'bad');
  }
  syncCounts(state, ownerId, ownerPrivate);
}

function resolveDeaths(
  state: DuelState,
  playerIds: string[],
  privateStates: Map<string, PrivateState>,
) {
  const destroyed: Array<{ ownerId: string; lane: number; name: string }> = [];
  for (const playerId of playerIds) {
    const publicState = getPublicPlayer(state, playerId);
    publicState.board.forEach((unit, lane) => {
      if (unit && unit.health <= 0) {
        destroyed.push({ ownerId: playerId, lane, name: unit.name });
        publicState.board[lane] = null;
      }
    });
  }
  for (const item of destroyed) {
    log(state, `${item.name}이(가) 파괴되었습니다.`, 'bad');
    triggerFriendlyDestroyedTrap(state, item.ownerId, item.lane, privateStates);
  }
}

function checkWinner(state: DuelState, players: PlayerRow[]) {
  const defeated = players.find((player) => (state.players[player.id]?.core ?? 1) <= 0);
  if (!defeated) return null;
  const winner = players.find((player) => player.id !== defeated.id) ?? null;
  state.winnerPlayerId = winner?.id ?? null;
  if (winner) log(state, `${winner.user_name} 님이 결투에서 승리했습니다!`, 'system');
  return winner?.id ?? null;
}

function cardView(entry: HandEntry) {
  const card = CARD_MAP.get(entry.cardId);
  return card ? { uid: entry.uid, card } : null;
}

async function loadRoomContext(supabase: SupabaseClient, roomId: string, sessionId: string) {
  const { data: room, error: roomError } = await supabase
    .from('arcana_rooms')
    .select('*')
    .eq('id', roomId)
    .single();
  if (roomError || !room) throw new Error('방을 찾을 수 없습니다.');

  const { data: players, error: playerError } = await supabase
    .from('arcana_players')
    .select('*')
    .eq('room_id', roomId)
    .order('player_no', { ascending: true });
  if (playerError || !players) throw new Error('플레이어 정보를 불러오지 못했습니다.');

  const sessionKey = hashSession(sessionId);
  const me = (players as PlayerRow[]).find((player) => player.session_id === sessionKey);
  if (!me) throw new Error('이 방의 플레이어가 아닙니다.');

  const { data: privateRows, error: privateError } = await supabase
    .from('arcana_private_states')
    .select('*')
    .eq('room_id', roomId);
  if (privateError) throw new Error('비공개 카드 상태를 불러오지 못했습니다.');

  const privateByPlayer = new Map<string, PrivateState>();
  const privateRowByPlayer = new Map<string, PrivateRow>();
  for (const row of (privateRows ?? []) as PrivateRow[]) {
    privateByPlayer.set(row.player_id, cloneState(row.state));
    privateRowByPlayer.set(row.player_id, row);
  }

  return {
    room: room as RoomRow,
    players: players as PlayerRow[],
    me,
    privateByPlayer,
    privateRowByPlayer,
  };
}

async function persistPrivateStates(
  supabase: SupabaseClient,
  roomId: string,
  players: PlayerRow[],
  privateByPlayer: Map<string, PrivateState>,
) {
  const rows = players
    .map((player) => {
      const state = privateByPlayer.get(player.id);
      if (!state) return null;
      return {
        room_id: roomId,
        player_id: player.id,
        session_id: player.session_id,
        state,
      };
    })
    .filter(Boolean);
  if (!rows.length) return;
  const { error } = await supabase
    .from('arcana_private_states')
    .upsert(rows, { onConflict: 'room_id,player_id' });
  if (error) throw new Error(`비공개 카드 저장 실패: ${error.message}`);
}

async function persistRoom(
  supabase: SupabaseClient,
  roomId: string,
  state: DuelState,
  status: RoomRow['status'],
  winnerPlayerId: string | null,
) {
  const { error } = await supabase
    .from('arcana_rooms')
    .update({
      state,
      status,
      winner_player_id: winnerPlayerId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', roomId);
  if (error) throw new Error(`방 상태 저장 실패: ${error.message}`);
}

function viewFor(
  room: RoomRow,
  players: PlayerRow[],
  me: PlayerRow,
  privateByPlayer: Map<string, PrivateState>,
) {
  const mine = privateByPlayer.get(me.id);
  return {
    room,
    players,
    me,
    hand: (mine?.hand ?? []).map(cardView).filter(Boolean),
    myTraps: (mine?.traps ?? []).map(cardView).filter(Boolean),
  };
}

function initialPublicState(players: PlayerRow[], maxCore: number): DuelState {
  const playerState: Record<string, PlayerPublicState> = {};
  for (const player of players) {
    playerState[player.id] = {
      core: maxCore,
      maxCore,
      energy: 0,
      maxEnergy: 0,
      deckCount: 0,
      handCount: 0,
      trapCount: 0,
      board: [null, null, null],
      fatigue: 0,
    };
  }
  return {
    currentPlayerId: null,
    phase: 'main',
    turnNo: 1,
    players: playerState,
    log: [],
    winnerPlayerId: null,
    lastActionAt: Date.now(),
  };
}

function startFirstTurn(state: DuelState, firstPlayerId: string) {
  state.currentPlayerId = firstPlayerId;
  const player = getPublicPlayer(state, firstPlayerId);
  player.maxEnergy = 1;
  player.energy = 1;
  state.phase = 'main';
  log(state, '결투가 시작되었습니다. 선공 플레이어의 메인 단계입니다.', 'system');
}

function startNextTurn(
  state: DuelState,
  nextPlayerId: string,
  privateState: PrivateState,
) {
  state.currentPlayerId = nextPlayerId;
  state.turnNo += 1;
  state.phase = 'main';
  const player = getPublicPlayer(state, nextPlayerId);
  player.maxEnergy = Math.min(10, player.maxEnergy + 1);
  player.energy = player.maxEnergy;
  player.board.forEach((unit) => {
    if (!unit) return;
    if (unit.frozen) {
      unit.frozen = false;
      unit.exhausted = true;
    } else {
      unit.exhausted = false;
    }
  });
  drawCards(state, nextPlayerId, privateState, 1, true);
  log(state, `${state.turnNo}턴이 시작되었습니다.`, 'system');
}

function ensureTurn(room: RoomRow, me: PlayerRow) {
  if (room.status !== 'playing') throw new Error('현재 결투가 진행 중이 아닙니다.');
  if (room.state.currentPlayerId !== me.id) throw new Error('지금은 상대의 턴입니다.');
  if (room.state.winnerPlayerId) throw new Error('이미 종료된 결투입니다.');
}

function validateTarget(card: ArcanaCard, state: DuelState, meId: string, target: ActionBody['target']) {
  const targetType: CardTarget = card.target ?? 'none';
  if (targetType === 'none') return;
  if (!target) throw new Error('카드의 대상을 선택해 주세요.');
  const isMine = target.playerId === meId;
  if (target.kind === 'unit') {
    const found = findUnit(state, target.playerId, target.instanceId);
    if (!found) throw new Error('대상 유닛을 찾을 수 없습니다.');
  }
  if (targetType === 'enemy_any' && isMine) throw new Error('적 대상을 선택해 주세요.');
  if (targetType === 'enemy_unit' && (isMine || target.kind !== 'unit')) throw new Error('적 유닛을 선택해 주세요.');
  if (targetType === 'friendly_any' && !isMine) throw new Error('아군 대상을 선택해 주세요.');
  if (targetType === 'friendly_unit' && (!isMine || target.kind !== 'unit')) throw new Error('아군 유닛을 선택해 주세요.');
}

function applySpell(
  card: ArcanaCard,
  state: DuelState,
  me: PlayerRow,
  players: PlayerRow[],
  privateByPlayer: Map<string, PrivateState>,
  target: ActionBody['target'],
) {
  if (!card.effect) return;
  const myPublic = getPublicPlayer(state, me.id);
  const opponentId = otherPlayerId(players, me.id);
  const myPrivate = privateByPlayer.get(me.id);

  switch (card.effect.kind) {
    case 'damage': {
      if (!target) throw new Error('대상을 선택해 주세요.');
      if (target.kind === 'core') {
        const targetPublic = getPublicPlayer(state, target.playerId);
        targetPublic.core -= card.effect.amount;
        log(state, `${card.name}: 적 코어에 피해 ${card.effect.amount}.`, 'bad');
      } else {
        const found = findUnit(state, target.playerId, target.instanceId);
        if (!found) throw new Error('대상 유닛이 없습니다.');
        applyDamage(found.unit, card.effect.amount);
        log(state, `${card.name}: ${found.unit.name}에게 피해 ${card.effect.amount}.`, 'bad');
      }
      break;
    }
    case 'heal': {
      if (!target) throw new Error('대상을 선택해 주세요.');
      if (target.kind === 'core') {
        const targetPublic = getPublicPlayer(state, target.playerId);
        const before = targetPublic.core;
        targetPublic.core = Math.min(targetPublic.maxCore, targetPublic.core + card.effect.amount);
        log(state, `${card.name}: 코어를 ${targetPublic.core - before} 회복.`, 'good');
      } else {
        const found = findUnit(state, target.playerId, target.instanceId);
        if (!found) throw new Error('대상 유닛이 없습니다.');
        const healed = healUnit(found.unit, card.effect.amount);
        log(state, `${card.name}: ${found.unit.name}의 체력을 ${healed} 회복.`, 'good');
      }
      if (card.id === 'second_breath' && myPrivate) drawCards(state, me.id, myPrivate, 1, true);
      break;
    }
    case 'buff': {
      if (!target || target.kind !== 'unit') throw new Error('아군 유닛을 선택해 주세요.');
      const found = findUnit(state, target.playerId, target.instanceId);
      if (!found) throw new Error('대상 유닛이 없습니다.');
      found.unit.attack += card.effect.attack;
      found.unit.maxHealth += card.effect.health;
      found.unit.health += card.effect.health;
      log(state, `${card.name}: ${found.unit.name}에게 +${card.effect.attack}/+${card.effect.health}.`, 'good');
      break;
    }
    case 'draw':
      if (!myPrivate) throw new Error('손패 상태를 찾을 수 없습니다.');
      drawCards(state, me.id, myPrivate, card.effect.amount, true);
      if (card.id === 'shadow_bargain') {
        myPublic.core -= 3;
        log(state, `${card.name}: 카드를 3장 뽑고 내 코어에 피해 3.`, 'bad');
      } else {
        log(state, `${card.name}: 카드를 ${card.effect.amount}장 뽑았습니다.`, 'good');
      }
      break;
    case 'aoe': {
      if (!opponentId) throw new Error('상대를 찾을 수 없습니다.');
      const amount = card.effect.amount;
      getPublicPlayer(state, opponentId).board.forEach((unit) => {
        if (unit) applyDamage(unit, amount);
      });
      log(state, `${card.name}: 모든 적 유닛에게 피해 ${amount}.`, 'bad');
      break;
    }
    case 'energy':
      myPublic.energy = Math.min(10, myPublic.energy + card.effect.amount);
      log(state, `${card.name}: 에너지를 ${card.effect.amount} 회복.`, 'good');
      break;
    case 'shield': {
      if (!target || target.kind !== 'unit') throw new Error('아군 유닛을 선택해 주세요.');
      const found = findUnit(state, target.playerId, target.instanceId);
      if (!found) throw new Error('대상 유닛이 없습니다.');
      found.unit.shield += card.effect.amount;
      log(state, `${card.name}: ${found.unit.name}에게 보호막 ${card.effect.amount}.`, 'good');
      break;
    }
    case 'freeze': {
      if (!target || target.kind !== 'unit') throw new Error('적 유닛을 선택해 주세요.');
      const found = findUnit(state, target.playerId, target.instanceId);
      if (!found) throw new Error('대상 유닛이 없습니다.');
      found.unit.frozen = true;
      found.unit.exhausted = true;
      log(state, `${card.name}: ${found.unit.name}이(가) 빙결되었습니다.`, 'good');
      break;
    }
  }
}



type AccountView = {
  profile: ProfileRow;
  collection: CollectionRow[];
  decks: DeckRow[];
  packs: PackCatalogItem[];
  deckRules: {
    size: number;
    minUnits: number;
    maxSpells: number;
    maxTraps: number;
    copyLimits: Record<CardRarity, number>;
  };
};

function accountDisplayName(user: User) {
  const meta = cleanText(user.user_metadata?.display_name, 16);
  const emailPrefix = cleanText(user.email?.split('@')[0], 16);
  return meta || emailPrefix || 'DUELIST';
}

async function loadAccountView(supabase: SupabaseClient, userId: string): Promise<AccountView> {
  const [profileResult, collectionResult, deckResult] = await Promise.all([
    supabase.from('arcana_profiles').select('*').eq('id', userId).single(),
    supabase.from('arcana_collections').select('user_id,card_id,quantity').eq('user_id', userId).order('card_id'),
    supabase.from('arcana_decks').select('*').eq('user_id', userId).order('is_active', { ascending: false }).order('updated_at', { ascending: false }),
  ]);
  if (profileResult.error || !profileResult.data) throw new Error(`프로필 불러오기 실패: ${profileResult.error?.message ?? '데이터 없음'}`);
  if (collectionResult.error) throw new Error(`보유 카드 불러오기 실패: ${collectionResult.error.message}`);
  if (deckResult.error) throw new Error(`덱 불러오기 실패: ${deckResult.error.message}`);
  return {
    profile: profileResult.data as ProfileRow,
    collection: (collectionResult.data ?? []) as CollectionRow[],
    decks: (deckResult.data ?? []).map((deck) => ({ ...deck, cards: Array.isArray(deck.cards) ? deck.cards : [] })) as DeckRow[],
    packs: PACK_CATALOG,
    deckRules: {
      size: DECK_SIZE,
      minUnits: 10,
      maxSpells: 8,
      maxTraps: 6,
      copyLimits: COPY_LIMIT_BY_RARITY,
    },
  };
}

async function ensureAccount(supabase: SupabaseClient, user: User): Promise<AccountView> {
  const { error } = await supabase.rpc('arcana_grant_starter', {
    p_user_id: user.id,
    p_display_name: accountDisplayName(user),
  });
  if (error) throw new Error(`계정 초기화 실패: ${error.message}. v21 SQL을 실행했는지 확인해 주세요.`);
  await supabase.from('arcana_profiles').update({ last_seen: new Date().toISOString() }).eq('id', user.id);
  return loadAccountView(supabase, user.id);
}

async function getActiveDeck(supabase: SupabaseClient, userId: string): Promise<DeckRow> {
  const { data, error } = await supabase
    .from('arcana_decks')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .single();
  if (error || !data) throw new Error('활성 덱이 없습니다. 덱 메뉴에서 사용할 덱을 선택해 주세요.');
  const deck = { ...data, cards: Array.isArray(data.cards) ? data.cards : [] } as DeckRow;
  const validation = validateDeckList(deck.cards);
  if (!validation.ok) throw new Error(`활성 덱 오류: ${'message' in validation ? validation.message : '덱 구성이 올바르지 않습니다.'}`);
  return deck;
}

async function validateOwnedDeck(supabase: SupabaseClient, userId: string, cards: string[]) {
  const validation = validateDeckList(cards);
  if (!validation.ok) throw new Error('message' in validation ? validation.message : '덱 구성이 올바르지 않습니다.');
  const { data, error } = await supabase
    .from('arcana_collections')
    .select('card_id,quantity')
    .eq('user_id', userId);
  if (error) throw new Error(`보유 카드 확인 실패: ${error.message}`);
  const owned = new Map<string, number>((data ?? []).map((row: { card_id: unknown; quantity: unknown }) => [String(row.card_id), Number(row.quantity)]));
  const used = new Map<string, number>();
  for (const cardId of cards) used.set(cardId, (used.get(cardId) ?? 0) + 1);
  for (const [cardId, count] of used) {
    const card = CARD_MAP.get(cardId);
    if (!card) throw new Error('존재하지 않는 카드가 포함되어 있습니다.');
    const quantity = owned.get(cardId) ?? 0;
    if (count > quantity) throw new Error(`${card.name} 보유 수량이 부족합니다. 보유 ${quantity}장 / 사용 ${count}장`);
  }
}

function randomFloat() {
  return randomInt(0, 1_000_000) / 1_000_000;
}

function pickRarity(weights: Partial<Record<CardRarity, number>>): CardRarity {
  const entries = (Object.entries(weights) as Array<[CardRarity, number]>).filter(([, weight]) => weight > 0);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let roll = randomFloat() * total;
  for (const [rarity, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return entries[entries.length - 1][0];
}

function pickCardByRarity(rarity: CardRarity, pickupBoost = false): string {
  const all = CARD_POOL.filter((card) => card.rarity === rarity);
  const featured = all.filter((card) => PICKUP_CARD_IDS.includes(card.id));
  const pool = pickupBoost && featured.length > 0 && randomFloat() < 0.62 ? featured : all;
  return pool[randomInt(0, pool.length)].id;
}

function drawGeneral(pickupBoost = false) {
  const rarity = pickRarity({ common: 54, rare: 35, epic: 9.5, legendary: 1.5 });
  return pickCardByRarity(rarity, pickupBoost);
}

function drawRarePlus(pickupBoost = false) {
  const rarity = pickRarity({ rare: 82, epic: 15, legendary: 3 });
  return pickCardByRarity(rarity, pickupBoost);
}

function drawEpicPlus(pickupBoost = false) {
  const rarity = pickRarity({ epic: 88, legendary: 12 });
  return pickCardByRarity(rarity, pickupBoost);
}

function buildPack(packType: PackId, currentPity: number) {
  let cardIds: string[] = [];
  let nextPity = currentPity;
  if (packType === 'common') {
    cardIds = [
      pickCardByRarity(pickRarity({ common: 82, rare: 15, epic: 2.7, legendary: 0.3 })),
      pickCardByRarity(pickRarity({ common: 82, rare: 15, epic: 2.7, legendary: 0.3 })),
      pickCardByRarity(pickRarity({ common: 82, rare: 15, epic: 2.7, legendary: 0.3 })),
      pickCardByRarity(pickRarity({ common: 82, rare: 15, epic: 2.7, legendary: 0.3 })),
      drawRarePlus(false),
    ];
  } else if (packType === 'rare') {
    cardIds = [drawGeneral(), drawGeneral(), drawGeneral(), drawRarePlus(), drawRarePlus()];
  } else if (packType === 'pickup') {
    cardIds = [drawGeneral(true), drawGeneral(true), drawGeneral(true), drawGeneral(true), drawRarePlus(true)];
    if (currentPity >= 9) cardIds[0] = drawEpicPlus(true);
    const hasEpicPlus = cardIds.some((id) => ['epic', 'legendary'].includes(CARD_MAP.get(id)?.rarity ?? 'common'));
    nextPity = hasEpicPlus ? 0 : currentPity + 1;
  } else {
    cardIds = [drawGeneral(), drawRarePlus(), drawRarePlus(), drawEpicPlus(), drawEpicPlus()];
  }
  return { cardIds, nextPity };
}

async function handleSaveDeck(supabase: SupabaseClient, userId: string, body: ActionBody) {
  const cards = Array.isArray(body.cards) ? body.cards.map((id) => cleanText(id, 60)).filter(Boolean) : [];
  const name = cleanText(body.deckName, 20) || '새 덱';
  const deckId = cleanText(body.deckId, 80);
  await validateOwnedDeck(supabase, userId, cards);

  if (deckId) {
    const { data: existing, error: existingError } = await supabase
      .from('arcana_decks').select('id').eq('id', deckId).eq('user_id', userId).single();
    if (existingError || !existing) throw new Error('수정할 덱을 찾을 수 없습니다.');
    const { error } = await supabase.from('arcana_decks').update({ name, cards, updated_at: new Date().toISOString() }).eq('id', deckId).eq('user_id', userId);
    if (error) throw new Error(`덱 저장 실패: ${error.message}`);
  } else {
    const { count, error: countError } = await supabase.from('arcana_decks').select('id', { count: 'exact', head: true }).eq('user_id', userId);
    if (countError) throw new Error(`덱 슬롯 확인 실패: ${countError.message}`);
    if ((count ?? 0) >= 5) throw new Error('덱은 최대 5개까지 만들 수 있습니다.');
    const { error } = await supabase.from('arcana_decks').insert({ user_id: userId, name, cards, is_active: (count ?? 0) === 0 });
    if (error) throw new Error(`새 덱 생성 실패: ${error.message}`);
  }
  return loadAccountView(supabase, userId);
}

async function handleSetActiveDeck(supabase: SupabaseClient, userId: string, body: ActionBody) {
  const deckId = cleanText(body.deckId, 80);
  const { data: deck, error } = await supabase.from('arcana_decks').select('*').eq('id', deckId).eq('user_id', userId).single();
  if (error || !deck) throw new Error('선택한 덱을 찾을 수 없습니다.');
  const cards = Array.isArray(deck.cards) ? deck.cards.map(String) : [];
  await validateOwnedDeck(supabase, userId, cards);
  const { error: offError } = await supabase.from('arcana_decks').update({ is_active: false }).eq('user_id', userId);
  if (offError) throw new Error(`활성 덱 변경 실패: ${offError.message}`);
  const { error: onError } = await supabase.from('arcana_decks').update({ is_active: true, updated_at: new Date().toISOString() }).eq('id', deckId).eq('user_id', userId);
  if (onError) throw new Error(`활성 덱 변경 실패: ${onError.message}`);
  return loadAccountView(supabase, userId);
}

async function handleDeleteDeck(supabase: SupabaseClient, userId: string, body: ActionBody) {
  const deckId = cleanText(body.deckId, 80);
  const { data: decks, error } = await supabase.from('arcana_decks').select('id,is_active').eq('user_id', userId);
  if (error) throw new Error(`덱 목록 확인 실패: ${error.message}`);
  const target = (decks ?? []).find((deck) => deck.id === deckId);
  if (!target) throw new Error('삭제할 덱을 찾을 수 없습니다.');
  if (target.is_active) throw new Error('현재 사용 중인 덱은 삭제할 수 없습니다.');
  if ((decks ?? []).length <= 1) throw new Error('최소 한 개의 덱은 남겨야 합니다.');
  const { error: deleteError } = await supabase.from('arcana_decks').delete().eq('id', deckId).eq('user_id', userId);
  if (deleteError) throw new Error(`덱 삭제 실패: ${deleteError.message}`);
  return loadAccountView(supabase, userId);
}

async function handleOpenPack(supabase: SupabaseClient, userId: string, body: ActionBody) {
  const packType = body.packType;
  const pack = PACK_CATALOG.find((item) => item.id === packType);
  if (!pack || !packType) throw new Error('존재하지 않는 카드팩입니다.');
  const { data: profile, error: profileError } = await supabase.from('arcana_profiles').select('points,pickup_pity').eq('id', userId).single();
  if (profileError || !profile) throw new Error('포인트 정보를 불러오지 못했습니다.');
  if (profile.points < pack.price) throw new Error(`포인트가 부족합니다. 필요 ${pack.price} AP`);
  const result = buildPack(packType, Number(profile.pickup_pity ?? 0));
  const { error } = await supabase.rpc('arcana_apply_pack_opening', {
    p_user_id: userId,
    p_pack_type: packType,
    p_cost: pack.price,
    p_cards: result.cardIds,
    p_next_pity: result.nextPity,
  });
  if (error) throw new Error(`팩 개봉 실패: ${error.message}`);
  return {
    account: await loadAccountView(supabase, userId),
    opening: { pack, cardIds: result.cardIds },
  };
}

async function handleSendMessage(supabase: SupabaseClient, userId: string, userName: string, body: ActionBody) {
  const message = cleanText(body.message, 180);
  const roomId = cleanText(body.roomId, 80) || null;
  if (!message) throw new Error('메시지를 입력해 주세요.');
  if (/https?:\/\//i.test(message)) throw new Error('채팅에는 외부 링크를 보낼 수 없습니다.');
  if (roomId) {
    const { data: member, error } = await supabase.from('arcana_players').select('id').eq('room_id', roomId).eq('user_id', userId).maybeSingle();
    if (error || !member) throw new Error('이 방의 참가자만 채팅할 수 있습니다.');
  }
  const { data: recent } = await supabase
    .from('arcana_messages')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recent?.created_at && Date.now() - new Date(recent.created_at).getTime() < CHAT_COOLDOWN_MS) {
    throw new Error('메시지를 너무 빠르게 보내고 있습니다. 잠시 후 다시 시도해 주세요.');
  }
  const { error } = await supabase.from('arcana_messages').insert({
    room_id: roomId,
    session_id: hashSession(userId),
    user_id: userId,
    user_name: userName,
    body: message,
  });
  if (error) throw new Error(`채팅 전송 실패: ${error.message}`);
  return { sent: true };
}

async function loadSocialView(supabase: SupabaseClient, userId: string): Promise<SocialView> {
  const [friendRowsResult, incomingResult, outgoingResult] = await Promise.all([
    supabase.from('arcana_friends').select('friend_id,created_at').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('arcana_friend_requests').select('id,sender_id,created_at').eq('receiver_id', userId).eq('status', 'pending').order('created_at', { ascending: false }),
    supabase.from('arcana_friend_requests').select('id,receiver_id,created_at').eq('sender_id', userId).eq('status', 'pending').order('created_at', { ascending: false }),
  ]);
  if (friendRowsResult.error) throw new Error(`친구 목록 로딩 실패: ${friendRowsResult.error.message}`);
  if (incomingResult.error) throw new Error(`받은 요청 로딩 실패: ${incomingResult.error.message}`);
  if (outgoingResult.error) throw new Error(`보낸 요청 로딩 실패: ${outgoingResult.error.message}`);

  const friendRows = friendRowsResult.data ?? [];
  const incomingRows = incomingResult.data ?? [];
  const outgoingRows = outgoingResult.data ?? [];
  const profileIds = Array.from(new Set([
    ...friendRows.map((row) => String(row.friend_id)),
    ...incomingRows.map((row) => String(row.sender_id)),
    ...outgoingRows.map((row) => String(row.receiver_id)),
  ]));

  let profiles: ProfileRow[] = [];
  if (profileIds.length > 0) {
    const { data, error } = await supabase.from('arcana_profiles').select('*').in('id', profileIds);
    if (error) throw new Error(`친구 프로필 로딩 실패: ${error.message}`);
    profiles = (data ?? []) as ProfileRow[];
  }
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));

  return {
    friends: friendRows.flatMap((row) => {
      const profile = profileMap.get(String(row.friend_id));
      return profile ? [{ ...toPublicProfile(profile), friendsSince: String(row.created_at) }] : [];
    }).sort((a, b) => Number(b.online) - Number(a.online) || a.displayName.localeCompare(b.displayName, 'ko')),
    incoming: incomingRows.flatMap((row) => {
      const profile = profileMap.get(String(row.sender_id));
      return profile ? [{ id: String(row.id), profile: toPublicProfile(profile), createdAt: String(row.created_at) }] : [];
    }),
    outgoing: outgoingRows.flatMap((row) => {
      const profile = profileMap.get(String(row.receiver_id));
      return profile ? [{ id: String(row.id), profile: toPublicProfile(profile), createdAt: String(row.created_at) }] : [];
    }),
  };
}

async function handleHeartbeat(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase.from('arcana_profiles').update({ last_seen: new Date().toISOString() }).eq('id', userId);
  if (error) throw new Error(`접속 상태 갱신 실패: ${error.message}`);
  return { online: true };
}

async function handleUpdateProfile(supabase: SupabaseClient, userId: string, body: ActionBody) {
  const displayName = cleanText(body.displayName, 16);
  const bio = cleanText(body.bio, 100);
  const title = cleanText(body.title, 24);
  const avatarId = cleanText(body.avatarId, 16);
  if (displayName.length < 2) throw new Error('플레이어 이름은 2자 이상이어야 합니다.');
  if (!PROFILE_TITLES.includes(title as (typeof PROFILE_TITLES)[number])) throw new Error('사용할 수 없는 칭호입니다.');
  if (!AVATAR_IDS.includes(avatarId as (typeof AVATAR_IDS)[number])) throw new Error('사용할 수 없는 프로필 문양입니다.');
  const { error } = await supabase.from('arcana_profiles').update({
    display_name: displayName,
    bio,
    title,
    avatar_id: avatarId,
    last_seen: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq('id', userId);
  if (error) throw new Error(`프로필 저장 실패: ${error.message}`);
  return loadAccountView(supabase, userId);
}

async function handleSearchPlayer(supabase: SupabaseClient, userId: string, body: ActionBody) {
  const friendCode = cleanText(body.friendCode, 20).toUpperCase();
  if (!friendCode) throw new Error('친구 코드를 입력해 주세요.');
  const { data, error } = await supabase.from('arcana_profiles').select('*').eq('friend_code', friendCode).maybeSingle();
  if (error) throw new Error(`플레이어 검색 실패: ${error.message}`);
  if (!data) throw new Error('해당 친구 코드의 플레이어를 찾지 못했습니다.');
  if (data.id === userId) throw new Error('자기 자신은 친구로 추가할 수 없습니다.');
  return toPublicProfile(data as ProfileRow);
}

async function handleSendFriendRequest(supabase: SupabaseClient, userId: string, body: ActionBody) {
  const friendCode = cleanText(body.friendCode, 20).toUpperCase();
  const { data: target, error: targetError } = await supabase.from('arcana_profiles').select('id').eq('friend_code', friendCode).maybeSingle();
  if (targetError || !target) throw new Error('해당 친구 코드의 플레이어를 찾지 못했습니다.');
  if (target.id === userId) throw new Error('자기 자신은 친구로 추가할 수 없습니다.');
  const { data: existingFriend } = await supabase.from('arcana_friends').select('friend_id').eq('user_id', userId).eq('friend_id', target.id).maybeSingle();
  if (existingFriend) throw new Error('이미 친구인 플레이어입니다.');
  const { data: reverse } = await supabase.from('arcana_friend_requests').select('id').eq('sender_id', target.id).eq('receiver_id', userId).eq('status', 'pending').maybeSingle();
  if (reverse) throw new Error('상대가 이미 친구 요청을 보냈습니다. 받은 요청에서 수락해 주세요.');
  const { error } = await supabase.from('arcana_friend_requests').upsert({
    sender_id: userId,
    receiver_id: target.id,
    status: 'pending',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'sender_id,receiver_id' });
  if (error) throw new Error(`친구 요청 실패: ${error.message}`);
  return loadSocialView(supabase, userId);
}

async function handleRespondFriendRequest(supabase: SupabaseClient, userId: string, body: ActionBody) {
  const requestId = cleanText(body.requestId, 80);
  const decision = body.decision === 'accept' ? 'accept' : 'decline';
  if (!requestId) throw new Error('친구 요청을 찾을 수 없습니다.');
  if (decision === 'accept') {
    const { error } = await supabase.rpc('arcana_accept_friend_request', { p_request_id: requestId, p_user_id: userId });
    if (error) throw new Error(`친구 수락 실패: ${error.message}`);
  } else {
    const { error } = await supabase.from('arcana_friend_requests').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', requestId).eq('receiver_id', userId).eq('status', 'pending');
    if (error) throw new Error(`친구 요청 거절 실패: ${error.message}`);
  }
  return loadSocialView(supabase, userId);
}

async function handleCancelFriendRequest(supabase: SupabaseClient, userId: string, body: ActionBody) {
  const requestId = cleanText(body.requestId, 80);
  const { error } = await supabase.from('arcana_friend_requests').delete().eq('id', requestId).eq('sender_id', userId).eq('status', 'pending');
  if (error) throw new Error(`친구 요청 취소 실패: ${error.message}`);
  return loadSocialView(supabase, userId);
}

async function handleRemoveFriend(supabase: SupabaseClient, userId: string, body: ActionBody) {
  const friendId = cleanText(body.friendId, 80);
  if (!friendId) throw new Error('친구 정보를 찾을 수 없습니다.');
  const { error } = await supabase.rpc('arcana_remove_friend', { p_user_id: userId, p_friend_id: friendId });
  if (error) throw new Error(`친구 삭제 실패: ${error.message}`);
  return loadSocialView(supabase, userId);
}

async function createMatchRoom(
  supabase: SupabaseClient,
  mode: 'quick' | 'grand',
  first: { user_id: string; deck_id: string; display_name: string },
  second: { user_id: string; deck_id: string; display_name: string },
) {
  let room: RoomRow | null = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = makeRoomCode();
    const { data, error } = await supabase.from('arcana_rooms').insert({
      code,
      host_session_id: hashSession(first.user_id),
      host_user_id: first.user_id,
      mode,
      status: 'lobby',
      match_no: 1,
      state: initialPublicState([], mode === 'grand' ? 40 : 25),
    }).select('*').single();
    if (!error && data) { room = data as RoomRow; break; }
    if (!error?.message.includes('duplicate')) throw new Error(`매칭방 생성 실패: ${error?.message ?? '알 수 없는 오류'}`);
  }
  if (!room) throw new Error('매칭방을 생성하지 못했습니다.');
  const order = randomInt(0, 2) === 0 ? [first, second] : [second, first];
  const { error: playersError } = await supabase.from('arcana_players').insert(order.map((entry, index) => ({
    room_id: room!.id,
    session_id: hashSession(entry.user_id),
    user_id: entry.user_id,
    deck_id: entry.deck_id,
    user_name: entry.display_name,
    player_no: index + 1,
    ready: false,
  })));
  if (playersError) throw new Error(`매칭 참가자 생성 실패: ${playersError.message}`);
  return room;
}

async function handleQueueMatch(supabase: SupabaseClient, userId: string, body: ActionBody): Promise<MatchmakingView> {
  const mode = body.mode === 'grand' ? 'grand' : 'quick';
  const deck = await getActiveDeck(supabase, userId);
  const { data: profile, error: profileError } = await supabase.from('arcana_profiles').select('display_name').eq('id', userId).single();
  if (profileError || !profile) throw new Error('프로필을 찾을 수 없습니다.');

  const staleBefore = new Date(Date.now() - 10 * 60_000).toISOString();
  await supabase.from('arcana_match_queue').delete().lt('updated_at', staleBefore);

  const { data: own } = await supabase.from('arcana_match_queue').select('*').eq('user_id', userId).maybeSingle();
  if (own?.status === 'matched' && own.room_id) {
    try {
      const context = await loadRoomContext(supabase, own.room_id, userId);
      if (context.room.status !== 'finished') {
        return { matched: true, waiting: false, waiters: 0, view: viewFor(context.room, context.players, context.me, context.privateByPlayer) };
      }
      await supabase.from('arcana_match_queue').delete().eq('user_id', userId);
    } catch {
      await supabase.from('arcana_match_queue').delete().eq('user_id', userId);
    }
  }
  if (own?.status === 'matching') {
    return { matched: false, waiting: true, waiters: 2 };
  }

  const { data: candidate, error: candidateError } = await supabase
    .from('arcana_match_queue')
    .select('*')
    .eq('mode', mode)
    .eq('status', 'waiting')
    .neq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (candidateError) throw new Error(`매칭 검색 실패: ${candidateError.message}`);

  if (candidate) {
    const { data: claimed, error: claimError } = await supabase
      .from('arcana_match_queue')
      .update({ status: 'matching', updated_at: new Date().toISOString() })
      .eq('user_id', candidate.user_id)
      .eq('status', 'waiting')
      .select('*')
      .maybeSingle();
    if (claimError) throw new Error(`매칭 상대 예약 실패: ${claimError.message}`);
    if (claimed) {
      try {
        const room = await createMatchRoom(
          supabase,
          mode,
          { user_id: String(claimed.user_id), deck_id: String(claimed.deck_id), display_name: String(claimed.display_name) },
          { user_id: userId, deck_id: deck.id, display_name: String(profile.display_name) },
        );
        const now = new Date().toISOString();
        const { error: queueError } = await supabase.from('arcana_match_queue').upsert([
          { user_id: claimed.user_id, mode, deck_id: claimed.deck_id, display_name: claimed.display_name, status: 'matched', room_id: room.id, updated_at: now },
          { user_id: userId, mode, deck_id: deck.id, display_name: profile.display_name, status: 'matched', room_id: room.id, updated_at: now },
        ], { onConflict: 'user_id' });
        if (queueError) throw new Error(`매칭 상태 저장 실패: ${queueError.message}`);
        const context = await loadRoomContext(supabase, room.id, userId);
        return { matched: true, waiting: false, waiters: 0, view: viewFor(context.room, context.players, context.me, context.privateByPlayer) };
      } catch (matchError) {
        await supabase.from('arcana_match_queue').update({ status: 'waiting', room_id: null, updated_at: new Date().toISOString() }).eq('user_id', claimed.user_id).eq('status', 'matching');
        throw matchError;
      }
    }
  }

  const now = new Date().toISOString();
  const { error: queueError } = await supabase.from('arcana_match_queue').upsert({
    user_id: userId,
    mode,
    deck_id: deck.id,
    display_name: profile.display_name,
    status: 'waiting',
    room_id: null,
    created_at: now,
    updated_at: now,
  }, { onConflict: 'user_id' });
  if (queueError) throw new Error(`매칭 등록 실패: ${queueError.message}`);
  const { count } = await supabase.from('arcana_match_queue').select('user_id', { count: 'exact', head: true }).eq('mode', mode).eq('status', 'waiting');
  return { matched: false, waiting: true, waiters: count ?? 1 };
}

async function handleCancelMatch(supabase: SupabaseClient, userId: string) {
  const { error } = await supabase.from('arcana_match_queue').delete().eq('user_id', userId);
  if (error) throw new Error(`매칭 취소 실패: ${error.message}`);
  return { cancelled: true };
}

async function awardMatch(supabase: SupabaseClient, room: RoomRow, state: DuelState, players: PlayerRow[]) {
  if (!state.winnerPlayerId) return;
  const winner = players.find((player) => player.id === state.winnerPlayerId);
  const loser = players.find((player) => player.id !== state.winnerPlayerId);
  if (!winner?.user_id || !loser?.user_id) return;
  const { error } = await supabase.rpc('arcana_award_match', {
    p_room_id: room.id,
    p_match_no: room.match_no ?? 1,
    p_winner_user_id: winner.user_id,
    p_loser_user_id: loser.user_id,
    p_mode: room.mode,
  });
  if (error) throw new Error(`경기 보상 지급 실패: ${error.message}`);
}


async function handleCreateRoom(supabase: SupabaseClient, body: ActionBody) {
  const sessionId = cleanText(body.sessionId, 80);
  const userId = cleanText(body.userId, 80);
  const userName = cleanText(body.userName, 16);
  const mode = body.mode === 'grand' ? 'grand' : 'quick';
  if (!sessionId || !userId || !userName) throw new Error('로그인 정보를 확인할 수 없습니다.');
  const sessionKey = hashSession(sessionId);
  const activeDeck = await getActiveDeck(supabase, userId);

  let room: RoomRow | null = null;
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = makeRoomCode();
    const { data, error } = await supabase
      .from('arcana_rooms')
      .insert({
        code,
        host_session_id: sessionKey,
        host_user_id: userId,
        mode,
        status: 'lobby',
        match_no: 1,
        state: initialPublicState([], mode === 'grand' ? 40 : 25),
      })
      .select('*')
      .single();
    if (!error && data) {
      room = data as RoomRow;
      break;
    }
    if (!error?.message.includes('duplicate')) throw new Error(`방 생성 실패: ${error?.message ?? '알 수 없는 오류'}`);
  }
  if (!room) throw new Error('방 코드를 만들지 못했습니다. 다시 시도해 주세요.');

  const { error: playerError } = await supabase.from('arcana_players').insert({
    room_id: room.id,
    session_id: sessionKey,
    user_id: userId,
    deck_id: activeDeck.id,
    user_name: userName,
    player_no: 1,
    ready: false,
  });
  if (playerError) throw new Error(`플레이어 생성 실패: ${playerError.message}`);

  const context = await loadRoomContext(supabase, room.id, sessionId);
  return viewFor(context.room, context.players, context.me, context.privateByPlayer);
}

async function handleJoinRoom(supabase: SupabaseClient, body: ActionBody) {
  const sessionId = cleanText(body.sessionId, 80);
  const userId = cleanText(body.userId, 80);
  const userName = cleanText(body.userName, 16);
  const code = cleanText(body.code, 8).toUpperCase();
  if (!sessionId || !userId || !userName || !code) throw new Error('방 코드를 입력해 주세요.');
  const sessionKey = hashSession(sessionId);
  const activeDeck = await getActiveDeck(supabase, userId);

  const { data: room, error: roomError } = await supabase.from('arcana_rooms').select('*').eq('code', code).single();
  if (roomError || !room) throw new Error('방 코드를 찾을 수 없습니다.');

  const { data: currentPlayers, error: currentError } = await supabase
    .from('arcana_players').select('*').eq('room_id', room.id).order('player_no', { ascending: true });
  if (currentError) throw new Error('방 정보를 불러오지 못했습니다.');
  const players = (currentPlayers ?? []) as PlayerRow[];
  const existing = players.find((player) => player.session_id === sessionKey || player.user_id === userId);
  if (!existing) {
    if (players.length >= 2) throw new Error('이미 두 명이 참가한 방입니다.');
    if (room.status !== 'lobby') throw new Error('이미 결투가 시작된 방입니다.');
    const { error } = await supabase.from('arcana_players').insert({
      room_id: room.id,
      session_id: sessionKey,
      user_id: userId,
      deck_id: activeDeck.id,
      user_name: userName,
      player_no: 2,
      ready: false,
    });
    if (error) throw new Error(`방 참가 실패: ${error.message}`);
  } else {
    const { error } = await supabase.from('arcana_players').update({
      user_name: userName,
      user_id: userId,
      deck_id: activeDeck.id,
    }).eq('id', existing.id);
    if (error) throw new Error(`재입장 실패: ${error.message}`);
  }

  const context = await loadRoomContext(supabase, room.id, sessionId);
  return viewFor(context.room, context.players, context.me, context.privateByPlayer);
}

async function handleReady(supabase: SupabaseClient, body: ActionBody) {
  const roomId = cleanText(body.roomId, 80);
  const sessionId = cleanText(body.sessionId, 80);
  const context = await loadRoomContext(supabase, roomId, sessionId);
  if (context.room.status !== 'lobby') throw new Error('대기실 상태가 아닙니다.');

  const nextReady = !context.me.ready;
  const { error: readyError } = await supabase.from('arcana_players').update({ ready: nextReady }).eq('id', context.me.id);
  if (readyError) throw new Error(`준비 상태 변경 실패: ${readyError.message}`);

  const { data: refreshedPlayers, error: refreshError } = await supabase
    .from('arcana_players').select('*').eq('room_id', roomId).order('player_no', { ascending: true });
  if (refreshError || !refreshedPlayers) throw new Error('플레이어 상태를 갱신하지 못했습니다.');
  const players = refreshedPlayers as PlayerRow[];

  let room = context.room;
  const privateByPlayer = context.privateByPlayer;
  if (players.length === 2 && players.every((player) => player.ready)) {
    const deckIds = players.map((player) => player.deck_id).filter(Boolean) as string[];
    if (deckIds.length !== 2) throw new Error('한 명 이상의 활성 덱이 없습니다. 방을 나가 덱을 선택해 주세요.');
    const { data: deckRows, error: deckError } = await supabase.from('arcana_decks').select('*').in('id', deckIds);
    if (deckError) throw new Error(`덱 불러오기 실패: ${deckError.message}`);
    const decks = (deckRows ?? []).map((deck) => ({ ...deck, cards: Array.isArray(deck.cards) ? deck.cards : [] })) as DeckRow[];

    const maxCore = room.mode === 'grand' ? 40 : 25;
    const state = initialPublicState(players, maxCore);
    for (const player of players) {
      const deck = decks.find((candidate) => candidate.id === player.deck_id && candidate.user_id === player.user_id);
      if (!deck) throw new Error(`${player.user_name} 님의 덱을 찾을 수 없습니다.`);
      const validation = validateDeckList(deck.cards);
      if (!validation.ok) throw new Error(`${player.user_name} 덱 오류: ${'message' in validation ? validation.message : '덱 구성이 올바르지 않습니다.'}`);
      const privateState: PrivateState = {
        deck: shuffleCardIds(deck.cards).map(makeHandEntry),
        hand: [], traps: [], fatigue: 0,
      };
      drawCards(state, player.id, privateState, 5, false);
      privateByPlayer.set(player.id, privateState);
    }
    const first = players[randomInt(0, players.length)];
    startFirstTurn(state, first.id);
    await persistPrivateStates(supabase, roomId, players, privateByPlayer);
    await persistRoom(supabase, roomId, state, 'playing', null);
    room = { ...room, status: 'playing', state, winner_player_id: null };
  }

  const sessionKey = hashSession(sessionId);
  const me = players.find((player) => player.session_id === sessionKey) ?? context.me;
  return viewFor(room, players, me, privateByPlayer);
}

async function handlePlayCard(supabase: SupabaseClient, body: ActionBody) {
  const roomId = cleanText(body.roomId, 80);
  const sessionId = cleanText(body.sessionId, 80);
  const cardUid = cleanText(body.cardUid, 80);
  const context = await loadRoomContext(supabase, roomId, sessionId);
  ensureTurn(context.room, context.me);
  if (context.room.state.phase !== 'main') throw new Error('카드는 메인 단계에서 사용해 주세요.');

  const state = cloneState(context.room.state);
  const myPrivate = context.privateByPlayer.get(context.me.id);
  if (!myPrivate) throw new Error('내 덱 상태를 찾을 수 없습니다.');
  const handIndex = myPrivate.hand.findIndex((entry) => entry.uid === cardUid);
  if (handIndex < 0) throw new Error('선택한 카드가 손패에 없습니다.');
  const handEntry = myPrivate.hand[handIndex];
  const card = CARD_MAP.get(handEntry.cardId);
  if (!card) throw new Error('카드 정보를 찾을 수 없습니다.');
  const myPublic = getPublicPlayer(state, context.me.id);
  if (myPublic.energy < card.cost) throw new Error('에너지가 부족합니다.');

  validateTarget(card, state, context.me.id, body.target ?? null);
  const opponentId = otherPlayerId(context.players, context.me.id);
  if (!opponentId) throw new Error('상대 플레이어가 없습니다.');

  if (card.type === 'unit') {
    const lane = Number(body.lane);
    if (!Number.isInteger(lane) || lane < 0 || lane > 2) throw new Error('소환할 라인을 선택해 주세요.');
    if (myPublic.board[lane]) throw new Error('이미 유닛이 있는 라인입니다.');

    myPublic.energy -= card.cost;
    myPrivate.hand.splice(handIndex, 1);
    const unit: BoardUnit = {
      instanceId: crypto.randomUUID(),
      cardId: card.id,
      name: card.name,
      ownerPlayerId: context.me.id,
      lane,
      attack: card.attack ?? 0,
      health: card.health ?? 1,
      maxHealth: card.health ?? 1,
      shield: card.keywords?.includes('barrier') ? 2 : 0,
      exhausted: !card.keywords?.includes('haste'),
      frozen: false,
      rarity: card.rarity,
      faction: card.faction,
      icon: card.icon,
      keywords: card.keywords ?? [],
    };
    myPublic.board[lane] = unit;
    log(state, `${context.me.user_name} 님이 ${card.name}을(를) 라인 ${lane + 1}에 소환했습니다.`, 'normal');

    triggerEnemySummonTrap(state, opponentId, unit, context.privateByPlayer);
    resolveDeaths(state, context.players.map((player) => player.id), context.privateByPlayer);

    if (myPublic.board[lane] && card.onPlay) {
      if (card.onPlay.kind === 'draw') drawCards(state, context.me.id, myPrivate, card.onPlay.amount, true);
      if (card.onPlay.kind === 'heal_core') {
        myPublic.core = Math.min(myPublic.maxCore, myPublic.core + card.onPlay.amount);
        log(state, `${card.name}의 효과로 내 코어를 ${card.onPlay.amount} 회복했습니다.`, 'good');
      }
      if (card.onPlay.kind === 'damage_enemy_core') {
        getPublicPlayer(state, opponentId).core -= card.onPlay.amount;
        log(state, `${card.name}의 효과로 적 코어에 피해 ${card.onPlay.amount}.`, 'bad');
      }
      if (card.onPlay.kind === 'shield_self') unit.shield += card.onPlay.amount;
      if (card.onPlay.kind === 'buff_ally') {
        const ally = myPublic.board.find((candidate) => candidate && candidate.instanceId !== unit.instanceId);
        if (ally) {
          ally.attack += card.onPlay.attack;
          ally.maxHealth += card.onPlay.health;
          ally.health += card.onPlay.health;
          log(state, `${card.name}이(가) ${ally.name}에게 +${card.onPlay.attack}/+${card.onPlay.health}.`, 'good');
        }
      }
    }
  } else if (card.type === 'trap') {
    if (myPrivate.traps.length >= 2) throw new Error('함정은 최대 2장까지 설치할 수 있습니다.');
    myPublic.energy -= card.cost;
    myPrivate.hand.splice(handIndex, 1);
    myPrivate.traps.push(handEntry);
    syncCounts(state, context.me.id, myPrivate);
    log(state, `${context.me.user_name} 님이 카드를 뒤집어 설치했습니다.`, 'normal');
  } else {
    myPublic.energy -= card.cost;
    myPrivate.hand.splice(handIndex, 1);
    const negated = triggerEnemySpellTrap(state, opponentId, context.privateByPlayer);
    log(state, `${context.me.user_name} 님이 주문 ${card.name}을(를) 사용했습니다.`, 'normal');
    if (!negated) {
      applySpell(card, state, context.me, context.players, context.privateByPlayer, body.target ?? null);
      resolveDeaths(state, context.players.map((player) => player.id), context.privateByPlayer);
    }
  }

  syncCounts(state, context.me.id, myPrivate);
  checkWinner(state, context.players);
  const status: RoomRow['status'] = state.winnerPlayerId ? 'finished' : 'playing';
  await persistPrivateStates(supabase, roomId, context.players, context.privateByPlayer);
  await persistRoom(supabase, roomId, state, status, state.winnerPlayerId);
  if (state.winnerPlayerId) await awardMatch(supabase, context.room, state, context.players);

  const room = { ...context.room, state, status, winner_player_id: state.winnerPlayerId };
  return viewFor(room, context.players, context.me, context.privateByPlayer);
}

async function handleAdvancePhase(supabase: SupabaseClient, body: ActionBody) {
  const roomId = cleanText(body.roomId, 80);
  const sessionId = cleanText(body.sessionId, 80);
  const context = await loadRoomContext(supabase, roomId, sessionId);
  ensureTurn(context.room, context.me);
  const state = cloneState(context.room.state);

  if (state.phase === 'main') {
    state.phase = 'battle';
    log(state, '전투 단계로 이동했습니다.', 'system');
  } else {
    const nextId = otherPlayerId(context.players, context.me.id);
    if (!nextId) throw new Error('상대 플레이어가 없습니다.');
    const nextPrivate = context.privateByPlayer.get(nextId);
    if (!nextPrivate) throw new Error('상대 덱 상태를 찾을 수 없습니다.');
    startNextTurn(state, nextId, nextPrivate);
  }

  checkWinner(state, context.players);
  const status: RoomRow['status'] = state.winnerPlayerId ? 'finished' : 'playing';
  await persistPrivateStates(supabase, roomId, context.players, context.privateByPlayer);
  await persistRoom(supabase, roomId, state, status, state.winnerPlayerId);
  if (state.winnerPlayerId) await awardMatch(supabase, context.room, state, context.players);
  const room = { ...context.room, state, status, winner_player_id: state.winnerPlayerId };
  return viewFor(room, context.players, context.me, context.privateByPlayer);
}

async function handleAttack(supabase: SupabaseClient, body: ActionBody) {
  const roomId = cleanText(body.roomId, 80);
  const sessionId = cleanText(body.sessionId, 80);
  const attackerId = cleanText(body.attackerId, 80);
  const context = await loadRoomContext(supabase, roomId, sessionId);
  ensureTurn(context.room, context.me);
  if (context.room.state.phase !== 'battle') throw new Error('전투 단계에서 공격할 수 있습니다.');

  const state = cloneState(context.room.state);
  const myPublic = getPublicPlayer(state, context.me.id);
  const attackerLane = myPublic.board.findIndex((unit) => unit?.instanceId === attackerId);
  if (attackerLane < 0) throw new Error('공격 유닛을 찾을 수 없습니다.');
  const attacker = myPublic.board[attackerLane] as BoardUnit;
  if (attacker.exhausted) throw new Error('이 유닛은 이미 행동했습니다.');

  const opponentId = otherPlayerId(context.players, context.me.id);
  if (!opponentId) throw new Error('상대 플레이어가 없습니다.');
  const enemyPublic = getPublicPlayer(state, opponentId);
  const defender = enemyPublic.board[attackerLane];
  attacker.exhausted = true;

  if (defender) {
    triggerFriendlyAttackedTrap(state, opponentId, attacker, context.privateByPlayer);
    if (attacker.health > 0) {
      const attackValue = attacker.attack;
      const defenderAttack = defender.attack;
      const defenderHealthBefore = defender.health + defender.shield;
      applyDamage(defender, attackValue);
      applyDamage(attacker, defenderAttack);
      log(state, `${attacker.name}이(가) ${defender.name}을(를) 공격했습니다.`, 'normal');
      if (attacker.keywords.includes('lifesteal')) {
        const healed = Math.min(attackValue, defenderHealthBefore);
        myPublic.core = Math.min(myPublic.maxCore, myPublic.core + healed);
        log(state, `흡수 효과로 내 코어를 ${healed} 회복했습니다.`, 'good');
      }
      if (attacker.keywords.includes('pierce') && defender.health <= 0) {
        const excess = Math.max(0, attackValue - defenderHealthBefore);
        if (excess > 0) {
          enemyPublic.core -= excess;
          log(state, `관통 피해 ${excess}이 적 코어에 들어갔습니다.`, 'bad');
        }
      }
    }
  } else {
    const trapResult = triggerCoreAttackTrap(
      state,
      opponentId,
      context.me.id,
      attacker,
      context.privateByPlayer,
    );
    if (!trapResult.cancelled && attacker.health > 0) {
      const damage = Math.max(0, attacker.attack - trapResult.reduction);
      enemyPublic.core -= damage;
      log(state, `${attacker.name}이(가) 적 코어에 피해 ${damage}.`, damage > 0 ? 'bad' : 'normal');
      if (attacker.keywords.includes('lifesteal') && damage > 0) {
        myPublic.core = Math.min(myPublic.maxCore, myPublic.core + damage);
        log(state, `흡수 효과로 내 코어를 ${damage} 회복했습니다.`, 'good');
      }
    }
  }

  resolveDeaths(state, context.players.map((player) => player.id), context.privateByPlayer);
  checkWinner(state, context.players);
  const status: RoomRow['status'] = state.winnerPlayerId ? 'finished' : 'playing';
  await persistPrivateStates(supabase, roomId, context.players, context.privateByPlayer);
  await persistRoom(supabase, roomId, state, status, state.winnerPlayerId);
  if (state.winnerPlayerId) await awardMatch(supabase, context.room, state, context.players);
  const room = { ...context.room, state, status, winner_player_id: state.winnerPlayerId };
  return viewFor(room, context.players, context.me, context.privateByPlayer);
}



async function handleSurrender(supabase: SupabaseClient, body: ActionBody) {
  const roomId = cleanText(body.roomId, 80);
  const sessionId = cleanText(body.sessionId, 80);
  const context = await loadRoomContext(supabase, roomId, sessionId);
  if (context.room.status !== 'playing') throw new Error('진행 중인 결투가 아닙니다.');
  const state = cloneState(context.room.state);
  const winnerId = otherPlayerId(context.players, context.me.id);
  state.winnerPlayerId = winnerId;
  log(state, `${context.me.user_name} 님이 항복했습니다.`, 'system');
  await persistRoom(supabase, roomId, state, 'finished', winnerId);
  if (winnerId) await awardMatch(supabase, context.room, state, context.players);
  const room = { ...context.room, state, status: 'finished' as const, winner_player_id: winnerId };
  return viewFor(room, context.players, context.me, context.privateByPlayer);
}

async function handleRematch(supabase: SupabaseClient, body: ActionBody) {
  const roomId = cleanText(body.roomId, 80);
  const sessionId = cleanText(body.sessionId, 80);
  const context = await loadRoomContext(supabase, roomId, sessionId);
  if (context.room.status !== 'finished') throw new Error('결투가 아직 끝나지 않았습니다.');

  const maxCore = context.room.mode === 'grand' ? 40 : 25;
  const state = initialPublicState(context.players, maxCore);
  const nextMatchNo = (context.room.match_no ?? 1) + 1;
  await supabase.from('arcana_players').update({ ready: false }).eq('room_id', roomId);
  await supabase.from('arcana_private_states').delete().eq('room_id', roomId);
  const { error } = await supabase.from('arcana_rooms').update({
    state,
    status: 'lobby',
    winner_player_id: null,
    match_no: nextMatchNo,
    updated_at: new Date().toISOString(),
  }).eq('id', roomId);
  if (error) throw new Error(`재대결 준비 실패: ${error.message}`);
  const players = context.players.map((player) => ({ ...player, ready: false }));
  const room = { ...context.room, state, status: 'lobby' as const, winner_player_id: null, match_no: nextMatchNo };
  return viewFor(room, players, context.me, new Map());
}

async function handleGetState(supabase: SupabaseClient, body: ActionBody) {
  const roomId = cleanText(body.roomId, 80);
  const sessionId = cleanText(body.sessionId, 80);
  const context = await loadRoomContext(supabase, roomId, sessionId);
  return viewFor(context.room, context.players, context.me, context.privateByPlayer);
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ActionBody;
    const action = cleanText(body.action, 40);
    const user = await requireUser(request);
    const supabase = serverClient();
    const account = await ensureAccount(supabase, user);
    body.sessionId = user.id;
    body.userId = user.id;
    body.userName = account.profile.display_name;
    let data: unknown;

    switch (action) {
      case 'get_account':
        data = account;
        break;
      case 'heartbeat':
        data = await handleHeartbeat(supabase, user.id);
        break;
      case 'get_social':
        data = await loadSocialView(supabase, user.id);
        break;
      case 'search_player':
        data = await handleSearchPlayer(supabase, user.id, body);
        break;
      case 'send_friend_request':
        data = await handleSendFriendRequest(supabase, user.id, body);
        break;
      case 'respond_friend_request':
        data = await handleRespondFriendRequest(supabase, user.id, body);
        break;
      case 'cancel_friend_request':
        data = await handleCancelFriendRequest(supabase, user.id, body);
        break;
      case 'remove_friend':
        data = await handleRemoveFriend(supabase, user.id, body);
        break;
      case 'update_profile':
        data = await handleUpdateProfile(supabase, user.id, body);
        break;
      case 'queue_match':
      case 'poll_match':
        data = await handleQueueMatch(supabase, user.id, body);
        break;
      case 'cancel_match':
        data = await handleCancelMatch(supabase, user.id);
        break;
      case 'save_deck':
        data = await handleSaveDeck(supabase, user.id, body);
        break;
      case 'set_active_deck':
        data = await handleSetActiveDeck(supabase, user.id, body);
        break;
      case 'delete_deck':
        data = await handleDeleteDeck(supabase, user.id, body);
        break;
      case 'open_pack':
        data = await handleOpenPack(supabase, user.id, body);
        break;
      case 'send_message':
        data = await handleSendMessage(supabase, user.id, account.profile.display_name, body);
        break;
      case 'create_room':
        data = await handleCreateRoom(supabase, body);
        break;
      case 'join_room':
        data = await handleJoinRoom(supabase, body);
        break;
      case 'get_state':
        data = await handleGetState(supabase, body);
        break;
      case 'toggle_ready':
        data = await handleReady(supabase, body);
        break;
      case 'play_card':
        data = await handlePlayCard(supabase, body);
        break;
      case 'advance_phase':
        data = await handleAdvancePhase(supabase, body);
        break;
      case 'attack':
        data = await handleAttack(supabase, body);
        break;
      case 'surrender':
        data = await handleSurrender(supabase, body);
        break;
      case 'rematch':
        data = await handleRematch(supabase, body);
        break;
      default:
        return fail('지원하지 않는 요청입니다.');
    }

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    const message = error instanceof Error ? error.message : '알 수 없는 서버 오류가 발생했습니다.';
    console.error('[VANTA ARCANA API]', error);
    return fail(message, 400);
  }
}
