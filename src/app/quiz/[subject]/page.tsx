export const dynamic = 'force-dynamic';

import nextDynamic from 'next/dynamic';
import { getSubjectBySlug, getQuizzesBySubject } from '@/lib/db';
import Link from 'next/link';

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
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-8 text-center">
        <p className="text-muted-foreground">과목을 찾을 수 없습니다.</p>
        <Link
          href="/quiz"
          className="mt-4 inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-primary text-primary-foreground text-sm font-medium whitespace-nowrap transition-all h-11 gap-1.5 px-2.5"
        >
          돌아가기
        </Link>
      </div>
    );
  }

  // Build chapter slug → title map for subtitle display
  const chapterMap: Record<string, string> = {};
  for (const ch of subject.chapters) {
    chapterMap[ch.slug] = ch.title;
  }

  return (
    <QuizClient
      subjectTitle={subject.title}
      questions={questions}
      chapterMap={chapterMap}
    />
  );
}
