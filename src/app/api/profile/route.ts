import { NextResponse } from 'next/server';
import { getMyProfile, upsertNickname } from '@/lib/db/profile';
import { mutationLimiter, getIp } from '@/lib/rate-limit';

export async function GET() {
  const profile = await getMyProfile();
  if (!profile) {
    return NextResponse.json({ profile: null }, { status: 401 });
  }
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
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
}
