export const dynamic = 'force-dynamic';

import { getSubjects } from '@/lib/db';
import StatsClient from './StatsClient';

export default async function StatsPage() {
  const subjects = await getSubjects();

  // Build slug → title maps for display
  const subjectTitleMap: Record<string, string> = {};
  const chapterTitleMap: Record<string, string> = {};
  for (const subject of subjects) {
    subjectTitleMap[subject.slug] = subject.title;
    for (const chapter of subject.chapters) {
      chapterTitleMap[`${subject.slug}::${chapter.slug}`] = chapter.title;
    }
  }

  return <StatsClient subjectTitleMap={subjectTitleMap} chapterTitleMap={chapterTitleMap} />;
}
