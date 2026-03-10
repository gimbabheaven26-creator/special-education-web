import type { QuizQuestion } from './quiz';

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
  question: QuizQuestion;
  userAnswer: string | number;
  attempts: number;
  lastAttempt: number;
  mastered: boolean;
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
