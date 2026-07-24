import type { NextAuthConfig } from 'next-auth';

/**
 * Edge Runtime(middleware)에서도 안전하게 로드 가능한 NextAuth 설정
 *
 * @description Prisma Client는 Node.js 전용 모듈(node:url 등) 사용으로 Edge Runtime 로드 불가.
 * providers(Credentials.authorize, Prisma 사용)는 auth.ts 전용으로 분리, 이 파일은 미들웨어의
 * 인가 판단(callbacks.authorized)에 필요한 최소 설정만 담아 middleware.ts에서 단독 사용
 */
export default {
  pages: { signIn: '/login' },
  providers: [],
  callbacks: {
    authorized: ({ auth, request }) => {
      const isLoggedIn = Boolean(auth?.user);
      const isLoginPage = request.nextUrl.pathname === '/login';

      if (isLoginPage) return true;
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
