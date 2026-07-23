'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Activity, PackageCheck, ListChecks, Clock } from 'lucide-react';
import {
  QuickSearchBar,
  StatCard,
  DashboardCard,
  ExcelExportButton,
  StatCardSkeleton,
  SearchJobCardSkeleton,
} from '@/components/dashboard';
import { SectionTitle, Badge } from '@/components/common';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { apiFetch, ApiError } from '@/lib/apiClient';
import { formatDateTime, getSearchJobStatusMeta } from '@/lib/format';
import type { Category, SearchJob } from '@/types/domain';

/** 대시보드 메인 페이지 — 실제 API(TanStack Query) 연결. 네이버 검색 API는 동기 즉시 완료라 "진행 중" 상태는 존재하지 않는다 */
export default function DashboardPage() {
  const queryClient = useQueryClient();
  const selectedCategoryId = useDashboardStore((state) => state.selectedCategoryId);
  const setSelectedCategoryId = useDashboardStore((state) => state.setSelectedCategoryId);
  const selectedKeyword = useDashboardStore((state) => state.selectedKeyword);
  const setSelectedKeyword = useDashboardStore((state) => state.setSelectedKeyword);
  const requestedCount = useDashboardStore((state) => state.requestedCount);
  const setRequestedCount = useDashboardStore((state) => state.setRequestedCount);

  const [searchError, setSearchError] = useState<string | null>(null);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Category[]>('/api/categories'),
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ['search-jobs', 'recent'],
    queryFn: () => apiFetch<SearchJob[]>('/api/search-jobs?take=10'),
  });

  const searchMutation = useMutation({
    mutationFn: () =>
      apiFetch<SearchJob>('/api/search-jobs', {
        method: 'POST',
        body: JSON.stringify({
          keyword: selectedKeyword,
          categoryId: selectedCategoryId,
          requestedCount,
        }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['search-jobs'] });
      setSelectedKeyword('');
      setSearchError(null);
    },
    onError: (error) => {
      setSearchError(error instanceof ApiError ? error.message : '검색에 실패했습니다');
    },
  });

  const handleSearch = () => {
    searchMutation.mutate();
  };

  const recentJobs = jobs ?? [];
  const totalItemsCollected = recentJobs.reduce((sum, job) => sum + job.collectedCount, 0);
  const completedCount = recentJobs.filter((job) => job.status === 'COMPLETED').length;
  const failedCount = recentJobs.filter((job) => job.status === 'FAILED').length;
  const latestJobs = recentJobs.slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle title="대시보드" subtitle="검색 현황을 한눈에 확인하고 새 검색을 실행하세요" />

      <QuickSearchBar
        categories={categories ?? []}
        selectedCategoryId={selectedCategoryId}
        keyword={selectedKeyword}
        requestedCount={requestedCount}
        onCategoryChange={setSelectedCategoryId}
        onKeywordChange={setSelectedKeyword}
        onRequestedCountChange={setRequestedCount}
        onSearch={handleSearch}
        isSubmitting={searchMutation.isPending}
      />
      {searchError && <p className="mt-2 text-[13px] text-red-500">{searchError}</p>}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard label="최근 검색 건수" value={String(recentJobs.length)} icon={<Activity className="h-4 w-4" />} />
            <StatCard label="완료" value={String(completedCount)} icon={<PackageCheck className="h-4 w-4" />} />
            <StatCard
              label="누적 수집 상품"
              value={totalItemsCollected.toLocaleString('ko-KR')}
              icon={<ListChecks className="h-4 w-4" />}
            />
            <StatCard label="실패" value={String(failedCount)} icon={<Clock className="h-4 w-4" />} />
          </>
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[var(--foreground)]">최근 검색 작업</h3>
        <ExcelExportButton onClick={() => {}} disabled />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {isLoading ? (
          <>
            <SearchJobCardSkeleton />
            <SearchJobCardSkeleton />
          </>
        ) : latestJobs.length === 0 ? (
          <DashboardCard className="!p-6 text-center text-[13px] text-[var(--foreground-subtle)]">
            아직 실행된 검색 작업이 없습니다
          </DashboardCard>
        ) : (
          latestJobs.map((job) => {
            const statusMeta = getSearchJobStatusMeta(job.status);
            return (
              <DashboardCard key={job.id} className="!p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[var(--foreground)]">{job.keyword}</span>
                    {job.categoryName && <Badge text={job.categoryName} variant="tech" />}
                    <Badge text={statusMeta.label} variant={statusMeta.badgeVariant} />
                  </div>
                  <span className="text-[12px] text-[var(--foreground-subtle)]">{formatDateTime(job.createdAt)}</span>
                </div>
                <p className="mt-2 text-[13px] text-[var(--foreground-muted)]">
                  {job.collectedCount}/{job.requestedCount}개 수집
                  {job.errorMessage && <span className="ml-2 text-red-500">{job.errorMessage}</span>}
                </p>
              </DashboardCard>
            );
          })
        )}
      </div>
    </div>
  );
}
