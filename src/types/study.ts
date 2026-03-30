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
  sessionId?: string;
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

// Phase 2: Focus Mode + Daily Missions
export type MissionBlockType = 'wrong-review' | 'flashcard' | 'quiz' | 'term';

export interface MissionBlock {
  id: string;
  type: MissionBlockType;
  label: string;
  description: string;
  count: number;
  estimatedMinutes: number;
  href: string;
  completed: boolean;
}

export interface DailyMission {
  date: string;
  focusSubject: string | null;
  blocks: MissionBlock[];
}
