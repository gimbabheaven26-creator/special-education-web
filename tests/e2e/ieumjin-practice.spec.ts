import { expect, test } from '@playwright/test';

const fbaUrl = '/terms?q=%EA%B8%B0%EB%8A%A5%EC%A0%81%20%ED%96%89%EB%8F%99%ED%8F%89%EA%B0%80';

test.describe('이음진 FBA 실전 이음', () => {
  test('기출 답안 작성에서 동형 풀이와 복습 예약까지 이어진다', async ({ page }) => {
    await page.goto(fbaUrl);
    await page.evaluate(() => localStorage.removeItem('ieumjin:fba-practice-loop'));

    await expect(page.getByRole('heading', { name: '기능적 행동평가' })).toBeVisible();
    await expect(page.getByText('FBA 20분 실전 이음', { exact: true })).toBeVisible();

    await page.getByLabel('기출 답안').fill(
      '선행사건, 행동, 후속결과를 ABC 관찰 자료로 기록하고 기능 가설을 세운다. 같은 기능을 충족하는 대체행동을 교수하고 선행사건 중재와 강화를 계획한다.',
    );
    await page.getByRole('button', { name: '채점 받기' }).click();

    await expect(page.getByText('채점 결과 4/4')).toBeVisible();
    await expect(page.getByRole('heading', { name: '동형문제 풀이' })).toBeVisible();

    await page.getByLabel('동형 답안').fill(
      '쓰기 과제가 선행사건이고 자해 행동 뒤 과제가 지연되므로 과제 회피 기능 가설을 세운다. 도움 요청이나 휴식 요청 대체행동을 교수하고 과제 난이도 조정과 선택지 제공 같은 선행사건 중재를 한다.',
    );
    await page.getByRole('button', { name: '동형 채점' }).click();
    await page.getByRole('button', { name: '3일 뒤' }).click();

    await expect(page.getByText(/복습 예약 완료/)).toBeVisible();
    await expect(page.getByText('특수교육 공부방')).toHaveCount(0);

    const stored = await page.evaluate(() => {
      const raw = localStorage.getItem('ieumjin:fba-practice-loop');
      return raw ? JSON.parse(raw) : [];
    });
    expect(stored).toHaveLength(1);
    expect(stored[0]).toMatchObject({
      termId: 'fba',
      promptId: 'fba-analog-1',
      delayDays: 3,
      score: 4,
      maxScore: 4,
    });
  });
});
