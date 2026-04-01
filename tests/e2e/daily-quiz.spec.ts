import { test, expect, type Page } from '@playwright/test';

/**
 * Daily Quiz E2E Tests
 *
 * /daily is a 3-step daily learning flow:
 *   Step 1: OX quiz (10 questions) - user clicks O/X, then "채점하기"
 *   Step 2: Fill-in (5 questions) - user reads & thinks, then "답안 확인"
 *   Step 3: Descriptive (3 questions) - user writes, "정답 키워드 확인", then "오늘 학습 완료"
 *   CompletionScreen: summary with OX accuracy, navigation links
 *
 * Data comes from /api/daily-questions (Supabase) via useDailyQuiz hook.
 */

test.describe('Daily Quiz (/daily) - Full 3-Step Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear only quiz/study-related localStorage keys to avoid wiping unrelated stores
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('quiz-data');
      localStorage.removeItem('special-edu-study');
      localStorage.removeItem('leitner-cards');
    });
  });

  test('page loads with step indicator and OX questions', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');

    // Step header should show "STEP 1 -- OX 퀴즈"
    await expect(page.getByRole('heading', { name: /STEP 1.*OX/ })).toBeVisible({ timeout: 15000 });

    // 3 step indicator circles should be visible (buttons with 1, 2, 3 or checkmark)
    const stepButtons = page.locator('button').filter({ hasText: /^[123\u2713]$/ });
    await expect(stepButtons).toHaveCount(3, { timeout: 5000 });

    // First step button should be active (primary colored), others disabled
    const step1Button = stepButtons.nth(0);
    await expect(step1Button).toBeVisible();

    // Actual OX questions should be rendered (not loading spinner)
    // Each OXQuestion has O and X buttons
    const oButtons = page.locator('button').filter({ hasText: /^O$/ });
    const count = await oButtons.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('step 1: clicking O/X buttons selects answer for each question', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /STEP 1/ })).toBeVisible({ timeout: 15000 });

    // Get all O buttons (one per question)
    const oButtons = page.locator('button').filter({ hasText: /^O$/ });
    const questionCount = await oButtons.count();
    expect(questionCount).toBeGreaterThanOrEqual(1);

    // Click the first O button
    await oButtons.first().click();

    // The button should now be highlighted (primary color class applied)
    // Verify the button's parent card doesn't have revealed state yet
    // The selected answer button should have a distinct style
    const firstO = oButtons.first();
    const className = await firstO.getAttribute('class');
    expect(className).toContain('primary');
  });

  test('step 1: "채점하기" button is disabled until all questions answered', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /STEP 1/ })).toBeVisible({ timeout: 15000 });

    // "채점하기" button should exist but be disabled (not all answered)
    const gradeButton = page.getByRole('button', { name: '채점하기' });
    await expect(gradeButton).toBeVisible();
    await expect(gradeButton).toBeDisabled();
  });

  test('step 1: answering all OX questions enables grading', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /STEP 1/ })).toBeVisible({ timeout: 15000 });

    // Answer all OX questions
    await answerAllOxQuestions(page);

    // "채점하기" button should now be enabled
    const gradeButton = page.getByRole('button', { name: '채점하기' });
    await expect(gradeButton).toBeEnabled({ timeout: 3000 });
  });

  test('step 1: grading reveals correct answers and shows score', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /STEP 1/ })).toBeVisible({ timeout: 15000 });

    await answerAllOxQuestions(page);

    // Click "채점하기"
    await page.getByRole('button', { name: '채점하기' }).click();

    // Score summary should appear: "정답: N / M"
    await expect(page.getByText(/정답:\s*\d+\s*\/\s*\d+/)).toBeVisible({ timeout: 5000 });

    // Each question should show the correct answer text "정답: O" or "정답: X"
    const answerReveals = page.locator('p').filter({ hasText: /^정답:/ });
    const revealCount = await answerReveals.count();
    // At minimum the summary + individual answers
    expect(revealCount).toBeGreaterThanOrEqual(1);

    // "단답형으로 넘어가기" button should appear
    await expect(page.getByRole('button', { name: /단답형으로 넘어가기/ })).toBeVisible();
  });

  test('step 1 to step 2: advancing to fill-in questions', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /STEP 1/ })).toBeVisible({ timeout: 15000 });

    await answerAllOxQuestions(page);
    await page.getByRole('button', { name: '채점하기' }).click();
    await expect(page.getByText(/정답:\s*\d+\s*\/\s*\d+/)).toBeVisible({ timeout: 5000 });

    // Click "단답형으로 넘어가기"
    await page.getByRole('button', { name: /단답형으로 넘어가기/ }).click();

    // Step 2 heading should appear
    await expect(page.getByRole('heading', { name: /STEP 2.*단답형/ })).toBeVisible({ timeout: 5000 });

    // Step indicator: step 1 should show checkmark, step 2 should be active
    const stepButtons = page.locator('button').filter({ hasText: /^[123\u2713]$/ });
    const step1Text = await stepButtons.nth(0).textContent();
    expect(step1Text).toBe('\u2713'); // checkmark for completed step
  });

  test('step 2: fill-in questions render with text inputs', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await advanceToStep2(page);

    // Fill-in instruction text should be visible
    await expect(page.getByText('문제를 읽고 답을 생각해보세요')).toBeVisible();

    // Text input fields should be present for each question
    const inputs = page.locator('input[type="text"]');
    const inputCount = await inputs.count();
    expect(inputCount).toBeGreaterThanOrEqual(1);

    // "답안 확인" button should be visible
    await expect(page.getByRole('button', { name: '답안 확인' })).toBeVisible();
  });

  test('step 2: typing answer and revealing correct answers', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await advanceToStep2(page);

    // Type into the first input
    const firstInput = page.locator('input[type="text"]').first();
    await firstInput.fill('통합교육');

    // Verify the input has the typed value
    await expect(firstInput).toHaveValue('통합교육');

    // Click "답안 확인"
    await page.getByRole('button', { name: '답안 확인' }).click();

    // After reveal, correct answers should be shown
    // Each TextQuestion shows "정답" label with the answer text
    await expect(page.locator('p').filter({ hasText: '정답' }).first()).toBeVisible({ timeout: 5000 });

    // The "내 답안" section should show for questions where user typed
    await expect(page.getByText('내 답안')).toBeVisible();

    // "서술형으로 넘어가기" button should appear
    await expect(page.getByRole('button', { name: /서술형으로 넘어가기/ })).toBeVisible();
  });

  test('step 2 to step 3: advancing to descriptive questions', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await advanceToStep2(page);

    // Click "답안 확인"
    await page.getByRole('button', { name: '답안 확인' }).click();
    await expect(page.getByRole('button', { name: /서술형으로 넘어가기/ })).toBeVisible({ timeout: 5000 });

    // Advance to step 3
    await page.getByRole('button', { name: /서술형으로 넘어가기/ }).click();

    // Step 3 heading
    await expect(page.getByRole('heading', { name: /STEP 3.*서술형/ })).toBeVisible({ timeout: 5000 });
  });

  test('step 3: descriptive questions with textarea and keyword reveal', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await advanceToStep3(page);

    // Instruction text
    await expect(page.getByText('핵심 키워드를 포함하여 서술해보세요')).toBeVisible();

    // Textareas should be present for descriptive questions
    const textareas = page.locator('textarea');
    const textareaCount = await textareas.count();
    expect(textareaCount).toBeGreaterThanOrEqual(1);

    // Type an answer in the first textarea
    await textareas.first().fill('통합교육은 장애 학생과 비장애 학생이 함께 교육받는 것을 의미한다.');
    await expect(textareas.first()).toHaveValue(/통합교육/);

    // "정답 키워드 확인" button should be visible
    const revealButton = page.getByRole('button', { name: '정답 키워드 확인' });
    await expect(revealButton).toBeVisible();

    // Click to reveal
    await revealButton.click();

    // After reveal, correct answers should appear
    await expect(page.locator('p').filter({ hasText: '정답' }).first()).toBeVisible({ timeout: 5000 });

    // "오늘 학습 완료" button should appear
    await expect(page.getByRole('button', { name: /오늘 학습 완료/ })).toBeVisible();
  });

  test('completing all 3 steps shows CompletionScreen', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await advanceToStep3(page);

    // Reveal keywords
    await page.getByRole('button', { name: '정답 키워드 확인' }).click();
    await expect(page.getByRole('button', { name: /오늘 학습 완료/ })).toBeVisible({ timeout: 5000 });

    // Complete
    await page.getByRole('button', { name: /오늘 학습 완료/ }).click();

    // CompletionScreen should render
    await expect(page.getByRole('heading', { name: /학습 완료/ })).toBeVisible({ timeout: 5000 });

    // OX accuracy percentage should be displayed
    await expect(page.getByText(/OX 정답률/)).toBeVisible();

    // Score grid: OX correct count, descriptive completion count
    await expect(page.getByText(/OX 정답$/)).toBeVisible();
    await expect(page.getByText('서술 완료')).toBeVisible();

    // Navigation links should be present
    await expect(page.getByRole('link', { name: '홈으로 돌아가기' })).toBeVisible();
    await expect(page.getByRole('link', { name: '오답노트 확인하기' })).toBeVisible();
    await expect(page.getByRole('link', { name: '개념학습 보기' })).toBeVisible();
  });

  test('completion screen shows score percentage as number', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await completeAllSteps(page);

    // The completion screen should show a numerical percentage for OX
    const percentageText = page.locator('p').filter({ hasText: /^\d+%$/ }).first();
    await expect(percentageText).toBeVisible({ timeout: 5000 });
    const pctValue = await percentageText.textContent();
    const pctNum = parseInt(pctValue!.replace('%', ''));
    expect(pctNum).toBeGreaterThanOrEqual(0);
    expect(pctNum).toBeLessThanOrEqual(100);
  });

  test('completion screen "홈으로 돌아가기" navigates to home', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await completeAllSteps(page);

    await page.getByRole('link', { name: '홈으로 돌아가기' }).click();
    await page.waitForURL('**/');
    await page.waitForLoadState('networkidle');
    // Should be on the home page (root path)
    expect(new URL(page.url()).pathname).toBe('/');
  });

  test('step 1: "틀린 영역 OX 다시 풀기" option appears when there are wrong answers', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /STEP 1/ })).toBeVisible({ timeout: 15000 });

    // Answer all questions — intentionally mix O/X to increase chance of wrong answers
    await answerAllOxQuestionsMixed(page);

    // Grade
    await page.getByRole('button', { name: '채점하기' }).click();
    await expect(page.getByText(/정답:\s*\d+\s*\/\s*\d+/)).toBeVisible({ timeout: 5000 });

    // If there are wrong answers, "틀린 영역 OX 다시 풀기" should appear
    const retryButton = page.getByRole('button', { name: /틀린 영역 OX 다시 풀기/ });
    const advanceButton = page.getByRole('button', { name: /단답형으로 넘어가기/ });

    // At least the advance button must be visible
    await expect(advanceButton).toBeVisible();

    // If retry button exists, clicking it should reset OX questions
    if (await retryButton.isVisible().catch(() => false)) {
      await retryButton.click();
      // Should reset to a fresh OX quiz (step 1 again with new questions)
      await expect(page.getByRole('heading', { name: /STEP 1/ })).toBeVisible({ timeout: 5000 });
      // "채점하기" button should reappear
      await expect(page.getByRole('button', { name: '채점하기' })).toBeVisible();
    }
  });

  test('bottom navigation shows home and wrong notes links', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: /STEP 1/ })).toBeVisible({ timeout: 15000 });

    // Bottom nav links
    await expect(page.getByRole('link', { name: /홈으로/ })).toBeVisible();
    await expect(page.getByRole('link', { name: /오답노트/ })).toBeVisible();
  });

  test('step 2: "단답형 한번 더" button retries fill-in questions', async ({ page }) => {
    await page.goto('/daily');
    await page.waitForLoadState('networkidle');
    await advanceToStep2(page);

    // Reveal answers
    await page.getByRole('button', { name: '답안 확인' }).click();

    // "단답형 한번 더" option should appear
    const retryButton = page.getByRole('button', { name: /단답형 한번 더/ });
    await expect(retryButton).toBeVisible({ timeout: 5000 });

    // Click retry
    await retryButton.click();

    // Should still be on step 2 but with reset state (answers hidden again)
    await expect(page.getByRole('heading', { name: /STEP 2/ })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: '답안 확인' })).toBeVisible();
  });
});

