import { z } from 'zod';

/** 크롤 잡 생성 입력 검증 */
export const createCrawlJobSchema = z.object({
  keyword: z.string().trim().min(1, '검색 키워드를 입력해 주세요').max(200),
  categoryId: z.string().trim().min(1).nullable().optional(),
  createdById: z.string().trim().min(1).nullable().optional(),
});

export type CreateCrawlJobInput = z.infer<typeof createCrawlJobSchema>;

/** 크롤 잡 목록 조회 필터 */
export const listCrawlJobsQuerySchema = z.object({
  status: z.enum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED']).optional(),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

export type ListCrawlJobsQuery = z.infer<typeof listCrawlJobsQuerySchema>;
