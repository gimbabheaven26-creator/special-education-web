import { createElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecordDashboard from '../RecordDashboard';

const mockMyPageData = vi.hoisted(() => ({
  level: {
    emoji: '🌱',
    name: '새싹',
    level: 1,
    nextName: null,
    progress: { percent: 20 },
  },
  weakness: {
    subjectStats: [],
    weakAreas: [{ subject: 'laws', correct: 1, total: 2, rate: 50 }],
    overall: { correct: 1, total: 2, rate: 50 },
    trend: 'stable' as const,
  },
  unmasteredCount: 0,
  recommendations: [],
  currentStreak: 1,
  subjectWeekly: [],
  weakToStrong: [],
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}));

vi.mock('@/app/my/useMyPageData', () => ({
  useMyPageData: () => mockMyPageData,
}));

vi.mock('@/hooks/useMounted', () => ({
  useMounted: () => true,
}));

vi.mock('@/stores/useStudyStore', () => ({
  useStudyStore: (selector: (state: unknown) => unknown) =>
    selector({
      totalXP: 120,
      totalQuizzes: 2,
      dailyProgress: { quizzesCompleted: 2, quizzesCorrect: 1 },
    }),
}));

vi.mock('@/stores/useQuizStore', () => ({
  useQuizStore: (selector: (state: unknown) => unknown) =>
    selector({ wrongNotes: [], quizHistory: [] }),
}));

vi.mock('@/stores/useBookmarkStore', () => ({
  useBookmarkStore: (selector: (state: unknown) => unknown) =>
    selector({ bookmarks: [] }),
}));

vi.mock('@/stores/useLeitnerStore', () => ({
  useLeitnerStore: (selector: (state: unknown) => unknown) =>
    selector({ getStats: () => ({ dueToday: 0 }) }),
}));

vi.mock('zustand/react/shallow', () => ({
  useShallow: (selector: unknown) => selector,
}));

vi.mock('@/app/my/MySubComponents', () => ({
  RecentWrongTab: () => createElement('div', null, '최근 틀린 문제 없음'),
}));

vi.mock('@/app/my/WeeklyActivityChart', () => ({
  WeeklyActivityChart: () => createElement('div', null, '주간 활동'),
}));

vi.mock('@/components/BadgeDisplay', () => ({
  BadgeDisplay: () => createElement('div', null, '배지'),
}));

vi.mock('@/components/ExamCountdown', () => ({
  ExamCountdown: () => createElement('div', null, '시험 카운트다운'),
}));

vi.mock('@/components/dashboard/FlashcardReviewStats', () => ({
  FlashcardReviewStats: () => createElement('div', null, '플래시카드 통계'),
}));

describe('RecordDashboard', () => {
  it('shows percent values without multiplying them again', () => {
    render(<RecordDashboard />);

    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
    expect(screen.queryByText('5000%')).toBeNull();
  });

  it('shows user-facing subject labels instead of internal slugs', () => {
    render(<RecordDashboard />);

    expect(screen.getByText('관련 법령')).toBeDefined();
    expect(screen.queryByText('laws')).toBeNull();
  });
});
