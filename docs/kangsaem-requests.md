# 강선생 → 클루디 요청 목록

> 강선생이 클루디에게 필요한 데이터/인프라 작업을 기록
> 클루디는 완료 시 상태를 업데이트하고 changelog.md에 기록
> **참조**: contract.md v2.0 (2026-03-11)

## 작성 규칙

```
### REQ-{번호}: 요청 제목
- **요청일**: YYYY-MM-DD
- **우선순위**: P0(즉시) / P1(이번 주) / P2(다음 Phase)
- **상태**: 대기 / 진행중 / 완료 / 보류
- **상세**: 구체적으로 필요한 것
- **완료 기준**: 어떻게 되면 완료인지
```

---

## 긴급 (그린 검증 결과 반영)

### REQ-004: 세분화 챕터 추가 (4개 신규 과목)

- **요청일**: 2026-03-11
- **우선순위**: P0
- **상태**: 완료 (2026-03-25, 클루디 29f170e — 챕터 참조 2593건 수정, 0 broken)
- **상세**: 그린(data-validator) 검증 결과, 4개 과목의 퀴즈가 존재하지 않는 챕터를 참조하고 있음 (29건 에러). contract.md v2의 "세분화 챕터" 섹션에 정의된 챕터들을 chapters 테이블에 추가할 것.
- **추가할 챕터**:
  - visual-impairment: braille, orientation-mobility, visual-acuity, visual-training, assistive-tech
  - hearing-impairment: audiogram, cochlear-implant, hearing-aid, sign-language, classroom
  - physical-disability: cp-types, gmfcs, primitive-reflexes, positioning, muscular-dystrophy
  - communication-disorder: articulation, aac, spontaneous-speech, emt, fluency
- **완료 기준**: 그린 실행 시 챕터 참조 에러 0건

### REQ-005: 퀴즈 ID 접두사 통일

- **요청일**: 2026-03-11
- **우선순위**: P0
- **상태**: 완료 (2026-03-25, 클루디 29f170e — emotional-behavioral 33건 재배치)
- **상세**: 그린 검증 결과, 같은 과목 내에서 두 가지 접두사가 혼재 (e.g. `bs-q1`~`bs-q10` vs `behav-q11`~`behav-q30`). contract.md v2의 ID 규칙에 따라 하나로 통일.
- **통일 기준**:
  - `behav-q*` → `bs-q*`
  - `curr-q*` → `cur-q*`
  - `incl-q*` → `inc-q*`
  - `assess-q*` → `asmnt-q*`
- **완료 기준**: 모든 퀴즈 ID가 한 과목당 하나의 접두사만 사용

### REQ-006: 4개 과목 워크시트 데이터 생성

- **요청일**: 2026-03-11
- **우선순위**: P1
- **상태**: 완료 (2026-03-25, 클루디 5826eb1 — VI/HI/PD/CD 12토픽 60문항)
- **상세**: 시각/청각/지체/의사소통장애 4개 과목에 worksheet_topics + worksheet_questions가 없음. 최소 토픽 3개 + 문제 15개씩 생성.
- **완료 기준**: 4개 과목 각각 토픽 3개 이상, 문제 15개 이상

---

## 기존 요청

### REQ-001: Supabase FK 제약 추가

- **요청일**: 2026-03-11
- **우선순위**: P0 (v2에서 승격)
- **상태**: 완료 (2026-03-25, 클루디 — SQL 작성 완료, 카이란 Supabase 실행 필요)
- **상세**: contract.md v2 "FK 제약" 섹션의 5개 FK를 DB에 설정. ON DELETE CASCADE.
- **완료 기준**: FK 설정 후 잘못된 참조 INSERT 시 DB 에러 발생
- **선행 조건**: REQ-004 (세분화 챕터 추가) 완료 후 실행. 현재 깨진 참조가 있어 FK 설정하면 실패함.

### REQ-002: 마이그레이션 스크립트 키 제거

- **요청일**: 2026-03-11
- **우선순위**: P0
- **상태**: 완료 (2026-03-25, 클루디 29f170e — process.env 전환)
- **상세**: `scripts/migrate-to-supabase.ts`에 anon key 하드코딩. `.env.local` 사용으로 전환.
- **완료 기준**: 스크립트가 환경변수에서 키를 읽어 실행됨

### REQ-003: cloudy-issues 퀴즈 데이터 추가 (Issue #1, #2)

- **요청일**: 2026-03-11
- **우선순위**: P0
- **상태**: 대기
- **상세**: `docs/cloudy-issues-for-kangsaem.md`의 Issue #1 + #2 해결.
- **완료 기준**: 시각/청각/지체/의사소통 퀴즈 최소 18문제 + introduction 20문제

### REQ-007: quiz_questions 테이블에 시나리오형 컬럼 추가

- **요청일**: 2026-03-14
- **우선순위**: P1
- **상태**: 완료 (2026-04-02, contract.md v2.13 — 카이란 Supabase SQL 실행 필요)
- **상세**: Issue #3 (KICE 실전형 퀴즈 포맷) UI 구현 완료. DB에 다음 컬럼 추가 필요:
  - `sub_questions JSONB DEFAULT NULL` — 하위 질문 배열 `[{id, question, type, answer, explanation?}]`
  - `image_url TEXT DEFAULT NULL` — 도표/그래프 이미지 URL
  - `type` 컬럼의 허용값에 `scenario_composite` 추가 (CHECK 제약이 있다면)
- **완료 기준**: `type='scenario_composite'`인 퀴즈를 `sub_questions`와 함께 INSERT 가능

### REQ-008: quiz_questions 테이블에 복합영역 태그 컬럼 추가

- **요청일**: 2026-03-14
- **우선순위**: P2
- **상태**: 완료 (2026-04-02, contract.md v2.13 — 카이란 Supabase SQL 실행 필요)
- **상세**: Issue #6 (복합영역 태그 시스템) UI/쿼리 구현 완료. DB에 다음 컬럼 추가 필요:
  - `subjects TEXT[] DEFAULT NULL` — 복합영역 다중 태그 배열 (기존 subject는 주 영역으로 유지)
  - getQuizzesBySubject가 `subjects.cs.{slug}` 조건으로도 검색하므로, 컬럼이 있어야 쿼리 동작
  - 기존 난이도 3 퀴즈에 대해 복합 태그 매핑 권장 (예: curriculum 문제에 `["inclusive","assessment"]` 추가)
- **완료 기준**: `subjects` 컬럼 추가 + 최소 5문제에 다중 태그 설정

---

## 실행 순서 권장

```
REQ-004 (세분화 챕터) → REQ-005 (ID 통일) → REQ-001 (FK 설정)
→ REQ-003 (퀴즈 추가) → REQ-006 (워크시트 생성) → REQ-002 (키 제거)
→ data-validator 전체 검증
```
