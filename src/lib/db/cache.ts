import { unstable_cache } from 'next/cache';
import { createAnonClient } from '@/lib/supabase/server';
import { getConceptsForSubject } from '@/lib/content/concepts';
import type { Subject } from '@/types/content';
import type { QuizQuestion, QuizType } from '@/types/quiz';
import type { WorksheetTopicRow } from './worksheets';

function stripSubjectPrefix(title: string): string {
  const idx = title.indexOf(' — ');
  return idx > 0 ? title.slice(idx + 3) : title;
}

const PUBLISHED_STATUS = ['human', 'approved'] as const;

function mapQuizRow(row: Record<string, unknown>): QuizQuestion {
  return {
    id: row.id as string,
    subject: row.subject as string,
    chapter: row.chapter as string,
    type: row.type as QuizQuestion['type'],
    question: row.question as string,
    caseContext: (row.case_context as string) || undefined,
    options: (row.options as string[]) || undefined,
    answer: row.answer as string,
    explanation: row.explanation as string,
    wrongExplanations: (row.wrong_explanations as Record<string, string>) || undefined,
    difficulty: row.difficulty as 1 | 2 | 3,
    source: (row.source as string) || undefined,
    tags: (row.tags as QuizQuestion['tags']) || undefined,
    subQuestions: (row.sub_questions as QuizQuestion['subQuestions']) || undefined,
    imageUrl: (row.image_url as string) || undefined,
    subjects: (row.subjects as string[]) || undefined,
  };
}

// ─── Subjects (revalidate: 1h) ───────────────────────────────

export const getCachedSubjects = unstable_cache(
  async (): Promise<Subject[]> => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('sort_order');

    if (error || !data) return [];

    return data.map((s) => ({
      slug: s.slug,
      title: s.title,
      description: s.description,
      icon: s.icon,
      color: s.color,
      order: s.sort_order,
      chapters: getConceptsForSubject(s.slug).map((c) => ({
        slug: c.slug,
        title: stripSubjectPrefix(c.title),
        description: c.description,
        keywords: c.kiceKeywords,
        order: c.order,
      })),
    }));
  },
  ['subjects-all'],
  { revalidate: 3600, tags: ['subjects'] },
);

export const getCachedSubjectBySlug = unstable_cache(
  async (slug: string): Promise<Subject | null> => {
    const supabase = createAnonClient();
    const { data: s, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !s) return null;

    return {
      slug: s.slug,
      title: s.title,
      description: s.description,
      icon: s.icon,
      color: s.color,
      order: s.sort_order,
      chapters: getConceptsForSubject(s.slug).map((c) => ({
        slug: c.slug,
        title: stripSubjectPrefix(c.title),
        description: c.description,
        keywords: c.kiceKeywords,
        order: c.order,
      })),
    };
  },
  ['subject-by-slug'],
  { revalidate: 3600, tags: ['subjects'] },
);

// ─── Quizzes (revalidate: 10m) ──────────────────────────────

export const getCachedQuizzesBySubject = unstable_cache(
  async (subjectSlug: string): Promise<QuizQuestion[]> => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .or(`subject.eq.${subjectSlug},subjects.cs.{"${subjectSlug}"}`)
      .in('ai_status', PUBLISHED_STATUS);

    if (error || !data) return [];
    return data.map(mapQuizRow);
  },
  ['quizzes-by-subject'],
  { revalidate: 600, tags: ['quizzes'] },
);

export const getCachedQuizzesByType = unstable_cache(
  async (type: QuizType): Promise<QuizQuestion[]> => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .eq('type', type)
      .in('ai_status', PUBLISHED_STATUS)
      .limit(10000);

    if (error || !data) return [];
    return data.map(mapQuizRow);
  },
  ['quizzes-by-type'],
  { revalidate: 600, tags: ['quizzes'] },
);

export const getCachedAllQuizzes = unstable_cache(
  async (): Promise<QuizQuestion[]> => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .in('ai_status', PUBLISHED_STATUS)
      .limit(10000);

    if (error || !data) return [];
    return data.map(mapQuizRow);
  },
  ['quizzes-all'],
  { revalidate: 600, tags: ['quizzes'] },
);

export const getCachedQuizzesForSearch = unstable_cache(
  async () => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('question, explanation, subject, tags')
      .in('ai_status', PUBLISHED_STATUS)
      .limit(10000);

    if (error || !data) return [];

    return data.map((row) => ({
      question: row.question as string,
      explanation: ((row.explanation as string) ?? '').slice(0, 120),
      subject: row.subject as string,
      disability: (row.tags as Record<string, unknown> | null)?.disability as string | undefined,
    }));
  },
  ['quizzes-for-search'],
  { revalidate: 600, tags: ['quizzes'] },
);

// ─── Worksheets (revalidate: 1h) ────────────────────────────

export const getCachedAllWorksheetTopics = unstable_cache(
  async (): Promise<WorksheetTopicRow[]> => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('worksheet_topics')
      .select('*');

    if (error || !data) return [];
    return data as WorksheetTopicRow[];
  },
  ['worksheet-topics-all'],
  { revalidate: 3600, tags: ['worksheets'] },
);

export const getCachedWorksheetQuestionCounts = unstable_cache(
  async (): Promise<Record<string, number>> => {
    const supabase = createAnonClient();
    const { data, error } = await supabase
      .from('worksheet_questions')
      .select('topic_id');

    if (error || !data) return {};
    const counts: Record<string, number> = {};
    data.forEach((row) => {
      counts[row.topic_id] = (counts[row.topic_id] ?? 0) + 1;
    });
    return counts;
  },
  ['worksheet-question-counts'],
  { revalidate: 3600, tags: ['worksheets'] },
);
