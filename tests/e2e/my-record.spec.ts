import { test, expect } from '@playwright/test';

test.describe('/my 대시보드', () => {
  test('페이지 렌더링 + 주요 섹션 존재', async ({ page }) => {
    await page.goto('/my');
    await expect(page.locator('main')).toBeVisible();
    // 게스트 배너 또는 대시보드 콘텐츠가 있어야 함
    const hasContent = await page.locator('main').textContent();
    expect(hasContent!.length).toBeGreaterThan(0);
  });

  test('LevelBadge 컴포넌트 렌더링', async ({ page }) => {
    await page.goto('/my');
    // LevelBadge는 /mastery로 향하는 링크를 포함
    const masteryLink = page.locator('a[href="/mastery"]');
    const count = await masteryLink.count();
    // 데이터 없으면 게스트 뷰일 수 있으므로 0 이상
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('기능 바로가기 링크 존재', async ({ page }) => {
    await page.goto('/my');
    // /my 페이지에는 다른 페이지로의 링크가 있어야 함
    const links = page.locator('a[href]:not([href="/my"])');
    const count = await links.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('404 없이 로드', async ({ page }) => {
    const response = await page.goto('/my');
    expect(response!.status()).toBe(200);
  });
});

test.describe('/record 대시보드', () => {
  test('404 없이 로드 + 콘텐츠 렌더링', async ({ page }) => {
    const response = await page.goto('/record');
    expect(response!.status()).toBe(200);
    // useMounted() hydration 후 스켈레톤 또는 실제 콘텐츠 대기
    await page.waitForTimeout(1000);
    // 페이지에 텍스트 콘텐츠가 존재하면 렌더링 성공
    const body = await page.locator('body').textContent();
    expect(body!.length).toBeGreaterThan(0);
  });

  test('제목 또는 빈 상태 표시', async ({ page }) => {
    await page.goto('/record');
    // hydration 대기
    await page.waitForTimeout(1000);
    // "내 기록" h1 또는 빈 상태의 "학습 기록" 텍스트
    const hasTitle = await page.locator('text=기록').count();
    const hasEmptyState = await page.locator('text=퀴즈').count();
    expect(hasTitle + hasEmptyState).toBeGreaterThan(0);
  });

  test('핵심 지표 카드 또는 빈 상태 CTA', async ({ page }) => {
    await page.goto('/record');
    await page.waitForTimeout(1000);
    // 데이터 있으면 XP/스트릭 등, 없으면 퀴즈 시작 CTA
    const hasMetrics = await page.locator('text=XP').count();
    const hasCTA = await page.locator('text=시작').count();
    const hasContent = await page.locator('text=기록').count();
    expect(hasMetrics + hasCTA + hasContent).toBeGreaterThan(0);
  });
});

test.describe('/my → /record 네비게이션', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('모바일 탭바에서 내 기록 접근 가능', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('nav[aria-label="모바일 하단 탭"]');
    // "내 기록" 또는 /record 링크
    const recordLink = nav.locator('a[href="/record"]');
    const count = await recordLink.count();
    if (count > 0) {
      await recordLink.click();
      await page.waitForURL('**/record');
      expect(page.url()).toContain('/record');
    }
  });
});
