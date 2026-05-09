import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "알바 머니 게임",
  description: "경제 시뮬레이션 게임",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
