#!/usr/bin/env node
/**
 * Prisma CLI 명령을 다이렉트(세션 모드) 연결로 실행하는 래퍼
 *
 * @description Supabase 트랜잭션 모드 풀러(6543, DATABASE_URL)는 DDL 실행이 불안정해
 * migrate/studio 같은 CLI 명령은 세션 모드 풀러(5432, DIRECT_URL)로 실행 필요.
 * prisma.config.ts는 DATABASE_URL 하나만 읽으므로, 이 스크립트가 실행 시점에만
 * process.env.DATABASE_URL을 DIRECT_URL 값으로 덮어써 자식 프로세스에 전달
 */
import { config } from 'dotenv';
import { spawnSync } from 'node:child_process';

config({ quiet: true });

if (!process.env.DIRECT_URL) {
  console.error('[with-direct-url] DIRECT_URL이 .env에 설정되어 있지 않습니다');
  process.exit(1);
}

const [command, ...args] = process.argv.slice(2);

const result = spawnSync(command, args, {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: process.env.DIRECT_URL },
  shell: true,
});

process.exit(result.status ?? 1);
