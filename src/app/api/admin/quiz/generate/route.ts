import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import { verifyAdminOrApiKey } from '@/lib/db/admin-auth';

const ALLOWED_TYPES = ['multiple', 'ox', 'fill_in', 'descriptive', 'scenario_composite'] as const;

const TYPE_LABELS: Record<string, string> = {
  multiple: '객관식 (4지선다)',
  ox: 'OX 퀴즈',
  fill_in: '빈칸 채우기',
  descriptive: '서술형',
  scenario_composite: '시나리오/기출형 복합 문제',
};

const DIFFICULTY_LABELS: Record<number, string> = { 1: '기초', 2: '중급 (임용시험 수준)', 3: '심화' };

// In-memory rate limit (admin-only, 10/min)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  rateLimitMap.set(userId, { ...entry, count: entry.count + 1 });
  return true;
}

interface SubQuestionDraft {
  id: string;
  question: string;
  type: 'fill_in' | 'descriptive';
  answer: string;
  explanation?: string;
}

interface QuizDraft {
  question_text: string;
  options: string[] | null;
  correct_answer: string;
  explanation: string;
  case_context?: string;
  sub_questions?: SubQuestionDraft[];
}

function buildScenarioPrompt(
  subject: string,
  chapter: string | null,
  keyword: string | null,
  difficulty: number,
): string {
  const keywordLine = keyword ? `\n- 핵심 개념: ${keyword}` : '';

  return `당신은 특수교육학 임용시험 문제 출제 전문가입니다.
다음 조건에 맞는 시나리오/기출형 복합 문제를 생성하세요.

조건:
- 과목: ${subject}${chapter ? ` > ${chapter}` : ''}
- 유형: 시나리오 기반 복합 문제 (KICE 기출 스타일)
- 난이도: ${DIFFICULTY_LABELS[difficulty] ?? '심화'}${keywordLine}
- 실제 법령, 이론, 학자명을 정확히 인용하세요
- 사례(case_context)는 교실/학교 상황을 구체적으로 서술하세요

JSON 형식으로만 응답하세요 (마크다운 코드블록 없이):
{
  "question_text": "문제 본문 (사례를 읽고 답하시오 형태)",
  "case_context": "교실/학교 사례 지문 (200자 이상, 구체적 상황 묘사)",
  "correct_answer": "전체 정답 요약",
  "explanation": "출제 의도 및 해설",
  "sub_questions": [
    {
      "id": "sq1",
      "question": "하위 질문 1",
      "type": "fill_in 또는 descriptive",
      "answer": "정답",
      "explanation": "해설"
    }
  ]
}

하위 질문(sub_questions)은 2~4개로 구성하세요.`;
}

function buildPrompt(
  type: string,
  subject: string,
  chapter: string | null,
  keyword: string | null,
  difficulty: number,
  count: number,
): string {
  if (type === 'scenario_composite') {
    return buildScenarioPrompt(subject, chapter, keyword, difficulty);
  }

  const optionsInstruction = type === 'multiple'
    ? '\n- "options": 정확히 4개의 선택지 배열 (정답 포함)'
    : '';
  const answerInstruction = type === 'ox'
    ? '"O" 또는 "X"'
    : type === 'multiple'
      ? '"1", "2", "3", "4" 중 하나 (정답 번호)'
      : '정답 텍스트';

  const keywordLine = keyword ? `\n- 핵심 개념: ${keyword}` : '';
  const countLine = count > 1 ? `\n위 조건에 맞는 문제를 ${count}개 생성하세요. JSON 배열로 응답하세요.` : '';
  const singleFormat = `{
  "question_text": "문제 본문"${optionsInstruction},
  "correct_answer": ${answerInstruction},
  "explanation": "2~3문장 해설 (관련 법령이나 이론 근거 포함)"
}`;

  return `당신은 특수교육학 임용시험 문제 출제 전문가입니다.
다음 조건에 맞는 문제를 생성하세요.

조건:
- 과목: ${subject}${chapter ? ` > ${chapter}` : ''}
- 유형: ${TYPE_LABELS[type] ?? type}
- 난이도: ${DIFFICULTY_LABELS[difficulty] ?? '중급'}${keywordLine}
- 실제 법령, 이론, 학자명을 정확히 인용하세요

JSON 형식으로만 응답하세요 (마크다운 코드블록 없이):
${count > 1 ? `[${singleFormat}, ...]` : singleFormat}${countLine}`;
}

async function callGemini(apiKey: string, prompt: string): Promise<QuizDraft[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });
  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  const jsonStr = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
  const parsed = JSON.parse(jsonStr) as unknown;

  const items = Array.isArray(parsed) ? parsed : [parsed];
  return items.map((item: Record<string, unknown>) => {
    const draft: QuizDraft = {
      question_text: String(item.question_text ?? ''),
      options: Array.isArray(item.options) ? item.options.map(String) : null,
      correct_answer: String(item.correct_answer ?? ''),
      explanation: String(item.explanation ?? ''),
    };
    if (item.case_context) {
      draft.case_context = String(item.case_context);
    }
    if (Array.isArray(item.sub_questions)) {
      draft.sub_questions = item.sub_questions.map((sq: Record<string, unknown>, i: number) => ({
        id: String(sq.id ?? `sq${i + 1}`),
        question: String(sq.question ?? ''),
        type: (sq.type === 'descriptive' ? 'descriptive' : 'fill_in') as 'fill_in' | 'descriptive',
        answer: String(sq.answer ?? ''),
        ...(sq.explanation ? { explanation: String(sq.explanation) } : {}),
      }));
    }
    return draft;
  });
}

