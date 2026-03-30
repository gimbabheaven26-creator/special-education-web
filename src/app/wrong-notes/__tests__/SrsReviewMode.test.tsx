import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// ── Mock stores ────────────────────────────────────────────────
const mockGetDueCards = vi.fn();
const mockAnswerCard = vi.fn();
const mockGetStats = vi.fn();

vi.mock('@/stores/useLeitnerStore', () => ({
  useLeitnerStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      getDueCards: mockGetDueCards,
      answerCard: mockAnswerCard,
      getStats: mockGetStats,
    }),
}));

// ── Mock next/link ─────────────────────────────────────────────
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>{children}</a>
  ),
}));

import SrsReviewMode from '../SrsReviewMode';

const makeCard = (id: string, box: number = 1) => ({
  id,
  subjectSlug: 'test',
  question: `Q-${id}`,
  answer: `A-${id}`,
  box,
  lastReviewed: '2026-03-28',
  nextReview: '2026-03-29',
  createdAt: '2026-03-25',
});

const defaultStats = {
  box1: 3, box2: 1, box3: 0, box4: 0, box5: 0,
  total: 4, dueToday: 3,
};

describe('SrsReviewMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetStats.mockReturnValue(defaultStats);
  });

  // ── Empty state ──────────────────────────────────────────────
  describe('no due cards', () => {
    it('shows empty message when no cards at all', () => {
      mockGetDueCards.mockReturnValue([]);
      mockGetStats.mockReturnValue({ box1: 0, box2: 0, box3: 0, box4: 0, box5: 0, total: 0, dueToday: 0 });

      render(<SrsReviewMode />);

      expect(screen.getByText('오늘 복습할 카드가 없어요')).toBeDefined();
      expect(screen.getByText(/플래시카드로 저장하면/)).toBeDefined();
      expect(screen.getByText('오답 노트에서 카드 추가하기')).toBeDefined();
    });

    it('shows "come back tomorrow" when cards exist but none due', () => {
      mockGetDueCards.mockReturnValue([]);
      mockGetStats.mockReturnValue({ ...defaultStats, dueToday: 0 });

      render(<SrsReviewMode />);

      expect(screen.getByText('오늘 복습할 카드가 없어요')).toBeDefined();
      expect(screen.getByText(/내일 다시 와서/)).toBeDefined();
    });

    it('renders box distribution when cards exist', () => {
      mockGetDueCards.mockReturnValue([]);
      mockGetStats.mockReturnValue({ ...defaultStats, dueToday: 0 });

      render(<SrsReviewMode />);

      expect(screen.getByText('단계별 카드 분포')).toBeDefined();
      expect(screen.getByText(/전체 4장/)).toBeDefined();
    });
  });

  // ── Card review flow ─────────────────────────────────────────
  describe('card review', () => {
    it('shows question and progress bar', () => {
      const cards = [makeCard('c1'), makeCard('c2')];
      mockGetDueCards.mockReturnValue(cards);

      render(<SrsReviewMode />);

      expect(screen.getByText('Q-c1')).toBeDefined();
      expect(screen.getByText('1 / 2')).toBeDefined();
      expect(screen.getByText('1단계')).toBeDefined();
      expect(screen.getByText('정답 보기')).toBeDefined();
    });

    it('reveals answer on button click', () => {
      mockGetDueCards.mockReturnValue([makeCard('c1')]);

      render(<SrsReviewMode />);

      fireEvent.click(screen.getByText('정답 보기'));

      expect(screen.getByText('A-c1')).toBeDefined();
      expect(screen.getByText('맞음')).toBeDefined();
      expect(screen.getByText('틀림')).toBeDefined();
    });

    it('calls answerCard with knew on "맞음"', () => {
      mockGetDueCards.mockReturnValue([makeCard('c1')]);

      render(<SrsReviewMode />);
      fireEvent.click(screen.getByText('정답 보기'));
      fireEvent.click(screen.getByText('맞음'));

      expect(mockAnswerCard).toHaveBeenCalledWith('c1', 'knew');
    });

    it('calls answerCard with forgot on "틀림"', () => {
      mockGetDueCards.mockReturnValue([makeCard('c1')]);

      render(<SrsReviewMode />);
      fireEvent.click(screen.getByText('정답 보기'));
      fireEvent.click(screen.getByText('틀림'));

      expect(mockAnswerCard).toHaveBeenCalledWith('c1', 'forgot');
    });
  });

  // ── Session completion ───────────────────────────────────────
  describe('session completion', () => {
    it('shows completion screen with 100% score tier', () => {
      mockGetDueCards.mockReturnValue([makeCard('c1')]);

      render(<SrsReviewMode />);
      fireEvent.click(screen.getByText('정답 보기'));
      fireEvent.click(screen.getByText('맞음'));

      expect(screen.getByText('복습 완료!')).toBeDefined();
      expect(screen.getByText(/1장.*정답/)).toBeDefined();
      expect(screen.getByText(/100%/)).toBeDefined();
      expect(screen.getByText(/거의 완벽한 복습/)).toBeDefined();
    });

    it('shows correct tier for 0% score', () => {
      mockGetDueCards.mockReturnValue([makeCard('c1')]);

      render(<SrsReviewMode />);
      fireEvent.click(screen.getByText('정답 보기'));
      fireEvent.click(screen.getByText('틀림'));

      expect(screen.getByText(/반복할수록 기억에 남아요/)).toBeDefined();
    });

    it('restart button resets session', () => {
      mockGetDueCards.mockReturnValue([makeCard('c1')]);

      render(<SrsReviewMode />);
      fireEvent.click(screen.getByText('정답 보기'));
      fireEvent.click(screen.getByText('맞음'));

      expect(screen.getByText('복습 완료!')).toBeDefined();

      fireEvent.click(screen.getByText('다시 복습'));

      expect(screen.getByText('Q-c1')).toBeDefined();
      expect(screen.getByText('정답 보기')).toBeDefined();
    });
  });

  // ── SRS_RESULT_TIERS ────────────────────────────────────────
  describe('score tiers', () => {
    it('maps 91%+ to trophy tier', () => {
      // 10/10 = 100%
      const cards = Array.from({ length: 10 }, (_, i) => makeCard(`c${i}`));
      mockGetDueCards.mockReturnValue(cards);

      const { container } = render(<SrsReviewMode />);

      // Answer all correctly
      for (let i = 0; i < 10; i++) {
        fireEvent.click(screen.getByText('정답 보기'));
        fireEvent.click(screen.getByText('맞음'));
      }

      expect(screen.getByText(/거의 완벽한 복습/)).toBeDefined();
      expect(container.querySelector('[aria-hidden="true"]')?.textContent).toBe('🏆');
    });

    it('maps 61-90% to muscle tier', () => {
      // 7/10 = 70%
      const cards = Array.from({ length: 10 }, (_, i) => makeCard(`c${i}`));
      mockGetDueCards.mockReturnValue(cards);

      render(<SrsReviewMode />);

      for (let i = 0; i < 10; i++) {
        fireEvent.click(screen.getByText('정답 보기'));
        fireEvent.click(screen.getByText(i < 7 ? '맞음' : '틀림'));
      }

      expect(screen.getByText(/잘하고 있어요/)).toBeDefined();
    });
  });
});
