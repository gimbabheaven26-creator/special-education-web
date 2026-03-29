import { test, expect } from '@playwright/test'

test.describe('인증 리다이렉트', () => {
  test('로그인 페이지가 렌더링된다', async ({ page }) => {
    await page.goto('/login')

    await expect(page.locator('[data-slot="card-title"]', { hasText: '나다운' })).toBeVisible()
    await expect(page.getByText('기본교육과정 기반 IEP 계획 보조도구')).toBeVisible()
    await expect(
      page.getByRole('button', { name: 'Google 계정으로 로그인' }),
    ).toBeVisible()
  })

  test('미인증 시 홈에서 /login으로 리다이렉트', async ({ page }) => {
    const response = await page.goto('/')
    expect(page.url()).toContain('/login')
    expect(response?.status()).toBeLessThan(400)
  })

  test('미인증 시 /students에서 /login?next= 으로 리다이렉트', async ({ page }) => {
    await page.goto('/students')
    expect(page.url()).toContain('/login')
    expect(page.url()).toContain('next=%2Fstudents')
  })

  test('미인증 시 /standards에서 /login으로 리다이렉트', async ({ page }) => {
    await page.goto('/standards')
    expect(page.url()).toContain('/login')
  })

  test('미인증 시 /students/new에서 /login으로 리다이렉트', async ({ page }) => {
    await page.goto('/students/new')
    expect(page.url()).toContain('/login')
    expect(page.url()).toContain('next=%2Fstudents%2Fnew')
  })
})
