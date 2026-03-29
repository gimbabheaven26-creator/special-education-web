# Changelog

> X-V 간 DB/API 변경 이력 (2026-03-27 이전: 강선생-클루디)
> contract.md 변경 시 반드시 여기에 기록

## 작성 규칙

```
## [날짜] 변경자 — 변경 요약

### 변경 내용
- 구체적 변경 사항

### 영향 범위
- X(빌드): 어떤 코드에 영향?
- X(데이터): 어떤 데이터에 영향?

### 상태
- [ ] contract.md 업데이트
- [ ] 카이란 승인
- [ ] 구현 완료
- [ ] 상대 세션 전달
```

---

## [2026-03-29] X — 나다운 V 검증 + 보안 강화 (야간5)

### 변경 내용
- V 검증 3건 해소 — auth bypass 완전화, 성취기준 89건 삽입, 빈 상태 UI (55c91bc)
- `getTeacherId()` 공유 유틸 추출 — 3파일 중복 제거, E2E bypass + production 가드 (dc29ffb)
- `getStudents()` teacher_id 필터 추가 — 보안 강화 (dc29ffb)
- E2E error-boundary 테스트 auth bypass 호환 — 79/79 PASS (77d4150)
- 수동 테스트 체크리스트 63항목 생성 (nadaun/docs/manual-test-checklist.md)

### 영향 범위
- nadaun/src/lib/supabase/auth.ts (신규 — 공유 인증 유틸)
- nadaun/src/lib/queries/students.ts (teacher_id 필터)
- nadaun/src/lib/actions/students.ts, iep-plans.ts (import 변경)
- nadaun/tests/e2e/error-boundary.spec.ts (테스트 호환)

### 상태
- [x] 구현 완료
- [x] V 검증 통과 (F1+F2+F3 해소)
- [x] E2E 79/79 PASS

---

## [2026-03-29] X — 북마크 퀴즈 라우트 + loading 보강 (야간4)

### 변경 내용
- `/bookmarks/quiz` 전용 퀴즈 라우트 신설 — 북마크한 챕터의 퀴즈만 필터링하여 풀기 (dbdced6)
- `/bookmarks` 페이지에 '북마크 퀴즈' CTA 버튼 추가
- `loading.tsx` 4곳 추가 — `/diagnosis`, `/practice`, `/practice-hub`, `/kice/analytics` (5827734)
- `e1ca90f` feat(ux): 오답노트 SRS 모드 + 재시험 UX 개선
- `541544d` feat(ux): 북마크 카드에 과목별 퀴즈 직링크 추가
- `e4422c6` feat(ux): 용어사전 필터 안내 + 기출 탭 접근성·색상 범례

### 신규 파일
- `src/app/bookmarks/quiz/page.tsx` — server component (subjects + quizzes fetch)
- `src/app/bookmarks/quiz/BookmarkQuizClient.tsx` — client quiz loop (296줄)
- `src/app/bookmarks/quiz/loading.tsx`, `error.tsx`

### 상태
- [x] 구현 완료
- [x] 빌드/린트/테스트 통과 (910 tests)

---

## [2026-03-29] X — Phase 3~5 UX 마무리 (야간3)

### 변경 내용
- `/my` 기능카드 0건 desc 3건 행동유도 문구로 개선 (오답노트·북마크·플래시카드)
- `/wrong-notes` "전체 오답" 탭에 미완료 카운트 뱃지 추가 + SRS 리뷰 진행 바
- `/terms` "(정의 10자 미만 제외)" 불필요 안내 제거
- `/kice` AnalyticsClient에 누락된 4탭 네비게이션 바 추가

### 상태
- [x] 구현 완료
- [x] 빌드/린트/테스트 통과 (910 tests)

---

## [2026-03-29] X — M2 D9 컴포넌트 분해 3건

