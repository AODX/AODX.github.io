"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { createClient } from "@/lib/supabase/client";

type JobId = "sorting" | "delivery" | "cashier" | "cafe" | "security";
type SortKind = "red" | "blue" | "yellow" | "green" | "purple";
type SecuritySignal = "normal" | "thief" | "vip";

type Job = {
  id: JobId;
  name: string;
  subtitle: string;
  rewardText: string;
  icon: string;
};

type SortItem = {
  id: number;
  kind: SortKind;
  x: number;
  feedback?: "good" | "bad";
};

type RunnerObstacle = {
  id: number;
  lane: number;
  y: number;
};

type RunnerCoin = {
  id: number;
  lane: number;
  y: number;
};

type SaveRow = {
  cash: number | string;
  warning_count: number | string;
  unpaid_tax: number | string;
  sorting_success_total?: number | string | null;
  delivery_success_total?: number | string | null;
  cashier_success_total?: number | string | null;
  cafe_success_total?: number | string | null;
  security_success_total?: number | string | null;
};

type LobbyView = "room" | "street" | "jobs" | "housing" | "tax" | "career" | "ranking" | "stocks" | "casino" | "bank" | "estate" | "business" | "news" | "titles" | "insurance" | "employees" | "auction" | "academy" | "gacha" | "itemMarket" | "lotto" | "phone" | "luxury";
type RoomKind = "basic" | "studio" | "office";
type CareerBuildingId = "company" | "entertainment" | "logistics" | "finance";
type StreetBuildingId = CareerBuildingId | "stocks" | "casino" | "bank" | "estate" | "business" | "news" | "insurance" | "employees" | "auction" | "academy" | "gacha" | "itemMarket" | "lotto" | "luxury";
type OccupationId =
  | "unemployed"
  | "officeIntern"
  | "officeStaff"
  | "officeManager"
  | "officeDirector"
  | "salesAssociate"
  | "salesManager"
  | "hrSpecialist"
  | "peopleChief"
  | "marketingPlanner"
  | "brandDirector"
  | "planningCoordinator"
  | "strategyConsultant"
  | "projectManager"
  | "operationsDirector"
  | "convenienceManager"
  | "cafeManager"
  | "securityCaptain"
  | "franchiseOwner"
  | "chiefExecutive"
  | "shadowExecutive"
  | "trainee"
  | "rookieSinger"
  | "topSinger"
  | "choreographer"
  | "streamer"
  | "actor"
  | "musicProducer"
  | "idolManager"
  | "legendaryIdol"
  | "mythicMuse"
  | "logisticsStaff"
  | "logisticsManager"
  | "warehousePlanner"
  | "routeOptimizer"
  | "dispatchController"
  | "droneDispatcher"
  | "portCaptain"
  | "platformOpsManager"
  | "supplyChainDirector"
  | "logisticsLegend"
  | "phantomCourier"
  | "investor"
  | "bankAnalyst"
  | "fundManager"
  | "riskManager"
  | "ventureCapitalist"
  | "financialDirector"
  | "quantMaster"
  | "marketOracle"
  | "blackCardBroker";

type Occupation = {
  id: OccupationId;
  buildingId: CareerBuildingId;
  name: string;
  icon: string;
  grade: string;
  description: string;
  conditionText: string;
  salaryText: string;
  incomeEvery3Min: number;
  requiredCash: number;
  requiredPrevious?: OccupationId;
  requiredSuccess?: Partial<Record<JobId, number>>;
  minigameName: string;
  minigameDifficulty: number;
  hidden?: boolean;
  questNpc?: string;
};

type CareerQuest = {
  id: string;
  npc: string;
  title: string;
  targetId: OccupationId;
  story: string;
  request: string;
  successText: string;
  failText: string;
  hidden?: boolean;
};

type RankingRow = {
  rank: number;
  nickname: string;
  nicknameColorId?: NicknameColorId;
  cash: number;
  job: string;
  titleName?: string;
  titleIcon?: string;
  hasSave: boolean;
  isMe?: boolean;
};

type ChatMessageRow = {
  id: string;
  user_id: string | null;
  nickname: string | null;
  title_name: string | null;
  message: string;
  kind: "user" | "system";
  created_at: string;
};

type ProfileRow = {
  id: string;
  nickname: string | null;
  room_kind: string | null;
  occupation_id: string | null;
  current_title?: string | null;
  net_worth?: number | string | null;
  occupation_level?: number | null;
  unlocked_occupations?: OccupationId[] | string | null;
};

type RankingSaveRow = {
  user_id: string;
  cash: number | string;
};

type StockId = "kongStudio" | "zephyrLogistics" | "raelAir" | "dongshimLivestock" | "blmaSteel" | "guardianTales" | "epicGames" | "leagueLegends" | "valorantLabs" | "overwatchWorks" | "gachindong" | "babyPrincess" | "futurePrincess" | "summonerRift" | "heroWatch";

type StockCompany = {
  id: StockId;
  name: string;
  icon: string;
  description: string;
};

type PlayerTitleId = string;

type PlayerTitle = {
  id: PlayerTitleId;
  name: string;
  icon: string;
  description: string;
  passiveText?: string;
  hidden?: boolean;
};

type CertificationId = "office" | "barista" | "logistics" | "investment" | "business";
type Certification = {
  id: CertificationId;
  name: string;
  icon: string;
  price: number;
  description: string;
  effectText: string;
};

type ItemRarity = "일반" | "희소" | "진귀" | "보물" | "유물" | "고대 유물";
type ShopItemId = string;
type NicknameColorId = string;
type NicknameTagId = string;
type MainBackgroundId = string;
type MainCharacterId = string;

type NicknameColorTheme = {
  id: NicknameColorId;
  name: string;
  price: number;
  description: string;
  previewText: string;
  color?: string;
  gradient?: string;
  shadow?: string;
  letterSpacing?: string;
  fontStyle?: CSSProperties["fontStyle"];
  textTransform?: CSSProperties["textTransform"];
};

type NicknameTagItem = {
  id: NicknameTagId;
  name: string;
  price: number;
  description: string;
  background: string;
  borderColor: string;
  accentColor: string;
  shape: "pill" | "ticket" | "panel" | "ribbon";
};

type MainBackgroundOption = {
  id: MainBackgroundId;
  name: string;
  price: number;
  description: string;
  palette: [string, string, string];
  accent: string;
  sceneKey: string;
  anchorX: number;
  anchorY: number;
  anchorScale: number;
};

type MainCharacterOption = {
  id: MainCharacterId;
  name: string;
  price: number;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  highlightColor: string;
  spriteKey: string;
};
type ItemSortMode = "favorite" | "rarity" | "priceDesc" | "priceAsc" | "name" | "count";
type ShopItem = {
  id: ShopItemId;
  name: string;
  icon: string;
  rarity: ItemRarity;
  price: number;
  description: string;
  bonusType: "allIncome" | "businessIncome" | "jobIncome" | "casinoLuck" | "estateIncome" | "bankInterest" | "lottoLuck" | "gachaLuck" | "taxShield" | "employeeEfficiency";
  bonusValue: number;
};

type MarketListing = {
  id: string;
  seller_id: string;
  seller_nickname?: string | null;
  item_id: ShopItemId;
  price: number | string;
  status?: string | null;
  created_at?: string | null;
};

type LottoTicket = {
  id: string;
  price: number;
  prize: number;
  scratched: boolean;
  createdDate: string;
};

type StockRow = {
  id: StockId;
  name: string;
  icon: string;
  description: string;
  price: number;
  previousPrice: number;
  owned: number;
  averageBuyPrice?: number;
  history: number[];
};

type StockSaveRow = {
  rows: StockRow[] | string | null;
  updated_at: string | null;
};

type GlobalStockMarketResultRow = {
  rows: StockRow[] | string | null;
  news_events: NewsEvent[] | string | null;
  updated_at: string | null;
  news_updated_at: string | null;
};

type GlobalStockMarketResult = GlobalStockMarketResultRow | GlobalStockMarketResultRow[];


type CasinoUserRow = {
  id: string;
  nickname: string;
  nicknameColorId?: NicknameColorId;
  cash: number;
  job: string;
};

type PvpMatchRow = {
  id: string;
  challenger_id: string;
  opponent_id: string | null;
  stake: number | string;
  status: "waiting" | "accepted" | "playing" | "finished" | "cancelled";
  challenger_score: number | null;
  opponent_score: number | null;
  winner_id: string | null;
  game_type: string | null;
  created_at: string | null;
  accepted_at: string | null;
  finished_at: string | null;
};

type SlotResult = {
  result: string;
  stake: number;
  reward: number;
  profit: number;
};

type PvpSubmitResult = {
  status: string;
  winner_id?: string;
  reward?: number;
  challenger_score?: number;
  opponent_score?: number;
};

type PvpReactionState = "idle" | "waiting" | "go" | "submitted";

type FinanceHistoryPoint = {
  label: string;
  income: number;
  expense: number;
  netWorth: number;
};

type EstateId = "semiBasement" | "officetel" | "apartment" | "smallStore" | "building";
type BusinessId = "coffeeShop" | "convenienceStore" | "deliveryAgency" | "entertainmentAgency";
type InsuranceId = "delivery" | "deliveryPlus" | "deliveryPremium" | "tax" | "taxPlus" | "taxPremium" | "business" | "businessPlus" | "businessPremium" | "estateCover" | "estatePremium" | "casino" | "casinoPremium";
type AuctionId = "estate_apartment" | "estate_store" | "business_cafe" | "stock_bundle";

type EstateItem = {
  id: EstateId;
  name: string;
  icon: string;
  price: number;
  incomeEvery5Min: number;
  description: string;
};

type BusinessItem = {
  id: BusinessId;
  name: string;
  icon: string;
  price: number;
  incomeEvery5Min: number;
  requiredOccupation?: OccupationId;
  description: string;
};

type NewsEvent = {
  id: number;
  title: string;
  effect: string;
  tone: "good" | "bad" | "neutral";
  targetStocks: StockId[];
  impactPercent: number;
  sector: string;
};

type InsuranceGrade = "일반" | "희소" | "진귀" | "보물";

type InsuranceItem = {
  id: InsuranceId;
  name: string;
  icon: string;
  grade: InsuranceGrade;
  premiumEvery5Min: number;
  description: string;
  jobBonus?: number;
  taxDiscount?: number;
  seizureProtection?: number;
  businessBonus?: number;
  estateBonus?: number;
  casinoCashback?: number;
};

type EmployeePlan = {
  level: number;
  name: string;
  cost: number;
  payrollEvery60Sec: number;
  revenueBonusRate: number;
  description: string;
};

type AuctionDeal = {
  id: AuctionId;
  name: string;
  icon: string;
  type: "estate" | "business" | "stock";
  price: number;
  value: number;
  description: string;
};

const PROFILE_TABLE = "game_profiles";
const CHAT_TABLE = "game_global_chat";
const STOCK_TABLE = "game_stock_saves";
const GLOBAL_STOCK_TABLE = "game_global_stock_market";
const ECONOMY_TABLE = "game_economy_saves";
const CAREER_RESET_VERSION = "rpg-npc-career-reset-v2";
const STOCK_INTERVAL_MS = 3 * 60 * 1000;
const SLOT_SYMBOLS = ["7", "🍒", "💎", "🍀", "⭐", "🍋"];
const TAX_INTERVAL_SECONDS = 420;
const TAX_WARNING_SECONDS = 60;

const PAY = {
  sorting: 320,
  sortingComboBonus: 50,
  delivery: 700,
  cashier: 140,
  cashierSuccessBonus: 45,
  cashierDifficultyBonus: 25,
  cafe: 180,
  securityPass: 300,
  securityCatch: 500,
  securityNormalPenalty: 200,
  deliveryCrashPenalty: 250,
  vipPenalty: 1500,
};

const jobs: Job[] = [
  {
    id: "sorting",
    name: "택배 분류 알바",
    subtitle: "빠르게 지나가는 택배를 색깔 키로 분류하세요.",
    rewardText: `기본 ${PAY.sorting.toLocaleString()}원 + 콤보당 ${PAY.sortingComboBonus.toLocaleString()}원`,
    icon: "📦",
  },
  {
    id: "delivery",
    name: "음식 배달 알바",
    subtitle: "빠른 도로에서 장애물을 피하고 배달 포인트를 통과하세요.",
    rewardText: `배달 포인트 1개당 ${PAY.delivery.toLocaleString()}원`,
    icon: "🛵",
  },
  {
    id: "cashier",
    name: "편의점 계산 알바",
    subtitle: "나오는 키를 순서대로 정확히 입력하세요.",
    rewardText: `기본 ${PAY.cashier.toLocaleString()}원 + 성공 횟수 보너스`,
    icon: "🏪",
  },
  {
    id: "cafe",
    name: "카페 음료 알바",
    subtitle: "컵 목표선에 맞춰 음료 양을 정확히 조절하세요.",
    rewardText: `음료 1잔당 ${PAY.cafe.toLocaleString()}원`,
    icon: "☕",
  },
  {
    id: "security",
    name: "보안요원 알바",
    subtitle: "수상한 사람만 막고 VIP는 통과시키세요.",
    rewardText: `일반/VIP 통과 ${PAY.securityPass.toLocaleString()}원 · 수상한 사람 검거 ${PAY.securityCatch.toLocaleString()}원 · VIP 차단 시 -${PAY.vipPenalty.toLocaleString()}원`,
    icon: "🛡️",
  },
];

const roomInfo: Record<RoomKind, { name: string; floor: string; description: string; priceText: string }> = {
  basic: { name: "기본 방", floor: "2F", description: "처음 지급되는 작은 방입니다.", priceText: "기본 제공" },
  studio: { name: "넓은 원룸", floor: "3F", description: "소파와 책상이 있는 넓은 생활 공간입니다.", priceText: "무료 변경" },
  office: { name: "작업실 방", floor: "5F", description: "알바와 사업 준비를 위한 작업실 느낌의 방입니다.", priceText: "무료 변경" },
};

const defaultNicknameColorTheme: NicknameColorTheme = {
  id: "default",
  name: "기본 닉네임",
  price: 0,
  description: "가장 기본적인 닉네임 색상입니다.",
  previewText: "기본",
  color: "#111827",
};

const luxuryNicknameColors: NicknameColorTheme[] = [
  { id: "neonPink", name: "네온 핑크", price: 100000000, description: "형광 간판처럼 반짝이는 강렬한 핑크 효과", previewText: "NEON", color: "#ff4fd8", shadow: "0 0 10px rgba(255,79,216,0.75), 0 0 24px rgba(255,79,216,0.5)" },
  { id: "neonBlue", name: "네온 블루", price: 120000000, description: "차가운 푸른빛이 번지는 네온 톤", previewText: "BLUE", color: "#38bdf8", shadow: "0 0 10px rgba(56,189,248,0.8), 0 0 22px rgba(56,189,248,0.45)" },
  { id: "sunsetGold", name: "선셋 골드", price: 145000000, description: "노을빛 오렌지와 금빛이 섞인 고급 색감", previewText: "GOLD", gradient: "linear-gradient(135deg, #fde68a 0%, #f59e0b 45%, #f97316 100%)", shadow: "0 4px 14px rgba(249,115,22,0.35)" },
  { id: "mintAurora", name: "민트 오로라", price: 170000000, description: "민트와 하늘빛이 섞인 오로라 감성", previewText: "AURORA", gradient: "linear-gradient(135deg, #99f6e4 0%, #67e8f9 50%, #60a5fa 100%)", shadow: "0 4px 14px rgba(103,232,249,0.35)" },
  { id: "violetDream", name: "바이올렛 드림", price: 200000000, description: "보라빛 글로우와 몽환적인 느낌", previewText: "DREAM", gradient: "linear-gradient(135deg, #ddd6fe 0%, #c084fc 45%, #7c3aed 100%)", shadow: "0 4px 16px rgba(124,58,237,0.42)" },
  { id: "emeraldPulse", name: "에메랄드 펄스", price: 240000000, description: "진한 에메랄드 광채가 도는 희귀 효과", previewText: "PULSE", color: "#34d399", shadow: "0 0 10px rgba(52,211,153,0.8), 0 0 22px rgba(16,185,129,0.45)", letterSpacing: "0.05em" },
  { id: "roseScript", name: "로즈 스크립트", price: 290000000, description: "우아한 핑크 계열 필기체 느낌의 닉네임", previewText: "Rose", gradient: "linear-gradient(135deg, #fecdd3 0%, #fb7185 55%, #be185d 100%)", fontStyle: "italic", shadow: "0 4px 14px rgba(190,24,93,0.35)" },
  { id: "rainbowShine", name: "무지개 샤인", price: 360000000, description: "화려한 무지개 그라데이션이 흐르는 효과", previewText: "RAINBOW", gradient: "linear-gradient(90deg, #ef4444 0%, #f59e0b 18%, #facc15 36%, #22c55e 54%, #3b82f6 72%, #8b5cf6 90%, #ec4899 100%)", shadow: "0 4px 16px rgba(59,130,246,0.3)" },
  { id: "galaxyCore", name: "갤럭시 코어", price: 460000000, description: "밤하늘 같은 어두운 배경에 별빛이 반짝이는 느낌", previewText: "GALAXY", gradient: "linear-gradient(135deg, #ffffff 0%, #c4b5fd 18%, #60a5fa 48%, #0f172a 100%)", shadow: "0 0 16px rgba(96,165,250,0.45), 0 0 30px rgba(196,181,253,0.28)", letterSpacing: "0.08em", textTransform: "uppercase" },
  { id: "royalPrism", name: "로열 프리즘", price: 650000000, description: "가장 화려한 프리즘 골드 + 레인보우 조합", previewText: "PRISM", gradient: "linear-gradient(120deg, #fff7ae 0%, #ffffff 14%, #f472b6 30%, #60a5fa 52%, #86efac 72%, #facc15 100%)", shadow: "0 0 16px rgba(250,204,21,0.55), 0 0 28px rgba(244,114,182,0.32)", letterSpacing: "0.12em", textTransform: "uppercase" },
];

const defaultNicknameTag: NicknameTagItem = {
  id: "default",
  name: "기본 이름표",
  price: 0,
  description: "기본 닉네임 이름표입니다.",
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  borderColor: "#111827",
  accentColor: "#111827",
  shape: "pill",
};

const luxuryNicknameTags: NicknameTagItem[] = [
  { id: "crystalTag", name: "크리스탈 태그", price: 100000000, description: "맑고 투명한 크리스탈 느낌의 이름표", background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(219,234,254,0.95) 100%)", borderColor: "#60a5fa", accentColor: "#1d4ed8", shape: "pill" },
  { id: "roseRibbon", name: "로즈 리본", price: 125000000, description: "분홍 리본 장식이 달린 사랑스러운 이름표", background: "linear-gradient(135deg, #ffe4e6 0%, #fbcfe8 100%)", borderColor: "#ec4899", accentColor: "#9d174d", shape: "ribbon" },
  { id: "arcadePanel", name: "아케이드 패널", price: 150000000, description: "게임 센터 감성의 전광판형 이름표", background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)", borderColor: "#22d3ee", accentColor: "#ecfeff", shape: "panel" },
  { id: "royalSeal", name: "로열 씰", price: 185000000, description: "왕실 휘장 느낌의 고급 이름표", background: "linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%)", borderColor: "#92400e", accentColor: "#78350f", shape: "ticket" },
  { id: "forestPassport", name: "포레스트 패스", price: 230000000, description: "숲의 요정 느낌이 나는 자연 테마 이름표", background: "linear-gradient(135deg, #dcfce7 0%, #86efac 100%)", borderColor: "#16a34a", accentColor: "#166534", shape: "ticket" },
  { id: "sunsetTicket", name: "선셋 티켓", price: 280000000, description: "노을빛 콘서트 티켓을 닮은 이름표", background: "linear-gradient(135deg, #ffedd5 0%, #fdba74 50%, #fb7185 100%)", borderColor: "#ea580c", accentColor: "#7c2d12", shape: "ticket" },
  { id: "nightClubTag", name: "나이트 클럽 태그", price: 340000000, description: "보랏빛 조명 아래 빛나는 럭셔리 태그", background: "linear-gradient(135deg, #312e81 0%, #7c3aed 100%)", borderColor: "#ddd6fe", accentColor: "#ffffff", shape: "pill" },
  { id: "starlightBadge", name: "스타라이트 배지", price: 420000000, description: "별 조각이 박힌 듯한 배지 스타일 이름표", background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 52%, #c084fc 100%)", borderColor: "#f8fafc", accentColor: "#ffffff", shape: "panel" },
  { id: "hologramPass", name: "홀로그램 패스", price: 520000000, description: "빛에 따라 색이 달라지는 홀로그램 이름표", background: "linear-gradient(120deg, #cffafe 0%, #e9d5ff 30%, #fbcfe8 60%, #fef3c7 100%)", borderColor: "#6366f1", accentColor: "#312e81", shape: "ribbon" },
  { id: "celestialFrame", name: "천상 프레임", price: 700000000, description: "가장 고급스러운 금장 프레임 이름표", background: "linear-gradient(135deg, #fff7ed 0%, #fef3c7 48%, #fde68a 100%)", borderColor: "#d97706", accentColor: "#78350f", shape: "ribbon" },
];

const defaultMainBackground: MainBackgroundOption = {
  id: "default",
  name: "기본 메인 방",
  price: 0,
  description: "기본 메인 화면 배경입니다.",
  palette: ["#ffffff", "#f8fafc", "#cbd5e1"],
  accent: "#60a5fa",
  sceneKey: "default",
  anchorX: 1080,
  anchorY: 455,
  anchorScale: 1,
};

const luxuryMainBackgrounds: MainBackgroundOption[] = [
  { id: "moldRoom", name: "반지하 생활관", price: 100000000, description: "지저분하지만 생동감 있는 생활형 메인 배경", palette: ["#f7f4e8", "#d6c9a8", "#8b7355"], accent: "#94a3b8", sceneKey: "moldRoom", anchorX: 1120, anchorY: 470, anchorScale: 0.98 },
  { id: "controlLab", name: "통제실 연구소", price: 140000000, description: "밝은 빛과 모니터가 가득한 미래형 연구실", palette: ["#eff6ff", "#dbeafe", "#bfdbfe"], accent: "#93c5fd", sceneKey: "controlLab", anchorX: 1125, anchorY: 480, anchorScale: 1.02 },
  { id: "pastelStudio", name: "파스텔 스튜디오", price: 180000000, description: "아늑하고 따뜻한 파스텔 톤 개인 스튜디오", palette: ["#fff7ed", "#ffe4e6", "#fde68a"], accent: "#fb7185", sceneKey: "pastelStudio", anchorX: 1090, anchorY: 475, anchorScale: 1 },
  { id: "cyberArcade", name: "사이버 아케이드", price: 220000000, description: "네온 조명이 흐르는 전자오락실 분위기", palette: ["#0f172a", "#1e293b", "#312e81"], accent: "#22d3ee", sceneKey: "cyberArcade", anchorX: 1110, anchorY: 470, anchorScale: 1.03 },
  { id: "moonPenthouse", name: "문라이트 펜트하우스", price: 270000000, description: "야경이 보이는 세련된 펜트하우스", palette: ["#0f172a", "#1e3a8a", "#1d4ed8"], accent: "#93c5fd", sceneKey: "moonPenthouse", anchorX: 1105, anchorY: 472, anchorScale: 1 },
  { id: "royalHall", name: "로열 홀", price: 330000000, description: "화려한 샹들리에가 있는 왕실 홀", palette: ["#fff7ed", "#fef3c7", "#f59e0b"], accent: "#f59e0b", sceneKey: "royalHall", anchorX: 1095, anchorY: 472, anchorScale: 1.01 },
  { id: "forestCabin", name: "포레스트 캐빈", price: 410000000, description: "자연광이 드는 숲속 오두막 휴식 공간", palette: ["#ecfccb", "#bbf7d0", "#65a30d"], accent: "#22c55e", sceneKey: "forestCabin", anchorX: 1100, anchorY: 478, anchorScale: 1 },
  { id: "seasideLounge", name: "시사이드 라운지", price: 510000000, description: "바다가 보이는 고급 휴양지 라운지", palette: ["#ecfeff", "#a5f3fc", "#38bdf8"], accent: "#06b6d4", sceneKey: "seasideLounge", anchorX: 1088, anchorY: 474, anchorScale: 1 },
  { id: "skyGarden", name: "스카이 가든", price: 650000000, description: "구름 위 정원처럼 몽환적인 풍경", palette: ["#f0f9ff", "#dbeafe", "#c4b5fd"], accent: "#8b5cf6", sceneKey: "skyGarden", anchorX: 1098, anchorY: 470, anchorScale: 1.02 },
  { id: "orbitalBridge", name: "오비탈 브릿지", price: 850000000, description: "우주 정거장 느낌의 최고급 메인 브릿지", palette: ["#020617", "#0f172a", "#1d4ed8"], accent: "#a78bfa", sceneKey: "orbitalBridge", anchorX: 1116, anchorY: 468, anchorScale: 1.04 },
];

const defaultMainCharacter: MainCharacterOption = {
  id: "default",
  name: "기본 캐릭터",
  price: 0,
  description: "기본 메인 캐릭터입니다.",
  primaryColor: "#ffffff",
  secondaryColor: "#e2e8f0",
  highlightColor: "#60a5fa",
  spriteKey: "default",
};

const luxuryMainCharacters: MainCharacterOption[] = [
  { id: "catScholar", name: "호박 고양이", price: 100000000, description: "모자를 눌러쓴 귀여운 호박빛 고양이", primaryColor: "#fdba74", secondaryColor: "#fed7aa", highlightColor: "#f43f5e", spriteKey: "catScholar" },
  { id: "miniPrincess", name: "꼬마 프린세스", price: 130000000, description: "왕관과 드레스를 입은 초소형 프린세스", primaryColor: "#facc15", secondaryColor: "#fde68a", highlightColor: "#0ea5e9", spriteKey: "miniPrincess" },
  { id: "bunnyHacker", name: "버니 해커", price: 165000000, description: "헤드셋과 토끼 장식이 있는 sleepy 스타일", primaryColor: "#f9a8d4", secondaryColor: "#fef3c7", highlightColor: "#94a3b8", spriteKey: "bunnyHacker" },
  { id: "crimsonKnight", name: "크림슨 나이트", price: 210000000, description: "방패와 붉은 검을 든 기사 캐릭터", primaryColor: "#d1d5db", secondaryColor: "#fca5a5", highlightColor: "#dc2626", spriteKey: "crimsonKnight" },
  { id: "idolSinger", name: "아이돌 싱어", price: 270000000, description: "스포트라이트를 받는 무대형 캐릭터", primaryColor: "#c4b5fd", secondaryColor: "#f9a8d4", highlightColor: "#facc15", spriteKey: "idolSinger" },
  { id: "baristaDreamer", name: "바리스타 드리머", price: 340000000, description: "커피 향이 어울리는 따뜻한 감성 캐릭터", primaryColor: "#d6b38c", secondaryColor: "#f5e1c8", highlightColor: "#22c55e", spriteKey: "baristaDreamer" },
  { id: "hoodieTrader", name: "후드 트레이더", price: 430000000, description: "차트 홀로그램을 다루는 투자자 캐릭터", primaryColor: "#475569", secondaryColor: "#cbd5e1", highlightColor: "#22d3ee", spriteKey: "hoodieTrader" },
  { id: "fairyMechanic", name: "페어리 메카닉", price: 530000000, description: "작은 날개와 공구를 든 수리공 요정", primaryColor: "#86efac", secondaryColor: "#d9f99d", highlightColor: "#34d399", spriteKey: "fairyMechanic" },
  { id: "guardianRobo", name: "가디언 로보", price: 660000000, description: "도시를 지키는 수호 로봇형 캐릭터", primaryColor: "#93c5fd", secondaryColor: "#e2e8f0", highlightColor: "#f59e0b", spriteKey: "guardianRobo" },
  { id: "dragonMage", name: "드래곤 메이지", price: 900000000, description: "작은 드래곤 오라를 두른 최고급 마도사", primaryColor: "#8b5cf6", secondaryColor: "#c4b5fd", highlightColor: "#fb7185", spriteKey: "dragonMage" },
];

const occupationInfo: Record<OccupationId, Occupation> = {
  unemployed: {
    id: "unemployed",
    buildingId: "company",
    name: "백수",
    icon: "🧍",
    grade: "기본",
    description: "아직 정식 직업이 없습니다. 알바와 투자로 조건을 달성해보세요.",
    conditionText: "기본 상태",
    salaryText: "고정 수입 없음",
    incomeEvery3Min: 0,
    requiredCash: 0,
    minigameName: "없음",
    minigameDifficulty: 0,
  },
  officeIntern: {
    id: "officeIntern",
    buildingId: "company",
    name: "인턴",
    icon: "📎",
    grade: "회사 1단계",
    description: "회사 생활을 배우는 첫 단계입니다. 기본 보고와 업무 정리를 처리합니다.",
    conditionText: "현금 30,000원 이상 + 입사 테스트 클리어",
    salaryText: "3분마다 1,500원",
    incomeEvery3Min: 1500,
    requiredCash: 30000,
    minigameName: "입사 테스트",
    minigameDifficulty: 1,
  },
  officeStaff: {
    id: "officeStaff",
    buildingId: "company",
    name: "일반 회사원",
    icon: "💼",
    grade: "회사 2단계",
    description: "정식 회사원입니다. 회사 업무 미니게임을 통해 안정적인 급여를 얻습니다.",
    conditionText: "인턴 보유 + 현금 80,000원 이상 + 문서 정리 테스트 클리어",
    salaryText: "3분마다 3,500원",
    incomeEvery3Min: 3500,
    requiredCash: 80000,
    requiredPrevious: "officeIntern",
    minigameName: "문서 정리",
    minigameDifficulty: 2,
  },
  officeManager: {
    id: "officeManager",
    buildingId: "company",
    name: "과장",
    icon: "📊",
    grade: "회사 3단계",
    description: "회의와 업무 배분을 담당하는 중간 관리자입니다.",
    conditionText: "일반 회사원 보유 + 현금 300,000원 이상 + 회의 발표 테스트 클리어",
    salaryText: "3분마다 10,000원",
    incomeEvery3Min: 10000,
    requiredCash: 300000,
    requiredPrevious: "officeStaff",
    minigameName: "회의 발표",
    minigameDifficulty: 3,
  },
  officeDirector: {
    id: "officeDirector",
    buildingId: "company",
    name: "부장",
    icon: "🗂️",
    grade: "회사 4단계",
    description: "팀 목표와 인력을 관리하는 고급 관리자입니다. 편의점 계산 알바의 빠른 입력 경험이 도움이 됩니다.",
    conditionText: "과장 보유 + 현금 900,000원 이상 + 편의점 계산 성공 35회 + 임원 보고 테스트 클리어",
    salaryText: "3분마다 18,000원",
    incomeEvery3Min: 18000,
    requiredCash: 900000,
    requiredPrevious: "officeManager",
    requiredSuccess: { cashier: 35 },
    minigameName: "임원 보고",
    minigameDifficulty: 4,
  },
  salesAssociate: {
    id: "salesAssociate",
    buildingId: "company",
    name: "영업 사원",
    icon: "🤝",
    grade: "회사 영업직",
    description: "고객 응대와 계약 관리를 담당합니다. 보안요원 알바의 판단 경험과 연결됩니다.",
    conditionText: "현금 120,000원 이상 + 보안 대응 성공 12회 + 고객 상담 테스트 클리어",
    salaryText: "3분마다 4,500원",
    incomeEvery3Min: 4500,
    requiredCash: 120000,
    requiredPrevious: "officeStaff",
    requiredSuccess: { security: 12 },
    minigameName: "고객 상담",
    minigameDifficulty: 2,
  },
  marketingPlanner: {
    id: "marketingPlanner",
    buildingId: "company",
    name: "마케팅 기획자",
    icon: "📣",
    grade: "회사 기획직",
    description: "광고 문구와 캠페인 일정을 빠르게 정리합니다. 카페 알바의 서비스 경험과 연결됩니다.",
    conditionText: "현금 180,000원 이상 + 카페 제조 성공 15회 + 캠페인 기획 테스트 클리어",
    salaryText: "3분마다 6,000원",
    incomeEvery3Min: 6000,
    requiredCash: 180000,
    requiredPrevious: "officeStaff",
    requiredSuccess: { cafe: 15 },
    minigameName: "캠페인 기획",
    minigameDifficulty: 3,
  },
  convenienceManager: {
    id: "convenienceManager",
    buildingId: "company",
    name: "편의점 점장",
    icon: "🏪",
    grade: "유통 관리직",
    description: "편의점 계산 알바 경험을 살려 매장 운영과 재고를 관리합니다.",
    conditionText: "현금 220,000원 이상 + 편의점 계산 성공 30회 + 매장 운영 테스트 클리어",
    salaryText: "3분마다 7,500원",
    incomeEvery3Min: 7500,
    requiredCash: 220000,
    requiredPrevious: "officeStaff",
    requiredSuccess: { cashier: 30 },
    minigameName: "매장 운영",
    minigameDifficulty: 3,
  },
  cafeManager: {
    id: "cafeManager",
    buildingId: "company",
    name: "카페 매니저",
    icon: "☕",
    grade: "외식 관리직",
    description: "카페 음료 알바 경험을 바탕으로 제조 품질과 직원 스케줄을 관리합니다.",
    conditionText: "현금 180,000원 이상 + 카페 제조 성공 25회 + 매장 스케줄 테스트 클리어",
    salaryText: "3분마다 8,000원",
    incomeEvery3Min: 8000,
    requiredCash: 180000,
    requiredPrevious: "officeStaff",
    requiredSuccess: { cafe: 25 },
    minigameName: "매장 스케줄",
    minigameDifficulty: 3,
  },
  securityCaptain: {
    id: "securityCaptain",
    buildingId: "company",
    name: "보안 팀장",
    icon: "🛡️",
    grade: "안전 관리직",
    description: "보안요원 알바 경험을 살려 출입 통제와 팀 배치를 담당합니다.",
    conditionText: "현금 250,000원 이상 + 보안 대응 성공 30회 + 출입 통제 테스트 클리어",
    salaryText: "3분마다 9,500원",
    incomeEvery3Min: 9500,
    requiredCash: 250000,
    requiredPrevious: "officeStaff",
    requiredSuccess: { security: 30 },
    minigameName: "출입 통제",
    minigameDifficulty: 3,
  },
  franchiseOwner: {
    id: "franchiseOwner",
    buildingId: "company",
    name: "프랜차이즈 지점장",
    icon: "🏬",
    grade: "복합 매장 관리자",
    description: "편의점과 카페 운영 경험을 합쳐 여러 매장을 책임지는 직업입니다.",
    conditionText: "편의점 점장 또는 카페 매니저 보유 + 현금 900,000원 이상 + 편의점 성공 50회 + 카페 성공 40회 + 지점 관리 테스트 클리어",
    salaryText: "3분마다 24,000원",
    incomeEvery3Min: 24000,
    requiredCash: 900000,
    requiredPrevious: "convenienceManager",
    requiredSuccess: { cashier: 50, cafe: 40 },
    minigameName: "지점 관리",
    minigameDifficulty: 4,
  },
  trainee: {
    id: "trainee",
    buildingId: "entertainment",
    name: "연습생",
    icon: "🎧",
    grade: "연예 1단계",
    description: "데뷔를 위해 리듬과 무대 감각을 연습합니다.",
    conditionText: "현금 50,000원 이상 + 리듬 연습 테스트 클리어",
    salaryText: "3분마다 1,200원",
    incomeEvery3Min: 1200,
    requiredCash: 50000,
    minigameName: "리듬 연습",
    minigameDifficulty: 1,
  },
  rookieSinger: {
    id: "rookieSinger",
    buildingId: "entertainment",
    name: "신인 가수",
    icon: "🎤",
    grade: "연예 2단계",
    description: "작은 무대와 행사를 뛰며 인지도를 쌓습니다. 카페 알바 경험이 팬 응대에 도움을 줍니다.",
    conditionText: "연습생 보유 + 현금 150,000원 이상 + 카페 제조 성공 10회 + 무대 공연 테스트 클리어",
    salaryText: "3분마다 7,000원",
    incomeEvery3Min: 7000,
    requiredCash: 150000,
    requiredPrevious: "trainee",
    requiredSuccess: { cafe: 10 },
    minigameName: "무대 공연",
    minigameDifficulty: 2,
  },
  topSinger: {
    id: "topSinger",
    buildingId: "entertainment",
    name: "톱스타",
    icon: "🌟",
    grade: "연예 3단계",
    description: "공연과 광고로 큰 수입을 얻는 스타입니다.",
    conditionText: "신인 가수 보유 + 현금 800,000원 이상 + 콘서트 관리 테스트 클리어",
    salaryText: "3분마다 35,000원",
    incomeEvery3Min: 35000,
    requiredCash: 800000,
    requiredPrevious: "rookieSinger",
    minigameName: "콘서트 관리",
    minigameDifficulty: 4,
  },
  mythicMuse: {
    id: "mythicMuse",
    buildingId: "entertainment",
    name: "신화의 뮤즈",
    icon: "🪽",
    grade: "극희귀 히든 연예직",
    description: "대중문화의 흐름을 바꾸는 전설급 히든 엔터 직업입니다.",
    conditionText: "히든 조건: 완벽한 월드 투어 수행 + 톱스타/프로듀서 루트 + 순자산 4,500,000원 이상",
    salaryText: "3분마다 78,000원",
    incomeEvery3Min: 78000,
    requiredCash: 3000000,
    requiredPrevious: "legendaryIdol",
    requiredSuccess: { cafe: 120, security: 90 },
    minigameName: "신화의 무대",
    minigameDifficulty: 6,
    hidden: true,
    questNpc: "프로듀서 루나",
  },
  logisticsStaff: {
    id: "logisticsStaff",
    buildingId: "logistics",
    name: "물류 정직원",
    icon: "🚚",
    grade: "물류 1단계",
    description: "택배 분류와 배달 알바 경험을 바탕으로 물류 흐름을 안정적으로 처리합니다.",
    conditionText: "현금 70,000원 이상 + 택배 분류 성공 15회 + 배달 성공 10회 + 물류 테스트 클리어",
    salaryText: "3분마다 4,000원",
    incomeEvery3Min: 4000,
    requiredCash: 70000,
    requiredSuccess: { sorting: 15, delivery: 10 },
    minigameName: "물류 분류 테스트",
    minigameDifficulty: 2,
  },
  logisticsManager: {
    id: "logisticsManager",
    buildingId: "logistics",
    name: "물류 관리자",
    icon: "📦",
    grade: "물류 2단계",
    description: "여러 배송 라인을 관리하고 사고를 줄입니다.",
    conditionText: "물류 정직원 보유 + 현금 300,000원 이상 + 택배 성공 30회 + 배달 성공 25회 + 배송 라인 관리 테스트 클리어",
    salaryText: "3분마다 12,000원",
    incomeEvery3Min: 12000,
    requiredCash: 300000,
    requiredPrevious: "logisticsStaff",
    requiredSuccess: { sorting: 30, delivery: 25 },
    minigameName: "배송 라인 관리",
    minigameDifficulty: 3,
  },
  dispatchController: {
    id: "dispatchController",
    buildingId: "logistics",
    name: "배차 관제사",
    icon: "🧭",
    grade: "물류 관제직",
    description: "배달 알바 경험을 살려 차량 배차와 도착 시간을 관리합니다.",
    conditionText: "현금 350,000원 이상 + 배달 성공 35회 + 택배 분류 성공 20회 + 배차 관제 테스트 클리어",
    salaryText: "3분마다 13,000원",
    incomeEvery3Min: 13000,
    requiredCash: 350000,
    requiredSuccess: { delivery: 35, sorting: 20 },
    minigameName: "배차 관제",
    minigameDifficulty: 3,
  },
  platformOpsManager: {
    id: "platformOpsManager",
    buildingId: "logistics",
    name: "배달 플랫폼 매니저",
    icon: "🛵",
    grade: "플랫폼 운영직",
    description: "배달 데이터를 보고 라이더 동선과 주문 흐름을 최적화합니다.",
    conditionText: "배차 관제사 보유 + 현금 650,000원 이상 + 배달 성공 60회 + 플랫폼 운영 테스트 클리어",
    salaryText: "3분마다 20,000원",
    incomeEvery3Min: 20000,
    requiredCash: 650000,
    requiredPrevious: "dispatchController",
    requiredSuccess: { delivery: 60 },
    minigameName: "플랫폼 운영",
    minigameDifficulty: 4,
  },
  phantomCourier: {
    id: "phantomCourier",
    buildingId: "logistics",
    name: "팬텀 쿠리어",
    icon: "👻",
    grade: "극희귀 히든 물류직",
    description: "지도에 남지 않는 특수 배송을 처리하는 극희귀 히든 직업입니다.",
    conditionText: "히든 조건: 완벽한 물류 수행 + 드론/공급망 조건 + 배달 성공 180회",
    salaryText: "3분마다 72,000원",
    incomeEvery3Min: 72000,
    requiredCash: 2500000,
    requiredPrevious: "supplyChainDirector",
    requiredSuccess: { delivery: 180, sorting: 140 },
    minigameName: "무음 배송",
    minigameDifficulty: 6,
    hidden: true,
    questNpc: "관제장 박 반장",
  },
  investor: {
    id: "investor",
    buildingId: "finance",
    name: "투자자",
    icon: "📈",
    grade: "금융 1단계",
    description: "자산과 투자 판단력을 바탕으로 수익을 만드는 직업입니다.",
    conditionText: "현금 100,000원 이상 + 투자 판단 테스트 클리어",
    salaryText: "3분마다 5,000원",
    incomeEvery3Min: 5000,
    requiredCash: 100000,
    minigameName: "투자 판단 테스트",
    minigameDifficulty: 2,
    questNpc: "차트 분석가 민",
  },
  salesManager: {
    id: "salesManager",
    buildingId: "company",
    name: "영업 팀장",
    icon: "📞",
    grade: "회사 영업 2단계",
    description: "고객 파이프라인과 계약 흐름을 관리하는 영업 루트 상위 직업입니다.",
    conditionText: "영업 사원 보유 + 현금 450,000원 이상 + 보안 대응 성공 35회 + 계약 전략 테스트 클리어",
    salaryText: "3분마다 14,000원",
    incomeEvery3Min: 14000,
    requiredCash: 450000,
    requiredPrevious: "salesAssociate",
    requiredSuccess: { security: 35 },
    minigameName: "계약 전략",
    minigameDifficulty: 4,
  },
  hrSpecialist: {
    id: "hrSpecialist",
    buildingId: "company",
    name: "인사 담당자",
    icon: "🧑‍🤝‍🧑",
    grade: "회사 인사직",
    description: "채용과 평가, 직원 배치를 담당하는 인사 루트 직업입니다.",
    conditionText: "일반 회사원 보유 + 현금 160,000원 이상 + 보안 대응 성공 10회 + 면접 평가 테스트 클리어",
    salaryText: "3분마다 5,800원",
    incomeEvery3Min: 5800,
    requiredCash: 160000,
    requiredPrevious: "officeStaff",
    requiredSuccess: { security: 10 },
    minigameName: "면접 평가",
    minigameDifficulty: 3,
  },
  peopleChief: {
    id: "peopleChief",
    buildingId: "company",
    name: "인사 총괄",
    icon: "🧠",
    grade: "회사 인사 2단계",
    description: "조직문화와 성과 보상 체계를 설계하는 인사 루트 상위 직업입니다.",
    conditionText: "인사 담당자 보유 + 현금 700,000원 이상 + 카페 성공 35회 + 조직 설계 테스트 클리어",
    salaryText: "3분마다 19,000원",
    incomeEvery3Min: 19000,
    requiredCash: 700000,
    requiredPrevious: "hrSpecialist",
    requiredSuccess: { cafe: 35 },
    minigameName: "조직 설계",
    minigameDifficulty: 4,
  },
  brandDirector: {
    id: "brandDirector",
    buildingId: "company",
    name: "브랜드 디렉터",
    icon: "🎨",
    grade: "회사 기획 2단계",
    description: "광고와 브랜드 전략을 총괄하는 기획 루트 상위 직업입니다.",
    conditionText: "마케팅 기획자 보유 + 현금 650,000원 이상 + 카페 성공 45회 + 브랜드 전략 테스트 클리어",
    salaryText: "3분마다 20,000원",
    incomeEvery3Min: 20000,
    requiredCash: 650000,
    requiredPrevious: "marketingPlanner",
    requiredSuccess: { cafe: 45 },
    minigameName: "브랜드 전략",
    minigameDifficulty: 4,
  },
  planningCoordinator: {
    id: "planningCoordinator",
    buildingId: "company",
    name: "기획 조정자",
    icon: "🧩",
    grade: "회사 조정직",
    description: "여러 부서의 일정과 목표를 연결하는 기획 조정 루트 직업입니다.",
    conditionText: "일반 회사원 보유 + 현금 220,000원 이상 + 편의점 성공 20회 + 일정 조율 테스트 클리어",
    salaryText: "3분마다 7,200원",
    incomeEvery3Min: 7200,
    requiredCash: 220000,
    requiredPrevious: "officeStaff",
    requiredSuccess: { cashier: 20 },
    minigameName: "일정 조율",
    minigameDifficulty: 3,
  },
  strategyConsultant: {
    id: "strategyConsultant",
    buildingId: "company",
    name: "전략 컨설턴트",
    icon: "♟️",
    grade: "회사 전략직",
    description: "부서 문제를 분석하고 회사 방향을 제안하는 전략 루트 상위 직업입니다.",
    conditionText: "기획 조정자 보유 + 현금 850,000원 이상 + 편의점 성공 55회 + 전략 제안 테스트 클리어",
    salaryText: "3분마다 25,000원",
    incomeEvery3Min: 25000,
    requiredCash: 850000,
    requiredPrevious: "planningCoordinator",
    requiredSuccess: { cashier: 55 },
    minigameName: "전략 제안",
    minigameDifficulty: 5,
  },
  projectManager: {
    id: "projectManager",
    buildingId: "company",
    name: "프로젝트 매니저",
    icon: "📌",
    grade: "회사 PM직",
    description: "프로젝트 일정과 리스크를 조율하는 관리 루트 직업입니다.",
    conditionText: "과장 보유 + 현금 500,000원 이상 + 편의점 성공 25회 + 프로젝트 관리 테스트 클리어",
    salaryText: "3분마다 16,000원",
    incomeEvery3Min: 16000,
    requiredCash: 500000,
    requiredPrevious: "officeManager",
    requiredSuccess: { cashier: 25 },
    minigameName: "프로젝트 관리",
    minigameDifficulty: 4,
  },
  operationsDirector: {
    id: "operationsDirector",
    buildingId: "company",
    name: "운영 이사",
    icon: "🏛️",
    grade: "회사 운영 임원",
    description: "프로젝트와 부서 운영을 모두 총괄하는 운영 임원 직업입니다.",
    conditionText: "프로젝트 매니저 보유 + 현금 1,200,000원 이상 + 편의점 성공 70회 + 운영 총괄 테스트 클리어",
    salaryText: "3분마다 32,000원",
    incomeEvery3Min: 32000,
    requiredCash: 1200000,
    requiredPrevious: "projectManager",
    requiredSuccess: { cashier: 70 },
    minigameName: "운영 총괄",
    minigameDifficulty: 5,
  },
  chiefExecutive: {
    id: "chiefExecutive",
    buildingId: "company",
    name: "히든 CEO",
    icon: "👔",
    grade: "히든 회사직",
    description: "회사의 여러 흐름을 한 번에 읽고 사업을 지휘하는 히든 직업입니다.",
    conditionText: "히든 조건: 과장 이상 계열 직업 + 순자산 2,000,000원 이상 + 편의점/보안/카페 경험",
    salaryText: "3분마다 45,000원",
    incomeEvery3Min: 45000,
    requiredCash: 1500000,
    requiredSuccess: { cashier: 65, security: 45, cafe: 45 },
    minigameName: "경영 승계 히든 퀘스트",
    minigameDifficulty: 5,
    hidden: true,
    questNpc: "전직 멘토 한 실장",
  },
  shadowExecutive: {
    id: "shadowExecutive",
    buildingId: "company",
    name: "그림자 임원",
    icon: "🕶️",
    grade: "극희귀 히든 회사직",
    description: "공식 직책 없이 회사를 움직이는 극희귀 히든 직업입니다.",
    conditionText: "히든 조건: 완벽한 회사 퀘스트 수행 + 운영/전략 계열 조건 + 순자산 5,000,000원 이상",
    salaryText: "3분마다 75,000원",
    incomeEvery3Min: 75000,
    requiredCash: 3000000,
    requiredPrevious: "operationsDirector",
    requiredSuccess: { cashier: 100, security: 80 },
    minigameName: "비밀 이사회",
    minigameDifficulty: 6,
    hidden: true,
    questNpc: "전직 멘토 한 실장",
  },
  choreographer: {
    id: "choreographer",
    buildingId: "entertainment",
    name: "안무가",
    icon: "💃",
    grade: "연예 안무직",
    description: "무대 동선과 안무를 만드는 창작형 엔터 루트입니다.",
    conditionText: "연습생 보유 + 현금 180,000원 이상 + 카페 성공 15회 + 안무 구성 테스트 클리어",
    salaryText: "3분마다 8,500원",
    incomeEvery3Min: 8500,
    requiredCash: 180000,
    requiredPrevious: "trainee",
    requiredSuccess: { cafe: 15 },
    minigameName: "안무 구성",
    minigameDifficulty: 3,
  },
  streamer: {
    id: "streamer",
    buildingId: "entertainment",
    name: "스트리머",
    icon: "📹",
    grade: "연예 방송직",
    description: "개인 방송과 팬 소통으로 성장하는 자유형 엔터 루트입니다.",
    conditionText: "연습생 보유 + 현금 160,000원 이상 + 편의점 성공 15회 + 방송 진행 테스트 클리어",
    salaryText: "3분마다 8,000원",
    incomeEvery3Min: 8000,
    requiredCash: 160000,
    requiredPrevious: "trainee",
    requiredSuccess: { cashier: 15 },
    minigameName: "방송 진행",
    minigameDifficulty: 3,
  },
  actor: {
    id: "actor",
    buildingId: "entertainment",
    name: "배우",
    icon: "🎭",
    grade: "연예 연기직",
    description: "대사와 감정선을 익혀 작품에 출연하는 연기 루트입니다.",
    conditionText: "연습생 보유 + 현금 200,000원 이상 + 보안 성공 15회 + 대본 리딩 테스트 클리어",
    salaryText: "3분마다 9,500원",
    incomeEvery3Min: 9500,
    requiredCash: 200000,
    requiredPrevious: "trainee",
    requiredSuccess: { security: 15 },
    minigameName: "대본 리딩",
    minigameDifficulty: 3,
  },
  musicProducer: {
    id: "musicProducer",
    buildingId: "entertainment",
    name: "음악 프로듀서",
    icon: "🎛️",
    grade: "연예 제작직",
    description: "곡 제작과 무대 연출을 맡는 제작 루트 상위 직업입니다.",
    conditionText: "안무가 또는 신인 가수 보유 + 현금 700,000원 이상 + 카페 성공 55회 + 편곡 테스트 클리어",
    salaryText: "3분마다 24,000원",
    incomeEvery3Min: 24000,
    requiredCash: 700000,
    requiredPrevious: "choreographer",
    requiredSuccess: { cafe: 55 },
    minigameName: "편곡",
    minigameDifficulty: 4,
  },
  idolManager: {
    id: "idolManager",
    buildingId: "entertainment",
    name: "아이돌 매니저",
    icon: "🗓️",
    grade: "연예 관리직",
    description: "아티스트 스케줄과 팬 이벤트를 조율하는 관리 루트입니다.",
    conditionText: "스트리머 또는 배우 보유 + 현금 650,000원 이상 + 보안 성공 50회 + 스케줄 관리 테스트 클리어",
    salaryText: "3분마다 22,000원",
    incomeEvery3Min: 22000,
    requiredCash: 650000,
    requiredPrevious: "streamer",
    requiredSuccess: { security: 50 },
    minigameName: "스케줄 관리",
    minigameDifficulty: 4,
  },
  legendaryIdol: {
    id: "legendaryIdol",
    buildingId: "entertainment",
    name: "전설의 아이돌",
    icon: "💫",
    grade: "히든 연예직",
    description: "톱스타 이후 팬 응대와 무대 감각을 모두 증명해야 열리는 히든 직업입니다.",
    conditionText: "히든 조건: 톱스타 보유 + 카페 성공 80회 + 보안 성공 50회 + 순자산 1,500,000원 이상",
    salaryText: "3분마다 48,000원",
    incomeEvery3Min: 48000,
    requiredCash: 1500000,
    requiredPrevious: "topSinger",
    requiredSuccess: { cafe: 80, security: 50 },
    minigameName: "월드 투어 히든 퀘스트",
    minigameDifficulty: 5,
    hidden: true,
    questNpc: "프로듀서 루나",
  },
  warehousePlanner: {
    id: "warehousePlanner",
    buildingId: "logistics",
    name: "창고 설계사",
    icon: "🏗️",
    grade: "물류 설계직",
    description: "창고 배치와 적재 효율을 설계하는 물류 루트입니다.",
    conditionText: "물류 정직원 보유 + 현금 220,000원 이상 + 택배 성공 45회 + 창고 설계 테스트 클리어",
    salaryText: "3분마다 10,500원",
    incomeEvery3Min: 10500,
    requiredCash: 220000,
    requiredPrevious: "logisticsStaff",
    requiredSuccess: { sorting: 45 },
    minigameName: "창고 설계",
    minigameDifficulty: 3,
  },
  routeOptimizer: {
    id: "routeOptimizer",
    buildingId: "logistics",
    name: "동선 최적화 전문가",
    icon: "🗺️",
    grade: "물류 동선직",
    description: "배송 동선을 최적화하는 분석형 물류 루트입니다.",
    conditionText: "물류 정직원 보유 + 현금 260,000원 이상 + 배달 성공 45회 + 동선 최적화 테스트 클리어",
    salaryText: "3분마다 11,500원",
    incomeEvery3Min: 11500,
    requiredCash: 260000,
    requiredPrevious: "logisticsStaff",
    requiredSuccess: { delivery: 45 },
    minigameName: "동선 최적화",
    minigameDifficulty: 3,
  },
  droneDispatcher: {
    id: "droneDispatcher",
    buildingId: "logistics",
    name: "드론 관제사",
    icon: "🛸",
    grade: "첨단 물류직",
    description: "드론 배송망을 관리하는 첨단 물류 루트입니다.",
    conditionText: "배차 관제사 또는 동선 최적화 전문가 보유 + 현금 900,000원 이상 + 배달 성공 85회 + 드론 관제 테스트 클리어",
    salaryText: "3분마다 27,000원",
    incomeEvery3Min: 27000,
    requiredCash: 900000,
    requiredPrevious: "dispatchController",
    requiredSuccess: { delivery: 85 },
    minigameName: "드론 관제",
    minigameDifficulty: 5,
  },
  portCaptain: {
    id: "portCaptain",
    buildingId: "logistics",
    name: "항만 물류장",
    icon: "⚓",
    grade: "대형 물류직",
    description: "대형 화물과 항만 입출고를 관리하는 물류 루트입니다.",
    conditionText: "창고 설계사 보유 + 현금 950,000원 이상 + 택배 성공 85회 + 항만 적재 테스트 클리어",
    salaryText: "3분마다 28,000원",
    incomeEvery3Min: 28000,
    requiredCash: 950000,
    requiredPrevious: "warehousePlanner",
    requiredSuccess: { sorting: 85 },
    minigameName: "항만 적재",
    minigameDifficulty: 5,
  },
  supplyChainDirector: {
    id: "supplyChainDirector",
    buildingId: "logistics",
    name: "공급망 총괄",
    icon: "🌐",
    grade: "물류 임원직",
    description: "전국 공급망과 배송 리스크를 총괄하는 물류 최상위 루트입니다.",
    conditionText: "플랫폼 매니저 또는 항만 물류장 보유 + 현금 1,700,000원 이상 + 택배/배달 성공 110회 + 공급망 설계 테스트 클리어",
    salaryText: "3분마다 36,000원",
    incomeEvery3Min: 36000,
    requiredCash: 1700000,
    requiredPrevious: "platformOpsManager",
    requiredSuccess: { sorting: 110, delivery: 110 },
    minigameName: "공급망 설계",
    minigameDifficulty: 5,
  },
  logisticsLegend: {
    id: "logisticsLegend",
    buildingId: "logistics",
    name: "물류의 전설",
    icon: "🚀",
    grade: "히든 물류직",
    description: "배송, 분류, 관제를 모두 통달한 유저에게만 열리는 히든 직업입니다.",
    conditionText: "히든 조건: 플랫폼 운영 계열 + 택배 성공 120회 + 배달 성공 120회 + 순자산 1,800,000원 이상",
    salaryText: "3분마다 43,000원",
    incomeEvery3Min: 43000,
    requiredCash: 1200000,
    requiredPrevious: "platformOpsManager",
    requiredSuccess: { sorting: 120, delivery: 120 },
    minigameName: "전국 배송망 히든 퀘스트",
    minigameDifficulty: 5,
    hidden: true,
    questNpc: "관제장 박 반장",
  },
  bankAnalyst: {
    id: "bankAnalyst",
    buildingId: "finance",
    name: "은행 분석가",
    icon: "🏦",
    grade: "금융 은행직",
    description: "예금, 적금, 대출 구조를 분석하는 안정형 금융 루트입니다.",
    conditionText: "투자자 보유 + 예금 300,000원 이상 + 현금 250,000원 이상 + 금융 분석 테스트 클리어",
    salaryText: "3분마다 10,500원",
    incomeEvery3Min: 10500,
    requiredCash: 250000,
    requiredPrevious: "investor",
    minigameName: "금융 분석",
    minigameDifficulty: 3,
  },
  fundManager: {
    id: "fundManager",
    buildingId: "finance",
    name: "펀드 매니저",
    icon: "💹",
    grade: "금융 운용직",
    description: "여러 자산을 분산 운용하는 투자 루트 직업입니다.",
    conditionText: "투자자 보유 + 현금 500,000원 이상 + 주식 평가액 500,000원 이상 + 포트폴리오 테스트 클리어",
    salaryText: "3분마다 18,000원",
    incomeEvery3Min: 18000,
    requiredCash: 500000,
    requiredPrevious: "investor",
    minigameName: "포트폴리오 운용",
    minigameDifficulty: 4,
  },
  riskManager: {
    id: "riskManager",
    buildingId: "finance",
    name: "리스크 매니저",
    icon: "🧯",
    grade: "금융 위험관리직",
    description: "손실 가능성을 줄이는 방어형 금융 루트입니다.",
    conditionText: "투자자 보유 + 현금 450,000원 이상 + 은행 예금 500,000원 이상 + 리스크 평가 테스트 클리어",
    salaryText: "3분마다 17,000원",
    incomeEvery3Min: 17000,
    requiredCash: 450000,
    requiredPrevious: "investor",
    minigameName: "리스크 평가",
    minigameDifficulty: 4,
  },
  ventureCapitalist: {
    id: "ventureCapitalist",
    buildingId: "finance",
    name: "벤처 캐피탈리스트",
    icon: "🚀",
    grade: "금융 성장투자직",
    description: "성장 가능성이 높은 사업과 주식을 발굴하는 공격형 금융 루트입니다.",
    conditionText: "펀드 매니저 보유 + 현금 1,200,000원 이상 + 사업 1개 이상 보유 + 벤처 심사 테스트 클리어",
    salaryText: "3분마다 31,000원",
    incomeEvery3Min: 31000,
    requiredCash: 1200000,
    requiredPrevious: "fundManager",
    minigameName: "벤처 심사",
    minigameDifficulty: 5,
  },
  financialDirector: {
    id: "financialDirector",
    buildingId: "finance",
    name: "재무 이사",
    icon: "📑",
    grade: "금융 임원직",
    description: "회사 자금 조달과 자산 운용을 총괄하는 금융 루트 최상위 직업입니다.",
    conditionText: "리스크 매니저 또는 은행 분석가 보유 + 현금 1,500,000원 이상 + 예금 1,000,000원 이상 + 재무 총괄 테스트 클리어",
    salaryText: "3분마다 34,000원",
    incomeEvery3Min: 34000,
    requiredCash: 1500000,
    requiredPrevious: "riskManager",
    minigameName: "재무 총괄",
    minigameDifficulty: 5,
  },
  quantMaster: {
    id: "quantMaster",
    buildingId: "finance",
    name: "퀀트 마스터",
    icon: "🧮",
    grade: "히든 금융직",
    description: "현금, 예금, 주식 자산을 모두 운용할 줄 아는 투자자에게 열리는 히든 직업입니다.",
    conditionText: "히든 조건: 투자자 보유 + 예금 1,000,000원 이상 + 주식 평가액 1,000,000원 이상",
    salaryText: "3분마다 42,000원",
    incomeEvery3Min: 42000,
    requiredCash: 500000,
    requiredPrevious: "investor",
    minigameName: "알고리즘 투자 히든 퀘스트",
    minigameDifficulty: 5,
    hidden: true,
    questNpc: "퀀트 연구원 서 박사",
  },
  marketOracle: {
    id: "marketOracle",
    buildingId: "finance",
    name: "시장 예언가",
    icon: "🔮",
    grade: "극희귀 히든 금융직",
    description: "시장 흐름을 거의 예언처럼 읽어내는 극희귀 히든 직업입니다.",
    conditionText: "히든 조건: 완벽한 금융 퀘스트 수행 + 퀀트/펀드 조건 + 순자산 6,000,000원 이상",
    salaryText: "3분마다 82,000원",
    incomeEvery3Min: 82000,
    requiredCash: 3500000,
    requiredPrevious: "quantMaster",
    minigameName: "시장 예언",
    minigameDifficulty: 6,
    hidden: true,
    questNpc: "차트 분석가 민",
  },
  blackCardBroker: {
    id: "blackCardBroker",
    buildingId: "finance",
    name: "블랙카드 브로커",
    icon: "🃏",
    grade: "극희귀 히든 금융직",
    description: "초고액 자산가의 비밀 거래를 연결하는 위험한 히든 직업입니다.",
    conditionText: "히든 조건: 완벽한 금융 퀘스트 수행 + 벤처/재무 조건 + 현금 5,000,000원 이상",
    salaryText: "3분마다 88,000원",
    incomeEvery3Min: 88000,
    requiredCash: 5000000,
    requiredPrevious: "ventureCapitalist",
    minigameName: "비밀 거래",
    minigameDifficulty: 6,
    hidden: true,
    questNpc: "차트 분석가 민",
  },
};

const careerQuestBoards: Record<CareerBuildingId, CareerQuest[]> = {
  company: [
    {
      id: "company-intro",
      npc: "전직 멘토 한 실장",
      title: "사무실 첫 출근 퀘스트",
      targetId: "officeIntern",
      story: "한 실장이 기본 업무 태도를 확인합니다. 현금과 간단한 업무 처리 능력을 보여주세요.",
      request: "현금 30,000원 이상을 모은 뒤 입사 테스트를 통과하세요.",
      successText: "서류 정리와 보고 흐름을 익혀 인턴으로 전직합니다.",
      failText: "업무 순서가 꼬이면 퀘스트 실패입니다. 다시 도전하세요.",
    },
    {
      id: "company-staff",
      npc: "전직 멘토 한 실장",
      title: "정규직 승급 퀘스트",
      targetId: "officeStaff",
      story: "인턴 경험을 바탕으로 실제 문서 정리와 회의 준비를 맡습니다.",
      request: "인턴을 획득하고 현금 80,000원 이상을 준비하세요.",
      successText: "문서 정리 테스트를 통과하면 일반 회사원으로 승급합니다.",
      failText: "정확도가 부족하면 정규직 승급이 보류됩니다.",
    },
    {
      id: "company-hr",
      npc: "전직 멘토 한 실장",
      title: "부서 이동: 인사부 퀘스트",
      targetId: "hrSpecialist",
      story: "한 실장이 인사부 전환 기회를 제안합니다. 사람을 보는 눈을 증명하세요.",
      request: "일반 회사원 보유 + 현금 160,000원 이상 + 보안 대응 성공 10회.",
      successText: "인사부로 이동해 인사 담당자가 됩니다.",
      failText: "사람을 잘못 판단하면 부서 이동이 보류됩니다.",
    },
    {
      id: "company-planning",
      npc: "전직 멘토 한 실장",
      title: "부서 이동: 기획 조정부 퀘스트",
      targetId: "planningCoordinator",
      story: "여러 부서 일정을 조율하는 기획 조정부 루트가 열립니다.",
      request: "일반 회사원 보유 + 현금 220,000원 이상 + 편의점 성공 20회.",
      successText: "기획 조정부로 이동해 기획 조정자가 됩니다.",
      failText: "일정 조율이 꼬이면 이동이 보류됩니다.",
    },
    {
      id: "company-manager",
      npc: "전직 멘토 한 실장",
      title: "관리자 승진 퀘스트",
      targetId: "officeManager",
      story: "팀원에게 업무를 배분하고 회의 발표를 처리하는 승진 퀘스트입니다.",
      request: "일반 회사원 보유 + 현금 300,000원 이상.",
      successText: "회의 발표 테스트를 통과하면 과장으로 승진합니다.",
      failText: "보고 타이밍을 놓치면 퀘스트 실패입니다.",
    },
    {
      id: "company-director",
      npc: "전직 멘토 한 실장",
      title: "임원 보고 퀘스트",
      targetId: "officeDirector",
      story: "편의점 계산 경험으로 빠른 판단력을 증명하고 임원 보고를 수행합니다.",
      request: "과장 보유 + 현금 900,000원 이상 + 편의점 계산 성공 35회.",
      successText: "임원 보고를 통과하면 부장이 됩니다.",
      failText: "보고 순서가 틀리면 승진 심사가 실패합니다.",
    },
    {
      id: "company-sales",
      npc: "전직 멘토 한 실장",
      title: "고객 상담 퀘스트",
      targetId: "salesAssociate",
      story: "보안 알바에서 쌓은 판단력으로 고객을 응대합니다.",
      request: "현금 120,000원 이상 + 보안 대응 성공 12회.",
      successText: "상담 테스트를 통과하면 영업 사원이 됩니다.",
      failText: "고객 분류를 틀리면 퀘스트 실패입니다.",
    },
    {
      id: "company-sales-manager",
      npc: "전직 멘토 한 실장",
      title: "영업 팀장 승급 퀘스트",
      targetId: "salesManager",
      story: "영업 사원의 계약 흐름을 팀 단위로 확장하는 퀘스트입니다.",
      request: "영업 사원 보유 + 현금 450,000원 이상 + 보안 성공 35회.",
      successText: "영업 팀장으로 승급합니다.",
      failText: "계약 전략을 놓치면 승급이 보류됩니다.",
    },
    {
      id: "company-marketing",
      npc: "전직 멘토 한 실장",
      title: "캠페인 기획 퀘스트",
      targetId: "marketingPlanner",
      story: "카페 서비스 경험을 광고 문구와 캠페인 일정으로 연결합니다.",
      request: "현금 180,000원 이상 + 카페 제조 성공 15회.",
      successText: "캠페인 테스트를 통과하면 마케팅 기획자가 됩니다.",
      failText: "기획 흐름이 끊기면 퀘스트 실패입니다.",
    },
    {
      id: "company-brand-director",
      npc: "전직 멘토 한 실장",
      title: "브랜드 디렉터 승급 퀘스트",
      targetId: "brandDirector",
      story: "캠페인 기획 경험을 브랜드 전략으로 확장합니다.",
      request: "마케팅 기획자 보유 + 현금 650,000원 이상 + 카페 성공 45회.",
      successText: "브랜드 디렉터가 됩니다.",
      failText: "브랜드 방향이 흔들리면 승급 실패입니다.",
    },
    {
      id: "company-people-chief",
      npc: "전직 멘토 한 실장",
      title: "인사 총괄 승급 퀘스트",
      targetId: "peopleChief",
      story: "인사 담당자 경험을 바탕으로 조직문화를 설계합니다.",
      request: "인사 담당자 보유 + 현금 700,000원 이상 + 카페 성공 35회.",
      successText: "인사 총괄이 됩니다.",
      failText: "조직 설계가 어긋나면 승급 실패입니다.",
    },
    {
      id: "company-strategy-consultant",
      npc: "전직 멘토 한 실장",
      title: "전략 컨설턴트 퀘스트",
      targetId: "strategyConsultant",
      story: "기획 조정 경험을 회사 전체 전략으로 확장합니다.",
      request: "기획 조정자 보유 + 현금 850,000원 이상 + 편의점 성공 55회.",
      successText: "전략 컨설턴트가 됩니다.",
      failText: "전략 제안이 엇나가면 실패입니다.",
    },
    {
      id: "company-project-manager",
      npc: "전직 멘토 한 실장",
      title: "프로젝트 매니저 퀘스트",
      targetId: "projectManager",
      story: "과장 이후 프로젝트 단위의 책임자가 되는 루트입니다.",
      request: "과장 보유 + 현금 500,000원 이상 + 편의점 성공 25회.",
      successText: "프로젝트 매니저가 됩니다.",
      failText: "프로젝트 관리가 꼬이면 실패입니다.",
    },
    {
      id: "company-operations-director",
      npc: "전직 멘토 한 실장",
      title: "운영 이사 퀘스트",
      targetId: "operationsDirector",
      story: "프로젝트 매니저 경험을 회사 운영 총괄로 확장합니다.",
      request: "프로젝트 매니저 보유 + 현금 1,200,000원 이상 + 편의점 성공 70회.",
      successText: "운영 이사가 됩니다.",
      failText: "운영 계획이 무너지면 실패입니다.",
    },
    {
      id: "company-store",
      npc: "전직 멘토 한 실장",
      title: "매장 운영 퀘스트",
      targetId: "franchiseOwner",
      story: "편의점과 카페 운영 경험을 합쳐 지점을 관리하는 상위 퀘스트입니다.",
      request: "현금 900,000원 이상 + 편의점 성공 50회 + 카페 성공 40회.",
      successText: "지점 관리 테스트를 통과하면 프랜차이즈 지점장이 됩니다.",
      failText: "매장 운영 순서를 놓치면 퀘스트 실패입니다.",
    },
    {
      id: "hidden-shadow-executive",
      npc: "전직 멘토 한 실장",
      title: "극희귀: 그림자 이사회 퀘스트",
      targetId: "shadowExecutive",
      story: "한 실장이 아무 기록에도 남지 않는 비밀 이사회를 제안합니다.",
      request: "극희귀 조건 충족 후 비밀 이사회 테스트를 완벽히 수행하세요.",
      successText: "그림자 임원 직업을 획득합니다.",
      failText: "정체가 드러나면 히든 퀘스트 실패입니다.",
      hidden: true,
    },
    {
      id: "hidden-ceo",
      npc: "전직 멘토 한 실장",
      title: "히든: 경영 승계 퀘스트",
      targetId: "chiefExecutive",
      story: "회사 계열을 깊게 파고든 유저에게만 한 실장이 비밀 승계 시험을 제안합니다.",
      request: "히든 조건 충족 후 경영 승계 테스트를 통과하세요.",
      successText: "히든 CEO 직업을 획득합니다.",
      failText: "경영 판단을 틀리면 히든 퀘스트 실패입니다.",
      hidden: true,
    },
  ],
  entertainment: [
    {
      id: "ent-trainee",
      npc: "프로듀서 루나",
      title: "오디션 예선 퀘스트",
      targetId: "trainee",
      story: "루나가 리듬감과 기본 무대 태도를 확인합니다.",
      request: "현금 50,000원 이상을 준비하고 리듬 연습 테스트를 통과하세요.",
      successText: "연습생으로 전직합니다.",
      failText: "박자를 놓치면 오디션 실패입니다.",
    },
    {
      id: "ent-choreographer",
      npc: "프로듀서 루나",
      title: "진로 선택: 안무가 퀘스트",
      targetId: "choreographer",
      story: "루나가 무대 뒤에서 무대를 만드는 안무 루트를 제안합니다.",
      request: "연습생 보유 + 현금 180,000원 이상 + 카페 성공 15회.",
      successText: "안무가가 됩니다.",
      failText: "동선 구성이 무너지면 실패입니다.",
    },
    {
      id: "ent-streamer",
      npc: "프로듀서 루나",
      title: "진로 선택: 스트리머 퀘스트",
      targetId: "streamer",
      story: "개인 방송과 팬 소통으로 성장하는 루트입니다.",
      request: "연습생 보유 + 현금 160,000원 이상 + 편의점 성공 15회.",
      successText: "스트리머가 됩니다.",
      failText: "방송 흐름이 끊기면 실패입니다.",
    },
    {
      id: "ent-actor",
      npc: "프로듀서 루나",
      title: "진로 선택: 배우 퀘스트",
      targetId: "actor",
      story: "감정선과 대사 흐름을 증명하는 연기 루트입니다.",
      request: "연습생 보유 + 현금 200,000원 이상 + 보안 성공 15회.",
      successText: "배우가 됩니다.",
      failText: "대사 흐름이 무너지면 실패입니다.",
    },
    {
      id: "ent-rookie",
      npc: "프로듀서 루나",
      title: "데뷔 무대 퀘스트",
      targetId: "rookieSinger",
      story: "팬 응대와 무대 감각을 함께 증명해야 하는 데뷔 퀘스트입니다.",
      request: "연습생 보유 + 현금 150,000원 이상 + 카페 제조 성공 10회.",
      successText: "무대 공연 테스트를 통과하면 신인 가수가 됩니다.",
      failText: "무대 순서를 틀리면 데뷔가 연기됩니다.",
    },
    {
      id: "ent-star",
      npc: "프로듀서 루나",
      title: "콘서트 관리 퀘스트",
      targetId: "topSinger",
      story: "콘서트 동선과 팬서비스를 모두 관리해야 하는 스타 승급 퀘스트입니다.",
      request: "신인 가수 보유 + 현금 800,000원 이상.",
      successText: "콘서트 테스트를 통과하면 톱스타가 됩니다.",
      failText: "콘서트 운영이 꼬이면 퀘스트 실패입니다.",
    },
    {
      id: "ent-producer",
      npc: "프로듀서 루나",
      title: "음악 프로듀서 퀘스트",
      targetId: "musicProducer",
      story: "무대 감각을 곡 제작과 편곡으로 확장합니다.",
      request: "안무가 보유 + 현금 700,000원 이상 + 카페 성공 55회.",
      successText: "음악 프로듀서가 됩니다.",
      failText: "편곡 흐름을 놓치면 실패입니다.",
    },
    {
      id: "ent-idol-manager",
      npc: "프로듀서 루나",
      title: "아이돌 매니저 퀘스트",
      targetId: "idolManager",
      story: "방송/연기 경험을 스케줄 관리로 확장합니다.",
      request: "스트리머 보유 + 현금 650,000원 이상 + 보안 성공 50회.",
      successText: "아이돌 매니저가 됩니다.",
      failText: "스케줄 동선이 꼬이면 실패입니다.",
    },
    {
      id: "hidden-mythic-muse",
      npc: "프로듀서 루나",
      title: "극희귀: 신화의 무대 퀘스트",
      targetId: "mythicMuse",
      story: "루나가 아주 드물게 전설을 넘어선 무대 계약을 제안합니다.",
      request: "극희귀 조건 충족 후 신화의 무대를 완벽히 수행하세요.",
      successText: "신화의 뮤즈 직업을 획득합니다.",
      failText: "무대의 흐름이 끊기면 극희귀 퀘스트 실패입니다.",
      hidden: true,
    },
    {
      id: "hidden-idol",
      npc: "프로듀서 루나",
      title: "히든: 월드 투어 퀘스트",
      targetId: "legendaryIdol",
      story: "톱스타 이후 조건을 달성하면 루나가 비밀 월드 투어 계약을 제안합니다.",
      request: "히든 조건 충족 후 월드 투어 테스트를 통과하세요.",
      successText: "전설의 아이돌 직업을 획득합니다.",
      failText: "무대 장악에 실패하면 히든 퀘스트 실패입니다.",
      hidden: true,
    },
  ],
  logistics: [
    {
      id: "log-staff",
      npc: "관제장 박 반장",
      title: "입고 분류 퀘스트",
      targetId: "logisticsStaff",
      story: "박 반장이 실제 물류 라인에 들어갈 수 있는지 검증합니다.",
      request: "현금 70,000원 이상 + 택배 성공 15회 + 배달 성공 10회.",
      successText: "물류 정직원이 됩니다.",
      failText: "분류 라인을 놓치면 퀘스트 실패입니다.",
    },
    {
      id: "log-warehouse",
      npc: "관제장 박 반장",
      title: "진로 선택: 창고 설계 퀘스트",
      targetId: "warehousePlanner",
      story: "창고 배치와 적재 구조를 설계하는 루트입니다.",
      request: "물류 정직원 보유 + 현금 220,000원 이상 + 택배 성공 45회.",
      successText: "창고 설계사가 됩니다.",
      failText: "적재 구조가 무너지면 실패입니다.",
    },
    {
      id: "log-route",
      npc: "관제장 박 반장",
      title: "진로 선택: 동선 최적화 퀘스트",
      targetId: "routeOptimizer",
      story: "배송 경로를 분석하고 최단 루트를 찾는 루트입니다.",
      request: "물류 정직원 보유 + 현금 260,000원 이상 + 배달 성공 45회.",
      successText: "동선 최적화 전문가가 됩니다.",
      failText: "동선 계산이 틀리면 실패입니다.",
    },
    {
      id: "log-manager",
      npc: "관제장 박 반장",
      title: "배송 라인 관리 퀘스트",
      targetId: "logisticsManager",
      story: "여러 배송 라인을 동시에 관리하는 승급 퀘스트입니다.",
      request: "물류 정직원 보유 + 현금 300,000원 이상 + 택배 30회 + 배달 25회.",
      successText: "물류 관리자로 승급합니다.",
      failText: "라인 배치가 틀리면 퀘스트 실패입니다.",
    },
    {
      id: "log-dispatch",
      npc: "관제장 박 반장",
      title: "배차 관제 퀘스트",
      targetId: "dispatchController",
      story: "배송 데이터와 도착 시간을 읽어 최적 배차를 만드는 퀘스트입니다.",
      request: "현금 350,000원 이상 + 배달 35회 + 택배 20회.",
      successText: "배차 관제사가 됩니다.",
      failText: "배차 순서를 틀리면 퀘스트 실패입니다.",
    },
    {
      id: "log-platform",
      npc: "관제장 박 반장",
      title: "플랫폼 운영 퀘스트",
      targetId: "platformOpsManager",
      story: "라이더 동선과 주문 흐름을 최적화하는 상위 물류 퀘스트입니다.",
      request: "배차 관제사 보유 + 현금 650,000원 이상 + 배달 성공 60회.",
      successText: "배달 플랫폼 매니저가 됩니다.",
      failText: "플랫폼 흐름을 놓치면 퀘스트 실패입니다.",
    },
    {
      id: "log-drone",
      npc: "관제장 박 반장",
      title: "드론 관제 퀘스트",
      targetId: "droneDispatcher",
      story: "드론 배송망을 관리하는 첨단 물류 루트입니다.",
      request: "배차 관제사 보유 + 현금 900,000원 이상 + 배달 성공 85회.",
      successText: "드론 관제사가 됩니다.",
      failText: "드론 배치가 엉키면 실패입니다.",
    },
    {
      id: "log-port",
      npc: "관제장 박 반장",
      title: "항만 물류 퀘스트",
      targetId: "portCaptain",
      story: "대형 화물과 항만 적재를 관리하는 루트입니다.",
      request: "창고 설계사 보유 + 현금 950,000원 이상 + 택배 성공 85회.",
      successText: "항만 물류장이 됩니다.",
      failText: "항만 적재가 무너지면 실패입니다.",
    },
    {
      id: "log-supply",
      npc: "관제장 박 반장",
      title: "공급망 총괄 퀘스트",
      targetId: "supplyChainDirector",
      story: "전국 공급망을 총괄하는 물류 임원 루트입니다.",
      request: "플랫폼 매니저 보유 + 현금 1,700,000원 이상 + 택배/배달 성공 110회.",
      successText: "공급망 총괄이 됩니다.",
      failText: "공급망 설계가 끊기면 실패입니다.",
    },
    {
      id: "hidden-phantom-courier",
      npc: "관제장 박 반장",
      title: "극희귀: 팬텀 배송 퀘스트",
      targetId: "phantomCourier",
      story: "어디에도 기록되지 않는 특수 배송 루트가 아주 드물게 열립니다.",
      request: "극희귀 조건 충족 후 무음 배송을 완벽히 수행하세요.",
      successText: "팬텀 쿠리어 직업을 획득합니다.",
      failText: "흔적이 남으면 극희귀 퀘스트 실패입니다.",
      hidden: true,
    },
    {
      id: "hidden-logistics",
      npc: "관제장 박 반장",
      title: "히든: 전국 배송망 퀘스트",
      targetId: "logisticsLegend",
      story: "물류 계열을 통달하면 박 반장이 전국 배송망을 맡깁니다.",
      request: "히든 조건 충족 후 전국 배송망 테스트를 통과하세요.",
      successText: "물류의 전설 직업을 획득합니다.",
      failText: "배송망이 붕괴하면 히든 퀘스트 실패입니다.",
      hidden: true,
    },
  ],
  finance: [
    {
      id: "fin-investor",
      npc: "차트 분석가 민",
      title: "투자 판단 퀘스트",
      targetId: "investor",
      story: "민이 기본 자금 관리와 차트 판단력을 시험합니다.",
      request: "현금 100,000원 이상을 준비하고 투자 판단 테스트를 통과하세요.",
      successText: "투자자 직업을 획득합니다.",
      failText: "차트 판단을 틀리면 퀘스트 실패입니다.",
    },
    {
      id: "fin-bank-analyst",
      npc: "차트 분석가 민",
      title: "진로 선택: 은행 분석 퀘스트",
      targetId: "bankAnalyst",
      story: "안정적인 자금 흐름을 읽는 은행 분석 루트입니다.",
      request: "투자자 보유 + 예금 300,000원 이상 + 현금 250,000원 이상.",
      successText: "은행 분석가가 됩니다.",
      failText: "금융 구조 판단을 틀리면 실패입니다.",
    },
    {
      id: "fin-fund",
      npc: "차트 분석가 민",
      title: "진로 선택: 펀드 운용 퀘스트",
      targetId: "fundManager",
      story: "여러 자산을 섞어 수익과 리스크를 맞추는 루트입니다.",
      request: "투자자 보유 + 현금 500,000원 이상 + 주식 평가액 500,000원 이상.",
      successText: "펀드 매니저가 됩니다.",
      failText: "포트폴리오 판단이 빗나가면 실패입니다.",
    },
    {
      id: "fin-risk",
      npc: "차트 분석가 민",
      title: "진로 선택: 리스크 관리 퀘스트",
      targetId: "riskManager",
      story: "손실을 줄이고 위험 신호를 찾는 방어형 금융 루트입니다.",
      request: "투자자 보유 + 현금 450,000원 이상 + 예금 500,000원 이상.",
      successText: "리스크 매니저가 됩니다.",
      failText: "위험 신호를 놓치면 실패입니다.",
    },
    {
      id: "fin-venture",
      npc: "차트 분석가 민",
      title: "벤처 투자 퀘스트",
      targetId: "ventureCapitalist",
      story: "성장주와 사업 가능성을 동시에 읽는 공격형 투자 루트입니다.",
      request: "펀드 매니저 보유 + 현금 1,200,000원 이상.",
      successText: "벤처 캐피탈리스트가 됩니다.",
      failText: "성장성 판단을 놓치면 실패입니다.",
    },
    {
      id: "fin-director",
      npc: "차트 분석가 민",
      title: "재무 이사 퀘스트",
      targetId: "financialDirector",
      story: "자금 조달과 재무 리스크를 총괄하는 임원 루트입니다.",
      request: "리스크 매니저 보유 + 현금 1,500,000원 이상 + 예금 1,000,000원 이상.",
      successText: "재무 이사가 됩니다.",
      failText: "재무 판단이 흔들리면 실패입니다.",
    },
    {
      id: "hidden-quant",
      npc: "차트 분석가 민",
      title: "히든: 알고리즘 투자 퀘스트",
      targetId: "quantMaster",
      story: "예금과 주식 자산을 모두 증명하면 민이 비밀 알고리즘 시험을 제안합니다.",
      request: "히든 조건 충족 후 알고리즘 투자 테스트를 통과하세요.",
      successText: "퀀트 마스터 직업을 획득합니다.",
      failText: "투자 알고리즘 판단에 실패하면 히든 퀘스트 실패입니다.",
      hidden: true,
    },
    {
      id: "hidden-market-oracle",
      npc: "차트 분석가 민",
      title: "극희귀: 시장 예언 퀘스트",
      targetId: "marketOracle",
      story: "민이 극히 드물게 시장의 다음 흐름을 맞히는 예언 시험을 제안합니다.",
      request: "극희귀 조건 충족 후 시장 예언 테스트를 완벽히 수행하세요.",
      successText: "시장 예언가 직업을 획득합니다.",
      failText: "한 번이라도 흐름을 놓치면 극희귀 퀘스트 실패입니다.",
      hidden: true,
    },
    {
      id: "hidden-black-card",
      npc: "차트 분석가 민",
      title: "극희귀: 블랙카드 거래 퀘스트",
      targetId: "blackCardBroker",
      story: "초고액 거래를 연결하는 비밀 제안이 들어왔습니다.",
      request: "극희귀 조건 충족 후 비밀 거래 테스트를 완벽히 수행하세요.",
      successText: "블랙카드 브로커 직업을 획득합니다.",
      failText: "거래 흔적을 남기면 극희귀 퀘스트 실패입니다.",
      hidden: true,
    },
  ],
};

const streetBuildings: Array<{ id: StreetBuildingId; title: string; subtitle: string; emoji: string }> = [
  { id: "company", title: "회사 빌딩", subtitle: "회사원 · 점장 · 카페 · 보안", emoji: "🏢" },
  { id: "entertainment", title: "엔터테인먼트", subtitle: "연습생 · 가수 · 톱스타", emoji: "🎤" },
  { id: "logistics", title: "물류 센터", subtitle: "물류 · 배차 · 플랫폼", emoji: "🚚" },
  { id: "finance", title: "투자 회사", subtitle: "투자자 테스트 · 금융 직업", emoji: "🏦" },
  { id: "stocks", title: "주식 거래소", subtitle: "투자 · 시세 · 보유 주식", emoji: "📈" },
  { id: "bank", title: "은행", subtitle: "예금 · 대출 · 신용", emoji: "🏧" },
  { id: "estate", title: "부동산", subtitle: "원룸 · 상가 · 빌딩", emoji: "🏘️" },
  { id: "business", title: "창업 센터", subtitle: "카페 · 편의점 · 사업", emoji: "🧾" },
  { id: "news", title: "경제 뉴스", subtitle: "시장 이벤트 · 흐름", emoji: "📰" },
  { id: "insurance", title: "보험사", subtitle: "사고 · 세금 · 사업 보장", emoji: "🛡️" },
  { id: "employees", title: "인력 사무소", subtitle: "직원 고용 · 인건비", emoji: "👥" },
  { id: "academy", title: "교육원", subtitle: "자격증 · 교육 효과", emoji: "🎓" },
  { id: "gacha", title: "가챠 숍", subtitle: "장신구 · 자판기", emoji: "🎁" },
  { id: "itemMarket", title: "아이템 거래소", subtitle: "유저 장신구 매매", emoji: "🤝" },
  { id: "lotto", title: "로또 판매소", subtitle: "하루 3회 · 긁는 복권", emoji: "🎫" },
  { id: "luxury", title: "사치 아이템 숍", subtitle: "닉네임 · 이름표 · 배경", emoji: "💎" },
  { id: "casino", title: "도박장", subtitle: "슬롯 머신 · 유저 대전", emoji: "🎰" },
];

const streetBuildingPages: StreetBuildingId[][] = [
  ["company", "entertainment", "finance"],
  ["bank", "stocks", "logistics"],
  ["estate", "business", "news"],
  ["insurance", "employees", "academy"],
  ["gacha", "itemMarket", "lotto"],
  ["luxury", "casino"],
];

const stockCompanies: StockCompany[] = [
  { id: "kongStudio", name: "콩 스튜디오", icon: "🎮", description: "귀여운 게임과 캐릭터 IP를 만드는 성장형 회사" },
  { id: "zephyrLogistics", name: "제피르 물류", icon: "🚚", description: "전국 배송망을 가진 빠른 물류 회사" },
  { id: "raelAir", name: "라엘 항공", icon: "✈️", description: "여행 수요에 민감하게 움직이는 항공 회사" },
  { id: "dongshimLivestock", name: "동쉼 축산", icon: "🐄", description: "식품 가격과 수요에 영향을 받는 축산 회사" },
  { id: "blmaSteel", name: "블마 철강", icon: "🏭", description: "건설 경기와 원자재 흐름을 타는 철강 회사" },
  { id: "guardianTales", name: "가디언테일즈", icon: "🛡️", description: "레트로 감성 어드벤처 IP를 운영하는 게임 회사" },
  { id: "epicGames", name: "에픽 게임즈", icon: "🧱", description: "엔진 기술과 글로벌 게임 플랫폼을 보유한 회사" },
  { id: "leagueLegends", name: "리그오브레전드", icon: "🏆", description: "e스포츠와 챔피언 IP 매출에 강한 게임 회사" },
  { id: "valorantLabs", name: "발로란트 랩스", icon: "🎯", description: "전술 슈팅과 대회 흥행에 민감한 성장 회사" },
  { id: "overwatchWorks", name: "오버워치 웍스", icon: "🦾", description: "히어로 슈팅과 스킨 판매 흐름을 타는 회사" },
  { id: "gachindong", name: "가친동 미디어", icon: "🏘️", description: "커뮤니티 기반 콘텐츠와 광고 수익을 노리는 회사" },
  { id: "babyPrincess", name: "아기공주 토이즈", icon: "👑", description: "캐릭터 굿즈와 키즈 IP를 판매하는 회사" },
  { id: "futurePrincess", name: "미래공주 테크", icon: "🔮", description: "미래형 캐릭터 IP와 AI 콘텐츠를 개발하는 회사" },
  { id: "summonerRift", name: "소환사의 협곡", icon: "🗡️", description: "MOBA 리그와 스트리밍 흥행에 영향을 받는 회사" },
  { id: "heroWatch", name: "히어로 워치", icon: "⌚", description: "히어로 IP와 팀 기반 슈팅 콘텐츠 회사" },
];

const certifications: Certification[] = [
  { id: "office", name: "컴퓨터활용 자격증", icon: "💻", price: 120000, description: "회사 업무 승급과 사무직 수익에 도움이 됩니다.", effectText: "직업 수익 +3%" },
  { id: "barista", name: "바리스타 자격증", icon: "☕", price: 90000, description: "카페 계열 창업과 수익에 도움이 됩니다.", effectText: "사업 수익 +3%" },
  { id: "logistics", name: "물류관리사", icon: "📦", price: 150000, description: "물류/배송 계열 직업과 사업 운영에 도움이 됩니다.", effectText: "전체 수익 +2%" },
  { id: "investment", name: "투자분석 자격증", icon: "📈", price: 180000, description: "재무 관리와 은행 상품 이해도를 올려줍니다.", effectText: "은행 이자 +2%" },
  { id: "business", name: "창업 교육 수료증", icon: "🏪", price: 220000, description: "창업 비용 감각과 사업 운영력을 높입니다.", effectText: "사업 수익 +5%" },
];

const baseShopItems: ShopItem[] = [
  { id: "lucky_coin", name: "행운의 동전", icon: "🪙", rarity: "일반", price: 30000, description: "소소하게 운을 올려주는 낡은 동전입니다.", bonusType: "gachaLuck", bonusValue: 0.01 },
  { id: "salary_pin", name: "월급 핀", icon: "📌", rarity: "일반", price: 45000, description: "직업 수익을 조금 올려줍니다.", bonusType: "jobIncome", bonusValue: 0.03 },
  { id: "bronze_wallet", name: "청동 지갑", icon: "👛", rarity: "일반", price: 28000, description: "잔돈을 더 잘 챙기는 평범한 지갑입니다.", bonusType: "allIncome", bonusValue: 0.01 },
  { id: "work_badge", name: "근면 배지", icon: "🏷️", rarity: "일반", price: 36000, description: "직업 수익에 작은 보탬이 됩니다.", bonusType: "jobIncome", bonusValue: 0.025 },
  { id: "coffee_stamp", name: "카페 스탬프", icon: "☕", rarity: "일반", price: 42000, description: "작은 사업 감각을 올려줍니다.", bonusType: "businessIncome", bonusValue: 0.025 },
  { id: "tiny_four_leaf", name: "작은 네잎클로버", icon: "🍀", rarity: "일반", price: 50000, description: "아주 작은 행운을 줍니다.", bonusType: "gachaLuck", bonusValue: 0.008 },
  { id: "cheap_calculator", name: "싸구려 계산기", icon: "🧮", rarity: "일반", price: 26000, description: "손익 계산을 조금 빠르게 합니다.", bonusType: "allIncome", bonusValue: 0.012 },
  { id: "delivery_receipt", name: "배달 영수증", icon: "🧾", rarity: "일반", price: 33000, description: "배달과 직업 수익에 작은 도움이 됩니다.", bonusType: "jobIncome", bonusValue: 0.022 },
  { id: "plastic_name_tag", name: "플라스틱 명찰", icon: "📛", rarity: "일반", price: 39000, description: "손님 응대 능력이 소폭 증가합니다.", bonusType: "jobIncome", bonusValue: 0.024 },
  { id: "memo_pad", name: "메모 패드", icon: "🗒️", rarity: "일반", price: 31000, description: "업무 실수를 줄여 수익을 조금 올립니다.", bonusType: "allIncome", bonusValue: 0.011 },
  { id: "coin_pouch", name: "동전 주머니", icon: "👝", rarity: "일반", price: 34000, description: "작은 수익을 놓치지 않습니다.", bonusType: "allIncome", bonusValue: 0.013 },
  { id: "bus_card", name: "교통 카드", icon: "💳", rarity: "일반", price: 37000, description: "출퇴근 효율이 좋아집니다.", bonusType: "jobIncome", bonusValue: 0.026 },
  { id: "store_coupon", name: "상점 쿠폰", icon: "🎟️", rarity: "일반", price: 44000, description: "사업 운영 감각을 조금 올립니다.", bonusType: "businessIncome", bonusValue: 0.028 },
  { id: "mini_lamp", name: "작은 스탠드", icon: "💡", rarity: "일반", price: 48000, description: "야간 업무 집중력을 조금 올립니다.", bonusType: "jobIncome", bonusValue: 0.028 },
  { id: "paper_clip", name: "행운 클립", icon: "📎", rarity: "일반", price: 25000, description: "문서 정리 운이 조금 좋아집니다.", bonusType: "allIncome", bonusValue: 0.01 },
  { id: "market_sticker", name: "시장 스티커", icon: "🏷️", rarity: "일반", price: 46000, description: "가챠 결과에 아주 작은 행운이 붙습니다.", bonusType: "gachaLuck", bonusValue: 0.01 },
  { id: "red_pencil", name: "빨간 연필", icon: "✏️", rarity: "일반", price: 32000, description: "가계부 작성 능력이 좋아집니다.", bonusType: "allIncome", bonusValue: 0.012 },
  { id: "cafe_keyring", name: "카페 키링", icon: "🔑", rarity: "일반", price: 41000, description: "카페 계열 사업 수익을 아주 조금 올립니다.", bonusType: "businessIncome", bonusValue: 0.027 },
  { id: "tiny_dice", name: "작은 주사위", icon: "🎲", rarity: "일반", price: 52000, description: "카지노 운이 아주 조금 오릅니다.", bonusType: "casinoLuck", bonusValue: 0.012 },
  { id: "receipt_box", name: "영수증 상자", icon: "📥", rarity: "일반", price: 35000, description: "돈 흐름 관리가 조금 좋아집니다.", bonusType: "allIncome", bonusValue: 0.014 },
  { id: "security_whistle", name: "보안 호루라기", icon: "📣", rarity: "일반", price: 43000, description: "보안 계열 업무 수익이 소폭 증가합니다.", bonusType: "jobIncome", bonusValue: 0.027 },
  { id: "delivery_cap", name: "배달 모자", icon: "🧢", rarity: "일반", price: 47000, description: "알바 수익에 작은 보너스가 붙습니다.", bonusType: "jobIncome", bonusValue: 0.029 },
  { id: "stock_memo", name: "행운 메모지", icon: "📝", rarity: "일반", price: 49000, description: "가챠 결과에 작은 행운이 붙습니다.", bonusType: "gachaLuck", bonusValue: 0.012 },
  { id: "wooden_abacus", name: "나무 주판", icon: "🧮", rarity: "일반", price: 54000, description: "전체 수익이 조금 늘어납니다.", bonusType: "allIncome", bonusValue: 0.015 },
  { id: "small_piggybank", name: "작은 저금통", icon: "🐷", rarity: "일반", price: 58000, description: "절약 습관으로 수익 관리가 좋아집니다.", bonusType: "allIncome", bonusValue: 0.016 },
  { id: "employee_badge", name: "임시 사원증", icon: "🪪", rarity: "일반", price: 53000, description: "직업 수익이 조금 증가합니다.", bonusType: "jobIncome", bonusValue: 0.03 },
  { id: "neon_ticket", name: "네온 티켓", icon: "🎫", rarity: "일반", price: 56000, description: "엔터 관련 활동 수익이 소폭 좋아집니다.", bonusType: "jobIncome", bonusValue: 0.031 },
  { id: "basic_contract", name: "기본 계약서", icon: "📄", rarity: "일반", price: 60000, description: "사업 계약 운이 아주 조금 상승합니다.", bonusType: "businessIncome", bonusValue: 0.03 },
  { id: "lucky_button", name: "행운 단추", icon: "🔘", rarity: "일반", price: 62000, description: "작지만 꾸준한 행운을 줍니다.", bonusType: "gachaLuck", bonusValue: 0.014 },
  { id: "starter_chip", name: "입문 칩", icon: "🟤", rarity: "일반", price: 65000, description: "카지노 감각이 아주 조금 좋아집니다.", bonusType: "casinoLuck", bonusValue: 0.014 },
  { id: "silver_abacus", name: "은 주판", icon: "🧮", rarity: "희소", price: 120000, description: "모든 수익이 소폭 증가합니다.", bonusType: "allIncome", bonusValue: 0.03 },
  { id: "delivery_charm", name: "배달 부적", icon: "🛵", rarity: "희소", price: 150000, description: "알바와 직업 수익에 도움이 되는 부적입니다.", bonusType: "jobIncome", bonusValue: 0.06 },
  { id: "blue_pocket_watch", name: "푸른 회중시계", icon: "🕰️", rarity: "희소", price: 135000, description: "일하는 리듬을 정돈해줍니다.", bonusType: "jobIncome", bonusValue: 0.05 },
  { id: "mini_safe", name: "소형 금고", icon: "🔐", rarity: "희소", price: 160000, description: "수익 관리가 쉬워집니다.", bonusType: "allIncome", bonusValue: 0.035 },
  { id: "store_neon", name: "상점 네온사인", icon: "💡", rarity: "희소", price: 190000, description: "사업 손님을 더 끌어옵니다.", bonusType: "businessIncome", bonusValue: 0.06 },
  { id: "trader_notebook", name: "트레이더 노트", icon: "📒", rarity: "희소", price: 210000, description: "가챠 결과를 조금 좋게 만듭니다.", bonusType: "gachaLuck", bonusValue: 0.018 },
  { id: "blue_chip", name: "블루 칩", icon: "🔵", rarity: "희소", price: 170000, description: "카지노 운을 조금 높여줍니다.", bonusType: "casinoLuck", bonusValue: 0.025 },
  { id: "silver_wallet", name: "은빛 지갑", icon: "👛", rarity: "희소", price: 180000, description: "전체 수익이 안정적으로 증가합니다.", bonusType: "allIncome", bonusValue: 0.038 },
  { id: "office_tie", name: "사무용 넥타이", icon: "👔", rarity: "희소", price: 155000, description: "직업 수익에 실속 있는 보너스를 줍니다.", bonusType: "jobIncome", bonusValue: 0.055 },
  { id: "cafe_apron", name: "바리스타 앞치마", icon: "🥼", rarity: "희소", price: 165000, description: "카페와 사업 수익에 도움이 됩니다.", bonusType: "businessIncome", bonusValue: 0.058 },
  { id: "shipping_label", name: "물류 라벨러", icon: "🏷️", rarity: "희소", price: 145000, description: "물류 계열 업무 효율을 높입니다.", bonusType: "jobIncome", bonusValue: 0.052 },
  { id: "savings_stamp", name: "저축 스탬프", icon: "🏦", rarity: "희소", price: 195000, description: "돈 관리 능력이 좋아집니다.", bonusType: "allIncome", bonusValue: 0.04 },
  { id: "lucky_loupe", name: "행운 돋보기", icon: "🔎", rarity: "희소", price: 220000, description: "가챠 행운가 증가합니다.", bonusType: "gachaLuck", bonusValue: 0.022 },
  { id: "dealer_token", name: "딜러 토큰", icon: "🪙", rarity: "희소", price: 230000, description: "카지노 확률 감각이 좋아집니다.", bonusType: "casinoLuck", bonusValue: 0.03 },
  { id: "market_banner", name: "시장 배너", icon: "🏪", rarity: "희소", price: 240000, description: "사업 홍보력이 증가합니다.", bonusType: "businessIncome", bonusValue: 0.065 },
  { id: "premium_stamp", name: "프리미엄 도장", icon: "🔖", rarity: "희소", price: 250000, description: "직업과 업무 수익이 올라갑니다.", bonusType: "jobIncome", bonusValue: 0.062 },
  { id: "silver_ring", name: "은 반지", icon: "💍", rarity: "희소", price: 260000, description: "전체 수익이 준수하게 오릅니다.", bonusType: "allIncome", bonusValue: 0.042 },
  { id: "green_candle", name: "초록 캔들", icon: "🕯️", rarity: "희소", price: 270000, description: "가챠 운이 좋아집니다.", bonusType: "gachaLuck", bonusValue: 0.025 },
  { id: "slot_coupon", name: "슬롯 쿠폰", icon: "🎟️", rarity: "희소", price: 280000, description: "카지노 운에 보너스가 붙습니다.", bonusType: "casinoLuck", bonusValue: 0.034 },
  { id: "franchise_manual", name: "가맹 매뉴얼", icon: "📘", rarity: "희소", price: 290000, description: "사업 운영 수익을 올립니다.", bonusType: "businessIncome", bonusValue: 0.07 },
  { id: "career_compass", name: "커리어 나침반", icon: "🧭", rarity: "희소", price: 300000, description: "직업 수익 방향성이 좋아집니다.", bonusType: "jobIncome", bonusValue: 0.068 },
  { id: "silver_cashbook", name: "은빛 장부", icon: "📔", rarity: "희소", price: 310000, description: "전체 수익률이 올라갑니다.", bonusType: "allIncome", bonusValue: 0.045 },
  { id: "fund_ticket", name: "펀드 티켓", icon: "🎫", rarity: "희소", price: 320000, description: "가챠 행운가 더 붙습니다.", bonusType: "gachaLuck", bonusValue: 0.028 },
  { id: "golden_coffee_spoon", name: "황금 커피스푼", icon: "🥄", rarity: "희소", price: 330000, description: "사업 수익에 좋은 보너스가 붙습니다.", bonusType: "businessIncome", bonusValue: 0.074 },
  { id: "lucky_rabbit_pin", name: "토끼 행운핀", icon: "🐰", rarity: "희소", price: 340000, description: "가챠와 카지노 운이 조금 좋아집니다.", bonusType: "gachaLuck", bonusValue: 0.03 },
  { id: "golden_register", name: "황금 계산대", icon: "🏪", rarity: "진귀", price: 380000, description: "사업 수익을 크게 올려줍니다.", bonusType: "businessIncome", bonusValue: 0.1 },
  { id: "market_lens", name: "시장 분석 렌즈", icon: "🔍", rarity: "진귀", price: 420000, description: "가챠 희귀 보상 감각을 올려줍니다.", bonusType: "gachaLuck", bonusValue: 0.03 },
  { id: "ruby_calculator", name: "루비 계산기", icon: "🧮", rarity: "진귀", price: 520000, description: "모든 돈 흐름을 빠르게 계산합니다.", bonusType: "allIncome", bonusValue: 0.055 },
  { id: "ceo_pen", name: "대표의 만년필", icon: "🖋️", rarity: "진귀", price: 650000, description: "사업 계약에 강해집니다.", bonusType: "businessIncome", bonusValue: 0.12 },
  { id: "premium_id_card", name: "프리미엄 사원증", icon: "💳", rarity: "진귀", price: 580000, description: "직장 수익을 크게 올립니다.", bonusType: "jobIncome", bonusValue: 0.1 },
  { id: "chart_crystal", name: "차트 수정구", icon: "🔮", rarity: "진귀", price: 720000, description: "가챠 보상 운이 좋아집니다.", bonusType: "gachaLuck", bonusValue: 0.035 },
  { id: "golden_slot_chip", name: "황금 슬롯칩", icon: "🟡", rarity: "진귀", price: 740000, description: "카지노 감각을 올려줍니다.", bonusType: "casinoLuck", bonusValue: 0.035 },
  { id: "emerald_briefcase", name: "에메랄드 서류가방", icon: "💼", rarity: "진귀", price: 760000, description: "직업 수익이 크게 상승합니다.", bonusType: "jobIncome", bonusValue: 0.115 },
  { id: "rare_franchise_map", name: "진귀한 상권 지도", icon: "🗺️", rarity: "진귀", price: 820000, description: "사업 매출 포인트를 찾아냅니다.", bonusType: "businessIncome", bonusValue: 0.13 },
  { id: "red_profit_gem", name: "수익의 붉은 보석", icon: "♦️", rarity: "진귀", price: 880000, description: "전체 수익을 확실하게 올립니다.", bonusType: "allIncome", bonusValue: 0.065 },
  { id: "blue_market_orb", name: "푸른 시장 구슬", icon: "🔵", rarity: "진귀", price: 900000, description: "가챠 행운가 꽤 증가합니다.", bonusType: "gachaLuck", bonusValue: 0.04 },
  { id: "dealer_watch", name: "딜러의 시계", icon: "⌚", rarity: "진귀", price: 930000, description: "카지노 판 흐름을 읽습니다.", bonusType: "casinoLuck", bonusValue: 0.045 },
  { id: "executive_card", name: "임원 카드", icon: "💳", rarity: "진귀", price: 980000, description: "직업 수익에 강한 보너스가 붙습니다.", bonusType: "jobIncome", bonusValue: 0.125 },
  { id: "golden_menu_board", name: "황금 메뉴판", icon: "📋", rarity: "진귀", price: 1040000, description: "사업 수익을 크게 끌어올립니다.", bonusType: "businessIncome", bonusValue: 0.14 },
  { id: "diamond_receipt", name: "다이아 영수증", icon: "🧾", rarity: "진귀", price: 1100000, description: "전체 수익 관리가 탁월해집니다.", bonusType: "allIncome", bonusValue: 0.075 },
  { id: "bullish_talisman", name: "상승장 부적", icon: "🐂", rarity: "진귀", price: 1160000, description: "가챠 고등급 확률 보정이 증가합니다.", bonusType: "gachaLuck", bonusValue: 0.045 },
  { id: "royal_chip_case", name: "왕실 칩 케이스", icon: "🎰", rarity: "진귀", price: 1220000, description: "카지노 운을 중상급으로 올립니다.", bonusType: "casinoLuck", bonusValue: 0.052 },
  { id: "master_badge", name: "마스터 배지", icon: "🏅", rarity: "진귀", price: 1280000, description: "직업 수익이 큰 폭으로 증가합니다.", bonusType: "jobIncome", bonusValue: 0.135 },
  { id: "golden_store_bell", name: "황금 상점 종", icon: "🔔", rarity: "진귀", price: 1340000, description: "사업 손님을 크게 늘립니다.", bonusType: "businessIncome", bonusValue: 0.15 },
  { id: "opal_ledger", name: "오팔 장부", icon: "📓", rarity: "진귀", price: 1420000, description: "전체 수익이 강하게 상승합니다.", bonusType: "allIncome", bonusValue: 0.085 },
  { id: "casino_glove", name: "딜러의 장갑", icon: "🧤", rarity: "보물", price: 900000, description: "카지노 운을 아주 조금 올려줍니다.", bonusType: "casinoLuck", bonusValue: 0.04 },
  { id: "merchant_crown", name: "상인의 왕관", icon: "👑", rarity: "보물", price: 1300000, description: "모든 수익이 눈에 띄게 증가합니다.", bonusType: "allIncome", bonusValue: 0.08 },
  { id: "platinum_briefcase", name: "플래티넘 서류가방", icon: "💼", rarity: "보물", price: 1600000, description: "직업과 사업 양쪽에 강한 보너스를 줍니다.", bonusType: "allIncome", bonusValue: 0.09 },
  { id: "franchise_key", name: "프랜차이즈 황금열쇠", icon: "🗝️", rarity: "보물", price: 1850000, description: "사업 확장에 특화된 보물입니다.", bonusType: "businessIncome", bonusValue: 0.18 },
  { id: "wallstreet_ring", name: "월스트리트 반지", icon: "💍", rarity: "보물", price: 2100000, description: "가챠 행운를 크게 올립니다.", bonusType: "gachaLuck", bonusValue: 0.055 },
  { id: "jackpot_bell", name: "잭팟 종", icon: "🔔", rarity: "보물", price: 2300000, description: "카지노 운을 크게 올립니다.", bonusType: "casinoLuck", bonusValue: 0.07 },
  { id: "golden_tower_badge", name: "황금 타워 배지", icon: "🏙️", rarity: "보물", price: 2500000, description: "전체 수익이 보물급으로 증가합니다.", bonusType: "allIncome", bonusValue: 0.1 },
  { id: "legend_office_stamp", name: "전설 사무 도장", icon: "🏢", rarity: "보물", price: 2700000, description: "직업 수익을 매우 크게 올립니다.", bonusType: "jobIncome", bonusValue: 0.18 },
  { id: "dragon_contract", name: "용의 계약서", icon: "🐉", rarity: "보물", price: 3000000, description: "사업 수익을 강하게 끌어올립니다.", bonusType: "businessIncome", bonusValue: 0.21 },
  { id: "profit_crown", name: "수익왕관", icon: "👑", rarity: "보물", price: 3300000, description: "전체 수익에 강한 보너스를 줍니다.", bonusType: "allIncome", bonusValue: 0.115 },
  { id: "stock_king_medal", name: "주식왕 메달", icon: "🥇", rarity: "보물", price: 3600000, description: "가챠 보상 운이 크게 증가합니다.", bonusType: "gachaLuck", bonusValue: 0.07 },
  { id: "casino_royal_key", name: "카지노 왕실열쇠", icon: "🗝️", rarity: "보물", price: 3900000, description: "카지노 운을 보물급으로 올립니다.", bonusType: "casinoLuck", bonusValue: 0.09 },
  { id: "tycoon_glasses", name: "재벌 안경", icon: "🕶️", rarity: "보물", price: 4200000, description: "사업과 전체 수익을 함께 올립니다.", bonusType: "allIncome", bonusValue: 0.12 },
  { id: "black_card", name: "블랙 카드", icon: "🖤", rarity: "보물", price: 4600000, description: "직업과 사업 수익을 크게 강화합니다.", bonusType: "businessIncome", bonusValue: 0.23 },
  { id: "treasure_account_book", name: "보물 장부", icon: "📚", rarity: "보물", price: 5000000, description: "전체 수익을 안정적으로 크게 올립니다.", bonusType: "allIncome", bonusValue: 0.13 },
  { id: "ancient_cashbook", name: "고대 장부", icon: "📜", rarity: "유물", price: 6200000, description: "사업과 직업 수익을 강하게 올려주는 유물입니다.", bonusType: "allIncome", bonusValue: 0.14 },
  { id: "fortune_core", name: "행운 핵", icon: "💠", rarity: "유물", price: 7000000, description: "극악 확률로만 얻는 전설적인 행운 장신구입니다.", bonusType: "gachaLuck", bonusValue: 0.07 },
  { id: "mythic_ledger", name: "신화의 장부", icon: "📚", rarity: "유물", price: 7800000, description: "모든 수익을 강하게 끌어올립니다.", bonusType: "allIncome", bonusValue: 0.18 },
  { id: "phoenix_contract", name: "불사조 계약서", icon: "🔥", rarity: "유물", price: 9200000, description: "사업 수익을 압도적으로 강화합니다.", bonusType: "businessIncome", bonusValue: 0.28 },
  { id: "oracle_ticker", name: "예언의 시세판", icon: "📟", rarity: "유물", price: 10500000, description: "상점의 희귀 보상 흐름을 읽는 고급 행운 유물입니다.", bonusType: "gachaLuck", bonusValue: 0.1 },
  { id: "royal_casino_dice", name: "왕가의 주사위", icon: "🎲", rarity: "유물", price: 8800000, description: "카지노 운을 크게 높여줍니다.", bonusType: "casinoLuck", bonusValue: 0.12 },
  { id: "time_bank_relic", name: "시간 은행 유물", icon: "⏳", rarity: "유물", price: 12000000, description: "전체 수익이 유물급으로 증가합니다.", bonusType: "allIncome", bonusValue: 0.21 },
  { id: "world_franchise_core", name: "세계 프랜차이즈 코어", icon: "🌐", rarity: "유물", price: 14000000, description: "사업 수익을 압도적으로 끌어올립니다.", bonusType: "businessIncome", bonusValue: 0.33 },
  { id: "market_prophet_eye", name: "시장 예언자의 눈", icon: "👁️", rarity: "유물", price: 16000000, description: "희귀 보상 흐름을 꿰뚫어 보는 최고급 행운 유물입니다.", bonusType: "gachaLuck", bonusValue: 0.13 },
  { id: "emperor_coin", name: "황제의 코인", icon: "🪙", rarity: "유물", price: 20000000, description: "모든 수익이 극적으로 상승합니다.", bonusType: "allIncome", bonusValue: 0.25 },
];

const ancientRelicItems: ShopItem[] = [
  {
    id: "ancient_princess_gem",
    name: "꼬마 공주님의 보석",
    icon: "💎",
    rarity: "고대 유물",
    price: 250000000,
    description: "도트빛으로 반짝이는 전설의 보석입니다. 모든 수익과 가챠 행운을 압도적으로 끌어올립니다.",
    bonusType: "allIncome",
    bonusValue: 0.75,
  },
  {
    id: "ancient_princess_bat",
    name: "꼬마 공주님의 방망이",
    icon: "🏏",
    rarity: "고대 유물",
    price: 280000000,
    description: "픽셀 모험가가 남긴 장난감 방망이입니다. 사업 수익과 직업 수익을 어마무시하게 강화합니다.",
    bonusType: "businessIncome",
    bonusValue: 1.15,
  },
  {
    id: "ancient_knight_helmet",
    name: "어느 기사의 방패",
    icon: "🛡️",
    rarity: "고대 유물",
    price: 320000000,
    description: "중세 왕국의 정예 기사가 쓰던 도트풍 투구입니다. 고풍스러운 철제 투구의 위엄을 담아 부동산 수익과 은행 이자 효율을 크게 높입니다.",
    bonusType: "estateIncome",
    bonusValue: 1.05,
  },
];

const extraShopItems: ShopItem[] = Array.from({ length: 100 }, (_, index) => {
  const rarityPlan: ItemRarity[] = [
    ...Array(30).fill("일반"),
    ...Array(25).fill("희소"),
    ...Array(20).fill("진귀"),
    ...Array(15).fill("보물"),
    ...Array(10).fill("유물"),
  ] as ItemRarity[];
  const rarity = rarityPlan[index] ?? "일반";
  const rarityMeta: Record<ItemRarity, { basePrice: number; step: number; baseBonus: number; icons: string[]; labels: string[] }> = {
    일반: { basePrice: 38000, step: 3500, baseBonus: 0.012, icons: ["🧾", "🪙", "🧢", "📎", "🔑"], labels: ["생활", "알바", "절약", "소액", "근면"] },
    희소: { basePrice: 150000, step: 12000, baseBonus: 0.035, icons: ["💳", "📘", "🧭", "🔐", "💡"], labels: ["실버", "상점", "운영", "효율", "관리"] },
    진귀: { basePrice: 520000, step: 36000, baseBonus: 0.072, icons: ["🔮", "💎", "📊", "🧿", "🏵️"], labels: ["진귀", "분석", "고급", "전문", "전략"] },
    보물: { basePrice: 2100000, step: 160000, baseBonus: 0.13, icons: ["👑", "🏆", "💠", "🗝️", "📜"], labels: ["보물", "재벌", "황금", "왕실", "명품"] },
    유물: { basePrice: 8000000, step: 650000, baseBonus: 0.2, icons: ["🏺", "🌌", "🔥", "⏳", "🪬"], labels: ["고대", "신화", "유물", "전설", "차원"] },
    "고대 유물": { basePrice: 250000000, step: 35000000, baseBonus: 0.75, icons: ["💎", "🏏", "🪖"], labels: ["공주", "기사", "전설"] },
  };
  const bonusCycle: ShopItem["bonusType"][] = ["allIncome", "jobIncome", "businessIncome", "casinoLuck", "estateIncome", "bankInterest", "lottoLuck", "gachaLuck", "taxShield", "employeeEfficiency"];
  const bonusType = bonusCycle[index % bonusCycle.length];
  const meta = rarityMeta[rarity];
  const icon = meta.icons[index % meta.icons.length];
  const label = meta.labels[index % meta.labels.length];
  const price = meta.basePrice + meta.step * (index + 1);
  const bonusValue = Number((meta.baseBonus + (index % 5) * 0.004).toFixed(3));
  const bonusText = getBonusTypeLabel(bonusType);

  return {
    id: `collection_extra_${index + 1}`,
    name: `${label} 장신구 ${index + 1}`,
    icon,
    rarity,
    price,
    description: `${rarity} 등급의 수집형 장신구입니다. ${bonusText}에 특화되어 있습니다.`,
    bonusType,
    bonusValue,
  };
});

const rawShopItems: ShopItem[] = [...baseShopItems, ...extraShopItems, ...ancientRelicItems];
const maxTreasureItemPrice = Math.max(...rawShopItems.filter((item) => item.rarity === "보물").map((item) => item.price), 0);
const shopItems: ShopItem[] = rawShopItems.map((item, index) => {
  if (item.rarity !== "유물" || item.price > maxTreasureItemPrice) return item;
  return {
    ...item,
    price: maxTreasureItemPrice + 500000 + index * 25000,
    description: `${item.description} 유물 등급은 보물 등급보다 항상 높은 기준가를 가집니다.`,
  };
});

const playerTitles: PlayerTitle[] = [
  { id: "newbie", name: "초보 경제인", icon: "🌱", description: "게임을 시작한 기본 칭호입니다." },
  { id: "firstPay", name: "첫 월급", icon: "💵", description: "현금 50,000원 이상 보유" },
  { id: "worker", name: "성실한 알바생", icon: "💼", description: "알바 성공 누적 30회 이상" },
  { id: "proWorker", name: "프로 알바러", icon: "🧰", description: "알바 성공 누적 100회 이상" },
  { id: "deliveryAce", name: "배달 에이스", icon: "🛵", description: "배달 성공 50회 이상" },
  { id: "cashierMaster", name: "계산의 달인", icon: "🏪", description: "편의점 계산 성공 50회 이상" },
  { id: "cafeMaster", name: "라떼 장인", icon: "☕", description: "카페 제조 성공 50회 이상" },
  { id: "securityGuard", name: "철벽 보안", icon: "🛡️", description: "보안 대응 성공 40회 이상" },
  { id: "saver", name: "저축왕", icon: "🏦", description: "은행 예금 100,000원 이상" },
  { id: "bankVip", name: "은행 VIP", icon: "💳", description: "은행 예금 1,000,000원 이상" },
  { id: "loanManager", name: "레버리지 관리자", icon: "📑", description: "대출이 있어도 신용점수 750점 이상 유지" },
  { id: "investor", name: "신중한 투자자", icon: "📈", description: "투자 자산 100,000원 이상" },
  { id: "marketMaster", name: "시장 분석가", icon: "📊", description: "서로 다른 투자 자산 3종 이상 보유" },
  { id: "portfolioKing", name: "분산투자왕", icon: "🧺", description: "서로 다른 투자 자산 8종 이상 보유" },
  { id: "stockWhale", name: "개미들의 고래", icon: "🐋", description: "투자 자산 2,000,000원 이상" },
  { id: "realEstate", name: "부동산 입문자", icon: "🏘️", description: "부동산 1개 이상 보유" },
  { id: "landlord", name: "월세 받는 사람", icon: "🏠", description: "부동산 3개 이상 보유" },
  { id: "buildingOwner", name: "빌딩주", icon: "🏙️", description: "미니 빌딩 보유" },
  { id: "businessOwner", name: "사장님", icon: "🏪", description: "사업 1개 이상 보유" },
  { id: "chainOwner", name: "체인점 대표", icon: "🏬", description: "사업 3개 이상 보유" },
  { id: "ceo", name: "대표님", icon: "👔", description: "사업 4개 이상 보유" },
  { id: "employeeBoss", name: "고용주", icon: "👥", description: "직원 고용 레벨 합계 3 이상" },
  { id: "casinoRookie", name: "카지노 손님", icon: "🎰", description: "카지노에 입장 가능한 플레이어" },
  { id: "riskTaker", name: "승부사", icon: "🎲", description: "현금 300,000원 이상 보유" },
  { id: "taxPayer", name: "모범 납세자", icon: "🧾", description: "미납 세금이 없는 플레이어" },
  { id: "insurancePlanner", name: "위험 관리자", icon: "☂️", description: "보험 2개 이상 보유" },
  { id: "auctionHunter", name: "경매 사냥꾼", icon: "🔨", description: "순자산 500,000원 이상" },
  { id: "millionaire", name: "백만장자", icon: "💰", description: "순자산 1,000,000원 이상" },
  { id: "multiMillionaire", name: "천만장자", icon: "💎", description: "순자산 10,000,000원 이상" },
  { id: "tycoon", name: "경제 거물", icon: "👑", description: "순자산 50,000,000원 이상" },
  { id: "certifiedExpert", name: "자격증 수집가", icon: "🎓", description: "자격증 3개 이상 보유", passiveText: "직업 수익 +2%" },
  { id: "treasureCollector", name: "보물 수집가", icon: "💠", description: "보물 등급 이상 아이템 2개 이상 보유", passiveText: "아이템 장착 슬롯 +1" },
  { id: "relicOwner", name: "유물의 주인", icon: "🏺", description: "유물 등급 아이템 1개 이상 보유", passiveText: "전체 수익 +3%" },
  { id: "lottoDreamer", name: "복권 드리머", icon: "🎫", description: "로또를 3회 이상 구매" },
  { id: "phoneAnalyst", name: "모바일 분석가", icon: "📱", description: "휴대폰 대시보드를 활용하는 플레이어" },
  { id: "savingsPlanner", name: "적금 설계자", icon: "📘", description: "적금 500,000원 이상 보유", passiveText: "예금/적금 관리 보너스" },
  { id: "estateCollector", name: "부동산 컬렉터", icon: "🏗️", description: "부동산 5개 보유", passiveText: "임대 수익 +2%" },
  { id: "shopRegular", name: "가챠숍 단골", icon: "🎁", description: "상점 구매 10회 이상" },
  { id: "gachaAddict", name: "자판기 중독자", icon: "🕹️", description: "가챠 머신 10회 이상 이용", passiveText: "상점 등급 성장 가속" },
  { id: "rankChaser", name: "랭킹 추격자", icon: "🏁", description: "순자산 3,000,000원 이상" },
  { id: "topRanker", name: "상위 랭커", icon: "🏆", description: "랭킹 상위 5위 안에 진입", passiveText: "랭킹 버프 대상" },
  { id: "taxFreeMind", name: "납세 우등생", icon: "📄", description: "미납 세금 0원 + 순자산 2,000,000원 이상", passiveText: "세금 압박 완화" },
  { id: "collectionMaster", name: "도감 수집가", icon: "📖", description: "장신구 25종 이상 수집", passiveText: "전체 수익 +1%" },
  { id: "hiddenZero", name: "숨겨진 시작점", icon: "🕯️", description: "조건 비공개", hidden: true, passiveText: "전체 수익 +1%" },
  { id: "hiddenWhale", name: "조용한 고래", icon: "🐳", description: "조건 비공개", hidden: true, passiveText: "가챠 행운" },
  { id: "hiddenLucky", name: "확률의 선택자", icon: "🍀", description: "조건 비공개", hidden: true, passiveText: "가챠/카지노 행운" },
  { id: "hiddenEstateLord", name: "밤의 건물주", icon: "🌃", description: "조건 비공개", hidden: true, passiveText: "임대 수익 +3%" },
  { id: "hiddenLaborKing", name: "알바의 전설", icon: "⚒️", description: "조건 비공개", hidden: true, passiveText: "알바/직업 수익 +3%" },
  { id: "hiddenMarketGhost", name: "시장 유령", icon: "👻", description: "조건 비공개", hidden: true, passiveText: "가챠 행운 +2%" },
  { id: "hiddenRelicDealer", name: "유물 거래상", icon: "🏺", description: "조건 비공개", hidden: true, passiveText: "아이템 슬롯 +1" },
  { id: "hiddenDebtFree", name: "빚 없는 왕", icon: "🕊️", description: "조건 비공개", hidden: true, passiveText: "전체 수익 +2%" },
  { id: "hiddenCasinoDemon", name: "카지노 악마", icon: "😈", description: "조건 비공개", hidden: true, passiveText: "카지노 행운" },
  { id: "hiddenEconomyGod", name: "경제의 신", icon: "🌌", description: "조건 비공개", hidden: true, passiveText: "전체 수익 +5%" },
];

const estateItems: EstateItem[] = [
  { id: "semiBasement", name: "반지하 원룸", icon: "🏚️", price: 300000, incomeEvery5Min: 900, description: "가장 저렴하게 시작하는 첫 부동산입니다. 현실 월세 수익률을 낮게 반영했습니다." },
  { id: "officetel", name: "오피스텔", icon: "🏢", price: 1500000, incomeEvery5Min: 4500, description: "안정적인 월세 수익을 주는 소형 부동산입니다." },
  { id: "apartment", name: "아파트", icon: "🏙️", price: 4500000, incomeEvery5Min: 12000, description: "생활권이 좋아 가치가 비교적 안정적입니다." },
  { id: "smallStore", name: "소형 상가", icon: "🏬", price: 9000000, incomeEvery5Min: 27000, description: "상가는 공실 위험 대신 주거보다 높은 수익률을 반영했습니다." },
  { id: "building", name: "미니 빌딩", icon: "🏦", price: 50000000, incomeEvery5Min: 120000, description: "초대형 자산이지만 부동산답게 수익률은 사업보다 안정적으로 낮습니다." },
];

const businessItems: BusinessItem[] = [
  { id: "coffeeShop", name: "개인 카페 창업", icon: "☕", price: 2000000, incomeEvery5Min: 4500, requiredOccupation: "cafeManager", description: "카페 매니저 경험을 바탕으로 작은 매장을 엽니다. 30초 순이익 기준입니다." },
  { id: "convenienceStore", name: "편의점 창업", icon: "🏪", price: 3000000, incomeEvery5Min: 7000, requiredOccupation: "convenienceManager", description: "편의점 계산 경험을 매장 운영으로 확장합니다." },
  { id: "deliveryAgency", name: "배달 대행사", icon: "🛵", price: 8000000, incomeEvery5Min: 18000, requiredOccupation: "dispatchController", description: "배차와 플랫폼 운영 경험으로 배달망을 운영합니다." },
  { id: "entertainmentAgency", name: "엔터 기획사", icon: "🎙️", price: 20000000, incomeEvery5Min: 45000, requiredOccupation: "topSinger", description: "톱스타 경험으로 공연과 광고 사업을 운영합니다." },
];

const insuranceItems: InsuranceItem[] = [
  { id: "delivery", name: "기본 알바 안전 보험", icon: "🛵", grade: "일반", premiumEvery5Min: 1200, jobBonus: 0.02, description: "알바 중 작은 사고를 대비합니다. 알바/직업 수익 +2%." },
  { id: "deliveryPlus", name: "상급 알바 안전 보험", icon: "🚦", grade: "희소", premiumEvery5Min: 3600, jobBonus: 0.055, description: "배달·분류·서비스 알바 보호 범위가 커집니다. 알바/직업 수익 +5.5%." },
  { id: "deliveryPremium", name: "프리미엄 근로 보장 보험", icon: "🦺", grade: "진귀", premiumEvery5Min: 9800, jobBonus: 0.105, description: "높은 보험료 대신 근로 수익 안정성이 크게 오릅니다. 알바/직업 수익 +10.5%." },
  { id: "tax", name: "기본 세금 방어 보험", icon: "🧾", grade: "일반", premiumEvery5Min: 2500, taxDiscount: 0.05, seizureProtection: 0.08, description: "세금 부담을 조금 줄이고 압류 피해를 완화합니다. 세금 -5%, 압류 피해 -8%." },
  { id: "taxPlus", name: "상급 세금 방어 보험", icon: "📑", grade: "희소", premiumEvery5Min: 7200, taxDiscount: 0.11, seizureProtection: 0.18, description: "미납 리스크 관리에 특화된 보험입니다. 세금 -11%, 압류 피해 -18%." },
  { id: "taxPremium", name: "프리미엄 세무 보호 보험", icon: "🏛️", grade: "보물", premiumEvery5Min: 21000, taxDiscount: 0.2, seizureProtection: 0.34, description: "큰 자산가를 위한 세무 보호 상품입니다. 세금 -20%, 압류 피해 -34%." },
  { id: "business", name: "기본 사업 손실 보험", icon: "🏪", grade: "일반", premiumEvery5Min: 4200, businessBonus: 0.035, description: "사업 운영 리스크를 낮춰 매출을 안정화합니다. 사업 수익 +3.5%." },
  { id: "businessPlus", name: "상급 사업 안정 보험", icon: "📊", grade: "진귀", premiumEvery5Min: 14500, businessBonus: 0.09, description: "직원·재고·매출 변동을 폭넓게 보장합니다. 사업 수익 +9%." },
  { id: "businessPremium", name: "프리미엄 기업 종합 보험", icon: "🏢", grade: "보물", premiumEvery5Min: 36000, businessBonus: 0.18, description: "고비용 고효율 사업 보장 상품입니다. 사업 수익 +18%." },
  { id: "estateCover", name: "건물 관리 보험", icon: "🏘️", grade: "희소", premiumEvery5Min: 6500, estateBonus: 0.055, description: "수리·공실 리스크를 줄여 임대 수익을 높입니다. 부동산 수익 +5.5%." },
  { id: "estatePremium", name: "프리미엄 임대 보장 보험", icon: "🏙️", grade: "진귀", premiumEvery5Min: 18500, estateBonus: 0.13, description: "고급 임대 자산 보호 상품입니다. 부동산 수익 +13%." },
  { id: "casino", name: "기본 도박 손실 보험", icon: "🎰", grade: "일반", premiumEvery5Min: 5000, casinoCashback: 0.06, description: "슬롯 손실 일부를 돌려받습니다. 슬롯 손실 환급 6%." },
  { id: "casinoPremium", name: "프리미엄 승부 보험", icon: "💸", grade: "진귀", premiumEvery5Min: 22000, casinoCashback: 0.16, description: "고위험 승부 손실을 크게 완화합니다. 슬롯 손실 환급 16%." },
];

const employeePlans: EmployeePlan[] = [
  { level: 0, name: "무인 운영", cost: 0, payrollEvery60Sec: 0, revenueBonusRate: 0, description: "직원 없이 직접 운영합니다." },
  { level: 1, name: "파트타이머", cost: 80000, payrollEvery60Sec: 1800, revenueBonusRate: 0.15, description: "작은 인건비로 매출을 조금 늘립니다." },
  { level: 2, name: "정직원", cost: 250000, payrollEvery60Sec: 5200, revenueBonusRate: 0.38, description: "안정적인 운영으로 매출이 크게 증가합니다." },
  { level: 3, name: "매니저 팀", cost: 850000, payrollEvery60Sec: 16000, revenueBonusRate: 0.8, description: "사업을 조직적으로 굴려 높은 매출을 노립니다." },
];

const auctionDealPool: AuctionDeal[] = [
  { id: "estate_apartment", name: "급매 아파트 지분", icon: "🏙️", type: "estate", price: 3500000, value: 4500000, description: "시세보다 싸게 나온 아파트성 매물입니다." },
  { id: "estate_store", name: "소형 상가 경매권", icon: "🏬", type: "estate", price: 7200000, value: 9000000, description: "상가 매입가를 줄일 수 있는 경매 물건입니다." },
  { id: "business_cafe", name: "카페 설비 일괄 매각", icon: "☕", type: "business", price: 1500000, value: 2000000, description: "카페 창업 비용을 아낄 수 있는 설비 패키지입니다." },
  { id: "stock_bundle", name: "성장주 묶음 매수권", icon: "📈", type: "stock", price: 500000, value: 650000, description: "랜덤 주식 몇 주를 시세보다 저렴하게 확보합니다." },
];

const newsPool: NewsEvent[] = [
  { id: 1, title: "금리 인상 발표", effect: "은행주는 안정적이지만 성장주와 게임주는 부담을 받습니다.", tone: "bad", sector: "금리", targetStocks: ["epicGames", "guardianTales", "futurePrincess", "kongStudio"], impactPercent: -3.2 },
  { id: 2, title: "배달 수요 급증", effect: "물류·배송 수요가 늘며 제피르 물류가 직접 수혜를 받습니다.", tone: "good", sector: "물류", targetStocks: ["zephyrLogistics"], impactPercent: 5.5 },
  { id: 3, title: "항공 여행 예약 회복", effect: "여행 수요가 살아나 라엘 항공 실적 기대감이 커집니다.", tone: "good", sector: "항공", targetStocks: ["raelAir"], impactPercent: 5.0 },
  { id: 4, title: "축산 원가 부담 확대", effect: "사료와 유통 비용이 올라 축산 관련 종목이 압박을 받습니다.", tone: "bad", sector: "식품", targetStocks: ["dongshimLivestock"], impactPercent: -4.6 },
  { id: 5, title: "철강 수주 증가", effect: "건설과 제조 수주가 늘며 철강 회사에 호재가 발생했습니다.", tone: "good", sector: "소재", targetStocks: ["blmaSteel"], impactPercent: 4.8 },
  { id: 6, title: "신작 모바일 RPG 흥행", effect: "귀여운 캐릭터 IP와 가디언 감성 게임주가 함께 주목받습니다.", tone: "good", sector: "게임", targetStocks: ["guardianTales", "kongStudio", "babyPrincess", "futurePrincess"], impactPercent: 5.8 },
  { id: 7, title: "글로벌 게임 플랫폼 수수료 논란", effect: "대형 게임 플랫폼의 비용 부담 우려로 관련 종목이 흔들립니다.", tone: "bad", sector: "플랫폼", targetStocks: ["epicGames", "leagueLegends", "valorantLabs"], impactPercent: -3.8 },
  { id: 8, title: "e스포츠 결승전 흥행", effect: "MOBA와 전술 슈팅 리그 흥행으로 관련 종목에 매수세가 몰립니다.", tone: "good", sector: "e스포츠", targetStocks: ["leagueLegends", "summonerRift", "valorantLabs", "heroWatch"], impactPercent: 5.2 },
  { id: 9, title: "슈팅 게임 밸런스 논란", effect: "업데이트 반응이 엇갈리며 슈팅 게임 관련 종목 변동성이 커집니다.", tone: "bad", sector: "게임", targetStocks: ["overwatchWorks", "valorantLabs", "heroWatch"], impactPercent: -4.1 },
  { id: 10, title: "캐릭터 굿즈 완판", effect: "공주 IP와 캐릭터 굿즈 판매가 호조를 보입니다.", tone: "good", sector: "IP", targetStocks: ["babyPrincess", "futurePrincess", "gachindong"], impactPercent: 4.7 },
  { id: 11, title: "커뮤니티 광고 시장 위축", effect: "광고 단가 하락으로 커뮤니티·미디어 관련 회사가 약세입니다.", tone: "bad", sector: "광고", targetStocks: ["gachindong", "summonerRift"], impactPercent: -3.5 },
  { id: 12, title: "신규 AI 콘텐츠 투자 확대", effect: "미래형 캐릭터와 AI 콘텐츠 기업이 투자 기대를 받습니다.", tone: "good", sector: "AI", targetStocks: ["futurePrincess", "epicGames", "kongStudio"], impactPercent: 4.4 },
  { id: 13, title: "게임 규제 강화 우려", effect: "게임·e스포츠 전반에 규제 리스크가 반영됩니다.", tone: "bad", sector: "규제", targetStocks: ["guardianTales", "leagueLegends", "overwatchWorks", "kongStudio", "epicGames"], impactPercent: -4.8 },
  { id: 14, title: "콘텐츠 소비 심리 개선", effect: "게임, 캐릭터, 미디어 종목 전반에 약한 호재가 반영됩니다.", tone: "good", sector: "소비", targetStocks: ["kongStudio", "babyPrincess", "gachindong", "heroWatch"], impactPercent: 3.3 },
  { id: 15, title: "경기 둔화 우려", effect: "위험자산 회피 심리로 대부분의 성장주가 약세를 보입니다.", tone: "bad", sector: "거시경제", targetStocks: ["epicGames", "guardianTales", "futurePrincess", "leagueLegends", "valorantLabs"], impactPercent: -3.1 },
];

const cashierKeyPool = ["W", "A", "S", "D"];
const BANK_DEPOSIT_RATE = 0.0035;
const BANK_SAVINGS_RATE = 0.009;
const BANK_SAVINGS_CAP = 3000000;
const BANK_LOAN_RATE = 0.012;
const allSortKinds: SortKind[] = ["red", "blue", "yellow", "green", "purple"];

const sortInfo: Record<SortKind, { label: string; emoji: string; key: string }> = {
  red: { label: "빨강", emoji: "🟥", key: "r" },
  blue: { label: "파랑", emoji: "🟦", key: "b" },
  yellow: { label: "노랑", emoji: "🟨", key: "y" },
  green: { label: "초록", emoji: "🟩", key: "g" },
  purple: { label: "보라", emoji: "🟪", key: "p" },
};


function normalizePlayerTitleIdList(values: unknown): PlayerTitleId[] {
  if (!Array.isArray(values)) return [];
  return values.filter((id): id is PlayerTitleId => typeof id === "string" && playerTitles.some((title) => title.id === id));
}

function getStoredEarnedTitleIds(userId: string): PlayerTitleId[] {
  if (typeof window === "undefined") return ["newbie"];

  const collected: PlayerTitleId[] = ["newbie"];
  const rawTitleCache = window.localStorage.getItem(`alba-money-earned-titles-${userId}`);
  const rawEconomyCache = window.localStorage.getItem(`alba-money-economy-${userId}`);
  const rawCurrentTitle = window.localStorage.getItem(`alba-money-title-${userId}`);

  try {
    collected.push(...normalizePlayerTitleIdList(JSON.parse(rawTitleCache ?? "[]")));
  } catch {
    // Ignore broken title cache.
  }

  try {
    const parsed = JSON.parse(rawEconomyCache ?? "{}") as { earnedTitleIds?: unknown; announcedSecretTitles?: unknown };
    collected.push(...normalizePlayerTitleIdList(parsed.earnedTitleIds));
    collected.push(...normalizePlayerTitleIdList(parsed.announcedSecretTitles));
  } catch {
    // Ignore broken economy cache.
  }

  if (rawCurrentTitle) collected.push(...normalizePlayerTitleIdList([rawCurrentTitle]));

  return Array.from(new Set<PlayerTitleId>(collected));
}

function persistEarnedTitleIds(userId: string, ids: PlayerTitleId[]) {
  if (typeof window === "undefined") return;
  const nextIds = Array.from(new Set<PlayerTitleId>(["newbie", ...ids]));
  window.localStorage.setItem(`alba-money-earned-titles-${userId}`, JSON.stringify(nextIds));

  const rawEconomyCache = window.localStorage.getItem(`alba-money-economy-${userId}`);
  try {
    const parsed = JSON.parse(rawEconomyCache ?? "{}") as Record<string, unknown>;
    window.localStorage.setItem(
      `alba-money-economy-${userId}`,
      JSON.stringify({
        ...parsed,
        earnedTitleIds: nextIds,
      })
    );
  } catch {
    window.localStorage.setItem(`alba-money-economy-${userId}`, JSON.stringify({ earnedTitleIds: nextIds }));
  }
}

function mergeEconomySavePayloads(localPayload: string | null, remotePayload: string | null): string | null {
  if (!localPayload && !remotePayload) return null;

  let localData: Record<string, unknown> = {};
  let remoteData: Record<string, unknown> = {};

  try {
    if (localPayload) localData = JSON.parse(localPayload) as Record<string, unknown>;
  } catch {
    localData = {};
  }

  try {
    if (remotePayload) remoteData = JSON.parse(remotePayload) as Record<string, unknown>;
  } catch {
    remoteData = {};
  }

  const mergedEarnedTitleIds = Array.from(
    new Set<PlayerTitleId>([
      "newbie",
      ...normalizePlayerTitleIdList(localData.earnedTitleIds),
      ...normalizePlayerTitleIdList(remoteData.earnedTitleIds),
      ...normalizePlayerTitleIdList(localData.announcedSecretTitles),
      ...normalizePlayerTitleIdList(remoteData.announcedSecretTitles),
    ])
  );

  return JSON.stringify({
    ...localData,
    ...remoteData,
    earnedTitleIds: mergedEarnedTitleIds,
  });
}

function ResponsiveGameStyles() {
  return (
    <style>{`
      .alba-game-root, .alba-game-root * { box-sizing: border-box; }
      .alba-panel-scene, .alba-world-body, .alba-economy-card-grid, .alba-career-card-grid, .alba-luxury-section-stack { -webkit-overflow-scrolling: touch; }

      @media (max-width: 900px) {
        .alba-game-root {
          height: auto !important;
          min-height: 100svh !important;
          max-height: none !important;
          overflow: auto !important;
        }

        .alba-world-layout {
          height: auto !important;
          min-height: 100svh !important;
          grid-template-rows: auto minmax(620px, auto) auto !important;
          overflow: visible !important;
          padding: 8px !important;
          gap: 10px !important;
        }

        .alba-world-header {
          display: flex !important;
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 10px !important;
          overflow: visible !important;
        }

        .alba-profile-area, .alba-money-panel {
          width: 100% !important;
          max-width: none !important;
        }

        .alba-main-title {
          font-size: clamp(22px, 7vw, 30px) !important;
          white-space: normal !important;
          line-height: 1.1 !important;
        }

        .alba-nickname-edit {
          flex-wrap: wrap !important;
          align-items: stretch !important;
          gap: 7px !important;
          margin-top: 6px !important;
        }

        .alba-nickname-input {
          width: min(100%, 180px) !important;
          flex: 1 1 150px !important;
        }

        .alba-small-action-button {
          min-height: 42px !important;
          padding: 8px 10px !important;
          flex: 1 1 auto !important;
        }

        .alba-money-panel {
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 7px !important;
          overflow: visible !important;
        }

        .alba-status-pill {
          min-width: 0 !important;
          padding: 8px 9px !important;
          font-size: 13px !important;
          overflow: hidden !important;
        }

        .alba-status-pill strong {
          font-size: 14px !important;
          overflow-wrap: anywhere !important;
        }

        .alba-world-body {
          min-height: 620px !important;
          overflow: visible !important;
        }

        .alba-room-scene, .alba-street-scene {
          height: 620px !important;
          min-height: 620px !important;
          border-radius: 18px !important;
        }

        .alba-room-money, .alba-street-money {
          font-size: 16px !important;
          padding: 5px 9px !important;
        }

        .alba-room-info {
          top: 64px !important;
          left: 10px !important;
          width: min(252px, calc(100% - 20px)) !important;
          font-size: 12px !important;
          padding: 8px 9px !important;
          gap: 4px !important;
        }

        .alba-room-info > div {
          transform: scale(0.88);
          transform-origin: left center;
          max-width: calc(100vw - 40px) !important;
        }

        .alba-room-side-controls {
          right: 8px !important;
          top: 8px !important;
        }

        .alba-trophy-button {
          width: 54px !important;
          height: 54px !important;
          font-size: 28px !important;
        }

        .alba-room-nav {
          grid-auto-flow: row !important;
          grid-auto-columns: auto !important;
          width: calc(100% - 24px) !important;
          bottom: 10px !important;
          gap: 7px !important;
        }

        .alba-bottom-nav-button {
          width: 100% !important;
          min-width: 0 !important;
          padding: 11px 10px !important;
          font-size: 14px !important;
        }

        .alba-panel-scene, .alba-stock-scene {
          height: auto !important;
          min-height: 720px !important;
          overflow: auto !important;
          border-radius: 18px !important;
          padding: 12px !important;
          grid-template-rows: auto auto minmax(0, 1fr) !important;
        }

        .alba-panel-header {
          flex-direction: column !important;
          align-items: stretch !important;
          gap: 10px !important;
        }

        .alba-panel-title {
          font-size: clamp(23px, 7vw, 30px) !important;
        }

        .alba-room-select-grid, .alba-job-grid, .alba-economy-card-grid, .alba-career-card-grid {
          grid-template-columns: 1fr !important;
          overflow: visible !important;
          height: auto !important;
          min-height: 0 !important;
        }

        .alba-luxury-grid {
          grid-template-columns: 1fr !important;
        }

        .alba-luxury-card {
          min-height: auto !important;
        }

        .alba-luxury-preview {
          min-height: 96px !important;
        }

        .alba-street-page-info {
          top: 10px !important;
          right: 10px !important;
          font-size: 12px !important;
          max-width: 42% !important;
          text-align: right !important;
        }

        .alba-street-bottom-nav {
          width: calc(100% - 24px) !important;
          bottom: 10px !important;
        }

        .alba-street-building-sign {
          font-size: 12px !important;
          padding: 5px 6px !important;
          border-width: 3px !important;
        }

        .alba-street-building-subtitle {
          font-size: 10px !important;
          min-height: 22px !important;
        }

        .alba-job-only-layout {
          height: auto !important;
          min-height: 100svh !important;
          overflow: visible !important;
          grid-template-rows: auto auto minmax(460px, auto) auto !important;
        }

        .alba-compact-header, .alba-job-footer {
          grid-template-columns: 1fr !important;
          overflow: visible !important;
        }

        .alba-top-status-group {
          justify-content: stretch !important;
        }

        .alba-top-status-group > * {
          flex: 1 1 140px !important;
        }

        .alba-job-stage {
          min-height: 460px !important;
          overflow: auto !important;
        }
      }

      @media (max-width: 520px) {
        .alba-money-panel {
          grid-template-columns: 1fr 1fr !important;
        }

        .alba-world-layout {
          grid-template-rows: auto minmax(600px, auto) auto !important;
        }

        .alba-world-body, .alba-room-scene, .alba-street-scene {
          min-height: 600px !important;
          height: 600px !important;
        }

        .alba-room-info {
          top: 58px !important;
          width: min(220px, calc(100% - 80px)) !important;
        }

        .alba-street-page-arrow {
          width: 42px !important;
          height: 42px !important;
          font-size: 20px !important;
        }
      }

      .alba-mobile-only {
        display: none !important;
      }

      @media (max-width: 1100px), (pointer: coarse) {
        html, body {
          overflow-x: hidden !important;
          touch-action: manipulation;
        }

        .alba-game-root {
          width: 100% !important;
          min-height: 100svh !important;
          height: auto !important;
          overflow: auto !important;
          padding: 0 !important;
        }

        .alba-world-layout {
          width: 100% !important;
          height: auto !important;
          min-height: 100svh !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: visible !important;
          padding: 8px !important;
          gap: 10px !important;
        }

        .alba-world-body {
          width: 100% !important;
          min-height: 0 !important;
          height: auto !important;
          overflow: visible !important;
        }

        .alba-mobile-only {
          display: flex !important;
        }

        .alba-mobile-nav {
          position: sticky !important;
          top: 0 !important;
          z-index: 80 !important;
          gap: 7px !important;
          overflow-x: auto !important;
          padding: 8px !important;
          margin: 0 -2px 4px !important;
          border: 3px solid #111827 !important;
          border-radius: 18px !important;
          background: rgba(255,255,255,0.96) !important;
          box-shadow: 0 8px 0 rgba(17,24,39,0.10) !important;
          -webkit-overflow-scrolling: touch;
        }

        .alba-mobile-nav button,
        .alba-mobile-touch-controls button,
        .alba-mobile-street-list button {
          min-height: 48px !important;
          min-width: 74px !important;
          border: 3px solid #111827 !important;
          border-radius: 16px !important;
          background: #ffffff !important;
          color: #111827 !important;
          font-weight: 900 !important;
          font-size: 14px !important;
          box-shadow: 0 5px 0 rgba(17,24,39,0.14) !important;
        }

        .alba-room-scene,
        .alba-street-scene {
          height: auto !important;
          min-height: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 10px !important;
          padding: 12px !important;
          overflow: visible !important;
          border-radius: 20px !important;
        }

        .alba-room-scene > svg,
        .alba-street-scene > svg {
          position: relative !important;
          inset: auto !important;
          width: 100% !important;
          height: clamp(210px, 45vw, 360px) !important;
          min-height: 210px !important;
          border: 3px solid #111827 !important;
          border-radius: 18px !important;
          background: #f8fafc !important;
          overflow: hidden !important;
          z-index: 1 !important;
          order: 2 !important;
        }

        .alba-room-money,
        .alba-street-money,
        .alba-room-info,
        .alba-street-page-info,
        .alba-room-side-controls,
        .alba-room-nav,
        .alba-street-bottom-nav {
          position: relative !important;
          inset: auto !important;
          left: auto !important;
          right: auto !important;
          top: auto !important;
          bottom: auto !important;
          transform: none !important;
          width: 100% !important;
          max-width: none !important;
          z-index: 5 !important;
        }

        .alba-room-money,
        .alba-street-money {
          order: 0 !important;
          font-size: 16px !important;
          display: inline-flex !important;
          align-self: flex-start !important;
          width: auto !important;
          max-width: 100% !important;
        }

        .alba-room-info,
        .alba-street-page-info {
          order: 1 !important;
          font-size: 13px !important;
          text-align: left !important;
        }

        .alba-room-side-controls {
          display: none !important;
        }

        .alba-room-nav,
        .alba-street-bottom-nav {
          order: 4 !important;
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 8px !important;
        }

        .alba-street-page-arrow,
        .alba-street-buildings-row {
          display: none !important;
        }

        .alba-mobile-street-list {
          order: 3 !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
        }

        .alba-panel-scene,
        .alba-stock-scene,
        .alba-job-only-layout {
          height: auto !important;
          min-height: 100svh !important;
          overflow: visible !important;
        }

        .alba-job-stage {
          min-height: 360px !important;
          height: auto !important;
          overflow: visible !important;
        }

        .alba-job-footer {
          gap: 8px !important;
        }

        .alba-mobile-touch-controls {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 8px !important;
          width: 100% !important;
        }

        .alba-mobile-touch-controls.sorting,
        .alba-mobile-touch-controls.cashier {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }

        .alba-mobile-touch-controls.cafe,
        .alba-mobile-touch-controls.security {
          grid-template-columns: 1fr !important;
        }

        .alba-mobile-touch-controls .wide {
          grid-column: 1 / -1 !important;
        }
      }

      @media (max-width: 560px) {
        .alba-mobile-street-list,
        .alba-mobile-touch-controls.sorting,
        .alba-mobile-touch-controls.cashier {
          grid-template-columns: 1fr 1fr !important;
        }

        .alba-room-scene > svg,
        .alba-street-scene > svg {
          height: 220px !important;
        }
      }


    `}</style>
  );
}

export default function GamePage() {
  const [cash, setCash] = useState(10000);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaveLoaded, setIsSaveLoaded] = useState(false);
  const [isEconomyLoaded, setIsEconomyLoaded] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("저장 대기 중");

  const [lobbyView, setLobbyView] = useState<LobbyView>("room");
  const [streetPage, setStreetPage] = useState(0);
  const [phoneApp, setPhoneApp] = useState<"home" | "wallet" | "chart" | "income" | "buffs" | "collection">("home");
  const [currentTitleId, setCurrentTitleId] = useState<PlayerTitleId>("newbie");
  const [earnedTitleIds, setEarnedTitleIds] = useState<PlayerTitleId[]>(["newbie"]);
  const [ownedCertifications, setOwnedCertifications] = useState<CertificationId[]>([]);
  const [ownedItems, setOwnedItems] = useState<ShopItemId[]>([]);
  const [discoveredItems, setDiscoveredItems] = useState<ShopItemId[]>([]);
  const [equippedItems, setEquippedItems] = useState<ShopItemId[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<ShopItemId[]>([]);
  const [inventorySortMode, setInventorySortMode] = useState<ItemSortMode>("favorite");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [financeHistory, setFinanceHistory] = useState<FinanceHistoryPoint[]>([]);
  const [shopLevel, setShopLevel] = useState(1);
  const [shopPurchaseCount, setShopPurchaseCount] = useState(0);
  const [shopOffers, setShopOffers] = useState<ShopItem[]>(() => makeShopOffers(1));
  const [shopUpdatedAt, setShopUpdatedAt] = useState(new Date());
  const [shopCountdownSeconds, setShopCountdownSeconds] = useState(() => Math.ceil(getShopRemainingMs(new Date()) / 1000));
  const [shopSoldOfferKeys, setShopSoldOfferKeys] = useState<string[]>([]);
  const [gachaMachinePullCount, setGachaMachinePullCount] = useState(0);
  const [marketListings, setMarketListings] = useState<MarketListing[]>([]);
  const [sellItemId, setSellItemId] = useState("");
  const [sellPrice, setSellPrice] = useState("100000");
  const [sellQuantity, setSellQuantity] = useState("1");
  const [lottoTickets, setLottoTickets] = useState<LottoTicket[]>([]);
  const [lottoPurchaseDate, setLottoPurchaseDate] = useState(getTodayKey());
  const [lottoPurchaseCount, setLottoPurchaseCount] = useState(0);
  const [lottoPrice, setLottoPrice] = useState("5000");
  const [nickname, setNickname] = useState("우리집");
  const [nicknameDraft, setNicknameDraft] = useState("우리집");
  const [ownedNicknameColors, setOwnedNicknameColors] = useState<NicknameColorId[]>([]);
  const [selectedNicknameColorId, setSelectedNicknameColorId] = useState<NicknameColorId>(defaultNicknameColorTheme.id);
  const [ownedNicknameTags, setOwnedNicknameTags] = useState<NicknameTagId[]>([]);
  const [selectedNicknameTagId, setSelectedNicknameTagId] = useState<NicknameTagId>(defaultNicknameTag.id);
  const [ownedMainBackgrounds, setOwnedMainBackgrounds] = useState<MainBackgroundId[]>([]);
  const [selectedMainBackgroundId, setSelectedMainBackgroundId] = useState<MainBackgroundId>(defaultMainBackground.id);
  const [ownedMainCharacters, setOwnedMainCharacters] = useState<MainCharacterId[]>([]);
  const [selectedMainCharacterId, setSelectedMainCharacterId] = useState<MainCharacterId>(defaultMainCharacter.id);
  const [roomKind, setRoomKind] = useState<RoomKind>("basic");
  const [occupationId, setOccupationId] = useState<OccupationId>("unemployed");
  const [occupationLevel, setOccupationLevel] = useState(0);
  const [unlockedOccupations, setUnlockedOccupations] = useState<OccupationId[]>(["unemployed"]);
  const [careerBuildingId, setCareerBuildingId] = useState<CareerBuildingId>("company");
  const [selectedCareerRouteId, setSelectedCareerRouteId] = useState<OccupationId | null>(null);
  const [careerMiniGame, setCareerMiniGame] = useState<Occupation | null>(null);
  const [careerMiniGameScore, setCareerMiniGameScore] = useState(0);
  const [careerMiniGameStep, setCareerMiniGameStep] = useState(0);
  const [careerTypingPrompt, setCareerTypingPrompt] = useState("");
  const [careerTypingTimeLeft, setCareerTypingTimeLeft] = useState(0);
  const [careerTypingMistakes, setCareerTypingMistakes] = useState(0);
  const [careerKeySequence, setCareerKeySequence] = useState<string[]>([]);
  const [careerKeyIndex, setCareerKeyIndex] = useState(0);
  const [careerLogisticsBlocks, setCareerLogisticsBlocks] = useState<Array<{ column: number; row: number; label: string }>>([]);
  const [careerLogisticsColumn, setCareerLogisticsColumn] = useState(2);
  const [careerFinanceAnswer, setCareerFinanceAnswer] = useState("");
  const [careerIncomeCountdown, setCareerIncomeCountdown] = useState(180);
  const [sortingSuccessTotal, setSortingSuccessTotal] = useState(0);
  const [deliverySuccessTotal, setDeliverySuccessTotal] = useState(0);
  const [cashierSuccessTotal, setCashierSuccessTotal] = useState(0);
  const [cafeSuccessTotal, setCafeSuccessTotal] = useState(0);
  const [securitySuccessTotal, setSecuritySuccessTotal] = useState(0);
  const [rankingRows, setRankingRows] = useState<RankingRow[]>([]);
  const [rankingMode, setRankingMode] = useState<"netWorth" | "collection">("netWorth");
  const [rankingUpdatedAt, setRankingUpdatedAt] = useState(new Date());
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessageRow[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [stockRows, setStockRows] = useState<StockRow[]>([]);
  const [stockUpdatedAt, setStockUpdatedAt] = useState(new Date());
  const [stockCountdownMs, setStockCountdownMs] = useState(STOCK_INTERVAL_MS);
  const [isStockLoaded, setIsStockLoaded] = useState(false);
  const [bankDeposit, setBankDeposit] = useState(0);
  const [bankDepositPrincipal, setBankDepositPrincipal] = useState(0);
  const [bankSavings, setBankSavings] = useState(0);
  const [bankSavingsPrincipal, setBankSavingsPrincipal] = useState(0);
  const [bankLoan, setBankLoan] = useState(0);
  const [creditScore, setCreditScore] = useState(700);
  const [bankInput, setBankInput] = useState("10000");
  const [ownedEstates, setOwnedEstates] = useState<EstateId[]>([]);
  const [ownedBusinesses, setOwnedBusinesses] = useState<BusinessId[]>([]);
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>(() => makeNewsEvents());
  const [economyUpdatedAt, setEconomyUpdatedAt] = useState(new Date());
  const [inflationIndex, setInflationIndex] = useState(1);
  const [ownedInsurances, setOwnedInsurances] = useState<InsuranceId[]>([]);
  const [businessEmployees, setBusinessEmployees] = useState<Partial<Record<BusinessId, number>>>({});
  const [auctionDeals, setAuctionDeals] = useState<AuctionDeal[]>(() => makeAuctionDeals());

  const [slotStake, setSlotStake] = useState("1000");
  const [slotResult, setSlotResult] = useState<SlotResult | null>(null);
  const [isSlotPlaying, setIsSlotPlaying] = useState(false);
  const [slotReels, setSlotReels] = useState<string[]>(["7", "7", "7"]);
  const [slotLeverDown, setSlotLeverDown] = useState(false);
  const [casinoUsers, setCasinoUsers] = useState<CasinoUserRow[]>([]);
  const [pvpMatches, setPvpMatches] = useState<PvpMatchRow[]>([]);
  const [pvpStake, setPvpStake] = useState("1000");
  const [selectedOpponentId, setSelectedOpponentId] = useState("");
  const [pvpMessage, setPvpMessage] = useState("상대를 선택하고 판돈을 걸어 대전을 신청하세요.");
  const [activePvpMatch, setActivePvpMatch] = useState<PvpMatchRow | null>(null);
  const [pvpReactionState, setPvpReactionState] = useState<PvpReactionState>("idle");
  const [pvpReactionStartAt, setPvpReactionStartAt] = useState(0);
  const [pvpReactionScore, setPvpReactionScore] = useState(0);

  const [, setWarningCount] = useState(0);
  const [unpaidTax, setUnpaidTax] = useState(0);
  const [taxCountdown, setTaxCountdown] = useState(TAX_INTERVAL_SECONDS);
  const [taxTriggerCount, setTaxTriggerCount] = useState(0);

  const [selectedJobId, setSelectedJobId] = useState<JobId>("sorting");
  const [activeJobId, setActiveJobId] = useState<JobId | null>(null);
  const [message, setMessage] = useState("알바를 선택하고 시작하세요.");
  const [firedStamp, setFiredStamp] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState(1);
  const [difficultyNotice, setDifficultyNotice] = useState("");

  const [sortItem, setSortItem] = useState<SortItem>(makeSortItem(1, 1));
  const [sortItemId, setSortItemId] = useState(2);
  const [sortCombo, setSortCombo] = useState(0);
  const [sortMiss, setSortMiss] = useState(0);

  const [runnerLane, setRunnerLane] = useState(1);
  const [runnerDistance, setRunnerDistance] = useState(0);
  const [runnerObstacles, setRunnerObstacles] = useState<RunnerObstacle[]>([]);
  const [runnerCoins, setRunnerCoins] = useState<RunnerCoin[]>([]);
  const [runnerObjectId, setRunnerObjectId] = useState(1);
  const [runnerHitFlash, setRunnerHitFlash] = useState(false);
  const [runnerMiss, setRunnerMiss] = useState(0);

  const [cashierSequence, setCashierSequence] = useState<string[]>([]);
  const [cashierIndex, setCashierIndex] = useState(0);
  const [cashierSuccess, setCashierSuccess] = useState(0);
  const [cashierMiss, setCashierMiss] = useState(0);

  const [cafeFill, setCafeFill] = useState(0);
  const [cafeTargetStart, setCafeTargetStart] = useState(60);
  const [cafeTargetEnd, setCafeTargetEnd] = useState(74);
  const [cafeHolding, setCafeHolding] = useState(false);
  const [cafeSuccess, setCafeSuccess] = useState(0);
  const [cafeMiss, setCafeMiss] = useState(0);

  const [securitySignal, setSecuritySignal] = useState<SecuritySignal>("normal");
  const [securitySuccess, setSecuritySuccess] = useState(0);
  const [securityMiss, setSecurityMiss] = useState(0);
  const [securityRound, setSecurityRound] = useState(0);

  const firedLockRef = useRef(false);
  const runnerSpawnCooldownRef = useRef(0);
  const slotSpinIntervalRef = useRef<number | null>(null);
  const previousCashForStatsRef = useRef<number | null>(null);
  const globalStockSyncingRef = useRef(false);
  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId) ?? jobs[0], [selectedJobId]);
  const activeJob = useMemo(() => (activeJobId ? jobs.find((job) => job.id === activeJobId) ?? null : null), [activeJobId]);
  const occupation = occupationInfo[occupationId];
  const taxRate = getTaxRate(cash);
  const ownedInsuranceItems = useMemo(() => ownedInsurances.map((id) => insuranceItems.find((item) => item.id === id)).filter((item): item is InsuranceItem => Boolean(item)), [ownedInsurances]);
  const insuranceJobBonus = Math.min(0.18, ownedInsuranceItems.reduce((sum, item) => sum + (item.jobBonus ?? 0), 0));
  const insuranceTaxDiscount = Math.min(0.32, ownedInsuranceItems.reduce((sum, item) => sum + (item.taxDiscount ?? 0), 0));
  const insuranceBusinessBonus = Math.min(0.28, ownedInsuranceItems.reduce((sum, item) => sum + (item.businessBonus ?? 0), 0));
  const insuranceEstateBonus = Math.min(0.2, ownedInsuranceItems.reduce((sum, item) => sum + (item.estateBonus ?? 0), 0));
  const insuranceCasinoCashback = Math.min(0.22, ownedInsuranceItems.reduce((sum, item) => sum + (item.casinoCashback ?? 0), 0));
  const currentTaxDue = Math.floor(cash * getTaxRate(cash) * Math.max(0.55, 1 - insuranceTaxDiscount));
  const nextTax = currentTaxDue + unpaidTax;
  const currentTitle = playerTitles.find((title) => title.id === currentTitleId) ?? playerTitles[0];
  const activeNicknameColor = luxuryNicknameColors.find((theme) => theme.id === selectedNicknameColorId) ?? defaultNicknameColorTheme;
  const activeNicknameTag = luxuryNicknameTags.find((tag) => tag.id === selectedNicknameTagId) ?? defaultNicknameTag;
  const activeMainBackground = luxuryMainBackgrounds.find((background) => background.id === selectedMainBackgroundId) ?? defaultMainBackground;
  const activeMainCharacter = luxuryMainCharacters.find((character) => character.id === selectedMainCharacterId) ?? defaultMainCharacter;
  const equippedShopItems = useMemo(() => equippedItems.map((id) => shopItems.find((item) => item.id === id)).filter((item): item is ShopItem => Boolean(item)), [equippedItems]);
  const groupedOwnedItems = useMemo(() => sortGroupedShopItems(groupOwnedShopItems(ownedItems), inventorySortMode, favoriteItems), [ownedItems, inventorySortMode, favoriteItems]);
  const visibleInventoryItems = useMemo(() => groupedOwnedItems.filter((group) => !showFavoritesOnly || favoriteItems.includes(group.id)), [groupedOwnedItems, showFavoritesOnly, favoriteItems]);
  const itemSlotCount = currentTitleId === "treasureCollector" ? 2 : 1;
  const allIncomeBonus = equippedShopItems.reduce((sum, item) => sum + (item.bonusType === "allIncome" ? item.bonusValue : 0), currentTitleId === "relicOwner" ? 0.03 : 0);
  const businessItemBonus = equippedShopItems.reduce((sum, item) => sum + (item.bonusType === "businessIncome" ? item.bonusValue : 0), 0);
  const jobItemBonus = equippedShopItems.reduce((sum, item) => sum + (item.bonusType === "jobIncome" ? item.bonusValue : 0), 0) + (ownedCertifications.includes("office") ? 0.03 : 0) + (ownedCertifications.includes("logistics") ? 0.02 : 0) + (currentTitleId === "certifiedExpert" ? 0.02 : 0);
  const casinoLuckBonus = equippedShopItems.reduce((sum, item) => sum + (item.bonusType === "casinoLuck" ? item.bonusValue : 0), 0);
  const estateItemBonus = equippedShopItems.reduce((sum, item) => sum + (item.bonusType === "estateIncome" ? item.bonusValue : 0), 0);
  const bankInterestBonus = equippedShopItems.reduce((sum, item) => sum + (item.bonusType === "bankInterest" ? item.bonusValue : 0), 0);
  const lottoLuckBonus = equippedShopItems.reduce((sum, item) => sum + (item.bonusType === "lottoLuck" ? item.bonusValue : 0), 0);
  const gachaLuckBonus = equippedShopItems.reduce((sum, item) => sum + (item.bonusType === "gachaLuck" ? item.bonusValue : 0), 0);
  const taxShieldBonus = equippedShopItems.reduce((sum, item) => sum + (item.bonusType === "taxShield" ? item.bonusValue : 0), 0);
  const employeeEfficiencyBonus = equippedShopItems.reduce((sum, item) => sum + (item.bonusType === "employeeEfficiency" ? item.bonusValue : 0), 0);
  const totalIncomeMultiplier = 1 + allIncomeBonus;
  const jobIncomeMultiplier = 1 + allIncomeBonus + jobItemBonus + insuranceJobBonus;
  const stockAssetValue = useMemo(() => stockRows.reduce((sum, stock) => sum + stock.price * stock.owned, 0), [stockRows]);
  const estateAssetValue = useMemo(() => ownedEstates.reduce((sum, id) => sum + (estateItems.find((item) => item.id === id)?.price ?? 0), 0), [ownedEstates]);
  const businessAssetValue = useMemo(() => ownedBusinesses.reduce((sum, id) => sum + (businessItems.find((item) => item.id === id)?.price ?? 0), 0), [ownedBusinesses]);
  const estateIncomeEvery5Min = useMemo(
    () => ownedEstates.reduce((sum, id) => sum + (estateItems.find((item) => item.id === id)?.incomeEvery5Min ?? 0), 0),
    [ownedEstates]
  );
  const businessIncomeEvery30Sec = useMemo(
    () => ownedBusinesses.reduce((sum, id) => {
      const base = businessItems.find((item) => item.id === id)?.incomeEvery5Min ?? 0;
      const employeeLevel = businessEmployees[id] ?? 0;
      const plan = employeePlans.find((item) => item.level === employeeLevel) ?? employeePlans[0];
      return sum + Math.floor(base * (1 + plan.revenueBonusRate + businessItemBonus + allIncomeBonus + insuranceBusinessBonus + (ownedCertifications.includes("business") ? 0.05 : 0) + (ownedCertifications.includes("barista") ? 0.03 : 0)) * inflationIndex);
    }, 0),
    [ownedBusinesses, businessEmployees, inflationIndex, businessItemBonus, allIncomeBonus, insuranceBusinessBonus, ownedCertifications]
  );
  const employeePayrollEvery60Sec = useMemo(
    () => ownedBusinesses.reduce((sum, id) => {
      const employeeLevel = businessEmployees[id] ?? 0;
      const plan = employeePlans.find((item) => item.level === employeeLevel) ?? employeePlans[0];
      return sum + Math.floor(plan.payrollEvery60Sec * Math.max(0.55, 1 - employeeEfficiencyBonus));
    }, 0),
    [ownedBusinesses, businessEmployees, employeeEfficiencyBonus]
  );
  const insurancePremiumEvery5Min = useMemo(
    () => ownedInsurances.reduce((sum, id) => sum + (insuranceItems.find((item) => item.id === id)?.premiumEvery5Min ?? 0), 0),
    [ownedInsurances]
  );
  const itemAssetValue = ownedItems.reduce((sum, id) => sum + (shopItems.find((item) => item.id === id)?.price ?? 0), 0);
  const netWorth = cash + bankDeposit + bankSavings + stockAssetValue + estateAssetValue + businessAssetValue + itemAssetValue - bankLoan - unpaidTax;
  const careerRouteOptions = getCareerRouteOptions(careerBuildingId);
  const currentCareerQuest = getCurrentCareerQuest(careerBuildingId);
  const currentQuestCareer = currentCareerQuest ? occupationInfo[currentCareerQuest.targetId] : null;
  const savingsCapRemaining = Math.max(0, BANK_SAVINGS_CAP - bankSavings);
  const savingsCapProgress = Math.min(100, Math.floor((bankSavings / BANK_SAVINGS_CAP) * 100));
  const conditionUnlockedTitles = useMemo(
    () => getUnlockedTitles({ cash, stockRows, bankDeposit, bankSavings, bankLoan, creditScore, ownedEstates, ownedBusinesses, ownedInsurances, businessEmployees, unpaidTax, netWorth, sortingSuccessTotal, deliverySuccessTotal, cashierSuccessTotal, cafeSuccessTotal, securitySuccessTotal, ownedCertifications, ownedItems, discoveredItems, shopPurchaseCount, gachaMachinePullCount, lottoPurchaseCount }),
    [cash, stockRows, bankDeposit, bankSavings, bankLoan, creditScore, ownedEstates, ownedBusinesses, ownedInsurances, businessEmployees, unpaidTax, netWorth, sortingSuccessTotal, deliverySuccessTotal, cashierSuccessTotal, cafeSuccessTotal, securitySuccessTotal, ownedCertifications, ownedItems, discoveredItems, shopPurchaseCount, gachaMachinePullCount, lottoPurchaseCount]
  );
  const unlockedTitles = useMemo(() => {
    const unlockedIdSet = new Set<PlayerTitleId>(["newbie", ...earnedTitleIds, ...conditionUnlockedTitles.map((title) => title.id)]);
    return playerTitles.filter((title) => unlockedIdSet.has(title.id));
  }, [earnedTitleIds, conditionUnlockedTitles]);

  useEffect(() => {
    const conditionIds = conditionUnlockedTitles.map((title) => title.id);
    const nextIds = Array.from(new Set<PlayerTitleId>(["newbie", ...earnedTitleIds, ...conditionIds]));
    const hasNewTitle = nextIds.some((id) => !earnedTitleIds.includes(id));

    if (hasNewTitle) {
      const newlyUnlocked = nextIds.filter((id) => !earnedTitleIds.includes(id));
      setEarnedTitleIds(nextIds);
      if (userId) persistEarnedTitleIds(userId, nextIds);

      newlyUnlocked.forEach((titleId) => {
        const title = playerTitles.find((item) => item.id === titleId);
        if (userId && title?.hidden) {
          void sendGlobalChatMessage(`🏆 ${nickname}님이 비공개 칭호 [${title.name}]을 해금했습니다! 이제 조건이 공개됩니다.`, "system");
        }
      });
    }
  }, [conditionUnlockedTitles, earnedTitleIds, nickname, userId]);


  useEffect(() => {
    if (careerRouteOptions.length === 0) {
      if (selectedCareerRouteId !== null) setSelectedCareerRouteId(null);
      return;
    }

    if (!selectedCareerRouteId || !careerRouteOptions.some((quest) => quest.targetId === selectedCareerRouteId)) {
      setSelectedCareerRouteId(careerRouteOptions[0].targetId);
    }
  }, [careerBuildingId, occupationId, selectedCareerRouteId, careerRouteOptions]);

  useEffect(() => {
    async function loadSave() {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        window.location.href = "/login";
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("game_saves")
        .select("cash, warning_count, unpaid_tax, sorting_success_total, delivery_success_total, cashier_success_total, cafe_success_total, security_success_total")
        .eq("user_id", user.id)
        .maybeSingle<SaveRow>();

      if (error) {
        console.error("저장 데이터 불러오기 실패:", error.message);
        setMessage("저장 데이터를 불러오지 못했습니다. 새로고침하거나 Supabase 정책을 확인해주세요.");
        setSaveMessage("불러오기 실패");
        setIsSaveLoaded(true);
        return;
      }

      if (!data) {
        const { error: insertError } = await supabase.from("game_saves").insert({
          user_id: user.id,
          cash: 10000,
          warning_count: 0,
          unpaid_tax: 0,
          sorting_success_total: 0,
          delivery_success_total: 0,
          cashier_success_total: 0,
          cafe_success_total: 0,
          security_success_total: 0,
          updated_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error("초기 저장 데이터 생성 실패:", insertError.message);
          setMessage("초기 저장 데이터를 만들지 못했습니다. Supabase RLS 정책을 확인해주세요.");
          setSaveMessage("저장 생성 실패");
        } else {
          setSaveMessage("새 저장 생성 완료");
        }

        setCash(10000);
        setWarningCount(0);
        setUnpaidTax(0);
        setIsSaveLoaded(true);
        return;
      }

      setCash(Number(data.cash));
      setWarningCount(0);
      setUnpaidTax(Number(data.unpaid_tax));
      setSortingSuccessTotal(Number(data.sorting_success_total ?? 0));
      setDeliverySuccessTotal(Number(data.delivery_success_total ?? 0));
      setCashierSuccessTotal(Number(data.cashier_success_total ?? 0));
      setCafeSuccessTotal(Number(data.cafe_success_total ?? 0));
      setSecuritySuccessTotal(Number(data.security_success_total ?? 0));
      setSaveMessage("저장 불러오기 완료");
      setIsSaveLoaded(true);
    }

    loadSave();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const currentUserId = userId;
    setIsProfileLoaded(false);

    async function loadProfilePreferences() {
      const savedNickname = window.localStorage.getItem(`alba-money-nickname-${currentUserId}`);
      const savedRoomKind = window.localStorage.getItem(`alba-money-room-${currentUserId}`) as RoomKind | null;
      const savedOccupationId = window.localStorage.getItem(`alba-money-occupation-${currentUserId}`) as OccupationId | null;
      const savedUnlocked = window.localStorage.getItem(`alba-money-unlocked-occupations-${currentUserId}`);
      const savedTitle = window.localStorage.getItem(`alba-money-title-${currentUserId}`) as PlayerTitleId | null;
      const cachedTitleIds = getStoredEarnedTitleIds(currentUserId);
      setEarnedTitleIds((prev) => Array.from(new Set<PlayerTitleId>(["newbie", ...prev, ...cachedTitleIds])));

      if (savedNickname) {
        setNickname(savedNickname);
        setNicknameDraft(savedNickname);
      }

      if (savedRoomKind && savedRoomKind in roomInfo) {
        setRoomKind(savedRoomKind);
      }

      const careerResetDone = window.localStorage.getItem(`alba-money-career-reset-${currentUserId}`) === CAREER_RESET_VERSION;
      const shouldForceCareerReset = !careerResetDone;
      if (shouldForceCareerReset) {
        setOccupationId("unemployed");
        setOccupationLevel(0);
        setUnlockedOccupations(["unemployed"]);
        window.localStorage.setItem(`alba-money-occupation-${currentUserId}`, "unemployed");
        window.localStorage.setItem(`alba-money-unlocked-occupations-${currentUserId}`, JSON.stringify(["unemployed"]));
        window.localStorage.setItem(`alba-money-career-reset-${currentUserId}`, CAREER_RESET_VERSION);
        void saveProfilePatch({ occupation_id: "unemployed", occupation_level: 0, unlocked_occupations: ["unemployed"] });
      } else {
        if (savedOccupationId && savedOccupationId in occupationInfo) {
          setOccupationId(savedOccupationId);
        }

        if (savedUnlocked) {
          setUnlockedOccupations(normalizeUnlockedOccupations(safeParseOccupationList(savedUnlocked)));
        }
      }

      if (savedTitle && playerTitles.some((title) => title.id === savedTitle)) {
        setCurrentTitleId(savedTitle);
        setEarnedTitleIds((prev) => Array.from(new Set<PlayerTitleId>(["newbie", ...prev, savedTitle])));
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from(PROFILE_TABLE)
        .select("id, nickname, room_kind, occupation_id, occupation_level, unlocked_occupations, current_title, net_worth")
        .eq("id", currentUserId)
        .maybeSingle<ProfileRow>();

      if (error) {
        console.warn("프로필 테이블을 읽지 못했습니다. localStorage 값을 사용합니다:", error.message);
        return;
      }

      if (data?.nickname) {
        setNickname(data.nickname);
        setNicknameDraft(data.nickname);
        window.localStorage.setItem(`alba-money-nickname-${currentUserId}`, data.nickname);
      }

      if (data?.room_kind && data.room_kind in roomInfo) {
        const nextRoomKind = data.room_kind as RoomKind;
        setRoomKind(nextRoomKind);
        window.localStorage.setItem(`alba-money-room-${currentUserId}`, nextRoomKind);
      }

      const careerResetDoneAfterRemote = window.localStorage.getItem(`alba-money-career-reset-${currentUserId}`) === CAREER_RESET_VERSION;
      if (!shouldForceCareerReset && careerResetDoneAfterRemote && data?.occupation_id && data.occupation_id in occupationInfo) {
        const nextOccupationId = data.occupation_id as OccupationId;
        setOccupationId(nextOccupationId);
        window.localStorage.setItem(`alba-money-occupation-${currentUserId}`, nextOccupationId);
      }

      if (!shouldForceCareerReset && careerResetDoneAfterRemote && typeof data?.occupation_level === "number") {
        setOccupationLevel(data.occupation_level);
      }

      if (data?.current_title && playerTitles.some((title) => title.id === data.current_title)) {
        setCurrentTitleId(data.current_title);
        setEarnedTitleIds((prev) => Array.from(new Set<PlayerTitleId>(["newbie", ...prev, data.current_title as PlayerTitleId])));
        window.localStorage.setItem(`alba-money-title-${currentUserId}`, data.current_title);
      }

      const rawUnlocked = data?.unlocked_occupations;
      const parsedUnlocked = typeof rawUnlocked === "string" ? safeParseOccupationList(rawUnlocked) : rawUnlocked;
      if (!shouldForceCareerReset && careerResetDoneAfterRemote && Array.isArray(parsedUnlocked)) {
        const nextUnlocked = normalizeUnlockedOccupations(parsedUnlocked);
        setUnlockedOccupations(nextUnlocked);
        window.localStorage.setItem(`alba-money-unlocked-occupations-${currentUserId}`, JSON.stringify(nextUnlocked));
      }
      setIsProfileLoaded(true);
    }

    void loadProfilePreferences();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    setIsEconomyLoaded(false);
    const localStoredEconomy = window.localStorage.getItem(`alba-money-economy-${userId}`);
    let stored = localStoredEconomy;

    const loadRemoteEconomy = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from(ECONOMY_TABLE)
          .select("data")
          .eq("user_id", userId)
          .maybeSingle<{ data: string | Record<string, unknown> | null }>();

        if (!error && data?.data) {
          const remoteStoredEconomy = typeof data.data === "string" ? data.data : JSON.stringify(data.data);
          stored = mergeEconomySavePayloads(localStoredEconomy, remoteStoredEconomy);
          if (stored) window.localStorage.setItem(`alba-money-economy-${userId}`, stored);
        }
      } catch {
        // Supabase economy table may not exist yet. Local backup still works.
      }
    };

    void loadRemoteEconomy().finally(() => {
    if (!stored) {
      setLottoPurchaseDate(getTodayKey());
      setLottoPurchaseCount(0);
      setLottoTickets([]);
      setIsEconomyLoaded(true);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as { bankDeposit?: number; bankDepositPrincipal?: number; bankSavings?: number; bankSavingsPrincipal?: number; bankLoan?: number; creditScore?: number; ownedEstates?: EstateId[]; ownedBusinesses?: BusinessId[]; newsEvents?: NewsEvent[]; economyUpdatedAt?: string; inflationIndex?: number; ownedInsurances?: InsuranceId[]; businessEmployees?: Partial<Record<BusinessId, number>>; auctionDeals?: AuctionDeal[]; ownedCertifications?: CertificationId[]; ownedItems?: ShopItemId[]; discoveredItems?: ShopItemId[]; equippedItems?: ShopItemId[]; favoriteItems?: ShopItemId[]; inventorySortMode?: ItemSortMode; shopLevel?: number; shopPurchaseCount?: number; shopOffers?: ShopItem[]; shopUpdatedAt?: string; shopSoldOfferKeys?: string[]; gachaMachinePullCount?: number; announcedSecretTitles?: PlayerTitleId[]; earnedTitleIds?: PlayerTitleId[]; lottoTickets?: LottoTicket[]; lottoPurchaseDate?: string; lottoPurchaseCount?: number; totalIncome?: number; totalExpense?: number; financeHistory?: FinanceHistoryPoint[]; ownedNicknameColors?: NicknameColorId[]; selectedNicknameColorId?: NicknameColorId; ownedNicknameTags?: NicknameTagId[]; selectedNicknameTagId?: NicknameTagId; ownedMainBackgrounds?: MainBackgroundId[]; selectedMainBackgroundId?: MainBackgroundId; ownedMainCharacters?: MainCharacterId[]; selectedMainCharacterId?: MainCharacterId };
      const loadedDeposit = Number(parsed.bankDeposit ?? 0);
      const loadedSavings = Number(parsed.bankSavings ?? 0);
      setBankDeposit(loadedDeposit);
      setBankDepositPrincipal(Number(parsed.bankDepositPrincipal ?? loadedDeposit));
      setBankSavings(loadedSavings);
      setBankSavingsPrincipal(Number(parsed.bankSavingsPrincipal ?? loadedSavings));
      setBankLoan(Number(parsed.bankLoan ?? 0));
      setCreditScore(Number(parsed.creditScore ?? 700));
      if (Array.isArray(parsed.ownedEstates)) setOwnedEstates(parsed.ownedEstates.filter((id): id is EstateId => estateItems.some((item) => item.id === id)));
      if (Array.isArray(parsed.ownedBusinesses)) setOwnedBusinesses(parsed.ownedBusinesses.filter((id): id is BusinessId => businessItems.some((item) => item.id === id)));
      if (Array.isArray(parsed.newsEvents) && parsed.newsEvents.length > 0) setNewsEvents(parsed.newsEvents);
      if (typeof parsed.inflationIndex === "number") setInflationIndex(Math.max(0.8, Math.min(2.5, parsed.inflationIndex)));
      if (Array.isArray(parsed.ownedInsurances)) setOwnedInsurances(parsed.ownedInsurances.filter((id): id is InsuranceId => insuranceItems.some((item) => item.id === id)));
      if (parsed.businessEmployees && typeof parsed.businessEmployees === "object") setBusinessEmployees(parsed.businessEmployees);
      if (Array.isArray(parsed.auctionDeals) && parsed.auctionDeals.length > 0) setAuctionDeals(parsed.auctionDeals);
      if (Array.isArray(parsed.ownedCertifications)) setOwnedCertifications(parsed.ownedCertifications.filter((id): id is CertificationId => certifications.some((item) => item.id === id)));
      if (Array.isArray(parsed.ownedItems)) {
        const loadedOwned = parsed.ownedItems.filter((id): id is ShopItemId => shopItems.some((item) => item.id === id));
        setOwnedItems(loadedOwned);
        if (Array.isArray(parsed.discoveredItems)) {
          setDiscoveredItems(parsed.discoveredItems.filter((id): id is ShopItemId => shopItems.some((item) => item.id === id)));
        } else {
          setDiscoveredItems(Array.from(new Set(loadedOwned)));
        }
      } else if (Array.isArray(parsed.discoveredItems)) {
        setDiscoveredItems(parsed.discoveredItems.filter((id): id is ShopItemId => shopItems.some((item) => item.id === id)));
      }
      if (Array.isArray(parsed.equippedItems)) setEquippedItems(parsed.equippedItems.filter((id): id is ShopItemId => shopItems.some((item) => item.id === id)));
      if (Array.isArray(parsed.favoriteItems)) setFavoriteItems(parsed.favoriteItems.filter((id): id is ShopItemId => shopItems.some((item) => item.id === id)));
      if (Array.isArray(parsed.earnedTitleIds)) {
        const loadedEarnedTitleIds = normalizePlayerTitleIdList(parsed.earnedTitleIds);
        setEarnedTitleIds((prev) => Array.from(new Set<PlayerTitleId>(["newbie", ...prev, ...loadedEarnedTitleIds])));
      }
      if (Array.isArray(parsed.announcedSecretTitles)) {
        const loadedAnnouncedSecretTitles = normalizePlayerTitleIdList(parsed.announcedSecretTitles);
        setEarnedTitleIds((prev) => Array.from(new Set<PlayerTitleId>(["newbie", ...prev, ...loadedAnnouncedSecretTitles])));
      }
      if (parsed.inventorySortMode && ["favorite", "rarity", "priceDesc", "priceAsc", "name", "count"].includes(parsed.inventorySortMode)) setInventorySortMode(parsed.inventorySortMode);
      if (typeof parsed.shopLevel === "number") setShopLevel(parsed.shopLevel);
      if (typeof parsed.shopPurchaseCount === "number") setShopPurchaseCount(parsed.shopPurchaseCount);
      if (Array.isArray(parsed.shopOffers) && parsed.shopOffers.length > 0) setShopOffers(parsed.shopOffers);
      if (parsed.shopUpdatedAt) setShopUpdatedAt(new Date(parsed.shopUpdatedAt));
      if (Array.isArray(parsed.shopSoldOfferKeys)) setShopSoldOfferKeys(parsed.shopSoldOfferKeys.filter((key): key is string => typeof key === "string"));
      if (typeof parsed.totalIncome === "number") setTotalIncome(parsed.totalIncome);
      if (typeof parsed.totalExpense === "number") setTotalExpense(parsed.totalExpense);
      if (Array.isArray(parsed.financeHistory)) setFinanceHistory(parsed.financeHistory.slice(-18));
      if (Array.isArray(parsed.ownedNicknameColors)) setOwnedNicknameColors(parsed.ownedNicknameColors.filter((id): id is NicknameColorId => luxuryNicknameColors.some((item) => item.id === id)));
      if (typeof parsed.selectedNicknameColorId === "string" && (parsed.selectedNicknameColorId === defaultNicknameColorTheme.id || luxuryNicknameColors.some((item) => item.id === parsed.selectedNicknameColorId))) setSelectedNicknameColorId(parsed.selectedNicknameColorId);
      if (Array.isArray(parsed.ownedNicknameTags)) setOwnedNicknameTags(parsed.ownedNicknameTags.filter((id): id is NicknameTagId => luxuryNicknameTags.some((item) => item.id === id)));
      if (typeof parsed.selectedNicknameTagId === "string" && (parsed.selectedNicknameTagId === defaultNicknameTag.id || luxuryNicknameTags.some((item) => item.id === parsed.selectedNicknameTagId))) setSelectedNicknameTagId(parsed.selectedNicknameTagId);
      if (Array.isArray(parsed.ownedMainBackgrounds)) setOwnedMainBackgrounds(parsed.ownedMainBackgrounds.filter((id): id is MainBackgroundId => luxuryMainBackgrounds.some((item) => item.id === id)));
      if (typeof parsed.selectedMainBackgroundId === "string" && (parsed.selectedMainBackgroundId === defaultMainBackground.id || luxuryMainBackgrounds.some((item) => item.id === parsed.selectedMainBackgroundId))) setSelectedMainBackgroundId(parsed.selectedMainBackgroundId);
      if (Array.isArray(parsed.ownedMainCharacters)) setOwnedMainCharacters(parsed.ownedMainCharacters.filter((id): id is MainCharacterId => luxuryMainCharacters.some((item) => item.id === id)));
      if (typeof parsed.selectedMainCharacterId === "string" && (parsed.selectedMainCharacterId === defaultMainCharacter.id || luxuryMainCharacters.some((item) => item.id === parsed.selectedMainCharacterId))) setSelectedMainCharacterId(parsed.selectedMainCharacterId);
      if (Array.isArray(parsed.lottoTickets)) setLottoTickets(parsed.lottoTickets.filter(isValidLottoTicket).slice(-12));
      const storedLottoDate = typeof parsed.lottoPurchaseDate === "string" ? parsed.lottoPurchaseDate : getTodayKey();
      if (storedLottoDate === getTodayKey()) {
        setLottoPurchaseDate(storedLottoDate);
        setLottoPurchaseCount(Number(parsed.lottoPurchaseCount ?? 0));
      } else {
        setLottoPurchaseDate(getTodayKey());
        setLottoPurchaseCount(0);
      }
      if (parsed.economyUpdatedAt) setEconomyUpdatedAt(new Date(parsed.economyUpdatedAt));
    } catch (error) {
      console.warn("경제 데이터 불러오기 실패:", error);
    } finally {
      setIsEconomyLoaded(true);
    }
    });
  }, [userId]);

  useEffect(() => {
    if (!userId || !isSaveLoaded || !isEconomyLoaded || !isProfileLoaded) return;

    const economyData = {
      bankDeposit,
      bankDepositPrincipal,
      bankSavings,
      bankSavingsPrincipal,
      bankLoan,
      creditScore,
      ownedEstates,
      ownedBusinesses,
      newsEvents,
      inflationIndex,
      ownedInsurances,
      businessEmployees,
      auctionDeals,
      ownedCertifications,
      ownedItems,
      discoveredItems,
      equippedItems,
      favoriteItems,
      inventorySortMode,
      shopLevel,
      shopPurchaseCount,
      shopOffers,
      shopUpdatedAt: shopUpdatedAt.toISOString(),
      shopSoldOfferKeys,
      gachaMachinePullCount,
      lottoTickets,
      lottoPurchaseDate,
      lottoPurchaseCount,
      totalIncome,
      totalExpense,
      financeHistory,
      ownedNicknameColors,
      selectedNicknameColorId,
      ownedNicknameTags,
      selectedNicknameTagId,
      ownedMainBackgrounds,
      selectedMainBackgroundId,
      ownedMainCharacters,
      selectedMainCharacterId,
      economyUpdatedAt: economyUpdatedAt.toISOString(),
      earnedTitleIds,
    };
    const economyPayload = JSON.stringify(economyData);

    window.localStorage.setItem(`alba-money-economy-${userId}`, economyPayload);
    persistEarnedTitleIds(userId, earnedTitleIds);

    const supabase = createClient();
    supabase
      .from(ECONOMY_TABLE)
      .upsert(
        {
          user_id: userId,
          data: economyData,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .then(({ error }) => {
        if (error) console.warn("경제 데이터 Supabase 저장 실패. localStorage에는 저장되었습니다:", error.message);
      });
  }, [userId, isSaveLoaded, isEconomyLoaded, isProfileLoaded, bankDeposit, bankDepositPrincipal, bankSavings, bankSavingsPrincipal, bankLoan, creditScore, ownedEstates, ownedBusinesses, newsEvents, inflationIndex, ownedInsurances, businessEmployees, auctionDeals, ownedCertifications, ownedItems, discoveredItems, equippedItems, favoriteItems, inventorySortMode, shopLevel, shopPurchaseCount, shopOffers, shopUpdatedAt, shopSoldOfferKeys, gachaMachinePullCount, lottoTickets, lottoPurchaseDate, lottoPurchaseCount, totalIncome, totalExpense, financeHistory, ownedNicknameColors, selectedNicknameColorId, ownedNicknameTags, selectedNicknameTagId, ownedMainBackgrounds, selectedMainBackgroundId, ownedMainCharacters, selectedMainCharacterId, economyUpdatedAt, earnedTitleIds]);

  useEffect(() => {
    if (!isSaveLoaded) return;

    const timer = window.setInterval(() => {
      setBankDeposit((current) => {
        const next = Math.floor(current * (1 + BANK_DEPOSIT_RATE * (1 + bankInterestBonus)));
        const gain = Math.max(0, next - current);
        if (gain > 0) setTotalIncome((value) => value + gain);
        if (gain > 0) setMessage(`🏦 목돈 예금 이자 ${gain.toLocaleString()}원이 15분 정산으로 들어왔습니다.`);
        return next;
      });
    }, 15 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, [isSaveLoaded, bankInterestBonus]);

  useEffect(() => {
    if (!isSaveLoaded) return;

    const timer = window.setInterval(() => {
      setBankSavings((current) => {
        if (current >= BANK_SAVINGS_CAP) return current;
        const next = Math.min(BANK_SAVINGS_CAP, Math.floor(current * (1 + BANK_SAVINGS_RATE * (1 + bankInterestBonus))));
        const gain = Math.max(0, next - current);
        if (gain > 0) setTotalIncome((value) => value + gain);
        if (gain > 0) setMessage(`🏦 시드 적금 이자 ${gain.toLocaleString()}원이 30분 정산으로 들어왔습니다. 적금은 ${BANK_SAVINGS_CAP.toLocaleString()}원까지만 불어납니다.`);
        return next;
      });
    }, 30 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, [isSaveLoaded, bankInterestBonus]);

  useEffect(() => {
    if (!isSaveLoaded) return;

    const timer = window.setInterval(() => {
      setBankLoan((current) => {
        const next = Math.floor(current * (1 + BANK_LOAN_RATE));
        const expense = Math.max(0, next - current);
        if (expense > 0) setTotalExpense((value) => value + expense);
        return next;
      });
      setInflationIndex((current) => Math.min(2.5, Number((current * 1.003).toFixed(4))));
      const premium = Math.floor(insurancePremiumEvery5Min * Math.max(0.65, 1 - taxShieldBonus));
      if (premium > 0) {
        setCash((money) => Math.max(0, money - premium));
        setMessage(`🛡️ 보험료 ${premium.toLocaleString()}원이 납부되었습니다.`);
      }
    }, 10 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, [isSaveLoaded, insurancePremiumEvery5Min, inflationIndex, taxShieldBonus]);

  useEffect(() => {
    if (!isSaveLoaded || estateIncomeEvery5Min <= 0) return;

    const timer = window.setInterval(() => {
      const adjustedEstateIncome = Math.floor(estateIncomeEvery5Min * inflationIndex * totalIncomeMultiplier * (1 + estateItemBonus + insuranceEstateBonus));
      if (adjustedEstateIncome <= 0) return;
      setCash((money) => money + adjustedEstateIncome);
      setTotalIncome((income) => income + adjustedEstateIncome);
      setMessage(`🏘️ 부동산 임대 수익 +${adjustedEstateIncome.toLocaleString()}원 / 30초`);
    }, 30 * 1000);

    return () => window.clearInterval(timer);
  }, [isSaveLoaded, estateIncomeEvery5Min, inflationIndex, totalIncomeMultiplier, estateItemBonus, insuranceEstateBonus]);

  useEffect(() => {
    if (!isSaveLoaded || businessIncomeEvery30Sec <= 0) return;

    const timer = window.setInterval(() => {
      setCash((money) => money + businessIncomeEvery30Sec);
      setMessage(`🧾 사업 매출 +${businessIncomeEvery30Sec.toLocaleString()}원`);
    }, 30 * 1000);

    return () => window.clearInterval(timer);
  }, [isSaveLoaded, businessIncomeEvery30Sec]);

  useEffect(() => {
    if (!isSaveLoaded || employeePayrollEvery60Sec <= 0) return;

    const timer = window.setInterval(() => {
      setCash((money) => Math.max(0, money - employeePayrollEvery60Sec));
      setMessage(`👥 직원 인건비 -${employeePayrollEvery60Sec.toLocaleString()}원`);
    }, 60 * 1000);

    return () => window.clearInterval(timer);
  }, [isSaveLoaded, employeePayrollEvery60Sec]);

  useEffect(() => {
    if (!isSaveLoaded || !isStockLoaded) return;

    const timer = window.setInterval(() => {
      void syncGlobalStockMarket();
    }, 30 * 1000);

    return () => window.clearInterval(timer);
  }, [isSaveLoaded, isStockLoaded]);

  useEffect(() => {
    if (!userId || !isSaveLoaded) return;

    refreshRanking();

    const supabase = createClient();
    const rankingChannel = supabase
      .channel("game-ranking-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_saves" },
        () => {
          refreshRanking();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: PROFILE_TABLE },
        () => {
          refreshRanking();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: ECONOMY_TABLE },
        () => {
          refreshRanking();
        }
      )
      .subscribe();

    const timer = window.setInterval(() => {
      refreshRanking();
    }, 60 * 1000);

    return () => {
      window.clearInterval(timer);
      void supabase.removeChannel(rankingChannel);
    };
  }, [userId, isSaveLoaded, nickname, cash, occupationId, rankingMode, netWorth, discoveredItems.length]);

  useEffect(() => {
    if (lobbyView === "ranking") refreshRanking();
    if (lobbyView === "casino") refreshCasinoData();
  }, [lobbyView, rankingMode, selectedNicknameColorId]);

  useEffect(() => {
    if (!userId || !isSaveLoaded) return;

    refreshCasinoData();

    const supabase = createClient();
    const casinoChannel = supabase
      .channel("game-casino-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "game_pvp_matches" }, () => {
        refreshCasinoData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "game_saves" }, () => {
        refreshCasinoData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: PROFILE_TABLE }, () => {
        refreshCasinoData();
      })
      .subscribe();

    const timer = window.setInterval(() => {
      if (lobbyView === "casino") refreshCasinoData();
    }, 30 * 1000);

    return () => {
      window.clearInterval(timer);
      void supabase.removeChannel(casinoChannel);
    };
  }, [userId, isSaveLoaded, lobbyView, nickname, cash, occupationId]);

  useEffect(() => {
    if (!careerMiniGame) return;

    if (careerTypingTimeLeft <= 0) {
      void failCareerMiniGame("⏱️ 제한 시간이 끝났습니다. 다시 도전해보세요.");
      return;
    }

    const timer = window.setTimeout(() => {
      setCareerTypingTimeLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [careerMiniGame, careerTypingTimeLeft]);

  useEffect(() => {
    if (!careerMiniGame) return;
    const activeCareerMiniGame = careerMiniGame;

    function handleCareerKeyDown(event: KeyboardEvent) {
      const mode = getCareerGameMode(activeCareerMiniGame);
      const key = event.key.toUpperCase();

      if ((mode === "office" || mode === "rhythm") && careerKeySequence.includes(key)) {
        event.preventDefault();
        void pressCareerSequenceKey(key);
      }

      if (mode === "logistics") {
        if (event.key === "ArrowLeft" || key === "A") {
          event.preventDefault();
          setCareerLogisticsColumn((current) => Math.max(0, current - 1));
        }
        if (event.key === "ArrowRight" || key === "D") {
          event.preventDefault();
          setCareerLogisticsColumn((current) => Math.min(5, current + 1));
        }
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          void placeCareerLogisticsBlock();
        }
      }
    }

    window.addEventListener("keydown", handleCareerKeyDown);
    return () => window.removeEventListener("keydown", handleCareerKeyDown);
  }, [careerMiniGame, careerKeySequence, careerKeyIndex, careerLogisticsColumn, careerLogisticsBlocks]);

  useEffect(() => {
    if (!userId) return;
    const currentUserId = userId;

    let cancelled = false;

    async function loadStocks() {
      setIsStockLoaded(false);
      const storageKey = `alba-money-stocks-${currentUserId}`;
      let savedOwnedRows: StockRow[] | null = null;

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from(STOCK_TABLE)
          .select("rows, updated_at")
          .eq("user_id", currentUserId)
          .maybeSingle<StockSaveRow>();

        if (!error && data?.rows) {
          const rows = typeof data.rows === "string" ? JSON.parse(data.rows) : data.rows;
          if (Array.isArray(rows) && rows.length > 0) {
            savedOwnedRows = normalizeStockRows(rows, currentUserId);
          }
        } else if (error) {
          console.warn("주식 보유량 저장 테이블을 읽지 못했습니다. localStorage를 사용합니다:", error.message);
        }
      } catch (error) {
        console.warn("주식 보유량 저장 데이터를 불러오지 못했습니다. localStorage를 사용합니다:", error);
      }

      const saved = window.localStorage.getItem(storageKey);
      if (!savedOwnedRows && saved) {
        try {
          const parsed = JSON.parse(saved) as { rows?: StockRow[]; updatedAt?: string };
          if (Array.isArray(parsed.rows) && parsed.rows.length > 0) {
            savedOwnedRows = normalizeStockRows(parsed.rows, currentUserId);
          }
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }

      const globalMarket = await fetchGlobalStockMarket();
      const globalRows = globalMarket?.rows ?? makeInitialStocks("global-market").map((row) => ({ ...row, owned: 0 }));
      const nextRows = mergeGlobalPricesWithOwned(globalRows, savedOwnedRows ?? []);

      if (cancelled) return;
      setStockRows(nextRows);
      setStockUpdatedAt(globalMarket?.updatedAt ?? new Date());
      setStockCountdownMs(getStockRemainingMs(globalMarket?.updatedAt ?? new Date()));
      if (globalMarket?.newsEvents?.length) {
        setNewsEvents(globalMarket.newsEvents);
        setEconomyUpdatedAt(globalMarket.newsUpdatedAt ?? new Date());
      }
      setIsStockLoaded(true);
    }

    loadStocks();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId || !isStockLoaded || stockRows.length === 0) return;
    const currentUserId = userId;

    const ownedOnlyRows = extractOwnedStockRows(stockRows);
    const payload = { rows: ownedOnlyRows, updatedAt: stockUpdatedAt.toISOString() };
    window.localStorage.setItem(`alba-money-stocks-${currentUserId}`, JSON.stringify(payload));

    const timer = window.setTimeout(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.from(STOCK_TABLE).upsert(
          {
            user_id: currentUserId,
            rows: ownedOnlyRows,
            updated_at: stockUpdatedAt.toISOString(),
          },
          { onConflict: "user_id" }
        );

        if (error) {
          console.warn("주식 저장 실패. localStorage에는 저장되었습니다:", error.message);
        }
      } catch (error) {
        console.warn("주식 저장 실패. localStorage에는 저장되었습니다:", error);
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [userId, isStockLoaded, stockRows, stockUpdatedAt]);

  useEffect(() => {
    if (!userId || !isStockLoaded) return;

    const tick = () => {
      const remaining = getStockRemainingMs(stockUpdatedAt);
      setStockCountdownMs(remaining);

      if (remaining <= 0 && !globalStockSyncingRef.current) {
        void syncGlobalStockMarket();
      }
    };

    tick();
    const timer = window.setInterval(tick, 1000);

    const supabase = createClient();
    const channel = supabase
      .channel("game-global-stock-market-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: GLOBAL_STOCK_TABLE }, () => {
        if (!globalStockSyncingRef.current) void syncGlobalStockMarket();
      })
      .subscribe();

    return () => {
      window.clearInterval(timer);
      void supabase.removeChannel(channel);
    };
  }, [userId, isStockLoaded, stockUpdatedAt]);

  useEffect(() => {
    if (!userId || !isSaveLoaded) return;

    setIsSaving(true);
    setSaveMessage("저장 중...");

    const timer = window.setTimeout(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("game_saves").upsert(
        {
          user_id: userId,
          cash,
          warning_count: 0,
          unpaid_tax: unpaidTax,
          sorting_success_total: sortingSuccessTotal,
          delivery_success_total: deliverySuccessTotal,
          cashier_success_total: cashierSuccessTotal,
          cafe_success_total: cafeSuccessTotal,
          security_success_total: securitySuccessTotal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

      if (error) {
        console.error("자동 저장 실패:", error.message);
        setSaveMessage("자동 저장 실패");
      } else {
        await supabase.from(PROFILE_TABLE).upsert(
          { id: userId, nickname, room_kind: roomKind, occupation_id: occupationId, current_title: currentTitleId, net_worth: netWorth, updated_at: new Date().toISOString() },
          { onConflict: "id" }
        );
        setSaveMessage("자동 저장 완료");
      }

      setIsSaving(false);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [userId, isSaveLoaded, cash, unpaidTax, sortingSuccessTotal, deliverySuccessTotal, cashierSuccessTotal, cafeSuccessTotal, securitySuccessTotal, ownedCertifications, ownedItems, nickname, roomKind, occupationId, currentTitleId, netWorth]);

  useEffect(() => {
    if (!isSaveLoaded) return;

    const timer = window.setInterval(() => {
      setTaxCountdown((current) => {
        if (current === TAX_WARNING_SECONDS + 1) {
          setMessage("⚠️ 1분 후 자동으로 세금이 납부됩니다.");
        }

        if (current <= 1) {
          setTaxTriggerCount((count) => count + 1);
          return TAX_INTERVAL_SECONDS;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isSaveLoaded]);

  useEffect(() => {
    if (!isSaveLoaded) return;

    if (previousCashForStatsRef.current === null) {
      previousCashForStatsRef.current = cash;
      return;
    }

    const previousCash = previousCashForStatsRef.current;
    const delta = cash - previousCash;
    previousCashForStatsRef.current = cash;

    if (delta === 0) return;

    if (delta > 0) {
      setTotalIncome((value) => value + delta);
    } else {
      setTotalExpense((value) => value + Math.abs(delta));
    }

    const label = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setFinanceHistory((history) => [
      ...history.slice(-17),
      {
        label,
        income: delta > 0 ? delta : 0,
        expense: delta < 0 ? Math.abs(delta) : 0,
        netWorth,
      },
    ]);
  }, [isSaveLoaded, cash, netWorth]);

  useEffect(() => {
    if (taxTriggerCount > 0) applyTaxAutomatically();
  }, [taxTriggerCount]);

  useEffect(() => {
    if (!isSaveLoaded || !userId) return;

    const timer = window.setInterval(() => {
      setCareerIncomeCountdown((current) => {
        if (current <= 1) {
          const income = Math.floor(occupationInfo[occupationId].incomeEvery3Min * jobIncomeMultiplier);
          if (income > 0) {
            setCash((money) => money + income);
            setMessage(`💼 ${occupationInfo[occupationId].name} 고정 수입 +${income.toLocaleString()}원`);
          }
          return 180;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isSaveLoaded, userId, occupationId, jobIncomeMultiplier]);

  useEffect(() => {
    if (!isSaveLoaded) return;

    const restock = () => {
      setShopOffers(makeShopOffers(shopLevel));
      setShopUpdatedAt(new Date());
      setShopSoldOfferKeys([]);
      setGachaMachinePullCount(0);
      setShopCountdownSeconds(Math.ceil((10 * 60 * 1000) / 1000));
      setMessage("🎁 가챠 숍 상품 3개가 새로 입고되었습니다. 가챠 자판기 가격도 50,000원으로 초기화되었습니다.");
    };

    const tick = () => {
      const remainingSeconds = Math.ceil(getShopRemainingMs(shopUpdatedAt) / 1000);
      setShopCountdownSeconds(Math.max(0, remainingSeconds));
      if (shopOffers.length === 0 || remainingSeconds <= 0) restock();
    };

    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [isSaveLoaded, shopLevel, shopOffers.length, shopUpdatedAt]);

  useEffect(() => {
    if (lobbyView === "itemMarket") refreshMarketListings();
  }, [lobbyView]);

  useEffect(() => {
    if (!activeJobId || activeJobId === "cashier") return;

    const timer = window.setInterval(() => {
      setDifficulty((current) => {
        const next = Math.min(9, current + 1);
        if (next !== current) {
          setDifficultyNotice(`⚡ 난이도 상승! Lv.${next}`);
          setMessage(getDifficultyMessage(activeJobId, next));
          window.setTimeout(() => setDifficultyNotice(""), 1400);
        }
        return next;
      });
    }, 15000);

    return () => window.clearInterval(timer);
  }, [activeJobId]);

  useEffect(() => {
    if (activeJobId !== "sorting") return;

    const timer = window.setInterval(() => {
      setSortItem((current) => {
        const nextX = current.x + getSortingSpeed(difficulty);
        if (nextX >= 108) {
          registerSortingMistake("📦 택배가 지나갔습니다. 중앙 구역에서 맞는 색상 키를 누르세요.");
          setSortCombo(0);
          return makeNextSortItem();
        }
        return { ...current, x: nextX };
      });
    }, 22);

    return () => window.clearInterval(timer);
  }, [activeJobId, difficulty, sortItemId]);

  useEffect(() => {
    if (activeJobId !== "delivery") return;

    const timer = window.setInterval(() => {
      const speed = getDeliverySpeed(difficulty);

      setRunnerDistance((current) => current + 0.24 + difficulty * 0.06);

      setRunnerObstacles((current) => {
        const moved = current.map((obstacle) => ({ ...obstacle, y: obstacle.y + speed })).filter((obstacle) => obstacle.y <= 112);
        const collision = moved.some((obstacle) => obstacle.lane === runnerLane && obstacle.y >= 78 && obstacle.y <= 93);
        if (collision) {
          setRunnerHitFlash(true);
          setCash((money) => Math.max(0, money - PAY.deliveryCrashPenalty));
          registerDeliveryMistake(`💥 장애물 충돌! 수리비 ${PAY.deliveryCrashPenalty.toLocaleString()}원.`);
          window.setTimeout(() => setRunnerHitFlash(false), 250);
          return moved.filter((obstacle) => !(obstacle.lane === runnerLane && obstacle.y >= 78 && obstacle.y <= 93));
        }
        return moved;
      });

      setRunnerCoins((current) => {
        const moved = current.map((coin) => ({ ...coin, y: coin.y + speed })).filter((coin) => coin.y <= 112);
        const collected = moved.filter((coin) => coin.lane === runnerLane && coin.y >= 78 && coin.y <= 93);
        if (collected.length > 0) {
          const reward = Math.floor(collected.length * PAY.delivery * jobIncomeMultiplier);
          setCash((money) => money + reward);
          setDeliverySuccessTotal((count) => count + collected.length);
          setMessage(`🍱 배달 포인트 통과! +${reward.toLocaleString()}원`);
        }
        return moved.filter((coin) => !(coin.lane === runnerLane && coin.y >= 78 && coin.y <= 93));
      });

      runnerSpawnCooldownRef.current -= 1;

      if (runnerSpawnCooldownRef.current <= 0) {
        const safeLane = Math.floor(Math.random() * 3);
        const obstacleLanes = makeDeliveryObstacleLanes(difficulty, safeLane);
        const shouldSpawnCoin = Math.random() < 0.7;

        setRunnerObjectId((id) => {
          setRunnerObstacles((current) => [
            ...current,
            ...obstacleLanes.map((lane, index) => ({
              id: id + index,
              lane,
              y: -16,
            })),
          ]);

          if (shouldSpawnCoin) {
            setRunnerCoins((current) => [
              ...current,
              {
                id: id + obstacleLanes.length + 10000,
                lane: safeLane,
                y: -24,
              },
            ]);
          }

          return id + obstacleLanes.length + 1;
        });

        runnerSpawnCooldownRef.current = getDeliverySpawnCooldown(difficulty);
      }
    }, 24);

    return () => window.clearInterval(timer);
  }, [activeJobId, difficulty, runnerLane, runnerObjectId]);

  useEffect(() => {
    if (activeJobId !== "cafe") return;

    const timer = window.setInterval(() => {
      setCafeFill((current) => {
        if (!cafeHolding) return Math.max(0, current - (0.18 + difficulty * 0.02));
        const next = current + 0.95 + difficulty * 0.24;
        if (next >= 100) {
          setCafeFill(0);
          setCafeHolding(false);
          registerCafeMistake("☕ 음료가 넘쳤습니다. 낮은 보상 대신 목표 구간이 좁습니다.");
          return 0;
        }
        return next;
      });
    }, 25);

    return () => window.clearInterval(timer);
  }, [activeJobId, cafeHolding, difficulty]);

  useEffect(() => {
    if (activeJobId !== "security") return;

    const timer = window.setInterval(() => {
      if (securitySignal === "thief") {
        registerSecurityMistake("🛡️ 수상한 사람을 놓쳤습니다.");
      } else {
        const reward = Math.floor(PAY.securityPass * jobIncomeMultiplier);
        setCash((money) => money + reward);
        setSecuritySuccess((success) => success + 1);
        setSecuritySuccessTotal((count) => count + 1);
        setMessage(`🛡️ 통과 처리 성공! +${reward.toLocaleString()}원`);
      }
      setSecuritySignal(makeSecuritySignal(difficulty));
      setSecurityRound((round) => round + 1);
    }, Math.max(430, 1250 - difficulty * 95));

    return () => window.clearInterval(timer);
  }, [activeJobId, securitySignal, difficulty]);

  useEffect(() => {
    if (activeJobId === "sorting" && sortMiss >= 3) fireFromJob("📦 실수 3회! 택배 분류 알바에서 해고되었습니다.");
  }, [activeJobId, sortMiss]);

  useEffect(() => {
    if (activeJobId === "delivery" && runnerMiss >= 3) fireFromJob("🛵 사고 3회! 음식 배달 알바에서 해고되었습니다.");
  }, [activeJobId, runnerMiss]);

  useEffect(() => {
    if (activeJobId === "cashier" && cashierMiss >= 3) fireFromJob("🏪 실수 3회! 편의점 계산 알바에서 해고되었습니다.");
  }, [activeJobId, cashierMiss]);

  useEffect(() => {
    if (activeJobId === "cafe" && cafeMiss >= 3) fireFromJob("☕ 제조 실수 3회! 카페 음료 알바에서 해고되었습니다.");
  }, [activeJobId, cafeMiss]);

  useEffect(() => {
    if (activeJobId === "security" && securityMiss >= 3) fireFromJob("🛡️ 실수 3회! 보안요원 알바에서 해고되었습니다.");
  }, [activeJobId, securityMiss]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!activeJobId) return;
      const key = event.key.toLowerCase();

      if (activeJobId === "sorting") {
        if (["r", "b", "y", "g", "p"].includes(key)) {
          event.preventDefault();
          handleSortKey(key);
        }
        return;
      }

      if (activeJobId === "delivery") {
        if (key === "a" || key === "arrowleft") {
          event.preventDefault();
          setRunnerLane((lane) => Math.max(0, lane - 1));
        }
        if (key === "d" || key === "arrowright") {
          event.preventDefault();
          setRunnerLane((lane) => Math.min(2, lane + 1));
        }
        return;
      }

      if (activeJobId === "cashier") {
        if (cashierKeyPool.map((item) => item.toLowerCase()).includes(key)) {
          event.preventDefault();
          handleCashierKey(key);
        }
        return;
      }

      if (activeJobId === "cafe") {
        if (key === " ") {
          event.preventDefault();
          setCafeHolding(true);
        }
        return;
      }

      if (activeJobId === "security" && key === " ") {
        event.preventDefault();
        handleSecurityAction();
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (activeJobId !== "cafe") return;
      if (event.key === " ") {
        event.preventDefault();
        setCafeHolding(false);
        judgeCafeFill();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [activeJobId, sortItem, cashierIndex, cashierSequence, cafeFill, cafeTargetStart, cafeTargetEnd, securitySignal, difficulty]);

  useEffect(() => {
    return () => {
      if (slotSpinIntervalRef.current) {
        window.clearInterval(slotSpinIntervalRef.current);
        slotSpinIntervalRef.current = null;
      }
    };
  }, []);

  function applyTaxAutomatically() {
    const currentTax = Math.floor(cash * getTaxRate(cash) * Math.max(0.55, 1 - insuranceTaxDiscount));
    const tax = currentTax + unpaidTax;

    if (tax <= 0) {
      setMessage("💸 이번 세금은 없습니다.");
      return;
    }

    if (cash >= tax) {
      setCash((current) => current - tax);
      setUnpaidTax(0);
      setWarningCount(0);
      setMessage(`💸 자동 세금 ${tax.toLocaleString()}원이 납부되었습니다.`);
      return;
    }

    setUnpaidTax(tax);
    setWarningCount(0);
    setMessage(`⚠️ 현금이 부족해 세금 ${tax.toLocaleString()}원이 미납으로 이월되었습니다. 다음 세금 제출 때 합산됩니다.`);
  }

  function startJob(jobId: JobId) {
    setSelectedJobId(jobId);
    setActiveJobId(jobId);
    firedLockRef.current = false;
    setFiredStamp(null);
    setDifficulty(1);
    setDifficultyNotice("");
    setMessage(`${jobs.find((job) => job.id === jobId)?.icon} ${jobs.find((job) => job.id === jobId)?.name} 시작!`);

    if (jobId === "sorting") setupSortingJob();
    if (jobId === "delivery") setupDeliveryJob();
    if (jobId === "cashier") setupCashierJob();
    if (jobId === "cafe") setupCafeJob();
    if (jobId === "security") setupSecurityJob();
  }

  function setupSortingJob() {
    setSortItem(makeSortItem(1, 1));
    setSortItemId(2);
    setSortCombo(0);
    setSortMiss(0);
    setMessage("📦 중앙 판정 구역에서 택배 색에 맞는 r/b/y/g/p 키를 누르세요.");
  }

  function setupDeliveryJob() {
    setRunnerLane(1);
    setRunnerDistance(0);
    setRunnerObstacles([]);
    setRunnerCoins([]);
    setRunnerObjectId(1);
    setRunnerHitFlash(false);
    setRunnerMiss(0);
    runnerSpawnCooldownRef.current = 0;
    setMessage(`🛵 A/D로 이동하세요. 장애물 충돌 3회면 해고, 충돌마다 ${PAY.deliveryCrashPenalty.toLocaleString()}원 차감됩니다.`);
  }

  function setupCashierJob() {
    setCashierSequence(makeCashierSequence(1));
    setCashierIndex(0);
    setCashierSuccess(0);
    setCashierMiss(0);
    setMessage("🏪 성공 횟수가 쌓일수록 보상이 크게 증가합니다. W/A/S/D를 정확히 입력하세요.");
  }

  function setupCafeJob() {
    const target = makeCafeTarget(1);
    setCafeFill(0);
    setCafeHolding(false);
    setCafeSuccess(0);
    setCafeMiss(0);
    setCafeTargetStart(target.start);
    setCafeTargetEnd(target.end);
    setMessage("☕ Space를 누르고 있다가 목표 구간에서 떼세요. 목표 구간이 좁습니다.");
  }

  function setupSecurityJob() {
    setSecuritySignal("normal");
    setSecuritySuccess(0);
    setSecurityMiss(0);
    setSecurityRound(0);
    setMessage(`🛡️ 수상한 사람만 막으세요. VIP를 막으면 ${PAY.vipPenalty.toLocaleString()}원을 물어냅니다.`);
  }

  function leaveJob() {
    setActiveJobId(null);
    setCafeHolding(false);
    setDifficultyNotice("");
    setFiredStamp(null);
    firedLockRef.current = false;
    setMessage("알바를 선택하고 시작하세요.");
  }

  function fireFromJob(reason: string) {
    if (firedLockRef.current) return;
    firedLockRef.current = true;

    setActiveJobId(null);
    setCafeHolding(false);
    setDifficultyNotice("");
    setFiredStamp(reason);
    setMessage(`${reason} 다시 도전하려면 알바를 새로 시작하세요.`);

    window.setTimeout(() => {
      setFiredStamp(null);
      firedLockRef.current = false;
    }, 2400);
  }

  function registerSortingMistake(reason: string) {
    setSortMiss((current) => {
      const next = current + 1;
      setMessage(next >= 3 ? "📦 실수 3회! 택배 분류 알바에서 해고됩니다." : `${reason} 실수 ${next}/3`);
      return next;
    });
  }

  function registerDeliveryMistake(reason: string) {
    setRunnerMiss((current) => {
      const next = current + 1;
      setMessage(next >= 3 ? "🛵 사고 3회! 음식 배달 알바에서 해고됩니다." : `${reason} 실수 ${next}/3`);
      return next;
    });
  }

  function registerCashierMistake(reason: string) {
    setCashierMiss((current) => {
      const next = current + 1;
      setMessage(next >= 3 ? "🏪 실수 3회! 편의점 계산 알바에서 해고됩니다." : `${reason} 실수 ${next}/3`);
      return next;
    });
  }

  function registerCafeMistake(reason: string) {
    setCafeMiss((current) => {
      const next = current + 1;
      setMessage(next >= 3 ? "☕ 제조 실수 3회! 카페 음료 알바에서 해고됩니다." : `${reason} 실수 ${next}/3`);
      return next;
    });
  }

  function registerSecurityMistake(reason: string) {
    setSecurityMiss((current) => {
      const next = current + 1;
      setMessage(next >= 3 ? "🛡️ 실수 3회! 보안요원 알바에서 해고됩니다." : `${reason} 실수 ${next}/3`);
      return next;
    });
  }

  function handleSortKey(key: string) {
    const activeKinds = getActiveSortKinds(difficulty);
    if (!activeKinds.includes(sortItem.kind)) return;

    if (sortItem.x < 39 || sortItem.x > 61) {
      registerSortingMistake("📦 타이밍 실패! 중앙 판정 구역이 더 좁아졌습니다.");
      setSortCombo(0);
      setSortItem(markSortFeedback(sortItem, "bad"));
      window.setTimeout(() => setSortItem(makeNextSortItem()), 160);
      return;
    }

    if (sortInfo[sortItem.kind].key !== key) {
      registerSortingMistake("📦 색깔 분류가 틀렸습니다.");
      setSortCombo(0);
      setSortItem(markSortFeedback(sortItem, "bad"));
      window.setTimeout(() => setSortItem(makeNextSortItem()), 160);
      return;
    }

    const combo = sortCombo + 1;
    const reward = Math.floor((PAY.sorting + combo * PAY.sortingComboBonus) * jobIncomeMultiplier);
    setCash((money) => money + reward);
    setSortingSuccessTotal((count) => count + 1);
    setSortCombo(combo);
    setSortItem(markSortFeedback(sortItem, "good"));
    setMessage(`✨ 분류 성공! +${reward.toLocaleString()}원 / 콤보 ${combo}`);
    window.setTimeout(() => setSortItem(makeNextSortItem()), 150);
  }

  function makeNextSortItem() {
    const next = makeSortItem(difficulty, sortItemId);
    setSortItemId((id) => id + 1);
    return next;
  }

  function handleCashierKey(key: string) {
    const expectedKey = cashierSequence[cashierIndex]?.toLowerCase();
    if (!expectedKey) return;

    if (key !== expectedKey) {
      registerCashierMistake(`실수! ${cashierSequence[cashierIndex]} 키를 눌러야 했습니다.`);
      setCashierSequence(makeCashierSequence(difficulty));
      setCashierIndex(0);
      return;
    }

    const nextIndex = cashierIndex + 1;
    setCashierIndex(nextIndex);

    if (nextIndex >= cashierSequence.length) {
      const nextSuccess = cashierSuccess + 1;
      const nextDifficulty = getCashierDifficultyBySuccess(nextSuccess);
      const reward = Math.floor((PAY.cashier + nextSuccess * PAY.cashierSuccessBonus + nextDifficulty * PAY.cashierDifficultyBonus) * jobIncomeMultiplier);
      setCash((money) => money + reward);
      setCashierSuccess(nextSuccess);
      setCashierSuccessTotal((count) => count + 1);
      setCashierSequence(makeCashierSequence(nextDifficulty));
      setCashierIndex(0);

      if (nextDifficulty !== difficulty) {
        setDifficulty(nextDifficulty);
        setDifficultyNotice(`⚡ 계산 ${nextSuccess}회 달성! 난이도 Lv.${nextDifficulty}`);
        window.setTimeout(() => setDifficultyNotice(""), 1400);
      }

      setMessage(`🏪 계산 성공 ${nextSuccess}회! +${reward.toLocaleString()}원 · 현재 난이도 Lv.${nextDifficulty}`);
      return;
    }

    setMessage(`좋아요! 다음 키: ${cashierSequence[nextIndex]}`);
  }

  function judgeCafeFill() {
    if (cafeFill >= cafeTargetStart && cafeFill <= cafeTargetEnd) {
      const reward = Math.floor((PAY.cafe + difficulty * 12) * jobIncomeMultiplier);
      const target = makeCafeTarget(difficulty);
      setCash((money) => money + reward);
      setCafeSuccess((success) => success + 1);
      setCafeSuccessTotal((count) => count + 1);
      setCafeFill(0);
      setCafeTargetStart(target.start);
      setCafeTargetEnd(target.end);
      setMessage(`☕ 제조 성공! +${reward.toLocaleString()}원`);
      return;
    }

    registerCafeMistake("☕ 양이 맞지 않습니다.");
    setCafeFill(0);
    setCafeHolding(false);
  }

  function handleSecurityAction() {
    if (securitySignal === "thief") {
      const reward = Math.floor(PAY.securityCatch * jobIncomeMultiplier);
      setCash((money) => money + reward);
      setSecuritySuccess((success) => success + 1);
      setSecuritySuccessTotal((count) => count + 1);
      setSecuritySignal("normal");
      setMessage(`🛡️ 수상한 사람 검거 성공! +${reward.toLocaleString()}원`);
      return;
    }

    if (securitySignal === "vip") {
      setCash((money) => Math.max(0, money - PAY.vipPenalty));
      registerSecurityMistake(`🛡️ VIP 손님을 잘못 막았습니다. ${PAY.vipPenalty.toLocaleString()}원 차감!`);
      setSecuritySignal("normal");
      return;
    }

    setCash((money) => Math.max(0, money - PAY.securityNormalPenalty));
    registerSecurityMistake(`🛡️ 일반인을 잘못 막았습니다. ${PAY.securityNormalPenalty.toLocaleString()}원 차감!`);
    setSecuritySignal("normal");
  }

  async function saveNickname() {
    const trimmed = nicknameDraft.trim().slice(0, 12);
    const nextNickname = trimmed || "우리집";

    if (!userId) {
      setMessage("로그인 정보를 확인한 뒤 다시 시도해주세요.");
      return;
    }

    const supabase = createClient();
    const { data: duplicatedProfile, error: duplicateError } = await supabase
      .from(PROFILE_TABLE)
      .select("id")
      .eq("nickname", nextNickname)
      .neq("id", userId)
      .maybeSingle<{ id: string }>();

    if (duplicateError) {
      console.warn("닉네임 중복 확인 실패:", duplicateError.message);
    }

    if (duplicatedProfile) {
      setNicknameDraft(nickname);
      setMessage(`이미 다른 유저가 사용 중인 닉네임입니다: ${nextNickname}`);
      return;
    }

    const { error } = await supabase.from(PROFILE_TABLE).upsert(
      {
        id: userId,
        nickname: nextNickname,
        room_kind: roomKind,
        occupation_id: occupationId,
        occupation_level: occupationLevel,
        unlocked_occupations: unlockedOccupations,
        current_title: currentTitleId,
        net_worth: netWorth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("프로필 저장 실패. localStorage에만 저장합니다:", error.message);
      setMessage("프로필 테이블 저장에 실패해서 이 브라우저에만 닉네임을 저장했습니다. 중복 방지는 Supabase 테이블 설정 후 적용됩니다.");
    } else {
      setMessage(`닉네임이 ${nextNickname}(으)로 변경되었습니다.`);
    }

    setNickname(nextNickname);
    setNicknameDraft(nextNickname);
    window.localStorage.setItem(`alba-money-nickname-${userId}`, nextNickname);
    refreshRanking(nextNickname);
  }

  function changeRoom(nextRoomKind: RoomKind) {
    setRoomKind(nextRoomKind);

    if (userId) {
      window.localStorage.setItem(`alba-money-room-${userId}`, nextRoomKind);
      saveProfilePatch({ room_kind: nextRoomKind });
    }

    setLobbyView("room");
    setMessage(`${roomInfo[nextRoomKind].name}(으)로 메인 화면이 변경되었습니다.`);
  }

  function isHiddenCareerVisible(careerId: OccupationId) {
    const career = occupationInfo[careerId];
    if (!career.hidden) return true;

    if (careerId === "chiefExecutive") {
      return netWorth >= 2000000 && (unlockedOccupations.includes("officeDirector") || unlockedOccupations.includes("franchiseOwner") || occupationId === "officeDirector" || occupationId === "franchiseOwner");
    }

    if (careerId === "shadowExecutive") {
      return netWorth >= 5000000 && (occupationId === "operationsDirector" || occupationId === "strategyConsultant" || unlockedOccupations.includes("operationsDirector") || unlockedOccupations.includes("strategyConsultant"));
    }

    if (careerId === "legendaryIdol") {
      return (unlockedOccupations.includes("topSinger") || occupationId === "topSinger" || occupationId === "musicProducer") && cafeSuccessTotal >= 60;
    }

    if (careerId === "mythicMuse") {
      return netWorth >= 4500000 && (occupationId === "legendaryIdol" || occupationId === "musicProducer" || unlockedOccupations.includes("legendaryIdol")) && cafeSuccessTotal >= 120;
    }

    if (careerId === "logisticsLegend") {
      return (unlockedOccupations.includes("platformOpsManager") || occupationId === "platformOpsManager" || occupationId === "supplyChainDirector") && sortingSuccessTotal >= 90 && deliverySuccessTotal >= 90;
    }

    if (careerId === "phantomCourier") {
      return netWorth >= 3500000 && (occupationId === "supplyChainDirector" || occupationId === "droneDispatcher" || unlockedOccupations.includes("supplyChainDirector")) && deliverySuccessTotal >= 180;
    }

    if (careerId === "quantMaster") {
      return (unlockedOccupations.includes("investor") || occupationId === "investor" || occupationId === "fundManager") && (bankDeposit >= 1000000 || stockAssetValue >= 1000000);
    }

    if (careerId === "marketOracle") {
      return netWorth >= 6000000 && (occupationId === "quantMaster" || occupationId === "fundManager" || unlockedOccupations.includes("quantMaster")) && stockAssetValue >= 1500000;
    }

    if (careerId === "blackCardBroker") {
      return cash >= 5000000 && (occupationId === "ventureCapitalist" || occupationId === "financialDirector" || unlockedOccupations.includes("ventureCapitalist"));
    }

    return false;
  }

  function canChallengeOccupation(nextOccupationId: OccupationId) {
    const nextOccupation = occupationInfo[nextOccupationId];
    if (nextOccupationId === "unemployed") return true;
    if (nextOccupation.hidden && !isHiddenCareerVisible(nextOccupationId)) return false;
    if (cash < nextOccupation.requiredCash) return false;
    if (nextOccupation.requiredPrevious && !unlockedOccupations.includes(nextOccupation.requiredPrevious) && nextOccupation.requiredPrevious !== occupationId) return false;

    const required = nextOccupation.requiredSuccess;
    if (required?.sorting && sortingSuccessTotal < required.sorting) return false;
    if (required?.delivery && deliverySuccessTotal < required.delivery) return false;
    if (required?.cashier && cashierSuccessTotal < required.cashier) return false;
    if (required?.cafe && cafeSuccessTotal < required.cafe) return false;
    if (required?.security && securitySuccessTotal < required.security) return false;

    if (nextOccupationId === "chiefExecutive" && !(unlockedOccupations.includes("officeDirector") || unlockedOccupations.includes("franchiseOwner"))) return false;
    if (nextOccupationId === "quantMaster" && !(bankDeposit >= 1000000 && stockAssetValue >= 1000000)) return false;

    return true;
  }

  function getCareerRouteOptions(buildingId: CareerBuildingId) {
    if (occupationId === "unemployed") return [] as CareerQuest[];
    return careerQuestBoards[buildingId].filter((quest) => {
      const career = occupationInfo[quest.targetId];
      return (!quest.hidden || isHiddenCareerVisible(quest.targetId)) && career.requiredPrevious === occupationId;
    });
  }

  function getCurrentCareerQuest(buildingId: CareerBuildingId) {
    const quests = careerQuestBoards[buildingId].filter((quest) => !quest.hidden || isHiddenCareerVisible(quest.targetId));
    if (quests.length === 0) return null;

    const routeOptions = getCareerRouteOptions(buildingId);
    if (routeOptions.length > 0) {
      return routeOptions.find((quest) => quest.targetId === selectedCareerRouteId) ?? routeOptions[0];
    }

    const firstQuest = quests.find((quest) => !occupationInfo[quest.targetId].requiredPrevious && !quest.hidden);
    return firstQuest ?? quests[0];
  }

  function isOutcomeEligible(candidate: Occupation, baseOccupation: Occupation) {
    if (cash < candidate.requiredCash) return false;

    if (candidate.requiredPrevious && !unlockedOccupations.includes(candidate.requiredPrevious) && candidate.requiredPrevious !== baseOccupation.id) {
      return false;
    }

    const required = candidate.requiredSuccess;
    if (required?.sorting && sortingSuccessTotal < required.sorting) return false;
    if (required?.delivery && deliverySuccessTotal < required.delivery) return false;
    if (required?.cashier && cashierSuccessTotal < required.cashier) return false;
    if (required?.cafe && cafeSuccessTotal < required.cafe) return false;
    if (required?.security && securitySuccessTotal < required.security) return false;

    if (candidate.id === "chiefExecutive" && !(baseOccupation.id === "officeDirector" || baseOccupation.id === "franchiseOwner" || unlockedOccupations.includes("officeDirector") || unlockedOccupations.includes("franchiseOwner"))) return false;
    if (candidate.id === "quantMaster" && !(bankDeposit >= 1000000 && stockAssetValue >= 1000000)) return false;

    return true;
  }

  function resolveCareerQuestOutcome(baseOccupation: Occupation, finalScore: number, finalStep: number, finalMistakes: number) {
    const targetScore = getCareerTargetScore(baseOccupation);
    const maxSteps = getCareerMaxSteps(baseOccupation);
    const perfectClear = finalMistakes === 0 && finalScore >= targetScore;
    const fastClear = finalStep <= Math.max(targetScore, maxSteps - 1);

    if (perfectClear && fastClear) {
      const hiddenCandidate = careerQuestBoards[baseOccupation.buildingId]
        .map((quest) => occupationInfo[quest.targetId])
        .find((candidate) => candidate.hidden && isHiddenCareerVisible(candidate.id) && isOutcomeEligible(candidate, baseOccupation));

      if (hiddenCandidate) {
        return { occupation: hiddenCandidate, resultType: "hidden" as const };
      }

      const promotionCandidate = careerQuestBoards[baseOccupation.buildingId]
        .map((quest) => occupationInfo[quest.targetId])
        .find((candidate) => !candidate.hidden && candidate.requiredPrevious === baseOccupation.id && isOutcomeEligible(candidate, baseOccupation));

      if (promotionCandidate) {
        return { occupation: promotionCandidate, resultType: "promotion" as const };
      }
    }

    return { occupation: baseOccupation, resultType: "normal" as const };
  }

  function getBankAmount() {
    return Math.max(0, Math.floor(Number(bankInput) || 0));
  }

  function reducePrincipal(currentPrincipal: number, currentBalance: number, withdrawAmount: number) {
    if (currentBalance <= 0 || currentPrincipal <= 0) return 0;
    const ratio = Math.min(1, withdrawAmount / currentBalance);
    return Math.max(0, Math.floor(currentPrincipal * (1 - ratio)));
  }

  function depositToBank() {
    const amount = getBankAmount();
    if (amount < 100) {
      setMessage("🏦 최소 100원 이상 예금할 수 있습니다.");
      return;
    }
    if (amount > cash) {
      setMessage("🏦 보유 현금보다 많이 예금할 수 없습니다.");
      return;
    }
    setCash((money) => money - amount);
    setBankDeposit((deposit) => deposit + amount);
    setBankDepositPrincipal((principal) => principal + amount);
    setMessage(`🏦 예금 ${amount.toLocaleString()}원 완료`);
  }

  function withdrawFromBank() {
    const amount = getBankAmount();
    if (amount < 100) {
      setMessage("🏦 최소 100원 이상 출금할 수 있습니다.");
      return;
    }
    if (amount > bankDeposit) {
      setMessage("🏦 예금 잔액보다 많이 출금할 수 없습니다.");
      return;
    }
    setBankDepositPrincipal((principal) => reducePrincipal(principal, bankDeposit, amount));
    setBankDeposit((deposit) => deposit - amount);
    setCash((money) => money + amount);
    setMessage(`🏦 출금 ${amount.toLocaleString()}원 완료`);
  }

  function depositAllToBank() {
    const amount = Math.floor(cash);
    if (amount < 100) {
      setMessage("🏦 예금할 현금이 부족합니다.");
      return;
    }
    setCash(0);
    setBankDeposit((deposit) => deposit + amount);
    setBankDepositPrincipal((principal) => principal + amount);
    setMessage(`🏦 보유 현금 전액 ${amount.toLocaleString()}원을 예금했습니다.`);
  }

  function withdrawAllFromBank() {
    const amount = Math.floor(bankDeposit);
    if (amount < 1) {
      setMessage("🏦 출금할 예금이 없습니다.");
      return;
    }
    setBankDeposit(0);
    setBankDepositPrincipal(0);
    setCash((money) => money + amount);
    setMessage(`🏦 예금 전액 ${amount.toLocaleString()}원을 출금했습니다.`);
  }

  function depositToSavings() {
    const requestedAmount = getBankAmount();
    const remainingCap = Math.max(0, BANK_SAVINGS_CAP - bankSavings);
    const amount = Math.min(requestedAmount, cash, remainingCap);
    if (remainingCap <= 0) {
      setMessage(`🏦 적금은 시드머니 모으기 용이라 ${BANK_SAVINGS_CAP.toLocaleString()}원까지만 납입/성장할 수 있습니다. 목돈은 예금으로 굴려보세요.`);
      return;
    }
    if (requestedAmount < 1000) {
      setMessage("🏦 적금은 최소 1,000원 이상 넣을 수 있습니다.");
      return;
    }
    if (requestedAmount > cash) {
      setMessage("🏦 보유 현금보다 많이 적금할 수 없습니다.");
      return;
    }
    if (amount < 1000 && remainingCap >= 1000) {
      setMessage("🏦 적금 가능 금액이 너무 작습니다.");
      return;
    }
    setCash((money) => money - amount);
    setBankSavings((savings) => Math.min(BANK_SAVINGS_CAP, savings + amount));
    setBankSavingsPrincipal((principal) => Math.min(BANK_SAVINGS_CAP, principal + amount));
    setMessage(`🏦 시드 적금 ${amount.toLocaleString()}원 납입 완료. 남은 적금 한도는 ${Math.max(0, remainingCap - amount).toLocaleString()}원입니다.`);
  }

  function depositAllToSavings() {
    const remainingCap = Math.max(0, BANK_SAVINGS_CAP - bankSavings);
    const amount = Math.min(Math.floor(cash), remainingCap);
    if (remainingCap <= 0) {
      setMessage(`🏦 적금은 이미 상한 ${BANK_SAVINGS_CAP.toLocaleString()}원에 도달했습니다. 추가 목돈은 예금으로 굴릴 수 있습니다.`);
      return;
    }
    if (amount < 1000) {
      setMessage("🏦 적금할 현금 또는 남은 적금 한도가 부족합니다.");
      return;
    }
    setCash((money) => money - amount);
    setBankSavings((savings) => Math.min(BANK_SAVINGS_CAP, savings + amount));
    setBankSavingsPrincipal((principal) => Math.min(BANK_SAVINGS_CAP, principal + amount));
    setMessage(`🏦 시드 적금 한도 안에서 ${amount.toLocaleString()}원을 납입했습니다. 남은 적금 한도는 ${Math.max(0, remainingCap - amount).toLocaleString()}원입니다.`);
  }

  function withdrawSavings() {
    const amount = getBankAmount();
    if (amount < 1000) {
      setMessage("🏦 적금 출금은 최소 1,000원 이상 가능합니다.");
      return;
    }
    if (amount > bankSavings) {
      setMessage("🏦 적금 잔액보다 많이 출금할 수 없습니다.");
      return;
    }
    setBankSavingsPrincipal((principal) => reducePrincipal(principal, bankSavings, amount));
    setBankSavings((savings) => savings - amount);
    setCash((money) => money + amount);
    setMessage(`🏦 적금 ${amount.toLocaleString()}원 출금 완료`);
  }

  function withdrawAllSavings() {
    const amount = Math.floor(bankSavings);
    if (amount < 1) {
      setMessage("🏦 출금할 적금이 없습니다.");
      return;
    }
    setBankSavings(0);
    setBankSavingsPrincipal(0);
    setCash((money) => money + amount);
    setMessage(`🏦 적금 전액 ${amount.toLocaleString()}원을 출금했습니다.`);
  }

  function borrowFromBank() {
    const amount = getBankAmount();
    const limit = getLoanLimit(creditScore, netWorth);
    if (amount < 1000) {
      setMessage("🏦 최소 1,000원 이상 대출할 수 있습니다.");
      return;
    }
    if (bankLoan + amount > limit) {
      setMessage(`🏦 현재 대출 한도는 ${limit.toLocaleString()}원입니다.`);
      return;
    }
    setBankLoan((loan) => loan + amount);
    setCreditScore((score) => Math.max(300, score - 8));
    setCash((money) => money + amount);
    setMessage(`🏦 대출 ${amount.toLocaleString()}원 실행`);
  }

  function repayBankLoan() {
    const amount = Math.min(getBankAmount(), bankLoan);
    if (amount < 100) {
      setMessage("🏦 상환할 대출이 없거나 금액이 너무 작습니다.");
      return;
    }
    if (amount > cash) {
      setMessage("🏦 보유 현금보다 많이 상환할 수 없습니다.");
      return;
    }
    setCash((money) => money - amount);
    setBankLoan((loan) => Math.max(0, loan - amount));
    setCreditScore((score) => Math.min(900, score + 5));
    setMessage(`🏦 대출 ${amount.toLocaleString()}원 상환 완료`);
  }

  function buyEstate(estateId: EstateId) {
    const estate = estateItems.find((item) => item.id === estateId);
    if (!estate || ownedEstates.includes(estateId)) return;
    if (cash < estate.price) {
      setMessage(`🏘️ ${estate.name} 구매에는 ${estate.price.toLocaleString()}원이 필요합니다.`);
      return;
    }
    setCash((money) => money - estate.price);
    setOwnedEstates((owned) => [...owned, estateId]);
    setMessage(`🏘️ ${estate.name} 구매 완료. 30초마다 ${estate.incomeEvery5Min.toLocaleString()}원 수익이 들어옵니다.`);
  }

  function buyBusiness(businessId: BusinessId) {
    const business = businessItems.find((item) => item.id === businessId);
    if (!business || ownedBusinesses.includes(businessId)) return;
    if (cash < business.price) {
      setMessage(`🧾 ${business.name} 창업에는 ${business.price.toLocaleString()}원이 필요합니다.`);
      return;
    }
    setCash((money) => money - business.price);
    setOwnedBusinesses((owned) => [...owned, businessId]);
    setMessage(`🧾 ${business.name} 창업 완료. 30초마다 ${business.incomeEvery5Min.toLocaleString()}원 사업 매출이 들어옵니다.`);
  }

  function toggleInsurance(insuranceId: InsuranceId) {
    const insurance = insuranceItems.find((item) => item.id === insuranceId);
    if (!insurance) return;
    if (ownedInsurances.includes(insuranceId)) {
      setOwnedInsurances((owned) => owned.filter((id) => id !== insuranceId));
      setMessage(`🛡️ ${insurance.name} 해지 완료`);
      return;
    }
    if (cash < insurance.premiumEvery5Min) {
      setMessage(`🛡️ 첫 보험료 ${insurance.premiumEvery5Min.toLocaleString()}원이 필요합니다.`);
      return;
    }
    setCash((money) => money - insurance.premiumEvery5Min);
    setOwnedInsurances((owned) => [...owned, insuranceId]);
    setMessage(`🛡️ ${insurance.name} 가입 완료. 10분마다 보험료가 납부됩니다.`);
  }

  function hireEmployee(businessId: BusinessId) {
    const currentLevel = businessEmployees[businessId] ?? 0;
    const nextPlan = employeePlans.find((plan) => plan.level === currentLevel + 1);
    if (!ownedBusinesses.includes(businessId)) {
      setMessage("👥 먼저 해당 사업을 창업해야 직원을 고용할 수 있습니다.");
      return;
    }
    if (!nextPlan) {
      setMessage("👥 이미 최고 단계의 직원을 고용했습니다.");
      return;
    }
    if (cash < nextPlan.cost) {
      setMessage(`👥 ${nextPlan.name} 고용에는 ${nextPlan.cost.toLocaleString()}원이 필요합니다.`);
      return;
    }
    setCash((money) => money - nextPlan.cost);
    setBusinessEmployees((current) => ({ ...current, [businessId]: nextPlan.level }));
    setMessage(`👥 ${nextPlan.name} 고용 완료. 사업 매출 보너스 +${Math.round(nextPlan.revenueBonusRate * 100)}%`);
  }

  function refreshAuctionDeals() {
    const deals = makeAuctionDeals();
    setAuctionDeals(deals);
    setMessage("🔨 경매장 매물이 새로 갱신되었습니다.");
  }

  function buyAuctionDeal(deal: AuctionDeal) {
    if (cash < deal.price) {
      setMessage(`🔨 ${deal.name} 구매에는 ${deal.price.toLocaleString()}원이 필요합니다.`);
      return;
    }
    setCash((money) => money - deal.price);

    if (deal.id === "estate_apartment" && !ownedEstates.includes("apartment")) {
      setOwnedEstates((owned) => [...owned, "apartment"]);
    } else if (deal.id === "estate_store" && !ownedEstates.includes("smallStore")) {
      setOwnedEstates((owned) => [...owned, "smallStore"]);
    } else if (deal.id === "business_cafe" && !ownedBusinesses.includes("coffeeShop")) {
      setOwnedBusinesses((owned) => [...owned, "coffeeShop"]);
    } else if (deal.id === "stock_bundle") {
      setStockRows((rows) => rows.map((row, index) => index < 3 ? { ...row, owned: row.owned + 1 } : row));
    }

    setAuctionDeals((deals) => deals.filter((item) => item.id !== deal.id));
    setMessage(`🔨 ${deal.name} 낙찰 완료. 시세 차익 약 ${(deal.value - deal.price).toLocaleString()}원`);
  }

  function buyLottoTicket() {
    const today = getTodayKey();
    const currentCount = lottoPurchaseDate === today ? lottoPurchaseCount : 0;
    const price = Math.floor(Number(lottoPrice));

    if (!Number.isFinite(price) || price < 1000) {
      setMessage("🎫 로또는 1,000원 이상부터 구매할 수 있습니다.");
      return;
    }

    if (currentCount >= 3) {
      setMessage("🎫 로또는 하루에 3번까지만 구매할 수 있습니다.");
      return;
    }

    if (cash < price) {
      setMessage(`🎫 로또 구매에는 ${price.toLocaleString()}원이 필요합니다.`);
      return;
    }

    const ticket = makeLottoTicket(price, lottoLuckBonus);
    setCash((money) => money - price);
    setTotalExpense((expense) => expense + price);
    setLottoPurchaseDate(today);
    setLottoPurchaseCount(currentCount + 1);
    setLottoTickets((tickets) => [ticket, ...tickets].slice(0, 12));
    setMessage(`🎫 로또를 구매했습니다. 오늘 ${currentCount + 1}/3회 구매`);
  }

  function scratchLottoTicket(ticketId: string) {
    const ticket = lottoTickets.find((item) => item.id === ticketId);
    if (!ticket || ticket.scratched) return;

    setLottoTickets((tickets) => tickets.map((item) => item.id === ticketId ? { ...item, scratched: true } : item));

    if (ticket.prize > 0) {
      setCash((money) => money + ticket.prize);
      setTotalIncome((income) => income + ticket.prize);
      setMessage(`🎫 당첨! 로또 상금 +${ticket.prize.toLocaleString()}원`);
    } else {
      setMessage("🎫 아쉽게도 꽝입니다.");
    }
  }

  function buyCertification(certificationId: CertificationId) {
    const certification = certifications.find((item) => item.id === certificationId);
    if (!certification || ownedCertifications.includes(certificationId)) return;
    if (cash < certification.price) {
      setMessage(`🎓 ${certification.name} 취득에는 ${certification.price.toLocaleString()}원이 필요합니다.`);
      return;
    }
    setCash((money) => money - certification.price);
    setOwnedCertifications((owned) => [...owned, certificationId]);
    setMessage(`🎓 ${certification.name} 취득 완료! ${certification.effectText}`);
  }

  function buyShopOffer(item: ShopItem, offerKey?: string, offerPrice = getShopOfferPrice(item)) {
    if (offerKey && shopSoldOfferKeys.includes(offerKey)) {
      setMessage("🎁 이미 SOLD OUT 된 상품입니다. 다음 입고를 기다려주세요.");
      return;
    }
    if (cash < offerPrice) {
      setMessage(`🎁 ${item.name} 구매에는 ${offerPrice.toLocaleString()}원이 필요합니다.`);
      return;
    }
    setCash((money) => money - offerPrice);
    setOwnedItems((owned) => [...owned, item.id]);
    setDiscoveredItems((items) => Array.from(new Set([...items, item.id])));
    if (offerKey) setShopSoldOfferKeys((keys) => Array.from(new Set([...keys, offerKey])));
    setShopPurchaseCount((count) => count + 1);
    setShopLevel((level) => Math.min(5, Math.max(level, 1 + Math.floor((shopPurchaseCount + 1) / 5))));
    setMessage(`🎁 ${item.rarity} 등급 ${item.name} 구매 완료!`);
  }

  function quickSellItem(itemId: ShopItemId, quantity = 1) {
    const item = shopItems.find((entry) => entry.id === itemId);
    const ownedCount = ownedItems.filter((id) => id === itemId).length;
    const sellCount = Math.min(ownedCount, Math.max(1, Math.floor(quantity)));
    if (!item || ownedCount <= 0 || sellCount <= 0) return;
    const sellValue = Math.floor(item.price * 0.5) * sellCount;
    setOwnedItems((items) => removeMany(items, itemId, sellCount));
    setEquippedItems((items) => removeMany(items, itemId, sellCount));
    setCash((money) => money + sellValue);
    setTotalIncome((income) => income + sellValue);
    setFinanceHistory((history) => [...history.slice(-17), { label: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }), income: sellValue, expense: 0, netWorth }]);
    setMessage(`🎁 ${item.name} ×${sellCount}개를 정가의 50%인 ${sellValue.toLocaleString()}원에 판매했습니다.`);
  }

  function pullGachaMachine() {
    const cost = getGachaMachineCost(gachaMachinePullCount);
    if (cash < cost) {
      setMessage(`🎰 가챠 자판기 이용에는 ${cost.toLocaleString()}원이 필요합니다.`);
      return;
    }
    setCash((money) => money - cost);
    const item = rollGachaItem(shopLevel);
    if (!item) {
      setGachaMachinePullCount((count) => count + 1);
      setMessage("🎰 아무것도 나오지 않았습니다... 극악 확률입니다.");
      return;
    }
    setOwnedItems((owned) => [...owned, item.id]);
    setDiscoveredItems((items) => Array.from(new Set([...items, item.id])));
    setShopPurchaseCount((count) => count + 1);
    setGachaMachinePullCount((count) => count + 1);
    setMessage(`🎰 가챠 성공! ${item.rarity} 등급 ${item.name} 획득!`);
  }

  function toggleEquipItem(itemId: ShopItemId) {
    if (!ownedItems.includes(itemId)) return;
    if (equippedItems.includes(itemId)) {
      setEquippedItems((equipped) => equipped.filter((id) => id !== itemId));
      return;
    }
    if (equippedItems.length >= itemSlotCount) {
      setMessage(`🎁 현재 칭호에서는 아이템을 ${itemSlotCount}개만 장착할 수 있습니다.`);
      return;
    }
    setEquippedItems((equipped) => [...equipped, itemId]);
  }

  function toggleFavoriteItem(itemId: ShopItemId) {
    setFavoriteItems((items) => items.includes(itemId) ? items.filter((id) => id !== itemId) : [...items, itemId]);
  }

  async function refreshMarketListings() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("game_item_market")
      .select("id, seller_id, seller_nickname, item_id, price, status, created_at")
      .eq("status", "listed")
      .order("created_at", { ascending: false })
      .limit(30);
    if (error) {
      console.warn("아이템 거래소를 불러오지 못했습니다:", error.message);
      setMarketListings([]);
      return;
    }
    setMarketListings((data ?? []) as MarketListing[]);
  }

  async function listItemForSale() {
    if (!userId || !sellItemId) return;
    const price = Math.floor(Number(sellPrice));
    const quantity = Math.max(1, Math.floor(Number(sellQuantity)));
    const ownedCount = ownedItems.filter((id) => id === sellItemId).length;
    if (!Number.isFinite(price) || price < 1000) {
      setMessage("🤝 판매 가격은 1,000원 이상이어야 합니다.");
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      setMessage("🤝 판매 수량은 1개 이상이어야 합니다.");
      return;
    }
    if (ownedCount < quantity) {
      setMessage(`🤝 보유 수량이 부족합니다. 현재 ${ownedCount}개 보유 중입니다.`);
      return;
    }
    const supabase = createClient();
    const rows = Array.from({ length: quantity }, () => ({
      seller_id: userId,
      seller_nickname: nickname,
      item_id: sellItemId,
      price,
      status: "listed",
    }));
    const { error } = await supabase.from("game_item_market").insert(rows);
    if (error) {
      setMessage(`🤝 판매 등록 실패: ${error.message}`);
      return;
    }
    setOwnedItems((items) => removeMany(items, sellItemId, quantity));
    setEquippedItems((items) => removeMany(items, sellItemId, quantity));
    setSellItemId("");
    setSellQuantity("1");
    setMessage(`🤝 아이템 ×${quantity}개를 거래소에 등록했습니다.`);
    refreshMarketListings();
  }

  async function cancelMarketListing(listing: MarketListing) {
    if (!userId || listing.seller_id !== userId) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("game_item_market")
      .update({ status: "cancelled" })
      .eq("id", listing.id)
      .eq("seller_id", userId);
    if (error) {
      setMessage(`🤝 회수 실패: ${error.message}`);
      return;
    }
    setOwnedItems((items) => [...items, listing.item_id]);
    setDiscoveredItems((items) => Array.from(new Set([...items, listing.item_id])));
    setMessage("🤝 거래소에 올린 아이템을 회수했습니다.");
    refreshMarketListings();
  }

  async function buyMarketListing(listing: MarketListing) {
    if (!userId) return;
    const price = Number(listing.price);
    if (listing.seller_id === userId) {
      setMessage("🤝 내 매물은 직접 구매할 수 없습니다.");
      return;
    }
    if (cash < price) {
      setMessage("🤝 현금이 부족합니다.");
      return;
    }
    const supabase = createClient();
    const { error } = await supabase.rpc("buy_market_item", { p_listing_id: listing.id });
    if (error) {
      setMessage(`🤝 구매 실패: ${error.message}`);
      return;
    }
    setCash((money) => money - price);
    setOwnedItems((items) => [...items, listing.item_id]);
    setDiscoveredItems((items) => Array.from(new Set([...items, listing.item_id])));
    setMessage("🤝 유저 거래소에서 아이템을 구매했습니다.");
    refreshMarketListings();
  }

  function handleStreetBuildingClick(buildingId: StreetBuildingId) {
    if (buildingId === "stocks") {
      setLobbyView("stocks");
      return;
    }

    if (buildingId === "casino") {
      setLobbyView("casino");
      refreshCasinoData();
      return;
    }

    if (buildingId === "bank" || buildingId === "estate" || buildingId === "business" || buildingId === "news" || buildingId === "insurance" || buildingId === "employees" || buildingId === "auction" || buildingId === "academy" || buildingId === "gacha" || buildingId === "itemMarket" || buildingId === "lotto" || buildingId === "luxury") {
      setLobbyView(buildingId);
      return;
    }

    setCareerBuildingId(buildingId);
    setLobbyView("career");
  }

  function handleLuxuryPurchase(price: number, successMessage: string, apply: () => void) {
    if (cash < price) {
      setMessage(`현금이 부족합니다. ${price.toLocaleString()}원이 필요합니다.`);
      return;
    }

    setCash((prev) => prev - price);
    apply();
    setMessage(successMessage);
  }

  function buyNicknameColorTheme(theme: NicknameColorTheme) {
    if (ownedNicknameColors.includes(theme.id)) {
      setSelectedNicknameColorId(theme.id);
      setMessage(`닉네임 색상 "${theme.name}" 적용 완료!`);
      return;
    }

    handleLuxuryPurchase(theme.price, `닉네임 색상 "${theme.name}" 구매 후 적용 완료!`, () => {
      setOwnedNicknameColors((prev) => Array.from(new Set<NicknameColorId>([...prev, theme.id])));
      setSelectedNicknameColorId(theme.id);
    });
  }

  function buyNicknameTagItem(tag: NicknameTagItem) {
    if (ownedNicknameTags.includes(tag.id)) {
      setSelectedNicknameTagId(tag.id);
      setMessage(`이름표 "${tag.name}" 적용 완료!`);
      return;
    }

    handleLuxuryPurchase(tag.price, `이름표 "${tag.name}" 구매 후 적용 완료!`, () => {
      setOwnedNicknameTags((prev) => Array.from(new Set<NicknameTagId>([...prev, tag.id])));
      setSelectedNicknameTagId(tag.id);
    });
  }

  function buyMainBackgroundItem(background: MainBackgroundOption) {
    if (ownedMainBackgrounds.includes(background.id)) {
      setSelectedMainBackgroundId(background.id);
      setMessage(`메인 배경 "${background.name}" 적용 완료!`);
      return;
    }

    handleLuxuryPurchase(background.price, `메인 배경 "${background.name}" 구매 후 적용 완료!`, () => {
      setOwnedMainBackgrounds((prev) => Array.from(new Set<MainBackgroundId>([...prev, background.id])));
      setSelectedMainBackgroundId(background.id);
    });
  }

  function buyMainCharacterItem(character: MainCharacterOption) {
    if (ownedMainCharacters.includes(character.id)) {
      setSelectedMainCharacterId(character.id);
      setMessage(`메인 캐릭터 "${character.name}" 적용 완료!`);
      return;
    }

    handleLuxuryPurchase(character.price, `메인 캐릭터 "${character.name}" 구매 후 적용 완료!`, () => {
      setOwnedMainCharacters((prev) => Array.from(new Set<MainCharacterId>([...prev, character.id])));
      setSelectedMainCharacterId(character.id);
    });
  }

  async function resignOccupation() {
    if (occupationId === "unemployed") {
      setMessage("이미 백수 상태입니다.");
      return;
    }

    setOccupationId("unemployed");
    setOccupationLevel(0);
    setUnlockedOccupations(["unemployed"]);

    if (userId) {
      window.localStorage.setItem(`alba-money-occupation-${userId}`, "unemployed");
      window.localStorage.setItem(`alba-money-unlocked-occupations-${userId}`, JSON.stringify(["unemployed"]));
      await saveProfilePatch({ occupation_id: "unemployed", occupation_level: 0, unlocked_occupations: ["unemployed"] });
    }

    setMessage("현재 직업을 포기했습니다. 다시 NPC 전직 퀘스트를 통해 새 직업을 얻을 수 있습니다.");
  }

  function challengeOccupation(nextOccupationId: OccupationId) {
    const nextOccupation = occupationInfo[nextOccupationId];

    if (occupationId === nextOccupationId) {
      setMessage(`이미 ${nextOccupation.icon} ${nextOccupation.name} 직업을 가지고 있습니다.`);
      return;
    }

    const isSequentialPromotion = occupationId !== "unemployed" && nextOccupation.requiredPrevious === occupationId;
    if (occupationId !== "unemployed" && !isSequentialPromotion) {
      setMessage(`현재 ${occupationInfo[occupationId].name} 직업을 가진 상태입니다. 다른 계열 직업을 얻으려면 먼저 현재 직업을 포기해야 합니다.`);
      return;
    }

    if (!canChallengeOccupation(nextOccupationId)) {
      setMessage(`${nextOccupation.questNpc ?? "전직 NPC"}: 아직 전직 퀘스트 조건이 부족합니다. ${nextOccupation.conditionText}`);
      return;
    }

    startCareerTypingGame(nextOccupation);
  }

  function startCareerTypingGame(nextOccupation: Occupation) {
    setCareerMiniGame(nextOccupation);
    setCareerMiniGameScore(0);
    setCareerMiniGameStep(0);
    setCareerTypingMistakes(0);
    setCareerFinanceAnswer("");
    prepareCareerMiniGameRound(nextOccupation, 0, 0);
    setMessage(`${nextOccupation.questNpc ?? "전직 NPC"}의 전직 퀘스트 시작! ${nextOccupation.name} 미니게임을 클리어하면 직업을 획득합니다.`);
  }

  function prepareCareerMiniGameRound(nextOccupation: Occupation, nextStep: number, nextMistakes: number) {
    const mode = getCareerGameMode(nextOccupation);
    setCareerMiniGameStep(nextStep);
    setCareerTypingMistakes(nextMistakes);
    setCareerFinanceAnswer("");
    setCareerTypingTimeLeft(getCareerTimeLimit(nextOccupation));

    if (mode === "office") {
      setCareerKeySequence(makeCareerOfficeSequence(nextOccupation, nextStep));
      setCareerKeyIndex(0);
      setCareerTypingPrompt("업무 키를 순서대로 처리하세요. 틀리면 실수가 누적됩니다.");
      setCareerLogisticsBlocks([]);
      return;
    }

    if (mode === "rhythm") {
      setCareerKeySequence(makeCareerRhythmSequence(nextOccupation, nextStep));
      setCareerKeyIndex(0);
      setCareerTypingPrompt("박자에 맞춰 키를 순서대로 입력하세요. 연예계 테스트는 속도가 중요합니다.");
      setCareerLogisticsBlocks([]);
      return;
    }

    if (mode === "logistics") {
      setCareerKeySequence(makeCareerLogisticsTargets(nextOccupation, nextStep));
      setCareerKeyIndex(0);
      setCareerLogisticsColumn(2);
      setCareerLogisticsBlocks([]);
      setCareerTypingPrompt("A/D 또는 방향키로 이동하고 Space/Enter로 블록을 내려 목표 열에 맞추세요.");
      return;
    }

    const financeRound = makeCareerFinanceRound(nextOccupation, nextStep);
    setCareerTypingPrompt(financeRound.prompt);
    setCareerKeySequence(financeRound.choices);
    setCareerKeyIndex(0);
    setCareerFinanceAnswer(financeRound.answer);
    setCareerLogisticsBlocks([]);
  }

  async function pressCareerSequenceKey(key: string) {
    if (!careerMiniGame) return;
    const expected = careerKeySequence[careerKeyIndex];

    if (key !== expected) {
      await completeCareerMiniGameRound(false, `❌ ${expected} 키를 눌러야 했습니다.`);
      return;
    }

    const nextIndex = careerKeyIndex + 1;
    setCareerKeyIndex(nextIndex);

    if (nextIndex >= careerKeySequence.length) {
      await completeCareerMiniGameRound(true, "✅ 업무 처리를 정확히 완료했습니다.");
    }
  }

  async function placeCareerLogisticsBlock() {
    if (!careerMiniGame) return;
    const expectedColumn = Number(careerKeySequence[careerKeyIndex]);
    const row = 6 - Math.min(6, careerLogisticsBlocks.filter((block) => block.column === careerLogisticsColumn).length);
    const nextBlocks = [...careerLogisticsBlocks, { column: careerLogisticsColumn, row, label: careerKeyIndex % 2 === 0 ? "📦" : "🧱" }];
    setCareerLogisticsBlocks(nextBlocks);

    if (careerLogisticsColumn !== expectedColumn) {
      await completeCareerMiniGameRound(false, `❌ 목표 ${expectedColumn + 1}번 라인이 아니라 ${careerLogisticsColumn + 1}번 라인에 놓았습니다.`);
      return;
    }

    const nextIndex = careerKeyIndex + 1;
    setCareerKeyIndex(nextIndex);

    if (nextIndex >= careerKeySequence.length) {
      await completeCareerMiniGameRound(true, "✅ 물류 블록을 모두 맞게 적재했습니다.");
      return;
    }

    setMessage(`📦 좋아요. 다음 목표 라인: ${Number(careerKeySequence[nextIndex]) + 1}번`);
  }

  async function chooseCareerFinanceAnswer(choice: string) {
    if (!careerMiniGame) return;
    await completeCareerMiniGameRound(choice === careerFinanceAnswer, choice === careerFinanceAnswer ? "✅ 시장 판단이 맞았습니다." : `❌ 정답은 ${careerFinanceAnswer}였습니다.`);
  }

  async function completeCareerMiniGameRound(success: boolean, notice: string) {
    if (!careerMiniGame || !userId) return;

    const targetScore = getCareerTargetScore(careerMiniGame);
    const maxSteps = getCareerMaxSteps(careerMiniGame);
    const nextScore = careerMiniGameScore + (success ? 1 : 0);
    const nextStep = careerMiniGameStep + 1;
    const nextMistakes = careerTypingMistakes + (success ? 0 : 1);

    setCareerMiniGameScore(nextScore);
    setCareerMiniGameStep(nextStep);
    setCareerTypingMistakes(nextMistakes);

    if (nextScore >= targetScore) {
      const outcome = resolveCareerQuestOutcome(careerMiniGame, nextScore, nextStep, nextMistakes);
      await unlockOccupation(outcome.occupation, outcome.resultType);
      return;
    }

    if (nextStep >= maxSteps || nextMistakes >= 3) {
      await failCareerMiniGame(`${notice} 테스트에 실패했습니다. 난이도에 맞춰 더 정확하게 처리해보세요.`);
      return;
    }

    setMessage(notice);
    prepareCareerMiniGameRound(careerMiniGame, nextStep, nextMistakes);
  }

  async function failCareerMiniGame(reason: string) {
    if (!careerMiniGame) return;

    await logCareerMiniGame(careerMiniGame, "fail", 0);
    setMessage(reason);
    resetCareerMiniGame();
  }

  async function unlockOccupation(nextOccupation: Occupation, resultType: "normal" | "promotion" | "hidden" = "normal") {
    if (!userId) return;

    const nextUnlocked = normalizeUnlockedOccupations(["unemployed", nextOccupation.id]);
    setUnlockedOccupations(nextUnlocked);
    setOccupationId(nextOccupation.id);
    setOccupationLevel(nextOccupation.minigameDifficulty);
    window.localStorage.setItem(`alba-money-occupation-${userId}`, nextOccupation.id);
    window.localStorage.setItem(`alba-money-unlocked-occupations-${userId}`, JSON.stringify(nextUnlocked));

    await saveProfilePatch({ occupation_id: nextOccupation.id, occupation_level: nextOccupation.minigameDifficulty, unlocked_occupations: nextUnlocked });
    await logCareerMiniGame(nextOccupation, "success", nextOccupation.incomeEvery3Min);

    const resultMessage = resultType === "hidden"
      ? `🌟 완벽한 수행으로 숨겨진 길이 열렸습니다! ${nextOccupation.icon} ${nextOccupation.name} 히든 직업을 획득했습니다!`
      : resultType === "promotion"
        ? `🚀 퀘스트를 아주 잘 수행해서 한 단계 더 좋은 직업으로 발탁되었습니다! ${nextOccupation.icon} ${nextOccupation.name} 획득!`
        : `🎉 ${nextOccupation.questNpc ?? "전직 NPC"}의 퀘스트 완료! ${nextOccupation.icon} ${nextOccupation.name} 직업을 획득했습니다!`;

    setMessage(resultMessage);
    resetCareerMiniGame();
  }

  async function logCareerMiniGame(nextOccupation: Occupation, result: "success" | "fail", reward: number) {
    if (!userId) return;

    const supabase = createClient();
    const { error } = await supabase.from("game_career_logs").insert({
      user_id: userId,
      occupation_id: nextOccupation.id,
      career_level: nextOccupation.minigameDifficulty,
      result,
      reward,
    });

    if (error) console.warn("직업 테스트 기록 저장 실패:", error.message);
  }

  function resetCareerMiniGame() {
    setCareerMiniGame(null);
    setCareerMiniGameScore(0);
    setCareerMiniGameStep(0);
    setCareerTypingPrompt("");
    setCareerTypingTimeLeft(0);
    setCareerTypingMistakes(0);
    setCareerKeySequence([]);
    setCareerKeyIndex(0);
    setCareerLogisticsBlocks([]);
    setCareerLogisticsColumn(2);
    setCareerFinanceAnswer("");
  }

  async function saveProfilePatch(patch: Partial<{ nickname: string; room_kind: RoomKind; occupation_id: OccupationId; occupation_level: number; unlocked_occupations: OccupationId[]; current_title: PlayerTitleId }>) {
    if (!userId) return;

    const supabase = createClient();
    const { error } = await supabase.from(PROFILE_TABLE).upsert(
      {
        id: userId,
        nickname,
        room_kind: roomKind,
        occupation_id: occupationId,
        occupation_level: occupationLevel,
        unlocked_occupations: unlockedOccupations,
        current_title: currentTitleId,
        net_worth: netWorth,
        updated_at: new Date().toISOString(),
        ...patch,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("프로필 부분 저장 실패:", error.message);
    }
  }

  async function loadGlobalChat() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(CHAT_TABLE)
      .select("id, user_id, nickname, title_name, message, kind, created_at")
      .order("created_at", { ascending: false })
      .limit(40);

    if (error) {
      console.warn("전체 채팅을 불러오지 못했습니다:", error.message);
      return;
    }

    setChatMessages(((data ?? []) as ChatMessageRow[]).reverse());
  }

  async function sendGlobalChatMessage(messageOverride?: string, kind: "user" | "system" = "user") {
    const message = (messageOverride ?? chatInput).trim().slice(0, 120);
    if (!message) return;

    const supabase = createClient();
    const { error } = await supabase.from(CHAT_TABLE).insert({
      user_id: kind === "system" ? null : userId,
      nickname: kind === "system" ? "시스템" : nickname,
      title_name: kind === "system" ? "공지" : currentTitle.name,
      message,
      kind,
    });

    if (error) {
      console.warn("전체 채팅 전송 실패:", error.message);
      setMessage("채팅 전송에 실패했습니다. Supabase 채팅 테이블을 확인해주세요.");
      return;
    }

    if (!messageOverride) setChatInput("");
    await loadGlobalChat();
  }

  async function refreshRanking(currentNickname = nickname) {
    if (!userId) return;

    const fallbackRows = makeRankingRows(currentNickname, rankingMode === "collection" ? discoveredItems.length : netWorth, occupationInfo[occupationId].name);
    const supabase = createClient();

    const { data: profiles, error: profilesError } = await supabase
      .from(PROFILE_TABLE)
      .select("id, nickname, room_kind, occupation_id, occupation_level, unlocked_occupations, current_title, net_worth")
      .limit(1000);

    if (profilesError || !profiles || profiles.length === 0) {
      if (profilesError) console.warn("랭킹 프로필 불러오기 실패:", profilesError.message);
      setRankingRows(fallbackRows);
      setRankingUpdatedAt(new Date());
      return;
    }

    const typedProfiles = profiles as ProfileRow[];
    const ids = typedProfiles.map((profile) => profile.id);

    const { data: saves, error: savesError } = await supabase
      .from("game_saves")
      .select("user_id, cash")
      .in("user_id", ids);

    if (savesError) {
      console.warn("랭킹 현금 데이터 불러오기 실패:", savesError.message);
    }

    const { data: economyRows, error: economyError } = await supabase
      .from(ECONOMY_TABLE)
      .select("user_id, data")
      .in("user_id", ids);

    if (economyError) {
      console.warn("랭킹 경제 데이터 불러오기 실패:", economyError.message);
    }

    const typedSaves = (saves ?? []) as RankingSaveRow[];
    const saveMap = new Map<string, RankingSaveRow>(typedSaves.map((save) => [save.user_id, save]));
    const normalizeEconomyData = (value: unknown): Record<string, unknown> => {
      if (!value) return {};
      if (typeof value === "string") return safeJsonParse<Record<string, unknown>>(value, {});
      if (typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
      return {};
    };

    const economyMap = new Map<string, Record<string, unknown>>(
      ((economyRows ?? []) as Array<{ user_id: string; data?: unknown }>).map((row) => [row.user_id, normalizeEconomyData(row.data)])
    );

    const getNumberFromEconomy = (data: Record<string, unknown>, key: string) => {
      const value = data[key];
      return typeof value === "number" && Number.isFinite(value) ? value : 0;
    };

    const getIdArrayFromEconomy = <T extends string>(data: Record<string, unknown>, key: string, validIds: readonly T[]) => {
      const value = data[key];
      if (!Array.isArray(value)) return [] as T[];
      return value.filter((id): id is T => typeof id === "string" && (validIds as readonly string[]).includes(id));
    };

    const estateIds = estateItems.map((item) => item.id);
    const businessIds = businessItems.map((item) => item.id);

    const calculateRankingNetWorth = (profile: ProfileRow) => {
      if (profile.id === userId) return netWorth;

      const save = saveMap.get(profile.id);
      const economy = economyMap.get(profile.id) ?? {};
      const savedCash = Number(save?.cash ?? 0);
      const bankDepositValue = getNumberFromEconomy(economy, "bankDeposit");
      const bankSavingsValue = getNumberFromEconomy(economy, "bankSavings");
      const bankLoanValue = getNumberFromEconomy(economy, "bankLoan");
      const ownedEstateIds = getIdArrayFromEconomy(economy, "ownedEstates", estateIds);
      const ownedBusinessIds = getIdArrayFromEconomy(economy, "ownedBusinesses", businessIds);
      const estateValue = ownedEstateIds.reduce((sum, id) => sum + (estateItems.find((item) => item.id === id)?.price ?? 0), 0);
      const businessValue = ownedBusinessIds.reduce((sum, id) => sum + (businessItems.find((item) => item.id === id)?.price ?? 0), 0);
      const computed = savedCash + bankDepositValue + bankSavingsValue + estateValue + businessValue - bankLoanValue;

      if (computed > 0) return computed;
      return Number(profile.net_worth ?? 0);
    };

    const rows = typedProfiles
      .map((profile) => {
        const save = saveMap.get(profile.id);
        const economy = economyMap.get(profile.id) ?? {};
        const profileOccupationId = profile.occupation_id && profile.occupation_id in occupationInfo ? (profile.occupation_id as OccupationId) : "unemployed";
        const profileTitle = playerTitles.find((title) => title.id === (profile.id === userId ? currentTitleId : profile.current_title)) ?? playerTitles[0];
        const discoveredRaw = economy.discoveredItems;
        const discoveredList = Array.isArray(discoveredRaw)
          ? discoveredRaw
          : typeof discoveredRaw === "string"
            ? safeJsonParse<unknown[]>(discoveredRaw, [])
            : [];
        const discoveredCount = profile.id === userId
          ? new Set(discoveredItems).size
          : new Set(discoveredList.filter((id) => typeof id === "string" && shopItems.some((item) => item.id === id))).size;
        return {
          rank: 0,
          nickname: profile.id === userId ? currentNickname : profile.nickname || "이름 없음",
          nicknameColorId: profile.id === userId
            ? selectedNicknameColorId
            : (typeof economy.selectedNicknameColorId === "string" && (economy.selectedNicknameColorId === defaultNicknameColorTheme.id || luxuryNicknameColors.some((theme) => theme.id === economy.selectedNicknameColorId))
              ? (economy.selectedNicknameColorId as NicknameColorId)
              : defaultNicknameColorTheme.id),
          cash: rankingMode === "collection" ? discoveredCount : Math.max(0, Math.floor(calculateRankingNetWorth(profile))),
          hasSave: !!save,
          job: profile.id === userId ? occupationInfo[occupationId].name : occupationInfo[profileOccupationId].name,
          titleName: profileTitle.name,
          titleIcon: profileTitle.icon,
          isMe: profile.id === userId,
        };
      })
      .sort((a, b) => b.cash - a.cash)
      .slice(0, 5)
      .map((row, index) => ({ ...row, rank: index + 1 }));

    setRankingRows(rows.length > 0 ? rows : fallbackRows);
    setRankingUpdatedAt(new Date());
  }

  async function refreshCasinoData() {
    if (!userId) return;

    const supabase = createClient();

    const { data: profiles, error: profilesError } = await supabase
      .from(PROFILE_TABLE)
      .select("id, nickname, occupation_id")
      .limit(1000);

    if (profilesError) {
      console.warn("도박장 유저 목록 불러오기 실패:", profilesError.message);
      return;
    }

    const typedProfiles = (profiles ?? []) as ProfileRow[];
    const profileIds = typedProfiles.map((profile) => profile.id);

    const { data: saves, error: savesError } = await supabase
      .from("game_saves")
      .select("user_id, cash")
      .in("user_id", profileIds.length > 0 ? profileIds : [userId]);

    if (savesError) {
      console.warn("도박장 자금 불러오기 실패:", savesError.message);
    }

    const saveMap = new Map<string, RankingSaveRow>(
      ((saves ?? []) as RankingSaveRow[]).map((save) => [save.user_id, save])
    );

    const users = typedProfiles
      .filter((profile) => profile.id !== userId)
      .map((profile) => {
        const profileOccupationId = profile.occupation_id && profile.occupation_id in occupationInfo ? (profile.occupation_id as OccupationId) : "unemployed";
        return {
          id: profile.id,
          nickname: profile.nickname || `유저-${profile.id.slice(0, 8)}`,
          cash: Number(saveMap.get(profile.id)?.cash ?? 0),
          job: occupationInfo[profileOccupationId].name,
        };
      })
      .sort((a, b) => b.cash - a.cash);

    setCasinoUsers(users);

    if (!selectedOpponentId && users.length > 0) {
      setSelectedOpponentId(users[0].id);
    }

    const { data: matches, error: matchesError } = await supabase
      .from("game_pvp_matches")
      .select("id, challenger_id, opponent_id, stake, status, challenger_score, opponent_score, winner_id, game_type, created_at, accepted_at, finished_at")
      .or(`challenger_id.eq.${userId},opponent_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .limit(20);

    if (matchesError) {
      console.warn("대전 목록 불러오기 실패:", matchesError.message);
      return;
    }

    setPvpMatches(((matches ?? []) as PvpMatchRow[]).map(normalizePvpMatch));
  }

  async function playSlotMachine() {
    if (!userId || isSlotPlaying) return;

    const stake = Math.floor(Number(slotStake));
    if (!Number.isFinite(stake) || stake < 100) {
      setMessage("🎰 슬롯 머신 최소 베팅 금액은 100원입니다.");
      return;
    }

    if (stake > cash) {
      setMessage("🎰 보유 현금보다 많이 걸 수 없습니다.");
      return;
    }

    setIsSlotPlaying(true);
    setSlotResult(null);
    setSlotLeverDown(true);

    if (slotSpinIntervalRef.current) {
      window.clearInterval(slotSpinIntervalRef.current);
      slotSpinIntervalRef.current = null;
    }

    setSlotReels(getRandomSlotSymbols());
    slotSpinIntervalRef.current = window.setInterval(() => {
      setSlotReels(getRandomSlotSymbols());
    }, 110);

    try {
      const supabase = createClient();
      const rpcPromise = supabase.rpc("play_slot_machine", { p_stake: stake });
      await delay(1600);
      const { data, error } = await rpcPromise;

      if (slotSpinIntervalRef.current) {
        window.clearInterval(slotSpinIntervalRef.current);
        slotSpinIntervalRef.current = null;
      }

      setSlotLeverDown(false);
      setIsSlotPlaying(false);

      if (error) {
        setMessage(`🎰 슬롯 실패: ${error.message}`);
        setSlotReels(["💥", "💥", "💥"]);
        return;
      }

      const rawResult = data as SlotResult;
      const lossCashback = rawResult.profit < 0 ? Math.floor(Math.abs(rawResult.profit) * insuranceCasinoCashback) : 0;
      const result = { ...rawResult, profit: rawResult.profit + lossCashback, reward: rawResult.reward + lossCashback };
      setSlotResult(result);
      setSlotReels(getSlotDisplaySymbols(result.result));
      setCash((money) => Math.max(0, money + Number(result.profit ?? 0)));
      setMessage(lossCashback > 0 ? `${getSlotResultMessage(rawResult)} · 🛡️ 보험 환급 +${lossCashback.toLocaleString()}원` : getSlotResultMessage(result));
      refreshRanking();
      refreshCasinoData();
    } catch (error) {
      if (slotSpinIntervalRef.current) {
        window.clearInterval(slotSpinIntervalRef.current);
        slotSpinIntervalRef.current = null;
      }
      setSlotLeverDown(false);
      setIsSlotPlaying(false);
      setMessage(`🎰 슬롯 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`);
    }
  }

  async function createPvpChallenge() {
    if (!userId) return;

    const stake = Math.floor(Number(pvpStake));
    if (!selectedOpponentId) {
      setPvpMessage("상대를 먼저 선택하세요.");
      return;
    }

    if (!Number.isFinite(stake) || stake < 100) {
      setPvpMessage("최소 판돈은 100원입니다.");
      return;
    }

    if (stake > cash) {
      setPvpMessage("보유 현금보다 많이 걸 수 없습니다.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.rpc("create_pvp_match", {
      p_opponent_id: selectedOpponentId,
      p_stake: stake,
    });

    if (error) {
      setPvpMessage(`도전 생성 실패: ${error.message}`);
      return;
    }

    setCash((money) => Math.max(0, money - stake));
    setPvpMessage("도전장을 보냈습니다. 상대가 수락하면 반응속도 미니게임을 시작할 수 있습니다.");
    refreshRanking();
    refreshCasinoData();
  }

  async function acceptPvpChallenge(match: PvpMatchRow) {
    if (!userId) return;
    const stake = Number(match.stake);

    if (stake > cash) {
      setPvpMessage("수락하기에는 보유 현금이 부족합니다.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.rpc("accept_pvp_match", { p_match_id: match.id });

    if (error) {
      setPvpMessage(`대전 수락 실패: ${error.message}`);
      return;
    }

    setCash((money) => Math.max(0, money - stake));
    const acceptedMatch = { ...match, status: "accepted" as const };
    setActivePvpMatch(acceptedMatch);
    resetPvpReaction(acceptedMatch);
    setPvpMessage("대전을 수락했습니다. 반응속도 미니게임을 시작하세요.");
    refreshRanking();
    refreshCasinoData();
  }

  function startPvpReaction(match: PvpMatchRow) {
    setActivePvpMatch(match);
    resetPvpReaction(match);
  }

  function resetPvpReaction(match = activePvpMatch) {
    setActivePvpMatch(match);
    setPvpReactionState("idle");
    setPvpReactionStartAt(0);
    setPvpReactionScore(0);
  }

  function beginPvpReactionRound() {
    if (!activePvpMatch) return;

    setPvpReactionState("waiting");
    setPvpReactionScore(0);

    const delay = 1000 + Math.floor(Math.random() * 2200);
    window.setTimeout(() => {
      setPvpReactionStartAt(Date.now());
      setPvpReactionState("go");
    }, delay);
  }

  async function hitPvpReactionButton() {
    if (!activePvpMatch) return;

    if (pvpReactionState === "waiting") {
      setPvpReactionScore(1);
      setPvpReactionState("submitted");
      await submitPvpScore(activePvpMatch, 1);
      return;
    }

    if (pvpReactionState !== "go") return;

    const reactionMs = Math.max(1, Date.now() - pvpReactionStartAt);
    const score = Math.max(1, 1200 - reactionMs);
    setPvpReactionScore(score);
    setPvpReactionState("submitted");
    await submitPvpScore(activePvpMatch, score);
  }

  async function submitPvpScore(match: PvpMatchRow, score: number) {
    if (!userId) return;

    const supabase = createClient();
    const { data, error } = await supabase.rpc("finish_pvp_match", {
      p_match_id: match.id,
      p_my_score: Math.max(1, Math.floor(score)),
    });

    if (error) {
      setPvpMessage(`점수 제출 실패: ${error.message}`);
      return;
    }

    const result = data as PvpSubmitResult;
    if (result.status === "finished") {
      const won = result.winner_id === userId;
      const reward = Math.floor(Number(result.reward ?? 0) * (1 + casinoLuckBonus));
      if (won) setCash((money) => money + reward);
      setPvpMessage(won ? `🏆 승리! 상금 ${reward.toLocaleString()}원을 획득했습니다.` : "패배했습니다. 다음 대전에 다시 도전하세요.");
    } else {
      setPvpMessage("점수를 제출했습니다. 상대 점수를 기다리는 중입니다.");
    }

    refreshRanking();
    refreshCasinoData();
  }

  async function fetchGlobalStockMarket() {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("sync_global_stock_market");

      if (error) {
        console.warn("전역 주식 시장 동기화 실패. 저장된 전역 시세를 조회합니다:", error.message);
      }

      const { data: tableRow, error: tableError } = await supabase
        .from(GLOBAL_STOCK_TABLE)
        .select("rows, news_events, updated_at, news_updated_at")
        .eq("market_id", "main")
        .maybeSingle<GlobalStockMarketResultRow>();

      if (!tableError && tableRow) {
        return parseGlobalStockMarketResult(tableRow);
      }

      if (tableError) {
        console.warn("전역 주식 시장 테이블 조회 실패:", tableError.message);
      }

      return parseGlobalStockMarketResult(data as GlobalStockMarketResult);
    } catch (error) {
      console.warn("전역 주식 시장 동기화 실패. 임시 로컬 시세를 사용합니다:", error);
      return null;
    }
  }

  async function syncGlobalStockMarket() {
    if (globalStockSyncingRef.current) return;
    globalStockSyncingRef.current = true;

    try {
      const globalMarket = await fetchGlobalStockMarket();
      if (!globalMarket) return;

      setNewsEvents(globalMarket.newsEvents);
      setEconomyUpdatedAt(globalMarket.newsUpdatedAt);
      setStockUpdatedAt(globalMarket.updatedAt);
      setStockCountdownMs(getStockRemainingMs(globalMarket.updatedAt));
      setStockRows((current) => mergeGlobalPricesWithOwned(globalMarket.rows, current));
    } finally {
      globalStockSyncingRef.current = false;
    }
  }

  function persistStocksNow(rows: StockRow[], updatedAt: Date = stockUpdatedAt) {
    if (!userId) return;
    const currentUserId = userId;

    const ownedOnlyRows = extractOwnedStockRows(rows);
    const payload = { rows: ownedOnlyRows, updatedAt: updatedAt.toISOString() };
    window.localStorage.setItem(`alba-money-stocks-${currentUserId}`, JSON.stringify(payload));

    try {
      const supabase = createClient();
      void supabase.from(STOCK_TABLE).upsert(
        {
          user_id: currentUserId,
          rows: ownedOnlyRows,
          updated_at: updatedAt.toISOString(),
        },
        { onConflict: "user_id" }
      );
    } catch (error) {
      console.warn("주식 즉시 저장 실패. localStorage에는 저장되었습니다:", error);
    }
  }

  function buyStock(stockId: StockId, amount = 1) {
    const stock = stockRows.find((row) => row.id === stockId);
    if (!stock) return;

    const buyAmount = Math.max(1, Math.floor(amount));
    const totalPrice = stock.price * buyAmount;

    if (cash < totalPrice) {
      setMessage("현금이 부족해서 주식을 살 수 없습니다.");
      return;
    }

    const nextRows = stockRows.map((row) => {
      if (row.id !== stockId) return row;
      const previousOwned = Math.max(0, row.owned);
      const previousAverage = Math.max(0, Number(row.averageBuyPrice) || 0);
      const nextOwned = previousOwned + buyAmount;
      const nextAverage = nextOwned > 0
        ? Math.round(((previousAverage * previousOwned) + totalPrice) / nextOwned)
        : 0;

      return {
        ...row,
        owned: nextOwned,
        averageBuyPrice: nextAverage,
      };
    });

    setCash((money) => money - totalPrice);
    setStockRows(nextRows);
    persistStocksNow(nextRows);
    setMessage(`${stock.name} ${buyAmount.toLocaleString()}주를 총 ${totalPrice.toLocaleString()}원에 매수했습니다.`);
  }

  function buyMaxStock(stockId: StockId) {
    const stock = stockRows.find((row) => row.id === stockId);
    if (!stock) return;

    const amount = Math.floor(cash / stock.price);
    if (amount <= 0) {
      setMessage("현금이 부족해서 주식을 살 수 없습니다.");
      return;
    }

    buyStock(stockId, amount);
  }

  function sellStock(stockId: StockId, amount = 1) {
    const stock = stockRows.find((row) => row.id === stockId);
    if (!stock || stock.owned <= 0) return;

    const sellAmount = Math.min(stock.owned, Math.max(1, Math.floor(amount)));
    const baseTotalPrice = stock.price * sellAmount;
    const totalPrice = baseTotalPrice;

    const nextRows = stockRows.map((row) => {
      if (row.id !== stockId) return row;
      const nextOwned = Math.max(0, row.owned - sellAmount);
      return {
        ...row,
        owned: nextOwned,
        averageBuyPrice: nextOwned > 0 ? row.averageBuyPrice : 0,
      };
    });

    setCash((money) => money + totalPrice);
    setStockRows(nextRows);
    persistStocksNow(nextRows);
    setMessage(`${stock.name} ${sellAmount.toLocaleString()}주를 총 ${totalPrice.toLocaleString()}원에 매도했습니다.`);
  }

  function sellAllStock(stockId: StockId) {
    const stock = stockRows.find((row) => row.id === stockId);
    if (!stock || stock.owned <= 0) return;
    sellStock(stockId, stock.owned);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  function renderMobileJobControls() {
    if (!activeJobId) return null;

    if (activeJobId === "sorting") {
      return (
        <div className="alba-mobile-only alba-mobile-touch-controls sorting" aria-label="모바일 택배 분류 조작">
          {getActiveSortKinds(difficulty).map((kind) => (
            <button key={kind} onClick={() => handleSortKey(sortInfo[kind].key)}>
              {sortInfo[kind].emoji} {sortInfo[kind].label}
            </button>
          ))}
        </div>
      );
    }

    if (activeJobId === "delivery") {
      return (
        <div className="alba-mobile-only alba-mobile-touch-controls delivery" aria-label="모바일 배달 조작">
          <button onClick={() => setRunnerLane((lane) => Math.max(0, lane - 1))}>◀ 왼쪽</button>
          <button onClick={() => setRunnerLane((lane) => Math.min(2, lane + 1))}>오른쪽 ▶</button>
        </div>
      );
    }

    if (activeJobId === "cashier") {
      return (
        <div className="alba-mobile-only alba-mobile-touch-controls cashier" aria-label="모바일 계산대 조작">
          {cashierKeyPool.map((key) => (
            <button key={key} onClick={() => handleCashierKey(key.toLowerCase())}>
              {key}
            </button>
          ))}
          <div className="wide" style={{ fontWeight: 900, textAlign: "center" }}>
            다음 입력: {cashierSequence[cashierIndex] ?? "완료"}
          </div>
        </div>
      );
    }

    if (activeJobId === "cafe") {
      return (
        <div className="alba-mobile-only alba-mobile-touch-controls cafe" aria-label="모바일 카페 조작">
          <button
            className="wide"
            onPointerDown={() => setCafeHolding(true)}
            onPointerUp={() => {
              setCafeHolding(false);
              judgeCafeFill();
            }}
            onPointerCancel={() => setCafeHolding(false)}
            onPointerLeave={() => setCafeHolding(false)}
          >
            꾹 눌러 따르기 / 떼면 판정
          </button>
        </div>
      );
    }

    if (activeJobId === "security") {
      return (
        <div className="alba-mobile-only alba-mobile-touch-controls security" aria-label="모바일 보안 조작">
          <button className="wide" onClick={handleSecurityAction}>수상한 사람 막기</button>
        </div>
      );
    }

    return null;
  }

  if (!isSaveLoaded) {
    return (
      <main style={loadingPageStyle}>
        <div style={{ textAlign: "center" }}>
          <h1>저장된 게임을 불러오는 중...</h1>
          <p>잠시만 기다려주세요.</p>
        </div>
      </main>
    );
  }

  if (activeJob) {
    return (
      <main className="alba-game-root" style={pageStyle}>
        <ResponsiveGameStyles />
        <section className="alba-job-only-layout" style={jobOnlyLayoutStyle}>
          <header className="alba-compact-header" style={compactHeaderStyle}>
            <div>
              <div style={smallLabelStyle}>진행 중인 알바</div>
              <h1 style={jobTitleStyle}>{activeJob.icon} {activeJob.name}</h1>
            </div>

            <div className="alba-top-status-group" style={topStatusGroupStyle}>
              <StatusPill label="현금" value={`${cash.toLocaleString()}원`} />
              <StatusPill label="난이도" value={`Lv.${difficulty}`} warning={difficulty >= 4} />
              <StatusPill label="세금" value={`${nextTax.toLocaleString()}원`} />
              <StatusPill label="세금까지" value={formatTime(taxCountdown)} warning={taxCountdown <= TAX_WARNING_SECONDS} />
              <button onClick={leaveJob} style={leaveButtonStyle}>방으로 가기</button>
            </div>
          </header>

          {difficultyNotice && <div style={difficultyBannerStyle}>{difficultyNotice}</div>}

          <section className="alba-job-stage" style={jobStageStyle}>
            {activeJobId === "sorting" && <SortingGame item={sortItem} combo={sortCombo} miss={sortMiss} difficulty={difficulty} />}
            {activeJobId === "delivery" && <DeliveryGame lane={runnerLane} obstacles={runnerObstacles} coins={runnerCoins} distance={runnerDistance} flash={runnerHitFlash} miss={runnerMiss} />}
            {activeJobId === "cashier" && <CashierGame sequence={cashierSequence} currentIndex={cashierIndex} success={cashierSuccess} miss={cashierMiss} difficulty={difficulty} />}
            {activeJobId === "cafe" && <CafeGame fill={cafeFill} targetStart={cafeTargetStart} targetEnd={cafeTargetEnd} success={cafeSuccess} miss={cafeMiss} holding={cafeHolding} difficulty={difficulty} />}
            {activeJobId === "security" && <SecurityGame signal={securitySignal} success={securitySuccess} miss={securityMiss} round={securityRound} />}
          </section>

          <footer className="alba-job-footer" style={jobFooterStyle}>
            <div style={messageBoxStyle}>{message}</div>
            <div style={controlHintStyle}>{getControlHint(activeJobId)}</div>
            {renderMobileJobControls()}
          </footer>
        </section>
      </main>
    );
  }

  return (
    <main className="alba-game-root" style={pageStyle}>
      <ResponsiveGameStyles />
      <section className="alba-world-layout" style={worldLayoutStyle}>
        <header className="alba-world-header" style={worldHeaderStyle}>
          <div className="alba-profile-area" style={profileAreaStyle}>
            <div style={smallLabelStyle}>ALBA MONEY GAME</div>
            <h1 className="alba-main-title" style={mainTitleStyle}><span style={getNicknameTextStyle(activeNicknameColor)}>{nickname}</span>의 하루</h1>
            <div style={buildNicknamePlateStyle(activeNicknameTag)}><span style={getNicknameTextStyle(activeNicknameColor)}>{nickname}</span><small style={profileNameplateMetaStyle}>{activeNicknameTag.name}</small></div>
            <div style={titleBadgeStyle}>{currentTitle.icon} {currentTitle.name}</div>
            <div className="alba-nickname-edit" style={nicknameEditStyle}>
              <input
                value={nicknameDraft}
                onChange={(event) => setNicknameDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveNickname();
                }}
                maxLength={12}
                placeholder="닉네임 입력"
                className="alba-nickname-input"
                style={nicknameInputStyle}
              />
              <button className="alba-small-action-button" onClick={saveNickname} style={smallActionButtonStyle}>닉네임 변경</button>
              <button className="alba-small-action-button" onClick={() => setLobbyView("titles")} style={smallActionButtonStyle}>칭호</button>
              <button className="alba-small-action-button" onClick={() => setChatOpen((open) => !open)} style={smallActionButtonStyle}>{chatOpen ? "채팅 끄기" : "채팅 켜기"}</button>
            </div>
          </div>

          <div className="alba-money-panel" style={moneyPanelStyle}>
            <StatusPill label="현금" value={`${cash.toLocaleString()}원`} />
            <StatusPill label="세율" value={`${(taxRate * 100).toFixed(0)}%`} />
            <StatusPill label="다음 세금" value={`${nextTax.toLocaleString()}원`} />
            <StatusPill label="미납" value={`${unpaidTax.toLocaleString()}원`} />
            <StatusPill label="저장" value={isSaving ? "저장 중" : saveMessage} warning={saveMessage.includes("실패")} />
          </div>
        </header>

        <nav className="alba-mobile-only alba-mobile-nav" aria-label="모바일 빠른 이동">
          <button onClick={() => setLobbyView("room")}>방</button>
          <button onClick={() => setLobbyView("street")}>길거리</button>
          <button onClick={() => setLobbyView("jobs")}>알바</button>
          <button onClick={() => setLobbyView("phone")}>휴대폰</button>
          <button onClick={() => setLobbyView("ranking")}>랭킹</button>
        </nav>

        <section className="alba-world-body" style={worldBodyStyle}>
          {lobbyView === "room" && (
            <div className="alba-room-scene" style={roomSceneStyle}>
              <div className="alba-room-money" style={roomMoneyStyle}>◎ {cash.toLocaleString()}</div>
              <div className="alba-room-info" style={roomInfoTextStyle}>
                <div style={{ ...buildNicknamePlateStyle(activeNicknameTag), minWidth: "fit-content" }}>
                  <span style={{ ...roomInfoNameStyle, ...getNicknameTextStyle(activeNicknameColor), fontSize: "20px" }}>{nickname}</span>
                </div>
                <span style={roomInfoLineStyle}>칭호 {currentTitle.name}</span>
                <span style={roomInfoLineStyle}>직업 {occupation.name}</span>
                <span style={roomInfoLineStyle}>세금까지 {formatTime(taxCountdown)}</span>
              </div>
              <RoomArtwork roomKind={roomKind} nickname={nickname} occupationName={occupation.name} backgroundId={selectedMainBackgroundId} characterId={selectedMainCharacterId} />
              <div style={hiddenLegacySceneStyle}>
                <div style={roomFloorStyle} />
                <div style={roomWindowStyle} />
                <div style={roomSofaStyle} />
                <div style={roomDeskStyle} />
                <div style={roomTvStyle} />
                <div style={roomCharacterStyle} />
              </div>
              <div className="alba-room-side-controls" style={roomSideControlsStyle}>
                <button className="alba-trophy-button" onClick={() => setLobbyView("ranking")} style={trophyButtonStyle}>🏆</button>
              </div>
              <div className="alba-room-nav" style={roomNavStyle}>
                <button onClick={() => setLobbyView("jobs")} className="alba-bottom-nav-button" style={bottomNavButtonStyle}>알바 가기</button>
                <button onClick={() => setLobbyView("street")} className="alba-bottom-nav-button" style={bottomNavButtonStyle}>길거리</button>
                <button onClick={() => setLobbyView("phone")} className="alba-bottom-nav-button" style={bottomNavButtonStyle}>휴대폰 확인</button>
              </div>
            </div>
          )}

          {lobbyView === "street" && (
            <div className="alba-street-scene" style={streetSceneStyle}>
              <div className="alba-street-money" style={streetMoneyStyle}>◎ {cash.toLocaleString()}</div>
              <StreetArtwork />

              <div className="alba-mobile-only alba-mobile-street-list" aria-label="모바일 길거리 건물 목록">
                {getStreetBuildingsForPage(streetPage).map((building) => (
                  <button key={`mobile-${building.id}`} onClick={() => handleStreetBuildingClick(building.id)}>
                    <span>{building.emoji}</span> {building.title}
                  </button>
                ))}
              </div>

              <div className="alba-street-page-info" style={streetPageInfoStyle}>
                <div style={smallLabelStyle}>STREET MAP</div>
                <strong>{streetPage + 1} / {streetBuildingPages.length} 구역</strong>
                <span>{getStreetPageLabel(streetPage)}</span>
              </div>

              <button
                onClick={() => setStreetPage((page) => Math.max(0, page - 1))}
                disabled={streetPage === 0}
                className="alba-street-page-arrow"
                style={{ ...streetPageArrowStyle, left: "14px", opacity: streetPage === 0 ? 0.45 : 1 }}
              >
                ◀
              </button>
              <button
                onClick={() => setStreetPage((page) => Math.min(streetBuildingPages.length - 1, page + 1))}
                disabled={streetPage === streetBuildingPages.length - 1}
                className="alba-street-page-arrow"
                style={{ ...streetPageArrowStyle, right: "14px", opacity: streetPage === streetBuildingPages.length - 1 ? 0.45 : 1 }}
              >
                ▶
              </button>

              <div className="alba-street-buildings-row" style={streetBuildingsRowStyle}>
                {getStreetBuildingsForPage(streetPage).map((building) => (
                  <button
                    key={building.id}
                    onClick={() => handleStreetBuildingClick(building.id)}
                    style={{
                      ...streetBuildingStyle,
                      ...getStreetBuildingTheme(building.id),
                      ...getStreetBuildingPlacement(building.id, streetPage),
                      height: getStreetBuildingHeight(building.id),
                    }}
                  >
                    <StreetBuildingFacade building={building} />
                  </button>
                ))}
              </div>
              <div className="alba-street-bottom-nav" style={streetBottomNavStyle}>
                <button onClick={() => setLobbyView("room")} className="alba-bottom-nav-button" style={bottomNavButtonStyle}>방으로 돌아가기</button>
              </div>
            </div>
          )}

          {lobbyView === "jobs" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>JOB OFFICE</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>알바 가기</h2>
                  <p style={panelDescStyle}>단기 알바를 선택해서 바로 돈을 벌 수 있습니다.</p>
                </div>
                <button onClick={() => setLobbyView("room")} className="alba-small-action-button" style={smallActionButtonStyle}>방으로</button>
              </div>

              <section className="alba-job-grid" style={jobGridStyle}>
                {jobs.map((job) => (
                  <button key={job.id} onClick={() => setSelectedJobId(job.id)} style={{ ...jobCardStyle, border: selectedJobId === job.id ? "2px solid #38bdf8" : "1px solid rgba(255,255,255,0.14)" }}>
                    <div style={jobIconStyle}>{job.icon}</div>
                    <h2 style={jobCardTitleStyle}>{job.name}</h2>
                    <p style={jobCardTextStyle}>{job.subtitle}</p>
                    <p style={rewardTextStyle}>{job.rewardText}</p>
                  </button>
                ))}
              </section>

              <footer style={officeFooterStyle}>
                <div style={messageBoxStyle}>{message}</div>
                <button onClick={() => startJob(selectedJob.id)} style={bigStartButtonStyle}>{selectedJob.icon} {selectedJob.name} 시작하기</button>
              </footer>
            </div>
          )}

          {lobbyView === "career" && (
            <div style={careerOfficeStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>CAREER OFFICE</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>{getCareerBuildingName(careerBuildingId)}</h2>
                  <p style={panelDescStyle}>
                    NPC에게서 현재 단계의 전직 퀘스트 1개만 받고, 수행 결과에 따라 기본 직업·상위 직업·히든 직업 중 하나를 얻을 수 있습니다. 현재 직업: {occupation.icon} {occupation.name} · 직업 수입까지 {formatTime(careerIncomeCountdown)}
                  </p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div className="alba-career-rpg-mobile-fix" style={rpgQuestLayoutStyle}>
                <aside style={rpgNpcPortraitStyle}>
                  <div style={rpgNpcAvatarStyle}>{getCareerNpcAvatar(careerBuildingId)}</div>
                  <strong>{getCareerQuestNpc(careerBuildingId)}</strong>
                  <span>{getCareerNpcLine(careerBuildingId)} 완벽하게 수행하면 예상보다 좋은 길이 열릴 수도 있습니다.</span>
                  <div style={rpgCurrentJobBoxStyle}>
                    <span>현재 직업</span>
                    <strong>{occupation.icon} {occupation.name}</strong>
                    {occupationId !== "unemployed" && (
                      <button onClick={() => void resignOccupation()} style={casinoDangerButtonStyle}>현재 직업 포기</button>
                    )}
                  </div>
                </aside>

                <section style={rpgDialoguePanelStyle}>
                  {currentCareerQuest && currentQuestCareer ? (
                    <>
                      <div style={rpgDialogueNameStyle}>{currentCareerQuest.npc}</div>
                      <div style={rpgDialogueBubbleStyle}>
                        <p style={rpgDialogueTextStyle}>{currentCareerQuest.story}</p>
                        <p style={rpgDialogueTextStyle}>“{currentCareerQuest.request}”</p>
                        {occupationId !== "unemployed" && currentQuestCareer.requiredPrevious !== occupationId && occupationId !== currentCareerQuest.targetId && (
                          <p style={rpgWarningTextStyle}>다른 계열로 전직하려면 먼저 현재 직업을 포기해야 합니다.</p>
                        )}
                      </div>

                      {careerRouteOptions.length > 1 && (
                        <div style={careerRouteChoicePanelStyle}>
                          <strong>진로 선택지가 열렸습니다</strong>
                          <span>현재 직업에서 이어지는 루트 중 하나를 선택하세요. 선택한 루트의 NPC 퀘스트가 아래에 표시됩니다.</span>
                          <div style={careerRouteChoiceGridStyle}>
                            {careerRouteOptions.map((quest) => {
                              const routeCareer = occupationInfo[quest.targetId];
                              const active = currentCareerQuest?.targetId === quest.targetId;
                              return (
                                <button key={quest.id} onClick={() => setSelectedCareerRouteId(quest.targetId)} style={{ ...careerRouteChoiceButtonStyle, borderColor: active ? "#2563eb" : "#111827", background: active ? "#dbeafe" : "#ffffff" }}>
                                  <strong>{routeCareer.icon} {routeCareer.name}</strong>
                                  <small>{quest.title}</small>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <div style={rpgQuestActionPanelStyle}>
                        <div>
                          <strong style={rpgQuestActionTitleStyle}>
                            {canChallengeOccupation(currentCareerQuest.targetId) ? "지금 할 일: 퀘스트를 수락하세요" : "지금 할 일: 조건을 먼저 채우세요"}
                          </strong>
                          <p style={rpgQuestActionTextStyle}>
                            {canChallengeOccupation(currentCareerQuest.targetId)
                              ? "버튼을 누르면 전직 미니게임이 시작됩니다. 수행 결과에 따라 기본 직업, 상위 직업, 히든 직업 중 하나를 얻을 수 있습니다."
                              : currentCareerQuest.request}
                          </p>
                        </div>
                        <div style={rpgQuestActionButtonGroupStyle}>
                          <button onClick={() => challengeOccupation(currentCareerQuest.targetId)} disabled={occupationId !== "unemployed" && currentQuestCareer.requiredPrevious !== occupationId && occupationId !== currentCareerQuest.targetId} style={{ ...casinoPrimaryButtonStyle, minWidth: "180px", opacity: occupationId !== "unemployed" && currentQuestCareer.requiredPrevious !== occupationId && occupationId !== currentCareerQuest.targetId ? 0.48 : 1 }}>
                            {occupationId === currentCareerQuest.targetId ? "이미 가진 직업" : canChallengeOccupation(currentCareerQuest.targetId) ? "퀘스트 수락하고 시작" : "조건 확인하기"}
                          </button>
                          {!canChallengeOccupation(currentCareerQuest.targetId) && (
                            <button onClick={() => setLobbyView("jobs")} style={casinoSmallButtonStyle}>알바하러 가기</button>
                          )}
                        </div>
                      </div>

                      <div style={rpgQuestDetailGridStyle}>
                        <div style={rpgQuestDetailCardStyle}>
                          <span>이번 퀘스트</span>
                          <strong>{currentCareerQuest.title}</strong>
                          <small>수행 결과에 따라 보상이 달라질 수 있음</small>
                        </div>
                        <div style={rpgQuestDetailCardStyle}>
                          <span>보상 직업</span>
                          <strong>{currentQuestCareer.icon} {currentQuestCareer.name}</strong>
                          <small>{currentQuestCareer.salaryText}</small>
                        </div>
                        <div style={rpgQuestDetailCardStyle}>
                          <span>성공</span>
                          <strong>{currentCareerQuest.successText}</strong>
                        </div>
                        <div style={rpgQuestDetailCardStyle}>
                          <span>실패</span>
                          <strong>{currentCareerQuest.failText}</strong>
                        </div>
                        <div style={rpgQuestDetailCardStyle}>
                          <span>미니게임</span>
                          <strong>{currentQuestCareer.minigameName}</strong>
                          <small>난이도 {currentQuestCareer.minigameDifficulty}</small>
                        </div>
                      </div>

                      <div style={rpgDialogueButtonRowStyle}>
                        <button onClick={() => setMessage(`${currentCareerQuest.npc}: ${currentCareerQuest.request}`)} style={casinoSmallButtonStyle}>NPC 말 다시 듣기</button>
                        <button onClick={() => setLobbyView("street")} style={casinoSmallButtonStyle}>다른 건물 보기</button>
                      </div>
                    </>
                  ) : (
                    <div style={rpgDialogueBubbleStyle}>아직 이 NPC에게서 받을 수 있는 퀘스트가 없습니다. 알바 성공 횟수나 자산 조건을 더 달성해보세요.</div>
                  )}
                </section>
              </div>
            </div>
          )}

                    {lobbyView === "housing" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>BUILDING OFFICE</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>건물 사무소</h2>
                  <p style={panelDescStyle}>메인 화면으로 사용할 방 분위기를 변경합니다. 돈은 차감하지 않습니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div className="alba-room-select-grid" style={roomSelectGridStyle}>
                {(Object.keys(roomInfo) as RoomKind[]).map((key) => (
                  <button key={key} onClick={() => changeRoom(key)} style={{ ...roomSelectCardStyle, border: roomKind === key ? "2px solid #38bdf8" : "1px solid rgba(255,255,255,0.14)" }}>
                    <div style={roomPreviewStyle}>{roomInfo[key].floor}</div>
                    <h3 style={jobCardTitleStyle}>{roomInfo[key].name}</h3>
                    <p style={jobCardTextStyle}>{roomInfo[key].description}</p>
                    <p style={rewardTextStyle}>{roomInfo[key].priceText}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {lobbyView === "tax" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>CITY HALL</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>구청 세금 확인</h2>
                  <p style={panelDescStyle}>현재 납부해야 할 세금과 이월된 미납 세금을 확인합니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div style={taxCardStyle}>
                <StatusPill label="현재 현금" value={`${cash.toLocaleString()}원`} />
                <StatusPill label="적용 세율" value={`${(taxRate * 100).toFixed(0)}%`} />
                <StatusPill label="이번 세금" value={`${currentTaxDue.toLocaleString()}원`} />
                <StatusPill label="미납 세금" value={`${unpaidTax.toLocaleString()}원`} warning={unpaidTax > 0} />
                <StatusPill label="총 납부 예정" value={`${nextTax.toLocaleString()}원`} warning={nextTax > cash} />
                <StatusPill label="자동 납부까지" value={formatTime(taxCountdown)} warning={taxCountdown <= TAX_WARNING_SECONDS} />
              </div>

              <div style={taxNoticeStyle}>
                자동 납부 시점에 현금이 부족하면 납부하지 못한 세금이 미납으로 이월됩니다. 다음 세금 제출 때 이번 세금과 미납금이 합산되어 청구됩니다.
              </div>
            </div>
          )}

          {lobbyView === "stocks" && (
            <div className="alba-stock-scene" style={stockExchangeSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>STOCK EXCHANGE</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>주식 거래소</h2>
                  <p style={panelDescStyle}>모든 유저가 하나의 전역 시세를 공유합니다. 3분마다 서버에서 한 번만 변동됩니다. 다음 변동까지 <strong>{formatStockCountdown(stockCountdownMs)}</strong> · 마지막 변동: {stockUpdatedAt.toLocaleTimeString()}</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>


              <div style={stockBoardStyle}>
                {stockRows.map((stock) => {
                  const diff = stock.price - stock.previousPrice;
                  const percent = stock.previousPrice > 0 ? (diff / stock.previousPrice) * 100 : 0;
                  const isUp = diff >= 0;
                  const performance = getStockHoldingPerformance(stock);
                  const profitIsUp = performance.profit >= 0;

                  return (
                    <div key={stock.id} style={stockCardStyle}>
                      <div style={stockCardHeaderStyle}>
                        <div>
                          <div style={stockNameStyle}>{stock.icon} {stock.name}</div>
                          <div style={stockDescStyle}>{stock.description}</div>
                        </div>
                        <div style={{ ...stockChangeBadgeStyle, color: isUp ? "#dc2626" : "#2563eb", borderColor: isUp ? "#fecaca" : "#bfdbfe", background: isUp ? "#fff1f2" : "#eff6ff" }}>
                          {isUp ? "▲" : "▼"} {Math.abs(percent).toFixed(2)}%
                        </div>
                      </div>

                      <StockMiniChart stockId={stock.id} history={stock.history} />

                      <div style={stockBottomRowStyle}>
                        <div style={stockInfoStackStyle}>
                          <div style={stockPriceStyle}>{stock.price.toLocaleString()}원</div>
                          <div style={stockOwnedStyle}>보유 {stock.owned}주 · 평가 {(stock.owned * stock.price).toLocaleString()}원</div>
                          {stock.owned > 0 && (
                            <div style={{ ...stockOwnedStyle, color: profitIsUp ? "#dc2626" : "#2563eb" }}>
                              평균 매수가 {performance.averageBuyPrice.toLocaleString()}원 · 손익 {performance.profit >= 0 ? "+" : ""}{performance.profit.toLocaleString()}원 ({performance.profitRate >= 0 ? "+" : ""}{performance.profitRate.toFixed(2)}%)
                            </div>
                          )}
                        </div>
                        <div style={stockBuffInlineStyle}>
                          <strong>버프 효과</strong>
                          <span>주식 매도 보너스 없음 · 전역 시세 기준으로 모든 유저가 같은 가격을 사용합니다.</span>
                        </div>
                        <div style={stockActionGroupStyle}>
                          <button onClick={() => buyStock(stock.id)} disabled={cash < stock.price} style={{ ...stockTradeButtonStyle, opacity: cash < stock.price ? 0.45 : 1 }}>1주 매수</button>
                          <button onClick={() => buyMaxStock(stock.id)} disabled={cash < stock.price} style={{ ...stockTradeButtonStyle, opacity: cash < stock.price ? 0.45 : 1 }}>최대 매수</button>
                          <button onClick={() => sellStock(stock.id)} disabled={stock.owned <= 0} style={{ ...stockTradeButtonStyle, opacity: stock.owned <= 0 ? 0.45 : 1 }}>1주 매도</button>
                          <button onClick={() => sellAllStock(stock.id)} disabled={stock.owned <= 0} style={{ ...stockTradeButtonStyle, opacity: stock.owned <= 0 ? 0.45 : 1 }}>전량 매도</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {lobbyView === "casino" && (
            <div style={casinoSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>CASINO</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>도박장</h2>
                  <p style={panelDescStyle}>게임머니 전용 콘텐츠입니다. 슬롯 머신과 유저 대전을 진행할 수 있습니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div style={casinoContentGridStyle}>
                <section style={casinoCardStyle}>
                  <div style={casinoCardHeaderStyle}>
                    <div style={casinoIconStyle}>🎰</div>
                    <div>
                      <h3 style={casinoTitleStyle}>슬롯 머신</h3>
                      <p style={casinoTextStyle}>돈을 넣고 레버를 당기면 슬롯이 돌아갑니다. 결과는 서버 확률로 결정됩니다.</p>
                    </div>
                  </div>

                  <div style={slotMachinePanelStyle}>
                    <div style={slotMachineCabinetStyle}>
                      <div style={slotMachineHeaderStyle}>JACKPOT SLOT</div>
                      <div style={slotMachineDisplayStyle}>
                        {slotReels.map((symbol, index) => (
                          <div key={`${symbol}-${index}-${isSlotPlaying ? "spin" : "stop"}`} style={{ ...slotReelWindowStyle, transform: isSlotPlaying ? `translateY(${index % 2 === 0 ? -2 : 2}px)` : "translateY(0)" }}>
                            <span style={slotReelSymbolStyle}>{symbol}</span>
                          </div>
                        ))}
                      </div>
                      <div style={slotMachineFooterStyle}>
                        <span>최소 베팅 100원</span>
                        <span>대박 확률 서버 계산</span>
                      </div>
                    </div>

                    <button onClick={playSlotMachine} disabled={isSlotPlaying} style={{ ...slotLeverButtonStyle, opacity: isSlotPlaying ? 0.92 : 1 }}>
                      <div style={{ ...slotLeverStickStyle, transform: slotLeverDown ? "rotate(18deg) translateY(12px)" : "rotate(-12deg) translateY(0)" }} />
                      <div style={{ ...slotLeverKnobStyle, transform: slotLeverDown ? "translateY(20px) translateX(7px)" : "translateY(0) translateX(0)" }} />
                      <span style={slotLeverLabelStyle}>{isSlotPlaying ? "회전 중" : "레버"}</span>
                    </button>
                  </div>

                  <div style={slotControlGridStyle}>
                    <label style={slotStakeFieldStyle}>
                      <span style={slotStakeLabelStyle}>베팅 금액</span>
                      <input
                        type="number"
                        min={100}
                        step={100}
                        value={slotStake}
                        onChange={(event) => setSlotStake(event.target.value)}
                        style={casinoInputStyle}
                      />
                    </label>
                    <div style={slotQuickRowStyle}>
                      {[1000, 5000, 10000].map((amount) => (
                        <button key={amount} onClick={() => setSlotStake(String(amount))} style={slotQuickButtonStyle}>
                          {amount.toLocaleString()}원
                        </button>
                      ))}
                    </div>
                  </div>

                  {slotResult && (
                    <div style={slotResultBoxStyle}>
                      <strong>{getSlotResultLabel(slotResult.result)}</strong>
                      <span>베팅 {slotResult.stake.toLocaleString()}원 · 보상 {slotResult.reward.toLocaleString()}원</span>
                      <span style={{ color: slotResult.profit >= 0 ? "#16a34a" : "#dc2626" }}>
                        손익 {slotResult.profit >= 0 ? "+" : ""}{slotResult.profit.toLocaleString()}원
                      </span>
                    </div>
                  )}
                </section>

                <section style={casinoCardStyle}>
                  <div style={casinoCardHeaderStyle}>
                    <div style={casinoIconStyle}>⚔️</div>
                    <div>
                      <h3 style={casinoTitleStyle}>유저 대전</h3>
                      <p style={casinoTextStyle}>상대를 선택하고 같은 금액을 걸어 반응속도 미니게임으로 겨룹니다.</p>
                    </div>
                  </div>

                  <select value={selectedOpponentId} onChange={(event) => setSelectedOpponentId(event.target.value)} style={casinoInputStyle}>
                    {casinoUsers.length === 0 ? (
                      <option value="">대전 가능한 유저 없음</option>
                    ) : (
                      casinoUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.nickname} · {user.cash.toLocaleString()}원 · {user.job}
                        </option>
                      ))
                    )}
                  </select>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={pvpStake}
                    onChange={(event) => setPvpStake(event.target.value)}
                    style={casinoInputStyle}
                  />
                  <button onClick={createPvpChallenge} disabled={!selectedOpponentId} style={casinoPrimaryButtonStyle}>도전장 보내기</button>
                  <div style={pvpMessageStyle}>{pvpMessage}</div>
                </section>
              </div>

              <div style={casinoLowerGridStyle}>
                <section style={casinoListCardStyle}>
                  <h3 style={casinoTitleStyle}>받은 도전</h3>
                  {pvpMatches.filter((match) => match.status === "waiting" && match.opponent_id === userId).length === 0 ? (
                    <p style={casinoTextStyle}>받은 도전이 없습니다.</p>
                  ) : (
                    pvpMatches
                      .filter((match) => match.status === "waiting" && match.opponent_id === userId)
                      .map((match) => (
                        <div key={match.id} style={pvpMatchRowStyle}>
                          <div>
                            <strong>{getCasinoUserName(match.challenger_id, casinoUsers, userId, nickname)}</strong>
                            <span>판돈 {Number(match.stake).toLocaleString()}원</span>
                          </div>
                          <button onClick={() => acceptPvpChallenge(match)} style={casinoSmallButtonStyle}>수락</button>
                        </div>
                      ))
                  )}
                </section>

                <section style={casinoListCardStyle}>
                  <h3 style={casinoTitleStyle}>진행 중인 대전</h3>
                  {pvpMatches.filter((match) => match.status === "accepted" || match.status === "playing").length === 0 ? (
                    <p style={casinoTextStyle}>진행 중인 대전이 없습니다.</p>
                  ) : (
                    pvpMatches
                      .filter((match) => match.status === "accepted" || match.status === "playing")
                      .map((match) => (
                        <div key={match.id} style={pvpMatchRowStyle}>
                          <div>
                            <strong>{getPvpOpponentName(match, userId, casinoUsers, nickname)}</strong>
                            <span>판돈 {Number(match.stake).toLocaleString()}원 · 상태 {getPvpStatusLabel(match.status)}</span>
                          </div>
                          <button onClick={() => startPvpReaction(match)} style={casinoSmallButtonStyle}>플레이</button>
                        </div>
                      ))
                  )}
                </section>
              </div>

              {activePvpMatch && (
                <section style={pvpGamePanelStyle}>
                  <div>
                    <h3 style={casinoTitleStyle}>반응속도 대전</h3>
                    <p style={casinoTextStyle}>초록 불이 켜진 뒤 최대한 빨리 버튼을 누르세요. 먼저 누르면 실격 점수입니다.</p>
                  </div>
                  <div style={{ ...pvpLightStyle, background: pvpReactionState === "go" ? "#22c55e" : pvpReactionState === "waiting" ? "#ef4444" : "#e5e7eb" }}>
                    {pvpReactionState === "go" ? "지금!" : pvpReactionState === "waiting" ? "기다려!" : pvpReactionState === "submitted" ? `점수 ${pvpReactionScore}` : "준비"}
                  </div>
                  <div style={pvpButtonRowStyle}>
                    <button onClick={beginPvpReactionRound} disabled={pvpReactionState === "waiting" || pvpReactionState === "go"} style={casinoPrimaryButtonStyle}>시작</button>
                    <button onClick={hitPvpReactionButton} disabled={pvpReactionState === "idle" || pvpReactionState === "submitted"} style={casinoDangerButtonStyle}>누르기</button>
                    <button onClick={() => setActivePvpMatch(null)} style={casinoSmallButtonStyle}>닫기</button>
                  </div>
                </section>
              )}
            </div>
          )}

          {lobbyView === "bank" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>BANK</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>은행</h2>
                  <p style={panelDescStyle}>예금은 목돈 굴리기 용으로 한도 없이 15분마다 0.35% 복리 이자가 붙습니다. 적금은 시드머니 모으기 용으로 30분마다 0.9% 이자가 붙지만 최대 3,000,000원까지만 불어납니다. 세금은 현금이 부족하면 미납으로 이월되어 다음 세금에 합산됩니다. 대출은 10분마다 1.2% 이자가 붙습니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div style={economySummaryGridStyle}>
                <StatusPill label="현금" value={`${cash.toLocaleString()}원`} />
                <StatusPill label="예금" value={`${bankDeposit.toLocaleString()}원`} />
                <StatusPill label="예금 수익" value={`원금 ${bankDepositPrincipal.toLocaleString()}원 · +${Math.max(0, bankDeposit - bankDepositPrincipal).toLocaleString()}원 (${getReturnRate(bankDeposit, bankDepositPrincipal)})`} />
                <StatusPill label="적금" value={`${bankSavings.toLocaleString()}원`} />
                <StatusPill label="적금 한도" value={`${savingsCapProgress}% · 남은 ${savingsCapRemaining.toLocaleString()}원`} warning={savingsCapRemaining <= 0} />
                <StatusPill label="적금 수익" value={`원금 ${bankSavingsPrincipal.toLocaleString()}원 · +${Math.max(0, bankSavings - bankSavingsPrincipal).toLocaleString()}원 (${getReturnRate(bankSavings, bankSavingsPrincipal)})`} />
                <StatusPill label="대출" value={`${bankLoan.toLocaleString()}원`} warning={bankLoan > 0} />
                <StatusPill label="신용점수" value={`${creditScore}점`} warning={creditScore < 600} />
                <StatusPill label="대출한도" value={`${getLoanLimit(creditScore, netWorth).toLocaleString()}원`} />
                <StatusPill label="순자산" value={`${netWorth.toLocaleString()}원`} warning={netWorth < 0} />
              </div>

              <div style={economyActionPanelStyle}>
                <input type="number" value={bankInput} min={100} step={1000} onChange={(event) => setBankInput(event.target.value)} style={casinoInputStyle} />
                <div style={economyButtonRowStyle}>
                  <button onClick={depositToBank} style={casinoPrimaryButtonStyle}>예금 넣기</button>
                  <button onClick={depositAllToBank} style={casinoSmallButtonStyle}>현금 전액 예금</button>
                  <button onClick={withdrawFromBank} style={casinoSmallButtonStyle}>예금 출금</button>
                  <button onClick={withdrawAllFromBank} style={casinoSmallButtonStyle}>예금 전액 출금</button>
                  <button onClick={depositToSavings} style={casinoPrimaryButtonStyle}>적금 납입</button>
                  <button onClick={depositAllToSavings} style={casinoSmallButtonStyle}>한도까지 적금</button>
                  <button onClick={withdrawSavings} style={casinoSmallButtonStyle}>적금 출금</button>
                  <button onClick={withdrawAllSavings} style={casinoSmallButtonStyle}>적금 전액 출금</button>
                  <button onClick={borrowFromBank} style={casinoSmallButtonStyle}>대출</button>
                  <button onClick={repayBankLoan} style={casinoSmallButtonStyle}>상환</button>
                </div>
              </div>
            </div>
          )}

          {lobbyView === "estate" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>REAL ESTATE</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>부동산</h2>
                  <p style={panelDescStyle}>부동산을 구매하면 5분마다 임대 수익이 들어오고 순자산 랭킹에 반영됩니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>
              <div className="alba-economy-card-grid" style={economyCardGridStyle}>
                {estateItems.map((estate) => {
                  const owned = ownedEstates.includes(estate.id);
                  return (
                    <div key={estate.id} style={economyCardStyle}>
                      <h3 style={economyCardTitleStyle}>{estate.icon} {estate.name}</h3>
                      <p style={economyCardTextStyle}>{estate.description}</p>
                      <strong>가격 {estate.price.toLocaleString()}원</strong>
                      <strong style={{ color: "#16a34a" }}>30초 수익 +{estate.incomeEvery5Min.toLocaleString()}원</strong>
                      <button onClick={() => buyEstate(estate.id)} disabled={owned || cash < estate.price} style={{ ...casinoPrimaryButtonStyle, opacity: owned || cash < estate.price ? 0.45 : 1 }}>
                        {owned ? "보유 중" : "구매"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {lobbyView === "business" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>BUSINESS CENTER</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>창업 센터</h2>
                  <p style={panelDescStyle}>알바와 직업 경험을 사업으로 확장합니다. 사업은 30초마다 강한 매출을 만듭니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>
              <div className="alba-economy-card-grid" style={economyCardGridStyle}>
                {businessItems.map((business) => {
                  const owned = ownedBusinesses.includes(business.id);
                  const requiredOk = !business.requiredOccupation || unlockedOccupations.includes(business.requiredOccupation);
                  return (
                    <div key={business.id} style={economyCardStyle}>
                      <h3 style={economyCardTitleStyle}>{business.icon} {business.name}</h3>
                      <p style={economyCardTextStyle}>{business.description}</p>
                      <strong>창업 비용 {business.price.toLocaleString()}원</strong>
                      <strong style={{ color: "#16a34a" }}>30초 매출 +{business.incomeEvery5Min.toLocaleString()}원</strong>
                      <span style={economyConditionStyle}>조건: {business.requiredOccupation ? occupationInfo[business.requiredOccupation].name : "없음"}</span>
                      <button onClick={() => buyBusiness(business.id)} disabled={owned || cash < business.price || !requiredOk} style={{ ...casinoPrimaryButtonStyle, opacity: owned || cash < business.price || !requiredOk ? 0.45 : 1 }}>
                        {owned ? "운영 중" : requiredOk ? "창업" : "조건 미달"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {lobbyView === "news" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>ECONOMY NEWS</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>경제 뉴스</h2>
                  <p style={panelDescStyle}>10분마다 모든 유저에게 같은 뉴스가 갱신되고, 다음 주식 변동부터 관련 종목에 영향을 줍니다. 마지막 갱신: {economyUpdatedAt.toLocaleTimeString()}</p>
                </div>
                <div style={economyButtonRowStyle}>
                  <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
                </div>
              </div>
              <div style={economyNewsListStyle}>
                {newsEvents.map((news) => (
                  <div key={news.id} style={{ ...economyNewsCardStyle, borderColor: news.tone === "good" ? "#16a34a" : news.tone === "bad" ? "#dc2626" : "#111827" }}>
                    <h3 style={economyCardTitleStyle}>{news.tone === "good" ? "📈" : news.tone === "bad" ? "📉" : "📰"} {news.title}</h3>
                    <p style={economyCardTextStyle}>{news.effect}</p>
                    <p style={economyCardTextStyle}>영향 종목: {news.targetStocks.map(getStockCompanyName).join(" · ")} / 예상 영향 {news.impactPercent > 0 ? "+" : ""}{news.impactPercent.toFixed(1)}%</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lobbyView === "academy" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>ACADEMY</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>교육원</h2>
                  <p style={panelDescStyle}>자격증은 경제 활동에 작은 패시브 효과를 줍니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>
              <div className="alba-economy-card-grid" style={economyCardGridStyle}>
                {certifications.map((certification) => {
                  const owned = ownedCertifications.includes(certification.id);
                  return (
                    <div key={certification.id} style={economyCardStyle}>
                      <h3 style={economyCardTitleStyle}>{certification.icon} {certification.name}</h3>
                      <p style={economyCardTextStyle}>{certification.description}</p>
                      <strong>교육비 {certification.price.toLocaleString()}원</strong>
                      <strong style={{ color: "#16a34a" }}>{certification.effectText}</strong>
                      <button onClick={() => buyCertification(certification.id)} disabled={owned || cash < certification.price} style={{ ...casinoPrimaryButtonStyle, opacity: owned || cash < certification.price ? 0.45 : 1 }}>
                        {owned ? "취득 완료" : "자격증 취득"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {lobbyView === "lotto" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>LOTTO SHOP</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>로또 판매소</h2>
                  <p style={panelDescStyle}>하루 3번까지 구매할 수 있습니다. 가격이 높을수록 최대 상금도 커집니다. 오늘 {lottoPurchaseDate === getTodayKey() ? lottoPurchaseCount : 0}/3회 구매</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div style={casinoLowerGridStyle}>
                <section style={casinoListCardStyle}>
                  <h3 style={casinoTitleStyle}>로또 구매</h3>
                  <p style={casinoTextStyle}>구매 후 직접 긁어서 결과를 확인하세요. 구매 횟수는 날짜가 바뀌기 전까지 초기화되지 않습니다.</p>
                  <select value={lottoPrice} onChange={(event) => setLottoPrice(event.target.value)} style={casinoInputStyle}>
                    <option value="1000">1,000원권 · 최대 50,000원</option>
                    <option value="5000">5,000원권 · 최대 500,000원</option>
                    <option value="10000">10,000원권 · 최대 2,000,000원</option>
                    <option value="50000">50,000원권 · 최대 20,000,000원</option>
                  </select>
                  <button onClick={buyLottoTicket} disabled={(lottoPurchaseDate === getTodayKey() ? lottoPurchaseCount : 0) >= 3 || cash < Number(lottoPrice)} style={{ ...casinoPrimaryButtonStyle, opacity: (lottoPurchaseDate === getTodayKey() ? lottoPurchaseCount : 0) >= 3 || cash < Number(lottoPrice) ? 0.45 : 1 }}>로또 구매</button>
                </section>

                <section style={casinoListCardStyle}>
                  <h3 style={casinoTitleStyle}>내 로또</h3>
                  {lottoTickets.length === 0 ? <p style={casinoTextStyle}>보유한 로또가 없습니다.</p> : lottoTickets.map((ticket) => (
                    <div key={ticket.id} style={lottoTicketStyle}>
                      <div>
                        <strong>🎫 {ticket.price.toLocaleString()}원권</strong>
                        <p style={casinoTextStyle}>{ticket.scratched ? ticket.prize > 0 ? `당첨금 ${ticket.prize.toLocaleString()}원` : "꽝" : "아직 긁지 않은 복권"}</p>
                      </div>
                      {ticket.scratched ? (
                        <div style={lottoResultBadgeStyle}>{ticket.prize > 0 ? "당첨" : "꽝"}</div>
                      ) : (
                        <button onClick={() => scratchLottoTicket(ticket.id)} style={lottoScratchButtonStyle}>긁기</button>
                      )}
                    </div>
                  ))}
                </section>
              </div>
            </div>
          )}

          {lobbyView === "gacha" && (
            <div style={gachaShopSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>GACHA SHOP</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>가챠 숍</h2>
                  <p style={panelDescStyle}>10분마다 랜덤 장신구 3개만 입고됩니다. 입고 상품은 원래 가격의 2배로 판매되며, 한 번 구매하면 SOLD OUT 처리됩니다. 상점 등급 Lv.{shopLevel} · 구매 {shopPurchaseCount}회 · 장착 {equippedItems.length}/{itemSlotCount} · 재입고까지 {formatTime(shopCountdownSeconds)}</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div style={gachaOfferGridStyle}>
                {(shopOffers.length > 0 ? shopOffers : makeShopOffers(shopLevel)).slice(0, 3).map((item, index) => {
                  const offerKey = `${shopUpdatedAt.toISOString()}-${index}-${item.id}`;
                  const soldOut = shopSoldOfferKeys.includes(offerKey);
                  const offerPrice = getShopOfferPrice(item);
                  return (
                  <div key={offerKey} style={{ ...gachaOfferCardStyle, borderColor: getRarityColor(item.rarity), opacity: soldOut ? 0.58 : 1 }}>
                    <span style={{ ...gachaDiscoveredBadgeStyle, background: discoveredItems.includes(item.id) ? "#dcfce7" : "#f1f5f9", color: discoveredItems.includes(item.id) ? "#166534" : "#64748b", borderColor: discoveredItems.includes(item.id) ? "#22c55e" : "#cbd5e1" }}>{discoveredItems.includes(item.id) ? "도감 등록" : "미수집"}</span>
                    <h3 style={gachaOfferTitleStyle}>{item.icon} {item.name}</h3>
                    <p style={gachaOfferDescStyle}>{item.rarity} · {item.description}</p>
                    <strong style={gachaOfferPriceStyle}>{offerPrice.toLocaleString()}원 <small style={gachaOfferSmallTextStyle}>(정가 {item.price.toLocaleString()}원 × 2)</small></strong>
                    <strong style={{ ...gachaOfferEffectStyle, color: getRarityColor(item.rarity) }}>{getItemEffectText(item)}</strong>
                    <small style={{ ...gachaOfferSmallTextStyle, color: getRarityColor(item.rarity), fontWeight: 900 }}>{getRarityPerformanceText(item.rarity)}</small>
                    <button onClick={() => buyShopOffer(item, offerKey, offerPrice)} disabled={soldOut || cash < offerPrice} style={{ ...gachaOfferBuyButtonStyle, opacity: soldOut || cash < offerPrice ? 0.45 : 1 }}>{soldOut ? "SOLD OUT" : "구매"}</button>
                  </div>
                  );
                })}
              </div>


              <div style={gachaLowerGridStyle}>
                <section style={gachaListCardStyle}>
                  <h3 style={casinoTitleStyle}>가챠 자판기</h3>
                  <p style={casinoTextStyle}>현재 1회 {getGachaMachineCost(gachaMachinePullCount).toLocaleString()}원. 10뽑을 할 때마다 가격이 2배씩 상승하며, 10분 재입고 시 50,000원으로 초기화됩니다. 재입고까지 {formatTime(shopCountdownSeconds)}</p>
                  <button onClick={pullGachaMachine} style={casinoPrimaryButtonStyle}>가챠 돌리기</button>
                  <div style={gachaEquippedPanelStyle}>
                    <h4 style={gachaEquippedTitleStyle}>장착 중인 아이템</h4>
                    <p style={casinoTextStyle}>현재 장착 {equippedItems.length}/{itemSlotCount}. 효과 확인과 해제를 바로 할 수 있습니다.</p>
                    {equippedItems.length === 0 ? <p style={casinoTextStyle}>장착 중인 아이템이 없습니다.</p> : equippedItems.map((id, index) => {
                      const item = shopItems.find((entry) => entry.id === id);
                      if (!item) return null;
                      return <div key={`equipped-${id}-${index}`} style={marketMiniRowStyle}><span>{item.icon} {item.name}<br /><small>{item.rarity} · {getItemEffectText(item)} · 도감 등록 · {item.description}</small></span><button onClick={() => toggleEquipItem(id)} style={unequipButtonStyle}>해제</button></div>;
                    })}
                  </div>
                </section>
                <section style={gachaListCardStyle}>
                  <div style={itemInventoryHeaderStyle}>
                    <div>
                      <h3 style={casinoTitleStyle}>아이템 인벤토리</h3>
                      <p style={casinoTextStyle}>중복 장신구는 ×수량으로 묶어서 표시됩니다.</p>
                    </div>
                    <span style={gachaDiscoveredBadgeStyle}>총 {ownedItems.length}개</span>
                  </div>
                  <div style={itemInventoryControlStyle}>
                    <select value={inventorySortMode} onChange={(event) => setInventorySortMode(event.target.value as ItemSortMode)} style={itemInventorySelectStyle}>
                      <option value="favorite">즐겨찾기 우선</option>
                      <option value="rarity">등급 높은 순</option>
                      <option value="priceDesc">가격 높은 순</option>
                      <option value="priceAsc">가격 낮은 순</option>
                      <option value="count">수량 많은 순</option>
                      <option value="name">이름순</option>
                    </select>
                    <button onClick={() => setShowFavoritesOnly((value) => !value)} style={casinoSmallButtonStyle}>
                      {showFavoritesOnly ? "전체 보기" : "즐겨찾기만"}
                    </button>
                  </div>
                  {visibleInventoryItems.length === 0 ? <p style={casinoTextStyle}>{showFavoritesOnly ? "즐겨찾기 아이템이 없습니다." : "보유 장신구가 없습니다."}</p> : visibleInventoryItems.map((group) => {
                    const item = group.item;
                    const isFavorite = favoriteItems.includes(group.id);
                    const isEquipped = equippedItems.includes(group.id);
                    return <div key={group.id} style={{ ...marketMiniRowStyle, borderColor: isFavorite ? "#f59e0b" : "#111827", background: isFavorite ? "#fffbeb" : "#ffffff" }}>
                      <span>{item.icon} {item.name} <strong>×{group.count}</strong> {isFavorite ? "⭐" : ""}<br /><small>{item.rarity} · {getItemEffectText(item)} · {discoveredItems.includes(group.id) ? "도감 등록" : "도감 미등록"} · 50% 판매가 {Math.floor(item.price * 0.5).toLocaleString()}원</small></span>
                      <span style={marketButtonGroupStyle}>
                        <button onClick={() => toggleFavoriteItem(group.id)} style={casinoSmallButtonStyle}>{isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}</button>
                        <button onClick={() => toggleEquipItem(group.id)} style={isEquipped ? unequipButtonStyle : equipButtonStyle}>{isEquipped ? "해제" : "장착"}</button>
                        <button onClick={() => quickSellItem(group.id, 1)} style={casinoSmallButtonStyle}>1개 판매</button>
                        {group.count > 1 && <button onClick={() => quickSellItem(group.id, group.count)} style={casinoSmallButtonStyle}>전부 판매</button>}
                      </span>
                    </div>;
                  })}
                </section>
              </div>
            </div>
          )}

          {lobbyView === "luxury" && (
            <div style={luxuryShopSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>LUXURY SHOP</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>사치 아이템 숍</h2>
                  <p style={panelDescStyle}>닉네임 장식, 이름표, 메인 배경, 메인 캐릭터를 구매하고 바로 적용할 수 있습니다. 모든 상품은 매우 비싸며, 더 화려할수록 가격이 올라갑니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div style={luxurySummaryBarStyle}>
                <StatusPill label="현금" value={`${cash.toLocaleString()}원`} />
                <StatusPill label="닉네임 색상" value={`${ownedNicknameColors.length}/10`} />
                <StatusPill label="이름표" value={`${ownedNicknameTags.length}/10`} />
                <StatusPill label="배경" value={`${ownedMainBackgrounds.length}/10`} />
                <StatusPill label="캐릭터" value={`${ownedMainCharacters.length}/10`} />
              </div>

              <div className="alba-luxury-section-stack" style={luxurySectionStackStyle}>
                <section style={luxurySectionStyle}>
                  <div style={luxurySectionHeaderStyle}>
                    <div>
                      <h3 style={economyCardTitleStyle}>닉네임 색상 / 폰트</h3>
                      <p style={economyCardTextStyle}>네온, 무지개, 필기체 등 10종. 구매 시 즉시 적용됩니다.</p>
                    </div>
                    <span style={luxuryMiniBadgeStyle}>현재 적용: {activeNicknameColor.name}</span>
                  </div>
                  <div className="alba-luxury-grid" style={luxuryGridStyle}>
                    {luxuryNicknameColors.map((theme) => {
                      const owned = ownedNicknameColors.includes(theme.id);
                      const active = selectedNicknameColorId === theme.id;
                      return (
                        <article className="alba-luxury-card" key={theme.id} style={luxuryCardStyle}>
                          <div className="alba-luxury-preview" style={luxuryPreviewFrameStyle}>
                            <span style={{ fontSize: "24px", ...getNicknameTextStyle(theme) }}>{nickname}</span>
                          </div>
                          <h4 style={luxuryCardTitleStyle}>{theme.name}</h4>
                          <p style={luxuryCardTextStyle}>{theme.description}</p>
                          <strong style={luxuryPriceStyle}>{theme.price.toLocaleString()}원</strong>
                          <button onClick={() => buyNicknameColorTheme(theme)} disabled={!owned && cash < theme.price} style={{ ...casinoPrimaryButtonStyle, opacity: !owned && cash < theme.price ? 0.45 : 1 }}>
                            {active ? "적용 중" : owned ? "적용하기" : "구매 후 적용"}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section style={luxurySectionStyle}>
                  <div style={luxurySectionHeaderStyle}>
                    <div>
                      <h3 style={economyCardTitleStyle}>닉네임 이름표</h3>
                      <p style={economyCardTextStyle}>닉네임을 감싸는 전용 이름표 10종.</p>
                    </div>
                    <span style={luxuryMiniBadgeStyle}>현재 적용: {activeNicknameTag.name}</span>
                  </div>
                  <div className="alba-luxury-grid" style={luxuryGridStyle}>
                    {luxuryNicknameTags.map((tag) => {
                      const owned = ownedNicknameTags.includes(tag.id);
                      const active = selectedNicknameTagId === tag.id;
                      return (
                        <article className="alba-luxury-card" key={tag.id} style={luxuryCardStyle}>
                          <div className="alba-luxury-preview" style={luxuryPreviewFrameStyle}>
                            <div style={buildNicknamePlateStyle(tag)}>
                              <span style={getNicknameTextStyle(activeNicknameColor)}>{nickname}</span>
                            </div>
                          </div>
                          <h4 style={luxuryCardTitleStyle}>{tag.name}</h4>
                          <p style={luxuryCardTextStyle}>{tag.description}</p>
                          <strong style={luxuryPriceStyle}>{tag.price.toLocaleString()}원</strong>
                          <button onClick={() => buyNicknameTagItem(tag)} disabled={!owned && cash < tag.price} style={{ ...casinoPrimaryButtonStyle, opacity: !owned && cash < tag.price ? 0.45 : 1 }}>
                            {active ? "적용 중" : owned ? "적용하기" : "구매 후 적용"}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section style={luxurySectionStyle}>
                  <div style={luxurySectionHeaderStyle}>
                    <div>
                      <h3 style={economyCardTitleStyle}>메인 배경</h3>
                      <p style={economyCardTextStyle}>메인 화면 전체 분위기를 바꾸는 배경 10종.</p>
                    </div>
                    <span style={luxuryMiniBadgeStyle}>현재 적용: {activeMainBackground.name}</span>
                  </div>
                  <div className="alba-luxury-grid" style={luxuryGridStyle}>
                    {luxuryMainBackgrounds.map((background) => {
                      const owned = ownedMainBackgrounds.includes(background.id);
                      const active = selectedMainBackgroundId === background.id;
                      return (
                        <article className="alba-luxury-card" key={background.id} style={luxuryCardStyle}>
                          <LuxuryBackgroundPreview background={background} />
                          <h4 style={luxuryCardTitleStyle}>{background.name}</h4>
                          <p style={luxuryCardTextStyle}>{background.description}</p>
                          <strong style={luxuryPriceStyle}>{background.price.toLocaleString()}원</strong>
                          <button onClick={() => buyMainBackgroundItem(background)} disabled={!owned && cash < background.price} style={{ ...casinoPrimaryButtonStyle, opacity: !owned && cash < background.price ? 0.45 : 1 }}>
                            {active ? "적용 중" : owned ? "적용하기" : "구매 후 적용"}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>

                <section style={luxurySectionStyle}>
                  <div style={luxurySectionHeaderStyle}>
                    <div>
                      <h3 style={economyCardTitleStyle}>메인 캐릭터</h3>
                      <p style={economyCardTextStyle}>메인 화면에 배치되는 대표 캐릭터 10종.</p>
                    </div>
                    <span style={luxuryMiniBadgeStyle}>현재 적용: {activeMainCharacter.name}</span>
                  </div>
                  <div className="alba-luxury-grid" style={luxuryGridStyle}>
                    {luxuryMainCharacters.map((character) => {
                      const owned = ownedMainCharacters.includes(character.id);
                      const active = selectedMainCharacterId === character.id;
                      return (
                        <article className="alba-luxury-card" key={character.id} style={luxuryCardStyle}>
                          <LuxuryCharacterPreview character={character} />
                          <h4 style={luxuryCardTitleStyle}>{character.name}</h4>
                          <p style={luxuryCardTextStyle}>{character.description}</p>
                          <strong style={luxuryPriceStyle}>{character.price.toLocaleString()}원</strong>
                          <button onClick={() => buyMainCharacterItem(character)} disabled={!owned && cash < character.price} style={{ ...casinoPrimaryButtonStyle, opacity: !owned && cash < character.price ? 0.45 : 1 }}>
                            {active ? "적용 중" : owned ? "적용하기" : "구매 후 적용"}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </div>
            </div>
          )}

          {lobbyView === "itemMarket" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>ITEM MARKET</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>아이템 거래소</h2>
                  <p style={panelDescStyle}>다른 유저가 등록한 장신구를 사고, 내 장신구를 판매 등록할 수 있습니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div style={casinoLowerGridStyle}>
                <section style={casinoListCardStyle}>
                  <h3 style={casinoTitleStyle}>내 장신구 판매 등록</h3>
                  <p style={casinoTextStyle}>판매 등록 후 다른 유저가 구매하면 판매 금액이 지급됩니다.</p>
                  <select value={sellItemId} onChange={(event) => setSellItemId(event.target.value)} style={casinoInputStyle}>
                    <option value="">판매할 아이템 선택</option>
                    {groupedOwnedItems.map((group) => (
                      <option key={group.id} value={group.id}>{group.item.rarity} · {group.item.name} ×{group.count}</option>
                    ))}
                  </select>
                  <input value={sellPrice} onChange={(event) => setSellPrice(event.target.value)} style={casinoInputStyle} type="number" min={1000} step={1000} placeholder="개당 판매 가격" />
                  <input value={sellQuantity} onChange={(event) => setSellQuantity(event.target.value)} style={casinoInputStyle} type="number" min={1} max={Math.max(1, ownedItems.filter((id) => id === sellItemId).length)} step={1} placeholder="판매 수량" />
                  {sellItemId && <p style={casinoTextStyle}>보유 수량 {ownedItems.filter((id) => id === sellItemId).length}개 중 {Math.max(1, Math.floor(Number(sellQuantity) || 1))}개 등록 예정</p>}
                  <button onClick={listItemForSale} style={casinoPrimaryButtonStyle}>거래소 등록</button>
                </section>

                <section style={casinoListCardStyle}>
                  <h3 style={casinoTitleStyle}>유저 매물</h3>
                  <p style={casinoTextStyle}>등록된 아이템은 Supabase 거래소 기준으로 불러옵니다.</p>
                  <button onClick={refreshMarketListings} style={casinoSmallButtonStyle}>새로고침</button>
                  {marketListings.length === 0 ? <p style={casinoTextStyle}>등록된 매물이 없습니다.</p> : marketListings.map((listing) => {
                    const item = shopItems.find((entry) => entry.id === listing.item_id);
                    if (!item) return null;
                    return (
                      <div key={listing.id} style={marketMiniRowStyle}>
                        <span>{item.icon} {item.name}<br /><small>{item.rarity} · {listing.seller_nickname ?? "판매자"} · {Number(listing.price).toLocaleString()}원</small></span>
                        {listing.seller_id === userId ? <button onClick={() => cancelMarketListing(listing)} style={casinoSmallButtonStyle}>회수</button> : <button onClick={() => buyMarketListing(listing)} style={casinoSmallButtonStyle}>구매</button>}
                      </div>
                    );
                  })}
                </section>
              </div>
            </div>
          )}

          {lobbyView === "titles" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>TITLE COLLECTION</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>칭호</h2>
                  <p style={panelDescStyle}>조건을 만족한 칭호를 장착할 수 있습니다. 현재 칭호: {currentTitle.icon} {currentTitle.name}</p>
                </div>
                <button onClick={() => setLobbyView("room")} className="alba-small-action-button" style={smallActionButtonStyle}>방으로</button>
              </div>
              <div style={titleGridStyle}>
                {playerTitles.map((title) => {
                  const unlocked = unlockedTitles.some((item) => item.id === title.id);
                  return (
                    <div key={title.id} style={{ ...titleCardStyle, opacity: unlocked ? 1 : 0.48 }}>
                      <div style={titleCardIconStyle}>{title.hidden && !unlocked ? "❔" : title.icon}</div>
                      <h3 style={economyCardTitleStyle}>{title.hidden && !unlocked ? "???" : title.name}</h3>
                      <p style={economyCardTextStyle}>{getTitleDisplayDescription(title, unlocked)}</p>
                      {title.passiveText && (!title.hidden || unlocked) && <strong style={{ color: "#7c3aed" }}>패시브: {title.passiveText}</strong>}
                      <button
                        disabled={!unlocked}
                        onClick={() => {
                          setCurrentTitleId(title.id);
                          setEarnedTitleIds((prev) => Array.from(new Set<PlayerTitleId>(["newbie", ...prev, title.id])));
                          if (userId) {
                            window.localStorage.setItem(`alba-money-title-${userId}`, title.id);
                            persistEarnedTitleIds(userId, Array.from(new Set<PlayerTitleId>(["newbie", ...earnedTitleIds, title.id])));
                          }
                          saveProfilePatch({ current_title: title.id });
                          setMessage(`🏷️ 칭호를 ${title.name}(으)로 변경했습니다.`);
                        }}
                        style={{ ...casinoSmallButtonStyle, opacity: unlocked ? 1 : 0.5 }}
                      >
                        {currentTitleId === title.id ? "장착 중" : unlocked ? "장착하기" : "잠김"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {lobbyView === "insurance" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>INSURANCE</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>보험사</h2>
                  <p style={panelDescStyle}>보험은 이제 실제 수익과 손실에 영향을 줍니다. 높은 등급일수록 보장률이 커지고, 10분마다 보험료가 납부됩니다. 현재 보험료: {insurancePremiumEvery5Min.toLocaleString()}원</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>
              <div className="alba-economy-card-grid" style={economyCardGridStyle}>
                {insuranceItems.map((insurance) => {
                  const owned = ownedInsurances.includes(insurance.id);
                  return (
                    <div key={insurance.id} style={economyCardStyle}>
                      <h3 style={economyCardTitleStyle}>{insurance.icon} {insurance.name}</h3>
                      <p style={economyCardTextStyle}>{insurance.description}</p>
                      <div style={insuranceBenefitStyle}>{getInsuranceEffectText(insurance)}</div>
                      <strong>{insurance.grade} · 10분 보험료 {insurance.premiumEvery5Min.toLocaleString()}원</strong>
                      <button onClick={() => toggleInsurance(insurance.id)} style={{ ...casinoPrimaryButtonStyle, background: owned ? "#fecaca" : "#bfdbfe" }}>
                        {owned ? "해지하기" : "가입하기"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {lobbyView === "employees" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>STAFF OFFICE</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>인력 사무소</h2>
                  <p style={panelDescStyle}>사업별 직원을 고용하면 30초 매출이 증가하지만 1분마다 인건비가 나갑니다. 현재 인건비: {employeePayrollEvery60Sec.toLocaleString()}원</p>
                </div>
                <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
              </div>
              <div className="alba-economy-card-grid" style={economyCardGridStyle}>
                {businessItems.map((business) => {
                  const owned = ownedBusinesses.includes(business.id);
                  const level = businessEmployees[business.id] ?? 0;
                  const plan = employeePlans.find((item) => item.level === level) ?? employeePlans[0];
                  const nextPlan = employeePlans.find((item) => item.level === level + 1);
                  return (
                    <div key={business.id} style={economyCardStyle}>
                      <h3 style={economyCardTitleStyle}>{business.icon} {business.name}</h3>
                      <p style={economyCardTextStyle}>{owned ? plan.description : "먼저 창업 센터에서 사업을 열어야 합니다."}</p>
                      <strong>현재 직원: {plan.name}</strong>
                      <strong style={{ color: "#16a34a" }}>매출 보너스 +{Math.round(plan.revenueBonusRate * 100)}%</strong>
                      <span style={economyConditionStyle}>1분 인건비 {plan.payrollEvery60Sec.toLocaleString()}원</span>
                      <button onClick={() => hireEmployee(business.id)} disabled={!owned || !nextPlan || cash < (nextPlan?.cost ?? 0)} style={{ ...casinoPrimaryButtonStyle, opacity: !owned || !nextPlan || cash < (nextPlan?.cost ?? 0) ? 0.45 : 1 }}>
                        {nextPlan ? `${nextPlan.name} 고용 ${nextPlan.cost.toLocaleString()}원` : "최고 단계"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {lobbyView === "auction" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>AUCTION HOUSE</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>경매장</h2>
                  <p style={panelDescStyle}>시세보다 저렴한 매물을 빠르게 낙찰받는 공간입니다. 매물은 직접 갱신할 수 있습니다.</p>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                  <button onClick={refreshAuctionDeals} className="alba-small-action-button" style={smallActionButtonStyle}>매물 갱신</button>
                  <button onClick={() => setLobbyView("street")} className="alba-small-action-button" style={smallActionButtonStyle}>길거리로</button>
                </div>
              </div>
              <div className="alba-economy-card-grid" style={economyCardGridStyle}>
                {auctionDeals.map((deal) => (
                  <div key={deal.id} style={economyCardStyle}>
                    <h3 style={economyCardTitleStyle}>{deal.icon} {deal.name}</h3>
                    <p style={economyCardTextStyle}>{deal.description}</p>
                    <strong>낙찰가 {deal.price.toLocaleString()}원</strong>
                    <strong style={{ color: "#16a34a" }}>추정 가치 {deal.value.toLocaleString()}원</strong>
                    <button onClick={() => buyAuctionDeal(deal)} disabled={cash < deal.price} style={{ ...casinoPrimaryButtonStyle, opacity: cash < deal.price ? 0.45 : 1 }}>
                      즉시 낙찰
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lobbyView === "phone" && (
            <div style={phoneSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>SMART MONEY PHONE</div>
                  <h2 className="alba-panel-title" style={panelTitleStyle}>휴대폰 자산 현황</h2>
                  <p style={panelDescStyle}>예금, 수익/지출, 월급, 패시브 효과를 한 화면에서 확인합니다.</p>
                </div>
                <button onClick={() => setLobbyView("room")} className="alba-small-action-button" style={smallActionButtonStyle}>방으로</button>
              </div>

              <div style={phoneFrameStyle}>
                <div style={phoneHardwareTopStyle}>
                  <div style={phoneSpeakerNotchStyle}>
                    <div style={phoneCameraDotStyle} />
                  </div>
                </div>

                <div style={phoneTopBarStyle}>
                  <span>9:41</span>
                  <strong>{nickname}</strong>
                  <span>{currentTitle.icon}</span>
                </div>

                <div style={phoneContentStyle}>
                  {phoneApp === "home" ? (
                    <>
                      <section style={phoneHeroCardStyle}>
                        <div>
                          <div style={phoneHeroLabelStyle}>오늘의 자산</div>
                          <strong style={phoneHeroMoneyStyle}>{netWorth.toLocaleString()}원</strong>
                          <span style={phoneHeroSubStyle}>예금 {bankDeposit.toLocaleString()}원 · 적금 {bankSavings.toLocaleString()}원 · 현금 {cash.toLocaleString()}원</span>
                        </div>
                      </section>

                      <section style={phoneAppGridStyle}>
                        <button onClick={() => setPhoneApp("wallet")} style={phoneAppIconButtonStyle}>
                          <span style={{ ...phoneAppIconStyle, background: "linear-gradient(180deg, #dbeafe, #60a5fa)" }}>💰</span>
                          <strong>자산</strong>
                          <small>현금·예금</small>
                        </button>
                        <button onClick={() => setPhoneApp("chart")} style={phoneAppIconButtonStyle}>
                          <span style={{ ...phoneAppIconStyle, background: "linear-gradient(180deg, #dcfce7, #22c55e)" }}>📊</span>
                          <strong>통계</strong>
                          <small>수익·지출</small>
                        </button>
                        <button onClick={() => setPhoneApp("income")} style={phoneAppIconButtonStyle}>
                          <span style={{ ...phoneAppIconStyle, background: "linear-gradient(180deg, #fef3c7, #f59e0b)" }}>🏦</span>
                          <strong>수입</strong>
                          <small>월급·사업</small>
                        </button>
                        <button onClick={() => setPhoneApp("buffs")} style={phoneAppIconButtonStyle}>
                          <span style={{ ...phoneAppIconStyle, background: "linear-gradient(180deg, #fce7f3, #ec4899)" }}>✨</span>
                          <strong>버프</strong>
                          <small>칭호·장신구</small>
                        </button>
                        <button onClick={() => setPhoneApp("collection")} style={phoneAppIconButtonStyle}>
                          <span style={{ ...phoneAppIconStyle, background: "linear-gradient(180deg, #ede9fe, #8b5cf6)" }}>📚</span>
                          <strong>도감</strong>
                          <small>장신구 수집</small>
                        </button>
                      </section>

                      <section style={phoneMiniDockStyle}>
                        <span>{currentTitle.icon} {currentTitle.name}</span>
                        <span>🎁 가챠 행운 +{Math.round(gachaLuckBonus * 100)}%</span>
                      </section>
                    </>
                  ) : (
                    <>
                      <div style={phoneAppHeaderStyle}>
                        <button onClick={() => setPhoneApp("home")} style={phoneBackAppButtonStyle}>← 홈</button>
                        <strong>{getPhoneAppTitle(phoneApp)}</strong>
                      </div>

                      {phoneApp === "wallet" && (
                        <section style={phoneSummaryGridStyle}>
                          <StatusPill label="현재 현금" value={`${cash.toLocaleString()}원`} />
                          <StatusPill label="은행 예금" value={`${bankDeposit.toLocaleString()}원`} />
                          <StatusPill label="은행 적금" value={`${bankSavings.toLocaleString()}원`} />
                          <StatusPill label="순자산" value={`${netWorth.toLocaleString()}원`} />
                          <StatusPill label="미납 세금" value={`${unpaidTax.toLocaleString()}원`} warning={unpaidTax > 0} />
                        </section>
                      )}

                      {phoneApp === "chart" && (
                        <>
                          <section style={phoneSummaryGridStyle}>
                            <StatusPill label="총 수익" value={`${totalIncome.toLocaleString()}원`} />
                            <StatusPill label="총 지출" value={`${totalExpense.toLocaleString()}원`} warning={totalExpense > totalIncome} />
                          </section>
                          <section style={phoneCardStyle}>
                            <h3 style={phoneCardTitleStyle}>수익 / 지출 그래프</h3>
                            <FinanceMiniChart history={financeHistory} />
                          </section>
                        </>
                      )}

                      {phoneApp === "income" && (
                        <section style={phoneCardStyle}>
                          <h3 style={phoneCardTitleStyle}>들어오는 돈</h3>
                          <div style={phoneListStyle}>
                            <span>💼 직업 수익: {Math.floor(occupationInfo[occupationId].incomeEvery3Min * jobIncomeMultiplier).toLocaleString()}원 / 3분</span>
                            <span>🧾 사업 매출: {businessIncomeEvery30Sec.toLocaleString()}원 / 30초</span>
                            <span>🏘️ 임대 수익: {Math.floor(estateIncomeEvery5Min * inflationIndex * totalIncomeMultiplier).toLocaleString()}원 / 30초</span>
                            <span>🏦 예금 이자: 약 {Math.floor(bankDeposit * 0.0025 * (1 + bankInterestBonus)).toLocaleString()}원 / 15분</span>
                            <span>🏦 적금 이자: 약 {Math.floor(bankSavings * 0.009 * (1 + bankInterestBonus)).toLocaleString()}원 / 30분</span>
                          </div>
                        </section>
                      )}

                      {phoneApp === "buffs" && (
                        <section style={phoneCardStyle}>
                          <h3 style={phoneCardTitleStyle}>버프 / 패시브</h3>
                          <div style={phoneListStyle}>
                            <span>{currentTitle.icon} 칭호: {currentTitle.name}{currentTitle.passiveText ? ` · ${currentTitle.passiveText}` : ""}</span>
                            <span>🎁 장신구: {equippedShopItems.length > 0 ? equippedShopItems.map((item) => `${item.icon} ${item.name}`).join(", ") : "없음"}</span>
                            <span>🎓 자격증: {ownedCertifications.length > 0 ? ownedCertifications.map((id) => certifications.find((cert) => cert.id === id)?.name ?? id).join(", ") : "없음"}</span>
                            <span>🎁 가챠 행운: +{Math.round(gachaLuckBonus * 100)}%</span>
                            <span>🏘️ 부동산 수익 보너스: +{Math.round(estateItemBonus * 100)}%</span>
                            <span>🏦 은행 이자 보너스: +{Math.round(bankInterestBonus * 100)}%</span>
                            <span>🎫 로또 행운 보너스: +{Math.round(lottoLuckBonus * 100)}%</span>
                            <span>🎁 가챠 행운 보너스: +{Math.round(gachaLuckBonus * 100)}%</span>
                            <span>👥 인건비 절감: -{Math.round(employeeEfficiencyBonus * 100)}%</span>
                            <span>💰 전체 수익 보너스: +{Math.round(allIncomeBonus * 100)}%</span>
                          </div>
                        </section>
                      )}
                      {phoneApp === "collection" && (
                        <section style={phoneCardStyle}>
                          <h3 style={phoneCardTitleStyle}>아이템 도감</h3>
                          <p style={casinoTextStyle}>수집 {new Set(discoveredItems).size}/{shopItems.length}종 · 등급이 높을수록 성능 차이가 확실합니다.</p>
                          <div style={itemCollectionGridStyle}>
                            {getCollectionItemsByRarity().map((group) => (
                              <div key={group.rarity} style={itemCollectionSectionStyle}>
                                <div style={{ ...itemCollectionSectionTitleStyle, color: getRarityColor(group.rarity), borderColor: getRarityColor(group.rarity) }}>
                                  <strong>{group.rarity}</strong>
                                  <span>{group.items.filter((item) => discoveredItems.includes(item.id)).length}/{group.items.length}종 수집</span>
                                </div>
                                <div style={itemCollectionSectionGridStyle}>
                                  {group.items.map((item) => {
                                    const owned = discoveredItems.includes(item.id);
                                    return (
                                      <div key={item.id} style={{ ...itemCollectionCardStyle, borderColor: getRarityColor(item.rarity), opacity: owned ? 1 : 0.42 }}>
                                        <strong>{owned ? item.icon : "❔"} {owned ? item.name : "미수집"}</strong>
                                        <small style={{ color: getRarityColor(item.rarity), fontWeight: 900 }}>{item.rarity} · {getRarityPerformanceText(item.rarity)}</small>
                                        <small>{owned ? getItemEffectText(item) : "획득하면 효과 공개"}</small>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </>
                  )}
                </div>

                <div style={phoneHomeIndicatorWrapStyle}>
                  <div style={phoneHomeIndicatorStyle} />
                </div>
              </div>
            </div>
          )}

          {lobbyView === "ranking" && (
            <div className="alba-panel-scene" style={panelSceneStyle}>
              <div className="alba-panel-header" style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>RANKING</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <button onClick={() => setRankingMode((mode) => mode === "netWorth" ? "collection" : "netWorth")} className="alba-small-action-button" style={smallActionButtonStyle}>◀</button>
                    <h2 className="alba-panel-title" style={panelTitleStyle}>{rankingMode === "netWorth" ? "순자산 랭킹" : "아이템 도감 랭킹"}</h2>
                    <button onClick={() => setRankingMode((mode) => mode === "netWorth" ? "collection" : "netWorth")} className="alba-small-action-button" style={smallActionButtonStyle}>▶</button>
                  </div>
                  <p style={panelDescStyle}>{rankingMode === "netWorth" ? "프로필이 생성된 계정 중 현금·예금·적금·부동산·사업을 합친 순자산 기준 상위 5명이 표시됩니다. 1~3위에게는 자동 랭킹 버프가 지급됩니다." : "한 번이라도 획득해 도감에 등록한 장신구 종류 수 기준 상위 5명이 표시됩니다."} 마지막 갱신: {rankingUpdatedAt.toLocaleTimeString()}</p>
                </div>
                <button onClick={() => setLobbyView("room")} className="alba-small-action-button" style={smallActionButtonStyle}>방으로</button>
              </div>

              <div style={rankingTableStyle}>
                {rankingRows.map((row) => (
                  <div key={`${row.rank}-${row.nickname}`} style={{ ...rankingRowStyle, borderColor: row.isMe ? "#38bdf8" : "rgba(255,255,255,0.14)", background: row.isMe ? "rgba(56,189,248,0.16)" : "rgba(255,255,255,0.06)" }}>
                    <strong>{row.rank}위 {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : ""}</strong>
                    <span>{row.isMe ? "👤 " : ""}<span style={getNicknameTextStyle(row.isMe ? activeNicknameColor : (luxuryNicknameColors.find((theme) => theme.id === row.nicknameColorId) ?? defaultNicknameColorTheme))}>{row.nickname}</span></span>
                    <span>{row.titleIcon} {row.titleName}<br /><small>{row.job}</small></span>
                    <strong>{rankingMode === "netWorth" ? `${row.cash.toLocaleString()}원` : `${row.cash.toLocaleString()}종`}<br />{rankingMode === "netWorth" && row.rank <= 3 && <small style={{ color: "#7c3aed" }}>랭킹 버프 +{Math.round(getRankingBuffRate(row.rank) * 100)}%</small>}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <footer style={worldFooterStyle}>
          <div style={messageBoxStyle}>{message}</div>
          <button onClick={signOut} style={logoutButtonStyle}>로그아웃</button>
        </footer>
      </section>

      {chatOpen && (
        <aside style={globalChatStyle}>
          <div style={globalChatHeaderStyle}>
            <strong>💬 전체 채팅</strong>
            <button onClick={() => setChatOpen(false)} style={chatCloseButtonStyle}>×</button>
          </div>
          <div style={chatMessageListStyle}>
            {chatMessages.length === 0 ? (
              <p style={casinoTextStyle}>아직 채팅이 없습니다.</p>
            ) : chatMessages.map((chat) => (
              <div key={chat.id} style={{ ...chatBubbleStyle, borderColor: chat.kind === "system" ? "#facc15" : "rgba(255,255,255,0.18)" }}>
                <strong>{chat.kind === "system" ? "📢 시스템" : `${chat.nickname ?? "유저"} · ${chat.title_name ?? "칭호 없음"}`}</strong>
                <span>{chat.message}</span>
              </div>
            ))}
          </div>
          <div style={chatInputRowStyle}>
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => { if (event.key === "Enter") void sendGlobalChatMessage(); }}
              placeholder="전체 채팅 입력"
              maxLength={120}
              style={chatInputStyle}
            />
            <button onClick={() => void sendGlobalChatMessage()} style={chatSendButtonStyle}>전송</button>
          </div>
        </aside>
      )}

      {careerMiniGame && (
        <div style={careerMiniGameOverlayStyle}>
          <div style={careerMiniGameBoxStyle}>
            <div style={smallLabelStyle}>CAREER TEST</div>
            <h2 className="alba-panel-title" style={panelTitleStyle}>{careerMiniGame.icon} {careerMiniGame.name} 실무 테스트</h2>
            <p style={panelDescStyle}>{getCareerGameInstruction(careerMiniGame)}</p>
            <div style={careerMiniGameStatusGridStyle}>
              <div style={careerMiniGameScoreStyle}>점수 {careerMiniGameScore} / {getCareerTargetScore(careerMiniGame)}</div>
              <div style={careerMiniGameScoreStyle}>시도 {careerMiniGameStep} / {getCareerMaxSteps(careerMiniGame)}</div>
              <div style={{ ...careerMiniGameScoreStyle, color: careerTypingTimeLeft <= 5 ? "#dc2626" : "#111827" }}>남은 시간 {careerTypingTimeLeft}초</div>
              <div style={careerMiniGameScoreStyle}>실수 {careerTypingMistakes} / 3</div>
            </div>
            <div style={careerTypingPromptStyle}>{careerTypingPrompt}</div>

            {(getCareerGameMode(careerMiniGame) === "office" || getCareerGameMode(careerMiniGame) === "rhythm") && (
              <div style={careerSequencePanelStyle}>
                <div style={careerSequenceRowStyle}>
                  {careerKeySequence.map((key, index) => (
                    <button
                      key={`${key}-${index}`}
                      onClick={() => void pressCareerSequenceKey(key)}
                      style={{
                        ...careerSequenceKeyStyle,
                        background: index < careerKeyIndex ? "#bbf7d0" : index === careerKeyIndex ? "#fde68a" : "#ffffff",
                        transform: index === careerKeyIndex ? "scale(1.1)" : "scale(1)",
                      }}
                    >
                      {key}
                    </button>
                  ))}
                </div>
                <div style={careerMiniGameSubTextStyle}>버튼 또는 키보드로 입력할 수 있습니다. 현재 키: {careerKeySequence[careerKeyIndex] ?? "완료"}</div>
              </div>
            )}

            {getCareerGameMode(careerMiniGame) === "logistics" && (
              <div style={careerLogisticsPanelStyle}>
                <div style={careerLogisticsBoardStyle}>
                  {Array.from({ length: 42 }).map((_, index) => {
                    const column = index % 6;
                    const row = Math.floor(index / 6);
                    const block = careerLogisticsBlocks.find((item) => item.column === column && item.row === row);
                    const isTarget = Number(careerKeySequence[careerKeyIndex]) === column;
                    const isCursor = careerLogisticsColumn === column && row === 0;
                    return (
                      <div key={index} style={{ ...careerLogisticsCellStyle, background: block ? "#fbbf24" : isCursor ? "#bfdbfe" : isTarget ? "#dcfce7" : "#ffffff" }}>
                        {block?.label ?? (isCursor ? "🔽" : "")}
                      </div>
                    );
                  })}
                </div>
                <div style={careerMiniGameSubTextStyle}>목표 라인: {Number(careerKeySequence[careerKeyIndex]) + 1}번 · 현재 라인: {careerLogisticsColumn + 1}번</div>
                <div style={careerMiniGameButtonRowStyle}>
                  <button onClick={() => setCareerLogisticsColumn((current) => Math.max(0, current - 1))} className="alba-small-action-button" style={smallActionButtonStyle}>왼쪽</button>
                  <button onClick={() => void placeCareerLogisticsBlock()} style={bigStartButtonStyle}>블록 내리기</button>
                  <button onClick={() => setCareerLogisticsColumn((current) => Math.min(5, current + 1))} className="alba-small-action-button" style={smallActionButtonStyle}>오른쪽</button>
                </div>
              </div>
            )}

            {getCareerGameMode(careerMiniGame) === "finance" && (
              <div style={careerFinancePanelStyle}>
                <div style={careerFinanceChartStyle}>{careerKeySequence.map((choice, index) => <span key={choice} style={{ transform: `translateY(${index % 2 === 0 ? 0 : 10}px)` }}>▮</span>)}</div>
                <div style={careerMiniGameButtonRowStyle}>
                  {careerKeySequence.map((choice) => (
                    <button key={choice} onClick={() => void chooseCareerFinanceAnswer(choice)} style={bigStartButtonStyle}>{choice}</button>
                  ))}
                </div>
              </div>
            )}

            <div style={careerMiniGameButtonRowStyle}>
              <button onClick={resetCareerMiniGame} style={logoutButtonStyle}>포기</button>
            </div>
          </div>
        </div>
      )}

      {firedStamp && (
        <div style={firedOverlayWrapStyle}>
          <div style={firedStampCardStyle}>
            <div style={firedStampTitleStyle}>해고</div>
            <div style={firedStampReasonStyle}>{firedStamp}</div>
          </div>
        </div>
      )}
    </main>
  );
}


function RoomArtwork({ roomKind, nickname, occupationName, backgroundId, characterId }: { roomKind: RoomKind; nickname: string; occupationName: string; backgroundId: MainBackgroundId; characterId: MainCharacterId }) {
  const fallbackAccent = roomKind === "office" ? "#60a5fa" : roomKind === "studio" ? "#f59e0b" : "#22c55e";
  const background = luxuryMainBackgrounds.find((item) => item.id === backgroundId) ?? defaultMainBackground;
  const character = luxuryMainCharacters.find((item) => item.id === characterId) ?? defaultMainCharacter;
  const accent = background.accent || fallbackAccent;
  const characterLabel = `${nickname} · ${occupationName}`;
  const shortCharacterLabel = characterLabel.length > 18 ? `${characterLabel.slice(0, 17)}…` : characterLabel;

  return (
    <svg style={sceneSvgStyle} viewBox="0 0 1600 760" preserveAspectRatio="none" role="img" aria-label="메인 방 일러스트">
      <defs>
        <filter id="luxuryDropShadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.22" />
        </filter>
        <linearGradient id="luxuryFloorGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {renderLuxuryRoomBackground(background, accent)}

      <g filter="url(#luxuryDropShadow)">
        <rect x="952" y="176" width="422" height="56" rx="24" fill="rgba(255,255,255,0.86)" stroke="#111827" strokeWidth="4" />
        <text x="1163" y="212" textAnchor="middle" fill="#111827" fontSize="22" fontWeight="900">{background.name}</text>
      </g>

      {renderLuxuryCharacter(character, background)}

      <g filter="url(#luxuryDropShadow)">
        <rect x="1010" y="616" width="300" height="54" rx="24" fill="rgba(255,255,255,0.92)" stroke="#111827" strokeWidth="4" />
        <text x="1160" y="650" textAnchor="middle" fill="#111827" fontSize="21" fontWeight="900">{shortCharacterLabel}</text>
      </g>
    </svg>
  );
}

function StreetArtwork() {
  return (
    <svg style={sceneSvgStyle} viewBox="0 0 1600 760" preserveAspectRatio="none" role="img" aria-label="직업 건물이 있는 거리">
      <defs>
        <linearGradient id="careerSky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="62%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="careerRoad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#111827" />
          <stop offset="100%" stopColor="#243045" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1600" height="760" fill="url(#careerSky)" />
      <circle cx="238" cy="132" r="56" fill="#fde68a" opacity="0.95" />
      <circle cx="238" cy="132" r="118" fill="#fde68a" opacity="0.18" />
      <path d="M0 505 C280 460 520 476 760 512 C1040 556 1260 528 1600 470 L1600 760 L0 760 Z" fill="#cbd5e1" />
      <path d="M-80 628 C220 566 520 578 810 642 C1088 704 1320 690 1680 604 L1680 760 L-80 760 Z" fill="url(#careerRoad)" />
      <path d="M82 666 C326 608 594 622 842 674 C1098 726 1326 716 1532 650" fill="none" stroke="#f8fafc" strokeWidth="13" strokeLinecap="round" strokeDasharray="72 54" opacity="0.96" />
      <g opacity="0.55">
        <rect x="78" y="360" width="90" height="128" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
        <rect x="1314" y="324" width="108" height="164" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
        <rect x="1442" y="292" width="92" height="196" rx="14" fill="#ffffff" stroke="#cbd5e1" strokeWidth="4" />
      </g>
    </svg>
  );
}

function getNicknameTextStyle(theme: NicknameColorTheme): CSSProperties {
  const style: CSSProperties = {
    fontWeight: 900,
    letterSpacing: theme.letterSpacing ?? "0.02em",
  };

  if (theme.gradient) {
    Object.assign(style, {
      backgroundImage: theme.gradient,
      backgroundClip: "text",
      WebkitBackgroundClip: "text",
      color: "transparent",
      WebkitTextFillColor: "transparent",
    } as CSSProperties);
  } else {
    style.color = theme.color ?? "#111827";
  }

  if (theme.shadow) style.textShadow = theme.shadow;
  if (theme.fontStyle) style.fontStyle = theme.fontStyle;
  if (theme.textTransform) style.textTransform = theme.textTransform;

  return style;
}

function buildNicknamePlateStyle(tag: NicknameTagItem): CSSProperties {
  const radius = tag.shape === "ticket" ? "18px" : tag.shape === "panel" ? "14px" : tag.shape === "ribbon" ? "20px 20px 12px 12px" : "999px";
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: tag.shape === "panel" ? "10px 14px" : "9px 16px",
    border: `3px solid ${tag.borderColor}`,
    borderRadius: radius,
    background: tag.background,
    color: tag.accentColor,
    boxShadow: "0 8px 0 rgba(15,23,42,0.12)",
    fontWeight: 900,
    maxWidth: "100%",
    width: "fit-content",
  };
}

function LuxuryBackgroundPreview({ background }: { background: MainBackgroundOption }) {
  return (
    <div style={{ ...luxuryPreviewFrameStyle, padding: 0, overflow: "hidden" }}>
      <svg viewBox="0 0 280 140" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
        <defs>
          <linearGradient id={`preview-${background.id}`} x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor={background.palette[0]} />
            <stop offset="55%" stopColor={background.palette[1]} />
            <stop offset="100%" stopColor={background.palette[2]} />
          </linearGradient>
        </defs>
        <rect width="280" height="140" fill={`url(#preview-${background.id})`} />
        <rect x="12" y="14" width="88" height="14" rx="7" fill="rgba(255,255,255,0.72)" />
        <rect x="14" y="98" width="252" height="30" rx="14" fill="rgba(255,255,255,0.85)" />
        <circle cx="228" cy="74" r="24" fill={background.accent} opacity="0.92" />
        <circle cx="228" cy="62" r="10" fill="#ffffff" />
        <rect x="210" y="84" width="36" height="22" rx="11" fill="#ffffff" opacity="0.92" />
      </svg>
    </div>
  );
}

function LuxuryCharacterPreview({ character }: { character: MainCharacterOption }) {
  return (
    <div style={{ ...luxuryPreviewFrameStyle, padding: 0, overflow: "hidden" }}>
      <svg viewBox="0 0 180 140" style={{ width: "100%", height: "100%", display: "block" }} aria-hidden="true">
        <rect width="180" height="140" fill="#f8fafc" />
        {renderLuxuryCharacterGlyph(character, 90, 90, 0.7)}
      </svg>
    </div>
  );
}

function renderLuxuryRoomBackground(background: MainBackgroundOption, accent: string) {
  if (background.sceneKey === "controlLab") {
    return (
      <>
        <rect width="1600" height="760" fill="#f8fafc" />
        <rect x="0" y="0" width="1600" height="520" fill="#f8fafc" />
        <rect x="0" y="520" width="1600" height="240" fill="#e2e8f0" />
        {Array.from({ length: 11 }).map((_, index) => <line key={index} x1={index * 145} y1="0" x2={index * 145} y2="520" stroke="#e5e7eb" strokeWidth="2" />)}
        {Array.from({ length: 6 }).map((_, index) => <line key={index} x1="0" y1={index * 80} x2="1600" y2={index * 80} stroke="#e5e7eb" strokeWidth="2" />)}
        <rect x="36" y="552" width="1500" height="164" rx="10" fill="#ffffff" stroke="#94a3b8" strokeWidth="4" />
        <rect x="560" y="282" width="420" height="168" rx="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="5" />
        <rect x="1060" y="248" width="270" height="220" rx="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="5" />
        <rect x="650" y="314" width="170" height="84" rx="10" fill={accent} opacity="0.4" />
        <rect x="1160" y="292" width="120" height="70" rx="10" fill="#fee2e2" />
        <rect x="1160" y="384" width="120" height="54" rx="10" fill="#dbeafe" />
        <rect x="114" y="558" width="272" height="116" rx="14" fill="#e0f2fe" stroke="#94a3b8" strokeWidth="4" />
        <rect x="986" y="560" width="420" height="110" rx="14" fill="#eff6ff" stroke="#94a3b8" strokeWidth="4" />
        <path d="M0 0 C130 60 150 180 182 310 C240 560 392 318 425 162" fill="none" stroke="rgba(250,204,21,0.35)" strokeWidth="30" />
        <path d="M1600 24 C1420 40 1360 180 1298 290 C1220 430 1020 182 960 90" fill="none" stroke="rgba(56,189,248,0.28)" strokeWidth="28" />
      </>
    );
  }

  if (background.sceneKey === "moldRoom") {
    return (
      <>
        <rect width="1600" height="760" fill="#f8f5eb" />
        <rect x="0" y="0" width="1600" height="520" fill="#f8f4ea" />
        <rect x="0" y="520" width="1600" height="240" fill="#d6b98a" />
        <rect x="120" y="74" width="450" height="122" rx="12" fill="#f8fafc" stroke="#6b4f38" strokeWidth="6" />
        {Array.from({ length: 4 }).map((_, index) => <line key={index} x1={200 + index * 94} y1="74" x2={200 + index * 94} y2="196" stroke="#6b4f38" strokeWidth="4" />)}
        <ellipse cx="560" cy="510" rx="150" ry="18" fill="#94a3b8" opacity="0.18" />
        <ellipse cx="320" cy="248" rx="72" ry="58" fill="rgba(100,116,139,0.24)" />
        <ellipse cx="1330" cy="184" rx="68" ry="50" fill="rgba(100,116,139,0.22)" />
        <ellipse cx="1270" cy="414" rx="82" ry="62" fill="rgba(100,116,139,0.18)" />
        <rect x="110" y="568" width="310" height="104" rx="14" fill="#ffffff" stroke="#475569" strokeWidth="5" />
        <rect x="520" y="544" width="256" height="82" rx="10" fill="#ffffff" stroke="#475569" strokeWidth="5" />
        <rect x="842" y="458" width="256" height="168" rx="10" fill="#f8fafc" stroke="#475569" strokeWidth="5" />
        <rect x="1240" y="378" width="132" height="208" rx="12" fill="#e5e7eb" stroke="#475569" strokeWidth="5" />
        <line x1="74" y1="92" x2="74" y2="674" stroke="#64748b" strokeWidth="4" />
        <text x="1340" y="118" fill="#475569" fontSize="40" fontWeight="900">1</text>
      </>
    );
  }

  if (background.sceneKey === "pastelStudio") {
    return (
      <>
        <rect width="1600" height="760" fill="#fff7ed" />
        <rect x="0" y="0" width="1600" height="520" fill="#fff1f2" />
        <rect x="0" y="520" width="1600" height="240" fill="#fde68a" opacity="0.55" />
        <circle cx="1320" cy="110" r="62" fill="#f9a8d4" opacity="0.55" />
        <rect x="88" y="130" width="420" height="240" rx="24" fill="#ffffff" stroke="#fb7185" strokeWidth="6" />
        <rect x="540" y="332" width="282" height="182" rx="24" fill="#ffffff" stroke="#fda4af" strokeWidth="6" />
        <rect x="1150" y="292" width="198" height="212" rx="20" fill="#ffffff" stroke="#fdba74" strokeWidth="6" />
        <path d="M48 492 C260 442 520 462 820 520 C1120 578 1360 560 1592 490" fill="none" stroke="#fb7185" strokeWidth="12" opacity="0.5" />
      </>
    );
  }

  if (background.sceneKey === "cyberArcade") {
    return (
      <>
        <rect width="1600" height="760" fill="#020617" />
        <rect x="0" y="0" width="1600" height="520" fill="#0f172a" />
        <rect x="0" y="520" width="1600" height="240" fill="#111827" />
        {Array.from({ length: 13 }).map((_, index) => <line key={index} x1={index * 125} y1="0" x2={index * 125} y2="760" stroke="rgba(34,211,238,0.12)" strokeWidth="3" />)}
        {Array.from({ length: 8 }).map((_, index) => <line key={index} x1="0" y1={index * 90} x2="1600" y2={index * 90} stroke="rgba(168,85,247,0.10)" strokeWidth="3" />)}
        <rect x="102" y="240" width="260" height="250" rx="20" fill="#111827" stroke="#22d3ee" strokeWidth="6" />
        <rect x="432" y="188" width="260" height="302" rx="20" fill="#111827" stroke="#f472b6" strokeWidth="6" />
        <rect x="762" y="222" width="260" height="268" rx="20" fill="#111827" stroke="#facc15" strokeWidth="6" />
        <path d="M0 588 C300 518 600 536 860 602 C1110 666 1360 662 1600 590" fill="none" stroke="rgba(34,211,238,0.55)" strokeWidth="9" />
      </>
    );
  }

  if (background.sceneKey === "moonPenthouse") {
    return (
      <>
        <rect width="1600" height="760" fill="#0f172a" />
        <linearGradient id="moonSky" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
        <rect x="0" y="0" width="1600" height="520" fill="url(#moonSky)" />
        <rect x="0" y="520" width="1600" height="240" fill="#111827" />
        <circle cx="1320" cy="112" r="62" fill="#f8fafc" opacity="0.9" />
        {Array.from({ length: 13 }).map((_, index) => <circle key={index} cx={90 + index * 110} cy={70 + (index % 3) * 36} r="3" fill="#ffffff" opacity="0.8" />)}
        <rect x="84" y="112" width="1110" height="344" rx="18" fill="rgba(15,23,42,0.28)" stroke="#93c5fd" strokeWidth="8" />
        {Array.from({ length: 8 }).map((_, index) => <rect key={index} x={154 + index * 118} y={248 - (index % 4) * 32} width="82" height={160 + (index % 3) * 42} fill="rgba(255,255,255,0.12)" />)}
        <rect x="110" y="562" width="420" height="90" rx="16" fill="rgba(255,255,255,0.12)" stroke="#93c5fd" strokeWidth="4" />
        <rect x="580" y="548" width="248" height="92" rx="16" fill="rgba(255,255,255,0.12)" stroke="#93c5fd" strokeWidth="4" />
      </>
    );
  }

  if (background.sceneKey === "royalHall") {
    return (
      <>
        <rect width="1600" height="760" fill="#fef3c7" />
        <rect x="0" y="0" width="1600" height="520" fill="#fff7ed" />
        <rect x="0" y="520" width="1600" height="240" fill="#f59e0b" opacity="0.32" />
        <rect x="202" y="72" width="1196" height="416" rx="24" fill="#fffaf0" stroke="#d97706" strokeWidth="7" />
        {Array.from({ length: 5 }).map((_, index) => <rect key={index} x={278 + index * 232} y="108" width="120" height="304" rx="16" fill="#fef3c7" stroke="#f59e0b" strokeWidth="5" />)}
        <path d="M786 92 L824 92 L852 152 L758 152 Z" fill="#fde68a" stroke="#d97706" strokeWidth="5" />
        <circle cx="805" cy="170" r="48" fill="#fff7ed" stroke="#d97706" strokeWidth="5" />
      </>
    );
  }

  if (background.sceneKey === "forestCabin") {
    return (
      <>
        <rect width="1600" height="760" fill="#dcfce7" />
        <rect x="0" y="0" width="1600" height="520" fill="#ecfccb" />
        <rect x="0" y="520" width="1600" height="240" fill="#bbf7d0" />
        <circle cx="1280" cy="116" r="64" fill="#fef9c3" opacity="0.85" />
        {Array.from({ length: 7 }).map((_, index) => <circle key={index} cx={110 + index * 210} cy={160 + (index % 2) * 40} r="88" fill="#4d7c0f" opacity="0.28" />)}
        <rect x="82" y="168" width="428" height="220" rx="18" fill="#ffffff" stroke="#84cc16" strokeWidth="6" />
        <rect x="610" y="448" width="268" height="112" rx="16" fill="#a16207" opacity="0.6" />
        <rect x="968" y="452" width="302" height="120" rx="16" fill="#92400e" opacity="0.6" />
      </>
    );
  }

  if (background.sceneKey === "seasideLounge") {
    return (
      <>
        <rect width="1600" height="760" fill="#ecfeff" />
        <rect x="0" y="0" width="1600" height="520" fill="#e0f2fe" />
        <rect x="0" y="520" width="1600" height="240" fill="#bae6fd" />
        <rect x="62" y="94" width="1120" height="334" rx="18" fill="#ffffff" stroke="#38bdf8" strokeWidth="8" />
        <rect x="94" y="126" width="1056" height="270" rx="12" fill="#7dd3fc" opacity="0.38" />
        <path d="M108 330 C252 282 426 278 562 330 C716 390 890 396 1096 302" fill="none" stroke="#ffffff" strokeWidth="12" opacity="0.86" />
        <path d="M0 560 C300 522 640 550 952 592 C1184 622 1360 620 1600 564" fill="none" stroke="#38bdf8" strokeWidth="10" opacity="0.64" />
        <rect x="1220" y="530" width="280" height="110" rx="18" fill="#ffffff" stroke="#38bdf8" strokeWidth="5" />
      </>
    );
  }

  if (background.sceneKey === "skyGarden") {
    return (
      <>
        <rect width="1600" height="760" fill="#f0f9ff" />
        <rect x="0" y="0" width="1600" height="520" fill="#dbeafe" />
        <rect x="0" y="520" width="1600" height="240" fill="#e9d5ff" opacity="0.45" />
        {Array.from({ length: 6 }).map((_, index) => <ellipse key={index} cx={180 + index * 230} cy={118 + (index % 2) * 48} rx="96" ry="42" fill="#ffffff" opacity="0.85" />)}
        <rect x="74" y="468" width="1452" height="72" rx="30" fill="#ffffff" stroke="#c4b5fd" strokeWidth="6" />
        {Array.from({ length: 6 }).map((_, index) => <rect key={index} x={164 + index * 220} y="396" width="112" height="82" rx="18" fill="#dcfce7" stroke="#86efac" strokeWidth="4" />)}
        <circle cx="242" cy="404" r="22" fill="#86efac" />
        <circle cx="902" cy="404" r="22" fill="#f9a8d4" />
      </>
    );
  }

  if (background.sceneKey === "orbitalBridge") {
    return (
      <>
        <rect width="1600" height="760" fill="#020617" />
        <rect x="0" y="0" width="1600" height="520" fill="#020617" />
        <rect x="0" y="520" width="1600" height="240" fill="#0f172a" />
        {Array.from({ length: 22 }).map((_, index) => <circle key={index} cx={60 + index * 70} cy={72 + (index % 4) * 36} r={index % 3 === 0 ? 3 : 2} fill="#ffffff" opacity="0.75" />)}
        <path d="M210 88 Q800 212 1390 88 L1390 420 Q800 620 210 420 Z" fill="none" stroke="#64748b" strokeWidth="8" />
        <path d="M318 136 Q800 246 1280 136 L1280 372 Q800 540 318 372 Z" fill="none" stroke="#1d4ed8" strokeWidth="6" opacity="0.8" />
        <circle cx="802" cy="252" r="84" fill="rgba(96,165,250,0.16)" stroke="#a78bfa" strokeWidth="6" />
        <rect x="542" y="548" width="520" height="92" rx="22" fill="rgba(255,255,255,0.08)" stroke="#64748b" strokeWidth="4" />
      </>
    );
  }

  return (
    <>
      <rect x="0" y="0" width="1600" height="760" fill="#f8fafc" />
      <polygon points="0,520 1600,520 1600,760 0,760" fill="url(#luxuryFloorGradient)" />
      <path d="M115 112 L360 170 L360 520" fill="none" stroke="#111827" strokeWidth="5" />
      <path d="M1485 112 L1240 170 L1240 520" fill="none" stroke="#111827" strokeWidth="5" />
      <path d="M360 170 L1240 170" fill="none" stroke="#111827" strokeWidth="5" />
      <path d="M0 520 L360 520" fill="none" stroke="#111827" strokeWidth="5" />
      <path d="M1240 520 L1600 520" fill="none" stroke="#111827" strokeWidth="5" />
      <rect x="610" y="130" width="380" height="145" rx="10" fill="#dbeafe" stroke="#111827" strokeWidth="6" />
      <rect x="92" y="418" width="330" height="128" rx="28" fill="#ffffff" stroke="#111827" strokeWidth="8" />
      <rect x="610" y="455" width="640" height="108" rx="12" fill="#ffffff" stroke="#111827" strokeWidth="8" />
    </>
  );
}

function renderLuxuryCharacter(character: MainCharacterOption, background: MainBackgroundOption) {
  return (
    <g transform={`translate(${background.anchorX} ${background.anchorY}) scale(${background.anchorScale})`} filter="url(#luxuryDropShadow)">
      {renderLuxuryCharacterGlyph(character, 0, 0, 1)}
    </g>
  );
}

function renderLuxuryCharacterGlyph(character: MainCharacterOption, x: number, y: number, scale: number) {
  const transform = `translate(${x} ${y}) scale(${scale})`;
  const p = character.primaryColor;
  const h = character.highlightColor;

  if (character.spriteKey === "catScholar") {
    return (
      <g transform={transform}>
        <path d="M-66 52 C-48 28 -16 12 0 8 C18 12 48 28 66 52 L66 112 L-66 112 Z" fill={p} stroke="#111827" strokeWidth="8" />
        <path d="M-52 12 L-30 -30 L-6 6" fill={p} stroke="#111827" strokeWidth="8" strokeLinejoin="round" />
        <path d="M52 12 L30 -30 L6 6" fill={p} stroke="#111827" strokeWidth="8" strokeLinejoin="round" />
        <rect x="-32" y="-60" width="96" height="34" rx="10" fill="#f5d0a9" stroke="#111827" strokeWidth="7" transform="rotate(12)" />
        <circle cx="-22" cy="48" r="7" fill="#1d4ed8" /><circle cx="22" cy="48" r="7" fill="#1d4ed8" />
        <path d="M-18 78 Q0 92 18 78" fill="none" stroke="#111827" strokeWidth="6" strokeLinecap="round" />
        <path d="M-88 76 C-116 88 -114 132 -88 136" fill="none" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
        <path d="M74 82 L112 106" stroke={h} strokeWidth="10" strokeLinecap="round" />
      </g>
    );
  }

  if (character.spriteKey === "miniPrincess") {
    return (
      <g transform={transform}>
        <circle cx="0" cy="-6" r="46" fill="#fde68a" stroke="#111827" strokeWidth="8" />
        <path d="M-46 120 L0 46 L46 120 Z" fill={h} stroke="#111827" strokeWidth="8" />
        <path d="M-56 24 L-14 -12 L-40 34 Z" fill="#fbbf24" /><path d="M56 24 L14 -12 L40 34 Z" fill="#fbbf24" />
        <path d="M-18 -56 L0 -82 L18 -56" fill="#34d399" stroke="#111827" strokeWidth="7" strokeLinejoin="round" />
        <circle cx="-16" cy="0" r="6" fill="#0ea5e9" /><circle cx="16" cy="0" r="6" fill="#0ea5e9" />
        <rect x="-24" y="66" width="48" height="24" rx="10" fill="#ffffff" opacity="0.82" />
      </g>
    );
  }

  if (character.spriteKey === "bunnyHacker") {
    return (
      <g transform={transform}>
        <circle cx="0" cy="-2" r="48" fill="#fef3c7" stroke="#111827" strokeWidth="8" />
        <path d="M-54 -50 C-70 -112 -22 -126 -22 -44" fill="#f9a8d4" stroke="#111827" strokeWidth="8" />
        <path d="M54 -50 C70 -112 22 -126 22 -44" fill="#f9a8d4" stroke="#111827" strokeWidth="8" />
        <rect x="-60" y="-4" width="120" height="26" rx="10" fill="#94a3b8" />
        <rect x="-58" y="40" width="116" height="66" rx="24" fill="#fce7f3" stroke="#111827" strokeWidth="8" />
        <path d="M-20 10 H-2" stroke="#111827" strokeWidth="6" strokeLinecap="round" />
        <path d="M18 10 H36" stroke="#111827" strokeWidth="6" strokeLinecap="round" />
        <rect x="-30" y="28" width="60" height="26" rx="8" fill="#ffffff" stroke="#64748b" strokeWidth="4" />
      </g>
    );
  }

  if (character.spriteKey === "crimsonKnight") {
    return (
      <g transform={transform}>
        <circle cx="-4" cy="-10" r="38" fill="#f3f4f6" stroke="#111827" strokeWidth="8" />
        <path d="M-42 112 L-12 28 L44 28 L62 112 Z" fill="#dc2626" opacity="0.76" stroke="#111827" strokeWidth="8" />
        <rect x="-22" y="116" width="20" height="58" rx="10" fill="#d1d5db" stroke="#111827" strokeWidth="6" />
        <rect x="24" y="116" width="20" height="58" rx="10" fill="#d1d5db" stroke="#111827" strokeWidth="6" />
        <path d="M-96 18 L-126 146" stroke={h} strokeWidth="10" strokeLinecap="round" />
        <path d="M-126 146 Q-88 124 -64 164" fill="none" stroke={h} strokeWidth="8" />
        <path d="M86 34 L132 58 L104 140 L64 126 Z" fill="#f8fafc" stroke="#111827" strokeWidth="7" />
      </g>
    );
  }

  if (character.spriteKey === "idolSinger") {
    return (
      <g transform={transform}>
        <circle cx="0" cy="-10" r="42" fill="#fce7f3" stroke="#111827" strokeWidth="8" />
        <path d="M-44 110 Q0 52 44 110 L24 160 H-24 Z" fill="#c4b5fd" stroke="#111827" strokeWidth="8" />
        <circle cx="-18" cy="-10" r="6" fill="#111827" /><circle cx="18" cy="-10" r="6" fill="#111827" />
        <circle cx="74" cy="30" r="16" fill={h} stroke="#111827" strokeWidth="6" />
        <path d="M64 46 L104 80" stroke="#111827" strokeWidth="6" />
      </g>
    );
  }

  if (character.spriteKey === "baristaDreamer") {
    return (
      <g transform={transform}>
        <circle cx="0" cy="-8" r="44" fill="#f5e1c8" stroke="#111827" strokeWidth="8" />
        <path d="M-42 110 L-18 30 L24 30 L48 110 Z" fill="#d6b38c" stroke="#111827" strokeWidth="8" />
        <rect x="-30" y="58" width="60" height="32" rx="12" fill="#ffffff" opacity="0.85" />
        <path d="M72 78 C96 42 128 60 116 96 C106 124 76 118 72 78 Z" fill="#ffffff" stroke="#111827" strokeWidth="6" />
        <path d="M76 74 H106" stroke={h} strokeWidth="5" />
      </g>
    );
  }

  if (character.spriteKey === "hoodieTrader") {
    return (
      <g transform={transform}>
        <circle cx="0" cy="-8" r="42" fill="#e2e8f0" stroke="#111827" strokeWidth="8" />
        <path d="M-52 114 Q0 42 52 114 L38 164 H-38 Z" fill="#475569" stroke="#111827" strokeWidth="8" />
        <rect x="48" y="-8" width="66" height="88" rx="10" fill="rgba(34,211,238,0.18)" stroke="#22d3ee" strokeWidth="5" />
        <path d="M60 62 C78 36 88 72 106 44" fill="none" stroke="#22d3ee" strokeWidth="6" />
      </g>
    );
  }

  if (character.spriteKey === "fairyMechanic") {
    return (
      <g transform={transform}>
        <ellipse cx="-42" cy="26" rx="28" ry="46" fill="#d9f99d" opacity="0.7" stroke="#111827" strokeWidth="6" />
        <ellipse cx="42" cy="26" rx="28" ry="46" fill="#d9f99d" opacity="0.7" stroke="#111827" strokeWidth="6" />
        <circle cx="0" cy="-8" r="40" fill="#fef3c7" stroke="#111827" strokeWidth="8" />
        <path d="M-42 112 L0 32 L42 112 Z" fill="#86efac" stroke="#111827" strokeWidth="8" />
        <path d="M74 82 L116 50" stroke="#111827" strokeWidth="8" />
        <circle cx="118" cy="48" r="12" fill={h} stroke="#111827" strokeWidth="5" />
      </g>
    );
  }

  if (character.spriteKey === "guardianRobo") {
    return (
      <g transform={transform}>
        <rect x="-42" y="-52" width="84" height="84" rx="20" fill="#dbeafe" stroke="#111827" strokeWidth="8" />
        <rect x="-58" y="44" width="116" height="98" rx="20" fill="#93c5fd" stroke="#111827" strokeWidth="8" />
        <circle cx="-16" cy="-10" r="8" fill="#111827" /><circle cx="16" cy="-10" r="8" fill="#111827" />
        <rect x="-20" y="58" width="40" height="26" rx="8" fill="#ffffff" />
        <path d="M74 32 L116 52 L116 110 L72 94 Z" fill="#fde68a" stroke="#111827" strokeWidth="7" />
      </g>
    );
  }

  if (character.spriteKey === "dragonMage") {
    return (
      <g transform={transform}>
        <circle cx="0" cy="-10" r="42" fill="#ede9fe" stroke="#111827" strokeWidth="8" />
        <path d="M-52 110 Q0 42 52 110 L34 164 H-34 Z" fill="#8b5cf6" stroke="#111827" strokeWidth="8" />
        <path d="M74 -8 C112 -52 152 10 122 46 C110 58 88 54 74 30" fill="none" stroke={h} strokeWidth="8" strokeLinecap="round" />
        <path d="M86 94 Q126 54 142 122" fill="none" stroke="#fb7185" strokeWidth="8" strokeLinecap="round" />
      </g>
    );
  }

  return (
    <g transform={transform}>
      <circle cx="0" cy="0" r="56" fill="#ffffff" stroke="#111827" strokeWidth="8" />
      <circle cx="-22" cy="-8" r="5" fill="#111827" />
      <circle cx="22" cy="-8" r="5" fill="#111827" />
      <path d="M-18 16 Q0 28 18 16" fill="none" stroke="#111827" strokeWidth="6" strokeLinecap="round" />
      <path d="M0 58 L0 142" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
      <path d="M0 92 L-54 124" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
      <path d="M0 92 L54 124" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
    </g>
  );
}

function StreetBuildingFacade({ building }: { building: { id: StreetBuildingId; title: string; subtitle: string; emoji: string } }) {
  return (
    <>
      <div style={streetFacadeCanvasStyle}>
        <StreetBuildingIllustration id={building.id} />
      </div>
      <div className="alba-street-building-sign" style={streetBuildingSignStyle}>{building.title}</div>
      <div className="alba-street-building-subtitle" style={streetBuildingSubtitleStyle}>{building.subtitle}</div>
    </>
  );
}

function StreetBuildingIllustration({ id }: { id: StreetBuildingId }) {
  if (id === "stocks") {
    return (
      <svg viewBox="0 0 160 210" style={streetFacadeSvgStyle} aria-hidden="true">
        <defs>
          <linearGradient id="stocksTowerGlass" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#e0f2fe" />
            <stop offset="45%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="stocksTowerSide" x1="0" x2="1">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <path d="M80 8 L122 36 L137 198 H23 L38 36 Z" fill="url(#stocksTowerGlass)" stroke="#111827" strokeWidth="6" strokeLinejoin="round" />
        <path d="M80 8 L122 36 L114 198 H80 Z" fill="url(#stocksTowerSide)" opacity="0.28" />
        <path d="M80 8 L92 44 L80 198 L68 44 Z" fill="rgba(255,255,255,0.35)" />
        {Array.from({ length: 9 }).map((_, row) => (
          <g key={row} opacity="0.82">
            <rect x="48" y={46 + row * 15} width="13" height="8" rx="3" fill="#eff6ff" />
            <rect x="73" y={46 + row * 15} width="13" height="8" rx="3" fill="#eff6ff" />
            <rect x="98" y={46 + row * 15} width="13" height="8" rx="3" fill="#dbeafe" />
          </g>
        ))}
        <path d="M46 28 L80 8 L114 28" fill="none" stroke="#111827" strokeWidth="5" strokeLinecap="round" />
        <circle cx="80" cy="26" r="12" fill="#facc15" stroke="#111827" strokeWidth="5" />
      </svg>
    );
  }

  if (id === "entertainment") {
    return (
      <svg viewBox="0 0 240 170" style={streetFacadeSvgStyle} aria-hidden="true">
        <defs>
          <linearGradient id="entGlass" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#e9d5ff" />
            <stop offset="55%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
        </defs>
        <path d="M38 160 L54 18 L218 18 L198 160 Z" fill="url(#entGlass)" stroke="#111827" strokeWidth="7" strokeLinejoin="round" />
        <path d="M56 20 L92 160" stroke="rgba(255,255,255,0.5)" strokeWidth="8" />
        <path d="M119 20 L153 160" stroke="rgba(255,255,255,0.35)" strokeWidth="8" />
        <text x="164" y="43" fontSize="22" fontWeight="900" fill="#f8fafc" stroke="#111827" strokeWidth="1.5">ENT</text>
        {Array.from({ length: 5 }).map((_, row) => (
          <g key={row}>
            {Array.from({ length: 4 }).map((__, col) => (
              <rect key={col} x={70 + col * 31} y={58 + row * 17} width="20" height="9" rx="4" fill={col % 2 === 0 ? "#fef3c7" : "#fdf2f8"} opacity="0.9" />
            ))}
          </g>
        ))}
        <rect x="26" y="132" width="188" height="28" rx="10" fill="rgba(17,24,39,0.74)" />
        <circle cx="52" cy="143" r="5" fill="#f472b6" />
        <circle cx="70" cy="143" r="5" fill="#facc15" />
        <circle cx="88" cy="143" r="5" fill="#60a5fa" />
      </svg>
    );
  }

  if (id === "logistics") {
    return (
      <svg viewBox="0 0 260 150" style={streetFacadeSvgStyle} aria-hidden="true">
        <defs>
          <linearGradient id="logisticsWall" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>
        <rect x="18" y="48" width="220" height="88" rx="10" fill="url(#logisticsWall)" stroke="#111827" strokeWidth="7" />
        <rect x="18" y="30" width="220" height="26" rx="5" fill="#ef4444" stroke="#111827" strokeWidth="5" />
        <rect x="50" y="78" width="44" height="58" rx="5" fill="#e5e7eb" stroke="#111827" strokeWidth="5" />
        <rect x="119" y="76" width="78" height="60" rx="6" fill="#f8fafc" stroke="#111827" strokeWidth="5" />
        <path d="M119 96 H197 M119 116 H197" stroke="#94a3b8" strokeWidth="4" />
        <rect x="202" y="105" width="48" height="24" rx="5" fill="#f97316" stroke="#111827" strokeWidth="4" />
        <circle cx="215" cy="132" r="8" fill="#111827" />
        <circle cx="238" cy="132" r="8" fill="#111827" />
        <rect x="34" y="59" width="20" height="10" rx="3" fill="#dbeafe" />
        <rect x="66" y="59" width="20" height="10" rx="3" fill="#dbeafe" />
        <rect x="98" y="59" width="20" height="10" rx="3" fill="#dbeafe" />
      </svg>
    );
  }

  if (id === "company") {
    return (
      <svg viewBox="0 0 220 170" style={streetFacadeSvgStyle} aria-hidden="true">
        <defs>
          <linearGradient id="officeWall" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
        </defs>
        <rect x="36" y="20" width="150" height="136" rx="16" fill="url(#officeWall)" stroke="#111827" strokeWidth="7" />
        <rect x="62" y="38" width="36" height="104" rx="8" fill="rgba(255,255,255,0.32)" />
        <rect x="116" y="38" width="36" height="104" rx="8" fill="rgba(255,255,255,0.24)" />
        {Array.from({ length: 5 }).map((_, row) => (
          <g key={row}>
            {Array.from({ length: 3 }).map((__, col) => (
              <rect key={col} x={56 + col * 42} y={44 + row * 19} width="25" height="10" rx="4" fill="#ffffff" opacity="0.85" />
            ))}
          </g>
        ))}
        <rect x="88" y="128" width="46" height="28" rx="8" fill="#475569" stroke="#111827" strokeWidth="4" />
      </svg>
    );
  }

  if (id === "finance" || id === "bank") {
    const label = id === "bank" ? "BANK" : "FUND";
    return (
      <svg viewBox="0 0 230 155" style={streetFacadeSvgStyle} aria-hidden="true">
        <defs>
          <linearGradient id={`${id}Stone`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={id === "bank" ? "#dcfce7" : "#e0f2fe"} />
            <stop offset="100%" stopColor={id === "bank" ? "#22c55e" : "#67e8f9"} />
          </linearGradient>
        </defs>
        <path d="M30 60 L115 20 L200 60 Z" fill="#f8fafc" stroke="#111827" strokeWidth="7" strokeLinejoin="round" />
        <rect x="42" y="60" width="146" height="78" rx="10" fill={`url(#${id}Stone)`} stroke="#111827" strokeWidth="7" />
        {Array.from({ length: 4 }).map((_, col) => (
          <rect key={col} x={58 + col * 31} y="70" width="18" height="58" rx="9" fill="rgba(255,255,255,0.72)" stroke="rgba(17,24,39,0.32)" strokeWidth="3" />
        ))}
        <rect x="74" y="30" width="82" height="30" rx="12" fill="rgba(255,255,255,0.88)" stroke="#111827" strokeWidth="5" />
        <text x="115" y="50" textAnchor="middle" fontSize="16" fontWeight="900" fill="#111827">{label}</text>
      </svg>
    );
  }

  if (id === "estate") {
    return (
      <svg viewBox="0 0 220 150" style={streetFacadeSvgStyle} aria-hidden="true">
        <rect x="46" y="48" width="54" height="86" rx="8" fill="#e5e7eb" stroke="#111827" strokeWidth="5" />
        <rect x="114" y="28" width="64" height="106" rx="8" fill="#cbd5e1" stroke="#111827" strokeWidth="5" />
        <path d="M38 52 L72 22 L108 52" fill="#f97316" stroke="#111827" strokeWidth="5" strokeLinejoin="round" />
        {Array.from({ length: 4 }).map((_, row) => (
          <g key={row}>
            <rect x="60" y={62 + row * 16} width="16" height="9" rx="3" fill="#ffffff" />
            <rect x="130" y={44 + row * 19} width="15" height="10" rx="3" fill="#ffffff" />
            <rect x="154" y={44 + row * 19} width="15" height="10" rx="3" fill="#ffffff" />
          </g>
        ))}
      </svg>
    );
  }

  if (id === "business") {
    return (
      <svg viewBox="0 0 220 150" style={streetFacadeSvgStyle} aria-hidden="true">
        <rect x="30" y="58" width="160" height="78" rx="12" fill="#fed7aa" stroke="#111827" strokeWidth="6" />
        <path d="M26 58 H194 L176 28 H44 Z" fill="#fb923c" stroke="#111827" strokeWidth="6" strokeLinejoin="round" />
        <rect x="58" y="82" width="34" height="54" rx="7" fill="#f8fafc" stroke="#111827" strokeWidth="4" />
        <rect x="112" y="82" width="52" height="28" rx="8" fill="#ffffff" stroke="#111827" strokeWidth="4" />
        <text x="138" y="101" textAnchor="middle" fontSize="12" fontWeight="900" fill="#111827">OPEN</text>
      </svg>
    );
  }

  if (id === "news") {
    return (
      <svg viewBox="0 0 200 140" style={streetFacadeSvgStyle} aria-hidden="true">
        <rect x="32" y="40" width="136" height="86" rx="12" fill="#c4b5fd" stroke="#111827" strokeWidth="6" />
        <rect x="54" y="22" width="92" height="42" rx="14" fill="#ffffff" stroke="#111827" strokeWidth="5" />
        <text x="100" y="50" textAnchor="middle" fontSize="14" fontWeight="900" fill="#111827">NEWS</text>
        <rect x="54" y="76" width="92" height="9" rx="4" fill="#ffffff" opacity="0.85" />
        <rect x="54" y="94" width="70" height="9" rx="4" fill="#ffffff" opacity="0.85" />
        <rect x="54" y="112" width="100" height="9" rx="4" fill="#ffffff" opacity="0.85" />
      </svg>
    );
  }

  if (id === "academy") {
    return (
      <svg viewBox="0 0 220 150" style={streetFacadeSvgStyle} aria-hidden="true">
        <rect x="34" y="44" width="152" height="88" rx="14" fill="#ddd6fe" stroke="#111827" strokeWidth="6" />
        <path d="M36 48 L110 18 L184 48" fill="#8b5cf6" stroke="#111827" strokeWidth="6" strokeLinejoin="round" />
        <rect x="68" y="74" width="84" height="42" rx="10" fill="#ffffff" stroke="#111827" strokeWidth="5" />
        <text x="110" y="101" textAnchor="middle" fontSize="16" fontWeight="900" fill="#111827">EDU</text>
        <rect x="50" y="62" width="18" height="56" rx="8" fill="rgba(255,255,255,0.65)" />
        <rect x="154" y="62" width="18" height="56" rx="8" fill="rgba(255,255,255,0.65)" />
      </svg>
    );
  }

  if (id === "gacha") {
    return (
      <svg viewBox="0 0 220 150" style={streetFacadeSvgStyle} aria-hidden="true">
        <rect x="42" y="34" width="136" height="104" rx="22" fill="#f9a8d4" stroke="#111827" strokeWidth="6" />
        <rect x="66" y="52" width="88" height="34" rx="14" fill="#ffffff" stroke="#111827" strokeWidth="5" />
        <text x="110" y="76" textAnchor="middle" fontSize="15" fontWeight="900" fill="#be123c">GACHA</text>
        <circle cx="82" cy="106" r="15" fill="#fef3c7" stroke="#111827" strokeWidth="4" />
        <circle cx="118" cy="106" r="15" fill="#bfdbfe" stroke="#111827" strokeWidth="4" />
        <circle cx="154" cy="106" r="15" fill="#bbf7d0" stroke="#111827" strokeWidth="4" />
        <rect x="96" y="122" width="30" height="16" rx="5" fill="#111827" />
      </svg>
    );
  }

  if (id === "lotto") {
    return (
      <svg viewBox="0 0 220 150" style={streetFacadeSvgStyle} aria-hidden="true">
        <rect x="34" y="48" width="152" height="86" rx="18" fill="#bbf7d0" stroke="#111827" strokeWidth="6" />
        <rect x="56" y="24" width="108" height="40" rx="16" fill="#ffffff" stroke="#111827" strokeWidth="5" />
        <text x="110" y="50" textAnchor="middle" fontSize="16" fontWeight="900" fill="#166534">LOTTO</text>
        {Array.from({ length: 5 }).map((_, index) => (
          <circle key={index} cx={60 + index * 25} cy="91" r="11" fill={index % 2 === 0 ? "#facc15" : "#60a5fa"} stroke="#111827" strokeWidth="3" />
        ))}
        <rect x="72" y="113" width="76" height="18" rx="7" fill="#ffffff" stroke="#111827" strokeWidth="4" />
      </svg>
    );
  }


  if (id === "luxury") {
    return (
      <svg viewBox="0 0 240 170" style={streetFacadeSvgStyle} aria-hidden="true">
        <defs>
          <linearGradient id="luxuryShopWall" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fdf2f8" />
            <stop offset="55%" stopColor="#f9a8d4" />
            <stop offset="100%" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        <rect x="34" y="48" width="172" height="92" rx="16" fill="url(#luxuryShopWall)" stroke="#111827" strokeWidth="7" />
        <path d="M42 50 L68 22 H182 L206 50 Z" fill="#facc15" stroke="#111827" strokeWidth="6" strokeLinejoin="round" />
        <rect x="72" y="64" width="96" height="34" rx="15" fill="#ffffff" stroke="#111827" strokeWidth="5" />
        <text x="120" y="87" textAnchor="middle" fontSize="16" fontWeight="900" fill="#7c3aed">LUX</text>
        <rect x="58" y="102" width="42" height="38" rx="8" fill="#fff7ed" stroke="#111827" strokeWidth="4" />
        <rect x="140" y="102" width="42" height="38" rx="8" fill="#eff6ff" stroke="#111827" strokeWidth="4" />
        <circle cx="120" cy="120" r="14" fill="#facc15" stroke="#111827" strokeWidth="4" />
      </svg>
    );
  }

  if (id === "itemMarket") {
    return (
      <svg viewBox="0 0 220 150" style={streetFacadeSvgStyle} aria-hidden="true">
        <rect x="30" y="52" width="160" height="82" rx="14" fill="#67e8f9" stroke="#111827" strokeWidth="6" />
        <path d="M32 52 H188 L166 26 H54 Z" fill="#06b6d4" stroke="#111827" strokeWidth="6" strokeLinejoin="round" />
        <rect x="56" y="78" width="42" height="38" rx="8" fill="#ffffff" stroke="#111827" strokeWidth="4" />
        <rect x="122" y="78" width="42" height="38" rx="8" fill="#ffffff" stroke="#111827" strokeWidth="4" />
        <path d="M98 96 H122" stroke="#111827" strokeWidth="6" strokeLinecap="round" />
        <text x="110" y="47" textAnchor="middle" fontSize="14" fontWeight="900" fill="#111827">MARKET</text>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 220 150" style={streetFacadeSvgStyle} aria-hidden="true">
      <rect x="35" y="42" width="150" height="90" rx="14" fill="#fdba74" stroke="#111827" strokeWidth="6" />
      <rect x="62" y="34" width="96" height="34" rx="16" fill="#ffffff" stroke="#111827" strokeWidth="5" />
      <text x="110" y="56" textAnchor="middle" fontSize="18" fontWeight="900" fill="#111827">777</text>
      {Array.from({ length: 6 }).map((_, index) => (
        <rect key={index} x={60 + (index % 3) * 38} y={82 + Math.floor(index / 3) * 22} width="28" height="12" rx="5" fill="#fff7ed" opacity="0.95" />
      ))}
    </svg>
  );
}

function SortingGame({ item, combo, miss, difficulty }: { item: SortItem; combo: number; miss: number; difficulty: number }) {
  const activeKinds = getActiveSortKinds(difficulty);
  return (
    <div style={sortingStageStyle}>
      <div style={miniGameTopInfoStyle}>
        <strong>콤보 {combo}</strong>
        <strong>실수 {miss}/3</strong>
      </div>
      <div style={conveyorStyle}>
        <div style={sortJudgeZoneStyle}>좁은 판정 구역</div>
        <div style={{ ...sortPackageStyle, left: `${item.x}%`, filter: item.feedback === "good" ? "drop-shadow(0 0 18px #22c55e)" : item.feedback === "bad" ? "drop-shadow(0 0 18px #ef4444)" : "none", transform: item.feedback === "good" ? "translate(-50%, -50%) scale(1.25)" : item.feedback === "bad" ? "translate(-50%, -50%) rotate(-8deg)" : "translate(-50%, -50%)" }}>
          {item.feedback === "good" ? "✨" : item.feedback === "bad" ? "💥" : sortInfo[item.kind].emoji}
        </div>
      </div>
      <div style={{ ...sortBinsStyle, gridTemplateColumns: `repeat(${activeKinds.length}, 1fr)` }}>
        {activeKinds.map((kind) => <div key={kind} style={sortBinStyle}>{sortInfo[kind].key}키 {sortInfo[kind].emoji} {sortInfo[kind].label}</div>)}
      </div>
    </div>
  );
}

function DeliveryGame({ lane, obstacles, coins, distance, flash, miss }: { lane: number; obstacles: RunnerObstacle[]; coins: RunnerCoin[]; distance: number; flash: boolean; miss: number }) {
  return (
    <div style={runnerStageStyle}>
      <div style={{ ...runnerRoadStyle, boxShadow: flash ? "0 0 0 5px rgba(239,68,68,0.55) inset" : "none" }}>
        {[0, 1, 2].map((roadLane) => (
          <div key={roadLane} style={runnerLaneStyle}>
            {lane === roadLane && <div style={runnerPlayerStyle}>🛵</div>}
            {coins.filter((coin) => coin.lane === roadLane).map((coin) => <div key={coin.id} style={{ ...runnerCoinStyle, top: `${coin.y}%` }}>🍱</div>)}
            {obstacles.filter((obstacle) => obstacle.lane === roadLane).map((obstacle) => <div key={obstacle.id} style={{ ...runnerObstacleStyle, top: `${obstacle.y}%` }}>🚧</div>)}
          </div>
        ))}
      </div>
      <div style={runnerProgressStyle}>주행 거리: {Math.floor(distance)}m · 사고 {miss}/3 · 🍱 통과 시 +{PAY.delivery.toLocaleString()}원</div>
    </div>
  );
}

function CashierGame({ sequence, currentIndex, success, miss, difficulty }: { sequence: string[]; currentIndex: number; success: number; miss: number; difficulty: number }) {
  return (
    <div style={centerGameStyle}>
      <div style={cashierPanelStyle}>
        <div style={miniGameTopInfoStyle}><strong>계산 {success}회</strong><strong>난이도 Lv.{difficulty}</strong><strong>실수 {miss}/3</strong></div>
        <div style={cashierTitleStyle}>입력할 키</div>
        <div style={sequenceRowStyle}>
          {sequence.map((key, index) => <div key={`${key}-${index}`} style={getCashierKeyVisualStyle(index, currentIndex)}>{key}</div>)}
        </div>
        <p style={cashierHintStyle}>현재 입력: <strong>{sequence[currentIndex] ?? "완료"}</strong></p>
      </div>
    </div>
  );
}

function CafeGame({ fill, targetStart, targetEnd, success, miss, holding, difficulty }: { fill: number; targetStart: number; targetEnd: number; success: number; miss: number; holding: boolean; difficulty: number }) {
  return (
    <div style={cafeStageStyle}>
      <div style={miniGameTopInfoStyle}><strong>완성 {success}잔</strong><strong>실수 {miss}/3</strong></div>
      <div style={cupAreaStyle}>
        <div style={{ ...cupStyle, borderRadius: difficulty >= 5 ? "18px 8px 34px 20px" : difficulty >= 3 ? "8px 8px 30px 30px" : "0 0 26px 26px", transform: difficulty >= 6 ? "skewX(-5deg)" : "none" }}>
          <div style={{ ...coffeeFillStyle, height: `${fill}%` }} />
          <div style={{ ...cafeTargetZoneStyle, bottom: `${targetStart}%`, height: `${targetEnd - targetStart}%` }} />
        </div>
        <div style={cafeGaugeTextStyle}>{holding ? "따르는 중..." : "Space를 누르고 있다가 목표 구간에서 떼기"}</div>
      </div>
    </div>
  );
}

function SecurityGame({ signal, success, miss, round }: { signal: SecuritySignal; success: number; miss: number; round: number }) {
  const character = signal === "thief" ? "🕵️‍♂️" : signal === "vip" ? "🤵" : "🚶";
  const label = signal === "thief" ? "수상한 사람!" : signal === "vip" ? "VIP 손님" : "평범한 손님";
  const mood = signal === "thief" ? "검문하세요" : signal === "vip" ? "통과시키세요" : "그냥 보내세요";
  const badgeColor = signal === "thief" ? "#f87171" : signal === "vip" ? "#facc15" : "#86efac";

  return (
    <div style={securityStageStyle}>
      <style>{`
        @keyframes securityWalkIn {
          0% { transform: translateX(-130%) scale(0.9); opacity: 0; }
          35% { opacity: 1; }
          100% { transform: translateX(0) scale(1); opacity: 1; }
        }

        @keyframes securityPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.04); }
        }
  
      .alba-mobile-only {
        display: none !important;
      }

      @media (max-width: 1100px), (pointer: coarse) {
        html, body {
          overflow-x: hidden !important;
          touch-action: manipulation;
        }

        .alba-game-root {
          width: 100% !important;
          min-height: 100svh !important;
          height: auto !important;
          overflow: auto !important;
          padding: 0 !important;
        }

        .alba-world-layout {
          width: 100% !important;
          height: auto !important;
          min-height: 100svh !important;
          display: flex !important;
          flex-direction: column !important;
          overflow: visible !important;
          padding: 8px !important;
          gap: 10px !important;
        }

        .alba-world-body {
          width: 100% !important;
          min-height: 0 !important;
          height: auto !important;
          overflow: visible !important;
        }

        .alba-mobile-only {
          display: flex !important;
        }

        .alba-mobile-nav {
          position: sticky !important;
          top: 0 !important;
          z-index: 80 !important;
          gap: 7px !important;
          overflow-x: auto !important;
          padding: 8px !important;
          margin: 0 -2px 4px !important;
          border: 3px solid #111827 !important;
          border-radius: 18px !important;
          background: rgba(255,255,255,0.96) !important;
          box-shadow: 0 8px 0 rgba(17,24,39,0.10) !important;
          -webkit-overflow-scrolling: touch;
        }

        .alba-mobile-nav button,
        .alba-mobile-touch-controls button,
        .alba-mobile-street-list button {
          min-height: 48px !important;
          min-width: 74px !important;
          border: 3px solid #111827 !important;
          border-radius: 16px !important;
          background: #ffffff !important;
          color: #111827 !important;
          font-weight: 900 !important;
          font-size: 14px !important;
          box-shadow: 0 5px 0 rgba(17,24,39,0.14) !important;
        }

        .alba-room-scene,
        .alba-street-scene {
          height: auto !important;
          min-height: 0 !important;
          display: flex !important;
          flex-direction: column !important;
          gap: 10px !important;
          padding: 12px !important;
          overflow: visible !important;
          border-radius: 20px !important;
        }

        .alba-room-scene > svg,
        .alba-street-scene > svg {
          position: relative !important;
          inset: auto !important;
          width: 100% !important;
          height: clamp(210px, 45vw, 360px) !important;
          min-height: 210px !important;
          border: 3px solid #111827 !important;
          border-radius: 18px !important;
          background: #f8fafc !important;
          overflow: hidden !important;
          z-index: 1 !important;
          order: 2 !important;
        }

        .alba-room-money,
        .alba-street-money,
        .alba-room-info,
        .alba-street-page-info,
        .alba-room-side-controls,
        .alba-room-nav,
        .alba-street-bottom-nav {
          position: relative !important;
          inset: auto !important;
          left: auto !important;
          right: auto !important;
          top: auto !important;
          bottom: auto !important;
          transform: none !important;
          width: 100% !important;
          max-width: none !important;
          z-index: 5 !important;
        }

        .alba-room-money,
        .alba-street-money {
          order: 0 !important;
          font-size: 16px !important;
          display: inline-flex !important;
          align-self: flex-start !important;
          width: auto !important;
          max-width: 100% !important;
        }

        .alba-room-info,
        .alba-street-page-info {
          order: 1 !important;
          font-size: 13px !important;
          text-align: left !important;
        }

        .alba-room-side-controls {
          display: none !important;
        }

        .alba-room-nav,
        .alba-street-bottom-nav {
          order: 4 !important;
          display: grid !important;
          grid-template-columns: 1fr !important;
          gap: 8px !important;
        }

        .alba-street-page-arrow,
        .alba-street-buildings-row {
          display: none !important;
        }

        .alba-mobile-street-list {
          order: 3 !important;
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 8px !important;
        }

        .alba-panel-scene,
        .alba-stock-scene,
        .alba-job-only-layout {
          height: auto !important;
          min-height: 100svh !important;
          overflow: visible !important;
        }

        .alba-job-stage {
          min-height: 360px !important;
          height: auto !important;
          overflow: visible !important;
        }

        .alba-job-footer {
          gap: 8px !important;
        }

        .alba-mobile-touch-controls {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 8px !important;
          width: 100% !important;
        }

        .alba-mobile-touch-controls.sorting,
        .alba-mobile-touch-controls.cashier {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
        }

        .alba-mobile-touch-controls.cafe,
        .alba-mobile-touch-controls.security {
          grid-template-columns: 1fr !important;
        }

        .alba-mobile-touch-controls .wide {
          grid-column: 1 / -1 !important;
        }
      }

      @media (max-width: 560px) {
        .alba-mobile-street-list,
        .alba-mobile-touch-controls.sorting,
        .alba-mobile-touch-controls.cashier {
          grid-template-columns: 1fr 1fr !important;
        }

        .alba-room-scene > svg,
        .alba-street-scene > svg {
          height: 220px !important;
        }
      }


    `}</style>

      <div style={miniGameTopInfoStyle}>
        <strong>대응 {success}회</strong>
        <strong>실수 {miss}/3</strong>
      </div>

      <div style={securityPanelStyle}>
        <div style={securityQueueStyle}>
          <div style={securityGateStyle}>입구</div>
          <div style={securityLineStyle} />
          <div style={securityDeskStyle}>검문대</div>
          <div style={securityLineStyle} />
          <div style={securityGateStyle}>출구</div>
        </div>

        <div style={securitySceneStyle}>
          <div key={round} style={securityCharacterWrapStyle}>
            <div style={securityCharacterStyle}>{character}</div>
          </div>
        </div>

        <div style={{ ...securityBadgeStyle, borderColor: badgeColor, color: badgeColor }}>
          {label} · {mood}
        </div>

        <div style={securityHintStyle}>
          다음 손님 #{round + 1} · 수상한 사람일 때만 <strong>Space</strong> · VIP 차단 시 -{PAY.vipPenalty.toLocaleString()}원
        </div>
      </div>
    </div>
  );
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 5);
}

function makeLottoTicket(price: number, luckBonus = 0): LottoTicket {
  const roll = Math.max(0, Math.random() - Math.min(0.08, luckBonus * 0.18));
  let multiplier = 0;

  if (roll < 0.0008) multiplier = 400;
  else if (roll < 0.004) multiplier = 80;
  else if (roll < 0.018) multiplier = 15;
  else if (roll < 0.07) multiplier = 3;
  else if (roll < 0.18) multiplier = 1;

  return {
    id: `lotto-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    price,
    prize: Math.floor(price * multiplier),
    scratched: false,
    createdDate: getTodayKey(),
  };
}

function isValidLottoTicket(value: unknown): value is LottoTicket {
  if (!value || typeof value !== "object") return false;
  const ticket = value as Partial<LottoTicket>;
  return typeof ticket.id === "string" && typeof ticket.price === "number" && typeof ticket.prize === "number" && typeof ticket.scratched === "boolean" && typeof ticket.createdDate === "string";
}

function getStreetBuildingsForPage(page: number) {
  const ids = streetBuildingPages[page] ?? [];
  return ids
    .map((id) => streetBuildings.find((building) => building.id === id))
    .filter((building): building is NonNullable<typeof building> => Boolean(building));
}

function getStreetPageLabel(page: number) {
  if (page === 0) return "도심 업무 지구";
  if (page === 1) return "투자 · 금융 지구";
  if (page === 2) return "자산 · 사업 지구";
  if (page === 3) return "리스크 · 교육 지구";
  if (page === 4) return "가챠 · 거래 지구";
  return "럭셔리 · 카지노 지구";
}

function getStreetBuildingHeight(buildingId: StreetBuildingId) {
  if (buildingId === "stocks") return "330px";
  if (buildingId === "entertainment") return "252px";
  if (buildingId === "company") return "246px";
  if (buildingId === "finance") return "224px";
  if (buildingId === "bank") return "224px";
  if (buildingId === "logistics") return "184px";
  if (buildingId === "estate") return "196px";
  if (buildingId === "business") return "192px";
  if (buildingId === "news") return "178px";
  if (buildingId === "casino") return "198px";
  if (buildingId === "luxury") return "214px";
  if (buildingId === "academy") return "206px";
  if (buildingId === "gacha") return "198px";
  if (buildingId === "itemMarket") return "192px";
  if (buildingId === "lotto") return "188px";
  return "200px";
}

function getStreetBuildingPlacement(buildingId: StreetBuildingId, page: number): CSSProperties {
  if (page === 0) {
    if (buildingId === "company") return { left: "8%", bottom: "136px", width: "20%" };
    if (buildingId === "entertainment") return { left: "39%", bottom: "132px", width: "24%" };
    if (buildingId === "finance") return { left: "73%", bottom: "140px", width: "18%" };
  }

  if (page === 1) {
    if (buildingId === "bank") return { left: "10%", bottom: "138px", width: "18%" };
    if (buildingId === "stocks") return { left: "43%", bottom: "110px", width: "14%" };
    if (buildingId === "logistics") return { left: "68%", bottom: "134px", width: "26%" };
  }

  if (page === 2) {
    if (buildingId === "estate") return { left: "12%", bottom: "132px", width: "20%" };
    if (buildingId === "business") return { left: "40%", bottom: "130px", width: "22%" };
    if (buildingId === "news") return { left: "70%", bottom: "138px", width: "18%" };
  }

  if (page === 3) {
    if (buildingId === "insurance") return { left: "11%", bottom: "138px", width: "20%" };
    if (buildingId === "employees") return { left: "40%", bottom: "132px", width: "22%" };
    if (buildingId === "academy") return { left: "70%", bottom: "130px", width: "20%" };
  }

  if (page === 4) {
    if (buildingId === "gacha") return { left: "7%", bottom: "134px", width: "24%" };
    if (buildingId === "lotto") return { left: "38%", bottom: "134px", width: "24%" };
    if (buildingId === "itemMarket") return { left: "69%", bottom: "134px", width: "24%" };
  }

  if (page === 5) {
    if (buildingId === "luxury") return { left: "19%", bottom: "132px", width: "26%" };
    if (buildingId === "casino") return { left: "55%", bottom: "132px", width: "26%" };
  }

  return { left: "38%", bottom: "132px", width: "22%" };
}
function getStreetBuildingTheme(buildingId: StreetBuildingId): CSSProperties {
  if (buildingId === "stocks") {
    return {
      background: "linear-gradient(180deg, #dbeafe 0%, #60a5fa 100%)",
      borderColor: "#1e3a8a",
    };
  }

  if (buildingId === "insurance") {
    return { background: "linear-gradient(180deg, #dbeafe 0%, #93c5fd 100%)", borderColor: "#1d4ed8" };
  }

  if (buildingId === "employees") {
    return { background: "linear-gradient(180deg, #dcfce7 0%, #4ade80 100%)", borderColor: "#166534" };
  }

  if (buildingId === "auction") {
    return { background: "linear-gradient(180deg, #fef3c7 0%, #fbbf24 100%)", borderColor: "#92400e" };
  }

  if (buildingId === "academy") return { background: "linear-gradient(180deg, #ede9fe 0%, #a78bfa 100%)", borderColor: "#5b21b6" };

  if (buildingId === "gacha") return { background: "linear-gradient(180deg, #fdf2f8 0%, #f472b6 100%)", borderColor: "#9d174d" };
  if (buildingId === "itemMarket") return { background: "linear-gradient(180deg, #ecfeff 0%, #22d3ee 100%)", borderColor: "#155e75" };

  if (buildingId === "lotto") {
    return {
      background: "linear-gradient(180deg, #dcfce7 0%, #22c55e 100%)",
      borderColor: "#166534",
    };
  }

  if (buildingId === "luxury") {
    return {
      background: "linear-gradient(180deg, #fdf2f8 0%, #c084fc 100%)",
      borderColor: "#7e22ce",
    };
  }

  if (buildingId === "casino") {
    return {
      background: "linear-gradient(180deg, #fee2e2 0%, #f97316 100%)",
      borderColor: "#7c2d12",
    };
  }

  if (buildingId === "company") {
    return {
      background: "linear-gradient(180deg, #f8fafc 0%, #cbd5e1 100%)",
      borderColor: "#334155",
    };
  }

  if (buildingId === "entertainment") {
    return {
      background: "linear-gradient(180deg, #fce7f3 0%, #e879f9 100%)",
      borderColor: "#86198f",
    };
  }

  if (buildingId === "logistics") {
    return {
      background: "linear-gradient(180deg, #fef3c7 0%, #f59e0b 100%)",
      borderColor: "#92400e",
    };
  }

  if (buildingId === "bank") {
    return {
      background: "linear-gradient(180deg, #dcfce7 0%, #22c55e 100%)",
      borderColor: "#166534",
    };
  }

  if (buildingId === "estate") {
    return {
      background: "linear-gradient(180deg, #f5f5f4 0%, #a8a29e 100%)",
      borderColor: "#44403c",
    };
  }

  if (buildingId === "business") {
    return {
      background: "linear-gradient(180deg, #ffedd5 0%, #fb923c 100%)",
      borderColor: "#9a3412",
    };
  }

  if (buildingId === "news") {
    return {
      background: "linear-gradient(180deg, #e0e7ff 0%, #818cf8 100%)",
      borderColor: "#3730a3",
    };
  }

  return {
    background: "linear-gradient(180deg, #ecfeff 0%, #67e8f9 100%)",
    borderColor: "#155e75",
  };
}

function makeAuctionDeals() {
  return [...auctionDealPool]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((deal) => {
      const discount = 0.72 + Math.random() * 0.16;
      return { ...deal, price: Math.max(1000, Math.floor(deal.value * discount)) };
    });
}

function makeNewsEvents() {
  const shuffled = [...newsPool].sort(() => Math.random() - 0.5);
  const selected: NewsEvent[] = [];

  for (const event of shuffled) {
    const duplicatedSector = selected.some((item) => item.sector === event.sector);
    if (!duplicatedSector || selected.length < 2) selected.push(event);
    if (selected.length >= 3) break;
  }

  return selected;
}

function getStockCompanyName(id: StockId) {
  return stockCompanies.find((company) => company.id === id)?.name ?? id;
}

function getReturnRate(balance: number, principal: number) {
  if (principal <= 0) return "0.00%";
  return `${(((balance - principal) / principal) * 100).toFixed(2)}%`;
}

function getLoanLimit(creditScore: number, netWorth: number) {
  const base = Math.max(50000, Math.floor(Math.max(0, netWorth) * 0.35) + 100000);
  const creditMultiplier = creditScore >= 800 ? 1.8 : creditScore >= 700 ? 1.35 : creditScore >= 600 ? 1 : 0.55;
  return Math.floor(base * creditMultiplier);
}

function normalizePvpMatch(match: PvpMatchRow): PvpMatchRow {
  return {
    ...match,
    stake: Number(match.stake ?? 0),
    challenger_score: Number(match.challenger_score ?? 0),
    opponent_score: Number(match.opponent_score ?? 0),
  };
}

function getSlotResultLabel(result: string) {
  if (result === "jackpot") return "대박";
  if (result === "win") return "성공";
  if (result === "draw") return "본전";
  return "실패";
}

function getSlotResultMessage(result: SlotResult) {
  const profit = Number(result.profit ?? 0);
  if (result.result === "jackpot") return `🎰 대박! +${profit.toLocaleString()}원`;
  if (result.result === "win") return `🎰 슬롯 성공! +${profit.toLocaleString()}원`;
  if (result.result === "draw") return "🎰 본전입니다.";
  return `🎰 실패! ${Math.abs(profit).toLocaleString()}원을 잃었습니다.`;
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function getRandomSlotSymbols() {
  return Array.from({ length: 3 }, () => SLOT_SYMBOLS[Math.floor(Math.random() * SLOT_SYMBOLS.length)]);
}

function getSlotDisplaySymbols(result: string) {
  if (result === "jackpot") return ["7", "7", "7"];
  if (result === "win") return ["💎", "💎", "💎"];
  if (result === "draw") return ["🍒", "🍒", "🍒"];
  return ["🍋", "🍀", "⭐"];
}

function getPhoneAppTitle(app: "home" | "wallet" | "chart" | "income" | "buffs" | "collection") {
  if (app === "wallet") return "자산 지갑";
  if (app === "chart") return "수익 통계";
  if (app === "income") return "수입 일정";
  if (app === "buffs") return "버프 관리";
  if (app === "collection") return "아이템 도감";
  return "홈";
}


function getTitleDisplayDescription(title: PlayerTitle, unlocked: boolean) {
  if (!title.hidden) return title.description;
  if (!unlocked) return "조건 비공개 · 아주 희귀한 칭호입니다.";
  return secretTitleConditionText[title.id] ?? title.description;
}

const secretTitleConditionText: Partial<Record<PlayerTitleId, string>> = {
  hiddenZero: "해금 완료: 현금 0원 이하에서 다시 100,000원 이상 회복",
  hiddenWhale: "해금 완료: 순자산 20,000,000원 이상 달성",
  hiddenLucky: "해금 완료: 로또 또는 가챠에서 고등급 보상을 여러 번 획득",
  hiddenEstateLord: "해금 완료: 고급 부동산 3개 이상 보유",
  hiddenLaborKing: "해금 완료: 알바 성공 총합 250회 이상",
  hiddenMarketGhost: "해금 완료: 주식 10종 이상 보유 및 큰 손익 변동 경험",
  hiddenRelicDealer: "해금 완료: 유물 아이템 2개 이상 획득",
  hiddenDebtFree: "해금 완료: 대출 0원 상태에서 순자산 5,000,000원 이상",
  hiddenCasinoDemon: "해금 완료: 카지노에서 큰 승부를 여러 번 진행",
  hiddenEconomyGod: "해금 완료: 순자산 100,000,000원 이상과 주요 경제 콘텐츠 대부분 달성",
};

function getPvpStatusLabel(status: PvpMatchRow["status"]) {
  if (status === "waiting") return "수락 대기";
  if (status === "accepted") return "플레이 가능";
  if (status === "playing") return "점수 대기";
  if (status === "finished") return "종료";
  return "취소";
}

function getCasinoUserName(id: string | null, users: CasinoUserRow[], currentUserId: string | null, nickname: string) {
  if (!id) return "알 수 없음";
  if (id === currentUserId) return nickname;
  return users.find((user) => user.id === id)?.nickname ?? `유저-${id.slice(0, 8)}`;
}

function getPvpOpponentName(match: PvpMatchRow, currentUserId: string | null, users: CasinoUserRow[], nickname: string) {
  const opponentId = match.challenger_id === currentUserId ? match.opponent_id : match.challenger_id;
  return getCasinoUserName(opponentId, users, currentUserId, nickname);
}

function getCareerTargetScore(occupation: Occupation) {
  return 3 + occupation.minigameDifficulty;
}

function getCareerMaxSteps(occupation: Occupation) {
  return getCareerTargetScore(occupation) + 2;
}

function getCareerTimeLimit(occupation: Occupation) {
  return Math.max(12, 31 - occupation.minigameDifficulty * 4);
}

function getCareerGameMode(occupation: Occupation) {
  if (occupation.buildingId === "company") return "office";
  if (occupation.buildingId === "entertainment") return "rhythm";
  if (occupation.buildingId === "logistics") return "logistics";
  return "finance";
}

function getCareerGameInstruction(occupation: Occupation) {
  if (occupation.buildingId === "company") return "회사 업무처럼 W/A/S/D 키를 빠르고 정확하게 처리하세요. 직급이 높을수록 처리할 업무 키가 길어집니다.";
  if (occupation.buildingId === "entertainment") return "리듬게임처럼 A/S/D/F 키를 박자 순서대로 입력하세요. 높은 단계일수록 패턴이 길어집니다.";
  if (occupation.buildingId === "logistics") return "테트리스처럼 물류 블록을 목표 라인에 쌓으세요. A/D 이동, Space 또는 Enter로 적재합니다.";
  return "투자 뉴스와 차트 흐름을 보고 매수/매도/보류 중 올바른 판단을 선택하세요.";
}

function makeCareerOfficeSequence(occupation: Occupation, step: number) {
  const keys = ["W", "A", "S", "D"];
  const length = Math.min(12, 4 + occupation.minigameDifficulty * 2 + (step % 2));
  return Array.from({ length }, () => keys[Math.floor(Math.random() * keys.length)]);
}

function makeCareerRhythmSequence(occupation: Occupation, step: number) {
  const keys = ["A", "S", "D", "F"];
  const length = Math.min(14, 5 + occupation.minigameDifficulty * 2 + (step % 3));
  return Array.from({ length }, (_, index) => keys[(index + Math.floor(Math.random() * keys.length)) % keys.length]);
}

function makeCareerLogisticsTargets(occupation: Occupation, step: number) {
  const length = Math.min(9, 3 + occupation.minigameDifficulty + (step % 2));
  return Array.from({ length }, () => String(Math.floor(Math.random() * 6)));
}

function makeCareerFinanceRound(occupation: Occupation, step: number) {
  const rounds = [
    { prompt: "반도체 수출이 증가하고 환율이 안정되었습니다. 성장주에는 어떤 판단이 적절할까요?", answer: "매수" },
    { prompt: "원자재 가격이 급등하고 실적 전망이 하향되었습니다. 위험 관리 판단은?", answer: "매도" },
    { prompt: "실적 발표 전이고 거래량이 낮습니다. 무리한 진입보다 적절한 판단은?", answer: "보류" },
    { prompt: "기관 매수세가 강하고 5일선이 20일선을 돌파했습니다. 단기 판단은?", answer: "매수" },
    { prompt: "급등 후 거래량이 줄고 악재 뉴스가 나왔습니다. 적절한 판단은?", answer: "매도" },
  ];
  const selected = rounds[(step + occupation.minigameDifficulty) % rounds.length];
  return { ...selected, choices: ["매수", "매도", "보류"] };
}

function getCareerQuestNpc(buildingId: CareerBuildingId) {
  if (buildingId === "company") return "전직 멘토 한 실장";
  if (buildingId === "entertainment") return "프로듀서 루나";
  if (buildingId === "logistics") return "관제장 박 반장";
  return "차트 분석가 민";
}

function getCareerNpcAvatar(buildingId: CareerBuildingId) {
  if (buildingId === "company") return "🧑‍💼";
  if (buildingId === "entertainment") return "🎙️";
  if (buildingId === "logistics") return "👷";
  return "🧑‍💻";
}

function getCareerNpcLine(buildingId: CareerBuildingId) {
  if (buildingId === "company") return "일은 결국 태도와 순서야. 준비됐으면 내 퀘스트를 받아.";
  if (buildingId === "entertainment") return "무대는 기다려주지 않아. 리듬을 증명해봐.";
  if (buildingId === "logistics") return "물류는 한 칸만 틀려도 전부 무너진다. 침착하게 움직여.";
  return "숫자는 거짓말하지 않아. 네 판단을 데이터로 증명해.";
}

function getCareerBuildingName(buildingId: CareerBuildingId) {
  if (buildingId === "company") return "회사 빌딩";
  if (buildingId === "entertainment") return "엔터테인먼트";
  if (buildingId === "logistics") return "물류 센터";
  return "투자 회사";
}

function safeParseOccupationList(value: string): OccupationId[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    return Array.isArray(parsed) ? normalizeUnlockedOccupations(parsed) : ["unemployed"];
  } catch {
    return ["unemployed"];
  }
}

function normalizeUnlockedOccupations(values: unknown[]): OccupationId[] {
  const valid = values.filter((value): value is OccupationId => typeof value === "string" && value in occupationInfo);
  return Array.from(new Set<OccupationId>(["unemployed", ...valid]));
}


function getStockHoldingPerformance(stock: StockRow) {
  const owned = Math.max(0, Math.floor(Number(stock.owned) || 0));
  const averageBuyPrice = Math.max(0, Math.round(Number(stock.averageBuyPrice) || 0));

  if (owned <= 0 || averageBuyPrice <= 0) {
    return {
      averageBuyPrice,
      profit: 0,
      profitRate: 0,
      totalBuyValue: 0,
      currentValue: stock.price * owned,
    };
  }

  const totalBuyValue = averageBuyPrice * owned;
  const currentValue = stock.price * owned;
  const profit = currentValue - totalBuyValue;
  const profitRate = totalBuyValue > 0 ? (profit / totalBuyValue) * 100 : 0;

  return {
    averageBuyPrice,
    profit,
    profitRate,
    totalBuyValue,
    currentValue,
  };
}

function StockMiniChart({ stockId, history }: { stockId: StockId; history: number[] }) {
  const points = history.length > 0 ? history : [1000];
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(1, max - min);
  const width = 720;
  const height = 210;
  const padX = 42;
  const padY = 26;
  const innerWidth = width - padX * 2;
  const innerHeight = height - padY * 2;
  const step = points.length > 1 ? innerWidth / (points.length - 1) : innerWidth;
  const clipId = `stock-chart-clip-${stockId}`;
  const bgId = `stock-chart-bg-${stockId}`;
  const linePath = points.map((price, index) => {
    const x = padX + index * step;
    const y = padY + innerHeight - ((price - min) / range) * innerHeight;
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <div style={stockChartFrameStyle}>
      <svg viewBox={`0 0 ${width} ${height}`} style={stockChartStyle} role="img" aria-label="주식 가격 변동 그래프" preserveAspectRatio="none">
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y="0" width={width} height={height} rx="22" />
          </clipPath>
          <linearGradient id={bgId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#fbfdff" />
            <stop offset="100%" stopColor="#eaf2ff" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width={width} height={height} rx="22" fill={`url(#${bgId})`} />
        <g clipPath={`url(#${clipId})`}>
          {[0.25, 0.5, 0.75].map((ratio) => (
            <line key={ratio} x1={padX} y1={padY + innerHeight * ratio} x2={width - padX} y2={padY + innerHeight * ratio} stroke="#d7deea" strokeWidth="2" />
          ))}
          {points.map((price, index) => {
            const x = padX + index * step;
            const prev = points[Math.max(0, index - 1)];
            const y = padY + innerHeight - ((price - min) / range) * innerHeight;
            const up = price >= prev;
            const candleTop = Math.max(padY + 2, y - 18);
            const candleBottom = Math.min(height - padY - 2, y + 18);
            return (
              <g key={`${stockId}-${index}-${price}`}>
                <line x1={x} x2={x} y1={candleTop} y2={candleBottom} stroke={up ? "#ef4444" : "#2563eb"} strokeWidth="4" strokeLinecap="round" />
                <rect x={x - 7} y={up ? y - 10 : y} width="14" height="20" fill={up ? "#ef4444" : "#3b82f6"} rx="3" />
              </g>
            );
          })}
          <path d={linePath} fill="none" stroke="#101827" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
    </div>
  );
}
function FinanceMiniChart({ history }: { history: FinanceHistoryPoint[] }) {
  const points = history.length > 0 ? history.slice(-12) : [{ label: "현재", income: 0, expense: 0, netWorth: 0 }];
  const maxValue = Math.max(1, ...points.map((point) => Math.max(point.income, point.expense)));

  return (
    <div style={financeChartStyle}>
      {points.map((point, index) => {
        const incomeHeight = Math.max(5, Math.round((point.income / maxValue) * 100));
        const expenseHeight = Math.max(5, Math.round((point.expense / maxValue) * 100));

        return (
          <div key={`${point.label}-${index}`} style={financeChartColumnStyle}>
            <div style={financeChartBarsStyle}>
              <div title={`수익 ${point.income.toLocaleString()}원`} style={{ ...financeIncomeBarStyle, height: `${incomeHeight}%` }} />
              <div title={`지출 ${point.expense.toLocaleString()}원`} style={{ ...financeExpenseBarStyle, height: `${expenseHeight}%` }} />
            </div>
            <small style={financeChartLabelStyle}>{point.label}</small>
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
  return (
    <div className="alba-status-pill" style={{ ...statusPillStyle, borderColor: warning ? "#f97316" : "#111827", color: warning ? "#9a3412" : "#111827" }}>
      <span style={{ ...statusLabelStyle, color: warning ? "#c2410c" : "#64748b" }}>{label}</span>
      <strong style={{ color: warning ? "#9a3412" : "#111827", fontSize: "17px", lineHeight: 1.1 }}>{value}</strong>
    </div>
  );
}


function getCashierKeyVisualStyle(index: number, currentIndex: number): CSSProperties {
  if (index < currentIndex) {
    return {
      ...keyBoxStyle,
      background: "linear-gradient(180deg, #bbf7d0, #22c55e)",
      color: "#052e16",
      border: "3px solid #15803d",
      boxShadow: "0 6px 0 #14532d",
      opacity: 0.95,
    };
  }

  if (index === currentIndex) {
    return {
      ...keyBoxStyle,
      background: "linear-gradient(180deg, #fde68a, #f59e0b)",
      color: "#111827",
      border: "4px solid #111827",
      boxShadow: "0 0 0 5px rgba(245,158,11,0.28), 0 8px 0 #92400e",
      transform: "translateY(-4px) scale(1.08)",
    };
  }

  return {
    ...keyBoxStyle,
    background: "#ffffff",
    color: "#111827",
    border: "3px solid #94a3b8",
    boxShadow: "0 5px 0 #64748b",
  };
}

function getTaxRate(cash: number) {
  if (cash <= 100000) return 0.01;
  if (cash <= 1000000) return 0.05;
  if (cash <= 10000000) return 0.1;
  return 0.2;
}

function getStockRemainingMs(updatedAt: Date) {
  const nextUpdateAt = updatedAt.getTime() + STOCK_INTERVAL_MS;
  return Math.max(0, nextUpdateAt - Date.now());
}

function getShopRemainingMs(updatedAt: Date) {
  const nextUpdateAt = updatedAt.getTime() + 10 * 60 * 1000;
  return Math.max(0, nextUpdateAt - Date.now());
}

function getCashierDifficultyBySuccess(success: number) {
  return Math.min(9, 1 + Math.floor(success / 5));
}

function makeCashierSequence(difficulty: number) {
  return Array.from({ length: Math.min(22, 8 + difficulty * 2) }, () => cashierKeyPool[Math.floor(Math.random() * cashierKeyPool.length)]);
}

function getActiveSortKinds(difficulty: number) {
  if (difficulty >= 5) return allSortKinds;
  if (difficulty >= 3) return allSortKinds.slice(0, 4);
  return allSortKinds.slice(0, 3);
}

function makeSortItem(difficulty: number, id: number): SortItem {
  const kinds = getActiveSortKinds(difficulty);
  return { id, kind: kinds[Math.floor(Math.random() * kinds.length)], x: -8 };
}

function markSortFeedback(item: SortItem, feedback: "good" | "bad"): SortItem {
  return { ...item, feedback };
}

function makeCafeTarget(difficulty: number) {
  const width = Math.max(5, 13 - difficulty * 0.9);
  const start = Math.floor(Math.random() * 25) + 50;
  return { start, end: start + width };
}

function makeSecuritySignal(difficulty: number): SecuritySignal {
  const random = Math.random();
  if (random < 0.3 + difficulty * 0.018) return "thief";
  if (random < 0.56) return "vip";
  return "normal";
}

function getSortingSpeed(difficulty: number) {
  return 0.62 + difficulty * 0.16;
}

function getDeliverySpeed(difficulty: number) {
  return 0.9 + difficulty * 0.22;
}

function getDeliverySpawnCooldown(difficulty: number) {
  return Math.max(18, 34 - difficulty * 2);
}

function makeDeliveryObstacleLanes(difficulty: number, safeLane: number) {
  const lanes = [0, 1, 2].filter((lane) => lane !== safeLane);
  const shouldBlockTwoLanes = difficulty >= 4 && Math.random() < 0.35 + difficulty * 0.04;

  if (shouldBlockTwoLanes) {
    return lanes;
  }

  return [lanes[Math.floor(Math.random() * lanes.length)]];
}

function makeRankingRows(nickname: string, cash: number, job: string): RankingRow[] {
  return [
    {
      rank: 1,
      nickname,
      nicknameColorId: defaultNicknameColorTheme.id,
      cash,
      job,
      hasSave: true,
      isMe: true,
    },
  ];
}

function parseGlobalStockMarketResult(data: GlobalStockMarketResult | null) {
  if (!data) return null;

  const marketRow = Array.isArray(data) ? data[0] : data;
  if (!marketRow) return null;

  const rawRows = typeof marketRow.rows === "string" ? safeJsonParse<StockRow[]>(marketRow.rows, []) : marketRow.rows;
  const rawNews = typeof marketRow.news_events === "string" ? safeJsonParse<NewsEvent[]>(marketRow.news_events, []) : marketRow.news_events;
  const rows = normalizeGlobalStockRows(Array.isArray(rawRows) ? rawRows : []);
  const newsEvents = normalizeNewsEvents(Array.isArray(rawNews) ? rawNews : []);
  const updatedAt = marketRow.updated_at ? new Date(marketRow.updated_at) : new Date();
  const newsUpdatedAt = marketRow.news_updated_at ? new Date(marketRow.news_updated_at) : new Date();

  return {
    rows,
    newsEvents: newsEvents.length > 0 ? newsEvents : makeNewsEvents(),
    updatedAt: Number.isNaN(updatedAt.getTime()) ? new Date() : updatedAt,
    newsUpdatedAt: Number.isNaN(newsUpdatedAt.getTime()) ? new Date() : newsUpdatedAt,
  };
}

function safeJsonParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function normalizeNewsEvents(events: NewsEvent[]): NewsEvent[] {
  const validIds = new Set(newsPool.map((event) => event.id));
  const normalized = events
    .filter((event) => event && validIds.has(Number(event.id)))
    .map((event) => newsPool.find((item) => item.id === Number(event.id)) ?? event)
    .slice(0, 3);

  return normalized.length > 0 ? normalized : makeNewsEvents();
}

function extractOwnedStockRows(rows: StockRow[]): StockRow[] {
  return rows.map((row) => ({
    ...row,
    price: 0,
    previousPrice: 0,
    history: [],
    owned: Math.max(0, Math.floor(Number(row.owned) || 0)),
    averageBuyPrice: Math.max(0, Math.round(Number(row.averageBuyPrice) || 0)),
  }));
}

function normalizeGlobalStockRows(rows: StockRow[]): StockRow[] {
  return normalizeStockRows(rows, "global-market").map((row) => ({ ...row, owned: 0 }));
}

function mergeGlobalPricesWithOwned(globalRows: StockRow[], ownedRows: StockRow[]): StockRow[] {
  const ownedMap = new Map(
    ownedRows.map((row) => [
      row.id,
      {
        owned: Math.max(0, Math.floor(Number(row.owned) || 0)),
        averageBuyPrice: Math.max(0, Math.round(Number(row.averageBuyPrice) || 0)),
      },
    ])
  );

  return normalizeGlobalStockRows(globalRows).map((row) => {
    const saved = ownedMap.get(row.id);
    return {
      ...row,
      owned: saved?.owned ?? 0,
      averageBuyPrice: saved?.averageBuyPrice ?? 0,
    };
  });
}

function normalizeStockRows(rows: StockRow[], seedKey = "default"): StockRow[] {
  return stockCompanies.map((company) => {
    const saved = rows.find((row) => row.id === company.id);
    if (!saved) {
      const [fresh] = makeInitialStocks(seedKey).filter((row) => row.id === company.id);
      return fresh;
    }

    const price = Number(saved.price) || 1000;
    const previousPrice = Number(saved.previousPrice) || price;
    const owned = Math.max(0, Math.floor(Number(saved.owned) || 0));
    const averageBuyPrice = Math.max(0, Math.round(Number(saved.averageBuyPrice) || 0));
    const history = Array.isArray(saved.history) && saved.history.length > 0
      ? saved.history.map((value) => Math.max(100, Math.round(Number(value) || price))).slice(-24)
      : [previousPrice, price];

    return {
      ...company,
      price,
      previousPrice,
      owned,
      averageBuyPrice,
      history,
    };
  });
}

function formatStockCountdown(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.ceil(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function makeInitialStocks(seedKey = "default"): StockRow[] {
  return stockCompanies.map((company) => {
    let seed = hashSeed(`${seedKey}-${company.id}`);
    const nextRandom = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    const price = Math.floor(1000 + nextRandom() * 49001);
    const history = Array.from({ length: 18 }, (_, index) => {
      const wave = Math.sin(index / 2.2) * price * 0.035;
      const noise = Math.round((nextRandom() - 0.5) * price * 0.05);
      return Math.max(100, Math.round(price + wave + noise));
    });

    return {
      ...company,
      price,
      previousPrice: history[history.length - 2] ?? price,
      owned: 0,
      history: [...history.slice(-17), price],
    };
  });
}

function hashSeed(text: string) {
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}


function makeShopOffers(level: number) {
  return Array.from({ length: 3 }, () => rollShopOffer(level));
}

function rollShopOffer(level: number) {
  const roll = Math.random();
  let rarity: ItemRarity = "일반";
  if (level >= 5 && roll > 0.985) rarity = "유물";
  else if (level >= 4 && roll > 0.92) rarity = "보물";
  else if (level >= 3 && roll > 0.78) rarity = "진귀";
  else if (level >= 2 && roll > 0.52) rarity = "희소";
  const candidates = shopItems.filter((item) => item.rarity === rarity);
  return candidates[Math.floor(Math.random() * candidates.length)] ?? shopItems[0];
}

function rollGachaItem(level: number) {
  const roll = Math.random();
  const boost = Math.min(0.012, level * 0.002);
  if (roll > 0.99999999) return randomItemByRarity("고대 유물");
  if (roll > 0.997 - boost) return randomItemByRarity("유물");
  if (roll > 0.982 - boost) return randomItemByRarity("보물");
  if (roll > 0.94 - boost) return randomItemByRarity("진귀");
  if (roll > 0.82 - boost) return randomItemByRarity("희소");
  if (roll > 0.62) return randomItemByRarity("일반");
  return null;
}

function randomItemByRarity(rarity: ItemRarity) {
  const candidates = shopItems.filter((item) => item.rarity === rarity);
  return candidates[Math.floor(Math.random() * candidates.length)] ?? null;
}

function getCollectionItemsByRarity() {
  const order: ItemRarity[] = ["일반", "희소", "진귀", "보물", "유물", "고대 유물"];
  return order.map((rarity) => ({
    rarity,
    items: shopItems
      .filter((item) => item.rarity === rarity)
      .sort((a, b) => a.price - b.price || a.name.localeCompare(b.name, "ko")),
  }));
}

function getRarityColor(rarity: ItemRarity) {
  if (rarity === "고대 유물") return "#f0abfc";
  if (rarity === "유물") return "#7c3aed";
  if (rarity === "보물") return "#d97706";
  if (rarity === "진귀") return "#dc2626";
  if (rarity === "희소") return "#2563eb";
  return "#16a34a";
}

function getRarityPerformanceText(rarity: ItemRarity) {
  if (rarity === "고대 유물") return "초월급 성능 · 가챠 전용 극초희귀 효과";
  if (rarity === "유물") return "최상급 성능 · 게임 후반 핵심 효과";
  if (rarity === "보물") return "상급 성능 · 체감 큰 보너스";
  if (rarity === "진귀") return "중상급 성능 · 특정 수익 강화";
  if (rarity === "희소") return "중급 성능 · 초중반 유용";
  return "기본 성능 · 초반 보조";
}

function getBonusTypeLabel(bonusType: ShopItem["bonusType"]) {
  if (bonusType === "allIncome") return "전체 수익";
  if (bonusType === "businessIncome") return "사업 수익";
  if (bonusType === "jobIncome") return "직업 수익";
  if (bonusType === "casinoLuck") return "카지노 운";
  if (bonusType === "estateIncome") return "부동산 수익";
  if (bonusType === "bankInterest") return "은행 이자";
  if (bonusType === "lottoLuck") return "로또 행운";
  if (bonusType === "gachaLuck") return "가챠 행운";
  if (bonusType === "taxShield") return "보험료 절감";
  return "인건비 절감";
}

function getItemEffectText(item: ShopItem) {
  const percent = Math.round(item.bonusValue * 100);
  if (item.bonusType === "employeeEfficiency") return `직원 인건비 -${percent}%`;
  if (item.bonusType === "taxShield") return `보험료 -${percent}%`;
  return `${getBonusTypeLabel(item.bonusType)} +${percent}%`;
}


type GroupedShopItem = { id: ShopItemId; item: ShopItem; count: number };

function groupOwnedShopItems(items: ShopItemId[]): GroupedShopItem[] {
  const countMap = new Map<ShopItemId, number>();
  items.forEach((id) => countMap.set(id, (countMap.get(id) ?? 0) + 1));
  return Array.from(countMap.entries())
    .map(([id, count]) => {
      const item = shopItems.find((entry) => entry.id === id);
      return item ? { id, item, count } : null;
    })
    .filter((group): group is GroupedShopItem => Boolean(group));
}

function getRarityRank(rarity: ShopItem["rarity"]) {
  if (rarity === "고대 유물") return 6;
  if (rarity === "유물") return 5;
  if (rarity === "보물") return 4;
  if (rarity === "진귀") return 3;
  if (rarity === "희소") return 2;
  return 1;
}

function sortGroupedShopItems(groups: GroupedShopItem[], mode: ItemSortMode, favorites: ShopItemId[]) {
  return [...groups].sort((a, b) => {
    const favoriteDiff = Number(favorites.includes(b.id)) - Number(favorites.includes(a.id));
    if (mode === "favorite" && favoriteDiff !== 0) return favoriteDiff;
    if (mode === "rarity") return getRarityRank(b.item.rarity) - getRarityRank(a.item.rarity) || b.item.price - a.item.price;
    if (mode === "priceDesc") return b.item.price - a.item.price;
    if (mode === "priceAsc") return a.item.price - b.item.price;
    if (mode === "count") return b.count - a.count || b.item.price - a.item.price;
    if (mode === "name") return a.item.name.localeCompare(b.item.name, "ko");
    return favoriteDiff || getRarityRank(b.item.rarity) - getRarityRank(a.item.rarity) || b.item.price - a.item.price;
  });
}

function removeMany(items: string[], target: string, quantity: number) {
  const copy = [...items];
  let remaining = Math.max(0, Math.floor(quantity));
  while (remaining > 0) {
    const index = copy.indexOf(target);
    if (index < 0) break;
    copy.splice(index, 1);
    remaining -= 1;
  }
  return copy;
}


function getRankingBuffRate(rank?: number) {
  if (rank === 1) return 0.05;
  if (rank === 2) return 0.03;
  if (rank === 3) return 0.015;
  return 0;
}


function getShopOfferPrice(item: ShopItem) {
  return Math.ceil(item.price * 2);
}

function getGachaMachineCost(pullCount: number) {
  return 50000 * Math.pow(2, Math.floor(Math.max(0, pullCount) / 10));
}

function getInsuranceEffectText(insurance: InsuranceItem) {
  const parts = [
    insurance.jobBonus ? `알바/직업 수익 +${Math.round(insurance.jobBonus * 1000) / 10}%` : "",
    insurance.taxDiscount ? `세금 -${Math.round(insurance.taxDiscount * 1000) / 10}%` : "",
    insurance.seizureProtection ? `압류 피해 -${Math.round(insurance.seizureProtection * 1000) / 10}%` : "",
    insurance.businessBonus ? `사업 수익 +${Math.round(insurance.businessBonus * 1000) / 10}%` : "",
    insurance.estateBonus ? `부동산 수익 +${Math.round(insurance.estateBonus * 1000) / 10}%` : "",
    insurance.casinoCashback ? `슬롯 손실 환급 ${Math.round(insurance.casinoCashback * 1000) / 10}%` : "",
  ].filter(Boolean);
  return parts.join(" · ");
}

function getUnlockedTitles(params: { cash: number; stockRows: StockRow[]; bankDeposit: number; bankSavings?: number; bankLoan?: number; creditScore?: number; ownedEstates: EstateId[]; ownedBusinesses: BusinessId[]; ownedInsurances?: InsuranceId[]; businessEmployees?: Partial<Record<BusinessId, number>>; unpaidTax: number; netWorth: number; sortingSuccessTotal: number; deliverySuccessTotal: number; cashierSuccessTotal: number; cafeSuccessTotal: number; securitySuccessTotal: number; ownedCertifications?: CertificationId[]; ownedItems?: ShopItemId[]; discoveredItems?: ShopItemId[]; shopPurchaseCount?: number; gachaMachinePullCount?: number; lottoPurchaseCount?: number; }) {
  const totalJobSuccess = params.sortingSuccessTotal + params.deliverySuccessTotal + params.cashierSuccessTotal + params.cafeSuccessTotal + params.securitySuccessTotal;
  const stockValue = params.stockRows.reduce((sum, stock) => sum + stock.price * stock.owned, 0);
  const stockKindsOwned = params.stockRows.filter((stock) => stock.owned > 0).length;
  const employeeLevelTotal = Object.values(params.businessEmployees ?? {}).reduce((sum, level) => sum + Number(level ?? 0), 0);
  const ownsBuilding = params.ownedEstates.includes("building");
  const ownedItems = params.ownedItems ?? [];
  const discoveredItems = params.discoveredItems ?? [];
  const treasureOrRelicCount = ownedItems.filter((id) => {
    const item = shopItems.find((entry) => entry.id === id);
    return item?.rarity === "보물" || item?.rarity === "유물" || item?.rarity === "고대 유물";
  }).length;
  const hasRelic = ownedItems.some((id) => {
    const item = shopItems.find((entry) => entry.id === id);
    return item?.rarity === "유물" || item?.rarity === "고대 유물";
  });
  const hasAncientRelic = ownedItems.some((id) => shopItems.find((entry) => entry.id === id)?.rarity === "고대 유물");

  return playerTitles.filter((title) => {
    if (title.id === "newbie") return true;
    if (title.id === "firstPay") return params.cash >= 50000;
    if (title.id === "worker") return totalJobSuccess >= 30;
    if (title.id === "proWorker") return totalJobSuccess >= 100;
    if (title.id === "deliveryAce") return params.deliverySuccessTotal >= 50;
    if (title.id === "cashierMaster") return params.cashierSuccessTotal >= 50;
    if (title.id === "cafeMaster") return params.cafeSuccessTotal >= 50;
    if (title.id === "securityGuard") return params.securitySuccessTotal >= 40;
    if (title.id === "saver") return params.bankDeposit >= 100000;
    if (title.id === "bankVip") return params.bankDeposit >= 1000000;
    if (title.id === "loanManager") return Number(params.bankLoan ?? 0) > 0 && Number(params.creditScore ?? 0) >= 750;
    if (title.id === "investor") return stockValue >= 100000;
    if (title.id === "marketMaster") return stockKindsOwned >= 3;
    if (title.id === "portfolioKing") return stockKindsOwned >= 8;
    if (title.id === "stockWhale") return stockValue >= 2000000;
    if (title.id === "realEstate") return params.ownedEstates.length >= 1;
    if (title.id === "landlord") return params.ownedEstates.length >= 3;
    if (title.id === "buildingOwner") return ownsBuilding;
    if (title.id === "businessOwner") return params.ownedBusinesses.length >= 1;
    if (title.id === "chainOwner") return params.ownedBusinesses.length >= 3;
    if (title.id === "ceo") return params.ownedBusinesses.length >= 4;
    if (title.id === "employeeBoss") return employeeLevelTotal >= 3;
    if (title.id === "casinoRookie") return true;
    if (title.id === "riskTaker") return params.cash >= 300000;
    if (title.id === "taxPayer") return params.unpaidTax <= 0;
    if (title.id === "insurancePlanner") return (params.ownedInsurances ?? []).length >= 2;
    if (title.id === "auctionHunter") return params.netWorth >= 500000;
    if (title.id === "certifiedExpert") return (params.ownedCertifications ?? []).length >= 3;
    if (title.id === "treasureCollector") return treasureOrRelicCount >= 2;
    if (title.id === "relicOwner") return hasRelic;
    if (title.id === "marketTrader") return ownedItems.length >= 5;
    if (title.id === "millionaire") return params.netWorth >= 1000000;
    if (title.id === "multiMillionaire") return params.netWorth >= 10000000;
    if (title.id === "tycoon") return params.netWorth >= 50000000;
    if (title.id === "lottoDreamer") return Number(params.lottoPurchaseCount ?? 0) >= 3;
    if (title.id === "phoneAnalyst") return params.netWorth >= 100000;
    if (title.id === "savingsPlanner") return Number(params.bankSavings ?? 0) >= 500000;
    if (title.id === "estateCollector") return params.ownedEstates.length >= 5;
    if (title.id === "shopRegular") return Number(params.shopPurchaseCount ?? 0) >= 10;
    if (title.id === "gachaAddict") return Number(params.gachaMachinePullCount ?? 0) >= 10;
    if (title.id === "rankChaser") return params.netWorth >= 3000000;
    if (title.id === "topRanker") return params.netWorth >= 5000000;
    if (title.id === "taxFreeMind") return params.unpaidTax <= 0 && params.netWorth >= 2000000;
    if (title.id === "collectionMaster") return discoveredItems.length >= 25;
    if (title.id === "hiddenZero") return params.netWorth >= 7777777 && params.unpaidTax <= 0;
    if (title.id === "hiddenWhale") return params.netWorth >= 30000000 && stockValue >= 5000000;
    if (title.id === "hiddenLucky") return Number(params.gachaMachinePullCount ?? 0) >= 77 || Number(params.lottoPurchaseCount ?? 0) >= 30;
    if (title.id === "hiddenEstateLord") return params.ownedEstates.length >= estateItems.length && params.netWorth >= 20000000;
    if (title.id === "hiddenLaborKing") return totalJobSuccess >= 300;
    if (title.id === "hiddenMarketGhost") return discoveredItems.length >= 80;
    if (title.id === "hiddenRelicDealer") return treasureOrRelicCount >= 10 || hasAncientRelic;
    if (title.id === "hiddenDebtFree") return Number(params.bankLoan ?? 0) <= 0 && params.netWorth >= 10000000;
    if (title.id === "hiddenCasinoDemon") return Number(params.gachaMachinePullCount ?? 0) >= 100 && params.cash >= 1000000;
    if (title.id === "hiddenEconomyGod") return params.netWorth >= 100000000 || hasAncientRelic;
    return false;
  });
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${minutes}:${String(restSeconds).padStart(2, "0")}`;
}

function getDifficultyMessage(jobId: JobId, level: number) {
  if (jobId === "sorting") return `⚡ 난이도 상승! 택배 속도와 색상 종류가 늘어납니다. Lv.${level}`;
  if (jobId === "delivery") return `⚡ 난이도 상승! 속도가 빨라지고 장애물이 더 자주 나옵니다. Lv.${level}`;
  if (jobId === "cashier") return `⚡ 난이도 상승! 계산 키가 더 길어집니다. Lv.${level}`;
  if (jobId === "cafe") return `⚡ 난이도 상승! 목표 구간이 더 좁아집니다. Lv.${level}`;
  return `⚡ 난이도 상승! 손님 판단 시간이 짧아지고 VIP 비율이 늘어납니다. Lv.${level}`;
}

function getControlHint(activeJobId: JobId | null) {
  if (activeJobId === "sorting") return "중앙 구역에서 r/b/y/g/p 입력";
  if (activeJobId === "delivery") return "A/D 또는 ←/→ 이동 · 🍱 통과";
  if (activeJobId === "cashier") return "W/A/S/D 순서 입력";
  if (activeJobId === "cafe") return "Space 누르고 있다가 떼기";
  if (activeJobId === "security") return "수상한 사람일 때만 Space";
  return "알바를 선택하세요";
}


const worldLayoutStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  padding: "8px 10px",
  display: "grid",
  gridTemplateRows: "112px minmax(0, 1fr) 54px",
  gap: "8px",
  overflow: "hidden",
};

const worldHeaderStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "start",
  gap: "12px",
  minWidth: 0,
};

const profileAreaStyle: CSSProperties = {
  minWidth: 0,
  overflow: "visible",
  position: "relative",
  zIndex: 20,
};

const nicknameEditStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginTop: "8px",
  position: "relative",
  zIndex: 30,
};

const nicknameInputStyle: CSSProperties = {
  width: "150px",
  border: "3px solid #111827",
  borderRadius: "12px",
  background: "#ffffff",
  color: "#111827",
  padding: "8px 10px",
  fontWeight: 900,
  outline: "none",
  boxShadow: "2px 2px 0 #111827",
};

const smallActionButtonStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "12px",
  background: "#ffffff",
  color: "#111827",
  padding: "8px 12px",
  fontWeight: 900,
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: "2px 2px 0 #111827",
};

const worldBodyStyle: CSSProperties = {
  minHeight: 0,
  overflow: "auto",
};

const worldFooterStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "8px",
  alignItems: "stretch",
  minWidth: 0,
};

const hiddenLegacySceneStyle: CSSProperties = {
  display: "none",
};

const sceneSvgStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  display: "block",
  zIndex: 1,
};

const roomSceneStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  background: "#f8fafc",
  color: "#111827",
  borderRadius: "22px",
  border: "4px solid #111827",
  boxShadow: "0 18px 0 rgba(17,24,39,0.10), 0 24px 46px rgba(15,23,42,0.18)",
};

const roomMoneyStyle: CSSProperties = {
  position: "absolute",
  top: "8px",
  left: "12px",
  color: "#ef4444",
  fontWeight: 900,
  fontSize: "22px",
  zIndex: 5,
  background: "rgba(255,255,255,0.88)",
  borderRadius: "999px",
  padding: "6px 12px",
};

const roomInfoTextStyle: CSSProperties = {
  position: "absolute",
  top: "92px",
  left: "18px",
  width: "238px",
  maxWidth: "calc(100% - 24px)",
  fontSize: "14px",
  fontWeight: 900,
  lineHeight: 1.25,
  zIndex: 8,
  background: "rgba(255,255,255,0.94)",
  border: "3px solid #111827",
  borderRadius: "14px",
  padding: "10px 12px",
  boxShadow: "4px 4px 0 rgba(17,24,39,0.18)",
  display: "grid",
  gap: "5px",
  overflow: "visible",
};

const roomInfoNameStyle: CSSProperties = {
  display: "block",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const roomInfoLineStyle: CSSProperties = {
  display: "block",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const roomFloorStyle: CSSProperties = {
  position: "absolute",
  top: "42px",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "24px",
  fontWeight: 900,
};

const roomWindowStyle: CSSProperties = {
  position: "absolute",
  top: "70px",
  left: "43%",
  width: "25%",
  height: "21%",
  border: "5px solid #111827",
  boxShadow: "inset 0 0 0 4px #ffffff, 4px 4px 0 rgba(17,24,39,0.18)",
  background: "linear-gradient(180deg, #dbeafe 0%, #f8fafc 100%)",
};

const roomSofaStyle: CSSProperties = {
  position: "absolute",
  left: "5%",
  bottom: "20%",
  width: "24%",
  height: "30%",
  border: "5px solid #111827",
  borderRadius: "20px 20px 8px 8px",
  background: "linear-gradient(180deg, #ffffff 0 55%, #e2e8f0 55% 100%)",
  boxShadow: "8px 8px 0 rgba(17,24,39,0.14)",
};

const roomDeskStyle: CSSProperties = {
  position: "absolute",
  right: "14%",
  bottom: "23%",
  width: "46%",
  height: "14%",
  border: "5px solid #111827",
  borderTopWidth: "8px",
  borderRadius: "4px",
  background: "linear-gradient(90deg, #f8fafc 0 24%, #ffffff 24% 28%, #f8fafc 28% 52%, #ffffff 52% 56%, #f8fafc 56% 100%)",
  boxShadow: "6px 6px 0 rgba(17,24,39,0.16)",
};

const roomTvStyle: CSSProperties = {
  position: "absolute",
  right: "8%",
  bottom: "39%",
  width: "11%",
  height: "18%",
  border: "5px solid #111827",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  background: "radial-gradient(circle at 70% 30%, #ffffff 0 8%, #e5e7eb 9% 100%)",
  boxShadow: "5px 5px 0 rgba(17,24,39,0.16)",
};

const roomCharacterStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: "25%",
  transform: "translateX(-50%)",
  width: "82px",
  height: "82px",
  border: "5px solid #111827",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 900,
  fontSize: "14px",
  background: "#ffffff",
  boxShadow: "0 16px 0 -10px rgba(17,24,39,0.25)",
};

const roomSideControlsStyle: CSSProperties = {
  position: "absolute",
  right: "12px",
  top: "10px",
  display: "flex",
  gap: "8px",
  zIndex: 5,
};

const trophyButtonStyle: CSSProperties = {
  width: "66px",
  height: "66px",
  borderRadius: "50%",
  border: "4px solid #111827",
  background: "linear-gradient(180deg, #fef3c7, #facc15)",
  color: "#111827",
  fontSize: "34px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "4px 4px 0 #111827",
};

const roomNavStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: "12px",
  transform: "translateX(-50%)",
  display: "grid",
  gridAutoFlow: "column",
  gridAutoColumns: "minmax(150px, 190px)",
  gap: "10px",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 5,
};

const bottomNavButtonStyle: CSSProperties = {
  border: "4px solid #111827",
  borderRadius: "6px",
  background: "#ffffff",
  color: "#111827",
  padding: "14px 18px",
  minWidth: "170px",
  textAlign: "center",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "3px 3px 0 #111827",
  fontSize: "16px",
  whiteSpace: "nowrap",
};

const streetSceneStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  background:
    "linear-gradient(180deg, #dbeafe 0 48%, #cbd5e1 48% 55%, #1f2937 55% 100%)",
  color: "#111827",
  borderRadius: "26px",
  border: "4px solid #111827",
  boxShadow: "0 18px 0 rgba(17,24,39,0.10), 0 24px 46px rgba(15,23,42,0.18)",
};

const streetMoneyStyle: CSSProperties = {
  position: "absolute",
  top: "8px",
  left: "12px",
  color: "#ef4444",
  fontWeight: 900,
  fontSize: "22px",
  zIndex: 5,
  background: "rgba(255,255,255,0.88)",
  borderRadius: "999px",
  padding: "6px 12px",
};










const streetBottomNavStyle: CSSProperties = {
  position: "absolute",
  zIndex: 10,
  left: "50%",
  transform: "translateX(-50%)",
  bottom: "18px",
  display: "flex",
  gap: "8px",
};

const panelSceneStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr) auto",
  gap: "12px",
  overflow: "auto",
  background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
  color: "#111827",
  border: "4px solid #111827",
  borderRadius: "26px",
  padding: "16px",
  boxShadow: "0 18px 0 rgba(17,24,39,0.10), 0 24px 46px rgba(15,23,42,0.18)",
};

const stockExchangeSceneStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  gap: "14px",
  overflow: "auto",
  background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
  color: "#111827",
  border: "4px solid #111827",
  borderRadius: "26px",
  padding: "16px",
  boxShadow: "0 18px 0 rgba(17,24,39,0.10), 0 24px 46px rgba(15,23,42,0.18)",
};

const panelHeaderRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "start",
  justifyContent: "space-between",
  gap: "12px",
};

const panelTitleStyle: CSSProperties = {
  margin: "2px 0 4px",
  fontSize: "28px",
};

const panelDescStyle: CSSProperties = {
  margin: 0,
  color: "#475569",
  fontSize: "14px",
};

const officeFooterStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "10px",
  alignItems: "stretch",
};

const roomSelectGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  minHeight: 0,
};

const roomSelectCardStyle: CSSProperties = {
  background: "#ffffff",
  color: "#111827",
  borderRadius: "18px",
  padding: "16px",
  cursor: "pointer",
  textAlign: "left",
  boxShadow: "5px 5px 0 rgba(17,24,39,0.16)",
};

const roomPreviewStyle: CSSProperties = {
  height: "120px",
  border: "4px solid #111827",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "34px",
  fontWeight: 900,
  marginBottom: "12px",
  background: "linear-gradient(180deg, #ffffff 0 66%, #f1f5f9 66% 100%)",
};






const economySummaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "10px",
};

const economyActionPanelStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "12px",
  alignItems: "end",
  background: "#ffffff",
  border: "4px solid #111827",
  borderRadius: "20px",
  padding: "16px",
  boxShadow: "0 8px 0 rgba(17,24,39,0.12)",
};

const economyButtonRowStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  alignItems: "center",
};

const economyCardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "12px",
  overflowY: "auto",
  minHeight: 0,
  paddingRight: "8px",
};

const economyCardStyle: CSSProperties = {
  display: "grid",
  gap: "9px",
  alignContent: "start",
  background: "#ffffff",
  border: "4px solid #111827",
  borderRadius: "20px",
  padding: "16px",
  boxShadow: "0 8px 0 rgba(17,24,39,0.12)",
  color: "#111827",
};

const economyCardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 900,
};

const economyCardTextStyle: CSSProperties = {
  margin: 0,
  color: "#475569",
  fontWeight: 800,
  lineHeight: 1.35,
};

const economyConditionStyle: CSSProperties = {
  color: "#92400e",
  fontWeight: 900,
  fontSize: "13px",
};

const economyNewsListStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
  overflowY: "auto",
  minHeight: 0,
  paddingRight: "8px",
};

const economyNewsCardStyle: CSSProperties = {
  background: "#ffffff",
  border: "4px solid #111827",
  borderRadius: "20px",
  padding: "16px",
  boxShadow: "0 8px 0 rgba(17,24,39,0.12)",
};

const rankingTableStyle: CSSProperties = {
  display: "grid",
  alignContent: "start",
  gap: "8px",
  overflowY: "auto",
  minHeight: 0,
  maxHeight: "100%",
  paddingRight: "8px",
  paddingBottom: "32px",
  scrollbarGutter: "stable",
  WebkitOverflowScrolling: "touch",
};

const rankingRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "80px minmax(0, 1fr) minmax(120px, auto) 160px",
  gap: "10px",
  alignItems: "center",
  border: "3px solid #111827",
  borderRadius: "14px",
  padding: "12px 14px",
  fontSize: "16px",
  background: "#ffffff",
  color: "#111827",
  boxShadow: "3px 3px 0 rgba(17,24,39,0.14)",
};

const taxCardStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "10px",
  alignContent: "start",
};

const taxNoticeStyle: CSSProperties = {
  marginTop: "12px",
  padding: "14px",
  borderRadius: "14px",
  background: "#fef3c7",
  border: "3px solid #111827",
  color: "#111827",
  fontWeight: 900,
  boxShadow: "3px 3px 0 rgba(17,24,39,0.14)",
};

const stockBoardStyle: CSSProperties = {
  minHeight: 0,
  height: "100%",
  overflowY: "auto",
  overflowX: "hidden",
  display: "grid",
  gridTemplateColumns: "1fr",
  alignContent: "start",
  gap: "16px",
  padding: "4px 12px 22px 4px",
};

const stockCardStyle: CSSProperties = {
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  color: "#111827",
  border: "4px solid #111827",
  borderRadius: "24px",
  padding: "18px",
  boxShadow: "7px 8px 0 rgba(17,24,39,0.14)",
  display: "grid",
  gridTemplateRows: "auto 240px auto",
  gap: "14px",
  minWidth: 0,
  minHeight: "470px",
  overflow: "visible",
};

const stockCardHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "start",
  gap: "10px",
  minWidth: 0,
};

const stockNameStyle: CSSProperties = {
  fontSize: "24px",
  fontWeight: 900,
};

const stockDescStyle: CSSProperties = {
  marginTop: "5px",
  color: "#4b5563",
  fontSize: "13px",
  fontWeight: 800,
  lineHeight: 1.35,
};

const stockChangeBadgeStyle: CSSProperties = {
  border: "2px solid",
  borderRadius: "999px",
  padding: "8px 14px",
  fontSize: "18px",
  fontWeight: 900,
  whiteSpace: "nowrap",
};

const stockChartFrameStyle: CSSProperties = {
  width: "100%",
  height: "240px",
  minHeight: "240px",
  border: "3px solid #cbd5e1",
  borderRadius: "22px",
  overflow: "hidden",
  background: "linear-gradient(180deg, #fbfdff, #eaf2ff)",
  boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.72)",
};

const stockChartStyle: CSSProperties = {
  display: "block",
  width: "100%",
  height: "100%",
};

const stockBottomRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(220px, 1.1fr) minmax(220px, 1fr) auto",
  alignItems: "center",
  gap: "12px",
  minWidth: 0,
};

const stockInfoStackStyle: CSSProperties = {
  minWidth: 0,
  display: "grid",
  gap: "3px",
};

const stockBuffInlineStyle: CSSProperties = {
  minWidth: 0,
  border: "2px solid #dbeafe",
  borderRadius: "14px",
  background: "#eff6ff",
  padding: "9px 12px",
  color: "#1e3a8a",
  fontSize: "12px",
  fontWeight: 900,
  lineHeight: 1.35,
  display: "grid",
  gap: "2px",
};

const stockPriceStyle: CSSProperties = {
  fontSize: "30px",
  fontWeight: 900,
};

const stockOwnedStyle: CSSProperties = {
  color: "#4b5563",
  fontSize: "13px",
  fontWeight: 900,
};

const stockActionGroupStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, max-content)",
  gap: "8px",
  justifyContent: "end",
};

const stockTradeButtonStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "13px",
  background: "#fef3c7",
  color: "#111827",
  padding: "10px 16px",
  fontSize: "16px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "3px 3px 0 #111827",
};

const loadingPageStyle: CSSProperties = {
  minHeight: "100svh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e1b4b 100%)",
  color: "white",
  fontFamily: "Arial, sans-serif",
};

const pageStyle: CSSProperties = {
  width: "100%",
  height: "100svh",
  maxWidth: "100%",
  maxHeight: "100svh",
  overflow: "hidden",
  position: "relative",
  isolation: "isolate",
  background: "linear-gradient(180deg, #f8fafc 0%, #eef2f7 46%, #e2e8f0 100%)",
  color: "#111827",
  fontFamily: "Arial, sans-serif",
};



const smallLabelStyle: CSSProperties = {
  color: "#2563eb",
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "0.12em",
};

const mainTitleStyle: CSSProperties = {
  margin: "1px 0",
  fontSize: "30px",
  lineHeight: 1,
  whiteSpace: "nowrap",
};


const moneyPanelStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, minmax(124px, 1fr))",
  gap: "8px",
  maxWidth: "820px",
  overflow: "visible",
};

const statusPillStyle: CSSProperties = {
  background: "#ffffff",
  border: "3px solid #111827",
  borderRadius: "16px",
  padding: "10px 12px",
  minWidth: "118px",
  display: "grid",
  gap: "3px",
  fontSize: "16px",
  color: "#111827",
  boxShadow: "3px 3px 0 rgba(17,24,39,0.95)",
};

const statusLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: "11px",
  fontWeight: 900,
};

const jobGridStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "10px",
  overflow: "auto",
};

const jobCardStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minWidth: 0,
  minHeight: 0,
  borderRadius: "18px",
  padding: "16px",
  background: "#ffffff",
  color: "#111827",
  textAlign: "left",
  cursor: "pointer",
  boxShadow: "5px 5px 0 rgba(17,24,39,0.16)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
};

const jobIconStyle: CSSProperties = {
  fontSize: "38px",
  marginBottom: "12px",
  flexShrink: 0,
};

const jobCardTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "21px",
  lineHeight: 1.15,
  wordBreak: "keep-all",
};

const jobCardTextStyle: CSSProperties = {
  margin: 0,
  color: "#475569",
  lineHeight: 1.35,
  fontSize: "14px",
  wordBreak: "keep-all",
};

const rewardTextStyle: CSSProperties = {
  marginTop: "14px",
  color: "#86efac",
  fontWeight: 900,
  fontSize: "14px",
  lineHeight: 1.25,
};


const messageBoxStyle: CSSProperties = {
  minHeight: "48px",
  display: "flex",
  alignItems: "center",
  background: "#ffffff",
  border: "3px solid #111827",
  borderRadius: "16px",
  padding: "10px 16px",
  color: "#111827",
  lineHeight: 1.3,
  fontSize: "22px",
  fontWeight: 900,
  overflow: "hidden",
  boxShadow: "3px 3px 0 #111827",
};

const bigStartButtonStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "16px",
  background: "#facc15",
  color: "#111827",
  padding: "12px 20px",
  fontWeight: 900,
  fontSize: "18px",
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: "3px 3px 0 #111827",
};

const logoutButtonStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "16px",
  background: "#ffffff",
  color: "#111827",
  padding: "12px 16px",
  fontWeight: 900,
  fontSize: "16px",
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: "3px 3px 0 #111827",
};

const jobOnlyLayoutStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  padding: "8px 12px",
  display: "grid",
  gridTemplateRows: "auto auto minmax(0, 1fr) auto",
  gap: "6px",
  overflow: "hidden",
};

const compactHeaderStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "center",
  gap: "8px",
  minWidth: 0,
  overflow: "hidden",
};

const jobTitleStyle: CSSProperties = {
  margin: "1px 0 0",
  fontSize: "clamp(22px, 2.4vw, 28px)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const topStatusGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  overflow: "visible",
};

const leaveButtonStyle: CSSProperties = {
  border: "3px solid #111827",
  background: "#facc15",
  color: "#111827",
  borderRadius: "16px",
  padding: "13px 18px",
  fontWeight: 900,
  fontSize: "17px",
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: "3px 3px 0 rgba(17,24,39,0.95)",
};

const difficultyBannerStyle: CSSProperties = {
  background: "#facc15",
  border: "4px solid #111827",
  color: "#111827",
  borderRadius: "18px",
  padding: "12px 18px",
  textAlign: "center",
  fontWeight: 900,
  fontSize: "24px",
  boxShadow: "4px 4px 0 rgba(17,24,39,0.95)",
  zIndex: 20,
};

const jobStageStyle: CSSProperties = {
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const jobFooterStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "10px",
  alignItems: "center",
  minWidth: 0,
  overflow: "visible",
};

const controlHintStyle: CSSProperties = {
  background: "#334155",
  border: "3px solid #111827",
  borderRadius: "14px",
  padding: "12px 16px",
  color: "#ffffff",
  fontWeight: 900,
  fontSize: "15px",
  whiteSpace: "nowrap",
  boxShadow: "3px 3px 0 rgba(17,24,39,0.95)",
};

const centerGameStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
};

const miniGameTopInfoStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  color: "#14532d",
  fontSize: "15px",
  fontWeight: 900,
};

const sortingStageStyle: CSSProperties = {
  width: "min(820px, 94vw)",
  height: "min(405px, 58svh)",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gap: "10px",
};

const conveyorStyle: CSSProperties = {
  position: "relative",
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "24px",
  overflow: "hidden",
};

const sortJudgeZoneStyle: CSSProperties = {
  position: "absolute",
  left: "39%",
  width: "22%",
  top: 0,
  bottom: 0,
  background: "rgba(34,197,94,0.15)",
  borderLeft: "3px solid rgba(34,197,94,0.8)",
  borderRight: "3px solid rgba(34,197,94,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#86efac",
  fontWeight: 900,
  fontSize: "18px",
};

const sortPackageStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  fontSize: "72px",
  transition: "left 22ms linear, transform 120ms ease, filter 120ms ease",
  zIndex: 3,
};

const sortBinsStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
};

const sortBinStyle: CSSProperties = {
  background: "rgba(255,255,255,0.10)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "14px",
  padding: "10px",
  textAlign: "center",
  fontWeight: 900,
  fontSize: "14px",
};

const runnerStageStyle: CSSProperties = {
  width: "min(660px, 92vw)",
  height: "min(480px, 64svh)",
  display: "grid",
  gridTemplateRows: "1fr auto",
  gap: "7px",
};

const runnerRoadStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "8px",
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "24px",
  padding: "10px",
  overflow: "hidden",
};

const runnerLaneStyle: CSSProperties = {
  position: "relative",
  background: "rgba(255,255,255,0.07)",
  borderRadius: "16px",
  border: "1px dashed rgba(255,255,255,0.18)",
  overflow: "hidden",
};

const runnerPlayerStyle: CSSProperties = {
  position: "absolute",
  bottom: "7%",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "58px",
  zIndex: 4,
};

const runnerObstacleStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "54px",
  transition: "top 24ms linear",
};

const runnerCoinStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "48px",
  transition: "top 24ms linear",
  filter: "drop-shadow(0 0 12px #facc15)",
};

const runnerProgressStyle: CSSProperties = {
  textAlign: "center",
  color: "#14532d",
  fontWeight: 900,
  fontSize: "14px",
};

const cashierPanelStyle: CSSProperties = {
  width: "min(820px, 92vw)",
  background: "#ffffff",
  border: "5px solid #111827",
  borderRadius: "24px",
  padding: "28px",
  textAlign: "center",
  boxShadow: "8px 8px 0 rgba(17,24,39,0.18)",
};

const cashierTitleStyle: CSSProperties = {
  color: "#93c5fd",
  fontWeight: 900,
  margin: "12px 0",
};

const sequenceRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "14px",
};

const keyBoxStyle: CSSProperties = {
  width: "58px",
  height: "58px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "25px",
  fontWeight: 900,
  transition: "transform 120ms ease, box-shadow 120ms ease, background 120ms ease",
};

const cashierHintStyle: CSSProperties = {
  marginTop: "18px",
  color: "#111827",
  fontSize: "18px",
  fontWeight: 900,
};

const cafeStageStyle: CSSProperties = {
  width: "min(580px, 90vw)",
  height: "min(430px, 60svh)",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  gap: "8px",
};

const cupAreaStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "22px",
  padding: "10px",
};

const cupStyle: CSSProperties = {
  position: "relative",
  width: "170px",
  height: "245px",
  border: "6px solid rgba(255,255,255,0.85)",
  borderTop: "none",
  overflow: "hidden",
  background: "rgba(255,255,255,0.08)",
};

const coffeeFillStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  background: "linear-gradient(180deg, #d97706, #92400e)",
  transition: "height 25ms linear",
};

const cafeTargetZoneStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  background: "rgba(34,197,94,0.35)",
  borderTop: "2px solid #22c55e",
  borderBottom: "2px solid #22c55e",
  zIndex: 3,
};

const cafeGaugeTextStyle: CSSProperties = {
  marginTop: "10px",
  color: "#cbd5e1",
  fontWeight: 900,
  fontSize: "13px",
};

const securityStageStyle: CSSProperties = {
  width: "min(660px, 92vw)",
  height: "min(430px, 58svh)",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  gap: "7px",
};

const securityPanelStyle: CSSProperties = {
  display: "grid",
  gridTemplateRows: "44px 1fr auto auto",
  alignItems: "center",
  justifyContent: "stretch",
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "22px",
  padding: "12px",
  gap: "10px",
  overflow: "hidden",
};

const securityQueueStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto 1fr auto 1fr auto",
  alignItems: "center",
  gap: "8px",
  color: "#cbd5e1",
  fontWeight: 900,
  fontSize: "13px",
};

const securityBadgeStyle: CSSProperties = {
  justifySelf: "center",
  minWidth: "min(420px, 86%)",
  textAlign: "center",
  border: "2px solid #86efac",
  background: "rgba(255,255,255,0.07)",
  borderRadius: "18px",
  padding: "10px 16px",
  fontWeight: 900,
  fontSize: "22px",
  animation: "securityPulse 900ms ease infinite",
};

const securityGateStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  borderRadius: "999px",
  padding: "7px 12px",
};

const securityLineStyle: CSSProperties = {
  height: "3px",
  borderRadius: "999px",
  background: "linear-gradient(90deg, rgba(56,189,248,0.1), rgba(56,189,248,0.75), rgba(56,189,248,0.1))",
};

const securityDeskStyle: CSSProperties = {
  border: "1px solid rgba(56,189,248,0.5)",
  background: "rgba(56,189,248,0.14)",
  color: "#bae6fd",
  borderRadius: "999px",
  padding: "7px 14px",
};

const securitySceneStyle: CSSProperties = {
  position: "relative",
  height: "100%",
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const securityCharacterWrapStyle: CSSProperties = {
  animation: "securityWalkIn 420ms ease both",
};

const securityCharacterStyle: CSSProperties = {
  fontSize: "80px",
  marginBottom: "8px",
};


const securityHintStyle: CSSProperties = {
  marginTop: "10px",
  color: "#cbd5e1",
  fontSize: "14px",
};




const streetBuildingsRowStyle: CSSProperties = {
  position: "absolute",
  zIndex: 7,
  left: 0,
  right: 0,
  top: 0,
  bottom: "72px",
  pointerEvents: "none",
};

const streetBuildingStyle: CSSProperties = {
  position: "absolute",
  border: "5px solid #111827",
  borderRadius: "28px 28px 16px 16px",
  padding: "8px 8px 10px",
  boxShadow: "0 12px 0 rgba(15,23,42,0.18), 0 20px 30px rgba(15,23,42,0.14)",
  display: "grid",
  gridTemplateRows: "minmax(0, 1fr) auto auto",
  gap: "7px",
  cursor: "pointer",
  textAlign: "center",
  color: "#0f172a",
  transition: "transform 120ms ease, filter 120ms ease",
  overflow: "hidden",
  pointerEvents: "auto",
};

const streetFacadeCanvasStyle: CSSProperties = {
  minHeight: 0,
  display: "flex",
  alignItems: "end",
  justifyContent: "center",
  overflow: "hidden",
  padding: "2px 0 0",
};

const streetFacadeSvgStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "block",
  filter: "drop-shadow(0 8px 0 rgba(15,23,42,0.10))",
};

const streetBuildingSignStyle: CSSProperties = {
  background: "rgba(255,255,255,0.96)",
  border: "4px solid #111827",
  borderRadius: "15px",
  padding: "7px 8px",
  fontSize: "15px",
  fontWeight: 900,
  lineHeight: 1.1,
  boxShadow: "3px 3px 0 rgba(17,24,39,0.14)",
  position: "relative",
  zIndex: 2,
};

const streetBuildingSubtitleStyle: CSSProperties = {
  fontSize: "11px",
  fontWeight: 900,
  color: "#334155",
  lineHeight: 1.2,
  minHeight: "28px",
};

const streetPageInfoStyle: CSSProperties = {
  position: "absolute",
  zIndex: 9,
  top: "14px",
  right: "18px",
  display: "grid",
  justifyItems: "end",
  gap: "2px",
  padding: "8px 12px",
  background: "rgba(255,255,255,0.88)",
  border: "3px solid #111827",
  borderRadius: "16px",
  boxShadow: "0 8px 0 rgba(17,24,39,0.10)",
  color: "#111827",
  fontWeight: 900,
};

const streetPageArrowStyle: CSSProperties = {
  position: "absolute",
  zIndex: 10,
  top: "50%",
  transform: "translateY(-50%)",
  width: "54px",
  height: "54px",
  borderRadius: "999px",
  border: "4px solid #111827",
  background: "rgba(255,255,255,0.94)",
  color: "#111827",
  fontSize: "24px",
  fontWeight: 900,
  boxShadow: "0 8px 0 rgba(17,24,39,0.12)",
  cursor: "pointer",
};

const insuranceBenefitStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "14px",
  background: "linear-gradient(180deg, #ecfeff, #e0f2fe)",
  padding: "10px",
  color: "#0f172a",
  fontWeight: 900,
  fontSize: "13px",
  lineHeight: 1.35,
};

const careerOfficeStyle: CSSProperties = {
  width: "100%",
  minHeight: "100%",
  height: "auto",
  maxHeight: "calc(100vh - 150px)",
  display: "grid",
  gridTemplateRows: "auto auto",
  gap: "14px",
  background: "linear-gradient(180deg, #f8fafc, #e0f2fe)",
  border: "4px solid #111827",
  borderRadius: "28px",
  padding: "18px",
  overflowY: "auto",
  overflowX: "hidden",
  color: "#0f172a",
};









const careerSequencePanelStyle: CSSProperties = {
  background: "#f8fafc",
  border: "4px solid #111827",
  borderRadius: "22px",
  padding: "18px",
};

const careerSequenceRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "center",
  gap: "10px",
};

const careerSequenceKeyStyle: CSSProperties = {
  width: "58px",
  height: "58px",
  border: "4px solid #111827",
  borderRadius: "16px",
  color: "#111827",
  fontWeight: 900,
  fontSize: "24px",
  cursor: "pointer",
  boxShadow: "0 5px 0 rgba(15,23,42,0.18)",
};

const careerMiniGameSubTextStyle: CSSProperties = {
  marginTop: "12px",
  color: "#334155",
  fontWeight: 900,
  textAlign: "center",
};

const careerLogisticsPanelStyle: CSSProperties = {
  display: "grid",
  gap: "12px",
};

const careerLogisticsBoardStyle: CSSProperties = {
  width: "min(460px, 100%)",
  margin: "0 auto",
  display: "grid",
  gridTemplateColumns: "repeat(6, 1fr)",
  gap: "6px",
  background: "#1e293b",
  border: "5px solid #111827",
  borderRadius: "18px",
  padding: "10px",
};

const careerLogisticsCellStyle: CSSProperties = {
  height: "42px",
  border: "2px solid rgba(15,23,42,0.45)",
  borderRadius: "9px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
};

const careerFinancePanelStyle: CSSProperties = {
  display: "grid",
  gap: "14px",
  background: "#f8fafc",
  border: "4px solid #111827",
  borderRadius: "22px",
  padding: "16px",
};

const careerFinanceChartStyle: CSSProperties = {
  minHeight: "92px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "18px",
  color: "#2563eb",
  fontSize: "46px",
  fontWeight: 900,
};

const careerMiniGameStatusGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "8px",
};

const careerTypingPromptStyle: CSSProperties = {
  border: "4px solid #111827",
  borderRadius: "18px",
  background: "linear-gradient(180deg, #eff6ff, #dbeafe)",
  color: "#111827",
  padding: "18px",
  fontSize: "24px",
  fontWeight: 900,
  lineHeight: 1.35,
  textAlign: "center",
  boxShadow: "4px 4px 0 rgba(17,24,39,0.16)",
};

const careerMiniGameButtonRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "10px",
};

const careerMiniGameOverlayStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 80,
  background: "rgba(15,23,42,0.62)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const careerMiniGameBoxStyle: CSSProperties = {
  width: "min(600px, 92vw)",
  background: "#ffffff",
  color: "#0f172a",
  border: "5px solid #111827",
  borderRadius: "28px",
  padding: "26px",
  boxShadow: "0 20px 0 rgba(15,23,42,0.25)",
  display: "grid",
  gap: "12px",
};

const careerMiniGameScoreStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "16px",
  background: "#eff6ff",
  padding: "14px",
  fontWeight: 900,
  fontSize: "20px",
  textAlign: "center",
};


const titleBadgeStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  marginTop: "4px",
  border: "3px solid #111827",
  borderRadius: "999px",
  background: "linear-gradient(180deg, #fef3c7, #fde68a)",
  color: "#111827",
  padding: "6px 12px",
  fontWeight: 900,
  boxShadow: "0 5px 0 rgba(15,23,42,0.16)",
};

const titleGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "14px",
  overflowY: "auto",
  paddingRight: "8px",
  paddingBottom: "28px",
};

const titleCardStyle: CSSProperties = {
  border: "4px solid #111827",
  borderRadius: "22px",
  background: "linear-gradient(180deg, #ffffff, #eff6ff)",
  padding: "16px",
  display: "grid",
  gap: "8px",
  boxShadow: "0 8px 0 rgba(15,23,42,0.14)",
};

const titleCardIconStyle: CSSProperties = {
  fontSize: "36px",
};

const phoneSceneStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  gap: "14px",
  alignItems: "start",
  justifyItems: "center",
  background: "linear-gradient(180deg, #eef2ff, #dbeafe)",
  border: "4px solid #111827",
  borderRadius: "28px",
  padding: "18px",
  color: "#111827",
  overflow: "hidden",
};

const phoneFrameStyle: CSSProperties = {
  width: "min(430px, 100%)",
  height: "100%",
  maxHeight: "100%",
  aspectRatio: "9 / 19",
  justifySelf: "center",
  alignSelf: "center",
  border: "10px solid #111827",
  borderRadius: "44px",
  background: "linear-gradient(180deg, #0b1220, #020617)",
  padding: "10px 10px 12px",
  boxShadow: "0 24px 0 rgba(15,23,42,0.20)",
  overflow: "hidden",
  display: "grid",
  gridTemplateRows: "18px 34px minmax(0, 1fr) 18px",
  position: "relative",
};

const phoneHardwareTopStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  paddingTop: "2px",
};

const phoneSpeakerNotchStyle: CSSProperties = {
  width: "132px",
  height: "18px",
  borderRadius: "999px",
  background: "#020617",
  border: "2px solid rgba(255,255,255,0.08)",
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const phoneCameraDotStyle: CSSProperties = {
  position: "absolute",
  right: "14px",
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  background: "radial-gradient(circle at 35% 35%, #93c5fd, #1d4ed8 55%, #0f172a)",
  boxShadow: "0 0 0 2px rgba(255,255,255,0.06)",
};

const phoneTopBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  color: "white",
  fontSize: "13px",
  fontWeight: 900,
  padding: "0 12px",
};

const phoneContentStyle: CSSProperties = {
  minHeight: 0,
  overflowY: "auto",
  background: "linear-gradient(180deg, #f8fafc, #eef2ff)",
  borderRadius: "30px",
  padding: "14px",
  display: "grid",
  gap: "12px",
  border: "2px solid rgba(148,163,184,0.32)",
};

const phoneSummaryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "8px",
};

const phoneCardStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.96)",
  padding: "13px",
  boxShadow: "0 7px 0 rgba(15,23,42,0.12)",
};

const phoneCardTitleStyle: CSSProperties = {
  margin: "0 0 10px",
  fontSize: "18px",
  fontWeight: 900,
};

const phoneListStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
  color: "#334155",
  fontSize: "13px",
  fontWeight: 900,
  lineHeight: 1.35,
};

const phoneHeroCardStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "26px",
  background: "linear-gradient(135deg, #111827, #1e3a8a)",
  color: "#ffffff",
  padding: "18px",
  display: "grid",
  gap: "5px",
  boxShadow: "0 8px 0 rgba(15,23,42,0.18)",
};

const phoneHeroLabelStyle: CSSProperties = {
  color: "#bfdbfe",
  fontWeight: 900,
  fontSize: "12px",
};

const phoneHeroMoneyStyle: CSSProperties = {
  fontSize: "28px",
  lineHeight: 1.1,
};

const phoneHeroSubStyle: CSSProperties = {
  color: "#dbeafe",
  fontWeight: 800,
  fontSize: "12px",
};

const phoneAppGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "12px",
};

const phoneAppIconButtonStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "24px",
  background: "rgba(255,255,255,0.96)",
  padding: "14px 8px",
  minHeight: "130px",
  display: "grid",
  justifyItems: "center",
  alignContent: "center",
  gap: "6px",
  cursor: "pointer",
  boxShadow: "0 7px 0 rgba(15,23,42,0.12)",
  color: "#111827",
  fontWeight: 900,
};

const phoneAppIconStyle: CSSProperties = {
  width: "56px",
  height: "56px",
  borderRadius: "18px",
  border: "3px solid #111827",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  boxShadow: "0 5px 0 rgba(15,23,42,0.14)",
};

const phoneMiniDockStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "22px",
  background: "rgba(255,255,255,0.82)",
  padding: "12px",
  display: "grid",
  gap: "6px",
  fontSize: "13px",
  fontWeight: 900,
  color: "#334155",
};

const phoneAppHeaderStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "auto 1fr",
  alignItems: "center",
  gap: "10px",
  color: "#111827",
  fontWeight: 900,
  fontSize: "18px",
};

const phoneBackAppButtonStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "14px",
  background: "#ffffff",
  color: "#111827",
  padding: "8px 10px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 4px 0 rgba(15,23,42,0.12)",
};

const phoneHomeIndicatorWrapStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const phoneHomeIndicatorStyle: CSSProperties = {
  width: "120px",
  height: "5px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.82)",
};

const lottoTicketStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "10px",
  alignItems: "center",
  border: "3px dashed #166534",
  borderRadius: "18px",
  background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
  padding: "12px",
  marginTop: "8px",
};

const lottoScratchButtonStyle: CSSProperties = {
  border: "4px solid #111827",
  borderRadius: "14px",
  background: "linear-gradient(180deg, #fef3c7, #f59e0b)",
  color: "#111827",
  padding: "10px 14px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "3px 3px 0 #111827",
};

const lottoResultBadgeStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "999px",
  background: "#ffffff",
  color: "#111827",
  padding: "8px 12px",
  fontWeight: 900,
};

const financeChartStyle: CSSProperties = {
  height: "180px",
  display: "grid",
  gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
  gap: "8px",
  alignItems: "end",
  borderRadius: "16px",
  background: "linear-gradient(180deg, #eff6ff, #f8fafc)",
  border: "2px solid #cbd5e1",
  padding: "12px",
};

const financeChartColumnStyle: CSSProperties = {
  height: "100%",
  display: "grid",
  gridTemplateRows: "1fr auto",
  gap: "5px",
  alignItems: "end",
};

const financeChartBarsStyle: CSSProperties = {
  height: "100%",
  display: "flex",
  gap: "3px",
  alignItems: "end",
  justifyContent: "center",
};

const financeIncomeBarStyle: CSSProperties = {
  width: "10px",
  borderRadius: "999px 999px 3px 3px",
  background: "linear-gradient(180deg, #4ade80, #16a34a)",
};

const financeExpenseBarStyle: CSSProperties = {
  width: "10px",
  borderRadius: "999px 999px 3px 3px",
  background: "linear-gradient(180deg, #fb7185, #dc2626)",
};

const financeChartLabelStyle: CSSProperties = {
  fontSize: "9px",
  color: "#64748b",
  textAlign: "center",
};

const firedOverlayWrapStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
  zIndex: 999,
  background: "rgba(15,23,42,0.48)",
};

const firedStampCardStyle: CSSProperties = {
  transform: "rotate(-10deg)",
  background: "#fee2e2",
  border: "10px solid #dc2626",
  borderRadius: "28px",
  padding: "38px 56px",
  textAlign: "center",
  boxShadow: "0 0 0 8px #ffffff, 0 0 0 16px #111827, 0 24px 60px rgba(0,0,0,0.45)",
};

const firedStampTitleStyle: CSSProperties = {
  fontSize: "96px",
  fontWeight: 900,
  letterSpacing: "0.18em",
  color: "#dc2626",
  lineHeight: 1,
  textTransform: "uppercase",
  textShadow: "4px 4px 0 #111827",
};

const firedStampReasonStyle: CSSProperties = {
  marginTop: "18px",
  fontSize: "26px",
  fontWeight: 900,
  color: "#111827",
  whiteSpace: "nowrap",
};

const casinoSceneStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateRows: "auto auto auto",
  gap: "16px",
  overflowY: "auto",
  background: "radial-gradient(circle at 18% 8%, rgba(250,204,21,0.28), transparent 22%), radial-gradient(circle at 86% 18%, rgba(244,63,94,0.20), transparent 24%), linear-gradient(180deg, #20142f 0%, #111827 58%, #2a1608 100%)",
  border: "4px solid #facc15",
  borderRadius: "28px",
  padding: "20px",
  color: "#f8fafc",
};

const casinoContentGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.08fr 1fr",
  gap: "14px",
  alignItems: "start",
};

const casinoLowerGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "14px",
  alignItems: "start",
};

const casinoCardStyle: CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,237,0.94))",
  border: "4px solid #facc15",
  borderRadius: "24px",
  padding: "18px",
  boxShadow: "0 10px 0 rgba(250,204,21,0.26), 0 24px 46px rgba(0,0,0,0.28)",
  display: "grid",
  gap: "14px",
  overflow: "visible",
  alignContent: "start",
  color: "#111827",
};

const casinoListCardStyle: CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(239,246,255,0.92))",
  border: "4px solid #facc15",
  borderRadius: "22px",
  padding: "14px",
  boxShadow: "0 8px 0 rgba(250,204,21,0.20), 0 20px 38px rgba(0,0,0,0.22)",
  overflowY: "auto",
  maxHeight: "280px",
  color: "#111827",
};

const casinoCardHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: 0,
};

const casinoIconStyle: CSSProperties = {
  width: "64px",
  height: "64px",
  border: "4px solid #111827",
  borderRadius: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "34px",
  background: "radial-gradient(circle at 35% 25%, #ffffff, #fde68a 48%, #f59e0b)",
  boxShadow: "0 0 0 5px rgba(250,204,21,0.18), 0 8px 0 rgba(15,23,42,0.18)",
  flexShrink: 0,
};

const casinoTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "22px",
  fontWeight: 900,
  color: "#111827",
};

const casinoTextStyle: CSSProperties = {
  margin: "4px 0 0",
  color: "#475569",
  fontWeight: 800,
  fontSize: "14px",
  lineHeight: 1.35,
};

const casinoInputStyle: CSSProperties = {
  width: "100%",
  border: "3px solid #111827",
  borderRadius: "14px",
  background: "#ffffff",
  color: "#111827",
  padding: "11px 12px",
  fontWeight: 900,
  fontSize: "16px",
  outline: "none",
};

const casinoPrimaryButtonStyle: CSSProperties = {
  border: "4px solid #111827",
  borderRadius: "16px",
  background: "linear-gradient(180deg, #fde68a, #f59e0b)",
  color: "#111827",
  padding: "12px 16px",
  fontSize: "17px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 6px 0 rgba(120,53,15,0.55), 0 0 18px rgba(250,204,21,0.22)",
};

const casinoDangerButtonStyle: CSSProperties = {
  ...casinoPrimaryButtonStyle,
  background: "#22c55e",
};

const casinoSmallButtonStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "12px",
  background: "#ffffff",
  color: "#111827",
  padding: "9px 12px",
  fontWeight: 900,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const equipButtonStyle: CSSProperties = {
  ...casinoSmallButtonStyle,
  background: "#dcfce7",
  borderColor: "#15803d",
  color: "#166534",
};

const unequipButtonStyle: CSSProperties = {
  ...casinoSmallButtonStyle,
  background: "#fee2e2",
  borderColor: "#dc2626",
  color: "#991b1b",
};

const marketButtonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const itemCollectionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "8px",
};

const itemCollectionSectionStyle: CSSProperties = {
  display: "grid",
  gap: "8px",
};

const itemCollectionSectionTitleStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.96)",
  padding: "8px 10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
  fontSize: "13px",
  fontWeight: 900,
};

const itemCollectionSectionGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "8px",
};

const itemCollectionCardStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.92)",
  padding: "10px",
  display: "grid",
  gap: "4px",
  fontSize: "12px",
};


const itemInventoryHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  alignItems: "start",
};

const itemInventoryControlStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "8px",
  alignItems: "center",
  marginBottom: "8px",
};

const itemInventorySelectStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "12px",
  background: "#ffffff",
  color: "#111827",
  padding: "9px 10px",
  fontWeight: 900,
  minWidth: 0,
};

const gachaShopSceneStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateRows: "auto 182px minmax(0, 1fr)",
  gap: "10px",
  overflow: "auto",
  background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
  color: "#111827",
  border: "4px solid #111827",
  borderRadius: "26px",
  padding: "14px",
  boxShadow: "0 18px 0 rgba(17,24,39,0.10), 0 24px 46px rgba(15,23,42,0.18)",
};

const gachaDiscoveredBadgeStyle: CSSProperties = {
  position: "absolute",
  top: "8px",
  right: "8px",
  border: "2px solid #cbd5e1",
  borderRadius: "999px",
  padding: "3px 7px",
  fontSize: "10px",
  fontWeight: 900,
  lineHeight: 1,
  zIndex: 2,
};

const gachaOfferGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "10px",
  minHeight: 0,
  overflow: "hidden",
};

const gachaOfferCardStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateRows: "auto auto auto auto auto 36px",
  gap: "4px",
  alignContent: "start",
  minHeight: 0,
  overflow: "hidden",
  background: "#ffffff",
  border: "4px solid #111827",
  borderRadius: "18px",
  padding: "10px",
  boxShadow: "0 8px 0 rgba(17,24,39,0.12)",
  color: "#111827",
};

const gachaOfferTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "18px",
  fontWeight: 900,
  lineHeight: 1.15,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const gachaOfferDescStyle: CSSProperties = {
  margin: 0,
  color: "#334155",
  fontSize: "12px",
  fontWeight: 800,
  lineHeight: 1.22,
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const gachaOfferPriceStyle: CSSProperties = {
  fontSize: "12px",
  fontWeight: 900,
  lineHeight: 1.2,
};

const gachaOfferEffectStyle: CSSProperties = {
  fontSize: "13px",
  fontWeight: 900,
  lineHeight: 1.2,
};

const gachaOfferSmallTextStyle: CSSProperties = {
  color: "#64748b",
  fontSize: "11px",
  lineHeight: 1.15,
};

const gachaOfferBuyButtonStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "12px",
  background: "linear-gradient(180deg, #fde68a, #f59e0b)",
  color: "#111827",
  fontSize: "15px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 5px 0 rgba(17,24,39,0.28)",
  minHeight: "34px",
  padding: "4px 8px",
};

const gachaLowerGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  minHeight: 0,
  overflow: "hidden",
};

const gachaListCardStyle: CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(239,246,255,0.92))",
  border: "4px solid #facc15",
  borderRadius: "22px",
  padding: "12px",
  boxShadow: "0 8px 0 rgba(250,204,21,0.20), 0 20px 38px rgba(0,0,0,0.18)",
  overflowY: "auto",
  minHeight: 0,
  color: "#111827",
};

const gachaEquippedPanelStyle: CSSProperties = {
  border: "3px solid rgba(250,204,21,0.9)",
  borderRadius: "18px",
  background: "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,251,235,0.95))",
  padding: "12px",
  display: "grid",
  gap: "8px",
};

const gachaEquippedTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: "18px",
  fontWeight: 900,
  color: "#111827",
};

const marketMiniRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "10px",
  border: "3px solid #111827",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.8)",
  padding: "10px",
  fontWeight: 900,
  color: "#111827",
};

const slotResultBoxStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "16px",
  background: "linear-gradient(180deg, #fefce8, #fff7ed)",
  padding: "12px",
  display: "grid",
  gap: "4px",
  fontWeight: 900,
};

const slotMachinePanelStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 96px",
  gap: "14px",
  alignItems: "center",
};

const slotMachineCabinetStyle: CSSProperties = {
  border: "4px solid #facc15",
  borderRadius: "26px",
  background: "radial-gradient(circle at 50% 0%, rgba(250,204,21,0.30), transparent 38%), linear-gradient(180deg, #3b0764, #111827)",
  color: "#f8fafc",
  padding: "16px",
  display: "grid",
  gap: "12px",
  boxShadow: "inset 0 0 0 3px rgba(255,255,255,0.10), 0 10px 0 rgba(120,53,15,0.55), 0 0 32px rgba(250,204,21,0.24)",
};

const slotMachineHeaderStyle: CSSProperties = {
  justifySelf: "center",
  fontSize: "14px",
  fontWeight: 900,
  letterSpacing: "0.16em",
  color: "#fde68a",
};

const slotMachineDisplayStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "10px",
  background: "linear-gradient(180deg, #fff8dc, #ffffff)",
  border: "4px solid #475569",
  borderRadius: "18px",
  padding: "12px",
  boxShadow: "inset 0 10px 18px rgba(15,23,42,0.10)",
};

const slotReelWindowStyle: CSSProperties = {
  height: "94px",
  borderRadius: "16px",
  background: "linear-gradient(180deg, #ffffff, #e2e8f0)",
  border: "3px solid #94a3b8",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "inset 0 -10px 12px rgba(15,23,42,0.08)",
  transition: "transform 120ms ease",
};

const slotReelSymbolStyle: CSSProperties = {
  fontSize: "44px",
  lineHeight: 1,
  filter: "drop-shadow(0 3px 0 rgba(15,23,42,0.10))",
};

const slotMachineFooterStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "8px",
  flexWrap: "wrap",
  color: "#cbd5e1",
  fontSize: "12px",
  fontWeight: 900,
};

const slotLeverButtonStyle: CSSProperties = {
  position: "relative",
  border: "4px solid #111827",
  borderRadius: "22px",
  background: "linear-gradient(180deg, #fee2e2, #fecaca)",
  height: "168px",
  cursor: "pointer",
  boxShadow: "0 8px 0 rgba(15,23,42,0.18)",
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "center",
  overflow: "hidden",
};

const slotLeverStickStyle: CSSProperties = {
  position: "absolute",
  top: "34px",
  width: "10px",
  height: "78px",
  borderRadius: "999px",
  background: "linear-gradient(180deg, #f8fafc, #94a3b8)",
  transition: "transform 160ms ease",
};

const slotLeverKnobStyle: CSSProperties = {
  position: "absolute",
  top: "22px",
  width: "28px",
  height: "28px",
  borderRadius: "999px",
  background: "#ef4444",
  border: "4px solid #111827",
  transition: "transform 160ms ease",
};

const slotLeverLabelStyle: CSSProperties = {
  marginBottom: "12px",
  fontSize: "13px",
  fontWeight: 900,
  color: "#7f1d1d",
};

const slotControlGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  gap: "12px",
  alignItems: "end",
};

const slotStakeFieldStyle: CSSProperties = {
  display: "grid",
  gap: "6px",
};

const slotStakeLabelStyle: CSSProperties = {
  fontSize: "12px",
  fontWeight: 900,
  color: "#475569",
};

const slotQuickRowStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const slotQuickButtonStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "12px",
  background: "#ffffff",
  color: "#111827",
  padding: "10px 12px",
  fontSize: "13px",
  fontWeight: 900,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const pvpMessageStyle: CSSProperties = {
  minHeight: "42px",
  borderRadius: "14px",
  background: "#eff6ff",
  border: "2px solid #bfdbfe",
  color: "#1e3a8a",
  padding: "10px",
  fontWeight: 900,
  lineHeight: 1.35,
};

const pvpMatchRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
  border: "3px solid #111827",
  borderRadius: "16px",
  background: "#f8fafc",
  padding: "10px",
  marginBottom: "8px",
};

const pvpGamePanelStyle: CSSProperties = {
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) 160px auto",
  gap: "12px",
  alignItems: "center",
  border: "4px solid #111827",
  borderRadius: "22px",
  background: "#ffffff",
  padding: "12px",
  boxShadow: "0 8px 0 rgba(15,23,42,0.14)",
};

const pvpLightStyle: CSSProperties = {
  height: "92px",
  border: "4px solid #111827",
  borderRadius: "22px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#111827",
  fontSize: "24px",
  fontWeight: 900,
};

const pvpButtonRowStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const globalChatStyle: CSSProperties = {
  position: "fixed",
  right: "18px",
  bottom: "18px",
  zIndex: 120,
  width: "min(380px, calc(100vw - 36px))",
  maxHeight: "460px",
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr) auto",
  gap: "8px",
  padding: "12px",
  border: "4px solid rgba(17,24,39,0.88)",
  borderRadius: "22px",
  background: "rgba(15,23,42,0.76)",
  backdropFilter: "blur(8px)",
  color: "#ffffff",
  boxShadow: "0 18px 40px rgba(15,23,42,0.28)",
};

const globalChatHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  fontWeight: 900,
};

const chatCloseButtonStyle: CSSProperties = {
  border: "2px solid rgba(255,255,255,0.65)",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.12)",
  color: "#ffffff",
  fontWeight: 900,
  cursor: "pointer",
};

const chatMessageListStyle: CSSProperties = {
  minHeight: "180px",
  maxHeight: "320px",
  overflowY: "auto",
  display: "grid",
  alignContent: "start",
  gap: "7px",
};

const chatBubbleStyle: CSSProperties = {
  display: "grid",
  gap: "3px",
  padding: "8px",
  border: "2px solid rgba(255,255,255,0.18)",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.10)",
  fontSize: "13px",
  lineHeight: 1.3,
};

const chatInputRowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto",
  gap: "7px",
};

const chatInputStyle: CSSProperties = {
  border: "2px solid rgba(255,255,255,0.5)",
  borderRadius: "12px",
  padding: "10px",
  background: "rgba(255,255,255,0.92)",
  color: "#111827",
  fontWeight: 900,
};

const chatSendButtonStyle: CSSProperties = {
  border: "2px solid #facc15",
  borderRadius: "12px",
  background: "#facc15",
  color: "#111827",
  padding: "8px 12px",
  fontWeight: 900,
  cursor: "pointer",
};


const profileNameplateMetaStyle: CSSProperties = {
  fontSize: "11px",
  opacity: 0.82,
  fontWeight: 900,
};


const luxuryShopSceneStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "block",
  overflowY: "auto",
  overflowX: "hidden",
  background: "linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)",
  color: "#111827",
  border: "4px solid #111827",
  borderRadius: "26px",
  padding: "18px",
  boxShadow: "0 18px 0 rgba(17,24,39,0.10), 0 24px 46px rgba(15,23,42,0.18)",
};

const luxurySummaryBarStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginBottom: "16px",
};

const luxurySectionStackStyle: CSSProperties = {
  display: "grid",
  gap: "16px",
};

const luxurySectionStyle: CSSProperties = {
  border: "4px solid #111827",
  borderRadius: "22px",
  background: "#ffffff",
  padding: "16px",
  boxShadow: "0 12px 0 rgba(15,23,42,0.08)",
  display: "grid",
  gap: "14px",
};

const luxurySectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "10px",
  flexWrap: "wrap",
};

const luxuryMiniBadgeStyle: CSSProperties = {
  border: "2px solid #111827",
  borderRadius: "999px",
  padding: "8px 12px",
  background: "#f8fafc",
  fontWeight: 900,
  fontSize: "12px",
};

const luxuryGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "12px",
};

const luxuryCardStyle: CSSProperties = {
  display: "grid",
  gap: "10px",
  border: "3px solid #111827",
  borderRadius: "18px",
  background: "#f8fafc",
  padding: "12px",
  alignContent: "start",
};

const luxuryPreviewFrameStyle: CSSProperties = {
  minHeight: "132px",
  border: "3px solid #cbd5e1",
  borderRadius: "16px",
  background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "12px",
  overflow: "hidden",
};

const luxuryCardTitleStyle: CSSProperties = {
  fontSize: "18px",
  fontWeight: 900,
  color: "#111827",
  margin: 0,
};

const luxuryCardTextStyle: CSSProperties = {
  margin: 0,
  fontSize: "13px",
  lineHeight: 1.5,
  color: "#475569",
};

const luxuryPriceStyle: CSSProperties = {
  color: "#b45309",
  fontSize: "18px",
  fontWeight: 900,
};








const rpgQuestLayoutStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "minmax(210px, 260px) minmax(0, 1fr)",
  gap: "14px",
  alignItems: "start",
  minHeight: 0,
};

const rpgNpcPortraitStyle: CSSProperties = {
  border: "4px solid #111827",
  borderRadius: "22px",
  background: "linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)",
  padding: "14px",
  display: "grid",
  gap: "10px",
  alignContent: "start",
  minHeight: 0,
};

const rpgNpcAvatarStyle: CSSProperties = {
  width: "118px",
  height: "118px",
  border: "4px solid #111827",
  borderRadius: "26px",
  background: "#fef3c7",
  display: "grid",
  placeItems: "center",
  fontSize: "62px",
  boxShadow: "0 8px 0 rgba(17,24,39,0.12)",
};

const rpgCurrentJobBoxStyle: CSSProperties = {
  border: "3px dashed #111827",
  borderRadius: "18px",
  padding: "10px",
  display: "grid",
  gap: "7px",
  background: "#f8fafc",
};

const rpgDialoguePanelStyle: CSSProperties = {
  border: "4px solid #111827",
  borderRadius: "22px",
  background: "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)",
  padding: "16px",
  display: "grid",
  gap: "12px",
  alignContent: "start",
  minHeight: 0,
  minWidth: 0,
};

const rpgDialogueNameStyle: CSSProperties = {
  width: "fit-content",
  border: "3px solid #111827",
  borderRadius: "999px",
  background: "#111827",
  color: "#ffffff",
  padding: "8px 14px",
  fontWeight: 900,
};

const rpgDialogueBubbleStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "20px",
  background: "#ffffff",
  padding: "16px",
  display: "grid",
  gap: "10px",
  boxShadow: "0 8px 0 rgba(17,24,39,0.10)",
};

const rpgDialogueTextStyle: CSSProperties = {
  margin: 0,
  color: "#111827",
  fontSize: "17px",
  lineHeight: 1.65,
  fontWeight: 800,
};

const rpgWarningTextStyle: CSSProperties = {
  margin: 0,
  color: "#b91c1c",
  fontSize: "15px",
  lineHeight: 1.55,
  fontWeight: 900,
};

const rpgQuestDetailGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "10px",
};

const rpgQuestDetailCardStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "16px",
  background: "#f8fafc",
  padding: "12px",
  display: "grid",
  gap: "5px",
};

const rpgDialogueButtonRowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
};





const rpgQuestActionPanelStyle: CSSProperties = {
  border: "4px solid #2563eb",
  borderRadius: "20px",
  background: "linear-gradient(135deg, #dbeafe 0%, #ffffff 100%)",
  padding: "14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
  flexWrap: "wrap",
  boxShadow: "0 8px 0 rgba(37,99,235,0.16)",
};

const rpgQuestActionTitleStyle: CSSProperties = {
  display: "block",
  fontSize: "20px",
  color: "#111827",
  marginBottom: "6px",
};

const rpgQuestActionTextStyle: CSSProperties = {
  margin: 0,
  color: "#334155",
  fontSize: "15px",
  lineHeight: 1.55,
  fontWeight: 800,
};

const rpgQuestActionButtonGroupStyle: CSSProperties = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};


const careerRouteChoicePanelStyle: CSSProperties = {
  border: "3px dashed #2563eb",
  borderRadius: "18px",
  background: "#eff6ff",
  padding: "12px",
  display: "grid",
  gap: "10px",
};

const careerRouteChoiceGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  gap: "8px",
};

const careerRouteChoiceButtonStyle: CSSProperties = {
  border: "3px solid #111827",
  borderRadius: "14px",
  padding: "10px",
  display: "grid",
  gap: "4px",
  textAlign: "left",
  color: "#111827",
  cursor: "pointer",
  fontWeight: 900,
};












