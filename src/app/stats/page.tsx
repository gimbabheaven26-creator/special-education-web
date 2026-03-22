export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getSubjects } from '@/lib/db';

export const metadata: Metadata = {
  title: '학습 통계',
  description: '일일 학습량, 정답률, 취약 과목 등 학습 데이터를 시각화합니다.',
};
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
