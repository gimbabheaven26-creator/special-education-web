import { describe, expect, it } from 'vitest';
import { buildDailyNextStep } from '../daily-next-step';
import type { DailyQuestion } from '@/types/daily';

function makeQuestion(
  id: string,
  subject: string,
  chapter: string,
  answer: 'O' | 'X',
): DailyQuestion {
  return {
    id,
    type: 'ox',
    question: `문제 ${id}`,
    subject,
    chapter,
    answer,
  };
}

describe('buildDailyNextStep', () => {
  it('summarizes the weakest wrong chapter after OX grading', () => {
    const questions = [
      makeQuestion('q1', 'laws', 'special-education-act', 'O'),
      makeQuestion('q2', 'behavior-support', 'pbs', 'X'),
      makeQuestion('q3', 'laws', 'special-education-act', 'X'),
    ];

    const summary = buildDailyNextStep(questions, {
      q1: 'X',
      q2: 'X',
      q3: 'O',
    });

    expect(summary.correct).toBe(1);
    expect(summary.total).toBe(3);
    expect(summary.rate).toBe(33);
    expect(summary.primaryChapterLabel).toBe('특수교육법');
    expect(summary.primarySubjectLabel).toBe('관련 법령');
    expect(summary.conceptHref).toBe('/concepts/관련 법령/special-education-act');
  });

  it('returns a completion message when there are no wrong answers', () => {
    const questions = [
      makeQuestion('q1', 'laws', 'special-education-act', 'O'),
      makeQuestion('q2', 'behavior-support', 'pbs', 'X'),
    ];

    const summary = buildDailyNextStep(questions, { q1: 'O', q2: 'X' });

    expect(summary.correct).toBe(2);
    expect(summary.total).toBe(2);
    expect(summary.primaryChapterLabel).toBeNull();
    expect(summary.conceptHref).toBeNull();
    expect(summary.message).toContain('단답형으로 넘어가도 좋아요');
  });
});
