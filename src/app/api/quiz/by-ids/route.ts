import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { getQuizzesByIds } from '@/lib/db/quiz';
import { defaultLimiter, getIp } from '@/lib/rate-limit';

const RequestSchema = z.object({
  ids: z.array(z.string().trim().min(1).max(120)).min(1).max(500),
});

export async function POST(req: NextRequest) {
  if (!defaultLimiter(getIp(req)).allowed) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid ids' }, { status: 400 });
    }

    const ids = Array.from(new Set(parsed.data.ids));
    const quizzes = await getQuizzesByIds(ids);

    return NextResponse.json({ quizzes });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}
