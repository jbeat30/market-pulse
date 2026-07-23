'use client';

import { Plus } from 'lucide-react';
import { SectionTitle, Badge } from '@/components/common';
import { DashboardCard } from '@/components/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockAdminUsers } from '@/data/mockAdminUsers';
import { formatDateTime } from '@/lib/format';
import type { UserRole } from '@/types/domain';

const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: '최고 관리자',
  ADMIN: '관리자',
  VIEWER: '조회자',
};

/**
 * 어드민 계정 관리 페이지
 *
 * @description 계정·역할 관리는 SUPER_ADMIN만 접근 가능(05-security.md RBAC).
 * Chapter 1은 mock 데이터로 UI만 검증하며, 실제 권한 재검증은 Chapter 4 API 레이어에서 수행
 */
export default function AccountsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle title="계정 관리" subtitle="어드민 계정과 역할을 관리합니다" />

      <DashboardCard className="!p-0">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h3 className="text-[14px] font-bold text-[var(--foreground)]">전체 계정</h3>
          <button type="button" className="toss-btn toss-btn-primary !h-9 !px-4 !text-[13px]">
            <Plus className="h-4 w-4" strokeWidth={2} />
            계정 추가
          </button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>이메일</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>최근 로그인</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockAdminUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-semibold text-[var(--foreground)]">{user.name}</TableCell>
                <TableCell className="text-[var(--foreground-muted)]">{user.email}</TableCell>
                <TableCell>
                  <Badge text={ROLE_LABEL[user.role]} variant={user.role === 'SUPER_ADMIN' ? 'active' : 'tech'} />
                </TableCell>
                <TableCell>
                  <Badge text={user.isActive ? '활성' : '비활성'} variant={user.isActive ? 'done' : 'tech'} />
                </TableCell>
                <TableCell>{formatDateTime(user.lastLoginAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DashboardCard>
    </div>
  );
}
