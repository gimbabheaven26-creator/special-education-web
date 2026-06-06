import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createServiceClient } from '@/lib/supabase/server';
import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';
import { validateBatchQuality } from '@/lib/quiz/quiz-quality';
import { findDuplicates } from '@/lib/quiz/duplicate-detector';

export async function GET(request: Request) {
  const auth = await verifyAdminOrApiKey(request);
  if (!auth.authorized) {
    return NextResponse.json({ error: '관리자 권한이 필요합니다' }, { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const { data: questions, error } = await supabase
      .from('quiz_questions')
      .select('id, subject, chapter, type, question, answer, explanation, difficulty, options, case_context, sub_questions')
      .limit(10000);

    if (error) {
      return NextResponse.json({ error: '퀴즈 조회 실패' }, { status: 500 });
    }

    const quizzes = questions ?? [];

    const byType: Record<string, number> = {};
    const bySubject: Record<string, number> = {};
    for (const q of quizzes) {
      byType[q.type] = (byType[q.type] ?? 0) + 1;
      bySubject[q.subject] = (bySubject[q.subject] ?? 0) + 1;
    }

    const batchResult = validateBatchQuality(quizzes);

    const qualityIssues: Record<string, number> = {
      missingExplanation: 0,
      shortExplanation: 0,
      invalidOxAnswer: 0,
      missingOptions: 0,
      invalidSubject: 0,
    };

    const samples: Record<string, Array<Record<string, unknown>>> = {
      invalidOxAnswer: [],
      missingOptions: [],
    };

    for (const d of batchResult.details) {
      for (const e of d.errors) {
        if (e.includes('O/X')) {
          qualityIssues.invalidOxAnswer++;
          if (samples.invalidOxAnswer.length < 5) {
            samples.invalidOxAnswer.push({ id: d.id });
          }
        }
        if (e.includes('options 4개')) {
          qualityIssues.missingOptions++;
          if (samples.missingOptions.length < 5) {
            samples.missingOptions.push({ id: d.id });
          }
        }
        if (e.includes('subject')) qualityIssues.invalidSubject++;
      }
      for (const w of d.warnings) {
        if (w.includes('explanation 누락')) qualityIssues.missingExplanation++;
        if (w.includes('짧음')) qualityIssues.shortExplanation++;
      }
    }

    const url = new URL(request.url);
    const checkDuplicates = url.searchParams.get('duplicates') === 'true';
    let duplicatePairs: ReturnType<typeof findDuplicates> = [];

    if (checkDuplicates) {
      duplicatePairs = findDuplicates(
        quizzes.map((q) => ({ id: q.id, question: q.question })),
      );
    }
    qualityIssues.duplicatePairs = duplicatePairs.length;

    return NextResponse.json({
      total: quizzes.length,
      byType,
      bySubject,
      qualityIssues,
      validation: {
        valid: batchResult.valid,
        invalid: batchResult.invalid,
        errorCount: batchResult.errorCount,
        warningCount: batchResult.warningCount,
      },
      samples: {
        ...samples,
        duplicatePairs: duplicatePairs.slice(0, 10),
      },
    });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: '서버 오류' }, { status: 500 });
  }
}
