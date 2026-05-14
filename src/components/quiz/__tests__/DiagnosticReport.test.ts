/**
 * DiagnosticReport 로직 테스트.
 *
 * JSX 렌더링 대신 진단 리포트 데이터 계산 로직(diagnostic-utils.ts) 검증.
 * - 레이더 데이터 포인트 수
 * - 취약 챕터 정렬 (정답률 오름차순)
 * - 추천 링크 경로 정확성
 * - 엣지: 전체 정답, 빈 결과
 */
import { describe, it, expect } from 'vitest';
import {
  buildRadarData,
  buildWeakChapters,
  buildRecommendations,
  buildNextActionSummary,
} from '../diagnostic-utils';
import type { QuizResult } from '@/types/quiz';

function makeResult(
  questionId: string,
  subject: string,
  chapter: string,
  isCorrect: boolean,
): QuizResult {
  return {
    questionId,
    userAnswer: isCorrect ? 'correct' : 'wrong',
    isCorrect,
    timestamp: Date.now(),
    subject,
    chapter,
  };
}

const subjectMap: Record<string, string> = {
  'visual-impairment': '시각장애',
  'hearing-impairment': '청각장애',
  'intellectual-disability': '지적장애',
  'autism': '자폐성장애',
  'learning-disability': '학습장애',
};