### 변경 내용
- **QuizForm.tsx 736→635줄**: OptionsEditor(71줄) + SubQuestionsEditor(95줄) 추출 → `src/app/admin/editor/`
- **QuizClient.tsx 642→274줄**: useQuizSession 커스텀 훅(393줄) 추출 → `src/app/quiz/[subject]/useQuizSession.ts`. 세션 상태 15+ useState + diagnostic 로직 캡슐화
- **my/page.tsx 513→365줄**: GuestBanner + SubjectProgressTab + RecentWrongTab → `src/app/my/MySubComponents.tsx`(154줄)
- 모든 컴포넌트 500줄 미만 달성

### 상태
- [x] 빌드 성공 (exit 0)
- [x] 52파일 894 tests 0 failures
- [x] 커밋 811d528

---

## [2026-03-29] X — lib/ 5도메인 분리 + 테스트 894건 + EmptyState 7페이지 통합

### 변경 내용 (후반 세션)
- **lib/ 31파일 도��인 분리**: src/lib/ flat → content/, db/, kice/, quiz/, study/ 5개 서브디렉토리 + 각 index.ts barrel 재수출. 80+ 파일 import 경로 갱신 (33f4d52)
- **EmptyState 7페이지 통합**: search, kice, kice/area, mastery, terms, stats, my의 인라인 빈 상태 UI → 공유 EmptyState 컴포넌트 교체 (ef4b973)
- **빌드 복구**: error.tsx 2개(concepts, flashcards) + 이동된 lib 모듈 5개 재수출 (f88e8b5)
- **테스트 736→894건**: mock 경로 수정 4건 + 재���출 1건으로 전체 통과 (47acf8f)
- **북마크 퀴즈 ���크 수정** + /quiz/short loading·error 추가 (5e7be66)

### 상태
- [x] 빌드 성공 (exit 0)
- [x] 52파일 894 tests 0 failures
- [x] 푸시 완료 (5e7be66..47acf8f)

---

## [2026-03-29] X — daily 리팩토링 + 테스트 271→736건 + 스켈레톤 10개

### 변경 내용
- **daily/page.tsx 리팩토링**: 579→5줄, 11파일 분리 (types/daily.ts, lib/seeded-sample.ts, hooks/useDailyQuiz.ts, 7 _components) (a3f5d67)
- **seeded-sample 중복 제거**: API route의 로컬 함수 삭제 → @/lib/seeded-sample import (d268088)
- **테스트 커버리지 대폭 확대**: 271→736건 (41파일). Zustand 5스토어 + answer-checker + seeded-sample + adaptive-difficulty + badges + session-recovery + spaced-scenario + concept-urls + structure-utils + array-utils + mastery + study-planner + worksheet-utils + xp-constants
- **loading.tsx 10개 스켈레톤 추가**: bookmarks, community, daily, flashcards, interactive, mastery, reviews, scenarios, stats, wrong-notes (28850bb)
- **기출→개념 직링크**: AnalyticsClient 영역별 개념학습 바로가기 (28850bb)
- **EmptyState icon prop 수정**: community, bookmarks, mine 3페이지 통합 (7ee5591)
- **BetaFeedbackWidget setTimeout 클린업**: useRef + useEffect 언마운트 정리 (4b52989)
- **UX 문구 개선 6페이지**: 감성 설계 60→70점 (d93beb7)
- **의사소통장애 퀴즈 18문항**: 5챕터 분배 (a04007e)

### 생성/수정 파일 (주요)
| 구분 | 파일 |
|------|------|
| 신규 | src/types/daily.ts, src/lib/seeded-sample.ts, src/hooks/useDailyQuiz.ts |
| 신규 | src/app/daily/_components/ (7파일) |
| 신규 | src/**/loading.tsx (10파일) |
| 신규 | src/lib/__tests__/ (12파일 테스트) |
| 수정 | src/app/daily/page.tsx (579→5줄) |
| 수정 | src/app/api/daily-questions/route.ts (중복 제거) |

