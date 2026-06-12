# Ieumjin FBA Practice Loop Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive FBA 20-minute practice loop to the clean-room 이음진 term lens.

**Architecture:** Keep scoring and review scheduling in a pure `src/lib/ieumjin/practice-feedback.ts` module. Render the loop through a focused client component under `src/app/terms/TermPracticeClient.tsx`, while `/terms/page.tsx` remains the server lens shell.

**Tech Stack:** Next.js App Router, React client component, TypeScript, Vitest, Playwright, localStorage.

---

## Chunk 1: Domain Feedback

### Task 1: Add failing evaluator tests

**Files:**
- Create: `src/lib/ieumjin/__tests__/practice-feedback.test.ts`

- [x] Test that a strong FBA answer receives full score and matched rubric items.
- [x] Test that a weak answer returns missing criteria and a low score.
- [x] Test that a review reservation computes a future review date and serializable payload.

### Task 2: Implement evaluator

**Files:**
- Create: `src/lib/ieumjin/practice-feedback.ts`
- Modify: `src/lib/ieumjin/index.ts`
- Modify: `src/lib/ieumjin/term-lens.ts`
- Modify: `data/ieumjin/term-seeds/fba.json`

- [x] Add `practiceLoop` seed data for exam and analog questions.
- [x] Define rubric/question/result types.
- [x] Implement keyword-group scoring and review reservation helpers.

## Chunk 2: Client Practice UI

### Task 3: Add failing component tests

**Files:**
- Create: `src/app/terms/__tests__/TermPracticeClient.test.tsx`

- [x] Test that submitting the 기출 answer shows score feedback and unlocks analog solving.
- [x] Test that submitting the analog answer enables review reservation and writes localStorage.

### Task 4: Implement client component and wire page

**Files:**
- Create: `src/app/terms/TermPracticeClient.tsx`
- Modify: `src/app/terms/page.tsx`
- Modify: `src/app/terms/__tests__/page.test.tsx`

- [x] Add textareas, rubric feedback, analog answer, and review buttons.
- [x] Keep accessible labels for Playwright and unit tests.
- [x] Place the loop after 기출진 and before the static analog seed.

## Chunk 3: End-To-End Verification

### Task 5: Add E2E coverage and verify

**Files:**
- Create: `tests/e2e/ieumjin-practice.spec.ts`

- [x] Test the full loop: answer, score, analog answer, reserve review.
- [x] Run targeted Vitest.
- [x] Run 이음진 Playwright E2E with `NEXT_PUBLIC_IEUMJIN_SITE_URL`.
- [x] Run lint, full test, build, and browser smoke.
