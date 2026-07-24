import { NextResponse } from 'next/server';
import { listKeywords } from '@/domains/category/service';
import { requireAuth } from '@/lib/apiAuth';

/** GET /api/keywords?categoryId=xxx — 키워드 이력 조회(전체 또는 카테고리별) */
export async function GET(request: Request) {
  const { response } = await requireAuth();
  if (response) return response;

  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId') ?? undefined;

  const keywords = await listKeywords(categoryId);
  const mapped = keywords.map((keyword) => ({
    id: keyword.id,
    keyword: keyword.keyword,
    categoryId: keyword.categoryId,
    categoryName: keyword.category?.name ?? null,
    searchCount: keyword.searchCount,
    lastUsedAt: keyword.lastUsedAt,
  }));
  return NextResponse.json(mapped);
}
