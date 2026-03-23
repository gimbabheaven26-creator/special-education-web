# 강선생1 세션 핸드오프 — 2026-03-22 (야간)

## 이번 세션 완료 커밋 (최신순)

| 커밋 | 내용 |
|------|------|
| `1165b43` | fix(worksheets): Supabase 직접 조회로 뷰·정답 페이지 플로우 복구 |
| `9a8b014` | fix(daily): 비로그인 허용 + seed를 UTC→KST로 통일 |

## 완료 작업

### 진단평가 4개 페이지 오류 검증 (스미스 프라임 역할)
- 오늘학습(`/daily`), 개념학습(`/concepts`), 워크시트(`/worksheets`), 용어학습(`/terms`) 검증
- tsc 에러 0건 확인

### 버그 수정 (멀티에이전트 병렬)

#### Task 1 — 워크시트 플로우 복구 (`1165b43`)
- `src/lib/db.ts`: `getWorksheetTopicById(id)` 함수 추가
- `src/app/worksheets/[id]/WorksheetViewClient.tsx`: 신규 생성 (정답 토글 + 출력 클라이언트 컴포넌트)
- `src/app/worksheets/[id]/page.tsx`: 서버 컴포넌트 전환 (Supabase 직접 조회)
- `src/app/worksheets/[id]/answers/page.tsx`: 서버 컴포넌트 전환
- 효과: 목록 클릭 → 문제지 정상 표시 (기존: 항상 "학습지를 찾을 수 없습니다")

#### Task 2 — 오늘학습 버그 수정 (`9a8b014`)
- `src/app/api/daily-questions/route.ts`: 401 인증 블록 제거 (비로그인 허용)
- `src/app/api/daily-questions/route.ts`: UTC→KST seed 교체 (자정 근처 문제세트 불일치 해소)

## 현재 상태

- `main` 브랜치, **origin/main 동기화 완료** (미커밋 없음)
- tsc --noEmit: 에러 0건
- build: 175페이지 OK

## 미해결 항목

- 용어학습 `activeSubject` dead code (기능 영향 없음, 정리 필요 시 별도 작업)

## 다음 작업 후보

1. 카이란의 다음 지시서 대기
2. 개념학습/용어학습 UX 실제 확인

---

# 강선생2 세션 핸드오프 — 2026-03-23

## 이번 세션 완료 커밋 (최신순)

| 커밋 | 내용 |
|------|------|
| `ff587f0` | fix(kice): ExamClient key prop 추가 + 기본 시험 정렬 수정 |

## 완료 작업

### 실력쌓기 3개 라우트 구조 검증
- `/subjects`, `/kice/exam`, `/interactive` 검증 — tsc 0건, build OK
- `/subjects/[slug]` → `/quiz/[subject]` 진입점 없음 발견 → 지시서 작성

### KICE 버그 2건 수정 (`ff587f0`)
- `src/app/kice/exam/page.tsx`: ExamClient에 `key` prop 추가 — 연도/세션 변경 시 answers 상태 초기화 보장
- `src/lib/kice.ts`: `getAvailableExams()` 파일 정렬 추가 — 기본 선택이 전공A-동형 → 전공A로 교정

## 현재 상태

- `main` 브랜치, **origin/main 동기화 완료** (미커밋 없음)
- tsc --noEmit: 에러 0건
- build: 175페이지 OK

## 미완료 항목

- `/subjects/[slug]` 퀴즈 버튼 추가 — `docs/kangteacher2-0322-practice-auto-cmds.md` Step 1 미실행
- `concepts` prerender 경고 (빌드 시 TypeError slice/reduce) — 기존 문제, 조사 필요

## 다음 작업 후보

1. `concepts` prerender 크래시 조사·수정 (배포 안정성)
2. `/subjects/[slug]` 퀴즈 버튼 추가 실행

---

# 강선생1 세션 핸드오프 — 2026-03-23

## 이번 세션 완료 커밋 (최신순)

| 커밋 | 내용 |
|------|------|
| `1ff13b3` | fix(mdx): MDX 파일 컴포넌트 API 통일 — sentence/pairs → text/items |
| `eb28afd` | fix: MDX 컴포넌트 guard를 hooks 뒤로 이동 — rules-of-hooks 위반 수정 |
| `71b975e` | fix: MDX 컴포넌트 undefined props guard 추가 — Vercel 프리렌더 크래시 수정 |

*위 커밋은 강선생2 병렬 세션에서 수행됨 (강선생1 조사 → 강선생2 수정)*

## 완료 작업

### 실력쌓기 3개 라우트 구조 검증
- `/subjects`, `/kice/exam`, `/interactive` 검증 — 이상 없음 확인
- ChapterTracker 버그 2건 — `fa4a10a`에서 이미 수정 완료 확인

### 개념학습 404 원인 조사 및 수정 (`71b975e`, `eb28afd`, `1ff13b3`)

**4가지 원인 발견 및 수정:**

1. **MDX import 문 제거 (7개 파일)** — next-mdx-remote/rsc는 MDX 내부 import 미지원
   - 진단평가 4개, 특수교육공학/02, 특수교육공학/05, 행동수정/03

2. **FillBlank API 수정 (3개 파일)** — `sentence+answers` → `text+{{answer|hint}}` 인라인 문법
   - 청각장애/05, 청각장애/06, 특수교육공학/05

3. **MatchingExercise API 수정 (3개 파일)** — `pairs={[{left,right}]}` → `items={[{term,definition}]}`
   - 청각장애/05, 청각장애/06, 특수교육공학/05

4. **Rules of Hooks 위반 수정 (3개 컴포넌트)** — early return을 hooks 뒤로 이동
   - FillBlank.tsx, StepGuide.tsx, MatchingExercise.tsx

## 현재 상태

- `main` 브랜치, **origin/main 동기화 완료** (미커밋 없음)
- tsc --noEmit: 에러 0건
- build: prerender 에러 0건

## 미해결 항목

- 없음

## 다음 작업 후보

1. 카이란의 다음 지시서 대기
