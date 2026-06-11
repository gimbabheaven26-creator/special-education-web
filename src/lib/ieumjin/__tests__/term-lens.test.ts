import { describe, expect, it } from 'vitest';
import { getTermLensByQuery } from '../term-lens';

describe('getTermLensByQuery', () => {
  it('returns the FBA lens for the Korean term', () => {
    const lens = getTermLensByQuery('기능적 행동평가');

    expect(lens.term.label).toBe('기능적 행동평가');
    expect(lens.term.aliases).toContain('FBA');
    expect(lens.sources).toContainEqual(
      expect.objectContaining({ kind: 'nise', id: '383398' }),
    );
  });

  it('connects the FBA lens to representative KICE DNA and a 20-minute flow', () => {
    const lens = getTermLensByQuery('FBA');

    expect(lens.kiceRefs).toContainEqual(
      expect.objectContaining({ year: 2019, session: '전공A', number: 14 }),
    );
    expect(lens.examDna.representativeRef).toEqual({
      year: 2019,
      session: '전공A',
      number: 14,
    });
    expect(lens.twentyMinuteFlow).toHaveLength(5);
    expect(lens.twentyMinuteFlow.map((step) => step.minutes)).toEqual([3, 3, 3, 5, 6]);
  });

  it('falls back to the FBA lens for unknown queries during the single-lens phase', () => {
    const lens = getTermLensByQuery('아직 없는 용어');

    expect(lens.id).toBe('fba');
    expect(lens.term.label).toBe('기능적 행동평가');
  });
});
