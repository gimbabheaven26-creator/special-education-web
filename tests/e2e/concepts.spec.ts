import { test, expect } from '@playwright/test';

test('/concepts 포털 렌더링', async ({ page }) => {
  await page.goto('/concepts');
  await expect(page.locator('h1')).toBeVisible();
});

test('/concepts 과목 접근', async ({ page }) => {
  await page.goto('/concepts');
  // 첫 번째 과목 링크 클릭
  const firstLink = page.locator('a[href^="/concepts/"]').first();
  const exists = await firstLink.count();
  if (exists > 0) {
    await firstLink.click();
    await expect(page).toHaveURL(/\/concepts\/.+/);
  }
});
