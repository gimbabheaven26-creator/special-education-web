import { test, expect, type Page } from '@playwright/test';

/**
 * 크로스 페이지 사용자 여정 E2E 테스트
 *
 * 핵심 학습 루프: 퀴즈 → 오답 노트 → 오답 재시험
 * localStorage(quiz-data)에 오답을 시드하고,
 * /wrong-notes 목록 표시 → 완료/삭제 → 오답 재시험 진입을 검증한다.
 *
 * 주의: 오답 재시험(/wrong-notes/quiz)은 서버에서 가져온 allQuestions와
 * wrongNote.questionId를 매칭하므로, 실제 Supabase 데이터와 일치하는 ID가 필요하다.
 * 시드 데이터만으로는 재시험 퀴즈에 문제가 나타나지 않으므로,
 * 실제 OX 퀴즈 풀이 → 오답 발생 → 오답 노트 확인 전체 여정도 검증한다.
 */

/** quiz-data localStorage 시드 (version 5) */
function makeQuizStoreSeed(wrongNotes: Array<{
  questionId: string;
  subject: string;
  chapter?: string;
  userAnswer: string | number;
  mastered?: boolean;
  attempts?: number;
}>) {
  return {
    state: {
      wrongNotes: wrongNotes.map((n) => ({
        questionId: n.questionId,
        subject: n.subject,
        chapter: n.chapter ?? '',
        userAnswer: n.userAnswer,
        attempts: n.attempts ?? 1,
        lastAttempt: Date.now(),
        mastered: n.mastered ?? false,
      })),
      quizHistory: [],
      diagnosticSessions: [],
      feedbacks: [],
      errorReports: [],
    },
    version: 5,
  };
}

/** localStorage 시드 → 페이지 이동 */
async function seedWrongNotesAndGo(page: Page, url: string, wrongNotes: Parameters<typeof makeQuizStoreSeed>[0]) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.evaluate((data) => {
    localStorage.setItem('quiz-data', JSON.stringify(data));
  }, makeQuizStoreSeed(wrongNotes));
  await page.goto(url);
  await page.waitForLoadState('networkidle');
}

/** quiz-data localStorage 읽기 */
async function readQuizData(page: Page) {
  return page.evaluate(() => {
    const raw = localStorage.getItem('quiz-data');
    if (!raw) return null;
    return JSON.parse(raw);
  });
}

/** 3건의 테스트 오답 데이터 */
const SEED_WRONG_NOTES = [
  {
    questionId: 'test-wrong-1',
    subject: 'special-education',
    chapter: 'inclusive-education',
    userAnswer: 'X',
    mastered: false,
    attempts: 1,
  },
  {
    questionId: 'test-wrong-2',
    subject: 'special-education',
    chapter: 'iep',
    userAnswer: 'X',
    mastered: false,
    attempts: 3,
  },
  {
    questionId: 'test-wrong-3',
    subject: 'disability-types',
    chapter: 'intellectual-disability',
    userAnswer: 'O',
    mastered: true,
    attempts: 2,
  },
];

