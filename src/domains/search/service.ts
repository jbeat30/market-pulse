import { prisma } from '@/lib/prisma';
import { searchNaverShopping, NaverApiError } from './naverClient';
import type { CreateSearchJobInput, ListSearchJobsQuery } from './schema';

/** 검색 작업 목록 조회 — 최근 생성순, 상태 필터 지원 */
export const listSearchJobs = (query: ListSearchJobsQuery) => {
  return prisma.searchJob.findMany({
    where: query.status ? { status: query.status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: query.take,
    include: {
      category: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
  });
};

/** 단일 검색 작업 조회 — 상세 화면·폴링용 */
export const getSearchJobById = (id: string) => {
  return prisma.searchJob.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      createdBy: { select: { name: true } },
      products: true,
    },
  });
};

/**
 * 검색 작업 생성 및 즉시 실행
 *
 * @description PENDING 생성 → RUNNING 전이 → 네이버 쇼핑 검색 API 호출 → 결과 저장 → COMPLETED/FAILED.
 * 네이버 검색 API는 동기 호출(단일 요청/응답)이라 별도 워커 큐 없이 이 함수 내부에서 즉시 처리.
 * 실패해도 예외 재전파 없이 FAILED 상태로 반환 — 호출부(API 라우트)는 항상 SearchJob 레코드 수신
 */
export const createAndRunSearchJob = async (input: CreateSearchJobInput, keywordId?: string) => {
  const job = await prisma.searchJob.create({
    data: {
      keyword: input.keyword,
      categoryId: input.categoryId ?? null,
      keywordId: keywordId ?? null,
      createdById: input.createdById ?? null,
      requestedCount: input.requestedCount,
      status: 'RUNNING',
      startedAt: new Date(),
    },
  });

  try {
    const items = await searchNaverShopping(input.keyword, input.requestedCount);

    await prisma.product.createMany({
      data: items.map((item, index) => ({
        searchJobId: job.id,
        naverProductId: item.productId || null,
        title: item.title.replace(/<\/?b>/g, ''),
        price: item.lprice ? Number(item.lprice) : null,
        highPrice: item.hprice ? Number(item.hprice) : null,
        mallName: item.mallName || null,
        productUrl: item.link,
        imageUrl: item.image || null,
        brand: item.brand || null,
        maker: item.maker || null,
        naverProductType: item.productType || null,
        naverCategory1: item.category1 || null,
        naverCategory2: item.category2 || null,
        naverCategory3: item.category3 || null,
        naverCategory4: item.category4 || null,
        rank: index + 1,
      })),
    });

    return prisma.searchJob.update({
      where: { id: job.id },
      data: {
        status: 'COMPLETED',
        collectedCount: items.length,
        progress: 100,
        finishedAt: new Date(),
      },
    });
  } catch (error) {
    // 사용자 UI에는 비기술적 메시지만 노출(errorMessages 상수는 프론트에서 매핑) — 여기서는 개발자용 원인만 기록
    const message = error instanceof NaverApiError ? error.message : '알 수 없는 오류로 검색에 실패했습니다';
    console.error(`[search.createAndRunSearchJob] jobId=${job.id} 실패 — ${message}`);

    return prisma.searchJob.update({
      where: { id: job.id },
      data: {
        status: 'FAILED',
        errorMessage: message,
        finishedAt: new Date(),
      },
    });
  }
};
