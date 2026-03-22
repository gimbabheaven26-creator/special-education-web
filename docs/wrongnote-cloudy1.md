# 클루디1 지시서 — WrongNote Foundation
**작성**: 스미스 프라임 | **날짜**: 2026-03-22 | **우선순위**: 긴급 (강선생 대기 중)
**CWD**: `~/Projects/special-education-web`

> **Round 1 선행 작업** — 강선생1/강선생2는 이 작업 완료 후 시작.
> 완료 후 `touch docs/.cloudy1-done` 으로 신호.

---

## 배경

`WrongNote` 타입이 전체 `QuizQuestion` 객체를 localStorage에 저장 중.
500개 × 전체 객체 → 저장소 압박 + DB 업데이트 시 stale 문제.
클루디1은 Foundation 레이어(DB/타입/스토어/훅) 전담. 컴포넌트는 강선생이 처리.

---

## 현재 상태

```typescript
// src/types/study.ts
export interface WrongNote {
  questionId: string;
  question: QuizQuestion; // ← 전체 객체 저장 (문제)
  userAnswer: string | number;
  attempts: number;
  lastAttempt: number;
  mastered: boolean;
}
```

`useQuizStore.ts`의 `getWrongNotesBySubject`가 `n.question.subject` 사용 중.
`src/lib/db.ts`에 ID 배열로 quiz_question 조회하는 함수 없음.

---

## 작업 경로

### Step 1 — `src/lib/db.ts`: batch 조회 함수 추가

`mapQuizRow` 함수는 이미 L94에 있음. `getAllQuizzes` 아래에 추가:

```typescript
export async function getQuizzesByIds(ids: string[]): Promise<QuizQuestion[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .in('id', ids)
    .limit(500);
  if (error || !data) return [];
  return data.map(mapQuizRow);
}
```

### Step 2 — `src/types/study.ts`: WrongNote 타입 변경

`question: QuizQuestion` 제거, `subject: string` 추가:

```typescript
export interface WrongNote {
  questionId: string;
  subject: string;    // 신규 — 필터링용 (question.subject 대체)
  userAnswer: string | number;
  attempts: number;
  lastAttempt: number;
  mastered: boolean;
}
```

### Step 3 — `src/hooks/useHydratedWrongNotes.ts`: 신규 생성

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getQuizzesByIds } from '@/lib/db';
import type { WrongNote } from '@/types/study';
import type { QuizQuestion } from '@/types/quiz';

export interface HydratedWrongNote extends WrongNote {
  question: QuizQuestion | null;
}

export function useHydratedWrongNotes(notes: WrongNote[]): {
  hydrated: HydratedWrongNote[];
  loading: boolean;
} {
  const [hydrated, setHydrated] = useState<HydratedWrongNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (notes.length === 0) {
      setHydrated([]);
      setLoading(false);
      return;
    }
    const ids = notes.map((n) => n.questionId);
    getQuizzesByIds(ids).then((questions) => {
      const map = new Map(questions.map((q) => [q.id, q]));
      setHydrated(notes.map((n) => ({ ...n, question: map.get(n.questionId) ?? null })));
      setLoading(false);
    });
  }, [notes]);

  return { hydrated, loading };
}
```

### Step 4 — `src/stores/useQuizStore.ts`: 스토어 수정

**addWrongNote** (L86~130): `question` 제거, `subject: question.subject` 추가
```typescript
// 신규 오답 추가 시
{ questionId: question.id, subject: question.subject, userAnswer, attempts: 1, lastAttempt: Date.now(), mastered: false }
// 기존 오답 업데이트 시 — question 필드 없이 나머지만 업데이트
```

**getWrongNotesBySubject** (L162):
```typescript
get().wrongNotes.filter((n) => n.subject === subject)
```

**persist version 3 → 4**:
```typescript
if (version < 4) {
  const wrongNotes = Array.isArray(state.wrongNotes) ? state.wrongNotes : [];
  state = {
    ...state,
    wrongNotes: wrongNotes.map((n: Record<string, unknown>) => ({
      questionId: n.questionId,
      subject: (n.question as Record<string, unknown>)?.subject ?? '',
      userAnswer: n.userAnswer,
      attempts: n.attempts ?? 1,
      lastAttempt: n.lastAttempt ?? Date.now(),
      mastered: n.mastered ?? false,
    })),
  };
}
```

---

## 금지 사항

- `docs/contract.md` 직접 수정 금지
- 강선생 담당 컴포넌트 수정 금지 (WrongNotesClient.tsx, QuizClient.tsx 등)
- 타입 변경으로 컴포넌트 TS 에러 발생해도 직접 수정 금지 — 강선생 담당

---

## Auto 명령어

```
/auto --mode refactor WrongNote Foundation 리팩토링: db.ts에 getQuizzesByIds 추가, types/study.ts WrongNote 타입에서 question 제거 및 subject 추가, hooks/useHydratedWrongNotes.ts 신규 생성, useQuizStore.ts v3→v4 migration 및 addWrongNote/getWrongNotesBySubject 수정
```

---

## 완료 기준

1. `getQuizzesByIds(['cd-q1'])` 호출 시 QuizQuestion[] 반환
2. WrongNote 타입에 `question` 없음, `subject: string` 있음
3. `useHydratedWrongNotes` 훅 export 확인
4. useQuizStore version = 4, migration 코드 존재
5. 컴포넌트 TS 에러 허용 (강선생 처리 예정)

완료 후:
```bash
touch docs/.cloudy1-done
```

노션 pending.json 작성 후 커밋.
