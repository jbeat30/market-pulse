export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** 내부 API 공용 fetch 래퍼 — 실패 시 서버가 준 message를 담아 ApiError를 던진다 */
export const apiFetch = async <T>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.message ?? '요청 처리 중 오류가 발생했습니다', response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};
