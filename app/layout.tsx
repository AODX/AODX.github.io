import type { Metadata, Viewport } from 'next';
import './globals.css';
import './theme-v3.css';

export const metadata: Metadata = {
  title: 'ECLIPSE DUEL · Ascension',
  description: '수집하고, 덱을 구성하고, 실시간으로 겨루는 오리지널 온라인 카드 배틀',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: '#07090e',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
