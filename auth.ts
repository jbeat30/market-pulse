import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import argon2 from 'argon2';
import { prisma } from '@/lib/prisma';
import authConfig from './auth.config';

/**
 * NextAuth(Auth.js) v5 전체 설정 — API Route Handler(Node.js runtime) 전용
 *
 * @description Credentials provider는 JWT 세션만 지원(database session 불가).
 * userId(로그인 아이디) + password를 User 테이블과 대조해 인증,
 * isActive=false 계정은 로그인 차단(05-security.md). Prisma 사용으로 인해
 * middleware.ts(Edge Runtime)에서 직접 import 금지 — auth.config.ts로 대체
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        userId: { label: '아이디' },
        password: { label: '비밀번호', type: 'password' },
      },
      authorize: async (credentials) => {
        const userId = credentials?.userId;
        const password = credentials?.password;

        if (typeof userId !== 'string' || typeof password !== 'string' || !userId || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { userId } });

        // 계정 존재 여부를 노출하지 않기 위해 미존재/비활성/비밀번호 불일치 모두 동일하게 null 반환
        if (!user || !user.isActive) {
          return null;
        }

        const isPasswordValid = await argon2.verify(user.passwordHash, password);
        if (!isPasswordValid) {
          return null;
        }

        await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

        return {
          id: user.id,
          name: user.name,
          userId: user.userId,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.userId = user.userId;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.userId = token.userId as string;
      session.user.role = token.role as string;
      return session;
    },
  },
});
