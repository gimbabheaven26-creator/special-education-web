# Codex 상세 작업 규칙

이 문서는 `AGENTS.md`에서 분리한 상세 규칙이다. `AGENTS.md`는 새 세션 주입용 코어로 유지하고, 구현 중 필요한 세부사항은 여기에서 확인한다.

## 자동화와 협업

- Playwright MCP: Codex 설정에 등록됨 (`.codex/config.toml`, `~/.codex/config.toml`). 접근성 트리 기반 E2E 동적 검증에 사용한다.
- `v-auto-verify.sh`: `feat:` 커밋 감지 시 lint+typecheck 자동 실행 + V 심층 검증 추천 (`~/.codex/hooks/`).
- Completion Contract: `/plan` 실행 시 완료 기준 체크리스트를 작성한다. V가 80%+ 통과 여부로 판정한다.
- X/루멘↔지니 채널: `~/.openclaw/workspace/channel.md`. 세션 시작 시 읽고, 세션 종료/주요 작업 완료 시 필요하면 지니에게 메시지를 남긴다.
- E2E CI: `.github/workflows/e2e.yml`. main push/PR 시 Playwright E2E 자동 실행. `NEXT_PUBLIC_SUPABASE_ANON_KEY` secret 필요.
- Codex에는 현재 별도 keybindings 파일이 없다. Claude Code 전용 설정은 `~/.claude/keybindings.json`.

## 핵심 문서

- `docs/contract.md`: DB 스키마 + API 계약. 스키마/API 변경 전 반드시 읽는다.
- `docs/changelog.md`: 변경 이력.
- `docs/kangsaem-requests.md`, `docs/cloudy-requests.md`: 작업 요청 큐.
- `docs/v-reviews/`: V 리뷰. 관련 작업 시작 전 OPEN 항목을 확인한다.
- `docs/ai-collaboration-protocol.md`: X/루멘/지니/V 협업 규칙.
- `prompt_plan.md`: 현재 마일스톤과 다음 작업 흐름.

## 주요 코드 위치

- `src/lib/supabase.ts`: Supabase 클라이언트.
- `src/lib/db/`: DB 쿼리 도메인별 분리. `subjects`, `quiz`, `worksheets`, `user-data`, `analytics`, `community-db`, `review-db`, `admin-auth`, `profile`, `sync`.
- `src/lib/db/index.ts`: 기존 `@/lib/db` import 호환용 barrel.
- `src/app/layout.tsx`: 루트 레이아웃. Server Component 구조만 담당한다.
- `src/components/layout/LayoutProviders.tsx`: ThemeProvider, Header 등 client 위젯 통합.
- `src/components/BetaFeedbackWidget.tsx`: 베타 피드백 위젯. 베타 종료 시 제거 대상.
- `src/app/api/feedback/route.ts`: Discord webhook 연동 피드백 POST API.
- `src/lib/content/`: 개념/구조/URL 유틸.
- `src/lib/quiz/`: 퀴즈 로직.
- `src/lib/study/`: 학습 진도, 배지, XP, 미션, 약점 과목 계산.
- `src/lib/kice/`: 기출 데이터와 기출↔개념 양방향 매핑.
- `scripts/audit-content-gap.mjs`: 콘텐츠 분포와 KICE 갭 감사.
- `scripts/batch-generate.mjs`: AI 배치 문항 생성.
- `data/terminology/nise-dictionary.json`: NISE 용어사전.
- `data/terminology/kice-terms.json`: KICE 기출 키워드.
- `data/kice-기출/`: KICE 기출문제.
- `src/content/concepts/`: MDX 개념학습 파일.

## Supabase 규칙

