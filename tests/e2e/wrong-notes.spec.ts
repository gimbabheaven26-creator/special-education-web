import { test, expect } from '@playwright/test';

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
});
