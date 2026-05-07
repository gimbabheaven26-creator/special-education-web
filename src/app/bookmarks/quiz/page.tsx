export const dynamic = 'force-dynamic';

import { getCachedSubjects, getCachedAllQuizzes } from '@/lib/db';
import BookmarkQuizClient from './BookmarkQuizClient';

export default async function BookmarkQuizPage() {
  const [subjects, quizzes] = await Promise.all([getCachedSubjects(), getCachedAllQuizzes()]);

  const subjectTitleMap: Record<string, string> = {};
  const chapterTitleMap: Record<string, string> = {};
  for (const subject of subjects) {
    subjectTitleMap[subject.slug] = subject.title;
    for (const chapter of subject.chapters) {
      chapterTitleMap[`${subject.slug}::${chapter.slug}`] = chapter.title;
    }
  }

  return (
    <BookmarkQuizClient
      subjectTitleMap={subjectTitleMap}
      chapterTitleMap={chapterTitleMap}
      allQuestions={quizzes}
    />
  );
}
