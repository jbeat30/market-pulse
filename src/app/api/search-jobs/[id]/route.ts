import { NextResponse } from 'next/server';
import { getSearchJobById } from '@/domains/search/service';
import { requireAuth } from '@/lib/apiAuth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/** GET /api/search-jobs/:id — 검색 작업 상세 조회(수집 상품 포함) */
export async function GET(_request: Request, { params }: RouteParams) {
  const { response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const job = await getSearchJobById(id);

  if (!job) {
    return NextResponse.json({ message: '검색 작업을 찾을 수 없습니다' }, { status: 404 });
  }

  const mapped = {
    id: job.id,
    status: job.status,
    keyword: job.keyword,
    categoryName: job.category?.name ?? null,
    requestedCount: job.requestedCount,
    collectedCount: job.collectedCount,
    progress: job.progress,
    errorMessage: job.errorMessage,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    createdAt: job.createdAt,
    createdByName: job.createdBy?.name ?? null,
    products: job.products,
  };

  return NextResponse.json(mapped);
}
