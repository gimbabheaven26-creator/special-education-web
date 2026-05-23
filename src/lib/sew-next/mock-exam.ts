import type { QuizQuestion } from '@/types/quiz';
import type { PracticeQuestion, PracticeSession } from '@/lib/sew-next/prototype-data';
import { quizQuestionToPracticeQuestion } from '@/lib/sew-next/qbank';

export interface MockExamAnswer {
  questionId: string;
  correct: boolean;
  selectedChoiceId?: string | null;
}

export interface MockExamDomainRow {
  domain: string;
  total: number;
  correct: number;
  rate: number;
  recommendation: string;
}

export interface MockExamReport {
  total: number;
  correct: number;
  rate: number;
  trapCount: number;
  timeLabel: string;
  weakestDomain: string;
  nextAction: string;
  domainRows: MockExamDomainRow[];
}

export const mockExamFollowUpQuestion: PracticeQuestion = {
  id: 'next-mock-abc-02',
  stem: '모의고사에서 ABC 기록의 후속결과를 빠르게 찾는 기준은 무엇인가?',
  domain: '정서행동장애',
  blueprint: 'ABC 기록, 기능평가, 시간 압박 상황 판단',
  difficulty: '중',
  examSignal: '시간 제한 상황에서는 A-B-C를 먼저 분리해야 함정 선지를 줄일 수 있습니다.',
  choices: [
    {
      id: 'after-response',
      label: '행동 직후 따라오는 반응이나 환경 변화',
      correct: true,
      rationale: '후속결과는 행동 뒤에 발생해 행동 유지 가능성에 영향을 줍니다.',
    },
    {
      id: 'before-event',
      label: '행동 전에 이미 존재한 선행사건',
      correct: false,
      rationale: '행동 전 단서는 선행사건이며 후속결과가 아닙니다.',
    },
    {
      id: 'behavior-form',
      label: '문제행동의 형태와 강도',
      correct: false,
      rationale: '행동 형태는 B에 해당하므로 후속결과와 분리해야 합니다.',
    },
  ],
  explanation: {
    verdict: '정답입니다',
    coreRule: '후속결과는 행동 직후 나타나 그 행동의 반복 가능성에 영향을 주는 반응입니다.',
    trap: '시간 압박에서는 선행사건과 행동 형태를 후속결과로 착각하기 쉽습니다.',
    connect: 'IEP 근거 판단과 ABC 기록을 모두 “근거 먼저 확인” 루틴으로 묶으세요.',
    nextReview: '모의고사 종료 후 재검토',
  },
  aiCoach: {
    title: 'AI Answer Coach',
    prompt: '후속결과를 찾는 순서를 10초 안에 말하듯 정리해 보세요.',
    rewrite: '행동 직후 반응을 찾고, 그 반응이 행동을 유지시키는지 확인한다.',
  },
};

function hasMockChoices(question: QuizQuestion): boolean {
  return Array.isArray(question.options) && question.options.length >= 2;
}

