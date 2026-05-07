import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { createCommunityQuestion } from '@/lib/db/community-db';
import type { CreateQuestionInput } from '@/types/community';

export async function POST(request: Request) {
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

  const input = body as Record<string, unknown>;
  const ALLOWED_TYPES = ['multiple', 'ox', 'fill_in', 'descriptive'];

  if (!ALLOWED_TYPES.includes(String(input.question_type ?? ''))) {
    return NextResponse.json({ error: '유효하지 않은 문제 유형입니다.' }, { status: 400 });
  }
  if (!input.question_text || typeof input.question_text !== 'string' || !input.question_text.trim()) {
    return NextResponse.json({ error: '문제 본문을 입력하세요.' }, { status: 400 });
  }
  if ((input.question_text as string).length > 2000) {
    return NextResponse.json({ error: '문제 본문은 2,000자 이하로 입력하세요.' }, { status: 400 });
  }
  if (typeof input.explanation === 'string' && input.explanation.length > 3000) {
    return NextResponse.json({ error: '해설은 3,000자 이하로 입력하세요.' }, { status: 400 });
  }
  if (!input.correct_answer || typeof input.correct_answer !== 'string') {
    return NextResponse.json({ error: '정답을 입력하세요.' }, { status: 400 });
  }
  if (!input.subject_id || typeof input.subject_id !== 'string') {
    return NextResponse.json({ error: '과목을 선택하세요.' }, { status: 400 });
  }

  // 표시명 조회: nickname → display_name → email prefix
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, nickname')
    .eq('id', user.id)
    .single();
  type ProfileRow = { display_name?: string; nickname?: string } | null;
  const authorDisplayName =
    (profile as ProfileRow)?.nickname ||
    (profile as ProfileRow)?.display_name ||
    user.email?.split('@')[0] ||
    '익명';

  const questionInput: CreateQuestionInput = {
    question_type: input.question_type as CreateQuestionInput['question_type'],
    question_text: (input.question_text as string).trim(),
    options: Array.isArray(input.options) ? (input.options as string[]) : null,
    correct_answer: (input.correct_answer as string).trim(),
    explanation: typeof input.explanation === 'string' ? input.explanation.trim() : '',
    subject_id: (input.subject_id as string).trim(),
    chapter_id:
      typeof input.chapter_id === 'string' ? input.chapter_id.trim() || null : null,
  };

  const result = await createCommunityQuestion(questionInput, user.id, authorDisplayName);
  if (!result) {
    Sentry.captureMessage('community: createCommunityQuestion returned null', 'error');
    return NextResponse.json({ error: '문제 저장 중 오류가 발생했습니다.' }, { status: 500 });
  }
  return NextResponse.json({ id: result.id }, { status: 201 });
}
