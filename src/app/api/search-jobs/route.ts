import { NextResponse } from 'next/server';
import { createAndRunSearchJob, listSearchJobs } from '@/domains/search/service';
import { createSearchJobSchema, listSearchJobsQuerySchema } from '@/domains/search/schema';
import { upsertKeyword } from '@/domains/category/service';

/** GET /api/search-jobs?status=RUNNING&take=20 — 검색 작업 목록 조회 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listSearchJobsQuerySchema.safeParse({
    status: searchParams.get('status') ?? undefined,
    take: searchParams.get('take') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ message: '입력값을 확인해 주세요', issues: parsed.error.issues }, { status: 400 });
  }

  const jobs = await listSearchJobs(parsed.data);
  return NextResponse.json(jobs);
}

/**
 * POST /api/search-jobs — 검색 작업 생성 및 네이버 쇼핑 검색 API 즉시 실행
 *
 * @description 요청 개수(5~40)만큼 상품을 가져온다. 실제 수집 개수가 요청보다 적을 수 있음(허용).
 * 키워드 이력을 upsert(검색 빈도 통계 갱신)한 뒤 검색 작업을 실행한다
 */
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createSearchJobSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: '입력값을 확인해 주세요', issues: parsed.error.issues }, { status: 400 });
  }

  const keywordHistory = await upsertKeyword({
    keyword: parsed.data.keyword,
    categoryId: parsed.data.categoryId,
  });

  const job = await createAndRunSearchJob(parsed.data, keywordHistory.id);
  return NextResponse.json(job, { status: 201 });
}
