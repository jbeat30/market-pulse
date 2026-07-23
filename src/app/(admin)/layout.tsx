import { AdminSidebar, AdminHeader } from '@/components/dashboard';
import { auth } from '../../../auth';

/**
 * 어드민 레이아웃
 *
 * @description 사이드바 + 헤더 셸. proxy(구 middleware)가 미인증 접근을 /login으로 리다이렉트해
 * 이 레이아웃 도달 시점엔 항상 세션 존재(그래도 auth() 결과를 무조건 신뢰하지 않고 옵셔널 체이닝 유지)
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader userName={session?.user?.name ?? '관리자'} />
        <main className="flex-1 overflow-y-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
