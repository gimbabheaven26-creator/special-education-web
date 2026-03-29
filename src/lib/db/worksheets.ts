import { createClient } from '@/lib/supabase/server';

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

/** Returns question count per topic_id: { [topicId]: count } */
export async function getWorksheetQuestionCounts(): Promise<Record<string, number>> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('worksheet_questions')
    .select('topic_id');

  if (error || !data) return {};
  const counts: Record<string, number> = {};
  for (const row of data) {
    counts[row.topic_id] = (counts[row.topic_id] ?? 0) + 1;
  }
  return counts;
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
