import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getQuizzesByIds } from '@/lib/db/quiz';
import { defaultLimiter, getIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  if (!defaultLimiter(getIp(req)).allowed) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const ids: unknown = body?.ids;

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids required (string[])' }, { status: 400 });
  }

  if (ids.length > 500) {
    return NextResponse.json({ error: 'max 500 ids per request' }, { status: 400 });
  }

  const valid = ids.filter((id): id is string => typeof id === 'string');
  if (valid.length === 0) {
    return NextResponse.json({ error: 'ids must be strings' }, { status: 400 });
  }

  try {
    const quizzes = await getQuizzesByIds(valid);
    return NextResponse.json({ quizzes });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}
