import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '@/types/quiz';
import { buildWrongNoteReviewActions } from '../review-actions';

function makeQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: 'wrong-action-q1',
    subject: 'laws',
    chapter: 'special-education-act',
    type: 'ox',
    question: '특수교육법 관련 문제',
    answer: 'O',
    explanation: '해설',
    difficulty: 1,
    ...overrides,
  };
}

describe('buildWrongNoteReviewActions', () => {
  it('connects a wrong note to concept review and chapter-focused quiz practice', () => {
    const actions = buildWrongNoteReviewActions(makeQuestion());

    expect(actions).toEqual([
      {
        kind: 'concept',
        label: '특수교육법 개념 찾기',
        href: '/concepts/관련 법령',
        ariaLabel: '특수교육법 관련 개념 학습으로 이동',
      },
      {
        kind: 'quiz',
        label: '특수교육법 다시 풀기',
        href: '/quiz/laws?chapter=special-education-act',
        ariaLabel: '특수교육법 오답 영역 다시 풀기',
      },
    ]);
  });

  it('does not create actions before the wrong note question is hydrated', () => {
    expect(buildWrongNoteReviewActions(null)).toEqual([]);
  });
});
