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

type LobbyView = "room" | "street" | "jobs" | "housing" | "tax" | "career" | "ranking" | "stocks" | "casino" | "bank" | "estate" | "business" | "news";
type RoomKind = "basic" | "studio" | "office";
type CareerBuildingId = "company" | "entertainment" | "logistics" | "finance";
type StreetBuildingId = CareerBuildingId | "stocks" | "casino" | "bank" | "estate" | "business" | "news";
type OccupationId =
  | "unemployed"
  | "officeIntern"
  | "officeStaff"
  | "officeManager"
  | "officeDirector"
  | "salesAssociate"
  | "marketingPlanner"
  | "convenienceManager"
  | "cafeManager"
  | "securityCaptain"
  | "franchiseOwner"
  | "trainee"
  | "rookieSinger"
  | "topSinger"
  | "logisticsStaff"
  | "logisticsManager"
  | "dispatchController"
  | "platformOpsManager"
  | "investor";

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
};

type RankingRow = {
  rank: number;
  nickname: string;
  cash: number;
  job: string;
  hasSave: boolean;
  isMe?: boolean;
};

type ProfileRow = {
  id: string;
  nickname: string | null;
  room_kind: string | null;
  occupation_id: string | null;
  occupation_level?: number | null;
  unlocked_occupations?: OccupationId[] | string | null;
};

type RankingSaveRow = {
  user_id: string;
  cash: number | string;
};

type StockId = "kongStudio" | "zephyrLogistics" | "raelAir" | "dongshimLivestock" | "blmaSteel";

type StockCompany = {
  id: StockId;
  name: string;
  icon: string;
  description: string;
};

type StockRow = {
  id: StockId;
  name: string;
  icon: string;
  description: string;
  price: number;
  previousPrice: number;
  owned: number;
  history: number[];
};

type StockSaveRow = {
  rows: StockRow[] | string | null;
  updated_at: string | null;
};


type CasinoUserRow = {
  id: string;
  nickname: string;
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

type EstateId = "semiBasement" | "officetel" | "apartment" | "smallStore" | "building";
type BusinessId = "coffeeShop" | "convenienceStore" | "deliveryAgency" | "entertainmentAgency";

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
};

const PROFILE_TABLE = "game_profiles";
const STOCK_TABLE = "game_stock_saves";
const STOCK_INTERVAL_MS = 3 * 60 * 1000;
const SLOT_SYMBOLS = ["7", "🍒", "💎", "🍀", "⭐", "🍋"];
const TAX_INTERVAL_SECONDS = 420;
const TAX_WARNING_SECONDS = 60;

const PAY = {
  sorting: 320,
  delivery: 700,
  cashier: 110,
  cafe: 180,
  security: 260,
  deliveryCrashPenalty: 250,
  vipPenalty: 1000,
};

const jobs: Job[] = [
  {
    id: "sorting",
    name: "택배 분류 알바",
    subtitle: "빠르게 지나가는 택배를 색깔 키로 분류하세요.",
    rewardText: `분류 성공 1개당 ${PAY.sorting.toLocaleString()}원`,
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
    rewardText: `계산 성공 1회당 ${PAY.cashier.toLocaleString()}원`,
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
    rewardText: `대응 성공 1회당 ${PAY.security.toLocaleString()}원 · VIP 차단 시 -${PAY.vipPenalty.toLocaleString()}원`,
    icon: "🛡️",
  },
];

const roomInfo: Record<RoomKind, { name: string; floor: string; description: string; priceText: string }> = {
  basic: { name: "기본 방", floor: "2F", description: "처음 지급되는 작은 방입니다.", priceText: "기본 제공" },
  studio: { name: "넓은 원룸", floor: "3F", description: "소파와 책상이 있는 넓은 생활 공간입니다.", priceText: "무료 변경" },
  office: { name: "작업실 방", floor: "5F", description: "알바와 사업 준비를 위한 작업실 느낌의 방입니다.", priceText: "무료 변경" },
};

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
  },
};

const careerList: OccupationId[] = [
  "officeIntern",
  "officeStaff",
  "officeManager",
  "officeDirector",
  "salesAssociate",
  "marketingPlanner",
  "convenienceManager",
  "cafeManager",
  "securityCaptain",
  "franchiseOwner",
  "trainee",
  "rookieSinger",
  "topSinger",
  "logisticsStaff",
  "logisticsManager",
  "dispatchController",
  "platformOpsManager",
  "investor",
];

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
  { id: "casino", title: "도박장", subtitle: "슬롯 머신 · 유저 대전", emoji: "🎰" },
];

const streetBuildingPages: StreetBuildingId[][] = [
  ["company", "entertainment", "finance"],
  ["bank", "stocks", "logistics"],
  ["estate", "business", "news"],
  ["casino"],
];

const stockCompanies: StockCompany[] = [
  { id: "kongStudio", name: "콩 스튜디오", icon: "🎮", description: "귀여운 게임과 캐릭터 IP를 만드는 성장형 회사" },
  { id: "zephyrLogistics", name: "제피르 물류", icon: "🚚", description: "전국 배송망을 가진 빠른 물류 회사" },
  { id: "raelAir", name: "라엘 항공", icon: "✈️", description: "여행 수요에 민감하게 움직이는 항공 회사" },
  { id: "dongshimLivestock", name: "동쉼 축산", icon: "🐄", description: "식품 가격과 수요에 영향을 받는 축산 회사" },
  { id: "blmaSteel", name: "블마 철강", icon: "🏭", description: "건설 경기와 원자재 흐름을 타는 철강 회사" },
];

const estateItems: EstateItem[] = [
  { id: "semiBasement", name: "반지하 원룸", icon: "🏚️", price: 300000, incomeEvery5Min: 1500, description: "가장 저렴하게 시작하는 첫 부동산입니다." },
  { id: "officetel", name: "오피스텔", icon: "🏢", price: 1500000, incomeEvery5Min: 8000, description: "안정적인 월세 수익을 주는 소형 부동산입니다." },
  { id: "apartment", name: "아파트", icon: "🏙️", price: 4500000, incomeEvery5Min: 22000, description: "생활권이 좋아 가치가 비교적 안정적입니다." },
  { id: "smallStore", name: "소형 상가", icon: "🏬", price: 9000000, incomeEvery5Min: 58000, description: "경기 영향을 받지만 수익성이 좋은 상가입니다." },
  { id: "building", name: "미니 빌딩", icon: "🏦", price: 50000000, incomeEvery5Min: 400000, description: "경제 게임 후반부의 대표 자산입니다." },
];

const businessItems: BusinessItem[] = [
  { id: "coffeeShop", name: "개인 카페 창업", icon: "☕", price: 2000000, incomeEvery5Min: 13000, requiredOccupation: "cafeManager", description: "카페 매니저 경험을 바탕으로 작은 매장을 엽니다." },
  { id: "convenienceStore", name: "편의점 창업", icon: "🏪", price: 3000000, incomeEvery5Min: 18000, requiredOccupation: "convenienceManager", description: "편의점 계산 경험을 매장 운영으로 확장합니다." },
  { id: "deliveryAgency", name: "배달 대행사", icon: "🛵", price: 8000000, incomeEvery5Min: 62000, requiredOccupation: "dispatchController", description: "배차와 플랫폼 운영 경험으로 배달망을 운영합니다." },
  { id: "entertainmentAgency", name: "엔터 기획사", icon: "🎙️", price: 20000000, incomeEvery5Min: 170000, requiredOccupation: "topSinger", description: "톱스타 경험으로 공연과 광고 사업을 운영합니다." },
];

const newsPool: NewsEvent[] = [
  { id: 1, title: "금리 인상 뉴스", effect: "은행 예금은 유리하지만 대출 부담이 커집니다.", tone: "bad" },
  { id: 2, title: "배달 수요 증가", effect: "물류와 배달 관련 직업·사업이 주목받습니다.", tone: "good" },
  { id: 3, title: "한류 공연 흥행", effect: "엔터테인먼트 관련 수익 기대감이 커집니다.", tone: "good" },
  { id: 4, title: "부동산 거래 회복", effect: "상가와 오피스텔 평가 분위기가 좋아집니다.", tone: "good" },
  { id: 5, title: "경기 둔화 우려", effect: "사업 매출 변동성이 커지고 현금 관리가 중요해집니다.", tone: "bad" },
  { id: 6, title: "소비 심리 개선", effect: "카페와 편의점 같은 생활형 사업에 긍정적입니다.", tone: "good" },
];

