export const dynamic = 'force-dynamic';

import { getSubjects } from '@/lib/db';
import WrongNotesQuizClient from './WrongNotesQuizClient';

export default async function WrongNotesQuizPage() {
  const subjects = await getSubjects();

  const subjectTitleMap: Record<string, string> = {};
  const chapterTitleMap: Record<string, string> = {};
  for (const subject of subjects) {
    subjectTitleMap[subject.slug] = subject.title;
    for (const chapter of subject.chapters) {
      chapterTitleMap[`${subject.slug}::${chapter.slug}`] = chapter.title;
    }
  }

  return <WrongNotesQuizClient subjectTitleMap={subjectTitleMap} chapterTitleMap={chapterTitleMap} />;
}
