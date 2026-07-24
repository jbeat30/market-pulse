import argon2 from 'argon2';
import { prisma } from '@/lib/prisma';
import type { CreateAccountInput } from './schema';

/** 전체 계정 목록 — 최근 생성순 */
export const listAccounts = () => {
  return prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      userId: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
};

export class DuplicateUserIdError extends Error {}

/**
 * 계정 생성 — SUPER_ADMIN 전용
 *
 * @description 비밀번호는 반드시 argon2 해시로 저장(평문 금지, 05-security.md).
 * userId 중복 시 DuplicateUserIdError를 던져 호출부(API 라우트)에서 409로 매핑
 */
export const createAccount = async (input: CreateAccountInput) => {
  const existing = await prisma.user.findUnique({ where: { userId: input.userId } });
  if (existing) {
    throw new DuplicateUserIdError(`이미 존재하는 아이디입니다: ${input.userId}`);
  }

  const passwordHash = await argon2.hash(input.password);

  return prisma.user.create({
    data: {
      userId: input.userId,
      passwordHash,
      name: input.name,
      role: input.role,
    },
    select: {
      id: true,
      userId: true,
      name: true,
      role: true,
      isActive: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });
};
