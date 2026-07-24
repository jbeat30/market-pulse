interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

/** 페이지·섹션 제목 컴포넌트 — jbeat-resume 이식 */
export const SectionTitle = ({ title, subtitle, align = 'left' }: SectionTitleProps) => {
  return (
    <div className={`mb-6 md:mb-8 ${align === 'center' ? 'text-center' : ''}`}>
      <h2
        className="font-emphasis text-[22px] font-bold text-[var(--foreground)] md:text-[28px]"
        style={{ letterSpacing: '-0.03em' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-2 text-[14px] text-[var(--foreground-muted)] md:text-[15px]" style={{ letterSpacing: '-0.01em' }}>
          {subtitle}
        </p>
      )}
    </div>
  );
};
