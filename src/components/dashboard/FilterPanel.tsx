'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ProductFilter {
  minPrice: number | null;
  maxPrice: number | null;
}

interface FilterPanelProps {
  filter: ProductFilter;
  onChange: (partial: Partial<ProductFilter>) => void;
  onReset: () => void;
}

/** 상품 필터 패널 — 가격 범위. border 없이 카드 톤으로 배경 구분 */
export const FilterPanel = ({ filter, onChange, onReset }: FilterPanelProps) => {
  return (
    <div className="toss-card !p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[var(--foreground)]">필터</h3>
        <button
          type="button"
          onClick={onReset}
          className="text-[13px] font-semibold text-[var(--foreground-subtle)] hover:text-[var(--brand-primary)]"
        >
          초기화
        </button>
      </div>

      <div>
        <Label className="mb-2 text-[13px] text-[var(--foreground-muted)]">가격 범위</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="최소"
            value={filter.minPrice ?? ''}
            onChange={(e) => onChange({ minPrice: e.target.value === '' ? null : Number(e.target.value) })}
          />
          <span className="text-[var(--foreground-subtle)]">~</span>
          <Input
            type="number"
            inputMode="numeric"
            placeholder="최대"
            value={filter.maxPrice ?? ''}
            onChange={(e) => onChange({ maxPrice: e.target.value === '' ? null : Number(e.target.value) })}
          />
        </div>
      </div>
    </div>
  );
};
