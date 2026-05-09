"use client";

import { useEffect, useMemo, useState } from "react";

type JobType = "delivery" | "loading";

type Position = {
  x: number;
  y: number;
};

type Job = {
  id: JobType;
  name: string;
  description: string;
  reward: number;
  timeLimit: number;
  itemIcon: string;
  targetIcon: string;
};

const jobs: Job[] = [
  {
    id: "loading",
    name: "상하차 알바",
    description: "박스를 창고 표시 지점까지 옮기세요.",
    reward: 1500,
    timeLimit: 30,
    itemIcon: "📦",
    targetIcon: "🏭",
  },
  {
    id: "delivery",
    name: "음식 배달 알바",
    description: "음식을 배달 지점까지 가져가세요.",
    reward: 2200,
    timeLimit: 25,
    itemIcon: "🍔",
    targetIcon: "🏠",
  },
];

const boardSize = 9;
const startPosition: Position = { x: 1, y: 1 };
const itemStartPosition: Position = { x: 3, y: 3 };
const targetPosition: Position = { x: 7, y: 7 };

export default function GamePage() {
  const [cash, setCash] = useState(10000);
  const [warningCount, setWarningCount] = useState(0);
  const [unpaidTax, setUnpaidTax] = useState(0);

  const [selectedJobId, setSelectedJobId] = useState<JobType>("loading");
  const [player, setPlayer] = useState<Position>(startPosition);
  const [item, setItem] = useState<Position>(itemStartPosition);
  const [hasItem, setHasItem] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [message, setMessage] = useState(
    "알바를 선택하고 시작 버튼을 눌러주세요."
  );

  const selectedJob = useMemo(() => {
    return jobs.find((job) => job.id === selectedJobId) ?? jobs[0];
  }, [selectedJobId]);

  const taxRate = getTaxRate(cash);
  const nextTax = calculateTax(cash, unpaidTax);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    if (timeLeft <= 0) {
      setIsPlaying(false);
      setHasItem(false);
      setMessage("시간 초과! 알바에 실패했습니다. 다시 도전해 보세요.");
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isPlaying) {
        return;
      }

      const key = event.key.toLowerCase();

      if (!["w", "a", "s", "d", "arrowup", "arrowleft", "arrowdown", "arrowright"].includes(key)) {
        return;
      }

      event.preventDefault();

      setPlayer((currentPlayer) => {
        const nextPlayer = getNextPosition(currentPlayer, key);
        const limitedPlayer = limitPosition(nextPlayer);

        setItem((currentItem) => {
          if (hasItem) {
            return limitedPlayer;
          }

          return currentItem;
        });

        return limitedPlayer;
      });
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [hasItem, isPlaying]);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    if (!hasItem && isSamePosition(player, item)) {
      setHasItem(true);
      setMessage(`${selectedJob.itemIcon} 물건을 들었습니다. 목표 지점으로 이동하세요!`);
    }

    if (hasItem && isSamePosition(player, targetPosition)) {
      completeJob();
    }
  }, [hasItem, isPlaying, item, player, selectedJob]);

  function startJob(jobId: JobType) {
    const job = jobs.find((targetJob) => targetJob.id === jobId) ?? jobs[0];

    setSelectedJobId(job.id);
    setPlayer(startPosition);
    setItem(itemStartPosition);
    setHasItem(false);
    setTimeLeft(job.timeLimit);
    setIsPlaying(true);
    setMessage(`${job.name} 시작! WASD 또는 방향키로 이동하세요.`);
  }

  function completeJob() {
    setIsPlaying(false);
    setHasItem(false);
    setCash((current) => current + selectedJob.reward);
    setMessage(
      `${selectedJob.name} 성공! ${selectedJob.reward.toLocaleString()}원을 벌었습니다.`
    );
  }

  function payTax() {
    const tax = calculateTax(cash, unpaidTax);

    if (cash >= tax) {
      setCash((current) => current - tax);
      setUnpaidTax(0);
      setWarningCount(0);
      setMessage(`세금 ${tax.toLocaleString()}원을 납부했습니다.`);
      return;
    }

    const nextWarningCount = warningCount + 1;

    if (nextWarningCount >= 3) {
      const seizedCash = Math.floor(cash * 0.8);
      setCash((current) => current - seizedCash);
      setUnpaidTax(0);
      setWarningCount(0);
      setMessage(
        `경고장 3장! 보유 현금의 80%인 ${seizedCash.toLocaleString()}원이 압류되었습니다.`
      );
      return;
    }

    setWarningCount(nextWarningCount);
    setUnpaidTax(tax);
    setMessage(
      `세금을 낼 돈이 부족합니다. 경고장이 ${nextWarningCount}장으로 증가했습니다.`
    );
  }

  function resetMiniGame() {
    setPlayer(startPosition);
    setItem(itemStartPosition);
    setHasItem(false);
    setTimeLeft(selectedJob.timeLimit);
    setIsPlaying(false);
    setMessage("미니게임이 초기화되었습니다. 다시 시작해 주세요.");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #020617 0%, #0f172a 45%, #1e1b4b 100%)",
        color: "white",
        fontFamily: "sans-serif",
        padding: "28px",
      }}
    >
      <section
        style={{
          maxWidth: "1120px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            alignItems: "center",
            marginBottom: "24px",
          }}
        >
          <div>
            <p style={{ margin: 0, color: "#38bdf8", fontWeight: 800 }}>
              ALBA MONEY GAME
            </p>
            <h1 style={{ margin: "6px 0 0", fontSize: "36px" }}>
              알바 머니 게임
            </h1>
          </div>

          <button onClick={payTax} style={taxButtonStyle}>
            세금 내기
          </button>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1.35fr",
            gap: "20px",
          }}
        >
          <aside style={panelStyle}>
            <h2 style={sectionTitleStyle}>내 정보</h2>

            <div style={statGridStyle}>
              <StatCard label="현금" value={`${cash.toLocaleString()}원`} />
              <StatCard label="세율" value={`${(taxRate * 100).toFixed(0)}%`} />
              <StatCard label="미납 세금" value={`${unpaidTax.toLocaleString()}원`} />
              <StatCard label="경고장" value={`${warningCount}장`} />
            </div>

            <div style={noticeStyle}>
              다음 납부 세금은{" "}
              <strong>{nextTax.toLocaleString()}원</strong>입니다. 세금을 계속
              내지 않으면 3번째 경고 때 현금의 80%가 압류됩니다.
            </div>

            <h2 style={{ ...sectionTitleStyle, marginTop: "24px" }}>
              알바 선택
            </h2>

            <div style={{ display: "grid", gap: "12px" }}>
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => startJob(job.id)}
                  style={{
                    ...jobButtonStyle,
                    border:
                      selectedJob.id === job.id
                        ? "2px solid #38bdf8"
                        : "1px solid rgba(255,255,255,0.16)",
                  }}
                >
                  <div style={{ fontSize: "28px" }}>
                    {job.itemIcon} → {job.targetIcon}
                  </div>
                  <div>
                    <strong>{job.name}</strong>
                    <p style={{ margin: "4px 0 0", color: "#cbd5e1" }}>
                      {job.description}
                    </p>
                    <p style={{ margin: "6px 0 0", color: "#86efac" }}>
                      보상 {job.reward.toLocaleString()}원 / 제한시간{" "}
                      {job.timeLimit}초
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section style={panelStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                marginBottom: "16px",
              }}
            >
              <div>
                <h2 style={sectionTitleStyle}>{selectedJob.name}</h2>
                <p style={{ margin: "6px 0 0", color: "#cbd5e1" }}>
                  {selectedJob.description}
                </p>
              </div>

              <div style={timerStyle}>⏱ {timeLeft}s</div>
            </div>

            <GameBoard
              player={player}
              item={item}
              hasItem={hasItem}
              selectedJob={selectedJob}
            />

            <div style={controlBoxStyle}>
              <p style={{ margin: 0 }}>
                이동: <strong>WASD</strong> 또는 <strong>방향키</strong>
              </p>
              <p style={{ margin: "6px 0 0", color: "#cbd5e1" }}>
                1. 캐릭터를 물건 위치로 이동 → 2. 물건을 들고 목표 지점으로 이동
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
              <button
                onClick={() => startJob(selectedJob.id)}
                style={startButtonStyle}
              >
                현재 알바 시작
              </button>

              <button onClick={resetMiniGame} style={resetButtonStyle}>
                초기화
              </button>
            </div>

            <div style={messageStyle}>{message}</div>
          </section>
        </div>
      </section>
    </main>
  );
}

