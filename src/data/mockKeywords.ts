import type { KeywordHistory } from '@/types/domain';

/** 검색 키워드 이력 mock 데이터 — 실제 값은 DB(KeywordHistory)에만 존재 */
export const mockKeywords: KeywordHistory[] = [
  {
    id: 'kw_1',
    keyword: '공기청정기',
    categoryId: 'cat_1',
    categoryName: '생활가전',
    searchCount: 34,
    lastUsedAt: '2026-07-22T09:12:00+09:00',
  },
  {
    id: 'kw_2',
    keyword: '무선청소기',
    categoryId: 'cat_1',
    categoryName: '생활가전',
    searchCount: 21,
    lastUsedAt: '2026-07-21T14:03:00+09:00',
  },
  {
    id: 'kw_3',
    keyword: '에어프라이어',
    categoryId: 'cat_2',
    categoryName: '주방용품',
    searchCount: 45,
    lastUsedAt: '2026-07-23T08:47:00+09:00',
  },
  {
    id: 'kw_4',
    keyword: '수분크림',
    categoryId: 'cat_3',
    categoryName: '뷰티/화장품',
    searchCount: 12,
    lastUsedAt: '2026-07-20T18:30:00+09:00',
  },
];
