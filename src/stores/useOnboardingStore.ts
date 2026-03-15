import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
  weeklyMilestones: WeeklyMilestone[];
  dailyQuizTarget: number;
  dailyChapterTarget: number;
}

interface OnboardingState {
  isOnboarded: boolean;
  examDate: string | null;
  studyLevel: StudyLevel | null;
  weakSubjects: string[];
  studyPlan: StudyPlan | null;
}

interface OnboardingActions {
  setExamDate: (date: string) => void;
  setStudyLevel: (level: StudyLevel) => void;
  setWeakSubjects: (subjects: string[]) => void;
  completeOnboarding: (plan: StudyPlan) => void;
  resetOnboarding: () => void;
  getDday: () => number | null;
}

function getKSTDate(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(date);
}

export const useOnboardingStore = create<OnboardingState & OnboardingActions>()(
  persist(
    (set, get) => ({
      isOnboarded: false,
      examDate: null,
      studyLevel: null,
      weakSubjects: [],
      studyPlan: null,

      setExamDate: (date) =>
        set(() => ({ examDate: date })),

      setStudyLevel: (level) =>
        set(() => ({ studyLevel: level })),

      setWeakSubjects: (subjects) =>
        set(() => ({ weakSubjects: [...subjects] })),

      completeOnboarding: (plan) =>
        set(() => ({
          isOnboarded: true,
          examDate: plan.examDate,
          studyLevel: plan.level,
          weakSubjects: [...plan.weakSubjects],
          studyPlan: plan,
        })),

      resetOnboarding: () =>
        set(() => ({
          isOnboarded: false,
          examDate: null,
          studyLevel: null,
          weakSubjects: [],
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
      version: 1,
    }
  )
);
