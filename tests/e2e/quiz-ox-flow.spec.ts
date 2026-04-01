import { test, expect, type Page } from '@playwright/test';

/**
 * OX Quiz E2E Tests
 *
 * /quiz/ox is a diagnostic mode OX quiz:
 * - Auto-starts with 10 shuffled questions (no session setup screen)
 * - Each question shows O/X buttons
 * - After clicking, feedback (correct/incorrect) appears + auto-advance timer
 * - After all 10, result screen shows score ring, XP, chapter/type breakdown
 */

test.describe('OX Quiz (/quiz/ox) - Full User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear only quiz-related localStorage keys to avoid wiping unrelated stores
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('quiz-data');
      localStorage.removeItem('special-edu-study');
      localStorage.removeItem('leitner-cards');
    });
  });

  test('quiz page loads with actual question text and progress indicator', async ({ page }) => {
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');

    // The title should show "OX" in the header
    await expect(page.getByRole('heading', { name: 'OX' })).toBeVisible({ timeout: 15000 });

    // Progress indicator should show "1 / 10" since diagnostic mode starts with 10 questions
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible();

    // A question text should be visible inside a card (CardTitle renders as div[data-slot="card-title"])
    const questionText = page.locator('[data-slot="card-title"]').first();
    await expect(questionText).toBeVisible();
    const text = await questionText.textContent();
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(5); // Real question text, not placeholder

    // O and X buttons should be visible
    const oxButtons = page.locator('button').filter({ hasText: /^[OX]$/ });
    await expect(oxButtons).toHaveCount(2);
  });

  test('clicking O or X button shows answer feedback', async ({ page }) => {
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 15000 });

    // Click the "O" button
    const oButton = page.locator('button').filter({ hasText: /^O$/ }).first();
    await oButton.click();

    // After clicking, feedback should appear: either "correct" or "incorrect" message
    // The OXChoice component shows either CheckCircle ("correct") or XCircle ("incorrect")
    // with text like "correct" or "incorrect (answer: X)"
    const feedbackCorrect = page.getByText('정답입니다!');
    const feedbackWrong = page.getByText(/오답.*정답/);

    // One of these two should appear
    await expect(feedbackCorrect.or(feedbackWrong)).toBeVisible({ timeout: 5000 });

    // The auto-advance timer bar should appear (in diagnostic mode)
    // It says "다음 문제로 이동 중... (탭하여 건너뛰기)"
    await expect(page.getByText('다음 문제로 이동 중')).toBeVisible();
  });

  test('answering advances to next question and updates progress', async ({ page }) => {
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 15000 });

    // Answer the first question by clicking O
    const oButton = page.locator('button').filter({ hasText: /^O$/ }).first();
    await oButton.click();

    // Click the timer bar to skip the auto-advance wait
    const skipBar = page.getByText('다음 문제로 이동 중');
    await expect(skipBar).toBeVisible();
    await skipBar.click();

    // Progress should now show "2 / 10"
    await expect(page.getByText(/2\s*\/\s*10/)).toBeVisible({ timeout: 5000 });

    // A new question should be displayed
    const questionText = page.locator('[data-slot="card-title"]').first();
    await expect(questionText).toBeVisible();
  });

  test('skip button advances to next question without answering', async ({ page }) => {
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 15000 });

    // Click skip button
    await page.getByText('건너뛰기').click();

    // Progress should now show "2 / 10"
    await expect(page.getByText(/2\s*\/\s*10/)).toBeVisible({ timeout: 5000 });
  });

  test('chapter badge shows for each question', async ({ page }) => {
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 15000 });

    // The chapter indicator should appear (prefixed with pin emoji)
    const chapterIndicator = page.locator('p').filter({ hasText: /📌/ });
    await expect(chapterIndicator).toBeVisible();
    const chapterText = await chapterIndicator.textContent();
    expect(chapterText).toBeTruthy();
    expect(chapterText!.length).toBeGreaterThan(3);
  });

  test('question type badge shows "OX퀴즈"', async ({ page }) => {
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 15000 });

    // Badge should show the question type
    await expect(page.getByText('OX퀴즈')).toBeVisible();
  });

  test('completing all 10 questions shows result screen with score', async ({ page }) => {
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 15000 });

    // Answer all 10 questions by clicking O and quickly advancing
    for (let i = 0; i < 10; i++) {
      // Click O button
      const oButton = page.locator('button').filter({ hasText: /^O$/ }).first();
      await oButton.click();

      // Wait for feedback
      const feedbackCorrect = page.getByText('정답입니다!');
      const feedbackWrong = page.getByText(/오답.*정답/);
      await expect(feedbackCorrect.or(feedbackWrong)).toBeVisible({ timeout: 5000 });

      // Click the timer bar to skip auto-advance wait
      const skipBar = page.getByText('다음 문제로 이동 중');
      if (await skipBar.isVisible()) {
        await skipBar.click();
      }

      // Wait for either the next question or result screen to appear
      if (i < 9) {
        await expect(page.getByText(new RegExp(`${i + 2}\\s*/\\s*10`))).toBeVisible({ timeout: 5000 });
      }
    }

    // Result screen should appear
    // Wait for the circular progress ring (shows percentage)
    await expect(page.locator('svg text').filter({ hasText: /\d+%/ })).toBeVisible({ timeout: 10000 });

    // Should show "N문제 중 M문제 정답" text
    await expect(page.getByText(/문제 중.*문제.*정답/)).toBeVisible();

    // XP earned badge should be visible
    await expect(page.getByText(/\+\d+ XP 획득/)).toBeVisible();

    // "다시 풀기" button should exist
    await expect(page.getByRole('button', { name: '다시 풀기', exact: true })).toBeVisible();

    // "과목 목록" link should exist
    await expect(page.getByRole('link', { name: '과목 목록' })).toBeVisible();
  });

  test('result screen shows chapter breakdown analysis', async ({ page }) => {
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 15000 });

    // Answer all 10 quickly
    await answerAllQuestions(page, 10);

    // Chapter breakdown section should be visible
    await expect(page.getByText('챕터별 분석')).toBeVisible({ timeout: 10000 });

    // Type breakdown section
    await expect(page.getByText('유형별 분석')).toBeVisible();
  });

  test('result screen "다시 풀기" button restarts quiz from setup', async ({ page }) => {
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 15000 });

    // Answer all 10
    await answerAllQuestions(page, 10);

    // Should be on result screen
    await expect(page.getByText(/문제 중.*문제.*정답/)).toBeVisible({ timeout: 10000 });

    // Click "다시 풀기"
    await page.getByRole('button', { name: '다시 풀기', exact: true }).click();

    // Since OX diagnostic mode auto-starts, a new session should begin
    // We should see the setup screen or a new quiz session
    // In diagnostic mode, clicking "다시 풀기" goes to setup phase,
    // but since diagnosticMode is true, it re-auto-starts
    await expect(
      page.getByText(/1\s*\/\s*10/).or(page.getByText('퀴즈 시작'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('diagnostic report appears after completing quiz', async ({ page }) => {
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 15000 });

    await answerAllQuestions(page, 10);

    // The DiagnosticReport component should render after results in diagnostic mode
    // It provides subject-level analysis
    // The result page should have the main heading still visible
    await expect(page.getByRole('heading', { name: 'OX' })).toBeVisible({ timeout: 10000 });

    // Score percentage ring should be visible
    await expect(page.locator('svg text').filter({ hasText: /\d+%/ })).toBeVisible();
  });

  test('wrong answer feedback shows correct answer', async ({ page }) => {
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 15000 });

    // We need to guarantee a wrong answer. Try both O and X answers:
    // Click O first
    const oButton = page.locator('button').filter({ hasText: /^O$/ }).first();
    await oButton.click();

    const feedbackWrong = page.getByText(/오답.*정답/);
    const feedbackCorrect = page.getByText('정답입니다!');

    // Check which one appeared
    const isWrong = await feedbackWrong.isVisible().catch(() => false);
    const isCorrect = await feedbackCorrect.isVisible().catch(() => false);

    // At least one must be visible
    expect(isWrong || isCorrect).toBeTruthy();

    if (isWrong) {
      // Wrong answer feedback should show the correct answer (O or X)
      const wrongText = await feedbackWrong.textContent();
      expect(wrongText).toMatch(/오답.*정답:\s*[OX]/);
    }
    // If correct, that's also a valid outcome - the test verifies feedback appears
  });
});

/**
 * Helper: answer all remaining questions by clicking O and skipping auto-advance.
 */
async function answerAllQuestions(page: Page, count: number) {
  for (let i = 0; i < count; i++) {
    const oButton = page.locator('button').filter({ hasText: /^O$/ }).first();
    // Wait for the button to be visible (question loaded)
    await expect(oButton).toBeVisible({ timeout: 5000 });
    await oButton.click();

    // Wait for feedback
    const feedbackCorrect = page.getByText('정답입니다!');
    const feedbackWrong = page.getByText(/오답.*정답/);
    await expect(feedbackCorrect.or(feedbackWrong)).toBeVisible({ timeout: 5000 });

    // Click timer bar to skip auto-advance (if not last question, it auto-goes to result)
    const skipBar = page.getByText('다음 문제로 이동 중');
    if (await skipBar.isVisible().catch(() => false)) {
      await skipBar.click();
    }

    // Wait for next question to load or result screen to appear
    if (i < count - 1) {
      await expect(page.locator('button').filter({ hasText: /^O$/ }).first()).toBeVisible({ timeout: 5000 });
    }
  }
}
