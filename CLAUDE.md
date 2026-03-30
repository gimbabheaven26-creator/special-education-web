# 특수교육 웹 — Claude 작업 가이드

## 프로젝트

특수교육 임용고시 준비 앱 (SPA + SSR).
베타 테스터 활동 중. 배포: https://special-education-web.vercel.app

**스택**: Next.js 14 (App Router), TypeScript, Tailwind v4, Supabase (PostgreSQL + Auth + Storage), Zustand v4 (v5 마이그레이션 예정), Vitest

**GitHub**: `gimbabheaven26-creator/special-education-web`
**Git Author**: `266103587+gimbabheaven26-creator@users.noreply.github.com`

---

## 핵심 명령어

```bash
npm run dev          # 로컬 서버 (localhost:3000)
npm run build        # 프로덕션 빌드 (배포 전 필수)
npm run lint         # ESLint
npm run test         # Vitest 단위 테스트
npm run test:e2e     # Playwright E2E
```

**빌드 확인 없이 커밋 금지.** `npm run build`가 exit 0이어야 완료로 간주.

---

## 에이전트 체제 (X+V 2체제, 2026-03-27~)

| 에이전트 | 역할 | 모드 |
|---------|------|------|
| **X** | 실행: 코드 작성, 데이터 파이프라인, 전략, 상담 | 빌드/데이터/전략/상담 4모드 자동 전환 |
| **V** | 검증: 코드 리뷰, 보안 감사, 데이터 정합성 | 독립 검증 전담 |

**자동화 도구**:
- **Playwright MCP**: 프로젝트 설정에 등록됨 (`~/.claude.json`). V가 접근성 트리 기반 E2E 동적 검증에 사용.
- **v-auto-verify.sh**: `feat:` 커밋 감지 시 lint+typecheck 자동 실행 + V 심층 검증 추천 (`~/.claude/hooks/`)
- **Completion Contract**: `/plan` 실행 시 완료 기준 체크리스트 필수 작성. V가 80%+ 통과 여부로 판정.

**`docs/contract.md`가 유일한 진실의 원천**.
스키마/API 변경 → contract.md 먼저 수정 → 카이란 승인 → 구현.

---

## 중요 파일 경로

```
src/lib/supabase.ts        # Supabase 클라이언트
src/lib/db/                # DB 쿼리 도메인별 분리 (subjects, quiz, worksheets, user-data)
src/lib/db/index.ts        # 재수출 — 기존 `@/lib/db` import 호환
src/app/layout.tsx         # 루트 레이아웃 (Server Component, 구조만)
src/components/layout/LayoutProviders.tsx  # client 위젯 통합 (ThemeProvider, Header 등)
src/components/BetaFeedbackWidget.tsx  # 베타 피드백 위젯 (전역, 베타 기간 한정)
src/app/api/feedback/route.ts          # Discord webhook 연동 피드백 POST API

docs/contract.md           # DB 스키마 + API 계약 (변경 전 반드시 읽기)
docs/changelog.md          # 변경 이력
docs/kangsaem-requests.md  # 작업 요청 큐 (구 강선생, 현 X)
docs/cloudy-requests.md    # 작업 요청 큐 (구 클루디, 현 X)
docs/v-reviews/            # V(외부 검증) 리뷰 파일 — 세션 시작 시 OPEN 항목 확인 필수

src/lib/content/                   # 개념/구조/URL 유틸 (concept-urls, concepts, structure-utils, worksheet-utils)
src/lib/quiz/                      # 퀴즈 로직 (seeded-sample, adaptive-difficulty, answer-checker 등)
src/lib/study/                     # 학습 진도 (mastery, badges, xp-constants, stats-utils, study-planner, focus-utils 등)
src/stores/useFocusStore.ts        # 집중 모드 + 오늘의 미션 (Zustand persist, 6시간 로테이션)
src/components/dashboard/          # 홈 재설계 — HomeDashboard, FocusBanner, MissionBlockList
src/app/my/useMyPageData.ts        # /my 대시보드 통합 훅 (3스토어 데이터 가공)
src/app/my/LevelBadge.tsx          # XP 레벨 + 진행바 + 스트릭 → /mastery 링크
src/app/my/WeeklyActivityChart.tsx  # 7일 학습 CSS 바 차트
src/app/my/WeaknessInsight.tsx     # 약점 과목 3개 + 정답률 + 연습 링크
src/app/my/SmartRecommendations.tsx # 데이터 기반 추천 액션 최대 3개
src/app/mastery/LearningDashboard.tsx  # 학습 현황 대시보드 (mastery/page.tsx에서 추출)
src/lib/kice/                      # 기출 데이터 (kice, kice-analytics)

scripts/insert-with-service-key.mjs  # Supabase 데이터 삽입 패턴
data/terminology/nise-dictionary.json  # NISE 용어사전 1129개
data/terminology/kice-terms.json       # KICE 기출 키워드 1417개
data/kice-기출/                         # KICE 기출문제 (2016~2026)
src/content/concepts/                  # MDX 개념학습 파일 (101개)
src/components/ui/RouteErrorPage.tsx   # 13개 error.tsx 공통 컴포넌트 (WCAG role="alert")
src/app/global-error.tsx               # 루트 레이아웃 에러 처리 (인라인 스타일)
```

