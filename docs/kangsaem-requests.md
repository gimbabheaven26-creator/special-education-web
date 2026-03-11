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
- **상태**: 대기
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
- **상태**: 대기
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
- **상태**: 대기
- **상세**: 시각/청각/지체/의사소통장애 4개 과목에 worksheet_topics + worksheet_questions가 없음. 최소 토픽 3개 + 문제 15개씩 생성.
- **완료 기준**: 4개 과목 각각 토픽 3개 이상, 문제 15개 이상

---

## 기존 요청

### REQ-001: Supabase FK 제약 추가

- **요청일**: 2026-03-11
- **우선순위**: P0 (v2에서 승격)
- **상태**: 대기
- **상세**: contract.md v2 "FK 제약" 섹션의 5개 FK를 DB에 설정. ON DELETE CASCADE.
- **완료 기준**: FK 설정 후 잘못된 참조 INSERT 시 DB 에러 발생
- **선행 조건**: REQ-004 (세분화 챕터 추가) 완료 후 실행. 현재 깨진 참조가 있어 FK 설정하면 실패함.

### REQ-002: 마이그레이션 스크립트 키 제거

- **요청일**: 2026-03-11
- **우선순위**: P0
- **상태**: 대기
- **상세**: `scripts/migrate-to-supabase.ts`에 anon key 하드코딩. `.env.local` 사용으로 전환.
- **완료 기준**: 스크립트가 환경변수에서 키를 읽어 실행됨

### REQ-003: cloudy-issues 퀴즈 데이터 추가 (Issue #1, #2)

- **요청일**: 2026-03-11
- **우선순위**: P0
- **상태**: 대기
- **상세**: `docs/cloudy-issues-for-kangsaem.md`의 Issue #1 + #2 해결.
- **완료 기준**: 시각/청각/지체/의사소통 퀴즈 최소 18문제 + introduction 20문제

---

## 실행 순서 권장

```
REQ-004 (세분화 챕터) → REQ-005 (ID 통일) → REQ-001 (FK 설정)
→ REQ-003 (퀴즈 추가) → REQ-006 (워크시트 생성) → REQ-002 (키 제거)
→ data-validator 전체 검증
```
