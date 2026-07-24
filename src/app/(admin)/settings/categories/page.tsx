'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
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
import { apiFetch, ApiError } from '@/lib/apiClient';
import { formatDateTime } from '@/lib/format';
import type { Category, KeywordHistory } from '@/types/domain';

const KEYWORDS_TABLE_COLUMN_COUNT = 4;

/**
 * 카테고리·키워드 관리 페이지
 *
 * @description 검색 대상 카테고리·키워드는 DB(Category, KeywordHistory)에만 존재하므로
 * 소스에 실제 값을 하드코딩하지 않는다. TanStack Query로 실제 API와 연결.
 * 카테고리 수정·삭제는 SUPER_ADMIN, ADMIN 전용(05-security.md RBAC) — API 레벨에서도 role 재검증하므로
 * 이 페이지의 버튼 노출은 UX 편의일 뿐, 실질 방어는 서버 담당
 */
export default function CategoriesPage() {
  const { data: session } = useSession();
  const canManageCategories = session?.user.role === 'SUPER_ADMIN' || session?.user.role === 'ADMIN';
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Category[]>('/api/categories'),
  });

  const { data: keywords, isLoading: isKeywordsLoading } = useQuery({
    queryKey: ['keywords', selectedCategoryId],
    queryFn: () =>
      apiFetch<KeywordHistory[]>(
        selectedCategoryId ? `/api/keywords?categoryId=${selectedCategoryId}` : '/api/keywords',
      ),
  });

  // "전체" 카운트는 카테고리별 keywordCount 합산이 아니라 카테고리 미지정 키워드까지 포함한 실제 전체 개수 필요
  const { data: allKeywords } = useQuery({
    queryKey: ['keywords', null],
    queryFn: () => apiFetch<KeywordHistory[]>('/api/keywords'),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      apiFetch<Category>('/api/categories', {
        method: 'POST',
        body: JSON.stringify({ name: newCategoryName }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDialogOpen(false);
      setNewCategoryName('');
      setFormError(null);
    },
    onError: (error) => {
      setFormError(error instanceof ApiError ? error.message : '카테고리 생성에 실패했습니다');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  const updateMutation = useMutation({
    mutationFn: (name: string) =>
      apiFetch<Category>(`/api/categories/${editingCategory?.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      setEditingCategory(null);
      setEditFormError(null);
    },
    onError: (error) => {
      setEditFormError(error instanceof ApiError ? error.message : '카테고리 수정에 실패했습니다');
    },
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(editCategoryName);
  };

  const deleteMutation = useMutation({
    mutationFn: () => apiFetch(`/api/categories/${deletingCategory?.id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['keywords'] });
      if (selectedCategoryId === deletingCategory?.id) setSelectedCategoryId(null);
      setDeletingCategory(null);
    },
  });

  const totalKeywordCount = allKeywords?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle title="카테고리 관리" subtitle="검색 대상 카테고리와 키워드 이력을 관리합니다" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <DashboardCard className="!p-0">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h3 className="text-[14px] font-bold text-[var(--foreground)]">카테고리</h3>
            {canManageCategories && (
              <button
                type="button"
                onClick={() => setIsDialogOpen(true)}
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--brand-primary)] hover:bg-[var(--brand-subtle)]"
                aria-label="카테고리 추가"
              >
                <Plus className="h-4 w-4" strokeWidth={2} />
              </button>
            )}
          </div>
          <div className="flex flex-col divide-y divide-[var(--border)]">
            <button
              type="button"
              onClick={() => setSelectedCategoryId(null)}
              className={`flex items-center justify-between px-5 py-3 text-left text-[13.5px] ${
                selectedCategoryId === null
                  ? 'bg-[var(--brand-subtle)] text-[var(--brand-primary)] font-semibold'
                  : 'text-[var(--foreground)]'
              }`}
            >
              전체
              <span className="text-[12px] text-[var(--foreground-subtle)]">{totalKeywordCount}개</span>
            </button>
            {isCategoriesLoading ? (
              <div className="px-5 py-3 text-[13px] text-[var(--foreground-subtle)]">불러오는 중...</div>
            ) : (
              (categories ?? []).map((category) => (
                <div
                  key={category.id}
                  className={`group flex items-center justify-between px-5 py-3 text-[13.5px] ${
                    selectedCategoryId === category.id
                      ? 'bg-[var(--brand-subtle)] text-[var(--brand-primary)] font-semibold'
                      : 'text-[var(--foreground)]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId(category.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  >
                    <span className="truncate">{category.name}</span>
                    {!category.isActive && <Badge text="비활성" variant="tech" />}
                  </button>

                  <div className="flex items-center gap-1">
                    <span className="text-[12px] text-[var(--foreground-subtle)]">{category.keywordCount}개</span>
                    {canManageCategories && (
                      <span className="flex items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCategory(category);
                            setEditCategoryName(category.name);
                            setEditFormError(null);
                          }}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--foreground-subtle)] hover:bg-[var(--background-muted)] hover:text-[var(--foreground)]"
                          aria-label={`${category.name} 수정`}
                        >
                          <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(category)}
                          className="inline-flex h-6 w-6 items-center justify-center rounded-md text-[var(--foreground-subtle)] hover:bg-red-50 hover:text-red-500"
                          aria-label={`${category.name} 삭제`}
                        >
                          <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </DashboardCard>

        <DashboardCard className="!p-0">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h3 className="text-[14px] font-bold text-[var(--foreground)]">키워드 이력</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>키워드</TableHead>
                <TableHead>카테고리</TableHead>
                <TableHead>사용 횟수</TableHead>
                <TableHead>최근 사용</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isKeywordsLoading ? (
                <>
                  <TableRowSkeleton columns={KEYWORDS_TABLE_COLUMN_COUNT} />
                  <TableRowSkeleton columns={KEYWORDS_TABLE_COLUMN_COUNT} />
                  <TableRowSkeleton columns={KEYWORDS_TABLE_COLUMN_COUNT} />
                </>
              ) : (
                (keywords ?? []).map((keyword) => (
                  <TableRow key={keyword.id}>
                    <TableCell className="font-semibold text-[var(--foreground)]">{keyword.keyword}</TableCell>
                    <TableCell>{keyword.categoryName ?? '-'}</TableCell>
                    <TableCell>{keyword.searchCount}회</TableCell>
                    <TableCell>{formatDateTime(keyword.lastUsedAt)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </DashboardCard>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 추가</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="new-category-name" className="mb-2">
                카테고리명
              </Label>
              <Input
                id="new-category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                required
              />
            </div>

            {formError && <p className="text-[13px] text-red-500">{formError}</p>}

            <DialogFooter>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="toss-btn toss-btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
              >
                {createMutation.isPending ? '생성 중...' : '카테고리 생성'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editingCategory !== null} onOpenChange={(open) => !open && setEditingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 수정</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
            <div>
              <Label htmlFor="edit-category-name" className="mb-2">
                카테고리명
              </Label>
              <Input
                id="edit-category-name"
                value={editCategoryName}
                onChange={(e) => setEditCategoryName(e.target.value)}
                required
              />
            </div>

            {editFormError && <p className="text-[13px] text-red-500">{editFormError}</p>}

            <DialogFooter>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="toss-btn toss-btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updateMutation.isPending ? '저장 중...' : '저장'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deletingCategory !== null} onOpenChange={(open) => !open && setDeletingCategory(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 삭제</DialogTitle>
            <DialogDescription>
              {'"'}
              {deletingCategory?.name}
              {'"'} 카테고리를 삭제하시겠습니까?
              {deletingCategory && deletingCategory.keywordCount > 0 && (
                <>
                  <br />
                  연결된 키워드 이력 {deletingCategory.keywordCount}건은 카테고리 미지정으로 바뀝니다. 검색 이력
                  자체는 삭제되지 않습니다.
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <button
              type="button"
              onClick={() => deleteMutation.mutate()}
              disabled={deleteMutation.isPending}
              className="toss-btn w-full justify-center bg-red-500 text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {deleteMutation.isPending ? '삭제 중...' : '삭제'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
