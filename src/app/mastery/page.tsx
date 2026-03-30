export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getSubjects } from '@/lib/db';
import LearningDashboard from './LearningDashboard';

export const metadata: Metadata = {
  title: '학습현황',
  description: '마스터리 트리와 학습 통계를 한눈에 확인하세요.',
};

export default async function MasteryPage() {
  const subjects = await getSubjects();

  const subjectTitleMap: Record<string, string> = {};
  const chapterTitleMap: Record<string, string> = {};
  for (const subject of subjects) {
    subjectTitleMap[subject.slug] = subject.title;
    for (const chapter of subject.chapters) {
      chapterTitleMap[`${subject.slug}::${chapter.slug}`] = chapter.title;
    }
  }

  return (
    <LearningDashboard
      subjectTitleMap={subjectTitleMap}
      chapterTitleMap={chapterTitleMap}
    />
  );
}