---

## Supabase 규칙

- **Service Role Key**: `scripts/`에서만 사용, 절대 커밋 금지
- **클라이언트**: `src/lib/supabase.ts`의 anon key만 사용
- **전체 fetch**: `.limit(10000)` 필수 (PostgREST 기본 limit = 1,000)
- **RLS**: 읽기 공개, 쓰기는 service role 또는 auth 필요
- **스키마 변경**: `docs/contract.md` 수정 + 카이란 승인 없이 절대 금지
- **환경변수 목록**: `DISCORD_WEBHOOK_URL` (피드백 Discord 알림, 미설정 시 알림 생략)

```
Supabase URL: https://ssluhxvbyzqmdkbjwoke.supabase.co
테이블: subjects, chapters, quiz_questions, worksheet_questions,
        worksheet_topics, reviews, community_questions, question_votes
데이터: 11과목, 39챕터, 3113퀴즈, 44토픽, 376워크시트

nadaun Supabase (별도): https://clyznibsrnypkdorqbfl.supabase.co
테이블: students, iep_plans, goals, weekly_plan_items, achievement_standards, teaching_materials
```

---

## 아키텍처 요점

- **상태 관리**: Zustand 6개 스토어 (`useStudyStore`, `useLeitnerStore`, `useQuizStore`, `useBookmarkStore`, `useFocusStore`, `useOnboardingStore`)
- **라우팅**: App Router. 주요 페이지: `/`, `/today`, `/quiz/ox`, `/quiz/short`, `/terms`, `/practice`, `/daily`, `/concepts`, `/community`, `/bookmarks/quiz`, `/diagnosis`, `/practice-hub`, `/my`, `/record`, `/mastery`, `/stats`, `/flashcards`
- **허브 페이지 패턴**: `/diagnosis`, `/practice-hub`, `/today` — 도착지 페이지로 설계 (메뉴가 아님). 각각 클라이언트 요약 컴포넌트(DiagnosticsSummary, PracticeProgress, TodayDashboard) + 액션 링크 구성
- **오늘학습 `/daily`**: 홈 메인 버튼에서만 접근 (네비 미노출)
- **MDX 컴포넌트 API**: `FillBlank` = `text` prop, `MatchingExercise` = `items` prop
- **`src/data/` TS 파일**: 기존 페이지 참조 중 — 새 UI는 `src/lib/db/` 사용
- **DB 쿼리 모듈**: `src/lib/db/` 도메인별 분리 — subjects, quiz, worksheets, user-data, analytics, community-db, review-db, admin-auth, profile, sync + index.ts 재수출
- **lib/ 도메인 구조**: `src/lib/` 31파일 → content/, db/, kice/, quiz/, study/ 5개 서브디렉토리로 분리. 각 디렉토리에 index.ts barrel 재수출
- **피드백 API** `POST /api/feedback`: Discord webhook 연동, rate limit IP당 3회/분, `DISCORD_WEBHOOK_URL` env var 필요
- **BetaFeedbackWidget**: 베타 기간 한정 전역 위젯 — `LayoutProviders.tsx`에 마운트, 베타 종료 시 제거 필요
- **layout.tsx**: LayoutProviders 분리 완료 (007bdb9, 2026-03-28) — client 위젯 6개를 `LayoutProviders.tsx`로 추출, layout.tsx는 Server Component 역할에 집중
- **퀴즈 세션 훅**: `src/app/quiz/[subject]/useQuizSession.ts` — QuizClient에서 추출한 세션 상태 전담 훅 (buildSession, answers, navigation)
- **네비 1클릭 직행**: 모든 NavGroup에 `href` 필드 설정 — 진단평가→`/diagnosis`, 실력쌓기→`/practice-hub`, 내 기록→`/record`, 함께하기→`/community`. 하단탭 1클릭으로 허브 이동
- **내 기록 대시보드**: `/record` = RecordDashboard (오늘 성과, 핵심 지표, 정답률 추이, 약점, 추천, 미해결 오답/북마크/복습). `/mastery` = LearningDashboard (page.tsx에서 추출, 과목별 숙련도 상세). `/my` = 대시보드 허브 (LevelBadge, WeeklyActivityChart, WeaknessInsight, SmartRecommendations + useMyPageData 훅)
- **출제경향 탭**: `/kice` 2탭 구성 (기출문제, 출제분석). 영역별·키워드검색 탭 제거 (27c9002)
- **플래시카드 3단계 힌트**: CardPhase `question→hint→answer` 순차 공개. 힌트 사용 여부로 등급 자동 결정 (`AnswerGrade: 'knew'|'hint'|'forgot'`). 초성 추출 힌트 + 맥락 힌트. 3D flip 제거, 패널 전환 방식

