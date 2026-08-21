import { createClient, User } from '@supabase/supabase-js';
import {
  validateDeck,
  validateExtraDeck,
} from '../../game-data';
import {
  GameSnapshot,
  PrivateState,
  MatchState,
  attack,
  beginBattlePhase,
  drawAndEndTurn,
  endTurn,
  initializeMatch,
  playCard,
  resolveTurnTimeout,
  summonExtra,
  surrender,
} from '../../game-engine';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

interface RequestBody {
  action?: string;
  [key: string]: unknown;
}

interface RoomRow {
  id: string;
  code: string;
  host_id: string;
  guest_id: string | null;
  public_match: boolean;
  status: 'waiting' | 'active' | 'finished' | 'cancelled';
  ready_host: boolean;
  ready_guest: boolean;
  state: MatchState | null;
  version: number;
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}


function projectRefFromUrl(value: string): string {
  try {
    const hostname = new URL(value).hostname;
    return hostname.endsWith('.supabase.co') ? hostname.split('.')[0] : hostname;
  } catch {
    return 'unknown';
  }
}

function decodeLegacyKeyPayload(key: string): Record<string, unknown> | null {
  if (!key.startsWith('eyJ')) return null;
  try {
    const payload = key.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(payload.length / 4) * 4, '=');
    return JSON.parse(globalThis.atob(normalized)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

class AuthRequiredError extends Error {
  code = 'AUTH_EXPIRED' as const;
  constructor(message = '로그인 세션을 확인할 수 없습니다. 다시 로그인해 주세요.') {
    super(message);
    this.name = 'AuthRequiredError';
  }
}

class ServerConfigError extends Error {
  code = 'SERVER_CONFIG' as const;
  constructor(message: string) {
    super(message);
    this.name = 'ServerConfigError';
  }
}

class SecureDuelUnavailableError extends Error {
  code = 'DUEL_SERVER_OFFLINE' as const;
  constructor(message: string) {
    super(message);
    this.name = 'SecureDuelUnavailableError';
  }
}

function serverUrl(): string {
  // 브라우저가 실제로 사용하는 NEXT_PUBLIC URL을 최우선으로 사용합니다.
  // 예전 프로젝트의 SUPABASE_URL이 Render에 남아 있어도 현재 프로젝트 연결을 덮어쓰지 않습니다.
  const value = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  if (!value) throw new ServerConfigError('Render에 NEXT_PUBLIC_SUPABASE_URL 환경변수가 없습니다.');
  return value.trim();
}

function publicKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!key) throw new ServerConfigError('Render에 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY가 설정되지 않았습니다.');
  return key.trim();
}

function configuredAdminKeys(): Array<{ key: string; source: 'secret' | 'service_role' }> {
  const candidates: Array<{ key: string; source: 'secret' | 'service_role' }> = [];
  const secret = process.env.SUPABASE_SECRET_KEY?.trim();
  const legacy = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (secret) candidates.push({ key: secret, source: 'secret' });
  if (legacy && legacy !== secret) candidates.push({ key: legacy, source: 'service_role' });

  // A leftover key from an older project must never mask a valid key that is also configured.
  // Prefer legacy JWT keys whose embedded project ref matches the current NEXT_PUBLIC URL.
  const currentRef = projectRefFromUrl(serverUrl());
  return candidates.sort((a, b) => {
    const aRef = decodeLegacyKeyPayload(a.key)?.ref;
    const bRef = decodeLegacyKeyPayload(b.key)?.ref;
    const aMatch = typeof aRef === 'string' && aRef === currentRef ? 1 : 0;
    const bMatch = typeof bRef === 'string' && bRef === currentRef ? 1 : 0;
    return bMatch - aMatch;
  });
}

