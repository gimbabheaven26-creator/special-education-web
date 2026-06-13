import { describe, it, expect, beforeEach } from 'vitest';
import { shouldShowMigration } from '../MigrationModal';
import { STORE_LS_KEYS } from '@/lib/db/sync';

/**
 * H2 회귀: shouldShowMigration이 실제 zustand persist 키를 읽는지 검증.
 * 이전에는 'special-edu-study-store' / 'special-edu-quiz-store'(존재하지 않는 키)를
 * 읽어 항상 false를 반환 → 마이그레이션 모달이 단 한 번도 표시되지 않았다.
 */
describe('shouldShowMigration (H2: localStorage 키 일치)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('study 스토어에 totalXP > 0이 있으면 true', () => {
    localStorage.setItem(
      STORE_LS_KEYS.study,
      JSON.stringify({ state: { totalXP: 120 }, version: 1 }),
    );
    expect(shouldShowMigration()).toBe(true);
  });

  it('quiz 스토어에 오답노트가 있으면 true', () => {
    localStorage.setItem(
      STORE_LS_KEYS.quiz,
      JSON.stringify({ state: { wrongNotes: [{ questionId: 'q1' }] }, version: 1 }),
    );
    expect(shouldShowMigration()).toBe(true);
  });

  it('이미 마이그레이션한 사용자는 false', () => {
    localStorage.setItem('sew-migrated', '1');
    localStorage.setItem(
      STORE_LS_KEYS.study,
      JSON.stringify({ state: { totalXP: 120 }, version: 1 }),
    );
    expect(shouldShowMigration()).toBe(false);
  });

  it('학습 데이터가 없으면 false', () => {
    localStorage.setItem(
      STORE_LS_KEYS.study,
      JSON.stringify({ state: { totalXP: 0 }, version: 1 }),
    );
    expect(shouldShowMigration()).toBe(false);
  });

  it('구 버그 키(*-store)에만 데이터가 있고 실제 키가 비면 false (회귀 방지)', () => {
    localStorage.setItem(
      'special-edu-study-store',
      JSON.stringify({ state: { totalXP: 999 }, version: 1 }),
    );
    localStorage.setItem(
      'special-edu-quiz-store',
      JSON.stringify({ state: { wrongNotes: [{ questionId: 'q1' }] }, version: 1 }),
    );
    // 실제 persist 키(STORE_LS_KEYS)는 비어 있으므로 false여야 한다
    expect(shouldShowMigration()).toBe(false);
  });
});
