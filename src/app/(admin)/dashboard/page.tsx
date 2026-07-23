'use client';

import { useState } from 'react';
import { Activity, PackageCheck, ListChecks, Clock } from 'lucide-react';
import { QuickSearchBar, StatCard, DashboardCard, LiveProgressBar, ExcelExportButton } from '@/components/dashboard';
import { SectionTitle, Badge } from '@/components/common';
import { useDashboardStore } from '@/stores/useDashboardStore';
import { mockCategories } from '@/data/mockCategories';
import { mockCrawlJobs } from '@/data/mockCrawlJobs';
import { formatDateTime, getCrawlStatusMeta } from '@/lib/format';

/** 대시보드 메인 페이지 — Chapter 1은 mock 데이터로 인터랙션만 검증, 실제 API 연결은 Chapter 4 */
export default function DashboardPage() {
  const selectedCategoryId = useDashboardStore((state) => state.selectedCategoryId);
  const setSelectedCategoryId = useDashboardStore((state) => state.setSelectedCategoryId);
  const selectedKeyword = useDashboardStore((state) => state.selectedKeyword);
  const setSelectedKeyword = useDashboardStore((state) => state.setSelectedKeyword);

  const [isSearching, setIsSearching] = useState(false);

  const runningJobs = mockCrawlJobs.filter((job) => job.status === 'RUNNING');
  const totalItemsToday = mockCrawlJobs.reduce((sum, job) => sum + job.totalItems, 0);
  const completedCount = mockCrawlJobs.filter((job) => job.status === 'COMPLETED').length;
  const failedCount = mockCrawlJobs.filter((job) => job.status === 'FAILED').length;

  // mock 검색 — 실제 크롤 잡 생성(POST /api/crawls)은 Chapter 2/3에서 연결
  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 1200);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle title="대시보드" subtitle="크롤 현황을 한눈에 확인하고 새 검색을 실행하세요" />

      <QuickSearchBar
        categories={mockCategories}
        selectedCategoryId={selectedCategoryId}
        keyword={selectedKeyword}
        onCategoryChange={setSelectedCategoryId}
        onKeywordChange={setSelectedKeyword}
        onSearch={handleSearch}
        disabled={isSearching}
      />

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="진행 중인 크롤" value={String(runningJobs.length)} icon={<Activity className="h-4 w-4" />} />
        <StatCard label="완료" value={String(completedCount)} icon={<PackageCheck className="h-4 w-4" />} />
        <StatCard label="누적 수집 상품" value={totalItemsToday.toLocaleString('ko-KR')} icon={<ListChecks className="h-4 w-4" />} />
        <StatCard label="실패" value={String(failedCount)} icon={<Clock className="h-4 w-4" />} />
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-[var(--foreground)]">진행 중인 작업</h3>
        <ExcelExportButton onClick={() => {}} disabled />
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {runningJobs.length === 0 && (
          <DashboardCard className="!p-6 text-center text-[13px] text-[var(--foreground-subtle)]">
            진행 중인 크롤 작업이 없습니다
          </DashboardCard>
        )}
        {runningJobs.map((job) => (
          <DashboardCard key={job.id} className="!p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-[var(--foreground)]">{job.keyword}</span>
                {job.categoryName && <Badge text={job.categoryName} variant="tech" />}
              </div>
              <span className="text-[12px] text-[var(--foreground-subtle)]">{formatDateTime(job.startedAt)} 시작</span>
            </div>
            <LiveProgressBar progress={job.progress} label={`${getCrawlStatusMeta(job.status).label} · 페이지 ${job.currentPage}/${job.totalPages}`} />
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
