# SEW Next Prototype Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first zero-base SEW Next prototype at `/next`, separate from the existing Classic home flow.

**Architecture:** Add a static prototype data module and a focused client cockpit component rendered by a server route. The prototype models AMBOSS/UWorld-style readiness, qbank practice, explanation review, spaced review, mock exam, and AI coaching without touching production data contracts.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, lucide-react, existing `cn` helper.

---

## File Structure

- Create: `src/lib/sew-next/prototype-data.ts`
  - Holds typed prototype metrics, navigation items, weak domains, practice modes, explanation panels, review queue, and roadmap milestones.
- Create: `src/app/next/page.tsx`
  - Server Component route entry with `force-dynamic` and metadata.
- Create: `src/app/next/SewNextLab.tsx`
  - Client Component for the interactive cockpit: mode selector, readiness view, session preview, AI coach, review loop, and milestone rail.
- Create: `tests/e2e/sew-next.spec.ts`
  - Playwright checks for the readiness cockpit and practice mode interaction.
- Create: `docs/superpowers/plans/2026-05-19-sew-next-prototype.md`
  - This execution plan.
- Modify: `docs/2026-05-19-sew-next-product-blueprint.md`
  - Already created as the strategic source for this prototype.

## Chunk 1: Route And Data Skeleton

### Task 1: Add Typed Prototype Data

**Files:**
- Create: `src/lib/sew-next/prototype-data.ts`

- [x] **Step 1: Define route-level domain types**

Add union types for readiness status, mode ids, and content groups so the UI cannot drift into free-form string states.

- [x] **Step 2: Add sample AMBOSS/UWorld-style data**

Include readiness metrics, weak areas, daily prescription, practice modes, explanation blocks, spaced-review items, AI interventions, and roadmap phases.

- [x] **Step 3: Type-check locally through the app build**

Run: `NEXT_PRIVATE_BUILD_WORKER=0 npm run build`

Expected: Build completes without TypeScript errors.

## Chunk 2: `/next` Cockpit UI

### Task 2: Build First-Screen Cockpit

**Files:**
- Create: `src/app/next/page.tsx`
- Create: `src/app/next/SewNextLab.tsx`

- [x] **Step 1: Add server route wrapper**

Export metadata and `dynamic = 'force-dynamic'`, then render `SewNextLab`.

- [x] **Step 2: Build readiness-first layout**

Show readiness score, exam risk, next prescribed session, weak blueprint domains, and mock exam readiness above the fold.

- [x] **Step 3: Add interactive mode switch**

Use a client state union for `adaptive`, `custom`, `mock`, and `review`. Each mode updates the session panel and preserves accessible button states.

- [x] **Step 4: Add AI as an embedded assistant, not a separate feature**

Place answer coach, Socratic hint, weekly briefing, and item generator inside the study workflow panels.

- [x] **Step 5: Add roadmap rail**

Show N0-N5 milestones so the prototype communicates where the new branch is heading.

## Chunk 3: Verification And Commit

### Task 3: Verify And Commit

**Files:**
- Stage only the new SEW Next documents and route files.

- [x] **Step 1: Run whitespace check**

Run: `git diff --check`

Expected: no output.

- [x] **Step 2: Run lint**

Run: `npm run lint`

Expected: exit 0.

- [x] **Step 3: Run E2E for `/next`**

Run: `npx playwright test tests/e2e/sew-next.spec.ts --project=chromium`

Expected: exit 0.

- [x] **Step 4: Run production build**

Run: `rm -rf .next && NEXT_PRIVATE_BUILD_WORKER=0 npm run build`

Expected: exit 0.

- [ ] **Step 5: Commit**

Run:

```bash
git add docs/2026-05-19-sew-next-product-blueprint.md docs/superpowers/plans/2026-05-19-sew-next-prototype.md src/app/next/page.tsx src/app/next/SewNextLab.tsx src/lib/sew-next/prototype-data.ts tests/e2e/sew-next.spec.ts
git commit -m "feat(lumen): add sew next prototype"
```
