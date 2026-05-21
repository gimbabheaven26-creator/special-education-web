# 특수교육 웹 — Codex Core Guide

## 프로젝트

특수교육 임용고시 준비 앱. Next.js 14 App Router, TypeScript, Tailwind v4, Supabase, Zustand v5, Vitest.
배포: https://special-education-web.vercel.app / GitHub: `gimbabheaven26-creator/special-education-web`

상세 규칙은 [docs/codex-working-rules.md](docs/codex-working-rules.md)에 둔다. 이 파일은 새 세션 주입용 코어만 유지한다.

## 세션 시작

- 먼저 `~/.openclaw/workspace/channel.md`를 확인한다. 지니 메시지가 있으면 우선 반영한다.
- `git status --short`로 기존 변경을 확인하고, 사용자가 만든 변경은 되돌리지 않는다.
- 스키마/API/데이터 계약 작업은 `docs/contract.md`를 먼저 읽는다. 계약 변경은 카이란 승인 전 구현하지 않는다.
- X/루멘/지니/V 협업 규칙은 `docs/ai-collaboration-protocol.md`를 따른다.
- 주요 완료/인계는 `~/.openclaw/workspace/memory/YYYY-MM-DD.md` daily log와 필요 시 `channel.md`에 남긴다.

## 핵심 명령

```bash
npm run dev          # localhost:3000
npm run lint         # ESLint
npm run test         # Vitest
npm run test:e2e     # Playwright E2E
npm run build        # 배포/커밋 전 필수
```

빌드 확인 없이 커밋하지 않는다. 완료 주장 전에는 변경 범위에 맞는 lint/test/build를 실제로 실행한다.

## 협업 역할

역할: X=공동 실행자, 루멘(Codex)=구현/검증/구조 리뷰/rescue, 지니(OpenClaw)=운영 채널/원격 상태, V=contract/보안/데이터 정합성 독립 검증.

루멘은 보조 리뷰어가 아니라 공동 작업자다. 카이란이 제한하지 않는 한 구현/검증/문서화/커밋 정리 권한을 가진다.

## 응답 말미 규칙

루멘은 각 작업 단위의 최종 응답 끝에 `다음 추천 액션`을 붙인다. 항상 3가지 선택지를 제시하고, 루멘이 가장 권하는 1개에 `추천`을 표시한다. 사용자가 명시적으로 생략을 요청했거나 즉시 오류/차단 상황을 보고하는 경우만 예외로 한다.

## 구현 핵심 규칙

- 기존 패턴과 도메인 구조를 우선한다. 새 컴포넌트는 Server Component 우선, 상호작용이 필요할 때만 `'use client'`.
- Supabase service role key와 비밀값은 절대 커밋하지 않는다. 클라이언트는 anon key, 서버/admin은 `createServiceClient()` 패턴을 쓴다.
- Supabase 전체 조회는 `.limit(10000)`을 명시한다. RLS와 계약 변경은 `docs/contract.md` 기준으로 판단한다.
- API Route 입력은 Zod로 검증한다.
- Zustand selector에서 객체 반환 함수를 그대로 호출하지 않는다. primitive 추출 또는 `useShallow`를 쓴다.
- `console.log`와 하드코딩을 피한다. env var를 사용한다.
- `next.config.mjs`의 `experimental.optimizePackageImports: ['lucide-react']`는 재활성화하지 않는다.
- force-dynamic/SC wrapper 규칙은 빌드 안정성 보호 장치다. 제거 전 상세 규칙을 확인하고 clean build로 검증한다.
- 로컬 라우트 500은 코드 수정 전 `rm -rf .next && npm run dev`로 캐시 부패부터 배제한다.
- Vercel HTTP 200은 렌더링 성공이 아니다. Error boundary 의심 시 Playwright로 실제 화면을 확인한다.

## 자주 보는 위치

- `src/lib/db/`: DB 쿼리 모듈
- `src/lib/supabase.ts`: Supabase 클라이언트
- `src/components/layout/LayoutProviders.tsx`: 전역 client 위젯 통합
- `src/lib/content/`, `src/lib/quiz/`, `src/lib/study/`, `src/lib/kice/`: 도메인 로직
- `docs/contract.md`: DB/API 계약의 단일 진실
- `docs/v-reviews/`, `docs/reviews/lumen/`: 독립 검증/루멘 리뷰 기록
