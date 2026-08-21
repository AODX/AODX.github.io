'use client';

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { createClient, type Session } from '@supabase/supabase-js';
import {
  CARD_MAP,
  CARD_POOL,
  COPY_LIMIT_BY_RARITY,
  DECK_SIZE,
  RARITY_LABEL,
  TYPE_LABEL,
  type ArcanaCard,
  type CardRarity,
  type CardTarget,
  type CardType,
} from './arcana-cards';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-public-key',
);

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
  keywords: string[];
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

type DuelState = {
  currentPlayerId: string | null;
  phase: 'main' | 'battle';
  turnNo: number;
  players: Record<string, PlayerPublicState>;
  log: Array<{ id: string; text: string; tone: 'normal' | 'good' | 'bad' | 'system'; at: number }>;
  winnerPlayerId: string | null;
  lastActionAt: number;
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

type HandCard = { uid: string; card: ArcanaCard };
type DuelView = {
  room: RoomRow;
  players: PlayerRow[];
  me: PlayerRow;
  hand: HandCard[];
  myTraps: HandCard[];
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

type MatchmakingResponse = {
  matched: boolean;
  waiting: boolean;
  waiters: number;
  view?: DuelView;
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

type PackOpening = { pack: PackCatalogItem; cardIds: string[] };
type PackOpeningResponse = { account: AccountView; opening: PackOpening };

type ChatMessage = {
  id: number;
  room_id: string | null;
  session_id: string;
  user_id?: string | null;
  user_name: string;
  body: string;
  created_at: string;
};

type ApiTarget =
  | { kind: 'core'; playerId: string }
  | { kind: 'unit'; playerId: string; instanceId: string };

type AccountSection = 'home' | 'battle' | 'decks' | 'shop' | 'collection' | 'friends' | 'profile';

async function apiRequest<T>(accessToken: string, action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch('/api/arcana', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ action, ...payload }),
  });
  const json = await response.json().catch(() => null) as { ok?: boolean; error?: string; data?: T } | null;
  if (!response.ok || !json?.ok || json.data === undefined) {
    throw new Error(json?.error || '서버 요청에 실패했습니다.');
  }
  return json.data;
}

function shortTime(value: string) {
  return new Date(value).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    const area = document.createElement('textarea');
    area.value = value;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
}

function phaseLabel(phase: DuelState['phase']) {
  return phase === 'main' ? '메인 단계' : '전투 단계';
}

function factionLabel(faction: ArcanaCard['faction']) {
  const labels: Record<ArcanaCard['faction'], string> = {
    ember: '화염', tide: '해류', grove: '수림', void: '공허', crown: '왕관', neutral: '중립',
  };
  return labels[faction];
}

function getTargetHint(card: ArcanaCard) {
  const target = card.target ?? 'none';
  const hints: Record<CardTarget, string> = {
    none: '즉시 사용할 수 있습니다.',
    enemy_any: '적 유닛 또는 적 코어를 선택하세요.',
    enemy_unit: '적 유닛을 선택하세요.',
    friendly_any: '아군 유닛 또는 내 코어를 선택하세요.',
    friendly_unit: '아군 유닛을 선택하세요.',
    empty_friendly_lane: '빈 아군 라인을 선택하세요.',
  };
  if (card.type === 'unit') return '빈 아군 라인을 선택해 소환하세요.';
  if (card.type === 'trap') return '뒤집어서 설치합니다. 정체는 상대에게 보이지 않습니다.';
  return hints[target];
}

function canTargetCore(card: ArcanaCard, isMine: boolean) {
  const target = card.target ?? 'none';
  return (target === 'enemy_any' && !isMine) || (target === 'friendly_any' && isMine);
}

function canTargetUnit(card: ArcanaCard, isMine: boolean) {
  const target = card.target ?? 'none';
  if (isMine) return target === 'friendly_any' || target === 'friendly_unit';
  return target === 'enemy_any' || target === 'enemy_unit';
}

