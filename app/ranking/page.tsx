"use client";

import { useState, useEffect } from "react";

interface Player {
  rank: number;
  name: string;
  assets: number;
  level: number;
  lastUpdate: string;
}

export default function RankingPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Supabase에서 실제 데이터 조회
    const mockPlayers: Player[] = [
      { rank: 1, name: "goldsmith", assets: 50000000, level: 15, lastUpdate: "2분 전" },
      { rank: 2, name: "investor_pro", assets: 45000000, level: 14, lastUpdate: "5분 전" },
      { rank: 3, name: "crypto_king", assets: 42000000, level: 13, lastUpdate: "1분 전" },
      { rank: 4, name: "stock_master", assets: 38000000, level: 12, lastUpdate: "3분 전" },
      { rank: 5, name: "trader", assets: 35000000, level: 11, lastUpdate: "7분 전" },
      { rank: 6, name: "beginner", assets: 25000000, level: 10, lastUpdate: "10분 전" },
      { rank: 7, name: "newbie", assets: 20000000, level: 8, lastUpdate: "15분 전" },
      { rank: 8, name: "lucky_player", assets: 18000000, level: 7, lastUpdate: "20분 전" },
      { rank: 9, name: "finance_expert", assets: 16000000, level: 6, lastUpdate: "25분 전" },
      { rank: 10, name: "casual_gamer", assets: 14000000, level: 5, lastUpdate: "30분 전" },
    ];
    setPlayers(mockPlayers);
    setLoading(false);
  }, []);

  if (loading) {
    return <div style={{ textAlign: "center", marginTop: "3rem" }}>로딩 중...</div>;
  }

  return (
    <div>
      <h1>🏆 순위표</h1>
      <p style={{ marginTop: "1rem", color: "#ffffff", fontSize: "1.1rem" }}>
        자산이 많은 상위 30명의 플레이어들입니다.
      </p>

      <div className="card" style={{ marginTop: "2rem" }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: "60px", textAlign: "center" }}>순위</th>
              <th style={{ width: "150px" }}>플레이어</th>
              <th style={{ textAlign: "right" }}>자산</th>
              <th style={{ textAlign: "center", width: "80px" }}>레벨</th>
              <th style={{ textAlign: "center" }}>마지막 업데이트</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.rank}>
                <td style={{ textAlign: "center", fontWeight: "600" }}>
                  {player.rank === 1 && "🥇"}
                  {player.rank === 2 && "🥈"}
                  {player.rank === 3 && "🥉"}
                  {player.rank > 3 && player.rank}
                </td>
                <td style={{ fontWeight: "500" }}>{player.name}</td>
                <td style={{ textAlign: "right", fontWeight: "600", color: "#10b981" }}>
                  ₩{player.assets.toLocaleString()}
                </td>
                <td style={{ textAlign: "center" }}>
                  <span className="badge badge-info">Lv.{player.level}</span>
                </td>
                <td style={{ textAlign: "center", color: "#999" }}>{player.lastUpdate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ marginTop: "2rem", backgroundColor: "#f0f9ff", borderLeft: "4px solid #3b82f6" }}>
        <h3>ℹ️ 순위표 정보</h3>
        <ul style={{ marginTop: "1rem", lineHeight: "1.8" }}>
          <li>✅ 상위 30명의 플레이어들이 표시됩니다.</li>
          <li>📊 자산 순으로 정렬됩니다.</li>
          <li>🔄 순위는 5분마다 업데이트됩니다.</li>
          <li>⭐ 상위 3명은 특별한 배지를 받습니다.</li>
          <li>📈 레벨은 게임 진행도를 나타냅니다.</li>
        </ul>
      </div>

      <div className="card" style={{ marginTop: "2rem", backgroundColor: "#fdf2f8" }}>
        <h3>🎯 당신의 순위</h3>
        <p style={{ marginTop: "1rem", fontSize: "1.2rem" }}>
          현재 순위: <strong style={{ color: "#ec4899" }}>로그인 후 확인</strong>
        </p>
        <p style={{ marginTop: "0.5rem", color: "#666" }}>
          로그인하여 게임에 참여하고 순위를 올려보세요!
        </p>
      </div>
    </div>
  );
}
