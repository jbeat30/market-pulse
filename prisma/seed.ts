import argon2 from 'argon2';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';

const SEED_SUPER_ADMIN_USER_ID = 'jbeat';

/**
 * 최고관리자 계정 시드
 *
 * @description 실행: pnpm db:seed. SEED_SUPER_ADMIN_PASSWORD 환경변수 필수(평문 하드코딩 금지, 05-security.md).
 * 이미 동일 userId 계정이 있으면 스킵 — 중복 생성 방지
 */
async function main() {
  const password = process.env.SEED_SUPER_ADMIN_PASSWORD;
  if (!password) {
    console.error('[seed] SEED_SUPER_ADMIN_PASSWORD 환경변수가 필요합니다');
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const existing = await prisma.user.findUnique({ where: { userId: SEED_SUPER_ADMIN_USER_ID } });
  if (existing) {
    console.log(`[seed] userId=${SEED_SUPER_ADMIN_USER_ID} 계정 이미 존재 — 스킵`);
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      userId: SEED_SUPER_ADMIN_USER_ID,
      passwordHash,
      name: SEED_SUPER_ADMIN_USER_ID,
      role: 'SUPER_ADMIN',
      isActive: true,
    },
  });

  console.log(`[seed] 최고관리자 계정 생성 완료 — id=${user.id}, userId=${user.userId}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error('[seed] 실패', error);
  process.exit(1);
});
