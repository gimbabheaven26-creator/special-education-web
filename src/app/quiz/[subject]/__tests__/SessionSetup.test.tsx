import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { QuizQuestion } from '@/types/quiz';
import { SessionSetup } from '../SessionSetup';

const searchParams = vi.hoisted(() => new URLSearchParams('chapter=target-chapter'));

vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams,
}));

vi.mock('@/stores/useQuizStore', () => ({
  useQuizStore: (selector: (state: unknown) => unknown) =>
    selector({
      quizHistory: [],
      wrongNotes: [],
    }),
}));

vi.mock('@/stores/useLeitnerStore', () => ({
  useLeitnerStore: (selector: (state: unknown) => unknown) =>
    selector({
      cards: [],
      getDueCards: () => [],
    }),
}));

function makeQuestion(chapter: string): QuizQuestion {
  return {
    id: `q-${chapter}`,
    subject: 'laws',
    chapter,
    type: 'ox',
    question: `${chapter} 문제`,
    answer: 'O',
    explanation: '해설',
    difficulty: 1,
  };
}

describe('SessionSetup', () => {
  it('preselects the chapter from the chapter query parameter', async () => {
    const onStart = vi.fn();

    render(
      <SessionSetup
        subjectSlug="laws"
        subjectTitle="관련 법령"
        questions={[makeQuestion('target-chapter'), makeQuestion('other-chapter')]}
        chapterMap={{ 'target-chapter': '목표 챕터', 'other-chapter': '다른 챕터' }}
        savedSession={null}
        onStart={onStart}
        onResume={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '퀴즈 시작' }));

    expect(onStart).toHaveBeenCalledWith(expect.objectContaining({
      chapters: ['target-chapter'],
    }));
  });
});
