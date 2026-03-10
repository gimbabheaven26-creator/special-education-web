import type { QuizQuestion } from '@/types/quiz';
import { introductionQuizzes } from './introduction';
import { behaviorSupportQuizzes } from './behavior-support';

export const quizzesBySubject: Record<string, QuizQuestion[]> = {
  introduction: introductionQuizzes,
  'behavior-support': behaviorSupportQuizzes,
};

export function getQuizzesBySubject(subjectSlug: string): QuizQuestion[] {
  return quizzesBySubject[subjectSlug] || [];
}
