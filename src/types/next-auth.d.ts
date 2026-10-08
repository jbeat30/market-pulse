import type { DefaultSession } from 'next-auth';

/** NextAuth 세션/JWT에 커스텀 필드(id, userId, role)를 추가하는 모듈 확장 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      userId: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User {
    userId: string;
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    userId: string;
    role: string;
  }
}
