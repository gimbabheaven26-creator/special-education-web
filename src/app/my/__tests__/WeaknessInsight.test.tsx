import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeaknessInsight } from '../WeaknessInsight';
import { useQuizStore } from '@/stores/useQuizStore';
import type { QuizResult } from '@/types/quiz';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}));

function makeResult(subject: string, isCorrect: boolean, i: number): QuizResult {
  return {
    questionId: `${subject}-${i}`,
    userAnswer: 'O',
    isCorrect,
    timestamp: Date.now() - i * 1000,
    subject,
    chapter: 'ch-1',
  };
}

describe('WeaknessInsight concept review link', () => {
  beforeEach(() => {
    useQuizStore.setState({ quizHistory: [], wrongNotes: [] });
  });

  it('shows a concept review link for each weak subject with a concept mapping', () => {
    // behavior-support: 2/10 correct → 20% (weak), 10+ total entries
    const history = [
      ...Array.from({ length: 10 }, (_, i) => makeResult('behavior-support', i < 2, i)),
      ...Array.from({ length: 5 }, (_, i) => makeResult('curriculum', true, 100 + i)),
    ];
    useQuizStore.setState({ quizHistory: history, wrongNotes: [] });

    render(<WeaknessInsight />);
    const conceptLink = screen.getByText('개념 복습').closest('a');
    expect(conceptLink?.getAttribute('href')).toBe('/concepts/행동수정');
  });

  it('keeps the practice link pointing at the subject quiz', () => {
    const history = Array.from({ length: 10 }, (_, i) => makeResult('behavior-support', i < 2, i));
    useQuizStore.setState({ quizHistory: history, wrongNotes: [] });

    render(<WeaknessInsight />);
    const practiceLink = screen.getByRole('link', { name: /퀴즈 연습하기/ });
    expect(practiceLink.getAttribute('href')).toBe('/quiz/behavior-support');
  });
});
