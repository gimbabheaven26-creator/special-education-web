import { describe, it, expect } from 'vitest';
import { scoreDescriptiveAnswer } from '../descriptive-scoring';

describe('scoreDescriptiveAnswer', () => {
  it('returns full coverage when all keywords are present', () => {
    const model = '기능적 행동분석(FBA)은 문제행동의 기능을 파악하는 체계적 절차이다.';
    const user = '기능적 행동분석은 문제행동의 기능을 파악하는 절차입니다.';
    const result = scoreDescriptiveAnswer(user, model);
    expect(result.coverage).toBeGreaterThanOrEqual(0.6);
    expect(result.matched.length).toBeGreaterThan(0);
  });

  it('returns zero coverage when no keywords match', () => {
    const model = '개별화교육계획(IEP)은 특수교육대상자를 위한 교육 계획이다.';
    const user = '잘 모르겠습니다.';
    const result = scoreDescriptiveAnswer(user, model);
    expect(result.coverage).toBeLessThan(0.3);
  });

  it('detects legal citations in model answer', () => {
    const model = '장애인 등에 대한 특수교육법 제15조에 따라 선정한다. 시행령 제9조 참조.';
    const user = '특수교육법 제15조에 따라 선정합니다.';
    const result = scoreDescriptiveAnswer(user, model);
    expect(result.legalCitations.expected.length).toBe(2);
    expect(result.legalCitations.found).toContain('제15조');
    expect(result.legalCitations.missing.length).toBe(1);
  });

  it('returns empty citations when model has none', () => {
    const model = '긍정적 행동지원은 예방과 교수를 중시한다.';
    const user = '긍정적 행동지원은 예방 중심입니다.';
    const result = scoreDescriptiveAnswer(user, model);
    expect(result.legalCitations.expected).toHaveLength(0);
  });

  it('handles empty model answer gracefully', () => {
    const result = scoreDescriptiveAnswer('답안', '');
    expect(result.coverage).toBe(1);
    expect(result.keywords).toHaveLength(0);
  });

  it('generates meaningful suggestion text', () => {
    const model = '차별강화(DRO)는 일정 시간 동안 문제행동이 발생하지 않을 때 강화를 제공하는 전략이다.';
    const user = '차별강화는 문제행동이 없을 때 강화하는 것입니다.';
    const result = scoreDescriptiveAnswer(user, model);
    expect(result.suggestion).toContain('핵심 키워드');
    expect(result.suggestion.length).toBeGreaterThan(10);
  });

  it('matches legal citation with 시행령 prefix', () => {
    const model = '시행령 제21조에 따른 개별화교육지원팀 구성';
    const user = '시행령 제21조의 개별화교육지원팀';
    const result = scoreDescriptiveAnswer(user, model);
    expect(result.legalCitations.found.length).toBe(1);
    expect(result.legalCitations.missing).toHaveLength(0);
  });
});
