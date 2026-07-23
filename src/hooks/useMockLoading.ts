import { useEffect, useState } from 'react';

const MOCK_LOADING_DELAY_MS = 500;

/**
 * mock 데이터 fetch 지연을 흉내 내는 로딩 상태 훅
 *
 * @description Chapter 1은 실제 API가 없어 TanStack Query 로딩 상태를 재현할 수 없다.
 * 스켈레톤 UI를 검증하기 위해 마운트 후 짧은 지연을 두고 false로 전환한다.
 * Chapter 4에서 TanStack Query의 isLoading으로 대체될 임시 훅
 */
export const useMockLoading = (delayMs: number = MOCK_LOADING_DELAY_MS): boolean => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  return isLoading;
};