### 상태
- [x] 빌드 성공 (exit 0)
- [x] 41파일 736 tests 0 failures
- [x] 푸시 완료

---

## [2026-03-28] X — 용어 순화 + vitest 38건 + 하네스 실전 검증

### 변경 내용 (후반)
- **용어 순화 10건**: SRS→간격반복, BDS→상황시뮬레이션, Leitner→플래시카드, MDX 노출 제거. 9개 파일 user-facing 텍스트 교체 (6c92a87)
- **빈 상태 개선**: WrongNotesClient 필터 0건 시 EmptyState 컴포넌트 + CTA 적용 (6c92a87)
- **EmptyState 접근성 보강**: role="status" + aria-live="polite" 추가 (6c92a87)
- **db/ 도메인 분리 vitest 38건**: mock-supabase + subjects/quiz/worksheets/user-data 4모듈 테스트 (206e450)
- **vitest exclude nadaun/**: nadaun 서브프로젝트 제외 → npm run test 클린 통과 (6c92a87)
- **하네스 실전 검증**: /plan(Completion Contract) → 구현 → V 독립 검증(PASS 9/10) → 브라우저 실증

### 상태
- [x] 빌드 성공 (exit 0)
- [x] V 검증 PASS 9/10 — Completion Contract 9/9 통과

---

## [2026-03-28] X — 기본교육과정 성취기준 JSON 추출 + 에이전트 통합

### 변경 내용
- **X+V 2체제 에이전트 통합**: 강선생/클루디/프라임 → X, 검증 에이전트 → V (d7c9636)
- **기본교육과정 중학교 국어·수학 성취기준 JSON**: 교육부 고시 제2022-34호 [별책 3]에서 추출 — 국어 14개, 수학 33개 (c097e1f)
- **smooth scroll + EmptyState ariaLabel**: BottomTabBar 부드러운 스크롤, EmptyState aria-label 접근성 보강 (d2f502f)
- **기본교육과정 중학교 진로와직업·생활영어 성취기준 JSON**: 진로와직업 21개, 생활영어 12개 추출 (e5e2877)
- **session-wrap 문서 정비**: changelog 3/28 기록, CLAUDE.md M1 체크리스트, contract.md X+V 에이전트명 반영 (518aff0)
- **/interactive error.tsx + 기출 결과 영역별 개념 직링크**: interactive 라우트 에러 페이지 추가, ExamResultScreen에 BookOpen 아이콘 개념 직링크 (0dd45b6)
- **Week 2 인프라: db.ts 도메인 분리**: src/lib/db.ts(356줄) → src/lib/db/ 4개 도메인 파일(subjects, quiz, worksheets, user-data) + index.ts 재수출. 기존 `@/lib/db` import 호환 (8b3def0)
- **Week 2 인프라: QuizClient.tsx 유틸 추출**: 810줄 → 641줄. buildSession, findNextUnanswered → quiz-session-utils.ts, QuestionNav → QuestionNav.tsx (8b3def0)
- **Week 2 인프라: LayoutProviders 분리**: layout.tsx client 위젯 6개를 LayoutProviders.tsx로 추출. layout.tsx는 Server Component 역할에 집중 (007bdb9)

