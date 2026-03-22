# 강선생2 지시서 — WrongNote 마이페이지/통계 + 유틸 정리
**작성**: 스미스 프라임 | **날짜**: 2026-03-22 | **우선순위**: 높음
**CWD**: `~/Projects/special-education-web`

> **Round 2 작업** — 클루디1이 `docs/.cloudy1-done` 생성 후 시작.
> 시작 전 확인: `ls docs/.cloudy1-done` (파일 있으면 시작 가능)

---

## 강선생2 담당 도메인

**마이페이지/통계 컴포넌트 + 코드 품질 유틸 정리**

---

## 배경

클루디1이 WrongNote 타입에서 `question: QuizQuestion` 필드를 제거하고
`subject: string`으로 대체했다. 강선생2는 마이페이지/통계 측 수정 + 유틸 중복 제거 담당.

---

## 수정 대상 파일

### 1. `src/app/my/page.tsx` (L82 근처)

**현재**: `n.question.subject`로 과목 집계
**수정**: `n.subject`로 직접 접근 (WrongNote에 이미 있음)

```typescript
// 변경 전
wrongNotes.filter(n => n.question.subject === subjectSlug)

// 변경 후
wrongNotes.filter(n => n.subject === subjectSlug)
```

### 2. `src/app/quiz/[subject]/SessionSetup.tsx` (L116 근처)

**현재**: 미마스터 오답 필터링 시 `n.question.*` 접근
**수정**: `n.subject` 사용 또는 hydrated 패턴

### 3. `src/lib/stats-utils.ts` (L180 근처)

**현재**: `n.question.subject`로 통계 계산
**수정**: `n.subject`로 직접 접근

```typescript
// 변경 전
wrongNotes.filter(n => n.question.subject === subject)

// 변경 후
wrongNotes.filter(n => n.subject === subject)
```

---

## 추가 작업 — 유틸 중복 제거

### `src/lib/array-utils.ts` 신규 생성

여러 파일에 중복 정의된 `shuffle`, `dateSeed` 함수를 하나로 통합:

```typescript
/** Fisher-Yates 셔플. 원본 배열 불변. */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** 날짜 기반 시드 난수 생성 (같은 날 같은 값). */
export function dateSeed(dateStr: string): number {
  return dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
}

/** 시드 기반 셔플 (같은 날 같은 순서). */
export function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    const j = Math.abs(s) % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

**중복 제거 대상 파일 조회**:
```bash
grep -r "function shuffle\|function dateSeed\|function seededShuffle" src/ --include="*.ts" --include="*.tsx" -l
```

각 파일에서 inline 정의를 제거하고 `@/lib/array-utils` import로 교체.

---

## 금지 사항

- `docs/contract.md` 수정 금지
- `nav-config.ts`, Next.js route page.tsx 수정 금지
- 클루디1이 수정한 파일(db.ts, types/study.ts, useHydratedWrongNotes.ts, useQuizStore.ts) 수정 금지
- 강선생1 담당 파일(WrongNotesClient.tsx, WrongNotesQuizClient.tsx) 수정 금지

---

## Auto 명령어

```
/auto --mode refactor WrongNote 마이페이지/통계 수정: my/page.tsx와 stats-utils.ts에서 n.question.subject를 n.subject로 수정, quiz/[subject]/SessionSetup.tsx wrongNote 필터링 수정, lib/array-utils.ts 신규 생성하여 shuffle/dateSeed/seededShuffle 중복 제거
```

---

## 완료 기준

1. my/page.tsx — `n.question.*` 없음
2. stats-utils.ts — `n.question.*` 없음
3. SessionSetup.tsx — TS 에러 없음
4. `src/lib/array-utils.ts` 존재 (3개 함수 export)
5. 기존 inline shuffle/dateSeed → import 교체 완료
6. `npx tsc --noEmit` 에러 0건 (담당 파일 기준)

노션 pending.json 작성 후 커밋.
