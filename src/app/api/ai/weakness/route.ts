import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ analysis: null, error: 'AI 미설정' });
  }

  const { weakChapters } = await request.json() as { weakChapters: Array<{ chapter: string; subject: string; wrongCount: number }> };

  if (!weakChapters || weakChapters.length === 0) {
    return NextResponse.json({ analysis: '오답 데이터가 없습니다.' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const chapterList = weakChapters
    .slice(0, 10)
    .map(c => `- ${c.subject} > ${c.chapter}: ${c.wrongCount}회 오답`)
    .join('\n');

  const prompt = `당신은 특수교육학 임용시험 전문 학습 코치입니다.
학습자의 오답 현황입니다:

${chapterList}

다음 형식으로 분석해주세요 (한국어, 4~6문장):
1. 가장 취약한 영역과 그 이유 (이론적 배경)
2. 오늘 당장 복습해야 할 최우선 챕터 1~2개
3. 효과적인 학습 전략 1가지 (구체적으로)`;

  try {
    const result = await model.generateContent(prompt);
    return NextResponse.json({ analysis: result.response.text() });
  } catch {
    return NextResponse.json({ analysis: null, error: 'AI 분석 실패' }, { status: 500 });
  }
}
