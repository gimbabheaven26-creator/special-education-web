import { test, expect, type Page } from '@playwright/test';

/**
 * KICE 기출문제 탐색기 E2E 테스트
 *
 * 수험생 관점의 실제 사용 시나리오를 검증한다.
 * Tab 1: 기출문제 (연도별 탐색, 세션 선택, 연습 모드)
 * Tab 2: 출제분석 (히트맵, 키워드 랭킹, 연속 출제, 장기 미출제)
 */

// ─── Helpers ───

/** KICE 페이지로 이동하고 메인 콘텐츠가 로드될 때까지 대기 */
async function gotoKice(page: Page, params = '') {
  await page.goto(`/kice${params}`);
  await page.waitForLoadState('networkidle');
}

// ─── Tab Navigation ───

test.describe('KICE 탭 네비게이션', () => {
  test('기출문제 탭이 기본 활성 상태로 로드된다', async ({ page }) => {
    await gotoKice(page);

    // 기출문제 탭이 활성(aria-selected=true)
    const byYearTab = page.getByRole('tab', { name: '기출문제' });
    await expect(byYearTab).toHaveAttribute('aria-selected', 'true');

    // 출제분석 탭은 비활성
    const analyticsTab = page.getByRole('tab', { name: '출제분석' });
    await expect(analyticsTab).toHaveAttribute('aria-selected', 'false');

    // 기출문제 탭의 콘텐츠(연도 버튼)가 보인다
    await expect(page.locator('h1')).toContainText('기출문제');
  });

  test('출제분석 탭 클릭 시 분석 콘텐츠로 전환된다', async ({ page }) => {
    await gotoKice(page);

    // 출제분석 탭 클릭
    const analyticsTab = page.getByRole('tab', { name: '출제분석' });
    await analyticsTab.click();
    await page.waitForLoadState('networkidle');

    // URL에 tab=analytics 반영
    await expect(page).toHaveURL(/tab=analytics/);

    // 출제분석 탭이 활성 상태
    const activeTab = page.getByRole('tab', { name: '출제분석' });
    await expect(activeTab).toHaveAttribute('aria-selected', 'true');

    // 히트맵 테이블이 보인다 — 분석 콘텐츠의 핵심 요소
    const heatmapTable = page.getByRole('table', { name: '과목별 연도별 출제 빈도' });
    await expect(heatmapTable).toBeVisible();
  });

  test('출제분석에서 기출문제 탭으로 돌아올 수 있다', async ({ page }) => {
    // 출제분석 탭에서 시작
    await gotoKice(page, '?tab=analytics');

    // 기출문제 탭 클릭
    const byYearTab = page.getByRole('tab', { name: '기출문제' });
    await byYearTab.click();
    await page.waitForLoadState('networkidle');

    // URL에 tab=by-year 반영
    await expect(page).toHaveURL(/tab=by-year/);

    // 연도 선택 버튼들이 보인다
    await expect(page.getByRole('button', { name: '2026' })).toBeVisible();
    await expect(page.getByRole('button', { name: '2025' })).toBeVisible();
  });
});

// ─── Year & Session Selection ───

