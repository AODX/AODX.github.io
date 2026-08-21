'use client';

import { createClient, Session } from '@supabase/supabase-js';
import { ChangeEvent, CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  CARDS,
  CARD_BY_ID,
  type CardDefinition,
  type CardKind,
  DECK_SIZE,
  ELEMENT_LABEL,
  type Element,
  KIND_LABEL,
  MAX_COPIES,
  PACKS,
  RARITY_LABEL,
  type Rarity,
  countCards,
  validateDeck,
} from './game-data';
import type { MatchState, PrivateState, UnitState } from './game-engine';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabase = createClient(supabaseUrl || 'https://invalid.supabase.co', supabaseKey || 'invalid-key', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

type View = 'home' | 'duel' | 'deck' | 'shop' | 'collection' | 'friends' | 'profile';

type Profile = {
  user_id: string;
  display_name: string;
  player_code: string;
  avatar: string;
  status_message: string;
  wins: number;
  losses: number;
  xp: number;
};

type Wallet = { user_id: string; coins: number };
type CollectionRow = { card_id: string; quantity: number };
type DeckRow = { id: string; user_id: string; name: string; cards: string[]; is_active: boolean; created_at: string };
type FriendRequest = { id: string; sender_id: string; receiver_id: string; status: string; created_at: string };
type FriendProfile = Pick<Profile, 'user_id' | 'display_name' | 'player_code' | 'avatar' | 'status_message' | 'wins' | 'losses' | 'xp'>;

type HubData = {
  profile: Profile;
  wallet: Wallet;
  collection: CollectionRow[];
  decks: DeckRow[];
  friendRequests: FriendRequest[];
  friends: FriendProfile[];
  requestProfiles: Array<Pick<Profile, 'user_id' | 'display_name' | 'player_code' | 'avatar'>>;
};

type RoomRow = {
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
};

type RoomProfile = Pick<Profile, 'user_id' | 'display_name' | 'avatar' | 'wins' | 'losses' | 'xp'>;
type RoomPayload = { room: RoomRow; profiles: RoomProfile[]; privateState: PrivateState | null };
type ChatMessage = { id: number; user_id: string; display_name: string; body: string; created_at: string };

type ApiResult = {
  ok: boolean;
  error?: string;
  hub?: HubData;
  user?: { id: string; email?: string };
  room?: RoomRow;
  profiles?: RoomProfile[];
  privateState?: PrivateState | null;
  cardIds?: string[];
  balance?: number;
};

const NAV_ITEMS: Array<{ id: View; label: string; icon: string }> = [
  { id: 'home', label: '홈', icon: '◈' },
  { id: 'duel', label: '대전하기', icon: '⚔' },
  { id: 'deck', label: '덱 구성', icon: '▤' },
  { id: 'shop', label: '상점', icon: '✦' },
  { id: 'collection', label: '보관함', icon: '◇' },
  { id: 'friends', label: '친구', icon: '♢' },
  { id: 'profile', label: '프로필', icon: '◎' },
];

const ELEMENT_ACCENT: Record<Element, string> = {
  solar: '#ff8f58',
  lunar: '#8ca7ff',
  storm: '#6ce8ff',
  verdant: '#76d39a',
  void: '#b37cff',
  neutral: '#c9d0df',
};

const AVATARS = ['eclipse', 'nova', 'oracle', 'warden', 'reaper', 'seraph'];

function levelFromXp(xp: number): number {
  return Math.max(1, Math.floor(Math.sqrt(Math.max(0, xp) / 100)) + 1);
}

function winRate(profile: Profile | FriendProfile): number {
  const total = profile.wins + profile.losses;
  return total === 0 ? 0 : Math.round((profile.wins / total) * 100);
}

function cardStyle(card: CardDefinition): CSSProperties {
  return { '--card-accent': ELEMENT_ACCENT[card.element] } as CSSProperties;
}

async function api(action: string, payload: Record<string, unknown> = {}): Promise<ApiResult> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('로그인이 필요합니다.');
  const response = await fetch('/api/eclipse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, ...payload }),
  });
  const result = (await response.json()) as ApiResult;
  if (!response.ok || !result.ok) throw new Error(result.error || '서버 요청에 실패했습니다.');
  return result;
}

function CardFace({
  card,
  compact = false,
  selected = false,
  disabled = false,
  quantity,
  onClick,
  hidden = false,
}: {
  card?: CardDefinition;
  compact?: boolean;
  selected?: boolean;
  disabled?: boolean;
  quantity?: number;
  onClick?: () => void;
  hidden?: boolean;
}) {
  if (hidden || !card) {
    return (
      <button type="button" className={`tcg-card card-back ${compact ? 'compact' : ''}`} disabled>
        <span className="back-orbit" />
        <span className="back-mark">E</span>
        <span className="back-title">ECLIPSE</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`tcg-card rarity-${card.rarity} element-${card.element} ${compact ? 'compact' : ''} ${selected ? 'selected' : ''}`}
      style={cardStyle(card)}
      onClick={onClick}
      disabled={disabled}
      title={card.text}
    >
      <span className="card-cost">{card.cost}</span>
      {quantity !== undefined && <span className="card-quantity">×{quantity}</span>}
      <span className="card-topline">
        <b>{card.name}</b>
        <small>{RARITY_LABEL[card.rarity]}</small>
      </span>
      <span className="card-art">
        <span className="art-glow" />
        <strong>{card.sigil}</strong>
        <em>{ELEMENT_LABEL[card.element]}</em>
      </span>
      <span className="card-subtitle">{card.subtitle}</span>
      {!compact && <span className="card-text">{card.text}</span>}
      <span className="card-footer">
        <span>{KIND_LABEL[card.kind]}</span>
        {card.kind === 'unit' ? <b>{card.attack} / {card.health}</b> : <b>{ELEMENT_LABEL[card.element]}</b>}
      </span>
    </button>
  );
}

function Avatar({ id, size = 'medium' }: { id?: string; size?: 'small' | 'medium' | 'large' }) {
  return <span className={`avatar avatar-${id || 'eclipse'} avatar-${size}`}><span>{(id || 'eclipse').slice(0, 1).toUpperCase()}</span></span>;
}

