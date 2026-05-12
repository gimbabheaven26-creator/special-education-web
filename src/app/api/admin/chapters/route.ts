import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';

export async function GET(request: Request) {
  try {
    const auth = await verifyAdminOrApiKey(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');

    if (!subject) {
      return NextResponse.json({ error: 'subject 파라미터가 필요합니다.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('chapters')
      .select('slug, title')
      .eq('subject_slug', subject)
      .order('sort_order');

    if (error) {
      Sentry.captureException(error);
      return NextResponse.json(
        { error: '챕터 목록을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 },
      );
    }

    return NextResponse.json({ chapters: data ?? [] });
  } catch (err) {
    Sentry.captureException(err);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 },
    );
  }
}
