export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { getCachedSubjects, getCachedAllQuizzes } from '@/lib/db';
import { createClient } from '@/lib/supabase/server';
import WrongNotesClient from './WrongNotesClient';

export const metadata: Metadata = {
  title: '오답노트',
  description: '틀린 문제를 모아 반복 학습하고 취약 챕터를 파악하세요.',
};

async function getWrongNoteCounts(): Promise<Record<string, number>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('wrong_note_stats')
      .select('question_id, wrong_count')
      .gt('wrong_count', 0)
      .limit(10000);
    if (error || !data) return {};
    const map: Record<string, number> = {};
    for (const row of data) {
      map[row.question_id] = row.wrong_count;
    }
    return map;
  } catch {
    return {};
  }
}

export default async function WrongNotesPage() {
  const [subjects, quizzes, wrongCounts] = await Promise.all([
    getCachedSubjects(),
    getCachedAllQuizzes(),
    getWrongNoteCounts(),
  ]);

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
      wrongCounts={wrongCounts}
    />
  );
}
