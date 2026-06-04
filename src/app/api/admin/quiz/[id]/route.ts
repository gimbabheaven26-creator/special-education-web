import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';

const QuizPatchSchema = z.object({
  type: z.enum(['ox', 'fill_in', 'multiple', 'descriptive', 'scenario_composite', 'case', 'multiple_choice']).optional(),
  question: z.string().min(1).max(5000).optional(),
  answer: z.union([z.string(), z.number(), z.boolean()]).optional(),
  subject: z.string().min(1).max(100).optional(),
  chapter: z.string().min(1).max(200).optional(),
  explanation: z.string().max(5000).optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  options: z.array(z.string()).optional(),
  caseContext: z.string().max(5000).optional(),
  case_context: z.string().max(5000).optional(),
  wrongExplanations: z.record(z.string(), z.string()).optional(),
  wrong_explanations: z.record(z.string(), z.string()).optional(),
  subQuestions: z.array(z.object({}).passthrough()).optional(),
  sub_questions: z.array(z.object({}).passthrough()).optional(),
  imageUrl: z.string().url().optional(),
  image_url: z.string().url().optional(),
  subjects: z.array(z.string()).optional(),
}).strict();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAdminOrApiKey(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
    }

    const parsed = QuizPatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '입력 검증 실패', details: parsed.error.issues },
        { status: 400 },
      );
    }
    const input = parsed.data;

    const updateData: Record<string, unknown> = {};

    const directFields = [
      'type', 'question', 'answer', 'subject', 'chapter',
      'explanation', 'difficulty', 'options',
    ] as const;
    for (const field of directFields) {
      if (field in input) {
        updateData[field] = input[field as keyof typeof input];
      }
    }

    const mappedFields: Record<string, string> = {
      caseContext: 'case_context',
      case_context: 'case_context',
      wrongExplanations: 'wrong_explanations',
      wrong_explanations: 'wrong_explanations',
      subQuestions: 'sub_questions',
      sub_questions: 'sub_questions',
      imageUrl: 'image_url',
      image_url: 'image_url',
      subjects: 'subjects',
    };

    for (const [inputKey, dbKey] of Object.entries(mappedFields)) {
      if (inputKey in input) {
        updateData[dbKey] = input[inputKey as keyof typeof input];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: '업데이트할 필드가 없습니다.' }, { status: 400 });
    }

    const supabase = auth.isApiKey ? createServiceClient() : await createClient();
    const { data, error } = await supabase
      .from('quiz_questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '문제 수정 중 오류가 발생했습니다.' },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json({ error: '문제를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await verifyAdminOrApiKey(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
    }

    const { id } = await params;

    const supabase = auth.isApiKey ? createServiceClient() : await createClient();
    const { error, count } = await supabase
      .from('quiz_questions')
      .delete({ count: 'exact' })
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: '문제 삭제 중 오류가 발생했습니다.' },
        { status: 500 },
      );
    }

    if (count === 0) {
      return NextResponse.json({ error: '문제를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
