import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { z } from 'zod';
import { getQuizzesByChapters } from '@/lib/db/quiz';
import { defaultLimiter, getIp } from '@/lib/rate-limit';

const slugPattern = /^[A-Za-z0-9가-힣ㄱ-ㅎㅏ-ㅣ-]+$/;

const ChapterSchema = z.object({
  subject: z.string().trim().min(1).max(120).regex(slugPattern),
  chapter: z.string().trim().min(1).max(120).regex(slugPattern),
});

const RequestSchema = z.object({
  chapters: z.array(ChapterSchema).min(1).max(50),
});

export async function POST(req: NextRequest) {
  if (!defaultLimiter(getIp(req)).allowed) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid chapters' }, { status: 400 });
    }

    const seen = new Set<string>();
    const chapters = parsed.data.chapters.filter(({ subject, chapter }) => {
      const key = `${subject}::${chapter}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    const quizzes = await getQuizzesByChapters(chapters);

    return NextResponse.json({ quizzes });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 });
  }
}
