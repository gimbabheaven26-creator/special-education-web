import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getMyProfile, upsertNickname } from '@/lib/db/profile';
import { mutationLimiter, getIp } from '@/lib/rate-limit';

export async function GET() {
  try {
    const profile = await getMyProfile();
    if (!profile) {
      return NextResponse.json({ profile: null }, { status: 401 });
    }
    return NextResponse.json({ profile });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: '프로필 조회 중 오류가 발생했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!mutationLimiter(getIp(request)).allowed) {
      return NextResponse.json({ error: 'too many requests' }, { status: 429 });
    }
    const body = await request.json();
    const nickname = typeof body.nickname === 'string' ? body.nickname : '';
    const { error } = await upsertNickname(nickname);
    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json({ error: '프로필 업데이트 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
