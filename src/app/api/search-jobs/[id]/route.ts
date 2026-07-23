import { NextResponse } from 'next/server';
import { getSearchJobById } from '@/domains/search/service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/search-jobs/:id — 검색 작업 상세 조회(수집 상품 포함) */
export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const job = await getSearchJobById(id);

  if (!job) {
    return NextResponse.json({ message: '검색 작업을 찾을 수 없습니다' }, { status: 404 });
  }

  return NextResponse.json(job);
}
