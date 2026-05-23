# SEW Next UX Impact Review

Date: 2026-05-23
Reviewer: Lumen
Target: live deployment, `https://special-education-web.vercel.app`
Evidence: Playwright screenshots in `/tmp/sew-next-ux-review/`

## Summary

SEW Next now has a real loop: readiness cockpit -> qbank filter -> practice -> mock report -> record trend. The product direction is strong because it speaks in the user's actual exam language: readiness, weak blueprint domains, timed mock, and next review. The biggest UX risk is no longer route coverage. It is trust density: some screens expose internal labels or repeat long source explanations in places where the user expects compressed coaching.

There were no P0 conversion blockers in the reviewed SEW Next loop. The most urgent product work is P1: make generated/DB-derived content feel intentionally coached rather than raw database output.

## Journey 1. `/next` Readiness Cockpit

- Wow Point: The page immediately frames the service around exam readiness, not generic quiz taking. "오늘의 처방", high-risk domains, and expected readiness gain make the product feel purposeful.
- Friction: Several labels remain product-internal or prototype-like: `READINESS COCKPIT PROTOTYPE`, `High-risk blueprint domains`, `AI-Human layer`.
- Trust Risk: The numbers feel confident but not yet fully explainable. A user sees `68%`, `+7`, `74%`, and `42분`, but the source of calculation is only lightly described.
- Missed Delight: The cockpit could say "오늘 이 42분이 왜 필요한지" in one short, personal sentence based on recent wrong notes.
- Quick Win: Replace prototype/internal labels with Korean user-facing labels and add one sentence explaining the readiness calculation source.

## Journey 2. `/next/qbank` Custom Qbank Builder

- Wow Point: The new actual DB signal is excellent. "매칭 문항 7개 / 1000개 문항에서 계산" gives immediate confidence that this is not a dummy prototype.
- Friction: Representative question metadata exposes raw or semi-raw labels such as `assessment · fba · 난도 3`.
- Trust Risk: Internal slugs make the product feel less curated, especially on an app for exam candidates who expect polished terminology.
- Missed Delight: When coverage is low, the app warns "커버리지 빈틈 경고" but does not tell the user what to do next.
- Quick Win: Use display labels for subject/chapter metadata and turn coverage warning into an action-oriented sentence.

## Journey 3. Custom Practice Answer Flow

- Wow Point: Real KICE-like questions flowing from the selected qbank filter is a major step. The user can see the chosen filters reflected in the session queue.
- Friction: The selected correct choice expands into a very long explanation inside the answer option, then repeats the same long explanation again in the main explanation and AI coach.
- Trust Risk: Raw long explanations can feel like database dumping, not tutoring. The AI Answer Coach promise is weakened when the "model answer" is not compressed.
- Missed Delight: The app could turn a long explanation into a one-sentence exam judgment rule.
- Quick Win: Add a compact explanation helper for choice rationale and AI coach rewrite, keeping the full explanation in the main explanation block.

## Journey 4. Mock Exam Report

- Wow Point: The timer, domain allocation, and domain-level report make this feel like a real mock workflow rather than a quiz page.
- Friction: On the final question, the primary button still says "제출하고 해설 보기" even after submission. The summary appears automatically below, so the user may not realize the session is complete.
- Trust Risk: "시간 관리 안정" is useful, but the timer currently remains at 03:00 during the smoke flow, so the time label may feel synthetic until real elapsed time is visibly changing.
- Missed Delight: The report could recommend the next exact action: "ABC 기록 2문항 더 풀기" or "관련 법령 IEP 근거 복습".
- Quick Win: After final submission, make the completion state visually explicit near the primary action area.

## Journey 5. `/record` SEW Next Trend

- Wow Point: Recent 3-session trend is a strong retention loop. It tells the user "your SEW Next work is remembered here."
- Friction: Some record copy still reads like a generic progress dashboard, while the new SEW Next card is more exam-specific.
- Trust Risk: The page says "이 기기에서만 유지되는 학습 데이터입니다"; this is honest, but it also weakens confidence for a serious study product unless paired with backup/login guidance.
- Missed Delight: The trend card could include one next action from the weakest recent session, not just percentages.
- Quick Win: Add a small "다음 추천" line under the SEW Next trend based on the lowest recent session.

## Priorities

### P0

No P0 issue found in this SEW Next loop. Live routes rendered and the reviewed journeys were completable.

### P1

1. Compress raw DB explanations in custom practice so the selected choice and AI coach feel tutored, not dumped.
2. Replace internal qbank metadata (`assessment`, `fba`, numeric difficulty) with user-facing labels.
3. Make final mock completion explicit near the action area.

### P2

1. Localize remaining English/prototype labels on `/next`.
2. Add calculation-source copy for readiness metrics.
3. Add a next-action recommendation to `/record`'s SEW Next trend card.
