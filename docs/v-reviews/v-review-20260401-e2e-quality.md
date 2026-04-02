# V 검증: E2E 테스트 품질 (8개 파일, 97 tests)

검증일: 2026-04-01
대상: quiz-ox-flow, daily-quiz, terms-search, flashcards-mgmt, diagnosis-hub, practice-hub, today-dashboard, kice-explorer

---

## 발견 사항

| # | 항목 | 심각도 | 파일 | 상태 |
|---|------|--------|------|------|
| 1 | waitForTimeout 남용 — flaky 테스트 원인 | HIGH | quiz-ox-flow, terms-search, diagnosis-hub, practice-hub | FIXED (efe948b, 2324e03) — 지적 파일 전량 제거 + my-record.spec.ts 잔여 3건도 제거 |
| 2 | localStorage.clear() 범위 과다 — 테스트 간 상태 오염 위험 | HIGH | quiz-ox-flow, daily-quiz | FIXED (efe948b) — 특정 키 제거 패턴으로 교체 |
| 3 | 플래시카드 복습 플로우(/flashcards/review) 완전 누락 | HIGH | flashcards-mgmt | FIXED (efe948b) — flashcards-review.spec.ts 신규 작성 |
| 4 | 조건부 skip 패턴이 테스트 신뢰를 훼손 | HIGH | diagnosis-hub, practice-hub, today-dashboard | FIXED (efe948b) — 시드 데이터 패턴 적용, skip 제거 |
| 5 | networkidle 의존 — SSR 스트리밍과 충돌 가능 | MEDIUM | 전체 6개 파일 | FIXED (1cff951) — 전 파일 domcontentloaded + UI expect 패턴으로 교체 |
| 6 | CSS 클래스 기반 셀렉터 — UI 리팩토링에 깨짐 | MEDIUM | terms-search, kice-explorer, today-dashboard | FIXED (1cff951) — data-testid/aria-pressed/role=progressbar로 교체, 소스 컴포넌트 3파일 수정 |
| 7 | 오답 시나리오 검증 불완전 — 운에 의존 | MEDIUM | quiz-ox-flow | FIXED (1cff951) — 10문제 all-O 전략 + 결과 화면에서 오답 수 검증, feedbackWrong 텍스트 명시적 확인 |
| 8 | daily-quiz 3스텝 완주 시간 비용 과다 | MEDIUM | daily-quiz | FIXED (1cff951) — test.describe.serial 도입, Step 2+3를 순차 블록으로 분리 |
| 9 | 플래시카드 추가(/flashcards/add) 페이지 테스트 없음 | MEDIUM | flashcards-mgmt | FIXED (1cff951) — 4개 테스트 추가 (2탭 UI, 퀴즈 가져오기, 수동 입력+저장 확인, 홈 링크) |
| 10 | 헬퍼 함수 중복 — 공통 유틸 미추출 | LOW | quiz-ox-flow, daily-quiz | WONTFIX — UI 구조 상이(순차 1문제 vs 일괄 OX), 추상화 시 오히려 복잡도 증가 |
| 11 | 에러/빈 상태 시나리오 커버리지 불균형 | MEDIUM | 전체 | FIXED (1cff951) — 6개 파일에 route.abort 네트워크 실패 테스트 추가 |
| 12 | KICE 모의고사 모드(/kice/exam) 미검증 | MEDIUM | kice-explorer | FIXED (1cff951) — setup→시작→문항탐색→깃발→제출→결과 전체 플로우 + 모바일 뷰포트 |
| 13 | 크로스 페이지 여정 미검증 | HIGH | 전체 | FIXED (efe948b) — cross-page-journey.spec.ts 431줄 신규 작성 |
| 14 | 모바일 뷰포트 테스트가 terms-search에만 존재 | MEDIUM | 전체 | FIXED (1cff951) — quiz-ox-flow, daily-quiz, today-dashboard, kice-explorer에 375x812 뷰포트 테스트 추가 |

---

## 상세

### #1 waitForTimeout 남용 — flaky 테스트 원인 [HIGH]

**[문제]** `waitForTimeout(300)`, `waitForTimeout(500)`, `waitForTimeout(1000)` 총 9회 사용. 이는 Playwright 공식 문서에서 명시적으로 anti-pattern으로 지정한 패턴이다.

