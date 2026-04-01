export const dynamic = 'force-dynamic';

import { getSubjects } from '@/lib/db';
import { getQuizzesByType } from '@/lib/db/quiz';
import AddFlashcardClient from './AddFlashcardClient';

export default async function AddFlashcardPage() {
  const [subjects, oxQuizzes, fillInQuizzes] = await Promise.all([
    getSubjects(),
    getQuizzesByType('ox'),
    getQuizzesByType('fill_in'),
  ]);

  const quizzes = [...oxQuizzes, ...fillInQuizzes];

  return <AddFlashcardClient subjects={subjects} quizzes={quizzes} />;
}
