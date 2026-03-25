# V 검증: M1 감성 UX + SyncManager + 보안 수정 재검증

검증일: 2026-03-25
대상 커밋: 6764ead (M1 감성 UX), f4b6469 (SyncManager), 85a985c (V리뷰 보안 수정)
빌드: exit 0 (검증 시점 확인 완료)

## 발견 사항

| # | 항목 | 심각도 | 담당 | 상태 |
|---|------|--------|------|------|
| 1 | error.tsx 12개 파일 — 구조 동일, 중복 코드 468줄 | MEDIUM | 강선생1 | FIXED (X 2026-03-25) |
| 2 | error.tsx에 role="alert" / aria-live 누락 | MEDIUM | 강선생1 | FIXED (X 2026-03-25) |
| 3 | feedback rate limiter — 인메모리 Map 무한 성장 | MEDIUM | 강선생1 | FIXED (1bc28c8) |
| 4 | SyncManager — schedulePush 클로저가 stale userIdRef 참조 가능 | LOW | 강선생1 | OPEN |
| 5 | sw.js — /api/ GET 경로 캐싱 활성화 상태 (기존 감시 항목 재확인) | MEDIUM | 강선생1 | FIXED (1bc28c8) |
| 6 | EmptyState — action 링크에 aria-label 없음 | LOW | 강선생1 | OPEN |
| 7 | BottomTabBar scrollToTop — SPA 탐색 시 smooth 옵션 미적용 (UX) | LOW | 강선생1 | OPEN |

## 상세

### 1. error.tsx 12개 파일 중복 코드 (MEDIUM)

- **위치**: `src/app/*/error.tsx`, `src/app/*/*/error.tsx`, `src/app/*/*/*/error.tsx` (13개 파일, 각 39줄)
- **문제**: 12개 라우트별 error.tsx가 이모지, 제목 텍스트, aria-label 3가지만 다르고 나머지 구조가 완전 동일하다. 총 468줄 중 약 400줄이 복사된 코드.
- **리스크**: 스타일/구조 변경 시 13개 파일을 모두 수정해야 한다. 이미 한번 전체 수정이 일어났고(이번 커밋), 앞으로 접근성 수정이나 디자인 변경 때마다 반복된다.
- **제안**: 공통 `RouteErrorPage` 컴포넌트를 만들고, 각 error.tsx는 props만 전달하는 1-liner로 줄인다.

```tsx
// src/components/ui/RouteErrorPage.tsx
export function RouteErrorPage({ emoji, title, description, resetLabel, backHref, backLabel, reset }: Props) { ... }

// src/app/community/error.tsx
export default function CommunityError({ reset }: { error: Error; reset: () => void }) {
  return <RouteErrorPage emoji="💬" title="커뮤니티를 불러오는 데 잠시 문제가 생겼어요" ... reset={reset} />;
}
```

### 2. error.tsx에 role="alert" / aria-live 누락 (MEDIUM)

- **위치**: 13개 error.tsx 전체
- **문제**: 에러 화면은 사용자에게 중요한 상태 변화를 알리는 UI다. 스크린리더 사용자는 에러가 발생했다는 사실을 인지하지 못할 수 있다. `aria-label`은 버튼에 있지만, 에러 메시지 영역 자체에 `role="alert"` 또는 `aria-live="assertive"`가 없다.
- **WCAG 기준**: WCAG 2.1 4.1.3 Status Messages (AA) — 상태 메시지는 role 또는 aria-live로 프로그래밍 방식으로 결정 가능해야 한다.
- **제안**: 에러 메시지 컨테이너 div에 `role="alert"` 추가. 1번 항목의 공통 컴포넌트 리팩토링과 함께 처리하면 한 곳만 수정하면 된다.

### 3. feedback rate limiter — 인메모리 Map 무한 성장 (MEDIUM)

- **위치**: `src/app/api/feedback/route.ts:9` — `rateLimitMap`
- **문제**: Map에 IP 엔트리가 추가되기만 하고 삭제되지 않는다. `resetAt`이 지난 엔트리도 새 요청이 올 때 덮어쓰기될 뿐, 요청이 오지 않는 IP의 엔트리는 영구히 남는다.
- **리스크**: Vercel Serverless에서는 인스턴스가 재활용되므로 급격한 문제는 아니지만, 장기 실행 환경(self-hosted, Vercel Edge 등)에서는 메모리 누수. 원칙적으로 부정확한 패턴.
- **제안**: `checkRateLimit` 함수 시작 시 만료된 엔트리를 정리하는 로직 추가. 또는 Map 크기가 10000 초과 시 전체 clear.

