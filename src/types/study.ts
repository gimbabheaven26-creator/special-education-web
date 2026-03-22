export interface StudyProgress {
  subjectSlug: string;
  chapterSlug: string;
  completed: boolean;
  lastVisited: number;
  timeSpent: number;
}

export interface Bookmark {
  id: string;
  path: string;
  title: string;
  subject: string;
  createdAt: number;
}

export interface WrongNote {
  questionId: string;
  subject: string;
  chapter?: string;
  question?: import('./quiz').QuizQuestion | null;
  userAnswer: string | number;
  attempts: number;
  lastAttempt: number;
  mastered: boolean;
}

export interface DailyHistoryEntry {
  date: string;              // 'YYYY-MM-DD'
  questionsAttempted: number;
  questionsCorrect: number;
  xpEarned: number;
  studyTimeMinutes?: number; // 자동 추적된 학습 시간 (분)
}

export interface DailyGoal {
  date: string;
  targetChapters: number;
  completedChapters: number;
  targetQuizzes: number;
  completedQuizzes: number;
  studyTime: number;
  actualTime: number;
}
