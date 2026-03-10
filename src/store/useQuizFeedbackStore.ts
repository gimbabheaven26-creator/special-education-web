import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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

interface QuizFeedbackStore {
  feedbacks: QuizFeedback[];
  errorReports: QuizErrorReport[];

  addFeedback: (questionId: string, type: 'up' | 'down') => void;
  getFeedback: (questionId: string) => 'up' | 'down' | null;
  getStats: () => { totalUp: number; totalDown: number; feedbacks: QuizFeedback[] };

  addErrorReport: (questionId: string, message: string) => void;
  getErrorReports: () => QuizErrorReport[];
  getErrorReportCount: () => number;
}

export const useQuizFeedbackStore = create<QuizFeedbackStore>()(
  persist(
    (set, get) => ({
      feedbacks: [],
      errorReports: [],

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
    { name: 'quiz-feedback' }
  )
);
