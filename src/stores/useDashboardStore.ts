import { create } from 'zustand';

interface ProductFilter {
  minPrice: number | null;
  maxPrice: number | null;
  excludeAds: boolean;
}

interface DashboardState {
  selectedCategoryId: string | null;
  selectedKeyword: string;
  filter: ProductFilter;
  inspectedProductId: string | null;
  isPushEnabled: boolean;

  setSelectedCategoryId: (categoryId: string | null) => void;
  setSelectedKeyword: (keyword: string) => void;
  setFilter: (filter: Partial<ProductFilter>) => void;
  resetFilter: () => void;
  openInspection: (productId: string) => void;
  closeInspection: () => void;
  setPushEnabled: (enabled: boolean) => void;
}

const defaultFilter: ProductFilter = {
  minPrice: null,
  maxPrice: null,
  excludeAds: true,
};

/** 대시보드 UI 상태 스토어 — 필터·드로어·검색 선택 상태 관리(서버 데이터는 TanStack Query가 담당) */
export const useDashboardStore = create<DashboardState>((set) => ({
  selectedCategoryId: null,
  selectedKeyword: '',
  filter: defaultFilter,
  inspectedProductId: null,
  isPushEnabled: false,

  setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),
  setSelectedKeyword: (keyword) => set({ selectedKeyword: keyword }),
  setFilter: (partial) => set((state) => ({ filter: { ...state.filter, ...partial } })),
  resetFilter: () => set({ filter: defaultFilter }),
  openInspection: (productId) => set({ inspectedProductId: productId }),
  closeInspection: () => set({ inspectedProductId: null }),
  setPushEnabled: (enabled) => set({ isPushEnabled: enabled }),
}));
