import { test, expect } from '@playwright/test';

test('/community 갤러리 렌더링', async ({ page }) => {
  await page.goto('/community');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
});
