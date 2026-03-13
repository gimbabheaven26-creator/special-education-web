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
