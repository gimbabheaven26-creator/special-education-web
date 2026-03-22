export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getSubjects, getAllQuizzes } from '@/lib/db';
import WrongNotesClient from './WrongNotesClient';

export const metadata: Metadata = {
  title: '오답노트',
  description: '틀린 문제를 모아 반복 학습하고 취약 챕터를 파악하세요.',
};

export default async function WrongNotesPage() {
  const [subjects, quizzes] = await Promise.all([getSubjects(), getAllQuizzes()]);

  const subjectTitleMap: Record<string, string> = {};
  const chapterTitleMap: Record<string, string> = {};
  for (const subject of subjects) {
    subjectTitleMap[subject.slug] = subject.title;
    for (const chapter of subject.chapters) {
      chapterTitleMap[`${subject.slug}::${chapter.slug}`] = chapter.title;
    }
  }

  return (
    <WrongNotesClient
      subjectTitleMap={subjectTitleMap}
      chapterTitleMap={chapterTitleMap}
      allQuestions={quizzes}
    />
  );
}
