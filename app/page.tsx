import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #312e81 100%)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        padding: "24px",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "760px",
          background: "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: "28px",
          padding: "48px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
          textAlign: "center",
          backdropFilter: "blur(12px)",
        }}
      >
        <p style={{ color: "#93c5fd", fontWeight: 700 }}>
          경제 시뮬레이션 웹 게임
        </p>

        <h1
          style={{
            fontSize: "48px",
            lineHeight: 1.1,
            margin: "12px 0 16px",
          }}
        >
          알바 머니 게임
        </h1>

        <p
          style={{
            color: "#cbd5e1",
            fontSize: "18px",
            lineHeight: 1.7,
            marginBottom: "32px",
          }}
        >
          미니게임 알바로 돈을 벌고, 세금을 내고, 자산을 늘려 랭킹에
          도전하세요.
        </p>

        <Link
          href="/game"
          style={{
            display: "inline-block",
            background: "#38bdf8",
            color: "#020617",
            padding: "16px 24px",
            borderRadius: "16px",
            textDecoration: "none",
            fontWeight: 900,
            boxShadow: "0 12px 30px rgba(56,189,248,0.35)",
          }}
        >
          게임 시작하기
        </Link>
      </section>
    </main>
  );
}
