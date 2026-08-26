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
];

export const V34_BATTLE_EMOTE_BY_ID = Object.fromEntries(V34_BATTLE_EMOTES.map((item) => [item.id, item])) as Record<string, BattleEmote>;
export const V34_BATTLE_EMOTE_PACK_BY_ID = Object.fromEntries(V34_BATTLE_EMOTE_PACKS.map((item) => [item.id, item])) as Record<string, BattleEmotePack>;
export const V34_EMOTE_SLOT_LIMIT = 6;
