import type { QuizQuestion } from '@/types/quiz';

interface QuizHistoryEntry {
  questionId: string;
  isCorrect: boolean;
  chapter: string;
  subject?: string;
}

export type Proficiency = 'beginner' | 'developing' | 'proficient' | 'mastered';

export interface ProficiencyInfo {
  level: Proficiency;
  label: string;
  accuracy: number;
  totalAttempts: number;
  color: string;
  recommendedDifficulty: 1 | 2 | 3;
}

const PROFICIENCY_CONFIG: Record<Proficiency, { label: string; color: string; recommendedDifficulty: 1 | 2 | 3 }> = {
  beginner: { label: '입문', color: 'text-red-500', recommendedDifficulty: 1 },
  developing: { label: '발전 중', color: 'text-amber-500', recommendedDifficulty: 1 },
  proficient: { label: '숙련', color: 'text-blue-500', recommendedDifficulty: 2 },
  mastered: { label: '마스터', color: 'text-green-500', recommendedDifficulty: 3 },
};

function toProficiency(accuracy: number, totalAttempts: number): Proficiency {
  if (totalAttempts < 3) return 'beginner';
  if (accuracy < 0.5) return 'beginner';
  if (accuracy < 0.7) return 'developing';
  if (accuracy < 0.9) return 'proficient';
  return 'mastered';
}

/**
 * Compute proficiency for a specific chapter.
 */
export function getChapterProficiency(
  chapter: string,
  quizHistory: QuizHistoryEntry[],
): ProficiencyInfo {
  const chapterResults = quizHistory.filter((r) => r.chapter === chapter);
  const totalAttempts = chapterResults.length;
  const correct = chapterResults.filter((r) => r.isCorrect).length;
  const accuracy = totalAttempts > 0 ? correct / totalAttempts : 0;
  const level = toProficiency(accuracy, totalAttempts);
  const config = PROFICIENCY_CONFIG[level];

  return {
    level,
    accuracy,
    totalAttempts,
    ...config,
  };
}

/**
 * Compute proficiency for a specific subject.
 */
export function getSubjectProficiency(
  subject: string,
  quizHistory: QuizHistoryEntry[],
): ProficiencyInfo {
  const subjectResults = quizHistory.filter((r) => r.subject === subject);
  const totalAttempts = subjectResults.length;
  const correct = subjectResults.filter((r) => r.isCorrect).length;
  const accuracy = totalAttempts > 0 ? correct / totalAttempts : 0;
  const level = toProficiency(accuracy, totalAttempts);
  const config = PROFICIENCY_CONFIG[level];

  return {
    level,
    accuracy,
    totalAttempts,
    ...config,
  };
}

/**
 * Filter and sort questions by recommended difficulty based on proficiency.
 * Returns questions ordered: recommended difficulty first, then others.
 */
export function sortByAdaptiveDifficulty(
  questions: QuizQuestion[],
  quizHistory: QuizHistoryEntry[],
): QuizQuestion[] {
  // Group by chapter and compute proficiency
  const chapterProfMap = new Map<string, ProficiencyInfo>();

  for (const q of questions) {
    if (!chapterProfMap.has(q.chapter)) {
      chapterProfMap.set(q.chapter, getChapterProficiency(q.chapter, quizHistory));
    }
  }

  // Score each question: 0 = perfect match, higher = less ideal
  return [...questions].sort((a, b) => {
    const profA = chapterProfMap.get(a.chapter);
    const profB = chapterProfMap.get(b.chapter);
    const recA = profA?.recommendedDifficulty ?? 1;
    const recB = profB?.recommendedDifficulty ?? 1;
    const diffA = Math.abs(a.difficulty - recA);
    const diffB = Math.abs(b.difficulty - recB);
    return diffA - diffB;
  });
}

export function getProficiencyLabel(level: Proficiency): string {
  return PROFICIENCY_CONFIG[level].label;
}

export function getProficiencyColor(level: Proficiency): string {
  return PROFICIENCY_CONFIG[level].color;
}
