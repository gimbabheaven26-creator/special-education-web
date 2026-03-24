# API 보안 강화 + analytics 테이블 생성

> 작성: 2026-03-24 | 담당: X | 승인: 대기
> 근거: V 검증 보고서 (2026-03-24) CRITICAL/HIGH 항목 대응

## 요구사항

V의 검증 보고서에서 베타 런칭 전 필수 조치로 식별된 보안 취약점과 기술 부채를 해결한다.

| 우선순위 | 항목 | 현재 상태 |
|---------|------|----------|
| CRITICAL | API rate limiting 없음 | Gemini 비용 폭증 위험 |
| CRITICAL | reviews POST 인증 없음 | 스팸 리뷰 삽입 가능 |
| HIGH | analytics_events 테이블 미생성 | 코드만 있고 조용히 실패 중 |
| HIGH | vitest exclude 패턴 불완전 | 워크트리 E2E가 Vitest에 잡힘 |
| HIGH | PWA가 API 응답까지 캐싱 | stale 데이터 반환 위험 |
| MEDIUM | admin 미들웨어 role 체크 없음 | 일반 사용자가 admin UI 접근 가능 |
| MEDIUM | searchQuizzes .or() 문자열 보간 | PostgREST 필터 인젝션 가능성 |

## 아키텍처 영향

- DB 스키마 변경: analytics_events 테이블 1개 추가
- 신규 파일: rate-limit.ts 유틸리티 1개
- 수정 파일: 7개 (middleware.ts, reviews/route.ts, ai-assist/route.ts, ai/weakness/route.ts, next.config.mjs, vitest.config.ts, db.ts)
- contract.md 업데이트: analytics_events 스키마 추가

---

## Phase 1: Rate Limiting 유틸리티 (CRITICAL, 선행)

### 1-1. src/lib/rate-limit.ts 신규 생성

외부 의존성 없는 in-memory rate limiter. 베타 규모(10~100명)에 충분.

```typescript
// IP 기반 sliding window rate limiter
// Map<ip, { count, resetAt }>
// 서버리스 환경에서는 인스턴스별 독립이지만 베타 규모에서 충분
export function rateLimit(options: { interval: number; uniqueTokenPerInterval: number }): {
  check: (limit: number, token: string) => Promise<void>;
};
```

### 1-2. AI API 엔드포인트에 rate limiting 적용

- `src/app/api/ai-assist/route.ts` — POST에 분당 10회 제한
- `src/app/api/ai/weakness/route.ts` — POST에 분당 5회 제한

**변경 파일**: 3개 (1 신규 + 2 수정)

---

## Phase 2: Reviews POST 인증 추가 (CRITICAL)

### 2-1. src/app/api/reviews/route.ts POST 함수 수정

현재 (라인 23): 인증 없이 누구나 리뷰 작성 가능
변경: `createClient()` → `getUser()` 체크 추가

```typescript
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'login required' }, { status: 401 });
  }
  // ... 기존 로직
}
```

**리스크**: 기존 비로그인 리뷰 작성 플로우가 있다면 깨짐. 현재 프론트엔드에서 리뷰 작성 UI를 확인해야 함.

**변경 파일**: 1개 수정

---

## Phase 3: analytics_events 마이그레이션 (HIGH)

### 3-1. contract.md 업데이트

analytics_events 테이블 스키마를 contract.md v2.9에 추가.

### 3-2. 마이그레이션 SQL 작성

`supabase/migrations/20260324000001_analytics_events.sql`:

```sql
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 인덱스: 사용자별 + 시간순 조회
CREATE INDEX idx_analytics_events_user_created
  ON analytics_events (user_id, created_at DESC);

-- RLS: 본인 데이터만 INSERT, SELECT
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own events"
  ON analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own events"
  ON analytics_events FOR SELECT
  USING (auth.uid() = user_id);
```

**주의**: 이 마이그레이션은 Supabase 대시보드에서 수동 실행 필요. `supabase db push`로는 로컬 환경에서만 적용.

**변경 파일**: 2개 (1 SQL 신규 + contract.md 수정)

---

## Phase 4: vitest.config.ts + PWA 캐싱 수정 (HIGH)

### 4-1. vitest.config.ts exclude 패턴 수정

현재: `exclude: ['node_modules', 'tests/e2e/**']`
변경: `exclude: ['node_modules', 'tests/e2e/**', '.claude/**']`

워크트리 내부의 E2E 테스트가 Vitest 스캔에 잡히는 문제 해결.

### 4-2. next.config.mjs PWA 캐싱 정책 수정

현재: `urlPattern: /^https?.*/` (모든 HTTP 요청 캐싱)
변경: API 경로 제외, 정적 에셋만 캐싱

```javascript
runtimeCaching: [
  {
    // API 요청은 캐싱하지 않음
    urlPattern: /\/api\//,
    handler: 'NetworkOnly',
  },
  {
    // Supabase API도 캐싱하지 않음
    urlPattern: /supabase\.co/,
    handler: 'NetworkOnly',
  },
  {
    // 나머지 정적 에셋은 NetworkFirst
    urlPattern: /^https?.*/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'offlineCache',
      expiration: { maxEntries: 200 },
    },
  },
],
```

