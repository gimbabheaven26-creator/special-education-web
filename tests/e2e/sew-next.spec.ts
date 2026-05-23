import { test, expect } from '@playwright/test';

test.describe('SEW Next prototype (/next)', () => {
  test('readiness cockpit and prescribed session render above the fold', async ({ page }) => {
    await page.goto('/next');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('heading', { name: 'SEW Next' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('2027 특수교육 임용 Readiness')).toBeVisible();
    await expect(page.getByText('오늘의 처방')).toBeVisible();
    await expect(page.getByText('긍정적 행동지원과 기능평가')).toBeVisible();
    await expect(page.getByRole('button', { name: /Adaptive/ })).toHaveAttribute('aria-pressed', 'true');
  });

  test('practice mode switch updates the session panel', async ({ page }) => {
    await page.goto('/next');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('button', { name: /Mock/ }).click();

    await expect(page.getByRole('button', { name: /Mock/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: '실전 모의고사' })).toBeVisible();
    await expect(page.getByText('모의고사 예약')).toBeVisible();
  });

  test('custom qbank opens a native filter builder and starts a custom session', async ({ page }) => {
    await page.goto('/next');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('button', { name: /Custom Qbank/ }).click();
    await expect(page.getByRole('link', { name: /문제은행 구성/ })).toHaveAttribute('href', '/next/qbank');
    await page.getByRole('link', { name: /문제은행 구성/ }).click();

    await expect(page).toHaveURL(/\/next\/qbank/);
    await expect(page.getByRole('heading', { name: 'SEW Next Qbank' })).toBeVisible();
    await expect(page.getByRole('button', { name: '특수교육공학' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText('실제 DB 문제은행')).toBeVisible();
    await expect(page.getByText(/매칭 문항 \d+개/)).toBeVisible();
    await expect(page.getByText('대표 문항')).toBeVisible();
    await page.getByRole('button', { name: '정서행동장애' }).click();
    await page.getByRole('button', { name: '상' }).click();
    await page.getByRole('button', { name: '용어 구분' }).click();
    await expect(page.getByText('선택된 세션')).toBeVisible();
    await expect(page.getByRole('link', { name: /커스텀 세션 시작/ })).toHaveAttribute(
      'href',
      /\/next\/practice\?mode=custom&domain=.*&difficulty=.*&format=.*/,
    );

    await page.getByRole('link', { name: /커스텀 세션 시작/ }).click();
    await expect(page).toHaveURL(/\/next\/practice\?mode=custom/);
    await expect(page.getByText('Custom Qbank Session')).toBeVisible();
    await expect(page.getByText(/정서행동장애 · 상 · 용어 구분/)).toBeVisible();
    await expect(page.getByText('상 난도 우선')).toBeVisible();
  });

  test('mock and review practice modes open native sessions', async ({ page }) => {
    await page.goto('/next');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('button', { name: /Mock/ }).click();
    await expect(page.getByRole('link', { name: /모의고사 예약/ })).toHaveAttribute(
      'href',
      '/next/practice?mode=mock',
    );
    await page.getByRole('link', { name: /모의고사 예약/ }).click();
    await expect(page).toHaveURL(/\/next\/practice\?mode=mock/);
    await expect(page.getByText('Mock Exam Drill')).toBeVisible();
    await expect(page.getByText('Mock timer')).toBeVisible();
    await expect(page.getByText('영역 배분')).toBeVisible();
    await expect(page.getByText('IEP 회의에서 우선 검토')).toBeVisible();

    await page.goto('/next');
    await page.getByRole('button', { name: /Review/ }).click();
    await expect(page.getByRole('link', { name: /복습 큐 열기/ })).toHaveAttribute(
      'href',
      '/next/practice?mode=review',
    );
    await page.getByRole('link', { name: /복습 큐 열기/ }).click();
    await expect(page).toHaveURL(/\/next\/practice\?mode=review/);
    await expect(page.getByText('Spaced Review Session')).toBeVisible();
    await expect(page.getByText('기능평가와 선호도 평가를 구분')).toBeVisible();
  });

  test('adaptive primary action opens a native SEW Next practice session', async ({ page }) => {
    await page.goto('/next');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('link', { name: /처방 세션 시작/ })).toHaveAttribute(
      'href',
      '/next/practice?mode=adaptive',
    );

    await page.getByRole('link', { name: /처방 세션 시작/ }).click();

    await expect(page).toHaveURL(/\/next\/practice\?mode=adaptive/);
    await expect(page.getByRole('heading', { name: 'SEW Next Practice' })).toBeVisible();
    await expect(page.getByText('기능평가의 핵심 목적')).toBeVisible();
    await page.getByRole('radio', { name: /행동의 기능을 파악/ }).check();
    await page.getByRole('button', { name: '제출하고 해설 보기' }).click();
    await expect(page.getByText('정답입니다')).toBeVisible();
    await expect(page.getByText('AI Answer Coach')).toBeVisible();
    await expect(page.getByText('24시간 후 재인출')).toBeVisible();
  });

  test('native practice submission updates study and quiz history stores', async ({ page }) => {
    await page.goto('/next/practice?mode=adaptive');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('radio', { name: /행동의 기능을 파악/ }).check();
    await page.getByRole('button', { name: '제출하고 해설 보기' }).click();
    await expect(page.getByText('정답입니다')).toBeVisible();

    const stores = await page.evaluate(() => {
      const study = JSON.parse(localStorage.getItem('special-edu-study') ?? '{}');
      const quiz = JSON.parse(localStorage.getItem('quiz-data') ?? '{}');
      return {
        study: study.state,
        quiz: quiz.state,
      };
    });

    expect(stores.study.totalQuizzes).toBe(1);
    expect(stores.study.totalCorrect).toBe(1);
    expect(stores.study.dailyProgress.quizzesCompleted).toBe(1);
    expect(stores.study.dailyProgress.quizzesCorrect).toBe(1);
    expect(stores.quiz.quizHistory).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          questionId: 'next-adaptive-fba-01',
          isCorrect: true,
          subject: '정서행동장애',
          chapter: '긍정적 행동지원, 기능평가, 중재 충실도',
          sessionId: 'sew-next-adaptive',
        }),
      ]),
    );
  });

  test('practice result is reflected on the readiness cockpit', async ({ page }) => {
    await page.goto('/next/practice?mode=adaptive');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('radio', { name: /행동의 기능을 파악/ }).check();
    await page.getByRole('button', { name: '제출하고 해설 보기' }).click();
    await expect(page.getByText('정답입니다')).toBeVisible();

    await page.goto('/next');
    await expect(page.getByText('최근 1문항 · 정답률 100%')).toBeVisible();
    await expect(page.locator('#readiness').getByText('69%').first()).toBeVisible();
  });

  test('native practice session advances through the queue and ends with a summary', async ({ page }) => {
    await page.goto('/next/practice?mode=adaptive');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText('문항 1 / 2')).toBeVisible();
    await page.getByRole('radio', { name: /행동의 기능을 파악/ }).check();
    await page.getByRole('button', { name: '제출하고 해설 보기' }).click();
    await page.getByRole('button', { name: '다음 문항' }).click();

    await expect(page.getByText('문항 2 / 2')).toBeVisible();
    await expect(page.getByText('ABC 기록에서 후속결과')).toBeVisible();
    await page.getByRole('radio', { name: /행동 직후 따라오는 반응/ }).check();
    await page.getByRole('button', { name: '제출하고 해설 보기' }).click();

    await expect(page.getByRole('heading', { name: '세션 요약' })).toBeVisible();
    await expect(page.getByText('2문항 중 2문항 정답')).toBeVisible();
    await expect(page.getByText('예상 준비도 상승 +3.2p')).toBeVisible();
  });

  test('mock exam ends with a timed domain report', async ({ page }) => {
    await page.goto('/next/practice?mode=mock');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('radio', { name: /현재 수행 수준과 평가 결과/ }).check();
    await page.getByRole('button', { name: '제출하고 해설 보기' }).click();
    await page.getByRole('button', { name: '다음 문항' }).click();
    await page.getByRole('radio', { name: /행동 직후 따라오는 반응/ }).check();
    await page.getByRole('button', { name: '제출하고 해설 보기' }).click();

    await expect(page.getByRole('heading', { name: 'Mock Exam 리포트' })).toBeVisible();
    await expect(page.getByRole('button', { name: '세션 완료' })).toBeVisible();
    await expect(page.getByText('영역별 결과')).toBeVisible();
    await expect(page.getByText('시간 관리 안정')).toBeVisible();
    await expect(page.getByText('함정 선지 0개')).toBeVisible();
  });

  test('record dashboard highlights completed SEW Next session', async ({ page }) => {
    await page.goto('/next/practice?mode=adaptive');
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('radio', { name: /행동의 기능을 파악/ }).check();
    await page.getByRole('button', { name: '제출하고 해설 보기' }).click();
    await page.getByRole('button', { name: '다음 문항' }).click();
    await page.getByRole('radio', { name: /행동 직후 따라오는 반응/ }).check();
    await page.getByRole('button', { name: '제출하고 해설 보기' }).click();

    await page.goto('/record');

    await expect(page.getByText('최근 SEW Next 세션')).toBeVisible();
    await expect(page.getByText('Adaptive Readiness')).toBeVisible();
    await expect(page.getByText('2문항 · 100%')).toBeVisible();
    await expect(page.getByText('정서행동장애', { exact: true })).toBeVisible();
  });

  test('top navigation links to cockpit sections and live Classic routes', async ({ page }) => {
    await page.goto('/next');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('link', { name: 'Readiness' })).toHaveAttribute('href', '#readiness');
    await expect(page.getByRole('link', { name: 'Practice' })).toHaveAttribute('href', '#practice');
    await expect(page.getByRole('link', { name: 'Mock Exam' })).toHaveAttribute('href', '/next/practice?mode=mock');
    await expect(page.getByRole('link', { name: 'Library' })).toHaveAttribute('href', '/concepts');
    await expect(page.getByRole('link', { name: 'Analytics' })).toHaveAttribute('href', '/record');
    await expect(page.getByRole('link', { name: 'AI Lab' })).toHaveAttribute('href', '/admin/ai-generate');

    await page.getByRole('link', { name: 'Practice' }).click();
    await expect(page.locator('#practice')).toBeInViewport();
  });
});
