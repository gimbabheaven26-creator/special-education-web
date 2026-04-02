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
- **X↔지니 채널**: `~/.openclaw/workspace/channel.md` — 세션 시작 시 읽고, 지니 메시지가 있으면 우선 확인. 세션 종료/주요 작업 완료 시 지니에게 메시지 남기기.

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
src/lib/quiz/                      # 퀴즈 로직 (seeded-sample, adaptive-difficulty, answer-checker, flashcard-converter 등)
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
src/components/dashboard/KiceRecommendCard.tsx  # 기출 빈출 키워드 카드 (data/terminology/kice-terms.json 정적 import)

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
- **플래시카드 복습 UX**: OX 카드 = O/X 버튼 자동 판정 (knew/forgot), 일반 카드 = question→hint→answer 순차 공개 (`AnswerGrade: 'knew'|'hint'|'forgot'`). AdvanceTimerBar (정답 2초/오답 4초). 자가평가 삭제 (40648d5). 카드 편집(`updateCard`), 퀴즈→카드 2탭 추가(`/flashcards/add`), 변환 엔진(`flashcard-converter.ts` — OX 150자 필터, fill_in 지원)

---

## 코딩 규칙

- `console.log` 금지 (린트 에러)
- 하드코딩 금지 — env var 사용 (`process.env.XXX`)
- `generateStaticParams`: raw 값 반환 필수 (encodeURIComponent 금지)
- 파일 800줄, 컴포넌트 500줄, 함수 50줄 초과 시 분리
- 새 컴포넌트: Server Component 우선, 상호작용 필요 시 `'use client'`
- **SC wrapper + Client 분리 패턴**: `'use client'` page.tsx에서는 `export const dynamic`이 prerender에서 무시됨. force-dynamic 필요 시 page.tsx를 SC wrapper로 분리하고 `*Client.tsx`에 클라이언트 로직 이동 (2324e03). 예: `interactive/page.tsx`(SC) + `InteractiveClient.tsx`(client)
- **API Route 입력 검증**: Zod 스키마 필수 (`z.string().min(N).max(N)` 등)
- **접근성**: WCAG 2.1 AA 기준 — 모든 버튼에 `aria-label`, 이미지에 `alt`, `focus-visible` 스타일 유지
- **global-error.tsx 예외**: 루트 레이아웃 에러 처리 특성상 Tailwind 미사용, 인라인 스타일 허용
- **optimizePackageImports 재활성화 금지**: `next.config.mjs`의 `experimental.optimizePackageImports: ['lucide-react']`는 webpack 모듈 분할과 충돌하여 SSG prerender TypeError 발생 (6067d27). 재활성화 시 119페이지 빌드 실패
- **force-dynamic 필수 페이지 (32개)**: `/` (page.tsx), `login`, `record`, `terms`, `community`, `concepts`, `concepts/[subject]`, `daily`, `diagnosis`, `flashcards`, `flashcards/add`, `flashcards/review`, `interactive`, `kice`, `mastery`, `onboarding`, `practice-hub`, `quiz`, `quiz/[subject]`, `quiz/ox`, `quiz/short`, `scenarios`, `search`, `subjects`, `today`, `today/answers`, `worksheets`, `wrong-notes`, `wrong-notes/quiz`, `bookmarks/quiz`, `admin/editor/[id]` — webpack 번들 분할 불일치로 SSG prerender 'call' TypeError. 4개 'use client' 페이지(interactive, onboarding, scenarios, flashcards/review)는 SC wrapper + Client 분리 (2324e03). 제거 시 빌드 실패
- **overlay link 패턴**: 카드 전체 클릭 + 독립 버튼 공존 시 `absolute inset-0 z-0` anchor + `relative z-10` 버튼 조합 사용 (854497d)
- **JSON 정적 데이터 import**: Server Component에서 `readFileSync` 대신 `import data from '@/../data/file.json'` 사용 — SSG/빌드 안정성 확보 (aa0f663)

---

## 현재 마일스톤 (M1: 2026-03-25~31)

M1 전체 완료 (2026-03-25~31, 65+ 커밋). 주요 성과: UX 감성설계, loading/error/empty 전페이지, WCAG AA 접근성, lib/ 5도메인 분리, 테스트 894건, 컴포넌트 분해 500줄 미만, 집중모드+미션, /my·/record 대시보드, 나다운 Phase 6 완료, 커뮤니티 AI 문제. 상세는 `git log --oneline` 또는 `docs/changelog.md` 참조.

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
