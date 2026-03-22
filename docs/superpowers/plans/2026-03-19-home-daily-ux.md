# 홈 오늘의 문제 UX 개편 + 일일수학 고유번호 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 홈화면에서 문제를 숨기고 버튼만 노출하며, 일일수학처럼 날짜 기반 고유번호를 문제지/답안지에 표시한다.

**Architecture:** HomeQuizSectionClient를 버튼 전용 카드로 교체하고, 날짜에서 생성한 코드(e.g. `DAY-0319`)를 /daily와 /today/answers 페이지 헤더에 표시한다. QR 코드는 전면 제거한다.

**Tech Stack:** Next.js 14 App Router, React, Tailwind CSS v4, react-qr-code(제거)

---

## 파일 구조

| 파일 | 유형 | 변경 내용 |
|------|------|----------|
| `src/components/HomeQuizSectionClient.tsx` | 수정 | 버튼 전용 카드 — QR·문제목록·답안표 전부 제거 |
| `src/app/daily/page.tsx` | 수정 | 상단 헤더에 고유번호 표시 |
| `src/app/today/answers/page.tsx` | 수정 | 상단 헤더에 고유번호 표시 |
| `src/lib/sheet-code.ts` | 신규 | `makeSheetCode(dateRaw)` 유틸 함수 |

---

## Chunk 1: 홈 카드 + 고유번호 유틸

### Task 1: sheet-code 유틸 함수

**Files:**
- Create: `src/lib/sheet-code.ts`
- Test: `src/lib/__tests__/sheet-code.test.ts`

**배경:** `/daily`와 `/today/answers` 양쪽에서 같은 코드가 필요하므로 단일 유틸로 분리한다.

- [ ] **Step 1: 실패 테스트 작성**

```ts
// src/lib/__tests__/sheet-code.test.ts
import { makeSheetCode, getKSTDateRaw } from '../sheet-code';

describe('makeSheetCode', () => {
  it('YYYY-MM-DD를 DAY-MMDD 형식으로 변환한다', () => {
    expect(makeSheetCode('2026-03-19')).toBe('DAY-0319');
    expect(makeSheetCode('2026-11-01')).toBe('DAY-1101');
    expect(makeSheetCode('2026-01-09')).toBe('DAY-0109');
  });
});

describe('getKSTDateRaw', () => {
  it('YYYY-MM-DD 형식을 반환한다', () => {
    expect(getKSTDateRaw()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
```

- [ ] **Step 2: 테스트 실패 확인**

```bash
cd /Users/gihoonkim/Projects/special-education-web
npx vitest run src/lib/__tests__/sheet-code.test.ts
```
Expected: FAIL (모듈 없음)

- [ ] **Step 3: 최소 구현**

```ts
// src/lib/sheet-code.ts

/**
 * YYYY-MM-DD → "DAY-MMDD" 형식 고유번호 생성
 * 예: "2026-03-19" → "DAY-0319"
 */
export function makeSheetCode(dateRaw: string): string {
  const parts = dateRaw.split('-');
  return `DAY-${parts[1]}${parts[2]}`;
}

/** 한국 표준시 기준 오늘 날짜 (YYYY-MM-DD) */
export function getKSTDateRaw(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
}
```

- [ ] **Step 4: 테스트 통과 확인**

```bash
npx vitest run src/lib/__tests__/sheet-code.test.ts
```
Expected: PASS (4/4)

- [ ] **Step 5: 커밋**

```bash
git add src/lib/sheet-code.ts src/lib/__tests__/sheet-code.test.ts
git commit -m "feat(lib): makeSheetCode 유틸 — 날짜→DAY-MMDD 고유번호"
```

---

### Task 2: HomeQuizSectionClient — 버튼 전용 카드

**Files:**
- Modify: `src/components/HomeQuizSectionClient.tsx` (전체 교체)
- Modify: `src/components/HomeQuizSection.tsx` (dateRaw 그대로 유지, 변경 없음)