**[증거]**
- `quiz-ox-flow.spec.ts:144,268` — `waitForTimeout(300)` 2회
- `terms-search.spec.ts:203,221` — `waitForTimeout(300)`, `waitForTimeout(500)`
- `diagnosis-hub.spec.ts:96` — `waitForTimeout(1000)` hydration 대기
- `practice-hub.spec.ts:36` — `waitForTimeout(1000)` hydration 대기

**[원인]** hydration 완료, 상태 전환, 스크롤 이벤트 안정화를 sleep으로 처리. Playwright의 auto-waiting 메커니즘(`waitForSelector`, `expect().toBeVisible()`)을 신뢰하지 않고 수동 대기를 삽입했다.

**[리스크]** CI 환경(느린 CPU, 네트워크 지연)에서 300ms가 부족하면 flaky. 1000ms가 불필요하면 테스트 스위트 전체 실행 시간이 수 초 불필요하게 증가. 테스트 수가 늘어나면 이 시간이 분 단위로 누적된다.

**[제안]**
- hydration 대기: `waitForTimeout(1000)` 대신 `expect(hydrated-element).toBeVisible()` 패턴으로 교체
- 상태 전환 대기: `waitForTimeout(300)` 대신 다음 상태의 구체적 UI 요소를 `expect`로 대기
- 스크롤 안정화: `waitForFunction(() => window.scrollY < 50)` 같은 조건부 대기 (terms-search에서는 이미 사용 중인데, 그 직전에도 `waitForTimeout`을 쓰고 있어 모순)

---

### #2 localStorage.clear() 범위 과다 [HIGH]

**[문제]** `quiz-ox-flow`와 `daily-quiz`의 `beforeEach`에서 `localStorage.clear()`를 호출한다. 이는 테스트 대상 스토어뿐 아니라 모든 Zustand persist 스토어(study, bookmark, focus, onboarding, leitner)를 초기화한다.

**[증거]**
```typescript
// quiz-ox-flow.spec.ts:17
await page.evaluate(() => localStorage.clear());
// daily-quiz.spec.ts:18
await page.evaluate(() => localStorage.clear());
```

반면 flashcards-mgmt.spec.ts는 올바르게 `localStorage.removeItem('leitner-cards')`로 특정 키만 제거한다.

**[원인]** 테스트 작성 시 "깨끗한 상태"를 보장하려는 의도가 과도하게 적용됨.

**[리스크]**
1. 다른 스토어에 의존하는 컴포넌트가 비정상 동작할 수 있다 (예: onboarding 상태가 초기화되면 onboarding 플로우가 다시 뜰 수 있음)
2. 테스트가 "빈 상태에서만" 돌아가게 되어, 기존 데이터가 있을 때의 동작을 검증하지 못한다
3. 병렬 실행 시 다른 테스트 파일의 상태를 오염시킬 수 있다 (현재 workers:1이라 발생하지 않지만, 향후 병렬화 시 즉시 문제)

**[제안]** `flashcards-mgmt.spec.ts`처럼 해당 테스트가 의존하는 특정 키만 제거하거나, 특정 키를 시드(seed)하는 패턴으로 통일.

---

### #3 플래시카드 복습 플로우 완전 누락 [HIGH]

**[문제]** `/flashcards/review` 페이지의 실제 복습 플로우(카드 뒤집기, 힌트 단계, 자가 평가, 세션 완료)가 전혀 테스트되지 않았다. flashcards-mgmt.spec.ts는 관리(CRUD) 기능만 검증하고, 복습 버튼 클릭 후 URL 이동만 확인한 뒤 끝난다.

**[증거]**
```typescript
// flashcards-mgmt.spec.ts:273-279
test('복습 버튼 → /flashcards/review로 이동', async ({ page }) => {
    const reviewButton = page.getByRole('link', { name: /오늘 복습 시작/ });
    await reviewButton.click();
    await page.waitForURL('**/flashcards/review');
    await expect(page).toHaveURL(/\/flashcards\/review/);
    // 여기서 끝. 실제 복습 인터랙션 없음.
});
```

**[원인]** 복습 페이지가 `FlashcardScene` 컴포넌트를 사용하며, 3단계 힌트(question -> hint -> answer) + AnswerGrade(knew/hint/forgot) 평가 로직이 복잡하여 테스트 작성을 건너뛴 것으로 보인다.

