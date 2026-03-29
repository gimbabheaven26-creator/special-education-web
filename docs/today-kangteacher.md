# X 세션 핸드오프 — 2026-03-29 (오전: 페이지 맵 + 빌드 복구)

## 오전 세션 (10:00~10:35 KST)

### 완료
- docs/page-map-for-review.md: 4개 영역 30+ 라우트 전수 탐색 + 이슈 9건
- 북마크 퀴즈 링크 버그 수정 (/wrong-notes/quiz → /quiz)
- /quiz/short, /concepts, /flashcards error.tsx 추가
- 다른 세션의 lib 이동(study/, kice/, content/, db/) 후 빌드 깨짐 → 재수출 6개 + mock 수정 4건으로 복구
- 빌드 exit 0, 894 테스트 통과, push 완료

### 전략 전환 (카이란 지시)
- 인프라/테스트/리팩토링 종료
- 다음부터: 카이란 리뷰 → 피드백 → 수정 → 재리뷰 무한 루프
- 만족도 목표: 실력쌓기/내기록/함께하기 20% → 50%+

---

# X 세션 핸드오프 — 2026-03-29 (M1 UX 마무리 + nadaun Phase 3)

## 이번 세션 완료 커밋

| 커밋 | 내용 |
|------|------|
| `b759d31` | feat(nadaun): Phase 3 IEP Plan UI (4 components, 3 pages) |
| `28850bb` | feat(ux): loading.tsx 10개 + 기출→개념 직링크 |
| `7ee5591` | fix(ux): EmptyState icon prop + 3페이지 통합 + 테스트 타입 수정 |
| `a590da8` | test(lib): study-planner, kice-analytics, community-db 단위 테스트 45건 |

## 세션 컨텍스트
- nadaun 3개 병렬 세션 중 3번째 — IEP Plan UI 전담 (다른 세션: 학생 CRUD, 내보내기)
- SEW M1 kangseonsaeng 9항목 중 잔여 UX 갭 해소 (loading.tsx, concept links, EmptyState)
- EmptyState API 변경: `icon?: ReactNode` prop 추가 (기본값 📚). 새 페이지 작성 시 Lucide 아이콘 전달 가능

## 다음 X가 알아야 할 것

### 테스트 현황 (2026-03-29)
- **Vitest**: 43 suites, 755 tests 통과
- **E2E**: 3 files, 36 tests (Playwright)
- **합계**: 791 tests

### 미테스트 src/lib/ 모듈 (커버리지 갭)
| 파일 | 줄수 | 비고 |
|------|------|------|
| sync.ts | 190 | SyncManager, 네트워크 의존 |
| concepts.ts | 174 | fs 의존, 파일 시스템 mock 필요 |
| elaboration.ts | 130 | extractKeywords만 커버리지 있음 |
| review-db.ts | 72 | Supabase 쿼리 |
| profile.ts | 61 | 사용자 프로필 CRUD |

### E2E 파일 충돌 주의
다른 세션이 tests/e2e/ 3파일을 덮어씌운 흔적 있음. git HEAD 버전(5bbe69b)이 올바른 버전.

### 린터 자동 수정
- kice-analytics.test.ts: ExamEntry에 `filename` 필드 필요 (`label` 아님)
- community-db.test.ts: 미사용 `MockQueryBuilder` import 제거됨

## 현재 상태
- `main` 브랜치, origin/main 동기화 완료, 빌드 통과

## 미해결 항목
- 위 미테스트 모듈 5개
- QuizClient.tsx 642줄 (500줄 초과, Week 3 분할 후보)
- nadaun Phase 5 완료 확인 (다른 세션 08adc6b)

---

# X 세션 핸드오프 — 2026-03-28 (M1 Day 5 + Week 2 인프라)

## 이번 세션 완료 커밋 (최신순)

