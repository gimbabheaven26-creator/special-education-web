import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '@/types/quiz';

import {
  buildQbankSnapshot,
  buildSewNextPracticeSession,
  getQbankFiltersFromSearchParams,
} from '../qbank';
import { practiceSessions } from '../prototype-data';

function makeQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: 'q-assistive-1',
    subject: 'assistive-technology',
    chapter: 'assistive-tech-service',
    type: 'multiple',
    question: '보조공학 서비스 절차에서 가장 먼저 확인할 것은 무엇인가?',
    caseContext: '학생의 접근성 장벽이 관찰된 사례',
    options: ['기기 목록', '교육적 요구와 환경 장벽', '예산'],
    answer: 1,
    explanation: '보조공학은 요구와 환경 분석에서 출발한다.',
    difficulty: 2,
    source: 'unit-test',
    ...overrides,
  };
}

describe('buildQbankSnapshot', () => {
  it('actual quiz rows are filtered by domain, difficulty, and format', () => {
    const snapshot = buildQbankSnapshot(
      [
        makeQuestion(),
        makeQuestion({
          id: 'q-assistive-2',
          question: '보조공학 적용 순서를 배열하시오.',
          caseContext: undefined,
          difficulty: 3,
        }),
        makeQuestion({
          id: 'q-behavior-1',
          subject: 'behavior-support',
          chapter: 'functional-behavior-assessment',
          question: '기능평가의 목적은 무엇인가?',
          caseContext: undefined,
          explanation: '기능평가는 행동의 기능을 찾는 절차이다.',
        }),
      ],
      { domain: '특수교육공학', difficulty: '중', format: '사례형' },
    );

    expect(snapshot.sourceCount).toBe(3);
    expect(snapshot.matchingCount).toBe(1);
    expect(snapshot.recommendedQuestions.map((question) => question.id)).toEqual(['q-assistive-1']);
    expect(snapshot.coverageWarning).toContain('실제 DB 문항 1개');
  });

  it('falls back to prototype questions when the DB has no usable rows', () => {
    const snapshot = buildQbankSnapshot([], {
      domain: '특수교육공학',
      difficulty: '중',
      format: '사례형',
    });

    expect(snapshot.sourceCount).toBe(0);
    expect(snapshot.matchingCount).toBeGreaterThan(0);
    expect(snapshot.dataSourceLabel).toBe('prototype fallback');
  });
});

describe('getQbankFiltersFromSearchParams', () => {
  it('normalizes unknown query params to supported defaults', () => {
    expect(
      getQbankFiltersFromSearchParams({
        domain: 'unknown',
        difficulty: 'extreme',
        format: 'anything',
      }),
    ).toEqual({ domain: '특수교육공학', difficulty: '중', format: '사례형' });
  });
});

describe('buildSewNextPracticeSession', () => {
  it('builds a custom practice session from selected DB questions', () => {
    const session = buildSewNextPracticeSession({
      mode: 'custom',
      quizzes: [makeQuestion()],
      filters: { domain: '특수교육공학', difficulty: '중', format: '사례형' },
      fallback: practiceSessions.custom,
    });

    expect(session.title).toBe('Custom Qbank Session');
    expect(session.subtitle).toContain('실제 DB 문제은행');
    expect(session.question.id).toBe('q-assistive-1');
    expect(session.question.stem).toContain('보조공학 서비스 절차');
    expect(session.queue[0]).toContain('특수교육공학');
  });
});
