'use client';

import { useState } from 'react';
import { Plus, Pencil } from 'lucide-react';
import { SectionTitle, Badge } from '@/components/common';
import { DashboardCard } from '@/components/dashboard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockCategories } from '@/data/mockCategories';
import { mockKeywords } from '@/data/mockKeywords';
import { formatDateTime } from '@/lib/format';

/**
 * 카테고리·키워드 관리 페이지
 *
 * @description 크롤 대상 카테고리·키워드는 DB(Category, KeywordHistory)에만 존재해야 하므로,
 * 이 페이지는 소스에 실제 값을 하드코딩하지 않고 mock 데이터로만 UI를 검증한다.
 * 실제 CRUD는 Chapter 2에서 Server Actions로 연결
 */
export default function CategoriesPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const filteredKeywords = selectedCategoryId
    ? mockKeywords.filter((keyword) => keyword.categoryId === selectedCategoryId)
    : mockKeywords;

  return (
    <div className="mx-auto max-w-6xl">
      <SectionTitle title="카테고리 관리" subtitle="크롤 대상 카테고리와 키워드 이력을 관리합니다" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        <DashboardCard className="!p-0">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
            <h3 className="text-[14px] font-bold text-[var(--foreground)]">카테고리</h3>
            <button
              type="button"
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
                selectedCategoryId === null ? 'bg-[var(--brand-subtle)] text-[var(--brand-primary)] font-semibold' : 'text-[var(--foreground)]'
              }`}
            >
              전체
              <span className="text-[12px] text-[var(--foreground-subtle)]">{mockKeywords.length}개</span>
            </button>
            {mockCategories.map((category) => (
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
            ))}
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
                <TableHead className="text-right">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredKeywords.map((keyword) => (
                <TableRow key={keyword.id}>
                  <TableCell className="font-semibold text-[var(--foreground)]">{keyword.keyword}</TableCell>
                  <TableCell>{keyword.categoryName ?? '-'}</TableCell>
                  <TableCell>{keyword.searchCount}회</TableCell>
                  <TableCell>{formatDateTime(keyword.lastUsedAt)}</TableCell>
                  <TableCell className="text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-[12px] font-semibold text-[var(--foreground-subtle)] hover:text-[var(--brand-primary)]"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      수정
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DashboardCard>
      </div>
    </div>
  );
}