test.describe('KICE 연도/세션 선택', () => {
  test('연도 버튼 그리드가 여러 연도를 표시한다', async ({ page }) => {
    await gotoKice(page);

    // 2016~2027 범위의 연도 버튼이 존재
    for (const year of [2026, 2025, 2024, 2020, 2016]) {
      await expect(page.getByRole('button', { name: String(year) })).toBeVisible();
    }
  });

  test('연도 클릭 시 URL과 시각적 상태가 변경된다', async ({ page }) => {
    await gotoKice(page);

    // 2025 연도 클릭
    const year2025 = page.getByRole('button', { name: '2025' });
    await year2025.click();
    await page.waitForLoadState('networkidle');

    // URL에 year=2025 반영
    await expect(page).toHaveURL(/year=2025/);

    // 2025 버튼이 강조(primary) 스타일
    await expect(year2025).toHaveClass(/bg-primary/);
  });

  test('세션 그룹(원본/동형)이 연도 선택 후 표시된다', async ({ page }) => {
    await gotoKice(page, '?year=2026');

    // 원본/동형/예상 범례가 보인다
    await expect(page.getByText('원본 기출')).toBeVisible();
    await expect(page.getByText('동형 문제')).toBeVisible();
    await expect(page.getByText('예상 문제')).toBeVisible();

    // 세션 버튼들 — 2026년은 전공A, 전공B, 동형 존재
    await expect(page.getByRole('button', { name: '전공A' })).toBeVisible();
    await expect(page.getByRole('button', { name: '동형' }).first()).toBeVisible();
  });

  test('세션 버튼 클릭 시 시험 내용이 전환된다', async ({ page }) => {
    await gotoKice(page, '?year=2026&session=전공A');

    // 현재 전공A 메타 정보가 보인다
    await expect(page.getByText(/^\d+문항$/).first()).toBeVisible();

    // 동형 버튼 클릭
    const isoButton = page.getByRole('button', { name: '동형' }).first();
    await isoButton.click();
    await page.waitForLoadState('networkidle');

    // URL에 동형 세션 반영 (한글은 percent-encoded)
    await expect(page).toHaveURL(/session=.*%EB%8F%99%ED%98%95/);

    // 동형 안내 텍스트가 표시된다
    await expect(page.getByText('동형문제: 원본과 동일한 구조')).toBeVisible();
  });
});

// ─── Exam Content & Metadata ───

test.describe('KICE 시험 메타정보', () => {
  test('시험 카드에 문항수, 점수, 시간이 표시된다', async ({ page }) => {
    await gotoKice(page, '?year=2026&session=전공A');

    // 메타 정보 카드의 세 가지 핵심 요소
    await expect(page.getByText(/^\d+문항$/).first()).toBeVisible();
    await expect(page.getByText(/^\d+점$/).first()).toBeVisible();
    await expect(page.getByText(/^\d+분$/).first()).toBeVisible();
  });

  test('모의고사 버튼이 올바른 링크를 가진다', async ({ page }) => {
    await gotoKice(page, '?year=2026&session=전공A');

    const mockTestLink = page.getByRole('link', { name: /모의고사 모드/ });
    await expect(mockTestLink).toBeVisible();

    // href에 year=2026&session=전공A 포함 확인
    const href = await mockTestLink.getAttribute('href');
    expect(href).toContain('/kice/exam');
    expect(href).toContain('year=2026');
    expect(href).toContain('session=');
  });

  test('한 문제씩 풀기 버튼이 존재하고 클릭 가능하다', async ({ page }) => {
    await gotoKice(page, '?year=2026&session=전공A');

    const practiceButton = page.getByRole('button', { name: /한 문제씩 풀기/ });
    await expect(practiceButton).toBeVisible();
    await expect(practiceButton).toBeEnabled();
  });
});

// ─── Practice Mode ───

