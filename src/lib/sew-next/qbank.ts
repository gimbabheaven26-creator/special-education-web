import type { QuizQuestion } from '@/types/quiz';
import type {
  PracticeModeId,
  PracticeQuestion,
  PracticeSession,
} from '@/lib/sew-next/prototype-data';
import { practiceSessions } from '@/lib/sew-next/prototype-data';
import { getSubjectDisplayName } from '@/lib/study/display-labels';

export type QbankDomain = '특수교육공학' | '정서행동장애' | '지적장애' | '관련 법령' | '의사소통장애';
export type QbankDifficulty = '하' | '중' | '상';
export type QbankFormat = '사례형' | '절차 배열' | '용어 구분';

export interface QbankFilters {
  domain: QbankDomain;
  difficulty: QbankDifficulty;
  format: QbankFormat;
}

export interface QbankSnapshot {
  sourceCount: number;
  matchingCount: number;
  dataSourceLabel: 'actual DB' | 'prototype fallback';
  coverageWarning: string;
  recommendedQuestions: QuizQuestion[];
}

export const qbankDomains: QbankDomain[] = ['특수교육공학', '정서행동장애', '지적장애', '관련 법령', '의사소통장애'];
export const qbankDifficulties: QbankDifficulty[] = ['중', '상', '하'];
export const qbankFormats: QbankFormat[] = ['사례형', '절차 배열', '용어 구분'];

export const defaultQbankFilters: QbankFilters = {
  domain: '특수교육공학',
  difficulty: '중',
  format: '사례형',
};

const DOMAIN_KEYWORDS: Record<QbankDomain, string[]> = {
  특수교육공학: ['특수교육공학', '보조공학', 'assistive', 'technology', 'udl', '접근성'],
  정서행동장애: ['정서행동장애', '행동지원', 'behavior', 'pbs', 'fba', '기능평가'],
  지적장애: ['지적장애', 'intellectual', '적응행동', '지원강도'],
  '관련 법령': ['관련 법령', 'laws', 'iep', '개별화교육', '특수교육법'],
  의사소통장애: ['의사소통장애', 'communication', 'aac', '언어', '조음'],
};

const FORMAT_KEYWORDS: Record<QbankFormat, string[]> = {
  사례형: ['사례', '상황', 'case', '학생'],
  '절차 배열': ['절차', '순서', '단계', '배열', '먼저'],
  '용어 구분': ['구분', '정의', '무엇', '목적', '차이'],
};

function normalize(value: unknown): string {
  if (Array.isArray(value)) return value.map(normalize).join(' ');
  if (value == null) return '';
  return String(value).toLowerCase();
}

function buildSearchText(question: QuizQuestion): string {
  return [
    question.subject,
    getSubjectDisplayName(question.subject),
    question.chapter,
    question.type,
    question.question,
    question.caseContext,
    question.explanation,
    question.source,
    question.tags,
    question.subjects,
  ].map(normalize).join(' ');
}

function matchesDomain(question: QuizQuestion, domain: QbankDomain): boolean {
  const text = buildSearchText(question);
  return DOMAIN_KEYWORDS[domain].some((keyword) => text.includes(keyword.toLowerCase()));
}

function matchesDifficulty(question: QuizQuestion, difficulty: QbankDifficulty): boolean {
  const difficultyMap: Record<QbankDifficulty, 1 | 2 | 3> = { 하: 1, 중: 2, 상: 3 };
  return question.difficulty === difficultyMap[difficulty];
}

function matchesFormat(question: QuizQuestion, format: QbankFormat): boolean {
  if (format === '사례형' && question.caseContext) return true;
  if (format === '용어 구분' && ['ox', 'fill_in'].includes(question.type)) return true;
  const text = buildSearchText(question);
  return FORMAT_KEYWORDS[format].some((keyword) => text.includes(keyword.toLowerCase()));
}

function hasChoices(question: QuizQuestion): boolean {
  return Array.isArray(question.options) && question.options.length >= 2;
}

function getPrototypeQuestions(): QuizQuestion[] {
  return Object.values(practiceSessions).flatMap((session) =>
    [session.question, ...(session.followUpQuestions ?? [])].map(practiceQuestionToQuizQuestion)
  );
}

function practiceQuestionToQuizQuestion(question: PracticeQuestion): QuizQuestion {
  const correctIndex = question.choices.findIndex((choice) => choice.correct);
  return {
    id: question.id,
    subject: question.domain,
    chapter: question.blueprint,
    type: 'multiple',
    question: question.stem,
    options: question.choices.map((choice) => choice.label),
    answer: Math.max(correctIndex, 0),
    explanation: question.explanation.coreRule,
    difficulty: question.difficulty === '상' ? 3 : question.difficulty === '하' ? 1 : 2,
    source: 'sew-next-prototype',
  };
}

function filterQuestions(questions: QuizQuestion[], filters: QbankFilters): QuizQuestion[] {
  return questions
    .filter(hasChoices)
    .filter((question) => matchesDomain(question, filters.domain))
    .filter((question) => matchesDifficulty(question, filters.difficulty))
    .filter((question) => matchesFormat(question, filters.format));
}

function rankQuestions(questions: QuizQuestion[]): QuizQuestion[] {
  return [...questions].sort((a, b) =>
    String(a.id).localeCompare(String(b.id), 'ko')
  );
}

