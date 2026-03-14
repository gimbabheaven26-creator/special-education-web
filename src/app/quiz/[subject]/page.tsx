export const dynamic = 'force-dynamic';

import nextDynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { getSubjectBySlug, getQuizzesBySubject } from '@/lib/db';

const QuizClient = nextDynamic(
  () => import('./QuizClient').then((mod) => ({ default: mod.QuizClient })),
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

export default async function SubjectQuizPage({
  params,
}: {
  params: { subject: string };
}) {
  const { subject: subjectSlug } = params;
  const [subject, questions] = await Promise.all([
    getSubjectBySlug(subjectSlug),
    getQuizzesBySubject(subjectSlug),
  ]);

  if (!subject) {
    notFound();
  }

  // Build chapter slug → title map for subtitle display
  const chapterMap: Record<string, string> = {};
  for (const ch of subject.chapters) {
    chapterMap[ch.slug] = ch.title;
  }

  return (
    <QuizClient
      subjectSlug={subjectSlug}
      subjectTitle={subject.title}
      questions={questions}
      chapterMap={chapterMap}
    />
  );
}
