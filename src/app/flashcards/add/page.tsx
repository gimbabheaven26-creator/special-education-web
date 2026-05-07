export const dynamic = 'force-dynamic';

import { getCachedSubjects, getCachedQuizzesByType } from '@/lib/db';
import AddFlashcardClient from './AddFlashcardClient';

export default async function AddFlashcardPage() {
  const [subjects, oxQuizzes, fillInQuizzes] = await Promise.all([
    getCachedSubjects(),
    getCachedQuizzesByType('ox'),
    getCachedQuizzesByType('fill_in'),
  ]);

  const quizzes = [...oxQuizzes, ...fillInQuizzes];

  return <AddFlashcardClient subjects={subjects} quizzes={quizzes} />;
}