**[리스크]** 플래시카드의 핵심 가치가 "복습"인데, 복습 플로우의 회귀 방지가 없다. Leitner 박스 이동 로직(knew -> 박스+1, forgot -> 박스1)이 실제로 작동하는지 검증 불가. 이 앱의 수험생 사용자에게 가장 중요한 일상 루틴이 검증되지 않는 것.

**[제안]** `flashcards-review.spec.ts` 신규 파일로:
1. 시드 데이터 주입 -> /flashcards/review 접속
2. question 단계 -> "힌트 보기" 클릭 -> hint 단계 표시 확인
3. "답 보기" 클릭 -> answer 단계 표시 확인
4. "알고 있었어요"/"힌트로 맞췄어요"/"몰랐어요" 각각 클릭 -> 다음 카드 전환
5. 전체 카드 완료 -> 세션 결과 화면
6. localStorage의 box 값 변경 확인 (knew면 box+1, forgot면 box=1)

---

### #4 조건부 skip 패턴이 테스트 신뢰를 훼손 [HIGH]

**[문제]** 4개 테스트가 데이터 존재 여부에 따라 `test.skip()`을 호출한다. 이는 "테스트가 통과했다"는 보고가 "실제로 검증했다"를 의미하지 않게 만든다.

**[증거]**
- `diagnosis-hub.spec.ts:99,107` — 세션 데이터 없으면 skip
- `practice-hub.spec.ts:39` — 빈 상태가 아니면 skip
- `today-dashboard.spec.ts:84` — flashcard 링크 없으면 skip

**[원인]** Zustand의 localStorage persist 상태가 테스트 환경에서 예측 불가능하기 때문. 시드 데이터 패턴을 적용하지 않았다.

**[리스크]** 149/150 통과라는 수치가 실질적으로 145/150일 수 있다. CI에서 항상 빈 상태로 실행되면, 데이터가 있을 때의 경로는 영원히 테스트되지 않는다.

**[제안]** flashcards-mgmt.spec.ts의 `seedAndReload` 패턴을 표준화하여:
1. "빈 상태" 테스트: localStorage 명시적 제거 후 검증
2. "데이터 있는 상태" 테스트: 시드 데이터 주입 후 검증
두 경로를 별도 describe 블록으로 분리하여 skip 없이 양쪽 모두 검증.

---

### #5 networkidle 의존 [MEDIUM]

**[문제]** 50회 이상 `waitForLoadState('networkidle')` 사용. Next.js App Router의 SSR 스트리밍(React Suspense)과 networkidle은 궁합이 나쁘다 — 스트리밍 청크가 계속 도착하면 networkidle 조건이 지연되거나 불안정해진다.

**[증거]** 모든 테스트 파일의 `beforeEach` 또는 `gotoKice` 헬퍼에서 사용.

**[리스크]** 현재 대부분 페이지가 클라이언트 컴포넌트라 큰 문제 없지만, 서버 컴포넌트 비중이 높아지면 타임아웃이나 false positive 발생 가능.

**[제안]** `waitForLoadState('domcontentloaded')` + 특정 UI 요소 `expect`로 전환. 예: `await expect(page.getByRole('heading', { name: '...' })).toBeVisible()`.

---

### #6 CSS 클래스 기반 셀렉터 [MEDIUM]

**[문제]** 접근성 셀렉터(getByRole, getByText)를 주로 사용한 것은 좋으나, 일부에서 CSS 클래스에 직접 의존한다.

**[증거]**
- `terms-search.spec.ts:69` — `page.locator('main .space-y-2 > div')`
- `terms-search.spec.ts:135` — `sectionContainer.locator('.space-y-2')`
- `terms-search.spec.ts:173` — `page.locator('.border.border-border.rounded-xl button')`
- `terms-search.spec.ts:247` — `page.locator('.grid.grid-cols-2')`
- `kice-explorer.spec.ts:99` — `await expect(year2025).toHaveClass(/bg-primary/)`
- `kice-explorer.spec.ts:182` — `page.locator('.bg-primary.h-1\\.5.rounded-full')`
- `today-dashboard.spec.ts:16` — `page.locator('span.font-mono')`

**[리스크]** Tailwind v4 마이그레이션, 디자인 시스템 변경, 컴포넌트 리팩토링 시 테스트가 깨진다. CSS 클래스는 구현 세부사항이지 사용자가 인식하는 행동이 아니다.

