import { getAvailableExams, getExam } from './kice';

export interface KiceCounts {
  bySubject: Record<string, number>;
  byChapter: Record<string, number>;
}

/**
 * Aggregate KICE question counts by subject and chapter.
 * Server-only (uses fs via kice.ts).
 */
export function getKiceCounts(): KiceCounts {
  const bySubject: Record<string, number> = {};
  const byChapter: Record<string, number> = {};

  const entries = getAvailableExams().filter(
    (e) => !e.isIsomorphic && !e.isPredicted,
  );

  for (const entry of entries) {
    const exam = getExam(entry.year, entry.session);
    if (!exam) continue;

    for (const q of exam.questions) {
      for (const s of q.subjects ?? []) {
        bySubject[s] = (bySubject[s] || 0) + 1;
      }
      for (const c of q.chapters ?? []) {
        byChapter[c] = (byChapter[c] || 0) + 1;
      }
    }
  }

  return { bySubject, byChapter };
}