function GameBoard({
  player,
  item,
  hasItem,
  selectedJob,
}: {
  player: Position;
  item: Position;
  hasItem: boolean;
  selectedJob: Job;
}) {
  const cells = [];

  for (let y = 0; y < boardSize; y += 1) {
    for (let x = 0; x < boardSize; x += 1) {
      const position = { x, y };
      const isPlayer = isSamePosition(player, position);
      const isItem = !hasItem && isSamePosition(item, position);
      const isTarget = isSamePosition(targetPosition, position);

      cells.push(
        <div key={`${x}-${y}`} style={cellStyle}>
          {isTarget && <span style={targetStyle}>{selectedJob.targetIcon}</span>}
          {isItem && <span style={itemStyle}>{selectedJob.itemIcon}</span>}
          {isPlayer && (
            <span style={playerStyle}>{hasItem ? "🧍‍♂️" : "🙂"}</span>
          )}
        </div>
      );
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${boardSize}, 1fr)`,
        gap: "6px",
        background: "rgba(15,23,42,0.9)",
        border: "1px solid rgba(255,255,255,0.12)",
        padding: "12px",
        borderRadius: "18px",
      }}
    >
      {cells}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={statCardStyle}>
      <p style={{ margin: "0 0 8px", color: "#94a3b8", fontSize: "14px" }}>
        {label}
      </p>
      <strong style={{ fontSize: "22px" }}>{value}</strong>
    </div>
  );
}

function getTaxRate(cash: number) {
  if (cash <= 100_000) return 0.01;
  if (cash <= 1_000_000) return 0.05;
  if (cash <= 10_000_000) return 0.1;
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
    x: Math.max(0, Math.min(boardSize - 1, position.x)),
    y: Math.max(0, Math.min(boardSize - 1, position.y)),
  };
}

function isSamePosition(a: Position, b: Position) {
  return a.x === b.x && a.y === b.y;
}

const panelStyle = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "24px",
  padding: "22px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: "22px",
};

const statGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
};

const statCardStyle = {
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "16px",
  padding: "16px",
};

const noticeStyle = {
  marginTop: "16px",
  background: "rgba(56,189,248,0.12)",
  border: "1px solid rgba(56,189,248,0.28)",
  borderRadius: "16px",
  padding: "14px",
  color: "#e0f2fe",
  lineHeight: 1.6,
};

const jobButtonStyle = {
  width: "100%",
  display: "flex",
  gap: "14px",
  textAlign: "left" as const,
  background: "rgba(15,23,42,0.72)",
  color: "white",
  borderRadius: "16px",
  padding: "16px",
  cursor: "pointer",
};

const taxButtonStyle = {
  border: "none",
  background: "#f97316",
  color: "white",
  borderRadius: "14px",
  padding: "14px 18px",
  fontWeight: 900,
  cursor: "pointer",
};

const timerStyle = {
  background: "#020617",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "14px",
  padding: "12px 16px",
  fontWeight: 900,
  color: "#facc15",
};

const cellStyle = {
  height: "52px",
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "26px",
  position: "relative" as const,
};

const playerStyle = {
  position: "absolute" as const,
  zIndex: 3,
  filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.45))",
};

const itemStyle = {
  position: "absolute" as const,
  zIndex: 2,
};

const targetStyle = {
  position: "absolute" as const,
  zIndex: 1,
  opacity: 0.8,
};

const controlBoxStyle = {
  marginTop: "16px",
  background: "rgba(15,23,42,0.72)",
  border: "1px solid rgba(255,255,255,0.12)",
  borderRadius: "16px",
  padding: "14px",
};

const startButtonStyle = {
  border: "none",
  background: "#38bdf8",
  color: "#020617",
  borderRadius: "14px",
  padding: "14px 18px",
  fontWeight: 900,
  cursor: "pointer",
};

const resetButtonStyle = {
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  borderRadius: "14px",
  padding: "14px 18px",
  fontWeight: 900,
  cursor: "pointer",
};

const messageStyle = {
  marginTop: "16px",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.28)",
  color: "#dcfce7",
  borderRadius: "16px",
  padding: "14px",
  minHeight: "50px",
};
