import { test, expect, type Page } from '@playwright/test';

// ─── localStorage seeding helpers ──────────────────────────────────────────

/** Seed quiz-data store with a diagnostic session so "데이터 있음" path is exercised */
async function seedDiagnosticSession(page: Page) {
  await page.evaluate(() => {
    const now = Date.now();
    const session = {
      id: 'diag-e2e-seed-1',
      label: 'E2E 시드',
      type: 'ox',
      startedAt: now - 60000,
      completedAt: now,
      questionIds: ['q1', 'q2', 'q3'],
      results: [
        { questionId: 'q1', isCorrect: true, questionText: '테스트 문제 1', correctAnswer: 'O', subject: '특수교육학' },
        { questionId: 'q2', isCorrect: false, questionText: '테스트 문제 2', userAnswer: 'O', correctAnswer: 'X', subject: '특수교육학' },
        { questionId: 'q3', isCorrect: true, questionText: '테스트 문제 3', correctAnswer: 'O', subject: '통합교육' },
      ],
      stats: { total: 3, correct: 2, rate: 67 },
    };
    const storeData = {
      state: {
        wrongNotes: [],
        quizHistory: [
          { questionId: 'q1', isCorrect: true, subject: '특수교육학', chapter: 'ch1', timestamp: now },
          { questionId: 'q2', isCorrect: false, subject: '특수교육학', chapter: 'ch1', timestamp: now },
          { questionId: 'q3', isCorrect: true, subject: '통합교육', chapter: 'ch2', timestamp: now },
        ],
        diagnosticSessions: [session],
        feedbacks: [],
        errorReports: [],
      },
      version: 5,
    };
    localStorage.setItem('quiz-data', JSON.stringify(storeData));

    const studyData = {
      state: {
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: new Date().toISOString().slice(0, 10),
        dailyProgress: { date: new Date().toISOString().slice(0, 10), chaptersCompleted: 0, quizzesCompleted: 3, quizzesCorrect: 2, flashcardsReviewed: 0 },
        dailyGoal: { chapters: 2, quizzes: 10 },
        recentActivities: [],
        totalXP: 30,
        totalQuizzes: 3,
        totalCorrect: 2,
        dailyHistory: [],
        scenarioProgress: {},
        spacedScenarioSchedules: {},
        completedChapters: {},
      },
      version: 7,
    };
    localStorage.setItem('special-edu-study', JSON.stringify(studyData));
  });
}

/** Clear diagnostic-related localStorage keys so empty state is exercised */
async function clearDiagnosticData(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('quiz-data');
    localStorage.removeItem('special-edu-study');
  });
}

// ─── Tests ─────────────────────────────────────────────────────────────────

