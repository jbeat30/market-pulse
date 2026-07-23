'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SectionTitle, Badge } from '@/components/common';
import {
  DashboardCard,
  ProductDetailDrawer,
  ExcelExportButton,
  TableRowSkeleton,
  FilterPanel,
} from '@/components/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { apiFetch } from '@/lib/apiClient';
import { formatDateTime, formatPrice, getSearchJobStatusMeta } from '@/lib/format';
import type { Product, SearchJob } from '@/types/domain';

const SEARCH_JOBS_TABLE_COLUMN_COUNT = 6;

interface SearchJobDetail extends SearchJob {
  products: Product[];
}

/** 검색 이력 페이지 — 작업 목록 + 완료 작업 클릭 시 수집 상품을 필터링해 드로어에서 열람 */
export default function SearchJobsPage() {
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const inspectedProductId = useDashboardStore((state) => state.inspectedProductId);
  const openInspection = useDashboardStore((state) => state.openInspection);
  const closeInspection = useDashboardStore((state) => state.closeInspection);
  const filter = useDashboardStore((state) => state.filter);
  const setFilter = useDashboardStore((state) => state.setFilter);
  const resetFilter = useDashboardStore((state) => state.resetFilter);

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['search-jobs', 'all'],
    queryFn: () => apiFetch<SearchJob[]>('/api/search-jobs?take=50'),
  });

  const { data: selectedJob } = useQuery({
    queryKey: ['search-jobs', selectedJobId],
    queryFn: () => apiFetch<SearchJobDetail>(`/api/search-jobs/${selectedJobId}`),
    enabled: selectedJobId !== null,
  });

  const jobProducts = (selectedJob?.products ?? [])
    .filter((product) => filter.minPrice === null || (product.price ?? 0) >= filter.minPrice)
    .filter((product) => filter.maxPrice === null || (product.price ?? 0) <= filter.maxPrice);
  const inspectedProduct = jobProducts.find((product) => product.id === inspectedProductId) ?? null;

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle title="검색 이력" subtitle="실행된 검색 작업과 실패 사유를 확인하세요" />

      <DashboardCard className="!p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>키워드</TableHead>
              <TableHead>카테고리</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>수집 상품</TableHead>
              <TableHead>생성 시각</TableHead>
              <TableHead>실행자</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                <TableRowSkeleton columns={SEARCH_JOBS_TABLE_COLUMN_COUNT} />
                <TableRowSkeleton columns={SEARCH_JOBS_TABLE_COLUMN_COUNT} />
                <TableRowSkeleton columns={SEARCH_JOBS_TABLE_COLUMN_COUNT} />
              </>
            ) : (
              (jobs ?? []).map((job) => {
                const statusMeta = getSearchJobStatusMeta(job.status);
                return (
                  <TableRow key={job.id} className="cursor-pointer" onClick={() => setSelectedJobId(job.id)}>
                    <TableCell className="font-semibold text-[var(--foreground)]">{job.keyword}</TableCell>
                    <TableCell>{job.categoryName ?? '-'}</TableCell>
                    <TableCell>
                      <Badge text={statusMeta.label} variant={statusMeta.badgeVariant} />
                    </TableCell>
                    <TableCell>
                      {job.collectedCount}/{job.requestedCount}개
                    </TableCell>
                    <TableCell>{formatDateTime(job.createdAt)}</TableCell>
                    <TableCell>{job.createdByName ?? '-'}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </DashboardCard>

      {/* 선택된 작업 상세 — 필터 패널 + 수집 상품 목록 */}
      {selectedJob && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <FilterPanel filter={filter} onChange={setFilter} onReset={resetFilter} />

          <DashboardCard className="!p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[var(--foreground)]">{selectedJob.keyword}</h3>
                {selectedJob.errorMessage && (
                  <p className="mt-1 text-[13px] text-red-500">{selectedJob.errorMessage}</p>
                )}
              </div>
              <ExcelExportButton onClick={() => {}} disabled={jobProducts.length === 0} />
            </div>

            {jobProducts.length === 0 ? (
              <p className="text-[13px] text-[var(--foreground-subtle)]">조건에 맞는 상품이 없습니다</p>
            ) : (
              <div className="flex flex-col divide-y divide-[var(--border)]">
                {jobProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => openInspection(product.id)}
                    className="flex items-center justify-between py-3 text-left hover:opacity-70"
                  >
                    <span className="text-[13.5px] font-medium text-[var(--foreground)]">{product.title}</span>
                    <span className="text-[13.5px] font-semibold text-[var(--brand-primary)]">
                      {formatPrice(product.price)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      )}

      <ProductDetailDrawer
        product={inspectedProduct}
        open={inspectedProductId !== null}
        onOpenChange={(open) => !open && closeInspection()}
      />
    </div>
  );
}
