import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from '@testing-library/react';

// ── Mock useLeitnerStore before importing useQuizStore ──────────────────────
const mockAddCard = vi.fn();
const mockAnswerCard = vi.fn();

vi.mock('@/stores/useLeitnerStore', () => ({
  useLeitnerStore: {
    getState: () => ({
      cards: [] as Array<{ id: string }>,
      addCard: mockAddCard,
      answerCard: mockAnswerCard,
    }),
  },
}));

// ── Mock date-utils (transitive dep via useLeitnerStore) ────────────────────
vi.mock('@/lib/date-utils', () => ({
  getKSTDate: () => '2026-03-29',
}));

import { useQuizStore } from '../useQuizStore';
import type { QuizQuestion, QuizResult } from '@/types/quiz';

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeQuestion(overrides: Partial<QuizQuestion> = {}): QuizQuestion {
  return {
    id: 'q-1',
    subject: 'diagnosis',
    chapter: 'intelligence',
    type: 'ox',
    question: '지능검사는 개인의 인지능력을 측정한다',
    answer: 'O',
    explanation: '맞습니다',
    difficulty: 1,
    ...overrides,
  };
}

function makeResult(overrides: Partial<QuizResult> = {}): QuizResult {
  return {
    questionId: 'q-1',
    userAnswer: 'O',
    isCorrect: true,
    timestamp: Date.now(),
    subject: 'diagnosis',
    chapter: 'intelligence',
    ...overrides,
  };
}

// ── Setup / Teardown ────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
  // Reset store to initial state
  useQuizStore.setState({
    wrongNotes: [],
    quizHistory: [],
    diagnosticSessions: [],
    feedbacks: [],
    errorReports: [],
  });
});

