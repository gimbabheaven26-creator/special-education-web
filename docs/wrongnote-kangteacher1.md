# 강선생1 지시서 — WrongNote 오답노트 컴포넌트
**작성**: 스미스 프라임 | **날짜**: 2026-03-22 | **우선순위**: 높음
**CWD**: `~/Projects/special-education-web`

> **Round 2 작업** — 클루디1이 `docs/.cloudy1-done` 생성 후 시작.
> 시작 전 확인: `ls docs/.cloudy1-done` (파일 있으면 시작 가능)

---

## 강선생1 담당 도메인

**오답노트 관련 컴포넌트** — wrong-notes 페이지 전담

---

## 배경

클루디1이 WrongNote 타입에서 `question: QuizQuestion` 필드를 제거하고
`subject: string`으로 대체했다. 새로운 `useHydratedWrongNotes` 훅이 생성됐다.

강선생1은 오답노트 관련 컴포넌트 3개를 이 구조에 맞게 수정한다.

---

## 수정 대상 파일 (3개)

### 1. `src/app/wrong-notes/WrongNotesClient.tsx`

**현재**: `n.question.subject`, `n.question.chapter`, `n.question.type` 등 직접 접근
**수정**: `useHydratedWrongNotes(wrongNotes)` 훅 사용

```typescript
// 수정 예시
import { useHydratedWrongNotes } from '@/hooks/useHydratedWrongNotes';

// 컴포넌트 내부
const { hydrated, loading } = useHydratedWrongNotes(wrongNotes);

if (loading) return <로딩 스켈레톤>;
// hydrated[i].question?.subject 또는 hydrated[i].subject (필터링용)
```

### 2. `src/app/wrong-notes/quiz/WrongNotesQuizClient.tsx`

**현재**: `n.question.*` 또는 `wrongNote.question.*` 직접 접근
**수정**: `useHydratedWrongNotes` 또는 props로 hydrated 데이터 받기

퀴즈 실행 중에는 이미 question 데이터가 있으므로:
- WrongNotesClient에서 hydrated 데이터를 quiz 페이지에 전달하는 방식 권장

### 3. `src/app/quiz/[subject]/QuizClient.tsx`

**현재**: `useQuizStore`의 wrongNotes에서 `n.question.type` 등으로 필터링
**수정**: `n.question` 없음 → 필터링이 필요하면 `n.subject` 사용 또는 DB fetch

---

## 작업 방식

1. 클루디1이 만든 `useHydratedWrongNotes` 훅 임포트
2. `wrongNote.question.*` → `hydratedNote.question?.* ?? 기본값` 패턴
3. loading 상태에서는 스켈레톤 UI 표시
4. null-safe 접근: `hydrated.question?.subject ?? n.subject`

---

## 금지 사항

- `docs/contract.md` 수정 금지
- `nav-config.ts`, Next.js route 파일(page.tsx) 수정 금지
- DB 스키마 변경 금지
- 클루디1이 수정한 파일(db.ts, types/study.ts, hooks/useHydratedWrongNotes.ts, useQuizStore.ts) 수정 금지

---

## Auto 명령어

```
/auto --mode refactor WrongNote 컴포넌트 수정: wrong-notes/WrongNotesClient.tsx와 wrong-notes/quiz/WrongNotesQuizClient.tsx에서 n.question.* 직접 접근을 useHydratedWrongNotes 훅으로 교체, quiz/[subject]/QuizClient.tsx의 wrongNote 필터링 수정
```

---

## 완료 기준

1. WrongNotesClient.tsx — `n.question.*` 직접 접근 없음
2. WrongNotesQuizClient.tsx — hydrated 패턴 사용
3. QuizClient.tsx — wrongNote 관련 TS 에러 없음
4. `npx tsc --noEmit` 에러 0건 (wrong-notes, quiz 관련)
5. 오답노트 페이지 로딩 → 스켈레톤 → 문제 표시 플로우 작동

노션 pending.json 작성 후 커밋.
