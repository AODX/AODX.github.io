'use client';

import { createClient, Session } from '@supabase/supabase-js';
import { ChangeEvent, CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  CARDS,
  CARD_BY_ID,
  type CardDefinition,
  type CardKind,
  type Keyword,
  DECK_SIZE,
  EXTRA_DECK_SIZE,
  ELEMENT_LABEL,
  type Element,
  KIND_LABEL,
  MAX_COPIES,
  PACKS,
  RARITY_LABEL,
  type Rarity,
  countCards,
  isExtraDeckCard,
  isUnitCard,
  validateDeck,
  validateExtraDeck,
} from './game-data';
import type { MatchState, PrivateState, UnitState, VisualEvent } from './game-engine';

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
type DeckRow = { id: string; user_id: string; name: string; cards: string[]; extra_cards: string[]; is_active: boolean; created_at: string };
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

type SecureServerStatus = {
  secureDuelReady: boolean;
  code: 'READY' | 'MISSING_KEY' | 'WRONG_PROJECT' | 'INVALID_KEY' | 'DB_MIGRATION_REQUIRED' | 'UNKNOWN';
  message: string;
  keySource: 'secret' | 'service_role' | 'none';
};

type ApiResult = {
  ok: boolean;
  code?: string;
  error?: string;
  hub?: HubData;
  user?: { id: string; email?: string };
  room?: RoomRow;
  profiles?: RoomProfile[];
  privateState?: PrivateState | null;
  cardIds?: string[];
  balance?: number;
  serverStatus?: SecureServerStatus;
};

const NAV_ITEMS: Array<{ id: View; label: string; icon: string }> = [
  { id: 'home', label: '홈', icon: 'HM' },
  { id: 'duel', label: '대전', icon: 'VS' },
  { id: 'collection', label: '카드', icon: 'CL' },
  { id: 'deck', label: '덱', icon: 'DK' },
  { id: 'shop', label: '상점', icon: 'SH' },
  { id: 'friends', label: '친구', icon: 'FR' },
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

const SOUND_STORAGE_KEY = 'eclipse-duel:sound-enabled';
let globalSoundEnabled = true;
let sharedAudioContext: AudioContext | null = null;

function setGlobalSoundEnabled(enabled: boolean): void {
  globalSoundEnabled = enabled;
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || !globalSoundEnabled) return null;
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!sharedAudioContext) sharedAudioContext = new AudioContextCtor();
  if (sharedAudioContext.state === 'suspended') void sharedAudioContext.resume();
  return sharedAudioContext;
}

type UiSound = 'click' | 'card' | 'remove' | 'auto' | 'save' | 'pack' | 'reveal' | 'success';

function playUiSound(kind: UiSound): void {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  const gain = context.createGain();
  const osc = context.createOscillator();
  gain.connect(context.destination);
  osc.connect(gain);
  const settings: Record<UiSound, [OscillatorType, number, number, number]> = {
    click: ['sine', 420, 520, 0.045],
    card: ['triangle', 360, 620, 0.075],
    remove: ['sine', 330, 220, 0.055],
    auto: ['triangle', 300, 780, 0.14],
    save: ['sine', 520, 820, 0.11],
    pack: ['sawtooth', 180, 460, 0.16],
    reveal: ['triangle', 460, 960, 0.12],
    success: ['sine', 620, 1040, 0.18],
  };
  const [type, start, end, duration] = settings[kind];
  osc.type = type;
  osc.frequency.setValueAtTime(start, now);
  osc.frequency.exponentialRampToValueAtTime(Math.max(50, end), now + duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(kind === 'pack' ? 0.045 : 0.026, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.start(now);
  osc.stop(now + duration + 0.01);
}

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

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) hash = Math.imul(31, hash) + value.charCodeAt(index) | 0;
  return Math.abs(hash);
}

function cardArtworkPath(cardId: string): string {
  return `/card-art/${cardId}.webp`;
}

function preloadCardArtwork(cardIds: string[]): void {
  if (typeof window === 'undefined') return;
  for (const cardId of Array.from(new Set(cardIds))) {
    const image = new window.Image();
    image.decoding = 'async';
    image.src = cardArtworkPath(cardId);
  }
}

const CARD_INSPECT_EVENT = 'eclipse:inspect-card';

function requestCardInspection(cardId: string): void {
  if (typeof window === 'undefined') return;
  preloadCardArtwork([cardId]);
  window.dispatchEvent(new CustomEvent<string>(CARD_INSPECT_EVENT, { detail: cardId }));
}

const KEYWORD_DESCRIPTION: Record<Keyword, string> = {
  guard: '수호 · 상대는 가능한 경우 이 유닛을 먼저 공격해야 합니다.',
  charge: '속공 · 소환된 턴에도 즉시 공격할 수 있습니다.',
  lifesteal: '흡수 · 가한 전투 피해만큼 내 코어를 회복합니다.',
  pierce: '관통 · 유닛을 파괴하고 남은 피해를 상대 코어에 줍니다.',
};

function effectDescription(effect: CardDefinition['effect'] | CardDefinition['onSummon'] | CardDefinition['trapEffect']): string {
  if (!effect) return '';
  if (effect.kind === 'damage_unit') return `대상 유닛에게 ${effect.amount} 피해`;
  if (effect.kind === 'damage_core') return `상대 코어에 ${effect.amount} 피해`;
  if (effect.kind === 'heal_core') return `내 코어를 ${effect.amount} 회복`;
  if (effect.kind === 'draw') return `카드를 ${effect.amount}장 드로우`;
  if (effect.kind === 'buff_unit') return `아군 유닛에게 공격력 +${effect.attack}, 방어력 +${effect.health}`;
  if (effect.kind === 'shield_unit') return `아군 유닛에게 보호막 ${effect.amount} 부여`;
  if (effect.kind === 'aoe_enemy') return `모든 적 유닛에게 ${effect.amount} 피해`;
  if (effect.kind === 'gain_energy') return `이번 턴 에너지 ${effect.amount} 획득`;
  if (effect.kind === 'destroy_weak') return `방어력 ${effect.maxHealth} 이하의 유닛 1장 파괴`;
  if (effect.kind === 'summon_token') return `${effect.name} 토큰(${effect.attack}/${effect.health}) 소환`;
  if (effect.kind === 'negate') return '발동을 무효화';
  if (effect.kind === 'negate_and_damage') return `발동을 무효화하고 코어에 ${effect.amount} 피해`;
  return '';
}

function trapTriggerDescription(trigger: CardDefinition['trapTrigger']): string {
  const labels: Record<NonNullable<CardDefinition['trapTrigger']>, string> = {
    spell_played: '상대가 주문을 발동했을 때',
    unit_summoned: '상대가 유닛을 일반 소환했을 때',
    special_summoned: '상대가 특수 소환했을 때',
    fusion_summoned: '상대가 공명 융합했을 때',
    evolution_summoned: '상대가 계승 진화했을 때',
    direct_attack: '상대가 코어를 직접 공격했을 때',
    unit_attacked: '내 유닛이 공격받았을 때',
    friendly_destroyed: '내 유닛이 파괴되었을 때',
  };
  return trigger ? labels[trigger] : '';
}

function summonConditionDescription(card: CardDefinition): string {
  if (card.summonMode === 'rift') return `${card.riftCondition?.label ?? '균열 조건 충족'} · 에너지 ${card.riftCost ?? card.cost}`;
  if (card.kind === 'fusion') return card.fusionRecipe?.label ?? '지정된 두 소재 유닛을 필드에서 묘지로 보내 공명 융합합니다.';
  if (card.kind === 'evolution') return card.evolutionRecipe?.label ?? '조건을 만족하는 필드 유닛 1장을 계승시켜 진화합니다.';
  return '';
}