---

## 코딩 규칙

- `console.log` 금지 (린트 에러)
- 하드코딩 금지 — env var 사용 (`process.env.XXX`)
- `generateStaticParams`: raw 값 반환 필수 (encodeURIComponent 금지)
- 파일 800줄, 컴포넌트 500줄, 함수 50줄 초과 시 분리
- 새 컴포넌트: Server Component 우선, 상호작용 필요 시 `'use client'`
- **API Route 입력 검증**: Zod 스키마 필수 (`z.string().min(N).max(N)` 등)
- **접근성**: WCAG 2.1 AA 기준 — 모든 버튼에 `aria-label`, 이미지에 `alt`, `focus-visible` 스타일 유지
- **global-error.tsx 예외**: 루트 레이아웃 에러 처리 특성상 Tailwind 미사용, 인라인 스타일 허용
- **optimizePackageImports 재활성화 금지**: `next.config.mjs`의 `experimental.optimizePackageImports: ['lucide-react']`는 webpack 모듈 분할과 충돌하여 SSG prerender TypeError 발생 (6067d27). 재활성화 시 119페이지 빌드 실패

---

## 현재 마일스톤 (M1: 2026-03-25~31)

**감성 UX & 시스템 안정** (릴리 제언 기반)
- [x] Vercel Analytics + Speed Insights 연동 (c749376, 2026-03-25)
- [x] BetaFeedbackWidget + Discord 알림 (3898c54, 2026-03-25)
- [x] 로딩 스켈레톤 — quiz/ox, terms, concepts (6764ead, 2026-03-25)
- [x] 에러/빈 상태 UI — error.tsx 12개, not-found.tsx, EmptyState (6764ead, 2026-03-25)
- [x] WCAG 2.1 AA 접근성 기초 — aria-label 7곳, focus-visible, min-h-44px (6764ead, 2026-03-25)
- [x] error.tsx 13개 → RouteErrorPage 공통 컴포넌트 + role="alert" (1ba5915, 2026-03-25)
- [x] V리뷰 0325 전체 해소 7/7 — rate limiter, next-pwa, 접근성 (a5f7903, 2026-03-25)
- [x] 노션 4DB 구조변경 — 태그 63→16, M0~M4 마일스톤, 담당자 통일 (d5d7c13, 2026-03-25)

