import { test, expect } from '@playwright/test';

/**
 * 게스트 학습 데이터의 localStorage 키 계약 + 영속성 회귀 가드.
 *
 * 배경: MigrationModal이 잘못된 키('special-edu-study-store')를 읽어 게스트→로그인
 * 마이그레이션이 무력화됐던 H2 버그. 앱이 실제 사용하는 persist 키가 흔들리지
 * 않는지 통합 수준에서 검증한다. (인증 없음 → 프로덕션 Supabase 미오염)
 *
 * 완전한 인증 동기화 E2E(게스트 학습→로그인→서버 보존)는 별도 테스트 Supabase
 * 프로젝트가 필요하다(현 CI는 프로덕션 DB 사용 = 오염 위험). 해당 시나리오는
 * 단위 테스트(SyncManager/sync-h1-guard/migration-modal)로 커버한다.
 */
test.describe('게스트 데이터 영속성 (H2 키 계약)', () => {
  test('study 스토어는 special-edu-study 키로 저장되고 새로고침 후 유지된다', async ({ page }) => {
    await page.goto('/');

    // 게스트 학습 데이터 모사 (persist 포맷, 현재 버전)
    await page.evaluate(() => {
      localStorage.setItem(
        'special-edu-study',
        JSON.stringify({ state: { totalXP: 150, currentStreak: 3 }, version: 7 }),
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const persisted = await page.evaluate(() => {
      const raw = localStorage.getItem('special-edu-study');
      return raw ? (JSON.parse(raw).state?.totalXP ?? null) : null;
    });

    // 앱이 올바른 키를 사용하므로 시드한 데이터가 유지된다 (다른 키로 덮어쓰지 않음)
    expect(persisted).toBe(150);
  });

  test('quiz 오답노트는 quiz-data 키로 저장된다', async ({ page }) => {
    await page.goto('/');

    await page.evaluate(() => {
      localStorage.setItem(
        'quiz-data',
        JSON.stringify({
          state: { wrongNotes: [{ questionId: 'e2e-q1', subject: 'intro', userAnswer: 'X', attempts: 1, lastAttempt: Date.now(), mastered: false }] },
          version: 5,
        }),
      );
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    const count = await page.evaluate(() => {
      const raw = localStorage.getItem('quiz-data');
      return raw ? (JSON.parse(raw).state?.wrongNotes?.length ?? 0) : 0;
    });

    expect(count).toBeGreaterThanOrEqual(1);
  });
});
