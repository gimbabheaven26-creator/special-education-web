import type { QuizQuestion } from '@/types/quiz';
import { introductionQuizzes } from './introduction';
import { behaviorSupportQuizzes } from './behavior-support';
import { curriculumQuizzes } from './curriculum';
import { inclusiveEducationQuizzes } from './inclusive-education';
import { assessmentQuizzes } from './assessment';
import { transitionQuizzes } from './transition';
import { lawsQuizzes } from './laws';
import { visualImpairmentQuizzes } from './visual-impairment';
import { hearingImpairmentQuizzes } from './hearing-impairment';
import { physicalDisabilityQuizzes } from './physical-disability';
import { communicationDisorderQuizzes } from './communication-disorder';

export const quizzesBySubject: Record<string, QuizQuestion[]> = {
  introduction: introductionQuizzes,
  'behavior-support': behaviorSupportQuizzes,
  curriculum: curriculumQuizzes,
  'inclusive-education': inclusiveEducationQuizzes,
  assessment: assessmentQuizzes,
  transition: transitionQuizzes,
  laws: lawsQuizzes,
  'visual-impairment': visualImpairmentQuizzes,
  'hearing-impairment': hearingImpairmentQuizzes,
  'physical-disability': physicalDisabilityQuizzes,
  'communication-disorder': communicationDisorderQuizzes,
};

export function getQuizzesBySubject(subjectSlug: string): QuizQuestion[] {
  return quizzesBySubject[subjectSlug] || [];
}
