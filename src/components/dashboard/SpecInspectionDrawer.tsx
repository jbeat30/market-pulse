'use client';

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/common';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/domain';

interface SpecInspectionDrawerProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** 상품 동적 스펙 key-value 열람 드로어 — 우측 슬라이드(shadcn Sheet 기반) */
export const SpecInspectionDrawer = ({ product, open, onOpenChange }: SpecInspectionDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-[17px] font-bold">{product?.title ?? '상품 상세'}</SheetTitle>
          <SheetDescription>
            {product?.mallName ?? '-'} · {formatPrice(product?.price ?? null)}
          </SheetDescription>
        </SheetHeader>

        {product && (
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {product.isAd && (
              <div className="mb-4">
                <Badge text="광고 상품" variant="tech" />
              </div>
            )}

            <div className="mb-6 grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <p className="text-[var(--foreground-subtle)]">배송비</p>
                <p className="mt-0.5 font-semibold text-[var(--foreground)]">{formatPrice(product.shippingFee)}</p>
              </div>
              <div>
                <p className="text-[var(--foreground-subtle)]">설치비</p>
                <p className="mt-0.5 font-semibold text-[var(--foreground)]">{formatPrice(product.installFee)}</p>
              </div>
              <div>
                <p className="text-[var(--foreground-subtle)]">순위</p>
                <p className="mt-0.5 font-semibold text-[var(--foreground)]">{product.rank ?? '-'}위</p>
              </div>
              <div>
                <p className="text-[var(--foreground-subtle)]">수집 페이지</p>
                <p className="mt-0.5 font-semibold text-[var(--foreground)]">{product.page ?? '-'}페이지</p>
              </div>
            </div>

            <h4 className="mb-3 text-[13px] font-bold text-[var(--foreground)]">동적 스펙</h4>
            {product.specs.length === 0 ? (
              <p className="text-[13px] text-[var(--foreground-subtle)]">수집된 스펙 정보가 없습니다</p>
            ) : (
              <dl className="divide-y divide-[var(--border)] overflow-hidden rounded-xl bg-[var(--background-muted)]">
                {product.specs.map((spec) => (
                  <div key={spec.specKey} className="flex justify-between px-4 py-2.5 text-[13px]">
                    <dt className="text-[var(--foreground-muted)]">{spec.specKey}</dt>
                    <dd className="font-medium text-[var(--foreground)]">{spec.specValue}</dd>
                  </div>
                ))}
              </dl>
            )}

            {product.detailContent?.textContent && (
              <>
                <h4 className="mt-6 mb-3 text-[13px] font-bold text-[var(--foreground)]">상세 콘텐츠</h4>
                <p className="text-[13px] leading-relaxed text-[var(--foreground-muted)]">
                  {product.detailContent.textContent}
                </p>
              </>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
