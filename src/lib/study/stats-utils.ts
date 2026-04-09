import type { QuizResult } from '@/types/quiz';
import type { DailyHistoryEntry, WrongNote } from '@/types/study';
import { XP_PER_QUIZ, XP_PER_CORRECT } from './xp-constants';

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
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date(ts));
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

// ─── Wrong Note Summary ──────────────────────────────────────────────────────

export interface WrongNoteSummaryData {
  total: number;
  mastered: number;
  unmastered: number;
  resolutionRate: number;
  bySubject: ReadonlyArray<{
    subject: string;
    total: number;
    mastered: number;
    unmastered: number;
  }>;
}

export function computeWrongNoteSummary(
  wrongNotes: ReadonlyArray<WrongNote>,
): WrongNoteSummaryData {
  const total = wrongNotes.length;
  const mastered = wrongNotes.filter((n) => n.mastered).length;
  const unmastered = total - mastered;
  const resolutionRate = total === 0 ? 0 : Math.round((mastered / total) * 100);

  const subjectMap = new Map<string, { total: number; mastered: number }>();
  for (const n of wrongNotes) {
    const subject = n.subject;
    const prev = subjectMap.get(subject) ?? { total: 0, mastered: 0 };
    subjectMap.set(subject, {
      total: prev.total + 1,
      mastered: prev.mastered + (n.mastered ? 1 : 0),
    });
  }

  const bySubject = Array.from(subjectMap.entries())
    .map(([subject, s]) => ({
      subject,
      total: s.total,
      mastered: s.mastered,
      unmastered: s.total - s.mastered,
    }))
    .sort((a, b) => b.unmastered - a.unmastered);

  return { total, mastered, unmastered, resolutionRate, bySubject };
}

// ─── Weekly Summary ──────────────────────────────────────────────────────────

export interface WeeklyStatsData {
  count: number;
  correct: number;
  rate: number;
  xp: number;
}

export interface WeeklySummaryData {
  thisWeek: WeeklyStatsData;
  lastWeek: WeeklyStatsData;
}

function getMondayOfWeek(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  const mondayOffset = day === 0 ? 6 : day - 1;
  return new Date(d.getTime() - mondayOffset * 86_400_000);
}

function weekStatsFromResults(results: ReadonlyArray<QuizResult>): WeeklyStatsData {
  const count = results.length;
  const correct = results.filter((r) => r.isCorrect).length;
  return {
    count,
    correct,
    rate: count === 0 ? 0 : Math.round((correct / count) * 100),
    xp: count * XP_PER_QUIZ + correct * XP_PER_CORRECT,
  };
}

export function computeWeeklySummary(
  history: ReadonlyArray<QuizResult>,
): WeeklySummaryData {
  const now = new Date();
  const thisMonday = getMondayOfWeek(now);
  const lastMonday = new Date(thisMonday.getTime() - 7 * 86_400_000);

  const thisWeekStart = thisMonday.getTime();
  const lastWeekStart = lastMonday.getTime();

  const thisWeekResults = history.filter((r) => r.timestamp >= thisWeekStart);
  const lastWeekResults = history.filter(
    (r) => r.timestamp >= lastWeekStart && r.timestamp < thisWeekStart,
  );

  return {
    thisWeek: weekStatsFromResults(thisWeekResults),
    lastWeek: weekStatsFromResults(lastWeekResults),
  };
}

// ─── Weekly Trend (past N weeks) ─────────────────────────────────────────

export interface WeeklyTrendEntry {
  weekLabel: string;   // e.g. "03/03"
  weekStart: number;   // timestamp
  count: number;
  correct: number;
  rate: number;
}

export function computeWeeklyTrend(
  history: ReadonlyArray<QuizResult>,
  weeks: number = 8,
): WeeklyTrendEntry[] {
  const now = new Date();
  const thisMonday = getMondayOfWeek(now);
  const msPerWeek = 7 * 86_400_000;

  const entries: WeeklyTrendEntry[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const weekStart = new Date(thisMonday.getTime() - i * msPerWeek);
    const weekEnd = new Date(weekStart.getTime() + msPerWeek);
    const weekResults = history.filter(
      (r) => r.timestamp >= weekStart.getTime() && r.timestamp < weekEnd.getTime(),
    );
    const correct = weekResults.filter((r) => r.isCorrect).length;
    entries.push({
      weekLabel: `${String(weekStart.getMonth() + 1).padStart(2, '0')}/${String(weekStart.getDate()).padStart(2, '0')}`,
      weekStart: weekStart.getTime(),
      count: weekResults.length,
      correct,
      rate: accuracy(correct, weekResults.length),
    });
  }

  return entries;
}

// ─── Daily Heatmap (past N weeks) ────────────────────────────────────────

