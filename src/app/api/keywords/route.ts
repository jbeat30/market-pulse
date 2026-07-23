import { NextResponse } from 'next/server';
import { listKeywords } from '@/domains/category/service';

/** GET /api/keywords?categoryId=xxx — 키워드 이력 조회(전체 또는 카테고리별) */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const categoryId = searchParams.get('categoryId') ?? undefined;

  const keywords = await listKeywords(categoryId);
  return NextResponse.json(keywords);
}
