'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { SectionTitle, Badge } from '@/components/common';
import {
  DashboardCard,
  LiveProgressBar,
  SpecInspectionDrawer,
  ExcelExportButton,
  TableRowSkeleton,
  FilterPanel,
} from '@/components/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockCrawlJobs } from '@/data/mockCrawlJobs';
import { mockProducts } from '@/data/mockProducts';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { useMockLoading } from '@/hooks/useMockLoading';
import { formatDateTime, formatPrice, getCrawlStatusMeta } from '@/lib/format';
import type { CrawlJob } from '@/types/domain';

const CRAWLS_TABLE_COLUMN_COUNT = 7;

/** 크롤 이력 페이지 — 잡 목록 + 완료 잡 클릭 시 수집 상품을 필터링해 드로어에서 열람 */
export default function CrawlsPage() {
  const [selectedJob, setSelectedJob] = useState<CrawlJob | null>(null);
  const inspectedProductId = useDashboardStore((state) => state.inspectedProductId);
  const openInspection = useDashboardStore((state) => state.openInspection);
  const closeInspection = useDashboardStore((state) => state.closeInspection);
  const filter = useDashboardStore((state) => state.filter);
  const setFilter = useDashboardStore((state) => state.setFilter);
  const resetFilter = useDashboardStore((state) => state.resetFilter);
  const isLoading = useMockLoading();

  const jobProducts = selectedJob
    ? mockProducts
        .filter((product) => product.crawlJobId === selectedJob.id)
        .filter((product) => !filter.excludeAds || !product.isAd)
        .filter((product) => filter.minPrice === null || (product.price ?? 0) >= filter.minPrice)
        .filter((product) => filter.maxPrice === null || (product.price ?? 0) <= filter.maxPrice)
    : [];
  const inspectedProduct = mockProducts.find((product) => product.id === inspectedProductId) ?? null;

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle title="크롤 이력" subtitle="실행된 크롤 작업과 취소·실패 사유를 확인하세요" />

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
              <TableHead className="text-right">작업</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                <TableRowSkeleton columns={CRAWLS_TABLE_COLUMN_COUNT} />
                <TableRowSkeleton columns={CRAWLS_TABLE_COLUMN_COUNT} />
                <TableRowSkeleton columns={CRAWLS_TABLE_COLUMN_COUNT} />
              </>
            ) : (
              mockCrawlJobs.map((job) => {
                const statusMeta = getCrawlStatusMeta(job.status);
                return (
                  <TableRow key={job.id} className="cursor-pointer" onClick={() => setSelectedJob(job)}>
                    <TableCell className="font-semibold text-[var(--foreground)]">{job.keyword}</TableCell>
                    <TableCell>{job.categoryName ?? '-'}</TableCell>
                    <TableCell>
                      <Badge text={statusMeta.label} variant={statusMeta.badgeVariant} />
                    </TableCell>
                    <TableCell>{job.totalItems.toLocaleString('ko-KR')}개</TableCell>
                    <TableCell>{formatDateTime(job.createdAt)}</TableCell>
                    <TableCell>{job.createdByName ?? '-'}</TableCell>
                    <TableCell className="text-right">
                      {job.status === 'RUNNING' && (
                        <button
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--foreground-subtle)] hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                          취소
                        </button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </DashboardCard>

      {/* 선택된 잡 상세 — RUNNING이면 진행률, 아니면 필터 패널 + 수집 상품 목록 */}
      {selectedJob && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          {selectedJob.status !== 'RUNNING' && (
            <FilterPanel filter={filter} onChange={setFilter} onReset={resetFilter} />
          )}

          <DashboardCard className={`!p-6 ${selectedJob.status === 'RUNNING' ? 'lg:col-span-2' : ''}`}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[var(--foreground)]">{selectedJob.keyword}</h3>
                {selectedJob.errorMessage && (
                  <p className="mt-1 text-[13px] text-red-500">{selectedJob.errorMessage}</p>
                )}
              </div>
              <ExcelExportButton onClick={() => {}} disabled={jobProducts.length === 0} />
            </div>

            {selectedJob.status === 'RUNNING' ? (
              <LiveProgressBar progress={selectedJob.progress} label={`페이지 ${selectedJob.currentPage}/${selectedJob.totalPages}`} />
            ) : jobProducts.length === 0 ? (
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
                    <div className="flex items-center gap-2">
                      <span className="text-[13.5px] font-medium text-[var(--foreground)]">{product.title}</span>
                      {product.isAd && <Badge text="광고" variant="tech" />}
                    </div>
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

      <SpecInspectionDrawer
        product={inspectedProduct}
        open={inspectedProductId !== null}
        onOpenChange={(open) => !open && closeInspection()}
      />
    </div>
  );
}
