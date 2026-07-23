import { z } from 'zod';

/** 계정 생성 입력 검증 — SUPER_ADMIN만 호출 가능(라우트에서 권한 재검증) */
export const createAccountSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(3, '아이디는 3자 이상이어야 합니다')
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/, '아이디는 영문/숫자/-/_만 사용할 수 있습니다'),
  password: z.string().min(8, '비밀번호는 8자 이상이어야 합니다').max(100),
  name: z.string().trim().min(1, '이름을 입력해 주세요').max(50),
  role: z.enum(['SUPER_ADMIN', 'ADMIN', 'VIEWER']).default('VIEWER'),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;

/** 로그인 입력 검증 */
export const loginSchema = z.object({
  userId: z.string().trim().min(1, '아이디를 입력해 주세요'),
  password: z.string().min(1, '비밀번호를 입력해 주세요'),
});

export type LoginInput = z.infer<typeof loginSchema>;