function formatLimit(seconds: number): string {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes}분`;
}

function getQuestions(session: PracticeSession): PracticeQuestion[] {
  return [session.question, ...(session.followUpQuestions ?? [])];
}

function getDomainRecommendation(rate: number): string {
  if (rate < 60) return '즉시 보강';
  if (rate < 80) return '추가 점검';
  return '유지 복습';
}

function buildNextAction(domain: string): string {
  return `${domain} 2문항을 바로 이어서 풀고, 오답 선지 근거를 한 문장으로 압축하세요.`;
}

function getBalancedMockQuestions(quizzes: QuizQuestion[], questionCount: number): PracticeQuestion[] {
  const grouped = new Map<string, PracticeQuestion[]>();

  for (const quiz of [...quizzes].filter(hasMockChoices).sort((a, b) => String(a.id).localeCompare(String(b.id), 'ko'))) {
    const question = quizQuestionToPracticeQuestion(quiz);
    const group = grouped.get(question.domain) ?? [];
    group.push(question);
    grouped.set(question.domain, group);
  }

  const selected: PracticeQuestion[] = [];
  const domains = Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, 'ko'));

  while (selected.length < questionCount && domains.some((domain) => (grouped.get(domain)?.length ?? 0) > 0)) {
    for (const domain of domains) {
      if (selected.length >= questionCount) break;
      const next = grouped.get(domain)?.shift();
      if (next) selected.push(next);
    }
  }

  return selected;
}

export function buildMockExamSession({
  fallback,
  questionCount = 6,
  quizzes,
  timeLimitSeconds = 720,
}: {
  fallback: PracticeSession;
  questionCount?: number;
  quizzes: QuizQuestion[];
  timeLimitSeconds?: number;
}): PracticeSession {
  const fallbackQuestions = getQuestions(fallback);
  const selected = getBalancedMockQuestions(quizzes, questionCount);
  const seen = new Set(selected.map((question) => question.id));
  const mixedQuestions = [
    ...selected,
    ...fallbackQuestions.filter((question) => !seen.has(question.id)),
  ].slice(0, questionCount);
  const questions = mixedQuestions.length > 0 ? mixedQuestions : fallbackQuestions;
  const actualCount = selected.length;
  const examBlueprint = Array.from(
    questions.reduce((map, question) => {
      map.set(question.domain, (map.get(question.domain) ?? 0) + 1);
      return map;
    }, new Map<string, number>()),
    ([domain, count]) => ({ domain, count }),
  );

  return {
    ...fallback,
    subtitle: actualCount > 0
      ? `실제 DB 문제은행에서 전범위 ${questions.length}문항을 균형 편성했습니다.`
      : fallback.subtitle,
    focus: '전범위 미니 모의고사',
    queue: [
      `제한시간 ${formatLimit(timeLimitSeconds)}`,
      `전범위 ${questions.length}문항`,
      '영역별 리포트',
    ],
    question: questions[0],
    followUpQuestions: questions.slice(1),
    timeLimitSeconds,
    examBlueprint,
  };
}

export function buildMockExamReport({
  answers,
  elapsedSeconds,
  questions,
  timeLimitSeconds,
}: {
  answers: readonly MockExamAnswer[];
  elapsedSeconds: number;
  questions: readonly PracticeQuestion[];
  timeLimitSeconds: number;
}): MockExamReport {
  const total = questions.length;
  const correct = answers.filter((answer) => answer.correct).length;
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0;
  const answerByQuestionId = new Map(answers.map((answer) => [answer.questionId, answer]));
  const domainMap = new Map<string, { total: number; correct: number }>();

  for (const question of questions) {
    const answer = answerByQuestionId.get(question.id);
    const current = domainMap.get(question.domain) ?? { total: 0, correct: 0 };
    domainMap.set(question.domain, {
      total: current.total + 1,
      correct: current.correct + (answer?.correct ? 1 : 0),
    });
  }

  const trapCount = answers.filter((answer) => {
    if (answer.correct || answer.selectedChoiceId == null) return false;
    const question = questions.find((item) => item.id === answer.questionId);
    const choice = question?.choices.find((item) => item.id === answer.selectedChoiceId);
    return choice != null && !choice.correct;
  }).length;

  const timeRatio = timeLimitSeconds > 0 ? elapsedSeconds / timeLimitSeconds : 0;
  const timeLabel = timeRatio <= 0.8
    ? '시간 관리 안정'
    : timeRatio <= 1
      ? '시간 압박 주의'
      : '제한시간 초과';

  const domainRows = Array.from(domainMap.entries()).map(([domain, row]) => {
    const rateForDomain = row.total > 0 ? Math.round((row.correct / row.total) * 100) : 0;
    return {
      domain,
      total: row.total,
      correct: row.correct,
      rate: rateForDomain,
      recommendation: getDomainRecommendation(rateForDomain),
    };
  });
  const weakestDomain = [...domainRows].sort((a, b) => {
    if (a.rate !== b.rate) return a.rate - b.rate;
    return b.total - a.total;
  })[0]?.domain ?? '전범위';

  return {
    total,
    correct,
    rate,
    trapCount,
    timeLabel,
    weakestDomain,
    nextAction: buildNextAction(weakestDomain),
    domainRows,
  };
}
