import { test, expect, type Page } from '@playwright/test';

/**
 * 플래시카드 관리 (/flashcards) E2E 테스트
 *
 * Zustand persist (localStorage 'leitner-cards') 기반으로
 * 빈 상태, 카드 CRUD, 박스 아코디언, 편집 모달, 삭제, 통계 등
 * 전체 사용자 여정을 검증한다.
 */

const FLASHCARDS_URL = '/flashcards';

/** 테스트용 Leitner 카드 시드 데이터 */
function makeSeedData(cards: Array<{
  id: string;
  question: string;
  answer: string;
  box?: 1 | 2 | 3 | 4 | 5;
  subjectSlug?: string;
}>) {
  const today = new Date().toISOString().split('T')[0];
  return {
    state: {
      cards: cards.map((c) => ({
        id: c.id,
        subjectSlug: c.subjectSlug ?? 'introduction',
        question: c.question,
        answer: c.answer,
        box: c.box ?? 1,
        lastReviewed: today,
        nextReview: today,
        createdAt: today,
        source: 'manual' as const,
      })),
      reviewLogs: [],
    },
    version: 3,
  };
}

/** localStorage에 시드 데이터를 심고 페이지 새로고침 */
async function seedAndReload(page: Page, cards: Parameters<typeof makeSeedData>[0]) {
  await page.evaluate((data) => {
    localStorage.setItem('leitner-cards', JSON.stringify(data));
  }, makeSeedData(cards));
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
  await expect(page.getByRole('heading', { name: '플래시카드' })).toBeVisible({ timeout: 15000 });
}

/** localStorage 초기화 후 새로고침 */
async function clearAndReload(page: Page) {
  await page.evaluate(() => localStorage.removeItem('leitner-cards'));
  await page.reload();
  await page.waitForLoadState('domcontentloaded');
}

test.describe('플래시카드 관리 — 빈 상태', () => {
  test('카드 없을 때 — 빈 상태 메시지와 추가 CTA 표시', async ({ page }) => {
    await page.goto(FLASHCARDS_URL);
    await page.waitForLoadState('domcontentloaded');
    await clearAndReload(page);

    // 1. 빈 상태 제목
    await expect(page.getByText('플래시카드가 아직 없어요')).toBeVisible();

    // 2. 설명 텍스트
    await expect(page.getByText(/퀴즈에서 가져오거나 직접 만들어/)).toBeVisible();

    // 3. "카드 추가하기" CTA 링크
    const addLink = page.getByRole('link', { name: '플래시카드 추가 페이지로 이동' });
    await expect(addLink).toBeVisible();
    await expect(addLink).toHaveAttribute('href', '/flashcards/add');
  });

  test('빈 상태에서 CTA 클릭 → /flashcards/add로 이동', async ({ page }) => {
    await page.goto(FLASHCARDS_URL);
    await page.waitForLoadState('domcontentloaded');
    await clearAndReload(page);

    const addLink = page.getByRole('link', { name: '플래시카드 추가 페이지로 이동' });
    await addLink.click();

    await page.waitForURL('**/flashcards/add');
    await expect(page).toHaveURL(/\/flashcards\/add/);
  });
});

