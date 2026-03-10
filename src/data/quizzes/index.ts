import type { QuizQuestion } from '@/types/quiz';
import { introductionQuizzes } from './introduction';
import { behaviorSupportQuizzes } from './behavior-support';
import { curriculumQuizzes } from './curriculum';
import { inclusiveEducationQuizzes } from './inclusive-education';
import { assessmentQuizzes } from './assessment';
import { transitionQuizzes } from './transition';
import { lawsQuizzes } from './laws';

export const quizzesBySubject: Record<string, QuizQuestion[]> = {
  introduction: introductionQuizzes,
  'behavior-support': behaviorSupportQuizzes,
  curriculum: curriculumQuizzes,
  'inclusive-education': inclusiveEducationQuizzes,
  assessment: assessmentQuizzes,
  transition: transitionQuizzes,
  laws: lawsQuizzes,
};

export function getQuizzesBySubject(subjectSlug: string): QuizQuestion[] {
  return quizzesBySubject[subjectSlug] || [];
}
