import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';

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
  } catch {
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

    const input = body as Record<string, unknown>;

    // 필수 필드 검증
    const requiredFields = ['type', 'question', 'answer', 'subject', 'chapter'] as const;
    for (const field of requiredFields) {
      if (!input[field] || typeof input[field] !== 'string') {
        return NextResponse.json(
          { error: `${field} 필드는 필수입니다.` },
          { status: 400 },
        );
      }
    }

    // ID 생성: {subject}-{chapter}-{timestamp} 패턴
    const id =
      typeof input.id === 'string' && input.id
        ? input.id
        : `${input.subject}-${input.chapter}-${Date.now().toString(36)}`;

    // ai_status 검증
    const VALID_AI_STATUS = ['human', 'draft', 'approved', 'rejected'] as const;
    const rawAiStatus = input.ai_status as string | undefined;
    const aiStatus2 = rawAiStatus && VALID_AI_STATUS.includes(rawAiStatus as typeof VALID_AI_STATUS[number])
      ? rawAiStatus
      : 'human';

    // camelCase → snake_case 변환
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
      ai_status: aiStatus2,
      ai_generated_at: input.ai_generated_at ?? null,
    };

    const supabase = auth.isApiKey ? createServiceClient() : await createClient();
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '문제 생성 중 오류가 발생했습니다.', detail: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
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

    const input = body as Record<string, unknown>;
    const id = input.id;
    const patchStatus = input.ai_status;

    if (typeof id !== 'string' || !id) {
      return NextResponse.json({ error: 'id 필드는 필수입니다.' }, { status: 400 });
    }

    const VALID_PATCH_STATUS = ['approved', 'rejected'] as const;
    if (typeof patchStatus !== 'string' || !VALID_PATCH_STATUS.includes(patchStatus as typeof VALID_PATCH_STATUS[number])) {
      return NextResponse.json({ error: 'ai_status는 approved 또는 rejected만 가능합니다.' }, { status: 400 });
    }

    const supabase = auth.isApiKey ? createServiceClient() : await createClient();
    const { data, error } = await supabase
      .from('quiz_questions')
      .update({ ai_status: patchStatus })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '상태 변경 중 오류가 발생했습니다.', detail: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
