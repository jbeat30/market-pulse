'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { SectionTitle, Badge } from '@/components/common';
import {
  DashboardCard,
  ProductDetailDrawer,
  ExcelExportButton,
  FilterPanel,
} from '@/components/dashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { apiFetch } from '@/lib/apiClient';
import { formatDateTime, formatPrice, getSearchJobStatusMeta } from '@/lib/format';
import type { Category, Product, SearchJob } from '@/types/domain';

const UNCATEGORIZED_GROUP_KEY = '__uncategorized__';
const UNCATEGORIZED_LABEL = '카테고리 미지정';
const ALL_CATEGORY_FILTER_VALUE = '__all__';

interface SearchJobDetail extends SearchJob {
  products: Product[];
}

/** 검색 이력 페이지 — 카테고리→날짜 아코디언, 작업 클릭 시 필터 패널 + 수집 상품 목록 */
export default function SearchJobsPage() {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORY_FILTER_VALUE);
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

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Category[]>('/api/categories'),
  });

  const { data: selectedJob } = useQuery({
    queryKey: ['search-jobs', selectedJobId],
    queryFn: () => apiFetch<SearchJobDetail>(`/api/search-jobs/${selectedJobId}`),
    enabled: selectedJobId !== null,
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (categoryId: string | null) =>
      apiFetch(`/api/search-jobs/${selectedJobId}`, {
        method: 'PATCH',
        body: JSON.stringify({ categoryId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-jobs'] });
    },
  });

  const activeCategories = (categories ?? []).filter((category) => category.isActive);

  const filteredJobs = useMemo(() => {
    if (categoryFilter === ALL_CATEGORY_FILTER_VALUE) return jobs ?? [];
    const targetId = categoryFilter === UNCATEGORIZED_GROUP_KEY ? null : categoryFilter;
    return (jobs ?? []).filter((job) => job.categoryId === targetId);
  }, [jobs, categoryFilter]);

  const jobProducts = (selectedJob?.products ?? [])
    .filter((product) => filter.minPrice === null || (product.price ?? 0) >= filter.minPrice)
    .filter((product) => filter.maxPrice === null || (product.price ?? 0) <= filter.maxPrice);
  const inspectedProduct = jobProducts.find((product) => product.id === inspectedProductId) ?? null;

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle title="검색 이력" subtitle="실행된 검색 작업을 확인하세요" />

      {activeCategories.length > 0 && (
        <div className="mb-3 flex items-center gap-2">
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value ?? ALL_CATEGORY_FILTER_VALUE)}
          >
            <SelectTrigger className="w-full sm:w-[200px]" aria-label="카테고리 필터">
              <SelectValue>
                {(value: string) => {
                  if (value === ALL_CATEGORY_FILTER_VALUE) return '전체';
                  if (value === UNCATEGORIZED_GROUP_KEY) return UNCATEGORIZED_LABEL;
                  return activeCategories.find((c) => c.id === value)?.name ?? value;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORY_FILTER_VALUE}>전체</SelectItem>
              <SelectItem value={UNCATEGORIZED_GROUP_KEY}>{UNCATEGORIZED_LABEL}</SelectItem>
              {activeCategories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <DashboardCard className="!p-2">
        {isLoading ? (
          <p className="px-3 py-4 text-[13px] text-[var(--foreground-subtle)]">불러오는 중...</p>
        ) : filteredJobs.length === 0 ? (
          <p className="px-3 py-4 text-[13px] text-[var(--foreground-subtle)]">
            {jobs && jobs.length > 0 ? '조건에 맞는 검색 작업이 없습니다' : '실행된 검색 작업이 없습니다'}
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-[var(--border)]">
            {filteredJobs.map((job) => {
              const statusMeta = getSearchJobStatusMeta(job.status);
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => setSelectedJobId(job.id)}
                  className={`flex items-center justify-between py-2.5 px-3 text-left text-[13px] hover:bg-[var(--background-muted)] ${
                    selectedJobId === job.id ? 'bg-[var(--brand-subtle)]' : ''
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-[var(--foreground)]">{job.keyword}</span>
                    <Badge text={statusMeta.label} variant={statusMeta.badgeVariant} />
                    <span className="text-[12px] text-[var(--foreground-subtle)]">
                      {job.categoryName ?? UNCATEGORIZED_LABEL}
                    </span>
                  </span>
                  <span className="flex items-center gap-3 text-[var(--foreground-subtle)]">
                    <span>
                      {job.collectedCount}/{job.requestedCount}개
                    </span>
                    <span>{formatDateTime(job.createdAt)}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </DashboardCard>

      {/* 선택된 작업 상세 — 카테고리 수정 + 필터 패널 + 수집 상품 목록 */}
      {selectedJob && (
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <FilterPanel filter={filter} onChange={setFilter} onReset={resetFilter} />

          <DashboardCard className="!p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-bold text-[var(--foreground)]">{selectedJob.keyword}</h3>
                <p className="mt-1 text-[12px] text-[var(--foreground-subtle)]">
                  검색 시각 {formatDateTime(selectedJob.createdAt)}
                </p>
                {selectedJob.errorMessage && (
                  <p className="mt-1 text-[13px] text-red-500">{selectedJob.errorMessage}</p>
                )}
              </div>
              <ExcelExportButton onClick={() => {}} disabled={jobProducts.length === 0} />
            </div>

            <div className="mb-4">
              <Select
                value={selectedJob.categoryId ?? UNCATEGORIZED_GROUP_KEY}
                onValueChange={(value) =>
                  updateCategoryMutation.mutate(value === UNCATEGORIZED_GROUP_KEY ? null : value)
                }
              >
                <SelectTrigger className="w-full sm:w-[220px]" aria-label="카테고리 수정">
                  <SelectValue>
                    {(value: string) =>
                      value === UNCATEGORIZED_GROUP_KEY
                        ? UNCATEGORIZED_LABEL
                        : ((categories ?? []).find((c) => c.id === value)?.name ?? value)
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={UNCATEGORIZED_GROUP_KEY}>{UNCATEGORIZED_LABEL}</SelectItem>
                  {(categories ?? [])
                    .filter((category) => category.isActive)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
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
