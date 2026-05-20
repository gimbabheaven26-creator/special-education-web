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

  test('top navigation links to cockpit sections and live Classic routes', async ({ page }) => {
    await page.goto('/next');
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByRole('link', { name: 'Readiness' })).toHaveAttribute('href', '#readiness');
    await expect(page.getByRole('link', { name: 'Practice' })).toHaveAttribute('href', '#practice');
    await expect(page.getByRole('link', { name: 'Mock Exam' })).toHaveAttribute('href', '/kice/exam');
    await expect(page.getByRole('link', { name: 'Library' })).toHaveAttribute('href', '/concepts');
    await expect(page.getByRole('link', { name: 'Analytics' })).toHaveAttribute('href', '/record');
    await expect(page.getByRole('link', { name: 'AI Lab' })).toHaveAttribute('href', '/admin/ai-generate');

    await page.getByRole('link', { name: 'Practice' }).click();
    await expect(page.locator('#practice')).toBeInViewport();
  });
});
