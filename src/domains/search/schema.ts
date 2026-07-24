import { z } from 'zod';

const MIN_REQUESTED_COUNT = 5;
const MAX_REQUESTED_COUNT = 40;

/** 검색 작업 생성 입력 검증 — 요청 개수는 5~40으로 제한(결과가 이보다 적게 나오는 것은 허용) */
export const createSearchJobSchema = z.object({
  keyword: z.string().trim().min(1, '검색 키워드를 입력해 주세요').max(200),
  categoryId: z.string().trim().min(1).nullable().optional(),
  createdById: z.string().trim().min(1).nullable().optional(),
  requestedCount: z.number().int().min(MIN_REQUESTED_COUNT).max(MAX_REQUESTED_COUNT).default(20),
});

export type CreateSearchJobInput = z.infer<typeof createSearchJobSchema>;

/** 검색 작업 목록 조회 필터 */
export const listSearchJobsQuerySchema = z.object({
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListSearchJobsQuery = z.infer<typeof listSearchJobsQuerySchema>;

/** 검색 작업 카테고리 수정 입력 검증 — null은 카테고리 미지정으로 되돌리는 것을 허용 */
export const updateSearchJobCategorySchema = z.object({
  categoryId: z.string().trim().min(1).nullable(),
});

export type UpdateSearchJobCategoryInput = z.infer<typeof updateSearchJobCategorySchema>;
