# SEW Next User Validation Playbook

Date: 2026-05-30
Service URL: `https://special-education-next-gimbabheaven26-8005s-projects.vercel.app/`
Fallback URL: `https://special-education-next-gimbabheaven26-8005s-projects.vercel.app/next`

## Purpose

This playbook connects the next three moves:

1. validate the current SEW Next learning model with real users
2. treat the separate deployment root (`/`) as the product entry point
3. choose a cleaner custom domain after the first validation signal

The goal is not to prove that every feature is finished. The goal is to learn whether special-education exam candidates understand the promise, can start a meaningful session, and believe the result loop can improve their score.

## Participant Fit

Run the first round with 3 people:

- 2 active special-education teacher exam candidates
- 1 recent candidate, teacher, or tutor who understands the exam structure

Avoid explaining SEW Next before the test. Send only the URL and the task prompt.

## 20-Minute Session

### 0-2 minutes: first impression

Prompt:

> Open this URL and say out loud what you think this service is trying to help you do.

Record:

- Do they understand it is for special-education teacher exam preparation?
- Do they notice readiness, mock exam, or weak-area prescription without help?
- Which phrase do they repeat back?

Pass signal:

- They can explain the service in one sentence without the facilitator naming features.

### 2-7 minutes: cockpit comprehension

Task:

> Find what you would do first if you had 20 minutes today.

Record:

- First clicked item
- Whether they choose full mock, high-risk check, or result review
- Any hesitation caused by labels, density, or unfamiliar terms

Pass signal:

- They can choose one next action within 30 seconds and explain why.

### 7-14 minutes: exam-like practice

Task:

> Start the full mock mode. You do not need to finish all 23 questions. Answer the first question and explain whether the mode feels like real exam preparation.

Record:

- Can they find `실전형 23문항 시작` from root?
- Do they understand 전공A/B, 180분, 80점, and question palette?
- Does the explanation feel useful or too generic?

Pass signal:

- They understand why a 23-question mode exists and can submit one answer without guidance.

### 14-18 minutes: result loop

Task:

> Go to the results page and tell me what you would study next.

Record:

- Can they find Next-owned results?
- Do they understand recent session flow and 전공A/B trends?
- Do prescriptions feel specific enough to act on?

Pass signal:

- They can name one next study action from the results page.

### 18-20 minutes: value check

Ask:

- Would this help you raise your score more than a normal quiz site?
- What one thing would make you trust it more?
- Would you come back tomorrow? Why or why not?

## Scoring

Use a 0-2 score for each dimension.

| Dimension | 0 | 1 | 2 |
| --- | --- | --- | --- |
| Positioning | Cannot tell what it is | Understands after scrolling/help | Understands immediately |
| First action | Cannot choose | Chooses after hesitation | Chooses quickly with reason |
| Exam fit | Feels like generic quiz | Some official exam cues noticed | Clearly feels exam-oriented |
| Result value | Result feels decorative | Result is understandable | Result suggests a concrete next action |
| Return intent | No reason to return | Might return before exam | Wants to use tomorrow |

Decision rule:

- 8-10: proceed to root polish and custom domain
- 5-7: fix comprehension and result specificity before more features
- 0-4: revisit the product frame before implementation depth

## Domain Direction

Do not buy or connect a domain until the first 3-user round is scored. Candidate names need registrar availability checks before purchase.

Preferred structure if we control an existing domain:

- `next.<existing-domain>`
- `lab.<existing-domain>`
- `exam.<existing-domain>`

Standalone candidates to verify:

- `sewnext.kr`
- `sewnext.app`
- `specialexam.kr`
- `specialteacher.app`
- `teachready.kr`

Recommendation:

Use the current Vercel root URL for the first validation round. If score is 8 or higher, connect `next.<existing-domain>` if an owned domain exists; otherwise verify `sewnext.kr` and `sewnext.app` availability before buying anything.

## Evidence To Collect

For each participant, save:

- date and participant type
- device type
- score table
- first clicked action
- direct quote for the service promise
- one trust blocker
- one must-fix UX issue

Summarize results in `docs/reviews/lumen/YYYY-MM-DD-sew-next-user-validation-results.md`.
