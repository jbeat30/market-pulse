import type { ReactNode } from 'react';

interface DashboardCardProps {
  children: ReactNode;
  className?: string;
}

/** 대시보드 기본 카드 — border 없이 배경색(--background-subtle)으로 레이어 구분 */
export const DashboardCard = ({ children, className = '' }: DashboardCardProps) => {
  return <div className={`toss-card ${className}`}>{children}</div>;
};

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  hint?: string;
}

/** 지표 카드 — 대시보드 상단 요약 통계용 */
export const StatCard = ({ label, value, icon, hint }: StatCardProps) => {
  return (
    <DashboardCard className="!p-6">
      <div className="flex items-start justify-between">
        <span
          className="text-[11px] font-bold uppercase text-[var(--foreground-subtle)]"
          style={{ letterSpacing: '0.1em' }}
        >
          {label}
        </span>
        {icon && <span className="text-[var(--brand-primary)]">{icon}</span>}
      </div>
      <p className="font-emphasis mt-3 text-[28px] font-bold text-[var(--foreground)]" style={{ letterSpacing: '-0.02em' }}>
        {value}
      </p>
      {hint && <p className="mt-1.5 text-[13px] text-[var(--foreground-muted)]">{hint}</p>}
    </DashboardCard>
  );
};
