# market-pulse

네이버 쇼핑 가격비교 데이터를 수집·조회하는 관리자 전용(admin-only) 인텔리전스 대시보드.

키워드·카테고리별로 네이버 쇼핑 검색 결과를 수집해 DB에 저장하고, 관리자가 대시보드에서 검색 이력·상품 목록을 조회·정렬·필터링할 수 있다.

## 주요 기능

- **네이버 쇼핑 검색 연동** — 네이버 검색 오픈 API(`openapi.naver.com`)로 실시간 상품 검색·수집(Playwright 크롤링 미사용)
- **검색 이력 관리** — 검색 작업 단위 데이터 테이블 조회, 카테고리 필터·사후 카테고리 수정, 팝업 내 상품 데이터 테이블(정렬·페이지네이션)
- **카테고리·키워드 관리** — 카테고리별 키워드 사용 이력·빈도 추적
- **인증 및 역할 기반 접근 제어** — NextAuth(Credentials) 기반 로그인, `SUPER_ADMIN` / `ADMIN` / `VIEWER` 3단계 권한
- **계정 관리** — 최고관리자 전용 계정 생성

## 기술 스택

| 영역 | 사용 기술 |
|------|-----------|
| 프레임워크 | Next.js 16 (App Router, Turbopack) |
| 언어 | TypeScript (strict) |
| DB / ORM | Supabase(PostgreSQL) + Prisma 7 (`@prisma/adapter-pg`) |
| 인증 | NextAuth(Auth.js) v5, Credentials Provider, argon2 |
| 서버 상태 | TanStack Query |
| 클라이언트 상태 | zustand |
| 데이터 테이블 | TanStack Table |
| UI | shadcn/ui (base-nova), `@base-ui/react`, Tailwind CSS v4 |
| 검증 | zod |

## 사전 준비물

- Node.js 20 이상
- pnpm
- Supabase 프로젝트(PostgreSQL) — 풀링(6543)·다이렉트(5432) 연결 문자열 모두 필요
- 네이버 개발자 센터(`developers.naver.com`) 애플리케이션 — 검색 API(쇼핑) 사용 등록

## 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경변수 설정

`.env.example`을 복사해 `.env`를 만들고 값을 채운다.

```bash
cp .env.example .env
```

| 변수 | 설명 |
|------|------|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Supabase 프로젝트 설정 |
| `DATABASE_URL` | Prisma 런타임 연결(풀링, 6543) |
| `DIRECT_URL` | 마이그레이션용 다이렉트 연결(5432) |
| `NAVER_SEARCH_CLIENT_ID`, `NAVER_SEARCH_CLIENT_SECRET` | 네이버 검색 오픈 API 인증키 |
| `AUTH_SECRET` | NextAuth 세션 암호화 시크릿 — `openssl rand -base64 32`로 생성 |
| `SEED_SUPER_ADMIN_PASSWORD` | 최고관리자 시드 계정 비밀번호(시드 스크립트 전용, 평문 하드코딩 금지) |

### 3. DB 마이그레이션 및 시드

```bash
pnpm db:migrate   # 마이그레이션 적용
pnpm db:generate  # Prisma Client 생성
pnpm db:seed      # 최고관리자 계정 생성(userId: jbeat)
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

`http://localhost:3000/login`에서 시드 계정으로 로그인한다.

## 스크립트

| 명령 | 설명 |
|------|------|
| `pnpm dev` | 개발 서버 실행(Turbopack) |
| `pnpm build` | 프로덕션 빌드 |
| `pnpm start` | 프로덕션 서버 실행 |
| `pnpm lint` | ESLint 검사 |
| `pnpm db:migrate` | Prisma 마이그레이션 적용 |
| `pnpm db:generate` | Prisma Client 생성 |
| `pnpm db:studio` | Prisma Studio 실행 |
| `pnpm db:seed` | 최고관리자 계정 시드 |

## 프로젝트 구조

```
src/
  app/
    (admin)/        # 인증 필요 어드민 화면(대시보드, 검색 이력, 카테고리, 계정 관리)
    (auth)/         # 로그인 화면
    api/            # Route Handler(검색 작업, 카테고리, 키워드, 계정, 인증)
  components/
    dashboard/      # 대시보드 전용 컴포넌트(DataTable, FilterPanel, ProductDetailDrawer 등)
    ui/             # shadcn/ui 기반 공용 컴포넌트
  domains/          # 도메인 서비스 계층(search, category, account)
  lib/              # Prisma 클라이언트, API 인증 헬퍼, 포맷터
  stores/           # zustand 스토어
  types/            # 공용 타입 정의
  proxy.ts          # 인증 미들웨어(Next.js 16 proxy 컨벤션)
prisma/
  schema.prisma     # DB 스키마
  seed.ts           # 최고관리자 계정 시드
auth.ts             # NextAuth 설정(Node 전용, Prisma 포함)
auth.config.ts      # NextAuth 설정(Edge-safe, Prisma 미포함)
```

## 인증 및 권한

| 역할 | 권한 |
|------|------|
| `SUPER_ADMIN` | 전체 기능 + 계정 생성/역할 관리 |
| `ADMIN` | 검색·조회·카테고리 관리, 계정 목록 조회(생성 불가) |
| `VIEWER` | 검색·조회만 가능, 계정 관리 페이지 접근 불가(메뉴 숨김 + 서버사이드 차단 + API 인가) |

미인증 상태로 어드민 화면에 접근하면 로그인 페이지로 리다이렉트된다. 모든 API Route Handler는 미들웨어와 별개로 세션·역할을 자체 재검증한다(방어 심층).

## 보안 원칙

이 저장소는 **PUBLIC**이다. 소스코드 자체가 전부 노출된다는 전제로 설계되어 있다.

- 검색 대상 키워드·카테고리는 소스에 하드코딩하지 않는다(DB에만 존재).
- 모든 시크릿은 `.env`(gitignore 대상)로만 관리한다. `.env.example`만 커밋된다.
- 네이버 상품 데이터는 공식 검색 오픈 API로만 수집한다(비공식 크롤링 미사용).

## 브랜치 전략

```
main ← release/v0.1.0 ← feature/v0.1.0 ← feature/xxx
```

기능 브랜치(`feature/xxx`)는 `feature/v0.1.0`으로, 통합 브랜치는 `release/v0.1.0`으로, 릴리스 브랜치는 최종적으로 `main`으로 병합한다. 커밋 메시지는 한국어로 작성하며 AI 어트리뷰션을 포함하지 않는다.
