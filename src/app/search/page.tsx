export const dynamic = 'force-dynamic';

import { getCachedSubjects, getCachedQuizzesForSearch } from '@/lib/db';
import { loadTerms } from '@/lib/content/term-utils';
import { getAvailableExams, getExam } from '@/lib/kice';
import SearchClient from './SearchClient';
import type { TermSearchItem, KiceSearchItem } from './SearchClient';

export default async function SearchPage() {
  const [subjects, quizItems] = await Promise.all([
    getCachedSubjects(),
    getCachedQuizzesForSearch(),
  ]);

  const terms = loadTerms();
  const termItems: TermSearchItem[] = terms.map((t) => ({
    term_ko: t.term_ko,
    term_en: t.term_en,
    definition: t.definition.slice(0, 120),
    subject: t.subject,
  }));

  const entries = getAvailableExams().filter((e) => !e.isIsomorphic);
  const kiceItems: KiceSearchItem[] = [];
  for (const entry of entries) {
    const exam = getExam(entry.year, entry.session);
    if (!exam) continue;
    for (const q of exam.questions) {
      kiceItems.push({
        number: q.number,
        year: entry.year,
        session: entry.session,
        context: q.context.slice(0, 150),
        keywords: q.keywords ?? [],
        subjects: q.subjects ?? [],
        type: q.type,
        points: q.points,
      });
    }
  }

  return (
    <SearchClient
      subjects={subjects}
      quizItems={quizItems}
      termItems={termItems}
      kiceItems={kiceItems}
    />
  );
}
