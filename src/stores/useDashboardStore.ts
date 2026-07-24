import { create } from 'zustand';

const DEFAULT_REQUESTED_COUNT = 20;
const MIN_REQUESTED_COUNT = 5;
const MAX_REQUESTED_COUNT = 40;

interface ProductFilter {
  minPrice: number | null;
  maxPrice: number | null;
}

interface DashboardState {
  selectedCategoryId: string | null;
  selectedKeyword: string;
  requestedCount: number;
  filter: ProductFilter;
  inspectedProductId: string | null;
  isPushEnabled: boolean;

  setSelectedCategoryId: (categoryId: string | null) => void;
  setSelectedKeyword: (keyword: string) => void;
  setRequestedCount: (count: number) => void;
  setFilter: (filter: Partial<ProductFilter>) => void;
  resetFilter: () => void;
  openInspection: (productId: string) => void;
  closeInspection: () => void;
  setPushEnabled: (enabled: boolean) => void;
}

const defaultFilter: ProductFilter = {
  minPrice: null,
  maxPrice: null,
};

/** 대시보드 UI 상태 스토어 — 필터·드로어·검색 선택 상태 관리(서버 데이터는 TanStack Query가 담당) */
export const useDashboardStore = create<DashboardState>((set) => ({
  selectedCategoryId: null,
  selectedKeyword: '',
  requestedCount: DEFAULT_REQUESTED_COUNT,
  filter: defaultFilter,
  inspectedProductId: null,
  isPushEnabled: false,

  setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),
  setSelectedKeyword: (keyword) => set({ selectedKeyword: keyword }),
  setRequestedCount: (count) =>
    set({ requestedCount: Math.min(MAX_REQUESTED_COUNT, Math.max(MIN_REQUESTED_COUNT, count)) }),
  setFilter: (partial) => set((state) => ({ filter: { ...state.filter, ...partial } })),
  resetFilter: () => set({ filter: defaultFilter }),
  openInspection: (productId) => set({ inspectedProductId: productId }),
  closeInspection: () => set({ inspectedProductId: null }),
  setPushEnabled: (enabled) => set({ isPushEnabled: enabled }),
}));
