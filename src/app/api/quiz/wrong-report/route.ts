import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { wrongReportLimiter, getIp } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!wrongReportLimiter(ip).allowed) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const questionId = typeof body?.questionId === 'string' ? body.questionId.trim() : '';
    if (!questionId || questionId.length > 100) {
      return NextResponse.json({ error: 'invalid questionId' }, { status: 400 });
    }

    const supabase = createServiceClient();
    const { error } = await supabase.rpc('increment_wrong_count', {
      qid: questionId,
    });

    if (error) {
      // RPC가 없으면 직접 upsert fallback
      const { error: upsertError } = await supabase
        .from('wrong_note_stats')
        .upsert(
          { question_id: questionId, wrong_count: 1, updated_at: new Date().toISOString() },
          { onConflict: 'question_id' },
        );

      if (upsertError) {
        return NextResponse.json({ error: 'failed to record' }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 });
  }
}
