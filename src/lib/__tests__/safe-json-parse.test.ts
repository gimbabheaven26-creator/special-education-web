import { describe, it, expect } from 'vitest';
import { safeJsonParse } from '../safe-json-parse';

describe('safeJsonParse', () => {
  it('parses valid JSON', () => {
    expect(safeJsonParse('{"a":1}', {})).toEqual({ a: 1 });
  });

  it('returns fallback on invalid JSON', () => {
    expect(safeJsonParse('{broken', { fallback: true })).toEqual({ fallback: true });
  });

  it('returns fallback on empty string', () => {
    expect(safeJsonParse('', null)).toBeNull();
  });

  it('parses arrays', () => {
    expect(safeJsonParse('[1,2,3]', [])).toEqual([1, 2, 3]);
  });

  it('returns fallback for truncated JSON', () => {
    expect(safeJsonParse('{"key": "val', {})).toEqual({});
  });
});
