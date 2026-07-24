'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ColumnDef } from '@tanstack/react-table';
import { SectionTitle, Badge } from '@/components/common';
import {
  DashboardCard,
  DataTable,
  ProductDetailDrawer,
  ExcelExportButton,
  FilterPanel,
} from '@/components/dashboard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { apiFetch } from '@/lib/apiClient';
import { formatDateTime, formatPrice, getSearchJobStatusMeta } from '@/lib/format';
import type { Category, Product, SearchJob } from '@/types/domain';

const UNCATEGORIZED_GROUP_KEY = '__uncategorized__';
const UNCATEGORIZED_LABEL = '카테고리 미지정';
const ALL_CATEGORY_FILTER_VALUE = '__all__';
const JOB_TABLE_PAGE_SIZE = 10;
const PRODUCT_TABLE_PAGE_SIZE = 10;

interface SearchJobDetail extends SearchJob {
  products: Product[];
}

/** 검색 이력 페이지 — 검색 작업 목록을 데이터 테이블로 표시, 행 클릭 시 팝업에서 수집 상품 데이터 테이블 표시 */
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

  const jobColumns = useMemo<ColumnDef<SearchJob, never>[]>(
    () => [
      {
        id: 'keyword',
        header: '키워드',
        accessorKey: 'keyword',
        cell: ({ row }) => {
          const job = row.original;
          const statusMeta = getSearchJobStatusMeta(job.status);
          return (
            <span className="flex items-center gap-2">
              <span className="font-semibold text-[var(--foreground)]">{job.keyword}</span>
              <Badge text={statusMeta.label} variant={statusMeta.badgeVariant} />
            </span>
          );
        },
      },
      {
        id: 'categoryName',
        header: '카테고리',
        accessorFn: (job) => job.categoryName ?? UNCATEGORIZED_LABEL,
      },
      {
        id: 'collectedCount',
        header: '수집 개수',
        accessorFn: (job) => `${job.collectedCount}/${job.requestedCount}개`,
      },
      {
        id: 'createdAt',
        header: '검색 시각',
        accessorKey: 'createdAt',
        cell: ({ getValue }) => formatDateTime(getValue<string>()),
        sortingFn: (a, b) => new Date(a.original.createdAt).getTime() - new Date(b.original.createdAt).getTime(),
      },
    ],
    [],
  );

  const productColumns = useMemo<ColumnDef<Product, never>[]>(
    () => [
      {
        id: 'title',
        header: '상품명',
        accessorKey: 'title',
        meta: { className: 'max-w-0 w-full' },
        cell: ({ getValue }) => {
          const title = getValue<string>();
          return (
            <span className="block truncate font-medium text-[var(--foreground)]" title={title}>
              {title}
            </span>
          );
        },
      },
      {
        id: 'rank',
        header: '순위',
        accessorKey: 'rank',
        meta: { className: 'w-16' },
        cell: ({ getValue }) => <span className="text-[var(--foreground-subtle)]">{getValue<number | null>() ?? '-'}</span>,
      },
      {
        id: 'price',
        header: '가격',
        accessorKey: 'price',
        meta: { className: 'w-32 text-right' },
        cell: ({ getValue }) => (
          <span className="font-semibold text-[var(--brand-primary)]">{formatPrice(getValue<number | null>())}</span>
        ),
      },
    ],
    [],
  );

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

      <DashboardCard className="!p-4">
        {isLoading ? (
          <p className="px-1 py-4 text-[13px] text-[var(--foreground-subtle)]">불러오는 중...</p>
        ) : (
          <DataTable
            columns={jobColumns}
            data={filteredJobs}
            onRowClick={(job) => setSelectedJobId(job.id)}
            pageSize={JOB_TABLE_PAGE_SIZE}
            emptyMessage={jobs && jobs.length > 0 ? '조건에 맞는 검색 작업이 없습니다' : '실행된 검색 작업이 없습니다'}
          />
        )}
      </DashboardCard>

      <Dialog open={selectedJobId !== null} onOpenChange={(open) => !open && setSelectedJobId(null)}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-4xl">
          {selectedJob && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedJob.keyword}</DialogTitle>
                <p className="text-[12px] text-[var(--foreground-subtle)]">
                  검색 시각 {formatDateTime(selectedJob.createdAt)}
                </p>
                {selectedJob.errorMessage && <p className="text-[13px] text-red-500">{selectedJob.errorMessage}</p>}
              </DialogHeader>

              <div className="flex flex-col gap-4 lg:flex-row">
                <FilterPanel filter={filter} onChange={setFilter} onReset={resetFilter} className="lg:w-[240px] lg:shrink-0" />

                <div className="min-w-0 flex-1">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <Select
                      value={selectedJob.categoryId ?? UNCATEGORIZED_GROUP_KEY}
                      onValueChange={(value) =>
                        updateCategoryMutation.mutate(value === UNCATEGORIZED_GROUP_KEY ? null : value)
                      }
                    >
                      <SelectTrigger className="w-full sm:w-[200px]" aria-label="카테고리 수정">
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

                    <ExcelExportButton onClick={() => {}} disabled={jobProducts.length === 0} />
                  </div>

                  <DataTable
                    columns={productColumns}
                    data={jobProducts}
                    onRowClick={(product) => openInspection(product.id)}
                    pageSize={PRODUCT_TABLE_PAGE_SIZE}
                    emptyMessage="조건에 맞는 상품이 없습니다"
                  />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ProductDetailDrawer
        product={inspectedProduct}
        open={inspectedProductId !== null}
        onOpenChange={(open) => !open && closeInspection()}
      />
    </div>
  );
}