function GameIcon({ name }: { name: View | 'chat' | 'coin' | 'logout' | 'sound' }) {
  const paths: Record<string, React.ReactNode> = {
    home: <><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1Z"/><path d="M9 10h6"/></>,
    duel: <><path d="m5 4 14 14"/><path d="m19 4-6 6"/><path d="m11 12-6 6"/><path d="M3 3l5 1-4 4Z"/><path d="m21 3-1 5-4-4Z"/></>,
    deck: <><rect x="5" y="3" width="12" height="16" rx="2"/><path d="M9 7h4"/><path d="m8 21 11-3V7"/></>,
    shop: <><path d="M4 9h16l-1 12H5Z"/><path d="m6 9 1-5h10l1 5"/><path d="M9 13h6"/></>,
    collection: <><rect x="3" y="4" width="14" height="16" rx="2"/><path d="M7 8h6M7 12h6M7 16h4"/><path d="M17 7h4v13a1 1 0 0 1-1 1h-9"/></>,
    friends: <><circle cx="9" cy="8" r="3"/><path d="M3 20c.6-4 2.5-6 6-6s5.4 2 6 6"/><circle cx="17" cy="9" r="2"/><path d="M15 15c3.5-.5 5.5 1.2 6 4"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21c.7-5 3.4-7.5 8-7.5s7.3 2.5 8 7.5"/></>,
    chat: <><path d="M4 5h16v11H9l-5 4Z"/><path d="M8 9h8M8 12h5"/></>,
    coin: <><circle cx="12" cy="12" r="9"/><path d="M14.5 8.5c-.8-.8-4-.8-4 1.2 0 2.2 4.8 1 4.8 3.4 0 2.1-3.8 2.2-5.3 1.1M12 6v12"/></>,
    logout: <><path d="M10 4H5v16h5"/><path d="m14 8 4 4-4 4M18 12H9"/></>,
    sound: <><path d="M4 10h4l5-4v12l-5-4H4Z"/><path d="M17 9c1.2 1.6 1.2 4.4 0 6M20 6c3 3.2 3 8.8 0 12"/></>,
  };
  return <svg className="ui-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

function CardIllustration({ card, compact = false, hero = false }: { card: CardDefinition; compact?: boolean; hero?: boolean }) {
  const variant = hashString(card.id) % 6;
  return (
    <span className={`card-illustration variant-${variant} element-${card.element} rarity-${card.rarity} ${compact ? 'is-compact' : ''} ${hero ? 'is-hero' : ''}`} aria-hidden="true">
      <img
        className="card-art-image"
        src={cardArtworkPath(card.id)}
        alt=""
        width={960}
        height={600}
        loading={hero ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
        onError={(event) => { if (!event.currentTarget.src.endsWith('/fallback.webp')) event.currentTarget.src = '/card-art/fallback.webp'; }}
      />
      <span className="card-art-grade" />
      <span className="card-art-vignette" />
      <span className="card-art-rune">{card.sigil}</span>
    </span>
  );
}

function friendlyAuthMessage(message: string): string {
  if (/invalid login credentials/i.test(message)) return '이메일 또는 비밀번호가 올바르지 않습니다.';
  if (/email not confirmed/i.test(message)) return '가입 확인 메일을 먼저 확인해 주세요.';
  if (/user already registered/i.test(message)) return '이미 가입된 이메일입니다. 로그인 탭을 이용해 주세요.';
  if (/password should be at least/i.test(message)) return '비밀번호는 6자 이상이어야 합니다.';
  if (/invalid.*email|email.*invalid/i.test(message)) return '사용할 수 있는 이메일 주소를 입력해 주세요.';
  if (/rate limit|too many requests/i.test(message)) return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
  if (/database error saving new user|failed to save new user/i.test(message)) {
    return '회원가입용 데이터베이스 연결이 남아 있는 이전 프로젝트 설정과 충돌했습니다. v5 통합 SQL을 실행한 뒤 다시 가입해 주세요.';
  }
  if (/session.*expired|refresh token|jwt expired/i.test(message)) return '로그인 시간이 만료되었습니다. 다시 로그인해 주세요.';
  return message;
}

async function accessToken(forceRefresh = false): Promise<string> {
  let { data, error } = await supabase.auth.getSession();
  if (error) throw new Error(friendlyAuthMessage(error.message));
  const expiresSoon = !data.session?.expires_at || data.session.expires_at * 1000 < Date.now() + 60_000;
  if (forceRefresh || expiresSoon) {
    const refreshed = await supabase.auth.refreshSession();
    if (refreshed.error || !refreshed.data.session) {
      await supabase.auth.signOut({ scope: 'local' });
      throw new Error('로그인 시간이 만료되었습니다. 다시 로그인해 주세요.');
    }
    data = refreshed.data;
  }
  const token = data.session?.access_token;
  if (!token) throw new Error('로그인이 필요합니다.');
  return token;
}

async function api(action: string, payload: Record<string, unknown> = {}, retried = false): Promise<ApiResult> {
  const token = await accessToken(false);
  const response = await fetch('/api/eclipse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ action, ...payload }),
  });
  const result = (await response.json().catch(() => ({ ok: false, error: '서버 응답을 읽지 못했습니다.' }))) as ApiResult;
  if ((response.status === 401 || result.code === 'AUTH_EXPIRED') && !retried) {
    await accessToken(true);
    return api(action, payload, true);
  }
  if (!response.ok || !result.ok) {
    if (response.status === 401 || result.code === 'AUTH_EXPIRED') await supabase.auth.signOut({ scope: 'local' });
    throw new Error(friendlyAuthMessage(result.error || '서버 요청에 실패했습니다.'));
  }
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
  inspectable = true,
}: {
  card?: CardDefinition;
  compact?: boolean;
  selected?: boolean;
  disabled?: boolean;
  quantity?: number;
  onClick?: () => void;
  hidden?: boolean;
  inspectable?: boolean;
}) {
  if (hidden || !card) {
    const interactive = Boolean(onClick) && !disabled;
    return (
      <button
        type="button"
        className={`tcg-card card-back ${compact ? 'compact' : ''} ${disabled ? 'is-disabled' : ''} ${interactive ? 'is-interactive' : 'is-static'}`}
        aria-label={interactive ? '뒤집힌 카드 공개' : '뒤집힌 카드'}
        aria-disabled={!interactive}
        onClick={() => { if (interactive) onClick?.(); }}
      >
        <span className="back-orbit" />
        <span className="back-mark">E</span>
        <span className="back-title">ECLIPSE</span>
        <span className="back-hint">TAP TO REVEAL</span>
      </button>
    );
  }

  const cardId = card.id;
  const performAction = onClick ?? (inspectable ? () => requestCardInspection(cardId) : undefined);

  function openInspector(event: React.MouseEvent | React.KeyboardEvent) {
    event.preventDefault();
    event.stopPropagation();
    requestCardInspection(cardId);
  }

  return (
    <button
      type="button"
      className={`tcg-card kind-${card.kind} summon-${card.summonMode ?? 'normal'} rarity-${card.rarity} element-${card.element} ${compact ? 'compact' : ''} ${selected ? 'selected' : ''} ${disabled ? 'is-disabled' : ''}`}
      style={cardStyle(card)}
      onClick={() => { if (!disabled) performAction?.(); }}
      aria-disabled={disabled}
      title={onClick ? `${card.name} 선택` : `${card.name} 상세 보기`}
    >
      <span className="card-cost">{card.cost}</span>
      {card.summonMode === 'rift' && <span className="summon-badge rift">균열</span>}
      {card.kind === 'fusion' && <span className="summon-badge fusion">융합</span>}
      {card.kind === 'evolution' && <span className="summon-badge evolution">진화</span>}
      {quantity !== undefined && <span className="card-quantity">×{quantity}</span>}
      {inspectable && (
        <span
          className="card-info-hotspot"
          role="button"
          tabIndex={0}
          aria-label={`${card.name} 상세 정보`}
          onClick={openInspector}
          onKeyDown={(event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') openInspector(event); }}
        >i</span>
      )}
      <span className="card-topline">
        <b>{card.name}</b>
        <small>{RARITY_LABEL[card.rarity]}</small>
      </span>
      <span className="card-art">
        <CardIllustration card={card} compact={compact} />
        <span className="art-element">{ELEMENT_LABEL[card.element]}</span>
      </span>
      <span className="card-subtitle">{card.subtitle}</span>
      {!compact && <span className="card-text">{card.text}</span>}
      <span className="card-footer">
        <span>{KIND_LABEL[card.kind]}</span>
        {isUnitCard(card) ? <b>{card.attack} / {card.health}</b> : <b>{ELEMENT_LABEL[card.element]}</b>}
      </span>
    </button>
  );
}

function CardDetailModal({ card, onClose }: { card: CardDefinition; onClose: () => void }) {
  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, [onClose]);

  const summonCondition = summonConditionDescription(card);
  const effectRows = [
    card.onSummon ? { label: '소환 효과', value: effectDescription(card.onSummon) } : null,
    card.effect ? { label: '카드 효과', value: effectDescription(card.effect) } : null,
    card.trapTrigger ? { label: '발동 조건', value: trapTriggerDescription(card.trapTrigger) } : null,
    card.trapEffect ? { label: '함정 효과', value: effectDescription(card.trapEffect) } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row?.value));

  const summonLabel = card.kind === 'fusion'
    ? '공명 융합'
    : card.kind === 'evolution'
      ? '계승 진화'
      : card.summonMode === 'rift'
        ? '균열 소환'
        : '일반 소환';

  return (
    <div className="modal-layer card-detail-layer" role="presentation" onMouseDown={(event: React.MouseEvent) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className={`card-detail-modal element-${card.element} rarity-${card.rarity}`} role="dialog" aria-modal="true" aria-label={`${card.name} 카드 상세 정보`}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="닫기">×</button>

        <div className="card-detail-visual">
          <div className="card-detail-artwork">
            <CardIllustration card={card} hero />
            <div className="card-detail-artbar">
              <span>{RARITY_LABEL[card.rarity]} · {ELEMENT_LABEL[card.element]}</span>
              <strong>{card.name}</strong>
              <small>{card.subtitle}</small>
            </div>
            <i className="card-detail-sigil">{card.sigil}</i>
          </div>
          <div className="card-detail-flavor"><span>LORE</span><p>{card.flavor}</p></div>
        </div>

        <div className="card-detail-content">
          <header>
            <div><span>{RARITY_LABEL[card.rarity]} · {ELEMENT_LABEL[card.element]} · {KIND_LABEL[card.kind]}{card.series ? ` · ${card.series}` : ''}</span><h2>{card.name}</h2><p>{card.subtitle}</p></div>
            <strong className="detail-cost"><small>COST</small>{card.cost}</strong>
          </header>

          {isUnitCard(card) ? (
            <div className="detail-stat-row">
              <span><small>공격력</small><b>{card.attack ?? 0}</b></span>
              <span><small>방어력</small><b>{card.health ?? 0}</b></span>
              <span><small>소환 방식</small><b>{summonLabel}</b></span>
            </div>
          ) : (
            <div className="detail-stat-row detail-stat-row-spell">
              <span><small>카드 종류</small><b>{KIND_LABEL[card.kind]}</b></span>
              <span><small>속성</small><b>{ELEMENT_LABEL[card.element]}</b></span>
              <span><small>대상</small><b>{card.target === 'enemy_unit' ? '적 유닛' : card.target === 'friendly_unit' ? '아군 유닛' : card.target === 'enemy_core' ? '상대 코어' : '자동 적용'}</b></span>
            </div>
          )}

          <section className="detail-section primary-effect">
            <span>카드 효과</span>
            <p>{card.text}</p>
          </section>

          {summonCondition && (
            <section className="detail-section summon-condition">
              <span>소환 조건</span>
              <p>{summonCondition}</p>
            </section>
          )}

          {card.keywords && card.keywords.length > 0 && (
            <section className="detail-section">
              <span>특수 효과</span>
              <div className="keyword-list">{card.keywords.map((keyword) => <p key={keyword}><b>{KEYWORD_DESCRIPTION[keyword].split(' · ')[0]}</b>{KEYWORD_DESCRIPTION[keyword].split(' · ')[1]}</p>)}</div>
            </section>
          )}

          {effectRows.length > 0 && (
            <section className="detail-effect-grid">
              {effectRows.map((row) => <div key={row.label}><small>{row.label}</small><b>{row.value}</b></div>)}
            </section>
          )}

          <button className="primary-button detail-close-button" type="button" onClick={onClose}>닫기</button>
        </div>
      </section>
    </div>
  );
}

function Avatar({ id, size = 'medium' }: { id?: string; size?: 'small' | 'medium' | 'large' }) {
  return <span className={`avatar avatar-${id || 'eclipse'} avatar-${size}`}><span>{(id || 'eclipse').slice(0, 1).toUpperCase()}</span></span>;
}

function LoadingScreen({ text = '결투장을 준비하는 중' }: { text?: string }) {
  return (
    <main className="loading-screen">
      <div className="loading-sigil"><span>E</span></div>
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
  const submitLock = useRef(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (submitLock.current) return;
    submitLock.current = true;
    setBusy(true);
    setMessage('');
    try {
      if (!supabaseUrl || !supabaseKey) throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
      if (mode === 'signup') {
        await supabase.auth.signOut({ scope: 'local' });
        const cleanEmail = email.trim().toLowerCase();
        const cleanName = displayName.trim() || cleanEmail.split('@')[0];
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: { display_name: cleanName },
            emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
          },
        });
        if (error) {
          await supabase.auth.signOut({ scope: 'local' });
          throw error;
        }
        if (data.session) {
          const verified = await supabase.auth.getUser(data.session.access_token);
          if (verified.error || !verified.data.user) {
            await supabase.auth.signOut({ scope: 'local' });
            throw verified.error ?? new Error('회원가입 세션을 확인하지 못했습니다.');
          }
          onSession(data.session);
        } else {
          setMessage('가입 확인 메일을 보냈습니다. 메일의 확인 링크를 누른 뒤 로그인해 주세요.');
        }
      } else {
        // 오래된 프로젝트의 토큰이 브라우저에 남아 있어도 새 로그인을 방해하지 않도록 먼저 정리합니다.
        await supabase.auth.signOut({ scope: 'local' });
        const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        if (!data.session) throw new Error('로그인 세션을 만들지 못했습니다.');
        const verified = await supabase.auth.getUser(data.session.access_token);
        if (verified.error || !verified.data.user) {
          await supabase.auth.signOut({ scope: 'local' });
          throw new Error('로그인 세션 검증에 실패했습니다. 다시 시도해 주세요.');
        }
        onSession(data.session);
      }
    } catch (error) {
      setMessage(friendlyAuthMessage(error instanceof Error ? error.message : '로그인에 실패했습니다.'));
    } finally {
      submitLock.current = false;
      setBusy(false);
    }
  }

  return (
    <main className="auth-screen premium-auth">
      <div className="auth-cinematic" aria-hidden="true">
        <span className="cinematic-grid" />
        <span className="cinematic-eclipse" />
        <span className="cinematic-beam beam-one" />
        <span className="cinematic-beam beam-two" />
      </div>

      <section className="auth-showcase">
        <header className="auth-logo-lockup">
          <div className="brand-emblem"><span>E</span></div>
          <div><b>ECLIPSE</b><small>DUEL</small></div>
        </header>
        <div className="auth-showcase-copy">
          <span className="eyebrow"><i /> ORIGINAL ONLINE TCG</span>
          <h1>소환의 규칙을<br /><strong>직접 설계하세요.</strong></h1>
          <p>30장 메인 덱과 6장 엑스트라 덱. 균열·공명·계승의 세 소환 체계로 나만의 승리 루트를 완성합니다.</p>
          <div className="auth-system-list">
            <span><b>RIFT</b><small>조건부 특수 소환</small></span>
            <span><b>RESONANCE</b><small>두 유닛의 공명 융합</small></span>
            <span><b>ASCENSION</b><small>필드 유닛의 계승 진화</small></span>
          </div>
        </div>
        <div className="auth-card-stage">
          <div className="auth-card auth-card-a"><CardFace card={CARD_BY_ID.unit_rift_wanderer} compact /></div>
          <div className="auth-card auth-card-b"><CardFace card={CARD_BY_ID.fusion_eclipse_chimera} /></div>
          <div className="auth-card auth-card-c"><CardFace card={CARD_BY_ID.evolution_ember_phoenix} compact /></div>
        </div>
      </section>

      <section className="auth-entry">
        <form className="auth-panel" onSubmit={submit}>
          <div className="auth-panel-header">
            <span className="auth-status-dot" />
            <small>ECLIPSE NETWORK</small>
          </div>
          <div className="auth-tabs">
            <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setMessage(''); }}>로그인</button>
            <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => { setMode('signup'); setMessage(''); }}>신규 등록</button>
          </div>
          <div className="auth-title">
            <span>{mode === 'login' ? 'WELCOME BACK' : 'CREATE DUELIST'}</span>
            <h2>{mode === 'login' ? '결투가 로그인' : '새 결투가 등록'}</h2>
            <p>{mode === 'login' ? '계정에 로그인해 덱과 전적을 불러옵니다.' : '기본 덱과 시작 코인 500개가 즉시 지급됩니다.'}</p>
          </div>
          {mode === 'signup' && (
            <label>
              <span>플레이어 이름</span>
              <input value={displayName} onChange={(event: ChangeEvent<HTMLInputElement>) => setDisplayName(event.target.value)} maxLength={16} placeholder="2~16자" autoComplete="nickname" />
            </label>
          )}
          <label>
            <span>이메일</span>
            <input type="email" value={email} onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)} required placeholder="name@example.com" autoComplete="email" />
          </label>
          <label>
            <span>비밀번호</span>
            <input type="password" value={password} onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)} minLength={6} required placeholder="6자 이상" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
          </label>
          {message && <p className="form-message" role="status">{message}</p>}
          <button className="primary-button auth-submit" disabled={busy}>{busy ? <><i className="button-spinner" /> 처리 중</> : mode === 'login' ? '게임 시작' : '계정 생성'}</button>
          <div className="auth-secure"><span>◈</span><p>로그인 정보는 Supabase Auth로 보호됩니다.</p></div>
        </form>
        <footer><span>VERSION 0.6.0 · ORIGIN</span><span>ORIGINAL IP</span></footer>
      </section>
    </main>
  );

}


