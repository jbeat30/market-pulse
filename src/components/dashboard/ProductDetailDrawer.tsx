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

/**
 * 네이버 productType 코드를 표시용 라벨로 변환
 *
 * @description 네이버 공식 문서에 정의되지 않은 값이라 관찰 기반 추정 라벨
 * (1=가격비교 카탈로그, 2=개별 판매처 직접등록 상품). 그 외 값은 원본 코드 그대로 노출
 */
const getProductTypeLabel = (naverProductType: string | null): string | null => {
  if (naverProductType === '1') return '가격비교 카탈로그(추정)';
  if (naverProductType === '2') return '개별 판매처 상품(추정)';
  return naverProductType;
};

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
            {product.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- 네이버 상품 이미지 도메인이 판매처마다 달라 next/image 원격 도메인 허용 목록 관리가 비효율적
              <img
                src={product.imageUrl}
                alt={product.title}
                className="mb-6 h-48 w-full rounded-xl object-cover"
              />
            )}

            <div className="mb-6 grid grid-cols-2 gap-3 text-[13px]">
              <div>
                <p className="text-[var(--foreground-subtle)]">최고가</p>
                <p className="mt-0.5 font-semibold text-[var(--foreground)]">
                  {formatPrice(product.highPrice, '네이버 미제공')}
                </p>
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
              <div>
                <p className="text-[var(--foreground-subtle)]">상품 유형</p>
                <p className="mt-0.5 font-semibold text-[var(--foreground)]">
                  {getProductTypeLabel(product.naverProductType) ?? '-'}
                </p>
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
