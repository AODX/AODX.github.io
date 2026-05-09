"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type JobId = "loading" | "delivery" | "cleaning" | "cashier" | "mining";

type Position = {
  x: number;
  y: number;
};

type Job = {
  id: JobId;
  name: string;
  subtitle: string;
  reward: number;
  timeLimit: number;
  icon: string;
};

const TAX_INTERVAL_SECONDS = 600;
const TAX_WARNING_SECONDS = 60;
const BOARD_SIZE = 8;

const jobs: Job[] = [
  {
    id: "loading",
    name: "상하차 알바",
    subtitle: "박스를 집어 창고로 옮기세요.",
    reward: 1500,
    timeLimit: 35,
    icon: "📦",
  },
  {
    id: "delivery",
    name: "음식 배달 알바",
    subtitle: "장애물을 피해 음식을 배달하세요.",
    reward: 2400,
    timeLimit: 35,
    icon: "🍔",
  },
  {
    id: "cleaning",
    name: "청소 알바",
    subtitle: "맵 곳곳의 쓰레기를 모두 치우세요.",
    reward: 1800,
    timeLimit: 30,
    icon: "🧹",
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
    id: "mining",
    name: "광산 채굴 알바",
    subtitle: "게이지가 초록 구역에 있을 때 스페이스를 누르세요.",
    reward: 2600,
    timeLimit: 25,
    icon: "⛏️",
  },
];

const keyPool = ["W", "A", "S", "D"];

