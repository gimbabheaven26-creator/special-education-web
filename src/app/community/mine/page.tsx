import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import type { CommunityQuestion } from '@/types/community';

const TYPE_LABEL: Record<string, string> = {
  multiple: '객관식',
  ox: 'OX',
  fill_in: '빈칸',
  descriptive: '서술형',
};

export default async function MineQuestionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data } = await supabase
    .from('community_questions')
    .select('*, question_votes(count)')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false });

  const questions: CommunityQuestion[] = (data ?? []).map((row) => ({
    id: row.id,
    author_id: row.author_id,
    author_display_name: row.author_display_name,
    question_type: row.question_type,
    question_text: row.question_text,
    options: Array.isArray(row.options) ? row.options : null,
    correct_answer: row.correct_answer,
    explanation: row.explanation,
    subject_id: row.subject_id,
    chapter_id: row.chapter_id,
    status: row.status,
    vote_count: parseInt(row.question_votes?.[0]?.count ?? '0', 10),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/my"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        내 페이지로
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">내 제출 문제</h1>
          <p className="text-sm text-muted-foreground mt-1">
            내가 만든 커뮤니티 문제 {questions.length}개
          </p>
        </div>
        <Link
          href="/community/create"
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          문제 만들기
        </Link>
      </div>

      {questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
          <p className="text-lg font-medium text-muted-foreground">아직 제출한 문제가 없어요</p>
          <Link
            href="/community/create"
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium"
          >
            첫 문제 만들기
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/community/${q.id}`}
              className="block rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                  {TYPE_LABEL[q.question_type] ?? q.question_type}
                </span>
                {q.status === 'official' && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    공식 채택
                  </span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  👍 {q.vote_count}
                </span>
              </div>
              <p className="text-sm font-medium line-clamp-2">{q.question_text}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
