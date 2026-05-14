import { describe, expect, it } from 'vitest';
import { normalizeOXAnswer } from '../ox-answer';

describe('normalizeOXAnswer', () => {
  it.each([
    ['O', 'O'],
    ['o', 'O'],
    [1, 'O'],
    ['1', 'O'],
    [true, 'O'],
    ['true', 'O'],
  ] as const)('%s를 O로 정규화한다', (input, expected) => {
    expect(normalizeOXAnswer(input)).toBe(expected);
  });

  it.each([
    ['X', 'X'],
    ['x', 'X'],
    [0, 'X'],
    ['0', 'X'],
    [false, 'X'],
    ['false', 'X'],
  ] as const)('%s를 X로 정규화한다', (input, expected) => {
    expect(normalizeOXAnswer(input)).toBe(expected);
  });
});
