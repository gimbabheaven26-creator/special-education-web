import { NextRequest, NextResponse } from 'next/server';
import { feedbackLimiter, getIp } from '@/lib/rate-limit';

const MAX_MSG = 500;
const MIN_MSG = 5;
const VALID_TYPES = ['bug', 'suggestion', 'compliment'] as const;
type FeedbackType = (typeof VALID_TYPES)[number];

const sanitize = (s: string) => s.replace(/@(everyone|here)/gi, '@​$1');

export async function POST(req: NextRequest) {
  const ip = getIp(req);
  if (!feedbackLimiter(ip).allowed) {
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
