import { describe, it, expect } from 'vitest';
import { getScoreFeedback, getScoreStrokeClass, getScoreBarClass } from '../score-feedback';

describe('getScoreFeedback', () => {
  it('0~30% → struggling tier', () => {
    expect(getScoreFeedback(0).tier).toBe('struggling');
    expect(getScoreFeedback(15).tier).toBe('struggling');
    expect(getScoreFeedback(30).tier).toBe('struggling');
  });

  it('31~60% → developing tier', () => {
    expect(getScoreFeedback(31).tier).toBe('developing');
    expect(getScoreFeedback(45).tier).toBe('developing');
    expect(getScoreFeedback(60).tier).toBe('developing');
  });

  it('61~90% → proficient tier', () => {
    expect(getScoreFeedback(61).tier).toBe('proficient');
    expect(getScoreFeedback(75).tier).toBe('proficient');
    expect(getScoreFeedback(90).tier).toBe('proficient');
  });

  it('91~100% → mastery tier', () => {
    expect(getScoreFeedback(91).tier).toBe('mastery');
    expect(getScoreFeedback(95).tier).toBe('mastery');
    expect(getScoreFeedback(100).tier).toBe('mastery');
  });

  it('각 tier에 emoji와 message가 있다', () => {
    for (const pct of [10, 40, 70, 95]) {
      const fb = getScoreFeedback(pct);
      expect(fb.emoji).toBeTruthy();
      expect(fb.message.length).toBeGreaterThan(5);
      expect(fb.colorClass).toContain('text-');
      expect(fb.bgClass).toContain('bg-');
    }
  });

  it('경계값 정확성: 30은 struggling, 31은 developing', () => {
    expect(getScoreFeedback(30).tier).toBe('struggling');
    expect(getScoreFeedback(31).tier).toBe('developing');
  });

  it('경계값 정확성: 60은 developing, 61은 proficient', () => {
    expect(getScoreFeedback(60).tier).toBe('developing');
    expect(getScoreFeedback(61).tier).toBe('proficient');
  });

  it('경계값 정확성: 90은 proficient, 91은 mastery', () => {
    expect(getScoreFeedback(90).tier).toBe('proficient');
    expect(getScoreFeedback(91).tier).toBe('mastery');
  });
});

describe('getScoreStrokeClass', () => {
  it('구간별 올바른 stroke 클래스 반환', () => {
    expect(getScoreStrokeClass(20)).toBe('stroke-red-500');
    expect(getScoreStrokeClass(50)).toBe('stroke-amber-500');
    expect(getScoreStrokeClass(75)).toBe('stroke-emerald-500');
    expect(getScoreStrokeClass(95)).toBe('stroke-purple-500');
  });
});

describe('getScoreBarClass', () => {
  it('구간별 올바른 bar 클래스 반환', () => {
    expect(getScoreBarClass(20)).toBe('bg-red-500');
    expect(getScoreBarClass(50)).toBe('bg-amber-500');
    expect(getScoreBarClass(75)).toBe('bg-green-500');
    expect(getScoreBarClass(95)).toBe('bg-purple-500');
  });
});
