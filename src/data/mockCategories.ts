import type { Category } from '@/types/domain';

/**
 * 카테고리 mock 데이터
 *
 * @description Chapter 1 UI 검증 전용 더미 값. 실제 크롤 대상 카테고리는 DB(Category 테이블)에만 존재하며
 * 소스에 하드코딩하지 않는다(05-security.md 비밀유지 원칙)
 */
export const mockCategories: Category[] = [
  { id: 'cat_1', name: '생활가전', naverCode: '50000123', isActive: true, sortOrder: 0, keywordCount: 12 },
  { id: 'cat_2', name: '주방용품', naverCode: '50000456', isActive: true, sortOrder: 1, keywordCount: 8 },
  { id: 'cat_3', name: '뷰티/화장품', naverCode: '50000789', isActive: true, sortOrder: 2, keywordCount: 15 },
  { id: 'cat_4', name: '스포츠/레저', naverCode: null, isActive: false, sortOrder: 3, keywordCount: 3 },
];
