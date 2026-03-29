import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock external deps for deterministic tests
vi.mock('@/lib/timeslot', () => ({
  getKSTTimeslot: vi.fn(() => ({ date: '2026-03-28', slot: 'afternoon' })),
}));
vi.mock('@/lib/array-utils', () => ({
  shuffle: vi.fn(<T>(arr: T[]): T[] => [...arr]),
}));
vi.mock('@/lib/quiz/adaptive-difficulty', () => ({
  sortByAdaptiveDifficulty: vi.fn(<T>(pool: T[]): T[] => [...pool]),
}));

import {
  generateDiagnosticSessionId,
  buildSession,
  findNextUnanswered,
  REVIEW_MIX_RATIO,
  DIAGNOSTIC_CORRECT_MS,
  DIAGNOSTIC_WRONG_MS,
} from '../quiz-session-utils';
import { getKSTTimeslot } from '@/lib/timeslot';
import type { QuizQuestion } from '@/types/quiz';
import type { SessionConfig } from '../SessionSetup';

function makeQ(id: string, chapter = 'ch1', difficulty: 1 | 2 | 3 = 2): QuizQuestion {
  return {
    id, subject: 'laws', chapter, type: 'ox',
    question: `Q-${id}`, answer: 'O', explanation: '',
    difficulty,
  } as QuizQuestion;
}

beforeEach(() => { vi.clearAllMocks(); });

// ─── Constants ────────────────────────────────────────────────────────────────

describe('Constants', () => {
  it('REVIEW_MIX_RATIO = 0.7', () => expect(REVIEW_MIX_RATIO).toBe(0.7));
  it('DIAGNOSTIC_CORRECT_MS = 2000', () => expect(DIAGNOSTIC_CORRECT_MS).toBe(2000));
  it('DIAGNOSTIC_WRONG_MS = 4000', () => expect(DIAGNOSTIC_WRONG_MS).toBe(4000));
});

// ─── generateDiagnosticSessionId ──────────────────────────────────────────────

describe('generateDiagnosticSessionId', () => {
  it('첫 세션 시 id=diag-날짜-1, label=M월 D일-1', () => {
    const result = generateDiagnosticSessionId([]);
    expect(result.id).toBe('diag-2026-03-28-1');
    expect(result.label).toBe('3월 28일-1');
  });

  it('같은 날 기존 세션이 있으면 순번 증가', () => {
    const sessions = [
      { id: 'diag-2026-03-28-1' },
      { id: 'diag-2026-03-28-2' },
    ] as Array<{ id: string }>;
    const result = generateDiagnosticSessionId(sessions as never);
    expect(result.id).toBe('diag-2026-03-28-3');
    expect(result.label).toBe('3월 28일-3');
  });

  it('다른 날 세션은 카운트에 포함 안 됨', () => {
    const sessions = [
      { id: 'diag-2026-03-27-1' },
    ] as Array<{ id: string }>;
    const result = generateDiagnosticSessionId(sessions as never);
    expect(result.id).toBe('diag-2026-03-28-1');
  });

  it('다른 날짜 KST 슬롯', () => {
    (getKSTTimeslot as ReturnType<typeof vi.fn>).mockReturnValue({ date: '2026-01-05', slot: 'morning' });
    const result = generateDiagnosticSessionId([]);
    expect(result.id).toBe('diag-2026-01-05-1');
    expect(result.label).toBe('1월 5일-1');
  });
});

// ─── findNextUnanswered ───────────────────────────────────────────────────────

describe('findNextUnanswered', () => {
  it('현재 인덱스 이후 미답변 문제 반환', () => {
    expect(findNextUnanswered(0, 5, new Set([0, 1]), new Set())).toBe(2);
  });

  it('끝까지 없으면 앞에서 찾기 (wrap-around)', () => {
    expect(findNextUnanswered(3, 5, new Set([4]), new Set())).toBe(0);
  });

  it('전부 답변 완료 시 -1', () => {
    expect(findNextUnanswered(0, 3, new Set([0, 1, 2]), new Set())).toBe(-1);
  });

  it('스킵된 문제 건너뛰기', () => {
    expect(findNextUnanswered(0, 5, new Set(), new Set([1]))).toBe(2);
  });

  it('답변+스킵 모두 제외', () => {
    expect(findNextUnanswered(0, 4, new Set([1]), new Set([2]))).toBe(3);
  });

  it('모든 문제 답변 또는 스킵 시 -1', () => {
    expect(findNextUnanswered(0, 3, new Set([1]), new Set([0, 2]))).toBe(-1);
  });
});

// ─── buildSession ─────────────────────────────────────────────────────────────