// ─── Helper Functions ────────────────────────────────────────────────────────

/**
 * Answer all OX questions by clicking "O" for each.
 */
async function answerAllOxQuestions(page: Page) {
  const oButtons = page.locator('button').filter({ hasText: /^O$/ });
  const count = await oButtons.count();
  // Each OXQuestion has one O button — click all of them
  for (let i = 0; i < count; i++) {
    // Re-query each time since DOM may shift
    const btn = page.locator('button').filter({ hasText: /^O$/ }).nth(i);
    if (await btn.isEnabled()) {
      await btn.click();
    }
  }
}

/**
 * Answer OX questions with mixed O/X to increase chance of wrong answers.
 */
async function answerAllOxQuestionsMixed(page: Page) {
  const oButtons = page.locator('button').filter({ hasText: /^O$/ });
  const xButtons = page.locator('button').filter({ hasText: /^X$/ });
  const count = await oButtons.count();
  for (let i = 0; i < count; i++) {
    // Alternate between O and X
    if (i % 2 === 0) {
      await page.locator('button').filter({ hasText: /^O$/ }).nth(i).click();
    } else {
      await page.locator('button').filter({ hasText: /^X$/ }).nth(i).click();
    }
  }
}

/**
 * Complete Step 1 and advance to Step 2.
 */
