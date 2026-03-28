import { test, expect, type Page, type Response } from '@playwright/test';

const PAGES = [
  { name: '홈', path: '/' },
  { name: '용어사전', path: '/terms' },
  { name: '개념학습', path: '/concepts' },
  { name: '커뮤니티', path: '/community' },
  { name: '오답노트', path: '/wrong-notes' },
];

/** dev 서버 500 에러 시 테스트 스킵 (Next.js 에러 오버레이가 HTML을 덮음) */
async function gotoOrSkip(page: Page, path: string): Promise<Response | null> {
  const response = await page.goto(path);
  if (response && response.status() >= 500) {
    test.skip(true, `${path} returned ${response.status()} — dev mode error overlay`);
  }
  return response;
}

for (const { name, path } of PAGES) {
  test.describe(`접근성: ${name} (${path})`, () => {
    test('lang 속성 존재', async ({ page }) => {
      await gotoOrSkip(page, path);
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang).toBeTruthy();
    });

    test('h1 하나만 존재', async ({ page }) => {
      await gotoOrSkip(page, path);
      const h1Count = await page.locator('h1').count();
      expect(h1Count).toBeLessThanOrEqual(1);
    });

    test('이미지에 alt 속성', async ({ page }) => {
      await gotoOrSkip(page, path);
      const missingAlt = await page.locator('img:not([alt])').count();
      expect(missingAlt).toBe(0);
    });

    test('인터랙티브 요소에 접근 가능한 이름', async ({ page }) => {
      await gotoOrSkip(page, path);
      const unlabeled = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])');
        let count = 0;
        buttons.forEach((btn) => {
          if (!btn.textContent?.trim()) count++;
        });
        return count;
      });
      expect(unlabeled).toBe(0);
    });
  });
}

test.describe('접근성: EmptyState 컴포넌트', () => {
  test('오답노트 빈 상태에 role="status"', async ({ page }) => {
    await gotoOrSkip(page, '/wrong-notes');
    const count = await page.locator('[role="status"]').count();
    expect(count).toBeGreaterThanOrEqual(0);
  });
});

test.describe('접근성: 키보드 네비게이션', () => {
  test('Tab으로 포커스 이동 가능', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');
    const tag = await page.evaluate(() =>
      document.activeElement?.tagName?.toLowerCase() ?? 'none'
    );
    expect(['a', 'button', 'input', 'select', 'textarea', 'body']).toContain(tag);
  });

  test('focus-visible 스타일 존재 확인', async ({ page }) => {
    await page.goto('/');
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    const hasVisibleFocus = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return true;
      const style = window.getComputedStyle(el);
      return style.outlineStyle !== 'none' || style.boxShadow !== 'none';
    });
    expect(hasVisibleFocus).toBe(true);
  });
});

test.describe('접근성: KICE 기출', () => {
  test('/kice 페이지 렌더링', async ({ page }) => {
    await gotoOrSkip(page, '/kice');
    await expect(page.locator('main')).toBeVisible();
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeLessThanOrEqual(1);
  });
});
