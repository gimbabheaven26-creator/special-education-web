import { createClient } from '@/lib/supabase/server';
import { getConceptsForSubject } from '@/lib/concepts';
import type { Subject } from '@/types/content';
import type { QuizQuestion } from '@/types/quiz';

/** MDX title에서 "과목명 — " 접두어 제거 (예: "진단평가 — 지능 검사" → "지능 검사") */
function stripSubjectPrefix(title: string): string {
  const idx = title.indexOf(' — ');
  return idx > 0 ? title.slice(idx + 3) : title;
}

// ─── Subjects ───

export async function getSubjects(): Promise<Subject[]> {
  const supabase = await createClient();
  const { data: subjectRows, error } = await supabase
    .from('subjects')
    .select('*')
    .order('sort_order');

  if (error || !subjectRows) return [];

  return subjectRows.map((s) => ({
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
}

export async function getSubjectBySlug(slug: string): Promise<Subject | null> {
  const supabase = await createClient();
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
}

// ─── Quiz Questions ───

export async function getQuizzesBySubject(subjectSlug: string): Promise<QuizQuestion[]> {
  const supabase = await createClient();
  // TODO: After REQ-008 (subjects column added), restore multi-tag search:
  // .or(`subject.eq.${subjectSlug},subjects.cs.{"${subjectSlug}"}`)
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .eq('subject', subjectSlug);

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
    .limit(10000);

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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('worksheet_questions')
    .select('*')
    .eq('subject', subject);

  if (error || !data) return [];
  return data as WorksheetQuestionRow[];
}

export async function getWorksheetsByTopic(subject: string, topicId: string): Promise<WorksheetQuestionRow[]> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('worksheet_topics')
    .select('*')
    .eq('subject', subject);

  if (error || !data) return [];
  return data as WorksheetTopicRow[];
}

export async function getAllWorksheetTopics(): Promise<WorksheetTopicRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('worksheet_topics')
    .select('*');

  if (error || !data) return [];
  return data as WorksheetTopicRow[];
}

export async function getWorksheetTopicById(id: string): Promise<WorksheetTopicRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('worksheet_topics')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return data as WorksheetTopicRow;
}

// ─── Quiz by Chapter ───

export async function getQuizzesByChapter(subjectSlug: string, chapterSlug: string): Promise<QuizQuestion[]> {
  const supabase = await createClient();
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
  const supabase = await createClient();
  // Fetch only the subject column — lightweight count aggregation on client side
  // Limit ensures we don't hit PostgREST's 1000-row default ceiling
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('subject')
    .limit(10000);

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
  const supabase = await createClient();
  const sanitized = query.replace(/[%_\\(),."]/g, (c) => `\\${c}`);
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .or(`question.ilike.%${sanitized}%,explanation.ilike.%${sanitized}%`)
    .limit(200);

  if (error || !data) return [];
  return data.map(mapQuizRow);
}

// ─── Auth: Profiles & User Data ───

export interface Profile {
  id: string;
  display_name: string;
  nickname?: string;
  role?: 'admin' | 'user';
  /** Added in migration 20260322000001 — optional until migration applied */
  email?: string;
  avatar_url?: string;
  exam_date?: string | null;
  created_at: string;
  updated_at: string;
}

export type StoreKey = 'study' | 'leitner' | 'quiz' | 'bookmark' | 'onboarding';

export interface UserDataRow {
  id: string;
  user_id: string;
  store_key: StoreKey;
  data: Record<string, unknown>;
  updated_at: string;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !data) return null;
  return data as Profile;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'display_name'>>,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId);
  return !error;
}

export async function getUserData(
  userId: string,
  storeKey: StoreKey,
): Promise<UserDataRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId)
    .eq('store_key', storeKey)
    .single();
  if (error || !data) return null;
  return data as UserDataRow;
}

export async function upsertUserData(
  userId: string,
  storeKey: StoreKey,
  data: Record<string, unknown>,
): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase.from('user_data').upsert(
    {
      user_id: userId,
      store_key: storeKey,
      data,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,store_key' },
  );
  return !error;
}

export async function getAllUserData(userId: string): Promise<UserDataRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_data')
    .select('*')
    .eq('user_id', userId);
  if (error || !data) return [];
  return data as UserDataRow[];
}
