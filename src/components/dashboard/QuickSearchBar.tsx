'use client';

import { Loader2, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Category } from '@/types/domain';

interface QuickSearchBarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  keyword: string;
  onCategoryChange: (categoryId: string | null) => void;
  onKeywordChange: (keyword: string) => void;
  onSearch: () => void;
  /** 크롤 잡 생성 요청이 진행 중인 상태 — 버튼에 스피너를 표시하고 재클릭을 막는다 */
  isSubmitting?: boolean;
}

/** 카테고리/키워드 선택 + 크롤 검색 실행 바 — 알약형 버튼 스타일(toss-btn-primary) */
export const QuickSearchBar = ({
  categories,
  selectedCategoryId,
  keyword,
  onCategoryChange,
  onKeywordChange,
  onSearch,
  isSubmitting = false,
}: QuickSearchBarProps) => {
  const activeCategories = categories.filter((category) => category.isActive);

  return (
    <div className="toss-card flex flex-col gap-3 !p-4 sm:flex-row sm:items-center">
      <Select
        value={selectedCategoryId ?? undefined}
        onValueChange={(value) => onCategoryChange(value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]" aria-label="카테고리 선택">
          <SelectValue placeholder="카테고리 선택" />
        </SelectTrigger>
        <SelectContent>
          {activeCategories.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        value={keyword}
        onChange={(e) => onKeywordChange(e.target.value)}
        placeholder="검색 키워드를 입력하세요"
        className="flex-1"
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !isSubmitting) onSearch();
        }}
      />

      <button
        type="button"
        onClick={onSearch}
        disabled={isSubmitting || keyword.trim().length === 0}
        className="toss-btn toss-btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
        ) : (
          <Search className="h-4 w-4" strokeWidth={2} />
        )}
        {isSubmitting ? '요청 중...' : '크롤 시작'}
      </button>
    </div>
  );
};