test.describe('진단평가 허브 (/diagnosis)', () => {
  test('페이지 제목과 설명 렌더링', async ({ page }) => {
    await page.goto('/diagnosis');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: '진단평가' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('실력을 진단하고 약점을 파악하세요')).toBeVisible();
  });

  test('바로 시작 — 3개 액션 카드 렌더링 + 올바른 href', async ({ page }) => {
    await page.goto('/diagnosis');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('바로 시작')).toBeVisible({ timeout: 15000 });

    const oxLink = page.getByRole('link', { name: 'OX 진단 전 과목 OX 문제로 빠르게 실력 확인' });
    const shortLink = page.getByRole('link', { name: '단답형 진단 전 과목 단답형으로 실력 진단' });
    const termsLink = page.getByRole('link', { name: '용어학습 핵심 용어 플래시카드로 암기' });

    await expect(oxLink).toBeVisible();
    await expect(shortLink).toBeVisible();
    await expect(termsLink).toBeVisible();

    await expect(oxLink).toHaveAttribute('href', '/quiz/ox');
    await expect(shortLink).toHaveAttribute('href', '/quiz/short');
    await expect(termsLink).toHaveAttribute('href', '/terms');
  });

  test('OX 진단 카드 클릭 → /quiz/ox 이동 → 뒤로가기 → 허브 복귀', async ({ page }) => {
    await page.goto('/diagnosis');
    await page.waitForLoadState('domcontentloaded');
    const oxLink = page.getByRole('link', { name: 'OX 진단 전 과목 OX 문제로 빠르게 실력 확인' });
    await expect(oxLink).toBeVisible({ timeout: 15000 });
    await oxLink.click();
    await page.waitForURL('**/quiz/ox**');
    expect(page.url()).toContain('/quiz/ox');

    await page.goBack();
    await page.waitForURL('**/diagnosis**');
    await expect(page.getByRole('heading', { name: '진단평가' })).toBeVisible();
  });

  test('단답형 진단 카드 클릭 → /quiz/short 이동', async ({ page }) => {
    await page.goto('/diagnosis');
    await page.waitForLoadState('domcontentloaded');
    const shortLink = page.getByRole('link', { name: '단답형 진단 전 과목 단답형으로 실력 진단' });
    await expect(shortLink).toBeVisible({ timeout: 15000 });
    await shortLink.click();
    await page.waitForURL('**/quiz/short**');
    expect(page.url()).toContain('/quiz/short');
  });

  test('용어학습 카드 클릭 → /terms 이동', async ({ page }) => {
    await page.goto('/diagnosis');
    await page.waitForLoadState('domcontentloaded');
    const termsLink = page.getByRole('link', { name: '용어학습 핵심 용어 플래시카드로 암기' });
    await expect(termsLink).toBeVisible({ timeout: 15000 });
    await termsLink.click();
    await page.waitForURL('**/terms**');
    expect(page.url()).toContain('/terms');
  });

  test.describe('빈 상태', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await clearDiagnosticData(page);
      await page.goto('/diagnosis');
      await page.waitForLoadState('domcontentloaded');
    });

    test('진단 요약 — 빈 상태 CTA 표시', async ({ page }) => {
      const emptyState = page.getByText('아직 진단 기록이 없어요');
      await expect(emptyState).toBeVisible({ timeout: 5000 });

      const ctaLink = page.getByRole('link', { name: '첫 진단 시작하기' });
      await expect(ctaLink).toBeVisible();
      await expect(ctaLink).toHaveAttribute('href', '/quiz/ox');
    });

    test('최근 진단 기록 — 빈 상태 렌더링', async ({ page }) => {
      await expect(page.getByText('최근 진단 기록')).toBeVisible({ timeout: 5000 });

      const emptyMsg = page.getByText('아직 진단 기록이 없습니다.');
      await expect(emptyMsg).toBeVisible({ timeout: 5000 });

      const startLink = page.getByRole('link', { name: /OX 진단부터 시작/ });
      await expect(startLink).toBeVisible();
      await expect(startLink).toHaveAttribute('href', '/quiz/ox');
    });
  });

  test.describe('데이터 있는 상태', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await seedDiagnosticSession(page);
      await page.goto('/diagnosis');
      await page.waitForLoadState('domcontentloaded');
    });

    test('진단 요약 — 통계 카드 표시', async ({ page }) => {
      const statsCard = page.getByText('총 풀이');
      await expect(statsCard).toBeVisible({ timeout: 5000 });
    });

    test('최근 진단 기록 — 세션 목록 렌더링', async ({ page }) => {
      await expect(page.getByText('최근 진단 기록')).toBeVisible({ timeout: 5000 });

      const sessionButton = page.locator('button').filter({ hasText: /진단|%/ }).first();
      await expect(sessionButton).toBeVisible({ timeout: 5000 });
    });

    test('최근 진단 기록 — 세션 토글 (접기/펼치기)', async ({ page }) => {
      await expect(page.getByText('최근 진단 기록')).toBeVisible({ timeout: 5000 });

      const sessionButtons = page.locator('button').filter({ hasText: /진단|%/ });
      await expect(sessionButtons.first()).toBeVisible({ timeout: 5000 });

      const firstSession = sessionButtons.first();
      await firstSession.click();
      await firstSession.click();
    });
  });

  // #11 FIX: Error state
  test('네트워크 실패에서도 진단 허브 렌더링', async ({ page }) => {
    await page.route('**/rest/v1/**', (route) => route.abort());

    await page.goto('/diagnosis');
    await page.waitForLoadState('domcontentloaded');

    // Hub page is mostly client-side localStorage — should still render
    await expect(page.getByRole('heading', { name: '진단평가' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('바로 시작')).toBeVisible();
  });
});
