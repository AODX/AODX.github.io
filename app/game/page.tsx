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
};

type LobbyView = "room" | "street" | "jobs" | "housing" | "tax" | "career" | "ranking";
type RoomKind = "basic" | "studio" | "office";
type OccupationId = "unemployed" | "officeWorker" | "singer" | "developer" | "buildingOwner";

type Occupation = {
  id: OccupationId;
  name: string;
  icon: string;
  description: string;
  conditionText: string;
  salaryText: string;
};

type RankingRow = {
  rank: number;
  nickname: string;
  cash: number;
  job: string;
  isMe?: boolean;
};

type ProfileRow = {
  id: string;
  nickname: string | null;
  room_kind: string | null;
  occupation_id: string | null;
};

type RankingSaveRow = {
  user_id: string;
  cash: number | string;
};

const PROFILE_TABLE = "game_profiles";
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
    name: "백수",
    icon: "🧍",
    description: "아직 정식 직업이 없습니다. 알바로 돈을 모으고 조건을 달성해보세요.",
    conditionText: "기본 상태",
    salaryText: "월급 없음",
  },
  officeWorker: {
    id: "officeWorker",
    name: "일반 회사원",
    icon: "💼",
    description: "안정적인 월급을 받는 직업입니다. 기본적인 생활 기반이 필요합니다.",
    conditionText: "현금 50,000원 이상",
    salaryText: "추후 월급 시스템 연결 가능",
  },
  singer: {
    id: "singer",
    name: "가수",
    icon: "🎤",
    description: "무대에 서는 직업입니다. 인지도와 준비 자금이 필요합니다.",
    conditionText: "현금 100,000원 이상 + 넓은 원룸 이상",
    salaryText: "추후 공연 미션 연결 가능",
  },
  developer: {
    id: "developer",
    name: "개발자",
    icon: "💻",
    description: "작업실에서 프로젝트를 만드는 직업입니다.",
    conditionText: "작업실 방 보유 + 현금 150,000원 이상",
    salaryText: "추후 프로젝트 보상 연결 가능",
  },
  buildingOwner: {
    id: "buildingOwner",
    name: "건물주",
    icon: "🏢",
    description: "주거 지역과 자산 조건을 크게 올린 최종 목표형 직업입니다.",
    conditionText: "작업실 방 보유 + 현금 1,000,000원 이상",
    salaryText: "추후 임대 수익 연결 가능",
  },
};

