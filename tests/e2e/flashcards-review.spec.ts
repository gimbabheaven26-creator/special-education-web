import { test, expect, type Page } from '@playwright/test';

/**
 * 플래시카드 복습 (/flashcards/review) E2E 테스트
 *
 * 핵심 학습 루프: 질문 → 힌트(선택) → 답 확인 → 자동 다음 카드
 * Leitner SRS의 실제 동작(박스 승격/유지/강등, nextReview 갱신)을 검증한다.
 *
 * 카드 유형:
 * - 일반 카드(source: 'manual'): question → hint → answer → result 4단계
 * - OX 카드(quizType: 'ox'): question → O/X 선택 → result 2단계
 */

const REVIEW_URL = '/flashcards/review';

/** KST 기준 오늘 날짜 (YYYY-MM-DD) */
function todayKST(): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());
}

/** KST 기준 어제 날짜 */
function yesterdayKST(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(d);
}

/** 테스트용 일반(수동) 카드 3장 — 오늘 복습 대상 */
function makeReviewSeedData() {
  const today = todayKST();
  const yesterday = yesterdayKST();
  return {
    state: {
      cards: [
        {
          id: 'review-test-1',
          subjectSlug: 'special-education',
          question: '통합교육의 정의는?',
          answer: '장애학생과 비장애학생이 함께 교육받는 것',
          box: 1 as const,
          lastReviewed: yesterday,
          nextReview: today,
          createdAt: yesterday,
          source: 'manual' as const,
        },
        {
          id: 'review-test-2',
          subjectSlug: 'special-education',
          question: '개별화교육계획(IEP)의 핵심 요소는?',
          answer: '현재 학습 수준, 연간 목표, 특수교육 서비스',
          box: 2 as const,
          lastReviewed: yesterday,
          nextReview: today,
          createdAt: yesterday,
          source: 'manual' as const,
        },
        {
          id: 'review-test-3',
          subjectSlug: 'special-education',
          question: '전환교육의 목적은?',
          answer: '학생의 성인기 전환을 준비하는 교육',
          box: 3 as const,
          lastReviewed: yesterday,
          nextReview: today,
          createdAt: yesterday,
          source: 'manual' as const,
        },
      ],
      reviewLogs: [],
    },
    version: 3,
  };
}

/** localStorage에 시드 데이터를 심고 새로고침 */
async function seedAndNavigate(page: Page, seedData: { state: { cards: Record<string, unknown>[]; reviewLogs: unknown[] }; version: number }) {
  await page.goto(REVIEW_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate((data) => {
    localStorage.setItem('leitner-cards', JSON.stringify(data));
  }, seedData);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/^1 \/ \d+$/)).toBeVisible({ timeout: 15000 });
}

/** localStorage에서 Leitner 카드 데이터 읽기 */
async function readLeitnerData(page: Page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('leitner-cards');
    if (!raw) return null;
    return JSON.parse(raw);
  });
}

/** 일반 카드 1장의 전체 사이클 수행: 힌트 사용 여부에 따라 분기 */
async function completeGeneralCard(
  page: Page,
  options: { useHint: boolean },
) {
  if (options.useHint) {
    // 힌트 보기 → 답 확인하기 → 확인 완료 → 타이머 바 클릭
    await page.getByRole('button', { name: '힌트 보기' }).click();
    await page.getByRole('button', { name: '답 확인하기' }).click();
    await page.getByRole('button', { name: '확인 완료' }).click();
  } else {
    // 바로 답 확인 → 확인 완료 → 타이머 바 클릭
    await page.getByRole('button', { name: '바로 답 확인' }).click();
    await page.getByRole('button', { name: '확인 완료' }).click();
  }
  // 타이머 바 클릭하여 즉시 다음으로 이동
  const timerButton = page.getByRole('button', { name: '탭하여 다음으로 이동' });
  await expect(timerButton).toBeVisible();
  await timerButton.click();
}

