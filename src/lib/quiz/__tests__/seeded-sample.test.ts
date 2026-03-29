import { describe, it, expect } from 'vitest';
import { seededRandom, seededSample, selectWithWrongPriority } from '@/lib/quiz/seeded-sample';
import type { DailyQuestion } from '@/types/daily';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeDailyQ(id: string, chapter: string): DailyQuestion {
  return {
    id,
    type: 'ox',
    question: `question-${id}`,
    answer: 'O',
    chapter,
    subject: 'introduction',
  };
}

// ─── seededRandom ─────────────────────────────────────────────────────────────

describe('seededRandom', () => {
  it('같은 seed+index → 같은 값 (결정론적)', () => {
    const a = seededRandom(42, 0);
    const b = seededRandom(42, 0);
    expect(a).toBe(b);
  });

  it('여러 번 호출해도 같은 seed+index는 동일한 값을 반환한다', () => {
    const results = Array.from({ length: 10 }, () => seededRandom(123, 7));
    const allSame = results.every((v) => v === results[0]);
    expect(allSame).toBe(true);
  });

  it('다른 seed → 다른 값', () => {
    const a = seededRandom(42, 0);
    const b = seededRandom(99, 0);
    expect(a).not.toBe(b);
  });

  it('다른 index → 다른 값', () => {
    const a = seededRandom(42, 0);
    const b = seededRandom(42, 1);
    expect(a).not.toBe(b);
  });

  it('0 이상 1 이하 범위의 값을 반환한다', () => {
    for (let i = 0; i < 200; i++) {
      const val = seededRandom(i, i * 7);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(1);
    }
  });

  it('seed 0도 유효하다', () => {
    const val = seededRandom(0, 0);
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThanOrEqual(1);
  });

  it('음수 seed도 유효한 범위를 반환한다', () => {
    const val = seededRandom(-1, 0);
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThanOrEqual(1);
  });

  it('큰 seed 값에서도 범위를 벗어나지 않는다', () => {
    const val = seededRandom(999999999, 999999);
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThanOrEqual(1);
  });

  it('연속된 index들이 균일하게 분포한다 (간단 확인)', () => {
    const values = Array.from({ length: 1000 }, (_, i) => seededRandom(42, i));
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    // 평균이 0.3~0.7 범위에 있으면 최소한의 균일성 충족
    expect(avg).toBeGreaterThan(0.3);
    expect(avg).toBeLessThan(0.7);
  });
});

// ─── seededSample ─────────────────────────────────────────────────────────────

describe('seededSample', () => {
  it('빈 배열 → 빈 배열', () => {
    expect(seededSample([], 5, 42)).toEqual([]);
  });

  it('n=0 → 빈 배열', () => {
    expect(seededSample([1, 2, 3], 0, 42)).toEqual([]);
  });

  it('요청한 개수(n)만큼 반환한다', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(seededSample(arr, 3, 42)).toHaveLength(3);
    expect(seededSample(arr, 7, 42)).toHaveLength(7);
    expect(seededSample(arr, 1, 42)).toHaveLength(1);
  });

  it('n이 배열 길이보다 크면 전체 반환 (길이 초과 안전)', () => {
    const arr = [1, 2, 3];
    const result = seededSample(arr, 10, 42);
    expect(result).toHaveLength(3);
    expect(result.sort()).toEqual([1, 2, 3]);
  });

  it('n이 배열 길이와 같으면 모든 요소를 반환한다', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = seededSample(arr, 5, 42);
    expect(result).toHaveLength(5);
    expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('같은 seed → 같은 결과 (결정론적)', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const a = seededSample(arr, 3, 42);
    const b = seededSample(arr, 3, 42);
    expect(a).toEqual(b);
  });

  it('다른 seed → 다른 결과 (높은 확률)', () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const a = seededSample(arr, 5, 42);
    const b = seededSample(arr, 5, 9999);
    // 100개에서 5개를 뽑으므로 같은 결과일 확률은 극히 낮다
    expect(a).not.toEqual(b);
  });

  it('원본 배열을 변경하지 않는다 (불변성)', () => {
    const arr = [1, 2, 3, 4, 5];
    const original = [...arr];
    seededSample(arr, 3, 42);
    expect(arr).toEqual(original);
  });

  it('반환값은 원본의 부분 집합이다', () => {
    const arr = ['a', 'b', 'c', 'd', 'e'];
    const result = seededSample(arr, 3, 42);
    for (const item of result) {
      expect(arr).toContain(item);
    }
  });

  it('반환값에 중복이 없다', () => {
    const arr = Array.from({ length: 20 }, (_, i) => i);
    const result = seededSample(arr, 10, 42);
    const unique = new Set(result);
    expect(unique.size).toBe(result.length);
  });

  it('단일 요소 배열에서 n=1이면 해당 요소를 반환한다', () => {
    expect(seededSample([42], 1, 0)).toEqual([42]);
  });

  it('제네릭 타입을 올바르게 보존한다 (객체 배열)', () => {
    const arr = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];
    const result = seededSample(arr, 2, 42);
    expect(result).toHaveLength(2);
    for (const item of result) {
      expect(item).toHaveProperty('name');
      expect(arr).toContainEqual(item);
    }
  });
});

// ─── selectWithWrongPriority ──────────────────────────────────────────────────

