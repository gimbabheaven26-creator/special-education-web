import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuizQuestion, QuizResult } from '@/types/quiz';
import type { WrongNote } from '@/types/study';

interface QuizStore {
  wrongNotes: WrongNote[];
  quizHistory: QuizResult[];
  addWrongNote: (question: QuizQuestion, userAnswer: string | number) => void;
  markMastered: (questionId: string) => void;
  removeWrongNote: (questionId: string) => void;
  addQuizResult: (result: QuizResult) => void;
  getWrongNotesBySubject: (subject: string) => WrongNote[];
  getQuizStats: () => { total: number; correct: number; rate: number };
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      wrongNotes: [],
      quizHistory: [],

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

      removeWrongNote: (questionId) =>
        set((state) => ({
          wrongNotes: state.wrongNotes.filter((n) => n.questionId !== questionId),
        })),

      addQuizResult: (result) =>
        set((state) => ({
          quizHistory: [...state.quizHistory, result],
        })),

      getWrongNotesBySubject: (subject) =>
        get().wrongNotes.filter((n) => n.question.subject === subject),

      getQuizStats: () => {
        const history = get().quizHistory;
        const total = history.length;
        const correct = history.filter((r) => r.isCorrect).length;
        return { total, correct, rate: total > 0 ? Math.round((correct / total) * 100) : 0 };
      },
    }),
    { name: 'quiz-data' }
  )
);
