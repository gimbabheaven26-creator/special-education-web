import { test, expect } from '@playwright/test';

test('퀴즈 페이지 렌더링 및 기본 동작', async ({ page }) => {
  await page.goto('/subjects');
  await expect(page.locator('h1')).toBeVisible();
  // 과목 목록 확인
  await expect(page.locator('[data-testid="subject-list"], .subject-card, main').first()).toBeVisible();
});
