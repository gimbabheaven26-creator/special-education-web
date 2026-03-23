import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminOrApiKey } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const auth = await verifyAdminOrApiKey(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 401 });
  }

  try {
    const { questions } = await request.json();

    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: '문항 배열이 필요합니다' }, { status: 400 });
    }

    if (questions.length > 500) {
      return NextResponse.json({ error: '최대 500건까지 처리 가능합니다' }, { status: 400 });
    }

    const supabase = await createClient();

    // Convert camelCase to snake_case for DB
    const rows = questions.map((q: Record<string, unknown>) => ({
      id: q.id,
      subject: q.subject,
      chapter: q.chapter,
      type: q.type,
      question: q.question,
      case_context: q.caseContext ?? q.case_context ?? null,
      options: q.options ?? null,
      answer: q.answer,
      explanation: q.explanation,
      wrong_explanations: q.wrongExplanations ?? q.wrong_explanations ?? null,
      difficulty: q.difficulty,
      source: q.source ?? null,
      tags: q.tags ?? null,
      sub_questions: q.subQuestions ?? q.sub_questions ?? null,
      image_url: q.imageUrl ?? q.image_url ?? null,
      updated_by: auth.userId,
    }));

    // Batch upsert in chunks of 50
    const results: { id: string }[] = [];
    for (let i = 0; i < rows.length; i += 50) {
      const chunk = rows.slice(i, i + 50);
      const { data, error } = await supabase
        .from('quiz_questions')
        .upsert(chunk, { onConflict: 'id' })
        .select('id');

      if (error) {
        return NextResponse.json({
          error: `배치 ${Math.floor(i / 50) + 1} 처리 실패: ${error.message}`,
          processed: results.length,
        }, { status: 500 });
      }
      results.push(...(data ?? []));
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
    });
  } catch {
    return NextResponse.json({ error: '요청 처리 실패' }, { status: 500 });
  }
}
