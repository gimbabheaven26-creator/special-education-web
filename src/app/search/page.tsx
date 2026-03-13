export const dynamic = 'force-dynamic';

import { getSubjects, getAllQuizzes } from '@/lib/db';
import SearchClient from './SearchClient';

export default async function SearchPage() {
  const [subjects, quizzes] = await Promise.all([
    getSubjects(),
    getAllQuizzes(),
  ]);

  return <SearchClient subjects={subjects} quizzes={quizzes} />;
}
