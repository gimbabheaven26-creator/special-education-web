import { test, expect } from '@playwright/test'

test.describe('학생 등록 폼', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/students/new')
  })

  test('페이지 제목이 표시된다', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '학생 등록' })).toBeVisible()
  })

  test('목록 링크가 있다', async ({ page }) => {
    const link = page.getByRole('link', { name: '학생 목록으로 돌아가기' })
    await expect(link).toBeVisible()
  })

  test('이름 필드가 있다', async ({ page }) => {
    const input = page.getByLabel('학생 이름')
    await expect(input).toBeVisible()
    await expect(input).toHaveAttribute('required', '')
  })

  test('학년 선택이 있다', async ({ page }) => {
    const trigger = page.getByLabel('학년 선택')
    await expect(trigger).toBeVisible()
  })

  test('장애유형 필드가 있다', async ({ page }) => {
    const input = page.getByLabel('장애유형')
    await expect(input).toBeVisible()
  })

  test('메모 필드가 있다', async ({ page }) => {
    const textarea = page.getByLabel('메모')
    await expect(textarea).toBeVisible()
  })

  test('등록 버튼이 있다', async ({ page }) => {
    const button = page.getByRole('button', { name: '등록' })
    await expect(button).toBeVisible()
    await expect(button).toBeEnabled()
  })

  test('이름을 입력할 수 있다', async ({ page }) => {
    const input = page.getByLabel('학생 이름')
    await input.fill('김민수')
    await expect(input).toHaveValue('김민수')
  })

  test('장애유형을 입력할 수 있다', async ({ page }) => {
    const input = page.getByLabel('장애유형')
    await input.fill('지적장애')
    await expect(input).toHaveValue('지적장애')
  })

  test('키보드로 탭 순서가 올바르다', async ({ page }) => {
    await page.keyboard.press('Tab') // 목록 링크
    await page.keyboard.press('Tab') // 이름
    const nameInput = page.getByLabel('학생 이름')
    await expect(nameInput).toBeFocused()
  })
})
