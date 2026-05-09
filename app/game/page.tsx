"use client";

/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useMemo, useState, type CSSProperties } from "react";

type JobId = "sorting" | "delivery" | "cashier" | "rhythm";
type SortKind = "red" | "blue" | "yellow";

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

type RhythmNote = {
  id: number;
  key: string;
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
    subtitle: "템플런처럼 좌우 이동으로 장애물을 피하세요.",
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
    id: "rhythm",
    name: "공연장 스태프 알바",
    subtitle: "리듬에 맞춰 D/F/J/K 키를 입력하세요.",
    reward: 2800,
    timeLimit: 30,
    icon: "🎵",
  },
];

const cashierKeyPool = ["W", "A", "S", "D"];
const rhythmKeys = ["D", "F", "J", "K"];
const sortKinds: SortKind[] = ["red", "blue", "yellow"];

const sortInfo: Record<SortKind, { label: string; emoji: string; key: string }> =
  {
    red: { label: "빨강 구역", emoji: "🟥", key: "1" },
    blue: { label: "파랑 구역", emoji: "🟦", key: "2" },
    yellow: { label: "노랑 구역", emoji: "🟨", key: "3" },
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
    x: 0,
  });
  const [sortScore, setSortScore] = useState(0);
  const [sortMiss, setSortMiss] = useState(0);

  const [runnerLane, setRunnerLane] = useState(1);
  const [runnerDistance, setRunnerDistance] = useState(0);
  const [runnerObstacles, setRunnerObstacles] = useState<RunnerObstacle[]>([]);
  const [runnerObstacleId, setRunnerObstacleId] = useState(1);

  const [cashierSequence, setCashierSequence] = useState<string[]>([]);
  const [cashierIndex, setCashierIndex] = useState(0);

  const [rhythmNotes, setRhythmNotes] = useState<RhythmNote[]>([]);
  const [rhythmScore, setRhythmScore] = useState(0);
  const [rhythmMiss, setRhythmMiss] = useState(0);
  const [rhythmNoteId, setRhythmNoteId] = useState(1);

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
        const nextX = current.x + 0.9;

        if (nextX >= 100) {
          registerSortMiss();
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
        const next = current + 0.35;

        if (next >= 100) {
          completeJob("🛵 배달 완료! 목적지까지 무사히 도착했습니다.");
          return 100;
        }

        return next;
      });

      setRunnerObstacles((current) => {
        const moved = current
          .map((obstacle) => ({ ...obstacle, y: obstacle.y + 1.15 }))
          .filter((obstacle) => obstacle.y <= 110);

        const collision = moved.some(
          (obstacle) =>
            obstacle.lane === runnerLane &&
            obstacle.y >= 75 &&
            obstacle.y <= 90
        );

        if (collision) {
          failJob("💥 장애물에 부딪혔습니다! 배달 실패!");
          return moved;
        }

        if (Math.random() < 0.045) {
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
    }, 45);

    return () => window.clearInterval(timer);
  }, [activeJobId, jobFinished, runnerLane, runnerObstacleId]);

  useEffect(() => {
    if (activeJobId !== "rhythm" || jobFinished) {
      return;
    }

    const timer = window.setInterval(() => {
      setRhythmNotes((current) => {
        const moved = current.map((note) => ({ ...note, y: note.y + 0.85 }));

        const missedNotes = moved.filter((note) => note.y > 100);
        const aliveNotes = moved.filter((note) => note.y <= 100);

        if (missedNotes.length > 0) {
          setRhythmMiss((currentMiss) => {
            const nextMiss = currentMiss + missedNotes.length;

            if (nextMiss >= 3) {
              failJob("🎵 노트를 3번 놓쳤습니다. 알바 실패!");
            }

            return nextMiss;
          });
        }

        if (Math.random() < 0.035) {
          const newNote = {
            id: rhythmNoteId,
            key: rhythmKeys[Math.floor(Math.random() * rhythmKeys.length)],
            y: -10,
          };

          setRhythmNoteId((id) => id + 1);
          return [...aliveNotes, newNote];
        }

        return aliveNotes;
      });
    }, 35);

    return () => window.clearInterval(timer);
  }, [activeJobId, jobFinished, rhythmNoteId]);

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

      if (activeJobId === "rhythm") {
        handleRhythmKey(key);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    activeJobId,
    cashierIndex,
    cashierSequence,
    jobFinished,
    rhythmNotes,
    rhythmScore,
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

    if (jobId === "rhythm") {
      setupRhythmJob();
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

  function setupRhythmJob() {
    setRhythmNotes([]);
    setRhythmScore(0);
    setRhythmMiss(0);
    setRhythmNoteId(1);
    setMessage("🎵 판정선에 노트가 오면 D/F/J/K를 입력하세요.");
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

  function handleRhythmKey(key: string) {
    const pressed = key.toUpperCase();

    if (!rhythmKeys.includes(pressed)) {
      return;
    }

    const targetNote = rhythmNotes.find(
      (note) => note.key === pressed && note.y >= 76 && note.y <= 91
    );

    if (!targetNote) {
      const nextMiss = rhythmMiss + 1;

      setRhythmMiss(nextMiss);

      if (nextMiss >= 3) {
        failJob("🎵 타이밍이 맞지 않았습니다. 알바 실패!");
        return;
      }

      setMessage(`🎵 타이밍이 맞지 않았습니다. 실수 ${nextMiss}/3`);
      return;
    }

    setRhythmNotes((current) =>
      current.filter((note) => note.id !== targetNote.id)
    );

    const nextScore = rhythmScore + 1;

    setRhythmScore(nextScore);

    if (nextScore >= 10) {
      completeJob("🎵 리듬 성공! 공연장 스태프 알바 완료!");
      return;
    }

    setMessage(`🎵 Perfect! ${nextScore}/10`);
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

            {activeJobId === "rhythm" && (
              <RhythmGame
                notes={rhythmNotes}
                score={rhythmScore}
                miss={rhythmMiss}
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

function RhythmGame({
  notes,
  score,
  miss,
}: {
  notes: RhythmNote[];
  score: number;
  miss: number;
}) {
  return (
    <div style={rhythmStageStyle}>
      <div style={miniGameTopInfoStyle}>
        <strong>점수 {score}/10</strong>
        <strong>실수 {miss}/3</strong>
      </div>

      <div style={rhythmLaneWrapStyle}>
        {rhythmKeys.map((key) => (
          <div key={key} style={rhythmLaneStyle}>
            <div style={rhythmKeyLabelStyle}>{key}</div>

            {notes
              .filter((note) => note.key === key)
              .map((note) => (
                <div
                  key={note.id}
                  style={{
                    ...rhythmNoteStyle,
                    top: `${note.y}%`,
                  }}
                >
                  ●
                </div>
              ))}
          </div>
        ))}

        <div style={rhythmJudgeLineStyle} />
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

  if (activeJobId === "rhythm") {
    return "판정선에 맞춰 D/F/J/K 입력";
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
  padding: "10px",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gap: "8px",
};

const lobbyHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "12px",
};

const smallLabelStyle: CSSProperties = {
  color: "#38bdf8",
  fontSize: "11px",
  fontWeight: 900,
  letterSpacing: "0.12em",
};

const mainTitleStyle: CSSProperties = {
  margin: "2px 0",
  fontSize: "28px",
  lineHeight: 1,
};

const subtitleStyle: CSSProperties = {
  margin: 0,
  color: "#cbd5e1",
  fontSize: "13px",
};

const moneyPanelStyle: CSSProperties = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  justifyContent: "flex-end",
  maxWidth: "760px",
};

const statusPillStyle: CSSProperties = {
  background: "rgba(15,23,42,0.75)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "10px",
  padding: "6px 8px",
  minWidth: "76px",
  display: "grid",
  gap: "1px",
  fontSize: "12px",
};

const statusLabelStyle: CSSProperties = {
  color: "#94a3b8",
  fontSize: "10px",
};

const jobGridStyle: CSSProperties = {
  minHeight: 0,
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "8px",
  alignContent: "center",
};

const jobCardStyle: CSSProperties = {
  height: "165px",
  borderRadius: "16px",
  padding: "12px",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  textAlign: "left",
  cursor: "pointer",
  boxShadow: "0 12px 28px rgba(0,0,0,0.22)",
};

const jobIconStyle: CSSProperties = {
  fontSize: "32px",
  marginBottom: "8px",
};

const jobCardTitleStyle: CSSProperties = {
  margin: "0 0 6px",
  fontSize: "17px",
};

const jobCardTextStyle: CSSProperties = {
  margin: 0,
  color: "#cbd5e1",
  lineHeight: 1.35,
  fontSize: "12px",
};

const rewardTextStyle: CSSProperties = {
  marginTop: "9px",
  color: "#86efac",
  fontWeight: 800,
  fontSize: "12px",
};

const lobbyFooterStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
};

const messageBoxStyle: CSSProperties = {
  flex: 1,
  minHeight: "38px",
  display: "flex",
  alignItems: "center",
  background: "rgba(34,197,94,0.12)",
  border: "1px solid rgba(34,197,94,0.28)",
  borderRadius: "12px",
  padding: "8px 10px",
  color: "#dcfce7",
  lineHeight: 1.35,
  fontSize: "13px",
};

const bigStartButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "12px",
  background: "#38bdf8",
  color: "#020617",
  padding: "11px 14px",
  fontWeight: 900,
  fontSize: "13px",
  cursor: "pointer",
};

const jobOnlyLayoutStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  padding: "10px",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gap: "8px",
};

const compactHeaderStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "8px",
};

const jobTitleStyle: CSSProperties = {
  margin: "2px 0 0",
  fontSize: "23px",
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

const jobStageStyle: CSSProperties = {
  minHeight: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const jobFooterStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr auto auto",
  gap: "8px",
  alignItems: "center",
};

const controlHintStyle: CSSProperties = {
  background: "rgba(15,23,42,0.75)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "12px",
  padding: "9px 11px",
  color: "#cbd5e1",
  fontWeight: 800,
  fontSize: "13px",
};

const retryButtonStyle: CSSProperties = {
  border: "none",
  borderRadius: "12px",
  background: "#facc15",
  color: "#020617",
  padding: "9px 12px",
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
  fontSize: "14px",
};

const sortingStageStyle: CSSProperties = {
  width: "min(720px, 92vw)",
  height: "min(360px, 54svh)",
  display: "grid",
  gridTemplateRows: "auto 1fr auto",
  gap: "10px",
};

const conveyorStyle: CSSProperties = {
  position: "relative",
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "22px",
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
  fontSize: "14px",
};

const sortPackageStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: "54px",
  transition: "left 35ms linear",
  zIndex: 3,
};

const sortBinsStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "8px",
};

const sortBinStyle: CSSProperties = {
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "14px",
  padding: "10px",
  textAlign: "center",
  fontWeight: 900,
};

const runnerStageStyle: CSSProperties = {
  width: "min(560px, 92vw)",
  height: "min(430px, 58svh)",
  display: "grid",
  gridTemplateRows: "1fr auto",
  gap: "8px",
};

const runnerRoadStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: "7px",
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "22px",
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
  bottom: "9%",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "38px",
  zIndex: 4,
};

const runnerObstacleStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  fontSize: "36px",
  transition: "top 45ms linear",
};

const runnerProgressStyle: CSSProperties = {
  textAlign: "center",
  color: "#86efac",
  fontWeight: 900,
  fontSize: "14px",
};

const cashierPanelStyle: CSSProperties = {
  width: "min(650px, 90vw)",
  background: "rgba(255,255,255,0.08)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "22px",
  padding: "24px",
  textAlign: "center",
};

const cashierTitleStyle: CSSProperties = {
  color: "#93c5fd",
  fontWeight: 900,
  marginBottom: "14px",
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
  marginTop: "16px",
  color: "#cbd5e1",
  fontSize: "15px",
};

const rhythmStageStyle: CSSProperties = {
  width: "min(620px, 92vw)",
  height: "min(430px, 58svh)",
  display: "grid",
  gridTemplateRows: "auto 1fr",
  gap: "8px",
};

const rhythmLaneWrapStyle: CSSProperties = {
  position: "relative",
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "7px",
  background: "rgba(15,23,42,0.88)",
  border: "1px solid rgba(255,255,255,0.16)",
  borderRadius: "22px",
  padding: "10px",
  overflow: "hidden",
};

const rhythmLaneStyle: CSSProperties = {
  position: "relative",
  background: "rgba(255,255,255,0.07)",
  borderRadius: "16px",
  border: "1px solid rgba(255,255,255,0.10)",
  overflow: "hidden",
};

const rhythmKeyLabelStyle: CSSProperties = {
  position: "absolute",
  bottom: "8px",
  left: "50%",
  transform: "translateX(-50%)",
  width: "46px",
  height: "46px",
  borderRadius: "14px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#38bdf8",
  color: "#020617",
  fontWeight: 900,
  zIndex: 4,
};

const rhythmNoteStyle: CSSProperties = {
  position: "absolute",
  left: "50%",
  transform: "translateX(-50%)",
  color: "#facc15",
  fontSize: "30px",
  zIndex: 3,
  transition: "top 35ms linear",
};

const rhythmJudgeLineStyle: CSSProperties = {
  position: "absolute",
  left: "10px",
  right: "10px",
  bottom: "66px",
  height: "4px",
  background: "#22c55e",
  borderRadius: "999px",
};