test.describe('플래시카드 복습 — 기본 흐름', () => {
  test.beforeEach(async ({ page }) => {
    await seedAndNavigate(page, makeReviewSeedData());
  });

  test('시드 3장 → /flashcards/review → 첫 번째 질문 표시', async ({ page }) => {
    // 1. 진행 표시 "1 / 3"
    await expect(page.getByText('1 / 3')).toBeVisible();

    // 2. 첫 번째 카드의 질문 텍스트
    await expect(page.getByText('통합교육의 정의는?')).toBeVisible();

    // 3. "질문" 레이블
    await expect(page.getByText('질문')).toBeVisible();

    // 4. 힌트/답확인 버튼 존재
    await expect(page.getByRole('button', { name: '힌트 보기' })).toBeVisible();
    await expect(page.getByRole('button', { name: '바로 답 확인' })).toBeVisible();

    // 5. 박스 번호 배지
    await expect(page.getByText('박스 1')).toBeVisible();
  });

  test('"힌트 보기" 클릭 → 초성 힌트 텍스트 표시', async ({ page }) => {
    // 1. 힌트 보기 클릭 전에는 "답 확인하기" 버튼이 보이지 않음
    await expect(page.getByRole('button', { name: '답 확인하기' })).not.toBeVisible();

    // 2. 힌트 보기 클릭
    await page.getByRole('button', { name: '힌트 보기' }).click();

    // 3. 초성 힌트가 표시됨 (tracking-wider 클래스의 font-mono 요소)
    const chosungHint = page.locator('.tracking-wider');
    await expect(chosungHint).toBeVisible();
    // 초성은 한글 자음 포함 (정답 "장애학생과..." → "ㅈㅇㅎㅅㄱ...")
    const hintText = await chosungHint.textContent();
    expect(hintText).toBeTruthy();
    expect(hintText!.length).toBeGreaterThan(0);

    // 4. 컨텍스트 힌트도 표시됨 (글자수 기반)
    const contextHint = page.getByText(/글자/);
    await expect(contextHint).toBeVisible();

    // 5. "답 확인하기" 버튼이 나타남 (힌트 단계의 다음 액션)
    await expect(page.getByRole('button', { name: '답 확인하기' })).toBeVisible();

    // 6. 기존 "힌트 보기"와 "바로 답 확인" 버튼은 사라짐
    await expect(page.getByRole('button', { name: '힌트 보기' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: '바로 답 확인' })).not.toBeVisible();
  });

  test('"바로 답 확인" 클릭 → 정답 전문 표시', async ({ page }) => {
    // 1. 정답이 처음에는 보이지 않음
    await expect(page.getByText('장애학생과 비장애학생이 함께 교육받는 것')).not.toBeVisible();

    // 2. 바로 답 확인 클릭
    await page.getByRole('button', { name: '바로 답 확인' }).click();

    // 3. "정답" 레이블과 함께 정답 텍스트가 나타남
    await expect(page.getByText('정답')).toBeVisible();
    await expect(page.getByText('장애학생과 비장애학생이 함께 교육받는 것')).toBeVisible();

    // 4. "확인 완료" 버튼이 나타남
    await expect(page.getByRole('button', { name: '확인 완료' })).toBeVisible();
  });

  test('카드 완료 후 다음 카드로 이동', async ({ page }) => {
    // 1. 첫 카드 완료 (힌트 미사용 → knew)
    await completeGeneralCard(page, { useHint: false });

    // 2. 두 번째 카드로 이동 확인
    await expect(page.getByText('2 / 3')).toBeVisible();
    await expect(page.getByText('개별화교육계획(IEP)의 핵심 요소는?')).toBeVisible();

    // 3. 박스 번호가 두 번째 카드의 값으로 변경
    await expect(page.getByText('박스 2')).toBeVisible();
  });

  test('3장 모두 완료 → 완료 화면 표시', async ({ page }) => {
    // 카드 1: knew (힌트 미사용)
    await completeGeneralCard(page, { useHint: false });

    // 카드 2: hint (힌트 사용)
    await completeGeneralCard(page, { useHint: true });

    // 카드 3: knew (힌트 미사용)
    await completeGeneralCard(page, { useHint: false });

    // 완료 화면 확인
    await expect(page.getByRole('heading', { name: '복습 완료!' })).toBeVisible();
    await expect(page.getByText(/총 3장을 복습했어요/)).toBeVisible();

    // 통계: "바로 앎" 2장, "힌트 후 앎" 1장
    await expect(page.getByText('바로 앎')).toBeVisible();
    await expect(page.getByText('힌트 후 앎')).toBeVisible();

    // CTA 링크들
    await expect(page.getByRole('link', { name: '카드 추가하기' })).toBeVisible();
    await expect(page.getByRole('link', { name: '메인으로' })).toBeVisible();
  });
});

