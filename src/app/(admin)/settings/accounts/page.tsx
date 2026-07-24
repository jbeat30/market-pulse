'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { SectionTitle, Badge } from '@/components/common';
import { DashboardCard, TableRowSkeleton } from '@/components/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiFetch, ApiError } from '@/lib/apiClient';
import { formatDateTime } from '@/lib/format';
import type { AdminUser, UserRole } from '@/types/domain';

const ROLE_LABEL: Record<UserRole, string> = {
  SUPER_ADMIN: '최고 관리자',
  ADMIN: '관리자',
  VIEWER: '조회자',
};

const ACCOUNTS_TABLE_COLUMN_COUNT = 5;

/**
 * 어드민 계정 관리 페이지
 *
 * @description 계정 조회는 로그인한 모든 관리자 가능, 계정 생성은 SUPER_ADMIN 전용(05-security.md RBAC).
 * API 레벨에서도 role 재검증하므로 이 페이지의 버튼 노출은 UX 편의일 뿐, 실질 방어는 서버 담당
 */
export default function AccountsPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN';
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('VIEWER');
  const [formError, setFormError] = useState<string | null>(null);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => apiFetch<AdminUser[]>('/api/accounts'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<AdminUser>('/api/accounts', {
        method: 'POST',
        body: JSON.stringify({ userId, password, name, role }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      setIsDialogOpen(false);
      setUserId('');
      setPassword('');
      setName('');
      setRole('VIEWER');
      setFormError(null);
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : '계정 생성에 실패했습니다');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle title="계정 관리" subtitle="어드민 계정과 역할을 관리합니다" />

      <DashboardCard className="!p-0">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <h3 className="text-[14px] font-bold text-[var(--foreground)]">전체 계정</h3>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="toss-btn toss-btn-primary !h-9 !px-4 !text-[13px]"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              계정 추가
            </button>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이름</TableHead>
              <TableHead>아이디</TableHead>
              <TableHead>역할</TableHead>
              <TableHead>상태</TableHead>
              <TableHead>최근 로그인</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <>
                <TableRowSkeleton columns={ACCOUNTS_TABLE_COLUMN_COUNT} />
                <TableRowSkeleton columns={ACCOUNTS_TABLE_COLUMN_COUNT} />
                <TableRowSkeleton columns={ACCOUNTS_TABLE_COLUMN_COUNT} />
              </>
            ) : (
              (accounts ?? []).map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-semibold text-[var(--foreground)]">{user.name}</TableCell>
                  <TableCell className="text-[var(--foreground-muted)]">{user.userId}</TableCell>
                  <TableCell>
                    <Badge text={ROLE_LABEL[user.role]} variant={user.role === 'SUPER_ADMIN' ? 'active' : 'tech'} />
                  </TableCell>
                  <TableCell>
                    <Badge text={user.isActive ? '활성' : '비활성'} variant={user.isActive ? 'done' : 'tech'} />
                  </TableCell>
                  <TableCell>{formatDateTime(user.lastLoginAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </DashboardCard>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계정 추가</DialogTitle>
            <DialogDescription>새 어드민 계정을 생성합니다</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="new-userId" className="mb-2">
                아이디
              </Label>
              <Input id="new-userId" value={userId} onChange={(e) => setUserId(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="new-password" className="mb-2">
                비밀번호
              </Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="new-name" className="mb-2">
                이름
              </Label>
              <Input id="new-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label className="mb-2">역할</Label>
              <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                <SelectTrigger className="w-full" aria-label="역할 선택">
                  <SelectValue>{(value: UserRole) => ROLE_LABEL[value]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPER_ADMIN">최고 관리자</SelectItem>
                  <SelectItem value="ADMIN">관리자</SelectItem>
                  <SelectItem value="VIEWER">조회자</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formError && <p className="text-[13px] text-red-500">{formError}</p>}

            <DialogFooter>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="toss-btn toss-btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMutation.isPending ? '생성 중...' : '계정 생성'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
