import { describe, it, expect } from 'vitest';
import { validateQuizQuality, validateBatchQuality } from '../quiz-quality';

function makeQuiz(overrides: Record<string, unknown> = {}) {
  return {
    id: 'intro-001',
    subject: 'introduction',
    chapter: 'ch1',
    type: 'ox' as const,
    question: '특수교육은 장애 학생만을 위한 교육이다.',
    answer: 'X',
    explanation: '특수교육은 장애 학생뿐만 아니라 특수한 교육적 요구가 있는 모든 학생을 위한 교육입니다.',
    difficulty: 2,
    options: null,
    ...overrides,
  };
}

describe('validateQuizQuality', () => {
  it('valid OX question passes', () => {
    const result = validateQuizQuality(makeQuiz());
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects OX with invalid answer', () => {
    const result = validateQuizQuality(makeQuiz({ answer: 'o' }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e: string) => e.includes('O/X'))).toBe(true);
  });

  it('rejects OX with numeric answer', () => {
    const result = validateQuizQuality(makeQuiz({ answer: 1 }));
    expect(result.isValid).toBe(false);
  });

  it('rejects multiple with wrong option count', () => {
    const result = validateQuizQuality(makeQuiz({
      type: 'multiple',
      answer: '0',
      options: ['a', 'b', 'c'],
    }));
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e: string) => e.includes('4개'))).toBe(true);
  });

  it('rejects multiple with answer out of range', () => {
    const result = validateQuizQuality(makeQuiz({
      type: 'multiple',
      answer: '5',
      options: ['a', 'b', 'c', 'd'],
    }));
    expect(result.isValid).toBe(false);
  });

  it('warns on missing explanation', () => {
    const result = validateQuizQuality(makeQuiz({ explanation: '' }));
    expect(result.warnings.some((w: string) => w.includes('explanation'))).toBe(true);
  });

  it('warns on short explanation', () => {
    const result = validateQuizQuality(makeQuiz({ explanation: '짧은 설명' }));
    expect(result.warnings.some((w: string) => w.includes('짧'))).toBe(true);
  });

  it('rejects invalid subject', () => {
    const result = validateQuizQuality(makeQuiz({ subject: 'nonexistent' }));
    expect(result.isValid).toBe(false);
  });

  it('warns on short question', () => {
    const result = validateQuizQuality(makeQuiz({ question: '짧은?' }));
    expect(result.warnings.some((w: string) => w.includes('질문'))).toBe(true);
  });

  it('valid multiple question passes', () => {
    const result = validateQuizQuality(makeQuiz({
      type: 'multiple',
      answer: '2',
      options: ['가', '나', '다', '라'],
    }));
    expect(result.isValid).toBe(true);
  });

  it('rejects scenario_composite without case_context', () => {
    const result = validateQuizQuality(makeQuiz({
      type: 'scenario_composite',
      answer: 'test',
      case_context: null,
      sub_questions: [{ id: 's1', question: 'q', answer: 'a', type: 'fill_in' }],
    }));
    expect(result.isValid).toBe(false);
  });

  it('rejects scenario_composite without sub_questions', () => {
    const result = validateQuizQuality(makeQuiz({
      type: 'scenario_composite',
      answer: 'test',
      case_context: '사례 상황',
      sub_questions: [],
    }));
    expect(result.isValid).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = validateQuizQuality({ id: 'x' } as never);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('validateBatchQuality', () => {
  it('returns summary for batch', () => {
    const questions = [
      makeQuiz(),
      makeQuiz({ id: 'intro-002', answer: 'invalid' }),
      makeQuiz({ id: 'intro-003', explanation: '' }),
    ];
    const result = validateBatchQuality(questions);
    expect(result.total).toBe(3);
    expect(result.invalid).toBe(1);
    expect(result.warningCount).toBeGreaterThan(0);
  });

  it('empty batch returns zeros', () => {
    const result = validateBatchQuality([]);
    expect(result.total).toBe(0);
    expect(result.valid).toBe(0);
  });
});
