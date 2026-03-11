# Interface Contract

> 강선생(UI)과 클루디(데이터)의 인터페이스 계약서
> 최종 수정: 2026-03-11 | 버전: 2.0
> v2: 그린 검증 결과 반영, 이상적 구조 재설계

## 변경 프로토콜

**이 문서는 진실의 원천(Single Source of Truth)입니다.**

1. 스키마나 API를 바꾸고 싶은 쪽이 이 문서를 **먼저** 수정 제안
2. 카이란(오너) 승인
3. 승인 후 구현 + `docs/changelog.md`에 기록
4. 상대 세션에 변경 사실 전달

**절대 하면 안 되는 것:**
- contract.md 수정 없이 테이블 컬럼 추가/삭제/이름 변경
- contract.md 수정 없이 db.ts 함수 시그니처 변경
- RLS 정책을 무단 변경

---

## Supabase 테이블 스키마

### subjects

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| slug | text | **PK** | 과목 식별자 (e.g. `introduction`) |
| title | text | NOT NULL | 과목명 |
| description | text | NOT NULL | 과목 설명 |
| icon | text | NOT NULL | lucide 아이콘명 |
| color | text | NOT NULL | Tailwind bg 클래스 |
| sort_order | integer | NOT NULL | 정렬 순서 |

- RLS: 읽기 공개, 쓰기 제한
- 11개 과목

### chapters

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | serial | **PK** | 자동 증가 ID |
| subject_slug | text | NOT NULL, **FK → subjects.slug** | 소속 과목 |
| slug | text | NOT NULL | 챕터 식별자 |
| title | text | NOT NULL | 챕터명 |
| description | text | NOT NULL | 챕터 설명 |
| keywords | text[] | DEFAULT '{}' | 검색 키워드 |
| sort_order | integer | NOT NULL | 과목 내 정렬 순서 |

- RLS: 읽기 공개, 쓰기 제한
- **UNIQUE(subject_slug, slug)** — 같은 과목 내 slug 중복 불가
- **v2 변경**: 4개 신규 과목(시각/청각/지체/의사소통)에 세분화 챕터 추가 필요

#### 세분화 챕터 (클루디 추가 필요)

```
visual-impairment:
  - braille (점자 규정)
  - orientation-mobility (보행 훈련)
  - visual-acuity (시력 측정)
  - visual-training (시기능 훈련)
  - assistive-tech (보조공학)

hearing-impairment:
  - audiogram (청력도 해석)
  - cochlear-implant (인공와우)
  - hearing-aid (보청기)
  - sign-language (수어/지문자)
  - classroom (교실 환경)

physical-disability:
  - cp-types (뇌성마비 유형)
  - gmfcs (GMFCS 분류)
  - primitive-reflexes (원시반사)
  - positioning (자세보조/보조기기)
  - muscular-dystrophy (근이영양증)

communication-disorder:
  - articulation (조음음운)
  - aac (AAC/보완대체의사소통)
  - spontaneous-speech (자발화 분석)
  - emt (환경중심 언어중재)
  - fluency (유창성 장애)
```

### quiz_questions

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | text | **PK** | 퀴즈 ID |
| subject | text | NOT NULL, **FK → subjects.slug** | 과목 slug |
| chapter | text | NOT NULL | 챕터 slug (chapters.slug 참조) |
| type | text | NOT NULL | `multiple` \| `ox` \| `fill_in` \| `descriptive` |
| question | text | NOT NULL | 문제 본문 |
| case_context | text | NULL | 사례 지문 |
| options | text[] | NULL | 객관식 선택지 (multiple: 정확히 4개) |
| answer | text | NOT NULL | 정답 |
| explanation | text | NOT NULL | 해설 |
| wrong_explanations | jsonb | NULL | 오답별 해설 `{"0": "...", "2": "..."}` |
| difficulty | integer | NOT NULL | 1(기초) / 2(중급) / 3(심화) |
| source | text | NULL | 출처 |
| tags | jsonb | NULL | `{disability?, year?, round?}` |

- RLS: 읽기 공개, 쓰기 제한

#### ID 규칙 (v2 — 현실 반영)

기존 데이터의 약식 접두사를 표준으로 채택. 330개 ID를 리네임하는 것은 리스크 대비 이득이 없음.

| 과목 | 접두사 | 예시 |
|------|--------|------|
| introduction | `intro-` | `intro-q1` |
| behavior-support | `bs-` | `bs-q1` |
| curriculum | `cur-` | `cur-q1` |
| inclusive-education | `inc-` | `inc-q1` |
| assessment | `asmnt-` | `asmnt-q1` |
| transition | `trans-` | `trans-q1` |
| laws | `laws-` | `laws-q1` |
| visual-impairment | `vi-` | `vi-q1` |
| hearing-impairment | `hi-` | `hi-q1` |
| physical-disability | `pd-` | `pd-q1` |
| communication-disorder | `cd-` | `cd-q1` |

**패턴**: `{prefix}q{n}` (n은 1부터 순차)

**v2 정리 필요**: 일부 과목에서 q11~q30이 다른 접두사 사용 (e.g. `behav-q11`, `curr-q11`). 클루디가 통일할 것.

### worksheet_topics

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | text | **PK** | 토픽 ID |
| subject | text | NOT NULL, **FK → subjects.slug** | 과목 slug |
| name | text | NOT NULL | 토픽명 |