export default function GamePage() {
  const [cash, setCash] = useState(10000);
  const [warningCount, setWarningCount] = useState(0);
  const [unpaidTax, setUnpaidTax] = useState(0);
  const [taxCountdown, setTaxCountdown] = useState(TAX_INTERVAL_SECONDS);
  const [taxTriggerCount, setTaxTriggerCount] = useState(0);

  const [activeJobId, setActiveJobId] = useState<JobId | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<JobId>("loading");
  const [message, setMessage] = useState("알바를 선택하고 시작하세요.");
  const [jobTimeLeft, setJobTimeLeft] = useState(0);
  const [jobFinished, setJobFinished] = useState(false);

  const [player, setPlayer] = useState<Position>({ x: 0, y: 0 });
  const [itemPosition, setItemPosition] = useState<Position>({ x: 2, y: 2 });
  const [targetPosition, setTargetPosition] = useState<Position>({ x: 6, y: 6 });
  const [restaurantPosition, setRestaurantPosition] = useState<Position>({
    x: 1,
    y: 6,
  });
  const [obstacles, setObstacles] = useState<Position[]>([]);
  const [hasItem, setHasItem] = useState(false);
  const [trashPositions, setTrashPositions] = useState<Position[]>([]);

  const [cashierSequence, setCashierSequence] = useState<string[]>([]);
  const [cashierIndex, setCashierIndex] = useState(0);

  const [miningPower, setMiningPower] = useState(0);
  const [miningDirection, setMiningDirection] = useState(1);
  const [miningSuccessCount, setMiningSuccessCount] = useState(0);

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
    if (activeJobId !== "mining" || jobFinished) {
      return;
    }

    const timer = window.setInterval(() => {
      setMiningPower((current) => {
        const next = current + miningDirection * 4;

        if (next >= 100) {
          setMiningDirection(-1);
          return 100;
        }

        if (next <= 0) {
          setMiningDirection(1);
          return 0;
        }

        return next;
      });
    }, 45);

    return () => window.clearInterval(timer);
  }, [activeJobId, jobFinished, miningDirection]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!activeJobId || jobFinished) {
        return;
      }

      const key = event.key.toLowerCase();

      if (activeJobId === "cashier") {
        handleCashierKey(key);
        return;
      }

      if (activeJobId === "mining") {
        if (key === " ") {
          event.preventDefault();
          handleMiningHit();
        }

        return;
      }

      if (
        ![
          "w",
          "a",
          "s",
          "d",
          "arrowup",
          "arrowdown",
          "arrowleft",
          "arrowright",
        ].includes(key)
      ) {
        return;
      }

      event.preventDefault();
      movePlayer(key);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeJobId,
    cashierIndex,
    cashierSequence,
    hasItem,
    jobFinished,
    miningPower,
    miningSuccessCount,
    obstacles,
    player,
    trashPositions,
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
    setHasItem(false);
    setCashierIndex(0);
    setMiningPower(0);
    setMiningDirection(1);
    setMiningSuccessCount(0);

    if (jobId === "loading") {
      setupLoadingJob();
      setMessage("📦 박스를 찾은 뒤 창고로 옮기세요.");
    }

    if (jobId === "delivery") {
      setupDeliveryJob();
      setMessage("🍔 식당에서 음식을 받고, 장애물을 피해 집까지 배달하세요.");
    }

    if (jobId === "cleaning") {
      setupCleaningJob();
      setMessage("🧹 쓰레기 6개를 모두 청소하세요.");
    }

    if (jobId === "cashier") {
      setCashierSequence(makeCashierSequence());
      setMessage("🏪 화면에 나오는 키를 순서대로 입력하세요.");
    }

    if (jobId === "mining") {
      setMessage("⛏️ 게이지가 초록 구역에 들어왔을 때 스페이스를 누르세요.");
    }
  }

  function setupLoadingJob() {
    const playerStart = randomPosition([]);
    const itemStart = randomPosition([playerStart]);
    const targetStart = randomPosition([playerStart, itemStart]);

    setPlayer(playerStart);
    setItemPosition(itemStart);
    setTargetPosition(targetStart);
    setObstacles([]);
    setTrashPositions([]);
  }

  function setupDeliveryJob() {
    const playerStart = randomPosition([]);
    const restaurantStart = randomPosition([playerStart]);
    const targetStart = randomPosition([playerStart, restaurantStart]);
    const obstacleList = makeRandomPositions(9, [
      playerStart,
      restaurantStart,
      targetStart,
    ]);

    setPlayer(playerStart);
    setRestaurantPosition(restaurantStart);
    setTargetPosition(targetStart);
    setObstacles(obstacleList);
    setTrashPositions([]);
  }

  function setupCleaningJob() {
    const playerStart = randomPosition([]);
    const trashList = makeRandomPositions(6, [playerStart]);

    setPlayer(playerStart);
    setTrashPositions(trashList);
    setObstacles([]);
    setHasItem(false);
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
    setMessage(reason);
  }

  function leaveJob() {
    setActiveJobId(null);
    setJobFinished(false);
    setMessage("알바를 선택하고 시작하세요.");
  }

  function movePlayer(key: string) {
    const nextPosition = limitPosition(getNextPosition(player, key));

    if (isObstacle(nextPosition, obstacles)) {
      setMessage("🚧 장애물 때문에 이동할 수 없습니다.");
      return;
    }

    setPlayer(nextPosition);

    if (activeJobId === "loading") {
      if (!hasItem && isSamePosition(nextPosition, itemPosition)) {
        setHasItem(true);
        setMessage("📦 박스를 들었습니다. 창고로 이동하세요.");
        return;
      }

      if (hasItem && isSamePosition(nextPosition, targetPosition)) {
        completeJob("📦 상하차 성공! 보상을 받았습니다.");
        return;
      }
    }

    if (activeJobId === "delivery") {
      if (!hasItem && isSamePosition(nextPosition, restaurantPosition)) {
        setHasItem(true);
        setMessage("🍔 음식을 받았습니다. 집까지 배달하세요.");
        return;
      }

      if (hasItem && isSamePosition(nextPosition, targetPosition)) {
        completeJob("🍔 배달 완료! 보상을 받았습니다.");
        return;
      }
    }

    if (activeJobId === "cleaning") {
      const remainingTrash = trashPositions.filter(
        (trash) => !isSamePosition(trash, nextPosition)
      );

      if (remainingTrash.length !== trashPositions.length) {
        setTrashPositions(remainingTrash);

        if (remainingTrash.length === 0) {
          completeJob("🧹 청소 완료! 보상을 받았습니다.");
          return;
        }

        setMessage(`🧹 쓰레기를 치웠습니다. 남은 쓰레기 ${remainingTrash.length}개`);
      }
    }
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

  function handleMiningHit() {
    if (miningPower >= 42 && miningPower <= 58) {
      const nextSuccessCount = miningSuccessCount + 1;

      setMiningSuccessCount(nextSuccessCount);

      if (nextSuccessCount >= 4) {
        completeJob("⛏️ 채굴 성공! 좋은 광물을 찾았습니다.");
        return;
      }

      setMessage(`성공! ${nextSuccessCount}/4회 적중했습니다.`);
      return;
    }

    failJob("실패! 초록 구역에서 스페이스를 눌러야 합니다.");
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
              <StatusPill label="남은 시간" value={`${jobTimeLeft}초`} />
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
            {activeJobId === "loading" && (
              <BoardGame
                player={player}
                itemPosition={itemPosition}
                targetPosition={targetPosition}
                hasItem={hasItem}
                obstacles={[]}
                trashPositions={[]}
                mode="loading"
              />
            )}

            {activeJobId === "delivery" && (
              <BoardGame
                player={player}
                itemPosition={restaurantPosition}
                targetPosition={targetPosition}
                hasItem={hasItem}
                obstacles={obstacles}
                trashPositions={[]}
                mode="delivery"
              />
            )}

            {activeJobId === "cleaning" && (
              <BoardGame
                player={player}
                itemPosition={itemPosition}
                targetPosition={targetPosition}
                hasItem={false}
                obstacles={[]}
                trashPositions={trashPositions}
                mode="cleaning"
              />
            )}

            {activeJobId === "cashier" && (
              <CashierGame
                sequence={cashierSequence}
                currentIndex={cashierIndex}
              />
            )}

            {activeJobId === "mining" && (
              <MiningGame
                power={miningPower}
                successCount={miningSuccessCount}
              />
            )}
          </section>

          <footer style={jobFooterStyle}>
            <div style={messageBoxStyle}>{message}</div>

            <div style={controlHintStyle}>
              {activeJobId === "cashier" && "W/A/S/D 키를 순서대로 입력"}
              {activeJobId === "mining" && "초록 구역에서 Space"}
              {["loading", "delivery", "cleaning"].includes(activeJobId) &&
                "WASD 또는 방향키로 이동"}
            </div>

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
              원하는 알바를 선택해서 미니게임으로 돈을 벌어보세요.
            </p>
          </div>

          <div style={moneyPanelStyle}>
            <StatusPill label="현금" value={`${cash.toLocaleString()}원`} />
            <StatusPill label="세율" value={`${(taxRate * 100).toFixed(0)}%`} />
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

function BoardGame({
  player,
  itemPosition,
  targetPosition,
  hasItem,
  obstacles,
  trashPositions,
  mode,
}: {
  player: Position;
  itemPosition: Position;
  targetPosition: Position;
  hasItem: boolean;
  obstacles: Position[];
  trashPositions: Position[];
  mode: "loading" | "delivery" | "cleaning";
}) {
  const cells = [];

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      const position = { x, y };
      const isPlayer = isSamePosition(player, position);
      const isItem =
        mode !== "cleaning" && !hasItem && isSamePosition(itemPosition, position);
      const isTarget =
        mode !== "cleaning" && isSamePosition(targetPosition, position);
      const isObstacleCell = isObstacle(position, obstacles);
      const isTrash = trashPositions.some((trash) =>
        isSamePosition(trash, position)
      );

      let content = "";

      if (isTarget) {
        content = mode === "loading" ? "🏭" : "🏠";
      }

      if (isItem) {
        content = mode === "loading" ? "📦" : "🍔";
      }

      if (isObstacleCell) {
        content = "🚧";
      }

      if (isTrash) {
        content = "🗑️";
      }

      if (isPlayer) {
        if (mode === "loading" && hasItem) {
          content = "🧍‍♂️📦";
        } else if (mode === "delivery" && hasItem) {
          content = "🛵🍔";
        } else if (mode === "delivery") {
          content = "🛵";
        } else if (mode === "cleaning") {
          content = "🧹";
        } else {
          content = "🧍‍♂️";
        }
      }

      cells.push(
        <div key={`${x}-${y}`} style={cellStyle}>
          {content}
        </div>
      );
    }
  }

  return <div style={boardStyle}>{cells}</div>;
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

function MiningGame({
  power,
  successCount,
}: {
  power: number;
  successCount: number;
}) {
  return (
    <div style={centerGameStyle}>
      <div style={miningPanelStyle}>
        <div style={miningTitleStyle}>채굴 게이지</div>

        <div style={gaugeOuterStyle}>
          <div style={greenZoneStyle} />
          <div
            style={{
              ...gaugeNeedleStyle,
              left: `${power}%`,
            }}
          />
        </div>

        <p style={cashierHintStyle}>
          초록 구역에서 <strong>Space</strong>를 누르세요.
        </p>

        <div style={miningCountStyle}>{successCount}/4 성공</div>
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

function getNextPosition(position: Position, key: string) {
  if (key === "w" || key === "arrowup") {
    return { x: position.x, y: position.y - 1 };
  }

  if (key === "s" || key === "arrowdown") {
    return { x: position.x, y: position.y + 1 };
  }

  if (key === "a" || key === "arrowleft") {
    return { x: position.x - 1, y: position.y };
  }

  if (key === "d" || key === "arrowright") {
    return { x: position.x + 1, y: position.y };
  }

  return position;
}

function limitPosition(position: Position) {
  return {
    x: Math.max(0, Math.min(BOARD_SIZE - 1, position.x)),
    y: Math.max(0, Math.min(BOARD_SIZE - 1, position.y)),
  };
}

function isSamePosition(a: Position, b: Position) {
  return a.x === b.x && a.y === b.y;
}

function isObstacle(position: Position, obstacles: Position[]) {
  return obstacles.some((obstacle) => isSamePosition(obstacle, position));
}

function randomPosition(exclude: Position[]) {
  let position = {
    x: Math.floor(Math.random() * BOARD_SIZE),
    y: Math.floor(Math.random() * BOARD_SIZE),
  };

  while (exclude.some((item) => isSamePosition(item, position))) {
    position = {
      x: Math.floor(Math.random() * BOARD_SIZE),
      y: Math.floor(Math.random() * BOARD_SIZE),
    };
  }

  return position;
}

function makeRandomPositions(count: number, exclude: Position[]) {
  const positions: Position[] = [];
  const blocked = [...exclude];

  while (positions.length < count) {
    const position = randomPosition(blocked);

    positions.push(position);
    blocked.push(position);
  }

  return positions;
}

function makeCashierSequence() {
  return Array.from({ length: 12 }, () => {
    return keyPool[Math.floor(Math.random() * keyPool.length)];
  });
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const restSeconds = seconds % 60;

  return `${minutes}:${String(restSeconds).padStart(2, "0")}`;
}

const pageStyle: CSSProperties = {
  width: "100vw",
  height: "100vh",
  overflow: "hidden",
  background:
    "radial-gradient(circle at top left, #1e3a8a 0, transparent 35%), linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e1b4b 100%)",
  color: "white",
  fontFamily: "Arial, sans-serif",
};

const lobbyLayoutStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  padding: "24px",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gap: "18px",
};

const lobbyHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
};

const smallLabelStyle: CSSProperties = {
  color: "#38bdf8",
  fontSize: "13px",
  fontWeight: 900,
  letterSpacing: "0.12em",
};

const mainTitleStyle: CSSProperties = {
  margin: "6px 0",
  fontSize: "42px",
  lineHeight: 1,
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  color: "#cbd5e1",
};

const moneyPanelStyle: CSSProperties = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  maxWidth: "620px",
};

