export const dynamic = 'force-dynamic';

import { getSubjects } from '@/lib/db';
import StatsClient from './StatsClient';

export default async function StatsPage() {
  const subjects = await getSubjects();

  // Build chapter slug → title map for display
  const chapterTitleMap: Record<string, string> = {};
  for (const subject of subjects) {
    for (const chapter of subject.chapters) {
      chapterTitleMap[`${subject.slug}::${chapter.slug}`] = chapter.title;
    }
  }

  return <StatsClient chapterTitleMap={chapterTitleMap} />;
}
