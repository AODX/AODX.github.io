"use client";

import { useState } from "react";

export default function GamePage() {
  const [balance, setBalance] = useState(10000);
const [totalAssets] = useState(10000);
const [stocks] = useState(0);
const [crypto] = useState(0);
const [taxWarnings, setTaxWarnings] = useState(0);
const [lastWork, setLastWork] = useState<Date | null>(null);
  const handleWork = () => {
    const now = new Date();
    if (lastWork && now.getTime() - lastWork.getTime() < 60000) {
      alert("1분 후에 다시 알바를 할 수 있습니다.");
      return;
    }

    const earned = Math.floor(Math.random() * 1000) + 500;
    setBalance(balance + earned);
    setTotalAssets(totalAssets + earned);
    setLastWork(now);
  };

  const handlePayTax = () => {
    const taxRate = calculateTaxRate(totalAssets);
    const taxAmount = Math.floor(totalAssets * (taxRate / 100));

    if (balance < taxAmount) {
      alert("세금을 납부할 수 없습니다. 잔액이 부족합니다.");
      return;
    }

    setBalance(balance - taxAmount);
    setTotalAssets(totalAssets - taxAmount);
    alert(`세금 ${taxAmount}원을 납부했습니다.`);
  };

  const calculateTaxRate = (assets: number) => {
    if (assets < 100000) return 5;
    if (assets < 500000) return 10;
    if (assets < 1000000) return 15;
    if (assets < 5000000) return 20;
    return 25;
  };

  return (
    <div>
      <h1>🎮 게임 플레이</h1>

      <div className="grid" style={{ marginTop: "2rem" }}>
        <div className="card" style={{ backgroundColor: "#f0fdf4", borderLeft: "4px solid #10b981" }}>
          <h3>💰 현금</h3>
          <p className="text-large" style={{ color: "#10b981", marginTop: "0.5rem" }}>
            ₩{balance.toLocaleString()}
          </p>
        </div>

        <div className="card" style={{ backgroundColor: "#eff6ff", borderLeft: "4px solid #3b82f6" }}>
          <h3>📊 총 자산</h3>
          <p className="text-large" style={{ color: "#3b82f6", marginTop: "0.5rem" }}>
            ₩{totalAssets.toLocaleString()}
          </p>
        </div>

        <div className="card" style={{ backgroundColor: "#fdf2f8", borderLeft: "4px solid #ec4899" }}>
          <h3>⚠️ 경고장</h3>
          <p className="text-large" style={{ color: "#ec4899", marginTop: "0.5rem" }}>
            {taxWarnings} / 3
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: "2rem" }}>
        <h2>💼 알바하기</h2>
        <p style={{ marginTop: "1rem" }}>
          매 1분마다 500~1500원을 벌 수 있습니다.
        </p>
        <button className="btn-primary" onClick={handleWork} style={{ marginTop: "1rem" }}>
          🏢 알바하기
        </button>
        {lastWork && (
          <p style={{ marginTop: "1rem", color: "#999", fontSize: "0.9rem" }}>
            마지막 알바: {lastWork.toLocaleTimeString()}
          </p>
        )}
      </div>

      <div className="card" style={{ marginTop: "2rem" }}>
        <h2>📈 투자</h2>
        <p style={{ marginTop: "1rem", marginBottom: "1rem" }}>
          주식과 비트코인에 투자하여 자산을 늘릴 수 있습니다.
        </p>
        <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div>
            <h3>📊 주식</h3>
            <p>보유량: {stocks}주</p>
            <p>현재가: ₩{Math.floor(Math.random() * 10000 + 5000).toLocaleString()}</p>
            <button className="btn-primary" style={{ marginTop: "1rem" }} disabled>
              주식 매수 (준비 중)
            </button>
          </div>
          <div>
            <h3>₿ 비트코인</h3>
            <p>보유량: {crypto.toFixed(6)} BTC</p>
            <p>현재가: ₩{Math.floor(Math.random() * 100000000 + 40000000).toLocaleString()}</p>
            <button className="btn-primary" style={{ marginTop: "1rem" }} disabled>
              BTC 매수 (준비 중)
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: "2rem", backgroundColor: "#fef2f2", borderLeft: "4px solid #ef4444" }}>
        <h2>💸 세금 납부</h2>
        <p style={{ marginTop: "1rem" }}>
          자산에 따라 누진세를 납부해야 합니다.
        </p>
        <p style={{ marginTop: "0.5rem", fontWeight: "600" }}>
          현재 세율: {calculateTaxRate(totalAssets)}%
        </p>
        <p style={{ marginTop: "0.5rem", color: "#666" }}>
          예상 세금: ₩{Math.floor(totalAssets * (calculateTaxRate(totalAssets) / 100)).toLocaleString()}
        </p>
        <button className="btn-warning" onClick={handlePayTax} style={{ marginTop: "1rem" }}>
          💳 세금 납부
        </button>
      </div>

      <div className="card" style={{ marginTop: "2rem", backgroundColor: "#f9fafb" }}>
        <h3>📋 게임 정보</h3>
        <ul style={{ marginTop: "1rem", lineHeight: "1.8" }}>
          <li>✅ 알바: 매 1분마다 돈을 벌 수 있습니다.</li>
          <li>📈 투자: 주식과 비트코인에 투자합니다. (구현 예정)</li>
          <li>💸 세금: 자산의 일정 %를 납부해야 합니다.</li>
          <li>⚠️ 경고장: 세금 미납 시 경고장이 누적됩니다.</li>
          <li>🚨 압류: 경고장 3장 시 자산의 80%가 압류됩니다.</li>
        </ul>
      </div>
    </div>
  );
}