### 생성/수정 파일
| 파일 | 작업 |
|------|------|
| data/curriculum/achievement-stds/korean-middle.json | 신규 (국어 성취기준) |
| data/curriculum/achievement-stds/math-middle.json | 신규 (수학 성취기준) |
| CLAUDE.md | 수정 (X+V 2체제 반영 + Week 2 인프라 체크) |
| .claude/rules/v-review-pipeline.md | 수정 (에이전트명 통일) |
| src/components/layout/BottomTabBar.tsx | 수정 (smooth scroll) |
| src/components/ui/EmptyState.tsx | 수정 (ariaLabel) |
| src/lib/db.ts | 삭제 → src/lib/db/ 디렉토리로 분리 |
| src/lib/db/index.ts | 신규 (재수출 호환 레이어) |
| src/lib/db/subjects.ts | 신규 (과목/챕터 쿼리) |
| src/lib/db/quiz.ts | 신규 (퀴즈 문제 8함수) |
| src/lib/db/worksheets.ts | 신규 (학습지 5함수) |
| src/lib/db/user-data.ts | 신규 (프로필/사용자 데이터) |
| src/app/quiz/[subject]/quiz-session-utils.ts | 신규 (세션 빌드/유틸 추출) |
| src/app/quiz/[subject]/QuestionNav.tsx | 신규 (네비 컴포넌트 추출) |
| src/components/layout/LayoutProviders.tsx | 신규 (client 위젯 통합) |
| src/app/layout.tsx | 수정 (LayoutProviders import) |

### 영향 범위
- X(빌드): db 쿼리 모듈 구조 변경, 레이아웃 컴포넌트 분리, QuizClient 유틸 추출
- X(데이터): 교육과정 데이터 신규 추가

### 상태
- [x] 빌드 성공 (exit 0)
- [x] 커밋 + 푸시 완료

---

## [2026-03-26] X — V리뷰 0325 전체 해소 + 구조 개선

### 변경 내용
- **RouteErrorPage 공통 컴포넌트**: 13개 error.tsx 중복(468줄) → props 1-liner화(-288줄) + `role="alert"` WCAG 4.1.3 (9ca6e82, 1ba5915)
- **rate limiter Map 만료 정리**: `rateLimitMap.size > 1000` 시 만료 엔트리 forEach 삭제 (1bc28c8)
- **sw.js /api/ NetworkOnly**: next.config.mjs runtimeCaching에 `/api/` NetworkOnly 규칙 추가 (1bc28c8)
- **global-error.tsx**: 루트 레이아웃 에러 처리용 인라인 스타일 컴포넌트 (ac21fb0)
- **SCORE_TIERS 상수 분리**: QuizResultScreen 점수 감성 분기 정리 (ac21fb0)
- **V리뷰 7/7 전체 해소**: FIXED 6 + WONTFIX 1 (a5f7903)

