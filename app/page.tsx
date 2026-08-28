'use client';

import { createClient, Session } from '@supabase/supabase-js';
import { ChangeEvent, CSSProperties, FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
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
  ECLIPSE_PHASE_LABEL,
  ECLIPSE_PHASE_ORDER,
  type EclipsePhase,
  type Element,
  KIND_LABEL,
  UNIT_TYPE_LABEL,
  MAX_COPIES,
  MAX_PRIMARY_SERIES_CARDS,
  PACKS,
  RARITY_LABEL,
  type Rarity,
  resolvedEclipseAffinity,
  resolvedEclipsePhaseModifiers,
  type SeriesId,
  type UnitType,
  countCards,
  extraRequiredUnitCount,
  extraSummonRuleDescription,
  isExtraDeckCard,
  isUnitCard,
  seriesAbilityDescription,
  seriesSignatureDescription,
  tacticalAbilityDescription,
  validateDeck,
  validateExtraDeck,
} from './game-data';
import { CORE_MAX, TURN_DURATION_MS, type GameSnapshot, type MatchState, type PrivateState, type UnitState, type VisualEvent } from './game-engine';
import {
  PRACTICE_DIFFICULTY_LABEL,
  applyPracticeGameAction,
  choosePracticeBotAction,
  createPracticeMatch,
  type PracticeDifficulty,
} from './practice-ai';
import { V34_BATTLE_EMOTES, V34_BATTLE_EMOTE_BY_ID, V34_BATTLE_EMOTE_PACKS, V34_EMOTE_SLOT_LIMIT } from './v34-emotes';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

const supabase = createClient(supabaseUrl || 'https://invalid.supabase.co', supabaseKey || 'invalid-key', {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

const TURN_DURATION_SECONDS = Math.round(TURN_DURATION_MS / 1000);

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
type FriendProfile = Pick<Profile, 'user_id' | 'display_name' | 'player_code' | 'avatar' | 'status_message' | 'wins' | 'losses' | 'xp' | 'nickname_style' | 'profile_theme' | 'profile_frame'>;

type HubData = {
  profile: Profile;
  wallet: Wallet;
  collection: CollectionRow[];
  decks: DeckRow[];
  friendRequests: FriendRequest[];
  friends: FriendProfile[];
  requestProfiles: Array<Pick<Profile, 'user_id' | 'display_name' | 'player_code' | 'avatar' | 'nickname_style' | 'profile_theme' | 'profile_frame'>>;
  profileCosmetics?: string[];
  battleEmotes?: string[];
  emoteLoadout?: string[];
};

type RoomRow = {
  id: string;
  code: string;
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
  state: MatchState | null;
  version: number;
  winner_id: string | null;
};

type RoomProfile = Pick<Profile, 'user_id' | 'display_name' | 'avatar' | 'wins' | 'losses' | 'xp' | 'profile_emblem' | 'card_sleeve' | 'nickname_style'>;
type RoomMemberView = { user_id: string; role: 'player_a' | 'player_b' | 'spectator'; is_owner: boolean };
type RoomPayload = { room: RoomRow; profiles: RoomProfile[]; privateState: PrivateState | null; members?: RoomMemberView[]; spectatorHands?: Record<string, PrivateState['hand']>; spectatorSecrets?: Record<string, PrivateState['secrets']>; battleEmotes?: string[]; };
type ChatMessage = { id: number; user_id: string; display_name: string; nickname_style?: string; body: string; created_at: string };
type ChatSkinProfile = Pick<Profile, 'user_id' | 'profile_theme' | 'profile_frame'>;
type AdminAccountSummary = { userId: string; email: string; displayName: string; playerCode: string };

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
  members?: RoomMemberView[];
  spectatorHands?: Record<string, PrivateState['hand']>;
  spectatorSecrets?: Record<string, PrivateState['secrets']>;
  battleEmotes?: string[];
  joinedAsSpectator?: boolean;
  cardIds?: string[];
  balance?: number;
  serverStatus?: SecureServerStatus;
  resumedRoom?: boolean;
  canRecoverAccounts?: boolean;
  accounts?: AdminAccountSummary[];
  account?: AdminAccountSummary;
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
  { id: 'bg_sticker_nikke', kind: 'background', name: '스티커 월 · 니케', price: 1880, rarity: 'legendary', description: '니케 이모티콘 6종을 누끼 스티커처럼 붙여 넣은 프로필 배경.', accent: '#ffcf92' },
  { id: 'bg_sticker_bluearchive', kind: 'background', name: '스티커 월 · 도로롱', price: 1880, rarity: 'legendary', description: '도로롱 이모티콘 6종을 코팅 스티커처럼 흩뿌린 프로필 배경.', accent: '#9ad8ff' },
  { id: 'bg_sticker_genshin', kind: 'background', name: '스티커 월 · 트릭컬', price: 1880, rarity: 'legendary', description: '트릭컬 이모티콘 6종을 다이어리처럼 배치한 프로필 배경.', accent: '#ffe18f' },
  { id: 'bg_sticker_hsr', kind: 'background', name: '스티커 월 · 가디언테일즈', price: 1880, rarity: 'legendary', description: '가디언테일즈 이모티콘 6종이 둥둥 떠 있는 프로필 배경.', accent: '#d6c4ff' },
  { id: 'bg_sticker_arcade', kind: 'background', name: '스티커 월 · 이렘티콘', price: 1760, rarity: 'legendary', description: '이렘티콘 이모티콘 6종을 도트 패널 위에 붙인 레트로 배경.', accent: '#98f8ff' },
  { id: 'bg_sticker_wuwa', kind: 'background', name: '프리즘 레이스 오로라', price: 2250, rarity: 'legendary', description: '홀로 레이스 리본과 프리즘 빛결이 천천히 흘러 색이 바뀌는 애니메이션 프로필 배경.', accent: '#9ae7ff' },
  { id: 'bg_clockwork_dawn', kind: 'background', name: '크로노 기어 성역', price: 2500, rarity: 'legendary', description: '금빛 시간륜과 기어 궤도가 계속 회전하듯 움직이고 새벽 광선이 스쳐 가는 애니메이션 배경.', accent: '#ffd98a' },
  { id: 'bg_aurora_grid', kind: 'background', name: '오로라 데이터폴', price: 2350, rarity: 'legendary', description: '청록 오로라와 데이터 격자가 폭포처럼 흘러내리며 파동치는 미래형 애니메이션 배경.', accent: '#8bffd4' },
  { id: 'bg_midnight_record', kind: 'background', name: '미드나잇 블랙홀', price: 2600, rarity: 'legendary', description: '심야의 블랙홀 링과 보랏빛 성운이 맥동하며 안쪽으로 빨려 들어가는 듯한 애니메이션 배경.', accent: '#aab6ff' },
  { id: 'bg_starlight_arcade', kind: 'background', name: '스타라이트 하이웨이', price: 2400, rarity: 'legendary', description: '별빛 입자와 네온 레일이 화면을 가로질러 질주하는 속도감 있는 애니메이션 프로필 배경.', accent: '#9cf2ff' },
  { id: 'emblem_sticker_rabbit', kind: 'emblem', name: '스티커 도로롱', price: 760, rarity: 'epic', description: '도로롱 이모티콘을 코팅 스티커처럼 만든 프로필 아이콘.', accent: '#ffc6e2', glyph: '🐰' },
  { id: 'emblem_sticker_angel', kind: 'emblem', name: '스티커 가디언', price: 760, rarity: 'epic', description: '가디언테일즈 이모티콘을 둥근 스티커로 만든 문양.', accent: '#fff3b6', glyph: '😇' },
  { id: 'emblem_sticker_cat', kind: 'emblem', name: '스티커 니케', price: 760, rarity: 'epic', description: '니케 이모티콘을 누끼 스티커처럼 띄운 프로필 아이콘.', accent: '#d7d7ff', glyph: '🐱' },
  { id: 'emblem_sticker_cheer', kind: 'emblem', name: '스티커 트릭컬', price: 760, rarity: 'epic', description: '트릭컬 이모티콘을 응원 스티커처럼 꾸민 문양.', accent: '#9cf2ff', glyph: '🎉' },
  { id: 'emblem_sticker_moon', kind: 'emblem', name: '스티커 이렘티콘', price: 760, rarity: 'epic', description: '이렘티콘 이모티콘을 야광 스티커 느낌으로 표현한 문양.', accent: '#c4d4ff', glyph: '🌙' },
  { id: 'emblem_sticker_crown', kind: 'emblem', name: '스티커 니케 파워', price: 760, rarity: 'epic', description: '니케 파워 표정을 큼직하게 붙여 넣은 문양.', accent: '#ffe19b', glyph: '👑' },
  { id: 'emblem_sticker_gear', kind: 'emblem', name: '스티커 가디언 플라워', price: 760, rarity: 'epic', description: '가디언 꽃 이모티콘이 돌아가는 듯한 메카풍 문양.', accent: '#c5f4ff', glyph: '⚙' },
  { id: 'emblem_sticker_heart', kind: 'emblem', name: '스티커 도로롱 러브', price: 760, rarity: 'epic', description: '도로롱 하트 이모티콘을 겹쳐 만든 문양.', accent: '#ffb3d8', glyph: '💖' },
  { id: 'emblem_sticker_pixel', kind: 'emblem', name: '스티커 이렘 예아', price: 760, rarity: 'epic', description: '이렘티콘 이모티콘을 픽셀 스티커처럼 만든 아이콘.', accent: '#7ce8ff', glyph: '🕹' },
  { id: 'emblem_sticker_comet', kind: 'emblem', name: '스티커 트릭컬 버스트', price: 760, rarity: 'epic', description: '트릭컬 버스트 이모티콘이 휙 지나가는 문양.', accent: '#bceeff', glyph: '☄' },
  { id: 'sleeve_sticker_nikke', kind: 'sleeve', name: '스티커 슬리브 · 니케', price: 920, rarity: 'epic', description: '니케 이모티콘 6종을 누끼 스티커처럼 붙인 카드 슬리브.', accent: '#ffcf92', glyph: '⚙' },
  { id: 'sleeve_sticker_bluearchive', kind: 'sleeve', name: '스티커 슬리브 · 도로롱', price: 920, rarity: 'epic', description: '도로롱 이모티콘 6종을 코팅 스티커처럼 배치한 카드 슬리브.', accent: '#9ad8ff', glyph: '✎' },
  { id: 'sleeve_sticker_genshin', kind: 'sleeve', name: '스티커 슬리브 · 트릭컬', price: 920, rarity: 'epic', description: '트릭컬 이모티콘 6종이 통통 튀게 붙은 카드 뒷면.', accent: '#ffe18f', glyph: '✦' },
  { id: 'sleeve_sticker_hsr', kind: 'sleeve', name: '스티커 슬리브 · 가디언테일즈', price: 920, rarity: 'epic', description: '가디언테일즈 이모티콘 6종이 떠다니는 카드 슬리브.', accent: '#d6c4ff', glyph: '🚄' },
  { id: 'sleeve_sticker_arcade', kind: 'sleeve', name: '스티커 슬리브 · 이렘티콘', price: 920, rarity: 'epic', description: '이렘티콘 이모티콘 6종이 붙은 레트로 카드 뒷면.', accent: '#98f8ff', glyph: '▦' },
  { id: 'sleeve_sticker_wuwa', kind: 'sleeve', name: '프리즘 레이스 슬리브', price: 960, rarity: 'epic', description: '홀로 프리즘과 레이스 패턴이 반짝이는 예쁜 무늬 슬리브.', accent: '#9ae7ff', glyph: '◈' },
  { id: 'sleeve_sticker_eclipse', kind: 'sleeve', name: '오로라 라인 슬리브', price: 960, rarity: 'epic', description: '오로라 선과 유리 파편 무늬가 교차하는 세련된 슬리브.', accent: '#f7d38c', glyph: '◉' },
  { id: 'sleeve_sticker_royal', kind: 'sleeve', name: '로열 다마스크 슬리브', price: 960, rarity: 'epic', description: '고풍스러운 다마스크 금장 무늬로 채운 우아한 슬리브.', accent: '#ffe19b', glyph: '♕' },
  { id: 'sleeve_sticker_sakura', kind: 'sleeve', name: '블러썸 포그 슬리브', price: 960, rarity: 'epic', description: '안개처럼 퍼지는 꽃잎 패턴이 포근한 슬리브.', accent: '#ffbfdc', glyph: '🌸' },
  { id: 'sleeve_sticker_midnight', kind: 'sleeve', name: '미드나잇 네온 슬리브', price: 960, rarity: 'epic', description: '심야 네온 격자와 작은 별 무늬가 반짝이는 슬리브.', accent: '#bcc7ff', glyph: '🌙' },
  { id: 'frame_glitchwave', kind: 'frame', name: '글리치 웨이브', price: 2080, rarity: 'legendary', description: '핑크와 시안의 글리치 파형이 프레임 가장자리를 튀기며 흐르는 프레임.', accent: '#ff86e5' },
  { id: 'frame_cyber_shock', kind: 'frame', name: '사이버 쇼크', price: 2120, rarity: 'legendary', description: '전기 잔광과 디지털 쇼크 라인이 번쩍이는 프레임.', accent: '#74f7ff' },
  { id: 'frame_holo_bloom', kind: 'frame', name: '홀로 블룸', price: 2160, rarity: 'legendary', description: '홀로그램 꽃잎과 프리즘 광택이 맴도는 프레임.', accent: '#ffb6ef' },
  { id: 'frame_sunset_drive', kind: 'frame', name: '선셋 드라이브', price: 2020, rarity: 'epic', description: '주황빛 석양과 네온 선이 부드럽게 달리는 프레임.', accent: '#ffad70' },
  { id: 'frame_frost_arc', kind: 'frame', name: '프로스트 아크', price: 2140, rarity: 'legendary', description: '서리 결정과 푸른 냉기가 얇게 흐르는 프레임.', accent: '#c8e5ff' },
  { id: 'frame_comet_ring', kind: 'frame', name: '코멧 링', price: 2180, rarity: 'legendary', description: '혜성 꼬리가 궤도를 그리며 순환하는 프레임.', accent: '#9dddff' },
  { id: 'frame_velvet_rose', kind: 'frame', name: '벨벳 로즈', price: 2060, rarity: 'epic', description: '장미빛 벨벳 광택과 꽃잎 반짝임이 감도는 프레임.', accent: '#ff9ec8' },
  { id: 'frame_retro_scan', kind: 'frame', name: '레트로 스캔', price: 2000, rarity: 'epic', description: 'CRT 스캔라인과 픽셀 글로우가 퍼지는 프레임.', accent: '#8cffd8' },
  { id: 'frame_prayer_gold', kind: 'frame', name: '프레이어 골드', price: 2200, rarity: 'legendary', description: '금빛 성광과 유리창 빔이 내려앉는 성스러운 프레임.', accent: '#ffe19c' },
  { id: 'frame_quantum_cube', kind: 'frame', name: '퀀텀 큐브', price: 2240, rarity: 'legendary', description: '작은 큐브와 노이즈 조각이 차원처럼 점멸하는 프레임.', accent: '#a8a7ff' },
  { id: 'nickname_glitch_pink', kind: 'nickname', name: '핑크 글리치', price: 1450, rarity: 'legendary', description: '핑크·시안 분광 잔상이 튀는 글리치 닉네임 효과.', accent: '#ff8ddf' },
  { id: 'nickname_cyber_blue', kind: 'nickname', name: '사이버 블루', price: 1320, rarity: 'epic', description: '푸른 전류와 네온 잔광이 흐르는 닉네임 효과.', accent: '#7cecff' },
  { id: 'nickname_prism_pop', kind: 'nickname', name: '프리즘 팝', price: 1360, rarity: 'epic', description: '파스텔 프리즘 색이 빠르게 이동하는 반짝 닉네임 효과.', accent: '#f0a7ff' },
  { id: 'nickname_rose_gold', kind: 'nickname', name: '로즈 골드', price: 1490, rarity: 'legendary', description: '로즈 골드 하이라이트가 금속처럼 번쩍이는 닉네임 효과.', accent: '#ffb0bf' },
  { id: 'nickname_moon_dust', kind: 'nickname', name: '문 더스트', price: 1280, rarity: 'epic', description: '달빛 가루가 은은하게 스치듯 지나가는 닉네임 효과.', accent: '#dbe6ff' },
  { id: 'nickname_plasma', kind: 'nickname', name: '플라즈마 스파크', price: 1540, rarity: 'legendary', description: '보라색 플라즈마와 푸른 스파크가 튀는 닉네임 효과.', accent: '#ae92ff' },
  { id: 'nickname_auric_scan', kind: 'nickname', name: '오릭 스캔', price: 1510, rarity: 'legendary', description: '금빛 스캔 라인이 글자 위를 왕복하는 닉네임 효과.', accent: '#ffd785' },
  { id: 'nickname_mint_beam', kind: 'nickname', name: '민트 빔', price: 1220, rarity: 'epic', description: '민트빛 빔이 말끔하게 흐르는 상쾌한 닉네임 효과.', accent: '#9ff5dd' },
  { id: 'nickname_sticker_pop', kind: 'nickname', name: '스티커 팝', price: 1400, rarity: 'epic', description: '만화 스티커처럼 통통 튀는 그림자와 색감을 주는 닉네임 효과.', accent: '#ff8db5' },
  { id: 'nickname_quantum_noise', kind: 'nickname', name: '퀀텀 노이즈', price: 1620, rarity: 'legendary', description: '청보라 노이즈와 미세한 왜곡이 겹치는 닉네임 효과.', accent: '#93b7ff' }
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

type UiSound = 'click' | 'card' | 'remove' | 'auto' | 'save' | 'pack' | 'reveal' | 'success' | 'summon' | 'fusion' | 'evolution' | 'attack' | 'impact' | 'spell' | 'trap' | 'damage' | 'shield' | 'corehit' | 'destroy' | 'draw' | 'turn';

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
  const combatSound = kind === 'summon' || kind === 'fusion' || kind === 'evolution' || kind === 'attack' || kind === 'impact' || kind === 'spell' || kind === 'trap' || kind === 'damage' || kind === 'shield' || kind === 'corehit' || kind === 'destroy' || kind === 'draw' || kind === 'turn';
  const soundGain = Math.min(1.15, Math.max(0.001, globalSoundVolume) * (combatSound ? 1.22 : 1));
  master.gain.setValueAtTime(soundGain, now);
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
    case 'fusion':
      tone('sine', 92, 310, 0.52, 0.034);
      tone('triangle', 210, 760, 0.46, 0.030, 0.06);
      tone('sine', 420, 1260, 0.34, 0.022, 0.18);
      noise(0.32, 0.028, 0.12, 820);
      tone('square', 128, 74, 0.22, 0.016, 0.38);
      break;
    case 'evolution':
      tone('triangle', 190, 620, 0.48, 0.03);
      tone('sine', 360, 1120, 0.42, 0.022, 0.08);
      tone('sine', 720, 1680, 0.34, 0.016, 0.20);
      noise(0.24, 0.018, 0.19, 1250);
      break;
    case 'attack':
      noise(0.13, 0.052, 0, 520);
      tone('sawtooth', 420, 92, 0.16, 0.042);
      tone('triangle', 780, 220, 0.11, 0.016, 0.015);
      break;
    case 'impact':
      noise(0.16, 0.078, 0, 160);
      tone('square', 180, 62, 0.13, 0.044);
      tone('sine', 76, 46, 0.20, 0.038, 0.01);
      break;
    case 'spell':
      tone('sine', 320, 1180, 0.35, 0.024);
      tone('triangle', 680, 1680, 0.28, 0.016, 0.055);
      noise(0.18, 0.01, 0.08, 1600);
      break;
    case 'trap':
      tone('square', 190, 760, 0.22, 0.032);
      tone('triangle', 1040, 230, 0.27, 0.027, 0.035);
      noise(0.18, 0.052, 0.025, 900);
      tone('sine', 84, 56, 0.24, 0.035, 0.06);
      break;
    case 'damage':
      noise(0.22, 0.075, 0, 190);
      tone('sawtooth', 125, 46, 0.20, 0.055);
      tone('sine', 72, 48, 0.22, 0.032, 0.015);
      break;
    case 'shield':
      noise(0.12, 0.04, 0, 1500);
      tone('square', 760, 330, 0.12, 0.026);
      tone('sine', 1180, 620, 0.17, 0.018, 0.015);
      break;
    case 'corehit':
      noise(0.28, 0.085, 0, 120);
      tone('sawtooth', 180, 42, 0.28, 0.065);
      tone('square', 90, 48, 0.22, 0.035, 0.025);
      break;
    case 'destroy':
      noise(0.32, 0.075, 0, 260);
      tone('sawtooth', 320, 62, 0.30, 0.052);
      tone('triangle', 880, 150, 0.24, 0.022, 0.035);
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

/** v34l: level-up coin curve. Lv.2=500, Lv.3=1000, Lv.4=1500 ... */
function levelAchievementCoins(level: number): number {
  return level <= 1 ? 0 : Math.max(0, level - 1) * 500;
}

function levelAchievementCoinsBetween(beforeXp: number, afterXp: number): number {
  const beforeLevel = levelFromXp(beforeXp);
  const afterLevel = levelFromXp(afterXp);
  let reward = 0;
  for (let level = beforeLevel + 1; level <= afterLevel; level += 1) reward += levelAchievementCoins(level);
  return reward;
}

function winRate(profile: Profile | FriendProfile): number {
  const total = profile.wins + profile.losses;
  return total === 0 ? 0 : Math.round((profile.wins / total) * 100);
}

type GraveyardKindCounts = { unit: number; spell: number; trap: number; other: number; total: number };

function graveyardKindCounts(cardIds: string[] | undefined): GraveyardKindCounts {
  const counts: GraveyardKindCounts = { unit: 0, spell: 0, trap: 0, other: 0, total: cardIds?.length ?? 0 };
  for (const cardId of cardIds ?? []) {
    const card = CARD_BY_ID[cardId];
    if (card && isUnitCard(card)) counts.unit += 1;
    else if (card?.kind === 'spell') counts.spell += 1;
    else if (card?.kind === 'trap') counts.trap += 1;
    else counts.other += 1;
  }
  return counts;
}

function graveyardSummaryText(cardIds: string[] | undefined): string {
  const counts = graveyardKindCounts(cardIds);
  return `묘지 ${counts.total}장 · 유닛 ${counts.unit} · 스펠 ${counts.spell} · 함정 ${counts.trap}${counts.other ? ` · 기타 ${counts.other}` : ''}`;
}

function GraveyardBreakdown({ cardIds }: { cardIds: string[] | undefined }) {
  const counts = graveyardKindCounts(cardIds);
  return (
    <span className="v43-grave-breakdown" title={graveyardSummaryText(cardIds)} aria-label={graveyardSummaryText(cardIds)}>
      <i>UNIT <b>{counts.unit}</b></i>
      <i>SPELL <b>{counts.spell}</b></i>
      <i>TRAP <b>{counts.trap}</b></i>
    </span>
  );
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
        <em>{series ? `${pack.odds.seriesGuaranteedSlots ?? 1} SERIES+` : `${RARITY_LABEL[pack.guaranteed]}+ GUARANTEED`}</em>
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
  guard: '수호 · 상대는 공격 대상을 선택할 때, 가능한 경우 이 캐릭터를 먼저 공격해야 합니다.',
  charge: '속공 · 이 캐릭터는 소환된 턴에도 즉시 공격할 수 있습니다.',
  lifesteal: '흡수 · 이 캐릭터가 전투로 준 피해만큼 내 코어를 회복합니다.',
  pierce: '관통 · 전투로 적 캐릭터를 파괴하면 남은 피해를 상대 코어에 이어서 줍니다.',
  corestrike: '직격 · 상대 필드에 수호가 없다면 다른 캐릭터를 무시하고 코어를 직접 공격할 수 있습니다.',
  execute: '처형 · 이 캐릭터의 기본 공격이 적 캐릭터를 지정해 정상 적중하면, 기본 공격 피해를 먼저 적용한 뒤 보호막이나 피해량에 관계없이 지정 대상을 파괴합니다. 코어 직접 공격·효과 피해·전체공격 추가 대상에는 발동하지 않습니다.',
  sweep: '전체공격 · 적 캐릭터를 기본 공격할 때 같은 공격 피해를 적 전열 전체에 줍니다. 반격은 지정한 대상만 합니다.',
};

const KEYWORD_LABEL: Record<Keyword, string> = {
  guard: '수호',
  charge: '속공',
  lifesteal: '흡수',
  pierce: '관통',
  corestrike: '직격',
  execute: '처형',
  sweep: '전체공격',
};

const FILTERABLE_KEYWORDS: Keyword[] = ['guard', 'charge', 'pierce', 'corestrike', 'lifesteal', 'execute', 'sweep'];

function cardSeriesLabel(card: CardDefinition): string {
  if (card.seriesId && SERIES_BY_ID[card.seriesId]) return SERIES_BY_ID[card.seriesId].shortName;
  return card.series ?? '기타';
}

function summonEffectNeedsFriendlyTarget(card: CardDefinition | undefined): boolean {
  const effect = card?.onSummon;
  if (!card || !effect || /자신에게|자신의/.test(card.text ?? '')) return false;
  return effect.kind === 'buff_unit'
    || effect.kind === 'shield_unit'
    || effect.kind === 'heal_unit'
    || effect.kind === 'ready_unit';
}

function summonTargetEffectLabel(card: CardDefinition | undefined): string {
  const effect = card?.onSummon;
  if (!effect) return '등장 효과';
  if (effect.kind === 'shield_unit') return `보호막 ${effect.amount}`;
  if (effect.kind === 'buff_unit') return `ATK +${effect.attack} · DEF +${effect.health}`;
  if (effect.kind === 'heal_unit') return `체력 ${effect.amount} 회복`;
  if (effect.kind === 'ready_unit') return '즉시 공격 가능';
  return '등장 효과';
}

function displayEclipseAffinity(card: CardDefinition): EclipsePhase | undefined {
  return resolvedEclipseAffinity(card);
}

function displayEclipsePhaseModifiers(card: CardDefinition) {
  return resolvedEclipsePhaseModifiers(card);
}

const RARITY_PRESTIGE: Record<Rarity, string> = {
  common: '기본 전술',
  rare: '전문화 전술',
  epic: '핵심 전개',
  legendary: '결전급 카드',
};

const SERIES_PLAYSTYLE: Record<SeriesId, string> = {
  luminaknights: '동료를 빠르게 전개해 집결 조건을 채운 뒤, 연계 강화와 결전 효과로 한 번에 밀어붙이는 전대형 덱입니다.',
  kaisergear: '보호막을 전투 자원처럼 쌓고 에너지로 전환해, 단단한 기갑을 끊임없이 전개하는 요새형 덱입니다.',
  eclipsion: '묘지와 소멸 영역을 자원으로 바꾸며 회수·부활·공명 효과를 반복하는 순환형 덱입니다.',
  nocturne: '회복과 손패 조절로 상대의 템포를 늦추고, 바운스와 환영 효과로 유리한 교환을 만드는 컨트롤 덱입니다.',
  arborian: '필드에 뿌리를 내리듯 캐릭터를 늘리고 체력·토큰·재생을 누적해 장기전에서 압도하는 성장형 덱입니다.',
  tempest_drive: '속공과 에너지 회복을 연결해 한 턴에 여러 행동을 이어가며, 짧은 순간에 큰 압박을 만드는 템포 덱입니다.',
  abyss_reaper: '상대 묘지를 먹어 자원을 끊고, 묘지가 쌓일수록 처형·흡수·추가 피해가 강해지는 포식형 덱입니다.',
  primal_guardian: '수호 캐릭터와 토큰을 함께 세워 전선을 유지하고, 무리가 모일수록 전체 전투력이 커지는 결속형 덱입니다.',
  chronorium: '에너지를 앞당겨 쓰고 묘지의 카드를 되감아, 상대보다 한 템포 빠른 선택을 반복하는 시간 운영 덱입니다.',
  arcana_protocol: '주문을 연속 사용해 묘지에 마법 기록을 쌓고, 서치·회수·봉인으로 콤보를 완성하는 주문 연계 덱입니다.',
  beastforge: '보호막과 체력을 장갑처럼 활용하면서 공격력으로 전환해, 버티는 힘을 그대로 압박으로 바꾸는 기갑 야수 덱입니다.',
  phantom_carnival: '함정을 숨겨 상대의 행동을 유도한 뒤, 회수와 재설치로 같은 타이밍 싸움을 반복하는 심리전 덱입니다.',
  astral_armada: '여러 함선을 편대로 전개해 보호막과 에너지를 공유하고, 함대가 갖춰지면 포격으로 마무리하는 편대형 덱입니다.',
};

function effectDescription(effect: CardDefinition['effect'] | CardDefinition['onSummon'] | CardDefinition['trapEffect'], trigger?: CardDefinition['trapTrigger']): string {
  if (!effect) return '';
  if (effect.kind === 'damage_unit') return `선택한 적 캐릭터 하나에게 ${effect.amount}의 피해를 줍니다`;
  if (effect.kind === 'damage_core') return `상대 코어에 ${effect.amount}의 피해를 줍니다`;
  if (effect.kind === 'heal_core') return `내 코어를 ${effect.amount} 회복합니다`;
  if (effect.kind === 'draw') return `내 덱에서 카드 ${effect.amount}장을 뽑습니다`;
  if (effect.kind === 'buff_unit') return `선택한 아군 캐릭터 하나의 공격력을 +${effect.attack}, 체력을 +${effect.health} 강화합니다`;
  if (effect.kind === 'shield_unit') return `선택한 아군 캐릭터 하나에게 보호막 ${effect.amount}을 부여합니다`;
  if (effect.kind === 'aoe_enemy') return `상대 필드의 모든 캐릭터에게 각각 ${effect.amount}의 피해를 줍니다`;
  if (effect.kind === 'gain_energy') return `이번 턴에 사용할 수 있는 ENERGY를 ${effect.amount} 회복합니다`;
  if (effect.kind === 'increase_energy_max') return `이 대전 동안 내 보유 ENERGY 최대치와 최대 한도를 각각 +${effect.amount} 늘립니다. 현재 ENERGY는 회복하지 않으며 여러 번 사용하면 한도도 계속 누적됩니다`;
  if (effect.kind === 'destroy_weak') return `현재 체력이 ${effect.maxHealth} 이하인 적 캐릭터 하나를 파괴합니다`;
  if (effect.kind === 'summon_token') return `빈 필드에 ${effect.name} ${effect.attack}/${effect.health} 토큰 하나를 소환합니다`;
  if (effect.kind === 'steal_unit') return '상대 캐릭터 하나의 지배권을 가져옵니다. 강탈한 캐릭터는 보호막을 잃고 이번 턴에는 공격할 수 없습니다';
  if (effect.kind === 'revive_unit') return '내 묘지의 메인 덱 캐릭터 하나를 선택해 부활시킵니다. 등장 효과는 다시 발동하지 않으며 이번 턴에는 공격할 수 없습니다';
  if (effect.kind === 'mass_recall') return '양쪽 필드의 모든 캐릭터를 원래 영역으로 되돌립니다. 메인 덱 캐릭터는 손패, 엑스트라 캐릭터는 엑스트라 덱으로 돌아가며 토큰은 소멸합니다';
  if (effect.kind === 'invert_all_units') return '필드의 모든 캐릭터의 현재 공격력과 체력을 서로 맞바꿉니다';
  if (effect.kind === 'erase_opponent_grave') return `상대 묘지의 카드 중 최대 ${effect.amount}장을 무작위로 소멸시키고, 카드 ${effect.draw}장을 뽑습니다`;
  if (effect.kind === 'reweave_hand') return `내 남은 손패를 덱으로 되돌려 섞은 뒤, 되돌린 장수보다 ${effect.bonusDraw}장 더 많이 새로 뽑습니다`;
  if (effect.kind === 'mirror_unit') return '선택한 적 캐릭터의 현재 공격력과 체력을 복제한 거울 토큰을 내 필드에 소환합니다. 복제 토큰은 원본의 특수 효과를 얻지 않으며 이번 턴에는 공격할 수 없습니다';
  if (effect.kind === 'exchange_hands') return '나와 상대의 남은 손패를 서로 전부 교환합니다';
  if (effect.kind === 'ready_unit') return '이번 턴에 소환된 아군 캐릭터 하나를 즉시 공격 가능한 상태로 만듭니다';
  if (effect.kind === 'bounce_unit') return '선택한 캐릭터 하나를 원래 영역으로 되돌립니다. 토큰이라면 대신 소멸합니다';
  if (effect.kind === 'heal_unit') return `선택한 아군 캐릭터 하나의 체력을 ${effect.amount} 회복합니다`;
  if (effect.kind === 'sacrifice_draw') return `아군 캐릭터 하나를 묘지로 보내고 카드 ${effect.amount}장을 뽑습니다`;
  if (effect.kind === 'damage_draw_if_destroyed') return `적 캐릭터 하나에게 ${effect.amount}의 피해를 줍니다. 이 피해로 파괴했다면 카드 ${effect.draw}장을 추가로 뽑습니다`;
  if (effect.kind === 'recruit_unit') return `덱에서 비용 ${effect.maxCost} 이하의 캐릭터 하나를 찾아 필드에 전개합니다`;
  if (effect.kind === 'recover_grave_unit') return `내 묘지의 캐릭터 ${effect.amount}장을 손패로 되돌립니다`;
  if (effect.kind === 'draw_if_outnumbered') return `카드 ${effect.base}장을 뽑습니다. 내 필드의 캐릭터 수가 더 적다면 ${effect.bonus}장을 추가로 뽑습니다`;
  if (effect.kind === 'swap_stats') return '선택한 캐릭터 하나의 현재 공격력과 체력을 서로 맞바꿉니다';
  if (effect.kind === 'end_turn_next_energy') return `이 턴을 즉시 종료하고 다음 내 턴에 임시 ENERGY +${effect.amount}을 얻습니다`;
  if (effect.kind === 'tutor_card') return '내 덱에서 원하는 카드 1장을 선택해 손패에 넣습니다';
  if (effect.kind === 'tutor_series_card') return '내 덱에서 이 카드와 같은 시리즈의 원하는 카드 1장을 선택해 손패에 넣습니다';
  if (effect.kind === 'recover_any_grave') return '내 묘지에서 원하는 메인 덱 카드 1장을 선택해 손패로 되돌립니다';
  if (effect.kind === 'mill_draw') return `내 덱 위 카드 ${effect.mill}장을 묘지로 보내고 카드 ${effect.draw}장을 뽑습니다`;
  if (effect.kind === 'freeze_unit') return '선택한 적 캐릭터는 다음 자신의 턴에 공격할 수 없습니다';
  if (effect.kind === 'break_shield_damage') return `선택한 적 캐릭터의 보호막을 전부 제거하고 체력에 ${effect.amount} 피해를 줍니다`;
  if (effect.kind === 'banish_own_grave_energy') return `내 묘지의 메인 덱 카드 최대 ${effect.amount}장을 소멸시키고 이번 턴 ENERGY ${effect.energy} 회복`;
  if (effect.kind === 'discard_draw') return `내 남은 손패에서 최대 ${effect.discard}장을 묘지로 보내고 카드 ${effect.draw}장을 뽑습니다`;
  if (effect.kind === 'steal_energy') return `상대의 현재 ENERGY를 최대 ${effect.amount} 빼앗아 같은 만큼 내 ENERGY를 회복합니다`;
  if (effect.kind === 'shield_burst') return `아군 캐릭터 하나의 보호막을 전부 소모하고, 보호막 1당 상대 코어에 ${effect.multiplier} 피해를 줍니다. 최대 ${effect.cap} 피해`;
  if (effect.kind === 'heal_draw_if_behind') return `내 코어를 ${effect.heal} 회복하고, 사용 전 내 코어가 상대보다 낮았다면 카드 ${effect.draw}장을 추가로 뽑습니다`;
  if (effect.kind === 'recycle_grave_draw') return `내 묘지의 메인 덱 카드 최대 ${effect.amount}장을 덱에 다시 섞고 카드 ${effect.draw}장을 뽑습니다`;
  if (effect.kind === 'damage_by_hand') return `내 남은 손패 1장당 상대 코어에 ${effect.per} 피해를 줍니다. 최대 ${effect.cap} 피해`;
  if (effect.kind === 'damage_by_grave') return `내 묘지 카드 1장당 상대 코어에 ${effect.per} 피해를 줍니다. 최대 ${effect.cap} 피해`;
  if (effect.kind === 'buff_by_hand') return `선택한 아군 캐릭터를 내 손패 수에 따라 단계당 공격력 +${effect.attackPer}, 체력 +${effect.healthPer} 강화합니다. 최대 ${effect.cap}단계`;
  if (effect.kind === 'banish_enemy_grave') return `상대 묘지의 메인 덱 카드 최대 ${effect.amount}장을 무작위로 소멸시킵니다`;
  if (effect.kind === 'field_count_blast') return `내 필드 캐릭터 1체당 상대 코어에 ${effect.per} 피해를 줍니다. 최대 ${effect.cap} 피해`;
  if (effect.kind === 'mass_shield') return `내 필드의 모든 캐릭터에게 보호막 ${effect.amount}을 부여합니다`;
  if (effect.kind === 'mass_buff') return `내 필드의 모든 캐릭터를 공격력 +${effect.attack}, 체력 +${effect.health} 강화합니다`;
  if (effect.kind === 'type_rally') return `내 필드의 ${UNIT_TYPE_LABEL[effect.unitType]} 타입 캐릭터 전부 공격력 +${effect.attack}, 체력 +${effect.health}`;
  if (effect.kind === 'type_recruit') return `내 덱에서 ENERGY ${effect.maxCost} 이하 ${UNIT_TYPE_LABEL[effect.unitType]} 타입 캐릭터 1장을 무작위로 필드에 전개합니다`;
  if (effect.kind === 'reset_unit') return '선택한 캐릭터의 공격력과 체력을 카드에 적힌 원래 수치로 되돌리고 보호막을 제거합니다';
  if (effect.kind === 'phase_shift') return `ECLIPSE CYCLE 위상을 ${effect.steps >= 0 ? '앞으로' : '뒤로'} ${Math.abs(effect.steps)}칸 이동합니다`;
  if (effect.kind === 'phase_rewind') return `ECLIPSE CYCLE을 현재 순서의 한 칸 전이 아니라 실제 직전 시간대로 ${Math.max(1, effect.steps ?? 1)}회 되감습니다`;
  if (effect.kind === 'phase_set') return `ECLIPSE CYCLE을 즉시 ${ECLIPSE_PHASE_LABEL[effect.phase]} 위상으로 변경합니다`;
  if (effect.kind === 'phase_lock') return `ECLIPSE CYCLE의 턴 종료 자동 이동을 ${effect.turns}턴 동안 고정합니다`;
  if (effect.kind === 'phase_draw') return `${ECLIPSE_PHASE_LABEL[effect.phase]} 위상이면 카드 ${effect.base + effect.bonus}장, 아니면 ${effect.base}장 드로우합니다`;
  if (effect.kind === 'phase_damage_core') return `${ECLIPSE_PHASE_LABEL[effect.phase]} 위상이면 상대 코어에 ${effect.base + effect.bonus}, 아니면 ${effect.base} 피해를 줍니다`;
  if (effect.kind === 'phase_gain_energy') return `${ECLIPSE_PHASE_LABEL[effect.phase]} 위상이면 ENERGY ${effect.base + effect.bonus}, 아니면 ${effect.base} 회복합니다`;
  if (effect.kind === 'phase_heal_core') return `${ECLIPSE_PHASE_LABEL[effect.phase]} 위상이면 코어를 ${effect.base + effect.bonus}, 아니면 ${effect.base} 회복합니다`;
  if (effect.kind === 'phase_mass_buff') return `아군 전체 +${effect.attack}/+${effect.health}. ${ECLIPSE_PHASE_LABEL[effect.phase]} 위상이면 추가 +${effect.bonusAttack}/+${effect.bonusHealth}`;
  if (effect.kind === 'phase_mass_shield') return `아군 전체 보호막 ${effect.base}. ${ECLIPSE_PHASE_LABEL[effect.phase]} 위상이면 추가 +${effect.bonus}`;
  if (effect.kind === 'phase_aoe_enemy') return `상대 캐릭터 전체에 ${effect.base} 피해. ${ECLIPSE_PHASE_LABEL[effect.phase]} 위상이면 추가 +${effect.bonus}`;
  if (effect.kind === 'phase_recover_grave') return `묘지에서 ${effect.base}장 회수. ${ECLIPSE_PHASE_LABEL[effect.phase]} 위상이면 추가 ${effect.bonus}장 회수`;
  if (effect.kind === 'phase_summon_token') return `${effect.name} ${effect.attack}/${effect.health} 소환. ${ECLIPSE_PHASE_LABEL[effect.phase]} 위상이면 +${effect.bonusAttack}/+${effect.bonusHealth}`;
  if (effect.kind === 'negate') return '대응한 효과의 발동을 무효로 합니다';
  if (effect.kind === 'negate_and_damage') return trigger === 'direct_attack'
    ? `직접 공격을 무효로 하고, 공격한 캐릭터에게 ${effect.amount}의 피해를 줍니다`
    : `대응한 효과의 발동을 무효로 하고 상대 코어에 ${effect.amount}의 피해를 줍니다`;
  return '';
}

const ECLIPSE_UI_MATCH_BONUS: Record<EclipsePhase, { attack: number; health: number }> = {
  dawn: { attack: 1, health: 1 },
  zenith: { attack: 2, health: 0 },
  dusk: { attack: 0, health: 2 },
  midnight: { attack: 1, health: 1 },
  eclipse: { attack: 2, health: 1 },
};

const ECLIPSE_UI_META: Record<EclipsePhase, { glyph: string; bonus: string; atmosphere: string }> = {
  dawn: { glyph: '◒', bonus: 'ATK +1 · DEF +1', atmosphere: '여명의 빛' },
  zenith: { glyph: '☼', bonus: 'ATK +2', atmosphere: '정오의 태양' },
  dusk: { glyph: '◓', bonus: 'DEF +2', atmosphere: '황혼의 잔광' },
  midnight: { glyph: '☾', bonus: 'ATK +1 · DEF +1', atmosphere: '심야의 달빛' },
  eclipse: { glyph: '◉', bonus: 'ATK +2 · DEF +1', atmosphere: '개기일식 코로나' },
};

const ECLIPSE_ARENA_VISUAL: Record<EclipsePhase, { rgb: string; arena: string; atmosphere: string }> = {
  dawn: {
    rgb: '255,170,104',
    arena: 'linear-gradient(180deg,#14243d 0%,#25364f 44%,#6f4a53 70%,#351f2a 84%,#110d16 100%)',
    atmosphere: 'radial-gradient(circle at 18% 77%,rgba(255,250,216,.98) 0 2.1%,rgba(255,201,112,.84) 3.2%,rgba(255,132,79,.34) 8%,transparent 19%), radial-gradient(ellipse at 22% 84%,rgba(255,141,84,.34),transparent 38%), linear-gradient(180deg,rgba(23,46,80,.20),rgba(79,69,96,.11) 50%,rgba(226,111,72,.24) 80%,rgba(18,11,20,.18)), url(/ui/duel-arena.svg) center/cover no-repeat',
  },
  zenith: {
    rgb: '126,225,255',
    arena: 'linear-gradient(180deg,#174a62 0%,#123a50 46%,#0b283a 76%,#06151f 100%)',
    atmosphere: 'radial-gradient(circle at 53% 10%,rgba(255,255,235,.99) 0 2.4%,rgba(176,240,255,.72) 3.5%,rgba(97,207,241,.25) 9%,transparent 20%), radial-gradient(ellipse at 50% 30%,rgba(76,206,238,.18),transparent 45%), linear-gradient(180deg,rgba(71,194,225,.20),rgba(14,71,93,.10) 58%,rgba(4,24,35,.16)), url(/ui/duel-arena.svg) center/cover no-repeat',
  },
  dusk: {
    rgb: '239,112,145',
    arena: 'linear-gradient(180deg,#322241 0%,#59314f 43%,#8d4050 68%,#79372f 81%,#1d111c 100%)',
    atmosphere: 'radial-gradient(circle at 80% 78%,rgba(255,241,190,.98) 0 2%,rgba(255,165,84,.84) 3.2%,rgba(230,74,104,.35) 8%,transparent 19%), radial-gradient(ellipse at 77% 84%,rgba(231,83,106,.34),transparent 37%), linear-gradient(180deg,rgba(86,45,120,.18),rgba(151,57,95,.15) 52%,rgba(239,105,64,.23) 80%,rgba(26,12,22,.17)), url(/ui/duel-arena.svg) center/cover no-repeat',
  },
  midnight: {
    rgb: '116,151,255',
    arena: 'linear-gradient(180deg,#07152f 0%,#071126 48%,#050b1a 76%,#02050d 100%)',
    atmosphere: 'radial-gradient(circle at 82% 15%,rgba(244,250,255,.99) 0 2.8%,rgba(161,205,240,.48) 3.8%,rgba(78,128,204,.15) 9%,transparent 18%), radial-gradient(circle at 12% 20%,rgba(234,245,255,.82) 0 .8px,transparent 1.5px), radial-gradient(circle at 30% 32%,rgba(205,229,255,.72) 0 .8px,transparent 1.5px), radial-gradient(circle at 52% 17%,rgba(229,243,255,.76) 0 .8px,transparent 1.5px), radial-gradient(circle at 68% 39%,rgba(192,221,255,.68) 0 .8px,transparent 1.5px), radial-gradient(circle at 91% 48%,rgba(220,237,255,.70) 0 .8px,transparent 1.5px), linear-gradient(180deg,rgba(9,28,70,.24),rgba(7,15,42,.20) 60%,rgba(2,6,18,.18)), url(/ui/duel-arena.svg) center/cover no-repeat',
  },
  eclipse: {
    rgb: '255,204,100',
    arena: 'linear-gradient(180deg,#140d1d 0%,#0d0916 48%,#080710 76%,#030307 100%)',
    atmosphere: 'radial-gradient(circle at 50% 18%,#010104 0 5.1%,#07070a 5.5%,rgba(255,236,180,.99) 6.2%,rgba(255,165,69,.60) 7.4%,rgba(121,80,211,.19) 13%,transparent 23%), radial-gradient(circle at 50% 18%,rgba(255,198,96,.14),transparent 33%), radial-gradient(circle at 50% 35%,rgba(91,56,157,.17),transparent 47%), linear-gradient(180deg,rgba(25,14,40,.25),rgba(11,8,20,.22) 62%,rgba(3,3,7,.20)), url(/ui/duel-arena.svg) center/cover no-repeat',
  },
};

function clientCurrentEclipsePhase(state: MatchState): EclipsePhase {
  return state.eclipsePhase ?? 'dawn';
}

function clientEclipseSummonReady(state: MatchState, card: CardDefinition): boolean {
  return !card.eclipseSummonPhases?.length || card.eclipseSummonPhases.includes(clientCurrentEclipsePhase(state));
}

function eclipseSummonGateDescription(card: CardDefinition): string {
  if (!card.eclipseSummonPhases?.length) return '';
  return `시간대 전용 · ${card.eclipseSummonPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' · ')}에서만 소환 가능`;
}

function eclipseAffinityRule(card: CardDefinition): string {
  if (!isUnitCard(card)) return '';
  if (card.temporalImmunity) {
    return '【시간 고정】 이 캐릭터는 ECLIPSE CYCLE의 시간대 능력치 강화·약화 효과를 받지 않습니다.';
  }
  const parts: string[] = [];
  const authored = displayEclipsePhaseModifiers(card);
  if (authored) {
    const entries = ECLIPSE_PHASE_ORDER.flatMap((phase) => {
      const modifier = authored[phase];
      if (!modifier) return [];
      const attack = Math.trunc(modifier.attack ?? 0);
      const health = Math.trunc(modifier.health ?? 0);
      const stats = [
        attack !== 0 ? `ATK ${attack > 0 ? '+' : ''}${attack}` : '',
        health !== 0 ? `DEF ${health > 0 ? '+' : ''}${health}` : '',
      ].filter(Boolean).join(' · ') || '능력치 변화 없음';
      const polarity = attack < 0 || health < 0 ? '디버프' : attack > 0 || health > 0 ? '버프' : '중립';
      const showFinal = Boolean(card.temporalProfileName);
      const finalStats = showFinal
        ? ` → 최종 ${Math.max(0, (card.attack ?? 0) + attack)}/${Math.max(1, (card.health ?? 1) + health)}`
        : '';
      return [`${ECLIPSE_PHASE_LABEL[phase]} [${modifier.label ?? '시간 반응'}] ${stats}${finalStats} (${polarity})`];
    });
    if (entries.length) parts.push(`【시간 반응 · ${card.temporalProfileName ?? '개별 반응'}】 ${entries.join(' / ')}. 표기되지 않은 시간대는 중립.`);
  }

  if (card.eclipsePhasePulses?.length) {
    const pulses = card.eclipsePhasePulses.map((pulse) => `${ECLIPSE_PHASE_LABEL[pulse.phase]} [${pulse.name}] ${pulse.description}`);
    parts.push(`【시간 발동】 ${pulses.join(' / ')}`);
  }
  if (card.eclipseSetOnSummon) {
    parts.push(`【시각 조율】 등장 시 전장 시간을 ${ECLIPSE_PHASE_LABEL[card.eclipseSetOnSummon]}(으)로 변경.`);
  }
  return parts.join(' ');
}

function polishedCardText(card: CardDefinition, options?: { includeTime?: boolean }): string {
  const includeTime = options?.includeTime ?? false;
  let text = card.text
    .replace(/유닛/g, '캐릭터')
    .replace(/이번 턴 에너지/g, '이번 턴 ENERGY')
    .replace(/비용/g, 'ENERGY')
    .replace(/드로우/g, '카드 드로우')
    .trim();
  text = text
    .replace(/^전설 특수 소환\s*[·:]\s*/g, '【전설 특수 소환】 ')
    .replace(/^균열 소환:\s*/g, '【균열 소환】 ')
    .replace(/^공명 융합[.:]?\s*/g, '【공명 융합】 ')
    .replace(/^계승 진화[.:]?\s*/g, '【계승 진화】 ')
    .replace(/소환 시/g, '【등장】')
    .replace(/파괴될 때/g, '【파괴 시】')
    .replace(/공격할 때/g, '【공격 시】');
  const alreadyExplainsTime = /【(?:시간 (?:강화|취약|반응|친화|발동|고정)|시각 조율|기존 카드 재설계|극시공)/.test(text);
  const affinity = includeTime && !alreadyExplainsTime ? eclipseAffinityRule(card) : '';
  return [text, affinity].filter(Boolean).join(' ');
}

type TemporalReactionView = {
  phase: EclipsePhase;
  label: string;
  attack: number;
  health: number;
  polarity: 'buff' | 'debuff' | 'neutral';
};

function temporalReactionRows(card: CardDefinition): TemporalReactionView[] {
  if (!isUnitCard(card) || card.temporalImmunity) return [];
  const authored = displayEclipsePhaseModifiers(card);
  if (!authored) return [];
  return ECLIPSE_PHASE_ORDER.flatMap((phase) => {
    const modifier = authored[phase];
    if (!modifier) return [];
    const attack = Math.trunc(modifier.attack ?? 0);
    const health = Math.trunc(modifier.health ?? 0);
    const polarity: TemporalReactionView['polarity'] = attack < 0 || health < 0 ? 'debuff' : attack > 0 || health > 0 ? 'buff' : 'neutral';
    return [{ phase, label: modifier.label ?? '시간 반응', attack, health, polarity }];
  });
}

function temporalDeltaText(attack: number, health: number) {
  const parts = [
    attack !== 0 ? `ATK ${attack > 0 ? '+' : ''}${attack}` : '',
    health !== 0 ? `DEF ${health > 0 ? '+' : ''}${health}` : '',
  ].filter(Boolean);
  return parts.length ? parts.join(' · ') : '능력치 변화 없음';
}

function TemporalQuickHint({ card, currentPhase, compact = false }: { card: CardDefinition; currentPhase: EclipsePhase; compact?: boolean }) {
  const reactions = temporalReactionRows(card);
  const currentReaction = reactions.find((reaction) => reaction.phase === currentPhase) ?? null;
  const positivePhases = reactions.filter((reaction) => reaction.polarity === 'buff').map((reaction) => reaction.phase);
  const negativePhases = reactions.filter((reaction) => reaction.polarity === 'debuff').map((reaction) => reaction.phase);
  const neutralPhases = reactions.filter((reaction) => reaction.polarity === 'neutral').map((reaction) => reaction.phase);
  const pulsePhases = Array.from(new Set(card.eclipsePhasePulses?.map((pulse) => pulse.phase) ?? []));
  const activeRestrictions = [
    card.eclipseSummonPhases?.length ? { label: '소환', phases: card.eclipseSummonPhases } : null,
    card.eclipsePlayPhases?.length ? { label: '사용', phases: card.eclipsePlayPhases } : null,
    card.eclipseTriggerPhases?.length ? { label: '함정', phases: card.eclipseTriggerPhases } : null,
  ].filter((entry): entry is { label: string; phases: EclipsePhase[] } => Boolean(entry));
  const hasTemporalInfo = Boolean(card.temporalImmunity || reactions.length || activeRestrictions.length || card.eclipseSetOnSummon || card.eclipsePhasePulses?.length);
  if (!hasTemporalInfo) return null;

  const currentStateTone = card.temporalImmunity
    ? 'fixed'
    : currentReaction?.polarity === 'buff'
      ? 'buff'
      : currentReaction?.polarity === 'debuff'
        ? 'debuff'
        : 'neutral';
  const currentStateTitle = card.temporalImmunity
    ? '시간 보정 무시'
    : currentReaction?.polarity === 'buff'
      ? '지금 강세'
      : currentReaction?.polarity === 'debuff'
        ? '지금 약세'
        : '지금 중립';
  const currentStateCopy = card.temporalImmunity
    ? '어느 시간대에도 능력치 변화가 없습니다.'
    : currentReaction
      ? temporalDeltaText(currentReaction.attack, currentReaction.health)
      : '능력치 변화 없음';

  const phaseGroup = (label: string, phases: EclipsePhase[], tone: 'positive' | 'negative' | 'neutral' | 'gate' | 'pulse', keyBase = label) => {
    if (phases.length === 0) return null;
    return (
      <div className={`v38-temporal-row ${tone}`} key={`${card.id}-${keyBase}`}>
        <strong>{label}</strong>
        <div>
          {phases.map((phase) => (
            <span key={`${card.id}-${label}-${phase}`} className={`v38-temporal-phase-chip ${tone} ${phase} ${phase === currentPhase ? 'current' : ''}`}>{ECLIPSE_PHASE_LABEL[phase]}</span>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`v38-temporal-quick ${compact ? 'compact' : 'full'} tone-${currentStateTone}`}>
      <div className="v38-temporal-current">
        <span className={`v37-time-chip ${currentPhase}`}>{ECLIPSE_PHASE_LABEL[currentPhase]}</span>
        <div>
          <b>{currentStateTitle}</b>
          <small>{currentStateCopy}</small>
        </div>
      </div>

      <div className="v38-temporal-list">
        {phaseGroup('강세', positivePhases, 'positive')}
        {phaseGroup('약세', negativePhases, 'negative')}
        {phaseGroup('특수', pulsePhases, 'pulse')}
        {!compact && phaseGroup('중립', neutralPhases, 'neutral')}
        {activeRestrictions.map((restriction) => phaseGroup(`${restriction.label} 가능`, restriction.phases, 'gate', `gate-${restriction.label}`))}
      </div>

      {!compact && card.eclipseSetOnSummon && (
        <small className="v38-temporal-note">등장 시 전장 시간을 {ECLIPSE_PHASE_LABEL[card.eclipseSetOnSummon]}으로 변경</small>
      )}
      {!compact && card.eclipsePhasePulses?.length ? (
        <small className="v38-temporal-note">시간 발동 {card.eclipsePhasePulses.length}개 · 상세는 전체 상세에서 확인 가능</small>
      ) : null}
    </div>
  );
}


function TemporalHandBadge({ card, currentPhase }: { card: CardDefinition; currentPhase: EclipsePhase }) {
  const reactions = temporalReactionRows(card);
  const currentReaction = reactions.find((reaction) => reaction.phase === currentPhase) ?? null;
  const hasTemporalInfo = Boolean(card.temporalImmunity || reactions.length || card.eclipsePhasePulses?.length || card.eclipseSummonPhases?.length || card.eclipsePlayPhases?.length || card.eclipseTriggerPhases?.length);
  if (!hasTemporalInfo) return null;
  const tone = card.temporalImmunity ? 'fixed' : currentReaction?.polarity === 'buff' ? 'buff' : currentReaction?.polarity === 'debuff' ? 'debuff' : 'neutral';
  const label = card.temporalImmunity ? '고정' : currentReaction?.polarity === 'buff' ? '강세' : currentReaction?.polarity === 'debuff' ? '약세' : '중립';
  const delta = currentReaction ? temporalDeltaText(currentReaction.attack, currentReaction.health) : '';
  return (
    <span className={`v42-time-state-pill ${tone}`} title={`${ECLIPSE_PHASE_LABEL[currentPhase]} · ${label}${delta ? ` · ${delta}` : ''}`}>
      <i>{ECLIPSE_PHASE_LABEL[currentPhase]}</i><b>{label}</b>
    </span>
  );
}

function TemporalProfileContent({ card }: { card: CardDefinition }) {
  if (!isUnitCard(card) && !card.eclipseSummonPhases?.length && !card.eclipsePhasePulses?.length && !card.eclipsePlayPhases?.length && !card.eclipseTriggerPhases?.length && !card.eclipseLifespanPhases?.length && !card.eclipseVanishPhases?.length) {
    return <p className="v37-time-empty">시간대 능력치 반응 없음</p>;
  }

  const reactions = temporalReactionRows(card);
  const affinity = displayEclipseAffinity(card);

  return (
    <div className="v37-time-panel">
      {card.temporalImmunity ? (
        <article className="v37-time-card fixed">
          <header>
            <span className="v37-time-chip fixed">시간 고정</span>
            <b>시간대 보정 무시</b>
          </header>
          <p>ECLIPSE CYCLE이 바뀌어도 이 캐릭터는 ATK / DEF 강화·약화 효과를 받지 않습니다.</p>
        </article>
      ) : (
        <>
          <article className="v37-time-card summary">
            <header>
              <span className={`v37-time-chip ${affinity ?? 'neutral'}`}>{affinity ? ECLIPSE_PHASE_LABEL[affinity] : '기본'}</span>
              <b>{card.temporalProfileName ?? '기본 시간 반응'}</b>
            </header>
            <p>현재 전장 시간이 아래 시간대와 일치하면 해당 능력치 보정이 적용됩니다. 표기되지 않은 시간대는 중립입니다.</p>
          </article>
          {reactions.length > 0 ? (
            <div className="v37-time-grid">
              {reactions.map((reaction) => (
                <article className={`v37-time-card reaction ${reaction.polarity}`} key={`${card.id}-${reaction.phase}-${reaction.label}`}>
                  <header>
                    <span className={`v37-time-chip ${reaction.phase}`}>{ECLIPSE_PHASE_LABEL[reaction.phase]}</span>
                    <b>{reaction.label}</b>
                  </header>
                  <p>{temporalDeltaText(reaction.attack, reaction.health)}</p>
                </article>
              ))}
            </div>
          ) : (
            <p className="v37-time-empty">이 캐릭터는 시간대별 능력치 변화가 없습니다.</p>
          )}
        </>
      )}

      {card.eclipseSetOnSummon ? (
        <article className="v37-time-card trigger">
          <header>
            <span className="v37-time-chip trigger">등장 시</span>
            <b>시각 조율</b>
          </header>
          <p>이 캐릭터가 등장하면 전장 시간이 <strong>{ECLIPSE_PHASE_LABEL[card.eclipseSetOnSummon]}</strong>(으)로 즉시 변경됩니다.</p>
        </article>
      ) : null}

      {card.eclipsePhasePulses?.length ? (
        <div className="v37-time-grid pulses">
          {card.eclipsePhasePulses.map((pulse) => (
            <article className="v37-time-card pulse" key={`${card.id}-${pulse.phase}-${pulse.name}`}>
              <header>
                <span className={`v37-time-chip ${pulse.phase}`}>{ECLIPSE_PHASE_LABEL[pulse.phase]}</span>
                <b>{pulse.name}</b>
              </header>
              <p><RuleText text={pulse.description} compact /></p>
            </article>
          ))}
        </div>
      ) : null}

      {card.eclipseSummonPhases?.length ? (
        <small className="v37-time-note">TIME GATE · {card.eclipseSummonPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' · ')}에서만 소환 가능합니다.</small>
      ) : null}
      {card.eclipsePlayPhases?.length ? (
        <small className="v37-time-note">TIME CAST · {card.eclipsePlayPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' · ')}에서만 사용할 수 있습니다.</small>
      ) : null}
      {card.eclipseTriggerPhases?.length ? (
        <small className="v37-time-note">TIME TRAP · {card.eclipseTriggerPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' · ')}에서만 발동할 수 있습니다.</small>
      ) : null}
      {card.eclipseLifespanPhases?.length ? (
        <small className="v37-time-note">TIME LIFE · {card.eclipseLifespanPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' · ')}에서만 존재하며, 시간을 벗어나면 즉시 소멸합니다.</small>
      ) : null}
      {card.eclipseVanishPhases?.length ? (
        <small className="v37-time-note">TIME VANISH · {card.eclipseVanishPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' · ')} 도래 시 즉시 소멸합니다.</small>
      ) : null}
    </div>
  );
}

function RuleText({ text, compact = false }: { text: string; compact?: boolean }) {
  const source = text || '';
  const tokenPattern = /(【[^】]+】|ENERGY|코어|보호막|공격력|체력|수호|속공|흡수|관통|직격|공명 융합|계승 진화|균열 소환|전설 특수 소환|ECLIPSE CYCLE|TIME GATE|시간 친화|시간 강화|시간 취약|시간 반응|시간대 소환|시간역행|극시공|시간 폭발|기능 정지|\+\d+|−\d+|-\d+|\d+\/\d+|\d+장|\d+체|\d+의 피해|\d+ 피해|\d+ 회복)/g;
  return <span className={`v31l-rule-text ${compact ? 'compact' : ''}`}>{source.split(tokenPattern).filter(Boolean).map((part, index) => {
    const keyword = /^(【|수호$|속공$|흡수$|관통$|직격$|공명 융합$|계승 진화$|균열 소환$|전설 특수 소환$)/.test(part);
    const number = /^(\+|−|-)?\d|\d+장$|\d+체$/.test(part);
    const resource = /^(ENERGY|코어|보호막|공격력|체력)$/.test(part);
    return <span key={`${part}-${index}`} className={`v31l-rule-token ${keyword ? 'keyword' : number ? 'number' : resource ? 'resource' : ''} ${compact ? 'compact' : ''}`}>{part}</span>;
  })}</span>;
}

function splitAbilityCopy(text: string): { name: string; description: string } {
  const [name, ...rest] = text.split(' · ');
  return { name: name || '전술 효과', description: rest.join(' · ') || text };
}

function cardRoleSummary(card: CardDefinition): string {
  if (card.kind === 'fusion') return '엑스트라 · 공명 결전';
  if (card.kind === 'evolution') return '엑스트라 · 계승 결전';
  if (card.kind === 'trap') return card.trapEffect?.kind === 'negate' || card.trapEffect?.kind === 'negate_and_damage' ? '반응 · 카운터' : '반응 · 전장 제어';
  if (card.kind === 'spell' && card.effect) {
    if (['draw', 'recover_grave_unit', 'recover_any_grave', 'reweave_hand', 'draw_if_outnumbered', 'increase_energy_max', 'tutor_card', 'tutor_series_card', 'mill_draw', 'banish_own_grave_energy', 'discard_draw', 'steal_energy', 'heal_draw_if_behind', 'recycle_grave_draw', 'banish_enemy_grave', 'phase_draw', 'phase_gain_energy', 'phase_recover_grave', 'phase_set', 'phase_shift', 'phase_rewind', 'phase_lock'].includes(card.effect.kind)) return '주문 · 자원 순환';
    if (['damage_unit', 'damage_core', 'aoe_enemy', 'destroy_weak', 'damage_draw_if_destroyed', 'break_shield_damage', 'damage_by_hand', 'damage_by_grave', 'field_count_blast', 'shield_burst', 'reset_unit', 'phase_damage_core', 'phase_aoe_enemy'].includes(card.effect.kind)) return '주문 · 제압';
    if (['summon_token', 'recruit_unit', 'revive_unit', 'ready_unit', 'type_recruit', 'phase_summon_token'].includes(card.effect.kind)) return '주문 · 전개';
    if (['buff_unit', 'shield_unit', 'heal_unit', 'heal_core', 'buff_by_hand', 'mass_shield', 'mass_buff', 'type_rally', 'phase_heal_core', 'phase_mass_shield', 'phase_mass_buff'].includes(card.effect.kind)) return '주문 · 지원';
    return '주문 · 특수 전술';
  }
  if (card.keywords?.includes('guard')) return '캐릭터 · 방어 핵심';
  if (card.keywords?.includes('charge') || card.keywords?.includes('corestrike')) return '캐릭터 · 공격 전개';
  if (card.onSummon?.kind === 'draw' || card.onSummon?.kind === 'gain_energy') return '캐릭터 · 자원 전개';
  return '캐릭터 · 전장 전개';
}

function trapTriggerDescription(trigger: CardDefinition['trapTrigger']): string {
  const labels: Record<NonNullable<CardDefinition['trapTrigger']>, string> = {
    spell_played: '상대가 주문을 발동했을 때',
    unit_summoned: '상대가 유닛을 소환했을 때',
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
  let base = '';
  if (card.summonMode === 'rift') base = `${card.riftCondition?.label ?? '균열 조건'} · ENERGY ${card.riftCost ?? card.cost}`;
  else if (card.summonMode === 'legendary') base = `${card.legendarySummonRule?.name ?? '전설 강림'} · ${card.legendarySummonRule?.label ?? '전설 특수 소환 조건 확인'} · ENERGY ${card.cost}`;
  else if (card.kind === 'fusion') {
    const recipe = card.fusionRecipe?.label ?? '지정 소재 조합';
    const extra = card.extraSummonRule ? extraSummonRuleDescription(card) : '';
    base = [recipe, extra].filter(Boolean).join(' · ');
  } else if (card.kind === 'evolution') {
    const sources = (card.evolutionRecipe?.fromIds ?? []).map((id) => CARD_BY_ID[id]).filter((source): source is CardDefinition => Boolean(source));
    if (sources.length > 0) {
      const rounds = Math.max(1, Math.ceil(Math.max(...sources.map((source) => clientEvolutionRequiredTurnGap(source, card))) / 2));
      const sourceName = sources.length === 1 ? sources[0].name : (card.evolutionRecipe?.label ?? '지정 원본').replace(/\s*계승$/, '');
      const sourceCopies = card.extraSummonRule?.requiredSourceCopies ?? 1;
      const sourceText = sourceCopies > 1 ? `${sourceName} ${sourceCopies}체 · ROUND ${rounds} 이후` : `${sourceName} · ROUND ${rounds} 이후`;
      const extra = card.extraSummonRule ? extraSummonRuleDescription(card) : '';
      const cleanedExtra = sourceCopies > 1 ? extra.replace(/^계승 원본 \d+체(?: · )?/, '') : extra;
      base = [sourceText, cleanedExtra].filter(Boolean).join(' · ');
    } else {
      base = `${card.evolutionRecipe?.label ?? '조건 유닛'} · ROUND 2 이후`;
    }
  }
  return [eclipseSummonGateDescription(card), base].filter(Boolean).join(' · ');
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
      className={`tcg-card kind-${card.kind} summon-${card.summonMode ?? 'normal'} rarity-${card.rarity} element-${card.element} ${Array.from(card.name).length >= 7 ? 'name-long' : ''} ${compact ? 'compact' : ''} ${selected ? 'selected' : ''} ${disabled ? 'is-disabled' : ''}`}
      style={cardStyle(card)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={() => activateCard()}
      onKeyDown={activateCard}
      aria-disabled={disabled}
      aria-label={onClick ? `${card.name} 선택` : `${card.name} 상세 보기`}
      title={onClick ? `${card.name} 선택` : `${card.name} 상세 보기`}
    >
      <span className="v32-card-finish" aria-hidden="true" />
      <span className="card-cost">{card.cost}</span>
      {card.summonMode === 'rift' && <span className="summon-badge rift">균열</span>}
      {card.summonMode === 'legendary' && <span className="summon-badge legendary">강림</span>}
      {card.kind === 'fusion' && <span className="summon-badge fusion">융합</span>}
      {card.kind === 'evolution' && <span className="summon-badge evolution">진화</span>}
      {isUnitCard(card) && (card.keywords?.includes('charge') || card.keywords?.includes('guard') || card.keywords?.includes('corestrike') || card.keywords?.includes('pierce') || card.keywords?.includes('lifesteal') || card.keywords?.includes('execute') || card.keywords?.includes('sweep')) && (
        <span className="v30-card-traits" aria-label="전투 특성">
          {card.keywords?.includes('charge') && <i className="charge">속공</i>}
          {card.keywords?.includes('guard') && <i className="guard">수호</i>}
          {card.keywords?.includes('corestrike') && <i className="corestrike">직격</i>}
          {card.keywords?.includes('pierce') && <i className="pierce">관통</i>}
          {card.keywords?.includes('lifesteal') && <i className="lifesteal">흡수</i>}
          {card.keywords?.includes('execute') && <i className="execute">처형</i>}
          {card.keywords?.includes('sweep') && <i className="sweep">전체공격</i>}
        </span>
      )}
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
    card.onSummon ? { label: '등장 효과', value: effectDescription(card.onSummon) } : null,
    card.effect ? { label: '효과 처리', value: effectDescription(card.effect) } : null,
    card.trapTrigger ? { label: '반응 조건', value: trapTriggerDescription(card.trapTrigger) } : null,
    card.trapEffect ? { label: '반응 결과', value: effectDescription(card.trapEffect, card.trapTrigger) } : null,
  ].filter((row): row is { label: string; value: string } => Boolean(row?.value));

  const summonLabel = card.kind === 'fusion'
    ? '공명 융합'
    : card.kind === 'evolution'
      ? '계승 진화'
      : card.summonMode === 'rift'
        ? '균열 소환'
        : card.summonMode === 'legendary'
          ? '전설 특수 소환'
          : '일반 소환';

  return (
    <div className="modal-layer card-detail-layer" role="presentation" onPointerDown={(event: React.PointerEvent) => { if (event.currentTarget === event.target) onClose(); }}>
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
          <header className="v31l-detail-header">
            <div>
              <span className="v31l-detail-kicker">{RARITY_LABEL[card.rarity]} · {ELEMENT_LABEL[card.element]} · {KIND_LABEL[card.kind]}{card.series ? ` · ${card.series}` : ''}</span>
              <h2 id="card-detail-title">{card.name}</h2>
              <p>{card.subtitle}</p>
              <div className="v31l-card-classification"><i>{RARITY_PRESTIGE[card.rarity]}</i><i>{cardRoleSummary(card)}</i>{card.unitType && <i>TYPE · {UNIT_TYPE_LABEL[card.unitType]}</i>}{card.comboTag && <i>COMBO · {card.comboTag}</i>}{displayEclipseAffinity(card) && <i className="v34-cycle-chip">CYCLE · {ECLIPSE_PHASE_LABEL[displayEclipseAffinity(card)!]}</i>}{card.temporalProfileName && <i className="v34f-temporal-chip">TIME · {card.temporalProfileName}</i>}{card.eclipsePhasePulses?.length ? <i className="v34f-temporal-chip">TIME TRIGGER · {card.eclipsePhasePulses.length}</i> : null}{card.eclipseSummonPhases?.length ? <i className="v34-time-gate-chip">TIME GATE · {card.eclipseSummonPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' / ')}</i> : null}{card.eclipsePlayPhases?.length ? <i className="v34-time-gate-chip">TIME CAST · {card.eclipsePlayPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' / ')}</i> : null}{card.eclipseTriggerPhases?.length ? <i className="v34-time-gate-chip">TIME TRAP · {card.eclipseTriggerPhases.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' / ')}</i> : null}{card.eclipseLifespanPhases?.length ? <i className="v34-time-gate-chip">TIME LIFE</i> : null}{card.eclipseVanishPhases?.length ? <i className="v34-time-gate-chip">TIME VANISH</i> : null}{card.seriesId && <i>{SERIES_BY_ID[card.seriesId].shortName}</i>}{(card.rarity === 'legendary' || card.rarity === 'epic') && <i className="v32-collector-tag">COLLECTOR FINISH</i>}</div>
            </div>
            <strong className="detail-cost"><small>ENERGY</small>{card.cost}</strong>
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
              <span><small>대상</small><b>{card.target === 'enemy_unit' ? '적 유닛' : card.target === 'friendly_unit' ? '아군 유닛' : card.target === 'friendly_graveyard_unit' ? '내 묘지 유닛' : card.target === 'friendly_graveyard_card' ? '내 묘지 카드' : card.target === 'own_deck_card' ? '내 덱 카드' : card.target === 'enemy_core' ? '상대 코어' : '자동 적용'}</b></span>
            </div>
          )}

          <section className="detail-section primary-effect v31l-primary-effect" id="card-detail-effect">
            <span>ABILITY · 카드 효과</span>
            <p><RuleText text={polishedCardText(card, { includeTime: false })} /></p>
          </section>

          {(isUnitCard(card) || card.eclipseSummonPhases?.length || card.eclipsePhasePulses?.length || card.eclipsePlayPhases?.length || card.eclipseTriggerPhases?.length || card.eclipseLifespanPhases?.length || card.eclipseVanishPhases?.length) && (
            <section className="detail-section v34e-time-profile">
              <span>TIME PROFILE · {card.temporalImmunity ? '시간 고정' : card.temporalProfileName ?? '기본 시간 반응'}</span>
              <TemporalProfileContent card={card} />
            </section>
          )}

          {card.comboTag && (
            <section className="detail-section v25-series-effect">
              <span>MINI COMBO · 독립 상호작용</span>
              <p><strong>{card.comboTag}</strong> · 정식 시리즈가 아닌 소규모 콤보 묶음입니다. 같은 콤보명 또는 같은 유닛 타입의 카드와 자유롭게 섞어 사용할 수 있습니다.</p>
            </section>
          )}

          {card.extraChoices?.length && (
            <section className="detail-section v31f-choose-detail">
              <span>CHOOSE · 소환 시 원하는 효과 1개 선택</span>
              <div>{card.extraChoices.map((choice, index) => <article key={choice.id}><b>{index + 1}</b><span><strong>{choice.label}</strong><small><RuleText text={choice.description} /></small></span></article>)}</div>
            </section>
          )}

          {card.seriesId && card.seriesAbility && (
            <section className={`detail-section v25-series-effect series-${card.seriesId}`}>
              <span>SYNERGY · {SERIES_BY_ID[card.seriesId].shortName}</span>
              <p><RuleText text={seriesAbilityDescription(card)} /></p>
            </section>
          )}

          {card.seriesId && card.seriesSignature && (
            <section className={`detail-section v31h-series-signature series-${card.seriesId}`}>
              <span>SIGNATURE · 시리즈 고유 효과</span>
              {(() => { const copy = splitAbilityCopy(seriesSignatureDescription(card)); return <p className="v31l-ability-copy"><b>{copy.name}</b><RuleText text={copy.description} /></p>; })()}
            </section>
          )}

          {card.seriesId && (
            <section className="detail-section v25-series-profile">
              <span>DECK PLAN · 시리즈 운영</span>
              <p>{SERIES_PLAYSTYLE[card.seriesId]}</p>
            </section>
          )}

          {tacticalAbilityDescription(card) && (
            <section className="detail-section v30-tactical-effect">
              <span>PASSIVE · 전술 패시브</span>
              {(() => { const copy = splitAbilityCopy(tacticalAbilityDescription(card)); return <p className="v31l-ability-copy"><b>{copy.name}</b><RuleText text={copy.description} /></p>; })()}
            </section>
          )}

          {summonCondition && (
            <section className="detail-section summon-condition">
              <span>SUMMON · 소환 조건</span>
              <p><RuleText text={summonCondition} /></p>
            </section>
          )}

          <section className="detail-section detail-lore">
            <span>ARCHIVE · 카드 기록</span>
            <p>{card.flavor}</p>
          </section>

          {card.keywords && card.keywords.length > 0 && (
            <section className="detail-section">
              <span>KEYWORDS · 전투 특성</span>
              <div className="keyword-list">{card.keywords.map((keyword) => <p key={keyword}><b>{KEYWORD_DESCRIPTION[keyword].split(' · ')[0]}</b><span>{KEYWORD_DESCRIPTION[keyword].split(' · ')[1]}</span></p>)}</div>
            </section>
          )}

          {effectRows.length > 0 && (
            <section className="detail-effect-grid">
              {effectRows.map((row) => <div key={row.label}><small>{row.label}</small><b><RuleText text={row.value} /></b></div>)}
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
    <div className="modal-layer v20-guide-layer" role="presentation" onPointerDown={(event: React.PointerEvent) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="v20-guide-modal" role="dialog" aria-modal="true" aria-labelledby="v20-guide-title">
        <header><div><span>FIELD MANUAL</span><h2 id="v20-guide-title">ECLIPSE DUEL 룰 가이드</h2><p>첫 결투 전에 핵심 규칙만 빠르게 확인할 수 있습니다.</p></div><button ref={closeButtonRef} className="modal-close" type="button" onClick={onClose} aria-label="룰 가이드 닫기">×</button></header>
        <div className="v20-guide-grid">
          <article><b>01 · 승리 조건</b><p>상대 코어 {CORE_MAX}를 0으로 만들면 승리합니다. 덱을 더 이상 뽑을 수 없는 상황도 패배로 처리됩니다.</p></article>
          <article><b>02 · 턴 흐름</b><p>메인 단계에서 소환·주문·함정을 준비하고, 배틀 단계에서 공격합니다. 각 턴은 {TURN_DURATION_SECONDS}초 안에 결정해야 합니다.</p></article>
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
  canRecoverAccounts,
  onClose,
  onToggleSound,
  onVolumeChange,
  onOpenGuide,
  onOpenProfile,
  onOpenPasswordChange,
  onOpenAccountRecovery,
  onSignOut,
}: {
  open: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  canRecoverAccounts: boolean;
  onClose: () => void;
  onToggleSound: () => void;
  onVolumeChange: (volume: number) => void;
  onOpenGuide: () => void;
  onOpenProfile: () => void;
  onOpenPasswordChange: () => void;
  onOpenAccountRecovery: () => void;
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
    <div className="v22-control-layer" role="presentation" onPointerDown={(event: React.PointerEvent) => { if (event.currentTarget === event.target) onClose(); }}>
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
          <button type="button" onClick={onOpenPasswordChange}><span>⌁</span><div><b>내 비밀번호 변경</b><small>로그인 비밀번호를 새 값으로 교체</small></div></button>
          {canRecoverAccounts && <button className="v32r-admin-entry" type="button" onClick={onOpenAccountRecovery}><span>◆</span><div><b>유저 비밀번호 복구</b><small>제작자 전용 · 다른 기능은 일반 유저와 동일</small></div></button>}
        </section>
        <footer><span>ECLIPSE DUEL · COMMERCIAL BUILD v26</span><button type="button" onClick={onSignOut}>로그아웃</button></footer>
      </aside>
    </div>
  );
}

function PasswordChangeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) return;
    setPassword('');
    setConfirmPassword('');
    setMessage('');
  }, [open]);

  if (!open) return null;

  async function save(event: FormEvent) {
    event.preventDefault();
    if (password.length < 6) return setMessage('새 비밀번호는 6자 이상 입력하세요.');
    if (password !== confirmPassword) return setMessage('비밀번호 확인 값이 서로 다릅니다.');
    setBusy(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setPassword('');
      setConfirmPassword('');
      setMessage('비밀번호가 변경되었습니다. 다음 로그인부터 새 비밀번호를 사용하세요.');
    } catch (error) {
      setMessage(friendlyAuthMessage(error instanceof Error ? error.message : '비밀번호 변경에 실패했습니다.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="v32r-security-layer" role="presentation" onPointerDown={(event: React.PointerEvent) => { if (event.currentTarget === event.target) onClose(); }}>
      <form className="v32r-security-panel compact" role="dialog" aria-modal="true" aria-label="비밀번호 변경" onSubmit={save}>
        <header><div><span>ACCOUNT SECURITY</span><h3>내 비밀번호 변경</h3><p>현재 로그인된 계정의 비밀번호를 새 값으로 바꿉니다.</p></div><button type="button" onClick={onClose} aria-label="닫기">×</button></header>
        <label><span>새 비밀번호</span><input type="password" value={password} onChange={(event: ChangeEvent<HTMLInputElement>) => setPassword(event.target.value)} minLength={6} autoComplete="new-password" placeholder="6자 이상" /></label>
        <label><span>새 비밀번호 확인</span><input type="password" value={confirmPassword} onChange={(event: ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)} minLength={6} autoComplete="new-password" placeholder="한 번 더 입력" /></label>
        {message && <p className="v32r-security-message" role="status">{message}</p>}
        <div className="v32r-security-buttons"><button type="button" onClick={onClose}>취소</button><button className="primary-button" type="submit" disabled={busy}>{busy ? '변경 중...' : '비밀번호 변경'}</button></div>
      </form>
    </div>
  );
}

function AccountRecoveryModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [accounts, setAccounts] = useState<AdminAccountSummary[]>([]);
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<AdminAccountSummary | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetting, setResetting] = useState('');
  const [issued, setIssued] = useState<{ account: AdminAccountSummary; password: string } | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setAccounts([]);
    setSelected(null);
    setTemporaryPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setIssued(null);
    setMessage('');
  }, [open]);

  if (!open) return null;

  async function search(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setSelected(null);
    setIssued(null);
    setTemporaryPassword('');
    setConfirmPassword('');
    setMessage('');
    try {
      const result = await api('admin_find_accounts', { query });
      const found = result.accounts ?? [];
      setAccounts(found);
      if (!found.length) setMessage('일치하는 계정을 찾지 못했습니다. 이메일, 플레이어 코드 또는 닉네임을 다시 확인하세요.');
    } catch (error) {
      setAccounts([]);
      setMessage(error instanceof Error ? error.message : '계정 검색에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  function chooseAccount(account: AdminAccountSummary) {
    setSelected(account);
    setTemporaryPassword('');
    setConfirmPassword('');
    setIssued(null);
    setMessage('');
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault();
    if (!selected) return setMessage('비밀번호를 변경할 유저를 먼저 선택하세요.');
    if (temporaryPassword.length < 6) return setMessage('직접 지정할 임시 비밀번호를 6자 이상 입력하세요.');
    if (temporaryPassword.length > 72) return setMessage('임시 비밀번호는 72자 이하로 입력하세요.');
    if (temporaryPassword !== confirmPassword) return setMessage('임시 비밀번호 확인 값이 서로 다릅니다.');
    const ok = window.confirm(`${selected.displayName} (${selected.playerCode}) 계정의 비밀번호를 지금 입력한 값으로 변경할까요? 기존 비밀번호는 즉시 사용할 수 없게 됩니다.`);
    if (!ok) return;

    setResetting(selected.userId);
    setIssued(null);
    setMessage('');
    try {
      const chosenPassword = temporaryPassword;
      const result = await api('admin_reset_password', { userId: selected.userId, temporaryPassword: chosenPassword });
      if (!result.account) throw new Error('비밀번호 변경 결과를 확인하지 못했습니다.');
      setIssued({ account: result.account, password: chosenPassword });
      setTemporaryPassword('');
      setConfirmPassword('');
      setMessage(`${result.account.displayName} 계정의 임시 비밀번호를 제작자가 지정한 값으로 변경했습니다.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '비밀번호 재설정에 실패했습니다.');
    } finally {
      setResetting('');
    }
  }

  async function copyTemporaryPassword() {
    if (!issued) return;
    try {
      await navigator.clipboard.writeText(issued.password);
      setMessage('지정한 임시 비밀번호를 클립보드에 복사했습니다.');
    } catch {
      setMessage('자동 복사가 되지 않았습니다. 화면의 임시 비밀번호를 직접 복사해 주세요.');
    }
  }

  return (
    <div className="v32r-security-layer" role="presentation" onPointerDown={(event: React.PointerEvent) => { if (event.currentTarget === event.target) onClose(); }}>
      <section className="v32r-security-panel admin" role="dialog" aria-modal="true" aria-label="제작자 계정 복구">
        <header><div><span>CREATOR RECOVERY</span><h3>유저 계정 복구</h3><p>유저를 선택한 뒤 제작자가 직접 임시 비밀번호를 입력해서 지정합니다.</p></div><button type="button" onClick={onClose} aria-label="닫기">×</button></header>
        <div className="v32r-security-warning"><b>중요</b><span>현재 비밀번호 원문을 조회하는 기능은 아닙니다. 아래에서 제작자가 직접 새 비밀번호를 정하면 기존 비밀번호는 즉시 사용할 수 없게 됩니다.</span></div>
        <form className="v32r-account-search" onSubmit={search}><input value={query} onChange={(event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)} placeholder="이메일 / ED-플레이어코드 / 닉네임" minLength={2} /><button className="primary-button" type="submit" disabled={busy}>{busy ? '검색 중...' : '계정 검색'}</button></form>
        <div className="v32r-account-results">
          {accounts.map((account) => <article key={account.userId} className={selected?.userId === account.userId ? 'selected' : ''}><div><b>{account.displayName}</b><span>{account.playerCode}</span><small>{account.email || '이메일 없음'}</small></div><button type="button" onClick={() => chooseAccount(account)}>{selected?.userId === account.userId ? '선택됨' : '비밀번호 지정'}</button></article>)}
        </div>

        {selected && <form className="v32u-manual-reset" onSubmit={resetPassword}>
          <div className="v32u-manual-reset-title"><span>PASSWORD SET</span><b>{selected.displayName}</b><small>{selected.playerCode} · {selected.email || '이메일 없음'}</small></div>
          <label><span>내가 지정할 임시 비밀번호</span><div className="v32u-password-row"><input type={showPassword ? 'text' : 'password'} value={temporaryPassword} onChange={(event: ChangeEvent<HTMLInputElement>) => setTemporaryPassword(event.target.value)} minLength={6} maxLength={72} autoComplete="new-password" placeholder="6자 이상 직접 입력" /><button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? '숨기기' : '보기'}</button></div></label>
          <label><span>임시 비밀번호 확인</span><input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event: ChangeEvent<HTMLInputElement>) => setConfirmPassword(event.target.value)} minLength={6} maxLength={72} autoComplete="new-password" placeholder="같은 비밀번호 한 번 더 입력" /></label>
          <button className="primary-button v32u-apply-password" type="submit" disabled={resetting === selected.userId || !temporaryPassword || !confirmPassword}>{resetting === selected.userId ? '변경 중...' : '이 비밀번호로 변경'}</button>
        </form>}

        {issued && <div className="v32r-issued-password"><div><span>변경 완료 · {issued.account.displayName}</span><b>{issued.password}</b><small>위 비밀번호는 서버가 만든 값이 아니라 제작자가 직접 입력한 값입니다. 유저에게 전달한 뒤 필요하면 SYSTEM → 내 비밀번호 변경에서 다시 바꾸게 해주세요.</small></div><button type="button" onClick={copyTemporaryPassword}>복사</button></div>}
        {message && <p className="v32r-security-message" role="status">{message}</p>}
        <footer><span>비밀번호는 서버 로그에 기록하지 않으며, 제작자가 입력한 값으로만 재설정합니다.</span><button type="button" onClick={onClose}>닫기</button></footer>
      </section>
    </div>
  );
}

function Avatar({ id, size = 'medium' }: { id?: string; size?: 'small' | 'medium' | 'large' }) {
  const resolvedId = id || 'eclipse';
  const cosmeticIcon = EMBLEM_BY_ID[resolvedId];
  return (
    <span
      className={`avatar avatar-${resolvedId} avatar-${size}${cosmeticIcon ? ' avatar-cosmetic' : ''}`}
      style={cosmeticIcon ? ({ '--avatar-accent': cosmeticIcon.accent } as CSSProperties) : undefined}
      title={cosmeticIcon?.name}
    >
      <span>{cosmeticIcon?.glyph ?? resolvedId.slice(0, 1).toUpperCase()}</span>
    </span>
  );
}

function LoadingScreen({ text = '결투장을 준비하는 중' }: { text?: string }) {
  return (
    <main className="loading-screen" aria-busy="true" aria-live="polite">
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
          <p>45장 메인 덱과 6장 엑스트라 덱. 균열·공명·계승의 세 소환 체계로 나만의 승리 루트를 완성합니다.</p>
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
        <footer><span>COMMERCIAL QUALITY PASS · PRE-RELEASE</span><span>ORIGINAL IP</span></footer>
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
          <p>45장 메인 덱과 6장 엑스트라 덱. 13개 시리즈의 고유 전술과 균열 소환, 공명 융합, 계승 진화를 조합해 나만의 승리 루트를 설계하는 온라인 전략 TCG.</p>
          <div className="v19-hero-actions">
            <button className="v19-play-button" onClick={() => onNavigate('duel')}>
              <span className="v19-action-icon"><GameIcon name="duel" /></span>
              <span><b>결투 시작</b><small>빠른 대전 · 비공개 방 · 코인 내기</small></span>
              <em>PLAY</em>
            </button>
            <button className="v19-sub-action" onClick={() => onNavigate('deck')}><GameIcon name="deck" /><span><b>덱 스튜디오</b><small>시리즈 설계 · 자동 구성 · 세부 조정</small></span></button>
            <button className="v19-sub-action" onClick={() => onNavigate('shop')}><GameIcon name="shop" /><span><b>이클립스 마켓</b><small>카드팩 · 프로필 · 프레임 컬렉션</small></span></button>
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
          <div><small>MATCH</small><h3>빠른 대전</h3><p>활성 덱으로 대기열에 참가해 실시간 상대와 즉시 결투합니다.</p></div><span className="v19-mode-arrow">›</span>
        </article>
        <article className="v19-mode-card" onClick={() => onNavigate('duel')}>
          <div className="v19-mode-icon"><span>+</span></div>
          <div><small>PRIVATE</small><h3>친구와 대전</h3><p>방 코드를 공유해 친구와 규칙을 정하고 결투합니다.</p></div><span className="v19-mode-arrow">›</span>
        </article>
        <article className="v19-mode-card" onClick={() => onNavigate('collection')}>
          <div className="v19-mode-icon"><GameIcon name="collection" /></div>
          <div><small>COLLECTION</small><h3>카드 보관함</h3><p>{hub.collection.length}종 보유 · 효과와 소환 조건 확인</p></div><span className="v19-mode-arrow">›</span>
        </article>

        <article className="v19-social-card">
          <header><div><small>SOCIAL</small><h3>친구</h3></div><button onClick={() => onNavigate('friends')}>전체 보기</button></header>
          <div className="v19-friend-grid">
            {friends.length > 0 ? friends.map((friend) => (
              <button key={friend.user_id} className={`v31-social-skin theme-${friend.profile_theme ?? 'bg_default'} frame-${friend.profile_frame ?? 'frame_default'}`} onClick={() => onNavigate('friends')}><ProfileFrameFX frameId={friend.profile_frame} /><Avatar id={friend.avatar} size="small" /><span><b><NicknameText name={friend.display_name} styleId={friend.nickname_style} /></b><small>LV.{levelFromXp(friend.xp)} · {friend.wins}승</small></span><i /></button>
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
  const [deckZone, setDeckZone] = useState<'main' | 'extra'>('main');
  const [kind, setKind] = useState<'all' | CardKind>('all');
  const [element, setElement] = useState<'all' | Element>('all');
  const [seriesFilter, setSeriesFilter] = useState<'all' | SeriesId>('all');
  const [unitTypeFilter, setUnitTypeFilter] = useState<'all' | UnitType>('all');
  const [keywordFilter, setKeywordFilter] = useState<'all' | Keyword>('all');
  const [rarityFilter, setRarityFilter] = useState<'all' | Rarity>('all');
  const [costFilter, setCostFilter] = useState<'all' | '0-1' | '2' | '3' | '4' | '5' | '6' | '7+'>('all');
  const [sort, setSort] = useState<'recommended' | 'cost' | 'rarity' | 'name'>('recommended');
  const [autoStyle, setAutoStyle] = useState<'balanced' | 'aggro' | 'control' | 'theme'>('balanced');
  const [autoSeries, setAutoSeries] = useState<'all' | SeriesId>('all');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const collection = useMemo(() => Object.fromEntries(hub.collection.map((row) => [row.card_id, row.quantity])), [hub.collection]);
  const mainCounts = useMemo(() => countCards(deckCards), [deckCards]);
  const mainSeriesCounts = useMemo(() => {
    const counts: Partial<Record<SeriesId, number>> = {};
    for (const cardId of deckCards) {
      const seriesId = CARD_BY_ID[cardId]?.seriesId;
      if (!seriesId) continue;
      counts[seriesId] = (counts[seriesId] ?? 0) + 1;
    }
    return counts;
  }, [deckCards]);
  const extraCounts = useMemo(() => countCards(extraCards), [extraCards]);
  const selectedDeck = hub.decks.find((deck) => deck.id === selectedDeckId);
  const mainValidation = validateDeck(deckCards, collection);
  const extraValidation = validateExtraDeck(extraCards, collection);
  const validation = mainValidation || extraValidation;

  useEffect(() => {
    // Load a deck only when the user actually switches deck slots.
    // `hub` can refresh for social/realtime updates while this screen is open;
    // depending on the whole selectedDeck object made those background refreshes
    // overwrite unsaved MAIN/EXTRA edits and made EXTRA removal look broken.
    const deckToLoad = hub.decks.find((deck) => deck.id === selectedDeckId);
    if (!deckToLoad) {
      setDeckName('새 덱');
      setDeckCards([]);
      setExtraCards([]);
      return;
    }
    setDeckName(deckToLoad.name);
    setDeckCards(Array.isArray(deckToLoad.cards) ? deckToLoad.cards : []);
    setExtraCards(Array.isArray(deckToLoad.extra_cards) ? deckToLoad.extra_cards : []);
    // Intentionally keyed to selectedDeckId: background hub refreshes must not
    // destroy the local editing session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeckId]);

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

  useEffect(() => {
    if (deckZone === 'main' && (kind === 'fusion' || kind === 'evolution')) setKind('all');
    if (deckZone === 'extra' && kind !== 'all' && kind !== 'fusion' && kind !== 'evolution') setKind('all');
  }, [deckZone, kind]);

  const filtered = useMemo(() => CARDS.filter((card) => {
    if (!collection[card.id]) return false;
    if (deckZone === 'main' && isExtraDeckCard(card)) return false;
    if (deckZone === 'extra' && !isExtraDeckCard(card)) return false;
    if (kind !== 'all' && card.kind !== kind) return false;
    if (element !== 'all' && card.element !== element) return false;
    if (seriesFilter !== 'all' && card.seriesId !== seriesFilter) return false;
    if (unitTypeFilter !== 'all' && card.unitType !== unitTypeFilter) return false;
    if (keywordFilter !== 'all' && !card.keywords?.includes(keywordFilter)) return false;
    if (rarityFilter !== 'all' && card.rarity !== rarityFilter) return false;
    if (costFilter === '0-1' && card.cost > 1) return false;
    if (costFilter !== 'all' && costFilter !== '0-1' && costFilter !== '7+' && card.cost !== Number(costFilter)) return false;
    if (costFilter === '7+' && card.cost < 7) return false;
    if (search && !`${card.name} ${card.text} ${card.subtitle} ${card.series ?? ''} ${card.comboTag ?? ''} ${card.unitType ? UNIT_TYPE_LABEL[card.unitType] : ''} ${(card.keywords ?? []).map((keyword) => KEYWORD_LABEL[keyword]).join(' ')}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (sort === 'cost') return a.cost - b.cost || a.name.localeCompare(b.name, 'ko');
    if (sort === 'rarity') return rarityWeight[b.rarity] - rarityWeight[a.rarity] || a.cost - b.cost;
    if (sort === 'name') return a.name.localeCompare(b.name, 'ko');
    const score = (card: CardDefinition) => rarityWeight[card.rarity] * 7 + (card.element === dominantElement ? 5 : 0) - card.cost * 0.35;
    return score(b) - score(a);
  }), [collection, deckZone, kind, element, seriesFilter, unitTypeFilter, keywordFilter, rarityFilter, costFilter, search, sort, dominantElement]);

  function usedCopies(cardId: string): number {
    return (mainCounts[cardId] ?? 0) + (extraCounts[cardId] ?? 0);
  }

  function addCard(card: CardDefinition) {
    const max = Math.min(MAX_COPIES[card.rarity], collection[card.id] ?? 0);
    if (usedCopies(card.id) >= max) {
      setMessage(`${card.name}은(는) 보유 수량/등급별 최대 편성 수에 도달했습니다.`);
      return;
    }
    if (isExtraDeckCard(card)) {
      if (extraCards.length >= EXTRA_DECK_SIZE) {
        setMessage(`엑스트라 덱은 최대 ${EXTRA_DECK_SIZE}장입니다.`);
        return;
      }
      setExtraCards((current) => [...current, card.id]);
    } else {
      if (deckCards.length >= DECK_SIZE) {
        setMessage(`메인 덱은 최대 ${DECK_SIZE}장입니다.`);
        return;
      }
      if (card.seriesId) {
        const seriesCount = mainSeriesCounts[card.seriesId] ?? 0;
        if (seriesCount >= MAX_PRIMARY_SERIES_CARDS) {
          setMessage(`「${SERIES_BY_ID[card.seriesId].shortName}」 시리즈는 최대 ${MAX_PRIMARY_SERIES_CARDS}장까지 편성할 수 있습니다. 현재 ${seriesCount}/${MAX_PRIMARY_SERIES_CARDS}장입니다. 다른 시리즈나 TIME CORE·범용 카드를 선택해 주세요.`);
          playUiSound('click');
          return;
        }
      }
      setDeckCards((current) => [...current, card.id]);
    }
    setMessage('');
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
    const card = CARD_BY_ID[cardId];
    setExtraCards((current) => {
      const index = current.lastIndexOf(cardId);
      return index < 0 ? current : [...current.slice(0, index), ...current.slice(index + 1)];
    });
    setDeckZone('extra');
    setMessage(`${card?.name ?? '엑스트라 카드'} 1장을 엑스트라 덱에서 제거했습니다.`);
    playUiSound('remove');
  }

  function clearExtraDeck() {
    if (extraCards.length === 0) return;
    setExtraCards([]);
    setDeckZone('extra');
    setMessage('엑스트라 덱만 비웠습니다. 메인 덱은 그대로 유지됩니다.');
    playUiSound('remove');
  }

  function clearDeck() {
    setDeckCards([]);
    setExtraCards([]);
    setMessage('덱을 비웠습니다. 자동 구성 또는 카드 추가로 다시 채울 수 있습니다.');
    playUiSound('remove');
  }

  function resetDeckFilters() {
    setSearch('');
    setKind('all');
    setElement('all');
    setSeriesFilter('all');
    setUnitTypeFilter('all');
    setKeywordFilter('all');
    setRarityFilter('all');
    setCostFilter('all');
  }

  function scoreCard(card: CardDefinition, style: typeof autoStyle, primary: Element): number {
    let score = rarityWeight[card.rarity] * 10;
    score += card.element === primary ? 6 : 0;
    score += card.series ? 2 : 0;
    if (style === 'theme' && autoSeries !== 'all') score += card.seriesId === autoSeries ? 34 : -5;
    if (seriesFilter !== 'all') score += card.seriesId === seriesFilter ? 8 : 0;
    if (card.seriesAbility) score += style === 'theme' && autoSeries !== 'all' && card.seriesId === autoSeries ? 11 : 6;
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
    const buildSeriesCounts: Partial<Record<SeriesId, number>> = {};
    const nextMain: string[] = [];
    const mainPool = CARDS.filter((card) => !isExtraDeckCard(card) && (collection[card.id] ?? 0) > 0)
      .sort((a, b) => scoreCard(b, style, primary) - scoreCard(a, style, primary));

    const canAddMain = (card: CardDefinition): boolean => {
      if (!card.seriesId) return true;
      return (buildSeriesCounts[card.seriesId] ?? 0) < MAX_PRIMARY_SERIES_CARDS;
    };
    const pushMain = (card: CardDefinition): boolean => {
      if (nextMain.length >= DECK_SIZE || !canAddMain(card)) return false;
      nextMain.push(card.id);
      counts[card.id] = (counts[card.id] ?? 0) + 1;
      if (card.seriesId) buildSeriesCounts[card.seriesId] = (buildSeriesCounts[card.seriesId] ?? 0) + 1;
      return true;
    };

    const addFromKind = (cardKind: 'unit' | 'spell' | 'trap', wanted: number) => {
      for (const card of mainPool.filter((item) => item.kind === cardKind)) {
        if (nextMain.filter((id) => CARD_BY_ID[id]?.kind === cardKind).length >= wanted) break;
        const owned = collection[card.id] ?? 0;
        const limit = Math.min(MAX_COPIES[card.rarity], owned);
        const archetypeCore = style === 'theme' && autoSeries !== 'all' && card.seriesId === autoSeries;
        const desiredCopies = card.rarity === 'legendary' ? 1 : card.rarity === 'epic' ? Math.min(2, limit) : Math.min(archetypeCore ? 3 : 2, limit);
        for (let index = counts[card.id] ?? 0; index < desiredCopies; index += 1) {
          if (nextMain.filter((id) => CARD_BY_ID[id]?.kind === cardKind).length >= wanted) break;
          if (!pushMain(card)) break;
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
        if (!pushMain(card)) break;
      }
    }

    // 선택한 시리즈가 30장에 도달하면 남은 15장은 다른 시리즈/TIME CORE/범용 카드로 채웁니다.
    // 따라서 '시리즈 테마 자동 구성' 자체가 저장 불가능한 덱을 만들지 않습니다.
    if (nextMain.length < DECK_SIZE) {
      const supportPool = mainPool.filter((card) => style !== 'theme' || autoSeries === 'all' || card.seriesId !== autoSeries);
      for (const card of supportPool) {
        if (nextMain.length >= DECK_SIZE) break;
        const owned = collection[card.id] ?? 0;
        const limit = Math.min(MAX_COPIES[card.rarity], owned);
        while ((counts[card.id] ?? 0) < limit && nextMain.length < DECK_SIZE) {
          if (!pushMain(card)) break;
        }
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
    const styleLabel = style === 'theme' && autoSeries !== 'all'
      ? `${SERIES_BY_ID[autoSeries].shortName} 시리즈 테마`
      : { balanced: '균형형', aggro: '속공형', control: '컨트롤형', theme: '시리즈 테마형' }[style];
    const ready = nextMain.length >= DECK_SIZE && nextExtra.length >= EXTRA_DECK_SIZE;
    const themeSeriesCount = style === 'theme' && autoSeries !== 'all' ? (buildSeriesCounts[autoSeries] ?? 0) : null;
    const capNote = themeSeriesCount !== null ? ` 핵심 시리즈 ${themeSeriesCount}/${MAX_PRIMARY_SERIES_CARDS}장.` : '';
    setMessage(ready ? `${styleLabel} 추천 덱을 완성했습니다.${capNote} 단일 시리즈 최대 ${MAX_PRIMARY_SERIES_CARDS}장 규칙을 지켰습니다.` : `${styleLabel} 자동 구성을 적용했습니다.${capNote} 보유 카드가 부족한 슬롯은 직접 채워주세요.`);
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
  const mainProgress = Math.min(100, Math.round((deckCards.length / DECK_SIZE) * 100));
  const extraProgress = Math.min(100, Math.round((extraCards.length / EXTRA_DECK_SIZE) * 100));
  const deckListEntries = useMemo(() => Object.entries(mainCounts).sort(([a], [b]) => (CARD_BY_ID[a]?.cost ?? 0) - (CARD_BY_ID[b]?.cost ?? 0) || (CARD_BY_ID[a]?.name ?? '').localeCompare(CARD_BY_ID[b]?.name ?? '', 'ko')), [mainCounts]);
  const extraListEntries = useMemo(() => Object.entries(extraCounts).sort(([a], [b]) => (CARD_BY_ID[a]?.cost ?? 0) - (CARD_BY_ID[b]?.cost ?? 0) || (CARD_BY_ID[a]?.name ?? '').localeCompare(CARD_BY_ID[b]?.name ?? '', 'ko')), [extraCounts]);
  const activeFilterCount = [kind !== 'all', element !== 'all', seriesFilter !== 'all', unitTypeFilter !== 'all', keywordFilter !== 'all', rarityFilter !== 'all', costFilter !== 'all', Boolean(search)].filter(Boolean).length;
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
    <div className="v9-deck-page v31e-deck-lab">
      <section className="v31e-build-hero panel">
        <div className="v31e-build-hero-copy">
          <span className="eyebrow">DECK BUILD · TACTICAL LAB</span>
          <h2>{deckName || '새 덱'}</h2>
          <p>카드 풀을 필터링하고 클릭으로 추가한 뒤, 오른쪽 덱 리스트에서 수량을 바로 조정합니다. 메인 45장과 엑스트라 6장을 한 화면에서 완성할 수 있습니다.</p>
          <div className="v31e-build-progress" aria-label="덱 완성도">
            <span><small>MAIN DECK</small><b>{deckCards.length}/{DECK_SIZE}</b><i><em style={{ width: `${mainProgress}%` }} /></i></span>
            <span><small>EXTRA DECK</small><b>{extraCards.length}/{EXTRA_DECK_SIZE}</b><i><em style={{ width: `${extraProgress}%` }} /></i></span>
          </div>
        </div>
        <div className="v31e-build-hero-actions">
          <div className={`v31e-build-status ${validation ? 'building' : 'ready'}`}><i /><span><small>BUILD STATUS</small><b>{validation ? '구성 중' : '대전 준비 완료'}</b></span></div>
          <button className="ghost-button" onClick={() => autoBuild(autoStyle)}>추천 자동 구성</button>
          <button className="primary-button" disabled={busy || Boolean(validation)} onClick={saveDeck}>{busy ? '저장 중...' : '현재 덱 저장'}</button>
        </div>
      </section>

      <section className="v9-auto-builder panel v31e-auto-builder">
        <div className="v9-auto-copy">
          <span className="eyebrow">BUILD PROFILE</span>
          <h3>덱 방향을 먼저 정하세요</h3>
          <p>자동 구성은 시작점일 뿐입니다. 이후 카드별 수량을 직접 조정해 마무리할 수 있습니다.</p>
        </div>
        <div className="v9-auto-controls v32-auto-controls">
          <div className="v32-auto-style-row">
            <small>PLAY STYLE · 전투 성향</small>
            <div className="v9-style-pills">
              {([
                ['balanced', '균형형'], ['aggro', '속공형'], ['control', '컨트롤형'],
              ] as Array<[typeof autoStyle, string]>).map(([id, label]) => (
                <button key={id} className={autoStyle === id ? 'active' : ''} onClick={() => { setAutoStyle(id); setAutoSeries('all'); }}>{label}</button>
              ))}
            </div>
          </div>
          <div className="v32-series-theme-picker">
            <div className="v32-series-theme-head"><span><small>SERIES THEME</small><b>시리즈 테마</b></span><em>선택 시리즈를 최대 {MAX_PRIMARY_SERIES_CARDS}장까지 우선 편성하고, 나머지는 보조 카드로 자동 완성합니다.</em></div>
            <div className="v32-series-theme-grid">
              {CARD_SERIES.map((series) => (
                <button
                  type="button"
                  key={series.id}
                  className={autoStyle === 'theme' && autoSeries === series.id ? 'active' : ''}
                  style={{ '--series-accent': series.accent } as CSSProperties}
                  onClick={() => { setAutoSeries(series.id); setAutoStyle('theme'); }}
                >
                  <i />
                  <span><b>{series.shortName}</b><small>{series.mechanic}</small></span>
                </button>
              ))}
            </div>
          </div>
          <button className="v9-auto-button" onClick={() => autoBuild(autoStyle)}>{autoStyle === 'theme' && autoSeries !== 'all' ? `${SERIES_BY_ID[autoSeries].shortName} 테마로 자동 구성` : '이 방향으로 자동 구성'}</button>
        </div>
      </section>

      <section className="v9-deck-manager panel v31e-deck-manager">
        <div className="v9-deck-select-row">
          <select value={selectedDeckId} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSelectedDeckId(event.target.value)}>
            {hub.decks.map((deck) => <option key={deck.id} value={deck.id}>{deck.is_active ? '★ ' : ''}{deck.name}</option>)}
            <option value="">＋ 새 덱</option>
          </select>
          <input value={deckName} onChange={(event: ChangeEvent<HTMLInputElement>) => setDeckName(event.target.value)} maxLength={24} placeholder="덱 이름" />
          <div className="v9-deck-counts"><span>유닛 <b>{unitCount}</b></span><span>주문 <b>{spellCount}</b></span><span>함정 <b>{trapCount}</b></span></div>
          <button className="v9-clear-button" onClick={clearDeck}>전체 비우기</button>
        </div>
        <div className="v37c-series-limit-guide" aria-label={`시리즈별 최대 ${MAX_PRIMARY_SERIES_CARDS}장 편성 제한`}>
          <span><small>SERIES LIMIT</small><b>한 시리즈 최대 {MAX_PRIMARY_SERIES_CARDS}장</b></span>
          <em>30장에 도달하면 해당 시리즈 카드는 더 이상 추가되지 않으며, 클릭 시 제한 안내가 표시됩니다.</em>
        </div>
        {message && <p className="v9-deck-message">{message}</p>}
        {validation && <p className="v9-validation">{validation}</p>}
      </section>

      <div className="v9-deck-workspace v31e-deck-workspace">
        <section className="v9-card-library panel v31e-card-library">
          <header className="v9-library-head v31e-library-head">
            <div><span className="eyebrow">CARD LIBRARY</span><h3>카드 선택</h3><small>{filtered.length}종 표시 · 필터 {activeFilterCount}개 적용</small></div>
            <div className="v31e-library-zone-tabs" role="tablist" aria-label="덱 영역 선택">
              <button type="button" className={deckZone === 'main' ? 'active' : ''} onClick={() => setDeckZone('main')}><span>MAIN</span><b>{deckCards.length}/{DECK_SIZE}</b></button>
              <button type="button" className={deckZone === 'extra' ? 'active' : ''} onClick={() => setDeckZone('extra')}><span>EXTRA</span><b>{extraCards.length}/{EXTRA_DECK_SIZE}</b></button>
            </div>
          </header>

          <div className="v9-filter-row v31e-filter-row">
            <input value={search} onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} placeholder="카드명 · 효과 · 시리즈 · 타입 · 콤보 검색" />
            <select value={kind} onChange={(event: ChangeEvent<HTMLSelectElement>) => setKind(event.target.value as 'all' | CardKind)}>
              <option value="all">모든 종류</option>
              {deckZone === 'main' ? <><option value="unit">유닛</option><option value="spell">주문</option><option value="trap">함정</option></> : <><option value="fusion">공명 융합</option><option value="evolution">계승 진화</option></>}
            </select>
            <select value={element} onChange={(event: ChangeEvent<HTMLSelectElement>) => setElement(event.target.value as 'all' | Element)}>
              <option value="all">모든 속성</option>{Object.entries(ELEMENT_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
            <select value={seriesFilter} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSeriesFilter(event.target.value as 'all' | SeriesId)}>
              <option value="all">모든 시리즈</option>{CARD_SERIES.map((series) => <option key={series.id} value={series.id}>{series.shortName}</option>)}
            </select>
            <select value={unitTypeFilter} onChange={(event: ChangeEvent<HTMLSelectElement>) => setUnitTypeFilter(event.target.value as 'all' | UnitType)}>
              <option value="all">모든 유닛 타입</option>{Object.entries(UNIT_TYPE_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
            </select>
            <select value={keywordFilter} onChange={(event: ChangeEvent<HTMLSelectElement>) => setKeywordFilter(event.target.value as 'all' | Keyword)}>
              <option value="all">모든 특성</option>{FILTERABLE_KEYWORDS.map((keyword) => <option key={keyword} value={keyword}>{KEYWORD_LABEL[keyword]}</option>)}
            </select>
            <select value={sort} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSort(event.target.value as typeof sort)}>
              <option value="recommended">추천순</option><option value="cost">비용순</option><option value="rarity">등급순</option><option value="name">이름순</option>
            </select>
          </div>

          <div className="v31e-filter-chips">
            <div><small>COST</small>{(['all', '0-1', '2', '3', '4', '5', '6', '7+'] as const).map((id) => <button type="button" key={id} className={costFilter === id ? 'active' : ''} onClick={() => setCostFilter(id)}>{id === 'all' ? 'ALL' : id}</button>)}</div>
            <div><small>RARITY</small>{(['all', 'common', 'rare', 'epic', 'legendary'] as const).map((id) => <button type="button" key={id} className={`${rarityFilter === id ? 'active' : ''} rarity-${id}`} onClick={() => setRarityFilter(id)}>{id === 'all' ? 'ALL' : RARITY_LABEL[id]}</button>)}</div>
            <button type="button" className="v31e-filter-reset" disabled={activeFilterCount === 0} onClick={resetDeckFilters}>필터 초기화</button>
          </div>

          <div className="collection-grid deck-grid v9-card-grid v31e-card-grid">
            {filtered.map((card) => {
              const max = Math.min(MAX_COPIES[card.rarity], collection[card.id] ?? 0);
              const inDeck = usedCopies(card.id);
              const seriesCount = card.seriesId ? (mainSeriesCounts[card.seriesId] ?? 0) : 0;
              const seriesCapped = deckZone === 'main' && Boolean(card.seriesId) && seriesCount >= MAX_PRIMARY_SERIES_CARDS;
              const full = inDeck >= max || (isExtraDeckCard(card) ? extraCards.length >= EXTRA_DECK_SIZE : deckCards.length >= DECK_SIZE);
              return (
                <div className={`v31e-library-card ${full ? 'is-full' : ''} ${seriesCapped ? 'is-series-capped' : ''}`} key={card.id}>
                  <CardFace card={card} compact quantity={Math.max(0, (collection[card.id] ?? 0) - inDeck)} disabled={full} onClick={() => addCard(card)} />
                  <div className="v31e-library-card-meta">
                    <span>덱 {inDeck}/{max}</span>
                    {card.seriesId && deckZone === 'main' ? <small className={seriesCapped ? 'series-cap-hit' : ''}>시리즈 {seriesCount}/{MAX_PRIMARY_SERIES_CARDS}</small> : <small>보유 {collection[card.id] ?? 0}</small>}
                  </div>
                  <div className="v36-card-catalog-meta">
                    <span className="v36-series-chip">{cardSeriesLabel(card)}</span>
                    <div className="v36-keyword-chip-row">{card.keywords && card.keywords.length > 0 ? card.keywords.map((keyword) => <i key={keyword}>{KEYWORD_LABEL[keyword]}</i>) : <small>특성 없음</small>}</div>
                  </div>
                  <button type="button" className={`v31e-library-add ${seriesCapped ? 'series-cap-hit' : ''}`} disabled={full} onClick={(event) => { event.stopPropagation(); addCard(card); }} aria-label={seriesCapped ? `${card.name} 시리즈 편성 한도 도달` : `${card.name} 덱에 추가`}>{seriesCapped ? 'MAX' : '＋'}</button>
                </div>
              );
            })}
            {filtered.length === 0 && <div className="v31e-library-empty"><b>조건에 맞는 카드가 없습니다.</b><span>필터를 줄이거나 다른 덱 영역을 확인해보세요.</span><button type="button" onClick={resetDeckFilters}>필터 초기화</button></div>}
          </div>
        </section>

        <aside className="v9-current-deck panel v31e-current-deck">
          <header className="v9-current-head v31e-current-head"><div><span className="eyebrow">DECK CONTENTS</span><h3>{deckName || '새 덱'}</h3><small>{selectedDeck?.is_active ? '현재 대전 덱' : '편집 중인 덱'}</small></div><div><b>{deckCards.length}</b><small>/ {DECK_SIZE}</small></div></header>
          <div className="v31e-mini-progress"><span><i style={{ width: `${mainProgress}%` }} /></span><em>EXTRA {extraCards.length}/{EXTRA_DECK_SIZE}</em></div>

          <section className={`v22-deck-doctor grade-${deckDoctor.score >= 90 ? 's' : deckDoctor.score >= 75 ? 'a' : deckDoctor.score >= 55 ? 'b' : 'c'}`}>
            <div className="v22-doctor-score"><span><b>{deckDoctor.score}</b><small>/100</small></span><div><small>DECK HEALTH</small><strong>{deckDoctor.label}</strong><em>{deckDoctor.focusSeries && deckDoctor.focusSeriesCount >= 8 ? `${SERIES_BY_ID[deckDoctor.focusSeries].shortName} ${deckDoctor.focusSeriesCount}장 · LINK ${deckDoctor.seriesLinkCount}장` : `${ELEMENT_LABEL[deckDoctor.focusElement]} 중심`} · 초반 {deckDoctor.early}장 · 고비용 {deckDoctor.late}장</em></div></div>
            <div className="v22-doctor-meter"><i style={{ width: `${deckDoctor.score}%` }} /></div>
            <ul>{deckDoctor.tips.map((tip) => <li key={tip}>{tip}</li>)}</ul>
          </section>

          <section className="v20-deck-analytics" aria-label="덱 비용 분석">
            <div className="v20-deck-metrics"><span><small>평균 비용</small><b>{averageCost.toFixed(1)}</b></span><span><small>유닛</small><b>{unitCount}</b></span><span><small>주문 / 함정</small><b>{spellCount} / {trapCount}</b></span></div>
            <div className="v20-cost-curve">{costCurve.map((count, index) => <span key={index}><i style={{ height: `${Math.max(8, (count / curveMax) * 100)}%` }} /><b>{count}</b><small>{['0-1','2','3','4','5','6','7+'][index]}</small></span>)}</div>
          </section>

          <div className="v31e-deck-list-title"><span>MAIN DECK</span><b>{deckListEntries.length}종 · {deckCards.length}장</b></div>
          <div className="v9-deck-list-scroll v31e-deck-list-scroll">
            {deckListEntries.map(([cardId, quantity]) => {
              const card = CARD_BY_ID[cardId];
              if (!card) return null;
              const max = Math.min(MAX_COPIES[card.rarity], collection[card.id] ?? 0);
              const seriesCount = card.seriesId ? (mainSeriesCounts[card.seriesId] ?? 0) : 0;
              const seriesCapped = Boolean(card.seriesId) && seriesCount >= MAX_PRIMARY_SERIES_CARDS;
              return (
                <div className={`v9-deck-row v31e-deck-row ${seriesCapped ? 'is-series-capped' : ''}`} key={cardId} style={cardStyle(card)}>
                  <button type="button" className="v31e-deck-row-card" onClick={() => requestCardInspection(card.id)}>
                    <i>{card.cost}</i><span><b>{card.name}</b><small>{RARITY_LABEL[card.rarity]} · {ELEMENT_LABEL[card.element]} · {KIND_LABEL[card.kind]}{card.seriesId ? ` · 시리즈 ${seriesCount}/${MAX_PRIMARY_SERIES_CARDS}` : ''}</small></span>
                  </button>
                  <div className="v31e-deck-stepper"><button type="button" onClick={() => removeMain(cardId)} aria-label={`${card.name} 1장 제거`}>−</button><strong>×{quantity}</strong><button type="button" className={seriesCapped ? 'series-cap-hit' : ''} disabled={usedCopies(card.id) >= max || deckCards.length >= DECK_SIZE} onClick={() => addCard(card)} aria-label={seriesCapped ? `${card.name} 시리즈 편성 한도 도달` : `${card.name} 1장 추가`}>{seriesCapped ? 'MAX' : '＋'}</button></div>
                </div>
              );
            })}
            {deckCards.length === 0 && <div className="v9-empty-deck"><b>아직 카드가 없습니다.</b><span>왼쪽 카드 풀에서 ＋ 버튼을 누르거나 자동 구성을 사용하세요.</span></div>}
          </div>

          <div className="v9-extra-zone v31e-extra-zone v32-extra-editor-zone">
            <div className="v9-extra-title v32-extra-title">
              <span><b>EXTRA DECK</b><small>카드별 − / ＋ 버튼으로 바로 수정할 수 있습니다.</small></span>
              <div><b>{extraCards.length}/{EXTRA_DECK_SIZE}</b><button type="button" className="v32-extra-clear-button" disabled={extraCards.length === 0} onClick={clearExtraDeck}>엑스트라만 비우기</button></div>
            </div>

            <div className="v9-extra-grid v31e-extra-grid">
              {extraCards.map((cardId, index) => {
                const card = CARD_BY_ID[cardId];
                if (!card) return null;
                return <div className="v31e-extra-slot v32-extra-edit-slot" key={`${cardId}-${index}`}>
                  <div className="v32-extra-card-wrap"><CardFace card={card} compact onClick={() => requestCardInspection(card.id)} /></div>
                  <button className="v32-extra-remove-button" type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); removeExtra(cardId); }} aria-label={`${card.name} 1장 제거`}><span>−</span> 1장 제거</button>
                  <small>{card.kind === 'fusion' ? 'FUSION' : 'ASCENSION'}</small>
                </div>;
              })}
              {Array.from({ length: Math.max(0, EXTRA_DECK_SIZE - extraCards.length) }, (_, index) => <button type="button" className="v9-extra-empty" key={index} onClick={() => setDeckZone('extra')}>＋</button>)}
            </div>

            <div className="v32-extra-edit-list" aria-label="엑스트라 덱 수량 편집">
              {extraListEntries.map(([cardId, quantity]) => {
                const card = CARD_BY_ID[cardId];
                if (!card) return null;
                const max = Math.min(MAX_COPIES[card.rarity], collection[card.id] ?? 0);
                return (
                  <div className="v32-extra-edit-row" key={`extra-edit-${cardId}`} style={cardStyle(card)}>
                    <button type="button" className="v32-extra-edit-card" onClick={() => requestCardInspection(card.id)}>
                      <i>{card.cost}</i><span><b>{card.name}</b><small>{card.kind === 'fusion' ? '공명 융합' : '계승 진화'} · {RARITY_LABEL[card.rarity]}</small></span>
                    </button>
                    <div className="v32-extra-stepper">
                      <button type="button" onClick={() => removeExtra(cardId)} aria-label={`${card.name} 1장 제거`}>−</button>
                      <strong>×{quantity}</strong>
                      <button type="button" disabled={usedCopies(card.id) >= max || extraCards.length >= EXTRA_DECK_SIZE} onClick={() => addCard(card)} aria-label={`${card.name} 1장 추가`}>＋</button>
                    </div>
                  </div>
                );
              })}
              {extraListEntries.length === 0 && <button type="button" className="v32-extra-empty-guide" onClick={() => setDeckZone('extra')}><b>엑스트라 덱이 비어 있습니다.</b><span>여기를 눌러 왼쪽 카드 풀을 엑스트라 카드로 전환하세요.</span></button>}
            </div>
          </div>

          <div className="v9-deck-actions v31e-deck-actions">
            <button className="ghost-button" disabled={!selectedDeckId || selectedDeck?.is_active || busy || Boolean(validation)} onClick={activateDeck}>대전 덱으로 지정</button>
            <button className="primary-button" disabled={busy || Boolean(validation)} onClick={saveDeck}>{busy ? '저장 중...' : '덱 저장'}</button>
          </div>
        </aside>
      </div>
    </div>
  );

}

function ShopView({ hub, onHub }: { hub: HubData; onHub: (hub: HubData) => void }) {
  const [shopTab, setShopTab] = useState<'packs' | 'profile' | 'emotes'>('packs');
  const [cosmeticFilter, setCosmeticFilter] = useState<'all' | ProfileCosmeticKind>('all');
  const [busyCosmetic, setBusyCosmetic] = useState('');
  const [busyEmote, setBusyEmote] = useState('');
  const [busyEmoteLoadout, setBusyEmoteLoadout] = useState(false);
  const [emoteSelection, setEmoteSelection] = useState<string[]>(hub.emoteLoadout ?? []);
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

  useEffect(() => { setEmoteSelection(hub.emoteLoadout ?? []); }, [hub.emoteLoadout]);

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

  async function buyBattleEmote(emoteId: string) {
    setBusyEmote(emoteId);
    setError('');
    try {
      const result = await api('buy_battle_emote', { emoteId });
      if (result.hub) onHub(result.hub);
      playUiSound('success');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '감정표현 구매에 실패했습니다.');
    } finally {
      setBusyEmote('');
    }
  }

  async function buyBattleEmotePack(packId: string) {
    setBusyEmote(packId);
    setError('');
    try {
      const result = await api('buy_battle_emote_pack', { packId });
      if (result.hub) onHub(result.hub);
      playUiSound('success');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '감정표현 세트 구매에 실패했습니다.');
    } finally {
      setBusyEmote('');
    }
  }


  function toggleEmoteLoadout(emoteId: string) {
    if (!(hub.battleEmotes ?? []).includes(emoteId)) return;
    setError('');
    setEmoteSelection((current) => {
      if (current.includes(emoteId)) return current.filter((id) => id !== emoteId);
      if (current.length >= V34_EMOTE_SLOT_LIMIT) {
        setError(`이모티콘은 최대 ${V34_EMOTE_SLOT_LIMIT}개까지만 장착할 수 있습니다.`);
        return current;
      }
      return [...current, emoteId];
    });
  }

  async function saveEmoteLoadout() {
    setBusyEmoteLoadout(true);
    setError('');
    try {
      const result = await api('set_emote_loadout', { emoteIds: emoteSelection });
      if (result.hub) onHub(result.hub);
      playUiSound('success');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '이모티콘 장착 저장에 실패했습니다.');
    } finally {
      setBusyEmoteLoadout(false);
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
          <span className="eyebrow">{series ? `SERIES ${String(index + 1).padStart(2, '0')} · ${series.mechanic}` : pack.id === 'premium_time' ? 'PREMIUM TIME · 3 CARDS' : 'CORE BOOSTER · 5 CARDS'}</span>
          <h3>{pack.name}</h3>
          <p>{pack.tagline}</p>
          {series && <div className="v25-series-pack-note"><b>{series.shortName}</b><span>{series.mechanic}</span></div>}
          <div className="v20-pack-odds">
            <span><small>기본 슬롯</small><b>전설 {pack.odds.legendary}%</b><em>영웅 {pack.odds.epic}% · 희귀 {pack.odds.rare}% · 일반 {pack.odds.common}%</em></span>
            <p>{pack.id === 'premium_time' ? '3칸 구성 · 각 슬롯 0.5% 확률로 시간대 최강 카드 5종 중 1장 등장 · 미당첨 시 전체 카드 풀 랜덤' : `${pack.odds.guaranteedSlots}칸 ${RARITY_LABEL[pack.guaranteed]} 이상 보장${series ? ` · 시리즈 카드 ${pack.odds.seriesGuaranteedSlots ?? 1}장 이상 보장 · 일반 슬롯 ${pack.odds.seriesRate ?? 42}% 시리즈 픽업` : ''}`}</p>
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
        <div><span className="eyebrow">ECLIPSE MARKET</span><h2>상점</h2><p>카드팩·프로필 스킨·대전 감정표현을 구매해 덱과 결투 화면을 꾸미세요.</p></div>
        <div className="currency-pill"><small>COIN</small>{hub.wallet.coins.toLocaleString()}</div>
      </section>
      <div className="v17-shop-tabs">
        <button className={shopTab === 'packs' ? 'active' : ''} onClick={() => setShopTab('packs')}><b>카드팩</b><small>새 카드 획득</small></button>
        <button className={shopTab === 'profile' ? 'active' : ''} onClick={() => setShopTab('profile')}><b>꾸미기</b><small>배경 · 프레임 · 문양/아이콘 · 슬리브 · 닉네임</small></button>
        <button className={shopTab === 'emotes' ? 'active' : ''} onClick={() => setShopTab('emotes')}><b>감정표현</b><small>대전 중 이모티콘 소통</small></button>
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
      ) : shopTab === 'emotes' ? (
        <div className="v34-emote-store">
          <header className="v34-emote-store-head"><span>CHAT + DUEL EMOTE MARKET</span><h3>감정표현</h3><p>도로롱 · NIKKE · 트릭컬 · 가디언테일즈 · 망그러진 곰 · 이렘티콘은 각각 6종입니다. 모든 개별 이모티콘은 1,000코인, 6종 세트는 5,000코인이며 보유한 이모티콘 중 최대 6개만 장착해 채팅과 대전에서 공통으로 사용합니다.</p></header>

          <section className="v34-emote-loadout-panel">
            <header><div><span>ACTIVE LOADOUT</span><h4>사용할 이모티콘 6개 선택</h4><p>보유한 이모티콘을 눌러 장착/해제하세요. 이곳에 장착된 이모티콘만 채팅과 대전 선택창에 표시됩니다.</p></div><strong>{emoteSelection.length}/{V34_EMOTE_SLOT_LIMIT}</strong></header>
            <div className="v34-emote-slots">
              {Array.from({ length: V34_EMOTE_SLOT_LIMIT }, (_, index) => {
                const emoteId = emoteSelection[index];
                const item = emoteId ? V34_BATTLE_EMOTE_BY_ID[emoteId] : null;
                return <div className={`v34-emote-slot ${item ? 'filled' : 'empty'}`} key={`slot-${index}`}>{item ? <button type="button" onClick={() => toggleEmoteLoadout(item.id)} title={`${item.name} 장착 해제`}><img src={item.asset} alt={item.name} /><small>{index + 1}</small></button> : <span><b>{index + 1}</b><small>EMPTY</small></span>}</div>;
              })}
            </div>
            <div className="v34-emote-owned-select">
              {(hub.battleEmotes ?? []).filter((emoteId) => V34_BATTLE_EMOTE_BY_ID[emoteId]).map((emoteId) => {
                const item = V34_BATTLE_EMOTE_BY_ID[emoteId];
                const activeIndex = emoteSelection.indexOf(emoteId);
                return <button type="button" key={emoteId} className={activeIndex >= 0 ? 'active' : ''} onClick={() => toggleEmoteLoadout(emoteId)}><img src={item.asset} alt={item.name} /><span>{item.name}</span>{activeIndex >= 0 && <b>{activeIndex + 1}</b>}</button>;
              })}
              {(hub.battleEmotes ?? []).filter((emoteId) => V34_BATTLE_EMOTE_BY_ID[emoteId]).length === 0 && <p>아직 보유한 이모티콘이 없습니다. 아래에서 개별 또는 세트로 구매해 주세요.</p>}
            </div>
            <footer><small>장착 순서는 대전/채팅 이모티콘 선택창의 표시 순서와 같습니다.</small><button type="button" className="primary-button" disabled={busyEmoteLoadout} onClick={saveEmoteLoadout}>{busyEmoteLoadout ? '저장 중...' : '6개 장착 저장'}</button></footer>
          </section>

          <section className="v34-emote-store-section">
            <header><span>SET OFFER</span><h4>6종 묶음 세트</h4></header>
            <div className="v34-emote-pack-grid">
              {V34_BATTLE_EMOTE_PACKS.map((pack) => {
                const ownedCount = pack.emoteIds.filter((emoteId) => (hub.battleEmotes ?? []).includes(emoteId)).length;
                const fullyOwned = ownedCount === pack.emoteIds.length;
                return <article className="v34-emote-pack-card" key={pack.id}>
                  <div className="v34-emote-pack-preview">{pack.emoteIds.map((emoteId) => { const item = V34_BATTLE_EMOTE_BY_ID[emoteId]; return item ? <img key={emoteId} src={item.asset} alt={item.name} /> : null; })}</div>
                  <div><small>{pack.franchise}</small><h3>{pack.name}</h3><p>{pack.description}</p><em>{ownedCount}/{pack.emoteIds.length} 보유</em></div>
                  <footer><strong>{pack.price.toLocaleString()} COIN</strong><button className="primary-button" disabled={fullyOwned || busyEmote === pack.id || hub.wallet.coins < pack.price} onClick={() => buyBattleEmotePack(pack.id)}>{fullyOwned ? '전부 보유' : busyEmote === pack.id ? '구매 중...' : hub.wallet.coins < pack.price ? '코인 부족' : '세트 구매'}</button></footer>
                </article>;
              })}
            </div>
          </section>

          <section className="v34-emote-store-section">
            <header><span>SINGLE SALE</span><h4>개별 감정표현 · 전부 1,000코인</h4></header>
            <div className="v34-emote-grid">
              {V34_BATTLE_EMOTES.map((item) => {
                const owned = (hub.battleEmotes ?? []).includes(item.id);
                return <article className="v34-emote-product" key={item.id}>
                  <div className="v34-emote-preview"><img src={item.asset} alt={item.name} /></div>
                  <div><small>{item.franchise}</small><h3>{item.name}</h3><p>{item.mood.toUpperCase()} · CHAT + DUEL</p></div>
                  <footer><strong>{item.price.toLocaleString()} COIN</strong><button className="primary-button" disabled={owned || busyEmote === item.id || hub.wallet.coins < item.price} onClick={() => buyBattleEmote(item.id)}>{owned ? '보유 중' : busyEmote === item.id ? '구매 중...' : hub.wallet.coins < item.price ? '코인 부족' : '구매'}</button></footer>
                </article>;
              })}
            </div>
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

      {openingStage !== 'idle' && opened.length > 0 && typeof document !== 'undefined' ? createPortal(
        <div className={`modal-layer pack-experience-layer v19-client v23-client stage-${openingStage}`} data-ui-build="v32-retail" role="dialog" aria-modal="true" aria-label="카드 팩 개봉">
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
        </div>,
        document.body
      ) : null}
    </div>
  );
}

function CollectionView({ hub }: { hub: HubData }) {
  const [search, setSearch] = useState('');
  const [rarity, setRarity] = useState<'all' | Rarity>('all');
  const [seriesFilter, setSeriesFilter] = useState<'all' | SeriesId>('all');
  const [keywordFilter, setKeywordFilter] = useState<'all' | Keyword>('all');
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
    .filter((card) => keywordFilter === 'all' || Boolean(card.keywords?.includes(keywordFilter)))
    .filter((card) => !search || `${card.name} ${card.text} ${card.series ?? ''} ${(card.keywords ?? []).map((keyword) => KEYWORD_LABEL[keyword]).join(' ')}`.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="view-stack">
      <section className="section-heading">
        <div><span className="eyebrow">CARD VAULT</span><h2>보관함</h2><p>{visible.length}종의 카드가 표시되고 있습니다.</p></div>
        <div className="collection-tools"><input value={search} onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)} placeholder="카드 검색" /><select value={rarity} onChange={(event: ChangeEvent<HTMLSelectElement>) => setRarity(event.target.value as 'all' | Rarity)}><option value="all">모든 등급</option>{Object.entries(RARITY_LABEL).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select><select value={seriesFilter} onChange={(event: ChangeEvent<HTMLSelectElement>) => setSeriesFilter(event.target.value as 'all' | SeriesId)}><option value="all">모든 시리즈</option>{CARD_SERIES.map((series) => <option key={series.id} value={series.id}>{series.shortName}</option>)}</select><select value={keywordFilter} onChange={(event: ChangeEvent<HTMLSelectElement>) => setKeywordFilter(event.target.value as 'all' | Keyword)}><option value="all">모든 특성</option>{FILTERABLE_KEYWORDS.map((keyword) => <option key={keyword} value={keyword}>{KEYWORD_LABEL[keyword]}</option>)}</select></div>
      </section>
      <section className="v22-vault-summary panel">
        <div className="v22-vault-completion"><span><small>COLLECTION</small><b>{completion}%</b></span><div><strong>{ownedUnique.length} / {CARDS.length}종 수집</strong><i><b style={{ width: `${completion}%` }} /></i><em>총 보유 카드 {ownedCopies.toLocaleString()}장</em></div></div>
        <div className="v22-vault-rarities">{raritySummary.map((item) => <button type="button" key={item.tier} className={`rarity-${item.tier}`} onClick={() => setRarity(item.tier)}><span>{RARITY_LABEL[item.tier]}</span><b>{item.owned}<small>/{item.total}</small></b></button>)}</div>
      </section>
      <section className="collection-grid vault-grid">
        {visible.map((card) => <div className="v36-collection-card-tile" key={card.id}><CardFace card={card} quantity={collection[card.id]} /><div className="v36-card-catalog-meta"><span className="v36-series-chip">{cardSeriesLabel(card)}</span><div className="v36-keyword-chip-row">{card.keywords && card.keywords.length > 0 ? card.keywords.map((keyword) => <i key={keyword}>{KEYWORD_LABEL[keyword]}</i>) : <small>특성 없음</small>}</div><strong>보유 {collection[card.id]}장</strong></div></div>)}
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
          {incoming.length > 0 && <div className="request-list"><h4>받은 요청</h4>{incoming.map((request) => { const profile = profileMap[request.sender_id]; return <div className={`v31-social-skin theme-${profile?.profile_theme ?? 'bg_default'} frame-${profile?.profile_frame ?? 'frame_default'}`} key={request.id}><ProfileFrameFX frameId={profile?.profile_frame} /><Avatar id={profile?.avatar} size="small" /><span><b><NicknameText name={profile?.display_name ?? '결투가'} styleId={profile?.nickname_style} /></b><small>{profile?.player_code}</small></span><button onClick={() => respond(request.id, true)}>수락</button><button onClick={() => respond(request.id, false)}>거절</button></div>; })}</div>}
          {outgoing.length > 0 && <div className="request-list"><h4>보낸 요청</h4>{outgoing.map((request) => { const profile = profileMap[request.receiver_id]; return <div className={`v31-social-skin theme-${profile?.profile_theme ?? 'bg_default'} frame-${profile?.profile_frame ?? 'frame_default'}`} key={request.id}><ProfileFrameFX frameId={profile?.profile_frame} /><Avatar id={profile?.avatar} size="small" /><span><b><NicknameText name={profile?.display_name ?? '결투가'} styleId={profile?.nickname_style} /></b><small>응답 대기 중</small></span></div>; })}</div>}
        </article>
        <article className="panel friend-list-panel">
          <header><h3>친구 목록</h3><span>{hub.friends.length}명</span></header>
          <div className="friend-list">
            {hub.friends.length === 0 && <div className="empty-state"><span>♢</span><p>아직 등록된 친구가 없습니다.</p></div>}
            {hub.friends.map((friend) => <div className={`friend-row v31-social-skin theme-${friend.profile_theme ?? 'bg_default'} frame-${friend.profile_frame ?? 'frame_default'}`} key={friend.user_id}><ProfileFrameFX frameId={friend.profile_frame} /><Avatar id={friend.avatar} /><span><b><NicknameText name={friend.display_name} styleId={friend.nickname_style} /></b><small>{friend.status_message}</small></span><div><em>LV.{levelFromXp(friend.xp)}</em><small>{friend.wins}승 · 승률 {winRate(friend)}%</small></div><button onClick={() => remove(friend.user_id)}>삭제</button></div>)}
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
        <span className="eyebrow">DUELIST IDENTITY</span><h2>결투가 프로필 편집</h2>
        <label><span>플레이어 이름</span><input value={name} onChange={(event: ChangeEvent<HTMLInputElement>) => setName(event.target.value)} maxLength={16} /></label>
        <label><span>상태 메시지</span><input value={status} onChange={(event: ChangeEvent<HTMLInputElement>) => setStatus(event.target.value)} maxLength={60} /></label>
        <label><span>프로필 아이콘</span><div className="avatar-picker">{AVATARS.map((id) => <button type="button" className={avatar === id ? 'active' : ''} key={id} onClick={() => setAvatar(id)}><Avatar id={id} /></button>)}{PROFILE_COSMETICS.filter((item) => item.kind === 'emblem' && (hub.profileCosmetics ?? []).includes(item.id)).map((item) => <button type="button" className={`cosmetic-icon-option ${avatar === item.id ? 'active' : ''}`} key={`avatar-${item.id}`} onClick={() => setAvatar(item.id)} title={`${item.name} · 구매한 프로필 아이콘`}><Avatar id={item.id} /></button>)}</div><small className="profile-icon-help">기본 아이콘과 상점에서 획득한 문양 중 하나를 대표 아이콘으로 장착할 수 있습니다. 장착 상태는 친구 목록과 채팅, 대전 화면에도 표시됩니다.</small></label>
        <div className="v17-profile-skin-picker"><span>보유 프로필 배경</span><div><button className={theme === 'bg_default' ? 'active' : ''} onClick={() => equipCosmetic('bg_default')}>기본</button>{PROFILE_COSMETICS.filter((item) => item.kind === 'background' && (hub.profileCosmetics ?? []).includes(item.id)).map((item) => <button className={theme === item.id ? 'active' : ''} key={item.id} onClick={() => equipCosmetic(item.id)} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>{item.name}</button>)}</div></div>
        <div className="v17-profile-skin-picker"><span>보유 프로필 프레임</span><div><button className={frame === 'frame_default' ? 'active' : ''} onClick={() => equipCosmetic('frame_default')}>기본</button>{PROFILE_COSMETICS.filter((item) => item.kind === 'frame' && (hub.profileCosmetics ?? []).includes(item.id)).map((item) => <button className={frame === item.id ? 'active' : ''} key={item.id} onClick={() => equipCosmetic(item.id)} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>{item.name}</button>)}</div></div>
        <div className="v17-profile-skin-picker"><span>보유 프로필 문양</span><div><button className={emblem === 'emblem_default' ? 'active' : ''} onClick={() => equipCosmetic('emblem_default')}>기본 E</button>{PROFILE_COSMETICS.filter((item) => item.kind === 'emblem' && (hub.profileCosmetics ?? []).includes(item.id)).map((item) => <button className={emblem === item.id ? 'active' : ''} key={item.id} onClick={() => equipCosmetic(item.id)} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>{item.glyph} {item.name}</button>)}</div></div>
        <div className="v17-profile-skin-picker"><span>보유 카드 슬리브</span><div><button className={sleeve === 'sleeve_default' ? 'active' : ''} onClick={() => equipCosmetic('sleeve_default')}>기본</button>{PROFILE_COSMETICS.filter((item) => item.kind === 'sleeve' && (hub.profileCosmetics ?? []).includes(item.id)).map((item) => <button className={sleeve === item.id ? 'active' : ''} key={item.id} onClick={() => equipCosmetic(item.id)} style={{ '--cosmetic-accent': item.accent } as CSSProperties}>{item.name}</button>)}</div><div className="v26-profile-sleeve-demo"><CardFace hidden compact inspectable={false} sleeveId={sleeve} /></div></div>
        <div className="v17-profile-skin-picker v26-nickname-picker"><span>보유 닉네임 효과</span><div><button className={nicknameStyle === 'nickname_default' ? 'active' : ''} onClick={() => equipCosmetic('nickname_default')}>기본</button>{PROFILE_COSMETICS.filter((item) => item.kind === 'nickname' && (hub.profileCosmetics ?? []).includes(item.id)).map((item) => <button className={nicknameStyle === item.id ? 'active' : ''} key={item.id} onClick={() => equipCosmetic(item.id)} style={{ '--cosmetic-accent': item.accent } as CSSProperties}><NicknameText name={item.name} styleId={item.id} /></button>)}</div><div className="v26-nickname-equipped-preview"><small>다른 플레이어에게도 이렇게 표시됩니다</small><NicknameText name={hub.profile.display_name} styleId={nicknameStyle} /></div></div>
        {message && <p className="inline-message">{message}</p>}
        <button className="primary-button" onClick={save}>프로필 설정 저장</button>
      </section>
    </div>
  );
}


const CHAT_EMOTE_PATTERN = /:([a-z0-9_]+):/g;
const CHAT_RENDER_LIMIT = 36;
const CHAT_ANIMATED_SKIN_LIMIT = 12;

function renderChatBody(body: string, onMediaLoad?: () => void) {
  const nodes: any[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  CHAT_EMOTE_PATTERN.lastIndex = 0;
  while ((match = CHAT_EMOTE_PATTERN.exec(body)) !== null) {
    const [token, emoteId] = match;
    if (match.index > lastIndex) nodes.push(<span key={`text-${lastIndex}`}>{body.slice(lastIndex, match.index)}</span>);
    const emote = V34_BATTLE_EMOTE_BY_ID[emoteId];
    if (emote) nodes.push(<span className="chat-inline-emote" key={`emote-${match.index}`} title={emote.name}><img src={emote.asset} alt={emote.name} decoding="async" onLoad={onMediaLoad} /></span>);
    else nodes.push(<span key={`token-${match.index}`}>{token}</span>);
    lastIndex = match.index + token.length;
  }
  if (lastIndex < body.length) nodes.push(<span key={`tail-${lastIndex}`}>{body.slice(lastIndex)}</span>);
  return nodes.length ? nodes : body;
}

function ChatDrawer({ open, roomId, onClose, profile, emoteIds = [], onUnread }: { open: boolean; roomId?: string; onClose: () => void; profile: Profile; emoteIds?: string[]; onUnread?: () => void }) {

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatSkins, setChatSkins] = useState<Record<string, ChatSkinProfile>>({
    [profile.user_id]: { user_id: profile.user_id, profile_theme: profile.profile_theme, profile_frame: profile.profile_frame },
  });
  const chatSkinsRef = useRef<Record<string, ChatSkinProfile>>({
    [profile.user_id]: { user_id: profile.user_id, profile_theme: profile.profile_theme, profile_frame: profile.profile_frame },
  });
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [emotePickerOpen, setEmotePickerOpen] = useState(false);
  const ownedChatEmotes = useMemo(() => emoteIds.map((emoteId) => V34_BATTLE_EMOTE_BY_ID[emoteId]).filter(Boolean), [emoteIds]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const stickChatToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
    const scroller = bottomRef.current?.parentElement;
    if (!scroller) return;
    scroller.scrollTo({ top: scroller.scrollHeight, behavior });
  }, []);
  const openRef = useRef(open);
  const onUnreadRef = useRef(onUnread);
  const table = roomId ? 'eclipse_room_messages' : 'eclipse_global_messages';

  useEffect(() => { openRef.current = open; }, [open]);
  useEffect(() => { onUnreadRef.current = onUnread; }, [onUnread]);
  useEffect(() => {
    const own = { user_id: profile.user_id, profile_theme: profile.profile_theme, profile_frame: profile.profile_frame };
    chatSkinsRef.current = { ...chatSkinsRef.current, [profile.user_id]: own };
    setChatSkins((current) => ({ ...current, [profile.user_id]: own }));
  }, [profile.user_id, profile.profile_theme, profile.profile_frame]);

  async function ensureChatSkins(userIds: string[]) {
    const missing = [...new Set(userIds)].filter((id) => id && !chatSkinsRef.current[id]);
    if (!missing.length) return;
    const { data } = await supabase.from('eclipse_profiles').select('user_id,profile_theme,profile_frame').in('user_id', missing);
    if (!data?.length) return;
    const additions = Object.fromEntries((data as ChatSkinProfile[]).map((item) => [item.user_id, item]));
    chatSkinsRef.current = { ...chatSkinsRef.current, ...additions };
    setChatSkins((current) => ({ ...current, ...additions }));
  }

  useEffect(() => {
    let alive = true;
    async function load() {
      const cutoff = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      if (!roomId) await supabase.rpc('eclipse_cleanup_global_messages_v25');
      let query = supabase.from(table).select('*').order('created_at', { ascending: false }).limit(CHAT_RENDER_LIMIT);
      if (roomId) query = query.eq('room_id', roomId);
      else query = query.gte('created_at', cutoff);
      const { data } = await query;
      const loaded = ((data ?? []) as ChatMessage[]).reverse();
      if (alive) setMessages(loaded);
      void ensureChatSkins(loaded.map((message) => message.user_id));
    }
    load();
    const channel = supabase
      .channel(`chat-${table}-${roomId ?? 'global'}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table, ...(roomId ? { filter: `room_id=eq.${roomId}` } : {}) }, (payload: any) => {
        const next = payload.new as ChatMessage;
        if (!roomId && new Date(next.created_at).getTime() < Date.now() - 30 * 60 * 1000) return;
        void ensureChatSkins([next.user_id]);
        setMessages((current) => [...current.slice(-(CHAT_RENDER_LIMIT - 1)), next]);
        if (next.user_id !== profile.user_id && !openRef.current) onUnreadRef.current?.();
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
  }, [roomId, table, profile.user_id]);

  useEffect(() => {
    if (!open) return undefined;
    stickChatToBottom(messages.length > 1 ? 'smooth' : 'auto');
    const frame = window.requestAnimationFrame(() => stickChatToBottom('auto'));
    const timers = [80, 220, 520].map((delay) => window.setTimeout(() => stickChatToBottom('auto'), delay));
    return () => {
      window.cancelAnimationFrame(frame);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [messages.length, open, stickChatToBottom]);

  async function send(event: FormEvent) {
    event.preventDefault();
    const message = input.trim();
    if (!message) return;
    setInput(''); setError('');
    try {
      await api(roomId ? 'send_room_message' : 'send_global_message', roomId ? { roomId, message } : { message });
    } catch (reason) { setError(reason instanceof Error ? reason.message : '전송 실패'); }
  }

  function insertChatEmote(emoteId: string) {
    const token = `:${emoteId}:`;
    setInput((current) => {
      const needsSpace = current.length > 0 && !/\s$/.test(current);
      const next = `${current}${needsSpace ? ' ' : ''}${token}`;
      return next.slice(0, 180);
    });
    setEmotePickerOpen(false);
  }

  return (
    <aside className={`chat-drawer ${open ? 'open' : ''}`}>
      <header><div><span>{roomId ? 'ROOM CHAT' : 'GLOBAL CHAT'}</span><h3>{roomId ? '결투방 채팅' : '전체 채팅'}</h3>{!roomId && <small>최근 30분 메시지만 보관됩니다.</small>}</div><button onClick={onClose}>×</button></header>
      <div className="chat-messages">
        {messages.length === 0 && <div className="empty-state"><span>···</span><p>첫 메시지를 남겨보세요.</p></div>}
        {messages.map((message, messageIndex) => {
          const skin = chatSkins[message.user_id];
          return <div className={`chat-message v31-social-skin theme-${skin?.profile_theme ?? 'bg_default'} frame-${skin?.profile_frame ?? 'frame_default'} ${message.user_id === profile.user_id ? 'mine' : ''}`} key={message.id}>
            {messageIndex >= messages.length - CHAT_ANIMATED_SKIN_LIMIT && <ProfileFrameFX frameId={skin?.profile_frame} />}
            <b><NicknameText name={message.display_name} styleId={message.nickname_style} /></b>
            <div className="chat-rich-body">{renderChatBody(message.body, () => stickChatToBottom('auto'))}</div>
            <small>{new Date(message.created_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}</small>
          </div>;
        })}
        <div ref={bottomRef} />
      </div>
      {ownedChatEmotes.length > 0 && <div className="chat-emote-toolbar">
        <button type="button" className={`chat-emote-toggle ${emotePickerOpen ? 'active' : ''}`} onClick={() => setEmotePickerOpen((value) => !value)}>이모티콘</button>
        <small>보유 감정표현은 채팅에도 사용할 수 있습니다.</small>
      </div>}
      {ownedChatEmotes.length > 0 && emotePickerOpen && <div className="chat-emote-picker">{ownedChatEmotes.map((item) => <button type="button" key={item.id} onClick={() => insertChatEmote(item.id)} title={item.name}><img src={item.asset} alt={item.name} /><span>{item.name}</span></button>)}</div>}
      {error && <p className="chat-error">{error}</p>}
      <form onSubmit={send}><input value={input} onChange={(event: ChangeEvent<HTMLInputElement>) => setInput(event.target.value)} maxLength={180} placeholder={ownedChatEmotes.length > 0 ? '메시지 또는 :이모티콘: 입력' : '메시지 입력'} /><button>전송</button></form>
    </aside>
  );
}

function duelEventLabel(event: VisualEvent): string {
  if (event.kind === 'turn') return '턴 시작';
  if (event.kind === 'summon') return '일반 소환';
  if (event.kind === 'special' && event.vfx === 'execution-scythe') return '처형';
  if (event.kind === 'special' && event.vfx === 'sweep-volley') return '전체공격';
  if (event.kind === 'special' && (event.vfx === 'legendary-fusion-choice' || event.vfx === 'legendary-evolution-choice')) return '전설 선택 효과';
  if (event.kind === 'special') return '특수 소환';
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

function measuredDuelPoint(ownerId: string | undefined, zone: number | undefined, row: 'unit' | 'leader', fallback: DuelPoint): DuelPoint {
  if (typeof document === 'undefined' || !ownerId) return fallback;
  const root = document.querySelector<HTMLElement>('.v18-duel-screen');
  if (!root) return fallback;
  let target: HTMLElement | undefined;
  if (row === 'leader') {
    target = Array.from(root.querySelectorAll<HTMLElement>('[data-duel-leader-owner]')).find((node) => node.dataset.duelLeaderOwner === ownerId);
  } else {
    target = Array.from(root.querySelectorAll<HTMLElement>('[data-duel-unit-owner]')).find((node) => node.dataset.duelUnitOwner === ownerId && Number(node.dataset.index ?? -1) === Number(zone ?? -1));
  }
  if (!target) return fallback;
  const rootRect = root.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (rootRect.width <= 0 || rootRect.height <= 0 || targetRect.width <= 0 || targetRect.height <= 0) return fallback;
  const x = ((targetRect.left + targetRect.width / 2 - rootRect.left) / rootRect.width) * 100;
  const y = ((targetRect.top + targetRect.height / 2 - rootRect.top) / rootRect.height) * 100;
  return { x: Math.max(1, Math.min(99, x)), y: Math.max(1, Math.min(99, y)) };
}

function duelEventPoints(event: VisualEvent, userId: string): { source: DuelPoint; target: DuelPoint } {
  const actorId = event.ownerId;
  const targetId = event.targetOwnerId ?? event.ownerId;
  if (event.kind === 'attack') {
    const sourceFallback = duelZonePoint(actorId, userId, event.sourceZone, 'unit');
    const targetFallback = event.targetZone !== undefined ? duelZonePoint(targetId, userId, event.targetZone, 'unit') : duelZonePoint(targetId, userId, undefined, 'leader');
    return {
      source: measuredDuelPoint(actorId, event.sourceZone, 'unit', sourceFallback),
      target: measuredDuelPoint(targetId, event.targetZone, event.targetZone !== undefined ? 'unit' : 'leader', targetFallback),
    };
  }
  if (event.kind === 'heal') {
    const sourceFallback = event.sourceZone !== undefined ? duelZonePoint(actorId, userId, event.sourceZone, 'unit') : duelZonePoint(actorId, userId, undefined, 'leader');
    const source = event.sourceZone !== undefined ? measuredDuelPoint(actorId, event.sourceZone, 'unit', sourceFallback) : measuredDuelPoint(actorId, undefined, 'leader', sourceFallback);
    const healTargetZone = event.targetZone ?? (event.vfx === 'tactical-beast-repair' ? event.sourceZone : undefined);
    const targetFallback = healTargetZone !== undefined ? duelZonePoint(targetId, userId, healTargetZone, 'unit') : duelZonePoint(targetId, userId, undefined, 'leader');
    return { source, target: healTargetZone !== undefined ? measuredDuelPoint(targetId, healTargetZone, 'unit', targetFallback) : measuredDuelPoint(targetId, undefined, 'leader', targetFallback) };
  }
  if (event.kind === 'core' || event.kind === 'energy') {
    const source = event.sourceZone !== undefined ? duelZonePoint(actorId, userId, event.sourceZone, 'unit') : duelZonePoint(actorId, userId, undefined, 'leader');
    return { source, target: duelZonePoint(targetId, userId, undefined, 'leader') };
  }
  if (event.kind === 'spell') {
    const source = duelZonePoint(actorId, userId, undefined, 'hand');
    if (event.targetZone !== undefined) {
      const fallback = duelZonePoint(targetId, userId, event.targetZone, 'unit');
      return { source, target: measuredDuelPoint(targetId, event.targetZone, 'unit', fallback) };
    }
    const leaderOwner = event.targetOwnerId;
    const fallback = duelZonePoint(leaderOwner ?? (actorId === userId ? '__opponent__' : userId), userId, undefined, 'leader');
    return { source, target: leaderOwner ? measuredDuelPoint(leaderOwner, undefined, 'leader', fallback) : fallback };
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
  const targetFallback = duelZonePoint(targetId, userId, event.targetZone, 'unit');
  const target = event.targetZone !== undefined && (event.kind === 'destroy' || event.kind === 'defense' || event.kind === 'buff')
    ? measuredDuelPoint(targetId, event.targetZone, 'unit', targetFallback)
    : targetFallback;
  return { source: { x: 50, y: 50 }, target };
}


type AttackCinematicStyle = 'slash' | 'bow' | 'beam' | 'dive' | 'scatter' | 'crush' | 'pulse' | 'bite' | 'lance' | 'whip' | 'claw' | 'cannon' | 'arcane' | 'chrono' | 'phantom';

type AttackCinematicProfile = {
  signature: string;
  style: AttackCinematicStyle;
  label: string;
  finisher: string;
  marker: string;
  accent: string;
  subAccent: string;
  legendary: boolean;
};

const LEGENDARY_ATTACK_PROFILES: Record<string, Omit<AttackCinematicProfile, 'legendary'>> = {
  unit_crownless_titan: { signature: 'crownless-titan', style: 'crush', label: '거인의 왕국 분쇄', finisher: 'COLOSSAL IMPACT', marker: '♜', accent: '#d6e2ee', subAccent: '#8aa2b6' },
  unit_star_devourer: { signature: 'star-devourer', style: 'bite', label: '별을 삼키는 포식', finisher: 'ECLIPSE MAW', marker: '✶', accent: '#8f7dff', subAccent: '#f04fff' },
  unit_dawn_seraph: { signature: 'dawn-seraph', style: 'dive', label: '광익 강습', finisher: 'SERAPH DESCENT', marker: '✦', accent: '#ffd76e', subAccent: '#fff7c7' },
  fusion_eclipse_chimera: { signature: 'eclipse-chimera', style: 'claw', label: '일식 교차난격', finisher: 'ECLIPSE REND', marker: '☯', accent: '#7ee7ff', subAccent: '#ffc46a' },
  evolution_rift_alpha: { signature: 'rift-alpha', style: 'claw', label: '균열 추격난무', finisher: 'RIFT REND', marker: '✧', accent: '#bd6dff', subAccent: '#5bc8ff' },
  unit_v8_solar_09: { signature: 'ancient-dawn-guardian', style: 'slash', label: '여명 수호검무', finisher: 'SUN HALO CLEAVE', marker: '☀', accent: '#ffb14d', subAccent: '#fff2a1' },
  unit_v8_lunar_06: { signature: 'silver-mirror-knight', style: 'lance', label: '은월 반사창', finisher: 'MOON MIRROR LANCE', marker: '☾', accent: '#8aa7ff', subAccent: '#e6ecff' },
  unit_v8_storm_03: { signature: 'abyss-storm-hawk', style: 'dive', label: '폭풍매 급강하', finisher: 'THUNDER TALON DIVE', marker: 'ϟ', accent: '#5ce6ff', subAccent: '#c7fbff' },
  unit_v8_verdant_19: { signature: 'jade-sky-guardian', style: 'crush', label: '비취 천공돌진', finisher: 'JADE SKY RAM', marker: '❈', accent: '#7fe5a2', subAccent: '#d7ffe3' },
  unit_v8_void_16: { signature: 'night-executor', style: 'slash', label: '서약의 야영참격', finisher: 'NIGHT OATH EXECUTION', marker: '◈', accent: '#b06cff', subAccent: '#ff7ab8' },
  unit_v8_neutral_13: { signature: 'alloy-enforcer', style: 'crush', label: '합금 심판파쇄', finisher: 'ALLOY VERDICT', marker: '◇', accent: '#c7d2dc', subAccent: '#7de4ff' },
  fusion_v8_01: { signature: 'solar-resonance-dragon', style: 'beam', label: '천식 공명포효', finisher: 'SOLAR RESONANCE ROAR', marker: '☯', accent: '#ffb155', subAccent: '#6df6ff' },
  fusion_v8_05: { signature: 'lunar-abyss-witch', style: 'arcane', label: '월식 심연주술', finisher: 'ABYSSAL MOON CURSE', marker: '☯', accent: '#7d83ff', subAccent: '#f668ff' },
  fusion_v8_09: { signature: 'crystal-overlord', style: 'scatter', label: '무광 수정난사', finisher: 'CRYSTAL BARRAGE', marker: '☯', accent: '#82f3ff', subAccent: '#ffffff' },
  fusion_v8_13: { signature: 'silver-saint', style: 'arcane', label: '은정 성역심판', finisher: 'SILVER SANCTIFY', marker: '☯', accent: '#f6f8ff', subAccent: '#9fe8ff' },
  fusion_v8_17: { signature: 'abyss-enforcer', style: 'crush', label: '결정 심연낙하', finisher: 'VOID CRUSH DECREE', marker: '☯', accent: '#9f96ff', subAccent: '#5ae4ff' },
  fusion_v8_20: { signature: 'verdant-sungod', style: 'dive', label: '녹광 태양돌격', finisher: 'SOLAR WILD CHARGE', marker: '☯', accent: '#92f39d', subAccent: '#ffd15d' },
  evolution_v8_06: { signature: 'eternal-guardian', style: 'crush', label: '이터널 방벽격파', finisher: 'ETERNAL SHIELD BREAK', marker: '✧', accent: '#dfe8f6', subAccent: '#89a7c8' },
  evolution_v8_12: { signature: 'prism-dancer', style: 'phantom', label: '프리즘 윤무참', finisher: 'PRISM WALTZ', marker: '✧', accent: '#7dd8ff', subAccent: '#ffd6ff' },
  evolution_v8_18: { signature: 'crystal-overlord-evo', style: 'beam', label: '오버로드 관통광', finisher: 'OVERLOAD LANCER', marker: '✧', accent: '#80f4ff', subAccent: '#dfffff' },
  evolution_v8_20: { signature: 'dream-recorder', style: 'phantom', label: '몽환 기록파편', finisher: 'DREAM FRACTURE', marker: '✧', accent: '#a18fff', subAccent: '#f2d4ff' },
};

const ATTACK_VFX_STYLE: Record<string, { style: AttackCinematicStyle; label: string; finisher: string }> = {
  'solar-slash': { style: 'slash', label: '태양 검격', finisher: 'SOLAR SLASH' },
  'solar-cross': { style: 'slash', label: '성광 교차참', finisher: 'SOLAR CROSS' },
  'crescent-cut': { style: 'slash', label: '초승달 베기', finisher: 'CRESCENT CUT' },
  'lightning-lance': { style: 'lance', label: '뇌광 창격', finisher: 'LIGHTNING LANCE' },
  'vine-whip': { style: 'whip', label: '덩굴 채찍', finisher: 'VINE WHIP' },
  'void-lunge': { style: 'claw', label: '공허 돌진', finisher: 'VOID LUNGE' },
  'rift-rend': { style: 'claw', label: '균열 난격', finisher: 'RIFT REND' },
  'eclipse-maw': { style: 'bite', label: '일식 포식', finisher: 'ECLIPSE MAW' },
  'iron-impact': { style: 'crush', label: '장갑 충격', finisher: 'IRON IMPACT' },
  'sovereign-hammer': { style: 'crush', label: '황제 중격', finisher: 'SOVEREIGN HAMMER' },
  'prism-break': { style: 'scatter', label: '프리즘 파쇄', finisher: 'PRISM BREAK' },
  'crystal-forge': { style: 'scatter', label: '수정 파쇄', finisher: 'CRYSTAL BURST' },
  'phoenix-dive': { style: 'dive', label: '불사조 급강하', finisher: 'PHOENIX DIVE' },
  'metal-thunder': { style: 'cannon', label: '전격 포격', finisher: 'METAL THUNDER' },
  'rail-impact': { style: 'cannon', label: '레일 관통포', finisher: 'RAIL IMPACT' },
  'hydra-bloom': { style: 'bite', label: '히드라 연속포식', finisher: 'HYDRA MAW' },
  'lunar-script': { style: 'arcane', label: '월문 주술', finisher: 'LUNAR SCRIPT' },
};

const SERIES_ATTACK_STYLE: Partial<Record<SeriesId, { style: AttackCinematicStyle; label: string; finisher: string }>> = {
  luminaknights: { style: 'slash', label: '성휘 돌격', finisher: 'LUMINA STRIKE' },
  kaisergear: { style: 'cannon', label: '기갑 화력전개', finisher: 'KAISER FIRE' },
  eclipsion: { style: 'claw', label: '일식 공명격', finisher: 'ECLIPSE REND' },
  nocturne: { style: 'phantom', label: '월영 환상격', finisher: 'MIRAGE CUT' },
  arborian: { style: 'whip', label: '세계수 휘감기', finisher: 'ROOT LASH' },
  tempest_drive: { style: 'lance', label: '천뢰 고속창격', finisher: 'TEMPEST DRIVE' },
  abyss_reaper: { style: 'slash', label: '심연 수확참', finisher: 'ABYSS REAP' },
  primal_guardian: { style: 'claw', label: '원초 야수격', finisher: 'PRIMAL CLAW' },
  chronorium: { style: 'chrono', label: '시간축 절단', finisher: 'CHRONO BREAK' },
  arcana_protocol: { style: 'arcane', label: '마도식 발현', finisher: 'ARCANA CAST' },
  beastforge: { style: 'claw', label: '야수기갑 강습', finisher: 'BEASTFORGE RUSH' },
  phantom_carnival: { style: 'phantom', label: '환영 난무', finisher: 'PHANTOM ACT' },
  astral_armada: { style: 'cannon', label: '성해함대 포격', finisher: 'ASTRAL SALVO' },
};

function defaultAttackProfile(card: CardDefinition): AttackCinematicProfile {
  const byElement: Record<Element, { style: AttackCinematicStyle; label: string; finisher: string; marker: string; secondary: string }> = {
    solar: { style: 'slash', label: '태양 타격', finisher: 'SOLAR STRIKE', marker: '☀', secondary: '#fff1a8' },
    lunar: { style: 'arcane', label: '월광 타격', finisher: 'LUNAR STRIKE', marker: '☾', secondary: '#eaf0ff' },
    storm: { style: 'lance', label: '폭풍 타격', finisher: 'TEMPEST STRIKE', marker: 'ϟ', secondary: '#d4fbff' },
    verdant: { style: 'whip', label: '대지 타격', finisher: 'VERDANT STRIKE', marker: '❈', secondary: '#d9ffe3' },
    void: { style: 'claw', label: '공허 타격', finisher: 'VOID STRIKE', marker: '◈', secondary: '#ff8cc8' },
    neutral: { style: 'crush', label: '중립 타격', finisher: 'IRON STRIKE', marker: '◇', secondary: '#88d9ff' },
  };
  const base = byElement[card.element];
  return { signature: `card-${card.id.replace(/[^a-z0-9-]/gi, '-')}`, style: base.style, label: base.label, finisher: base.finisher, marker: card.sigil || base.marker, accent: card.seriesId ? SERIES_BY_ID[card.seriesId].accent : ELEMENT_ACCENT[card.element], subAccent: base.secondary, legendary: card.rarity === 'legendary' };
}

function attackMotionProfile(card: CardDefinition, eventVfx?: string): AttackCinematicProfile {
  const legendary = LEGENDARY_ATTACK_PROFILES[card.id];
  if (legendary) return { ...legendary, legendary: true };

  const base = defaultAttackProfile(card);
  const roleText = `${card.name} ${card.subtitle ?? ''}`.toLowerCase();
  const role = (style: AttackCinematicStyle, label: string, finisher: string): AttackCinematicProfile => ({ ...base, style, label, finisher });

  // Physical identity wins over series name. This prevents every Beastforge card from
  // biting just because the series itself contains the word "beast".
  if (/(사냥개|울프|wolf|hound|팽|fang|바이트|bite|레비아탄|leviathan)/i.test(roleText)) return role('bite', '교합 돌진', 'FANG BITE');
  if (/(타이거|재규어|라이온|그리즐리|클로|claw|predator|프레데터)/i.test(roleText)) return role('claw', '발톱 난격', 'CLAW REND');
  if (/(라이노|코뿔소|맘모스|베어|보어|멧돼지|베히모스|타이탄|거신|골렘|colossus|혼|horn)/i.test(roleText)) return role('crush', '중량 돌진', 'HEAVY CRUSH');
  if (/(호크|hawk|매|피닉스|phoenix|세라프|seraph|와이번|wyvern|드라군|dragoon)/i.test(roleText)) return role('dive', '공중 강습', 'AERIAL DIVE');
  if (/(아처|archer|궁수|보우|bow|석궁|crossbow|레인저|ranger)/i.test(roleText)) return role('bow', '활 시위 사격', 'ARROW SHOT');
  if (/(거너|gunner|포병|캐논|cannon|프리깃|frigate|드레드노트|dreadnought|디스트로이어|destroyer|캐리어|carrier|플래그십|함|광자|shot|샷|메카닉|mechanic|엔지니어|engineer|오퍼레이터|operator|파일럿|pilot)/i.test(roleText)) return role('cannon', '원거리 포격', 'RANGED SALVO');
  if (/(랜서|lancer|lance|창기병|창격|스피어|spear)/i.test(roleText)) return role('lance', '관통 창격', 'LANCE THRUST');
  if (/(세이버|saber|블레이드|blade|검|기사|knight|리퍼|reaper|집행관|executor|브레이커)/i.test(roleText)) return role('slash', '무장 참격', 'BLADE STRIKE');
  if (/(피에로|pierrot|마임|mime|저글러|juggler|퍼펫|puppet|마리오네트|marionette|클라운|clown|일루저니스트|illusion|팬텀|phantom)/i.test(roleText)) return role('phantom', '환영 교란공격', 'PHANTOM STRIKE');
  if (/(위버|weaver|메이지|mage|프리스트|priest|오라클|oracle|스크라이브|scribe|위치|witch|마기스터|magister|클레릭|cleric|비숍|bishop)/i.test(roleText)) {
    if (/(시간|time|chrono|크로노|hour|리와인드|rewind)/i.test(roleText)) return role('chrono', '시간축 간섭', 'CHRONO BREAK');
    return role('arcane', '마도식 발현', 'ARCANE BURST');
  }

  const authoredVfx = eventVfx && card.vfx?.attack === eventVfx ? ATTACK_VFX_STYLE[eventVfx] : undefined;
  if (authoredVfx) return { ...base, ...authoredVfx };
  const series = card.seriesId ? SERIES_ATTACK_STYLE[card.seriesId] : undefined;
  if (series) return { ...base, ...series };
  const fallbackVfx = eventVfx ? ATTACK_VFX_STYLE[eventVfx] : undefined;
  if (fallbackVfx) return { ...base, ...fallbackVfx };
  return base;
}


type SpellCinematicStyle = 'flash' | 'slash' | 'lance' | 'lightning' | 'fire' | 'void' | 'heal' | 'growth' | 'shield' | 'draw' | 'energy' | 'summon' | 'arcane';

type SpellCinematicProfile = {
  style: SpellCinematicStyle;
  label: string;
  marker: string;
};

function spellMotionProfile(card: CardDefinition): SpellCinematicProfile {
  const name = `${card.name} ${card.subtitle ?? ''}`.toLowerCase();
  const effect = card.effect?.kind;
  const marker = card.sigil || '✦';
  const profile = (style: SpellCinematicStyle, label: string): SpellCinematicProfile => ({ style, label, marker });

  // Exact authored identity wins. "섬광탄" should look like a localized flash burst,
  // not a full-screen color wash or a generic lightning beam.
  if (card.id === 'spell_spark_bolt' || /섬광탄/.test(name)) return profile('flash', '집속 섬광 폭발');
  if (/(검무|참격|절단|베기|검격|칼날|blade|slash|cleave|saber)/i.test(name)) return profile('slash', '마력 참격');
  if (/(공허의 창|태양창|천둥창|창격|lance|spear)/i.test(name)) return profile('lance', '주문 창격');
  if (/(번개|낙뢰|전격|천둥|뇌광|뇌운|전류|lightning|thunder|bolt)/i.test(name)) return profile('lightning', '낙뢰 방전');
  if (/(초신성|폭발|홍련|불꽃|화염|성화|백열|태양섬광|supernova|flare|blaze|flame)/i.test(name)) return profile('fire', '열광 폭발');

  if (effect === 'heal_core' || effect === 'heal_unit') return profile('heal', '회복 파동');
  if (effect === 'shield_unit' || effect === 'buff_unit' || effect === 'ready_unit' || effect === 'swap_stats') return profile('shield', '강화 각인');
  if (effect === 'draw' || effect === 'reweave_hand' || effect === 'draw_if_outnumbered' || effect === 'sacrifice_draw' || effect === 'tutor_card' || effect === 'tutor_series_card' || effect === 'recover_any_grave' || effect === 'mill_draw') return profile('draw', '지식 전개');
  if (effect === 'gain_energy' || effect === 'increase_energy_max' || effect === 'end_turn_next_energy' || effect === 'banish_own_grave_energy') return profile('energy', effect === 'increase_energy_max' ? '에너지 용량 확장' : '에너지 집속');
  if (effect === 'summon_token' || effect === 'recruit_unit' || effect === 'revive_unit' || effect === 'recover_grave_unit') return profile('summon', '소환식 전개');

  if (effect === 'freeze_unit') return profile('arcane', '행동 봉인');
  if (/(성장|숲|씨앗|덩굴|꽃잎|비취|생명|worldroot|bloom|vine|seed)/i.test(name) || card.element === 'verdant') return profile('growth', '생명맥 발아');
  if (/(공허|심연|월식|망각|붕괴|void|abyss|eclipse)/i.test(name) || card.element === 'void') return profile('void', '공허 균열');

  if (effect === 'damage_unit' || effect === 'damage_core' || effect === 'aoe_enemy' || effect === 'damage_draw_if_destroyed' || effect === 'destroy_weak' || effect === 'break_shield_damage') {
    if (card.element === 'storm') return profile('lightning', '전격 방출');
    if (card.element === 'solar') return profile('fire', '태양 폭발');
    return profile('arcane', '마력 충격');
  }
  return profile('arcane', '주문 발현');
}

type SummonCinematicStyle = 'radiance' | 'forge' | 'rift' | 'moon' | 'bloom' | 'storm' | 'abyss' | 'beast' | 'chrono' | 'arcane' | 'carnival' | 'armada' | 'phoenix' | 'eclipse' | 'neutral';

type SummonCinematicProfile = {
  style: SummonCinematicStyle;
  label: string;
  marker: string;
  accent: string;
  secondary: string;
};

const SUMMON_VFX_STYLE: Record<string, { style: SummonCinematicStyle; label: string }> = {
  'dawn-pillar': { style: 'radiance', label: '성광 강림' },
  'sunburst-seal': { style: 'radiance', label: '태양 인장 전개' },
  'citadel-ascend': { style: 'forge', label: '기갑 프레임 전개' },
  'crystal-forge': { style: 'forge', label: '수정 프레임 조립' },
  'rift-tear': { style: 'rift', label: '균열 개방' },
  'void-vortex': { style: 'abyss', label: '공허 소용돌이 현현' },
  'eclipse-convergence': { style: 'eclipse', label: '일식 공명 현현' },
  'moon-ripple': { style: 'moon', label: '월광 파문 현현' },
  'lunar-script': { style: 'moon', label: '월문 소환식' },
  'worldroot-rise': { style: 'bloom', label: '세계수 발아' },
  'bloom-circle': { style: 'bloom', label: '생장진 개화' },
  'grave-bloom': { style: 'abyss', label: '심연 묘화 현현' },
  'storm-drop': { style: 'storm', label: '낙뢰 강하' },
  'magnet-storm': { style: 'storm', label: '전자폭풍 전개' },
  'phoenix-ascend': { style: 'phoenix', label: '불사조 비상' },
  'alpha-mutation': { style: 'beast', label: '야수 변이 각성' },
  'prism-script': { style: 'arcane', label: '프리즘 소환식' },
};

const SERIES_SUMMON_STYLE: Partial<Record<SeriesId, { style: SummonCinematicStyle; label: string }>> = {
  luminaknights: { style: 'radiance', label: '성휘전대 출격' },
  kaisergear: { style: 'forge', label: '황제기갑 프레임 조립' },
  eclipsion: { style: 'eclipse', label: '일식공명 현현' },
  nocturne: { style: 'moon', label: '월영 환상 현현' },
  arborian: { style: 'bloom', label: '세계수권속 발아' },
  tempest_drive: { style: 'storm', label: '천뢰기동 강하' },
  abyss_reaper: { style: 'abyss', label: '심연포식 현현' },
  primal_guardian: { style: 'beast', label: '원초 수호령 현현' },
  chronorium: { style: 'chrono', label: '시간축 동기화' },
  arcana_protocol: { style: 'arcane', label: '마도규약 소환식' },
  beastforge: { style: 'beast', label: '야수기갑 기동' },
  phantom_carnival: { style: 'carnival', label: '몽환무대 등장' },
  astral_armada: { style: 'armada', label: '성해함대 워프 인' },
};

const KNOWN_SUMMON_VFX = new Set<string>([
  ...Object.keys(SUMMON_VFX_STYLE),
  'deck-recruit', 'grave-revival', 'mirror-incarnation', 'series-rebirth',
]);

function isSummonPresentation(event: VisualEvent, card?: CardDefinition): boolean {
  if (event.kind === 'summon') return true;
  if (event.kind !== 'special' || !card) return false;
  return Boolean(event.vfx && KNOWN_SUMMON_VFX.has(event.vfx));
}

function summonMotionProfile(card: CardDefinition, eventVfx?: string): SummonCinematicProfile {
  const text = `${card.name} ${card.subtitle ?? ''}`.toLowerCase();
  const secondaryByElement: Record<Element, string> = { solar: '#fff1a8', lunar: '#eaf0ff', storm: '#d4fbff', verdant: '#d9ffe3', void: '#ffb0e3', neutral: '#e4f3ff' };
  const base = { marker: card.sigil || '✦', accent: card.seriesId ? SERIES_BY_ID[card.seriesId].accent : ELEMENT_ACCENT[card.element], secondary: secondaryByElement[card.element] };

  if (/(시간|time|chrono|크로노|hour|리와인드|rewind)/i.test(text)) return { ...base, style: 'chrono', label: '시간축 동기화' };
  if (/(피닉스|phoenix|불사조)/i.test(text)) return { ...base, style: 'phoenix', label: '불사조 비상' };
  if (/(사냥개|울프|wolf|hound|타이거|재규어|라이온|베어|라이노|맘모스|보어|그리즐리|프레데터|베히모스|레비아탄|야수)/i.test(text)) return { ...base, style: 'beast', label: '야수 코어 현현' };
  if (/(거너|포병|프리깃|드레드노트|디스트로이어|캐리어|플래그십|함대|함선)/i.test(text)) return { ...base, style: 'armada', label: '전술 워프 인' };
  if (/(피에로|마임|저글러|퍼펫|마리오네트|클라운|일루저니스트|팬텀)/i.test(text)) return { ...base, style: 'carnival', label: '환영무대 등장' };
  if (/(메이지|프리스트|오라클|스크라이브|위치|마기스터|룬|마도|arcana)/i.test(text)) return { ...base, style: 'arcane', label: '마도진 현현' };

  const authoredVfx = eventVfx && card.vfx?.summon === eventVfx ? SUMMON_VFX_STYLE[eventVfx] : undefined;
  if (authoredVfx) return { ...base, ...authoredVfx };
  const series = card.seriesId ? SERIES_SUMMON_STYLE[card.seriesId] : undefined;
  if (series) return { ...base, ...series };
  const fallbackVfx = eventVfx ? SUMMON_VFX_STYLE[eventVfx] : undefined;
  if (fallbackVfx) return { ...base, ...fallbackVfx };
  return { ...base, style: 'neutral', label: '전장 현현' };
}

type ExtraCinematicStyle = 'convergence' | 'prism' | 'storm' | 'bloom' | 'forge' | 'eclipse' | 'tide' | 'star' | 'ascension' | 'wing' | 'crown' | 'rift' | 'mirror' | 'thunder' | 'root' | 'requiem';

type ExtraCinematicProfile = {
  signature: string;
  style: ExtraCinematicStyle;
  label: string;
  finisher: string;
  rune: string;
  accent: string;
  secondary: string;
  angle: string;
  speed: string;
  scale: string;
  legendary: boolean;
};

const FUSION_EXTRA_STYLES: Array<{ style: ExtraCinematicStyle; label: string; finisher: string }> = [
  { style: 'convergence', label: '공명 집속', finisher: 'RESONANCE CONVERGENCE' },
  { style: 'prism', label: '프리즘 결속', finisher: 'PRISMATIC BIND' },
  { style: 'storm', label: '뇌광 합주', finisher: 'TEMPEST SYNCHRONY' },
  { style: 'bloom', label: '생명 개화', finisher: 'VERDANT GENESIS' },
  { style: 'forge', label: '성철 제련', finisher: 'ASTRAL FORGE' },
  { style: 'eclipse', label: '식광 교차', finisher: 'ECLIPSE CROSSING' },
  { style: 'tide', label: '월영 조류', finisher: 'LUNAR TIDEBIND' },
  { style: 'star', label: '성해 집성', finisher: 'STELLAR ASSEMBLY' },
];

const EVOLUTION_EXTRA_STYLES: Array<{ style: ExtraCinematicStyle; label: string; finisher: string }> = [
  { style: 'ascension', label: '계승 각성', finisher: 'INHERITED ASCENSION' },
  { style: 'wing', label: '광익 전개', finisher: 'CELESTIAL AWAKENING' },
  { style: 'crown', label: '황관 계승', finisher: 'SOVEREIGN RISE' },
  { style: 'rift', label: '균열 돌파', finisher: 'RIFT BREAKTHROUGH' },
  { style: 'mirror', label: '거울 전승', finisher: 'MIRROR SUCCESSION' },
  { style: 'thunder', label: '뇌광 승계', finisher: 'THUNDER INHERITANCE' },
  { style: 'root', label: '근원 발아', finisher: 'ROOTBOUND EVOLUTION' },
  { style: 'requiem', label: '심연 진혼', finisher: 'ABYSSAL REQUIEM' },
];

const SERIES_FUSION_CINEMATIC: Partial<Record<SeriesId, { style: ExtraCinematicStyle; label: string; finisher: string }>> = {
  luminaknights: { style: 'convergence', label: '성휘 합동공명', finisher: 'LUMINA CROSS' },
  kaisergear: { style: 'forge', label: '기갑 코어 결합', finisher: 'KAISER FORGE' },
  eclipsion: { style: 'eclipse', label: '일식 교차공명', finisher: 'ECLIPSE CONVERGENCE' },
  nocturne: { style: 'tide', label: '월영 몽환결속', finisher: 'NOCTURNE TIDEBIND' },
  arborian: { style: 'bloom', label: '세계수 생명융합', finisher: 'ARBORIAN GENESIS' },
  tempest_drive: { style: 'storm', label: '천뢰 동기공명', finisher: 'TEMPEST SYNCHRONY' },
  abyss_reaper: { style: 'eclipse', label: '심연 영혼결속', finisher: 'ABYSS CONVERGENCE' },
  primal_guardian: { style: 'bloom', label: '원초 생명공명', finisher: 'PRIMAL GENESIS' },
  chronorium: { style: 'prism', label: '시간축 중첩', finisher: 'CHRONO CONVERGENCE' },
  arcana_protocol: { style: 'prism', label: '마도식 중첩', finisher: 'ARCANA SYNTHESIS' },
  beastforge: { style: 'forge', label: '야수기갑 합금융합', finisher: 'BEASTFORGE ASSEMBLY' },
  phantom_carnival: { style: 'prism', label: '환영무대 중첩', finisher: 'PHANTOM FINALE' },
  astral_armada: { style: 'star', label: '성해함대 집성', finisher: 'ASTRAL ASSEMBLY' },
};

const SERIES_EVOLUTION_CINEMATIC: Partial<Record<SeriesId, { style: ExtraCinematicStyle; label: string; finisher: string }>> = {
  luminaknights: { style: 'wing', label: '성휘 영웅각성', finisher: 'LUMINA ASCENSION' },
  kaisergear: { style: 'crown', label: '황제기갑 승격', finisher: 'KAISER ASCENSION' },
  eclipsion: { style: 'rift', label: '균열 계승각성', finisher: 'ECLIPSE BREAKTHROUGH' },
  nocturne: { style: 'mirror', label: '월영 거울계승', finisher: 'NOCTURNE MIRROR' },
  arborian: { style: 'root', label: '세계수 근원진화', finisher: 'ARBORIAN ROOTRISE' },
  tempest_drive: { style: 'thunder', label: '천뢰 초가속승계', finisher: 'TEMPEST OVERDRIVE' },
  abyss_reaper: { style: 'requiem', label: '심연 진혼계승', finisher: 'ABYSSAL REQUIEM' },
  primal_guardian: { style: 'root', label: '원초 수호각성', finisher: 'PRIMAL AWAKENING' },
  chronorium: { style: 'mirror', label: '시간축 재기록', finisher: 'CHRONO REWRITE' },
  arcana_protocol: { style: 'mirror', label: '마도규약 승계', finisher: 'ARCANA SUCCESSION' },
  beastforge: { style: 'crown', label: '야수기갑 알파각성', finisher: 'BEASTFORGE ALPHA' },
  phantom_carnival: { style: 'mirror', label: '몽환 앙코르각성', finisher: 'PHANTOM ENCORE' },
  astral_armada: { style: 'wing', label: '성해함대 기함승격', finisher: 'ASTRAL ASCENSION' },
};

function stableCardHash(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function extraCinematicProfile(card: CardDefinition, kind: 'fusion' | 'evolution'): ExtraCinematicProfile {
  const hash = stableCardHash(`${kind}:${card.id}`);
  const styles = kind === 'fusion' ? FUSION_EXTRA_STYLES : EVOLUTION_EXTRA_STYLES;
  const seriesSelected = card.seriesId
    ? (kind === 'fusion' ? SERIES_FUSION_CINEMATIC[card.seriesId] : SERIES_EVOLUTION_CINEMATIC[card.seriesId])
    : undefined;
  const selected = seriesSelected ?? styles[hash % styles.length];
  const baseAccent = card.seriesId ? SERIES_BY_ID[card.seriesId].accent : ELEMENT_ACCENT[card.element];
  const extraSecondary: Record<Element, string> = { solar: '#ffe7a3', lunar: '#dce5ff', storm: '#b9f5ff', verdant: '#c9ffd8', void: '#e3b8ff', neutral: '#e2edf7' };
  const secondary = extraSecondary[card.element];
  const angle = `${(hash % 141) - 70}deg`;
  const speed = `${1.7 + ((hash >> 5) % 14) / 10}s`;
  const scale = `${0.90 + ((hash >> 9) % 17) / 100}`;
  return {
    signature: card.id.replace(/[^a-z0-9-]/gi, '-'),
    style: selected.style,
    label: selected.label,
    finisher: selected.finisher,
    rune: card.sigil || (kind === 'fusion' ? '☯' : '✧'),
    accent: baseAccent,
    secondary,
    angle,
    speed,
    scale,
    legendary: card.rarity === 'legendary',
  };
}

function DuelEffectLayer({ event, userId, profiles, drawCard, spectator = false }: { event: VisualEvent | null; userId: string; profiles: RoomProfile[]; drawCard?: CardDefinition; spectator?: boolean }) {
  if (!event) return null;
  const card = event.cardId ? CARD_BY_ID[event.cardId] : undefined;
  const attackProfile = event.kind === 'attack' && card ? attackMotionProfile(card, event.vfx) : undefined;
  const spellProfile = event.kind === 'spell' && card ? spellMotionProfile(card) : undefined;
  const summonPresentation = isSummonPresentation(event, card);
  const summonProfile = summonPresentation && card ? summonMotionProfile(card, event.vfx) : undefined;
  const extraProfile = card && (event.kind === 'fusion' || event.kind === 'evolution') ? extraCinematicProfile(card, event.kind) : undefined;
  const owner = profiles.find((profile) => profile.user_id === event.ownerId);
  const mine = event.ownerId === userId;
  const { source, target } = duelEventPoints(event, userId);
  const attackAngle = Math.atan2(target.y - source.y, target.x - source.x) * 180 / Math.PI;
  const usesCurvedAttackPath = Boolean(attackProfile && ['whip', 'phantom', 'chrono', 'arcane'].includes(attackProfile.style));
  const usesLinearAttackPath = Boolean(attackProfile && ['slash', 'bow', 'beam', 'lance', 'cannon'].includes(attackProfile.style));
  const particleCount = event.kind === 'fusion' || event.kind === 'evolution' ? 10 : event.kind === 'attack' ? 6 : event.kind === 'special' ? 8 : event.kind === 'core' || event.kind === 'destroy' ? 6 : 4;
  const fxStyle = {
    '--sx': `${source.x}%`, '--sy': `${source.y}%`, '--tx': `${target.x}%`, '--ty': `${target.y}%`, '--attack-angle': `${attackAngle}deg`,
    '--fx-accent': attackProfile?.accent ?? summonProfile?.accent ?? extraProfile?.accent ?? (card ? ELEMENT_ACCENT[card.element] : '#7ddcff'),
    '--fx-secondary': attackProfile?.subAccent ?? summonProfile?.secondary ?? extraProfile?.secondary ?? '#f7fbff',
    '--ritual-secondary': extraProfile?.secondary ?? '#f7fbff',
    '--ritual-angle': extraProfile?.angle ?? '0deg',
    '--ritual-speed': extraProfile?.speed ?? '2.4s',
    '--ritual-scale': extraProfile?.scale ?? '1',
  } as CSSProperties;
  const legendaryChoice = event.kind === 'special' && (event.vfx === 'legendary-fusion-choice' || event.vfx === 'legendary-evolution-choice');
  const executionTraitEvent = event.kind === 'special' && event.vfx === 'execution-scythe';
  const sweepTraitEvent = event.kind === 'special' && event.vfx === 'sweep-volley';
  const battleTraitEvent = executionTraitEvent || sweepTraitEvent;
  const showCardCutIn = Boolean(card && !legendaryChoice && !battleTraitEvent && (event.kind === 'spell' || (event.kind === 'special' && !summonPresentation)));
  const vfxClass = event.vfx ? `vfx-${event.vfx.replace(/[^a-z0-9-]/gi, '-')}` : 'vfx-generic';
  const sourceCards = (event.sourceCardIds ?? []).map((cardId) => CARD_BY_ID[cardId]).filter((candidate): candidate is CardDefinition => Boolean(candidate));
  const trapTrigger = card?.kind === 'trap' ? trapTriggerDescription(card.trapTrigger) : '';
  const trapEffect = card?.kind === 'trap' ? effectDescription(card.trapEffect, card.trapTrigger) : '';
  const extraTitle = event.kind === 'fusion' ? 'RESONANCE FUSION' : 'INHERIT ASCENSION';
  const extraKorean = event.kind === 'fusion' ? '공명 융합' : '계승 진화';
  const showHitStage = event.kind === 'defense' || event.kind === 'core' || event.kind === 'destroy';
  // Attack travel is rendered only by the dedicated attack cinematic.
  // Core/destroy resolution still gets its hit-stage shockwave, but no second dotted route line.
  const showGenericMotion = false;
  const hitLabel = event.kind === 'destroy'
    ? 'UNIT DESTROYED'
    : event.kind === 'core'
      ? 'DIRECT CORE HIT'
      : (event.shieldAmount ?? 0) > 0 && (event.healthAmount ?? 0) > 0
        ? 'BREAK & DAMAGE'
        : (event.shieldAmount ?? 0) > 0
          ? 'SHIELD IMPACT'
          : 'HIT CONFIRMED';
  const hitKorean = event.kind === 'destroy'
    ? (event.detail ?? '유닛이 파괴되었습니다.')
    : event.kind === 'core'
      ? (event.detail ?? '리더에게 직접 타격이 들어갔습니다.')
      : event.detail ?? '타격이 적중했습니다.';
  const hitAmountText = event.kind === 'defense'
    ? `${(event.shieldAmount ?? 0) > 0 ? `SHIELD -${event.shieldAmount}` : ''}${(event.shieldAmount ?? 0) > 0 && (event.healthAmount ?? 0) > 0 ? ' · ' : ''}${(event.healthAmount ?? 0) > 0 ? `HP -${event.healthAmount}` : ''}`
    : event.kind === 'core'
      ? `CORE -${event.amount ?? 0}`
      : card?.name ?? 'DESTROY';
  return (
    <div className={`v18-cinematic-layer kind-${event.kind} ${vfxClass} ${mine ? 'from-me' : 'from-opponent'} element-${card?.element ?? 'neutral'} rarity-${card?.rarity ?? 'common'}`} key={event.id} style={fxStyle} aria-live="polite">
      <span className="v22-cinematic-letterbox" aria-hidden="true" />
      {event.kind !== 'spell' && <span className="v22-screen-flash" aria-hidden="true" />}
      <span className="v22-element-particles" aria-hidden="true">{Array.from({ length: particleCount }, (_, index) => <i key={index} style={{ '--particle': index } as CSSProperties} />)}</span>
      {showGenericMotion && (
        <>
          <svg className="v18-motion-line" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line x1={source.x} y1={source.y} x2={target.x} y2={target.y} />
          </svg>
          <span className="v18-motion-orb" aria-hidden="true" />
          <span className="v18-impact-ring" aria-hidden="true" />
          <span className="v18-impact-flare" aria-hidden="true" />
        </>
      )}
      {(event.kind === 'destroy' || event.kind === 'core' || event.kind === 'defense') && <span className="v18-shard-field" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ '--piece': index } as CSSProperties} />)}</span>}

      {executionTraitEvent && (
        <div className="v39-execution-stage" aria-label="처형 특성 발동">
          <span className="v39-execution-target-ring" aria-hidden="true"><i /><i /><i /></span>
          <span className="v39-execution-scythe" aria-hidden="true"><i className="shaft" /><i className="grip" /><i className="blade" /></span>
          <div className="v39-execution-copy"><small>EXECUTION TRAIT</small><b>처형</b><span>{event.detail ?? '사신의 낫이 대상을 확정 파괴합니다.'}</span></div>
        </div>
      )}

      {sweepTraitEvent && (
        <div className="v39-sweep-stage" aria-label="전체공격 특성 발동">
          <span className="v39-sweep-wave" aria-hidden="true"><i /><i /><i /></span>
          <div className="v39-sweep-copy"><small>FULL FIELD STRIKE</small><b>전체공격</b><span>{event.detail ?? '적 전열 전체에 공격 피해를 적용합니다.'}</span></div>
        </div>
      )}

      {summonPresentation && card && summonProfile && (
        <div className={`v32m-summon-stage style-${summonProfile.style} ${card.seriesId ? `series-${card.seriesId}` : ''}`} aria-label={`${card.name} 소환`}>
          <span className="v32m-summon-backdrop" aria-hidden="true" />
          <span className="v32m-summon-ring ring-a" aria-hidden="true" />
          <span className="v32m-summon-ring ring-b" aria-hidden="true" />
          <span className="v32m-summon-motif" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ '--motif-index': index } as CSSProperties} />)}</span>
          <span className="v32m-summon-marker" aria-hidden="true">{summonProfile.marker}</span>
          <div className="v32m-summon-card">
            <CardIllustration card={card} hero />
            <span><small>{event.kind === 'special' ? 'SPECIAL SUMMON' : 'SUMMON'}</small><b>{card.name}</b><em>{summonProfile.label}</em></span>
          </div>
        </div>
      )}

      {event.kind === 'attack' && card && attackProfile && (
        <div className={`v31e-attack-stage style-${attackProfile.style} ${attackProfile.legendary ? 'legendary' : 'standard'} sig-${attackProfile.signature}`} aria-label={`${card.name} 공격 ${event.amount ?? 0}`}>
          <div className="v31e-attack-source-card">
            <CardIllustration card={card} hero />
            <span><small>{attackProfile.legendary ? 'LEGENDARY ATTACK' : spectator ? 'DUEL ATTACK' : mine ? 'YOUR ATTACK' : 'ENEMY ATTACK'}</small><b>{card.name}</b></span>
          </div>
          {(usesLinearAttackPath || usesCurvedAttackPath) && (
            <svg className="v32m-attack-vector v32v-single-route" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {usesCurvedAttackPath
                ? <path className="v32m-vector-curve" d={`M ${source.x} ${source.y} Q ${(source.x + target.x) / 2} ${Math.max(8, Math.min(92, (source.y + target.y) / 2 - 16))} ${target.x} ${target.y}`} />
                : <line className="v32m-vector-line main" x1={source.x} y1={source.y} x2={target.x} y2={target.y} />}
            </svg>
          )}
          <div className="v32-attack-avatar">
            <span className="v32-attack-avatar-mark">{attackProfile.marker}</span>
            <div>
              <small>{card.seriesId ? SERIES_BY_ID[card.seriesId].shortName : ELEMENT_LABEL[card.element]}</small>
              <b>{attackProfile.label}</b>
              <span>{attackProfile.finisher}</span>
            </div>
          </div>
          <div className="v31e-attack-power"><small>ATTACK</small><strong>{event.amount ?? '?'}</strong><span>{attackProfile.label}</span></div>
          <span className="v32-attack-weapon" aria-hidden="true"><i /><i /><i /><i /></span>
          {attackProfile.style === 'slash' && <span className="v32n-sword-fx" aria-hidden="true"><i className="blade" /><i className="guard" /><i className="grip" /><em /></span>}
          {attackProfile.style === 'bow' && <span className="v32n-bow-fx" aria-hidden="true"><i className="arc" /><i className="string" /><i className="arrow" /><em /></span>}
          {attackProfile.style === 'lance' && <span className="v32n-lance-fx" aria-hidden="true"><i className="shaft" /><i className="tip" /><em /></span>}
          {attackProfile.style === 'cannon' && <span className="v32n-cannon-fx" aria-hidden="true"><i /><em /></span>}
          <span className="v31e-target-reticle" aria-hidden="true"><i /><i /></span>
          <span className="v31e-impact-burst" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <i key={index} style={{ '--spark': index } as CSSProperties} />)}</span>
          <span className="v32-hitcall" aria-hidden="true"><b>{attackProfile.finisher}</b><small>{event.targetZone !== undefined ? 'TARGET LOCK' : 'DIRECT CORE'}</small></span>
          {attackProfile.style === 'bite' && (
            <span className="v32-bite-fx" aria-hidden="true">
              <i className="v32-bite-jaw upper">{Array.from({ length: 6 }, (_, index) => <b key={`u-${index}`} style={{ '--tooth': index } as CSSProperties} />)}</i>
              <i className="v32-bite-jaw lower">{Array.from({ length: 6 }, (_, index) => <b key={`l-${index}`} style={{ '--tooth': index } as CSSProperties} />)}</i>
              <em /><strong>CRUNCH</strong>
            </span>
          )}
        </div>
      )}

      {event.kind === 'spell' && card && spellProfile && (
        <div className={`v32v-spell-stage style-${spellProfile.style}`} aria-label={`${card.name} 주문 발동`}>
          <span className="v32v-spell-anchor" aria-hidden="true">
            {spellProfile.style === 'flash' && <><i className="flash-core" /><i className="flash-ring" /><span className="flash-rays">{Array.from({ length: 8 }, (_, index) => <b key={index} style={{ '--ray': index } as CSSProperties} />)}</span></>}
            {spellProfile.style === 'slash' && <><i className="spell-blade" /><i className="spell-cut" /></>}
            {spellProfile.style === 'lance' && <><i className="spell-lance" /><i className="spell-lance-tip" /></>}
            {spellProfile.style === 'lightning' && <><i className="spell-bolt" /><i className="spell-electric-ring" /></>}
            {spellProfile.style === 'fire' && <><i className="spell-fire-core" /><span className="spell-embers">{Array.from({ length: 6 }, (_, index) => <b key={index} style={{ '--ember': index } as CSSProperties} />)}</span></>}
            {spellProfile.style === 'void' && <><i className="spell-rift" /><i className="spell-rift-core" /></>}
            {spellProfile.style === 'heal' && <><i className="spell-heal-ring" /><i className="spell-heal-cross" /></>}
            {spellProfile.style === 'growth' && <><i className="spell-vine vine-a" /><i className="spell-vine vine-b" /><i className="spell-leaf" /></>}
            {spellProfile.style === 'shield' && <><i className="spell-shield" /><i className="spell-shield-ring" /></>}
            {spellProfile.style === 'draw' && <><i className="spell-card card-a" /><i className="spell-card card-b" /></>}
            {spellProfile.style === 'energy' && <><i className="spell-energy-orb" /><i className="spell-energy-ring" /></>}
            {spellProfile.style === 'summon' && <><i className="spell-summon-ring ring-a" /><i className="spell-summon-ring ring-b" /></>}
            {spellProfile.style === 'arcane' && <><i className="spell-arcane-ring" /><i className="spell-arcane-glyph">{spellProfile.marker}</i></>}
          </span>
          <div className="v32v-spell-copy"><small>SPELL CAST</small><b>{spellProfile.label}</b><span>{card.name}</span></div>
        </div>
      )}

      {event.kind === 'heal' && (event.amount ?? 0) > 0 && (
        <div className="v32-heal-stage" aria-label={`체력 ${event.amount} 회복`}>
          <span className="v32-heal-aura" aria-hidden="true"><i /><i /><i /></span>
          <span className="v32-heal-cross" aria-hidden="true"><i /><i /></span>
          <span className="v32-heal-particles" aria-hidden="true">{Array.from({ length: 8 }, (_, index) => <i key={index} style={{ '--heal-particle': index } as CSSProperties} />)}</span>
          <div className="v32-heal-copy"><small>RECOVERY</small><b>+{event.amount}</b><span>{event.label ?? '체력 회복'}</span></div>
        </div>
      )}

      {event.kind === 'defense' && (event.shieldAmount ?? 0) > 0 && (
        <span className={`v32n-shield-impact ${(event.healthAmount ?? 0) > 0 ? 'broken' : 'blocked'}`} aria-hidden="true">
          <i className="shield-face"><b /></i><i className="shield-ring" /><strong>{(event.healthAmount ?? 0) > 0 ? 'SHIELD BREAK' : 'BLOCK'}</strong>
        </span>
      )}
      {showHitStage && (
        <div className={`v32-hit-stage kind-${event.kind} ${event.kind === 'defense' && (event.shieldAmount ?? 0) > 0 ? 'shielded' : ''}`} aria-hidden="true">
          <span className="v32-hit-shockwave"><i /><i /><i /></span>
          <span className="v32-hit-cross"><i /><i /><i /><i /></span>
          <div className="v32-hit-panel">
            <small>{event.kind === 'core' ? 'CORE IMPACT' : event.kind === 'destroy' ? 'UNIT BREAK' : 'HIT MOTION'}</small>
            <b>{hitLabel}</b>
            <span>{hitKorean}</span>
            {hitAmountText && <strong>{hitAmountText}</strong>}
          </div>
        </div>
      )}

      {(event.kind === 'fusion' || event.kind === 'evolution') && card && extraProfile && (
        <div className={`v31e-extra-cinematic ${event.kind} v32-extra-style-${extraProfile.style} v32-extra-sig-${extraProfile.signature} ${extraProfile.legendary ? 'v32-extra-legendary' : ''}`} style={{ '--ritual': extraProfile.accent } as CSSProperties}>
          <span className="v32-extra-unique-field" aria-hidden="true">
            <i className="v32-extra-ring ring-a" /><i className="v32-extra-ring ring-b" /><i className="v32-extra-ring ring-c" />
            <span className="v32-extra-rune">{extraProfile.rune}</span>
            <span className="v32-extra-rays">{Array.from({ length: 12 }, (_, index) => <i key={index} style={{ '--ray-index': index } as CSSProperties} />)}</span>
          </span>
          <div className="v31e-extra-title"><small>{spectator ? 'EXTRA SUMMON' : mine ? 'YOUR EXTRA SUMMON' : 'OPPONENT EXTRA SUMMON'}</small><b>{extraTitle}</b><span>{extraKorean}</span></div>
          <div className="v32-extra-signature"><small>{extraProfile.label}</small><b>{extraProfile.finisher}</b><span>{card.name}</span></div>
          <div className="v31e-extra-ritual">
            <div className="v31e-source-materials">
              {sourceCards.length > 0 ? sourceCards.slice(0, 4).map((sourceCard, index) => (
                <div className="v31e-source-card" key={`${sourceCard.id}-${index}`} style={{ '--source-index': index } as CSSProperties}>
                  <CardIllustration card={sourceCard} hero />
                  <small>{sourceCard.name}</small>
                </div>
              )) : <span className="v31e-source-placeholder"><i /><i /><i /></span>}
            </div>
            <div className="v31e-ritual-core" aria-hidden="true"><i /><i /><i /><b>{event.kind === 'fusion' ? 'F' : 'A'}</b></div>
            <div className="v31e-result-card">
              <CardIllustration card={card} hero />
              <span><small>{RARITY_LABEL[card.rarity]} · {ELEMENT_LABEL[card.element]}</small><b>{card.name}</b></span>
            </div>
          </div>
          <p>{event.detail ?? (event.kind === 'fusion' ? '소재의 공명을 하나의 존재로 결속합니다.' : '원본의 힘을 계승해 상위 형태로 각성합니다.')}</p>
        </div>
      )}

      {legendaryChoice && card && (
        <div className={`v31f-choice-resolution ${event.vfx === 'legendary-fusion-choice' ? 'fusion' : 'evolution'}`}>
          <small>{spectator ? 'CHOOSE EFFECT' : mine ? 'YOUR CHOOSE EFFECT' : 'OPPONENT CHOOSE EFFECT'}</small>
          <div><CardIllustration card={card} compact /></div>
          <span><b>{event.label ?? 'CHOOSE EFFECT'}</b><strong>{card.name}</strong><p>{event.detail ?? '선택 효과가 발동했습니다.'}</p></span>
        </div>
      )}

      {event.kind === 'trap' && card && (
        <div className="v31e-trap-reveal">
          <div className="v31e-trap-card"><CardIllustration card={card} hero /><span>TRAP</span></div>
          <div className="v31e-trap-copy">
            <small>{spectator ? 'TRAP RESOLVED' : mine ? 'MY TRAP RESOLVED' : 'OPPONENT TRAP RESOLVED'}</small>
            <h2>{card.name}</h2>
            <div><b>TRIGGER</b><span>{trapTrigger || '함정 발동 조건 충족'}</span></div>
            <div><b>RESULT</b><span>{event.detail ?? card.text}</span></div>
            {trapEffect && trapEffect !== event.detail && <p>판정 · {trapEffect}</p>}
          </div>
          <span className="v31e-trap-seal" aria-hidden="true"><i /><i /><i /></span>
        </div>
      )}

      {showCardCutIn && card && (
        <div className="v18-card-cutin">
          <CardIllustration card={card} hero />
          <div><small>{spectator ? 'DUEL ACTION' : mine ? 'YOUR ACTION' : 'OPPONENT ACTION'} · {duelEventLabel(event)}</small><b>{card.name}</b><span>{KIND_LABEL[card.kind]} · {ELEMENT_LABEL[card.element]}</span></div>
        </div>
      )}
      <div className="v18-event-banner">
        <small>{spectator ? 'DUEL EVENT' : mine ? 'MY ACTION' : event.ownerId ? 'OPPONENT ACTION' : 'DUEL EVENT'}</small>
        <b>{duelEventLabel(event)}</b>
        <span>{event.detail ?? event.label ?? card?.name ?? owner?.display_name ?? duelEventLocation(event)}</span>
      </div>
      {event.kind === 'defense' && ((event.shieldAmount ?? 0) > 0 || (event.healthAmount ?? 0) > 0) ? (
        <span className="v31-damage-stack">
          {(event.shieldAmount ?? 0) > 0 && <strong className="v18-floating-number shield-damage">−{event.shieldAmount}</strong>}
          {(event.healthAmount ?? 0) > 0 && <strong className="v18-floating-number damage health-damage">−{event.healthAmount}</strong>}
        </span>
      ) : event.amount !== undefined && event.amount > 0 && ['core', 'heal', 'buff', 'energy'].includes(event.kind) && (
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

function DuelDamagePopupLayer({ events, userId }: { events: VisualEvent[]; userId: string }) {
  if (events.length === 0) return null;
  return (
    <div className="v31-damage-popup-layer" aria-live="assertive" aria-atomic="false">
      {events.map((event) => {
        const { target } = duelEventPoints(event, userId);
        const style = { left: `${target.x}%`, top: `${target.y}%` } as CSSProperties;
        if (event.kind === 'defense' && ((event.shieldAmount ?? 0) > 0 || (event.healthAmount ?? 0) > 0)) {
          const counter = /반격/.test(event.label ?? '') || /반격/.test(event.detail ?? '');
          const shielded = (event.shieldAmount ?? 0) > 0;
          return (
            <span className={`v31-damage-popup-group v32v-local-damage ${counter ? 'counter' : 'primary'} ${shielded ? 'shielded' : ''}`} style={style} key={event.id}>
              <i className="v32v-local-hit-ring" aria-hidden="true" /><i className="v32v-local-hit-cross" aria-hidden="true" />
              {(event.shieldAmount ?? 0) > 0 && <strong className="v31-damage-popup shield"><small>{counter ? 'COUNTER SHIELD' : 'SHIELD'}</small>−{event.shieldAmount}</strong>}
              {(event.healthAmount ?? 0) > 0 && <strong className="v31-damage-popup health"><small>{counter ? 'COUNTER' : 'DAMAGE'}</small>−{event.healthAmount}</strong>}
            </span>
          );
        }
        if (event.kind === 'core' && (event.amount ?? 0) > 0) {
          return <span className="v31-damage-popup-group core" style={style} key={event.id}><strong className="v31-damage-popup health"><small>CORE</small>−{event.amount}</strong></span>;
        }
        if (event.kind === 'heal' && (event.amount ?? 0) > 0) {
          return <span className="v31-damage-popup-group heal" style={style} key={event.id}><strong className="v31-damage-popup heal"><small>HEAL</small>+{event.amount}</strong></span>;
        }
        return null;
      })}
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
  attackReady,
  attackTarget,
  enemy,
  eclipsePhase = 'dawn',
  onClick,
  onInspect,
}: {
  unit: UnitState | null;
  owner: string;
  index: number;
  selected?: boolean;
  materialSelected?: boolean;
  targetable?: boolean;
  attackReady?: boolean;
  attackTarget?: boolean;
  enemy?: boolean;
  eclipsePhase?: EclipsePhase;
  onClick?: () => void;
  onInspect?: (cardId: string) => void;
}) {
  const card = unit ? CARD_BY_ID[unit.cardId] : undefined;
  const hasCharge = Boolean(card?.keywords?.includes('charge'));
  const hasGuard = Boolean(card?.keywords?.includes('guard'));
  const hasCorestrike = Boolean(card?.keywords?.includes('corestrike'));
  const hasPierce = Boolean(card?.keywords?.includes('pierce'));
  const hasLifesteal = Boolean(card?.keywords?.includes('lifesteal'));
  const hasExecute = Boolean(card?.keywords?.includes('execute'));
  const hasSweep = Boolean(card?.keywords?.includes('sweep'));
  const temporalAttack = unit?.eclipseAttackModifier ?? 0;
  const temporalHealth = unit?.eclipseHealthModifier ?? 0;
  const attackDeltaFromPrinted = unit && card ? unit.attack - (card.attack ?? 0) : 0;
  const defenseDeltaFromPrinted = unit && card ? unit.maxHealth - (card.health ?? 0) : 0;
  const temporalVisual = ECLIPSE_ARENA_VISUAL[eclipsePhase];
  const temporalDeltaLabel = (value: number) => `${value > 0 ? '+' : '−'}${Math.abs(value)}`;
  return (
    <div
      className={`unit-slot ${unit ? 'occupied' : ''} ${selected ? 'selected' : ''} ${materialSelected ? 'material-selected' : ''} ${targetable ? 'targetable' : ''} ${attackReady ? 'attack-ready' : ''} ${attackTarget ? 'attack-target' : ''} ${hasCharge ? 'has-charge' : ''} ${hasGuard ? 'has-guard' : ''} ${hasCorestrike ? 'has-corestrike' : ''} ${hasPierce ? 'has-pierce' : ''} ${hasLifesteal ? 'has-lifesteal' : ''} ${hasExecute ? 'has-execute' : ''} ${hasSweep ? 'has-sweep' : ''} ${unit?.buffCardApplied ? 'buff-card-used' : ''} ${enemy ? 'enemy' : ''} ${unit ? `origin-${unit.summonedBy}` : ''} ${card ? `element-${card.element}` : ''} ${unit?.eclipseResonance ? `time-${unit.eclipseResonance}` : ''}`}
      role="button"
      tabIndex={onClick ? 0 : -1}
      aria-label={unit ? `${card?.name ?? '유닛'} 선택` : `${index + 1}번 필드 슬롯`}
      onClick={onClick}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) return;
        event.preventDefault();
        onClick();
      }}
      data-owner={owner}
      data-duel-unit-owner={owner}
      data-index={index}
    >
      {!unit ? <span className="slot-mark">{index + 1}</span> : (
        <>
          <span className={`unit-art ${card ? `variant-${hashString(card.id) % 6}` : ''}`} style={card ? cardStyle(card) : undefined}>
            {card ? <CardIllustration card={card} compact /> : <strong>✦</strong>}
          </span>
          <span className="v30-unit-traits" aria-label="유닛 전투 특성">
            {hasCharge && <i className="charge">속공</i>}
            {hasGuard && <i className="guard">수호</i>}
            {hasCorestrike && <i className="corestrike">직격</i>}
            {hasPierce && <i className="pierce">관통</i>}
            {hasLifesteal && <i className="lifesteal">흡수</i>}
            {hasExecute && <i className="execute">처형</i>}
            {hasSweep && <i className="sweep">전체공격</i>}
            {unit.buffCardApplied && <i className="buff-used">BUFF 1/1</i>}
          </span>
          {attackReady && <span className="v30-attack-ready-badge"><i />공격 가능</span>}
          {attackTarget && <span className="v30-attack-target-badge"><i />공격 대상</span>}
          {unit.summonedBy !== 'normal' && unit.summonedBy !== 'token' && <span className={`origin-badge ${unit.summonedBy}`}>{unit.summonedBy === 'rift' ? 'RIFT' : unit.summonedBy === 'legendary' ? 'LEGEND' : unit.summonedBy === 'fusion' ? 'FUSION' : 'EVOLVE'}</span>}
          {unit.eclipseResonance === 'resonant' && <span className="v34e-time-resonance-badge resonant">TIME +</span>}
          {unit.eclipseResonance === 'strained' && <span className="v34e-time-resonance-badge strained">TIME −</span>}
          <span className="unit-name"><b>{card?.name ?? unit.cardId.replace('token:', '')}</b>{card && <button type="button" className="unit-info-hotspot" aria-label={`${card.name} 상세 정보`} title={`${card.name} 상세 정보`} onPointerDown={(event: React.PointerEvent<HTMLButtonElement>) => { event.stopPropagation(); }} onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); event.stopPropagation(); if (onInspect) onInspect(card.id); else requestCardInspection(card.id); }} onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); event.stopPropagation(); if (onInspect) onInspect(card.id); else requestCardInspection(card.id); } }}>i</button>}</span>
          <span className="unit-stats" aria-label={`공격 ${unit.attack}${temporalAttack ? ` (시간 ${temporalDeltaLabel(temporalAttack)})` : ''}, 방어 ${unit.health}${temporalHealth ? ` (시간 ${temporalDeltaLabel(temporalHealth)})` : ''}${unit.shield > 0 ? `, 방어막 +${unit.shield}` : ''}`}>
            <span className={`v32n-stat attack ${attackDeltaFromPrinted > 0 ? 'buffed' : attackDeltaFromPrinted < 0 ? 'debuffed' : ''}`}><b>{unit.attack}</b>{attackDeltaFromPrinted !== 0 && <strong className={attackDeltaFromPrinted > 0 ? 'buffed' : 'debuffed'}>{attackDeltaFromPrinted > 0 ? '+' : ''}{attackDeltaFromPrinted}</strong>}{temporalAttack !== 0 && <em className={`v34o-temporal-delta ${temporalAttack > 0 ? 'positive' : 'negative'}`} title={`현재 ATK ${unit.attack}에 시간 보정 ${temporalDeltaLabel(temporalAttack)} 적용됨`} style={{ color: `rgb(${temporalVisual.rgb})`, borderColor: `rgba(${temporalVisual.rgb},.34)`, background: `rgba(${temporalVisual.rgb},.11)`, textShadow: `0 0 8px rgba(${temporalVisual.rgb},.42)` }}>TIME {temporalDeltaLabel(temporalAttack)}</em>}<i>ATK</i></span>
            <span className={`v32n-stat defense ${defenseDeltaFromPrinted > 0 ? 'buffed' : defenseDeltaFromPrinted < 0 ? 'debuffed' : ''}`}><b>{unit.health}</b>{defenseDeltaFromPrinted !== 0 && <strong className={defenseDeltaFromPrinted > 0 ? 'buffed' : 'debuffed'}>{defenseDeltaFromPrinted > 0 ? '+' : ''}{defenseDeltaFromPrinted}</strong>}{temporalHealth !== 0 && <em className={`v34o-temporal-delta ${temporalHealth > 0 ? 'positive' : 'negative'}`} title={`현재 DEF ${unit.health}에 시간 보정 ${temporalDeltaLabel(temporalHealth)} 적용됨`} style={{ color: `rgb(${temporalVisual.rgb})`, borderColor: `rgba(${temporalVisual.rgb},.34)`, background: `rgba(${temporalVisual.rgb},.11)`, textShadow: `0 0 8px rgba(${temporalVisual.rgb},.42)` }}>TIME {temporalDeltaLabel(temporalHealth)}</em>}<i>DEF</i></span>
            {unit.shield > 0 && <em className="v32n-shield-value">+{unit.shield}</em>}
          </span>
          {!unit.canAttack && <span className="unit-state">REST</span>}
          {materialSelected && <span className="material-mark">MATERIAL</span>}
        </>
      )}
    </div>
  );
}

function clientFusionMaterialMinimumCost(card: CardDefinition, material?: NonNullable<CardDefinition['fusionRecipe']>['materials'][number]): number {
  const exactRecipe = Boolean(material?.cardIds?.length);
  const floor = exactRecipe
    ? 3
    : (card.rarity === 'legendary' ? 5 : 4);
  return Math.max(material?.minCost ?? 0, floor);
}

function clientEvolutionRequiredTurnGap(source: CardDefinition, evolutionCard: CardDefinition): number {
  const namedRecipe = Boolean(evolutionCard.evolutionRecipe?.fromIds?.length);
  let baseGap = 4;
  if (namedRecipe) {
    if (evolutionCard.rarity === 'legendary') {
      if (source.cost <= 3) baseGap = 6;
      else if (source.cost <= 5) baseGap = 4;
      else baseGap = 2;
    } else if (source.cost <= 2) baseGap = 6;
    else if (source.cost <= 4) baseGap = 4;
    else baseGap = 2;
  }
  return baseGap + (evolutionCard.extraSummonRule?.sourceExtraTurnGap ?? 0);
}

function evolutionRoundRequirement(card: CardDefinition): string {
  const sources = (card.evolutionRecipe?.fromIds ?? []).map((id) => CARD_BY_ID[id]).filter((source): source is CardDefinition => Boolean(source));
  if (sources.length > 0) {
    const longestGap = Math.max(...sources.map((source) => clientEvolutionRequiredTurnGap(source, card)));
    const rounds = Math.max(1, Math.ceil(longestGap / 2));
    return `ROUND ${rounds} 이후`;
  }
  return `비용 ${card.rarity === 'legendary' ? 6 : 5}+ 원본 · ROUND 2 이후`;
}

function extraRequirement(card: CardDefinition): string {
  const premiumRule = extraSummonRuleDescription(card);
  const choose = card.extraChoices?.length ? 'CHOOSE 1/2/3 중 1개' : '';
  if (card.kind === 'fusion') {
    const materials = card.fusionRecipe?.materials ?? [];
    const broad = materials.some((material) => !material.cardIds?.length);
    const base = card.fusionRecipe?.label ?? '지정 소재 조합';
    const broadCost = broad ? `각 ${card.rarity === 'legendary' ? 5 : 4}+` : '';
    return [base, broadCost, premiumRule, choose].filter(Boolean).join(' · ');
  }
  if (card.kind === 'evolution') {
    const sourceLabel = (card.evolutionRecipe?.label ?? '지정 원본').replace(/\s*계승$/, '');
    const sourceCopies = card.extraSummonRule?.requiredSourceCopies ?? 1;
    const roundGate = evolutionRoundRequirement(card);
    const sourceText = sourceCopies > 1
      ? `${sourceLabel} ${sourceCopies}체 · ${roundGate}`
      : `${sourceLabel} · ${roundGate}`;
    const cleanedPremium = sourceCopies > 1 ? premiumRule.replace(/^계승 원본 \d+체(?: · )?/, '') : premiumRule;
    return [sourceText, cleanedPremium, choose].filter(Boolean).join(' · ');
  }
  if (card.summonMode === 'rift') return card.riftCondition?.label ?? '균열 조건을 확인하세요.';
  if (card.summonMode === 'legendary') return `${card.legendarySummonRule?.name ?? '전설 강림'} · ${card.legendarySummonRule?.label ?? '전설 특수 소환 조건을 확인하세요.'}`;
  return card.text;
}


function clientRiftReady(state: MatchState, playerId: string, opponentId: string, card: CardDefinition): boolean {
  const condition = card.riftCondition;
  if (card.summonMode !== 'rift' || !condition) return false;
  const myUnits = state.boards[playerId].units.filter(Boolean);
  const enemyUnits = state.boards[opponentId].units.filter(Boolean);
  if (condition.kind === 'empty_board') return myUnits.length === 0;
  if (condition.kind === 'empty_board_and_graveyard_min') return myUnits.length === 0 && (state.graveyards[playerId]?.length ?? 0) >= condition.value;
  if (condition.kind === 'core_below') return (state.core[playerId] ?? CORE_MAX) <= condition.value;
  if (condition.kind === 'opponent_more_units') return enemyUnits.length > myUnits.length;
  if (condition.kind === 'graveyard_min') return (state.graveyards[playerId]?.length ?? 0) >= condition.value;
  if (condition.kind === 'ally_element') return myUnits.some((unit) => CARD_BY_ID[unit?.cardId ?? '']?.element === condition.element);
  return false;
}

function clientRiftBlockReason(state: MatchState, playerId: string, opponentId: string, card: CardDefinition): string | null {
  const condition = card.riftCondition;
  if (card.summonMode !== 'rift' || !condition) return null;
  const myUnits = state.boards[playerId].units.filter(Boolean);
  const enemyUnits = state.boards[opponentId].units.filter(Boolean);
  if (condition.kind === 'empty_board' && myUnits.length > 0) return `내 필드가 비어 있어야 합니다. 현재 내 유닛 ${myUnits.length}장.`;
  if (condition.kind === 'empty_board_and_graveyard_min') {
    const graveCount = state.graveyards[playerId]?.length ?? 0;
    if (myUnits.length > 0 && graveCount < condition.value) return `내 필드를 비우고 묘지에 카드 ${condition.value}장 이상을 준비해야 합니다. 현재 필드 ${myUnits.length}장 / 묘지 ${graveCount}장.`;
    if (myUnits.length > 0) return `내 필드가 비어 있어야 합니다. 현재 내 유닛 ${myUnits.length}장.`;
    if (graveCount < condition.value) return `내 묘지에 카드가 ${condition.value}장 이상 필요합니다. 현재 ${graveCount}장.`;
  }
  if (condition.kind === 'core_below' && (state.core[playerId] ?? CORE_MAX) > condition.value) return `내 HP가 ${condition.value} 이하일 때만 가능합니다. 현재 HP ${state.core[playerId] ?? CORE_MAX}.`;
  if (condition.kind === 'opponent_more_units' && enemyUnits.length <= myUnits.length) return `상대 유닛 수가 내 유닛보다 많아야 합니다. 현재 나 ${myUnits.length} / 상대 ${enemyUnits.length}.`;
  if (condition.kind === 'graveyard_min' && (state.graveyards[playerId]?.length ?? 0) < condition.value) return `내 묘지에 카드가 ${condition.value}장 이상 필요합니다. 현재 ${state.graveyards[playerId]?.length ?? 0}장.`;
  if (condition.kind === 'ally_element' && !myUnits.some((unit) => CARD_BY_ID[unit?.cardId ?? '']?.element === condition.element)) return `내 필드에 ${ELEMENT_LABEL[condition.element]} 속성 아군이 1장 이상 필요합니다.`;
  return null;
}

function clientSameLegendarySeries(source: CardDefinition | undefined, legendary: CardDefinition): boolean {
  if (!source) return false;
  if (legendary.seriesId) return source.seriesId === legendary.seriesId;
  if (legendary.series) return source.series === legendary.series;
  return false;
}

function clientLegendaryBlockReason(state: MatchState, playerId: string, opponentId: string, card: CardDefinition): string | null {
  if (card.rarity === 'legendary' && card.kind === 'unit' && card.summonMode !== 'rift' && card.summonMode !== 'legendary') {
    return '메인 덱 전설 유닛은 일반 소환할 수 없습니다. 전설 특수 소환 조건이 필요합니다.';
  }
  if (card.summonMode !== 'legendary') return null;
  const rule = card.legendarySummonRule;
  if (!rule) return '전설 특수 소환 조건이 설정되지 않았습니다.';
  const myUnits = state.boards[playerId].units.filter((unit): unit is UnitState => Boolean(unit));
  const enemyUnits = state.boards[opponentId].units.filter(Boolean);
  const graveyard = state.graveyards[playerId] ?? [];
  const sameSeriesCount = myUnits.filter((unit) => clientSameLegendarySeries(CARD_BY_ID[unit.cardId], card)).length;

  if (rule.requireEmptyField && myUnits.length > 0) return `내 필드가 비어 있어야 합니다. 현재 내 유닛 ${myUnits.length}체.`;
  if (rule.minimumAllies !== undefined && myUnits.length < rule.minimumAllies) return `내 필드에 유닛이 ${rule.minimumAllies}체 이상 필요합니다. 현재 ${myUnits.length}체.`;
  if (rule.minimumSameSeries !== undefined && sameSeriesCount < rule.minimumSameSeries) return `같은 시리즈 유닛이 ${rule.minimumSameSeries}체 필요합니다. 현재 ${sameSeriesCount}체.`;
  if (rule.graveyardMin !== undefined && graveyard.length < rule.graveyardMin) return `내 묘지에 카드가 ${rule.graveyardMin}장 이상 필요합니다. 현재 ${graveyard.length}장.`;
  if (rule.graveyardKind && rule.graveyardKindMin !== undefined) {
    const kindCount = graveyard.filter((cardId) => CARD_BY_ID[cardId]?.kind === rule.graveyardKind).length;
    if (kindCount < rule.graveyardKindMin) {
      const kindLabel = rule.graveyardKind === 'spell' ? '주문' : rule.graveyardKind === 'trap' ? '함정' : '유닛';
      return `내 묘지에 ${kindLabel} 카드가 ${rule.graveyardKindMin}장 이상 필요합니다. 현재 ${kindCount}장.`;
    }
  }
  if (rule.coreAtMost !== undefined && (state.core[playerId] ?? CORE_MAX) > rule.coreAtMost) return `내 코어가 ${rule.coreAtMost} 이하여야 합니다. 현재 ${state.core[playerId] ?? CORE_MAX}.`;
  if (rule.requireOutnumbered && enemyUnits.length <= myUnits.length) return `상대 필드 유닛이 내 필드보다 많아야 합니다. 현재 나 ${myUnits.length} / 상대 ${enemyUnits.length}.`;

  const releasesSpace = rule.release === 'all' ? myUnits.length > 0 : rule.release === 'same_series' && (rule.minimumSameSeries ?? 0) > 0;
  if (!releasesSpace && !state.boards[playerId].units.some((slot) => !slot)) return '전설을 놓을 빈 유닛 칸이 없습니다.';
  return null;
}

function clientLegendaryReady(state: MatchState, playerId: string, opponentId: string, card: CardDefinition): boolean {
  return card.summonMode === 'legendary' && clientLegendaryBlockReason(state, playerId, opponentId, card) === null;
}

function clientFusionMaterialMatches(unit: UnitState, material: NonNullable<CardDefinition['fusionRecipe']>['materials'][number], fusionCard: CardDefinition): boolean {
  const source = CARD_BY_ID[unit.cardId];
  if (!source) return false;
  if (material.cardIds?.length && !material.cardIds.includes(source.id)) return false;
  if (material.element && source.element !== material.element) return false;
  const minimumCost = clientFusionMaterialMinimumCost(fusionCard, material);
  if (source.cost < minimumCost) return false;
  return true;
}

function clientFindFusionAssignment(
  units: UnitState[],
  materials: NonNullable<CardDefinition['fusionRecipe']>['materials'],
  fusionCard: CardDefinition,
  at = 0,
  used = new Set<number>(),
): Set<number> | null {
  if (at >= materials.length) return new Set(used);
  for (let index = 0; index < units.length; index += 1) {
    if (used.has(index) || !clientFusionMaterialMatches(units[index], materials[at], fusionCard)) continue;
    used.add(index);
    const resolved = clientFindFusionAssignment(units, materials, fusionCard, at + 1, used);
    if (resolved) return resolved;
    used.delete(index);
  }
  return null;
}

function clientCanAssignFusion(units: UnitState[], materials: NonNullable<CardDefinition['fusionRecipe']>['materials'], fusionCard: CardDefinition): boolean {
  return Boolean(clientFindFusionAssignment(units, materials, fusionCard));
}

function clientExtraRuleBlockReason(card: CardDefinition, units: UnitState[], primaryIndexes: Set<number>): string | null {
  const rule = card.extraSummonRule;
  if (!rule) return null;
  const definitions = units.map((unit) => CARD_BY_ID[unit.cardId]).filter((material): material is CardDefinition => Boolean(material));
  const totalCost = definitions.reduce((sum, material) => sum + material.cost, 0);
  if (totalCost < rule.minTotalMaterialCost) return `소재 비용 합 ${rule.minTotalMaterialCost} 이상 필요 (현재 ${totalCost})`;
  const tributeIndexes = units.map((_, index) => index).filter((index) => !primaryIndexes.has(index));
  const tributes = tributeIndexes.map((index) => CARD_BY_ID[units[index].cardId]).filter((material): material is CardDefinition => Boolean(material));
  if (tributes.length !== rule.additionalTributes) return `추가 릴리스 ${rule.additionalTributes}체 필요`;
  if (tributes.some((material) => material.cost < rule.tributeMinCost)) return `추가 릴리스는 각각 비용 ${rule.tributeMinCost} 이상 필요`;
  if (rule.requireHighRarityMaterial && !definitions.some((material) => material.rarity === 'epic' || material.rarity === 'legendary')) return '영웅/전설 소재 1체 이상 필요';
  if (rule.requireSameSeriesTribute && card.seriesId && !tributes.some((material) => material.seriesId === card.seriesId)) return '추가 릴리스 중 같은 시리즈 1체 필요';
  return null;
}

function clientFindFusionAssignmentForExtraRule(
  units: UnitState[],
  materials: NonNullable<CardDefinition['fusionRecipe']>['materials'],
  fusionCard: CardDefinition,
  at = 0,
  used = new Set<number>(),
): Set<number> | null {
  if (at >= materials.length) return clientExtraRuleBlockReason(fusionCard, units, used) ? null : new Set(used);
  for (let index = 0; index < units.length; index += 1) {
    if (used.has(index) || !clientFusionMaterialMatches(units[index], materials[at], fusionCard)) continue;
    used.add(index);
    const resolved = clientFindFusionAssignmentForExtraRule(units, materials, fusionCard, at + 1, used);
    if (resolved) return resolved;
    used.delete(index);
  }
  return null;
}

function clientUnitCombinations(units: UnitState[], count: number): UnitState[][] {
  if (count <= 0) return [[]];
  const result: UnitState[][] = [];
  const pick = (start: number, chosen: UnitState[]) => {
    if (chosen.length === count) {
      result.push([...chosen]);
      return;
    }
    for (let index = start; index < units.length; index += 1) {
      chosen.push(units[index]);
      pick(index + 1, chosen);
      chosen.pop();
    }
  };
  pick(0, []);
  return result;
}

function clientEvolutionBaseMatches(unit: UnitState, card: CardDefinition): boolean {
  const recipe = card.evolutionRecipe;
  const source = CARD_BY_ID[unit.cardId];
  if (!recipe || !source) return false;
  if (recipe.fromIds?.length) return recipe.fromIds.includes(source.id);
  const hardenedMinCost = Math.max(recipe.minCost ?? 0, card.rarity === 'legendary' ? 6 : 5);
  return (!recipe.element || recipe.element === source.element)
    && source.cost >= hardenedMinCost
    && (recipe.maxCost === undefined || source.cost <= recipe.maxCost);
}

function clientRoundNumber(currentTurn: number): number {
  return Math.max(1, Math.ceil(currentTurn / 2));
}

function clientEvolutionProgress(unit: UnitState, card: CardDefinition, currentTurn: number) {
  const source = CARD_BY_ID[unit.cardId];
  if (!source || !clientEvolutionBaseMatches(unit, card)) return null;
  const requiredGap = clientEvolutionRequiredTurnGap(source, card);
  const requiredRounds = Math.max(1, Math.ceil(requiredGap / 2));
  const currentRound = clientRoundNumber(currentTurn);
  const remainingRounds = Math.max(0, requiredRounds - currentRound);
  return {
    source,
    requiredGap,
    requiredRounds,
    currentRound,
    completedRounds: Math.min(requiredRounds, currentRound),
    remainingRounds,
    ready: currentRound >= requiredRounds,
  };
}

function clientEvolutionReady(unit: UnitState, card: CardDefinition, currentTurn: number): boolean {
  const progress = clientEvolutionProgress(unit, card, currentTurn);
  return Boolean(progress?.ready);
}

function clientExtraProgressReasons(units: UnitState[], card: CardDefinition, currentTurn: number): string[] {
  const reasons: string[] = [];
  const requiredTotal = extraRequiredUnitCount(card);

  if (units.length < requiredTotal) {
    reasons.push(`필드 소재가 부족합니다. 필요 ${requiredTotal}체 / 현재 ${units.length}체.`);
  }

  if (card.kind === 'fusion') {
    const materials = card.fusionRecipe?.materials ?? [];
    materials.forEach((material, index) => {
      const matched = units.filter((unit) => clientFusionMaterialMatches(unit, material, card));
      if (matched.length > 0) return;
      const label = material.label || `소재 ${index + 1}`;
      const minimumCost = clientFusionMaterialMinimumCost(card, material);
      const costHint = minimumCost > 0 ? ` · 비용 ${minimumCost}+` : '';
      reasons.push(`융합 소재 「${label}」이 없습니다${costHint}.`);
    });
    if (units.length >= materials.length && !clientCanAssignFusion(units, materials, card) && !reasons.some((reason) => reason.startsWith('융합 소재'))) {
      reasons.push('현재 필드 조합으로는 지정된 융합 소재를 서로 겹치지 않게 맞출 수 없습니다.');
    }
    return reasons;
  }

  if (card.kind === 'evolution') {
    const sourceCopies = card.extraSummonRule?.requiredSourceCopies ?? 1;
    const recipe = card.evolutionRecipe;
    const sourceLabel = (recipe?.label ?? '계승 원본').replace(/\s*계승$/, '');
    const candidates = units
      .map((unit, index) => ({ unit, index, progress: clientEvolutionProgress(unit, card, currentTurn) }))
      .filter((entry): entry is { unit: UnitState; index: number; progress: NonNullable<ReturnType<typeof clientEvolutionProgress>> } => Boolean(entry.progress));

    if (candidates.length < sourceCopies) {
      reasons.push(`계승 원본이 부족합니다. 「${sourceLabel}」 ${candidates.length}/${sourceCopies}체.`);
    }

    const notReady = candidates.filter((entry) => !entry.progress.ready);
    if (notReady.length > 0) {
      const requiredRound = Math.max(...notReady.map((entry) => entry.progress.requiredRounds));
      const currentRound = clientRoundNumber(currentTurn);
      reasons.push(
        `아직 소환 시기가 아닙니다. ROUND ${requiredRound}부터 계승 진화할 수 있습니다. 현재 ROUND ${currentRound}${currentRound < requiredRound ? ` · 앞으로 ${requiredRound - currentRound}라운드` : ''}.`,
      );
    }

    const readyCandidates = candidates.filter((entry) => entry.progress.ready);

    const rule = card.extraSummonRule;
    if (rule && readyCandidates.length >= sourceCopies && units.length >= requiredTotal) {
      let extraReason: string | null = null;
      const selections = clientUnitCombinations(units, requiredTotal);
      for (const selection of selections) {
        const eligibleIndexes = selection
          .map((unit, index) => clientEvolutionReady(unit, card, currentTurn) ? index : -1)
          .filter((index) => index >= 0);
        if (eligibleIndexes.length < sourceCopies) continue;
        for (const combination of clientIndexCombinations(eligibleIndexes, sourceCopies)) {
          const reason = clientExtraRuleBlockReason(card, selection, new Set(combination));
          if (!reason) return reasons;
          if (!extraReason) extraReason = reason;
        }
      }
      if (extraReason) reasons.push(`추가 릴리스 조건: ${extraReason}.`);
    }
  }

  return reasons;
}


function clientIndexCombinations(indexes: number[], count: number): number[][] {
  if (count <= 0) return [[]];
  const result: number[][] = [];
  const pick = (start: number, chosen: number[]) => {
    if (chosen.length === count) {
      result.push([...chosen]);
      return;
    }
    for (let at = start; at < indexes.length; at += 1) {
      chosen.push(indexes[at]);
      pick(at + 1, chosen);
      chosen.pop();
    }
  };
  pick(0, []);
  return result;
}

function clientSelectedExtraMaterialsValid(units: UnitState[], card: CardDefinition, currentTurn: number): boolean {
  if (units.length !== extraRequiredUnitCount(card)) return false;
  if (card.kind === 'fusion') {
    const materials = card.fusionRecipe?.materials ?? [];
    return Boolean(clientFindFusionAssignmentForExtraRule(units, materials, card));
  }
  if (card.kind === 'evolution') {
    const sourceCopies = card.extraSummonRule?.requiredSourceCopies ?? 1;
    const eligibleIndexes = units
      .map((unit, index) => clientEvolutionReady(unit, card, currentTurn) ? index : -1)
      .filter((index) => index >= 0);
    if (eligibleIndexes.length < sourceCopies) return false;
    for (const combination of clientIndexCombinations(eligibleIndexes, sourceCopies)) {
      if (!clientExtraRuleBlockReason(card, units, new Set(combination))) return true;
    }
  }
  return false;
}

function clientExtraReadyFromField(units: UnitState[], card: CardDefinition, currentTurn: number): boolean {
  const required = extraRequiredUnitCount(card);
  if (required <= 0 || units.length < required) return false;
  return clientUnitCombinations(units, required).some((selection) => clientSelectedExtraMaterialsValid(selection, card, currentTurn));
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

function DuelEnergyMeter({ label, current, max, cap = 10, nextMax, opponent = false, compact = false }: { label: string; current: number; max: number; cap?: number; nextMax?: number; opponent?: boolean; compact?: boolean }) {
  const safeCap = Math.max(10, Math.floor(cap));
  const safeCurrent = Math.max(0, Math.min(safeCap, current));
  const safeMax = Math.max(0, Math.min(safeCap, max));
  const pipCount = Math.max(10, safeCap);
  return (
    <div className={`v15-energy-meter ${opponent ? 'opponent' : 'mine'} ${compact ? 'compact' : ''}`}>
      <div className="v15-energy-copy">
        <span>{label}</span>
        <b>{safeCurrent}<em>/ {safeMax}</em></b>
        {safeCap > 10 && <small>한도 {safeCap}</small>}
        {typeof nextMax === 'number' && nextMax > safeMax && <small>다음 내 턴 {nextMax}</small>}
      </div>
      <div className="v15-energy-pips" style={{ display: 'grid', gridTemplateColumns: `repeat(${pipCount}, minmax(0, 1fr))` }} aria-label={`${label} ${safeCurrent}/${safeMax} · 한도 ${safeCap}`}>
        {Array.from({ length: pipCount }, (_, index) => <i key={index} className={index < safeCurrent ? 'active' : index < safeMax ? 'available' : 'locked'} />)}
      </div>
    </div>
  );
}

type EclipsePhaseNoticeState = {
  phase: EclipsePhase;
  source: 'unit' | 'effect';
  turn: number;
  perspective: 'mine' | 'opponent' | 'spectator';
  serial: number;
};

function useEclipsePhaseNotice(state: MatchState | null | undefined, userId?: string): EclipsePhaseNoticeState | null {
  const [notice, setNotice] = useState<EclipsePhaseNoticeState | null>(null);
  const previous = useRef<{ phase: EclipsePhase; turn: number } | null>(state ? { phase: clientCurrentEclipsePhase(state), turn: state.turnNumber } : null);

  useEffect(() => {
    if (!state) {
      previous.current = null;
      setNotice(null);
      return;
    }
    const next = { phase: clientCurrentEclipsePhase(state), turn: state.turnNumber };
    const before = previous.current;
    previous.current = next;
    if (!before || before.phase === next.phase || state.status !== 'active') return;

    const source: EclipsePhaseNoticeState['source'] = state.eclipseLastChangeSource ?? 'effect';
    const perspective: EclipsePhaseNoticeState['perspective'] = userId
      ? state.currentPlayerId === userId ? 'mine' : 'opponent'
      : 'spectator';
    const nextNotice: EclipsePhaseNoticeState = { phase: next.phase, source, turn: next.turn, perspective, serial: Date.now() };
    setNotice(nextNotice);
    const timer = window.setTimeout(() => setNotice((current) => current?.serial === nextNotice.serial ? null : current), 1380);
    return () => window.clearTimeout(timer);
  }, [state?.eclipsePhase, state?.eclipseLastChangeSource, state?.turnNumber, state?.status, state?.currentPlayerId, userId]);

  return notice;
}

function EclipsePhaseShiftNotice({ notice }: { notice: EclipsePhaseNoticeState | null }) {
  if (!notice) return null;
  const meta = ECLIPSE_UI_META[notice.phase];
  const visual = ECLIPSE_ARENA_VISUAL[notice.phase];
  const sourceLabel = notice.source === 'unit' ? 'UNIT ARRIVAL · TIME SHIFT' : 'CARD EFFECT';
  return (
    <div
      key={notice.serial}
      className={`v34n-phase-toast cycle-${notice.phase} source-${notice.source}`}
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed', left: '50%', top: 74, zIndex: 2200, transform: 'translateX(-50%)', pointerEvents: 'none',
        display: 'flex', alignItems: 'center', gap: 9, minWidth: 168, maxWidth: 'min(280px,72vw)', padding: '8px 12px',
        border: `1px solid rgba(${visual.rgb},.34)`, borderRadius: 999,
        background: `linear-gradient(90deg,rgba(${visual.rgb},.18),rgba(5,9,15,.90) 34%,rgba(5,9,15,.90))`,
        boxShadow: `0 12px 38px rgba(0,0,0,.38),inset 3px 0 0 rgba(${visual.rgb},.72)`, backdropFilter: 'blur(10px)',
      }}
    >
      <span aria-hidden="true" style={{ color: `rgb(${visual.rgb})`, fontSize: 18, lineHeight: 1 }}>{meta.glyph}</span>
      <span style={{ display: 'grid', gap: 1, minWidth: 0 }}>
        <small style={{ color: '#91a1ae', fontSize: 7, fontWeight: 950, letterSpacing: '.12em' }}>{sourceLabel}</small>
        <strong style={{ color: '#f6fbff', fontSize: 14, lineHeight: 1 }}>{ECLIPSE_PHASE_LABEL[notice.phase]}</strong>
      </span>
      <em style={{ marginLeft: 'auto', color: `rgba(${visual.rgb},.90)`, fontSize: 8, fontStyle: 'normal', fontWeight: 900, whiteSpace: 'nowrap' }}>{meta.atmosphere}</em>
    </div>
  );
}

function EclipseCycleHud({ state, compact = false }: { state: MatchState; compact?: boolean }) {
  const current = state.eclipsePhase ?? 'dawn';
  const locked = (state.eclipsePhaseLockUntilTurn ?? 0) >= state.turnNumber;
  const history = state.eclipsePhaseHistory ?? [];
  const previous = history.length > 0 ? history[history.length - 1] : undefined;
  const meta = ECLIPSE_UI_META[current];
  return <div className={`v34-cycle-hud v34e-cycle-${current} ${compact ? 'compact' : ''}`} aria-label={`ECLIPSE CYCLE 현재 ${ECLIPSE_PHASE_LABEL[current]} · 공명 보정 ${meta.bonus}`}>
    <div className="v34-cycle-title"><strong className="v34e-cycle-glyph" aria-hidden="true">{meta.glyph}</strong><span>ECLIPSE CYCLE</span><b>{ECLIPSE_PHASE_LABEL[current]}</b><small>{meta.bonus}</small>{locked && <em>LOCK</em>}</div>
    <div className="v34-cycle-track">{ECLIPSE_PHASE_ORDER.map((phase) => <span key={phase} className={phase === current ? 'active' : ''}><i>{ECLIPSE_UI_META[phase].glyph}</i><small>{ECLIPSE_PHASE_LABEL[phase]}</small></span>)}</div>
    <div className="v34e-cycle-history"><small>{meta.atmosphere}</small><b>{previous ? `↶ 직전 ${ECLIPSE_PHASE_LABEL[previous]}` : '↶ 직전 기록 없음'}</b></div>
  </div>;
}

/**
 * v34f: the cycle is a thin status rail, not a battlefield panel.
 * It intentionally lives at the header/arena seam so units and the center lane
 * never have to compete with the game's global clock.
 */
function EclipseCycleStrip({ state }: { state: MatchState }) {
  const current = clientCurrentEclipsePhase(state);
  const meta = ECLIPSE_UI_META[current];
  const visual = ECLIPSE_ARENA_VISUAL[current];
  const locked = (state.eclipsePhaseLockUntilTurn ?? 0) >= state.turnNumber;
  return (
    <div
      className="v34m-cycle-inline"
      aria-label={`ECLIPSE CYCLE · 현재 ${ECLIPSE_PHASE_LABEL[current]} · 실제 유닛 카드가 필드에 등장할 때마다 다음 시간대로 변경 · 여명, 정점, 황혼, 심야, 개기일식 순서`}
      style={{
        display: 'flex', alignItems: 'center', gap: 5, minWidth: 0, maxWidth: 'min(470px,38vw)', height: 28,
        marginLeft: 10, padding: '0 9px', overflow: 'hidden', whiteSpace: 'nowrap', flex: '0 1 470px',
        border: `1px solid rgba(${visual.rgb},.22)`, borderRadius: 999,
        background: `linear-gradient(90deg,rgba(${visual.rgb},.11),rgba(5,10,16,.76) 28%,rgba(5,10,16,.76))`,
        boxShadow: `inset 0 0 0 1px rgba(${visual.rgb},.025)`,
      }}
    >
      <span className="v34m-cycle-title" style={{ color: `rgba(${visual.rgb},.74)`, fontSize: 7, fontWeight: 950, letterSpacing: '.12em', flex: '0 0 auto' }}>ECLIPSE CYCLE</span>
      <span aria-hidden="true" style={{ width: 1, height: 12, background: `rgba(${visual.rgb},.20)`, flex: '0 0 auto' }} />
      {ECLIPSE_PHASE_ORDER.map((phase, index) => {
        const active = phase === current;
        return (
          <span key={phase} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, minWidth: 0, flex: active ? '0 0 auto' : '0 1 auto' }}>
            {index > 0 && <i aria-hidden="true" style={{ color: '#40505e', fontStyle: 'normal', fontSize: 8, lineHeight: 1, flex: '0 0 auto' }}>›</i>}
            <b
              className={`v34m-cycle-phase ${active ? 'active' : ''}`}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 3, minWidth: 0, padding: active ? '4px 7px' : '3px 1px',
                overflow: 'hidden', textOverflow: 'ellipsis', borderRadius: 999,
                color: active ? '#f5fbff' : '#758492', background: active ? `rgba(${visual.rgb},.16)` : 'transparent',
                boxShadow: active ? `inset 0 0 0 1px rgba(${visual.rgb},.25)` : 'none',
                fontSize: 'clamp(7px,.52vw,9px)', lineHeight: 1, fontWeight: active ? 950 : 820,
              }}
            >
              {active && <i aria-hidden="true" style={{ color: `rgb(${visual.rgb})`, fontStyle: 'normal', fontSize: 9 }}>{meta.glyph}</i>}
              {ECLIPSE_PHASE_LABEL[phase]}
            </b>
          </span>
        );
      })}
      <em title={locked ? '시간 고정 효과가 활성화되어 있습니다.' : '다음 실제 유닛 카드가 필드에 등장하면 시간이 1단계 이동합니다.'} style={{ marginLeft: 'auto', color: `rgba(${visual.rgb},.86)`, fontSize: 6.5, fontStyle: 'normal', fontWeight: 950, letterSpacing: '.08em', flex: '0 0 auto' }}>{locked ? 'TIME LOCK' : 'NEXT · UNIT'}</em>
    </div>
  );
}

function DuelTimeCriticalStyles() {
  return <style>{`
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix {
      --cycle-h:0px!important;
      grid-template-rows:var(--header-h) minmax(0,1fr) var(--hand-h)!important;
      grid-template-areas:"header header header" "leaders arena command" "leaders hand command"!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix > .v34l-cycle-rail,
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix > .v34k-cycle-band { display:none!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-duel-brand { min-width:0!important;overflow:hidden!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-duel-brand > div:not(.v34m-cycle-inline) { flex:0 0 auto!important; }

    /* v34n: the real duel arena is painted by its phase class, never by a preview-only variable. */
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-arena {
      position:relative!important;isolation:isolate!important;overflow:hidden!important;
      transition:background .62s ease,box-shadow .62s ease!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-arena-backdrop,
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v34m-time-atmosphere { display:none!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v34n-time-sky {
      position:absolute!important;inset:0!important;z-index:0!important;display:block!important;pointer-events:none!important;
      background-position:center!important;background-size:cover!important;opacity:1!important;
      transition:background .62s ease,filter .62s ease!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-opponent-hand-strip,
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-board { position:relative!important;z-index:4!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-unit-slot,
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-secret-slot {
      background:linear-gradient(145deg,rgba(4,8,14,.50),rgba(var(--v34m-accent-rgb),.085))!important;
      border-color:rgba(var(--v34m-accent-rgb),.24)!important;
      backdrop-filter:blur(1.2px)!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-arena::after {
      z-index:2!important;pointer-events:none!important;
      background:linear-gradient(90deg,rgba(1,4,8,.10),transparent 10%,transparent 90%,rgba(1,4,8,.10)),linear-gradient(180deg,rgba(var(--v34m-accent-rgb),.018),transparent 42%,rgba(0,0,0,.04))!important;
    }

    /* Strong fallback backgrounds. These are deliberately duplicated from JSX so stale theme CSS cannot cancel the phase. */
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix.cycle-dawn .v18-arena { background:linear-gradient(180deg,#162b4a 0%,#33435d 42%,#8d5860 69%,#5b302e 84%,#140d15 100%)!important;box-shadow:inset 0 -150px 190px rgba(255,128,70,.15)!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix.cycle-zenith .v18-arena { background:linear-gradient(180deg,#1b607b 0%,#174b62 45%,#0d3145 75%,#071923 100%)!important;box-shadow:inset 0 110px 190px rgba(164,241,255,.13)!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix.cycle-dusk .v18-arena { background:linear-gradient(180deg,#3b2851 0%,#713b63 43%,#a54d58 68%,#8b3f32 82%,#21111d 100%)!important;box-shadow:inset 0 -150px 190px rgba(255,92,72,.15)!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix.cycle-midnight .v18-arena { background:linear-gradient(180deg,#071b3d 0%,#091532 48%,#050c20 76%,#02050e 100%)!important;box-shadow:inset 0 0 200px rgba(75,119,255,.12)!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix.cycle-eclipse .v18-arena { background:linear-gradient(180deg,#1a1025 0%,#110b1c 48%,#090811 76%,#030307 100%)!important;box-shadow:inset 0 0 210px rgba(126,72,194,.14)!important; }

    /* Time-change toast is above every duel cinematic but remains compact and short-lived. */
    .v23-client.in-duel .v34n-phase-toast { animation:v34nPhaseToast 1.72s ease both!important; }
    @keyframes v34nPhaseToast {
      0% { opacity:0;transform:translate(-50%,-8px) scale(.97); }
      13%,78% { opacity:1;transform:translate(-50%,0) scale(1); }
      100% { opacity:0;transform:translate(-50%,-5px) scale(.985); }
    }

    @media (max-width:1250px) {
      .v23-client.in-duel .v34m-cycle-inline { max-width:330px!important;flex-basis:330px!important;margin-left:6px!important;padding-inline:6px!important;gap:3px!important; }
      .v23-client.in-duel .v34m-cycle-title { display:none!important; }
    }
    @media (max-width:980px) {
      .v23-client.in-duel .v34m-cycle-inline { max-width:250px!important;flex-basis:250px!important;height:25px!important; }
      .v23-client.in-duel .v34m-cycle-phase { font-size:6.4px!important;padding-inline:0!important; }
      .v23-client.in-duel .v34m-cycle-phase.active { padding-inline:5px!important; }
      .v23-client.in-duel .v34n-phase-toast { top:58px!important;max-width:72vw!important; }
    }
    /* v34r: hand cards keep their full card geometry without stealing arena height.
       The hand stays in its own grid row. When a short viewport cannot show a whole
       card at once, only the hand viewport scrolls vertically; the battlefield never
       gets pushed or covered. */
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix {
      --hand-h:clamp(190px,24dvh,230px)!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-dock {
      padding:8px 10px 9px 14px!important;
      grid-template-rows:34px minmax(0,1fr)!important;
      overflow:hidden!important;
      contain:layout paint!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-scroll {
      min-width:0!important;
      min-height:0!important;
      align-items:flex-start!important;
      gap:10px!important;
      padding:7px 8px 10px 2px!important;
      overflow-x:auto!important;
      overflow-y:auto!important;
      overscroll-behavior:contain!important;
      scroll-snap-type:x proximity!important;
      scrollbar-gutter:stable!important;
      scrollbar-width:thin!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card {
      position:relative!important;
      flex:0 0 158px!important;
      width:158px!important;
      height:229px!important;
      min-width:158px!important;
      min-height:229px!important;
      max-height:none!important;
      align-self:flex-start!important;
      overflow:visible!important;
      scroll-snap-align:start!important;
      transition:transform .16s ease,filter .16s ease!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card.compact {
      width:158px!important;
      height:229px!important;
      min-width:158px!important;
      min-height:229px!important;
      max-width:158px!important;
      max-height:229px!important;
      aspect-ratio:auto!important;
      display:grid!important;
      grid-template-rows:42px minmax(0,1fr) 29px!important;
      gap:0!important;
      padding:0!important;
      overflow:hidden!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card.compact .card-art {
      min-height:0!important;
      height:100%!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card.compact .card-subtitle,
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card.compact .card-text {
      display:none!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card.compact .card-footer {
      min-height:29px!important;
      height:29px!important;
      padding:5px 8px!important;
      margin:0!important;
      align-self:auto!important;
      font-size:9px!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card.compact .card-footer b {
      font-size:11px!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card .card-topline {
      height:42px!important;
      min-height:42px!important;
      padding:5px 8px 5px 37px!important;
      display:grid!important;
      grid-template-columns:minmax(0,1fr)!important;
      align-content:center!important;
      justify-items:start!important;
      gap:1px!important;
      overflow:hidden!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card .card-topline b {
      width:100%!important;
      min-width:0!important;
      max-width:100%!important;
      font-size:11px!important;
      line-height:1.28!important;
      white-space:nowrap!important;
      overflow:hidden!important;
      text-overflow:clip!important;
      display:block!important;
      word-break:keep-all!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card .card-topline small {
      display:block!important;
      width:100%!important;
      min-width:0!important;
      font-size:7.5px!important;
      line-height:1.05!important;
      overflow:hidden!important;
      text-overflow:ellipsis!important;
      white-space:nowrap!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .card-cost {
      top:7px!important;
      left:7px!important;
      width:29px!important;
      height:29px!important;
      font-size:13px!important;
      transform:none!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .card-info-hotspot {
      top:72px!important;
      right:7px!important;
      width:27px!important;
      height:27px!important;
      font-size:11px!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .summon-badge {
      top:47px!important;
      right:7px!important;
      max-width:48px!important;
      height:17px!important;
      padding:2px 5px!important;
      font-size:6.5px!important;
      line-height:1!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .v30-card-traits {
      top:47px!important;
      right:7px!important;
      gap:2px!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card:hover,
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card:focus-within {
      transform:translateY(-3px)!important;
      z-index:55!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card.selected {
      transform:translateY(-4px)!important;
      z-index:56!important;
    }
    @media (max-width:1700px) {
      .v23-client.in-duel .v18-duel-screen.v34m-time-fix {
        --hand-h:clamp(190px,23dvh,215px)!important;
      }
      .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card {
        flex-basis:148px!important;
        width:148px!important;
        min-width:148px!important;
        height:214px!important;
        min-height:214px!important;
      }
      .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card.compact {
        width:148px!important;
        min-width:148px!important;
        max-width:148px!important;
        height:214px!important;
        min-height:214px!important;
        max-height:214px!important;
        grid-template-rows:40px minmax(0,1fr) 28px!important;
      }
      .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card .card-topline {
        height:40px!important;
        min-height:40px!important;
        padding-left:36px!important;
        padding-right:8px!important;
      }
    }
    @media (max-height:680px) {
      .v23-client.in-duel .v18-duel-screen.v34m-time-fix {
        --hand-h:185px!important;
      }
    }
    @media (max-width:1180px) {
      .v23-client.in-duel .v18-duel-screen.v34m-time-fix {
        --hand-h:190px!important;
      }
      .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card {
        flex-basis:140px!important;
        width:140px!important;
        min-width:140px!important;
        height:203px!important;
        min-height:203px!important;
      }
      .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card.compact {
        width:140px!important;
        min-width:140px!important;
        max-width:140px!important;
        height:203px!important;
        min-height:203px!important;
        max-height:203px!important;
        grid-template-rows:39px minmax(0,1fr) 27px!important;
      }
    }
    /* v34o: leader names keep a real text column instead of being squeezed by avatar/emblem. */
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix { --leader-col:clamp(205px,12vw,238px)!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-leader-card { min-width:0!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-leader-identity {
      width:100%!important;min-width:0!important;display:grid!important;grid-template-columns:auto auto minmax(0,1fr)!important;align-items:center!important;column-gap:6px!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-leader-identity > span:not(.avatar) { min-width:0!important;display:grid!important;overflow:visible!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-leader-identity > .avatar { width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;overflow:hidden!important;border-radius:50%!important;isolation:isolate!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-leader-identity > .avatar::before { border-radius:50%!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-leader-identity > span:not(.avatar) > b {
      display:block!important;min-width:0!important;max-width:100%!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important;font-size:12.5px!important;letter-spacing:-.02em!important;
    }
    @media (max-width:1700px) { .v23-client.in-duel .v18-duel-screen.v34m-time-fix { --leader-col:198px!important; } }
    @media (max-width:1450px) { .v23-client.in-duel .v18-duel-screen.v34m-time-fix { --leader-col:190px!important; } .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-leader-identity > span:not(.avatar) > b { font-size:11.5px!important; } }

    /* v34o: field info is a real button (not an invalid nested interactive span) and is always reachable. */
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot { cursor:pointer!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot::before,
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot::after { pointer-events:none!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot .unit-info-hotspot {
      position:static!important;z-index:95!important;width:17px!important;height:17px!important;min-width:17px!important;
      display:grid!important;place-items:center!important;padding:0!important;margin:0!important;border-radius:50%!important;pointer-events:auto!important;cursor:help!important;
      border:1px solid rgba(210,235,250,.38)!important;background:rgba(3,8,13,.9)!important;color:#effaff!important;font-family:inherit!important;font-size:9px!important;font-weight:900!important;line-height:1!important;box-shadow:0 3px 10px rgba(0,0,0,.32)!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot .unit-art,
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot .v30-unit-traits,
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot .unit-stats { pointer-events:none!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot .unit-name { pointer-events:auto!important;display:flex!important;align-items:center!important;justify-content:center!important;gap:4px!important;min-width:0!important;max-width:100%!important;overflow:hidden!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot .unit-name > b { min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;font:inherit!important;color:inherit!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot .unit-info-hotspot:hover,
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot .unit-info-hotspot:focus-visible { border-color:#aee9ff!important;background:#122432!important;outline:2px solid rgba(125,221,255,.32)!important;outline-offset:1px!important; }

    /* v34o: temporal stat contribution is shown separately in the active time-of-day color. */
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot .v32n-stat { gap:3px!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot .v34o-temporal-delta {
      display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:22px!important;height:16px!important;padding:0 4px!important;
      border:1px solid!important;border-radius:999px!important;font-size:7px!important;line-height:1!important;font-weight:1000!important;font-style:normal!important;letter-spacing:-.02em!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .unit-slot .v34o-temporal-delta.negative { opacity:.84!important;text-decoration:underline dotted!important;text-underline-offset:2px!important; }

    /* v38: quick time-state digest for hand cards and preview panel. */
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-quick {
      display:grid!important;gap:7px!important;padding:9px 10px!important;border-radius:14px!important;
      border:1px solid rgba(170,225,255,.18)!important;background:rgba(8,15,24,.72)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.04)!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-quick.tone-buff { border-color:rgba(98,231,188,.32)!important;background:linear-gradient(180deg,rgba(8,29,23,.88),rgba(8,15,24,.78))!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-quick.tone-debuff { border-color:rgba(255,133,156,.34)!important;background:linear-gradient(180deg,rgba(39,14,21,.9),rgba(10,14,22,.8))!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-quick.tone-fixed { border-color:rgba(214,197,255,.34)!important;background:linear-gradient(180deg,rgba(30,18,48,.9),rgba(10,14,22,.8))!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-current {
      display:flex!important;align-items:center!important;gap:8px!important;min-width:0!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-current > div { min-width:0!important;display:grid!important;gap:2px!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-current b { font-size:12px!important;line-height:1.1!important;color:#f7fdff!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-current small,
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-note { font-size:10px!important;line-height:1.35!important;color:rgba(226,242,255,.80)!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-list { display:grid!important;gap:6px!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-row {
      display:grid!important;grid-template-columns:42px minmax(0,1fr)!important;align-items:start!important;gap:6px!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-row > strong { font-size:10px!important;line-height:1.2!important;color:rgba(215,234,249,.88)!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-row > div {
      display:flex!important;flex-wrap:wrap!important;gap:4px!important;min-width:0!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-phase-chip {
      display:inline-flex!important;align-items:center!important;justify-content:center!important;padding:2px 7px!important;min-height:19px!important;border-radius:999px!important;
      border:1px solid rgba(183,220,244,.18)!important;background:rgba(255,255,255,.045)!important;color:#effaff!important;font-size:9px!important;font-weight:900!important;line-height:1!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-phase-chip.current { box-shadow:0 0 0 1px rgba(255,255,255,.12)!important,inset 0 0 0 1px rgba(255,255,255,.06)!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-phase-chip.positive { border-color:rgba(86,231,181,.38)!important;background:rgba(48,153,122,.18)!important;color:#bffae8!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-phase-chip.negative { border-color:rgba(255,132,156,.38)!important;background:rgba(171,54,88,.18)!important;color:#ffd1da!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-phase-chip.neutral { border-color:rgba(174,201,255,.24)!important;background:rgba(71,91,136,.14)!important;color:#d7e6ff!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-phase-chip.gate { border-color:rgba(255,208,114,.34)!important;background:rgba(119,82,16,.16)!important;color:#ffe4ad!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v38-temporal-phase-chip.pulse { border-color:rgba(220,145,255,.40)!important;background:rgba(122,56,155,.20)!important;color:#f2d2ff!important;box-shadow:inset 0 0 10px rgba(218,120,255,.08)!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-selected-copy .v38-temporal-quick { margin-top:8px!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .v38-temporal-quick.compact {
      position:absolute!important;left:4px!important;right:4px!important;bottom:34px!important;z-index:14!important;padding:5px 6px!important;gap:5px!important;
      border-radius:11px!important;background:rgba(5,12,20,.82)!important;backdrop-filter:blur(2px)!important;pointer-events:none!important;
    }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .v38-temporal-quick.compact .v38-temporal-current { gap:5px!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .v38-temporal-quick.compact .v38-temporal-current b { font-size:9px!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .v38-temporal-quick.compact .v38-temporal-current small { font-size:7px!important; line-height:1.25!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .v38-temporal-quick.compact .v37-time-chip { min-width:34px!important;padding:0 5px!important;font-size:8px!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .v38-temporal-list { gap:4px!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .v38-temporal-row { grid-template-columns:28px minmax(0,1fr)!important;gap:4px!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .v38-temporal-row > strong { font-size:8px!important; }
    .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .v38-temporal-phase-chip { min-height:16px!important;padding:1px 5px!important;font-size:7px!important; }

    /* v39 iPad landscape: render the duel as a compact desktop canvas instead of
       letting dozens of tablet-specific media rules squeeze each section differently.
       The runtime bridge supplies a safe scale and virtual canvas size. */
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel,
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel > .content-area {
      width:var(--ipad-vw,100vw)!important;
      height:var(--ipad-vh,100dvh)!important;
      min-width:0!important;
      min-height:0!important;
      overflow:hidden!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel > .content-area {
      position:fixed!important;
      inset:0!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix {
      --leader-col:165px!important;
      --command-col:305px!important;
      --header-h:64px!important;
      --hand-h:282px!important;
      width:var(--ipad-duel-w,1280px)!important;
      height:var(--ipad-duel-h,900px)!important;
      min-width:0!important;
      min-height:0!important;
      max-width:none!important;
      max-height:none!important;
      transform:scale(var(--ipad-duel-scale,1))!important;
      transform-origin:top left!important;
      overflow:hidden!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-duel-header {
      padding:0 14px!important;
      gap:10px!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-duel-brand b { font-size:13px!important; }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-turn-timer { min-width:104px!important;height:38px!important; }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-header-actions button {
      min-width:0!important;height:38px!important;min-height:38px!important;padding:0 11px!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-leader-rail {
      padding:10px 8px 10px 10px!important;gap:8px!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-leader-card {
      padding:11px 9px!important;gap:7px!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hp-readout strong { font-size:38px!important; }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-arena {
      position:relative!important;
      min-width:0!important;
      min-height:0!important;
      overflow:hidden!important;
    }
    /* v40: on iPad the generic time-fix rule accidentally changed the board from
       absolute fill to relative flow. That left a large unused strip under the field.
       Restore the desktop battlefield geometry so all five lanes use the arena height. */
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-opponent-hand-strip {
      position:absolute!important;
      top:8px!important;
      left:50%!important;
      right:auto!important;
      transform:translateX(-50%)!important;
      z-index:8!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-board {
      position:absolute!important;
      inset:42px 10px 8px!important;
      width:auto!important;
      height:auto!important;
      margin:0!important;
      min-width:0!important;
      min-height:0!important;
      grid-template-rows:40px minmax(108px,1fr) 48px minmax(108px,1fr) 48px!important;
      gap:7px!important;
      align-content:stretch!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-zone-row { gap:6px!important; }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-center-lane {
      grid-template-columns:minmax(90px,1fr) minmax(190px,260px) minmax(90px,1fr)!important;gap:10px!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-command-rail {
      padding:9px!important;gap:7px!important;overflow:auto!important;overscroll-behavior:contain!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v29-action-coach { padding:11px 12px!important; }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v29-action-coach h3 { font-size:14px!important; }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v29-action-coach > p { font-size:10px!important;line-height:1.5!important; }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-context-panel { padding:9px!important;overflow:auto!important; }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-action-buttons button {
      min-height:45px!important;padding:7px 10px!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-dock {
      padding:8px 11px 10px 14px!important;
      grid-template-rows:34px minmax(0,1fr)!important;
      overflow:hidden!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-scroll {
      gap:10px!important;
      padding:7px 8px 10px 2px!important;
      overflow-x:auto!important;
      overflow-y:hidden!important;
      align-items:flex-start!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card {
      flex:0 0 158px!important;
      width:158px!important;
      min-width:158px!important;
      height:229px!important;
      min-height:229px!important;
      max-height:229px!important;
      transform:none!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card.selected {
      transform:translateY(-3px)!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card .tcg-card.compact {
      width:158px!important;
      min-width:158px!important;
      max-width:158px!important;
      height:229px!important;
      min-height:229px!important;
      max-height:229px!important;
      grid-template-rows:42px minmax(0,1fr) 29px!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-side {
      min-width:110px!important;padding-left:10px!important;gap:7px!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-side button {
      min-height:38px!important;height:auto!important;
    }
    html[data-ipad="true"][data-ipad-orientation="landscape"][data-ipad-input="touch"] .v23-client.in-duel .v18-duel-screen.v34m-time-fix .v18-hand-card:hover {
      transform:none!important;
    }

    @media (prefers-reduced-motion:reduce) {
      .v23-client.in-duel .v34n-phase-toast { animation:v34nPhaseToastReduced 1.72s linear both!important; }
      @keyframes v34nPhaseToastReduced { 0%,100%{opacity:0} 12%,82%{opacity:1} }
    }
  `}</style>;
}

/** One player's newest emote is anchored to that player's leader/name plate. */
function BattleLeaderEmote({ state, ownerId, now }: { state: MatchState; ownerId: string; now: number }) {
  const entry = [...(state.battleEmotes ?? [])].reverse().find((candidate) => candidate.senderId === ownerId && now - candidate.createdAt < 4300);
  if (!entry) return null;
  const item = V34_BATTLE_EMOTE_BY_ID[entry.emoteId];
  if (!item) return null;
  return <span key={entry.id} className="v34f-leader-emote" role="status" aria-label={`감정표현 ${item.name}`}><img src={item.asset} alt="" /><small>{item.name}</small></span>;
}

type DuelBoardLocalAction = (gameAction: string, extra?: Record<string, unknown>) => Promise<RoomPayload>;

function DuelBoard({ payload, userId, onRefresh, onLeave, syncState, lastSyncAt, localAction, practiceMode, onPresentationBusyChange, onInspectCard }: { payload: RoomPayload; userId: string; onRefresh: (payload: RoomPayload) => void; onLeave: () => void; syncState: 'live' | 'syncing' | 'offline'; lastSyncAt: number; localAction?: DuelBoardLocalAction; practiceMode?: PracticeDifficulty; onPresentationBusyChange?: (busy: boolean) => void; onInspectCard?: (cardId: string) => void }) {
  const { room, privateState: nullablePrivateState } = payload;
  const nullableState = room.state;
  const [selectedHand, setSelectedHand] = useState<string | null>(null);
  const [selectedExtra, setSelectedExtra] = useState<string | null>(null);
  const [selectedExtraChoice, setSelectedExtraChoice] = useState<number | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);
  const [selectedSummonZone, setSelectedSummonZone] = useState<number | null>(null);
  const [selectedExtraEffectTarget, setSelectedExtraEffectTarget] = useState<number | 'self' | null>(null);
  const [selectedAttacker, setSelectedAttacker] = useState<number | null>(null);
  const [selectedFieldUnit, setSelectedFieldUnit] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [logOpen, setLogOpen] = useState(false);
  const [surrenderOpen, setSurrenderOpen] = useState(false);
  const [endTurnConfirmOpen, setEndTurnConfirmOpen] = useState(false);
  const [extraOpen, setExtraOpen] = useState(false);
  const [emoteOpen, setEmoteOpen] = useState(false);
  const [emoteBusy, setEmoteBusy] = useState(false);
  const [activeVfx, setActiveVfx] = useState<VisualEvent | null>(null);
  const [vfxQueue, setVfxQueue] = useState<VisualEvent[]>([]);
  const [damagePopups, setDamagePopups] = useState<VisualEvent[]>([]);
  const [drawRevealQueue, setDrawRevealQueue] = useState<string[]>([]);
  const [recentDrawnIds, setRecentDrawnIds] = useState<Set<string>>(() => new Set());
  const [hoveredHandCardId, setHoveredHandCardId] = useState<string | null>(null);
  const [turnNotice, setTurnNotice] = useState<{ mine: boolean; turn: number } | null>(null);
  const [summonBlock, setSummonBlock] = useState<{ cardId: string; title: string; reasons: string[] } | null>(null);
  const [graveTargetOpen, setGraveTargetOpen] = useState(false);
  const [deckTargetOpen, setDeckTargetOpen] = useState(false);
  const [graveCardTargetOpen, setGraveCardTargetOpen] = useState(false);
  const [coinClock, setCoinClock] = useState(() => Date.now());
  const [turnClock, setTurnClock] = useState(() => Date.now());
  const timeoutSyncTurn = useRef<number>(-1);
  const announcedTurn = useRef<string>('');
  const seenVfx = useRef<Set<string>>(new Set());
  const seenDamagePopups = useRef<Set<string>>(new Set(nullableState?.visualEvents.filter((event) => Date.now() - event.createdAt > 2600).map((event) => event.id) ?? []));
  const knownHandIds = useRef<Set<string>>(new Set(nullablePrivateState?.hand.map((card) => card.instanceId) ?? []));
  const actionLock = useRef(false);
  const eclipsePhaseNotice = useEclipsePhaseNotice(nullableState, userId);

  const visualEvents = nullableState?.visualEvents ?? [];
  const visualEventSignature = visualEvents.map((event) => event.id).join('|');

  const snapshotHasQueuedPresentation = visualEvents.some((event) =>
    !seenVfx.current.has(event.id)
    && event.kind !== 'defense'
    && !(event.kind === 'special' && event.vfx.startsWith('eclipse-cycle-')),
  );
  useEffect(() => {
    onPresentationBusyChange?.(Boolean(activeVfx || vfxQueue.length > 0 || snapshotHasQueuedPresentation));
  }, [activeVfx, vfxQueue.length, snapshotHasQueuedPresentation, onPresentationBusyChange]);

  useEffect(() => {
    let unseen = visualEvents.filter((event) => !seenVfx.current.has(event.id) && event.kind !== 'defense' && !(event.kind === 'special' && event.vfx.startsWith('eclipse-cycle-')));
    if (unseen.length === 0) return;
    if (seenVfx.current.size === 0 && unseen.length > 1) {
      const now = Date.now();
      const recentBundle = unseen.filter((event) => now - event.createdAt <= 2600);
      // A server action can append ATTACK -> DAMAGE/HEAL in one snapshot. Keeping only
      // the last event made the HP number visible while the actual attack motion vanished.
      unseen = recentBundle.length > 0 ? recentBundle.slice(-5) : unseen.slice(-1);
    }
    visualEvents.forEach((event) => seenVfx.current.add(event.id));
    setVfxQueue((current) => {
      const merged = [...current, ...unseen];
      const deduped = merged.filter((event, index) => merged.findIndex((item) => item.id === event.id) === index);
      return deduped.slice(-8);
    });
  }, [visualEventSignature]);

  useEffect(() => {
    const damageEvents = visualEvents.filter((event) =>
      !seenDamagePopups.current.has(event.id)
      && ((event.kind === 'defense' && ((event.shieldAmount ?? 0) > 0 || (event.healthAmount ?? 0) > 0))
        || (event.kind === 'core' && (event.amount ?? 0) > 0)
        || (event.kind === 'heal' && (event.amount ?? 0) > 0)),
    );
    visualEvents.forEach((event) => seenDamagePopups.current.add(event.id));
    if (damageEvents.length === 0) return;
    setDamagePopups((current) => {
      const merged = [...current, ...damageEvents];
      const deduped = merged.filter((event, index) => merged.findIndex((item) => item.id === event.id) === index);
      return deduped.slice(-10);
    });
    const ids = new Set(damageEvents.map((event) => event.id));
    window.setTimeout(() => setDamagePopups((current) => current.filter((event) => !ids.has(event.id))), 1250);
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
    const timer = window.setInterval(() => setTurnClock(Date.now()), 500);
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
      if (localAction) {
        localAction('resolve_timeout')
          .then((nextPayload) => onRefresh(nextPayload))
          .catch((error) => setMessage(error instanceof Error ? error.message : '연습 대전 턴 시간 처리 실패'));
        return;
      }
      api('get_room', { roomId: room.id })
        .then((result) => {
          if (result.room && result.profiles) onRefresh({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null, members: result.members ?? [], spectatorHands: result.spectatorHands ?? undefined, spectatorSecrets: result.spectatorSecrets ?? undefined, battleEmotes: result.battleEmotes ?? [] });
        })
        .catch((error) => setMessage(error instanceof Error ? error.message : '턴 시간 동기화 실패'));
    }, delay);
    return () => window.clearTimeout(timer);
  }, [nullableState?.turnEndsAt, nullableState?.turnNumber, nullableState?.status, room.id, onRefresh, localAction]);

  useEffect(() => {
    setSelectedHand(null);
    setSelectedExtra(null);
    setSelectedExtraChoice(null);
    setSelectedMaterials([]);
    setSelectedSummonZone(null);
    setSelectedExtraEffectTarget(null);
    setSelectedAttacker(null);
    setSelectedFieldUnit(null);
    setHoveredHandCardId(null);
    setExtraOpen(false);
    setGraveTargetOpen(false);
    setDeckTargetOpen(false);
    setGraveCardTargetOpen(false);
    setEndTurnConfirmOpen(false);
    setMessage('');
  }, [nullableState?.turnNumber, nullableState?.currentPlayerId]);

  useEffect(() => {
    const cancel = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setSelectedHand(null);
      setSelectedExtra(null);
      setSelectedExtraChoice(null);
      setSelectedMaterials([]);
      setSelectedSummonZone(null);
      setSelectedExtraEffectTarget(null);
      setSelectedAttacker(null);
      setSelectedFieldUnit(null);
      setGraveTargetOpen(false);
      setDeckTargetOpen(false);
      setGraveCardTargetOpen(false);
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
  }, [activeVfx, vfxQueue]);

  useEffect(() => {
    if (!activeVfx) return;
    const next = activeVfx;
    const duration = next.kind === 'fusion' || next.kind === 'evolution' ? 2450
      : next.kind === 'trap' ? 2250
        : next.kind === 'special' && (next.vfx === 'execution-scythe' || next.vfx === 'sweep-volley') ? 1080
          : next.kind === 'summon' || next.kind === 'special' || next.kind === 'spell' ? 1450
          : next.kind === 'attack' ? 1250
            : next.kind === 'core' || next.kind === 'destroy' ? 1120
              : next.kind === 'defense' ? 1220
                : next.kind === 'heal' || next.kind === 'buff' || next.kind === 'energy' ? 1050
                  : next.kind === 'draw' ? 1250
                    : next.kind === 'turn' ? 850
                      : 760;
    const timer = window.setTimeout(() => {
      setActiveVfx((current) => current?.id === next.id ? null : current);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [activeVfx?.id]);

  useEffect(() => {
    if (!activeVfx) return;
    const sound: UiSound = activeVfx.kind === 'special' && (activeVfx.vfx === 'legendary-fusion-choice' || activeVfx.vfx === 'legendary-evolution-choice') ? 'success'
      : activeVfx.kind === 'attack' ? 'attack'
      : activeVfx.kind === 'fusion' ? 'fusion'
        : activeVfx.kind === 'evolution' ? 'evolution'
          : activeVfx.kind === 'spell' ? 'spell'
            : activeVfx.kind === 'trap' || activeVfx.kind === 'set' ? 'trap'
              : activeVfx.kind === 'core' ? 'corehit'
                : activeVfx.kind === 'destroy' ? 'destroy'
                  : activeVfx.kind === 'defense' && (activeVfx.shieldAmount ?? 0) > 0 && (activeVfx.healthAmount ?? 0) === 0 ? 'shield'
                    : activeVfx.kind === 'defense' ? 'damage'
                      : activeVfx.kind === 'heal' || activeVfx.kind === 'buff' || activeVfx.kind === 'energy' ? 'success'
                        : activeVfx.kind === 'draw' ? 'draw'
                          : activeVfx.kind === 'turn' ? 'turn'
                            : 'summon';
    playUiSound(sound);
    const impactTimer = activeVfx.kind === 'attack' ? window.setTimeout(() => playUiSound('impact'), 270) : undefined;
    return () => { if (impactTimer) window.clearTimeout(impactTimer); };
  }, [activeVfx?.id]);

  useEffect(() => {
    let confirmed = false;
    const unlockAudio = () => {
      const context = getAudioContext();
      if (!context) return;
      const confirm = () => {
        if (confirmed || !globalSoundEnabled || globalSoundVolume <= 0) return;
        confirmed = true;
        playUiSound('click');
      };
      if (context.state === 'suspended') void context.resume().then(confirm).catch(() => undefined);
      else confirm();
    };
    window.addEventListener('pointerdown', unlockAudio, true);
    window.addEventListener('keydown', unlockAudio, true);
    return () => {
      window.removeEventListener('pointerdown', unlockAudio, true);
      window.removeEventListener('keydown', unlockAudio, true);
    };
  }, []);

  const preCoinTossActive = Boolean(nullableState?.coinToss && coinClock < nullableState.coinToss.endsAt);
  const turnNoticeKey = nullableState ? `${nullableState.turnNumber}:${nullableState.currentPlayerId ?? ''}:${nullableState.status}` : '';
  useEffect(() => {
    if (!nullableState || nullableState.status !== 'active' || !nullableState.currentPlayerId || preCoinTossActive) return;
    if (!turnNoticeKey || announcedTurn.current === turnNoticeKey) return;
    announcedTurn.current = turnNoticeKey;
    setTurnNotice({ mine: nullableState.currentPlayerId === userId, turn: nullableState.turnNumber });
    const timer = window.setTimeout(() => setTurnNotice(null), 1450);
    return () => window.clearTimeout(timer);
  }, [turnNoticeKey, preCoinTossActive, userId]);

  useEffect(() => {
    if (!nullableState?.pendingTrap?.id) return;
    playUiSound('trap');
  }, [nullableState?.pendingTrap?.id]);


  useEffect(() => () => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
  }, []);

  if (!nullableState || !nullablePrivateState || nullableState.playerOrder.length !== 2) return <LoadingScreen text="결투 상태를 동기화하는 중" />;
  const state = nullableState;
  const privateState = nullablePrivateState;
  const pendingTrap = state.pendingTrap ?? null;
  const pendingExtraChoice = state.pendingExtraChoice ?? null;
  const interactionLocked = Boolean(pendingTrap || pendingExtraChoice);

  const opponentId = state.playerOrder.find((id) => id !== userId) ?? '';
  const profileMap = Object.fromEntries(payload.profiles.map((profile) => [profile.user_id, profile]));
  const me = profileMap[userId];
  const opponent = profileMap[opponentId];
  const matchXpReward = state.status === 'finished' ? (state.winnerId === userId ? 100 : 35) : 0;
  const levelUpCoinBonus = !practiceMode && matchXpReward > 0 && me
    ? levelAchievementCoinsBetween(Math.max(0, (me.xp ?? 0) - matchXpReward), me.xp ?? 0)
    : 0;
  const pendingTrapInstance = pendingTrap?.ownerId === userId ? privateState.secrets[pendingTrap.trapZone] : null;
  const pendingTrapCard = pendingTrapInstance ? CARD_BY_ID[pendingTrapInstance.cardId] : undefined;
  const pendingExtraChoiceUnit = pendingExtraChoice ? state.boards[pendingExtraChoice.ownerId]?.units[pendingExtraChoice.zone] ?? null : null;
  const pendingExtraChoiceCard = pendingExtraChoiceUnit ? CARD_BY_ID[pendingExtraChoiceUnit.cardId] : (pendingExtraChoice ? CARD_BY_ID[pendingExtraChoice.cardId] : undefined);
  const trapResponseSeconds = pendingTrap ? Math.max(0, Math.ceil((pendingTrap.endsAt - turnClock) / 1000)) : 0;
  const coinTossActive = Boolean(state.coinToss && coinClock < state.coinToss.endsAt);
  const turnExpiredLocally = Boolean(!coinTossActive && state.turnEndsAt && turnClock >= state.turnEndsAt);
  const myTurn = state.currentPlayerId === userId && !coinTossActive && !turnExpiredLocally;
  const turnSecondsLeft = coinTossActive ? TURN_DURATION_SECONDS : Math.max(0, Math.ceil(((state.turnEndsAt ?? (turnClock + TURN_DURATION_MS)) - turnClock) / 1000));
  const turnTimerPercent = Math.max(0, Math.min(100, (turnSecondsLeft / TURN_DURATION_SECONDS) * 100));
  const selectedInstance = privateState.hand.find((card) => card.instanceId === selectedHand);
  const selectedCard = selectedInstance ? CARD_BY_ID[selectedInstance.cardId] : undefined;
  const selectedExtraInstance = privateState.extra.find((card) => card.instanceId === selectedExtra);
  const selectedExtraCard = selectedExtraInstance ? CARD_BY_ID[selectedExtraInstance.cardId] : undefined;
  const hoveredHandCard = hoveredHandCardId ? CARD_BY_ID[hoveredHandCardId] : undefined;
  const previewCard = selectedCard ?? selectedExtraCard ?? hoveredHandCard;
  const previewIsHoverOnly = Boolean(hoveredHandCard && !selectedCard && !selectedExtraCard);
  const requiredMaterials = selectedExtraCard ? extraRequiredUnitCount(selectedExtraCard) : 0;
  const selectedMaterialUnits = selectedMaterials
    .map((zone) => state.boards[userId]?.units[zone])
    .filter((unit): unit is UnitState => Boolean(unit));
  const selectedMaterialsValid = Boolean(selectedExtraCard && clientSelectedExtraMaterialsValid(selectedMaterialUnits, selectedExtraCard, state.turnNumber));
  const selectedExtraChoiceReady = Boolean(!selectedExtraCard?.extraChoices?.length || (selectedExtraChoice !== null && Boolean(selectedExtraCard.extraChoices[selectedExtraChoice])));
  const selectedCardSummonNeedsTarget = Boolean(selectedCard?.kind === 'unit' && summonEffectNeedsFriendlyTarget(selectedCard));
  const selectedExtraSummonNeedsTarget = Boolean(selectedExtraCard && summonEffectNeedsFriendlyTarget(selectedExtraCard));
  const selectedExtraTargetReady = Boolean(!selectedExtraSummonNeedsTarget || selectedExtraEffectTarget !== null);
  const canExtraSummon = Boolean(selectedExtraCard && selectedExtra && selectedMaterials.length === requiredMaterials && selectedMaterialsValid && selectedExtraTargetReady && myTurn && !interactionLocked && state.phase === 'main' && !busy);
  const canAttemptExtraSummon = Boolean(selectedExtraCard && selectedExtra && myTurn && !interactionLocked && state.phase === 'main' && !busy);
  const canSpendTurnToDraw = Boolean(myTurn && state.phase === 'main' && !state.turnActionTaken && !busy && (state.deckCounts[userId] ?? 0) > 0);
  const myEnergy = state.energy[userId] ?? { current: 0, max: 0 };
  const opponentEnergy = state.energy[opponentId] ?? { current: 0, max: 0 };
  const myEnergyHardCap = 10 + Math.max(0, state.energyMaxBonus?.[userId] ?? 0);
  const opponentEnergyHardCap = 10 + Math.max(0, state.energyMaxBonus?.[opponentId] ?? 0);
  const myExtraUsage = state.extraSummonUsage?.[userId] ?? { fusion: 0, evolution: 0 };
  const myExtraTurn = state.extraSummonTurn?.[userId] ?? {};
  const energySacrificeUsed = state.energySacrificeTurn?.[userId] === state.turnNumber;
  const fieldSacrificeUsed = state.fieldSacrificeTurn?.[userId] === state.turnNumber;
  const energyDrawCountThisTurn = state.energyDrawTurn?.[userId] === state.turnNumber ? Math.max(1, Math.trunc(state.energyDrawCount?.[userId] ?? 0)) : 0;
  const energyDrawCost = 2 + energyDrawCountThisTurn;
  const hasDrawableCard = (state.deckCounts[userId] ?? 0) > 0 || (state.graveyards[userId] ?? []).some((cardId) => {
    const card = CARD_BY_ID[cardId];
    return Boolean(card && (card.kind === 'unit' || card.kind === 'spell' || card.kind === 'trap'));
  });
  const canEnergyDraw = Boolean(myTurn && !interactionLocked && state.phase === 'main' && !busy && myEnergy.current >= energyDrawCost && hasDrawableCard);
  const selectedFieldUnitState = selectedFieldUnit !== null ? state.boards[userId].units[selectedFieldUnit] : null;
  const selectedFieldUnitCard = selectedFieldUnitState ? CARD_BY_ID[selectedFieldUnitState.cardId] : undefined;
  const canRetireSelectedFieldUnit = Boolean(selectedFieldUnitState && myTurn && !interactionLocked && state.phase === 'main' && !busy && !fieldSacrificeUsed);
  const canSacrificeSelectedForEnergy = Boolean(selectedHand && selectedCard && myTurn && !interactionLocked && state.phase === 'main' && !busy && !energySacrificeUsed && myEnergy.current < myEnergyHardCap);
  const selectedConsumesBuffSlot = Boolean(selectedCard?.kind === 'spell' && selectedCard.effect && (selectedCard.effect.kind === 'buff_unit' || selectedCard.effect.kind === 'shield_unit' || selectedCard.effect.kind === 'buff_by_hand'));
  const graveyardReviveTargets = (state.graveyards[userId] ?? []).flatMap((cardId, graveyardIndex) => {
    const card = CARD_BY_ID[cardId];
    return card?.kind === 'unit' ? [{ card, graveyardIndex }] : [];
  });
  const deckTutorTargets = privateState.deck
    .map((instance) => CARD_BY_ID[instance.cardId])
    .filter((card): card is CardDefinition => Boolean(card))
    .filter((card, index, all) => all.findIndex((item) => item.id === card.id) === index)
    .filter((card) => selectedCard?.effect?.kind !== 'tutor_series_card' || card.seriesId === selectedCard.seriesId)
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name, 'ko'));
  const graveyardCardTargets = (state.graveyards[userId] ?? []).flatMap((cardId, graveyardIndex) => {
    const card = CARD_BY_ID[cardId];
    return card && (card.kind === 'unit' || card.kind === 'spell' || card.kind === 'trap') ? [{ card, graveyardIndex }] : [];
  });
  const canChooseDeckTutorTarget = Boolean(myTurn && !interactionLocked && state.phase === 'main' && selectedCard?.target === 'own_deck_card' && selectedCard && myEnergy.current >= selectedCard.cost && deckTutorTargets.length > 0 && !busy);
  const canChooseGraveCardTarget = Boolean(myTurn && !interactionLocked && state.phase === 'main' && selectedCard?.target === 'friendly_graveyard_card' && selectedCard && myEnergy.current >= selectedCard.cost && graveyardCardTargets.length > 0 && !busy);
  const selectingGraveyardTarget = Boolean(myTurn && !interactionLocked && state.phase === 'main' && selectedCard?.target === 'friendly_graveyard_unit');
  const canChooseGraveyardTarget = Boolean(selectingGraveyardTarget && selectedCard && myEnergy.current >= selectedCard.cost && graveyardReviveTargets.length > 0 && state.boards[userId].units.some((slot) => !slot) && !busy);
  const nextMyEnergyMax = myTurn ? myEnergy.max : Math.min(myEnergyHardCap, Math.max(1, myEnergy.max + 1));
  const roundNumber = Math.max(1, Math.ceil(state.turnNumber / 2));
  const phaseLabel = state.phase === 'main' ? '메인 단계' : '전투 단계';
  const selectedHandCost = selectedCard?.summonMode === 'rift' && selectedCard.riftCost !== undefined ? `${selectedCard.cost} / 균열 ${selectedCard.riftCost}` : selectedCard?.cost;
  const selectingUnitToSummon = Boolean(myTurn && !interactionLocked && state.phase === 'main' && selectedCard?.kind === 'unit' && selectedCard.summonMode !== 'legendary');
  const selectingSummonEffectTarget = Boolean(selectedCardSummonNeedsTarget && selectedSummonZone !== null && myTurn && !interactionLocked && state.phase === 'main');
  const selectingTrapToSet = Boolean(myTurn && !interactionLocked && state.phase === 'main' && selectedCard?.kind === 'trap');
  const selectingEnemyTarget = Boolean(myTurn && !interactionLocked && state.phase === 'main' && selectedCard?.target === 'enemy_unit');
  const selectingFriendlyTarget = Boolean(myTurn && !interactionLocked && state.phase === 'main' && selectedCard?.target === 'friendly_unit');
  const selectingExtraEffectTarget = Boolean(selectedExtraSummonNeedsTarget && selectedMaterials.length === requiredMaterials && selectedMaterialsValid && myTurn && !interactionLocked && state.phase === 'main');
  const selectingMaterials = Boolean(myTurn && !interactionLocked && state.phase === 'main' && selectedExtraCard && !selectingExtraEffectTarget);
  const selectingAttackTarget = Boolean(myTurn && !interactionLocked && state.phase === 'battle' && selectedAttacker !== null);
  const opponentHasUnits = state.boards[opponentId].units.some(Boolean);
  const guardTargetIndexes = state.boards[opponentId].units.flatMap((unit, index) => unit && CARD_BY_ID[unit.cardId]?.keywords?.includes('guard') ? [index] : []);
  const selectedAttackerUnit = selectedAttacker !== null ? state.boards[userId].units[selectedAttacker] : null;
  const selectedAttackerCard = selectedAttackerUnit ? CARD_BY_ID[selectedAttackerUnit.cardId] : undefined;
  const directAttackOpen = !opponentHasUnits || (Boolean(selectedAttackerCard?.keywords?.includes('corestrike')) && guardTargetIndexes.length === 0);
  const selectedAttackerCanHitCore = Boolean(selectingAttackTarget && directAttackOpen);
  const attackableTargetIndexes = selectedAttacker !== null && state.phase === 'battle'
    ? (guardTargetIndexes.length > 0 ? guardTargetIndexes : state.boards[opponentId].units.flatMap((unit, index) => unit ? [index] : []))
    : [];
  const myFieldUnits = state.boards[userId].units.filter((unit): unit is UnitState => Boolean(unit));
  const riftReadyInstances = privateState.hand.filter((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    if (!card || card.kind !== 'unit' || card.summonMode !== 'rift' || !clientEclipseSummonReady(state, card)) return false;
    const cost = card.riftCost ?? card.cost;
    return myTurn && !interactionLocked && state.phase === 'main' && myEnergy.current >= cost && state.boards[userId].units.some((slot) => !slot) && clientRiftReady(state, userId, opponentId, card);
  });
  const legendarySpecialReadyInstances = privateState.hand.filter((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    if (!card || card.kind !== 'unit' || card.summonMode !== 'legendary' || !clientEclipseSummonReady(state, card)) return false;
    return myTurn && !interactionLocked && state.phase === 'main' && myEnergy.current >= card.cost && clientLegendaryReady(state, userId, opponentId, card);
  });
  const extraReadyInstances = privateState.extra.filter((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    if (!card || card.cost > myEnergy.current || !myTurn || interactionLocked || state.phase !== 'main' || !clientEclipseSummonReady(state, card)) return false;
    const totalExtraUsed = myExtraUsage.fusion + myExtraUsage.evolution;
    if (roundNumber < 3 || totalExtraUsed >= 2 || (totalExtraUsed >= 1 && roundNumber < 5)) return false;
    if (card.kind === 'fusion') {
      if (myExtraUsage.fusion >= 2 || myExtraTurn.fusion === state.turnNumber) return false;
      return clientExtraReadyFromField(myFieldUnits, card, state.turnNumber);
    }
    if (card.kind === 'evolution') {
      if (myExtraUsage.evolution >= 2 || myExtraTurn.evolution === state.turnNumber) return false;
      return clientExtraReadyFromField(myFieldUnits, card, state.turnNumber);
    }
    return false;
  });
  const specialReadyIds = new Set([...riftReadyInstances.map((item) => item.instanceId), ...legendarySpecialReadyInstances.map((item) => item.instanceId), ...extraReadyInstances.map((item) => item.instanceId)]);
  const specialReadyCount = specialReadyIds.size;
  const legendaryReadyFromHand = privateState.hand.flatMap((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    if (!card || card.rarity !== 'legendary' || card.kind !== 'unit' || !myTurn || interactionLocked || state.phase !== 'main' || !clientEclipseSummonReady(state, card)) return [];
    const cost = card.summonMode === 'rift' ? (card.riftCost ?? card.cost) : card.cost;
    const ready = card.summonMode === 'rift'
      ? myEnergy.current >= cost && state.boards[userId].units.some((slot) => !slot) && clientRiftReady(state, userId, opponentId, card)
      : card.summonMode === 'legendary'
        ? myEnergy.current >= cost && clientLegendaryReady(state, userId, opponentId, card)
        : false;
    return ready ? [{ instanceId: instance.instanceId, card, source: 'hand' as const }] : [];
  });
  const legendaryReadyFromExtra = extraReadyInstances.flatMap((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    return card?.rarity === 'legendary' ? [{ instanceId: instance.instanceId, card, source: 'extra' as const }] : [];
  });
  const legendaryReadyCards = [...legendaryReadyFromHand, ...legendaryReadyFromExtra];

  function handSummonBlockReasons(card: CardDefinition): string[] {
    const reasons: string[] = [];
    if (!myTurn) reasons.push('지금은 상대 턴입니다.');
    if (state.phase !== 'main') reasons.push('유닛 소환은 메인 단계에서만 가능합니다.');
    if (interactionLocked) reasons.push('현재 함정 발동 여부를 결정하는 중이라 다른 행동을 할 수 없습니다.');
    if (!clientEclipseSummonReady(state, card)) reasons.push(`시간대 소환 조건이 맞지 않습니다. 현재 ${ECLIPSE_PHASE_LABEL[clientCurrentEclipsePhase(state)]} · 필요 ${card.eclipseSummonPhases?.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' · ')}.`);
    if (card.summonMode !== 'legendary' && !state.boards[userId].units.some((slot) => !slot)) reasons.push('내 유닛 칸 5개가 모두 차 있습니다.');
    const requiredEnergy = card.summonMode === 'rift' ? (card.riftCost ?? card.cost) : card.cost;
    if (myEnergy.current < requiredEnergy) reasons.push(`에너지가 부족합니다. 필요 ${requiredEnergy} / 현재 ${myEnergy.current}.`);
    const riftReason = clientRiftBlockReason(state, userId, opponentId, card);
    if (riftReason) reasons.push(riftReason);
    const legendaryReason = clientLegendaryBlockReason(state, userId, opponentId, card);
    if (legendaryReason) reasons.push(legendaryReason);
    return reasons;
  }

  function extraSummonBlockReasons(card: CardDefinition): string[] {
    const reasons: string[] = [];
    const totalExtraUsed = myExtraUsage.fusion + myExtraUsage.evolution;
    if (!myTurn) reasons.push('지금은 상대 턴입니다.');
    if (state.phase !== 'main') reasons.push('융합·진화는 메인 단계에서만 가능합니다.');
    if (interactionLocked) reasons.push('현재 함정 발동 여부를 결정하는 중이라 다른 행동을 할 수 없습니다.');
    if (!clientEclipseSummonReady(state, card)) reasons.push(`시간대 소환 조건이 맞지 않습니다. 현재 ${ECLIPSE_PHASE_LABEL[clientCurrentEclipsePhase(state)]} · 필요 ${card.eclipseSummonPhases?.map((phase) => ECLIPSE_PHASE_LABEL[phase]).join(' · ')}.`);
    if (myEnergy.current < card.cost) reasons.push(`에너지가 부족합니다. 필요 ${card.cost} / 현재 ${myEnergy.current}.`);
    if (roundNumber < 3) reasons.push('엑스트라 소환은 ROUND 3부터 해금됩니다. 초반 일반 카드 전개가 우선입니다.');
    if (totalExtraUsed >= 2) reasons.push('엑스트라 소환은 공명·계승을 합쳐 한 게임에 최대 2번만 사용할 수 있습니다.');
    if (totalExtraUsed >= 1 && roundNumber < 5) reasons.push('두 번째 엑스트라 소환은 ROUND 5부터 사용할 수 있습니다.');
    if (card.kind === 'fusion') {
      if (myExtraUsage.fusion >= 2) reasons.push('공명 융합은 한 게임에 최대 2번만 사용할 수 있습니다.');
      if (myExtraTurn.fusion === state.turnNumber) reasons.push('공명 융합은 한 턴에 1번만 사용할 수 있습니다.');
    } else if (card.kind === 'evolution') {
      if (myExtraUsage.evolution >= 2) reasons.push('계승 진화는 한 게임에 최대 2번만 사용할 수 있습니다.');
      if (myExtraTurn.evolution === state.turnNumber) reasons.push('계승 진화는 한 턴에 1번만 사용할 수 있습니다.');
    }
    if ((card.kind === 'fusion' || card.kind === 'evolution') && !clientExtraReadyFromField(myFieldUnits, card, state.turnNumber)) {
      const progressReasons = clientExtraProgressReasons(myFieldUnits, card, state.turnNumber);
      if (progressReasons.length > 0) reasons.push(...progressReasons);
      else reasons.push(`소환 소재 조건: ${extraRequirement(card)}.`);
    }
    return reasons;
  }

  function showSummonBlock(card: CardDefinition, reasons: string[]) {
    setSummonBlock({ cardId: card.id, title: `${card.name} · 지금 소환할 수 없는 이유`, reasons: reasons.length ? reasons : ['필요한 소환 조건을 다시 확인해 주세요.'] });
    playUiSound('remove');
  }

  function clearSelection(note = '') {
    setSelectedHand(null);
    setSelectedExtra(null);
    setSelectedExtraChoice(null);
    setSelectedMaterials([]);
    setSelectedSummonZone(null);
    setSelectedExtraEffectTarget(null);
    setSelectedAttacker(null);
    setSelectedFieldUnit(null);
    setGraveTargetOpen(false);
    setDeckTargetOpen(false);
    setGraveCardTargetOpen(false);
    if (note) setMessage(note);
  }

  async function sendEmote(emoteId: string) {
    if (emoteBusy || state.status !== 'active') return;
    setEmoteBusy(true); setMessage('');
    try {
      if (localAction) {
        const nextPayload = await localAction('battle_emote', { emoteId });
        onRefresh(nextPayload);
      } else {
        const result = await api('game_action', { roomId: room.id, gameAction: 'battle_emote', emoteId });
        if (result.room && result.profiles) onRefresh({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null, members: result.members ?? [], spectatorHands: result.spectatorHands ?? undefined, spectatorSecrets: result.spectatorSecrets ?? undefined, battleEmotes: result.battleEmotes ?? payload.battleEmotes ?? [] });
      }
      setEmoteOpen(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '감정표현 전송 실패');
    } finally { setEmoteBusy(false); }
  }

  async function gameAction(gameAction: string, extra: Record<string, unknown> = {}) {
    if (actionLock.current || busy) return;
    actionLock.current = true;
    setBusy(true);
    setMessage('');
    try {
      if (localAction) {
        const nextPayload = await localAction(gameAction, extra);
        onRefresh(nextPayload);
      } else {
        const result = await api('game_action', { roomId: room.id, gameAction, ...extra });
        if (result.room && result.profiles) onRefresh({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null, members: result.members ?? [], spectatorHands: result.spectatorHands ?? undefined, spectatorSecrets: result.spectatorSecrets ?? undefined, battleEmotes: result.battleEmotes ?? [] });
      }
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
    setSelectedExtraChoice(null);
    setSelectedMaterials([]);
    setSelectedSummonZone(null);
    setSelectedExtraEffectTarget(null);
    setSelectedAttacker(null);
    setSelectedFieldUnit(null);
    setGraveTargetOpen(false);
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
    setSelectedExtraChoice(null);
    setSelectedHand(null);
    setSelectedMaterials([]);
    setSelectedSummonZone(null);
    setSelectedExtraEffectTarget(null);
    setSelectedAttacker(null);
    setSelectedFieldUnit(null);
    setGraveTargetOpen(false);
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
    const blockReasons = handSummonBlockReasons(selectedCard);
    if (blockReasons.length > 0) {
      showSummonBlock(selectedCard, blockReasons);
      return;
    }
    if (summonEffectNeedsFriendlyTarget(selectedCard)) {
      if (selectedSummonZone === zone) {
        setMessage(`${selectedCard.name}의 등장 효과를 새로 소환되는 자신에게 적용합니다.`);
        gameAction('play_card', { instanceId: selectedHand, zone, target: { ownerId: userId, unitIndex: -1 } });
        return;
      }
      setSelectedSummonZone(zone);
      setMessage(`소환 위치를 선택했습니다. 이제 ${summonTargetEffectLabel(selectedCard)}을(를) 받을 아군 캐릭터를 선택하세요. 방금 선택한 빈 칸을 다시 누르면 자신에게 적용됩니다.`);
      return;
    }
    gameAction('play_card', { instanceId: selectedHand, zone });
  }

  function summonSelectedLegendary() {
    if (!selectedCard || selectedCard.kind !== 'unit' || selectedCard.summonMode !== 'legendary' || !selectedHand) {
      setMessage('먼저 손패의 전설 특수 소환 카드를 선택하세요.');
      return;
    }
    const blockReasons = handSummonBlockReasons(selectedCard);
    if (blockReasons.length > 0) {
      showSummonBlock(selectedCard, blockReasons);
      return;
    }
    if (summonEffectNeedsFriendlyTarget(selectedCard)) {
      setSelectedSummonZone(-1);
      setMessage(`전설 소환 조건 확인 완료. 이제 ${summonTargetEffectLabel(selectedCard)}을(를) 받을 아군 캐릭터를 선택하세요. 오른쪽의 “소환체 자신”을 누르면 자신에게 적용됩니다.`);
      return;
    }
    setMessage(`${selectedCard.legendarySummonRule?.name ?? '전설 강림'} 발동 — 조건에 따라 릴리스가 자동 처리됩니다.`);
    gameAction('play_card', { instanceId: selectedHand });
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
    const limit = extraRequiredUnitCount(selectedExtraCard);
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
    if (selectedCard && selectedHand && selectingSummonEffectTarget && ownerId === userId) {
      setMessage(`${card?.name ?? '선택한 캐릭터'}에게 ${summonTargetEffectLabel(selectedCard)} 효과를 적용하고 소환합니다.`);
      gameAction('play_card', {
        instanceId: selectedHand,
        ...(selectedSummonZone !== null && selectedSummonZone >= 0 ? { zone: selectedSummonZone } : {}),
        target: { ownerId: userId, unitIndex },
      });
      return;
    }
    if (selectedExtraCard && ownerId === userId && state.phase === 'main') {
      if (selectingExtraEffectTarget) {
        if (selectedMaterials.includes(unitIndex)) {
          toggleMaterial(unitIndex);
          setSelectedExtraEffectTarget(null);
          setMessage('선택한 소재를 해제했습니다. 소재 구성을 다시 맞춰 주세요.');
          return;
        }
        setSelectedExtraEffectTarget(unitIndex);
        setMessage(`${card?.name ?? '선택한 캐릭터'}에게 ${summonTargetEffectLabel(selectedExtraCard)} 효과를 적용하도록 지정했습니다.`);
        return;
      }
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
        if (selectedConsumesBuffSlot && unit?.buffCardApplied) {
          setMessage('이 캐릭터는 이미 버프류 카드를 1번 적용받았습니다. 다른 캐릭터를 선택하세요.');
          return;
        }
        gameAction('play_card', { instanceId: selectedHand, target: { ownerId, unitIndex } });
        return;
      }
      if (selectedCard.target !== 'none' && selectedCard.target !== 'enemy_core') {
        setMessage('이 카드는 현재 선택한 대상에 사용할 수 없습니다. 빛나는 칸을 선택하세요.');
        return;
      }
    }
    if (!selectedCard && !selectedExtraCard && ownerId === userId && unit && state.phase === 'main') {
      setSelectedFieldUnit((current) => current === unitIndex ? null : unitIndex);
      setMessage(fieldSacrificeUsed
        ? '필드 정리는 이번 턴에 이미 사용했습니다. i 버튼으로 카드 상세를 볼 수 있습니다.'
        : `${card?.name ?? '캐릭터'} 선택 · 아래 “필드 → ENERGY” 버튼으로 묘지에 보내 빈 칸을 만들 수 있습니다.`);
      return;
    }
    if (selectedAttacker !== null && ownerId === opponentId && state.phase === 'battle') {
      if (!attackableTargetIndexes.includes(unitIndex)) {
        setMessage(guardTargetIndexes.length > 0 ? '수호 유닛이 있습니다. 수호 표시가 있는 유닛을 먼저 공격해야 합니다.' : '현재 공격할 수 없는 대상입니다.');
        return;
      }
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

  function openGraveyardTargetPicker() {
    if (!selectedCard || !selectedHand || selectedCard.target !== 'friendly_graveyard_unit') return;
    if (myEnergy.current < selectedCard.cost) {
      setMessage(`에너지가 부족합니다. 필요 ${selectedCard.cost} / 현재 ${myEnergy.current}.`);
      return;
    }
    if (!state.boards[userId].units.some((slot) => !slot)) {
      setMessage('부활시킬 빈 유닛 칸이 없습니다.');
      return;
    }
    if (graveyardReviveTargets.length === 0) {
      setMessage('내 묘지에 부활시킬 메인 덱 유닛이 없습니다.');
      return;
    }
    setGraveTargetOpen(true);
    setMessage('묘지에서 부활시킬 유닛 1장을 선택하세요.');
  }

  function reviveFromGraveyard(graveyardIndex: number) {
    if (!selectedHand || !selectedCard || selectedCard.target !== 'friendly_graveyard_unit') return;
    setGraveTargetOpen(false);
    gameAction('play_card', { instanceId: selectedHand, target: { ownerId: userId, graveyardIndex } });
  }

  function openDeckTutorPicker() {
    if (!selectedCard || !selectedHand || selectedCard.target !== 'own_deck_card') return;
    if (!canChooseDeckTutorTarget) {
      setMessage(deckTutorTargets.length === 0 ? '조건에 맞는 카드가 현재 덱에 없습니다.' : `ENERGY ${selectedCard.cost}이 필요합니다.`);
      return;
    }
    setDeckTargetOpen(true);
    setMessage(selectedCard.effect?.kind === 'tutor_series_card' ? '같은 시리즈에서 가져올 카드 1장을 선택하세요.' : '덱에서 가져올 카드 1장을 선택하세요.');
  }

  function tutorFromDeck(cardId: string) {
    if (!selectedHand || !selectedCard || selectedCard.target !== 'own_deck_card') return;
    setDeckTargetOpen(false);
    gameAction('play_card', { instanceId: selectedHand, target: { ownerId: userId, deckCardId: cardId } });
  }

  function openGraveCardPicker() {
    if (!selectedCard || !selectedHand || selectedCard.target !== 'friendly_graveyard_card') return;
    if (!canChooseGraveCardTarget) {
      setMessage(graveyardCardTargets.length === 0 ? '회수할 수 있는 메인 덱 카드가 묘지에 없습니다.' : `ENERGY ${selectedCard.cost}이 필요합니다.`);
      return;
    }
    setGraveCardTargetOpen(true);
    setMessage('묘지에서 손패로 되돌릴 카드 1장을 선택하세요.');
  }

  function recoverCardFromGrave(graveyardIndex: number) {
    if (!selectedHand || !selectedCard || selectedCard.target !== 'friendly_graveyard_card') return;
    setGraveCardTargetOpen(false);
    gameAction('play_card', { instanceId: selectedHand, target: { ownerId: userId, graveyardIndex } });
  }

  function sacrificeSelectedForEnergy() {
    if (!selectedHand || !selectedCard) {
      setMessage('에너지로 바꿀 손패 카드를 먼저 선택하세요.');
      return;
    }
    if (energySacrificeUsed) {
      setMessage('손패 에너지 전환은 한 턴에 1번만 사용할 수 있습니다.');
      return;
    }
    if (myEnergy.current >= myEnergyHardCap) {
      setMessage(`현재 에너지가 이미 최대 한도 ${myEnergyHardCap}입니다.`);
      return;
    }
    gameAction('sacrifice_energy', { instanceId: selectedHand });
  }

  function retireSelectedFieldUnit() {
    if (selectedFieldUnit === null || !selectedFieldUnitState) {
      setMessage('먼저 내 필드의 캐릭터를 선택하세요.');
      return;
    }
    if (fieldSacrificeUsed) {
      setMessage('필드 캐릭터 정리는 한 턴에 1번만 사용할 수 있습니다.');
      return;
    }
    gameAction('sacrifice_field_energy', { unitIndex: selectedFieldUnit });
  }

  function summonSelectedExtra() {
    if (!selectedExtra || !selectedExtraCard) {
      setMessage('먼저 엑스트라 카드를 선택하세요.');
      return;
    }
    const blockReasons = extraSummonBlockReasons(selectedExtraCard);
    if (blockReasons.length > 0) {
      showSummonBlock(selectedExtraCard, blockReasons);
      return;
    }
    if (selectedExtraSummonNeedsTarget && selectedExtraEffectTarget === null) {
      setMessage(`${summonTargetEffectLabel(selectedExtraCard)}을(를) 받을 아군 캐릭터를 선택하거나 “소환체 자신”을 선택하세요.`);
      return;
    }
    if (!canExtraSummon) {
      const detail = selectedMaterials.length !== requiredMaterials
        ? `필요한 소재를 모두 선택해야 합니다. 현재 ${selectedMaterials.length}/${requiredMaterials}장 선택.`
        : '선택한 소재 조합이 이 전설의 릴리스/비용/시리즈 조건을 만족하지 않습니다.';
      showSummonBlock(selectedExtraCard, [detail, extraRequirement(selectedExtraCard)]);
      return;
    }
    const target = selectedExtraSummonNeedsTarget
      ? { ownerId: userId, unitIndex: selectedExtraEffectTarget === 'self' ? -1 : Number(selectedExtraEffectTarget) }
      : undefined;
    gameAction('extra_summon', { extraInstanceId: selectedExtra, materialZones: selectedMaterials, ...(target ? { target } : {}) });
  }

  function spendTurnToDraw() {
    if (!canSpendTurnToDraw) return;
    if (!confirm('카드 1장을 추가로 뽑는 대신 이번 턴을 즉시 종료할까요?')) return;
    gameAction('draw_turn');
  }

  function spendEnergyForDraw() {
    if (!canEnergyDraw) return;
    clearSelection();
    setMessage(`ENERGY ${energyDrawCost}를 카드 1장으로 전환합니다. 턴은 계속됩니다.`);
    gameAction('energy_draw');
  }

  const actionGuide = !myTurn
    ? '상대 행동을 확인 중입니다. 중앙 연출과 최근 행동 기록에서 소환·주문·함정·공격을 확인할 수 있습니다.'
    : state.phase === 'battle'
      ? selectedAttacker !== null
        ? directAttackOpen ? '상대 필드가 비었습니다. 상대 리더를 눌러 직접 공격하세요.' : '공격할 상대 유닛을 선택하세요.'
        : '빛나는 내 유닛을 선택해 공격을 선언하세요.'
      : selectedExtraCard ? selectedExtraSummonNeedsTarget && selectedMaterials.length === requiredMaterials && selectedMaterialsValid && selectedExtraEffectTarget === null
        ? `${summonTargetEffectLabel(selectedExtraCard)}을(를) 받을 아군 캐릭터를 선택하거나 소환체 자신을 선택하세요.`
        : `${selectedExtraCard.extraChoices?.length ? '소환 성공 후 중앙에서 CHOOSE 효과 1개를 고릅니다 · ' : ''}소재 ${selectedMaterials.length}/${requiredMaterials} 선택 후 특수 소환하세요.`
        : selectedFieldUnitState ? `선택한 ${selectedFieldUnitCard?.name ?? '캐릭터'}을(를) 묘지로 보내 빈 칸을 만들고 에너지 1을 얻을 수 있습니다.`
        : selectedCard?.kind === 'unit' ? selectingSummonEffectTarget
          ? `${summonTargetEffectLabel(selectedCard)}을(를) 받을 아군 캐릭터를 선택하세요. 소환 위치를 다시 누르면 자신에게 적용됩니다.`
          : selectedCard.summonMode === 'legendary' ? '오른쪽의 전설 특수 소환 버튼을 눌러 강림 조건을 확인하거나 발동하세요.' : '빛나는 빈 유닛 칸을 눌러 소환하세요.'
          : selectedCard?.kind === 'trap' ? '빛나는 빈 함정 칸을 눌러 세트하세요. 세트한 함정은 나에게만 앞면으로 보입니다.'
            : selectedCard?.target === 'enemy_unit' ? '빛나는 적 유닛을 선택하세요.'
              : selectedCard?.target === 'friendly_unit' ? '빛나는 아군 유닛을 선택하세요.'
                : selectedCard?.target === 'friendly_graveyard_unit' ? '오른쪽의 “묘지에서 대상 선택” 버튼을 눌러 부활할 유닛을 고르세요.'
                  : selectedCard ? '행동 버튼으로 카드를 발동하세요.'
                  : specialReadyCount > 0 ? `특수 소환 가능 카드 ${specialReadyCount}장이 있습니다.` : '손패에서 카드를 선택하거나 전투 단계로 이동하세요.';

  const playableHandCount = privateState.hand.filter((instance) => {
    const card = CARD_BY_ID[instance.cardId];
    if (!card || !myTurn || interactionLocked || state.phase !== 'main') return false;
    if (card.kind === 'unit' && !clientEclipseSummonReady(state, card)) return false;
    if (card.kind === 'unit' && card.summonMode === 'legendary') return myEnergy.current >= card.cost && clientLegendaryReady(state, userId, opponentId, card);
    if (card.kind === 'unit' && card.rarity === 'legendary' && card.summonMode !== 'rift') return false;
    const cost = card.summonMode === 'rift' && card.riftCost !== undefined && clientRiftReady(state, userId, opponentId, card) ? card.riftCost : card.cost;
    return myEnergy.current >= cost;
  }).length;

  const coach = coinTossActive
    ? { step: 0, kicker: 'OPENING', title: '선공을 결정하고 있습니다', detail: '선공 결정이 끝나면 내 턴 또는 상대 턴이 화면 중앙에 표시됩니다.', tip: '결투가 시작되면 오른쪽 안내 패널이 다음 행동을 계속 알려줍니다.' }
    : pendingTrap
      ? pendingTrap.ownerId === userId
        ? { step: 0, kicker: 'TRAP RESPONSE', title: '함정을 발동할까요?', detail: `발동 가능 타이밍입니다. ${trapResponseSeconds}초 안에 사용 여부를 선택하세요.`, tip: '사용하지 않기를 골라도 함정 카드는 그대로 세트 상태로 남습니다.' }
        : { step: 0, kicker: 'WAIT RESPONSE', title: '상대의 함정 선택을 기다리는 중', detail: '상대가 함정을 발동할지 넘길지 결정하고 있습니다.', tip: '응답 시간 동안 턴 시간은 보정됩니다.' }
    : !myTurn
      ? { step: 0, kicker: 'WAIT', title: '상대의 턴입니다', detail: '지금은 상대가 행동하는 시간입니다. 손패 카드에 마우스를 올리면 카드 효과를 미리 확인할 수 있습니다.', tip: '턴이 넘어오면 화면 중앙에 “나의 턴”이 표시됩니다.' }
      : state.phase === 'battle'
        ? selectedAttacker !== null
          ? { step: 2, kicker: 'ATTACK · STEP 2', title: directAttackOpen ? '상대 리더를 선택하세요' : '공격 대상을 선택하세요', detail: directAttackOpen ? '상대 필드가 비었습니다. 왼쪽 위 상대 리더 패널을 누르면 직접 공격합니다.' : '빨갛게 표시되는 상대 유닛을 누르면 전투가 시작됩니다.', tip: '공격 대상을 고르기 전에는 언제든 “공격 선택 취소”를 누를 수 있습니다.' }
          : { step: 2, kicker: 'ATTACK · STEP 1', title: '공격할 내 유닛을 선택하세요', detail: '전투 단계입니다. 파랗게 빛나는 내 유닛 중 공격할 카드를 먼저 누르세요.', tip: '유닛 선택 → 상대 유닛(또는 리더) 선택 순서로 공격합니다.' }
        : selectedFieldUnitState
          ? { step: 1, kicker: 'FIELD RETIRE', title: `${selectedFieldUnitCard?.name ?? '캐릭터'}을 정리할까요?`, detail: '선택한 내 캐릭터를 묘지로 보내 유닛 칸을 비웁니다. 에너지가 10 미만이면 +1을 얻습니다.', tip: fieldSacrificeUsed ? '이번 턴에는 이미 필드 정리를 사용했습니다.' : '필드 정리는 같은 턴 안에서 사용할 때마다 비용 +1이며 전투 파괴로 취급하지 않습니다.' }
          : selectedExtraCard
            ? selectedExtraSummonNeedsTarget && selectedMaterials.length === requiredMaterials && selectedMaterialsValid && selectedExtraEffectTarget === null
              ? { step: 1, kicker: 'SUMMON TARGET', title: '등장 효과 대상을 선택하세요', detail: `${summonTargetEffectLabel(selectedExtraCard)}을(를) 받을 아군 캐릭터를 선택합니다. 소재가 아닌 아군을 누르거나 “소환체 자신”을 선택하세요.`, tip: '대상을 선택한 뒤 특수 소환 버튼을 누르면 됩니다.' }
              : { step: 1, kicker: 'SPECIAL SUMMON', title: '특수 소환 소재를 고르세요', detail: `필드에서 빛나는 소재를 ${requiredMaterials}장 선택한 뒤 특수 소환 버튼을 누르세요.`, tip: `현재 선택 ${selectedMaterials.length}/${requiredMaterials}` }
          : selectedCard?.kind === 'unit'
            ? selectingSummonEffectTarget
              ? { step: 1, kicker: 'SUMMON TARGET', title: '등장 효과 대상을 선택하세요', detail: `${summonTargetEffectLabel(selectedCard)}을(를) 받을 아군 캐릭터를 누르세요. 새로 소환되는 자신에게 줄 수도 있습니다.`, tip: '이 단계에서는 아직 소환이 확정되지 않았습니다. 대상까지 고르면 한 번에 처리됩니다.' }
              : selectedCard.summonMode === 'legendary'
              ? { step: 1, kicker: 'LEGENDARY SUMMON', title: `${selectedCard.legendarySummonRule?.name ?? '전설 강림'} 준비`, detail: selectedCard.legendarySummonRule?.label ?? '전설 특수 소환 조건을 확인하세요.', tip: `조건을 만족하면 오른쪽 “전설 특수 소환” 버튼으로 발동 · ENERGY ${selectedCard.cost}` }
              : { step: 1, kicker: 'SUMMON', title: '소환할 빈 칸을 선택하세요', detail: '손패에서 유닛을 골랐습니다. 파랗게 빛나는 내 유닛 칸을 누르면 소환됩니다.', tip: `사용 에너지 ${selectedHandCost ?? selectedCard.cost} · 현재 ${myEnergy.current}/${myEnergy.max}` }
            : selectedCard?.kind === 'trap'
              ? { step: 1, kicker: 'SET TRAP', title: '함정을 놓을 칸을 선택하세요', detail: '아래쪽 S1~S5 중 빛나는 빈 함정 칸을 누르면 세트됩니다.', tip: '세트한 함정의 앞면은 나에게만 보입니다.' }
              : selectedCard?.target === 'enemy_unit'
                ? { step: 1, kicker: 'TARGET', title: '대상 적 유닛을 선택하세요', detail: '효과를 적용할 상대 유닛이 강조됩니다. 원하는 유닛을 누르세요.', tip: '카드 선택을 취소하려면 ESC를 누를 수 있습니다.' }
                : selectedCard?.target === 'friendly_unit'
                  ? { step: 1, kicker: 'TARGET', title: '대상 아군 유닛을 선택하세요', detail: '효과를 적용할 내 유닛이 강조됩니다. 원하는 유닛을 누르세요.', tip: '카드 선택을 취소하려면 ESC를 누를 수 있습니다.' }
                  : selectedCard?.target === 'friendly_graveyard_unit'
                    ? { step: 1, kicker: 'GRAVE TARGET', title: '부활할 묘지 유닛을 선택하세요', detail: `현재 부활 가능한 메인 덱 유닛이 ${graveyardReviveTargets.length}장 있습니다. 오른쪽 카드 정보의 대상 선택 버튼을 누르세요.`, tip: '부활한 유닛은 소환 효과를 다시 발동하지 않고 이번 턴 공격할 수 없습니다.' }
                  : selectedCard
                    ? { step: 1, kicker: 'PLAY CARD', title: '카드를 발동할 준비가 됐습니다', detail: '오른쪽 카드 정보 아래의 발동 버튼을 눌러 효과를 사용하세요.', tip: '카드의 상세 규칙은 “전체 상세”에서 확인할 수 있습니다.' }
                    : { step: 1, kicker: 'MAIN PHASE', title: '먼저 손패에서 카드를 선택하세요', detail: `밝게 표시된 카드 ${playableHandCount}장은 지금 사용할 수 있습니다. 유닛을 내거나 주문·함정을 사용하세요.`, tip: '공격하려면 유닛을 소환한 뒤 “전투 단계” 버튼을 누르세요.' };
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
  const duelWagerAmount = practiceMode || room.public_match ? 0 : Math.max(0, Number(room.wager_amount ?? 0));
  const syncAgeSeconds = Math.max(0, Math.floor((Date.now() - lastSyncAt) / 1000));
  const displayedSyncState: 'live' | 'syncing' | 'offline' = syncState === 'offline' && syncAgeSeconds <= 8 ? 'live' : syncState;
  const currentEclipsePhase = clientCurrentEclipsePhase(state);
  const eclipseArenaVisual = ECLIPSE_ARENA_VISUAL[currentEclipsePhase];
  const eclipseArenaStyle = {
    '--v34m-accent-rgb': eclipseArenaVisual.rgb,
    '--v34m-arena-bg': eclipseArenaVisual.arena,
    '--v34m-atmosphere-bg': eclipseArenaVisual.atmosphere,
  } as CSSProperties;

  return (
    <div className={`v18-duel-screen v34m-time-fix ${myTurn ? 'is-my-turn' : 'is-opponent-turn'} phase-${state.phase} cycle-${currentEclipsePhase} fx-${activeVfx?.kind ?? 'idle'}`} style={eclipseArenaStyle}>
      <DuelTimeCriticalStyles />
      <DuelEffectLayer event={activeVfx} userId={userId} profiles={payload.profiles} drawCard={activeVfx?.kind === 'draw' && activeVfx.ownerId === userId ? CARD_BY_ID[drawRevealQueue[0] ?? ''] : undefined} />
      <DuelDamagePopupLayer events={damagePopups} userId={userId} />
      <CoinTossOverlay state={state} profiles={payload.profiles} userId={userId} now={coinClock} />
      <EclipsePhaseShiftNotice notice={eclipsePhaseNotice} />
      {turnNotice && !coinTossActive && state.status === 'active' && (
        <div className={`v29-turn-notice ${turnNotice.mine ? 'mine' : 'opponent'}`} role="status" aria-live="polite">
          <small>TURN {turnNotice.turn}</small>
          <strong>{turnNotice.mine ? '나의 턴' : '상대의 턴'}</strong>
          <span>{turnNotice.mine ? '카드를 내거나 전투를 진행하세요' : '상대의 행동을 기다리는 중'}</span>
        </div>
      )}
      <div className="orientation-hint"><span>↻</span><b>가로 화면을 권장합니다</b><small>결투 정보와 카드가 한 화면에 가장 선명하게 표시됩니다.</small></div>
      {busy && <div className="v18-action-progress"><span />행동 처리 중</div>}

      <header className="v18-duel-header">
        <div className="v18-duel-brand">
          <span className="v18-brand-mark">E</span>
          <div><b>ECLIPSE DUEL</b><small>{practiceMode ? `PRACTICE · ${PRACTICE_DIFFICULTY_LABEL[practiceMode]}` : `ROOM ${room.code}`}</small></div>
          <EclipseCycleStrip state={state} />
        </div>
        {duelWagerAmount > 0 && <div className="v31k-duel-wager-badge"><small>COIN DUEL</small><b>{duelWagerAmount.toLocaleString()} EACH</b><span>PRIZE {(duelWagerAmount * 2).toLocaleString()}</span></div>}
        <div className="v18-turn-hud">
          <small>ROUND {roundNumber} · TURN {state.turnNumber}</small>
          <div><b>{coinTossActive ? '선공 결정' : myTurn ? 'YOUR TURN' : 'OPPONENT TURN'}</b><span>{coinTossActive ? 'OPENING' : phaseLabel}</span></div>
          {!coinTossActive && state.status === 'active' && (
            <div className={`v18-turn-timer ${turnSecondsLeft <= 10 ? 'danger' : turnSecondsLeft <= 20 ? 'warning' : ''}`}>
              <strong>{turnSecondsLeft}</strong><small>SEC</small><i><b style={{ width: `${turnTimerPercent}%` }} /></i>
            </div>
          )}
        </div>
        {practiceMode ? <div className="v22-sync-chip live v35-practice-chip"><i /><span>LOCAL AI</span><small>{PRACTICE_DIFFICULTY_LABEL[practiceMode]} 봇 · 실전 규칙/연출 동일</small></div> : (
          <div className={`v22-sync-chip ${displayedSyncState}`}>
            <i /><span>{displayedSyncState === 'live' ? 'LIVE' : displayedSyncState === 'syncing' ? 'SYNCING' : 'RECONNECTING'}</span><small>{displayedSyncState === 'live' ? '연결됨' : displayedSyncState === 'syncing' ? '백그라운드 동기화' : '연결 복구 중'}</small>
          </div>
        )}
        <div className="v18-header-actions">
          <button type="button" className={emoteOpen ? 'active v34-emote-toggle' : 'v34-emote-toggle'} onClick={() => setEmoteOpen((value) => !value)}>감정표현</button>
          <button type="button" className={logOpen ? 'active' : ''} onClick={() => setLogOpen((value) => !value)}>기록</button>
          <button type="button" className="danger" disabled={busy || state.status !== 'active'} onClick={() => setSurrenderOpen(true)}>항복</button>
        </div>
      </header>
      {emoteOpen && <div className="v34-emote-picker">
        <header><span>BATTLE EMOTE</span><b>구매한 감정표현</b></header>
        {(payload.battleEmotes ?? []).length > 0 ? <div>{(payload.battleEmotes ?? []).map((emoteId) => { const item = V34_BATTLE_EMOTE_BY_ID[emoteId]; return item ? <button type="button" key={emoteId} disabled={emoteBusy} onClick={() => sendEmote(emoteId)} title={item.name}><img src={item.asset} alt={item.name} /><small>{item.name}</small></button> : null; })}</div> : <p>보유한 감정표현이 없습니다. 상점 → 감정표현에서 구매할 수 있습니다.</p>}
      </div>}

      <aside className="v18-leader-rail">
        <button
          type="button"
          data-duel-leader-owner={opponentId}
          className={`v18-leader-card opponent ${selectedAttackerCanHitCore ? 'targetable direct-ready' : ''}`}
          disabled={!selectedAttackerCanHitCore || busy}
          onClick={() => selectedAttacker !== null && gameAction('attack', { attackerIndex: selectedAttacker, target: { kind: 'core' } })}
        >
          <BattleLeaderEmote state={state} ownerId={opponentId} now={turnClock} />
          <div className="v18-leader-identity"><Avatar id={opponent?.avatar} /><i className={`v26-duel-emblem emblem-${opponent?.profile_emblem ?? 'emblem_default'}`} aria-hidden="true">{emblemGlyph(opponent?.profile_emblem)}</i><span><small>OPPONENT</small><b><NicknameText name={opponent?.display_name ?? '상대'} styleId={opponent?.nickname_style} /></b></span></div>
          <div className="v18-hp-readout"><small>HP</small><strong>{state.core[opponentId]}</strong><em>{selectedAttackerCanHitCore ? 'DIRECT ATTACK' : 'ENEMY LEADER'}</em></div>
          <DuelEnergyMeter label="ENERGY" current={opponentEnergy.current} max={opponentEnergy.max} cap={opponentEnergyHardCap} opponent compact />
          <div className="v18-mini-stats"><span>HAND <b>{state.handCounts[opponentId] ?? 0}</b></span><span>DECK <b>{state.deckCounts[opponentId] ?? 0}</b></span><span title={graveyardSummaryText(state.graveyards[opponentId])}>GRAVE <b>{state.graveyards[opponentId]?.length ?? 0}</b></span></div>
        </button>

        <div className="v18-leader-divider"><span>VS</span></div>

        <section className="v18-leader-card mine" data-duel-leader-owner={userId}>
          <BattleLeaderEmote state={state} ownerId={userId} now={turnClock} />
          <div className="v18-leader-identity"><Avatar id={me?.avatar} /><i className={`v26-duel-emblem emblem-${me?.profile_emblem ?? 'emblem_default'}`} aria-hidden="true">{emblemGlyph(me?.profile_emblem)}</i><span><small>YOU</small><b><NicknameText name={me?.display_name ?? '나'} styleId={me?.nickname_style} /></b></span></div>
          <div className="v18-hp-readout"><small>HP</small><strong>{state.core[userId]}</strong><em>{myTurn ? phaseLabel : 'WAITING'}</em></div>
          <DuelEnergyMeter label="ENERGY" current={myEnergy.current} max={myEnergy.max} cap={myEnergyHardCap} nextMax={!myTurn ? nextMyEnergyMax : undefined} compact />
          <div className="v18-mini-stats"><span>HAND <b>{privateState.hand.length}</b></span><span>DECK <b>{state.deckCounts[userId] ?? 0}</b></span><span title={graveyardSummaryText(state.graveyards[userId])}>GRAVE <b>{state.graveyards[userId]?.length ?? 0}</b></span></div>
        </section>
      </aside>

      <main className="v18-arena">
        <div className="v34n-time-sky" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: eclipseArenaVisual.atmosphere, backgroundPosition: 'center', backgroundSize: 'cover', opacity: 1 }} />
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
              <UnitSlot key={index} unit={unit} owner={opponentId} index={index} eclipsePhase={clientCurrentEclipsePhase(state)} enemy targetable={Boolean(unit && (selectingEnemyTarget || (selectingAttackTarget && attackableTargetIndexes.includes(index))))} attackTarget={Boolean(unit && selectingAttackTarget && attackableTargetIndexes.includes(index))} onInspect={onInspectCard} onClick={() => targetUnit(opponentId, index)} />
            ))}
          </div>

          <div className="v18-center-lane">
            <div className="v18-pile-stat"><small>OPPONENT</small><span>DECK <b>{state.deckCounts[opponentId]}</b></span><span title={graveyardSummaryText(state.graveyards[opponentId])}>GRAVE <b>{state.graveyards[opponentId]?.length ?? 0}</b></span><GraveyardBreakdown cardIds={state.graveyards[opponentId]} /></div>
            <div className="v29-center-status v34f-battle-flow-center">
              <div className="v18-field-core" aria-hidden="true"><i /><i /><span>◈</span></div>
              <div className={`v22-momentum ${momentumLabel === '유리' ? 'ahead' : momentumLabel === '불리' ? 'behind' : 'even'}`}>
                <span><small>BATTLE FLOW</small><b>{momentumLabel}</b></span>
                <i><b style={{ left: `${momentumPercent}%` }} /></i>
              </div>
            </div>
            <div className="v18-pile-stat mine"><small>YOU</small><span>DECK <b>{state.deckCounts[userId]}</b></span><span title={graveyardSummaryText(state.graveyards[userId])}>GRAVE <b>{state.graveyards[userId]?.length ?? 0}</b></span><GraveyardBreakdown cardIds={state.graveyards[userId]} /></div>
          </div>

          <div className="v18-zone-row v18-my-units">
            {state.boards[userId].units.map((unit, index) => (
              <UnitSlot
                key={index}
                unit={unit}
                owner={userId}
                index={index}
                eclipsePhase={clientCurrentEclipsePhase(state)}
                selected={selectedAttacker === index || selectedFieldUnit === index || selectedSummonZone === index || selectedExtraEffectTarget === index}
                materialSelected={selectedMaterials.includes(index)}
                targetable={unit ? Boolean((selectingFriendlyTarget && (!selectedConsumesBuffSlot || !unit.buffCardApplied)) || selectingSummonEffectTarget || (selectingExtraEffectTarget && !selectedMaterials.includes(index)) || selectingMaterials || (myTurn && !interactionLocked && state.phase === 'battle' && unit.canAttack) || (myTurn && !interactionLocked && state.phase === 'main' && !selectedCard && !selectedExtraCard && !fieldSacrificeUsed)) : selectingUnitToSummon}
                attackReady={Boolean(unit && myTurn && !interactionLocked && state.phase === 'battle' && unit.canAttack)}
                onInspect={onInspectCard}
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
        <section className={`v29-action-coach ${myTurn ? 'mine' : 'opponent'} step-${coach.step}`}>
          <header><span>{coach.kicker}</span><b>{myTurn ? phaseLabel : '관전 중'}</b></header>
          <h3>{coach.title}</h3>
          <p>{coach.detail}</p>
          <div className="v29-coach-steps" aria-label="결투 진행 순서">
            <span className={myTurn && state.phase === 'main' ? 'active' : state.phase === 'battle' || !myTurn ? 'done' : ''}><i>1</i>카드 사용</span>
            <span className={myTurn && state.phase === 'battle' ? 'active' : state.phase === 'main' ? '' : 'done'}><i>2</i>공격</span>
            <span><i>3</i>턴 종료</span>
          </div>
          <small>{coach.tip}</small>
          {myTurn && <div className="v29-attack-how"><b>공격 방법</b><span>유닛 소환 → 전투 단계 → 내 유닛 선택 → 상대 유닛/리더 선택</span></div>}
        </section>

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
          <button type="button" className="v18-special-ready" onClick={() => legendaryReadyFromHand[0] ? chooseHand(legendaryReadyFromHand[0].instanceId) : setExtraOpen(true)}><span>✦</span><div><b>특수 소환 가능</b><small>{specialReadyCount}장의 카드가 조건을 만족합니다.</small></div><em>보기</em></button>
        )}

        {previewCard && <section className={`v18-context-panel has-card ${previewIsHoverOnly ? 'preview-only' : ''}`}>
          {previewIsHoverOnly && hoveredHandCard && (
            <div className="v18-selected-card v29-hover-preview">
              <div className="v18-selected-art"><CardIllustration card={hoveredHandCard} compact /></div>
              <div className="v18-selected-copy"><small>카드 미리보기 · {KIND_LABEL[hoveredHandCard.kind]} · {ELEMENT_LABEL[hoveredHandCard.element]}</small><b>{hoveredHandCard.name}</b><div><span>COST <strong>{hoveredHandCard.cost}</strong></span>{isUnitCard(hoveredHandCard) && <><span>ATK <strong>{hoveredHandCard.attack}</strong></span><span>DEF <strong>{hoveredHandCard.health}</strong></span></>}</div><p><RuleText text={polishedCardText(hoveredHandCard)} /></p>{hoveredHandCard.seriesSignature && <p className="v31h-preview-signature"><RuleText text={seriesSignatureDescription(hoveredHandCard)} /></p>}{tacticalAbilityDescription(hoveredHandCard) && <p className="v30-preview-tactical"><RuleText text={tacticalAbilityDescription(hoveredHandCard)} /></p>}<TemporalQuickHint card={hoveredHandCard} currentPhase={currentEclipsePhase} /></div>
              <div className="v18-selected-actions"><button type="button" onClick={() => requestCardInspection(hoveredHandCard.id)}>전체 상세</button></div>
            </div>
          )}
          {selectedCard && (
            <div className="v18-selected-card">
              <div className="v18-selected-art"><CardIllustration card={selectedCard} compact /></div>
              <div className="v18-selected-copy"><small>{KIND_LABEL[selectedCard.kind]} · {ELEMENT_LABEL[selectedCard.element]}</small><b>{selectedCard.name}</b><div><span>COST <strong>{selectedHandCost}</strong></span>{isUnitCard(selectedCard) && <><span>ATK <strong>{selectedCard.attack}</strong></span><span>DEF <strong>{selectedCard.health}</strong></span></>}</div><p><RuleText text={selectedCard.summonMode === 'rift' ? `【균열 조건】 ${extraRequirement(selectedCard)}` : selectedCard.summonMode === 'legendary' ? `【전설 특수 소환】 ${extraRequirement(selectedCard)}` : polishedCardText(selectedCard)} /></p>{selectedCard.seriesSignature && <p className="v31h-preview-signature"><RuleText text={seriesSignatureDescription(selectedCard)} /></p>}{tacticalAbilityDescription(selectedCard) && <p className="v30-preview-tactical"><RuleText text={tacticalAbilityDescription(selectedCard)} /></p>}<TemporalQuickHint card={selectedCard} currentPhase={currentEclipsePhase} /></div>
              <div className="v18-selected-actions"><button type="button" onClick={() => requestCardInspection(selectedCard.id)}>전체 상세</button><button type="button" onClick={() => clearSelection('카드 선택을 취소했습니다.')}>선택 취소</button></div>
              {selectedCard.kind === 'unit' && selectedCardSummonNeedsTarget && selectedSummonZone !== null && (
                <div className="v36-summon-target-box">
                  <small>등장 효과 대상 선택</small>
                  <b>{summonTargetEffectLabel(selectedCard)}</b>
                  <p>필드의 아군 캐릭터를 누르면 그 캐릭터에게 적용됩니다.</p>
                  <button type="button" className="v36-self-target-button" disabled={busy} onClick={() => {
                    if (!selectedHand) return;
                    gameAction('play_card', {
                      instanceId: selectedHand,
                      ...(selectedSummonZone >= 0 ? { zone: selectedSummonZone } : {}),
                      target: { ownerId: userId, unitIndex: -1 },
                    });
                  }}>새로 소환되는 자신에게 적용</button>
                </div>
              )}
              {selectedCard.kind === 'spell' && (selectedCard.target === 'none' || selectedCard.target === 'enemy_core') && <button className="v18-context-primary" onClick={activateSelectedNoTarget}>주문 발동</button>}
              {selectedCard.kind === 'spell' && selectedCard.target === 'friendly_graveyard_unit' && <button className="v18-context-primary v31d-grave-target-button" disabled={!canChooseGraveyardTarget} onClick={openGraveyardTargetPicker}>묘지에서 부활 대상 선택 · {graveyardReviveTargets.length}</button>}
              {selectedCard.kind === 'spell' && selectedCard.target === 'own_deck_card' && <button className="v18-context-primary v32y-card-picker-button" disabled={!canChooseDeckTutorTarget} onClick={openDeckTutorPicker}>덱에서 카드 선택 · {deckTutorTargets.length}</button>}
              {selectedCard.kind === 'spell' && selectedCard.target === 'friendly_graveyard_card' && <button className="v18-context-primary v32y-card-picker-button" disabled={!canChooseGraveCardTarget} onClick={openGraveCardPicker}>묘지에서 카드 선택 · {graveyardCardTargets.length}</button>}
              {selectedCard.kind === 'unit' && selectedCard.summonMode === 'legendary' && <button className="v18-context-primary v32q-legendary-summon" type="button" onClick={summonSelectedLegendary}>{handSummonBlockReasons(selectedCard).length === 0 ? `전설 특수 소환 · ${selectedCard.legendarySummonRule?.name ?? '강림'}` : '전설 특수 소환 조건 확인'}</button>}
              {myTurn && state.phase === 'main' && <button className="v18-context-primary v31-energy-convert" disabled={!canSacrificeSelectedForEnergy} onClick={sacrificeSelectedForEnergy}><span>손패 → ENERGY +1</span><small>{energySacrificeUsed ? '이번 턴 사용 완료' : myEnergy.current >= myEnergyHardCap ? `에너지 최대 한도 ${myEnergyHardCap}` : '이 카드를 묘지로 보냅니다 · 같은 턴 안에서 사용할 때마다 비용 +1'}</small></button>}
            </div>
          )}
          {selectedExtraCard && (
            <div className="v18-selected-card extra v31f-selected-extra">
              <div className="v18-selected-art"><CardIllustration card={selectedExtraCard} compact /></div>
              <div className="v18-selected-copy"><small>{selectedExtraCard.kind === 'fusion' ? '공명 융합' : '계승 진화'}</small><b>{selectedExtraCard.name}</b><p>{extraRequirement(selectedExtraCard)}</p><span className="v18-material-progress">릴리스 소재 {selectedMaterials.length} / {requiredMaterials}</span><span className="v31-extra-usage">{selectedExtraCard.kind === 'fusion' ? `이번 게임 공명 ${myExtraUsage.fusion}/2` : `이번 게임 계승 ${myExtraUsage.evolution}/2`} · 같은 턴 안에서 사용할 때마다 비용 +1</span></div>
              {selectedExtraCard.extraChoices?.length && (
                <div className="v31f-extra-choose">
                  <header><span>CHOOSE EFFECT</span><small>소환 성공 후 화면 중앙에 선택지가 나타나며, 그중 1개만 고를 수 있습니다.</small></header>
                  <div>{selectedExtraCard.extraChoices.map((choice, index) => (
                    <div className="selected" key={choice.id}>
                      <b>{index + 1}</b><span><strong>{choice.label}</strong><small><RuleText text={choice.description} /></small></span>
                    </div>
                  ))}</div>
                </div>
              )}
              {selectedExtraSummonNeedsTarget && selectedMaterials.length === requiredMaterials && selectedMaterialsValid && (
                <div className="v36-summon-target-box">
                  <small>등장 효과 대상 선택</small>
                  <b>{summonTargetEffectLabel(selectedExtraCard)}</b>
                  <p>{selectedExtraEffectTarget === null ? '소재가 아닌 아군 캐릭터를 누르거나 소환체 자신을 선택하세요.' : selectedExtraEffectTarget === 'self' ? '새로 소환되는 캐릭터 자신에게 적용합니다.' : `${CARD_BY_ID[state.boards[userId].units[selectedExtraEffectTarget]?.cardId ?? '']?.name ?? '선택한 아군'}에게 적용합니다.`}</p>
                  <button type="button" className={`v36-self-target-button ${selectedExtraEffectTarget === 'self' ? 'selected' : ''}`} onClick={() => { setSelectedExtraEffectTarget('self'); setMessage(`새로 소환되는 ${selectedExtraCard.name} 자신에게 ${summonTargetEffectLabel(selectedExtraCard)} 효과를 적용합니다.`); }}>소환체 자신</button>
                </div>
              )}
              <div className="v18-selected-actions"><button type="button" onClick={() => requestCardInspection(selectedExtraCard.id)}>전체 상세</button><button type="button" onClick={() => clearSelection('엑스트라 카드 선택을 취소했습니다.')}>선택 취소</button></div>
              <button className="v18-context-primary" disabled={!canAttemptExtraSummon} onClick={summonSelectedExtra}>{canExtraSummon ? (selectedExtraCard.kind === 'fusion' ? '공명 융합 발동' : '계승 진화 발동') : selectedExtraSummonNeedsTarget && selectedMaterials.length === requiredMaterials && selectedMaterialsValid && selectedExtraEffectTarget === null ? '등장 효과 대상 선택 필요' : '소환 조건 확인'}</button>
            </div>
          )}
        </section>}

        {message && <div className="v18-action-message">{message}</div>}
        {selectedAttacker !== null && <button className="v18-cancel-attack" type="button" onClick={() => { setSelectedAttacker(null); setMessage('공격 유닛 선택을 취소했습니다.'); }}>공격 선택 취소</button>}

        <section className="v18-action-buttons">
          {state.phase === 'main' && <button className="v31-field-retire-action" disabled={!canRetireSelectedFieldUnit} onClick={retireSelectedFieldUnit}><span>필드 → ENERGY {myEnergy.current < myEnergyHardCap ? '+1' : '+0'}</span><small>{fieldSacrificeUsed ? '이번 턴 사용 완료' : selectedFieldUnitState ? `${selectedFieldUnitCard?.name ?? '선택 캐릭터'}을 묘지로 보내 빈 칸 확보 · 턴당 1회` : '내 필드 캐릭터를 먼저 선택하세요'}</small></button>}
          {state.phase === 'main' && <button className="v32o-energy-draw-action" disabled={!canEnergyDraw} onClick={spendEnergyForDraw}><span>ENERGY {energyDrawCost} → 카드 +1</span><small>{!hasDrawableCard ? '드로우 가능한 카드 없음' : myEnergy.current < energyDrawCost ? `ENERGY ${energyDrawCost} 필요` : energyDrawCountThisTurn > 0 ? `이번 턴 ${energyDrawCountThisTurn}회 사용 · 다음 비용 +1` : '첫 사용 2 ENERGY · 같은 턴 반복 시 비용 +1'}</small></button>}
          {state.phase === 'main' && <button className="v18-secondary-action" disabled={!canSpendTurnToDraw} onClick={spendTurnToDraw}><span>＋ 카드 1장</span><small>턴을 소비해 추가 드로우</small></button>}
          {state.phase === 'main' && <button className="v18-battle-action" disabled={!myTurn || busy || interactionLocked} onClick={() => gameAction('battle_phase')}><span>전투 단계로 이동</span><small>이후 내 유닛 → 공격 대상 순서로 선택</small></button>}
          <button className="v18-end-turn" disabled={!myTurn || busy || interactionLocked} onClick={requestEndTurn}><span>턴 종료</span><small>{remainingOpportunities > 0 ? `가능 행동 ${remainingOpportunities}` : `${turnSecondsLeft}초 남음`}</small></button>
        </section>

        <section className="v18-extra-access">
          <button type="button" onClick={() => setExtraOpen(true)}><span>EXTRA RESERVE</span><b>{privateState.extra.length}</b><small>{extraReadyInstances.length > 0 ? `${extraReadyInstances.length}장 소환 가능` : roundNumber < 3 ? 'ROUND 3 해금' : '융합 · 진화'}</small></button>
          <div className="v31-extra-limit-strip"><span>전개 <b>{myExtraUsage.fusion + myExtraUsage.evolution}/2</b></span><span>2차 해금 <b>R5</b></span><em>총 2회 · 같은 턴 안에서 사용할 때마다 비용 +1</em></div>
        </section>

      </aside>

      <footer className="v18-hand-dock">
        <div className="v18-hand-heading"><span><small>YOUR HAND</small><b>{privateState.hand.length} CARDS</b></span><em>{myTurn && state.phase === 'main' ? '밝게 표시된 카드는 지금 사용할 수 있습니다. 효과 전문은 카드를 클릭하거나 i 버튼으로 확인하고, 작은 시간 배지만 빠르게 참고하세요.' : '카드를 선택하거나 i 버튼을 눌러 전체 효과를 확인할 수 있습니다. 카드 표면에는 특성과 특수 소환 표식만 간단히 유지됩니다.'}</em></div>
        <div className="v18-hand-scroll">
          {privateState.hand.map((instance) => {
            const card = CARD_BY_ID[instance.cardId];
            const effectiveCost = card?.summonMode === 'rift' && card.riftCost !== undefined && clientRiftReady(state, userId, opponentId, card) ? card.riftCost : card?.cost ?? 99;
            const affordable = Boolean(card && myTurn && !interactionLocked && state.phase === 'main' && myEnergy.current >= effectiveCost
              && (card.summonMode !== 'legendary' || clientLegendaryReady(state, userId, opponentId, card))
              && !(card.kind === 'unit' && card.rarity === 'legendary' && card.summonMode !== 'rift' && card.summonMode !== 'legendary'));
            const legendaryReady = Boolean(card?.rarity === 'legendary' && legendaryReadyCards.some((item) => item.instanceId === instance.instanceId));
            return <div
              className={`v18-hand-card ${specialReadyIds.has(instance.instanceId) ? 'special-ready' : ''} ${legendaryReady ? 'legendary-ready' : ''} ${recentDrawnIds.has(instance.instanceId) ? 'just-drawn' : ''} ${affordable ? 'playable' : 'not-playable'} ${selectedHand === instance.instanceId ? 'selected' : ''}`}
              key={instance.instanceId}
              onMouseEnter={() => setHoveredHandCardId(instance.cardId)}
              onMouseLeave={() => setHoveredHandCardId((current) => current === instance.cardId ? null : current)}
              onFocusCapture={() => setHoveredHandCardId(instance.cardId)}
              onBlurCapture={() => setHoveredHandCardId((current) => current === instance.cardId ? null : current)}
            >{specialReadyIds.has(instance.instanceId) && !legendaryReady && <span className="v18-special-badge">SPECIAL</span>}<CardFace card={card} compact selected={selectedHand === instance.instanceId} disabled={busy} onClick={() => chooseHand(instance.instanceId)} />{card && <TemporalHandBadge card={card} currentPhase={currentEclipsePhase} />}</div>;
          })}
        </div>
        <div className="v18-hand-side"><span>ENERGY <b>{myEnergy.current}/{myEnergy.max}</b></span><span>DECK <b>{state.deckCounts[userId] ?? 0}</b></span><button type="button" onClick={() => setExtraOpen(true)}>EXTRA {privateState.extra.length}</button></div>
      </footer>

      <aside className={`battle-log v18-battle-log ${logOpen ? 'open' : ''}`}>
        <header><div><small>FULL HISTORY</small><b>결투 기록</b></div><button onClick={() => setLogOpen(false)}>×</button></header>
        <div>{state.logs.slice(-40).reverse().map((log) => <p className={`tone-${log.tone}`} key={log.id}><span>{new Date(log.createdAt).toLocaleTimeString('ko-KR', { minute: '2-digit', second: '2-digit' })}</span>{log.text}</p>)}</div>
      </aside>

      {extraOpen && (
        <div className="v18-extra-backdrop" onPointerDown={(event) => { if (event.currentTarget === event.target) setExtraOpen(false); }}>
          <aside className="v18-extra-drawer">
            <header><div><small>EXTRA RESERVE · 6 CARDS</small><b>공명 융합 · 계승 진화</b></div><button type="button" onClick={() => setExtraOpen(false)}>×</button></header>
            <p>엑스트라 6장은 처음부터 전부 소환할 수 있는 카드가 아니라 ‘전술 예비대’입니다. ROUND 3에 첫 전개가 열리고, ROUND 5부터 두 번째 전개가 열립니다. 한 게임에서 공명·계승을 합쳐 최대 2회만 전개할 수 있어 어떤 엑스트라를 꺼낼지 선택하는 것이 중요합니다.</p>
            <div className="v31-extra-drawer-usage"><span>전체 전개 <b>{myExtraUsage.fusion + myExtraUsage.evolution}/2</b></span><span>현재 ROUND <b>{roundNumber}</b></span></div>
            <div>{privateState.extra.map((instance) => {
              const card = CARD_BY_ID[instance.cardId];
              const ready = specialReadyIds.has(instance.instanceId);
              return <div className={`v18-extra-card ${ready ? 'ready' : ''} ${selectedExtra === instance.instanceId ? 'selected' : ''}`} key={instance.instanceId}>{ready && <span>READY</span>}<CardFace card={card} compact selected={selectedExtra === instance.instanceId} disabled={busy} onClick={() => { chooseExtra(instance.instanceId); setExtraOpen(false); }} /><small>{card ? extraRequirement(card) : ''}</small></div>;
            })}</div>
          </aside>
        </div>
      )}

      {graveTargetOpen && selectedCard?.target === 'friendly_graveyard_unit' && selectedHand && (
        <div className="v31d-grave-picker-layer" role="dialog" aria-modal="true" onPointerDown={(event) => { if (event.currentTarget === event.target) setGraveTargetOpen(false); }}>
          <section className="v31d-grave-picker">
            <header><div><small>LEGENDARY REVIVAL</small><b>묘지에서 부활할 유닛 선택</b></div><button type="button" onClick={() => setGraveTargetOpen(false)}>×</button></header>
            <p>메인 덱 유닛 1장을 선택합니다. 부활 시 기본 능력치로 돌아오며 소환 효과는 다시 발동하지 않고 이번 턴 공격할 수 없습니다.</p>
            <div className="v31d-grave-picker-grid">
              {graveyardReviveTargets.length > 0 ? [...graveyardReviveTargets].reverse().map(({ card, graveyardIndex }) => (
                <div className="v31d-grave-picker-card" key={`${graveyardIndex}-${card.id}`}>
                  <CardFace card={card} compact disabled={busy} inspectable={false} onClick={() => reviveFromGraveyard(graveyardIndex)} />
                  <small>COST {card.cost} · {card.attack}/{card.health}</small>
                </div>
              )) : <div className="v31d-grave-empty">부활 가능한 메인 덱 유닛이 없습니다.</div>}
            </div>
          </section>
        </div>
      )}

      {deckTargetOpen && selectedCard?.target === 'own_deck_card' && selectedHand && (
        <div className="v32y-picker-layer" role="dialog" aria-modal="true" onPointerDown={(event) => { if (event.currentTarget === event.target) setDeckTargetOpen(false); }}>
          <section className="v32y-picker-card">
            <header><div><small>PRECISION SEARCH</small><b>{selectedCard.effect?.kind === 'tutor_series_card' ? '같은 시리즈 카드 선택' : '덱에서 원하는 카드 선택'}</b></div><button type="button" onClick={() => setDeckTargetOpen(false)}>×</button></header>
            <p>현재 내 덱에 실제로 남아 있는 카드만 표시됩니다. 같은 카드가 여러 장이어도 목록에는 한 번만 표시됩니다.</p>
            <div className="v32y-picker-grid">
              {deckTutorTargets.map((card) => <button type="button" className="v32y-picker-option" key={card.id} disabled={busy} onClick={() => tutorFromDeck(card.id)}><CardIllustration card={card} compact /><span><small>{KIND_LABEL[card.kind]} · COST {card.cost}</small><b>{card.name}</b><em>{polishedCardText(card)}</em></span></button>)}
            </div>
          </section>
        </div>
      )}

      {graveCardTargetOpen && selectedCard?.target === 'friendly_graveyard_card' && selectedHand && (
        <div className="v32y-picker-layer" role="dialog" aria-modal="true" onPointerDown={(event) => { if (event.currentTarget === event.target) setGraveCardTargetOpen(false); }}>
          <section className="v32y-picker-card">
            <header><div><small>GRAVE RECOVERY</small><b>묘지에서 카드 1장 선택</b></div><button type="button" onClick={() => setGraveCardTargetOpen(false)}>×</button></header>
            <p>메인 덱 카드(유닛·주문·함정)만 손패로 회수할 수 있습니다.</p>
            <div className="v32y-picker-grid">
              {[...graveyardCardTargets].reverse().map(({ card, graveyardIndex }) => <button type="button" className="v32y-picker-option" key={`${graveyardIndex}-${card.id}`} disabled={busy} onClick={() => recoverCardFromGrave(graveyardIndex)}><CardIllustration card={card} compact /><span><small>{KIND_LABEL[card.kind]} · COST {card.cost}</small><b>{card.name}</b><em>{polishedCardText(card)}</em></span></button>)}
            </div>
          </section>
        </div>
      )}

      {pendingTrap && state.status === 'active' && (
        <div className={`v30-trap-response-layer ${pendingTrap.ownerId === userId ? 'mine' : 'waiting'}`} role="dialog" aria-modal={pendingTrap.ownerId === userId ? 'true' : undefined} aria-live="assertive">
          {pendingTrap.ownerId === userId && pendingTrapCard ? (
            <section className="v30-trap-response-card">
              <div className="v30-trap-response-art"><CardIllustration card={pendingTrapCard} hero /></div>
              <div className="v30-trap-response-copy">
                <small>TRAP RESPONSE · {trapResponseSeconds} SEC</small>
                <h2>함정을 발동할까요?</h2>
                <b>{pendingTrapCard.name}</b>
                <p><strong>발동 조건</strong> {trapTriggerDescription(pendingTrapCard.trapTrigger)}</p>
                <p>{pendingTrapCard.text}</p>
                <div className="v30-trap-response-actions">
                  <button className="ghost-button" disabled={busy} onClick={() => void gameAction('trap_response', { activate: false })}>이번에는 사용하지 않기</button>
                  <button className="primary-button" disabled={busy} onClick={() => void gameAction('trap_response', { activate: true })}>함정 발동</button>
                </div>
                <em>사용하지 않기를 선택하면 이 함정은 세트 상태로 유지됩니다.</em>
              </div>
            </section>
          ) : (
            <section className="v30-trap-waiting-card"><i /><div><small>TRAP WINDOW</small><b>상대의 함정 응답 대기 중</b><span>최대 {trapResponseSeconds}초 · 미응답 시 자동으로 넘어갑니다.</span></div></section>
          )}
        </div>
      )}

      {pendingExtraChoice && state.status === 'active' && (
        <div className={`v30-trap-response-layer ${pendingExtraChoice.ownerId === userId ? 'mine' : 'waiting'}`} role="dialog" aria-modal={pendingExtraChoice.ownerId === userId ? 'true' : undefined} aria-live="assertive">
          {pendingExtraChoice.ownerId === userId && pendingExtraChoiceCard ? (
            <section className="v30-trap-response-card">
              <div className="v30-trap-response-art"><CardIllustration card={pendingExtraChoiceCard} hero /></div>
              <div className="v30-trap-response-copy">
                <small>CHOOSE EFFECT</small>
                <h2>발휘할 효과를 선택하세요</h2>
                <b>{pendingExtraChoiceCard.name}</b>
                <p>엑스트라 소환은 이미 완료되었습니다. 아래 3개 효과 중 1개를 선택하면 즉시 발휘됩니다.</p>
                <div className="v30-trap-response-actions" style={{ display: 'grid', gap: 10 }}>
                  {pendingExtraChoiceCard.extraChoices?.map((choice, index) => (
                    <button
                      key={choice.id}
                      className={index === 0 ? 'primary-button' : 'ghost-button'}
                      disabled={busy}
                      onClick={() => void gameAction('resolve_extra_choice', { choiceIndex: index })}
                    >
                      {index + 1}. {choice.label}
                    </button>
                  ))}
                </div>
                <em>{pendingExtraChoiceCard.extraChoices?.map((choice, index) => `${index + 1}. ${choice.label} — ${choice.description}`).join(' / ')}</em>
              </div>
            </section>
          ) : (
            <section className="v30-trap-waiting-card"><i /><div><small>CHOOSE EFFECT</small><b>상대가 엑스트라 효과를 선택하는 중입니다.</b><span>선택이 완료되면 결투가 자동으로 이어집니다.</span></div></section>
          )}
        </div>
      )}

      {summonBlock && (
        <div className="v30-summon-block-layer" role="dialog" aria-modal="true" onPointerDown={(event) => { if (event.currentTarget === event.target) setSummonBlock(null); }}>
          <section className="v30-summon-block-card">
            <div className="v30-summon-block-art"><CardIllustration card={CARD_BY_ID[summonBlock.cardId]} hero /></div>
            <div>
              <small>SUMMON CONDITION</small>
              <h2>{summonBlock.title}</h2>
              <p>이 카드는 조건부 소환 카드입니다. 아래 조건을 맞추면 사용할 수 있습니다.</p>
              <ul>{summonBlock.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
              <button className="primary-button" onClick={() => setSummonBlock(null)}>확인</button>
            </div>
          </section>
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
            <p>{practiceMode ? '연습 대전을 종료합니다. 연습 결과는 계정 승패 기록에 반영되지 않습니다.' : '항복 즉시 상대가 승리하며 현재 경기는 패배로 기록됩니다.'}</p>
            <div><button className="ghost-button" disabled={busy} onClick={() => setSurrenderOpen(false)}>계속 싸우기</button><button className="danger-button" disabled={busy} onClick={() => { setSurrenderOpen(false); void gameAction('surrender'); }}>{practiceMode ? '연습 종료' : '항복하기'}</button></div>
          </section>
        </div>
      )}

      {state.status === 'finished' && (
        <div className="modal-layer v18-result-layer">
          <section className={`v18-result-modal v22-result-modal ${state.winnerId === userId ? 'win' : 'lose'}`}>
            <div className="v22-result-hero">
              <span className="result-emblem">{state.winnerId === userId ? '✦' : '◇'}</span>
              <div><small>DUEL COMPLETE · TURN {state.turnNumber}</small><h2>{state.winnerId === userId ? 'VICTORY' : 'DEFEAT'}</h2><p>{state.winReason}</p></div>
              <strong>{practiceMode ? 'PRACTICE · 보상/전적 반영 없음' : state.winnerId === userId ? `+100 COIN · +100 XP${levelUpCoinBonus > 0 ? ` · LEVEL UP +${levelUpCoinBonus.toLocaleString()} COIN` : ''}${duelWagerAmount > 0 ? ` · 내기 +${duelWagerAmount.toLocaleString()}` : ''}` : `+35 COIN · +35 XP${duelWagerAmount > 0 ? ` · 내기 -${duelWagerAmount.toLocaleString()}` : ''}`}</strong>
            </div>
            <div className="v22-result-stats">
              <article><small>CORE DAMAGE</small><b>{myMatchStats.coreDamage}</b><span>상대 {opponentMatchStats.coreDamage}</span></article>
              <article><small>CARDS PLAYED</small><b>{myMatchStats.cardsPlayed}</b><span>상대 {opponentMatchStats.cardsPlayed}</span></article>
              <article><small>SUMMONS</small><b>{myMatchStats.unitsSummoned}</b><span>특수 {myMatchStats.specialSummons}</span></article>
              <article><small>HEALING</small><b>{myMatchStats.healing}</b><span>드로우 {myMatchStats.cardsDrawn}</span></article>
            </div>
            <div className="v22-result-footer"><span>{practiceMode ? '연습 결과는 계정 전적·코인·XP에 반영되지 않습니다.' : '결투 기록은 결과 확정 후 계정 전적과 보상에 반영됩니다.'}</span><button className="primary-button" onClick={onLeave}>{practiceMode ? '연습 메뉴로 돌아가기' : room.public_match ? '허브로 돌아가기' : '대기방으로 돌아가기'}</button></div>
          </section>
        </div>
      )}
    </div>
  );
}


function SpectatorDuelBoard({ payload, onReturnLobby, onLeave, syncState, lastSyncAt, onInspectCard }: { payload: RoomPayload; onReturnLobby: () => void; onLeave: () => void; syncState: 'live' | 'syncing' | 'offline'; lastSyncAt: number; onInspectCard?: (cardId: string) => void }) {
  const room = payload.room;
  const state = room.state;
  const playerAId = room.host_id;
  const playerBId = room.guest_id ?? '';
  const profileMap = Object.fromEntries(payload.profiles.map((profile) => [profile.user_id, profile]));
  const playerA = profileMap[playerAId];
  const playerB = profileMap[playerBId];
  const playerAHand = payload.spectatorHands?.[playerAId] ?? [];
  const playerBHand = payload.spectatorHands?.[playerBId] ?? [];
  const playerASecrets = payload.spectatorSecrets?.[playerAId] ?? [];
  const playerBSecrets = payload.spectatorSecrets?.[playerBId] ?? [];
  const [activeVfx, setActiveVfx] = useState<VisualEvent | null>(null);
  const [vfxQueue, setVfxQueue] = useState<VisualEvent[]>([]);
  const [damagePopups, setDamagePopups] = useState<VisualEvent[]>([]);
  const [spectatorEmoteClock, setSpectatorEmoteClock] = useState(() => Date.now());
  // Spectators join with an existing event history. Pre-mark only stale events so a spell
  // cast that happened just before the room refresh is never discarded by the first sync.
  const seenVfx = useRef<Set<string>>(new Set(state?.visualEvents.filter((event) => Date.now() - event.createdAt > 3200).map((event) => event.id) ?? []));
  const seenDamage = useRef<Set<string>>(new Set(state?.visualEvents.filter((event) => Date.now() - event.createdAt > 2600).map((event) => event.id) ?? []));
  const eclipsePhaseNotice = useEclipsePhaseNotice(state);

  const visualEvents = state?.visualEvents ?? [];
  const visualSignature = visualEvents.map((event) => event.id).join('|');

  useEffect(() => {
    const timer = window.setInterval(() => setSpectatorEmoteClock(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const unseen = visualEvents.filter((event) => !seenVfx.current.has(event.id) && event.kind !== 'defense' && !(event.kind === 'special' && event.vfx.startsWith('eclipse-cycle-')));
    if (unseen.length === 0) return;
    visualEvents.forEach((event) => seenVfx.current.add(event.id));
    // Keep the complete recent action bundle. Spell activation is normally the first event
    // in a resolution chain, so trimming to only the last few events could hide the cast
    // from spectators while later damage/buff events remained visible.
    setVfxQueue((current) => {
      const merged = [...current, ...unseen];
      const deduped = merged.filter((event, index) => merged.findIndex((item) => item.id === event.id) === index);
      return deduped.slice(-18);
    });
  }, [visualSignature]);

  useEffect(() => {
    const incoming = visualEvents.filter((event) => !seenDamage.current.has(event.id)
      && ((event.kind === 'defense' && ((event.shieldAmount ?? 0) > 0 || (event.healthAmount ?? 0) > 0)) || (event.kind === 'core' && (event.amount ?? 0) > 0) || (event.kind === 'heal' && (event.amount ?? 0) > 0)));
    visualEvents.forEach((event) => seenDamage.current.add(event.id));
    if (!incoming.length) return;
    setDamagePopups((current) => [...current, ...incoming].slice(-10));
    const ids = new Set(incoming.map((event) => event.id));
    const timer = window.setTimeout(() => setDamagePopups((current) => current.filter((event) => !ids.has(event.id))), 1250);
    return () => window.clearTimeout(timer);
  }, [visualSignature]);

  useEffect(() => {
    if (activeVfx || vfxQueue.length === 0) return;
    const [next, ...rest] = vfxQueue;
    setVfxQueue(rest);
    setActiveVfx(next);
  }, [activeVfx, vfxQueue]);

  useEffect(() => {
    if (!activeVfx) return;
    const next = activeVfx;
    const duration = next.kind === 'fusion' || next.kind === 'evolution' ? 2450
      : next.kind === 'trap' ? 2250
        : next.kind === 'special' && (next.vfx === 'execution-scythe' || next.vfx === 'sweep-volley') ? 1080
          : next.kind === 'summon' || next.kind === 'special' || next.kind === 'spell' ? 1450
          : next.kind === 'attack' ? 1250
            : next.kind === 'core' || next.kind === 'destroy' ? 1120
              : next.kind === 'defense' ? 1220
                : next.kind === 'heal' || next.kind === 'buff' || next.kind === 'energy' ? 1050
                  : next.kind === 'draw' ? 1250
                    : 850;
    const timer = window.setTimeout(() => setActiveVfx((current) => current?.id === next.id ? null : current), duration);
    return () => window.clearTimeout(timer);
  }, [activeVfx?.id]);

  useEffect(() => {
    if (!activeVfx) return;
    const sound: UiSound = activeVfx.kind === 'attack' ? 'attack'
      : activeVfx.kind === 'fusion' ? 'fusion'
        : activeVfx.kind === 'evolution' ? 'evolution'
          : activeVfx.kind === 'spell' ? 'spell'
            : activeVfx.kind === 'trap' || activeVfx.kind === 'set' ? 'trap'
              : activeVfx.kind === 'core' ? 'corehit'
                : activeVfx.kind === 'destroy' ? 'destroy'
                  : activeVfx.kind === 'defense' && (activeVfx.shieldAmount ?? 0) > 0 && (activeVfx.healthAmount ?? 0) === 0 ? 'shield'
                    : activeVfx.kind === 'defense' ? 'damage'
                      : activeVfx.kind === 'heal' || activeVfx.kind === 'buff' || activeVfx.kind === 'energy' ? 'success'
                        : activeVfx.kind === 'draw' ? 'draw'
                          : 'summon';
    playUiSound(sound);
    const impactTimer = activeVfx.kind === 'attack' ? window.setTimeout(() => playUiSound('impact'), 270) : undefined;
    return () => { if (impactTimer) window.clearTimeout(impactTimer); };
  }, [activeVfx?.id]);

  if (!state || !playerBId || state.playerOrder.length !== 2) return <LoadingScreen text="관전 화면을 준비하는 중" />;

  const currentName = state.currentPlayerId ? profileMap[state.currentPlayerId]?.display_name ?? '플레이어' : '대기';
  const recentEvents = state.visualEvents.slice(-7).reverse();
  const syncAgeSeconds = Math.max(0, Math.floor((Date.now() - lastSyncAt) / 1000));
  const displayedSyncState: 'live' | 'syncing' | 'offline' = syncState === 'offline' && syncAgeSeconds <= 8 ? 'live' : syncState;
  const winner = state.winnerId ? profileMap[state.winnerId] : undefined;

  function renderSpectatorHand(hand: PrivateState['hand'], sleeveId?: string) {
    return hand.map((instance) => {
      const card = CARD_BY_ID[instance.cardId];
      return (
        <div className="v33b-spectator-hand-card" key={instance.instanceId}>
          {card
            ? <CardFace card={card} compact inspectable={false} onClick={() => requestCardInspection(card.id)} />
            : <CardFace hidden compact inspectable={false} sleeveId={sleeveId ?? 'sleeve_default'} />}
        </div>
      );
    });
  }

  function renderSpectatorSecret(
    publicSecret: MatchState['boards'][string]['secrets'][number],
    privateSecret: PrivateState['secrets'][number] | undefined,
    index: number,
    ownerId: string,
    sleeveId?: string,
    enemy = false,
  ) {
    if (!publicSecret) return <div className={`v18-secret-slot ${enemy ? 'enemy' : 'mine'}`} key={index}><span className="v18-zone-number">S{index + 1}</span></div>;
    const revealed = privateSecret ? CARD_BY_ID[privateSecret.cardId] : undefined;
    return (
      <div className={`v18-secret-slot ${enemy ? 'enemy' : 'mine'} is-set v39-spectator-secret-slot`} key={index} data-spectator-secret-owner={ownerId}>
        {revealed ? (
          <button
            type="button"
            className="v39-spectator-secret-reveal"
            title={`${revealed.name} · 관전자 공개 함정`}
            aria-label={`${revealed.name} 함정 카드 상세 정보`}
            onClick={() => { if (onInspectCard) onInspectCard(revealed.id); else requestCardInspection(revealed.id); }}
          >
            <CardIllustration card={revealed} compact />
            <span><b>TRAP</b><small>{revealed.name}</small></span>
          </button>
        ) : (
          <><span className={`v18-secret-back sleeve-${sleeveId ?? 'sleeve_default'}`}>{sleeveGlyph(sleeveId)}</span><small>SYNC</small></>
        )}
      </div>
    );
  }

  const currentEclipsePhase = clientCurrentEclipsePhase(state);
  const eclipseArenaVisual = ECLIPSE_ARENA_VISUAL[currentEclipsePhase];
  const eclipseArenaStyle = {
    '--v34m-accent-rgb': eclipseArenaVisual.rgb,
    '--v34m-arena-bg': eclipseArenaVisual.arena,
    '--v34m-atmosphere-bg': eclipseArenaVisual.atmosphere,
  } as CSSProperties;

  return (
    <div className={`v18-duel-screen v34m-time-fix v32e-spectator-screen phase-${state.phase} cycle-${currentEclipsePhase} fx-${activeVfx?.kind ?? 'idle'}`} style={eclipseArenaStyle}>
      <DuelTimeCriticalStyles />
      <DuelEffectLayer event={activeVfx} userId={playerAId} profiles={payload.profiles} spectator />
      <DuelDamagePopupLayer events={damagePopups} userId={playerAId} />
      <EclipsePhaseShiftNotice notice={eclipsePhaseNotice} />
      <header className="v18-duel-header">
        <div className="v18-duel-brand"><span className="v18-brand-mark">E</span><div><b>ECLIPSE DUEL</b><small>ROOM {room.code}</small></div><EclipseCycleStrip state={state} /></div>
        <div className="v32e-spectator-badge"><i />SPECTATOR LIVE <span>{(payload.members ?? []).filter((member) => member.role === 'spectator').length}명 관전</span></div>
        <div className="v18-turn-hud"><small>TURN {state.turnNumber}</small><div><b>{state.status === 'finished' ? 'DUEL COMPLETE' : `${currentName}의 턴`}</b><span>{state.phase === 'battle' ? 'BATTLE PHASE' : 'MAIN PHASE'}</span></div></div>
        <div className={`v22-sync-chip ${displayedSyncState}`}><i /><span>{displayedSyncState === 'live' ? 'LIVE' : displayedSyncState === 'syncing' ? 'SYNCING' : 'RECONNECTING'}</span><small>관전 동기화</small></div>
        <div className="v18-header-actions"><button type="button" onClick={onLeave}>관전 나가기</button></div>
      </header>

      <aside className="v18-leader-rail">
        <section className="v18-leader-card opponent" data-duel-leader-owner={playerBId}>
          <BattleLeaderEmote state={state} ownerId={playerBId} now={spectatorEmoteClock} />
          <div className="v18-leader-identity"><Avatar id={playerB?.avatar} /><span><small>PLAYER B</small><b><NicknameText name={playerB?.display_name ?? 'PLAYER B'} styleId={playerB?.nickname_style} /></b></span></div>
          <div className="v18-hp-readout"><small>HP</small><strong>{state.core[playerBId] ?? 0}</strong><em>{state.currentPlayerId === playerBId ? 'TURN' : 'WAIT'}</em></div>
          <DuelEnergyMeter label="ENERGY" current={state.energy[playerBId]?.current ?? 0} max={state.energy[playerBId]?.max ?? 0} cap={10 + Math.max(0, state.energyMaxBonus?.[playerBId] ?? 0)} opponent compact />
          <div className="v18-mini-stats"><span>HAND <b>{state.handCounts[playerBId] ?? 0}</b></span><span>DECK <b>{state.deckCounts[playerBId] ?? 0}</b></span><span title={graveyardSummaryText(state.graveyards[playerBId])}>GRAVE <b>{state.graveyards[playerBId]?.length ?? 0}</b></span></div>
        </section>
        <div className="v18-leader-divider"><span>VS</span></div>
        <section className="v18-leader-card mine" data-duel-leader-owner={playerAId}>
          <BattleLeaderEmote state={state} ownerId={playerAId} now={spectatorEmoteClock} />
          <div className="v18-leader-identity"><Avatar id={playerA?.avatar} /><span><small>PLAYER A</small><b><NicknameText name={playerA?.display_name ?? 'PLAYER A'} styleId={playerA?.nickname_style} /></b></span></div>
          <div className="v18-hp-readout"><small>HP</small><strong>{state.core[playerAId] ?? 0}</strong><em>{state.currentPlayerId === playerAId ? 'TURN' : 'WAIT'}</em></div>
          <DuelEnergyMeter label="ENERGY" current={state.energy[playerAId]?.current ?? 0} max={state.energy[playerAId]?.max ?? 0} cap={10 + Math.max(0, state.energyMaxBonus?.[playerAId] ?? 0)} compact />
          <div className="v18-mini-stats"><span>HAND <b>{state.handCounts[playerAId] ?? 0}</b></span><span>DECK <b>{state.deckCounts[playerAId] ?? 0}</b></span><span title={graveyardSummaryText(state.graveyards[playerAId])}>GRAVE <b>{state.graveyards[playerAId]?.length ?? 0}</b></span></div>
        </section>
      </aside>

      <main className="v18-arena">
        <div className="v34n-time-sky" aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', background: eclipseArenaVisual.atmosphere, backgroundPosition: 'center', backgroundSize: 'cover', opacity: 1 }} />
        <div className="v18-arena-backdrop" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="v18-opponent-hand-strip v33b-spectator-hand-strip">
          <span>PLAYER B HAND · {playerBHand.length || (state.handCounts[playerBId] ?? 0)}</span>
          <div>{playerBHand.length > 0 ? renderSpectatorHand(playerBHand, playerB?.card_sleeve) : <em>손패 동기화 중</em>}</div>
        </div>
        <section className="v18-board">
          <div className="v18-zone-row v18-enemy-secrets">{state.boards[playerBId].secrets.map((secret, index) => renderSpectatorSecret(secret, playerBSecrets[index], index, playerBId, playerB?.card_sleeve, true))}</div>
          <div className="v18-zone-row v18-enemy-units">{state.boards[playerBId].units.map((unit, index) => <UnitSlot key={index} unit={unit} owner={playerBId} index={index} eclipsePhase={clientCurrentEclipsePhase(state)} enemy onInspect={onInspectCard} />)}</div>
          <div className="v18-center-lane"><div className="v18-pile-stat"><small>PLAYER B</small><span>DECK <b>{state.deckCounts[playerBId] ?? 0}</b></span><span title={graveyardSummaryText(state.graveyards[playerBId])}>GRAVE <b>{state.graveyards[playerBId]?.length ?? 0}</b></span><GraveyardBreakdown cardIds={state.graveyards[playerBId]} /></div><div className="v29-center-status v34f-battle-flow-center"><div className="v18-field-core" aria-hidden="true"><i /><i /><span>◈</span></div><div className="v32e-watch-copy"><small>ROOM SPECTATE</small><b>양쪽 손패 · 함정 공개</b></div></div><div className="v18-pile-stat mine"><small>PLAYER A</small><span>DECK <b>{state.deckCounts[playerAId] ?? 0}</b></span><span title={graveyardSummaryText(state.graveyards[playerAId])}>GRAVE <b>{state.graveyards[playerAId]?.length ?? 0}</b></span><GraveyardBreakdown cardIds={state.graveyards[playerAId]} /></div></div>
          <div className="v18-zone-row v18-my-units">{state.boards[playerAId].units.map((unit, index) => <UnitSlot key={index} unit={unit} owner={playerAId} index={index} eclipsePhase={clientCurrentEclipsePhase(state)} onInspect={onInspectCard} />)}</div>
          <div className="v18-zone-row v18-my-secrets">{state.boards[playerAId].secrets.map((secret, index) => renderSpectatorSecret(secret, playerASecrets[index], index, playerAId, playerA?.card_sleeve))}</div>
        </section>
      </main>

      <aside className="v18-command-rail v32e-spectator-rail">
        <section className="v29-action-coach opponent"><header><span>SPECTATOR</span><b>LIVE</b></header><h3>관전자 전용 전체 정보 공개</h3><p>두 선수의 필드·코어·에너지·묘지와 양쪽 손패, 세트된 모든 함정을 실시간으로 볼 수 있습니다.</p><small>손패와 함정 정체는 관전자에게만 공개되며 실제 플레이어 화면에는 상대 비공개 정보가 전달되지 않습니다.</small></section>
        <section className="v18-event-feed"><header><span>DUEL FEED</span><b>LIVE</b></header><div>{recentEvents.length ? recentEvents.map((event) => <div className={`v18-feed-item kind-${event.kind}`} key={event.id}><i /><span><b>{profileMap[event.ownerId ?? '']?.display_name ?? 'SYSTEM'} · {duelEventLabel(event)}</b><small>{event.detail ?? event.label ?? (duelEventLocation(event) || '결투 행동')}</small></span></div>) : <p>아직 기록된 행동이 없습니다.</p>}</div></section>
        <section className="v32e-spectator-roster"><small>ROOM MEMBERS</small>{payload.profiles.map((profile) => { const member = (payload.members ?? []).find((item) => item.user_id === profile.user_id); return <div key={profile.user_id}><Avatar id={profile.avatar} /><span><b><NicknameText name={profile.display_name} styleId={profile.nickname_style} /></b><small>{member?.role === 'player_a' ? 'PLAYER A' : member?.role === 'player_b' ? 'PLAYER B' : 'SPECTATOR'}{member?.is_owner ? ' · OWNER' : ''}</small></span></div>; })}</section>
      </aside>

      <footer className="v18-hand-dock v32e-spectator-footer v33b-spectator-hand-dock">
        <div className="v33b-spectator-hand-heading">
          <small>SPECTATOR REVEAL · PLAYER A</small>
          <b>PLAYER A HAND · {playerAHand.length || (state.handCounts[playerAId] ?? 0)}</b>
          <span>양쪽 손패와 세트 함정은 관전자에게만 공개됩니다.</span>
        </div>
        <div className="v33b-spectator-hand-scroll">
          {playerAHand.length > 0 ? renderSpectatorHand(playerAHand, playerA?.card_sleeve) : <em>손패를 동기화하는 중입니다.</em>}
        </div>
        <div className="v33b-spectator-hand-meta">
          <span>PLAYER B <b>{playerBHand.length || (state.handCounts[playerBId] ?? 0)}</b></span>
          <small>세트 함정까지 공개</small>
        </div>
      </footer>

      {state.status === 'finished' && <div className="modal-layer v18-result-layer"><section className="v18-result-modal v22-result-modal win"><div className="v22-result-hero"><span className="result-emblem">✦</span><div><small>SPECTATOR · DUEL COMPLETE</small><h2>{winner?.display_name ?? '승자'} 승리</h2><p>{state.winReason}</p></div></div><div className="v22-result-footer"><span>다음 경기는 같은 방 대기실에서 선수 구성을 다시 정할 수 있습니다.</span><button className="primary-button" onClick={onReturnLobby}>대기방으로 돌아가기</button></div></section></div>}
    </div>
  );
}


function PracticeDuel({ userId, hub, activeDeck, difficulty, onExit }: { userId: string; hub: HubData; activeDeck: DeckRow; difficulty: PracticeDifficulty; onExit: () => void }) {
  const botId = `practice-bot-${difficulty}`;
  const [snapshot, setSnapshot] = useState<GameSnapshot>(() => createPracticeMatch(userId, activeDeck.cards, activeDeck.extra_cards, botId, difficulty));
  const snapshotRef = useRef(snapshot);
  const [botThinking, setBotThinking] = useState(false);
  const [presentationBusy, setPresentationBusy] = useState(true);
  const [practiceInspectCardId, setPracticeInspectCardId] = useState<string | null>(null);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    const openPracticeInspector = (event: Event) => {
      const cardId = (event as CustomEvent<string>).detail;
      if (cardId && CARD_BY_ID[cardId]) setPracticeInspectCardId(cardId);
    };
    window.addEventListener(CARD_INSPECT_EVENT, openPracticeInspector);
    return () => window.removeEventListener(CARD_INSPECT_EVENT, openPracticeInspector);
  }, []);

  const buildPayload = useCallback((current: GameSnapshot): RoomPayload => {
    const label = PRACTICE_DIFFICULTY_LABEL[difficulty];
    const botAvatar = difficulty === 'easy' ? 'oracle' : difficulty === 'normal' ? 'warden' : 'reaper';
    return {
      room: {
        id: `practice-${difficulty}`,
        code: `BOT-${difficulty.toUpperCase()}`,
        owner_id: userId,
        host_id: userId,
        guest_id: botId,
        public_match: false,
        status: current.state.status === 'finished' ? 'finished' : 'active',
        ready_host: true,
        ready_guest: true,
        wager_amount: 0,
        wager_host_accepted: true,
        wager_guest_accepted: true,
        wager_locked: false,
        wager_settled: false,
        state: current.state,
        version: current.state.visualEvents.length + current.state.turnNumber,
        winner_id: current.state.winnerId ?? null,
      },
      profiles: [
        {
          user_id: userId,
          display_name: hub.profile.display_name,
          avatar: hub.profile.avatar,
          wins: hub.profile.wins,
          losses: hub.profile.losses,
          xp: hub.profile.xp,
          profile_emblem: hub.profile.profile_emblem,
          card_sleeve: hub.profile.card_sleeve,
          nickname_style: hub.profile.nickname_style,
        },
        {
          user_id: botId,
          display_name: `연습봇 · ${label}`,
          avatar: botAvatar,
          wins: 0,
          losses: 0,
          xp: 0,
          profile_emblem: 'emblem_default',
          card_sleeve: 'sleeve_default',
          nickname_style: 'nickname_default',
        },
      ],
      privateState: current.privateStates[userId] ?? null,
      members: [
        { user_id: userId, role: 'player_a', is_owner: true },
        { user_id: botId, role: 'player_b', is_owner: false },
      ],
      battleEmotes: (hub.emoteLoadout?.length ? hub.emoteLoadout : hub.battleEmotes ?? []).slice(0, V34_EMOTE_SLOT_LIMIT),
    };
  }, [botId, difficulty, hub.battleEmotes, hub.emoteLoadout, hub.profile, userId]);

  const localAction = useCallback(async (gameAction: string, extra: Record<string, unknown> = {}): Promise<RoomPayload> => {
    const current = snapshotRef.current;
    const next = applyPracticeGameAction(current, userId, gameAction, extra);
    snapshotRef.current = next;
    setSnapshot(next);
    return buildPayload(next);
  }, [buildPayload, userId]);

  useEffect(() => {
    const current = snapshotRef.current;
    if (presentationBusy) {
      setBotThinking(false);
      return undefined;
    }
    if (current.state.status === 'finished') {
      setBotThinking(false);
      return undefined;
    }

    const pendingOwner = current.state.pendingTrap?.ownerId;
    const botMustRespond = pendingOwner === botId;
    const botTurn = current.state.currentPlayerId === botId && !pendingOwner;
    if (!botMustRespond && !botTurn) {
      setBotThinking(false);
      return undefined;
    }

    const coinWait = current.state.coinToss && Date.now() < current.state.coinToss.endsAt
      ? Math.max(120, current.state.coinToss.endsAt - Date.now() + 120)
      : 0;
    const thinkDelay = coinWait || (difficulty === 'easy' ? 760 : difficulty === 'normal' ? 560 : 380);
    setBotThinking(true);

    const timer = window.setTimeout(() => {
      const latest = snapshotRef.current;
      if (latest.state.status === 'finished') {
        setBotThinking(false);
        return;
      }
      try {
        const action = choosePracticeBotAction(latest, botId, difficulty);
        if (!action) {
          setBotThinking(false);
          return;
        }
        const next = applyPracticeGameAction(latest, botId, action.gameAction, action.payload ?? {});
        setPresentationBusy(true);
        snapshotRef.current = next;
        setSnapshot(next);
      } catch (error) {
        console.warn('[ECLIPSE PRACTICE] bot action skipped', error);
        setBotThinking(false);
      }
    }, thinkDelay);

    return () => window.clearTimeout(timer);
  }, [botId, difficulty, presentationBusy, snapshot]);

  const payload = useMemo(() => buildPayload(snapshot), [buildPayload, snapshot]);
  const noopRefresh = useCallback((_payload: RoomPayload) => { /* localAction commits the authoritative snapshot */ }, []);

  if (typeof document === 'undefined') return <LoadingScreen text="연습 대전을 준비하는 중" />;

  return createPortal(
    <div className="v19-client v23-client in-duel v35-practice-overlay" data-ui-build="v32-retail" data-practice-mode="true">
      <DuelBoard
        payload={payload}
        userId={userId}
        onRefresh={noopRefresh}
        onLeave={onExit}
        syncState="live"
        lastSyncAt={Date.now()}
        localAction={localAction}
        practiceMode={difficulty}
        onPresentationBusyChange={setPresentationBusy}
        onInspectCard={setPracticeInspectCardId}
      />
      {practiceInspectCardId && CARD_BY_ID[practiceInspectCardId] && <CardDetailModal card={CARD_BY_ID[practiceInspectCardId]} onClose={() => setPracticeInspectCardId(null)} />}
      {botThinking && snapshot.state.status !== 'finished' && (
        <div className={`v35-bot-thinking difficulty-${difficulty}`} role="status" aria-live="polite">
          <span className="v35-bot-thinking-orb" aria-hidden="true"><i /><i /><i /></span>
          <div><small>TRAINING AI</small><b>{PRACTICE_DIFFICULTY_LABEL[difficulty]} 봇이 다음 수를 계산 중입니다</b></div>
        </div>
      )}
    </div>,
    document.body,
  );
}


function DuelView({ userId, hub, roomPayload, onRoom, onHub, serverStatus, syncState, lastSyncAt, onInspectCard }: { userId: string; hub: HubData; roomPayload: RoomPayload | null; onRoom: (room: RoomPayload | null) => void; onHub: (hub: HubData) => void; serverStatus: SecureServerStatus; syncState: 'live' | 'syncing' | 'offline'; lastSyncAt: number; onInspectCard?: (cardId: string) => void }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [wagerInput, setWagerInput] = useState('500');
  const [playerAChoice, setPlayerAChoice] = useState('');
  const [playerBChoice, setPlayerBChoice] = useState('');
  const [practiceDifficulty, setPracticeDifficulty] = useState<PracticeDifficulty | null>(null);
  const roomActionLock = useRef(false);

  useEffect(() => {
    const amount = Math.max(0, Number(roomPayload?.room.wager_amount ?? 0));
    if (!roomPayload?.room.public_match && amount > 0) setWagerInput(String(amount));
    if (roomPayload?.room) {
      setPlayerAChoice(roomPayload.room.host_id);
      setPlayerBChoice(roomPayload.room.guest_id ?? '');
    }
  }, [roomPayload?.room.id, roomPayload?.room.public_match, roomPayload?.room.wager_amount, roomPayload?.room.host_id, roomPayload?.room.guest_id]);

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
      if (result.room && result.profiles) onRoom({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null, members: result.members ?? [], spectatorHands: result.spectatorHands ?? undefined, spectatorSecrets: result.spectatorSecrets ?? undefined, battleEmotes: result.battleEmotes ?? [] });
      if (result.joinedAsSpectator) setMessage('선수 자리가 이미 차 있어 관전자로 입장했습니다. 다음 경기에는 방장이 선수로 지정할 수 있습니다.');
      return result;
    } catch (error) { setMessage(error instanceof Error ? error.message : '요청 실패'); }
    finally { roomActionLock.current = false; setBusy(false); }
  }

  async function switchActiveDeck(deckId: string) {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      const result = await api('set_active_deck', { deckId });
      if (result.hub) onHub(result.hub);
      const nextDeck = (result.hub?.decks ?? hub.decks).find((deck) => deck.id === deckId);
      setMessage(nextDeck ? `대전 기본 덱이 “${nextDeck.name}”으로 지정되었습니다.` : '대전 기본 덱이 변경되었습니다.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '덱 지정에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  }

  async function leaveRoom() {
    if (roomPayload) await roomAction('leave_room', { roomId: roomPayload.room.id });
    onRoom(null);
    try { const result = await api('hub'); if (result.hub) onHub(result.hub); } catch { /* ignore */ }
  }

  async function returnPrivateLobby() {
    if (!roomPayload) return;
    await roomAction('return_to_room_lobby', { roomId: roomPayload.room.id });
    try { const result = await api('hub'); if (result.hub) onHub(result.hub); } catch { /* ignore */ }
  }

  if (roomPayload?.room.status === 'active' || roomPayload?.room.status === 'finished') {
    const room = roomPayload.room;
    const isPlayer = room.host_id === userId || room.guest_id === userId;
    if (!room.public_match && !isPlayer) {
      return <SpectatorDuelBoard payload={roomPayload} onReturnLobby={returnPrivateLobby} onLeave={leaveRoom} syncState={syncState} lastSyncAt={lastSyncAt} onInspectCard={onInspectCard} />;
    }
    return <DuelBoard payload={roomPayload} userId={userId} onRefresh={onRoom} onLeave={room.public_match ? leaveRoom : returnPrivateLobby} syncState={syncState} lastSyncAt={lastSyncAt} onInspectCard={onInspectCard} />;
  }

  if (roomPayload) {
    const room = roomPayload.room;
    const profileMap = Object.fromEntries(roomPayload.profiles.map((profile) => [profile.user_id, profile]));
    const members = roomPayload.members ?? roomPayload.profiles.map((profile) => ({ user_id: profile.user_id, role: profile.user_id === room.host_id ? 'player_a' as const : profile.user_id === room.guest_id ? 'player_b' as const : 'spectator' as const, is_owner: profile.user_id === (room.owner_id ?? room.host_id) }));
    const ownerId = room.owner_id ?? room.host_id;
    const isOwner = ownerId === userId;
    const isPlayerA = room.host_id === userId;
    const isPlayerB = room.guest_id === userId;
    const isPlayer = isPlayerA || isPlayerB;
    const myReady = isPlayerA ? room.ready_host : isPlayerB ? room.ready_guest : false;
    const wagerAmount = Math.max(0, Number(room.wager_amount ?? 0));
    const wagerEnabled = !room.public_match && wagerAmount > 0;
    const wagerAgreed = !wagerEnabled || (room.wager_host_accepted === true && room.wager_guest_accepted === true);
    const myWagerAccepted = isPlayerA ? room.wager_host_accepted === true : isPlayerB ? room.wager_guest_accepted === true : false;
    const readyBlockedByWager = !room.public_match && wagerEnabled && !wagerAgreed;
    const canAffordWager = !isPlayer || hub.wallet.coins >= wagerAmount;
    const rosterProfiles = members.map((member) => ({ member, profile: profileMap[member.user_id] })).filter((entry) => Boolean(entry.profile));
    const playerAProfile = profileMap[room.host_id];
    const playerBProfile = room.guest_id ? profileMap[room.guest_id] : undefined;
    const canApplyPlayers = isOwner && playerAChoice && playerBChoice && playerAChoice !== playerBChoice && room.status === 'waiting';

    return (
      <div className="waiting-room v32e-room-hub">
        <section className="waiting-card panel">
          <span className="eyebrow">{room.public_match ? 'QUICK MATCH' : 'PRIVATE DUEL ROOM'}</span>
          <h2>{room.public_match ? (room.guest_id ? '상대 연결 완료' : '상대 검색 중') : '방 대기실'}</h2>
          {!room.public_match && <div className="room-code"><small>ROOM CODE</small><strong>{room.code}</strong><button onClick={() => navigator.clipboard.writeText(room.code)}>복사</button></div>}
          {room.public_match && <div className="room-code"><small>MATCH STATUS</small><strong>{room.guest_id ? 'CONNECTED' : 'SEARCHING'}</strong></div>}

          <div className="versus-line v32e-player-seats">
            <div><Avatar id={playerAProfile?.avatar} size="large" /><small>PLAYER A</small><b><NicknameText name={playerAProfile?.display_name ?? '선수 A'} styleId={playerAProfile?.nickname_style} /></b><span className={room.ready_host ? 'ready' : ''}>{room.ready_host ? 'READY' : 'WAITING'}</span></div>
            <strong>VS</strong>
            <div>{room.guest_id ? <><Avatar id={playerBProfile?.avatar} size="large" /><small>PLAYER B</small><b><NicknameText name={playerBProfile?.display_name ?? '선수 B'} styleId={playerBProfile?.nickname_style} /></b><span className={room.ready_guest ? 'ready' : ''}>{room.ready_guest ? 'READY' : 'WAITING'}</span></> : <><span className="empty-avatar">?</span><small>PLAYER B</small><b>선수 대기 중</b><span>ROOM MEMBER</span></>}</div>
          </div>

          {!room.public_match && (
            <section className="v32e-room-roster">
              <header><div><small>ROOM ROSTER</small><b>선수 · 관전자</b></div><span>{members.length}/10</span></header>
              <div className="v32e-room-roster-grid">
                {rosterProfiles.map(({ member, profile }) => <article className={`v32e-room-member role-${member.role}`} key={member.user_id}><Avatar id={profile?.avatar} /><div><b><NicknameText name={profile?.display_name ?? '결투가'} styleId={profile?.nickname_style} /></b><small>{member.role === 'player_a' ? 'PLAYER A' : member.role === 'player_b' ? 'PLAYER B' : 'SPECTATOR'}{member.is_owner ? ' · ROOM OWNER' : ''}</small></div><span>{member.role === 'spectator' ? '관전' : '대전'}</span></article>)}
              </div>
              {isOwner && members.length >= 2 && (
                <div className="v32e-player-picker">
                  <div><label>PLAYER A</label><select value={playerAChoice} onChange={(event) => { const value = event.target.value; setPlayerAChoice(value); if (value === playerBChoice) setPlayerBChoice(''); }}>{rosterProfiles.map(({ member, profile }) => <option key={member.user_id} value={member.user_id}>{profile?.display_name ?? member.user_id}</option>)}</select></div>
                  <div><label>PLAYER B</label><select value={playerBChoice} onChange={(event) => setPlayerBChoice(event.target.value)}><option value="">선택하세요</option>{rosterProfiles.filter(({ member }) => member.user_id !== playerAChoice).map(({ member, profile }) => <option key={member.user_id} value={member.user_id}>{profile?.display_name ?? member.user_id}</option>)}</select></div>
                  <button className="primary-button" disabled={busy || !canApplyPlayers} onClick={() => roomAction('set_room_players', { roomId: room.id, playerAId: playerAChoice, playerBId: playerBChoice })}>다음 경기 선수 적용</button>
                  <small>방장은 자신이 관전자로 빠지고 다른 두 유저를 선수로 지정할 수도 있습니다.</small>
                </div>
              )}
            </section>
          )}

          {!room.public_match && (
            <section className={`v31k-wager-panel ${wagerEnabled ? 'active' : ''}`}>
              <div className="v31k-wager-title"><div><small>COIN DUEL</small><b>코인 내기</b><span>방장이 금액을 정하고 실제 두 선수가 각각 동의합니다.</span></div><strong>{wagerEnabled ? `${wagerAmount.toLocaleString()} × 2` : 'OFF'}</strong></div>
              <div className="v31k-wager-summary"><span><small>각자 판돈</small><b>{wagerAmount.toLocaleString()} COIN</b></span><i>→</i><span><small>승자 수령</small><b>{(wagerAmount * 2).toLocaleString()} COIN</b></span></div>

              {isOwner && <div className="v31k-wager-host"><small>선수를 변경하거나 판돈을 바꾸면 양쪽 READY/동의가 초기화됩니다.</small><div className="v31k-wager-presets">{[0, 100, 300, 500, 1000, 2500, 5000].map((amount) => <button key={amount} type="button" className={wagerAmount === amount ? 'selected' : ''} disabled={busy || room.wager_locked === true} onClick={() => { setWagerInput(String(amount || 500)); void roomAction('set_room_wager', { roomId: room.id, amount }); }}>{amount === 0 ? '내기 없음' : amount.toLocaleString()}</button>)}</div><div className="v31k-wager-custom"><input type="number" min={0} max={10000} step={50} value={wagerInput} onChange={(event) => setWagerInput(event.target.value)} aria-label="판돈 직접 입력" /><span>COIN</span><button type="button" disabled={busy || room.wager_locked === true} onClick={() => roomAction('set_room_wager', { roomId: room.id, amount: Number(wagerInput) })}>적용</button></div></div>}

              {wagerEnabled && isPlayer && !myWagerAccepted && <div className="v31k-wager-guest"><button type="button" disabled={busy || !canAffordWager || room.wager_locked === true} onClick={() => roomAction('accept_room_wager', { roomId: room.id })}>{canAffordWager ? `${wagerAmount.toLocaleString()} COIN 내기 동의` : '코인이 부족합니다'}</button></div>}
              {wagerEnabled && isPlayer && myWagerAccepted && <div className="v31k-wager-guest"><button type="button" className="accepted" disabled>판돈 동의 완료</button></div>}
              {!wagerEnabled && <div className="v31k-wager-guest"><span>현재 방은 코인을 걸지 않는 일반 친선전입니다.</span></div>}

              {wagerEnabled && <div className="v31k-wager-consent"><span className={room.wager_host_accepted ? 'ok' : ''}><i />PLAYER A {room.wager_host_accepted ? '동의' : '대기'}</span><span className={room.wager_guest_accepted ? 'ok' : ''}><i />PLAYER B {room.wager_guest_accepted ? '동의' : '대기'}</span>{room.wager_locked && <em>판돈 예치 완료</em>}</div>}
              {wagerEnabled && isPlayer && !canAffordWager && <p className="v31k-wager-warning">내 보유 코인 {hub.wallet.coins.toLocaleString()} · 판돈이 부족합니다.</p>}
            </section>
          )}

          <p>{room.public_match ? (room.guest_id ? '현재 온라인 상태가 확인된 상대입니다. 양쪽 플레이어가 준비하면 결투가 시작됩니다.' : '온라인 상태가 확인된 상대만 연결합니다.') : isPlayer ? (wagerEnabled ? (wagerAgreed ? '선수 두 명의 판돈 합의가 끝났습니다. 양쪽 READY 후 경기가 시작됩니다.' : '두 선수가 판돈에 동의하면 READY할 수 있습니다.') : '현재 PLAYER A/B 두 명이 준비하면 결투가 시작됩니다.') : '현재 관전자입니다. 경기가 시작되면 공개 정보와 모든 전투 연출을 실시간으로 볼 수 있습니다.'}</p>
          {message && <p className="error-banner">{message}</p>}
          <div className="waiting-actions"><button className="ghost-button" disabled={busy} onClick={leaveRoom}>방 나가기</button>{isPlayer ? <button className="primary-button" aria-busy={busy} disabled={busy || myReady || !room.guest_id || readyBlockedByWager} onClick={() => roomAction('ready', { roomId: room.id })}>{busy ? '준비 처리 중…' : myReady ? '준비 완료' : readyBlockedByWager ? '판돈 동의 필요' : '결투 준비'}</button> : <button className="primary-button" disabled>관전 대기 중</button>}</div>
        </section>
      </div>
    );
  }

  const activeDeck = hub.decks.find((deck) => deck.is_active);
  const practiceDeckError = activeDeck ? (validateDeck(activeDeck.cards) || validateExtraDeck(activeDeck.extra_cards)) : '활성 덱이 없습니다.';

  if (practiceDifficulty && activeDeck && !practiceDeckError) {
    return <PracticeDuel userId={userId} hub={hub} activeDeck={activeDeck} difficulty={practiceDifficulty} onExit={() => setPracticeDifficulty(null)} />;
  }

  return (
    <div className="duel-lobby view-stack">
      <section className="duel-hero"><div><span className="eyebrow">DUEL ARENA</span><h1>한 장의 선택이<br />전장을 뒤집는다.</h1><p>ENERGY와 손패의 흐름을 설계하고, 숨겨 둔 함정과 엑스트라 소환으로 상대의 다음 수까지 흔드세요.</p></div><CardFace card={CARD_BY_ID.unit_crownless_titan} /></section>
      <section className="v35-practice-panel panel">
        <div className="v35-practice-copy"><span>PRACTICE MODE</span><h2>혼자서 봇과 실전처럼 연습</h2><p>현재 활성 덱으로 실제 대전 규칙을 그대로 연습합니다. 코인·XP·승패 기록에는 반영되지 않고, 연습 중에는 턴 시간 제한도 없습니다.</p></div>
        <div className="v35-practice-levels">
          {(['easy', 'normal', 'hard'] as PracticeDifficulty[]).map((difficulty) => {
            const descriptions: Record<PracticeDifficulty, string> = {
              easy: '합법적인 수 안에서 실수와 랜덤 선택이 많아 처음 규칙을 익히기 좋습니다.',
              normal: '기본 전개와 공격 순서, 자원 효율을 판단하며 실제 유저와 비슷하게 플레이합니다.',
              hard: '필드 가치·킬각·에너지 효율을 우선 계산해 가능한 수 중 가장 강한 선택을 노립니다.',
            };
            return <button type="button" key={difficulty} className={`v35-practice-level difficulty-${difficulty}`} disabled={!activeDeck || Boolean(practiceDeckError)} onClick={() => setPracticeDifficulty(difficulty)}><small>{difficulty.toUpperCase()}</small><b>{PRACTICE_DIFFICULTY_LABEL[difficulty]}</b><span>{descriptions[difficulty]}</span><em>연습 시작 →</em></button>;
          })}
        </div>
        <footer><span><i />LOCAL TRAINING</span><small>봇 전용 덱은 보유 카드와 무관하게 자동 구성되며 계정 데이터를 사용하지 않습니다.</small></footer>
        {practiceDeckError && <p className="v35-practice-warning">연습 모드를 시작하려면 정상적인 45장 메인 덱과 6장 엑스트라 덱을 활성화해 주세요. · {practiceDeckError}</p>}
      </section>
      {hub.decks.length > 0 && <section className="v35-quick-deck-panel panel">
        <header><div><span>DUEL DECK</span><h2>대전 기본 덱 빠른 지정</h2></div><small>로그인 후 다시 들어와도 마지막으로 지정한 활성 덱이 유지됩니다.</small></header>
        <div className="v35-quick-deck-list">
          {hub.decks.map((deck) => {
            const deckError = validateDeck(deck.cards) || validateExtraDeck(deck.extra_cards);
            return (
              <button
                type="button"
                key={deck.id}
                className={`v35-quick-deck-item ${deck.is_active ? 'active' : ''}`}
                disabled={busy || Boolean(deckError)}
                onClick={() => switchActiveDeck(deck.id)}
              >
                <div><b>{deck.name}</b><small>{deck.cards.length}/{DECK_SIZE} · EXTRA {deck.extra_cards.length}/{EXTRA_DECK_SIZE}</small></div>
                <span>{deck.is_active ? '현재 사용 중' : deckError ? '구성 오류' : '대전 덱으로 지정'}</span>
                {deckError && <em>{deckError}</em>}
              </button>
            );
          })}
        </div>
      </section>}
      {!serverStatus.secureDuelReady && <section className="duel-server-panel panel"><div className="duel-server-emblem">!</div><div><span>ECLIPSE NETWORK</span><h2>온라인 대전 서비스를 점검하고 있습니다.</h2><p>{publicServerStatusMessage(serverStatus)}</p></div><ol><li><b>1</b><span>덱 구성과 카드 보관함은 계속 이용할 수 있습니다.</span></li><li><b>2</b><span>연습 모드는 온라인 서버 상태와 관계없이 이용할 수 있습니다.</span></li><li><b>3</b><span>대전 서버가 복구되면 별도 설정 없이 온라인 대전도 바로 이용할 수 있습니다.</span></li></ol><small>현재 계정과 보유 카드 데이터는 그대로 유지됩니다.</small></section>}
      <section className={`duel-mode-grid ${serverStatus.secureDuelReady ? '' : 'is-disabled'}`}>
        <button className="mode-card ranked" disabled={busy || !activeDeck || !serverStatus.secureDuelReady} onClick={() => roomAction('quick_match')}><span>QUICK MATCH</span><h3>빠른 대전</h3><p>현재 대기 중인 결투가를 찾아 자동으로 연결합니다. 활성 덱이 그대로 사용됩니다.</p><em>매칭 시작 →</em></button>
        <button className="mode-card private" disabled={busy || !activeDeck || !serverStatus.secureDuelReady} onClick={() => roomAction('create_room')}><span>PRIVATE ROOM</span><h3>방코드 대전</h3><p>친구들과 한 방에 모여 선수 2명을 정하고 나머지는 실시간으로 관전할 수 있습니다.</p><em>방 만들기 →</em></button>
        <article className="mode-card join v32e-code-room-entry"><span>JOIN / WATCH</span><h3>방코드 입장</h3><p>같은 6자리 코드로 선수 참가 또는 관전을 선택할 수 있습니다.</p><div className="inline-form"><input value={code} onChange={(event: ChangeEvent<HTMLInputElement>) => setCode(event.target.value.toUpperCase())} maxLength={6} placeholder="ABC123" /></div><div className="v32e-code-actions"><button disabled={busy || code.length < 6 || !activeDeck || !serverStatus.secureDuelReady} onClick={() => roomAction('join_room', { code })}>선수로 참가</button><button className="ghost-button" disabled={busy || code.length < 6 || !serverStatus.secureDuelReady} onClick={() => roomAction('spectate_room', { code })}>관전으로 입장</button></div></article>
      </section>
      {!activeDeck && <p className="error-banner">온라인 대전을 시작하려면 덱 메뉴에서 활성 덱을 먼저 지정하세요. 관전은 활성 덱 없이도 가능합니다.</p>}
      {message && <p className="error-banner">{message}</p>}
    </div>
  );
}

function IpadRuntimeBridge() {
  useEffect(() => {
    const root = document.documentElement;
    const isIpad = /iPad/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!isIpad) return;

    root.dataset.ipad = 'true';

    const syncViewport = () => {
      const viewport = window.visualViewport;
      const width = Math.round(viewport?.width ?? window.innerWidth);
      const height = Math.round(viewport?.height ?? window.innerHeight);
      const layoutWidth = window.innerWidth;
      const layoutHeight = window.innerHeight;
      const landscape = layoutWidth >= layoutHeight;
      root.style.setProperty('--ipad-vw', `${width}px`);
      root.style.setProperty('--ipad-vh', `${height}px`);
      root.dataset.ipadOrientation = landscape ? 'landscape' : 'portrait';
      root.dataset.ipadKeyboard = viewport && layoutHeight - viewport.height > 120 ? 'open' : 'closed';

      if (landscape) {
        // Keep the duel composition identical to the desktop three-column view,
        // then scale the whole canvas to the physical iPad viewport.
        const desktopWidth = 1280;
        const desktopHeight = 800;
        const scale = Math.min(1, width / desktopWidth, height / desktopHeight);
        const safeScale = Math.max(0.62, scale);
        root.style.setProperty('--ipad-duel-scale', safeScale.toFixed(4));
        root.style.setProperty('--ipad-duel-w', `${Math.round(width / safeScale)}px`);
        root.style.setProperty('--ipad-duel-h', `${Math.round(height / safeScale)}px`);
      } else {
        root.style.removeProperty('--ipad-duel-scale');
        root.style.removeProperty('--ipad-duel-w');
        root.style.removeProperty('--ipad-duel-h');
      }
    };

    const onTouch = () => { root.dataset.ipadInput = 'touch'; };
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') root.dataset.ipadInput = 'pointer';
      else if (event.pointerType === 'touch' || event.pointerType === 'pen') root.dataset.ipadInput = 'touch';
    };

    syncViewport();
    window.addEventListener('resize', syncViewport, { passive: true });
    window.addEventListener('orientationchange', syncViewport, { passive: true });
    window.visualViewport?.addEventListener('resize', syncViewport, { passive: true });
    window.visualViewport?.addEventListener('scroll', syncViewport, { passive: true });
    document.addEventListener('touchstart', onTouch, { passive: true });
    document.addEventListener('pointerdown', onPointer, { passive: true });

    return () => {
      window.removeEventListener('resize', syncViewport);
      window.removeEventListener('orientationchange', syncViewport);
      window.visualViewport?.removeEventListener('resize', syncViewport);
      window.visualViewport?.removeEventListener('scroll', syncViewport);
      document.removeEventListener('touchstart', onTouch);
      document.removeEventListener('pointerdown', onPointer);
      delete root.dataset.ipad;
      delete root.dataset.ipadOrientation;
      delete root.dataset.ipadKeyboard;
      delete root.dataset.ipadInput;
      root.style.removeProperty('--ipad-vw');
      root.style.removeProperty('--ipad-vh');
      root.style.removeProperty('--ipad-duel-scale');
      root.style.removeProperty('--ipad-duel-w');
      root.style.removeProperty('--ipad-duel-h');
    };
  }, []);

  return null;
}

export default function Page() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [hub, setHub] = useState<HubData | null>(null);
  const [view, setView] = useState<View>('home');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatUnread, setChatUnread] = useState(false);
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
  const [passwordChangeOpen, setPasswordChangeOpen] = useState(false);
  const [accountRecoveryOpen, setAccountRecoveryOpen] = useState(false);
  const [canRecoverAccounts, setCanRecoverAccounts] = useState(false);

  useEffect(() => {
    if (chatOpen) setChatUnread(false);
  }, [chatOpen]);

  useEffect(() => {
    setChatUnread(false);
  }, [roomPayload?.room.id]);
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
            setCanRecoverAccounts(false);
            setAccountRecoveryOpen(false);
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
          setCanRecoverAccounts(false);
            setAccountRecoveryOpen(false);
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
        setCanRecoverAccounts(result.canRecoverAccounts === true);
        if (result.serverStatus) setServerStatus(result.serverStatus);
        if (result.room && result.profiles) {
          setRoomPayload({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null, members: result.members ?? [], spectatorHands: result.spectatorHands ?? undefined, spectatorSecrets: result.spectatorSecrets ?? undefined, battleEmotes: result.battleEmotes ?? [] });
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
    const userId = session?.user.id;
    if (!userId) return;

    let alive = true;
    let refreshing = false;
    let queued = false;
    let refreshTimer: number | undefined;

    async function refreshSocial() {
      if (!alive) return;
      if (refreshing) {
        queued = true;
        return;
      }
      refreshing = true;
      try {
        const result = await api('hub');
        if (!alive) return;
        if (result.hub) setHub(result.hub);
      } catch (reason) {
        if (typeof console !== 'undefined') console.warn('[ECLIPSE SOCIAL REALTIME]', reason instanceof Error ? reason.message : 'social refresh failed');
      } finally {
        refreshing = false;
        if (queued && alive) {
          queued = false;
          window.setTimeout(() => { void refreshSocial(); }, 80);
        }
      }
    }

    function scheduleSocialRefresh() {
      if (!alive) return;
      if (refreshTimer) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => { void refreshSocial(); }, 120);
    }

    const channel = supabase
      .channel(`social-${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eclipse_friend_requests', filter: `receiver_id=eq.${userId}` }, scheduleSocialRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eclipse_friend_requests', filter: `sender_id=eq.${userId}` }, scheduleSocialRefresh)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eclipse_friends', filter: `user_id=eq.${userId}` }, scheduleSocialRefresh)
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          if (typeof console !== 'undefined') console.warn('[ECLIPSE SOCIAL REALTIME] subscription status:', status);
        }
      });

    const onFocus = () => scheduleSocialRefresh();
    const onVisible = () => { if (document.visibilityState === 'visible') scheduleSocialRefresh(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      alive = false;
      if (refreshTimer) window.clearTimeout(refreshTimer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      supabase.removeChannel(channel);
    };
  }, [session?.user.id]);

  useEffect(() => {
    if (!roomPayload?.room.id || !session) return;
    const roomId = roomPayload.room.id;
    let alive = true;
    let refreshing = false;
    let lastSuccessfulSync = Date.now();
    let degradedTimer: number | undefined;

    async function refresh() {
      if (!alive || refreshing) return;
      refreshing = true;
      const slowTimer = window.setTimeout(() => {
        if (alive && Date.now() - lastSuccessfulSync > 12_000) setRoomSyncState('syncing');
      }, 1800);
      try {
        const result = await api('get_room', { roomId });
        if (!alive) return;
        if (result.room && result.profiles) {
          setRoomPayload({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null, members: result.members ?? [], spectatorHands: result.spectatorHands ?? undefined, spectatorSecrets: result.spectatorSecrets ?? undefined, battleEmotes: result.battleEmotes ?? [] });
          lastSuccessfulSync = Date.now();
          setRoomSyncState('live');
          setLastRoomSyncAt(lastSuccessfulSync);
        }
      } catch (reason) {
        if (!alive) return;
        if (navigator.onLine === false) setRoomSyncState('offline');
        else if (Date.now() - lastSuccessfulSync > 12_000) setRoomSyncState('syncing');
        if (typeof console !== 'undefined') console.warn('[ECLIPSE SYNC]', reason instanceof Error ? reason.message : 'room sync failed');
      } finally {
        window.clearTimeout(slowTimer);
        refreshing = false;
      }
    }

    const channel = supabase
      .channel(`room-${roomId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'eclipse_rooms', filter: `id=eq.${roomId}` }, () => { void refresh(); })
      .subscribe((status) => {
        if (!alive) return;
        if (status === 'SUBSCRIBED') {
          if (degradedTimer) window.clearTimeout(degradedTimer);
          lastSuccessfulSync = Date.now();
          setRoomSyncState('live');
          setLastRoomSyncAt(lastSuccessfulSync);
          return;
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          // Realtime sockets can briefly re-negotiate even though HTTP room sync is healthy.
          // Do not flash RECONNECTING for those transient transport events.
          if (degradedTimer) window.clearTimeout(degradedTimer);
          degradedTimer = window.setTimeout(() => {
            if (!alive) return;
            if (navigator.onLine === false) setRoomSyncState('offline');
            void refresh();
          }, 2200);
        }
      });

    const onFocus = () => { void refresh(); };
    const onVisibility = () => { if (document.visibilityState === 'visible') void refresh(); };
    const onOffline = () => { if (alive) setRoomSyncState('offline'); };
    const onOnline = () => { if (alive) void refresh(); };
    window.addEventListener('focus', onFocus);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    document.addEventListener('visibilitychange', onVisibility);
    const pollMs = roomPayload?.room.status === 'active' ? 3000 : 8000;
    const timer = window.setInterval(() => { void refresh(); }, pollMs);

    return () => {
      alive = false;
      window.clearInterval(timer);
      if (degradedTimer) window.clearTimeout(degradedTimer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
      document.removeEventListener('visibilitychange', onVisibility);
      void supabase.removeChannel(channel);
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
          setRoomPayload({ room: result.room, profiles: result.profiles, privateState: result.privateState ?? null, members: result.members ?? [], spectatorHands: result.spectatorHands ?? undefined, spectatorSecrets: result.spectatorSecrets ?? undefined, battleEmotes: result.battleEmotes ?? [] });
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

  const pendingFriendRequestCount = hub.friendRequests.filter((request) => request.receiver_id === session.user.id && request.status === 'pending').length;

  const content = (() => {
    switch (view) {
      case 'duel': return <DuelView userId={session.user.id} hub={hub} roomPayload={roomPayload} onRoom={setRoomPayload} onHub={setHub} serverStatus={serverStatus} syncState={roomSyncState} lastSyncAt={lastRoomSyncAt} onInspectCard={setInspectedCardId} />;
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
    <main className={`game-app v19-client v23-client view-${view} ${roomPayload?.room.status === 'active' || roomPayload?.room.status === 'finished' ? 'in-duel' : ''}`} data-ui-build="v32-retail">
      <IpadRuntimeBridge />
      <div className="app-backdrop" aria-hidden="true"><span className="backdrop-grid" /><span className="backdrop-orbit" /><span className="backdrop-glow" /></div>
      <aside className="sidebar">
        <button className="game-logo" onClick={() => { playUiSound('click'); setSettingsOpen(false); setChatOpen(false); setView('home'); }}><span className="logo-glyph"><i>E</i></span><div><b>ECLIPSE</b><small>DUEL</small></div></button>
        <nav>{NAV_ITEMS.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { playUiSound('click'); setSettingsOpen(false); setChatOpen(false); setView(item.id); }}><i><GameIcon name={item.id} /></i><span>{item.label}</span>{item.id === 'friends' && pendingFriendRequestCount > 0 && <b className="social-request-badge" aria-label={`받은 친구 요청 ${pendingFriendRequestCount}개`}>{pendingFriendRequestCount > 9 ? '9+' : pendingFriendRequestCount}</b>}</button>)}</nav>
        <div className="sidebar-profile"><Avatar id={hub.profile.avatar} size="small" /><span><b><NicknameText name={hub.profile.display_name} styleId={hub.profile.nickname_style} /></b><small>LV.{levelFromXp(hub.profile.xp)}</small></span><button aria-label="로그아웃" onClick={() => supabase.auth.signOut({ scope: 'local' })}><GameIcon name="logout" /></button></div>
      </aside>

      <header className="topbar">
        <div className="mobile-logo"><span className="logo-glyph"><i>E</i></span><b>ECLIPSE DUEL</b></div>
        <div className="topbar-title"><small>{NAV_ITEMS.find((item) => item.id === view)?.label ?? (view === 'profile' ? '프로필' : 'ECLIPSE')}</small><b>ECLIPSE NETWORK</b></div>
        <button className={`v13-server-chip ${serverStatus.secureDuelReady ? 'ready' : 'warning'}`} onClick={() => setView('duel')} title={publicServerStatusMessage(serverStatus)}><span />{serverStatus.secureDuelReady ? '온라인' : '점검 중'}</button>
        <div className="topbar-actions v9-topbar-actions">
          <span className="currency-pill"><GameIcon name="coin" /><small>COIN</small><b>{hub.wallet.coins.toLocaleString()}</b></span>
          <button className={`chat-toggle ${chatOpen ? 'active' : ''} ${chatUnread ? 'has-unread' : ''}`} aria-label={`${roomChat ? '방 채팅' : '채팅'}${chatUnread ? ' - 새 메시지 있음' : ''}`} onClick={() => { playUiSound('click'); setSettingsOpen(false); setChatOpen((value) => !value); }}><GameIcon name="chat" /><span>{roomChat ? '방 채팅' : '채팅'}</span>{chatUnread && <i className="chat-unread-dot" aria-hidden="true" />}</button>
          <button className="profile-chip" onClick={() => { playUiSound('click'); setSettingsOpen(false); setChatOpen(false); setView('profile'); }}><Avatar id={hub.profile.avatar} size="small" /><i className={`v26-chip-emblem emblem-${hub.profile.profile_emblem ?? 'emblem_default'}`} aria-hidden="true">{emblemGlyph(hub.profile.profile_emblem)}</i><span><NicknameText name={hub.profile.display_name} styleId={hub.profile.nickname_style} /></span></button>
          <button className={`v9-icon-button v22-system-button ${settingsOpen ? 'active' : ''}`} onClick={() => { playUiSound('click'); setChatOpen(false); setSettingsOpen((value) => !value); }} title="게임 설정" aria-label="게임 설정"><GameIcon name="settings" /><span>SYSTEM</span></button>
        </div>
      </header>

      <section className="content-area">
        {error && <div className="global-error v32-global-notice" role="alert"><i aria-hidden="true">!</i><span>{error}</span><button onClick={() => setError('')} aria-label="알림 닫기">×</button></div>}
        <div key={view} className="v32-view-stage">{content}</div>
      </section>

      <nav className="mobile-nav">{NAV_ITEMS.map((item) => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { playUiSound('click'); setSettingsOpen(false); setChatOpen(false); setView(item.id); }}><i><GameIcon name={item.id} /></i><span>{item.label}</span>{item.id === 'friends' && pendingFriendRequestCount > 0 && <b className="social-request-badge" aria-label={`받은 친구 요청 ${pendingFriendRequestCount}개`}>{pendingFriendRequestCount > 9 ? '9+' : pendingFriendRequestCount}</b>}</button>)}</nav>
      <ChatDrawer open={chatOpen} roomId={roomChat} onClose={() => setChatOpen(false)} profile={hub.profile} emoteIds={hub.emoteLoadout ?? []} onUnread={() => setChatUnread(true)} />
      {chatOpen && <button className="chat-backdrop" aria-label="채팅 닫기" onClick={() => setChatOpen(false)} />}
      <ControlCenter
        open={settingsOpen}
        soundEnabled={soundEnabled}
        soundVolume={soundVolume}
        canRecoverAccounts={canRecoverAccounts}
        onClose={() => setSettingsOpen(false)}
        onToggleSound={toggleSound}
        onVolumeChange={changeSoundVolume}
        onOpenGuide={() => { setSettingsOpen(false); setGuideOpen(true); }}
        onOpenProfile={() => { setSettingsOpen(false); setView('profile'); }}
        onOpenPasswordChange={() => { setSettingsOpen(false); setPasswordChangeOpen(true); }}
        onOpenAccountRecovery={() => { setSettingsOpen(false); setAccountRecoveryOpen(true); }}
        onSignOut={() => { setSettingsOpen(false); void supabase.auth.signOut({ scope: 'local' }); }}
      />
      {inspectedCardId && CARD_BY_ID[inspectedCardId] && <CardDetailModal card={CARD_BY_ID[inspectedCardId]} onClose={() => setInspectedCardId(null)} />}
      {guideOpen && <GameGuideModal onClose={() => setGuideOpen(false)} />}
      <PasswordChangeModal open={passwordChangeOpen} onClose={() => setPasswordChangeOpen(false)} />
      {canRecoverAccounts && <AccountRecoveryModal open={accountRecoveryOpen} onClose={() => setAccountRecoveryOpen(false)} />}
    </main>
  );
}
