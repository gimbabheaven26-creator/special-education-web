# 개발자 참여 가이드

> 특수교육 임용 학습 플랫폼에 기여하거나 함께 개발하고 싶은 개발자를 위한 문서.

---

## 프로젝트 한 눈에 보기

| 항목 | 내용 |
|------|------|
| 스택 | Next.js 14 (App Router), TypeScript, Tailwind CSS v4, @base-ui/react |
| DB | Supabase PostgreSQL (싱가포르 리전) + RLS |
| 인증 | Supabase Auth (Google OAuth, Email) — W2 구현 중 |
| 상태 관리 | Zustand (5개 스토어, localStorage 퍼시스트) |
| 배포 | Vercel (자동 CI/CD, ISR) |
| 테스트 | Vitest + jsdom, 73개 단위 테스트 |
| 콘텐츠 | MDX (@next/mdx), KICE 기출 JSON |

---

## 아키텍처 개요

```
special-education-web/
├── src/
│   ├── app/                    # Next.js App Router (36개 라우트)
│   │   ├── (학습) quiz, flashcards, worksheets, wrong-notes
│   │   ├── (분석) stats, analytics, kice
│   │   ├── (특수) scenarios, mastery, interactive, terms
│   │   ├── (커뮤니티) community
│   │   ├── (사용자) my, login, auth/callback
│   │   └── api/                # Route Handlers
│   ├── components/
│   │   ├── layout/             # Header, BottomTabBar (5탭 nav-config 기반)
│   │   ├── quiz/               # QuestionCard 6파일 분리
│   │   ├── auth/               # LoginForm, UserMenu, AuthProvider
│   │   └── ...                 # 57개 컴포넌트
│   ├── lib/
│   │   ├── db.ts               # Supabase 쿼리 API (21개 함수) ← 진실의 원천
│   │   ├── supabase/           # 3-레이어 클라이언트 (browser/server/middleware)
│   │   ├── sync.ts             # Zustand ↔ Supabase 동기화 엔진
│   │   ├── mastery.ts          # 숙련도 계산 + 합격 시뮬레이션
│   │   ├── adaptive-difficulty.ts
│   │   ├── descriptive-scoring.ts
│   │   └── elaboration.ts
│   └── stores/
│       ├── useStudyStore.ts    # XP, 스트릭, 시나리오 진행도
│       ├── useQuizStore.ts     # 오답노트, 퀴즈 히스토리
│       ├── useLeitnerStore.ts  # SRS 카드 (박스 1~5)
│       ├── useBookmarkStore.ts
│       └── useOnboardingStore.ts
├── docs/
│   ├── contract.md             # DB 스키마 계약 (진실의 원천)
│   ├── roadmap-shared.md       # 에이전트 로드맵
│   └── kangteacher-auth-brief.md
└── data/
    ├── kice-기출/              # 2016~2026 기출 JSON
    └── terminology/            # NISE 용어사전, KICE 키워드
```

---

## 핵심 설계 원칙

### 1. DB 스키마 계약 (`docs/contract.md`)
모든 테이블 스키마, API 시그니처, RLS 정책의 진실의 원천.
수정 시 반드시 이 파일 먼저 업데이트 → 카이란 승인 → 구현.

### 2. 3-레이어 Supabase 클라이언트
```typescript
// CSR 컴포넌트
import { createClient } from '@/lib/supabase/browser'

// RSC / Route Handler
import { createClient } from '@/lib/supabase/server'

// 미들웨어
import { createClient } from '@/lib/supabase/middleware'
```
`@supabase/ssr` 기반. `src/lib/supabase.ts`는 하위 호환 래퍼.

### 3. 데이터 삽입은 서비스 Role Key로만
```bash
node scripts/insert-with-service-key.mjs
```
클라이언트 코드에 Service Role Key 절대 포함 금지.

### 4. Zustand 스토어 → Supabase 동기화
- 로그인 시 `pullFromServer` → 로컬 스토어 덮어쓰기
- 상태 변경 시 debounce 3초 → `pushToServer`
- `user_data` 테이블: `(user_id, store_key)` UNIQUE 제약

---

## 현재 상태 (2026-03-21)

### 완성된 것 ✅
- 36개 페이지 전부 라이브
- 42개 핵심 기능 (퀴즈·SRS·시나리오·통계·커뮤니티)
- Supabase Auth + 3-레이어 클라이언트
- 5-탭 네비게이션 (nav-config.ts 기반)
- 73개 단위 테스트 PASS

### 진행 중 🟡
- `src/lib/sync.ts` — Zustand ↔ Supabase 동기화 엔진 (W2)
- `/my` 페이지 실데이터 연결 (W2)
- Login UI + OAuth 콜백 (W2)

### 계획 중 ⚪
- AI 어시스턴트 (Google Gemini API, stub 존재)
- 배지 시스템 (14개 정의, UI 미구현)
- 구독 결제 (Toss Payments 예정)

---

## 기여 영역 (도움이 필요한 곳)

| 영역 | 난이도 | 설명 |
|------|--------|------|
| **AI 어시스턴트** | 높음 | Google Gemini API 연동, `src/app/api/ai-assist/route.ts` stub 있음 |
| **배지 시스템** | 중간 | 14개 배지 정의됨, `useStudyStore`에서 체크 로직 + UI |
| **구독 결제** | 높음 | Toss Payments 연동, 프리미엄 기능 게이트 |
| **PWA** | 중간 | 오프라인 기본 기능, Service Worker |
| **WCAG 접근성** | 중간 | 스크린리더 지원, 키보드 네비게이션 감사 |
| **E2E 테스트** | 중간 | Playwright, `docs/e2e-scenarios.md` 시나리오 구현 |
| **성능 최적화** | 낮음 | Supabase 쿼리 최적화, 이미지 lazy-load |

---

## 강점 / 약점 (기술)

### 강점
- **모듈화**: QuestionCard 6파일 분리, useStatsData 훅 추출 등 관심사 분리 양호
- **타입 안전**: TypeScript 전체 적용, Supabase 타입 자동 생성
- **계약 기반 개발**: contract.md가 DB 계약 역할 → 충돌 없는 다중 에이전트 병렬 개발 가능
- **빠른 빌드**: 87.4 kB shared JS, ISR 적용

### 약점
- **테스트 커버리지 낮음**: 73개 테스트 (핵심 로직 위주, 컴포넌트 테스트 없음)
- **Supabase 싱가포르 리전**: 국내 레이턴시 약 150ms (서울 리전 지원 시 이전 필요)
- **오프라인 미지원**: PWA 미구현 → 지하철 공부 불가
- **단일 개발자**: 버스 팩터 1 (카이란) — 온보딩 문서 부족
- **콘텐츠 검증**: 퀴즈 문항 AI 생성, 전문가 검수 미완료

---

## 로컬 개발 시작

```bash
git clone https://github.com/gimbabheaven26-creator/special-education-web
cd special-education-web
npm install

# .env.local 필요
NEXT_PUBLIC_SUPABASE_URL=https://ssluhxvbyzqmdkbjwoke.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>  # 데이터 삽입 시만

npm run dev
```

### 핵심 명령

```bash
npm run build     # 빌드 검증 (PR 전 필수)
npm run test      # Vitest 단위 테스트 73개
npm run lint      # ESLint
node scripts/insert-with-service-key.mjs  # 데이터 삽입
```

---

## 연락

GitHub Issues 또는 직접 연락 (카이란 / gimbabheaven26-creator@github)
