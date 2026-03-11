import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

interface StudyActions {
  recordActivity: (activity: Omit<RecentActivity, 'timestamp'>) => void;
  recordQuizResult: (correct: boolean) => void;
  recordChapterComplete: () => void;
  setDailyGoal: (chapters: number, quizzes: number) => void;
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

const XP_PER_QUIZ = 10;
const XP_PER_CORRECT = 5;
const XP_PER_CHAPTER = 20;

export const useStudyStore = create<StudyState & StudyActions>()(
  persist(
    (set) => ({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      dailyProgress: { date: getToday(), chaptersCompleted: 0, quizzesCompleted: 0, quizzesCorrect: 0 },
      dailyGoal: { chapters: 2, quizzes: 10 },
      recentActivities: [],
      totalXP: 0,
      totalQuizzes: 0,
      totalCorrect: 0,

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

          return {
            ...streakUpdate,
            dailyProgress: {
              ...dailyProgress,
              quizzesCompleted: dailyProgress.quizzesCompleted + 1,
              quizzesCorrect: dailyProgress.quizzesCorrect + (correct ? 1 : 0),
            },
            totalXP: state.totalXP + XP_PER_QUIZ + (correct ? XP_PER_CORRECT : 0),
            totalQuizzes: state.totalQuizzes + 1,
            totalCorrect: state.totalCorrect + (correct ? 1 : 0),
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
      version: 1,
    }
  )
);
