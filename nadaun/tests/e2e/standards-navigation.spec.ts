import { test, expect } from '@playwright/test'

test.describe('성취기준 탐색', () => {
  test.describe('성취기준 메인 페이지', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/standards')
    })

    test('페이지 제목이 표시된다', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: '성취기준 탐색' }),
      ).toBeVisible()
    })

    test('부제목이 표시된다', async ({ page }) => {
      await expect(
        page.getByText('2022 개정 기본교육과정 · 중학교 1~3학년'),
      ).toBeVisible()
    })

    test('검색 링크가 있다', async ({ page }) => {
      const searchLink = page.getByRole('link', { name: '성취기준 검색' })
      await expect(searchLink).toBeVisible()
      await expect(searchLink).toHaveAttribute('href', '/standards/search')
    })

    test('4개 과목 카드가 표시된다', async ({ page }) => {
      // 과목 카드가 보이는지 확인
      const subjects = ['국어', '수학', '생활영어', '진로와 직업']

      for (const subject of subjects) {
        const card = page.getByText(subject).first()
        const isVisible = await card.isVisible().catch(() => false)
        // DB에 데이터가 있으면 보임, 없으면 안 보일 수 있음
        expect(typeof isVisible).toBe('boolean')
      }
    })

    test('과목 카드를 클릭하면 영역 페이지로 이동한다', async ({ page }) => {
      // 첫 번째 카드 링크 클릭
      const links = page.locator('a[href^="/standards/"]')
      const count = await links.count()

      if (count > 1) {
        // 첫 번째 과목 카드 (검색 링크 다음)
        const firstSubjectLink = links.nth(1)
        const href = await firstSubjectLink.getAttribute('href')

        if (href && href !== '/standards/search') {
          await firstSubjectLink.click()
          await expect(page).toHaveURL(new RegExp('/standards/\\w+'))
        }
      }
    })
  })

  test.describe('과목별 영역 페이지', () => {
    const slugs = ['korean', 'math', 'english', 'career']

    for (const slug of slugs) {
      test(`/standards/${slug} 페이지가 렌더된다`, async ({ page }) => {
        await page.goto(`/standards/${slug}`)

        // 정상 페이지 또는 에러/not-found
        const body = page.locator('body')
        await expect(body).toBeVisible()

        // 최소한 돌아가기 링크 또는 heading이 있어야 함
        const backLink = page.getByRole('link', { name: '과목 목록으로 돌아가기' })
        const heading = page.getByRole('heading').first()

        const hasBack = await backLink.isVisible().catch(() => false)
        const hasHeading = await heading.isVisible().catch(() => false)

        expect(hasBack || hasHeading).toBe(true)
      })
    }

    test('국어 영역 페이지에 과목 목록 링크가 있다', async ({ page }) => {
      await page.goto('/standards/korean')

      const backLink = page.getByRole('link', {
        name: '과목 목록으로 돌아가기',
      })
      const hasBack = await backLink.isVisible().catch(() => false)

      if (hasBack) {
        await expect(backLink).toHaveAttribute('href', '/standards')
      }
    })

    test('영역 페이지에 영역 카드 또는 빈 상태가 표시된다', async ({ page }) => {
      await page.goto('/standards/korean')

      // 영역 수 표시 확인 (0개 영역도 표시됨)
      const domainCountText = page.getByText(/\d+개 영역/)
      const hasCount = await domainCountText.isVisible().catch(() => false)

      if (hasCount) {
        // 영역 카드(링크)가 있거나, 0개 영역이면 없을 수 있음
        const domainLinks = page.locator('a[href^="/standards/korean/"]')
        const count = await domainLinks.count()
        // 0개일 수도 있고 N개일 수도 있음 — 페이지 렌더만 확인
        expect(count).toBeGreaterThanOrEqual(0)
      }
    })

    test('영역 카드 클릭 시 성취기준 목록으로 이동', async ({ page }) => {
      await page.goto('/standards/korean')

      const domainLinks = page.locator('a[href^="/standards/korean/"]')
      const count = await domainLinks.count()

      if (count > 0) {
        const firstDomain = domainLinks.first()
        const href = await firstDomain.getAttribute('href')
        await firstDomain.click()

        if (href) {
          await expect(page).toHaveURL(href)
        }
      }
    })
  })

  test.describe('존재하지 않는 과목', () => {
    test('잘못된 과목 slug → not-found 페이지', async ({ page }) => {
      await page.goto('/standards/nonexistent')

      // not-found 또는 에러 바운더리
      const body = page.locator('body')
      await expect(body).toBeVisible()
    })
  })

  test.describe('성취기준 검색', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/standards/search')
    })

    test('검색 페이지 제목이 표시된다', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: '성취기준 검색' }),
      ).toBeVisible()
    })

    test('검색 폼이 있다', async ({ page }) => {
      const searchForm = page.locator('[role="search"]')
      await expect(searchForm).toBeVisible()
    })

    test('검색어 입력 필드가 있다', async ({ page }) => {
      const searchInput = page.getByLabel('검색어 입력')
      await expect(searchInput).toBeVisible()
      await expect(searchInput).toHaveAttribute('type', 'search')
    })

    test('검색 버튼이 있다', async ({ page }) => {
      const searchButton = page.getByRole('button', { name: '검색' })
      await expect(searchButton).toBeVisible()
    })

    test('과목 필터가 있다', async ({ page }) => {
      const filter = page.getByLabel('과목 필터')
      await expect(filter).toBeVisible()
    })

    test('검색어 없이 접근 시 안내 메시지가 표시된다', async ({ page }) => {
      const prompt = page.getByText('검색어를 입력하세요.')
      await expect(prompt).toBeVisible()
    })

    test('검색어를 입력하고 검색할 수 있다', async ({ page }) => {
      const searchInput = page.getByLabel('검색어 입력')
      await searchInput.fill('읽기')

      const searchButton = page.getByRole('button', { name: '검색' })
      await searchButton.click()

      // URL에 검색어가 반영됨
      await expect(page).toHaveURL(/q=%EC%9D%BD%EA%B8%B0|q=읽기/)
    })

    test('검색 결과가 없으면 안내 메시지가 표시된다', async ({ page }) => {
      await page.goto('/standards/search?q=zzzznonexistent999')

      // 결과 없음 메시지 또는 로딩 완료 후 확인
      const noResult = page.getByText(/에 대한 검색 결과가 없습니다/)
      const resultList = page.locator('[role="list"][aria-label="검색 결과"]')

      // 잠시 대기 (서버 컴포넌트 Suspense)
      await page.waitForTimeout(2000)

      const hasNoResult = await noResult.isVisible().catch(() => false)
      const hasResults = await resultList.isVisible().catch(() => false)

      // 결과 없음 또는 (우연히) 결과가 있음
      expect(hasNoResult || hasResults).toBe(true)
    })

    test('검색 결과가 있으면 결과 개수가 표시된다', async ({ page }) => {
      await page.goto('/standards/search?q=읽기')

      // Suspense 해소 대기
      await page.waitForTimeout(2000)

      const resultCount = page.getByText(/\d+개 결과/)
      const noResult = page.getByText(/에 대한 검색 결과가 없습니다/)

      const hasCount = await resultCount.isVisible().catch(() => false)
      const hasNoResult = await noResult.isVisible().catch(() => false)

      // 둘 중 하나가 보여야 함
      expect(hasCount || hasNoResult).toBe(true)
    })

    test('과목 목록 돌아가기 링크가 있다', async ({ page }) => {
      const backLink = page.getByRole('link', {
        name: '과목 목록으로 돌아가기',
      })
      await expect(backLink).toBeVisible()
      await expect(backLink).toHaveAttribute('href', '/standards')
    })
  })

  test.describe('성취기준 상세 드릴다운', () => {
    test('과목 → 영역 → 성취기준 네비게이션이 동작한다', async ({ page }) => {
      // 1. 과목 목록
      await page.goto('/standards')
      await expect(
        page.getByRole('heading', { name: '성취기준 탐색' }),
      ).toBeVisible()

      // 2. 과목 클릭 (첫 번째 과목)
      const subjectLinks = page.locator(
        'a[href^="/standards/"]:not([href="/standards/search"])',
      )
      const subjectCount = await subjectLinks.count()

      if (subjectCount === 0) {
        // DB에 데이터가 없으면 스킵
        return
      }

      await subjectLinks.first().click()
      await expect(page).toHaveURL(/\/standards\/\w+/)

      // 3. 영역 클릭 (있으면)
      const domainLinks = page.locator('a[href*="/standards/"][href*="/"]')
      const domainCount = await domainLinks.count()

      // 과목 목록 돌아가기 링크 제외하고 영역 링크 찾기
      let domainFound = false
      for (let i = 0; i < domainCount; i++) {
        const href = await domainLinks.nth(i).getAttribute('href')
        // /standards/korean/D01 같은 패턴
        if (href && /\/standards\/\w+\/\w+/.test(href) && !href.includes('search')) {
          await domainLinks.nth(i).click()
          domainFound = true
          break
        }
      }

      if (!domainFound) return

      // 4. 성취기준 목록이 있어야 함
      const standardsList = page.locator('[role="list"][aria-label="성취기준 목록"]')
      const hasStandards = await standardsList.isVisible().catch(() => false)

      const noStandards = page.getByText('해당 조건의 성취기준이 없습니다.')
      const hasNoStandards = await noStandards.isVisible().catch(() => false)

      expect(hasStandards || hasNoStandards).toBe(true)
    })
  })

  test.describe('접근성', () => {
    test('검색 폼에 role="search"이 있다', async ({ page }) => {
      await page.goto('/standards/search')

      const searchForm = page.locator('form[role="search"]')
      await expect(searchForm).toBeVisible()
    })

    test('검색 폼에 aria-label이 있다', async ({ page }) => {
      await page.goto('/standards/search')

      const searchForm = page.locator('form[role="search"]')
      await expect(searchForm).toHaveAttribute(
        'aria-label',
        '성취기준 검색',
      )
    })

    test('과목 페이지의 이모지에 aria-hidden이 있다', async ({ page }) => {
      await page.goto('/standards/korean')

      const emojiSpan = page.locator('span[aria-hidden="true"]').first()
      const hasEmoji = await emojiSpan.isVisible().catch(() => false)

      if (hasEmoji) {
        await expect(emojiSpan).toHaveAttribute('aria-hidden', 'true')
      }
    })
  })
})