const cashierKeyPool = ["W", "A", "S", "D"];
const allSortKinds: SortKind[] = ["red", "blue", "yellow", "green", "purple"];

const sortInfo: Record<SortKind, { label: string; emoji: string; key: string }> = {
  red: { label: "빨강", emoji: "🟥", key: "r" },
  blue: { label: "파랑", emoji: "🟦", key: "b" },
  yellow: { label: "노랑", emoji: "🟨", key: "y" },
  green: { label: "초록", emoji: "🟩", key: "g" },
  purple: { label: "보라", emoji: "🟪", key: "p" },
};

export default function GamePage() {
  const [cash, setCash] = useState(10000);
  const [userId, setUserId] = useState<string | null>(null);
  const [isSaveLoaded, setIsSaveLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("저장 대기 중");

  const [lobbyView, setLobbyView] = useState<LobbyView>("room");
  const [streetPage, setStreetPage] = useState(0);
  const [nickname, setNickname] = useState("우리집");
  const [nicknameDraft, setNicknameDraft] = useState("우리집");
  const [roomKind, setRoomKind] = useState<RoomKind>("basic");
  const [occupationId, setOccupationId] = useState<OccupationId>("unemployed");
  const [occupationLevel, setOccupationLevel] = useState(0);
  const [unlockedOccupations, setUnlockedOccupations] = useState<OccupationId[]>(["unemployed"]);
  const [careerBuildingId, setCareerBuildingId] = useState<CareerBuildingId>("company");
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
  const [rankingUpdatedAt, setRankingUpdatedAt] = useState(new Date());
  const [stockRows, setStockRows] = useState<StockRow[]>([]);
  const [stockUpdatedAt, setStockUpdatedAt] = useState(new Date());
  const [stockCountdownMs, setStockCountdownMs] = useState(STOCK_INTERVAL_MS);
  const [isStockLoaded, setIsStockLoaded] = useState(false);
  const [bankDeposit, setBankDeposit] = useState(0);
  const [bankLoan, setBankLoan] = useState(0);
  const [creditScore, setCreditScore] = useState(700);
  const [bankInput, setBankInput] = useState("10000");
  const [ownedEstates, setOwnedEstates] = useState<EstateId[]>([]);
  const [ownedBusinesses, setOwnedBusinesses] = useState<BusinessId[]>([]);
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>(() => makeNewsEvents());
  const [economyUpdatedAt, setEconomyUpdatedAt] = useState(new Date());

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

  const [warningCount, setWarningCount] = useState(0);
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
  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId) ?? jobs[0], [selectedJobId]);
  const activeJob = useMemo(() => (activeJobId ? jobs.find((job) => job.id === activeJobId) ?? null : null), [activeJobId]);
  const occupation = occupationInfo[occupationId];
  const taxRate = getTaxRate(cash);
  const nextTax = calculateTax(cash, unpaidTax);
  const stockAssetValue = useMemo(() => stockRows.reduce((sum, stock) => sum + stock.price * stock.owned, 0), [stockRows]);
  const estateAssetValue = useMemo(() => ownedEstates.reduce((sum, id) => sum + (estateItems.find((item) => item.id === id)?.price ?? 0), 0), [ownedEstates]);
  const businessAssetValue = useMemo(() => ownedBusinesses.reduce((sum, id) => sum + (businessItems.find((item) => item.id === id)?.price ?? 0), 0), [ownedBusinesses]);
  const passiveIncomeEvery5Min = useMemo(() => {
    const estateIncome = ownedEstates.reduce((sum, id) => sum + (estateItems.find((item) => item.id === id)?.incomeEvery5Min ?? 0), 0);
    const businessIncome = ownedBusinesses.reduce((sum, id) => sum + (businessItems.find((item) => item.id === id)?.incomeEvery5Min ?? 0), 0);
    return estateIncome + businessIncome;
  }, [ownedEstates, ownedBusinesses]);
  const netWorth = cash + bankDeposit + stockAssetValue + estateAssetValue + businessAssetValue - bankLoan - unpaidTax;

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
      setWarningCount(Number(data.warning_count));
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

    async function loadProfilePreferences() {
      const savedNickname = window.localStorage.getItem(`alba-money-nickname-${userId}`);
      const savedRoomKind = window.localStorage.getItem(`alba-money-room-${userId}`) as RoomKind | null;
      const savedOccupationId = window.localStorage.getItem(`alba-money-occupation-${userId}`) as OccupationId | null;
      const savedUnlocked = window.localStorage.getItem(`alba-money-unlocked-occupations-${userId}`);

      if (savedNickname) {
        setNickname(savedNickname);
        setNicknameDraft(savedNickname);
      }

      if (savedRoomKind && savedRoomKind in roomInfo) {
        setRoomKind(savedRoomKind);
      }

      if (savedOccupationId && savedOccupationId in occupationInfo) {
        setOccupationId(savedOccupationId);
      }

      if (savedUnlocked) {
        setUnlockedOccupations(normalizeUnlockedOccupations(safeParseOccupationList(savedUnlocked)));
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from(PROFILE_TABLE)
        .select("id, nickname, room_kind, occupation_id, occupation_level, unlocked_occupations")
        .eq("id", userId)
        .maybeSingle<ProfileRow>();

      if (error) {
        console.warn("프로필 테이블을 읽지 못했습니다. localStorage 값을 사용합니다:", error.message);
        return;
      }

      if (data?.nickname) {
        setNickname(data.nickname);
        setNicknameDraft(data.nickname);
        window.localStorage.setItem(`alba-money-nickname-${userId}`, data.nickname);
      }

      if (data?.room_kind && data.room_kind in roomInfo) {
        const nextRoomKind = data.room_kind as RoomKind;
        setRoomKind(nextRoomKind);
        window.localStorage.setItem(`alba-money-room-${userId}`, nextRoomKind);
      }

      if (data?.occupation_id && data.occupation_id in occupationInfo) {
        const nextOccupationId = data.occupation_id as OccupationId;
        setOccupationId(nextOccupationId);
        window.localStorage.setItem(`alba-money-occupation-${userId}`, nextOccupationId);
      }

      if (typeof data?.occupation_level === "number") {
        setOccupationLevel(data.occupation_level);
      }

      const rawUnlocked = data?.unlocked_occupations;
      const parsedUnlocked = typeof rawUnlocked === "string" ? safeParseOccupationList(rawUnlocked) : rawUnlocked;
      if (Array.isArray(parsedUnlocked)) {
        const nextUnlocked = normalizeUnlockedOccupations(parsedUnlocked);
        setUnlockedOccupations(nextUnlocked);
        window.localStorage.setItem(`alba-money-unlocked-occupations-${userId}`, JSON.stringify(nextUnlocked));
      }
    }

    loadProfilePreferences();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const stored = window.localStorage.getItem(`alba-money-economy-${userId}`);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored) as { bankDeposit?: number; bankLoan?: number; creditScore?: number; ownedEstates?: EstateId[]; ownedBusinesses?: BusinessId[]; newsEvents?: NewsEvent[]; economyUpdatedAt?: string };
      setBankDeposit(Number(parsed.bankDeposit ?? 0));
      setBankLoan(Number(parsed.bankLoan ?? 0));
      setCreditScore(Number(parsed.creditScore ?? 700));
      if (Array.isArray(parsed.ownedEstates)) setOwnedEstates(parsed.ownedEstates.filter((id): id is EstateId => estateItems.some((item) => item.id === id)));
      if (Array.isArray(parsed.ownedBusinesses)) setOwnedBusinesses(parsed.ownedBusinesses.filter((id): id is BusinessId => businessItems.some((item) => item.id === id)));
      if (Array.isArray(parsed.newsEvents) && parsed.newsEvents.length > 0) setNewsEvents(parsed.newsEvents);
      if (parsed.economyUpdatedAt) setEconomyUpdatedAt(new Date(parsed.economyUpdatedAt));
    } catch (error) {
      console.warn("경제 데이터 불러오기 실패:", error);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || !isSaveLoaded) return;

    window.localStorage.setItem(`alba-money-economy-${userId}`, JSON.stringify({
      bankDeposit,
      bankLoan,
      creditScore,
      ownedEstates,
      ownedBusinesses,
      newsEvents,
      economyUpdatedAt: economyUpdatedAt.toISOString(),
    }));
  }, [userId, isSaveLoaded, bankDeposit, bankLoan, creditScore, ownedEstates, ownedBusinesses, newsEvents, economyUpdatedAt]);

  useEffect(() => {
    if (!isSaveLoaded) return;

    const timer = window.setInterval(() => {
      setBankDeposit((current) => Math.floor(current * 1.003));
      setBankLoan((current) => Math.floor(current * 1.012));
      const income = passiveIncomeEvery5Min;
      if (income > 0) {
        setCash((money) => money + income);
        setMessage(`🏘️ 자산/사업 수익 +${income.toLocaleString()}원`);
      }
    }, 5 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, [isSaveLoaded, passiveIncomeEvery5Min]);

  useEffect(() => {
    if (!isSaveLoaded) return;

    const timer = window.setInterval(() => {
      const nextNews = makeNewsEvents();
      setNewsEvents(nextNews);
      setEconomyUpdatedAt(new Date());
      setStockRows((rows) => applyNewsToStocks(rows, nextNews));
      setMessage("📰 경제 뉴스가 갱신되어 시장 분위기가 바뀌었습니다.");
    }, 5 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, [isSaveLoaded]);

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
      .subscribe();

    const timer = window.setInterval(() => {
      refreshRanking();
    }, 60 * 1000);

    return () => {
      window.clearInterval(timer);
      void supabase.removeChannel(rankingChannel);
    };
  }, [userId, isSaveLoaded, nickname, cash, occupationId]);

  useEffect(() => {
    if (lobbyView === "ranking") refreshRanking();
    if (lobbyView === "casino") refreshCasinoData();
  }, [lobbyView]);

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
      let remoteRows: StockRow[] | null = null;
      let remoteAt: Date | null = null;
      let localRows: StockRow[] | null = null;
      let localAt: Date | null = null;

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
            remoteRows = normalizeStockRows(rows, currentUserId);
            remoteAt = data.updated_at ? new Date(data.updated_at) : new Date(0);
          }
        } else if (error) {
          console.warn("주식 저장 테이블을 읽지 못했습니다. localStorage를 사용합니다:", error.message);
        }
      } catch (error) {
        console.warn("주식 저장 데이터를 불러오지 못했습니다. localStorage를 사용합니다:", error);
      }

      const saved = window.localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as { rows?: StockRow[]; updatedAt?: string };
          if (Array.isArray(parsed.rows) && parsed.rows.length > 0) {
            localRows = normalizeStockRows(parsed.rows, currentUserId);
            localAt = parsed.updatedAt ? new Date(parsed.updatedAt) : new Date(0);
          }
        } catch {
          window.localStorage.removeItem(storageKey);
        }
      }

      const useLocal = Boolean(localRows && (!remoteRows || (localAt?.getTime() ?? 0) >= (remoteAt?.getTime() ?? 0)));
      let loadedRows = useLocal ? localRows : remoteRows;
      let loadedAt = useLocal ? localAt : remoteAt;

      if (!loadedRows) {
        loadedRows = makeInitialStocks(currentUserId);
        loadedAt = new Date();
      }

      const elapsedApplied = applyElapsedStockUpdates(loadedRows, loadedAt ?? new Date());

      if (cancelled) return;
      setStockRows(elapsedApplied.rows);
      setStockUpdatedAt(elapsedApplied.updatedAt);
      setStockCountdownMs(Math.max(0, STOCK_INTERVAL_MS - (Date.now() - elapsedApplied.updatedAt.getTime())));
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

    const payload = { rows: stockRows, updatedAt: stockUpdatedAt.toISOString() };
    window.localStorage.setItem(`alba-money-stocks-${currentUserId}`, JSON.stringify(payload));

    const timer = window.setTimeout(async () => {
      try {
        const supabase = createClient();
        const { error } = await supabase.from(STOCK_TABLE).upsert(
          {
            user_id: currentUserId,
            rows: stockRows,
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
    const currentUserId = userId;

    const tick = () => {
      const remaining = stockUpdatedAt.getTime() + STOCK_INTERVAL_MS - Date.now();

      if (remaining <= 0) {
        const now = new Date();
        setStockRows((current) => {
          const nextRows = updateStockMarket(current.length > 0 ? current : makeInitialStocks(currentUserId));
          persistStocksNow(nextRows, now);
          return nextRows;
        });
        setStockUpdatedAt(now);
        setStockCountdownMs(STOCK_INTERVAL_MS);
        return;
      }

      setStockCountdownMs(remaining);
    };

    tick();
    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
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
          warning_count: warningCount,
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
        setSaveMessage("자동 저장 완료");
      }

      setIsSaving(false);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [userId, isSaveLoaded, cash, warningCount, unpaidTax, sortingSuccessTotal, deliverySuccessTotal, cashierSuccessTotal, cafeSuccessTotal, securitySuccessTotal]);

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
    if (taxTriggerCount > 0) applyTaxAutomatically();
  }, [taxTriggerCount]);

  useEffect(() => {
    if (!isSaveLoaded || !userId) return;

    const timer = window.setInterval(() => {
      setCareerIncomeCountdown((current) => {
        if (current <= 1) {
          const income = occupationInfo[occupationId].incomeEvery3Min;
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
  }, [isSaveLoaded, userId, occupationId]);

  useEffect(() => {
    if (!activeJobId) return;

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
          const reward = collected.length * PAY.delivery;
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
        handleCashierKey(key);
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
    const tax = calculateTax(cash, unpaidTax);
    if (cash >= tax) {
      setCash((current) => current - tax);
      setUnpaidTax(0);
      setWarningCount(0);
      setMessage(`💸 자동 세금 ${tax.toLocaleString()}원이 납부되었습니다.`);
      return;
    }

    const nextWarning = warningCount + 1;
    if (nextWarning >= 3) {
      const seizedCash = Math.floor(cash * 0.8);
      setCash((current) => current - seizedCash);
      setUnpaidTax(0);
      setWarningCount(0);
      setMessage(`🚨 세금 미납 경고 3회! ${seizedCash.toLocaleString()}원이 압류되었습니다.`);
      return;
    }

    setWarningCount(nextWarning);
    setUnpaidTax(tax);
    setMessage(`⚠️ 자동 세금 납부 실패! 경고장 ${nextWarning}장`);
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
    setMessage("🏪 낮은 보상이지만 빠르게 반복됩니다. W/A/S/D를 정확히 입력하세요.");
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
    const reward = PAY.sorting + Math.min(120, combo * 8);
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
      const reward = PAY.cashier + difficulty * 8;
      setCash((money) => money + reward);
      setCashierSuccess((success) => success + 1);
      setCashierSuccessTotal((count) => count + 1);
      setCashierSequence(makeCashierSequence(difficulty));
      setCashierIndex(0);
      setMessage(`🏪 계산 성공! +${reward.toLocaleString()}원`);
      return;
    }

    setMessage(`좋아요! 다음 키: ${cashierSequence[nextIndex]}`);
  }

  function judgeCafeFill() {
    if (cafeFill >= cafeTargetStart && cafeFill <= cafeTargetEnd) {
      const reward = PAY.cafe + difficulty * 12;
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
      const reward = PAY.security + difficulty * 10;
      setCash((money) => money + reward);
      setSecuritySuccess((success) => success + 1);
      setSecuritySuccessTotal((count) => count + 1);
      setSecuritySignal("normal");
      setMessage(`🛡️ 대응 성공! +${reward.toLocaleString()}원`);
      return;
    }

    if (securitySignal === "vip") {
      setCash((money) => Math.max(0, money - PAY.vipPenalty));
      registerSecurityMistake(`🛡️ VIP 손님을 막았습니다. 배상금 ${PAY.vipPenalty.toLocaleString()}원!`);
      setSecuritySignal("normal");
      return;
    }

    registerSecurityMistake("🛡️ 평범한 손님을 막았습니다.");
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

  function canChallengeOccupation(nextOccupationId: OccupationId) {
    const nextOccupation = occupationInfo[nextOccupationId];
    if (nextOccupationId === "unemployed") return true;
    if (cash < nextOccupation.requiredCash) return false;
    if (nextOccupation.requiredPrevious && !unlockedOccupations.includes(nextOccupation.requiredPrevious)) return false;

    const required = nextOccupation.requiredSuccess;
    if (required?.sorting && sortingSuccessTotal < required.sorting) return false;
    if (required?.delivery && deliverySuccessTotal < required.delivery) return false;
    if (required?.cashier && cashierSuccessTotal < required.cashier) return false;
    if (required?.cafe && cafeSuccessTotal < required.cafe) return false;
    if (required?.security && securitySuccessTotal < required.security) return false;

    return true;
  }

  function getBankAmount() {
    return Math.max(0, Math.floor(Number(bankInput) || 0));
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
    setBankDeposit((deposit) => deposit - amount);
    setCash((money) => money + amount);
    setMessage(`🏦 출금 ${amount.toLocaleString()}원 완료`);
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
    setMessage(`🏘️ ${estate.name} 구매 완료. 5분마다 ${estate.incomeEvery5Min.toLocaleString()}원 수익이 들어옵니다.`);
  }

  function buyBusiness(businessId: BusinessId) {
    const business = businessItems.find((item) => item.id === businessId);
    if (!business || ownedBusinesses.includes(businessId)) return;
    if (business.requiredOccupation && !unlockedOccupations.includes(business.requiredOccupation)) {
      setMessage(`🧾 ${business.name} 조건 미달: ${occupationInfo[business.requiredOccupation].name} 직업이 필요합니다.`);
      return;
    }
    if (cash < business.price) {
      setMessage(`🧾 ${business.name} 창업에는 ${business.price.toLocaleString()}원이 필요합니다.`);
      return;
    }
    setCash((money) => money - business.price);
    setOwnedBusinesses((owned) => [...owned, businessId]);
    setMessage(`🧾 ${business.name} 창업 완료. 5분마다 ${business.incomeEvery5Min.toLocaleString()}원 사업 수익이 들어옵니다.`);
  }

  function refreshNewsNow() {
    const nextNews = makeNewsEvents();
    setNewsEvents(nextNews);
    setEconomyUpdatedAt(new Date());
    setStockRows((rows) => applyNewsToStocks(rows, nextNews));
    setMessage("📰 경제 뉴스가 새로 들어왔습니다.");
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

    if (buildingId === "bank" || buildingId === "estate" || buildingId === "business" || buildingId === "news") {
      setLobbyView(buildingId);
      return;
    }

    setCareerBuildingId(buildingId);
    setLobbyView("career");
  }

  function challengeOccupation(nextOccupationId: OccupationId) {
    const nextOccupation = occupationInfo[nextOccupationId];

    if (unlockedOccupations.includes(nextOccupationId)) {
      equipOccupation(nextOccupationId);
      return;
    }

    if (!canChallengeOccupation(nextOccupationId)) {
      setMessage(`${nextOccupation.name} 조건 미달: ${nextOccupation.conditionText}`);
      return;
    }

    startCareerTypingGame(nextOccupation);
  }

  async function equipOccupation(nextOccupationId: OccupationId) {
    const nextOccupation = occupationInfo[nextOccupationId];
    setOccupationId(nextOccupationId);

    if (userId) {
      window.localStorage.setItem(`alba-money-occupation-${userId}`, nextOccupationId);
      await saveProfilePatch({ occupation_id: nextOccupationId });
    }

    setMessage(`직업이 ${nextOccupation.icon} ${nextOccupation.name}(으)로 변경되었습니다.`);
  }

  function startCareerTypingGame(nextOccupation: Occupation) {
    setCareerMiniGame(nextOccupation);
    setCareerMiniGameScore(0);
    setCareerMiniGameStep(0);
    setCareerTypingMistakes(0);
    setCareerFinanceAnswer("");
    prepareCareerMiniGameRound(nextOccupation, 0, 0);
    setMessage(`💼 ${nextOccupation.name} 테스트 시작! 직업 건물에 맞는 실무 미니게임을 클리어하세요.`);
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
      await unlockOccupation(careerMiniGame);
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

  async function unlockOccupation(nextOccupation: Occupation) {
    if (!userId) return;

    const nextUnlocked = normalizeUnlockedOccupations([...unlockedOccupations, nextOccupation.id]);
    setUnlockedOccupations(nextUnlocked);
    setOccupationId(nextOccupation.id);
    setOccupationLevel(nextOccupation.minigameDifficulty);
    window.localStorage.setItem(`alba-money-occupation-${userId}`, nextOccupation.id);
    window.localStorage.setItem(`alba-money-unlocked-occupations-${userId}`, JSON.stringify(nextUnlocked));

    await saveProfilePatch({ occupation_id: nextOccupation.id, occupation_level: nextOccupation.minigameDifficulty, unlocked_occupations: nextUnlocked });
    await logCareerMiniGame(nextOccupation, "success", nextOccupation.incomeEvery3Min);
    setMessage(`🎉 ${nextOccupation.icon} ${nextOccupation.name} 직업을 획득했습니다!`);
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

  async function saveProfilePatch(patch: Partial<{ nickname: string; room_kind: RoomKind; occupation_id: OccupationId; occupation_level: number; unlocked_occupations: OccupationId[] }>) {
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
        updated_at: new Date().toISOString(),
        ...patch,
      },
      { onConflict: "id" }
    );

    if (error) {
      console.warn("프로필 부분 저장 실패:", error.message);
    }
  }

  async function refreshRanking(currentNickname = nickname) {
    if (!userId) return;

    const fallbackRows = makeRankingRows(currentNickname, cash, occupationInfo[occupationId].name);
    const supabase = createClient();

    const { data: profiles, error: profilesError } = await supabase
      .from(PROFILE_TABLE)
      .select("id, nickname, room_kind, occupation_id, occupation_level, unlocked_occupations")
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
      console.warn("랭킹 저장 데이터 불러오기 실패:", savesError.message);
    }

    const typedSaves = (saves ?? []) as RankingSaveRow[];
    const saveMap = new Map<string, RankingSaveRow>(typedSaves.map((save) => [save.user_id, save]));

    const rows = typedProfiles
      .map((profile) => {
        const save = saveMap.get(profile.id);
        const profileOccupationId = profile.occupation_id && profile.occupation_id in occupationInfo ? (profile.occupation_id as OccupationId) : "unemployed";
        return {
          rank: 0,
          nickname: profile.id === userId ? currentNickname : profile.nickname || "이름 없음",
          cash: Number(save?.cash ?? 0),
          hasSave: !!save,
          job: profile.id === userId ? occupationInfo[occupationId].name : occupationInfo[profileOccupationId].name,
          isMe: profile.id === userId,
        };
      })
      .sort((a, b) => b.cash - a.cash)
      .slice(0, 10)
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

      const result = data as SlotResult;
      setSlotResult(result);
      setSlotReels(getSlotDisplaySymbols(result.result));
      setCash((money) => Math.max(0, money + Number(result.profit ?? 0)));
      setMessage(getSlotResultMessage(result));
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
      const reward = Number(result.reward ?? 0);
      if (won) setCash((money) => money + reward);
      setPvpMessage(won ? `🏆 승리! 상금 ${reward.toLocaleString()}원을 획득했습니다.` : "패배했습니다. 다음 대전에 다시 도전하세요.");
    } else {
      setPvpMessage("점수를 제출했습니다. 상대 점수를 기다리는 중입니다.");
    }

    refreshRanking();
    refreshCasinoData();
  }

  function persistStocksNow(rows: StockRow[], updatedAt: Date = stockUpdatedAt) {
    if (!userId) return;
    const currentUserId = userId;

    const payload = { rows, updatedAt: updatedAt.toISOString() };
    window.localStorage.setItem(`alba-money-stocks-${currentUserId}`, JSON.stringify(payload));

    try {
      const supabase = createClient();
      void supabase.from(STOCK_TABLE).upsert(
        {
          user_id: currentUserId,
          rows,
          updated_at: updatedAt.toISOString(),
        },
        { onConflict: "user_id" }
      );
    } catch (error) {
      console.warn("주식 즉시 저장 실패. localStorage에는 저장되었습니다:", error);
    }
  }

  function buyStock(stockId: StockId) {
    const stock = stockRows.find((row) => row.id === stockId);
    if (!stock) return;

    if (cash < stock.price) {
      setMessage("현금이 부족해서 주식을 살 수 없습니다.");
      return;
    }

    const nextRows = stockRows.map((row) => row.id === stockId ? { ...row, owned: row.owned + 1 } : row);
    setCash((money) => money - stock.price);
    setStockRows(nextRows);
    persistStocksNow(nextRows);
    setMessage(`${stock.name} 1주를 ${stock.price.toLocaleString()}원에 매수했습니다.`);
  }

  function sellStock(stockId: StockId) {
    const stock = stockRows.find((row) => row.id === stockId);
    if (!stock || stock.owned <= 0) return;

    const nextRows = stockRows.map((row) => row.id === stockId ? { ...row, owned: Math.max(0, row.owned - 1) } : row);
    setCash((money) => money + stock.price);
    setStockRows(nextRows);
    persistStocksNow(nextRows);
    setMessage(`${stock.name} 1주를 ${stock.price.toLocaleString()}원에 매도했습니다.`);
  }

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
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
      <main style={pageStyle}>
        <section style={jobOnlyLayoutStyle}>
          <header style={compactHeaderStyle}>
            <div>
              <div style={smallLabelStyle}>진행 중인 알바</div>
              <h1 style={jobTitleStyle}>{activeJob.icon} {activeJob.name}</h1>
            </div>

            <div style={topStatusGroupStyle}>
              <StatusPill label="현금" value={`${cash.toLocaleString()}원`} />
              <StatusPill label="난이도" value={`Lv.${difficulty}`} warning={difficulty >= 4} />
              <StatusPill label="세금" value={`${nextTax.toLocaleString()}원`} />
              <StatusPill label="세금까지" value={formatTime(taxCountdown)} warning={taxCountdown <= TAX_WARNING_SECONDS} />
              <button onClick={leaveJob} style={leaveButtonStyle}>방으로 가기</button>
            </div>
          </header>

          {difficultyNotice && <div style={difficultyBannerStyle}>{difficultyNotice}</div>}

          <section style={jobStageStyle}>
            {activeJobId === "sorting" && <SortingGame item={sortItem} combo={sortCombo} miss={sortMiss} difficulty={difficulty} />}
            {activeJobId === "delivery" && <DeliveryGame lane={runnerLane} obstacles={runnerObstacles} coins={runnerCoins} distance={runnerDistance} flash={runnerHitFlash} miss={runnerMiss} />}
            {activeJobId === "cashier" && <CashierGame sequence={cashierSequence} currentIndex={cashierIndex} success={cashierSuccess} miss={cashierMiss} />}
            {activeJobId === "cafe" && <CafeGame fill={cafeFill} targetStart={cafeTargetStart} targetEnd={cafeTargetEnd} success={cafeSuccess} miss={cafeMiss} holding={cafeHolding} difficulty={difficulty} />}
            {activeJobId === "security" && <SecurityGame signal={securitySignal} success={securitySuccess} miss={securityMiss} round={securityRound} />}
          </section>

          <footer style={jobFooterStyle}>
            <div style={messageBoxStyle}>{message}</div>
            <div style={controlHintStyle}>{getControlHint(activeJobId)}</div>
          </footer>
        </section>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={worldLayoutStyle}>
        <header style={worldHeaderStyle}>
          <div style={profileAreaStyle}>
            <div style={smallLabelStyle}>ALBA MONEY GAME</div>
            <h1 style={mainTitleStyle}>{nickname}의 하루</h1>
            <div style={nicknameEditStyle}>
              <input
                value={nicknameDraft}
                onChange={(event) => setNicknameDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") saveNickname();
                }}
                maxLength={12}
                placeholder="닉네임 입력"
                style={nicknameInputStyle}
              />
              <button onClick={saveNickname} style={smallActionButtonStyle}>닉네임 변경</button>
            </div>
          </div>

          <div style={moneyPanelStyle}>
            <StatusPill label="현금" value={`${cash.toLocaleString()}원`} />
            <StatusPill label="세율" value={`${(taxRate * 100).toFixed(0)}%`} />
            <StatusPill label="다음 세금" value={`${nextTax.toLocaleString()}원`} />
            <StatusPill label="미납" value={`${unpaidTax.toLocaleString()}원`} />
            <StatusPill label="경고" value={`${warningCount}장`} />
            <StatusPill label="저장" value={isSaving ? "저장 중" : saveMessage} warning={saveMessage.includes("실패")} />
          </div>
        </header>

        <section style={worldBodyStyle}>
          {lobbyView === "room" && (
            <div style={roomSceneStyle}>
              <div style={roomMoneyStyle}>◎ {cash.toLocaleString()}</div>
              <div style={roomInfoTextStyle}>
                <strong style={roomInfoNameStyle}>{nickname}</strong>
                <span style={roomInfoLineStyle}>직업 {occupation.name}</span>
                <span style={roomInfoLineStyle}>세금까지 {formatTime(taxCountdown)}</span>
              </div>
              <RoomArtwork roomKind={roomKind} nickname={nickname} occupationName={occupation.name} />
              <div style={hiddenLegacySceneStyle}>
                <div style={roomFloorStyle} />
                <div style={roomWindowStyle} />
                <div style={roomSofaStyle} />
                <div style={roomDeskStyle} />
                <div style={roomTvStyle} />
                <div style={roomCharacterStyle} />
              </div>
              <div style={roomSideControlsStyle}>
                <button onClick={() => setLobbyView("ranking")} style={trophyButtonStyle}>🏆</button>
              </div>
              <div style={roomNavStyle}>
                <button onClick={() => setLobbyView("jobs")} style={bottomNavButtonStyle}>알바 가기</button>
                <button onClick={() => setLobbyView("street")} style={bottomNavButtonStyle}>길거리</button>
              </div>
            </div>
          )}

          {lobbyView === "street" && (
            <div style={streetSceneStyle}>
              <div style={streetMoneyStyle}>◎ {cash.toLocaleString()}</div>
              <StreetArtwork />

              <div style={streetPageInfoStyle}>
                <div style={smallLabelStyle}>STREET MAP</div>
                <strong>{streetPage + 1} / {streetBuildingPages.length} 구역</strong>
                <span>{getStreetPageLabel(streetPage)}</span>
              </div>

              <button
                onClick={() => setStreetPage((page) => Math.max(0, page - 1))}
                disabled={streetPage === 0}
                style={{ ...streetPageArrowStyle, left: "14px", opacity: streetPage === 0 ? 0.45 : 1 }}
              >
                ◀
              </button>
              <button
                onClick={() => setStreetPage((page) => Math.min(streetBuildingPages.length - 1, page + 1))}
                disabled={streetPage === streetBuildingPages.length - 1}
                style={{ ...streetPageArrowStyle, right: "14px", opacity: streetPage === streetBuildingPages.length - 1 ? 0.45 : 1 }}
              >
                ▶
              </button>

              <div style={streetBuildingsRowStyle}>
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
              <div style={streetBottomNavStyle}>
                <button onClick={() => setLobbyView("room")} style={bottomNavButtonStyle}>방으로 돌아가기</button>
              </div>
            </div>
          )}

          {lobbyView === "jobs" && (
            <div style={panelSceneStyle}>
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>JOB OFFICE</div>
                  <h2 style={panelTitleStyle}>알바 가기</h2>
                  <p style={panelDescStyle}>단기 알바를 선택해서 바로 돈을 벌 수 있습니다.</p>
                </div>
                <button onClick={() => setLobbyView("room")} style={smallActionButtonStyle}>방으로</button>
              </div>

              <section style={jobGridStyle}>
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
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>CAREER OFFICE</div>
                  <h2 style={panelTitleStyle}>{getCareerBuildingName(careerBuildingId)}</h2>
                  <p style={panelDescStyle}>
                    조건을 만족하고 직업 테스트를 클리어하면 직업을 얻거나 승급할 수 있습니다. 현재 직업: {occupation.icon} {occupation.name} · 직업 수입까지 {formatTime(careerIncomeCountdown)}
                  </p>
                </div>
                <button onClick={() => setLobbyView("street")} style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div style={careerCardGridStyle}>
                {careerList
                  .filter((careerId) => occupationInfo[careerId].buildingId === careerBuildingId)
                  .map((careerId) => {
                    const career = occupationInfo[careerId];
                    const unlocked = unlockedOccupations.includes(careerId);
                    const available = canChallengeOccupation(careerId);
                    const selected = occupationId === careerId;

                    return (
                      <button key={careerId} onClick={() => challengeOccupation(careerId)} style={{ ...careerCardStyle, opacity: available || unlocked ? 1 : 0.58, border: selected ? "4px solid #38bdf8" : "4px solid #111827" }}>
                        <div style={careerTopLineStyle}>
                          <span style={careerIconStyle}>{career.icon}</span>
                          <span style={careerGradeStyle}>{career.grade}</span>
                        </div>
                        <h3 style={careerNameStyle}>{career.name}</h3>
                        <p style={careerDescStyle}>{career.description}</p>
                        <p style={careerIncomeStyle}>{career.salaryText}</p>
                        <p style={careerConditionStyle}>조건: {career.conditionText}</p>
                        <p style={careerConditionStyle}>테스트: {career.minigameName} · 난이도 {career.minigameDifficulty}</p>
                        <div style={careerButtonLikeStyle}>{selected ? "현재 직업" : unlocked ? "직업 장착" : available ? "테스트 도전" : "조건 미달"}</div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}

          {lobbyView === "housing" && (
            <div style={panelSceneStyle}>
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>BUILDING OFFICE</div>
                  <h2 style={panelTitleStyle}>건물 사무소</h2>
                  <p style={panelDescStyle}>메인 화면으로 사용할 방 분위기를 변경합니다. 돈은 차감하지 않습니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div style={roomSelectGridStyle}>
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
            <div style={panelSceneStyle}>
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>CITY HALL</div>
                  <h2 style={panelTitleStyle}>구청 세금 확인</h2>
                  <p style={panelDescStyle}>현재 납부해야 할 세금과 미납 경고를 확인합니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div style={taxCardStyle}>
                <StatusPill label="현재 현금" value={`${cash.toLocaleString()}원`} />
                <StatusPill label="적용 세율" value={`${(taxRate * 100).toFixed(0)}%`} />
                <StatusPill label="예정 세금" value={`${Math.floor(cash * taxRate).toLocaleString()}원`} />
                <StatusPill label="미납 세금" value={`${unpaidTax.toLocaleString()}원`} warning={unpaidTax > 0} />
                <StatusPill label="총 납부 예정" value={`${nextTax.toLocaleString()}원`} warning={nextTax > cash} />
                <StatusPill label="자동 납부까지" value={formatTime(taxCountdown)} warning={taxCountdown <= TAX_WARNING_SECONDS} />
                <StatusPill label="경고장" value={`${warningCount}/3장`} warning={warningCount > 0} />
              </div>

              <div style={taxNoticeStyle}>
                자동 납부 시점에 현금이 부족하면 경고장이 발급됩니다. 경고 3회가 되면 현금 일부가 압류됩니다.
              </div>
            </div>
          )}

          {lobbyView === "stocks" && (
            <div style={stockExchangeSceneStyle}>
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>STOCK EXCHANGE</div>
                  <h2 style={panelTitleStyle}>주식 거래소</h2>
                  <p style={panelDescStyle}>3분마다 가격이 변동됩니다. 다음 변동까지 <strong>{formatStockCountdown(stockCountdownMs)}</strong> · 마지막 변동: {stockUpdatedAt.toLocaleTimeString()}</p>
                </div>
                <button onClick={() => setLobbyView("street")} style={smallActionButtonStyle}>길거리로</button>
              </div>


              <div style={stockBoardStyle}>
                {stockRows.map((stock) => {
                  const diff = stock.price - stock.previousPrice;
                  const percent = stock.previousPrice > 0 ? (diff / stock.previousPrice) * 100 : 0;
                  const isUp = diff >= 0;

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
                        <div>
                          <div style={stockPriceStyle}>{stock.price.toLocaleString()}원</div>
                          <div style={stockOwnedStyle}>보유 {stock.owned}주 · 평가 {(stock.owned * stock.price).toLocaleString()}원</div>
                        </div>
                        <div style={stockActionGroupStyle}>
                          <button onClick={() => buyStock(stock.id)} disabled={cash < stock.price} style={{ ...stockTradeButtonStyle, opacity: cash < stock.price ? 0.45 : 1 }}>매수</button>
                          <button onClick={() => sellStock(stock.id)} disabled={stock.owned <= 0} style={{ ...stockTradeButtonStyle, opacity: stock.owned <= 0 ? 0.45 : 1 }}>매도</button>
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
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>CASINO</div>
                  <h2 style={panelTitleStyle}>도박장</h2>
                  <p style={panelDescStyle}>게임머니 전용 콘텐츠입니다. 슬롯 머신과 유저 대전을 진행할 수 있습니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} style={smallActionButtonStyle}>길거리로</button>
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
            <div style={panelSceneStyle}>
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>BANK</div>
                  <h2 style={panelTitleStyle}>은행</h2>
                  <p style={panelDescStyle}>예금은 5분마다 0.3% 이자가 붙고, 대출은 5분마다 1.2% 이자가 붙습니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div style={economySummaryGridStyle}>
                <StatusPill label="현금" value={`${cash.toLocaleString()}원`} />
                <StatusPill label="예금" value={`${bankDeposit.toLocaleString()}원`} />
                <StatusPill label="대출" value={`${bankLoan.toLocaleString()}원`} warning={bankLoan > 0} />
                <StatusPill label="신용점수" value={`${creditScore}점`} warning={creditScore < 600} />
                <StatusPill label="대출한도" value={`${getLoanLimit(creditScore, netWorth).toLocaleString()}원`} />
                <StatusPill label="순자산" value={`${netWorth.toLocaleString()}원`} warning={netWorth < 0} />
              </div>

              <div style={economyActionPanelStyle}>
                <input type="number" value={bankInput} min={100} step={1000} onChange={(event) => setBankInput(event.target.value)} style={casinoInputStyle} />
                <div style={economyButtonRowStyle}>
                  <button onClick={depositToBank} style={casinoPrimaryButtonStyle}>예금</button>
                  <button onClick={withdrawFromBank} style={casinoSmallButtonStyle}>출금</button>
                  <button onClick={borrowFromBank} style={casinoSmallButtonStyle}>대출</button>
                  <button onClick={repayBankLoan} style={casinoSmallButtonStyle}>상환</button>
                </div>
              </div>
            </div>
          )}

          {lobbyView === "estate" && (
            <div style={panelSceneStyle}>
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>REAL ESTATE</div>
                  <h2 style={panelTitleStyle}>부동산</h2>
                  <p style={panelDescStyle}>부동산을 구매하면 5분마다 임대 수익이 들어오고 순자산 랭킹에 반영됩니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} style={smallActionButtonStyle}>길거리로</button>
              </div>
              <div style={economyCardGridStyle}>
                {estateItems.map((estate) => {
                  const owned = ownedEstates.includes(estate.id);
                  return (
                    <div key={estate.id} style={economyCardStyle}>
                      <h3 style={economyCardTitleStyle}>{estate.icon} {estate.name}</h3>
                      <p style={economyCardTextStyle}>{estate.description}</p>
                      <strong>가격 {estate.price.toLocaleString()}원</strong>
                      <strong style={{ color: "#16a34a" }}>5분 수익 +{estate.incomeEvery5Min.toLocaleString()}원</strong>
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
            <div style={panelSceneStyle}>
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>BUSINESS CENTER</div>
                  <h2 style={panelTitleStyle}>창업 센터</h2>
                  <p style={panelDescStyle}>알바와 직업 경험을 사업으로 확장합니다. 사업은 5분마다 매출을 만듭니다.</p>
                </div>
                <button onClick={() => setLobbyView("street")} style={smallActionButtonStyle}>길거리로</button>
              </div>
              <div style={economyCardGridStyle}>
                {businessItems.map((business) => {
                  const owned = ownedBusinesses.includes(business.id);
                  const requiredOk = !business.requiredOccupation || unlockedOccupations.includes(business.requiredOccupation);
                  return (
                    <div key={business.id} style={economyCardStyle}>
                      <h3 style={economyCardTitleStyle}>{business.icon} {business.name}</h3>
                      <p style={economyCardTextStyle}>{business.description}</p>
                      <strong>창업 비용 {business.price.toLocaleString()}원</strong>
                      <strong style={{ color: "#16a34a" }}>5분 매출 +{business.incomeEvery5Min.toLocaleString()}원</strong>
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
            <div style={panelSceneStyle}>
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>ECONOMY NEWS</div>
                  <h2 style={panelTitleStyle}>경제 뉴스</h2>
                  <p style={panelDescStyle}>5분마다 뉴스가 바뀌고 주식 시장 분위기에 작은 영향을 줍니다. 마지막 갱신: {economyUpdatedAt.toLocaleTimeString()}</p>
                </div>
                <div style={economyButtonRowStyle}>
                  <button onClick={refreshNewsNow} style={smallActionButtonStyle}>새 뉴스</button>
                  <button onClick={() => setLobbyView("street")} style={smallActionButtonStyle}>길거리로</button>
                </div>
              </div>
              <div style={economyNewsListStyle}>
                {newsEvents.map((news) => (
                  <div key={news.id} style={{ ...economyNewsCardStyle, borderColor: news.tone === "good" ? "#16a34a" : news.tone === "bad" ? "#dc2626" : "#111827" }}>
                    <h3 style={economyCardTitleStyle}>{news.tone === "good" ? "📈" : news.tone === "bad" ? "📉" : "📰"} {news.title}</h3>
                    <p style={economyCardTextStyle}>{news.effect}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lobbyView === "ranking" && (
            <div style={panelSceneStyle}>
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>RANKING</div>
                  <h2 style={panelTitleStyle}>랭킹</h2>
                  <p style={panelDescStyle}>프로필이 생성된 계정 중 순자산 기준 상위 10명이 표시됩니다. 다른 유저는 저장된 현금 기준, 내 계정은 주식/예금/부동산/사업까지 반영됩니다. 마지막 갱신: {rankingUpdatedAt.toLocaleTimeString()}</p>
                </div>
                <button onClick={() => setLobbyView("room")} style={smallActionButtonStyle}>방으로</button>
              </div>

              <div style={rankingTableStyle}>
                {rankingRows.map((row) => (
                  <div key={`${row.rank}-${row.nickname}`} style={{ ...rankingRowStyle, borderColor: row.isMe ? "#38bdf8" : "rgba(255,255,255,0.14)", background: row.isMe ? "rgba(56,189,248,0.16)" : "rgba(255,255,255,0.06)" }}>
                    <strong>{row.rank}위</strong>
                    <span>{row.isMe ? "👤 " : ""}{row.nickname}</span>
                    <span>{row.job}</span>
                    <strong>{`${row.cash.toLocaleString()}원`}</strong>
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

      {careerMiniGame && (
        <div style={careerMiniGameOverlayStyle}>
          <div style={careerMiniGameBoxStyle}>
            <div style={smallLabelStyle}>CAREER TEST</div>
            <h2 style={panelTitleStyle}>{careerMiniGame.icon} {careerMiniGame.name} 실무 테스트</h2>
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
                <div style={careerMiniGameSubTextStyle}>키보드로도 입력할 수 있습니다. 현재 키: {careerKeySequence[careerKeyIndex] ?? "완료"}</div>
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
                  <button onClick={() => setCareerLogisticsColumn((current) => Math.max(0, current - 1))} style={smallActionButtonStyle}>왼쪽</button>
                  <button onClick={() => void placeCareerLogisticsBlock()} style={bigStartButtonStyle}>블록 내리기</button>
                  <button onClick={() => setCareerLogisticsColumn((current) => Math.min(5, current + 1))} style={smallActionButtonStyle}>오른쪽</button>
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


function RoomArtwork({ roomKind, nickname, occupationName }: { roomKind: RoomKind; nickname: string; occupationName: string }) {
  const accent = roomKind === "office" ? "#60a5fa" : roomKind === "studio" ? "#f59e0b" : "#22c55e";
  const characterLabel = `${nickname} · ${occupationName}`;
  const shortCharacterLabel = characterLabel.length > 16 ? `${characterLabel.slice(0, 15)}…` : characterLabel;

  return (
    <svg style={sceneSvgStyle} viewBox="0 0 1600 760" preserveAspectRatio="none" role="img" aria-label="메인 방 일러스트">
      <defs>
        <linearGradient id="roomWallGradient" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="58%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
        <linearGradient id="roomFloorGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <filter id="softRoomShadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="#0f172a" floodOpacity="0.22" />
        </filter>
      </defs>

      <rect x="0" y="0" width="1600" height="760" fill="url(#roomWallGradient)" />
      <polygon points="0,520 1600,520 1600,760 0,760" fill="url(#roomFloorGradient)" />
      <path d="M115 112 L360 170 L360 520" fill="none" stroke="#111827" strokeWidth="5" />
      <path d="M1485 112 L1240 170 L1240 520" fill="none" stroke="#111827" strokeWidth="5" />
      <path d="M360 170 L1240 170" fill="none" stroke="#111827" strokeWidth="5" />
      <path d="M0 520 L360 520" fill="none" stroke="#111827" strokeWidth="5" />
      <path d="M1240 520 L1600 520" fill="none" stroke="#111827" strokeWidth="5" />

      <text x="800" y="82" textAnchor="middle" fill="#111827" fontSize="52" fontWeight="900">{roomInfo[roomKind].floor}</text>

      <g filter="url(#softRoomShadow)">
        <rect x="610" y="130" width="380" height="145" rx="10" fill="#dbeafe" stroke="#111827" strokeWidth="6" />
        <line x1="800" y1="130" x2="800" y2="275" stroke="#111827" strokeWidth="4" />
        <path d="M635 245 C700 190 750 210 795 245 C845 198 900 205 965 245" fill="none" stroke="#93c5fd" strokeWidth="7" strokeLinecap="round" />
        <rect x="622" y="142" width="356" height="121" fill="none" stroke="#ffffff" strokeWidth="4" />
      </g>

      <g filter="url(#softRoomShadow)">
        <rect x="92" y="418" width="330" height="128" rx="28" fill="#ffffff" stroke="#111827" strokeWidth="8" />
        <rect x="125" y="362" width="230" height="88" rx="22" fill="#f8fafc" stroke="#111827" strokeWidth="8" />
        <rect x="150" y="378" width="82" height="48" rx="12" fill="#e2e8f0" stroke="#111827" strokeWidth="5" />
        <rect x="245" y="378" width="82" height="48" rx="12" fill="#e2e8f0" stroke="#111827" strokeWidth="5" />
        <line x1="112" y1="546" x2="88" y2="610" stroke="#111827" strokeWidth="7" />
        <line x1="390" y1="546" x2="424" y2="610" stroke="#111827" strokeWidth="7" />
      </g>

      <g filter="url(#softRoomShadow)">
        <rect x="610" y="455" width="640" height="108" rx="12" fill="#ffffff" stroke="#111827" strokeWidth="8" />
        <rect x="650" y="478" width="145" height="62" rx="6" fill="#e2e8f0" stroke="#111827" strokeWidth="5" />
        <rect x="840" y="478" width="145" height="62" rx="6" fill="#e2e8f0" stroke="#111827" strokeWidth="5" />
        <rect x="1030" y="478" width="145" height="62" rx="6" fill="#e2e8f0" stroke="#111827" strokeWidth="5" />
        <rect x="706" y="352" width="106" height="132" rx="12" fill="#f8fafc" stroke="#111827" strokeWidth="7" transform="rotate(-8 759 418)" />
        <rect x="906" y="390" width="92" height="72" rx="12" fill={accent} stroke="#111827" strokeWidth="7" />
        <rect x="918" y="402" width="68" height="48" rx="8" fill="#ffffff" opacity="0.72" />
      </g>

      <g filter="url(#softRoomShadow)">
        <rect x="1310" y="342" width="145" height="110" rx="16" fill="#f8fafc" stroke="#111827" strokeWidth="8" />
        <rect x="1328" y="360" width="109" height="74" rx="10" fill="#0f172a" />
        <circle cx="1382" cy="397" r="20" fill={accent} opacity="0.85" />
        <line x1="1360" y1="333" x2="1330" y2="296" stroke="#111827" strokeWidth="5" />
        <line x1="1406" y1="333" x2="1438" y2="296" stroke="#111827" strokeWidth="5" />
      </g>

      <g filter="url(#softRoomShadow)">
        <circle cx="800" cy="428" r="64" fill="#ffffff" stroke="#111827" strokeWidth="8" />
        <circle cx="778" cy="420" r="5" fill="#111827" />
        <circle cx="824" cy="420" r="5" fill="#111827" />
        <path d="M787 443 Q800 454 814 443" fill="none" stroke="#111827" strokeWidth="5" strokeLinecap="round" />
        <path d="M800 492 L800 575" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
        <path d="M800 522 L738 560" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
        <path d="M800 522 L862 560" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
        <path d="M800 575 L760 640" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
        <path d="M800 575 L840 640" stroke="#111827" strokeWidth="8" strokeLinecap="round" />
        <rect x="632" y="292" width="336" height="52" rx="26" fill="#ffffff" stroke="#111827" strokeWidth="5" />
        <text x="800" y="326" textAnchor="middle" fill="#111827" fontSize="20" fontWeight="900">{shortCharacterLabel}</text>
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

function StreetBuildingFacade({ building }: { building: { id: StreetBuildingId; title: string; subtitle: string; emoji: string } }) {
  return (
    <>
      <div style={streetFacadeCanvasStyle}>
        <StreetBuildingIllustration id={building.id} />
      </div>
      <div style={streetBuildingSignStyle}>{building.title}</div>
      <div style={streetBuildingSubtitleStyle}>{building.subtitle}</div>
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

function CashierGame({ sequence, currentIndex, success, miss }: { sequence: string[]; currentIndex: number; success: number; miss: number }) {
  return (
    <div style={centerGameStyle}>
      <div style={cashierPanelStyle}>
        <div style={miniGameTopInfoStyle}><strong>계산 {success}회</strong><strong>실수 {miss}/3</strong></div>
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
  return "레저 · 카지노 지구";
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
    if (buildingId === "casino") return { left: "39%", bottom: "132px", width: "22%" };
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

function makeNewsEvents() {
  const shuffled = [...newsPool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

function applyNewsToStocks(rows: StockRow[], events: NewsEvent[]) {
  if (rows.length === 0) return rows;
  const positive = events.filter((event) => event.tone === "good").length;
  const negative = events.filter((event) => event.tone === "bad").length;
  const bias = Math.max(-0.025, Math.min(0.025, (positive - negative) * 0.008));

  return rows.map((stock) => {
    const randomMove = (Math.random() - 0.5) * 0.035 + bias;
    const nextPrice = Math.max(100, Math.round(stock.price * (1 + randomMove)));
    return {
      ...stock,
      previousPrice: stock.price,
      price: nextPrice,
      history: [...stock.history.slice(-23), nextPrice],
    };
  });
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
function StatusPill({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
  return (
    <div style={{ ...statusPillStyle, borderColor: warning ? "#f97316" : "#111827", color: warning ? "#9a3412" : "#111827" }}>
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

function calculateTax(cash: number, unpaidTax: number) {
  return Math.floor(cash * getTaxRate(cash)) + unpaidTax;
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
      cash,
      job,
      hasSave: true,
      isMe: true,
    },
  ];
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
    const history = Array.isArray(saved.history) && saved.history.length > 0
      ? saved.history.map((value) => Math.max(100, Math.round(Number(value) || price))).slice(-24)
      : [previousPrice, price];

    return {
      ...company,
      price,
      previousPrice,
      owned,
      history,
    };
  });
}

function applyElapsedStockUpdates(rows: StockRow[], updatedAt: Date) {
  const elapsedCount = Math.floor(Math.max(0, Date.now() - updatedAt.getTime()) / STOCK_INTERVAL_MS);
  let nextRows = rows;

  for (let index = 0; index < Math.min(elapsedCount, 24); index += 1) {
    nextRows = updateStockMarket(nextRows);
  }

  return {
    rows: nextRows,
    updatedAt: elapsedCount > 0 ? new Date() : updatedAt,
  };
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

function updateStockMarket(rows: StockRow[]): StockRow[] {
  return rows.map((stock) => {
    const direction = Math.random() < 0.52 ? 1 : -1;
    const percent = Math.random() * 10;
    const nextPrice = Math.max(100, Math.round(stock.price * (1 + direction * percent / 100)));

    return {
      ...stock,
      previousPrice: stock.price,
      price: nextPrice,
      history: [...stock.history, nextPrice].slice(-24),
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
  overflow: "hidden",
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
  top: "52px",
  left: "12px",
  width: "210px",
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
  gap: "4px",
  overflow: "hidden",
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
  gridTemplateColumns: "repeat(2, 170px)",
  gap: "10px",
  zIndex: 5,
};

const bottomNavButtonStyle: CSSProperties = {
  border: "4px solid #111827",
  borderRadius: "4px",
  background: "#ffffff",
  color: "#111827",
  padding: "12px 18px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "3px 3px 0 #111827",
  fontSize: "16px",
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
  overflow: "hidden",
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
  overflow: "hidden",
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
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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



const careerCardStyle: CSSProperties = {
  minWidth: 0,
  minHeight: "320px",
  borderRadius: "18px",
  padding: "16px",
  background: "#ffffff",
  color: "#111827",
  textAlign: "left",
  cursor: "pointer",
  overflow: "auto",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  boxShadow: "5px 5px 0 rgba(17,24,39,0.16)",
};

const careerIconStyle: CSSProperties = {
  fontSize: "42px",
  marginBottom: "10px",
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
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
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
  gridTemplateRows: "auto 240px 76px",
  gap: "14px",
  minWidth: 0,
  minHeight: "430px",
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
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "12px",
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
  display: "flex",
  gap: "8px",
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
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: "10px",
  overflow: "hidden",
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

const streetBuildingRoofStyle: CSSProperties = {
  width: "48px",
  height: "34px",
  border: "4px solid #111827",
  borderRadius: "16px",
  background: "rgba(255,255,255,0.88)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  justifySelf: "center",
  fontSize: "24px",
  boxShadow: "3px 3px 0 rgba(17,24,39,0.16)",
};

const streetBuildingWindowGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "6px",
  alignContent: "start",
  padding: "4px 12px",
};

const streetBuildingWindowStyle: CSSProperties = {
  height: "16px",
  borderRadius: "7px",
  background: "rgba(255,255,255,0.64)",
  border: "2px solid rgba(255,255,255,0.82)",
  boxShadow: "inset 0 -3px 0 rgba(15,23,42,0.08)",
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

const careerOfficeStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr)",
  gap: "14px",
  background: "linear-gradient(180deg, #f8fafc, #e0f2fe)",
  border: "4px solid #111827",
  borderRadius: "28px",
  padding: "22px",
  overflow: "hidden",
  color: "#0f172a",
};

const careerCardGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: "14px",
  overflowY: "auto",
  paddingRight: "8px",
};

const careerTopLineStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10px",
};

const careerGradeStyle: CSSProperties = {
  color: "#2563eb",
  fontWeight: 900,
  letterSpacing: "0.08em",
  fontSize: "13px",
};

const careerNameStyle: CSSProperties = {
  margin: "8px 0 6px",
  fontSize: "25px",
  fontWeight: 900,
  color: "#0f172a",
};

const careerDescStyle: CSSProperties = {
  margin: "0 0 10px",
  color: "#334155",
  fontWeight: 800,
  lineHeight: 1.35,
};

const careerIncomeStyle: CSSProperties = {
  color: "#16a34a",
  fontWeight: 900,
  fontSize: "17px",
};

const careerConditionStyle: CSSProperties = {
  margin: "5px 0",
  color: "#475569",
  fontWeight: 800,
  fontSize: "14px",
};

const careerButtonLikeStyle: CSSProperties = {
  marginTop: "12px",
  border: "3px solid #111827",
  borderRadius: "14px",
  background: "#fef3c7",
  color: "#111827",
  padding: "11px",
  fontWeight: 900,
  fontSize: "16px",
  textAlign: "center",
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
  gap: "14px",
  overflowY: "auto",
  background: "linear-gradient(180deg, #fff8e8 0%, #ffefcf 100%)",
  border: "4px solid #111827",
  borderRadius: "28px",
  padding: "18px",
  color: "#111827",
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
  background: "rgba(255,255,255,0.94)",
  border: "4px solid #111827",
  borderRadius: "22px",
  padding: "16px",
  boxShadow: "0 8px 0 rgba(15,23,42,0.14)",
  display: "grid",
  gap: "12px",
  overflow: "visible",
  alignContent: "start",
};

const casinoListCardStyle: CSSProperties = {
  background: "rgba(255,255,255,0.94)",
  border: "4px solid #111827",
  borderRadius: "22px",
  padding: "14px",
  boxShadow: "0 8px 0 rgba(15,23,42,0.14)",
  overflowY: "auto",
  maxHeight: "280px",
};

const casinoCardHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: 0,
};

const casinoIconStyle: CSSProperties = {
  width: "58px",
  height: "58px",
  border: "4px solid #111827",
  borderRadius: "18px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "30px",
  background: "#fef3c7",
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
  background: "#facc15",
  color: "#111827",
  padding: "12px 16px",
  fontSize: "17px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 5px 0 rgba(15,23,42,0.18)",
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
  border: "4px solid #111827",
  borderRadius: "24px",
  background: "linear-gradient(180deg, #1f2937, #111827)",
  color: "#f8fafc",
  padding: "14px",
  display: "grid",
  gap: "12px",
  boxShadow: "inset 0 0 0 3px rgba(250,204,21,0.22), 0 8px 0 rgba(15,23,42,0.2)",
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





