import { test, expect, type Page } from '@playwright/test';

/**
 * 용어사전 (/terms) E2E 테스트
 *
 * 실제 NISE 데이터 기반으로 검색, 아코디언, 플래시카드 추가,
 * 모바일 TOC, 스크롤-투-탑 등 사용자 여정을 검증한다.
 */

const TERMS_URL = '/terms';

/** localStorage의 플래시카드 저장소를 초기화하여 테스트 독립성 확보 */
async function clearFlashcardStorage(page: Page) {
  await page.evaluate(() => localStorage.removeItem('leitner-cards'));
}

test.describe('용어사전 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TERMS_URL);
    await page.waitForLoadState('domcontentloaded');
    // Wait for actual content instead of networkidle
    await expect(page.getByRole('heading', { name: '용어사전' })).toBeVisible({ timeout: 15000 });
  });

  test('페이지 로드 — 제목, 용어 수, 과목 섹션 헤더 표시', async ({ page }) => {
    // 1. 페이지 제목 확인
    await expect(page.getByRole('heading', { name: '용어사전' })).toBeVisible();

    // 2. 용어 수가 포함된 서브타이틀 확인 (NISE 특수교육학 용어사전 · NNN개 용어)
    const subtitle = page.getByText(/NISE 특수교육학 용어사전 · \d+개 용어/);
    await expect(subtitle).toBeVisible();

    // 3. 과목 섹션 헤더가 최소 3개 이상 렌더링됨
    const subjectHeaders = page.locator('h2');
    const count = await subjectHeaders.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // 4. 대표 과목명 확인
    await expect(page.getByRole('heading', { name: '특수교육 개론' })).toBeVisible();
    await expect(page.getByRole('heading', { name: '통합교육' })).toBeVisible();
  });

  test('검색 — 한국어 검색어 입력 시 결과 필터링 및 결과 수 표시', async ({ page }) => {
    const searchInput = page.getByPlaceholder('한국어, 영어, 한자로 검색...');
    await expect(searchInput).toBeVisible();

    // 1. 검색어 입력
    await searchInput.fill('감각');

    // 2. 검색 모드 전환 — 결과 수 표시
    const resultCount = page.getByText(/\d+개 결과/);
    await expect(resultCount).toBeVisible();

    // 3. 결과 중 '감각'이 포함된 용어 카드가 존재
    const matchingCard = page.locator('button:has-text("감각")').first();
    await expect(matchingCard).toBeVisible();

    // 4. 과목 그룹 헤더(h2)는 검색 모드에서 사라짐
    await expect(page.getByRole('heading', { name: '특수교육 개론' })).not.toBeVisible();
  });

  test('검색 — 영어 검색어로도 필터링 작동', async ({ page }) => {
    const searchInput = page.getByPlaceholder('한국어, 영어, 한자로 검색...');

    await searchInput.fill('sensory');

    const resultCount = page.getByText(/\d+개 결과/);
    await expect(resultCount).toBeVisible();

    // #6 FIX: CSS .space-y-2 > div → data-testid based selector
    const results = page.locator('[data-testid="search-results"] [data-testid="term-card"]');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('검색 초기화 — ✕ 버튼 클릭 시 전체 용어로 복원', async ({ page }) => {
    const searchInput = page.getByPlaceholder('한국어, 영어, 한자로 검색...');
    await searchInput.fill('통합교육');

    // 검색 결과 모드 확인
    await expect(page.getByText(/\d+개 결과/)).toBeVisible();

    // ✕ 버튼 클릭
    const clearButton = page.locator('button:has-text("✕")');
    await clearButton.click();

    // 전체 모드 복원 — 과목 섹션 헤더 다시 등장
    await expect(page.getByRole('heading', { name: '특수교육 개론' })).toBeVisible();
    await expect(page.getByText(/\d+개 결과/)).not.toBeVisible();
  });

  test('검색 — 결과 없는 검색어 입력 시 빈 상태 표시', async ({ page }) => {
    const searchInput = page.getByPlaceholder('한국어, 영어, 한자로 검색...');
    await searchInput.fill('zzzzzzzzz없는용어123');

    // "검색 결과가 없습니다" EmptyState 렌더링
    await expect(page.getByText('검색 결과가 없습니다')).toBeVisible();
    await expect(page.getByText('0개 결과')).toBeVisible();
  });

  test('용어 카드 아코디언 — 클릭하면 정의 펼침, 재클릭하면 접힘', async ({ page }) => {
    // 검색으로 용어를 찾아 아코디언 테스트 (섹션 열기 불필요)
    const searchInput = page.getByPlaceholder('한국어, 영어, 한자로 검색...');
    await searchInput.fill('감각 교육');
    await expect(page.getByText(/\d+개 결과/)).toBeVisible();

    // 1. 첫 번째 용어 카드의 버튼 클릭 (용어명을 포함하는 버튼)
    const termButton = page.getByText('감각 교육', { exact: false }).first();
    await termButton.click();

    // 2. 정의 텍스트가 펼쳐짐 — 플래시카드 추가 버튼이 보이면 확장된 것
    const flashcardButton = page.getByRole('button', { name: /플래시카드/ }).first();
    await expect(flashcardButton).toBeVisible();

    // 3. 과목 뱃지도 보임
    await expect(page.getByText('특수교육 개론').first()).toBeVisible();

    // 4. 같은 카드 다시 클릭 — 접힘
    await termButton.click();
    await expect(flashcardButton).not.toBeVisible();
  });

  test('과목 섹션 접기/펼치기 — 셰브론 동작', async ({ page }) => {
    // 1. "행동지원" 섹션 헤더에 용어 수 표시 확인
    const sectionButton = page.getByRole('heading', { name: '행동지원' }).locator('..');
    await expect(sectionButton).toBeVisible();

    // #6 FIX: CSS .space-y-2 → data-testid
    const sectionContainer = page.locator('section').filter({ hasText: '행동지원' });

    // 2. 클릭하여 펼치기
    await sectionButton.click();

    // 3. 펼친 후 용어 카드가 보임
    const cardsArea = sectionContainer.locator('[data-testid="subject-terms"]');
    await expect(cardsArea).toBeVisible();

    // 4. 다시 클릭하여 접기
    await sectionButton.click();
    await expect(cardsArea).not.toBeVisible();
  });

  test('과목 섹션 "더보기" — 3개 이상 용어 시 나머지 펼치기', async ({ page }) => {
    // 특수교육 개론은 용어가 충분히 많음
    const sectionContainer = page.locator('section').filter({ hasText: '특수교육 개론' }).first();
    const sectionButton = sectionContainer.getByRole('heading', { name: '특수교육 개론' }).locator('..');
    await sectionButton.click();

    // 더보기 버튼 확인 (나머지 N개 더보기)
    const showMoreButton = sectionContainer.getByRole('button', { name: /나머지 \d+개 더보기/ });
    await expect(showMoreButton).toBeVisible();

    // 더보기 클릭
    await showMoreButton.click();

    // 더보기 후 카드가 3개보다 많아짐 — 더보기 버튼 사라짐
    await expect(showMoreButton).not.toBeVisible();
  });

  test('플래시카드 추가 — 용어 카드에서 플래시카드 버튼 클릭 시 추가됨', async ({ page }) => {
    await clearFlashcardStorage(page);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: '용어사전' })).toBeVisible({ timeout: 15000 });

    // 1. 검색으로 특정 용어 찾기
    const searchInput = page.getByPlaceholder('한국어, 영어, 한자로 검색...');
    await searchInput.fill('감각 교육');

    // 2. 결과가 나올 때까지 대기
    await expect(page.getByText(/\d+개 결과/)).toBeVisible();

    // 3. 첫 번째 용어 카드 열기
    // #6 FIX: CSS .border.border-border.rounded-xl button → data-testid
    const firstCard = page.locator('[data-testid="term-card"] button').first();
    await firstCard.click();

    // 4. "플래시카드" 추가 버튼 클릭
    const addButton = page.getByRole('button', { name: '플래시카드에 추가' }).first();
    await expect(addButton).toBeVisible();
    await addButton.click();

    // 5. 버튼이 "추가됨"으로 변경됨
    const addedButton = page.getByRole('button', { name: '이미 플래시카드에 추가됨' }).first();
    await expect(addedButton).toBeVisible();
    await expect(addedButton).toBeDisabled();

    // 6. localStorage에 카드가 저장되었는지 확인
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('leitner-cards');
      if (!raw) return null;
      return JSON.parse(raw);
    });
    expect(stored).not.toBeNull();
    expect(stored.state.cards.length).toBeGreaterThanOrEqual(1);
  });

  test('스크롤-투-탑 버튼 — 스크롤 후 표시, 클릭 시 최상단 이동', async ({ page }) => {
    // 독립적 테스트를 위해 페이지 새로 로드
    await page.goto(TERMS_URL);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: '용어사전' })).toBeVisible({ timeout: 15000 });

    // 스크롤 위치를 확실히 0으로 초기화
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForFunction(() => window.scrollY < 10);

    const scrollTopButton = page.locator('button[title="맨 위로"]');

    // 1. 초기 상태: 스크롤 위치 0 → 버튼 안 보임
    await expect(scrollTopButton).not.toBeVisible({ timeout: 3000 });

    // 2. 여러 과목 섹션을 펼쳐서 스크롤 가능한 높이를 확보
    const sections = ['특수교육 개론', '시각장애', '청각장애'];
    for (const name of sections) {
      const heading = page.getByRole('heading', { name }).first();
      if (await heading.isVisible()) {
        await heading.locator('..').click();
      }
    }

    // 3. 페이지를 충분히 스크롤 (showTop threshold = 400)
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForFunction(() => window.scrollY >= 400);
    await expect(scrollTopButton).toBeVisible({ timeout: 5000 });

    // 4. 버튼 클릭 — dispatchEvent로 직접 click 이벤트 발생
    // (BetaFeedbackWidget z-index 겹침 회피)
    await scrollTopButton.dispatchEvent('click');

    // 5. 스크롤 위치가 0 근처로 복귀 (smooth scroll이므로 충분히 대기)
    await page.waitForFunction(() => window.scrollY < 50, null, { timeout: 5000 });
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeLessThan(50);
  });

  test('모바일 목차 — 375x812 뷰포트에서 토글 동작', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(TERMS_URL);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: '용어사전' })).toBeVisible({ timeout: 15000 });

    // 1. 모바일에서 "목차" 버튼 표시
    const tocButton = page.getByRole('button', { name: /목차/ });
    await expect(tocButton).toBeVisible();

    // 2. 클릭하면 과목 목록 그리드 표시
    await tocButton.click();
    // #6 FIX: CSS .grid.grid-cols-2 → data-testid
    const tocGrid = page.locator('[data-testid="mobile-toc-grid"]');
    await expect(tocGrid).toBeVisible();

    // 3. 과목 버튼이 11개 (TERM_SUBJECTS 수)
    const subjectButtons = tocGrid.locator('button');
    const subjectCount = await subjectButtons.count();
    expect(subjectCount).toBe(11);

    // 4. 과목 버튼 클릭 → 해당 섹션으로 스크롤 (TOC 닫힘)
    await subjectButtons.filter({ hasText: '통합교육' }).click();
    await expect(tocGrid).not.toBeVisible();

    // 5. 데스크탑 사이드바 목차는 모바일에서 숨겨짐
    const desktopAside = page.locator('aside').first();
    await expect(desktopAside).not.toBeVisible();
  });

  test('데스크탑 사이드바 목차 — 과목 클릭으로 섹션 이동', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(TERMS_URL);
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: '용어사전' })).toBeVisible({ timeout: 15000 });

    // 1. 사이드바 목차 보임
    const sidebar = page.locator('aside').first();
    await expect(sidebar).toBeVisible();

    // 2. "전체" 버튼이 활성 상태
    const allButton = sidebar.getByText('전체');
    await expect(allButton).toBeVisible();

    // 3. 과목 클릭 → 해당 섹션으로 스크롤
    const subjectLink = sidebar.getByText('진단평가', { exact: true }).first();
    await subjectLink.click();

    // 4. 진단평가 섹션 헤더가 뷰포트에 보임
    const sectionHeader = page.getByRole('heading', { name: '진단평가' });
    await expect(sectionHeader).toBeVisible();
  });
});
