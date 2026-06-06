# M5.1: 내부 품질 강화 — 안정성·품질·연계성

> 작성: 2026-06-01 | 담당: X | 상태: Phase 1-2 완료 (2026-06-06), Phase 3 대기
> 배경: M5(구조 재구성) 폐기. SEW Next 프로토타입 삭제 완료. 기존 48개 라우트 구조 유지하면서 내부 품질에 집중.

## 진단 요약

| 축 | 현황 | 핵심 문제 |
|---|------|----------|
| **안정성** | CRITICAL 5건 | sync 레이어 `as any` 12개, 경쟁 조건, Promise.all 전체 실패 |
| **품질** | 검증 부재 | PATCH 무검증, bulk import 무검증, 서버 품질 메트릭 없음 |
| **연계성** | 끊긴 여정 | 개념→퀴즈 없음, 완료 화면 막다른길, 약점→개념 없음 |

## Phase 1: Stability Shield (3일)

**목표**: CRITICAL/HIGH 안정성 이슈 수정. 사용자 데이터 보호. API 검증 강화.

- [x] 1-1. sync 레이어 Zod 스키마 도입 — `as any` 12개 → 0개, 6개 스토어 스키마 검증
- [x] 1-2. safeJsonParse 유틸 — 3곳 적용 (나머지는 이미 try-catch 보호)
- [x] 1-3. SyncManager 경쟁 조건 수정 — syncPromise 뮤텍스, Promise.allSettled
- [x] 1-4. visibilitychange flush — 탭 닫기 시 pending push 즉시 전송
- [x] 1-5. API 라우트 Zod 검증 — PATCH quiz (strict), bulk import (항목별 검증)
- [x] 1-6. API 라우트 테스트 확장 — 3/22 → 9/22 (41%), 989→1051 테스트
- [x] 1-7. vitest coverage threshold 추가 (v8, statements 20%)

## Phase 2: Quiz Quality Gate (2일)

**목표**: 서버사이드 퀴즈 품질 검증 파이프라인. 중복 감지. 품질 메트릭 API.

- [x] 2-1. quiz-quality.ts 품질 규칙 엔진 — OX 답 검증, 옵션 4개, explanation 경고, subject/type 검증
- [x] 2-2. duplicate-detector.ts — Jaccard 유사도 기반 한국어 중복 감지 (tokenize + threshold 0.85)
- [x] 2-3. GET /api/admin/quiz/quality — 품질 메트릭 API (byType, bySubject, qualityIssues, duplicates 옵션)
- [x] 2-4. bulk import 품질 체크 통합 — 에러 항목 거부 + warnings 배열 반환

## Phase 3: Feature Bridges (3일)

**목표**: 끊어진 사용자 여정 연결. 새 페이지 없음. 기존 컴포넌트에 링크·넛지만 추가.

- [ ] 3-1. 개념→퀴즈 브릿지 — concepts/[subject]/[slug] 페이지에 "이 개념 퀴즈로 확인" CTA
- [ ] 3-2. 완료 화면 넛지 — QuizResultScreen, CompletionScreen, ExamResultScreen에 NextStepNudge
- [ ] 3-3. 약점→개념 링크 — WeaknessInsight, WeakAreas에 "개념 복습" 버튼
- [ ] 3-4. 대시보드 SRS 알림 — DailyReviewCard 홈 노출 확인
- [ ] 3-5. 북마크 서피싱 — 추천 시스템에 "북마크 복습" 항목 추가

## Completion Contract

V(평가자)가 80% 이상 통과해야 PASS. 총 22개 기준.

### 안정성 기준 (8/8)
- [ ] sync.ts, SyncManager.tsx에 `as any` 0개
- [ ] syncAllStores에 Zod 스키마 검증 — 손상 데이터 거부, 크래시 없음
- [ ] Promise.allSettled — 1개 스토어 실패해도 나머지 5개 정상 hydration
- [ ] syncOnLogin 동시 호출 중복 방지 (뮤텍스)
- [ ] PATCH /api/admin/quiz/[id]가 유효하지 않은 입력을 400으로 거부
- [ ] POST /api/admin/quiz/bulk가 필드 누락 항목별 에러 반환
- [ ] API 라우트 테스트 파일 9개 이상 (기존 3개)
- [ ] 989+ 기존 테스트 전체 통과

### 품질 기준 (7/7)
- [ ] validateQuizQuality가 OX 문제의 잘못된 답을 거부
- [ ] validateQuizQuality가 설명 누락 시 경고
- [ ] findDuplicates가 85%+ 유사 한국어 문제 감지
- [ ] findDuplicates가 서로 다른 문제에 빈 배열 반환
- [ ] GET /api/admin/quiz/quality가 품질 메트릭 반환
- [ ] POST /api/admin/quiz/bulk가 유효하지 않은 항목 warnings 배열 반환
- [ ] 기존 테스트 전체 통과

### 연계성 기준 (7/7)
- [ ] 개념 페이지에 퀴즈 CTA가 스크롤 없이 보임
- [ ] QuizResultScreen에 오답 > 0일 때 오답노트 링크 표시
- [ ] CompletionScreen에 점수 < 60%일 때 개념 링크 표시
- [ ] WeaknessInsight에 약점 과목별 "개념 복습" 링크
- [ ] 홈 대시보드에 복습 카드 수 > 0일 때 DailyReviewCard 표시
- [ ] 북마크 > 0일 때 추천 목록에 "북마크 복습" 항목
- [ ] 기존 테스트 전체 통과

**총 22개 기준, 18개(80%) 이상 통과해야 PASS.**

---

## 이전 계획

### M5: 서비스 구조 재구성 — SEW Cockpit (2026-05-28)
> 담당: X | 상태: 폐기 (2026-06-01). SEW Next 실패 결론, 구조 재구성 방향 철회. Phase 1 nav 변경 실행 후 revert. Next 프로토타입 4562줄 삭제 완료.

### M4: 콘텐츠의 숨결 (2026-05-06)
> 담당: X | 상태: Phase 0-1 완료, Phase 2 미실행 (M5로 우선순위 변경) | 9/13 task (69%)

### M3: 학습 경험 재설계 (2026-04-22)
> 담당: X | 상태: M3 전체 완료 (2026-04-29) | 18/18 task, CC 20/20 PASS 100%

### M2: 만족도 끌어올리기 (2026-04-06)
> 담당: X | 상태: M2 전체 완료 (2026-04-20) | 43/43 task, V 검증 PASS 100%

### 플래시카드 전면 재설계 (2026-03-31)
> 담당: X | 상태: Phase 0~5 전체 완료 (2026-04-01)

### M3: 만족도 갭 해소 (2026-03-30)
> 담당: X | 상태: B1~B7 전체 완료

### 나다운 MVP (2026-03-27~29)
> 담당: X | 상태: Phase 0~5 + AI 전체 완료 (MVP 100%)
