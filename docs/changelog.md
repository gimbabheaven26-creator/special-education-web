# Changelog

> 강선생-클루디 간 DB/API 변경 이력
> contract.md 변경 시 반드시 여기에 기록

## 작성 규칙

```
## [날짜] 변경자 — 변경 요약

### 변경 내용
- 구체적 변경 사항

### 영향 범위
- 강선생: 어떤 코드에 영향?
- 클루디: 어떤 데이터에 영향?

### 상태
- [ ] contract.md 업데이트
- [ ] 카이란 승인
- [ ] 구현 완료
- [ ] 상대 세션 전달
```

---

## [2026-03-15] 강선생 — 클로즈드 베타 리뷰 시스템 + KICE 기출 뷰어

### 변경 내용
- **리뷰 시스템 v2** — reviews 테이블에 reviewer_name, status 컬럼 추가
- **리뷰 대시보드** — `/reviews` 페이지 (필터링, 상태 관리: pending/discussing/accepted/rejected)
- **ReviewPanel 확장** — reviewer_name 입력 필드, 전체 페이지 활성화
- **API 확장** — `/api/reviews` PATCH 메서드 (상태 변경), POST에 reviewer_name 지원
- **KICE 기출 뷰어** — `/kice` 페이지 (연도/세션 선택, 원본/동형/예상 비교, 키워드 검색)
- **contract.md v2.2** — reviews 스키마 업데이트

### 신규/수정 파일
| 파일 | 작업 |
|------|------|
| `src/app/reviews/page.tsx` | 신규 |
| `src/app/kice/page.tsx` | 신규 |
| `src/app/kice/KiceClient.tsx` | 신규 |
| `src/components/kice/*.tsx` | 신규 (4파일) |
| `src/lib/kice.ts` | 신규 |
| `src/types/kice.ts` | 신규 |
| `scripts/migrate-reviews-v2.sql` | 신규 |
| `src/lib/db.ts` | 수정 (saveReview + updateReviewStatus) |
| `src/app/api/reviews/route.ts` | 수정 (PATCH + reviewer_name) |
| `src/components/ReviewPanel.tsx` | 수정 (reviewer_name 입력) |
| `src/components/layout/ConditionalReviewPanel.tsx` | 수정 (전페이지 활성화) |
| `src/components/layout/Header.tsx` | 수정 (기출 네비 링크) |
| `docs/contract.md` | 수정 (v2.2) |

### 영향 범위
- 강선생: UI 전반 (리뷰 시스템, 기출 뷰어)
- 클루디: reviews 테이블 마이그레이션 필요 (`scripts/migrate-reviews-v2.sql`)

### 상태
- [x] contract.md 업데이트
- [ ] 카이란 승인 (마이그레이션 실행)
- [x] 구현 완료
- [x] 빌드 성공 + 24 tests passed
- [x] 커밋 & 푸시 완료 (de74660, 8cebc9b)

---

## [2026-03-11] 초기 세팅 — contract.md v1.0 작성

### 변경 내용
- contract.md 최초 작성
- 6개 테이블 스키마 문서화
- db.ts API 시그니처 문서화
- 역할 분담 명시
- 데이터 정합성 규칙 정의

### 영향 범위
- 강선생: 없음 (기존 코드 그대로)
- 클루디: 향후 DB 변경 시 contract.md 먼저 수정 필요

### 상태
- [x] contract.md 업데이트
- [x] 카이란 승인 (이 세션에서)
- [x] 구현 완료
- [ ] 클루디 세션 전달

---

## [2026-03-14] 강선생 — Phase 4 세션 2: 차트, 필터링, 플래시카드 통합 + 버그 8건 수정

### 변경 내용
- **학습 활동 히트맵** — DailyHeatmap (12주 GitHub-style 히트맵) + computeHeatmapData 유틸
- **주간 학습 추이 차트** — WeeklyTrendChart (8주 바 차트 + 정답률) + computeWeeklyTrend 유틸
- **플래시카드 진행률** — FlashcardStats (Leitner Box 분포 차트, 오늘 복습 카드 수)
- **오답 노트 챕터 필터링** — 과목 선택 시 챕터 드롭다운 + URL params 딥링크 지원
- **오래된순 정렬** — wrong-notes 정렬에 'oldest' 옵션 추가 (spaced repetition 활용)
- **취약 영역 → 오답 딥링크** — WeakAreas에서 /wrong-notes?subject=... 바로가기
- **오답 → 플래시카드 원클릭 저장** — WrongNoteCard에 Leitner 자동 저장 버튼
- **버그 8건 수정** — OX 대소문자, ScenarioComposite allFilled, handleSkip 데드엔드, wrongNotes eviction overflow, duplicate setFinished, WrongNotesQuizClient 누락 타입, notFound() 미호출, wrongCount 계산 오류

