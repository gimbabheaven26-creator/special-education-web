import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StudyProgress } from '@/types/study';

interface StudyStore {
  progresses: StudyProgress[];
  markCompleted: (subjectSlug: string, chapterSlug: string) => void;
  markIncomplete: (subjectSlug: string, chapterSlug: string) => void;
  updateLastVisited: (subjectSlug: string, chapterSlug: string) => void;
  addStudyTime: (subjectSlug: string, chapterSlug: string, seconds: number) => void;
  getSubjectProgress: (subjectSlug: string, totalChapters: number) => number;
  getRecentStudies: (limit: number) => StudyProgress[];
}

export const useStudyStore = create<StudyStore>()(
  persist(
    (set, get) => ({
      progresses: [],

      markCompleted: (subjectSlug, chapterSlug) =>
        set((state) => {
          const existing = state.progresses.find(
            (p) => p.subjectSlug === subjectSlug && p.chapterSlug === chapterSlug
          );
          if (existing) {
            return {
              progresses: state.progresses.map((p) =>
                p.subjectSlug === subjectSlug && p.chapterSlug === chapterSlug
                  ? { ...p, completed: true, lastVisited: Date.now() }
                  : p
              ),
            };
          }
          return {
            progresses: [
              ...state.progresses,
              { subjectSlug, chapterSlug, completed: true, lastVisited: Date.now(), timeSpent: 0 },
            ],
          };
        }),

      markIncomplete: (subjectSlug, chapterSlug) =>
        set((state) => ({
          progresses: state.progresses.map((p) =>
            p.subjectSlug === subjectSlug && p.chapterSlug === chapterSlug
              ? { ...p, completed: false }
              : p
          ),
        })),

      updateLastVisited: (subjectSlug, chapterSlug) =>
        set((state) => {
          const existing = state.progresses.find(
            (p) => p.subjectSlug === subjectSlug && p.chapterSlug === chapterSlug
          );
          if (existing) {
            return {
              progresses: state.progresses.map((p) =>
                p.subjectSlug === subjectSlug && p.chapterSlug === chapterSlug
                  ? { ...p, lastVisited: Date.now() }
                  : p
              ),
            };
          }
          return {
            progresses: [
              ...state.progresses,
              { subjectSlug, chapterSlug, completed: false, lastVisited: Date.now(), timeSpent: 0 },
            ],
          };
        }),

      addStudyTime: (subjectSlug, chapterSlug, seconds) =>
        set((state) => ({
          progresses: state.progresses.map((p) =>
            p.subjectSlug === subjectSlug && p.chapterSlug === chapterSlug
              ? { ...p, timeSpent: p.timeSpent + seconds }
              : p
          ),
        })),

      getSubjectProgress: (subjectSlug, totalChapters) => {
        const completed = get().progresses.filter(
          (p) => p.subjectSlug === subjectSlug && p.completed
        ).length;
        return totalChapters > 0 ? Math.round((completed / totalChapters) * 100) : 0;
      },

      getRecentStudies: (limit) => {
        return [...get().progresses]
          .sort((a, b) => b.lastVisited - a.lastVisited)
          .slice(0, limit);
      },
    }),
    { name: 'study-progress' }
  )
);
