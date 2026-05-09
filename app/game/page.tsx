"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createClient } from "@/lib/supabase/client";

type JobId = "sorting" | "delivery" | "cashier" | "cafe" | "security";
type SortKind = "red" | "blue" | "yellow" | "green" | "purple";
type SecuritySignal = "normal" | "thief" | "vip";

type Job = {
  id: JobId;
  name: string;
  subtitle: string;
  rewardText: string;
  timeLimit: number;
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

const TAX_INTERVAL_SECONDS = 600;
const TAX_WARNING_SECONDS = 60;

const jobs: Job[] = [
  {
    id: "sorting",
    name: "택배 분류 알바",
    subtitle: "흘러가는 택배를 색깔에 맞춰 분류하세요.",
    rewardText: "성공 1개당 200원",
    timeLimit: 9999,
    icon: "📦",
  },
  {
    id: "delivery",
    name: "음식 배달 알바",
    subtitle: "장애물을 피하고 배달 포인트를 지나가세요.",
    rewardText: "배달 포인트 1개당 300원",
    timeLimit: 9999,
    icon: "🛵",
  },
  {
    id: "cashier",
    name: "편의점 계산 알바",
    subtitle: "나오는 키를 순서대로 빠르게 입력하세요.",
    rewardText: "계산 성공 1회당 450원",
    timeLimit: 9999,
    icon: "🏪",
  },
  {
    id: "cafe",
    name: "카페 음료 알바",
    subtitle: "컵 모양에 맞춰 음료 양을 정확히 맞추세요.",
    rewardText: "음료 1잔당 250원",
    timeLimit: 9999,
    icon: "☕",
  },
  {
    id: "security",
    name: "보안요원 알바",
    subtitle: "수상한 사람일 때만 Space로 대응하세요.",
    rewardText: "대응 성공 1회당 200원 · VIP 차단 시 -1,000원",
    timeLimit: 9999,
    icon: "🛡️",
  },
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

  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId) ?? jobs[0], [selectedJobId]);
  const activeJob = useMemo(() => (activeJobId ? jobs.find((job) => job.id === activeJobId) ?? null : null), [activeJobId]);
  const taxRate = getTaxRate(cash);
  const nextTax = calculateTax(cash, unpaidTax);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTaxCountdown((current) => {
        if (current === TAX_WARNING_SECONDS + 1) setMessage("⚠️ 1분 후 자동으로 세금이 납부됩니다.");
        if (current <= 1) {
          setTaxTriggerCount((count) => count + 1);
          return TAX_INTERVAL_SECONDS;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (taxTriggerCount > 0) applyTaxAutomatically();
  }, [taxTriggerCount]);

  useEffect(() => {
    if (!activeJobId) return;

    const timer = window.setInterval(() => {
      setDifficulty((current) => {
        const next = Math.min(7, current + 1);
        if (next !== current) {
          setDifficultyNotice(`⚡ 난이도 상승! Lv.${next}`);
          setMessage(getDifficultyMessage(activeJobId, next));
          window.setTimeout(() => setDifficultyNotice(""), 1400);
        }
        return next;
      });
    }, 18000);

    return () => window.clearInterval(timer);
  }, [activeJobId]);

  useEffect(() => {
    if (activeJobId !== "sorting") return;

    const timer = window.setInterval(() => {
      setSortItem((current) => {
        const nextX = current.x + (0.45 + difficulty * 0.12);
        if (nextX >= 108) {
          registerSortingMistake("📦 택배가 지나갔습니다. 중앙 구역에서 맞는 번호를 누르세요.");
          setSortCombo(0);
          const nextItem = makeSortItem(difficulty, sortItemId);
          setSortItemId((id) => id + 1);
          return nextItem;
        }
        return { ...current, x: nextX };
      });
    }, 25);

    return () => window.clearInterval(timer);
  }, [activeJobId, difficulty, sortItemId]);

  useEffect(() => {
    if (activeJobId !== "delivery") return;

    const timer = window.setInterval(() => {
      const speed = 0.85 + difficulty * 0.24;

      setRunnerDistance((current) => current + 0.2 + difficulty * 0.05);

      setRunnerObstacles((current) => {
        const moved = current.map((obstacle) => ({ ...obstacle, y: obstacle.y + speed })).filter((obstacle) => obstacle.y <= 112);
        const collision = moved.some((obstacle) => obstacle.lane === runnerLane && obstacle.y >= 78 && obstacle.y <= 93);
        if (collision) {
          setRunnerHitFlash(true);
          setCash((money) => Math.max(0, money - 100));
          registerDeliveryMistake("💥 장애물 충돌! 벌금 100원.");
          window.setTimeout(() => setRunnerHitFlash(false), 250);
          return moved.filter((obstacle) => !(obstacle.lane === runnerLane && obstacle.y >= 78 && obstacle.y <= 93));
        }
        return moved;
      });

      setRunnerCoins((current) => {
        const moved = current.map((coin) => ({ ...coin, y: coin.y + speed })).filter((coin) => coin.y <= 112);
        const collected = moved.filter((coin) => coin.lane === runnerLane && coin.y >= 78 && coin.y <= 93);
        if (collected.length > 0) {
          const reward = collected.length * 300;
          setCash((money) => money + reward);
          setMessage(`🍱 배달 포인트 통과! +${reward.toLocaleString()}원`);
        }
        return moved.filter((coin) => !(coin.lane === runnerLane && coin.y >= 78 && coin.y <= 93));
      });

      if (Math.random() < 0.035 + difficulty * 0.008) {
        const objectLane = Math.floor(Math.random() * 3);
        setRunnerObstacles((current) => [...current, { id: runnerObjectId, lane: objectLane, y: -12 }]);
        setRunnerObjectId((id) => id + 1);
      }

      if (Math.random() < 0.024 + difficulty * 0.004) {
        const objectLane = Math.floor(Math.random() * 3);
        setRunnerCoins((current) => [...current, { id: runnerObjectId + 10000, lane: objectLane, y: -12 }]);
        setRunnerObjectId((id) => id + 1);
      }
    }, 25);

    return () => window.clearInterval(timer);
  }, [activeJobId, difficulty, runnerLane, runnerObjectId]);

  useEffect(() => {
    if (activeJobId !== "cafe") return;

    const timer = window.setInterval(() => {
      setCafeFill((current) => {
        if (!cafeHolding) return Math.max(0, current - 0.25);
        const next = current + 0.9 + difficulty * 0.18;
        if (next >= 100) {
          setCafeFill(0);
          setCafeHolding(false);
          registerCafeMistake("☕ 넘쳤습니다! 컵 모양이 어려워질수록 더 조심하세요.");
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
    }, Math.max(520, 1300 - difficulty * 90));

    return () => window.clearInterval(timer);
  }, [activeJobId, securitySignal, difficulty]);

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
    setMessage("📦 중앙 판정 구역에서 택배 색에 맞는 번호를 누르세요.");
  }

  function setupDeliveryJob() {
    setRunnerLane(1);
    setRunnerDistance(0);
    setRunnerObstacles([]);
    setRunnerCoins([]);
    setRunnerObjectId(1);
    setRunnerHitFlash(false);
    setRunnerMiss(0);
    setMessage("🛵 A/D로 움직이며 🍱 배달 포인트를 지나가세요. 장애물은 피하세요!");
  }

  function setupCashierJob() {
    setCashierSequence(makeCashierSequence(1));
    setCashierIndex(0);
    setCashierSuccess(0);
    setCashierMiss(0);
    setMessage("🏪 화면에 나오는 키를 순서대로 입력하세요.");
  }

  function setupCafeJob() {
    const target = makeCafeTarget(1);
    setCafeFill(0);
    setCafeHolding(false);
    setCafeSuccess(0);
    setCafeMiss(0);
    setCafeTargetStart(target.start);
    setCafeTargetEnd(target.end);
    setMessage("☕ Space를 누르고 있다가 목표 구간에서 떼세요.");
  }

  function setupSecurityJob() {
    setSecuritySignal("normal");
    setSecuritySuccess(0);
    setSecurityMiss(0);
    setSecurityRound(0);
    setMessage("🛡️ 수상한 사람일 때만 Space를 누르세요. VIP 손님을 막으면 1,000원을 물어냅니다.");
  }

  function leaveJob() {
    setActiveJobId(null);
    setCafeHolding(false);
    setDifficultyNotice("");
    setFiredStamp(null);
    setMessage("알바를 선택하고 시작하세요.");
  }

  function fireFromJob(reason: string) {
    setActiveJobId(null);
    setCafeHolding(false);
    setDifficultyNotice("");
    setFiredStamp(reason);
    setMessage(`${reason} 다시 도전하려면 알바를 새로 시작하세요.`);

    window.setTimeout(() => {
      setFiredStamp(null);
    }, 2400);
  }

  function registerSortingMistake(reason: string) {
    setSortMiss((current) => {
      const next = current + 1;
      if (next >= 3) {
        fireFromJob("📦 실수 3회! 택배 분류 알바에서 해고되었습니다.");
        return next;
      }
      setMessage(`${reason} 실수 ${next}/3`);
      return next;
    });
  }

  function registerDeliveryMistake(reason: string) {
    setRunnerMiss((current) => {
      const next = current + 1;
      if (next >= 3) {
        fireFromJob("🛵 사고 3회! 음식 배달 알바에서 해고되었습니다.");
        return next;
      }
      setMessage(`${reason} 실수 ${next}/3`);
      return next;
    });
  }

  function registerCashierMistake(reason: string) {
    setCashierMiss((current) => {
      const next = current + 1;
      if (next >= 3) {
        fireFromJob("🏪 실수 3회! 편의점 계산 알바에서 해고되었습니다.");
        return next;
      }
      setMessage(`${reason} 실수 ${next}/3`);
      return next;
    });
  }

  function registerCafeMistake(reason: string) {
    setCafeMiss((current) => {
      const next = current + 1;
      if (next >= 3) {
        fireFromJob("☕ 제조 실수 3회! 카페 음료 알바에서 해고되었습니다.");
        return next;
      }
      setMessage(`${reason} 실수 ${next}/3`);
      return next;
    });
  }

  function registerSecurityMistake(reason: string) {
    setSecurityMiss((current) => {
      const next = current + 1;
      if (next >= 3) {
        fireFromJob("🛡️ 실수 3회! 보안요원 알바에서 해고되었습니다.");
        return next;
      }
      setMessage(`${reason} 실수 ${next}/3`);
      return next;
    });
  }

  function handleSortKey(key: string) {
    const activeKinds = getActiveSortKinds(difficulty);
    if (!activeKinds.includes(sortItem.kind)) return;

    if (sortItem.x < 37 || sortItem.x > 63) {
      registerSortingMistake("📦 타이밍 실패! 중앙 판정 구역에서 눌러야 합니다.");
      setSortCombo(0);
      setSortItem(markSortFeedback(sortItem, "bad"));
      window.setTimeout(() => setSortItem(makeNextSortItem()), 180);
      return;
    }

    if (sortInfo[sortItem.kind].key !== key) {
      registerSortingMistake("📦 색깔 분류가 틀렸습니다.");
      setSortCombo(0);
      setSortItem(markSortFeedback(sortItem, "bad"));
      window.setTimeout(() => setSortItem(makeNextSortItem()), 180);
      return;
    }

    const combo = sortCombo + 1;
    const reward = 200 + Math.min(200, combo * 10);
    setCash((money) => money + reward);
    setSortCombo(combo);
    setSortItem(markSortFeedback(sortItem, "good"));
    setMessage(`✨ 분류 성공! +${reward.toLocaleString()}원 / 콤보 ${combo}`);
    window.setTimeout(() => setSortItem(makeNextSortItem()), 180);
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
      const reward = 450 + difficulty * 20;
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
      const reward = 250 + difficulty * 30;
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
      const reward = 200 + difficulty * 20;
      setCash((money) => money + reward);
      setSecuritySuccess((success) => success + 1);
      setSecuritySignal("normal");
      setMessage(`🛡️ 대응 성공! +${reward.toLocaleString()}원`);
      return;
    }

    if (securitySignal === "vip") {
      setCash((money) => Math.max(0, money - 1000));
      registerSecurityMistake("🛡️ VIP 손님을 막았습니다. 배상금 1,000원!");
      setSecuritySignal("normal");
      return;
    }

    registerSecurityMistake("🛡️ 평범한 손님을 막았습니다.");
    setSecuritySignal("normal");
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
      <section style={lobbyLayoutStyle}>
        <header style={lobbyHeaderStyle}>
          <div>
            <div style={smallLabelStyle}>ALBA MONEY GAME</div>
            <h1 style={mainTitleStyle}>알바 머니 게임</h1>
            <p style={subtitleStyle}>화면 안에서 바로 보이도록 넓게 배치했습니다. 원하는 알바를 골라 계속 돈을 벌어보세요.</p>
          </div>

          <div style={moneyPanelStyle}>
            <StatusPill label="현금" value={`${cash.toLocaleString()}원`} />
            <StatusPill label="세율" value={`${(taxRate * 100).toFixed(0)}%`} />
            <StatusPill label="다음 세금" value={`${nextTax.toLocaleString()}원`} />
            <StatusPill label="미납" value={`${unpaidTax.toLocaleString()}원`} />
            <StatusPill label="경고" value={`${warningCount}장`} />
            <StatusPill label="세금까지" value={formatTime(taxCountdown)} warning={taxCountdown <= TAX_WARNING_SECONDS} />
          </div>
        </header>

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

        <footer style={lobbyFooterStyle}>
          <div style={messageBoxStyle}>{message}</div>
          <button onClick={() => startJob(selectedJob.id)} style={bigStartButtonStyle}>{selectedJob.icon} {selectedJob.name} 시작하기</button>
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
        <strong>실수 {miss}</strong>
      </div>
      <div style={conveyorStyle}>
        <div style={sortJudgeZoneStyle}>판정 구역</div>
        <div style={{ ...sortPackageStyle, left: `${item.x}%`, filter: item.feedback === "good" ? "drop-shadow(0 0 18px #22c55e)" : item.feedback === "bad" ? "drop-shadow(0 0 18px #ef4444)" : "none", transform: item.feedback === "good" ? "translate(-50%, -50%) scale(1.25)" : item.feedback === "bad" ? "translate(-50%, -50%) rotate(-8deg)" : "translate(-50%, -50%)" }}>
          {item.feedback === "good" ? "✨" : item.feedback === "bad" ? "💥" : sortInfo[item.kind].emoji}
        </div>
      </div>
      <div style={{ ...sortBinsStyle, gridTemplateColumns: `repeat(${activeKinds.length}, 1fr)` }}>
        {activeKinds.map((kind) => <div key={kind} style={sortBinStyle}>{sortInfo[kind].key}번 {sortInfo[kind].emoji} {sortInfo[kind].label}</div>)}
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
      <div style={runnerProgressStyle}>주행 거리: {Math.floor(distance)}m · 실수 {miss}/3 · 🍱 통과 시 +300원</div>
    </div>
  );
}

function CashierGame({ sequence, currentIndex, success, miss }: { sequence: string[]; currentIndex: number; success: number; miss: number }) {
  return (
    <div style={centerGameStyle}>
      <div style={cashierPanelStyle}>
        <div style={miniGameTopInfoStyle}><strong>계산 {success}회</strong><strong>실수 {miss}</strong></div>
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
      <div style={miniGameTopInfoStyle}><strong>완성 {success}잔</strong><strong>실수 {miss}</strong></div>
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
  return (
    <div style={securityStageStyle}>
      <div style={miniGameTopInfoStyle}><strong>대응 {success}회</strong><strong>실수 {miss}</strong></div>
      <div style={securityPanelStyle}>
        <div key={round} style={securityCharacterStyle}>{character}</div>
        <div style={securityLabelStyle}>{label}</div>
        <div style={securityHintStyle}>수상한 사람일 때만 <strong>Space</strong> · VIP 차단 시 -1,000원</div>
      </div>
    </div>
  );
}

function StatusPill({ label, value, warning = false }: { label: string; value: string; warning?: boolean }) {
  return <div style={{ ...statusPillStyle, borderColor: warning ? "#f97316" : "rgba(255,255,255,0.16)", color: warning ? "#fed7aa" : "white" }}><span style={statusLabelStyle}>{label}</span><strong>{value}</strong></div>;
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
  return Array.from({ length: Math.min(18, 8 + difficulty * 2) }, () => cashierKeyPool[Math.floor(Math.random() * cashierKeyPool.length)]);
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
  const width = Math.max(7, 16 - difficulty * 1.3);
  const start = Math.floor(Math.random() * 22) + 52;
  return { start, end: start + width };
}

function makeSecuritySignal(difficulty: number): SecuritySignal {
  const random = Math.random();
  if (random < 0.28 + difficulty * 0.018) return "thief";
  if (random < 0.48) return "vip";
  return "normal";
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;
  return `${minutes}:${String(restSeconds).padStart(2, "0")}`;
}

function getDifficultyMessage(jobId: JobId, level: number) {
  if (jobId === "sorting") return `⚡ 난이도 상승! 분류 색상이 늘어나고 택배가 더 빨라집니다. Lv.${level}`;
  if (jobId === "delivery") return `⚡ 난이도 상승! 도로 속도가 빨라집니다. Lv.${level}`;
  if (jobId === "cashier") return `⚡ 난이도 상승! 계산 키가 더 길어집니다. Lv.${level}`;
  if (jobId === "cafe") return `⚡ 난이도 상승! 컵 모양이 점점 까다로워집니다. Lv.${level}`;
  return `⚡ 난이도 상승! 손님 판단 속도가 빨라집니다. Lv.${level}`;
}

function getControlHint(activeJobId: JobId | null) {
  if (activeJobId === "sorting") return "중앙 구역에서 1/2/3/4/5 입력";
  if (activeJobId === "delivery") return "A/D 또는 ←/→ 이동 · 🍱 통과";
  if (activeJobId === "cashier") return "W/A/S/D 순서 입력";
  if (activeJobId === "cafe") return "Space 누르고 있다가 떼기";
  if (activeJobId === "security") return "수상한 사람일 때만 Space";
  return "알바를 선택하세요";
}

const pageStyle: CSSProperties = {
  width: "100%",
  height: "100svh",
  maxWidth: "100%",
  maxHeight: "100svh",
  overflow: "hidden",
  position: "relative",
  isolation: "isolate",
  background:
    "radial-gradient(circle at top left, #1e3a8a 0, transparent 35%), linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e1b4b 100%)",
  color: "white",
  fontFamily: "Arial, sans-serif",
};

const lobbyLayoutStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  maxWidth: "100%",
  padding: "10px 14px",
  display: "grid",
  gridTemplateRows: "78px minmax(0, 1fr) 48px",
  gap: "10px",
  overflow: "hidden",
};

const lobbyHeaderStyle: CSSProperties = {
  minWidth: 0,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "start",
  gap: "14px",
  overflow: "hidden",
};

const smallLabelStyle: CSSProperties = {
  color: "#7dd3fc",
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

const subtitleStyle: CSSProperties = {
  margin: 0,
  color: "#dbeafe",
  fontSize: "14px",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const moneyPanelStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(6, 98px)",
  gap: "6px",
  maxWidth: "624px",
  overflow: "hidden",
};

const statusPillStyle: CSSProperties = {
  background: "rgba(15,23,42,0.78)",
  border: "1px solid rgba(255,255,255,0.18)",
  borderRadius: "11px",
  padding: "6px 8px",
  minWidth: 0,
  display: "grid",
  gap: "1px",
  fontSize: "12px",
};

const statusLabelStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: "10px",
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
  background: "rgba(255,255,255,0.10)",
  color: "white",
  textAlign: "left",
  cursor: "pointer",
  boxShadow: "0 16px 40px rgba(0,0,0,0.25)",
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
  color: "#dbeafe",
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

const lobbyFooterStyle: CSSProperties = {
  minWidth: 0,
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr) auto",
  alignItems: "stretch",
  gap: "10px",
  overflow: "hidden",
};

const messageBoxStyle: CSSProperties = {
  minHeight: "48px",
  display: "flex",
  alignItems: "center",
  background: "rgba(34,197,94,0.14)",
  border: "1px solid rgba(34,197,94,0.34)",
  borderRadius: "16px",
  padding: "10px 16px",
  color: "#ecfeff",
  lineHeight: 1.3,
  fontSize: "18px",
  fontWeight: 800,
  overflow: "hidden",
};

const bigStartButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "16px",
  background: "#67c7ff",
  color: "#020617",
  padding: "12px 20px",
  fontWeight: 900,
  fontSize: "18px",
  cursor: "pointer",
  whiteSpace: "nowrap",
  boxShadow: "0 8px 22px rgba(56,189,248,0.28)",
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
  color: "#86efac",
  fontSize: "15px",
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
  left: "37%",
  width: "26%",
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
  transition: "left 25ms linear, transform 120ms ease, filter 120ms ease",
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
  transition: "top 25ms linear",
};

const runnerCoinStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "48px",
  transition: "top 25ms linear",
  filter: "drop-shadow(0 0 12px #facc15)",
};

const runnerProgressStyle: CSSProperties = {
  textAlign: "center",
  color: "#86efac",
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
  width: "min(580px, 90vw)",
  height: "min(380px, 54svh)",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  gap: "7px",
};

const securityPanelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "22px",
};

const securityCharacterStyle: CSSProperties = {
  fontSize: "80px",
  marginBottom: "8px",
};

const securityLabelStyle: CSSProperties = {
  fontSize: "22px",
  fontWeight: 900,
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

