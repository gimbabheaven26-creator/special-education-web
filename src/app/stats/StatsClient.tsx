'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStatsData } from './useStatsData';
import { WrongNoteAI } from '@/components/WrongNoteAI';
import OverallAccuracy from './OverallAccuracy';
import SubjectAccuracyBars from './SubjectAccuracyBars';
import StudyVolumeChart from './StudyVolumeChart';
import WeakAreas from './WeakAreas';
import StreakHistory from './StreakHistory';
import WrongNoteSummary from './WrongNoteSummary';
import WeeklySummary from './WeeklySummary';
import WeeklyTrendChart from './WeeklyTrendChart';
import DailyHeatmap from './DailyHeatmap';
import FlashcardStats from './FlashcardStats';
import LevelProgress from './LevelProgress';
import StudyMilestones from './StudyMilestones';

interface StatsClientProps {
  readonly subjectTitleMap: Readonly<Record<string, string>>;
  readonly chapterTitleMap: Readonly<Record<string, string>>;
  readonly tabBar?: React.ReactNode;
}

export default function StatsClient({ subjectTitleMap, chapterTitleMap, tabBar }: StatsClientProps) {
  const {
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
  } = useStatsData();

  const weakChaptersForAI = useMemo(
    () =>
      chapterStats
        .filter((c) => c.rate < 60 && c.total >= 3)
        .sort((a, b) => a.rate - b.rate)
        .slice(0, 10)
        .map((c) => ({
          chapter: chapterTitleMap[`${c.subject}::${c.chapter}`] || c.chapter,
          subject: subjectTitleMap[c.subject] || c.subject,
          wrongCount: c.total - c.correct,
        })),
    [chapterStats, subjectTitleMap, chapterTitleMap],
  );

  const defaultTabBar = (
    <div className="flex border-b border-border">
      <span className="px-4 py-2.5 text-sm font-semibold border-b-2 border-primary text-primary">학습통계</span>
      <Link href="/mastery" className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent">마스터리</Link>
    </div>
  );
  const renderedTabBar = tabBar ?? defaultTabBar;

  if (quizHistory.length === 0) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">학습 통계</h1>
          <p className="text-muted-foreground text-sm">
            퀴즈를 풀면 학습 통계를 확인할 수 있어요.
          </p>
        </div>
        {renderedTabBar}
        <EmptyState
          icon="📊"
          title="아직 학습 기록이 없어요"
          description="퀴즈를 풀어보면 여기에 통계가 표시됩니다."
          action={{ label: '퀴즈 시작하기', href: '/quiz', ariaLabel: '퀴즈 페이지로 이동' }}
        />
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
      {renderedTabBar}

      {/* Overall Accuracy */}
      <OverallAccuracy
        rate={overall.rate}
        total={overall.total}
        correct={overall.correct}
      />

      {/* Level Progress */}
      <LevelProgress totalXP={totalXP} />

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
        {totalStudyTimeMinutes > 0 && (
          <Badge variant="secondary" className="text-sm px-3 py-1.5">
            {totalStudyTimeMinutes >= 60
              ? `${Math.floor(totalStudyTimeMinutes / 60)}시간 ${totalStudyTimeMinutes % 60}분`
              : `${totalStudyTimeMinutes}분`} 학습
          </Badge>
        )}
      </div>

      {/* Study Milestones */}
      <StudyMilestones
        totalQuestions={overall.total}
        currentStreak={currentStreak}
        subjectCount={subjectStats.length}
      />

      {/* Weekly Summary */}
      <WeeklySummary summary={weeklySummary} />

      {/* Daily Activity Heatmap */}
      <DailyHeatmap days={heatmap.days} maxCount={heatmap.maxCount} totalWeeks={heatmap.totalWeeks} />

      {/* Subject Accuracy Bars */}
      <SubjectAccuracyBars
        subjectStats={subjectStats}
        chapterStats={chapterStats}
        subjectTitleMap={subjectTitleMap}
        chapterTitleMap={chapterTitleMap}
      />

      {/* Study Volume Chart */}
      <StudyVolumeChart volume7={volume7} volume30={volume30} />

      {/* Weekly Trend Chart */}
      <WeeklyTrendChart data={weeklyTrend} />

      {/* Weak Areas */}
      <WeakAreas weakAreas={weakAreas} chapterStats={chapterStats} subjectTitleMap={subjectTitleMap} chapterTitleMap={chapterTitleMap} />

      {/* AI 약점 분석 */}
      <WrongNoteAI weakChapters={weakChaptersForAI} />

      {/* Wrong Note Summary */}
      <WrongNoteSummary summary={wrongNoteSummary} subjectTitleMap={subjectTitleMap} />

      {/* Flashcard Stats */}
      <FlashcardStats />

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
