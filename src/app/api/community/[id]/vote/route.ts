import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { setVote } from '@/lib/db/community-db';
import type { VoteType } from '@/types/community';

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: Params) {
  const { id: questionId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  // 본인 문제 투표 차단
  const { data: question } = await supabase
    .from('community_questions')
    .select('author_id')
    .eq('id', questionId)
    .single();
  if (!question) {
    return NextResponse.json({ error: '문제를 찾을 수 없습니다.' }, { status: 404 });
  }
  if ((question as { author_id: string }).author_id === user.id) {
    return NextResponse.json(
      { error: '본인 문제에는 투표할 수 없습니다.' },
      { status: 403 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const voteType = (body as Record<string, unknown>).vote_type as VoteType | null;
  const { error } = await setVote(questionId, user.id, voteType ?? null);
  if (error) {
    Sentry.captureMessage(`community vote failed: ${error}`, 'error');
    return NextResponse.json({ error }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