test.describe('플래시카드 복습 — Leitner SRS 로직 검증', () => {
  test.beforeEach(async ({ page }) => {
    await seedAndNavigate(page, makeReviewSeedData());
  });

  test('힌트 미사용(knew) → box +1 승격 + nextReview 미래 날짜', async ({ page }) => {
    const today = todayKST();

    // 카드 1 (box 1) — 힌트 미사용 → knew → box 2
    await completeGeneralCard(page, { useHint: false });

    // localStorage 확인
    const data = await readLeitnerData(page);
    const card1 = data?.state?.cards?.find(
      (c: { id: string }) => c.id === 'review-test-1',
    );
    expect(card1).toBeDefined();
    expect(card1.box).toBe(2); // 1 → 2 승격
    expect(card1.lastReviewed).toBe(today);
    // box 2 interval = 2일 → nextReview는 오늘+2일 (미래)
    expect(card1.nextReview > today).toBe(true);
  });

  test('힌트 사용(hint) → box 유지 + nextReview 갱신', async ({ page }) => {
    const today = todayKST();

    // 카드 1 (box 1) — 힌트 사용 → hint → box 유지
    await completeGeneralCard(page, { useHint: true });

    // localStorage 확인
    const data = await readLeitnerData(page);
    const card1 = data?.state?.cards?.find(
      (c: { id: string }) => c.id === 'review-test-1',
    );
    expect(card1).toBeDefined();
    expect(card1.box).toBe(1); // box 유지
    expect(card1.lastReviewed).toBe(today);
    // box 1 interval = 1일 → nextReview는 오늘+1일
    expect(card1.nextReview > today).toBe(true);
  });

  test('전체 복습 후 reviewLogs에 3건 기록', async ({ page }) => {
    // 3장 모두 완료
    await completeGeneralCard(page, { useHint: false }); // knew
    await completeGeneralCard(page, { useHint: true });   // hint
    await completeGeneralCard(page, { useHint: false }); // knew

    // 완료 화면 확인
    await expect(page.getByRole('heading', { name: '복습 완료!' })).toBeVisible();

    // localStorage에서 reviewLogs 확인
    const data = await readLeitnerData(page);
    const logs = data?.state?.reviewLogs;
    expect(logs).toHaveLength(3);

    // 각 로그의 grade 확인
    const log1 = logs.find((l: { cardId: string }) => l.cardId === 'review-test-1');
    expect(log1.grade).toBe('knew');
    expect(log1.fromBox).toBe(1);
    expect(log1.toBox).toBe(2);

    const log2 = logs.find((l: { cardId: string }) => l.cardId === 'review-test-2');
    expect(log2.grade).toBe('hint');
    expect(log2.fromBox).toBe(2);
    expect(log2.toBox).toBe(2); // hint → box 유지

    const log3 = logs.find((l: { cardId: string }) => l.cardId === 'review-test-3');
    expect(log3.grade).toBe('knew');
    expect(log3.fromBox).toBe(3);
    expect(log3.toBox).toBe(4); // 3 → 4 승격
  });
});

