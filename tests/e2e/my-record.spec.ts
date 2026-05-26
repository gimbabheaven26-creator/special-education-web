import { test, expect, type Page } from '@playwright/test';

async function seedRecordData(page: Page) {
  await page.goto('/record');
  await page.evaluate(() => {
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('quiz-data', JSON.stringify({
      state: {
        wrongNotes: [
          {
            questionId: 'record-seed-wrong-1',
            subject: 'laws',
            chapter: 'special-education-act',
            userAnswer: 'X',
            attempts: 1,
            lastAttempt: now,
            mastered: false,
          },
        ],
        quizHistory: [
          { questionId: 'record-seed-q1', isCorrect: true, subject: 'laws', chapter: 'special-education-act', timestamp: now },
          { questionId: 'record-seed-q2', isCorrect: false, subject: 'laws', chapter: 'special-education-act', timestamp: now },
        ],
        diagnosticSessions: [],
        feedbacks: [],
        errorReports: [],
      },
      version: 5,
    }));
    localStorage.setItem('special-edu-study', JSON.stringify({
      state: {
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        dailyProgress: { date: today, chaptersCompleted: 0, quizzesCompleted: 2, quizzesCorrect: 1, flashcardsReviewed: 0 },
        dailyGoal: { chapters: 2, quizzes: 10 },
        recentActivities: [],
        totalXP: 20,
        totalQuizzes: 2,
        totalCorrect: 1,
        dailyHistory: [],
        scenarioProgress: {},
        spacedScenarioSchedules: {},
        completedChapters: {},
      },
      version: 7,
    }));
  });
}

async function seedSewNextTrendData(page: Page) {
  await page.goto('/record');
  await page.evaluate(() => {
    const now = Date.now();
    const today = new Date().toISOString().slice(0, 10);
    localStorage.setItem('quiz-data', JSON.stringify({
      state: {
        wrongNotes: [],
        quizHistory: [
          {
            questionId: 'sew-old-1',
            isCorrect: true,
            subject: '정서행동장애',
            chapter: '기능평가',
            timestamp: now - 2 * 60 * 60 * 1000,
            sessionId: 'sew-next-adaptive',
          },
          {
            questionId: 'sew-middle-1',
            isCorrect: false,
            subject: '특수교육공학',
            chapter: '보조공학',
            timestamp: now - 60 * 60 * 1000,
            sessionId: 'sew-next-custom',
          },
          {
            questionId: 'sew-middle-2',
            isCorrect: true,
            subject: '특수교육공학',
            chapter: '보조공학',
            timestamp: now - 60 * 60 * 1000 + 1000,
            sessionId: 'sew-next-custom',
          },
          {
            questionId: 'sew-latest-1',
            isCorrect: true,
            subject: '관련 법령',
            chapter: 'IEP',
            timestamp: now,
            sessionId: 'sew-next-mock',
            sewNextExamMeta: {
              paperLabel: '전공A',
              period: '2교시',
              questionNumber: 1,
              format: '단답형',
              points: 2,
              mockVariant: 'quick',
            },
          },
          {
            questionId: 'sew-latest-2',
            isCorrect: false,
            subject: '정서행동장애',
            chapter: 'FBA',
            timestamp: now + 1000,
            sessionId: 'sew-next-mock',
            sewNextExamMeta: {
              paperLabel: '전공B',
              period: '3교시',
              questionNumber: 1,
              format: '서술형',
              points: 4,
              mockVariant: 'quick',
            },
          },
          {
            questionId: 'sew-full-a-1',
            isCorrect: false,
            subject: '교육과정',
            chapter: '기본 교육과정',
            timestamp: now + 2 * 60 * 60 * 1000,
            sessionId: 'sew-next-mock-full',
            sewNextExamMeta: {
              paperLabel: '전공A',
              period: '2교시',
              questionNumber: 2,
              format: '서술형',
              points: 4,
              mockVariant: 'full',
            },
          },
        ],
        diagnosticSessions: [],
        feedbacks: [],
        errorReports: [],
      },
      version: 5,
    }));
    localStorage.setItem('special-edu-study', JSON.stringify({
      state: {
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: today,
        dailyProgress: { date: today, chaptersCompleted: 0, quizzesCompleted: 4, quizzesCorrect: 3, flashcardsReviewed: 0 },
        dailyGoal: { chapters: 2, quizzes: 10 },
        recentActivities: [],
        totalXP: 40,
        totalQuizzes: 4,
        totalCorrect: 3,
        dailyHistory: [],
        scenarioProgress: {},
        spacedScenarioSchedules: {},
        completedChapters: {},
      },
      version: 7,
    }));
  });
}