const MOCK_DRAFTS: Record<string, QuizDraft> = {
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
    correct_answer: '통합교육이란 특수교육대상자가 일반학교에서 장애유형·정도에 따라 차별을 받지 아니하고 또래와 함께 개개인의 교육적 요구에 적합한 교육을 받는 것을 말한다. 성공 조건: (1) 물리적 통합, (2) 교수적 통합, (3) 사회적 통합.',
    explanation: '특수교육법 제2조 제6호 정의 및 통합교육 3요소 이론에 기반합니다.',
  },
  scenario_composite: {
    question_text: '다음 사례를 읽고 물음에 답하시오.',
    options: null,
    correct_answer: '(1) 긍정적 행동지원 (2) 기능적 행동평가를 통한 선행사건 중재',
    explanation: '긍정적 행동지원(PBS)은 문제행동의 기능을 이해하고 대체행동을 교수하는 접근으로, 장애인 등에 대한 특수교육법 시행규칙에 근거합니다.',
    case_context: '초등학교 특수학급 담당 김 교사의 학급에는 자폐성장애 2급 학생 민수가 있다. 민수는 수업 중 갑자기 자리를 이탈하여 교실을 돌아다니거나, 또래 학생의 학습 자료를 빼앗는 행동을 반복한다. 김 교사는 민수의 IEP에 행동지원 목표를 포함시키고, 체계적인 중재를 계획하려 한다.',
    sub_questions: [
      { id: 'sq1', question: '민수의 문제행동에 적용할 수 있는 긍정적 행동지원 절차의 명칭을 쓰시오.', type: 'fill_in' as const, answer: '긍정적 행동지원(PBS)', explanation: '긍정적 행동지원은 문제행동의 기능 분석에 기반한 예방적·교육적 중재 체계입니다.' },
      { id: 'sq2', question: '민수의 자리 이탈 행동의 기능을 파악하기 위해 실시해야 하는 평가의 명칭을 쓰고, 그 절차를 간략히 서술하시오.', type: 'descriptive' as const, answer: '기능적 행동평가(FBA). 절차: (1) 문제행동 조작적 정의, (2) 직접 관찰 및 ABC 기록, (3) 행동의 기능 가설 설정, (4) 가설 검증.', explanation: '기능적 행동평가는 IDEA 2004에서도 요구하는 절차로, 행동의 선행사건-행동-후속결과를 분석합니다.' },
    ],
  },
};

export async function POST(request: Request) {
  try {
    const auth = await verifyAdminOrApiKey(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 401 });
    }

    if (!checkRateLimit(auth.userId ?? 'unknown')) {
      return NextResponse.json({ error: '잠시 후 다시 시도해주세요. (1분에 10회 제한)' }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: '잘못된 요청 형식입니다.' }, { status: 400 });
    }

    const input = body as Record<string, unknown>;
    const type = String(input.type ?? '');
    const subject = String(input.subject ?? '').slice(0, 100);
    const chapter = input.chapter ? String(input.chapter).slice(0, 100) : null;
    const keyword = input.keyword ? String(input.keyword).slice(0, 200) : null;
    const difficulty = Math.min(3, Math.max(1, Number(input.difficulty) || 2));
    const rawCount = Math.min(5, Math.max(1, Number(input.count) || 1));
    const count = type === 'scenario_composite' ? 1 : rawCount;

    if (!ALLOWED_TYPES.includes(type as typeof ALLOWED_TYPES[number])) {
      return NextResponse.json({ error: '유효하지 않은 문제 유형입니다.' }, { status: 400 });
    }

    if (!subject) {
      return NextResponse.json({ error: '과목을 선택해주세요.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const mock = MOCK_DRAFTS[type] ?? MOCK_DRAFTS.multiple;
      const drafts = Array.from({ length: count }, () => ({ ...mock }));
      return NextResponse.json({ drafts, mock: true });
    }

    try {
      const prompt = buildPrompt(type, subject, chapter, keyword, difficulty, count);
      const drafts = await callGemini(apiKey, prompt);
      return NextResponse.json({ drafts: drafts.slice(0, count), mock: false });
    } catch (err) {
      const mock = MOCK_DRAFTS[type] ?? MOCK_DRAFTS.multiple;
      const drafts = Array.from({ length: count }, () => ({ ...mock }));
      return NextResponse.json({
        drafts,
        mock: true,
        error: err instanceof Error ? err.message : 'AI 생성 오류',
      });
    }
  } catch {
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