### 생성/수정 파일
| 파일 | 작업 |
|------|------|
| src/components/ui/RouteErrorPage.tsx | 신규 (공통 에러 컴포넌트) |
| src/app/global-error.tsx | 신규 (루트 에러 처리) |
| src/app/*/error.tsx (13개) | 수정 (RouteErrorPage 1-liner) |
| src/app/api/feedback/route.ts | 수정 (rate limiter 정리) |
| next.config.mjs | 수정 (NetworkOnly 규칙) |
| src/app/quiz/[subject]/QuizResultScreen.tsx | 수정 (SCORE_TIERS) |
| docs/v-reviews/v-review-0325-m1-ux.md | 수정 (7/7 해소) |

### 영향 범위
- 강선생: 에러 UI 수정 시 RouteErrorPage.tsx만 수정하면 13개 라우트에 반영
- 클루디: 영향 없음

### 상태
- [x] 빌드 성공 (exit 0)
- [x] V리뷰 전부 FIXED/WONTFIX 처리

---

## [2026-03-25] 클루디(X) — 데이터 정합성 7건 작업

### 변경 내용
- **챕터 참조 수정**: quiz_questions.chapter 한국어→영어 slug 매핑 (2593건 수정, 0 broken)
- **emotional-behavioral 과목 퀴즈 재배치**: behavior-support/ebd로 33건 이동
- **하드코딩 키 제거**: migrate-to-supabase.ts, insert-new-quizzes.ts → process.env 전환
- **FK 제약 SQL 작성**: add-fk-constraints.sql (5개 FK, Supabase SQL Editor에서 실행 필요)
- **워크시트 데이터 생성**: 4과목(시각/청각/지체/의사소통) 토픽+문제 (삽입 스크립트 포함)
- **data-validator 검증**: Referential Integrity 0 violations 확인

### 검증 결과 (validate-data.mjs)
- Referential Integrity: **0 violations** (이전 2593)
- ID Naming: 1290 (known exceptions — kice-*, term-*, OX 패턴)
- Value Constraints: 34 (vi-q* 5개 선택지 — 별도 수정 필요)
- Data Completeness: 6 (emotional-behavioral 과목 + 5개 빈 챕터)

### 생성/수정 파일
| 파일 | 작업 |
|------|------|
| scripts/fix-chapter-references.mjs | 신규 (챕터 참조 수정) |
| scripts/add-fk-constraints.sql | 신규 (FK DDL) |
| scripts/insert-worksheet-vi-hi-pd-cd.mjs | 신규 (워크시트 삽입) |
| data/worksheets/vi-hi-pd-cd-topics.json | 신규 (12 토픽) |
| data/worksheets/vi-hi-pd-cd-questions.json | 신규 (60+ 문제) |
| scripts/migrate-to-supabase.ts | 수정 (키 제거) |
| scripts/insert-new-quizzes.ts | 수정 (키 제거) |
| prompt_plan.md | 수정 (실행 계획) |

### 후속 작업 (카이란 확인 필요)
- [ ] Supabase SQL Editor에서 add-fk-constraints.sql 실행
- [ ] 워크시트 삽입 스크립트 실행: `SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/insert-worksheet-vi-hi-pd-cd.mjs`
- [ ] vi-q* 5개 선택지 → 4개로 수정 (34건)
- [ ] emotional-behavioral 과목 삭제 여부 결정

### 영향 범위
- 강선생: quiz_questions.chapter 값 변경됨 → db.ts 쿼리에 영향 없음 (chapters 테이블과 일치하므로)
- 클루디: FK 설정 후 데이터 삽입 시 참조 무결성 자동 검증됨

### 상태
- [x] contract.md 기존 규칙 준수
- [x] 구현 완료 (DB 데이터 수정 적용됨)
- [x] 빌드 성공
- [ ] 카이란 승인 (FK 설정, emotional-behavioral 삭제)

---

## [2026-03-25] 강선생2 — V 리뷰 보안 수정 + session-wrap 문서 정비

### 변경 내용
- **V 리뷰 보안 수정** (`/api/feedback/route.ts`): rate limiting (IP당 3회/분) + Discord @everyone/@here 인젝션 방지 + page 파라미터 길이 검증
- **CLAUDE.md 보강**: BetaFeedbackWidget, /api/feedback, DISCORD_WEBHOOK_URL, v-reviews/ 경로 추가
- **README.md**: create-next-app 기본 템플릿 → 실제 프로젝트 정보로 교체

### 영향 범위
- 강선생: `src/app/api/feedback/route.ts` 보안 강화
- 클루디: 없음

### 상태
- [x] 구현 완료
- [x] 커밋 완료

---

## [2026-03-24] 강선생2 — 과목 퀴즈 진입점 + KICE 버그 수정

### 변경 내용
- **concepts/[subject] 퀴즈 진입점**: dbSubject 존재 시 LearningTimeline 위에 Brain 아이콘 버튼 추가 (`23634a5`)
- **KICE ExamClient key prop**: 연도/세션 변경 시 answers 상태 초기화 보장 (`ff587f0`)
- **kice.ts 파일 정렬**: readdirSync macOS 순서 의존 → 명시적 sort로 전공A가 기본 선택 (`ff587f0`)
- `/subjects/[slug]`가 `ad4e00b`에서 `/concepts/[subject]`로 흡수됨 확인

### 영향 범위
- 강선생: `src/app/concepts/[subject]/page.tsx`, `src/app/kice/exam/page.tsx`, `src/lib/kice.ts`
- 클루디: 없음

### 상태
- [x] 구현 완료
- [x] 커밋 완료

---

## [2026-03-23] 강선생1 — 개념학습+과목학습 통합 + MDX 크래시 수정 + 네비 재편

### 변경 내용
- **concepts+subjects 통합** (`ad4e00b`): /subjects/* → /concepts/* 리다이렉트, LearningTimeline 이동
- **MDX prerender 크래시 수정** (`71b975e`, `eb28afd`, `1ff13b3`): undefined props guard + FillBlank/MatchingExercise API 통일
- **네비 구조 재편** (`30b721d`): /quiz/ox, /quiz/short, /practice 신규 페이지
- **Vercel Analytics + Speed Insights** (`c749376`): 베타 페이지뷰 수집 시작
- **BetaFeedbackWidget + /api/feedback** (`3898c54`): Discord webhook 연동 피드백 수집

### 영향 범위
- 강선생: src/app/concepts/, src/app/quiz/, src/app/practice/, src/components/layout/, src/lib/nav-config.ts
- 클루디: 없음

### 상태
- [x] 구현 완료
- [x] 커밋 완료

---

## [2026-03-16] 클루디 — Supabase Auth + 서버 동기화 스키마 설계 (v2.3)

### 변경 내용
- **profiles 테이블 신규** — Supabase Auth `auth.users`와 1:1 연결, display_name 저장
- **user_data 테이블 신규** — 4개 Zustand 스토어(study/leitner/quiz/bookmark) JSONB 동기화
- **동기화 전략** — optimistic update + last-write-wins + 게스트 모드 유지
- **API 함수 추가** — getProfile, updateProfile, getUserData, upsertUserData, getAllUserData
- **FK 제약 추가** — profiles.id → auth.users.id, user_data.user_id → profiles.id
- **역할 분담 추가** — 테이블/RLS는 클루디, auth.ts/sync.ts/middleware는 강선생

### 영향 범위
- 강선생: `src/lib/supabase/auth.ts`, `src/lib/sync.ts` 신규 작성, 미들웨어 추가, db.ts에 Auth/Sync 함수 추가
- 클루디: profiles + user_data 테이블 DDL, RLS 정책, handle_new_user 트리거, 마이그레이션 SQL

### 상태
- [x] contract.md 업데이트
- [x] 카이란 승인
- [ ] 구현 완료 (클루디: 테이블 생성, 강선생: 클라이언트 코드)
- [ ] 상대 세션 전달

---

## [2026-03-15] 강선생 — 클로즈드 베타 리뷰 시스템 + KICE 기출 뷰어

### 변경 내용
- **리뷰 시스템 v2** — reviews 테이블에 reviewer_name, status 컬럼 추가
- **리뷰 대시보드** — `/reviews` 페이지 (필터링, 상태 관리: pending/discussing/accepted/rejected)
- **ReviewPanel 확장** — reviewer_name 입력 필드, 전체 페이지 활성화
- **API 확장** — `/api/reviews` PATCH 메서드 (상태 변경), POST에 reviewer_name 지원
- **KICE 기출 뷰어** — `/kice` 페이지 (연도/세션 선택, 원본/동형/예상 비교, 키워드 검색)
- **contract.md v2.2** — reviews 스키마 업데이트

### 신규/수정 파일
| 파일 | 작업 |
|------|------|
| `src/app/reviews/page.tsx` | 신규 |
| `src/app/kice/page.tsx` | 신규 |
| `src/app/kice/KiceClient.tsx` | 신규 |
| `src/components/kice/*.tsx` | 신규 (4파일) |
| `src/lib/kice.ts` | 신규 |
| `src/types/kice.ts` | 신규 |
| `scripts/migrate-reviews-v2.sql` | 신규 |
| `src/lib/db.ts` | 수정 (saveReview + updateReviewStatus) |
| `src/app/api/reviews/route.ts` | 수정 (PATCH + reviewer_name) |
| `src/components/ReviewPanel.tsx` | 수정 (reviewer_name 입력) |
| `src/components/layout/ConditionalReviewPanel.tsx` | 수정 (전페이지 활성화) |
| `src/components/layout/Header.tsx` | 수정 (기출 네비 링크) |
| `docs/contract.md` | 수정 (v2.2) |

### 영향 범위
- 강선생: UI 전반 (리뷰 시스템, 기출 뷰어)
- 클루디: reviews 테이블 마이그레이션 필요 (`scripts/migrate-reviews-v2.sql`)

### 상태
- [x] contract.md 업데이트
- [ ] 카이란 승인 (마이그레이션 실행)
- [x] 구현 완료
- [x] 빌드 성공 + 24 tests passed
- [x] 커밋 & 푸시 완료 (de74660, 8cebc9b)

---

## [2026-03-11] 초기 세팅 — contract.md v1.0 작성

### 변경 내용
- contract.md 최초 작성
- 6개 테이블 스키마 문서화
- db.ts API 시그니처 문서화
- 역할 분담 명시
- 데이터 정합성 규칙 정의

### 영향 범위
- 강선생: 없음 (기존 코드 그대로)
- 클루디: 향후 DB 변경 시 contract.md 먼저 수정 필요

### 상태
- [x] contract.md 업데이트
- [x] 카이란 승인 (이 세션에서)
- [x] 구현 완료
- [ ] 클루디 세션 전달

---

## [2026-03-14] 강선생 — Phase 4 세션 2: 차트, 필터링, 플래시카드 통합 + 버그 8건 수정

### 변경 내용
- **학습 활동 히트맵** — DailyHeatmap (12주 GitHub-style 히트맵) + computeHeatmapData 유틸
- **주간 학습 추이 차트** — WeeklyTrendChart (8주 바 차트 + 정답률) + computeWeeklyTrend 유틸
- **플래시카드 진행률** — FlashcardStats (Leitner Box 분포 차트, 오늘 복습 카드 수)
- **오답 노트 챕터 필터링** — 과목 선택 시 챕터 드롭다운 + URL params 딥링크 지원
- **오래된순 정렬** — wrong-notes 정렬에 'oldest' 옵션 추가 (spaced repetition 활용)
- **취약 영역 → 오답 딥링크** — WeakAreas에서 /wrong-notes?subject=... 바로가기
- **오답 → 플래시카드 원클릭 저장** — WrongNoteCard에 Leitner 자동 저장 버튼
- **버그 8건 수정** — OX 대소문자, ScenarioComposite allFilled, handleSkip 데드엔드, wrongNotes eviction overflow, duplicate setFinished, WrongNotesQuizClient 누락 타입, notFound() 미호출, wrongCount 계산 오류

### 신규/수정 파일
| 파일 | 작업 |
|------|------|
| `src/app/stats/DailyHeatmap.tsx` | 신규 |
| `src/app/stats/WeeklyTrendChart.tsx` | 신규 |
| `src/app/stats/FlashcardStats.tsx` | 신규 |
| `src/app/wrong-notes/quiz/WrongNotesQuizClient.tsx` | 신규 (page.tsx에서 분리) |
| `src/app/stats/StatsClient.tsx` | 수정 (3개 차트 연결) |
| `src/app/stats/WeakAreas.tsx` | 수정 (오답 딥링크) |
| `src/app/wrong-notes/WrongNoteCard.tsx` | 수정 (플래시카드 저장 버튼) |
| `src/app/wrong-notes/WrongNotesClient.tsx` | 수정 (챕터 필터 + URL params) |
| `src/app/wrong-notes/page.tsx` | 수정 (chapterTitleMap 전달) |
| `src/lib/stats-utils.ts` | 수정 (heatmap + weekly trend 유틸) |
| `src/stores/useQuizStore.ts` | 수정 (wrongNotes 500개 제한 + eviction) |
| `src/app/quiz/[subject]/QuestionCard.tsx` | 수정 (OX toUpperCase, allFilled) |
| `src/app/quiz/[subject]/QuizClient.tsx` | 수정 (handleSkip, setFinished) |
| `src/app/quiz/[subject]/QuizResultScreen.tsx` | 수정 (answeredCount 기반 rate) |
| `src/app/quiz/[subject]/page.tsx` | 수정 (notFound() 호출) |
| `src/app/error.tsx` + 4개 error.tsx | 수정 (console.error 제거) |

### 영향 범위
- 강선생: 통계 페이지 전면 확장, 오답 노트 UX 개선, 퀴즈 버그 수정
- 클루디: 없음 (DB 무관, 클라이언트 상태만 변경)

### 상태
- [x] 구현 완료
- [x] 빌드 성공 (TypeScript 0 errors)
- [x] 커밋 & 푸시 완료 (894bb12 + 이전 5개 커밋)

---

## [2026-03-14] 강선생 — Phase 4: 학습 경험 고도화

### 변경 내용
- **오답 재시험 데이터 수정** — wrong-notes/quiz에서 recordQuizResult + addQuizResult 호출 추가
- **오답 요약 카드** — WrongNoteSummary 컴포넌트 + computeWrongNoteSummary 유틸
- **주간 요약 카드** — WeeklySummary 컴포넌트 + computeWeeklySummary 유틸
- **취약 영역 챕터 드릴다운** — WeakAreas에 chapterStats prop + 과목별 직접 퀴즈 링크
- **북마크 버튼** — BookmarkButton 컴포넌트, 챕터 페이지 헤더에 추가
- **XP 상수 통합** — xp-constants.ts로 추출 (useStudyStore, stats-utils 공유)
- **타임존 KST 일치** — stats-utils.ts의 toDateString을 Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' })로 통일
- **네비게이션 통일** — Header에 오답노트/통계 추가, "플래시카드"→"카드"
- **오답 자동 복습 혼합** — buildSessionWithReview (10문제 중 오답 3문제 자동 삽입)

### 신규/수정 파일
| 파일 | 작업 |
|------|------|
| `src/app/stats/WrongNoteSummary.tsx` | 신규 |
| `src/app/stats/WeeklySummary.tsx` | 신규 |
| `src/lib/xp-constants.ts` | 신규 |
| `src/components/chapter/BookmarkButton.tsx` | 신규 |
| `src/app/stats/StatsClient.tsx` | 수정 (새 컴포넌트 연결) |
| `src/app/stats/WeakAreas.tsx` | 수정 (챕터 드릴다운) |
| `src/lib/stats-utils.ts` | 수정 (WrongNote/Weekly 유틸) |
| `src/stores/useStudyStore.ts` | 수정 (xp-constants import) |
| `src/app/wrong-notes/quiz/page.tsx` | 수정 (결과 기록 누락 수정) |
| `src/app/quiz/[subject]/QuizClient.tsx` | 수정 (buildSessionWithReview) |
| `src/app/subjects/[slug]/[chapter]/page.tsx` | 수정 (BookmarkButton 추가) |
| `src/components/layout/Header.tsx` | 수정 (네비게이션 통일) |
| `src/app/wrong-notes/WrongNoteCard.tsx` | 수정 (챕터 보기 링크) |

### 영향 범위
- 강선생: UI 전반 (통계, 퀴즈, 챕터)
- 클루디: 없음 (DB 무관, 클라이언트 상태만 변경)

### 상태
- [x] 구현 완료
- [x] 빌드 성공
- [x] 커밋 & 푸시 완료

---

## [2026-03-11] 강선생 — UI 재설계 Phase 1 기반 작업

### 변경 내용
- 컬러 시스템 변경 (globals.css)
- BottomTabBar 컴포넌트 추가
- Header 리뉴얼
- Layout 모바일 대응

### 영향 범위
- 강선생: UI 전반
- 클루디: 없음 (DB 무관)

### 상태
- [x] 구현 완료
- [ ] 커밋 필요
