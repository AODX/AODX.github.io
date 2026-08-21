import type { Metadata, Viewport } from 'next';
import './globals.css';
import './theme-v4.css';
import './theme-v5.css';
import './theme-v6.css';
import './theme-v7.css';
import './theme-v9.css';

export const metadata: Metadata = {
  title: 'ECLIPSE DUEL · Deck Studio',
  description: '320종 카드, 자동 덱 구성, 카드팩과 온라인 대전을 갖춘 오리지널 전략 카드게임',
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