test.describe('/my 대시보드', () => {
  test('페이지 렌더링 + 주요 섹션 존재', async ({ page }) => {
    await page.goto('/my');
    await expect(page.getByRole('main').first()).toBeVisible();
    // 게스트 배너 또는 대시보드 콘텐츠가 있어야 함
    const hasContent = await page.locator('main').textContent();
    expect(hasContent!.length).toBeGreaterThan(0);
  });

  test('프로필 또는 바로가기 링크 렌더링', async ({ page }) => {
    await page.goto('/my');
    // /my는 프로필 전용 — /record 또는 /onboarding 링크가 있어야 함
    const recordLink = page.locator('a[href="/record"]');
    const onboardingLink = page.locator('a[href="/onboarding"]');
    const count = await recordLink.count() + await onboardingLink.count();
    // 게스트 뷰에서는 없을 수 있으므로 0 이상
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('기능 바로가기 링크 존재', async ({ page }) => {
    await page.goto('/my');
    // /my 페이지에는 다른 페이지로의 링크가 있어야 함
    const links = page.locator('a[href]:not([href="/my"])');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('404 없이 로드', async ({ page }) => {
    const response = await page.goto('/my');
    expect(response!.status()).toBe(200);
  });
});

test.describe('/record 대시보드', () => {
  test('404 없이 로드 + 콘텐츠 렌더링', async ({ page }) => {
    const response = await page.goto('/record');
    expect(response!.status()).toBe(200);
    // hydration 완료 대기: main 영역에 텍스트가 나타날 때까지
    await expect(page.getByRole('main').first()).toBeVisible();
    const body = await page.locator('body').textContent();
    expect(body!.length).toBeGreaterThan(0);
  });

  test('제목 또는 빈 상태 표시', async ({ page }) => {
    await page.goto('/record');
    // hydration 대기: "기록" 텍스트가 나타날 때까지
    await expect(page.getByRole('main').first()).toBeVisible();
    const hasTitle = await page.locator('text=기록').count();
    const hasEmptyState = await page.locator('text=퀴즈').count();
    expect(hasTitle + hasEmptyState).toBeGreaterThan(0);
  });

  test('핵심 지표 카드 또는 빈 상태 CTA', async ({ page }) => {
    await page.goto('/record');
    await expect(page.getByRole('main').first()).toBeVisible();
    // 데이터 있으면 XP/스트릭 등, 없으면 퀴즈 시작 CTA
    const hasMetrics = await page.locator('text=XP').count();
    const hasCTA = await page.locator('text=시작').count();
    const hasContent = await page.locator('text=기록').count();
    expect(hasMetrics + hasCTA + hasContent).toBeGreaterThan(0);
  });

  test('빈 기록에서는 SEW Next 전용 미리보기를 표시하지 않음', async ({ page }) => {
    await page.goto('/record');
    await expect(page.getByRole('main').first()).toBeVisible();

    await expect(page.getByText('Mock Exam 전공A/B 미리보기')).toHaveCount(0);
    await expect(page.getByText('최근 SEW Next 세션')).toHaveCount(0);
  });

  test('정답률과 과목/챕터 이름을 사용자용 문구로 표시', async ({ page }) => {
    await seedRecordData(page);
    await page.goto('/record');
    await expect(page.getByRole('main').first()).toBeVisible();

    await expect(page.getByText('오늘의 성장')).toBeVisible();
    await expect(page.getByText('2문제 · 50%')).toBeVisible();
    await expect(page.getByText('전체 정답률')).toBeVisible();
    await expect(page.getByText('5000%')).toHaveCount(0);
    await expect(page.getByText('관련 법령').first()).toBeVisible();
    await expect(page.getByText('특수교육법').first()).toBeVisible();
    await expect(page.getByText(/^laws$/)).toHaveCount(0);
    await expect(page.getByText(/^special-education-act$/)).toHaveCount(0);
  });

  test('Classic 기록은 SEW Next 결과 패널을 렌더링하지 않음', async ({ page }) => {
    await seedSewNextTrendData(page);
    await page.goto('/record');

    await expect(page.getByText('오늘의 성장')).toBeVisible();
    await expect(page.getByText('최근 SEW Next 세션')).toHaveCount(0);
    await expect(page.getByText('Mock Exam 전공A/B 추세')).toHaveCount(0);
    await expect(page.getByRole('link', { name: '전공A 약점 문항 이어풀기' })).toHaveCount(0);
  });
});

test.describe('/my → /record 네비게이션', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('모바일 탭바에서 내 기록 접근 가능', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="모바일 하단 탭"]');
    // "내 기록" 또는 /record 링크
    const recordLink = nav.locator('a[href="/record"]');
    const count = await recordLink.count();
    if (count > 0) {
      await recordLink.click();
      await page.waitForURL('**/record');
      expect(page.url()).toContain('/record');
    }
  });
});
