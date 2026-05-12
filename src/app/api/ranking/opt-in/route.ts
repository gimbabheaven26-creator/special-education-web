import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { updateRankingOptIn } from '@/lib/db/profile';
import { mutationLimiter, getIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  if (!mutationLimiter(getIp(req)).allowed) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }
  try {
    const body = await req.json();
    const show = body?.show === true;
    const { error } = await updateRankingOptIn(show);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, show_in_ranking: show });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
}
