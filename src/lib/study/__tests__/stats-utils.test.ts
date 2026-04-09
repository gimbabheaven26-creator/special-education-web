import { describe, it, expect } from 'vitest';
import type { QuizResult } from '@/types/quiz';
import type { WrongNote, DailyHistoryEntry } from '@/types/study';
import {
  computeOverallAccuracy,
  computeSubjectStats,
  computeChapterStats,
  computeDailyVolume,
  identifyWeakAreas,
  computeTrend,
  computeWrongNoteSummary,
  computeWeeklySummary,
  computeWeeklyTrend,
  computeHeatmapData,
  computeStudyDays,
  computeSubjectWeeklySummary,
  detectWeakToStrong,
} from '../stats-utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeResult(
  overrides: Partial<QuizResult> & { subject: string; chapter: string },
): QuizResult {
  return {
    questionId: `q-${Math.random().toString(36).slice(2, 8)}`,
    userAnswer: 1,
    isCorrect: false,
    timestamp: Date.now(),
    ...overrides,
  };
}

function daysAgo(n: number): number {
  return Date.now() - n * 86_400_000;
}

// ─── computeOverallAccuracy ───────────────────────────────────────────────────

describe('computeOverallAccuracy', () => {
  it('returns zero for empty history', () => {
    const result = computeOverallAccuracy([]);
    expect(result).toEqual({ total: 0, correct: 0, rate: 0 });
  });

  it('filters invalid entries (empty subject/chapter)', () => {
    const history: QuizResult[] = [
      makeResult({ subject: '', chapter: '', isCorrect: true }),
      makeResult({ subject: 'math', chapter: 'ch1', isCorrect: true }),
    ];
    const result = computeOverallAccuracy(history);
    expect(result.total).toBe(1);
    expect(result.correct).toBe(1);
    expect(result.rate).toBe(100);
  });

  it('calculates correct accuracy rate', () => {
    const history: QuizResult[] = [
      makeResult({ subject: 'a', chapter: 'c1', isCorrect: true }),
      makeResult({ subject: 'a', chapter: 'c1', isCorrect: true }),
      makeResult({ subject: 'a', chapter: 'c1', isCorrect: false }),
    ];
    const result = computeOverallAccuracy(history);
    expect(result).toEqual({ total: 3, correct: 2, rate: 67 });
  });
});

// ─── computeSubjectStats ─────────────────────────────────────────────────────

describe('computeSubjectStats', () => {
  it('returns empty for empty history', () => {
    expect(computeSubjectStats([])).toEqual([]);
  });

  it('groups by subject and sorts by rate ascending', () => {
    const history: QuizResult[] = [
      makeResult({ subject: 'math', chapter: 'c1', isCorrect: true }),
      makeResult({ subject: 'math', chapter: 'c1', isCorrect: true }),
      makeResult({ subject: 'science', chapter: 'c1', isCorrect: false }),
      makeResult({ subject: 'science', chapter: 'c1', isCorrect: false }),
    ];
    const stats = computeSubjectStats(history);
    expect(stats).toHaveLength(2);
    expect(stats[0].subject).toBe('science');
    expect(stats[0].rate).toBe(0);
    expect(stats[1].subject).toBe('math');
    expect(stats[1].rate).toBe(100);
  });
});

// ─── computeChapterStats ─────────────────────────────────────────────────────

describe('computeChapterStats', () => {
  it('groups by subject::chapter key', () => {
    const history: QuizResult[] = [
      makeResult({ subject: 'math', chapter: 'ch1', isCorrect: true }),
      makeResult({ subject: 'math', chapter: 'ch1', isCorrect: false }),
      makeResult({ subject: 'math', chapter: 'ch2', isCorrect: true }),
    ];
    const stats = computeChapterStats(history);
    expect(stats).toHaveLength(2);

    const ch1 = stats.find((s) => s.chapter === 'ch1');
    expect(ch1).toBeDefined();
    expect(ch1!.total).toBe(2);
    expect(ch1!.correct).toBe(1);
    expect(ch1!.rate).toBe(50);
  });
});

// ─── computeDailyVolume ──────────────────────────────────────────────────────

