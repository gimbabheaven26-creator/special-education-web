import { test, expect } from '@playwright/test';

test('오답노트 페이지 렌더링', async ({ page }) => {
  await page.goto('/wrong-notes');
  await expect(page.locator('h1')).toBeVisible();
  // 빈 상태 또는 오답 목록이 표시되는지 확인
  await expect(page.locator('main')).toBeVisible();
});

test('오답 퀴즈 페이지 접근', async ({ page }) => {
  await page.goto('/wrong-notes/quiz');
  // 오답 없으면 빈 상태, 있으면 퀴즈 렌더링
  await expect(page.locator('main')).toBeVisible();
});
