# 클루디 지시서
작성: 스미스 프라임 | 날짜: 2026-03-19 | 대상: 클루디 Opus + Sonnet

---

## ★ 세션 시작 체크리스트 (반드시 먼저 실행)

1. CWD: `~/` (홈 디렉토리) 확인
2. `memory/cludy.md` 읽기 → 이전 세션 미결 항목 확인
3. `memory/cloudy-session-handoff.md` 읽기 → 이어받을 내용 확인
4. 아래 순서대로 진행: **Opus Task 1 → Opus Task 2 → Sonnet**

---

## Opus Task 1 (오늘 반드시) — 개념 학습 콘텐츠 변환 [PDF → MDX]

### 배경 (왜 이 작업을 하는가)

우리 서비스에 `/concepts` 섹션을 추가할 예정이다.
카카오 개발자 docs(https://developers.kakao.com/docs) 스타일처럼 왼쪽에 과목 목차, 오른쪽에 내용이 펼쳐지는 레이아웃이다.
특수교육 수험생이 틀린 문제가 나왔을 때 해당 개념으로 바로 이동해 공부할 수 있게 하려는 목적이다.

카이란(오너)이 특수교육 교재 PDF를 제공했다.
LilysAI(노트북LM 포크 서비스)로 요약한 `.pdf.md` 파일이 함께 있다.
클루디 Opus가 이 요약본을 읽고 MDX 형식으로 변환해 `src/content/concepts/` 에 저장한다.

### 지금 상태 (반드시 확인)

**이미 완료된 것:**
```
src/content/concepts/정서행동장애/01-기초이론.mdx  ← 스미스 프라임이 샘플로 만든 파일
```
- 이 파일은 소스 MD의 **섹션 1~4** 를 커버한다 (정의, 분류, 선별, 관련요인, 개념모델)
- **절대 다시 만들지 말 것.** 이미 존재한다.

**아직 없는 것 (오늘 만들어야 함):**
```
src/content/concepts/정서행동장애/02-불안장애.mdx    ← 없음
src/content/concepts/정서행동장애/03-외상장애.mdx    ← 없음
src/content/concepts/정서행동장애/04-강박장애.mdx    ← 없음
src/content/concepts/정서행동장애/05-우울양극성.mdx  ← 없음
src/content/concepts/정서행동장애/06-품행장애.mdx    ← 없음
src/content/concepts/정서행동장애/07-인지행동중재.mdx ← 없음
src/content/concepts/정서행동장애/08-기타.mdx        ← 없음
```

### 소스 파일 (읽어야 할 파일)

```
~/Downloads/특수교육학/정서행동장애/
├── 벤티) 01.정서행동장애.pdf.md    ← 반드시 읽을 것 (주 작업 대상, LilysAI 요약본)
└── 벤티) 01.정서행동장애_quiz.md   ← 참고용 (kiceKeywords 추출 시 활용, 퀴즈로 변환하지 말 것)
```

`pdf.md`의 섹션 구조:
- 섹션 1~4: **이미 `01-기초이론.mdx`로 완료. 스킵.**
- 섹션 5 → `02-불안장애.mdx`
- 섹션 6 → `03-외상장애.mdx`
- 섹션 7 → `04-강박장애.mdx`
- 섹션 8 → `05-우울양극성.mdx`
- 섹션 9 → `06-품행장애.mdx`
- 섹션 10 → `07-인지행동중재.mdx`
- 섹션 11~12 → `08-기타.mdx`

### 형식 기준 (반드시 먼저 읽을 것)

작업 시작 전 **`src/content/concepts/정서행동장애/01-기초이론.mdx` 를 읽는다.**
이 파일이 형식, 깊이, 구조의 기준이다. 동일한 형식으로 나머지 7개 파일을 만든다.

**frontmatter 형식:**
```yaml
---
title: 정서행동장애 — [섹션명]
description: [한 줄 설명]
subject: 정서행동장애
slug: [파일명에서 숫자 제외, 예: 불안장애]
order: [숫자, 예: 2]
kiceKeywords:
  - [KICE 기출 빈도 높은 키워드]
lastUpdated: 2026-03-19
---
```

**내용 작성 규칙:**
- 진단 기준: 숫자와 기간 **반드시** 포함 (예: "6개월 이상", "5개 중 3개 이상")
- 장애 유형 여러 개면 **비교표** 필수
- KICE에 자주 나온 내용은 `⚠️ **기출 포인트**` 블록으로 강조
- mermaid 다이어그램: **삭제하고 표로 대체** (MDX에서 렌더링 불가)
- 너무 지나치게 요약하지 말 것 — 수험생이 실제로 공부할 수 있을 깊이

### 완료 기준
7개 파일 생성 완료 + `cd ~/Projects/special-education-web && npm run build` exit 0

---

## Opus Task 2 (Task 1 완료 후) — Auth 전 DB 상태 점검 + contract.md v2.7

**배경**: 4월 Auth 스프린트 전 DB 상태 확인 필요. 강선생이 구현하려면 contract.md가 확정되어야 한다.

### DB 점검

```
profiles 테이블
  - id, display_name, nickname, role 컬럼 존재?
  - RLS: 읽기 공개, 쓰기 본인만?
  - handle_new_user 트리거 동작?

user_data 테이블
  - store_key CHECK 제약 (study/leitner/quiz/bookmark)?
  - UNIQUE(user_id, store_key) 제약?

reviews 테이블
  - admin_note 컬럼 있으면 ✅, 없으면 실행:
    ALTER TABLE reviews ADD COLUMN IF NOT EXISTS admin_note text DEFAULT '';
```

### data-validator 실행

현재 퀴즈 데이터 상태 리포트 출력.

### contract.md v2.7 업데이트

`docs/contract.md` 읽기 → profiles/user_data 섹션 누락 항목 추가:
- profiles: id, display_name, nickname, role, created_at, updated_at
- user_data: id, user_id, store_key, data(jsonb), updated_at
- RLS 정책 명시

버전 v2.6 → **v2.7**, 날짜 기록.

---

## Opus 완료 메모 (작업 후 여기에 기록)

```
완료 날짜: 2026-03-19
Task 1 MDX 파일 생성: 02~08 총 7개 / 7개 ✅
  - 02-불안장애.mdx (7유형 비교표 + 중재 8가지)
  - 03-외상장애.mdx (반응성 애착장애 + PTSD 기준 A~G)
  - 04-강박장애.mdx (OCD + 신체추형장애)
  - 05-우울양극성.mdx (기초신체장애 + 양극성 I/II + 우울장애 중재)
  - 06-품행장애.mdx (ODD vs CD + 발달 경로 3가지 + 중재)
  - 07-인지행동중재.mdx (자기 교수 5단계 + REBT ABCDE)
  - 08-기타.mdx (ADHD Barkley 다면 모형 + 틱 장애 습관 반전 훈련)
npm run build: exit 0 ✅
Task 2 profiles 테이블: ✅ id, display_name, nickname, role, created_at, updated_at 확인
Task 2 user_data 테이블: ✅ id, user_id, store_key(bookmark/leitner/quiz/study), data, updated_at 확인
Task 2 reviews admin_note: ✅ 컬럼 이미 존재 (INSERT 테스트로 확인)
data-validator 결과: ⚠️ 17건 즉시 수정 필요 (answer 오류 5건, wrong_explanations 키 오류 11건, WE 정답 키 1건) / 33건 고아 chapter(낮음) / 856건 ID 명명(무시)
contract.md v2.7: ✅ reviews.admin_note 추가, 버전 2.7, 날짜 2026-03-19 기록
Sonnet 인계 가능: Y (data-validator 17건 수정은 별도 작업으로 처리 가능)
```
