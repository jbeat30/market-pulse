import { z } from 'zod';

/** 카테고리 생성 입력 검증 — 관리자용 표시명은 DB에만 존재(소스 하드코딩 금지 원칙과 무관, 런타임 입력값) */
export const createCategorySchema = z.object({
  name: z.string().trim().min(1, '카테고리명을 입력해 주세요').max(100),
  naverCode: z.string().trim().max(50).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

/** 검색 키워드 생성 입력 검증 */
export const createKeywordSchema = z.object({
  keyword: z.string().trim().min(1, '키워드를 입력해 주세요').max(200),
  categoryId: z.string().trim().min(1).nullable().optional(),
});

export type CreateKeywordInput = z.infer<typeof createKeywordSchema>;