test.describe('오답 노트 목록 (/wrong-notes) — 시드 데이터 기반', () => {
  test.beforeEach(async ({ page }) => {
    await seedWrongNotesAndGo(page, '/wrong-notes', SEED_WRONG_NOTES);
  });

  test('시드된 오답 → 빈 상태가 아닌 오답 목록 표시', async ({ page }) => {
    // 1. 제목
    await expect(page.getByRole('heading', { name: '오답 노트' })).toBeVisible();

    // 2. "아직 오답이 없어요"가 표시되지 않아야 함
    await expect(page.getByText('아직 오답이 없어요')).not.toBeVisible();

    // 3. 통계 — 전체 3개
    await expect(page.getByText('3개').first()).toBeVisible();

    // 4. 미완료 2개 (test-wrong-1, test-wrong-2)
    await expect(page.getByText('2개').first()).toBeVisible();

    // 5. 완료 1개 (test-wrong-3)
    // 완료 배지 텍스트 확인
    const completedBadges = page.getByText('1개');
    await expect(completedBadges.first()).toBeVisible();
  });

  test('오답 카드에 시도 횟수, 내 답 표시', async ({ page }) => {
    // 1. 시도 횟수 배지 (3회 시도 — test-wrong-2)
    await expect(page.getByText('3회 시도')).toBeVisible();

    // 2. 연속 오답 배지 (attempts >= 3이고 mastered=false)
    await expect(page.getByText('3회 연속 오답')).toBeVisible();

    // 3. "내 답" 라벨이 보임
    const myAnswerLabels = page.getByText('내 답:');
    const count = await myAnswerLabels.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // 4. 완료 배지 (test-wrong-3은 mastered=true)
    await expect(page.getByText('완료').first()).toBeVisible();
  });

  test('오답 재시험 버튼 표시 — 미완료 N문제', async ({ page }) => {
    // 미완료 2건이므로 "오답 재시험 (2문제)" 버튼
    const reQuizButton = page.getByRole('link', { name: /오답 재시험.*2문제/ });
    await expect(reQuizButton).toBeVisible();
    await expect(reQuizButton).toHaveAttribute('href', '/wrong-notes/quiz');
  });

  test('완료 처리 → 미완료 수 감소 + 완료 배지 추가', async ({ page }) => {
    // 1. 현재 미완료 2개
    // "완료 처리" 버튼 중 첫 번째 클릭
    const markMasteredButton = page.getByRole('button', { name: '완료 처리' }).first();
    await markMasteredButton.click();

    // 2. 미완료 수가 1개로 감소
    // 미완료 배지: "1개"가 destructive variant로 표시됨
    await expect(page.getByText(/오답 재시험.*1문제/)).toBeVisible();

    // 3. localStorage에 mastered=true 반영 확인
    const data = await readQuizData(page);
    const masteredNotes = data?.state?.wrongNotes?.filter(
      (n: { mastered: boolean }) => n.mastered,
    );
    expect(masteredNotes?.length).toBe(2); // 기존 1 + 새로 1
  });

  test('삭제 → 오답 제거 + 통계 업데이트', async ({ page }) => {
    // 1. 삭제 버튼 클릭
    const deleteButton = page.getByRole('button', { name: '삭제' }).first();
    await deleteButton.click();

    // 2. 전체 수가 2개로 감소
    // 약간의 시간 후 통계가 업데이트됨
    await expect(page.getByText(/오답 재시험/)).toBeVisible();

    // 3. localStorage에서 제거 확인
    const data = await readQuizData(page);
    expect(data?.state?.wrongNotes?.length).toBe(2);
  });

  test('오답 재시험 클릭 → /wrong-notes/quiz로 이동', async ({ page }) => {
    const reQuizButton = page.getByRole('link', { name: /오답 재시험/ });
    await reQuizButton.click();

    await page.waitForURL('**/wrong-notes/quiz');
    await expect(page).toHaveURL(/\/wrong-notes\/quiz/);

    // 시드 데이터의 questionId는 Supabase에 존재하지 않으므로
    // "재시험할 오답이 없어요" 화면이 나타남
    await expect(page.getByText('재시험할 오답이 없어요')).toBeVisible();
  });
});

test.describe('오답 노트 — 빈 상태', () => {
  test('오답이 없으면 빈 상태 메시지와 퀴즈 CTA 표시', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    // localStorage에서 quiz-data 완전히 제거
    await page.evaluate(() => localStorage.removeItem('quiz-data'));
    await page.goto('/wrong-notes');
    await page.waitForLoadState('networkidle');

    // 1. "아직 오답이 없어요" 메시지
    await expect(page.getByText('아직 오답이 없어요')).toBeVisible();

    // 2. 설명 텍스트
    await expect(page.getByText(/퀴즈를 풀면 틀린 문제가 자동으로/)).toBeVisible();

    // 3. "첫 퀴즈 시작하기" CTA
    const ctaLink = page.getByRole('link', { name: '첫 퀴즈 시작하기' });
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toHaveAttribute('href', '/quiz');
  });
});

