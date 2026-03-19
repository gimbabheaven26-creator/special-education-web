import { makeSheetCode, getKSTDateRaw } from '../sheet-code';

describe('makeSheetCode', () => {
  it('YYYY-MM-DD를 DAY-MMDD 형식으로 변환한다', () => {
    expect(makeSheetCode('2026-03-19')).toBe('DAY-0319');
    expect(makeSheetCode('2026-11-01')).toBe('DAY-1101');
    expect(makeSheetCode('2026-01-09')).toBe('DAY-0109');
  });
});

describe('getKSTDateRaw', () => {
  it('YYYY-MM-DD 형식을 반환한다', () => {
    expect(getKSTDateRaw()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