function chooseSource(questions: QuizQuestion[]): { source: QuizQuestion[]; sourceCount: number; fallback: boolean } {
  const usable = questions.filter(hasChoices);
  if (usable.length > 0) return { source: usable, sourceCount: questions.length, fallback: false };
  return { source: getPrototypeQuestions(), sourceCount: 0, fallback: true };
}

export function buildQbankSnapshot(questions: QuizQuestion[], filters: QbankFilters): QbankSnapshot {
  const { source, sourceCount, fallback } = chooseSource(questions);
  let matches = filterQuestions(source, filters);
  if (matches.length === 0) {
    matches = source.filter((question) => matchesDomain(question, filters.domain));
  }
  if (matches.length === 0) {
    matches = source;
  }

  const recommendedQuestions = rankQuestions(matches).slice(0, 10);
  const dataSourceLabel = fallback ? 'prototype fallback' : 'actual DB';
  const sourceLabel = fallback ? '프로토타입 안전망' : '실제 DB 문항';

  return {
    sourceCount,
    matchingCount: matches.length,
    dataSourceLabel,
    coverageWarning: `${sourceLabel} ${matches.length}개 · ${filters.domain}/${filters.difficulty}/${filters.format}`,
    recommendedQuestions,
  };
}

export function getQbankFiltersFromSearchParams(searchParams: Record<string, string | string[] | undefined>): QbankFilters {
  const domain = typeof searchParams.domain === 'string' && qbankDomains.includes(searchParams.domain as QbankDomain)
    ? searchParams.domain as QbankDomain
    : defaultQbankFilters.domain;
  const difficulty = typeof searchParams.difficulty === 'string' && qbankDifficulties.includes(searchParams.difficulty as QbankDifficulty)
    ? searchParams.difficulty as QbankDifficulty
    : defaultQbankFilters.difficulty;
  const format = typeof searchParams.format === 'string' && qbankFormats.includes(searchParams.format as QbankFormat)
    ? searchParams.format as QbankFormat
    : defaultQbankFilters.format;
  return { domain, difficulty, format };
}

export function buildQbankPracticeHref(filters: QbankFilters): string {
  const params = new URLSearchParams({
    mode: 'custom',
    domain: filters.domain,
    difficulty: filters.difficulty,
    format: filters.format,
  });
  return `/next/practice?${params.toString()}`;
}

function getCorrectChoiceIndex(question: QuizQuestion): number {
  if (typeof question.answer === 'number') return question.answer;
  const answerText = String(question.answer).trim();
  const index = question.options?.findIndex((option) => option.trim() === answerText) ?? -1;
  return index >= 0 ? index : 0;
}

function quizQuestionToPracticeQuestion(question: QuizQuestion): PracticeQuestion {
  const options = question.options ?? [];
  const correctIndex = Math.min(Math.max(getCorrectChoiceIndex(question), 0), Math.max(options.length - 1, 0));
  return {
    id: question.id,
    stem: question.question,
    domain: getSubjectDisplayName(question.subject),
    blueprint: question.chapter,
    difficulty: question.difficulty === 3 ? '상' : question.difficulty === 1 ? '하' : '중',
    examSignal: question.source
      ? `${question.source} 기반 문항입니다. 선택한 필터와 기출 커버리지를 함께 점검하세요.`
      : '선택한 문제은행 필터에서 실제 문항을 불러왔습니다.',
    choices: options.map((option, index) => ({
      id: `${question.id}-${index}`,
      label: option,
      correct: index === correctIndex,
      rationale: index === correctIndex
        ? question.explanation
        : question.wrongExplanations?.[option] ?? '이 선지는 핵심 판단 기준과 어긋납니다.',
    })),
    explanation: {
      verdict: '정답입니다',
      coreRule: question.explanation,
      trap: '오답 선지는 용어, 절차, 사례 조건 중 하나를 바꾸어 판단을 흔듭니다.',
      connect: `${getSubjectDisplayName(question.subject)} · ${question.chapter}로 다시 묶어 복습하세요.`,
      nextReview: '24시간 후 재인출',
    },
    aiCoach: {
      title: 'AI Answer Coach',
      prompt: '이 문항의 정답 근거를 한 문장으로 압축해 보세요.',
      rewrite: question.explanation,
    },
  };
}

export function buildSewNextPracticeSession({
  fallback,
  filters,
  mode,
  quizzes,
}: {
  fallback: PracticeSession;
  filters: QbankFilters;
  mode: PracticeModeId;
  quizzes: QuizQuestion[];
}): PracticeSession {
  const snapshot = buildQbankSnapshot(quizzes, filters);
  const questions = snapshot.recommendedQuestions.slice(0, 3).map(quizQuestionToPracticeQuestion);
  if (questions.length === 0) return fallback;

  return {
    ...fallback,
    mode,
    subtitle: `${filters.domain}/${filters.difficulty}/${filters.format} 필터로 실제 DB 문제은행에서 ${snapshot.matchingCount}개를 추렸습니다.`,
    focus: `${filters.domain} · ${filters.difficulty} · ${filters.format}`,
    queue: [
      `${filters.domain} ${Math.min(snapshot.matchingCount, 10)}문항`,
      `${filters.difficulty} 난도 우선`,
      `${filters.format} 해설 루프`,
    ],
    question: questions[0],
    followUpQuestions: questions.slice(1),
  };
}