test.describe('플래시카드 관리 — 카드 있는 상태', () => {
  const TEST_CARDS = [
    { id: 'e2e-1', question: '통합교육이란?', answer: '장애학생과 비장애학생이 함께 교육받는 것', box: 1 as const },
    { id: 'e2e-2', question: '개별화교육계획(IEP)이란?', answer: '특수교육대상자의 교육적 요구에 맞는 개별 계획', box: 1 as const },
    { id: 'e2e-3', question: '전환교육이란?', answer: '성인기 전환을 준비하는 교육', box: 2 as const },
    { id: 'e2e-4', question: '보편적 학습설계(UDL)란?', answer: '모든 학습자를 위한 유연한 교육과정 설계', box: 3 as const },
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto(FLASHCARDS_URL);
    await page.waitForLoadState('domcontentloaded');
    await seedAndReload(page, TEST_CARDS);
  });

  test('헤더 — 제목, 총 카드 수, 오늘 복습 대상 수 표시', async ({ page }) => {
    // 1. 페이지 제목
    await expect(page.getByRole('heading', { name: '플래시카드' })).toBeVisible();

    // 2. 통계: 총 4장
    await expect(page.getByText(/총 4장/)).toBeVisible();

    // 3. 통계: 오늘 복습 대상 (모든 카드가 nextReview=today이므로 4장)
    await expect(page.getByText(/오늘 복습 대상 4장/)).toBeVisible();

    // 4. 추가 버튼
    await expect(page.getByRole('link', { name: '카드 추가' })).toBeVisible();

    // 5. 복습 버튼 (dueToday > 0이므로 표시)
    const reviewButton = page.getByRole('link', { name: /오늘 복습 시작/ });
    await expect(reviewButton).toBeVisible();
  });

  test('박스 분포 바 — 카드 분포 시각화 렌더링', async ({ page }) => {
    // 박스 분포 바 (aria-label로 접근)
    const distributionBar = page.locator('[role="img"][aria-label*="박스 분포"]');
    await expect(distributionBar).toBeVisible();

    // 분포 텍스트 확인 (박스1: 2, 박스2: 1, 박스3: 1)
    await expect(page.getByText('박스1: 2')).toBeVisible();
    await expect(page.getByText('박스2: 1')).toBeVisible();
    await expect(page.getByText('박스3: 1')).toBeVisible();
    await expect(page.getByText('박스4: 0')).toBeVisible();
    await expect(page.getByText('박스5: 0')).toBeVisible();
  });

  test('박스 아코디언 — 헤더 클릭으로 카드 목록 펼치기/접기', async ({ page }) => {
    // 박스 1은 기본 펼쳐져 있음
    await expect(page.getByText('통합교육이란?')).toBeVisible();
    await expect(page.getByText('개별화교육계획(IEP)이란?')).toBeVisible();

    // 1. 박스 1 헤더 클릭 → 접기
    const box1Header = page.getByRole('button', { name: /박스 1 · 매일.*2장.*접기/ });
    await box1Header.click();

    // 카드가 숨겨짐
    await expect(page.getByText('통합교육이란?')).not.toBeVisible();

    // 2. 박스 2 헤더 클릭 → 펼치기
    const box2Header = page.getByRole('button', { name: /박스 2 · 2일.*1장.*펼치기/ });
    await box2Header.click();

    // 박스 2 카드 보임
    await expect(page.getByText('전환교육이란?')).toBeVisible();

    // 3. 박스 2 다시 클릭 → 접기
    await page.getByRole('button', { name: /박스 2 · 2일.*1장.*접기/ }).click();
    await expect(page.getByText('전환교육이란?')).not.toBeVisible();
  });

  test('카드 펼치기 — 질문 클릭 시 답 공개', async ({ page }) => {
    // 1. 답이 처음에는 숨겨져 있음
    await expect(page.getByText('장애학생과 비장애학생이 함께 교육받는 것')).not.toBeVisible();

    // 2. 카드 질문 클릭
    const questionButton = page.getByRole('button', { name: '답 보기' }).first();
    await questionButton.click();

    // 3. 답이 공개됨
    await expect(page.getByText('장애학생과 비장애학생이 함께 교육받는 것')).toBeVisible();

    // 4. 다시 클릭 → 답 접힘
    const collapseButton = page.getByRole('button', { name: '답 접기' }).first();
    await collapseButton.click();
    await expect(page.getByText('장애학생과 비장애학생이 함께 교육받는 것')).not.toBeVisible();
  });

  test('카드 편집 — 모달 열기, 수정, 저장', async ({ page }) => {
    const editButton = page.getByRole('button', { name: /통합교육이란\?.*편집/ });
    await editButton.click({ force: true });

    await expect(page.getByRole('heading', { name: '카드 편집' })).toBeVisible();

    const questionInput = page.locator('#edit-question');
    await expect(questionInput).toHaveValue('통합교육이란?');

    const answerInput = page.locator('#edit-answer');
    await expect(answerInput).toHaveValue('장애학생과 비장애학생이 함께 교육받는 것');

    await questionInput.clear();
    await questionInput.fill('통합교육의 정의는?');

    await answerInput.clear();
    await answerInput.fill('일반학급에서 장애·비장애학생이 함께 수업');

    await page.getByRole('button', { name: '저장' }).click();

    await expect(page.getByRole('heading', { name: '카드 편집' })).not.toBeVisible();
    await expect(page.getByText('통합교육의 정의는?')).toBeVisible();

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('leitner-cards');
      if (!raw) return null;
      return JSON.parse(raw);
    });
    const editedCard = stored?.state?.cards?.find((c: { id: string }) => c.id === 'e2e-1');
    expect(editedCard?.question).toBe('통합교육의 정의는?');
    expect(editedCard?.answer).toBe('일반학급에서 장애·비장애학생이 함께 수업');
  });

  test('카드 편집 모달 — 취소 시 변경 없음', async ({ page }) => {
    const editButton = page.getByRole('button', { name: /통합교육이란\?.*편집/ });
    await editButton.click({ force: true });
    await expect(page.getByRole('heading', { name: '카드 편집' })).toBeVisible();

    const questionInput = page.locator('#edit-question');
    await questionInput.clear();
    await questionInput.fill('취소될 변경');

    await page.getByRole('button', { name: '취소' }).click();

    await expect(page.getByRole('heading', { name: '카드 편집' })).not.toBeVisible();
    await expect(page.getByText('통합교육이란?')).toBeVisible();
    await expect(page.getByText('취소될 변경')).not.toBeVisible();
  });

  test('카드 삭제 — 삭제 버튼 클릭 시 카드 제거', async ({ page }) => {
    await expect(page.getByText(/총 4장/)).toBeVisible();

    const deleteButton = page.getByRole('button', { name: /통합교육이란\?.*삭제/ });
    await deleteButton.click({ force: true });

    await expect(page.getByText('통합교육이란?')).not.toBeVisible();
    await expect(page.getByText(/총 3장/)).toBeVisible();

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('leitner-cards');
      if (!raw) return null;
      return JSON.parse(raw);
    });
    expect(stored?.state?.cards?.length).toBe(3);
    expect(stored?.state?.cards?.find((c: { id: string }) => c.id === 'e2e-1')).toBeUndefined();
  });

  test('추가 버튼 → /flashcards/add로 이동', async ({ page }) => {
    const addButton = page.getByRole('link', { name: '카드 추가' });
    await addButton.click();

    await page.waitForURL('**/flashcards/add');
    await expect(page).toHaveURL(/\/flashcards\/add/);
  });

  test('복습 버튼 → /flashcards/review로 이동', async ({ page }) => {
    const reviewButton = page.getByRole('link', { name: /오늘 복습 시작/ });
    await reviewButton.click();

    await page.waitForURL('**/flashcards/review');
    await expect(page).toHaveURL(/\/flashcards\/review/);
  });
});

