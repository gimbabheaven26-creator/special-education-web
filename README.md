# 특수교육 공부방

특수교육 임용고시 대비 학습 플랫폼 — 퀴즈, 기출분석, 오답노트, 플래시카드

배포: https://special-education-web.vercel.app

## 스택

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS v4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **상태 관리**: Zustand v4
- **테스트**: Vitest, Playwright (E2E)

## 개발 시작

```bash
npm install
cp .env.local.example .env.local   # 환경변수 설정
npm run dev                         # localhost:3000
```

## 주요 명령어

```bash
npm run dev          # 개발 서버
npm run build        # 프로덕션 빌드 (배포 전 필수)
npm run lint         # ESLint
npm run test         # Vitest 단위 테스트
npm run test:e2e     # Playwright E2E
```

## 환경변수 (.env.local)

| 변수 | 필수 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | 스크립트 전용 | 데이터 삽입 시 사용 |
| `DISCORD_WEBHOOK_URL` | 선택 | 베타 피드백 Discord 알림 |

## 에이전트 역할

| 에이전트 | 담당 |
|---------|------|
| **X** | 실행: 코드 빌드, 데이터 파이프라인, 전략, 상담 (4모드 자동 전환) |
| **V** | 검증: 코드 리뷰, 보안 감사, 데이터 정합성, E2E 검증 |

> 에이전트 협업 규칙: `CLAUDE.md` 참고
