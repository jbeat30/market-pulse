import type { CrawlStatus } from '@/types/domain';

/** 원화 가격 포맷 — null은 "가격 정보 없음"으로 표시 */
export const formatPrice = (price: number | null): string => {
  if (price === null) return '가격 정보 없음';
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

interface CrawlStatusMeta {
  label: string;
  badgeVariant: 'active' | 'done' | 'tech';
}

const CRAWL_STATUS_META: Record<CrawlStatus, CrawlStatusMeta> = {
  PENDING: { label: '대기 중', badgeVariant: 'tech' },
  RUNNING: { label: '진행 중', badgeVariant: 'active' },
  COMPLETED: { label: '완료', badgeVariant: 'done' },
  FAILED: { label: '실패', badgeVariant: 'tech' },
  CANCELLED: { label: '취소됨', badgeVariant: 'tech' },
};

/** 크롤 상태값을 사용자 표시용 라벨·뱃지 variant로 변환 — 단일 authoritative 매핑 */
export const getCrawlStatusMeta = (status: CrawlStatus): CrawlStatusMeta => CRAWL_STATUS_META[status];
