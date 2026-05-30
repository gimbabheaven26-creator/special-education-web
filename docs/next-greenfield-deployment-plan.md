# SEW Next Greenfield Deployment Plan

Date: 2026-05-26
Branch: `codex/next-greenfield`
Last updated: 2026-05-30

## Decision

SEW Next is a separate greenfield service, not a gradual merge into Classic.

Classic remains the stable production app on `main`. SEW Next moves on `codex/next-greenfield` and is deployed as a separate Vercel project. Shared DB/content utilities may be reused, but Classic user-facing routes must not become the default surface for Next product loops.

## Deployment Shape

Recommended Vercel setup:

- Classic project: deploys `main`
- SEW Next project: deploys `codex/next-greenfield`
- SEW Next URL: `https://special-education-next-gimbabheaven26-8005s-projects.vercel.app/` first, custom subdomain later
- Build command: `npm run build`
- Install command: `npm ci`
- Framework preset: Next.js

SEW Next is now the root experience in the isolated deployment. The existing `/next` route remains as a compatibility URL while old links and smoke tests settle.

## Automation Status

Local automation exists for the separate-project flow:

- `npm run deploy:next-greenfield -- --project <vercel-project> --target preview`
- `npm run verify:next-deploy -- https://<deployment>.vercel.app`

The deploy script:

1. enforces the `codex/next-greenfield` branch unless `--allow-any-branch` is passed
2. runs `npm run lint`, `npm run test`, clears `.next`, and runs `NEXT_PRIVATE_BUILD_WORKER=0 npm run build`
3. links the working directory to the target Vercel project with `vercel link --yes`
4. deploys with `vercel deploy --yes`
5. runs Playwright smoke checks against `/`, `/next`, `/next/results`, and the full mock route

If Vercel Deployment Protection is enabled, enable Protection Bypass for Automation and place the generated secret in `.vercel/automation-bypass-secret` or expose it as `VERCEL_AUTOMATION_BYPASS_SECRET`; `npm run verify:next-deploy` sends the bypass header only to first-party Vercel deployment requests so third-party assets are not affected.

As of 2026-05-30, the Vercel CLI is authenticated, `special-education-next` exists as a separate Vercel project, SEW Next owns the deployment root, and the public production alias smoke should pass on desktop and mobile for `/`, `/next`, `/next/results`, and `/next/practice?mode=mock&variant=full`.

The project-level Vercel Authentication setting is currently disabled for actual user validation. If protection is re-enabled, use Protection Bypass for Automation for smoke tests and do not share preview URLs without either Vercel access or a share/bypass mechanism.

## Vercel Project Bootstrap

Use a separate Vercel Project; do not point the existing Classic production project at `codex/next-greenfield`.

Recommended bootstrap:

```bash
vercel login
npm run deploy:next-greenfield -- --project special-education-next --target preview
```

For a team scope:

```bash
npm run deploy:next-greenfield -- --project special-education-next --team <team-slug> --target preview
```

After the preview smoke passes, configure the SEW Next project in Vercel:

- Production branch: `codex/next-greenfield`
- Install command: `npm ci`
- Build command: `npm run build`
- Output directory: Next.js default
- Framework preset: Next.js
- Initial validation URL: open `/` on the SEW Next deployment domain

Required environment variables should be cloned intentionally from Classic, then edited for the Next project when needed:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SENTRY_DSN`
- `SENTRY_AUTH_TOKEN`
- `SENTRY_ORG`
- `SENTRY_PROJECT`
- `GEMINI_API_KEY`
- `GEMINI_MODEL`
- `ADMIN_API_KEY`
- `DISCORD_WEBHOOK_URL`
- `NOTION_API_KEY`

Do not commit `.vercel/`, `.env.local`, tokens, or copied secrets. Both are ignored by `.gitignore`.

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
- `/`: same readiness cockpit and command board for the isolated SEW Next deployment
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
- `rm -rf .next && NEXT_PRIVATE_BUILD_WORKER=0 npm run build`

Before accepting a SEW Next Vercel deployment:

- `npm run verify:next-deploy -- https://<deployment>.vercel.app`
- confirm `/` renders `SEW Next`
- confirm `/next` renders `SEW Next`
- confirm `/next/results` renders `SEW Next Results`
- confirm `/next/practice?mode=mock&variant=full` renders `실전형 23문항 모드`
- confirm desktop and mobile smoke checks report no horizontal overflow
- confirm no page errors or browser console errors are emitted during smoke

For local `next dev` smoke only, `--allow-rsc-fetch-warnings` may be used to ignore the known Fast Refresh RSC fallback console warning. Do not use that flag as the default Vercel acceptance gate.

Before changing any Classic route from the Next branch:

- document the reason
- add targeted Classic regression coverage
- get explicit approval

## Immediate Next Step

Use the separate production URL for validation:

```bash
npm run verify:next-deploy -- https://special-education-next-gimbabheaven26-8005s-projects.vercel.app
```

User validation script:

- `docs/next-greenfield-user-validation-playbook.md`

For a fresh preview:

```bash
npm run deploy:next-greenfield -- --project special-education-next --target preview
```
