import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '캐릭터 미니게임 아레나',
  description: '선택지로 만든 캐릭터로 실시간 미니게임 대결',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