test.describe('KICE 연습 모드 (한 문제씩 풀기)', () => {
  test('연습 모드 진입 시 첫 문항과 진행 바가 표시된다', async ({ page }) => {
    await gotoKice(page, '?year=2026&session=전공A');

    // 한 문제씩 풀기 클릭
    await page.getByRole('button', { name: /한 문제씩 풀기/ }).click();

    // 진행 카운터 "1 / N" 표시
    await expect(page.getByText(/^1 \/ \d+$/)).toBeVisible();

    // 진행 바가 존재 (너비가 100% 미만)
    const progressBar = page.locator('.bg-primary.h-1\\.5.rounded-full');
    await expect(progressBar).toBeVisible();

    // 목록으로 돌아가기 링크 존재
    await expect(page.getByText('목록으로')).toBeVisible();

    // 문제 카드(QuestionCard)가 렌더링됨 — 점수 배지가 표시된다
    await expect(page.getByText(/점$/).first()).toBeVisible();
  });

  test('다음/이전 문항 버튼으로 탐색할 수 있다', async ({ page }) => {
    await gotoKice(page, '?year=2026&session=전공A');

    // 연습 모드 진입
    await page.getByRole('button', { name: /한 문제씩 풀기/ }).click();
    await expect(page.getByText(/^1 \/ \d+$/)).toBeVisible();

    // 첫 문항에서 이전 문항 비활성
    const prevButton = page.getByRole('button', { name: '이전 문항' });
    await expect(prevButton).toBeDisabled();

    // 다음 문항 클릭
    const nextButton = page.getByRole('button', { name: '다음 문항' });
    await expect(nextButton).toBeEnabled();
    await nextButton.click();

    // 진행 카운터가 "2 / N"으로 변경
    await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();

    // 이전 문항이 이제 활성화
    await expect(prevButton).toBeEnabled();

    // 이전 문항으로 돌아가기
    await prevButton.click();
    await expect(page.getByText(/^1 \/ \d+$/)).toBeVisible();
  });

  test('목록으로 버튼 클릭 시 연습 모드를 종료한다', async ({ page }) => {
    await gotoKice(page, '?year=2026&session=전공A');

    // 연습 모드 진입
    await page.getByRole('button', { name: /한 문제씩 풀기/ }).click();
    await expect(page.getByText(/^1 \/ \d+$/)).toBeVisible();

    // 목록으로 클릭
    await page.getByText('목록으로').click();

    // 연습 모드 종료 — 진행 카운터가 사라지고, 한 문제씩 풀기 버튼이 다시 보인다
    await expect(page.getByText(/^1 \/ \d+$/)).not.toBeVisible();
    await expect(page.getByRole('button', { name: /한 문제씩 풀기/ })).toBeVisible();
  });

  test('마지막 문항에서 완료 버튼이 나타난다', async ({ page }) => {
    await gotoKice(page, '?year=2026&session=전공A');

    // 연습 모드 진입
    await page.getByRole('button', { name: /한 문제씩 풀기/ }).click();

    // 전체 문항 수 추출
    const counterText = await page.getByText(/^1 \/ \d+$/).textContent();
    const total = Number(counterText?.split('/')[1]?.trim());
    expect(total).toBeGreaterThan(0);

    // 마지막 문항까지 이동 — 다음 문항 버튼을 반복 클릭
    for (let i = 1; i < total; i++) {
      await page.getByRole('button', { name: '다음 문항' }).click();
    }

    // 마지막 문항 확인
    await expect(page.getByText(new RegExp(`^${total} \\/ ${total}$`))).toBeVisible();

    // "완료 — 목록으로" 버튼 등장 (다음 문항 대신)
    await expect(page.getByRole('button', { name: /완료.*목록으로/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '다음 문항' })).not.toBeVisible();

    // 완료 클릭 시 연습 모드 종료
    await page.getByRole('button', { name: /완료.*목록으로/ }).click();
    await expect(page.getByRole('button', { name: /한 문제씩 풀기/ })).toBeVisible();
  });
});

// ─── Keyword Search ───

test.describe('KICE 키워드 검색', () => {
  test('검색어 입력 시 문항이 필터링되고 결과 수가 표시된다', async ({ page }) => {
    await gotoKice(page, '?year=2026&session=전공A');

    const searchInput = page.getByPlaceholder(/키워드.*검색/);
    await expect(searchInput).toBeVisible();

    // 존재하지 않는 키워드로 필터링 → 0문항
    await searchInput.fill('zzz_없는키워드_zzz');

    // 검색 결과 카운터 표시
    await expect(page.getByText('0문항')).toBeVisible();
  });
});

// ─── Analytics Tab ───