test.describe('플래시카드 관리 — 복습 대상 없는 경우', () => {
  test('모든 카드의 nextReview가 미래일 때 — 복습 버튼 미표시, 안내 메시지', async ({ page }) => {
    await page.goto(FLASHCARDS_URL);
    await page.waitForLoadState('domcontentloaded');

    const futureDate = '2099-12-31';
    const futureCards = [
      { id: 'future-1', question: '미래 카드', answer: '답변', box: 2 as const },
    ];
    const seedData = {
      state: {
        cards: futureCards.map((c) => ({
          id: c.id,
          subjectSlug: 'introduction',
          question: c.question,
          answer: c.answer,
          box: c.box,
          lastReviewed: '2026-04-01',
          nextReview: futureDate,
          createdAt: '2026-04-01',
          source: 'manual' as const,
        })),
        reviewLogs: [],
      },
      version: 3,
    };
    await page.evaluate((data) => {
      localStorage.setItem('leitner-cards', JSON.stringify(data));
    }, seedData);
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    await expect(page.getByText(/총 1장/)).toBeVisible();
    await expect(page.getByText(/오늘 복습 대상 0장/)).toBeVisible();
    await expect(page.getByRole('link', { name: /오늘 복습 시작/ })).not.toBeVisible();
    await expect(page.getByText('오늘 복습할 카드가 없어요')).toBeVisible();

    const bottomCta = page.getByRole('link', { name: '카드 추가하기' }).last();
    await expect(bottomCta).toBeVisible();
  });
});

// ─── #9 FIX: 플래시카드 추가 페이지 (/flashcards/add) ───