describe('computeDailyVolume', () => {
  it('returns correct number of days', () => {
    const result = computeDailyVolume([], 7);
    expect(result).toHaveLength(7);
    result.forEach((d) => {
      expect(d.count).toBe(0);
      expect(d.correct).toBe(0);
    });
  });

  it('counts today\'s results', () => {
    const history: QuizResult[] = [
      makeResult({ subject: 'a', chapter: 'c', isCorrect: true, timestamp: Date.now() }),
      makeResult({ subject: 'a', chapter: 'c', isCorrect: false, timestamp: Date.now() }),
    ];
    const result = computeDailyVolume(history, 1);
    expect(result).toHaveLength(1);
    expect(result[0].count).toBe(2);
    expect(result[0].correct).toBe(1);
  });
});

// ─── identifyWeakAreas ───────────────────────────────────────────────────────

describe('identifyWeakAreas', () => {
  it('filters subjects below threshold', () => {
    const stats = [
      { subject: 'math', total: 10, correct: 8, rate: 80 },
      { subject: 'science', total: 10, correct: 5, rate: 50 },
      { subject: 'english', total: 10, correct: 3, rate: 30 },
    ];
    const weak = identifyWeakAreas(stats, 60);
    expect(weak).toHaveLength(2);
    expect(weak.map((s) => s.subject)).toEqual(['science', 'english']);
  });

  it('uses default threshold of 60', () => {
    const stats = [
      { subject: 'a', total: 10, correct: 6, rate: 60 },
      { subject: 'b', total: 10, correct: 5, rate: 50 },
    ];
    const weak = identifyWeakAreas(stats);
    expect(weak).toHaveLength(1);
    expect(weak[0].subject).toBe('b');
  });
});

// ─── computeTrend ────────────────────────────────────────────────────────────

describe('computeTrend', () => {
  it('returns stable for empty history', () => {
    expect(computeTrend([])).toBe('stable');
  });

  it('detects improving trend', () => {
    const history: QuizResult[] = [
      // previous period: 0% accuracy
      makeResult({ subject: 'a', chapter: 'c', isCorrect: false, timestamp: daysAgo(10) }),
      makeResult({ subject: 'a', chapter: 'c', isCorrect: false, timestamp: daysAgo(10) }),
      // recent period: 100% accuracy
      makeResult({ subject: 'a', chapter: 'c', isCorrect: true, timestamp: daysAgo(1) }),
      makeResult({ subject: 'a', chapter: 'c', isCorrect: true, timestamp: daysAgo(1) }),
    ];
    expect(computeTrend(history, 7)).toBe('improving');
  });

  it('detects declining trend', () => {
    const history: QuizResult[] = [
      // previous period: 100%
      makeResult({ subject: 'a', chapter: 'c', isCorrect: true, timestamp: daysAgo(10) }),
      makeResult({ subject: 'a', chapter: 'c', isCorrect: true, timestamp: daysAgo(10) }),
      // recent period: 0%
      makeResult({ subject: 'a', chapter: 'c', isCorrect: false, timestamp: daysAgo(1) }),
      makeResult({ subject: 'a', chapter: 'c', isCorrect: false, timestamp: daysAgo(1) }),
    ];
    expect(computeTrend(history, 7)).toBe('declining');
  });
});

// ─── computeWrongNoteSummary ─────────────────────────────────────────────────

describe('computeWrongNoteSummary', () => {
  it('returns zeros for empty notes', () => {
    const result = computeWrongNoteSummary([]);
    expect(result).toEqual({
      total: 0,
      mastered: 0,
      unmastered: 0,
      resolutionRate: 0,
      bySubject: [],
    });
  });

  it('calculates resolution rate and groups by subject', () => {
    const notes: WrongNote[] = [
      { questionId: 'q1', subject: 'math', userAnswer: 'X', attempts: 2, lastAttempt: Date.now(), mastered: true },
      { questionId: 'q2', subject: 'math', userAnswer: 'X', attempts: 1, lastAttempt: Date.now(), mastered: false },
      { questionId: 'q3', subject: 'science', userAnswer: 'X', attempts: 1, lastAttempt: Date.now(), mastered: false },
    ];
    const result = computeWrongNoteSummary(notes);
    expect(result.total).toBe(3);
    expect(result.mastered).toBe(1);
    expect(result.unmastered).toBe(2);
    expect(result.resolutionRate).toBe(33);
    expect(result.bySubject).toHaveLength(2);
    // sorted by unmastered desc
    expect(result.bySubject[0].subject).toBe('math');
  });
});

// ─── computeWeeklySummary ────────────────────────────────────────────────────

