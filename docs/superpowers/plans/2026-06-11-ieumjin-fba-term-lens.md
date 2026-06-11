# Ieumjin FBA Term Lens Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first clean-room 이음진 vertical slice by connecting the FBA term seed, a read-only term lens domain module, and the `/terms?q=기능적 행동평가` page.

**Architecture:** Keep the seed as static data under `data/ieumjin/term-seeds/`, expose it through a focused `src/lib/ieumjin/term-lens.ts` reader, and make `/terms` render a lens from that reader instead of hardcoded page-local missions. This keeps Classic routes and legacy UI out of the first 이음진 learning experience.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, static JSON seed data.

---

## Chunk 1: FBA Seed And Domain Reader

### Task 1: Add the failing domain tests

**Files:**
- Create: `src/lib/ieumjin/__tests__/term-lens.test.ts`

- [x] Test that `getTermLensByQuery('기능적 행동평가')` returns the FBA lens.
- [x] Test that the returned lens includes NISE source `383398`, representative KICE ref `2019/전공A/14`, and the 20-minute sequence.
- [x] Test that unknown queries fall back to the FBA lens.

### Task 2: Add the FBA term seed and reader

**Files:**
- Create: `data/ieumjin/term-seeds/fba.json`
- Create: `src/lib/ieumjin/term-lens.ts`
- Create: `src/lib/ieumjin/index.ts`

- [x] Encode the manually curated FBA seed from existing SEW data.
- [x] Define focused TypeScript types for source refs, concept refs, KICE refs, exam DNA, and 20-minute steps.
- [x] Read the seed statically and expose `getTermLensByQuery`.

## Chunk 2: Terms Page Lens Rendering

### Task 3: Replace hardcoded missions with the FBA lens

**Files:**
- Modify: `src/app/terms/page.tsx`

- [x] Remove page-local `missions` data.
- [x] Render the selected lens from `getTermLensByQuery`.
- [x] Surface source-backed definition, concept bridge, representative 기출 DNA, 동형문제 씨앗, and 20-minute flow.
- [x] Keep the page clean-room: no Classic links, no old search form, no `/concepts` or `/kice` route handoff.

## Chunk 3: Verification

### Task 4: Verify implementation

**Commands:**
- [x] `npm run test -- src/lib/ieumjin/__tests__/term-lens.test.ts src/app/terms/__tests__/page.test.tsx`
- [x] `npm run lint`
- [x] `npm run test`
- [x] `PLAYWRIGHT_PORT=3105 NEXT_PUBLIC_IEUMJIN_SITE_URL=http://localhost:3105 npm run test:e2e -- tests/e2e/home.spec.ts --project=chromium`
- [x] `npm run build`
- [x] Browser smoke for `/terms?q=기능적 행동평가`
