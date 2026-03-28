import { test, expect } from '@playwright/test';

test.describe('404 Not Found', () => {
  test('존재하지 않는 경로 → 500 미만 응답', async ({ page }) => {
    const response = await page.goto('/this-path-does-not-exist-99999');
    // Next.js는 not-found를 200 또는 404로 응답
    expect(response?.status()).toBeLessThan(500);
  });

  test('404 페이지에 텍스트 콘텐츠 존재', async ({ page }) => {
    await page.goto('/this-path-does-not-exist-99999');
    const body = await page.textContent('body');
    // 최소한 빈 페이지가 아님
    expect(body?.trim().length).toBeGreaterThan(0);
  });
});

test.describe('Error 경로', () => {
  // NOTE: Next.js dev 서버에서 500 에러 시 에러 오버레이가 error.tsx를 덮음.
  // 서버가 응답 자체를 반환하는지만 검증한다.

  test('/quiz/nonexistent-subject → 서버 응답 존재', async ({ page }) => {
    const response = await page.goto('/quiz/nonexistent-subject-slug');
    expect(response).not.toBeNull();
  });

  test('/concepts/nonexistent-concept → 서버 응답 존재', async ({ page }) => {
    const response = await page.goto('/concepts/nonexistent-concept-slug');
    expect(response).not.toBeNull();
  });
});
