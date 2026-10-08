type NumberBadgeVariant = 'soft' | 'accent' | 'neutral';
type NumberBadgeSize = 'sm' | 'md';

interface NumberBadgeProps {
  value: string | number;
  variant?: NumberBadgeVariant;
  size?: NumberBadgeSize;
}

const sizeClass: Record<NumberBadgeSize, string> = {
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-8 w-8 text-[11px]',
};

/** 숫자/순서 표시용 원형 배지 — jbeat-resume 이식 */
export const NumberBadge = ({ value, variant = 'neutral', size = 'sm' }: NumberBadgeProps) => {
  const variantClass =
    variant === 'accent' ? 'number-badge-accent' : variant === 'soft' ? 'number-badge-soft' : 'number-badge-neutral';

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full font-extrabold tabular-nums leading-[1em] ${sizeClass[size]} ${variantClass}`}
    >
      {value}
    </span>
  );
};