describe('computeWeeklySummary', () => {
  it('returns zeros for empty history', () => {
    const result = computeWeeklySummary([]);
    expect(result.thisWeek.count).toBe(0);
    expect(result.lastWeek.count).toBe(0);
  });

  it('separates this week and last week results', () => {
    const history: QuizResult[] = [
      makeResult({ subject: 'a', chapter: 'c', isCorrect: true, timestamp: Date.now() }),
      makeResult({ subject: 'a', chapter: 'c', isCorrect: false, timestamp: daysAgo(8) }),
    ];
    const result = computeWeeklySummary(history);
    expect(result.thisWeek.count).toBeGreaterThanOrEqual(1);
  });
});

// ─── computeWeeklyTrend ──────────────────────────────────────────────────────

describe('computeWeeklyTrend', () => {
  it('returns requested number of weeks', () => {
    const result = computeWeeklyTrend([], 4);
    expect(result).toHaveLength(4);
    result.forEach((entry) => {
      expect(entry.count).toBe(0);
      expect(entry.rate).toBe(0);
    });
  });

  it('contains weekLabel in MM/DD format', () => {
    const result = computeWeeklyTrend([], 1);
    expect(result[0].weekLabel).toMatch(/^\d{2}\/\d{2}$/);
  });
});

// ─── computeHeatmapData ─────────────────────────────────────────────────────

describe('computeHeatmapData', () => {
  it('returns correct total days for given weeks', () => {
    const result = computeHeatmapData([], 4);
    expect(result.days).toHaveLength(28);
    expect(result.maxCount).toBe(0);
    expect(result.totalWeeks).toBe(4);
  });

  it('counts activity per day', () => {
    const history: QuizResult[] = [
      makeResult({ subject: 'a', chapter: 'c', isCorrect: true, timestamp: Date.now() }),
      makeResult({ subject: 'a', chapter: 'c', isCorrect: true, timestamp: Date.now() }),
    ];
    const result = computeHeatmapData(history, 1);
    const today = result.days[result.days.length - 1];
    expect(today.count).toBe(2);
    expect(result.maxCount).toBe(2);
  });

  it('each day has valid dayOfWeek (0-6)', () => {
    const result = computeHeatmapData([], 2);
    result.days.forEach((d) => {
      expect(d.dayOfWeek).toBeGreaterThanOrEqual(0);
      expect(d.dayOfWeek).toBeLessThanOrEqual(6);
    });
  });
});

// ─── computeStudyDays ───────────────────────────────────────────────────────

describe('computeStudyDays', () => {
  it('returns zeros for empty history', () => {
    const result = computeStudyDays([]);
    expect(result).toEqual({ totalDays: 0, recentDays: 0 });
  });

  it('counts days with questionsAttempted > 0', () => {
    const history: DailyHistoryEntry[] = [
      { date: '2026-03-10', questionsAttempted: 5, questionsCorrect: 3, xpEarned: 50 },
      { date: '2026-03-11', questionsAttempted: 0, questionsCorrect: 0, xpEarned: 0 },
      { date: '2026-03-12', questionsAttempted: 3, questionsCorrect: 2, xpEarned: 30 },
    ];
    const result = computeStudyDays(history);
    expect(result.totalDays).toBe(2);
  });
});

// ─── computeSubjectWeeklySummary ────────────────────────────────────────────

