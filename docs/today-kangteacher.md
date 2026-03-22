# 강선생 세션 핸드오프 — 2026-03-22

## 이번 세션 완료 커밋 (최신순)

| 커밋 | 내용 |
|------|------|
| `c6673ea` | refactor(wrongnote): WrongNote n.question.* 제거 + array-utils 공통화 |
| `9e81fbe` | docs: 강선생 핸드오프 문서 업데이트 + PWA sw.js |
| `4028e7d` | fix(dashboard): T-08 dday useMemo→setInterval 자정 갱신 |
| `3cb4e80` | feat(pages): /bookmarks 퀴즈 버튼 + /my 학습계획 재설정 |
| `492e1ad` | /stats↔/mastery 탭 통합 포함 |

## 강선생2 세션 (2026-03-22) 완료 내용

- **WrongNote n.question.* 제거**: stats-utils.ts, SessionSetup.tsx → n.subject 직접 접근
- **array-utils.ts 신규**: shuffle / dateSeed / seededShuffle export, QuizClient + SelfCheckSection inline 제거
- **연쇄 수정**: error-patterns.ts, mastery.ts, AiBriefingCard, RecommendedChapters — quizHistory 역방향 조회 패턴
- **테스트 픽스**: error-patterns.test.ts, stats-utils.test.ts WrongNote mock 업데이트
- **180 테스트 PASS**

## 잔여 TS 에러 (강선생1 처리 필요)

- `WrongNoteCard.tsx`: question optional → TS18048 (강선생1 영역)
- `WrongNotesClient.tsx`: HydratedWrongNote 타입 불일치 (prohibited)
- `useHydratedWrongNotes.ts`: question null vs undefined (prohibited)
- `빌드`: 위 파일 수정 후 통과 예정

## T-08/09/10 현황

- **T-08 완료**: `TodayStudyPlan.tsx` dday를 `useMemo` → `useState+setInterval(60s)`로 교체. 자정 지나도 1분 내 갱신.
- **T-09 완료**: `elaboration.ts` `extractKeywords` PUA 플레이스홀더 적용 완료. 테스트 6/6 통과. (이미 적용된 상태였음)
- **T-10 완료**: `useMounted()` 훅 `@/hooks/useMounted.ts` 존재, 전 컴포넌트 사용 중. (이미 적용된 상태였음)

## ⚠️ 미커밋 스테이징 변경사항 (다음 세션에서 처리 필요)

`git status`에 staged 상태지만 커밋 안 된 파일들 — **내용 확인 후 커밋**:

```
src/lib/date-utils.ts          (신규) KST 날짜 유틸 (getKSTDate, getToday)
src/lib/db.ts                  (수정) +12줄
src/lib/sync.ts                (수정) +20줄
src/app/api/community/route.ts (수정) 문자 길이 검증 2,000/3,000자 제한
src/components/dashboard/DailyGoalCard.tsx  (수정) +3줄
src/components/dashboard/TodaySession.tsx   (수정) +3줄
.gitignore                     (수정) +2줄
```

Unstaged:
```
src/components/OnboardingGate.tsx  (수정) -3줄
src/components/layout/Header.tsx   (수정) -2줄
```

relaxed-pascal 워크트리에서 온 변경사항으로 보임. 내용 확인 후 커밋.

## 다음 작업 후보

1. 미커밋 스테이징 파일 처리 (git diff --cached 확인 후 커밋)
2. origin/main push (현재 9커밋 로컬 선행, push 안 된 상태)
3. 카이란의 다음 지시 대기

## 원격 상태

- `main` 브랜치, origin/main 대비 **9커밋 선행**
- push 안 된 상태
