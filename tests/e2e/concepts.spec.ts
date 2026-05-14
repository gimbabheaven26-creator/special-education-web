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

test('/concepts 상세에서 기출·퀴즈 다음 행동 CTA 표시', async ({ page }) => {
  await page.goto('/concepts/관련%20법령/특수교육법총칙과국가의무');

  await expect(page.getByRole('heading', { name: /특수교육법/ })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('바로 이어서')).toBeVisible();
  await expect(page.getByRole('link', { name: /기출 .*건 확인/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /관련 퀴즈 풀기/ })).toHaveAttribute('href', '/quiz/laws');
});
