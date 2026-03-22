import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getKSTDate } from '@/lib/date-utils';

export type StudyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface WeeklyMilestone {
  weekNumber: number;
  subjects: string[];
  quizTarget: number;
  chapterTarget: number;
  label: string;
}

export interface StudyPlan {
  createdAt: string;
  examDate: string;
  level: StudyLevel;
  weakSubjects: string[];
  targetSubjects: string[];
  weeklyMilestones: WeeklyMilestone[];
  dailyQuizTarget: number;
  dailyChapterTarget: number;
  dailyQuestionsTarget: number;
}

interface OnboardingState {
  isOnboarded: boolean;
  examDate: string | null;
  studyLevel: StudyLevel | null;
  weakSubjects: string[];
  targetSubjects: string[];
  dailyQuestionsTarget: number;
  studyPlan: StudyPlan | null;
}

interface OnboardingActions {
  setExamDate: (date: string) => void;
  setStudyLevel: (level: StudyLevel) => void;
  setWeakSubjects: (subjects: string[]) => void;
  setTargetSubjects: (subjects: string[]) => void;
  setDailyQuestionsTarget: (count: number) => void;
  completeOnboarding: (plan: StudyPlan) => void;
  resetOnboarding: () => void;
  getDday: () => number | null;
}


export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      isOnboarded: false,
      examDate: null,
      studyLevel: null,
      weakSubjects: [],
      targetSubjects: [],
      dailyQuestionsTarget: 20,
      studyPlan: null,

      setExamDate: (date) =>
        set(() => ({ examDate: date })),

      setStudyLevel: (level) =>
        set(() => ({ studyLevel: level })),

      setWeakSubjects: (subjects) =>
        set(() => ({ weakSubjects: [...subjects] })),

      setTargetSubjects: (subjects) =>
        set(() => ({ targetSubjects: [...subjects] })),

      setDailyQuestionsTarget: (count) =>
        set(() => ({ dailyQuestionsTarget: count })),

      completeOnboarding: (plan) =>
        set(() => ({
          isOnboarded: true,
          examDate: plan.examDate,
          studyLevel: plan.level,
          weakSubjects: [...plan.weakSubjects],
          targetSubjects: [...plan.targetSubjects],
          dailyQuestionsTarget: plan.dailyQuestionsTarget,
          studyPlan: plan,
        })),

      resetOnboarding: () =>
        set(() => ({
          isOnboarded: false,
          examDate: null,
          studyLevel: null,
          weakSubjects: [],
          targetSubjects: [],
          dailyQuestionsTarget: 20,
          studyPlan: null,
        })),

      getDday: () => {
        const { examDate } = get();
        if (!examDate) return null;
        const today = new Date(getKSTDate() + 'T00:00:00+09:00');
        const exam = new Date(examDate + 'T00:00:00+09:00');
        const diffMs = exam.getTime() - today.getTime();
        return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      },
    }),
    {
      name: 'special-edu-onboarding',
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        if (version === 1) {
          const s = persistedState as Partial<OnboardingState>;
          return { ...s, targetSubjects: [], dailyQuestionsTarget: 20 };
        }
        return persistedState as OnboardingState;
      },
    }
  )
);
