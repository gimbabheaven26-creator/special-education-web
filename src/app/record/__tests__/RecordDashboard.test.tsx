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

const mockQuizState = vi.hoisted(() => ({
  wrongNotes: [] as unknown[],
  quizHistory: [] as Array<{
    questionId: string;
    userAnswer?: string | number;
    isCorrect: boolean;
    timestamp: number;
    subject: string;
    chapter: string;
    sessionId?: string;
    sewNextExamMeta?: {
      paperLabel: string;
      period: string;
      questionNumber: number;
      format: string;
      points: number;
      mockVariant?: 'quick' | 'full';
    };
  }>,
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
      dailyGoal: { quizzes: 10, chapters: 2 },
    }),
}));

vi.mock('@/stores/useQuizStore', () => ({
  useQuizStore: (selector: (state: unknown) => unknown) =>
    selector(mockQuizState),
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
  beforeEach(() => {
    mockQuizState.wrongNotes = [];
    mockQuizState.quizHistory = [];
  });

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

  it('shows a today growth feedback card when there is activity', () => {
    render(<RecordDashboard />);

    expect(screen.getByText('오늘의 성장')).toBeDefined();
    expect(screen.getByText('2문제 · 50%')).toBeDefined();
  });

  it('highlights the latest SEW Next practice session', () => {
    mockQuizState.quizHistory = [
      {
        questionId: 'next-adaptive-fba-01',
        userAnswer: '행동의 기능을 파악해 중재 가설을 세우는 것',
        isCorrect: true,
        timestamp: 1779258091373,
        subject: '정서행동장애',
        chapter: '긍정적 행동지원, 기능평가, 중재 충실도',
        sessionId: 'sew-next-adaptive',
      },
      {
        questionId: 'next-adaptive-abc-02',
        userAnswer: '행동 직후 따라오는 반응이나 환경 변화',
        isCorrect: true,
        timestamp: 1779258191373,
        subject: '정서행동장애',
        chapter: 'ABC 기록, 기능평가, 긍정적 행동지원',
        sessionId: 'sew-next-adaptive',
      },
    ];

    render(<RecordDashboard />);

    expect(screen.getByText('최근 SEW Next 세션')).toBeDefined();
    expect(screen.getByText('Adaptive Readiness')).toBeDefined();
    expect(screen.getByText('2문항 · 100%')).toBeDefined();
    expect(screen.getByText(/정서행동장애/)).toBeDefined();
  });

  it('shows the latest three SEW Next session rates as a trend', () => {
    const base = 1779258091373;
    mockQuizState.quizHistory = [
      {
        questionId: 'old-1',
        isCorrect: true,
        timestamp: base,
        subject: '정서행동장애',
        chapter: '기능평가',
        sessionId: 'sew-next-adaptive',
      },
      {
        questionId: 'middle-1',
        isCorrect: false,
        timestamp: base + 60 * 60 * 1000,
        subject: '특수교육공학',
        chapter: '보조공학',
        sessionId: 'sew-next-custom',
      },
      {
        questionId: 'middle-2',
        isCorrect: true,
        timestamp: base + 60 * 60 * 1000 + 1000,
        subject: '특수교육공학',
        chapter: '보조공학',
        sessionId: 'sew-next-custom',
      },
      {
        questionId: 'latest-1',
        isCorrect: true,
        timestamp: base + 2 * 60 * 60 * 1000,
        subject: '관련 법령',
        chapter: 'IEP',
        sessionId: 'sew-next-mock',
      },
    ];

    render(<RecordDashboard />);

    expect(screen.getByText('최근 3회 SEW Next 흐름')).toBeDefined();
    expect(screen.getAllByText('Mock Exam').length).toBeGreaterThan(0);
    expect(screen.getByText('Custom Qbank')).toBeDefined();
    expect(screen.getAllByText('100%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
  });

  it('recommends the next SEW Next study action from the weakest recent session', () => {
    const base = 1779258091373;
    mockQuizState.quizHistory = [
      {
        questionId: 'old-1',
        isCorrect: true,
        timestamp: base,
        subject: '정서행동장애',
        chapter: '기능평가',
        sessionId: 'sew-next-adaptive',
      },
      {
        questionId: 'middle-1',
        isCorrect: false,
        timestamp: base + 60 * 60 * 1000,
        subject: '특수교육공학',
        chapter: '보조공학',
        sessionId: 'sew-next-custom',
      },
      {
        questionId: 'middle-2',
        isCorrect: true,
        timestamp: base + 60 * 60 * 1000 + 1000,
        subject: '특수교육공학',
        chapter: '보조공학',
        sessionId: 'sew-next-custom',
      },
      {
        questionId: 'latest-1',
        isCorrect: true,
        timestamp: base + 2 * 60 * 60 * 1000,
        subject: '관련 법령',
        chapter: 'IEP',
        sessionId: 'sew-next-mock',
      },
    ];

    render(<RecordDashboard />);

    expect(screen.getByText('다음 추천 학습')).toBeDefined();
    expect(screen.getByText('특수교육공학 보조공학을 2문항만 더 풀어 보세요.')).toBeDefined();
  });

  it('shows cumulative 전공A/B mock exam trends from stored question metadata', () => {
    const base = 1779258091373;
    mockQuizState.quizHistory = [
      {
        questionId: 'mock-a-1',
        isCorrect: true,
        timestamp: base,
        subject: '관련 법령',
        chapter: 'IEP',
        sessionId: 'sew-next-mock',
        sewNextExamMeta: {
          paperLabel: '전공A',
          period: '2교시',
          questionNumber: 1,
          format: '단답형',
          points: 2,
          mockVariant: 'quick',
        },
      },
      {
        questionId: 'mock-b-1',
        isCorrect: false,
        timestamp: base + 1000,
        subject: '정서행동장애',
        chapter: 'FBA',
        sessionId: 'sew-next-mock',
        sewNextExamMeta: {
          paperLabel: '전공B',
          period: '3교시',
          questionNumber: 1,
          format: '서술형',
          points: 4,
          mockVariant: 'quick',
        },
      },
      {
        questionId: 'mock-full-a-1',
        isCorrect: false,
        timestamp: base + 60 * 60 * 1000,
        subject: '교육과정',
        chapter: '기본 교육과정',
        sessionId: 'sew-next-mock-full',
        sewNextExamMeta: {
          paperLabel: '전공A',
          period: '2교시',
          questionNumber: 2,
          format: '서술형',
          points: 4,
          mockVariant: 'full',
        },
      },
    ];

    render(<RecordDashboard />);

    expect(screen.getByText('Mock Exam 전공A/B 추세')).toBeDefined();
    expect(screen.getByText('전공A · 2교시')).toBeDefined();
    expect(screen.getByText('전공B · 3교시')).toBeDefined();
    expect(screen.getByText('2문항 중 1문항 정답 · 50%')).toBeDefined();
    expect(screen.getByText('2/6점')).toBeDefined();
    expect(screen.getByText('실전형 1문항 포함')).toBeDefined();
    expect(screen.getByText('교시별 약점 처방')).toBeDefined();
    expect(screen.getByText('전공A 2교시: 서술형 2문항을 실전형으로 이어 풀어 보세요.')).toBeDefined();
  });
});
