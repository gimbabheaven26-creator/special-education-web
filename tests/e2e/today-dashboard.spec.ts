import { test, expect, type Page } from '@playwright/test';

// ─── localStorage seeding helpers ──────────────────────────────────────────

/** Seed leitner-cards store with a due flashcard so StatCard renders as a link */
async function seedFlashcardData(page: Page) {
  await page.evaluate(() => {
    const today = new Date().toISOString().slice(0, 10);
    const leitnerData = {
      state: {
        cards: [
          {
            id: 'fc-e2e-seed-1',
            subjectSlug: '특수교육학',
            question: 'E2E 테스트 플래시카드',
            answer: '테스트 답',
            box: 1,
            lastReviewed: today,
            nextReview: today, // due today
            createdAt: today,
            source: 'manual',
          },
        ],
        reviewLogs: [],
      },
      version: 3,
    };
    localStorage.setItem('leitner-cards', JSON.stringify(leitnerData));
  });
}

/** Clear leitner-cards for the "no flashcard" state */
async function clearFlashcardData(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('leitner-cards');
  });
}

// ─── Tests ─────────────────────────────────────────────────────────────────

test.describe('오늘의 학습 (/today)', () => {
  test('페이지 제목 "오늘의 학습" 렌더링', async ({ page }) => {
    await page.goto('/today', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { name: '오늘의 학습' })).toBeVisible({ timeout: 15000 });
  });

  test('시험지 번호 뱃지 — DAY-MMDD 형식', async ({ page }) => {
    await page.goto('/today', { waitUntil: 'networkidle' });
    const badge = page.locator('span.font-mono').filter({ hasText: /^DAY-\d{4}$/ });
    await expect(badge).toBeVisible({ timeout: 15000 });
  });

  test('날짜 표시 — 한국어 형식 (년 월 일 요일)', async ({ page }) => {
    await page.goto('/today', { waitUntil: 'networkidle' });
    const dateText = page.getByText(/\d{4}년\s+\d{1,2}월\s+\d{1,2}일\s+.요일/);
    await expect(dateText).toBeVisible({ timeout: 15000 });
  });

  test('대시보드 통계 카드 4개 렌더링 (hydration 후)', async ({ page }) => {
    await page.goto('/today', { waitUntil: 'networkidle' });
    await expect(page.getByText('오늘 푼 문제')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('복습 대기 카드')).toBeVisible();
    await expect(page.getByText('오답 미해결')).toBeVisible();
    await expect(page.getByText('연속 학습')).toBeVisible();
  });

  test('3개 액션 카드 렌더링 + 올바른 href', async ({ page }) => {
    await page.goto('/today', { waitUntil: 'networkidle' });
    const quizLink = page.getByRole('link', { name: /오늘의 퀴즈 풀기/ });
    const answerLink = page.getByRole('link', { name: /답안 확인하기/ });
    const printLink = page.getByRole('link', { name: /출력용 시험지/ });

    await expect(quizLink).toBeVisible({ timeout: 15000 });
    await expect(answerLink).toBeVisible();
    await expect(printLink).toBeVisible();

    await expect(quizLink).toHaveAttribute('href', '/daily');

    const answerHref = await answerLink.getAttribute('href');
    expect(answerHref).toContain('/today/answers');
    expect(answerHref).toMatch(/date=\d{4}-\d{2}-\d{2}/);

    const printHref = await printLink.getAttribute('href');
    expect(printHref).toContain('/today/answers');
    expect(printHref).toContain('print=1');
  });

  test('오늘의 퀴즈 풀기 클릭 → /daily 이동 → 뒤로가기 → 허브 복귀', async ({ page }) => {
    await page.goto('/today', { waitUntil: 'networkidle' });
    const quizLink = page.getByRole('link', { name: /오늘의 퀴즈 풀기/ });
    await expect(quizLink).toBeVisible({ timeout: 15000 });
    await quizLink.click();
    await page.waitForURL('**/daily**');
    expect(page.url()).toContain('/daily');

    await page.goBack();
    await page.waitForURL('**/today**');
    await expect(page.getByRole('heading', { name: '오늘의 학습' })).toBeVisible({ timeout: 15000 });
  });

  test('답안 확인하기 클릭 → /today/answers 이동', async ({ page }) => {
    await page.goto('/today', { waitUntil: 'networkidle' });
    const answerLink = page.getByRole('link', { name: /답안 확인하기/ });
    await expect(answerLink).toBeVisible({ timeout: 15000 });
    await answerLink.click();
    await page.waitForURL('**/today/answers**');
    expect(page.url()).toContain('/today/answers');
  });

  test('안내 박스 — 매일 새로운 문제 설명 텍스트 표시', async ({ page }) => {
    await page.goto('/today', { waitUntil: 'networkidle' });
    await expect(page.getByText('매일 새로운 문제가 나와요')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/날짜별로 고유한 문제 세트/)).toBeVisible();
    await expect(page.getByText(/시험지 번호/)).toBeVisible();
  });

  test.describe('플래시카드 없는 상태', () => {
    test('복습 대기 카드 — href=/flashcards (기본)', async ({ page }) => {
      await page.goto('/');
      await clearFlashcardData(page);
      await page.goto('/today', { waitUntil: 'networkidle' });

      await expect(page.getByText('복습 대기 카드')).toBeVisible({ timeout: 15000 });

      // 플래시카드 없음 → dueToday=0 → href="/flashcards"
      const flashcardLink = page.getByRole('link').filter({ hasText: '복습 대기 카드' });
      await expect(flashcardLink).toBeVisible({ timeout: 5000 });

      const href = await flashcardLink.getAttribute('href');
      expect(href).toBe('/flashcards');

      await flashcardLink.click();
      await page.waitForURL('**/flashcards**');
      expect(page.url()).toContain('/flashcards');
    });
  });

  test.describe('플래시카드 있는 상태 (복습 대기)', () => {
    test('복습 대기 카드 → /flashcards/review 이동', async ({ page }) => {
      await page.goto('/');
      await seedFlashcardData(page);
      await page.goto('/today', { waitUntil: 'networkidle' });

      await expect(page.getByText('복습 대기 카드')).toBeVisible({ timeout: 15000 });

      const flashcardLink = page.getByRole('link').filter({ hasText: '복습 대기 카드' });
      await expect(flashcardLink).toBeVisible({ timeout: 5000 });

      const href = await flashcardLink.getAttribute('href');
      expect(href).toBe('/flashcards/review');

      await flashcardLink.click();
      await page.waitForURL('**/flashcards**');
      expect(page.url()).toContain('/flashcards');
    });
  });
});
