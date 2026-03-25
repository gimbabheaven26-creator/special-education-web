import { NextRequest, NextResponse } from 'next/server';

const MAX_MSG = 500;
const MIN_MSG = 5;
const VALID_TYPES = ['bug', 'suggestion', 'compliment'] as const;
type FeedbackType = (typeof VALID_TYPES)[number];

// 인메모리 rate limiter (IP당 분당 3회)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 3;
const WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();

  // 만료 엔트리 정리 (Map 크기 1000 초과 시)
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

// Discord @everyone/@here 인젝션 방지
const sanitize = (s: string) => s.replace(/@(everyone|here)/gi, '@\u200B$1');

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'too many requests' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });

  const { type, message, page } = body;
  if (!VALID_TYPES.includes(type))
    return NextResponse.json({ error: 'invalid type' }, { status: 400 });
  if (typeof message !== 'string' || message.length < MIN_MSG || message.length > MAX_MSG)
    return NextResponse.json({ error: 'message out of range' }, { status: 400 });
  if (page !== undefined && (typeof page !== 'string' || page.length > 200))
    return NextResponse.json({ error: 'invalid page' }, { status: 400 });

  const emoji = { bug: '🐛', suggestion: '💡', compliment: '🎉' }[type as FeedbackType];
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (webhookUrl) {
    const kst = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `${emoji} **베타 피드백**\n유형: ${type}\n페이지: ${sanitize(page ?? '알 수 없음')}\n메시지: ${sanitize(message)}\n시각: ${kst}`,
      }),
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
