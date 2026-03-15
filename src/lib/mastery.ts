/**
 * Mastery Tree & Pass Simulation Engine
 *
 * Calculates per-chapter mastery levels and simulates pass probability
 * based on quiz history, wrong notes, and exam structure weights.
 */

import type { QuizResult } from '@/types/quiz';
import type { WrongNote } from '@/types/study';
import examStructure from '@/data/exam-structure.json';

// ─── Mastery Levels ─────────────────────────────────────────────────────────

export type MasteryLevel = 'not_started' | 'learning' | 'practicing' | 'proficient' | 'mastered';

export interface MasteryInfo {
  readonly level: MasteryLevel;
  readonly label: string;
  readonly emoji: string;
  readonly color: string;
}

const MASTERY_INFO: Record<MasteryLevel, Omit<MasteryInfo, 'level'>> = {
  not_started: { label: '미학습', emoji: '⬜', color: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400' },
  learning: { label: '학습 중', emoji: '🟡', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  practicing: { label: '연습 중', emoji: '🟠', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
  proficient: { label: '숙달', emoji: '🟢', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  mastered: { label: '마스터', emoji: '🏆', color: 'bg-primary/10 text-primary' },
};

export function getMasteryInfo(level: MasteryLevel): MasteryInfo {
  return { level, ...MASTERY_INFO[level] };
}

// ─── Chapter Mastery Calculation ────────────────────────────────────────────

export interface ChapterMastery {
  readonly subject: string;
  readonly chapter: string;
  readonly level: MasteryLevel;
  readonly accuracy: number; // 0~1
  readonly totalAttempts: number;
  readonly correctCount: number;
  readonly wrongNoteCount: number;
}

export interface SubjectMastery {
  readonly subject: string;
  readonly chapters: readonly ChapterMastery[];
  readonly overallAccuracy: number;
  readonly masteredCount: number;
  readonly totalChapters: number;
  readonly weight: number;
  readonly coverage: number; // 0~1: chapters attempted / total
}

function determineMasteryLevel(accuracy: number, attempts: number): MasteryLevel {
  if (attempts === 0) return 'not_started';
  if (attempts < 3) return 'learning';
  if (accuracy < 0.5) return 'learning';
  if (accuracy < 0.7) return 'practicing';
  if (accuracy < 0.9) return 'proficient';
  return 'mastered';
}

export function calculateChapterMasteries(
  quizHistory: readonly QuizResult[],
  wrongNotes: readonly WrongNote[],
): ChapterMastery[] {
  const chapterStats = new Map<string, { subject: string; correct: number; total: number }>();

  for (const result of quizHistory) {
    const key = `${result.subject}::${result.chapter}`;
    const existing = chapterStats.get(key) ?? { subject: result.subject, correct: 0, total: 0 };
    chapterStats.set(key, {
      subject: existing.subject,
      correct: existing.correct + (result.isCorrect ? 1 : 0),
      total: existing.total + 1,
    });
  }

  const wrongNotesByChapter = new Map<string, number>();
  for (const note of wrongNotes) {
    if (note.mastered) continue;
    const key = `${note.question.subject}::${note.question.chapter}`;
    wrongNotesByChapter.set(key, (wrongNotesByChapter.get(key) ?? 0) + 1);
  }

  const allKeys = new Set([...Array.from(chapterStats.keys()), ...Array.from(wrongNotesByChapter.keys())]);
  const results: ChapterMastery[] = [];

  for (const key of Array.from(allKeys)) {
    const [subject, chapter] = key.split('::');
    const stats = chapterStats.get(key) ?? { subject, correct: 0, total: 0 };
    const accuracy = stats.total > 0 ? stats.correct / stats.total : 0;
    const wrongCount = wrongNotesByChapter.get(key) ?? 0;

    results.push({
      subject,
      chapter,
      level: determineMasteryLevel(accuracy, stats.total),
      accuracy,
      totalAttempts: stats.total,
      correctCount: stats.correct,
      wrongNoteCount: wrongCount,
    });
  }

  return results;
}

// ─── Subject Mastery ────────────────────────────────────────────────────────

const subjectWeights = examStructure.subjectWeights as Record<
  string,
  { title: string; weight: number; category: string; priority: string }
>;

export function calculateSubjectMasteries(
  chapterMasteries: readonly ChapterMastery[],
  allChaptersBySubject: Readonly<Record<string, readonly string[]>>,
): SubjectMastery[] {
  const subjects = Object.keys(subjectWeights);

  return subjects.map((subject) => {
    const chapters = chapterMasteries.filter((c) => c.subject === subject);
    const totalChapters = allChaptersBySubject[subject]?.length ?? Math.max(chapters.length, 1);
    const attempted = chapters.filter((c) => c.totalAttempts > 0);

    const totalCorrect = chapters.reduce((sum, c) => sum + c.correctCount, 0);
    const totalAttempts = chapters.reduce((sum, c) => sum + c.totalAttempts, 0);
    const overallAccuracy = totalAttempts > 0 ? totalCorrect / totalAttempts : 0;
    const masteredCount = chapters.filter((c) => c.level === 'mastered' || c.level === 'proficient').length;

    return {
      subject,
      chapters,
      overallAccuracy,
      masteredCount,
      totalChapters,
      weight: subjectWeights[subject]?.weight ?? 5,
      coverage: attempted.length / totalChapters,
    };
  });
}

// ─── Pass Simulation ────────────────────────────────────────────────────────

export interface PassSimulation {
  readonly estimatedScore: number; // 0~100
  readonly passingScore: number;
  readonly passRate: number; // 0~1 probability
  readonly subjectScores: readonly {
    readonly subject: string;
    readonly score: number;
    readonly maxScore: number;
  }[];
  readonly strengths: readonly string[];
  readonly weaknesses: readonly string[];
}

const TOTAL_EXAM_POINTS = 80; // 전공A 40 + 전공B 40
const PASSING_SCORE_ESTIMATE = 56; // ~70% (approximate cutoff)

export function simulatePass(subjectMasteries: readonly SubjectMastery[]): PassSimulation {
  const totalWeight = subjectMasteries.reduce((sum, s) => sum + s.weight, 0);

  const subjectScores = subjectMasteries.map((s) => {
    // Score = accuracy × coverage × weight proportion
    // Coverage penalizes not having attempted all chapters
    const effectiveAccuracy = s.overallAccuracy * Math.min(s.coverage * 1.2, 1);
    const maxScore = (s.weight / totalWeight) * TOTAL_EXAM_POINTS;
    const score = effectiveAccuracy * maxScore;

    return {
      subject: s.subject,
      score: Math.round(score * 10) / 10,
      maxScore: Math.round(maxScore * 10) / 10,
    };
  });

  const estimatedScore = Math.round(subjectScores.reduce((sum, s) => sum + s.score, 0) * 10) / 10;

  // Pass probability (sigmoid-like function centered at passing score)
  const diff = estimatedScore - PASSING_SCORE_ESTIMATE;
  const passRate = Math.min(1, Math.max(0, 1 / (1 + Math.exp(-diff / 5))));

  // Identify strengths and weaknesses
  const sorted = [...subjectScores].sort((a, b) => (b.score / b.maxScore) - (a.score / a.maxScore));
  const strengths = sorted
    .filter((s) => s.maxScore > 0 && s.score / s.maxScore >= 0.7)
    .slice(0, 3)
    .map((s) => s.subject);
  const weaknesses = sorted
    .filter((s) => s.maxScore > 0 && s.score / s.maxScore < 0.5)
    .reverse()
    .slice(0, 3)
    .map((s) => s.subject);

  return {
    estimatedScore,
    passingScore: PASSING_SCORE_ESTIMATE,
    passRate: Math.round(passRate * 100) / 100,
    subjectScores,
    strengths,
    weaknesses,
  };
}
