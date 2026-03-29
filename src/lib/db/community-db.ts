import { createClient } from '@/lib/supabase/server';
import type {
  CommunityQuestion,
  CreateQuestionInput,
  VoteType,
} from '@/types/community';

// ─── Internal ───

interface RawRow {
  id: string;
  author_id: string;
  author_display_name: string;
  question_type: string;
  question_text: string;
  options: unknown;
  correct_answer: string;
  explanation: string;
  subject_id: string;
  chapter_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  question_votes: { count: string }[];
}

function mapRow(row: RawRow): CommunityQuestion {
  return {
    id: row.id,
    author_id: row.author_id,
    author_display_name: row.author_display_name,
    question_type: row.question_type as CommunityQuestion['question_type'],
    question_text: row.question_text,
    options: Array.isArray(row.options) ? (row.options as string[]) : null,
    correct_answer: row.correct_answer,
    explanation: row.explanation,
    subject_id: row.subject_id,
    chapter_id: row.chapter_id,
    status: row.status as CommunityQuestion['status'],
    vote_count: parseInt(row.question_votes?.[0]?.count ?? '0', 10),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

// ─── Public ───

export async function getCommunityQuestions(opts: {
  subjectId?: string;
  sort?: 'latest' | 'votes';
} = {}): Promise<CommunityQuestion[]> {
  const supabase = await createClient();
  let query = supabase
    .from('community_questions')
    .select('*, question_votes(count)')
    .order('created_at', { ascending: false });

  if (opts.subjectId) {
    query = query.eq('subject_id', opts.subjectId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const result = (data as RawRow[]).map(mapRow);
  if (opts.sort === 'votes') {
    result.sort((a, b) => b.vote_count - a.vote_count);
  }
  return result;
}

export async function getCommunityQuestionById(
  id: string,
): Promise<CommunityQuestion | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('community_questions')
    .select('*, question_votes(count)')
    .eq('id', id)
    .single();
  if (error || !data) return null;
  return mapRow(data as RawRow);
}

export async function getUserVoteForQuestion(
  questionId: string,
  userId: string,
): Promise<VoteType | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('question_votes')
    .select('vote_type')
    .eq('question_id', questionId)
    .eq('user_id', userId)
    .single();
  return (data?.vote_type as VoteType | null) ?? null;
}

export async function createCommunityQuestion(
  input: CreateQuestionInput,
  userId: string,
  authorDisplayName: string,
): Promise<{ id: string } | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('community_questions')
    .insert({
      author_id: userId,
      author_display_name: authorDisplayName,
      question_type: input.question_type,
      question_text: input.question_text,
      options: input.options,
      correct_answer: input.correct_answer,
      explanation: input.explanation,
      subject_id: input.subject_id,
      chapter_id: input.chapter_id,
    })
    .select('id')
    .single();
  if (error || !data) return null;
  return { id: (data as { id: string }).id };
}

export async function setVote(
  questionId: string,
  userId: string,
  voteType: VoteType | null,
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  if (voteType === null) {
    const { error } = await supabase
      .from('question_votes')
      .delete()
      .eq('question_id', questionId)
      .eq('user_id', userId);
    return { error: error?.message ?? null };
  }
  const { error } = await supabase.from('question_votes').upsert(
    { question_id: questionId, user_id: userId, vote_type: voteType },
    { onConflict: 'question_id,user_id' },
  );
  return { error: error?.message ?? null };
}
