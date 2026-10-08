export type BadgeVariant = 'tech' | 'active' | 'done' | 'label';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  className?: string;
}

/** 상태 pill, 카테고리 태그, 섹션 라벨 표시용 뱃지 — jbeat-resume 이식 */
export const Badge = ({ text, variant = 'tech', className = '' }: BadgeProps) => {
  if (variant === 'label') {
    return (
      <span
        className={`text-[12px] font-extrabold uppercase text-[var(--brand-primary)] ${className}`}
        style={{ letterSpacing: '0.08em' }}
      >
        {text}
      </span>
    );
  }

  if (variant === 'active') {
    return (
      <span
        className={`inline-flex flex-shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-semibold ${className}`}
        style={{
          background: 'linear-gradient(160deg, var(--background-subtle) 0%, var(--brand-subtle) 100%)',
          color: 'var(--foreground)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.05)',
          letterSpacing: '-0.01em',
        }}
      >
        {text}
      </span>
    );
  }

  if (variant === 'done') {
    return (
      <span
        className={`inline-flex flex-shrink-0 items-center rounded-full px-3 py-1 text-[12px] font-semibold ${className}`}
        style={{
          background: 'linear-gradient(160deg, var(--background-subtle) 0%, var(--background-muted) 100%)',
          color: 'var(--foreground)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08), 0 6px 18px rgba(0,0,0,0.06)',
          letterSpacing: '-0.01em',
        }}
      >
        {text}
      </span>
    );
  }

  // tech (default) — 카테고리/기술 태그용
  return (
    <span
      className={`inline-flex items-center rounded-[10px] px-2.5 py-1 text-[12px] font-semibold text-[var(--foreground)] ${className}`}
      style={{
        background: 'linear-gradient(145deg, var(--background-subtle) 0%, var(--background-muted) 100%)',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)',
        letterSpacing: '-0.01em',
      }}
    >
      {text}
    </span>
  );
};
