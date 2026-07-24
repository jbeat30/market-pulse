'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, History, Tag, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** 지정 시 이 역할들만 메뉴 노출(미지정이면 전체 역할 노출) */
  visibleToRoles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/search-jobs', label: '검색 이력', icon: History },
  { href: '/settings/categories', label: '카테고리', icon: Tag },
  { href: '/settings/accounts', label: '계정 관리', icon: Users, visibleToRoles: ['SUPER_ADMIN', 'ADMIN'] },
];

/**
 * 어드민 좌측 GNB — 현재 경로 기준 활성 메뉴 표시
 *
 * @description 메뉴 숨김은 UX 편의일 뿐 실질 방어가 아니다 — VIEWER의 계정관리 페이지 직접 접근 차단은
 * 페이지·API 양쪽에서 별도로 강제한다(05-security.md 방어 심층)
 */
export const AdminSidebar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user.role;

  const visibleNavItems = NAV_ITEMS.filter((item) => !item.visibleToRoles || item.visibleToRoles.includes(role ?? ''));

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col overflow-y-auto border-r border-[var(--border)] bg-[var(--background)] px-4 py-6 md:flex">
      <Link href="/dashboard" className="mb-8 px-2">
        <span className="font-emphasis text-[18px] font-bold text-[var(--foreground)]" style={{ letterSpacing: '-0.02em' }}>
          market-pulse
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {visibleNavItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[14px] font-semibold transition-colors ${
                isActive
                  ? 'bg-[var(--brand-subtle)] text-[var(--brand-primary)]'
                  : 'text-[var(--foreground-muted)] hover:bg-[var(--background-muted)]'
              }`}
            >
              <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
