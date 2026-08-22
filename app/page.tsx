'use client';

import { createClient, Session } from '@supabase/supabase-js';
import { ChangeEvent, CSSProperties, FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import {
  CARDS,
  CARD_BY_ID,
  CARD_SERIES,
  SERIES_BY_ID,
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
  type SeriesId,
  countCards,
  isExtraDeckCard,
  isUnitCard,
  seriesAbilityDescription,
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
  profile_theme?: string;
  profile_frame?: string;
  profile_emblem?: string;
  card_sleeve?: string;
  nickname_style?: string;
};

type Wallet = { user_id: string; coins: number };
type CollectionRow = { card_id: string; quantity: number };
type DeckRow = { id: string; user_id: string; name: string; cards: string[]; extra_cards: string[]; is_active: boolean; created_at: string };
type FriendRequest = { id: string; sender_id: string; receiver_id: string; status: string; created_at: string };
type FriendProfile = Pick<Profile, 'user_id' | 'display_name' | 'player_code' | 'avatar' | 'status_message' | 'wins' | 'losses' | 'xp' | 'nickname_style'>;

type HubData = {
  profile: Profile;
  wallet: Wallet;
  collection: CollectionRow[];
  decks: DeckRow[];
  friendRequests: FriendRequest[];
  friends: FriendProfile[];
  requestProfiles: Array<Pick<Profile, 'user_id' | 'display_name' | 'player_code' | 'avatar' | 'nickname_style'>>;
  profileCosmetics?: string[];
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

type RoomProfile = Pick<Profile, 'user_id' | 'display_name' | 'avatar' | 'wins' | 'losses' | 'xp' | 'profile_emblem' | 'card_sleeve' | 'nickname_style'>;
type RoomPayload = { room: RoomRow; profiles: RoomProfile[]; privateState: PrivateState | null };
type ChatMessage = { id: number; user_id: string; display_name: string; nickname_style?: string; body: string; created_at: string };

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
  resumedRoom?: boolean;
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


type ProfileCosmeticKind = 'background' | 'frame' | 'emblem' | 'sleeve' | 'nickname';
type ProfileCosmetic = {
  id: string;
  kind: ProfileCosmeticKind;
  name: string;
  price: number;
  rarity: 'rare' | 'epic' | 'legendary';
  description: string;
  accent: string;
  glyph?: string;
};

const PROFILE_COSMETICS: ProfileCosmetic[] = [
  { id: 'bg_eclipse_nexus', kind: 'background', name: '일식의 중추', price: 700, rarity: 'rare', description: '푸른 일식과 궤도 링이 흐르는 결투가 프로필 배경.', accent: '#66c8ff' },
  { id: 'bg_solar_cathedral', kind: 'background', name: '태양 성당', price: 1100, rarity: 'epic', description: '황금빛 성광과 스테인드 글라스가 펼쳐지는 배경.', accent: '#ffc56a' },
  { id: 'bg_lunar_archive', kind: 'background', name: '월영 기록고', price: 1100, rarity: 'epic', description: '달빛 문양과 떠다니는 기록 파편으로 구성된 배경.', accent: '#91a8ff' },
  { id: 'bg_void_throne', kind: 'background', name: '공허의 왕좌', price: 1700, rarity: 'legendary', description: '균열과 암흑 성운이 뒤틀리는 전설급 프로필 배경.', accent: '#bd78ff' },
  { id: 'frame_aurora', kind: 'frame', name: '오로라 프레임', price: 500, rarity: 'rare', description: '청록과 보랏빛이 은은하게 흐르는 프로필 프레임.', accent: '#6de8ff' },
  { id: 'frame_royal', kind: 'frame', name: '왕실 금장', price: 900, rarity: 'epic', description: '금빛 각인과 왕실 문양을 두른 프로필 프레임.', accent: '#ffd16d' },
  { id: 'frame_rift', kind: 'frame', name: '균열 파편', price: 1250, rarity: 'epic', description: '공간 파편이 가장자리에서 떠오르는 프레임.', accent: '#a977ff' },
  { id: 'frame_astral', kind: 'frame', name: '성계의 관', price: 1800, rarity: 'legendary', description: '별빛 궤도와 광휘가 회전하는 전설급 프레임.', accent: '#81a4ff' },
  { id: 'emblem_solar_crest', kind: 'emblem', name: '태양검 문장', price: 650, rarity: 'rare', description: '프로필 위에 장착하는 황금 태양검 문양.', accent: '#ffc866', glyph: '✦' },
  { id: 'emblem_lunar_eye', kind: 'emblem', name: '월식의 눈', price: 800, rarity: 'epic', description: '달의 궤도와 눈동자가 겹치는 월영 문양.', accent: '#9eb5ff', glyph: '◉' },
  { id: 'emblem_kaiser_crown', kind: 'emblem', name: '카이저 황관', price: 1000, rarity: 'epic', description: '황제기갑의 지휘권을 상징하는 금속 왕관.', accent: '#ffd37f', glyph: '♛' },
  { id: 'emblem_rift_omega', kind: 'emblem', name: '균열 오메가', price: 1400, rarity: 'epic', description: '공간 균열이 Ω 형태로 응축된 공명 문양.', accent: '#c58cff', glyph: 'Ω' },
  { id: 'emblem_astral_wings', kind: 'emblem', name: '성해의 쌍익', price: 1900, rarity: 'legendary', description: '별바다를 가르는 두 광익이 펼쳐지는 전설 문양.', accent: '#83dcff', glyph: '✧' },
  { id: 'emblem_neon_star', kind: 'emblem', name: '네온 스타', price: 950, rarity: 'epic', description: '청보라 네온 별이 점멸하는 움직이는 프로필 아이콘.', accent: '#77e4ff', glyph: '✹' },
  { id: 'emblem_midnight_moon', kind: 'emblem', name: '미드나잇 문', price: 980, rarity: 'epic', description: '초승달 잔광이 퍼지는 심야 문양.', accent: '#b7c7ff', glyph: '☽' },
  { id: 'emblem_blossom_seal', kind: 'emblem', name: '블러썸 실', price: 1100, rarity: 'epic', description: '꽃잎 입자가 맴도는 화사한 프로필 문양.', accent: '#ffb1df', glyph: '❀' },
  { id: 'emblem_royal_lily', kind: 'emblem', name: '로열 릴리', price: 1450, rarity: 'epic', description: '고풍스러운 백합 문장이 금빛으로 반짝이는 문양.', accent: '#ffd685', glyph: '❖' },
  { id: 'emblem_tidal_orbit', kind: 'emblem', name: '타이달 오비트', price: 1650, rarity: 'legendary', description: '푸른 물결 궤도가 회전하는 전설 프로필 아이콘.', accent: '#71e7ff', glyph: '◌' },
  { id: 'emblem_comet_heart', kind: 'emblem', name: '코멧 하트', price: 1180, rarity: 'epic', description: '작은 혜성이 하트 궤도를 그리며 도는 문양.', accent: '#ffa4d0', glyph: '♥' },
  { id: 'emblem_clock_halo', kind: 'emblem', name: '클락 헤일로', price: 1540, rarity: 'legendary', description: '시계 눈금이 빛 고리로 회전하는 시간 문양.', accent: '#99ebff', glyph: '◔' },
  { id: 'emblem_storm_sigil', kind: 'emblem', name: '스톰 시질', price: 1320, rarity: 'epic', description: '번개 모양의 잔광이 주위를 맴도는 폭풍 문양.', accent: '#8dc9ff', glyph: '⚡' },
  { id: 'emblem_prism_butterfly', kind: 'emblem', name: '프리즘 버터플라이', price: 1380, rarity: 'epic', description: '프리즘 날개가 펼쳐졌다 접히듯 반짝이는 프로필 문양.', accent: '#d59bff', glyph: '✣' },
  { id: 'emblem_eclipse_crown', kind: 'emblem', name: '이클립스 크라운', price: 1760, rarity: 'legendary', description: '작은 일식 고리 위로 왕관 광채가 떠오르는 전설 문양.', accent: '#ffd17f', glyph: '♚' },
  { id: 'emblem_sakura_halo', kind: 'emblem', name: '사쿠라 헤일로', price: 1260, rarity: 'epic', description: '벚꽃빛 헤일로가 숨 쉬듯 피고 지는 프로필 문양.', accent: '#ffabd8', glyph: '❁' },
  { id: 'emblem_comet_arrow', kind: 'emblem', name: '코멧 애로우', price: 1480, rarity: 'epic', description: '혜성 꼬리가 사선으로 스쳐 지나가는 역동적인 문양.', accent: '#8ddfff', glyph: '➳' },
  { id: 'emblem_arcane_node', kind: 'emblem', name: '아케인 노드', price: 1690, rarity: 'legendary', description: '마력 노드가 순차적으로 점등되는 전설 프로필 문양.', accent: '#be8dff', glyph: '✺' },
  { id: 'sleeve_eclipse_black', kind: 'sleeve', name: '일식 블랙 슬리브', price: 450, rarity: 'rare', description: '검은 일식 링과 은빛 E 문장이 새겨진 카드 보호 슬리브.', accent: '#7788ff', glyph: 'E' },
  { id: 'sleeve_solar_flare', kind: 'sleeve', name: '솔라 플레어 슬리브', price: 650, rarity: 'rare', description: '붉은 태양 홍염이 카드 뒷면을 감싸는 슬리브.', accent: '#ff985d', glyph: '☀' },
  { id: 'sleeve_lunar_glass', kind: 'sleeve', name: '루나 글라스 슬리브', price: 800, rarity: 'epic', description: '푸른 유리와 초승달 궤도로 빛나는 슬리브.', accent: '#9cb5ff', glyph: '☾' },
  { id: 'sleeve_kaiser_chrome', kind: 'sleeve', name: '카이저 크롬 슬리브', price: 1050, rarity: 'epic', description: '황제기갑 장갑판처럼 분할된 크롬 카드 슬리브.', accent: '#d9c68d', glyph: 'K' },
  { id: 'sleeve_void_prism', kind: 'sleeve', name: '보이드 프리즘 슬리브', price: 1350, rarity: 'epic', description: '보랏빛 프리즘 균열이 회전하는 공허 슬리브.', accent: '#c17cff', glyph: '◇' },
  { id: 'sleeve_astral_navy', kind: 'sleeve', name: '아스트라 네이비 슬리브', price: 1700, rarity: 'legendary', description: '성해함대 항로와 별빛 함선 문장이 새겨진 전설 슬리브.', accent: '#69d8ff', glyph: '✶' },
  { id: 'sleeve_starry_night', kind: 'sleeve', name: '밤하늘 슬리브', price: 720, rarity: 'rare', description: '별이 총총한 밤하늘과 잔잔한 은하 무늬가 감도는 슬리브.', accent: '#8bbcff', glyph: '✦' },
  { id: 'sleeve_neon_sign', kind: 'sleeve', name: '네온 사인 슬리브', price: 980, rarity: 'epic', description: '간판 같은 네온 선과 도형이 반짝이는 카드 슬리브.', accent: '#62f0ff', glyph: 'N' },
  { id: 'sleeve_blossom_garden', kind: 'sleeve', name: '블러썸 가든 슬리브', price: 1020, rarity: 'epic', description: '꽃무늬와 분홍빛 장식이 포근하게 퍼지는 슬리브.', accent: '#ff9ad6', glyph: '❀' },
  { id: 'sleeve_holo_checker', kind: 'sleeve', name: '홀로 체커 슬리브', price: 1280, rarity: 'epic', description: '홀로그램 체커보드 패턴이 각도에 따라 반짝이는 슬리브.', accent: '#a7d8ff', glyph: '◫' },
  { id: 'sleeve_royal_wallpaper', kind: 'sleeve', name: '로열 월페이퍼 슬리브', price: 1380, rarity: 'epic', description: '고풍스러운 금장 벽지 무늬가 새겨진 우아한 슬리브.', accent: '#e9c978', glyph: '❖' },
  { id: 'sleeve_moonlit_window', kind: 'sleeve', name: '문라이트 윈도우 슬리브', price: 1680, rarity: 'legendary', description: '달빛 창문과 커튼 그림자가 겹쳐지는 전설 슬리브.', accent: '#a8c6ff', glyph: '☽' },
  { id: 'bg_nebula_vortex', kind: 'background', name: '성운 와류', price: 2300, rarity: 'legendary', description: '성운 입자와 궤도광이 끊임없이 회전하는 애니메이션 프로필 배경.', accent: '#8d7cff' },
  { id: 'bg_chrono_rift', kind: 'background', name: '크로노 균열', price: 2600, rarity: 'legendary', description: '시간 균열과 시계 문양이 흐르며 왜곡되는 애니메이션 배경.', accent: '#66d8ff' },
  { id: 'bg_aurora_tide', kind: 'background', name: '오로라 타이드', price: 1900, rarity: 'epic', description: '오로라 물결과 잔광이 천천히 흘러가는 애니메이션 프로필 배경.', accent: '#69efd1' },
  { id: 'bg_neon_midnight', kind: 'background', name: '네온 미드나잇', price: 2300, rarity: 'legendary', description: '심야 도시의 네온 선이 스캔라인처럼 지나가는 애니메이션 배경.', accent: '#7ae0ff' },
  { id: 'bg_starfall_garden', kind: 'background', name: '별꽃 정원', price: 2100, rarity: 'legendary', description: '꽃잎과 별조각이 떠다니는 애니메이션 프로필 배경.', accent: '#f3a7ff' },
  { id: 'frame_prismatic_loop', kind: 'frame', name: '프리즘 루프', price: 2200, rarity: 'legendary', description: '무지갯빛 광선이 테두리를 따라 순환하는 애니메이션 프레임.', accent: '#f19cff' },
  { id: 'frame_ember_crown', kind: 'frame', name: '홍염의 관', price: 2400, rarity: 'legendary', description: '불꽃 입자가 테두리를 타고 상승하는 애니메이션 전설 프레임.', accent: '#ff9a5f' },
  { id: 'frame_neon_circuit', kind: 'frame', name: '네온 서킷', price: 2050, rarity: 'epic', description: '회로선이 테두리를 따라 질주하는 네온 프레임.', accent: '#66efff' },
  { id: 'frame_moonlace', kind: 'frame', name: '문레이스', price: 2150, rarity: 'legendary', description: '달빛 리본이 조용히 흐르며 반짝이는 우아한 프레임.', accent: '#c7d6ff' },
  { id: 'frame_blossom_arc', kind: 'frame', name: '블러썸 아크', price: 2250, rarity: 'legendary', description: '꽃잎 장식이 맴돌며 피어나는 화사한 프레임.', accent: '#ffb0e5' },
  { id: 'frame_royal_window', kind: 'frame', name: '로열 윈도우', price: 2350, rarity: 'legendary', description: '스테인드글라스 광채가 부드럽게 이동하는 왕실 프레임.', accent: '#ffd985' },
  { id: 'nickname_rainbow', kind: 'nickname', name: '레인보우 시프트', price: 900, rarity: 'epic', description: '닉네임을 따라 무지개 그라데이션이 계속 흐릅니다. 모든 플레이어 화면에 적용됩니다.', accent: '#ff74d5' },
  { id: 'nickname_neon', kind: 'nickname', name: '네온 펄스', price: 850, rarity: 'epic', description: '청보라 네온이 부드럽게 점멸하는 닉네임 효과.', accent: '#6ee8ff' },
  { id: 'nickname_starlight', kind: 'nickname', name: '스타라이트', price: 1200, rarity: 'epic', description: '별빛이 글자 위를 스쳐 지나가는 반짝임 애니메이션.', accent: '#c4dcff' },
  { id: 'nickname_ember', kind: 'nickname', name: '홍염 파동', price: 1300, rarity: 'epic', description: '붉은색과 금색이 불꽃처럼 요동치는 닉네임 효과.', accent: '#ff945d' },
  { id: 'nickname_glitch', kind: 'nickname', name: '보이드 글리치', price: 1600, rarity: 'legendary', description: '공허색 잔상과 짧은 디지털 왜곡이 발생하는 전설 닉네임 효과.', accent: '#bd7cff' },
  { id: 'nickname_aurora', kind: 'nickname', name: '오로라 웨이브', price: 1800, rarity: 'legendary', description: '청록·보라·푸른빛이 물결처럼 이동하는 전설 닉네임 애니메이션.', accent: '#73e7da' },
  { id: 'nickname_gold', kind: 'nickname', name: '황제의 서명', price: 2100, rarity: 'legendary', description: '금빛 하이라이트가 왕관처럼 반복해서 흐르는 전설 닉네임 효과.', accent: '#ffd06f' },
];


const COSMETIC_KIND_LABEL: Record<ProfileCosmeticKind, string> = {
  background: '배경', frame: '프레임', emblem: '문양/아이콘', sleeve: '카드 슬리브', nickname: '닉네임 효과',
};
const EMBLEM_BY_ID = Object.fromEntries(PROFILE_COSMETICS.filter((item) => item.kind === 'emblem').map((item) => [item.id, item])) as Record<string, ProfileCosmetic>;
const SLEEVE_BY_ID = Object.fromEntries(PROFILE_COSMETICS.filter((item) => item.kind === 'sleeve').map((item) => [item.id, item])) as Record<string, ProfileCosmetic>;
function emblemGlyph(id?: string): string { return id && EMBLEM_BY_ID[id]?.glyph ? EMBLEM_BY_ID[id].glyph! : 'E'; }
function sleeveGlyph(id?: string): string { return id && SLEEVE_BY_ID[id]?.glyph ? SLEEVE_BY_ID[id].glyph! : 'E'; }

function NicknameText({ name, styleId, className = '' }: { name: string; styleId?: string; className?: string }) {
  return <span className={`v26-nickname nickname-${styleId ?? 'nickname_default'} ${className}`.trim()}>{name}</span>;
}

function ProfileFrameFX({ frameId }: { frameId?: string }) {
  const resolved = frameId ?? 'frame_default';
  if (resolved === 'frame_default') return null;
  return (
    <span className={`v28-frame-fx fx-${resolved}`} aria-hidden="true">
      <b className="v28-frame-core" />
      {Array.from({ length: 12 }, (_, index) => <i key={index} className={`v28-frame-particle p${index + 1}`} />)}
    </span>
  );
}


const SOUND_STORAGE_KEY = 'eclipse-duel:sound-enabled';
const SOUND_VOLUME_STORAGE_KEY = 'eclipse-duel:sound-volume';
let globalSoundEnabled = true;
let globalSoundVolume = 0.82;
let sharedAudioContext: AudioContext | null = null;

function setGlobalSoundEnabled(enabled: boolean): void {
  globalSoundEnabled = enabled;
}

function setGlobalSoundVolume(volume: number): void {
  globalSoundVolume = Math.max(0, Math.min(1, volume));
}

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || !globalSoundEnabled) return null;
  const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!sharedAudioContext) sharedAudioContext = new AudioContextCtor();
  if (sharedAudioContext.state === 'suspended') void sharedAudioContext.resume();
  return sharedAudioContext;
}

type UiSound = 'click' | 'card' | 'remove' | 'auto' | 'save' | 'pack' | 'reveal' | 'success' | 'summon' | 'attack' | 'spell' | 'trap' | 'damage' | 'draw' | 'turn';