function usePortraitGuard() {
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    const update = () => {
      const coarse = window.matchMedia('(pointer: coarse)').matches;
      setBlocked(coarse && window.innerHeight > window.innerWidth && window.innerWidth < 1100);
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);
  return blocked;
}

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [account, setAccount] = useState<AccountView | null>(null);
  const [section, setSection] = useState<AccountSection>('home');
  const [social, setSocial] = useState<SocialView | null>(null);
  const [joinCode, setJoinCode] = useState('');
  const [mode, setMode] = useState<'quick' | 'grand'>('quick');
  const [view, setView] = useState<DuelView | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatBody, setChatBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [selectedCardUid, setSelectedCardUid] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const [matchmaking, setMatchmaking] = useState<{ active: boolean; mode: 'quick' | 'grand'; waiters: number }>({ active: false, mode: 'quick', waiters: 0 });
  const [rulesOpen, setRulesOpen] = useState(false);
  const [packOpening, setPackOpening] = useState<PackOpening | null>(null);
  const [drawPulseUid, setDrawPulseUid] = useState<string | null>(null);
  const previousHandRef = useRef<string[]>([]);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatOpenRef = useRef(false);
  const portraitBlocked = usePortraitGuard();

  const token = session?.access_token ?? '';
  const roomId = view?.room.id ?? null;
  const selectedHandCard = useMemo(
    () => view?.hand.find((entry) => entry.uid === selectedCardUid) ?? null,
    [selectedCardUid, view?.hand],
  );
  const me = view?.me ?? null;
  const opponent = useMemo(() => view?.players.find((player) => player.id !== view.me.id) ?? null, [view]);
  const myState = me && view ? view.room.state.players[me.id] : null;
  const opponentState = opponent && view ? view.room.state.players[opponent.id] : null;
  const isMyTurn = Boolean(view && me && view.room.state.currentPlayerId === me.id);

  const setFlash = useCallback((message: string, type: 'notice' | 'error' = 'notice') => {
    if (type === 'error') { setError(message); setNotice(''); }
    else { setNotice(message); setError(''); }
    window.setTimeout(() => { setNotice(''); setError(''); }, 4200);
  }, []);

  const loadAccount = useCallback(async () => {
    if (!token) return null;
    const next = await apiRequest<AccountView>(token, 'get_account');
    setAccount(next);
    return next;
  }, [token]);

  const loadSocial = useCallback(async () => {
    if (!token) return null;
    const next = await apiRequest<SocialView>(token, 'get_social');
    setSocial(next);
    return next;
  }, [token]);

  const applyView = useCallback((next: DuelView) => {
    setView(next);
    localStorage.setItem('vanta-arcana-room', next.room.id);
    const previous = new Set(previousHandRef.current);
    const fresh = next.hand.find((entry) => !previous.has(entry.uid));
    previousHandRef.current = next.hand.map((entry) => entry.uid);
    if (fresh) {
      setDrawPulseUid(fresh.uid);
      window.setTimeout(() => setDrawPulseUid(null), 900);
    }
  }, []);

  const callDuelApi = useCallback(async (action: string, payload: Record<string, unknown> = {}) => {
    if (!token) throw new Error('로그인이 필요합니다.');
    return apiRequest<DuelView>(token, action, payload);
  }, [token]);

  const refreshView = useCallback(async (silent = true) => {
    if (!roomId || !token) return;
    try {
      applyView(await callDuelApi('get_state', { roomId }));
    } catch (refreshError) {
      if (!silent) setFlash(refreshError instanceof Error ? refreshError.message : '상태 갱신 실패', 'error');
    }
  }, [applyView, callDuelApi, roomId, setFlash, token]);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthReady(true);
      if (!nextSession) {
        setAccount(null);
        setSocial(null);
        setMatchmaking({ active: false, mode: 'quick', waiters: 0 });
        setView(null);
        localStorage.removeItem('vanta-arcana-room');
      }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!token) return;
    void loadAccount().catch((accountError) => setFlash(accountError instanceof Error ? accountError.message : '계정 로딩 실패', 'error'));
  }, [loadAccount, setFlash, token]);

  useEffect(() => {
    if (!token) return;
    void loadSocial().catch((socialError) => setFlash(socialError instanceof Error ? socialError.message : '친구 목록 로딩 실패', 'error'));
    const heartbeat = window.setInterval(() => {
      void apiRequest<{ online: boolean }>(token, 'heartbeat').catch(() => undefined);
    }, 60_000);
    const socialRefresh = window.setInterval(() => {
      void loadSocial().catch(() => undefined);
    }, 30_000);
    void apiRequest<{ online: boolean }>(token, 'heartbeat').catch(() => undefined);
    return () => {
      window.clearInterval(heartbeat);
      window.clearInterval(socialRefresh);
    };
  }, [loadSocial, setFlash, token]);

  useEffect(() => {
    const saved = localStorage.getItem('vanta-arcana-global-chat');
    setChatOpen(saved === 'open');
  }, []);

  useEffect(() => {
    chatOpenRef.current = chatOpen;
    localStorage.setItem('vanta-arcana-global-chat', chatOpen ? 'open' : 'closed');
    if (chatOpen) setChatUnread(0);
  }, [chatOpen]);

  useEffect(() => {
    if (!token || !account) return;
    const savedRoom = localStorage.getItem('vanta-arcana-room');
    if (!savedRoom) return;
    callDuelApi('get_state', { roomId: savedRoom })
      .then(applyView)
      .catch(() => localStorage.removeItem('vanta-arcana-room'));
  }, [account, applyView, callDuelApi, token]);

  useEffect(() => {
    if (!token || !session) return;
    const currentRoomId = roomId;
    const loadMessages = async () => {
      let query = supabase.from('arcana_messages').select('*').order('created_at', { ascending: false }).limit(70);
      query = currentRoomId ? query.eq('room_id', currentRoomId) : query.is('room_id', null);
      const { data } = await query;
      if (data) setMessages((data as ChatMessage[]).reverse());
    };
    void loadMessages();

    const messageChannel = supabase
      .channel(`arcana-messages-${currentRoomId ?? 'global'}-${session.user.id.slice(0, 6)}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'arcana_messages' }, (payload) => {
        const message = payload.new as ChatMessage;
        if ((currentRoomId && message.room_id === currentRoomId) || (!currentRoomId && message.room_id === null)) {
          setMessages((prev) => [...prev.slice(-69), message]);
          if (!currentRoomId && !chatOpenRef.current && message.user_id !== session.user.id) {
            setChatUnread((count) => Math.min(99, count + 1));
          }
        }
      })
      .subscribe();

    let roomChannel: ReturnType<typeof supabase.channel> | null = null;
    if (currentRoomId) {
      roomChannel = supabase
        .channel(`arcana-room-${currentRoomId}-${session.user.id.slice(0, 6)}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'arcana_rooms', filter: `id=eq.${currentRoomId}` }, () => {
          if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = setTimeout(() => void refreshView(true), 100);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'arcana_players', filter: `room_id=eq.${currentRoomId}` }, () => {
          if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
          refreshTimerRef.current = setTimeout(() => void refreshView(true), 100);
        })
        .subscribe();
    }

    return () => {
      void supabase.removeChannel(messageChannel);
      if (roomChannel) void supabase.removeChannel(roomChannel);
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, [refreshView, roomId, session, token]);

  useEffect(() => {
    if (!selectedCardUid || !view?.hand.some((entry) => entry.uid === selectedCardUid)) setSelectedCardUid(null);
  }, [selectedCardUid, view?.hand]);

  const runDuelAction = useCallback(async (action: string, payload: Record<string, unknown>, successText?: string) => {
    if (busy) return;
    setBusy(true);
    try {
      const next = await callDuelApi(action, payload);
      applyView(next);
      if (successText) setFlash(successText);
    } catch (actionError) {
      setFlash(actionError instanceof Error ? actionError.message : '요청을 처리하지 못했습니다.', 'error');
    } finally {
      setBusy(false);
    }
  }, [applyView, busy, callDuelApi, setFlash]);

  const createRoom = async () => runDuelAction('create_room', { mode }, '새 결투방을 만들었습니다.');
  const joinRoom = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return setFlash('방 코드를 입력해 주세요.', 'error');
    await runDuelAction('join_room', { code }, '결투방에 입장했습니다.');
  };

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const body = chatBody.trim();
    if (!body || !token) return;
    setChatBody('');
    try {
      await apiRequest<{ sent: boolean }>(token, 'send_message', { roomId, message: body });
    } catch (sendError) {
      setFlash(sendError instanceof Error ? sendError.message : '채팅 전송 실패', 'error');
    }
  };

  const playSelected = async (options: { lane?: number; target?: ApiTarget | null } = {}) => {
    if (!selectedHandCard || !roomId) return;
    await runDuelAction('play_card', { roomId, cardUid: selectedHandCard.uid, lane: options.lane, target: options.target ?? null });
    setSelectedCardUid(null);
  };

  const onUnitClick = (playerId: string, unit: BoardUnit) => {
    if (!selectedHandCard) return;
    const isMine = playerId === me?.id;
    if (!canTargetUnit(selectedHandCard.card, isMine)) return;
    void playSelected({ target: { kind: 'unit', playerId, instanceId: unit.instanceId } });
  };

  const onCoreClick = (playerId: string) => {
    if (!selectedHandCard) return;
    const isMine = playerId === me?.id;
    if (!canTargetCore(selectedHandCard.card, isMine)) return;
    void playSelected({ target: { kind: 'core', playerId } });
  };

  const leaveToHome = () => {
    localStorage.removeItem('vanta-arcana-room');
    if (token) void apiRequest<{ cancelled: boolean }>(token, 'cancel_match').catch(() => undefined);
    setView(null);
    setMessages([]);
    setSelectedCardUid(null);
    previousHandRef.current = [];
    setSection('home');
    void loadAccount();
  };

  const signIn = async (email: string, password: string) => {
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (signInError) throw signInError;
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { display_name: displayName.trim().slice(0, 16) } },
    });
    if (signUpError) throw signUpError;
    return Boolean(data.session);
  };

  const signOut = async () => {
    await supabase.auth.signOut({ scope: 'local' });
    setFlash('로그아웃했습니다.');
  };

  const saveDeck = async (deckId: string | null, name: string, cards: string[]) => {
    if (!token) throw new Error('로그인이 필요합니다.');
    const next = await apiRequest<AccountView>(token, 'save_deck', { deckId, deckName: name, cards });
    setAccount(next);
    setFlash('덱을 저장했습니다.');
    return next;
  };

  const setActiveDeck = async (deckId: string) => {
    if (!token) return;
    setBusy(true);
    try {
      const next = await apiRequest<AccountView>(token, 'set_active_deck', { deckId });
      setAccount(next);
      setFlash('사용할 덱을 변경했습니다.');
    } catch (deckError) {
      setFlash(deckError instanceof Error ? deckError.message : '덱 변경 실패', 'error');
    } finally { setBusy(false); }
  };

  const deleteDeck = async (deckId: string) => {
    if (!token || !window.confirm('이 덱을 삭제하시겠습니까?')) return;
    setBusy(true);
    try {
      const next = await apiRequest<AccountView>(token, 'delete_deck', { deckId });
      setAccount(next);
      setFlash('덱을 삭제했습니다.');
    } catch (deckError) {
      setFlash(deckError instanceof Error ? deckError.message : '덱 삭제 실패', 'error');
    } finally { setBusy(false); }
  };

  const openPack = async (packType: PackId) => {
    if (!token || busy) return;
    setBusy(true);
    try {
      const result = await apiRequest<PackOpeningResponse>(token, 'open_pack', { packType });
      setAccount(result.account);
      setPackOpening(result.opening);
    } catch (packError) {
      setFlash(packError instanceof Error ? packError.message : '팩 개봉 실패', 'error');
    } finally { setBusy(false); }
  };


  const updateProfile = async (values: { displayName: string; bio: string; title: string; avatarId: string }) => {
    if (!token) return;
    setBusy(true);
    try {
      const next = await apiRequest<AccountView>(token, 'update_profile', values);
      setAccount(next);
      setFlash('프로필을 저장했습니다.');
    } catch (profileError) {
      setFlash(profileError instanceof Error ? profileError.message : '프로필 저장 실패', 'error');
    } finally { setBusy(false); }
  };

  const socialAction = async (action: string, payload: Record<string, unknown> = {}, successText?: string) => {
    if (!token || busy) return;
    setBusy(true);
    try {
      const next = await apiRequest<SocialView>(token, action, payload);
      setSocial(next);
      if (successText) setFlash(successText);
    } catch (socialError) {
      setFlash(socialError instanceof Error ? socialError.message : '친구 요청 처리 실패', 'error');
    } finally { setBusy(false); }
  };

  const searchPlayer = async (friendCode: string) => {
    if (!token) throw new Error('로그인이 필요합니다.');
    return apiRequest<PublicProfile>(token, 'search_player', { friendCode });
  };

  const startMatchmaking = async (nextMode: 'quick' | 'grand') => {
    if (!token || matchmaking.active) return;
    setMatchmaking({ active: true, mode: nextMode, waiters: 1 });
    try {
      const result = await apiRequest<MatchmakingResponse>(token, 'queue_match', { mode: nextMode });
      if (result.matched && result.view) {
        setMatchmaking({ active: false, mode: nextMode, waiters: 0 });
        applyView(result.view);
        setFlash('상대를 찾았습니다. 결투 대기실로 이동합니다.');
      } else {
        setMatchmaking({ active: true, mode: nextMode, waiters: result.waiters });
      }
    } catch (matchError) {
      setMatchmaking({ active: false, mode: nextMode, waiters: 0 });
      setFlash(matchError instanceof Error ? matchError.message : '매칭 시작 실패', 'error');
    }
  };

  const cancelMatchmaking = async () => {
    if (!token) return;
    setMatchmaking((current) => ({ ...current, active: false, waiters: 0 }));
    await apiRequest<{ cancelled: boolean }>(token, 'cancel_match').catch(() => undefined);
  };

  useEffect(() => {
    if (!token || !matchmaking.active || view) return;
    const timer = window.setInterval(() => {
      void apiRequest<MatchmakingResponse>(token, 'poll_match', { mode: matchmaking.mode })
        .then((result) => {
          if (result.matched && result.view) {
            setMatchmaking({ active: false, mode: matchmaking.mode, waiters: 0 });
            applyView(result.view);
            setFlash('상대를 찾았습니다. 결투 대기실로 이동합니다.');
          } else {
            setMatchmaking((current) => current.active ? { ...current, waiters: result.waiters } : current);
          }
        })
        .catch(() => undefined);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [applyView, matchmaking.active, matchmaking.mode, setFlash, token, view]);

  if (!authReady) {
    return <main className="arcana-app"><AmbientBackground /><div className="loading-screen"><Brand /><p>계정 정보를 확인하고 있습니다…</p></div></main>;
  }

  if (!session) {
    return (
      <main className="arcana-app">
        <AmbientBackground />
        <AuthScreen signIn={signIn} signUp={signUp} setFlash={setFlash} />
        {(notice || error) && <Toast notice={notice} error={error} />}
      </main>
    );
  }

  if (!account) {
    return <main className="arcana-app"><AmbientBackground /><div className="loading-screen"><Brand /><p>기본 덱과 보유 카드를 준비하고 있습니다…</p></div>{(notice || error) && <Toast notice={notice} error={error} />}</main>;
  }

  const content = !view ? (
    <AccountShell
      account={account}
      social={social}
      section={section}
      setSection={setSection}
      signOut={signOut}
      openRules={() => setRulesOpen(true)}
      chatOpen={chatOpen}
      setChatOpen={setChatOpen}
      chatUnread={chatUnread}
      messages={messages}
      chatBody={chatBody}
      setChatBody={setChatBody}
      sendMessage={sendMessage}
    >
      {section === 'home' && (
        <HomeHubScreen
          account={account}
          social={social}
          goBattle={() => setSection('battle')}
          goDecks={() => setSection('decks')}
          goShop={() => setSection('shop')}
          goFriends={() => setSection('friends')}
          goProfile={() => setSection('profile')}
        />
      )}
      {section === 'battle' && (
        <BattleHubScreen
          account={account}
          joinCode={joinCode}
          setJoinCode={setJoinCode}
          mode={mode}
          setMode={setMode}
          createRoom={createRoom}
          joinRoom={joinRoom}
          busy={busy}
          matchmaking={matchmaking}
          startMatchmaking={startMatchmaking}
          cancelMatchmaking={cancelMatchmaking}
          goDecks={() => setSection('decks')}
        />
      )}
      {section === 'decks' && (
        <DeckBuilderScreen account={account} busy={busy} saveDeck={saveDeck} setActiveDeck={setActiveDeck} deleteDeck={deleteDeck} />
      )}
      {section === 'shop' && <ShopScreen account={account} busy={busy} openPack={openPack} />}
      {section === 'collection' && <CollectionScreen account={account} />}
      {section === 'friends' && (
        <FriendsScreen
          account={account}
          social={social}
          busy={busy}
          searchPlayer={searchPlayer}
          sendRequest={(friendCode) => socialAction('send_friend_request', { friendCode }, '친구 요청을 보냈습니다.')}
          respond={(requestId, decision) => socialAction('respond_friend_request', { requestId, decision }, decision === 'accept' ? '친구 요청을 수락했습니다.' : '친구 요청을 거절했습니다.')}
          cancelRequest={(requestId) => socialAction('cancel_friend_request', { requestId }, '친구 요청을 취소했습니다.')}
          removeFriend={(friendId) => socialAction('remove_friend', { friendId }, '친구 목록에서 삭제했습니다.')}
        />
      )}
      {section === 'profile' && <ProfileScreen account={account} busy={busy} updateProfile={updateProfile} />}
    </AccountShell>
  ) : view.room.status === 'lobby' ? (
    <LobbyScreen
      view={view}
      busy={busy}
      toggleReady={() => void runDuelAction('toggle_ready', { roomId: view.room.id })}
      leaveToHome={leaveToHome}
      messages={messages}
      chatBody={chatBody}
      setChatBody={setChatBody}
      sendMessage={sendMessage}
      openRules={() => setRulesOpen(true)}
    />
  ) : (
    <DuelScreen
      view={view}
      selectedCardUid={selectedCardUid}
      setSelectedCardUid={setSelectedCardUid}
      selectedHandCard={selectedHandCard}
      drawPulseUid={drawPulseUid}
      busy={busy}
      isMyTurn={isMyTurn}
      myState={myState}
      opponentState={opponentState}
      opponent={opponent}
      playSelected={playSelected}
      onUnitClick={onUnitClick}
      onCoreClick={onCoreClick}
      attack={(attackerId) => void runDuelAction('attack', { roomId: view.room.id, attackerId })}
      advancePhase={() => void runDuelAction('advance_phase', { roomId: view.room.id })}
      surrender={() => { if (window.confirm('정말 항복하시겠습니까?')) void runDuelAction('surrender', { roomId: view.room.id }); }}
      rematch={() => void runDuelAction('rematch', { roomId: view.room.id })}
      leaveToHome={leaveToHome}
      chatOpen={chatOpen}
      setChatOpen={setChatOpen}
      messages={messages}
      chatBody={chatBody}
      setChatBody={setChatBody}
      sendMessage={sendMessage}
      openRules={() => setRulesOpen(true)}
    />
  );

  return (
    <main className="arcana-app">
      <AmbientBackground />
      {content}
      {(notice || error) && <Toast notice={notice} error={error} />}
      {rulesOpen && <RulesModal close={() => setRulesOpen(false)} />}
      {packOpening && <PackOpeningModal opening={packOpening} close={() => setPackOpening(null)} />}
      {portraitBlocked && view && <RotateOverlay />}
    </main>
  );
}

function Toast({ notice, error }: { notice: string; error: string }) {
  return (
    <div className={`toast ${error ? 'toast-error' : 'toast-notice'}`} role="status">
      <span>{error ? '!' : '✓'}</span><strong>{error || notice}</strong>
    </div>
  );
}

function AmbientBackground() {
  return (
    <div className="ambient" aria-hidden="true">
      <span className="ambient-orb orb-a" /><span className="ambient-orb orb-b" />
      <span className="ambient-grid" /><span className="ambient-noise" />
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`brand ${compact ? 'brand-compact' : ''}`}>
      <div className="brand-mark"><span>V</span></div>
      <div><strong>VANTA ARCANA</strong><small>COLLECT · BUILD · DUEL</small></div>
    </div>
  );
}

function AuthScreen({
  signIn,
  signUp,
  setFlash,
}: {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<boolean>;
  setFlash: (message: string, type?: 'notice' | 'error') => void;
}) {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [working, setWorking] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || password.length < 6 || (tab === 'signup' && !displayName.trim())) {
      setFlash('이메일, 6자 이상 비밀번호와 플레이어 이름을 확인해 주세요.', 'error');
      return;
    }
    setWorking(true);
    try {
      if (tab === 'login') {
        await signIn(email, password);
      } else {
        const signedIn = await signUp(email, password, displayName);
        if (!signedIn) setFlash('가입 확인 메일을 보냈습니다. 메일 인증 후 로그인해 주세요.');
      }
    } catch (authError) {
      setFlash(authError instanceof Error ? authError.message : '계정 요청에 실패했습니다.', 'error');
    } finally { setWorking(false); }
  };

  return (
    <div className="auth-shell">
      <section className="auth-visual">
        <Brand />
        <div className="auth-hero-copy">
          <small>ONLINE COLLECTIBLE CARD BATTLE</small>
          <h1>카드를 모으고.<br />덱을 설계하고.<br /><em>결투에서 증명한다.</em></h1>
          <p>가입 즉시 기본 덱과 300 AP가 지급됩니다. 승리 포인트로 팩을 열고 나만의 전략을 완성하세요.</p>
          <div className="auth-feature-row"><span>기본 덱 무료</span><span>42종 카드</span><span>실시간 1대1</span></div>
        </div>
        <div className="auth-card-showcase"><CardBack className="show-card one" /><CardBack className="show-card two" /><CardBack className="show-card three" /></div>
      </section>
      <section className="auth-panel panel-surface">
        <div className="auth-tabs">
          <button className={tab === 'login' ? 'active' : ''} onClick={() => setTab('login')}>로그인</button>
          <button className={tab === 'signup' ? 'active' : ''} onClick={() => setTab('signup')}>회원가입</button>
        </div>
        <div className="auth-panel-title"><small>VANTA ID</small><h2>{tab === 'login' ? '다시 결투장으로' : '새 듀얼리스트 등록'}</h2></div>
        <form className="auth-form" onSubmit={submit}>
          {tab === 'signup' && <label>플레이어 이름<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={16} placeholder="게임에 표시될 이름" /></label>}
          <label>이메일<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="email" /></label>
          <label>비밀번호<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="6자 이상" minLength={6} autoComplete={tab === 'login' ? 'current-password' : 'new-password'} /></label>
          <button className="primary-button large" type="submit" disabled={working}>{working ? '처리 중…' : tab === 'login' ? '로그인' : '기본 덱 받고 시작'}</button>
        </form>
        <p className="auth-footnote">계정의 덱·보유 카드·AP는 Supabase 계정에 저장되어 다른 기기에서도 이어집니다.</p>
      </section>
    </div>
  );
}

