export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { getQuizzesByType, getSubjects } from '@/lib/db';

export const metadata: Metadata = {
  title: '단답형 진단',
  description: '전 과목 단답형 문제 진단 평가',
};

const QuizClient = nextDynamic(
  () => import('../[subject]/QuizClient').then((mod) => ({ default: mod.QuizClient })),
  {
    loading: () => (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
        <div className="h-8 w-48 bg-muted animate-pulse rounded mb-6" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded mb-4" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    ),
  }
);

export default async function ShortQuizPage() {
  const [questions, subjects] = await Promise.all([
    getQuizzesByType('fill_in'),
    getSubjects(),
  ]);

  const chapterMap: Record<string, string> = {};
  const subjectMap: Record<string, string> = {};
  for (const subject of subjects) {
    subjectMap[subject.slug] = subject.title;
    for (const ch of subject.chapters) {
      chapterMap[ch.slug] = ch.title;
    }
  }

  return (
    <QuizClient
      subjectSlug="short"
      subjectTitle="단답형 진단"
      questions={questions}
      chapterMap={chapterMap}
      diagnosticMode={true}
      subjectMap={subjectMap}
    />
  );
}
