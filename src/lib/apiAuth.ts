import { NextResponse } from 'next/server';
import { auth } from '../../auth';
import type { UserRole } from '@/types/domain';

/**
 * API Route Handler 공용 인가 검증
 *
 * @description proxy(구 middleware)가 페이지 라우트를 보호하지만, API도 서버 측에서 별도
 * 세션·역할 재검증 필요(05-security.md 방어 심층 원칙 — 미들웨어만 신뢰 금지).
 * allowedRoles 지정 시 해당 역할 목록에 포함된 경우만 통과, 미지정 시 로그인 여부만 확인
 */
export const requireAuth = async (allowedRoles?: UserRole | UserRole[]) => {
  const session = await auth();

  if (!session?.user) {
    return { session: null, response: NextResponse.json({ message: '로그인이 필요합니다' }, { status: 401 }) };
  }

  const roles = allowedRoles ? (Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]) : null;
  if (roles && !roles.includes(session.user.role as UserRole)) {
    return { session: null, response: NextResponse.json({ message: '권한이 없습니다' }, { status: 403 }) };
  }

  return { session, response: null };
};
