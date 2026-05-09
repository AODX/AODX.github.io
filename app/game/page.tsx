"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type JobId = "sorting" | "delivery" | "cashier" | "cafe" | "security";
type SortKind = "red" | "blue" | "yellow";
type SecuritySignal = "normal" | "thief" | "vip";

type Job = {
  id: JobId;
  name: string;
  subtitle: string;
  reward: number;
  timeLimit: number;
  icon: string;
};

type SortItem = {
  kind: SortKind;
  x: number;
};

type RunnerObstacle = {
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
    subtitle: "컨베이어 벨트의 택배를 알맞은 구역으로 분류하세요.",
    reward: 1800,
    timeLimit: 30,
    icon: "📦",
  },
  {
    id: "delivery",
    name: "음식 배달 알바",
    subtitle: "3차선 도로에서 장애물을 피해 배달하세요.",
    reward: 2500,
    timeLimit: 35,
    icon: "🛵",
  },
  {
    id: "cashier",
    name: "편의점 계산 알바",
    subtitle: "나오는 키를 순서대로 빠르게 입력하세요.",
    reward: 2000,
    timeLimit: 22,
    icon: "🏪",
  },
  {
    id: "cafe",
    name: "카페 음료 알바",
    subtitle: "음료 게이지를 목표 구간에 맞춰 제조하세요.",
    reward: 2300,
    timeLimit: 28,
    icon: "☕",
  },
  {
    id: "security",
    name: "보안요원 알바",
    subtitle: "수상한 사람이 나타나면 빠르게 대응하세요.",
    reward: 2600,
    timeLimit: 30,
    icon: "🛡️",
  },
];

const cashierKeyPool = ["W", "A", "S", "D"];
const sortKinds: SortKind[] = ["red", "blue", "yellow"];

const sortInfo: Record<SortKind, { label: string; emoji: string; key: string }> =
  {
    red: { label: "빨강", emoji: "🟥", key: "1" },
    blue: { label: "파랑", emoji: "🟦", key: "2" },
    yellow: { label: "노랑", emoji: "🟨", key: "3" },
  };