describe('selectWithWrongPriority', () => {
  it('빈 풀 → 빈 배열', () => {
    expect(selectWithWrongPriority([], ['ch1'], 5, 42)).toEqual([]);
  });

  it('wrongChapters가 비어있으면 전체 풀에서 랜덤 선택', () => {
    const pool = [makeDailyQ('1', 'ch1'), makeDailyQ('2', 'ch2'), makeDailyQ('3', 'ch3')];
    const result = selectWithWrongPriority(pool, [], 2, 42);
    expect(result).toHaveLength(2);
    // rest에서 뽑으므로 pool의 부분 집합
    for (const q of result) {
      expect(pool.map((p) => p.id)).toContain(q.id);
    }
  });

  it('틀린 챕터 문제를 우선 선택한다', () => {
    const pool = [
      makeDailyQ('1', 'ch1'),
      makeDailyQ('2', 'ch1'),
      makeDailyQ('3', 'ch2'),
      makeDailyQ('4', 'ch2'),
      makeDailyQ('5', 'ch3'),
    ];
    const result = selectWithWrongPriority(pool, ['ch1'], 2, 42);
    // wrongFirst에 ch1이 2개, n=2이므로 전부 ch1에서 나와야 한다
    expect(result.every((q) => q.chapter === 'ch1')).toBe(true);
  });

  it('틀린 챕터가 충분하면 나머지에서 뽑지 않는다', () => {
    const pool = [
      makeDailyQ('1', 'ch1'),
      makeDailyQ('2', 'ch1'),
      makeDailyQ('3', 'ch1'),
      makeDailyQ('4', 'ch2'),
      makeDailyQ('5', 'ch3'),
    ];
    const result = selectWithWrongPriority(pool, ['ch1'], 2, 42);
    expect(result).toHaveLength(2);
    expect(result.every((q) => q.chapter === 'ch1')).toBe(true);
  });

  it('틀린 챕터가 부족하면 나머지에서 채운다', () => {
    const pool = [
      makeDailyQ('1', 'ch1'),
      makeDailyQ('2', 'ch2'),
      makeDailyQ('3', 'ch3'),
    ];
    const result = selectWithWrongPriority(pool, ['ch1'], 3, 42);
    expect(result).toHaveLength(3);
    // ch1이 반드시 포함되어야 함
    expect(result.some((q) => q.chapter === 'ch1')).toBe(true);
    // 나머지 2개는 ch2, ch3에서
    const nonWrong = result.filter((q) => q.chapter !== 'ch1');
    expect(nonWrong).toHaveLength(2);
  });

  it('여러 틀린 챕터에서 우선 선택한다', () => {
    const pool = [
      makeDailyQ('1', 'ch1'),
      makeDailyQ('2', 'ch2'),
      makeDailyQ('3', 'ch3'),
      makeDailyQ('4', 'ch4'),
      makeDailyQ('5', 'ch5'),
    ];
    const result = selectWithWrongPriority(pool, ['ch1', 'ch2'], 2, 42);
    expect(result).toHaveLength(2);
    expect(result.every((q) => ['ch1', 'ch2'].includes(q.chapter))).toBe(true);
  });

  it('n보다 풀이 작으면 풀 크기만큼 반환', () => {
    const pool = [makeDailyQ('1', 'ch1'), makeDailyQ('2', 'ch2')];
    const result = selectWithWrongPriority(pool, ['ch1', 'ch2'], 10, 42);
    expect(result.length).toBeLessThanOrEqual(2);
  });

  it('같은 seed → 같은 결과 (결정론적)', () => {
    const pool = Array.from({ length: 20 }, (_, i) => makeDailyQ(`${i}`, `ch${i % 3}`));
    const a = selectWithWrongPriority(pool, ['ch0'], 5, 42);
    const b = selectWithWrongPriority(pool, ['ch0'], 5, 42);
    expect(a.map((q) => q.id)).toEqual(b.map((q) => q.id));
  });

  it('다른 seed → 다른 결과 (높은 확률)', () => {
    const pool = Array.from({ length: 50 }, (_, i) => makeDailyQ(`${i}`, `ch${i % 5}`));
    const a = selectWithWrongPriority(pool, ['ch0'], 5, 42);
    const b = selectWithWrongPriority(pool, ['ch0'], 5, 9999);
    expect(a.map((q) => q.id)).not.toEqual(b.map((q) => q.id));
  });

  it('풀에 틀린 챕터 문제가 하나도 없으면 rest에서 전부 뽑는다', () => {
    const pool = [
      makeDailyQ('1', 'ch2'),
      makeDailyQ('2', 'ch3'),
      makeDailyQ('3', 'ch4'),
    ];
    const result = selectWithWrongPriority(pool, ['ch999'], 2, 42);
    expect(result).toHaveLength(2);
    // 모두 rest에서 나와야 함 (ch999에 해당하는 문제 없음)
    expect(result.every((q) => q.chapter !== 'ch999')).toBe(true);
  });

  it('원본 pool을 변경하지 않는다', () => {
    const pool = [
      makeDailyQ('1', 'ch1'),
      makeDailyQ('2', 'ch2'),
      makeDailyQ('3', 'ch3'),
    ];
    const originalIds = pool.map((q) => q.id);
    selectWithWrongPriority(pool, ['ch1'], 2, 42);
    expect(pool.map((q) => q.id)).toEqual(originalIds);
  });

  it('n=0이면 빈 배열을 반환한다', () => {
    const pool = [makeDailyQ('1', 'ch1'), makeDailyQ('2', 'ch2')];
    const result = selectWithWrongPriority(pool, ['ch1'], 0, 42);
    expect(result).toEqual([]);
  });
});
