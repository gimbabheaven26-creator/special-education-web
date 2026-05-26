# SEW Next Greenfield Deployment Plan

Date: 2026-05-26
Branch: `codex/next-greenfield`

## Decision

SEW Next is a separate greenfield service, not a gradual merge into Classic.

Classic remains the stable production app on `main`. SEW Next moves on `codex/next-greenfield` and is deployed as a separate Vercel project. Shared DB/content utilities may be reused, but Classic user-facing routes must not become the default surface for Next product loops.

## Deployment Shape

Recommended Vercel setup:

- Classic project: deploys `main`
- SEW Next project: deploys `codex/next-greenfield`
- SEW Next URL: separate Vercel project domain first, custom subdomain later
- Build command: `npm run build`
- Install command: `npm ci`
- Framework preset: Next.js

Initial SEW Next can keep the existing `/next` route while the branch is isolated. Once the service shape is stable, the branch should promote Next to the root experience for its own deployment. Until then, the separate deployment URL can open `/next` directly for validation.

## Boundary Rules

Default allowed areas for SEW Next work:

- `src/app/next/**`
- `src/lib/sew-next/**`
- `tests/e2e/sew-next.spec.ts`
- Next-only docs under `docs/reviews/lumen/*sew-next*` or `docs/next-*`

Classic routes require explicit approval before editing:

- `src/app/record/**`
- `src/app/my/**`
- `src/app/today/**`
- `src/app/quiz/**`
- `src/app/kice/**`
- shared layout/navigation files

If Next needs a record, result, or dashboard surface, create a Next-owned route such as `/next/results` or `/next/record` instead of extending Classic `/record`.

## Current Next Assets

Already available in the branch:

- `/next`: readiness cockpit and command board
- `/next/qbank`: DB-backed qbank filter builder
- `/next/practice`: adaptive, custom, mock, and review sessions
- full mock: 23 questions, 180 minutes, 80 points, 전공A/B structure
- `src/lib/sew-next/readiness.ts`: readiness snapshot from local data
- `src/lib/sew-next/qbank.ts`: DB question filtering and practice conversion
- `src/lib/sew-next/mock-exam.ts`: mock session and report logic
- `src/lib/sew-next/exam-blueprint.ts`: official exam paper metadata
- `src/lib/sew-next/session-sync.ts`: current user_data sync bridge

## Separation Work

Next branch should undo Classic coupling before adding more product depth:

1. Move Next record/report loops out of Classic `/record`.
2. Add `/next/results` or `/next/record` for full mock trends, paper-level prescriptions, and resume links.
3. Replace `/next` navigation links to Classic surfaces with Next-owned destinations where possible.
4. Keep Classic links only as explicit bridge links, not primary user journeys.

## Data Policy

Phase 1 can read existing quiz/content data from the current Supabase schema.

Writes should be separated before production launch:

- localStorage keys should stay under `sew-next-*`
- server persistence should use either a Next-owned namespace inside `user_data` or a future Next-specific table
- Classic stores should not be the long-term source of truth for Next learning state

## Validation Gates

Before pushing SEW Next branch changes:

- `npm run lint`
- `npm run test`
- `npm run test:e2e -- tests/e2e/sew-next.spec.ts --project=chromium`
- `NEXT_PRIVATE_BUILD_WORKER=0 npm run build`

Before changing any Classic route from the Next branch:

- document the reason
- add targeted Classic regression coverage
- get explicit approval

## Immediate Next Step

Create the first branch commit with this plan, then start the separation work by moving Classic `/record` Next-specific UI into a Next-owned results route.
