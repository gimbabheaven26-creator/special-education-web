# Full Mock Live UX Review - 2026-05-25

## Scope

- Target: `https://special-education-web.vercel.app`
- Journey:
  1. Open `/next` and switch to mock mode.
  2. Start `/next/practice?mode=mock&variant=full`.
  3. Complete all 23 questions.
  4. Open `/record` and verify persisted trend feedback.

## Result

Live smoke passed.

- `/next` mock mode exposed both entry points:
  - `압축형 8문항`
  - `실전형 23문항`
  - `전공A/B 180분 80점`
- Full mock completed and showed:
  - `Mock Exam 리포트`
  - `시험지별 결과`
  - `다음 처방`
- `/record` reflected the completed session:
  - `Full Mock Exam`
  - `23문제 · 100%`
  - `Mock Exam 전공A/B 추세`
  - `전공A · 2교시`
  - `전공B · 3교시`
  - `교시별 약점 처방`

No functional console/page errors were captured. Known Next RSC prefetch warnings were excluded because navigation falls back successfully and user-visible behavior remains intact.

## UX Findings

### Strong

- The full mock route now clearly feels different from the quick mock. The top band, `23/23` progress, and palette together create a convincing exam-mode surface.
- The palette is useful during long sessions. It makes the 23-question session feel controllable rather than endless.
- The `/record` follow-through is meaningful. Seeing `Full Mock Exam`, paper-level scores, and prescriptions immediately after finishing makes the session feel consequential.

### Friction

- `/next` still opens as a dashboard, not as a command center. The user can find mock mode, but the first viewport does not yet say "do this next" strongly enough.
- The mock entry points are only visible after selecting the mock tab. That is acceptable structurally, but the top cockpit should preview the most important next action without requiring exploration.
- The full mock report is useful, but the completion moment could eventually use a stronger summary headline, such as "오늘 실전 점검 완료".

## Next UX Action

Make `/next` first viewport behave like an exam command board:

- Add a top `오늘의 작전판` band below the page header.
- Surface one primary action: `실전형 23문항 시작`.
- Surface two support actions: `고위험 영역 3개 점검`, `기록에서 결과 확인`.
- Keep the existing readiness/risk cards below it as supporting detail, not the first decision surface.

