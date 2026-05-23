import { describe, expect, it } from 'vitest';

import { buildMockExamReport } from '../mock-exam';
import type { PracticeQuestion } from '../prototype-data';

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
    expect(report.domainRows).toEqual([
      { domain: '관련 법령', total: 1, correct: 1, rate: 100 },
      { domain: '정서행동장애', total: 1, correct: 0, rate: 0 },
    ]);
  });
});
