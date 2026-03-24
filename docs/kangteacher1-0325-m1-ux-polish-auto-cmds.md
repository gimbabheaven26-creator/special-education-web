# 강선생1 지시서 — M1 스프린트: 감성 UX & 접근성 폴리시 (2026-03-25~31)

날짜: 2026-03-24 작성 (실행: 2026-03-25~31)
작성: 스미스 프라임
대상: 강선생1 (~/Projects/special-education-web)
기반: 릴리(LilysAI) 제언 + 베타 테스터 운영 요구

---

## 배경

릴리가 이 프로젝트에서 가장 중요하게 본 것은 두 가지다:

> "사람의 피가 담긴 감성 경험"과 "데이터 무결성"

지금 앱은 기능은 있지만 **감성**이 부족하다. 퀴즈 페이지를 열면 데이터가 로딩될 때까지 빈 화면이 보인다. 에러가 나면 Next.js 기본 화면이 뜬다. 버튼에 접근성 레이블이 없다. 이것이 M1(3/25~3/31)에서 강선생1이 채워야 할 빈 곳이다.

**기존 지시서와 분리:**
- `kangteacher1-0324-analytics-beta-feedback-auto-cmds.md` → Vercel Analytics + BetaFeedbackWidget (별도 실행)
- 이 파일 → 로딩/에러/빈 상태 UX + WCAG 접근성 기초 + 모바일 폴리시

---

## 사전 확인

```bash
cd ~/Projects/special-education-web
npm run build   # 빌드 정상 상태 확인 후 시작
git log --oneline -5  # 최근 커밋 확인
```

---

## Step 1 — 로딩 스켈레톤 (감성 UX 핵심)

현재 퀴즈/용어/개념학습 페이지는 데이터 로딩 중 빈 화면을 보여준다. Next.js App Router의 `loading.tsx` 패턴으로 해결한다.

```
/auto --mode feature 주요 페이지 로딩 스켈레톤 추가

[배경]
퀴즈/용어/개념학습 페이지에서 데이터 로딩 중 빈 화면 노출.
Next.js App Router의 loading.tsx + Suspense 패턴으로 스켈레톤 UI 추가.
릴리 제언: "사람의 피가 담긴 감성" — 로딩 중에도 살아있는 느낌을 줘야 한다.

[구현 대상]

### 공통 컴포넌트: src/components/ui/Skeleton.tsx (신규)

```tsx
// 범용 스켈레톤 — Tailwind animate-pulse 기반
// Props: className (추가 스타일)
// 사용: <Skeleton className="h-20 w-full rounded-xl" />
```

### loading.tsx 3개 (신규)

1. src/app/quiz/ox/loading.tsx
   - 퀴즈 카드 3개 스켈레톤 (h-40 rounded-2xl)
   - 상단 "로딩 중..." 텍스트 없음 — 스켈레톤만

2. src/app/terms/loading.tsx
   - 용어 카드 스켈레톤 5개 (h-16 rounded-xl)
   - 검색바 스켈레톤 (h-10 rounded-full)

3. src/app/concepts/loading.tsx (없으면 신규, 있으면 개선)
   - 개념 카드 스켈레톤 4개

[검증 항목]
- npm run build exit 0
- /quiz/ox 빠른 새로고침 시 스켈레톤 노출 확인 (Network 탭 Slow 3G 시뮬레이션)
- TypeScript 에러 없음

[커밋 메시지]
feat(ux): 퀴즈/용어/개념 로딩 스켈레톤 추가 — 감성 UX M1
```

---

## Step 2 — 에러 상태 + 빈 상태 UI (감성 UX)

현재 에러가 나면 Next.js 기본 에러 화면이 보인다. 빈 데이터가 나와도 빈 화면만 보인다.

