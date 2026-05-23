import { describe, expect, it } from 'vitest';
import type { QuizResult } from '@/types/quiz';
import type { WrongNote } from '@/types/study';

import { buildReadinessSnapshot } from '../readiness';

function makeResult(overrides: Partial<QuizResult> = {}): QuizResult {
  return {
    questionId: 'q1',
    userAnswer: 'A',
    isCorrect: true,
    timestamp: Date.UTC(2026, 4, 22, 10),
    subject: 'behavior-support',
    chapter: 'functional-behavior-assessment',
    sessionId: 'sew-next-adaptive',
    ...overrides,
  };
}

describe('buildReadinessSnapshot', () => {
  it('keeps the baseline cockpit when no quiz history exists', () => {
    const snapshot = buildReadinessSnapshot({ quizHistory: [], wrongNotes: [] });

    expect(snapshot.heroValue).toBe(68);
    expect(snapshot.metrics[0]).toMatchObject({
      label: '합격 준비도',
      value: 68,
      note: '최근 14일 실전형 문항 기준',
    });
  });

  it('computes readiness from recent accuracy, coverage, and wrong-note risk', () => {
    const wrongNotes = [
      { questionId: 'w1', subject: 'behavior-support', mastered: false },
      { questionId: 'w2', subject: 'assistive-technology', mastered: false },
      { questionId: 'w3', subject: 'laws', mastered: true },
    ] as WrongNote[];

    const snapshot = buildReadinessSnapshot({
      now: Date.UTC(2026, 4, 23, 9),
      quizHistory: [
        makeResult({ questionId: 'q1', isCorrect: true, subject: 'behavior-support' }),
        makeResult({ questionId: 'q2', isCorrect: true, subject: 'assistive-technology' }),
        makeResult({ questionId: 'q3', isCorrect: false, subject: 'laws' }),
        makeResult({ questionId: 'q4', isCorrect: true, subject: 'behavior-support' }),
      ],
      wrongNotes,
    });

    expect(snapshot.heroValue).toBe(71);
    expect(snapshot.metrics[0].note).toBe('최근 4문항 · 정답률 75%');
    expect(snapshot.metrics[1].note).toBe('최근 14일 3개 영역 노출');
    expect(snapshot.metrics[2].value).toBe(2);
    expect(snapshot.highRiskDomains[0].domain).toBe('행동지원');
  });
});
