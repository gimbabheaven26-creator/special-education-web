import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

// 인메모리 rate limiter (IP당 분당 30회 — 퀴즈 대량 풀이 대응)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  if (rateLimitMap.size > 1000) {
    rateLimitMap.forEach((v, k) => {
      if (v.resetAt < now) rateLimitMap.delete(k);
    });
  }
  const entry = rateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
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
