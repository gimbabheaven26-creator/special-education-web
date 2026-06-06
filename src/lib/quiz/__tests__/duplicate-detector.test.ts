import { describe, it, expect } from 'vitest';
import { findDuplicates, tokenize } from '../duplicate-detector';

describe('tokenize', () => {
  it('splits Korean text into tokens', () => {
    const tokens = tokenize('특수교육은 장애 학생을 위한 교육이다');
    expect(tokens.size).toBeGreaterThan(0);
    expect(tokens.has('특수교육')).toBe(true);
  });

  it('returns empty set for empty string', () => {
    expect(tokenize('').size).toBe(0);
  });

  it('handles mixed Korean and English', () => {
    const tokens = tokenize('IEP 개별화 교육 프로그램');
    expect(tokens.has('IEP')).toBe(true);
    expect(tokens.has('개별화')).toBe(true);
  });
});

describe('findDuplicates', () => {
  it('detects highly similar questions', () => {
    const questions = [
      { id: 'q1', question: '특수교육 대상자 선정 기준에 대해 설명하시오.' },
      { id: 'q2', question: '특수교육 대상자의 선정 기준에 대해 설명하시오.' },
    ];
    const pairs = findDuplicates(questions, 0.85);
    expect(pairs.length).toBe(1);
    expect(pairs[0].similarity).toBeGreaterThanOrEqual(0.85);
  });

  it('does not flag different questions', () => {
    const questions = [
      { id: 'q1', question: '시각장애 학생의 보행 훈련 방법을 설명하시오.' },
      { id: 'q2', question: '청각장애 학생의 구화법 지도 원리를 서술하시오.' },
    ];
    const pairs = findDuplicates(questions, 0.85);
    expect(pairs).toHaveLength(0);
  });

  it('returns empty for single question', () => {
    const pairs = findDuplicates([{ id: 'q1', question: '질문' }]);
    expect(pairs).toHaveLength(0);
  });

  it('returns empty for empty array', () => {
    expect(findDuplicates([])).toHaveLength(0);
  });

  it('handles exact duplicates', () => {
    const q = '통합교육의 정의와 필요성에 대해 서술하시오.';
    const pairs = findDuplicates([
      { id: 'q1', question: q },
      { id: 'q2', question: q },
    ]);
    expect(pairs.length).toBe(1);
    expect(pairs[0].similarity).toBe(1);
  });

  it('respects custom threshold', () => {
    const questions = [
      { id: 'q1', question: '장애인 등에 대한 특수교육법의 주요 내용을 설명하시오.' },
      { id: 'q2', question: '장애인 등에 대한 특수교육법의 핵심 내용을 서술하시오.' },
    ];
    const strict = findDuplicates(questions, 0.95);
    const loose = findDuplicates(questions, 0.5);
    expect(loose.length).toBeGreaterThanOrEqual(strict.length);
  });
});
