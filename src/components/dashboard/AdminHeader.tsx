'use client';

import { Bell, BellOff, LogOut } from 'lucide-react';
import { ThemeToggle } from '@/components/common';
import { useDashboardStore } from '@/stores/useDashboardStore';

interface AdminHeaderProps {
  userName: string;
}

/** 어드민 상단 헤더 — 사용자 정보, Web Push 토글, 테마 전환, 로그아웃 진입점 */
export const AdminHeader = ({ userName }: AdminHeaderProps) => {
  const isPushEnabled = useDashboardStore((state) => state.isPushEnabled);
  const setPushEnabled = useDashboardStore((state) => state.setPushEnabled);

  return (
    <header className="flex h-16 shrink-0 items-center justify-end gap-3 border-b border-[var(--border)] px-6">
      <button
        type="button"
        onClick={() => setPushEnabled(!isPushEnabled)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--background)] transition-colors hover:bg-[var(--background-muted)]"
        aria-label={isPushEnabled ? '알림 끄기' : '알림 켜기'}
        aria-pressed={isPushEnabled}
      >
        {isPushEnabled ? (
          <Bell className="h-5 w-5 text-[var(--brand-primary)]" strokeWidth={1.75} />
        ) : (
          <BellOff className="h-5 w-5 text-[var(--foreground-muted)]" strokeWidth={1.75} />
        )}
      </button>

      <ThemeToggle />

      <div className="ml-2 flex items-center gap-2 border-l border-[var(--border)] pl-4">
        <span className="text-[13px] font-semibold text-[var(--foreground)]">{userName}</span>
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-[var(--foreground-subtle)] transition-colors hover:bg-[var(--background-muted)] hover:text-[var(--foreground)]"
          aria-label="로그아웃"
        >
          <LogOut className="h-[18px] w-[18px]" strokeWidth={1.75} />
        </button>
      </div>
    </header>
  );
};