describe('computeSubjectWeeklySummary', () => {
  it('returns empty for empty history', () => {
    expect(computeSubjectWeeklySummary([])).toEqual([]);
  });

  it('shows this week data with delta equal to rate when no last week data', () => {
    const result = computeSubjectWeeklySummary([
      makeResult({ subject: 'math', chapter: 'c1', isCorrect: true, timestamp: Date.now() }),
      makeResult({ subject: 'math', chapter: 'c1', isCorrect: false, timestamp: Date.now() }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].subject).toBe('math');
    expect(result[0].thisWeek.count).toBe(2);
    expect(result[0].thisWeek.rate).toBe(50);
    expect(result[0].lastWeek.count).toBe(0);
    expect(result[0].delta).toBe(50); // 50 - 0
  });

  it('compares this week and last week correctly', () => {
    const result = computeSubjectWeeklySummary([
      makeResult({ subject: 'sci', chapter: 'c1', isCorrect: true, timestamp: Date.now() }),
      makeResult({ subject: 'sci', chapter: 'c1', isCorrect: true, timestamp: Date.now() }),
      makeResult({ subject: 'sci', chapter: 'c1', isCorrect: false, timestamp: daysAgo(8) }),
      makeResult({ subject: 'sci', chapter: 'c1', isCorrect: false, timestamp: daysAgo(8) }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].thisWeek.rate).toBe(100);
    expect(result[0].lastWeek.rate).toBe(0);
    expect(result[0].delta).toBe(100);
  });

  it('sorts by absolute delta descending', () => {
    const result = computeSubjectWeeklySummary([
      // math: small delta
      makeResult({ subject: 'math', chapter: 'c1', isCorrect: true, timestamp: Date.now() }),
      makeResult({ subject: 'math', chapter: 'c1', isCorrect: true, timestamp: daysAgo(8) }),
      // sci: large delta
      makeResult({ subject: 'sci', chapter: 'c1', isCorrect: true, timestamp: Date.now() }),
      makeResult({ subject: 'sci', chapter: 'c1', isCorrect: false, timestamp: daysAgo(8) }),
    ]);
    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(Math.abs(result[0].delta)).toBeGreaterThanOrEqual(Math.abs(result[1].delta));
  });
});

// ─── detectWeakToStrong ─────────────────────────────────────────────────────

describe('detectWeakToStrong', () => {
  it('returns empty for empty history', () => {
    expect(detectWeakToStrong([])).toEqual([]);
  });

  it('detects weak-to-strong conversion', () => {
    const history: QuizResult[] = [
      // Previous period (31-60 days ago): 33% rate (below 60%)
      makeResult({ subject: 'law', chapter: 'c1', isCorrect: true, timestamp: daysAgo(45) }),
      makeResult({ subject: 'law', chapter: 'c1', isCorrect: false, timestamp: daysAgo(45) }),
      makeResult({ subject: 'law', chapter: 'c1', isCorrect: false, timestamp: daysAgo(45) }),
      // Recent period (0-30 days): 100% rate (above 60%)
      makeResult({ subject: 'law', chapter: 'c1', isCorrect: true, timestamp: daysAgo(5) }),
      makeResult({ subject: 'law', chapter: 'c1', isCorrect: true, timestamp: daysAgo(5) }),
      makeResult({ subject: 'law', chapter: 'c1', isCorrect: true, timestamp: daysAgo(5) }),
    ];
    const result = detectWeakToStrong(history, 30, 60);
    expect(result).toHaveLength(1);
    expect(result[0].subject).toBe('law');
    expect(result[0].previousRate).toBe(33);
    expect(result[0].currentRate).toBe(100);
  });

  it('ignores subjects already strong in previous period', () => {
    const history: QuizResult[] = [
      // Previous: 100% (already strong)
      makeResult({ subject: 'math', chapter: 'c1', isCorrect: true, timestamp: daysAgo(45) }),
      makeResult({ subject: 'math', chapter: 'c1', isCorrect: true, timestamp: daysAgo(45) }),
      makeResult({ subject: 'math', chapter: 'c1', isCorrect: true, timestamp: daysAgo(45) }),
      // Recent: 100%
      makeResult({ subject: 'math', chapter: 'c1', isCorrect: true, timestamp: daysAgo(5) }),
      makeResult({ subject: 'math', chapter: 'c1', isCorrect: true, timestamp: daysAgo(5) }),
      makeResult({ subject: 'math', chapter: 'c1', isCorrect: true, timestamp: daysAgo(5) }),
    ];
    expect(detectWeakToStrong(history, 30, 60)).toEqual([]);
  });

  it('ignores subjects with fewer than 3 results in either period', () => {
    const history: QuizResult[] = [
      // Previous: only 2 results
      makeResult({ subject: 'art', chapter: 'c1', isCorrect: false, timestamp: daysAgo(45) }),
      makeResult({ subject: 'art', chapter: 'c1', isCorrect: false, timestamp: daysAgo(45) }),
      // Recent: 3 results
      makeResult({ subject: 'art', chapter: 'c1', isCorrect: true, timestamp: daysAgo(5) }),
      makeResult({ subject: 'art', chapter: 'c1', isCorrect: true, timestamp: daysAgo(5) }),
      makeResult({ subject: 'art', chapter: 'c1', isCorrect: true, timestamp: daysAgo(5) }),
    ];
    expect(detectWeakToStrong(history, 30, 60)).toEqual([]);
  });
});
