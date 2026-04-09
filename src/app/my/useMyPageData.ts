'use client';

import { useMemo } from 'react';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { useShallow } from 'zustand/react/shallow';
import { getLevel, getLevelProgress, getLevelName, LEVEL_NAMES } from '@/lib/study/xp-constants';
import {
  computeSubjectStats,
  identifyWeakAreas,
  computeOverallAccuracy,
  computeTrend,
  computeDailyVolume,
  computeSubjectWeeklySummary,
  detectWeakToStrong,
} from '@/lib/study/stats-utils';

export interface Recommendation {
  type: 'flashcard' | 'weak' | 'wrong' | 'daily' | 'continue';
  label: string;
  href: string;
  emoji: string;
}

export function useMyPageData() {
  const { totalXP, currentStreak, dailyProgress, recentActivities } = useStudyStore();
  const quizHistory = useQuizStore((s) => s.quizHistory);
  const wrongNotes = useQuizStore((s) => s.wrongNotes);
  const leitnerStats = useLeitnerStore(useShallow((s) => s.getStats()));

  const level = useMemo(() => {
    const lv = getLevel(totalXP);
    const progress = getLevelProgress(totalXP);
    const { name, emoji } = getLevelName(lv);
    const nextEntry = LEVEL_NAMES.find((e) => e.minLevel > lv);
    return { level: lv, name, emoji, progress, nextName: nextEntry ? `${nextEntry.emoji} ${nextEntry.name}` : null };
  }, [totalXP]);

  const weeklyActivity = useMemo(() => {
    return computeDailyVolume(quizHistory, 7);
  }, [quizHistory]);

  const weakness = useMemo(() => {
    const subjectStats = computeSubjectStats(quizHistory);
    const weakAreas = identifyWeakAreas(subjectStats, 60);
    const overall = computeOverallAccuracy(quizHistory);
    const trend = quizHistory.length >= 5 ? computeTrend(quizHistory) : null;
    return { subjectStats, weakAreas: weakAreas.slice(0, 3), overall, trend };
  }, [quizHistory]);

  const subjectWeekly = useMemo(
    () => computeSubjectWeeklySummary(quizHistory),
    [quizHistory],
  );

  const weakToStrong = useMemo(
    () => detectWeakToStrong(quizHistory),
    [quizHistory],
  );

  const unmasteredCount = useMemo(
    () => wrongNotes.filter((n) => !n.mastered).length,
    [wrongNotes],
  );

  const recommendations = useMemo(() => {
    const items: Recommendation[] = [];
    const todayQuizzes = dailyProgress.quizzesCompleted ?? 0;

    if (todayQuizzes === 0) {
      items.push({ type: 'daily', label: '오늘의 퀴즈 아직 안 풀었어요', href: '/today', emoji: '📝' });
    }
    if (leitnerStats.dueToday > 0) {
      items.push({ type: 'flashcard', label: `플래시카드 ${leitnerStats.dueToday}장 복습 대기`, href: '/flashcards/review', emoji: '🃏' });
    }
    if (weakness.weakAreas.length > 0) {
      const w = weakness.weakAreas[0];
      items.push({ type: 'weak', label: `${w.subject} 정답률 ${w.rate}% — 복습 추천`, href: `/quiz/${w.subject}`, emoji: '💡' });
    }
    if (unmasteredCount > 0) {
      items.push({ type: 'wrong', label: `오답 ${unmasteredCount}개 아직 미해결`, href: '/wrong-notes', emoji: '📋' });
    }
    if (recentActivities.length > 0) {
      const last = recentActivities[0];
      items.push({ type: 'continue', label: `${last.subjectTitle} 이어서 학습`, href: `/concepts/${last.subjectTitle}`, emoji: '📖' });
    }

    return items.slice(0, 3);
  }, [dailyProgress, leitnerStats, weakness, unmasteredCount, recentActivities]);

  return { level, weeklyActivity, weakness, unmasteredCount, recommendations, currentStreak, subjectWeekly, weakToStrong };
}