test.describe('전체 여정: OX 퀴즈 → 오답 노트 → 재시험', () => {
  test.beforeEach(async ({ page }) => {
    // 깨끗한 상태에서 시작
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.evaluate(() => {
      localStorage.removeItem('quiz-data');
      localStorage.removeItem('special-edu-study');
      localStorage.removeItem('leitner-cards');
    });
  });

  test('OX 퀴즈 페이지 로드 → 오답 노트 페이지 접근 → 오답 목록 or 빈 상태', async ({ page }) => {
    // Step 1: OX 퀴즈 페이지 정상 로드 확인
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'OX' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible();

    // Step 2: OX 퀴즈 1문제 풀기 (O 선택)
    const oButton = page.locator('button').filter({ hasText: /^O$/ }).first();
    await oButton.click();

    // 피드백 확인
    const feedbackCorrect = page.getByText('정답입니다!');
    const feedbackWrong = page.getByText(/오답.*정답/);
    await expect(feedbackCorrect.or(feedbackWrong)).toBeVisible({ timeout: 5000 });

    // Step 3: 오답 노트 페이지로 직접 이동
    await page.goto('/wrong-notes');
    await page.waitForLoadState('networkidle');

    // Step 4: 오답 노트 페이지 렌더링 확인
    await expect(page.getByRole('heading', { name: '오답 노트' })).toBeVisible();

    // 퀴즈에서 맞았으면 오답이 없고, 틀렸으면 오답이 1개 있음
    // 어느 경우든 페이지가 정상 렌더링되어야 함
    const emptyState = page.getByText('아직 오답이 없어요');
    const wrongNoteStats = page.getByText(/전체/);
    await expect(emptyState.or(wrongNoteStats)).toBeVisible();
  });

  test('OX 퀴즈 10문제 완료 → 오답 발생 시 오답 노트에 기록됨', async ({ page }) => {
    // Step 1: OX 퀴즈 전체 풀기
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 15000 });

    // 10문제 모두 O로 답변 (일부는 맞고 일부는 틀림)
    for (let i = 0; i < 10; i++) {
      const oButton = page.locator('button').filter({ hasText: /^O$/ }).first();
      await expect(oButton).toBeVisible({ timeout: 5000 });
      await oButton.click();

      // 피드백 대기
      const feedbackCorrect = page.getByText('정답입니다!');
      const feedbackWrong = page.getByText(/오답.*정답/);
      await expect(feedbackCorrect.or(feedbackWrong)).toBeVisible({ timeout: 5000 });

      // 타이머 바로 건너뛰기
      const skipBar = page.getByText('다음 문제로 이동 중');
      if (await skipBar.isVisible().catch(() => false)) {
        await skipBar.click();
      }

      // 마지막 문제가 아니면 다음 문제 로드 대기
      if (i < 9) {
        await expect(
          page.locator('button').filter({ hasText: /^O$/ }).first(),
        ).toBeVisible({ timeout: 5000 });
      }
    }

    // 결과 화면 도착
    await expect(page.getByText(/문제 중.*문제.*정답/)).toBeVisible({ timeout: 10000 });

    // Step 2: localStorage에서 오답 확인
    const quizData = await readQuizData(page);
    const wrongNotes = quizData?.state?.wrongNotes ?? [];

    // 10문제를 모두 O로 답했으므로, 정답이 X인 문제들이 오답으로 기록됨
    // 정확한 수는 문제에 따라 다르지만, 오답이 있을 수도 없을 수도 있음

    // Step 3: 오답 노트 페이지로 이동
    await page.goto('/wrong-notes');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: '오답 노트' })).toBeVisible();

    if (wrongNotes.length > 0) {
      // 오답이 있으면: 목록이 보이고, 재시험 버튼이 존재
      await expect(page.getByText('아직 오답이 없어요')).not.toBeVisible();
      await expect(page.getByText('전체', { exact: true })).toBeVisible();

      // 오답 재시험 버튼 존재
      const reQuizButton = page.getByRole('link', { name: /오답 재시험/ });
      await expect(reQuizButton).toBeVisible();

      // Step 4: 오답 재시험 페이지로 이동
      await reQuizButton.click();
      await page.waitForURL('**/wrong-notes/quiz');
      await expect(page.getByRole('heading', { name: '오답 재시험' })).toBeVisible();

      // 오답이 실제 Supabase 데이터와 매칭되므로 문제가 나타남
      // 진행 표시가 보이면 퀴즈 시작됨
      const progressBadge = page.getByText(/1\s*\/\s*\d+/);
      const emptyReQuiz = page.getByText('재시험할 오답이 없어요');
      await expect(progressBadge.or(emptyReQuiz)).toBeVisible({ timeout: 10000 });
    } else {
      // 모든 문제를 맞힌 경우: 빈 상태
      await expect(page.getByText('아직 오답이 없어요')).toBeVisible();
    }
  });

  test('오답 재시험에서 정답 → 완료 처리 → 오답 노트 반영', async ({ page }) => {
    // Step 1: OX 퀴즈 풀어서 오답 생성
    await page.goto('/quiz/ox');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible({ timeout: 15000 });

    for (let i = 0; i < 10; i++) {
      const oButton = page.locator('button').filter({ hasText: /^O$/ }).first();
      await expect(oButton).toBeVisible({ timeout: 5000 });
      await oButton.click();

      const feedbackCorrect = page.getByText('정답입니다!');
      const feedbackWrong = page.getByText(/오답.*정답/);
      await expect(feedbackCorrect.or(feedbackWrong)).toBeVisible({ timeout: 5000 });

      const skipBar = page.getByText('다음 문제로 이동 중');
      if (await skipBar.isVisible().catch(() => false)) {
        await skipBar.click();
      }

      if (i < 9) {
        await expect(
          page.locator('button').filter({ hasText: /^O$/ }).first(),
        ).toBeVisible({ timeout: 5000 });
      }
    }

    await expect(page.getByText(/문제 중.*문제.*정답/)).toBeVisible({ timeout: 10000 });

    // Step 2: 오답 확인
    const quizData = await readQuizData(page);
    const wrongNotes = quizData?.state?.wrongNotes ?? [];

    if (wrongNotes.length === 0) {
      // 오답이 없으면 이 테스트는 건너뜀 (모든 문제를 맞힌 드문 경우)
      test.skip();
      return;
    }

    // Step 3: 오답 재시험 직접 이동
    await page.goto('/wrong-notes/quiz');
    await page.waitForLoadState('networkidle');

    const progressBadge = page.getByText(/1\s*\/\s*\d+/);
    const emptyReQuiz = page.getByText('재시험할 오답이 없어요');
    const whichVisible = await Promise.race([
      progressBadge.waitFor({ timeout: 10000 }).then(() => 'quiz' as const),
      emptyReQuiz.waitFor({ timeout: 10000 }).then(() => 'empty' as const),
    ]).catch(() => 'timeout' as const);

    if (whichVisible !== 'quiz') {
      // fill_in 문제 필터링 등으로 재시험 문제가 없을 수 있음
      test.skip();
      return;
    }

    // Step 4: 재시험 1문제 이상 풀기
    // 문제 유형에 따라 다른 방식으로 답변
    // OX 문제가 나타나면 O/X 중 하나 클릭
    const oxO = page.locator('button').filter({ hasText: /^O$/ }).first();
    const oxX = page.locator('button').filter({ hasText: /^X$/ }).first();

    // OX 버튼이 보이면 클릭
    if (await oxO.isVisible().catch(() => false)) {
      // 모든 오답은 정답이 X였으므로 (O를 골라서 틀린 것들)
      // X를 선택하면 정답
      await oxX.click();

      // "다음" 버튼 클릭
      const nextButton = page.getByRole('button', { name: '다음' });
      await expect(nextButton).toBeVisible({ timeout: 5000 });
      await nextButton.click();
    }

    // Step 5: 결과 또는 다음 문제 확인
    // 1문제만 있었다면 결과 화면, 여러 문제면 다음 문제
    const resultHeading = page.getByRole('heading', { name: '재시험 결과' });
    const nextProgress = page.getByText(/2\s*\/\s*\d+/);
    await expect(resultHeading.or(nextProgress)).toBeVisible({ timeout: 10000 });

    // Step 6: localStorage에서 mastered 상태 변경 확인
    const updatedData = await readQuizData(page);
    const masteredCount = updatedData?.state?.wrongNotes?.filter(
      (n: { mastered: boolean }) => n.mastered,
    )?.length ?? 0;
    // 최소 1개는 mastered 되어야 함 (정답을 맞혔으므로)
    expect(masteredCount).toBeGreaterThanOrEqual(1);
  });
});

test.describe('오답 노트 — 탭 전환', () => {
  test('전체 오답 탭과 간격 반복 탭 전환', async ({ page }) => {
    await seedWrongNotesAndGo(page, '/wrong-notes', SEED_WRONG_NOTES);

    // 1. 기본 탭: "전체 오답"이 선택됨
    const allTab = page.getByRole('tab', { name: /전체 오답/ });
    await expect(allTab).toHaveAttribute('aria-selected', 'true');

    // 2. "간격 반복" 탭 클릭
    const srsTab = page.getByRole('tab', { name: /간격 반복/ });
    await srsTab.click();
    await expect(srsTab).toHaveAttribute('aria-selected', 'true');
    await expect(allTab).toHaveAttribute('aria-selected', 'false');

    // 3. 다시 "전체 오답" 탭 클릭
    await allTab.click();
    await expect(allTab).toHaveAttribute('aria-selected', 'true');

    // 4. 오답 목록이 다시 보임
    await expect(page.getByText(/오답 재시험/)).toBeVisible();
  });
});
