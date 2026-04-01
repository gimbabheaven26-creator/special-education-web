import { test, expect } from '@playwright/test';

test('로그인 페이지 렌더링', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('h1')).toBeVisible();
  // 이메일 입력 필드
  await expect(page.locator('input[type="email"]')).toBeVisible();
  // Google 로그인 버튼
  await expect(page.locator('button:has-text("Google")')).toBeVisible();
});

test('게스트로 계속하기 링크', async ({ page }) => {
  await page.goto('/login');
  const guestLink = page.getByRole('link', { name: '로그인 없이 계속하기' });
  await expect(guestLink).toBeVisible();
  await guestLink.click();
  await page.waitForURL('/');
  expect(page.url()).toContain('/');
});
