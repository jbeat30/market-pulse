'use client';

import { useEffect, useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * ThemeToggle 컴포넌트
 *
 * @description 라이트/다크 모드 토글 버튼. jbeat-resume 이식(아이콘만 Lucide로 교체)
 * @returns {JSX.Element} ThemeToggle 엘리먼트
 */
export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);
  const isInitialMount = useRef(true);

  // 마운트 시 저장된 테마 복원 (SSR 하이드레이션 불일치 방지: 서버는 항상 false)
  // localStorage는 클라이언트 전용 API라 마운트 후 1회 동기화가 불가피함
  useEffect(() => {
    try {
      const stored = localStorage.getItem('theme') === 'dark';
      // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage는 클라이언트 전용이라 마운트 후 1회 동기화 불가피
      setIsDark(stored);
    } catch {
      // localStorage 접근 불가 시 기본값 유지
    }
  }, []);

  // 초기 마운트 첫 실행은 건너뛰고, 이후 isDark 변경 시에만 DOM·스토리지 동기화
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    try {
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch {
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] transition-colors hover:bg-[var(--background-muted)]"
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-[var(--foreground-muted)]" strokeWidth={1.75} />
      ) : (
        <Moon className="h-5 w-5 text-[var(--foreground-muted)]" strokeWidth={1.75} />
      )}
    </button>
  );
};
