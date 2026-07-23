/**
 * 도메인 타입 정의
 *
 * @description Chapter 2에서 Prisma 스키마가 생성되면 Prisma 타입을 SSOT로 전환한다.
 * 현재는 03-database-schema.md 설계를 기준으로 한 프론트엔드 전용 타입
 */

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';

export type CrawlStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

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

export interface CrawlJob {
  id: string;
  status: CrawlStatus;
  keyword: string;
  categoryName: string | null;
  totalPages: number;
  currentPage: number;
  progress: number;
  totalItems: number;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
  createdByName: string | null;
}

export interface ProductSpec {
  specKey: string;
  specValue: string;
}

export interface ProductDetailContent {
  textContent: string | null;
}

export interface Product {
  id: string;
  crawlJobId: string;
  naverProductId: string | null;
  title: string;
  price: number | null;
  mallName: string | null;
  productUrl: string | null;
  imageUrl: string | null;
  shippingFee: number | null;
  installFee: number | null;
  rank: number | null;
  page: number | null;
  isAd: boolean;
  specs: ProductSpec[];
  detailContent: ProductDetailContent | null;
}
