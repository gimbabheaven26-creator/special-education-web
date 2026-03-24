import { NextRequest, NextResponse } from 'next/server';

const MAX_MSG = 500;
const MIN_MSG = 5;
const VALID_TYPES = ['bug', 'suggestion', 'compliment'] as const;
type FeedbackType = (typeof VALID_TYPES)[number];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'invalid JSON' }, { status: 400 });

  const { type, message, page } = body;
  if (!VALID_TYPES.includes(type))
    return NextResponse.json({ error: 'invalid type' }, { status: 400 });
  if (typeof message !== 'string' || message.length < MIN_MSG || message.length > MAX_MSG)
    return NextResponse.json({ error: 'message out of range' }, { status: 400 });

  const emoji = { bug: '🐛', suggestion: '💡', compliment: '🎉' }[type as FeedbackType];
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (webhookUrl) {
    const kst = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `${emoji} **베타 피드백**\n유형: ${type}\n페이지: ${page ?? '알 수 없음'}\n메시지: ${message}\n시각: ${kst}`,
      }),
    }).catch((e) => console.warn('Discord webhook failed:', e));
  } else {
    console.warn('[BetaFeedback] DISCORD_WEBHOOK_URL not set — Discord 알림 생략');
  }

  return NextResponse.json({ success: true });
}
