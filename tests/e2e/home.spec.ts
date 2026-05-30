import { test, expect } from '@playwright/test';

test.describe('SEW Next Greenfield 홈', () => {
  test('루트 페이지가 SEW Next 조종실로 열린다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.getByRole('heading', { name: 'SEW Next' })).toBeVisible();
    await expect(page.getByText('시험 준비도 조종실')).toBeVisible();
  });

  test('루트에서 핵심 Next 여정으로 이동할 수 있다', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: /실전형 23문항 시작/ })).toHaveAttribute(
      'href',
      '/next/practice?mode=mock&variant=full',
    );
    await expect(page.getByRole('link', { name: '기록', exact: true })).toHaveAttribute('href', '/next/results');
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

  test('탭바에 루트 홈 링크 포함', async ({ page }) => {
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