```ts
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  // 만료 엔트리 정리 (100회 호출마다 1번)
  if (rateLimitMap.size > 1000) {
    for (const [k, v] of rateLimitMap) {
      if (v.resetAt < now) rateLimitMap.delete(k);
    }
  }
  // ... 기존 로직
}
```

### 4. SyncManager — schedulePush 클로저 stale ref (LOW)

- **위치**: `src/components/SyncManager.tsx:50-78`
- **문제**: `schedulePush`는 컴포넌트 함수 본문에 정의되어 있고, useEffect 내부의 subscribe 콜백에서 호출된다. `schedulePush`는 `userIdRef.current`를 setTimeout 콜백 내에서 읽으므로 타이밍 문제는 없다(ref는 항상 최신값). 그러나 `schedulePush` 함수 자체가 매 렌더마다 재생성되면서 subscribe 콜백의 클로저에는 최초 렌더의 `schedulePush`만 캡처된다.
- **분석**: 현재 코드에서 `schedulePush`가 참조하는 모든 외부값(`userIdRef`, `timers`, `isSyncing`, `lastSyncTs`)이 ref이므로 실질적 stale 문제는 없다. `DEBOUNCE_MS`도 상수다. 따라서 **실제 버그는 아니다**.
- **리스크**: 향후 schedulePush에 state 의존성이 추가되면 stale closure 버그가 된다.
- **제안**: `schedulePush`를 `useCallback`으로 감싸거나, ref로 유지하는 패턴 적용. 현재 시점에서는 감시 항목으로 유지.

### 5. sw.js — /api/ GET 경로 캐싱 (MEDIUM, 기존 감시 항목)

- **위치**: `public/sw.js` — `cacheName:"apis"` 섹션
- **문제**: `sameOrigin && pathname.startsWith("/api/")` 조건으로 GET 요청을 `NetworkFirst` 캐싱한다. `/api/auth/callback`만 제외. 이는 다음 문제를 유발할 수 있다:
  1. `/api/reviews` GET 응답이 캐싱되어 다른 사용자의 리뷰가 stale하게 보일 수 있다.
  2. 오프라인 시 캐시된 API 응답이 반환되어 사용자에게 혼란.
- **참고**: next-pwa가 자동 생성한 sw.js이므로 직접 수정보다는 `next.config.js`의 `runtimeCaching` 설정에서 `/api/` 경로를 `NetworkOnly`로 오버라이드하는 것이 올바른 접근.
- **리스크**: 현재 API 호출이 대부분 POST(feedback, reviews 저장)이므로 GET 캐싱의 실질적 영향은 `/api/reviews` GET 정도로 제한적. 하지만 API 엔드포인트가 늘어나면 문제가 확대된다.

### 6. EmptyState — action 링크에 aria-label 없음 (LOW)

- **위치**: `src/components/ui/EmptyState.tsx:22-27`
- **문제**: `action.label` 텍스트가 있으므로 스크린리더가 읽을 수 있다. 그러나 컨텍스트 없이 "첫 퀴즈 시작하기" 같은 텍스트만으로는 어떤 빈 상태에서 온 링크인지 불명확할 수 있다.
- **제안**: `action`에 선택적 `ariaLabel` 프로퍼티를 추가하여 더 구체적인 레이블을 제공할 수 있게 한다.

### 7. BottomTabBar scrollToTop — smooth 옵션 미적용 (LOW)

- **위치**: `src/components/layout/BottomTabBar.tsx:14`
- **문제**: `window.scrollTo(0, 0)` — 현재 탭을 누르면 즉시 최상단으로 점프한다. SPA에서 탭 전환 시 갑작스러운 점프는 사용자 경험을 해칠 수 있다.
- **제안**: `window.scrollTo({ top: 0, behavior: 'smooth' })` 적용. 단, 다른 탭으로 이동할 때는 smooth가 아닌 instant가 맞을 수 있으므로, 같은 탭 재클릭 시에만 smooth 적용 고려.

