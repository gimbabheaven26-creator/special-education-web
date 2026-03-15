import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyHistoryEntry } from '@/types/study';
import { XP_PER_QUIZ, XP_PER_CORRECT, XP_PER_CHAPTER } from '@/lib/xp-constants';

interface RecentActivity {
  subjectSlug: string;
  subjectTitle: string;
  chapterSlug: string;
  chapterTitle: string;
  timestamp: number;
}

interface DailyProgress {
  date: string;
  chaptersCompleted: number;
  quizzesCompleted: number;
  quizzesCorrect: number;
}

interface StudyState {
  // Streak
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;

  // Daily progress
  dailyProgress: DailyProgress;
  dailyGoal: {
    chapters: number;
    quizzes: number;
  };

  // Recent activity
  recentActivities: RecentActivity[];

  // Total stats
  totalXP: number;
  totalQuizzes: number;
  totalCorrect: number;

  // Daily history for statistics
  dailyHistory: DailyHistoryEntry[];
}

interface StudyActions {
  recordActivity: (activity: Omit<RecentActivity, 'timestamp'>) => void;
  recordQuizResult: (correct: boolean) => void;
  recordChapterComplete: () => void;
  recordStudyTime: (minutes: number) => void;
  setDailyGoal: (chapters: number, quizzes: number) => void;
  getDailyHistory: (days: number) => DailyHistoryEntry[];
}

function getKSTDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
}

function getToday(): string {
  return getKSTDate();
}

function isYesterday(dateStr: string): boolean {
  const today = getKSTDate();
  const todayDate = new Date(today + 'T00:00:00+09:00');
  const yesterday = new Date(todayDate.getTime() - 86400000);
  const yesterdayStr = getKSTDate(yesterday);
  return dateStr === yesterdayStr;
}

function ensureTodayProgress(state: StudyState): DailyProgress {
  const today = getToday();
  if (state.dailyProgress.date === today) {
    return state.dailyProgress;
  }
  return { date: today, chaptersCompleted: 0, quizzesCompleted: 0, quizzesCorrect: 0 };
}

function updateStreak(state: StudyState): Pick<StudyState, 'currentStreak' | 'longestStreak' | 'lastActiveDate'> {
  const today = getToday();

  if (state.lastActiveDate === today) {
    return {
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak,
      lastActiveDate: state.lastActiveDate,
    };
  }

  const newStreak = state.lastActiveDate && isYesterday(state.lastActiveDate)
    ? state.currentStreak + 1
    : 1;

  return {
    currentStreak: newStreak,
    longestStreak: Math.max(newStreak, state.longestStreak),
    lastActiveDate: today,
  };
}

export const useStudyStore = create<StudyState & StudyActions>()(
  persist(
    (set, get) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      dailyProgress: { date: getToday(), chaptersCompleted: 0, quizzesCompleted: 0, quizzesCorrect: 0 },
      dailyGoal: { chapters: 2, quizzes: 10 },
      recentActivities: [],
      totalXP: 0,
      totalQuizzes: 0,
      totalCorrect: 0,
      dailyHistory: [],

      recordActivity: (activity) =>
        set((state) => {
          const streakUpdate = updateStreak(state);
          const newActivity: RecentActivity = { ...activity, timestamp: Date.now() };
          const existing = state.recentActivities.filter(
            (a) => !(a.subjectSlug === activity.subjectSlug && a.chapterSlug === activity.chapterSlug)
          );

          return {
            ...streakUpdate,
            recentActivities: [newActivity, ...existing].slice(0, 5),
          };
        }),

      recordQuizResult: (correct) =>
        set((state) => {
          const streakUpdate = updateStreak(state);
          const dailyProgress = ensureTodayProgress(state);
          const xpEarned = XP_PER_QUIZ + (correct ? XP_PER_CORRECT : 0);

          // Update dailyHistory
          const today = getToday();
          const existingIndex = state.dailyHistory.findIndex((e) => e.date === today);
          const MAX_DAILY_HISTORY = 365;

          let updatedHistory: DailyHistoryEntry[];
          if (existingIndex >= 0) {
            const existing = state.dailyHistory[existingIndex];
            updatedHistory = state.dailyHistory.map((entry, i) =>
              i === existingIndex
                ? {
                    ...existing,
                    questionsAttempted: existing.questionsAttempted + 1,
                    questionsCorrect: existing.questionsCorrect + (correct ? 1 : 0),
                    xpEarned: existing.xpEarned + xpEarned,
                  }
                : entry
            );
          } else {
            updatedHistory = [
              ...state.dailyHistory,
              {
                date: today,
                questionsAttempted: 1,
                questionsCorrect: correct ? 1 : 0,
                xpEarned,
              },
            ];
          }

          // Cap at MAX_DAILY_HISTORY (evict oldest)
          const cappedHistory = updatedHistory.length > MAX_DAILY_HISTORY
            ? updatedHistory.slice(updatedHistory.length - MAX_DAILY_HISTORY)
            : updatedHistory;

          return {
            ...streakUpdate,
            dailyProgress: {
              ...dailyProgress,
              quizzesCompleted: dailyProgress.quizzesCompleted + 1,
              quizzesCorrect: dailyProgress.quizzesCorrect + (correct ? 1 : 0),
            },
            totalXP: state.totalXP + xpEarned,
            totalQuizzes: state.totalQuizzes + 1,
            totalCorrect: state.totalCorrect + (correct ? 1 : 0),
            dailyHistory: cappedHistory,
          };
        }),

      recordChapterComplete: () =>
        set((state) => {
          const streakUpdate = updateStreak(state);
          const dailyProgress = ensureTodayProgress(state);

          return {
            ...streakUpdate,
            dailyProgress: {
              ...dailyProgress,
              chaptersCompleted: dailyProgress.chaptersCompleted + 1,
            },
            totalXP: state.totalXP + XP_PER_CHAPTER,
          };
        }),

      recordStudyTime: (minutes) =>
        set((state) => {
          if (minutes <= 0) return state;
          const today = getToday();
          const existingIndex = state.dailyHistory.findIndex((e) => e.date === today);

          let updatedHistory: DailyHistoryEntry[];
          if (existingIndex >= 0) {
            const existing = state.dailyHistory[existingIndex];
            updatedHistory = state.dailyHistory.map((entry, i) =>
              i === existingIndex
                ? { ...existing, studyTimeMinutes: (existing.studyTimeMinutes ?? 0) + minutes }
                : entry,
            );
          } else {
            updatedHistory = [
              ...state.dailyHistory,
              { date: today, questionsAttempted: 0, questionsCorrect: 0, xpEarned: 0, studyTimeMinutes: minutes },
            ];
          }

          return { dailyHistory: updatedHistory };
        }),

      getDailyHistory: (days) => {
        const history = get().dailyHistory;
        if (days <= 0) return [];
        return history.slice(-days);
      },

      setDailyGoal: (chapters, quizzes) =>
        set(() => ({
          dailyGoal: {
            chapters: Math.max(1, Math.round(chapters)),
            quizzes: Math.max(1, Math.round(quizzes)),
          },
        })),
    }),
    {
      name: 'special-edu-study',
      version: 2,
      migrate: (persistedState, version) => {
        let state = persistedState as Record<string, unknown>;

        // Cascading migrations: each step falls through to the next
        if (version < 2) {
          // v0/v1 -> v2: add dailyHistory array
          state = {
            ...state,
            dailyHistory: Array.isArray(state.dailyHistory) ? state.dailyHistory : [],
          };
        }

        return state;
      },
    }
  )
);
