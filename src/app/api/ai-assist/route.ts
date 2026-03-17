import { NextResponse } from 'next/server';

const MOCK_SUGGESTIONS = [
  '문제 본문이 명확합니다. 선택지 간 난이도 차이를 고려해보세요.',
  '정답과 오답지의 길이가 비슷한지 확인해보세요 (길이 단서 방지).',
  '해설에 관련 법령이나 이론적 근거를 추가하면 학습에 도움이 됩니다.',
  '문제가 특수교육 현장과 관련이 높습니다. 좋은 문제입니다!',
  '빈칸 답이 너무 짧으면 단어 암기 문제가 됩니다. 개념 설명 형태를 고려해보세요.',
];

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    // TODO: Gemini Flash 실제 연동
    // const suggestion = await callGeminiFlash(apiKey, body);
    // return NextResponse.json({ suggestion });
    void body; // 미사용 경고 방지
  }

  // Mock 응답 (키 없거나 미구현)
  const suggestion = MOCK_SUGGESTIONS[Math.floor(Math.random() * MOCK_SUGGESTIONS.length)];
  return NextResponse.json({ suggestion, mock: !apiKey });
}
