import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveSession, loadSession, clearSession, type SavedSession } from '../session-recovery';

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** 유효한 세션 데이터(savedAt 제외)를 생성하는 팩토리 */
function makeSession(
  overrides: Partial<Omit<SavedSession, 'savedAt'>> = {},
): Omit<SavedSession, 'savedAt'> {
  return {
    subjectSlug: '행동수정',
    questionIds: ['q1', 'q2', 'q3', 'q4', 'q5'],
    answers: [
      { questionIndex: 0, isCorrect: true, userAnswer: '정답' },
    ],
    skippedIndices: [],
    currentIndex: 1,
    xpEarned: 10,
    preset: '5문항',
    questionCount: 5,
    ...overrides,
  };
}

/** localStorage에 저장된 세션의 raw JSON을 파싱 */
function readRaw(): SavedSession | null {
  const raw = localStorage.getItem('se-quiz-session');
  return raw ? JSON.parse(raw) : null;
}

/** savedAt을 직접 지정하여 localStorage에 삽입 */
function seedStorage(session: SavedSession): void {
  localStorage.setItem('se-quiz-session', JSON.stringify(session));
}

// ---------------------------------------------------------------------------
// tests
// ---------------------------------------------------------------------------

describe('session-recovery', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  // =======================================================================
  // saveSession
  // =======================================================================
  describe('saveSession', () => {
    it('세션을 localStorage에 저장하고 savedAt 타임스탬프를 추가한다', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      saveSession(makeSession());

      const stored = readRaw();
      expect(stored).not.toBeNull();
      expect(stored!.savedAt).toBe(now);
      expect(stored!.subjectSlug).toBe('행동수정');
      expect(stored!.questionIds).toHaveLength(5);
    });

    it('동일 키로 덮어쓰기 — 마지막 저장만 유지된다', () => {
      saveSession(makeSession({ currentIndex: 1 }));
      saveSession(makeSession({ currentIndex: 3 }));

      const stored = readRaw();
      expect(stored!.currentIndex).toBe(3);
    });

    it('activeTab 옵션 필드가 저장된다', () => {
      saveSession(makeSession({ activeTab: 'essay' }));

      const stored = readRaw();
      expect(stored!.activeTab).toBe('essay');
    });

    it('localStorage 예외 시 에러를 던지지 않는다', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceeded');
      });

      expect(() => saveSession(makeSession())).not.toThrow();
    });
  });

  // =======================================================================
  // loadSession
  // =======================================================================
  describe('loadSession', () => {
    it('저장된 세션을 동일 과목으로 로드한다', () => {
      const now = Date.now();
      vi.spyOn(Date, 'now').mockReturnValue(now);

      saveSession(makeSession({ subjectSlug: '특수교육학' }));

      const loaded = loadSession('특수교육학');
      expect(loaded).not.toBeNull();
      expect(loaded!.subjectSlug).toBe('특수교육학');
      expect(loaded!.savedAt).toBe(now);
    });

    it('다른 과목이면 null을 반환한다', () => {
      saveSession(makeSession({ subjectSlug: '행동수정' }));

      expect(loadSession('특수교육학')).toBeNull();
    });

    it('저장된 세션이 없으면 null을 반환한다', () => {
      expect(loadSession('행동수정')).toBeNull();
    });

    it('24시간 이내 세션은 유효하다', () => {
      const twentyThreeHoursAgo = Date.now() - 23 * 60 * 60 * 1000;
      seedStorage({ ...makeSession(), savedAt: twentyThreeHoursAgo });

      expect(loadSession('행동수정')).not.toBeNull();
    });

    it('24시간 초과 만료 세션은 null 반환 + localStorage 삭제', () => {
      const twentyFiveHoursAgo = Date.now() - 25 * 60 * 60 * 1000;
      seedStorage({ ...makeSession(), savedAt: twentyFiveHoursAgo });

      expect(loadSession('행동수정')).toBeNull();
      expect(localStorage.getItem('se-quiz-session')).toBeNull();
    });

    it('정확히 24시간 경과 세션은 만료된다', () => {
      const exactly24h = Date.now() - 24 * 60 * 60 * 1000 - 1;
      seedStorage({ ...makeSession(), savedAt: exactly24h });

      expect(loadSession('행동수정')).toBeNull();
    });

    it('모든 문항을 답한 완료 세션은 null 반환 + localStorage 삭제', () => {
      const completedAnswers = [
        { questionIndex: 0, isCorrect: true, userAnswer: 'a' },
        { questionIndex: 1, isCorrect: false, userAnswer: 'b' },
        { questionIndex: 2, isCorrect: true, userAnswer: 'c' },
        { questionIndex: 3, isCorrect: true, userAnswer: 'd' },
        { questionIndex: 4, isCorrect: false, userAnswer: 'e' },
      ];
      seedStorage({
        ...makeSession({ answers: completedAnswers }),
        savedAt: Date.now(),
      });

      expect(loadSession('행동수정')).toBeNull();
      expect(localStorage.getItem('se-quiz-session')).toBeNull();
    });

    it('답변 수가 문항 수를 초과해도 완료로 처리한다', () => {
      const overAnswers = Array.from({ length: 7 }, (_, i) => ({
        questionIndex: i,
        isCorrect: true,
        userAnswer: String(i),
      }));
      seedStorage({
        ...makeSession({ answers: overAnswers }),
        savedAt: Date.now(),
      });

      expect(loadSession('행동수정')).toBeNull();
    });

    it('일부만 답한 진행 중 세션은 복구된다', () => {
      const partialAnswers = [
        { questionIndex: 0, isCorrect: true, userAnswer: 'a' },
        { questionIndex: 1, isCorrect: false, userAnswer: 'b' },
      ];
      seedStorage({
        ...makeSession({ answers: partialAnswers }),
        savedAt: Date.now(),
      });

      const loaded = loadSession('행동수정');
      expect(loaded).not.toBeNull();
      expect(loaded!.answers).toHaveLength(2);
    });

    it('손상된 JSON은 null 반환 + localStorage 삭제', () => {
      localStorage.setItem('se-quiz-session', '{corrupted!!}');

      expect(loadSession('행동수정')).toBeNull();
      expect(localStorage.getItem('se-quiz-session')).toBeNull();
    });

    it('localStorage getItem 예외 시 null 반환', () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      expect(loadSession('행동수정')).toBeNull();
    });
  });

  // =======================================================================
  // clearSession
  // =======================================================================
  describe('clearSession', () => {
    it('저장된 세션을 삭제한다', () => {
      saveSession(makeSession());
      expect(localStorage.getItem('se-quiz-session')).not.toBeNull();

      clearSession();
      expect(localStorage.getItem('se-quiz-session')).toBeNull();
    });

    it('저장된 세션이 없어도 에러 없이 동작한다', () => {
      expect(() => clearSession()).not.toThrow();
    });

    it('localStorage removeItem 예외 시 에러를 던지지 않는다', () => {
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      expect(() => clearSession()).not.toThrow();
    });
  });

  // =======================================================================
  // 통합 시나리오
  // =======================================================================
  describe('통합 시나리오', () => {
    it('save → load → clear 전체 라이프사이클', () => {
      const session = makeSession({ subjectSlug: '자폐성장애' });

      // 1. 저장
      saveSession(session);
      expect(readRaw()).not.toBeNull();

      // 2. 복구
      const loaded = loadSession('자폐성장애');
      expect(loaded).not.toBeNull();
      expect(loaded!.subjectSlug).toBe('자폐성장애');

      // 3. 삭제
      clearSession();
      expect(loadSession('자폐성장애')).toBeNull();
    });

    it('과목 변경 시 이전 세션은 로드되지 않지만 storage에는 남아있다', () => {
      saveSession(makeSession({ subjectSlug: '행동수정' }));

      // 다른 과목으로 조회 — null이지만 삭제되지는 않음
      expect(loadSession('특수교육학')).toBeNull();
      expect(localStorage.getItem('se-quiz-session')).not.toBeNull();
    });

    it('새 과목으로 save하면 이전 과목 세션을 덮어쓴다', () => {
      saveSession(makeSession({ subjectSlug: '행동수정' }));
      saveSession(makeSession({ subjectSlug: '특수교육학' }));

      expect(loadSession('행동수정')).toBeNull();
      expect(loadSession('특수교육학')).not.toBeNull();
    });

    it('skippedIndices가 저장/복구된다', () => {
      const session = makeSession({
        skippedIndices: [2, 4],
        answers: [
          { questionIndex: 0, isCorrect: true, userAnswer: '답' },
        ],
      });

      saveSession(session);
      const loaded = loadSession('행동수정');

      expect(loaded!.skippedIndices).toEqual([2, 4]);
    });

    it('숫자 타입 userAnswer도 정확히 보존된다', () => {
      const session = makeSession({
        answers: [
          { questionIndex: 0, isCorrect: true, userAnswer: 42 },
        ],
      });

      saveSession(session);
      const loaded = loadSession('행동수정');

      expect(loaded!.answers[0].userAnswer).toBe(42);
      expect(typeof loaded!.answers[0].userAnswer).toBe('number');
    });
  });
});
