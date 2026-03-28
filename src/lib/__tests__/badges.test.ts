import { describe, it, expect } from 'vitest';
import { BADGES, computeBadges } from '@/lib/badges';
import type { BadgeStats } from '@/lib/badges';

// ─── BADGES 상수 ──────────────────────────────────────────────────────────────

describe('BADGES', () => {
  it('9개 배지가 정의되어 있다', () => {
    expect(BADGES).toHaveLength(9);
  });

  it('모든 배지에 고유 id가 있다', () => {
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('모든 배지에 check 함수가 있다', () => {
    for (const badge of BADGES) {
      expect(typeof badge.check).toBe('function');
    }
  });

  it('모든 배지에 name, description, emoji가 있다', () => {
    for (const badge of BADGES) {
      expect(badge.name.length).toBeGreaterThan(0);
      expect(badge.description.length).toBeGreaterThan(0);
      expect(badge.emoji.length).toBeGreaterThan(0);
    }
  });
});

// ─── 개별 배지 check 로직 ────────────────────────────────────────────────────

describe('개별 배지 check', () => {
  const base: BadgeStats = {
    totalQuizzes: 0,
    currentStreak: 0,
    masteredWrongNotes: 0,
    totalXP: 0,
  };

  it('first-answer: totalQuizzes >= 1', () => {
    const badge = BADGES.find((b) => b.id === 'first-answer')!;
    expect(badge.check({ ...base, totalQuizzes: 0 })).toBe(false);
    expect(badge.check({ ...base, totalQuizzes: 1 })).toBe(true);
  });

  it('quiz-10: totalQuizzes >= 10', () => {
    const badge = BADGES.find((b) => b.id === 'quiz-10')!;
    expect(badge.check({ ...base, totalQuizzes: 9 })).toBe(false);
    expect(badge.check({ ...base, totalQuizzes: 10 })).toBe(true);
  });

  it('quiz-100: totalQuizzes >= 100', () => {
    const badge = BADGES.find((b) => b.id === 'quiz-100')!;
    expect(badge.check({ ...base, totalQuizzes: 99 })).toBe(false);
    expect(badge.check({ ...base, totalQuizzes: 100 })).toBe(true);
  });

  it('quiz-500: totalQuizzes >= 500', () => {
    const badge = BADGES.find((b) => b.id === 'quiz-500')!;
    expect(badge.check({ ...base, totalQuizzes: 499 })).toBe(false);
    expect(badge.check({ ...base, totalQuizzes: 500 })).toBe(true);
  });

  it('quiz-1000: totalQuizzes >= 1000', () => {
    const badge = BADGES.find((b) => b.id === 'quiz-1000')!;
    expect(badge.check({ ...base, totalQuizzes: 999 })).toBe(false);
    expect(badge.check({ ...base, totalQuizzes: 1000 })).toBe(true);
  });

  it('streak-3: currentStreak >= 3', () => {
    const badge = BADGES.find((b) => b.id === 'streak-3')!;
    expect(badge.check({ ...base, currentStreak: 2 })).toBe(false);
    expect(badge.check({ ...base, currentStreak: 3 })).toBe(true);
  });

  it('streak-7: currentStreak >= 7', () => {
    const badge = BADGES.find((b) => b.id === 'streak-7')!;
    expect(badge.check({ ...base, currentStreak: 6 })).toBe(false);
    expect(badge.check({ ...base, currentStreak: 7 })).toBe(true);
  });

  it('streak-30: currentStreak >= 30', () => {
    const badge = BADGES.find((b) => b.id === 'streak-30')!;
    expect(badge.check({ ...base, currentStreak: 29 })).toBe(false);
    expect(badge.check({ ...base, currentStreak: 30 })).toBe(true);
  });

  it('wrong-conquered: masteredWrongNotes >= 5', () => {
    const badge = BADGES.find((b) => b.id === 'wrong-conquered')!;
    expect(badge.check({ ...base, masteredWrongNotes: 4 })).toBe(false);
    expect(badge.check({ ...base, masteredWrongNotes: 5 })).toBe(true);
  });
});

// ─── computeBadges ────────────────────────────────────────────────────────────

describe('computeBadges', () => {
  it('모든 스탯이 0이면 earned 배지 없음', () => {
    const stats: BadgeStats = {
      totalQuizzes: 0,
      currentStreak: 0,
      masteredWrongNotes: 0,
      totalXP: 0,
    };
    const result = computeBadges(stats);
    expect(result).toHaveLength(9);
    expect(result.every((r) => r.earned === false)).toBe(true);
  });

  it('전부 조건 만족 시 모두 earned', () => {
    const stats: BadgeStats = {
      totalQuizzes: 1000,
      currentStreak: 30,
      masteredWrongNotes: 5,
      totalXP: 99999,
    };
    const result = computeBadges(stats);
    expect(result.every((r) => r.earned === true)).toBe(true);
  });

  it('부분 달성 확인', () => {
    const stats: BadgeStats = {
      totalQuizzes: 50,
      currentStreak: 5,
      masteredWrongNotes: 0,
      totalXP: 0,
    };
    const result = computeBadges(stats);
    const earned = result.filter((r) => r.earned).map((r) => r.badge.id);
    expect(earned).toContain('first-answer');
    expect(earned).toContain('quiz-10');
    expect(earned).toContain('streak-3');
    expect(earned).not.toContain('quiz-100');
    expect(earned).not.toContain('streak-7');
    expect(earned).not.toContain('wrong-conquered');
  });

  it('반환 배열 길이는 BADGES 수와 동일', () => {
    const stats: BadgeStats = { totalQuizzes: 5, currentStreak: 0, masteredWrongNotes: 0, totalXP: 0 };
    expect(computeBadges(stats)).toHaveLength(BADGES.length);
  });

  it('각 항목에 badge 객체가 포함된다', () => {
    const stats: BadgeStats = { totalQuizzes: 0, currentStreak: 0, masteredWrongNotes: 0, totalXP: 0 };
    const result = computeBadges(stats);
    for (const item of result) {
      expect(item.badge).toBeDefined();
      expect(typeof item.badge.id).toBe('string');
      expect(typeof item.earned).toBe('boolean');
    }
  });
});
