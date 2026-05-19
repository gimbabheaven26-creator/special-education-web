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

  it('links term-origin cards back to the matching terms search', () => {
    const actions = buildFlashcardContextActions(makeCard({
      id: 'term-감각 교육',
      subjectSlug: 'introduction',
      question: '감각 교육 (sensory education)',
      answer: '감각을 활용한 교육 활동',
      source: 'term',
      chapterSlug: undefined,
      quizId: undefined,
      quizType: undefined,
    }));

    expect(actions).toEqual([
      {
        kind: 'term',
        label: '용어사전에서 다시 보기',
        href: '/terms?q=%EA%B0%90%EA%B0%81%20%EA%B5%90%EC%9C%A1',
      },
    ]);
  });
});
