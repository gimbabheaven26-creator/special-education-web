export const dynamic = 'force-dynamic';

import { Metadata } from 'next';
import nextDynamic from 'next/dynamic';
import { getQuizzesByType, getSubjects } from '@/lib/db';

export const metadata: Metadata = {
  title: 'OX 퀴즈',
  description: '전 과목 OX 문제 모아 풀기',
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

export default async function OxQuizPage() {
  const [questions, subjects] = await Promise.all([
    getQuizzesByType('ox'),
    getSubjects(),
  ]);

  const chapterMap: Record<string, string> = {};
  for (const subject of subjects) {
    for (const ch of subject.chapters) {
      chapterMap[ch.slug] = ch.title;
    }
  }

  return (
    <QuizClient
      subjectSlug="ox"
      subjectTitle="OX 퀴즈"
      questions={questions}
      chapterMap={chapterMap}
    />
  );
}
