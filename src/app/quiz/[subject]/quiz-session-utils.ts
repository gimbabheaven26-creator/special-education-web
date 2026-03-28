import type { QuizQuestion } from '@/types/quiz';
import type { DiagnosticSession } from '@/stores/useQuizStore';
import { getKSTTimeslot } from '@/lib/timeslot';
import { shuffle } from '@/lib/array-utils';
import { sortByAdaptiveDifficulty } from '@/lib/adaptive-difficulty';
import type { SessionConfig } from './SessionSetup';

// ─── Constants ───────────────────────────────────────────────────────────────

export const REVIEW_MIX_RATIO = 0.7;
export const DIAGNOSTIC_CORRECT_MS = 2000;
export const DIAGNOSTIC_WRONG_MS = 4000;

// ─── Session Builder ─────────────────────────────────────────────────────────

/** Generate a unique diagnostic session ID based on today's KST date */
export function generateDiagnosticSessionId(
  sessions: DiagnosticSession[]
): { id: string; label: string } {
  const { date } = getKSTTimeslot();
  const todayCount = sessions.filter(s => s.id.startsWith(`diag-${date}`)).length;
  const n = todayCount + 1;
  const [, m, d] = date.split('-');
  return {
    id: `diag-${date}-${n}`,
    label: `${Number(m)}월 ${Number(d)}일-${n}`,
  };
}

/** Build session questions based on preset configuration */
export function buildSession(
  allQuestions: QuizQuestion[],
  reviewQuestions: QuizQuestion[],
  quizHistory: Array<{ questionId: string; isCorrect: boolean; chapter: string }>,
  config: SessionConfig,
  leitnerDueIds?: ReadonlySet<string>,
): QuizQuestion[] {
  const { preset, questionCount, chapters, difficulty } = config;

  // Filter by chapter
  let pool = chapters.length > 0
    ? allQuestions.filter((q) => chapters.includes(q.chapter))
    : allQuestions;

  // Filter by difficulty
  if (difficulty === 'adaptive') {
    pool = sortByAdaptiveDifficulty(pool, quizHistory);
  } else if (difficulty !== 'all') {
    const diffMap: Record<string, number[]> = {
      basic: [1],
      intermediate: [2],
      advanced: [3],
    };
    const levels = diffMap[difficulty] ?? [];
    const filtered = pool.filter((q) => levels.includes(q.difficulty ?? 2));
    if (filtered.length > 0) pool = filtered;
  }

  if (preset === 'review') {
    const reviewMax = Math.ceil(questionCount * REVIEW_MIX_RATIO);
    const reviewIds = new Set(reviewQuestions.map((q) => q.id));
    const leitnerDueQuestions = leitnerDueIds
      ? pool.filter((q) => leitnerDueIds.has(q.id) && !reviewIds.has(q.id))
      : [];
    const mergedReviewPool = [...reviewQuestions, ...leitnerDueQuestions];
    const reviewPool = shuffle(mergedReviewPool).slice(0, reviewMax);
    const selectedIds = new Set(reviewPool.map((q) => q.id));
    const freshPool = pool.filter((q) => !selectedIds.has(q.id));
    const freshPick = shuffle(freshPool).slice(0, questionCount - reviewPool.length);
    return shuffle([...reviewPool, ...freshPick]);
  }

  if (preset === 'weak') {
    const chapterAccuracy: Record<string, { correct: number; total: number }> = {};
    for (const r of quizHistory) {
      if (!chapterAccuracy[r.chapter]) chapterAccuracy[r.chapter] = { correct: 0, total: 0 };
      chapterAccuracy[r.chapter].total++;
      if (r.isCorrect) chapterAccuracy[r.chapter].correct++;
    }
    const weakChapters = new Set(
      Object.entries(chapterAccuracy)
        .filter(([, stats]) => stats.total >= 3 && stats.correct / stats.total < 0.6)
        .map(([ch]) => ch)
    );

    if (weakChapters.size > 0) {
      const weakPool = pool.filter((q) => weakChapters.has(q.chapter));
      if (weakPool.length >= questionCount) {
        return shuffle(weakPool).slice(0, questionCount);
      }
      const rest = pool.filter((q) => !weakChapters.has(q.chapter));
      return shuffle([...weakPool, ...shuffle(rest).slice(0, questionCount - weakPool.length)]);
    }
    return shuffle(pool).slice(0, questionCount);
  }

  // 'new': 아직 안 푼 문제 우선
  const answeredIds = new Set(quizHistory.map((r) => r.questionId));
  const newPool = pool.filter((q) => !answeredIds.has(q.id));
  if (newPool.length >= questionCount) {
    return shuffle(newPool).slice(0, questionCount);
  }
  const oldPool = pool.filter((q) => answeredIds.has(q.id));
  return shuffle([...newPool, ...shuffle(oldPool).slice(0, questionCount - newPool.length)]);
}

// ─── Navigation Utility ──────────────────────────────────────────────────────

export function findNextUnanswered(
  currentIndex: number,
  total: number,
  answeredIndices: Set<number>,
  skippedIndices: ReadonlySet<number>
): number {
  for (let i = currentIndex + 1; i < total; i++) {
    if (!answeredIndices.has(i) && !skippedIndices.has(i)) return i;
  }
  for (let i = 0; i < currentIndex; i++) {
    if (!answeredIndices.has(i) && !skippedIndices.has(i)) return i;
  }
  return -1;
}
