import { NextResponse } from 'next/server';
import { createCrawlJob, listCrawlJobs } from '@/domains/crawler/service';
import { createCrawlJobSchema, listCrawlJobsQuerySchema } from '@/domains/crawler/schema';
import { upsertKeyword } from '@/domains/category/service';

/** GET /api/crawls?status=RUNNING&take=20 — 크롤 잡 목록 조회 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = listCrawlJobsQuerySchema.safeParse({
    status: searchParams.get('status') ?? undefined,
    take: searchParams.get('take') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json({ message: '입력값을 확인해 주세요', issues: parsed.error.issues }, { status: 400 });
  }

  const jobs = await listCrawlJobs(parsed.data);
  return NextResponse.json(jobs);
}

/**
 * POST /api/crawls — 크롤 잡 생성(PENDING)
 *
 * @description 잡 생성과 동시에 키워드 이력을 upsert한다(검색 빈도 통계 갱신).
 * 실제 워커 큐잉·Playwright 실행은 Chapter 3에서 연결 — 여기서는 레코드 생성까지만 담당
 */
export async function POST(request: Request) {
  const body = await request.json();
  const parsed = createCrawlJobSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: '입력값을 확인해 주세요', issues: parsed.error.issues }, { status: 400 });
  }

  const keywordHistory = await upsertKeyword({
    keyword: parsed.data.keyword,
    categoryId: parsed.data.categoryId,
  });

  const job = await createCrawlJob(parsed.data, keywordHistory.id);
  return NextResponse.json(job, { status: 201 });
}
