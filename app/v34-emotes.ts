export type BattleEmote = {
  id: string;
  name: string;
  franchise: string;
  mood: string;
  price: number;
  asset: string;
  packId: string;
};

export type BattleEmotePack = {
  id: string;
  name: string;
  franchise: string;
  description: string;
  price: number;
  emoteIds: string[];
  coverAsset: string;
};

const SINGLE_PRICE = 1000;
const PACK_PRICE = 5000;

export const V34_BATTLE_EMOTES: BattleEmote[] = [
  { id: 'doro_mug', name: '도로롱 · 머그컵', franchise: 'DORO / 도로롱', mood: 'coffee', price: SINGLE_PRICE, asset: '/emotes/v34/doro_mug.png', packId: 'doro_bundle' },
  { id: 'doro_thumbs', name: '도로롱 · 엄지척', franchise: 'DORO / 도로롱', mood: 'thumbs-up', price: SINGLE_PRICE, asset: '/emotes/v34/doro_thumbs.png', packId: 'doro_bundle' },
  { id: 'doro_beam', name: '도로롱 · 빔', franchise: 'DORO / 도로롱', mood: 'beam', price: SINGLE_PRICE, asset: '/emotes/v34/doro_beam.png', packId: 'doro_bundle' },
  { id: 'doro_sleep', name: '도로롱 · 도로롱', franchise: 'DORO / 도로롱', mood: 'sleep', price: SINGLE_PRICE, asset: '/emotes/v34/doro_sleep.png', packId: 'doro_bundle' },
  { id: 'doro_prison', name: '도로롱 · 감옥', franchise: 'DORO / 도로롱', mood: 'prison', price: SINGLE_PRICE, asset: '/emotes/v34/doro_prison.png', packId: 'doro_bundle' },
  { id: 'doro_love', name: '도로롱 · 하트', franchise: 'DORO / 도로롱', mood: 'love', price: SINGLE_PRICE, asset: '/emotes/v34/doro_love.png', packId: 'doro_bundle' },

  { id: 'nikke_good', name: 'NIKKE · 좋아요!', franchise: 'NIKKE', mood: 'good', price: SINGLE_PRICE, asset: '/emotes/v34/nikke_good.png', packId: 'nikke_bundle' },
  { id: 'nikke_power', name: 'NIKKE · Power!', franchise: 'NIKKE', mood: 'power', price: SINGLE_PRICE, asset: '/emotes/v34/nikke_power.png', packId: 'nikke_bundle' },
  { id: 'nikke_heave', name: 'NIKKE · 영차영차', franchise: 'NIKKE', mood: 'heave', price: SINGLE_PRICE, asset: '/emotes/v34/nikke_heave.png', packId: 'nikke_bundle' },
  { id: 'nikke_charge', name: 'NIKKE · 당장 가겠네!', franchise: 'NIKKE', mood: 'charge', price: SINGLE_PRICE, asset: '/emotes/v34/nikke_charge.png', packId: 'nikke_bundle' },
  { id: 'nikke_laugh', name: 'NIKKE · ㅋㅋㅋㅋㅋ', franchise: 'NIKKE', mood: 'laugh', price: SINGLE_PRICE, asset: '/emotes/v34/nikke_laugh.png', packId: 'nikke_bundle' },
  { id: 'nikke_tea', name: 'NIKKE · 티타임', franchise: 'NIKKE', mood: 'tea', price: SINGLE_PRICE, asset: '/emotes/v34/nikke_tea.png', packId: 'nikke_bundle' },

  { id: 'trickcal_sparkle', name: '트릭컬 · 반짝 기대', franchise: 'TRICKCAL', mood: 'sparkle', price: SINGLE_PRICE, asset: '/emotes/v34/trickcal_sparkle.png', packId: 'trickcal_bundle' },
  { id: 'trickcal_escape', name: '트릭컬 · 탈출하지 ㅋㅋ', franchise: 'TRICKCAL', mood: 'escape', price: SINGLE_PRICE, asset: '/emotes/v34/trickcal_escape.png', packId: 'trickcal_bundle' },
  { id: 'trickcal_badgame', name: '트릭컬 · 망겜?', franchise: 'TRICKCAL', mood: 'badgame', price: SINGLE_PRICE, asset: '/emotes/v34/trickcal_badgame.png', packId: 'trickcal_bundle' },
  { id: 'trickcal_good', name: '트릭컬 · 좋아써!!', franchise: 'TRICKCAL', mood: 'good', price: SINGLE_PRICE, asset: '/emotes/v34/trickcal_good.png', packId: 'trickcal_bundle' },
  { id: 'trickcal_success', name: '트릭컬 · 대성공!', franchise: 'TRICKCAL', mood: 'success', price: SINGLE_PRICE, asset: '/emotes/v34/trickcal_success.png', packId: 'trickcal_bundle' },
  { id: 'trickcal_burst', name: '트릭컬 · 불 끼요옷!!', franchise: 'TRICKCAL', mood: 'burst', price: SINGLE_PRICE, asset: '/emotes/v34/trickcal_burst.png', packId: 'trickcal_bundle' },

  { id: 'guardian_water', name: '가디언테일즈 · 물방울', franchise: 'GUARDIAN TALES', mood: 'sad', price: SINGLE_PRICE, asset: '/emotes/v34/guardian_water.png', packId: 'guardian_bundle' },
  { id: 'guardian_flower', name: '가디언테일즈 · 하트꽃', franchise: 'GUARDIAN TALES', mood: 'love', price: SINGLE_PRICE, asset: '/emotes/v34/guardian_flower.png', packId: 'guardian_bundle' },
  { id: 'guardian_rage', name: '가디언테일즈 · 분노폭발', franchise: 'GUARDIAN TALES', mood: 'rage', price: SINGLE_PRICE, asset: '/emotes/v34/guardian_rage.png', packId: 'guardian_bundle' },
  { id: 'guardian_yahoo', name: '가디언테일즈 · 야호!', franchise: 'GUARDIAN TALES', mood: 'cheer', price: SINGLE_PRICE, asset: '/emotes/v34/guardian_yahoo.png', packId: 'guardian_bundle' },
  { id: 'guardian_shock', name: '가디언테일즈 · 충격', franchise: 'GUARDIAN TALES', mood: 'shock', price: SINGLE_PRICE, asset: '/emotes/v34/guardian_shock.png', packId: 'guardian_bundle' },
  { id: 'guardian_hurry', name: '가디언테일즈 · 빨리빨리', franchise: 'GUARDIAN TALES', mood: 'hurry', price: SINGLE_PRICE, asset: '/emotes/v34/guardian_hurry.png', packId: 'guardian_bundle' },

  { id: 'mang_buaa', name: '망그러진 곰 · 부아아앙', franchise: '망그러진 곰', mood: 'cry', price: SINGLE_PRICE, asset: '/emotes/v34/mang_buaa.png', packId: 'mang_bundle' },
  { id: 'mang_dirty', name: '망그러진 곰 · 꼬질..', franchise: '망그러진 곰', mood: 'tired', price: SINGLE_PRICE, asset: '/emotes/v34/mang_dirty.png', packId: 'mang_bundle' },
  { id: 'mang_cool', name: '망그러진 곰 · 멋지다', franchise: '망그러진 곰', mood: 'cool', price: SINGLE_PRICE, asset: '/emotes/v34/mang_cool.png', packId: 'mang_bundle' },
  { id: 'mang_best', name: '망그러진 곰 · 최고!', franchise: '망그러진 곰', mood: 'best', price: SINGLE_PRICE, asset: '/emotes/v34/mang_best.png', packId: 'mang_bundle' },
  { id: 'mang_music', name: '망그러진 곰 · 룰루', franchise: '망그러진 곰', mood: 'music', price: SINGLE_PRICE, asset: '/emotes/v34/mang_music.png', packId: 'mang_bundle' },
  { id: 'mang_book', name: '망그러진 곰 · 안 우는 법', franchise: '망그러진 곰', mood: 'book', price: SINGLE_PRICE, asset: '/emotes/v34/mang_book.png', packId: 'mang_bundle' },

  { id: 'irem_cry', name: '이렘티콘 · 훌쩍', franchise: '이렘티콘', mood: 'cry', price: SINGLE_PRICE, asset: '/emotes/v34/irem_cry.png', packId: 'irem_bundle' },
  { id: 'irem_yeah', name: '이렘티콘 · 이예이~', franchise: '이렘티콘', mood: 'yeah', price: SINGLE_PRICE, asset: '/emotes/v34/irem_yeah.png', packId: 'irem_bundle' },
  { id: 'irem_bread', name: '이렘티콘 · 식빵', franchise: '이렘티콘', mood: 'sleep', price: SINGLE_PRICE, asset: '/emotes/v34/irem_bread.png', packId: 'irem_bundle' },
  { id: 'irem_yell', name: '이렘티콘 · 대환호', franchise: '이렘티콘', mood: 'yell', price: SINGLE_PRICE, asset: '/emotes/v34/irem_yell.png', packId: 'irem_bundle' },
  { id: 'irem_pan', name: '이렘티콘 · 냄비분노', franchise: '이렘티콘', mood: 'rage', price: SINGLE_PRICE, asset: '/emotes/v34/irem_pan.png', packId: 'irem_bundle' },
  { id: 'irem_tears', name: '이렘티콘 · 감동눈물', franchise: '이렘티콘', mood: 'tears', price: SINGLE_PRICE, asset: '/emotes/v34/irem_tears.png', packId: 'irem_bundle' },

  // V54 · 동방티콘: 사용자가 제공한 원본 6개 PNG를 기반으로 선명화한 버전입니다.
  { id: 'touhou_01', name: '동방티콘 · 01', franchise: '동방티콘', mood: 'charge', price: SINGLE_PRICE, asset: '/emotes/v34/touhou_01.png', packId: 'touhou_bundle' },
  { id: 'touhou_02', name: '동방티콘 · 02', franchise: '동방티콘', mood: 'awkward', price: SINGLE_PRICE, asset: '/emotes/v34/touhou_02.png', packId: 'touhou_bundle' },
  { id: 'touhou_03', name: '동방티콘 · 03', franchise: '동방티콘', mood: 'thinking', price: SINGLE_PRICE, asset: '/emotes/v34/touhou_03.png', packId: 'touhou_bundle' },
  { id: 'touhou_04', name: '동방티콘 · 04', franchise: '동방티콘', mood: 'deadpan', price: SINGLE_PRICE, asset: '/emotes/v34/touhou_04.png', packId: 'touhou_bundle' },
  { id: 'touhou_05', name: '동방티콘 · 05', franchise: '동방티콘', mood: 'thanks', price: SINGLE_PRICE, asset: '/emotes/v34/touhou_05.png', packId: 'touhou_bundle' },
  { id: 'touhou_06', name: '동방티콘 · 06', franchise: '동방티콘', mood: 'cheer', price: SINGLE_PRICE, asset: '/emotes/v34/touhou_06.png', packId: 'touhou_bundle' },
];

