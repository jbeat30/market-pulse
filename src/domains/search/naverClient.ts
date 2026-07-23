const NAVER_SHOP_SEARCH_URL = 'https://openapi.naver.com/v1/search/shop.json';

/** 네이버 쇼핑 검색 API 원본 응답 상품 타입 — 외부 계약이므로 필드명을 임의 변경하지 않는다 */
interface NaverShopItem {
  title: string;
  link: string;
  image: string;
  lprice: string;
  hprice: string;
  mallName: string;
  productId: string;
  productType: string;
  brand: string;
  maker: string;
  category1: string;
  category2: string;
  category3: string;
  category4: string;
}

interface NaverShopSearchResponse {
  total: number;
  start: number;
  display: number;
  items: NaverShopItem[];
}

export class NaverApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'NaverApiError';
  }
}

/**
 * 네이버 쇼핑 검색 API 호출
 *
 * @description display 최대값은 API 제약상 100이지만 이 프로젝트는 요청 정책상 5~40으로 제한(zod 검증).
 * 인증 실패·요청 오류 시 NaverApiError로 래핑 — 원인은 개발자 로그 전용, 사용자 UI 노출 금지
 */
export const searchNaverShopping = async (query: string, display: number): Promise<NaverShopItem[]> => {
  const clientId = process.env.NAVER_SEARCH_CLIENT_ID;
  const clientSecret = process.env.NAVER_SEARCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new NaverApiError('NAVER_SEARCH_CLIENT_ID/SECRET이 설정되지 않았습니다', 500);
  }

  const url = new URL(NAVER_SHOP_SEARCH_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('display', String(display));
  url.searchParams.set('sort', 'sim');

  const response = await fetch(url, {
    headers: {
      'X-Naver-Client-Id': clientId,
      'X-Naver-Client-Secret': clientSecret,
    },
  });

  if (!response.ok) {
    // 검색어(민감정보)는 로그에 남기지 않는다(05-security.md)
    throw new NaverApiError(`네이버 검색 API 호출 실패 (status ${response.status})`, response.status);
  }

  const data: NaverShopSearchResponse = await response.json();
  return data.items;
};
