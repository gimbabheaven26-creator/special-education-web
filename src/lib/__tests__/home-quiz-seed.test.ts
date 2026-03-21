import { describe, it, expect } from 'vitest';

/** dateSeed: 날짜 문자열 → 숫자 seed */
function dateSeed(dateStr: string): number {
  return dateStr.split('-').reduce((acc, part) => acc * 100 + Number(part), 0);
}

/** seed 기반 offset 계산 — 타입별 bucket size 내에서 순환 */
function seededOffset(seed: number, multiplier: number, addend: number, bucketSize: number): number {
  return (seed * multiplier + addend) % bucketSize;
}

describe('dateSeed', () => {
  it('같은 날짜는 항상 같은 seed를 반환한다', () => {
    expect(dateSeed('2026-03-22')).toBe(dateSeed('2026-03-22'));
  });

  it('다른 날짜는 다른 seed를 반환한다', () => {
    expect(dateSeed('2026-03-22')).not.toBe(dateSeed('2026-03-23'));
  });

  it('유효한 양수를 반환한다', () => {
    expect(dateSeed('2026-03-22')).toBeGreaterThan(0);
  });

  it('2026-03-22 seed 값이 올바르게 계산된다', () => {
    // ((2026 * 100 + 3) * 100 + 22) = 20260322
    expect(dateSeed('2026-03-22')).toBe(20260322);
  });
});

describe('seededOffset', () => {
  it('bucketSize 내에 항상 수렴한다', () => {
    const seed = dateSeed('2026-03-22');
    expect(seededOffset(seed, 1, 0, 200)).toBeLessThan(200);
    expect(seededOffset(seed, 7, 31, 100)).toBeLessThan(100);
    expect(seededOffset(seed, 13, 17, 50)).toBeLessThan(50);
  });

  it('같은 날짜/파라미터면 항상 같은 offset 반환', () => {
    const seed = dateSeed('2026-03-22');
    const offset1 = seededOffset(seed, 1, 0, 200);
    const offset2 = seededOffset(seed, 1, 0, 200);
    expect(offset1).toBe(offset2);
  });

  it('OX/fill_in/descriptive offset이 서로 다르다', () => {
    const seed = dateSeed('2026-03-22');
    const oxOff = seededOffset(seed, 1, 0, 200);
    const fillOff = seededOffset(seed, 7, 31, 100);
    const descOff = seededOffset(seed, 13, 17, 50);
    // 3개가 전부 같을 가능성은 극히 낮음
    const allSame = oxOff === fillOff && fillOff === descOff;
    expect(allSame).toBe(false);
  });

  it('날짜가 바뀌면 offset도 바뀐다', () => {
    const seed1 = dateSeed('2026-03-22');
    const seed2 = dateSeed('2026-03-23');
    const offset1 = seededOffset(seed1, 1, 0, 200);
    const offset2 = seededOffset(seed2, 1, 0, 200);
    expect(offset1).not.toBe(offset2);
  });
});
