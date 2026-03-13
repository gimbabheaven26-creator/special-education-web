import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuizQuestion, QuizResult } from '@/types/quiz';
import type { WrongNote } from '@/types/study';

// ─── Feedback Types (merged from useQuizFeedbackStore) ──────────────────────

export interface QuizFeedback {
  questionId: string;
  type: 'up' | 'down';
  timestamp: string;
}

export interface QuizErrorReport {
  questionId: string;
  message: string;
  timestamp: string;
}

// ─── Store Interface ────────────────────────────────────────────────────────

interface QuizStore {
  // Wrong notes & history
  wrongNotes: WrongNote[];
  quizHistory: QuizResult[];
  addWrongNote: (question: QuizQuestion, userAnswer: string | number) => void;
  markMastered: (questionId: string) => void;
  unmarkMastered: (questionId: string) => void;
  removeWrongNote: (questionId: string) => void;
  addQuizResult: (result: QuizResult) => void;
  getWrongNotesBySubject: (subject: string) => WrongNote[];
  getQuizStats: () => { total: number; correct: number; rate: number };

  // Feedback (merged from useQuizFeedbackStore)
  feedbacks: QuizFeedback[];
  errorReports: QuizErrorReport[];
  addFeedback: (questionId: string, type: 'up' | 'down') => void;
  getFeedback: (questionId: string) => 'up' | 'down' | null;
  getStats: () => { totalUp: number; totalDown: number; feedbacks: QuizFeedback[] };
  addErrorReport: (questionId: string, message: string) => void;
  getErrorReports: () => QuizErrorReport[];
  getErrorReportCount: () => number;
}

// ─── Migration: read legacy 'quiz-feedback' localStorage data ───────────────

interface LegacyFeedbackState {
  feedbacks?: QuizFeedback[];
  errorReports?: QuizErrorReport[];
}

function migrateLegacyFeedbackData(): LegacyFeedbackState {
  if (typeof window === 'undefined') return {};

  try {
    const raw = localStorage.getItem('quiz-feedback');
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    const state = parsed?.state ?? {};
    // Remove old key after reading
    localStorage.removeItem('quiz-feedback');

    return {
      feedbacks: Array.isArray(state.feedbacks) ? state.feedbacks : [],
      errorReports: Array.isArray(state.errorReports) ? state.errorReports : [],
    };
  } catch {
    return {};
  }
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      wrongNotes: [],
      quizHistory: [],
      feedbacks: [],
      errorReports: [],

      // ── Wrong Notes ─────────────────────────────────────────────────────

      addWrongNote: (question, userAnswer) =>
        set((state) => {
          const existing = state.wrongNotes.find((n) => n.questionId === question.id);
          if (existing) {
            return {
              wrongNotes: state.wrongNotes.map((n) =>
                n.questionId === question.id
                  ? { ...n, attempts: n.attempts + 1, lastAttempt: Date.now(), userAnswer, mastered: false }
                  : n
              ),
            };
          }
          return {
            wrongNotes: [
              ...state.wrongNotes,
              { questionId: question.id, question, userAnswer, attempts: 1, lastAttempt: Date.now(), mastered: false },
            ],
          };
        }),

      markMastered: (questionId) =>
        set((state) => ({
          wrongNotes: state.wrongNotes.map((n) =>
            n.questionId === questionId ? { ...n, mastered: true } : n
          ),
        })),

      unmarkMastered: (questionId) =>
        set((state) => ({
          wrongNotes: state.wrongNotes.map((n) =>
            n.questionId === questionId ? { ...n, mastered: false } : n
          ),
        })),

      removeWrongNote: (questionId) =>
        set((state) => ({
          wrongNotes: state.wrongNotes.filter((n) => n.questionId !== questionId),
        })),

      addQuizResult: (result) =>
        set((state) => {
          const MAX_HISTORY = 5000;
          const updated = [...state.quizHistory, result];
          const evicted = updated.length > MAX_HISTORY
            ? updated.slice(updated.length - MAX_HISTORY)
            : updated;
          return { quizHistory: evicted };
        }),

      getWrongNotesBySubject: (subject) =>
        get().wrongNotes.filter((n) => n.question.subject === subject),

      getQuizStats: () => {
        const history = get().quizHistory;
        const total = history.length;
        const correct = history.filter((r) => r.isCorrect).length;
        return { total, correct, rate: total > 0 ? Math.round((correct / total) * 100) : 0 };
      },

      // ── Feedback (merged from useQuizFeedbackStore) ─────────────────────

      addFeedback: (questionId, type) =>
        set((state) => {
          const existing = state.feedbacks.find((f) => f.questionId === questionId);
          if (existing) {
            return {
              feedbacks: state.feedbacks.map((f) =>
                f.questionId === questionId
                  ? { ...f, type, timestamp: new Date().toISOString() }
                  : f
              ),
            };
          }
          return {
            feedbacks: [
              ...state.feedbacks,
              { questionId, type, timestamp: new Date().toISOString() },
            ],
          };
        }),

      getFeedback: (questionId) => {
        const found = get().feedbacks.find((f) => f.questionId === questionId);
        return found ? found.type : null;
      },

      getStats: () => {
        const feedbacks = get().feedbacks;
        return {
          totalUp: feedbacks.filter((f) => f.type === 'up').length,
          totalDown: feedbacks.filter((f) => f.type === 'down').length,
          feedbacks,
        };
      },

      addErrorReport: (questionId, message) =>
        set((state) => ({
          errorReports: [
            ...state.errorReports,
            { questionId, message, timestamp: new Date().toISOString() },
          ],
        })),

      getErrorReports: () => get().errorReports,

      getErrorReportCount: () => get().errorReports.length,
    }),
    {
      name: 'quiz-data',
      version: 2,
      migrate: (persistedState, version) => {
        let state = persistedState as Record<string, unknown>;

        // Cascading migrations: each step falls through to the next
        if (version < 1) {
          // v0 -> v1: merge legacy quiz-feedback data
          const legacy = migrateLegacyFeedbackData();
          state = {
            ...state,
            feedbacks: legacy.feedbacks ?? [],
            errorReports: legacy.errorReports ?? [],
          };
        }

        if (version < 2) {
          // v1 -> v2: add subject/chapter to existing QuizResult entries
          const history = Array.isArray(state.quizHistory) ? state.quizHistory : [];
          state = {
            ...state,
            quizHistory: history.map((entry: Record<string, unknown>) => ({
              ...entry,
              subject: entry.subject ?? '',
              chapter: entry.chapter ?? '',
            })),
          };
        }

        return state;
      },
      merge: (persistedState, currentState) => {
        const persisted = (persistedState ?? {}) as Record<string, unknown>;

        // On first hydration (no version yet), try migrating legacy data
        if (!persisted.feedbacks && !persisted.errorReports) {
          const legacy = migrateLegacyFeedbackData();
          return {
            ...currentState,
            ...persisted,
            feedbacks: legacy.feedbacks ?? [],
            errorReports: legacy.errorReports ?? [],
          };
        }

        return { ...currentState, ...persisted };
      },
    }
  )
);
