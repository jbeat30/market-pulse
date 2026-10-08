import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 설정 파일
 *
 * @description schema.prisma의 datasource 블록은 provider만 선언하고,
 * 실제 연결 문자열은 여기서 환경변수로 주입한다(.env는 자동 로드되지 않아 명시적 로드 필요).
 * quiet: true — dotenv 17.x가 CLI 출력에 자체 홍보 문구를 랜덤 삽입하는 것을 억제
 */
config({ quiet: true });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
