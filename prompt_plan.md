# Phase 4: 학습 경험 고도화 (완료)

## 완료된 작업

### 벤치마킹 기반 개선 (구조 변경 없이)
1. **퀴즈 결과 → 챕터 링크** — QuizResultScreen에서 챕터별 BookOpen 링크
2. **오답노트 → 챕터 링크** — WrongNoteCard에서 "챕터 보기" 링크
3. **네비게이션 통일** — Header: 오답노트/통계 추가, "플래시카드"→"카드"
4. **오답 자동 복습 혼합** — buildSessionWithReview (10문제 중 오답 3문제 자동 삽입)

### Phase 4 서브 작업
- **4A** ✅ 오답 재시험 데이터 누락 수정 (wrong-notes/quiz)
- **4B** ✅ 오답 요약 카드 (WrongNoteSummary + computeWrongNoteSummary)
- **4C** ✅ 취약 영역 챕터 드릴다운 + 과목별 직접 퀴즈 링크
- **4D** ✅ 주간 요약 카드 (WeeklySummary + computeWeeklySummary)
- **연결** ✅ StatsClient에 새 컴포넌트 통합

## 변경 파일
| 파일 | 작업 |
|------|------|
| `src/app/wrong-notes/quiz/page.tsx` | 수정 (recordQuizResult + addQuizResult 추가) |
| `src/lib/stats-utils.ts` | 수정 (computeWrongNoteSummary, computeWeeklySummary 추가) |
| `src/app/stats/WrongNoteSummary.tsx` | 신규 |
| `src/app/stats/WeeklySummary.tsx` | 신규 |
| `src/app/stats/WeakAreas.tsx` | 수정 (챕터 드릴다운 + 과목별 퀴즈 링크) |
| `src/app/stats/StatsClient.tsx` | 수정 (새 컴포넌트 연결) |
| `src/app/quiz/[subject]/QuizClient.tsx` | 수정 (buildSessionWithReview, shuffleAndPick 제거) |
| `src/app/wrong-notes/WrongNoteCard.tsx` | 수정 (챕터 보기 링크) |
| `src/components/layout/Header.tsx` | 수정 (네비게이션 통일) |

## 빌드 검증
- `npx next build` 성공 (0 errors)
