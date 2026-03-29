import { test, expect } from '@playwright/test'

test.describe('로그인 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('브랜드 텍스트가 표시된다', async ({ page }) => {
    const title = page.locator('[data-slot="card-title"]', { hasText: '나다운' })
    await expect(title).toBeVisible()
  })

  test('구글 로그인 버튼이 있다', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Google 계정으로 로그인' })
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
  })

  test('구글 로그인 버튼에 aria-label이 있다', async ({ page }) => {
    const button = page.getByRole('button', { name: 'Google 계정으로 로그인' })
    await expect(button).toHaveAttribute('aria-label', 'Google 계정으로 로그인')
  })

  test('구글 아이콘 SVG에 aria-hidden이 있다', async ({ page }) => {
    const svg = page.locator('button svg')
    await expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  test('카드가 중앙 정렬되어 있다', async ({ page }) => {
    const container = page.locator('.flex.min-h-dvh.items-center.justify-center')
    await expect(container).toBeVisible()
  })

  test('키보드로 로그인 버튼에 접근 가능하다', async ({ page }) => {
    await page.keyboard.press('Tab')
    const button = page.getByRole('button', { name: 'Google 계정으로 로그인' })
    await expect(button).toBeFocused()
  })
})
