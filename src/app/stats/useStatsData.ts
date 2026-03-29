'use client';

import { useMemo } from 'react';
import { useQuizStore } from '@/stores/useQuizStore';
import { useStudyStore } from '@/stores/useStudyStore';
import {
  computeOverallAccuracy,
  computeSubjectStats,
  computeChapterStats,
  computeDailyVolume,
  identifyWeakAreas,
  computeTrend,
  computeStudyDays,
  computeWrongNoteSummary,
  computeWeeklySummary,
  computeWeeklyTrend,
  computeHeatmapData,
} from '@/lib/study/stats-utils';

export function useStatsData() {
  const quizHistory = useQuizStore((s) => s.quizHistory);
  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const currentStreak = useStudyStore((s) => s.currentStreak);
  const longestStreak = useStudyStore((s) => s.longestStreak);
  const totalXP = useStudyStore((s) => s.totalXP);
  const dailyHistory = useStudyStore((s) => s.dailyHistory);

  const overall = useMemo(
    () => computeOverallAccuracy(quizHistory),
    [quizHistory],
  );

  const subjectStats = useMemo(
    () => computeSubjectStats(quizHistory),
    [quizHistory],
  );

  const chapterStats = useMemo(
    () => computeChapterStats(quizHistory),
    [quizHistory],
  );

  const volume7 = useMemo(
    () => computeDailyVolume(quizHistory, 7),
    [quizHistory],
  );

  const volume30 = useMemo(
    () => computeDailyVolume(quizHistory, 30),
    [quizHistory],
  );

  const weakAreas = useMemo(
    () => identifyWeakAreas(subjectStats),
    [subjectStats],
  );

  const trend = useMemo(
    () => computeTrend(quizHistory),
    [quizHistory],
  );

  const studyDays = useMemo(
    () => computeStudyDays(dailyHistory),
    [dailyHistory],
  );

  const wrongNoteSummary = useMemo(
    () => computeWrongNoteSummary(wrongNotes),
    [wrongNotes],
  );

  const weeklySummary = useMemo(
    () => computeWeeklySummary(quizHistory),
    [quizHistory],
  );

  const weeklyTrend = useMemo(
    () => computeWeeklyTrend(quizHistory, 8),
    [quizHistory],
  );

  const heatmap = useMemo(
    () => computeHeatmapData(quizHistory, 12),
    [quizHistory],
  );

  const totalStudyTimeMinutes = useMemo(
    () => dailyHistory.reduce((sum, d) => sum + (d.studyTimeMinutes ?? 0), 0),
    [dailyHistory],
  );

  return {
    quizHistory,
    overall,
    subjectStats,
    chapterStats,
    volume7,
    volume30,
    weakAreas,
    trend,
    studyDays,
    wrongNoteSummary,
    weeklySummary,
    weeklyTrend,
    heatmap,
    currentStreak,
    longestStreak,
    totalXP,
    totalStudyTimeMinutes,
  };
}