function LoadingScreen({ text = '결투장을 준비하는 중' }: { text?: string }) {
  return (
    <main className="loading-screen">
      <div className="loading-sigil"><span>◈</span></div>
      <h1>ECLIPSE DUEL</h1>
      <p>{text}</p>
      <div className="loading-bar"><span /></div>
    </main>
  );
}

function AuthScreen({ onSession }: { onSession: (session: Session) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      if (!supabaseUrl || !supabaseKey) throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName.trim() || email.split('@')[0] } },
        });
        if (error) throw error;
        if (data.session) onSession(data.session);
        else setMessage('가입 확인 메일을 보냈습니다. 메일을 확인한 뒤 로그인하세요.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) onSession(data.session);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen">
      <div className="auth-atmosphere"><span /><span /><span /></div>
      <section className="auth-brand">
        <div className="brand-emblem">E</div>
        <p>ORIGINAL ONLINE CARD BATTLE</p>
        <h1>ECLIPSE<br /><strong>DUEL</strong></h1>
        <h2>카드를 수집하고, 덱을 설계하고, 상대의 코어를 무너뜨리세요.</h2>
        <div className="auth-features">
          <span>30장 커스텀 덱</span>
          <span>실시간 1대1</span>
          <span>숨겨진 함정</span>
        </div>
      </section>
      <form className="auth-panel" onSubmit={submit}>
        <div className="auth-tabs">
          <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>로그인</button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => setMode('signup')}>신규 등록</button>
        </div>
        <h3>{mode === 'login' ? '결투장으로 돌아오기' : '새로운 결투가 등록'}</h3>
        {mode === 'signup' && (
          <label>
            <span>플레이어 이름</span>
            <input value={displayName} onChange={(event: ChangeEvent<HTMLInputElement>) => setDisplayName(event.target.value)} maxLength={16} placeholder="게임에서 사용할 이름" />
          </label>
        )}
        <label>
          <span>이메일</span>
          <input type="email" value={email} onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)} required placeholder="name@example.com" />
        </label>
        <label>
          <span>비밀번호</span>
          <input type="password" value={password} onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)} minLength={6} required placeholder="6자 이상" />
        </label>
        {message && <p className="form-message">{message}</p>}
        <button className="primary-button auth-submit" disabled={busy}>{busy ? '처리 중...' : mode === 'login' ? '로그인' : '계정 만들기'}</button>
        <small>이 게임은 독자적인 세계관과 카드 규칙으로 제작된 오리지널 프로젝트입니다.</small>
      </form>
    </main>
  );
}

function HomeView({ hub, onNavigate }: { hub: HubData; onNavigate: (view: View) => void }) {
  const activeDeck = hub.decks.find((deck) => deck.is_active) ?? hub.decks[0];
  const collectionCount = hub.collection.reduce((sum, row) => sum + row.quantity, 0);
  const level = levelFromXp(hub.profile.xp);
  return (
    <div className="view-stack home-view">
      <section className="hero-banner">
        <div className="hero-copy">
          <span className="eyebrow">SEASON 01 · ECLIPSE AWAKENING</span>
          <h1>어둠이 내려올 때,<br /><strong>당신의 덱이 빛난다.</strong></h1>
          <p>5개의 유닛 존과 5개의 비밀 존. 드로우, 소환, 함정, 전투의 흐름을 직접 설계하세요.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => onNavigate('duel')}>대전 시작</button>
            <button className="ghost-button" onClick={() => onNavigate('deck')}>덱 점검</button>
          </div>
        </div>
        <div className="hero-card-stack">
          <CardFace card={CARD_BY_ID.unit_eclipse_dragon} />
          <CardFace card={CARD_BY_ID.trap_null_horizon} />
          <CardFace card={CARD_BY_ID.unit_dawn_seraph} />
        </div>
      </section>

      <section className="dashboard-grid">
        <article className="panel active-deck-panel">
          <header><span>ACTIVE DECK</span><button onClick={() => onNavigate('deck')}>편집</button></header>
          <h3>{activeDeck?.name ?? '활성 덱 없음'}</h3>
          <p>{activeDeck?.cards?.length ?? 0} / {DECK_SIZE}장</p>
          <div className="deck-composition">
            {(['unit', 'spell', 'trap'] as CardKind[]).map((kind) => {
              const count = (activeDeck?.cards ?? []).filter((id) => CARD_BY_ID[id]?.kind === kind).length;
              return <span key={kind}><i className={`dot kind-${kind}`} />{KIND_LABEL[kind]} <b>{count}</b></span>;
            })}
          </div>
        </article>
        <article className="panel stat-panel">
          <span>결투가 레벨</span><strong>LV. {level}</strong><p>{hub.profile.xp} XP</p>
          <div className="progress"><span style={{ width: `${Math.min(100, (hub.profile.xp % (level * level * 100)) / Math.max(1, level * 2))}%` }} /></div>
        </article>
        <article className="panel stat-panel">
          <span>시즌 전적</span><strong>{hub.profile.wins}승 {hub.profile.losses}패</strong><p>승률 {winRate(hub.profile)}%</p>
        </article>
        <article className="panel stat-panel">
          <span>보유 카드</span><strong>{collectionCount}장</strong><p>{hub.collection.length}종 수집</p>
        </article>
      </section>

      <section className="quick-grid">
        <button className="quick-card duel-quick" onClick={() => onNavigate('duel')}>
          <span>⚔</span><div><b>랭크 결투</b><small>상대를 찾아 즉시 대전</small></div><em>PLAY</em>
        </button>
        <button className="quick-card" onClick={() => onNavigate('shop')}>
          <span>✦</span><div><b>카드 팩 상점</b><small>새로운 전술을 획득</small></div><em>{hub.wallet.coins} C</em>
        </button>
        <button className="quick-card" onClick={() => onNavigate('friends')}>
          <span>♢</span><div><b>친구 목록</b><small>친구와 비공개 결투</small></div><em>{hub.friends.length}</em>
        </button>
      </section>
    </div>
  );
}

