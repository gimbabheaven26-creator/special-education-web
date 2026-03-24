import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuizQuestion, QuizResult } from '@/types/quiz';
import type { WrongNote } from '@/types/study';
import { useLeitnerStore } from '@/stores/useLeitnerStore';

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

// ─── Diagnostic Session ─────────────────────────────────────────────────────

export interface DiagnosticSession {
  id: string;           // 'diag-2026-03-23-1'
  label: string;        // '3월 23일-1'
  type: 'ox' | 'fill_in';
  startedAt: number;
  completedAt: number;
  questionIds: string[];
  results: Array<{
    questionId: string;
    isCorrect: boolean;
    questionText?: string;
    userAnswer?: string;
    correctAnswer?: string;
    explanation?: string;
    subject?: string;
  }>;
  stats: { total: number; correct: number; rate: number };
}

// ─── Store Interface ────────────────────────────────────────────────────────

interface QuizStore {
  // Wrong notes & history
  wrongNotes: WrongNote[];
  quizHistory: QuizResult[];
  addWrongNote: (question: QuizQuestion, userAnswer: string | number, sessionId?: string) => void;
  markMastered: (questionId: string) => void;
  unmarkMastered: (questionId: string) => void;
  removeWrongNote: (questionId: string) => void;
  addQuizResult: (result: QuizResult) => void;
  getWrongNotesBySubject: (subject: string) => WrongNote[];
  getQuizStats: () => { total: number; correct: number; rate: number };

  // Diagnostic sessions
  diagnosticSessions: DiagnosticSession[];
  addDiagnosticSession: (session: DiagnosticSession) => void;

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
      diagnosticSessions: [],
      feedbacks: [],
      errorReports: [],

      // ── Wrong Notes ─────────────────────────────────────────────────────

      addWrongNote: (question, userAnswer, sessionId?) => {
        set((state) => {
          const existing = state.wrongNotes.find((n) => n.questionId === question.id);
          if (existing) {
            return {
              wrongNotes: state.wrongNotes.map((n) =>
                n.questionId === question.id
                  ? { ...n, attempts: n.attempts + 1, lastAttempt: Date.now(), userAnswer, mastered: false, ...(sessionId != null ? { sessionId } : {}) }
                  : n
              ),
            };
          }
          const MAX_WRONG_NOTES = 500;
          const updated = [
            ...state.wrongNotes,
            { questionId: question.id, subject: question.subject, chapter: question.chapter, question, userAnswer, attempts: 1, lastAttempt: Date.now(), mastered: false, ...(sessionId != null ? { sessionId } : {}) },
          ];
          if (updated.length > MAX_WRONG_NOTES) {
            const excess = updated.length - MAX_WRONG_NOTES;
            const sortedByPriority = [...updated]
              .sort((a, b) => {
                if (a.mastered !== b.mastered) return a.mastered ? -1 : 1;
                return a.lastAttempt - b.lastAttempt;
              });
            const removeIds = new Set(
              sortedByPriority.slice(0, excess).map((n) => n.questionId)
            );
            return { wrongNotes: updated.filter((n) => !removeIds.has(n.questionId)) };
          }
          return { wrongNotes: updated };
        });
        // Leitner SRS 자동 연동 — 오답 발생 시 복습 큐 편입
        const leitner = useLeitnerStore.getState();
        const existingCard = leitner.cards.find((c) => c.id === question.id);
        if (!existingCard) {
          leitner.addCard({
            id: question.id,
            subjectSlug: question.subject,
            question: question.question,
            answer: String(question.answer),
          });
        } else {
          leitner.answerCard(question.id, false);
        }
      },

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
        get().wrongNotes.filter((n) => n.subject === subject),

      getQuizStats: () => {
        const history = get().quizHistory;
        const total = history.length;
        const correct = history.filter((r) => r.isCorrect).length;
        return { total, correct, rate: total > 0 ? Math.round((correct / total) * 100) : 0 };
      },

      // ── Diagnostic Sessions ─────────────────────────────────────────────

      addDiagnosticSession: (session) =>
        set((state) => {
          const MAX_SESSIONS = 100;
          const updated = [...state.diagnosticSessions, session];
          const evicted = updated.length > MAX_SESSIONS
            ? updated.slice(updated.length - MAX_SESSIONS)
            : updated;
          return { diagnosticSessions: evicted };
        }),

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
          const MAX_FEEDBACKS = 200;
          const updated = [
            ...state.feedbacks,
            { questionId, type, timestamp: new Date().toISOString() },
          ];
          const evicted = updated.length > MAX_FEEDBACKS
            ? updated.slice(updated.length - MAX_FEEDBACKS)
            : updated;
          return { feedbacks: evicted };
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
        set((state) => {
          const MAX_ERROR_REPORTS = 200;
          const updated = [
            ...state.errorReports,
            { questionId, message, timestamp: new Date().toISOString() },
          ];
          const evicted = updated.length > MAX_ERROR_REPORTS
            ? updated.slice(updated.length - MAX_ERROR_REPORTS)
            : updated;
          return { errorReports: evicted };
        }),

      getErrorReports: () => get().errorReports,

      getErrorReportCount: () => get().errorReports.length,
    }),
    {
      name: 'quiz-data',
      version: 5,
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

        if (version < 3) {
          // v2 -> v3: confidence field added to QuizResult (optional, no data migration needed)
        }

        if (version < 4) {
          // v3 -> v4: WrongNote.question (전체 객체) → subject (string)으로 교체
          const wrongNotes = Array.isArray(state.wrongNotes) ? state.wrongNotes : [];
          state = {
            ...state,
            wrongNotes: wrongNotes.map((n: Record<string, unknown>) => ({
              questionId: n.questionId,
              subject: (n.question as Record<string, unknown>)?.subject ?? '',
              userAnswer: n.userAnswer,
              attempts: n.attempts ?? 1,
              lastAttempt: n.lastAttempt ?? Date.now(),
              mastered: n.mastered ?? false,
            })),
          };
        }

        if (version < 5) {
          // v4 -> v5: diagnosticSessions 배열 추가
          state = {
            ...state,
            diagnosticSessions: Array.isArray(state.diagnosticSessions)
              ? state.diagnosticSessions
              : [],
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
