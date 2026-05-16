import { describe, expect, it } from 'vitest';
import { buildTodayGrowthSummary } from '../today-growth-summary';

describe('buildTodayGrowthSummary', () => {
  it('returns null when there is no activity today', () => {
    expect(buildTodayGrowthSummary({
      quizzesCompleted: 0,
      quizzesCorrect: 0,
      chaptersCompleted: 0,
      flashcardsReviewed: 0,
    }, { quizzes: 10, chapters: 2 }, 0)).toBeNull();
  });

  it('summarizes today quiz progress with accuracy and goal progress', () => {
    const summary = buildTodayGrowthSummary({
      quizzesCompleted: 8,
      quizzesCorrect: 6,
      chaptersCompleted: 1,
      flashcardsReviewed: 0,
    }, { quizzes: 10, chapters: 2 }, 3);

    expect(summary?.title).toBe('오늘의 성장');
    expect(summary?.metric).toBe('8문제 · 75%');
    expect(summary?.message).toContain('목표까지 2문제');
    expect(summary?.streakLabel).toBe('3일 연속');
  });

  it('celebrates when the daily quiz goal is reached', () => {
    const summary = buildTodayGrowthSummary({
      quizzesCompleted: 12,
      quizzesCorrect: 10,
      chaptersCompleted: 0,
      flashcardsReviewed: 4,
    }, { quizzes: 10, chapters: 2 }, 1);

    expect(summary?.message).toContain('목표를 채웠어요');
    expect(summary?.detail).toContain('플래시카드 4장');
  });
});
