import type { SearchJobStatus } from '@/types/domain';

/** 원화 가격 포맷 — null일 때 표시할 문구는 fallback으로 지정(기본값 "가격 정보 없음") */
export const formatPrice = (price: number | null, fallback = '가격 정보 없음'): string => {
  if (price === null) return fallback;
  return `${price.toLocaleString('ko-KR')}원`;
};

/** ISO 날짜 문자열을 한국어 날짜·시간 표기로 변환 */
export const formatDateTime = (iso: string | null): string => {
  if (!iso) return '-';
  const date = new Date(iso);
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

interface SearchJobStatusMeta {
  label: string;
  badgeVariant: 'active' | 'done' | 'tech';
}

const SEARCH_JOB_STATUS_META: Record<SearchJobStatus, SearchJobStatusMeta> = {
  PENDING: { label: '대기 중', badgeVariant: 'tech' },
  RUNNING: { label: '진행 중', badgeVariant: 'active' },
  COMPLETED: { label: '완료', badgeVariant: 'done' },
  FAILED: { label: '실패', badgeVariant: 'tech' },
  CANCELLED: { label: '취소됨', badgeVariant: 'tech' },
};

/** 검색 작업 상태값을 사용자 표시용 라벨·뱃지 variant로 변환 — 단일 authoritative 매핑 */
export const getSearchJobStatusMeta = (status: SearchJobStatus): SearchJobStatusMeta =>
  SEARCH_JOB_STATUS_META[status];