test.describe('플래시카드 복습 — OX 카드', () => {
  /** OX 퀴즈 타입 카드 시드 */
  function makeOXSeedData() {
    const today = todayKST();
    const yesterday = yesterdayKST();
    return {
      state: {
        cards: [
          {
            id: 'ox-review-1',
            subjectSlug: 'special-education',
            question: '통합교육은 장애학생과 비장애학생이 함께 교육받는 것이다.',
            answer: 'O\n통합교육은 장애학생과 비장애학생이 일반학급에서 함께 수업받는 교육 형태입니다.',
            box: 1 as const,
            lastReviewed: yesterday,
            nextReview: today,
            createdAt: yesterday,
            source: 'quiz-ox' as const,
            quizType: 'ox' as const,
            quizId: 'ox-q-1',
            chapterSlug: 'special-education-act',
          },
          {
            id: 'ox-review-2',
            subjectSlug: 'special-education',
            question: 'IEP는 일반교사만 작성할 수 있다.',
            answer: 'X\nIEP는 특수교사, 일반교사, 학부모, 관련 서비스 전문가가 협력하여 작성합니다.',
            box: 2 as const,
            lastReviewed: yesterday,
            nextReview: today,
            createdAt: yesterday,
            source: 'quiz-ox' as const,
            quizType: 'ox' as const,
            quizId: 'ox-q-2',
          },
        ],
        reviewLogs: [],
      },
      version: 3,
    };
  }

  test('OX 카드 정답 → knew 등급 + box 승격', async ({ page }) => {
    await seedAndNavigate(page, makeOXSeedData());
    const today = todayKST();

    // 1. OX 퀴즈 배지 표시
    await expect(page.getByText('OX 퀴즈')).toBeVisible();
    await expect(page.getByText('출처 복습')).toBeVisible();
    await expect(page.getByRole('link', { name: '특수교육법 개념 보기' })).toBeVisible();
    await expect(page.getByRole('link', { name: '같은 영역 다시 풀기' })).toBeVisible();

    // 2. 질문 텍스트
    await expect(
      page.getByText('통합교육은 장애학생과 비장애학생이 함께 교육받는 것이다.'),
    ).toBeVisible();

    // 3. O 선택 (정답)
    await page.getByRole('button', { name: 'O 선택' }).click();

    // 4. "정답!" 피드백
    await expect(page.getByText('정답!')).toBeVisible();

    // 5. 타이머 바 클릭하여 다음으로
    const timerButton = page.getByRole('button', { name: '탭하여 다음으로 이동' });
    await expect(timerButton).toBeVisible();
    await timerButton.click();

    // 6. localStorage에서 box 승격 확인
    const data = await readLeitnerData(page);
    const card = data?.state?.cards?.find(
      (c: { id: string }) => c.id === 'ox-review-1',
    );
    expect(card.box).toBe(2); // 1 → 2
    expect(card.lastReviewed).toBe(today);
  });

  test('OX 카드 오답 → forgot 등급 + box 1로 강등', async ({ page }) => {
    await seedAndNavigate(page, makeOXSeedData());
    const today = todayKST();

    // 카드 1 정답 처리 (다음 카드로 넘어가기 위해)
    await page.getByRole('button', { name: 'O 선택' }).click();
    const timerButton1 = page.getByRole('button', { name: '탭하여 다음으로 이동' });
    await expect(timerButton1).toBeVisible();
    await timerButton1.click();

    // 카드 2 (정답 X) — O를 선택하여 오답
    await expect(page.getByText('IEP는 일반교사만 작성할 수 있다.')).toBeVisible();
    await page.getByRole('button', { name: 'O 선택' }).click();

    // "오답" 피드백 + 정답 표시
    await expect(page.getByText(/오답.*정답: X/)).toBeVisible();

    // 타이머 바 클릭
    const timerButton2 = page.getByRole('button', { name: '탭하여 다음으로 이동' });
    await expect(timerButton2).toBeVisible();
    await timerButton2.click();

    // localStorage에서 box 강등 확인
    const data = await readLeitnerData(page);
    const card2 = data?.state?.cards?.find(
      (c: { id: string }) => c.id === 'ox-review-2',
    );
    expect(card2.box).toBe(1); // 2 → 1 (forgot)
    expect(card2.lastReviewed).toBe(today);
  });
});
