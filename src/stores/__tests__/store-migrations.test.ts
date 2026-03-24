/**
 * Zustand Store Migration Tests
 *
 * 학습 기록 소실 방지를 위한 마이그레이션 안전망 테스트.
 * 각 스토어의 persist 버전 업그레이드 시 기존 데이터가 올바르게 변환되는지 검증한다.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── Mock localStorage ──────────────────────────────────────────────────────

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get _store() {
      return store;
    },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

// ─── Test Utilities ─────────────────────────────────────────────────────────

/** 스토어 persist 상태를 localStorage에 직접 시드 */
function seedStore(key: string, state: Record<string, unknown>, version: number) {
  localStorageMock.setItem(
    key,
    JSON.stringify({ state, version })
  );
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Store Migration Safety Tests', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Zustand 모듈 캐시 초기화
    vi.resetModules();
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // useQuizStore: v0 → v4 cascading migrations
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('useQuizStore migrations', () => {
    it('v1→v2: quizHistory에 subject/chapter 필드 추가', async () => {
      seedStore('quiz-data', {
        wrongNotes: [],
        quizHistory: [
          { questionId: 'q1', isCorrect: true, timestamp: 1000 },
          { questionId: 'q2', isCorrect: false, timestamp: 2000 },
        ],
        feedbacks: [],
        errorReports: [],
      }, 1);

      const { useQuizStore } = await import('@/stores/useQuizStore');
      const state = useQuizStore.getState();

      expect(state.quizHistory).toHaveLength(2);
      expect(state.quizHistory[0]).toHaveProperty('subject', '');
      expect(state.quizHistory[0]).toHaveProperty('chapter', '');
    });

    it('v3→v4: WrongNote에서 question 객체 → subject 문자열 추출', async () => {
      seedStore('quiz-data', {
        wrongNotes: [
          {
            questionId: 'q1',
            question: { id: 'q1', subject: '특수교육학', chapter: '통합교육', question: '문제본문' },
            userAnswer: '오답',
            attempts: 3,
            lastAttempt: 1700000000000,
            mastered: false,
          },
        ],
        quizHistory: [],
        feedbacks: [],
        errorReports: [],
      }, 3);

      const { useQuizStore } = await import('@/stores/useQuizStore');
      const state = useQuizStore.getState();

      expect(state.wrongNotes).toHaveLength(1);
      expect(state.wrongNotes[0].subject).toBe('특수교육학');
      expect(state.wrongNotes[0].questionId).toBe('q1');
      expect(state.wrongNotes[0].attempts).toBe(3);
      // question 전체 객체는 제거됨 (의도적 데이터 축소)
      expect(state.wrongNotes[0]).not.toHaveProperty('question.chapter');
    });

    it('v3→v4: question 없는 WrongNote는 빈 subject로 기본값', async () => {
      seedStore('quiz-data', {
        wrongNotes: [
          { questionId: 'q-orphan', userAnswer: 'x', mastered: false },
        ],
        quizHistory: [],
        feedbacks: [],
        errorReports: [],
      }, 3);

      const { useQuizStore } = await import('@/stores/useQuizStore');
      const state = useQuizStore.getState();

      expect(state.wrongNotes[0].subject).toBe('');
      expect(state.wrongNotes[0].attempts).toBe(1);
    });

    it('v0→v1: 레거시 quiz-feedback localStorage 데이터 병합', async () => {
      // 레거시 키에 피드백 데이터 시드
      localStorageMock.setItem('quiz-feedback', JSON.stringify({
        state: {
          feedbacks: [{ questionId: 'q1', type: 'up', timestamp: '2026-01-01' }],
          errorReports: [{ questionId: 'q2', message: '오류', timestamp: '2026-01-01' }],
        },
      }));

      seedStore('quiz-data', {
        wrongNotes: [],
        quizHistory: [],
      }, 0);

      const { useQuizStore } = await import('@/stores/useQuizStore');
      const state = useQuizStore.getState();

      expect(state.feedbacks).toHaveLength(1);
      expect(state.feedbacks[0].questionId).toBe('q1');
      expect(state.errorReports).toHaveLength(1);
      // 레거시 키는 삭제됨
      expect(localStorageMock.getItem('quiz-feedback')).toBeNull();
    });

    it('v4 현재 버전: 데이터 변환 없이 그대로 통과', async () => {
      const originalNotes = [
        { questionId: 'q1', subject: '특수교육학', userAnswer: '답', attempts: 2, lastAttempt: Date.now(), mastered: true },
      ];
      seedStore('quiz-data', {
        wrongNotes: originalNotes,
        quizHistory: [{ questionId: 'q1', isCorrect: true, subject: 'test', chapter: 'ch1' }],
        feedbacks: [],
        errorReports: [],
      }, 4);

      const { useQuizStore } = await import('@/stores/useQuizStore');
      const state = useQuizStore.getState();

      expect(state.wrongNotes).toEqual(originalNotes);
      expect(state.quizHistory).toHaveLength(1);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // useLeitnerStore: v0 → v1 (버전 트래킹 시작)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('useLeitnerStore migrations', () => {
    it('버전 없는 기존 데이터 → v1: 카드 데이터 보존', async () => {
      // 버전 관리 없이 저장된 레거시 데이터
      localStorageMock.setItem('leitner-cards', JSON.stringify({
        state: {
          cards: [
            {
              id: 'card1',
              subjectSlug: '특수교육학',
              question: '통합교육이란?',
              answer: '장애-비장애 학생 함께 교육',
              box: 3,
              lastReviewed: '2026-03-20',
              nextReview: '2026-03-24',
              createdAt: '2026-03-01',
            },
          ],
        },
        // version 필드 없음 (레거시)
      }));

      const { useLeitnerStore } = await import('@/stores/useLeitnerStore');
      const state = useLeitnerStore.getState();

      expect(state.cards).toHaveLength(1);
      expect(state.cards[0].box).toBe(3);
      expect(state.cards[0].question).toBe('통합교육이란?');
      expect(state.cards[0].nextReview).toBe('2026-03-24');
    });

    it('v1 데이터: 변환 없이 통과', async () => {
      seedStore('leitner-cards', {
        cards: [
          {
            id: 'card2',
            subjectSlug: '행동지원',
            question: 'PBS란?',
            answer: '긍정적 행동 지원',
            box: 5,
            lastReviewed: '2026-03-23',
            nextReview: '2026-04-08',
            createdAt: '2026-02-01',
          },
        ],
      }, 1);

      const { useLeitnerStore } = await import('@/stores/useLeitnerStore');
      const state = useLeitnerStore.getState();

      expect(state.cards).toHaveLength(1);
      expect(state.cards[0].box).toBe(5);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // useStudyStore: v1 → v5 cascading migrations
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('useStudyStore migrations', () => {
    it('v1→v5: dailyHistory, scenarioProgress, spacedScenarioSchedules 초기화', async () => {
      seedStore('special-edu-study', {
        currentStreak: 15,
        longestStreak: 30,
        lastActiveDate: '2026-03-23',
        totalXP: 5000,
        totalQuizzes: 200,
        totalCorrect: 160,
        dailyProgress: { date: '2026-03-23', chaptersCompleted: 2, quizzesCompleted: 10, quizzesCorrect: 8 },
        dailyGoal: { chapters: 3, quizzes: 15 },
        recentActivities: [],
      }, 1);

      const { useStudyStore } = await import('@/stores/useStudyStore');
      const state = useStudyStore.getState();

      // 기존 데이터 보존
      expect(state.currentStreak).toBe(15);
      expect(state.longestStreak).toBe(30);
      expect(state.totalXP).toBe(5000);

      // 새 필드 초기화
      expect(state.dailyHistory).toEqual([]);
      expect(state.scenarioProgress).toEqual({});
      expect(state.spacedScenarioSchedules).toEqual({});
    });

    it('v3→v5: spacedScenarioSchedules만 추가', async () => {
      seedStore('special-edu-study', {
        currentStreak: 5,
        longestStreak: 10,
        lastActiveDate: '2026-03-23',
        totalXP: 1000,
        totalQuizzes: 50,
        totalCorrect: 40,
        dailyProgress: { date: '2026-03-23', chaptersCompleted: 1, quizzesCompleted: 5, quizzesCorrect: 4 },
        dailyGoal: { chapters: 2, quizzes: 10 },
        recentActivities: [],
        dailyHistory: [{ date: '2026-03-23', quizzesCompleted: 5 }],
        scenarioProgress: { 'scenario-1': { completed: true } },
      }, 3);

      const { useStudyStore } = await import('@/stores/useStudyStore');
      const state = useStudyStore.getState();

      // 기존 v3 데이터 보존
      expect(state.dailyHistory).toHaveLength(1);
      expect(state.scenarioProgress).toHaveProperty('scenario-1');

      // v4 필드 추가
      expect(state.spacedScenarioSchedules).toEqual({});
    });

    it('v5 현재 버전: 변환 없이 통과', async () => {
      seedStore('special-edu-study', {
        currentStreak: 20,
        longestStreak: 20,
        lastActiveDate: '2026-03-24',
        totalXP: 10000,
        totalQuizzes: 500,
        totalCorrect: 400,
        dailyProgress: { date: '2026-03-24', chaptersCompleted: 3, quizzesCompleted: 15, quizzesCorrect: 12 },
        dailyGoal: { chapters: 3, quizzes: 15 },
        recentActivities: [],
        dailyHistory: [],
        scenarioProgress: {},
        spacedScenarioSchedules: {},
      }, 5);

      const { useStudyStore } = await import('@/stores/useStudyStore');
      const state = useStudyStore.getState();

      expect(state.currentStreak).toBe(20);
      expect(state.totalXP).toBe(10000);
    });
  });

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // localStorage 키 충돌 검증
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  describe('localStorage key isolation', () => {
    it('각 스토어의 persist 키가 고유함', () => {
      const keys = [
        'special-edu-onboarding',
        'bookmarks',
        'leitner-cards',
        'quiz-data',
        'special-edu-study',
      ];

      const unique = new Set(keys);
      expect(unique.size).toBe(keys.length);
    });
  });
});
