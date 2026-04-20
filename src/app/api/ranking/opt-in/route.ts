import { NextRequest, NextResponse } from 'next/server';
import { updateRankingOptIn } from '@/lib/db/profile';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const show = body?.show === true;
    const { error } = await updateRankingOptIn(show);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, show_in_ranking: show });
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
}
