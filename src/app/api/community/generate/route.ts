import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createClient } from '@/lib/supabase/server';
import { communityGenerateLimiter } from '@/lib/rate-limit';

const ALLOWED_TYPES = ['multiple', 'ox', 'fill_in', 'descriptive'] as const;

interface GenerateInput {
  subject_id: string;
  subject_title?: string;
  chapter_title?: string;
  question_type: (typeof ALLOWED_TYPES)[number];
}

type QuestionDraft = { question_text: string; options: string[] | null; correct_answer: string; explanation: string };

const TYPE_LABELS: Record<string, string> = {
  multiple: '객관식 (4지선다)',
  ox: 'OX 퀴즈',
  fill_in: '빈칸 채우기',
  descriptive: '서술형',
};

function buildPrompt(questionType: string, subjectTitle: string, chapterTitle: string | null): string {
  const optionsInstruction = questionType === 'multiple'
    ? '\n- "options": 정확히 4개의 선택지 배열 (정답 포함)'
    : '';
  const answerInstruction = questionType === 'ox'
    ? '"O" 또는 "X"'
    : questionType === 'multiple'
      ? '"1", "2", "3", "4" 중 하나 (정답 번호)'
      : '정답 텍스트';

  return `당신은 특수교육학 임용시험 문제 출제 전문가입니다.
다음 조건에 맞는 문제를 1개 생성하세요.

조건:
- 과목: ${subjectTitle}${chapterTitle ? ` > ${chapterTitle}` : ''}
- 유형: ${TYPE_LABELS[questionType] ?? questionType}
- 난이도: 임용시험 수준 (2015 개정 또는 2022 개정 교육과정 기반)
- 실제 법령, 이론, 학자명을 정확히 인용하세요

JSON 형식으로만 응답하세요 (마크다운 코드블록 없이):
{
  "question_text": "문제 본문"${optionsInstruction},
  "correct_answer": ${answerInstruction},
  "explanation": "2~3문장 해설 (관련 법령이나 이론 근거 포함)"
}`;
}

async function callGemini(apiKey: string, prompt: string): Promise<QuestionDraft> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

  return {
    question_text: String(parsed.question_text ?? ''),
    options: Array.isArray(parsed.options) ? parsed.options.map(String) : null,
    correct_answer: String(parsed.correct_answer ?? ''),
    explanation: String(parsed.explanation ?? ''),
  };
}

const MOCK_QUESTIONS: Record<string, QuestionDraft> = {
  multiple: {
    question_text: '통합교육 환경에서 특수교육대상학생의 사회적 통합을 위해 가장 적절한 교수 전략은?',
    options: ['또래 교수', '직접 교수', '개별화 교수', '강의식 교수'],
    correct_answer: '1',
    explanation: '또래 교수는 일반학생과 특수교육대상학생 간의 자연스러운 상호작용을 촉진하여 사회적 통합에 효과적입니다.',
  },
  ox: {
    question_text: '개별화교육계획(IEP)은 특수교육대상학생으로 선정된 후 30일 이내에 작성해야 한다.',
    options: null,
    correct_answer: 'O',
    explanation: '장애인 등에 대한 특수교육법 제22조에 따르면, IEP는 매 학년 시작일부터 30일 이내에 작성되어야 합니다.',
  },
  fill_in: {
    question_text: '장애인 등에 대한 특수교육법에서 정의하는 특수교육 관련서비스에는 상담지원, 가족지원, 치료지원, 보조인력지원, ( )지원, 통학지원, 정보접근지원 등이 있다.',
    options: null,
    correct_answer: '보조공학기기',
    explanation: '특수교육법 제2조 제2호에 명시된 특수교육 관련서비스 항목입니다.',
  },
  descriptive: {
    question_text: '통합교육의 정의를 서술하고, 성공적인 통합교육을 위한 조건 3가지를 설명하시오.',
    options: null,
    correct_answer: '통합교육이란 특수교육대상자가 일반학교에서 장애유형·정도에 따라 차별을 받지 아니하고 또래와 함께 개개인의 교육적 요구에 적합한 교육을 받는 것을 말한다. 성공 조건: (1) 물리적 통합, (2) 교수적 통합 (교육과정 수정·조정), (3) 사회적 통합 (또래 관계).',
    explanation: '특수교육법 제2조 제6호 정의 및 통합교육 3요소 이론에 기반합니다.',
  },
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  if (!communityGenerateLimiter(user.id).allowed) {
    return NextResponse.json({ error: '잠시 후 다시 시도해주세요. (1분에 5회 제한)' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
  }

  const input = body as Record<string, unknown>;
  const questionType = String(input.question_type ?? '');
  const subjectTitle = String(input.subject_title ?? '특수교육학').slice(0, 100);
  const chapterTitle = input.chapter_title ? String(input.chapter_title).slice(0, 100) : null;

  if (!ALLOWED_TYPES.includes(questionType as GenerateInput['question_type'])) {
    return NextResponse.json({ error: '유효하지 않은 문제 유형입니다.' }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const mock = MOCK_QUESTIONS[questionType] ?? MOCK_QUESTIONS.multiple;
    return NextResponse.json({ ...mock, mock: true });
  }

  try {
    const prompt = buildPrompt(questionType, subjectTitle, chapterTitle);
    const draft = await callGemini(apiKey, prompt);
    return NextResponse.json({ ...draft, mock: false });
  } catch (err) {
    Sentry.captureException(err);
    const mock = MOCK_QUESTIONS[questionType] ?? MOCK_QUESTIONS.multiple;
    return NextResponse.json({
      ...mock,
      mock: true,
      error: err instanceof Error ? err.message : 'AI 생성 오류',
    });
  }
}
