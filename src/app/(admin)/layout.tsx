import { AdminSidebar, AdminHeader } from '@/components/dashboard';
import { mockAdminUsers } from '@/data/mockAdminUsers';

/**
 * 어드민 레이아웃
 *
 * @description 사이드바 + 헤더 셸. 실제 세션 기반 라우트 보호는 Chapter 2/4의
 * middleware.ts에서 구현 예정 — Chapter 1은 mock 로그인 사용자로 레이아웃만 완성한다
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = mockAdminUsers[0];

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader userName={currentUser?.name ?? '관리자'} />
        <main className="flex-1 overflow-y-auto px-6 py-8">{children}</main>
      </div>
    </div>
  );
}
