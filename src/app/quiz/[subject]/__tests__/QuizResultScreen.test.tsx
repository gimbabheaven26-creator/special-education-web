import { createElement } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QuizResultScreen, type AnswerRecord } from '../QuizResultScreen';
import type { QuizQuestion } from '@/types/quiz';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) =>
    createElement('a', { href, ...props }, children),
}));

function makeQuestion(id: string): QuizQuestion {
  return {
    id,
    type: 'ox',
    question: `질문 ${id}`,
    answer: 'O',
    explanation: '',
    subject: 'behavior-support',
    chapter: 'ch-1',
  } as QuizQuestion;
}

function renderResult(answers: AnswerRecord[]) {
  return render(
    <QuizResultScreen
      questions={[makeQuestion('1'), makeQuestion('2'), makeQuestion('3')]}
      answers={answers}
      totalXPEarned={30}
      subjectSlug="behavior-support"
      chapterMap={{}}
      onRestart={() => {}}
      onRetryWrong={() => {}}
    />,
  );
}

describe('QuizResultScreen next-step nudge', () => {
  it('shows wrong-notes link when there are wrong answers', () => {
    renderResult([
      { questionIndex: 0, isCorrect: true, userAnswer: 'O' },
      { questionIndex: 1, isCorrect: false, userAnswer: 'X' },
      { questionIndex: 2, isCorrect: false, userAnswer: 'X' },
    ]);
    const link = screen.getByText(/오답노트에서 2문제 정리하기/).closest('a');
    expect(link?.getAttribute('href')).toBe('/wrong-notes');
  });

  it('shows concept link when score is below 60%', () => {
    renderResult([
      { questionIndex: 0, isCorrect: true, userAnswer: 'O' },
      { questionIndex: 1, isCorrect: false, userAnswer: 'X' },
      { questionIndex: 2, isCorrect: false, userAnswer: 'X' },
    ]);
    const link = screen.getByText(/개념부터 다시 정리하기/).closest('a');
    expect(link?.getAttribute('href')).toBe('/concepts/행동수정');
  });

  it('hides nudge entirely on a perfect score', () => {
    renderResult([
      { questionIndex: 0, isCorrect: true, userAnswer: 'O' },
      { questionIndex: 1, isCorrect: true, userAnswer: 'O' },
      { questionIndex: 2, isCorrect: true, userAnswer: 'O' },
    ]);
    expect(screen.queryByText('다음 단계')).toBeNull();
    expect(screen.queryByText(/오답노트에서/)).toBeNull();
  });
});
