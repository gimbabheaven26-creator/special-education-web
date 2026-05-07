import { createClient } from '@/lib/supabase/server';
import type { QuizQuestion, QuizType } from '@/types/quiz';

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

export async function getQuizzesBySubject(subjectSlug: string): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  // REQ-008: subjects 컬럼 추가 완료 — 주영역 + 복합태그 검색
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .or(`subject.eq.${subjectSlug},subjects.cs.{"${subjectSlug}"}`)
    .in('ai_status', PUBLISHED_STATUS);

  if (error || !data) return [];

  return data.map(mapQuizRow);
}

export async function getQuizzesByIds(ids: string[]): Promise<QuizQuestion[]> {
  if (ids.length === 0) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .in('id', ids)
    .in('ai_status', PUBLISHED_STATUS)
    .limit(500);
  if (error || !data) return [];
  return data.map(mapQuizRow);
}

export async function getAllQuizzes(): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  // Supabase/PostgREST default row limit is 1000 — override to fetch full dataset
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .in('ai_status', PUBLISHED_STATUS)
    .limit(10000);

  if (error || !data) return [];

  return data.map(mapQuizRow);
}

export async function getQuizzesForSearch() {
  const supabase = await createClient();
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
}

export async function getQuizzesByType(type: QuizType): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('type', type)
    .in('ai_status', PUBLISHED_STATUS)
    .limit(10000);
  if (error || !data) return [];
  return data.map(mapQuizRow);
}

export async function getQuizzesByChapter(subjectSlug: string, chapterSlug: string): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('subject', subjectSlug)
    .eq('chapter', chapterSlug)
    .in('ai_status', PUBLISHED_STATUS);

  if (error || !data) return [];
  return data.map(mapQuizRow);
}

export async function getQuizCount(): Promise<Record<string, number>> {
  const supabase = await createClient();
  // Fetch only the subject column — lightweight count aggregation on client side
  // Limit ensures we don't hit PostgREST's 1000-row default ceiling
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('subject')
    .in('ai_status', PUBLISHED_STATUS)
    .limit(10000);

  if (error || !data) return {};

  const counts: Record<string, number> = {};
  for (const row of data) {
    const s = row.subject as string;
    counts[s] = (counts[s] || 0) + 1;
  }
  return counts;
}

export async function searchQuizzes(query: string): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  const sanitized = query.replace(/[%_\\(),."]/g, (c) => `\\${c}`);
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .or(`question.ilike.%${sanitized}%,explanation.ilike.%${sanitized}%`)
    .in('ai_status', PUBLISHED_STATUS)
    .limit(200);

  if (error || !data) return [];
  return data.map(mapQuizRow);
}
