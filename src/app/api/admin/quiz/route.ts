import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
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

    const offset = (page - 1) * limit;

    const supabase = await createClient();
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

    // camelCase → snake_case 변환
    const insertData: Record<string, unknown> = {
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
    };

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: '문제 생성 중 오류가 발생했습니다.' },
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
