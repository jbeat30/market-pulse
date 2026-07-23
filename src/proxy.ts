import NextAuth from 'next-auth';
import authConfig from '../auth.config';

const { auth } = NextAuth(authConfig);

/**
 * 라우트 보호 프록시(Next.js 16 — 구 middleware.ts 컨벤션)
 *
 * @description (admin) 그룹 전체 경로에 세션 검증, 미인증 시 /login으로 리다이렉트.
 * Proxy는 항상 Node.js 런타임에서 실행되지만, providers(Prisma 사용)는 auth.ts에서만 추가하고
 * 이 파일은 인가 판단(callbacks.authorized)에 필요한 최소 설정(auth.config.ts)만으로 책임 분리.
 * API Route Handlers도 서버 측에서 세션·역할 재검증 필요(05-security.md 방어 심층 원칙)
 */
export const proxy = auth;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