**[제안]** `aria-label`, `role`, `data-testid` 기반 셀렉터로 교체. 예: `<div role="progressbar" aria-valuenow={...}>` 으로 마크업 후 `getByRole('progressbar')` 사용.

---

### #7 오답 시나리오 검증 불완전 [MEDIUM]

**[문제]** quiz-ox-flow의 "wrong answer" 테스트(line 218-244)가 비결정적이다. O를 클릭했을 때 정답일 수도 있고 오답일 수도 있어서, 두 경우 모두 "통과"로 처리한다.

**[증거]**
```typescript
// quiz-ox-flow.spec.ts:236
// If correct, that's also a valid outcome - the test verifies feedback appears
```

"오답일 때 정답이 표시되는지"를 검증하겠다고 선언해놓고, 정답이 나와도 통과시키면 의미가 없다.

**[원인]** 퀴즈 데이터가 Supabase에서 랜덤 샘플링되므로 정답을 사전에 알 수 없다.

**[제안]**
1. O를 눌러서 정답이면, X를 눌러야 하는 다음 문제에서 반대를 선택
2. 또는 10문제를 전부 O로 풀면 확률적으로 5문제는 오답 (X가 정답인 경우). 전체 결과 화면에서 "오답" 카운트 > 0을 확인
3. 가장 확실: API mock 또는 localStorage seed로 정답을 알고 있는 퀴즈를 주입

---

### #8 daily-quiz 3스텝 완주 시간 비용 [MEDIUM]

**[문제]** daily-quiz의 후반 테스트(step 2, step 3, completion)는 매번 step 1부터 다시 시작한다. `advanceToStep3`은 step1 OX 전부 답변 -> 채점 -> step2 이동 -> 답안 확인 -> step3 이동까지 실행한다. 이것이 4개 테스트에서 반복된다.

**[증거]**
- `step 3: descriptive questions` — advanceToStep3 호출
- `completing all 3 steps` — advanceToStep3 + 추가 단계
- `completion screen shows score percentage` — completeAllSteps 호출
- `completion screen "홈으로 돌아가기"` — completeAllSteps 호출

각 호출마다 10+ 버튼 클릭 + 다수의 expect가 반복된다.

**[리스크]** 테스트 스위트 실행 시간 증가. CI에서 불필요한 시간 소모. 더 중요하게, 중간 단계에서 flaky하면 후반 테스트 전부 실패 — 실제 원인 추적이 어려워진다.

**[제안]** `test.describe.serial`로 순서 의존을 명시하고, step 1 완료 상태를 공유하거나, localStorage에 step 1 완료 상태를 시드해서 step 2/3에서 바로 시작.

---

### #9 플래시카드 추가 페이지 미검증 [MEDIUM]

**[문제]** `/flashcards/add` 페이지로 이동하는 테스트는 있으나(URL 확인만), 추가 페이지 자체의 기능(퀴즈에서 가져오기 탭, 수동 입력 탭, 과목 선택, 카드 생성)이 전혀 검증되지 않았다.

**[증거]**
```typescript
// flashcards-mgmt.spec.ts:265-271
test('추가 버튼 → /flashcards/add로 이동', async ({ page }) => {
    const addButton = page.getByRole('link', { name: '카드 추가' });
    await addButton.click();
    await page.waitForURL('**/flashcards/add');
    await expect(page).toHaveURL(/\/flashcards\/add/);
    // 끝. 추가 페이지의 인터랙션 없음.
});
```

최근 커밋(5a023b3)에서 "퀴즈에서 가져오기 + 수동 입력" 2탭 UI가 추가되었는데, 이 기능의 E2E 커버리지가 0이다.

**[리스크]** 카드 생성은 플래시카드 시스템의 입구. 입구가 깨지면 전체 기능이 무용지물.

---

### #10 헬퍼 함수 중복 [LOW]

**[문제]** quiz-ox-flow와 daily-quiz 모두 "모든 OX 문제에 답하기" 헬퍼를 각각 구현했다.

**[증거]**
- `quiz-ox-flow.spec.ts:250-270` — `answerAllQuestions(page, count)`
- `daily-quiz.spec.ts:341-352` — `answerAllOxQuestions(page)`

패턴은 다르지만(전자는 피드백 확인 + skip bar, 후자는 단순 클릭), 공통 추출 가능한 부분이 있다.

