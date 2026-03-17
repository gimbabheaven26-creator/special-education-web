import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCommunityQuestionById, getUserVoteForQuestion } from '@/lib/community-db';
import { getSubjects } from '@/lib/db';
import QuestionDetailClient from './QuestionDetailClient';
import type { CommunityQuestionDetail } from '@/types/community';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CommunityDetailPage({ params }: Props) {
  const { id } = await params;
  const [question, subjects] = await Promise.all([
    getCommunityQuestionById(id),
    getSubjects(),
  ]);
  if (!question) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userVote = user ? await getUserVoteForQuestion(id, user.id) : null;

  const detail: CommunityQuestionDetail = { ...question, user_vote: userVote };
  return (
    <QuestionDetailClient
      question={detail}
      isOwner={user?.id === question.author_id}
      subjects={subjects.map((s) => ({ slug: s.slug, title: s.title }))}
    />
  );
}
