import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';

const SubQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.enum(['fill_in', 'descriptive']),
  answer: z.string(),
  explanation: z.string().optional(),
});

const PostSchema = z.object({
  type: z.string().min(1, 'type은 필수입니다.'),
  question: z.string().min(1, 'question은 필수입니다.'),
  answer: z.string().min(1, 'answer는 필수입니다.'),
  subject: z.string().min(1, 'subject는 필수입니다.'),
  chapter: z.string().min(1, 'chapter는 필수입니다.'),
  id: z.string().min(1).optional(),
  explanation: z.string().nullish(),
  difficulty: z.number().min(1).max(3).nullish(),
  options: z.array(z.string()).nullish(),
  case_context: z.string().nullish(),
  caseContext: z.string().nullish(),
  wrong_explanations: z.record(z.string()).nullish(),
  wrongExplanations: z.record(z.string()).nullish(),
  sub_questions: z.array(SubQuestionSchema).nullish(),
  subQuestions: z.array(SubQuestionSchema).nullish(),
  image_url: z.string().nullish(),
  imageUrl: z.string().nullish(),
  subjects: z.array(z.string()).nullish(),
  ai_status: z.enum(['human', 'draft', 'approved', 'rejected']).default('human'),
  ai_generated_at: z.string().nullish(),
  source_kice_ref: z.string().nullish(),
});

const PatchSchema = z.object({
  id: z.string().min(1, 'id는 필수입니다.'),
  ai_status: z.enum(['approved', 'rejected'], {
    errorMap: () => ({ message: 'ai_status는 approved 또는 rejected만 가능합니다.' }),
  }),
});

export async function GET(request: Request) {
  try {
    const auth = await verifyAdminOrApiKey(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 50));
    const subject = searchParams.get('subject');
    const chapter = searchParams.get('chapter');
    const type = searchParams.get('type');
    const difficulty = searchParams.get('difficulty');
    const search = searchParams.get('search');
    const aiStatus = searchParams.get('ai_status');

    const offset = (page - 1) * limit;

    const supabase = auth.isApiKey ? createServiceClient() : await createClient();
    let query = supabase
      .from('quiz_questions')
      .select('*', { count: 'exact' });

    if (subject) {
      query = query.eq('subject', subject);
    }
    if (chapter) {
      query = query.eq('chapter', chapter);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (difficulty) {
      query = query.eq('difficulty', difficulty);
    }
    if (search) {
      query = query.ilike('question', `%${search}%`);
    }
    if (aiStatus) {
      query = query.eq('ai_status', aiStatus);
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json(
        { error: '문제 목록을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 },
      );
    }

    const total = count ?? 0;
    return NextResponse.json({
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyAdminOrApiKey(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
    }

    const parsed = PostSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? '입력값이 올바르지 않습니다.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const input = parsed.data;
    const id = input.id ?? `${input.subject}-${input.chapter}-${Date.now().toString(36)}`;

    const insertData: Record<string, unknown> = {
      id,
      type: input.type,
      question: input.question,
      answer: input.answer,
      subject: input.subject,
      chapter: input.chapter,
      explanation: input.explanation ?? null,
      difficulty: input.difficulty ?? null,
      options: input.options ?? null,
      case_context: input.caseContext ?? input.case_context ?? null,
      wrong_explanations: input.wrongExplanations ?? input.wrong_explanations ?? null,
      sub_questions: input.subQuestions ?? input.sub_questions ?? null,
      image_url: input.imageUrl ?? input.image_url ?? null,
      subjects: input.subjects ?? null,
      ai_status: input.ai_status,
      ai_generated_at: input.ai_generated_at ?? null,
      source_kice_ref: input.source_kice_ref ?? null,
    };

    const supabase = auth.isApiKey ? createServiceClient() : await createClient();

    const searchPrefix = input.question.slice(0, 40);
    const { data: similar } = await supabase
      .from('quiz_questions')
      .select('id, question')
      .eq('subject', input.subject)
      .ilike('question', `%${searchPrefix}%`)
      .limit(3);
    const duplicates = (similar ?? []).map(s => s.id);

    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json(
        { error: '문제 생성 중 오류가 발생했습니다.', detail: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { ...data, ...(duplicates.length > 0 ? { duplicateWarning: duplicates } : {}) },
      { status: 201 },
    );
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await verifyAdminOrApiKey(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
    }

    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message ?? '입력값이 올바르지 않습니다.';
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { id, ai_status: patchStatus } = parsed.data;

    const supabase = auth.isApiKey ? createServiceClient() : await createClient();
    const { data, error } = await supabase
      .from('quiz_questions')
      .update({ ai_status: patchStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json(
        { error: '상태 변경 중 오류가 발생했습니다.', detail: error.message },
        { status: 500 },
      );
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
