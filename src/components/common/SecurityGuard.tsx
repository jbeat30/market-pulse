'use client';

import { useEffect } from 'react';

/**
 * SecurityGuard 컴포넌트
 *
 * @description 사이트 전체 보안 이벤트 차단 담당
 * - 우클릭(contextmenu) 방지
 * - 개발자도구 단축키(F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U) 차단
 * SSR 환경에서는 실행되지 않도록 useEffect 내에서만 이벤트 등록.
 * 이는 UX 억제책일 뿐 진짜 방어가 아니다 — 실질 방어는 서버 인증·인가·시크릿 격리다
 */
export const SecurityGuard = () => {
  useEffect(() => {
    const { hostname } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // F12, Ctrl+Shift+I, Ctrl+Shift+J: 개발자도구 열기 / Ctrl+U: 소스 보기
    const handleKeyDown = (e: KeyboardEvent) => {
      const isF12 = e.key === 'F12';
      const isCtrlShiftI = e.ctrlKey && e.shiftKey && e.key === 'I';
      const isCtrlShiftJ = e.ctrlKey && e.shiftKey && e.key === 'J';
      const isCtrlU = e.ctrlKey && e.key === 'u';

      if (isF12 || isCtrlShiftI || isCtrlShiftJ || isCtrlU) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return null;
};