async function advanceToStep2(page: Page) {
  await expect(page.getByRole('heading', { name: /STEP 1/ })).toBeVisible({ timeout: 15000 });
  await answerAllOxQuestions(page);
  await page.getByRole('button', { name: '채점하기' }).click();
  await expect(page.getByText(/정답:\s*\d+\s*\/\s*\d+/)).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /단답형으로 넘어가기/ }).click();
  await expect(page.getByRole('heading', { name: /STEP 2/ })).toBeVisible({ timeout: 5000 });
}

/**
 * Complete Steps 1-2 and advance to Step 3.
 */
async function advanceToStep3(page: Page) {
  await advanceToStep2(page);
  await page.getByRole('button', { name: '답안 확인' }).click();
  await expect(page.getByRole('button', { name: /서술형으로 넘어가기/ })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /서술형으로 넘어가기/ }).click();
  await expect(page.getByRole('heading', { name: /STEP 3/ })).toBeVisible({ timeout: 5000 });
}

/**
 * Complete all 3 steps and reach CompletionScreen.
 */
async function completeAllSteps(page: Page) {
  await advanceToStep3(page);
  await page.getByRole('button', { name: '정답 키워드 확인' }).click();
  await expect(page.getByRole('button', { name: /오늘 학습 완료/ })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: /오늘 학습 완료/ }).click();
  await expect(page.getByRole('heading', { name: /학습 완료/ })).toBeVisible({ timeout: 5000 });
}
