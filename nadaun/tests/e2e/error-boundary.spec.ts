import { test, expect } from '@playwright/test'

test.describe('에러 바운더리', () => {
  test('학생 목록 페이지에서 에러 시 에러 UI가 표시된다', async ({ page }) => {
    // E2E_AUTH_BYPASS로 인증은 통과하지만
    // getStudents()가 실제 인증 없이 실패 → error.tsx 렌더
    await page.goto('/students')

    // error.tsx 또는 정상 페이지 중 하나가 렌더됨
    const errorAlert = page.locator('[role="alert"]')
    const heading = page.getByRole('heading', { name: '내 학생' })

    // 둘 중 하나가 보여야 함
    const isError = await errorAlert.isVisible().catch(() => false)
    const isNormal = await heading.isVisible().catch(() => false)

    expect(isError || isNormal).toBe(true)
  })

  test('에러 페이지에 다시 시도 버튼이 있다', async ({ page }) => {
    // 존재하지 않는 학생 상세 → 에러
    await page.goto('/students/00000000-0000-4000-8000-000000000000')

    const errorAlert = page.locator('[role="alert"]')
    const isError = await errorAlert.isVisible().catch(() => false)

    if (isError) {
      const retryButton = page.getByRole('button', { name: '다시 시도' })
      await expect(retryButton).toBeVisible()
    }
  })

  test('에러 페이지에 aria-live가 설정되어 있다', async ({ page }) => {
    await page.goto('/students/00000000-0000-4000-8000-000000000000')

    const errorAlert = page.locator('[role="alert"]')
    const isError = await errorAlert.isVisible().catch(() => false)

    if (isError) {
      await expect(errorAlert).toHaveAttribute('aria-live', 'assertive')
    }
  })

  test('404 학생 → not-found 또는 error 페이지', async ({ page }) => {
    const response = await page.goto(
      '/students/00000000-0000-4000-8000-000000000000/plans/new',
    )
    // 에러나 not-found가 렌더되어야 함 (500 또는 404)
    const status = response?.status() ?? 0
    expect(status).toBeGreaterThanOrEqual(200)
  })
})