test.describe('KICE 출제분석 탭', () => {
  test('히트맵 테이블에 과목과 연도 열이 표시된다', async ({ page }) => {
    await gotoKice(page, '?tab=analytics');

    const heatmapTable = page.getByRole('table', { name: '과목별 연도별 출제 빈도' });
    await expect(heatmapTable).toBeVisible();

    // 과목 행이 1개 이상 존재
    const rows = heatmapTable.locator('tbody tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);

    // 연도 헤더가 존재 (2자리 약식: "16", "26" 등)
    const headerCells = heatmapTable.locator('thead th');
    const headerCount = await headerCells.count();
    expect(headerCount).toBeGreaterThan(3); // 과목 + 연도들 + 합계
  });

  test('키워드 랭킹이 순위와 빈도를 표시한다', async ({ page }) => {
    await gotoKice(page, '?tab=analytics');

    // TOP 키워드 섹션
    await expect(page.getByText('출제 빈도 TOP 키워드')).toBeVisible();

    // 첫 번째 키워드에 "회" 단위 빈도 표시
    await expect(page.getByText(/\d+회/).first()).toBeVisible();
  });

  test('히트맵 과목 클릭 시 키워드가 해당 과목으로 필터링된다', async ({ page }) => {
    await gotoKice(page, '?tab=analytics');

    // 히트맵의 첫 번째 과목 버튼 클릭
    const heatmapTable = page.getByRole('table', { name: '과목별 연도별 출제 빈도' });
    const firstSubjectButton = heatmapTable.locator('tbody tr td button').first();
    await firstSubjectButton.click();

    // 키워드 섹션의 필터 배지 내에 × 닫기 버튼이 표시된다
    const keywordSection = page.locator('text=출제 빈도 TOP 키워드').locator('..');
    const dismissButton = keywordSection.locator('button:has-text("×")');
    await expect(dismissButton).toBeVisible();

    // 필터 해제 (× 버튼 클릭)
    await dismissButton.click();

    // 필터 배지가 사라진다
    await expect(dismissButton).not.toBeVisible();
  });

  test('연도별 시험 요약 테이블이 표시된다', async ({ page }) => {
    await gotoKice(page, '?tab=analytics');

    const summaryTable = page.getByRole('table', { name: '연도별 시험 요약' });
    await expect(summaryTable).toBeVisible();

    // 테이블 헤더 확인
    await expect(summaryTable.getByText('연도')).toBeVisible();
    await expect(summaryTable.getByText('시험')).toBeVisible();
    await expect(summaryTable.getByText('문항')).toBeVisible();
    await expect(summaryTable.getByText('서술')).toBeVisible();
    await expect(summaryTable.getByText('논술')).toBeVisible();
    await expect(summaryTable.getByText('주요 과목')).toBeVisible();

    // 데이터 행이 존재
    const dataRows = summaryTable.locator('tbody tr');
    const count = await dataRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('연속 출제 키워드 섹션이 3년 이상 연속 키워드를 표시한다', async ({ page }) => {
    await gotoKice(page, '?tab=analytics');

    // 연속 출제 키워드 섹션 (데이터가 있을 때만 표시)
    const streakSection = page.getByText('연속 출제 키워드 (3년 이상)');
    const sectionExists = await streakSection.count();

    if (sectionExists > 0) {
      await expect(streakSection).toBeVisible();
      // "N년 연속" 텍스트가 있는 항목 존재
      await expect(page.getByText(/\d+년 연속/).first()).toBeVisible();
    }
    // 데이터가 없으면 섹션 자체가 렌더링되지 않음 — 정상 동작
  });
});

// ─── Cross-Tab Navigation (전체 시나리오) ───

test.describe('KICE 전체 시나리오', () => {
  test('수험생 시나리오: 연도 선택 → 문제 탐색 → 분석 확인', async ({ page }) => {
    // 1. KICE 페이지 진입
    await gotoKice(page);
    await expect(page.locator('h1')).toContainText('기출문제');

    // 2. 2024 연도 선택
    await page.getByRole('button', { name: '2024' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(/year=2024/);

    // 3. 메타 정보 확인
    await expect(page.getByText(/^\d+문항$/).first()).toBeVisible();

    // 4. 한 문제씩 풀기로 연습
    await page.getByRole('button', { name: /한 문제씩 풀기/ }).click();
    await expect(page.getByText(/^1 \/ \d+$/)).toBeVisible();

    // 5. 두 번째 문항으로 이동
    await page.getByRole('button', { name: '다음 문항' }).click();
    await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();

    // 6. 목록으로 돌아가기
    await page.getByText('목록으로').click();
    await expect(page.getByRole('button', { name: /한 문제씩 풀기/ })).toBeVisible();

    // 7. 출제분석 탭으로 전환
    await page.getByRole('tab', { name: '출제분석' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('table', { name: '과목별 연도별 출제 빈도' })).toBeVisible();

    // 8. 다시 기출문제 탭으로
    await page.getByRole('tab', { name: '기출문제' }).click();
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('button', { name: '2026' })).toBeVisible();
  });
});