const statusPillStyle: CSSProperties = {
  background: "rgba(15,23,42,0.75)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "14px",
  padding: "10px 12px",
  minWidth: "96px",
  display: "grid",
  gap: "3px",
};

const statusLabelStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: "12px",
};

const jobGridStyle: CSSProperties = {
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
  gap: "14px",
  alignContent: "center",
};

const jobCardStyle: CSSProperties = {
  height: "260px",
  borderRadius: "24px",
  padding: "20px",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  textAlign: "left",
  cursor: "pointer",
  boxShadow: "0 20px 50px rgba(0,0,0,0.22)",
};

const jobIconStyle: CSSProperties = {
  fontSize: "46px",
  marginBottom: "16px",
};

const jobCardTitleStyle: CSSProperties = {
  margin: "0 0 8px",
  fontSize: "22px",
};

const jobCardTextStyle: CSSProperties = {
  margin: 0,
  color: "#cbd5e1",
  lineHeight: 1.45,
};

const rewardTextStyle: CSSProperties = {
  marginTop: "18px",
  color: "#86efac",
  fontWeight: 800,
};

const lobbyFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "14px",
};

const messageBoxStyle: CSSProperties = {
  flex: 1,
  minHeight: "52px",
  display: "flex",
  alignItems: "center",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.28)",
  borderRadius: "16px",
  padding: "12px 16px",
  color: "#dcfce7",
  lineHeight: 1.4,
};

const bigStartButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "16px",
  background: "#38bdf8",
  color: "#020617",
  padding: "16px 22px",
  fontWeight: 900,
  fontSize: "16px",
  cursor: "pointer",
};

const jobOnlyLayoutStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  padding: "18px",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gap: "14px",
};

const compactHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "14px",
};

const jobTitleStyle: CSSProperties = {
  margin: "4px 0 0",
  fontSize: "30px",
};

const topStatusGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const leaveButtonStyle: CSSProperties = {
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  borderRadius: "14px",
  padding: "14px 16px",
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
  gap: "12px",
  alignItems: "center",
};

const controlHintStyle: CSSProperties = {
  background: "rgba(15,23,42,0.75)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "14px",
  padding: "14px 16px",
  color: "#cbd5e1",
  fontWeight: 800,
};

const retryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "14px",
  background: "#facc15",
  color: "#020617",
  padding: "14px 18px",
  fontWeight: 900,
  cursor: "pointer",
};

const boardStyle: CSSProperties = {
  width: "min(74vh, 640px)",
  height: "min(74vh, 640px)",
  display: "grid",
  gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
  gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
  gap: "7px",
  padding: "12px",
  background: "rgba(15,23,42,0.86)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "24px",
  boxShadow: "0 24px 80px rgba(0,0,0,0.28)",
};

const cellStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(255,255,255,0.07)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "13px",
  fontSize: "clamp(22px, 4vh, 38px)",
};

const centerGameStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const cashierPanelStyle: CSSProperties = {
  width: "min(760px, 90vw)",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "28px",
  padding: "36px",
  textAlign: "center",
};

const cashierTitleStyle: CSSProperties = {
  color: "#93c5fd",
  fontWeight: 900,
  marginBottom: "22px",
};

const sequenceRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "12px",
};

const keyBoxStyle: CSSProperties = {
  width: "58px",
  height: "58px",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: 900,
  border: "1px solid rgba(255,255,255,0.2)",
};

const cashierHintStyle: CSSProperties = {
  marginTop: "24px",
  color: "#cbd5e1",
  fontSize: "18px",
};

const miningPanelStyle: CSSProperties = {
  width: "min(760px, 90vw)",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "28px",
  padding: "40px",
  textAlign: "center",
};

const miningTitleStyle: CSSProperties = {
  fontSize: "28px",
  fontWeight: 900,
  marginBottom: "30px",
};

const gaugeOuterStyle: CSSProperties = {
  position: "relative",
  height: "70px",
  background: "#020617",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "999px",
  overflow: "hidden",
};

const greenZoneStyle: CSSProperties = {
  position: "absolute",
  left: "42%",
  width: "16%",
  top: 0,
  bottom: 0,
  background: "#22c55e",
};

const gaugeNeedleStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  bottom: 0,
  width: "6px",
  background: "#facc15",
  transform: "translateX(-3px)",
};

const miningCountStyle: CSSProperties = {
  marginTop: "24px",
  fontSize: "32px",
  fontWeight: 900,
  color: "#86efac",
};