| 커밋 | 내용 |
|------|------|
| `b810e47` | docs: CLAUDE.md Week 2 인프라 재구조 반영 |
| `007bdb9` | refactor(layout): LayoutProviders 분리 — client 위젯 6개 추출 |
| `8b3def0` | refactor(infra): db.ts 도메인 분리 + QuizClient.tsx 유틸 추출 |
| `0dd45b6` | feat(ux): /interactive error.tsx + 기출 결과 영역별 개념 직링크 |
| `6c92a87` | fix(test): vitest exclude nadaun/** + 용어 순화 10건 + 빈 상태 + 접근성 |
| `206e450` | test(db): db/ 도메인 분리 vitest 단위 테스트 38건 |
| `518aff0` | docs: session-wrap 문서 정비 |

## 다음 X가 알아야 할 것

### db/ 도메인 분리 (신규 구조)
- **기존**: `src/lib/db.ts` (356줄 모놀리식) — **삭제됨**
- **현재**: `src/lib/db/` 디렉토리 — subjects.ts, quiz.ts, worksheets.ts, user-data.ts
- **호환**: `src/lib/db/index.ts`에서 전부 재수출 → 기존 `import { ... } from '@/lib/db'` 그대로 작동
- **주의**: TypeScript는 db.ts를 db/index.ts보다 먼저 resolve하므로 **구파일이 남아있으면 안 됨**

### QuizClient.tsx 유틸 추출
- **810줄 → 641줄**: `quiz-session-utils.ts`(buildSession, generateDiagnosticSessionId, findNextUnanswered) + `QuestionNav.tsx` 추출
- TODO: 정교화 질문 5건 주석 처리 상태 유지 (M2 DEFERRED 결정 대기)

### LayoutProviders.tsx (신규)
- **위치**: `src/components/layout/LayoutProviders.tsx`
- **역할**: ThemeProvider, Header, BottomTabBar, ConditionalReviewPanel, StudySessionTracker, SyncManager, BetaFeedbackWidget 통합
- **layout.tsx**: import 4개, Server Component 역할에 집중
- V 감시 항목 해소됨

## 현재 상태
- `main` 브랜치, origin/main 동기화 완료
- M1 체크리스트 17/17 [x] — Week 2 인프라 3건 포함

## 미해결 항목
- QuizClient 정교화 질문 TODO 5건 (M2 DEFERRED 대기)
- REQ-008 subjects 컬럼 추가 시 multi-tag 검색 복원 (db/quiz.ts:27)
- ~~db/ 분리 모듈 단위 테스트 미작성~~ → 206e450으로 완료 (38건)
- QuizForm.tsx (736줄), daily/page.tsx (579줄) 분리 후보

---

# X(V) 세션 핸드오프 — 2026-03-26 (M1 Day 2)

## 이번 세션 완료 커밋 (최신순)

| 커밋 | 내용 |
|------|------|
| `02b59fa` | docs: session-wrap 문서 정리 — changelog + CLAUDE.md |
| `ac21fb0` | fix(ux): SCORE_TIERS 상수 분리 + global-error.tsx |
| `a5f7903` | docs(v-review): V리뷰 0325 전체 해소 7/7 |
| `f8b3109` | refactor: V리뷰 MEDIUM 4건 FIXED |
| `9ca6e82` | refactor: RouteErrorPage 13개 error.tsx 1-liner화 |
| `1bc28c8` | fix: API 캐싱 NetworkOnly + rateLimitMap 만료 정리 |

## 다음 강선생이 알아야 할 것

### RouteErrorPage 공통 컴포넌트 (신규)
- **위치**: `src/components/ui/RouteErrorPage.tsx`
- **역할**: 13개 error.tsx가 이 컴포넌트를 props로 호출하는 1-liner 구조
- **새 라우트에 error.tsx 추가할 때**: RouteErrorPage import 후 emoji/title/description/resetLabel/backHref/backLabel 전달
- **WCAG**: `role="alert"` 자동 포함 — 별도 접근성 처리 불필요

### global-error.tsx (신규)
- **위치**: `src/app/global-error.tsx`
- **역할**: 루트 레이아웃 에러 처리. **Tailwind 사용 불가** (레이아웃 실패 시 CSS 로드 불가) → 인라인 스타일 필수
- **수정 시 주의**: 인라인 스타일 코드리뷰 예외 대상

### SCORE_TIERS 상수
- **위치**: `src/app/quiz/[subject]/QuizResultScreen.tsx` 상단
- 점수 구간별 감성 메시지 (91+/61+/31+/30-)

### sw.js API 캐싱 수정
- `next.config.mjs`에 `/api/` NetworkOnly 규칙 추가됨
- `public/sw.js` 직접 수정 금지 (빌드 시 덮어쓰임)

## 현재 상태
- `main` 브랜치, origin/main 동기화 완료
- V리뷰 7/7 전부 FIXED/WONTFIX — `docs/v-reviews/v-review-0325-m1-ux.md` 참조

## 미해결 항목
- `/interactive` 라우트 error.tsx 누락 (RouteErrorPage 1-liner로 추가 가능)
- layout.tsx 컴포넌트 12개 — LayoutProviders 분리 감시 중

---

# 강선생1 세션 핸드오프 — 2026-03-25 (M1 Day 1)

## 이번 세션 완료 커밋 (최신순)

| 커밋 | 내용 |
|------|------|
| `6764ead` | feat(ux): M1 감성 UX — 에러 인간화, 스켈레톤, 접근성, 빈 상태 |
| `c749376` | feat: Vercel Analytics + Speed Insights 연동 |
| `3898c54` | feat: BetaFeedbackWidget + Discord 알림 |

## 완료 작업
- 에러 메시지 12개 인간화 (라우트별 맞춤 문구)
- 로딩 스켈레톤 3개 (quiz/ox, terms, concepts)
- EmptyState 범용 컴포넌트 + not-found.tsx 404 페이지
- WCAG 2.1 AA 접근성 기초 (aria-label 7곳, focus-visible, min-h-44px)
- Vercel Analytics + Speed Insights
- BetaFeedbackWidget (Discord webhook 연동)

## 현재 상태
- `main` 브랜치, origin/main 동기화 완료

---

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

# 강선생2 세션 핸드오프 — 2026-03-24

## 이번 세션 완료 커밋 (최신순)

| 커밋 | 내용 |
|------|------|
| `23634a5` | fix(concepts): 과목 퀴즈 진입점 추가 |

## 완료 작업

### 퀴즈 진입점 연결 (`23634a5`)
- `src/app/concepts/[subject]/page.tsx`: `dbSubject` 존재 시 LearningTimeline 위에 Brain 아이콘 + "과목 퀴즈 풀기" 버튼 추가
- 지시서 위치 수정: `/subjects/[slug]`가 `ad4e00b`에서 `/concepts/[subject]`로 흡수됨 확인 후 올바른 파일에 적용
- `docs/kangteacher2-0322-practice-auto-cmds.md` Step 1 완료 표시

### concepts prerender 크래시 검증
- `TypeError: Cannot read properties of undefined (slice/reduce)` — **이미 해소됨**
- 강선생1 `71b975e` (MDX undefined props guard)에서 수정 완료 확인
- 현재 build 출력에 TypeError 없음

## 현재 상태

- `main` 브랜치, **origin/main 동기화 완료** (미커밋 없음)
- tsc --noEmit: 에러 0건
- build: 188페이지 OK (lint 경고 5건 — 비크리티컬)

## 미해결 항목

- lint 경고 5건 (비크리티컬): `useMemo` 불필요 의존성 ×2, `<img>` ×2, ref cleanup ×1

## 다음 작업 후보

1. 카이란의 다음 지시서 대기
2. lint 경고 정리 (선택사항)

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

---

# 강선생1 세션 핸드오프 — 2026-03-23 (오후)

## 이번 세션 완료 커밋 (최신순)

| 커밋 | 내용 |
|------|------|
| `30b721d` | refactor(nav): 네비게이션 구조 재편 |
| `9f62af5` | feat(quiz): OX퀴즈/단답형/문제풀기 허브 페이지 신규 생성 |
| `932e678` | feat(db): getQuizzesByType 함수 추가 |
| `4d1059d` | docs: 강선생1 용어사전 UX 지시서 + 노션 pending |

## 완료 작업

### 1. 오늘의 단어 바텀시트 UX 검증 (kangteacher1-0323-terms-ux-auto-cmds.md)
- `09dc9e3`에 이미 구현 완료 확인 (TodayTermCardClient + TermsClient initialOpen)
- tsc 0건 / build 183페이지 OK

### 2. 메인 네비게이션 구조 개편 (kangteacher1-0323-nav-restructure-auto-cmds.md)

**Step 1** — `src/lib/db.ts`: `getQuizzesByType(type: QuizType)` 추가 (`932e678`)

**Step 2** — 3개 페이지 신규 생성 (`9f62af5`):
- `src/app/quiz/ox/page.tsx` — OX퀴즈 전용
- `src/app/quiz/short/page.tsx` — 단답형 전용
- `src/app/practice/page.tsx` — 모의고사+워크시트 허브

**Step 3** — `src/lib/nav-config.ts` 재구성 (`30b721d`):
- 진단평가: /daily·/worksheets → /quiz/ox·/quiz/short·/terms
- 실력쌓기: /kice/exam → /practice

## 현재 상태

- `main` 브랜치, **origin/main 동기화 완료** (미커밋 없음)
- tsc --noEmit: 에러 0건
- build: 186페이지 OK (183→+3)

## 미해결 항목

- `/quiz/ox`, `/quiz/short`, `/practice` 수동 접속 확인 필요
- 상단 네비 드롭다운 + 모바일 탭바 시각 확인 필요

## 다음 작업 후보

1. 카이란의 다음 지시서 대기
