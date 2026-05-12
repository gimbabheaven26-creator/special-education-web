import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: questionId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const reason = typeof (body as Record<string, unknown>).reason === 'string'
    ? ((body as Record<string, unknown>).reason as string).trim()
    : '';

  const { error } = await supabase.from('question_reports').insert({
    question_id: questionId,
    reporter_id: user.id,
    reason: reason || '신고',
  });

  if (error) {
    Sentry.captureException(error);
  }

  return NextResponse.json({ ok: true });
}
