export const dynamic = 'force-dynamic';

import { getSubjects, getAllQuizzes } from '@/lib/db';
import SearchClient from './SearchClient';
import type { QuizSearchItem } from './SearchClient';

export default async function SearchPage() {
  const [subjects, quizzes] = await Promise.all([
    getSubjects(),
    getAllQuizzes(),
  ]);

  // Only send fields needed for search indexing (reduces RSC payload)
  const quizItems: QuizSearchItem[] = quizzes.map((q) => ({
    question: q.question,
    explanation: q.explanation.slice(0, 120),
    subject: q.subject,
    disability: q.tags?.disability,
  }));

  return <SearchClient subjects={subjects} quizItems={quizItems} />;
}
