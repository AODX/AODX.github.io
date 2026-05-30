"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function HomePage() {
  useEffect(() => {
    async function checkLogin() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        window.location.href = "/game";
        return;
      }

      window.location.href = "/login";
    }

    checkLogin();
  }, []);

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
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1>알바 머니 게임</h1>
        <p>로그인 상태를 확인하는 중입니다...</p>
      </div>
    </main>
  );
}
