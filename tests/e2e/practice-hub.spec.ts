import { test, expect, type Page } from '@playwright/test';

// ─── localStorage seeding helpers ──────────────────────────────────────────

/** Seed study + quiz stores so PracticeProgress shows "데이터 있음" path */
async function seedStudyData(page: Page) {
  await page.evaluate(() => {
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);

    const quizData = {
      state: {
        wrongNotes: [],
        quizHistory: [
          { questionId: 'q1', isCorrect: true, subject: '특수교육학', chapter: 'ch1', timestamp: now },
          { questionId: 'q2', isCorrect: false, subject: '특수교육학', chapter: 'ch1', timestamp: now },
        ],
        diagnosticSessions: [],
        feedbacks: [],
        errorReports: [],
      },
      version: 5,
    };
    localStorage.setItem('quiz-data', JSON.stringify(quizData));

    const studyData = {
      state: {
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        dailyProgress: { date: today, chaptersCompleted: 0, quizzesCompleted: 2, quizzesCorrect: 1, flashcardsReviewed: 0 },
        dailyGoal: { chapters: 2, quizzes: 10 },
        recentActivities: [
          { subjectSlug: '특수교육학', subjectTitle: '특수교육학', chapterSlug: 'ch1', chapterTitle: '총론', timestamp: now },
        ],
        totalXP: 20,
        totalQuizzes: 2,
        totalCorrect: 1,
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

/** Clear study-related localStorage keys for empty state */
async function clearStudyData(page: Page) {
  await page.evaluate(() => {
    localStorage.removeItem('quiz-data');
    localStorage.removeItem('special-edu-study');
  });
}

// ─── Tests ─────────────────────────────────────────────────────────────────

test.describe('실력쌓기 허브 (/practice-hub)', () => {
  test('페이지 제목과 설명 렌더링', async ({ page }) => {
    await page.goto('/practice-hub');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: '실력쌓기' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('개념부터 실전까지, 체계적으로 실력을 쌓으세요')).toBeVisible();
  });

  test('학습 메뉴 — 4개 카드 렌더링 + 올바른 href', async ({ page }) => {
    await page.goto('/practice-hub');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('학습 메뉴')).toBeVisible({ timeout: 15000 });

    const conceptsLink = page.getByRole('link', { name: '개념학습 과목별 핵심 개념 정리' });
    const practiceLink = page.getByRole('link', { name: '문제풀기 모의고사·워크시트 실전 대비' });
    const interactiveLink = page.getByRole('link', { name: '인터랙티브 매칭·빈칸·절차 연습' });
    const scenariosLink = page.getByRole('link', { name: '상황 시뮬레이션 교실 상황 분기형 의사결정' });

    await expect(conceptsLink).toBeVisible();
    await expect(practiceLink).toBeVisible();
    await expect(interactiveLink).toBeVisible();
    await expect(scenariosLink).toBeVisible();

    await expect(conceptsLink).toHaveAttribute('href', '/concepts');
    await expect(practiceLink).toHaveAttribute('href', '/practice');
    await expect(interactiveLink).toHaveAttribute('href', '/interactive');
    await expect(scenariosLink).toHaveAttribute('href', '/scenarios');
  });

  test('개념학습 카드 클릭 → /concepts 이동 → 뒤로가기 → 허브 복귀', async ({ page }) => {
    await page.goto('/practice-hub');
    await page.waitForLoadState('domcontentloaded');
    const link = page.getByRole('link', { name: '개념학습 과목별 핵심 개념 정리' });
    await expect(link).toBeVisible({ timeout: 15000 });
    await link.click();
    await page.waitForURL('**/concepts**');
    expect(page.url()).toContain('/concepts');

    await page.goBack();
    await page.waitForURL('**/practice-hub**');
    await expect(page.getByRole('heading', { name: '실력쌓기' })).toBeVisible();
  });

  test('문제풀기 카드 클릭 → /practice 이동', async ({ page }) => {
    await page.goto('/practice-hub');
    await page.waitForLoadState('domcontentloaded');
    const link = page.getByRole('link', { name: '문제풀기 모의고사·워크시트 실전 대비' });
    await expect(link).toBeVisible({ timeout: 15000 });
    await link.click();
    await page.waitForURL('**/practice**');
    expect(page.url()).toContain('/practice');
  });

  test('인터랙티브 카드 클릭 → /interactive 이동', async ({ page }) => {
    await page.goto('/practice-hub');
    await page.waitForLoadState('domcontentloaded');
    const link = page.getByRole('link', { name: '인터랙티브 매칭·빈칸·절차 연습' });
    await expect(link).toBeVisible({ timeout: 15000 });
    await link.click();
    await page.waitForURL('**/interactive**');
    expect(page.url()).toContain('/interactive');
  });

  test('상황 시뮬레이션 카드 클릭 → /scenarios 이동', async ({ page }) => {
    await page.goto('/practice-hub');
    await page.waitForLoadState('domcontentloaded');
    const link = page.getByRole('link', { name: '상황 시뮬레이션 교실 상황 분기형 의사결정' });
    await expect(link).toBeVisible({ timeout: 15000 });
    await link.click();
    await page.waitForURL('**/scenarios**');
    expect(page.url()).toContain('/scenarios');
  });

  test.describe('빈 상태', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await clearStudyData(page);
      await page.goto('/practice-hub');
      await page.waitForLoadState('domcontentloaded');
    });

    test('학습 현황 — 빈 상태 CTA 표시', async ({ page }) => {
      const emptyState = page.getByText('아직 학습 기록이 없어요');
      await expect(emptyState).toBeVisible({ timeout: 5000 });

      const ctaLink = page.getByRole('link', { name: '개념학습 시작하기' });
      await expect(ctaLink).toBeVisible();
      await expect(ctaLink).toHaveAttribute('href', '/concepts');
    });

    test('빈 상태 CTA 클릭 → /concepts 이동', async ({ page }) => {
      const emptyState = page.getByText('아직 학습 기록이 없어요');
      await expect(emptyState).toBeVisible({ timeout: 5000 });

      const ctaLink = page.getByRole('link', { name: '개념학습 시작하기' });
      await ctaLink.click();
      await page.waitForURL('**/concepts**');
      expect(page.url()).toContain('/concepts');
    });
  });

  test.describe('데이터 있는 상태', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/');
      await seedStudyData(page);
      await page.goto('/practice-hub');
      await page.waitForLoadState('domcontentloaded');
    });

    test('학습 현황 — 통계 3카드 표시', async ({ page }) => {
      await expect(page.getByText('학습 현황')).toBeVisible({ timeout: 5000 });
      await expect(page.getByText('학습 과목')).toBeVisible();
      await expect(page.getByText('총 풀이')).toBeVisible();
      await expect(page.getByText('정답률')).toBeVisible();
    });
  });

  // #11 FIX: Error state
  test('네트워크 실패에서도 허브 렌더링', async ({ page }) => {
    await page.route('**/rest/v1/**', (route) => route.abort());

    await page.goto('/practice-hub');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: '실력쌓기' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('학습 메뉴')).toBeVisible();
  });
});