export const V34_BATTLE_EMOTE_PACKS: BattleEmotePack[] = [
  {
    id: 'doro_bundle', name: '도로롱 6종 세트', franchise: 'DORO / 도로롱', price: PACK_PRICE,
    description: '도로롱 이모티콘 6종. 개별 6,000코인 대신 세트 5,000코인.',
    emoteIds: ['doro_mug','doro_thumbs','doro_beam','doro_sleep','doro_prison','doro_love'], coverAsset: '/emotes/v34/doro_love.png',
  },
  {
    id: 'nikke_bundle', name: 'NIKKE 6종 세트', franchise: 'NIKKE', price: PACK_PRICE,
    description: '제공된 NIKKE 이모티콘 6종. 개별 6,000코인 대신 세트 5,000코인.',
    emoteIds: ['nikke_good','nikke_power','nikke_heave','nikke_charge','nikke_laugh','nikke_tea'], coverAsset: '/emotes/v34/nikke_good.png',
  },
  {
    id: 'trickcal_bundle', name: '트릭컬 6종 세트', franchise: 'TRICKCAL', price: PACK_PRICE,
    description: '제공된 트릭컬 이모티콘 6종. 개별 6,000코인 대신 세트 5,000코인.',
    emoteIds: ['trickcal_sparkle','trickcal_escape','trickcal_badgame','trickcal_good','trickcal_success','trickcal_burst'], coverAsset: '/emotes/v34/trickcal_success.png',
  },
  {
    id: 'guardian_bundle', name: '가디언테일즈 6종 세트', franchise: 'GUARDIAN TALES', price: PACK_PRICE,
    description: '제공된 가디언테일즈 이모티콘 6종. 개별 6,000코인 대신 세트 5,000코인.',
    emoteIds: ['guardian_water','guardian_flower','guardian_rage','guardian_yahoo','guardian_shock','guardian_hurry'], coverAsset: '/emotes/v34/guardian_yahoo.png',
  },
  {
    id: 'mang_bundle', name: '망그러진 곰 6종 세트', franchise: '망그러진 곰', price: PACK_PRICE,
    description: '제공된 망그러진 곰 이모티콘 6종. 개별 6,000코인 대신 세트 5,000코인.',
    emoteIds: ['mang_buaa','mang_dirty','mang_cool','mang_best','mang_music','mang_book'], coverAsset: '/emotes/v34/mang_best.png',
  },
  {
    id: 'irem_bundle', name: '이렘티콘 6종 세트', franchise: '이렘티콘', price: PACK_PRICE,
    description: '제공된 이렘티콘 6종. 개별 6,000코인 대신 세트 5,000코인.',
    emoteIds: ['irem_cry','irem_yeah','irem_bread','irem_yell','irem_pan','irem_tears'], coverAsset: '/emotes/v34/irem_yeah.png',
  },
  {
    id: 'touhou_bundle', name: '동방티콘 6종 세트', franchise: '동방티콘', price: PACK_PRICE,
    description: '사용자가 제공한 원본 동방티콘 6종을 기반으로 선명화한 세트입니다. 개별 6,000코인 대신 세트 5,000코인.',
    emoteIds: ['touhou_01','touhou_02','touhou_03','touhou_04','touhou_05','touhou_06'], coverAsset: '/emotes/v34/touhou_01.png',
  },
];

export const V34_BATTLE_EMOTE_BY_ID = Object.fromEntries(V34_BATTLE_EMOTES.map((item) => [item.id, item])) as Record<string, BattleEmote>;
export const V34_BATTLE_EMOTE_PACK_BY_ID = Object.fromEntries(V34_BATTLE_EMOTE_PACKS.map((item) => [item.id, item])) as Record<string, BattleEmotePack>;
export const V34_EMOTE_SLOT_LIMIT = 6;