const HUB_NAV: Array<{ id: AccountSection; label: string; sub: string; icon: string }> = [
  { id: 'home', label: '홈', sub: 'COMMAND', icon: '◆' },
  { id: 'battle', label: '대전하기', sub: 'DUEL', icon: '⚔' },
  { id: 'decks', label: '덱 구성', sub: 'DECKS', icon: '▤' },
  { id: 'shop', label: '상점', sub: 'SHOP', icon: '◇' },
  { id: 'collection', label: '보관함', sub: 'ARCHIVE', icon: '▦' },
  { id: 'friends', label: '친구', sub: 'SOCIAL', icon: '♟' },
  { id: 'profile', label: '프로필', sub: 'PROFILE', icon: '●' },
];

const PROFILE_TITLES = ['신입 듀얼리스트', '전술 연구가', '덱 아키텍트', '아르카나 수집가', '연승의 도전자', '그랜드 마스터'];
const AVATAR_OPTIONS = [
  { id: 'violet', label: '보랏빛 균열' },
  { id: 'ember', label: '잿불 문장' },
  { id: 'tide', label: '해류 문장' },
  { id: 'grove', label: '수림 문장' },
  { id: 'crown', label: '왕관 문장' },
  { id: 'void', label: '공허 문장' },
];

function PlayerAvatar({ profile, large = false }: { profile: Pick<ProfileRow, 'display_name' | 'avatar_id'> | { display_name: string; avatar_id: string }; large?: boolean }) {
  return <div className={`player-avatar avatar-${profile.avatar_id || 'violet'} ${large ? 'large' : ''}`}><span>{profile.display_name.slice(0, 1).toUpperCase()}</span></div>;
}

