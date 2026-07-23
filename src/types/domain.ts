/**
 * 도메인 타입 정의
 *
 * @description prisma/schema.prisma를 기준으로 한 프론트엔드 전용 타입.
 * 네이버 쇼핑 검색 API(openapi.naver.com/v1/search/shop.json) 기반 — Playwright 크롤링 아님
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';

export type SearchJobStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  naverCode: string | null;
  isActive: boolean;
  sortOrder: number;
  keywordCount: number;
}

export interface KeywordHistory {
  id: string;
  keyword: string;
  categoryId: string | null;
  categoryName: string | null;
  searchCount: number;
  lastUsedAt: string;
}

export interface SearchJob {
  id: string;
  status: SearchJobStatus;
  keyword: string;
  categoryName: string | null;
  requestedCount: number;
  collectedCount: number;
  progress: number;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  createdByName: string | null;
}

export interface Product {
  id: string;
  searchJobId: string;
  naverProductId: string | null;
  title: string;
  price: number | null;
  highPrice: number | null;
  mallName: string | null;
  productUrl: string;
  imageUrl: string | null;
  brand: string | null;
  maker: string | null;
  naverProductType: string | null;
  naverCategory1: string | null;
  naverCategory2: string | null;
  naverCategory3: string | null;
  naverCategory4: string | null;
  rank: number | null;
}
