'use client';

import { Loader2, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { Category } from '@/types/domain';

const MIN_REQUESTED_COUNT = 5;
const MAX_REQUESTED_COUNT = 40;

/** "카테고리 선택 안 함" sentinel — Select가 uncontrolled(undefined)로 시작했다가 controlled로 바뀌는 React 경고 방지 */
const NO_CATEGORY_VALUE = '__none__';

interface QuickSearchBarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  keyword: string;
  requestedCount: number;
  onCategoryChange: (categoryId: string | null) => void;
  onKeywordChange: (keyword: string) => void;
  onRequestedCountChange: (count: number) => void;
  onSearch: () => void;
  /** 검색 작업 생성 요청이 진행 중인 상태 — 버튼에 스피너를 표시하고 재클릭을 막는다 */
  isSubmitting?: boolean;
}

/** 카테고리/키워드/요청 개수 선택 + 검색 실행 바 — 알약형 버튼 스타일(toss-btn-primary) */
export const QuickSearchBar = ({
  categories,
  selectedCategoryId,
  keyword,
  requestedCount,
  onCategoryChange,
  onKeywordChange,
  onRequestedCountChange,
  onSearch,
  isSubmitting = false,
}: QuickSearchBarProps) => {
  const activeCategories = categories.filter((category) => category.isActive);
  const categoryNameById = new Map(activeCategories.map((category) => [category.id, category.name]));

  return (
    <div className="toss-card flex flex-col gap-3 !p-4 sm:flex-row sm:items-center">
      <Select
        value={selectedCategoryId ?? NO_CATEGORY_VALUE}
        onValueChange={(value) => onCategoryChange(value === NO_CATEGORY_VALUE ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-[180px]" aria-label="카테고리 선택">
          <SelectValue>
            {(value: string) => (value === NO_CATEGORY_VALUE ? '카테고리 선택' : (categoryNameById.get(value) ?? value))}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_CATEGORY_VALUE}>카테고리 선택 안 함</SelectItem>
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
          // 한글 등 IME 조합 확정 시 발생하는 Enter keydown까지 처리하면 검색이 중복 실행됨
          if (e.key === 'Enter' && !e.nativeEvent.isComposing && !isSubmitting) onSearch();
        }}
      />

      <Input
        type="number"
        inputMode="numeric"
        min={MIN_REQUESTED_COUNT}
        max={MAX_REQUESTED_COUNT}
        value={requestedCount}
        onChange={(e) => onRequestedCountChange(Number(e.target.value))}
        aria-label="요청 개수(5~40)"
        className="w-full sm:w-24"
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
        {isSubmitting ? '요청 중...' : '검색 시작'}
      </button>
    </div>
  );
};
