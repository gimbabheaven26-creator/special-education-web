# Ieumjin FBA Practice Loop Design

## Goal

Turn the FBA term lens from a readable source map into a small, judgeable learning loop: write an answer, receive rubric-based coaching, solve an analogous prompt, and reserve a spaced review.

## Scope

This slice stays inside `/terms?q=기능적 행동평가`. It does not add a new route, database table, API contract, or Classic dependency. The loop uses the existing FBA seed and a deterministic rubric evaluator so the experience can be verified locally before real AI generation is connected.

## Product Shape

- `기출 답안 작성`: user writes a short response against the representative 2019 전공A 14번 DNA.
- `이음진 코치`: rubric feedback shows score, matched criteria, missing criteria, and next action.
- `동형문제 풀이`: user answers the existing analog seed as a second prompt.
- `복습 예약`: user saves a 1/3/7-day review reservation to localStorage.

## Architecture

- Extend `TermLens` with `practiceLoop` data in `data/ieumjin/term-seeds/fba.json`.
- Add `src/lib/ieumjin/practice-feedback.ts` as a pure, tested evaluator.
- Add `src/app/terms/TermPracticeClient.tsx` as the only client component.
- Keep `/terms/page.tsx` server-rendered and pass the selected lens into the client component.

## Boundaries

- This is not a real AI API integration yet.
- This does not persist to Supabase.
- The root still exposes only seeded FBA content.
