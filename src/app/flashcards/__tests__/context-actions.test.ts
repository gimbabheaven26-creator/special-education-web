import { describe, expect, it } from 'vitest';
import type { LeitnerCard } from '@/stores/useLeitnerStore';
import { buildFlashcardContextActions } from '../context-actions';

function makeCard(overrides: Partial<LeitnerCard> = {}): LeitnerCard {
  return {
    id: 'wrong-laws-q1',
    subjectSlug: 'laws',
    question: '특수교육법 문제',
    answer: 'O',
    box: 1,
    lastReviewed: '2026-05-18',
    nextReview: '2026-05-18',
    createdAt: '2026-05-18',
    source: 'quiz-ox',
    chapterSlug: 'special-education-act',
    quizId: 'laws-q1',
    quizType: 'ox',
    ...overrides,
  };
}

describe('buildFlashcardContextActions', () => {
  it('links quiz-origin cards back to concept, focused quiz, and wrong notes', () => {
    const actions = buildFlashcardContextActions(makeCard());

    expect(actions).toEqual([
      {
        kind: 'concept',
        label: '특수교육법 개념 보기',
        href: '/concepts/관련 법령',
      },
      {
        kind: 'quiz',
        label: '같은 영역 다시 풀기',
        href: '/quiz/laws?chapter=special-education-act',
      },
      {
        kind: 'wrong-note',
        label: '오답노트 보기',
        href: '/wrong-notes',
      },
    ]);
  });

  it('does not show context actions for manual cards without source metadata', () => {
    expect(buildFlashcardContextActions(makeCard({
      id: 'manual-1',
      source: 'manual',
      chapterSlug: undefined,
      quizId: undefined,
      quizType: undefined,
    }))).toEqual([]);
  });
});
