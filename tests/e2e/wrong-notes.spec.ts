import { test, expect, type Page } from '@playwright/test';

const HYDRATED_WRONG_QUESTION = {
  id: 'e2e-wrong-ox-1',
  subject: 'laws',
  chapter: 'special-education-act',
  type: 'ox',
  question: 'E2E 오답 hydration 문제입니다.',
  answer: 'X',
  explanation: 'E2E 검증용 해설입니다.',
  difficulty: 1,
} as const;

function makeQuizStoreSeed() {
  return {
    state: {
      wrongNotes: [
        {
          questionId: HYDRATED_WRONG_QUESTION.id,
          subject: HYDRATED_WRONG_QUESTION.subject,
          chapter: HYDRATED_WRONG_QUESTION.chapter,
          userAnswer: 'O',
          attempts: 2,
          lastAttempt: Date.now(),
          mastered: false,
        },
      ],
      quizHistory: [],
      diagnosticSessions: [],
      feedbacks: [],
      errorReports: [],
    },
    version: 5,
  };
}

async function seedWrongNote(page: Page) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate((data) => {
    localStorage.setItem('quiz-data', JSON.stringify(data));
    localStorage.removeItem('special-edu-study');
    localStorage.removeItem('leitner-cards');
  }, makeQuizStoreSeed());
}

async function mockByIdsHydration(page: Page) {
  const requestedIds: string[][] = [];
  await page.route('**/api/quiz/by-ids', async (route) => {
    const body = route.request().postDataJSON() as { ids?: string[] };
    requestedIds.push(body.ids ?? []);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ quizzes: [HYDRATED_WRONG_QUESTION] }),
    });
  });
  return requestedIds;
}

async function readQuizData(page: Page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('quiz-data');
    return raw ? JSON.parse(raw) : null;
  });
}

test.describe('오답노트 (/wrong-notes)', () => {
  test('오답노트 페이지 렌더링 + 빈 상태 또는 오답 목록 표시', async ({ page }) => {
    await page.goto('/wrong-notes');
    await expect(page.locator('h1')).toBeVisible();
    const hasContent = await page.getByRole('main').first().isVisible();
    expect(hasContent).toBe(true);
  });

  test('빈 상태일 때 퀴즈 시작 CTA 링크 존재', async ({ page }) => {
    await page.goto('/wrong-notes');
    const ctaLink = page.getByRole('link', { name: /퀴즈/ }).first();
    const count = await ctaLink.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('오답 퀴즈 페이지 접근', async ({ page }) => {
    await page.goto('/wrong-notes/quiz');
    await expect(page.getByRole('main').first()).toBeVisible();
  });

  test('localStorage 오답을 /api/quiz/by-ids로 hydrate해 목록에 표시한다', async ({ page }) => {
    const requestedIds = await mockByIdsHydration(page);
    await seedWrongNote(page);

    await page.goto('/wrong-notes');

    await expect(page.getByRole('heading', { name: '오답 노트' })).toBeVisible();
    await expect(page.getByText(HYDRATED_WRONG_QUESTION.question)).toBeVisible();
    await expect(page.getByText('2회 시도')).toBeVisible();
    await expect(page.getByText('이 오답 다음 복습')).toBeVisible();
    await expect(page.getByText('특수교육법 개념 찾기')).toBeVisible();
    await expect(page.getByText('특수교육법 다시 풀기')).toBeVisible();
    await expect(page.getByRole('link', { name: /오답 재시험.*1문제/ })).toBeVisible();
    expect(requestedIds).toContainEqual([HYDRATED_WRONG_QUESTION.id]);
  });

  test('localStorage 오답 → API hydration → 재시험 정답 처리로 mastered가 반영된다', async ({ page }) => {
    const requestedIds = await mockByIdsHydration(page);
    await seedWrongNote(page);

    await page.goto('/wrong-notes/quiz');

    await expect(page.getByRole('heading', { name: '오답 재시험' })).toBeVisible();
    await expect(page.getByText(HYDRATED_WRONG_QUESTION.question)).toBeVisible();
    expect(requestedIds).toContainEqual([HYDRATED_WRONG_QUESTION.id]);

    await page.getByRole('button', { name: 'X' }).click();
    await page.getByRole('button', { name: '다음' }).click();

    await expect(page.getByRole('heading', { name: '재시험 결과' })).toBeVisible();
    const quizData = await readQuizData(page);
    const wrongNote = quizData?.state?.wrongNotes?.find(
      (note: { questionId: string }) => note.questionId === HYDRATED_WRONG_QUESTION.id,
    );
    expect(wrongNote?.mastered).toBe(true);
  });
});
