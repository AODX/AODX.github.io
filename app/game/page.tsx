"use client";

import { useState } from "react";

export default function GamePage() {
  const [balance, setBalance] = useState(10000);
  const [taxWarnings, setTaxWarnings] = useState(0);
  const [unpaidTax, setUnpaidTax] = useState(0);
  const [message, setMessage] = useState("");

  function getTaxRate(cash: number) {
    if (cash <= 100_000) return 0.01;
    if (cash <= 1_000_000) return 0.05;
    if (cash <= 10_000_000) return 0.1;
    return 0.2;
  }

  function calculateTax() {
    return Math.floor(balance * getTaxRate(balance)) + unpaidTax;
  }

  function work() {
    const reward = 1000;
    setBalance((current) => current + reward);
    setMessage(`알바를 해서 ${reward.toLocaleString()}원을 벌었습니다.`);
  }

  function payTax() {
    const tax = calculateTax();

    if (balance >= tax) {
      setBalance((current) => current - tax);
      setUnpaidTax(0);
      setTaxWarnings(0);
      setMessage(`세금 ${tax.toLocaleString()}원을 납부했습니다.`);
      return;
    }

    const nextWarnings = taxWarnings + 1;

    if (nextWarnings >= 3) {
      const seizedAmount = Math.floor(balance * 0.8);
      const remainingBalance = balance - seizedAmount;

      setBalance(remainingBalance);
      setUnpaidTax(0);
      setTaxWarnings(0);
      setMessage(
        `경고장이 3장이 되어 ${seizedAmount.toLocaleString()}원이 압류되었습니다.`
      );
      return;
    }

    setTaxWarnings(nextWarnings);
    setUnpaidTax(tax);
    setMessage(
      `세금을 낼 돈이 부족합니다. 경고장이 ${nextWarnings}장으로 증가했습니다.`
    );
  }

  const taxRate = getTaxRate(balance);
  const nextTax = calculateTax();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f1f5f9",
        padding: "40px",
        fontFamily: "sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "720px",
          margin: "0 auto",
          background: "white",
          padding: "32px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ fontSize: "32px", marginBottom: "8px" }}>
          알바 머니 게임
        </h1>

        <p style={{ color: "#64748b", marginBottom: "28px" }}>
          알바로 돈을 벌고, 세금을 내고, 경고장을 조심하세요.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <div style={cardStyle}>
            <p style={labelStyle}>현재 현금</p>
            <strong style={valueStyle}>{balance.toLocaleString()}원</strong>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>경고장</p>
            <strong style={valueStyle}>{taxWarnings}장</strong>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>미납 세금</p>
            <strong style={valueStyle}>{unpaidTax.toLocaleString()}원</strong>
          </div>

          <div style={cardStyle}>
            <p style={labelStyle}>현재 세율</p>
            <strong style={valueStyle}>{(taxRate * 100).toFixed(0)}%</strong>
          </div>
        </div>

        <div
          style={{
            background: "#f8fafc",
            padding: "16px",
            borderRadius: "12px",
            marginBottom: "24px",
            border: "1px solid #e2e8f0",
          }}
        >
          <p style={{ margin: 0 }}>
            다음 납부 세금: <strong>{nextTax.toLocaleString()}원</strong>
          </p>
          <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: "14px" }}>
            세금을 내지 못하면 경고장이 증가합니다. 경고장이 3장이 되면
            현재 현금의 80%가 압류됩니다.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
          <button onClick={work} style={primaryButtonStyle}>
            알바하기 +1,000원
          </button>

          <button onClick={payTax} style={secondaryButtonStyle}>
            세금 내기
          </button>
        </div>

        {message && (
          <p
            style={{
              background: "#ecfeff",
              border: "1px solid #67e8f9",
              padding: "12px",
              borderRadius: "12px",
              color: "#155e75",
            }}
          >
            {message}
          </p>
        )}
      </section>
    </main>
  );
}

const cardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "16px",
};

const labelStyle = {
  margin: "0 0 8px",
  color: "#64748b",
  fontSize: "14px",
};

const valueStyle = {
  fontSize: "24px",
};

const primaryButtonStyle = {
  border: "none",
  borderRadius: "12px",
  padding: "14px 18px",
  background: "#2563eb",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};

const secondaryButtonStyle = {
  border: "none",
  borderRadius: "12px",
  padding: "14px 18px",
  background: "#16a34a",
  color: "white",
  cursor: "pointer",
  fontWeight: "bold",
};
