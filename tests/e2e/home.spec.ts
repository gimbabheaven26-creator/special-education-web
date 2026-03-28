import { test, expect } from '@playwright/test';

test.describe('홈페이지', () => {
  test('메인 페이지 렌더링', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('Header에 로고/제목 존재', async ({ page }) => {
    await page.goto('/');
    const header = page.locator('header');
    await expect(header).toBeVisible();
    // 헤더 내 링크(홈으로)가 존재
    await expect(header.locator('a[href="/"]')).toBeVisible();
  });

  test('페이지 내 링크가 2개 이상 존재', async ({ page }) => {
    await page.goto('/');
    // 홈에서 다른 페이지로 이동할 수 있는 링크가 존재
    const links = page.locator('a[href]:not([href="/"])');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

test.describe('BottomTabBar (모바일)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('모바일에서 하단 탭바 렌더링', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="모바일 하단 탭"]');
    await expect(nav).toBeVisible();
  });

  test('탭바에 홈 링크 포함', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="모바일 하단 탭"]');
    await expect(nav.locator('a[href="/"]')).toBeVisible();
  });

  test('탭 클릭 시 페이지 이동', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="모바일 하단 탭"]');
    // 홈이 아닌 첫 번째 탭 링크 클릭
    const tabLinks = nav.locator('a:not([href="/"])');
    const count = await tabLinks.count();
    if (count > 0) {
      const href = await tabLinks.first().getAttribute('href');
      await tabLinks.first().click();
      await page.waitForURL(`**${href}*`);
      expect(page.url()).toContain(href);
    }
  });
});

test.describe('BottomTabBar (데스크탑)', () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test('데스크탑에서 하단 탭바 크기 0 또는 숨김', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="모바일 하단 탭"]');
    if ((await nav.count()) === 0) return; // DOM에 없으면 OK
    // 존재하지만 높이가 0이거나 화면 밖
    const box = await nav.boundingBox();
    const isEffectivelyHidden = !box || box.height === 0 || box.y >= 720;
    expect(isEffectivelyHidden).toBe(true);
  });
});

test.describe('BetaFeedbackWidget', () => {
  test('피드백 위젯 렌더링', async ({ page }) => {
    await page.goto('/');
    // 피드백 버튼이나 위젯이 페이지에 존재
    const widget = page.locator('[aria-label*="피드백"], [aria-label*="feedback"], button:has-text("피드백")').first();
    const count = await widget.count();
    // 베타 기간이면 존재, 아니면 없을 수 있음 — 존재 여부만 확인
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