afterEach(() => {
  // Clear localStorage persist data
  localStorage.removeItem('quiz-data');
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. Initial State
// ═══════════════════════════════════════════════════════════════════════════

describe('초기 상태', () => {
  it('모든 배열이 빈 상태로 시작', () => {
    const state = useQuizStore.getState();
    expect(state.wrongNotes).toEqual([]);
    expect(state.quizHistory).toEqual([]);
    expect(state.diagnosticSessions).toEqual([]);
    expect(state.feedbacks).toEqual([]);
    expect(state.errorReports).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. Wrong Notes
// ═══════════════════════════════════════════════════════════════════════════

describe('addWrongNote', () => {
  it('새 오답 노트를 추가한다', () => {
    const question = makeQuestion();

    act(() => {
      useQuizStore.getState().addWrongNote(question, 'X');
    });

    const { wrongNotes } = useQuizStore.getState();
    expect(wrongNotes).toHaveLength(1);
    expect(wrongNotes[0].questionId).toBe('q-1');
    expect(wrongNotes[0].subject).toBe('diagnosis');
    expect(wrongNotes[0].userAnswer).toBe('X');
    expect(wrongNotes[0].attempts).toBe(1);
    expect(wrongNotes[0].mastered).toBe(false);
  });

  it('sessionId를 함께 저장할 수 있다', () => {
    const question = makeQuestion();

    act(() => {
      useQuizStore.getState().addWrongNote(question, 'X', 'session-abc');
    });

    const { wrongNotes } = useQuizStore.getState();
    expect(wrongNotes[0].sessionId).toBe('session-abc');
  });

  it('sessionId 미전달 시 sessionId 필드가 없다', () => {
    const question = makeQuestion();

    act(() => {
      useQuizStore.getState().addWrongNote(question, 'X');
    });

    const { wrongNotes } = useQuizStore.getState();
    expect(wrongNotes[0]).not.toHaveProperty('sessionId');
  });

  it('중복 questionId는 attempts를 증가시키고 mastered를 false로 리셋한다', () => {
    const question = makeQuestion();

    act(() => {
      useQuizStore.getState().addWrongNote(question, 'X');
    });
    // First mark as mastered
    act(() => {
      useQuizStore.getState().markMastered('q-1');
    });
    expect(useQuizStore.getState().wrongNotes[0].mastered).toBe(true);

    // Then add same question again
    act(() => {
      useQuizStore.getState().addWrongNote(question, 'X');
    });

    const { wrongNotes } = useQuizStore.getState();
    expect(wrongNotes).toHaveLength(1);
    expect(wrongNotes[0].attempts).toBe(2);
    expect(wrongNotes[0].mastered).toBe(false);
  });

  it('중복 추가 시 userAnswer를 최신 값으로 갱신한다', () => {
    const question = makeQuestion();

    act(() => {
      useQuizStore.getState().addWrongNote(question, 'X');
    });
    act(() => {
      useQuizStore.getState().addWrongNote(question, '2');
    });

    expect(useQuizStore.getState().wrongNotes[0].userAnswer).toBe('2');
  });

  it('Leitner 스토어에 카드를 자동 추가한다 (새 카드)', () => {
    const question = makeQuestion();

    act(() => {
      useQuizStore.getState().addWrongNote(question, 'X');
    });

    expect(mockAddCard).toHaveBeenCalledWith({
      id: 'q-1',
      subjectSlug: 'diagnosis',
      question: question.question,
      answer: 'O',
    });
  });

  it('500개 초과 시 우선순위가 낮은 오답노트를 제거한다', () => {
    // Seed 500 notes
    const notes = Array.from({ length: 500 }, (_, i) => ({
      questionId: `q-${i}`,
      subject: 'diagnosis',
      chapter: 'ch',
      userAnswer: 'X',
      attempts: 1,
      lastAttempt: i,
      mastered: false,
    }));
    useQuizStore.setState({ wrongNotes: notes });

    // Add one more -> triggers eviction
    act(() => {
      useQuizStore.getState().addWrongNote(
        makeQuestion({ id: 'q-new' }),
        'X'
      );
    });

    expect(useQuizStore.getState().wrongNotes).toHaveLength(500);
    // Oldest mastered notes should be evicted first;
    // since none are mastered, oldest lastAttempt is evicted
    expect(
      useQuizStore.getState().wrongNotes.find((n) => n.questionId === 'q-0')
    ).toBeUndefined();
    expect(
      useQuizStore.getState().wrongNotes.find((n) => n.questionId === 'q-new')
    ).toBeDefined();
  });
});

describe('markMastered / unmarkMastered', () => {
  it('mastered를 true로 설정한다', () => {
    const question = makeQuestion();
    act(() => { useQuizStore.getState().addWrongNote(question, 'X'); });

    act(() => { useQuizStore.getState().markMastered('q-1'); });
    expect(useQuizStore.getState().wrongNotes[0].mastered).toBe(true);
  });

  it('mastered를 false로 되돌린다', () => {
    const question = makeQuestion();
    act(() => { useQuizStore.getState().addWrongNote(question, 'X'); });
    act(() => { useQuizStore.getState().markMastered('q-1'); });

    act(() => { useQuizStore.getState().unmarkMastered('q-1'); });
    expect(useQuizStore.getState().wrongNotes[0].mastered).toBe(false);
  });

  it('존재하지 않는 questionId에 대해 상태가 변하지 않는다', () => {
    act(() => {
      useQuizStore.getState().addWrongNote(makeQuestion(), 'X');
    });
    const before = useQuizStore.getState().wrongNotes;

    act(() => { useQuizStore.getState().markMastered('nonexistent'); });
    expect(useQuizStore.getState().wrongNotes).toEqual(before);
  });
});

describe('removeWrongNote', () => {
  it('해당 questionId의 오답노트를 제거한다', () => {
    act(() => { useQuizStore.getState().addWrongNote(makeQuestion(), 'X'); });
    act(() => { useQuizStore.getState().addWrongNote(makeQuestion({ id: 'q-2' }), 'X'); });
    expect(useQuizStore.getState().wrongNotes).toHaveLength(2);

    act(() => { useQuizStore.getState().removeWrongNote('q-1'); });
    const { wrongNotes } = useQuizStore.getState();
    expect(wrongNotes).toHaveLength(1);
    expect(wrongNotes[0].questionId).toBe('q-2');
  });

  it('존재하지 않는 questionId 제거 시 상태 변경 없음', () => {
    act(() => { useQuizStore.getState().addWrongNote(makeQuestion(), 'X'); });

    act(() => { useQuizStore.getState().removeWrongNote('nonexistent'); });
    expect(useQuizStore.getState().wrongNotes).toHaveLength(1);
  });

  it('빈 배열에서 제거 시도해도 에러 없음', () => {
    act(() => { useQuizStore.getState().removeWrongNote('anything'); });
    expect(useQuizStore.getState().wrongNotes).toEqual([]);
  });
});

describe('getWrongNotesBySubject', () => {
  it('특정 과목의 오답노트만 필터링', () => {
    act(() => {
      useQuizStore.getState().addWrongNote(makeQuestion({ id: 'q-1', subject: 'diagnosis' }), 'X');
      useQuizStore.getState().addWrongNote(makeQuestion({ id: 'q-2', subject: 'behavior' }), 'X');
      useQuizStore.getState().addWrongNote(makeQuestion({ id: 'q-3', subject: 'diagnosis' }), 'X');
    });

    const result = useQuizStore.getState().getWrongNotesBySubject('diagnosis');
    expect(result).toHaveLength(2);
    expect(result.every((n) => n.subject === 'diagnosis')).toBe(true);
  });

  it('해당 과목 오답이 없으면 빈 배열', () => {
    const result = useQuizStore.getState().getWrongNotesBySubject('nonexistent');
    expect(result).toEqual([]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. Quiz History & Stats
// ═══════════════════════════════════════════════════════════════════════════

describe('addQuizResult', () => {
  it('퀴즈 결과를 추가한다', () => {
    const result = makeResult();

    act(() => { useQuizStore.getState().addQuizResult(result); });
    expect(useQuizStore.getState().quizHistory).toHaveLength(1);
    expect(useQuizStore.getState().quizHistory[0].questionId).toBe('q-1');
  });

  it('5000개 초과 시 오래된 항목을 제거한다', () => {
    const history = Array.from({ length: 5000 }, (_, i) =>
      makeResult({ questionId: `q-${i}`, timestamp: i })
    );
    useQuizStore.setState({ quizHistory: history });

    act(() => {
      useQuizStore.getState().addQuizResult(makeResult({ questionId: 'q-new' }));
    });

    const { quizHistory } = useQuizStore.getState();
    expect(quizHistory).toHaveLength(5000);
    // Oldest entry should be evicted
    expect(quizHistory[0].questionId).toBe('q-1');
    expect(quizHistory[quizHistory.length - 1].questionId).toBe('q-new');
  });
});

describe('getQuizStats', () => {
  it('정답률을 올바르게 계산한다', () => {
    act(() => {
      useQuizStore.getState().addQuizResult(makeResult({ isCorrect: true }));
      useQuizStore.getState().addQuizResult(makeResult({ questionId: 'q-2', isCorrect: false }));
      useQuizStore.getState().addQuizResult(makeResult({ questionId: 'q-3', isCorrect: true }));
    });

    const stats = useQuizStore.getState().getQuizStats();
    expect(stats.total).toBe(3);
    expect(stats.correct).toBe(2);
    expect(stats.rate).toBe(67); // Math.round(2/3 * 100)
  });

  it('기록이 없으면 rate 0을 반환한다', () => {
    const stats = useQuizStore.getState().getQuizStats();
    expect(stats).toEqual({ total: 0, correct: 0, rate: 0 });
  });

  it('전부 정답이면 rate 100', () => {
    act(() => {
      useQuizStore.getState().addQuizResult(makeResult({ isCorrect: true }));
      useQuizStore.getState().addQuizResult(makeResult({ questionId: 'q-2', isCorrect: true }));
    });

    expect(useQuizStore.getState().getQuizStats().rate).toBe(100);
  });

  it('전부 오답이면 rate 0', () => {
    act(() => {
      useQuizStore.getState().addQuizResult(makeResult({ isCorrect: false }));
    });

    expect(useQuizStore.getState().getQuizStats().rate).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. Diagnostic Sessions
// ═══════════════════════════════════════════════════════════════════════════

describe('addDiagnosticSession', () => {
  const makeSession = (id: string) => ({
    id,
    label: '테스트 세션',
    type: 'ox' as const,
    startedAt: Date.now(),
    completedAt: Date.now() + 60000,
    questionIds: ['q-1'],
    results: [{ questionId: 'q-1', isCorrect: true }],
    stats: { total: 1, correct: 1, rate: 100 },
  });

  it('진단 세션을 추가한다', () => {
    act(() => {
      useQuizStore.getState().addDiagnosticSession(makeSession('s-1'));
    });

    expect(useQuizStore.getState().diagnosticSessions).toHaveLength(1);
    expect(useQuizStore.getState().diagnosticSessions[0].id).toBe('s-1');
  });

  it('100개 초과 시 오래된 세션을 제거한다', () => {
    const sessions = Array.from({ length: 100 }, (_, i) =>
      makeSession(`s-${i}`)
    );
    useQuizStore.setState({ diagnosticSessions: sessions });

    act(() => {
      useQuizStore.getState().addDiagnosticSession(makeSession('s-new'));
    });

    const { diagnosticSessions } = useQuizStore.getState();
    expect(diagnosticSessions).toHaveLength(100);
    expect(diagnosticSessions[0].id).toBe('s-1');
    expect(diagnosticSessions[diagnosticSessions.length - 1].id).toBe('s-new');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. Feedback
// ═══════════════════════════════════════════════════════════════════════════

describe('addFeedback', () => {
  it('새 피드백을 추가한다', () => {
    act(() => { useQuizStore.getState().addFeedback('q-1', 'up'); });

    const { feedbacks } = useQuizStore.getState();
    expect(feedbacks).toHaveLength(1);
    expect(feedbacks[0].questionId).toBe('q-1');
    expect(feedbacks[0].type).toBe('up');
    expect(feedbacks[0].timestamp).toBeTruthy();
  });

  it('같은 questionId에 피드백을 갱신한다 (up → down)', () => {
    act(() => { useQuizStore.getState().addFeedback('q-1', 'up'); });
    act(() => { useQuizStore.getState().addFeedback('q-1', 'down'); });

    const { feedbacks } = useQuizStore.getState();
    expect(feedbacks).toHaveLength(1);
    expect(feedbacks[0].type).toBe('down');
  });

  it('200개 초과 시 오래된 피드백을 제거한다', () => {
    const existing = Array.from({ length: 200 }, (_, i) => ({
      questionId: `q-${i}`,
      type: 'up' as const,
      timestamp: new Date(i).toISOString(),
    }));
    useQuizStore.setState({ feedbacks: existing });

    act(() => { useQuizStore.getState().addFeedback('q-new', 'down'); });

    const { feedbacks } = useQuizStore.getState();
    expect(feedbacks).toHaveLength(200);
    expect(feedbacks[feedbacks.length - 1].questionId).toBe('q-new');
  });
});

describe('getFeedback', () => {
  it('존재하는 피드백의 type을 반환한다', () => {
    act(() => { useQuizStore.getState().addFeedback('q-1', 'up'); });
    expect(useQuizStore.getState().getFeedback('q-1')).toBe('up');
  });

  it('존재하지 않는 questionId는 null을 반환한다', () => {
    expect(useQuizStore.getState().getFeedback('nonexistent')).toBeNull();
  });
});

describe('getStats', () => {
  it('up/down 카운트를 정확히 반환한다', () => {
    act(() => {
      useQuizStore.getState().addFeedback('q-1', 'up');
      useQuizStore.getState().addFeedback('q-2', 'down');
      useQuizStore.getState().addFeedback('q-3', 'up');
    });

    const stats = useQuizStore.getState().getStats();
    expect(stats.totalUp).toBe(2);
    expect(stats.totalDown).toBe(1);
    expect(stats.feedbacks).toHaveLength(3);
  });

  it('피드백이 없으면 0/0', () => {
    const stats = useQuizStore.getState().getStats();
    expect(stats).toEqual({ totalUp: 0, totalDown: 0, feedbacks: [] });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. Error Reports
// ═══════════════════════════════════════════════════════════════════════════

describe('addErrorReport', () => {
  it('오류 신고를 추가한다', () => {
    act(() => {
      useQuizStore.getState().addErrorReport('q-1', '답이 틀렸습니다');
    });

    const reports = useQuizStore.getState().getErrorReports();
    expect(reports).toHaveLength(1);
    expect(reports[0].questionId).toBe('q-1');
    expect(reports[0].message).toBe('답이 틀렸습니다');
  });

  it('같은 questionId에 대해 여러 신고 가능 (중복 허용)', () => {
    act(() => {
      useQuizStore.getState().addErrorReport('q-1', '첫 번째 신고');
      useQuizStore.getState().addErrorReport('q-1', '두 번째 신고');
    });

    expect(useQuizStore.getState().getErrorReports()).toHaveLength(2);
  });

  it('200개 초과 시 오래된 신고를 제거한다', () => {
    const existing = Array.from({ length: 200 }, (_, i) => ({
      questionId: `q-${i}`,
      message: `report-${i}`,
      timestamp: new Date(i).toISOString(),
    }));
    useQuizStore.setState({ errorReports: existing });

    act(() => {
      useQuizStore.getState().addErrorReport('q-new', 'new report');
    });

    const reports = useQuizStore.getState().getErrorReports();
    expect(reports).toHaveLength(200);
    expect(reports[reports.length - 1].questionId).toBe('q-new');
  });
});

describe('getErrorReports / getErrorReportCount', () => {
  it('모든 오류 신고를 반환한다', () => {
    act(() => {
      useQuizStore.getState().addErrorReport('q-1', 'msg1');
      useQuizStore.getState().addErrorReport('q-2', 'msg2');
    });

    expect(useQuizStore.getState().getErrorReports()).toHaveLength(2);
    expect(useQuizStore.getState().getErrorReportCount()).toBe(2);
  });

  it('신고가 없으면 빈 배열과 0', () => {
    expect(useQuizStore.getState().getErrorReports()).toEqual([]);
    expect(useQuizStore.getState().getErrorReportCount()).toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. Immutability (spread로 새 객체 생성 확인)
// ═══════════════════════════════════════════════════════════════════════════

describe('불변성 (Immutability)', () => {
  it('addWrongNote가 새 배열을 반환한다', () => {
    act(() => { useQuizStore.getState().addWrongNote(makeQuestion(), 'X'); });
    const ref1 = useQuizStore.getState().wrongNotes;

    act(() => { useQuizStore.getState().addWrongNote(makeQuestion({ id: 'q-2' }), 'X'); });
    const ref2 = useQuizStore.getState().wrongNotes;

    expect(ref1).not.toBe(ref2);
  });

  it('markMastered가 원본 노트 객체를 변경하지 않는다', () => {
    act(() => { useQuizStore.getState().addWrongNote(makeQuestion(), 'X'); });
    const noteBefore = useQuizStore.getState().wrongNotes[0];

    act(() => { useQuizStore.getState().markMastered('q-1'); });
    const noteAfter = useQuizStore.getState().wrongNotes[0];

    expect(noteBefore).not.toBe(noteAfter);
    expect(noteBefore.mastered).toBe(false);
    expect(noteAfter.mastered).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. localStorage persist (zustand/middleware)
// ═══════════════════════════════════════════════════════════════════════════

describe('localStorage persist', () => {
  it('quiz-data 키로 상태를 저장한다', () => {
    act(() => {
      useQuizStore.getState().addFeedback('q-1', 'up');
    });

    // Zustand persist는 비동기일 수 있으므로, setState 직후 persist 호출
    // useQuizStore.persist는 Zustand persist API
    const persistApi = useQuizStore.persist;
    if (persistApi && typeof persistApi.getOptions === 'function') {
      expect(persistApi.getOptions().name).toBe('quiz-data');
    }
  });

  it('persist 버전이 5이다', () => {
    const persistApi = useQuizStore.persist;
    if (persistApi && typeof persistApi.getOptions === 'function') {
      expect(persistApi.getOptions().version).toBe(5);
    }
  });
});
