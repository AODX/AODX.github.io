export type BattleMode = 'normal' | 'free';
export type CardCategory = 'physical' | 'mental' | 'verbal' | 'location';
export type CardRarity = '일반' | '고급' | '희귀' | '영웅' | '전설';

export type BattleCard = {
  id: string;
  category: CardCategory;
  label: string;
  statKey: string;
  value: number;
  unit: string;
  rarity: CardRarity;
  description: string;
};

export type Injury = {
  round: number;
  severity: '경미' | '중간' | '심각';
  text: string;
};

export type Player = {
  id: string;
  room_id: string;
  session_id: string;
  user_name: string;
  char_name: string;
  char_note: string;
  cards: BattleCard[];
  injuries: Injury[];
  ready: boolean;
  created_at: string;
};

export type Room = {
  id: string;
  code: string;
  host_session_id: string;
  battle_mode: BattleMode;
  status: 'lobby' | 'picking' | 'battling' | 'reinforce' | 'finished';
  round_no: number;
  location_picker_index: number;
  free_rules: string;
  created_at: string;
};

export type BattleState = {
  id: string;
  room_id: string;
  normal_draws: Record<string, BattleCard[]>;
  location_cards: BattleCard[];
  winner_player_id: string | null;
  loser_player_id: string | null;
  reinforcement_claimed: boolean;
  updated_at: string;
};
