import type { QuizResult } from '@/types/quiz';
import type { WrongNote } from '@/types/study';

export type ErrorPattern = 'confusion' | 'careless' | 'conceptual_gap' | 'lucky_correct';

export interface ErrorPatternInfo {
  pattern: ErrorPattern;
  label: string;
  description: string;
  color: string;
}

const PATTERN_INFO: Record<ErrorPattern, Omit<ErrorPatternInfo, 'pattern'>> = {
  confusion: {
    label: '혼동 반복',
    description: '같은 문제를 반복해서 틀리고 있어요',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  },
  careless: {
    label: '부주의',
    description: '이전에 맞췄는데 이번에 틀렸어요',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  },
  conceptual_gap: {
    label: '개념 부족',
    description: '이 챕터 정답률이 낮아요',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  },
  lucky_correct: {
    label: '찍어서 맞춤',
    description: '불확실했지만 우연히 맞춘 문제예요',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
};

export function getPatternInfo(pattern: ErrorPattern): ErrorPatternInfo {
  return { pattern, ...PATTERN_INFO[pattern] };
}

/**
 * Detect error patterns for a wrong note based on quiz history.
 * Returns all applicable patterns sorted by relevance.
 */
export function detectErrorPatterns(
  note: WrongNote,
  quizHistory: QuizResult[],
): ErrorPattern[] {
  const patterns: ErrorPattern[] = [];
  const questionId = note.questionId;

  // 1. Confusion: same question wrong 3+ times
  if (note.attempts >= 3 && !note.mastered) {
    patterns.push('confusion');
  }

  // 2. Careless: previously got it right, now wrong
  const questionHistory = quizHistory.filter((r) => r.questionId === questionId);
  const hasCorrectBefore = questionHistory.some((r) => r.isCorrect);
  const lastResult = questionHistory[questionHistory.length - 1];
  if (hasCorrectBefore && lastResult && !lastResult.isCorrect) {
    patterns.push('careless');
  }

  // 3. Conceptual gap: chapter accuracy below 50%
  const chapter = quizHistory.find((r) => r.questionId === questionId)?.chapter;
  const chapterResults = chapter ? quizHistory.filter((r) => r.chapter === chapter) : [];
  if (chapterResults.length >= 3) {
    const correctCount = chapterResults.filter((r) => r.isCorrect).length;
    const accuracy = correctCount / chapterResults.length;
    if (accuracy < 0.5) {
      patterns.push('conceptual_gap');
    }
  }

  // 4. Lucky correct: answered correctly but with low confidence
  const luckyCount = questionHistory.filter(
    (r) => r.isCorrect && r.confidence === 'unsure',
  ).length;
  if (luckyCount >= 1) {
    patterns.push('lucky_correct');
  }

  return patterns;
}
