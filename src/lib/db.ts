import { supabase } from './supabase';
import type { Subject } from '@/types/content';
import type { QuizQuestion } from '@/types/quiz';

// ─── Subjects ───

export async function getSubjects(): Promise<Subject[]> {
  const [subjectsResult, chaptersResult] = await Promise.all([
    supabase.from('subjects').select('*').order('sort_order'),
    supabase.from('chapters').select('*').order('sort_order'),
  ]);

  const { data: subjectRows, error: sErr } = subjectsResult;
  const { data: chapterRows, error: cErr } = chaptersResult;

  if (sErr || !subjectRows || cErr || !chapterRows) return [];

  return subjectRows.map((s) => ({
    slug: s.slug,
    title: s.title,
    description: s.description,
    icon: s.icon,
    color: s.color,
    order: s.sort_order,
    chapters: chapterRows
      .filter((c) => c.subject_slug === s.slug)
      .map((c) => ({
        slug: c.slug,
        title: c.title,
        description: c.description,
        keywords: c.keywords || [],
        order: c.sort_order,
      })),
  }));
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const subjects = await getSubjects();
  return subjects.find((s) => s.slug === slug) || null;
}

// ─── Quiz Questions ───

export async function getQuizzesBySubject(subjectSlug: string): Promise<QuizQuestion[]> {
  // TODO: After REQ-008 (subjects column added), restore multi-tag search:
  // .or(`subject.eq.${subjectSlug},subjects.cs.{"${subjectSlug}"}`)
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('subject', subjectSlug);

  if (error || !data) return [];

  return data.map(mapQuizRow);
}

export async function getAllQuizzes(): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*');

  if (error || !data) return [];

  return data.map(mapQuizRow);
}

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

// ─── Worksheet Questions ───

export interface WorksheetQuestionRow {
  id: string;
  topic_id: string;
  subject: string;
  type: 'fill_in' | 'descriptive';
  difficulty: 1 | 2 | 3;
  question: string;
  answer: string;
  explanation: string;
  source?: string;
  tags?: string[];
}

export async function getWorksheetsBySubject(subject: string): Promise<WorksheetQuestionRow[]> {
  const { data, error } = await supabase
    .from('worksheet_questions')
    .select('*')
    .eq('subject', subject);

  if (error || !data) return [];
  return data as WorksheetQuestionRow[];
}

export async function getWorksheetsByTopic(subject: string, topicId: string): Promise<WorksheetQuestionRow[]> {
  const { data, error } = await supabase
    .from('worksheet_questions')
    .select('*')
    .eq('subject', subject)
    .eq('topic_id', topicId);

  if (error || !data) return [];
  return data as WorksheetQuestionRow[];
}

export interface WorksheetTopicRow {
  id: string;
  subject: string;
  name: string;
}

export async function getWorksheetTopics(subject: string): Promise<WorksheetTopicRow[]> {
  const { data, error } = await supabase
    .from('worksheet_topics')
    .select('*')
    .eq('subject', subject);

  if (error || !data) return [];
  return data as WorksheetTopicRow[];
}

export async function getAllWorksheetTopics(): Promise<WorksheetTopicRow[]> {
  const { data, error } = await supabase
    .from('worksheet_topics')
    .select('*');

  if (error || !data) return [];
  return data as WorksheetTopicRow[];
}

// ─── Reviews ───

export interface ReviewRow {
  id?: number;
  path: string;
  content: string;
  updated_at?: string;
}

export async function getReviews(): Promise<ReviewRow[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error || !data) return [];
  return data as ReviewRow[];
}

export async function saveReview(path: string, content: string): Promise<boolean> {
  if (!content.trim()) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('path', path);
    return !error;
  }

  const { error } = await supabase
    .from('reviews')
    .upsert(
      { path, content: content.trim(), updated_at: new Date().toISOString() },
      { onConflict: 'path' }
    );
  return !error;
}

// ─── Quiz by Chapter ───

export async function getQuizzesByChapter(subjectSlug: string, chapterSlug: string): Promise<QuizQuestion[]> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('subject', subjectSlug)
    .eq('chapter', chapterSlug);

  if (error || !data) return [];
  return data.map(mapQuizRow);
}

// ─── Quiz Count ───

export async function getQuizCount(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('subject');

  if (error || !data) return {};

  const counts: Record<string, number> = {};
  for (const row of data) {
    const s = row.subject as string;
    counts[s] = (counts[s] || 0) + 1;
  }
  return counts;
}

// ─── Search ───

export async function searchQuizzes(query: string): Promise<QuizQuestion[]> {
  const sanitized = query.replace(/[%_\\(),."]/g, (c) => `\\${c}`);
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .or(`question.ilike.%${sanitized}%,explanation.ilike.%${sanitized}%`);

  if (error || !data) return [];
  return data.map(mapQuizRow);
}