function AccountShell({
  account,
  social,
  section,
  setSection,
  signOut,
  openRules,
  chatOpen,
  setChatOpen,
  chatUnread,
  messages,
  chatBody,
  setChatBody,
  sendMessage,
  children,
}: {
  account: AccountView;
  social: SocialView | null;
  section: AccountSection;
  setSection: (section: AccountSection) => void;
  signOut: () => void;
  openRules: () => void;
  chatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  chatUnread: number;
  messages: ChatMessage[];
  chatBody: string;
  setChatBody: (value: string) => void;
  sendMessage: (event: FormEvent) => void;
  children: ReactNode;
}) {
  const current = HUB_NAV.find((item) => item.id === section) ?? HUB_NAV[0];
  const requestCount = social?.incoming.length ?? 0;
  return (
    <div className={`command-shell ${chatOpen ? 'chat-visible' : ''}`}>
      <aside className="command-sidebar">
        <div className="sidebar-brand"><Brand compact /></div>
        <nav className="command-nav" aria-label="주 메뉴">
          {HUB_NAV.map((item) => (
            <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => setSection(item.id)}>
              <span className="nav-glyph">{item.icon}</span>
              <span><strong>{item.label}</strong><small>{item.sub}</small></span>
              {item.id === 'friends' && requestCount > 0 && <b className="nav-badge">{requestCount}</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-player-card">
          <PlayerAvatar profile={account.profile} />
          <div><small>LV.{account.profile.level}</small><strong>{account.profile.display_name}</strong><span>{account.profile.title}</span></div>
          <button aria-label="프로필 열기" onClick={() => setSection('profile')}>›</button>
        </div>
        <div className="sidebar-utility"><button onClick={openRules}>게임 규칙</button><button onClick={signOut}>로그아웃</button></div>
      </aside>

      <section className="command-main">
        <header className="command-topbar">
          <div className="topbar-context"><small>{current.sub}</small><strong>{current.label}</strong></div>
          <div className="topbar-actions">
            <div className="status-pill level"><span>LV</span><b>{account.profile.level}</b></div>
            <div className="status-pill ap"><span>AP</span><b>{account.profile.points.toLocaleString()}</b></div>
            <button className={`chat-toggle ${chatOpen ? 'active' : ''}`} onClick={() => setChatOpen(!chatOpen)}>
              <span>CHAT</span><strong>{chatOpen ? '닫기' : '전체 채팅'}</strong>{chatUnread > 0 && <b>{chatUnread}</b>}
            </button>
            <button className="top-profile" onClick={() => setSection('profile')}><PlayerAvatar profile={account.profile} /><span><small>{account.profile.friend_code}</small><strong>{account.profile.display_name}</strong></span></button>
          </div>
        </header>
        <div className="command-content">{children}</div>
      </section>

      <GlobalChatDrawer open={chatOpen} close={() => setChatOpen(false)} messages={messages} chatBody={chatBody} setChatBody={setChatBody} sendMessage={sendMessage} myUserId={account.profile.id} />
      {!chatOpen && <button className="chat-fab" onClick={() => setChatOpen(true)}><span>◌</span><strong>전체 채팅</strong>{chatUnread > 0 && <b>{chatUnread}</b>}</button>}

      <nav className="mobile-command-nav" aria-label="모바일 주 메뉴">
        {HUB_NAV.filter((item) => ['home', 'battle', 'decks', 'shop', 'friends'].includes(item.id)).map((item) => (
          <button key={item.id} className={section === item.id ? 'active' : ''} onClick={() => setSection(item.id)}><span>{item.icon}</span><small>{item.label}</small>{item.id === 'friends' && requestCount > 0 && <b>{requestCount}</b>}</button>
        ))}
      </nav>
    </div>
  );
}

function GlobalChatDrawer({
  open,
  close,
  messages,
  chatBody,
  setChatBody,
  sendMessage,
  myUserId,
}: {
  open: boolean;
  close: () => void;
  messages: ChatMessage[];
  chatBody: string;
  setChatBody: (value: string) => void;
  sendMessage: (event: FormEvent) => void;
  myUserId: string;
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (open) listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);
  return (
    <aside className={`global-chat-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
      <header><div><span className="online-pulse" /><strong>전체 채팅</strong><small>접속한 듀얼리스트와 대화합니다</small></div><button onClick={close} aria-label="채팅 닫기">×</button></header>
      <div className="global-chat-rules"><span>링크·도배 금지</span><span>메시지 최대 180자</span></div>
      <div className="global-chat-list" ref={listRef}>
        {messages.length === 0 && <div className="chat-empty"><b>아직 대화가 없습니다.</b><span>첫 메시지를 남겨보세요.</span></div>}
        {messages.map((message) => (
          <article key={message.id} className={message.user_id === myUserId ? 'mine' : ''}>
            <div><strong>{message.user_name}</strong><time>{shortTime(message.created_at)}</time></div><p>{message.body}</p>
          </article>
        ))}
      </div>
      <form className="global-chat-form" onSubmit={sendMessage}><input value={chatBody} onChange={(event) => setChatBody(event.target.value)} maxLength={180} placeholder="메시지 입력" /><button type="submit" disabled={!chatBody.trim()}>전송</button></form>
    </aside>
  );
}

function HomeHubScreen({
  account,
  social,
  goBattle,
  goDecks,
  goShop,
  goFriends,
  goProfile,
}: {
  account: AccountView;
  social: SocialView | null;
  goBattle: () => void;
  goDecks: () => void;
  goShop: () => void;
  goFriends: () => void;
  goProfile: () => void;
}) {
  const activeDeck = account.decks.find((deck) => deck.is_active) ?? account.decks[0];
  const ownedTotal = account.collection.reduce((sum, row) => sum + row.quantity, 0);
  const onlineFriends = social?.friends.filter((friend) => friend.online) ?? [];
  const levelBase = Math.pow(Math.max(0, account.profile.level - 1), 2) * 150;
  const nextLevel = Math.pow(account.profile.level, 2) * 150;
  const levelProgress = Math.max(0, Math.min(100, ((account.profile.xp - levelBase) / Math.max(1, nextLevel - levelBase)) * 100));
  return (
    <div className="home-hub-page">
      <section className="home-hero-card">
        <div className="hero-sigil"><span>V</span><i /></div>
        <div className="hero-copy"><div className="season-kicker"><span>SEASON 01</span><b>균열의 개막</b></div><h1>덱을 완성하고<br /><em>결투의 흐름을 지배하세요.</em></h1><p>24장의 선택이 한 판의 전술이 됩니다. 공개 매칭에서 실력을 증명하거나 친구와 방 코드를 공유해 대전하세요.</p><div className="hero-actions"><button className="hero-play" onClick={goBattle}><span>대전하기</span><b>PLAY NOW</b></button><button className="hero-secondary" onClick={goDecks}>활성 덱 확인</button></div></div>
        <div className="hero-deck-preview"><CardBack className="hero-card-back rear" /><CardBack className="hero-card-back front" /><div className="deck-ticket"><small>ACTIVE DECK</small><strong>{activeDeck?.name ?? '덱 없음'}</strong><span>{activeDeck?.cards.length ?? 0} / {DECK_SIZE} CARDS</span></div></div>
      </section>

      <section className="home-quick-grid">
        <button className="quick-module battle" onClick={goBattle}><span className="module-icon">⚔</span><div><small>ONLINE DUEL</small><strong>대전하기</strong><p>공개 매칭과 비공개 방을 선택합니다.</p></div><b>→</b></button>
        <button className="quick-module shop" onClick={goShop}><span className="module-icon">◇</span><div><small>FEATURED PACK</small><strong>불사조의 귀환</strong><p>픽업 팩 · 영웅 이상 천장 적용</p></div><b>→</b></button>
        <button className="quick-module social" onClick={goFriends}><span className="module-icon">♟</span><div><small>SOCIAL</small><strong>{onlineFriends.length}명 온라인</strong><p>{social?.incoming.length ? `받은 요청 ${social.incoming.length}개` : '친구를 추가하고 함께 결투하세요.'}</p></div><b>→</b></button>
      </section>

      <section className="home-dashboard-grid">
        <article className="commander-card panel-surface"><div className="commander-head"><PlayerAvatar profile={account.profile} large /><div><small>{account.profile.title}</small><h2>{account.profile.display_name}</h2><span>{account.profile.friend_code}</span></div><button onClick={goProfile}>프로필 편집</button></div><div className="level-track"><div><span>LEVEL {account.profile.level}</span><b>{account.profile.xp.toLocaleString()} XP</b></div><i><span style={{ width: `${levelProgress}%` }} /></i><small>다음 레벨까지 {Math.max(0, nextLevel - account.profile.xp).toLocaleString()} XP</small></div><div className="commander-stats"><span><small>전적</small><b>{account.profile.wins}승 {account.profile.losses}패</b></span><span><small>승률</small><b>{account.profile.wins + account.profile.losses ? Math.round(account.profile.wins / (account.profile.wins + account.profile.losses) * 100) : 0}%</b></span><span><small>보유 카드</small><b>{ownedTotal}장</b></span></div></article>
        <article className="collection-progress-card panel-surface"><header><div><small>COLLECTION</small><h2>아르카나 보관함</h2></div><b>{account.collection.length}/{CARD_POOL.length}</b></header><div className="collection-ring" style={{ '--progress': `${Math.round(account.collection.length / CARD_POOL.length * 360)}deg` } as CSSProperties}><span><strong>{Math.round(account.collection.length / CARD_POOL.length * 100)}%</strong><small>DISCOVERED</small></span></div><button onClick={goShop}>새 카드 획득</button></article>
        <article className="online-friends-card panel-surface"><header><div><small>FRIENDS</small><h2>현재 접속 중</h2></div><button onClick={goFriends}>전체 보기</button></header><div className="online-friends-list">{onlineFriends.slice(0, 5).map((friend) => <div key={friend.id}><div className={`mini-avatar avatar-${friend.avatarId}`}>{friend.displayName.slice(0, 1)}</div><span><strong>{friend.displayName}</strong><small>LV.{friend.level} · {friend.title}</small></span><i /></div>)}{onlineFriends.length === 0 && <p>접속 중인 친구가 없습니다.<br />친구 코드로 새로운 듀얼리스트를 추가하세요.</p>}</div></article>
      </section>
    </div>
  );
}

function BattleHubScreen({
  account,
  joinCode,
  setJoinCode,
  mode,
  setMode,
  createRoom,
  joinRoom,
  busy,
  matchmaking,
  startMatchmaking,
  cancelMatchmaking,
  goDecks,
}: {
  account: AccountView;
  joinCode: string;
  setJoinCode: (value: string) => void;
  mode: 'quick' | 'grand';
  setMode: (value: 'quick' | 'grand') => void;
  createRoom: () => void;
  joinRoom: () => void;
  busy: boolean;
  matchmaking: { active: boolean; mode: 'quick' | 'grand'; waiters: number };
  startMatchmaking: (mode: 'quick' | 'grand') => void;
  cancelMatchmaking: () => void;
  goDecks: () => void;
}) {
  const activeDeck = account.decks.find((deck) => deck.is_active) ?? account.decks[0];
  return (
    <div className="battle-hub-page">
      <header className="hub-page-title"><div><small>DUEL COMMAND</small><h1>대전하기</h1><p>공개 매칭 또는 방 코드 대전을 선택하세요.</p></div><button className="active-deck-summary" onClick={goDecks}><span>사용 덱</span><strong>{activeDeck?.name ?? '활성 덱 없음'}</strong><b>{activeDeck?.cards.length ?? 0}/{DECK_SIZE}</b></button></header>
      <div className="battle-mode-selector">
        <button className={mode === 'quick' ? 'active' : ''} onClick={() => setMode('quick')}><span>QUICK</span><strong>속전 결투</strong><small>코어 25 · 승리 180 AP</small></button>
        <button className={mode === 'grand' ? 'active' : ''} onClick={() => setMode('grand')}><span>GRAND</span><strong>대결전</strong><small>코어 40 · 승리 450 AP</small></button>
      </div>
      <section className="battle-choice-grid">
        <article className="matchmaking-card panel-surface"><div className="choice-art"><span>⚔</span><i /></div><small>PUBLIC MATCH</small><h2>공개 매칭</h2><p>같은 모드를 선택한 온라인 플레이어를 자동으로 찾아 대기실을 만듭니다.</p><ul><li>활성 덱 자동 적용</li><li>서버 판정 실시간 1대1</li><li>승패 AP·XP 지급</li></ul>{matchmaking.active ? <div className="match-searching"><div className="search-radar"><i /><i /><span>V</span></div><strong>상대를 찾는 중…</strong><small>현재 대기 인원 {matchmaking.waiters}명</small><button onClick={cancelMatchmaking}>매칭 취소</button></div> : <button className="primary-button large" onClick={() => startMatchmaking(mode)} disabled={!activeDeck}>매칭 시작</button>}</article>
        <article className="custom-duel-card panel-surface"><div className="choice-art private"><span>⌁</span><i /></div><small>CUSTOM DUEL</small><h2>친구 대전</h2><p>비공개 결투방을 만들고 6자리 코드를 친구에게 전달하세요.</p><button className="secondary-button large full" onClick={createRoom} disabled={busy || !activeDeck}>{busy ? '방 생성 중…' : '새 방 만들기'}</button><div className="custom-divider"><span>방 코드로 참가</span></div><div className="join-room-console"><input value={joinCode} onChange={(event) => setJoinCode(event.target.value.toUpperCase())} maxLength={6} placeholder="ROOM CODE" onKeyDown={(event) => { if (event.key === 'Enter') joinRoom(); }} /><button onClick={joinRoom} disabled={busy}>입장</button></div></article>
      </section>
      <section className="battle-notice panel-surface"><span>!</span><div><strong>공정한 대전을 위해 모든 카드 사용과 보상은 Render 서버에서 판정됩니다.</strong><p>브라우저에서 AP·보유 카드·승패 결과를 직접 수정할 수 없도록 구성되어 있습니다.</p></div></section>
    </div>
  );
}

function FriendsScreen({
  account,
  social,
  busy,
  searchPlayer,
  sendRequest,
  respond,
  cancelRequest,
  removeFriend,
}: {
  account: AccountView;
  social: SocialView | null;
  busy: boolean;
  searchPlayer: (friendCode: string) => Promise<PublicProfile>;
  sendRequest: (friendCode: string) => void;
  respond: (requestId: string, decision: 'accept' | 'decline') => void;
  cancelRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
}) {
  const [code, setCode] = useState('');
  const [result, setResult] = useState<PublicProfile | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const runSearch = async (event: FormEvent) => {
    event.preventDefault();
    setSearching(true); setSearchError(''); setResult(null);
    try { setResult(await searchPlayer(code)); }
    catch (error) { setSearchError(error instanceof Error ? error.message : '검색 실패'); }
    finally { setSearching(false); }
  };
  const copyCode = () => void copyText(account.profile.friend_code);
  return (
    <div className="friends-page">
      <header className="hub-page-title"><div><small>SOCIAL NETWORK</small><h1>친구</h1><p>고유 친구 코드로 플레이어를 추가하고 접속 상태를 확인하세요.</p></div><button className="my-friend-code" onClick={copyCode}><span>내 친구 코드</span><strong>{account.profile.friend_code}</strong><small>눌러서 복사</small></button></header>
      <section className="friend-search-panel panel-surface"><div><small>ADD DUELIST</small><h2>친구 코드로 추가</h2><p>상대 프로필의 VA- 코드 전체를 입력하세요.</p></div><form onSubmit={runSearch}><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="VA-XXXXXXXXXX" maxLength={13} /><button disabled={searching || !code.trim()}>{searching ? '검색 중…' : '검색'}</button></form>{searchError && <p className="inline-error">{searchError}</p>}{result && <div className="friend-search-result"><div className={`mini-avatar avatar-${result.avatarId}`}>{result.displayName.slice(0, 1)}</div><div><strong>{result.displayName}</strong><span>LV.{result.level} · {result.title}</span><small>{result.friendCode}</small></div><button onClick={() => sendRequest(result.friendCode)} disabled={busy}>친구 요청</button></div>}</section>
      <div className="social-columns">
        <section className="social-list-panel panel-surface"><header><div><small>FRIEND LIST</small><h2>친구 {social?.friends.length ?? 0}명</h2></div><span>{social?.friends.filter((friend) => friend.online).length ?? 0} ONLINE</span></header><div className="friend-list">{social?.friends.map((friend) => <article key={friend.id}><div className={`mini-avatar avatar-${friend.avatarId}`}>{friend.displayName.slice(0, 1)}{friend.online && <i />}</div><div><strong>{friend.displayName}</strong><span>LV.{friend.level} · {friend.title}</span><small>{friend.online ? '현재 접속 중' : `마지막 접속 ${new Date(friend.lastSeen).toLocaleDateString('ko-KR')}`}</small></div><button onClick={() => { if (window.confirm(`${friend.displayName} 님을 친구 목록에서 삭제하시겠습니까?`)) removeFriend(friend.id); }} disabled={busy}>삭제</button></article>)}{!social?.friends.length && <div className="social-empty">아직 친구가 없습니다.<br />위에서 친구 코드를 검색해 추가하세요.</div>}</div></section>
        <section className="request-panel panel-surface"><header><div><small>REQUESTS</small><h2>친구 요청</h2></div>{Boolean(social?.incoming.length) && <b>{social?.incoming.length}</b>}</header><div className="request-group"><h3>받은 요청</h3>{social?.incoming.map((request) => <article key={request.id}><div className={`mini-avatar avatar-${request.profile.avatarId}`}>{request.profile.displayName.slice(0, 1)}</div><div><strong>{request.profile.displayName}</strong><small>{request.profile.friendCode}</small></div><span><button onClick={() => respond(request.id, 'accept')} disabled={busy}>수락</button><button onClick={() => respond(request.id, 'decline')} disabled={busy}>거절</button></span></article>)}{!social?.incoming.length && <p>받은 요청이 없습니다.</p>}</div><div className="request-group outgoing"><h3>보낸 요청</h3>{social?.outgoing.map((request) => <article key={request.id}><div className={`mini-avatar avatar-${request.profile.avatarId}`}>{request.profile.displayName.slice(0, 1)}</div><div><strong>{request.profile.displayName}</strong><small>응답 대기 중</small></div><button onClick={() => cancelRequest(request.id)} disabled={busy}>취소</button></article>)}{!social?.outgoing.length && <p>보낸 요청이 없습니다.</p>}</div></section>
      </div>
    </div>
  );
}

function ProfileScreen({ account, busy, updateProfile }: { account: AccountView; busy: boolean; updateProfile: (values: { displayName: string; bio: string; title: string; avatarId: string }) => void }) {
  const [displayName, setDisplayName] = useState(account.profile.display_name);
  const [bio, setBio] = useState(account.profile.bio);
  const [title, setTitle] = useState(account.profile.title);
  const [avatarId, setAvatarId] = useState(account.profile.avatar_id);
  useEffect(() => { setDisplayName(account.profile.display_name); setBio(account.profile.bio); setTitle(account.profile.title); setAvatarId(account.profile.avatar_id); }, [account.profile]);
  const total = account.profile.wins + account.profile.losses;
  const copyCode = () => void copyText(account.profile.friend_code);
  return (
    <div className="profile-page">
      <header className="profile-hero panel-surface"><div className="profile-hero-glow" /><PlayerAvatar profile={{ display_name: displayName || account.profile.display_name, avatar_id: avatarId }} large /><div><small>{title}</small><h1>{displayName || account.profile.display_name}</h1><button onClick={copyCode}>{account.profile.friend_code} · 복사</button></div><div className="profile-level-badge"><span>LEVEL</span><strong>{account.profile.level}</strong><small>{account.profile.xp.toLocaleString()} XP</small></div></header>
      <div className="profile-layout"><section className="profile-editor panel-surface"><header><small>IDENTITY SETTINGS</small><h2>프로필 편집</h2></header><label>플레이어 이름<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={16} /></label><label>상태 메시지<textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={100} placeholder="나를 소개하는 짧은 문장" /></label><label>대표 칭호<select value={title} onChange={(event) => setTitle(event.target.value)}>{PROFILE_TITLES.map((item) => <option key={item}>{item}</option>)}</select></label><div className="avatar-picker"><span>프로필 문양</span><div>{AVATAR_OPTIONS.map((avatar) => <button key={avatar.id} className={avatarId === avatar.id ? 'active' : ''} onClick={() => setAvatarId(avatar.id)}><div className={`mini-avatar avatar-${avatar.id}`}>{displayName.slice(0, 1).toUpperCase() || 'V'}</div><small>{avatar.label}</small></button>)}</div></div><button className="primary-button large full" onClick={() => updateProfile({ displayName, bio, title, avatarId })} disabled={busy || displayName.trim().length < 2}>{busy ? '저장 중…' : '변경사항 저장'}</button></section><aside className="profile-stat-panel panel-surface"><header><small>CAREER</small><h2>결투 기록</h2></header><div className="career-stat-grid"><article><small>승리</small><strong>{account.profile.wins}</strong></article><article><small>패배</small><strong>{account.profile.losses}</strong></article><article><small>승률</small><strong>{total ? Math.round(account.profile.wins / total * 100) : 0}%</strong></article><article><small>보유 AP</small><strong>{account.profile.points.toLocaleString()}</strong></article></div><div className="profile-account-info"><span><small>가입일</small><b>{new Date(account.profile.created_at).toLocaleDateString('ko-KR')}</b></span><span><small>카드 발견</small><b>{account.collection.length}/{CARD_POOL.length}</b></span><span><small>저장 덱</small><b>{account.decks.length}/5</b></span></div><p>친구 코드는 계정마다 고유하며 이메일 주소를 공개하지 않고 친구를 추가할 때 사용합니다.</p></aside></div>
    </div>
  );
}

function DeckBuilderScreen({
  account,
  busy,
  saveDeck,
  setActiveDeck,
  deleteDeck,
}: {
  account: AccountView;
  busy: boolean;
  saveDeck: (deckId: string | null, name: string, cards: string[]) => Promise<AccountView>;
  setActiveDeck: (deckId: string) => void;
  deleteDeck: (deckId: string) => void;
}) {
  const initial = account.decks.find((deck) => deck.is_active) ?? account.decks[0];
  const [selectedId, setSelectedId] = useState(initial?.id ?? '__new__');
  const [draftName, setDraftName] = useState(initial?.name ?? '새 덱');
  const [draftCards, setDraftCards] = useState<string[]>(initial?.cards ?? []);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | CardType>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | CardRarity>('all');
  const [saving, setSaving] = useState(false);

  const owned = useMemo(() => new Map(account.collection.map((row) => [row.card_id, row.quantity])), [account.collection]);
  const draftCounts = useMemo(() => {
    const map = new Map<string, number>();
    draftCards.forEach((id) => map.set(id, (map.get(id) ?? 0) + 1));
    return map;
  }, [draftCards]);

  const typeCounts = useMemo(() => ({
    unit: draftCards.filter((id) => CARD_MAP.get(id)?.type === 'unit').length,
    spell: draftCards.filter((id) => CARD_MAP.get(id)?.type === 'spell').length,
    trap: draftCards.filter((id) => CARD_MAP.get(id)?.type === 'trap').length,
  }), [draftCards]);

  const filteredCards = useMemo(() => CARD_POOL.filter((card) => {
    const text = `${card.name} ${card.text}`.toLowerCase();
    return (owned.get(card.id) ?? 0) > 0 &&
      (typeFilter === 'all' || card.type === typeFilter) &&
      (rarityFilter === 'all' || card.rarity === rarityFilter) &&
      (!search.trim() || text.includes(search.trim().toLowerCase()));
  }).sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name, 'ko')), [owned, rarityFilter, search, typeFilter]);

  useEffect(() => {
    if (selectedId === '__new__') return;
    const selected = account.decks.find((deck) => deck.id === selectedId);
    if (!selected) {
      const fallback = account.decks.find((deck) => deck.is_active) ?? account.decks[0];
      if (fallback) setSelectedId(fallback.id);
      return;
    }
    setDraftName(selected.name);
    setDraftCards(selected.cards);
  }, [account.decks, selectedId]);

  const selectDeck = (deck: DeckRow) => { setSelectedId(deck.id); setDraftName(deck.name); setDraftCards(deck.cards); };
  const startNew = () => {
    const base = account.decks.find((deck) => deck.is_active) ?? account.decks[0];
    setSelectedId('__new__');
    setDraftName(`새 덱 ${account.decks.length + 1}`);
    setDraftCards(base ? [...base.cards] : []);
  };
  const addCard = (card: ArcanaCard) => {
    const current = draftCounts.get(card.id) ?? 0;
    const max = Math.min(owned.get(card.id) ?? 0, COPY_LIMIT_BY_RARITY[card.rarity]);
    if (draftCards.length >= DECK_SIZE || current >= max) return;
    setDraftCards((prev) => [...prev, card.id]);
  };
  const removeCard = (cardId: string) => {
    const index = draftCards.lastIndexOf(cardId);
    if (index < 0) return;
    setDraftCards((prev) => prev.filter((_, cardIndex) => cardIndex !== index));
  };
  const valid = draftCards.length === DECK_SIZE && typeCounts.unit >= account.deckRules.minUnits && typeCounts.spell <= account.deckRules.maxSpells && typeCounts.trap <= account.deckRules.maxTraps;
  const save = async () => {
    setSaving(true);
    try {
      const next = await saveDeck(selectedId === '__new__' ? null : selectedId, draftName, draftCards);
      if (selectedId === '__new__') {
        const created = next.decks.find((deck) => deck.name === draftName) ?? next.decks[0];
        if (created) setSelectedId(created.id);
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="deck-page">
      <aside className="deck-sidebar panel-surface">
        <div className="page-heading"><small>DECK GARAGE</small><h1>내 덱</h1><p>최대 5개의 덱을 저장할 수 있습니다.</p></div>
        <div className="deck-list">
          {account.decks.map((deck) => (
            <button key={deck.id} className={`deck-list-item ${selectedId === deck.id ? 'selected' : ''}`} onClick={() => selectDeck(deck)}>
              <span className="deck-icon">V</span><div><strong>{deck.name}</strong><small>{deck.cards.length}장 {deck.is_active ? '· ACTIVE' : ''}</small></div>{deck.is_active && <i>✓</i>}
            </button>
          ))}
        </div>
        <button className="secondary-button full" onClick={startNew} disabled={account.decks.length >= 5}>＋ 새 덱 만들기</button>
        <div className="deck-rule-box"><strong>구성 규칙</strong><span>정확히 24장</span><span>유닛 최소 10장</span><span>주문 최대 8장</span><span>함정 최대 6장</span></div>
      </aside>

      <section className="deck-workbench panel-surface">
        <div className="deck-workbench-head">
          <div><small>EDITING DECK</small><input value={draftName} onChange={(event) => setDraftName(event.target.value)} maxLength={20} /></div>
          <div className={`deck-count-orb ${valid ? 'valid' : ''}`}><b>{draftCards.length}</b><span>/ {DECK_SIZE}</span></div>
          <div className="deck-actions">
            {selectedId !== '__new__' && !account.decks.find((deck) => deck.id === selectedId)?.is_active && <button className="secondary-button" onClick={() => setActiveDeck(selectedId)} disabled={busy}>활성 덱으로</button>}
            {selectedId !== '__new__' && !account.decks.find((deck) => deck.id === selectedId)?.is_active && <button className="danger-outline" onClick={() => deleteDeck(selectedId)} disabled={busy}>삭제</button>}
            <button className="primary-button" onClick={() => void save()} disabled={!valid || saving || busy}>{saving ? '저장 중…' : '덱 저장'}</button>
          </div>
        </div>
        <div className="deck-type-meter"><span>유닛 <b>{typeCounts.unit}</b></span><span>주문 <b>{typeCounts.spell}</b></span><span>함정 <b>{typeCounts.trap}</b></span><em>{valid ? '사용 가능한 덱' : '구성 조건을 맞춰주세요'}</em></div>
        <div className="deck-card-list">
          {Array.from(draftCounts.entries()).map(([cardId, count]) => {
            const card = CARD_MAP.get(cardId); if (!card) return null;
            return <button key={cardId} className={`deck-entry rarity-${card.rarity}`} onClick={() => removeCard(cardId)}><span className="mini-cost">{card.cost}</span><div><strong>{card.name}</strong><small>{TYPE_LABEL[card.type]} · {RARITY_LABEL[card.rarity]}</small></div><b>×{count}</b><i>−</i></button>;
          })}
          {draftCards.length === 0 && <div className="empty-deck-list">아래 보유 카드에서 카드를 추가하세요.</div>}
        </div>
      </section>

      <aside className="collection-browser panel-surface">
        <div className="collection-browser-head"><div><small>OWNED CARDS</small><strong>보유 카드</strong></div><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="카드 검색" /></div>
        <div className="filter-row">
          {(['all', 'unit', 'spell', 'trap'] as const).map((type) => <button key={type} className={typeFilter === type ? 'active' : ''} onClick={() => setTypeFilter(type)}>{type === 'all' ? '전체' : TYPE_LABEL[type]}</button>)}
        </div>
        <div className="filter-row rarity-filter">
          {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map((rarity) => <button key={rarity} className={rarityFilter === rarity ? 'active' : ''} onClick={() => setRarityFilter(rarity)}>{rarity === 'all' ? '모든 등급' : RARITY_LABEL[rarity]}</button>)}
        </div>
        <div className="builder-card-grid">
          {filteredCards.map((card) => {
            const used = draftCounts.get(card.id) ?? 0;
            const ownedCount = owned.get(card.id) ?? 0;
            const limit = Math.min(ownedCount, COPY_LIMIT_BY_RARITY[card.rarity]);
            const disabled = draftCards.length >= DECK_SIZE || used >= limit;
            return <button key={card.id} className={`builder-card rarity-${card.rarity}`} onClick={() => addCard(card)} disabled={disabled}><div><span>{card.cost}</span><b>{card.icon}</b></div><strong>{card.name}</strong><small>{TYPE_LABEL[card.type]} · {RARITY_LABEL[card.rarity]}</small><em>{used}/{limit} 사용 · {ownedCount}장 보유</em></button>;
          })}
        </div>
      </aside>
    </div>
  );
}

function ShopScreen({ account, busy, openPack }: { account: AccountView; busy: boolean; openPack: (id: PackId) => void }) {
  return (
    <div className="shop-page">
      <header className="page-banner"><div><small>ARCANA SHOP</small><h1>카드팩 상점</h1><p>결투에서 얻은 AP로 카드를 획득하세요. 모든 팩은 5장입니다.</p></div><div className="large-ap-balance"><span>AVAILABLE AP</span><b>{account.profile.points.toLocaleString()}</b></div></header>
      <div className="pack-grid">
        {account.packs.map((pack) => (
          <article className={`pack-product pack-${pack.accent}`} key={pack.id}>
            <div className="pack-foil"><span className="pack-symbol">V</span><small>{pack.subtitle}</small><strong>{pack.name}</strong><i>5 CARDS</i></div>
            <div className="pack-info"><span className="pack-guarantee">{pack.guarantee}</span><p>{pack.description}</p>{pack.id === 'pickup' && <div className="pity-meter"><span style={{ width: `${Math.min(100, account.profile.pickup_pity * 10)}%` }} /><b>{Math.max(1, 10 - account.profile.pickup_pity)}팩 이내 영웅+</b></div>}<button className="buy-pack-button" disabled={busy || account.profile.points < pack.price} onClick={() => openPack(pack.id)}><span>{pack.price.toLocaleString()} AP</span><b>{account.profile.points < pack.price ? '포인트 부족' : '팩 개봉'}</b></button></div>
          </article>
        ))}
      </div>
      <section className="shop-note panel-surface"><strong>등급별 덱 제한</strong><span>일반 최대 3장</span><span>희귀 최대 2장</span><span>영웅 최대 2장</span><span>전설 최대 1장</span></section>
    </div>
  );
}

function CollectionScreen({ account }: { account: AccountView }) {
  const [search, setSearch] = useState('');
  const [rarity, setRarity] = useState<'all' | CardRarity>('all');
  const owned = useMemo(() => new Map(account.collection.map((row) => [row.card_id, row.quantity])), [account.collection]);
  const cards = CARD_POOL.filter((card) => (rarity === 'all' || card.rarity === rarity) && (!search.trim() || `${card.name} ${card.text}`.toLowerCase().includes(search.toLowerCase())));
  return (
    <div className="collection-page">
      <header className="page-banner"><div><small>ARCANA ARCHIVE</small><h1>카드 보관함</h1><p>{account.collection.length} / {CARD_POOL.length}종을 발견했습니다.</p></div><div className="collection-controls"><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="카드 이름 또는 효과 검색" /><select value={rarity} onChange={(event) => setRarity(event.target.value as 'all' | CardRarity)}><option value="all">모든 등급</option><option value="common">일반</option><option value="rare">희귀</option><option value="epic">영웅</option><option value="legendary">전설</option></select></div></header>
      <div className="archive-grid">
        {cards.map((card) => {
          const quantity = owned.get(card.id) ?? 0;
          return <article className={`archive-card ${quantity ? '' : 'locked'}`} key={card.id}><CardFace card={card} size="detail" /><div className="archive-count"><span>{quantity ? `${quantity}장 보유` : '미획득'}</span><b>덱 최대 {COPY_LIMIT_BY_RARITY[card.rarity]}장</b></div></article>;
        })}
      </div>
    </div>
  );
}

function PackOpeningModal({ opening, close }: { opening: PackOpening; close: () => void }) {
  const [revealed, setRevealed] = useState<boolean[]>(() => opening.cardIds.map(() => false));
  const reveal = (index: number) => setRevealed((prev) => prev.map((value, cardIndex) => cardIndex === index ? true : value));
  const revealAll = () => setRevealed(opening.cardIds.map(() => true));
  const allRevealed = revealed.every(Boolean);
  return (
    <div className="pack-modal-backdrop">
      <section className={`pack-opening-stage pack-${opening.pack.accent}`}>
        <div className="pack-opening-title"><small>{opening.pack.subtitle}</small><h2>{opening.pack.name}</h2><p>카드를 눌러 한 장씩 공개하세요.</p></div>
        <div className="opened-card-row">
          {opening.cardIds.map((cardId, index) => {
            const card = CARD_MAP.get(cardId); if (!card) return null;
            return <button className={`reveal-card ${revealed[index] ? 'revealed' : ''}`} key={`${cardId}-${index}`} onClick={() => reveal(index)}>{revealed[index] ? <CardFace card={card} size="detail" /> : <CardBack />}</button>;
          })}
        </div>
        <div className="pack-modal-actions">{!allRevealed && <button className="secondary-button" onClick={revealAll}>모두 공개</button>}<button className="primary-button" onClick={close} disabled={!allRevealed}>보관함에 저장</button></div>
      </section>
    </div>
  );
}


function LobbyScreen({
  view,
  busy,
  toggleReady,
  leaveToHome,
  messages,
  chatBody,
  setChatBody,
  sendMessage,
  openRules,
}: {
  view: DuelView;
  busy: boolean;
  toggleReady: () => void;
  leaveToHome: () => void;
  messages: ChatMessage[];
  chatBody: string;
  setChatBody: (value: string) => void;
  sendMessage: (event: FormEvent) => void;
  openRules: () => void;
}) {
  const copyCode = async () => {
    await navigator.clipboard.writeText(view.room.code).catch(() => undefined);
  };
  return (
    <div className="lobby-shell">
      <header className="lobby-topbar">
        <Brand compact />
        <div className="lobby-actions">
          <button className="ghost-button" onClick={openRules}>규칙</button>
          <button className="ghost-button" onClick={leaveToHome}>홈으로</button>
        </div>
      </header>

      <section className="lobby-layout">
        <div className="lobby-stage panel-surface">
          <div className="room-code-block">
            <small>DUEL ROOM</small>
            <button onClick={copyCode} title="코드 복사">
              <strong>{view.room.code}</strong>
              <span>코드 복사</span>
            </button>
          </div>

          <div className="lobby-title">
            <span>{view.room.mode === 'quick' ? 'QUICK DUEL' : 'GRAND DUEL'}</span>
            <h1>커스텀 덱 동기화 대기 중</h1>
            <p>두 플레이어가 준비하면 각자 선택한 24장 덱을 섞고 시작 손패 5장을 서버에서 지급합니다.</p>
          </div>

          <div className="versus-slots">
            {[0, 1].map((slot) => {
              const player = view.players[slot];
              return (
                <div className={`duelist-slot ${player?.ready ? 'ready' : ''}`} key={slot}>
                  <div className="duelist-emblem">{player ? player.user_name.slice(0, 1).toUpperCase() : '?'}</div>
                  <div>
                    <small>PLAYER {slot + 1}</small>
                    <strong>{player?.user_name ?? '상대 입장 대기 중'}</strong>
                    <span>{player ? (player.ready ? 'READY' : 'NOT READY') : 'EMPTY SLOT'}</span>
                  </div>
                  {player?.ready && <i>✓</i>}
                </div>
              );
            })}
            <div className="versus-mark">VS</div>
          </div>

          <div className="sealed-deck-preview">
            <div>
              <small>YOUR ACTIVE DECK</small>
              <strong>24</strong>
              <span>내가 구성한 24장 · 서버 셔플</span>
            </div>
            <div className="mini-card-stack" aria-hidden="true">
              <CardBack />
              <CardBack />
              <CardBack />
              <CardBack />
            </div>
            <div className="deck-rarity-strip">
              <span className="rarity-common">일반</span>
              <span className="rarity-rare">희귀</span>
              <span className="rarity-epic">영웅</span>
              <span className="rarity-legendary">전설</span>
            </div>
          </div>

          <button
            className={`ready-button ${view.me.ready ? 'is-ready' : ''}`}
            onClick={toggleReady}
            disabled={busy || view.players.length < 2}
          >
            <span>{view.players.length < 2 ? '상대를 기다리는 중' : view.me.ready ? '준비 취소' : '결투 준비 완료'}</span>
            <b>{view.me.ready ? 'READY' : 'ENTER'}</b>
          </button>
        </div>

        <ChatPanel
          title="방 채팅"
          subtitle="결투가 시작되기 전 전략을 숨기고 인사만 나누세요."
          messages={messages}
          chatBody={chatBody}
          setChatBody={setChatBody}
          sendMessage={sendMessage}
        />
      </section>
    </div>
  );
}


function DuelScreen({
  view,
  selectedCardUid,
  setSelectedCardUid,
  selectedHandCard,
  drawPulseUid,
  busy,
  isMyTurn,
  myState,
  opponentState,
  opponent,
  playSelected,
  onUnitClick,
  onCoreClick,
  attack,
  advancePhase,
  surrender,
  rematch,
  leaveToHome,
  chatOpen,
  setChatOpen,
  messages,
  chatBody,
  setChatBody,
  sendMessage,
  openRules,
}: {
  view: DuelView;
  selectedCardUid: string | null;
  setSelectedCardUid: (value: string | null) => void;
  selectedHandCard: HandCard | null;
  drawPulseUid: string | null;
  busy: boolean;
  isMyTurn: boolean;
  myState: PlayerPublicState | null;
  opponentState: PlayerPublicState | null;
  opponent: PlayerRow | null;
  playSelected: (options?: { lane?: number; target?: ApiTarget | null }) => Promise<void>;
  onUnitClick: (playerId: string, unit: BoardUnit) => void;
  onCoreClick: (playerId: string) => void;
  attack: (attackerId: string) => void;
  advancePhase: () => void;
  surrender: () => void;
  rematch: () => void;
  leaveToHome: () => void;
  chatOpen: boolean;
  setChatOpen: (value: boolean) => void;
  messages: ChatMessage[];
  chatBody: string;
  setChatBody: (value: string) => void;
  sendMessage: (event: FormEvent) => void;
  openRules: () => void;
}) {
  if (!myState || !opponentState || !opponent) {
    return <div className="loading-screen"><Brand /><p>결투 정보를 동기화하고 있습니다…</p></div>;
  }

  const state = view.room.state;
  const finished = view.room.status === 'finished';
  const winner = view.players.find((player) => player.id === state.winnerPlayerId) ?? null;
  const iWon = winner?.id === view.me.id;

  const immediatePlayable = selectedHandCard && (
    selectedHandCard.card.type === 'trap' ||
    (selectedHandCard.card.type === 'spell' && (selectedHandCard.card.target ?? 'none') === 'none')
  );

  return (
    <div className="duel-shell">
      <header className="duel-topbar">
        <Brand compact />
        <div className="turn-banner">
          <span>TURN {state.turnNo}</span>
          <strong>{isMyTurn ? '내 턴' : '상대 턴'}</strong>
          <i>{phaseLabel(state.phase)}</i>
        </div>
        <div className="duel-menu">
          <button onClick={openRules}>규칙</button>
          <button onClick={() => setChatOpen(!chatOpen)}>채팅 {chatOpen ? '닫기' : '열기'}</button>
          <button className="danger-text" onClick={surrender}>항복</button>
        </div>
      </header>

      <section className="duel-layout">
        <aside className="battle-log panel-surface">
          <div className="log-head">
            <small>LIVE FEED</small>
            <strong>결투 기록</strong>
          </div>
          <div className="log-list">
            {state.log.length === 0 && <p className="empty-log">아직 기록이 없습니다.</p>}
            {[...state.log].reverse().map((entry) => (
              <div className={`log-entry tone-${entry.tone}`} key={entry.id}>
                <span />
                <p>{entry.text}</p>
              </div>
            ))}
          </div>
          <div className="phase-control">
            <span>{isMyTurn ? '행동 가능' : '상대 행동 대기'}</span>
            <button
              className="primary-button"
              onClick={advancePhase}
              disabled={!isMyTurn || busy || finished}
            >
              {state.phase === 'main' ? '전투 단계로' : '턴 종료'}
            </button>
          </div>
        </aside>

        <section className="battlefield panel-surface">
          <PlayerHud
            player={opponent}
            state={opponentState}
            isCurrent={state.currentPlayerId === opponent.id}
            reversed
            coreTargetable={Boolean(selectedHandCard && canTargetCore(selectedHandCard.card, false))}
            onCoreClick={() => onCoreClick(opponent.id)}
          />

          <div className="opponent-hand" aria-label={`상대 손패 ${opponentState.handCount}장`}>
            {Array.from({ length: Math.min(opponentState.handCount, 9) }).map((_, index) => (
              <CardBack className="tiny-back" key={index} />
            ))}
          </div>

          <TrapZone count={opponentState.trapCount} enemy />

          <BoardRows
            ownerId={opponent.id}
            state={opponentState}
            enemy
            selectedCard={selectedHandCard?.card ?? null}
            onUnitClick={onUnitClick}
          />

          <div className="arena-divider">
            <span />
            <div>
              <small>{view.room.mode === 'quick' ? 'QUICK DUEL' : 'GRAND DUEL'}</small>
              <strong>LINE BATTLE</strong>
            </div>
            <span />
          </div>

          <BoardRows
            ownerId={view.me.id}
            state={myState}
            selectedCard={selectedHandCard?.card ?? null}
            onUnitClick={onUnitClick}
            onEmptyLane={(lane) => {
              if (selectedHandCard?.card.type === 'unit') void playSelected({ lane });
            }}
            canAttack={isMyTurn && state.phase === 'battle' && !finished}
            attack={attack}
          />

          <TrapZone count={myState.trapCount} ownCards={view.myTraps} />

          <PlayerHud
            player={view.me}
            state={myState}
            isCurrent={state.currentPlayerId === view.me.id}
            coreTargetable={Boolean(selectedHandCard && canTargetCore(selectedHandCard.card, true))}
            onCoreClick={() => onCoreClick(view.me.id)}
          />
        </section>

        <aside className="hand-console panel-surface">
          <div className="hand-console-head">
            <div>
              <small>YOUR HAND</small>
              <strong>{view.hand.length} / 9</strong>
            </div>
            <div className="energy-readout">
              <span>ENERGY</span>
              <b>{myState.energy}</b>
              <i>/ {myState.maxEnergy}</i>
            </div>
          </div>

          <div className="selected-card-zone">
            {selectedHandCard ? (
              <>
                <CardFace card={selectedHandCard.card} size="detail" selected />
                <div className="selected-instruction">
                  <small>ACTION GUIDE</small>
                  <strong>{getTargetHint(selectedHandCard.card)}</strong>
                  <span>비용 {selectedHandCard.card.cost} · 현재 에너지 {myState.energy}</span>
                </div>
                {immediatePlayable && (
                  <button
                    className="primary-button full"
                    disabled={!isMyTurn || state.phase !== 'main' || busy || myState.energy < selectedHandCard.card.cost}
                    onClick={() => void playSelected()}
                  >
                    {selectedHandCard.card.type === 'trap' ? '뒤집어 설치' : '주문 사용'}
                  </button>
                )}
                <button className="ghost-button full" onClick={() => setSelectedCardUid(null)}>선택 취소</button>
              </>
            ) : (
              <div className="no-selection">
                <div className="selection-rune">✦</div>
                <strong>손패에서 카드를 선택하세요</strong>
                <span>카드 효과와 사용할 대상을 여기서 확인할 수 있습니다.</span>
              </div>
            )}
          </div>

          <div className="hand-strip">
            {view.hand.map((entry) => (
              <button
                className={`hand-card-button ${entry.uid === selectedCardUid ? 'selected' : ''} ${entry.uid === drawPulseUid ? 'just-drawn' : ''}`}
                onClick={() => setSelectedCardUid(entry.uid === selectedCardUid ? null : entry.uid)}
                key={entry.uid}
              >
                <CardFace card={entry.card} size="hand" selected={entry.uid === selectedCardUid} />
              </button>
            ))}
            {view.hand.length === 0 && <div className="empty-hand">손패가 없습니다.</div>}
          </div>
        </aside>
      </section>

      <div className={`chat-drawer ${chatOpen ? 'open' : ''}`}>
        <button className="drawer-close" onClick={() => setChatOpen(false)}>×</button>
        <ChatPanel
          title="방 채팅"
          subtitle="결투 중에도 상대와 실시간으로 대화할 수 있습니다."
          messages={messages}
          chatBody={chatBody}
          setChatBody={setChatBody}
          sendMessage={sendMessage}
        />
      </div>

      {finished && (
        <div className="result-overlay">
          <div className={`result-card ${iWon ? 'victory' : 'defeat'}`}>
            <small>{iWon ? 'DUEL COMPLETE' : 'MATCH RESULT'}</small>
            <h2>{iWon ? 'VICTORY' : 'DEFEAT'}</h2>
            <p>{winner ? `${winner.user_name} 님이 코어 결투에서 승리했습니다.` : '결투가 종료되었습니다.'}</p>
            <div className="result-reward">+{view.room.mode === 'grand' ? (iWon ? 450 : 75) : (iWon ? 180 : 30)} AP</div>
            <div className="result-stats">
              <span><b>{myState.core}</b> 내 코어</span>
              <span><b>{state.turnNo}</b> 종료 턴</span>
              <span><b>{myState.deckCount}</b> 남은 덱</span>
            </div>
            <div className="result-actions">
              <button className="primary-button" onClick={rematch} disabled={busy}>같은 방에서 재대결</button>
              <button className="secondary-button" onClick={leaveToHome}>홈으로</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


function PlayerHud({
  player,
  state,
  isCurrent,
  reversed = false,
  coreTargetable,
  onCoreClick,
}: {
  player: PlayerRow;
  state: PlayerPublicState;
  isCurrent: boolean;
  reversed?: boolean;
  coreTargetable: boolean;
  onCoreClick: () => void;
}) {
  return (
    <div className={`player-hud ${reversed ? 'reversed' : ''} ${isCurrent ? 'current' : ''}`}>
      <div className="avatar-ring">{player.user_name.slice(0, 1).toUpperCase()}</div>
      <div className="player-name-block">
        <small>{isCurrent ? 'ACTIVE DUELIST' : 'DUELIST'}</small>
        <strong>{player.user_name}</strong>
      </div>
      <button className={`core-orb ${coreTargetable ? 'targetable' : ''}`} onClick={onCoreClick}>
        <span>CORE</span>
        <b>{Math.max(0, state.core)}</b>
        <i>/ {state.maxCore}</i>
      </button>
      <div className="deck-counter">
        <small>DECK</small>
        <b>{state.deckCount}</b>
      </div>
      <div className="hand-counter">
        <small>HAND</small>
        <b>{state.handCount}</b>
      </div>
      <div className="energy-gems" title={`에너지 ${state.energy}/${state.maxEnergy}`}>
        {Array.from({ length: Math.max(1, state.maxEnergy) }).map((_, index) => (
          <span className={index < state.energy ? 'filled' : ''} key={index} />
        ))}
      </div>
    </div>
  );
}

function BoardRows({
  ownerId,
  state,
  enemy = false,
  selectedCard,
  onUnitClick,
  onEmptyLane,
  canAttack = false,
  attack,
}: {
  ownerId: string;
  state: PlayerPublicState;
  enemy?: boolean;
  selectedCard: ArcanaCard | null;
  onUnitClick: (playerId: string, unit: BoardUnit) => void;
  onEmptyLane?: (lane: number) => void;
  canAttack?: boolean;
  attack?: (attackerId: string) => void;
}) {
  return (
    <div className={`board-row ${enemy ? 'enemy-row' : 'friendly-row'}`}>
      {state.board.map((unit, lane) => {
        const targetable = Boolean(unit && selectedCard && canTargetUnit(selectedCard, !enemy));
        const summonable = Boolean(!enemy && !unit && selectedCard?.type === 'unit');
        return (
          <div
            className={`lane-slot ${unit ? 'occupied' : ''} ${targetable ? 'targetable' : ''} ${summonable ? 'summonable' : ''}`}
            key={lane}
            onClick={() => {
              if (unit) onUnitClick(ownerId, unit);
              else if (summonable && onEmptyLane) onEmptyLane(lane);
            }}
          >
            <span className="lane-number">LINE {lane + 1}</span>
            {unit ? (
              <UnitPiece unit={unit} enemy={enemy} />
            ) : (
              <div className="empty-lane-mark">
                <i>◇</i>
                <small>{summonable ? '여기에 소환' : 'EMPTY'}</small>
              </div>
            )}
            {!enemy && unit && canAttack && !unit.exhausted && attack && (
              <button
                className="attack-button"
                onClick={(event) => { event.stopPropagation(); attack(unit.instanceId); }}
              >
                공격
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function UnitPiece({ unit, enemy }: { unit: BoardUnit; enemy: boolean }) {
  const healthPercent = Math.max(0, Math.min(100, (unit.health / unit.maxHealth) * 100));
  return (
    <div className={`unit-piece faction-${unit.faction} rarity-${unit.rarity} ${unit.exhausted ? 'exhausted' : ''}`}>
      <div className="unit-art">
        <span>{unit.icon}</span>
        <i>{RARITY_LABEL[unit.rarity]}</i>
      </div>
      <strong>{unit.name}</strong>
      <div className="unit-keywords">
        {unit.shield > 0 && <span>보호막 {unit.shield}</span>}
        {unit.frozen && <span>빙결</span>}
        {unit.exhausted && <span>{enemy ? '행동 완료' : '대기'}</span>}
      </div>
      <div className="unit-health-bar"><span style={{ width: `${healthPercent}%` }} /></div>
      <div className="unit-stats">
        <b className="attack-stat">{unit.attack}</b>
        <b className="health-stat">{Math.max(0, unit.health)}</b>
      </div>
    </div>
  );
}

function TrapZone({ count, enemy = false, ownCards = [] }: { count: number; enemy?: boolean; ownCards?: HandCard[] }) {
  return (
    <div className={`trap-zone ${enemy ? 'enemy-traps' : ''}`}>
      <span className="zone-label">TRAP ZONE</span>
      {[0, 1].map((index) => {
        const own = ownCards[index];
        const occupied = index < count;
        return (
          <div className={`trap-slot ${occupied ? 'occupied' : ''}`} key={index} title={own?.card.name}>
            {occupied ? <CardBack className="trap-back" /> : <span>＋</span>}
            {own && <small>{own.card.name}</small>}
          </div>
        );
      })}
    </div>
  );
}

function CardFace({
  card,
  size = 'hand',
  selected = false,
}: {
  card: ArcanaCard;
  size?: 'hand' | 'detail';
  selected?: boolean;
}) {
  const style = { '--card-accent': `var(--faction-${card.faction})` } as CSSProperties;
  return (
    <article
      className={`arcana-card card-${size} faction-${card.faction} rarity-${card.rarity} ${selected ? 'selected' : ''}`}
      style={style}
    >
      <div className="card-frame">
        <div className="card-cost">{card.cost}</div>
        <div className="card-title-row">
          <small>{factionLabel(card.faction)} · {TYPE_LABEL[card.type]}</small>
          <strong>{card.name}</strong>
        </div>
        <div className="card-art-panel">
          <span>{card.icon}</span>
          <i>{RARITY_LABEL[card.rarity]}</i>
        </div>
        <div className="card-text-box">
          <p>{card.text}</p>
          {size === 'detail' && <em>{card.flavor}</em>}
        </div>
        {card.type === 'unit' ? (
          <div className="card-combat-stats">
            <b>{card.attack}</b>
            <span>ATK / HP</span>
            <b>{card.health}</b>
          </div>
        ) : (
          <div className="card-type-foot"><span>{TYPE_LABEL[card.type]}</span><b>{RARITY_LABEL[card.rarity]}</b></div>
        )}
      </div>
    </article>
  );
}

function CardBack({ className = '' }: { className?: string }) {
  return (
    <div className={`card-back ${className}`}>
      <div className="back-border">
        <span className="back-rune">V</span>
        <i>ARCANA</i>
      </div>
    </div>
  );
}

function ChatPanel({
  title,
  subtitle,
  messages,
  chatBody,
  setChatBody,
  sendMessage,
}: {
  title: string;
  subtitle: string;
  messages: ChatMessage[];
  chatBody: string;
  setChatBody: (value: string) => void;
  sendMessage: (event: FormEvent) => void;
}) {
  const endRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);
  return (
    <section className="chat-panel panel-surface">
      <div className="chat-head">
        <div><small>LIVE CHANNEL</small><strong>{title}</strong></div>
        <span>{messages.length} MESSAGES</span>
      </div>
      <p className="chat-subtitle">{subtitle}</p>
      <div className="chat-list">
        {messages.length === 0 && <div className="chat-empty">첫 메시지를 남겨보세요.</div>}
        {messages.map((message) => (
          <div className="chat-message" key={message.id}>
            <div><strong>{message.user_name}</strong><time>{shortTime(message.created_at)}</time></div>
            <p>{message.body}</p>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <form className="chat-form" onSubmit={sendMessage}>
        <input
          value={chatBody}
          onChange={(event) => setChatBody(event.target.value)}
          placeholder="메시지 입력…"
          maxLength={180}
        />
        <button type="submit">전송</button>
      </form>
    </section>
  );
}

function RulesModal({ close }: { close: () => void }) {
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <section className="rules-modal" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={close}>×</button>
        <small>VANTA ARCANA</small>
        <h2>결투 규칙</h2>
        <div className="rules-grid">
          <RuleBlock number="01" title="카드 뽑기">각 플레이어는 직접 구성한 24장 활성 덱과 손패 5장으로 시작하며, 자기 턴마다 1장을 뽑습니다.</RuleBlock>
          <RuleBlock number="02" title="메인 단계">에너지를 사용해 유닛을 소환하고, 주문을 쓰거나 함정을 최대 2장까지 뒤집어 설치합니다.</RuleBlock>
          <RuleBlock number="03" title="3개 라인">유닛은 소환된 라인에서 싸웁니다. 같은 라인에 적 유닛이 없을 때만 적 코어를 직접 공격합니다.</RuleBlock>
          <RuleBlock number="04" title="전투 단계">행동 가능한 유닛으로 공격합니다. 유닛끼리 싸우면 서로 동시에 공격력만큼 피해를 줍니다.</RuleBlock>
          <RuleBlock number="05" title="함정 발동">함정은 상대에게 뒷면으로 보이며 주문, 소환, 공격, 파괴 등의 조건에 자동으로 반응합니다.</RuleBlock>
          <RuleBlock number="06" title="승리 조건">상대 코어를 0으로 만들면 승리합니다. 덱이 비면 매번 점점 커지는 피로 피해를 받습니다.</RuleBlock>
        </div>
        <div className="keyword-guide">
          <span><b>속공</b> 소환한 턴에 공격 가능</span>
          <span><b>흡수</b> 입힌 피해만큼 코어 회복</span>
          <span><b>관통</b> 남은 피해가 적 코어로 전달</span>
          <span><b>보호막</b> 체력보다 먼저 피해를 흡수</span>
        </div>
        <button className="primary-button full" onClick={close}>확인</button>
      </section>
    </div>
  );
}

function RuleBlock({ number, title, children }: { number: string; title: string; children: ReactNode }) {
  return (
    <article className="rule-block">
      <b>{number}</b>
      <div><strong>{title}</strong><p>{children}</p></div>
    </article>
  );
}

function RotateOverlay() {
  return (
    <div className="rotate-overlay">
      <div className="rotate-device"><span /></div>
      <strong>가로 화면으로 돌려주세요</strong>
      <p>카드와 3개 전투 라인을 편하게 보려면 폰과 태블릿을 가로로 사용해 주세요.</p>
    </div>
  );
}

function LoadingBox({ children }: { children: ReactNode }) {
  return <div className="loading-box">{children}</div>;
}