**[제안]** `tests/e2e/helpers/quiz-helpers.ts` 파일로 공통 헬퍼 추출.

---

### #11 에러/빈 상태 시나리오 커버리지 불균형 [MEDIUM]

**[문제]** flashcards-mgmt와 terms-search는 빈 상태를 잘 검증하지만, 나머지 6개 파일은 에러 상태(네트워크 실패, API 500)를 전혀 검증하지 않는다.

**[증거]**
- quiz-ox-flow: Supabase API가 실패하면? -> 미검증
- daily-quiz: /api/daily-questions가 빈 배열을 반환하면? -> 미검증
- kice-explorer: 기출 데이터 파일이 없는 연도를 선택하면? -> 미검증

**[리스크]** 프로덕션에서 Supabase 다운타임 발생 시 사용자가 보는 화면이 검증되지 않았다. error.tsx 컴포넌트의 실제 동작도 미검증.

---

### #12 KICE 모의고사 모드 미검증 [MEDIUM]

**[문제]** `/kice/exam` 페이지(모의고사 모드)가 라우트로 존재하고, kice-explorer에서 링크 href만 확인하지만, 실제 모의고사 플로우(타이머, 문제 풀기, 제출, 결과)가 전혀 테스트되지 않았다.

**[증거]**
```typescript
// kice-explorer.spec.ts:147-156 — 링크 존재와 href만 확인
const mockTestLink = page.getByRole('link', { name: /모의고사 모드/ });
await expect(mockTestLink).toBeVisible();
const href = await mockTestLink.getAttribute('href');
// 클릭해서 실제 모의고사 페이지 진입 안 함
```

---

### #13 크로스 페이지 여정 미검증 [HIGH]

**[문제]** 수험생의 실제 학습 루틴은 단일 페이지에서 끝나지 않는다. 핵심 여정들이 검증되지 않았다:

1. **퀴즈 -> 오답노트 -> 재풀기**: OX 퀴즈에서 틀린 문제가 오답노트에 등록되고, 오답노트에서 재풀기가 가능한가?
2. **용어사전 -> 플래시카드 추가 -> 복습**: 용어를 플래시카드에 추가한 후, /flashcards에서 해당 카드가 보이고, 복습이 가능한가?
3. **일일학습 완료 -> 홈 -> 완료 상태 반영**: daily quiz 완료 후 홈에서 "오늘 학습 완료" 상태가 표시되는가?
4. **진단 -> 약점 파악 -> 개념학습**: 진단 결과에서 약점 과목을 보고, 해당 과목의 개념학습으로 이동할 수 있는가?

**[리스크]** 각 페이지가 독립적으로 정상이어도, 데이터 흐름(Zustand 스토어 간 연동)이 깨지면 사용자 경험이 단절된다. 이것이 E2E 테스트의 가장 큰 가치인데, 현재 테스트는 대부분 "단일 페이지 기능 테스트"에 머물러 있다.

---

### #14 모바일 뷰포트 테스트 부족 [MEDIUM]

**[문제]** 모바일 반응형 테스트가 terms-search의 "모바일 목차" 1건뿐이다. 이 앱의 주 사용자(수험생)는 모바일 사용 비율이 높을 것으로 예상되는데, 대부분 테스트가 Desktop Chrome 기본 뷰포트(1280x720)에서만 실행된다.

**[증거]** playwright.config.ts의 projects에 모바일 디바이스가 없다. terms-search에서만 `page.setViewportSize({ width: 375, height: 812 })` 사용.

**[리스크]** 모바일에서 하단 탭바, 터치 타겟 크기, 스크롤 동작이 다를 수 있다. 특히 quiz-ox-flow의 O/X 버튼 터치 영역이 모바일에서 충분한지 미검증.

**[제안]** playwright.config.ts에 `devices['iPhone 13']` 프로젝트 추가, 또는 핵심 여정(퀴즈 풀기, 일일학습) 테스트에 모바일 뷰포트 변형 추가.

---

## 누락된 시나리오 (TOP 5)

### 1. 플래시카드 복습 전체 플로우 (CRITICAL)
`/flashcards/review` — question -> hint -> answer -> 자가평가(knew/hint/forgot) -> 박스 이동 확인 -> 세션 완료 화면. 이 앱의 핵심 학습 루프가 E2E에서 완전히 빠져 있다.