function DeckBuilder({ hub, onHub }: { hub: HubData; onHub: (hub: HubData) => void }) {
  const defaultDeck = hub.decks.find((deck) => deck.is_active) ?? hub.decks[0];
  const [selectedDeckId, setSelectedDeckId] = useState(defaultDeck?.id ?? '');
  const [deckName, setDeckName] = useState(defaultDeck?.name ?? '새 덱');
  const [deckCards, setDeckCards] = useState<string[]>(defaultDeck?.cards ?? []);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'all' | CardKind>('all');
  const [element, setElement] = useState<'all' | Element>('all');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const collection = useMemo(() => Object.fromEntries(hub.collection.map((row) => [row.card_id, row.quantity])), [hub.collection]);
  const counts = useMemo(() => countCards(deckCards), [deckCards]);
  const validation = validateDeck(deckCards, collection);
  const selectedDeck = hub.decks.find((deck) => deck.id === selectedDeckId);

  useEffect(() => {
    if (!selectedDeck) return;
    setDeckName(selectedDeck.name);
    setDeckCards(Array.isArray(selectedDeck.cards) ? selectedDeck.cards : []);
  }, [selectedDeckId]);

  const filtered = CARDS.filter((card) => {
    if (!collection[card.id]) return false;
    if (kind !== 'all' && card.kind !== kind) return false;
    if (element !== 'all' && card.element !== element) return false;
    if (search && !`${card.name} ${card.text}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  function addCard(card: CardDefinition) {
    const max = Math.min(MAX_COPIES[card.rarity], collection[card.id] ?? 0);
    if ((counts[card.id] ?? 0) >= max || deckCards.length >= DECK_SIZE) return;
    setDeckCards((current) => [...current, card.id]);
  }

  function removeCard(cardId: string) {
    setDeckCards((current) => {
      const index = current.lastIndexOf(cardId);
      return index < 0 ? current : [...current.slice(0, index), ...current.slice(index + 1)];
    });
  }

  async function saveDeck() {
    setBusy(true);
    setMessage('');
    try {
      const result = await api('save_deck', { deckId: selectedDeckId, name: deckName, cards: deckCards });
      if (result.hub) onHub(result.hub);
      setMessage('덱을 저장했습니다.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function activateDeck() {
    if (!selectedDeckId) return;
    setBusy(true);
    try {
      const result = await api('set_active_deck', { deckId: selectedDeckId });
      if (result.hub) onHub(result.hub);
      setMessage('활성 덱으로 지정했습니다.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '활성화에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="deck-builder">
      <section className="deck-header panel">
        <div>
          <span className="eyebrow">DECK LAB</span>
          <h2>덱 구성</h2>
          <p>30장의 카드로 자신만의 승리 루트를 설계하세요.</p>
        </div>
        <div className="deck-status">
          <strong className={deckCards.length === DECK_SIZE && !validation ? 'valid' : ''}>{deckCards.length}/{DECK_SIZE}</strong>
          <small>{validation ?? '사용 가능한 덱입니다.'}</small>
        </div>
      </section>

      <div className="deck-workspace">
        <section className="collection-browser panel">
          <div className="deck-toolbar">
            <input value={search} onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} placeholder="카드명 또는 효과 검색" />
            <select value={kind} onChange={(event: ChangeEvent<HTMLSelectElement>) => setKind(event.target.value as 'all' | CardKind)}>
              <option value="all">모든 종류</option><option value="unit">유닛</option><option value="spell">주문</option><option value="trap">함정</option>
            </select>
            <select value={element} onChange={(event: ChangeEvent<HTMLSelectElement>) => setElement(event.target.value as 'all' | Element)}>
              <option value="all">모든 속성</option>{Object.entries(ELEMENT_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
          </div>
          <div className="collection-grid deck-grid">
            {filtered.map((card) => (
              <CardFace
                key={card.id}
                card={card}
                compact
                quantity={(collection[card.id] ?? 0) - (counts[card.id] ?? 0)}
                disabled={(counts[card.id] ?? 0) >= Math.min(MAX_COPIES[card.rarity], collection[card.id] ?? 0) || deckCards.length >= DECK_SIZE}
                onClick={() => addCard(card)}
              />
            ))}
          </div>
        </section>

        <aside className="deck-list panel">
          <div className="deck-selector">
            <select value={selectedDeckId} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedDeckId(event.target.value)}>
              {hub.decks.map((deck) => <option key={deck.id} value={deck.id}>{deck.is_active ? '★ ' : ''}{deck.name}</option>)}
              <option value="">＋ 새 덱</option>
            </select>
            <input value={deckName} onChange={(event: ChangeEvent<HTMLInputElement>) => setDeckName(event.target.value)} maxLength={24} />
          </div>
          <div className="deck-type-summary">
            {(['unit', 'spell', 'trap'] as CardKind[]).map((type) => (
              <span key={type}>{KIND_LABEL[type]} <b>{deckCards.filter((id) => CARD_BY_ID[id]?.kind === type).length}</b></span>
            ))}
          </div>
          <div className="deck-card-list">
            {Object.entries(counts)
              .sort(([a], [b]) => (CARD_BY_ID[a]?.cost ?? 0) - (CARD_BY_ID[b]?.cost ?? 0))
              .map(([cardId, quantity]) => {
                const card = CARD_BY_ID[cardId];
                if (!card) return null;
                return (
                  <button key={cardId} onClick={() => removeCard(cardId)} style={cardStyle(card)}>
                    <i>{card.cost}</i><span>{card.name}<small>{KIND_LABEL[card.kind]} · {RARITY_LABEL[card.rarity]}</small></span><b>×{quantity}</b><em>−</em>
                  </button>
                );
              })}
          </div>
          {message && <p className="inline-message">{message}</p>}
          <div className="deck-actions">
            <button className="ghost-button" disabled={!selectedDeckId || selectedDeck?.is_active || busy || Boolean(validation)} onClick={activateDeck}>활성 덱 지정</button>
            <button className="primary-button" disabled={busy || Boolean(validation)} onClick={saveDeck}>{busy ? '저장 중...' : '덱 저장'}</button>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ShopView({ hub, onHub }: { hub: HubData; onHub: (hub: HubData) => void }) {
  const [busyPack, setBusyPack] = useState('');
  const [opened, setOpened] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [error, setError] = useState('');

  async function buy(packId: string) {
    setBusyPack(packId);
    setError('');
    try {
      const result = await api('buy_pack', { packId });
      if (result.hub) onHub(result.hub);
      const cards = result.cardIds ?? [];
      setOpened(cards);
      setRevealed(cards.map(() => false));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '팩 구매에 실패했습니다.');
    } finally {
      setBusyPack('');
    }
  }

  return (
    <div className="view-stack">
      <section className="section-heading">
        <div><span className="eyebrow">ECLIPSE SHOP</span><h2>카드 팩 상점</h2><p>획득한 카드는 즉시 보관함과 덱 편집에 반영됩니다.</p></div>
        <div className="currency-pill">✦ {hub.wallet.coins.toLocaleString()} COIN</div>
      </section>
      {error && <p className="error-banner">{error}</p>}
      <section className="pack-grid">
        {PACKS.map((pack, index) => (
          <article className={`pack-card pack-${index}`} key={pack.id} style={{ '--pack-accent': pack.accent } as CSSProperties}>
            <span className="pack-shine" />
            <div className="pack-emblem">{index === 0 ? '✦' : index === 1 ? '♜' : index === 2 ? '☀' : index === 3 ? '◉' : '♛'}</div>
            <span className="eyebrow">5 CARDS</span>
            <h3>{pack.name}</h3>
            <p>{pack.tagline}</p>
            <div className="pack-price"><b>{pack.price}</b> COIN</div>
            <button className="primary-button" disabled={busyPack === pack.id || hub.wallet.coins < pack.price} onClick={() => buy(pack.id)}>
              {busyPack === pack.id ? '개봉 준비 중...' : '팩 개봉'}
            </button>
          </article>
        ))}
      </section>

      {opened.length > 0 && (
        <div className="modal-layer">
          <section className="pack-opening-modal">
            <span className="eyebrow">PACK OPENING</span>
            <h2>카드를 눌러 공개하세요</h2>
            <div className="opening-cards">
              {opened.map((cardId, index) => (
                <div className={revealed[index] ? 'revealed' : ''} key={`${cardId}-${index}`}>
                  <CardFace
                    card={CARD_BY_ID[cardId]}
                    hidden={!revealed[index]}
                    onClick={() => setRevealed((current) => current.map((value, itemIndex) => itemIndex === index ? true : value))}
                  />
                </div>
              ))}
            </div>
            <button className="primary-button" disabled={revealed.some((value) => !value)} onClick={() => setOpened([])}>보관함으로 보내기</button>
          </section>
        </div>
      )}
    </div>
  );
}

function CollectionView({ hub }: { hub: HubData }) {
  const [search, setSearch] = useState('');
  const [rarity, setRarity] = useState<'all' | Rarity>('all');
  const collection = Object.fromEntries(hub.collection.map((row) => [row.card_id, row.quantity]));
  const visible = CARDS.filter((card) => (collection[card.id] ?? 0) > 0)
    .filter((card) => rarity === 'all' || card.rarity === rarity)
    .filter((card) => !search || `${card.name} ${card.text}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="view-stack">
      <section className="section-heading">
        <div><span className="eyebrow">CARD VAULT</span><h2>보관함</h2><p>{visible.length}종의 카드가 표시되고 있습니다.</p></div>
        <div className="collection-tools"><input value={search} onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} placeholder="카드 검색" /><select value={rarity} onChange={(event: ChangeEvent<HTMLSelectElement>) => setRarity(event.target.value as 'all' | Rarity)}><option value="all">모든 등급</option>{Object.entries(RARITY_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></div>
      </section>
      <section className="collection-grid vault-grid">
        {visible.map((card) => <CardFace key={card.id} card={card} quantity={collection[card.id]} />)}
      </section>
    </div>
  );
}

function FriendsView({ hub, userId, onHub }: { hub: HubData; userId: string; onHub: (hub: HubData) => void }) {
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const profileMap = Object.fromEntries(hub.requestProfiles.map((profile) => [profile.user_id, profile]));
  const incoming = hub.friendRequests.filter((request) => request.receiver_id === userId && request.status === 'pending');
  const outgoing = hub.friendRequests.filter((request) => request.sender_id === userId && request.status === 'pending');

  async function requestFriend() {
    try {
      const result = await api('friend_request', { playerCode: code });
      if (result.hub) onHub(result.hub);
      setCode(''); setMessage('친구 요청을 보냈습니다.');
    } catch (error) { setMessage(error instanceof Error ? error.message : '요청 실패'); }
  }

  async function respond(requestId: string, accept: boolean) {
    try {
      const result = await api('friend_respond', { requestId, accept });
      if (result.hub) onHub(result.hub);
    } catch (error) { setMessage(error instanceof Error ? error.message : '처리 실패'); }
  }

  async function remove(friendId: string) {
    if (!confirm('친구 목록에서 삭제하시겠습니까?')) return;
    try {
      const result = await api('friend_remove', { friendId });
      if (result.hub) onHub(result.hub);
    } catch (error) { setMessage(error instanceof Error ? error.message : '삭제 실패'); }
  }

  return (
    <div className="view-stack">
      <section className="section-heading"><div><span className="eyebrow">SOCIAL</span><h2>친구</h2><p>친구 코드를 이용하면 이메일을 공개하지 않고 연결할 수 있습니다.</p></div><div className="code-badge">내 코드 <b>{hub.profile.player_code}</b></div></section>
      <section className="friends-layout">
        <article className="panel friend-add">
          <h3>친구 추가</h3><p>상대의 ECLIPSE 친구 코드를 입력하세요.</p>
          <div className="inline-form"><input value={code} onChange={(event: ChangeEvent<HTMLInputElement>) => setCode(event.target.value.toUpperCase())} placeholder="ED-XXXXXXXXXX" /><button className="primary-button" onClick={requestFriend}>요청</button></div>
          {message && <p className="inline-message">{message}</p>}
          {incoming.length > 0 && <div className="request-list"><h4>받은 요청</h4>{incoming.map((request) => { const profile = profileMap[request.sender_id]; return <div key={request.id}><Avatar id={profile?.avatar} size="small" /><span><b>{profile?.display_name ?? '결투가'}</b><small>{profile?.player_code}</small></span><button onClick={() => respond(request.id, true)}>수락</button><button onClick={() => respond(request.id, false)}>거절</button></div>; })}</div>}
          {outgoing.length > 0 && <div className="request-list"><h4>보낸 요청</h4>{outgoing.map((request) => { const profile = profileMap[request.receiver_id]; return <div key={request.id}><Avatar id={profile?.avatar} size="small" /><span><b>{profile?.display_name ?? '결투가'}</b><small>응답 대기 중</small></span></div>; })}</div>}
        </article>
        <article className="panel friend-list-panel">
          <header><h3>친구 목록</h3><span>{hub.friends.length}명</span></header>
          <div className="friend-list">
            {hub.friends.length === 0 && <div className="empty-state"><span>♢</span><p>아직 등록된 친구가 없습니다.</p></div>}
            {hub.friends.map((friend) => <div className="friend-row" key={friend.user_id}><Avatar id={friend.avatar} /><span><b>{friend.display_name}</b><small>{friend.status_message}</small></span><div><em>LV.{levelFromXp(friend.xp)}</em><small>{friend.wins}승 · 승률 {winRate(friend)}%</small></div><button onClick={() => remove(friend.user_id)}>삭제</button></div>)}
          </div>
        </article>
      </section>
    </div>
  );
}

function ProfileView({ hub, onHub }: { hub: HubData; onHub: (hub: HubData) => void }) {
  const [name, setName] = useState(hub.profile.display_name);
  const [status, setStatus] = useState(hub.profile.status_message);
  const [avatar, setAvatar] = useState(hub.profile.avatar);
  const [message, setMessage] = useState('');

  async function save() {
    try {
      const result = await api('update_profile', { displayName: name, statusMessage: status, avatar });
      if (result.hub) onHub(result.hub);
      setMessage('프로필을 저장했습니다.');
    } catch (error) { setMessage(error instanceof Error ? error.message : '저장 실패'); }
  }

  return (
    <div className="profile-layout">
      <section className="profile-card panel">
        <Avatar id={avatar} size="large" />
        <span className="eyebrow">DUELIST PROFILE</span>
        <h2>{hub.profile.display_name}</h2>
        <p>{hub.profile.status_message}</p>
        <div className="profile-code">{hub.profile.player_code}</div>
        <div className="profile-stats"><span><b>LV.{levelFromXp(hub.profile.xp)}</b><small>레벨</small></span><span><b>{hub.profile.wins}</b><small>승리</small></span><span><b>{winRate(hub.profile)}%</b><small>승률</small></span></div>
      </section>
      <section className="profile-editor panel">
        <span className="eyebrow">CUSTOMIZE</span><h2>프로필 편집</h2>
        <label><span>플레이어 이름</span><input value={name} onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)} maxLength={16} /></label>
        <label><span>상태 메시지</span><input value={status} onChange={(event: ChangeEvent<HTMLInputElement>) => setStatus(event.target.value)} maxLength={60} /></label>
        <label><span>프로필 문양</span><div className="avatar-picker">{AVATARS.map((id) => <button className={avatar === id ? 'active' : ''} key={id} onClick={() => setAvatar(id)}><Avatar id={id} /></button>)}</div></label>
        {message && <p className="inline-message">{message}</p>}
        <button className="primary-button" onClick={save}>변경 사항 저장</button>
      </section>
    </div>
  );
}

function ChatDrawer({ open, roomId, onClose, profile }: { open: boolean; roomId?: string; onClose: () => void; profile: Profile }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const table = roomId ? 'eclipse_room_messages' : 'eclipse_global_messages';

  useEffect(() => {
    let alive = true;
    async function load() {
      let query = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(60);
      if (roomId) query = query.eq('room_id', roomId);
      const { data } = await query;
      if (alive) setMessages(((data ?? []) as ChatMessage[]).reverse());
    }
    load();
    const channel = supabase
      .channel(`chat-${table}-${roomId ?? 'global'}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table, ...(roomId ? { filter: `room_id=eq.${roomId}` } : {}) }, (payload: any) => {
        setMessages((current) => [...current.slice(-59), payload.new as ChatMessage]);
      })
      .subscribe();
    return () => { alive = false; supabase.removeChannel(channel); };
  }, [roomId, table]);

  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, open]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message) return;
    setInput(''); setError('');
    try {
      await api(roomId ? 'send_room_message' : 'send_global_message', roomId ? { roomId, message } : { message });
    } catch (reason) { setError(reason instanceof Error ? reason.message : '전송 실패'); }
  }

  return (
    <aside className={`chat-drawer ${open ? 'open' : ''}`}>
      <header><div><span>{roomId ? 'ROOM CHAT' : 'GLOBAL CHAT'}</span><h3>{roomId ? '결투방 채팅' : '전체 채팅'}</h3></div><button onClick={onClose}>×</button></header>
      <div className="chat-messages">
        {messages.length === 0 && <div className="empty-state"><span>···</span><p>첫 메시지를 남겨보세요.</p></div>}
        {messages.map((message) => <div className={`chat-message ${message.user_id === profile.user_id ? 'mine' : ''}`} key={message.id}><b>{message.display_name}</b><p>{message.body}</p><small>{new Date(message.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</small></div>)}
        <div ref={bottomRef} />
      </div>
      {error && <p className="chat-error">{error}</p>}
      <form onSubmit={send}><input value={input} onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)} maxLength={180} placeholder="메시지 입력" /><button>전송</button></form>
    </aside>
  );
}

function UnitSlot({
  unit,
  owner,
  index,
  selected,
  enemy,
  onClick,
}: {
  unit: UnitState | null;
  owner: string;
  index: number;
  selected?: boolean;
  enemy?: boolean;
  onClick?: () => void;
}) {
  const card = unit ? CARD_BY_ID[unit.cardId] : undefined;
  return (
    <button className={`unit-slot ${unit ? 'occupied' : ''} ${selected ? 'selected' : ''} ${enemy ? 'enemy' : ''}`} onClick={onClick} data-owner={owner} data-index={index}>
      {!unit ? <span className="slot-mark">{index + 1}</span> : (
        <>
          <span className="unit-art" style={card ? cardStyle(card) : undefined}><strong>{card?.sigil ?? '✦'}</strong></span>
          <span className="unit-name">{card?.name ?? unit.cardId.replace('token:', '')}</span>
          <span className="unit-stats"><b>{unit.attack}</b><i>⚔</i><b>{unit.health}</b>{unit.shield > 0 && <em>＋{unit.shield}</em>}</span>
          {!unit.canAttack && <span className="unit-state">REST</span>}
        </>
      )}
    </button>
  );
}

function DuelBoard({ payload, userId, onRefresh, onLeave }: { payload: RoomPayload; userId: string; onRefresh: (payload: RoomPayload) => void; onLeave: () => void }) {
  const { room, privateState: nullablePrivateState } = payload;
  const nullableState = room.state;
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [selectedAttacker, setSelectedAttacker] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  if (!nullableState || !nullablePrivateState || nullableState.playerOrder.length !== 2) return <LoadingScreen text="결투 상태를 동기화하는 중" />;
  const state = nullableState;
  const privateState = nullablePrivateState;

  const opponentId = state.playerOrder.find((id) => id !== userId) ?? '';
  const profileMap = Object.fromEntries(payload.profiles.map((profile) => [profile.user_id, profile]));
  const me = profileMap[userId];
  const opponent = profileMap[opponentId];
  const myTurn = state.currentPlayerId === userId;
  const selectedInstance = privateState.hand.find((card) => card.instanceId === selectedHand);
  const selectedCard = selectedInstance ? CARD_BY_ID[selectedInstance.cardId] : undefined;

  async function gameAction(gameAction: string, extra: Record<string, unknown> = {}) {
    setBusy(true); setMessage('');
    try {
      const result = await api('game_action', { roomId: room.id, gameAction, ...extra });
      if (result.room && result.profiles) onRefresh({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null });
      setSelectedHand(null); setSelectedAttacker(null);
    } catch (error) { setMessage(error instanceof Error ? error.message : '행동 처리 실패'); }
    finally { setBusy(false); }
  }

  function playToZone(zone: number, kind: 'unit' | 'trap') {
    if (!selectedCard || selectedCard.kind !== kind || !selectedHand) return;
    gameAction('play_card', { instanceId: selectedHand, zone });
  }

  function targetUnit(ownerId: string, unitIndex: number) {
    if (selectedCard && selectedHand && state.phase === 'main') {
      if (selectedCard.target === 'enemy_unit' && ownerId === opponentId) gameAction('play_card', { instanceId: selectedHand, target: { ownerId, unitIndex } });
      else if (selectedCard.target === 'friendly_unit' && ownerId === userId) gameAction('play_card', { instanceId: selectedHand, target: { ownerId, unitIndex } });
      return;
    }
    if (selectedAttacker !== null && ownerId === opponentId) gameAction('attack', { attackerIndex: selectedAttacker, target: { kind: 'unit', unitIndex } });
    else if (ownerId === userId && state.phase === 'battle' && myTurn) setSelectedAttacker(unitIndex);
  }

  function activateSelectedNoTarget() {
    if (!selectedCard || !selectedHand) return;
    gameAction('play_card', { instanceId: selectedHand });
  }

  return (
    <div className="duel-screen">
      <div className="orientation-hint"><span>↻</span><b>기기를 가로로 돌려주세요</b><small>결투장은 가로 화면에 최적화되어 있습니다.</small></div>
      <header className="duel-topbar">
        <div className="duelist opponent"><Avatar id={opponent?.avatar} /><span><small>OPPONENT</small><b>{opponent?.display_name ?? '상대'}</b></span></div>
        <div className="turn-orb"><small>TURN {state.turnNumber}</small><b>{myTurn ? 'YOUR TURN' : 'OPPONENT TURN'}</b><span>{state.phase === 'main' ? 'MAIN PHASE' : 'BATTLE PHASE'}</span></div>
        <button className="surrender-button" disabled={busy} onClick={() => confirm('항복하시겠습니까?') && gameAction('surrender')}>항복</button>
      </header>

      <section className="battlefield">
        <div className="battlefield-texture" />
        <div className="opponent-hand">
          {Array.from({ length: Math.min(8, state.handCounts[opponentId] ?? 0) }, (_, index) => <CardFace key={index} hidden compact />)}
          {(state.handCounts[opponentId] ?? 0) > 8 && <b>+{state.handCounts[opponentId] - 8}</b>}
        </div>
        <div className="core-panel enemy-core">
          <button disabled={!myTurn || state.phase !== 'battle' || selectedAttacker === null || busy} onClick={() => gameAction('attack', { attackerIndex: selectedAttacker, target: { kind: 'core' } })}>
            <span>ENEMY CORE</span><strong>{state.core[opponentId]}</strong>
          </button>
          <div className="energy"><span>ENERGY</span><b>{state.energy[opponentId]?.current ?? 0}/{state.energy[opponentId]?.max ?? 0}</b></div>
        </div>

        <div className="zone-row enemy-secrets">
          {state.boards[opponentId].secrets.map((secret, index) => <div className={`secret-slot ${secret ? 'set' : ''}`} key={index}>{secret ? <CardFace hidden compact /> : <span>{index + 1}</span>}</div>)}
        </div>
        <div className="zone-row enemy-units">
          {state.boards[opponentId].units.map((unit, index) => <UnitSlot key={index} unit={unit} owner={opponentId} index={index} enemy onClick={() => targetUnit(opponentId, index)} />)}
        </div>

        <div className="field-center">
          <div className="eclipse-ring"><span>◈</span></div>
          <div className="deck-piles"><span>상대 덱 <b>{state.deckCounts[opponentId]}</b></span><span>상대 묘지 <b>{state.graveyards[opponentId]?.length ?? 0}</b></span></div>
          <div className="deck-piles mine"><span>내 묘지 <b>{state.graveyards[userId]?.length ?? 0}</b></span><span>내 덱 <b>{state.deckCounts[userId]}</b></span></div>
        </div>

        <div className="zone-row my-units">
          {state.boards[userId].units.map((unit, index) => <UnitSlot key={index} unit={unit} owner={userId} index={index} selected={selectedAttacker === index} onClick={() => unit ? targetUnit(userId, index) : playToZone(index, 'unit')} />)}
        </div>
        <div className="zone-row my-secrets">
          {state.boards[userId].secrets.map((secret, index) => <button className={`secret-slot ${secret ? 'set' : ''}`} key={index} onClick={() => !secret && playToZone(index, 'trap')}>{secret ? <CardFace hidden compact /> : <span>{index + 1}</span>}</button>)}
        </div>

        <div className="core-panel my-core">
          <div className="energy"><span>ENERGY</span><b>{state.energy[userId]?.current ?? 0}/{state.energy[userId]?.max ?? 0}</b></div>
          <div><span>YOUR CORE</span><strong>{state.core[userId]}</strong></div>
        </div>
      </section>

      <section className="duel-controls">
        <div className="duelist me"><Avatar id={me?.avatar} /><span><small>YOU</small><b>{me?.display_name ?? '나'}</b></span></div>
        <div className="hand-zone">
          {privateState.hand.map((instance) => <CardFace key={instance.instanceId} card={CARD_BY_ID[instance.cardId]} compact selected={selectedHand === instance.instanceId} disabled={!myTurn || state.phase !== 'main' || busy} onClick={() => setSelectedHand((current) => current === instance.instanceId ? null : instance.instanceId)} />)}
        </div>
        <div className="phase-controls">
          {selectedCard && <div className="selected-card-action"><b>{selectedCard.name}</b><small>{selectedCard.text}</small>{selectedCard.kind === 'spell' && (selectedCard.target === 'none' || selectedCard.target === 'enemy_core') && <button onClick={activateSelectedNoTarget}>발동</button>}</div>}
          {message && <p>{message}</p>}
          {state.status === 'active' && (
            <>
              {state.phase === 'main' && <button className="battle-button" disabled={!myTurn || busy} onClick={() => gameAction('battle_phase')}>전투 단계</button>}
              <button className="end-turn-button" disabled={!myTurn || busy} onClick={() => gameAction('end_turn')}>턴 종료</button>
            </>
          )}
        </div>
      </section>

      <aside className="battle-log">
        <header>DUEL LOG</header>
        <div>{state.logs.slice(-8).reverse().map((log) => <p className={`tone-${log.tone}`} key={log.id}>{log.text}</p>)}</div>
      </aside>

      {state.status === 'finished' && (
        <div className="modal-layer">
          <section className="result-modal">
            <span className="result-emblem">{state.winnerId === userId ? '✦' : '◇'}</span>
            <span className="eyebrow">DUEL COMPLETE</span>
            <h2>{state.winnerId === userId ? 'VICTORY' : 'DEFEAT'}</h2>
            <p>{state.winReason}</p>
            <div className="reward-preview">{state.winnerId === userId ? '+180 COIN · +100 XP' : '+35 COIN · +35 XP'}</div>
            <button className="primary-button" onClick={onLeave}>허브로 돌아가기</button>
          </section>
        </div>
      )}
    </div>
  );
}

function DuelView({ userId, hub, roomPayload, onRoom, onHub }: { userId: string; hub: HubData; roomPayload: RoomPayload | null; onRoom: (room: RoomPayload | null) => void; onHub: (hub: HubData) => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function roomAction(action: string, payload: Record<string, unknown> = {}) {
    setBusy(true); setMessage('');
    try {
      const result = await api(action, payload);
      if (result.room && result.profiles) onRoom({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null });
      return result;
    } catch (error) { setMessage(error instanceof Error ? error.message : '요청 실패'); }
    finally { setBusy(false); }
  }

  async function leaveRoom() {
    if (roomPayload) await roomAction('leave_room', { roomId: roomPayload.room.id });
    onRoom(null);
    try { const result = await api('hub'); if (result.hub) onHub(result.hub); } catch { /* ignore */ }
  }

  if (roomPayload?.room.status === 'active' || roomPayload?.room.status === 'finished') {
    return <DuelBoard payload={roomPayload} userId={userId} onRefresh={onRoom} onLeave={leaveRoom} />;
  }

  if (roomPayload) {
    const room = roomPayload.room;
    const profileMap = Object.fromEntries(roomPayload.profiles.map((profile) => [profile.user_id, profile]));
    const isHost = room.host_id === userId;
    const myReady = isHost ? room.ready_host : room.ready_guest;
    return (
      <div className="waiting-room">
        <section className="waiting-card panel">
          <span className="eyebrow">PRIVATE DUEL ROOM</span>
          <h2>결투 준비</h2>
          <div className="room-code"><small>ROOM CODE</small><strong>{room.code}</strong><button onClick={() => navigator.clipboard.writeText(room.code)}>복사</button></div>
          <div className="versus-line">
            <div><Avatar id={profileMap[room.host_id]?.avatar} size="large" /><b>{profileMap[room.host_id]?.display_name ?? 'HOST'}</b><span className={room.ready_host ? 'ready' : ''}>{room.ready_host ? 'READY' : 'WAITING'}</span></div>
            <strong>VS</strong>
            <div>{room.guest_id ? <><Avatar id={profileMap[room.guest_id]?.avatar} size="large" /><b>{profileMap[room.guest_id]?.display_name ?? 'GUEST'}</b><span className={room.ready_guest ? 'ready' : ''}>{room.ready_guest ? 'READY' : 'WAITING'}</span></> : <><span className="empty-avatar">?</span><b>상대 대기 중</b><span>SHARE CODE</span></>}</div>
          </div>
          <p>양쪽 플레이어가 준비하면 활성 덱으로 결투가 시작됩니다.</p>
          {message && <p className="error-banner">{message}</p>}
          <div className="waiting-actions"><button className="ghost-button" onClick={leaveRoom}>나가기</button><button className="primary-button" disabled={busy || myReady || !room.guest_id} onClick={() => roomAction('ready', { roomId: room.id })}>{myReady ? '준비 완료' : '결투 준비'}</button></div>
        </section>
      </div>
    );
  }

  const activeDeck = hub.decks.find((deck) => deck.is_active);
  return (
    <div className="duel-lobby view-stack">
      <section className="duel-hero">
        <div><span className="eyebrow">ONLINE DUEL</span><h1>한 장의 선택이<br />전장을 뒤집는다.</h1><p>에너지와 손패를 관리하고, 얼굴을 감춘 함정으로 상대의 확신을 무너뜨리세요.</p></div>
        <CardFace card={CARD_BY_ID.unit_crownless_titan} />
      </section>
      <section className="duel-mode-grid">
        <button className="mode-card ranked" disabled={busy || !activeDeck} onClick={() => roomAction('quick_match')}><span>RANKED</span><h3>빠른 대전</h3><p>대기 중인 상대를 찾아 자동으로 연결합니다.</p><em>매칭 시작 →</em></button>
        <button className="mode-card private" disabled={busy || !activeDeck} onClick={() => roomAction('create_room')}><span>PRIVATE</span><h3>비공개 방</h3><p>방 코드를 공유해 친구와 결투합니다.</p><em>방 만들기 →</em></button>
        <article className="mode-card join"><span>JOIN ROOM</span><h3>코드로 참가</h3><p>친구에게 받은 6자리 코드를 입력하세요.</p><div className="inline-form"><input value={code} onChange={(event: ChangeEvent<HTMLInputElement>) => setCode(event.target.value.toUpperCase())} maxLength={6} placeholder="ABC123" /><button disabled={busy || code.length < 6} onClick={() => roomAction('join_room', { code })}>입장</button></div></article>
      </section>
      <section className="active-deck-strip panel"><span>사용 덱</span><b>{activeDeck?.name ?? '활성 덱 없음'}</b><small>{activeDeck?.cards.length ?? 0}/{DECK_SIZE}장</small>{!activeDeck && <em>덱 구성에서 활성 덱을 지정하세요.</em>}</section>
      {message && <p className="error-banner">{message}</p>}
    </div>
  );
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [hub, setHub] = useState<HubData | null>(null);
  const [view, setView] = useState<View>('home');
  const [chatOpen, setChatOpen] = useState(false);
  const [roomPayload, setRoomPayload] = useState<RoomPayload | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: any) => { setSession(data.session); setAuthReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_event: any, nextSession: Session | null) => { setSession(nextSession); setAuthReady(true); if (!nextSession) { setHub(null); setRoomPayload(null); } });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    api('bootstrap')
      .then((result) => { if (alive && result.hub) setHub(result.hub); })
      .catch((reason) => { if (alive) setError(reason instanceof Error ? reason.message : '계정 정보를 불러오지 못했습니다.'); });
    return () => { alive = false; };
  }, [session?.user.id]);

  useEffect(() => {
    if (!roomPayload?.room.id || !session) return;
    const roomId = roomPayload.room.id;
    let refreshing = false;
    async function refresh() {
      if (refreshing) return;
      refreshing = true;
      try {
        const result = await api('get_room', { roomId });
        if (result.room && result.profiles) setRoomPayload({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null });
      } catch (reason) { setError(reason instanceof Error ? reason.message : '방 동기화 실패'); }
      finally { refreshing = false; }
    }
    const channel = supabase.channel(`room-${roomId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'eclipse_rooms', filter: `id=eq.${roomId}` }, refresh).subscribe();
    const timer = window.setInterval(refresh, 8000);
    return () => { window.clearInterval(timer); supabase.removeChannel(channel); };
  }, [roomPayload?.room.id, session?.user.id]);

  if (!authReady) return <LoadingScreen />;
  if (!session) return <AuthScreen onSession={setSession} />;
  if (!hub) return <LoadingScreen text={error || '계정과 카드 보관함을 불러오는 중'} />;

  const content = (() => {
    switch (view) {
      case 'duel': return <DuelView userId={session.user.id} hub={hub} roomPayload={roomPayload} onRoom={setRoomPayload} onHub={setHub} />;
      case 'deck': return <DeckBuilder hub={hub} onHub={setHub} />;
      case 'shop': return <ShopView hub={hub} onHub={setHub} />;
      case 'collection': return <CollectionView hub={hub} />;
      case 'friends': return <FriendsView hub={hub} userId={session.user.id} onHub={setHub} />;
      case 'profile': return <ProfileView hub={hub} onHub={setHub} />;
      default: return <HomeView hub={hub} onNavigate={setView} />;
    }
  })();

  const roomChat = roomPayload && roomPayload.room.status !== 'cancelled' ? roomPayload.room.id : undefined;

  return (
    <main className={`game-app view-${view} ${roomPayload?.room.status === 'active' ? 'in-duel' : ''}`}>
      <aside className="sidebar">
        <button className="game-logo" onClick={() => setView('home')}><span>E</span><div><b>ECLIPSE</b><small>DUEL</small></div></button>
        <nav>{NAV_ITEMS.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}><i>{item.icon}</i><span>{item.label}</span></button>)}</nav>
        <div className="sidebar-profile"><Avatar id={hub.profile.avatar} size="small" /><span><b>{hub.profile.display_name}</b><small>LV.{levelFromXp(hub.profile.xp)}</small></span><button onClick={() => supabase.auth.signOut({ scope: 'local' })}>↗</button></div>
      </aside>

      <header className="topbar">
        <div className="mobile-logo"><span>E</span><b>ECLIPSE DUEL</b></div>
        <div className="topbar-title"><small>{NAV_ITEMS.find((item) => item.id === view)?.label}</small><b>{view === 'home' ? `어서 오세요, ${hub.profile.display_name}` : 'ECLIPSE NETWORK'}</b></div>
        <div className="topbar-actions"><span className="currency-pill">✦ {hub.wallet.coins.toLocaleString()}</span><button className={`chat-toggle ${chatOpen ? 'active' : ''}`} onClick={() => setChatOpen((value) => !value)}>⌁ <span>{roomChat ? '방 채팅' : '전체 채팅'}</span></button><button className="profile-chip" onClick={() => setView('profile')}><Avatar id={hub.profile.avatar} size="small" /><span>{hub.profile.display_name}</span></button></div>
      </header>

      <section className="content-area">{error && <div className="global-error"><span>{error}</span><button onClick={() => setError('')}>×</button></div>}{content}</section>

      <nav className="mobile-nav">{NAV_ITEMS.slice(0, 5).map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => setView(item.id)}><i>{item.icon}</i><span>{item.label}</span></button>)}</nav>
      <ChatDrawer open={chatOpen} roomId={roomChat} onClose={() => setChatOpen(false)} profile={hub.profile} />
      {chatOpen && <button className="chat-backdrop" aria-label="채팅 닫기" onClick={() => setChatOpen(false)} />}
    </main>
  );
}
