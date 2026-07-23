'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { SectionTitle, Badge } from '@/components/common';
import { DashboardCard, TableRowSkeleton } from '@/components/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
 * 소스에 실제 값을 하드코딩하지 않는다. TanStack Query로 실제 API와 연결
 */
export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

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

  const totalKeywordCount = allKeywords?.length ?? 0;

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle title="카테고리 관리" subtitle="검색 대상 카테고리와 키워드 이력을 관리합니다" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <DashboardCard className="!p-0">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h3 className="text-[14px] font-bold text-[var(--foreground)]">카테고리</h3>
            <button
              type="button"
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--brand-primary)] hover:bg-[var(--brand-subtle)]"
              aria-label="카테고리 추가"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
            </button>
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
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`flex items-center justify-between px-5 py-3 text-left text-[13.5px] ${
                    selectedCategoryId === category.id
                      ? 'bg-[var(--brand-subtle)] text-[var(--brand-primary)] font-semibold'
                      : 'text-[var(--foreground)]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {category.name}
                    {!category.isActive && <Badge text="비활성" variant="tech" />}
                  </span>
                  <span className="text-[12px] text-[var(--foreground-subtle)]">{category.keywordCount}개</span>
                </button>
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
    </div>
  );
}
