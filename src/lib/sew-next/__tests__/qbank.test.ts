import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '@/types/quiz';

import {
  buildQbankSnapshot,
  buildSewNextPracticeSession,
  getQbankQuestionMeta,
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
    expect(snapshot.coverageGuidance).toBe('문항이 적으면 난도를 중으로 낮추거나 형식을 사례형으로 바꿔 보세요.');
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

  it('formats qbank metadata with user-facing labels', () => {
    const meta = getQbankQuestionMeta(makeQuestion({
      subject: 'behavior-support',
      chapter: 'fba',
      difficulty: 3,
    }));

    expect(meta).toEqual({
      subjectLabel: '행동지원',
      chapterLabel: '기능적 행동평가',
      difficultyLabel: '상',
    });
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

  it('compresses raw DB explanations for choice rationale and AI coach', () => {
    const longExplanation = '기능평가는 행동의 기능을 찾기 위해 선행사건, 행동, 후속결과를 연결해 분석하는 절차이다. 면담, 관찰, 기록 검토를 함께 사용하며 중재 목표는 기능 가설에서 출발한다.';
    const session = buildSewNextPracticeSession({
      mode: 'custom',
      quizzes: [
        makeQuestion({
          explanation: longExplanation,
          chapter: 'fba',
          options: ['정답 선지', '오답 선지'],
          answer: 0,
        }),
      ],
      filters: { domain: '특수교육공학', difficulty: '중', format: '사례형' },
      fallback: practiceSessions.custom,
    });

    const correctChoice = session.question.choices.find((choice) => choice.correct);
    expect(session.question.blueprint).toBe('기능적 행동평가');
    expect(correctChoice?.rationale).toBe('기능평가는 행동의 기능을 찾기 위해 선행사건, 행동, 후속결과를 연결해 분석하는 절차이다.');
    expect(session.question.aiCoach.rewrite).toBe('기능평가는 행동의 기능을 찾기 위해 선행사건, 행동, 후속결과를 연결해 분석하는 절차이다.');
  });

  it('does not cut compact explanations at abbreviation periods', () => {
    const session = buildSewNextPracticeSession({
      mode: 'custom',
      quizzes: [
        makeQuestion({
          explanation: 'SET(School-Wide Evaluation Tool; Sugai et al., 2001)은 학교 전체 차원의 PBIS 실행 수준을 평가하는 외부 평가 도구이다. 7개 영역을 인터뷰, 문서 검토, 관찰로 확인한다.',
          options: ['정답 선지', '오답 선지'],
          answer: 0,
        }),
      ],
      filters: { domain: '특수교육공학', difficulty: '중', format: '사례형' },
      fallback: practiceSessions.custom,
    });

    expect(session.question.aiCoach.rewrite).toBe(
      'SET(School-Wide Evaluation Tool; Sugai et al., 2001)은 학교 전체 차원의 PBIS 실행 수준을 평가하는 외부 평가 도구이다.',
    );
  });
});
