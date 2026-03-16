# Tier 2-3: Supabase Auth + 서버 동기화 — 세션 브리핑

> 작성: 2026-03-16 강선생 | 다음 세션에서 `/plan`으로 설계 후 구현

---

## 1. 목표

localStorage 전용 → Supabase Auth + 서버 동기화로 전환.
기기 변경, 브라우저 초기화 시 학습 데이터 유실 방지.

---

## 2. 현재 상태

### Zustand 스토어 5개 (모두 `persist` → localStorage)

| 스토어 | 줄 수 | version | 핵심 데이터 |
|--------|------|---------|------------|
| `useStudyStore` | 307 | v4 | totalXP, currentStreak, dailyProgress, dailyHistory[], scenarioProgress |
| `useQuizStore` | 268 | v3 | quizHistory[], wrongNotes[], feedbacks[], errorReports[] |
| `useLeitnerStore` | 137 | - | cards[] (Leitner SRS 카드) |
| `useOnboardingStore` | 95 | v1 | examDate, studyLevel, weakSubjects, studyPlan |
| `useBookmarkStore` | 34 | - | bookmarks Set |

### 현재 Supabase 테이블 (contract.md 기준)

- `subjects`, `chapters`, `quiz_questions`, `worksheet_topics`, `worksheet_questions`, `reviews`
- 사용자 데이터 테이블: **없음** (Auth도 미설정)

### 인프라

- Supabase URL: `https://ssluhxvbyzqmdkbjwoke.supabase.co`
- 클라이언트: `src/lib/supabase.ts` (browser client만 존재)
- RLS: 읽기 공개, 쓰기 제한 (reviews만 공개 쓰기)

---

## 3. prompt_plan.md 원본 요구사항

```
### 2-3. Supabase Auth + 서버 동기화
- Supabase Auth (이메일/OAuth) 도입
- 기존 4개 Zustand 스토어 → 서버 동기화 전략:
  - 쓰기: 로컬 먼저 → 백그라운드 서버 동기화 (optimistic update)
  - 읽기: 서버 → 로컬 캐시 (마운트 시 merge)
  - 충돌: 서버 timestamp 우선 (last-write-wins)
- 게스트 모드 유지 (미인증도 localStorage로 사용 가능)
- 참고: gosari의 3-레이어 Supabase SSR 패턴 (browser/server/middleware 클라이언트 분리)
- contract.md 변경 필요: users 테이블 + user_quiz_data 테이블 스키마 추가
```

---

## 4. 설계 시 고려 사항

### 4-1. contract.md 변경 프로토콜

**반드시 카이란 승인 → contract.md 수정 → 구현 순서.**
- 신규 테이블 스키마를 contract.md에 먼저 정의
- 클루디가 마이그레이션 실행 (강선생은 ALTER TABLE 금지)
- RLS 정책은 클루디가 설정

### 4-2. 신규 테이블 후보

```sql
-- 사용자 프로필
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 학습 데이터 (모든 스토어를 하나로 통합 vs 분리)
-- 옵션A: JSONB 단일 컬럼 (빠르고 단순, 쿼리 어려움)
-- 옵션B: 테이블 분리 (quiz_results, wrong_notes, leitner_cards, study_progress)
```

### 4-3. 동기화 전략 선택지

| 전략 | 장점 | 단점 |
|------|------|------|
| **A: JSONB blob** | 구현 단순, 스키마 변경 불필요 | 부분 업데이트 불가, 데이터 쿼리 어려움 |
| **B: 정규화 테이블** | SQL 쿼리 가능, 분석 용이 | 테이블 5+개 추가, 동기화 복잡 |
| **C: 하이브리드** | 핵심만 정규화 (quiz_results), 나머지 JSONB | 균형잡힌 접근 |

### 4-4. 게스트→로그인 마이그레이션

- 게스트 상태에서 쌓인 localStorage 데이터를 로그인 후 서버로 이전
- 충돌 시 서버 timestamp 우선 (last-write-wins)
- 마이그레이션은 1회성 (완료 후 로컬 데이터 아카이브 또는 삭제)