**배경:**
현재는 홈에서 문제 18개를 모두 노출하고 QR 코드도 보여준다.
카이란 피드백: 메인화면에선 숨기고, 버튼 클릭 시 `/daily`로 이동.
QR은 모의고사 전용으로 이동 예정 — 지금은 완전 제거.

**구현 내용:**
```
┌──────────────────────────────────────────┐
│  📝 오늘의 문제          3월 19일 (목)   │
│  OX 10  단답 5  서술 3   코드: DAY-0319  │
│                                          │
│          [  지금 풀기 →  ]               │
└──────────────────────────────────────────┘
```

- [ ] **Step 1: HomeQuizSectionClient.tsx 전체 교체**

```tsx
// src/components/HomeQuizSectionClient.tsx
'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { makeSheetCode } from '@/lib/sheet-code';

interface DailyQuestion {
  id: string;
  number: number;
  type: 'ox' | 'fill_in' | 'descriptive';
  question: string;
  answer: string;
  chapter: string;
}

interface HomeQuizSectionClientProps {
  questions: DailyQuestion[];
  date: string;
  dateRaw: string;
}

export function HomeQuizSectionClient({ questions, date, dateRaw }: HomeQuizSectionClientProps) {
  if (questions.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-center">
        <p className="text-sm text-muted-foreground">오늘의 문제 준비 중...</p>
      </div>
    );
  }

  const oxCount = questions.filter((q) => q.type === 'ox').length;
  const fillInCount = questions.filter((q) => q.type === 'fill_in').length;
  const descriptiveCount = questions.filter((q) => q.type === 'descriptive').length;
  const sheetCode = makeSheetCode(dateRaw);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <div>
          <h2 className="text-sm font-semibold text-foreground">오늘의 문제</h2>
          <p className="text-xs text-muted-foreground">{date}</p>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
          {sheetCode}
        </span>
      </div>

      {/* 구성 + CTA */}
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>OX {oxCount}</span>
          <span>단답 {fillInCount}</span>
          <span>서술 {descriptiveCount}</span>
        </div>
        <Link
          href="/daily"
          className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          지금 풀기 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build 2>&1 | grep -E "(error|Error|✓)" | head -10
```
Expected: `✓ Compiled successfully`

- [ ] **Step 3: react-qr-code 패키지 제거**

HomeQuizSectionClient.tsx 교체 후, 이 파일이 react-qr-code의 유일한 참조처였으므로 반드시 제거:

```bash
grep -r "from 'react-qr-code'" src/ --include="*.tsx" --include="*.ts"
# 결과 없으면 (= 교체 완료):
npm uninstall react-qr-code
```

주의: 자체 SVG QRCode 컴포넌트(worksheets 등)는 패키지와 무관하므로 건드리지 말 것.

- [ ] **Step 4: 커밋**

```bash
git add src/components/HomeQuizSectionClient.tsx package.json package-lock.json
git commit -m "feat(home): 오늘의 문제 버튼 전용 카드 — QR 제거, /daily 링크"
```

---

## Chunk 2: 고유번호 표시 (/daily + /today/answers)

### Task 3: /daily 페이지 상단 고유번호 표시

**Files:**
- Modify: `src/app/daily/page.tsx`

**배경:**
/daily는 3단계 퀴즈 플로우 페이지. 최상단에 오늘 날짜와 고유번호를 표시해두면,
인쇄/스크린샷 시 어느 날짜 문제집인지 명확하게 알 수 있다.

현재 `/daily/page.tsx`는 클라이언트 컴포넌트로 `dateSeed()` 함수가 있어 날짜를 직접 계산 가능.

- [ ] **Step 1: daily/page.tsx에 고유번호 배너 추가**

`dateSeed()` 함수 옆에 날짜 문자열을 가져오는 코드 추가:
```ts
function getKSTDateRaw(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
}
```
주의: 이미 `import { getKSTDateRaw } from '@/lib/sheet-code'`로 가져올 수 있다. 로컬 함수 대신 임포트 사용.

