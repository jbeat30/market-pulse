interface LiveBadgeProps {
  text: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** ping 애니메이션 닷 + 텍스트 pill — 크롤 "진행 중" 상태 표시용. jbeat-resume 이식 */
export const LiveBadge = ({ text, size = 'md', className = '' }: LiveBadgeProps) => {
  const textSize = size === 'sm' ? 'text-[12px]' : 'text-[14px]';
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 ${className}`}
      style={{
        background: 'linear-gradient(160deg, var(--background-subtle) 0%, var(--brand-subtle) 100%)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.04)',
      }}
    >
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--brand-primary)] opacity-40" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
      </span>
      <span className={`${textSize} font-semibold text-[var(--foreground)]`} style={{ letterSpacing: '-0.01em' }}>
        {text}
      </span>
    </span>
  );
};
