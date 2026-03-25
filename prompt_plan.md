# 클루디 작업 7건 — 실행 계획

> 작성: 2026-03-25 | 담당: 클루디 | 승인: 카이란 (연속 실행 지시)
> 근거: contract.md v2 클루디 작업 목록 (#1~#7)

## 요구사항

contract.md에 정의된 클루디 담당 7건의 DB 정합성 확보 작업을 순차/병렬 실행한다.

| # | 작업 | 산출물 |
|---|------|--------|
| 1 | FK 제약 설정 (5개) | SQL 마이그레이션 스크립트 |
| 2 | 세분화 챕터 추가 (4과목 x 5챕터) | 데이터 삽입 스크립트 |
| 3 | 퀴즈 ID 접두사 통일 | 기존 unify-quiz-prefixes.mjs 활용 |
| 4 | 깨진 챕터 참조 수정 | #2 완료 후 검증 |
| 5 | 4개 과목 워크시트 데이터 생성 | JSON + 삽입 스크립트 |
| 6 | 마이그레이션 스크립트 키 제거 | 기존 스크립트 수정 |
| 7 | data-validator 실행 | 검증 로그 |

## 실행 순서 (의존성 기반)

```
Stream 1: Task 2 → Task 4 → Task 3 → Task 1 → Task 7
Stream 2: Task 6 (독립, 병렬)
Stream 3: Task 5 (Task 4 이후, 병렬)
```

- Task 2(챕터 추가)가 Task 4(참조 검증)의 선행 조건
- Task 3(ID 통일)은 FK 설정 전에 해야 PK 변경이 안전
- Task 6(키 제거)은 완전 독립

## Phase A: 데이터 정합성 복구 (Tasks 2, 4, 3)

### A-1: 세분화 챕터 추가 (Task 2)
- DB 현재 상태 조회 → 누락 챕터 upsert
- 4개 과목(시각/청각/지체/의사소통) x 5개 세분화 챕터
- 스크립트: scripts/cloudy-insert-chapters.mjs

### A-2: 깨진 챕터 참조 검증 (Task 4)
- validate-data.mjs의 check1 referentialIntegrity 확인
- 위반 0건이면 자동 해결 확인

### A-3: 퀴즈 ID 접두사 통일 (Task 3)
- 기존 scripts/unify-quiz-prefixes.mjs 실행
- behav→bs, curr→cur, incl→inc, assess→asmnt 등

## Phase B: 데이터 확장 (Task 5)
- 4개 과목 각 토픽 3개 + 문제 15개 이상
- JSON 데이터 + 삽입 스크립트

## Phase C: DB 무결성 강화 (Task 1)
- 5개 FK 제약 ALTER TABLE SQL
- Phase A 완료 후에만 실행 가능

## Phase D: 보안 정리 (Task 6)
- migrate-to-supabase.ts, insert-new-quizzes.ts 하드코딩 키 제거
- .env.local 읽기 패턴으로 전환

## Phase E: 최종 검증 (Task 7)
- validate-data.mjs 실행 → 0 violations 확인

## 리스크

| 리스크 | 영향 | 대응 |
|--------|------|------|
| FK 설정 시 기존 데이터 위반 | HIGH | Phase A 선행 완료 필수 |
| 퀴즈 ID 변경 후 localStorage 오답노트 | MEDIUM | 강선생 REQ 등록 |
| 챕터 slug 영어/한국어 혼란 | MEDIUM | DB 조회 후 실제 상태 기반 판단 |

## 변경 파일

| 파일 | 작업 |
|------|------|
| scripts/cloudy-insert-chapters.mjs | 신규 |
| scripts/add-fk-constraints.sql | 신규 |
| scripts/insert-worksheet-vi-hi-pd-cd.mjs | 신규 |
| data/worksheets/vi-hi-pd-cd-topics.json | 신규 |
| data/worksheets/vi-hi-pd-cd-questions.json | 신규 |
| scripts/migrate-to-supabase.ts | 수정 (키 제거) |
| scripts/insert-new-quizzes.ts | 수정 (키 제거) |
| docs/changelog.md | 수정 (이력) |

---

## 이전 계획

### API 보안 강화 + analytics 테이블 생성 (2026-03-24)
> 담당: X | V 검증 보고서 CRITICAL/HIGH 대응
> 상태: 일부 완료 (rate limit, reviews auth 적용됨)
> 미완: analytics_events 마이그레이션, admin role 체크