function publicAuthClient() {
  return createClient(serverUrl(), publicKey(), {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function userClient(token: string) {
  return createClient(serverUrl(), publicKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

function adminClientFromKey(key: string) {
  return createClient(serverUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
}

type UserDbClient = ReturnType<typeof userClient>;
type AdminDbClient = ReturnType<typeof adminClientFromKey>;

type SecureServerStatus = {
  secureDuelReady: boolean;
  code: 'READY' | 'MISSING_KEY' | 'WRONG_PROJECT' | 'INVALID_KEY' | 'DB_MIGRATION_REQUIRED' | 'UNKNOWN';
  message: string;
  keySource: 'secret' | 'service_role' | 'none';
};

async function probeSecureServer(): Promise<{ status: SecureServerStatus; client: AdminDbClient | null }> {
  const candidates = configuredAdminKeys();
  if (candidates.length === 0) {
    return {
      client: null,
      status: {
        secureDuelReady: false,
        code: 'MISSING_KEY',
        message: '대전 서버 키가 아직 연결되지 않았습니다. Render에 SUPABASE_SECRET_KEY 또는 SUPABASE_SERVICE_ROLE_KEY를 등록해 주세요.',
        keySource: 'none',
      },
    };
  }

  const urlRef = projectRefFromUrl(serverUrl());
  const failures: SecureServerStatus[] = [];

  for (const configured of candidates) {
    const payload = decodeLegacyKeyPayload(configured.key);
    const keyRef = typeof payload?.ref === 'string' ? payload.ref : null;
    if (keyRef && keyRef !== urlRef) {
      failures.push({
        secureDuelReady: false,
        code: 'WRONG_PROJECT',
        message: `${configured.source === 'secret' ? 'SUPABASE_SECRET_KEY' : 'SUPABASE_SERVICE_ROLE_KEY'}가 다른 Supabase 프로젝트를 가리킵니다.`,
        keySource: configured.source,
      });
      continue;
    }

    try {
      const client = adminClientFromKey(configured.key);
      const { error } = await client.from('eclipse_private_states').select('room_id', { count: 'exact', head: true });
      if (!error) {
        return {
          client,
          status: {
            secureDuelReady: true,
            code: 'READY',
            message: `보안 대전 서버가 정상 연결되었습니다. (${configured.source === 'secret' ? 'Secret key' : 'Service role'})`,
            keySource: configured.source,
          },
        };
      }

      const message = error.message || '';
      if (/does not exist|relation .*eclipse_private_states|schema cache/i.test(message)) {
        return {
          client: null,
          status: {
            secureDuelReady: false,
            code: 'DB_MIGRATION_REQUIRED',
            message: '서버 키 연결은 확인했지만 ECLIPSE DUEL 대전 테이블이 없습니다. 최신 통합 SQL을 실행해 주세요.',
            keySource: configured.source,
          },
        };
      }

      failures.push({
        secureDuelReady: false,
        code: /invalid api key|apikey|jwt/i.test(message) ? 'INVALID_KEY' : 'UNKNOWN',
        message: `${configured.source === 'secret' ? 'SUPABASE_SECRET_KEY' : 'SUPABASE_SERVICE_ROLE_KEY'} 검증 실패: ${message || '알 수 없는 오류'}`,
        keySource: configured.source,
      });
    } catch (error) {
      failures.push({
        secureDuelReady: false,
        code: 'UNKNOWN',
        message: `${configured.source === 'secret' ? 'SUPABASE_SECRET_KEY' : 'SUPABASE_SERVICE_ROLE_KEY'} 연결을 확인하지 못했습니다.`,
        keySource: configured.source,
      });
    }
  }

  const secretConfigured = Boolean(process.env.SUPABASE_SECRET_KEY?.trim());
  const secretFailure = failures.find((item) => item.keySource === 'secret');
  const legacyFailure = failures.find((item) => item.keySource === 'service_role');
  let chosen = secretFailure ?? legacyFailure ?? failures[0];

  // A stale legacy service-role key is common after moving the same Git project to a new Supabase project.
  // Do not present it as if the browser login were broken. The fix is simply to add the current project's sb_secret_ key.
  if (!secretConfigured && legacyFailure?.code === 'WRONG_PROJECT') {
    chosen = {
      secureDuelReady: false,
      code: 'MISSING_KEY',
      message: '현재 프로젝트용 SUPABASE_SECRET_KEY가 없습니다. Render Environment에 현재 Supabase 프로젝트의 sb_secret_ 키를 한 번 등록해 주세요. 예전 SUPABASE_SERVICE_ROLE_KEY는 자동으로 무시됩니다.',
      keySource: 'none',
    };
  }

  return {
    client: null,
    status: chosen ?? {
      secureDuelReady: false,
      code: 'UNKNOWN',
      message: '보안 대전 서버 상태를 확인하지 못했습니다.',
      keySource: 'none',
    },
  };
}

async function requireAdmin(): Promise<AdminDbClient> {
  const probe = await probeSecureServer();
  if (!probe.client || !probe.status.secureDuelReady) {
    throw new SecureDuelUnavailableError(probe.status.message);
  }
  return probe.client;
}

async function requireUser(request: Request): Promise<{ user: User; client: UserDbClient; token: string }> {
  const authorization = request.headers.get('authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  if (!token) throw new AuthRequiredError('로그인이 필요합니다.');

  const auth = publicAuthClient();
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user) throw new AuthRequiredError();
  return { user: data.user, client: userClient(token), token };
}

function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function makePlayerCode(userId: string): string {
  return `ED-${userId.replace(/-/g, '').slice(0, 10).toUpperCase()}`;
}

function randomRoomCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
}

async function ensureAccount(client: UserDbClient, user: User): Promise<void> {
  const defaultName = cleanText(user.user_metadata?.display_name || user.email?.split('@')[0] || '신입 결투가', 16) || '신입 결투가';
  const { error } = await client.rpc('eclipse_bootstrap_my_account_v5', { p_display_name: defaultName });
  if (error) {
    if (/function .*eclipse_bootstrap_my_account_v5.*does not exist|schema cache/i.test(error.message)) {
      throw new Error('ECLIPSE DUEL v5 데이터베이스 설치가 필요합니다. 동봉된 통합 SQL을 한 번 실행해 주세요.');
    }
    throw new Error(`계정 초기화 실패: ${error.message}`);
  }
}

async function getHub(admin: UserDbClient | AdminDbClient, userId: string) {
  const [profileResult, walletResult, collectionResult, decksResult, requestsResult, friendsResult] = await Promise.all([
    admin.from('eclipse_profiles').select('*').eq('user_id', userId).single(),
    admin.from('eclipse_wallets').select('*').eq('user_id', userId).single(),
    admin.from('eclipse_collections').select('card_id,quantity').eq('user_id', userId),
    admin.from('eclipse_decks').select('*').eq('user_id', userId).order('created_at'),
    admin.from('eclipse_friend_requests').select('*').or(`sender_id.eq.${userId},receiver_id.eq.${userId}`).order('created_at', { ascending: false }),
    admin.from('eclipse_friends').select('friend_id,created_at').eq('user_id', userId),
  ]);

  if (profileResult.error) throw new Error(profileResult.error.message);
  if (walletResult.error) throw new Error(walletResult.error.message);
  if (collectionResult.error) throw new Error(collectionResult.error.message);
  if (decksResult.error) throw new Error(decksResult.error.message);
  if (requestsResult.error) throw new Error(requestsResult.error.message);
  if (friendsResult.error) throw new Error(friendsResult.error.message);

  const friendIds = (friendsResult.data ?? []).map((row: { friend_id: string }) => row.friend_id);
  let friendProfiles: unknown[] = [];
  if (friendIds.length > 0) {
    const { data, error } = await admin
      .from('eclipse_profiles')
      .select('user_id,display_name,player_code,avatar,status_message,wins,losses,xp')
      .in('user_id', friendIds);
    if (error) throw new Error(error.message);
    friendProfiles = data ?? [];
  }

  const requestUserIds = Array.from(
    new Set(
      (requestsResult.data ?? []).flatMap((row: { sender_id: string; receiver_id: string }) => [row.sender_id, row.receiver_id]),
    ),
  ).filter((id) => id !== userId);
  let requestProfiles: unknown[] = [];
  if (requestUserIds.length > 0) {
    const { data, error } = await admin
      .from('eclipse_profiles')
      .select('user_id,display_name,player_code,avatar')
      .in('user_id', requestUserIds);
    if (error) throw new Error(error.message);
    requestProfiles = data ?? [];
  }

  return {
    profile: profileResult.data,
    wallet: walletResult.data,
    collection: collectionResult.data ?? [],
    decks: decksResult.data ?? [],
    friendRequests: requestsResult.data ?? [],
    friends: friendProfiles,
    requestProfiles,
  };
}

async function getCollectionMap(admin: UserDbClient | AdminDbClient, userId: string): Promise<Record<string, number>> {
  const { data, error } = await admin.from('eclipse_collections').select('card_id,quantity').eq('user_id', userId);
  if (error) throw new Error(`보유 카드 확인 실패: ${error.message}`);
  return Object.fromEntries((data ?? []).map((row: { card_id: string; quantity: number }) => [row.card_id, row.quantity]));
}

async function activeDeck(
  admin: UserDbClient | AdminDbClient,
  userId: string,
): Promise<{ cards: string[]; extraCards: string[] }> {
  const { data, error } = await admin
    .from('eclipse_decks')
    .select('cards,extra_cards')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw new Error(`활성 덱 확인 실패: ${error.message}`);
  const cards = Array.isArray(data?.cards) ? data.cards.map(String) : [];
  const extraCards = Array.isArray(data?.extra_cards) ? data.extra_cards.map(String) : [];
  const collection = await getCollectionMap(admin, userId);
  const mainValidation = validateDeck(cards, collection);
  const extraValidation = validateExtraDeck(extraCards, collection);
  if (mainValidation) throw new Error(`활성 덱을 사용할 수 없습니다: ${mainValidation}`);
  if (extraValidation) throw new Error(`활성 엑스트라 덱을 사용할 수 없습니다: ${extraValidation}`);
  return { cards, extraCards };
}

async function fetchRoom(admin: AdminDbClient, roomId: string): Promise<RoomRow> {
  const { data, error } = await admin.from('eclipse_rooms').select('*').eq('id', roomId).single();
  if (error || !data) throw new Error('결투방을 찾을 수 없습니다.');
  return data as RoomRow;
}

function assertParticipant(room: RoomRow, userId: string): void {
  if (room.host_id !== userId && room.guest_id !== userId) throw new Error('이 결투방의 참가자가 아닙니다.');
}

async function loadSnapshot(admin: AdminDbClient, room: RoomRow): Promise<GameSnapshot> {
  if (!room.state) throw new Error('결투 상태가 아직 생성되지 않았습니다.');
  const { data, error } = await admin.from('eclipse_private_states').select('user_id,state').eq('room_id', room.id);
  if (error) throw new Error(`비공개 카드 상태 불러오기 실패: ${error.message}`);
  const privateStates: Record<string, PrivateState> = {};
  for (const row of data ?? []) privateStates[String(row.user_id)] = row.state as PrivateState;
  if (!room.guest_id || !privateStates[room.host_id] || !privateStates[room.guest_id]) throw new Error('양쪽 덱 상태가 완성되지 않았습니다.');
  return { state: room.state, privateStates };
}

async function commitSnapshot(admin: AdminDbClient, room: RoomRow, snapshot: GameSnapshot): Promise<void> {
  const privateRows = Object.entries(snapshot.privateStates).map(([user_id, state]) => ({ user_id, state }));
  const { data, error } = await admin.rpc('eclipse_commit_match', {
    p_room_id: room.id,
    p_expected_version: room.version,
    p_state: snapshot.state,
    p_status: snapshot.state.status,
    p_winner: snapshot.state.winnerId,
    p_private_states: privateRows,
  });
  if (error) throw new Error(`결투 상태 저장 실패: ${error.message}`);
  if (!data) throw new Error('상대 행동과 겹쳤습니다. 화면을 새로고침한 뒤 다시 시도하세요.');
}

async function rewardFinishedMatch(admin: AdminDbClient, roomId: string, state: MatchState): Promise<void> {
  if (state.status !== 'finished' || !state.winnerId || state.playerOrder.length !== 2) return;
  for (const playerId of state.playerOrder) {
    const won = playerId === state.winnerId;
    const { error } = await admin.rpc('eclipse_reward_match', {
      p_room_id: roomId,
      p_user: playerId,
      p_coins: won ? 180 : 35,
      p_xp: won ? 100 : 35,
      p_won: won,
    });
    if (error) console.error('reward error', error.message);
  }
}


function timeoutStateChanged(before: GameSnapshot, after: GameSnapshot): boolean {
  return before.state.turnNumber !== after.state.turnNumber
    || before.state.currentPlayerId !== after.state.currentPlayerId
    || before.state.turnEndsAt !== after.state.turnEndsAt
    || before.state.status !== after.state.status
    || JSON.stringify(before.state.energy) !== JSON.stringify(after.state.energy);
}

async function normalizeTurnTimeout(admin: AdminDbClient, room: RoomRow): Promise<{ room: RoomRow; snapshot: GameSnapshot | null; advanced: boolean }> {
  if (room.status !== 'active' || !room.state) return { room, snapshot: null, advanced: false };
  const snapshot = await loadSnapshot(admin, room);
  const normalized = resolveTurnTimeout(snapshot);
  if (!timeoutStateChanged(snapshot, normalized)) return { room, snapshot, advanced: false };
  const advanced = normalized.state.turnNumber !== snapshot.state.turnNumber || normalized.state.status !== snapshot.state.status;
  try {
    await commitSnapshot(admin, room, normalized);
  } catch (error) {
    if (!(error instanceof Error) || !/상대 행동과 겹쳤습니다/.test(error.message)) throw error;
  }
  await rewardFinishedMatch(admin, room.id, normalized.state);
  const freshRoom = await fetchRoom(admin, room.id);
  const freshSnapshot = freshRoom.status === 'active' && freshRoom.state ? await loadSnapshot(admin, freshRoom) : null;
  return { room: freshRoom, snapshot: freshSnapshot, advanced };
}

async function getRoomPayload(admin: AdminDbClient, room: RoomRow, userId: string) {
  assertParticipant(room, userId);
  const profileIds = [room.host_id, room.guest_id].filter(Boolean) as string[];
  const { data: profiles, error: profileError } = await admin
    .from('eclipse_profiles')
    .select('user_id,display_name,avatar,wins,losses,xp')
    .in('user_id', profileIds);
  if (profileError) throw new Error(profileError.message);

  let privateState: PrivateState | null = null;
  if (room.state) {
    const { data, error } = await admin
      .from('eclipse_private_states')
      .select('state')
      .eq('room_id', room.id)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    privateState = (data?.state as PrivateState | undefined) ?? null;
  }

  return { room, profiles: profiles ?? [], privateState };
}

async function handleAction(request: Request, body: RequestBody) {
  const { user, client } = await requireUser(request);
  await ensureAccount(client, user);
  const action = cleanText(body.action, 50);

  if (action === 'bootstrap' || action === 'hub') {
    const probe = await probeSecureServer();
    return {
      hub: await getHub(client, user.id),
      user: { id: user.id, email: user.email },
      serverStatus: probe.status,
    };
  }

  if (action === 'update_profile') {
    const displayName = cleanText(body.displayName, 16);
    const statusMessage = cleanText(body.statusMessage, 60);
    const avatar = cleanText(body.avatar, 24) || 'eclipse';
    if (displayName.length < 2) throw new Error('플레이어 이름은 2자 이상 입력하세요.');
    const { error } = await client
      .from('eclipse_profiles')
      .update({ display_name: displayName, status_message: statusMessage, avatar })
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return { hub: await getHub(client, user.id) };
  }

  if (action === 'save_deck') {
    const deckId = cleanText(body.deckId, 64);
    const name = cleanText(body.name, 24) || '커스텀 덱';
    const cards = Array.isArray(body.cards) ? body.cards.map(String) : [];
    const extraCards = Array.isArray(body.extraCards) ? body.extraCards.map(String) : [];
    const collection = await getCollectionMap(client, user.id);
    const validation = validateDeck(cards, collection);
    const extraValidation = validateExtraDeck(extraCards, collection);
    if (validation) throw new Error(validation);
    if (extraValidation) throw new Error(extraValidation);

    if (deckId) {
      const { error } = await client.from('eclipse_decks').update({ name, cards, extra_cards: extraCards }).eq('id', deckId).eq('user_id', user.id);
      if (error) throw new Error(error.message);
    } else {
      const { count } = await client.from('eclipse_decks').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      if ((count ?? 0) >= 5) throw new Error('덱은 최대 5개까지 저장할 수 있습니다.');
      const { error } = await client.from('eclipse_decks').insert({ user_id: user.id, name, cards, extra_cards: extraCards, is_active: false });
      if (error) throw new Error(error.message);
    }
    return { hub: await getHub(client, user.id) };
  }

  if (action === 'set_active_deck') {
    const deckId = cleanText(body.deckId, 64);
    const { data: deck, error: deckError } = await client
      .from('eclipse_decks')
      .select('cards,extra_cards')
      .eq('id', deckId)
      .eq('user_id', user.id)
      .single();
    if (deckError || !deck) throw new Error('덱을 찾을 수 없습니다.');
    const collection = await getCollectionMap(client, user.id);
    const validation = validateDeck(Array.isArray(deck.cards) ? deck.cards.map(String) : [], collection);
    const extraValidation = validateExtraDeck(Array.isArray(deck.extra_cards) ? deck.extra_cards.map(String) : [], collection);
    if (validation) throw new Error(validation);
    if (extraValidation) throw new Error(extraValidation);
    const { error: clearError } = await client.from('eclipse_decks').update({ is_active: false }).eq('user_id', user.id);
    if (clearError) throw new Error(clearError.message);
    const { error } = await client.from('eclipse_decks').update({ is_active: true }).eq('id', deckId).eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return { hub: await getHub(client, user.id) };
  }

  if (action === 'buy_pack') {
    const packId = cleanText(body.packId, 30);
    const { data, error } = await client.rpc('eclipse_open_pack_v5', { p_pack_id: packId });
    if (error) throw new Error(error.message);
    const payload = (data ?? {}) as { cardIds?: string[]; balance?: number };
    return {
      cardIds: Array.isArray(payload.cardIds) ? payload.cardIds : [],
      balance: Number(payload.balance ?? 0),
      hub: await getHub(client, user.id),
    };
  }

  if (action === 'send_global_message') {
    const message = cleanText(body.message, 180);
    if (!message) throw new Error('메시지를 입력하세요.');
    const { error } = await client.rpc('eclipse_send_global_message_v5', { p_body: message });
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  if (action === 'friend_request') {
    const playerCode = cleanText(body.playerCode, 20).toUpperCase();
    const { error } = await client.rpc('eclipse_send_friend_request_v5', { p_player_code: playerCode });
    if (error) throw new Error(error.message);
    return { hub: await getHub(client, user.id) };
  }

  if (action === 'friend_respond') {
    const requestId = cleanText(body.requestId, 64);
    const accept = Boolean(body.accept);
    const { error } = await client.rpc('eclipse_respond_friend_request_v5', {
      p_request_id: requestId,
      p_accept: accept,
    });
    if (error) throw new Error(error.message);
    return { hub: await getHub(client, user.id) };
  }

  if (action === 'friend_remove') {
    const friendId = cleanText(body.friendId, 64);
    const { error } = await client.rpc('eclipse_remove_friend_v5', { p_friend_id: friendId });
    if (error) throw new Error(error.message);
    return { hub: await getHub(client, user.id) };
  }

  if (action === 'create_room') {
    const admin = await requireAdmin();
    await activeDeck(admin, user.id);
    let room: RoomRow | null = null;
    for (let attempt = 0; attempt < 5 && !room; attempt += 1) {
      const { data, error } = await admin
        .from('eclipse_rooms')
        .insert({ code: randomRoomCode(), host_id: user.id, public_match: false })
        .select('*')
        .single();
      if (!error && data) room = data as RoomRow;
      else if (error?.code !== '23505') throw new Error(error?.message ?? '방 생성 실패');
    }
    if (!room) throw new Error('방 코드를 만들지 못했습니다. 다시 시도해 주세요.');
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'quick_match') {
    const admin = await requireAdmin();
    await activeDeck(admin, user.id);
    const { data: candidates, error: candidateError } = await admin
      .from('eclipse_rooms')
      .select('*')
      .eq('public_match', true)
      .eq('status', 'waiting')
      .is('guest_id', null)
      .neq('host_id', user.id)
      .order('created_at')
      .limit(5);
    if (candidateError) throw new Error(candidateError.message);

    for (const candidate of candidates ?? []) {
      const { data, error } = await admin
        .from('eclipse_rooms')
        .update({ guest_id: user.id })
        .eq('id', candidate.id)
        .is('guest_id', null)
        .select('*')
        .maybeSingle();
      if (!error && data) return await getRoomPayload(admin, data as RoomRow, user.id);
    }

    const { data, error } = await admin
      .from('eclipse_rooms')
      .insert({ code: randomRoomCode(), host_id: user.id, public_match: true })
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message ?? '자동 매칭 대기실 생성 실패');
    return await getRoomPayload(admin, data as RoomRow, user.id);
  }

  if (action === 'join_room') {
    const admin = await requireAdmin();
    await activeDeck(admin, user.id);
    const code = cleanText(body.code, 8).toUpperCase();
    const { data: found, error: findError } = await admin.from('eclipse_rooms').select('*').eq('code', code).maybeSingle();
    if (findError) throw new Error(findError.message);
    if (!found) throw new Error('방 코드를 찾을 수 없습니다.');
    let room = found as RoomRow;
    if (room.host_id === user.id || room.guest_id === user.id) return await getRoomPayload(admin, room, user.id);
    if (room.guest_id || room.status !== 'waiting') throw new Error('이미 시작했거나 가득 찬 방입니다.');
    const { data, error } = await admin
      .from('eclipse_rooms')
      .update({ guest_id: user.id })
      .eq('id', room.id)
      .is('guest_id', null)
      .select('*')
      .single();
    if (error || !data) throw new Error('다른 플레이어가 먼저 입장했습니다.');
    room = data as RoomRow;
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'get_room') {
    const admin = await requireAdmin();
    const roomId = cleanText(body.roomId, 64);
    let room = await fetchRoom(admin, roomId);
    assertParticipant(room, user.id);
    const normalized = await normalizeTurnTimeout(admin, room);
    room = normalized.room;
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'ready') {
    const admin = await requireAdmin();
    const roomId = cleanText(body.roomId, 64);
    let room = await fetchRoom(admin, roomId);
    assertParticipant(room, user.id);
    if (!room.guest_id) throw new Error('상대 플레이어를 기다리고 있습니다.');
    if (room.status !== 'waiting') return await getRoomPayload(admin, room, user.id);
    const field = room.host_id === user.id ? 'ready_host' : 'ready_guest';
    const { data, error } = await admin.from('eclipse_rooms').update({ [field]: true }).eq('id', room.id).select('*').single();
    if (error || !data) throw new Error(error?.message ?? '준비 상태 저장 실패');
    room = data as RoomRow;

    if (room.ready_host && room.ready_guest && room.guest_id) {
      const [hostDeck, guestDeck] = await Promise.all([activeDeck(admin, room.host_id), activeDeck(admin, room.guest_id)]);
      const snapshot = initializeMatch(
        room.host_id,
        hostDeck.cards,
        hostDeck.extraCards,
        room.guest_id,
        guestDeck.cards,
        guestDeck.extraCards,
      );
      await commitSnapshot(admin, room, snapshot);
      room = await fetchRoom(admin, room.id);
    }
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'game_action') {
    const admin = await requireAdmin();
    const roomId = cleanText(body.roomId, 64);
    const gameAction = cleanText(body.gameAction, 40);
    let room = await fetchRoom(admin, roomId);
    assertParticipant(room, user.id);
    if (room.status !== 'active') throw new Error('진행 중인 결투가 아닙니다.');

    const normalized = await normalizeTurnTimeout(admin, room);
    room = normalized.room;
    if (normalized.advanced || room.status !== 'active') {
      return await getRoomPayload(admin, room, user.id);
    }
    const snapshot = normalized.snapshot ?? await loadSnapshot(admin, room);
    let next: GameSnapshot;

    if (gameAction === 'play_card') {
      const instanceId = cleanText(body.instanceId, 80);
      const zone = typeof body.zone === 'number' ? body.zone : undefined;
      const target = body.target && typeof body.target === 'object'
        ? {
            ownerId: cleanText((body.target as Record<string, unknown>).ownerId, 64),
            unitIndex: Number((body.target as Record<string, unknown>).unitIndex),
          }
        : undefined;
      next = playCard(snapshot, user.id, instanceId, zone, target);
    } else if (gameAction === 'extra_summon') {
      const extraInstanceId = cleanText(body.extraInstanceId, 80);
      const materialZones = Array.isArray(body.materialZones) ? body.materialZones.map(Number) : [];
      next = summonExtra(snapshot, user.id, extraInstanceId, materialZones);
    } else if (gameAction === 'battle_phase') {
      next = beginBattlePhase(snapshot, user.id);
    } else if (gameAction === 'attack') {
      const attackerIndex = Number(body.attackerIndex);
      const rawTarget = body.target as Record<string, unknown> | undefined;
      if (!rawTarget || (rawTarget.kind !== 'unit' && rawTarget.kind !== 'core')) throw new Error('공격 대상을 선택하세요.');
      const target = rawTarget.kind === 'core'
        ? ({ kind: 'core' } as const)
        : ({ kind: 'unit', unitIndex: Number(rawTarget.unitIndex) } as const);
      next = attack(snapshot, user.id, attackerIndex, target);
    } else if (gameAction === 'draw_turn') {
      next = drawAndEndTurn(snapshot, user.id);
    } else if (gameAction === 'end_turn') {
      next = endTurn(snapshot, user.id);
    } else if (gameAction === 'surrender') {
      next = surrender(snapshot, user.id);
    } else {
      throw new Error('알 수 없는 결투 행동입니다.');
    }

    await commitSnapshot(admin, room, next);
    await rewardFinishedMatch(admin, room.id, next.state);
    return await getRoomPayload(admin, await fetchRoom(admin, room.id), user.id);
  }

  if (action === 'send_room_message') {
    const roomId = cleanText(body.roomId, 64);
    const message = cleanText(body.message, 180);
    if (!message) throw new Error('메시지를 입력하세요.');
    const { error } = await client.rpc('eclipse_send_room_message_v5', {
      p_room_id: roomId,
      p_body: message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  if (action === 'leave_room') {
    const admin = await requireAdmin();
    const roomId = cleanText(body.roomId, 64);
    const room = await fetchRoom(admin, roomId);
    assertParticipant(room, user.id);
    if (room.status === 'active' && room.state) {
      const next = surrender(await loadSnapshot(admin, room), user.id);
      await commitSnapshot(admin, room, next);
      await rewardFinishedMatch(admin, room.id, next.state);
    } else if (room.host_id === user.id) {
      const { error } = await admin.from('eclipse_rooms').update({ status: 'cancelled' }).eq('id', room.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await admin.from('eclipse_rooms').update({ guest_id: null, ready_guest: false }).eq('id', room.id);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  }

  throw new Error('지원하지 않는 요청입니다.');
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;
    const result = await handleAction(request, body);
    return Response.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      console.warn('[ECLIPSE AUTH]', error.message);
      return Response.json({ ok: false, code: error.code, error: error.message }, { status: 401 });
    }
    if (error instanceof SecureDuelUnavailableError) {
      console.warn('[ECLIPSE DUEL SERVER]', error.message);
      return Response.json({ ok: false, code: error.code, error: error.message }, { status: 503 });
    }
    if (error instanceof ServerConfigError) {
      console.error('[ECLIPSE CONFIG]', error.message);
      return Response.json({ ok: false, code: error.code, error: error.message }, { status: 503 });
    }

    let message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    if (/invalid api key|no api key|apikey.*invalid|jwt malformed/i.test(message)) {
      const ref = projectRefFromUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '');
      message = `Render의 서버 관리자 키가 현재 Supabase 프로젝트(${ref})와 일치하지 않습니다. ` +
        `현재 프로젝트의 sb_secret_ 키를 SUPABASE_SECRET_KEY에 저장한 뒤 Clear build cache & deploy를 실행해 주세요.`;
      console.error('[ECLIPSE CONFIG]', message);
      return Response.json({ ok: false, code: 'SERVER_CONFIG', error: message }, { status: 503 });
    }
    if (/extra_cards.*does not exist|column .*extra_cards/i.test(message)) {
      message = '승격 시스템 DB 업그레이드가 필요합니다. 동봉된 Supabase 통합 SQL을 한 번 실행해 주세요.';
    }
    console.error('[ECLIPSE API]', message);
    return Response.json({ ok: false, code: 'REQUEST_FAILED', error: message }, { status: 400 });
  }
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const projectRef = projectRefFromUrl(url);
  const probe = await probeSecureServer();
  return Response.json({
    ok: true,
    service: 'ECLIPSE DUEL',
    version: '0.10.0',
    projectRef,
    serverStatus: probe.status,
  });
}