### 2. 퀴즈 -> 오답노트 -> 재풀기 크로스 페이지 여정 (HIGH)
수험생이 가장 많이 하는 루틴. 퀴즈에서 틀린 문제가 useStudyStore에 기록되고, /wrong-notes에서 조회되고, 재풀기할 수 있는지. 현재 wrong-notes.spec.ts는 빈 상태만 확인하는 3줄짜리 stub이다.

### 3. 과목별 퀴즈 플로우 (/quiz/[subject]) (HIGH)
OX 진단(/quiz/ox)과 단답형(/quiz/short)만 테스트되고, 과목 선택 -> 세션 설정(문제 수, 유형) -> 퀴즈 풀기 -> 결과의 메인 퀴즈 플로우가 미검증. quiz-flow.spec.ts는 과목 목록 렌더링만 확인하는 1줄짜리.

### 4. 에러 상태 E2E (네트워크 실패, API 에러) (MEDIUM)
route.fulfill / route.abort로 Supabase API를 mock하여 에러 상태의 UX 검증. error.tsx 컴포넌트가 13개 있지만, E2E에서 실제로 트리거된 적이 없다.

### 5. 온보딩 플로우 (/onboarding) (MEDIUM)
첫 방문자 시나리오. onboarding 페이지가 존재하지만 E2E 커버리지 0. 베타 테스터 모집 중이라면, 첫 방문 -> 온보딩 -> 홈 도착까지의 흐름이 검증되어야 한다.

---

## 전체 평가

**점수: 6.5/10 — REWORK**

### 잘 된 점
1. **접근성 셀렉터 기본 채택**: `getByRole`, `getByText` 중심으로 작성하여 사용자 관점 테스트에 가깝다. 이것은 올바른 방향.
2. **flashcards-mgmt의 시드 패턴**: `makeSeedData` + `seedAndReload` 패턴이 모범적이다. 이 패턴이 다른 파일에 적용되지 않은 것이 아쉽다.
3. **daily-quiz의 3스텝 완주**: 가장 복잡한 사용자 여정을 끝까지 검증한 것은 가치가 있다.
4. **kice-explorer의 탭 전환 + 연습 모드**: 상태 전환이 많은 UI를 잘 커버했다.

### 근본적 문제
1. **"단일 페이지 기능 테스트"에 머무름**: E2E의 핵심 가치는 크로스 페이지 데이터 흐름 검증인데, 97개 테스트 중 크로스 페이지 여정은 kice-explorer의 1건뿐이다. 나머지는 "통합 테스트"에 가깝다.
2. **핵심 학습 루프 미검증**: 플래시카드 복습, 오답노트 재풀기, 과목별 퀴즈 — 사용자가 매일 반복하는 3대 루프가 모두 빠져 있다.
3. **테스트 신뢰도**: 조건부 skip + 비결정적 오답 검증 + waitForTimeout 조합으로, "149/150 통과"라는 수치의 실질적 신뢰도가 낮다.
4. **방어적 테스트만 있고 공격적 테스트가 없다**: "정상 작동 확인"은 많지만, "이것을 부숴봐" 테스트(에러 주입, 경계값, 동시 탈주)가 전무하다.

### 결론

X의 E2E 작업은 "각 페이지가 뜨고 기본 인터랙션이 동작하는지"를 검증하는 스모크 테스트 수준에서 잘 작동한다. 149/150이라는 수치는 이 범위 안에서 유의미하다.

그러나 "사용자가 실제로 앱을 쓰는 것 같은 테스트"라는 기준으로 보면, 핵심 학습 루프 3개가 빠져 있고, 크로스 페이지 데이터 흐름이 미검증이며, 에러 경로가 전무하다. 수험생이 매일 반복하는 "퀴즈 풀기 -> 오답 확인 -> 플래시카드 복습" 사이클이 E2E로 보호되지 않는다는 것은, 이 테스트 스위트가 프로덕션 회귀 방지에 구멍이 있다는 뜻이다.

8점(PASS) 기준 도달을 위한 최소 요구사항:
1. [#3] flashcards-review 플로우 테스트 추가
2. [#13] 최소 1개 크로스 페이지 여정 테스트 (퀴즈 -> 오답노트 추천)
3. [#1] waitForTimeout 전량 제거 또는 조건부 대기로 교체
4. [#4] 조건부 skip을 시드 데이터 패턴으로 교체
