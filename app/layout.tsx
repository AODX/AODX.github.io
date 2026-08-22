import type { Metadata, Viewport } from 'next';
import './globals.css';
import './theme-v19.css';

export const metadata: Metadata = {
  title: 'ECLIPSE DUEL · Reforged',
  description: '320종 카드, 덱 구성, 카드팩, 프로필 커스터마이징과 온라인 대전을 갖춘 오리지널 전략 카드게임',
  applicationName: 'ECLIPSE DUEL',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#05070b',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
