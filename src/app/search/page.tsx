export const dynamic = 'force-dynamic';

import { getSubjects, getAllQuizzes } from '@/lib/db';
import { loadTerms } from '@/lib/content/term-utils';
import SearchClient from './SearchClient';
import type { QuizSearchItem, TermSearchItem } from './SearchClient';

export default async function SearchPage() {
  const [subjects, quizzes] = await Promise.all([
    getSubjects(),
    getAllQuizzes(),
  ]);

  const quizItems: QuizSearchItem[] = quizzes.map((q) => ({
    question: q.question,
    explanation: q.explanation.slice(0, 120),
    subject: q.subject,
    disability: q.tags?.disability,
  }));

  const terms = loadTerms();
  const termItems: TermSearchItem[] = terms.map((t) => ({
    term_ko: t.term_ko,
    term_en: t.term_en,
    definition: t.definition.slice(0, 120),
    subject: t.subject,
  }));

  return <SearchClient subjects={subjects} quizItems={quizItems} termItems={termItems} />;
}
