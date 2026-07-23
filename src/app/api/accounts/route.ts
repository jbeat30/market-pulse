import { NextResponse } from 'next/server';
import { listAccounts, createAccount, DuplicateUserIdError } from '@/domains/account/service';
import { createAccountSchema } from '@/domains/account/schema';
import { requireAuth } from '@/lib/apiAuth';

/** GET /api/accounts — 전체 계정 목록 조회 */
export async function GET() {
  const { response } = await requireAuth();
  if (response) return response;

  const accounts = await listAccounts();
  return NextResponse.json(accounts);
}

/**
 * POST /api/accounts — 계정 생성
 *
 * @description SUPER_ADMIN 전용 — proxy(구 미들웨어)와 별개로 API 레벨에서 역할 재검증(05-security.md 방어 심층)
 */
export async function POST(request: Request) {
  const { response } = await requireAuth('SUPER_ADMIN');
  if (response) return response;

  const body = await request.json();
  const parsed = createAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: '입력값을 확인해 주세요', issues: parsed.error.issues }, { status: 400 });
  }

  try {
    const account = await createAccount(parsed.data);
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateUserIdError) {
      return NextResponse.json({ message: '이미 존재하는 아이디입니다' }, { status: 409 });
    }
    throw error;
  }
}