test.describe('플래시카드 추가 페이지 (/flashcards/add)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('leitner-cards'));
  });

  test('추가 페이지 로드 — 2탭 UI 표시', async ({ page }) => {
    await page.goto('/flashcards/add');
    await page.waitForLoadState('domcontentloaded');

    // 1. 제목
    await expect(page.getByRole('heading', { name: '카드 추가' })).toBeVisible({ timeout: 15000 });

    // 2. 설명 텍스트
    await expect(page.getByText('퀴즈에서 가져오거나 직접 만들 수 있어요')).toBeVisible();

    // 3. 2개 탭 버튼
    const quizTab = page.getByRole('tab', { name: '퀴즈에서 가져오기' });
    const manualTab = page.getByRole('tab', { name: '직접 만들기' });
    await expect(quizTab).toBeVisible();
    await expect(manualTab).toBeVisible();

    // 4. 기본 탭은 "퀴즈에서 가져오기"
    await expect(quizTab).toHaveAttribute('aria-selected', 'true');
  });

  test('퀴즈에서 가져오기 탭 — 과목 필터와 퀴즈 목록 표시', async ({ page }) => {
    await page.goto('/flashcards/add');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: '카드 추가' })).toBeVisible({ timeout: 15000 });

    // "전체" 필터 버튼이 보인다
    const allFilter = page.locator('button').filter({ hasText: /^전체 \(\d+\)$/ });
    await expect(allFilter).toBeVisible({ timeout: 10000 });

    // 퀴즈 목록이 렌더링된다 (OX 또는 단답형 뱃지)
    const quizBadges = page.locator('text=OX').or(page.locator('text=단답형'));
    await expect(quizBadges.first()).toBeVisible({ timeout: 10000 });
  });

  test('직접 만들기 탭 — 폼 입력 및 카드 추가', async ({ page }) => {
    await page.goto('/flashcards/add');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: '카드 추가' })).toBeVisible({ timeout: 15000 });

    // 1. "직접 만들기" 탭으로 전환
    const manualTab = page.getByRole('tab', { name: '직접 만들기' });
    await manualTab.click();

    // 2. 폼 요소 확인
    await expect(page.getByText('새 카드')).toBeVisible();
    const questionInput = page.locator('#question');
    const answerInput = page.locator('#answer');
    await expect(questionInput).toBeVisible();
    await expect(answerInput).toBeVisible();

    // 3. 추가 버튼이 비활성 (빈 입력)
    const submitButton = page.getByRole('button', { name: '추가' });
    await expect(submitButton).toBeDisabled();

    // 4. 질문과 답 입력
    await questionInput.fill('E2E 테스트 질문');
    await answerInput.fill('E2E 테스트 답변');

    // 5. 추가 버튼 활성화 + 클릭
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // 6. 성공 메시지 — "+1" 뱃지와 카드명 표시
    await expect(page.getByText('"E2E 테스트 질문"')).toBeVisible();
    await expect(page.getByText(/카드가 추가되었어요/)).toBeVisible();

    // 7. 폼이 초기화됨
    await expect(questionInput).toHaveValue('');
    await expect(answerInput).toHaveValue('');

    // 8. localStorage에 카드 저장 확인
    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('leitner-cards');
      if (!raw) return null;
      return JSON.parse(raw);
    });
    expect(stored).not.toBeNull();
    expect(stored.state.cards.length).toBeGreaterThanOrEqual(1);
    const addedCard = stored.state.cards.find((c: { question: string }) => c.question === 'E2E 테스트 질문');
    expect(addedCard).toBeTruthy();
    expect(addedCard.answer).toBe('E2E 테스트 답변');
  });

  test('플래시카드 홈 링크로 돌아갈 수 있다', async ({ page }) => {
    await page.goto('/flashcards/add');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByRole('heading', { name: '카드 추가' })).toBeVisible({ timeout: 15000 });

    // 하단 "플래시카드 홈" 링크
    const homeLink = page.getByRole('link', { name: /플래시카드 홈/ });
    await expect(homeLink).toBeVisible();
    await homeLink.click();

    await page.waitForURL('**/flashcards');
    expect(page.url()).toContain('/flashcards');
  });
});