STEP 헤더 영역 (현재 `<header>` 또는 최상단 div)에 아래 추가:
```tsx
import { makeSheetCode, getKSTDateRaw } from '@/lib/sheet-code';

// 컴포넌트 바깥 모듈 수준에 선언 (모듈 로드 시 1회 평가 — 자정 렌더 불일치 방지)
const TODAY_RAW = getKSTDateRaw();
const TODAY_SHEET_CODE = makeSheetCode(TODAY_RAW);
```

헤더 영역 JSX (모든 step에서 항상 노출되는 최상단에 배치):
```tsx
{/* 고유번호 배너 */}
<div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
  <span>오늘의 학습</span>
  <span className="font-mono bg-muted px-2 py-0.5 rounded">{TODAY_SHEET_CODE}</span>
</div>
```

단계(step)와 무관하게 항상 보이는 최상단에 배치할 것.

- [ ] **Step 2: 빌드 확인**

```bash
npm run build 2>&1 | grep -E "(error|✓)" | head -5
```

- [ ] **Step 3: 커밋**

```bash
git add src/app/daily/page.tsx
git commit -m "feat(daily): 상단 고유번호 배너 — DAY-MMDD"
```

---

### Task 4: /today/answers 페이지 고유번호 강조

**Files:**
- Modify: `src/app/today/answers/page.tsx`

**배경:**
현재 `/today/answers`는 date를 제목에 표시하지만, 일일수학처럼 눈에 띄는 코드가 없다.
인쇄 시 코드가 선명하게 보여야 문제지-답안지 매칭이 쉽다.

- [ ] **Step 1: today/answers/page.tsx에 고유번호 강조 추가**

현재 헤더:
```tsx
<h1 className="text-xl font-bold text-foreground">오늘의 문제 — 답안</h1>
<p className="text-sm text-muted-foreground mt-0.5">{dateLabel}</p>
```

변경 후 (makeSheetCode import 추가 + 배지 강조):
```tsx
import { makeSheetCode } from '@/lib/sheet-code';

// page 함수 내부, safeDate 계산 후:
const sheetCode = makeSheetCode(safeDate);
```

JSX 헤더 영역:
```tsx
<div>
  <div className="flex items-center gap-3">
    <h1 className="text-xl font-bold text-foreground">오늘의 문제 — 답안</h1>
    <span className="font-mono text-sm font-bold bg-primary/10 text-primary px-2.5 py-1 rounded border border-primary/20">
      {sheetCode}
    </span>
  </div>
  <p className="text-sm text-muted-foreground mt-0.5">{dateLabel}</p>
</div>
```

- [ ] **Step 2: 빌드 확인**

```bash
npm run build 2>&1 | grep -E "(error|✓)" | head -5
```

- [ ] **Step 3: 최종 통합 테스트 (수동)**

```
1. http://localhost:3000 접속 → 오늘의 문제 카드: 문제 목록 없음, 코드 표시, "지금 풀기 →" 버튼만
2. "지금 풀기 →" 클릭 → /daily 이동 확인
3. /daily 최상단 DAY-MMDD 코드 표시 확인
4. /today/answers?date=2026-03-19 접속 → 헤더에 DAY-0319 코드 강조 표시 확인
5. 인쇄 버튼 클릭 → 코드 인쇄 확인
```

- [ ] **Step 4: 최종 커밋**

```bash
git add src/app/today/answers/page.tsx
git commit -m "feat(answers): 고유번호 강조 배지 — 인쇄용 문제지 코드"
git push
```

---

## 검증 체크리스트

| 항목 | 확인 방법 |
|------|----------|
| 홈에서 문제 목록 미노출 | 홈 접속 → 카드에 문제 텍스트 없음 |
| QR 코드 제거 | 홈 소스 확인 → QRCode 컴포넌트 없음 |
| 코드 일치 | 홈 DAY-XXXX = /daily DAY-XXXX = /today/answers DAY-XXXX |
| 빌드 통과 | `npm run build` exit 0 |
| 테스트 통과 | `npx vitest run` — sheet-code 4/4 |
