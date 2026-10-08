import { LiveBadge } from '@/components/common';

interface LiveProgressBarProps {
  progress: number;
  label?: string;
  showLiveBadge?: boolean;
}

/**
 * 크롤 실시간 진행률 바
 *
 * @description LiveBadge + 진행 바 조합. jbeat-resume ProgressBar의 시각 언어(브랜드 컬러,
 * transform 기반 트랜지션)를 참고해 크롤 진행률 표시용으로 새로 제작했다(원본은 Lenis 스크롤 전용)
 */
export const LiveProgressBar = ({ progress, label, showLiveBadge = true }: LiveProgressBarProps) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        {showLiveBadge ? <LiveBadge text={label ?? '진행 중'} size="sm" /> : (
          <span className="text-[13px] font-semibold text-[var(--foreground-muted)]">{label}</span>
        )}
        <span className="font-emphasis text-[13px] font-bold text-[var(--brand-primary)]">{clamped}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-[var(--background-muted)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
      >
        <div
          className="h-full rounded-full bg-[var(--brand-primary)] transition-[width] duration-[350ms]"
          style={{ width: `${clamped}%`, transitionTimingFunction: 'var(--ease-smooth)' }}
        />
      </div>
    </div>
  );
};