```
/auto --mode feature 에러 상태 + 빈 상태 UI 컴포넌트 추가

[배경]
현재 에러/빈 상태가 브랜드와 무관한 화면을 보여줌.
앱의 감성을 유지하는 에러 화면 + 빈 상태 UI로 교체.

[구현 대상]

### 파일 1: src/components/ui/EmptyState.tsx (신규, Server Component)

Props:
- title: string
- description?: string
- action?: { label: string; href: string }

UI:
- 중앙 정렬, 아이콘 (📚 이모지 또는 적절한 아이콘)
- 제목: text-lg font-semibold
- 설명: text-sm text-muted-foreground
- 액션 버튼 (있으면): href로 이동하는 Link

### 파일 2: src/app/error.tsx (신규, 'use client' — Next.js 필수)

```tsx
'use client';
// Props: error: Error & { digest?: string }, reset: () => void
// UI: 친근한 에러 메시지 + 다시 시도 버튼
// 메시지: "앗, 뭔가 잘못됐어요 😅"
// 버튼: "다시 시도" → reset() 호출
// 홈으로 버튼: href="/"
```

### 파일 3: src/app/not-found.tsx (있으면 개선, 없으면 신규, Server Component)

```tsx
// 브랜드 감성 유지 404 페이지
// 메시지: "페이지를 찾을 수 없어요"
// 홈으로 돌아가기 Link
```

### 퀴즈 빈 상태 (src/app/quiz/ox/page.tsx 확인 후 적용)

퀴즈 데이터가 0개일 때:
  <EmptyState title="퀴즈가 없어요" description="아직 준비 중이에요. 조금만 기다려주세요!" />

[검증 항목]
- npm run build exit 0
- /not-found-page 접속 시 not-found.tsx 노출 확인
- 에러 컴포넌트 마운트 후 "다시 시도" 버튼 동작 확인

[커밋 메시지]
feat(ux): 에러/빈 상태 UI 추가 — error.tsx, not-found.tsx, EmptyState — 감성 UX M1
```

---

## Step 3 — WCAG 2.1 AA 접근성 기초

릴리 제언: "특수교육 앱으로서 접근성은 선택이 아닌 의무."

```
/auto --mode refactor 주요 인터랙티브 요소 WCAG 2.1 AA 접근성 개선

[배경]
릴리 제언: 특수교육 앱으로서 WCAG 2.1 AA 기준 접근성 필수.
현재 aria-label 누락, focus 스타일 미비, alt 텍스트 부재 가능성.

[탐색 먼저 — 문제 파악]

```bash
# aria-label 없는 button 찾기
grep -rn '<button' src/components/ src/app/ --include="*.tsx" | grep -v 'aria-label\|aria-labelledby\|>.*</button>' | head -30

# alt 없는 img 찾기
grep -rn '<img' src/ --include="*.tsx" | grep -v 'alt=' | head -20

# next/image에 alt 없는 것
grep -rn '<Image' src/ --include="*.tsx" | grep -v 'alt=' | head -20
```

[수정 범위 (최소 기준)]

1. 텍스트 없는 버튼 → aria-label 추가
   예: <button onClick={toggleMenu}> → <button onClick={toggleMenu} aria-label="메뉴 열기">

2. next/image → alt 속성 추가 (장식용이면 alt="")

3. focus-visible 스타일 확인 (전역 CSS)
   기존에 없으면 globals.css에 추가:
   ```css
   :focus-visible {
     outline: 2px solid rgb(59 130 246);
     outline-offset: 2px;
   }
   ```

4. 색상 대비: 회색 텍스트가 4.5:1 미만인 경우 text-gray-500 → text-gray-600 이상으로 조정
   (Tailwind 기준: gray-500 = #6b7280, gray-600 = #4b5563)

[주의]
- 의미를 변경하는 코드 수정 금지 — 레이블/alt 추가만
- 전체 리팩토링 금지 — aria-label + alt만 surgical하게 추가
- 수정 파일이 10개 초과하면 멈추고 스미스 프라임에게 보고

[커밋 메시지]
fix(a11y): WCAG 2.1 AA 접근성 기초 — aria-label, alt, focus-visible 추가
```