- ID 패턴: `{prefix}topic-{n}` (접두사는 quiz와 동일)

### worksheet_questions

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | text | **PK** | 문제 ID |
| topic_id | text | NOT NULL, **FK → worksheet_topics.id** | 소속 토픽 |
| subject | text | NOT NULL, **FK → subjects.slug** | 과목 slug |
| type | text | NOT NULL | `fill_in` \| `descriptive` |
| difficulty | integer | NOT NULL | 1 / 2 / 3 |
| question | text | NOT NULL | 문제 본문 |
| answer | text | NOT NULL | 정답 |
| explanation | text | NOT NULL | 해설 |
| source | text | NULL | 출처 |
| tags | text[] | DEFAULT '{}' | 태그 |

### reviews

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | serial | **PK** | 자동 증가 ID |
| path | text | UNIQUE, NOT NULL | 리뷰 대상 경로 |
| content | text | NOT NULL | 리뷰 내용 |
| updated_at | timestamptz | DEFAULT now() | 수정 시간 |

- RLS: 읽기/쓰기 모두 공개

---

## API 레이어 (src/lib/db.ts)

> 강선생이 관리. 클루디는 이 파일을 직접 수정하지 않음.

### 함수 시그니처

```typescript
// 과목
getSubjects(): Promise<Subject[]>
getSubjectBySlug(slug: string): Promise<Subject | null>

// 퀴즈
getQuizzesBySubject(subjectSlug: string): Promise<QuizQuestion[]>
getQuizzesByChapter(subjectSlug: string, chapterSlug: string): Promise<QuizQuestion[]>
getAllQuizzes(): Promise<QuizQuestion[]>
getQuizCount(): Promise<Record<string, number>>
searchQuizzes(query: string): Promise<QuizQuestion[]>

// 워크시트
getWorksheetsBySubject(subject: string): Promise<WorksheetQuestionRow[]>
getWorksheetsByTopic(subject: string, topicId: string): Promise<WorksheetQuestionRow[]>
getWorksheetTopics(subject: string): Promise<WorksheetTopicRow[]>
getAllWorksheetTopics(): Promise<WorksheetTopicRow[]>

// 리뷰
getReviews(): Promise<ReviewRow[]>
saveReview(path: string, content: string): Promise<boolean>
```

### 타입 매핑 규칙

| DB 컬럼명 (snake_case) | TS 필드명 (camelCase) | 매핑 위치 |
|------------------------|----------------------|----------|
| sort_order | order | db.ts (getSubjects) |
| case_context | caseContext | db.ts (mapQuizRow) |
| wrong_explanations | wrongExplanations | db.ts (mapQuizRow) |
| subject_slug | (chapters 조인 시 사용) | db.ts (getSubjects) |
| topic_id | topicId | db.ts (mapWorksheetRow) |

---

## 데이터 정합성 규칙

### FK 제약 (DB 레벨 — 클루디 설정)

1. `chapters.subject_slug` → `subjects.slug` ON DELETE CASCADE
2. `quiz_questions.subject` → `subjects.slug` ON DELETE CASCADE
3. `worksheet_topics.subject` → `subjects.slug` ON DELETE CASCADE
4. `worksheet_questions.topic_id` → `worksheet_topics.id` ON DELETE CASCADE
5. `worksheet_questions.subject` → `subjects.slug` ON DELETE CASCADE

### 값 제약

- `type` (quiz): `multiple`, `ox`, `fill_in`, `descriptive`
- `type` (worksheet): `fill_in`, `descriptive`
- `difficulty`: 정수 1, 2, 3
- `answer` (multiple): `"0"` ~ `"3"` 문자열
- `answer` (ox): `"O"` 또는 `"X"`
- `options` (multiple): 정확히 4개 문자열 배열

---

## 역할 분담

| 영역 | 담당 | 상대가 하면 안 되는 것 |
|------|------|---------------------|
| Supabase 테이블 구조 | 클루디 (+ 카이란 승인) | 강선생이 직접 ALTER TABLE |
| RLS 정책 | 클루디 | 강선생이 RLS 변경 |
| 데이터 삽입/수정 | 클루디 | 강선생이 직접 INSERT/UPDATE |
| src/lib/db.ts | 강선생 | 클루디가 db.ts 수정 |
| src/types/*.ts | 강선생 | 클루디가 타입 수정 |
| UI 컴포넌트 | 강선생 | 클루디가 src/components 수정 |
| 콘텐츠 리서치 | 클루디 | 강선생이 KICE 분석 |
| 마이그레이션 스크립트 | 클루디 | 강선생이 scripts/ 수정 |
| data-validator 실행 | 클루디 (데이터 변경 후) | — |

---

## 클루디 작업 목록 (v2 기준)

> 아래 작업은 kangsaem-requests.md에도 등록됨

1. **FK 제약 설정** — 위 5개 FK 관계를 DB에 적용
2. **세분화 챕터 추가** — 4개 신규 과목에 챕터 데이터 삽입
3. **퀴즈 ID 접두사 통일** — `behav-q*` → `bs-q*`, `curr-q*` → `cur-q*` 등
4. **깨진 챕터 참조 수정** — 세분화 챕터 추가 후 자동 해결
5. **4개 과목 워크시트 데이터 생성** — 시각/청각/지체/의사소통
6. **마이그레이션 스크립트 키 제거** — .env.local 사용으로 전환
7. **data-validator 실행** — 모든 작업 완료 후 검증
