import type { QuizResult } from '@/types/quiz';
import type { DailyHistoryEntry } from '@/types/study';

export interface SubjectStats {
  subject: string;
  total: number;
  correct: number;
  rate: number;
}

export interface ChapterStats {
  subject: string;
  chapter: string;
  total: number;
  correct: number;
  rate: number;
}

export interface DailyVolume {
  date: string;
  count: number;
  correct: number;
}

function validEntry(r: QuizResult): boolean {
  return r.subject !== '' && r.chapter !== '';
}

function accuracy(correct: number, total: number): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100);
}

function toDateString(ts: number): string {
  const d = new Date(ts);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function computeOverallAccuracy(
  history: QuizResult[],
): { total: number; correct: number; rate: number } {
  const valid = history.filter(validEntry);
  const correct = valid.filter((r) => r.isCorrect).length;
  return { total: valid.length, correct, rate: accuracy(correct, valid.length) };
}

export function computeSubjectStats(history: QuizResult[]): SubjectStats[] {
  const valid = history.filter(validEntry);
  const map = new Map<string, { total: number; correct: number }>();

  for (const r of valid) {
    const prev = map.get(r.subject) ?? { total: 0, correct: 0 };
    map.set(r.subject, {
      total: prev.total + 1,
      correct: prev.correct + (r.isCorrect ? 1 : 0),
    });
  }

  return Array.from(map.entries())
    .map(([subject, s]) => ({
      subject,
      total: s.total,
      correct: s.correct,
      rate: accuracy(s.correct, s.total),
    }))
    .sort((a, b) => a.rate - b.rate);
}

export function computeChapterStats(history: QuizResult[]): ChapterStats[] {
  const valid = history.filter(validEntry);
  const map = new Map<string, { subject: string; chapter: string; total: number; correct: number }>();

  for (const r of valid) {
    const key = `${r.subject}::${r.chapter}`;
    const prev = map.get(key) ?? { subject: r.subject, chapter: r.chapter, total: 0, correct: 0 };
    map.set(key, {
      subject: r.subject,
      chapter: r.chapter,
      total: prev.total + 1,
      correct: prev.correct + (r.isCorrect ? 1 : 0),
    });
  }

  return Array.from(map.values()).map((s) => ({
    subject: s.subject,
    chapter: s.chapter,
    total: s.total,
    correct: s.correct,
    rate: accuracy(s.correct, s.total),
  }));
}

export function computeDailyVolume(history: QuizResult[], days: number): DailyVolume[] {
  const now = new Date();
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    dates.push(toDateString(d.getTime()));
  }

  const valid = history.filter(validEntry);
  const map = new Map<string, { count: number; correct: number }>();
  for (const r of valid) {
    const date = toDateString(r.timestamp);
    const prev = map.get(date) ?? { count: 0, correct: 0 };
    map.set(date, {
      count: prev.count + 1,
      correct: prev.correct + (r.isCorrect ? 1 : 0),
    });
  }

  return dates.map((date) => ({
    date,
    count: map.get(date)?.count ?? 0,
    correct: map.get(date)?.correct ?? 0,
  }));
}

export function identifyWeakAreas(
  stats: SubjectStats[],
  threshold: number = 60,
): SubjectStats[] {
  return stats.filter((s) => s.rate < threshold);
}

export function computeTrend(
  history: QuizResult[],
  periodDays: number = 7,
): 'improving' | 'declining' | 'stable' {
  const valid = history.filter(validEntry);
  const now = Date.now();
  const msPerDay = 86_400_000;
  const recentCutoff = now - periodDays * msPerDay;
  const previousCutoff = now - periodDays * 2 * msPerDay;

  const recent = valid.filter((r) => r.timestamp >= recentCutoff);
  const previous = valid.filter(
    (r) => r.timestamp >= previousCutoff && r.timestamp < recentCutoff,
  );

  const recentRate = accuracy(
    recent.filter((r) => r.isCorrect).length,
    recent.length,
  );
  const previousRate = accuracy(
    previous.filter((r) => r.isCorrect).length,
    previous.length,
  );

  const diff = recentRate - previousRate;
  if (diff > 5) return 'improving';
  if (diff < -5) return 'declining';
  return 'stable';
}

export function computeStudyDays(
  dailyHistory: DailyHistoryEntry[],
): { totalDays: number; recentDays: number } {
  const studyDates = dailyHistory
    .filter((e) => e.questionsAttempted > 0)
    .map((e) => e.date)
    .sort();

  const totalDays = studyDates.length;

  if (totalDays === 0) {
    return { totalDays: 0, recentDays: 0 };
  }

  const today = toDateString(Date.now());
  const dateSet = new Set(studyDates);

  let recentDays = 0;
  let current = today;

  while (dateSet.has(current)) {
    recentDays++;
    const d = new Date(current + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    current = toDateString(d.getTime());
  }

  return { totalDays, recentDays };
}