---

## Step 4 — 모바일 UX 폴리시 (베타 피드백 기반)

이 단계는 Step 1~3 완료 후 베타 테스터 피드백이 들어오면 실행. 지금은 알려진 이슈만.

```
/auto --mode bugfix 모바일 탭 전환 시 스크롤 위치 초기화 + 퀴즈 페이지 터치 UX 개선

[배경]
모바일에서 탭 전환 시 스크롤 위치가 유지되는 경우가 있어 사용자 혼란 유발.
퀴즈 버튼이 모바일에서 너무 작아 오터치 발생 가능.

[탐색 먼저]
cat src/components/BottomTabBar.tsx
cat src/app/quiz/ox/page.tsx | head -60

[수정 방향]
1. BottomTabBar — Link 클릭 시 window.scrollTo(0, 0) 트리거 (필요한 경우만)
2. 퀴즈 OX 버튼 — min-height: 56px 이상 확보 (현재 확인 후 결정)

[검증 항목]
- 모바일 에뮬레이터(Chrome DevTools) 375px 기준 확인
- 탭 전환 후 스크롤 위치 확인

[커밋 메시지]
fix(mobile): 탭 전환 스크롤 초기화 + 퀴즈 버튼 터치 영역 확대
```

---

## 실행 순서 요약

| 순서 | 작업 | 의존성 | 예상 소요 |
|------|------|--------|---------|
| Step 1 | 로딩 스켈레톤 | 없음 — 즉시 시작 | 45분 |
| Step 2 | 에러/빈 상태 UI | 없음 — 즉시 시작 | 45분 |
| Step 3 | 접근성 기초 | Step 1~2 완료 후 | 60분 |
| Step 4 | 모바일 폴리시 | 베타 피드백 수렴 후 | 30분 |

Step 1과 Step 2는 독립적이므로 병렬 실행 가능.

---

## 완료 보고 형식

모든 Step 완료 후 `~/.claude/notion-pending.json` 작성:

```json
{
  "destination": "sprint",
  "title": "강선생1: M1 감성 UX + 접근성 폴리시 완료 (2026-03-25~31)",
  "agent": "강선생1",
  "status": "완료",
  "tags": ["강선생", "특수교육웹", "M1", "UX", "접근성"],
  "content": "## 완료 사항\n\n- 로딩 스켈레톤: quiz/ox, terms, concepts loading.tsx\n- 에러 상태: error.tsx, not-found.tsx, EmptyState 컴포넌트\n- WCAG 접근성: aria-label, alt, focus-visible 추가\n- 모바일 폴리시: 탭 전환 스크롤 + 퀴즈 터치 영역\n\n## 빌드 검증\n\nnpm run build exit 0 확인"
}
```

커밋하면 자동으로 노션 스프린트 로그에 올라간다.

---

## 금지사항

- `console.log` 사용 금지 (린트 에러)
- 기존 컴포넌트 전체 리팩토링 금지 — Surgical Changes만
- DB 스키마 변경 금지 (강선생 도메인 아님)
- 수정 파일 10개 초과 시 멈추고 스미스 프라임에게 보고
- 접근성 수정 시 기능 변경 절대 금지 — 레이블/alt 추가만

---

## 참고 — 릴리 제언 전문 (스미스 프라임 요약)

릴리가 X와 프라임에게 보낸 메시지 핵심:
1. 기술적 완성도보다 **사람의 경험**이 먼저 (5월까지 기술 구조 완성 예정)
2. WCAG 접근성 — 특수교육 앱으로서 당연한 의무
3. 감성 UX — 로딩/에러 상태도 브랜드 경험의 일부
4. Zod 서버사이드 검증 — BetaFeedbackWidget API에 이미 반영됨 (0324 지시서)
