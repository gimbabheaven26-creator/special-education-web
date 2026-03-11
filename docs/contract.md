# Interface Contract

> 강선생(UI)과 클루디(데이터)의 인터페이스 계약서
> 최종 수정: 2026-03-11 | 버전: 1.0

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
| icon | text | NOT NULL | 이모지 아이콘 |
| color | text | NOT NULL | 테마 컬러 (hex 또는 tailwind) |
| sort_order | integer | NOT NULL | 정렬 순서 |

- RLS: 읽기 공개, 쓰기 제한
- 현재 데이터: 11개 과목

### chapters

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | serial | **PK** | 자동 증가 ID |
| subject_slug | text | NOT NULL, → subjects.slug | 소속 과목 |
| slug | text | NOT NULL | 챕터 식별자 |
| title | text | NOT NULL | 챕터명 |
| description | text | NOT NULL | 챕터 설명 |
| keywords | text[] | DEFAULT '{}' | 검색 키워드 |
| sort_order | integer | NOT NULL | 과목 내 정렬 순서 |

- RLS: 읽기 공개, 쓰기 제한
- 현재 데이터: 33개 챕터
- **주의**: FK 미설정 상태 — subject_slug 정합성은 애플리케이션 레벨에서 보장

### quiz_questions

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | text | **PK** | 퀴즈 ID (e.g. `introduction-ch1-q01`) |
| subject | text | NOT NULL | 과목 slug |
| chapter | text | NOT NULL | 챕터 slug |
| type | text | NOT NULL | `multiple` \| `ox` \| `fill_in` \| `descriptive` |
| question | text | NOT NULL | 문제 본문 |
| case_context | text | NULL | 사례 지문 (선택) |
| options | text[] | NULL | 객관식 선택지 (multiple일 때 필수) |
| answer | text | NOT NULL | 정답 (객관식: "0"-"3", OX: "O"/"X") |
| explanation | text | NOT NULL | 해설 |
| wrong_explanations | jsonb | NULL | 오답별 해설 `{"0": "...", "2": "..."}` |
| difficulty | integer | NOT NULL | 1(기초) / 2(중급) / 3(심화) |
| source | text | NULL | 출처 (e.g. KICE 2024) |
| tags | jsonb | NULL | `{disability?, year?, round?}` |

- RLS: 읽기 공개, 쓰기 제한
- 현재 데이터: 330문제
- ID 규칙: `{subject}-{chapter}-q{nn}`

### worksheet_topics

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | text | **PK** | 토픽 ID (e.g. `introduction-topic-1`) |
| subject | text | NOT NULL | 과목 slug |
| name | text | NOT NULL | 토픽명 |

- RLS: 읽기 공개, 쓰기 제한
- 현재 데이터: 33개 토픽

### worksheet_questions

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | text | **PK** | 문제 ID |
| topic_id | text | NOT NULL | 소속 토픽 ID |
| subject | text | NOT NULL | 과목 slug |
| type | text | NOT NULL | `fill_in` \| `descriptive` |
| difficulty | integer | NOT NULL | 1 / 2 / 3 |
| question | text | NOT NULL | 문제 본문 |
| answer | text | NOT NULL | 정답 |
| explanation | text | NOT NULL | 해설 |
| source | text | NULL | 출처 |
| tags | text[] | DEFAULT '{}' | 태그 |

- RLS: 읽기 공개, 쓰기 제한
- 현재 데이터: 324문제

### reviews

| 컬럼 | 타입 | 제약 | 설명 |
|------|------|------|------|
| id | serial | **PK** | 자동 증가 ID |
| path | text | UNIQUE, NOT NULL | 리뷰 대상 경로 |
| content | text | NOT NULL | 리뷰 내용 (마크다운) |
| updated_at | timestamptz | DEFAULT now() | 수정 시간 |

- RLS: **읽기/쓰기 모두 공개** (사용자 리뷰)
- upsert 기준: `path`

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
getAllQuizzes(): Promise<QuizQuestion[]>
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
| topic_id | topicId | WorksheetQuestionRow (단, 현재 snake_case 그대로) |

---

## 데이터 정합성 규칙

### 필수 참조 관계 (FK 미설정, 애플리케이션 레벨 보장)

1. `chapters.subject_slug` → `subjects.slug`에 존재해야 함
2. `quiz_questions.subject` → `subjects.slug`에 존재해야 함
3. `quiz_questions.chapter` → `chapters.slug`에 존재해야 함 (같은 subject 내)
4. `worksheet_questions.subject` → `subjects.slug`에 존재해야 함
5. `worksheet_questions.topic_id` → `worksheet_topics.id`에 존재해야 함
6. `worksheet_topics.subject` → `subjects.slug`에 존재해야 함

### ID 네이밍 규칙

| 테이블 | 패턴 | 예시 |
|--------|------|------|
| subjects | `{slug}` | `introduction` |
| chapters | auto-increment | `1`, `2`, ... |
| quiz_questions | `{subject}-{chapter}-q{nn}` | `introduction-ch1-q01` |
| worksheet_topics | `{subject}-topic-{n}` | `introduction-topic-1` |
| worksheet_questions | `{subject}-ws-{nn}` | `introduction-ws-01` |

### 값 제약

- `type` (quiz): `multiple`, `ox`, `fill_in`, `descriptive` 중 하나
- `type` (worksheet): `fill_in`, `descriptive` 중 하나
- `difficulty`: 정수 1, 2, 3만 허용
- `answer` (multiple): `"0"` ~ `"3"` 문자열 (options 배열 인덱스)
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

---

## 알려진 기술 부채

1. **FK 미설정**: chapters.subject_slug → subjects.slug 등 FK 제약 없음
2. **topic_id 네이밍**: WorksheetQuestionRow에서 snake_case 그대로 노출
3. **searchQuizzes SQL 인젝션 가능성**: `ilike.%${query}%` — parameterized 방식 전환 필요
4. **마이그레이션 스크립트에 키 하드코딩**: scripts/migrate-to-supabase.ts에 anon key 직접 포함
