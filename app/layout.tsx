import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'VANTA ARENA',
  description: '랜덤 카드로 캐릭터를 만들고 실시간 미니게임으로 대결하는 온라인 아레나',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
