import type { Metadata, Viewport } from 'next';
import './globals.css';
import './theme-v4.css';
import './theme-v5.css';
import './theme-v6.css';

export const metadata: Metadata = {
  title: 'ECLIPSE DUEL · Origin Client',
  description: '균열 소환, 공명 융합, 계승 진화와 코인 토스로 완성하는 오리지널 온라인 전략 카드게임',
  applicationName: 'ECLIPSE DUEL',
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#05070d',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
