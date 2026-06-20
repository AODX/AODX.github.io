"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("로그인하거나 새 계정을 만들어주세요.");

  async function signUp() {
    if (!email || !password) {
      setMessage("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("회원가입 완료! 이메일 인증이 필요할 수 있어요. 인증 후 로그인해주세요.");
  }

  async function signIn() {
    if (!email || !password) {
      setMessage("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    window.location.href = "/game";
  }

  return (
    <main
      style={{
        minHeight: "100svh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(135deg, #020617 0%, #0f172a 55%, #1e1b4b 100%)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "rgba(255,255,255,0.09)",
          border: "1px solid rgba(255,255,255,0.18)",
          borderRadius: "24px",
          padding: "28px",
          boxShadow: "0 18px 50px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ marginBottom: "22px" }}>
          <div
            style={{
              color: "#7dd3fc",
              fontWeight: 900,
              letterSpacing: "0.12em",
              fontSize: "13px",
            }}
          >
            ALBA MONEY GAME
          </div>

          <h1 style={{ margin: "6px 0 0", fontSize: "34px" }}>로그인</h1>

          <p style={{ color: "#cbd5e1", lineHeight: 1.5 }}>
            로그인하면 이전에 저장된 현금, 세금, 경고장 상태를 이어서 할 수 있어요.
          </p>
        </div>

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={inputStyle}
        />

        <button onClick={signIn} style={primaryButtonStyle}>
          로그인하고 게임 시작
        </button>

        <button onClick={signUp} style={secondaryButtonStyle}>
          새 계정 만들기
        </button>

        <div
          style={{
            marginTop: "16px",
            padding: "12px",
            borderRadius: "14px",
            background: "rgba(34,197,94,0.12)",
            border: "1px solid rgba(34,197,94,0.28)",
            color: "#dcfce7",
            lineHeight: 1.4,
          }}
        >
          {message}
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  marginBottom: "10px",
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.18)",
  background: "rgba(15,23,42,0.7)",
  color: "white",
  fontSize: "16px",
  outline: "none",
};

const primaryButtonStyle = {
  width: "100%",
  border: "none",
  borderRadius: "14px",
  background: "#38bdf8",
  color: "#020617",
  padding: "14px 16px",
  fontWeight: 900,
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "8px",
};

const secondaryButtonStyle = {
  width: "100%",
  border: "1px solid rgba(255,255,255,0.22)",
  borderRadius: "14px",
  background: "rgba(255,255,255,0.08)",
  color: "white",
  padding: "14px 16px",
  fontWeight: 900,
  fontSize: "16px",
  cursor: "pointer",
  marginTop: "10px",
};
