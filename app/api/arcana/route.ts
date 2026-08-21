import { createClient, User } from '@supabase/supabase-js';
import {
  CARDS,
  PACKS,
  Rarity,
  STARTER_DECK,
  countCards,
  starterCollection,
  validateDeck,
} from '../../game-data';
import {
  GameSnapshot,
  PrivateState,
  MatchState,
  attack,
  beginBattlePhase,
  endTurn,
  initializeMatch,
  playCard,
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

function env(name: string, fallback?: string): string {
  const value = process.env[name] || (fallback ? process.env[fallback] : undefined);
  if (!value) throw new Error(`${name} 환경변수가 없습니다.`);
  return value;
}

function adminClient() {
  return createClient(
    env('NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_URL'),
    process.env.SUPABASE_SERVICE_ROLE_KEY || env('SUPABASE_SECRET_KEY'),
    {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    },
  );
}

async function requireUser(request: Request): Promise<{ user: User; admin: ReturnType<typeof adminClient> }> {
  const authorization = request.headers.get('authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!token) throw new Error('로그인이 필요합니다.');
  const admin = adminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) throw new Error('로그인 정보가 만료되었습니다. 다시 로그인해 주세요.');
  return { user: data.user, admin };
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

async function ensureAccount(admin: ReturnType<typeof adminClient>, user: User): Promise<void> {
  const defaultName = cleanText(user.user_metadata?.display_name || user.email?.split('@')[0] || '신입 결투가', 16) || '신입 결투가';
  const { data: profile, error: profileReadError } = await admin
    .from('eclipse_profiles')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (profileReadError) throw new Error(`프로필 확인 실패: ${profileReadError.message}`);
  if (!profile) {
    const { error } = await admin.from('eclipse_profiles').insert({
      user_id: user.id,
      display_name: defaultName,
      player_code: makePlayerCode(user.id),
    });
    if (error) throw new Error(`기본 프로필 생성 실패: ${error.message}`);
  }

  const { data: wallet, error: walletReadError } = await admin
    .from('eclipse_wallets')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle();
  if (walletReadError) throw new Error(`지갑 확인 실패: ${walletReadError.message}`);
  if (!wallet) {
    const { error } = await admin.from('eclipse_wallets').insert({ user_id: user.id, coins: 500 });
    if (error) throw new Error(`기본 코인 지급 실패: ${error.message}`);
  }

  const { count: collectionCount, error: collectionCountError } = await admin
    .from('eclipse_collections')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  if (collectionCountError) throw new Error(`보유 카드 확인 실패: ${collectionCountError.message}`);
  if ((collectionCount ?? 0) === 0) {
    const rows = Object.entries(starterCollection()).map(([card_id, quantity]) => ({ user_id: user.id, card_id, quantity }));
    const { error } = await admin.from('eclipse_collections').insert(rows);
    if (error) throw new Error(`기본 카드 지급 실패: ${error.message}`);
  }

  const { count: deckCount, error: deckCountError } = await admin
    .from('eclipse_decks')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);
  if (deckCountError) throw new Error(`덱 확인 실패: ${deckCountError.message}`);
  if ((deckCount ?? 0) === 0) {
    const { error } = await admin.from('eclipse_decks').insert({
      user_id: user.id,
      name: '여명의 기본 덱',
      cards: STARTER_DECK,
      is_active: true,
    });
    if (error) throw new Error(`기본 덱 지급 실패: ${error.message}`);
  }
}

async function getHub(admin: ReturnType<typeof adminClient>, userId: string) {
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

async function getCollectionMap(admin: ReturnType<typeof adminClient>, userId: string): Promise<Record<string, number>> {
  const { data, error } = await admin.from('eclipse_collections').select('card_id,quantity').eq('user_id', userId);
  if (error) throw new Error(`보유 카드 확인 실패: ${error.message}`);
  return Object.fromEntries((data ?? []).map((row: { card_id: string; quantity: number }) => [row.card_id, row.quantity]));
}

async function activeDeck(admin: ReturnType<typeof adminClient>, userId: string): Promise<string[]> {
  const { data, error } = await admin
    .from('eclipse_decks')
    .select('cards')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw new Error(`활성 덱 확인 실패: ${error.message}`);
  const cards = Array.isArray(data?.cards) ? data.cards.map(String) : [];
  const collection = await getCollectionMap(admin, userId);
  const validation = validateDeck(cards, collection);
  if (validation) throw new Error(`활성 덱을 사용할 수 없습니다: ${validation}`);
  return cards;
}

function rarityRank(rarity: Rarity): number {
  return { common: 0, rare: 1, epic: 2, legendary: 3 }[rarity];
}

function secureFloat(): number {
  const values = new Uint32Array(1);
  globalThis.crypto.getRandomValues(values);
  return values[0] / 0xffffffff;
}

function rollRarity(minimum: Rarity = 'common', legendaryBoost = false): Rarity {
  const roll = secureFloat();
  let rarity: Rarity;
  if (legendaryBoost ? roll < 0.06 : roll < 0.025) rarity = 'legendary';
  else if (roll < 0.14) rarity = 'epic';
  else if (roll < 0.42) rarity = 'rare';
  else rarity = 'common';
  return rarityRank(rarity) < rarityRank(minimum) ? minimum : rarity;
}

function rollCard(rarity: Rarity, pickupElement?: string): string {
  let candidates = CARDS.filter((card) => card.rarity === rarity);
  if (pickupElement && secureFloat() < 0.6) {
    const pickup = candidates.filter((card) => card.element === pickupElement);
    if (pickup.length > 0) candidates = pickup;
  }
  if (candidates.length === 0) candidates = CARDS;
  return candidates[Math.floor(secureFloat() * candidates.length)].id;
}

function openPack(packId: string): { cardIds: string[]; pack: (typeof PACKS)[number] } {
  const pack = PACKS.find((item) => item.id === packId);
  if (!pack) throw new Error('존재하지 않는 카드 팩입니다.');
  const guaranteedSlots = pack.id === 'elite' ? 2 : pack.id === 'mythic' ? 2 : 1;
  const cards: string[] = [];
  for (let index = 0; index < 5; index += 1) {
    const minimum = index >= 5 - guaranteedSlots ? pack.guaranteed : 'common';
    const rarity = rollRarity(minimum, pack.id === 'mythic');
    cards.push(rollCard(rarity, pack.pickupElement));
  }
  return { cardIds: cards, pack };
}

async function fetchRoom(admin: ReturnType<typeof adminClient>, roomId: string): Promise<RoomRow> {
  const { data, error } = await admin.from('eclipse_rooms').select('*').eq('id', roomId).single();
  if (error || !data) throw new Error('결투방을 찾을 수 없습니다.');
  return data as RoomRow;
}

function assertParticipant(room: RoomRow, userId: string): void {
  if (room.host_id !== userId && room.guest_id !== userId) throw new Error('이 결투방의 참가자가 아닙니다.');
}

async function loadSnapshot(admin: ReturnType<typeof adminClient>, room: RoomRow): Promise<GameSnapshot> {
  if (!room.state) throw new Error('결투 상태가 아직 생성되지 않았습니다.');
  const { data, error } = await admin.from('eclipse_private_states').select('user_id,state').eq('room_id', room.id);
  if (error) throw new Error(`비공개 카드 상태 불러오기 실패: ${error.message}`);
  const privateStates: Record<string, PrivateState> = {};
  for (const row of data ?? []) privateStates[String(row.user_id)] = row.state as PrivateState;
  if (!room.guest_id || !privateStates[room.host_id] || !privateStates[room.guest_id]) throw new Error('양쪽 덱 상태가 완성되지 않았습니다.');
  return { state: room.state, privateStates };
}

async function commitSnapshot(admin: ReturnType<typeof adminClient>, room: RoomRow, snapshot: GameSnapshot): Promise<void> {
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

async function rewardFinishedMatch(admin: ReturnType<typeof adminClient>, roomId: string, state: MatchState): Promise<void> {
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

async function getRoomPayload(admin: ReturnType<typeof adminClient>, room: RoomRow, userId: string) {
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
  const { user, admin } = await requireUser(request);
  await ensureAccount(admin, user);
  const action = cleanText(body.action, 50);

  if (action === 'bootstrap' || action === 'hub') {
    return { hub: await getHub(admin, user.id), user: { id: user.id, email: user.email } };
  }

  if (action === 'update_profile') {
    const displayName = cleanText(body.displayName, 16);
    const statusMessage = cleanText(body.statusMessage, 60);
    const avatar = cleanText(body.avatar, 24) || 'eclipse';
    if (displayName.length < 2) throw new Error('플레이어 이름은 2자 이상 입력하세요.');
    const { error } = await admin
      .from('eclipse_profiles')
      .update({ display_name: displayName, status_message: statusMessage, avatar })
      .eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return { hub: await getHub(admin, user.id) };
  }

  if (action === 'save_deck') {
    const deckId = cleanText(body.deckId, 64);
    const name = cleanText(body.name, 24) || '커스텀 덱';
    const cards = Array.isArray(body.cards) ? body.cards.map(String) : [];
    const collection = await getCollectionMap(admin, user.id);
    const validation = validateDeck(cards, collection);
    if (validation) throw new Error(validation);

    if (deckId) {
      const { error } = await admin.from('eclipse_decks').update({ name, cards }).eq('id', deckId).eq('user_id', user.id);
      if (error) throw new Error(error.message);
    } else {
      const { count } = await admin.from('eclipse_decks').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
      if ((count ?? 0) >= 5) throw new Error('덱은 최대 5개까지 저장할 수 있습니다.');
      const { error } = await admin.from('eclipse_decks').insert({ user_id: user.id, name, cards, is_active: false });
      if (error) throw new Error(error.message);
    }
    return { hub: await getHub(admin, user.id) };
  }

  if (action === 'set_active_deck') {
    const deckId = cleanText(body.deckId, 64);
    const { data: deck, error: deckError } = await admin
      .from('eclipse_decks')
      .select('cards')
      .eq('id', deckId)
      .eq('user_id', user.id)
      .single();
    if (deckError || !deck) throw new Error('덱을 찾을 수 없습니다.');
    const validation = validateDeck(Array.isArray(deck.cards) ? deck.cards.map(String) : [], await getCollectionMap(admin, user.id));
    if (validation) throw new Error(validation);
    const { error: clearError } = await admin.from('eclipse_decks').update({ is_active: false }).eq('user_id', user.id);
    if (clearError) throw new Error(clearError.message);
    const { error } = await admin.from('eclipse_decks').update({ is_active: true }).eq('id', deckId).eq('user_id', user.id);
    if (error) throw new Error(error.message);
    return { hub: await getHub(admin, user.id) };
  }

  if (action === 'buy_pack') {
    const packId = cleanText(body.packId, 30);
    const { cardIds, pack } = openPack(packId);
    const cardCounts = countCards(cardIds);
    const items = Object.entries(cardCounts).map(([card_id, quantity]) => ({ card_id, quantity }));
    const { data: balance, error } = await admin.rpc('eclipse_open_pack', {
      p_user: user.id,
      p_cost: pack.price,
      p_cards: items,
    });
    if (error) throw new Error(error.message);
    return { cardIds, balance, hub: await getHub(admin, user.id) };
  }

  if (action === 'send_global_message') {
    const message = cleanText(body.message, 180);
    if (!message) throw new Error('메시지를 입력하세요.');
    if (/https?:\/\//i.test(message)) throw new Error('채팅에는 외부 링크를 보낼 수 없습니다.');
    const { data: recentMessage } = await admin
      .from('eclipse_global_messages')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recentMessage && Date.now() - new Date(recentMessage.created_at).getTime() < 1200) {
      throw new Error('메시지는 1.2초 간격으로 보낼 수 있습니다.');
    }
    const { data: profile } = await admin.from('eclipse_profiles').select('display_name').eq('user_id', user.id).single();
    const { error } = await admin.from('eclipse_global_messages').insert({
      user_id: user.id,
      display_name: profile?.display_name ?? '결투가',
      body: message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  if (action === 'friend_request') {
    const playerCode = cleanText(body.playerCode, 20).toUpperCase();
    const { data: receiver, error: receiverError } = await admin
      .from('eclipse_profiles')
      .select('user_id')
      .eq('player_code', playerCode)
      .maybeSingle();
    if (receiverError) throw new Error(receiverError.message);
    if (!receiver) throw new Error('해당 친구 코드를 찾을 수 없습니다.');
    if (receiver.user_id === user.id) throw new Error('자기 자신에게 친구 요청을 보낼 수 없습니다.');
    const { data: existing } = await admin
      .from('eclipse_friends')
      .select('user_id')
      .eq('user_id', user.id)
      .eq('friend_id', receiver.user_id)
      .maybeSingle();
    if (existing) throw new Error('이미 친구입니다.');
    const { error } = await admin.from('eclipse_friend_requests').insert({ sender_id: user.id, receiver_id: receiver.user_id });
    if (error) throw new Error(error.code === '23505' ? '이미 친구 요청을 보냈습니다.' : error.message);
    return { hub: await getHub(admin, user.id) };
  }

  if (action === 'friend_respond') {
    const requestId = cleanText(body.requestId, 64);
    const accept = Boolean(body.accept);
    const { data: requestRow, error: requestError } = await admin
      .from('eclipse_friend_requests')
      .select('*')
      .eq('id', requestId)
      .eq('receiver_id', user.id)
      .eq('status', 'pending')
      .single();
    if (requestError || !requestRow) throw new Error('친구 요청을 찾을 수 없습니다.');
    const { error: updateError } = await admin
      .from('eclipse_friend_requests')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', requestId);
    if (updateError) throw new Error(updateError.message);
    if (accept) {
      const { error } = await admin.from('eclipse_friends').upsert([
        { user_id: requestRow.sender_id, friend_id: requestRow.receiver_id },
        { user_id: requestRow.receiver_id, friend_id: requestRow.sender_id },
      ]);
      if (error) throw new Error(error.message);
    }
    return { hub: await getHub(admin, user.id) };
  }

  if (action === 'friend_remove') {
    const friendId = cleanText(body.friendId, 64);
    const firstDelete = await admin
      .from('eclipse_friends')
      .delete()
      .eq('user_id', user.id)
      .eq('friend_id', friendId);
    if (firstDelete.error) throw new Error(firstDelete.error.message);
    const secondDelete = await admin
      .from('eclipse_friends')
      .delete()
      .eq('user_id', friendId)
      .eq('friend_id', user.id);
    if (secondDelete.error) throw new Error(secondDelete.error.message);
    return { hub: await getHub(admin, user.id) };
  }

  if (action === 'create_room') {
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
    const roomId = cleanText(body.roomId, 64);
    const room = await fetchRoom(admin, roomId);
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'ready') {
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
      const snapshot = initializeMatch(room.host_id, hostDeck, room.guest_id, guestDeck);
      await commitSnapshot(admin, room, snapshot);
      room = await fetchRoom(admin, room.id);
    }
    return await getRoomPayload(admin, room, user.id);
  }

  if (action === 'game_action') {
    const roomId = cleanText(body.roomId, 64);
    const gameAction = cleanText(body.gameAction, 40);
    const room = await fetchRoom(admin, roomId);
    assertParticipant(room, user.id);
    if (room.status !== 'active') throw new Error('진행 중인 결투가 아닙니다.');
    const snapshot = await loadSnapshot(admin, room);
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
    const room = await fetchRoom(admin, roomId);
    assertParticipant(room, user.id);
    const { data: recentMessage } = await admin
      .from('eclipse_room_messages')
      .select('created_at')
      .eq('room_id', room.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    if (recentMessage && Date.now() - new Date(recentMessage.created_at).getTime() < 1200) {
      throw new Error('메시지는 1.2초 간격으로 보낼 수 있습니다.');
    }
    const { data: profile } = await admin.from('eclipse_profiles').select('display_name').eq('user_id', user.id).single();
    const { error } = await admin.from('eclipse_room_messages').insert({
      room_id: room.id,
      user_id: user.id,
      display_name: profile?.display_name ?? '결투가',
      body: message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  }

  if (action === 'leave_room') {
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
    const message = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.';
    console.error('[ECLIPSE API]', message);
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}
