import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

declare global {
  // Next.js 개발 모드 hot-reload 시 전역 캐시로 재사용하기 위한 표준 패턴 — var 필요
  var prismaGlobal: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

/** Prisma client 싱글턴 — 개발 모드 hot-reload마다 새 커넥션이 생성되는 것을 방지 */
export const prisma = globalThis.prismaGlobal ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prismaGlobal = prisma;
}
