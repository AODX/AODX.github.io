import { createClient, User } from '@supabase/supabase-js';
import {
  validateDeck,
  validateExtraDeck,
} from '../../game-data';
import { V34_BATTLE_EMOTE_BY_ID, V34_BATTLE_EMOTE_PACK_BY_ID } from '../../v34-emotes';
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
  respondTrap,
  sacrificeHandForEnergy,
  sacrificeFieldUnitForEnergy,
  sendBattleEmote,
  spendEnergyToDraw,
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
  /** Private-room owner. host_id / guest_id are the two current duel seats. */
  owner_id?: string | null;
  host_id: string;
  guest_id: string | null;
  public_match: boolean;
  status: 'waiting' | 'active' | 'finished' | 'cancelled';
  ready_host: boolean;
  ready_guest: boolean;
  wager_amount?: number;
  wager_host_accepted?: boolean;
  wager_guest_accepted?: boolean;
  wager_locked?: boolean;
  wager_settled?: boolean;
  wager_locked_at?: string | null;
  wager_settled_at?: string | null;
  state: MatchState | null;
  version: number;
  winner_id: string | null;
  created_at: string;
  updated_at: string;
}

interface RoomMemberRow {
  room_id: string;
  user_id: string;
  joined_at: string;
}

const PRIVATE_ROOM_MEMBER_LIMIT = 10;

const MATCH_PRESENCE_TTL_MS = 20_000;
const MATCH_PRESENCE_STALE_CUTOFF = () => new Date(Date.now() - MATCH_PRESENCE_TTL_MS).toISOString();


async function readEmoteLoadout(db: UserDbClient | AdminDbClient, userId: string, fallbackOwned: string[] = []): Promise<string[]> {
  const { data, error } = await db.from('eclipse_emote_loadouts').select('emote_ids').eq('user_id', userId).maybeSingle();
  if (error) {
    if (/eclipse_emote_loadouts|does not exist|schema cache/i.test(error.message)) return fallbackOwned.slice(0, 6);
    throw new Error(error.message);
  }
  const ids = Array.isArray(data?.emote_ids) ? data.emote_ids.map(String) : [];
  return ids.filter((id) => Boolean(V34_BATTLE_EMOTE_BY_ID[id])).slice(0, 6);
}

function chatEmoteIds(message: string): string[] {
  const ids = [...message.matchAll(/:([a-z0-9_]+):/g)].map((match) => match[1]);
  return [...new Set(ids.filter((id) => Boolean(V34_BATTLE_EMOTE_BY_ID[id])))];
}

async function assertChatEmotesEquipped(db: UserDbClient | AdminDbClient, userId: string, message: string): Promise<void> {
  const requested = chatEmoteIds(message);
  if (!requested.length) return;
  const { data: ownedRows, error: ownedError } = await db.from('eclipse_battle_emotes').select('emote_id').eq('user_id', userId);
  if (ownedError) throw new Error(ownedError.message);
  const owned = (ownedRows ?? []).map((row: { emote_id: string }) => row.emote_id);
  const loadout = await readEmoteLoadout(db, userId, owned);
  if (requested.some((id) => !loadout.includes(id))) throw new Error('현재 장착한 6개 이모티콘만 채팅에서 사용할 수 있습니다. 상점 → 감정표현에서 장착을 변경해 주세요.');
}

async function touchMatchPresence(admin: AdminDbClient, userId: string): Promise<void> {
  const { error } = await admin
    .from('eclipse_match_presence')
    .upsert({ user_id: userId, last_seen_at: new Date().toISOString() }, { onConflict: 'user_id' });
  if (error) {
    if (/eclipse_match_presence|does not exist|schema cache/i.test(error.message)) {
      throw new Error('빠른 대전 온라인 감지 DB 업그레이드가 필요합니다. sql/10_V28_QUICK_MATCH_PRESENCE.sql을 한 번 실행해 주세요.');
    }
    throw new Error(error.message);
  }
}

async function onlinePresenceSet(admin: AdminDbClient, userIds: string[]): Promise<Set<string>> {
  const unique = [...new Set(userIds.filter(Boolean))];
  if (!unique.length) return new Set<string>();
  const { data, error } = await admin
    .from('eclipse_match_presence')
    .select('user_id,last_seen_at')
    .in('user_id', unique)
    .gte('last_seen_at', MATCH_PRESENCE_STALE_CUTOFF());
  if (error) {
    if (/eclipse_match_presence|does not exist|schema cache/i.test(error.message)) {
      throw new Error('빠른 대전 온라인 감지 DB 업그레이드가 필요합니다. sql/10_V28_QUICK_MATCH_PRESENCE.sql을 한 번 실행해 주세요.');
    }
    throw new Error(error.message);
  }
  return new Set((data ?? []).map((row: { user_id: string }) => row.user_id));
}

async function cleanupStalePublicWaitingRooms(admin: AdminDbClient): Promise<void> {
  const { data, error } = await admin
    .from('eclipse_rooms')
    .select('id,host_id,guest_id,ready_host,ready_guest')
    .eq('public_match', true)
    .eq('status', 'waiting')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) throw new Error(error.message);
  const rooms = (data ?? []) as Array<Pick<RoomRow, 'id' | 'host_id' | 'guest_id' | 'ready_host' | 'ready_guest'>>;
  if (!rooms.length) return;

  const online = await onlinePresenceSet(admin, rooms.flatMap((room) => [room.host_id, room.guest_id ?? '']).filter(Boolean));
  for (const room of rooms) {
    const hostOnline = online.has(room.host_id);
    const guestOnline = room.guest_id ? online.has(room.guest_id) : false;
    if (!hostOnline) {
      const { error: cancelError } = await admin.from('eclipse_rooms').update({ status: 'cancelled' }).eq('id', room.id).eq('status', 'waiting');
      if (cancelError) throw new Error(cancelError.message);
      continue;
    }
    if (room.guest_id && !guestOnline) {
      const { error: clearError } = await admin
        .from('eclipse_rooms')
        .update({ guest_id: null, ready_host: false, ready_guest: false })
        .eq('id', room.id)
        .eq('status', 'waiting')
        .eq('guest_id', room.guest_id);
      if (clearError) throw new Error(clearError.message);
    }
  }

  // Presence rows are tiny, but remove very old entries so the table never grows forever.
  const oldCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  await admin.from('eclipse_match_presence').delete().lt('last_seen_at', oldCutoff);
}

