import { Skeleton } from '@/components/ui/skeleton';
import { DashboardCard } from './DashboardCard';

/** 대시보드 상단 통계 카드 4개 자리의 로딩 스켈레톤 */
export const StatCardSkeleton = () => (
  <DashboardCard className="!p-6">
    <Skeleton className="h-3 w-20" />
    <Skeleton className="mt-3 h-8 w-16" />
    <Skeleton className="mt-2 h-3 w-24" />
  </DashboardCard>
);

/** 진행 중 크롤 카드 1건 자리의 로딩 스켈레톤 */
export const CrawlJobCardSkeleton = () => (
  <DashboardCard className="!p-5">
    <div className="mb-3 flex items-center justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-3 w-28" />
    </div>
    <Skeleton className="h-2 w-full rounded-full" />
  </DashboardCard>
);

/** 표 형태 목록(크롤 이력, 계정 등) 행 로딩 스켈레톤 */
export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="p-2">
        <Skeleton className="h-4 w-full max-w-32" />
      </td>
    ))}
  </tr>
);