describe('buildSession', () => {
  const questions = [makeQ('q1', 'ch1', 1), makeQ('q2', 'ch1', 2), makeQ('q3', 'ch2', 3), makeQ('q4', 'ch2', 2)];

  const baseConfig: SessionConfig = {
    preset: 'new',
    questionCount: 3,
    chapters: [],
    difficulty: 'all',
  };

  describe('preset=new (기본)', () => {
    it('안 푼 문제 우선', () => {
      const history = [{ questionId: 'q1', isCorrect: true, chapter: 'ch1' }];
      const result = buildSession(questions, [], history, baseConfig);
      // q1은 이미 풀었으므로 q2,q3,q4가 먼저 선택됨
      expect(result).toHaveLength(3);
      expect(result.map(q => q.id)).not.toContain('q1');
    });

    it('새 문제가 부족하면 기존 문제로 보충', () => {
      const history = questions.map(q => ({ questionId: q.id, isCorrect: true, chapter: q.chapter }));
      const result = buildSession(questions, [], history, { ...baseConfig, questionCount: 2 });
      expect(result).toHaveLength(2);
    });
  });

  describe('챕터 필터', () => {
    it('특정 챕터만 포함', () => {
      const config = { ...baseConfig, chapters: ['ch2'], questionCount: 10 };
      const result = buildSession(questions, [], [], config);
      expect(result.every(q => q.chapter === 'ch2')).toBe(true);
    });
  });

  describe('난이도 필터', () => {
    it('basic → difficulty 1만', () => {
      const config = { ...baseConfig, difficulty: 'basic' as const, questionCount: 10 };
      const result = buildSession(questions, [], [], config);
      expect(result.every(q => q.difficulty === 1)).toBe(true);
    });

    it('intermediate → difficulty 2만', () => {
      const config = { ...baseConfig, difficulty: 'intermediate' as const, questionCount: 10 };
      const result = buildSession(questions, [], [], config);
      expect(result.every(q => q.difficulty === 2)).toBe(true);
    });

    it('advanced → difficulty 3만', () => {
      const config = { ...baseConfig, difficulty: 'advanced' as const, questionCount: 10 };
      const result = buildSession(questions, [], [], config);
      expect(result.every(q => q.difficulty === 3)).toBe(true);
    });

    it('필터 결과 0이면 원본 풀 유지', () => {
      const allDiff2 = [makeQ('a', 'ch1', 2), makeQ('b', 'ch1', 2)];
      const config = { ...baseConfig, difficulty: 'advanced' as const, questionCount: 10 };
      const result = buildSession(allDiff2, [], [], config);
      // difficulty 3이 없으므로 필터 결과 0건 → 원본 유지
      expect(result).toHaveLength(2);
    });
  });

  describe('preset=review', () => {
    it('복습 문제 70% + 새 문제 30% 비율', () => {
      const reviewQs = [makeQ('r1'), makeQ('r2'), makeQ('r3')];
      const config = { ...baseConfig, preset: 'review' as const, questionCount: 4 };
      const result = buildSession(questions, reviewQs, [], config);
      expect(result).toHaveLength(4);
      // reviewMax = ceil(4 * 0.7) = 3 → 복습 최대 3건
      const reviewIds = new Set(reviewQs.map(q => q.id));
      const reviewCount = result.filter(q => reviewIds.has(q.id)).length;
      expect(reviewCount).toBeLessThanOrEqual(3);
    });

    it('leitnerDueIds도 복습 풀에 포함', () => {
      const config = { ...baseConfig, preset: 'review' as const, questionCount: 4 };
      const leitnerDue = new Set(['q3']);
      const result = buildSession(questions, [], [], config, leitnerDue);
      expect(result).toHaveLength(4);
    });
  });

  describe('preset=weak', () => {
    it('정답률 60% 미만 챕터(3문제 이상) 우선 출제', () => {
      const history = [
        { questionId: 'q3', isCorrect: false, chapter: 'ch2' },
        { questionId: 'q4', isCorrect: false, chapter: 'ch2' },
        { questionId: 'x1', isCorrect: false, chapter: 'ch2' },
        { questionId: 'q1', isCorrect: true, chapter: 'ch1' },
        { questionId: 'q2', isCorrect: true, chapter: 'ch1' },
        { questionId: 'x2', isCorrect: true, chapter: 'ch1' },
      ];
      const config = { ...baseConfig, preset: 'weak' as const, questionCount: 2 };
      const result = buildSession(questions, [], history, config);
      // ch2 정답률 0% (3문제 이상) → 약점 챕터
      expect(result.every(q => q.chapter === 'ch2')).toBe(true);
    });

    it('약점 챕터 없으면 전체 풀에서 랜덤', () => {
      const history = [
        { questionId: 'q1', isCorrect: true, chapter: 'ch1' },
      ];
      const config = { ...baseConfig, preset: 'weak' as const, questionCount: 3 };
      const result = buildSession(questions, [], history, config);
      expect(result).toHaveLength(3);
    });
  });
});
