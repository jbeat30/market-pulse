import type { Metadata } from 'next';
import './globals.css';
import { SecurityGuard, DevToolsGuard } from '@/components/common';

export const metadata: Metadata = {
  title: 'market-pulse — 관리자 대시보드',
  description: '네이버 쇼핑 가격비교 데이터 인텔리전스 관리자 대시보드',
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

/**
 * 저장된 테마를 첫 페인트 이전에 적용하는 인라인 스크립트
 *
 * @description React 하이드레이션 전에 실행되어 라이트→다크 전환 시 깜빡임(FOUC)을 방지한다
 */
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        <SecurityGuard />
        <DevToolsGuard />
        {children}
      </body>
    </html>
  );
}
