import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';
import { validateQuizQuality } from '@/lib/quiz/quiz-quality';

const BulkQuizItemSchema = z.object({
  id: z.string().uuid().optional(),
  subject: z.string().min(1, '과목 필수'),
  chapter: z.string().min(1, '챕터 필수'),
  type: z.enum(['ox', 'fill_in', 'multiple', 'descriptive', 'scenario_composite', 'case', 'multiple_choice']),
  question: z.string().min(1, '문제 내용 필수'),
  answer: z.union([z.string(), z.number(), z.boolean()]),
  explanation: z.string().optional(),
  difficulty: z.number().int().min(1).max(5).optional(),
  options: z.array(z.string()).nullable().optional(),
  caseContext: z.string().optional(),
  case_context: z.string().optional(),
  wrongExplanations: z.record(z.string(), z.string()).nullable().optional(),
  wrong_explanations: z.record(z.string(), z.string()).nullable().optional(),
  subQuestions: z.array(z.object({}).passthrough()).nullable().optional(),
  sub_questions: z.array(z.object({}).passthrough()).nullable().optional(),
  imageUrl: z.string().optional(),
  image_url: z.string().optional(),
  source: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
});

const BulkRequestSchema = z.object({
  questions: z.array(BulkQuizItemSchema).min(1, '문항 배열이 필요합니다').max(500, '최대 500건까지 처리 가능합니다'),
});

export async function POST(request: Request) {
  const auth = await verifyAdminOrApiKey(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 401 });
  }

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: '잘못된 요청 형식입니다' }, { status: 400 });
    }

    const parsed = BulkRequestSchema.safeParse(body);
    if (!parsed.success) {
      const issuesByIndex: Record<number, z.ZodIssue[]> = {};
      for (const issue of parsed.error.issues) {
        const idx = typeof issue.path[1] === 'number' ? issue.path[1] : -1;
        (issuesByIndex[idx] ??= []).push(issue);
      }
      return NextResponse.json(
        { error: '입력 검증 실패', details: parsed.error.issues, issuesByIndex },
        { status: 400 },
      );
    }

    const { questions } = parsed.data;
    const supabase = await createClient();

    const accepted: typeof questions = [];
    const warnings: Array<{ index: number; id: string; issues: string[] }> = [];
    let rejected = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const quality = validateQuizQuality({
        ...q,
        case_context: q.caseContext ?? q.case_context ?? undefined,
        sub_questions: q.subQuestions ?? q.sub_questions ?? undefined,
      });

      if (!quality.isValid) {
        rejected++;
        warnings.push({ index: i, id: q.id ?? `(index ${i})`, issues: quality.errors });
      } else {
        if (quality.warnings.length > 0) {
          warnings.push({ index: i, id: q.id ?? `(index ${i})`, issues: quality.warnings });
        }
        accepted.push(q);
      }
    }

    const rows = accepted.map((q) => ({
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
      rejected,
      warnings: warnings.length > 0 ? warnings : undefined,
    });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: '요청 처리 실패' }, { status: 500 });
  }
}
