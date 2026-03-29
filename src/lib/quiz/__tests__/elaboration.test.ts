import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  extractKeywords,
  evaluateElaboration,
  shouldTriggerElaboration,
} from '../elaboration';

describe('elaboration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // ─── extractKeywords ───

  describe('extractKeywords', () => {
    it('extracts meaningful keywords from Korean text', () => {
      const kws = extractKeywords('개별화교육계획은 학생의 강점을 중심으로 수립한다');
      expect(kws.length).toBeGreaterThan(0);
      expect(kws).toContain('개별화교육계획은');
    });

    it('returns at most 5 keywords', () => {
      const longText = '특수교육 개별화교육계획 자폐성장애 지적장애 학습장애 청각장애 시각장애 의사소통장애 정서행동장애 통합교육 전환교육';
      const kws = extractKeywords(longText);
      expect(kws.length).toBeLessThanOrEqual(5);
    });

    it('removes stopwords', () => {
      const kws = extractKeywords('이것은 정답이다 하는 것이다');
      // All tokens are stopwords or too short
      expect(kws.every(kw => !['이', '그', '것', '정답', '하다', '이다'].includes(kw))).toBe(true);
    });

    it('removes markdown bold syntax', () => {
      const kws = extractKeywords('**개별화교육계획**은 중요하다');
      const joined = kws.join(' ');
      expect(joined).not.toContain('**');
    });

    it('removes special characters and punctuation', () => {
      const kws = extractKeywords('장애인(시각장애)의 교육: 특수교육공학!');
      kws.forEach(kw => {
        expect(kw).not.toMatch(/[()[\]:!]/);
      });
    });

    it('removes standalone numbers', () => {
      const kws = extractKeywords('학생 100명이 참여한 프로그램');
      expect(kws).not.toContain('100');
    });

    it('returns empty array for empty input', () => {
      expect(extractKeywords('')).toEqual([]);
    });

    it('returns empty for stopwords-only input', () => {
      expect(extractKeywords('이 그 저 것 수')).toEqual([]);
    });

    it('prioritizes longer keywords (more specific)', () => {
      const kws = extractKeywords('개별화교육계획 수립 학생');
      if (kws.length >= 2) {
        // First keyword should be longest
        expect(kws[0].length).toBeGreaterThanOrEqual(kws[kws.length - 1].length);
      }
    });

    it('deduplicates repeated keywords', () => {
      const kws = extractKeywords('개별화교육계획 개별화교육계획 개별화교육계획');
      const unique = new Set(kws);
      expect(unique.size).toBe(kws.length);
    });

    it('preserves law article references (제N조)', () => {
      const kws = extractKeywords('제15조에 따라 지원한다');
      expect(kws).toContain('제15조');
    });
  });

  // ─── evaluateElaboration ───

  describe('evaluateElaboration', () => {
    it('excellent: user covers 80%+ keywords', () => {
      const explanation = '개별화교육계획 학생 강점 수립';
      const keywords = extractKeywords(explanation);
      // Respond with all keywords
      const response = keywords.join(' ');
      const result = evaluateElaboration(response, explanation);
      expect(result.level).toBe('excellent');
      expect(result.score).toBeGreaterThanOrEqual(0.8);
    });

    it('insufficient: user response has no keywords', () => {
      const explanation = '개별화교육계획 학생 강점 중심 수립';
      const result = evaluateElaboration('모르겠어요', explanation);
      expect(result.level).toBe('insufficient');
      expect(result.score).toBeLessThan(0.3);
    });

    it('auto-pass when explanation has no extractable keywords', () => {
      const result = evaluateElaboration('아무 말', '');
      expect(result.level).toBe('excellent');
      expect(result.score).toBe(1);
      expect(result.feedback).toContain('자동 통과');
    });

    it('case-insensitive matching', () => {
      const explanation = 'ABC keyword test';
      const result = evaluateElaboration('abc keyword test', explanation);
      expect(result.matched.length).toBeGreaterThan(0);
    });

    it('whitespace-insensitive matching', () => {
      const explanation = '개별화 교육 계획을 수립한다';
      // The response has the keywords without spaces
      const kws = extractKeywords(explanation);
      const response = kws.map(k => k.replace(/\s/g, '')).join(' ');
      const result = evaluateElaboration(response, explanation);
      expect(result.matched.length).toBeGreaterThan(0);
    });

    it('returns correct structure', () => {
      const result = evaluateElaboration('테스트 응답', '개별화교육계획 수립');
      expect(result).toHaveProperty('keywords');
      expect(result).toHaveProperty('matched');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('level');
      expect(result).toHaveProperty('feedback');
      expect(typeof result.score).toBe('number');
      expect(['excellent', 'good', 'partial', 'insufficient']).toContain(result.level);
    });

    it('good: user covers 60-79% keywords', () => {
      // Create explanation with exactly 5 extractable keywords
      const explanation = '개별화교육계획 자폐성장애 지적장애 학습장애 통합교육';
      const keywords = extractKeywords(explanation);
      // Cover 3 out of 5 = 60%
      if (keywords.length >= 5) {
        const response = keywords.slice(0, 3).join(' ');
        const result = evaluateElaboration(response, explanation);
        expect(['good', 'partial']).toContain(result.level);
      }
    });
  });

  // ─── shouldTriggerElaboration ───

  describe('shouldTriggerElaboration', () => {
    it('never triggers for incorrect answers', () => {
      for (let i = 0; i < 100; i++) {
        expect(shouldTriggerElaboration(false, 3)).toBe(false);
      }
    });

    it('returns boolean', () => {
      const result = shouldTriggerElaboration(true, 1);
      expect(typeof result).toBe('boolean');
    });

    it('respects probability (statistical, 1000 runs)', () => {
      let triggerCount = 0;
      const runs = 1000;
      for (let i = 0; i < runs; i++) {
        if (shouldTriggerElaboration(true, 1)) {
          triggerCount++;
        }
      }
      // Base probability 15% — with 1000 runs, should be within 5-30%
      const ratio = triggerCount / runs;
      expect(ratio).toBeGreaterThan(0.05);
      expect(ratio).toBeLessThan(0.35);
    });

    it('higher difficulty increases trigger chance', () => {
      let lowDiffCount = 0;
      let highDiffCount = 0;
      const runs = 5000;
      for (let i = 0; i < runs; i++) {
        if (shouldTriggerElaboration(true, 1)) lowDiffCount++;
        if (shouldTriggerElaboration(true, 3)) highDiffCount++;
      }
      // difficulty 3 adds 10% more probability
      expect(highDiffCount).toBeGreaterThan(lowDiffCount);
    });
  });
});