**변경 파일**: 2개 수정

---

## Phase 5: Admin 미들웨어 + searchQuizzes 개선 (MEDIUM)

### 5-1. middleware.ts admin role 체크 추가

현재 (라인 39-43): 미로그인만 체크
변경: 로그인 사용자의 role === 'admin' 확인

```typescript
// /admin/* 보호: 미로그인 또는 비관리자 → /login
if (request.nextUrl.pathname.startsWith('/admin')) {
  if (!user) {
    return NextResponse.redirect(loginUrl);
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profile?.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }
}
```

**리스크**: 미들웨어에서 DB 조회 추가로 /admin 페이지 첫 로드 약간 느려짐. 하지만 admin은 소수이므로 무시 가능.

### 5-2. db.ts searchQuizzes 안전한 쿼리로 변경

현재 (라인 254-265): `.or()` 문자열 보간
변경: 개별 `.ilike()` 체인 사용

```typescript
export async function searchQuizzes(query: string): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  const sanitized = query.replace(/[%_\\]/g, (c) => `\\${c}`);
  const pattern = `%${sanitized}%`;
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .or(`question.ilike.${pattern},explanation.ilike.${pattern}`)
    .limit(200);

  if (error || !data) return [];
  return data.map(mapQuizRow);
}
```

실제로 Supabase JS SDK의 `.or()` 메서드는 PostgREST 필터 구문을 받으므로, 이스케이프 범위를 `.` (마침표)까지 확장하는 것이 더 안전하다. 현재 sanitize에서 `()`와 `,`가 이미 이스케이프되고 있어 실질적 인젝션 위험은 낮지만, 방어적으로 정리한다.

**변경 파일**: 2개 수정

---

## 의존성 & 실행 순서

```
Phase 1 (rate-limit) ──→ Phase 2 (reviews auth)
                     └──→ Phase 4 (vitest + PWA)
                     └──→ Phase 5 (middleware + search)

Phase 3 (analytics migration) — 독립 (병렬 가능)
```

Phase 1이 선행 (rate-limit 유틸리티를 다른 Phase에서 사용).
Phase 3은 독립적이므로 병렬 실행 가능.
Phase 4, 5는 Phase 1과 병렬 가능.

---

## 변경 파일 총괄

| Phase | 파일 | 작업 |
|-------|------|------|
| 1 | `src/lib/rate-limit.ts` | **신규** |
| 1 | `src/app/api/ai-assist/route.ts` | 수정 (rate limit 추가) |
| 1 | `src/app/api/ai/weakness/route.ts` | 수정 (rate limit 추가) |
| 2 | `src/app/api/reviews/route.ts` | 수정 (POST 인증 추가) |
| 3 | `supabase/migrations/20260324000001_analytics_events.sql` | **신규** |
| 3 | `docs/contract.md` | 수정 (v2.9 analytics_events 추가) |
| 4 | `vitest.config.ts` | 수정 (exclude 패턴) |
| 4 | `next.config.mjs` | 수정 (PWA 캐싱 정책) |
| 5 | `src/middleware.ts` | 수정 (admin role 체크) |
| 5 | `src/lib/db.ts` | 수정 (searchQuizzes 이스케이프) |

**총 10개 파일** (2 신규 + 8 수정)

---

## 검증 계획

| 검증 항목 | 명령/방법 |
|----------|----------|
| 빌드 성공 | `npm run build` exit 0 |
| 테스트 통과 | `npx vitest run` — 워크트리 E2E 노이즈 제거 확인 |
| rate limit 동작 | 테스트 코드로 11회 연속 호출 → 429 확인 |
| reviews 401 | 미로그인 상태에서 POST → 401 확인 |
| admin role 차단 | 일반 사용자로 /admin 접근 → / 리다이렉트 확인 |
| PWA API 비캐싱 | 서비스 워커 설정에서 /api/* NetworkOnly 확인 |
| analytics SQL | 마이그레이션 파일 문법 검증 |

---

## 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| reviews POST 인증 추가 → 기존 비로그인 리뷰 깨짐 | 프론트엔드 리뷰 UI 사용 불가 | 프론트에서 로그인 유도 UI 추가 필요 |
| in-memory rate limit → 서버리스 인스턴스별 독립 | 인스턴스 N개면 실질 limit N배 | 베타 10명에서는 문제없음. 100명 이상 시 Upstash Redis 도입 |
| middleware DB 조회 → /admin 페이지 로드 지연 | 50~100ms 추가 | admin 소수이므로 무시 가능 |
| analytics 마이그레이션 수동 실행 필요 | 잊으면 계속 조용히 실패 | 커밋 메시지에 "Supabase 대시보드에서 실행 필요" 명시 |

---

## 이전 계획

# Quiz Editor 시스템 — Google Sheets 동기화 + 앱 어드민

> 작성: 2026-03-23 | 담당: V (v-0322.night) | 승인: 대기

(이전 계획 내용은 별도 보관. 보안 강화 완료 후 재개.)