describe('DiagnosticReport 로직', () => {
  describe('buildRadarData', () => {
    it('과목별 정답률 데이터를 생성한다', () => {
      const results: QuizResult[] = [
        makeResult('q1', 'visual-impairment', 'ch1', true),
        makeResult('q2', 'visual-impairment', 'ch1', true),
        makeResult('q3', 'hearing-impairment', 'ch2', false),
        makeResult('q4', 'hearing-impairment', 'ch2', true),
      ];

      const data = buildRadarData(results, subjectMap);
      expect(data).toHaveLength(2);

      const visual = data.find((d) => d.label === '시각장애');
      expect(visual?.value).toBe(100); // 2/2

      const hearing = data.find((d) => d.label === '청각장애');
      expect(hearing?.value).toBe(50); // 1/2
    });

    it('subjectMap에 없는 과목은 slug를 그대로 사용한다', () => {
      const results: QuizResult[] = [
        makeResult('q1', 'unknown-subject', 'ch1', true),
      ];
      const data = buildRadarData(results, subjectMap);
      expect(data[0].label).toBe('unknown-subject');
    });

    it('빈 결과이면 빈 배열을 반환한다', () => {
      const data = buildRadarData([], subjectMap);
      expect(data).toHaveLength(0);
    });
  });

  describe('buildWeakChapters', () => {
    it('챕터별 정답률 오름차순으로 정렬한다', () => {
      const results: QuizResult[] = [
        // ch1: 100%
        makeResult('q1', 'visual-impairment', 'ch1', true),
        makeResult('q2', 'visual-impairment', 'ch1', true),
        // ch2: 0%
        makeResult('q3', 'hearing-impairment', 'ch2', false),
        makeResult('q4', 'hearing-impairment', 'ch2', false),
        // ch3: 50%
        makeResult('q5', 'autism', 'ch3', true),
        makeResult('q6', 'autism', 'ch3', false),
      ];

      const weak = buildWeakChapters(results, 5);
      expect(weak[0].chapter).toBe('ch2'); // 0% → 가장 약함
      expect(weak[1].chapter).toBe('ch3'); // 50%
      expect(weak[2].chapter).toBe('ch1'); // 100%
    });

    it('TOP N개만 반환한다', () => {
      const results: QuizResult[] = [
        makeResult('q1', 'visual-impairment', 'ch1', true),
        makeResult('q2', 'hearing-impairment', 'ch2', false),
        makeResult('q3', 'autism', 'ch3', false),
        makeResult('q4', 'learning-disability', 'ch4', false),
        makeResult('q5', 'intellectual-disability', 'ch5', false),
        makeResult('q6', 'visual-impairment', 'ch6', true),
      ];

      const weak = buildWeakChapters(results, 3);
      expect(weak).toHaveLength(3);
    });

    it('각 항목에 마스터리 레벨 정보가 포함된다', () => {
      const results: QuizResult[] = [
        makeResult('q1', 'visual-impairment', 'ch1', true),
        makeResult('q2', 'visual-impairment', 'ch1', true),
        makeResult('q3', 'visual-impairment', 'ch1', true),
      ];

      const weak = buildWeakChapters(results, 5);
      expect(weak[0]).toHaveProperty('masteryEmoji');
      expect(weak[0]).toHaveProperty('masteryLabel');
    });

    it('빈 결과이면 빈 배열을 반환한다', () => {
      const weak = buildWeakChapters([], 5);
      expect(weak).toHaveLength(0);
    });

    it('전체 정답일 때도 올바르게 동작한다', () => {
      const results: QuizResult[] = [
        makeResult('q1', 'visual-impairment', 'ch1', true),
        makeResult('q2', 'hearing-impairment', 'ch2', true),
      ];

      const weak = buildWeakChapters(results, 5);
      expect(weak).toHaveLength(2);
      // 둘 다 100%
      expect(weak[0].rate).toBe(100);
      expect(weak[1].rate).toBe(100);
    });
  });

  describe('buildRecommendations', () => {
    it('취약 과목에 대한 개념학습 링크를 생성한다', () => {
      const results: QuizResult[] = [
        makeResult('q1', 'visual-impairment', 'ch1', false),
        makeResult('q2', 'hearing-impairment', 'ch2', true),
      ];

      const recs = buildRecommendations(results, subjectMap);
      expect(recs.length).toBeGreaterThan(0);

      for (const rec of recs) {
        expect(rec).toHaveProperty('subject');
        expect(rec).toHaveProperty('label');
        expect(rec).toHaveProperty('url');
        expect(rec.url).toMatch(/^\/concepts\//);
      }
    });

    it('정답률이 낮은 과목을 먼저 추천한다', () => {
      const results: QuizResult[] = [
        // visual: 0%
        makeResult('q1', 'visual-impairment', 'ch1', false),
        makeResult('q2', 'visual-impairment', 'ch1', false),
        // hearing: 50%
        makeResult('q3', 'hearing-impairment', 'ch2', true),
        makeResult('q4', 'hearing-impairment', 'ch2', false),
        // autism: 100%
        makeResult('q5', 'autism', 'ch3', true),
        makeResult('q6', 'autism', 'ch3', true),
      ];

      const recs = buildRecommendations(results, subjectMap);
      expect(recs[0].subject).toBe('visual-impairment');
    });

    it('빈 결과이면 빈 배열을 반환한다', () => {
      const recs = buildRecommendations([], subjectMap);
      expect(recs).toHaveLength(0);
    });
  });

  describe('buildNextActionSummary', () => {
    it('가장 약한 챕터를 다음 행동으로 요약한다', () => {
      const results: QuizResult[] = [
        makeResult('q1', 'laws', 'special-education-act', false),
        makeResult('q2', 'laws', 'special-education-act', true),
        makeResult('q3', 'visual-impairment', 'visual-training', true),
      ];

      const summary = buildNextActionSummary(
        results,
        { laws: '관련 법령', 'visual-impairment': '시각장애' },
        { 'special-education-act': '특수교육법' },
      );

      expect(summary?.title).toBe('관련 법령 · 특수교육법');
      expect(summary?.body).toContain('1/2 정답');
      expect(summary?.href).toBe('/concepts/관련 법령/special-education-act');
      expect(summary?.ctaLabel).toBe('약점 개념 보기');
    });

    it('결과가 없으면 null을 반환한다', () => {
      expect(buildNextActionSummary([], subjectMap)).toBeNull();
    });
  });
});
