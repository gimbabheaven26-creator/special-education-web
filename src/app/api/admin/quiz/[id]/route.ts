import { NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';

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

    const input = body as Record<string, unknown>;

    // camelCase → snake_case 변환 (전달된 필드만 업데이트)
    const updateData: Record<string, unknown> = {};

    const directFields = [
      'type', 'question', 'answer', 'subject', 'chapter',
      'explanation', 'difficulty', 'options',
    ] as const;
    for (const field of directFields) {
      if (field in input) {
        updateData[field] = input[field];
      }
    }

    // snake_case 매핑이 필요한 필드
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
        updateData[dbKey] = input[inputKey];
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
  } catch {
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
      .delete()
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
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
