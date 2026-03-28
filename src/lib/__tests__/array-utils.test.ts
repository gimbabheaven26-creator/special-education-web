import { describe, it, expect } from 'vitest';
import { shuffle, dateSeed, seededShuffle } from '@/lib/array-utils';

// ─── shuffle ──────────────────────────────────────────────────────────────────

describe('shuffle', () => {
  it('빈 배열 → 빈 배열', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('단일 요소 배열 → 동일 반환', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it('원본 배열을 변경하지 않는다 (immutability)', () => {
    const arr = [1, 2, 3, 4, 5] as const;
    const original = [...arr];
    shuffle(arr);
    expect([...arr]).toEqual(original);
  });

  it('동일한 요소들이 포함된다 (길이 + 요소 일치)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = shuffle(arr);
    expect(result).toHaveLength(arr.length);
    expect(result.sort((a, b) => a - b)).toEqual([...arr].sort((a, b) => a - b));
  });

  it('충분히 큰 배열은 순서가 변한다 (확률적)', () => {
    const arr = Array.from({ length: 50 }, (_, i) => i);
    // 50개 요소를 셔플하면 원래 순서와 같을 확률은 거의 0
    const result = shuffle(arr);
    // 하나라도 다른 위치에 있으면 OK
    const samePosition = result.filter((v, i) => v === arr[i]).length;
    expect(samePosition).toBeLessThan(arr.length);
  });

  it('readonly 배열을 받을 수 있다', () => {
    const arr: readonly number[] = [1, 2, 3];
    const result = shuffle(arr);
    expect(result).toHaveLength(3);
  });
});

// ─── dateSeed ─────────────────────────────────────────────────────────────────

describe('dateSeed', () => {
  it('같은 문자열 → 같은 시드', () => {
    expect(dateSeed('2026-03-29')).toBe(dateSeed('2026-03-29'));
  });

  it('다른 문자열 → 다른 시드', () => {
    expect(dateSeed('2026-03-29')).not.toBe(dateSeed('2026-03-30'));
  });

  it('빈 문자열 → 0', () => {
    expect(dateSeed('')).toBe(0);
  });

  it('단일 문자 → charCodeAt 값', () => {
    expect(dateSeed('A')).toBe(65);
  });

  it('숫자를 반환한다', () => {
    expect(typeof dateSeed('2026-01-01')).toBe('number');
  });

  it('항상 양수를 반환한다 (ASCII 문자 기준)', () => {
    expect(dateSeed('2026-03-29')).toBeGreaterThan(0);
  });
});

// ─── seededShuffle ────────────────────────────────────────────────────────────

describe('seededShuffle', () => {
  it('빈 배열 → 빈 배열', () => {
    expect(seededShuffle([], 42)).toEqual([]);
  });

  it('단일 요소 배열 → 동일 반환', () => {
    expect(seededShuffle([99], 42)).toEqual([99]);
  });

  it('같은 seed → 같은 결과', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = seededShuffle([...arr], 42);
    const b = seededShuffle([...arr], 42);
    expect(a).toEqual(b);
  });

  it('다른 seed → 다른 결과 (높은 확률)', () => {
    const arr = Array.from({ length: 50 }, (_, i) => i);
    const a = seededShuffle([...arr], 42);
    const b = seededShuffle([...arr], 9999);
    expect(a).not.toEqual(b);
  });

  it('원본 배열을 변경하지 않는다', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    seededShuffle(arr, 42);
    expect(arr).toEqual(original);
  });

  it('동일한 요소들이 포함된다', () => {
    const arr = [10, 20, 30, 40, 50];
    const result = seededShuffle(arr, 42);
    expect(result).toHaveLength(arr.length);
    expect(result.sort((a, b) => a - b)).toEqual([...arr].sort((a, b) => a - b));
  });

  it('seed 0도 유효하다', () => {
    const arr = [1, 2, 3];
    const result = seededShuffle(arr, 0);
    expect(result).toHaveLength(3);
    expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3]);
  });

  it('큰 seed 값도 처리한다', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = seededShuffle(arr, Number.MAX_SAFE_INTEGER);
    expect(result).toHaveLength(5);
    expect(result.sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5]);
  });
});