### 4-5. Auth 프로바이더 선택지

| 프로바이더 | 구현 난이도 | 사용자 편의 |
|-----------|-----------|-----------|
| 이메일/비밀번호 | 낮음 | 보통 |
| Google OAuth | 중간 | 높음 |
| Kakao OAuth | 중간 | 높음 (한국 사용자) |
| Magic Link (이메일) | 낮음 | 높음 |

### 4-6. Supabase 클라이언트 구조

현재: `src/lib/supabase.ts` (browser client만)

gosari 참고 패턴 (3-레이어):
```
src/lib/supabase/
  ├── browser.ts   — createBrowserClient (CSR)
  ├── server.ts    — createServerClient (RSC, Route Handler)
  └── middleware.ts — createServerClient (미들웨어)
```

---

## 5. 영향 범위

### 파일 생성 예상

| 파일 | 용도 |
|------|------|
| `src/lib/supabase/browser.ts` | 브라우저 클라이언트 |
| `src/lib/supabase/server.ts` | 서버 클라이언트 |
| `src/lib/supabase/middleware.ts` | 미들웨어 클라이언트 |
| `src/lib/sync.ts` | 동기화 로직 (merge, push, pull) |
| `src/middleware.ts` | Next.js 미들웨어 (세션 갱신) |
| `src/app/login/page.tsx` | 로그인 페이지 |
| `src/app/auth/callback/route.ts` | OAuth 콜백 |

### 파일 수정 예상

| 파일 | 변경 내용 |
|------|----------|
| `src/stores/*.ts` (5개) | 서버 동기화 훅 추가 |
| `src/lib/supabase.ts` | 리팩토링 (기존 → browser.ts) |
| `docs/contract.md` | 신규 테이블 스키마 추가 |
| `docs/changelog.md` | 변경 기록 |

### 의존성 추가

```bash
npm install @supabase/ssr  # SSR 헬퍼 (현재 @supabase/supabase-js만 있음)
```

---

## 6. 리스크

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| 게스트→로그인 데이터 마이그레이션 버그 | 높음 | 마이그레이션 전 localStorage 백업, 롤백 로직 |
| Zustand persist 버전 충돌 | 중간 | 버전 번호 신중하게 올리기 (cascading migration) |
| RLS 정책 잘못 설정 시 데이터 노출 | 높음 | security-reviewer 에이전트 필수 실행 |
| 클루디와 스키마 합의 지연 | 중간 | contract.md 초안을 이 문서에 포함 |

---

## 7. 실행 순서 제안

```
Phase A: 설계 (강선생 + 카이란)
  1. /plan으로 상세 설계
  2. 테이블 스키마 확정 → contract.md 수정 제안
  3. 카이란 승인

Phase B: 인프라 (클루디)
  4. Supabase Auth 활성화
  5. 마이그레이션 실행 (테이블 생성 + RLS)
  6. OAuth 프로바이더 설정

Phase C: 구현 (강선생)
  7. Supabase 클라이언트 3-레이어 리팩토링
  8. Auth UI (로그인/회원가입/콜백)
  9. 동기화 로직 (sync.ts)
  10. 스토어 서버 연동
  11. 게스트→로그인 마이그레이션 로직

Phase D: 검증
  12. 보안 리뷰 (security-reviewer)
  13. E2E 테스트 (게스트→로그인→데이터 확인)
  14. 빌드 + 배포
```

---

## 8. 참고 자료

- `docs/contract.md` — 현재 DB 스키마 (진실의 원천)
- `docs/changelog.md` — 변경 이력
- `memory/smith.md` — gosari 3-레이어 Supabase 패턴 참고
- `src/stores/*.ts` — 5개 Zustand 스토어 (동기화 대상)
- `src/lib/supabase.ts` — 현재 클라이언트 (리팩토링 대상)
- `prompt_plan.md` — 전체 로드맵 (Tier 2-3 섹션)