### 신규/수정 파일
| 파일 | 작업 |
|------|------|
| `src/app/stats/DailyHeatmap.tsx` | 신규 |
| `src/app/stats/WeeklyTrendChart.tsx` | 신규 |
| `src/app/stats/FlashcardStats.tsx` | 신규 |
| `src/app/wrong-notes/quiz/WrongNotesQuizClient.tsx` | 신규 (page.tsx에서 분리) |
| `src/app/stats/StatsClient.tsx` | 수정 (3개 차트 연결) |
| `src/app/stats/WeakAreas.tsx` | 수정 (오답 딥링크) |
| `src/app/wrong-notes/WrongNoteCard.tsx` | 수정 (플래시카드 저장 버튼) |
| `src/app/wrong-notes/WrongNotesClient.tsx` | 수정 (챕터 필터 + URL params) |
| `src/app/wrong-notes/page.tsx` | 수정 (chapterTitleMap 전달) |
| `src/lib/stats-utils.ts` | 수정 (heatmap + weekly trend 유틸) |
| `src/stores/useQuizStore.ts` | 수정 (wrongNotes 500개 제한 + eviction) |
| `src/app/quiz/[subject]/QuestionCard.tsx` | 수정 (OX toUpperCase, allFilled) |
| `src/app/quiz/[subject]/QuizClient.tsx` | 수정 (handleSkip, setFinished) |
| `src/app/quiz/[subject]/QuizResultScreen.tsx` | 수정 (answeredCount 기반 rate) |
| `src/app/quiz/[subject]/page.tsx` | 수정 (notFound() 호출) |
| `src/app/error.tsx` + 4개 error.tsx | 수정 (console.error 제거) |

### 영향 범위
- 강선생: 통계 페이지 전면 확장, 오답 노트 UX 개선, 퀴즈 버그 수정
- 클루디: 없음 (DB 무관, 클라이언트 상태만 변경)

### 상태
- [x] 구현 완료
- [x] 빌드 성공 (TypeScript 0 errors)
- [x] 커밋 & 푸시 완료 (894bb12 + 이전 5개 커밋)

---

## [2026-03-14] 강선생 — Phase 4: 학습 경험 고도화

### 변경 내용
- **오답 재시험 데이터 수정** — wrong-notes/quiz에서 recordQuizResult + addQuizResult 호출 추가
- **오답 요약 카드** — WrongNoteSummary 컴포넌트 + computeWrongNoteSummary 유틸
- **주간 요약 카드** — WeeklySummary 컴포넌트 + computeWeeklySummary 유틸
- **취약 영역 챕터 드릴다운** — WeakAreas에 chapterStats prop + 과목별 직접 퀴즈 링크
- **북마크 버튼** — BookmarkButton 컴포넌트, 챕터 페이지 헤더에 추가
- **XP 상수 통합** — xp-constants.ts로 추출 (useStudyStore, stats-utils 공유)
- **타임존 KST 일치** — stats-utils.ts의 toDateString을 Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' })로 통일
- **네비게이션 통일** — Header에 오답노트/통계 추가, "플래시카드"→"카드"
- **오답 자동 복습 혼합** — buildSessionWithReview (10문제 중 오답 3문제 자동 삽입)

### 신규/수정 파일
| 파일 | 작업 |
|------|------|
| `src/app/stats/WrongNoteSummary.tsx` | 신규 |
| `src/app/stats/WeeklySummary.tsx` | 신규 |
| `src/lib/xp-constants.ts` | 신규 |
| `src/components/chapter/BookmarkButton.tsx` | 신규 |
| `src/app/stats/StatsClient.tsx` | 수정 (새 컴포넌트 연결) |
| `src/app/stats/WeakAreas.tsx` | 수정 (챕터 드릴다운) |
| `src/lib/stats-utils.ts` | 수정 (WrongNote/Weekly 유틸) |
| `src/stores/useStudyStore.ts` | 수정 (xp-constants import) |
| `src/app/wrong-notes/quiz/page.tsx` | 수정 (결과 기록 누락 수정) |
| `src/app/quiz/[subject]/QuizClient.tsx` | 수정 (buildSessionWithReview) |
| `src/app/subjects/[slug]/[chapter]/page.tsx` | 수정 (BookmarkButton 추가) |
| `src/components/layout/Header.tsx` | 수정 (네비게이션 통일) |
| `src/app/wrong-notes/WrongNoteCard.tsx` | 수정 (챕터 보기 링크) |

### 영향 범위
- 강선생: UI 전반 (통계, 퀴즈, 챕터)
- 클루디: 없음 (DB 무관, 클라이언트 상태만 변경)

### 상태
- [x] 구현 완료
- [x] 빌드 성공
- [x] 커밋 & 푸시 완료

---

## [2026-03-11] 강선생 — UI 재설계 Phase 1 기반 작업

### 변경 내용
- 컬러 시스템 변경 (globals.css)
- BottomTabBar 컴포넌트 추가
- Header 리뉴얼
- Layout 모바일 대응

### 영향 범위
- 강선생: UI 전반
- 클루디: 없음 (DB 무관)

### 상태
- [x] 구현 완료
- [ ] 커밋 필요
