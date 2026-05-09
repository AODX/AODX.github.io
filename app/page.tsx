import Link from "next/link";

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "sans-serif",
        background: "#f1f5f9",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "40px",
          borderRadius: "20px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          textAlign: "center",
        }}
      >
        <h1>알바 머니 게임</h1>
        <p>알바로 돈을 벌고, 세금을 내고, 랭킹에 도전하세요.</p>

        <Link
          href="/game"
          style={{
            display: "inline-block",
            marginTop: "20px",
            padding: "12px 18px",
            background: "black",
            color: "white",
            borderRadius: "12px",
            textDecoration: "none",
          }}
        >
          게임 시작하기
        </Link>
      </div>
    </main>
  );
}
