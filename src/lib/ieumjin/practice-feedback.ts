import type { PracticeQuestion, PracticeRubricItem } from './term-lens';

export type PracticeFeedbackLevel = 'needs-source' | 'partial' | 'ready';

export type PracticeFeedback = {
  score: number;
  maxScore: number;
  level: PracticeFeedbackLevel;
  matchedItems: PracticeRubricItem[];
  missingItems: PracticeRubricItem[];
  strengths: string[];
  nextAction: string;
};

export type ReviewReservation = {
  id: string;
  termId: string;
  promptId: string;
  delayDays: number;
  score: number;
  maxScore: number;
  createdAt: string;
  reviewAt: string;
};

function normalizeAnswer(answer: string): string {
  return answer.replace(/\s+/g, '').toLocaleLowerCase('ko-KR');
}

function matchesKeywordGroup(normalizedAnswer: string, group: string[]): boolean {
  return group.some((keyword) =>
    normalizedAnswer.includes(keyword.replace(/\s+/g, '').toLocaleLowerCase('ko-KR')),
  );
}

function matchesRubricItem(answer: string, item: PracticeRubricItem): boolean {
  const normalizedAnswer = normalizeAnswer(answer);
  return item.keywordGroups.every((group) => matchesKeywordGroup(normalizedAnswer, group));
}

function feedbackLevel(score: number, maxScore: number): PracticeFeedbackLevel {
  const ratio = maxScore === 0 ? 0 : score / maxScore;
  if (ratio >= 0.75) return 'ready';
  if (ratio >= 0.5) return 'partial';
  return 'needs-source';
}

export function evaluatePracticeAnswer({
  answer,
  question,
}: {
  answer: string;
  question: PracticeQuestion;
}): PracticeFeedback {
  const trimmedAnswer = answer.trim();
  const matchedItems = question.rubric.filter((item) => matchesRubricItem(trimmedAnswer, item));
  const missingItems = question.rubric.filter((item) => !matchedItems.includes(item));
  const score = matchedItems.reduce((sum, item) => sum + item.points, 0);
  const maxScore = question.rubric.reduce((sum, item) => sum + item.points, 0);
  const firstMissing = missingItems[0];

  return {
    score,
    maxScore,
    level: feedbackLevel(score, maxScore),
    matchedItems,
    missingItems,
    strengths: matchedItems.map((item) => item.feedback),
    nextAction: firstMissing
      ? `${firstMissing.label} 보완: ${firstMissing.repairPrompt}`
      : '동형문제로 넘어가 같은 구조를 다른 사례에 적용하세요.',
  };
}

export function buildReviewReservation({
  termId,
  promptId,
  delayDays,
  score,
  maxScore,
  now = new Date(),
}: {
  termId: string;
  promptId: string;
  delayDays: number;
  score: number;
  maxScore: number;
  now?: Date;
}): ReviewReservation {
  const reviewAt = new Date(now);
  reviewAt.setUTCDate(reviewAt.getUTCDate() + delayDays);

  return {
    id: `${termId}:${promptId}:${reviewAt.toISOString()}`,
    termId,
    promptId,
    delayDays,
    score,
    maxScore,
    createdAt: now.toISOString(),
    reviewAt: reviewAt.toISOString(),
  };
}