function AccountErrorScreen({ message, onRetry, onSignOut }: { message: string; onRetry: () => void; onSignOut: () => void }) {
  const migrationIssue = /v5 데이터베이스|통합 SQL|does not exist|schema cache/i.test(message);
  return (
    <main className="account-error-screen">
      <div className="connection-backdrop" aria-hidden="true"><span /><span /><span /></div>
      <section className="connection-card">
        <div className={`connection-emblem ${migrationIssue ? 'warning' : ''}`}><span>{migrationIssue ? '!' : '↻'}</span></div>
        <span className="error-code">ACCOUNT RECOVERY</span>
        <h1>{migrationIssue ? '데이터베이스 설치를 확인해 주세요.' : '계정 정보를 불러오지 못했습니다.'}</h1>
        <p>{message}</p>
        {migrationIssue && (
          <div className="setup-steps">
            <span><b>1</b><em>동봉된 v5 통합 SQL 열기</em></span>
            <span><b>2</b><em>Supabase SQL Editor에 전체 붙여넣기</em></span>
            <span><b>3</b><em>Run 실행 후 페이지 새로고침</em></span>
          </div>
        )}
        <div className="connection-actions">
          <button className="primary-button" onClick={onRetry}>다시 불러오기</button>
          <button className="ghost-button" onClick={onSignOut}>로그아웃</button>
        </div>
      </section>
    </main>
  );
}

function HomeView({ hub, onNavigate, serverStatus }: { hub: HubData; onNavigate: (view: View) => void; serverStatus: SecureServerStatus }) {
  const activeDeck = hub.decks.find((deck) => deck.is_active) ?? hub.decks[0];
  const level = levelFromXp(hub.profile.xp);
  const featuredPool = [
    CARD_BY_ID.unit_crownless_titan,
    CARD_BY_ID.fusion_eclipse_chimera,
    CARD_BY_ID.evolution_ember_phoenix,
  ].filter((card): card is CardDefinition => Boolean(card));
  const featureCard = featuredPool[(level - 1) % Math.max(1, featuredPool.length)] ?? CARDS[0];
  const deckMain = activeDeck?.cards?.length ?? 0;
  const deckExtra = activeDeck?.extra_cards?.length ?? 0;
  const deckReady = Boolean(activeDeck && deckMain === DECK_SIZE && deckExtra === EXTRA_DECK_SIZE);
  const xpInLevel = Math.max(0, hub.profile.xp % 1000);
  const friends = hub.friends.slice(0, 3);

  return (
    <div className="view-stack v13-home">
      <section className={`v13-network-strip ${serverStatus.secureDuelReady ? 'is-ready' : 'is-warning'}`}>
        <div className="v13-network-main">
          <span className="v13-live-dot" />
          <b>{serverStatus.secureDuelReady ? '온라인 대전 준비 완료' : '온라인 대전 설정 확인 필요'}</b>
          <small>{serverStatus.secureDuelReady ? '보안 결투 서버가 정상 연결되어 있습니다.' : '일반 기능은 사용할 수 있으며 대전 서버 설정만 확인하면 됩니다.'}</small>
        </div>
        <button onClick={() => onNavigate('duel')}>{serverStatus.secureDuelReady ? '대전으로 이동' : '상태 확인'}</button>
      </section>

      <section className="v13-command-grid">
        <article className="v13-hero-panel">
          <div className="v13-eclipse-art" aria-hidden="true"><i /><i /><i /><span /></div>
          <div className="v13-hero-content">
            <span className="v13-kicker">ONLINE DUEL · SEASON ASCENSION</span>
            <h1>한 장의 선택이<br /><strong>전장을 뒤집습니다.</strong></h1>
            <p>손패와 에너지를 관리하고, 균열 소환·공명 융합·계승 진화를 연결해 상대의 전략을 무너뜨리세요.</p>
            <div className="v13-primary-actions">
              <button className="v13-action v13-action-primary" onClick={() => onNavigate('duel')}>
                <i><GameIcon name="duel" /></i><span><b>빠른 대전</b><small>자동 매칭 또는 친구 대전</small></span><em>PLAY</em>
              </button>
              <button className="v13-action" onClick={() => onNavigate('duel')}>
                <i className="v13-plus">+</i><span><b>방 만들기</b><small>초대 코드로 친구와 결투</small></span>
              </button>
              <button className="v13-action" onClick={() => onNavigate('deck')}>
                <i><GameIcon name="deck" /></i><span><b>덱 편집</b><small>자동 구성과 직접 편집</small></span>
              </button>
            </div>
          </div>
        </article>

        <article className="v13-deck-panel">
          <header><div><small>현재 덱</small><h2>{activeDeck?.name ?? '활성 덱 없음'}</h2></div><button aria-label="덱 편집" onClick={() => onNavigate('deck')}>✎</button></header>
          <button className="v13-deck-core" onClick={() => onNavigate('deck')} aria-label="현재 덱 열기">
            <span className="v13-deck-orbit"><i /><i /><i /><b>E</b></span>
          </button>
          <div className="v13-deck-counts">
            <span><small>메인 덱</small><b>{deckMain} / {DECK_SIZE}</b></span>
            <span><small>엑스트라 덱</small><b>{deckExtra} / {EXTRA_DECK_SIZE}</b></span>
          </div>
          <button className="v13-wide-button" onClick={() => onNavigate('deck')}>{deckReady ? '덱 상세 보기' : '덱 완성하기'} <span>›</span></button>
        </article>

        <article className="v13-feature-panel">
          <header><small>주목할 카드</small><span>{RARITY_LABEL[featureCard.rarity]}</span></header>
          <div className="v13-feature-card"><CardFace card={featureCard} /></div>
          <div className="v13-feature-caption"><b>{featureCard.name}</b><small>{featureCard.subtitle}</small><p>카드를 눌러 효과, 수치와 소환 조건을 확인하세요.</p></div>
        </article>
      </section>

      <section className="v13-secondary-grid">
        <article className="v13-simple-panel v13-join-panel">
          <div><span className="v13-kicker">JOIN PRIVATE ROOM</span><h3>코드로 참가</h3><p>친구에게 받은 6자리 방 코드가 있다면 대전 화면에서 바로 입력할 수 있습니다.</p></div>
          <button onClick={() => onNavigate('duel')}><span>ABC123</span><b>코드 입력 화면</b><em>›</em></button>
        </article>

        <article className="v13-simple-panel v13-readiness-panel">
          <header><span className="v13-kicker">DUEL READINESS</span><h3>대전 준비 상태</h3></header>
          <div className="v13-readiness-list">
            <span><small>서버 연결</small><b className={serverStatus.secureDuelReady ? 'good' : 'warn'}>{serverStatus.secureDuelReady ? '정상' : '확인 필요'}</b></span>
            <span><small>활성 덱</small><b className={deckReady ? 'good' : 'warn'}>{deckReady ? '준비 완료' : `${deckMain}/${DECK_SIZE}`}</b></span>
            <span><small>보유 카드</small><b>{hub.collection.length} / {CARDS.length}</b></span>
          </div>
          <button onClick={() => onNavigate(serverStatus.secureDuelReady && deckReady ? 'duel' : deckReady ? 'duel' : 'deck')}>{serverStatus.secureDuelReady && deckReady ? '지금 대전하기' : deckReady ? '대전 설정 확인' : '덱 확인하기'} <span>›</span></button>
        </article>

        <article className="v13-simple-panel v13-friends-panel">
          <header><div><span className="v13-kicker">FRIENDS</span><h3>친구</h3></div><button onClick={() => onNavigate('friends')}>전체 보기 ›</button></header>
          <div className="v13-friend-list">
            {friends.length > 0 ? friends.map((friend) => (
              <button key={friend.user_id} onClick={() => onNavigate('friends')}>
                <Avatar id={friend.avatar} size="small" />
                <span><b>{friend.display_name}</b><small>{friend.wins}승 {friend.losses}패 · 승률 {winRate(friend)}%</small></span>
                <em>친구</em>
              </button>
            )) : <div className="v13-empty-friends"><b>아직 등록된 친구가 없습니다.</b><small>친구 코드를 검색해 함께 결투해 보세요.</small><button onClick={() => onNavigate('friends')}>친구 추가</button></div>}
          </div>
        </article>
      </section>

      <section className="v13-footer-grid">
        <article className="v13-season-card">
          <span className="v13-kicker">SEASON PROGRESS</span><div><h3>ECLIPSE · ASCENSION</h3><b>LV.{level}</b></div>
          <div className="v13-xp-line"><span><i style={{ width: `${Math.min(100, xpInLevel / 10)}%` }} /></span><em>{xpInLevel} / 1000 XP</em></div>
        </article>
        <article className="v13-notice-card"><div><span className="v13-kicker">QUICK ACCESS</span><h3>카드 수집과 덱 연구</h3></div><p>보유 카드 {hub.collection.length}종 · 친구 {hub.friends.length}명 · 코인 {hub.wallet.coins.toLocaleString()}</p><button onClick={() => onNavigate('collection')}>보관함 열기 ›</button></article>
      </section>
    </div>
  );
}

