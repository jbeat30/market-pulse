'use client';

import { ExternalLink } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { formatPrice } from '@/lib/format';
import type { Product } from '@/types/domain';

interface ProductDetailDrawerProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** 상품 상세 열람 드로어 — 네이버 쇼핑 검색 API 응답 필드 기반(우측 슬라이드, shadcn Sheet) */
export const ProductDetailDrawer = ({ product, open, onOpenChange }: ProductDetailDrawerProps) => {
  const naverCategory = product
    ? [product.naverCategory1, product.naverCategory2, product.naverCategory3, product.naverCategory4]
        .filter(Boolean)
        .join(' > ')
    : '';

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
            <div className="mb-6 grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <p className="text-[var(--foreground-subtle)]">최고가</p>
                <p className="mt-0.5 font-semibold text-[var(--foreground)]">{formatPrice(product.highPrice)}</p>
              </div>
              <div>
                <p className="text-[var(--foreground-subtle)]">순위</p>
                <p className="mt-0.5 font-semibold text-[var(--foreground)]">{product.rank ?? '-'}위</p>
              </div>
              <div>
                <p className="text-[var(--foreground-subtle)]">브랜드</p>
                <p className="mt-0.5 font-semibold text-[var(--foreground)]">{product.brand ?? '-'}</p>
              </div>
              <div>
                <p className="text-[var(--foreground-subtle)]">제조사</p>
                <p className="mt-0.5 font-semibold text-[var(--foreground)]">{product.maker ?? '-'}</p>
              </div>
            </div>

            {naverCategory && (
              <div className="mb-6">
                <p className="mb-1.5 text-[13px] text-[var(--foreground-subtle)]">네이버 분류</p>
                <p className="text-[13px] font-medium text-[var(--foreground)]">{naverCategory}</p>
              </div>
            )}

            <a
              href={product.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="toss-btn toss-btn-outline w-full justify-center"
            >
              <ExternalLink className="h-4 w-4" strokeWidth={2} />
              원본 상품 페이지로 이동
            </a>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