export interface HeatmapDay {
  date: string;    // YYYY-MM-DD
  count: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ...6=Sat
  weekIndex: number;
}

export function computeHeatmapData(
  history: ReadonlyArray<QuizResult>,
  weeks: number = 12,
): { days: HeatmapDay[]; maxCount: number; totalWeeks: number } {
  const totalDays = weeks * 7;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Count by date
  const countMap = new Map<string, number>();
  for (const r of history) {
    const date = toDateString(r.timestamp);
    countMap.set(date, (countMap.get(date) ?? 0) + 1);
  }

  const days: HeatmapDay[] = [];
  let maxCount = 0;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today.getTime() - i * 86_400_000);
    const dateStr = toDateString(d.getTime());
    const count = countMap.get(dateStr) ?? 0;
    const dayOfWeek = d.getDay();
    const weekIndex = Math.floor((totalDays - 1 - i) / 7);

    if (count > maxCount) maxCount = count;

    days.push({ date: dateStr, count, dayOfWeek, weekIndex });
  }

  return { days, maxCount, totalWeeks: weeks };
}

// ─── Study Days ──────────────────────────────────────────────────────────────

// ─── Subject Weekly Summary (이번주 vs 지난주 과목별) ────────────────────

export interface SubjectWeeklySummaryEntry {
  subject: string;
  thisWeek: { count: number; correct: number; rate: number };
  lastWeek: { count: number; correct: number; rate: number };
  delta: number; // rate difference in percentage points
}

export function computeSubjectWeeklySummary(
  history: ReadonlyArray<QuizResult>,
): SubjectWeeklySummaryEntry[] {
  const now = new Date();
  const thisMonday = getMondayOfWeek(now);
  const lastMonday = new Date(thisMonday.getTime() - 7 * 86_400_000);
  const thisStart = thisMonday.getTime();
  const lastStart = lastMonday.getTime();

  const map = new Map<string, { tw: { c: number; t: number }; lw: { c: number; t: number } }>();

  for (const r of history.filter(validEntry)) {
    const bucket = r.timestamp >= thisStart ? 'tw' : r.timestamp >= lastStart ? 'lw' : null;
    if (!bucket) continue;
    const prev = map.get(r.subject) ?? { tw: { c: 0, t: 0 }, lw: { c: 0, t: 0 } };
    prev[bucket].t += 1;
    prev[bucket].c += r.isCorrect ? 1 : 0;
    map.set(r.subject, prev);
  }

  return Array.from(map.entries())
    .map(([subject, { tw, lw }]) => {
      const twRate = accuracy(tw.c, tw.t);
      const lwRate = accuracy(lw.c, lw.t);
      return {
        subject,
        thisWeek: { count: tw.t, correct: tw.c, rate: twRate },
        lastWeek: { count: lw.t, correct: lw.c, rate: lwRate },
        delta: twRate - lwRate,
      };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

// ─── Subject Weekly Trend (특정 과목 N주간 추이) ────────────────────────

export function computeSubjectWeeklyTrend(
  history: ReadonlyArray<QuizResult>,
  subject: string,
  weeks: number = 8,
): WeeklyTrendEntry[] {
  const filtered = history.filter((r) => validEntry(r) && r.subject === subject);
  return computeWeeklyTrend(filtered, weeks);
}

// ─── Weak → Strong Detection ────────────────────────────────────────────

export interface WeakToStrongEntry {
  subject: string;
  previousRate: number;
  currentRate: number;
}

export function detectWeakToStrong(
  history: ReadonlyArray<QuizResult>,
  periodDays: number = 30,
  threshold: number = 60,
): WeakToStrongEntry[] {
  const valid = history.filter(validEntry);
  const now = Date.now();
  const msPerDay = 86_400_000;
  const recentCutoff = now - periodDays * msPerDay;
  const previousCutoff = now - periodDays * 2 * msPerDay;

  const subjects = Array.from(new Set(valid.map((r) => r.subject)));
  const results: WeakToStrongEntry[] = [];

  for (const subject of subjects) {
    const prev = valid.filter(
      (r) => r.subject === subject && r.timestamp >= previousCutoff && r.timestamp < recentCutoff,
    );
    const recent = valid.filter(
      (r) => r.subject === subject && r.timestamp >= recentCutoff,
    );
    if (prev.length < 3 || recent.length < 3) continue;

    const prevRate = accuracy(prev.filter((r) => r.isCorrect).length, prev.length);
    const recentRate = accuracy(recent.filter((r) => r.isCorrect).length, recent.length);

    if (prevRate < threshold && recentRate >= threshold) {
      results.push({ subject, previousRate: prevRate, currentRate: recentRate });
    }
  }

  return results.sort((a, b) => (b.currentRate - b.previousRate) - (a.currentRate - a.previousRate));
}

// ─── Study Days ──────────────────────────────────────────────────────────────

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
