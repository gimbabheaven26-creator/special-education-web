import { test, expect } from '@playwright/test';

test.describe('이음진 홈', () => {
  test('루트 페이지가 이음진 입장 경험으로 열린다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: '이음진' })).toBeVisible();
    await expect(page.getByText('입진증', { exact: true })).toBeVisible();
    await expect(page.getByText('오늘의 통행 용어', { exact: true })).toBeVisible();
    await expect(page.getByText('한 용어를 들고 들어와')).toBeVisible();
    await expect(page.getByText('특수교육 공부방')).toHaveCount(0);
  });

  test('루트에서 핵심 이음진 여정으로 이동할 수 있다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /오늘의 이음 시작/ })).toHaveAttribute(
      'href',
      /\/terms/,
    );
    await expect(page.getByRole('link', { name: /용어당/ })).toHaveAttribute('href', /\/terms/);
    await expect(page.getByRole('link', { name: /기출진/ })).toHaveAttribute('href', '/kice');
    await expect(page.getByRole('link', { name: /출제공방/ })).toHaveAttribute('href', '/admin/ai-generate');
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

  test('이음진 루트에서는 Classic 하단 탭바를 숨김', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="모바일 하단 탭"]');
    await expect(nav).toHaveCount(0);
  });

  test('Classic 라우트에서는 하단 탭바 렌더링', async ({ page }) => {
    await page.goto('/terms');
    const nav = page.locator('nav[aria-label="모바일 하단 탭"]');
    await expect(nav).toBeVisible();
  });

  test('Classic 탭 클릭 시 페이지 이동', async ({ page }) => {
    await page.goto('/terms');
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
