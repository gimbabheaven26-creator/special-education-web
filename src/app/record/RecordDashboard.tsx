'use client';

import Link from 'next/link';
import {
  Flame,
  Star,
  BookOpen,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react';
import { useMyPageData } from '@/app/my/useMyPageData';
import { RecentWrongTab } from '@/app/my/MySubComponents';
import { WeeklyActivityChart } from '@/app/my/WeeklyActivityChart';
import { BadgeDisplay } from '@/components/BadgeDisplay';
import { ExamCountdown } from '@/components/ExamCountdown';
import { useStudyStore } from '@/stores/useStudyStore';
import { useQuizStore } from '@/stores/useQuizStore';
import { useBookmarkStore } from '@/stores/useBookmarkStore';
import { useLeitnerStore } from '@/stores/useLeitnerStore';
import { useShallow } from 'zustand/react/shallow';
import { FlashcardReviewStats } from '@/components/dashboard/FlashcardReviewStats';
import { useMounted } from '@/hooks/useMounted';
import { EmptyState } from '@/components/ui/EmptyState';

export default function RecordDashboard() {
  const mounted = useMounted();
  const { level, weakness, unmasteredCount, recommendations, currentStreak } = useMyPageData();
  const totalXP = useStudyStore((s) => s.totalXP);
  const totalQuizzes = useStudyStore((s) => s.totalQuizzes);
  const dailyProgress = useStudyStore((s) => s.dailyProgress);
  const wrongNotesCount = useQuizStore((s) => s.wrongNotes.length);
  const bookmarkCount = useBookmarkStore((s) => s.bookmarks.length);
  const leitnerStats = useLeitnerStore(useShallow((s) => s.getStats()));

  if (!mounted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        <div className="h-24 bg-muted animate-pulse rounded-2xl" />
        <div className="h-48 bg-muted animate-pulse rounded-2xl" />
      </div>
    );
  }

  const todayQuizzes = dailyProgress.quizzesCompleted ?? 0;
  const todayCorrect = dailyProgress.quizzesCorrect ?? 0;
  const todayAccuracy = todayQuizzes > 0 ? Math.round((todayCorrect / todayQuizzes) * 100) : null;

  if (totalQuizzes === 0 && wrongNotesCount === 0) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-foreground mb-6">내 기록</h1>
        <EmptyState
          icon="📊"
          title="아직 학습 기록이 없어요"
          description="퀴즈를 풀면 여기에 진도, 정답률, 약점이 한눈에 표시됩니다."
          action={{ label: '퀴즈 시작하기', href: '/quiz/ox', ariaLabel: '퀴즈 페이지로 이동' }}
        />
      </main>
    );
  }

  const TrendIcon = weakness.trend === 'improving' ? TrendingUp : weakness.trend === 'declining' ? TrendingDown : Minus;
  const trendColor = weakness.trend === 'improving' ? 'text-green-500' : weakness.trend === 'declining' ? 'text-red-500' : 'text-muted-foreground';
  const trendLabel = weakness.trend === 'improving' ? '상승 중' : weakness.trend === 'declining' ? '하락 중' : '유지 중';

  return (
    <main className="max-w-2xl mx-auto px-4 py-8 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">내 기록</h1>
        <p className="text-xs text-muted-foreground mt-1">이 기기에서만 유지되는 학습 데이터입니다</p>
      </div>

      <ExamCountdown />

      {todayQuizzes > 0 && (
        <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
          <p className="text-xs text-muted-foreground mb-1">오늘</p>
          <div className="flex items-baseline gap-3">
            <span className="text-2xl font-bold text-primary tabular-nums">{todayQuizzes}문제</span>
            {todayAccuracy !== null && (
              <span className="text-sm text-muted-foreground">정답률 {todayAccuracy}%</span>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="h-4 w-4" />
            <span className="text-lg font-bold tabular-nums">{currentStreak}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">연속 학습</p>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-1 text-yellow-500">
            <Star className="h-4 w-4" />
            <span className="text-lg font-bold tabular-nums">{totalXP.toLocaleString()}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">총 XP</p>
        </div>
        <div className="flex flex-col items-center p-3 rounded-xl border border-border bg-card">
          <div className="flex items-center gap-1 text-primary">
            <BookOpen className="h-4 w-4" />
            <span className="text-lg font-bold tabular-nums">{totalQuizzes}</span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">총 문제</p>
        </div>
      </div>

      <WeeklyActivityChart />

      <FlashcardReviewStats />

      {weakness.overall.total > 0 && (
        <div className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card">
          <div>
            <p className="text-xs text-muted-foreground">전체 정답률</p>
            <p className="text-2xl font-bold tabular-nums">{Math.round(weakness.overall.rate * 100)}%</p>
          </div>
          <div className={`flex items-center gap-1 ${trendColor}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-xs font-medium">{trendLabel}</span>
          </div>
        </div>
      )}

      <div className="p-4 rounded-2xl border border-border bg-card space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{level.emoji}</span>
            <span className="text-sm font-semibold">{level.name}</span>
            <span className="text-xs text-muted-foreground">Lv.{level.level}</span>
          </div>
          {level.nextName && (
            <span className="text-[10px] text-muted-foreground">다음: {level.nextName}</span>
          )}
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${level.progress.percent}%` }}
          />
        </div>
      </div>

      {weakness.weakAreas.length > 0 && (
        <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
          <p className="text-xs font-semibold text-muted-foreground">보강이 필요한 과목</p>
          <div className="space-y-2">
            {weakness.weakAreas.map((area) => (
              <Link
                key={area.subject}
                href={`/quiz/${area.subject}`}
                className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">{area.subject}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-red-600 dark:text-red-400 tabular-nums">{area.rate}%</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {recommendations.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground px-1">지금 하면 좋은 것</p>
          {recommendations.map((rec) => (
            <Link
              key={rec.href}
              href={rec.href}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <span className="text-lg">{rec.emoji}</span>
              <span className="text-sm flex-1">{rec.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      )}

      <BadgeDisplay />

      <div className="grid grid-cols-3 gap-3">
        <Link href="/wrong-notes" className="flex flex-col items-center p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
          <span className="text-lg font-bold text-red-500 tabular-nums">{unmasteredCount}</span>
          <p className="text-[10px] text-muted-foreground mt-1">미해결 오답</p>
        </Link>
        <Link href={bookmarkCount > 0 ? '/bookmarks' : '/concepts'} className="flex flex-col items-center p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
          <span className="text-lg font-bold text-amber-500 tabular-nums">{bookmarkCount}</span>
          <p className="text-[10px] text-muted-foreground mt-1">북마크</p>
          <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-0.5">
            {bookmarkCount > 0 ? '퀴즈 풀기 →' : '⭐ 추가하기'}
          </p>
        </Link>
        <Link href="/flashcards" className="flex flex-col items-center p-3 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
          <span className="text-lg font-bold text-purple-500 tabular-nums">{leitnerStats.dueToday}</span>
          <p className="text-[10px] text-muted-foreground mt-1">오늘 복습</p>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm font-semibold">최근 틀린 문제</p>
        </div>
        <div className="p-4">
          <RecentWrongTab />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-6">
        <Link
          href="/mastery"
          className="flex flex-col items-center gap-1 py-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-center"
        >
          <span className="text-2xl">🌳</span>
          <span className="text-sm font-medium">과목별 숙련도</span>
          <span className="text-[10px] text-muted-foreground">마스터리 트리</span>
        </Link>
        <Link
          href="/kice"
          className="flex flex-col items-center gap-1 py-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-center"
        >
          <span className="text-2xl">📋</span>
          <span className="text-sm font-medium">출제경향</span>
          <span className="text-[10px] text-muted-foreground">연도별 기출 분석</span>
        </Link>
      </div>
    </main>
  );
}
