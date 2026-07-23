import { NextResponse } from 'next/server';
import { getSearchJobById, updateSearchJobCategory } from '@/domains/search/service';
import { updateSearchJobCategorySchema } from '@/domains/search/schema';
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
    categoryId: job.categoryId,
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

/** PATCH /api/search-jobs/:id — 검색 작업 카테고리 사후 수정(검색 시점 미지정·오지정 정정) */
export async function PATCH(request: Request, { params }: RouteParams) {
  const { response } = await requireAuth();
  if (response) return response;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateSearchJobCategorySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: '입력값을 확인해 주세요', issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const job = await updateSearchJobCategory(id, parsed.data.categoryId);
    return NextResponse.json({
      id: job.id,
      categoryId: job.categoryId,
      categoryName: job.category?.name ?? null,
    });
  } catch {
    return NextResponse.json({ message: '검색 작업을 찾을 수 없습니다' }, { status: 404 });
  }
}