const careerList: OccupationId[] = ["officeWorker", "singer", "developer", "buildingOwner"];

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
  const [nickname, setNickname] = useState("우리집");
  const [nicknameDraft, setNicknameDraft] = useState("우리집");
  const [roomKind, setRoomKind] = useState<RoomKind>("basic");
  const [occupationId, setOccupationId] = useState<OccupationId>("unemployed");
  const [rankingRows, setRankingRows] = useState<RankingRow[]>([]);
  const [rankingUpdatedAt, setRankingUpdatedAt] = useState(new Date());

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
  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId) ?? jobs[0], [selectedJobId]);
  const activeJob = useMemo(() => (activeJobId ? jobs.find((job) => job.id === activeJobId) ?? null : null), [activeJobId]);
  const occupation = occupationInfo[occupationId];
  const taxRate = getTaxRate(cash);
  const nextTax = calculateTax(cash, unpaidTax);

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
        .select("cash, warning_count, unpaid_tax")
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

      const supabase = createClient();
      const { data, error } = await supabase
        .from(PROFILE_TABLE)
        .select("id, nickname, room_kind, occupation_id")
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
    }

    loadProfilePreferences();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    refreshRanking();
    const timer = window.setInterval(() => {
      refreshRanking();
    }, 30 * 60 * 1000);

    return () => window.clearInterval(timer);
  }, [userId]);

  useEffect(() => {
    if (lobbyView === "ranking") refreshRanking();
  }, [lobbyView]);

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
  }, [userId, isSaveLoaded, cash, warningCount, unpaidTax]);

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

  function canSelectOccupation(nextOccupationId: OccupationId) {
    if (nextOccupationId === "unemployed") return true;
    if (nextOccupationId === "officeWorker") return cash >= 50000;
    if (nextOccupationId === "singer") return cash >= 100000 && roomKind !== "basic";
    if (nextOccupationId === "developer") return cash >= 150000 && roomKind === "office";
    if (nextOccupationId === "buildingOwner") return cash >= 1000000 && roomKind === "office";
    return false;
  }

  function selectOccupation(nextOccupationId: OccupationId) {
    const nextOccupation = occupationInfo[nextOccupationId];

    if (!canSelectOccupation(nextOccupationId)) {
      setMessage(`${nextOccupation.name} 조건 미달: ${nextOccupation.conditionText}`);
      return;
    }

    setOccupationId(nextOccupationId);

    if (userId) {
      window.localStorage.setItem(`alba-money-occupation-${userId}`, nextOccupationId);
    }

    setMessage(`직업이 ${nextOccupation.icon} ${nextOccupation.name}(으)로 변경되었습니다.`);
  }

  async function saveProfilePatch(patch: Partial<{ nickname: string; room_kind: RoomKind; occupation_id: OccupationId }>) {
    if (!userId) return;

    const supabase = createClient();
    const { error } = await supabase.from(PROFILE_TABLE).upsert(
      {
        id: userId,
        nickname,
        room_kind: roomKind,
        occupation_id: occupationId,
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
    const { data: saves, error: savesError } = await supabase
      .from("game_saves")
      .select("user_id, cash")
      .order("cash", { ascending: false })
      .limit(50);

    if (savesError || !saves || saves.length === 0) {
      if (savesError) console.warn("랭킹 저장 데이터 불러오기 실패:", savesError.message);
      setRankingRows(fallbackRows);
      setRankingUpdatedAt(new Date());
      return;
    }

    const ids = saves.map((row) => row.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from(PROFILE_TABLE)
      .select("id, nickname, room_kind, occupation_id")
      .in("id", ids);

    if (profilesError) {
      console.warn("랭킹 프로필 불러오기 실패:", profilesError.message);
    }

    const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile as ProfileRow]));

    const rows = (saves as RankingSaveRow[]).map((save, index) => {
      const profile = profileMap.get(save.user_id);
      const profileOccupationId = profile?.occupation_id && profile.occupation_id in occupationInfo ? (profile.occupation_id as OccupationId) : "unemployed";
      return {
        rank: index + 1,
        nickname: save.user_id === userId ? currentNickname : profile?.nickname || "이름 없음",
        cash: Number(save.cash),
        job: save.user_id === userId ? occupationInfo[occupationId].name : occupationInfo[profileOccupationId].name,
        isMe: save.user_id === userId,
      };
    });

    setRankingRows(rows.length > 0 ? rows : fallbackRows);
    setRankingUpdatedAt(new Date());
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
              <button onClick={leaveJob} style={leaveButtonStyle}>나가기</button>
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
                <strong>{nickname}</strong><br />
                직업 {occupation.name}<br />
                세금까지 {formatTime(taxCountdown)}
              </div>
              <div style={roomFloorStyle}>{roomInfo[roomKind].floor}</div>
              <div style={roomWindowStyle} />
              <div style={roomSofaStyle} />
              <div style={roomDeskStyle} />
              <div style={roomTvStyle}>TV</div>
              <div style={roomCharacterStyle}>ㅇㅅㅇ</div>
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
              <div style={sunStyle}>☼</div>
              <button onClick={() => setLobbyView("career")} style={{ ...buildingButtonStyle, left: "4%", bottom: "34%", width: "18%", height: "34%" }}>
                🏢<br />직업 사무소
              </button>
              <button onClick={() => setLobbyView("tax")} style={{ ...buildingButtonStyle, left: "31%", bottom: "43%", width: "16%", height: "24%" }}>
                🏛️<br />구청
              </button>
              <button onClick={() => setLobbyView("housing")} style={{ ...buildingButtonStyle, right: "7%", bottom: "42%", width: "19%", height: "28%" }}>
                🏠<br />건물 사무소
              </button>
              <div style={roadStyle} />
              <div style={streetLabelStyle}>길거리</div>
              <div style={streetBottomNavStyle}>
                <button onClick={() => setLobbyView("room")} style={bottomNavButtonStyle}>돌아가기</button>
                <button style={bottomNavButtonStyle}>지도보기</button>
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
            <div style={panelSceneStyle}>
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>CAREER OFFICE</div>
                  <h2 style={panelTitleStyle}>직업 사무소</h2>
                  <p style={panelDescStyle}>조건을 만족하면 정식 직업을 가질 수 있습니다. 현재 직업: {occupation.icon} {occupation.name}</p>
                </div>
                <button onClick={() => setLobbyView("street")} style={smallActionButtonStyle}>길거리로</button>
              </div>

              <div style={careerGridStyle}>
                {careerList.map((careerId) => {
                  const career = occupationInfo[careerId];
                  const available = canSelectOccupation(careerId);
                  const selected = occupationId === careerId;

                  return (
                    <button key={careerId} onClick={() => selectOccupation(careerId)} style={{ ...careerCardStyle, opacity: available ? 1 : 0.58, border: selected ? "2px solid #38bdf8" : "1px solid rgba(255,255,255,0.14)" }}>
                      <div style={careerIconStyle}>{career.icon}</div>
                      <h3 style={jobCardTitleStyle}>{career.name}</h3>
                      <p style={jobCardTextStyle}>{career.description}</p>
                      <p style={conditionTextStyle}>조건: {career.conditionText}</p>
                      <p style={rewardTextStyle}>{available ? selected ? "현재 직업" : "선택 가능" : "조건 미달"}</p>
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

          {lobbyView === "ranking" && (
            <div style={panelSceneStyle}>
              <div style={panelHeaderRowStyle}>
                <div>
                  <div style={smallLabelStyle}>RANKING</div>
                  <h2 style={panelTitleStyle}>랭킹</h2>
                  <p style={panelDescStyle}>계정이 있는 유저만 표시됩니다. 30분마다 갱신됩니다. 마지막 갱신: {rankingUpdatedAt.toLocaleTimeString()}</p>
                </div>
                <button onClick={() => setLobbyView("room")} style={smallActionButtonStyle}>방으로</button>
              </div>

              <div style={rankingTableStyle}>
                {rankingRows.map((row) => (
                  <div key={`${row.rank}-${row.nickname}`} style={{ ...rankingRowStyle, borderColor: row.isMe ? "#38bdf8" : "rgba(255,255,255,0.14)", background: row.isMe ? "rgba(56,189,248,0.16)" : "rgba(255,255,255,0.06)" }}>
                    <strong>{row.rank}위</strong>
                    <span>{row.isMe ? "👤 " : ""}{row.nickname}</span>
                    <span>{row.job}</span>
                    <strong>{row.cash.toLocaleString()}원</strong>
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
          {sequence.map((key, index) => <div key={`${key}-${index}`} style={{ ...keyBoxStyle, background: index < currentIndex ? "#22c55e" : index === currentIndex ? "#38bdf8" : "rgba(255,255,255,0.08)", color: index <= currentIndex ? "#020617" : "white" }}>{key}</div>)}
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

function StatusPill({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
  return (
    <div style={{ ...statusPillStyle, borderColor: warning ? "#f97316" : "#111827", color: warning ? "#9a3412" : "#111827" }}>
      <span style={{ ...statusLabelStyle, color: warning ? "#c2410c" : "#64748b" }}>{label}</span>
      <strong style={{ color: warning ? "#9a3412" : "#111827" }}>{value}</strong>
    </div>
  );
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
      isMe: true,
    },
  ];
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
  gridTemplateRows: "84px minmax(0, 1fr) 54px",
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
  overflow: "hidden",
};

const nicknameEditStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  marginTop: "6px",
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

const roomSceneStyle: CSSProperties = {
  position: "relative",
  width: "100%",
  height: "100%",
  overflow: "hidden",
  background:
    "linear-gradient(115deg, transparent 0 18%, rgba(17,24,39,0.08) 18.2% 18.8%, transparent 19%), linear-gradient(245deg, transparent 0 20%, rgba(17,24,39,0.08) 20.2% 20.8%, transparent 21%), linear-gradient(180deg, #ffffff 0 66%, #f1f5f9 66% 100%)",
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
  zIndex: 5,
};

const roomInfoTextStyle: CSSProperties = {
  position: "absolute",
  top: "52px",
  left: "12px",
  fontSize: "12px",
  fontWeight: 900,
  lineHeight: 1.25,
  zIndex: 5,
};

const roomFloorStyle: CSSProperties = {
  position: "absolute",
  top: "42px",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "28px",
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
  gridTemplateColumns: "repeat(2, 150px)",
  gap: "8px",
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
    "radial-gradient(circle at 12% 20%, #fef3c7 0 7%, transparent 7.5%), linear-gradient(180deg, #ffffff 0 58%, #f1f5f9 58% 100%)",
  color: "#111827",
  borderRadius: "22px",
  border: "4px solid #111827",
  boxShadow: "0 18px 0 rgba(17,24,39,0.10), 0 24px 46px rgba(15,23,42,0.18)",
};

const streetMoneyStyle: CSSProperties = {
  position: "absolute",
  top: "8px",
  left: "12px",
  color: "#ef4444",
  fontWeight: 900,
};

const sunStyle: CSSProperties = {
  position: "absolute",
  top: "36px",
  left: "10%",
  fontSize: "78px",
  lineHeight: 1,
  filter: "drop-shadow(3px 3px 0 rgba(17,24,39,0.16))",
};

const buildingButtonStyle: CSSProperties = {
  position: "absolute",
  border: "5px solid #111827",
  borderRadius: "10px 10px 3px 3px",
  background: "linear-gradient(180deg, #ffffff 0 20%, #e5e7eb 20% 21%, #ffffff 21% 43%, #e5e7eb 43% 44%, #ffffff 44% 66%, #e5e7eb 66% 67%, #ffffff 67% 100%)",
  color: "#111827",
  fontWeight: 900,
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "7px 7px 0 rgba(17,24,39,0.16)",
};

const roadStyle: CSSProperties = {
  position: "absolute",
  left: "-10%",
  right: "-10%",
  bottom: "10%",
  height: "30%",
  borderTop: "5px solid #111827",
  borderBottom: "5px solid #111827",
  transform: "rotate(-8deg)",
  background: "linear-gradient(180deg, #ffffff 0 44%, transparent 44% 56%, #ffffff 56% 100%), repeating-linear-gradient(90deg, transparent 0 46px, #111827 46px 84px, transparent 84px 128px)",
  opacity: 0.95,
  boxShadow: "0 -6px 0 rgba(17,24,39,0.08), 0 6px 0 rgba(17,24,39,0.08)",
};

const streetLabelStyle: CSSProperties = {
  position: "absolute",
  right: "22%",
  bottom: "28%",
  background: "#ffffff",
  border: "3px solid #111827",
  borderRadius: "8px",
  padding: "6px 18px",
  fontWeight: 900,
  boxShadow: "3px 3px 0 rgba(17,24,39,0.18)",
};

const streetBottomNavStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  bottom: "12px",
  transform: "translateX(-50%)",
  display: "flex",
  gap: "8px",
};

const panelSceneStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr) auto",
  gap: "10px",
  overflow: "hidden",
  background: "#ffffff",
  color: "#111827",
  border: "4px solid #111827",
  borderRadius: "22px",
  padding: "14px",
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


const careerGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "12px",
  minHeight: 0,
  overflow: "hidden",
};

const careerCardStyle: CSSProperties = {
  minWidth: 0,
  minHeight: 0,
  borderRadius: "18px",
  padding: "16px",
  background: "#ffffff",
  color: "#111827",
  textAlign: "left",
  cursor: "pointer",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  boxShadow: "5px 5px 0 rgba(17,24,39,0.16)",
};

const careerIconStyle: CSSProperties = {
  fontSize: "42px",
  marginBottom: "10px",
};

const conditionTextStyle: CSSProperties = {
  marginTop: "12px",
  color: "#92400e",
  fontWeight: 900,
  fontSize: "13px",
  lineHeight: 1.3,
};

const rankingTableStyle: CSSProperties = {
  display: "grid",
  alignContent: "start",
  gap: "8px",
  overflow: "hidden",
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
  fontSize: "34px",
  lineHeight: 1,
  whiteSpace: "nowrap",
};


const moneyPanelStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 106px)",
  gap: "6px",
  maxWidth: "672px",
  overflow: "hidden",
};

const statusPillStyle: CSSProperties = {
  background: "#ffffff",
  border: "3px solid #111827",
  borderRadius: "13px",
  padding: "6px 8px",
  minWidth: 0,
  display: "grid",
  gap: "1px",
  fontSize: "12px",
  color: "#111827",
  boxShadow: "2px 2px 0 rgba(17,24,39,0.9)",
};

const statusLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: "10px",
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
  fontSize: "18px",
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
  gap: "6px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const leaveButtonStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  borderRadius: "10px",
  padding: "9px 11px",
  fontWeight: 900,
  cursor: "pointer",
};

const difficultyBannerStyle: CSSProperties = {
  background: "rgba(250,204,21,0.16)",
  border: "1px solid rgba(250,204,21,0.5)",
  color: "#fef3c7",
  borderRadius: "10px",
  padding: "6px 10px",
  textAlign: "center",
  fontWeight: 900,
  fontSize: "13px",
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
  gap: "7px",
  alignItems: "center",
  minWidth: 0,
  overflow: "hidden",
};

const controlHintStyle: CSSProperties = {
  background: "rgba(15,23,42,0.75)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "10px",
  padding: "8px 10px",
  color: "#cbd5e1",
  fontWeight: 900,
  fontSize: "12px",
  whiteSpace: "nowrap",
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
  width: "min(720px, 90vw)",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "22px",
  padding: "22px",
  textAlign: "center",
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
  gap: "8px",
};

const keyBoxStyle: CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "13px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  fontWeight: 900,
  border: "1px solid rgba(255,255,255,0.2)",
};

const cashierHintStyle: CSSProperties = {
  marginTop: "14px",
  color: "#cbd5e1",
  fontSize: "14px",
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

const firedOverlayWrapStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
  zIndex: 50,
};

const firedStampCardStyle: CSSProperties = {
  transform: "rotate(-12deg)",
  background: "rgba(127, 29, 29, 0.10)",
  border: "6px solid rgba(248, 113, 113, 0.72)",
  borderRadius: "24px",
  padding: "28px 42px",
  textAlign: "center",
  boxShadow:
    "0 0 0 10px rgba(127, 29, 29, 0.06), 0 18px 40px rgba(0,0,0,0.28)",
  backdropFilter: "blur(2px)",
};

const firedStampTitleStyle: CSSProperties = {
  fontSize: "72px",
  fontWeight: 900,
  letterSpacing: "0.18em",
  color: "rgba(254, 202, 202, 0.88)",
  lineHeight: 1,
  textTransform: "uppercase",
  textShadow: "0 0 12px rgba(239,68,68,0.18)",
};

const firedStampReasonStyle: CSSProperties = {
  marginTop: "10px",
  fontSize: "20px",
  fontWeight: 800,
  color: "rgba(255, 228, 230, 0.92)",
  whiteSpace: "nowrap",
};