## 이전 V 리뷰 (85a985c) FIXED 재검증

| # | 항목 | 재검증 결과 |
|---|------|-------------|
| 1 | rate limiting IP당 3회/분 | VERIFIED — `checkRateLimit` 함수 정상 동작. IP 추출(`x-forwarded-for` 첫 번째 값), 429 응답 확인. |
| 2 | Discord @everyone/@here 인젝션 방지 | VERIFIED — `sanitize` 함수 zero-width space 삽입 확인. message + page 모두 sanitize 적용. |
| 3 | page 파라미터 길이 검증 | VERIFIED — `page.length > 200` 체크 + `typeof page !== 'string'` 체크 확인. |
| 4 | setTimeout 클린업 (DEFERRED) | 상태 유지 — BetaFeedbackWidget의 setTimeout(close, 2000)은 여전히 clearTimeout 없음. 컴포넌트 언마운트 시 setState on unmounted component 경고 가능. React 18에서는 경고만이고 크래시는 아니지만, 원칙적으로 클린업 필요. |

## 구조 우려 (감시 항목)

- **layout.tsx 컴포넌트 수**: 현재 12개 (ThemeProvider, Header, Footer, BottomTabBar, ConditionalReviewPanel, StudySessionTracker, SyncManager, BetaFeedbackWidget, Analytics, SpeedInsights + main/children). 이전 리뷰에서 9개로 카운트했으나 실제로는 12개. `<LayoutProviders>` 분리 시점이 다가왔다.
- **error.tsx 패턴**: 13개 파일 동일 구조 — 위 1번 항목 참조. 즉시 위험은 아니지만 유지보수 비용이 선형 증가.
- **BetaFeedbackWidget setTimeout 클린업**: DEFERRED 상태 유지. 베타 종료 시 컴포넌트 자체를 제거할 예정이므로 수정 우선순위 낮음.

## PASS 항목

| 항목 | 판정 |
|------|------|
| error.tsx 감성 메시지 품질 | PASS — 각 라우트별 맥락에 맞는 이모지, 안심 메시지("학습 기록은 안전합니다"), 두 가지 행동 옵션(다시 시도/홈으로) 제공. 좋은 UX. |
| not-found.tsx 404 페이지 | PASS — 간결하고 명확. 홈으로 돌아가기 링크 제공. |
| 로딩 스켈레톤 (concepts, quiz/ox, terms) | PASS — 실제 페이지 레이아웃과 일치하는 스켈레톤. `animate-pulse` 적절. 접근성 이슈 없음. |
| EmptyState 범용 컴포넌트 | PASS — 깨끗한 인터페이스. title/description/action 분리 적절. |
| QuizResultScreen 점수 분기 4구간 | PASS — 91+/61+/31+/30- 분기가 사용자 감정에 맞는 메시지 제공. 색상 분기도 적절(emerald/amber/red). |
| WrongNotesClient 빈 상태 | PASS — "틀리는 게 실력의 시작이에요" — 감성적이면서 동기 부여 메시지. 퀴즈 시작 CTA 제공. |
| focus-visible 글로벌 스타일 | PASS — `globals.css`에 `:focus-visible` 2px solid outline + offset 2px. 키보드 사용자 시각적 포커스 확인 가능. |
| min-h-[44px] 터치 타겟 | PASS — error.tsx 버튼, BottomTabBar 탭, EmptyState action 등에 일관 적용. WCAG 2.5.5 Target Size(Enhanced) 기준 44x44 충족. |
| SyncManager 이중 동기화 방지 (f4b6469) | PASS — `userIdRef.current === userId` early return으로 getUser + onAuthStateChange 동시 호출 방지. cleanup에서 `timers.current` 스냅샷 캡처로 ref mutation 이슈 해결. |
| 보안: XSS | PASS — `dangerouslySetInnerHTML` / `innerHTML` 사용 없음. React JSX 자동 이스케이프 적용. |
| 보안: console.log 린트 | PASS — src/ 전체에서 `console.log` 0건. `console.error`만 sync/upload/API 에러 핸들러에서 사용. |
| 빌드 | PASS — `npm run build` exit 0. 에러/경고 없음. |