function DeckBuilder({ hub, onHub }: { hub: HubData; onHub: (hub: HubData) => void }) {
  const defaultDeck = hub.decks.find((deck) => deck.is_active) ?? hub.decks[0];
  const [selectedDeckId, setSelectedDeckId] = useState(defaultDeck?.id ?? '');
  const [deckName, setDeckName] = useState(defaultDeck?.name ?? '새 덱');
  const [deckCards, setDeckCards] = useState<string[]>(defaultDeck?.cards ?? []);
  const [extraCards, setExtraCards] = useState<string[]>(defaultDeck?.extra_cards ?? []);
  const [search, setSearch] = useState('');
  const [kind, setKind] = useState<'all' | CardKind>('all');
  const [element, setElement] = useState<'all' | Element>('all');
  const [sort, setSort] = useState<'recommended' | 'cost' | 'rarity' | 'name'>('recommended');
  const [autoStyle, setAutoStyle] = useState<'balanced' | 'aggro' | 'control' | 'theme'>('balanced');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const collection = useMemo(() => Object.fromEntries(hub.collection.map((row) => [row.card_id, row.quantity])), [hub.collection]);
  const mainCounts = useMemo(() => countCards(deckCards), [deckCards]);
  const extraCounts = useMemo(() => countCards(extraCards), [extraCards]);
  const selectedDeck = hub.decks.find((deck) => deck.id === selectedDeckId);
  const mainValidation = validateDeck(deckCards, collection);
  const extraValidation = validateExtraDeck(extraCards, collection);
  const validation = mainValidation || extraValidation;

  useEffect(() => {
    if (!selectedDeck) {
      setDeckName('새 덱');
      setDeckCards([]);
      setExtraCards([]);
      return;
    }
    setDeckName(selectedDeck.name);
    setDeckCards(Array.isArray(selectedDeck.cards) ? selectedDeck.cards : []);
    setExtraCards(Array.isArray(selectedDeck.extra_cards) ? selectedDeck.extra_cards : []);
  }, [selectedDeckId, selectedDeck]);

  const rarityWeight: Record<Rarity, number> = { common: 1, rare: 2.2, epic: 3.6, legendary: 5.2 };
  const dominantElement = useMemo(() => {
    const score: Record<Element, number> = { solar: 0, lunar: 0, storm: 0, verdant: 0, void: 0, neutral: 0 };
    for (const card of CARDS) {
      const owned = collection[card.id] ?? 0;
      if (!owned) continue;
      score[card.element] += owned * rarityWeight[card.rarity];
    }
    return (Object.entries(score).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'solar') as Element;
  }, [collection]);

  const filtered = useMemo(() => CARDS.filter((card) => {
    if (!collection[card.id]) return false;
    if (kind !== 'all' && card.kind !== kind) return false;
    if (element !== 'all' && card.element !== element) return false;
    if (search && !`${card.name} ${card.text} ${card.subtitle} ${card.series ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'cost') return a.cost - b.cost || a.name.localeCompare(b.name, 'ko');
    if (sort === 'rarity') return rarityWeight[b.rarity] - rarityWeight[a.rarity] || a.cost - b.cost;
    if (sort === 'name') return a.name.localeCompare(b.name, 'ko');
    const score = (card: CardDefinition) => rarityWeight[card.rarity] * 7 + (card.element === dominantElement ? 5 : 0) - card.cost * 0.35;
    return score(b) - score(a);
  }), [collection, kind, element, search, sort, dominantElement]);

  function usedCopies(cardId: string): number {
    return (mainCounts[cardId] ?? 0) + (extraCounts[cardId] ?? 0);
  }

  function addCard(card: CardDefinition) {
    const max = Math.min(MAX_COPIES[card.rarity], collection[card.id] ?? 0);
    if (usedCopies(card.id) >= max) return;
    if (isExtraDeckCard(card)) {
      if (extraCards.length >= EXTRA_DECK_SIZE) return;
      setExtraCards((current) => [...current, card.id]);
    } else {
      if (deckCards.length >= DECK_SIZE) return;
      setDeckCards((current) => [...current, card.id]);
    }
    playUiSound('card');
  }

  function removeMain(cardId: string) {
    setDeckCards((current) => {
      const index = current.lastIndexOf(cardId);
      return index < 0 ? current : [...current.slice(0, index), ...current.slice(index + 1)];
    });
    playUiSound('remove');
  }

  function removeExtra(cardId: string) {
    setExtraCards((current) => {
      const index = current.lastIndexOf(cardId);
      return index < 0 ? current : [...current.slice(0, index), ...current.slice(index + 1)];
    });
    playUiSound('remove');
  }

  function clearDeck() {
    setDeckCards([]);
    setExtraCards([]);
    setMessage('덱을 비웠습니다. 자동 구성 또는 카드 추가로 다시 채울 수 있습니다.');
    playUiSound('remove');
  }

  function scoreCard(card: CardDefinition, style: typeof autoStyle, primary: Element): number {
    let score = rarityWeight[card.rarity] * 10;
    score += card.element === primary ? (style === 'theme' ? 20 : 8) : 0;
    score += card.series ? 2 : 0;
    if (card.summonMode === 'rift') score += 5;
    if (card.keywords?.includes('charge')) score += style === 'aggro' ? 12 : 3;
    if (card.keywords?.includes('pierce')) score += style === 'aggro' ? 10 : 4;
    if (card.keywords?.includes('guard')) score += style === 'control' ? 12 : 3;
    if (card.keywords?.includes('lifesteal')) score += style === 'control' ? 8 : 4;
    if (card.onSummon?.kind === 'draw' || card.effect?.kind === 'draw') score += style === 'control' ? 10 : 5;
    if (card.onSummon?.kind === 'heal_core' || card.effect?.kind === 'heal_core') score += style === 'control' ? 8 : 2;
    if (card.onSummon?.kind === 'damage_core' || card.effect?.kind === 'damage_core') score += style === 'aggro' ? 10 : 3;
    if (card.effect?.kind === 'aoe_enemy' || card.onSummon?.kind === 'aoe_enemy') score += 8;
    if (card.kind === 'unit') {
      const body = (card.attack ?? 0) + (card.health ?? 0);
      score += body * 0.7;
      if (style === 'aggro') score -= card.cost * 1.8;
      if (style === 'control') score += card.cost * 0.25;
    }
    if (card.kind === 'trap') score += style === 'control' ? 9 : 1;
    return score;
  }

  function autoBuild(style: typeof autoStyle) {
    const primary = element !== 'all' ? element : dominantElement;
    const targets = style === 'aggro'
      ? { unit: 20, spell: 7, trap: 3 }
      : style === 'control'
        ? { unit: 16, spell: 7, trap: 7 }
        : { unit: 18, spell: 7, trap: 5 };
    const counts: Record<string, number> = {};
    const nextMain: string[] = [];
    const mainPool = CARDS.filter((card) => !isExtraDeckCard(card) && (collection[card.id] ?? 0) > 0)
      .sort((a, b) => scoreCard(b, style, primary) - scoreCard(a, style, primary));

    const addFromKind = (cardKind: 'unit' | 'spell' | 'trap', wanted: number) => {
      for (const card of mainPool.filter((item) => item.kind === cardKind)) {
        if (nextMain.filter((id) => CARD_BY_ID[id]?.kind === cardKind).length >= wanted) break;
        const owned = collection[card.id] ?? 0;
        const limit = Math.min(MAX_COPIES[card.rarity], owned);
        const desiredCopies = card.rarity === 'legendary' ? 1 : card.rarity === 'epic' ? Math.min(2, limit) : Math.min(style === 'theme' && card.element === primary ? 3 : 2, limit);
        for (let index = counts[card.id] ?? 0; index < desiredCopies; index += 1) {
          if (nextMain.filter((id) => CARD_BY_ID[id]?.kind === cardKind).length >= wanted) break;
          nextMain.push(card.id);
          counts[card.id] = (counts[card.id] ?? 0) + 1;
        }
      }
    };

    addFromKind('unit', targets.unit);
    addFromKind('spell', targets.spell);
    addFromKind('trap', targets.trap);

    for (const card of mainPool) {
      if (nextMain.length >= DECK_SIZE) break;
      const owned = collection[card.id] ?? 0;
      const limit = Math.min(MAX_COPIES[card.rarity], owned);
      while ((counts[card.id] ?? 0) < limit && nextMain.length < DECK_SIZE) {
        nextMain.push(card.id);
        counts[card.id] = (counts[card.id] ?? 0) + 1;
      }
    }

    const extraPool = CARDS.filter((card) => isExtraDeckCard(card) && (collection[card.id] ?? 0) > 0)
      .sort((a, b) => scoreCard(b, style, primary) - scoreCard(a, style, primary));
    const nextExtra: string[] = [];
    const extraUse: Record<string, number> = {};
    for (const card of extraPool) {
      if (nextExtra.length >= EXTRA_DECK_SIZE) break;
      const limit = Math.min(MAX_COPIES[card.rarity], collection[card.id] ?? 0);
      while ((extraUse[card.id] ?? 0) < limit && nextExtra.length < EXTRA_DECK_SIZE) {
        nextExtra.push(card.id);
        extraUse[card.id] = (extraUse[card.id] ?? 0) + 1;
      }
    }

    setDeckCards(nextMain.slice(0, DECK_SIZE));
    setExtraCards(nextExtra.slice(0, EXTRA_DECK_SIZE));
    const styleLabel = { balanced: '균형형', aggro: '속공형', control: '컨트롤형', theme: `${ELEMENT_LABEL[primary]} 테마형` }[style];
    const ready = nextMain.length >= DECK_SIZE && nextExtra.length >= EXTRA_DECK_SIZE;
    setMessage(ready ? `${styleLabel} 추천 덱을 완성했습니다. 저장 전에 카드 구성을 확인해보세요.` : `${styleLabel} 자동 구성을 적용했습니다. 보유 카드가 부족한 슬롯은 직접 채워주세요.`);
    playUiSound('auto');
  }

  async function saveDeck() {
    setBusy(true);
    setMessage('');
    try {
      const result = await api('save_deck', { deckId: selectedDeckId, name: deckName, cards: deckCards, extraCards });
      if (result.hub) onHub(result.hub);
      setMessage('덱을 저장했습니다.');
      playUiSound('save');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '저장에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function activateDeck() {
    if (!selectedDeckId) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await api('set_active_deck', { deckId: selectedDeckId });
      if (result.hub) onHub(result.hub);
      setMessage('이 덱을 대전에 사용합니다.');
      playUiSound('success');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '활성화에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  const unitCount = deckCards.filter((id) => CARD_BY_ID[id]?.kind === 'unit').length;
  const spellCount = deckCards.filter((id) => CARD_BY_ID[id]?.kind === 'spell').length;
  const trapCount = deckCards.filter((id) => CARD_BY_ID[id]?.kind === 'trap').length;

  return (
    <div className="v9-deck-page">
      <section className="v9-deck-top">
        <div>
          <span className="eyebrow">DECK STUDIO</span>
          <h2>덱 구성</h2>
          <p>보유 카드에서 30장 + 엑스트라 6장을 고릅니다. 처음이라면 자동 구성을 먼저 사용해보세요.</p>
        </div>
        <div className={`v9-deck-ready ${validation ? 'invalid' : 'valid'}`}>
          <b>{validation ? '구성 중' : '대전 가능'}</b>
          <span>MAIN {deckCards.length}/{DECK_SIZE}</span>
          <span>EXTRA {extraCards.length}/{EXTRA_DECK_SIZE}</span>
        </div>
      </section>

      <section className="v9-auto-builder panel">
        <div className="v9-auto-copy">
          <span className="eyebrow">AUTO BUILD</span>
          <h3>자동으로 덱 짜기</h3>
          <p>보유 카드와 카드 성능을 분석해 규칙에 맞는 덱을 즉시 구성합니다.</p>
        </div>
        <div className="v9-auto-controls">
          <div className="v9-style-pills">
            {([
              ['balanced', '균형형'], ['aggro', '속공형'], ['control', '컨트롤형'], ['theme', `${ELEMENT_LABEL[element !== 'all' ? element : dominantElement]} 테마`],
            ] as Array<[typeof autoStyle, string]>).map(([id, label]) => (
              <button key={id} className={autoStyle === id ? 'active' : ''} onClick={() => setAutoStyle(id)}>{label}</button>
            ))}
          </div>
          <button className="v9-auto-button" onClick={() => autoBuild(autoStyle)}>추천 덱 자동 구성</button>
        </div>
      </section>

      <section className="v9-deck-manager panel">
        <div className="v9-deck-select-row">
          <select value={selectedDeckId} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedDeckId(event.target.value)}>
            {hub.decks.map((deck) => <option key={deck.id} value={deck.id}>{deck.is_active ? '★ ' : ''}{deck.name}</option>)}
            <option value="">＋ 새 덱</option>
          </select>
          <input value={deckName} onChange={(event: ChangeEvent<HTMLInputElement>) => setDeckName(event.target.value)} maxLength={24} placeholder="덱 이름" />
          <div className="v9-deck-counts"><span>유닛 <b>{unitCount}</b></span><span>주문 <b>{spellCount}</b></span><span>함정 <b>{trapCount}</b></span></div>
          <button className="v9-clear-button" onClick={clearDeck}>비우기</button>
        </div>
        {message && <p className="v9-deck-message">{message}</p>}
        {validation && <p className="v9-validation">{validation}</p>}
      </section>

      <div className="v9-deck-workspace">
        <section className="v9-card-library panel">
          <header className="v9-library-head"><div><h3>내 카드</h3><small>{filtered.length}종 표시</small></div><span>카드를 누르면 덱에 추가됩니다.</span></header>
          <div className="v9-filter-row">
            <input value={search} onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} placeholder="카드 검색" />
            <select value={kind} onChange={(event: ChangeEvent<HTMLSelectElement>) => setKind(event.target.value as 'all' | CardKind)}>
              <option value="all">모든 종류</option><option value="unit">유닛</option><option value="spell">주문</option><option value="trap">함정</option><option value="fusion">공명 융합</option><option value="evolution">계승 진화</option>
            </select>
            <select value={element} onChange={(event: ChangeEvent<HTMLSelectElement>) => setElement(event.target.value as 'all' | Element)}>
              <option value="all">모든 속성</option>{Object.entries(ELEMENT_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
            <select value={sort} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSort(event.target.value as typeof sort)}>
              <option value="recommended">추천순</option><option value="cost">비용순</option><option value="rarity">등급순</option><option value="name">이름순</option>
            </select>
          </div>
          <div className="collection-grid deck-grid v9-card-grid">
            {filtered.map((card) => {
              const max = Math.min(MAX_COPIES[card.rarity], collection[card.id] ?? 0);
              const full = usedCopies(card.id) >= max || (isExtraDeckCard(card) ? extraCards.length >= EXTRA_DECK_SIZE : deckCards.length >= DECK_SIZE);
              return <CardFace key={card.id} card={card} compact quantity={Math.max(0, (collection[card.id] ?? 0) - usedCopies(card.id))} disabled={full} onClick={() => addCard(card)} />;
            })}
          </div>
        </section>

        <aside className="v9-current-deck panel">
          <header className="v9-current-head"><div><span className="eyebrow">CURRENT DECK</span><h3>{deckName || '새 덱'}</h3></div><div><b>{deckCards.length}</b><small>/ {DECK_SIZE}</small></div></header>
          <div className="v9-deck-list-scroll">
            {Object.entries(mainCounts).sort(([a], [b]) => (CARD_BY_ID[a]?.cost ?? 0) - (CARD_BY_ID[b]?.cost ?? 0)).map(([cardId, quantity]) => {
              const card = CARD_BY_ID[cardId];
              if (!card) return null;
              return <button className="v9-deck-row" key={cardId} onClick={() => removeMain(cardId)} style={cardStyle(card)}><i>{card.cost}</i><span><b>{card.name}</b><small>{ELEMENT_LABEL[card.element]} · {KIND_LABEL[card.kind]}</small></span><strong>×{quantity}</strong><em>−</em></button>;
            })}
            {deckCards.length === 0 && <div className="v9-empty-deck"><b>아직 카드가 없습니다.</b><span>자동 구성 버튼을 누르거나 왼쪽 카드에서 추가하세요.</span></div>}
          </div>

          <div className="v9-extra-zone">
            <div className="v9-extra-title"><span>EXTRA DECK</span><b>{extraCards.length}/{EXTRA_DECK_SIZE}</b></div>
            <div className="v9-extra-grid">
              {extraCards.map((cardId, index) => {
                const card = CARD_BY_ID[cardId];
                return card ? <CardFace key={`${cardId}-${index}`} card={card} compact onClick={() => removeExtra(cardId)} /> : null;
              })}
              {Array.from({ length: Math.max(0, EXTRA_DECK_SIZE - extraCards.length) }, (_, index) => <span className="v9-extra-empty" key={index}>＋</span>)}
            </div>
          </div>

          <div className="v9-deck-actions">
            <button className="ghost-button" disabled={!selectedDeckId || selectedDeck?.is_active || busy || Boolean(validation)} onClick={activateDeck}>대전 덱으로 지정</button>
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
  const [openingPackId, setOpeningPackId] = useState('');
  const [openingStage, setOpeningStage] = useState<'idle' | 'sealed' | 'tearing' | 'reveal' | 'summary'>('idle');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [error, setError] = useState('');
  const selectedPack = PACKS.find((pack) => pack.id === openingPackId);

  async function buy(packId: string) {
    setBusyPack(packId);
    setError('');
    try {
      const result = await api('buy_pack', { packId });
      if (result.hub) onHub(result.hub);
      const cards = result.cardIds ?? [];
      if (cards.length === 0) throw new Error('팩에서 카드를 불러오지 못했습니다.');
      preloadCardArtwork(cards);
      setOpeningPackId(packId);
      setOpened(cards);
      setRevealed(cards.map(() => false));
      setActiveCardIndex(0);
      setOpeningStage('sealed');
      playUiSound('pack');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '팩 구매에 실패했습니다.');
    } finally {
      setBusyPack('');
    }
  }

  function tearPack() {
    if (openingStage !== 'sealed') return;
    playUiSound('pack');
    setOpeningStage('tearing');
    window.setTimeout(() => setOpeningStage('reveal'), 1050);
  }

  function revealCurrent() {
    if (openingStage !== 'reveal') return;
    playUiSound('reveal');
    setRevealed((current) => current.map((value, index) => index === activeCardIndex ? true : value));
  }

  function advanceOpening() {
    if (!revealed[activeCardIndex]) return;
    if (activeCardIndex < opened.length - 1) setActiveCardIndex((index) => index + 1);
    else setOpeningStage('summary');
  }

  function revealAll() {
    setRevealed(opened.map(() => true));
    setOpeningStage('summary');
  }

  function closeOpening() {
    setOpened([]);
    setRevealed([]);
    setOpeningPackId('');
    setOpeningStage('idle');
    setActiveCardIndex(0);
  }

  return (
    <div className="view-stack v6-shop-view">
      <section className="section-heading v6-section-heading">
        <div><span className="eyebrow">ECLIPSE PACK LAB</span><h2>카드 팩 상점</h2><p>팩을 찢고, 카드를 한 장씩 뒤집어 새로운 전략을 획득하세요.</p></div>
        <div className="currency-pill"><small>COIN</small>{hub.wallet.coins.toLocaleString()}</div>
      </section>
      {error && <p className="error-banner">{error}</p>}
      <section className="pack-grid v6-pack-grid">
        {PACKS.map((pack, index) => (
          <article className={`pack-card v6-pack-card pack-${index}`} key={pack.id} style={{ '--pack-accent': pack.accent } as CSSProperties}>
            <div className="pack-product-visual" aria-hidden="true"><span className="pack-foil" /><span className="pack-seal">{pack.id === 'ascension' ? '∞' : index === 0 ? '✦' : index === 1 ? '♜' : index === 2 ? '☀' : index === 3 ? '◉' : '♛'}</span><b>ECLIPSE</b><small>5 CARD BOOSTER</small></div>
            <div className="pack-product-copy">
              <span className="eyebrow">5 CARDS · {RARITY_LABEL[pack.guaranteed]} 이상 보장</span>
              <h3>{pack.name}</h3>
              <p>{pack.tagline}</p>
              <div className="pack-price"><b>{pack.price}</b> COIN</div>
              <button className="primary-button" disabled={busyPack === pack.id || hub.wallet.coins < pack.price} onClick={() => buy(pack.id)}>
                {busyPack === pack.id ? '팩을 준비하는 중...' : hub.wallet.coins < pack.price ? '코인 부족' : '팩 구매 및 개봉'}
              </button>
            </div>
          </article>
        ))}
      </section>

      {openingStage !== 'idle' && opened.length > 0 && (
        <div className={`modal-layer pack-experience-layer stage-${openingStage}`}>
          <section className="pack-experience-modal" style={{ '--pack-accent': selectedPack?.accent ?? '#7c8cff' } as CSSProperties}>
            <header className="pack-experience-header"><div><span>PACK OPENING</span><h2>{selectedPack?.name ?? 'ECLIPSE PACK'}</h2></div><button className="modal-close" type="button" onClick={closeOpening} aria-label="팩 개봉 화면 닫기">×</button></header>

            {(openingStage === 'sealed' || openingStage === 'tearing') && (
              <div className="sealed-pack-stage">
                <div className="pack-light-burst" />
                <button className={`physical-pack ${openingStage === 'tearing' ? 'is-tearing' : ''}`} type="button" onClick={tearPack} aria-label="카드 팩 뜯기">
                  <span className="physical-pack-top" />
                  <span className="physical-pack-foil" />
                  <span className="physical-pack-logo">ECLIPSE</span>
                  <span className="physical-pack-title">{selectedPack?.name}</span>
                  <span className="physical-pack-count">5 CARDS</span>
                  <span className="physical-pack-tear-line"><i /></span>
                </button>
                <div className="pack-opening-guide"><b>{openingStage === 'sealed' ? '팩을 눌러 봉인을 뜯으세요' : '봉인을 해제하는 중...'}</b><span>{openingStage === 'sealed' ? '클릭 또는 탭' : '카드 에너지를 전개합니다'}</span></div>
              </div>
            )}

            {openingStage === 'reveal' && (
              <div className="single-card-reveal-stage">
                <div className="reveal-progress"><span>{activeCardIndex + 1} / {opened.length}</span><div>{opened.map((_, index) => <i key={index} className={index < activeCardIndex || revealed[index] ? 'done' : index === activeCardIndex ? 'active' : ''} />)}</div></div>
                <div className={`reveal-card-focus ${revealed[activeCardIndex] ? 'is-revealed' : ''}`}>
                  <div className="card-stack-shadow shadow-a" /><div className="card-stack-shadow shadow-b" />
                  <CardFace
                    card={CARD_BY_ID[opened[activeCardIndex]]}
                    hidden={!revealed[activeCardIndex]}
                    onClick={revealed[activeCardIndex] ? () => requestCardInspection(opened[activeCardIndex]) : revealCurrent}
                    inspectable={revealed[activeCardIndex]}
                  />
                  {!revealed[activeCardIndex] && <span className="reveal-tap-label">카드를 눌러 공개</span>}
                </div>
                <div className="reveal-actions">
                  <button className="ghost-button" type="button" onClick={revealAll}>모두 공개</button>
                  <button className="primary-button" type="button" disabled={!revealed[activeCardIndex]} onClick={advanceOpening}>{activeCardIndex < opened.length - 1 ? '다음 카드' : '결과 확인'}</button>
                </div>
              </div>
            )}

            {openingStage === 'summary' && (
              <div className="pack-summary-stage">
                <div className="summary-burst"><span>PACK COMPLETE</span><h3>새로운 카드 5장을 획득했습니다</h3><p>카드를 누르면 상세 효과와 소환 조건을 확인할 수 있습니다.</p></div>
                <div className="summary-card-row">{opened.map((cardId, index) => <div style={{ '--delay': index } as CSSProperties} key={`${cardId}-${index}`}><CardFace card={CARD_BY_ID[cardId]} compact /></div>)}</div>
                <button className="primary-button summary-close" type="button" onClick={closeOpening}>보관함에 저장하고 닫기</button>
              </div>
            )}
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

function DuelEffectLayer({ event }: { event: VisualEvent | null }) {
  if (!event) return null;
  const card = event.cardId ? CARD_BY_ID[event.cardId] : undefined;
  return (
    <div className={`duel-vfx-layer event-${event.kind}`} key={event.id} aria-hidden="true">
      <div className={`duel-vfx vfx-${event.vfx} element-${card?.element ?? 'neutral'} kind-${event.kind}`} style={card ? cardStyle(card) : undefined}>
        <span className="vfx-ring ring-a" />
        <span className="vfx-ring ring-b" />
        <span className="vfx-beam beam-a" />
        <span className="vfx-beam beam-b" />
        <span className="vfx-particles">
          {Array.from({ length: 18 }, (_, index) => <i key={index} style={{ '--i': index } as CSSProperties} />)}
        </span>
        <strong>{card?.sigil ?? (event.kind === 'fusion' ? '∞' : event.kind === 'evolution' ? '△' : '◈')}</strong>
        <b>{event.label ?? card?.name ?? ''}</b>
        {event.amount !== undefined && event.amount > 0 && <em>{event.amount}</em>}
      </div>
    </div>
  );
}

function UnitSlot({
  unit,
  owner,
  index,
  selected,
  materialSelected,
  enemy,
  onClick,
}: {
  unit: UnitState | null;
  owner: string;
  index: number;
  selected?: boolean;
  materialSelected?: boolean;
  enemy?: boolean;
  onClick?: () => void;
}) {
  const card = unit ? CARD_BY_ID[unit.cardId] : undefined;
  return (
    <button
      className={`unit-slot ${unit ? 'occupied' : ''} ${selected ? 'selected' : ''} ${materialSelected ? 'material-selected' : ''} ${enemy ? 'enemy' : ''} ${unit ? `origin-${unit.summonedBy}` : ''} ${card ? `element-${card.element}` : ''}`}
      onClick={onClick}
      data-owner={owner}
      data-index={index}
    >
      {!unit ? <span className="slot-mark">{index + 1}</span> : (
        <>
          <span className={`unit-art ${card ? `variant-${hashString(card.id) % 6}` : ''}`} style={card ? cardStyle(card) : undefined}><strong>{card?.sigil ?? '✦'}</strong><i /></span>
          {card && <span className="unit-info-hotspot" role="button" tabIndex={0} aria-label={`${card.name} 상세 정보`} onClick={(event: React.MouseEvent) => { event.preventDefault(); event.stopPropagation(); requestCardInspection(card.id); }} onKeyDown={(event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); requestCardInspection(card.id); } }}>i</span>}
          {unit.summonedBy !== 'normal' && unit.summonedBy !== 'token' && <span className={`origin-badge ${unit.summonedBy}`}>{unit.summonedBy === 'rift' ? 'RIFT' : unit.summonedBy === 'fusion' ? 'FUSION' : 'EVOLVE'}</span>}
          <span className="unit-name">{card?.name ?? unit.cardId.replace('token:', '')}</span>
          <span className="unit-stats"><b>{unit.attack}</b><i>⚔</i><b>{unit.health}</b>{unit.shield > 0 && <em>＋{unit.shield}</em>}</span>
          {!unit.canAttack && <span className="unit-state">REST</span>}
          {materialSelected && <span className="material-mark">MATERIAL</span>}
        </>
      )}
    </button>
  );
}

function extraRequirement(card: CardDefinition): string {
  if (card.kind === 'fusion') return card.fusionRecipe?.label ?? '융합 소재를 선택하세요.';
  if (card.kind === 'evolution') return card.evolutionRecipe?.label ?? '진화시킬 유닛을 선택하세요.';
  if (card.summonMode === 'rift') return card.riftCondition?.label ?? '균열 조건을 확인하세요.';
  return card.text;
}


function CoinTossOverlay({ state, profiles, userId, now }: { state: MatchState; profiles: RoomProfile[]; userId: string; now: number }) {
  const toss = state.coinToss;
  if (!toss || now >= toss.endsAt) return null;
  const elapsed = Math.max(0, now - toss.startedAt);
  const revealed = elapsed >= 2600;
  const winner = profiles.find((profile) => profile.user_id === toss.winnerId);
  const isMe = toss.winnerId === userId;
  return (
    <div className={`coin-toss-overlay side-${toss.side} ${revealed ? 'is-revealed' : ''}`}>
      <div className="coin-toss-space" aria-hidden="true"><span className="coin-orbit orbit-a" /><span className="coin-orbit orbit-b" /><span className="coin-spark spark-a" /><span className="coin-spark spark-b" /></div>
      <div className="coin-toss-copy"><small>FIRST TURN DECISION</small><h2>{revealed ? '선공이 결정되었습니다' : '운명의 코인을 던집니다'}</h2><p>{revealed ? `${toss.side === 'solar' ? '태양면' : '월식면'} · ${isMe ? '당신' : winner?.display_name ?? '상대'}이(가) 선공입니다.` : '두 플레이어의 시작 순서를 공정하게 결정합니다.'}</p></div>
      <div className="duel-coin" aria-hidden="true"><span className="coin-face coin-front"><b>☀</b><small>SOLAR</small></span><span className="coin-face coin-back"><b>◐</b><small>ECLIPSE</small></span><i /></div>
      <div className="coin-result"><span>{revealed ? (isMe ? 'YOU GO FIRST' : 'OPPONENT GOES FIRST') : 'FLIPPING'}</span><div><i /></div></div>
    </div>
  );
}

function DuelBoard({ payload, userId, onRefresh, onLeave }: { payload: RoomPayload; userId: string; onRefresh: (payload: RoomPayload) => void; onLeave: () => void }) {
  const { room, privateState: nullablePrivateState } = payload;
  const nullableState = room.state;
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [selectedExtra, setSelectedExtra] = useState<string | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
  const [selectedAttacker, setSelectedAttacker] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [logOpen, setLogOpen] = useState(false);
  const [activeVfx, setActiveVfx] = useState<VisualEvent | null>(null);
  const [vfxQueue, setVfxQueue] = useState<VisualEvent[]>([]);
  const [coinClock, setCoinClock] = useState(() => Date.now());
  const seenVfx = useRef<Set<string>>(new Set());

  const visualEvents = nullableState?.visualEvents ?? [];
  const visualEventSignature = visualEvents.map((event) => event.id).join('|');

  useEffect(() => {
    let unseen = visualEvents.filter((event) => !seenVfx.current.has(event.id));
    if (unseen.length === 0) return;
    if (seenVfx.current.size === 0 && unseen.length > 1) unseen = unseen.slice(-1);
    visualEvents.forEach((event) => seenVfx.current.add(event.id));
    setVfxQueue((current) => [...current, ...unseen].slice(-10));
  }, [visualEventSignature]);

  useEffect(() => {
    const endsAt = nullableState?.coinToss?.endsAt;
    if (!endsAt || Date.now() >= endsAt) {
      setCoinClock(Date.now());
      return;
    }
    setCoinClock(Date.now());
    const timer = window.setInterval(() => setCoinClock(Date.now()), 100);
    return () => window.clearInterval(timer);
  }, [nullableState?.coinToss?.endsAt]);

  useEffect(() => {
    if (activeVfx || vfxQueue.length === 0) return;
    const [next, ...rest] = vfxQueue;
    setVfxQueue(rest);
    setActiveVfx(next);
    const timer = window.setTimeout(() => {
      setActiveVfx((current) => current?.id === next.id ? null : current);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [activeVfx, vfxQueue]);

  if (!nullableState || !nullablePrivateState || nullableState.playerOrder.length !== 2) return <LoadingScreen text="결투 상태를 동기화하는 중" />;
  const state = nullableState;
  const privateState = nullablePrivateState;

  const opponentId = state.playerOrder.find((id) => id !== userId) ?? '';
  const profileMap = Object.fromEntries(payload.profiles.map((profile) => [profile.user_id, profile]));
  const me = profileMap[userId];
  const opponent = profileMap[opponentId];
  const coinTossActive = Boolean(state.coinToss && coinClock < state.coinToss.endsAt);
  const myTurn = state.currentPlayerId === userId && !coinTossActive;
  const selectedInstance = privateState.hand.find((card) => card.instanceId === selectedHand);
  const selectedCard = selectedInstance ? CARD_BY_ID[selectedInstance.cardId] : undefined;
  const selectedExtraInstance = privateState.extra.find((card) => card.instanceId === selectedExtra);
  const selectedExtraCard = selectedExtraInstance ? CARD_BY_ID[selectedExtraInstance.cardId] : undefined;
  const requiredMaterials = selectedExtraCard?.kind === 'fusion' ? selectedExtraCard.fusionRecipe?.materials.length ?? 0 : selectedExtraCard?.kind === 'evolution' ? 1 : 0;
  const canExtraSummon = Boolean(selectedExtraCard && selectedExtra && selectedMaterials.length === requiredMaterials && myTurn && state.phase === 'main' && !busy);

  async function gameAction(gameAction: string, extra: Record<string, unknown> = {}) {
    setBusy(true);
    setMessage('');
    try {
      const result = await api('game_action', { roomId: room.id, gameAction, ...extra });
      if (result.room && result.profiles) onRefresh({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null });
      setSelectedHand(null);
      setSelectedExtra(null);
      setSelectedMaterials([]);
      setSelectedAttacker(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '행동 처리 실패');
    } finally {
      setBusy(false);
    }
  }

  function chooseHand(instanceId: string) {
    setSelectedHand((current) => current === instanceId ? null : instanceId);
    setSelectedExtra(null);
    setSelectedMaterials([]);
    setSelectedAttacker(null);
  }

  function chooseExtra(instanceId: string) {
    setSelectedExtra((current) => current === instanceId ? null : instanceId);
    setSelectedHand(null);
    setSelectedMaterials([]);
    setSelectedAttacker(null);
  }

  function playToUnitZone(zone: number) {
    if (!selectedCard || selectedCard.kind !== 'unit' || !selectedHand) return;
    gameAction('play_card', { instanceId: selectedHand, zone });
  }

  function playToSecretZone(zone: number) {
    if (!selectedCard || selectedCard.kind !== 'trap' || !selectedHand) return;
    gameAction('play_card', { instanceId: selectedHand, zone });
  }

  function toggleMaterial(unitIndex: number) {
    if (!selectedExtraCard || !state.boards[userId].units[unitIndex]) return;
    const limit = selectedExtraCard.kind === 'fusion' ? selectedExtraCard.fusionRecipe?.materials.length ?? 0 : 1;
    setSelectedMaterials((current) => {
      if (current.includes(unitIndex)) return current.filter((item) => item !== unitIndex);
      if (limit <= 1) return [unitIndex];
      if (current.length >= limit) return [...current.slice(1), unitIndex];
      return [...current, unitIndex];
    });
  }

  function targetUnit(ownerId: string, unitIndex: number) {
    if (selectedExtraCard && ownerId === userId && state.phase === 'main') {
      toggleMaterial(unitIndex);
      return;
    }
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

  function summonSelectedExtra() {
    if (!selectedExtra || !canExtraSummon) return;
    gameAction('extra_summon', { extraInstanceId: selectedExtra, materialZones: selectedMaterials });
  }

  return (
    <div className="duel-screen ascension-duel-screen">
      <DuelEffectLayer event={activeVfx} />
      <CoinTossOverlay state={state} profiles={payload.profiles} userId={userId} now={coinClock} />
      <div className="orientation-hint"><span>↻</span><b>기기를 가로로 돌려주세요</b><small>결투장은 가로 화면에 최적화되어 있습니다.</small></div>
      <header className="duel-topbar">
        <div className="duelist opponent"><Avatar id={opponent?.avatar} /><span><small>OPPONENT</small><b>{opponent?.display_name ?? '상대'}</b></span></div>
        <div className="turn-orb"><small>{coinTossActive ? 'OPENING CEREMONY' : `TURN ${state.turnNumber}`}</small><b>{coinTossActive ? 'COIN TOSS' : myTurn ? 'YOUR TURN' : 'OPPONENT TURN'}</b><span>{coinTossActive ? 'FIRST PLAYER DECISION' : state.phase === 'main' ? 'MAIN PHASE' : 'BATTLE PHASE'}</span></div>
        <div className="duel-top-actions"><button className={`log-toggle ${logOpen ? 'active' : ''}`} onClick={() => setLogOpen((value) => !value)}>LOG</button><button className="surrender-button" disabled={busy} onClick={() => confirm('항복하시겠습니까?') && gameAction('surrender')}>항복</button></div>
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
          <div className="deck-piles"><span>상대 덱 <b>{state.deckCounts[opponentId]}</b></span><span>상대 엑스트라 <b>{state.extraCounts?.[opponentId] ?? 0}</b></span><span>상대 묘지 <b>{state.graveyards[opponentId]?.length ?? 0}</b></span></div>
          <div className="deck-piles mine"><span>내 묘지 <b>{state.graveyards[userId]?.length ?? 0}</b></span><span>내 엑스트라 <b>{state.extraCounts?.[userId] ?? privateState.extra.length}</b></span><span>내 덱 <b>{state.deckCounts[userId]}</b></span></div>
        </div>

        <div className="zone-row my-units">
          {state.boards[userId].units.map((unit, index) => (
            <UnitSlot
              key={index}
              unit={unit}
              owner={userId}
              index={index}
              selected={selectedAttacker === index}
              materialSelected={selectedMaterials.includes(index)}
              onClick={() => unit ? targetUnit(userId, index) : playToUnitZone(index)}
            />
          ))}
        </div>
        <div className="zone-row my-secrets">
          {state.boards[userId].secrets.map((secret, index) => <button className={`secret-slot ${secret ? 'set' : ''}`} key={index} onClick={() => !secret && playToSecretZone(index)}>{secret ? <CardFace hidden compact /> : <span>{index + 1}</span>}</button>)}
        </div>

        <div className="core-panel my-core">
          <div className="energy"><span>ENERGY</span><b>{state.energy[userId]?.current ?? 0}/{state.energy[userId]?.max ?? 0}</b></div>
          <div><span>YOUR CORE</span><strong>{state.core[userId]}</strong></div>
        </div>
      </section>

      <section className="duel-controls ascension-controls">
        <div className="duelist me"><Avatar id={me?.avatar} /><span><small>YOU</small><b>{me?.display_name ?? '나'}</b></span></div>
        <div className="hand-and-extra">
          <div className="hand-zone">
            {privateState.hand.map((instance) => <CardFace key={instance.instanceId} card={CARD_BY_ID[instance.cardId]} compact selected={selectedHand === instance.instanceId} disabled={!myTurn || state.phase !== 'main' || busy} onClick={() => chooseHand(instance.instanceId)} />)}
          </div>
          <div className="extra-zone">
            <header><span>EXTRA</span><b>{privateState.extra.length}</b></header>
            <div>{privateState.extra.map((instance) => <CardFace key={instance.instanceId} card={CARD_BY_ID[instance.cardId]} compact selected={selectedExtra === instance.instanceId} disabled={!myTurn || state.phase !== 'main' || busy} onClick={() => chooseExtra(instance.instanceId)} />)}</div>
          </div>
        </div>
        <div className="phase-controls">
          {selectedCard && (
            <div className={`selected-card-action ${selectedCard.summonMode === 'rift' ? 'rift' : ''}`}>
              <b>{selectedCard.name}</b>
              <small>{selectedCard.summonMode === 'rift' ? `균열 조건 · ${extraRequirement(selectedCard)}` : selectedCard.text}</small>
              {selectedCard.kind === 'spell' && (selectedCard.target === 'none' || selectedCard.target === 'enemy_core') && <button onClick={activateSelectedNoTarget}>발동</button>}
            </div>
          )}
          {selectedExtraCard && (
            <div className={`selected-card-action extra-action ${selectedExtraCard.kind}`}>
              <b>{selectedExtraCard.name}</b>
              <small>{extraRequirement(selectedExtraCard)}</small>
              <span>소재 선택 {selectedMaterials.length}/{requiredMaterials}</span>
              <button disabled={!canExtraSummon} onClick={summonSelectedExtra}>{selectedExtraCard.kind === 'fusion' ? '공명 융합' : '계승 진화'}</button>
            </div>
          )}
          {message && <p>{message}</p>}
          {state.status === 'active' && (
            <>
              {state.phase === 'main' && <button className="battle-button" disabled={!myTurn || busy} onClick={() => gameAction('battle_phase')}>전투 단계</button>}
              <button className="end-turn-button" disabled={!myTurn || busy} onClick={() => gameAction('end_turn')}>턴 종료</button>
            </>
          )}
        </div>
      </section>

      <aside className={`battle-log ${logOpen ? 'open' : ''}`}>
        <header><span>DUEL LOG</span><button onClick={() => setLogOpen(false)}>×</button></header>
        <div>{state.logs.slice(-12).reverse().map((log) => <p className={`tone-${log.tone}`} key={log.id}>{log.text}</p>)}</div>
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


function DuelView({ userId, hub, roomPayload, onRoom, onHub, serverStatus }: { userId: string; hub: HubData; roomPayload: RoomPayload | null; onRoom: (room: RoomPayload | null) => void; onHub: (hub: HubData) => void; serverStatus: SecureServerStatus }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function roomAction(action: string, payload: Record<string, unknown> = {}) {
    if (!serverStatus.secureDuelReady) {
      setMessage(serverStatus.message);
      return undefined;
    }
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
      {!serverStatus.secureDuelReady && (
        <section className="duel-server-panel panel">
          <div className="duel-server-emblem">!</div>
          <div><span>SECURE DUEL SERVER</span><h2>온라인 대전 연결이 아직 완료되지 않았습니다.</h2><p>{serverStatus.message}</p></div>
          <ol>
            <li><b>1</b><span>현재 Supabase 프로젝트의 <code>sb_secret_...</code> 키 복사</span></li>
            <li><b>2</b><span>Render의 <code>SUPABASE_SECRET_KEY</code>에 저장</span></li>
            <li><b>3</b><span>Clear build cache &amp; deploy 실행</span></li>
          </ol>
          <small>로그인·덱 구성·상점·보관함·친구·채팅은 이 상태에서도 정상 작동합니다.</small>
        </section>
      )}
      <section className={`duel-mode-grid ${serverStatus.secureDuelReady ? '' : 'is-disabled'}`}>
        <button className="mode-card ranked" disabled={busy || !activeDeck || !serverStatus.secureDuelReady} onClick={() => roomAction('quick_match')}><span>RANKED</span><h3>빠른 대전</h3><p>대기 중인 상대를 찾아 자동으로 연결합니다.</p><em>매칭 시작 →</em></button>
        <button className="mode-card private" disabled={busy || !activeDeck || !serverStatus.secureDuelReady} onClick={() => roomAction('create_room')}><span>PRIVATE</span><h3>비공개 방</h3><p>방 코드를 공유해 친구와 결투합니다.</p><em>방 만들기 →</em></button>
        <article className="mode-card join"><span>JOIN ROOM</span><h3>코드로 참가</h3><p>친구에게 받은 6자리 코드를 입력하세요.</p><div className="inline-form"><input value={code} onChange={(event: ChangeEvent<HTMLInputElement>) => setCode(event.target.value.toUpperCase())} maxLength={6} placeholder="ABC123" /><button disabled={busy || code.length < 6 || !serverStatus.secureDuelReady} onClick={() => roomAction('join_room', { code })}>입장</button></div></article>
      </section>
      <section className="active-deck-strip panel"><span>사용 덱</span><b>{activeDeck?.name ?? '활성 덱 없음'}</b><small>MAIN {activeDeck?.cards.length ?? 0}/{DECK_SIZE} · EXTRA {activeDeck?.extra_cards?.length ?? 0}/{EXTRA_DECK_SIZE}</small>{!activeDeck && <em>덱 구성에서 활성 덱을 지정하세요.</em>}</section>
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
  const [serverStatus, setServerStatus] = useState<SecureServerStatus>({
    secureDuelReady: false,
    code: 'UNKNOWN',
    message: '대전 서버 상태를 확인하는 중입니다.',
    keySource: 'none',
  });
  const [bootstrapVersion, setBootstrapVersion] = useState(0);
  const [inspectedCardId, setInspectedCardId] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const stored = window.localStorage.getItem(SOUND_STORAGE_KEY);
    const enabled = stored !== 'off';
    setSoundEnabled(enabled);
    setGlobalSoundEnabled(enabled);
  }, []);

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setGlobalSoundEnabled(next);
    window.localStorage.setItem(SOUND_STORAGE_KEY, next ? 'on' : 'off');
    if (next) window.setTimeout(() => playUiSound('success'), 0);
  }

  useEffect(() => {
    const openInspector = (event: Event) => {
      const cardId = (event as CustomEvent<string>).detail;
      if (cardId && CARD_BY_ID[cardId]) setInspectedCardId(cardId);
    };
    window.addEventListener(CARD_INSPECT_EVENT, openInspector);
    return () => window.removeEventListener(CARD_INSPECT_EVENT, openInspector);
  }, []);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    async function restoreSession() {
      let nextSession: Session | null = null;
      try {
        const current = await supabase.auth.getSession();
        if (current.error) throw current.error;
        nextSession = current.data.session;

        const expiresSoon = nextSession && (!nextSession.expires_at || nextSession.expires_at * 1000 < Date.now() + 60_000);
        if (expiresSoon) {
          const refreshed = await supabase.auth.refreshSession();
          if (refreshed.error) throw refreshed.error;
          nextSession = refreshed.data.session;
        }

        if (nextSession) {
          const verified = await supabase.auth.getUser(nextSession.access_token);
          if (verified.error || !verified.data.user) {
            const refreshed = await supabase.auth.refreshSession();
            nextSession = refreshed.data.session;
            if (!nextSession) throw refreshed.error ?? new Error('저장된 로그인 정보를 복구하지 못했습니다.');
            const reverified = await supabase.auth.getUser(nextSession.access_token);
            if (reverified.error || !reverified.data.user) throw reverified.error ?? new Error('로그인 정보를 확인하지 못했습니다.');
          }
        }
      } catch {
        nextSession = null;
        await supabase.auth.signOut({ scope: 'local' });
      } finally {
        if (mounted) {
          setSession(nextSession);
          setAuthReady(true);
          if (!nextSession) {
            setHub(null);
            setRoomPayload(null);
          }
        }
      }

      if (!mounted) return;
      const authListener = supabase.auth.onAuthStateChange((_event: string, changedSession: Session | null) => {
        if (!mounted) return;
        setSession(changedSession);
        setAuthReady(true);
        if (!changedSession) {
          setHub(null);
          setRoomPayload(null);
        }
      });
      unsubscribe = () => authListener.data.subscription.unsubscribe();
    }

    void restoreSession();
    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    setHub(null);
    setRoomPayload(null);
    setError('');
    api('bootstrap')
      .then((result) => {
        if (!alive) return;
        if (result.hub) setHub(result.hub);
        if (result.serverStatus) setServerStatus(result.serverStatus);
        setError('');
      })
      .catch((reason) => {
        if (alive) setError(reason instanceof Error ? reason.message : '계정 정보를 불러오지 못했습니다.');
      });
    return () => { alive = false; };
  }, [session?.user.id, bootstrapVersion]);

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
  if (!hub && error) return <AccountErrorScreen message={error} onRetry={() => { setError(''); setBootstrapVersion((value) => value + 1); }} onSignOut={() => supabase.auth.signOut({ scope: 'local' })} />;
  if (!hub) return <LoadingScreen text="계정과 카드 보관함을 불러오는 중" />;

  const content = (() => {
    switch (view) {
      case 'duel': return <DuelView userId={session.user.id} hub={hub} roomPayload={roomPayload} onRoom={setRoomPayload} onHub={setHub} serverStatus={serverStatus} />;
      case 'deck': return <DeckBuilder hub={hub} onHub={setHub} />;
      case 'shop': return <ShopView hub={hub} onHub={setHub} />;
      case 'collection': return <CollectionView hub={hub} />;
      case 'friends': return <FriendsView hub={hub} userId={session.user.id} onHub={setHub} />;
      case 'profile': return <ProfileView hub={hub} onHub={setHub} />;
      default: return <HomeView hub={hub} onNavigate={setView} serverStatus={serverStatus} />;
    }
  })();

  const roomChat = roomPayload && roomPayload.room.status !== 'cancelled' ? roomPayload.room.id : undefined;

  return (
    <main className={`game-app view-${view} ${roomPayload?.room.status === 'active' ? 'in-duel' : ''}`}>
      <div className="app-backdrop" aria-hidden="true"><span className="backdrop-grid" /><span className="backdrop-orbit" /><span className="backdrop-glow" /></div>
      <aside className="sidebar">
        <button className="game-logo" onClick={() => { playUiSound('click'); setView('home'); }}><span className="logo-glyph"><i>E</i></span><div><b>ECLIPSE</b><small>DUEL</small></div></button>
        <nav>{NAV_ITEMS.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { playUiSound('click'); setView(item.id); }}><i><GameIcon name={item.id} /></i><span>{item.label}</span></button>)}</nav>
        <div className="sidebar-profile"><Avatar id={hub.profile.avatar} size="small" /><span><b>{hub.profile.display_name}</b><small>LV.{levelFromXp(hub.profile.xp)}</small></span><button aria-label="로그아웃" onClick={() => supabase.auth.signOut({ scope: 'local' })}><GameIcon name="logout" /></button></div>
      </aside>

      <header className="topbar">
        <div className="mobile-logo"><span className="logo-glyph"><i>E</i></span><b>ECLIPSE DUEL</b></div>
        <div className="topbar-title"><small>{NAV_ITEMS.find((item) => item.id === view)?.label ?? (view === 'profile' ? '프로필' : 'ECLIPSE')}</small><b>ECLIPSE NETWORK</b></div>
        <button className={`v13-server-chip ${serverStatus.secureDuelReady ? 'ready' : 'warning'}`} onClick={() => setView('duel')} title={serverStatus.message}><span />{serverStatus.secureDuelReady ? '온라인' : '대전 설정'}</button>
        <div className="topbar-actions v9-topbar-actions"><span className="currency-pill"><GameIcon name="coin" /><small>COIN</small><b>{hub.wallet.coins.toLocaleString()}</b></span><button className={`v9-icon-button v10-sound-button ${soundEnabled ? 'active' : ''}`} onClick={toggleSound} title={soundEnabled ? '사운드 끄기' : '사운드 켜기'} aria-label={soundEnabled ? '사운드 끄기' : '사운드 켜기'}><GameIcon name="sound" /><span>{soundEnabled ? 'ON' : 'OFF'}</span></button><button className={`chat-toggle ${chatOpen ? 'active' : ''}`} onClick={() => { playUiSound('click'); setChatOpen((value) => !value); }}><GameIcon name="chat" /><span>{roomChat ? '방 채팅' : '채팅'}</span></button><button className="profile-chip" onClick={() => { playUiSound('click'); setView('profile'); }}><Avatar id={hub.profile.avatar} size="small" /><span>{hub.profile.display_name}</span></button></div>
      </header>

      <section className="content-area">{error && <div className="global-error"><span>{error}</span><button onClick={() => setError('')}>×</button></div>}{content}</section>

      <nav className="mobile-nav">{NAV_ITEMS.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { playUiSound('click'); setView(item.id); }}><i><GameIcon name={item.id} /></i><span>{item.label}</span></button>)}</nav>
      <ChatDrawer open={chatOpen} roomId={roomChat} onClose={() => setChatOpen(false)} profile={hub.profile} />
      {chatOpen && <button className="chat-backdrop" aria-label="채팅 닫기" onClick={() => setChatOpen(false)} />}
      {inspectedCardId && CARD_BY_ID[inspectedCardId] && <CardDetailModal card={CARD_BY_ID[inspectedCardId]} onClose={() => setInspectedCardId(null)} />}
    </main>
  );
}