function playUiSound(kind: UiSound): void {
  const context = getAudioContext();
  if (!context) return;
  const now = context.currentTime;
  const master = context.createGain();
  const compressor = context.createDynamicsCompressor();
  compressor.threshold.value = -18;
  compressor.knee.value = 16;
  compressor.ratio.value = 7;
  compressor.attack.value = 0.002;
  compressor.release.value = 0.12;
  master.gain.setValueAtTime(Math.max(0.001, globalSoundVolume), now);
  master.connect(compressor);
  compressor.connect(context.destination);

  const tone = (type: OscillatorType, from: number, to: number, duration: number, volume: number, delay = 0): void => {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const begin = now + delay;
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(45, from), begin);
    osc.frequency.exponentialRampToValueAtTime(Math.max(45, to), begin + duration);
    gain.gain.setValueAtTime(0.0001, begin);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), begin + Math.min(0.018, duration * 0.18));
    gain.gain.exponentialRampToValueAtTime(0.0001, begin + duration);
    osc.connect(gain);
    gain.connect(master);
    osc.start(begin);
    osc.stop(begin + duration + 0.02);
  };

  const noise = (duration: number, volume: number, delay = 0, highpass = 180): void => {
    const frames = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, frames, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    const begin = now + delay;
    filter.type = 'highpass';
    filter.frequency.value = highpass;
    gain.gain.setValueAtTime(volume, begin);
    gain.gain.exponentialRampToValueAtTime(0.0001, begin + duration);
    source.buffer = buffer;
    source.connect(filter);
    filter.connect(gain);
    gain.connect(master);
    source.start(begin);
    source.stop(begin + duration + 0.02);
  };

  switch (kind) {
    case 'click':
      tone('sine', 560, 730, 0.045, 0.018);
      tone('triangle', 1120, 820, 0.035, 0.008, 0.004);
      break;
    case 'card':
      tone('triangle', 410, 720, 0.085, 0.025);
      noise(0.05, 0.009, 0.01, 1200);
      break;
    case 'remove':
      tone('sine', 380, 180, 0.08, 0.02);
      break;
    case 'auto':
      tone('triangle', 240, 620, 0.18, 0.024);
      tone('sine', 480, 980, 0.15, 0.014, 0.035);
      break;
    case 'save':
      tone('sine', 520, 780, 0.12, 0.022);
      tone('sine', 780, 1040, 0.1, 0.016, 0.06);
      break;
    case 'pack':
      noise(0.24, 0.04, 0, 650);
      tone('sawtooth', 150, 420, 0.22, 0.025);
      tone('sine', 380, 1050, 0.28, 0.015, 0.05);
      break;
    case 'reveal':
      tone('triangle', 430, 980, 0.16, 0.025);
      tone('sine', 860, 1320, 0.2, 0.012, 0.025);
      break;
    case 'success':
      tone('sine', 520, 780, 0.13, 0.022);
      tone('sine', 780, 1040, 0.14, 0.019, 0.07);
      tone('triangle', 1040, 1560, 0.12, 0.01, 0.14);
      break;
    case 'summon':
      tone('sine', 120, 390, 0.42, 0.03);
      tone('triangle', 260, 880, 0.34, 0.025, 0.035);
      noise(0.2, 0.022, 0.09, 900);
      break;
    case 'attack':
      noise(0.14, 0.04, 0, 380);
      tone('sawtooth', 240, 78, 0.14, 0.035);
      tone('square', 520, 210, 0.08, 0.012, 0.025);
      break;
    case 'spell':
      tone('sine', 320, 1180, 0.35, 0.024);
      tone('triangle', 680, 1680, 0.28, 0.016, 0.055);
      noise(0.18, 0.01, 0.08, 1600);
      break;
    case 'trap':
      tone('square', 210, 640, 0.18, 0.02);
      tone('triangle', 920, 260, 0.22, 0.018, 0.04);
      noise(0.12, 0.025, 0.035, 1200);
      break;
    case 'damage':
      noise(0.18, 0.055, 0, 240);
      tone('sawtooth', 110, 48, 0.16, 0.04);
      break;
    case 'draw':
      noise(0.11, 0.012, 0, 1450);
      tone('triangle', 290, 540, 0.13, 0.018, 0.015);
      tone('sine', 620, 980, 0.17, 0.014, 0.075);
      break;
    case 'turn':
      tone('sine', 430, 620, 0.11, 0.018);
      tone('sine', 620, 930, 0.16, 0.02, 0.07);
      break;
    default:
      break;
  }
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

function packPreviewCards(pack: (typeof PACKS)[number]): CardDefinition[] {
  const rarityScore: Record<Rarity, number> = { common: 1, rare: 2, epic: 3, legendary: 4 };
  let pool = CARDS.filter((card) => !isExtraDeckCard(card));

  if (pack.seriesId) pool = CARDS.filter((card) => card.seriesId === pack.seriesId);
  if (pack.id === 'legendary') pool = CARDS.filter((card) => card.rarity === 'legendary' || card.rarity === 'epic');

  const seed = hashString(pack.id);
  const preferred = pool.slice().sort((a, b) => {
    const rarityDelta = rarityScore[b.rarity] - rarityScore[a.rarity];
    if (rarityDelta) return rarityDelta;
    const aHash = hashString(`${pack.id}:${a.id}`) % 10007;
    const bHash = hashString(`${pack.id}:${b.id}`) % 10007;
    return aHash - bHash || a.name.localeCompare(b.name, 'ko');
  });

  const picked: CardDefinition[] = [];
  const used = new Set<string>();
  const offset = preferred.length ? seed % preferred.length : 0;
  for (let step = 0; step < preferred.length && picked.length < 3; step += 1) {
    const card = preferred[(offset + step) % preferred.length];
    if (used.has(card.id)) continue;
    picked.push(card);
    used.add(card.id);
  }

  for (const fallback of CARDS.filter((card) => !isExtraDeckCard(card))) {
    if (picked.length >= 3) break;
    if (used.has(fallback.id)) continue;
    picked.push(fallback);
    used.add(fallback.id);
  }
  return picked;
}

function packEmblem(pack: (typeof PACKS)[number]): string {
  if (pack.id === 'standard') return '✦';
  if (pack.id === 'rare') return '◆';
  if (pack.id === 'legendary') return '♛';
  const glyphs: Record<SeriesId, string> = {
    luminaknights: '✧',
    kaisergear: '⚙',
    eclipsion: '◈',
    nocturne: '☾',
    arborian: '❈',
    tempest_drive: 'ϟ',
    abyss_reaper: '†',
    primal_guardian: '⬢',
    chronorium: '◷',
    arcana_protocol: '✺',
    beastforge: '♞',
    phantom_carnival: '◐',
    astral_armada: '✶',
  };
  return pack.seriesId ? glyphs[pack.seriesId] : '✦';
}

function PackProductVisual({ pack }: { pack: (typeof PACKS)[number] }) {
  const previews = packPreviewCards(pack);
  const emblem = packEmblem(pack);
  const series = pack.seriesId ? SERIES_BY_ID[pack.seriesId] : null;

  return (
    <div className={`pack-product-visual v23-pack-visual ${pack.seriesId ? `series-${pack.seriesId}` : `pack-${pack.id}`}`} aria-hidden="true">
      <div className="v23-pack-fan">
        {previews.map((card, index) => (
          <span key={card.id} className={`v23-pack-art art-${index + 1}`} style={cardStyle(card)}>
            <img
              src={cardArtworkPath(card.id)}
              alt=""
              width={960}
              height={600}
              loading="lazy"
              decoding="async"
              draggable={false}
              onError={(event) => { if (!event.currentTarget.src.endsWith('/fallback.webp')) event.currentTarget.src = '/card-art/fallback.webp'; }}
            />
          </span>
        ))}
      </div>
      <div className="v23-booster-pack">
        <span className="v23-pack-kicker">{series ? 'SERIES BOOSTER' : 'ECLIPSE DUEL'}</span>
        <i className="v23-pack-emblem">{emblem}</i>
        <strong>{pack.name}</strong>
        <small>{series ? series.mechanic : '5 CARD BOOSTER'}</small>
        <em>{series ? `${pack.odds.seriesGuaranteedSlots ?? 2} SERIES+` : `${RARITY_LABEL[pack.guaranteed]}+ GUARANTEED`}</em>
      </div>
      <div className="v23-pack-sheen" />
    </div>
  );
}

function CosmeticPreview({ item, profile }: { item: ProfileCosmetic; profile: Profile }) {
  if (item.kind === 'nickname') {
    return (
      <div className={`v17-cosmetic-preview ${item.id} kind-nickname`} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>
        <div className="v26-nickname-preview"><small>NICKNAME FX</small><NicknameText name={profile.display_name} styleId={item.id} /><p>모든 프로필 · 채팅 · 대전 화면에 표시</p></div>
      </div>
    );
  }
  if (item.kind === 'sleeve') {
    return (
      <div className={`v17-cosmetic-preview ${item.id} kind-sleeve`} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>
        <div className="v26-sleeve-preview"><div className={`v26-card-sleeve sleeve-${item.id}`}><i /><b>{item.glyph ?? 'E'}</b><small>ECLIPSE DUEL</small></div><span>DECK SLEEVE</span></div>
      </div>
    );
  }
  if (item.kind === 'emblem') {
    return (
      <div className={`v17-cosmetic-preview ${item.id} kind-emblem`} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>
        <div className="v26-emblem-preview"><span className="v26-emblem-orbit" /><b>{item.glyph ?? 'E'}</b><small>PROFILE EMBLEM / ICON</small></div>
      </div>
    );
  }
  return (
    <div className={`v17-cosmetic-preview ${item.id} kind-${item.kind}`} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>
      <div className={`v17-cosmetic-scene kind-${item.kind}`}>
        <div className="v17-cosmetic-scene-glow" />
        <div className="v17-cosmetic-frame-ring" />
        {item.kind === 'frame' && <ProfileFrameFX frameId={item.id} />}
        <div className="v17-cosmetic-title">
          <span>{item.kind === 'background' ? 'PROFILE BACKGROUND' : 'PROFILE FRAME'}</span>
          <b>{item.name}</b>
        </div>
        <div className="v17-cosmetic-profile-card">
          <div className="v17-cosmetic-avatar-wrap"><Avatar id={profile.avatar} /></div>
          <div className="v17-cosmetic-usercopy"><b><NicknameText name={profile.display_name} styleId={profile.nickname_style} /></b><span>Lv.{Math.max(1, Math.floor((profile.xp ?? 0) / 100) + 1)} · 결투가 프로필 미리보기</span></div>
        </div>
      </div>
    </div>
  );
}

const KEYWORD_DESCRIPTION: Record<Keyword, string> = {
  guard: '수호 · 상대는 가능한 경우 이 유닛을 먼저 공격해야 합니다.',
  charge: '속공 · 소환된 턴에도 즉시 공격할 수 있습니다.',
  lifesteal: '흡수 · 가한 전투 피해만큼 내 코어를 회복합니다.',
  pierce: '관통 · 유닛을 파괴하고 남은 피해를 상대 코어에 줍니다.',
};

