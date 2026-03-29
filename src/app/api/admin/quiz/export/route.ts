import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';

interface QuizRow {
  id: string;
  subject: string;
  chapter: string;
  type: string;
  question: string;
  case_context: string | null;
  options: string[] | null;
  answer: string;
  explanation: string;
  wrong_explanations: Record<string, string> | null;
  difficulty: string;
  source: string | null;
  tags: string[] | null;
  sub_questions: unknown[] | null;
  image_url: string | null;
}

const PAGE_SIZE = 1000;

async function fetchAllRows(supabase: Awaited<ReturnType<typeof createClient>>, subject?: string) {
  const rows: QuizRow[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    let query = supabase
      .from('quiz_questions')
      .select('id, subject, chapter, type, question, case_context, options, answer, explanation, wrong_explanations, difficulty, source, tags, sub_questions, image_url')
      .range(from, from + PAGE_SIZE - 1)
      .order('id');

    if (subject) {
      query = query.eq('subject', subject);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`데이터 조회 실패: ${error.message}`);
    }

    const fetched = (data ?? []) as QuizRow[];
    rows.push(...fetched);

    hasMore = fetched.length === PAGE_SIZE;
    from += PAGE_SIZE;
  }

  return rows;
}

function toJSON(rows: QuizRow[]) {
  return rows.map((r) => ({
    id: r.id,
    subject: r.subject,
    chapter: r.chapter,
    type: r.type,
    difficulty: r.difficulty,
    question: r.question,
    caseContext: r.case_context,
    options: r.options,
    answer: r.answer,
    explanation: r.explanation,
    wrongExplanations: r.wrong_explanations,
    source: r.source,
    tags: r.tags,
    subQuestions: r.sub_questions,
    imageUrl: r.image_url,
  }));
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function toCSV(rows: QuizRow[]): string {
  const headers = [
    'id', 'subject', 'chapter', 'type', 'difficulty',
    'question', 'answer', 'explanation', 'options',
    'caseContext', 'wrongExplanations', 'source', 'tags',
  ];

  const lines = [headers.join(',')];

  for (const r of rows) {
    const fields = [
      r.id,
      r.subject,
      r.chapter,
      r.type,
      r.difficulty,
      r.question,
      r.answer,
      r.explanation,
      r.options ? JSON.stringify(r.options) : '',
      r.case_context ?? '',
      r.wrong_explanations ? JSON.stringify(r.wrong_explanations) : '',
      r.source ?? '',
      r.tags ? JSON.stringify(r.tags) : '',
    ];
    lines.push(fields.map((f) => escapeCsvField(String(f))).join(','));
  }

  return lines.join('\n');
}

export async function GET(request: Request) {
  const auth = await verifyAdminOrApiKey(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') ?? 'json';
    const subject = searchParams.get('subject') ?? undefined;

    if (format !== 'json' && format !== 'csv') {
      return NextResponse.json({ error: 'format은 json 또는 csv만 가능합니다' }, { status: 400 });
    }

    const supabase = await createClient();
    const rows = await fetchAllRows(supabase, subject);

    if (format === 'csv') {
      const csv = toCSV(rows);
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="quiz_questions.csv"',
        },
      });
    }

    return NextResponse.json({
      success: true,
      count: rows.length,
      questions: toJSON(rows),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : '내보내기 처리 실패';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
