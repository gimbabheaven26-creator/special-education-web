# SEW 사용자 체감 개선 — M2 사용자 만족도

> 작성: 2026-03-29 | 담당: X | 상태: 전체 완료 (Phase 1~5 100%, 정교화 질문만 카이란 결정 대기)
> 배경: 1주간 인프라 작업 후 전략 전환. 사용자가 체감 가능한 변화에만 집중.
> 참고: docs/page-map-for-review.md (30+ 라우트 현황)

## 요구사항

카이란(사용자)이 사이트를 직접 사용하면서 느끼는 만족도를 높인다.
작업 방식: **카이란 리뷰 → 피드백 → X 수정 → 재리뷰** 무한 루프.
인프라/테스트/리팩토링 제안 금지. 사용자가 느끼는 변화만.

### 현재 만족도 (2026-03-29 카이란 자가평가)

| 영역 | 만족도 | 목표 |
|------|--------|------|
| 진단평가 | 50% | 70%+ |
| 실력쌓기 | <20% | 50%+ |
| 내기록 | <20% | 50%+ |
| 함께하기 | <20% | 50%+ |

### 카이란이 지적한 문제 카테고리
1. 구현 안 된 기능이 너무 많음
2. 기능 범위를 구체적으로 설정하거나 합칠 것이 많음
3. 페이지 로딩이나 링크 오류가 많음

## Phase 1: 즉시 수정 — 깨진 것 고치기

> 카이란 리뷰 전에 확실한 버그/오류부터 제거. X가 자체 판단으로 실행.

- [x] `/bookmarks` 퀴즈 링크 버그 수정 (5e7be66)
- [x] `/quiz/short` loading.tsx + error.tsx 추가 (5e7be66)
- [x] `/concepts`, `/flashcards` error.tsx 추가 (f88e8b5)
- [x] 빌드 깨짐 복구 — lib 모듈 이동 후 재수출 6개 (f88e8b5, 47acf8f)
- [x] `/flashcards` 빈 상태 — 0카드 vs 복습완료 분기 UI (54ba9b0)
- [x] `/interactive` description 추가 — nav-config + practice-hub 동기화 (5609067)
- [x] 홈 DailyReviewCard / AiBriefingCard — 신규 사용자 시 온보딩 안내 카드 표시 (d8220be)

## Phase 2: 실력쌓기 체감 개선 (현재 <20% → 50%+)

> 카이란 리뷰 기반. 피드백 오면 이 Phase 항목을 구체화.

- [x] `/practice-hub` 허브 페이지 재설계 — 4카드 2x2 그리드 + 시나리오 추가 (5609067)
- [x] `/interactive` 콘텐츠 대폭 확장 — 3→9 활동 (검사도구·법령3조·교수적수정·UDL·PBS·전환교육) (5609067)
- [x] `/concepts` 학습 완료 추적 기능 — CompletionBadge + SubjectProgress 표시 (e3846d3)
- [x] `/worksheets` ��근성 개선 — 사용 안내 카드 + 총 문제수 표시 (045a719)
- [x] `/daily` 완료 후 피드백/요약 화면 개선 — DAILY_TIERS 감성 피드백 + 복습추천챕터 (d8220be)
- [x] `/scenarios` "실력쌓기" 탭으로 이동 완료 (5609067)

## Phase 3: 내기록 체감 개선 (현재 <20% → 50%+)

> 카이란 리뷰 기반. 피드백 오면 이 Phase 항목을 구체화.

- [x] `/my` 마이페이지 — 8개 카드 전부 실동작 확인, concepts 설명 수정 (cc64fa6)
- [x] `/stats` — EmptyState + CTA 구현 완료 (이전 세션)
- [x] `/wrong-notes` — SRS Leitner 박스 시각화 + 감성 피드백 + 탭 접근성 (e1ca90f)
- [x] `/bookmarks` — 각 카드에 과목별 퀴즈 직링크 버튼 추가 (541544d)
- [x] `/bookmarks/quiz` — 북마크 챕터 전용 퀴즈 라우트 신설 (dbdced6)
- [x] `/mastery` — EmptyState + 퀴즈 시작 CTA 구현 완료 (이전 세션)
- [x] `/flashcards` — 0카드 vs 복습완료 분기 + 추가 유도 CTA (54ba9b0)

## Phase 4: 함께하기 체감 개선 (현재 <20% → 50%+)

> 카이란 리뷰 기반. 피드백 오면 이 Phase 항목을 구체화.

- [x] 네비 재구성 — `/scenarios`→실력쌓기, `/reviews`→네비 제거 (5609067)
- [x] `/community` — EmptyState + "문제 만들기" CTA 확인 완료
- [x] `/community/create` — 4단계 위자드 UX 확인 완료 (과목→문제→정답→미리보기)
- [x] 함께하기 탭 정체성 재정의 — 커뮤니티 단독 탭으로 정리 (5609067)

## Phase 5: 진단평가 체감 개선 (현재 50% → 70%+)

> 가장 만족도 높은 영역. 피드백 기반 미세 조정.