function effectDescription(effect: CardDefinition['effect'] | CardDefinition['onSummon'] | CardDefinition['trapEffect'], trigger?: CardDefinition['trapTrigger']): string {
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
  if (effect.kind === 'negate_and_damage') return trigger === 'direct_attack'
    ? `직접 공격을 무효화하고 공격 유닛에 ${effect.amount} 피해`
    : `발동을 무효화하고 상대 코어에 ${effect.amount} 피해`;
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

function GameIcon({ name }: { name: View | 'chat' | 'coin' | 'logout' | 'sound' | 'settings' }) {
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
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
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
  if (/password should be at least/i.test(message)) return '비밀번호가 서비스 보안 기준보다 짧습니다.';
  if (/invalid.*email|email.*invalid/i.test(message)) return '사용할 수 있는 이메일 주소를 입력해 주세요.';
  if (/rate limit|too many requests/i.test(message)) return '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.';
  if (/database error saving new user|failed to save new user/i.test(message)) return '계정 생성 서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해 주세요.';
  if (/session.*expired|refresh token|jwt expired/i.test(message)) return '로그인 시간이 만료되었습니다. 다시 로그인해 주세요.';
  return message;
}

function friendlyServiceMessage(message: string): string {
  const clean = message.trim();
  if (!clean) return '서버 요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
  if (/SUPABASE|service role|secret key|schema cache|통합 SQL|SQL을|DB 업그레이드|migration|does not exist|eclipse_private_states|eclipse_profile_cosmetics/i.test(clean)) {
    return '온라인 서비스가 점검 중입니다. 잠시 후 다시 시도해 주세요.';
  }
  if (/fetch|network|failed to fetch|load failed|connection|연결.*실패/i.test(clean)) return '네트워크 연결이 불안정합니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.';
  if (/12초 이상|timeout|timed out/i.test(clean)) return '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.';
  return friendlyAuthMessage(clean);
}

function publicServerStatusMessage(status: SecureServerStatus): string {
  if (status.secureDuelReady) return '온라인 대전 서버 연결 완료';
  if (status.code === 'DB_MIGRATION_REQUIRED') return '온라인 대전 서비스를 점검하고 있습니다.';
  if (status.code === 'MISSING_KEY' || status.code === 'INVALID_KEY' || status.code === 'WRONG_PROJECT') return '온라인 대전 서비스 연결을 준비하고 있습니다.';
  return '온라인 대전 서버 상태를 확인하는 중입니다.';
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
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 12_000);
  let response: Response;
  try {
    response = await fetch('/api/eclipse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, ...payload }),
      signal: controller.signal,
    });
  } catch (error) {
    const safeRead = action === 'bootstrap' || action === 'hub' || action === 'get_room';
    if (!retried && safeRead) {
      await new Promise((resolve) => window.setTimeout(resolve, 450));
      return api(action, payload, true);
    }
    if (error instanceof DOMException && error.name === 'AbortError') throw new Error('서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해 주세요.');
    throw new Error('네트워크 연결이 불안정합니다. 연결 상태를 확인한 뒤 다시 시도해 주세요.');
  } finally {
    window.clearTimeout(timeout);
  }
  const result = (await response.json().catch(() => ({ ok: false, error: '서버 응답을 읽지 못했습니다.' }))) as ApiResult;
  if ((response.status === 401 || result.code === 'AUTH_EXPIRED') && !retried) {
    await accessToken(true);
    return api(action, payload, true);
  }
  if (!response.ok || !result.ok) {
    if (response.status === 401 || result.code === 'AUTH_EXPIRED') await supabase.auth.signOut({ scope: 'local' });
    if (typeof console !== 'undefined') console.error('[ECLIPSE API]', action, result.code ?? response.status, result.error ?? 'unknown error');
    throw new Error(friendlyServiceMessage(result.error || '서버 요청에 실패했습니다.'));
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
  sleeveId = 'sleeve_default',
}: {
  card?: CardDefinition;
  compact?: boolean;
  selected?: boolean;
  disabled?: boolean;
  quantity?: number;
  onClick?: () => void;
  hidden?: boolean;
  inspectable?: boolean;
  sleeveId?: string;
}) {
  if (hidden || !card) {
    const interactive = Boolean(onClick) && !disabled;
    return (
      <button
        type="button"
        className={`tcg-card card-back sleeve-${sleeveId} ${compact ? 'compact' : ''} ${disabled ? 'is-disabled' : ''} ${interactive ? 'is-interactive' : 'is-static'}`}
        aria-label={interactive ? '뒤집힌 카드 공개' : '뒤집힌 카드'}
        aria-disabled={!interactive}
        onClick={() => { if (interactive) onClick?.(); }}
      >
        <span className="back-orbit" />
        <span className="back-mark">{sleeveGlyph(sleeveId)}</span>
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

  function activateCard(event?: React.KeyboardEvent<HTMLDivElement>) {
    if (event && event.key !== 'Enter' && event.key !== ' ') return;
    if (event) event.preventDefault();
    if (!disabled) performAction?.();
  }

  return (
    <div
      className={`tcg-card kind-${card.kind} summon-${card.summonMode ?? 'normal'} rarity-${card.rarity} element-${card.element} ${compact ? 'compact' : ''} ${selected ? 'selected' : ''} ${disabled ? 'is-disabled' : ''}`}
      style={cardStyle(card)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => activateCard()}
      onKeyDown={activateCard}
      aria-disabled={disabled}
      aria-label={onClick ? `${card.name} 선택` : `${card.name} 상세 보기`}
      title={onClick ? `${card.name} 선택` : `${card.name} 상세 보기`}
    >
      <span className="card-cost">{card.cost}</span>
      {card.summonMode === 'rift' && <span className="summon-badge rift">균열</span>}
      {card.kind === 'fusion' && <span className="summon-badge fusion">융합</span>}
      {card.kind === 'evolution' && <span className="summon-badge evolution">진화</span>}
      {quantity !== undefined && <span className="card-quantity">×{quantity}</span>}
      {inspectable && (
        <button
          type="button"
          className="card-info-hotspot"
          aria-label={`${card.name} 상세 정보`}
          onClick={openInspector}
          onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => { if (event.key === 'Enter' || event.key === ' ') openInspector(event); }}
        >i</button>
      )}
      <span className="card-topline">
        <b>{card.name}</b>
        <small>{RARITY_LABEL[card.rarity]}{card.seriesId ? ` · ${SERIES_BY_ID[card.seriesId].shortName}` : ''}</small>
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
    </div>
  );
}

function CardDetailModal({ card, onClose }: { card: CardDefinition; onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('keydown', close);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  const summonCondition = summonConditionDescription(card);
  const effectRows = [
    card.onSummon ? { label: '소환 효과', value: effectDescription(card.onSummon) } : null,
    card.effect ? { label: '카드 효과', value: effectDescription(card.effect) } : null,
    card.trapTrigger ? { label: '발동 조건', value: trapTriggerDescription(card.trapTrigger) } : null,
    card.trapEffect ? { label: '함정 효과', value: effectDescription(card.trapEffect, card.trapTrigger) } : null,
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
      <section className={`card-detail-modal element-${card.element} rarity-${card.rarity}`} role="dialog" aria-modal="true" aria-labelledby="card-detail-title" aria-describedby="card-detail-effect">
        <button ref={closeButtonRef} className="modal-close" type="button" onClick={onClose} aria-label="닫기">×</button>

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
        </div>

        <div className="card-detail-content">
          <header>
            <div><span>{RARITY_LABEL[card.rarity]} · {ELEMENT_LABEL[card.element]} · {KIND_LABEL[card.kind]}{card.series ? ` · ${card.series}` : ''}</span><h2 id="card-detail-title">{card.name}</h2><p>{card.subtitle}</p></div>
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

          <section className="detail-section primary-effect" id="card-detail-effect">
            <span>카드 효과</span>
            <p>{card.text}</p>
          </section>

          {card.seriesId && card.seriesAbility && (
            <section className={`detail-section v25-series-effect series-${card.seriesId}`}>
              <span>SERIES LINK · {SERIES_BY_ID[card.seriesId].shortName}</span>
              <p>{seriesAbilityDescription(card)}</p>
            </section>
          )}

          {card.seriesId && (
            <section className="detail-section v25-series-profile">
              <span>시리즈 전술</span>
              <p><b>{card.series}</b> · {SERIES_BY_ID[card.seriesId].mechanic}</p>
            </section>
          )}

          {summonCondition && (
            <section className="detail-section summon-condition">
              <span>소환 조건</span>
              <p>{summonCondition}</p>
            </section>
          )}

          <section className="detail-section detail-lore">
            <span>LORE</span>
            <p>{card.flavor}</p>
          </section>

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

function GameGuideModal({ onClose }: { onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', close);
    return () => {
      window.removeEventListener('keydown', close);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [onClose]);

  return (
    <div className="modal-layer v20-guide-layer" role="presentation" onMouseDown={(event: React.MouseEvent) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="v20-guide-modal" role="dialog" aria-modal="true" aria-labelledby="v20-guide-title">
        <header><div><span>FIELD MANUAL</span><h2 id="v20-guide-title">ECLIPSE DUEL 룰 가이드</h2><p>첫 결투 전에 핵심 규칙만 빠르게 확인할 수 있습니다.</p></div><button ref={closeButtonRef} className="modal-close" type="button" onClick={onClose} aria-label="룰 가이드 닫기">×</button></header>
        <div className="v20-guide-grid">
          <article><b>01 · 승리 조건</b><p>상대 코어 25를 0으로 만들면 승리합니다. 덱을 더 이상 뽑을 수 없는 상황도 패배로 처리됩니다.</p></article>
          <article><b>02 · 턴 흐름</b><p>메인 단계에서 소환·주문·함정을 준비하고, 배틀 단계에서 공격합니다. 각 턴은 60초 안에 결정해야 합니다.</p></article>
          <article><b>03 · 에너지</b><p>내 턴이 돌아올 때 최대 에너지가 성장하며 10에서 멈춥니다. 카드는 표시된 비용만큼 에너지를 사용합니다.</p></article>
          <article><b>04 · 특수 소환</b><p>균열은 조건과 에너지를, 공명 융합은 지정 소재를, 계승 진화는 조건을 만족한 필드 유닛을 요구합니다.</p></article>
          <article><b>05 · 전투 키워드</b><p><strong>수호</strong>는 공격 우선 대상, <strong>속공</strong>은 소환 턴 공격, <strong>흡수</strong>는 실제 전투 피해 회복, <strong>관통</strong>은 초과 피해를 코어에 전달합니다.</p></article>
          <article><b>06 · 조작 팁</b><p>카드의 <strong>i</strong> 버튼으로 언제든 상세 정보를 볼 수 있습니다. 선택 중 <strong>Esc</strong>를 누르면 카드·공격 대상을 취소합니다.</p></article>
          <article><b>07 · 시리즈 링크</b><p>같은 시리즈 카드는 서로 서치·회수·강화·보호막·에너지·코어 압박으로 연계됩니다. 상세 보기의 <strong>SERIES LINK</strong>를 확인하고 한 시리즈를 중심으로 덱을 설계해보세요.</p></article>
        </div>
        <div className="v20-guide-footer"><span>정보가 곧 실력입니다. 카드 효과와 발동 조건은 상세 보기에서 확인하세요.</span><button className="primary-button" type="button" onClick={onClose}>확인하고 돌아가기</button></div>
      </section>
    </div>
  );
}

function ControlCenter({
  open,
  soundEnabled,
  soundVolume,
  onClose,
  onToggleSound,
  onVolumeChange,
  onOpenGuide,
  onOpenProfile,
  onSignOut,
}: {
  open: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  onClose: () => void;
  onToggleSound: () => void;
  onVolumeChange: (volume: number) => void;
  onOpenGuide: () => void;
  onOpenProfile: () => void;
  onSignOut: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    if (!open) return undefined;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="v22-control-layer" role="presentation" onMouseDown={(event: React.MouseEvent) => { if (event.currentTarget === event.target) onClose(); }}>
      <aside className="v22-control-panel" role="dialog" aria-modal="true" aria-label="게임 설정">
        <header>
          <div><span>SYSTEM PANEL</span><h3>게임 설정</h3><p>오디오와 게임 도움말을 한곳에서 관리합니다.</p></div>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="설정 닫기">×</button>
        </header>
        <section className="v22-control-section">
          <div className="v22-control-row">
            <div><b>게임 사운드</b><span>효과음과 전투 피드백 사운드</span></div>
            <button className={`v22-toggle ${soundEnabled ? 'active' : ''}`} type="button" onClick={onToggleSound} aria-pressed={soundEnabled}><i />{soundEnabled ? 'ON' : 'OFF'}</button>
          </div>
          <label className="v22-volume-control">
            <span><b>볼륨</b><em>{Math.round(soundVolume * 100)}%</em></span>
            <input type="range" min="0" max="100" step="5" value={Math.round(soundVolume * 100)} onChange={(event: ChangeEvent<HTMLInputElement>) => onVolumeChange(Number(event.target.value) / 100)} disabled={!soundEnabled} />
          </label>
        </section>
        <section className="v22-control-actions">
          <button type="button" onClick={onOpenGuide}><span>?</span><div><b>룰 가이드</b><small>키워드와 기본 규칙 확인</small></div></button>
          <button type="button" onClick={onOpenProfile}><span>◎</span><div><b>프로필</b><small>아바타와 프로필 스킨 관리</small></div></button>
        </section>
        <footer><span>ECLIPSE DUEL · COMMERCIAL BUILD v26</span><button type="button" onClick={onSignOut}>로그아웃</button></footer>
      </aside>
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
        <footer><span>VERSION 0.9.0 · RETAIL STABILIZED</span><span>ORIGINAL IP</span></footer>
      </section>
    </main>
  );

}


function AccountErrorScreen({ message, onRetry, onSignOut }: { message: string; onRetry: () => void; onSignOut: () => void }) {
  return (
    <main className="account-error-screen">
      <div className="connection-backdrop" aria-hidden="true"><span /><span /><span /></div>
      <section className="connection-card">
        <div className="connection-emblem warning"><span>↻</span></div>
        <span className="error-code">CONNECTION RECOVERY</span>
        <h1>서비스 연결을 다시 확인하고 있습니다.</h1>
        <p>{friendlyServiceMessage(message)}</p>
        <div className="setup-steps">
          <span><b>1</b><em>인터넷 연결 상태 확인</em></span>
          <span><b>2</b><em>잠시 후 다시 연결</em></span>
          <span><b>3</b><em>계속되면 다시 로그인</em></span>
        </div>
        <div className="connection-actions">
          <button className="primary-button" onClick={onRetry}>다시 연결</button>
          <button className="ghost-button" onClick={onSignOut}>로그아웃</button>
        </div>
      </section>
    </main>
  );
}

function HomeView({ hub, onNavigate, serverStatus }: { hub: HubData; onNavigate: (view: View) => void; serverStatus: SecureServerStatus }) {
  const activeDeck = hub.decks.find((deck) => deck.is_active) ?? hub.decks[0];
  const level = levelFromXp(hub.profile.xp);
  const deckMain = activeDeck?.cards?.length ?? 0;
  const deckExtra = activeDeck?.extra_cards?.length ?? 0;
  const deckReady = Boolean(activeDeck && deckMain === DECK_SIZE && deckExtra === EXTRA_DECK_SIZE);
  const xpInLevel = Math.max(0, hub.profile.xp % 1000);
  const winTotal = hub.profile.wins + hub.profile.losses;
  const featuredPool = [
    CARD_BY_ID.fusion_eclipse_chimera,
    CARD_BY_ID.evolution_ember_phoenix,
    CARD_BY_ID.unit_crownless_titan,
    CARD_BY_ID.unit_rift_wanderer,
  ].filter((card): card is CardDefinition => Boolean(card));
  const featureCard = featuredPool[(level + hub.profile.wins) % Math.max(1, featuredPool.length)] ?? CARDS[0];
  const friends = hub.friends.slice(0, 4);

  return (
    <div className="v19-home">
      <section className="v19-hero-shell">
        <div className="v19-hero-copy">
          <div className="v19-status-line">
            <span className={`v19-online-dot ${serverStatus.secureDuelReady ? 'ready' : 'warning'}`} />
            <b>{serverStatus.secureDuelReady ? 'ECLIPSE NETWORK · ONLINE' : 'ECLIPSE NETWORK · SERVICE CHECK'}</b>
            <small>{publicServerStatusMessage(serverStatus)}</small>
          </div>
          <span className="v19-season-label">SEASON 01 · ASCENSION</span>
          <h1>덱을 설계하고,<br /><strong>판도를 뒤집으세요.</strong></h1>
          <p>30장 메인 덱과 6장 엑스트라 덱. 8개 시리즈의 연계 효과와 균열 소환, 공명 융합, 계승 진화를 엮어 한 수 앞을 설계하는 온라인 전략 TCG.</p>
          <div className="v19-hero-actions">
            <button className="v19-play-button" onClick={() => onNavigate('duel')}>
              <span className="v19-action-icon"><GameIcon name="duel" /></span>
              <span><b>대전 시작</b><small>빠른 매칭 · 친선전 · 방 대전</small></span>
              <em>PLAY</em>
            </button>
            <button className="v19-sub-action" onClick={() => onNavigate('deck')}><GameIcon name="deck" /><span><b>덱 편집</b><small>자동 구성과 직접 편집</small></span></button>
            <button className="v19-sub-action" onClick={() => onNavigate('shop')}><GameIcon name="shop" /><span><b>상점</b><small>카드팩 · 프로필 스킨</small></span></button>
          </div>
          <div className="v19-hero-stats">
            <span><small>LEVEL</small><b>{level}</b></span>
            <span><small>RECORD</small><b>{winTotal > 0 ? `${hub.profile.wins}승 ${hub.profile.losses}패` : '첫 대전 준비'}</b></span>
            <span><small>COLLECTION</small><b>{hub.collection.length}<em> / {CARDS.length}</em></b></span>
          </div>
        </div>

        <div className="v19-hero-stage" aria-label="추천 카드">
          <div className="v19-stage-orbit" aria-hidden="true"><i /><i /><i /><span /></div>
          <div className="v19-feature-card-wrap"><CardFace card={featureCard} /></div>
          <div className="v19-feature-meta"><small>FEATURED CARD</small><b>{featureCard.name}</b><span>{RARITY_LABEL[featureCard.rarity]} · {ELEMENT_LABEL[featureCard.element]}</span><button onClick={() => requestCardInspection(featureCard.id)}>카드 상세 보기</button></div>
        </div>
      </section>

      <section className="v19-dashboard-grid">
        <article className="v19-current-deck-card">
          <header><div><small>CURRENT DECK</small><h2>{activeDeck?.name ?? '활성 덱 없음'}</h2></div><button onClick={() => onNavigate('deck')} aria-label="덱 편집"><GameIcon name="deck" /></button></header>
          <div className="v19-deck-visual" aria-hidden="true"><span className="v19-deck-stack"><i /><i /><b>E</b></span><span className="v19-deck-ring" /></div>
          <div className="v19-deck-progress">
            <span><small>MAIN</small><b>{deckMain} / {DECK_SIZE}</b><i><em style={{ width: `${Math.min(100, deckMain / DECK_SIZE * 100)}%` }} /></i></span>
            <span><small>EXTRA</small><b>{deckExtra} / {EXTRA_DECK_SIZE}</b><i><em style={{ width: `${Math.min(100, deckExtra / EXTRA_DECK_SIZE * 100)}%` }} /></i></span>
          </div>
          <button className={`v19-wide-cta ${deckReady ? 'ready' : 'warning'}`} onClick={() => onNavigate(deckReady ? 'duel' : 'deck')}>{deckReady ? '이 덱으로 대전하기' : '덱을 완성하세요'} <span>›</span></button>
        </article>

        <article className="v19-mode-card v19-mode-ranked" onClick={() => onNavigate('duel')}>
          <div className="v19-mode-icon"><GameIcon name="duel" /></div>
          <div><small>MATCH</small><h3>빠른 대전</h3><p>대기 중인 상대와 바로 연결합니다.</p></div><span className="v19-mode-arrow">›</span>
        </article>
        <article className="v19-mode-card" onClick={() => onNavigate('duel')}>
          <div className="v19-mode-icon"><span>+</span></div>
          <div><small>PRIVATE</small><h3>친구와 대전</h3><p>방을 만들거나 코드를 입력해 참가합니다.</p></div><span className="v19-mode-arrow">›</span>
        </article>
        <article className="v19-mode-card" onClick={() => onNavigate('collection')}>
          <div className="v19-mode-icon"><GameIcon name="collection" /></div>
          <div><small>COLLECTION</small><h3>카드 보관함</h3><p>{hub.collection.length}종 보유 · 효과와 소환 조건 확인</p></div><span className="v19-mode-arrow">›</span>
        </article>

        <article className="v19-social-card">
          <header><div><small>SOCIAL</small><h3>친구</h3></div><button onClick={() => onNavigate('friends')}>전체 보기</button></header>
          <div className="v19-friend-grid">
            {friends.length > 0 ? friends.map((friend) => (
              <button key={friend.user_id} onClick={() => onNavigate('friends')}><Avatar id={friend.avatar} size="small" /><span><b><NicknameText name={friend.display_name} styleId={friend.nickname_style} /></b><small>LV.{levelFromXp(friend.xp)} · {friend.wins}승</small></span><i /></button>
            )) : <button className="v19-add-friend" onClick={() => onNavigate('friends')}><span>+</span><b>친구 추가</b><small>친구 코드로 결투가를 찾아보세요.</small></button>}
          </div>
        </article>

        <article className="v19-season-card">
          <div className="v19-season-copy"><small>SEASON PROGRESS</small><h3>ECLIPSE: ASCENSION</h3><p>다음 레벨까지 {1000 - xpInLevel} XP</p></div>
          <div className="v19-level-emblem"><span>{level}</span><small>LV</small></div>
          <div className="v19-season-bar"><i><em style={{ width: `${Math.min(100, xpInLevel / 10)}%` }} /></i><span>{xpInLevel} / 1000 XP</span></div>
        </article>

        <article className={`v19-server-card ${serverStatus.secureDuelReady ? 'ready' : 'warning'}`}>
          <div className="v19-server-symbol"><span>{serverStatus.secureDuelReady ? '✓' : '!'}</span></div>
          <div><small>DUEL SERVER</small><h3>{serverStatus.secureDuelReady ? '온라인 대전 준비 완료' : '온라인 대전 점검 중'}</h3><p>{serverStatus.secureDuelReady ? '매칭, 방 대전, 비공개 카드 상태가 정상 동기화됩니다.' : publicServerStatusMessage(serverStatus)}</p></div>
          <button onClick={() => onNavigate('duel')}>{serverStatus.secureDuelReady ? '대전으로' : '확인'} ›</button>
        </article>
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
  const [seriesFilter, setSeriesFilter] = useState<'all' | SeriesId>('all');
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
    if (seriesFilter !== 'all' && card.seriesId !== seriesFilter) return false;
    if (search && !`${card.name} ${card.text} ${card.subtitle} ${card.series ?? ''}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'cost') return a.cost - b.cost || a.name.localeCompare(b.name, 'ko');
    if (sort === 'rarity') return rarityWeight[b.rarity] - rarityWeight[a.rarity] || a.cost - b.cost;
    if (sort === 'name') return a.name.localeCompare(b.name, 'ko');
    const score = (card: CardDefinition) => rarityWeight[card.rarity] * 7 + (card.element === dominantElement ? 5 : 0) - card.cost * 0.35;
    return score(b) - score(a);
  }), [collection, kind, element, seriesFilter, search, sort, dominantElement]);

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
    if (seriesFilter !== 'all') score += card.seriesId === seriesFilter ? 28 : -4;
    if (card.seriesAbility) score += 6;
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
        const archetypeCore = seriesFilter !== 'all' && card.seriesId === seriesFilter;
        const desiredCopies = card.rarity === 'legendary' ? 1 : card.rarity === 'epic' ? Math.min(2, limit) : Math.min((archetypeCore || (style === 'theme' && card.element === primary)) ? 3 : 2, limit);
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
    const styleLabel = seriesFilter !== 'all'
      ? `${SERIES_BY_ID[seriesFilter].shortName} 시리즈형`
      : { balanced: '균형형', aggro: '속공형', control: '컨트롤형', theme: `${ELEMENT_LABEL[primary]} 테마형` }[style];
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
  const averageCost = deckCards.length > 0 ? deckCards.reduce((sum, id) => sum + (CARD_BY_ID[id]?.cost ?? 0), 0) / deckCards.length : 0;
  const costCurve = useMemo(() => {
    const bins = [0, 0, 0, 0, 0, 0, 0];
    for (const id of deckCards) {
      const cost = CARD_BY_ID[id]?.cost ?? 0;
      const index = cost <= 1 ? 0 : cost >= 7 ? 6 : cost - 1;
      bins[index] += 1;
    }
    return bins;
  }, [deckCards]);
  const curveMax = Math.max(1, ...costCurve);
  const deckDoctor = useMemo(() => {
    const early = deckCards.filter((id) => (CARD_BY_ID[id]?.cost ?? 99) <= 2).length;
    const late = deckCards.filter((id) => (CARD_BY_ID[id]?.cost ?? 0) >= 6).length;
    const interaction = spellCount + trapCount;
    const elementCounts: Partial<Record<Element, number>> = {};
    for (const id of deckCards) {
      const card = CARD_BY_ID[id];
      if (!card) continue;
      elementCounts[card.element] = (elementCounts[card.element] ?? 0) + 1;
    }
    const [focusElement, focusCount] = (Object.entries(elementCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0] ?? ['neutral', 0]) as [Element, number];
    const seriesCounts: Partial<Record<SeriesId, number>> = {};
    let seriesLinkCount = 0;
    for (const id of deckCards) {
      const card = CARD_BY_ID[id];
      if (!card?.seriesId) continue;
      seriesCounts[card.seriesId] = (seriesCounts[card.seriesId] ?? 0) + 1;
      if (card.seriesAbility) seriesLinkCount += 1;
    }
    const [focusSeries, focusSeriesCount] = (Object.entries(seriesCounts).sort((a, b) => Number(b[1]) - Number(a[1]))[0] ?? [null, 0]) as [SeriesId | null, number];
    let score = 100;
    const tips: string[] = [];
    if (deckCards.length !== DECK_SIZE) { score -= 28; tips.push(`메인 덱을 ${DECK_SIZE}장까지 완성하세요.`); }
    if (extraCards.length !== EXTRA_DECK_SIZE) { score -= 10; tips.push(`엑스트라 덱을 ${EXTRA_DECK_SIZE}장까지 채우면 특수 소환 선택지가 안정됩니다.`); }
    if (unitCount < 15) { score -= 18; tips.push('유닛이 부족합니다. 초중반 필드 유지력을 위해 최소 15장을 권장합니다.'); }
    if (early < 6) { score -= 12; tips.push('1~2비용 카드가 적습니다. 초반 손패 사고를 줄이려면 6장 이상을 권장합니다.'); }
    if (late > 8) { score -= 10; tips.push('6비용 이상 카드가 많아 손패가 무거울 수 있습니다. 고비용 카드를 8장 이하로 줄여보세요.'); }
    if (averageCost > 4.4) { score -= 12; tips.push(`평균 비용 ${averageCost.toFixed(1)}은 다소 무겁습니다. 3.0~4.2 구간이 안정적입니다.`); }
    if (averageCost > 0 && averageCost < 2.2) { score -= 7; tips.push('평균 비용이 매우 낮습니다. 후반 결정력을 위한 중고비용 카드가 필요합니다.'); }
    if (interaction < 5) { score -= 9; tips.push('주문·함정 비중이 낮습니다. 상대 전개에 대응할 카드 5장 이상을 권장합니다.'); }
    if (deckCards.length > 0 && focusCount / deckCards.length < 0.34) { score -= 6; tips.push('속성이 지나치게 분산되어 있습니다. 핵심 속성 1~2개에 집중하면 시너지가 선명해집니다.'); }
    if (seriesFilter !== 'all' && focusSeriesCount < 12) { score -= 8; tips.push(`${SERIES_BY_ID[seriesFilter].shortName} 연계를 안정적으로 보기 위해 메인 덱에 시리즈 카드 12장 이상을 권장합니다.`); }
    if (focusSeries && focusSeriesCount >= 12 && seriesLinkCount < 3) { score -= 5; tips.push(`${SERIES_BY_ID[focusSeries].shortName} 카드는 충분하지만 SERIES LINK 엔진 카드가 적습니다. 서치·회수·강화 효과 카드를 3장 이상 확보해보세요.`); }
    if (!validation && tips.length === 0) tips.push('곡선과 카드 비율, 시리즈 연계가 안정적입니다. 실제 대전에서 첫 5턴 손패를 기준으로 미세 조정하세요.');
    const bounded = Math.max(0, Math.min(100, score));
    const label = bounded >= 90 ? '대전 준비 완료' : bounded >= 75 ? '안정적' : bounded >= 55 ? '조정 권장' : '재구성 필요';
    return { score: bounded, label, tips: tips.slice(0, 3), early, late, focusElement, focusCount, focusSeries, focusSeriesCount, seriesLinkCount };
  }, [deckCards, extraCards, unitCount, spellCount, trapCount, averageCost, validation, seriesFilter]);

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
              ['balanced', '균형형'], ['aggro', '속공형'], ['control', '컨트롤형'], ['theme', seriesFilter !== 'all' ? `${SERIES_BY_ID[seriesFilter].shortName} 시리즈` : `${ELEMENT_LABEL[element !== 'all' ? element : dominantElement]} 테마`],
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
            <select value={seriesFilter} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSeriesFilter(event.target.value as 'all' | SeriesId)}>
              <option value="all">모든 시리즈</option>{CARD_SERIES.map((series) => <option key={series.id} value={series.id}>{series.shortName}</option>)}
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
          <section className={`v22-deck-doctor grade-${deckDoctor.score >= 90 ? 's' : deckDoctor.score >= 75 ? 'a' : deckDoctor.score >= 55 ? 'b' : 'c'}`}>
            <div className="v22-doctor-score"><span><b>{deckDoctor.score}</b><small>/100</small></span><div><small>DECK HEALTH</small><strong>{deckDoctor.label}</strong><em>{deckDoctor.focusSeries && deckDoctor.focusSeriesCount >= 8 ? `${SERIES_BY_ID[deckDoctor.focusSeries].shortName} ${deckDoctor.focusSeriesCount}장 · LINK ${deckDoctor.seriesLinkCount}장` : `${ELEMENT_LABEL[deckDoctor.focusElement]} 중심`} · 초반 {deckDoctor.early}장 · 고비용 {deckDoctor.late}장</em></div></div>
            <div className="v22-doctor-meter"><i style={{ width: `${deckDoctor.score}%` }} /></div>
            <ul>{deckDoctor.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </section>
          <section className="v20-deck-analytics" aria-label="덱 비용 분석">
            <div className="v20-deck-metrics"><span><small>평균 비용</small><b>{averageCost.toFixed(1)}</b></span><span><small>유닛</small><b>{unitCount}</b></span><span><small>주문 / 함정</small><b>{spellCount} / {trapCount}</b></span></div>
            <div className="v20-cost-curve">{costCurve.map((count, index) => <span key={index}><i style={{ height: `${Math.max(8, (count / curveMax) * 100)}%` }} /><b>{count}</b><small>{['0-1','2','3','4','5','6','7+'][index]}</small></span>)}</div>
          </section>
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
  const [shopTab, setShopTab] = useState<'packs' | 'profile'>('packs');
  const [cosmeticFilter, setCosmeticFilter] = useState<'all' | ProfileCosmeticKind>('all');
  const [busyCosmetic, setBusyCosmetic] = useState('');
  const [busyPack, setBusyPack] = useState('');
  const [opened, setOpened] = useState<string[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [openingPackId, setOpeningPackId] = useState('');
  const [openingStage, setOpeningStage] = useState<'idle' | 'sealed' | 'tearing' | 'reveal' | 'summary'>('idle');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [error, setError] = useState('');
  const selectedPack = PACKS.find((pack) => pack.id === openingPackId);
  const corePacks = PACKS.filter((pack) => pack.category === 'core');
  const seriesPacks = PACKS.filter((pack) => pack.category === 'series');

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


  async function buyCosmetic(cosmeticId: string) {
    setBusyCosmetic(cosmeticId);
    setError('');
    try {
      const result = await api('buy_profile_cosmetic', { cosmeticId });
      if (result.hub) onHub(result.hub);
      playUiSound('success');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '프로필 아이템 구매에 실패했습니다.');
    } finally {
      setBusyCosmetic('');
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

  function renderPackCard(pack: (typeof PACKS)[number], index: number) {
    const series = pack.seriesId ? SERIES_BY_ID[pack.seriesId] : null;
    return (
      <article className={`pack-card v6-pack-card ${series ? `series-${series.id}` : `core-${pack.id}`}`} key={pack.id} style={{ '--pack-accent': pack.accent } as CSSProperties}>
        <PackProductVisual pack={pack} />
        <div className="pack-product-copy">
          <span className="eyebrow">{series ? `SERIES ${String(index + 1).padStart(2, '0')} · ${series.mechanic}` : `CORE BOOSTER · 5 CARDS`}</span>
          <h3>{pack.name}</h3>
          <p>{pack.tagline}</p>
          {series && <div className="v25-series-pack-note"><b>{series.shortName}</b><span>{series.mechanic}</span></div>}
          <div className="v20-pack-odds">
            <span><small>기본 슬롯</small><b>전설 {pack.odds.legendary}%</b><em>영웅 {pack.odds.epic}% · 희귀 {pack.odds.rare}% · 일반 {pack.odds.common}%</em></span>
            <p>{pack.odds.guaranteedSlots}칸 {RARITY_LABEL[pack.guaranteed]} 이상 보장{series ? ` · 시리즈 카드 ${pack.odds.seriesGuaranteedSlots ?? 2}장 이상 보장 · 일반 슬롯 ${pack.odds.seriesRate ?? 75}% 시리즈 픽업` : ''}</p>
          </div>
          <div className="pack-price"><b>{pack.price}</b> COIN</div>
          <button className="primary-button" disabled={busyPack === pack.id || hub.wallet.coins < pack.price} onClick={() => buy(pack.id)}>
            {busyPack === pack.id ? '팩을 준비하는 중...' : hub.wallet.coins < pack.price ? '코인 부족' : '팩 구매 및 개봉'}
          </button>
        </div>
      </article>
    );
  }

  return (
    <div className="view-stack v6-shop-view v17-shop-view">
      <section className="section-heading v6-section-heading">
        <div><span className="eyebrow">ECLIPSE MARKET</span><h2>상점</h2><p>카드팩과 프로필 스킨을 구매해 덱과 결투가 화면을 꾸미세요.</p></div>
        <div className="currency-pill"><small>COIN</small>{hub.wallet.coins.toLocaleString()}</div>
      </section>
      <div className="v17-shop-tabs">
        <button className={shopTab === 'packs' ? 'active' : ''} onClick={() => setShopTab('packs')}><b>카드팩</b><small>새 카드 획득</small></button>
        <button className={shopTab === 'profile' ? 'active' : ''} onClick={() => setShopTab('profile')}><b>꾸미기</b><small>배경 · 프레임 · 문양/아이콘 · 슬리브 · 닉네임</small></button>
      </div>
      {error && <p className="error-banner">{error}</p>}
      {shopTab === 'packs' ? (
        <div className="v25-pack-store">
          <section className="v25-pack-category">
            <header><div><span>CORE BOOSTERS</span><h3>기본 카드팩</h3><p>속성 제한 없이 전체 카드 풀에서 랜덤 획득합니다.</p></div><small>GENERAL · RARE · LEGENDARY</small></header>
            <div className="pack-grid v6-pack-grid v25-core-pack-grid">{corePacks.map((pack, index) => renderPackCard(pack, index))}</div>
          </section>
          <section className="v25-pack-category v25-series-category">
            <header><div><span>SERIES BOOSTERS</span><h3>시리즈 카드팩</h3><p>같은 이름만 묶은 카드가 아니라 서로 서치·강화·회수·에너지 연계가 실제로 작동하는 아키타입 팩입니다.</p></div><small>{CARD_SERIES.length} ARCHETYPES</small></header>
            <div className="pack-grid v6-pack-grid v25-series-pack-grid">{seriesPacks.map((pack, index) => renderPackCard(pack, index))}</div>
          </section>
        </div>
      ) : (
        <div className="v26-cosmetic-store">
          <div className="v26-cosmetic-filter">
            <button className={cosmeticFilter === 'all' ? 'active' : ''} onClick={() => setCosmeticFilter('all')}>전체</button>
            {(['background','frame','emblem','sleeve','nickname'] as ProfileCosmeticKind[]).map((kind) => <button key={kind} className={cosmeticFilter === kind ? 'active' : ''} onClick={() => setCosmeticFilter(kind)}>{COSMETIC_KIND_LABEL[kind]}</button>)}
          </div>
          <section className="v17-cosmetic-grid">
          {PROFILE_COSMETICS.filter((item) => cosmeticFilter === 'all' || item.kind === cosmeticFilter).map((item) => {
            const owned = (hub.profileCosmetics ?? []).includes(item.id);
            return (
              <article className={`v17-cosmetic-card kind-${item.kind} rarity-${item.rarity}`} key={item.id} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>
                <CosmeticPreview item={item} profile={hub.profile} />
                <div className="v17-cosmetic-copy"><span className="eyebrow">{item.rarity.toUpperCase()} · {COSMETIC_KIND_LABEL[item.kind]}</span><h3>{item.name}</h3><p>{item.description}</p></div>
                <div className="v17-cosmetic-buy"><strong>{item.price.toLocaleString()} COIN</strong><button className="primary-button" disabled={owned || busyCosmetic === item.id || hub.wallet.coins < item.price} onClick={() => buyCosmetic(item.id)}>{owned ? '보유 중' : busyCosmetic === item.id ? '구매 중...' : hub.wallet.coins < item.price ? '코인 부족' : '구매'}</button></div>
              </article>
            );
          })}
          </section>
        </div>
      )}

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
                <div className={`reveal-card-focus rarity-${CARD_BY_ID[opened[activeCardIndex]]?.rarity ?? 'common'} ${revealed[activeCardIndex] ? 'is-revealed' : ''}`}>
                  <div className="card-stack-shadow shadow-a" /><div className="card-stack-shadow shadow-b" />
                  <CardFace
                    card={CARD_BY_ID[opened[activeCardIndex]]}
                    hidden={!revealed[activeCardIndex]}
                    sleeveId={hub.profile.card_sleeve ?? 'sleeve_default'}
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
  const [seriesFilter, setSeriesFilter] = useState<'all' | SeriesId>('all');
  const collection = Object.fromEntries(hub.collection.map((row) => [row.card_id, row.quantity]));
  const ownedUnique = CARDS.filter((card) => (collection[card.id] ?? 0) > 0);
  const ownedCopies = hub.collection.reduce((sum, row) => sum + row.quantity, 0);
  const completion = CARDS.length > 0 ? Math.round((ownedUnique.length / CARDS.length) * 100) : 0;
  const raritySummary = (['common', 'rare', 'epic', 'legendary'] as Rarity[]).map((tier) => {
    const total = CARDS.filter((card) => card.rarity === tier).length;
    const owned = ownedUnique.filter((card) => card.rarity === tier).length;
    return { tier, total, owned };
  });
  const visible = ownedUnique
    .filter((card) => rarity === 'all' || card.rarity === rarity)
    .filter((card) => seriesFilter === 'all' || card.seriesId === seriesFilter)
    .filter((card) => !search || `${card.name} ${card.text} ${card.series ?? ''}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="view-stack">
      <section className="section-heading">
        <div><span className="eyebrow">CARD VAULT</span><h2>보관함</h2><p>{visible.length}종의 카드가 표시되고 있습니다.</p></div>
        <div className="collection-tools"><input value={search} onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} placeholder="카드 검색" /><select value={rarity} onChange={(event: ChangeEvent<HTMLSelectElement>) => setRarity(event.target.value as 'all' | Rarity)}><option value="all">모든 등급</option>{Object.entries(RARITY_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><select value={seriesFilter} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSeriesFilter(event.target.value as 'all' | SeriesId)}><option value="all">모든 시리즈</option>{CARD_SERIES.map((series) => <option key={series.id} value={series.id}>{series.shortName}</option>)}</select></div>
      </section>
      <section className="v22-vault-summary panel">
        <div className="v22-vault-completion"><span><small>COLLECTION</small><b>{completion}%</b></span><div><strong>{ownedUnique.length} / {CARDS.length}종 수집</strong><i><b style={{ width: `${completion}%` }} /></i><em>총 보유 카드 {ownedCopies.toLocaleString()}장</em></div></div>
        <div className="v22-vault-rarities">{raritySummary.map((item) => <button type="button" key={item.tier} className={`rarity-${item.tier}`} onClick={() => setRarity(item.tier)}><span>{RARITY_LABEL[item.tier]}</span><b>{item.owned}<small>/{item.total}</small></b></button>)}</div>
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
          {incoming.length > 0 && <div className="request-list"><h4>받은 요청</h4>{incoming.map((request) => { const profile = profileMap[request.sender_id]; return <div key={request.id}><Avatar id={profile?.avatar} size="small" /><span><b><NicknameText name={profile?.display_name ?? '결투가'} styleId={profile?.nickname_style} /></b><small>{profile?.player_code}</small></span><button onClick={() => respond(request.id, true)}>수락</button><button onClick={() => respond(request.id, false)}>거절</button></div>; })}</div>}
          {outgoing.length > 0 && <div className="request-list"><h4>보낸 요청</h4>{outgoing.map((request) => { const profile = profileMap[request.receiver_id]; return <div key={request.id}><Avatar id={profile?.avatar} size="small" /><span><b><NicknameText name={profile?.display_name ?? '결투가'} styleId={profile?.nickname_style} /></b><small>응답 대기 중</small></span></div>; })}</div>}
        </article>
        <article className="panel friend-list-panel">
          <header><h3>친구 목록</h3><span>{hub.friends.length}명</span></header>
          <div className="friend-list">
            {hub.friends.length === 0 && <div className="empty-state"><span>♢</span><p>아직 등록된 친구가 없습니다.</p></div>}
            {hub.friends.map((friend) => <div className="friend-row" key={friend.user_id}><Avatar id={friend.avatar} /><span><b><NicknameText name={friend.display_name} styleId={friend.nickname_style} /></b><small>{friend.status_message}</small></span><div><em>LV.{levelFromXp(friend.xp)}</em><small>{friend.wins}승 · 승률 {winRate(friend)}%</small></div><button onClick={() => remove(friend.user_id)}>삭제</button></div>)}
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
  const [theme, setTheme] = useState(hub.profile.profile_theme ?? 'bg_default');
  const [frame, setFrame] = useState(hub.profile.profile_frame ?? 'frame_default');
  const [emblem, setEmblem] = useState(hub.profile.profile_emblem ?? 'emblem_default');
  const [sleeve, setSleeve] = useState(hub.profile.card_sleeve ?? 'sleeve_default');
  const [nicknameStyle, setNicknameStyle] = useState(hub.profile.nickname_style ?? 'nickname_default');
  const [message, setMessage] = useState('');

  async function save() {
    try {
      const result = await api('update_profile', { displayName: name, statusMessage: status, avatar });
      if (result.hub) onHub(result.hub);
      setMessage('프로필을 저장했습니다.');
    } catch (error) { setMessage(error instanceof Error ? error.message : '저장 실패'); }
  }

  async function equipCosmetic(cosmeticId: string) {
    try {
      const result = await api('equip_profile_cosmetic', { cosmeticId });
      if (result.hub) {
        onHub(result.hub);
        setTheme(result.hub.profile.profile_theme ?? 'bg_default');
        setFrame(result.hub.profile.profile_frame ?? 'frame_default');
        setEmblem(result.hub.profile.profile_emblem ?? 'emblem_default');
        setSleeve(result.hub.profile.card_sleeve ?? 'sleeve_default');
        setNicknameStyle(result.hub.profile.nickname_style ?? 'nickname_default');
      }
      setMessage('프로필 스킨을 적용했습니다.');
      playUiSound('success');
    } catch (error) { setMessage(error instanceof Error ? error.message : '스킨 적용 실패'); }
  }

  return (
    <div className="profile-layout">
      <section className={`profile-card panel v17-profile-card theme-${theme} frame-${frame} emblem-${emblem} nickname-${nicknameStyle}`}>
        <ProfileFrameFX frameId={frame} />
        <span className={`v26-equipped-emblem emblem-${emblem}`}>{emblemGlyph(emblem)}</span>
        <Avatar id={avatar} size="large" />
        <span className="eyebrow">DUELIST PROFILE</span>
        <h2><NicknameText name={hub.profile.display_name} styleId={nicknameStyle} /></h2>
        <p>{hub.profile.status_message}</p>
        <div className="profile-code">{hub.profile.player_code}</div>
        <div className="profile-stats"><span><b>LV.{levelFromXp(hub.profile.xp)}</b><small>레벨</small></span><span><b>{hub.profile.wins}</b><small>승리</small></span><span><b>{winRate(hub.profile)}%</b><small>승률</small></span></div>
      </section>
      <section className="profile-editor panel">
        <span className="eyebrow">CUSTOMIZE</span><h2>프로필 편집</h2>
        <label><span>플레이어 이름</span><input value={name} onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)} maxLength={16} /></label>
        <label><span>상태 메시지</span><input value={status} onChange={(event: ChangeEvent<HTMLInputElement>) => setStatus(event.target.value)} maxLength={60} /></label>
        <label><span>프로필 아이콘</span><div className="avatar-picker">{AVATARS.map((id) => <button className={avatar === id ? 'active' : ''} key={id} onClick={() => setAvatar(id)}><Avatar id={id} /></button>)}</div></label>
        <div className="v17-profile-skin-picker"><span>보유 프로필 배경</span><div><button className={theme === 'bg_default' ? 'active' : ''} onClick={() => equipCosmetic('bg_default')}>기본</button>{PROFILE_COSMETICS.filter((item) => item.kind === 'background' && (hub.profileCosmetics ?? []).includes(item.id)).map((item) => <button className={theme === item.id ? 'active' : ''} key={item.id} onClick={() => equipCosmetic(item.id)} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>{item.name}</button>)}</div></div>
        <div className="v17-profile-skin-picker"><span>보유 프로필 프레임</span><div><button className={frame === 'frame_default' ? 'active' : ''} onClick={() => equipCosmetic('frame_default')}>기본</button>{PROFILE_COSMETICS.filter((item) => item.kind === 'frame' && (hub.profileCosmetics ?? []).includes(item.id)).map((item) => <button className={frame === item.id ? 'active' : ''} key={item.id} onClick={() => equipCosmetic(item.id)} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>{item.name}</button>)}</div></div>
        <div className="v17-profile-skin-picker"><span>보유 프로필 문양/아이콘</span><div><button className={emblem === 'emblem_default' ? 'active' : ''} onClick={() => equipCosmetic('emblem_default')}>기본 E</button>{PROFILE_COSMETICS.filter((item) => item.kind === 'emblem' && (hub.profileCosmetics ?? []).includes(item.id)).map((item) => <button className={emblem === item.id ? 'active' : ''} key={item.id} onClick={() => equipCosmetic(item.id)} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>{item.glyph} {item.name}</button>)}</div></div>
        <div className="v17-profile-skin-picker"><span>보유 카드 슬리브</span><div><button className={sleeve === 'sleeve_default' ? 'active' : ''} onClick={() => equipCosmetic('sleeve_default')}>기본</button>{PROFILE_COSMETICS.filter((item) => item.kind === 'sleeve' && (hub.profileCosmetics ?? []).includes(item.id)).map((item) => <button className={sleeve === item.id ? 'active' : ''} key={item.id} onClick={() => equipCosmetic(item.id)} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>{item.name}</button>)}</div><div className="v26-profile-sleeve-demo"><CardFace hidden compact inspectable={false} sleeveId={sleeve} /></div></div>
        <div className="v17-profile-skin-picker v26-nickname-picker"><span>보유 닉네임 효과</span><div><button className={nicknameStyle === 'nickname_default' ? 'active' : ''} onClick={() => equipCosmetic('nickname_default')}>기본</button>{PROFILE_COSMETICS.filter((item) => item.kind === 'nickname' && (hub.profileCosmetics ?? []).includes(item.id)).map((item) => <button className={nicknameStyle === item.id ? 'active' : ''} key={item.id} onClick={() => equipCosmetic(item.id)} style={{ '--cosmetic-accent': item.accent } as CSSProperties}><NicknameText name={item.name} styleId={item.id} /></button>)}</div><div className="v26-nickname-equipped-preview"><small>다른 플레이어에게도 이렇게 표시됩니다</small><NicknameText name={hub.profile.display_name} styleId={nicknameStyle} /></div></div>
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
      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      if (!roomId) await supabase.rpc('eclipse_cleanup_global_messages_v25');
      let query = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(60);
      if (roomId) query = query.eq('room_id', roomId);
      else query = query.gte('created_at', cutoff);
      const { data } = await query;
      if (alive) setMessages(((data ?? []) as ChatMessage[]).reverse());
    }
    load();
    const channel = supabase
      .channel(`chat-${table}-${roomId ?? 'global'}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table, ...(roomId ? { filter: `room_id=eq.${roomId}` } : {}) }, (payload: any) => {
        const next = payload.new as ChatMessage;
        if (!roomId && new Date(next.created_at).getTime() < Date.now() - 30 * 60 * 1000) return;
        setMessages((current) => [...current.slice(-59), next]);
      })
      .subscribe();
    const expiryTimer = roomId ? undefined : window.setInterval(() => {
      const cutoffMs = Date.now() - 30 * 60 * 1000;
      setMessages((current) => current.filter((message) => new Date(message.created_at).getTime() >= cutoffMs));
    }, 60_000);
    return () => {
      alive = false;
      if (expiryTimer) window.clearInterval(expiryTimer);
      supabase.removeChannel(channel);
    };
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
      <header><div><span>{roomId ? 'ROOM CHAT' : 'GLOBAL CHAT'}</span><h3>{roomId ? '결투방 채팅' : '전체 채팅'}</h3>{!roomId && <small>최근 30분 메시지만 보관됩니다.</small>}</div><button onClick={onClose}>×</button></header>
      <div className="chat-messages">
        {messages.length === 0 && <div className="empty-state"><span>···</span><p>첫 메시지를 남겨보세요.</p></div>}
        {messages.map((message) => <div className={`chat-message ${message.user_id === profile.user_id ? 'mine' : ''}`} key={message.id}><b><NicknameText name={message.display_name} styleId={message.nickname_style} /></b><p>{message.body}</p><small>{new Date(message.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</small></div>)}
        <div ref={bottomRef} />
      </div>
      {error && <p className="chat-error">{error}</p>}
      <form onSubmit={send}><input value={input} onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)} maxLength={180} placeholder="메시지 입력" /><button>전송</button></form>
    </aside>
  );
}

function duelEventLabel(event: VisualEvent): string {
  if (event.kind === 'turn') return '턴 시작';
  if (event.kind === 'summon') return '일반 소환';
  if (event.kind === 'special') return '균열 소환';
  if (event.kind === 'fusion') return '공명 융합';
  if (event.kind === 'evolution') return '계승 진화';
  if (event.kind === 'spell') return '주문 발동';
  if (event.kind === 'trap') return '함정 발동';
  if (event.kind === 'set') return '함정 세트';
  if (event.kind === 'draw') return '드로우';
  if (event.kind === 'attack') return '공격 선언';
  if (event.kind === 'defense') return '피격 / 방어';
  if (event.kind === 'destroy') return '카드 파괴';
  if (event.kind === 'core') return '리더 피해';
  if (event.kind === 'heal') return '리더 회복';
  if (event.kind === 'buff') return '강화 효과';
  if (event.kind === 'energy') return '에너지 회복';
  return '행동';
}

function duelEventLocation(event: VisualEvent): string {
  if (event.kind === 'attack') return event.targetZone !== undefined ? `필드 ${Number(event.sourceZone ?? 0) + 1} → 상대 필드 ${event.targetZone + 1}` : `필드 ${Number(event.sourceZone ?? 0) + 1} → 상대 리더`;
  if (event.kind === 'set' && event.targetZone !== undefined) return `함정 존 ${event.targetZone + 1}`;
  if ((event.kind === 'summon' || event.kind === 'special' || event.kind === 'fusion' || event.kind === 'evolution') && event.targetZone !== undefined) return `유닛 존 ${event.targetZone + 1}`;
  if ((event.kind === 'defense' || event.kind === 'destroy' || event.kind === 'buff') && event.targetZone !== undefined) return `유닛 존 ${event.targetZone + 1}`;
  if (event.kind === 'core') return `피해 ${event.amount ?? ''}`.trim();
  if (event.kind === 'heal') return `회복 ${event.amount ?? ''}`.trim();
  if (event.kind === 'energy') return `에너지 +${event.amount ?? 0}`;
  return '';
}

type DuelPoint = { x: number; y: number };

function duelZonePoint(ownerId: string | undefined, userId: string, zone: number | undefined, row: 'unit' | 'secret' | 'leader' | 'hand' | 'deck' = 'unit'): DuelPoint {
  const mine = ownerId === userId;
  if (row === 'leader') return mine ? { x: 8.5, y: 75 } : { x: 8.5, y: 24 };
  if (row === 'hand') return mine ? { x: 51, y: 91 } : { x: 51, y: 9.5 };
  if (row === 'deck') return mine ? { x: 84, y: 73 } : { x: 84, y: 26 };
  const safeZone = Math.max(0, Math.min(4, zone ?? 2));
  const x = 30 + safeZone * 10.5;
  if (row === 'secret') return { x, y: mine ? 69 : 31 };
  return { x, y: mine ? 59 : 41 };
}

function duelEventPoints(event: VisualEvent, userId: string): { source: DuelPoint; target: DuelPoint } {
  const actorId = event.ownerId;
  const targetId = event.targetOwnerId ?? event.ownerId;
  if (event.kind === 'attack') {
    return {
      source: duelZonePoint(actorId, userId, event.sourceZone, 'unit'),
      target: event.targetZone !== undefined ? duelZonePoint(targetId, userId, event.targetZone, 'unit') : duelZonePoint(targetId, userId, undefined, 'leader'),
    };
  }
  if (event.kind === 'core' || event.kind === 'heal' || event.kind === 'energy') {
    const source = event.sourceZone !== undefined ? duelZonePoint(actorId, userId, event.sourceZone, 'unit') : duelZonePoint(actorId, userId, undefined, 'leader');
    return { source, target: duelZonePoint(targetId, userId, undefined, 'leader') };
  }
  if (event.kind === 'spell') {
    return {
      source: duelZonePoint(actorId, userId, undefined, 'hand'),
      target: event.targetZone !== undefined ? duelZonePoint(targetId, userId, event.targetZone, 'unit') : duelZonePoint(targetId && targetId !== actorId ? targetId : (actorId === userId ? '__opponent__' : userId), userId, undefined, 'leader'),
    };
  }
  if (event.kind === 'trap') {
    return { source: duelZonePoint(actorId, userId, 2, 'secret'), target: duelZonePoint(actorId === userId ? '__opponent__' : userId, userId, event.targetZone, event.targetZone !== undefined ? 'unit' : 'leader') };
  }
  if (event.kind === 'set') {
    const target = duelZonePoint(actorId, userId, event.targetZone, 'secret');
    return { source: duelZonePoint(actorId, userId, undefined, 'hand'), target };
  }
  if (event.kind === 'draw') {
    return { source: duelZonePoint(actorId, userId, undefined, 'deck'), target: duelZonePoint(actorId, userId, undefined, 'hand') };
  }
  if (event.kind === 'turn') {
    const target = duelZonePoint(actorId, userId, undefined, 'leader');
    return { source: { x: 50, y: 50 }, target };
  }
  const target = duelZonePoint(targetId, userId, event.targetZone, event.kind === 'destroy' || event.kind === 'defense' || event.kind === 'buff' ? 'unit' : 'unit');
  return { source: { x: 50, y: 50 }, target };
}

function DuelEffectLayer({ event, userId, profiles, drawCard }: { event: VisualEvent | null; userId: string; profiles: RoomProfile[]; drawCard?: CardDefinition }) {
  if (!event) return null;
  const card = event.cardId ? CARD_BY_ID[event.cardId] : undefined;
  const owner = profiles.find((profile) => profile.user_id === event.ownerId);
  const mine = event.ownerId === userId;
  const { source, target } = duelEventPoints(event, userId);
  const fxStyle = {
    '--sx': `${source.x}%`, '--sy': `${source.y}%`, '--tx': `${target.x}%`, '--ty': `${target.y}%`,
    '--fx-accent': card ? ELEMENT_ACCENT[card.element] : '#7ddcff',
  } as CSSProperties;
  const cinematicCardKinds: VisualEvent['kind'][] = ['summon', 'special', 'fusion', 'evolution', 'spell', 'trap'];
  const showCardCutIn = Boolean(card && cinematicCardKinds.includes(event.kind));
  const vfxClass = event.vfx ? `vfx-${event.vfx.replace(/[^a-z0-9-]/gi, '-')}` : 'vfx-generic';
  return (
    <div className={`v18-cinematic-layer kind-${event.kind} ${vfxClass} ${mine ? 'from-me' : 'from-opponent'} element-${card?.element ?? 'neutral'} rarity-${card?.rarity ?? 'common'}`} key={event.id} style={fxStyle} aria-live="polite">
      <span className="v22-cinematic-letterbox" aria-hidden="true" />
      <span className="v22-screen-flash" aria-hidden="true" />
      <span className="v22-element-particles" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} style={{ '--particle': index } as CSSProperties} />)}</span>
      <svg className="v18-motion-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} />
      </svg>
      <span className="v18-motion-orb" aria-hidden="true" />
      <span className="v18-impact-ring" aria-hidden="true" />
      <span className="v18-impact-flare" aria-hidden="true" />
      {(event.kind === 'destroy' || event.kind === 'core' || event.kind === 'defense') && <span className="v18-shard-field" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ '--piece': index } as CSSProperties} />)}</span>}
      {(event.kind === 'fusion' || event.kind === 'evolution' || event.kind === 'special' || event.kind === 'summon') && <span className="v18-summon-gate" aria-hidden="true"><i /><i /><i /></span>}
      {showCardCutIn && card && (
        <div className="v18-card-cutin">
          <CardIllustration card={card} hero />
          <div><small>{mine ? 'YOUR ACTION' : 'OPPONENT ACTION'} · {duelEventLabel(event)}</small><b>{card.name}</b><span>{KIND_LABEL[card.kind]} · {ELEMENT_LABEL[card.element]}</span></div>
        </div>
      )}
      <div className="v18-event-banner">
        <small>{mine ? 'MY ACTION' : event.ownerId ? 'OPPONENT ACTION' : 'DUEL EVENT'}</small>
        <b>{duelEventLabel(event)}</b>
        <span>{event.label ?? card?.name ?? owner?.display_name ?? duelEventLocation(event)}</span>
      </div>
      {event.amount !== undefined && event.amount > 0 && ['core', 'defense', 'heal', 'buff', 'energy'].includes(event.kind) && (
        <strong className={`v18-floating-number ${event.kind === 'heal' || event.kind === 'energy' || event.kind === 'buff' ? 'positive' : 'damage'}`}>{event.kind === 'heal' || event.kind === 'energy' || event.kind === 'buff' ? '+' : '−'}{event.amount}</strong>
      )}
      {event.kind === 'draw' && (
        <div className={`v24-draw-stage ${mine ? 'mine' : 'opponent'} ${mine && drawCard ? 'revealed' : 'concealed'}`} aria-hidden="true">
          <div className={`v24-draw-deck-stack sleeve-${owner?.card_sleeve ?? 'sleeve_default'}`}><i /><i /><i /><b>{sleeveGlyph(owner?.card_sleeve)}</b></div>
          <div className="v24-draw-flight">
            <div className="v24-draw-card-3d">
              <div className={`v24-draw-face v24-draw-back sleeve-${owner?.card_sleeve ?? 'sleeve_default'}`}><span>{sleeveGlyph(owner?.card_sleeve)}</span><small>ECLIPSE</small></div>
              <div className="v24-draw-face v24-draw-front">
                {drawCard ? <><CardIllustration card={drawCard} hero /><span className="v24-draw-card-name"><small>{RARITY_LABEL[drawCard.rarity]} · {ELEMENT_LABEL[drawCard.element]}</small><b>{drawCard.name}</b></span></> : <><span className="v24-draw-hidden-mark">E</span><small>HIDDEN CARD</small></>}
              </div>
            </div>
          </div>
          {mine && drawCard && <div className="v24-draw-caption"><small>DRAWN CARD</small><b>{drawCard.name}</b><span>손패에 추가됩니다</span></div>}
        </div>
      )}
      {event.kind === 'trap' && <span className="v18-trap-chain" aria-hidden="true"><i /><i /><i /></span>}
    </div>
  );
}

function UnitSlot({
  unit,
  owner,
  index,
  selected,
  materialSelected,
  targetable,
  enemy,
  onClick,
}: {
  unit: UnitState | null;
  owner: string;
  index: number;
  selected?: boolean;
  materialSelected?: boolean;
  targetable?: boolean;
  enemy?: boolean;
  onClick?: () => void;
}) {
  const card = unit ? CARD_BY_ID[unit.cardId] : undefined;
  return (
    <button
      type="button"
      className={`unit-slot ${unit ? 'occupied' : ''} ${selected ? 'selected' : ''} ${materialSelected ? 'material-selected' : ''} ${targetable ? 'targetable' : ''} ${enemy ? 'enemy' : ''} ${unit ? `origin-${unit.summonedBy}` : ''} ${card ? `element-${card.element}` : ''}`}
      onClick={onClick}
      data-owner={owner}
      data-index={index}
    >
      {!unit ? <span className="slot-mark">{index + 1}</span> : (
        <>
          <span className={`unit-art ${card ? `variant-${hashString(card.id) % 6}` : ''}`} style={card ? cardStyle(card) : undefined}>
            {card ? <CardIllustration card={card} compact /> : <strong>✦</strong>}
          </span>
          {card && <span className="unit-info-hotspot" role="button" tabIndex={0} aria-label={`${card.name} 상세 정보`} onClick={(event: React.MouseEvent) => { event.preventDefault(); event.stopPropagation(); requestCardInspection(card.id); }} onKeyDown={(event: React.KeyboardEvent) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); requestCardInspection(card.id); } }}>i</span>}
          {unit.summonedBy !== 'normal' && unit.summonedBy !== 'token' && <span className={`origin-badge ${unit.summonedBy}`}>{unit.summonedBy === 'rift' ? 'RIFT' : unit.summonedBy === 'fusion' ? 'FUSION' : 'EVOLVE'}</span>}
          <span className="unit-name">{card?.name ?? unit.cardId.replace('token:', '')}</span>
          <span className="unit-stats"><b>{unit.attack}</b><i>ATK</i><b>{unit.health}</b>{unit.shield > 0 && <em>＋{unit.shield}</em>}</span>
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


function clientRiftReady(state: MatchState, playerId: string, opponentId: string, card: CardDefinition): boolean {
  const condition = card.riftCondition;
  if (card.summonMode !== 'rift' || !condition) return false;
  const myUnits = state.boards[playerId].units.filter(Boolean);
  const enemyUnits = state.boards[opponentId].units.filter(Boolean);
  if (condition.kind === 'empty_board') return myUnits.length === 0;
  if (condition.kind === 'core_below') return (state.core[playerId] ?? 25) <= condition.value;
  if (condition.kind === 'opponent_more_units') return enemyUnits.length > myUnits.length;
  if (condition.kind === 'graveyard_min') return (state.graveyards[playerId]?.length ?? 0) >= condition.value;
  if (condition.kind === 'ally_element') return myUnits.some((unit) => CARD_BY_ID[unit?.cardId ?? '']?.element === condition.element);
  return false;
}

function clientFusionMaterialMatches(unit: UnitState, material: NonNullable<CardDefinition['fusionRecipe']>['materials'][number]): boolean {
  const source = CARD_BY_ID[unit.cardId];
  if (!source) return false;
  if (material.cardIds?.length && !material.cardIds.includes(source.id)) return false;
  if (material.element && source.element !== material.element) return false;
  if (material.minCost !== undefined && source.cost < material.minCost) return false;
  return true;
}

function clientCanAssignFusion(units: UnitState[], materials: NonNullable<CardDefinition['fusionRecipe']>['materials'], at = 0, used = new Set<number>()): boolean {
  if (at >= materials.length) return true;
  for (let index = 0; index < units.length; index += 1) {
    if (used.has(index) || !clientFusionMaterialMatches(units[index], materials[at])) continue;
    used.add(index);
    if (clientCanAssignFusion(units, materials, at + 1, used)) return true;
    used.delete(index);
  }
  return false;
}

function clientEvolutionReady(unit: UnitState, card: CardDefinition): boolean {
  const recipe = card.evolutionRecipe;
  const source = CARD_BY_ID[unit.cardId];
  if (!recipe || !source) return false;
  if (recipe.fromIds?.includes(source.id)) return true;
  return (!recipe.element || recipe.element === source.element)
    && (recipe.minCost === undefined || source.cost >= recipe.minCost)
    && (recipe.maxCost === undefined || source.cost <= recipe.maxCost);
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
      <div className="coin-toss-copy"><small>FIRST TURN DECISION</small><h2>{revealed ? '선공이 결정되었습니다' : '운명의 코인을 던집니다'}</h2><p>{revealed ? <>{toss.side === 'solar' ? '태양면' : '월식면'} · {isMe ? '당신' : <NicknameText name={winner?.display_name ?? '상대'} styleId={winner?.nickname_style} />}이(가) 선공입니다.</> : '두 플레이어의 시작 순서를 공정하게 결정합니다.'}</p></div>
      <div className="duel-coin" aria-hidden="true"><span className="coin-face coin-front"><b>☀</b><small>SOLAR</small></span><span className="coin-face coin-back"><b>◐</b><small>ECLIPSE</small></span><i /></div>
      <div className="coin-result"><span>{revealed ? (isMe ? 'YOU GO FIRST' : 'OPPONENT GOES FIRST') : 'FLIPPING'}</span><div><i /></div></div>
    </div>
  );
}

function DuelEnergyMeter({ label, current, max, nextMax, opponent = false, compact = false }: { label: string; current: number; max: number; nextMax?: number; opponent?: boolean; compact?: boolean }) {
  const safeCurrent = Math.max(0, Math.min(10, current));
  const safeMax = Math.max(0, Math.min(10, max));
  return (
    <div className={`v15-energy-meter ${opponent ? 'opponent' : 'mine'} ${compact ? 'compact' : ''}`}>
      <div className="v15-energy-copy">
        <span>{label}</span>
        <b>{safeCurrent}<em>/ {safeMax}</em></b>
        {typeof nextMax === 'number' && nextMax > safeMax && <small>다음 내 턴 {nextMax}</small>}
      </div>
      <div className="v15-energy-pips" aria-label={`${label} ${safeCurrent}/${safeMax}`}>
        {Array.from({ length: 10 }, (_, index) => <i key={index} className={index < safeCurrent ? 'active' : index < safeMax ? 'available' : 'locked'} />)}
      </div>
    </div>
  );
}

function DuelBoard({ payload, userId, onRefresh, onLeave, syncState, lastSyncAt }: { payload: RoomPayload; userId: string; onRefresh: (payload: RoomPayload) => void; onLeave: () => void; syncState: 'live' | 'syncing' | 'offline'; lastSyncAt: number }) {
  const { room, privateState: nullablePrivateState } = payload;
  const nullableState = room.state;
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [selectedExtra, setSelectedExtra] = useState<string | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
  const [selectedAttacker, setSelectedAttacker] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [logOpen, setLogOpen] = useState(false);
  const [surrenderOpen, setSurrenderOpen] = useState(false);
  const [endTurnConfirmOpen, setEndTurnConfirmOpen] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const [activeVfx, setActiveVfx] = useState<VisualEvent | null>(null);
  const [vfxQueue, setVfxQueue] = useState<VisualEvent[]>([]);
  const [drawRevealQueue, setDrawRevealQueue] = useState<string[]>([]);
  const [recentDrawnIds, setRecentDrawnIds] = useState<Set<string>>(() => new Set());
  const [coinClock, setCoinClock] = useState(() => Date.now());
  const [turnClock, setTurnClock] = useState(() => Date.now());
  const timeoutSyncTurn = useRef<number>(-1);
  const seenVfx = useRef<Set<string>>(new Set());
  const knownHandIds = useRef<Set<string>>(new Set(nullablePrivateState?.hand.map((card) => card.instanceId) ?? []));
  const actionLock = useRef(false);

  const visualEvents = nullableState?.visualEvents ?? [];
  const visualEventSignature = visualEvents.map((event) => event.id).join('|');

  useEffect(() => {
    let unseen = visualEvents.filter((event) => !seenVfx.current.has(event.id));
    if (unseen.length === 0) return;
    if (seenVfx.current.size === 0 && unseen.length > 1) unseen = unseen.slice(-1);
    visualEvents.forEach((event) => seenVfx.current.add(event.id));
    setVfxQueue((current) => [...current, ...unseen].slice(-10));
  }, [visualEventSignature]);

  const privateHandSignature = nullablePrivateState?.hand.map((card) => card.instanceId).join('|') ?? '';
  useEffect(() => {
    if (!nullablePrivateState) return;
    const currentIds = new Set(nullablePrivateState.hand.map((card) => card.instanceId));
    const added = nullablePrivateState.hand.filter((card) => !knownHandIds.current.has(card.instanceId));
    knownHandIds.current = currentIds;
    if (added.length === 0) return;
    setDrawRevealQueue((current) => [...current, ...added.map((card) => card.cardId)].slice(-12));
    setRecentDrawnIds(new Set(added.map((card) => card.instanceId)));
    const timer = window.setTimeout(() => setRecentDrawnIds(new Set()), 1800);
    return () => window.clearTimeout(timer);
  }, [privateHandSignature]);

  useEffect(() => {
    if (!activeVfx || activeVfx.kind !== 'draw' || activeVfx.ownerId !== userId) return;
    const consumed = Math.max(1, activeVfx.amount ?? 1);
    const timer = window.setTimeout(() => setDrawRevealQueue((current) => current.slice(consumed)), 1120);
    return () => window.clearTimeout(timer);
  }, [activeVfx?.id, activeVfx?.kind, activeVfx?.ownerId, activeVfx?.amount, userId]);

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
    const endsAt = nullableState?.turnEndsAt;
    if (!endsAt || nullableState?.status !== 'active') {
      setTurnClock(Date.now());
      return;
    }
    setTurnClock(Date.now());
    const timer = window.setInterval(() => setTurnClock(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [nullableState?.turnEndsAt, nullableState?.turnNumber, nullableState?.status]);

  useEffect(() => {
    const endsAt = nullableState?.turnEndsAt;
    const turnNumber = nullableState?.turnNumber;
    if (!endsAt || !turnNumber || nullableState?.status !== 'active') return;
    const delay = Math.max(0, endsAt - Date.now() + 80);
    const timer = window.setTimeout(() => {
      if (timeoutSyncTurn.current === turnNumber) return;
      timeoutSyncTurn.current = turnNumber;
      api('get_room', { roomId: room.id })
        .then((result) => {
          if (result.room && result.profiles) onRefresh({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null });
        })
        .catch((error) => setMessage(error instanceof Error ? error.message : '턴 시간 동기화 실패'));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [nullableState?.turnEndsAt, nullableState?.turnNumber, nullableState?.status, room.id, onRefresh]);

  useEffect(() => {
    setSelectedHand(null);
    setSelectedExtra(null);
    setSelectedMaterials([]);
    setSelectedAttacker(null);
    setExtraOpen(false);
    setEndTurnConfirmOpen(false);
    setMessage('');
  }, [nullableState?.turnNumber, nullableState?.currentPlayerId]);

  useEffect(() => {
    const cancel = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setSelectedHand(null);
      setSelectedExtra(null);
      setSelectedMaterials([]);
      setSelectedAttacker(null);
      setMessage('선택을 취소했습니다.');
    };
    window.addEventListener('keydown', cancel);
    return () => window.removeEventListener('keydown', cancel);
  }, []);

  useEffect(() => {
    if (activeVfx || vfxQueue.length === 0) return;
    const [next, ...rest] = vfxQueue;
    setVfxQueue(rest);
    setActiveVfx(next);
    const duration = next.kind === 'fusion' || next.kind === 'evolution' ? 1850
      : next.kind === 'trap' ? 1550
        : next.kind === 'summon' || next.kind === 'special' || next.kind === 'spell' ? 1350
          : next.kind === 'attack' || next.kind === 'core' || next.kind === 'destroy' ? 1150
            : next.kind === 'defense' || next.kind === 'heal' || next.kind === 'buff' || next.kind === 'energy' ? 900
              : next.kind === 'draw' ? 1250
                : next.kind === 'turn' ? 850
                  : 760;
    const timer = window.setTimeout(() => {
      setActiveVfx((current) => current?.id === next.id ? null : current);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [activeVfx, vfxQueue]);

  useEffect(() => {
    if (!activeVfx) return;
    const sound: UiSound = activeVfx.kind === 'attack' ? 'attack'
      : activeVfx.kind === 'spell' ? 'spell'
        : activeVfx.kind === 'trap' || activeVfx.kind === 'set' ? 'trap'
          : activeVfx.kind === 'core' || activeVfx.kind === 'destroy' || activeVfx.kind === 'defense' ? 'damage'
            : activeVfx.kind === 'heal' || activeVfx.kind === 'buff' || activeVfx.kind === 'energy' ? 'success'
              : activeVfx.kind === 'draw' ? 'draw'
                : activeVfx.kind === 'turn' ? 'turn'
                : 'summon';
    playUiSound(sound);
  }, [activeVfx?.id]);

  if (!nullableState || !nullablePrivateState || nullableState.playerOrder.length !== 2) return <LoadingScreen text="결투 상태를 동기화하는 중" />;
  const state = nullableState;
  const privateState = nullablePrivateState;

  const opponentId = state.playerOrder.find((id) => id !== userId) ?? '';
  const profileMap = Object.fromEntries(payload.profiles.map((profile) => [profile.user_id, profile]));
  const me = profileMap[userId];
  const opponent = profileMap[opponentId];
  const coinTossActive = Boolean(state.coinToss && coinClock < state.coinToss.endsAt);
  const turnExpiredLocally = Boolean(!coinTossActive && state.turnEndsAt && turnClock >= state.turnEndsAt);
  const myTurn = state.currentPlayerId === userId && !coinTossActive && !turnExpiredLocally;
  const turnSecondsLeft = coinTossActive ? 60 : Math.max(0, Math.ceil(((state.turnEndsAt ?? (turnClock + 60_000)) - turnClock) / 1000));
  const turnTimerPercent = Math.max(0, Math.min(100, (turnSecondsLeft / 60) * 100));
  const selectedInstance = privateState.hand.find((card) => card.instanceId === selectedHand);
  const selectedCard = selectedInstance ? CARD_BY_ID[selectedInstance.cardId] : undefined;
  const selectedExtraInstance = privateState.extra.find((card) => card.instanceId === selectedExtra);
  const selectedExtraCard = selectedExtraInstance ? CARD_BY_ID[selectedExtraInstance.cardId] : undefined;
  const requiredMaterials = selectedExtraCard?.kind === 'fusion' ? selectedExtraCard.fusionRecipe?.materials.length ?? 0 : selectedExtraCard?.kind === 'evolution' ? 1 : 0;
  const canExtraSummon = Boolean(selectedExtraCard && selectedExtra && selectedMaterials.length === requiredMaterials && myTurn && state.phase === 'main' && !busy);
  const canSpendTurnToDraw = Boolean(myTurn && state.phase === 'main' && !state.turnActionTaken && !busy && (state.deckCounts[userId] ?? 0) > 0);
  const myEnergy = state.energy[userId] ?? { current: 0, max: 0 };
  const opponentEnergy = state.energy[opponentId] ?? { current: 0, max: 0 };
  const nextMyEnergyMax = myTurn ? myEnergy.max : Math.min(10, Math.max(1, myEnergy.max + 1));
  const roundNumber = Math.max(1, Math.ceil(state.turnNumber / 2));
  const phaseLabel = state.phase === 'main' ? '메인 단계' : '전투 단계';
  const selectedHandCost = selectedCard?.summonMode === 'rift' && selectedCard.riftCost !== undefined ? `${selectedCard.cost} / 균열 ${selectedCard.riftCost}` : selectedCard?.cost;
  const selectingUnitToSummon = Boolean(myTurn && state.phase === 'main' && selectedCard?.kind === 'unit');
  const selectingTrapToSet = Boolean(myTurn && state.phase === 'main' && selectedCard?.kind === 'trap');
  const selectingEnemyTarget = Boolean(myTurn && state.phase === 'main' && selectedCard?.target === 'enemy_unit');
  const selectingFriendlyTarget = Boolean(myTurn && state.phase === 'main' && selectedCard?.target === 'friendly_unit');
  const selectingMaterials = Boolean(myTurn && state.phase === 'main' && selectedExtraCard);
  const selectingAttackTarget = Boolean(myTurn && state.phase === 'battle' && selectedAttacker !== null);
  const opponentHasUnits = state.boards[opponentId].units.some(Boolean);
  const directAttackOpen = !opponentHasUnits;
  const selectedAttackerCanHitCore = Boolean(selectingAttackTarget && directAttackOpen);
  const myFieldUnits = state.boards[userId].units.filter((unit): unit is UnitState => Boolean(unit));
  const riftReadyInstances = privateState.hand.filter((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    if (!card || card.kind !== 'unit' || card.summonMode !== 'rift') return false;
    const cost = card.riftCost ?? card.cost;
    return myTurn && state.phase === 'main' && myEnergy.current >= cost && state.boards[userId].units.some((slot) => !slot) && clientRiftReady(state, userId, opponentId, card);
  });
  const extraReadyInstances = privateState.extra.filter((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    if (!card || card.cost > myEnergy.current || !myTurn || state.phase !== 'main') return false;
    if (card.kind === 'fusion') { const materials = card.fusionRecipe?.materials ?? []; return materials.length > 0 && clientCanAssignFusion(myFieldUnits, materials); }
    if (card.kind === 'evolution') return myFieldUnits.some((unit) => clientEvolutionReady(unit, card));
    return false;
  });
  const specialReadyIds = new Set([...riftReadyInstances.map((item) => item.instanceId), ...extraReadyInstances.map((item) => item.instanceId)]);
  const specialReadyCount = specialReadyIds.size;
  const emptyUnitZone = state.boards[userId].units.some((slot) => !slot);
  const legendaryReadyFromHand = privateState.hand.flatMap((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    if (!card || card.rarity !== 'legendary' || card.kind !== 'unit' || !myTurn || state.phase !== 'main' || !emptyUnitZone) return [];
    const cost = card.summonMode === 'rift' ? (card.riftCost ?? card.cost) : card.cost;
    const ready = myEnergy.current >= cost && (card.summonMode !== 'rift' || clientRiftReady(state, userId, opponentId, card));
    return ready ? [{ instanceId: instance.instanceId, card, source: 'hand' as const }] : [];
  });
  const legendaryReadyFromExtra = extraReadyInstances.flatMap((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    return card?.rarity === 'legendary' ? [{ instanceId: instance.instanceId, card, source: 'extra' as const }] : [];
  });
  const legendaryReadyCards = [...legendaryReadyFromHand, ...legendaryReadyFromExtra];

  function clearSelection(note = '') {
    setSelectedHand(null);
    setSelectedExtra(null);
    setSelectedMaterials([]);
    setSelectedAttacker(null);
    if (note) setMessage(note);
  }

  async function gameAction(gameAction: string, extra: Record<string, unknown> = {}) {
    if (actionLock.current || busy) return;
    actionLock.current = true;
    setBusy(true);
    setMessage('');
    try {
      const result = await api('game_action', { roomId: room.id, gameAction, ...extra });
      if (result.room && result.profiles) onRefresh({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null });
      clearSelection();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '행동 처리 실패');
    } finally {
      actionLock.current = false;
      setBusy(false);
    }
  }

  function chooseHand(instanceId: string) {
    if (busy) return;
    const instance = privateState.hand.find((card) => card.instanceId === instanceId);
    if (!instance) return;
    if (!myTurn || state.phase !== 'main') {
      requestCardInspection(instance.cardId);
      setMessage(!myTurn ? '상대 턴입니다. 카드 정보만 확인할 수 있습니다.' : '전투 단계에서는 손패를 사용할 수 없습니다. 카드 정보만 표시합니다.');
      return;
    }
    setMessage('');
    setSelectedHand((current) => current === instanceId ? null : instanceId);
    setSelectedExtra(null);
    setSelectedMaterials([]);
    setSelectedAttacker(null);
  }

  function chooseExtra(instanceId: string) {
    if (busy) return;
    const instance = privateState.extra.find((card) => card.instanceId === instanceId);
    if (!instance) return;
    if (!myTurn || state.phase !== 'main') {
      requestCardInspection(instance.cardId);
      setMessage(!myTurn ? '상대 턴입니다. 엑스트라 카드 정보만 확인할 수 있습니다.' : '전투 단계에서는 엑스트라 소환을 할 수 없습니다.');
      return;
    }
    setMessage('');
    setSelectedExtra((current) => current === instanceId ? null : instanceId);
    setSelectedHand(null);
    setSelectedMaterials([]);
    setSelectedAttacker(null);
  }

  function playToUnitZone(zone: number) {
    if (!myTurn || state.phase !== 'main') {
      setMessage('내 메인 단계에서만 유닛을 소환할 수 있습니다.');
      return;
    }
    if (!selectedCard || selectedCard.kind !== 'unit' || !selectedHand) {
      setMessage('먼저 손패에서 소환할 유닛 카드를 선택하세요.');
      return;
    }
    gameAction('play_card', { instanceId: selectedHand, zone });
  }

  function playToSecretZone(zone: number) {
    if (!myTurn || state.phase !== 'main') {
      setMessage('내 메인 단계에서만 함정을 세트할 수 있습니다.');
      return;
    }
    if (!selectedCard || selectedCard.kind !== 'trap' || !selectedHand) {
      setMessage('먼저 손패에서 함정 카드를 선택하세요.');
      return;
    }
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
    const unit = state.boards[ownerId]?.units[unitIndex];
    const card = unit ? CARD_BY_ID[unit.cardId] : undefined;
    if (!myTurn) {
      if (card) requestCardInspection(card.id);
      setMessage('상대 턴입니다. 필드 카드는 상세 정보만 확인할 수 있습니다.');
      return;
    }
    if (selectedExtraCard && ownerId === userId && state.phase === 'main') {
      toggleMaterial(unitIndex);
      setMessage('엑스트라 소환 소재를 선택했습니다.');
      return;
    }
    if (selectedCard && selectedHand && state.phase === 'main') {
      if (selectedCard.target === 'enemy_unit' && ownerId === opponentId) {
        gameAction('play_card', { instanceId: selectedHand, target: { ownerId, unitIndex } });
        return;
      }
      if (selectedCard.target === 'friendly_unit' && ownerId === userId) {
        gameAction('play_card', { instanceId: selectedHand, target: { ownerId, unitIndex } });
        return;
      }
      if (selectedCard.target !== 'none' && selectedCard.target !== 'enemy_core') {
        setMessage('이 카드는 현재 선택한 대상에 사용할 수 없습니다. 빛나는 칸을 선택하세요.');
        return;
      }
    }
    if (selectedAttacker !== null && ownerId === opponentId && state.phase === 'battle') {
      gameAction('attack', { attackerIndex: selectedAttacker, target: { kind: 'unit', unitIndex } });
      return;
    }
    if (ownerId === userId && state.phase === 'battle') {
      if (!unit) return;
      if (!unit.canAttack) {
        setMessage('이 유닛은 이번 턴에 공격할 수 없습니다.');
        return;
      }
      setSelectedAttacker((current) => current === unitIndex ? null : unitIndex);
      setMessage(currentAttackHint(unitIndex));
      return;
    }
    if (card) requestCardInspection(card.id);
  }

  function currentAttackHint(unitIndex: number) {
    const unit = state.boards[userId].units[unitIndex];
    const card = unit ? CARD_BY_ID[unit.cardId] : undefined;
    return directAttackOpen ? `${card?.name ?? '유닛'} 선택 · 상대 필드가 비었습니다. 상대 리더를 직접 공격할 수 있습니다.` : `${card?.name ?? '유닛'} 선택 · 공격할 상대 유닛을 선택하세요.`;
  }

  function activateSelectedNoTarget() {
    if (!selectedCard || !selectedHand) return;
    gameAction('play_card', { instanceId: selectedHand });
  }

  function summonSelectedExtra() {
    if (!selectedExtra || !canExtraSummon) {
      setMessage('필요한 소재를 모두 선택해야 합니다.');
      return;
    }
    gameAction('extra_summon', { extraInstanceId: selectedExtra, materialZones: selectedMaterials });
  }

  function spendTurnToDraw() {
    if (!canSpendTurnToDraw) return;
    if (!confirm('카드 1장을 추가로 뽑는 대신 이번 턴을 즉시 종료할까요?')) return;
    gameAction('draw_turn');
  }

  const actionGuide = !myTurn
    ? '상대 행동을 확인 중입니다. 중앙 연출과 최근 행동 기록에서 소환·주문·함정·공격을 확인할 수 있습니다.'
    : state.phase === 'battle'
      ? selectedAttacker !== null
        ? directAttackOpen ? '상대 필드가 비었습니다. 상대 리더를 눌러 직접 공격하세요.' : '공격할 상대 유닛을 선택하세요.'
        : '빛나는 내 유닛을 선택해 공격을 선언하세요.'
      : selectedExtraCard ? `소재 ${selectedMaterials.length}/${requiredMaterials} 선택 후 특수 소환하세요.`
        : selectedCard?.kind === 'unit' ? '빛나는 빈 유닛 칸을 눌러 소환하세요.'
          : selectedCard?.kind === 'trap' ? '빛나는 빈 함정 칸을 눌러 세트하세요. 세트한 함정은 나에게만 앞면으로 보입니다.'
            : selectedCard?.target === 'enemy_unit' ? '빛나는 적 유닛을 선택하세요.'
              : selectedCard?.target === 'friendly_unit' ? '빛나는 아군 유닛을 선택하세요.'
                : selectedCard ? '행동 버튼으로 카드를 발동하세요.'
                  : specialReadyCount > 0 ? `특수 소환 가능 카드 ${specialReadyCount}장이 있습니다.` : '손패에서 카드를 선택하거나 전투 단계로 이동하세요.';

  const recentEvents = state.visualEvents.slice(-5).reverse();
  const eventActorName = (event: VisualEvent) => event.ownerId === userId ? '나' : event.ownerId ? (profileMap[event.ownerId]?.display_name ?? '상대') : '시스템';
  const eventActorStyle = (event: VisualEvent) => event.ownerId && event.ownerId !== userId ? profileMap[event.ownerId]?.nickname_style : undefined;
  const playableHandCount = privateState.hand.filter((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    if (!card || !myTurn || state.phase !== 'main') return false;
    const cost = card.summonMode === 'rift' && card.riftCost !== undefined && clientRiftReady(state, userId, opponentId, card) ? card.riftCost : card.cost;
    return myEnergy.current >= cost;
  }).length;

  const remainingAttackers = state.boards[userId].units.filter((unit) => Boolean(unit?.canAttack)).length;
  const remainingOpportunities = state.phase === 'battle' ? remainingAttackers : playableHandCount + specialReadyCount;

  function requestEndTurn() {
    if (!myTurn || busy) return;
    if (remainingOpportunities > 0) {
      setEndTurnConfirmOpen(true);
      return;
    }
    void gameAction('end_turn');
  }

  const fieldPower = (ownerId: string) => state.boards[ownerId].units.reduce((sum, unit) => sum + (unit ? unit.attack + Math.max(0, unit.health) + unit.shield * 0.7 : 0), 0);
  const momentumRaw = (state.core[userId] - state.core[opponentId]) * 1.2
    + (fieldPower(userId) - fieldPower(opponentId)) * 0.55
    + (privateState.hand.length - (state.handCounts[opponentId] ?? 0)) * 0.75
    + (myEnergy.current - opponentEnergy.current) * 0.35;
  const momentum = Math.max(-10, Math.min(10, momentumRaw));
  const momentumPercent = Math.round(((momentum + 10) / 20) * 100);
  const momentumLabel = momentum >= 4 ? '유리' : momentum <= -4 ? '불리' : '접전';
  const myMatchStats = state.matchStats?.[userId] ?? { cardsDrawn: 0, cardsPlayed: 0, unitsSummoned: 0, specialSummons: 0, coreDamage: 0, healing: 0 };
  const opponentMatchStats = state.matchStats?.[opponentId] ?? { cardsDrawn: 0, cardsPlayed: 0, unitsSummoned: 0, specialSummons: 0, coreDamage: 0, healing: 0 };
  const syncAgeSeconds = Math.max(0, Math.floor((Date.now() - lastSyncAt) / 1000));

  return (
    <div className={`v18-duel-screen ${myTurn ? 'is-my-turn' : 'is-opponent-turn'} phase-${state.phase} fx-${activeVfx?.kind ?? 'idle'}`}>
      <DuelEffectLayer event={activeVfx} userId={userId} profiles={payload.profiles} drawCard={activeVfx?.kind === 'draw' && activeVfx.ownerId === userId ? CARD_BY_ID[drawRevealQueue[0] ?? ''] : undefined} />
      <CoinTossOverlay state={state} profiles={payload.profiles} userId={userId} now={coinClock} />
      <div className="orientation-hint"><span>↻</span><b>가로 화면을 권장합니다</b><small>결투 정보와 카드가 한 화면에 가장 선명하게 표시됩니다.</small></div>
      {busy && <div className="v18-action-progress"><span />행동 처리 중</div>}

      <header className="v18-duel-header">
        <div className="v18-duel-brand">
          <span className="v18-brand-mark">E</span>
          <div><b>ECLIPSE DUEL</b><small>ROOM {room.code}</small></div>
        </div>
        <div className="v18-turn-hud">
          <small>ROUND {roundNumber} · TURN {state.turnNumber}</small>
          <div><b>{coinTossActive ? '선공 결정' : myTurn ? 'YOUR TURN' : 'OPPONENT TURN'}</b><span>{coinTossActive ? 'OPENING' : phaseLabel}</span></div>
          {!coinTossActive && state.status === 'active' && (
            <div className={`v18-turn-timer ${turnSecondsLeft <= 10 ? 'danger' : turnSecondsLeft <= 20 ? 'warning' : ''}`}>
              <strong>{turnSecondsLeft}</strong><small>SEC</small><i><b style={{ width: `${turnTimerPercent}%` }} /></i>
            </div>
          )}
        </div>
        <div className={`v22-sync-chip ${syncState}`}>
          <i /><span>{syncState === 'live' ? 'LIVE' : syncState === 'syncing' ? 'SYNCING' : 'RECONNECTING'}</span><small>{syncState === 'live' ? `${syncAgeSeconds}s` : syncState === 'syncing' ? '동기화 중' : '연결 복구 중'}</small>
        </div>
        <div className="v18-header-actions">
          <button type="button" className={logOpen ? 'active' : ''} onClick={() => setLogOpen((value) => !value)}>기록</button>
          <button type="button" className="danger" disabled={busy || state.status !== 'active'} onClick={() => setSurrenderOpen(true)}>항복</button>
        </div>
      </header>

      <aside className="v18-leader-rail">
        <button
          type="button"
          className={`v18-leader-card opponent ${selectedAttackerCanHitCore ? 'targetable direct-ready' : ''}`}
          disabled={!selectedAttackerCanHitCore || busy}
          onClick={() => selectedAttacker !== null && gameAction('attack', { attackerIndex: selectedAttacker, target: { kind: 'core' } })}
        >
          <div className="v18-leader-identity"><Avatar id={opponent?.avatar} /><i className={`v26-duel-emblem emblem-${opponent?.profile_emblem ?? 'emblem_default'}`} aria-hidden="true">{emblemGlyph(opponent?.profile_emblem)}</i><span><small>OPPONENT</small><b><NicknameText name={opponent?.display_name ?? '상대'} styleId={opponent?.nickname_style} /></b></span></div>
          <div className="v18-hp-readout"><small>HP</small><strong>{state.core[opponentId]}</strong><em>{selectedAttackerCanHitCore ? 'DIRECT ATTACK' : 'ENEMY LEADER'}</em></div>
          <DuelEnergyMeter label="ENERGY" current={opponentEnergy.current} max={opponentEnergy.max} opponent compact />
          <div className="v18-mini-stats"><span>HAND <b>{state.handCounts[opponentId] ?? 0}</b></span><span>DECK <b>{state.deckCounts[opponentId] ?? 0}</b></span><span>GRAVE <b>{state.graveyards[opponentId]?.length ?? 0}</b></span></div>
        </button>

        <div className="v18-leader-divider"><span>VS</span></div>

        <section className="v18-leader-card mine">
          <div className="v18-leader-identity"><Avatar id={me?.avatar} /><i className={`v26-duel-emblem emblem-${me?.profile_emblem ?? 'emblem_default'}`} aria-hidden="true">{emblemGlyph(me?.profile_emblem)}</i><span><small>YOU</small><b><NicknameText name={me?.display_name ?? '나'} styleId={me?.nickname_style} /></b></span></div>
          <div className="v18-hp-readout"><small>HP</small><strong>{state.core[userId]}</strong><em>{myTurn ? phaseLabel : 'WAITING'}</em></div>
          <DuelEnergyMeter label="ENERGY" current={myEnergy.current} max={myEnergy.max} nextMax={!myTurn ? nextMyEnergyMax : undefined} compact />
          <div className="v18-mini-stats"><span>HAND <b>{privateState.hand.length}</b></span><span>DECK <b>{state.deckCounts[userId] ?? 0}</b></span><span>GRAVE <b>{state.graveyards[userId]?.length ?? 0}</b></span></div>
        </section>
      </aside>

      <main className="v18-arena">
        <div className="v18-arena-backdrop" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="v18-opponent-hand-strip" aria-label={`상대 손패 ${state.handCounts[opponentId] ?? 0}장`}>
          <span>HAND · {state.handCounts[opponentId] ?? 0}</span>
          <div>{Array.from({ length: Math.min(9, state.handCounts[opponentId] ?? 0) }, (_, index) => <CardFace key={index} hidden compact inspectable={false} sleeveId={opponent?.card_sleeve ?? 'sleeve_default'} />)}</div>
        </div>

        <section className="v18-board">
          <div className="v18-zone-row v18-enemy-secrets">
            {state.boards[opponentId].secrets.map((secret, index) => (
              <div className={`v18-secret-slot enemy ${secret ? 'is-set' : ''}`} key={index}>
                {secret ? <><span className={`v18-secret-back sleeve-${opponent?.card_sleeve ?? 'sleeve_default'}`}>{sleeveGlyph(opponent?.card_sleeve)}</span><small>SET</small></> : <span className="v18-zone-number">S{index + 1}</span>}
              </div>
            ))}
          </div>

          <div className="v18-zone-row v18-enemy-units">
            {state.boards[opponentId].units.map((unit, index) => (
              <UnitSlot key={index} unit={unit} owner={opponentId} index={index} enemy targetable={Boolean(unit && (selectingEnemyTarget || selectingAttackTarget))} onClick={() => targetUnit(opponentId, index)} />
            ))}
          </div>

          <div className="v18-center-lane">
            <div className="v18-pile-stat"><small>OPPONENT</small><span>DECK <b>{state.deckCounts[opponentId]}</b></span><span>GRAVE <b>{state.graveyards[opponentId]?.length ?? 0}</b></span></div>
            <div className="v18-field-core" aria-hidden="true"><i /><i /><span>◈</span></div>
            <div className={`v22-momentum ${momentumLabel === '유리' ? 'ahead' : momentumLabel === '불리' ? 'behind' : 'even'}`}>
              <span><small>BATTLE FLOW</small><b>{momentumLabel}</b></span>
              <i><b style={{ left: `${momentumPercent}%` }} /></i>
              <em>필드 · 코어 · 손패 · 에너지 기준</em>
            </div>
            <div className={`v18-field-guide ${myTurn ? 'mine' : 'opponent'}`}><small>{myTurn ? 'YOUR ACTION' : 'WATCHING'}</small><b>{actionGuide}</b></div>
            <div className="v18-pile-stat mine"><small>YOU</small><span>DECK <b>{state.deckCounts[userId]}</b></span><span>GRAVE <b>{state.graveyards[userId]?.length ?? 0}</b></span></div>
          </div>

          <div className="v18-zone-row v18-my-units">
            {state.boards[userId].units.map((unit, index) => (
              <UnitSlot
                key={index}
                unit={unit}
                owner={userId}
                index={index}
                selected={selectedAttacker === index}
                materialSelected={selectedMaterials.includes(index)}
                targetable={unit ? Boolean(selectingFriendlyTarget || selectingMaterials || (myTurn && state.phase === 'battle' && unit.canAttack)) : selectingUnitToSummon}
                onClick={() => unit ? targetUnit(userId, index) : playToUnitZone(index)}
              />
            ))}
          </div>

          <div className="v18-zone-row v18-my-secrets">
            {state.boards[userId].secrets.map((secret, index) => {
              const ownedInstance = privateState.secrets[index];
              const ownedTrap = ownedInstance ? CARD_BY_ID[ownedInstance.cardId] : undefined;
              if (secret && ownedTrap) return (
                <button type="button" className="v18-secret-slot mine is-set revealed" key={index} onClick={() => requestCardInspection(ownedTrap.id)} title={`${ownedTrap.name} · ${trapTriggerDescription(ownedTrap.trapTrigger)}`}>
                  <CardIllustration card={ownedTrap} compact /><span><b>{ownedTrap.name}</b><small>ARMED</small></span>
                </button>
              );
              return <button type="button" className={`v18-secret-slot mine ${!secret && selectingTrapToSet ? 'targetable' : ''}`} key={index} onClick={() => !secret && playToSecretZone(index)}><span className="v18-zone-number">S{index + 1}</span></button>;
            })}
          </div>
        </section>
      </main>

      <aside className="v18-command-rail">
        {myTurn && state.phase === 'main' && legendaryReadyCards.length > 0 && (
          <section className="v24-legendary-ready" aria-label="현재 소환 가능한 전설 카드">
            <header><span>LEGENDARY READY</span><b>{legendaryReadyCards.length}</b></header>
            <div>
              {legendaryReadyCards.map(({ instanceId, card, source }) => (
                <button type="button" key={instanceId} onClick={() => source === 'hand' ? chooseHand(instanceId) : chooseExtra(instanceId)} title={`${card.name} 선택`}>
                  <span className="v24-legendary-thumb"><CardIllustration card={card} compact /></span>
                  <span className="v24-legendary-copy"><small>{source === 'hand' ? 'HAND' : 'EXTRA'} · COST {card.summonMode === 'rift' ? (card.riftCost ?? card.cost) : card.cost}</small><b>{card.name}</b><em>지금 소환 조건 충족</em></span>
                  <i>소환 준비</i>
                </button>
              ))}
            </div>
          </section>
        )}
        {myTurn && specialReadyCount > 0 && state.phase === 'main' && (
          <button type="button" className="v18-special-ready" onClick={() => setExtraOpen(true)}><span>✦</span><div><b>특수 소환 가능</b><small>{specialReadyCount}장의 카드가 조건을 만족합니다.</small></div><em>보기</em></button>
        )}

        <section className={`v18-context-panel ${selectedCard || selectedExtraCard ? 'has-card' : ''}`}>
          {!selectedCard && !selectedExtraCard && (
            <div className="v18-context-empty"><small>{myTurn ? 'ACTION GUIDE' : 'OPPONENT TURN'}</small><b>{myTurn ? phaseLabel : '상대 행동을 관전 중'}</b><p>{actionGuide}</p><span>사용 가능 손패 {playableHandCount} · 특수 소환 {specialReadyCount}</span></div>
          )}
          {selectedCard && (
            <div className="v18-selected-card">
              <div className="v18-selected-art"><CardIllustration card={selectedCard} compact /></div>
              <div className="v18-selected-copy"><small>{KIND_LABEL[selectedCard.kind]} · {ELEMENT_LABEL[selectedCard.element]}</small><b>{selectedCard.name}</b><div><span>COST <strong>{selectedHandCost}</strong></span>{isUnitCard(selectedCard) && <><span>ATK <strong>{selectedCard.attack}</strong></span><span>DEF <strong>{selectedCard.health}</strong></span></>}</div><p>{selectedCard.summonMode === 'rift' ? `균열 조건 · ${extraRequirement(selectedCard)}` : selectedCard.text}</p></div>
              <div className="v18-selected-actions"><button type="button" onClick={() => requestCardInspection(selectedCard.id)}>상세</button><button type="button" onClick={() => clearSelection('카드 선택을 취소했습니다.')}>취소</button></div>
              {selectedCard.kind === 'spell' && (selectedCard.target === 'none' || selectedCard.target === 'enemy_core') && <button className="v18-context-primary" onClick={activateSelectedNoTarget}>주문 발동</button>}
            </div>
          )}
          {selectedExtraCard && (
            <div className="v18-selected-card extra">
              <div className="v18-selected-art"><CardIllustration card={selectedExtraCard} compact /></div>
              <div className="v18-selected-copy"><small>{selectedExtraCard.kind === 'fusion' ? '공명 융합' : '계승 진화'}</small><b>{selectedExtraCard.name}</b><p>{extraRequirement(selectedExtraCard)}</p><span className="v18-material-progress">소재 {selectedMaterials.length} / {requiredMaterials}</span></div>
              <div className="v18-selected-actions"><button type="button" onClick={() => requestCardInspection(selectedExtraCard.id)}>상세</button><button type="button" onClick={() => clearSelection('엑스트라 카드 선택을 취소했습니다.')}>취소</button></div>
              <button className="v18-context-primary" disabled={!canExtraSummon} onClick={summonSelectedExtra}>{selectedExtraCard.kind === 'fusion' ? '공명 융합' : '계승 진화'}</button>
            </div>
          )}
        </section>

        {message && <div className="v18-action-message">{message}</div>}
        {selectedAttacker !== null && <button className="v18-cancel-attack" type="button" onClick={() => { setSelectedAttacker(null); setMessage('공격 유닛 선택을 취소했습니다.'); }}>공격 선택 취소</button>}

        <section className="v18-action-buttons">
          {state.phase === 'main' && <button className="v18-secondary-action" disabled={!canSpendTurnToDraw} onClick={spendTurnToDraw}><span>＋ 카드 1장</span><small>턴을 소비해 추가 드로우</small></button>}
          {state.phase === 'main' && <button className="v18-battle-action" disabled={!myTurn || busy} onClick={() => gameAction('battle_phase')}><span>전투 단계</span><small>공격 가능한 유닛으로 전투</small></button>}
          <button className="v18-end-turn" disabled={!myTurn || busy} onClick={requestEndTurn}><span>턴 종료</span><small>{remainingOpportunities > 0 ? `가능 행동 ${remainingOpportunities}` : `${turnSecondsLeft}초 남음`}</small></button>
        </section>

        <section className="v18-extra-access">
          <button type="button" onClick={() => setExtraOpen(true)}><span>EXTRA DECK</span><b>{privateState.extra.length}</b><small>{extraReadyInstances.length > 0 ? `${extraReadyInstances.length}장 소환 가능` : '융합 · 진화'}</small></button>
        </section>

        <section className="v18-event-feed">
          <header><span>DUEL FEED</span><button type="button" onClick={() => setLogOpen(true)}>전체 기록</button></header>
          <div>{recentEvents.length > 0 ? recentEvents.map((event) => <div className={`v18-feed-item kind-${event.kind}`} key={event.id}><i /> <span><b><NicknameText name={eventActorName(event)} styleId={eventActorStyle(event)} /> · {duelEventLabel(event)}</b><small>{event.label ?? (duelEventLocation(event) || '결투 행동')}</small></span></div>) : <p>아직 기록된 행동이 없습니다.</p>}</div>
        </section>
      </aside>

      <footer className="v18-hand-dock">
        <div className="v18-hand-heading"><span><small>YOUR HAND</small><b>{privateState.hand.length} CARDS</b></span><em>{myTurn && state.phase === 'main' ? '밝게 표시된 카드는 지금 사용할 수 있습니다.' : '카드를 눌러 상세 정보를 확인할 수 있습니다.'}</em></div>
        <div className="v18-hand-scroll">
          {privateState.hand.map((instance) => {
            const card = CARD_BY_ID[instance.cardId];
            const effectiveCost = card?.summonMode === 'rift' && card.riftCost !== undefined && clientRiftReady(state, userId, opponentId, card) ? card.riftCost : card?.cost ?? 99;
            const affordable = Boolean(card && myTurn && state.phase === 'main' && myEnergy.current >= effectiveCost);
            const legendaryReady = Boolean(card?.rarity === 'legendary' && legendaryReadyCards.some((item) => item.instanceId === instance.instanceId));
            return <div className={`v18-hand-card ${specialReadyIds.has(instance.instanceId) ? 'special-ready' : ''} ${legendaryReady ? 'legendary-ready' : ''} ${recentDrawnIds.has(instance.instanceId) ? 'just-drawn' : ''} ${affordable ? 'playable' : 'not-playable'} ${selectedHand === instance.instanceId ? 'selected' : ''}`} key={instance.instanceId}>{specialReadyIds.has(instance.instanceId) && !legendaryReady && <span className="v18-special-badge">SPECIAL</span>}<CardFace card={card} compact selected={selectedHand === instance.instanceId} disabled={busy} onClick={() => chooseHand(instance.instanceId)} /></div>;
          })}
        </div>
        <div className="v18-hand-side"><span>ENERGY <b>{myEnergy.current}/{myEnergy.max}</b></span><span>DECK <b>{state.deckCounts[userId] ?? 0}</b></span><button type="button" onClick={() => setExtraOpen(true)}>EXTRA {privateState.extra.length}</button></div>
      </footer>

      <aside className={`battle-log v18-battle-log ${logOpen ? 'open' : ''}`}>
        <header><div><small>FULL HISTORY</small><b>결투 기록</b></div><button onClick={() => setLogOpen(false)}>×</button></header>
        <div>{state.logs.slice(-40).reverse().map((log) => <p className={`tone-${log.tone}`} key={log.id}><span>{new Date(log.createdAt).toLocaleTimeString('ko-KR', { minute: '2-digit', second: '2-digit' })}</span>{log.text}</p>)}</div>
      </aside>

      {extraOpen && (
        <div className="v18-extra-backdrop" onMouseDown={(event) => { if (event.currentTarget === event.target) setExtraOpen(false); }}>
          <aside className="v18-extra-drawer">
            <header><div><small>EXTRA DECK</small><b>공명 융합 · 계승 진화</b></div><button type="button" onClick={() => setExtraOpen(false)}>×</button></header>
            <p>빛나는 카드는 현재 필드와 에너지 조건으로 소환할 수 있습니다.</p>
            <div>{privateState.extra.map((instance) => {
              const card = CARD_BY_ID[instance.cardId];
              const ready = specialReadyIds.has(instance.instanceId);
              return <div className={`v18-extra-card ${ready ? 'ready' : ''} ${selectedExtra === instance.instanceId ? 'selected' : ''}`} key={instance.instanceId}>{ready && <span>READY</span>}<CardFace card={card} compact selected={selectedExtra === instance.instanceId} disabled={busy} onClick={() => { chooseExtra(instance.instanceId); setExtraOpen(false); }} /><small>{card ? extraRequirement(card) : ''}</small></div>;
            })}</div>
          </aside>
        </div>
      )}

      {endTurnConfirmOpen && state.status === 'active' && (
        <div className="modal-layer v18-confirm-layer v22-turn-confirm-layer">
          <section className="v18-confirm-modal v22-turn-confirm">
            <span className="eyebrow">ACTION CHECK</span>
            <h2>아직 사용할 수 있는 행동이 있습니다.</h2>
            <p>{state.phase === 'battle' ? `공격 가능한 유닛이 ${remainingAttackers}장 남아 있습니다.` : `현재 사용할 수 있는 손패/특수 소환 선택지가 ${remainingOpportunities}개 남아 있습니다.`} 그대로 턴을 종료할까요?</p>
            <div><button className="ghost-button" disabled={busy} onClick={() => setEndTurnConfirmOpen(false)}>전장으로 돌아가기</button><button className="primary-button" disabled={busy} onClick={() => { setEndTurnConfirmOpen(false); void gameAction('end_turn'); }}>그래도 턴 종료</button></div>
          </section>
        </div>
      )}

      {surrenderOpen && state.status === 'active' && (
        <div className="modal-layer v18-confirm-layer">
          <section className="v18-confirm-modal">
            <span className="eyebrow">SURRENDER</span>
            <h2>결투를 포기하시겠습니까?</h2>
            <p>항복 즉시 상대가 승리하며 현재 경기는 패배로 기록됩니다.</p>
            <div><button className="ghost-button" disabled={busy} onClick={() => setSurrenderOpen(false)}>계속 싸우기</button><button className="danger-button" disabled={busy} onClick={() => { setSurrenderOpen(false); void gameAction('surrender'); }}>항복하기</button></div>
          </section>
        </div>
      )}

      {state.status === 'finished' && (
        <div className="modal-layer v18-result-layer">
          <section className={`v18-result-modal v22-result-modal ${state.winnerId === userId ? 'win' : 'lose'}`}>
            <div className="v22-result-hero">
              <span className="result-emblem">{state.winnerId === userId ? '✦' : '◇'}</span>
              <div><small>DUEL COMPLETE · TURN {state.turnNumber}</small><h2>{state.winnerId === userId ? 'VICTORY' : 'DEFEAT'}</h2><p>{state.winReason}</p></div>
              <strong>{state.winnerId === userId ? '+180 COIN · +100 XP' : '+35 COIN · +35 XP'}</strong>
            </div>
            <div className="v22-result-stats">
              <article><small>CORE DAMAGE</small><b>{myMatchStats.coreDamage}</b><span>상대 {opponentMatchStats.coreDamage}</span></article>
              <article><small>CARDS PLAYED</small><b>{myMatchStats.cardsPlayed}</b><span>상대 {opponentMatchStats.cardsPlayed}</span></article>
              <article><small>SUMMONS</small><b>{myMatchStats.unitsSummoned}</b><span>특수 {myMatchStats.specialSummons}</span></article>
              <article><small>HEALING</small><b>{myMatchStats.healing}</b><span>드로우 {myMatchStats.cardsDrawn}</span></article>
            </div>
            <div className="v22-result-footer"><span>결투 기록은 결과 확정 후 계정 전적과 보상에 반영됩니다.</span><button className="primary-button" onClick={onLeave}>허브로 돌아가기</button></div>
          </section>
        </div>
      )}
    </div>
  );
}


function DuelView({ userId, hub, roomPayload, onRoom, onHub, serverStatus, syncState, lastSyncAt }: { userId: string; hub: HubData; roomPayload: RoomPayload | null; onRoom: (room: RoomPayload | null) => void; onHub: (hub: HubData) => void; serverStatus: SecureServerStatus; syncState: 'live' | 'syncing' | 'offline'; lastSyncAt: number }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const roomActionLock = useRef(false);

  async function roomAction(action: string, payload: Record<string, unknown> = {}) {
    if (!serverStatus.secureDuelReady) {
      setMessage(serverStatus.message);
      return undefined;
    }
    if (roomActionLock.current || busy) return undefined;
    roomActionLock.current = true;
    setBusy(true); setMessage('');
    try {
      const result = await api(action, payload);
      if (result.room && result.profiles) onRoom({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null });
      return result;
    } catch (error) { setMessage(error instanceof Error ? error.message : '요청 실패'); }
    finally { roomActionLock.current = false; setBusy(false); }
  }

  async function leaveRoom() {
    if (roomPayload) await roomAction('leave_room', { roomId: roomPayload.room.id });
    onRoom(null);
    try { const result = await api('hub'); if (result.hub) onHub(result.hub); } catch { /* ignore */ }
  }

  if (roomPayload?.room.status === 'active' || roomPayload?.room.status === 'finished') {
    return <DuelBoard payload={roomPayload} userId={userId} onRefresh={onRoom} onLeave={leaveRoom} syncState={syncState} lastSyncAt={lastSyncAt} />;
  }

  if (roomPayload) {
    const room = roomPayload.room;
    const profileMap = Object.fromEntries(roomPayload.profiles.map((profile) => [profile.user_id, profile]));
    const isHost = room.host_id === userId;
    const myReady = isHost ? room.ready_host : room.ready_guest;
    return (
      <div className="waiting-room">
        <section className="waiting-card panel">
          <span className="eyebrow">{room.public_match ? 'QUICK MATCH' : 'PRIVATE DUEL ROOM'}</span>
          <h2>{room.public_match ? (room.guest_id ? '상대 연결 완료' : '상대 검색 중') : '결투 준비'}</h2>
          {!room.public_match && <div className="room-code"><small>ROOM CODE</small><strong>{room.code}</strong><button onClick={() => navigator.clipboard.writeText(room.code)}>복사</button></div>}
          {room.public_match && <div className="room-code"><small>MATCH STATUS</small><strong>{room.guest_id ? 'CONNECTED' : 'SEARCHING'}</strong></div>}
          <div className="versus-line">
            <div><Avatar id={profileMap[room.host_id]?.avatar} size="large" /><b><NicknameText name={profileMap[room.host_id]?.display_name ?? 'HOST'} styleId={profileMap[room.host_id]?.nickname_style} /></b><span className={room.ready_host ? 'ready' : ''}>{room.ready_host ? 'READY' : 'WAITING'}</span></div>
            <strong>VS</strong>
            <div>{room.guest_id ? <><Avatar id={profileMap[room.guest_id]?.avatar} size="large" /><b><NicknameText name={profileMap[room.guest_id]?.display_name ?? 'GUEST'} styleId={profileMap[room.guest_id]?.nickname_style} /></b><span className={room.ready_guest ? 'ready' : ''}>{room.ready_guest ? 'READY' : 'WAITING'}</span></> : <><span className="empty-avatar">?</span><b>상대 대기 중</b><span>SHARE CODE</span></>}</div>
          </div>
          <p>{room.public_match ? (room.guest_id ? '현재 온라인 상태가 확인된 상대입니다. 양쪽 플레이어가 준비하면 결투가 시작됩니다.' : '온라인 상태가 확인된 상대만 연결합니다. 연결이 끊긴 대기 유저는 자동으로 제외됩니다.') : '양쪽 플레이어가 준비하면 활성 덱으로 결투가 시작됩니다.'}</p>
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
          <div><span>ECLIPSE NETWORK</span><h2>온라인 대전 서비스를 점검하고 있습니다.</h2><p>{publicServerStatusMessage(serverStatus)}</p></div>
          <ol>
            <li><b>1</b><span>덱 구성과 카드 보관함은 계속 이용할 수 있습니다.</span></li>
            <li><b>2</b><span>대전 서버가 복구되면 별도 설정 없이 바로 이용할 수 있습니다.</span></li>
            <li><b>3</b><span>잠시 후 대전 메뉴에서 다시 확인해 주세요.</span></li>
          </ol>
          <small>현재 계정과 보유 카드 데이터는 그대로 유지됩니다.</small>
        </section>
      )}
      <section className={`duel-mode-grid ${serverStatus.secureDuelReady ? '' : 'is-disabled'}`}>
        <button className="mode-card ranked" disabled={busy || !activeDeck || !serverStatus.secureDuelReady} onClick={() => roomAction('quick_match')}><span>QUICK MATCH</span><h3>빠른 대전</h3><p>대기 중인 상대를 찾아 자동으로 연결합니다.</p><em>매칭 시작 →</em></button>
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
  const [soundVolume, setSoundVolume] = useState(0.82);
  const [guideOpen, setGuideOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [roomSyncState, setRoomSyncState] = useState<'live' | 'syncing' | 'offline'>('live');
  const [lastRoomSyncAt, setLastRoomSyncAt] = useState(() => Date.now());

  useEffect(() => {
    const stored = window.localStorage.getItem(SOUND_STORAGE_KEY);
    const enabled = stored !== 'off';
    const storedVolume = Number(window.localStorage.getItem(SOUND_VOLUME_STORAGE_KEY));
    const volume = Number.isFinite(storedVolume) && storedVolume >= 0 && storedVolume <= 1 ? storedVolume : 0.82;
    setSoundEnabled(enabled);
    setSoundVolume(volume);
    setGlobalSoundEnabled(enabled);
    setGlobalSoundVolume(volume);
  }, []);

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    setGlobalSoundEnabled(next);
    window.localStorage.setItem(SOUND_STORAGE_KEY, next ? 'on' : 'off');
    if (next) window.setTimeout(() => playUiSound('success'), 0);
  }

  function changeSoundVolume(volume: number) {
    const next = Math.max(0, Math.min(1, volume));
    setSoundVolume(next);
    setGlobalSoundVolume(next);
    window.localStorage.setItem(SOUND_VOLUME_STORAGE_KEY, String(next));
    if (soundEnabled && next > 0) window.setTimeout(() => playUiSound('click'), 0);
  }

  useEffect(() => {
    if (roomPayload?.room.status === 'active') setSettingsOpen(false);
  }, [roomPayload?.room.status]);

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
        if (result.room && result.profiles) {
          setRoomPayload({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null });
          setRoomSyncState('live');
          setLastRoomSyncAt(Date.now());
          setView('duel');
        }
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
      const slowTimer = window.setTimeout(() => setRoomSyncState('syncing'), 350);
      try {
        const result = await api('get_room', { roomId });
        if (result.room && result.profiles) {
          setRoomPayload({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null });
          setRoomSyncState('live');
          setLastRoomSyncAt(Date.now());
        }
      } catch (reason) {
        setRoomSyncState('offline');
        if (typeof console !== 'undefined') console.warn('[ECLIPSE SYNC]', reason instanceof Error ? reason.message : 'room sync failed');
      } finally {
        window.clearTimeout(slowTimer);
        refreshing = false;
      }
    }
    const channel = supabase.channel(`room-${roomId}`).on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'eclipse_rooms', filter: `id=eq.${roomId}` }, refresh).subscribe((status) => {
      if (status === 'SUBSCRIBED') { setRoomSyncState('live'); setLastRoomSyncAt(Date.now()); }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') setRoomSyncState('offline');
    });
    const onFocus = () => { void refresh(); };
    const onVisibility = () => { if (document.visibilityState === 'visible') void refresh(); };
    const onOffline = () => setRoomSyncState('offline');
    const onOnline = () => { setRoomSyncState('syncing'); void refresh(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisibility);
    const pollMs = roomPayload?.room.status === 'active' ? 2500 : 8000;
    const timer = window.setInterval(refresh, pollMs);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisibility);
      supabase.removeChannel(channel);
    };
  }, [roomPayload?.room.id, roomPayload?.room.status, session?.user.id]);

  useEffect(() => {
    const room = roomPayload?.room;
    if (!session || !room?.id || !room.public_match || room.status !== 'waiting') return;
    const roomId = room.id;
    let alive = true;
    let sending = false;

    async function heartbeat() {
      if (!alive || sending || document.visibilityState === 'hidden') return;
      sending = true;
      try {
        const result = await api('match_presence', { roomId });
        if (!alive) return;
        if (result.room && result.profiles) {
          setRoomPayload({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null });
          setRoomSyncState('live');
          setLastRoomSyncAt(Date.now());
        }
      } catch (reason) {
        if (!alive) return;
        if (typeof console !== 'undefined') console.warn('[ECLIPSE MATCH PRESENCE]', reason instanceof Error ? reason.message : 'presence heartbeat failed');
      } finally {
        sending = false;
      }
    }

    void heartbeat();
    const timer = window.setInterval(heartbeat, 5_000);
    const onVisible = () => { if (document.visibilityState === 'visible') void heartbeat(); };
    const onOnline = () => { void heartbeat(); };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);
    return () => {
      alive = false;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
    };
  }, [roomPayload?.room.id, roomPayload?.room.public_match, roomPayload?.room.status, session?.user.id]);

  if (!authReady) return <LoadingScreen />;
  if (!session) return <AuthScreen onSession={setSession} />;
  if (!hub && error) return <AccountErrorScreen message={error} onRetry={() => { setError(''); setBootstrapVersion((value) => value + 1); }} onSignOut={() => supabase.auth.signOut({ scope: 'local' })} />;
  if (!hub) return <LoadingScreen text="계정과 카드 보관함을 불러오는 중" />;

  const content = (() => {
    switch (view) {
      case 'duel': return <DuelView userId={session.user.id} hub={hub} roomPayload={roomPayload} onRoom={setRoomPayload} onHub={setHub} serverStatus={serverStatus} syncState={roomSyncState} lastSyncAt={lastRoomSyncAt} />;
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
    <main className={`game-app v19-client v23-client view-${view} ${roomPayload?.room.status === 'active' ? 'in-duel' : ''}`} data-ui-build="v26">
      <div className="app-backdrop" aria-hidden="true"><span className="backdrop-grid" /><span className="backdrop-orbit" /><span className="backdrop-glow" /></div>
      <aside className="sidebar">
        <button className="game-logo" onClick={() => { playUiSound('click'); setSettingsOpen(false); setChatOpen(false); setView('home'); }}><span className="logo-glyph"><i>E</i></span><div><b>ECLIPSE</b><small>DUEL</small></div></button>
        <nav>{NAV_ITEMS.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { playUiSound('click'); setSettingsOpen(false); setChatOpen(false); setView(item.id); }}><i><GameIcon name={item.id} /></i><span>{item.label}</span></button>)}</nav>
        <div className="sidebar-profile"><Avatar id={hub.profile.avatar} size="small" /><span><b><NicknameText name={hub.profile.display_name} styleId={hub.profile.nickname_style} /></b><small>LV.{levelFromXp(hub.profile.xp)}</small></span><button aria-label="로그아웃" onClick={() => supabase.auth.signOut({ scope: 'local' })}><GameIcon name="logout" /></button></div>
      </aside>

      <header className="topbar">
        <div className="mobile-logo"><span className="logo-glyph"><i>E</i></span><b>ECLIPSE DUEL</b></div>
        <div className="topbar-title"><small>{NAV_ITEMS.find((item) => item.id === view)?.label ?? (view === 'profile' ? '프로필' : 'ECLIPSE')}</small><b>ECLIPSE NETWORK</b></div>
        <button className={`v13-server-chip ${serverStatus.secureDuelReady ? 'ready' : 'warning'}`} onClick={() => setView('duel')} title={publicServerStatusMessage(serverStatus)}><span />{serverStatus.secureDuelReady ? '온라인' : '점검 중'}</button>
        <div className="topbar-actions v9-topbar-actions">
          <span className="currency-pill"><GameIcon name="coin" /><small>COIN</small><b>{hub.wallet.coins.toLocaleString()}</b></span>
          <button className={`chat-toggle ${chatOpen ? 'active' : ''}`} onClick={() => { playUiSound('click'); setSettingsOpen(false); setChatOpen((value) => !value); }}><GameIcon name="chat" /><span>{roomChat ? '방 채팅' : '채팅'}</span></button>
          <button className="profile-chip" onClick={() => { playUiSound('click'); setSettingsOpen(false); setChatOpen(false); setView('profile'); }}><Avatar id={hub.profile.avatar} size="small" /><i className={`v26-chip-emblem emblem-${hub.profile.profile_emblem ?? 'emblem_default'}`} aria-hidden="true">{emblemGlyph(hub.profile.profile_emblem)}</i><span><NicknameText name={hub.profile.display_name} styleId={hub.profile.nickname_style} /></span></button>
          <button className={`v9-icon-button v22-system-button ${settingsOpen ? 'active' : ''}`} onClick={() => { playUiSound('click'); setChatOpen(false); setSettingsOpen((value) => !value); }} title="게임 설정" aria-label="게임 설정"><GameIcon name="settings" /><span>SYSTEM</span></button>
        </div>
      </header>

      <section className="content-area">{error && <div className="global-error"><span>{error}</span><button onClick={() => setError('')}>×</button></div>}{content}</section>

      <nav className="mobile-nav">{NAV_ITEMS.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { playUiSound('click'); setSettingsOpen(false); setChatOpen(false); setView(item.id); }}><i><GameIcon name={item.id} /></i><span>{item.label}</span></button>)}</nav>
      <ChatDrawer open={chatOpen} roomId={roomChat} onClose={() => setChatOpen(false)} profile={hub.profile} />
      {chatOpen && <button className="chat-backdrop" aria-label="채팅 닫기" onClick={() => setChatOpen(false)} />}
      <ControlCenter
        open={settingsOpen}
        soundEnabled={soundEnabled}
        soundVolume={soundVolume}
        onClose={() => setSettingsOpen(false)}
        onToggleSound={toggleSound}
        onVolumeChange={changeSoundVolume}
        onOpenGuide={() => { setSettingsOpen(false); setGuideOpen(true); }}
        onOpenProfile={() => { setSettingsOpen(false); setView('profile'); }}
        onSignOut={() => { setSettingsOpen(false); void supabase.auth.signOut({ scope: 'local' }); }}
      />
      {inspectedCardId && CARD_BY_ID[inspectedCardId] && <CardDetailModal card={CARD_BY_ID[inspectedCardId]} onClose={() => setInspectedCardId(null)} />}
      {guideOpen && <GameGuideModal onClose={() => setGuideOpen(false)} />}
    </main>
  );
}