- Service role key는 `scripts/`와 admin API route의 `createServiceClient()`에서만 사용한다. 절대 커밋하지 않는다.
- 클라이언트는 `src/lib/supabase.ts`의 anon key를 기본으로 쓴다.
- API 키 인증이 필요한 서버/admin 작업은 `createServiceClient()` 패턴을 따른다.
- 전체 fetch는 `.limit(10000)`을 명시한다. PostgREST 기본 limit은 1,000이다.
- RLS는 읽기 공개, 쓰기는 service role 또는 auth 필요를 기본으로 본다.
- 스키마 변경은 `docs/contract.md` 수정 + 카이란 승인 전에는 구현하지 않는다.
- 환경변수: `DISCORD_WEBHOOK_URL`, `ADMIN_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`.
- GitHub Actions Secret: `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## 아키텍처 요점

- 상태 관리는 Zustand 스토어를 사용한다: `useStudyStore`, `useLeitnerStore`, `useQuizStore`, `useBookmarkStore`, `useFocusStore`, `useOnboardingStore`.
- 주요 라우트: `/`, `/today`, `/quiz/ox`, `/quiz/short`, `/terms`, `/practice`, `/daily`, `/concepts`, `/community`, `/bookmarks/quiz`, `/diagnosis`, `/practice-hub`, `/my`, `/record`, `/mastery`, `/stats`, `/flashcards`.
- 허브 페이지 패턴: `/diagnosis`, `/practice-hub`, `/today`는 메뉴가 아니라 도착지 페이지로 설계한다.
- 진단 완료 시 최약점 과목은 `useFocusStore.setFocus()`로 자동 반영된다. `focusMode === 'user'`이면 덮어쓰지 않는다.
- `/daily`는 홈 메인 버튼에서만 접근한다. 네비에는 노출하지 않는다.
- MDX 컴포넌트 API: `FillBlank`는 `text`, `MatchingExercise`는 `items` prop을 쓴다.
- 새 UI는 가능한 `src/lib/db/`를 사용한다. 일부 기존 페이지는 `src/data/` TS 파일을 참조한다.
- `src/lib/` 도메인은 `content/`, `db/`, `kice/`, `quiz/`, `study/` 하위 디렉토리와 barrel export를 쓴다.
- `/record`는 RecordDashboard, `/mastery`는 LearningDashboard, `/my`는 대시보드 허브다.
- `/kice`는 기출문제/출제분석 2탭 구성이다.

## 코딩 규칙

- Zustand selector에서 `s => s.getStats()`처럼 매 렌더 새 객체를 반환하는 호출을 직접 쓰지 않는다. `s => s.getStats().dueToday`처럼 primitive만 추출하거나 `useShallow`를 쓴다.
- `console.log`는 금지한다. lint 에러로 본다.
- 하드코딩 대신 `process.env.XXX`를 사용한다.
- `generateStaticParams`는 raw 값을 반환한다. `encodeURIComponent`를 넣지 않는다.
- 파일 800줄, 컴포넌트 500줄, 함수 50줄 초과 시 분리를 검토한다.
- 새 컴포넌트는 Server Component 우선이다. 상호작용이 필요할 때만 `'use client'`.
- `'use client'` page.tsx에서는 `export const dynamic`이 prerender에서 무시될 수 있다. force-dynamic이 필요하면 Server Component wrapper + `*Client.tsx`로 분리한다.
- API Route 입력 검증은 Zod 스키마를 쓴다.
- 접근성은 WCAG 2.1 AA 기준을 유지한다. 버튼 `aria-label`, 이미지 `alt`, `focus-visible` 스타일을 확인한다.
- `src/app/global-error.tsx`는 루트 레이아웃 에러 처리 특성상 인라인 스타일을 허용한다.
- `experimental.optimizePackageImports: ['lucide-react']`는 webpack 모듈 분할과 충돌해 SSG prerender 실패를 유발하므로 재활성화하지 않는다.
- force-dynamic 필수 페이지 목록은 빌드 안정성 보호 장치다. 제거하거나 축소할 때는 clean build로 검증한다.
- 카드 전체 클릭 + 독립 버튼 공존은 overlay link 패턴(`absolute inset-0 z-0` anchor + `relative z-10` button)을 사용한다.
- Server Component에서 JSON 정적 데이터는 `readFileSync` 대신 정적 import를 사용한다.
- `'use client'` 컴포넌트 텍스트는 `curl | grep`로 검증하지 않는다. Playwright MCP로 렌더링을 확인한다.
- `foo.ts`를 `foo/index.ts`로 분리할 때는 기존 `foo.ts`를 먼저 삭제한다. TypeScript는 파일을 디렉토리보다 우선 resolve한다.
- type re-export 파일은 IDE import 정리 훅이 미사용 re-export를 삭제할 수 있으므로 변경 후 즉시 빌드로 확인한다.
- 로컬 라우트 500은 코드 수정 전 `.next` 캐시 부패부터 배제한다.
- SSG prerender 에러는 타입 에러가 마스킹할 수 있다. 타입부터 해결한다.
- Supabase 마이그레이션 파일명은 `YYYYMMDDHHMMSS` 타임스탬프를 쓴다.
- Vercel HTTP 200은 렌더링 성공을 의미하지 않는다. Error boundary fallback 여부를 Playwright로 확인한다.
- FK 제약 추가 전 `information_schema.table_constraints`로 기존 제약과 PK/UNIQUE 상태를 확인한다.

## force-dynamic 주의 페이지

다음 페이지는 webpack 번들 분할 불일치로 SSG prerender `call` TypeError가 날 수 있어 force-dynamic 또는 SC wrapper 패턴을 유지한다:

`/`, `login`, `record`, `terms`, `community`, `concepts`, `concepts/[subject]`, `daily`, `diagnosis`, `flashcards`, `flashcards/add`, `flashcards/review`, `interactive`, `kice`, `mastery`, `onboarding`, `practice-hub`, `quiz`, `quiz/[subject]`, `quiz/ox`, `quiz/short`, `scenarios`, `search`, `subjects`, `today`, `today/answers`, `worksheets`, `wrong-notes`, `wrong-notes/quiz`, `bookmarks/quiz`, `admin/editor/[id]`.

`interactive`, `onboarding`, `scenarios`, `flashcards/review`처럼 client 페이지였던 곳은 Server Component wrapper + Client 분리 패턴을 유지한다.

## 관련 프로젝트

- Knowledge Hub: `~/Projects/knowledge-hub/`
- GitHub: `gimbabheaven26-creator/knowledge-hub`
- URL: https://gimbabheaven26-creator.github.io/knowledge-hub/
- 동기화: `bash ~/Projects/knowledge-hub/scripts/sync-from-sew.sh`

## 노션 기록

커밋 전 현재 훅 기준 `~/.claude/notion-pending.json`을 작성한다.

```json
{
  "destination": "sprint",
  "title": "X/루멘 기능명 (2026-MM-DD)",
  "agent": "X 또는 루멘",
  "status": "완료",
  "commit": "해시",
  "tags": ["X", "루멘", "특수교육웹"],
  "content": "## 완료\n- ..."
}
```

커밋하면 훅이 자동으로 노션 스프린트 로그 DB에 POST한다.

