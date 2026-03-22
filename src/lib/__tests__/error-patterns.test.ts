import { describe, it, expect } from 'vitest';
import { detectErrorPatterns } from '../error-patterns';
import type { QuizResult } from '@/types/quiz';
import type { WrongNote } from '@/types/study';

function makeNote(overrides: Partial<WrongNote> = {}): WrongNote {
  return {
    questionId: 'q1',
    subject: 'sub1',
    userAnswer: 2,
    attempts: 1,
    lastAttempt: Date.now(),
    mastered: false,
    ...overrides,
  };
}

function makeResult(overrides: Partial<QuizResult> = {}): QuizResult {
  return {
    questionId: 'q1',
    userAnswer: 1,
    isCorrect: true,
    timestamp: Date.now(),
    subject: 'sub1',
    chapter: 'ch1',
    ...overrides,
  };
}

describe('detectErrorPatterns', () => {
  it('returns empty array for a fresh wrong note with no history', () => {
    const patterns = detectErrorPatterns(makeNote(), []);
    expect(patterns).toEqual([]);
  });

  it('detects confusion when attempts >= 3', () => {
    const note = makeNote({ attempts: 3 });
    const patterns = detectErrorPatterns(note, []);
    expect(patterns).toContain('confusion');
  });

  it('does not detect confusion if mastered', () => {
    const note = makeNote({ attempts: 3, mastered: true });
    const patterns = detectErrorPatterns(note, []);
    expect(patterns).not.toContain('confusion');
  });

  it('detects careless when previously correct but last result is wrong', () => {
    const history: QuizResult[] = [
      makeResult({ isCorrect: true, timestamp: 1 }),
      makeResult({ isCorrect: false, timestamp: 2 }),
    ];
    const patterns = detectErrorPatterns(makeNote(), history);
    expect(patterns).toContain('careless');
  });

  it('detects conceptual_gap when chapter accuracy < 50% with 3+ results', () => {
    const history: QuizResult[] = [
      makeResult({ questionId: 'q1', isCorrect: false }),
      makeResult({ questionId: 'q2', isCorrect: false }),
      makeResult({ questionId: 'q3', isCorrect: false }),
    ];
    const patterns = detectErrorPatterns(makeNote(), history);
    expect(patterns).toContain('conceptual_gap');
  });

  it('detects lucky_correct when a correct answer had unsure confidence', () => {
    const history: QuizResult[] = [
      makeResult({ isCorrect: true, confidence: 'unsure' }),
    ];
    const patterns = detectErrorPatterns(makeNote(), history);
    expect(patterns).toContain('lucky_correct');
  });

  it('does not detect lucky_correct for sure confidence', () => {
    const history: QuizResult[] = [
      makeResult({ isCorrect: true, confidence: 'sure' }),
    ];
    const patterns = detectErrorPatterns(makeNote(), history);
    expect(patterns).not.toContain('lucky_correct');
  });

  it('does not detect lucky_correct for unsure but incorrect', () => {
    const history: QuizResult[] = [
      makeResult({ isCorrect: false, confidence: 'unsure' }),
    ];
    const patterns = detectErrorPatterns(makeNote(), history);
    expect(patterns).not.toContain('lucky_correct');
  });

  it('does not detect lucky_correct when confidence is undefined (old data)', () => {
    const history: QuizResult[] = [
      makeResult({ isCorrect: true }),
    ];
    const patterns = detectErrorPatterns(makeNote(), history);
    expect(patterns).not.toContain('lucky_correct');
  });
});