export default function GamePage() {
  const [cash, setCash] = useState(10000);
  const [warningCount, setWarningCount] = useState(0);
  const [unpaidTax, setUnpaidTax] = useState(0);
  const [taxCountdown, setTaxCountdown] = useState(TAX_INTERVAL_SECONDS);
  const [taxTriggerCount, setTaxTriggerCount] = useState(0);

  const [selectedJobId, setSelectedJobId] = useState<JobId>("sorting");
  const [activeJobId, setActiveJobId] = useState<JobId | null>(null);
  const [jobTimeLeft, setJobTimeLeft] = useState(0);
  const [jobFinished, setJobFinished] = useState(false);
  const [message, setMessage] = useState("알바를 선택하고 시작하세요.");

  const [sortItem, setSortItem] = useState<SortItem>({
    kind: "red",
    x: -8,
  });
  const [sortScore, setSortScore] = useState(0);
  const [sortMiss, setSortMiss] = useState(0);

  const [runnerLane, setRunnerLane] = useState(1);
  const [runnerDistance, setRunnerDistance] = useState(0);
  const [runnerObstacles, setRunnerObstacles] = useState<RunnerObstacle[]>([]);
  const [runnerObstacleId, setRunnerObstacleId] = useState(1);

  const [cashierSequence, setCashierSequence] = useState<string[]>([]);
  const [cashierIndex, setCashierIndex] = useState(0);

  const [cafeFill, setCafeFill] = useState(0);
  const [cafeTargetStart, setCafeTargetStart] = useState(62);
  const [cafeTargetEnd, setCafeTargetEnd] = useState(76);
  const [cafeHolding, setCafeHolding] = useState(false);
  const [cafeSuccessCount, setCafeSuccessCount] = useState(0);
  const [cafeMiss, setCafeMiss] = useState(0);

  const [securitySignal, setSecuritySignal] =
    useState<SecuritySignal>("normal");
  const [securitySuccess, setSecuritySuccess] = useState(0);
  const [securityMiss, setSecurityMiss] = useState(0);
  const [securityRound, setSecurityRound] = useState(0);

  const selectedJob = useMemo(() => {
    return jobs.find((job) => job.id === selectedJobId) ?? jobs[0];
  }, [selectedJobId]);

  const activeJob = useMemo(() => {
    if (!activeJobId) {
      return null;
    }

    return jobs.find((job) => job.id === activeJobId) ?? null;
  }, [activeJobId]);

  const taxRate = getTaxRate(cash);
  const nextTax = calculateTax(cash, unpaidTax);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (taxTriggerCount === 0) {
      return;
    }

    applyTaxAutomatically();
  }, [taxTriggerCount]);

  useEffect(() => {
    if (!activeJobId || jobFinished) {
      return;
    }

    if (jobTimeLeft <= 0) {
      failJob("시간 초과! 알바에 실패했습니다.");
      return;
    }

    const timer = window.setTimeout(() => {
      setJobTimeLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [activeJobId, jobFinished, jobTimeLeft]);

  useEffect(() => {
    if (activeJobId !== "sorting" || jobFinished) {
      return;
    }

    const timer = window.setInterval(() => {
      setSortItem((current) => {
        const nextX = current.x + 0.75;

        if (nextX >= 105) {
          registerSortMiss("택배가 지나가 버렸습니다.");
          return makeSortItem();
        }

        return { ...current, x: nextX };
      });
    }, 35);

    return () => window.clearInterval(timer);
  }, [activeJobId, jobFinished, sortMiss]);

  useEffect(() => {
    if (activeJobId !== "delivery" || jobFinished) {
      return;
    }

    const timer = window.setInterval(() => {
      setRunnerDistance((current) => {
        const next = current + 0.28;

        if (next >= 100) {
          completeJob("🛵 배달 완료! 목적지까지 무사히 도착했습니다.");
          return 100;
        }

        return next;
      });

      setRunnerObstacles((current) => {
        const moved = current
          .map((obstacle) => ({ ...obstacle, y: obstacle.y + 0.95 }))
          .filter((obstacle) => obstacle.y <= 110);

        const collision = moved.some(
          (obstacle) =>
            obstacle.lane === runnerLane &&
            obstacle.y >= 76 &&
            obstacle.y <= 91
        );

        if (collision) {
          failJob("💥 장애물에 부딪혔습니다! 배달 실패!");
          return moved;
        }

        if (Math.random() < 0.032) {
          const newObstacle = {
            id: runnerObstacleId,
            lane: Math.floor(Math.random() * 3),
            y: -12,
          };

          setRunnerObstacleId((id) => id + 1);
          return [...moved, newObstacle];
        }

        return moved;
      });
    }, 35);

    return () => window.clearInterval(timer);
  }, [activeJobId, jobFinished, runnerLane, runnerObstacleId]);

  useEffect(() => {
    if (activeJobId !== "cafe" || jobFinished) {
      return;
    }

    const timer = window.setInterval(() => {
      setCafeFill((current) => {
        if (cafeHolding) {
          const next = current + 1.2;

          if (next >= 100) {
            registerCafeMiss("음료가 넘쳤습니다!");
            return 0;
          }

          return next;
        }

        return Math.max(0, current - 0.35);
      });
    }, 35);

    return () => window.clearInterval(timer);
  }, [activeJobId, cafeHolding, jobFinished, cafeMiss]);

  useEffect(() => {
    if (activeJobId !== "security" || jobFinished) {
      return;
    }

    const timer = window.setInterval(() => {
      if (securitySignal === "thief") {
        registerSecurityMiss("수상한 사람을 놓쳤습니다.");
        return;
      }

      setSecuritySignal(makeSecuritySignal());
      setSecurityRound((current) => current + 1);
    }, 1050);

    return () => window.clearInterval(timer);
  }, [activeJobId, jobFinished, securitySignal, securityMiss]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!activeJobId || jobFinished) {
        return;
      }

      const key = event.key.toLowerCase();

      if (activeJobId === "sorting") {
        if (["1", "2", "3"].includes(key)) {
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

      if (activeJobId === "security") {
        if (key === " ") {
          event.preventDefault();
          handleSecurityAction();
        }
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      if (activeJobId !== "cafe" || jobFinished) {
        return;
      }

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
  }, [
    activeJobId,
    cafeFill,
    cafeMiss,
    cafeSuccessCount,
    cashierIndex,
    cashierSequence,
    jobFinished,
    securityMiss,
    securitySignal,
    securitySuccess,
    sortItem,
    sortMiss,
    sortScore,
  ]);

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
      setMessage(
        `🚨 세금 미납 경고 3회! 현금의 80%인 ${seizedCash.toLocaleString()}원이 압류되었습니다.`
      );
      return;
    }

    setWarningCount(nextWarning);
    setUnpaidTax(tax);
    setMessage(
      `⚠️ 자동 세금 납부 실패! 경고장이 ${nextWarning}장으로 증가했습니다.`
    );
  }

  function startJob(jobId: JobId) {
    const job = jobs.find((targetJob) => targetJob.id === jobId) ?? jobs[0];

    setSelectedJobId(jobId);
    setActiveJobId(jobId);
    setJobTimeLeft(job.timeLimit);
    setJobFinished(false);
    setMessage(`${job.icon} ${job.name} 시작!`);

    if (jobId === "sorting") {
      setupSortingJob();
    }

    if (jobId === "delivery") {
      setupDeliveryJob();
    }

    if (jobId === "cashier") {
      setupCashierJob();
    }

    if (jobId === "cafe") {
      setupCafeJob();
    }

    if (jobId === "security") {
      setupSecurityJob();
    }
  }

  function setupSortingJob() {
    setSortItem(makeSortItem());
    setSortScore(0);
    setSortMiss(0);
    setMessage("📦 택배 색에 맞춰 1, 2, 3번 구역으로 분류하세요.");
  }

  function setupDeliveryJob() {
    setRunnerLane(1);
    setRunnerDistance(0);
    setRunnerObstacles([]);
    setRunnerObstacleId(1);
    setMessage("🛵 A/D 또는 ←/→ 키로 차선을 바꾸며 장애물을 피하세요.");
  }

  function setupCashierJob() {
    setCashierSequence(makeCashierSequence());
    setCashierIndex(0);
    setMessage("🏪 화면에 나오는 키를 순서대로 입력하세요.");
  }

  function setupCafeJob() {
    const targetStart = Math.floor(Math.random() * 20) + 55;

    setCafeFill(0);
    setCafeHolding(false);
    setCafeSuccessCount(0);
    setCafeMiss(0);
    setCafeTargetStart(targetStart);
    setCafeTargetEnd(targetStart + 14);
    setMessage("☕ Space를 누르고 있다가 목표 구간에서 떼세요.");
  }

  function setupSecurityJob() {
    setSecuritySignal("normal");
    setSecuritySuccess(0);
    setSecurityMiss(0);
    setSecurityRound(0);
    setMessage("🛡️ 수상한 사람일 때만 Space를 누르세요.");
  }

  function completeJob(customMessage?: string) {
    if (!activeJob) {
      return;
    }

    setCash((current) => current + activeJob.reward);
    setJobFinished(true);
    setMessage(
      customMessage ??
        `성공! ${activeJob.reward.toLocaleString()}원을 벌었습니다.`
    );
  }

  function failJob(reason: string) {
    setJobFinished(true);
    setCafeHolding(false);
    setMessage(reason);
  }

  function leaveJob() {
    setActiveJobId(null);
    setJobFinished(false);
    setCafeHolding(false);
    setMessage("알바를 선택하고 시작하세요.");
  }

  function handleSortKey(key: string) {
    if (sortItem.x < 36 || sortItem.x > 64) {
      registerSortMiss("타이밍이 맞지 않았습니다. 중앙 판정 구역에서 눌러야 합니다.");
      return;
    }

    if (sortInfo[sortItem.kind].key !== key) {
      registerSortMiss("분류 구역이 틀렸습니다.");
      return;
    }

    const nextScore = sortScore + 1;

    setSortScore(nextScore);
    setSortItem(makeSortItem());

    if (nextScore >= 8) {
      completeJob("📦 택배 분류 완료! 보상을 받았습니다.");
      return;
    }

    setMessage(`좋아요! ${nextScore}/8개 분류 완료`);
  }

  function registerSortMiss(customMessage?: string) {
    const nextMiss = sortMiss + 1;

    setSortMiss(nextMiss);
    setSortItem(makeSortItem());

    if (nextMiss >= 3) {
      failJob("📦 분류 실수 3회! 알바 실패!");
      return;
    }

    setMessage(customMessage ?? `분류하지 못했습니다. 실수 ${nextMiss}/3`);
  }

  function handleCashierKey(key: string) {
    const expectedKey = cashierSequence[cashierIndex]?.toLowerCase();

    if (!expectedKey) {
      return;
    }

    if (key !== expectedKey) {
      failJob(`실수! ${cashierSequence[cashierIndex]} 키를 눌러야 했습니다.`);
      return;
    }

    const nextIndex = cashierIndex + 1;

    setCashierIndex(nextIndex);

    if (nextIndex >= cashierSequence.length) {
      completeJob("🏪 계산 성공! 손님을 빠르게 처리했습니다.");
      return;
    }

    setMessage(`좋아요! 다음 키: ${cashierSequence[nextIndex]}`);
  }

  function judgeCafeFill() {
    if (cafeFill >= cafeTargetStart && cafeFill <= cafeTargetEnd) {
      const nextSuccess = cafeSuccessCount + 1;

      setCafeSuccessCount(nextSuccess);
      setCafeFill(0);

      const nextTargetStart = Math.floor(Math.random() * 20) + 55;
      setCafeTargetStart(nextTargetStart);
      setCafeTargetEnd(nextTargetStart + 14);

      if (nextSuccess >= 4) {
        completeJob("☕ 음료 제조 완료! 카페 알바 성공!");
        return;
      }

      setMessage(`☕ 정확합니다! ${nextSuccess}/4잔 완성`);
      return;
    }

    registerCafeMiss("☕ 양이 맞지 않습니다.");
  }

  function registerCafeMiss(customMessage: string) {
    const nextMiss = cafeMiss + 1;

    setCafeMiss(nextMiss);
    setCafeFill(0);
    setCafeHolding(false);

    if (nextMiss >= 3) {
      failJob("☕ 제조 실수 3회! 알바 실패!");
      return;
    }

    setMessage(`${customMessage} 실수 ${nextMiss}/3`);
  }

  function handleSecurityAction() {
    if (securitySignal === "thief") {
      const nextSuccess = securitySuccess + 1;

      setSecuritySuccess(nextSuccess);
      setSecuritySignal("normal");

      if (nextSuccess >= 6) {
        completeJob("🛡️ 수상한 사람을 모두 막았습니다! 보안 알바 성공!");
        return;
      }

      setMessage(`🛡️ 대응 성공! ${nextSuccess}/6`);
      return;
    }

    registerSecurityMiss("🛡️ 평범한 손님을 잘못 막았습니다.");
  }

  function registerSecurityMiss(customMessage: string) {
    const nextMiss = securityMiss + 1;

    setSecurityMiss(nextMiss);
    setSecuritySignal("normal");

    if (nextMiss >= 3) {
      failJob("🛡️ 실수 3회! 보안 알바 실패!");
      return;
    }

    setMessage(`${customMessage} 실수 ${nextMiss}/3`);
  }

  if (activeJob) {
    return (
      <main style={pageStyle}>
        <section style={jobOnlyLayoutStyle}>
          <header style={compactHeaderStyle}>
            <div>
              <div style={smallLabelStyle}>진행 중인 알바</div>
              <h1 style={jobTitleStyle}>
                {activeJob.icon} {activeJob.name}
              </h1>
            </div>

            <div style={topStatusGroupStyle}>
              <StatusPill label="현금" value={`${cash.toLocaleString()}원`} />
              <StatusPill
                label="다음 세금"
                value={`${nextTax.toLocaleString()}원`}
              />
              <StatusPill label="시간" value={`${jobTimeLeft}초`} />
              <StatusPill
                label="세금까지"
                value={formatTime(taxCountdown)}
                warning={taxCountdown <= TAX_WARNING_SECONDS}
              />
              <button onClick={leaveJob} style={leaveButtonStyle}>
                나가기
              </button>
            </div>
          </header>

          <section style={jobStageStyle}>
            {activeJobId === "sorting" && (
              <SortingGame
                item={sortItem}
                score={sortScore}
                miss={sortMiss}
              />
            )}

            {activeJobId === "delivery" && (
              <DeliveryGame
                lane={runnerLane}
                obstacles={runnerObstacles}
                distance={runnerDistance}
              />
            )}

            {activeJobId === "cashier" && (
              <CashierGame
                sequence={cashierSequence}
                currentIndex={cashierIndex}
              />
            )}

            {activeJobId === "cafe" && (
              <CafeGame
                fill={cafeFill}
                targetStart={cafeTargetStart}
                targetEnd={cafeTargetEnd}
                success={cafeSuccessCount}
                miss={cafeMiss}
                holding={cafeHolding}
              />
            )}

            {activeJobId === "security" && (
              <SecurityGame
                signal={securitySignal}
                success={securitySuccess}
                miss={securityMiss}
                round={securityRound}
              />
            )}
          </section>

          <footer style={jobFooterStyle}>
            <div style={messageBoxStyle}>{message}</div>
            <div style={controlHintStyle}>{getControlHint(activeJobId)}</div>

            {jobFinished && (
              <button
                onClick={() => startJob(activeJob.id)}
                style={retryButtonStyle}
              >
                다시 하기
              </button>
            )}
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
            <p style={subtitleStyle}>
              서로 다른 미니게임 알바로 돈을 벌고 세금을 관리하세요.
            </p>
          </div>

          <div style={moneyPanelStyle}>
            <StatusPill label="현금" value={`${cash.toLocaleString()}원`} />
            <StatusPill label="세율" value={`${(taxRate * 100).toFixed(0)}%`} />
            <StatusPill
              label="다음 세금"
              value={`${nextTax.toLocaleString()}원`}
            />
            <StatusPill label="미납" value={`${unpaidTax.toLocaleString()}원`} />
            <StatusPill label="경고" value={`${warningCount}장`} />
            <StatusPill
              label="세금까지"
              value={formatTime(taxCountdown)}
              warning={taxCountdown <= TAX_WARNING_SECONDS}
            />
          </div>
        </header>

        <section style={jobGridStyle}>
          {jobs.map((job) => (
            <button
              key={job.id}
              onClick={() => setSelectedJobId(job.id)}
              style={{
                ...jobCardStyle,
                border:
                  selectedJobId === job.id
                    ? "2px solid #38bdf8"
                    : "1px solid rgba(255,255,255,0.14)",
              }}
            >
              <div style={jobIconStyle}>{job.icon}</div>
              <h2 style={jobCardTitleStyle}>{job.name}</h2>
              <p style={jobCardTextStyle}>{job.subtitle}</p>
              <p style={rewardTextStyle}>
                보상 {job.reward.toLocaleString()}원 · 제한 {job.timeLimit}초
              </p>
            </button>
          ))}
        </section>

        <footer style={lobbyFooterStyle}>
          <div style={messageBoxStyle}>{message}</div>

          <button
            onClick={() => startJob(selectedJob.id)}
            style={bigStartButtonStyle}
          >
            {selectedJob.icon} {selectedJob.name} 시작하기
          </button>
        </footer>
      </section>
    </main>
  );
}

function SortingGame({
  item,
  score,
  miss,
}: {
  item: SortItem;
  score: number;
  miss: number;
}) {
  return (
    <div style={sortingStageStyle}>
      <div style={miniGameTopInfoStyle}>
        <strong>분류 {score}/8</strong>
        <strong>실수 {miss}/3</strong>
      </div>

      <div style={conveyorStyle}>
        <div style={sortJudgeZoneStyle}>판정 구역</div>
        <div
          style={{
            ...sortPackageStyle,
            left: `${item.x}%`,
          }}
        >
          {sortInfo[item.kind].emoji}
        </div>
      </div>

      <div style={sortBinsStyle}>
        <div style={sortBinStyle}>1번 {sortInfo.red.emoji} 빨강</div>
        <div style={sortBinStyle}>2번 {sortInfo.blue.emoji} 파랑</div>
        <div style={sortBinStyle}>3번 {sortInfo.yellow.emoji} 노랑</div>
      </div>
    </div>
  );
}

function DeliveryGame({
  lane,
  obstacles,
  distance,
}: {
  lane: number;
  obstacles: RunnerObstacle[];
  distance: number;
}) {
  return (
    <div style={runnerStageStyle}>
      <div style={runnerRoadStyle}>
        {[0, 1, 2].map((roadLane) => (
          <div key={roadLane} style={runnerLaneStyle}>
            {lane === roadLane && <div style={runnerPlayerStyle}>🛵</div>}

            {obstacles
              .filter((obstacle) => obstacle.lane === roadLane)
              .map((obstacle) => (
                <div
                  key={obstacle.id}
                  style={{
                    ...runnerObstacleStyle,
                    top: `${obstacle.y}%`,
                  }}
                >
                  🚧
                </div>
              ))}
          </div>
        ))}
      </div>

      <div style={runnerProgressStyle}>
        배달 진행도: {Math.floor(Math.min(distance, 100))}%
      </div>
    </div>
  );
}

function CashierGame({
  sequence,
  currentIndex,
}: {
  sequence: string[];
  currentIndex: number;
}) {
  return (
    <div style={centerGameStyle}>
      <div style={cashierPanelStyle}>
        <div style={cashierTitleStyle}>입력할 키</div>

        <div style={sequenceRowStyle}>
          {sequence.map((key, index) => (
            <div
              key={`${key}-${index}`}
              style={{
                ...keyBoxStyle,
                background:
                  index < currentIndex
                    ? "#22c55e"
                    : index === currentIndex
                      ? "#38bdf8"
                      : "rgba(255,255,255,0.08)",
                color: index <= currentIndex ? "#020617" : "white",
              }}
            >
              {key}
            </div>
          ))}
        </div>

        <p style={cashierHintStyle}>
          현재 입력해야 할 키:{" "}
          <strong>{sequence[currentIndex] ?? "완료"}</strong>
        </p>
      </div>
    </div>
  );
}

function CafeGame({
  fill,
  targetStart,
  targetEnd,
  success,
  miss,
  holding,
}: {
  fill: number;
  targetStart: number;
  targetEnd: number;
  success: number;
  miss: number;
  holding: boolean;
}) {
  return (
    <div style={cafeStageStyle}>
      <div style={miniGameTopInfoStyle}>
        <strong>완성 {success}/4</strong>
        <strong>실수 {miss}/3</strong>
      </div>

      <div style={cupAreaStyle}>
        <div style={cupStyle}>
          <div
            style={{
              ...coffeeFillStyle,
              height: `${fill}%`,
            }}
          />
          <div
            style={{
              ...cafeTargetZoneStyle,
              bottom: `${targetStart}%`,
              height: `${targetEnd - targetStart}%`,
            }}
          />
        </div>

        <div style={cafeGaugeTextStyle}>
          {holding ? "따르는 중..." : "Space를 누르고 있다가 목표 구간에서 떼기"}
        </div>
      </div>
    </div>
  );
}

function SecurityGame({
  signal,
  success,
  miss,
  round,
}: {
  signal: SecuritySignal;
  success: number;
  miss: number;
  round: number;
}) {
  const character =
    signal === "thief" ? "🕵️‍♂️" : signal === "vip" ? "🤵" : "🚶";

  const label =
    signal === "thief"
      ? "수상한 사람!"
      : signal === "vip"
        ? "VIP 손님"
        : "평범한 손님";

  return (
    <div style={securityStageStyle}>
      <div style={miniGameTopInfoStyle}>
        <strong>대응 {success}/6</strong>
        <strong>실수 {miss}/3</strong>
      </div>

      <div style={securityPanelStyle}>
        <div key={round} style={securityCharacterStyle}>
          {character}
        </div>
        <div style={securityLabelStyle}>{label}</div>
        <div style={securityHintStyle}>
          수상한 사람일 때만 <strong>Space</strong>
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  label,
  value,
  warning = false,
}: {
  label: string;
  value: string;
  warning?: boolean;
}) {
  return (
    <div
      style={{
        ...statusPillStyle,
        borderColor: warning ? "#f97316" : "rgba(255,255,255,0.16)",
        color: warning ? "#fed7aa" : "white",
      }}
    >
      <span style={statusLabelStyle}>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getTaxRate(cash: number) {
  if (cash <= 100000) {
    return 0.01;
  }

  if (cash <= 1000000) {
    return 0.05;
  }

  if (cash <= 10000000) {
    return 0.1;
  }

  return 0.2;
}

function calculateTax(cash: number, unpaidTax: number) {
  return Math.floor(cash * getTaxRate(cash)) + unpaidTax;
}

function makeCashierSequence() {
  return Array.from({ length: 12 }, () => {
    return cashierKeyPool[Math.floor(Math.random() * cashierKeyPool.length)];
  });
}

function makeSortItem(): SortItem {
  return {
    kind: sortKinds[Math.floor(Math.random() * sortKinds.length)],
    x: -8,
  };
}

function makeSecuritySignal(): SecuritySignal {
  const random = Math.random();

  if (random < 0.34) {
    return "thief";
  }

  if (random < 0.5) {
    return "vip";
  }

  return "normal";
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${minutes}:${String(restSeconds).padStart(2, "0")}`;
}

function getControlHint(activeJobId: JobId | null) {
  if (activeJobId === "sorting") {
    return "중앙 판정 구역에서 1/2/3 입력";
  }

  if (activeJobId === "delivery") {
    return "A/D 또는 ←/→ 로 차선 이동";
  }

  if (activeJobId === "cashier") {
    return "W/A/S/D 키를 순서대로 입력";
  }

  if (activeJobId === "cafe") {
    return "Space 누르고 있다가 목표 구간에서 떼기";
  }

  if (activeJobId === "security") {
    return "수상한 사람일 때만 Space";
  }

  return "알바를 선택하세요";
}

const pageStyle: CSSProperties = {
  width: "100vw",
  height: "100svh",
  maxHeight: "100svh",
  overflow: "hidden",
  background:
    "radial-gradient(circle at top left, #1e3a8a 0, transparent 35%), linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e1b4b 100%)",
  color: "white",
  fontFamily: "Arial, sans-serif",
};

const lobbyLayoutStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  padding: "8px",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gap: "6px",
};

const lobbyHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "10px",
};

const smallLabelStyle: CSSProperties = {
  color: "#38bdf8",
  fontSize: "10px",
  fontWeight: 900,
  letterSpacing: "0.12em",
};

const mainTitleStyle: CSSProperties = {
  margin: "1px 0",
  fontSize: "25px",
  lineHeight: 1,
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: "12px",
};

const moneyPanelStyle: CSSProperties = {
  display: "flex",
  gap: "5px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  maxWidth: "740px",
};

const statusPillStyle: CSSProperties = {
  background: "rgba(15,23,42,0.75)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "9px",
  padding: "5px 7px",
  minWidth: "72px",
  display: "grid",
  gap: "1px",
  fontSize: "11px",
};

const statusLabelStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: "9px",
};

const jobGridStyle: CSSProperties = {
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: "7px",
  alignContent: "center",
};

const jobCardStyle: CSSProperties = {
  height: "142px",
  borderRadius: "14px",
  padding: "9px",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  textAlign: "left",
  cursor: "pointer",
  boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
};

const jobIconStyle: CSSProperties = {
  fontSize: "27px",
  marginBottom: "5px",
};

const jobCardTitleStyle: CSSProperties = {
  margin: "0 0 4px",
  fontSize: "15px",
};

const jobCardTextStyle: CSSProperties = {
  margin: 0,
  color: "#cbd5e1",
  lineHeight: 1.25,
  fontSize: "11px",
};

const rewardTextStyle: CSSProperties = {
  marginTop: "7px",
  color: "#86efac",
  fontWeight: 800,
  fontSize: "11px",
};

const lobbyFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
};

const messageBoxStyle: CSSProperties = {
  flex: 1,
  minHeight: "34px",
  display: "flex",
  alignItems: "center",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.28)",
  borderRadius: "10px",
  padding: "7px 9px",
  color: "#dcfce7",
  lineHeight: 1.25,
  fontSize: "12px",
};

const bigStartButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "10px",
  background: "#38bdf8",
  color: "#020617",
  padding: "9px 12px",
  fontWeight: 900,
  fontSize: "12px",
  cursor: "pointer",
};

const jobOnlyLayoutStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  padding: "8px",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gap: "6px",
};

const compactHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "7px",
};

const jobTitleStyle: CSSProperties = {
  margin: "1px 0 0",
  fontSize: "21px",
};

const topStatusGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "5px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const leaveButtonStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  borderRadius: "9px",
  padding: "8px 10px",
  fontWeight: 900,
  cursor: "pointer",
};

const jobStageStyle: CSSProperties = {
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const jobFooterStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto auto",
  gap: "7px",
  alignItems: "center",
};

const controlHintStyle: CSSProperties = {
  background: "rgba(15,23,42,0.75)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "10px",
  padding: "8px 10px",
  color: "#cbd5e1",
  fontWeight: 800,
  fontSize: "12px",
};

const retryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "10px",
  background: "#facc15",
  color: "#020617",
  padding: "8px 11px",
  fontWeight: 900,
  cursor: "pointer",
};

const centerGameStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const miniGameTopInfoStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  color: "#86efac",
  fontSize: "13px",
};

const sortingStageStyle: CSSProperties = {
  width: "min(680px, 90vw)",
  height: "min(330px, 50svh)",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gap: "8px",
};

const conveyorStyle: CSSProperties = {
  position: "relative",
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "18px",
  overflow: "hidden",
};

const sortJudgeZoneStyle: CSSProperties = {
  position: "absolute",
  left: "36%",
  width: "28%",
  top: 0,
  bottom: 0,
  background: "rgba(34,197,94,0.15)",
  borderLeft: "2px solid rgba(34,197,94,0.8)",
  borderRight: "2px solid rgba(34,197,94,0.8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#86efac",
  fontWeight: 900,
  fontSize: "13px",
};

const sortPackageStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: "46px",
  transition: "left 35ms linear",
  zIndex: 3,
};

const sortBinsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "7px",
};

const sortBinStyle: CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "12px",
  padding: "8px",
  textAlign: "center",
  fontWeight: 900,
  fontSize: "12px",
};

const runnerStageStyle: CSSProperties = {
  width: "min(520px, 90vw)",
  height: "min(390px, 54svh)",
  display: "grid",
  gridTemplateRows: "1fr auto",
  gap: "7px",
};

const runnerRoadStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "6px",
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "18px",
  padding: "8px",
  overflow: "hidden",
};

const runnerLaneStyle: CSSProperties = {
  position: "relative",
  background: "rgba(255,255,255,0.07)",
  borderRadius: "14px",
  border: "1px dashed rgba(255,255,255,0.18)",
  overflow: "hidden",
};

const runnerPlayerStyle: CSSProperties = {
  position: "absolute",
  bottom: "9%",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "34px",
  zIndex: 4,
};

const runnerObstacleStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "32px",
  transition: "top 35ms linear",
};

const runnerProgressStyle: CSSProperties = {
  textAlign: "center",
  color: "#86efac",
  fontWeight: 900,
  fontSize: "13px",
};

const cashierPanelStyle: CSSProperties = {
  width: "min(620px, 90vw)",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "18px",
  padding: "20px",
  textAlign: "center",
};

const cashierTitleStyle: CSSProperties = {
  color: "#93c5fd",
  fontWeight: 900,
  marginBottom: "12px",
};

const sequenceRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "7px",
};

const keyBoxStyle: CSSProperties = {
  width: "44px",
  height: "44px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "18px",
  fontWeight: 900,
  border: "1px solid rgba(255,255,255,0.2)",
};

const cashierHintStyle: CSSProperties = {
  marginTop: "14px",
  color: "#cbd5e1",
  fontSize: "14px",
};

const cafeStageStyle: CSSProperties = {
  width: "min(520px, 90vw)",
  height: "min(380px, 52svh)",
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
  borderRadius: "20px",
  padding: "12px",
};

const cupStyle: CSSProperties = {
  position: "relative",
  width: "150px",
  height: "220px",
  border: "5px solid rgba(255,255,255,0.8)",
  borderTop: "none",
  borderRadius: "0 0 26px 26px",
  overflow: "hidden",
  background: "rgba(255,255,255,0.08)",
};

const coffeeFillStyle: CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  background: "linear-gradient(180deg, #d97706, #92400e)",
  transition: "height 35ms linear",
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
  marginTop: "12px",
  color: "#cbd5e1",
  fontWeight: 900,
  fontSize: "13px",
};

const securityStageStyle: CSSProperties = {
  width: "min(560px, 90vw)",
  height: "min(360px, 50svh)",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  gap: "8px",
};

const securityPanelStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "20px",
};

const securityCharacterStyle: CSSProperties = {
  fontSize: "74px",
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
