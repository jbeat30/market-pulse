import { redirect } from 'next/navigation';
import { auth } from '../../../../../auth';

/**
 * 계정 관리 라우트 가드
 *
 * @description VIEWER는 메뉴뿐 아니라 페이지 자체도 접근 불가 — 서버 사이드에서 role 재검증 후
 * 미허용 시 /dashboard로 리다이렉트(05-security.md 방어 심층, 클라이언트 메뉴 숨김만으로는 불충분)
 */
export default async function AccountsLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (session?.user.role === 'VIEWER') {
    redirect('/dashboard');
  }

  return children;
}
