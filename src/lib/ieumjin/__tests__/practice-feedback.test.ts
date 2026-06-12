import { describe, expect, it } from 'vitest';
import { getTermLensByQuery } from '../term-lens';
import {
  buildReviewReservation,
  evaluatePracticeAnswer,
} from '../practice-feedback';

describe('evaluatePracticeAnswer', () => {
  it('gives full feedback when an FBA answer covers ABC, function, intervention, and evidence', () => {
    const lens = getTermLensByQuery('FBA');
    const feedback = evaluatePracticeAnswer({
      answer:
        '선행사건, 행동, 후속결과를 ABC 관찰로 기록하고 자료를 근거로 기능 가설을 세운다. 이후 같은 기능을 충족하는 대체행동을 교수하고 선행사건 중재와 강화를 계획한다.',
      question: lens.practiceLoop.examQuestion,
    });

    expect(feedback.score).toBe(4);
    expect(feedback.maxScore).toBe(4);
    expect(feedback.level).toBe('ready');
    expect(feedback.matchedItems.map((item) => item.id)).toEqual([
      'abc',
      'function-hypothesis',
      'support-plan',
      'evidence-guardrail',
    ]);
    expect(feedback.missingItems).toHaveLength(0);
  });

  it('returns missing criteria when the answer names behavior without functional evidence', () => {
    const lens = getTermLensByQuery('기능적 행동평가');
    const feedback = evaluatePracticeAnswer({
      answer: '문제행동이 심하므로 벌을 주고 행동을 줄인다.',
      question: lens.practiceLoop.examQuestion,
    });

    expect(feedback.score).toBe(0);
    expect(feedback.level).toBe('needs-source');
    expect(feedback.missingItems.map((item) => item.id)).toContain('abc');
    expect(feedback.nextAction).toContain('선행사건');
  });
});

describe('buildReviewReservation', () => {
  it('creates a serializable review reservation for the selected delay', () => {
    const reservation = buildReviewReservation({
      termId: 'fba',
      promptId: 'fba-analog-1',
      delayDays: 3,
      score: 3,
      maxScore: 4,
      now: new Date('2026-06-12T00:00:00.000Z'),
    });

    expect(reservation.termId).toBe('fba');
    expect(reservation.reviewAt).toBe('2026-06-15T00:00:00.000Z');
    expect(JSON.parse(JSON.stringify(reservation))).toEqual(reservation);
  });
});
