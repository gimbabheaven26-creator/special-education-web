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
});
