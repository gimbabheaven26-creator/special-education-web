import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '@/types/quiz';

import { buildMockExamReport, buildMockExamSession } from '../mock-exam';
import { practiceSessions, type PracticeQuestion } from '../prototype-data';

function makeQuestion(id: string, domain: string): PracticeQuestion {
  return {
    id,
    stem: `${domain} 문항`,
    domain,
    blueprint: `${domain} 핵심 단원`,
    difficulty: '중',
    examSignal: '실전형 판단 기준',
    choices: [
      { id: 'a', label: '정답', correct: true, rationale: '정답 근거' },
      { id: 'b', label: '함정', correct: false, rationale: '함정 근거' },
    ],
    explanation: {
      verdict: '정답입니다',
      coreRule: '핵심 규칙',
      trap: '함정 설명',
      connect: '연결 개념',
      nextReview: '복습',
    },
    aiCoach: {
      title: 'AI Answer Coach',
      prompt: '근거를 설명하세요',
      rewrite: '근거 요약',
    },
  };
}

function makeQuizQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: 'mock-db-1',
    subject: 'laws',
    chapter: 'iep',
    type: 'multiple',
    question: 'IEP 작성에서 가장 먼저 확인할 자료는 무엇인가?',
    options: ['현재 수행 수준', '시설 현황', '예산', '행사 일정'],
    answer: 0,
    explanation: 'IEP는 현재 수행 수준에서 출발한다.',
    difficulty: 3,
    source: 'unit-test',
    ...overrides,
  };
}

describe('buildMockExamSession', () => {
  it('builds a timed all-domain mock bundle from actual DB questions', () => {
    const session = buildMockExamSession({
      fallback: practiceSessions.mock,
      questionCount: 4,
      quizzes: [
        makeQuizQuestion({ id: 'laws-1', subject: 'laws', chapter: 'iep' }),
        makeQuizQuestion({ id: 'behavior-1', subject: 'behavior-support', chapter: 'fba', question: '기능평가의 핵심 목적은 무엇인가?' }),
        makeQuizQuestion({ id: 'assistive-1', subject: 'assistive-technology', chapter: 'assistive-tech-service', question: '보조공학 서비스 절차의 시작점은 무엇인가?' }),
        makeQuizQuestion({ id: 'communication-1', subject: 'communication-disorder', chapter: 'aac', question: 'AAC 적용에서 우선 확인할 것은 무엇인가?' }),
      ],
      timeLimitSeconds: 600,
    });

    const questions = [session.question, ...(session.followUpQuestions ?? [])];
    expect(session.timeLimitSeconds).toBe(600);
    expect(session.queue).toEqual(expect.arrayContaining(['제한시간 10분', '전범위 4문항']));
    expect(questions).toHaveLength(4);
    expect(new Set(questions.map((question) => question.domain)).size).toBeGreaterThanOrEqual(3);
    expect(session.subtitle).toContain('실제 DB 문제은행');
  });
});

describe('buildMockExamReport', () => {
  it('summarizes score, domains, trap count, and time management label', () => {
    const report = buildMockExamReport({
      timeLimitSeconds: 180,
      elapsedSeconds: 130,
      questions: [makeQuestion('q1', '관련 법령'), makeQuestion('q2', '정서행동장애')],
      answers: [
        { questionId: 'q1', correct: true, selectedChoiceId: 'a' },
        { questionId: 'q2', correct: false, selectedChoiceId: 'b' },
      ],
    });

    expect(report.correct).toBe(1);
    expect(report.rate).toBe(50);
    expect(report.trapCount).toBe(1);
    expect(report.timeLabel).toBe('시간 관리 안정');
    expect(report.weakestDomain).toBe('정서행동장애');
    expect(report.nextAction).toBe('정서행동장애 2문항을 바로 이어서 풀고, 오답 선지 근거를 한 문장으로 압축하세요.');
    expect(report.domainRows).toEqual([
      { domain: '관련 법령', total: 1, correct: 1, rate: 100, recommendation: '유지 복습' },
      { domain: '정서행동장애', total: 1, correct: 0, rate: 0, recommendation: '즉시 보강' },
    ]);
  });
});
