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
} from '@/lib/stats-utils';
import { Badge } from '@/components/ui/badge';
import OverallAccuracy from './OverallAccuracy';
import SubjectAccuracyBars from './SubjectAccuracyBars';
import StudyVolumeChart from './StudyVolumeChart';
import WeakAreas from './WeakAreas';
import StreakHistory from './StreakHistory';
import WrongNoteSummary from './WrongNoteSummary';
import WeeklySummary from './WeeklySummary';

interface StatsClientProps {
  readonly subjectTitleMap: Readonly<Record<string, string>>;
  readonly chapterTitleMap: Readonly<Record<string, string>>;
}

export default function StatsClient({ subjectTitleMap, chapterTitleMap }: StatsClientProps) {
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

  if (quizHistory.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">학습 통계</h1>
          <p className="text-muted-foreground text-sm">
            퀴즈를 풀면 학습 통계를 확인할 수 있어요.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-4xl mb-4">📊</p>
          <p className="text-lg font-medium text-muted-foreground">
            아직 학습 기록이 없어요
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            퀴즈를 풀어보면 여기에 통계가 표시됩니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">학습 통계</h1>
        <p className="text-muted-foreground text-sm">
          나의 학습 현황을 한눈에 확인하세요.
        </p>
      </div>

      {/* Overall Accuracy */}
      <OverallAccuracy
        rate={overall.rate}
        total={overall.total}
        correct={overall.correct}
      />

      {/* Quick Stats Row */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Badge variant="secondary" className="text-sm px-3 py-1.5">
          총 {overall.total}문제
        </Badge>
        <Badge variant="secondary" className="text-sm px-3 py-1.5">
          연속 {currentStreak}일
        </Badge>
        <Badge variant="secondary" className="text-sm px-3 py-1.5">
          {totalXP.toLocaleString()} XP
        </Badge>
      </div>

      {/* Weekly Summary */}
      <WeeklySummary summary={weeklySummary} />

      {/* Subject Accuracy Bars */}
      <SubjectAccuracyBars
        subjectStats={subjectStats}
        chapterStats={chapterStats}
        subjectTitleMap={subjectTitleMap}
        chapterTitleMap={chapterTitleMap}
      />

      {/* Study Volume Chart */}
      <StudyVolumeChart volume7={volume7} volume30={volume30} />

      {/* Weak Areas */}
      <WeakAreas weakAreas={weakAreas} chapterStats={chapterStats} subjectTitleMap={subjectTitleMap} chapterTitleMap={chapterTitleMap} />

      {/* Wrong Note Summary */}
      <WrongNoteSummary summary={wrongNoteSummary} subjectTitleMap={subjectTitleMap} />

      {/* Streak & Trend */}
      <StreakHistory
        currentStreak={currentStreak}
        longestStreak={longestStreak}
        totalXP={totalXP}
        trend={trend}
        totalStudyDays={studyDays.totalDays}
      />
    </main>
  );
}
