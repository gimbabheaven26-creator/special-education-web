/**
 * 퀴즈 → 플래시카드 변환 엔진
 *
 * OX + fill_in 퀴즈를 LeitnerCard 형태로 변환한다.
 * - OX: 150자 초과 폐기, front = question, back = "O"/"X" + explanation
 * - fill_in: front = question(빈칸 포함), back = answer
 */

import type { QuizQuestion } from '@/types/quiz';
import type { LeitnerCard } from '@/stores/useLeitnerStore';

const OX_MAX_LENGTH = 150;

export interface ConvertResult {
  card: Omit<LeitnerCard, 'box' | 'lastReviewed' | 'nextReview' | 'createdAt'>;
  skipped: false;
}

export interface SkipResult {
  skipped: true;
  reason: string;
}

export type ConversionResult = ConvertResult | SkipResult;

/**
 * 단일 퀴즈 → 플래시카드 변환.
 * 변환 불가 시 { skipped: true, reason } 반환.
 */
export function convertQuizToCard(quiz: QuizQuestion): ConversionResult {
  if (quiz.type !== 'ox' && quiz.type !== 'fill_in') {
    return { skipped: true, reason: `지원하지 않는 유형: ${quiz.type}` };
  }

  if (quiz.type === 'ox' && quiz.question.length > OX_MAX_LENGTH) {
    return { skipped: true, reason: `OX 문제 ${quiz.question.length}자 > ${OX_MAX_LENGTH}자 제한` };
  }

  const source = quiz.type === 'ox' ? 'quiz-ox' as const : 'quiz-fill_in' as const;

  const answer = quiz.type === 'ox'
    ? formatOXAnswer(String(quiz.answer), quiz.explanation)
    : formatFillInAnswer(String(quiz.answer), quiz.explanation);

  return {
    skipped: false,
    card: {
      id: `fc-${quiz.id}`,
      subjectSlug: quiz.subject,
      chapterSlug: quiz.chapter,
      quizId: quiz.id,
      quizType: quiz.type,
      question: quiz.question,
      answer,
      source,
    },
  };
}

function formatOXAnswer(answer: string, explanation: string): string {
  const oxLabel = answer.toUpperCase() === 'O' ? 'O (맞다)' : 'X (틀리다)';
  if (!explanation) return oxLabel;
  const shortExplanation = explanation.length > 200
    ? explanation.slice(0, 197) + '...'
    : explanation;
  return `${oxLabel}\n\n${shortExplanation}`;
}

function formatFillInAnswer(answer: string, explanation: string): string {
  if (!explanation) return answer;
  const shortExplanation = explanation.length > 200
    ? explanation.slice(0, 197) + '...'
    : explanation;
  return `${answer}\n\n${shortExplanation}`;
}

/**
 * 퀴즈 배열 → 플래시카드 일괄 변환.
 * 이미 존재하는 quizId는 제외.
 */
export function convertQuizBatch(
  quizzes: QuizQuestion[],
  existingQuizIds: Set<string>,
): { cards: ConvertResult['card'][]; skipped: { quiz: QuizQuestion; reason: string }[] } {
  const cards: ConvertResult['card'][] = [];
  const skipped: { quiz: QuizQuestion; reason: string }[] = [];

  for (const quiz of quizzes) {
    if (existingQuizIds.has(quiz.id)) {
      skipped.push({ quiz, reason: '이미 추가됨' });
      continue;
    }

    const result = convertQuizToCard(quiz);
    if (result.skipped) {
      skipped.push({ quiz, reason: result.reason });
    } else {
      cards.push(result.card);
    }
  }

  return { cards, skipped };
}

/**
 * 플래시카드 대상 퀴즈만 필터 (OX + fill_in, OX 150자 이하).
 * UI에서 미리보기 목록용.
 */
export function filterFlashcardEligible(quizzes: QuizQuestion[]): QuizQuestion[] {
  return quizzes.filter((q) => {
    if (q.type !== 'ox' && q.type !== 'fill_in') return false;
    if (q.type === 'ox' && q.question.length > OX_MAX_LENGTH) return false;
    return true;
  });
}