- [x] `/quiz/[subject]` 정교화 질문 삭제 — 카이란 결정: "정답 맞췄으면 추가 액션 요구하지마. 틀린 문제만 다룰 것"
- [x] `/terms` — 10자 미만 필터 안내 텍스트 추가 (e4422c6)
- [x] `/kice` — 4→2탭 간소화(기출문제·출제분석) + 접근성(tablist/aria) + 색상 범례 (e4422c6, 27c9002)
- [x] 퀴즈 결과 화면 감성 개선 — SCORE_TIERS 이모지 + 색상 카드 (92e3571)
- [x] Confidence/확신도 기능 완전 제거 — 14파일 정리 (1c8a93f)
- [x] 정교화 질문 삭제 + kice 데드코드 정리 (b768112)
- [x] 네비 1클릭 직행 — 모든 NavGroup에 hub href 설정 (27c9002)
- [x] 북마크 안내 문구 추가 — "시험 전 복습 핵심 골라두기" 가이드 (27c9002)
- [x] concepts 과목 페이지 SSG 오류 해결 — buttonVariants() 제거 (1418463)

## 리스크

| 리스크 | 심각도 | 대응 |
|--------|--------|------|
| 카이란 피드백 없으면 방향 못 잡음 | HIGH | Phase 1은 X 자체 판단으로 실행, Phase 2~5는 피드백 필수 |
| 콘텐츠 부족 (interactive, scenarios) | HIGH | 하드코딩 데이터 확장은 X가 가능, 도메인 정확도는 카이란 검증 |
| 기능 범위 합의 안 됨 | MEDIUM | 각 Phase에서 카이란과 1:1 합의 후 구현 |
| 나다운과 작업 병행 | LOW | 나다운은 MVP 완료, SEW에 집중 가능 |

## Completion Contract

V(평가자)가 이 기준으로 PASS/FAIL을 판정한다. 80% 이상 통과해야 PASS.

### 기능 기준
- [x] 실력쌓기 3개 서브페이지 접근 시 즉시 학습 시작 가능 — practice-hub 4카드, concepts/worksheets/interactive/scenarios 각각 콘텐츠 존재
- [x] 내기록에서 학습 이력이 시각적으로 보임 (0건이어도 안내) — /my 8카드 + stats/wrong-notes/bookmarks/flashcards/mastery 전부 EmptyState
- [x] 함께하기에서 문제 만들기 → 목록 확인 플로우 완료 — /community + /community/create 4단계 위자드
- [x] 모든 하단 탭 서브메뉴 클릭 시 404/에러 없음 — Phase 1에서 전수 검증, error.tsx 13개

### UX 기준
- [x] 모든 페이지 첫 로딩 시 스켈레톤 표시 (빈 화면 없음) — loading.tsx 41개 확인
- [x] 데이터 0건인 페이지에서 격려 메시지 + CTA 버튼 존재 — EmptyState 14페이지 적용
- [x] 퀴즈 완료 후 결과 화면에 감성적 피드백 (점수별 차별화) — SCORE_TIERS 이모지 + 색상 카드 (92e3571)
- [x] 페이지 간 이동 시 깨진 링크 0건 — Phase 1 버그 수정 + 전체 nav-config 검증

### 만족도 기준 (2026-03-29 카이란 자가평가)
- [ ] 카이란 자가평가: 실력쌓기 50%+ → **현재 30%** (미달)
- [ ] 카이란 자가평가: 내기록 50%+ → **현재 20%** (미달)
- [ ] 카이란 자가평가: 함께하기 50%+ → **현재 5%** (미달)
- [ ] 카이란 자가평가: 진단평가 70%+ → **현재 30%** (미달)

---

## 이전 계획

### 나다운 (nadaun) MVP (2026-03-27~29)
> 담당: X | 상태: Phase 0~5 + AI 전체 완료 (MVP 100%)
> Phase 0~5: 프로젝트 셋업, DB, 학생 CRUD, AI 계획 생성, 편집, 내보내기
> 설계 문서: docs/superpowers/specs/2026-03-26-nadaun-design.md

### 프라임 M1: 노션 구조변경 (2026-03-25)
> 담당: 프라임 | 상태: 실행 완료

### 클루디 작업 7건 (2026-03-25)
> 담당: X(데이터 모드) | 상태: 구현 완료, 카이란 실행 대기 4건
> FK 제약, 세분화 챕터, 퀴즈 ID 통일, 워크시트 데이터 등
>
> 완료: 챕터 참조 수정(2593건), emotional-behavioral 재배치(33건), 하드코딩 키 제거, 검증 0 violations
> 카이란 실행 대기:
> 1. `add-fk-constraints.sql` Supabase SQL Editor 실행
> 2. `insert-worksheet-vi-hi-pd-cd.mjs` 워크시트 삽입
> 3. `fix-options-5to4.mjs` 선택지 5→4 통일 (34건)
> 4. `cleanup-emotional-behavioral.mjs` 빈 과목 삭제

### API 보안 강화 (2026-03-24)
> 담당: X | 상태: 일부 완료
> rate limit, reviews auth 적용. analytics 마이그레이션 미완.
