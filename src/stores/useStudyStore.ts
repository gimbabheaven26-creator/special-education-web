import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DailyHistoryEntry } from '@/types/study';
import type { ScenarioProgress, SpacedScenarioSchedule } from '@/types/scenario';
import { XP_PER_QUIZ, XP_PER_CORRECT, XP_PER_CHAPTER } from '@/lib/xp-constants';
import { getKSTDate, getToday } from '@/lib/date-utils';

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

  // Scenario progress
  scenarioProgress: Record<string, ScenarioProgress>;

  // Spaced scenario schedules (by groupId)
  spacedScenarioSchedules: Record<string, SpacedScenarioSchedule>;

}

interface StudyActions {
  recordActivity: (activity: Omit<RecentActivity, 'timestamp'>) => void;
  recordQuizResult: (correct: boolean) => void;
  recordChapterComplete: () => void;
  recordStudyTime: (minutes: number) => void;
  setDailyGoal: (chapters: number, quizzes: number) => void;
  getDailyHistory: (days: number) => DailyHistoryEntry[];
  saveScenarioProgress: (progress: ScenarioProgress) => void;
  saveSpacedSchedule: (schedule: SpacedScenarioSchedule) => void;
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
      scenarioProgress: {},
      spacedScenarioSchedules: {},

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

      saveScenarioProgress: (progress) =>
        set((state) => {
          const existing = state.scenarioProgress[progress.scenarioId];
          // Keep best score
          const shouldUpdate = !existing
            || existing.completedAt == null
            || (progress.totalChoices > 0 &&
                progress.optimalCount / progress.totalChoices >
                  existing.optimalCount / Math.max(existing.totalChoices, 1));

          if (!shouldUpdate) return state;

          return {
            scenarioProgress: {
              ...state.scenarioProgress,
              [progress.scenarioId]: progress,
            },
          };
        }),

      saveSpacedSchedule: (schedule) =>
        set((state) => ({
          spacedScenarioSchedules: {
            ...state.spacedScenarioSchedules,
            [schedule.groupId]: schedule,
          },
        })),

    }),
    {
      name: 'special-edu-study',
      version: 5,
      migrate: (persistedState, version) => {
        let state = persistedState as Record<string, unknown>;

        if (version < 2) {
          state = {
            ...state,
            dailyHistory: Array.isArray(state.dailyHistory) ? state.dailyHistory : [],
          };
        }

        if (version < 3) {
          state = {
            ...state,
            scenarioProgress: state.scenarioProgress ?? {},
          };
        }

        if (version < 4) {
          state = {
            ...state,
            spacedScenarioSchedules: state.spacedScenarioSchedules ?? {},
          };
        }

        return state;
      },
    }
  )
);
