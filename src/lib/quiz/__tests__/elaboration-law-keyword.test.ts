import { describe, it, expect } from 'vitest';
import { extractKeywords } from '../elaboration';

describe('extractKeywords — 법령 키워드 보존 (T-09)', () => {
  it('제15조가 키워드에 포함된다', () => {
    const kws = extractKeywords('장애인 등에 대한 특수교육법 제15조에 따라 지원한다');
    expect(kws).toContain('제15조');
  });

  it('제3항이 키워드에 포함된다', () => {
    const kws = extractKeywords('동법 제3항에 의거하여 개별화교육계획을 수립한다');
    expect(kws).toContain('제3항');
  });

  it('제2호가 키워드에 포함된다', () => {
    const kws = extractKeywords('시행령 제2호 규정에 따라 지원 대상을 결정한다');
    expect(kws).toContain('제2호');
  });

  it('법령 키워드와 일반 숫자가 섞여도 법령만 보존한다', () => {
    const kws = extractKeywords('제15조 제3항에 따라 2명의 보조인력을 배치한다');
    expect(kws).toContain('제15조');
    expect(kws).toContain('제3항');
    // 독립 숫자 "2"는 포함되지 않아야 함 (길이 1이므로 MIN_KEYWORD_LENGTH 미달)
  });

  it('숫자만 있는 경우 독립 숫자는 제거된다', () => {
    const kws = extractKeywords('개별화교육 100점 기준으로 평가한다');
    expect(kws).not.toContain('100');
  });

  it('법령 키워드가 없으면 기존과 동일하게 동작한다', () => {
    const kws = extractKeywords('개별화교육계획은 학생의 강점을 중심으로 수립한다');
    expect(kws.length).toBeGreaterThan(0);
    expect(kws.some((k) => /\d/.test(k))).toBe(false);
  });
});
