import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getQuizzesByChapter } from '@/lib/db/quiz';
import { defaultLimiter, getIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  if (!defaultLimiter(getIp(req)).allowed) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const chapters: unknown = body?.chapters;

  if (!Array.isArray(chapters) || chapters.length === 0) {
    return NextResponse.json({ error: 'chapters required ([{subject, chapter}])' }, { status: 400 });
  }

  if (chapters.length > 50) {
    return NextResponse.json({ error: 'max 50 chapters per request' }, { status: 400 });
  }

  const valid = chapters.filter(
    (c): c is { subject: string; chapter: string } =>
      typeof c === 'object' && c !== null && typeof c.subject === 'string' && typeof c.chapter === 'string',
  );
  if (valid.length === 0) {
    return NextResponse.json({ error: 'chapters must be {subject, chapter} objects' }, { status: 400 });
  }

  try {
    const results = await Promise.all(
      valid.map((c) => getQuizzesByChapter(c.subject, c.chapter)),
    );
    const quizzes = results.flat();

    return NextResponse.json({ quizzes });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}
