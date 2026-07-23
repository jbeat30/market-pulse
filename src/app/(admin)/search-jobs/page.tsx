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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { apiFetch } from '@/lib/apiClient';
import { formatDateTime, formatPrice, getSearchJobStatusMeta } from '@/lib/format';
import type { Category, Product, SearchJob } from '@/types/domain';

const UNCATEGORIZED_GROUP_KEY = '__uncategorized__';
const UNCATEGORIZED_LABEL = '카테고리 미지정';

interface SearchJobDetail extends SearchJob {
  products: Product[];
}

/** 검색 시각(YYYY-MM-DD, KST) 기준 날짜 키 추출 */
const toDateKey = (iso: string) =>
  new Date(iso).toLocaleDateString('sv-SE', { timeZone: 'Asia/Seoul' }); // sv-SE 로케일이 YYYY-MM-DD 형식을 그대로 반환

interface CategoryGroup {
  key: string;
  label: string;
  dateGroups: { date: string; jobs: SearchJob[] }[];
}

/** 검색 작업 목록을 카테고리 → 날짜 순으로 그룹핑(같은 카테고리끼리, 같은 날짜끼리 모아 아코디언으로 표시) */
const groupJobsByCategoryAndDate = (jobs: SearchJob[]): CategoryGroup[] => {
  const byCategory = new Map<string, { label: string; jobs: SearchJob[] }>();

  for (const job of jobs) {
    const key = job.categoryId ?? UNCATEGORIZED_GROUP_KEY;
    const label = job.categoryName ?? UNCATEGORIZED_LABEL;
    if (!byCategory.has(key)) byCategory.set(key, { label, jobs: [] });
    byCategory.get(key)!.jobs.push(job);
  }

  return [...byCategory.entries()].map(([key, { label, jobs: categoryJobs }]) => {
    const byDate = new Map<string, SearchJob[]>();
    for (const job of categoryJobs) {
      const dateKey = toDateKey(job.createdAt);
      if (!byDate.has(dateKey)) byDate.set(dateKey, []);
      byDate.get(dateKey)!.push(job);
    }

    const dateGroups = [...byDate.entries()]
      .sort(([a], [b]) => b.localeCompare(a)) // 최신 날짜 먼저
      .map(([date, dateJobs]) => ({ date, jobs: dateJobs }));

    return { key, label, dateGroups };
  });
};

/** 검색 이력 페이지 — 카테고리→날짜 아코디언, 작업 클릭 시 필터 패널 + 수집 상품 목록 */
export default function SearchJobsPage() {
  const queryClient = useQueryClient();
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

  const categoryGroups = useMemo(() => groupJobsByCategoryAndDate(jobs ?? []), [jobs]);

  const jobProducts = (selectedJob?.products ?? [])
    .filter((product) => filter.minPrice === null || (product.price ?? 0) >= filter.minPrice)
    .filter((product) => filter.maxPrice === null || (product.price ?? 0) <= filter.maxPrice);
  const inspectedProduct = jobProducts.find((product) => product.id === inspectedProductId) ?? null;

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle title="검색 이력" subtitle="카테고리·날짜별로 묶인 검색 작업을 확인하세요" />

      <DashboardCard className="!p-2">
        {isLoading ? (
          <p className="px-3 py-4 text-[13px] text-[var(--foreground-subtle)]">불러오는 중...</p>
        ) : categoryGroups.length === 0 ? (
          <p className="px-3 py-4 text-[13px] text-[var(--foreground-subtle)]">실행된 검색 작업이 없습니다</p>
        ) : (
          <Accordion multiple className="px-2">
            {categoryGroups.map((group) => (
              <AccordionItem key={group.key} value={group.key}>
                <AccordionTrigger className="px-2">
                  <span className="text-[14px] font-bold text-[var(--foreground)]">{group.label}</span>
                  <span className="mr-2 text-[12px] font-normal text-[var(--foreground-subtle)]">
                    {group.dateGroups.reduce((sum, d) => sum + d.jobs.length, 0)}건
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <Accordion multiple className="pl-4">
                    {group.dateGroups.map(({ date, jobs: dateJobs }) => (
                      <AccordionItem key={date} value={date}>
                        <AccordionTrigger className="px-2 text-[13px]">
                          <span className="text-[var(--foreground-muted)]">{date}</span>
                          <span className="mr-2 text-[12px] font-normal text-[var(--foreground-subtle)]">
                            {dateJobs.length}건
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col divide-y divide-[var(--border)] pl-2">
                            {dateJobs.map((job) => {
                              const statusMeta = getSearchJobStatusMeta(job.status);
                              return (
                                <button
                                  key={job.id}
                                  type="button"
                                  onClick={() => setSelectedJobId(job.id)}
                                  className={`flex items-center justify-between py-2.5 px-2 text-left text-[13px] hover:bg-[var(--background-muted)] ${
                                    selectedJobId === job.id ? 'bg-[var(--brand-subtle)]' : ''
                                  }`}
                                >
                                  <span className="flex items-center gap-2">
                                    <span className="font-semibold text-[var(--foreground)]">{job.keyword}</span>
                                    <Badge text={statusMeta.label} variant={statusMeta.badgeVariant} />
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
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
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
