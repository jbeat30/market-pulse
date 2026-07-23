import { prisma } from '@/lib/prisma';
import type { CreateCrawlJobInput, ListCrawlJobsQuery } from './schema';

/**
 * 크롤 잡 생성 — 상태 머신의 시작점(PENDING)
 *
 * @description keyword는 실행 시점 스냅샷으로 저장한다. keywordId로 연결된
 * KeywordHistory가 이후 수정·삭제돼도 이 잡의 keyword 필드값은 변하지 않아야 하므로,
 * KeywordHistory 갱신(searchCount 증가 등)은 이 함수가 아닌 category 도메인의 upsertKeyword가 담당한다.
 * 실제 워커 큐잉·Playwright 실행은 Chapter 3에서 연결 — 여기서는 PENDING 레코드 생성까지만 담당
 */
export const createCrawlJob = (input: CreateCrawlJobInput, keywordId?: string) => {
  return prisma.crawlJob.create({
    data: {
      keyword: input.keyword,
      categoryId: input.categoryId ?? null,
      keywordId: keywordId ?? null,
      createdById: input.createdById ?? null,
    },
  });
};

/** 크롤 잡 목록 조회 — 최근 생성순, 상태 필터 지원 */
export const listCrawlJobs = (query: ListCrawlJobsQuery) => {
  return prisma.crawlJob.findMany({
    where: query.status ? { status: query.status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: query.take,
    include: {
      category: { select: { name: true } },
      createdBy: { select: { name: true } },
    },
  });
};

/** 단일 크롤 잡 조회 — 상세 화면·폴링용 */
export const getCrawlJobById = (id: string) => {
  return prisma.crawlJob.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      createdBy: { select: { name: true } },
      products: { include: { specs: true, detailContent: true } },
    },
  });
};
