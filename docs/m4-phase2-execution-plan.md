# M4 Phase 2 Execution Plan

> 작성: 2026-05-11 | 담당: Codex | 기준 데이터: `node scripts/audit-content-gap.mjs --json`

## Current Gap

| Area | Current | Target | Minimum Action |
|------|---------|--------|----------------|
| Total quiz questions | 3,119 | - | Baseline |
| Introduction | 348 / 11.2% | KICE 24%, contract threshold >= 14% | Add at least 104 introduction questions |
| Laws | 412 / 13.2% | KICE 20%, practical threshold >= 15% | Add about 66 laws questions |
| Scenario composite | 3 | Contract threshold >= 10 | Add at least 7 scenario_composite questions |
| KICE missing frequent topics | Not fully covered | 8 of 16 topics covered | Generate 2-3 drafts per selected topic |

## Execution Strategy

Phase 2 should optimize for contract pass first, not full ratio parity.

1. Generate 120 introduction drafts.
   - Target: 장애유형별 특성, 통합교육 원리, IEP, 특수교육 관련서비스, 가족지원, 보조공학.
   - Command pattern: `node scripts/batch-generate.mjs --subject introduction --type fill_in --count 5`

2. Generate 70 laws drafts.
   - Target: 특수교육법 총칙, 선정/배치, IEP 법정 절차, 관련서비스, 순회교육, 전공과.
   - Command pattern: `node scripts/batch-generate.mjs --subject laws --type ox --count 5`

3. Cover at least 8 KICE frequent topics.
   - Suggested first 8: 점자, 보행훈련, 뇌성마비, 청력검사, AAC, 긍정적 행동지원, 기능적 행동평가, 전환교육.
   - Generate 2-3 drafts per topic, then keep only the best after review.

4. Generate 7-10 scenario_composite drafts.
   - These should be generated one at a time because the route intentionally forces scenario_composite count to 1.
   - Prioritize KICE 4-point patterns and classroom cases.

## Cost Estimate

Pricing basis: Google Gemini API official pricing page for `gemini-2.5-flash`, paid tier, text input $0.30 per 1M tokens and output $2.50 per 1M tokens.

Conservative estimate:

| Batch | Drafts | Input Tokens | Output Tokens | Estimated Cost |
|-------|--------|--------------|---------------|----------------|
| Standard questions | 200 | 300k | 140k | about $0.44 |
| Scenario composite | 10 | 25k | 12k | about $0.04 |
| Retry / discard buffer 2x | - | 650k | 304k | about $0.96 |

Practical budget: keep the first Phase 2 pass under $2 API cost. The actual bottleneck is Kaiyan review time, not Gemini tokens.

## Operating Rule

Generate small batches, then review.

- 5 drafts per batch for normal question types.
- 1 draft per batch for scenario_composite.
- Stop after every 25-30 saved drafts and run `node scripts/audit-content-gap.mjs --json`.
- Do not approve drafts directly into student-facing content; keep `ai_status='draft'` until human review.

## Completion Check

Run these checks after generation and review:

```bash
node scripts/audit-content-gap.mjs --json
npm run test
npm run build
```

Phase 2 passes when:

- Introduction ratio is at least 14%.
- At least 8 selected KICE frequent topics have approved or draft coverage.
- `scenario_composite` count is at least 10.
