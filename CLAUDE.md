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

## 에이전트 역할 분리

| 에이전트 | 담당 | 금지 |
|---------|------|------|
| **강선생** | `src/` 컴포넌트, 페이지, 훅, 스타일 | DB 스키마 직접 변경 |
| **클루디** | `scripts/`, `data/`, Supabase 데이터 삽입, DB 마이그레이션 | UI 코드 수정 |

두 에이전트가 동시에 작업할 때 **`docs/contract.md`가 유일한 진실의 원천**.
스키마/API 변경 → contract.md 먼저 수정 → 카이란 승인 → 구현.

---

## 중요 파일 경로

```
src/lib/supabase.ts        # Supabase 클라이언트
src/lib/db.ts              # DB 쿼리 함수 (강선생 읽기용)
src/app/layout.tsx         # 루트 레이아웃 (전역 컴포넌트 마운트)
src/components/BetaFeedbackWidget.tsx  # 베타 피드백 위젯 (전역, 베타 기간 한정)
src/app/api/feedback/route.ts          # Discord webhook 연동 피드백 POST API

docs/contract.md           # DB 스키마 + API 계약 (변경 전 반드시 읽기)
docs/changelog.md          # 변경 이력
docs/kangsaem-requests.md  # 강선생 작업 요청 큐
docs/cloudy-requests.md    # 클루디 작업 요청 큐
docs/v-reviews/            # V(외부 검증) 리뷰 파일 — 세션 시작 시 OPEN 항목 확인 필수

scripts/insert-with-service-key.mjs  # Supabase 데이터 삽입 패턴
data/terminology/nise-dictionary.json  # NISE 용어사전 1129개
data/terminology/kice-terms.json       # KICE 기출 키워드 1417개
data/kice-기출/                         # KICE 기출문제 (2016~2026)
src/content/concepts/                  # MDX 개념학습 파일 (101개)
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
데이터: 11과목, 39챕터, 2061퀴즈, 33토픽, 324워크시트
```

---

## 아키텍처 요점

- **상태 관리**: Zustand 4개 스토어 (`useStudyStore`, `useLeitnerStore`, `useQuizStore`, `useBookmarkStore`)
- **라우팅**: App Router. 주요 페이지: `/`, `/quiz/ox`, `/quiz/short`, `/terms`, `/practice`, `/daily`, `/concepts`, `/community`
- **오늘학습 `/daily`**: 홈 메인 버튼에서만 접근 (네비 미노출)
- **MDX 컴포넌트 API**: `FillBlank` = `text` prop, `MatchingExercise` = `items` prop
- **`src/data/` TS 파일**: 기존 페이지 참조 중 — 새 UI는 `src/lib/db.ts` 사용
- **피드백 API** `POST /api/feedback`: Discord webhook 연동, rate limit IP당 3회/분, `DISCORD_WEBHOOK_URL` env var 필요
- **BetaFeedbackWidget**: 베타 기간 한정 전역 위젯 — `src/app/layout.tsx`에 마운트, 베타 종료 시 제거 필요

---

## 코딩 규칙

- `console.log` 금지 (린트 에러)
- 하드코딩 금지 — env var 사용 (`process.env.XXX`)
- `generateStaticParams`: raw 값 반환 필수 (encodeURIComponent 금지)
- 파일 800줄, 컴포넌트 500줄, 함수 50줄 초과 시 분리
- 새 컴포넌트: Server Component 우선, 상호작용 필요 시 `'use client'`
- **API Route 입력 검증**: Zod 스키마 필수 (`z.string().min(N).max(N)` 등)
- **접근성**: WCAG 2.1 AA 기준 — 모든 버튼에 `aria-label`, 이미지에 `alt`, `focus-visible` 스타일 유지

---

## 현재 마일스톤 (M1: 2026-03-25~31)

**감성 UX & 시스템 안정** (릴리 제언 기반)
- [x] Vercel Analytics + Speed Insights 연동 (c749376, 2026-03-25)
- [x] BetaFeedbackWidget + Discord 알림 (3898c54, 2026-03-25)
- [x] 로딩 스켈레톤 — quiz/ox, terms, concepts (6764ead, 2026-03-25)
- [x] 에러/빈 상태 UI — error.tsx 12개, not-found.tsx, EmptyState (6764ead, 2026-03-25)
- [x] WCAG 2.1 AA 접근성 기초 — aria-label 7곳, focus-visible, min-h-44px (6764ead, 2026-03-25)

> M1 Day 1 전체 완료 (2026-03-25). Day 2~7 잔여 작업은 스프린트 계획 참조.

---

## 노션 기록 (커밋 시 자동)

커밋 전 `~/.claude/notion-pending.json` 작성:
```json
{
  "destination": "sprint",
  "title": "강선생1 기능명 (2026-MM-DD)",
  "agent": "강선생1",
  "status": "완료",
  "commit": "해시",
  "tags": ["강선생", "특수교육웹"],
  "content": "## 완료\n- ..."
}
```
커밋하면 훅이 자동으로 노션 스프린트 로그 DB에 POST.