async function runQuickMatch(admin: AdminDbClient, userId: string): Promise<Awaited<ReturnType<typeof getRoomPayload>>> {
  await touchMatchPresence(admin, userId);
  await cleanupStalePublicWaitingRooms(admin);

  // Reuse an already-valid public waiting room instead of creating duplicate ghost rooms.
  const { data: existingRooms, error: existingError } = await admin
    .from('eclipse_rooms')
    .select('*')
    .eq('public_match', true)
    .eq('status', 'waiting')
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
    .order('updated_at', { ascending: false })
    .limit(3);
  if (existingError) throw new Error(existingError.message);
  if (existingRooms?.length) {
    const existing = existingRooms[0] as RoomRow;
    return await getRoomPayload(admin, existing, userId);
  }

  const { data: candidates, error: candidateError } = await admin
    .from('eclipse_rooms')
    .select('*')
    .eq('public_match', true)
    .eq('status', 'waiting')
    .is('guest_id', null)
    .neq('host_id', userId)
    .order('created_at')
    .limit(12);
  if (candidateError) throw new Error(candidateError.message);

  const candidateRows = (candidates ?? []) as RoomRow[];
  const onlineHosts = await onlinePresenceSet(admin, candidateRows.map((candidate) => candidate.host_id));
  for (const candidate of candidateRows) {
    if (!onlineHosts.has(candidate.host_id)) continue;
    const { data, error } = await admin
      .from('eclipse_rooms')
      .update({ guest_id: userId, ready_host: false, ready_guest: false })
      .eq('id', candidate.id)
      .eq('status', 'waiting')
      .is('guest_id', null)
      .select('*')
      .maybeSingle();
    if (!error && data) return await getRoomPayload(admin, data as RoomRow, userId);
  }

  const { data, error } = await admin
    .from('eclipse_rooms')
    .insert({ code: randomRoomCode(), host_id: userId, public_match: true })
    .select('*')
    .single();
  if (error || !data) throw new Error(error?.message ?? '자동 매칭 대기실 생성 실패');
  return await getRoomPayload(admin, data as RoomRow, userId);
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


type AdminAccountSummary = {
  userId: string;
  email: string;
  displayName: string;
  playerCode: string;
};

// v32s: 제작자 계정은 게임 내 권한이 일반 유저와 완전히 동일합니다.
// 아래 이메일에만 "다른 유저의 비밀번호를 임시 비밀번호로 재설정"하는 복구 기능 하나만 허용합니다.
// 코인, 카드, 랭크, 매칭, 대전, 상점, 덱, 방 권한에는 어떠한 우대도 연결하지 않습니다.
const ACCOUNT_RECOVERY_CREATOR_EMAIL = 'wezxcw1457@gmail.com';

function canRecoverOtherAccounts(user: User): boolean {
  const email = user.email?.trim().toLowerCase() ?? '';
  return email === ACCOUNT_RECOVERY_CREATOR_EMAIL;
}

function requireAccountRecoveryCreator(user: User): void {
  if (!canRecoverOtherAccounts(user)) throw new Error('제작자 계정 복구 기능을 사용할 수 없습니다.');
}

function searchPattern(value: string): string {
  return `%${value.replace(/[\\%_]/g, (match) => `\\${match}`)}%`;
}

async function profileRowsByIds(admin: AdminDbClient, userIds: string[]): Promise<Map<string, { display_name: string; player_code: string }>> {
  if (!userIds.length) return new Map();
  const { data, error } = await admin
    .from('eclipse_profiles')
    .select('user_id,display_name,player_code')
    .in('user_id', [...new Set(userIds)]);
  if (error) throw new Error(error.message);
  return new Map((data ?? []).map((row: { user_id: string; display_name: string; player_code: string }) => [row.user_id, { display_name: row.display_name, player_code: row.player_code }]));
}

async function adminFindAccounts(admin: AdminDbClient, rawQuery: unknown): Promise<AdminAccountSummary[]> {
  const query = cleanText(rawQuery, 80);
  if (query.length < 2) throw new Error('이메일, 플레이어 코드 또는 닉네임을 2자 이상 입력하세요.');
  const lower = query.toLowerCase();

  if (query.includes('@')) {
    const matchedUsers: User[] = [];
    for (let page = 1; page <= 10 && matchedUsers.length < 20; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (error) throw new Error(error.message);
      const users = data.users ?? [];
      matchedUsers.push(...users.filter((candidate) => candidate.email?.toLowerCase().includes(lower)));
      if (users.length < 1000) break;
    }
    const unique = [...new Map(matchedUsers.map((candidate) => [candidate.id, candidate])).values()].slice(0, 20);
    const profiles = await profileRowsByIds(admin, unique.map((candidate) => candidate.id));
    return unique.map((candidate) => {
      const profile = profiles.get(candidate.id);
      return {
        userId: candidate.id,
        email: candidate.email ?? '',
        displayName: profile?.display_name ?? '프로필 없음',
        playerCode: profile?.player_code ?? '-',
      };
    });
  }

  const pattern = searchPattern(query);
  const [codeResult, nameResult] = await Promise.all([
    admin.from('eclipse_profiles').select('user_id,display_name,player_code').ilike('player_code', pattern).limit(12),
    admin.from('eclipse_profiles').select('user_id,display_name,player_code').ilike('display_name', pattern).limit(12),
  ]);
  if (codeResult.error) throw new Error(codeResult.error.message);
  if (nameResult.error) throw new Error(nameResult.error.message);

  const rows = [...(codeResult.data ?? []), ...(nameResult.data ?? [])] as Array<{ user_id: string; display_name: string; player_code: string }>;
  const uniqueRows = [...new Map(rows.map((row) => [row.user_id, row])).values()].slice(0, 20);
  const output: AdminAccountSummary[] = [];
  for (const row of uniqueRows) {
    const { data, error } = await admin.auth.admin.getUserById(row.user_id);
    if (error) throw new Error(error.message);
    output.push({
      userId: row.user_id,
      email: data.user?.email ?? '',
      displayName: row.display_name,
      playerCode: row.player_code,
    });
  }
  return output;
}

async function adminAccountSummary(admin: AdminDbClient, userId: string): Promise<AdminAccountSummary> {
  const [{ data: authData, error: authError }, { data: profile, error: profileError }] = await Promise.all([
    admin.auth.admin.getUserById(userId),
    admin.from('eclipse_profiles').select('display_name,player_code').eq('user_id', userId).maybeSingle(),
  ]);
  if (authError || !authData.user) throw new Error(authError?.message ?? '계정을 찾을 수 없습니다.');
  if (profileError) throw new Error(profileError.message);
  return {
    userId,
    email: authData.user.email ?? '',
    displayName: profile?.display_name ?? '프로필 없음',
    playerCode: profile?.player_code ?? '-',
  };
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

  const cosmeticsResult = await admin.from('eclipse_profile_cosmetics').select('cosmetic_id').eq('user_id', userId);
  const cosmeticsMissing = Boolean(cosmeticsResult.error && /eclipse_profile_cosmetics|does not exist|schema cache/i.test(cosmeticsResult.error.message));
  if (cosmeticsResult.error && !cosmeticsMissing) throw new Error(cosmeticsResult.error.message);

  const battleEmotesResult = await admin.from('eclipse_battle_emotes').select('emote_id').eq('user_id', userId);
  const battleEmotesMissing = Boolean(battleEmotesResult.error && /eclipse_battle_emotes|does not exist|schema cache/i.test(battleEmotesResult.error.message));
  if (battleEmotesResult.error && !battleEmotesMissing) throw new Error(battleEmotesResult.error.message);

  const ownedBattleEmotes = battleEmotesMissing ? [] : (battleEmotesResult.data ?? []).map((row: { emote_id: string }) => row.emote_id);
  const emoteLoadout = await readEmoteLoadout(admin, userId, ownedBattleEmotes);

  const friendIds = (friendsResult.data ?? []).map((row: { friend_id: string }) => row.friend_id);
  let friendProfiles: unknown[] = [];
  if (friendIds.length > 0) {
    const { data, error } = await admin
      .from('eclipse_profiles')
      .select('user_id,display_name,player_code,avatar,status_message,wins,losses,xp,nickname_style,profile_theme,profile_frame')
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
      .select('user_id,display_name,player_code,avatar,nickname_style,profile_theme,profile_frame')
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
    profileCosmetics: cosmeticsMissing ? [] : (cosmeticsResult.data ?? []).map((row: { cosmetic_id: string }) => row.cosmetic_id),
    battleEmotes: ownedBattleEmotes,
    emoteLoadout,
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

function roomOwnerId(room: RoomRow): string {
  return room.owner_id || room.host_id;
}

function isRoomPlayer(room: RoomRow, userId: string): boolean {
  return room.host_id === userId || room.guest_id === userId;
}

function assertPlayer(room: RoomRow, userId: string): void {
  if (!isRoomPlayer(room, userId)) throw new Error('현재 대전 선수만 사용할 수 있는 기능입니다.');
}

async function roomMemberIds(admin: AdminDbClient, room: RoomRow): Promise<string[]> {
  if (room.public_match) return [room.host_id, room.guest_id].filter(Boolean) as string[];
  const { data, error } = await admin
    .from('eclipse_room_members')
    .select('user_id,joined_at')
    .eq('room_id', room.id)
    .order('joined_at', { ascending: true });
  if (error) {
    if (/eclipse_room_members|owner_id|schema cache|does not exist/i.test(error.message)) {
      throw new Error('관전/대기방 선수 교체 DB 업그레이드가 필요합니다. sql/17_V32E_PRIVATE_ROOM_SPECTATOR_LOBBY.sql을 실행해 주세요.');
    }
    throw new Error(error.message);
  }
  const ids: string[] = ((data ?? []) as Array<{ user_id: string }>).map((row) => String(row.user_id)).filter(Boolean);
  // Migration-safe fallback only when this private room has no member rows at all.
  // Once membership exists, leaving a room must really remove that user instead of
  // re-adding a departed player merely because host_id/guest_id still hold the finished-match seats.
  if (ids.length === 0) {
    ids.push(roomOwnerId(room), room.host_id);
    if (room.guest_id) ids.push(room.guest_id);
  }
  return [...new Set(ids)];
}

async function assertRoomMember(admin: AdminDbClient, room: RoomRow, userId: string): Promise<void> {
  if (room.public_match) {
    assertPlayer(room, userId);
    return;
  }
  const ids = await roomMemberIds(admin, room);
  if (!ids.includes(userId)) throw new Error('이 방의 참가자 또는 관전자가 아닙니다.');
}

async function addPrivateRoomMember(admin: AdminDbClient, roomId: string, userId: string): Promise<void> {
  const { count, error: countError } = await admin
    .from('eclipse_room_members')
    .select('user_id', { count: 'exact', head: true })
    .eq('room_id', roomId);
  if (countError) {
    if (/eclipse_room_members|schema cache|does not exist/i.test(countError.message)) {
      throw new Error('관전/대기방 선수 교체 DB 업그레이드가 필요합니다. sql/17_V32E_PRIVATE_ROOM_SPECTATOR_LOBBY.sql을 실행해 주세요.');
    }
    throw new Error(countError.message);
  }
  const { data: existing } = await admin.from('eclipse_room_members').select('user_id').eq('room_id', roomId).eq('user_id', userId).maybeSingle();
  if (!existing && (count ?? 0) >= PRIVATE_ROOM_MEMBER_LIMIT) throw new Error(`한 방에는 선수/관전자 포함 최대 ${PRIVATE_ROOM_MEMBER_LIMIT}명까지 입장할 수 있습니다.`);
  const { error } = await admin
    .from('eclipse_room_members')
    .upsert({ room_id: roomId, user_id: userId }, { onConflict: 'room_id,user_id' });
  if (error) {
    if (/eclipse_room_members|schema cache|does not exist/i.test(error.message)) {
      throw new Error('관전/대기방 선수 교체 DB 업그레이드가 필요합니다. sql/17_V32E_PRIVATE_ROOM_SPECTATOR_LOBBY.sql을 실행해 주세요.');
    }
    throw new Error(error.message);
  }
}

async function removePrivateRoomMember(admin: AdminDbClient, roomId: string, userId: string): Promise<void> {
  const { error } = await admin.from('eclipse_room_members').delete().eq('room_id', roomId).eq('user_id', userId);
  if (error && !/does not exist|schema cache/i.test(error.message)) throw new Error(error.message);
}

function roomWagerAmount(room: RoomRow): number {
  const value = Number(room.wager_amount ?? 0);
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function roomWagerAccepted(room: RoomRow): boolean {
  return roomWagerAmount(room) <= 0 || (room.wager_host_accepted === true && room.wager_guest_accepted === true);
}

async function walletCoins(admin: AdminDbClient, userId: string): Promise<number> {
  const { data, error } = await admin.from('eclipse_wallets').select('coins').eq('user_id', userId).single();
  if (error) throw new Error(`코인 잔액 확인 실패: ${error.message}`);
  return Math.max(0, Number(data?.coins ?? 0));
}

function wagerMigrationError(error: { message?: string } | null | undefined): boolean {
  return Boolean(error?.message && /wager_|eclipse_(lock|settle|refund)_room_wager_v31k|schema cache|does not exist/i.test(error.message));
}

async function lockRoomWager(admin: AdminDbClient, room: RoomRow): Promise<void> {
  if (room.public_match || roomWagerAmount(room) <= 0) return;
  const { error } = await admin.rpc('eclipse_lock_room_wager_v31k', { p_room_id: room.id });
  if (error) {
    if (wagerMigrationError(error)) throw new Error('코인 내기 DB 업그레이드가 필요합니다. sql/14_V31K_PRIVATE_ROOM_WAGER.sql을 한 번 실행해 주세요.');
    throw new Error(`판돈 예치 실패: ${error.message}`);
  }
}

async function settleRoomWager(admin: AdminDbClient, room: RoomRow, winnerId: string | null): Promise<void> {
  if (!winnerId || room.public_match || roomWagerAmount(room) <= 0 || room.wager_settled === true) return;
  const { error } = await admin.rpc('eclipse_settle_room_wager_v31k', { p_room_id: room.id, p_winner: winnerId });
  if (error) {
    if (wagerMigrationError(error)) throw new Error('코인 내기 정산 DB 업그레이드가 필요합니다. sql/14_V31K_PRIVATE_ROOM_WAGER.sql을 실행해 주세요.');
    throw new Error(`판돈 정산 실패: ${error.message}`);
  }
}

async function refundRoomWager(admin: AdminDbClient, room: RoomRow): Promise<void> {
  if (room.public_match || roomWagerAmount(room) <= 0 || room.wager_locked !== true || room.wager_settled === true) return;
  const { error } = await admin.rpc('eclipse_refund_room_wager_v31k', { p_room_id: room.id });
  if (error && !wagerMigrationError(error)) throw new Error(`판돈 환불 실패: ${error.message}`);
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

// READY 버튼은 양쪽 브라우저에서 거의 동시에 눌릴 수 있습니다.
// 각 UPDATE의 RETURNING 결과만 보고 시작 여부를 판단하면, 두 요청 모두
// 상대 READY를 보기 전에 끝나 최종 DB는 READY/READY인데 게임이 시작되지 않는
// 경합이 생길 수 있습니다. 항상 UPDATE 이후 최신 행을 다시 읽고 시작을 시도합니다.
async function startWaitingRoomIfReady(admin: AdminDbClient, roomId: string): Promise<RoomRow> {
  let latest = await fetchRoom(admin, roomId);
  if (latest.status !== 'waiting' || !latest.guest_id || !latest.ready_host || !latest.ready_guest) return latest;

  // guest_id는 위 조건에서 존재가 확인됐지만, latest를 아래에서 다시 읽으면
  // TypeScript의 null 좁히기가 풀립니다. 시작 대상 게스트를 별도 string으로 고정합니다.
  const startingGuestId = latest.guest_id;
  const [hostDeck, guestDeck] = await Promise.all([
    activeDeck(admin, latest.host_id),
    activeDeck(admin, startingGuestId),
  ]);
  if (!latest.public_match && roomWagerAmount(latest) > 0) {
    if (!roomWagerAccepted(latest)) throw new Error('양쪽 플레이어가 판돈에 동의해야 결투를 시작할 수 있습니다.');
    await lockRoomWager(admin, latest);
    latest = await fetchRoom(admin, roomId);

    // 판돈 잠금과 재조회 사이에 방 참가자가 바뀌는 비정상 경합도 방어합니다.
    if (!latest.guest_id || latest.guest_id !== startingGuestId) {
      await refundRoomWager(admin, latest);
      throw new Error('대전 상대 정보가 변경되었습니다. 방 상태를 새로고침한 뒤 다시 준비해 주세요.');
    }
  }
  const snapshot = initializeMatch(
    latest.host_id,
    hostDeck.cards,
    hostDeck.extraCards,
    startingGuestId,
    guestDeck.cards,
    guestDeck.extraCards,
  );

  try {
    await commitSnapshot(admin, latest, snapshot);
  } catch (error) {
    // 양쪽 READY 요청/동기화가 동시에 시작을 시도해도 버전 잠금으로 한쪽만
    // 성공합니다. 이 충돌은 정상적인 동시성 상황이므로 최신 방을 다시 읽습니다.
    if (!(error instanceof Error) || !/상대 행동과 겹쳤습니다/.test(error.message)) throw error;
  }
  latest = await fetchRoom(admin, roomId);
  return latest;
}

async function rewardFinishedMatch(admin: AdminDbClient, roomId: string, state: MatchState): Promise<void> {
  if (state.status !== 'finished' || !state.winnerId || state.playerOrder.length !== 2) return;
  try {
    const room = await fetchRoom(admin, roomId);
    await settleRoomWager(admin, room, state.winnerId);
  } catch (error) {
    console.error('wager settlement error', error instanceof Error ? error.message : error);
  }
  for (const playerId of state.playerOrder) {
    const won = playerId === state.winnerId;
    const { error } = await admin.rpc('eclipse_reward_match', {
      p_room_id: roomId,
      p_user: playerId,
      p_coins: won ? 100 : 35,
      p_xp: won ? 100 : 35,
      p_won: won,
    });
    if (error) console.error('reward error', error.message);
  }
}


function timeoutStateChanged(before: GameSnapshot, after: GameSnapshot): boolean {
  return JSON.stringify(before.state) !== JSON.stringify(after.state)
    || JSON.stringify(before.privateStates) !== JSON.stringify(after.privateStates);
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
  let currentRoom = room;
  await assertRoomMember(admin, currentRoom, userId);
  if (currentRoom.status === 'finished' && currentRoom.winner_id && currentRoom.wager_locked === true && currentRoom.wager_settled !== true) {
    try {
      await settleRoomWager(admin, currentRoom, currentRoom.winner_id);
      currentRoom = await fetchRoom(admin, currentRoom.id);
    } catch (error) {
      console.error('late wager settlement error', error instanceof Error ? error.message : error);
    }
  }
  const memberIds = await roomMemberIds(admin, currentRoom);
  const profileIds = currentRoom.public_match
    ? [currentRoom.host_id, currentRoom.guest_id].filter(Boolean) as string[]
    : memberIds;
  const { data: profiles, error: profileError } = await admin
    .from('eclipse_profiles')
    .select('user_id,display_name,avatar,wins,losses,xp,profile_emblem,card_sleeve,nickname_style')
    .in('user_id', profileIds);
  if (profileError) throw new Error(profileError.message);

  let privateState: PrivateState | null = null;
  if (currentRoom.state && isRoomPlayer(currentRoom, userId)) {
    const { data, error } = await admin
      .from('eclipse_private_states')
      .select('state')
      .eq('room_id', currentRoom.id)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    privateState = (data?.state as PrivateState | undefined) ?? null;
  }

  // Spectator-only reveal: return the two players' hand cards, never their deck order,
  // extra deck, or face-down trap identities. Players still receive only their own
  // privateState, so this cannot reveal an opponent hand to an active duelist.
  let spectatorHands: Record<string, PrivateState['hand']> | undefined;
  if (currentRoom.state && currentRoom.guest_id && !isRoomPlayer(currentRoom, userId)) {
    const duelists = [currentRoom.host_id, currentRoom.guest_id];
    const { data, error } = await admin
      .from('eclipse_private_states')
      .select('user_id,state')
      .eq('room_id', currentRoom.id)
      .in('user_id', duelists);
    if (error) throw new Error(error.message);
    spectatorHands = {};
    for (const row of data ?? []) {
      const state = row.state as PrivateState | undefined;
      spectatorHands[String(row.user_id)] = Array.isArray(state?.hand) ? state.hand : [];
    }
    for (const duelistId of duelists) {
      if (!spectatorHands[duelistId]) spectatorHands[duelistId] = [];
    }
  }

  const battleEmotesResult = await admin.from('eclipse_battle_emotes').select('emote_id').eq('user_id', userId);
  const battleEmotesMissing = Boolean(battleEmotesResult.error && /eclipse_battle_emotes|does not exist|schema cache/i.test(battleEmotesResult.error.message));
  if (battleEmotesResult.error && !battleEmotesMissing) throw new Error(battleEmotesResult.error.message);
  const ownedBattleEmotes = battleEmotesMissing ? [] : (battleEmotesResult.data ?? []).map((row: { emote_id: string }) => row.emote_id);
  const emoteLoadout = await readEmoteLoadout(admin, userId, ownedBattleEmotes);

  return {
    room: currentRoom,
    profiles: profiles ?? [],
    privateState,
    spectatorHands,
    battleEmotes: emoteLoadout,
    members: memberIds.map((memberId) => ({
      user_id: memberId,
      role: memberId === currentRoom.host_id ? 'player_a' : memberId === currentRoom.guest_id ? 'player_b' : 'spectator',
      is_owner: memberId === roomOwnerId(currentRoom),
    })),
  };
}

async function findResumableRoom(admin: AdminDbClient, userId: string): Promise<RoomRow | null> {
  // First preserve legacy/quick-match player resume behavior.
  const { data: direct, error: directError } = await admin
    .from('eclipse_rooms')
    .select('*')
    .in('status', ['waiting', 'active', 'finished'])
    .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (directError) throw new Error(`진행 중인 결투 확인 실패: ${directError.message}`);
  if (direct) return direct as RoomRow;

  // Private-room spectators also resume the room after refresh/reconnect.
  const { data: memberships, error: memberError } = await admin
    .from('eclipse_room_members')
    .select('room_id,joined_at')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .limit(10);
  if (memberError) {
    if (/eclipse_room_members|schema cache|does not exist/i.test(memberError.message)) return null;
    throw new Error(`관전방 복구 확인 실패: ${memberError.message}`);
  }
  for (const membership of memberships ?? []) {
    const { data: roomData, error: roomError } = await admin
      .from('eclipse_rooms')
      .select('*')
      .eq('id', membership.room_id)
      .in('status', ['waiting', 'active', 'finished'])
      .maybeSingle();
    if (roomError) throw new Error(`관전방 복구 실패: ${roomError.message}`);
    if (roomData && !(roomData as RoomRow).public_match) return roomData as RoomRow;
  }
  return null;
}

async function handleAction(request: Request, body: RequestBody) {
  const { user, client } = await requireUser(request);
  await ensureAccount(client, user);
  const action = cleanText(body.action, 50);

  if (action === 'bootstrap' || action === 'hub') {
    const probe = await probeSecureServer();
    const base = {
      hub: await getHub(client, user.id),
      user: { id: user.id, email: user.email },
      canRecoverAccounts: canRecoverOtherAccounts(user),
      serverStatus: probe.status,
    };

    // 브라우저 새로고침이나 순간적인 네트워크 끊김으로 결투를 잃지 않도록
    // 최초 부트스트랩에서만 가장 최근의 진행 중 방을 자동 복구합니다.
    if (action === 'bootstrap' && probe.client) {
      try {
        await touchMatchPresence(probe.client, user.id);
        await cleanupStalePublicWaitingRooms(probe.client);
        let resumable = await findResumableRoom(probe.client, user.id);
        if (resumable?.status === 'active' && resumable.state) {
          resumable = (await normalizeTurnTimeout(probe.client, resumable)).room;
        }
        if (resumable) {
          return { ...base, ...(await getRoomPayload(probe.client, resumable, user.id)), resumedRoom: true };
        }
      } catch (error) {
        // 허브 진입 자체를 막지 않습니다. 복구 실패는 사용자가 다시 대전 메뉴에서 재시도할 수 있습니다.
        console.error('resume room error', error instanceof Error ? error.message : error);
      }
    }

    return base;
  }

  if (action === 'admin_find_accounts') {
    requireAccountRecoveryCreator(user);
    const admin = await requireAdmin();
    const accounts = (await adminFindAccounts(admin, body.query)).filter((account) => account.userId !== user.id);
    return { accounts };
  }

  if (action === 'admin_reset_password') {
    requireAccountRecoveryCreator(user);
    const admin = await requireAdmin();
    const targetUserId = cleanText(body.userId, 64);
    if (!targetUserId) throw new Error('비밀번호를 재설정할 계정을 선택하세요.');
    if (targetUserId === user.id) throw new Error('제작자 본인 계정은 일반 유저와 동일하게 SYSTEM > 내 비밀번호 변경을 사용하세요.');

    // v32u: 제작자가 직접 정한 임시 비밀번호만 사용합니다. 서버에서 임의 생성하지 않습니다.
    const temporaryPassword = typeof body.temporaryPassword === 'string' ? body.temporaryPassword : '';
    if (temporaryPassword.length < 6) throw new Error('임시 비밀번호는 6자 이상 입력하세요.');
    if (temporaryPassword.length > 72) throw new Error('임시 비밀번호는 72자 이하로 입력하세요.');
    if (/\r|\n/.test(temporaryPassword)) throw new Error('임시 비밀번호에는 줄바꿈을 사용할 수 없습니다.');

    const account = await adminAccountSummary(admin, targetUserId);
    const { error } = await admin.auth.admin.updateUserById(targetUserId, { password: temporaryPassword });
    if (error) throw new Error(error.message);
    // 비밀번호 값은 로그/응답에 남기지 않습니다.
    console.info('[ECLIPSE ACCOUNT RECOVERY] creator-set password reset', { adminUserId: user.id, targetUserId });
    return { account };
  }

  if (action === 'update_profile') {
    const displayName = cleanText(body.displayName, 16);
    const statusMessage = cleanText(body.statusMessage, 60);
    const avatar = cleanText(body.avatar, 40) || 'eclipse';
    if (displayName.length < 2) throw new Error('플레이어 이름은 2자 이상 입력하세요.');

    // 기본 아이콘 외의 상점 문양을 프로필 아이콘으로 사용할 수 있습니다.
    // 구매하지 않은 꾸미기 ID를 API로 직접 넣는 우회는 서버에서 차단합니다.
    const builtInAvatars = new Set(['eclipse', 'nova', 'oracle', 'warden', 'reaper', 'seraph']);
    if (!builtInAvatars.has(avatar)) {
      if (!avatar.startsWith('emblem_')) throw new Error('사용할 수 없는 프로필 아이콘입니다.');
      const { data: ownedIcon, error: ownedIconError } = await client
        .from('eclipse_profile_cosmetics')
        .select('cosmetic_id')
        .eq('user_id', user.id)
        .eq('cosmetic_id', avatar)
        .maybeSingle();
      if (ownedIconError) {
        if (/eclipse_profile_cosmetics|does not exist|schema cache/i.test(ownedIconError.message)) throw new Error('v26 꾸미기 상점 DB 업그레이드가 필요합니다. sql/06_V26_EXPANSION_COSMETICS.sql을 한 번 실행해 주세요.');
        throw new Error(ownedIconError.message);
      }
      if (!ownedIcon) throw new Error('보유하지 않은 프로필 아이콘입니다. 상점에서 먼저 구매해 주세요.');
    }

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
    const { data, error } = await client.rpc('eclipse_open_pack_v26', { p_pack_id: packId });
    if (error) {
      if (/eclipse_open_pack_v26|schema cache|does not exist/i.test(error.message)) throw new Error('v26 카드 확장 DB 업그레이드가 필요합니다. sql/06_V26_EXPANSION_COSMETICS.sql을 한 번 실행해 주세요.');
      throw new Error(error.message);
    }
    const payload = (data ?? {}) as { cardIds?: string[]; balance?: number };
    return {
      cardIds: Array.isArray(payload.cardIds) ? payload.cardIds : [],
      balance: Number(payload.balance ?? 0),
      hub: await getHub(client, user.id),
    };
  }

  if (action === 'buy_profile_cosmetic') {
    const cosmeticId = cleanText(body.cosmeticId, 40);
    const { error } = await client.rpc('eclipse_buy_profile_cosmetic_v26', { p_cosmetic_id: cosmeticId });
    if (error) {
      if (/function .*eclipse_buy_profile_cosmetic_v26.*does not exist|schema cache/i.test(error.message)) throw new Error('v26 꾸미기 상점 DB 업그레이드가 필요합니다. sql/06_V26_EXPANSION_COSMETICS.sql을 한 번 실행해 주세요.');
      throw new Error(error.message);
    }
    return { hub: await getHub(client, user.id) };
  }

  if (action === 'buy_battle_emote') {
    const emoteId = cleanText(body.emoteId, 80);
    if (!V34_BATTLE_EMOTE_BY_ID[emoteId]) throw new Error('존재하지 않는 감정표현입니다.');
    const { error } = await client.rpc('eclipse_buy_battle_emote_v34', { p_emote_id: emoteId });
    if (error) {
      if (/eclipse_buy_battle_emote_v34|schema cache|does not exist/i.test(error.message)) throw new Error('v34c 감정표현 DB 업그레이드가 필요합니다. sql/20_V34C_EMOTE_LOADOUT_NIKKE_TRICKCAL.sql을 한 번 실행해 주세요.');
      if (/존재하지 않는 감정표현/.test(error.message) && /^(guardian_|mang_|irem_)/.test(emoteId)) throw new Error('새 이모티콘 DB 확장이 필요합니다. sql/21_V34D_ADD_GUARDIAN_MANG_IREM.sql을 한 번 실행해 주세요.');
      throw new Error(error.message);
    }
    return { hub: await getHub(client, user.id) };
  }

  if (action === 'buy_battle_emote_pack') {
    const packId = cleanText(body.packId, 80);
    if (!V34_BATTLE_EMOTE_PACK_BY_ID[packId]) throw new Error('존재하지 않는 감정표현 세트입니다.');
    const { error } = await client.rpc('eclipse_buy_battle_emote_pack_v34', { p_pack_id: packId });
    if (error) {
      if (/eclipse_buy_battle_emote_pack_v34|schema cache|does not exist/i.test(error.message)) throw new Error('v34c 감정표현 DB 업그레이드가 필요합니다. sql/20_V34C_EMOTE_LOADOUT_NIKKE_TRICKCAL.sql을 한 번 실행해 주세요.');
      if (/존재하지 않는 감정표현 세트/.test(error.message) && /^(guardian_bundle|mang_bundle|irem_bundle)$/.test(packId)) throw new Error('새 이모티콘 세트 DB 확장이 필요합니다. sql/21_V34D_ADD_GUARDIAN_MANG_IREM.sql을 한 번 실행해 주세요.');
      throw new Error(error.message);
    }
    return { hub: await getHub(client, user.id) };
  }

  if (action === 'set_emote_loadout') {
    const rawIds = Array.isArray(body.emoteIds) ? body.emoteIds : [];
    const emoteIds = rawIds.map((value) => cleanText(value, 80)).filter(Boolean);
    if (emoteIds.length > 6) throw new Error('이모티콘은 최대 6개까지만 장착할 수 있습니다.');
    if (new Set(emoteIds).size !== emoteIds.length) throw new Error('같은 이모티콘을 중복 장착할 수 없습니다.');
    if (emoteIds.some((id) => !V34_BATTLE_EMOTE_BY_ID[id])) throw new Error('현재 사용할 수 없는 이모티콘이 포함되어 있습니다.');
    const { error } = await client.rpc('eclipse_set_emote_loadout_v34', { p_emote_ids: emoteIds });
    if (error) {
      if (/eclipse_set_emote_loadout_v34|schema cache|does not exist/i.test(error.message)) throw new Error('v34c 감정표현 DB 업그레이드가 필요합니다. sql/20_V34C_EMOTE_LOADOUT_NIKKE_TRICKCAL.sql을 한 번 실행해 주세요.');
      if (/현재 사용할 수 없는 이모티콘/.test(error.message) && emoteIds.some((id) => /^(guardian_|mang_|irem_)/.test(id))) throw new Error('새 이모티콘 장착 DB 확장이 필요합니다. sql/21_V34D_ADD_GUARDIAN_MANG_IREM.sql을 한 번 실행해 주세요.');
      throw new Error(error.message);
    }
    return { hub: await getHub(client, user.id) };
  }

  if (action === 'equip_profile_cosmetic') {
    const cosmeticId = cleanText(body.cosmeticId, 40);
    const { error } = await client.rpc('eclipse_equip_profile_cosmetic_v26', { p_cosmetic_id: cosmeticId });
    if (error) {
      if (/function .*eclipse_equip_profile_cosmetic_v26.*does not exist|schema cache/i.test(error.message)) throw new Error('v26 꾸미기 상점 DB 업그레이드가 필요합니다. sql/06_V26_EXPANSION_COSMETICS.sql을 한 번 실행해 주세요.');
      throw new Error(error.message);
    }
    return { hub: await getHub(client, user.id) };
  }

  if (action === 'send_global_message') {
    const message = cleanText(body.message, 180);
    if (!message) throw new Error('메시지를 입력하세요.');
    await assertChatEmotesEquipped(client, user.id, message);
    const { error } = await client.rpc('eclipse_send_global_message_v25', { p_body: message });
    if (error) {
      if (/eclipse_send_global_message_v25|schema cache|does not exist/i.test(error.message)) throw new Error('v25 글로벌 채팅 DB 업그레이드가 필요합니다. sql/05_V25_SERIES_PACKS_CHAT.sql을 한 번 실행해 주세요.');
      throw new Error(error.message);
    }
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

  if (action === 'set_room_wager') {
    const admin = await requireAdmin();
    const roomId = cleanText(body.roomId, 64);
    const amountRaw = Number(body.amount);
    if (!Number.isFinite(amountRaw) || !Number.isInteger(amountRaw)) throw new Error('판돈 금액이 올바르지 않습니다.');
    const amount = Math.max(0, amountRaw);
    if (amount !== 0 && (amount < 50 || amount > 10000 || amount % 50 !== 0)) {
      throw new Error('판돈은 0 또는 50 COIN 단위로 50~10,000 COIN까지 설정할 수 있습니다.');
    }
    let room = await fetchRoom(admin, roomId);
    await assertRoomMember(admin, room, user.id);
    if (room.public_match) throw new Error('코인 내기는 비공개 방 대전에서만 사용할 수 있습니다.');
    if (roomOwnerId(room) !== user.id) throw new Error('방장만 판돈을 설정할 수 있습니다.');
    if (room.status !== 'waiting') throw new Error('결투가 시작된 뒤에는 판돈을 변경할 수 없습니다.');
    if (room.wager_locked === true) throw new Error('이미 판돈이 예치되어 변경할 수 없습니다.');

    const { data, error } = await admin
      .from('eclipse_rooms')
      .update({
        wager_amount: amount,
        // 선수 교체가 가능한 방이므로 방장이 선수가 아닐 수도 있습니다.
        // 실제 대전 선수 A/B가 각각 직접 동의하도록 둘 다 초기화합니다.
        wager_host_accepted: false,
        wager_guest_accepted: false,
        wager_locked: false,
        wager_settled: false,
        ready_host: false,
        ready_guest: false,
      })
      .eq('id', room.id)
      .eq('status', 'waiting')
      .select('*')
      .single();
    if (error || !data) {
      if (wagerMigrationError(error)) throw new Error('코인 내기 DB 업그레이드가 필요합니다. sql/14_V31K_PRIVATE_ROOM_WAGER.sql을 한 번 실행해 주세요.');
      throw new Error(error?.message ?? '판돈 설정 실패');
    }
    room = data as RoomRow;
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'accept_room_wager') {
    const admin = await requireAdmin();
    const roomId = cleanText(body.roomId, 64);
    let room = await fetchRoom(admin, roomId);
    await assertRoomMember(admin, room, user.id);
    assertPlayer(room, user.id);
    if (room.public_match) throw new Error('코인 내기는 비공개 방 대전에서만 사용할 수 있습니다.');
    if (room.status !== 'waiting') throw new Error('이미 시작된 결투입니다.');
    const amount = roomWagerAmount(room);
    if (amount <= 0) return await getRoomPayload(admin, room, user.id);
    if (room.wager_locked === true) return await getRoomPayload(admin, room, user.id);
    const balance = await walletCoins(admin, user.id);
    if (balance < amount) throw new Error(`판돈이 부족합니다. 현재 ${balance.toLocaleString()} COIN / 필요 ${amount.toLocaleString()} COIN`);

    const isSeatA = room.host_id === user.id;
    const acceptField = isSeatA ? 'wager_host_accepted' : 'wager_guest_accepted';
    const readyField = isSeatA ? 'ready_host' : 'ready_guest';
    const { data, error } = await admin
      .from('eclipse_rooms')
      .update({ [acceptField]: true, [readyField]: false })
      .eq('id', room.id)
      .eq('status', 'waiting')
      .select('*')
      .single();
    if (error || !data) {
      if (wagerMigrationError(error)) throw new Error('코인 내기 DB 업그레이드가 필요합니다. sql/14_V31K_PRIVATE_ROOM_WAGER.sql을 한 번 실행해 주세요.');
      throw new Error(error?.message ?? '판돈 동의 저장 실패');
    }
    room = data as RoomRow;
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'create_room') {
    const admin = await requireAdmin();
    await activeDeck(admin, user.id);
    let room: RoomRow | null = null;
    for (let attempt = 0; attempt < 5 && !room; attempt += 1) {
      const { data, error } = await admin
        .from('eclipse_rooms')
        .insert({ code: randomRoomCode(), owner_id: user.id, host_id: user.id, public_match: false })
        .select('*')
        .single();
      if (!error && data) room = data as RoomRow;
      else if (error?.code !== '23505') {
        if (/owner_id|schema cache|does not exist/i.test(error?.message ?? '')) throw new Error('관전/대기방 선수 교체 DB 업그레이드가 필요합니다. sql/17_V32E_PRIVATE_ROOM_SPECTATOR_LOBBY.sql을 실행해 주세요.');
        throw new Error(error?.message ?? '방 생성 실패');
      }
    }
    if (!room) throw new Error('방 코드를 만들지 못했습니다. 다시 시도해 주세요.');
    await addPrivateRoomMember(admin, room.id, user.id);
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'quick_match') {
    const admin = await requireAdmin();
    await activeDeck(admin, user.id);
    return await runQuickMatch(admin, user.id);
  }

  if (action === 'match_presence') {
    const admin = await requireAdmin();
    await touchMatchPresence(admin, user.id);
    const roomId = cleanText(body.roomId, 64);
    if (!roomId) return { ok: true };

    let room = await fetchRoom(admin, roomId);
    assertPlayer(room, user.id);
    if (!room.public_match) return { ok: true };
    if (room.status === 'cancelled') {
      return { ...(await runQuickMatch(admin, user.id)), heartbeat: true, rematched: true };
    }
    if (room.status !== 'waiting') return { ok: true };

    const otherId = room.host_id === user.id ? room.guest_id : room.host_id;
    if (!otherId) return { ...(await getRoomPayload(admin, room, user.id)), heartbeat: true };

    const online = await onlinePresenceSet(admin, [otherId]);
    if (online.has(otherId)) return { ...(await getRoomPayload(admin, room, user.id)), heartbeat: true };

    if (room.host_id === user.id) {
      const { data, error } = await admin
        .from('eclipse_rooms')
        .update({ guest_id: null, ready_host: false, ready_guest: false })
        .eq('id', room.id)
        .eq('status', 'waiting')
        .select('*')
        .single();
      if (error || !data) throw new Error(error?.message ?? '오프라인 상대 정리 실패');
      return { ...(await getRoomPayload(admin, data as RoomRow, user.id)), heartbeat: true, opponentDisconnected: true };
    }

    // I am the guest and the host disappeared: cancel the ghost room and immediately requeue me.
    const { error: cancelError } = await admin
      .from('eclipse_rooms')
      .update({ status: 'cancelled' })
      .eq('id', room.id)
      .eq('status', 'waiting');
    if (cancelError) throw new Error(cancelError.message);
    return { ...(await runQuickMatch(admin, user.id)), heartbeat: true, rematched: true, opponentDisconnected: true };
  }

  if (action === 'join_room') {
    const admin = await requireAdmin();
    await activeDeck(admin, user.id);
    const code = cleanText(body.code, 8).toUpperCase();
    const { data: found, error: findError } = await admin.from('eclipse_rooms').select('*').eq('code', code).maybeSingle();
    if (findError) throw new Error(findError.message);
    if (!found) throw new Error('방 코드를 찾을 수 없습니다.');
    let room = found as RoomRow;
    if (room.public_match) throw new Error('빠른 대전 방에는 코드로 참가할 수 없습니다.');
    if (room.status === 'cancelled') throw new Error('이미 닫힌 방입니다.');
    await addPrivateRoomMember(admin, room.id, user.id);
    if (isRoomPlayer(room, user.id)) return await getRoomPayload(admin, room, user.id);
    if (room.status !== 'waiting') return { ...(await getRoomPayload(admin, room, user.id)), joinedAsSpectator: true };
    if (room.guest_id) return { ...(await getRoomPayload(admin, room, user.id)), joinedAsSpectator: true };
    const { data, error } = await admin
      .from('eclipse_rooms')
      .update({ guest_id: user.id, wager_host_accepted: false, wager_guest_accepted: false, ready_host: false, ready_guest: false })
      .eq('id', room.id)
      .eq('status', 'waiting')
      .is('guest_id', null)
      .select('*')
      .single();
    if (error || !data) {
      room = await fetchRoom(admin, room.id);
      return { ...(await getRoomPayload(admin, room, user.id)), joinedAsSpectator: true };
    }
    room = data as RoomRow;
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'spectate_room') {
    const admin = await requireAdmin();
    const code = cleanText(body.code, 8).toUpperCase();
    const { data: found, error: findError } = await admin.from('eclipse_rooms').select('*').eq('code', code).maybeSingle();
    if (findError) throw new Error(findError.message);
    if (!found) throw new Error('방 코드를 찾을 수 없습니다.');
    const room = found as RoomRow;
    if (room.public_match) throw new Error('빠른 대전은 관전할 수 없습니다.');
    if (room.status === 'cancelled') throw new Error('이미 닫힌 방입니다.');
    await addPrivateRoomMember(admin, room.id, user.id);
    return { ...(await getRoomPayload(admin, room, user.id)), joinedAsSpectator: !isRoomPlayer(room, user.id) };
  }

  if (action === 'set_room_players') {
    const admin = await requireAdmin();
    const roomId = cleanText(body.roomId, 64);
    const playerAId = cleanText(body.playerAId, 64);
    const playerBId = cleanText(body.playerBId, 64);
    let room = await fetchRoom(admin, roomId);
    await assertRoomMember(admin, room, user.id);
    if (room.public_match) throw new Error('빠른 대전 선수는 변경할 수 없습니다.');
    if (roomOwnerId(room) !== user.id) throw new Error('방장만 다음 경기 선수를 지정할 수 있습니다.');
    if (room.status !== 'waiting') throw new Error('대기방에서만 선수를 변경할 수 있습니다.');
    if (!playerAId || !playerBId || playerAId === playerBId) throw new Error('서로 다른 선수 2명을 선택하세요.');
    const members = await roomMemberIds(admin, room);
    if (!members.includes(playerAId) || !members.includes(playerBId)) throw new Error('방에 있는 유저만 선수로 지정할 수 있습니다.');
    // 선수로 지정되는 순간 실제 사용 가능한 활성 덱이 있는지 서버에서 확인합니다.
    await Promise.all([activeDeck(admin, playerAId), activeDeck(admin, playerBId)]);
    await refundRoomWager(admin, room);
    const { data, error } = await admin
      .from('eclipse_rooms')
      .update({
        host_id: playerAId,
        guest_id: playerBId,
        ready_host: false,
        ready_guest: false,
        wager_host_accepted: false,
        wager_guest_accepted: false,
        wager_locked: false,
        wager_settled: false,
      })
      .eq('id', room.id)
      .eq('status', 'waiting')
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message ?? '선수 변경 실패');
    room = data as RoomRow;
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'return_to_room_lobby') {
    const admin = await requireAdmin();
    const roomId = cleanText(body.roomId, 64);
    let room = await fetchRoom(admin, roomId);
    await assertRoomMember(admin, room, user.id);
    if (room.public_match) throw new Error('빠른 대전은 대기방으로 돌아갈 수 없습니다.');
    if (room.status === 'waiting') return await getRoomPayload(admin, room, user.id);
    if (room.status !== 'finished') throw new Error('경기가 끝난 뒤 대기방으로 돌아갈 수 있습니다.');
    if (room.winner_id) await settleRoomWager(admin, room, room.winner_id);
    room = await fetchRoom(admin, room.id);
    await admin.from('eclipse_private_states').delete().eq('room_id', room.id);
    const members = await roomMemberIds(admin, room);
    if (members.length === 0) {
      await admin.from('eclipse_rooms').update({ status: 'cancelled' }).eq('id', room.id);
      throw new Error('방에 남아 있는 유저가 없어 방이 종료되었습니다.');
    }
    const ownerId = members.includes(roomOwnerId(room)) ? roomOwnerId(room) : members[0];
    let playerAId = members.includes(room.host_id) ? room.host_id : ownerId;
    let playerBId = room.guest_id && members.includes(room.guest_id) && room.guest_id !== playerAId ? room.guest_id : null;
    if (!playerBId) playerBId = members.find((id) => id !== playerAId) ?? null;
    const { data, error } = await admin
      .from('eclipse_rooms')
      .update({
        owner_id: ownerId,
        host_id: playerAId,
        guest_id: playerBId,
        status: 'waiting',
        state: null,
        winner_id: null,
        ready_host: false,
        ready_guest: false,
        wager_host_accepted: false,
        wager_guest_accepted: false,
        wager_locked: false,
        wager_settled: false,
        wager_locked_at: null,
        wager_settled_at: null,
        version: room.version + 1,
      })
      .eq('id', room.id)
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message ?? '대기방 복귀 실패');
    room = data as RoomRow;
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'get_room') {
    const admin = await requireAdmin();
    const roomId = cleanText(body.roomId, 64);
    let room = await fetchRoom(admin, roomId);
    await assertRoomMember(admin, room, user.id);

    // 예전 요청 경합으로 READY/READY 상태에서 멈춘 빠른대전도 다음 동기화에서
    // 자동으로 시작되도록 복구합니다.
    if (room.status === 'waiting' && room.guest_id && room.ready_host && room.ready_guest) {
      room = await startWaitingRoomIfReady(admin, room.id);
    }

    const normalized = await normalizeTurnTimeout(admin, room);
    room = normalized.room;
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'ready') {
    const admin = await requireAdmin();
    const roomId = cleanText(body.roomId, 64);
    let room = await fetchRoom(admin, roomId);
    await assertRoomMember(admin, room, user.id);
    assertPlayer(room, user.id);
    if (!room.guest_id) throw new Error('상대 플레이어를 기다리고 있습니다.');
    if (room.status !== 'waiting') return await getRoomPayload(admin, room, user.id);
    if (!room.public_match && roomWagerAmount(room) > 0) {
      if (!roomWagerAccepted(room)) throw new Error('양쪽 플레이어가 먼저 판돈에 동의해야 합니다.');
      const balance = await walletCoins(admin, user.id);
      if (balance < roomWagerAmount(room)) throw new Error(`판돈이 부족합니다. ${roomWagerAmount(room).toLocaleString()} COIN이 필요합니다.`);
    }
    const field = room.host_id === user.id ? 'ready_host' : 'ready_guest';
    const { data, error } = await admin
      .from('eclipse_rooms')
      .update({ [field]: true })
      .eq('id', room.id)
      .eq('status', 'waiting')
      .select('*')
      .single();
    if (error || !data) throw new Error(error?.message ?? '준비 상태 저장 실패');

    // UPDATE RETURNING 행만 믿지 않고 최신 READY 상태를 다시 조회합니다.
    // 두 플레이어가 동시에 준비해도 마지막 READY 이후 반드시 한 요청은
    // READY/READY를 확인하고 매치를 시작합니다.
    room = await startWaitingRoomIfReady(admin, room.id);
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'game_action') {
    const admin = await requireAdmin();
    const roomId = cleanText(body.roomId, 64);
    const gameAction = cleanText(body.gameAction, 40);
    let room = await fetchRoom(admin, roomId);
    await assertRoomMember(admin, room, user.id);
    assertPlayer(room, user.id);
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
      const rawTarget = body.target && typeof body.target === 'object' ? body.target as Record<string, unknown> : undefined;
      const target = rawTarget
        ? {
            ownerId: cleanText(rawTarget.ownerId, 64),
            unitIndex: rawTarget.unitIndex === undefined ? undefined : Number(rawTarget.unitIndex),
            graveyardIndex: rawTarget.graveyardIndex === undefined ? undefined : Number(rawTarget.graveyardIndex),
            deckCardId: rawTarget.deckCardId === undefined ? undefined : cleanText(rawTarget.deckCardId, 100),
          }
        : undefined;
      next = playCard(snapshot, user.id, instanceId, zone, target);
    } else if (gameAction === 'extra_summon') {
      const extraInstanceId = cleanText(body.extraInstanceId, 80);
      const materialZones = Array.isArray(body.materialZones) ? body.materialZones.map(Number) : [];
      const extraChoiceIndex = body.extraChoiceIndex === undefined ? undefined : Number(body.extraChoiceIndex);
      next = summonExtra(snapshot, user.id, extraInstanceId, materialZones, extraChoiceIndex);
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
    } else if (gameAction === 'trap_response') {
      next = respondTrap(snapshot, user.id, body.activate === true);
    } else if (gameAction === 'draw_turn') {
      next = drawAndEndTurn(snapshot, user.id);
    } else if (gameAction === 'sacrifice_energy') {
      const instanceId = cleanText(body.instanceId, 80);
      next = sacrificeHandForEnergy(snapshot, user.id, instanceId);
    } else if (gameAction === 'sacrifice_field_energy') {
      const unitIndex = Number(body.unitIndex);
      next = sacrificeFieldUnitForEnergy(snapshot, user.id, unitIndex);
    } else if (gameAction === 'energy_draw') {
      next = spendEnergyToDraw(snapshot, user.id);
    } else if (gameAction === 'battle_emote') {
      const emoteId = cleanText(body.emoteId, 80);
      if (!V34_BATTLE_EMOTE_BY_ID[emoteId]) throw new Error('존재하지 않는 감정표현입니다.');
      const { data: ownedRows, error: ownedError } = await admin.from('eclipse_battle_emotes').select('emote_id').eq('user_id', user.id);
      if (ownedError) {
        if (/eclipse_battle_emotes|does not exist|schema cache/i.test(ownedError.message)) throw new Error('v34 감정표현 DB 업그레이드가 필요합니다. sql/19_V34_ECLIPSE_CYCLE_EMOTES_200.sql을 실행해 주세요.');
        throw new Error(ownedError.message);
      }
      const ownedIds = (ownedRows ?? []).map((row: { emote_id: string }) => row.emote_id);
      if (!ownedIds.includes(emoteId)) throw new Error('상점에서 구매한 감정표현만 사용할 수 있습니다.');
      const loadout = await readEmoteLoadout(admin, user.id, ownedIds);
      if (!loadout.includes(emoteId)) throw new Error('현재 장착한 6개 이모티콘만 대전에서 사용할 수 있습니다. 상점 → 감정표현에서 장착을 변경해 주세요.');
      next = sendBattleEmote(snapshot, user.id, emoteId);
    } else if (gameAction === 'end_turn') {
      next = endTurn(snapshot, user.id);
    } else if (gameAction === 'surrender') {
      next = surrender(snapshot, user.id);
    } else {
      throw new Error('알 수 없는 결투 행동입니다.');
    }

    try {
      await commitSnapshot(admin, room, next);
    } catch (error) {
      if (error instanceof Error && /상대 행동과 겹쳤습니다/.test(error.message)) {
        return await getRoomPayload(admin, await fetchRoom(admin, room.id), user.id);
      }
      throw error;
    }
    await rewardFinishedMatch(admin, room.id, next.state);
    return await getRoomPayload(admin, await fetchRoom(admin, room.id), user.id);
  }

  if (action === 'send_room_message') {
    const roomId = cleanText(body.roomId, 64);
    const message = cleanText(body.message, 180);
    if (!message) throw new Error('메시지를 입력하세요.');
    await assertChatEmotesEquipped(client, user.id, message);
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
    let room = await fetchRoom(admin, roomId);

    if (room.public_match) {
      assertPlayer(room, user.id);
      if (room.status === 'active' && room.state) {
        const next = surrender(await loadSnapshot(admin, room), user.id);
        await commitSnapshot(admin, room, next);
        await rewardFinishedMatch(admin, room.id, next.state);
      } else if (room.host_id === user.id) {
        await refundRoomWager(admin, room);
        const { error } = await admin.from('eclipse_rooms').update({ status: 'cancelled' }).eq('id', room.id);
        if (error) throw new Error(error.message);
      } else {
        await refundRoomWager(admin, room);
        const { error } = await admin.from('eclipse_rooms').update({ guest_id: null, ready_host: false, ready_guest: false, wager_guest_accepted: false }).eq('id', room.id);
        if (error) throw new Error(error.message);
      }
      return { ok: true };
    }

    await assertRoomMember(admin, room, user.id);
    const wasPlayer = isRoomPlayer(room, user.id);
    const wasOwner = roomOwnerId(room) === user.id;

    // A player leaving an active private match surrenders, while a spectator can leave silently.
    if (room.status === 'active' && room.state && wasPlayer) {
      const next = surrender(await loadSnapshot(admin, room), user.id);
      await commitSnapshot(admin, room, next);
      await rewardFinishedMatch(admin, room.id, next.state);
      room = await fetchRoom(admin, room.id);
    }

    if (room.status === 'waiting') await refundRoomWager(admin, room);
    await removePrivateRoomMember(admin, room.id, user.id);
    const members = await roomMemberIds(admin, room).then((ids) => ids.filter((id) => id !== user.id));

    if (members.length === 0) {
      const { error } = await admin.from('eclipse_rooms').update({ status: 'cancelled' }).eq('id', room.id);
      if (error) throw new Error(error.message);
      return { ok: true };
    }

    const newOwnerId = wasOwner ? members[0] : roomOwnerId(room);
    const update: Record<string, unknown> = { owner_id: newOwnerId };

    // Do not rewrite player IDs during an active/finished result snapshot; that would corrupt
    // the public match state. Seat cleanup happens immediately in the waiting room or when
    // somebody returns the finished room to the lobby.
    if (room.status === 'waiting') {
      let nextA = room.host_id;
      let nextB = room.guest_id;
      if (room.host_id === user.id || !members.includes(room.host_id)) nextA = members[0];
      if (room.guest_id === user.id || (room.guest_id && !members.includes(room.guest_id)) || nextB === nextA) {
        nextB = members.find((id) => id !== nextA) ?? null;
      }
      update.host_id = nextA;
      update.guest_id = nextB;
      update.ready_host = false;
      update.ready_guest = false;
      update.wager_host_accepted = false;
      update.wager_guest_accepted = false;
      update.wager_locked = false;
      update.wager_settled = false;
    }

    const { error } = await admin.from('eclipse_rooms').update(update).eq('id', room.id);
    if (error) throw new Error(error.message);
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
    version: '0.17.1-v32r',
    projectRef,
    serverStatus: probe.status,
  });
}
