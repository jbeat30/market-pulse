import { prisma } from '@/lib/prisma';
import type { CreateCategoryInput, UpdateCategoryInput, CreateKeywordInput } from './schema';

/** 카테고리 전체 목록 — 키워드 개수 포함, 정렬순 반환 */
export const listCategories = () => {
  return prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { keywords: true } } },
  });
};

/** 카테고리 생성 */
export const createCategory = (input: CreateCategoryInput) => {
  return prisma.category.create({
    data: {
      name: input.name,
      naverCode: input.naverCode ?? null,
      sortOrder: input.sortOrder,
    },
  });
};

/** 카테고리 수정 — 존재하지 않는 id는 Prisma가 P2025 에러로 처리(호출부에서 구분) */
export const updateCategory = (id: string, input: UpdateCategoryInput) => {
  return prisma.category.update({
    where: { id },
    data: input,
  });
};

/**
 * 카테고리 삭제
 *
 * @description KeywordHistory/SearchJob의 categoryId는 onDelete: SetNull이라
 * 삭제해도 검색 작업 이력은 보존되고 참조만 null로 바뀐다(감사 추적 유지)
 */
export const deleteCategory = (id: string) => {
  return prisma.category.delete({ where: { id } });
};

/** 특정 카테고리(또는 전체) 키워드 이력 목록 — 최근 사용순 */
export const listKeywords = (categoryId?: string) => {
  return prisma.keywordHistory.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy: { lastUsedAt: 'desc' },
    include: { category: { select: { name: true } } },
  });
};

/**
 * 키워드 생성 또는 재사용 처리
 *
 * @description 동일 키워드가 이미 있으면 searchCount를 증가시키고 lastUsedAt을 갱신,
 * 없으면 새로 생성 — 키워드 이력은 검색 실행마다 누적되는 사용 빈도 통계이기 때문
 */
export const upsertKeyword = async (input: CreateKeywordInput) => {
  const existing = await prisma.keywordHistory.findFirst({
    where: { keyword: input.keyword, categoryId: input.categoryId ?? null },
  });

  if (existing) {
    return prisma.keywordHistory.update({
      where: { id: existing.id },
      data: { searchCount: { increment: 1 }, lastUsedAt: new Date() },
    });
  }

  return prisma.keywordHistory.create({
    data: { keyword: input.keyword, categoryId: input.categoryId ?? null, searchCount: 1 },
  });
};