- [x] EmptyState ariaLabel 접근성 보강 (d2f502f, 2026-03-27)
- [x] BottomTabBar smooth scroll (d2f502f, 2026-03-27)
- [x] X+V 2체제 에이전트 통합 (d7c9636, 2026-03-28)
- [x] session-wrap 문서 정비 — changelog, CLAUDE.md, contract.md X+V 반영 (518aff0, 2026-03-28)
- [x] /interactive error.tsx + 기출 결과 영역별 개념 직링크 (0dd45b6, 2026-03-28)
- [x] 하네스 개선 6단계 — V 까다로움 기준, Completion Contract, GAN 루프, Playwright MCP, v-auto-verify 훅 (2026-03-28)
- [x] Week 2 인프라: db.ts 도메인 분리 (356줄 → db/ 4파일 + index.ts) (8b3def0, 2026-03-28)
- [x] Week 2 인프라: QuizClient.tsx 유틸 추출 (810줄 → 641줄) (8b3def0, 2026-03-28)
- [x] Week 2 인프라: layout.tsx LayoutProviders 분리 — V 감시 해소 (007bdb9, 2026-03-28)
- [x] db/ 도메인 분리 vitest 단위 테스트 38건 — mock-supabase + 4모듈 (206e450, 2026-03-28)
- [x] 용어 순화 10건 — SRS→간격반복, BDS→상황시뮬레이션, Leitner→플래시카드, MDX 제거 (6c92a87, 2026-03-28)
- [x] 빈 상태 개선 — WrongNotesClient 필터 EmptyState + CTA 적용 (6c92a87, 2026-03-28)
- [x] EmptyState 접근성 — role="status" + aria-live="polite" (6c92a87, 2026-03-28)
- [x] vitest exclude nadaun/** — npm run test 클린 통과 (6c92a87, 2026-03-28)
- [x] daily/page.tsx 579→5줄 리팩토링 — 11파일 분리 (types, lib, hook, 7 components) (a3f5d67, 2026-03-29)
- [x] seeded-sample API route 중복 제거 + 단위 테스트 33건 (d268088, 2026-03-29)
- [x] 테스트 커버리지 대폭 확대 — 271→736건 (41파일), Zustand 5스토어 + lib 유틸 12파일 (2026-03-29)
- [x] BetaFeedbackWidget setTimeout 클린업 + vitest worktree exclude (4b52989, 2026-03-29)
- [x] UX 문구 개선 6페이지 — 감성 설계 60→70점 (d93beb7, 2026-03-29)
- [x] loading.tsx 10개 스켈레톤 + 기출→개념 직링크 갭 해소 (28850bb, 2026-03-29)
- [x] EmptyState icon prop 수정 + 3페이지 통합 (7ee5591, 2026-03-29)
- [x] 의사소통장애 퀴즈 18문항 추가 (a04007e, 2026-03-29)
- [x] REQ-003 Supabase 퀴즈 삽입 — 2750→3113문항, 4과목 363문항 추가 (df9e839, 2026-03-29)
- [x] automation-scout 발견 패턴 3건 커맨드 생성 — generate-loading, empty-state-migrator, fixture-sync (9cc8678, 2026-03-29)
- [x] 북마크 퀴즈 링크 수정 + /quiz/short loading·error 추가 (5e7be66, 2026-03-29)
- [x] EmptyState 7페이지 공유 컴포넌트 교체 — search, kice, mastery, terms, stats, my (ef4b973, 2026-03-29)
- [x] 빌드 복구 — error.tsx 2개 추가 + 이동된 lib 모듈 5개 재수출 (f88e8b5, 2026-03-29)
- [x] lib/ 31파일 → content/db/kice/quiz/study/ 5도메인 분리 + 80 import 경로 갱신 (33f4d52, 2026-03-29)
- [x] 테스트 894건 전체 통과 — mock 경로 수정 4건 + 재수출 1건 (47acf8f, 2026-03-29)
- [x] M2 D9 컴포넌트 분해 3건 — QuizForm 736→635, QuizClient 642→274(useQuizSession 훅), my/page 513→365 (811d528, 2026-03-29)
- [x] 오답노트 SRS 모드 + 재시험 UX 개선 (e1ca90f, 2026-03-29)
- [x] 북마크 카드에 과목별 퀴즈 직링크 추가 (541544d, 2026-03-29)
- [x] 용어사전 필터 안내 + 기출 탭 접근성·색상 범례 (e4422c6, 2026-03-29)
- [x] /my 기능카드 0건 행동유도 문구 — 오답노트·북마크·플래시카드 (e5d9937, 2026-03-29)
- [x] /wrong-notes SRS UX 개선 — 미완료 뱃지 + 리뷰 진행 바 (edcaea6, 2026-03-29)
- [x] /terms 불필요 안내 제거 + /kice 빈도분석 탭 바 추가 (28f7a91, 2026-03-29)
- [x] loading.tsx 4곳 추가 — diagnosis, practice, practice-hub, bookmarks/quiz (5827734, 2026-03-29)
- [x] 북마크 퀴즈 전용 라우트 /bookmarks/quiz (dbdced6, 2026-03-29)
- [x] concepts 과목 페이지 SSG 오류 해결 — buttonVariants() 제거 (1418463, 2026-03-29)
- [x] Confidence/확신도 기능 완전 제거 — 14파일 정리 (1c8a93f, 2026-03-29)
- [x] 정교화 질문 삭제 + kice 데드코드 정리 (b768112, 2026-03-29)
- [x] 출제경향 4→2탭 간소화 + 북마크 안내 문구 + 네비 1클릭 직행 (27c9002, 2026-03-29)
- [x] Phase 2 UX — 집중 모드(useFocusStore) + 데일리 미션(MissionBlockList) + 홈 재설계(HomeDashboard) (31ca279, 2026-03-30)
- [x] RecordDashboard 타입 수정 + nav-config 테스트 /record 반영 (c932940, 2026-03-30)
- [x] page.tsx 홈 미션 대시보드 복원 + force-dynamic SSG 에러 방지 (07b8bbd, 2026-03-30)
- [x] optimizePackageImports 비활성화 — SSG prerender 'call' 에러 해결 (6067d27, 2026-03-30)
- [x] answerCard boolean→AnswerGrade 타입 통일 + FlashcardScene 3단계 평가 + concepts SSG 해소 (fbffa58, 2026-03-30)
- [x] /my 대시보드 강화 — LevelBadge·WeeklyActivityChart·WeaknessInsight·SmartRecommendations·useMyPageData 5컴포넌트 (0c694f3, 2026-03-30)
- [x] nadaun Phase 4-2 보강 — Plan Detail 진도 바 + 단위 테스트 (ea5e985, 2026-03-30)
- [x] 지니(OpenClaw) 성능 개선 — contextTokens 50K, 스킬 4개(git-ops/build-check/session-wrap/orchestrator), 하트비트, X→지니 훅 동기화 3개, stale 메모리 5파일 갱신, GUIDE.md (2026-03-30)
- [x] nadaun Phase 6 완료 — PWA, 교수학습자료 5층 MVP, 토스트, 인쇄 CSS, V검증 PASS 82.5% (023f842, 2026-03-30)
- [x] 용어→플래시카드 브릿지 + 통합검색 용어 1,129개 (8a3b35e, 2026-03-30)
- [x] E2E /my + /record Playwright 8건 (ccd1d43, 2026-03-30)
- [x] B4 커뮤니티 AI 문제 만들기 — Gemini 1.5 Flash + AI-First 3단계 + 직접작성 병행

> M1 Day 1 전체 완료 (2026-03-25). Day 2: V리뷰 7/7 해소 + RouteErrorPage + global-error + SCORE_TIERS (2026-03-26). Day 3~4: smooth scroll + ariaLabel + 에이전트 통합 (2026-03-27~28). Day 5: 하네스 분석 + 문서 정비 + 기출 직링크 + Week 2 인프라 재구조 3건 + **vitest 38건 + 용어 순화 + 빈 상태/접근성 + 하네스 실전 검증** (2026-03-28). Day 6: **daily 리팩토링 + 테스트 271→736건 + loading.tsx 10개 + EmptyState + UX 문구 + 의사소통장애 퀴즈** (2026-03-29). Day 8: **lib/ 31파일 5도메인 분리 + 테스트 736→894건 + EmptyState 7페이지 통합 + 빌드 복구** (2026-03-29). Day 9: **컴포넌트 분해 3건 — QuizForm·QuizClient·MyPage 500줄 미만 달성** (2026-03-29). Day 10: **UX fix 3건 + loading 4곳 + 북마크 퀴즈 라우트** (2026-03-29). Day 11: **concepts SSG 수정 + Confidence 완전 제거 + 출제경향 4→2탭 + 네비 1클릭** (2026-03-29).

---

## 노션 기록 (커밋 시 자동)

커밋 전 `~/.claude/notion-pending.json` 작성:
```json
{
  "destination": "sprint",
  "title": "X 기능명 (2026-MM-DD)",
  "agent": "X",
  "status": "완료",
  "commit": "해시",
  "tags": ["X", "특수교육웹"],
  "content": "## 완료\n- ..."
}
```
커밋하면 훅이 자동으로 노션 스프린트 로그 DB에 POST.
