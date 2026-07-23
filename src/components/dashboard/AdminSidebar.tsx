'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, Tag, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: '대시보드', icon: LayoutDashboard },
  { href: '/crawls', label: '크롤 이력', icon: History },
  { href: '/settings/categories', label: '카테고리', icon: Tag },
  { href: '/settings/accounts', label: '계정 관리', icon: Users },
];

/** 어드민 좌측 GNB — 현재 경로 기준 활성 메뉴 표시 */
export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--background)] px-4 py-6 md:flex">
      <Link href="/dashboard" className="mb-8 px-2">
        <span className="font-emphasis text-[18px] font-bold text-[var(--foreground)]" style={{ letterSpacing: '-0.02em' }}>
          market-pulse
        </span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
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
